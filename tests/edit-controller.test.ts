// tests/edit-controller.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of
// the archived `edit-controller` input; the surviving dirty-edit guard).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §6.4 item 1 the `EditController` interface stays WHOLE
//     (`markDirty`/`clearDirty`/`isDirty`/`anyDirty`/`isEditable`/`commit`/
//     `requestRebuild`/`hasQueuedRebuild`/`saveCaret`/`restoreCaret`/`clearCaret`)
//     because ≈35 files under `tests/**` construct it as the harness's guard.
//     What changes is the ARGUMENT'S MEANING: the content path passes the TAB ID
//     (one page dirty per tab), and the caret is page-scoped (§2.1). A rewrite
//     that reshapes the members reddens those files for no contract reason.
//   - §6.4 item 1 the deleted-node-refusal branch (`commit` returning
//     `{ ok: false, reason: 'deleted-node' }` for a dangling back-reference) is
//     RETAINED as the deleted-DOCUMENT guard (the same branch, a page-scoped
//     subject).
//   - §2.5 / §4.1's SURVIVING clauses: commit-on-blur, the dirty-edit guard
//     (queue, never execute a rebuild), RAG-authoritative re-traversal, and the
//     mode-broadcast contract.
//   - §3.5 item 6 the dirty/`commit-failed` state lives in host-side state keyed
//     by tab id — the guard is the carrier, never a rendered element.
//
// States enumerated (the state machine this file covers):
//   S1  the member/signature census (11 members + the construction options)
//   S2  a dirty page (tab id) with a queued rebuild
//   S3  a successful commit-on-blur
//   S4  a dangling back-reference (the deleted document) — the retained refusal
//   S5  a store-level error from the injected commit (the dirty flag stays)
//   S6  the caret map (page-scoped)
//   S7  rebuild-kind coalescing by precedence (template > operator > content)
// Fail-states covered: the deleted-document refusal, the store-error pass-through
//   (the commit path must read `ok` — §3.3 item 6), and the queued-rebuild guard.
import { describe, it, expect, vi } from 'vitest'
import * as editController from '../src/renderer/edit-controller.js'
import {
  createEditController,
  type CaretState,
  type CommitResult,
  type EditController,
  type RebuildKind,
} from '../src/renderer/edit-controller.js'

/** The pinned authored id of the single page surface (§2.1). */
const PAGE_EDIT_SURFACE_ID = 'page-edit-surface'

function harness(opts: { backRefs?: Map<string, string[]>; commitResult?: CommitResult } = {}) {
  const backRefs = opts.backRefs ?? new Map<string, string[]>([['tab-1', ['p1', 'p2']]])
  const commit = vi.fn(async (): Promise<CommitResult> => opts.commitResult ?? { ok: true, nodeId: 'tab-1' })
  const rebuilds: RebuildKind[] = []
  const controller: EditController = createEditController({ backRefs, commit, onRebuild: (kind) => rebuilds.push(kind) })
  return { controller, backRefs, commit, rebuilds }
}

const pageCaret = (): CaretState => ({
  kind: 'rich',
  ragId: PAGE_EDIT_SURFACE_ID,
  anchor: { path: [1], offset: 2 },
  focus: { path: [1], offset: 6 },
  focused: true,
})

// ===========================================================================
// S1 — the census: the interface is kept whole
// ===========================================================================
describe('§6.4 item 1 — the EditController census is unchanged', () => {
  it('S1 — createEditController is exported and the instance carries the 11 pinned members', () => {
    expect(typeof editController.createEditController).toBe('function')
    const { controller } = harness()
    const members = Object.keys(controller).sort()
    expect(members).toEqual([
      'anyDirty',
      'clearCaret',
      'clearDirty',
      'commit',
      'hasQueuedRebuild',
      'isDirty',
      'isEditable',
      'markDirty',
      'requestRebuild',
      'restoreCaret',
      'saveCaret',
    ])
  })

  it('S1 — the member SHAPES are unchanged (each member is a function of the documented arity)', () => {
    const { controller } = harness()
    expect(controller.markDirty.length).toBe(1)
    expect(controller.clearDirty.length).toBe(1)
    expect(controller.isDirty.length).toBe(1)
    expect(controller.anyDirty.length).toBe(0)
    expect(controller.isEditable.length).toBe(1)
    expect(controller.hasQueuedRebuild.length).toBe(0)
    expect(controller.saveCaret.length).toBe(2)
    expect(controller.restoreCaret.length).toBe(1)
    expect(controller.clearCaret.length).toBe(1)
    expect(controller.requestRebuild.length).toBeLessThanOrEqual(1)
  })

  it('S1 — the module keeps `createEditController` as its only factory (no second, page-only controller)', () => {
    const factories = Object.keys(editController).filter((n) => /^create/i.test(n))
    expect(factories).toEqual(['createEditController'])
  })
})

// ===========================================================================
// S2 — the dirty-edit guard
// ===========================================================================
describe('§6.4 item 1 — the dirty-edit guard queues a rebuild and never executes it while dirty', () => {
  it('S2 — a rebuild request while the page is dirty sets hasQueuedRebuild and fires nothing', () => {
    const { controller, rebuilds } = harness()
    controller.markDirty('tab-1')
    controller.requestRebuild('content')
    expect(controller.hasQueuedRebuild()).toBe(true)
    expect(rebuilds).toEqual([])
  })

  it('S2 — the queued rebuild executes exactly once when the page clears', () => {
    const { controller, rebuilds } = harness()
    controller.markDirty('tab-1')
    controller.requestRebuild('content')
    controller.clearDirty('tab-1')
    expect(rebuilds).toEqual(['content'])
    expect(controller.hasQueuedRebuild()).toBe(false)
  })

  it('S2 — a rebuild request while NOT dirty executes immediately', () => {
    const { controller, rebuilds } = harness()
    controller.requestRebuild('content')
    expect(rebuilds).toEqual(['content'])
  })

  it('S7 — queued kinds coalesce by precedence template > operator > content', () => {
    const { controller, rebuilds } = harness()
    controller.markDirty('tab-1')
    controller.requestRebuild('content')
    controller.requestRebuild('operator')
    controller.requestRebuild('template')
    controller.clearDirty('tab-1')
    expect(rebuilds).toEqual(['template'])
  })

  it('S2 — two dirty pages hold the queue until BOTH are clean', () => {
    const { controller, rebuilds } = harness({ backRefs: new Map([['tab-1', ['p1']], ['tab-2', ['p2']]]) })
    controller.markDirty('tab-1')
    controller.markDirty('tab-2')
    controller.requestRebuild('content')
    controller.clearDirty('tab-1')
    expect(rebuilds).toEqual([])
    controller.clearDirty('tab-2')
    expect(rebuilds).toEqual(['content'])
  })
})

// ===========================================================================
// S3 — commit-on-blur
// ===========================================================================
describe('§6.4 item 1 / §4.1 — commit-on-blur survives on the page-scoped subject', () => {
  it('S3 — a successful commit delegates to the injected commit and clears the page dirty flag', async () => {
    const { controller, commit } = harness()
    controller.markDirty('tab-1')
    const result = await controller.commit('tab-1', 'the page text')
    expect(result).toEqual({ ok: true, nodeId: 'tab-1' })
    expect(commit).toHaveBeenCalledWith('tab-1', 'the page text')
    expect(controller.isDirty('tab-1')).toBe(false)
  })

  it('S3 — a successful commit whose page was dirty fires the queued rebuild once', async () => {
    const { controller, rebuilds } = harness()
    controller.markDirty('tab-1')
    controller.requestRebuild('content')
    await controller.commit('tab-1', 'text')
    expect(rebuilds).toEqual(['content'])
  })

  it('S5 — a store-error commit does NOT clear the dirty flag (§3.3 item 6: the result is read)', async () => {
    const { controller } = harness({ commitResult: { ok: false, reason: 'store-error', error: 'rag applyBatch: op not supported' } })
    controller.markDirty('tab-1')
    const result = await controller.commit('tab-1', 'text')
    expect(result.ok).toBe(false)
    expect(controller.isDirty('tab-1')).toBe(true)
    expect(controller.anyDirty()).toBe(true)
  })

  it('S5 — a store-error commit leaves the queued rebuild QUEUED (the page is still dirty)', async () => {
    const { controller, rebuilds } = harness({ commitResult: { ok: false, reason: 'store-error' } })
    controller.markDirty('tab-1')
    controller.requestRebuild('content')
    await controller.commit('tab-1', 'text')
    expect(controller.hasQueuedRebuild()).toBe(true)
    expect(rebuilds).toEqual([])
  })

  it('S4 — the retained deleted-document refusal: a dangling tab is refused before the injected commit', async () => {
    const { controller, commit } = harness({ backRefs: new Map() })
    controller.markDirty('tab-gone')
    const result = await controller.commit('tab-gone', 'text')
    expect(result).toEqual({ ok: false, reason: 'deleted-node' })
    expect(commit).not.toHaveBeenCalled()
  })

  it('S4 — the deleted-document refusal clears that page\'s dirty flag (the edit is unrecoverable)', async () => {
    const { controller } = harness({ backRefs: new Map() })
    controller.markDirty('tab-gone')
    await controller.commit('tab-gone', 'text')
    expect(controller.isDirty('tab-gone')).toBe(false)
  })

  it('S4 — the deleted-document refusal does not unqueue while ANOTHER page is dirty', () => {
    const { controller, rebuilds } = harness({ backRefs: new Map([['tab-1', ['p1']]]) })
    controller.markDirty('tab-1')
    controller.markDirty('tab-gone')
    controller.requestRebuild('content')
    return controller.commit('tab-gone', 'text').then(() => {
      expect(rebuilds).toEqual([])
      expect(controller.hasQueuedRebuild()).toBe(true)
    })
  })
})

// ===========================================================================
// S6 — the caret map (page-scoped) + the editability hint
// ===========================================================================
describe('§2.1 — the caret map keys on the page subject and the editability hint is a best-effort read', () => {
  it('S6 — a page caret round-trips and is removed by clearCaret', () => {
    const backRefs = new Map<string, string[]>([[PAGE_EDIT_SURFACE_ID, ['p1']]])
    const { controller } = harness({ backRefs })
    controller.saveCaret(PAGE_EDIT_SURFACE_ID, pageCaret())
    expect(controller.restoreCaret(PAGE_EDIT_SURFACE_ID)).toEqual(pageCaret())
    controller.clearCaret(PAGE_EDIT_SURFACE_ID)
    expect(controller.restoreCaret(PAGE_EDIT_SURFACE_ID)).toBeUndefined()
  })

  it('S4 — a dangling page subject returns undefined from restoreCaret (the stale caret is cleared)', () => {
    const backRefs = new Map<string, string[]>([[PAGE_EDIT_SURFACE_ID, ['p1']]])
    const { controller } = harness({ backRefs })
    controller.saveCaret(PAGE_EDIT_SURFACE_ID, pageCaret())
    backRefs.delete(PAGE_EDIT_SURFACE_ID)
    expect(controller.restoreCaret(PAGE_EDIT_SURFACE_ID)).toBeUndefined()
  })

  it('S6 — isEditable reports the back-reference hint for the subject', () => {
    const { controller } = harness()
    expect(controller.isEditable('tab-1')).toBe(true)
    expect(controller.isEditable('tab-unknown')).toBe(false)
  })

  it('S1 — the controller holds NO store and NO DOM (pure, injectable)', () => {
    const { controller } = harness()
    expect(controller).not.toHaveProperty('store')
    expect(controller).not.toHaveProperty('document')
    expect(controller).not.toHaveProperty('window')
  })
})
