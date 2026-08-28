// src/renderer/edit-controller.ts — Unit D: the edit controller
// (docs/specs/unit-d-editing.md §5.2/§5.3/§5.4). Pure (no Electron): the
// back-reference map, the injected `commit` (which sends IPC to main → the
// store), and `onRebuild` are injected, so the controller is testable in
// isolation. The controller does NOT hold the store — it holds the
// back-reference map (Unit C §5.3, `Map<ragNodeId, nodeId[]>`), and `commit`
// delegates to the injected `commit` (MCP/UI equivalence — §5.7).

export interface EditControllerOptions {
  /** The back-reference map (Unit C §5.3) — the SOLE authoritative carrier.
   *  `Map<ragNodeId, nodeId[]>` (SUBTREE-OWNERSHIP). */
  backRefs: Map<string, string[]>
  /** The RAG store access (via IPC to the main process — SINGLE-WRITER-STORE).
   *  The renderer never writes to the RAG store directly; it sends an IPC to
   *  main, which calls the store. Injected for testability. */
  commit: (nodeId: string, content: string) => Promise<CommitResult>
  /** Called to trigger a re-traversal (rebuild) after a store change. Injected
   *  for testability. */
  onRebuild: () => void
}

export type CommitResult =
  | { ok: true; nodeId: string }
  | { ok: false; reason: 'deleted-node' | 'store-error'; error?: string }

/** The discriminated caret state (Unit U4 §1.2 — decision B). A `textarea`
 *  caret is the existing Unit L shape PLUS the `kind` discriminator; a `rich`
 *  caret carries the RAG node id + a path-based anchor/focus edge into the
 *  decomposed inline children. Restored after a re-derive, gated by the node's
 *  RENDERED control type (amendment 4 — a textarea caret is never applied to a
 *  contenteditable node and vice versa). */
export type RichCaretEdge = {
  /** The child-index path from the contenteditable root element down to the
   *  target text node in the rendered inline-children subtree (the decomposed
   *  `content`/`children` render). Each element is the child index at that
   *  depth (0-based). `[]` addresses the root element itself (its direct text
   *  run); a non-empty path addresses the text node reached by following the
   *  child indices from the root. */
  path: number[]
  /** The character offset within the target text node. Clamped to the text
   *  node's length on restore. */
  offset: number
}

export type CaretState =
  | { kind: 'textarea'; offset: number; focused: boolean }
  | { kind: 'rich'; ragId: string; anchor: RichCaretEdge; focus: RichCaretEdge; focused: boolean }

export interface EditController {
  /** Mark a control dirty. A rebuild is QUEUED (not executed) while any control
   *  is dirty (dirty-edit guard). */
  markDirty(nodeId: string): void
  /** Clear a control's dirty flag. If a rebuild was queued by the dirty-edit
   *  guard and no control is dirty, the queued rebuild executes. */
  clearDirty(nodeId: string): void
  /** Whether a control is dirty. */
  isDirty(nodeId: string): boolean
  /** Whether ANY control is dirty. */
  anyDirty(): boolean
  /** Whether a node is editable (not a dangling back-reference). */
  isEditable(nodeId: string): boolean
  /** Commit a control's content on blur. Writes back to the RAG store via the
   *  back-reference. Refuses a write to a deleted node (dangling back-reference
   *  → read-only). */
  commit(nodeId: string, content: string): Promise<CommitResult>
  /** Request a rebuild. If any control is dirty, the rebuild is QUEUED (not
   *  executed). If no control is dirty, the rebuild executes immediately. */
  requestRebuild(): void
  /** Whether a rebuild is queued (waiting for the dirty-edit guard to clear). */
  hasQueuedRebuild(): boolean
  /** Save caret/focus state keyed by RAG node id. */
  saveCaret(nodeId: string, caret: CaretState): void
  /** Restore caret/focus state after a rebuild. Returns the saved state, or
   *  undefined if none was saved (or the node's back-reference is dangling —
   *  the RAG node was deleted). */
  restoreCaret(nodeId: string): CaretState | undefined
  /** Clear saved caret/focus state for a node. */
  clearCaret(nodeId: string): void
}

export function createEditController(opts: EditControllerOptions): EditController {
  const dirty = new Set<string>()
  let queuedRebuild = false
  const carets = new Map<string, CaretState>()

  return {
    markDirty(nodeId: string): void {
      dirty.add(nodeId)
    },
    clearDirty(nodeId: string): void {
      dirty.delete(nodeId)
      // If a rebuild was queued by the dirty-edit guard and no control is
      // dirty, execute the queued rebuild and clear the queue.
      if (queuedRebuild && dirty.size === 0) {
        queuedRebuild = false
        opts.onRebuild()
      }
    },
    isDirty(nodeId: string): boolean {
      return dirty.has(nodeId)
    },
    anyDirty(): boolean {
      return dirty.size > 0
    },
    isEditable(nodeId: string): boolean {
      // M8 — BEST-EFFORT backRefs check. The controller has no store access
      // (spec §5.2 options = { backRefs, commit, onRebuild }), so `isEditable`
      // is a proxy for `status().loadedNodes` and is UNSOUND in the
      // delete→re-traversal window (a deleted node's stale backRefs key → true;
      // a live-but-unrendered node absent from backRefs → false). The
      // AUTHORITATIVE deleted-node check lives in the injected `commit` (which
      // has store access via IPC) — `commit` refuses a write to a deleted node
      // (M9). This is a best-effort read-only hint for the form control.
      return opts.backRefs.has(nodeId)
    },
    async commit(nodeId: string, content: string): Promise<CommitResult> {
      // M9 — refuse a write to a non-editable (dangling back-reference) node
      // BEFORE delegating. The `edit-commit` IPC is NOT sent; the injected
      // commit is never called.
      if (!opts.backRefs.has(nodeId)) {
        // H5 — a deleted node can never commit successfully, so clear its dirty
        // flag (the edit is unrecoverable — the node is gone). Otherwise the
        // dirty-edit guard would permanently block every future re-derive.
        dirty.delete(nodeId)
        if (queuedRebuild && dirty.size === 0) {
          queuedRebuild = false
          opts.onRebuild()
        }
        return { ok: false, reason: 'deleted-node' }
      }
      const result = await opts.commit(nodeId, content)
      // L6 — on a successful commit, clear the node's dirty flag (which may
      // trigger a queued rebuild per §5.2).
      if (result.ok) {
        dirty.delete(nodeId)
        if (queuedRebuild && dirty.size === 0) {
          queuedRebuild = false
          opts.onRebuild()
        }
      }
      return result
    },
    requestRebuild(): void {
      if (dirty.size > 0) {
        // Dirty-edit guard: queue (coalesced — at most ONE queued rebuild).
        queuedRebuild = true
      } else {
        opts.onRebuild()
      }
    },
    hasQueuedRebuild(): boolean {
      return queuedRebuild
    },
    saveCaret(nodeId: string, caret: CaretState): void {
      carets.set(nodeId, caret)
    },
    restoreCaret(nodeId: string): CaretState | undefined {
      // A dangling back-reference (deleted node) clears the saved caret — no
      // restore. L5 — actually clear the stale caret from the map so a later
      // re-created node with the same id does not restore a stale caret.
      if (!opts.backRefs.has(nodeId)) {
        carets.delete(nodeId)
        return undefined
      }
      return carets.get(nodeId)
    },
    clearCaret(nodeId: string): void {
      carets.delete(nodeId)
    },
  }
}
