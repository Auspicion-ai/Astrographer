// tests/unit-ms3-store-qualified-broadcast.test.ts — Unit U-MS3: the
// store-qualified `rag-store-changed` broadcast + the `rag-snapshot` `store`
// field + the renderer host's `lastStore` capture + foreign-store drop guard
// (docs/specs/unit-ms3-store-qualified-broadcast.md).
//
// RED SET (RCA-1) — written BEFORE the implementer touches `src/`. The
// `RagStoreChangedPayload` currently has NO `store` field (the single shared
// declaration + the collapsed three structural copies do NOT exist yet), so
// this file's red is deliberately THREE-fold:
//
//   (1) TYPE-LEVEL red  — the collapsed shared declaration with the REQUIRED
//       `store: string` does not exist yet. Encoded as the TYPECHECK-LEVEL
//       group (§5.1 collapse, §5.8 fail 1 type half, §5.8 fail 7), which only
//       a `tsc` pass over this file surfaces (the test runner erases type-only
//       imports + annotations). `npm run typecheck` (AGENTS.md item 4's trio
//       leg per §5.3a) is the enforcing leg.
//   (2) BEHAVIORAL red — the seven `handleEditTool` payload-construction points
//       (site 4) do NOT stamp `store` yet, so every post-U-MS3 payload-shape
//       assertion deep-equal FAILS on the missing key.
//   (3) BEHAVIORAL red — the renderer host has no `lastStore` field and no
//       foreign-store drop guard (`onRagStoreChanged` ignores the payload and
//       always `requestRebuild()`s), so every DROP assertion FAILS (the
//       current code rebuilds instead of dropping).
//
// The state-expression map is EXACTLY §5.3a's, per the spec's directive:
//   NODE-TESTED      — the SEVEN handleEditTool construction points (§5.7
//                      happy 5–6, 11–12) + the MCP-path count invariants
//                      (§5.6) + the renderer host capture/guard (§5.7 happy
//                      8–10; §5.8 fails 2–5) — the host module IS imported.
//   TYPECHECK-LEVEL  — the collapse (§5.7 happy 1; §5.8 fail 7) + any
//                      construction point omitting `store` (§5.8 fail 1's
//                      type half) — the REQUIRED field makes the omission a
//                      TS2741. Red surfaced by `tsc`.
//   RELEGATED        — sites 1–3 (the UI commit/batch/rich inline `ipcMain.
//                      handle` broadcast literals; §5.7 happy 2–4) + the
//                      snapshot handler's `store: plan.defaultName` (§5.7
//                      happy 7; §5.5 row 4), per §5.3a: the typed literals
//                      (§5.1 `main.ts:15` pin) make a missing stamp a compile
//                      error, the literals are code-review-verified against
//                      §5.3/§5.2's pinned AFTER shapes, and the live-host
//                      observation is the unit's LIVE-PENDING battery (gate 6
//                      — a file that does NOT exist at spec time). Documented
//                      below, NOT node-tested (no `main.ts` import — house
//                      TestWriter contract).
//
// Conventions follow tests/unit-ms2-store-wiring.test.ts +
// tests/unit-p-ipc-edit-batch.test.ts + tests/sidebar-panes-host.test.ts
// (vitest node environment, `.js` import suffix for the main-process ESM
// modules, mkdtemp temp dirs, the cwd-relative importer fixture, the DOM-shim
// + real-Runtime host harness).
import { describe, it, expect, vi, afterEach } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import type { LegacyInitialData } from 'provident-ssr'
import { createJsonRagStore, type RagStore, type RagNode } from '../src/main/rag-store.js'
import { createRetrieval, createLexicalEmbedder, createLexicalIndex } from '../src/main/retrieval.js'
import { handleEditTool, type RagStoreChangedPayload } from '../src/main/mcp-server.js'
import type { RagStoreDirectory, RagStoreEntry } from '../src/main/rag-store-directory.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type {
  RagSnapshotPayload,
} from '../src/shared/types.js'
// Type-ONLY import from the CANONICAL home. This is an INTENTIONAL type-level
// red: `src/shared/types.ts` does not export `RagStoreChangedPayload` yet
// (the collapse §5.1 is unimplemented). tsc flags "has no exported member";
// the test runner erases it.
import type { RagStoreChangedPayload as SharedRagStoreChangedPayload } from '../src/shared/types.js'

// ---------------------------------------------------------------------------
// Constants + fixtures
// ---------------------------------------------------------------------------
const DEFAULT_NAME = 'main'
const FOREIGN_NAME = 'research-2026-09'

function makeNode(id: string, content: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-09-05T00:00:00.000Z'
  return { id, type: 'p', content, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

/** A snapshot-node fixture (the `RagSnapshotPayload.nodes[number]` shape). */
function makeSnapNode(id: string, overrides: Partial<RagSnapshotPayload['nodes'][number]> = {}): RagSnapshotPayload['nodes'][number] {
  const now = '2026-09-05T00:00:00.000Z'
  return { id, type: 'p', content: `content-${id}`, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function makeSnapEdge(
  id: string,
  kind: string,
  source: string,
  target: string,
  overrides: Partial<RagSnapshotPayload['edges'][number]> = {},
): RagSnapshotPayload['edges'][number] {
  const now = '2026-09-05T00:00:00.000Z'
  return { id, kind, source, target, createdAt: now, updatedAt: now, ...overrides }
}

/** A one-document snapshot whose `store` is the captured boot store. */
function bootSnapshot(store: string): { store: string; nodes: RagSnapshotPayload['nodes']; edges: RagSnapshotPayload['edges'] } {
  return {
    store,
    nodes: [makeSnapNode('head-a', { type: 'h1', content: 'Doc A' })],
    edges: [makeSnapEdge('dh1', 'doc-head', 'head-a', 'doc-a', { documentIds: ['doc-a'] })],
  }
}

/** The minted-identity / ISO-stamp normalizers for non-deterministic ids. */
const MINTED_N = /^n-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
const MINTED_E = /^e-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
function expectMintedN(val: unknown): void {
  expect(typeof val).toBe('string')
  expect(MINTED_N.test(val as string)).toBe(true)
}
function expectMintedE(val: unknown): void {
  expect(typeof val).toBe('string')
  expect(MINTED_E.test(val as string)).toBe(true)
}

// ---------------------------------------------------------------------------
// Temp-dir helpers (the house mkdtemp + try/finally cleanup idiom)
// ---------------------------------------------------------------------------
function withDir<T>(run: (root: string) => Promise<T>): Promise<T> {
  const root = mkdtempSync(join(tmpdir(), 'provident-ms3-'))
  return Promise.resolve()
    .then(() => run(root))
    .finally(() => rmSync(root, { recursive: true, force: true }))
}

/** A transient mkdtemp dir INSIDE process.cwd() — for the importer's pinned
 *  `process.cwd()` default resolve (markdown-import.ts:66). Removed in finally. */
async function withCwdDir(run: (relFile: string, absFile: string) => Promise<void>): Promise<void> {
  const abs = mkdtempSync(join(process.cwd(), 'provident-ms3-cwd-'))
  const rel = relative(process.cwd(), abs)
  try {
    await run(join(rel, 'note.md'), join(abs, 'note.md'))
  } finally {
    rmSync(abs, { recursive: true, force: true })
  }
}

/**
 * Build a `RagStoreDirectory` over real stores (one entry per spec). Every
 * entry gets its own store + lexical engine (U-MS2's wiring shape — the 
 * directory is the single source of truth the handler resolves through).
 * Returns `{ dir, root }`; the caller owns `root`'s cleanup (or uses withDir).
 */
async function makeDirectory(
  root: string,
  specs: Array<{ name: string; default?: boolean; seed?: RagNode[] }>,
): Promise<RagStoreDirectory> {
  const entries = new Map<string, RagStoreEntry>()
  let defaultName = ''
  for (const s of specs) {
    const store = createJsonRagStore({ path: join(root, `persist-${s.name}.json`) })
    for (const n of s.seed ?? []) await store.putNode(n)
    const engine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))
    entries.set(s.name, { name: s.name, store, engine, corrupt: false, missing: false })
    if (s.default) defaultName = s.name
  }
  return { entries, defaultName }
}

/** The default-store directory fixture (zero-config): one `'main'` entry. */
function defaultDir(root: string): Promise<RagStoreDirectory> {
  return makeDirectory(root, [{ name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'seed one alpha')] }])
}

/** A two-store directory (default `'main'` + `research-2026-09`). */
function twoStoreDir(root: string): Promise<RagStoreDirectory> {
  return makeDirectory(root, [
    { name: DEFAULT_NAME, default: true, seed: [makeNode('n1', 'seed one alpha'), makeNode('a', 'node a'), makeNode('b', 'node b')] },
    { name: FOREIGN_NAME, seed: [makeNode('r1', 'research only')] },
  ])
}

/** Call `edit.<name>` through handleEditTool, capturing the (payload, name)
 *  the widened callback receives. Returns the cb + the result. */
async function runEdit(
  store: RagStore,
  name: string,
  args: Record<string, unknown>,
  dir: RagStoreDirectory | null,
): Promise<{ cb: ReturnType<typeof vi.fn>; result: unknown }> {
  const cb = vi.fn()
  const result = await handleEditTool(store, name, args, cb, dir)
  return { cb, result }
}

function payloadOf(cb: ReturnType<typeof vi.fn>): unknown {
  return cb.mock.calls[0]?.[0]
}
function storeNameOf(cb: ReturnType<typeof vi.fn>): unknown {
  return cb.mock.calls[0]?.[1]
}

// ===========================================================================
// TYPECHECK-LEVEL group (§5.3a class 2) — the collapse + REQUIRED store
// ===========================================================================
// The assertions below are the TYPE-LEVEL red: they typecheck ONLY after
// `RagStoreChangedPayload` gains the REQUIRED `store: string` on the ONE shared
// declaration in `src/shared/types.ts` (§5.1) and the three structural copies
// are gone (§5.8 fail 7). `npm run typecheck` is the enforcing leg (§5.3a).
// The behavioral red for an OMITTED store (§5.8 fail 1 type half) is the same
// REQUIRED-field: the typed construction-point literals cannot omit it
// (TS2741). Each `it` runs a no-op runtime guard so the block also runs under
// vitest (it passes runtime; the point is the tsc leg).
describe('TYPECHECK-LEVEL red — the collapsed shared declaration requires store (§5.1, §5.7 happy 1, §5.8 fail 1/7)', () => {
  // Intentional type-level delta 1 (red until §5.1 lands):
  // the shared declaration declares REQUIRED `store: string`.
  const _readSharedStore = (_p: SharedRagStoreChangedPayload): string => _p.store

  // Intentional type-level delta 2 (red until §5.3 lands):
  // the emission-site payload literal is TYPED RagStoreChangedPayload and
  // therefore must carry the REQUIRED store (a missing stamp is a compile
  // error — the R5 drift guard made structural). Here we prove the POSITIVE
  // (the field is present + string); the omission half is that same
  // required-field error on the typed literals.
  const _stamped: RagStoreChangedPayload = { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME }
  const _readMcpStore = (_p: RagStoreChangedPayload): string => _p.store

  it('00. the shared declaration + the emission types carry REQUIRED store (tsc leg — red until the field lands; runtime no-op)', () => {
    expect(typeof _readSharedStore).toBe('function')
    expect(typeof _readMcpStore).toBe('function')
    expect(_stamped.kind).toBe('content')
  })
})

// ===========================================================================
// §5.3 / §5.7 happy 5 + 6 — the SEVEN handleEditTool construction points
// (NODE-TESTED per §5.3a class 1)
// ===========================================================================
describe('site 4 — the seven handleEditTool construction points stamp store (§5.3, §5.7 happy 5)', () => {
  // Data states enumerated (§5.3 table — one construction point per edit.*
  // tool, mutually exclusive per call):
  //   S1  default directory (one `main` entry) + omitted store selector
  //       ⇒ payload.store 'main' + widened callback second arg 'main'
  //   S2  non-default directory + addressed store selector ⇒ THAT store's name
  //   S3  the legacy directory-less sentinel (dir null) ⇒ store '' (NOT tested
  //       as happy — it is the §5.3 S3 fail-adjacent note only)

  const now = '2026-09-05T00:00:00.000Z'

  it('01. edit.set_content (content) — EXACTLY 1 broadcast { kind:"content", nodeIds:["n1"], edgeIds:[], store:"main" }, callback second arg "main"', async () => {
    await withDir(async (root) => {
      const dir = await defaultDir(root)
      const { cb, result } = await runEdit(dir.entries.get(DEFAULT_NAME)!.store, 'edit.set_content', { nodeId: 'n1', content: 'updated' }, dir)
      expect(result).toMatchObject({ ok: true })
      expect(cb).toHaveBeenCalledTimes(1)
      expect(payloadOf(cb)).toEqual({ kind: 'content', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME })
      expect(storeNameOf(cb)).toBe(DEFAULT_NAME)
    })
  })

  it('02. edit.create_node (structural) — EXACTLY 1 broadcast { kind:"structural", nodeIds:[<minted>], edgeIds:[], store:"main" }', async () => {
    await withDir(async (root) => {
      const dir = await defaultDir(root)
      const { cb, result } = await runEdit(dir.entries.get(DEFAULT_NAME)!.store, 'edit.create_node', { type: 'p', content: 'new node' }, dir)
      expect(result).toMatchObject({ ok: true })
      expect(cb).toHaveBeenCalledTimes(1)
      const p = payloadOf(cb) as { kind: string; nodeIds: unknown[]; edgeIds: unknown[]; store: string }
      expect(p.kind).toBe('structural')
      expect(p.nodeIds).toHaveLength(1)
      expectMintedN(p.nodeIds[0])
      expect(p.edgeIds).toEqual([])
      expect(p.store).toBe(DEFAULT_NAME)
      expect(storeNameOf(cb)).toBe(DEFAULT_NAME)
    })
  })

  it('03. edit.delete_node (structural) — EXACTLY 1 broadcast { kind:"structural", nodeIds:["n1"], edgeIds:[], store:"main" }', async () => {
    await withDir(async (root) => {
      const dir = await defaultDir(root)
      const { cb, result } = await runEdit(dir.entries.get(DEFAULT_NAME)!.store, 'edit.delete_node', { nodeId: 'n1' }, dir)
      expect(result).toMatchObject({ ok: true })
      expect(cb).toHaveBeenCalledTimes(1)
      expect(payloadOf(cb)).toEqual({ kind: 'structural', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME })
      expect(storeNameOf(cb)).toBe(DEFAULT_NAME)
    })
  })

  it('04. edit.split_node (structural + edgeIds) — EXACTLY 1 broadcast { kind:"structural", nodeIds:[n0,n1], edgeIds:[<minted e>], store:"main" }', async () => {
    await withDir(async (root) => {
      const dir = await makeDirectory(root, [{ name: DEFAULT_NAME, default: true, seed: [makeNode('para', 'abcdef', { type: 'p' })] }])
      const { cb, result } = await runEdit(dir.entries.get(DEFAULT_NAME)!.store, 'edit.split_node', { nodeId: 'para', at: 2 }, dir)
      expect(result).toMatchObject({ ok: true })
      expect(cb).toHaveBeenCalledTimes(1)
      const p = payloadOf(cb) as { kind: string; nodeIds: unknown[]; edgeIds: unknown[]; store: string }
      expect(p.kind).toBe('structural')
      expect(p.nodeIds).toHaveLength(2)
      // (Supervisor arbitration 2026-09-05: splitNode KEEPS the source node's
      // id as nodeIds[0] — the spec §5.3 table pins `split_node ⇒ nodeIds:
      // [n0.id, n1.id]` and the landed op returns [original, fresh]; only
      // nodeIds[1] is freshly minted. The original assertion expected both
      // minted, which would contradict the pinned behavior.)
      expect(p.nodeIds[0]).toBe('para')
      expectMintedN(p.nodeIds[1])
      expect(p.edgeIds).toHaveLength(1)
      expectMintedE(p.edgeIds[0])
      expect(p.store).toBe(DEFAULT_NAME)
      expect(storeNameOf(cb)).toBe(DEFAULT_NAME)
    })
  })

  it('05. edit.merge_node (structural) — EXACTLY 1 broadcast { kind:"structural", nodeIds:["a","b"], edgeIds:[], store:"main" }', async () => {
    await withDir(async (root) => {
      const dir = await twoStoreDir(root)
      const { cb, result } = await runEdit(dir.entries.get(DEFAULT_NAME)!.store, 'edit.merge_node', { sourceId: 'a', targetId: 'b' }, dir)
      expect(result).toMatchObject({ ok: true })
      expect(cb).toHaveBeenCalledTimes(1)
      expect(payloadOf(cb)).toEqual({ kind: 'structural', nodeIds: ['a', 'b'], edgeIds: [], store: DEFAULT_NAME })
      expect(storeNameOf(cb)).toBe(DEFAULT_NAME)
    })
  })

  it('06. edit.set_edge (structural + edgeIds) — EXACTLY 1 broadcast { kind:"structural", nodeIds:["a","b"], edgeIds:[<minted e>], store:"main" }', async () => {
    await withDir(async (root) => {
      const dir = await twoStoreDir(root)
      const { cb, result } = await runEdit(dir.entries.get(DEFAULT_NAME)!.store, 'edit.set_edge', { kind: 'doc-child', source: 'a', target: 'b' }, dir)
      expect(result).toMatchObject({ ok: true })
      expect(cb).toHaveBeenCalledTimes(1)
      const p = payloadOf(cb) as { kind: string; nodeIds: unknown[]; edgeIds: unknown[]; store: string }
      expect(p.kind).toBe('structural')
      expect(p.nodeIds).toEqual(['a', 'b'])
      expect(p.edgeIds).toHaveLength(1)
      expectMintedE(p.edgeIds[0])
      expect(p.store).toBe(DEFAULT_NAME)
      expect(storeNameOf(cb)).toBe(DEFAULT_NAME)
    })
  })

  it('07. edit.import_markdown (structural, nodeIds:documentIds) — EXACTLY 1 broadcast { kind:"structural", nodeIds:["note"], edgeIds:[], store:"main" }', async () => {
    await withCwdDir(async (relFile, absFile) => {
      await withDir(async (root) => {
        writeFileSync(absFile, '# Note\n\nBody note.\n')
        const dir = await defaultDir(root)
        const { cb, result } = await runEdit(dir.entries.get(DEFAULT_NAME)!.store, 'edit.import_markdown', { files: [relFile] }, dir)
        expect(result).toMatchObject({ ok: true })
        expect(cb).toHaveBeenCalledTimes(1)
        const p = payloadOf(cb) as { kind: string; nodeIds: unknown[]; edgeIds: unknown[]; store: string }
        expect(p.kind).toBe('structural')
        // U-D3 sanctioned re-pin: a nested cwd file is path-qualified.
        expect(p.nodeIds).toEqual([relFile.replace(/\.md$/, '').split(/[\\/]/).join('/')])
        expect(p.edgeIds).toEqual([])
        expect(p.store).toBe(DEFAULT_NAME)
        expect(storeNameOf(cb)).toBe(DEFAULT_NAME)
      })
    })
  })
})

describe('site 4 — NON-default store carries THAT store name (§5.3 S2, §5.7 happy 6)', () => {
  // Data states enumerated (§5.7 happy 6): a addressed non-default store's edit
  // carries THAT store's name, not the default's. At minimum set_content +
  // create_node (the spec's floor); both asserted here + the callback's second
  // arg echoes the resolved name.
  it('08. edit.set_content on research-2026-09 ⇒ payload.store "research-2026-09", storeName "research-2026-09"', async () => {
    await withDir(async (root) => {
      const dir = await twoStoreDir(root)
      const research = dir.entries.get(FOREIGN_NAME)!
      const { cb, result } = await runEdit(research.store, 'edit.set_content', { nodeId: 'r1', content: 'updated', store: FOREIGN_NAME }, dir)
      expect(result).toMatchObject({ ok: true })
      expect(cb).toHaveBeenCalledTimes(1)
      expect(payloadOf(cb)).toEqual({ kind: 'content', nodeIds: ['r1'], edgeIds: [], store: FOREIGN_NAME })
      expect(storeNameOf(cb)).toBe(FOREIGN_NAME)
    })
  })

  it('09. edit.create_node on research-2026-09 ⇒ payload.store "research-2026-09"', async () => {
    await withDir(async (root) => {
      const dir = await twoStoreDir(root)
      const research = dir.entries.get(FOREIGN_NAME)!
      const { cb, result } = await runEdit(research.store, 'edit.create_node', { type: 'p', content: 'x', store: FOREIGN_NAME }, dir)
      expect(result).toMatchObject({ ok: true })
      expect(cb).toHaveBeenCalledTimes(1)
      const p = payloadOf(cb) as { kind: string; store: string }
      expect(p.kind).toBe('structural')
      expect(p.store).toBe(FOREIGN_NAME)
      expect(storeNameOf(cb)).toBe(FOREIGN_NAME)
    })
  })
})

// ===========================================================================
// §5.6 broadcast-count invariants (NODE-TESTED per §5.3a class 1)
// ===========================================================================
describe('§5.6 the MCP-path count invariants (qualified payload, ADDITIVE — never a second broadcast)', () => {
  // Data states enumerated (§5.6):
  //   a successful tool call ⇒ EXACTLY 1 qualified payload (the seven points
  //     are mutually exclusive — already pinned per-tool above).
  //   a failed mutation ⇒ 0 broadcasts (the H5 fail-state; the store field is
  //     irrelevant to the count).
  //   a FOREIGN-store MCP edit still broadcasts EXACTLY ONCE — main does NOT
  //     suppress/filter foreign broadcasts (the drop is renderer-side).
  it('10. a failed mutation broadcasts ZERO times (edit.delete_node on a missing node ⇒ removed:false ⇒ no emit)', async () => {
    await withDir(async (root) => {
      const dir = await defaultDir(root)
      const { cb, result } = await runEdit(dir.entries.get(DEFAULT_NAME)!.store, 'edit.delete_node', { nodeId: 'ghost' }, dir)
      // delete_node broadcasts ONLY on ok && removed; a missing node is not removed.
      expect(result).toMatchObject({ ok: true })
      expect(cb).not.toHaveBeenCalled()
    })
  })

  it('11. a FOREIGN-store MCP edit still broadcasts EXACTLY ONCE (qualified with the foreign name) — main never filters foreign broadcasts', async () => {
    await withDir(async (root) => {
      const dir = await twoStoreDir(root)
      const research = dir.entries.get(FOREIGN_NAME)!
      const { cb, result } = await runEdit(research.store, 'edit.set_content', { nodeId: 'r1', content: 'x', store: FOREIGN_NAME }, dir)
      expect(result).toMatchObject({ ok: true })
      expect(cb).toHaveBeenCalledTimes(1)
      expect(payloadOf(cb)).toEqual({ kind: 'content', nodeIds: ['r1'], edgeIds: [], store: FOREIGN_NAME })
    })
  })
})

// ===========================================================================
// The renderer host: lastStore capture + the foreign-store drop guard
// (NODE-TESTED per §5.3a class 1 — the host module IS test-imported)
// ===========================================================================
// The host harness mirrors tests/sidebar-panes-host.test.ts: a REAL SidebarPanes
// + a real app Runtime (DOM-shimmed) + a mock bridge. The snapshot fixtures
// carry `store` so the NEW capture can be observed; boot/reDerive use the real
// coalescing state. requestRebuild is spied (non-through) where a test only
// needs the "did the guard call requestRebuild" decision and must not run the
// heavy reDerive.

function placeholderEnvelope(): LegacyInitialData {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'wiki-root' },
        children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

interface HostHarness {
  host: SidebarPanes
  runtime: Runtime
  bridge: {
    rag: {
      snapshot: ReturnType<typeof vi.fn>
      docHeads: ReturnType<typeof vi.fn>
      backlinks: ReturnType<typeof vi.fn>
      query: ReturnType<typeof vi.fn>
    }
    edit: { onRagStoreChanged: ReturnType<typeof vi.fn> }
    template: { get: ReturnType<typeof vi.fn>; onTemplateChanged: ReturnType<typeof vi.fn> }
    security: { get: ReturnType<typeof vi.fn> }
    operatorSettings: { get: ReturnType<typeof vi.fn>; onChanged: ReturnType<typeof vi.fn> }
  }
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
}

/** Build a host + real Runtime + mock bridge. `snapshot.store` is the boot
 *  capture; the bridge defaults to a valid one-document snapshot whose store
 *  is the DEFAULT store. */
function makeHostHarness(snapshotStore: string): HostHarness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const snapshot = () => bootSnapshot(snapshotStore)
  const bridge = {
    security: { get: vi.fn(async () => ({ token: null, enabled: ['read', 'dispatch'] })) },
    edit: {
      commit: vi.fn(async () => ({ ok: true })),
      commitRich: vi.fn(async () => ({ ok: true })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async () => ({ query: 'q', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 })),
      snapshot: vi.fn(async () => snapshot()),
      backlinks: vi.fn(async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      docHeads: vi.fn(async () => ({ documents: [] })),
    },
    template: {
      get: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      validate: vi.fn(async () => ({ ok: true })),
      set: vi.fn(async () => ({})),
      create: vi.fn(async () => ({})),
      delete: vi.fn(async () => ({})),
      reset: vi.fn(async () => ({ source: 'default', template: undefined })),
      onTemplateChanged: vi.fn(() => () => {}),
    },
    operatorSettings: {
      get: vi.fn(async () => ({ enabledPanes: [], defaultDocumentId: null, topK: 5 })),
      set: vi.fn(async () => ({})),
      onChanged: vi.fn(() => () => {}),
    },
  }
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const onRebuild = vi.fn(() => host.reDerive())
  const editCommit: EditController['commit'] = async () => ({ ok: true as const, nodeId: 'x' })
  const editController = createEditController({ backRefs, commit: editCommit, onRebuild })
  host = new SidebarPanes({
    mount,
    operatorMount,
    registry,
    bridge: bridge as never,
    backRefs,
    editController,
  })
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, bridge, editController, onRebuild }
}

/** Deliver a (possibly foreign / malformed) broadcast to the host's guard. The
 *  payload is declared via a loose, non-fresh type so the call stays type-clean
 *  against the CURRENT store-less `RagStoreChangedPayload` too (structural
 *  assignability) — the `store` field is the unit's own fixture seam. */
function deliver(h: HostHarness, p: { kind: 'content' | 'structural'; nodeIds: string[]; edgeIds: string[]; store?: string | number | null }): void {
  h.host.onRagStoreChanged(p as never)
}

/** Await every onRebuild-triggered reDerive that has begun, so the real
 *  coalescing loop (incl. a queued re-derive) settles. */
async function flushRebuilds(h: HostHarness): Promise<void> {
  for (const r of h.onRebuild.mock.results) {
    if (r && typeof (r.value as { then?: unknown })?.then === 'function') await r.value
  }
  await new Promise((resolve) => setTimeout(resolve, 0))
}

function silenceConsole(h: HostHarness): void {
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'info').mockImplementation(() => {})
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('host — the boot capture + the R3 ordering (§5.4, §5.7 happy 8; W1/W4 pins)', () => {
  it('12. boot on a store:"main" snapshot ⇒ capture-before-subscribe (snapshot resolved before onRagStoreChanged subscribed) AND a "main" broadcast requestRebuilds', async () => {
    const h = makeHostHarness(DEFAULT_NAME)
    await h.host.boot(h.runtime)
    // R3 rule 1 + W1/W4 — the capture rides the T2 commit point, BEFORE the
    // subscription at T5: the snapshot fetch resolved before onRagStoreChanged
    // was subscribed (the bridge call order).
    const snapOrder = h.bridge.rag.snapshot.mock.invocationCallOrder[0]
    const subOrder = h.bridge.edit.onRagStoreChanged.mock.invocationCallOrder[0]
    expect(snapOrder).toBeLessThan(subOrder)
    // The captured boot store ('main') makes a 'main' broadcast pass the guard
    // (requestRebuild fires exactly once — today's byte-equal behavior, §5.5
    // row 5). Spied non-through: only the decision is pinned here.
    silenceConsole(h)
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME })
    expect(spy).toHaveBeenCalledTimes(1)
  })
})

describe('host — the guard decision (§5.4, §5.7 happy 10/11, §5.8 fails 2–3)', () => {
  it('13. GUARD PASS (happy 10, §5.5 row 5 — green-on-arrival) — a post-boot broadcast with store:"main" requestRebuilds exactly as today', async () => {
    const h = makeHostHarness(DEFAULT_NAME)
    await h.host.boot(h.runtime)
    silenceConsole(h)
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('14. GUARD DROP (happy 11 — RED) — a post-boot broadcast with store:"research-2026-09" ⇒ NO requestRebuild (the graph, the coalescing state, the caches untouched)', async () => {
    const h = makeHostHarness(DEFAULT_NAME)
    await h.host.boot(h.runtime)
    silenceConsole(h)
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: FOREIGN_NAME })
    expect(spy).not.toHaveBeenCalled()
  })

  it('15. MALFORMED payload (fail 2 — RED) — store missing/undefined/null/non-string delivered to a booted host ⇒ DROPPED, no requestRebuild, no throw', async () => {
    const h = makeHostHarness(DEFAULT_NAME)
    await h.host.boot(h.runtime)
    silenceConsole(h)
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    const malformed: Array<{ store?: string | number | null }> = [
      {} as { store?: string | number | null }, // store missing
      { store: undefined },
      { store: null },
      { store: 123 },
    ]
    for (const m of malformed) {
      expect(() => deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], ...m })).not.toThrow()
    }
    expect(spy).not.toHaveBeenCalled()
  })

  it('16. lastStore === null (fail 3, R3 rule 2 — RED) — onRagStoreChanged invoked before/without boot ⇒ DROPPED regardless of the payload store', async () => {
    const h = makeHostHarness(DEFAULT_NAME) // built, NOT booted ⇒ lastStore null
    silenceConsole(h)
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME })
    deliver(h, { kind: 'structural', nodeIds: ['n1'], edgeIds: [], store: FOREIGN_NAME })
    expect(spy).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// R-series — F-MS3-1 the fail-closed drop warn diagnostic (RED — RED-FIRST)
// ===========================================================================
// The adversarial finding F-MS3-1 (docs/specs/unit-ms3-store-qualified-broadcast.md
// §3a): the guard's bare `return` silently drops a broadcast whose `store` is
// missing/undefined/non-string even when it was addressed at the rendered store
// — an untyped producer would silently starve the re-derive with no diagnostic.
// Ruled FIXED-WITH-REGRESSION (NO behavior change to the drop outcome): the
// guard DISTINGUISHES the branches — (a) a malformed store (missing/undefined/
// non-string) OR `lastStore === null` emits ONE pinned `console.warn` (the
// malformed case and the null-lastStore defense case carry DISTINCT messages);
// (b) a FOREIGN-store drop (a valid string `store` !== `lastStore`) stays
// SILENT (routine, by design). Each of the three rows below is RED against the
// pre-fix guard (which never warns): the warn assertions fail until the fix.
describe('R-series — F-MS3-1 the fail-closed drop warn diagnostic', () => {
  // The two DISTINCT pinned warn messages (F-MS3-1).
  const MALFORMED_WARN = (raw: unknown) =>
    `[sidebar] rag-store-changed dropped: malformed store (payload had '${raw}')`
  const DEFENSE_WARN =
    '[sidebar] rag-store-changed dropped: no captured boot store (lastStore null)'

  it('R1. a malformed store addressed at the rendered store still DROPS (no rebuild) AND logs the pinned malformed warn on EVERY malformed shape (missing/undefined/null/empty/non-string)', async () => {
    const h = makeHostHarness(DEFAULT_NAME) // booted ⇒ lastStore 'main'
    await h.host.boot(h.runtime)
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const malformed: Array<{ store?: string | number | null }> = [
      {},                     // store missing
      { store: undefined },
      { store: null },
      { store: '' },          // empty-string sentinel (F-MS3-2 legacy shape)
      { store: 123 },         // non-string
    ]
    for (const m of malformed) {
      warn.mockClear()
      expect(() => deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], ...m })).not.toThrow()
      expect(spy).not.toHaveBeenCalled() // still DROPPED — the outcome unchanged
      expect(warn).toHaveBeenCalledTimes(1) // ONE warn, not one per malformed field
      expect(warn).toHaveBeenCalledWith(MALFORMED_WARN(m.store))
    }
  })

  it('R2. a FOREIGN-store drop (valid string store !== lastStore) stays SILENT — no warn, no rebuild', async () => {
    const h = makeHostHarness(DEFAULT_NAME) // booted ⇒ lastStore 'main'
    await h.host.boot(h.runtime)
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: FOREIGN_NAME })
    expect(spy).not.toHaveBeenCalled()
    expect(warn).not.toHaveBeenCalled() // routine by design — must NOT warn
  })

  it('R3. lastStore === null (host built but NOT booted) DROPS AND logs the DISTINCT defense warn', async () => {
    const h = makeHostHarness(DEFAULT_NAME) // built, NOT booted ⇒ lastStore null
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME })
    expect(spy).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn).toHaveBeenCalledWith(DEFENSE_WARN)
  })
})

describe('host — the re-derive capture + the W3 in-flight window (§5.4, §5.7 happy 9, §5.8 fail 4)', () => {
  it('17. re-derive capture (happy 9 — the re-capture + low-5 three-way commit): after a default-store re-derive the guard still passes "main" and drops a foreign broadcast', async () => {
    const h = makeHostHarness(DEFAULT_NAME)
    await h.host.boot(h.runtime)
    silenceConsole(h)
    // Trigger a real default-store re-derive (the host re-captures lastStore
    // from the re-derived snapshot at the reDerive commit point).
    h.bridge.rag.snapshot.mockClear()
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME })
    await flushRebuilds(h)
    // A fresh re-derive ran (snapshot re-fetched) — the LOW-5 commit executed.
    expect(h.bridge.rag.snapshot).toHaveBeenCalled()
    // post-re-derive: lastStore re-captured 'main' ⇒ 'main' still passes, and
    // a foreign broadcast is STILL dropped (RED — the current guard has no drop).
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME })
    expect(spy).toHaveBeenCalledTimes(1)
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: FOREIGN_NAME })
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('18. W3 in-flight (fail 4 — RED) — a foreign-store broadcast during an in-flight re-derive sets NO reDeriveQueued: exactly ONE snapshot re-fetch (the in-flight only), no queued foreign re-derive fires', async () => {
    const h = makeHostHarness(DEFAULT_NAME)
    await h.host.boot(h.runtime)
    silenceConsole(h)
    h.bridge.rag.snapshot.mockClear()
    // Start an in-flight default-store re-derive (requestRebuild → reDerive →
    // reDeriveInFlight set synchronously before its first await).
    deliver(h, { kind: 'content', nodeIds: ['n1'], edgeIds: [], store: DEFAULT_NAME })
    // Deliver a foreign broadcast WHILE the default re-derive is in flight.
    deliver(h, { kind: 'content', nodeIds: ['r1'], edgeIds: [], store: FOREIGN_NAME })
    await flushRebuilds(h)
    // Post-green the foreign is dropped ⇒ only the ONE in-flight snapshot fetch.
    // Today the foreign queues a second re-derive ⇒ TWO snapshot fetches. The
    // in-flight default completes either way; no queued foreign re-derive may
    // fire afterward.
    expect(h.bridge.rag.snapshot).toHaveBeenCalledTimes(1)
  })
})

// ===========================================================================
// §5.7 happy 12 — the MCP foreign-store edit end-to-end (handler-level) + the
// host drop — the B5 closure
// ===========================================================================
describe('§5.7 happy 12 — the B5 closure end-to-end (handler-level)', () => {
  // Data states enumerated (§5.7 happy 12): a non-default store's successful
  // MCP edit yields EXACTLY 1 store-qualified broadcast, AND a host booted on
  // the default ('main') DROPS that foreign broadcast (0 rebuilds) — the
  // foreign-store ingest no longer re-derives the unchanged default graph.
  it('19. a research-store edit broadcasts exactly once (store:"research-2026-09") and a host booted on "main" drops it (0 rebuilds)', async () => {
    const researchPayloadPromise = withDir(async (root) => {
      const dir = await twoStoreDir(root)
      const research = dir.entries.get(FOREIGN_NAME)!
      const { cb, result } = await runEdit(research.store, 'edit.set_content', { nodeId: 'r1', content: 'x', store: FOREIGN_NAME }, dir)
      expect(result).toMatchObject({ ok: true })
      // EXACTLY ONCE, qualified with the foreign name (main never filters).
      expect(cb).toHaveBeenCalledTimes(1)
      return payloadOf(cb) as { kind: 'content'; nodeIds: string[]; edgeIds: string[]; store: string }
    })
    const foreign = await researchPayloadPromise
    expect(foreign.store).toBe(FOREIGN_NAME)

    const h = makeHostHarness(DEFAULT_NAME)
    await h.host.boot(h.runtime)
    silenceConsole(h)
    const spy = vi.spyOn(h.editController, 'requestRebuild').mockImplementation(() => {})
    // The host booted on 'main' drops the foreign broadcast: 0 rebuilds.
    deliver(h, { kind: foreign.kind, nodeIds: foreign.nodeIds, edgeIds: foreign.edgeIds, store: foreign.store })
    expect(spy).not.toHaveBeenCalled()
  })
})

// ===========================================================================
// RELEGATED (per §5.3a class 3) — documented, NOT node-tested
// ===========================================================================
// Sites 1–3 (the UI commit/batch/rich broadcast literals, §5.7 happy 2–4 +
// §5.5 rows 1–3, the UI-path count invariants of §5.6) + the rag-snapshot
// handler's `store: plan.defaultName` (§5.7 happy 7; §5.5 row 4) live in
// inline `ipcMain.handle` bodies that this repo's tests never import (main.ts
// is never imported). Per §5.3a the relegation is the full triple of:
//   (i)   the typecheck guard — the §5.1 `main.ts:15` pin types the three UI
//         emission-site payload literals as `RagStoreChangedPayload`, so a
//         missing `store` stamp is a TS2741 compile error (cannot silently go
//         missing);
//   (ii)  code-review verification of the three literals + the snapshot
//         handler against §5.3/§5.2's pinned AFTER shapes;
//   (iii) the unit's LIVE-PENDING battery (gate 6 —
//         `docs/specs/unit-ms3-store-qualified-broadcast-live-pending-battery.md`,
//         a file that does NOT exist at spec time) pinning the live-host
//         observation: a UI commit broadcasts `{ …, store: 'main' }` and the
//         rag-snapshot reply carries `store: 'main'`.
// The §5.5 row 2 channel (`IPC_RAG_STORE_CHANGED`) + row 6/7/8 (results,
// IPC/tool/gate surface) are covered by the existing suites that MUST stay
// green (§6) — no new channel/tool/gate seam (this unit adds none).
