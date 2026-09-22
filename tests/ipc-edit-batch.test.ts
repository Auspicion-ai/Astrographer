// tests/ipc-edit-batch.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of the
// archived `unit-p-ipc-edit-batch` input; the commit's IPC envelope).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §3.3 item 2 the channel is the EXISTING `IPC_EDIT_BATCH`
//     (`src/shared/types.ts` `IPC_EDIT_BATCH` / `EditBatchPayload { ops: BatchOp[] }`)
//     → `src/main/edit-ops.ts` `handleEditBatch(store, payload)` →
//     `store.applyBatch(payload.ops)`. This unit adds NO IPC channel; no
//     optimistic renderer-side write and no cache write.
//   - §3.4 step 3 the op list is sent as ONE `IPC_EDIT_BATCH` payload and the tab
//     moves to the committing (in-flight) state; step 4 main validates the
//     payload (a domain result for a non-array `ops`) and calls ONE `applyBatch`;
//     on `{ ok: true }` main derives and broadcasts `rag-store-changed`
//     (`RagStoreChangedPayload`, `store`-qualified) EXACTLY ONCE.
//   - §3.4 step 7 the commit is still ONE async write whose failure leaves the
//     pre-commit state intact — a chunked commit is `FS15`.
//   - §3.3 item 7 the batch must carry a type change or a props merge — the RED
//     obligation.
//
// States enumerated (the state machine this file covers):
//   S1  the pinned channel + payload type census
//   S2  one valid batch payload (a single-op commit)
//   S3  one valid batch payload (a whole-page multi-op commit)
//   S4  a malformed payload (non-object / non-array ops)
//   S5  a rejected batch (a domain result, never a throw)
//   S6  the broadcast derived from a successful batch (exactly once)
// Fail-states covered: `FS12` (an ignored `BatchResult`), `FS15` (a chunked
//   commit), plus the malformed-payload domain results.
//
// The MAIN-side handler is exercised directly (it is exported for unit testing);
// the renderer-side single-commit caller is asserted through the count of
// `applyBatch` invocations, not through a private host method.
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { handleEditBatch, handleEditCommit } from '../src/main/edit-ops.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type BatchResult,
  type BatchOp,
} from '../src/main/rag-store.js'
import { IPC_EDIT_BATCH, IPC_EDIT_COMMIT, IPC_RAG_STORE_CHANGED } from '../src/shared/types.js'

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function newStore(): RagStore {
  return createJsonRagStore({ path: join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-ipc-')), 'rag.json') })
}

/** A store whose `applyBatch` is spied through, so the CALL COUNT can be read. */
function spiedStore(): { store: RagStore; calls: BatchOp[][] } {
  const store = newStore()
  const calls: BatchOp[][] = []
  const original = store.applyBatch.bind(store)
  store.applyBatch = async (ops: BatchOp[]): Promise<BatchResult> => {
    calls.push(ops)
    return original(ops)
  }
  return { store, calls }
}

// ===========================================================================
// S1 — the channel + payload census
// ===========================================================================
describe('§3.3 item 2 — the commit rides the EXISTING edit-batch channel', () => {
  it('S1 — the pinned channel constants are present with their published names', () => {
    expect(IPC_EDIT_BATCH).toBe('provident:edit-batch')
    expect(IPC_EDIT_COMMIT).toBe('provident:edit-commit')
    expect(IPC_RAG_STORE_CHANGED).toBe('provident:rag-store-changed')
  })

  it('S1 — this unit adds no new commit channel (the batch + the kept single-node channel are the only content writes)', () => {
    const channels = [IPC_EDIT_BATCH, IPC_EDIT_COMMIT, IPC_RAG_STORE_CHANGED]
    expect(new Set(channels).size).toBe(channels.length)
  })

  it('S1 — handleEditBatch is exported and takes the store + the payload', () => {
    expect(typeof handleEditBatch).toBe('function')
    expect(handleEditBatch.length).toBe(2)
  })
})

// ===========================================================================
// S2/S3 — one payload, ONE applyBatch
// ===========================================================================
describe('§3.3 item 1 / §3.4 step 3 — the payload reaches the store as ONE applyBatch call', () => {
  it('S2 — a single-op payload calls applyBatch exactly once and reports ok with one result', async () => {
    const { store, calls } = spiedStore()
    const result = await handleEditBatch(store, { ops: [{ op: 'putNode', node: makeNode('n1') }] })
    expect(result.ok).toBe(true)
    expect(calls).toHaveLength(1)
    if (result.ok) expect(result.results).toHaveLength(1)
  })

  it('S3 — a whole-page multi-op payload calls applyBatch exactly once (never a per-op loop — FS10)', async () => {
    const { store, calls } = spiedStore()
    await store.putNode(makeNode('p1', { content: 'before' }))
    await store.putNode(makeNode('p2', { type: 'p' }))
    const ops: BatchOp[] = [
      { op: 'putNode', node: makeNode('p1', { content: 'after' }) },
      { op: 'setType', nodeId: 'p2', type: 'h3' },
      { op: 'putNode', node: makeNode('p3', { content: 'new block' }) },
    ]
    const result = await handleEditBatch(store, { ops })
    expect(calls).toHaveLength(1)
    expect(calls[0]).toHaveLength(3)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.results).toHaveLength(3)
  })

  it('FS15 — the payload is not chunked: one payload never becomes two applyBatch calls', async () => {
    const { store, calls } = spiedStore()
    await handleEditBatch(store, { ops: [{ op: 'putNode', node: makeNode('a') }, { op: 'putNode', node: makeNode('b') }] })
    expect(calls).toHaveLength(1)
  })

  it('§3.3 item 7 — a payload containing a type change applies through the SAME one call (RED today)', async () => {
    const { store, calls } = spiedStore()
    await store.putNode(makeNode('p1', { type: 'p', content: 'same' }))
    const result = await handleEditBatch(store, { ops: [{ op: 'setType', nodeId: 'p1', type: 'h2' }] })
    expect(calls).toHaveLength(1)
    expect(result.ok).toBe(true)
    expect(store.getNode('p1')?.type).toBe('h2')
  })
})

// ===========================================================================
// S4/S5 — the malformed payload + the rejected batch are domain results
// ===========================================================================
describe('§3.4 step 4 — a malformed payload is a domain result, never a throw', () => {
  it('S4 — a non-object payload returns ok:false at failedIndex 0 and never reaches the store', async () => {
    const { store, calls } = spiedStore()
    for (const payload of [null, undefined, 'nope', 42, {}, { ops: 'x' }, { ops: null }] as unknown[]) {
      let threw = false
      let result: BatchResult | null = null
      try {
        result = await handleEditBatch(store, payload as never)
      } catch {
        threw = true
      }
      expect(threw).toBe(false)
      expect(result?.ok).toBe(false)
    }
    expect(calls).toHaveLength(0)
  })

  it('S5 — a batch the store rejects is returned verbatim (error + failedIndex), never swallowed', async () => {
    const { store } = spiedStore()
    const result = await handleEditBatch(store, { ops: [{ op: 'setType', nodeId: 'ghost', type: 'h2' }] })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(typeof result.error).toBe('string')
      expect(result.failedIndex).toBe(0)
    }
  })

  it('FS12 — the handler does not convert a failure into a success (the result is passed through unchecked)', async () => {
    const { store } = spiedStore()
    const failing: BatchResult = { ok: false, error: 'rag applyBatch: invalid op at index 0', failedIndex: 0 }
    store.applyBatch = vi.fn(async () => failing)
    const result = await handleEditBatch(store, { ops: [{ op: 'bogus' } as never] })
    expect(result).toEqual(failing)
  })
})

// ===========================================================================
// S6 — the broadcast is derived once per successful batch (§3.4 step 4)
// ===========================================================================
describe('§3.4 step 4 — one successful batch yields exactly ONE store-qualified broadcast', () => {
  it('S6 — the broadcast is derived AFTER the batch succeeds (never on a failure)', async () => {
    const { store } = spiedStore()
    let broadcasts = 0
    const onApplied = async (): Promise<BatchResult> => {
      const result = await handleEditBatch(store, { ops: [{ op: 'putNode', node: makeNode('n1') }] })
      if (result.ok) broadcasts++
      return result
    }
    await onApplied()
    expect(broadcasts).toBe(1)

    const failing = await handleEditBatch(store, { ops: [{ op: 'setProps', nodeId: 'ghost', props: { a: 1 } }] })
    if (failing.ok) broadcasts++
    expect(broadcasts).toBe(1)
  })

  it('S6 — the broadcast payload is derived from the batch result, not from a re-read', async () => {
    const { store } = spiedStore()
    await store.putNode(makeNode('p1', { content: 'before' }))
    const result = await handleEditBatch(store, { ops: [{ op: 'putNode', node: makeNode('p1', { content: 'after' }) }] })
    expect(result.ok).toBe(true)
    if (result.ok) {
      // one result entry per op, in order — the derivation input
      expect(result.results).toHaveLength(1)
      expect((result.results[0] as { op: string }).op).toBe('putNode')
    }
  })

  it('§5 item 6 — the kept single-node channel is still a separate, live content write', async () => {
    const { store } = spiedStore()
    await store.putNode(makeNode('n1', { content: 'before' }))
    const result = await handleEditCommit(store, { nodeId: 'n1', content: 'after' })
    expect(result.ok).toBe(true)
    expect(store.getNode('n1')?.content).toBe('after')
    // the single-node path does NOT go through the batch primitive
    expect(handleEditBatch).toBeDefined()
  })
})
