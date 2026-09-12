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

/** A root is a content root iff its authored props.id is a `rag-<id>` (RAG
 *  document subtree) OR a `pane-<id>` (an app-graph pane). Return its
 *  { cssId, ragNodeId } or null (F2 — non-string / missing id). */
function asContentRoot(node: LegacyNodeData | null | undefined): MaterializedRoot | null {
  const id = (node?.props as { id?: unknown } | undefined)?.id
  if (typeof id !== 'string') return null
  if (id.startsWith(RAG_PREFIX) && id.length > RAG_PREFIX.length) {
    return { cssId: id, ragNodeId: id.slice(RAG_PREFIX.length) }
  }
  // U-STATE-1b — pane roots (`pane-<id>`) are content roots too (reconciled so
  // their ctx-driven content refreshes without a full reload).
  if (id.startsWith(PANE_PREFIX) && id.length > PANE_PREFIX.length) {
    return { cssId: id, ragNodeId: id }
  }
  return null
}

/** A node's authored id, if it is a `rag-<id>` (non-empty id part). */
function ragIdOf(node: LegacyNodeData | null | undefined): string | null {
  const id = (node?.props as { id?: unknown } | undefined)?.id
  if (typeof id !== 'string' || !id.startsWith(RAG_PREFIX) || id.length === RAG_PREFIX.length) return null
  return id.slice(RAG_PREFIX.length)
}

function childrenOf(node: LegacyNodeData | null | undefined): LegacyNodeData[] {
  const c = node?.children
  return Array.isArray(c) ? (c.filter((x) => x != null) as LegacyNodeData[]) : []
}

/** Collect a root's RAG-node subtree ids (root-first), STOPPING at each nested
 *  `rag-` doc-child boundary. A nested `rag-` child's id IS added (so a change
 *  to a direct nested child marks its containing root), but its subtree is its
 *  own (collected via its own root entry). Non-rag descendants are walked
 *  through. Defensive against malformed `children` (never throws). */
function collectRagIds(node: LegacyNodeData, out: Set<string>): void {
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
    collectRagIds(c, out)
  }
}

/** Canonicalize a value for a stable JSON projection (sorted object keys), so
 *  key-order differences do not falsely report a change (LOW-8). Non-JSON
 *  values degrade to their `String()` form. */
function canonical(value: unknown): unknown {
  if (value === null || typeof value !== 'object') return value === undefined ? null : value
  if (Array.isArray(value)) return value.map((v) => canonical(v))
  const obj = value as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(obj).sort()) out[k] = canonical(obj[k])
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
 *  (sorted) form. */
function shapeProjection(node: LegacyNodeData): unknown {
  return {
    id: (node?.props as { id?: unknown } | undefined)?.id ?? null,
    type: node?.type ?? null,
    content: canonical(node?.content ?? null),
    props: canonical(projectionProps(node)),
    children: childrenOf(node).map((c) => shapeProjection(c)),
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
