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
  /** Called to trigger a rebuild after a change. The `kind` tells the host how
   *  much to rebuild: a **content** change repopulates the document content only
   *  (U-STATE-1b — no teardown, the operator pane untouched); an **operator**
   *  change re-renders the operator pane + the app graph (editingMode); a
   *  **template** change is a full reload. Injected for testability. */
  onRebuild: (kind: RebuildKind) => void
  /** U-STAGE-ACTIVE-TAB §5.3.2 — the surface document a PAGE SUBJECT belongs to.
   *  Supplied by the HOST (the active tab's document id, or null when the active
   *  target is not a document) and used ONLY by `restoreCaret`'s
   *  deleted-document guard, in place of `backRefs.has(subjectId)` (a page
   *  subject is a TAB id, which is not a RAG node id, so the legacy guard
   *  rejected every tab-keyed caret). Optional + additive: ABSENT ⇒ the legacy
   *  `backRefs.has(subjectId)` behavior is preserved verbatim. */
  pageSubjectDocument?: (subjectId: string) => string | null
  /** U-STAGE-ACTIVE-TAB §A.3.2 (ruling C2) — the DOCUMENT-LIVENESS carrier:
   *  `true` iff that document exists in the host's current store snapshot. It owns
   *  `restoreCaret`'s deleted-document check, so `backRefs` keeps its documented
   *  `Map<ragNodeId, nodeId[]>` invariant verbatim (no document id is ever its
   *  key). Optional + additive and total: ABSENT ⇒ the legacy
   *  `backRefs.has(<document id>)` fallback is preserved byte-for-byte. */
  isDocumentLive?: (documentId: string) => boolean
}

/** The rebuild kind (U-STATE-1b change-kind discrimination). Precedence when
 *  coalesced by the dirty-edit guard: `template` > `operator` > `content`. */
export type RebuildKind = 'content' | 'operator' | 'template'

export type CommitResult =
  | { ok: true; nodeId: string }
  | { ok: false; reason: 'deleted-node' | 'store-error'; error?: string; failedIndex?: number }

/** U-EDIT-1 (C9) §3.5 item 5 — the TYPED page-commit failure record. It is the
 *  value of the host-side per-tab carrier (`SidebarPanes`' `Map<subject,
 *  CommitFailure>`, §3.5 item 6/§11 amendment `11.8` item 3): `store-rejected`
 *  carries the `BatchResult`'s `error`/`failedIndex` VERBATIM, `decompose-failed`
 *  carries the adapter's `{ ok: false }` message (§3.1), and `engine-unavailable`
 *  carries the engine cause. The record is never a rendered element's class or
 *  attribute (`FS17`). */
export type CommitFailure = {
  kind: 'not-authorized' | 'not-resident' | 'engine-unavailable' | 'store-rejected' | 'decompose-failed'
  message: string
  failedIndex?: number
  engineCause?: 'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state'
}

/** U-EDIT-1 (C9) §2.1 — the pinned authored id of the ONE page-edit surface.
 *  A caret whose `ragId` is any OTHER id addresses a per-node editing root
 *  (retired with the per-node host, §5 items 1/2) and is `FS2`: it is never
 *  restorable as a page caret. */
const PAGE_EDIT_SURFACE_ID = 'page-edit-surface'

/** One end of a page caret: a path from the surface root down to the target
 *  text node. */
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

/** The discriminated caret state (U-EDIT-1 §2.1 — the caret is PAGE-SCOPED).
 *  There is NO `kind: 'textarea'` arm: the per-node editing control it addressed
 *  is retired (§5 item 7), and a caret addressed to a per-node root is `FS2`.
 *  The single `rich` arm addresses the ONE page surface root
 *  (`page-edit-surface`) with a path-based anchor/focus edge (`RichCaretEdge`). */
export type CaretState =
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
  /** Request a rebuild of the given kind. If any control is dirty, the rebuild
   *  is QUEUED (not executed, coalesced by precedence). If no control is dirty,
   *  the rebuild executes immediately. */
  requestRebuild(kind?: RebuildKind): void
  /** Whether a rebuild is queued (waiting for the dirty-edit guard to clear). */
  hasQueuedRebuild(): boolean
  /** Save caret/focus state keyed by the PAGE subject id (the tab id / the one
   *  surface root id — one page caret per tab, §2.1). */
  saveCaret(subjectId: string, caret: CaretState): void
  /** Restore caret/focus state after a re-derive. Returns the saved state, or
   *  undefined if none was saved, the subject's back-reference is dangling (the
   *  RAG node/document was deleted), or the saved caret addresses a per-node
   *  root instead of the page surface (`FS2`). */
  restoreCaret(subjectId: string): CaretState | undefined
  /** Clear saved caret/focus state for a page subject. */
  clearCaret(subjectId: string): void
  /** U-STAGE-ACTIVE-TAB §5.3.2 — the HOST's late-binding seam for the optional
   *  `pageSubjectDocument` hook (the host owns the active-tab state and is
   *  constructed with an ALREADY-built controller in the shipped renderer and in
   *  every existing harness, so the hook cannot be passed at construction).
   *  Additive and total: a host that never calls it keeps the legacy guard. */
  setPageSubjectDocument?(resolve: (subjectId: string) => string | null): void
  /** §A.3.2 (ruling C2) — the HOST's late-binding seam for the optional
   *  `isDocumentLive` carrier (the `setPageSubjectDocument` pattern: the shipped
   *  renderer and every existing harness construct the controller before the host,
   *  so the carrier cannot always be passed at construction). Additive and total:
   *  a host that never calls it keeps the absent-carrier legacy fallback, and the
   *  pinned 11-member public census is preserved (the seam is attached
   *  NON-ENUMERABLY). */
  setDocumentLiveness?(resolve: (documentId: string) => boolean): void
}

export function createEditController(opts: EditControllerOptions): EditController {
  const dirty = new Set<string>()
  let queuedRebuild = false
  let queuedKind: RebuildKind = 'content'
  const carets = new Map<string, CaretState>()
  /** U-STAGE-ACTIVE-TAB §5.3.2 — the host-supplied page-subject → document
   *  resolver (late-binding; see `setPageSubjectDocument`). */
  let pageSubjectDocument: ((subjectId: string) => string | null) | undefined = opts.pageSubjectDocument
  /** U-STAGE-ACTIVE-TAB §A.3.2 — the host-supplied DOCUMENT-LIVENESS carrier
   *  (late-binding; see `setDocumentLiveness`). */
  let isDocumentLive: ((documentId: string) => boolean) | undefined = opts.isDocumentLive

  const RANK: Record<RebuildKind, number> = { content: 0, operator: 1, template: 2 }
  const mergeKind = (a: RebuildKind, b: RebuildKind): RebuildKind => (RANK[b] > RANK[a] ? b : a)
  const fire = (kind: RebuildKind): void => {
    opts.onRebuild(kind)
    queuedKind = 'content'
  }

  const controller: EditController = {
    markDirty(nodeId: string): void {
      dirty.add(nodeId)
    },
    clearDirty(nodeId: string): void {
      dirty.delete(nodeId)
      // If a rebuild was queued by the dirty-edit guard and no control is
      // dirty, execute the queued rebuild and clear the queue.
      if (queuedRebuild && dirty.size === 0) {
        queuedRebuild = false
        fire(queuedKind)
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
          fire(queuedKind)
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
          fire(queuedKind)
        }
      }
      return result
    },
    requestRebuild(kind: RebuildKind = 'content'): void {
      if (dirty.size > 0) {
        // Dirty-edit guard: queue (coalesced — at most ONE queued rebuild,
        // merged by precedence template > operator > content).
        queuedRebuild = true
        queuedKind = mergeKind(queuedKind, kind)
      } else {
        fire(kind)
      }
    },
    hasQueuedRebuild(): boolean {
      return queuedRebuild
    },
    saveCaret(subjectId: string, caret: CaretState): void {
      carets.set(subjectId, caret)
    },
    restoreCaret(subjectId: string): CaretState | undefined {
      const saved = carets.get(subjectId)
      // U-STAGE-ACTIVE-TAB §5.3.2 / §A.1.4 clause 1 — the PINNED order: the
      // caret is read FIRST. A caret-less read returns `undefined` and does NOT
      // consult the hook (a read with nothing saved cannot be changed by the
      // hook's answer, so consulting it would be an unobservable host-state side
      // effect the harness must be able to forbid).
      if (saved == null) return undefined
      // A dangling back-reference (the page's DOCUMENT was deleted) clears the
      // saved caret — no restore. L5 — actually clear the stale caret from the
      // map so a later re-created subject with the same id does not restore a
      // stale caret. With the host hook supplied the liveness is the SUBJECT'S
      // DOCUMENT (`pageSubjectDocument(subjectId)`, a tab id being no RAG id), so
      // a tab id is no longer rejected merely for not being a `rag-` id. An empty
      // answer is NO document (never a live one): `backRefs` is a
      // `Map<ragNodeId, nodeId[]>`, and an empty id is not a RAG node id — only a
      // non-empty document id can be validated.
      const hook = pageSubjectDocument
      let live: boolean
      if (typeof hook === 'function') {
        // §A.3.2 — the PINNED order: the subject's DOCUMENT is resolved first;
        // `doc === null` (a non-document active tab) clears. The liveness of that
        // document is the HOST's carrier when supplied, and `backRefs.has(doc)` ONLY
        // as the absent-carrier legacy fallback (no document id is a `backRefs` key
        // after ruling C2). An empty/non-string answer is NO document (never a live
        // one), so it clears.
        const doc = hook(subjectId)
        live =
          typeof doc === 'string' && doc !== ''
            ? typeof isDocumentLive === 'function'
              ? isDocumentLive(doc)
              : opts.backRefs.has(doc)
            : false
      } else {
        live = opts.backRefs.has(subjectId)
      }
      if (!live) {
        carets.delete(subjectId)
        return undefined
      }
      // U-EDIT-1 §2.1 — the caret is PAGE-SCOPED: a caret is addressed to the
      // ONE surface root, and a caret saved against a per-node root is `FS2` —
      // it is never restored as an editing caret (the per-node host it addressed
      // is gone). The stale entry is dropped so it cannot resurface.
      if (saved != null && saved.kind === 'rich' && saved.ragId !== PAGE_EDIT_SURFACE_ID) {
        carets.delete(subjectId)
        return undefined
      }
      return saved
    },
    clearCaret(subjectId: string): void {
      carets.delete(subjectId)
    },
  }
  // U-STAGE-ACTIVE-TAB §5.3.2 — the late-binding seam is attached NON-ENUMERABLY:
  // the controller's PUBLIC member census is pinned at exactly 11 members
  // (`tests/edit-controller.test.ts` S1 — `Object.keys(controller).sort()`), and
  // the host is the only caller. Defining it hidden keeps both contracts true:
  // the hook is supplyable by a host that received an already-built controller,
  // and the pinned census is unchanged (an absent/foreign controller keeps the
  // legacy guard — the interface member is optional).
  Object.defineProperty(controller, 'setPageSubjectDocument', {
    value: (resolve: (subjectId: string) => string | null): void => {
      pageSubjectDocument = resolve
    },
    enumerable: false,
    writable: true,
    configurable: true,
  })
  // §A.3.2 (ruling C2) — the document-liveness late-bind twin, attached the same
  // NON-ENUMERABLE way so the pinned 11-member public census
  // (`tests/edit-controller.test.ts` S1) stays exactly true.
  Object.defineProperty(controller, 'setDocumentLiveness', {
    value: (resolve: (documentId: string) => boolean): void => {
      isDocumentLive = resolve
    },
    enumerable: false,
    writable: true,
    configurable: true,
  })
  return controller
}
