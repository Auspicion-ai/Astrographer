// src/renderer/rich-eligibility.ts — Unit U3: the PURE rich-text editing
// eligibility gate (docs/specs/unit-u3-rich-eligibility-splice.md §1.2/§2/§3).
//
// PURE + DETERMINISTIC — `isRichEditableRoot` depends ONLY on its two
// arguments; the same `(type, ownsDocChildren)` pair ALWAYS returns the same
// boolean. No Electron, no DOM, no host state — the ENTIRE eligibility contract
// is node-testable. It decides whether a RAG subtree root may host a
// `contenteditable` editor: true iff `type ∈ EDITABLE_TYPES` AND `!ownsDocChildren`.
// A node that owns a doc-child (a direct child carrying a `rag-`-prefixed
// authored id) is NOT eligible — a container with nested document content is not
// a single rich-text leaf. INLINE children (strong/em/a/img, authored
// `inline-<ragId>-<n>`) are NOT `rag-`-prefixed, so they never set
// `ownsDocChildren` — that is the PRIMARY rich-text case.
import type { RagNodeType } from '../main/rag-store.js'

/** The closed set of rich-editable RAG node types — decision E (§1.2, §3).
 *  9 members: h1–h6 (6) + p + blockquote + div. Every other `RagNodeType`
 *  member falls back to the textarea. */
export const EDITABLE_TYPES: ReadonlySet<RagNodeType> = new Set<RagNodeType>([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'div',
])

/** PURE — whether a RAG subtree root (by its `RagNodeType`) may host a
 *  `contenteditable` editor. `ownsDocChildren` is true when the root has a
 *  direct doc-child (a child carrying a `rag-`-prefixed authored id). Returns
 *  true iff `type ∈ EDITABLE_TYPES` AND `!ownsDocChildren`. TOTAL — never
 *  throws; a non-member type string is not in `EDITABLE_TYPES` → false. */
export function isRichEditableRoot(type: RagNodeType, ownsDocChildren: boolean): boolean {
  return EDITABLE_TYPES.has(type) && !ownsDocChildren
}
