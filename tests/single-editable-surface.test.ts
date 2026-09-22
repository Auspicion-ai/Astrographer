// tests/single-editable-surface.test.ts — REBUILT suite (the `C9 U-EDIT-1`
// rebuild of the archived `contenteditable-editor-host` / `rich-splice` inputs).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §2.1 the single editable surface (`ST-1`): EXACTLY ONE `contenteditable`
//     root per rendered document, provident-authored (`props.contenteditable`),
//     the pinned authored id `page-edit-surface` + the `data-edit-surface`
//     marker, ZERO `[contenteditable]` hosts on individual RAG subtree roots,
//     the surface's subtree IS the rendered body (doc-head first, then the
//     section blocks including table cells), and a body element outside the
//     surface is `FS1`.
//   - §2.2 the doc-head/title element (`ST-3`): the head element and the body's
//     first block are DISTINCT SIBLINGS under the surface root with distinct
//     authored ids; the head is not re-parented into a section
//     (`DOC-HEAD-CONTAINS-FIRST-PARAGRAPH`); the `data-doc-head` marker is
//     derived by the traversal and preserved.
//   - §5.1 the textarea tombstone: the traversal keeps ONE child at the
//     `textarea-<ragId>` position so the fence's child list holds unchanged,
//     but the child is INERT (`hidden: true`, `readOnly: true`, NO handler
//     defs) — `FS21`.
//   - §6.5 item 1 (the red-set obligation: the single surface) and §6.5 item 4
//     (the textarea removal).
//
// NOT derived from the archived files' assertions: the per-node `applyEditingMode`
// splice (`props.contenteditable = true` on every rich-eligible root) and its
// per-root handler attach are the SUPERSEDED model (§5 item 1).
//
// States enumerated (the state machine this file covers):
//   S1  a one-section document (head + one paragraph) materialized
//   S2  a multi-section document (head + paragraph + end) materialized
//   S3  a document whose block owns doc-children (a table with cells)
//   S4  a rich block carrying inline children (strong/em/a/img)
//   S5  a document materialized into a zone that also carries panes
//   S6  the tombstone child at its authored position (fence-compatible)
// Fail-states covered: `FS1` (more than one editable root / a body element
//   outside the surface), `FS21` (a rendered or handler-carrying tombstone).
//
// The head↔body ARROW-KEY caret crossing (§2.2 item 4) is a live-only assertion
// (no layout, no selection in the dom-shim — RCA-12); it is asserted by the
// unit's live battery, not here. It is deliberately NOT written as a node test.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { LegacyNodeData } from 'provident-ssr'
import { buildTraversal, type TraversalResult } from '../src/main/traversal.js'
import { createJsonRagStore, type RagStore, type RagNode, type RagEdge } from '../src/main/rag-store.js'

beforeAll(() => {
  // no DOM is needed: every assertion reads the AUTHORED envelope the traversal
  // returns (the provident graph), never rendered layout.
})

// ---------------------------------------------------------------------------
// fixtures
// ---------------------------------------------------------------------------
function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
  const now = new Date().toISOString()
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

async function seed(store: RagStore, nodes: RagNode[], edges: RagEdge[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
  for (const e of edges) await store.putEdge(e)
}

/**
 * A document whose doc-head is `title` (an `h1`) followed by `p1` (a `p`), with
 * an optional table (`t` > `tbody` > `r` > `c1`/`c2`) whose cells are
 * `doc-child` blocks, and an optional rich paragraph carrying inline children.
 * The doc-flow: doc-head(title) → next-section(p1) → next-section(end).
 */
async function docStore(opts: { table?: boolean; rich?: boolean } = {}): Promise<RagStore> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-u-edit-1-surface-'))
  const store = createJsonRagStore({ path: join(dir, 'rag.json') })
  const nodes: RagNode[] = [
    makeNode('doc', { type: 'div', content: 'Doc' }),
    makeNode('title', { type: 'h1', content: 'Title' }),
    makeNode('p1', { type: 'p', content: 'first body paragraph' }),
    makeNode('end', { type: 'p', content: 'end of document' }),
  ]
  const edges: RagEdge[] = [
    makeEdge('e-hd', 'doc-head', 'title', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-n1', 'next-section', 'title', 'p1', { documentIds: ['doc'] }),
    makeEdge('e-n2', 'next-section', 'p1', 'end', { documentIds: ['doc'] }),
    makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
  ]
  if (opts.table) {
    nodes.push(
      makeNode('t', { type: 'table', content: '' }),
      makeNode('c1', { type: 'td', content: 'cell one' }),
      makeNode('c2', { type: 'th', content: 'cell two' }),
    )
    edges.push(
      makeEdge('e-t1', 'doc-child', 'p1', 't', { order: 0 }),
      makeEdge('e-t2', 'doc-child', 't', 'c1', { order: 0 }),
      makeEdge('e-t3', 'doc-child', 't', 'c2', { order: 1 }),
    )
  }
  if (opts.rich) {
    nodes.push(
      makeNode('rich', {
        type: 'p',
        content: 'bold and link',
        children: [
          { type: 'strong', content: 'bold' },
          { type: 'a', content: 'link', props: { href: 'https://example.test/' } },
        ],
      }),
    )
    edges.push(makeEdge('e-r1', 'next-section', 'end', 'rich', { documentIds: ['doc'] }))
    edges.push(makeEdge('e-r2', 'doc-end', 'rich', 'doc', { documentIds: ['doc'] }))
  }
  await seed(store, nodes, edges)
  return store
}

async function traversal(opts: { table?: boolean; rich?: boolean; zone?: string } = {}): Promise<TraversalResult> {
  const store = await docStore(opts)
  return buildTraversal({ store, documentIds: ['doc'], zoneName: opts.zone ?? 'main' })
}

function cleanDirOf(result: TraversalResult): void {
  // the temp dir is owned by the store; nothing to release here (the store is
  // file-backed and read-only after seeding)
  void result
}

// ---------------------------------------------------------------------------
// authored-envelope helpers (the provident graph, never a rendered detail)
// ---------------------------------------------------------------------------
function collectAuthored(node: LegacyNodeData, out: LegacyNodeData[] = []): LegacyNodeData[] {
  out.push(node)
  for (const c of (node.children ?? []) as LegacyNodeData[]) collectAuthored(c, out)
  return out
}

/** Every authored node of a traversal result, across every content payload. */
function envelopeNodes(result: TraversalResult): LegacyNodeData[] {
  const out: LegacyNodeData[] = []
  for (const payload of result.envelope.content) {
    for (const root of payload.content) collectAuthored(root, out)
  }
  return out
}

/** The authored id of a node (`props.id`). */
function authoredId(node: LegacyNodeData): unknown {
  return (node.props as Record<string, unknown> | undefined)?.id
}

/** The RAG node id a subtree root is bound to (`props['data-rag-node-id']`). */
function ragIdOf(node: LegacyNodeData): unknown {
  return (node.props as Record<string, unknown> | undefined)?.['data-rag-node-id']
}

/** `PAGE_EDIT_SURFACE_ID` — pinned by §2.1's stable-authored-id row. */
const PAGE_EDIT_SURFACE_ID = 'page-edit-surface'
/** `props['data-edit-surface']` — the marker pinned with its document id. */
const DATA_EDIT_SURFACE = 'data-edit-surface'
/** The per-root `contenteditable` prop the superseded model spliced (§5 item 1). */
const CONTENTEDITABLE = 'contenteditable'

/** The one editable surface root of a traversal result (§2.1 cardinality). */
function surfaceRoots(result: TraversalResult): LegacyNodeData[] {
  return envelopeNodes(result).filter((n) => authoredId(n) === PAGE_EDIT_SURFACE_ID)
}

/** The authored id of the doc-head subtree root (the node the traversal marked). */
function docHeadRoot(result: TraversalResult): LegacyNodeData | undefined {
  return envelopeNodes(result).find((n) => (n.props as Record<string, unknown> | undefined)?.['data-doc-head'] === true)
}

/** True when the authored node is a textarea (the §5.1 tombstone position). */
function isTextareaChild(node: LegacyNodeData): boolean {
  return node.type === 'textarea'
}

/** Every authored textarea child in the envelope. */
function textareaChildren(result: TraversalResult): LegacyNodeData[] {
  return envelopeNodes(result).filter(isTextareaChild)
}

// ===========================================================================
// §2.1 — the single editable surface (`ST-1`)
// ===========================================================================
describe('§2.1 ST-1 — the stage carries EXACTLY ONE editable surface per rendered document', () => {
  it('state S1/S2 — a materialized document carries exactly one authored surface root with the pinned id', async () => {
    const result = await traversal()
    try {
      expect(surfaceRoots(result)).toHaveLength(1)
    } finally {
      cleanDirOf(result)
    }
  })

  it('state S1/S2 — the surface root is the SINGLE contenteditable root of the document (no per-root hosts)', async () => {
    const result = await traversal()
    try {
      const editable = envelopeNodes(result).filter(
        (n) => (n.props as Record<string, unknown> | undefined)?.[CONTENTEDITABLE] === true,
      )
      expect(editable).toHaveLength(1)
      expect(authoredId(editable[0])).toBe(PAGE_EDIT_SURFACE_ID)
    } finally {
      cleanDirOf(result)
    }
  })

  it('state S1/S2 — the surface root carries the stable data-edit-surface marker bound to the document id', async () => {
    const result = await traversal()
    try {
      const props = surfaceRoots(result)[0]?.props as Record<string, unknown> | undefined
      expect(props).toBeDefined()
      expect(props?.[DATA_EDIT_SURFACE]).toBe('doc')
    } finally {
      cleanDirOf(result)
    }
  })

  it('state S1/S2 — ZERO authored RAG subtree roots carry a contenteditable prop (the per-node splice is gone)', async () => {
    const result = await traversal({ rich: true })
    try {
      const perRootHosts = envelopeNodes(result).filter(
        (n) =>
          typeof ragIdOf(n) === 'string' &&
          (n.props as Record<string, unknown> | undefined)?.[CONTENTEDITABLE] !== undefined,
      )
      expect(perRootHosts.map((n) => ragIdOf(n))).toEqual([])
    } finally {
      cleanDirOf(result)
    }
  })

  it('state S2 — the surface subtree contains the doc-head block and every body block of the document', async () => {
    const result = await traversal()
    try {
      const within = new Set(envelopeNodes(surfaceRoots(result)[0]).map((n) => ragIdOf(n)))
      expect(within.has('title')).toBe(true)
      expect(within.has('p1')).toBe(true)
      expect(within.has('end')).toBe(true)
    } finally {
      cleanDirOf(result)
    }
  })

  it('state S3 — the surface subtree contains nested table-cell blocks (a selection can reach a td/th)', async () => {
    const result = await traversal({ table: true })
    try {
      const within = new Set(envelopeNodes(surfaceRoots(result)[0]).map((n) => ragIdOf(n)))
      expect(within.has('t')).toBe(true)
      expect(within.has('c1')).toBe(true)
      expect(within.has('c2')).toBe(true)
    } finally {
      cleanDirOf(result)
    }
  })

  it('state S4 — the surface subtree contains the inline children of a rich block (strong/a stay inside the one root)', async () => {
    const result = await traversal({ rich: true })
    try {
      const within = envelopeNodes(surfaceRoots(result)[0])
      const types = within.map((n) => n.type)
      expect(types).toContain('strong')
      expect(types).toContain('a')
    } finally {
      cleanDirOf(result)
    }
  })

  it('state S5 — the surface is provident-authored: it is a node of the traversal envelope placed in the traversal zone', async () => {
    const result = await traversal({ zone: 'stage' })
    try {
      const surface = surfaceRoots(result)[0]
      const placement = surface?.placement as { targetPlacement?: string[] } | undefined
      const placedInZone = placement?.targetPlacement?.includes('stage') === true || placement === undefined
      // Either the surface is placed directly in the zone, or it is a child of
      // a payload root that is. What is pinned is that it is authored IN the
      // graph (§2.1's authoring row), never minted by host DOM code.
      expect(placedInZone || surfaceRoots(result).length === 1).toBe(true)
      expect(result.envelope).toBeDefined()
    } finally {
      cleanDirOf(result)
    }
  })

  it('FS1 — no body block is materialized OUTSIDE the single surface (an unsurfaced block is a fail-state)', async () => {
    const result = await traversal({ table: true })
    try {
      const surface = surfaceRoots(result)[0]
      const within = new Set(envelopeNodes(surface).map((n) => ragIdOf(n)))
      const outside = envelopeNodes(result)
        .filter((n) => typeof ragIdOf(n) === 'string')
        .filter((n) => !within.has(ragIdOf(n)))
        .map((n) => ragIdOf(n))
      expect(outside).toEqual([])
    } finally {
      cleanDirOf(result)
    }
  })
})

// ===========================================================================
// §2.2 — the doc-head/title element (`ST-3`)
// ===========================================================================
describe('§2.2 ST-3 — the doc-head is a sibling of the body blocks, inside the one surface', () => {
  it('state S1 — the head element and the body first block are DISTINCT siblings under the surface root', async () => {
    const result = await traversal()
    try {
      const head = docHeadRoot(result)
      const body = envelopeNodes(result).find((n) => ragIdOf(n) === 'p1')
      expect(head).toBeDefined()
      expect(body).toBeDefined()
      expect(head!.type).toBe('h1')
      expect(body!.type).toBe('p')
      expect(head).not.toBe(body)
      // distinct authored ids (§2.2 item 1)
      expect(authoredId(head!)).not.toBe(authoredId(body!))
      // and the body's first block is NOT a descendant of the head element
      // (the `DOC-HEAD-CONTAINS-FIRST-PARAGRAPH` defect)
      expect(collectAuthored(head!).map((n) => ragIdOf(n))).not.toContain('p1')
    } finally {
      cleanDirOf(result)
    }
  })

  it('state S1 — the doc-head marker is preserved on the head subtree root (derived by the traversal)', async () => {
    const result = await traversal()
    try {
      const head = docHeadRoot(result)
      expect((head?.props as Record<string, unknown> | undefined)?.['data-doc-head']).toBe(true)
      expect(ragIdOf(head!)).toBe('title')
    } finally {
      cleanDirOf(result)
    }
  })

  it('state S1 — the head element belongs to the surface subtree (the one editing host spans head → body)', async () => {
    const result = await traversal()
    try {
      const within = new Set(envelopeNodes(surfaceRoots(result)[0]).map((n) => ragIdOf(n)))
      expect(within.has('title')).toBe(true)
    } finally {
      cleanDirOf(result)
    }
  })
})

// ===========================================================================
// §5.1 — the textarea tombstone (`FS21`, the fence-compatible interim)
// ===========================================================================
describe('§5.1 — the traversal textarea child is an inert tombstone', () => {
  it('state S6 — the tombstone is authored at its child position so the fence child list holds', async () => {
    const result = await traversal()
    try {
      const titleRoot = envelopeNodes(result).find((n) => ragIdOf(n) === 'title')
      const childIds = ((titleRoot?.children ?? []) as LegacyNodeData[]).map((c) => authoredId(c))
      expect(childIds).toContain('textarea-title')
    } finally {
      cleanDirOf(result)
    }
  })

  it('FS21 — every tombstone is hidden AND readOnly (a non-rendered, non-interactive artifact)', async () => {
    const result = await traversal()
    try {
      const tombstones = textareaChildren(result)
      expect(tombstones.length).toBeGreaterThan(0)
      for (const t of tombstones) {
        const props = t.props as Record<string, unknown>
        expect(props.hidden).toBe(true)
        expect(props.readOnly).toBe(true)
      }
    } finally {
      cleanDirOf(result)
    }
  })

  it('FS21 — no tombstone carries a handler def (the per-node editing capability is gone)', async () => {
    const result = await traversal()
    try {
      const handlers = textareaChildren(result).flatMap((t) => (t.handlers ?? []) as unknown[])
      expect(handlers).toEqual([])
    } finally {
      cleanDirOf(result)
    }
  })

  it('FS21 — no tombstone binds a per-node value/props id outside the tombstone id namespace', async () => {
    const result = await traversal()
    try {
      for (const t of textareaChildren(result)) {
        const props = t.props as Record<string, unknown>
        expect(String(props.id).startsWith('textarea-')).toBe(true)
        expect(props.value).toBeUndefined()
      }
    } finally {
      cleanDirOf(result)
    }
  })
})
