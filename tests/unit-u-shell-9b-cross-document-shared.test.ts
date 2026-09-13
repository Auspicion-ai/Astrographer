// tests/unit-u-shell-9b-cross-document-shared.test.ts — Unit U-SHELL-9b:
// simultaneous multi-document render (C14) + C20 shared-subtree visualization +
// Option-C commit warn/fork/mutate-all (CROSS-DOCUMENT-SHARED).
//
// TestWriter RED set written from docs/specs/unit-u-shell-9b-cross-document-shared.md
// §2 (contract) + §3 (states 1–9) + §4 (F7–F10b) + §5 (census) BEFORE the
// implementation. All fixtures are authored from the spec ALONE.
//
// ===========================================================================
// SPEC AMBIGUITIES (flagged — NOT invented around; see the TestWriter report)
// ===========================================================================
//
//   A1. The 9b spec names NO new module and NO new helper names. §6 (Build)
//       lists the EXISTING files `content-reconcile.ts` (via U-STATE-1e),
//       `sidebar-panes.ts`, `pane-graph.ts`, `edit-controller.ts`, and
//       `edit-ops.ts` (the fork's `applyBatch`). Unlike U-SHELL-9a (whose spec
//       §2.9 named `tab-state.ts`), the 9b spec pins no pure-module surface.
//       This red set therefore PROPOSES one pure renderer module
//       `src/renderer/cross-document-shared.ts` for the C20 + Option-C
//       decision/planning surface (the `layout-state.ts`/`tab-state.ts`
//       convention: pure, node-testable, no Electron). The Implementer is free
//       to satisfy these imports from an equivalently-named module; every
//       symbol below is a PROPOSAL.
//
//   A2. Owner "documents" are read from the `rag.backlinks` reverse map
//       (W2-Q13 / §2.4): a `Record<ragNodeId, documentIds[]>`. The spec uses
//       the `SUBTREE-OWNERSHIP` `backRefs` language; the exact carrier shape is
//       not pinned. The tests use the `{ [ragNodeId]: documentId[] }` map.
//
//   A3. The C20 background class is "token-driven" (§2.2) but the token/class
//       name is not pinned. The tests read `SHARED_SUBTREE_CLASS` (a proposed
//       exported constant) and assert it is a non-empty class string applied to
//       the shared subtree root's `css.classes`.
//
//   A4. The Option-C fork's persisted ownership ("the editing document is
//       removed from X's owner set; X′ is owned by the editing document",
//       §2.3.3) is encoded on the RAG edges' `documentIds` (CROSS-DOCUMENT-
//       SHARED: an edge carries `documentIds`). The tests seed a 2-owner store
//       with `X` reached by `next-section` edges from each document head and a
//       shared `parent-child` edge (`documentIds:['A','B']`), then assert the
//       post-fork edge/`documentIds` state.
//
//   A5. >2-owner selection: `planFork` takes an optional `migrateDocumentIds`
//       (the checklist selection; defaults to the editing document). The spec
//       §2.3 pins exactly-2 behavior and §4 F10b leaves the none-selected
//       behavior "pinned at implementation". The tests pin: F10b → NO fork ops
//       OR an empty `forkOwners` (either accepted), and the store is unchanged.
//
//   A6. The simultaneous mount seam: `SidebarPanes.mountTabs(entries)` (symmetric
//       to the landed 9a `mountTab(entry)`). The spec pins "all open tabs are
//       mounted" (§2.1) but no method name. `mountTabs` is a PROPOSAL.
//
//   A7. F8 ("reverse map unavailable"): the spec pins "block + message (no
//       silent mutate)". The tests pin `detectSharedCommit(...)` returning a
//       non-null result with `blocked:true` (+ a `reason`).
//
// The red failures below are MISSING-IMPLEMENTATION kind: the dynamic import
// fails (the module is absent) and the guarded host/`mountTabs` access throws a
// labelled RED error, never a test-authoring TypeError.
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
} from '../src/main/rag-store.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-shape.js'
import type { TabEntry, TabTarget } from '../src/renderer/tab-state.js'

beforeAll(() => {
  installShim()
})

// ===========================================================================
// Proposed module surface (spec §2.2/§2.3/§2.4 — see A1). Dynamic import so a
// missing module is a labelled RED per test, not a suite-load crash.
// ===========================================================================
interface SharedOwners {
  [ragNodeId: string]: string[]
}

interface SharedCommitWarning {
  nodeId: string
  editingDocumentId: string
  owners: string[]
  options: Array<'fork' | 'mutate-all'>
  requireChecklist: boolean
  /** F8 — the reverse map is unavailable; block (never silent-mutate). */
  blocked?: boolean
  reason?: string
}

interface ForkPlanInput {
  root: RagNode
  /** X + its owned subtree (deep-copied by the plan). */
  subtree: RagNode[]
  /** Every edge whose source/target is in the subtree. */
  edges: RagEdge[]
  editingDocumentId: string
  owners: string[]
  /** >2 owners — the checklist selection; defaults to [editingDocumentId]. */
  migrateDocumentIds?: string[]
  mintNodeId: () => string
  mintEdgeId: () => string
}

interface ForkPlan {
  ops: BatchOp[]
  forkRootId: string
  /** old subtree id → the new fork id. */
  forkNodeIds: Record<string, string>
  originalOwners: string[]
  forkOwners: string[]
}

interface CrossDocModule {
  SHARED_SUBTREE_CLASS: string
  OWNERS_BOX_ID: string
  OWNERS_BOX_TOGGLE_HANDLER: string
  ownersFor(owners: SharedOwners, ragNodeId: string): string[]
  isShared(owners: SharedOwners, ragNodeId: string): boolean
  ownersBoxContent(input: { ragNodeId: string; owners: string[]; expanded?: boolean }): LegacyNodeData
  applySharedSubtreeDecoration(envelope: LegacyInitialData, owners: SharedOwners): LegacyInitialData
  detectSharedCommit(input: {
    nodeId: string
    editingDocumentId: string
    owners: SharedOwners | null | undefined
  }): SharedCommitWarning | null
  planFork(input: ForkPlanInput): ForkPlan
  planMutateAll(input: { root: RagNode; content: string }): BatchOp[]
}

async function loadCrossDoc(): Promise<CrossDocModule> {
  try {
    return (await import('../src/renderer/cross-document-shared.js')) as unknown as CrossDocModule
  } catch (e) {
    throw new Error(
      'src/renderer/cross-document-shared.ts not implemented (U-SHELL-9b RED — needs the Implementer)',
      { cause: e },
    )
  }
}

// ===========================================================================
// Fixtures — RAG store
// ===========================================================================
function freshStore(): { dir: string; store: RagStore } {
  const dir = mkdtempSync(join(tmpdir(), 'ushell9b-'))
  return { dir, store: createJsonRagStore({ path: join(dir, 'rag.json') }) }
}
function cleanup(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

const NOW = new Date().toISOString()

function n(id: string, type: RagNode['type'], content: string, extra: Partial<RagNode> = {}): RagNode {
  return { id, type, content, ownedNodeIds: [], createdAt: NOW, updatedAt: NOW, ...extra }
}
function e(id: string, kind: RagEdge['kind'], source: string, target: string, documentIds?: string[]): RagEdge {
  return { id, kind, source, target, documentIds, createdAt: NOW, updatedAt: NOW }
}

/** A 2-owner shared store: documents A and B both reach X; X owns childX. */
async function seedTwoOwner(store: RagStore): Promise<void> {
  await store.putNode(n('headA', 'h1', 'Doc A'))
  await store.putNode(n('headB', 'h1', 'Doc B'))
  await store.putNode(n('childX', 'p', 'child'))
  await store.putNode(n('X', 'p', 'shared body', { ownedNodeIds: ['childX'] }))
  await store.putEdge(e('eA1', 'next-section', 'headA', 'X', ['A']))
  await store.putEdge(e('eB1', 'next-section', 'headB', 'X', ['B']))
  await store.putEdge(e('eXc', 'parent-child', 'X', 'childX', ['A', 'B']))
}

/** A 3-owner shared store: documents A, B, C all reach X. */
async function seedThreeOwner(store: RagStore): Promise<void> {
  await store.putNode(n('headA', 'h1', 'Doc A'))
  await store.putNode(n('headB', 'h1', 'Doc B'))
  await store.putNode(n('headC', 'h1', 'Doc C'))
  await store.putNode(n('childX', 'p', 'child'))
  await store.putNode(n('X', 'p', 'shared body', { ownedNodeIds: ['childX'] }))
  await store.putEdge(e('eA1', 'next-section', 'headA', 'X', ['A']))
  await store.putEdge(e('eB1', 'next-section', 'headB', 'X', ['B']))
  await store.putEdge(e('eC1', 'next-section', 'headC', 'X', ['C']))
  await store.putEdge(e('eXc', 'parent-child', 'X', 'childX', ['A', 'B', 'C']))
}

function counter(prefix: string): () => string {
  let i = 0
  return () => `${prefix}${++i}`
}

function planFor(store: RagStore, opts: { editingDocumentId: string; owners: string[]; migrateDocumentIds?: string[] }): ForkPlan {
  const mod = loadCrossDocSync()
  const X = store.getNode('X')!
  const childX = store.getNode('childX')!
  return mod.planFork({
    root: X,
    subtree: [X, childX],
    edges: store.listEdges(),
    editingDocumentId: opts.editingDocumentId,
    owners: opts.owners,
    migrateDocumentIds: opts.migrateDocumentIds,
    mintNodeId: counter('fork-n'),
    mintEdgeId: counter('fork-e'),
  })
}

// The synchronous module handle is only available after the first `await
// loadCrossDoc()`; tests call `await loadCrossDoc()` first and then use the
// returned module. `planFor` is a convenience that re-imports synchronously via
// the cached ESM registry (a second dynamic import of the same specifier
// resolves synchronously from vitest's module cache in practice). To keep the
// RED clean, tests that call `planFor` first `await loadCrossDoc()`.
let cached: CrossDocModule | null = null
function loadCrossDocSync(): CrossDocModule {
  if (cached == null) {
    throw new Error(
      'src/renderer/cross-document-shared.ts not implemented (U-SHELL-9b RED — needs the Implementer)',
    )
  }
  return cached
}
async function mod(): Promise<CrossDocModule> {
  cached = await loadCrossDoc()
  return cached
}

// ===========================================================================
// Fixtures — envelopes (C20)
// ===========================================================================
function ragRoot(id: string, content = '', children: LegacyNodeData[] = []): LegacyNodeData {
  return { type: 'div', props: { id: `rag-${id}` }, content, children }
}
function envelope(roots: LegacyNodeData[]): LegacyInitialData {
  return {
    template: { root: { type: 'div', props: { id: 'root' } } },
    content: roots.map((r) => ({ content: [r] })),
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}
function firstRoot(env: LegacyInitialData): LegacyNodeData {
  return (env.content![0] as { content: LegacyNodeData[] }).content[0]
}

// ===========================================================================
// §2.2/§2.4 + §3.1/§3.6 + §4 F8/F9b/F10b — Option-C detection
// ===========================================================================
describe('U-SHELL-9b — Option-C detection (spec §2.2/§2.4, §3.1/§3.6, §4)', () => {
  const owners2: SharedOwners = { X: ['A', 'B'] }

  it('§2.4 — a node owned by exactly one document is NOT shared (no warn)', async () => {
    const { detectSharedCommit } = await mod()
    expect(detectSharedCommit({ nodeId: 'X', editingDocumentId: 'A', owners: { X: ['A'] } })).toBeNull()
  })

  it('§2.4 — an unknown node (no reverse-map entry) is NOT shared', async () => {
    const { detectSharedCommit } = await mod()
    expect(detectSharedCommit({ nodeId: 'ghost', editingDocumentId: 'A', owners: owners2 })).toBeNull()
  })

  it('§3.1 — a commit on a >1-owner node warns + offers fork and mutate-all', async () => {
    const { detectSharedCommit } = await mod()
    const warn = detectSharedCommit({ nodeId: 'X', editingDocumentId: 'A', owners: owners2 })
    expect(warn).not.toBeNull()
    expect(warn!.owners.slice().sort()).toEqual(['A', 'B'])
    expect(warn!.options).toContain('fork')
    expect(warn!.options).toContain('mutate-all')
  })

  it('§2.3 — exactly 2 owners do NOT require the checklist modal', async () => {
    const { detectSharedCommit } = await mod()
    const warn = detectSharedCommit({ nodeId: 'X', editingDocumentId: 'A', owners: owners2 })
    expect(warn!.requireChecklist).toBe(false)
  })

  it('§3.6 — >2 owners require the checklist + list every sharing document', async () => {
    const { detectSharedCommit } = await mod()
    const warn = detectSharedCommit({ nodeId: 'X', editingDocumentId: 'A', owners: { X: ['A', 'B', 'C'] } })
    expect(warn!.requireChecklist).toBe(true)
    expect(warn!.owners.slice().sort()).toEqual(['A', 'B', 'C'])
  })

  it('F8 — an unavailable reverse map BLOCKS with a message (never silent-mutates)', async () => {
    const { detectSharedCommit } = await mod()
    const warn = detectSharedCommit({ nodeId: 'X', editingDocumentId: 'A', owners: null })
    expect(warn).not.toBeNull()
    expect(warn!.blocked).toBe(true)
    expect(typeof warn!.reason).toBe('string')
    expect(warn!.reason!.length).toBeGreaterThan(0)
  })

  it('F9b — an owner document not open in a tab is still listed from the reverse map', async () => {
    const { detectSharedCommit } = await mod()
    // The editing document A is the only open tab; B is not open.
    const warn = detectSharedCommit({ nodeId: 'X', editingDocumentId: 'A', owners: owners2 })
    expect(warn!.owners).toContain('B')
    expect(warn!.options).toContain('fork')
    expect(warn!.options).toContain('mutate-all')
  })
})

// ===========================================================================
// §2.3 + §3.1/§3.5/§3.6/§3.7/§3.8 + §4 F7 — Option-C fork plan + mutate-all
// ===========================================================================
describe('U-SHELL-9b — Option-C fork/mutate-all (spec §2.3, §3.5/§3.6/§3.7/§3.8, §4 F7)', () => {
  it('§2.3.1 — the fork DEEP-COPIES X + its owned subtree into new ids', async () => {
    const { dir, store } = freshStore()
    try {
      await seedTwoOwner(store)
      await mod()
      const plan = planFor(store, { editingDocumentId: 'A', owners: ['A', 'B'] })
      expect(plan.forkRootId).not.toBe('X')
      expect(plan.forkNodeIds['X']).toBe(plan.forkRootId)
      expect(typeof plan.forkNodeIds['childX']).toBe('string')
      const copyOps = plan.ops.filter((o): o is Extract<BatchOp, { op: 'putNode' }> => o.op === 'putNode')
      const copiedRoot = copyOps.find((o) => o.node.id === plan.forkRootId)
      const copiedChild = copyOps.find((o) => o.node.id === plan.forkNodeIds['childX'])
      expect(copiedRoot?.node.content).toBe('shared body')
      expect(copiedChild?.node.content).toBe('child')
    } finally {
      cleanup(dir)
    }
  })

  it('§3.5 — with exactly 2 owners, the editing document forks and the other keeps X', async () => {
    const { dir, store } = freshStore()
    try {
      await seedTwoOwner(store)
      await mod()
      const plan = planFor(store, { editingDocumentId: 'A', owners: ['A', 'B'] })
      expect(plan.originalOwners).toEqual(['B'])
      expect(plan.forkOwners).toEqual(['A'])
      const res = await store.applyBatch(plan.ops)
      expect(res.ok).toBe(true)
      // X survives, owned by B; X′ exists owned by A.
      expect(store.getNode('X')!.content).toBe('shared body')
      expect(store.getNode(plan.forkRootId)!.content).toBe('shared body')
      expect(store.getEdge('eB1')!.documentIds).toEqual(['B'])
      expect(store.getEdge('eA1')).toBeUndefined()
      const forkHeadEdge = store.listEdges().find((x) => x.source === 'headA' && x.target === plan.forkRootId)
      expect(forkHeadEdge?.documentIds).toEqual(['A'])
    } finally {
      cleanup(dir)
    }
  })

  it('§2.3.2 — a SHARED edge drops the editing document and gets a per-document fork edge', async () => {
    const { dir, store } = freshStore()
    try {
      await seedTwoOwner(store)
      await mod()
      const plan = planFor(store, { editingDocumentId: 'A', owners: ['A', 'B'] })
      const res = await store.applyBatch(plan.ops)
      expect(res.ok).toBe(true)
      // The shared parent-child edge now belongs to B only...
      expect(store.getEdge('eXc')!.documentIds).toEqual(['B'])
      // ...and a per-document fork edge links X′ → childX′ for A.
      const forkChildEdge = store
        .listEdges()
        .find((x) => x.source === plan.forkRootId && x.target === plan.forkNodeIds['childX'])
      expect(forkChildEdge?.documentIds).toEqual(['A'])
    } finally {
      cleanup(dir)
    }
  })

  it('§3.5 — the other owner (B) is UNCHANGED by A’s fork', async () => {
    const { dir, store } = freshStore()
    try {
      await seedTwoOwner(store)
      await mod()
      const before = store.getNode('X')
      const plan = planFor(store, { editingDocumentId: 'A', owners: ['A', 'B'] })
      await store.applyBatch(plan.ops)
      expect(store.getNode('X')!.content).toBe(before!.content)
      expect(store.getEdge('eB1')!.target).toBe('X')
      expect(store.getEdge('eB1')!.documentIds).toEqual(['B'])
      expect(store.getNode('childX')!.content).toBe('child')
    } finally {
      cleanup(dir)
    }
  })

  it('§3.8 — the fork changes the editing document’s identity; other owners keep the original id', async () => {
    const { dir, store } = freshStore()
    try {
      await seedTwoOwner(store)
      await mod()
      const plan = planFor(store, { editingDocumentId: 'A', owners: ['A', 'B'] })
      expect(plan.forkRootId).not.toBe('X')
      await store.applyBatch(plan.ops)
      // B's root is still the original id.
      expect(store.getNode('X')).toBeDefined()
      expect(store.getEdge('eB1')!.target).toBe('X')
      // A's root is the fork id.
      expect(store.listEdges().some((x) => x.source === 'headA' && x.target === plan.forkRootId)).toBe(true)
    } finally {
      cleanup(dir)
    }
  })

  it('§2.3 — the fork is ONE atomic applyBatch (exactly one `batch` journal entry)', async () => {
    const { dir, store } = freshStore()
    try {
      await seedTwoOwner(store)
      await mod()
      const plan = planFor(store, { editingDocumentId: 'A', owners: ['A', 'B'] })
      const res = await store.applyBatch(plan.ops)
      expect(res.ok).toBe(true)
      const batchEntries = store.journal().filter((x) => x.kind === 'batch')
      expect(batchEntries).toHaveLength(1)
    } finally {
      cleanup(dir)
    }
  })

  it('§3.6 — >2 owners: the chosen documents migrate to X′; the rest keep X', async () => {
    const { dir, store } = freshStore()
    try {
      await seedThreeOwner(store)
      await mod()
      const plan = planFor(store, {
        editingDocumentId: 'A',
        owners: ['A', 'B', 'C'],
        migrateDocumentIds: ['A', 'C'],
      })
      expect(plan.originalOwners).toEqual(['B'])
      expect(plan.forkOwners.slice().sort()).toEqual(['A', 'C'])
      const res = await store.applyBatch(plan.ops)
      expect(res.ok).toBe(true)
      // B keeps the original, the shared subtree edge is B-only.
      expect(store.getEdge('eB1')!.target).toBe('X')
      expect(store.getEdge('eXc')!.documentIds).toEqual(['B'])
      // A and C now point at the fork.
      expect(store.listEdges().some((x) => x.source === 'headA' && x.target === plan.forkRootId)).toBe(true)
      expect(store.listEdges().some((x) => x.source === 'headC' && x.target === plan.forkRootId)).toBe(true)
      expect(store.getNode(plan.forkRootId)!.content).toBe('shared body')
    } finally {
      cleanup(dir)
    }
  })

  it('F10b — >2 owners + no checklist selection → no migration / the fork is a no-op', async () => {
    const { dir, store } = freshStore()
    try {
      await seedThreeOwner(store)
      await mod()
      const plan = planFor(store, {
        editingDocumentId: 'A',
        owners: ['A', 'B', 'C'],
        migrateDocumentIds: [],
      })
      // Pinned at implementation: no migration (no fork ops OR an empty fork).
      const noFork = plan.ops.length === 0 || plan.forkOwners.length === 0
      expect(noFork).toBe(true)
      if (plan.ops.length > 0) await store.applyBatch(plan.ops)
      // The store is unchanged: all three owners still reach X.
      expect(store.getEdge('eXc')!.documentIds!.slice().sort()).toEqual(['A', 'B', 'C'])
      expect(store.getEdge('eA1')).toBeDefined()
      expect(store.getEdge('eC1')).toBeDefined()
    } finally {
      cleanup(dir)
    }
  })

  it('F7 — a fork failure mid-commit leaves the pre-fork state intact; the warn remains', async () => {
    const { dir, store } = freshStore()
    try {
      await seedTwoOwner(store)
      await mod()
      const plan = planFor(store, { editingDocumentId: 'A', owners: ['A', 'B'] })
      const badOps: BatchOp[] = [
        ...plan.ops,
        { op: 'putEdge', edge: e('e-bad', 'parent-child', 'ghost', plan.forkRootId, ['A']) },
      ]
      const res = await store.applyBatch(badOps)
      expect(res.ok).toBe(false)
      // No partial mutation.
      expect(store.getNode(plan.forkRootId)).toBeUndefined()
      expect(store.getEdge('eA1')).toBeDefined()
      expect(store.getEdge('eXc')!.documentIds!.slice().sort()).toEqual(['A', 'B'])
      expect(store.getNode('X')!.content).toBe('shared body')
      // The warn remains (the shared fact is unchanged).
      const warn = loadCrossDocSync().detectSharedCommit({
        nodeId: 'X',
        editingDocumentId: 'A',
        owners: { X: ['A', 'B'] },
      })
      expect(warn?.options).toContain('fork')
    } finally {
      cleanup(dir)
    }
  })

  it('§3.7 — mutate all owners: a single write to the SAME X (no fork), id unchanged', async () => {
    const { dir, store } = freshStore()
    try {
      await seedTwoOwner(store)
      await mod()
      const ops = loadCrossDocSync().planMutateAll({ root: store.getNode('X')!, content: 'mutated' })
      const res = await store.applyBatch(ops)
      expect(res.ok).toBe(true)
      expect(store.getNode('X')!.content).toBe('mutated')
      expect(store.getNode('X')!.id).toBe('X')
      // No fork node was minted.
      expect(store.listNodes().some((x) => x.id !== 'X' && x.content === 'mutated')).toBe(false)
      // Every owner still points at the one shared X.
      expect(store.getEdge('eA1')!.target).toBe('X')
      expect(store.getEdge('eB1')!.target).toBe('X')
    } finally {
      cleanup(dir)
    }
  })
})

// ===========================================================================
// §2.2/§2.4 + §3.2/§3.4 — C20 shared-subtree visualization
// ===========================================================================
describe('U-SHELL-9b — C20 shared-subtree visualization (spec §2.2/§2.4, §3.2/§3.4)', () => {
  const owners2: SharedOwners = { X: ['A', 'B'] }

  it('§2.4 — owners come from the reverse map; a >1-owner node is shared', async () => {
    const { ownersFor, isShared } = await mod()
    expect(ownersFor(owners2, 'X').slice().sort()).toEqual(['A', 'B'])
    expect(isShared(owners2, 'X')).toBe(true)
    expect(isShared(owners2, 'Y')).toBe(false)
  })

  it('§3.2 — the C20 background class is a non-empty token-driven class applied to the shared subtree root', async () => {
    const { SHARED_SUBTREE_CLASS, applySharedSubtreeDecoration } = await mod()
    expect(typeof SHARED_SUBTREE_CLASS).toBe('string')
    expect(SHARED_SUBTREE_CLASS.length).toBeGreaterThan(0)
    const out = applySharedSubtreeDecoration(envelope([ragRoot('X')]), owners2)
    expect(firstRoot(out).css?.classes ?? []).toContain(SHARED_SUBTREE_CLASS)
  })

  it('§3.2 — a non-shared subtree does NOT carry the C20 background class', async () => {
    const { SHARED_SUBTREE_CLASS, applySharedSubtreeDecoration } = await mod()
    const out = applySharedSubtreeDecoration(envelope([ragRoot('Y')]), owners2)
    expect(firstRoot(out).css?.classes ?? []).not.toContain(SHARED_SUBTREE_CLASS)
  })

  it('§3.2 — the owners box lists the sharing documents from the reverse map', async () => {
    const { applySharedSubtreeDecoration, OWNERS_BOX_ID } = await mod()
    const out = applySharedSubtreeDecoration(envelope([ragRoot('X')]), owners2)
    const root = firstRoot(out)
    const box = (root.children ?? []).find((c) => c.props?.id === OWNERS_BOX_ID)
    expect(box).toBeDefined()
    const text = JSON.stringify(box)
    expect(text).toContain('A')
    expect(text).toContain('B')
  })

  it('§3.2 — the owners box is collapsible (an on:click toggle) and attaches to the SIDE of the owned subtree (not a fixed pane/zone)', async () => {
    const { applySharedSubtreeDecoration, OWNERS_BOX_ID } = await mod()
    const out = applySharedSubtreeDecoration(envelope([ragRoot('X')]), owners2)
    const root = firstRoot(out)
    const box = (root.children ?? []).find((c) => c.props?.id === OWNERS_BOX_ID)
    expect(box, 'the owners box attaches as a child of the shared subtree root').toBeDefined()
    // Collapsible: an on:click toggle handler somewhere inside the box.
    const serialized = JSON.stringify(box)
    expect(serialized).toContain('"event":"click"')
    // Not a fixed pane: the box carries no targetPlacement anchor.
    expect((box as { placement?: unknown }).placement).toBeUndefined()
  })

  it('§3.2 — ownersBoxContent is a provident subtree with an on:click collapse toggle', async () => {
    const { ownersBoxContent, OWNERS_BOX_TOGGLE_HANDLER } = await mod()
    const box = ownersBoxContent({ ragNodeId: 'X', owners: ['A', 'B'], expanded: false })
    const serialized = JSON.stringify(box)
    expect(serialized).toContain('"event":"click"')
    expect(serialized).toContain(OWNERS_BOX_TOGGLE_HANDLER)
    expect(serialized).toContain('A')
    expect(serialized).toContain('B')
  })

  it('§3.4 — a shared node materialized in two documents: BOTH duplicate subtrees carry the C20 background', async () => {
    const { SHARED_SUBTREE_CLASS, applySharedSubtreeDecoration } = await mod()
    const out = applySharedSubtreeDecoration(envelope([ragRoot('X'), ragRoot('X')]), owners2)
    const roots = (out.content ?? []).map((p) => (p as { content: LegacyNodeData[] }).content[0])
    expect(roots).toHaveLength(2)
    for (const r of roots) expect(r.css?.classes ?? []).toContain(SHARED_SUBTREE_CLASS)
  })

  it('§2.4 — decoration is a RENDER-TIME materialization property: the input envelope is not mutated / no RAG flag is stored', async () => {
    const { applySharedSubtreeDecoration } = await mod()
    const env = envelope([ragRoot('X')])
    const pristine = JSON.stringify(env)
    applySharedSubtreeDecoration(env, owners2)
    expect(JSON.stringify(env)).toBe(pristine)
  })
})

// ===========================================================================
// §2.1/C14 + §3.3/§3.9 — simultaneous multi-document render (host)
// ===========================================================================
function docTarget(documentId: string): TabTarget {
  return { kind: 'document', documentId }
}
function entry(id: string, target: TabTarget, title = id): TabEntry {
  return { id, target, title }
}
const STAGE_NOW = new Date().toISOString()
function stageNode(id: string, type: string, content: string) {
  return { id, type, content, ownedNodeIds: [], createdAt: STAGE_NOW, updatedAt: STAGE_NOW }
}
function stageEdge(id: string, source: string, target: string) {
  return { id, kind: 'doc-head', source, target, createdAt: STAGE_NOW, updatedAt: STAGE_NOW, documentIds: [target] }
}

function stageHarness(documents: Array<{ documentId: string; title: string }>) {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const snapshot = {
    store: 'default',
    nodes: documents.map((d) => stageNode(`${d.documentId}-head`, 'h1', d.title)),
    edges: documents.map((d, i) => stageEdge(`e${i}`, `${d.documentId}-head`, d.documentId)),
  }
  const docHeads = {
    documents: documents.map((d) => ({ documentId: d.documentId, title: d.title, path: [], tags: [] })),
  }
  const operatorSettings: Record<string, unknown> = {
    enabledPanes: [],
    enabledOperatorPanes: [],
    panesInitialized: true,
    defaultDocumentId: null,
    topK: 5,
    editingMode: 'contenteditable',
    theme: 'system',
  }
  const bridge = {
    security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: { commit: async () => ({ ok: true, nodeId: 'x' }), onRagStoreChanged: () => () => {} },
    rag: {
      query: async (q: string) => ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }),
      snapshot: async () => snapshot,
      backlinks: async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
      docHeads: async () => docHeads,
      stores: async () => ({ stores: [] }),
    },
    template: {
      get: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      onTemplateChanged: () => () => {},
    },
    operatorSettings: {
      get: async () => operatorSettings,
      set: async (patch: Record<string, unknown>) => {
        Object.assign(operatorSettings, patch)
        return operatorSettings
      },
      onChanged: () => () => {},
    },
  }
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const editController = createEditController({
    backRefs,
    commit: async () => ({ ok: true, nodeId: 'x' }),
    onRebuild: (kind) => void host.reDerive(kind),
  })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({
    mount,
    envelope: {
      template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, mount }
}

/** Resolve the proposed simultaneous-mount seam; absent → labelled RED. */
function requireMountTabs(host: SidebarPanes): (entries: TabEntry[]) => void {
  const fn = (host as unknown as { mountTabs?: (entries: TabEntry[]) => void }).mountTabs
  if (typeof fn !== 'function') {
    throw new Error('SidebarPanes.mountTabs is not implemented (U-SHELL-9b RED — needs the Implementer)')
  }
  return fn.bind(host)
}

describe('U-SHELL-9b — simultaneous multi-document render (spec §2.1/C14, §3.3/§3.9)', () => {
  const DOCS = [
    { documentId: 'doc-a', title: 'Doc A' },
    { documentId: 'doc-b', title: 'Doc B' },
  ]

  it('§3.3 — all open document tabs are mounted together (both render; neither is unmounted)', async () => {
    const h = stageHarness(DOCS)
    await h.host.boot(h.runtime)
    const mountTabs = requireMountTabs(h.host)
    mountTabs([entry('tab-a', docTarget('doc-a'), 'Doc A'), entry('tab-b', docTarget('doc-b'), 'Doc B')])
    const html = (h.mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('Doc A')
    expect(html).toContain('Doc B')
  })

  it('§2.1 — the mounted documents materialize DISTINCT document roots in one graph', async () => {
    const h = stageHarness(DOCS)
    await h.host.boot(h.runtime)
    requireMountTabs(h.host)([entry('tab-a', docTarget('doc-a')), entry('tab-b', docTarget('doc-b'))])
    const ids = h.runtime
      .materializedContentRoots()
      .map((root) => (root.props as { id?: string } | undefined)?.id)
      .filter((id): id is string => typeof id === 'string' && id.startsWith('rag-'))
    expect(ids.length).toBeGreaterThanOrEqual(2)
    expect(new Set(ids).size).toBeGreaterThanOrEqual(2)
  })

  it('§3.3 — a content change keeps all mounted tabs open (editing one does not unmount the other)', async () => {
    const h = stageHarness(DOCS)
    await h.host.boot(h.runtime)
    requireMountTabs(h.host)([entry('tab-a', docTarget('doc-a')), entry('tab-b', docTarget('doc-b'))])
    await h.host.reDerive('content')
    const html = (h.mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('Doc A')
    expect(html).toContain('Doc B')
  })

  it('§3.9 — a RAG content change repopulates the mounted roots in place (loadEnvelope 0×, C10)', async () => {
    const h = stageHarness(DOCS)
    await h.host.boot(h.runtime)
    requireMountTabs(h.host)([entry('tab-a', docTarget('doc-a')), entry('tab-b', docTarget('doc-b'))])
    const spy = vi.spyOn(
      Runtime.prototype as unknown as { loadEnvelope: (...a: unknown[]) => unknown },
      'loadEnvelope',
    )
    try {
      await h.host.reDerive('content')
      expect(spy).not.toHaveBeenCalled()
    } finally {
      spy.mockRestore()
    }
    const html = (h.mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('Doc A')
    expect(html).toContain('Doc B')
  })
})
