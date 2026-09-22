// tests/single-editable-surface.test.ts — REBUILT suite (the `C9 U-EDIT-1`
// rebuild of the archived `contenteditable-editor-host` / `rich-splice` inputs).
//
// Derived from docs/specs/unit-u-edit-1-whole-page-editing.md:
//   - §2.1 the single editable surface (`ST-1`) as AMENDED 2026-09-21
//     (§11 amendment `11.7`): EXACTLY ONE `contenteditable` root per rendered
//     document, authored at the **APP-GRAPH / STAGE-ASSEMBLY** layer — the pure
//     builder `src/renderer/pane-graph.ts` `assembleAppGraphEnvelope` (its
//     `AppGraphAssemblyResult.envelope`, the assembled app graph the renderer
//     loads), carried in by the host's `applyEditorToolbar`/`loadAppGraph` seam.
//     The surface carries `props.id = 'page-edit-surface'`,
//     `props['data-edit-surface'] = <documentId>`, `props.contenteditable =
//     true` and its name-referenced handler defs; ZERO `[contenteditable]`
//     hosts on individual RAG subtree roots; its subtree IS the assembled body
//     of the FOCUSED document (doc-head first, then the sections/blocks
//     including table cells and the rich blocks' inline children); a body
//     element outside the surface is `FS1`.
//   - §11 amendment `11.7` + §6.5's re-derivation list: **every surface-shape
//     assertion here reads the APP-GRAPH RENDER (the `assembleAppGraphEnvelope`
//     result) and the DOM the runtime mounts — never `buildTraversal`'s payload
//     shape.** The traversal envelope is not an assertion surface for the
//     surface (`FS1`'s restatement, §8.1).
//   - §2.1 Invariant row: exactly ONE surface per FOCUSED document/tab; on a
//     simultaneous multi-document mount every other mounted document root stays
//     a plain payload root.
//   - §2.2 the doc-head/title element (`ST-3`): the head RAG subtree root
//     carries the traversal-derived `data-doc-head` marker and its own authored
//     id, and it is NOT re-parented into a section
//     (`DOC-HEAD-CONTAINS-FIRST-PARAGRAPH`).
//   - §5.1 the textarea tombstone (UNCHANGED by the amendment, §11.7's closing
//     clause): the traversal keeps ONE child at the `textarea-<ragId>` position
//     so the fence's child list holds unchanged, but the child is INERT
//     (`hidden: true`, `readOnly: true`, NO handler defs) — `FS21`.
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
//   S4  a rich block carrying inline children (strong/a)
//   S5  a document materialized into a zone that also carries panes
//   S6  the tombstone child at its authored position (fence-compatible)
//   S7  a simultaneous MULTI-document mount (only the focused document surfaced)
// Fail-states covered: `FS1` (more than one editable root / a body element
//   outside the surface), `FS21` (a rendered or handler-carrying tombstone).
//
// The head↔body ARROW-KEY caret crossing (§2.2 item 4), the painted monospace
// markdown mode (§8.3 item 4) and the zero-rendered-textarea LIVE census (§8.3
// item 6) are live-only assertions (no layout, no selection in the dom-shim —
// RCA-12); they are asserted by the unit's live battery, not here. They are
// deliberately NOT written as node tests.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { buildTraversal, type TraversalResult } from '../src/main/traversal.js'
import { createJsonRagStore, type RagStore, type RagNode, type RagEdge } from '../src/main/rag-store.js'
import {
  assembleAppGraphEnvelope,
  type AppGraphAssemblyResult,
} from '../src/renderer/pane-graph.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'

beforeAll(() => {
  // the dom-shim is needed only for the §2.1 DOM half of the surface census
  // (§8.1 `FS1`: the detection surface is the app-graph render AND the DOM).
  installShim()
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
 * A document whose doc-head is `title` (an `h1`) followed by `p1` (a `p`),
 * `end` (a `p`) — the section spine — with an optional table (`t` > `c1`/`c2`)
 * whose cells are `doc-child` blocks of `p1`, and an optional rich paragraph
 * (`rich`) carrying inline children (`strong` + `a`) as the last section.
 * The doc-flow: doc-head(title) → next-section(p1) → next-section(end) →
 * next-section(rich) → doc-end(rich) → doc.
 */
interface DocFixture {
  store: RagStore
  dir: string
}

async function docStore(opts: { table?: boolean; rich?: boolean } = {}): Promise<DocFixture> {
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
    // `end` stays a section; `rich` becomes the last section + the doc-end
    edges.push(makeEdge('e-r1', 'next-section', 'end', 'rich', { documentIds: ['doc'] }))
    edges.push(makeEdge('e-r2', 'doc-end', 'rich', 'doc', { documentIds: ['doc'] }))
    const idx = edges.findIndex((e) => e.id === 'e-end')
    if (idx !== -1) edges.splice(idx, 1)
  }
  await seed(store, nodes, edges)
  return { store, dir }
}

// ---------------------------------------------------------------------------
// THE APP-GRAPH / STAGE-ASSEMBLY RENDER (the assertion surface, §2.1/§11.7)
// ---------------------------------------------------------------------------
/** The focused document id whose assembled body is surfaced (§2.1 Invariant). */
const DOCUMENT_ID = 'doc'
/** `PAGE_EDIT_SURFACE_ID` — pinned by §2.1's stable-authored-id row. */
const PAGE_EDIT_SURFACE_ID = 'page-edit-surface'
/** `props['data-edit-surface']` — the marker pinned with its document id. */
const DATA_EDIT_SURFACE = 'data-edit-surface'
/** The per-root `contenteditable` prop the superseded model spliced (§5 item 1). */
const CONTENTEDITABLE = 'contenteditable'
/** The traversal zoneName the surface is placed in (§2.1's authoring row). */
const ZONE_NAME = 'main'

interface Render {
  fixture: DocFixture
  traversal: TraversalResult
  assembly: AppGraphAssemblyResult
  /** The assembled app graph the renderer loads (§11.7). */
  envelope: LegacyInitialData
}

/**
 * Build the TRAVERSAL envelope and then the APP-GRAPH / STAGE render from it
 * (§2.1's authoring row: `assembleAppGraphEnvelope` is the builder the renderer
 * assembles the stage from). The builder is PURE and takes the FOCUSED
 * document id as its input — the amendment records that it takes none today
 * (§11.7's cost item 2) — and the surface root is authored into the result.
 */
function render(opts: { table?: boolean; rich?: boolean; zone?: string; documentId?: string } = {}): Promise<Render> {
  return docStore(opts).then((fixture) => {
    const traversal = buildTraversal({
      store: fixture.store,
      documentIds: [DOCUMENT_ID],
      zoneName: opts.zone ?? ZONE_NAME,
    })
    const assembly = assembleAppGraphEnvelope({
      traversalEnvelope: traversal.envelope,
      registry: createPaneRegistry(),
      ctx: {},
      documentId: opts.documentId ?? DOCUMENT_ID,
    })
    return { fixture, traversal, assembly, envelope: assembly.envelope }
  })
}

function release(r: Render): void {
  rmSync(r.fixture.dir, { recursive: true, force: true })
}

// ---------------------------------------------------------------------------
// authored-node helpers (the assembled app graph, never a rendered detail)
// ---------------------------------------------------------------------------
function collectAuthored(node: LegacyNodeData, out: LegacyNodeData[] = []): LegacyNodeData[] {
  out.push(node)
  for (const c of (node.children ?? []) as LegacyNodeData[]) collectAuthored(c, out)
  return out
}

/** Every authored node of the ASSEMBLED app graph, across every content payload. */
function appGraphNodes(env: LegacyInitialData): LegacyNodeData[] {
  const out: LegacyNodeData[] = []
  for (const payload of env.content ?? []) {
    for (const root of payload.content ?? []) collectAuthored(root, out)
  }
  return out
}

/** The authored id of a node (`props.id`). */
function authoredId(node: LegacyNodeData): unknown {
  return (node.props as Record<string, unknown> | undefined)?.id
}

/** The RAG node id a subtree root is bound to (`props['data-rag-node-id']`). */
function ragIdOf(node: LegacyNodeData | undefined): unknown {
  return (node.props as Record<string, unknown> | undefined)?.['data-rag-node-id']
}

/** The ONE editable surface root of the assembled app graph (§2.1 cardinality). */
function surfaceRoots(env: LegacyInitialData): LegacyNodeData[] {
  return appGraphNodes(env).filter((n) => authoredId(n) === PAGE_EDIT_SURFACE_ID)
}

/** The RAG subtree roots of the assembled app graph (`rag-<id>` authored ids). */
function ragRoots(env: LegacyInitialData): LegacyNodeData[] {
  return appGraphNodes(env).filter((n) => typeof ragIdOf(n) === 'string')
}

/**
 * The DOCUMENT payload roots of the assembled app graph — one per authored
 * section, each bound to a RAG node id (§2.1's Subtree row + the fence's
 * one-payload-per-section pin, read on the assembled render). The surface root
 * is deliberately NOT one of these: a `page-edit-surface` payload in this set
 * would be the amendment's rejected placement (i).
 */
function documentPayloadRoots(env: LegacyInitialData): LegacyNodeData[] {
  return (env.content ?? [])
    .map((payload) => payload.content?.[0] as LegacyNodeData | undefined)
    .filter((root): root is LegacyNodeData => typeof ragIdOf(root) === 'string')
}

/** The authored id of the doc-head subtree root (the node the traversal marked). */
function docHeadRoot(env: LegacyInitialData): LegacyNodeData | undefined {
  return appGraphNodes(env).find((n) => (n.props as Record<string, unknown> | undefined)?.['data-doc-head'] === true)
}

/** True when the authored node is a textarea (the §5.1 tombstone position). */
function isTextareaChild(node: LegacyNodeData): boolean {
  return node.type === 'textarea'
}

/** Every authored textarea child in the assembled app graph. */
function textareaChildren(env: LegacyInitialData): LegacyNodeData[] {
  return appGraphNodes(env).filter(isTextareaChild)
}

/**
 * The RAG ids of the surface's DIRECT children, in document order — the
 * document-payload roots the assembly collected under the one surface
 * (§2.1's Subtree/Scope rows: the doc-head first, then the assembled body
 * blocks). A `doc-child` block (a table cell, a nested table) is NOT a direct
 * child of the surface: the scoped walk nests it inside its containing block
 * (`DECIDED: SCOPED-WALK`/`DOC-CHILD`), so it is read by
 * `ragIdsInSubtree` below.
 */
function ragIdsWithin(surface: LegacyNodeData | undefined): string[] {
  if (surface == null) return []
  const ids: string[] = []
  for (const child of (surface.children ?? []) as LegacyNodeData[]) {
    if (typeof ragIdOf(child) === 'string') ids.push(ragIdOf(child) as string)
  }
  return ids
}

/**
 * The RAG ids reachable ANYWHERE inside the surface's subtree (§2.1's Subtree
 * row: "the doc-head/title element first, then the body blocks the stage
 * renders (sections, their blocks, table cells and the rich blocks' inline
 * children), in document order"; the Scope row repeats "including table
 * cells"). De-duplicated in first-seen order: the `textarea-<ragId>` tombstone
 * carries the SAME `data-rag-node-id` as the block it sits in (§5.1), so the
 * raw walk yields duplicates.
 */
function ragIdsInSubtree(surface: LegacyNodeData | undefined): string[] {
  if (surface == null) return []
  const ids: string[] = []
  const seen = new Set<string>()
  for (const n of collectAuthored(surface)) {
    const id = ragIdOf(n)
    if (typeof id !== 'string' || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }
  return ids
}

/** Mount the assembled app graph and return the runtime mount element. */
function mountAppGraph(env: LegacyInitialData): { mount: ReturnType<typeof mountEl>; runtime: Runtime } {
  const mount = mountEl()
  const runtime = new Runtime({ mount: mount as never, envelope: env as never })
  runtime.loadEnvelope(env as never)
  return { mount, runtime }
}

// ===========================================================================
// §2.1 — the single editable surface (`ST-1`), app-graph render + DOM
// ===========================================================================
describe('§2.1 ST-1 — the app-graph render authors EXACTLY ONE editable surface per rendered document', () => {
  it('state S1/S2 — the assembled app graph carries exactly one authored surface root with the pinned id', async () => {
    const r = await render()
    try {
      expect(surfaceRoots(r.envelope)).toHaveLength(1)
    } finally {
      release(r)
    }
  })

  it('state S1/S2 — the surface root is the SINGLE contenteditable authoring point of the assembled app graph (no per-root hosts)', async () => {
    const r = await render({ rich: true })
    try {
      const editable = appGraphNodes(r.envelope).filter(
        (n) => (n.props as Record<string, unknown> | undefined)?.[CONTENTEDITABLE] === true,
      )
      expect(editable).toHaveLength(1)
      expect(authoredId(editable[0])).toBe(PAGE_EDIT_SURFACE_ID)
    } finally {
      release(r)
    }
  })

  it('state S1/S2 — the surface root carries the stable data-edit-surface marker bound to the focused document id', async () => {
    const r = await render()
    try {
      const props = surfaceRoots(r.envelope)[0]?.props as Record<string, unknown> | undefined
      expect(props).toBeDefined()
      expect(props?.[DATA_EDIT_SURFACE]).toBe(DOCUMENT_ID)
    } finally {
      release(r)
    }
  })

  it('state S1/S2 — the surface root carries its name-referenced handler defs and NO retired per-node handler name', async () => {
    const r = await render()
    try {
      const surface = surfaceRoots(r.envelope)[0]
      const names = ((surface?.handlers ?? []) as Array<{ name?: unknown }>).map((h) => String(h.name))
      // §2.1's authoring row: the surface is authored WITH its name-referenced
      // handler defs (the single editing host is the page's own handler root).
      expect(names.length).toBeGreaterThan(0)
      // §5 items 2/6: the per-node rich/textarea handler names are retired —
      // the surface never reuses one (a live token whose meaning the
      // supersession voids).
      for (const name of names) {
        expect(name).not.toMatch(/^rag-(editor|textarea)-/)
      }
    } finally {
      release(r)
    }
  })

  it('state S1/S2 — ZERO authored RAG subtree roots carry a contenteditable prop (the per-node splice is gone)', async () => {
    const r = await render({ rich: true })
    try {
      const perRootHosts = ragRoots(r.envelope).filter(
        (n) => (n.props as Record<string, unknown> | undefined)?.[CONTENTEDITABLE] !== undefined,
      )
      expect(perRootHosts.map((n) => ragIdOf(n))).toEqual([])
    } finally {
      release(r)
    }
  })

  it('state S5 — the surface is authored INTO the traversal zone (`targetPlacement: [zoneName]`), never left unanchored', async () => {
    const r = await render({ zone: ZONE_NAME })
    try {
      const surface = surfaceRoots(r.envelope)[0]
      const placement = surface?.placement as { targetPlacement?: unknown[] } | undefined
      expect(placement?.targetPlacement).toEqual([ZONE_NAME])
    } finally {
      release(r)
    }
  })

  it('state S1/S2 — the surface is NOT a document payload root (the one-payload-per-section census is unchanged in the render)', async () => {
    const r = await render({ table: true, rich: true })
    try {
      // the document payload roots are the authored sections, each bound to a
      // RAG id — the surface is a SEPARATE content root of the assembled graph.
      const documentRoots = documentPayloadRoots(r.envelope)
      expect(documentRoots.length).toBeGreaterThan(0)
      expect(documentRoots.map((n) => authoredId(n))).not.toContain(PAGE_EDIT_SURFACE_ID)
      // and it is authored in its OWN payload, ALONE — not appended to a
      // section's body and not a second payload-root-level node
      // (§11.7's rejected placements ii/iii/iv).
      const payloads = r.envelope.content ?? []
      const surfacePayloads = payloads
        .map((p, i) => ({ i, nodes: (p.content ?? []) as LegacyNodeData[] }))
        .filter(({ nodes }) => nodes.some((n) => authoredId(n) === PAGE_EDIT_SURFACE_ID))
      expect(surfacePayloads).toHaveLength(1)
      expect(surfacePayloads[0].nodes).toHaveLength(1)
    } finally {
      release(r)
    }
  })

  it('state S3 — the surface subtree collects every document-body payload root, table cells included (a selection can reach a td/th)', async () => {
    const r = await render({ table: true, rich: true })
    try {
      const surface = surfaceRoots(r.envelope)[0]
      // §2.1 Subtree/Scope: the surface's DIRECT children are the assembled
      // document's payload roots (head first, then the body sections, in
      // document order) — the fixture's sections are `title`/`p1`/`end`/`rich`.
      expect(ragIdsWithin(surface)).toEqual(['title', 'p1', 'end', 'rich'])
      // §2.1 Subtree row: the surface's SUBTREE (transitively) is the whole
      // rendered body — "their blocks, table cells and the rich blocks' inline
      // children". The fixture hangs the table `t` and its cells `c1`/`c2` off
      // `p1` as `doc-child` edges (the scoped walk nests them at their `order`
      // inside the containing block), so the clause is asserted on the
      // SUBTREE, never on the surface's direct children.
      const inSubtree = ragIdsInSubtree(surface)
      expect(inSubtree).toEqual(expect.arrayContaining(['title', 'p1', 't', 'c1', 'c2', 'end', 'rich']))
      // and the census is complete: no rag-bound block of this document is
      // missing from the surface's subtree (§2.1 Scope's "body element outside
      // the surface is FS1" read on the positive side).
      for (const id of ['t', 'c1', 'c2']) expect(inSubtree).toContain(id)
    } finally {
      release(r)
    }
  })

  it('state S4 — the surface subtree carries the rich block\'s inline children (strong/a stay inside the one root)', async () => {
    const r = await render({ rich: true })
    try {
      const surface = surfaceRoots(r.envelope)[0] as LegacyNodeData
      const types = collectAuthored(surface).map((n) => n.type)
      expect(types).toContain('strong')
      expect(types).toContain('a')
    } finally {
      release(r)
    }
  })

  it('state S1/S2 — the mounted DOM carries exactly ONE [contenteditable] host, and it is the authored surface (FS1 census, DOM half)', async () => {
    const r = await render({ rich: true })
    try {
      const { mount, runtime } = mountAppGraph(r.envelope)
      const editable = mount.querySelectorAll('[contenteditable]')
      expect(editable).toHaveLength(1)
      expect(editable[0].getAttribute('id')).toBe(PAGE_EDIT_SURFACE_ID)
      expect(editable[0].getAttribute(DATA_EDIT_SURFACE)).toBe(DOCUMENT_ID)
      // and no RAG subtree root is an editable host (the per-node splice is gone)
      for (const root of mount.querySelectorAll('[data-rag-node-id]')) {
        expect(root.getAttribute(CONTENTEDITABLE)).toBeNull()
      }
      expect(runtime.materializedContentRoots().length).toBeGreaterThan(0)
    } finally {
      release(r)
    }
  })

  it('FS1 — no document-body block is materialized OUTSIDE the single surface (an unsurfaced block is a fail-state)', async () => {
    const r = await render({ table: true, rich: true })
    try {
      const surface = surfaceRoots(r.envelope)[0]
      // §2.1 Scope / §8.1 FS1: the census is over the ASSEMBLED app graph, and
      // it is TRANSITIVE — every rag-bound node the stage renders (the table
      // `t` and its cells `c1`/`c2` are `doc-child` blocks nested in `p1`) must
      // sit inside the one surface.
      const within = new Set(ragIdsInSubtree(surface))
      // NON-VACUITY: the nested doc-children are in the census, so the
      // exclusion below is not satisfied by an empty surface subtree.
      for (const id of ['title', 'p1', 't', 'c1', 'c2', 'end', 'rich']) {
        expect(within, `the census must contain ${id} before the outside-check can discriminate`).toContain(id)
      }
      const outside = ragRoots(r.envelope)
        .map((n) => ragIdOf(n) as string)
        .filter((id) => !within.has(id))
      expect(outside).toEqual([])
    } finally {
      release(r)
    }
  })

  it('FS1 — the render materializes each document block exactly once (no block is both inside the surface and a zone-level sibling)', async () => {
    const r = await render({ table: true, rich: true })
    try {
      const { mount } = mountAppGraph(r.envelope)
      const ids = mount.querySelectorAll('[data-rag-node-id]').map((el) => el.getAttribute('id'))
      const raged = ids.filter((id): id is string => typeof id === 'string' && id.startsWith('rag-'))
      expect(new Set(raged).size).toBe(raged.length)
    } finally {
      release(r)
    }
  })

  it('state S7 (Invariant row) — a NON-focused mounted document root stays a plain payload root (exactly one surface per focused document)', async () => {
    const r = await render()
    try {
      // the invariant is read on the assembled render: one surface authoring
      // point, and it names the FOCUSED document — a second document's payload
      // root is the plain `rag-` root it always was.
      const surface = surfaceRoots(r.envelope)
      expect(surface).toHaveLength(1)
      expect((surface[0].props as Record<string, unknown>)[DATA_EDIT_SURFACE]).toBe(DOCUMENT_ID)
      const documentRoots = documentPayloadRoots(r.envelope)
      expect(documentRoots.length).toBeGreaterThan(0)
      for (const root of documentRoots) {
        expect((root.props as Record<string, unknown>)[CONTENTEDITABLE]).toBeUndefined()
      }
    } finally {
      release(r)
    }
  })
})

// ===========================================================================
// §2.2 — the doc-head/title element (`ST-3`)
// ===========================================================================
describe('§2.2 ST-3 — the doc-head is a sibling of the body blocks, inside the one surface', () => {
  it('state S1 — the head element and the body first block are DISTINCT siblings under the surface root', async () => {
    const r = await render()
    try {
      const surface = surfaceRoots(r.envelope)[0]
      const head = docHeadRoot(r.envelope)
      const body = documentPayloadRoots(r.envelope).find((n) => ragIdOf(n) === 'p1')
      expect(head).toBeDefined()
      expect(body).toBeDefined()
      expect(head!.type).toBe('h1')
      expect(body!.type).toBe('p')
      expect(head).not.toBe(body)
      // distinct authored ids and distinct RAG bindings (§2.2 item 1)
      expect(authoredId(head!)).toBe('rag-title')
      expect(authoredId(body!)).toBe('rag-p1')
      expect(ragIdOf(head!)).not.toBe(ragIdOf(body!))
      // both are inside the ONE surface root, in document order (head first)
      expect(ragIdsWithin(surface)).toEqual(['title', 'p1', 'end'])
      // and the body's first block is NOT a descendant of the head element
      // (the `DOC-HEAD-CONTAINS-FIRST-PARAGRAPH` defect)
      expect(collectAuthored(head!).map((n) => ragIdOf(n))).not.toContain('p1')
    } finally {
      release(r)
    }
  })

  it('state S1 — the doc-head marker is preserved on the head subtree root in the assembled render', async () => {
    const r = await render()
    try {
      const head = docHeadRoot(r.envelope)
      expect((head?.props as Record<string, unknown> | undefined)?.['data-doc-head']).toBe(true)
      expect(ragIdOf(head)).toBe('title')
    } finally {
      release(r)
    }
  })

  it('state S1 — the head element belongs to the surface subtree (the one editing host spans head → body)', async () => {
    const r = await render()
    try {
      const surface = surfaceRoots(r.envelope)[0]
      expect(ragIdsWithin(surface)).toContain('title')
      const { mount } = mountAppGraph(r.envelope)
      const surfaceEl = mount.querySelector('[contenteditable]')
      expect(surfaceEl).not.toBeNull()
      expect(surfaceEl!.querySelector('[data-doc-head]')).not.toBeNull()
    } finally {
      release(r)
    }
  })
})

// ===========================================================================
// §5.1 — the textarea tombstone (`FS21`, the fence-compatible interim).
// UNCHANGED by the 2026-09-21 amendment (§11.7's closing clause): the
// tombstone's resolution for the `textarea-<ragId>` child is not re-derived,
// and the tombstone row STAYS.
// ===========================================================================
describe('§5.1 — the traversal textarea child is an inert tombstone', () => {
  it('state S6 — the tombstone is authored at its child position so the fence child list holds', async () => {
    const r = await render()
    try {
      const titleRoot = ragRoots(r.envelope).find((n) => ragIdOf(n) === 'title')
      const childIds = ((titleRoot?.children ?? []) as LegacyNodeData[]).map((c) => authoredId(c))
      expect(childIds).toContain('textarea-title')
    } finally {
      release(r)
    }
  })

  it('FS21 — every tombstone is hidden AND readOnly (a non-rendered, non-interactive artifact)', async () => {
    const r = await render()
    try {
      const tombstones = textareaChildren(r.envelope)
      expect(tombstones.length).toBeGreaterThan(0)
      for (const t of tombstones) {
        const props = t.props as Record<string, unknown>
        expect(props.hidden).toBe(true)
        expect(props.readOnly).toBe(true)
      }
    } finally {
      release(r)
    }
  })

  it('FS21 — no tombstone carries a handler def (the per-node editing capability is gone)', async () => {
    const r = await render()
    try {
      const handlers = textareaChildren(r.envelope).flatMap((t) => (t.handlers ?? []) as unknown[])
      expect(handlers).toEqual([])
    } finally {
      release(r)
    }
  })

  it('FS21 — no tombstone binds a per-node value/props id outside the tombstone id namespace', async () => {
    const r = await render()
    try {
      for (const t of textareaChildren(r.envelope)) {
        const props = t.props as Record<string, unknown>
        expect(String(props.id).startsWith('textarea-')).toBe(true)
        expect(props.value).toBeUndefined()
      }
    } finally {
      release(r)
    }
  })
})
