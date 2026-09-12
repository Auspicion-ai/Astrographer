// src/renderer/secure-panels.ts — the operator-only Security Settings + Debug
// panes, rendered as provident data in a SECOND, ISOLATED graph (multi-graph
// isolation adoption, 2026-08-25).
//
// The shell's project-wide constraint: every non-shell UI element must be
// rendered with the provident framework. The Security Settings pane is
// manual-UI-only (mcp-endpoint.md §6.4) — an agent must never be able to grant
// itself capabilities. So this pane lives in its OWN provident graph (a
// `createIsolatedScope()` GraphScope + own hub + own Supervisor + own
// DomAdapter → its own root element), ISOLATED from the agent-visible app
// graph: the app Runtime's `dispatch`/`get_rendered_html`/`list_targets`
// never see it (no cross-graph addressability — multi-graph-isolation-spec.md).
//
// Pane handlers call the IPC bridge (`window.provident.security.get/set`),
// NEVER an MCP tool — the security channel is main→renderer→main only. An
// agent cannot reach these handlers (they are in the isolated graph, not the
// app graph the MCP endpoints read).
import {
  translateLegacy,
  Supervisor,
  EventBridge,
  DomAdapter,
  renderProducingProcess,
  createLinkHub,
  type RenderOptions,
  type LegacyInitialData,
} from 'provident-ssr'
import { createIsolatedScope, type GraphScope } from 'provident-ssr/core/registry.js'
import { clickableClasses } from './render-shared.js'
import type { SecuritySettings, RpcRequest, RpcReply, RagSnapshotPayload } from '../shared/types.js'

declare global {
  interface Window {
    provident?: {
      ready(): void
      onRequest(handler: (req: RpcRequest) => void): void
      sendReply(reply: RpcReply): void
      notify(payload: { uri: string }): void
      security?: {
        get(): Promise<SecuritySettings>
        set(patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }): Promise<SecuritySettings>
      }
      module?: {
        get(): Promise<{ corrupt: boolean; quarantined: string[]; loaded: string[]; modules: Array<{ name: string; version: string; capabilities?: unknown; disabled?: boolean; quarantined?: boolean }> }>
        setDisabled(name: string, disabled: boolean): Promise<{ corrupt: boolean; quarantined: string[]; loaded: string[]; modules: Array<{ name: string; version: string; capabilities?: unknown; disabled?: boolean; quarantined?: boolean }> }>
      }
      edit?: {
        commit(nodeId: string, content: string): Promise<{ ok: true; nodeId: string } | { ok: false; reason: 'deleted-node' | 'store-error'; error?: string }>
        onRagStoreChanged(handler: (payload: { kind: 'content' | 'structural'; nodeIds: string[]; edgeIds: string[] }) => void): () => void
      }
      rag?: {
        query(query: string, topK?: number): Promise<unknown>
        snapshot(): Promise<RagSnapshotPayload>
      }
    }
  }
}

// PG12 (W1-Q14 a) — the operator-only module-tool runner seam. The modal
// module manager lists the tools this seam reports (`CapabilityRouter.listTools()`
// in production) and invokes them through `invoke` — which in production is the
// EXISTING two-gate `invokeModuleTool(router, gate, …)` (module AND code).
// Operator scope only: the runner is authored in this ISOLATED pane graph, never
// exposed over MCP, and registers NO new tool.
export interface ModuleToolRunner {
  listTools(): string[]
  /** The invoke seam MAY be async: in production it reaches main over the
   *  `IPC_MODULE_TOOL_INVOKE` channel (a Promise); the in-process test/operator
   *  router is synchronous. `SecurePanels` awaits it either way (W1-N10). */
  invoke(toolName: string, args: unknown): unknown | Promise<unknown>
}

/** The pane-side host the runner control handlers reach (closures execute
 *  in-process in the isolated pane graph — never a window/MCP bridge). */
export interface ModuleRunnerHost {
  listTools(): string[]
  selectTool(tool: string): void
  setArgs(value: string): void
  run(): void
}

/** SecurePanels construction options. `moduleRunner` (PG12) is OPTIONAL: with
 *  no runner the module pane renders an empty runner placeholder (fail-closed). */
export interface SecurePanelsOptions {
  moduleRunner?: ModuleToolRunner
}

// L3 (adversarial) — the pane's group list MUST match security.ts's ToolGroup
// union (read/dispatch/graph/code/module/rag/edit + the Gnosis groups
// gnosis/gnosis-edit). Omitting a group here would leave the manual-UI settings
// pane (the ONLY path to enable groups) unable to toggle it, permanently
// disabling its MCP tools.
const GROUPS = ['read', 'dispatch', 'graph', 'code', 'module', 'rag', 'edit', 'gnosis', 'gnosis-edit'] as const
const GROUP_LABELS: Record<string, string> = {
  read: 'read (get_rendered_html, get_markdown, list_targets, get_node_state, code.get, code.validate)',
  dispatch: 'dispatch (synthetic event driving)',
  graph: 'graph (load, op, export, validate, teardown)',
  code: 'code (code.set/create/delete/load — evaluates handler bodies)',
  module: 'module (module.install/update/list + module:<name>.<tool> extensions — trusted-equivalent to code)',
  rag: 'rag (rag.query, get_document, list_nodes, get_edges, backlinks — read-only retrieval)',
  edit: 'edit (edit.set_content/create_node/delete_node/split_node/merge_node/set_edge — mutating)',
  gnosis: 'gnosis (gnosis.query, gnosis.stream, gnosis.status + the read-only gnosis.document.*/gnosis.wiki.* — the Gnosis engine retrieval trio + document/wiki reads)',
  'gnosis-edit': 'gnosis-edit (gnosis.document.create/update/delete/publish/unpublish/archive + gnosis.wiki.create — mutating Gnosis document/wiki CRUD)',
}

/** PG12 — render a runner result to a short single-line string (the result
 *  node's content). Objects/arrays serialize as JSON; a non-serializable value
 *  falls back to String (never throws). */
function stringifyRunResult(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    const json = JSON.stringify(value)
    return json === undefined ? String(value) : json
  } catch {
    return String(value)
  }
}

function randToken(len = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

// ---- handler bodies (function-STRING data). They reach the IPC bridge via
// `window.provident.security` — NEVER an MCP API. The SecurePanels host
// re-fetches + re-renders after the change over the main-process store.
const TOKEN_GEN_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.security;
  if (!s) return;
  s.set({ token: String(Math.random().toString(36).slice(2, 34)) });
}`
const TOKEN_CLEAR_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.security;
  if (!s) return;
  s.set({ token: null });
}`
// One shared toggle body; the group + the "is it currently on?" are read from
// the node's OWN props (`data-group` / `data-on`). Toggling flips the group.
const TOGGLE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.security;
  if (!s) return;
  var group = ctx.node.props && ctx.node.props['data-group'];
  if (!group) return;
  var on = ctx.node.props && ctx.node.props['data-on'] === 'true';
  if (on) s.set({ disable: [group] }); else s.set({ groups: [group] });
}`
// The maxJournalLength input handler: reads the numeric value from the input
// and persists it via the managed channel. Empty/null clears the setting.
const JOURNAL_LENGTH_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.security;
  if (!s) return;
  var val = ctx.node && ctx.node.props && ctx.node.props['value'];
  var num = val ? parseInt(val, 10) : NaN;
  if (isNaN(num) || num <= 0) s.set({ maxJournalLength: null });
  else s.set({ maxJournalLength: num });
}`

/** The pane-graph envelope: the Security Settings pane + the Debug pane,
 *  authored as provident data. The group toggles are one node per group; their
 *  `data-on`/`data-group` props are refreshed by syncConfig on each refresh. */
export function paneEnvelope(runnerHost?: ModuleRunnerHost): LegacyInitialData {
  // PG12 — the operator-only module-tool runner. The registered tool names are
  // read from the runner seam at author time; one clickable item per tool
  // selects it (operator scope — the runner lives in this isolated graph only).
  const runnerTools = runnerHost ? runnerHost.listTools() : []
  const runnerToolItems =
    runnerTools.length > 0
      ? runnerTools.map((tool) => ({
          type: 'li',
          props: { id: `module-tool:${tool}`, 'data-tool': tool },
          css: { classes: clickableClasses(['module-tool']) },
          content: tool,
          handlers: [{ name: 'module-tool-select', event: 'click', body: () => { runnerHost?.selectTool(tool) } }],
        }))
      : [{ type: 'li', content: '(no module tools)' }]
  const toggles = GROUPS.map((g) => ({
    type: 'label',
    props: { id: `toggle:${g}`, 'data-group': g, 'data-on': 'false' },
    css: { classes: clickableClasses(['group-row']) },
    content: GROUP_LABELS[g],
    handlers: [{ name: `toggle-${g}`, event: 'click', body: TOGGLE_BODY }],
  }))
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'secure-panes' },
        children: [
          // ---- Security Settings pane -----------------------------------
          {
            type: 'section',
            props: { id: 'settings-pane' },
            css: { classes: ['card'] },
            children: [
              { type: 'h2', content: 'Security & agent permissions' },
              { type: 'p', css: { classes: ['hint'] }, content: 'Manual-UI only — never exposed over MCP (an agent cannot grant itself capabilities).' },
              { type: 'div', props: { id: 'security-status' }, content: 'loading…' },
              {
                type: 'div',
                props: { id: 'security-token' },
                children: [
                  { type: 'label', content: 'Loopback token' },
                  {
                    type: 'div',
                    css: { classes: ['token-row'] },
                    children: [
                      { type: 'input', props: { id: 'token-input', placeholder: '(none)', readonly: true } },
                      { type: 'button', props: { id: 'token-clear' }, css: { classes: clickableClasses(['btn']) }, content: 'Clear', handlers: [{ name: 'token-clear', event: 'click', body: TOKEN_CLEAR_BODY }] },
                      { type: 'button', props: { id: 'token-gen' }, css: { classes: clickableClasses(['btn']) }, content: 'Regenerate', handlers: [{ name: 'token-gen', event: 'click', body: TOKEN_GEN_BODY }] },
                    ],
                  },
                ],
              },
              { type: 'div', props: { id: 'group-toggles' }, children: toggles },
              {
                type: 'div',
                props: { id: 'journal-length' },
                css: { classes: ['group-row'] },
                children: [
                  { type: 'label', content: 'Max journal entries' },
                  {
                    type: 'div',
                    css: { classes: ['token-row'] },
                    children: [
                      { type: 'input', props: { id: 'journal-length-input', placeholder: '(never condense)', type: 'number', min: '1' } },
                      { type: 'button', props: { id: 'journal-length-apply' }, css: { classes: clickableClasses(['btn']) }, content: 'Apply', handlers: [{ name: 'journal-length-apply', event: 'click', body: JOURNAL_LENGTH_BODY }] },
                    ],
                  },
                ],
              },
            ],
          },
          // ---- Debug / agent-visibility pane -----------------------------
          {
            type: 'section',
            props: { id: 'debug-pane' },
            css: { classes: ['card'] },
            children: [
              { type: 'h2', content: 'Debug / agent visibility' },
              { type: 'div', props: { id: 'status' }, content: 'booting…' },
            ],
          },
          // ---- Module management pane (U8) --------------------------------
          {
            type: 'section',
            props: { id: 'module-pane' },
            css: { classes: ['card'] },
            children: [
              { type: 'h2', content: 'Modules / extensions' },
              { type: 'p', css: { classes: ['hint'] }, content: 'Manual-UI only — installed modules + versions + quarantine status.' },
              { type: 'div', props: { id: 'module-status' }, content: 'loading…' },
              { type: 'div', props: { id: 'module-list' }, content: '' },
              // ---- PG12 — operator-only module-tool runner ----------------
              {
                type: 'div',
                props: { id: 'module-runner' },
                children: [
                  { type: 'p', css: { classes: ['hint'] }, content: 'Operator-only module-tool runner — invokes a registered module tool through the module + code two-gate (never exposed over MCP).' },
                  { type: 'ul', props: { id: 'module-tool-list' }, children: runnerToolItems },
                  {
                    type: 'input',
                    props: { id: 'module-args-input', placeholder: 'args (JSON, optional)' },
                    css: { classes: clickableClasses() },
                    handlers: [{ name: 'module-args-input', event: 'input', body: (_ctx: unknown, value?: unknown) => { runnerHost?.setArgs(value === undefined ? '' : String(value)) } }],
                  },
                  { type: 'button', props: { id: 'module-run' }, css: { classes: clickableClasses(['btn']) }, content: 'Run tool', handlers: [{ name: 'module-run', event: 'click', body: () => { runnerHost?.run() } }] },
                  { type: 'div', props: { id: 'module-run-result' }, content: '' },
                ],
              },
            ],
          },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

const PREVIEW_MAX = 120

/** The isolated pane-graph owner. Renders the Security + Debug panes through
 *  its OWN GraphScope (isolated from the app graph), driven by the IPC bridge.
 *  Never an MCP surface — the MCP endpoints read the APP Runtime, which does
 *  not include this graph. */
export class SecurePanels {
  private scope: GraphScope
  private supervisor: Supervisor
  private adapter: DomAdapter
  private readonly mount: HTMLElement
  private root: unknown
  private nodes: unknown[]
  private prevMap: Map<string, unknown> | null = null
  private cfg: SecuritySettings = { token: null, enabled: ['read', 'dispatch'] }
  private debugValue = 'booting…'
  private moduleStatus = 'loading…'
  private moduleListText = ''
  // PG12 — the operator-only runner state (operator scope; never MCP-visible).
  private readonly moduleRunner: ModuleToolRunner | null
  private moduleSelectedTool = ''
  private moduleArgsRaw = ''
  private moduleRunResult = ''
  // W1-N10 — the in-flight runner promise (the production seam is async IPC).
  // The next render AWAITS it so the resolved result is displayed (never the
  // synchronous stringify of a Promise, which would render `ok: {}`).
  private pendingRun: Promise<void> | null = null

  /** Test/visibility accessor — the current Debug pane text (census + SSR
   *  preview). */
  debugText(): string {
    return this.debugValue
  }

  constructor(mount: HTMLElement, opts: SecurePanelsOptions = {}) {
    this.mount = mount
    this.moduleRunner = opts.moduleRunner ?? null
    // The runner control handlers reach this host via closures (in-process; the
    // isolated pane graph — never a window/MCP bridge).
    const runnerHost: ModuleRunnerHost = {
      listTools: () => this.moduleRunner?.listTools() ?? [],
      selectTool: (tool) => {
        this.moduleSelectedTool = tool
      },
      setArgs: (value) => {
        this.moduleArgsRaw = value
      },
      run: () => {
        this.runModuleTool()
      },
    }
    this.scope = createIsolatedScope()
    const hub = createLinkHub()
    const t = translateLegacy(paneEnvelope(runnerHost), { hub, graphScope: this.scope })
    this.supervisor = new Supervisor({ events: new EventBridge(), graphScope: this.scope })
    for (const n of t.nodes as unknown[]) this.supervisor.registerNode(n as never)
    this.adapter = new DomAdapter(mount, { onEvent: this.handleDomEvent })
    this.root = t.root
    this.nodes = t.nodes as unknown[]
  }

  /** PG12 — invoke the selected module tool through the injected two-gate seam
   *  (`invokeModuleTool` in production — module AND code). Fail-closed: an
   *  absent runner / no selection / malformed args / a gate denial / a throwing
   *  tool all surface as an `error:` result string, never a crash.
   *
   *  W1-N10 — the production seam is async IPC, so the run is kicked off here
   *  and tracked in `pendingRun`; `dispatch`/`handleDomEvent` await it before
   *  rendering the resolved result (a sync runner still resolves immediately). */
  private runModuleTool(): void {
    this.pendingRun = this.runModuleToolAsync()
  }

  private async runModuleToolAsync(): Promise<void> {
    if (!this.moduleRunner) {
      this.moduleRunResult = 'error: no module runner configured'
      return
    }
    if (!this.moduleSelectedTool) {
      this.moduleRunResult = 'error: no tool selected'
      return
    }
    const raw = this.moduleArgsRaw.trim()
    let args: unknown
    if (raw.length > 0) {
      try {
        args = JSON.parse(raw)
      } catch {
        this.moduleRunResult = `error: invalid JSON args: ${raw}`
        return
      }
    }
    try {
      const result = await this.moduleRunner.invoke(this.moduleSelectedTool, args)
      this.moduleRunResult = result === undefined ? 'ok' : `ok: ${stringifyRunResult(result)}`
    } catch (e) {
      this.moduleRunResult = `error: ${e instanceof Error ? e.message : String(e)}`
    }
  }

  /** W1-N10 — await the in-flight operator run (if any) so the next render
   *  reflects the resolved result. A no-op when nothing is pending. */
  private async awaitPendingRun(): Promise<void> {
    const pending = this.pendingRun
    this.pendingRun = null
    if (pending) await pending
  }

  /** Wire a real DOM interaction on a pane control to the pane graph's
   *  synthetic dispatch (mirrors the app Runtime's onEvent path). */
  private handleDomEvent = (wire: string, domEvent: Event): void => {
    const node = this.supervisor.getNode(wire)
    if (!node) return
    const eventName = domEvent?.type ?? String(domEvent ?? '')
    const extra = domEvent?.target && 'value' in domEvent.target
      ? [String((domEvent.target as HTMLInputElement).value)]
      : []
    this.supervisor.dispatchEvent(node.id, eventName, ...extra)
    void this.supervisor.flush().then(async () => {
      await this.awaitPendingRun()
      this.render()
      void this.refresh()
    })
  }

  /** The test seam: dispatch a synthetic click on a pane control by its
   *  authored props.id, in the PANE graph (never the app graph). */
  async dispatch(id: string): Promise<void> {
    const node = this.supervisor.allNodes().find((n) => (n.props as { id?: string })?.id === id)
    if (!node) throw new Error(`secure-panels: unresolved pane id '${id}'`)
    this.supervisor.dispatchEvent(node.id, 'click')
    await this.supervisor.flush()
    await this.awaitPendingRun()
    this.render()
    await this.refresh()
  }

  /** The Debug pane's live agent-visibility line: set from the APP runtime's
   *  census + SSR preview. Written into the pane graph's `#status` node (its
   *  own isolated graph — never the app graph). */
  refreshDebug(runtime: {
    renderedHtmlResult(): { census: { inTree?: unknown; registered?: unknown; unplaced?: unknown; destroyed?: unknown; prototypes?: unknown }; ssrHtml: unknown }
  }): void {
    const { census, ssrHtml } = runtime.renderedHtmlResult()
    const c = (v: unknown): string | number => (typeof v === 'number' && Number.isFinite(v) ? v : '?')
    const censusLine =
      `inTree ${c(census.inTree)} · registered ${c(census.registered)} · ` +
      `unplaced ${c(census.unplaced)} · destroyed ${c(census.destroyed)} · prototypes ${c(census.prototypes)}`
    const raw = typeof ssrHtml === 'string' ? ssrHtml : ''
    const collapsed = raw.replace(/\s+/g, ' ').trim()
    const preview = collapsed.length === 0
      ? '(empty)'
      : collapsed.length > PREVIEW_MAX
        ? collapsed.slice(0, PREVIEW_MAX) + '…'
        : collapsed
    this.debugValue = `${censusLine}\n${preview}`
    this.syncConfig()
    this.render()
  }

  /** Re-fetch the security config over IPC, merge it into the pane graph nodes,
   *  and re-render. Async (the bridge is async). */
  async refresh(): Promise<void> {
    const security = typeof window !== 'undefined' && window.provident?.security
    if (security) {
      try {
        this.cfg = await security.get()
      } catch {
        // keep the last-known config on a bridge error
      }
    }
    // U8 — read the module store status + list over the module bridge.
    const moduleBridge = typeof window !== 'undefined' && window.provident?.module
    if (moduleBridge) {
      try {
        const res = await moduleBridge.get()
        this.moduleStatus = `corrupt: ${res.corrupt} · quarantined: [${res.quarantined.join(', ')}] · loaded: [${res.loaded.join(', ')}]`
        this.moduleListText = res.modules
          .map((m) => `${m.disabled ? '☐' : '☑'} ${m.name}@${m.version}${m.quarantined ? ' (quarantined)' : ''}`)
          .join('\n')
      } catch {
        // keep the last-known module state on a bridge error
      }
    }
    this.syncConfig()
    this.render()
  }

  /** Write the current cfg into the pane graph nodes (token status, enabled
   *  groups, per-group toggle on/off) through the MANAGED CHANNEL (state-slice
   *  content + props writes), then the render reflects it. Never mutates a
   *  Node's derived fields directly. */
  private syncConfig(): void {
    for (const n of this.supervisor.allNodes()) {
      const id = (n.props as { id?: string })?.id
      const mutation: Array<{ targetProp: string; value: unknown; mode?: string }> = []
      if (id === 'security-status') {
        const jl = this.cfg.maxJournalLength !== undefined ? ` · journal: ≤${this.cfg.maxJournalLength}` : ' · journal: ∞'
        mutation.push({ targetProp: 'content', value: `token: ${this.cfg.token ? '••••' : '(none)'} · enabled: [${this.cfg.enabled.join(', ')}]${jl}` })
      } else if (id === 'status') {
        mutation.push({ targetProp: 'content', value: this.debugText })
      } else if (id === 'token-input') {
        mutation.push({ targetProp: 'content', value: this.cfg.token ?? '' })
      } else if (typeof id === 'string' && id.startsWith('toggle:')) {
        const g = id.slice('toggle:'.length)
        const on = this.cfg.enabled.includes(g)
        mutation.push({ targetProp: 'props.data-on', mode: 'replace', value: on ? 'true' : 'false' })
        mutation.push({ targetProp: 'content', value: `${on ? '☑' : '☐'} ${GROUP_LABELS[g]}` })
      } else if (id === 'journal-length-input') {
        mutation.push({ targetProp: 'props.value', mode: 'replace', value: this.cfg.maxJournalLength ?? '' })
      } else if (id === 'module-status') {
        mutation.push({ targetProp: 'content', value: this.moduleStatus })
      } else if (id === 'module-list') {
        mutation.push({ targetProp: 'content', value: this.moduleListText })
      } else if (id === 'module-run-result') {
        mutation.push({ targetProp: 'content', value: this.moduleRunResult })
      }
      if (mutation.length > 0) {
        this.supervisor.apply({ kind: 'state-slice', node: n, mutation })
      }
    }
  }

  /** Compile the pane graph root + re-render into the pane mount. */
  private render(): void {
    const cr = (this.root as { compile(nodes: unknown[]): { actionable: unknown[] } }).compile(this.nodes as never)
    this.supervisor.recordResolved(cr.actionable as never)
    const byNode = new Map(this.supervisor.allNodes().map((n) => [n.id, n]))
    const renderOptions: RenderOptions = { nodeIdAttribute: true, graphScope: this.scope }
    this.adapter.beginBatch()
    const dom = renderProducingProcess(cr.actionable as never, byNode as never, this.adapter, this.prevMap as never, renderOptions)
    this.adapter.endBatch()
    this.prevMap = dom.prevMap as unknown as Map<string, unknown>
  }
}
