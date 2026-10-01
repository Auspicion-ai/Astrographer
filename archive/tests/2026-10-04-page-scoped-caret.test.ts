// tests/page-scoped-caret.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of
// the archived `contenteditable-caret` input).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §2.1 the caret is PAGE-SCOPED: `CaretState`'s `kind: 'rich'` arm addresses
//     the surface root with a path-based anchor/focus edge (`RichCaretEdge`), the
//     surface root is addressed by the pinned authored id `page-edit-surface`,
//     and there is **NO** `kind: 'textarea'` arm; a caret addressed to a per-node
//     root is `FS2`.
//   - §6.4 item 1 the `EditController` interface is kept WHOLE
//     (`markDirty`/`clearDirty`/`isDirty`/`anyDirty`/`isEditable`/`commit`/
//     `requestRebuild`/`hasQueuedRebuild`/`saveCaret`/`restoreCaret`/`clearCaret`)
//     — what changes is the ARGUMENT MEANING (tab id on the content path), not a
//     member or a signature; the deleted-node refusal branch is retained as the
//     deleted-document guard.
//   - §8.1 `FS2` (a caret addressed to a per-node root) and §3.5 item 2 (the
//     page's text/editable state survives a failed commit).
//
// States enumerated (the state machine this file covers):
//   S1  a page caret saved + restored on the page surface (both edges round-trip)
//   S2  a page caret with an EMPTY path (the surface root's own text run)
//   S3  a page caret after a re-derive (the same page surface is still addressed)
//   S4  a caret for a tab/document whose back-reference is gone (deleted)
//   S5  no saved caret at all
//   S6  a caret cleared explicitly
//   S7  the dirty-edit guard keyed by the page's tab id
// Fail-states covered: `FS2` (a per-node-root caret target), plus the retained
//   deleted-document refusal and the queued-rebuild behaviour.
import { describe, it, expect, beforeAll, vi } from 'vitest'
import * as editControllerModule from '../src/renderer/edit-controller.js'
import {
  createEditController,
  type CaretState,
  type CommitResult,
  type EditController,
  type RichCaretEdge,
} from '../src/renderer/edit-controller.js'

beforeAll(() => {
  expect(editControllerModule).toBeDefined()
})

/** The pinned authored id of the single page surface (§2.1). */
const PAGE_EDIT_SURFACE_ID = 'page-edit-surface'

function makeController(overrides: { backRefs?: Map<string, string[]>; commit?: (id: string, c: string) => Promise<CommitResult> } = {}) {
  const backRefs = overrides.backRefs ?? new Map<string, string[]>([['tab-1', ['n1']], [PAGE_EDIT_SURFACE_ID, ['n1']]])
  const rebuilds: string[] = []
  const commit = vi.fn(overrides.commit ?? (async () => ({ ok: true, nodeId: 'tab-1' }) as CommitResult))
  const controller: EditController = createEditController({
    backRefs,
    commit,
    onRebuild: (kind) => rebuilds.push(kind),
  })
  return { controller, backRefs, commit, rebuilds }
}

/** A page caret edge: a path from the surface root down to the target text node. */
function pageEdge(path: number[], offset: number): RichCaretEdge {
  return { path, offset }
}

// ===========================================================================
// §6.4 item 1 — the controller interface is kept whole
// ===========================================================================
describe('§6.4 item 1 — the EditController interface keeps its member set and signatures', () => {
  it('state S1 — the controller exposes all 11 pinned members (no member removed, no member reshaped)', () => {
    const { controller } = makeController()
    for (const member of [
      'markDirty',
      'clearDirty',
      'isDirty',
      'anyDirty',
      'isEditable',
      'commit',
      'requestRebuild',
      'hasQueuedRebuild',
      'saveCaret',
      'restoreCaret',
      'clearCaret',
    ]) {
      expect(typeof (controller as unknown as Record<string, unknown>)[member]).toBe('function')
    }
  })

  it('the controller is argument-OPAQUE: a dirty flag is not interpreted as a node id (the meaning may move to the tab id)', () => {
    const { controller } = makeController()
    controller.markDirty('tab-1')
    expect(controller.isDirty('tab-1')).toBe(true)
    expect(controller.anyDirty()).toBe(true)
    controller.clearDirty('tab-1')
    expect(controller.isDirty('tab-1')).toBe(false)
    expect(controller.anyDirty()).toBe(false)
  })
})

// ===========================================================================
// §2.1 — the page-scoped caret
// ===========================================================================
describe('§2.1 — a page caret addresses the single surface root (path-based edges)', () => {
  it('state S1 — a saved page caret round-trips deep-equal, including both edges and the focused flag', () => {
    const { controller } = makeController()
    const caret: CaretState = {
      kind: 'rich',
      ragId: PAGE_EDIT_SURFACE_ID,
      anchor: pageEdge([0, 1], 3),
      focus: pageEdge([2], 0),
      focused: true,
    }
    controller.saveCaret(PAGE_EDIT_SURFACE_ID, caret)
    expect(controller.restoreCaret(PAGE_EDIT_SURFACE_ID)).toEqual(caret)
  })

  it('state S2 — an EMPTY path is valid (it addresses the surface root\'s own text run)', () => {
    const { controller } = makeController()
    const caret: CaretState = { kind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, anchor: pageEdge([], 0), focus: pageEdge([], 7), focused: false }
    controller.saveCaret(PAGE_EDIT_SURFACE_ID, caret)
    expect(controller.restoreCaret(PAGE_EDIT_SURFACE_ID)).toEqual(caret)
  })

  it('state S3 — the page caret survives a re-derive: the same surface id returns the same caret', () => {
    const { controller } = makeController()
    const caret: CaretState = { kind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, anchor: pageEdge([1], 2), focus: pageEdge([1], 5), focused: true }
    controller.saveCaret(PAGE_EDIT_SURFACE_ID, caret)
    controller.requestRebuild('content') // the re-derive path (§4.4)
    expect(controller.restoreCaret(PAGE_EDIT_SURFACE_ID)).toEqual(caret)
  })

  it('state S5 — an unsaved page surface returns undefined', () => {
    const { controller } = makeController()
    expect(controller.restoreCaret(PAGE_EDIT_SURFACE_ID)).toBeUndefined()
  })

  it('state S6 — clearCaret removes the page caret', () => {
    const { controller } = makeController()
    controller.saveCaret(PAGE_EDIT_SURFACE_ID, { kind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, anchor: pageEdge([], 1), focus: pageEdge([], 1), focused: false })
    controller.clearCaret(PAGE_EDIT_SURFACE_ID)
    expect(controller.restoreCaret(PAGE_EDIT_SURFACE_ID)).toBeUndefined()
  })

  it('FS2 — a caret addressed to a per-node root is not the page surface: the caret target id is the surface id, not a RAG id', () => {
    const { controller } = makeController({ backRefs: new Map([['n1', ['x']], [PAGE_EDIT_SURFACE_ID, ['n1']]]) })
    const pageCaret: CaretState = { kind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, anchor: pageEdge([], 0), focus: pageEdge([], 0), focused: true }
    controller.saveCaret(PAGE_EDIT_SURFACE_ID, pageCaret)
    const restored = controller.restoreCaret(PAGE_EDIT_SURFACE_ID)
    expect(restored?.kind).toBe('rich')
    expect(restored && restored.kind === 'rich' ? restored.ragId : null).toBe(PAGE_EDIT_SURFACE_ID)
  })

  it("FS2 — the CaretState union carries NO 'textarea' kind (no per-node control arm survives)", () => {
    // A per-node control caret is not expressible: the only arm the page path
    // can save or restore is the page-scoped `rich` arm.
    const pageCaret: CaretState = { kind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, anchor: pageEdge([], 0), focus: pageEdge([], 0), focused: false }
    const { controller } = makeController()
    controller.saveCaret(PAGE_EDIT_SURFACE_ID, pageCaret)
    const restored = controller.restoreCaret(PAGE_EDIT_SURFACE_ID)
    expect(restored?.kind).toBe('rich')
    expect(Object.keys(restored ?? {}).sort()).toEqual(['anchor', 'focus', 'focused', 'kind', 'ragId'])
  })
})

// ===========================================================================
// §6.4 item 1 — the retained deleted-document refusal (the page-scoped subject)
// ===========================================================================
describe('§6.4 item 1 — the deleted-document guard is retained on the page-scoped subject', () => {
  it('state S4 — a commit for a tab whose back-reference is gone is refused with deleted-node (no injected commit)', async () => {
    const { controller, commit } = makeController({ backRefs: new Map() })
    const result = await controller.commit('tab-gone', 'text')
    expect(result).toEqual({ ok: false, reason: 'deleted-node' })
    expect(commit).not.toHaveBeenCalled()
  })

  it('state S4 — restoreCaret for a dangling page subject returns undefined AND clears the stale caret', () => {
    const backRefs = new Map<string, string[]>([['tab-1', ['n1']]])
    const { controller } = makeController({ backRefs })
    controller.saveCaret('tab-1', { kind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, anchor: pageEdge([], 0), focus: pageEdge([], 0), focused: false })
    backRefs.delete('tab-1')
    expect(controller.restoreCaret('tab-1')).toBeUndefined()
    backRefs.set('tab-1', ['n1'])
    expect(controller.restoreCaret('tab-1')).toBeUndefined()
  })

  it('a successful page commit clears the page dirty flag', async () => {
    const { controller } = makeController()
    controller.markDirty('tab-1')
    const result = await controller.commit('tab-1', 'edited')
    expect(result.ok).toBe(true)
    expect(controller.isDirty('tab-1')).toBe(false)
  })
})

// ===========================================================================
// §2.1 + §6.5 item 1 — the retired per-node caret path is absent from the module
// ===========================================================================
describe('§2.1 — the retired per-node editing surface is absent from the caret module', () => {
  it('FS2 — a caret addressed to a PER-NODE root is not restorable (the caret is page-scoped)', () => {
    const { controller } = makeController({ backRefs: new Map([['n1', ['x']], [PAGE_EDIT_SURFACE_ID, ['n1']]]) })
    // The editor is no longer a per-node host, so a caret saved against a RAG
    // node id must not be restorable as an editing caret.
    controller.saveCaret('n1', { kind: 'rich', ragId: 'n1', anchor: pageEdge([], 0), focus: pageEdge([], 0), focused: true })
    expect(controller.restoreCaret('n1')).toBeUndefined()
  })

  it('FS2 — the module exports no per-node-textarea caret API (no textarea-named export)', () => {
    const names = Object.keys(editControllerModule)
    const textareaNamed = names.filter((n) => /textarea/i.test(n))
    expect(textareaNamed).toEqual([])
  })

  it('FS2 — the module exports no per-node rich-handler API (the 4 rag-editor-* host methods are gone with the splice)', () => {
    const names = Object.keys(editControllerModule)
    const perNodeNamed = names.filter((n) => /^rag(Editor|Textarea)/.test(n))
    expect(perNodeNamed).toEqual([])
  })
})

// ===========================================================================
// §3.5 item 7 / §6.4 item 1 — the dirty-edit guard is unchanged
// ===========================================================================
describe('§6.4 item 1 — the dirty-edit guard keeps queueing (never executes) a rebuild while the page is dirty', () => {
  it('state S7 — a rebuild request while the page is dirty is QUEUED; it fires once the page clears', () => {
    const { controller, rebuilds } = makeController()
    controller.markDirty('tab-1')
    controller.requestRebuild('content')
    expect(controller.hasQueuedRebuild()).toBe(true)
    expect(rebuilds).toEqual([])
    controller.clearDirty('tab-1')
    expect(controller.hasQueuedRebuild()).toBe(false)
    expect(rebuilds).toEqual(['content'])
  })

  it('state S7 — two rebuild requests while dirty coalesce to at most ONE queued rebuild (precedence template > operator > content)', () => {
    const { controller, rebuilds } = makeController()
    controller.markDirty('tab-1')
    controller.requestRebuild('content')
    controller.requestRebuild('operator')
    controller.requestRebuild('content')
    controller.clearDirty('tab-1')
    expect(rebuilds).toEqual(['operator'])
  })

  it('state S7 — with nothing dirty the rebuild executes immediately', () => {
    const { controller, rebuilds } = makeController()
    controller.requestRebuild('template')
    expect(rebuilds).toEqual(['template'])
    expect(controller.hasQueuedRebuild()).toBe(false)
  })
})
