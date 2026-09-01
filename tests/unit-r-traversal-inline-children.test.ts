// tests/unit-r-traversal-inline-children.test.ts — Unit R: the traversal
// disambiguation of inline vs doc-children (docs/specs/unit-r-traversal-inline-children.md).
// Imports `buildTraversal` + `rebuildBackRefs` from ../src/main/traversal.js (the
// ESM module), the persisted RagNode/RagEdge shapes + createJsonRagStore from
// ../src/main/rag-store.js (Unit A — EXISTS), and the provident-ssr types.
//
// RED SET: the inline-children rendering in `buildSubtree` does NOT exist yet —
// the current `buildSubtree` authors only [textarea, doc-children] as the subtree
// root's children. Every test that asserts inline children appear in the
// envelope / backRefs / lineMap FAILS. That is the expected red set.
//
// STATE ENUMERATION (from the spec):
//   §5.6 HAPPY-PATH STATES (15):
//     1.  inline-children rendering happy (one strong child)
//     2.  all four inline child types (strong/em/a/img) with props merged
//     3.  authored ids `inline-<ragId>-<index>` (NOT rag-, distinct from textarea)
//     4.  ordering [inline children, textarea overlay, doc-children subtrees]
//     5.  node WITHOUT inline children (children: undefined) → no inline children
//     6.  empty children array (children: []) → no inline children
//     7.  disambiguation — inline children NOT in `materialized`
//     8.  disambiguation — inline children get NO backRefs entry (but their minted
//         node ids ARE in the owning node's entry)
//     9.  disambiguation — inline children get NO lineMap range (their lines are
//         part of the owning node's range)
//     10. `collectSubtreeIds` collects inline children into the node's OWN subtree
//     11. `assignSubtreeRanges` does NOT recurse inline children (part of own lines)
//     12. doc-children still disambiguated (node with BOTH inline + doc-children)
//     13. textarea overlay UNCHANGED (id/value/handlers/NO readOnly)
//     14. `rebuildBackRefs` unchanged (routes through buildTraversal)
//     15. fallback path (nestDocChildren: false) — inline children STILL rendered
//   §5.7 FAIL-STATES (8):
//     1.  inline child authored id NOT `rag-`-prefixed (A1)
//     2.  inline child authored id distinct from textarea's `textarea-<ragId>` (A2)
//     3.  inline child NOT added to `materialized` (A6)
//     4.  inline child does NOT mint a backRefs entry (A6)
//     5.  inline child does NOT mint a lineMap range (A6/A7)
//     6.  `collectSubtreeIds` does NOT descend into a `rag-`-prefixed inline child (A1)
//     7.  `assignSubtreeRanges` does NOT recurse into a `rag-`-prefixed inline child (A1)
//     8.  a malformed `children` array is rejected at write (store-level, Unit M)
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  buildTraversal,
  rebuildBackRefs,
  type TraversalResult,
} from '../src/main/traversal.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
} from '../src/main/rag-store.js'
import type { LegacyInitialData, LegacyContentPayload } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'

beforeAll(() => {
  installShim()
})

// ---- fixtures (persisted shapes, Unit A §5.1) ------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-unit-r-'))
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

function makeEdge(
  id: string,
  kind: RagEdge['kind'],
  source: string,
  target: string,
  overrides: Partial<RagEdge> = {},
): RagEdge {
  const now = new Date().toISOString()
  return {
    id,
    kind,
    source,
    target,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

async function seedStore(store: RagStore, nodes: RagNode[], edges: RagEdge[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
  for (const e of edges) await store.putEdge(e)
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

/** The ContentPayload whose subtree root carries the stable authored id
 *  `rag-<ragNodeId>` (§5.2 rule 2). */
function findPayloadByRootId(env: LegacyInitialData, ragId: string): LegacyContentPayload | undefined {
  return (env.content ?? []).find((p) => p.content[0]?.props?.id === `rag-${ragId}`)
}

/** A valid single-document flow where `rich` is the ONLY section (the doc-head)
 *  carrying the given inline `children`. Single-section so backRefs.size === 1
 *  and lineMap.ranges.length === 1 (one RAG object — the disambiguation tests
 *  assert the inline children do NOT add entries/ranges). */
async function seedRichDoc(store: RagStore, rich: RagNode): Promise<void> {
  await seedStore(store, [
    makeNode('doc', { type: 'div' }),
    rich,
  ], [
    makeEdge('e-head', 'doc-head', rich.id, 'doc', { documentIds: ['doc'] }),
    makeEdge('e-end', 'doc-end', rich.id, 'doc', { documentIds: ['doc'] }),
  ])
}

/** The inline child elements of a subtree root (the children whose authored id
 *  is `inline-`-prefixed). */
function inlineChildren(root: { children?: Array<{ props?: { id?: unknown } }> }): Array<{ props?: { id?: unknown } }> {
  return (root.children ?? []).filter((c) => typeof c.props?.id === 'string' && c.props.id.startsWith('inline-'))
}

// ===========================================================================
// §5.6 HAPPY-PATH STATES (1-15)
// ===========================================================================

describe('Unit R — inline-children rendering in buildSubtree (§5.6)', () => {
  it('1. inline-children rendering happy — a strong child renders as a child element of the subtree root', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'bold' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      // 0.4.0 content-XOR-children — the subtree root carries NO scalar content
      expect(root.content).toBeUndefined()
      // the inline strong element is present (filtered by its authored inline- id)
      const inline = inlineChildren(root)
      expect(inline).toHaveLength(1)
      expect(inline[0].type).toBe('strong')
      expect(inline[0].content).toBe('bold')
      expect(inline[0].props?.id).toBe('inline-rich-0')
      expect(inline[0].props?.['data-rag-node-id']).toBe('rich')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. all four inline child types — strong/em/a/img render as same-type elements with content + props merged', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', {
        children: [
          { type: 'strong', content: 'b' },
          { type: 'em', content: 'i' },
          { type: 'a', content: 'l', props: { href: 'https://x' } },
          { type: 'img', content: '', props: { src: 'x.png', alt: 'x' } },
        ],
      }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      const inline = inlineChildren(root)
      expect(inline.map((c) => c.type)).toEqual(['strong', 'em', 'a', 'img'])
      expect(inline[0].content).toBe('b')
      expect(inline[1].content).toBe('i')
      expect(inline[2].content).toBe('l')
      expect(inline[2].props?.href).toBe('https://x')
      expect(inline[3].props?.src).toBe('x.png')
      expect(inline[3].props?.alt).toBe('x')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. authored ids — each inline child id is `inline-<ragId>-<index>`, NOT rag- prefixed, distinct from the textarea id', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', {
        children: [
          { type: 'strong', content: 'b' },
          { type: 'em', content: 'i' },
        ],
      }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      const inline = inlineChildren(root)
      expect(inline).toHaveLength(2)
      expect(inline[0].props?.id).toBe('inline-rich-0')
      expect(inline[1].props?.id).toBe('inline-rich-1')
      // NOT rag- prefixed (A1)
      for (const c of inline) expect(String(c.props?.id)).not.toMatch(/^rag-/)
      // distinct from the textarea id (A2)
      expect(inline[0].props?.id).not.toBe('textarea-rich')
      expect(inline[1].props?.id).not.toBe('textarea-rich')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. ordering — the subtree root children array is [inline children, textarea overlay, doc-children subtrees]', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('rich', { type: 'p', content: 'Rich', children: [{ type: 'strong', content: 'b' }] }),
        makeNode('li1', { type: 'li', content: 'Item' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'rich', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'rich', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-c1', 'doc-child', 'rich', 'li1', { order: 0 }),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      const childIds = (root.children ?? []).map((c) => c.props?.id)
      // 0.4.0 content-XOR-children — the ordering is [interleaved body (a bare
      // `text` child for the node's content 'Rich' + the inline span), textarea
      // overlay, doc-children subtrees].
      expect(childIds).toEqual([undefined, 'inline-rich-0', 'textarea-rich', 'rag-li1'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. node WITHOUT inline children (children: undefined) → NO inline children; children array is [textarea, doc-children]', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich')) // no children field

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      expect(inlineChildren(root)).toHaveLength(0)
      const childIds = (root.children ?? []).map((c) => c.props?.id)
      // 0.4.0 content-XOR-children — the node's body is a bare `text` child
      // (its content), then the textarea overlay.
      expect(childIds).toEqual([undefined, 'textarea-rich'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. empty children array (children: []) → NO inline children; children array is [textarea, doc-children]', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      expect(inlineChildren(root)).toHaveLength(0)
      const childIds = (root.children ?? []).map((c) => c.props?.id)
      // 0.4.0 content-XOR-children — the node's body is a bare `text` child
      // (its content), then the textarea overlay.
      expect(childIds).toEqual([undefined, 'textarea-rich'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. disambiguation — inline children NOT in `materialized` (backRefs has one entry per RAG object, never an inline child)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // one entry for the RAG node, no entry keyed by an inline child id
      expect(result.backRefs.size).toBe(1)
      expect(result.backRefs.has('rich')).toBe(true)
      for (const key of result.backRefs.keys()) expect(key).not.toMatch(/^inline-/)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. disambiguation — inline children get NO backRefs entry, but their minted node ids ARE in the owning node\'s entry', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // one entry for the RAG node
      expect(result.backRefs.size).toBe(1)
      expect(result.backRefs.has('rich')).toBe(true)
      // the node's entry INCLUDES the inline children's minted node ids
      // (root + inline + textarea = 3 for one inline child)
      expect(result.backRefs.get('rich')!.length).toBeGreaterThanOrEqual(3)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. disambiguation — inline children get NO lineMap range; their lines are part of the owning node\'s range', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'bold' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // one range for the RAG node, no range keyed by an inline child id
      expect(result.lineMap.ranges).toHaveLength(1)
      expect(result.lineMap.ranges[0].ragNodeId).toBe('rich')
      for (const r of result.lineMap.ranges) expect(r.ragNodeId).not.toMatch(/^inline-/)

      // the inline content renders in the markdown (part of the node's own lines)
      const runtime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      runtime.loadEnvelope(result.envelope as never)
      expect(runtime.markdown()).toContain('bold')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. `collectSubtreeIds` collects inline children into the node\'s OWN subtree (backRefs entry grows)', async () => {
    const dir = freshDir()
    try {
      // with inline children
      const storeWith = createJsonRagStore({ path: join(dir, 'with.json') })
      await seedRichDoc(storeWith, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))
      const withResult = buildTraversal({ store: storeWith, documentIds: ['doc'], zoneName: 'main' })

      // without inline children (same node, plain text)
      const storeWithout = createJsonRagStore({ path: join(dir, 'without.json') })
      await seedRichDoc(storeWithout, makeNode('rich'))
      const withoutResult = buildTraversal({ store: storeWithout, documentIds: ['doc'], zoneName: 'main' })

      // the inline children's minted node ids are collected into the node's entry
      expect(withResult.backRefs.get('rich')!.length).toBeGreaterThan(withoutResult.backRefs.get('rich')!.length)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('11. `assignSubtreeRanges` does NOT recurse inline children — they are part of the node\'s OWN lines', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'bold' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // exactly one range for the node (no separate range minted for an inline child)
      expect(result.lineMap.ranges).toHaveLength(1)
      expect(result.lineMap.ranges[0].ragNodeId).toBe('rich')

      // the inline content is part of the node's own markdown lines
      const runtime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      runtime.loadEnvelope(result.envelope as never)
      expect(runtime.markdown()).toContain('bold')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. doc-children still disambiguated — a node with BOTH inline + doc-children keeps them separate', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('rich', { type: 'p', content: 'Rich', children: [{ type: 'strong', content: 'b' }] }),
        makeNode('li1', { type: 'li', content: 'Item' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'rich', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'rich', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-c1', 'doc-child', 'rich', 'li1', { order: 0 }),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      // ordering: [interleaved body (text + inline), textarea, doc-child]
      const childIds = (root.children ?? []).map((c) => c.props?.id)
      expect(childIds).toEqual([undefined, 'inline-rich-0', 'textarea-rich', 'rag-li1'])

      // backRefs: one entry for rich (including inline, excluding li1) + one for li1
      expect(result.backRefs.has('rich')).toBe(true)
      expect(result.backRefs.has('li1')).toBe(true)

      // lineMap: one range for rich + one for li1
      expect(result.lineMap.ranges.some((r) => r.ragNodeId === 'rich')).toBe(true)
      expect(result.lineMap.ranges.some((r) => r.ragNodeId === 'li1')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. textarea overlay UNCHANGED — a node with inline children still gets its textarea bound to node.content', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      const textarea = (root.children ?? []).find((c) => c.type === 'textarea')
      expect(textarea).toBeDefined()
      expect(textarea!.props?.id).toBe('textarea-rich')
      expect(textarea!.props?.value).toBe('content-rich')
      expect(textarea!.props?.['data-rag-node-id']).toBe('rich')
      expect(textarea!.props?.readOnly).toBeUndefined()
      expect(textarea!.handlers).toEqual([
        { name: 'rag-textarea-input', event: 'input' },
        { name: 'rag-textarea-blur', event: 'blur' },
      ])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('14. `rebuildBackRefs` unchanged — routes through buildTraversal and includes the inline children in the owning node\'s entry', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const nodes = store.listNodes()
      const edges = store.listEdges()
      const backRefs = rebuildBackRefs(nodes, edges, 'main')

      expect(backRefs.has('rich')).toBe(true)
      // the entry includes the inline children's minted node ids
      expect(backRefs.get('rich')!.length).toBeGreaterThanOrEqual(3)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('15. fallback path (nestDocChildren: false) — inline children are STILL rendered', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // a next-section cycle forces the family-pre-order fallback
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('rich', { type: 'p', content: 'Rich', children: [{ type: 'strong', content: 'bold' }] }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'rich', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'rich', 'head', { documentIds: ['doc'] }), // cycle
      ])

      let result: TraversalResult
      expect(() => {
        result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      }).not.toThrow()

      const root = findPayloadByRootId(result!.envelope, 'rich')!.content[0]
      // the inline children are STILL rendered (independent of nestDocChildren)
      const inline = inlineChildren(root)
      expect(inline).toHaveLength(1)
      expect(inline[0].type).toBe('strong')
      expect(inline[0].props?.id).toBe('inline-rich-0')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.7 FAIL-STATES (1-8)
// ===========================================================================

describe('Unit R — fail-states (§5.7)', () => {
  it('1. an inline child authored id is NOT `rag-`-prefixed (A1)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      const inline = inlineChildren(root)
      expect(inline).toHaveLength(1)
      for (const c of inline) expect(String(c.props?.id)).not.toMatch(/^rag-/)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. an inline child authored id is distinct from the textarea\'s `textarea-<ragId>` id (A2)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      const inline = inlineChildren(root)
      expect(inline).toHaveLength(1)
      expect(inline[0].props?.id).not.toBe('textarea-rich')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. an inline child is NOT added to `materialized` (A6) — backRefs/lineMap contain only RAG subtree roots', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      for (const key of result.backRefs.keys()) expect(key).not.toMatch(/^inline-/)
      for (const r of result.lineMap.ranges) expect(r.ragNodeId).not.toMatch(/^inline-/)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. an inline child does NOT mint a backRefs entry (A6) — one entry per RAG object', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      expect(result.backRefs.size).toBe(1)
      for (const key of result.backRefs.keys()) expect(key).not.toMatch(/^inline-/)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. an inline child does NOT mint a lineMap range (A6/A7) — one range per RAG object', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      expect(result.lineMap.ranges).toHaveLength(1)
      for (const r of result.lineMap.ranges) expect(r.ragNodeId).not.toMatch(/^inline-/)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. `collectSubtreeIds` does NOT descend into a `rag-`-prefixed inline child (A1) — inline children are collected into the node\'s OWN subtree', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'b' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      const inline = inlineChildren(root)
      expect(inline).toHaveLength(1)
      // the inline children's minted node ids are in the node's OWN backRefs entry
      expect(result.backRefs.get('rich')!.length).toBeGreaterThanOrEqual(3)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. `assignSubtreeRanges` does NOT recurse into a `rag-`-prefixed inline child (A1) — inline children are part of the node\'s OWN lines', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', { children: [{ type: 'strong', content: 'bold' }] }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // exactly one range for the node (no spurious range minted for an inline child)
      expect(result.lineMap.ranges).toHaveLength(1)
      expect(result.lineMap.ranges[0].ragNodeId).toBe('rich')

      // the inline content is part of the node's own markdown lines
      const runtime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      runtime.loadEnvelope(result.envelope as never)
      expect(runtime.markdown()).toContain('bold')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. a malformed `children` array is rejected at write (store-level, Unit M) — the traversal never sees it', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })

      // a non-array `children` is rejected
      await expect(store.putNode(makeNode('bad1', { children: 'not-an-array' as never }))).rejects.toThrow()
      // a child with an invalid type (span is NOT a RagNodeChildType) is rejected
      await expect(store.putNode(makeNode('bad2', { children: [{ type: 'span', content: 'x' }] as never }))).rejects.toThrow()
      // a child with a missing/non-string content is rejected
      await expect(store.putNode(makeNode('bad3', { children: [{ type: 'strong', content: 42 }] as never }))).rejects.toThrow()
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// Adversarial regression tests (host findings F1/F2/F3/F4/F6 — §3a)
// ===========================================================================
// The adversarial pass found these test gaps + a known-behavior note. The
// implementation is correct; these are regression tests + documentation of the
// accepted known behavior. All findings are LOW.
//
//   F1/F2 (LOW, known behavior): a multi-parent duplicate RAG node (≥2
//     `parent-child` parents) with inline children → each copy renders the
//     inline child with the SAME authored id `inline-<ragId>-<index>` (duplicate
//     ids across the envelope). This mirrors the existing `rag-<id>` subtree-root
//     collision and is DOCUMENTED KNOWN BEHAVIOR (no functional consequence —
//     inline children are never looked up by id). The test asserts the duplicate
//     renders the inline children in each copy; the duplicate-id behavior is
//     accepted, not asserted as an error.
//   F3 (LOW): a node with MANY inline children (20) → all inline ids are distinct
//     and ordered (`inline-<ragId>-0` … `inline-<ragId>-19`), and the node's
//     lineMap range still covers all their markdown lines.
//   F4 (LOW): an inline child whose own `props` carries `id: 'rag-foo'` and
//     `'data-rag-node-id': 'other'` → the authored `inline-<ragId>-<index>` id and
//     the owning `ragId` take precedence (the child's own props do NOT break the
//     disambiguation).
//   F6 (LOW): the family-pre-order fallback path (`nestDocChildren: false`) with a
//     node carrying BOTH inline children AND doc-children → the inline children
//     still render, and the doc-children become separate sections.

describe('Unit R — adversarial regression tests (F1/F2/F3/F4/F6)', () => {
  it('F1/F2 — a multi-parent duplicate RAG node with inline children renders the inline children in EACH copy (duplicate inline ids across the envelope — DOCUMENTED KNOWN BEHAVIOR)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('a', { type: 'p', content: 'A' }),
        makeNode('b', { type: 'p', content: 'B' }),
        makeNode('shared', { type: 'p', content: 'Shared', children: [{ type: 'strong', content: 'bold' }] }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'a', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'a', 'b', { documentIds: ['doc'] }),
        makeEdge('e-n3', 'next-section', 'b', 'end', { documentIds: ['doc'] }),
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        // shared has TWO parent-child parents (a, b — both sections)
        makeEdge('e-p1', 'parent-child', 'a', 'shared'),
        makeEdge('e-p2', 'parent-child', 'b', 'shared'),
      ])

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })

      // two duplicate subtrees for 'shared' (one per parent)
      const sharedPayloads = (result.envelope.content ?? []).filter(
        (p) => p.content[0]?.props?.id === 'rag-shared',
      )
      expect(sharedPayloads).toHaveLength(2)

      // EACH copy renders the inline child with the SAME authored id
      // `inline-shared-0` (duplicate ids across the envelope — DOCUMENTED KNOWN
      // BEHAVIOR, mirroring the `rag-shared` subtree-root collision; inline
      // children are never looked up by id, so no functional consequence). The
      // duplicate-id behavior is ACCEPTED, not asserted as an error.
      for (const p of sharedPayloads) {
        const inline = (p.content[0].children ?? []).filter((c) => c.type === 'strong')
        expect(inline).toHaveLength(1)
        expect(inline[0].props?.id).toBe('inline-shared-0')
        expect(inline[0].props?.['data-rag-node-id']).toBe('shared')
        expect(inline[0].content).toBe('bold')
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F3 — a node with MANY inline children (20) → all inline ids distinct + ordered, and the node\'s lineMap range still covers all their markdown lines', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const children = Array.from({ length: 20 }, (_, i) => ({ type: 'strong' as const, content: `bold-${i}` }))
      await seedRichDoc(store, makeNode('rich', { children }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      const inline = inlineChildren(root)
      // all inline ids are distinct and ordered `inline-rich-0` … `inline-rich-19`
      expect(inline.map((c) => c.props?.id)).toEqual(
        Array.from({ length: 20 }, (_, i) => `inline-rich-${i}`),
      )
      expect(new Set(inline.map((c) => c.props?.id)).size).toBe(20)

      // the node's lineMap range still covers all their markdown lines (the
      // inline children render inline within the node's own content line)
      const richRange = result.lineMap.ranges.find((r) => r.ragNodeId === 'rich')
      expect(richRange).toBeDefined()
      const runtime = new Runtime({ mount: mountEl() as never, envelope: result.envelope as never })
      runtime.loadEnvelope(result.envelope as never)
      const lines = runtime.markdown().split('\n')
      for (let i = 0; i < 20; i++) {
        const idx = lines.findIndex((l) => l.includes(`bold-${i}`))
        expect(idx).toBeGreaterThanOrEqual(richRange!.startLine)
        expect(idx).toBeLessThan(richRange!.endLine)
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F4 — an inline child whose own props carry `id: rag-foo` + `data-rag-node-id: other` → the authored `inline-<ragId>-<index>` id and the owning ragId take precedence', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      await seedRichDoc(store, makeNode('rich', {
        children: [{ type: 'strong', content: 'b', props: { id: 'rag-foo', 'data-rag-node-id': 'other' } }],
      }))

      const result: TraversalResult = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      const root = findPayloadByRootId(result.envelope, 'rich')!.content[0]

      const inline = inlineChildren(root)
      expect(inline).toHaveLength(1)
      // the authored id + owning ragId take precedence over the child's own props
      expect(inline[0].props?.id).toBe('inline-rich-0')
      expect(inline[0].props?.['data-rag-node-id']).toBe('rich')

      // the disambiguation is NOT broken by the child's own props (the child's
      // `id: 'rag-foo'` does NOT make it a doc-child subtree root)
      expect(result.backRefs.size).toBe(1)
      expect(result.backRefs.has('rich')).toBe(true)
      for (const key of result.backRefs.keys()) expect(key).not.toMatch(/^inline-/)
      expect(result.lineMap.ranges).toHaveLength(1)
      expect(result.lineMap.ranges[0].ragNodeId).toBe('rich')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('F6 — fallback path (nestDocChildren: false) with a node carrying BOTH inline children AND doc-children → inline children still render, doc-children become separate sections', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      // a next-section cycle forces the family-pre-order fallback
      await seedStore(store, [
        makeNode('doc', { type: 'div' }),
        makeNode('head', { type: 'h1', content: 'Title' }),
        makeNode('rich', { type: 'p', content: 'Rich', children: [{ type: 'strong', content: 'bold' }] }),
        makeNode('li1', { type: 'li', content: 'Item' }),
        makeNode('end', { type: 'p', content: 'End' }),
      ], [
        makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-n1', 'next-section', 'head', 'rich', { documentIds: ['doc'] }),
        makeEdge('e-n2', 'next-section', 'rich', 'head', { documentIds: ['doc'] }), // cycle → fallback
        makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
        makeEdge('e-c1', 'doc-child', 'rich', 'li1', { order: 0 }),
      ])

      let result: TraversalResult
      expect(() => {
        result = buildTraversal({ store, documentIds: ['doc'], zoneName: 'main' })
      }).not.toThrow()

      // rich's subtree renders the inline children (nestDocChildren: false does
      // NOT suppress the inline children — they are the node's OWN content)
      const richRoot = findPayloadByRootId(result!.envelope, 'rich')!.content[0]
      const inline = inlineChildren(richRoot)
      expect(inline).toHaveLength(1)
      expect(inline[0].type).toBe('strong')
      expect(inline[0].props?.id).toBe('inline-rich-0')

      // the doc-child li1 becomes a SEPARATE section (its own ContentPayload)
      const li1Payload = findPayloadByRootId(result!.envelope, 'li1')
      expect(li1Payload).toBeDefined()
      expect(li1Payload!.content[0].props?.id).toBe('rag-li1')
    } finally {
      rmSyncSafe(dir)
    }
  })
})
