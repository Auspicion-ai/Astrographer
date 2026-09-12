// tests/unit-ud4-doc-heads-tree-adversarial.test.ts — Unit U-D4 adversarial
// findings F1 + F2 (docs/specs/unit-ud4-doc-heads-tree.md §3a). RED before the
// fix:
//
//   - F1 (LOW, HOST): `buildDocumentTree` claims to be TOTAL, but `sortChildren`
//     is recursive and overflows the call stack on a very deep path. The tree
//     build must be depth-safe (iterative post-order / explicit stack).
//   - F2 (LOW, HOST): `handleRagDocHeadsIpc` skips null/undefined/'' targets but
//     not a non-string (number/object/boolean) target; with >=2 entries the
//     final sort dereferences `.localeCompare` and throws. The guard must be
//     broadened to `typeof e.target !== 'string' || e.target === ''`.
//
// Harness derived from tests/unit-ud4-doc-heads-tree.test.ts.
import { describe, it, expect, beforeAll } from 'vitest'
import { createSnapshotStore } from '../src/main/adjacency.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import * as mcp from '../src/main/mcp-server.js'

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

function treeApi(): TreeModule {
  if (tree == null) {
    throw new Error('src/shared/document-tree.ts is absent (U-D4 not implemented)')
  }
  return tree
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

function docHead(
  documentId: string,
  title: string,
  path: string[],
  tags: string[] = [],
): { documentId: string; title: string; path: string[]; tags: string[] } {
  return { documentId, title, path, tags }
}

interface FolderNode {
  kind: string
  label: string
  path: string[]
  children: unknown[]
}

// ===========================================================================
// F1 — buildDocumentTree is depth-safe (TOTAL, no call-stack bound)
// ===========================================================================
describe('F1 — buildDocumentTree depth-safety', () => {
  it('F1: a 10 000-segment path returns the full tree and does NOT throw', () => {
    const depth = 10_000
    const path = Array.from({ length: depth }, (_, i) => `s${i}`)
    const docs = [docHead('deep/doc', 'Deep', path, ['t'])]

    let nodes: unknown[] | undefined
    expect(() => {
      nodes = treeApi().buildDocumentTree(docs)
    }).not.toThrow()

    expect(nodes).toBeDefined()
    // Walk the full chain to prove every folder level was built (not truncated).
    let level = nodes as FolderNode[]
    for (let i = 0; i < depth; i++) {
      expect(level).toHaveLength(1)
      const folder = level[0]
      expect(folder.kind).toBe('folder')
      expect(folder.label).toBe(`s${i}`)
      level = folder.children as FolderNode[]
    }
    expect(level).toHaveLength(1)
    expect(level[0]).toMatchObject({ kind: 'document', documentId: 'deep/doc' })
  })

  it('F1 pin: the iterative fix preserves the folder-first sibling tiebreak', () => {
    const nodes = treeApi().buildDocumentTree([
      docHead('a', 'A', []),
      docHead('a/b', 'B', ['a']),
    ]) as Array<{ kind: string; label: string }>
    expect(nodes.map((n) => n.kind)).toEqual(['folder', 'document'])
    expect(nodes.map((n) => n.label)).toEqual(['a', 'a'])
  })
})

// ===========================================================================
// F2 — handleRagDocHeadsIpc skips non-string targets
// ===========================================================================
describe('F2 — handleRagDocHeadsIpc non-string target guard', () => {
  it('F2: number/object doc-head targets are skipped; no throw; { documents: [] }', () => {
    const store = createSnapshotStore(
      [makeNode('head-a', { content: 'A' }), makeNode('head-b', { content: 'B' })],
      [
        { ...makeEdge('e1', 'doc-head', 'head-a', 'x'), target: 5 as unknown as string },
        { ...makeEdge('e2', 'doc-head', 'head-b', 'y'), target: {} as unknown as string },
      ],
    )
    expect(() => mcp.handleRagDocHeadsIpc(store)).not.toThrow()
    expect(mcp.handleRagDocHeadsIpc(store)).toEqual({ documents: [] })
  })

  it('F2 pin: valid string targets are still included alongside skipped malformed ones', () => {
    const store = createSnapshotStore(
      [
        makeNode('head-a', { content: 'A' }),
        makeNode('head-b', { content: 'B' }),
        makeNode('head-c', { content: 'C' }),
        makeNode('doc-a'),
        makeNode('doc-b'),
      ],
      [
        { ...makeEdge('e1', 'doc-head', 'head-a', 'x'), target: true as unknown as string },
        makeEdge('e2', 'doc-head', 'head-a', 'doc-a'),
        makeEdge('e3', 'doc-head', 'head-b', 'doc-b'),
      ],
    )
    const result = mcp.handleRagDocHeadsIpc(store)
    expect(result.documents.map((d) => d.documentId)).toEqual(['doc-a', 'doc-b'])
  })
})

// ===========================================================================
// F4-followup — copyNode's documentPath/tags Array.isArray guard
// ===========================================================================
describe('F4-followup — non-array root documentPath/tags → []/[]', () => {
  it('F4-followup: a string documentPath/tags on a snapshot-store root is not spread into characters', () => {
    const store = createSnapshotStore(
      [
        makeNode('sec-f4', { content: 'T' }),
        makeNode('root-f4', {
          documentPath: 'oops' as unknown as string[],
          tags: 'nope' as unknown as string[],
        }),
      ],
      [makeEdge('dh', 'doc-head', 'sec-f4', 'root-f4')],
    )
    const e = mcp.handleRagDocHeadsIpc(store).documents[0]
    expect(e.path).toEqual([])
    expect(e.tags).toEqual([])
  })
})
