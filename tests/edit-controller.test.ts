// tests/edit-controller.test.ts — Unit D: the edit controller
// (src/renderer/edit-controller.ts) — docs/specs/unit-d-editing.md §5.2
// (dirty-edit guard), §5.3 (caret/focus preservation), §5.4 (dangling
// back-reference → read-only), §5.8 happy paths 10-16, §5.9 fail-states 14-17.
//
// The controller is pure (no Electron): the back-reference map, the injected
// `commit` function (which sends IPC to main → the store), and the `onRebuild`
// callback are injected, so it is testable in isolation. The controller does
// NOT hold the store — it holds the back-reference map (Unit C §5.3,
// `Map<ragNodeId, nodeId[]>`), and `commit` delegates to the injected `commit`
// (MCP/UI equivalence — §5.7: the UI commit-on-blur routes through the SAME
// edit op `setContent` as the MCP tool).
//
// RED: src/renderer/edit-controller.ts does not exist yet — this file fails to
// load until the module is implemented.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
} from '../src/main/rag-store.js'
import { setContent } from '../src/main/edit-ops.js'
import {
  createEditController,
  type EditController,
  type EditControllerOptions,
  type CaretState,
  type CommitResult,
} from '../src/renderer/edit-controller.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-rag-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

// Build a controller with the spec §5.2 options shape: backRefs + injected
// commit + onRebuild. The injected `commit` simulates the IPC-to-main write
// (it may call the real setContent op on a store, or return a canned result).
function makeController(
  backRefs: Map<string, string[]>,
  commit: (nodeId: string, content: string) => Promise<CommitResult>,
  onRebuild: () => void = () => {},
): EditController {
  const opts: EditControllerOptions = { backRefs, commit, onRebuild }
  return createEditController(opts)
}

// A canned commit that simulates a successful store write.
function okCommit(nodeId: string): (n: string, c: string) => Promise<CommitResult> {
  return async (n, _c) => ({ ok: true, nodeId: n || nodeId })
}

describe('edit-controller — Unit D editing controller (unit-d-editing.md §5.2/§5.3/§5.4/§5.8/§5.9)', () => {
  it('RED — edit-controller module is not exported yet', () => {
    expect(typeof createEditController).toBe('function')
  })

  // =========================================================================
  // §5.8 HAPPY-PATH STATES (10-16)
  // =========================================================================

  it('10. UI commit-on-blur happy: a dirty control blurs → commit delegates to the injected commit → { ok: true, nodeId }', async () => {
    const backRefs = new Map<string, string[]>([['n1', ['provident-n1']]])
    const controller = makeController(backRefs, okCommit('n1'))
    controller.markDirty('n1')
    const result: CommitResult = await controller.commit('n1', 'after')
    expect(result).toEqual({ ok: true, nodeId: 'n1' })
  })

  it('11. dirty-edit guard happy: a rebuild request while dirty is QUEUED; executes on clearDirty', () => {
    const backRefs = new Map<string, string[]>()
    let rebuilds = 0
    const controller = makeController(backRefs, okCommit('n1'), () => { rebuilds++ })
    controller.markDirty('n1')
    controller.requestRebuild()
    expect(controller.hasQueuedRebuild()).toBe(true)
    expect(rebuilds).toBe(0) // queued, NOT executed
    controller.clearDirty('n1')
    expect(controller.hasQueuedRebuild()).toBe(false)
    expect(rebuilds).toBe(1) // queued rebuild executed
  })

  it('12. dirty-edit guard coalescing: two rebuild requests while dirty → at most ONE queued rebuild', () => {
    const backRefs = new Map<string, string[]>()
    let rebuilds = 0
    const controller = makeController(backRefs, okCommit('n1'), () => { rebuilds++ })
    controller.markDirty('n1')
    controller.requestRebuild()
    controller.requestRebuild()
    expect(controller.hasQueuedRebuild()).toBe(true)
    expect(rebuilds).toBe(0)
    controller.clearDirty('n1')
    expect(rebuilds).toBe(1) // exactly ONE rebuild
    expect(controller.hasQueuedRebuild()).toBe(false)
  })

  it('13. caret/focus preservation happy: saveCaret → restoreCaret returns the saved state; clearCaret removes it', () => {
    // a LIVE node (its id is a key in backRefs) — a dangling back-reference
    // would make restoreCaret return undefined (test 17)
    const backRefs = new Map<string, string[]>([['n1', ['provident-n1']]])
    const controller = makeController(backRefs, okCommit('n1'))
    const caret: CaretState = { offset: 3, focused: true }
    controller.saveCaret('n1', caret)
    expect(controller.restoreCaret('n1')).toEqual({ offset: 3, focused: true })
    controller.clearCaret('n1')
    expect(controller.restoreCaret('n1')).toBeUndefined()
  })

  it('14. dangling back-reference → read-only happy: a node absent from backRefs is not editable', () => {
    // 'n1' is a live back-reference key → editable
    const live = new Map<string, string[]>([['n1', ['provident-n1']]])
    const controller = makeController(live, okCommit('n1'))
    expect(controller.isEditable('n1')).toBe(true)
    // a deleted node's back-reference is gone (the map is rebuilt per
    // traversal) → not editable
    const dangling = new Map<string, string[]>()
    const controller2 = makeController(dangling, okCommit('n1'))
    expect(controller2.isEditable('n1')).toBe(false)
  })

  it('15. multi-parent duplicate coherence happy: commit delegates to the injected commit (the single authoritative node is updated by the store write)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('shared'))
      // the injected commit routes through the SAME edit op (setContent) as the
      // MCP tool — the store holds ONE authoritative node, updated
      const commit: (n: string, c: string) => Promise<CommitResult> = async (n, c) => {
        const r = await setContent({ store }, { nodeId: n, content: c })
        return r.ok ? { ok: true, nodeId: n } : { ok: false, reason: 'store-error', error: r.error }
      }
      const backRefs = new Map<string, string[]>([['shared', ['provident-shared']]])
      const controller = makeController(backRefs, commit)
      const result: CommitResult = await controller.commit('shared', 'updated text')
      expect(result).toEqual({ ok: true, nodeId: 'shared' })
      // the store holds ONE authoritative node, updated (duplicates are
      // per-render materializations re-built by the re-traversal)
      expect(store.getNode('shared')!.content).toBe('updated text')
      expect(store.listNodes().filter((n) => n.id === 'shared')).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('16. MCP/UI equivalence happy: setContent (MCP) and commit (UI) with the same params produce the same store state', async () => {
    const dir = freshDir()
    try {
      const storeA: RagStore = createJsonRagStore({ path: join(dir, 'a.json') })
      const storeB: RagStore = createJsonRagStore({ path: join(dir, 'b.json') })
      await storeA.putNode(makeNode('n1', { content: 'before' }))
      await storeB.putNode(makeNode('n1', { content: 'before' }))
      // MCP path: the edit.set_content op
      const mcp = await setContent({ store: storeA }, { nodeId: 'n1', content: 'same' })
      expect(mcp.ok).toBe(true)
      // UI path: the controller commit-on-blur, whose injected commit routes
      // through the SAME edit op (setContent)
      const commit: (n: string, c: string) => Promise<CommitResult> = async (n, c) => {
        const r = await setContent({ store: storeB }, { nodeId: n, content: c })
        return r.ok ? { ok: true, nodeId: n } : { ok: false, reason: 'store-error', error: r.error }
      }
      const backRefs = new Map<string, string[]>([['n1', ['provident-n1']]])
      const controller = makeController(backRefs, commit)
      const ui: CommitResult = await controller.commit('n1', 'same')
      expect(ui).toEqual({ ok: true, nodeId: 'n1' })
      // same store state
      expect(storeA.getNode('n1')!.content).toBe('same')
      expect(storeB.getNode('n1')!.content).toBe('same')
    } finally {
      rmSyncSafe(dir)
    }
  })

  // =========================================================================
  // §5.9 FAIL-STATES (14-17)
  // =========================================================================

  it('14. UI commit-on-blur on a deleted node → { ok: false, reason: "deleted-node" } (write refused)', async () => {
    // the injected commit simulates the store-level deleted-node check
    const commit: (n: string, c: string) => Promise<CommitResult> = async () =>
      ({ ok: false, reason: 'deleted-node' })
    const backRefs = new Map<string, string[]>()
    const controller = makeController(backRefs, commit)
    const result: CommitResult = await controller.commit('n1', 'after')
    expect(result).toEqual({ ok: false, reason: 'deleted-node' })
  })

  it('15. UI commit-on-blur store error → { ok: false, reason: "store-error", error }', async () => {
    // the node must be EDITABLE (in backRefs) so the injected commit runs and
    // can surface the store error — a non-editable node is refused as
    // 'deleted-node' before the injected commit (M9)
    const commit: (n: string, c: string) => Promise<CommitResult> = async () =>
      ({ ok: false, reason: 'store-error', error: 'disk full' })
    const backRefs = new Map<string, string[]>([['n1', ['provident-n1']]])
    const controller = makeController(backRefs, commit)
    const result: CommitResult = await controller.commit('n1', 'after')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('store-error')
      expect(result.error).toBe('disk full')
    }
  })

  it('16. dirty-edit guard: a rebuild request while a control is dirty is QUEUED (not executed)', () => {
    const backRefs = new Map<string, string[]>()
    let rebuilds = 0
    const controller = makeController(backRefs, okCommit('n1'), () => { rebuilds++ })
    controller.markDirty('n1')
    controller.requestRebuild()
    expect(controller.hasQueuedRebuild()).toBe(true)
    expect(rebuilds).toBe(0) // onRebuild NOT called
  })

  it('17. caret restore for a deleted node → restoreCaret returns undefined (saved caret cleared)', () => {
    const backRefs = new Map<string, string[]>()
    const controller = makeController(backRefs, okCommit('n1'))
    controller.saveCaret('n1', { offset: 2, focused: true })
    // the node was deleted → its back-reference is gone → the saved caret is
    // cleared (no restore)
    expect(controller.restoreCaret('n1')).toBeUndefined()
  })

  // ---- additional §5.2 behaviors (isDirty/anyDirty + immediate rebuild) ----

  it('isDirty/anyDirty reflect the dirty flags', () => {
    const backRefs = new Map<string, string[]>()
    const controller = makeController(backRefs, okCommit('n1'))
    expect(controller.anyDirty()).toBe(false)
    controller.markDirty('n1')
    expect(controller.isDirty('n1')).toBe(true)
    expect(controller.anyDirty()).toBe(true)
    controller.clearDirty('n1')
    expect(controller.isDirty('n1')).toBe(false)
    expect(controller.anyDirty()).toBe(false)
  })

  it('requestRebuild with no dirty control executes immediately', () => {
    const backRefs = new Map<string, string[]>()
    let rebuilds = 0
    const controller = makeController(backRefs, okCommit('n1'), () => { rebuilds++ })
    controller.requestRebuild()
    expect(rebuilds).toBe(1)
    expect(controller.hasQueuedRebuild()).toBe(false)
  })
})
