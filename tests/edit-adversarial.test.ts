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
//   `FS21` ANY authored `type: 'textarea'` child / `textarea-<ragId>` id /
//        `rag-textarea-*` name, or a rendered `<textarea>` (§5.1 as amended
//        2026-09-21 — §11 amendment `11.9` item 2: no textarea child is
//        authored at all, and the rendered census is zero)
//   `FS22` a markdown-mode surface rendered HTML formatting (§2.3)
//   `FS23` a dirty page was evicted, invalidated or replaced (§4.5)
//   `FS24` a commit reached a non-resident document without the typed refusal (§3.6)
//
// This battery hunts the fail-states that are node-assertable: the store/journal
// half is exercised against a real temp store; the rendered half (`FS21`/`FS22`'s
// painted assertions, `FS1`'s live census) is the live battery's (§8.3) and is
// asserted here at the AUTHORED level plus the mounted-DOM census. The
// decode/diff rows read the ADAPTER `src/main/page-diff.ts` (`decodePage` /
// `buildPageOps` — the ONLY module that imports the adopted package, §3.1 /
// §11 amendment `11.9` item 1): there is NO test-local decode/diff in this file.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, readFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as editControllerModule from '../src/renderer/edit-controller.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { setProps } from '../src/main/edit-ops.js'
import { buildTraversal } from '../src/main/traversal.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { decodePage, buildPageOps, type PageDiffSnapshot } from '../src/main/page-diff.js'
import type { RagSnapshotPayload } from '../src/shared/types.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
} from '../src/main/rag-store.js'

beforeAll(() => {
  installShim()
})

/** The store's read-only node/edge view — the seam shape of §3.1. */
function snapshotOf(store: RagStore): PageDiffSnapshot {
  const payload: RagSnapshotPayload = {
    store: 'main',
    nodes: store.listNodes().map((n) => ({
      id: n.id,
      type: n.type,
      content: n.content,
      props: n.props,
      children: n.children,
      ownedNodeIds: n.ownedNodeIds,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
    edges: store.listEdges().map((e) => ({
      id: e.id,
      kind: e.kind,
      source: e.source,
      target: e.target,
      order: e.order,
      documentIds: e.documentIds,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  }
  return payload as unknown as PageDiffSnapshot
}

/** Every node id an op names (`nodeId`, `node.id`, `edge.source`/`target`). */
function opNodeIds(ops: BatchOp[]): string[] {
  const ids: string[] = []
  for (const op of ops) {
    const anyOp = op as { nodeId?: string; node?: RagNode; id?: string; edge?: RagEdge }
    if (typeof anyOp.nodeId === 'string') ids.push(anyOp.nodeId)
    if (typeof anyOp.node?.id === 'string') ids.push(anyOp.node.id)
    if (typeof anyOp.id === 'string') ids.push(anyOp.id)
    if (typeof anyOp.edge?.source === 'string') ids.push(anyOp.edge.source)
    if (typeof anyOp.edge?.target === 'string') ids.push(anyOp.edge.target)
  }
  return ids
}

/** The adapter's op list for a page against a store, or its typed refusal. */
function pageOps(html: string, store: RagStore, documentId = 'doc') {
  return buildPageOps(decodePage(html), snapshotOf(store), documentId)
}

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

  it('FS21 — NO textarea child is authored anywhere in the traversal envelope (§11 amendment 11.9 item 2)', () => {
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
    // the census is ZERO — an authored `type: 'textarea'` child is itself the
    // fail-state now (the tombstone exception is retired)
    expect(all.filter((n) => n.type === 'textarea')).toEqual([])
    // NON-VACUITY: the walk really did collect the document's authored nodes
    expect(all.length).toBeGreaterThan(1)
    // and no retired id / handler name survives anywhere in the envelope
    expect(JSON.stringify(result.envelope)).not.toContain('textarea-')
    expect(JSON.stringify(result.envelope)).not.toContain('rag-textarea-')
  })

  it('FS21 — the RENDERED DOM census is ZERO `<textarea>` in the stage region', () => {
    const store = createSnapshotStore(
      [makeNode('title', { type: 'h1', content: 'Title' }), makeNode('p1', { content: 'body' })],
      [
        makeEdge('e-hd', 'doc-head', 'title', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'title', 'p1', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'p1', 'doc', { documentIds: ['doc'] }),
      ],
    )
    const result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
    const mount = mountEl()
    const runtime = new Runtime({ mount: mount as never, envelope: result.envelope as never })
    runtime.loadEnvelope(result.envelope as never)
    expect(mount.querySelectorAll('textarea')).toHaveLength(0)
    // NON-VACUITY: the document really did materialize
    expect(mount.querySelectorAll('[data-rag-node-id]').length).toBeGreaterThan(0)
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
    // REPAIRED (RCA-3 second remand): the previous form read `if (result.ok) {
    // …merge… } else { expect(result.ok).toBe(true) }`, so BOTH branches passed
    // and a wholesale-props write was never caught. The failure arm is now
    // asserted FIRST, and the merge itself is the discriminator: a replacement
    // write would drop `data-doc-head` and `a`.
    const { store } = newStore()
    await store.putNode(makeNode('title', { props: { 'data-doc-head': true, a: 1 } }))
    const result = await store.applyBatch([{ op: 'setProps', nodeId: 'title', props: { b: 2 } }])
    expect(result.ok, 'the store must APPLY a `setProps` inside a batch (§3.3 item 7 — the red obligation this unit closed)').toBe(true)
    if (!result.ok) return
    expect(store.getNode('title')?.props, 'the merge preserves every unnamed key (a replacement write is FS3)').toEqual({
      'data-doc-head': true,
      a: 1,
      b: 2,
    })
    // the discriminating control: a WHOLESALE write (the fail-state) really does
    // drop the marker — so the assertion above is not vacuous
    await store.putNode(makeNode('title', { props: { b: 2 } }))
    expect(store.getNode('title')?.props?.['data-doc-head'], 'CONTROL: a wholesale props write drops the doc-head marker').toBeUndefined()
  })
})

// ===========================================================================
// FS4 / FS5 / FS6 — the type apply
// ===========================================================================
describe('FS4/FS5/FS6 — the element-type apply is setType-class over the closed union', () => {
  it('FS4 — a type outside the 23-member RagNodeType union is REFUSED at BOTH seams, and nothing is written', async () => {
    // REPAIRED (RCA-3 second remand): the row pinned only the store's rejection,
    // so an APPLY seam that offered/applied an out-of-union type (the §2.4 item 1
    // proposition) was invisible. The adapter's own closed-set guard is now
    // driven as well, and the in-union change is the discriminating control.
    const RAG_NODE_TYPES = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote',
      'pre', 'code', 'strong', 'em', 'a', 'img', 'div', 'table', 'thead', 'tr', 'td', 'th',
    ]
    expect(RAG_NODE_TYPES.length, 'the closed union is the 23-member `RagNodeType` census (§2.4 item 1)').toBe(23)
    const { store, file } = newStore()
    await store.putNode(makeNode('n1', { content: 'payload' }))
    const before = bytes(file)
    const journalBefore = store.journal().length
    // (a) the ADAPTER refuses a block element outside the closed set (never
    //     retypes it — a `section` is not expressible)
    const refused = pageOps(`<section data-rag-node-id="n1">payload</section>`, store)
    expect(refused.ok, 'an element outside the closed RagNodeType set is REFUSED by the adapter, never mapped').toBe(false)
    if (!refused.ok) expect(refused.kind, 'the refusal is the typed `decompose-failed` class').toBe('decompose-failed')
    expect(bytes(file), 'a refused page writes nothing').toBe(before)
    // (b) the STORE rejects an out-of-union `setType`
    const result = await store.applyBatch([{ op: 'setType', nodeId: 'n1', type: 'section' as never }])
    expect(result.ok, 'the store rejects a type outside the closed union (enforced at the write too)').toBe(false)
    expect(store.getNode('n1')?.type).toBe('p')
    expect(bytes(file), 'a rejected type apply leaves the store byte-identical').toBe(before)
    expect(store.journal().length, 'a rejected type apply adds no journal entry').toBe(journalBefore)
    // (c) the CONTROL: an IN-UNION type change IS applied (the oracle discriminates)
    const okResult = await store.applyBatch([{ op: 'setType', nodeId: 'n1', type: 'h2' }])
    expect(okResult.ok, 'an in-union type change is applied').toBe(true)
    expect(store.getNode('n1')?.type).toBe('h2')
  })

  it('FS5 — an apply with NO resolvable target is a typed refusal that writes to no node (never an arbitrary one)', async () => {
    // REPAIRED (RCA-3 second remand): the previous form applied an EMPTY op list
    // and asserted nothing changed — it never invoked the unresolvable-target
    // path at all. This row drives the real apply seam (`edit-ops.ts` `setProps`)
    // with a target that resolves to no node.
    const { store, file } = newStore()
    await store.putNode(makeNode('n1'))
    await store.putNode(makeNode('n2'))
    const before = JSON.stringify(store.listNodes())
    const beforeBytes = bytes(file)
    const journalBefore = store.journal().length
    const result = await setProps({ store }, { nodeId: 'ghost-target', props: { align: 'center' } })
    expect(result.ok, 'an unresolvable target is a TYPED refusal').toBe(false)
    if (!result.ok) expect(result.error, 'the refusal names the missing target').toContain('node not found')
    expect(
      JSON.stringify(store.listNodes()),
      'NO node was written — the refusal never falls back to an arbitrary node (FS5)',
    ).toBe(before)
    expect(bytes(file)).toBe(beforeBytes)
    expect(store.journal().length, 'a refusal adds no journal entry').toBe(journalBefore)
    // the discriminating CONTROL: the SAME call against a resolvable target WRITES
    const ok = await setProps({ store }, { nodeId: 'n1', props: { align: 'center' } })
    expect(ok.ok, 'the same seam DOES write for a resolvable target').toBe(true)
    expect(store.getNode('n1')?.props?.align).toBe('center')
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

  it('FS6 — the ADAPTER\'s own op list for a type change carries one `setType` and no `removeNode` for the target', async () => {
    // REPAIRED (RCA-3 second remand): the previous form built a literal
    // `[{ op: 'setType' }]` array and asserted it contained no `removeNode` — a
    // tautology over test-authored data. The op list is now the ADAPTER's own,
    // and the write is driven through the store; the identity-preservation
    // proposition is additionally carried by draws in
    // `tests/unit-u-edit-1-property-register.test.ts` (`P-IM-3`).
    const { store } = newStore()
    const children = [{ type: 'strong' as const, content: 'inline', offset: 0 }]
    await store.putNode(makeNode('n1', { content: 'payload', children, props: { 'data-doc-head': true } }))
    const built = pageOps(`<h2 data-rag-node-id="n1">payload</h2>`, store)
    expect(built.ok, 'a type change maps to an op list').toBe(true)
    if (!built.ok) return
    expect(
      built.ops.filter((op) => op.op === 'removeNode'),
      'a type change is NEVER expressed as a removal (setType is never delete+create, §2.4 item 4)',
    ).toEqual([])
    const setTypeOps = built.ops.filter((op) => op.op === 'setType')
    expect(setTypeOps.length, 'a type-ONLY change is exactly ONE `setType`').toBe(1)
    expect((setTypeOps[0] as { nodeId: string }).nodeId, 'the op names the SAME node id (never a fresh id)').toBe('n1')
    const applied = await store.applyBatch(built.ops)
    expect(applied.ok, 'the type change applies').toBe(true)
    const after = store.getNode('n1')!
    expect(after.type).toBe('h2')
    expect(after.children, 'the inline children survive the retype').toEqual(children)
    expect(after.props?.['data-doc-head'], 'the doc-head marker survives the retype').toBe(true)
  })
})

// ===========================================================================
// FS7 / FS8 / FS9 — the diff's closed field set and minimal-op rule
// ===========================================================================
describe('FS7/FS8/FS9 — malformed input is typed, uncompared fields never enter, and no churn appears', () => {
  it('FS7 — a malformed page input produces the ADAPTER\'s typed refusal, never a partial write', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('b1', { content: 'alpha' }))
    const before = JSON.stringify(store.listNodes())
    // The seed's own `putNode` journals one `structural` entry (measured), so
    // the refusal's obligation is a ZERO DELTA — an absolute
    // `journal().length === 0` measured the seed, not the refusal.
    const journalBefore = store.journal().length
    const decoded = decodePage(null as never)
    expect(decoded.ok).toBe(false)
    if (!decoded.ok) {
      expect(decoded.kind).toBe('decompose-failed')
      expect(typeof decoded.message).toBe('string')
      expect('blocks' in decoded).toBe(false)
    }
    const result = buildPageOps(decoded, snapshotOf(store), 'doc')
    expect(result.ok).toBe(false)
    if (!result.ok) expect('ops' in result).toBe(false)
    expect(JSON.stringify(store.listNodes())).toBe(before)
    // the DISCRIMINATING assertion of FS7: the typed refusal ADDED no journal
    // entry (a partial write would have added one)
    expect(store.journal().length).toBe(journalBefore)
  })

  it('FS7 — no op list escapes a refused page (there is no phantom successful edit)', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('b1', { content: 'alpha' }))
    const result = buildPageOps(decodePage(undefined as never), snapshotOf(store), 'doc')
    expect(result.ok).toBe(false)
    expect(JSON.stringify(result)).not.toContain('"op"')
  })

  it('FS8 — a runtime-only difference never enters the op list (style/class/contenteditable are not compared)', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('b1', { content: 'same', props: { 'data-node-id': 'b1' } }))
    const result = pageOps(
      `<p data-rag-node-id="b1" style="color:red" class="is-editable" contenteditable="true">same</p>`,
      store,
    )
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.ops).toEqual([])
  })

  it('FS9 — an untouched block produces no op (a one-character edit names one node)', async () => {
    const { store } = newStore()
    await store.putNode(makeNode('a', { content: 'one' }))
    await store.putNode(makeNode('b', { content: 'two' }))
    const result = pageOps(`<p data-rag-node-id="a">one!</p><p data-rag-node-id="b">two</p>`, store)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.ops).toHaveLength(1)
    expect(new Set(opNodeIds(result.ops))).toEqual(new Set(['a']))
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
    // REPAIRED (RCA-3 second remand): the previous form wrapped every assertion in
    // `if (!result.ok)`, so a batch that reported SUCCESS (or that left the first
    // chunk applied) satisfied the row. The failure is now asserted.
    const { store, file } = newStore()
    await store.putNode(makeNode('a', { content: 'A' }))
    const before = bytes(file)
    const nodesBefore = JSON.stringify(store.listNodes())
    const journalBefore = store.journal().length
    const result = await store.applyBatch([
      { op: 'putNode', node: makeNode('c', { content: 'C' }) },
      { op: 'setProps', nodeId: 'ghost', props: { x: 1 } },
    ])
    expect(result.ok, 'a mid-batch failure is a discriminated `{ok:false}` (never a throw, never a success)').toBe(false)
    if (result.ok) return
    expect(result.failedIndex, 'the failing op is the SECOND one (the chunk boundary)').toBe(1)
    expect(store.getNode('c'), 'the first op was ROLLED BACK — no chunk boundary left a partial write').toBeUndefined()
    expect(JSON.stringify(store.listNodes())).toBe(nodesBefore)
    expect(bytes(file), 'a failed batch performs ZERO persists').toBe(before)
    expect(store.journal().length, 'a failed batch adds no journal entry').toBe(journalBefore)
    // the discriminating CONTROL: the same first op ALONE succeeds and persists
    const okResult = await store.applyBatch([{ op: 'putNode', node: makeNode('c', { content: 'C' }) }])
    expect(okResult.ok).toBe(true)
    expect(store.getNode('c'), 'the control really wrote (the oracle discriminates)').toBeDefined()
    expect(bytes(file), 'the control changed the store bytes').not.toBe(before)
  })
})

// ===========================================================================
// FS13/FS14/FS19/FS24 — identity, deletion and the silent-success bounds
// ===========================================================================
describe('FS13/FS14/FS19/FS24 — no id collision, no phantom deletion, no silent success', () => {
  it('FS13 — the minted id of a typed block never collides, driven through the ADAPTER\'s mint', async () => {
    // REPAIRED (RCA-3 second remand): the previous form asserted a HARD-CODED id
    // (`doc:p:2`) was absent from the id set without ever calling the mint — it
    // would pass against any implementation, including one that reused ids. This
    // row drives `buildPageOps`' own mint over a page the user typed into.
    const { store } = newStore()
    await store.putNode(makeNode('doc:p:1', { content: 'existing' }))
    const existing = new Set(store.listNodes().map((n) => n.id))
    const createdAt = store.getNode('doc:p:1')!.createdAt
    const built = pageOps(`<p data-rag-node-id="doc:p:1">existing</p><p data-rag-node-id="brand-new">typed</p>`, store)
    expect(built.ok, 'the page with a typed block maps to an op list').toBe(true)
    if (!built.ok) return
    const minted = built.ops.find((op) => op.op === 'putNode' && op.node.content === 'typed')
    expect(minted, 'the typed block is a MINTED `putNode` (§3.3 item 8)').toBeDefined()
    const mintedId = (minted as { node: RagNode }).node.id
    expect(existing.has(mintedId), `the minted id ${mintedId} must not collide with an existing node (FS13)`).toBe(false)
    expect(mintedId, 'the mint follows `documentId:type:n` above every present n for that pair').toBe('doc:p:2')
    const applied = await store.applyBatch(built.ops)
    expect(applied.ok, 'the commit lands').toBe(true)
    expect(store.getNode(mintedId), 'the minted node is written').toBeDefined()
    expect(store.getNode('doc:p:1')?.createdAt, 'the pre-existing node is untouched by the mint (no id reuse)').toBe(createdAt)
    expect(store.getNode('doc:p:1')?.content).toBe('existing')
  })

  it('FS14 — a block the page still RENDERS is never expressed as a removal (the removal path is really invoked)', async () => {
    // REPAIRED (RCA-3 second remand): the previous form applied a `putNode` for a
    // node that was never removed and asserted it still existed — it never
    // invoked the removal path, so a scan that treated every unmounted block as a
    // deletion passed. This row drives the adapter's removal scan over a real
    // containment shape. CROSS-REFERENCE: this row uses the TEST-LOCAL scoped-edge
    // shape (edges carrying `documentIds`); the PRODUCTION edge shape (the
    // importer's `doc-child` edges carry none, so the scan is EMPTY in production)
    // is pinned by `tests/page-diff-production-commit.test.ts` `SP1`/`SP2`.
    const { store } = newStore()
    await store.putNode(makeNode('sec', { type: 'div', content: 'Section' }))
    await store.putNode(makeNode('b1', { content: 'one' }))
    await store.putNode(makeNode('b2', { content: 'two' }))
    await store.putEdge(makeEdge('e-child-1', 'doc-child', 'sec', 'b1', { order: 0, documentIds: ['doc'] }))
    await store.putEdge(makeEdge('e-child-2', 'doc-child', 'sec', 'b2', { order: 1, documentIds: ['doc'] }))
    // every block is still rendered (one with an edited content)
    const built = pageOps(
      `<div data-rag-node-id="sec">Section</div><p data-rag-node-id="b1">one-edited</p><p data-rag-node-id="b2">two</p>`,
      store,
    )
    expect(built.ok, 'the page maps').toBe(true)
    if (!built.ok) return
    expect(
      built.ops.filter((op) => op.op === 'removeNode'),
      'a block still rendered is NEVER a deletion, even when a sibling block changed (FS14)',
    ).toEqual([])
    // NON-VACUITY: the scan is LIVE — the same store with b2 gone from the page
    // DOES emit the removal pair, so the empty list above is not a dead scan.
    const withRemoval = pageOps(`<div data-rag-node-id="sec">Section</div><p data-rag-node-id="b1">one-edited</p>`, store)
    expect(withRemoval.ok).toBe(true)
    if (!withRemoval.ok) return
    expect(
      withRemoval.ops.some((op) => op.op === 'removeNode' && op.id === 'b2'),
      'b2, genuinely gone from the page, IS removed (the removal path really runs)',
    ).toBe(true)
    expect(store.getNode('b2'), 'the adapter is PURE — it emits ops, it does not write').toBeDefined()
  })

  it('FS19 — a commit that cannot write reports a failure, never a success', async () => {
    const { store } = newStore()
    const result = await store.applyBatch([{ op: 'setType', nodeId: 'no-such-node', type: 'h2' }])
    expect(result.ok).toBe(false)
    expect(store.getNode('no-such-node')).toBeUndefined()
  })

  it('FS24 — a commit scoped to a document the PAGE is not scoped to is refused with a typed result, no op list', async () => {
    // REPAIRED / RE-POINTED (RCA-3 second remand): the previous form had BOTH
    // branches of `if (!result.ok)` passing (a store-level upsert is legal, so
    // the row asserted nothing either way) and never reached the non-resident
    // refusal. The PRODUCTION row carrying the `not-resident` half is the host
    // seam row (`tests/page-commit-failure-visibility.test.ts` `S2` and the
    // seam-driven `P-SM-1` in `tests/unit-u-edit-1-property-register.test.ts`),
    // where the store snapshot is absent and the typed `not-resident` record is
    // asserted. THIS row carries the adapter's own refusal half: a page whose
    // surface is scoped to a DIFFERENT document than the commit is refused with
    // no op list (§3.6/§11.10 item 4(b)) — a silent cross-document write is the
    // fail-state.
    const { store, file } = newStore()
    await store.putNode(makeNode('b1', { content: 'alpha' }))
    const before = bytes(file)
    const journalBefore = store.journal().length
    const foreign = `<div id="page-edit-surface" data-edit-surface="doc-other" contenteditable="true"><p data-rag-node-id="b1">alpha</p></div>`
    const built = pageOps(foreign, store, 'doc')
    expect(built.ok, 'a page scoped to another document is REFUSED (typed, with no op list)').toBe(false)
    if (!built.ok) expect(built.kind, 'the refusal is the typed `decompose-failed` class').toBe('decompose-failed')
    expect(bytes(file), 'the refusal writes nothing').toBe(before)
    expect(store.journal().length, 'the refusal journals nothing').toBe(journalBefore)
    // the discriminating CONTROL: the SAME page scoped to its OWN document maps
    const own = pageOps(foreign, store, 'doc-other')
    expect(own.ok, 'the same page scoped to its own document IS accepted (the oracle discriminates)').toBe(true)
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

  it('FS22 — the markdown representation carries the document text as plaintext (no inline formatting in the decoded page)', () => {
    // the markdown-mode surface's text is the markdown DATA — read through the
    // ADAPTER (the only decode path, §3.1): a plaintext surface decodes to one
    // block whose content is the markdown text and whose inline set is EMPTY
    const source = '# Title\n\nSome *plain* markdown text.\n'
    const decoded = decodePage(`<p data-rag-node-id="b1">${source}</p>`)
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.blocks).toHaveLength(1)
    expect(decoded.blocks[0].children ?? []).toEqual([])
    expect(decoded.blocks[0].content).toContain('Some *plain* markdown text.')
  })

  it('FS22 — a markdown-mode surface decodes WITHOUT minting HTML formatting nodes', () => {
    // the markdown text is DATA: `*plain*` and `# Title` are literal characters,
    // so no inline (`strong`/`em`) child and no heading-shaped block is derived
    const decoded = decodePage(`<p data-rag-node-id="b1"># Title\n\nSome *plain* markdown text.</p>`)
    expect(decoded.ok).toBe(true)
    if (!decoded.ok) return
    expect(decoded.blocks.map((b) => b.elementType)).toEqual(['p'])
    expect(decoded.blocks[0].children ?? []).toEqual([])
  })

  it('FS22 — a markdown-representation surface authors no form control', async () => {
    const paneGraph = await import('../src/renderer/pane-graph.js')
    for (const mode of ['html', 'markdown']) {
      const toolbar = paneGraph.editorToolbarContent(mode as never)
      expect(JSON.stringify(toolbar)).not.toContain('"textarea"')
    }
  })

  it('FS23 — the DIRTY-ENTRY rule: a rebuild is deferred while ANY page is dirty, and no other page\'s clear runs it', () => {
    // REPAIRED / RE-POINTED (RCA-3 second remand): the two previous rows pinned
    // the controller's queue flag and a `clearDirty` on a page that was never
    // dirty — neither could fail against a production that ran the queued rebuild
    // on ANY clear. This row drives the rule with discriminating transitions:
    //   (a) a dirty page defers the rebuild and keeps its text (queued, not run);
    //   (b) clearing a CLEAN sibling does NOT run the queued rebuild;
    //   (c) only when the LAST dirty page clears does the coalesced rebuild run.
    // CARRIER NOTE (re-point, recorded rather than demanded): the read model's
    // §5.1 dirty-entry EVICTION rule (`unit-reads-pivot-tab-cache`) has no module
    // in this build — no `tab-cache`/`evict` surface exists under `src/**` — so
    // the eviction half is carried by the host rows
    // (`tests/page-commit-tab-ownership.test.ts` T2/T4/T5,
    // `tests/page-commit-scope-ack-race.test.ts` N4b/N4c), which drive a real
    // close/switch and assert that no other tab's dirty page is dropped.
    const rebuilds: string[] = []
    const controller = createEditController({
      backRefs: new Map([['tab-1', ['p1']], ['tab-2', ['p2']]]),
      commit: async () => ({ ok: true, nodeId: 'tab-1' }),
      onRebuild: (k) => rebuilds.push(k),
    })
    controller.markDirty('tab-1')
    controller.requestRebuild('content')
    // (a) the rebuild is QUEUED, never run, and the dirty page survives
    expect(rebuilds, 'a dirty page defers the rebuild (the guard queues)').toEqual([])
    expect(controller.hasQueuedRebuild()).toBe(true)
    expect(controller.isDirty('tab-1')).toBe(true)
    // (b) clearing a CLEAN sibling must not run it
    controller.requestRebuild('template') // coalesced: template > content
    controller.clearDirty('tab-2')
    expect(rebuilds, 'another page\'s clear must NOT run the queued rebuild while this page is dirty').toEqual([])
    expect(controller.hasQueuedRebuild()).toBe(true)
    expect(controller.isDirty('tab-1'), 'the dirty page SURVIVES (its text is the only copy — FS23).').toBe(true)
    expect(controller.anyDirty()).toBe(true)
    // (c) the LAST dirty page clearing runs the coalesced rebuild, exactly once
    controller.clearDirty('tab-1')
    expect(rebuilds, 'the deferred rebuild runs once, coalesced by precedence (template)').toEqual(['template'])
    expect(controller.hasQueuedRebuild()).toBe(false)
    expect(controller.isDirty('tab-1')).toBe(false)
  })
})
