// src/shared/document-tree.ts — U-D4 (docs/specs/unit-ud4-doc-heads-tree.md
// §5.3/§5.4). PURE + TOTAL. No Electron, no fs, no store, no DOM, no
// provident-ssr. Derives a folder/leaf tree from the doc-heads payload entries
// and provides the category-scoped selection. DEPTH-SAFE: the tree build and
// its sibling sort are ITERATIVE (explicit stack), so no finite path depth can
// overflow the call stack (F1).
import type { RagDocHeadsPayload } from './types.js'

/** One doc-head entry — the payload's element shape (single source of truth). */
export type DocHead = RagDocHeadsPayload['documents'][number]

/** A derived FOLDER node — a prefix group of document paths. */
export interface DocumentFolderNode {
  kind: 'folder'
  /** The folder's own sanitized segment (its label, NOT the full path). */
  label: string
  /** The folder's full path INCLUDING this segment. */
  path: string[]
  /** Deterministically sorted child folders + document leaves (never empty). */
  children: DocumentTreeNode[]
}

/** A derived DOCUMENT LEAF node. */
export interface DocumentLeafNode {
  kind: 'document'
  /** The document's basename — the last `/`-segment of `documentId`. */
  label: string
  /** The document's corpus-relative directory path (the payload `path`). */
  path: string[]
  /** The document's path-qualified id. */
  documentId: string
  /** The doc-head title (`''` when absent). */
  title: string
  /** The document's tags (`[]` when absent). */
  tags: string[]
}

export type DocumentTreeNode = DocumentFolderNode | DocumentLeafNode

/** A normalized entry — the safe subset derived from a potentially-malformed
 *  input entry. */
interface NormalizedDoc {
  documentId: string
  path: string[]
  title: string
  tags: string[]
}

/** Normalize one input entry; returns null when the entry must be skipped
 *  (a skipped entry creates no folder — F8). Totality guard: never throws. */
function normalizeDoc(raw: unknown): NormalizedDoc | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const entry = raw as Record<string, unknown>
  const documentId = entry.documentId
  if (typeof documentId !== 'string' || documentId === '') return null
  // `path`: a non-array → []; otherwise collect non-empty string members,
  // truncating at the first non-string/empty member (never invent a segment).
  const path: string[] = []
  if (Array.isArray(entry.path)) {
    for (const seg of entry.path) {
      if (typeof seg !== 'string' || seg === '') break
      path.push(seg)
    }
  }
  const title = typeof entry.title === 'string' ? entry.title : ''
  // `tags`: a non-array → []; otherwise keep only string members in order.
  const tags: string[] = []
  if (Array.isArray(entry.tags)) {
    for (const tag of entry.tags) {
      if (typeof tag === 'string') tags.push(tag)
    }
  }
  return { documentId, path, title, tags }
}

/** The sibling sort key: a folder's full path joined vs a leaf's documentId. */
function sortKey(n: DocumentTreeNode): string {
  return n.kind === 'folder' ? n.path.join('/') : n.documentId
}

/** The pinned sibling comparator: label, then full id, then folder-first. */
function bySibling(a: DocumentTreeNode, b: DocumentTreeNode): number {
  const byLabel = a.label.localeCompare(b.label)
  if (byLabel !== 0) return byLabel
  const byId = sortKey(a).localeCompare(sortKey(b))
  if (byId !== 0) return byId
  if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1 // folder first
  return 0 // stable
}

/** Sort every node's children in place using an EXPLICIT STACK (iterative
 *  post-order) — DEPTH-SAFE: the walk is bounded by heap, not the call stack,
 *  so a path of any finite depth (e.g. 10 000 segments) cannot overflow. The
 *  comparator only reads each node's own label/id, so sorting a level before
 *  descending yields the same order as the recursive form. */
function sortChildren(nodes: DocumentTreeNode[]): void {
  const stack: DocumentTreeNode[][] = [nodes]
  while (stack.length > 0) {
    const level = stack.pop() as DocumentTreeNode[]
    level.sort(bySibling)
    for (const n of level) {
      if (n.kind === 'folder') stack.push(n.children)
    }
  }
}

/** Prefix-group `docs` into a deterministic folder/leaf tree. TOTAL. */
export function buildDocumentTree(docs: DocHead[]): DocumentTreeNode[] {
  if (!Array.isArray(docs)) return []
  const root: DocumentTreeNode[] = []
  for (const raw of docs) {
    const doc = normalizeDoc(raw)
    if (doc == null) continue // F8 — a skipped entry creates no folder
    // Walk/create the folder chain for the normalized path.
    let level = root
    let ancestors: string[] = []
    for (const segment of doc.path) {
      ancestors = [...ancestors, segment]
      let folder = level.find(
        (n): n is DocumentFolderNode => n.kind === 'folder' && n.label === segment,
      )
      if (!folder) {
        folder = { kind: 'folder', label: segment, path: ancestors, children: [] }
        level.push(folder)
      }
      level = folder.children
    }
    // Leaf attach under the folder chain.
    const label = doc.documentId.split('/').pop() ?? doc.documentId
    level.push({
      kind: 'document',
      label,
      path: doc.path,
      documentId: doc.documentId,
      title: doc.title,
      tags: doc.tags,
    })
  }
  sortChildren(root)
  return root
}

/** The documentIds whose `path` starts with `prefix` (element-wise), deduped +
 *  sorted by documentId ascending. `prefix: []` = ALL documents (the root
 *  category). Never throws. */
export function selectDocumentIdsByPathPrefix(docs: DocHead[], prefix: string[]): string[] {
  if (!Array.isArray(docs)) return []
  const normPrefix = Array.isArray(prefix) ? prefix : []
  const seen = new Set<string>()
  const ids: string[] = []
  for (const raw of docs) {
    const doc = normalizeDoc(raw)
    if (doc == null) continue
    if (normPrefix.length > doc.path.length) continue
    let matches = true
    for (let i = 0; i < normPrefix.length; i++) {
      if (normPrefix[i] !== doc.path[i]) {
        matches = false
        break
      }
    }
    if (!matches) continue
    if (seen.has(doc.documentId)) continue
    seen.add(doc.documentId)
    ids.push(doc.documentId)
  }
  ids.sort((a, b) => a.localeCompare(b))
  return ids
}
