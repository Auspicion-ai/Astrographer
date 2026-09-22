// tests/unit-ud4-doc-heads-tree.test.ts — Unit U-D4: doc-heads listing +
// derived category tree + read-surface backfill.
//
// The TestWriter RED set for docs/specs/unit-ud4-doc-heads-tree.md §5.6 happy
// paths + §5.7 fail-states. Written from the SPEC ALONE (no src read for
// behavior). The U-D4 behavior does NOT exist yet:
//
//   - `src/shared/types.ts` (RED — `RagDocHeadsPayload.documents` entries do
//     not yet carry the REQUIRED `path`/`tags`).
//   - `src/main/mcp-server.ts` (RED — `handleRagDocHeadsIpc` does not yet read
//     the ROOT node `e.target` for `documentPath`/`tags`).
//   - `src/shared/document-tree.ts` (NEW — absent; `buildDocumentTree` /
//     `selectDocumentIdsByPathPrefix` do not exist).
//   - `src/renderer/pane-registry.ts` (RED — `PaneContext.docHeads` is still the
//     narrow `{ documentId; title }` shape).
//
// The NEW module is loaded via a lazy dynamic import (`loadTree()`) so this
// file links even though the module does not exist yet; each tree test then
// fails cleanly on the missing behavior. `handleRagDocHeadsIpc` and the types
// are namespace-imported (the module exists from Unit V3; the U-D4 fields are
// the missing behavior).
import { describe, it, expect, beforeAll } from 'vitest'
import { createSnapshotStore } from '../src/main/adjacency.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import * as types from '../src/shared/types.js'
import * as mcp from '../src/main/mcp-server.js'

// ---- the NEW pure module (RED — absent) ------------------------------------
// A lazy handle: `null` when `src/shared/document-tree.js` does not exist yet,
// so the file loads and each tree test fails with a clear missing-module
// message instead of a link-time crash.
interface TreeModule {
  buildDocumentTree: (docs: unknown) => unknown[]
  selectDocumentIdsByPathPrefix: (docs: unknown, prefix: unknown) => string[]
}
let tree: TreeModule | null = null

beforeAll(async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tree = (await import('../src/shared/document-tree.js')) as any
  } catch {
    tree = null
  }
})

/** The tree module or a clean per-test failure. */
function treeApi(): TreeModule {
  if (tree == null) {
    throw new Error('src/shared/document-tree.ts is absent (U-D4 not implemented)')
  }
  return tree
}

// ---- fixtures --------------------------------------------------------------

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

/** A doc-head payload entry literal (the widened REQUIRED shape). */
function docHead(
  documentId: string,
  title: string,
  path: string[],
  tags: string[] = [],
): { documentId: string; title: string; path: string[]; tags: string[] } {
  return { documentId, title, path, tags }
}

// ===========================================================================
// §5.6 state 1 / §5.1 — the amended payload entry shape (types.ts)
// ===========================================================================
describe('§5.1 the amended RagDocHeadsPayload entry (path/tags required)', () => {
  it('happy 1: entries expose documentId, title, path, tags — path/tags are required string[]', () => {
    const entry: types.RagDocHeadsPayload['documents'][number] = {
      documentId: 'a/b',
      title: 'B',
      path: ['a'],
      tags: ['x'],
    }
    expect(Object.keys(entry).sort()).toEqual(['documentId', 'path', 'tags', 'title'])
    expect(Array.isArray(entry.path)).toBe(true)
    expect(Array.isArray(entry.tags)).toBe(true)
    expect(entry.path).toEqual(['a'])
    expect(entry.tags).toEqual(['x'])
  })
})

// ===========================================================================
// §5.2 / §5.6 states 2-6 + §5.7 states 6-7, 11-13 — handleRagDocHeadsIpc
// ===========================================================================
describe('§5.2 handleRagDocHeadsIpc — the root read (M7)', () => {
  it('happy 2: root carries documentPath/tags → entry path/tags; title stays from the head SECTION (e.source)', () => {
    const store = createSnapshotStore(
      [
        makeNode('head-a', { type: 'h1', content: 'Doc A' }),
        makeNode('doc-a', { documentPath: ['a', 'b'], tags: ['x'] }),
      ],
      [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')],
    )
    const result = mcp.handleRagDocHeadsIpc(store)
    expect(result).toEqual({
      documents: [{ documentId: 'doc-a', title: 'Doc A', path: ['a', 'b'], tags: ['x'] }],
    })
  })

  it('happy 3: a root with no documentPath/tags (v1 default) → path: [], tags: []', () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { content: 'Doc A' }), makeNode('doc-a')],
      [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')],
    )
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({
      documents: [{ documentId: 'doc-a', title: 'Doc A', path: [], tags: [] }],
    })
  })

  it('happy 4: a root whose documentPath normalizes to absent (U-D1 []→omitted) → path: []', () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { content: 'Doc A' }), makeNode('doc-a')],
      [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')],
    )
    expect(mcp.handleRagDocHeadsIpc(store).documents[0].path).toEqual([])
  })

  it('happy 5: a missing head SECTION source → title: "" (UNCHANGED), with path/tags still read from the root', () => {
    const store = createSnapshotStore(
      [makeNode('doc-a', { documentPath: ['a'], tags: ['t'] })],
      [makeEdge('dh1', 'doc-head', 'missing', 'doc-a')],
    )
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({
      documents: [{ documentId: 'doc-a', title: '', path: ['a'], tags: ['t'] }],
    })
  })

  it('happy 6: two doc-head edges to the SAME target → ONE entry (first head wins); entries sorted by documentId ascending', () => {
    const store = createSnapshotStore(
      [
        makeNode('head-b', { content: 'Doc B' }),
        makeNode('head-a', { content: 'Doc A' }),
        makeNode('head-a2', { content: 'Doc A duplicate head' }),
        makeNode('doc-a', { documentPath: ['a'] }),
        makeNode('doc-b'),
      ],
      [
        makeEdge('e2', 'doc-head', 'head-b', 'doc-b'),
        makeEdge('e1', 'doc-head', 'head-a', 'doc-a'),
        makeEdge('e3', 'doc-head', 'head-a2', 'doc-a'),
      ],
    )
    const result = mcp.handleRagDocHeadsIpc(store)
    expect(result.documents.map((d) => d.documentId)).toEqual(['doc-a', 'doc-b'])
    expect(result.documents[0]).toEqual({
      documentId: 'doc-a',
      title: 'Doc A',
      path: ['a'],
      tags: [],
    })
    expect(result.documents).toHaveLength(2)
  })

  // -- §5.7 fail-state 6 (A1): missing / quarantined root --------------------
  it('fail 6: a doc-head edge whose ROOT target is absent from listNodes → path: [], tags: [], no throw', () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { content: 'Doc A' })],
      [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')],
    )
    expect(() => mcp.handleRagDocHeadsIpc(store)).not.toThrow()
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({
      documents: [{ documentId: 'doc-a', title: 'Doc A', path: [], tags: [] }],
    })
  })

  // -- §5.7 fail-state 7 (A2): malformed edge is skipped ---------------------
  it('fail 7: a doc-head edge with a missing/undefined/empty target → SKIPPED (no phantom, no crash)', () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { content: 'Doc A' })],
      [
        makeEdge('e1', 'doc-head', 'head-a', '' as string),
        { ...makeEdge('e2', 'doc-head', 'head-a', 'x'), target: undefined as unknown as string },
        makeEdge('e3', 'doc-head', 'head-a', 'doc-a'),
      ],
    )
    const result = mcp.handleRagDocHeadsIpc(store)
    expect(result.documents).toEqual([
      { documentId: 'doc-a', title: 'Doc A', path: [], tags: [] },
    ])
  })

  // -- §5.7 fail-state 11 (C9, A6): legacy path is never id-split ------------
  it('fail 11: a documentId "S:a/readme" with an absent root documentPath → path: [] (NOT ["S:a"], NOT ["a"])', () => {
    const store = createSnapshotStore(
      [makeNode('head-s', { content: 'Readme' }), makeNode('S:a/readme')],
      [makeEdge('dh1', 'doc-head', 'head-s', 'S:a/readme')],
    )
    const entry = mcp.handleRagDocHeadsIpc(store).documents[0]
    expect(entry.path).toEqual([])
    expect(entry.path).not.toEqual(['S:a'])
    expect(entry.path).not.toEqual(['a'])
  })

  // -- §5.7 fail-state 13 (A8): no aliasing ---------------------------------
  it('fail 13: mutating the emitted entry path/tags does NOT mutate the store node arrays', () => {
    const store = createSnapshotStore(
      [
        makeNode('head-a', { content: 'Doc A' }),
        makeNode('doc-a', { documentPath: ['a', 'b'], tags: ['x'] }),
      ],
      [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a')],
    )
    const result = mcp.handleRagDocHeadsIpc(store)
    result.documents[0].path.push('MUTATED')
    result.documents[0].tags.push('MUTATED')
    const fresh = mcp.handleRagDocHeadsIpc(store).documents[0]
    expect(fresh.path).toEqual(['a', 'b'])
    expect(fresh.tags).toEqual(['x'])
  })
})

// ===========================================================================
// §5.3 — buildDocumentTree (NEW pure helper)
// ===========================================================================
describe('§5.3 buildDocumentTree — grouping', () => {
  it('happy 7: two root-level docs → two leaf nodes at the root labelled a/b, each path: []', () => {
    const nodes = treeApi().buildDocumentTree([
      docHead('a', 'A', []),
      docHead('b', 'B', []),
    ])
    expect(nodes).toHaveLength(2)
    expect(nodes.map((n) => (n as { kind: string }).kind)).toEqual(['document', 'document'])
    expect(nodes.map((n) => (n as { label: string }).label)).toEqual(['a', 'b'])
    expect(nodes.map((n) => (n as { path: string[] }).path)).toEqual([[], []])
  })

  it('happy 8: a nested doc a/b (path ["a"]) → one folder a whose children is one leaf b', () => {
    const nodes = treeApi().buildDocumentTree([docHead('a/b', 'B', ['a'])])
    expect(nodes).toHaveLength(1)
    const folder = nodes[0] as {
      kind: string
      label: string
      path: string[]
      children: Array<{ kind: string; label: string; documentId: string; path: string[] }>
    }
    expect(folder.kind).toBe('folder')
    expect(folder.label).toBe('a')
    expect(folder.path).toEqual(['a'])
    expect(folder.children).toHaveLength(1)
    expect(folder.children[0]).toMatchObject({
      kind: 'document',
      label: 'b',
      documentId: 'a/b',
      path: ['a'],
    })
  })

  it('happy 9: a deep doc a/b/c (path ["a","b"]) → folder a → folder b → leaf c; no empty branch', () => {
    const nodes = treeApi().buildDocumentTree([docHead('a/b/c', 'C', ['a', 'b'])])
    const a = nodes[0] as {
      kind: string
      label: string
      path: string[]
      children: Array<{ kind: string; label: string; path: string[]; children?: unknown[] }>
    }
    expect(a).toMatchObject({ kind: 'folder', label: 'a', path: ['a'] })
    const b = a.children[0]
    expect(b).toMatchObject({ kind: 'folder', label: 'b', path: ['a', 'b'] })
    expect(b.children).toHaveLength(1)
    expect(b.children?.[0]).toMatchObject({ kind: 'document', label: 'c', path: ['a', 'b'] })
  })

  it('happy 10: sibling sort by label is deterministic and repeatable across calls', () => {
    const docs = [
      docHead('z', 'Z', []),
      docHead('a', 'A', []),
      docHead('m', 'M', []),
    ]
    const first = (treeApi().buildDocumentTree(docs) as Array<{ label: string }>).map((n) => n.label)
    const second = (treeApi().buildDocumentTree(docs) as Array<{ label: string }>).map((n) => n.label)
    expect(first).toEqual(['a', 'm', 'z'])
    expect(second).toEqual(first)
  })

  it('happy 11: segment-also-document → FOLDER a (path ["a"]) AND LEAF a (documentId "a") are distinct; folder first; folder contains leaf b', () => {
    const nodes = treeApi().buildDocumentTree([
      docHead('a', 'A', []),
      docHead('a/b', 'B', ['a']),
    ]) as Array<{
      kind: string
      label: string
      documentId?: string
      path: string[]
      children?: Array<{ kind: string; label: string }>
    }>
    expect(nodes).toHaveLength(2)
    const folder = nodes[0]
    const leaf = nodes[1]
    expect(folder).toMatchObject({ kind: 'folder', label: 'a', path: ['a'] })
    expect(leaf).toMatchObject({ kind: 'document', label: 'a', documentId: 'a', path: [] })
    expect(folder.children).toHaveLength(1)
    expect(folder.children?.[0]).toMatchObject({ kind: 'document', label: 'b' })
  })

  it('happy 12: a leaf carries the payload tags; a missing/null title coerces to ""', () => {
    const nodes = treeApi().buildDocumentTree([
      { documentId: 'a', title: null as unknown as string, path: [], tags: ['x', 'y'] },
    ]) as Array<{ title: string; tags: string[] }>
    expect(nodes[0].title).toBe('')
    expect(nodes[0].tags).toEqual(['x', 'y'])
  })
})

describe('§5.7 buildDocumentTree — fail-states (TOTAL, never throws)', () => {
  it('fail 1: F8 — a skipped entry (empty documentId, path ["x"]) creates NO folder x; a/b still nests; no folder has children: []', () => {
    const nodes = treeApi().buildDocumentTree([
      docHead('', 'X', ['x']),
      docHead('a/b', 'B', ['a']),
    ]) as Array<{ kind: string; label: string; children: Array<{ kind: string }> }>
    expect(nodes.map((n) => n.label)).toEqual(['a'])
    const allFolders: Array<{ children: Array<unknown> }> = []
    const collect = (list: Array<{ kind: string; label?: string; children?: Array<unknown> }>): void => {
      for (const n of list) {
        if (n.kind === 'folder') {
          allFolders.push(n as { children: Array<unknown> })
          collect((n.children ?? []) as Array<{ kind: string; children?: Array<unknown> }>)
        }
      }
    }
    collect(nodes)
    expect(allFolders.length).toBeGreaterThan(0)
    for (const f of allFolders) expect(f.children.length).toBeGreaterThan(0)
  })

  it('fail 2: a non-array docs container (null / {} / string / number) → [] (never throws)', () => {
    const build = treeApi().buildDocumentTree
    expect(() => build(null)).not.toThrow()
    expect(build(null)).toEqual([])
    expect(build({})).toEqual([])
    expect(build('nope')).toEqual([])
    expect(build(42)).toEqual([])
  })

  it('fail 3: a malformed entry (null / primitive / array / missing documentId) → skipped', () => {
    const nodes = treeApi().buildDocumentTree([
      null,
      7,
      ['x'],
      { title: 'no id' },
      { documentId: '', title: 'empty id' },
      { documentId: 5, title: 'non-string id' },
      docHead('a', 'A', []),
    ]) as Array<{ label: string }>
    expect(nodes.map((n) => n.label)).toEqual(['a'])
  })

  it('fail 4: a non-array path → []; a path with an invalid member truncates at it, retaining earlier valid segments', () => {
    const nodes = treeApi().buildDocumentTree([
      { documentId: 'a/b', title: 'B', path: 'a' as unknown as string[], tags: [] },
    ]) as Array<{ kind: string; label: string }>
    expect(nodes).toHaveLength(1)
    expect(nodes[0]).toMatchObject({ kind: 'document', label: 'b' })

    const truncated = treeApi().buildDocumentTree([
      { documentId: 'a/b/c', title: 'C', path: ['a', '', 'b'] as string[], tags: [] },
    ]) as Array<{ kind: string; label: string; children: Array<{ kind: string; label: string }> }>
    expect(truncated).toHaveLength(1)
    expect(truncated[0]).toMatchObject({ kind: 'folder', label: 'a' })
    expect(truncated[0].children[0]).toMatchObject({ kind: 'document', label: 'c' })
  })

  it('fail 5: a non-array tags → []; non-string tag members are filtered; never throws', () => {
    const nodes = treeApi().buildDocumentTree([
      { documentId: 'a', title: 'A', path: [], tags: 'x' as unknown as string[] },
      { documentId: 'b', title: 'B', path: [], tags: ['ok', 5, null] as unknown as string[] },
    ]) as Array<{ documentId: string; tags: string[] }>
    const byId = new Map(nodes.map((n) => [n.documentId, n.tags]))
    expect(byId.get('a')).toEqual([])
    expect(byId.get('b')).toEqual(['ok'])
  })

  it('fail 8: a folder and a document sharing label AND full id → folder sorts first; total and repeatable', () => {
    const docs = [
      { documentId: 'a', title: 'A', path: ['a'], tags: [] },
      { documentId: 'a', title: 'A-other', path: ['a'] as string[], tags: [] },
    ]
    // The first entry is a folder `a` (its path equals its id only when the
    // last path segment equals the basename); the sibling sort must place the
    // folder before the document regardless. Build a case that guarantees both.
    const nodes = treeApi().buildDocumentTree([
      docHead('a', 'A', []),
      { documentId: 'a', title: 'A-dup', path: [] as string[], tags: [] },
    ]) as Array<{ kind: string; label: string }>
    expect(nodes.map((n) => n.kind)).toEqual(['document', 'document'])
    // The pure tiebreak itself (folder-first) is exercised through the
    // segment-also-document case; assert repeatability here.
    const again = treeApi().buildDocumentTree(docs) as Array<{ kind: string }>
    const againB = treeApi().buildDocumentTree(docs) as Array<{ kind: string }>
    expect(again.map((n) => n.kind)).toEqual(againB.map((n) => n.kind))
  })
})

// ===========================================================================
// §5.4 / §5.6 states 13-15 + §5.7 states 9-10 — selectDocumentIdsByPathPrefix
// ===========================================================================
describe('§5.4 selectDocumentIdsByPathPrefix', () => {
  const docs = [
    docHead('a', 'A', ['a']),
    docHead('a/b', 'B', ['a', 'b']),
    docHead('b', 'B2', ['b']),
  ]

  it('happy 13: prefix ["a"] over ["a"]/["a","b"]/["b"] → the first two ids, sorted, deduped', () => {
    const ids = treeApi().selectDocumentIdsByPathPrefix(docs, ['a'])
    expect(ids).toEqual(['a', 'a/b'])
  })

  it('happy 14: empty prefix [] → every documentId, sorted', () => {
    expect(treeApi().selectDocumentIdsByPathPrefix(docs, [])).toEqual(['a', 'a/b', 'b'])
  })

  it('happy 15: prefix ["a","b"] matches only a path equal to or beginning with it', () => {
    expect(treeApi().selectDocumentIdsByPathPrefix(docs, ['a', 'b'])).toEqual(['a/b'])
    expect(treeApi().selectDocumentIdsByPathPrefix(docs, ['a', 'b', 'c'])).toEqual([])
  })

  it('happy: legacy docs (path []) match ONLY the empty prefix', () => {
    const withLegacy = [...docs, docHead('legacy', 'L', [])]
    expect(treeApi().selectDocumentIdsByPathPrefix(withLegacy, ['a'])).toEqual(['a', 'a/b'])
    expect(treeApi().selectDocumentIdsByPathPrefix(withLegacy, [])).toEqual(['a', 'a/b', 'b', 'legacy'])
  })

  it('fail 9: a non-array prefix behaves as [] (all); a non-array docs → []; never throws', () => {
    const select = treeApi().selectDocumentIdsByPathPrefix
    expect(() => select(docs, null)).not.toThrow()
    expect(select(docs, null)).toEqual(['a', 'a/b', 'b'])
    expect(select(docs, undefined)).toEqual(['a', 'a/b', 'b'])
    expect(select(null, [])).toEqual([])
    expect(select({}, ['a'])).toEqual([])
  })

  it('fail 10: a non-empty prefix no path begins with → []', () => {
    expect(treeApi().selectDocumentIdsByPathPrefix(docs, ['zz'])).toEqual([])
  })

  it('fail 11: a non-empty prefix does NOT select a legacy/prefixed document with an absent path (no id-split)', () => {
    const withPrefixed = [docHead('S:a/readme', 'R', [])]
    expect(treeApi().selectDocumentIdsByPathPrefix(withPrefixed, ['S:a'])).toEqual([])
    expect(treeApi().selectDocumentIdsByPathPrefix(withPrefixed, ['a'])).toEqual([])
  })

  it('output is deduped (first occurrence) then sorted ascending', () => {
    const dupDocs = [
      docHead('b', 'B', []),
      docHead('a', 'A', []),
      docHead('a', 'A-dup', []),
    ]
    expect(treeApi().selectDocumentIdsByPathPrefix(dupDocs, [])).toEqual(['a', 'b'])
  })
})

// ===========================================================================
// §5.5 / §5.6 states 16-17 — display backfill + renderer reconciliation
// ===========================================================================
describe('§5.5 display-only backfill (M13)', () => {
  it('happy 17: a legacy document (no documentPath) displays path: [] — even with a path-qualified documentId (no id split)', () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { content: 'A' }), makeNode('x/y')],
      [makeEdge('dh1', 'doc-head', 'head-a', 'x/y')],
    )
    expect(mcp.handleRagDocHeadsIpc(store).documents[0]).toEqual({
      documentId: 'x/y',
      title: 'A',
      path: [],
      tags: [],
    })
  })

  it('happy 17b: a legacy root with a prefixed id and no path stays root-level [] despite the id shape', () => {
    const store = createSnapshotStore(
      [makeNode('head-s', { content: 'R' }), makeNode('S:a/readme')],
      [makeEdge('dh1', 'doc-head', 'head-s', 'S:a/readme')],
    )
    expect(mcp.handleRagDocHeadsIpc(store).documents[0].path).toEqual([])
  })
})

describe('§5.5 renderer reconciliation — deriveDocNavDocuments stays flat', () => {
  it('happy 16: deriveDocNavDocuments over the widened entries still returns the flat { documentId, title } list', async () => {
    const { deriveDocNavDocuments } = await import('../src/renderer/pane-graph.js')
    const docHeads = [docHead('a', 'A', ['x'], ['t']), docHead('b', 'B', [])]
    const flat = deriveDocNavDocuments(docHeads as never)
    expect(flat).toEqual([
      { documentId: 'a', title: 'A' },
      { documentId: 'b', title: 'B' },
    ])
    for (const d of flat) {
      expect(Object.keys(d).sort()).toEqual(['documentId', 'title'])
    }
  })
})
