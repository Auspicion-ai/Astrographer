// tests/blind-unit-ud4-doc-heads-tree-greens.test.ts — BLIND green-scenario
// set for Unit U-D4 (RCA-4). Derived ONLY from
// `docs/specs/unit-ud4-doc-heads-tree.md` (+ §3a/§3b) and the harness
// conventions of `tests/unit-ud4-doc-heads-tree.test.ts`. NO implementation
// source was read to decide expected behavior; modules are imported only.
//
// Scenario ids (UD4-B*) map to the greens doc
// `docs/specs/unit-ud4-doc-heads-tree-greens.md`.
import { describe, it, expect } from 'vitest'
import { createSnapshotStore } from '../src/main/adjacency.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import * as types from '../src/shared/types.js'
import * as mcp from '../src/main/mcp-server.js'
import * as treeModule from '../src/shared/document-tree.js'

const { buildDocumentTree, selectDocumentIdsByPathPrefix } = treeModule

// ---- fixtures (harness convention) ----------------------------------------

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `c-${id}`,
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
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

/** A payload entry literal (the widened REQUIRED shape, §5.1). */
function entry(
  documentId: string,
  title: string,
  path: string[],
  tags: string[] = [],
): { documentId: string; title: string; path: string[]; tags: string[] } {
  return { documentId, title, path, tags }
}

type Folder = {
  kind: string
  label: string
  path: string[]
  children: Folder[]
}
type Leaf = {
  kind: string
  label: string
  path: string[]
  documentId: string
  title: string
  tags: string[]
}
type AnyNode = Folder | Leaf

const asFolders = (nodes: unknown): Folder[] => nodes as Folder[]
const asLeaves = (nodes: unknown): Leaf[] => nodes as Leaf[]

// ===========================================================================
describe('UD4-B1 payload entry shape (§5.1 / §5.6-1)', () => {
  it('UD4-B1.1 entry exposes exactly documentId, title, path, tags (path/tags string[])', () => {
    const e: types.RagDocHeadsPayload['documents'][number] = {
      documentId: 'docs/guide',
      title: 'Guide',
      path: ['docs'],
      tags: ['manual'],
    }
    expect(Object.keys(e).sort()).toEqual(['documentId', 'path', 'tags', 'title'])
    expect(Array.isArray(e.path)).toBe(true)
    expect(Array.isArray(e.tags)).toBe(true)
  })

  it('UD4-B1.2 the documents array is the entry type (structural)', () => {
    const p: types.RagDocHeadsPayload = { documents: [entry('x', 'X', [], [])] }
    expect(p.documents[0].path).toEqual([])
    expect(p.documents[0].tags).toEqual([])
  })
})

// ===========================================================================
describe('UD4-B2 handler root-vs-section read (§5.2 / §5.6-2,3,4,5)', () => {
  it('UD4-B2.1 path/tags come from ROOT e.target; title from head SECTION e.source', () => {
    const store = createSnapshotStore(
      [
        makeNode('sec-1', { type: 'h1', content: 'SECTION-TITLE' }),
        makeNode('root-1', { content: 'ROOT-CONTENT', documentPath: ['dir', 'sub'], tags: ['t1', 't2'] }),
      ],
      [makeEdge('dh', 'doc-head', 'sec-1', 'root-1')],
    )
    const out = mcp.handleRagDocHeadsIpc(store)
    expect(out.documents).toEqual([
      { documentId: 'root-1', title: 'SECTION-TITLE', path: ['dir', 'sub'], tags: ['t1', 't2'] },
    ])
    expect(out.documents[0].title).not.toBe('ROOT-CONTENT')
  })

  it('UD4-B2.2 root without documentPath/tags (v1 default) → []/[]', () => {
    const store = createSnapshotStore(
      [makeNode('sec-2', { content: 'T' }), makeNode('root-2')],
      [makeEdge('dh', 'doc-head', 'sec-2', 'root-2')],
    )
    expect(mcp.handleRagDocHeadsIpc(store).documents[0]).toMatchObject({ path: [], tags: [] })
  })

  it('UD4-B2.3 root whose documentPath/tags are non-arrays (tampered shape) → []/[] (F4)', () => {
    const store = createSnapshotStore(
      [
        makeNode('sec-3', { content: 'T' }),
        makeNode('root-3', {
          documentPath: 'oops' as unknown as string[],
          tags: 'nope' as unknown as string[],
        }),
      ],
      [makeEdge('dh', 'doc-head', 'sec-3', 'root-3')],
    )
    const e = mcp.handleRagDocHeadsIpc(store).documents[0]
    expect(e.path).toEqual([])
    expect(e.tags).toEqual([])
  })

  it('UD4-B2.4 missing head SECTION source → title "" while path/tags still come from root', () => {
    const store = createSnapshotStore(
      [makeNode('root-4', { documentPath: ['only'], tags: ['solo'] })],
      [makeEdge('dh', 'doc-head', 'nope-source', 'root-4')],
    )
    expect(mcp.handleRagDocHeadsIpc(store).documents[0]).toEqual({
      documentId: 'root-4',
      title: '',
      path: ['only'],
      tags: ['solo'],
    })
  })

  it('UD4-B2.5 dedupe by target (first head wins) + ascending documentId sort', () => {
    const store = createSnapshotStore(
      [
        makeNode('h-z', { content: 'Zed' }),
        makeNode('h-a1', { content: 'A-first' }),
        makeNode('h-a2', { content: 'A-second' }),
        makeNode('r-z', { documentPath: ['zz'] }),
        makeNode('r-a', { documentPath: ['aa'] }),
      ],
      [
        makeEdge('e-z', 'doc-head', 'h-z', 'r-z'),
        makeEdge('e-a1', 'doc-head', 'h-a1', 'r-a'),
        makeEdge('e-a2', 'doc-head', 'h-a2', 'r-a'),
      ],
    )
    const out = mcp.handleRagDocHeadsIpc(store)
    expect(out.documents.map((d) => d.documentId)).toEqual(['r-a', 'r-z'])
    expect(out.documents).toHaveLength(2)
    expect(out.documents[0].title).toBe('A-first')
    expect(out.documents[1]).toMatchObject({ documentId: 'r-z', title: 'Zed', path: ['zz'] })
  })
})

// ===========================================================================
describe('UD4-B3 absent root + malformed edge (§5.7-6,7 / §3a A1,A2,F2)', () => {
  it('UD4-B3.1 edge survives but ROOT absent from listNodes → path []/tags [], no throw', () => {
    const store = createSnapshotStore(
      [makeNode('sec-x', { content: 'Orphan' })],
      [makeEdge('dh', 'doc-head', 'sec-x', 'ghost-root')],
    )
    expect(() => mcp.handleRagDocHeadsIpc(store)).not.toThrow()
    expect(mcp.handleRagDocHeadsIpc(store).documents).toEqual([
      { documentId: 'ghost-root', title: 'Orphan', path: [], tags: [] },
    ])
  })

  it('UD4-B3.2 edge to empty/undefined target is skipped (no phantom)', () => {
    const store = createSnapshotStore(
      [makeNode('sec-y', { content: 'Y' })],
      [
        makeEdge('e1', 'doc-head', 'sec-y', ''),
        { ...makeEdge('e2', 'doc-head', 'sec-y', 'valid'), target: undefined as unknown as string },
        makeEdge('e3', 'doc-head', 'sec-y', 'kept'),
      ],
    )
    expect(mcp.handleRagDocHeadsIpc(store).documents).toEqual([
      { documentId: 'kept', title: 'Y', path: [], tags: [] },
    ])
  })

  it('UD4-B3.3 non-string targets (number/object/boolean) are skipped, not coerced (F2)', () => {
    const store = createSnapshotStore(
      [makeNode('sec-z', { content: 'Z' })],
      [
        { ...makeEdge('e1', 'doc-head', 'sec-z', 'x'), target: 5 as unknown as string },
        { ...makeEdge('e2', 'doc-head', 'sec-z', 'x'), target: {} as unknown as string },
        { ...makeEdge('e3', 'doc-head', 'sec-z', 'x'), target: true as unknown as string },
        makeEdge('e4', 'doc-head', 'sec-z', 'ok'),
      ],
    )
    expect(mcp.handleRagDocHeadsIpc(store).documents).toEqual([
      { documentId: 'ok', title: 'Z', path: [], tags: [] },
    ])
  })

  it('UD4-B3.4 no doc-head edges → { documents: [] }', () => {
    const store = createSnapshotStore([makeNode('plain')], [])
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({ documents: [] })
  })

  it('UD4-B3.5 null store throws the pinned error (unchanged contract)', () => {
    expect(() => mcp.handleRagDocHeadsIpc(null)).toThrow('rag-doc-heads: no rag store configured')
  })
})

// ===========================================================================
describe('UD4-B4 backfill is display-only, never id-split (§5.5 / §5.7-11 / C9,A6)', () => {
  it('UD4-B4.1 absent documentPath on root → [] even for a "/"-qualified documentId', () => {
    const store = createSnapshotStore(
      [makeNode('sec', { content: 'T' }), makeNode('other/nested/doc')],
      [makeEdge('dh', 'doc-head', 'sec', 'other/nested/doc')],
    )
    const e = mcp.handleRagDocHeadsIpc(store).documents[0]
    expect(e.path).toEqual([])
    expect(e.path).not.toEqual(['other', 'nested'])
    expect(e.path).not.toEqual(['other/nested'])
  })

  it('UD4-B4.2 prefixed id S:area/readme with absent root path stays []', () => {
    const store = createSnapshotStore(
      [makeNode('sec', { content: 'T' }), makeNode('S:area/readme')],
      [makeEdge('dh', 'doc-head', 'sec', 'S:area/readme')],
    )
    const e = mcp.handleRagDocHeadsIpc(store).documents[0]
    expect(e.path).toEqual([])
    expect(e.tags).toEqual([])
  })
})

// ===========================================================================
describe('UD4-B5 read-only handler + no aliasing (§5.7-12,13 / A8,A9)', () => {
  it('UD4-B5.1 handler only calls read methods; no write method is invoked', () => {
    const nodes = [makeNode('h', { content: 'H' }), makeNode('doc', { documentPath: ['p'], tags: ['t'] })]
    const edges = [makeEdge('dh', 'doc-head', 'h', 'doc')]
    const reads: string[] = []
    const writes: string[] = []
    const fake = {
      edgesByKind(kind: string) {
        reads.push('edgesByKind')
        return edges.filter((e) => e.kind === kind)
      },
      listEdges() {
        reads.push('listEdges')
        return edges
      },
      listNodes() {
        reads.push('listNodes')
        return nodes
      },
      putNode() {
        writes.push('putNode')
        throw new Error('write attempted')
      },
      applyBatch() {
        writes.push('applyBatch')
        throw new Error('write attempted')
      },
      putEdge() {
        writes.push('putEdge')
        throw new Error('write attempted')
      },
    }
    const out = mcp.handleRagDocHeadsIpc(fake as never)
    expect(writes).toEqual([])
    expect(reads).toContain('listNodes')
    expect(out.documents[0].path).toEqual(['p'])
  })

  it('UD4-B5.2 mutating an emitted path/tags cannot mutate the store node arrays', () => {
    const store = createSnapshotStore(
      [
        makeNode('h', { content: 'H' }),
        makeNode('doc', { documentPath: ['orig'], tags: ['keep'] }),
      ],
      [makeEdge('dh', 'doc-head', 'h', 'doc')],
    )
    const first = mcp.handleRagDocHeadsIpc(store).documents[0]
    first.path.push('MUT')
    first.tags.push('MUT')
    const again = mcp.handleRagDocHeadsIpc(store).documents[0]
    expect(again.path).toEqual(['orig'])
    expect(again.tags).toEqual(['keep'])
  })
})

// ===========================================================================
describe('UD4-B6 buildDocumentTree prefix grouping (§5.3 / §5.6-7,8,9)', () => {
  it('UD4-B6.1 two root-level docs → two document leaves, path []', () => {
    const nodes = asLeaves(buildDocumentTree([entry('one', 'One', []), entry('two', 'Two', [])]))
    expect(nodes).toHaveLength(2)
    expect(nodes.every((n) => n.kind === 'document')).toBe(true)
    expect(nodes.map((n) => n.label)).toEqual(['one', 'two'])
    expect(nodes.map((n) => n.path)).toEqual([[], []])
  })

  it('UD4-B6.2 nested doc dir/file (path ["dir"]) → folder dir wrapping leaf file', () => {
    const nodes = asFolders(buildDocumentTree([entry('dir/file', 'F', ['dir'])]))
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ kind: 'folder', label: 'dir', path: ['dir'] })
    expect(nodes[0].children).toHaveLength(1)
    expect(nodes[0].children[0]).toMatchObject({
      kind: 'document',
      label: 'file',
      path: ['dir'],
      documentId: 'dir/file',
    })
  })

  it('UD4-B6.3 deep doc (path ["a","b","c"]) → a→b→c folder chain ending in one leaf', () => {
    const root = asFolders(buildDocumentTree([entry('a/b/c/leaf', 'L', ['a', 'b', 'c'])]))
    expect(root).toHaveLength(1)
    const a = root[0]
    const b = a.children[0]
    const c = b.children[0]
    expect(a).toMatchObject({ kind: 'folder', label: 'a', path: ['a'] })
    expect(b).toMatchObject({ kind: 'folder', label: 'b', path: ['a', 'b'] })
    expect(c).toMatchObject({ kind: 'folder', label: 'c', path: ['a', 'b', 'c'] })
    expect(c.children).toHaveLength(1)
    expect(c.children[0]).toMatchObject({ kind: 'document', label: 'leaf' })
  })

  it('UD4-B6.4 shared prefixes share ONE folder; distinct subfolders stay distinct', () => {
    const nodes = asFolders(
      buildDocumentTree([
        entry('root/x/one', '1', ['root', 'x']),
        entry('root/x/two', '2', ['root', 'x']),
        entry('root/y/three', '3', ['root', 'y']),
      ]),
    )
    expect(nodes).toHaveLength(1)
    expect(nodes[0].label).toBe('root')
    expect(nodes[0].children.map((n) => n.label)).toEqual(['x', 'y'])
    const x = nodes[0].children[0]
    expect(x.children.map((n) => n.label)).toEqual(['one', 'two'])
  })

  it('UD4-B6.5 leaf carries payload tags; non-string title coerces to ""', () => {
    const nodes = asLeaves(
      buildDocumentTree([
        { documentId: 'tagged', title: undefined as unknown as string, path: [], tags: ['a', 'b'] },
      ]),
    )
    expect(nodes[0].title).toBe('')
    expect(nodes[0].tags).toEqual(['a', 'b'])
  })
})

// ===========================================================================
describe('UD4-B7 empty branches dropped (§5.7-1 / F8 / §3a A4)', () => {
  it('UD4-B7.1 skipped entry creates no folder; every emitted folder has >=1 descendant', () => {
    const nodes = buildDocumentTree([
      entry('', 'Bad', ['ghost']), // skipped: empty documentId
      entry('real/doc', 'D', ['real']),
    ]) as AnyNode[]
    expect(nodes.map((n) => n.label)).toEqual(['real'])

    const folders: Folder[] = []
    const walk = (list: AnyNode[]): void => {
      for (const n of list) {
        if (n.kind === 'folder') {
          const f = n as Folder
          folders.push(f)
          walk(f.children as AnyNode[])
        }
      }
    }
    walk(nodes)
    expect(folders.length).toBeGreaterThan(0)
    for (const f of folders) expect(f.children.length).toBeGreaterThan(0)
  })

  it('UD4-B7.2 all entries skipped → no folders emitted', () => {
    const nodes = buildDocumentTree([entry('', 'x', ['a']), null, 3]) as AnyNode[]
    expect(nodes).toEqual([])
  })
})

// ===========================================================================
describe('UD4-B8 segment-also-document + sibling sort (§5.3 / §5.6-10,11 / §5.7-8)', () => {
  it('UD4-B8.1 leaf "a" and folder "a" are distinct siblings; folder sorts first', () => {
    const nodes = buildDocumentTree([entry('a', 'A', []), entry('a/child', 'C', ['a'])]) as AnyNode[]
    expect(nodes).toHaveLength(2)
    expect(nodes[0].kind).toBe('folder')
    expect(nodes[0].label).toBe('a')
    expect((nodes[0] as Folder).path).toEqual(['a'])
    expect(nodes[1].kind).toBe('document')
    expect(nodes[1].label).toBe('a')
    expect((nodes[1] as Leaf).documentId).toBe('a')
    expect((nodes[0] as Folder).children[0]).toMatchObject({ kind: 'document', label: 'child' })
  })

  it('UD4-B8.2 root siblings sorted by label, deterministic across calls', () => {
    const docs = [entry('zeta', 'Z', []), entry('alpha', 'A', []), entry('mu', 'M', [])]
    const a = (buildDocumentTree(docs) as Leaf[]).map((n) => n.label)
    const b = (buildDocumentTree(docs) as Leaf[]).map((n) => n.label)
    expect(a).toEqual(['alpha', 'mu', 'zeta'])
    expect(b).toEqual(a)
  })

  it('UD4-B8.3 equal labels tiebreak by full id (root-level path-[] docs whose basenames collide)', () => {
    const nodes = buildDocumentTree([
      entry('zzz/same', 'Z', []),
      entry('aaa/same', 'A', []),
    ]) as Leaf[]
    expect(nodes.map((n) => n.label)).toEqual(['same', 'same'])
    expect(nodes.map((n) => n.documentId)).toEqual(['aaa/same', 'zzz/same'])
  })

  it('UD4-B8.4 duplicate documentId yields two leaves (no dedupe; stable input order)', () => {
    const nodes = buildDocumentTree([
      entry('dup', 'first', []),
      entry('dup', 'second', []),
    ]) as Leaf[]
    expect(nodes).toHaveLength(2)
    expect(nodes.map((n) => n.title)).toEqual(['first', 'second'])
  })
})

// ===========================================================================
describe('UD4-B9 buildDocumentTree malformed-input totality (§5.7-2,3,4,5 / §3a A3)', () => {
  it('UD4-B9.1 non-array container → [] without throwing', () => {
    for (const bad of [null, undefined, {}, 'str', 7, true, Symbol('s')]) {
      expect(() => buildDocumentTree(bad as never)).not.toThrow()
      expect(buildDocumentTree(bad as never)).toEqual([])
    }
  })

  it('UD4-B9.2 malformed entries (null / primitive / array / bad id) are skipped', () => {
    const nodes = buildDocumentTree([
      null,
      9,
      ['arr'],
      { title: 'no id' },
      { documentId: '', path: ['x'] },
      { documentId: 42, path: ['y'] },
      { documentId: 'good', title: 'G', path: [], tags: [] },
    ]) as Leaf[]
    expect(nodes.map((n) => n.documentId)).toEqual(['good'])
  })

  it('UD4-B9.3 non-array path → []; invalid member truncates retaining earlier valid segments', () => {
    const flat = buildDocumentTree([
      { documentId: 'd/f', title: 'F', path: 'd' as unknown as string[], tags: [] },
    ]) as Leaf[]
    expect(flat).toHaveLength(1)
    expect(flat[0]).toMatchObject({ kind: 'document', label: 'f', path: [] })

    const trunc = buildDocumentTree([
      { documentId: 'p/q/leaf', title: 'L', path: ['p', 5, 'q'] as unknown as string[], tags: [] },
    ]) as Folder[]
    expect(trunc).toHaveLength(1)
    expect(trunc[0]).toMatchObject({ kind: 'folder', label: 'p', path: ['p'] })
    expect(trunc[0].children[0]).toMatchObject({ kind: 'document', label: 'leaf', path: ['p'] })
  })

  it('UD4-B9.4 malformed tags → [] with non-string members filtered, order preserved', () => {
    const nodes = buildDocumentTree([
      { documentId: 'a', title: 'A', path: [], tags: 'str' as unknown as string[] },
      { documentId: 'b', title: 'B', path: [], tags: ['one', 2, null, 'two'] as unknown as string[] },
    ]) as Leaf[]
    const byId = new Map(nodes.map((n) => [n.documentId, n.tags]))
    expect(byId.get('a')).toEqual([])
    expect(byId.get('b')).toEqual(['one', 'two'])
  })
})

// ===========================================================================
describe('UD4-B10 buildDocumentTree depth-safety (§5.3-6 / F1)', () => {
  it('UD4-B10.1 a 10 000-segment path builds without RangeError', () => {
    const segments = Array.from({ length: 10_000 }, (_, i) => `s${i}`)
    const deep = { documentId: `${segments.join('/')}/leaf`, title: 'D', path: segments, tags: [] }
    let nodes: AnyNode[] = []
    expect(() => {
      nodes = buildDocumentTree([deep]) as unknown as AnyNode[]
    }).not.toThrow()
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ kind: 'folder', label: 's0', path: ['s0'] })
  })
})

// ===========================================================================
describe('UD4-B11 selectDocumentIdsByPathPrefix (§5.4 / §5.6-13,14,15 / §5.7-9,10)', () => {
  const docs = [
    entry('d-a', 'A', ['a']),
    entry('d-ab', 'AB', ['a', 'b']),
    entry('d-abc', 'ABC', ['a', 'b', 'c']),
    entry('d-ab2', 'AB2', ['ab']), // single segment "ab" — element-wise, not string-prefix
    entry('d-b', 'B', ['b']),
    entry('d-legacy', 'L', []),
  ]

  it('UD4-B11.1 prefix ["a"] matches element-wise (not string-prefix) and no legacy', () => {
    expect(selectDocumentIdsByPathPrefix(docs, ['a'])).toEqual(['d-a', 'd-ab', 'd-abc'])
  })

  it('UD4-B11.2 empty prefix [] = ALL documents, sorted ascending', () => {
    expect(selectDocumentIdsByPathPrefix(docs, [])).toEqual([
      'd-a',
      'd-ab',
      'd-ab2',
      'd-abc',
      'd-b',
      'd-legacy',
    ])
  })

  it('UD4-B11.3 sub-prefix matches only paths equal-to-or-longer', () => {
    expect(selectDocumentIdsByPathPrefix(docs, ['a', 'b'])).toEqual(['d-ab', 'd-abc'])
    expect(selectDocumentIdsByPathPrefix(docs, ['a', 'b', 'c'])).toEqual(['d-abc'])
  })

  it('UD4-B11.4 prefix longer than every path → []', () => {
    expect(selectDocumentIdsByPathPrefix(docs, ['a', 'b', 'c', 'd'])).toEqual([])
  })

  it('UD4-B11.5 no-matching prefix → []', () => {
    expect(selectDocumentIdsByPathPrefix(docs, ['nope'])).toEqual([])
  })

  it('UD4-B11.6 legacy path [] matches ONLY the empty prefix', () => {
    expect(selectDocumentIdsByPathPrefix(docs, ['legacy'])).toEqual([])
    expect(selectDocumentIdsByPathPrefix(docs, [])).toContain('d-legacy')
  })

  it('UD4-B11.7 output deduped (first occurrence) then sorted ascending', () => {
    const dup = [entry('m', 'M', []), entry('k', 'K', []), entry('k', 'K-dup', []), entry('a', 'A', [])]
    expect(selectDocumentIdsByPathPrefix(dup, [])).toEqual(['a', 'k', 'm'])
  })

  it('UD4-B11.8 prefixed legacy id is NOT selected by a non-empty prefix (no id split)', () => {
    const prefixed = [entry('S:docs/readme', 'R', [])]
    expect(selectDocumentIdsByPathPrefix(prefixed, ['S:docs'])).toEqual([])
    expect(selectDocumentIdsByPathPrefix(prefixed, ['docs'])).toEqual([])
    expect(selectDocumentIdsByPathPrefix(prefixed, [])).toEqual(['S:docs/readme'])
  })

  it('UD4-B11.9 malformed prefix behaves as [] (all); malformed docs → []; never throws', () => {
    expect(() => selectDocumentIdsByPathPrefix(docs, null as never)).not.toThrow()
    expect(selectDocumentIdsByPathPrefix(docs, null as never)).toEqual([
      'd-a',
      'd-ab',
      'd-ab2',
      'd-abc',
      'd-b',
      'd-legacy',
    ])
    expect(selectDocumentIdsByPathPrefix(docs, 'a' as never)).toEqual([
      'd-a',
      'd-ab',
      'd-ab2',
      'd-abc',
      'd-b',
      'd-legacy',
    ])
    expect(selectDocumentIdsByPathPrefix(null as never, ['a'])).toEqual([])
    expect(selectDocumentIdsByPathPrefix({} as never, ['a'])).toEqual([])
  })

  it('UD4-B11.10 malformed entries in docs contribute no id (skipped)', () => {
    const mixed = [entry('keep', 'K', ['a']), null, 5, { documentId: '', path: ['a'] }]
    expect(selectDocumentIdsByPathPrefix(mixed as never, ['a'])).toEqual(['keep'])
  })
})

// ===========================================================================
describe('UD4-B12 module census + renderer flat reconciliation (§5.8 / §5.5 / §5.6-16)', () => {
  it('UD4-B12.1 document-tree exports exactly the two spec functions', () => {
    const fns = Object.keys(treeModule)
      .filter((k) => typeof (treeModule as Record<string, unknown>)[k] === 'function')
      .sort()
    expect(fns).toEqual(['buildDocumentTree', 'selectDocumentIdsByPathPrefix'])
  })

  it('UD4-B12.2 deriveDocNavDocuments over widened entries still returns flat { documentId, title }', async () => {
    const { deriveDocNavDocuments } = await import('../src/renderer/pane-graph.js')
    const flat = deriveDocNavDocuments([
      entry('flat/a', 'A', ['flat'], ['x']),
      entry('flat/b', 'B', ['flat'], []),
    ] as never)
    expect(flat).toEqual([
      { documentId: 'flat/a', title: 'A' },
      { documentId: 'flat/b', title: 'B' },
    ])
    for (const d of flat) expect(Object.keys(d).sort()).toEqual(['documentId', 'title'])
  })
})
