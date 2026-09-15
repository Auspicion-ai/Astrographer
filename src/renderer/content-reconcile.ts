// src/renderer/content-reconcile.ts — Unit U-STATE-1a: the PURE content
// reconciler (docs/specs/unit-u-state-1a-content-reconcile.md; gate
// docs/specs/u-state-1-content-repopulation-review.md A1–A3, A10, ADV-1).
//
// Computes the minimal content-root operations (added / replaced / removed /
// kept) that turn the previous materialization into the newly built traversal
// envelope, so the host can apply them through the managed channel instead of
// tearing the page down (C10). PURE — no Electron, no DOM.
//
// Adversarial hardening (RCA-3, 2026-09-11): R1 the shape projection includes
// authored props (excluding runtime `data-*` markers) so a props-only change is
// detected; R2 a content-only change that REMOVES a nested doc-child is
// detected via the previous/next subtree id-set difference (the payload's
// `changed` set alone cannot see a vanished id); R3/R4 malformed envelope shapes
// never produce a raw TypeError (F1's guard is the only throw; F2/F3/F6 skip).
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { plainRagId } from './cross-document-shared.js'
import { EDITOR_TOOLBAR_ID } from './pane-graph.js'

/** A previously materialized content root, carrying its subtree so the
 *  full-subgraph fallback can compare shapes. The previous roots are passed as
 *  `LegacyNodeData[]` (user-confirmed 2026-09-11) — NOT id-only. */
export type PreviousRoot = LegacyNodeData

/** The change descriptor from the `rag-store-changed` broadcast. */
export interface ReconcileChange {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}

/** A content root in a reconcile result: its stable authored css.id + the RAG
 *  node id it was materialized from. */
export interface MaterializedRoot {
  /** The authored css.id, e.g. `rag-<ragNodeId>`. */
  cssId: string
  /** The RAG node id (cssId minus the `rag-` prefix). */
  ragNodeId: string
}

export interface ReconcileInput {
  /** The previously materialized content roots, in render order, AS THEIR
   *  ENVELOPE NODES (so the fallback can compare subtree shape). */
  previous: PreviousRoot[]
  /** The newly built traversal envelope (`buildTraversal(...).envelope`). */
  next: LegacyInitialData
  /** The `rag-store-changed` payload when available; null on boot/template
   *  change or when a payload is unavailable (forces the fallback). */
  change: ReconcileChange | null
}

export interface ReconcileResult {
  /** Content roots in `next` that are NOT in `previous` (attach these). */
  added: MaterializedRoot[]
  /** Content roots present in BOTH, whose RAG subtree changed (replace these —
   *  whole-root replace v1). */
  replaced: MaterializedRoot[]
  /** Content roots in `previous` but NOT in `next` (detach/destroy these). */
  removed: MaterializedRoot[]
  /** Content roots present in BOTH and unchanged (leave untouched). */
  kept: MaterializedRoot[]
  /** True when the payload was insufficient and the result came from the
   *  full-subgraph comparison (ADV-1). */
  usedFallback: boolean
}

const RAG_PREFIX = 'rag-'
const PANE_PREFIX = 'pane-'

/** U-LIVE4 — the pinned empty-store landing root id (the `content[0]` root
 *  authored by `emptyStoreEnvelope`, runtime.ts's `LANDING_ROOT_ID`). A
 *  pane-like, document-unscoped content root (never a `rag-` document
 *  subtree). AD-2026-09-14-1/-2 — the reconciler admits it so a removed/
 *  replaced/kept landing is computed (Finding 1: the empty-boot landing is
 *  destroyed when the store fills) and a still-empty listing change drives a
 *  `replaced` (Finding 2). */
const LANDING_ROOT_ID = 'stage-landing'

/** W2-N11 — the deterministic stack-safety cap for the recursive content walks
 *  (`collectRagIds` / `shapeProjection` / `canonical`), mirroring the ADR-4
 *  / TOK-F1 stack-safety discipline. A hostile CIRCULAR or pathologically deep
 *  `children` (or prop) graph is BOUNDED here rather than throwing
 *  `RangeError: Maximum call stack size exceeded` — a deep walk returns a
 *  partial/truncated result instead (spec U-STATE-1a/1e §9 L2). Not reachable
 *  from a well-formed traversal envelope; this is the hostile-input DoS guard. */
const MAX_RECONCILE_DEPTH = 256

/** W2-N11 — the DETERMINISTIC sentinel a truncated shape projection returns once
 *  the `MAX_RECONCILE_DEPTH` cap is crossed (a hostile circular/deep `children`
 *  graph). A constant object keeps `shapeOf` (JSON.stringify) producing a
 *  STABLE truncated string, so two identical inputs still compare equal. */
const TRUNCATED_SHAPE: Record<string, boolean> = { __reconcileTruncated: true }

/** A root is a content root iff its authored props.id is a `rag-<id>` (RAG
 *  document subtree) OR a `pane-<id>` (an app-graph pane). Return its
 *  { cssId, ragNodeId } or null (F2 — non-string / missing id). */
function asContentRoot(node: LegacyNodeData | null | undefined): MaterializedRoot | null {
  const props = node?.props as Record<string, unknown> | undefined
  const id = props?.id
  if (typeof id !== 'string') return null
  if (id.startsWith(RAG_PREFIX) && id.length > RAG_PREFIX.length) {
    // §2.7 (H3/W2-N12) — the authored id may be document-scoped
    // (`rag-<documentId>--<ragId>`); `data-rag-node-id` carries the PLAIN ragId
    // (the payload-matching key). `plainRagId` falls back to the `id.slice(4)`
    // parse when the data prop is absent (the unscoped single-document path) and
    // rejects a non-root synthetic `rag-` id (the C20 owners box).
    const ragNodeId = plainRagId(props) ?? id.slice(RAG_PREFIX.length)
    return { cssId: id, ragNodeId }
  }
  // U-STATE-1b — pane roots (`pane-<id>`) are content roots too (reconciled so
  // their ctx-driven content refreshes without a full reload).
  if (id.startsWith(PANE_PREFIX) && id.length > PANE_PREFIX.length) {
    return { cssId: id, ragNodeId: id }
  }
  // U-LIVE8 — the pinned `editor-toolbar` root is a pane-like content root
  // (reconciled always-shape-compared like a pane, so its fresh
  // `disabled`/`data-mode` state re-materializes on the content re-derive).
  if (id === EDITOR_TOOLBAR_ID) {
    return { cssId: id, ragNodeId: id }
  }
  // AD-2026-09-14-1 (Finding 1) — the pinned empty-store `stage-landing` root
  // is a pane-like root too (document-unscoped, always-shape-compared). So the
  // reconcile computes removed/kept/replaced for it: on the natural first-import
  // path (empty boot → first doc imported → reDerive('content') → the landing is
  // in `previous` but NOT in `next`) it is emitted `removed` and destroyed —
  // no phantom `#stage-landing` persists in a now non-empty store. Previously
  // it was invisible to `asContentRoot` → never removed → a phantom ghost.
  if (id === LANDING_ROOT_ID) {
    return { cssId: id, ragNodeId: id }
  }
  return null
}

/** AD-2026-09-14-1/-2 — true for the pane-like, document-unscoped content
 *  roots that the N-root reconciler routes through the GLOBAL pane collections:
 *  `pane-`-prefixed app-graph panes, the pinned `editor-toolbar`, and the pinned
 *  empty-store `stage-landing`. Both the previous pass and the removed pass MUST
 *  agree on this classification so a pane-like root present in BOTH passes is
 *  `kept`/`replaced` (never `added`+`removed` — the pre-fix loop-order accident
 *  on the toolbar, U-LIVE8 AD-finding 1). */
function isPaneLikeRoot(cssId: string): boolean {
  return (
    (cssId.startsWith(PANE_PREFIX) && cssId.length > PANE_PREFIX.length) ||
    cssId === EDITOR_TOOLBAR_ID ||
    cssId === LANDING_ROOT_ID
  )
}

/** A node's PLAIN RAG id, if its authored id is a `rag-<id>` (non-empty id
 *  part). §2.7 (H3/W2-N12) — a document-scoped authored id
 *  (`rag-<documentId>--<ragId>`) recovers the plain ragId from its
 *  `data-rag-node-id` prop; the `id.slice(4)` fallback covers an absent prop
 *  (the unscoped single-document path). Non-`rag-` nodes (inline/textarea) stay
 *  null so `collectRagIds` keeps walking through them. */
function ragIdOf(node: LegacyNodeData | null | undefined): string | null {
  return plainRagId(node?.props as Record<string, unknown> | undefined)
}

function childrenOf(node: LegacyNodeData | null | undefined): LegacyNodeData[] {
  const c = node?.children
  return Array.isArray(c) ? (c.filter((x) => x != null) as LegacyNodeData[]) : []
}

/** Collect a root's RAG-node subtree ids (root-first), STOPPING at each nested
 *  `rag-` doc-child boundary. A nested `rag-` child's id IS added (so a change
 *  to a direct nested child marks its containing root), but its subtree is its
 *  own (collected via its own root entry). Non-rag descendants are walked
 *  through. Defensive against malformed `children` (never throws).
 *
 *  W2-N11 — stack-safe: `depth` is threaded and capped at `MAX_RECONCILE_DEPTH`
 *  so a hostile CIRCULAR or pathologically deep `children` graph is bounded
 *  (returns a partial id set) instead of throwing `RangeError`. */
function collectRagIds(node: LegacyNodeData, out: Set<string>, depth = 0): void {
  if (depth > MAX_RECONCILE_DEPTH) return
  const self = ragIdOf(node)
  if (self != null) out.add(self)
  for (const c of childrenOf(node)) {
    const cid = ragIdOf(c)
    if (cid != null) {
      // A nested `rag-` child is a doc-child root — include its id, stop here
      // (its own subtree is collected via its own payload root entry).
      out.add(cid)
      continue
    }
    collectRagIds(c, out, depth + 1)
  }
}

/** Canonicalize a value for a stable JSON projection (sorted object keys), so
 *  key-order differences do not falsely report a change (LOW-8). Non-JSON
 *  values degrade to their `String()` form.
 *
 *  W2-N11 — stack-safe: `depth` is threaded and capped at `MAX_RECONCILE_DEPTH`
 *  so a hostile circular/deep prop/content value is bounded (returns a
 *  truncated marker) instead of throwing `RangeError`. */
function canonical(value: unknown, depth = 0): unknown {
  if (depth > MAX_RECONCILE_DEPTH) return TRUNCATED_SHAPE
  if (value === null || typeof value !== 'object') return value === undefined ? null : value
  if (Array.isArray(value)) return value.map((v) => canonical(v, depth + 1))
  const obj = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(obj).sort()) out[k] = canonical(obj[k], depth + 1)
  return out
}

/** Props that are RUNTIME-minted (not authored) and must be excluded from the
 *  shape projection so they do not cause false changes. */
const RUNTIME_PROP_KEYS = new Set(['data-doc-head', 'data-node-id'])

/** Authored props for the shape projection: all `props` EXCEPT the runtime
 *  markers and the authored `id` (already projected as `id`). Authored `data-*`
 *  props (e.g. `data-current`, `data-document-id`) ARE included — a pane whose
 *  only change is an authored data marker (doc-nav current-highlight) must be
 *  detected (adversarial finding 4). */
function projectionProps(node: LegacyNodeData): Record<string, unknown> {
  const src = (node.props as Record<string, unknown> | undefined) ?? {}
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(src)) {
    if (k === 'id') continue
    if (RUNTIME_PROP_KEYS.has(k)) continue
    out[k] = src[k]
  }
  return out
}

/** A stable normalized projection of a subtree for shape comparison (A3/§3.3):
 *  id + type + content + children + authored props, RECURSIVELY, in canonical
 *  (sorted) form.
 *
 *  W2-N11 — stack-safe: `depth` is threaded and capped at `MAX_RECONCILE_DEPTH`
 *  so a hostile CIRCULAR or pathologically deep `children` graph is bounded
 *  (returns the deterministic `TRUNCATED_SHAPE` sentinel for the capped tail)
 *  instead of throwing `RangeError`. */
function shapeProjection(node: LegacyNodeData, depth = 0): unknown {
  if (depth > MAX_RECONCILE_DEPTH) return TRUNCATED_SHAPE
  return {
    id: (node?.props as { id?: unknown } | undefined)?.id ?? null,
    type: node?.type ?? null,
    content: canonical(node?.content ?? null),
    props: canonical(projectionProps(node)),
    children: childrenOf(node).map((c) => shapeProjection(c, depth + 1)),
  }
}

function shapeOf(node: LegacyNodeData): string {
  return JSON.stringify(shapeProjection(node))
}

/** Extract the content roots (in order) from an envelope's content payloads.
 *  Defensive: malformed `content` arrays are skipped, never thrown. */
function rootsOf(envelope: LegacyInitialData | null | undefined): {
  root: MaterializedRoot
  node: LegacyNodeData
}[] {
  const out: { root: MaterializedRoot; node: LegacyNodeData }[] = []
  const seen = new Set<string>()
  const payloads = envelope?.content
  if (!Array.isArray(payloads)) return out
  for (const payload of payloads) {
    const nodes = (payload as { content?: unknown } | null | undefined)?.content
    if (!Array.isArray(nodes)) continue
    for (const node of nodes) {
      if (node == null) continue
      const r = asContentRoot(node as LegacyNodeData)
      if (r == null) continue
      if (seen.has(r.cssId)) continue // F3 — first wins
      seen.add(r.cssId)
      out.push({ root: r, node: node as LegacyNodeData })
    }
  }
  return out
}

/** U-STATE-1e — a materialized content root scoped to its owning document (one
 *  per open document tab). Document-scoped so two documents sharing a RAG node
 *  are distinct roots. `.root` is the previously materialized root NODE
 *  (`LegacyNodeData`) so the landed content shape-compare is preserved. */
export interface DocumentRoot {
  documentId: string
  root: PreviousRoot
}

/** U-STATE-1e — the input to `reconcileDocumentRoots`. `next` is ONE traversal
 *  envelope PER OPEN DOCUMENT (the host calls `buildTraversal` once per document
 *  so each envelope is unambiguously scoped; `buildTraversal` unchanged). Render
 *  order = `documentIds` order. */
export interface NRootReconcileInput {
  previous: DocumentRoot[]
  next: { documentId: string; envelope: LegacyInitialData }[]
  change: ReconcileChange | null
  documentIds: string[]
}

/** U-STATE-1e — a result bucket entry scoped to its owning document (one per
 *  open document tab). Carries `documentId` so the same `cssId` materialized in
 *  two documents is unambiguous. Panes use `documentId: ''` (keyed by cssId
 *  only, §2.2 RULED). */
export interface ScopedRoot extends MaterializedRoot {
  documentId: string
}

/** U-STATE-1e — the N-root result. The four buckets are `ScopedRoot[]` (each
 *  entry carries its owning `documentId`); `identityReplaced` is the
 *  per-document identity replace bucket (a fork changed only the editing
 *  document's root). */
export interface NRootReconcileResult {
  added: ScopedRoot[]
  replaced: ScopedRoot[]
  removed: ScopedRoot[]
  kept: ScopedRoot[]
  usedFallback: boolean
  identityReplaced: { documentId: string; from: MaterializedRoot; to: MaterializedRoot }[]
}

/** Reconcile the content roots of a new traversal envelope against the
 *  previously materialized roots. PURE. */
export function reconcileContentRoots(input: ReconcileInput): ReconcileResult {
  // F1 — a null/malformed next, or a missing template.root OR missing content,
  // is the documented guard error (never a raw TypeError).
  if (
    input == null ||
    input.next == null ||
    (input.next as { template?: unknown }).template == null ||
    (input.next.template as { root?: unknown }).root == null ||
    (input.next as { content?: unknown }).content === undefined
  ) {
    throw new Error('reconcileContentRoots: next envelope with template.root and content required')
  }

  const prevList = Array.isArray(input.previous) ? input.previous.filter((n) => n != null) : []
  const prevByCssId = new Map<string, { root: MaterializedRoot; node: LegacyNodeData }>()
  for (const node of prevList) {
    const r = asContentRoot(node as LegacyNodeData)
    if (r == null) continue
    if (prevByCssId.has(r.cssId)) continue
    prevByCssId.set(r.cssId, { root: r, node: node as LegacyNodeData })
  }
  const nextList = rootsOf(input.next)
  const nextByCssId = new Map(nextList.map((e) => [e.root.cssId, e]))

  // F6 — a malformed change descriptor is treated as absent (fallback).
  const raw = input.change as ReconcileChange | null | undefined
  const change: ReconcileChange | null =
    raw != null && Array.isArray(raw.nodeIds) && Array.isArray(raw.edgeIds) && (raw.kind === 'content' || raw.kind === 'structural')
      ? raw
      : null

  // ADV-1 — the fallback runs for a null/malformed change, a structural change,
  // or any edge-bearing change. The payload is still UNIONED in (MEDIUM-5), not
  // discarded, so a payload hit is never lost.
  const structuralAmbiguity = change != null && (change.kind === 'structural' || change.edgeIds.length > 0)
  const useFallback = change == null || structuralAmbiguity

  const changed = new Set(change?.nodeIds ?? [])

  const added: MaterializedRoot[] = []
  const replaced: MaterializedRoot[] = []
  const removed: MaterializedRoot[] = []
  const kept: MaterializedRoot[] = []

  // added — roots in next not in previous (exact set difference).
  for (const e of nextList) {
    if (!prevByCssId.has(e.root.cssId)) added.push(e.root)
  }
  // removed — roots in previous not in next (F4 — set difference wins).
  for (const node of prevList) {
    const r = asContentRoot(node as LegacyNodeData)
    if (r == null) continue
    if (!nextByCssId.has(r.cssId) && !removed.some((x) => x.cssId === r.cssId)) removed.push(r)
  }
  // shared — kept vs replaced.
  for (const e of nextList) {
    const prev = prevByCssId.get(e.root.cssId)
    if (prev == null) continue
    const prevIds = new Set<string>()
    collectRagIds(prev.node, prevIds)
    const nextIds = new Set<string>()
    collectRagIds(e.node, nextIds)
    // R2 — a removed/added nested id (symmetric difference) is a change even
    // when the payload only reports a vanished id.
    let idSetChanged = false
    for (const id of prevIds) if (!nextIds.has(id)) { idSetChanged = true; break }
    if (!idSetChanged) for (const id of nextIds) if (!prevIds.has(id)) { idSetChanged = true; break }
    // Payload hit — any changed id anywhere in either subtree (ancestor roots).
    let payloadHit = false
    for (const id of changed) if (prevIds.has(id) || nextIds.has(id)) { payloadHit = true; break }
    // MEDIUM-5 — union: fallback is used IN ADDITION to the payload, never
    // instead of it. Pane roots (`pane-`) are ALWAYS shape-compared: their
    // content is driven by the host `PaneContext`, not by the RAG id payload.
    const shapeChanged = shapeOf(prev.node) !== shapeOf(e.node)
    const isPane = !e.root.cssId.startsWith(RAG_PREFIX)
    const isReplaced = payloadHit || idSetChanged || ((useFallback || isPane) && shapeChanged)
    if (isReplaced) replaced.push(e.root)
    else kept.push(e.root)
  }

  return { added, replaced, removed, kept, usedFallback: useFallback }
}

/** U-STATE-1e — reconcile N document-scoped content roots (one group per open
 *  document tab) + the per-root identity replace (the Option-C fork: the editing
 *  document's root `rag-X` → `rag-X′`, other documents' `rag-X` kept). PURE.
 *
 *  Classification is keyed by `(documentId, cssId)`: `added`/`removed`/`kept`
 *  are computed per document (`prevByDoc` vs `nextByDoc`), so a root moving A→B
 *  is `removed` from A AND `added` to B (never a global `kept`), and a shared
 *  RAG node materialized in two documents is two distinct roots (§3 state 5a).
 *  The identity `consumed` payload suppression is global (a fork's payload ids
 *  must not re-mark another document's shared root — state 6), while the
 *  `identFrom`/`identTo` bucket filters are keyed by `(documentId, cssId)` so
 *  A's identity replace never suppresses B's own same-cssId add (H2a) or remove
 *  (H2b).
 *
 *  `documentIds` scopes the traversal envelopes (de-duped first-wins, L1): a
 *  `next` entry for a non-open document is ignored (F5); a `documentId` in
 *  `documentIds` absent from `next` yields no roots (F1, never throws). A
 *  malformed considered envelope is the documented guard throw (F3, the 1a F1
 *  precedent). Panes (`pane-`) are content roots reconciled separately
 *  (shape-compared always, cssId-keyed, `documentId: ''`) and are never
 *  attributed to a document (F7). */
export function reconcileDocumentRoots(input: NRootReconcileInput): NRootReconcileResult {
  if (input == null || input.next == null || !Array.isArray(input.next)) {
    throw new Error('reconcileDocumentRoots: next envelopes array required')
  }
  // L1 — de-dupe documentIds (first occurrence wins) before the ordered traverse.
  const documentIds = Array.isArray(input.documentIds)
    ? [...new Set(input.documentIds.filter((d): d is string => typeof d === 'string'))]
    : []
  const openDocs = new Set(documentIds)
  const prevList = Array.isArray(input.previous) ? input.previous.filter((r) => r != null) : []

  const entries = input.next.filter(
    (e): e is { documentId: string; envelope: LegacyInitialData } =>
      e != null && openDocs.has(e.documentId),
  )
  // F3 — a malformed considered envelope is the documented guard throw (never a
  // raw TypeError deeper in the shape walk).
  for (const e of entries) {
    const env = e.envelope as { template?: { root?: unknown }; content?: unknown } | null | undefined
    if (
      env == null ||
      env.template == null ||
      env.template.root == null ||
      env.content === undefined
    ) {
      throw new Error('reconcileDocumentRoots: next envelope with template.root and content required')
    }
  }

  // Previous roots: panes are `cssId`-keyed globally (never document-scoped,
  // F7); document roots are keyed `(documentId, cssId)` first-wins (F4).
  const panePrevByCssId = new Map<string, { root: MaterializedRoot; node: LegacyNodeData }>()
  const prevByDoc = new Map<string, Map<string, { root: MaterializedRoot; node: LegacyNodeData }>>()
  for (const r of prevList) {
    const cd = asContentRoot(r.root as LegacyNodeData)
    if (cd == null) continue
    // AD-2026-09-14-1 (Finding 1) — route the pinned `editor-toolbar` as a pane
    // in the PREVIOUS pass too, so previous and next routing AGREE. Before this
    // fix the toolbar (not `pane-`-prefixed) fell to `prevByDoc` in the previous
    // pass while the NEXT pass routed it as a pane (`paneNextByCssId`), so `prev`
    // was empty for it → `added` AND the removed pass failed to find it in next →
    // `removed`: destroyed+reattached on EVERY content reconcile (violating
    // P-TP-1/P-TP-2 "kept when unchanged" / "destroyed only on replaced").
    // AD-2026-09-14-2/-3 — the empty-store `stage-landing` is pane-like here too
    // (isPaneLikeRoot), so a landing present in BOTH previous/next (a still-empty
    // re-derive with a changed stores/listing body) routes through the SAME
    // global pane collection and becomes `replaced` when its shape changed —
    // never `added`+`removed`.
    if (isPaneLikeRoot(cd.cssId)) {
      if (!panePrevByCssId.has(cd.cssId)) {
        panePrevByCssId.set(cd.cssId, { root: cd, node: r.root as LegacyNodeData })
      }
      continue
    }
    // U-STATE-1e §4 F2/F5/F8 — a previous document root whose non-empty
    // `documentId` is NOT in `documentIds` is out of the N-root set: exclude it
    // from ALL buckets (added/replaced/removed/kept), never emit it as
    // `removed`. Panes (documentId `''`) are handled above and stay
    // document-unscoped.
    if (r.documentId !== '' && !openDocs.has(r.documentId)) continue
    let docMap = prevByDoc.get(r.documentId)
    if (docMap == null) {
      docMap = new Map()
      prevByDoc.set(r.documentId, docMap)
    }
    if (!docMap.has(cd.cssId)) docMap.set(cd.cssId, { root: cd, node: r.root as LegacyNodeData })
  }

  interface NextEntry {
    documentId: string
    root: MaterializedRoot
    node: LegacyNodeData
    isPane: boolean
  }

  // The ordered next roots: documentIds (de-duped) order, then next-entry order,
  // then payload order (the render order — buckets follow `next`). Duplicate
  // `(documentId, cssId)` roots are first-wins; panes are de-duped globally.
  const orderedNext: NextEntry[] = []
  const nextByDoc = new Map<string, Map<string, NextEntry>>()
  const paneNextByCssId = new Map<string, NextEntry>()
  for (const d of documentIds) {
    for (const e of entries) {
      if (e.documentId !== d) continue
      for (const x of rootsOf(e.envelope)) {
        const isPane = !x.root.cssId.startsWith(RAG_PREFIX)
        if (isPane) {
          if (paneNextByCssId.has(x.root.cssId)) continue
          const entry: NextEntry = { documentId: '', root: x.root, node: x.node, isPane }
          paneNextByCssId.set(x.root.cssId, entry)
          orderedNext.push(entry)
          continue
        }
        let docMap = nextByDoc.get(d)
        if (docMap == null) {
          docMap = new Map()
          nextByDoc.set(d, docMap)
        }
        if (docMap.has(x.root.cssId)) continue
        const entry: NextEntry = { documentId: d, root: x.root, node: x.node, isPane }
        docMap.set(x.root.cssId, entry)
        orderedNext.push(entry)
      }
    }
  }

  const raw = input.change as ReconcileChange | null | undefined
  const change: ReconcileChange | null =
    raw != null &&
    Array.isArray(raw.nodeIds) &&
    Array.isArray(raw.edgeIds) &&
    (raw.kind === 'content' || raw.kind === 'structural')
      ? raw
      : null
  const changed = new Set(change?.nodeIds ?? [])
  const useFallback = change == null || change.kind === 'structural' || change.edgeIds.length > 0

  // Per-root identity replace, DOCUMENT-SCOPED (F7 excludes panes; §3 state 6):
  // a vanished same-document previous root paired with a new next root when the
  // payload names BOTH ids. `consumed` suppresses the payload globally (state 6:
  // a fork in A leaves B's shared `rag-X` kept); the bucket filters are keyed by
  // `(documentId, cssId)` so A's identity replace never suppresses B's own add
  // (H2a) or remove (H2b).
  const identityReplaced: { documentId: string; from: MaterializedRoot; to: MaterializedRoot }[] = []
  const consumed = new Set<string>()
  const identFromKeys = new Set<string>()
  const identToKeys = new Set<string>()
  for (const d of documentIds) {
    const prevDoc = prevByDoc.get(d)
    const nextDoc = nextByDoc.get(d)
    if (prevDoc == null || nextDoc == null) continue
    const prevCss = new Set(prevDoc.keys())
    const nextCssForDoc = new Set(nextDoc.keys())
    const vanished = [...prevDoc.values()].filter((x) => !nextCssForDoc.has(x.root.cssId))
    const appeared = [...nextDoc.values()].filter((x) => !prevCss.has(x.root.cssId))
    const usedFrom = new Set<string>()
    for (const to of appeared) {
      if (!changed.has(to.root.ragNodeId)) continue
      const from = vanished.find((v) => changed.has(v.root.ragNodeId) && !usedFrom.has(v.root.cssId))
      if (from == null) continue
      usedFrom.add(from.root.cssId)
      identityReplaced.push({ documentId: d, from: from.root, to: to.root })
      consumed.add(to.root.ragNodeId)
      consumed.add(from.root.ragNodeId)
      identFromKeys.add(`${d}|${from.root.cssId}`)
      identToKeys.add(`${d}|${to.root.cssId}`)
    }
  }
  const effectiveChanged = new Set<string>()
  for (const id of changed) if (!consumed.has(id)) effectiveChanged.add(id)

  const added: ScopedRoot[] = []
  const replaced: ScopedRoot[] = []
  const kept: ScopedRoot[] = []
  for (const x of orderedNext) {
    // The identity target is reported only through `identityReplaced`, not also
    // as `added`/`replaced` (keyed by (documentId, cssId) — H2a).
    const key = `${x.documentId}|${x.root.cssId}`
    if (!x.isPane && identToKeys.has(key)) continue
    const prev = x.isPane
      ? panePrevByCssId.get(x.root.cssId)
      : prevByDoc.get(x.documentId)?.get(x.root.cssId)
    const scoped: ScopedRoot = {
      cssId: x.root.cssId,
      ragNodeId: x.root.ragNodeId,
      documentId: x.documentId,
    }
    if (prev == null) {
      added.push(scoped)
      continue
    }
    const prevIds = new Set<string>()
    collectRagIds(prev.node, prevIds)
    const nextIds = new Set<string>()
    collectRagIds(x.node, nextIds)
    // R2 — a removed/added nested id (symmetric difference) is a change.
    let idSetChanged = false
    for (const id of prevIds) if (!nextIds.has(id)) { idSetChanged = true; break }
    if (!idSetChanged) for (const id of nextIds) if (!prevIds.has(id)) { idSetChanged = true; break }
    // Payload hit — any effective-changed id anywhere in either subtree.
    let payloadHit = false
    for (const id of effectiveChanged) if (prevIds.has(id) || nextIds.has(id)) { payloadHit = true; break }
    // W2 (U-STATE-1e adversarial) — a root that is materialized from a subtree
    // carrying a fork-consumed id (a CROSS-document fork-echo: ANOTHER document
    // forked a shared root this root references, and its id is globally
    // consumed) must NOT silently swallow an indepdentent content edit. In the
    // echo (state 6) the root's own shape is UNCHANGED so it stays `kept`;
    // consume the shape comparison when the root carries a consumed id so a
    // genuine same-broadcast edit to the shared root in THIS document flips it
    // to `replaced` instead of being lost.
    let carriesConsumedId = false
    for (const id of prevIds) if (consumed.has(id)) { carriesConsumedId = true; break }
    if (!carriesConsumedId) for (const id of nextIds) if (consumed.has(id)) { carriesConsumedId = true; break }
    // MEDIUM-5 — fallback is used IN ADDITION to the payload. Pane roots are
    // ALWAYS shape-compared (their content is host-driven, not RAG-payload).
    const shapeChanged = shapeOf(prev.node) !== shapeOf(x.node)
    const useShape = useFallback || x.isPane || carriesConsumedId
    const isReplaced = payloadHit || idSetChanged || (useShape && shapeChanged)
    if (isReplaced) replaced.push(scoped)
    else kept.push(scoped)
  }

  // removed — previous roots whose `(documentId, cssId)` key is not in `next`
  // (per-document set difference), deduped first-wins, in `previous` order. A
  // key consumed by an identity replace in the SAME document is excluded (H2b);
  // another document's same-cssId key is not.
  const removed: ScopedRoot[] = []
  const removedKeys = new Set<string>()
  for (const r of prevList) {
    const cd = asContentRoot(r.root as LegacyNodeData)
    if (cd == null) continue
    // AD-2026-09-14-1 — the pinned `editor-toolbar` (+ the empty-store
    // `stage-landing`, AD-2026-09-14-2/-3) is classified pane-like here too, so
    // `inNext` checks `paneNextByCssId` (where the next pass routes it) and a
    // kept toolbars/landing is never emitted `removed`.
    const isPane = isPaneLikeRoot(cd.cssId)
    // U-STATE-1e §4 F2/F5/F8 — a previous document root whose non-empty
    // `documentId` is not open is DROPPED from the result (never emitted as
    // `removed`) on a content/null reconcile: the host detaches/holds the stale
    // mount (9b mount policy). A STRUCTURAL change that closed the document DOES
    // report it as `removed` so the host destroys it (§3 state 4). Panes
    // (documentId `''`) are not document-scoped and are classified as before.
    if (!isPane && r.documentId !== '' && !openDocs.has(r.documentId)) {
      const structuralClose = change != null && change.kind === 'structural'
      if (!structuralClose) continue
    }
    const documentId = isPane ? '' : r.documentId
    const key = `${documentId}|${cd.cssId}`
    const inNext = isPane
      ? paneNextByCssId.has(cd.cssId)
      : (nextByDoc.get(r.documentId)?.has(cd.cssId) ?? false)
    if (inNext) continue
    if (identFromKeys.has(key)) continue
    if (removedKeys.has(key)) continue
    removedKeys.add(key)
    removed.push({ cssId: cd.cssId, ragNodeId: cd.ragNodeId, documentId })
  }

  return { added, replaced, removed, kept, usedFallback: useFallback, identityReplaced }
}
