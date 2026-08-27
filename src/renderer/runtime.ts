// src/renderer/runtime.ts — the provident-ssr producing process that lives in
// the Electron renderer. It keeps the live Supervisor graph + the DOM render,
// and exposes the MCP-facing operations (synthetic dispatch, rendered-HTML
// visibility, target listing, node state) as plain methods.
//
// This is the P1 producing-process-keeps-graph pattern from the Phase B
// synthetic-event contract (docs/specs/ssr-synthetic-event.md §2.1) — the
// graph co-exists with the emitted HTML, and the host can dispatch AFTER
// rendering.
import {
  translateLegacy,
  Supervisor,
  EventBridge,
  DomAdapter,
  SSRFragmentAdapter,
  MarkdownAdapter,
  renderProducingProcess,
  focusedSliceFor,
  reverseTranslate,
  serializeSlice,
  loadState,
  createLinkHub,
  reRegisterDefPrototypes,
  reconcileParentTargets,
  dropPayload,
  emitElements,
  Node,
  type RenderOp,
  type LegacyInitialData,
  type RenderOptions,
  type SerializedRenderDoc,
  type Payload,
} from 'provident-ssr'
import type { CompiledState } from 'provident-ssr/core/types.js'
import type {
  DispatchRequest,
  DispatchResult,
  RenderedHtmlResult,
  MarkdownResult,
  ListTargetsResult,
  NodeStateResult,
  NodeInfo,
  Census,
  DispatchTarget,
  LoadResult,
  LoadPayload,
  OpResult,
  ExportResult,
  ValidateResult,
  TeardownResult,
  CodeGetResult,
  CodeSetResult,
  CodeCreateResult,
  CodeDeleteResult,
  CodeValidateResult,
  CodeLoadBatchResult,
  JournalResult,
} from '../shared/types.js'
import type { TranslatedWarning } from 'provident-ssr/core/translate.js'
import type { CapabilityRouter } from './extensions.js'

export interface RuntimeOptions {
  mount: HTMLElement
  envelope: LegacyInitialData
  /** Maximum journal entries before auto-condense (undefined = never condense).
   *  Passed to the provident-ssr Supervisor constructor. */
  maxJournalLength?: number
  /** U6 (M-r5) — an optional CapabilityRouter whose emit-only transforms are
   *  applied to the rendered fragment BEFORE both the DOM and SSR views are
   *  produced (parity). The transform NEVER touches Node/Supervisor content. */
  transformRouter?: CapabilityRouter
}

export class Runtime {
  private supervisor: Supervisor
  private readonly adapter: DomAdapter
  private ssr = new SSRFragmentAdapter()
  private readonly mount: HTMLElement
  private rootNode: Node
  private nodes: Node[]
  private readonly prevStates = new Map<string, CompiledState[]>()
  private domPrevMap: Map<string, unknown> | null = null
  private ssrPrevMap: Map<string, unknown> | null = null
  private bootstrapped = false
  private readonly maxJournalLength: number | undefined
  private readonly transformRouter: CapabilityRouter | null
  /** The opt-in data-node-id (REQ-GAP-3/A2 + REQ-GAP-8): every emitted element
   *  carries its engine nodeId in BOTH views so an MCP agent reading the
   *  rendered HTML can trace each element back to its producing graph node. */
  private readonly renderOptions: RenderOptions = { nodeIdAttribute: true }
  /** A5 — the authored-id index, rebuilt on every load/teardown: css.id →
   *  nodeId and props.id → nodeId. A destroyed node's id is NEVER in the
   *  index (the tombstone-shadow hazard is avoided) — resolution checks the
   *  index first, then falls back to `getNode` (nodeId/wire). */
  private cssIndex = new Map<string, string>()
  private propsIndex = new Map<string, string>()
  /** The content payloads (roots + payload metadata/userData) of the current
   *  graph — built at load, consumed by teardown's dropPayload + userData
   *  clear, so a teardown returns to a root-only graph. */
  private payloads: Payload[] = []
  /** The ENVELOPE (the code/data source of truth) the graph was last derived
   *  from — the code-CRUD surface reads/writes it (mcp-endpoint.md §4). */
  private envelope: LegacyInitialData | null = null
  /** The last translate's additive warnings channel (R10) — surfaced through
   *  load/validate/op/teardown so a CSP-eval-block or a handler-body-invalid
   *  is MCP-visible, never a silently dead page. */
  private warnings: TranslatedWarning[] = []

  constructor(opts: RuntimeOptions) {
    this.mount = opts.mount
    this.maxJournalLength = opts.maxJournalLength
    this.transformRouter = opts.transformRouter ?? null
    const translated = translateLegacy(opts.envelope)
    this.rootNode = translated.root
    this.nodes = translated.nodes
    this.supervisor = new Supervisor({ events: new EventBridge(), maxJournalLength: opts.maxJournalLength })
    for (const n of translated.nodes) this.supervisor.registerNode(n)
    this.adapter = new DomAdapter(opts.mount, { onEvent: this.handleDomEvent })
    this.payloads = this.buildPayloads(translated.content, opts.envelope.content)
    this.rebuildIdIndex()
  }

  /** Wire real DOM events (browser interaction) to the same graph dispatch
   *  the MCP synthetic path uses, then re-render. Phase A dispatch is a
   *  trigger; the public `flush()` settles the cascade (the 0.1.1 shared
   *  surface — no hand-rolled tick loop), then we drain + re-emit. */
  private handleDomEvent = (wire: string, domEvent: Event): void => {
    const node = this.supervisor.getNode(wire)
    if (!node) return
    const eventName = domEvent?.type ?? String(domEvent ?? '')
    const extra = domEvent?.target && 'value' in domEvent.target
      ? [String((domEvent.target as HTMLInputElement).value)]
      : []
    this.supervisor.dispatchEvent(node.id, eventName, ...extra)
    void this.supervisor.flush().then(() => {
      this.mergePass2()
      this.render()
    })
  }

  private setStates(actionable: CompiledState[]): void {
    const byNode = new Map<string, CompiledState[]>()
    for (const s of actionable) {
      const id = (s as unknown as { nodeId: string }).nodeId
      const arr = byNode.get(id) ?? []
      arr.push(s)
      byNode.set(id, arr)
    }
    for (const [id, arr] of byNode) {
      if (!this.supervisor.getNode(id)?.isInTree) continue
      this.prevStates.set(id, arr)
    }
  }

  private render(): { els: unknown[]; ops: RenderOp[] } {
    if (!this.bootstrapped) {
      // Placement-routed (a node with a content-role anchor) → the
      // path-enumeration pass (compilePath per node); else the default
      // root compile. (runtime-host.md §3.1 R-new — the adversarial fix.)
      if (this.isPlacementRouted()) {
        const actionable: CompiledState[] = []
        for (const n of this.nodes) actionable.push(...(n.compilePath().actionable as CompiledState[]))
        this.setStates(actionable)
        this.supervisor.recordResolved(actionable as never)
      } else {
        const cr = this.rootNode.compile(this.nodes)
        this.setStates(cr.actionable)
        this.supervisor.recordResolved(cr.actionable as never)
      }
      this.bootstrapped = true
    } else {
      this.mergePass2()
    }
    const actionable: CompiledState[] = []
    for (const states of this.prevStates.values()) actionable.push(...states)
    const byNode = new Map(this.supervisor.allNodes().map((n) => [n.id, n]))
    // Prune prevStates entries whose node was destroyed AND evicted from the
    // registry (the self-evicting sweep — REQ-GAP-11): renderProducingProcess
    // keeps a state whose nodeById lookup is undefined, so a destroyed node's
    // stale state would otherwise re-emit forever. Drop it here so the render
    // reflects the live graph.
    for (const id of [...this.prevStates.keys()]) {
      if (!byNode.has(id)) this.prevStates.delete(id)
    }
    const liveActionable: CompiledState[] = []
    for (const states of this.prevStates.values()) liveActionable.push(...states)
    // The canonical re-emit loop (REQ-GAP-5/8, 0.1.2): the exported
    // renderProducingProcess with the opt-in nodeIdAttribute threaded through.
    // The caller owns each per-tree prevMap (null on first render); the loop
    // prunes destroyed/not-in-tree nodes and never drains takePass2States.
    this.adapter.beginBatch()
    const dom = renderProducingProcess(liveActionable as never, byNode as never, this.adapter, this.domPrevMap as never, this.renderOptions)
    this.adapter.endBatch()
    this.domPrevMap = dom.prevMap as unknown as Map<string, unknown>
    // Same actionable + options → identical els; the SSR adapter mirrors the
    // same element set (PAR-5 parity) through its own prevMap.
    const ssr = renderProducingProcess(liveActionable as never, byNode as never, this.ssr, this.ssrPrevMap as never, this.renderOptions)
    this.ssrPrevMap = ssr.prevMap as unknown as Map<string, unknown>
    return { els: dom.els, ops: dom.ops }
  }

  private mergePass2(): void {
    const pass2 = this.supervisor.takePass2States()
    for (const [id, arr] of pass2) {
      if (!this.supervisor.getNode(id)?.isInTree) continue
      this.prevStates.set(id, arr)
    }
  }

  /** True when any node carries a content-role anchor (placement-routed) —
   *  such a tree must bootstrap via the path-enumeration `compilePath` pass,
   *  not the default `rootNode.compile` (runtime-host.md §3.1 R-new). */
  private isPlacementRouted(): boolean {
    return this.nodes.some((n) => n.anchors.some((a) => a.role === 'content'))
  }

  /** Bootstrap render — called once after the mount is available. */
  bootstrap(): void {
    this.render()
  }

  // ---- target resolution -------------------------------------------------

  private resolveTarget(target: DispatchTarget | string): string | null {
    if (typeof target === 'string') {
      // A plain string: try nodeId, then css.id, then props.id.
      return this.resolveString(target)
    }
    if (target.kind === 'nodeId' || target.kind === 'wire') {
      const ref = target.kind === 'nodeId' ? target.nodeId : target.wire
      const n = this.supervisor.getNode(ref)
      return n && !n.destroyed && n.isInTree ? n.id : null
    }
    if (target.kind === 'cssId') {
      const n = this.nodeByCssId(target.cssId)
      return n ? n.id : null
    }
    return null
  }

  // ---- id-index (A5) ------------------------------------------------------

  private rebuildIdIndex(): void {
    this.cssIndex = new Map()
    this.propsIndex = new Map()
    for (const n of this.supervisor.allNodes()) {
      // A5/adversarial: only IN-TREE, not-destroyed nodes are addressable — a
      // destroyed/unplaced ghost must never resolve via the index (a torn-down
      // node id must NOT be targetable).
      if (n.destroyed || !n.isInTree) continue
      const cssId = (n.css as { id?: string })?.id
      if (cssId !== undefined) this.cssIndex.set(cssId, n.id)
      const propsId = (n.props as { id?: string })?.id
      if (propsId !== undefined) this.propsIndex.set(propsId, n.id)
    }
  }

  /** Wrap the per-node content roots (TranslatedTree.content or loadState's
   *  content nodes) into a Payload-like handle the teardown path can drop,
   *  carrying the translate-scoped userData for the legacy clear (R8). */
  private buildPayloads(contentNodes: Node[], userData?: unknown): Payload[] {
    return [{ id: 'p0', roots: [...contentNodes], userData }]
  }

  private resolveString(s: string): string | null {
    const direct = this.supervisor.getNode(s)
    if (direct && !direct.destroyed && direct.isInTree) return s
    const byCss = this.cssIndex.get(s) ?? this.nodeByCssId(s)?.id
    if (byCss) return byCss
    const byProps = this.propsIndex.get(s) ?? this.nodeByPropsId(s)?.id
    if (byProps) return byProps
    return null
  }

  private nodeByCssId(cssId: string): Node | undefined {
    const fromIndex = this.cssIndex.get(cssId)
    if (fromIndex !== undefined) {
      const n = this.supervisor.getNode(fromIndex)
      if (n && !n.destroyed && n.isInTree) return n
    }
    return this.supervisor
      .allNodes()
      .find((n) => !n.destroyed && n.isInTree && (n.css as { id?: string })?.id === cssId)
  }

  private nodeByPropsId(id: string): Node | undefined {
    const fromIndex = this.propsIndex.get(id)
    if (fromIndex !== undefined) {
      const n = this.supervisor.getNode(fromIndex)
      if (n && !n.destroyed && n.isInTree) return n
    }
    return this.supervisor
      .allNodes()
      .find((n) => !n.destroyed && n.isInTree && (n.props as { id?: string })?.id === id)
  }

  // ---- host capabilities (runtime-host.md §2/§3) --------------------------

  /** A2 — replace the current graph from a legacy envelope. Tears down the
   *  existing content, sets/clears the translate-scoped userData (R8), then
   *  translate → register → compile → recordResolved → render. Captures the
   *  envelope (the code-CRUD source of truth) + the translate warnings (R10). */
  loadEnvelope(envelope: LegacyInitialData, opts?: { userData?: unknown }): Census {
    this.tearDownGraph()
    const env = structuredClone(envelope)
    if (opts?.userData !== undefined) {
      // R8 — inject the userData into the envelope's FIRST content payload so
      // translate captures it into the legacy bridge's supervisor.userData.
      if (!Array.isArray(env.content)) env.content = []
      if (env.content.length === 0) env.content.push({ content: [] })
      env.content[0].userData = opts.userData
    }
    const translated = translateLegacy(env)
    this.rootNode = translated.root
    this.nodes = translated.nodes
    this.supervisor = new Supervisor({ events: new EventBridge(), maxJournalLength: this.maxJournalLength })
    for (const n of translated.nodes) this.supervisor.registerNode(n)
    this.payloads = this.buildPayloads(translated.content, translated.userData)
    this.envelope = env
    this.warnings = translated.warnings ?? []
    this.rebuildIdIndex()
    this.resetRenderState()
    this.render()
    return this.census()
  }

  /** A1 — snapshot/restore load: loadState → seeds → Node(d, hub) (template
   *  root first, content after) → reconcileParentTargets → register per node →
   *  compile → recordResolved → render. */
  loadDoc(doc: SerializedRenderDoc): Census {
    this.tearDownGraph()
    const seeds = loadState(doc)
    const hub = createLinkHub()
    const nodes = seeds.map((s) => new Node(s, hub))
    reconcileParentTargets(nodes)
    // 0.2 Feature 1a — re-register the def prototypes (the `defPrototypes`
    // census section) on the loadState hub so a rows-bearing doc re-mints
    // (the `rows-prototype-unresolved` caveat flips for round-tripped docs).
    reRegisterDefPrototypes(doc as never, hub, nodes as never)
    this.rootNode = nodes[0]
    this.nodes = nodes
    this.supervisor = new Supervisor({ events: new EventBridge(), maxJournalLength: this.maxJournalLength })
    for (const n of nodes) this.supervisor.registerNode(n)
    this.payloads = this.buildPayloads(nodes, undefined)
    this.envelope = null
    this.warnings = []
    this.rebuildIdIndex()
    this.resetRenderState()
    this.render()
    return this.census()
  }

  /** MCP `provident.load` (battery §3): dispatch to the A2/A1/A3 load paths
   *  and return the census + both render views + the translate warnings (R10).
   *  `userData` (R8) rides only the envelope path. */
  load(req: LoadPayload): LoadResult {
    let census: Census
    if (req.kind === 'envelope') {
      census = this.loadEnvelope(req.envelope as LegacyInitialData, req.userData !== undefined ? { userData: req.userData } : undefined)
    } else if (req.kind === 'doc') {
      census = this.loadDoc(req.doc as never)
    } else if (req.kind === 'commands') {
      // A3 — a command ARRAY, each applied singly (no requestIds — R7).
      const commands = req.commands ?? []
      for (const cmd of commands) this.applyCommand(cmd as never)
      census = this.census()
    } else {
      throw new Error(`unknown load kind: ${String((req as { kind?: unknown }).kind)}`)
    }
    return {
      census,
      renderedHtml: this.renderedHtml(),
      ssrHtml: this.ssrHtml(),
      warnings: this.warnings,
    }
  }

  /** A3 — a single managed-channel op: resolve the string `node` to a Node,
   *  supervisor.apply → flush() → drain takePass2States once → render. */
  applyCommand(cmd: { kind: string; node?: string; [k: string]: unknown } | null | undefined): { status: string; dirtied?: string[]; minted?: string[] } {
    // F1/F10 — a non-object command (null/undefined/primitive) is a hostile or
    // malformed op: reject cleanly, never throw.
    if (cmd === null || cmd === undefined || typeof cmd !== 'object') {
      return { status: 'rejected' }
    }
    // If the op names a string `node` that does NOT resolve, reject cleanly
    // (never throw — a raw string must not reach `source.clone()` for the
    // node-less clone-instance op). Adversarial A3 fix.
    if (typeof cmd.node === 'string' && !this.resolveTarget(cmd.node)) {
      return { status: 'rejected' }
    }
    // F1 — a NON-string, non-Node `node` value (number/object) would reach the
    // engine raw and throw (`source.clone` on the raw value); reject it.
    if (cmd.node !== undefined && typeof cmd.node !== 'string' && typeof cmd.node !== 'object') {
      return { status: 'rejected' }
    }
    // F5 — an OBJECT `node`/`source` that is not a real registered Node (a plain
    // object like `{foo:1}`) would pass the typeof gate but crash on
    // `.clone()`/`.source` in the engine. Resolve object node/source against the
    // registry; reject if not a live Node (never throw out of applyCommand).
    if (cmd.node !== undefined && typeof cmd.node === 'object' && !this.isRegisteredNode(cmd.node)) {
      return { status: 'rejected' }
    }
    if (cmd.source !== undefined && typeof cmd.source === 'object' && !this.isRegisteredNode(cmd.source)) {
      return { status: 'rejected' }
    }
    // F6 — a `state-slice`/`rows-mint`-style op whose `mutation` is missing or
    // not an array would crash `for (const m of op.mutation)`. Reject cleanly.
    if (cmd.kind === 'state-slice' && !Array.isArray(cmd.mutation)) {
      return { status: 'rejected' }
    }
    if (cmd.kind === 'layer-apply' && !Array.isArray(cmd.mutation)) {
      return { status: 'rejected' }
    }
    const payload: { kind: string; node?: Node; [k: string]: unknown } = { ...cmd } as never
    if (typeof cmd.node === 'string') {
      const id = this.resolveTarget(cmd.node)
      const n = id ? this.supervisor.getNode(id) : undefined
      if (n) payload.node = n
    }
    const result = this.supervisor.apply(payload)
    const dirty = (result.dirtied ?? []).filter((id) => this.supervisor.getNode(id)?.isInTree)
    for (const id of dirty) {
      const node = this.supervisor.getNode(id)
      if (!node) continue
      const cr = node.compile(this.focusedSlice(node), { focusNodeId: node.id })
      const grouped = new Map<string, CompiledState[]>()
      for (const s of cr.actionable) {
        const arr = grouped.get(s.nodeId) ?? []
        arr.push(s)
        grouped.set(s.nodeId, arr)
      }
      for (const [gid, arr] of grouped) {
        if (this.supervisor.getNode(gid)?.isInTree) this.prevStates.set(gid, arr)
      }
    }
    this.render()
    const out: { status: string; dirtied?: string[]; minted?: string[] } = { status: result.status }
    if (result.dirtied) out.dirtied = result.dirtied as string[]
    if (result.minted) out.minted = result.minted as string[]
    this.rebuildIdIndex()
    return out
  }

  private focusedSlice(node: Node): Node[] {
    return focusedSliceFor(node, () => this.supervisor.allNodes())
  }

  /** F5 — is this object a real registered (not-destroyed) Node, not a plain
   *  object masquerading as one? Used to reject a hostile/malformed op before
   *  the engine calls `.clone()`/`.source` on it. */
  private isRegisteredNode(obj: unknown): boolean {
    if (obj === null || typeof obj !== 'object') return false
    const n = obj as Node
    return typeof n.id === 'string' && this.supervisor.getNode(n.id) === n && !n.destroyed
  }

  /** The current graph's legacy export — no mutation. */
  exportLegacy(): LegacyInitialData {
    // Exclude destroyed nodes from the export (the retention walk keeps them
    // in the family, but a re-translate would resurrect them as live — a
    // census mismatch on the export→validate round-trip). Only in-tree,
    // not-destroyed content nodes are exported.
    const live = this.nodes.slice(1).filter((n) => !n.destroyed && n.isInTree)
    const rev = reverseTranslate(this.rootNode, { content: live })
    return {
      ...rev,
      content: rev.content ?? [],
      clientConfig: { runInstantiation: true, runRendering: true },
    }
  }

  /** The current graph's serialized export — no mutation. */
  exportSerialized(): SerializedRenderDoc {
    return serializeSlice(this.rootNode, this.nodes, { adapter: 'dom', persistence: false })
  }

  /** Re-load an export into a THROWAWAY graph (a fresh Supervisor + hub; never
   *  the live one) and compare census. Never throws on a malformed export. */
  validateExport(kind: 'legacy' | 'serialized', exp: unknown): { valid: boolean; censusMatch: boolean; warnings: unknown[] } {
    // F4 — a kind other than 'legacy'|'serialized' is invalid (never a silent
    // serialized parse). H6 — a non-legacy/non-serialized kind → valid:false.
    if (kind !== 'legacy' && kind !== 'serialized') {
      return { valid: false, censusMatch: false, warnings: [] }
    }
    try {
      let nodes: Node[]
      let hub = createLinkHub()
      if (kind === 'legacy') {
        const translated = translateLegacy(exp as LegacyInitialData)
        nodes = translated.nodes
      } else {
        const seeds = loadState(exp as SerializedRenderDoc)
        nodes = seeds.map((s) => new Node(s, hub))
        reconcileParentTargets(nodes)
      }
      const throwaway = new Supervisor({ events: new EventBridge(), maxJournalLength: this.maxJournalLength })
      for (const n of nodes) throwaway.registerNode(n)
      const cr = nodes[0].compile(nodes)
      throwaway.recordResolved(cr.actionable)
      const theirs = {
        registered: throwaway.allNodes().length,
        inTree: throwaway.allNodes().filter((n) => !n.destroyed && n.isInTree).length,
        unplaced: throwaway.allNodes().filter((n) => !n.destroyed && n.state === 'unplaced').length,
        destroyed: throwaway.allNodes().filter((n) => n.destroyed).length,
        prototypes: throwaway.allNodes().filter((n) => n.state === 'prototype').length,
      }
      const ours = this.census()
      return { valid: true, censusMatch: theirs.inTree === ours.inTree && theirs.registered === ours.registered, warnings: [] }
    } catch {
      return { valid: false, censusMatch: false, warnings: [] }
    }
  }

  /** C3/C4 — tear down every in-tree child of root (supervisor destroy per
   *  node), drop content payloads, clear userData, then settle-gate (R6), then
   *  re-render. Returns the post-teardown census (inTree === 1). Idempotent. */
  teardown(): Census {
    this.tearDownGraph()
    return this.census()
  }

  /** MCP `provident.teardown` — the interface-driven reset (C4): teardown →
   *  settle-gate (R6: `hasPendingWork()` false) → re-render → root-only proof.
   *  Returns the post-teardown census + the root-only render + warnings.
   *  ASYNC (R6): the destroy cascade may leave pending pass-2 work; the
   *  settle-gate is AWAITED so the returned census reflects provable
   *  quiescence, never a pre-settle snapshot. */
  async teardownResult(): Promise<TeardownResult> {
    await this.settleGate()
    const census = this.teardown()
    await this.settleGate()
    return { census, renderedHtml: this.renderedHtml(), warnings: this.warnings }
  }

  /** R6 test seam — whether the supervisor has undrained pass-2 work (the
   *  battery + the settle-gate assert this is false after a teardown). */
  hasPendingWork(): boolean {
    return this.supervisor.hasPendingWork()
  }

  /** R6 — the settle-gate: drain pending work to provable quiescence before
   *  the render is trusted (the battery asserts `hasPendingWork() === false`).
   *  The engine's public flush + hasPendingWork (0.1.3). */
  private async settleGate(): Promise<void> {
    let guard = 0
    while (this.supervisor.hasPendingWork()) {
      if (guard++ > 1000) break
      await this.supervisor.flush()
      this.mergePass2()
    }
  }

  /** MCP `provident.op` — apply a single managed-channel op, drain pass-2
   *  once (R9), re-render, return status + both views + warnings (R10). */
  op(cmd: unknown): OpResult {
    const result = this.applyCommand(cmd as never)
    return {
      status: result.status,
      ...(result.dirtied !== undefined ? { dirtied: result.dirtied } : {}),
      ...(result.minted !== undefined ? { minted: result.minted } : {}),
      renderedHtml: this.renderedHtml(),
      ssrHtml: this.ssrHtml(),
      warnings: this.warnings,
    }
  }

  /** MCP `provident.journal` — drive the engine's journal reversibility
   *  surface (`Supervisor.undo()`/`redo()`/`replay()`, provident-ssr 0.2.1
   *  UndoRedoReport). The engine returns a report (`status`/`scheduledDirtied`/
   *  `stackTopKind`/`redoTopKind`/`baseBoundary`); the host then AWAITS the
   *  flush + drains pass-2 (the report's `scheduledDirtied` is the pending-flush
   *  set — settled states need `flush()` + `takePass2States()`, undo-redo-report
   *  §2.5), re-renders, and returns both views + warnings. J3 — a base-restoring
   *  journal op swaps the graph's node objects, so the render baseline + id
   *  index are rebuilt from the live graph (never a stale focused-slice cache).
   *  J7 — no requestId: undo/redo/replay are intrinsically non-idempotent. */
  async journal(action: 'undo' | 'redo' | 'replay'): Promise<JournalResult> {
    if (action !== 'undo' && action !== 'redo' && action !== 'replay') {
      throw new Error(`unknown journal action: ${String(action)}`)
    }
    const report = this.supervisor[action]()
    // J3 — the journal op may have swapped node objects (base-restore) or
    // dirtied a set; drain the settled pass-2 states + rebuild the id index
    // from the live graph so the re-render reflects the post-op state. The
    // host's own `nodes`/`rootNode` caches are refreshed from the supervisor
    // too — a base-restoring op replaces the node objects, and export/validate/
    // shapeSig read those caches (adversarial J3 finding).
    await this.settleGate()
    this.nodes = [...this.supervisor.allNodes()]
    const root = this.nodes.find((n) => n.id === this.rootNode.id)
    if (root) this.rootNode = root
    this.rebuildIdIndex()
    this.render()
    return {
      status: report.status,
      scheduledDirtied: report.scheduledDirtied,
      ...(report.stackTopKind !== undefined ? { stackTopKind: report.stackTopKind } : {}),
      ...(report.redoTopKind !== undefined ? { redoTopKind: report.redoTopKind } : {}),
      baseBoundary: report.baseBoundary,
      renderedHtml: this.renderedHtml(),
      ssrHtml: this.ssrHtml(),
      warnings: this.warnings,
    }
  }

  /** MCP `provident.export` — the graph's legacy/serialized export + a census
   *  snapshot. No mutation. */
  export(format: 'legacy' | 'serialized'): ExportResult {
    const value = format === 'legacy' ? this.exportLegacy() : this.exportSerialized()
    return { export: value, census: this.census() }
  }

  /** MCP `provident.validate` — validate an export against a THROWAWAY graph
   *  (never the live one) + compare census + tree-signature parity (R3: only
   *  structural parity for def/seam-bearing exports). */
  validate(kind: 'legacy' | 'serialized', exp: unknown): ValidateResult {
    const verdict = this.validateExport(kind, exp)
    let treeSigMatch = false
    try {
      const ourSig = this.shapeSig()
      const theirSig = this.validateSig(kind, exp)
      treeSigMatch = verdict.valid && ourSig === theirSig
    } catch {
      treeSigMatch = false
    }
    return { valid: verdict.valid, censusMatch: verdict.censusMatch, treeSigMatch, warnings: verdict.warnings }
  }

  /** The engine auto-mints a per-translate `props.id` (e.g. `preempt-node-node-1`)
   *  that differs across a legacy round-trip. Strip it (and any `node-N`
   *  minted id) so the shape digest is stable — R3 "structural parity only". */
  private structuralProps(props: Record<string, unknown> | undefined): string {
    if (!props) return ''
    const o: Record<string, unknown> = {}
    for (const k of Object.keys(props)) {
      if (k === 'id' && typeof props[k] === 'string' && /^(preempt-node-|node-)/.test(props[k] as string)) continue
      o[k] = this.sortVal(props[k])
    }
    return JSON.stringify(o)
  }

  private sortVal(v: unknown): unknown {
    if (Array.isArray(v)) return v.map((x) => this.sortVal(x))
    if (v !== null && typeof v === 'object') {
      const o: Record<string, unknown> = {}
      for (const k of Object.keys(v as Record<string, unknown>).sort()) o[k] = this.sortVal((v as Record<string, unknown>)[k])
      return o
    }
    return v
  }

  /** A deterministic shape digest of a rendered structure (never the raw
   *  fragment — a 4095-element tree serializes to ~180MB). Folds the EMITTED
   *  element tree (type + structural props + children digests) — the upstream
   *  `shapeSigOfTrees` pattern. Engine-minted auto ids (`node-N`,
   *  `preempt-node-*`) are stripped so the digest is stable across a legacy
   *  round-trip (R3 "structural parity only"). */

  private foldElements(els: Array<{ wire?: unknown; type?: unknown; props?: Record<string, unknown>; parent?: unknown; forkKey?: unknown }>, kids: Map<string, Array<{ wire?: unknown; type?: unknown; props?: Record<string, unknown> }>>): string {
    const sort = (v: unknown): unknown => {
      if (Array.isArray(v)) return v.map(sort)
      if (v !== null && typeof v === 'object') {
        const o: Record<string, unknown> = {}
        for (const k of Object.keys(v as Record<string, unknown>).sort()) o[k] = sort((v as Record<string, unknown>)[k])
        return o
      }
      return v
    }
    const foldEl = (e: { wire?: unknown; type?: unknown; props?: Record<string, unknown> }): string => {
      const props = e.props ? this.structuralProps(e.props) : ''
      const ch = (kids.get(String(e.wire)) ?? []).map(foldEl).join('')
      return `${String(e.type)}:${props}:${ch.length ? this.hash64(ch) : ''};`
    }
    const roots = els.filter((e) => !e.parent || !String(e.parent))
    return this.hash64(roots.map(foldEl).join(''))
  }

  private emitTree(nodes: Node[], supervisor: Supervisor): Array<{ wire?: unknown; type?: unknown; props?: Record<string, unknown>; parent?: unknown; forkKey?: unknown }> {
    const cr = nodes[0].compile(nodes)
    supervisor.recordResolved(cr.actionable)
    const byNode = new Map(supervisor.allNodes().map((n) => [n.id, n]))
    return emitElements(cr.actionable as never, byNode as never) as never
  }

  /** A deterministic shape digest of the LIVE graph (never the raw fragment).
   *  Emits the live graph to its element tree and folds it. */
  private shapeSig(): string {
    const els = this.emitTree(this.nodes, this.supervisor)
    const kids = new Map<string, Array<{ wire?: unknown; type?: unknown; props?: Record<string, unknown> }>>()
    for (const e of els) {
      if (e.parent) {
        const arr = kids.get(String(e.parent)) ?? []
        arr.push(e)
        kids.set(String(e.parent), arr)
      }
    }
    return this.foldElements(els, kids)
  }

  /** The THROWAWAY graph's shape sig for a candidate export — never the live
   *  graph; a throwaway copy used only for the parity compare. */
  private validateSig(kind: 'legacy' | 'serialized', exp: unknown): string {
    const hub = createLinkHub()
    const seedNodes = kind === 'legacy'
      ? translateLegacy(exp as LegacyInitialData).nodes
      : loadState(exp as never).map((s) => new Node(s, hub))
    reconcileParentTargets(seedNodes)
    const sup = new Supervisor({ events: new EventBridge(), maxJournalLength: this.maxJournalLength })
    for (const n of seedNodes) sup.registerNode(n)
    const els = this.emitTree(seedNodes, sup)
    const kids = new Map<string, Array<{ wire?: unknown; type?: unknown; props?: Record<string, unknown> }>>()
    for (const e of els) {
      if (e.parent) {
        const arr = kids.get(String(e.parent)) ?? []
        arr.push(e)
        kids.set(String(e.parent), arr)
      }
    }
    return this.foldElements(els, kids)
  }

  /** Deterministic FNV-1a 64-bit hash (the upstream hash64 — path-fork-data.js). */
  private hash64(str: string): string {
    let h = 0xcbf29ce484222325n
    for (let i = 0; i < str.length; i += 1) {
      h ^= BigInt(str.charCodeAt(i))
      h = (h * 0x100000001b3n) & 0xffffffffffffffffn
    }
    return h.toString(16).padStart(16, '0')
  }

  // ---- internal teardown helpers -----------------------------------------

  private tearDownGraph(): void {
    // Destroy EVERY in-tree non-root node (family children + content-owned),
    // not just the root's direct children — otherwise they linger as
    // resolvable `unplaced` ghosts (the adversarial A2 fix). Use the destroy
    // op so nodes are truly destroyed (evicted from the registry + the
    // id-index drops them).
    for (const n of this.supervisor.allNodes()) {
      if (n.destroyed || n.id === this.rootNode.id || !n.isInTree) continue
      this.supervisor.apply({ kind: 'destroy', node: n })
    }
    for (const p of this.payloads) dropPayload(p)
    this.payloads = []
    // Re-render from an empty actionable set: the kept prevMaps make
    // diffMinimal emit removal ops for every prior element, emptying the mount
    // to the root-only graph (the root stays in-tree, inTree === 1).
    this.prevStates.clear()
    this.render()
    this.rebuildIdIndex()
  }

  /** Reset the render baseline to a fresh graph (called on every load). The
   *  prevMaps are caller-owned per-tree state; reusing them across a graph
   *  reload collapses the emit (the adapter's diff keys no longer exist). The
   *  SSRFragmentAdapter also retains stale state across a reload, so it is
   *  recreated. Also reset bootstrapped so the next render runs the compile
   *  pass again. */
  private resetRenderState(): void {
    this.bootstrapped = false
    this.domPrevMap = null
    this.ssrPrevMap = null
    this.ssr = new SSRFragmentAdapter()
    this.prevStates.clear()
  }

  // ---- code / data CRUD (mcp-endpoint.md §4 — envelope authoring) ---------

  /** Validate the path grammar (F3): each dot-segment must be a bare key or a
   *  well-formed `key[i]` index form. A trailing `]`, an unclosed `[`, a `]`
   *  before its `[`, an empty segment (`a..b`), or a leading/trailing dot is
   *  rejected BEFORE any read/write — otherwise a malformed segment is silently
   *  treated as a literal property name and corrupts the envelope. */
  private assertValidPath(path: string): void {
    if (typeof path !== 'string' || path === '') throw new Error('code: path must be a non-empty string')
    if (path[0] === '.' || path[path.length - 1] === '.') throw new Error(`code: malformed path '${path}'`)
    const segs = path.split('.')
    for (const seg of segs) {
      if (seg === '') throw new Error(`code: malformed path '${path}'`)
      const opens = (seg.match(/\[/g) ?? []).length
      const closes = (seg.match(/\]/g) ?? []).length
      if (opens !== closes) throw new Error(`code: malformed path '${path}'`)
      if (closes > 0) {
        // must be exactly one `[...]` suffix with a non-negative integer
        const m = /^([^[\]]+)\[(\d+)\]$/.exec(seg)
        if (!m) throw new Error(`code: malformed path '${path}'`)
      }
    }
  }

  private envelopeParent(path: string): { parent: unknown; key: string | number } | null {
    return this.envelopeParentIn(this.envelope, path)
  }

  /** B3 (loadbatch-review.md) — resolve a path against a GIVEN envelope (the
   *  batch clone), so a later op can reference a path created by an earlier op
   *  in the same batch. */
  private envelopeParentIn(env: unknown, path: string): { parent: unknown; key: string | number } | null {
    this.assertValidPath(path)
    let cur: unknown = env
    const segs = path.split('.')
    for (let i = 0; i < segs.length - 1; i += 1) {
      const seg = segs[i]
      if (cur == null || typeof cur !== 'object') return null
      cur = this.segment(cur, seg)
      if (cur === undefined) return null
    }
    const last = segs[segs.length - 1]
    if (cur == null || typeof cur !== 'object') return null
    const m = /^([^[]+)\[(\d+)\]$/.exec(last)
    if (m) {
      const arr = (cur as Record<string, unknown>)[m[1]]
      if (!Array.isArray(arr)) return null
      return { parent: arr, key: Number(m[2]) }
    }
    return { parent: cur, key: last }
  }

  /** Resolve a single path segment against an object: a bare key or a
   *  `key[i]` array-index form. Returns the resulting value (or undefined). */
  private segment(obj: unknown, seg: string): unknown {
    const m = /^([^[]+)\[(\d+)\]$/.exec(seg)
    if (!m) return (obj as Record<string, unknown>)[seg]
    const val = (obj as Record<string, unknown>)[m[1]]
    if (!Array.isArray(val)) return undefined
    return val[Number(m[2])]
  }

  /** `provident.code.get` — read the envelope subtree/entry at `path` (raw
   *  JSON; no graph touch). */
  codeGet(path: string): CodeGetResult {
    if (path === '' || path === '.') return { path, value: this.envelope }
    const loc = this.envelopeParent(path)
    if (!loc) throw new Error(`code.get: unresolved path '${path}'`)
    const value = (loc.parent as Record<string, unknown>)[loc.key]
    return { path, value }
  }

  /** `provident.code.set` — set the envelope value at `path`. */
  codeSet(path: string, value: unknown): CodeSetResult {
    if (this.envelope === null) throw new Error('code.set: no envelope loaded (A1 doc loads have no legacy envelope)')
    const loc = this.envelopeParent(path)
    if (!loc) throw new Error(`code.set: unresolved path '${path}'`)
    ;(loc.parent as Record<string, unknown>)[loc.key] = value
    return { ok: true, path, wrote: value }
  }

  /** `provident.code.create` — append a new entry to the ARRAY at `path`
   *  (e.g. push a hook name, a handler, a content node). The path resolves to
   *  an ARRAY. */
  codeCreate(path: string, entry: unknown): CodeCreateResult {
    if (this.envelope === null) throw new Error('code.create: no envelope loaded')
    const loc = this.envelopeParent(path)
    if (!loc) throw new Error(`code.create: unresolved path '${path}'`)
    const value = (loc.parent as Record<string, unknown>)[loc.key]
    if (!Array.isArray(value)) throw new Error(`code.create: '${path}' is not an array`)
    ;(value as unknown[]).push(entry)
    return { ok: true, path, appendedAt: (value as unknown[]).length - 1 }
  }

  /** `provident.code.delete` — delete an array element at `path`.
   *
   *  Two addressing forms (mutually exclusive — F2):
   *  1. `path` resolves to an ARRAY (e.g. `template.root.hooks`) + an `index`
   *     argument → splice that index.
   *  2. `path` resolves to a specific array element (e.g. `hooks[1]`, where the
   *     last segment is `[i]` and the resolved parent is the array) → splice
   *     that element; a provided `index` is ignored (the path already selected
   *     it — never double-splice).
   *
   * F1 — a path-index element is bounds-checked exactly like the `index`
   *   argument (an out-of-range/negative element index throws `/out of range/`,
   *   never a silent `{ok:true, removed:undefined}`).
   */
  codeDelete(path: string, index?: number): CodeDeleteResult {
    if (this.envelope === null) throw new Error('code.delete: no envelope loaded')
    const loc = this.envelopeParent(path)
    if (!loc) throw new Error(`code.delete: unresolved path '${path}'`)
    const parent = loc.parent as Record<string, unknown>
    // Form 2 — the path selected a specific array ELEMENT (`...hooks[1]`):
    // loc.key is the numeric index and loc.parent is the array.
    if (typeof loc.key === 'number' && Array.isArray(parent)) {
      const k = loc.key
      if (!Number.isInteger(k) || k < 0 || k >= (parent as unknown[]).length) {
        throw new Error(`code.delete: '${path}' index ${k} out of range`)
      }
      const removed = (parent as unknown[]).splice(k, 1)[0]
      return { ok: true, removed }
    }
    const value = parent[loc.key]
    // Form 1 — `path` resolves to an ARRAY property + an `index` argument.
    if (Array.isArray(value)) {
      if (index === undefined) throw new Error(`code.delete: '${path}' needs an index`)
      // F8 — an out-of-range (or negative) index must not silently splice the
      // end of the array (a negative index is a JS from-the-end splice that
      // would corrupt the envelope). Reject instead of a wrong `removed`.
      if (!Number.isInteger(index) || index < 0 || index >= (value as unknown[]).length) {
        throw new Error(`code.delete: '${path}' index ${index} out of range`)
      }
      const removed = (value as unknown[]).splice(index, 1)[0]
      return { ok: true, removed }
    }
    // F2 — a path that selected an element but resolved to a NON-array value
    // (e.g. a scalar, or an array already consumed by the path-index form) is
    // ambiguous; reject rather than silently delete an arbitrary key.
    if (typeof loc.key === 'number' || Array.isArray(parent)) {
      throw new Error(`code.delete: '${path}' resolved to a non-array element; provide a valid index`)
    }
    const removed = value
    delete parent[loc.key]
    return { ok: true, removed }
  }

  /** `provident.code.validate` — schema-validate an envelope WITHOUT building
   *  the graph (translate boundary checks; report TranslatedTree.warnings). */
  codeValidate(envelope?: unknown): CodeValidateResult {
    const env = (envelope ?? this.envelope) as LegacyInitialData | null
    if (env === null || env === undefined) throw new Error('code.validate: no envelope to validate')
    try {
      const translated = translateLegacy(structuredClone(env))
      const warnings = translated.warnings ?? []
      const bad = warnings.some((w) => w.code === 'handler-body-eval-blocked' || w.code === 'handler-body-invalid')
      return { valid: !bad, warnings, shape: `${translated.nodes.length} nodes / ${translated.content.length} content` }
    } catch {
      return { valid: false, warnings: [{ code: 'envelope-mismatch' }], shape: '' }
    }
  }

  /** `provident.code.load` — apply an edited envelope to the LIVE graph (the
   *  A2 `load` path: teardown → translate → register → compile → render).
   *
   *  F7 — a structurally-invalid edited envelope (e.g. `children` set to a
   *  non-array) is REJECTED up front (P-C4: "a malformed edit is rejected with
   *  the framework's own codes, never applied silently") instead of silently
   *  loading a root-only graph. The offending code surfaces in the error. */
  codeLoad(envelope?: unknown): LoadResult {
    const env = (envelope ?? this.envelope) as LegacyInitialData | null
    if (!env) throw new Error('code.load: no envelope to load')
    const pre = this.codeValidate(env)
    const bad = (pre.warnings as Array<{ code?: string }>).find((w) =>
      w.code === 'handler-body-eval-blocked' ||
      w.code === 'handler-body-invalid' ||
      w.code === 'children-shape-invalid' ||
      w.code === 'payload-shape-obsolete' ||
      w.code === 'node-shape-invalid' ||
      w.code === 'envelope-mismatch')
    if (bad) {
      throw new Error(`code.load: envelope invalid (${bad.code}); not applied`)
    }
    this.loadEnvelope(env)
    return {
      census: this.census(),
      renderedHtml: this.renderedHtml(),
      ssrHtml: this.ssrHtml(),
      warnings: this.warnings,
    }
  }

  /** `provident.code.loadBatch` (loadbatch-review.md B1-B8) — stage N `code.*`
   *  envelope ops and perform ONE re-derive.
   *
   *  B2 (all-or-nothing): the ops apply to a `structuredClone` of the envelope;
   *  on ANY op failure the clone is discarded and the live `this.envelope` is
   *  UNTOUCHED (no half-applied state). Only on full success is the clone
   *  committed + re-derived once.
   *  B3 (ordering with dependencies): ops apply SEQUENTIALLY to the clone, so a
   *  later op can reference a path created by an earlier op.
   *  B4 (schema): a malformed op (unknown kind / bad shape) is rejected.
   *  B5 (return): the re-derive `LoadResult` + a per-op status array.
   *  B7 (no-envelope): throws "no envelope loaded" when `this.envelope` is null
   *  (A1 doc loads). */
  codeLoadBatch(ops: Array<{ op: string; path: string; value?: unknown; entry?: unknown; index?: number }>): CodeLoadBatchResult {
    if (this.envelope === null) throw new Error('code.loadBatch: no envelope loaded (A1 doc loads have no legacy envelope)')
    if (!Array.isArray(ops)) throw new Error('code.loadBatch: ops must be an array')
    // B2 — apply to a clone; commit only on full success.
    const clone = structuredClone(this.envelope) as LegacyInitialData
    const applied: Array<{ op: string; path: string; status: 'applied' }> = []
    for (const op of ops) {
      if (op === null || typeof op !== 'object') throw new Error(`code.loadBatch: malformed op (${String(op)})`)
      const kind = op.op
      if (kind === 'set') {
        const loc = this.envelopeParentIn(clone, op.path)
        if (!loc) throw new Error(`code.loadBatch: unresolved path '${op.path}'`)
        ;(loc.parent as Record<string, unknown>)[loc.key] = op.value
      } else if (kind === 'create') {
        const loc = this.envelopeParentIn(clone, op.path)
        if (!loc) throw new Error(`code.loadBatch: unresolved path '${op.path}'`)
        const value = (loc.parent as Record<string, unknown>)[loc.key]
        if (!Array.isArray(value)) throw new Error(`code.loadBatch: '${op.path}' is not an array`)
        ;(value as unknown[]).push(op.entry)
      } else if (kind === 'delete') {
        const loc = this.envelopeParentIn(clone, op.path)
        if (!loc) throw new Error(`code.loadBatch: unresolved path '${op.path}'`)
        const parent = loc.parent as Record<string, unknown>
        if (typeof loc.key === 'number' && Array.isArray(parent)) {
          const k = loc.key
          if (!Number.isInteger(k) || k < 0 || k >= (parent as unknown[]).length) {
            throw new Error(`code.loadBatch: '${op.path}' index ${k} out of range`)
          }
          ;(parent as unknown[]).splice(k, 1)
        } else {
          const value = parent[loc.key]
          if (Array.isArray(value)) {
            if (op.index === undefined) throw new Error(`code.loadBatch: '${op.path}' needs an index`)
            if (!Number.isInteger(op.index) || op.index < 0 || op.index >= (value as unknown[]).length) {
              throw new Error(`code.loadBatch: '${op.path}' index ${op.index} out of range`)
            }
            ;(value as unknown[]).splice(op.index, 1)
          } else {
            delete parent[loc.key]
          }
        }
      } else {
        throw new Error(`code.loadBatch: unknown op '${String(kind)}'`)
      }
      applied.push({ op: kind, path: op.path, status: 'applied' })
    }
    // B2 — commit the clone + re-derive once (P-C4 validation inside codeLoad).
    this.envelope = clone
    const result = this.codeLoad(clone)
    return { ...result, ops: applied }
  }

  // ---- MCP-facing operations ---------------------------------------------
  async dispatch(req: DispatchRequest): Promise<DispatchResult> {
    const nodeId = this.resolveTarget(req.target)
    if (nodeId === null) {
      throw new Error(`unresolved target: ${JSON.stringify(req.target)}`)
    }
    // The shared 0.1.1 dispatch-report surface (ssr-synthetic-event.md §3):
    // dispatchAndReport resolves + guards identically to dispatchEvent, awaits
    // the public flush() internally, derives `dirtied` (apply().dirtied ∪
    // pass-2 keys), and applies the opt-in bounded requestId dedup (echo
    // semantics — a duplicate returns the FIRST caller's report).
    const report = await this.supervisor.dispatchAndReport(
      nodeId,
      req.event,
      req.requestId !== undefined ? { requestId: req.requestId } : {},
      ...(req.args ?? []),
    )
    // dispatchAndReport consumed the pass-2 drain as the report's caller; the
    // NON-draining resolved store carries the fresh states for the dirtied
    // nodes — refresh the render baseline from it (P4: the graph mutated, the
    // fragment is untouched until the host explicitly re-renders).
    for (const id of report.dirtied) {
      const resolved = this.supervisor.getResolvedStates(id)
      if (resolved.length > 0) this.prevStates.set(id, resolved)
    }
    this.render()
    return {
      results: report.results.map((r) => (r instanceof Error ? { error: { message: r.message, name: r.name } } : r)),
      dirtied: report.dirtied,
      renderedHtml: this.renderedHtml(),
      ssrHtml: this.ssrHtml(),
    }
  }

  renderedHtmlResult(): RenderedHtmlResult {
    return {
      renderedHtml: this.renderedHtml(),
      ssrHtml: this.ssrHtml(),
      census: this.census(),
    }
  }

  /** 0.2 Feature 2 — the MCP `provident.get_markdown` result: the markdown
   *  text + the census snapshot. */
  markdownResult(): MarkdownResult {
    return { markdown: this.markdown(), census: this.census() }
  }

  private renderedHtml(): string {
    const html = this.mount.innerHTML
    // U6 (M-r5) — apply the emit-only transforms to the DOM view. The transform
    // is applied to the emitted fragment, never the Node content.
    return this.transformRouter ? this.transformRouter.applyTransforms(html) : html
  }

  private ssrHtml(): string {
    const html = this.ssr.toString()
    // U6 (M-r5) — apply the SAME transforms to the SSR fragment (parity: the
    // MCP agent's ssrHtml must not diverge from the operator's DOM).
    return this.transformRouter ? this.transformRouter.applyTransforms(html) : html
  }

  /** 0.2 Feature 2 — the MarkdownAdapter endpoint (`provident.get_markdown`):
   *  re-emit the CURRENT graph through a fresh MarkdownAdapter (the simplified
   *  text-only output document for agentic consumers). The adapter is a pure
   *  op-stream consumer (D15) — it renders the same actionable set the DOM/SSR
   *  views use, but emits markdown text (non-interactive: on:* and data:*
   *  props are dropped, D7). A fresh adapter per call (D10 — instance-bound
   *  prevMap; never reuse a stale one). */
  markdown(): string {
    const actionable: CompiledState[] = []
    for (const states of this.prevStates.values()) actionable.push(...states)
    const byNode = new Map(this.supervisor.allNodes().map((n) => [n.id, n]))
    const md = new MarkdownAdapter()
    renderProducingProcess(actionable as never, byNode as never, md, null, this.renderOptions)
    const out = md.toString()
    // U6 (M-r5) — apply the SAME transforms to the markdown view (parity: the
    // MCP agent's get_markdown must not diverge from get_rendered_html).
    return this.transformRouter ? this.transformRouter.applyTransforms(out) : out
  }

  listTargets(): ListTargetsResult {
    const nodes: NodeInfo[] = []
    for (const n of this.supervisor.allNodes()) {
      // Only in-tree, not-destroyed nodes are ADDRESSABLE — a torn-down
      // unplaced/destroyed node must not appear as a dispatch target (the
      // ghost-tree adversarial fix).
      if (n.destroyed || !n.isInTree) continue
      const cssId = (n.css as { id?: string })?.id
      const propsId = (n.props as { id?: string })?.id
      nodes.push({
        nodeId: n.id,
        ...(cssId !== undefined ? { cssId } : {}),
        ...(propsId !== undefined ? { propsId } : {}),
        type: n.type,
        content: n.content,
        state: n.state,
        inTree: !!n.isInTree,
        handlers: (n.handlers as Array<{ name?: string; event?: string; phase?: string }> | undefined)?.map((h) => ({
          ...(h.name !== undefined ? { name: h.name } : {}),
          ...(h.event !== undefined ? { event: h.event } : {}),
          ...(h.phase !== undefined ? { phase: h.phase } : {}),
        })) ?? [],
      })
    }
    return { nodes }
  }

  nodeState(target: DispatchTarget | string): NodeStateResult {
    const nodeId = this.resolveTarget(target)
    if (nodeId === null) throw new Error(`unresolved target: ${JSON.stringify(target)}`)
    const states = this.supervisor.getResolvedStates(nodeId)
    // The engine's CompiledState.anchors carry LIVE circular Node/Link refs —
    // a raw snapshot violates the JSON-safe contract (types.ts NodeStateResult
    // "states: unknown[] — JSON-safe"). Project each state into a snapshot
    // whose anchors become plain {role, targetId, value} data (never the Node
    // graph), so get_node_state survives JSON serialization over MCP.
    const projected = states.map((s) => this.projectedState(s as CompiledState))
    return { nodeId, states: projected as unknown[], census: this.census() }
  }

  /** Build a JSON-safe compiled-state mirror: every scalar/binding field is
   *  carried verbatim; the `anchors` array is projected to plain data (a live
   *  Node anchor resolves to its id + value, never the circular Node/Link
   *  refs the engine keeps). */
  private projectedState(s: CompiledState): Record<string, unknown> {
    const anchors = (s.anchors ?? []).map((a) => {
      const targetNode = (a.target as { isNode?: boolean; id?: string } | null)?.isNode
        ? (a.target as { id?: string }).id
        : typeof a.target === 'string'
          ? a.target
          : String(a.target ?? '')
      return {
        role: a.role,
        target: targetNode,
        ...(a.value !== undefined ? { value: this.sortVal(a.value) } : {}),
      }
    })
    return {
      nodeId: s.nodeId,
      ...(s.pathKey !== undefined ? { pathKey: s.pathKey } : {}),
      state: s.state,
      type: s.type,
      props: s.props,
      css: s.css,
      content: s.content,
      anchors,
      parent: s.parent,
      children: s.children,
      bindings: s.bindings,
      unresolved: s.unresolved,
      ...(s.trace !== undefined ? { trace: s.trace } : {}),
    }
  }

  private census(): Census {
    const all = this.supervisor.allNodes()
    return {
      registered: all.length,
      inTree: all.filter((n) => !n.destroyed && n.isInTree).length,
      unplaced: all.filter((n) => !n.destroyed && n.state === 'unplaced').length,
      destroyed: all.filter((n) => n.destroyed).length,
      prototypes: all.filter((n) => n.state === 'prototype').length,
    }
  }
}
