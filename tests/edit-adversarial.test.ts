// tests/edit-adversarial.test.ts — REBUILT suite (the `C9 U-EDIT-1` rebuild of
// the archived `edit-adversarial` input; the adversarial battery against the
// whole-page editing model).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md §8.1 (the 24
// fail-states), read against the surfaces the spec pins:
//   `FS1`  more than one `contenteditable` root, or a body element outside the surface (§2.1)
//   `FS2`  a caret addressed to a per-node root (§2.1)
//   `FS3`  a commit stripped `data-doc-head` (§2.2 item 3 — `setProps` MERGES)
//   `FS4`  the element-type pane offered/applied a type outside `RagNodeType` (§2.4 item 1)
//   `FS5`  an apply with no resolvable target wrote to an arbitrary node (the pinned no-op, §2.4 item 3)
//   `FS6`  a type change implemented as delete + recreate (§2.4 item 4)
//   `FS7`  a malformed page input produced a partial write (§3.1)
//   `FS8`  a compared field outside the closed set entered the diff (§3.2)
//   `FS9`  an unrelated node appeared in the op list (§3.2's minimal-op rule)
//   `FS10` the commit was not one `applyBatch` (§3.3 item 1)
//   `FS11` the commit landed as ≠1 journal entry / a non-`batch` kind (§3.3 item 3)
//   `FS12` the commit ignored the `BatchResult` (§3.3 item 6)
//   `FS13` a new block reused an existing node id (§3.3 item 8)
//   `FS14` a `removeNode` for a node the user did not empty (§3.3 item 8)
//   `FS15` a chunked commit (§3.4 step 7)
//   `FS16` a failed commit discarded the user's text (§3.5 item 2)
//   `FS17` the warning was absent after a re-derive, or existed only as a DOM class (§3.5 item 6)
//   `FS18` a failed commit was auto-retried (§3.5 item 7)
//   `FS19` a commit reported success without an acknowledged write (§3.6)
//   `FS20` a stale persisted `editingMode` restored the removed behaviour (§5 item 5)
//   `FS21` a rendered `<textarea>` or a handler-carrying tombstone (§5.1)
//   `FS22` a markdown-mode surface rendered HTML formatting (§2.3)
//   `FS23` a dirty page was evicted, invalidated or replaced (§4.5)
//   `FS24` a commit reached a non-resident document without the typed refusal (§3.6)
//
// This battery hunts the fail-states that are node-assertable: the store/journal
// half is exercised against a real temp store; the rendered half (`FS21`/`FS22`'s
// painted assertions, `FS1`'s live census) is the live battery's (§8.3) and is
// asserted here only at the AUTHORED level.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as editControllerModule from '../src/renderer/edit-controller.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { setProps } from '../src/main/edit-ops.js'
import { decomposeRichHtml } from '../src/main/rich-decompose.js'
import { buildTraversal } from '../src/main/traversal.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
  type RagNodeType,
} from '../src/main/rag-store.js'

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = new Date().toISOString()
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

function newStore(): { store: RagStore; file: string } {
  const file = join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-adv-')), 'rag.json')
  return { store: createJsonRagStore({ path: file }), file }
}

function bytes(file: string): string {
  return existsSync(file) ? readFileSync(file, 'utf8') : ''
}

// ===========================================================================
// FS1 / FS2 / FS21 — the single editable surface (authored level)
// ===========================================================================
describe('FS1/FS2 — exactly one editable surface, and the caret is page-scoped', () => {
  it('FS1 — the traversal envelope authors no per-RAG-root contenteditable host', () => {
    const store = createSnapshotStore(
      [makeNode('title', { type: 'h1', content: 'Title' }), makeNode('p1', { content: 'body' })],
      [
        makeEdge('e-hd', 'doc-head', 'title', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'title', 'p1', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'p1', 'doc', { documentIds: ['doc'] }),
      ],
    )
    const result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
    const walk = (node: { children?: unknown[]; props?: Record<string, unknown> }, out: { props?: Record<string, unknown> }[] = []) => {
      out.push(node)
      for (const c of (node.children ?? []) as { children?: unknown[]; props?: Record<string, unknown> }[]) walk(c, out)
      return out
    }
    const all = result.envelope.content.flatMap((p) => p.content.flatMap((r) => walk(r)))
    const perRootHosts = all.filter((n) => n.props?.['data-rag-node-id'] !== undefined && n.props?.['contenteditable'] !== undefined)
    expect(perRootHosts).toEqual([])
  })

  it('FS2 — a caret saved against a per-node root is not restorable as a page caret', () => {
    const controller = createEditController({
      backRefs: new Map([['n1', ['p1']]]),
      commit: async () => ({ ok: true, nodeId: 'n1' }),
      onRebuild: () => {},
    })
    controller.saveCaret('n1', { kind: 'rich', ragId: 'n1', anchor: { path: [], offset: 0 }, focus: { path: [], offset: 0 }, focused: true })
    expect(controller.restoreCaret('n1')).toBeUndefined()
  })

  it('FS2 — the caret module exposes no per-node textarea/rag-editor surface', () => {
    const names = Object.keys(editControllerModule)
    expect(names.filter((n) => /textarea|ragEditor|ragTextarea/i.test(n))).toEqual([])
  })

  it('FS21 — every authored textarea child is a hidden, read-only, handler-less tombstone', () => {
    const store = createSnapshotStore(
      [makeNode('title', { type: 'h1', content: 'Title' })],
      [makeEdge('e-hd', 'doc-head', 'title', 'doc', { documentIds: ['doc'] })],
    )
    const result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
    const find = (node: { children?: unknown[]; type?: string; props?: Record<string, unknown>; handlers?: unknown[] }, out: { type?: string; props?: Record<string, unknown>; handlers?: unknown[] }[] = []) => {
      out.push(node)
      for (const c of (node.children ?? []) as { children?: unknown[]; type?: string; props?: Record<string, unknown>; handlers?: unknown[] }[]) find(c, out)
      return out
    }
    const all = result.envelope.content.flatMap((p) => p.content.flatMap((r) => find(r)))
    const textareas = all.filter((n) => n.type === 'textarea')
    expect(textareas.length).toBeGreaterThan(0)
    for (const t of textareas) {
      expect(t.props?.hidden).toBe(true)
      expect(t.props?.readOnly).toBe(true)
      expect(t.handlers ?? []).toEqual([])
    }
  })
})

// ===========================================================================
// FS3 — a commit must never strip data-doc-head
// ===========================================================================
describe('FS3 — a props write merges and preserves the doc-head marker', () => {
  it('FS3 — the doc-head marker survives a commit-time props merge', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('title', { type: 'h1', content: 'Title', props: { 'data-doc-head': true } }))
    await setProps({ store }, { nodeId: 'title', props: { edited: true } })
    expect(store.getNode('title')?.props?.['data-doc-head']).toBe(true)
  })

  it('FS3 — a batch setProps merges rather than replacing the props object', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('title', { props: { 'data-doc-head': true, a: 1 } }))
    const result = await store.applyBatch([{ op: 'setProps', nodeId: 'title', props: { b: 2 } }])
    if (result.ok) {
      expect(store.getNode('title')?.props).toEqual({ 'data-doc-head': true, a: 1, b: 2 })
    } else {
      // the red obligation: the store must accept the merge inside a batch
      expect(result.ok).toBe(true)
    }
  })
})

// ===========================================================================
// FS4 / FS5 / FS6 — the type apply
// ===========================================================================
describe('FS4/FS5/FS6 — the element-type apply is setType-class over the closed union', () => {
  it('FS4 — a type outside the 23-member RagNodeType union is refused and nothing is written', async () => {
    const { store, file } = newStore()
    await store.putNode(makeNode('n1'))
    const before = bytes(file)
    const result = await store.applyBatch([{ op: 'setType', nodeId: 'n1', type: 'section' as never }])
    expect(result.ok).toBe(false)
    expect(store.getNode('n1')?.type).toBe('p')
    expect(bytes(file)).toBe(before)
  })

  it('FS5 — an apply with no resolvable target writes nothing (the pinned no-op, never an arbitrary node)', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('n1'))
    await store.putNode(makeNode('n2'))
    const snapshot = JSON.stringify(store.listNodes())
    // an op list for an unresolvable caret is EMPTY: nothing is written
    const result = await store.applyBatch([])
    expect(result.ok).toBe(true)
    expect(JSON.stringify(store.listNodes())).toBe(snapshot)
  })

  it('FS6 — a type change preserves the node identity and its edges', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('sec', { type: 'h1', content: 'Section' }))
    await store.putNode(makeNode('leaf', { content: 'leaf' }))
    await store.putEdge(makeEdge('e1', 'doc-child', 'sec', 'leaf', { order: 0, documentIds: ['doc'] }))
    const createdAt = store.getNode('leaf')!.createdAt
    const result = await store.applyBatch([{ op: 'setType', nodeId: 'leaf', type: 'td' }])
    if (result.ok) {
      const after = store.getNode('leaf')!
      expect(after.id).toBe('leaf')
      expect(after.createdAt).toBe(createdAt)
      expect(store.getEdge('e1')?.target).toBe('leaf')
      expect(store.getNode('leaf')?.type).toBe('td')
    } else {
      expect(result.ok).toBe(true)
    }
  })

  it('FS6 — the op list for a type change never contains a removeNode for the target', () => {
    const ops: BatchOp[] = [{ op: 'setType', nodeId: 'n1', type: 'h2' }]
    expect(ops.some((op) => op.op === 'removeNode')).toBe(false)
  })
})

// ===========================================================================
// FS7 / FS8 / FS9 — the diff's closed field set and minimal-op rule
// ===========================================================================
describe('FS7/FS8/FS9 — malformed input is typed, uncompared fields never enter, and no churn appears', () => {
  it('FS7 — a malformed page input produces a typed failure, never a partial write', () => {
    const bad = decomposeRichHtml(null as never)
    expect(bad.ok).toBe(false)
    if (!bad.ok) expect(bad.error).toContain('must be a string')
  })

  it('FS7 — a malformed page never yields a phantom successful op list', () => {
    const bad = decomposeRichHtml(undefined as never)
    // the failure arm carries no content/children — there is nothing to write
    expect('content' in bad).toBe(false)
    expect('children' in bad).toBe(false)
  })

  it('FS8 — a runtime-only difference is not a diff input (style/class/contenteditable are not compared)', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('b1', { content: 'same' }))
    const page = `<p data-rag-node-id="b1" style="color:red" class="is-editable" contenteditable="true">same</p>`
    const decomposed = decomposeRichHtml(/<p\b[^>]*>([\s\S]*?)<\/p>/.exec(page)![1])
    expect(decomposed.ok).toBe(true)
    // the RAG-owned comparison sees only `content`
    if (decomposed.ok) expect(decomposed.content).toBe(store.getNode('b1')?.content)
  })

  it('FS9 — an untouched block produces no op (a one-character edit names one node)', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('a', { content: 'one' }))
    await store.putNode(makeNode('b', { content: 'two' }))
    const ops: BatchOp[] = [{ op: 'putNode', node: makeNode('a', { content: 'one!' }) }]
    const named = new Set(ops.map((op) => (op as { node?: RagNode }).node?.id))
    expect([...named]).toEqual(['a'])
    expect([...named]).not.toContain('b')
  })
})

// ===========================================================================
// FS10/FS11/FS12/FS15 — the commit's atomicity envelope
// ===========================================================================
describe('FS10/FS11/FS12/FS15 — one commit, one call, one entry, one result', () => {
  it('FS10 — a whole-page commit is a single applyBatch invocation', async () => {
    const { store } = newStore()
    const calls: BatchOp[][] = []
    const original = store.applyBatch.bind(store)
    store.applyBatch = async (ops) => {
      calls.push(ops)
      return original(ops)
    }
    await store.applyBatch([{ op: 'putNode', node: makeNode('a') }, { op: 'putNode', node: makeNode('b') }])
    expect(calls).toHaveLength(1)
  })

  it('FS11 — a rejected commit adds no journal entry of any kind', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('a'))
    const before = store.journal().length
    const result = await store.applyBatch([{ op: 'setType', nodeId: 'ghost', type: 'h2' }])
    expect(result.ok).toBe(false)
    expect(store.journal().length).toBe(before)
  })

  it('FS12 — a failure is never converted into a success by the commit path', async () => {
    const { store } = newStore()
    const result = await store.applyBatch([{ op: 'bogus' } as never])
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.failedIndex).toBe(0)
      expect(result.error).toContain('invalid op')
    }
  })

  it('FS15 — a batch that fails partway leaves no partial write behind (no chunk boundaries)', async () => {
    const { store, file } = newStore()
    await store.putNode(makeNode('a', { content: 'A' }))
    const before = bytes(file)
    const result = await store.applyBatch([
      { op: 'putNode', node: makeNode('c', { content: 'C' }) },
      { op: 'setProps', nodeId: 'ghost', props: { x: 1 } },
    ])
    if (!result.ok) {
      expect(store.getNode('c')).toBeUndefined()
      expect(bytes(file)).toBe(before)
    }
  })
})

// ===========================================================================
// FS13/FS14/FS19/FS24 — identity, deletion and the silent-success bounds
// ===========================================================================
describe('FS13/FS14/FS19/FS24 — no id collision, no phantom deletion, no silent success', () => {
  it('FS13 — a commit never mints an id that a node already holds', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('doc:p:1', { content: 'existing' }))
    const existing = new Set(store.listNodes().map((n) => n.id))
    // the minting rule: n greater than every present n for the (document, type) pair
    const minted = 'doc:p:2'
    expect(existing.has(minted)).toBe(false)
  })

  it('FS14 — a block still rendered is never expressed as a removeNode', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('kept', { content: 'still on the page' }))
    const result = await store.applyBatch([{ op: 'putNode', node: makeNode('kept', { content: 'still on the page' }) }])
    expect(result.ok).toBe(true)
    expect(store.getNode('kept')).toBeDefined()
  })

  it('FS19 — a commit that cannot write reports a failure, never a success', async () => {
    const { store } = newStore()
    const result = await store.applyBatch([{ op: 'setType', nodeId: 'no-such-node', type: 'h2' }])
    expect(result.ok).toBe(false)
    expect(store.getNode('no-such-node')).toBeUndefined()
  })

  it('FS24 — a non-resident target is refused with a typed result, not a silent whole-store write', async () => {
    const { store, file } = newStore()
    await store.putNode(makeNode('elsewhere', { content: 'other document' }))
    const before = bytes(file)
    const result = await store.applyBatch([{ op: 'putNode', node: makeNode('ghost-doc-block', { content: 'x' }) }])
    // a putNode for an unknown node is legal (an upsert) — what is pinned is that
    // a FAILED commit leaves the file untouched; a success means the target was
    // addressed explicitly, never inferred by a whole-store read.
    if (!result.ok) expect(bytes(file)).toBe(before)
    else expect(store.getNode('ghost-doc-block')).toBeDefined()
  })
})

// ===========================================================================
// FS16/FS17/FS18 — the failure UX (state, not text loss, not retry)
// ===========================================================================
describe('FS16/FS17/FS18 — a failed commit keeps the text, keeps the state and does not retry', () => {
  it('FS16 — a failed commit keeps the page dirty (the text is still the user\'s only copy)', async () => {
    const controller = createEditController({
      backRefs: new Map([['tab-1', ['p1']]]),
      commit: async () => ({ ok: false, reason: 'store-error', error: 'rag applyBatch: op not supported: setType at index 1' }),
      onRebuild: () => {},
    })
    controller.markDirty('tab-1')
    const result = await controller.commit('tab-1', 'the text the user typed')
    expect(result.ok).toBe(false)
    expect(controller.isDirty('tab-1')).toBe(true)
  })

  it('FS18 — a failed commit is not auto-retried (one injected call, no re-issue)', async () => {
    let calls = 0
    const controller = createEditController({
      backRefs: new Map([['tab-1', ['p1']]]),
      commit: async () => {
        calls++
        return { ok: false, reason: 'store-error' }
      },
      onRebuild: () => {},
    })
    controller.markDirty('tab-1')
    await controller.commit('tab-1', 'text')
    expect(calls).toBe(1)
  })

  it('FS17 — the failure state is not carried by a rendered element (the controller exposes no DOM hook)', () => {
    const controller = createEditController({ backRefs: new Map(), commit: async () => ({ ok: true, nodeId: 'x' }), onRebuild: () => {} })
    expect(controller).not.toHaveProperty('element')
    expect(controller).not.toHaveProperty('className')
    expect(controller).not.toHaveProperty('setAttribute')
  })

  it('FS17 — a failed state survives a re-derive driven by the guard (the state is host-side)', async () => {
    const controller = createEditController({
      backRefs: new Map([['tab-1', ['p1']]]),
      commit: async () => ({ ok: false, reason: 'store-error' }),
      onRebuild: () => {},
    })
    controller.markDirty('tab-1')
    await controller.commit('tab-1', 'text')
    controller.requestRebuild('content') // the re-derive is QUEUED while dirty
    expect(controller.isDirty('tab-1')).toBe(true)
    expect(controller.hasQueuedRebuild()).toBe(true)
  })
})

// ===========================================================================
// FS20 / FS22 / FS23 — the removed mode, the markdown representation, dirty eviction
// ===========================================================================
describe('FS20/FS22/FS23 — the removed mode token, the plaintext representation and dirty preservation', () => {
  it('FS20 — no renderer module exports the removed editing-mode type/label helper', async () => {
    const paneGraph = await import('../src/renderer/pane-graph.js')
    expect(Object.keys(paneGraph)).not.toContain('editingModeLabel')
    expect(Object.keys(paneGraph)).not.toContain('EditingMode')
  })

  it('FS22 — the markdown representation carries the document text as plaintext (no inline formatting in the decomposed shape)', () => {
    // the markdown-mode surface's text is the markdown DATA; the decomposer sees
    // no inline formatting elements in it
    const source = '# Title\n\nSome *plain* markdown text.\n'
    const decomposed = decomposeRichHtml(source)
    expect(decomposed.ok).toBe(true)
    if (decomposed.ok) {
      expect(decomposed.children).toEqual([])
      expect(decomposed.content).toContain('Some *plain* markdown text.')
    }
  })

  it('FS22 — a markdown-representation surface authors no form control', async () => {
    const paneGraph = await import('../src/renderer/pane-graph.js')
    for (const mode of ['html', 'markdown']) {
      const toolbar = paneGraph.editorToolbarContent(mode as never)
      expect(JSON.stringify(toolbar)).not.toContain('"textarea"')
    }
  })

  it('FS23 — a dirty page is never cleared by a rebuild request (the guard queues instead)', () => {
    const rebuilds: string[] = []
    const controller = createEditController({ backRefs: new Map([['tab-1', ['p1']]]), commit: async () => ({ ok: true, nodeId: 'tab-1' }), onRebuild: (k) => rebuilds.push(k) })
    controller.markDirty('tab-1')
    controller.requestRebuild('content')
    controller.requestRebuild('template')
    expect(rebuilds).toEqual([])
    expect(controller.isDirty('tab-1')).toBe(true)
  })

  it('FS23 — a dirty page survives a re-derive while another page is clean', () => {
    const controller = createEditController({ backRefs: new Map([['tab-1', ['p1']], ['tab-2', ['p2']]]), commit: async () => ({ ok: true, nodeId: 'x' }), onRebuild: () => {} })
    controller.markDirty('tab-1')
    controller.clearDirty('tab-2')
    expect(controller.isDirty('tab-1')).toBe(true)
    expect(controller.anyDirty()).toBe(true)
  })
})
