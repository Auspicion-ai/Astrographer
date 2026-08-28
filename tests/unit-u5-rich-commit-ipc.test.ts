// tests/unit-u5-rich-commit-ipc.test.ts — Unit U5: the `IPC_EDIT_RICH_COMMIT`
// channel + `EditRichCommitPayload`/`RichCommitResult` + the `handleRichCommit`
// shared handler + the preload `edit.commitRich` bridge
// (docs/specs/unit-u5-set-rich-text.md §1.3, §1.4, §2.1 states 16–19/28, §2.2
// state 10, §3 census).
//
// This is the TestWriter RED set — the U5 IPC surface does NOT exist yet:
//
//   - `src/shared/types.ts` does NOT export `IPC_EDIT_RICH_COMMIT` /
//     `EditRichCommitPayload` / `RichCommitResult`.
//   - `src/main/edit-ops.ts` does NOT export `handleRichCommit`.
//   - `src/main/preload.ts` does NOT expose `edit.commitRich` (the edit bridge
//     has 3 methods — commit/batch/onRagStoreChanged — not 4).
//
// `handleRichCommit` is a PURE async function over the RagStore INTERFACE (no
// Electron), tested against the concrete JSON store exactly as the main IPC
// handler uses it. The preload `edit.commitRich` bridge is exercised through
// the electron-mock harness (the same approach as template-adversarial.test.ts):
// mock `electron`, import the preload, capture the exposed `window.provident`
// bridge, and assert `edit.commitRich` invokes `IPC_EDIT_RICH_COMMIT` with the
// `EditRichCommitPayload`. The namespace imports let the RED run reach the
// per-test runtime failure rather than failing at import.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'
import * as editOps from '../src/main/edit-ops.js'
import * as sharedTypes from '../src/shared/types.js'

// ---- electron mock (hoisted BEFORE the preload import) ----------------------
const invokeMock = vi.hoisted(() => vi.fn())
const exposeInMainWorldMock = vi.hoisted(() => vi.fn())

vi.mock('electron', () => ({
  contextBridge: { exposeInMainWorld: exposeInMainWorldMock },
  ipcRenderer: {
    invoke: invokeMock,
    on: vi.fn(() => vi.fn()),
    removeListener: vi.fn(),
    send: vi.fn(),
  },
}))

// Import AFTER the electron mock is installed (vi.mock is hoisted).
import '../src/main/preload.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-u5-ipc-'))
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

/** Narrow a result to the success arm (asserting `ok === true`). */
function expectOk<T extends { ok: boolean }>(result: T): Extract<T, { ok: true }> {
  expect(result.ok).toBe(true)
  if (!result.ok) throw new Error('expected ok, got failure: ' + (result as { error?: string }).error)
  return result as Extract<T, { ok: true }>
}

/** Narrow a result to the failure arm (asserting `ok === false`). */
function expectFail<T extends { ok: boolean }>(result: T): Extract<T, { ok: false }> {
  expect(result.ok).toBe(false)
  if (result.ok) throw new Error('expected failure, got ok')
  return result as Extract<T, { ok: false }>
}

/** The `window.provident` bridge captured by contextBridge.exposeInMainWorld
 *  when the preload loads. */
function capturedBridge(): {
  edit: {
    commitRich: ((nodeId: string, content: string, children: unknown[]) => Promise<unknown>) | undefined
    commit: unknown
    batch: unknown
    onRagStoreChanged: unknown
  }
} {
  return exposeInMainWorldMock.mock.calls[0]?.[1] as ReturnType<typeof capturedBridge>
}

// ===========================================================================
// §2.1 states 16–19 — handleRichCommit (pure) + the channel const
// ===========================================================================
describe('handleRichCommit — Unit U5 (§2.1 states 16–19)', () => {
  it('RED — handleRichCommit is not exported yet; IPC_EDIT_RICH_COMMIT const does not exist', () => {
    expect(typeof editOps.handleRichCommit).toBe('function')
    expect(sharedTypes.IPC_EDIT_RICH_COMMIT).toBe('provident:edit-rich-commit')
  })

  it('16. success mapping: a successful setRichText → { ok:true, nodeId, node } (the UPDATED node is returned)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old' }))
      const result = expectOk(
        await editOps.handleRichCommit(store, {
          nodeId: 'n1',
          content: 'hello',
          children: [{ type: 'strong', content: 'bold' }],
        }),
      )
      expect(result.nodeId).toBe('n1')
      expect(result.node.content).toBe('hello')
      expect(result.node.children).toEqual([{ type: 'strong', content: 'bold' }])
      // the updated node is what the store now holds (updatedAt refreshed)
      expect(result.node.updatedAt).toBe(store.getNode('n1')!.updatedAt)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('17. deleted-node race mapping: a node that vanishes → { ok:false, reason:"deleted-node", error:"edit.set_rich_text: node not found" } (NOT store-error)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.removeNode('n1') // the node disappears between blur and commit
      const result = expectFail(
        await editOps.handleRichCommit(store, { nodeId: 'n1', content: 'x', children: [] }),
      )
      expect(result.reason).toBe('deleted-node')
      expect(result.error).toBe('edit.set_rich_text: node not found')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('18. store-error mapping: any OTHER domain failure (invalid children shape) → { ok:false, reason:"store-error", error }', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = expectFail(
        await editOps.handleRichCommit(store, { nodeId: 'n1', content: 'x', children: [{ type: 'span', content: 'x' }] as never }),
      )
      expect(result.reason).toBe('store-error')
      expect(result.error).toBe('edit.set_rich_text: children required/invalid')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('18b. store-error mapping for a non-string content (the op validation, not the main boundary check)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      const result = expectFail(
        await editOps.handleRichCommit(store, { nodeId: 'n1', content: 42 as never, children: [] }),
      )
      expect(result.reason).toBe('store-error')
      expect(result.error).toBe('edit.set_rich_text: content must be a string')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('19. IPC_EDIT_RICH_COMMIT === "provident:edit-rich-commit" (the channel const)', () => {
    expect(sharedTypes.IPC_EDIT_RICH_COMMIT).toBe('provident:edit-rich-commit')
  })
})

// ===========================================================================
// §1.4 + §2.1 state 28 + §3 census — the preload edit.commitRich bridge
// ===========================================================================
describe('preload edit.commitRich — Unit U5 (§1.4 / state 28 / §3 census)', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('RED — the edit bridge exposes commitRich (the 4th edit method: commit/batch/commitRich/onRagStoreChanged)', () => {
    expect(typeof capturedBridge().edit.commitRich).toBe('function')
    expect(typeof capturedBridge().edit.commit).toBe('function')
    expect(typeof capturedBridge().edit.batch).toBe('function')
    expect(typeof capturedBridge().edit.onRagStoreChanged).toBe('function')
  })

  it('28. commitRich(nodeId, content, children) invokes IPC_EDIT_RICH_COMMIT with the EditRichCommitPayload { nodeId, content, children }', () => {
    const commitRich = capturedBridge().edit.commitRich!
    const children = [{ type: 'strong', content: 'bold' }]
    commitRich('n1', 'hello', children)
    expect(invokeMock).toHaveBeenCalledWith('provident:edit-rich-commit', {
      nodeId: 'n1',
      content: 'hello',
      children,
    })
  })

  it('28b. commitRich sends the FULL children array (empty [] included) and passes it verbatim', () => {
    const commitRich = capturedBridge().edit.commitRich!
    commitRich('n1', 'plain', [])
    expect(invokeMock).toHaveBeenCalledWith('provident:edit-rich-commit', {
      nodeId: 'n1',
      content: 'plain',
      children: [],
    })
  })
})

// ===========================================================================
// §3 census + §2.1 state 28 — the edit bridge grows from 3 to 4 methods
// ===========================================================================
describe('census — the edit bridge surface (§3)', () => {
  it('the edit bridge has EXACTLY the 4 methods commit/batch/commitRich/onRagStoreChanged', () => {
    const edit = capturedBridge().edit
    const methods = Object.keys(edit).sort()
    expect(methods).toEqual(['batch', 'commit', 'commitRich', 'onRagStoreChanged'])
  })
})

// ===========================================================================
// ADVERSARIAL F1/F2 regressions (RCA-3, docs/specs/unit-u5-set-rich-text.md §5)
// — the main `IPC_EDIT_RICH_COMMIT` handler's derive→reconcile→broadcast-once
// logic, tested via the node-testable `handleRichCommitIpc` extraction (the
// repo tests shared handlers, not main.ts directly — F1). The Electron
// boundary (retrieval reconcile + `rag-store-changed` broadcast) is injected
// as the `reconcile`/`broadcast` callbacks. Real change → broadcast ONCE;
// no-op / malformed / failed → 0 broadcasts; kind routing structural vs
// content; reconcile failure NON-FATAL (ADR-11); F2 = the ADR-9 before-guard
// (before-undefined-while-ok never throws).
// ===========================================================================
describe('handleRichCommitIpc — the IPC_EDIT_RICH_COMMIT broadcast contract (§2.1 states 24–27, F1/F2)', () => {
  it('RED — handleRichCommitIpc is not exported yet (the F1 handler-broadcast extraction)', () => {
    expect(typeof editOps.handleRichCommitIpc).toBe('function')
  })

  it('24. real change (content) → reconcile ONCE with kind "content" + broadcast ONCE with kind "content"', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old' }))
      const reconcile = vi.fn(async () => {})
      const broadcast = vi.fn()
      const result = expectOk(
        await editOps.handleRichCommitIpc(store, { nodeId: 'n1', content: 'new', children: [] }, { reconcile, broadcast }),
      )
      expect(result.node.content).toBe('new')
      // EXACTLY ONE reconcile + ONE broadcast (content-only → kind content)
      expect(reconcile).toHaveBeenCalledTimes(1)
      expect(reconcile).toHaveBeenCalledWith('content', ['n1'], [])
      expect(broadcast).toHaveBeenCalledTimes(1)
      expect(broadcast).toHaveBeenCalledWith('content', ['n1'], [])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('26a. children change → broadcast kind "structural" (kind routing)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'same' }))
      const reconcile = vi.fn(async () => {})
      const broadcast = vi.fn()
      await editOps.handleRichCommitIpc(store, { nodeId: 'n1', content: 'same', children: [{ type: 'strong', content: 'new' }] }, { reconcile, broadcast })
      expect(reconcile).toHaveBeenCalledTimes(1)
      expect(reconcile).toHaveBeenCalledWith('structural', ['n1'], [])
      expect(broadcast).toHaveBeenCalledTimes(1)
      expect(broadcast).toHaveBeenCalledWith('structural', ['n1'], [])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('25. no-op commit → ZERO reconciles + ZERO broadcasts (idempotent — no redundant re-derive)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'same', children: [{ type: 'strong', content: 'bold' }] }))
      const reconcile = vi.fn(async () => {})
      const broadcast = vi.fn()
      const result = expectOk(
        await editOps.handleRichCommitIpc(store, { nodeId: 'n1', content: 'same', children: [{ type: 'strong', content: 'bold' }] }, { reconcile, broadcast }),
      )
      expect(result.node.content).toBe('same')
      expect(reconcile).not.toHaveBeenCalled()
      expect(broadcast).not.toHaveBeenCalled()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('§2.2 state 10 — malformed payload → store-error result, ZERO reconciles + ZERO broadcasts, never throws', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const reconcile = vi.fn(async () => {})
      const broadcast = vi.fn()
      for (const bad of [null, {}, { nodeId: 'n1' }, { nodeId: 'n1', content: 'x' }, { nodeId: 'n1', content: 'x', children: 'nope' }]) {
        const result = expectFail(
          await editOps.handleRichCommitIpc(store, bad as never, { reconcile, broadcast }),
        )
        expect(result.reason).toBe('store-error')
        expect(result.error).toBe('edit-rich-commit: nodeId, content, and children array required')
      }
      expect(reconcile).not.toHaveBeenCalled()
      expect(broadcast).not.toHaveBeenCalled()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('17. failed op (deleted-node) → deleted-node result, ZERO reconciles + ZERO broadcasts', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1'))
      await store.removeNode('n1')
      const reconcile = vi.fn(async () => {})
      const broadcast = vi.fn()
      const result = expectFail(
        await editOps.handleRichCommitIpc(store, { nodeId: 'n1', content: 'x', children: [] }, { reconcile, broadcast }),
      )
      expect(result.reason).toBe('deleted-node')
      expect(reconcile).not.toHaveBeenCalled()
      expect(broadcast).not.toHaveBeenCalled()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('27/ADR-11 — a REJECTING reconcile is NON-FATAL: caught, the broadcast still fires, no unhandled rejection', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await store.putNode(makeNode('n1', { content: 'old' }))
      const reconcile = vi.fn(async () => { throw new Error('embedder down') })
      const broadcast = vi.fn()
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      try {
        // must RESOLVE (not reject) — the reconcile rejection is swallowed + logged
        const result = expectOk(
          await editOps.handleRichCommitIpc(store, { nodeId: 'n1', content: 'new', children: [] }, { reconcile, broadcast }),
        )
        expect(result.node.content).toBe('new')
        // the broadcast still fires (non-fatal reconcile)
        expect(broadcast).toHaveBeenCalledTimes(1)
        expect(broadcast).toHaveBeenCalledWith('content', ['n1'], [])
        expect(reconcile).toHaveBeenCalledTimes(1)
        // the rejection was caught + logged, not unhandled
        expect(errSpy).toHaveBeenCalledWith('[provident-main] retrieval index reconcile failed:', expect.any(Error))
      } finally {
        errSpy.mockRestore()
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F2/ADR-9 — before-undefined while ok (node-absent→recreated race) NEVER throws; falls back to NO broadcast', async () => {
    // A mock store: the FIRST getNode (handler-entry `before` capture) returns
    // undefined (node absent at entry); the LATER getNode (inside setRichText)
    // returns the node (recreated in between) → handleRichCommit returns ok.
    const node = makeNode('n1', { content: 'old' })
    let getCalls = 0
    const store = {
      getNode: vi.fn((id: string) => {
        getCalls++
        return getCalls === 1 ? undefined : node
      }),
      putNode: vi.fn(async (n: RagNode) => ({ ...n })),
    } as unknown as RagStore
    const reconcile = vi.fn(async () => {})
    const broadcast = vi.fn()
    // must NOT throw (a TypeError would surface as a rejected invoke)
    const result = expectOk(
      await editOps.handleRichCommitIpc(store, { nodeId: 'n1', content: 'new', children: [] }, { reconcile, broadcast }),
    )
    // ok surfaced (the recreated node was written), but before was undefined →
    // the broadcast is suppressed (falls back to no broadcast rather than throwing)
    expect(reconcile).not.toHaveBeenCalled()
    expect(broadcast).not.toHaveBeenCalled()
  })
})
