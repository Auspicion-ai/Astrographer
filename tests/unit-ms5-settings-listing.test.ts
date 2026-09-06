// tests/unit-ms5-settings-listing.test.ts — Unit U-MS5: the read-only
// settings-pane store listing + the `RagQueryPayload.store` passthrough
// (docs/specs/unit-ms5-settings-listing.md).
//
// This is the TestWriter RED set (RCA-1) — written BEFORE any implementation
// exists. The U-MS5 symbols DO NOT exist yet:
//
//   - `src/shared/types.ts` (RED) — `IPC_RAG_STORE_LISTING` / `RagStoreListingPayload` /
//     `RagStoreListingEntry` / `RagStoreLoadStatus` are ABSENT; `RagQueryPayload`
//     has NO `store?: string` field.
//   - `src/main/mcp-server.ts` (RED) — the shared `handleRagStoreListingIpc`
//     handler is ABSENT; `handleRagQueryIpc` does NOT forward `store` into the
//     tool args (its payload type is `{ query?; topK? }`, not `{ query?; topK?;
//     store? }`).
//   - `src/main/preload.ts` (RED, RELEGATED — imports `electron`, not
//     node-importable) — `bridge.rag.stores()` is ABSENT; `rag.query` has no
//     third optional `store?` param. Pinned node-testably via the host boot
//     calling `bridge.rag.stores()` (§5.4 happy 14) + the structural
//     `SidebarBridge` sync (the typecheck leg, §5.3).
//   - `src/main/main.ts` (RED, RELEGATED — never imported by tests) — the
//     `ipcMain.handle(IPC_RAG_STORE_LISTING, …)` registration; pinned only by
//     the build + §5.4's wiring-shape description.
//   - `src/renderer/sidebar-panes.ts` (RED) — NO `lastStoreListing` cache, NO
//     boot fetch of `bridge.rag.stores()`, NO `operator-rag-stores` listing
//     section in `settingsContent()`. The structural `SidebarBridge.rag` is
//     missing `stores()` + the `query(…, store?)` third param (the typecheck
//     leg).
//
// Convention (follows tests/unit-v3-doc-heads-docnav.test.ts + the host tests):
// the missing symbols are imported via NAMESPACE imports (`types.*`, `mcp.*`)
// so the file LOADS even though the named exports do not exist yet — each test
// then fails cleanly on the missing behavior (a direct named import of a
// missing export would break the whole file at link time). `main.ts` is NEVER
// imported (house TestWriter contract; the ipcMain registration is relegated).
// `rag-store-directory.js` (U-MS2, LANDED) is imported as a GREEN fixture seam
// for `storeLoadStatus` (the D7 coordination pin).
//
// The renderer/SidebarPanes host IS node-testable (the sibling host tests do
// it through a mock bridge + a DOM-shimmed Runtime) — per spec §6 the settings
// pane render sections (happy 13/14/15/16 + fails 5–8) live HERE, node-tested.
import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { LegacyInitialData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { buildTraversal } from '../src/main/traversal.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../src/main/template-store.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import type { RagStoreChangedPayload } from '../src/main/preload.js'
import type { SidebarBridge } from '../src/renderer/sidebar-panes.js'
import {
  type RagSnapshotPayload,
  type RagQueryPayload,
  type RagQueryResult,
  type OperatorSettings,
  type OperatorSettingsPatch,
  type SecuritySettings,
  type RagDocHeadsPayload,
} from '../src/shared/types.js'
import { storeLoadStatus, type RagStoreDirectory, type RagStoreEntry } from '../src/main/rag-store-directory.js'
import { groupForTool } from '../src/main/security.js'
import type { RagStore } from '../src/main/rag-store.js'
import type { RetrievalEngine, RetrievalResult } from '../src/main/retrieval.js'

// ---- the U-MS5 symbols (RED — imported via namespace so the file loads) ----
import * as types from '../src/shared/types.js'
import * as mcp from '../src/main/mcp-server.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

// ===========================================================================
// Fixtures (house style — the host harness mirrors unit-v3/host tests)
// ===========================================================================

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

function validSnapshot(): RagSnapshotPayload {
  return {
    store: 'main',
    nodes: [makeNode('head-a', { type: 'h1', content: 'Doc A' })],
    edges: [makeEdge('dh1', 'doc-head', 'head-a', 'doc-a', { documentIds: ['doc-a'] })],
  }
}

function emptySnapshot(): RagSnapshotPayload {
  return { store: 'main', nodes: [], edges: [] }
}

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

// ---- the handler fixtures (§5.2) ------------------------------------------
// The zero-config implicit-`main` entry (BE-1: U-MS1's implicit form, with the
// `persistenceFile` already basename-projected by the §5.4 wiring adapter).
const MAIN_ENTRY = {
  name: 'main',
  default: true,
  persistenceFile: 'provident-rag.json',
  corpusRoot: null,
}
const ALT_ENTRY = {
  name: 'research-2026-09',
  default: false,
  persistenceFile: 'provident-rag-research-2026-09.json',
  corpusRoot: '/abs/corpus-root',
}

/** Assert `run` throws an Error whose message is EXACTLY `exactMessage`. */
function expectThrow(run: () => unknown, exactMessage: string): void {
  let caught: unknown
  try {
    run()
  } catch (err) {
    caught = err
  }
  expect(caught, `expected a throw with message: ${exactMessage}`).toBeInstanceOf(Error)
  expect((caught as Error).message).toBe(exactMessage)
}

// ---- the bridge (adds `rag.stores` — the U-MS5 surface) -------------------
function makeBridge(opts: {
  snapshot?: RagSnapshotPayload
  docHeads?: RagDocHeadsPayload
  storeListing?: unknown
  operatorSettings?: OperatorSettings
  security?: SecuritySettings
} = {}) {
  const state = {
    snapshot: opts.snapshot ?? emptySnapshot(),
    docHeads: opts.docHeads ?? { documents: [] },
    storeListing: opts.storeListing === undefined ? ({ stores: [] } as unknown) : opts.storeListing,
    operatorSettings: opts.operatorSettings ?? { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' },
    security: opts.security ?? { token: null, enabled: ['read', 'dispatch'] },
  }
  const bridge = {
    security: {
      get: vi.fn(async (): Promise<SecuritySettings> => ({ ...state.security })),
    },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async (q: string, topK?: number): Promise<RagQueryResult> =>
        ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: topK ?? 5, store: 'main' }) as RagQueryResult),
      snapshot: vi.fn(async (): Promise<RagSnapshotPayload> => state.snapshot),
      backlinks: vi.fn(async (): Promise<BacklinkResult> =>
        ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }) as BacklinkResult),
      docHeads: vi.fn(async (): Promise<RagDocHeadsPayload> => state.docHeads),
      // U-MS5 — the read-only store listing (the `rag-store-listing` IPC).
      stores: vi.fn(async () => state.storeListing),
    },
    template: {
      get: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      validate: vi.fn(async () => ({ ok: true })),
      set: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      create: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      delete: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      reset: vi.fn(async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })),
      onTemplateChanged: vi.fn(() => () => {}),
    },
    operatorSettings: {
      get: vi.fn(async (): Promise<OperatorSettings> => ({ ...state.operatorSettings })),
      set: vi.fn(async (patch: OperatorSettingsPatch): Promise<OperatorSettings> => {
        state.operatorSettings = { ...state.operatorSettings, ...patch }
        return { ...state.operatorSettings }
      }),
      onChanged: vi.fn(() => () => {}),
    },
  }
  return { bridge, state }
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  operatorMount: unknown
  registry: PaneRegistry
  bridge: ReturnType<typeof makeBridge>['bridge']
  onRebuild: ReturnType<typeof vi.fn>
  sidebar: {
    submitQuery: (value: string) => void
    selectDocument: (id: string) => void
  }
}

function makeHarness(opts: Parameters<typeof makeBridge>[0] = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const { bridge } = makeBridge(opts)
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const onRebuild = vi.fn(() => host.reDerive())
  const editController = createEditController({ backRefs, commit: vi.fn(async () => ({ ok: true, nodeId: 'x' } as const)), onRebuild })
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
  const sidebar = (): Harness['sidebar'] =>
    (globalThis as unknown as { window: { provident: { sidebar: Harness['sidebar'] } } }).window.provident.sidebar
  return {
    host,
    runtime,
    operatorMount,
    registry,
    bridge,
    onRebuild,
    get sidebar() {
      return sidebar()
    },
  }
}

// Await the re-derive that `onRebuild` (the host's `reDerive`) triggered.
async function awaitRebuild(h: Harness): Promise<void> {
  const calls = h.onRebuild.mock.calls.length
  if (calls === 0) return
  const result = h.onRebuild.mock.results[calls - 1]
  if (result && typeof result.value?.then === 'function') await result.value
}

/** The zero-config BE-1 listing (the settings-pane payload the host receives
 *  for the implicit `main` entry with the legacy file PRESENT). */
const ZERO_CONFIG_ONE_MAIN = {
  stores: [{ name: 'main', default: true, persistenceFile: 'provident-rag.json', corpusRoot: null, status: 'loaded' }],
}

// ===========================================================================
// §5.1 — the shared types + the `IPC_RAG_STORE_LISTING` constant + the
// additive `RagQueryPayload.store?` field (RED — absent today)
// ===========================================================================
describe('§5.1 — IPC_RAG_STORE_LISTING + the store-listing types (types.ts, RED)', () => {
  it('RED 1 — IPC_RAG_STORE_LISTING === "provident:rag-store-listing" (the channel constant is absent → undefined)', () => {
    expect(types.IPC_RAG_STORE_LISTING).toBe('provident:rag-store-listing')
  })

  it('RED 2 — IPC_RAG_QUERY itself is UNCHANGED (still "provident:rag-query")', () => {
    expect(types.IPC_RAG_QUERY).toBe('provident:rag-query')
  })

  it('typecheck — `RagQueryPayload` gains the OPTIONAL `store?: string` (the excess-property assignment is a tsc red today; the runtime assert is green)', () => {
    // The compile-time leg fails (a `store` field on `RagQueryPayload` does not
    // exist yet); the runtime leg here just witnesses the constant survives.
    const p: RagQueryPayload = { query: 'q', topK: 5, store: 'research-2026-09' }
    expect(p.store).toBe('research-2026-09')
  })

  it('typecheck — `RagQueryPayload` WITHOUT store stays valid ({ query } and { query, topK } — the byte-equal A4 forms)', () => {
    const noStore: RagQueryPayload = { query: 'q', topK: 5 }
    const bare: RagQueryPayload = { query: 'q' }
    expect(noStore.store).toBeUndefined()
    expect(bare.store).toBeUndefined()
  })

  it('typecheck — `RagStoreLoadStatus` is the D7 three-member union: loaded / failed-corrupt / failed-missing (one shared declaration, no structural copies)', () => {
    // Compile-time: each D7 member assignment is valid on the (missing) type.
    const s1: types.RagStoreLoadStatus = 'loaded'
    const s2: types.RagStoreLoadStatus = 'failed-corrupt'
    const s3: types.RagStoreLoadStatus = 'failed-missing'
    expect([s1, s2, s3]).toEqual(['loaded', 'failed-corrupt', 'failed-missing'])
  })

  it('typecheck — `RagStoreLoadStatus` COORDINATES with U-MS2\'s `storeLoadStatus` return (the A3 shared-declaration pin — assignable both ways)', () => {
    // U-MS2 (LANDED): `storeLoadStatus({ corrupt, missing })` returns
    // 'loaded' | 'failed-corrupt' | 'failed-missing'. If U-MS5 re-declares a
    // divergent status enum, the assignment below fails typecheck → red.
    const viaMs2: types.RagStoreLoadStatus = storeLoadStatus({ corrupt: false, missing: false })
    const _s: ReturnType<typeof storeLoadStatus> = viaMs2
    expect(viaMs2).toBe('loaded')
  })

  it('typecheck — `RagStoreListingEntry { name; default; persistenceFile; corpusRoot: string|null; status }` + `RagStoreListingPayload { stores }`', () => {
    const entry: types.RagStoreListingEntry = {
      name: 'main',
      default: true,
      persistenceFile: 'provident-rag.json',
      corpusRoot: null,
      status: 'loaded',
    }
    const payload: types.RagStoreListingPayload = { stores: [entry] }
    expect(payload.stores[0].name).toBe('main')
    expect(payload.stores[0].corpusRoot).toBeNull()
  })
})

// ===========================================================================
// §5.2 — the shared main-process handler `handleRagStoreListingIpc`
// (RED — the function does not exist today → `mcp.handleRagStoreListingIpc` is
// not a function → every call throws a TypeError → all these fail)
// ===========================================================================
describe('§5.2 — handleRagStoreListingIpc: happy states (mcp-server.ts, RED)', () => {
  // Data states enumerated (§5.8 happy 1–7):
  //   1 multi-store registry (≥2 entries) → one entry per store, INPUT order, verbatim fields, status from statusOf(name)
  //   2 zero-config implicit `main` (BE-1/BE-1a: loaded when present, failed-missing when absent)
  //   3 the three D7 status members pass through verbatim
  //   4 corpusRoot forms: absolute string verbatim; null/undefined/'' → null
  //   5 empty array → { stores: [] }
  //   6 order preservation — NO sort, NO dedupe (distinct names stay in input order)
  //   7 purity — two invocations with the same inputs → deep-equal payloads
  it('RED 3 (happy 1) — a multi-store registry → one `RagStoreListingEntry` per store in INPUT order, fields verbatim, status from statusOf', () => {
    const entries = [MAIN_ENTRY, ALT_ENTRY]
    const payload = mcp.handleRagStoreListingIpc(entries, (name) =>
      name === 'main' ? 'loaded' : 'failed-corrupt',
    )
    expect(payload).toEqual({
      stores: [
        { ...MAIN_ENTRY, status: 'loaded' },
        { ...ALT_ENTRY, status: 'failed-corrupt' },
      ],
    })
  })

  it('RED 4 (happy 2) — the zero-config implicit `main` → EXACTLY ONE entry (BE-1: legacy file PRESENT ⇒ status "loaded")', () => {
    const payload = mcp.handleRagStoreListingIpc([MAIN_ENTRY], (name) => (name === 'main' ? 'loaded' : 'failed-missing'))
    expect(payload).toEqual({ stores: [{ ...MAIN_ENTRY, status: 'loaded' }] })
  })

  it('RED 5 (happy 2 / BE-1a) — the zero-config implicit `main` with the legacy file ABSENT (the TRUE first run) → the SAME single entry except status "failed-missing" (D7 — NOT an error state, NOT "loaded")', () => {
    const payload = mcp.handleRagStoreListingIpc([MAIN_ENTRY], () => 'failed-missing')
    expect(payload).toEqual({ stores: [{ ...MAIN_ENTRY, status: 'failed-missing' }] })
  })

  it('RED 6 (happy 3) — the status plumbing: each of the THREE D7 members passes through verbatim', () => {
    const statuses: string[] = ['loaded', 'failed-corrupt', 'failed-missing']
    const entries = statuses.map((s, i) => ({ name: `s${i}`, default: false, persistenceFile: `p-${s}.json`, corpusRoot: null }))
    // (sanctioned re-pin) the statusOf resolver must return a D7 union member
    // per store (returning the store NAME would be out-of-union and correctly
    // fail-loud per §5.2 behavior 4 / RED 14). Resolve the name's index.
    const payload = mcp.handleRagStoreListingIpc(entries, (name) => statuses[Number(name.slice(1))] as 'loaded' | 'failed-corrupt' | 'failed-missing')
    expect(payload.stores.map((e) => [e.name, e.status])).toEqual([
      ['s0', 'loaded'],
      ['s1', 'failed-corrupt'],
      ['s2', 'failed-missing'],
    ])
  })

  it('RED 7 (happy 4) — corpusRoot forms: an explicit absolute root verbatim; null/undefined/\'\' → null in the payload', () => {
    const entries = [
      { name: 'a', default: false, persistenceFile: 'pa.json', corpusRoot: '/explicit/root' },
      { name: 'b', default: false, persistenceFile: 'pb.json', corpusRoot: null },
      { name: 'c', default: false, persistenceFile: 'pc.json', corpusRoot: undefined as never },
      { name: 'd', default: false, persistenceFile: 'pd.json', corpusRoot: '' },
    ]
    const payload = mcp.handleRagStoreListingIpc(entries, () => 'loaded')
    expect(payload.stores.map((e) => e.corpusRoot)).toEqual(['/explicit/root', null, null, null])
  })

  it('RED 8 (happy 5) — an empty array → { stores: [] } (no throw)', () => {
    expect(mcp.handleRagStoreListingIpc([], () => 'loaded')).toEqual({ stores: [] })
  })

  it('RED 9 (happy 6) — order preservation: NO sort, NO dedupe (two distinct names stay in INPUT order even if "unsorted")', () => {
    const entries = [
      { name: 'zebra', default: false, persistenceFile: 'pz.json', corpusRoot: null },
      { name: 'alpha', default: false, persistenceFile: 'pa.json', corpusRoot: null },
    ]
    const payload = mcp.handleRagStoreListingIpc(entries, () => 'loaded')
    expect(payload.stores.map((e) => e.name)).toEqual(['zebra', 'alpha'])
  })

  it('RED 10 (happy 7) — purity: two invocations with the same inputs return DEEP-EQUAL payloads (no I/O)', () => {
    const a = mcp.handleRagStoreListingIpc([MAIN_ENTRY, ALT_ENTRY], () => 'loaded')
    const b = mcp.handleRagStoreListingIpc([MAIN_ENTRY, ALT_ENTRY], () => 'loaded')
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  it('RED 11 (coercion, §5.2 behavior) — `default` coerces via `e.default === true`; a non-string persistenceFile → \'\'; a non-string/empty corpusRoot → null; status still from statusOf', () => {
    const entries = [
      { name: 'a', default: 'yes' as never, persistenceFile: 42 as never, corpusRoot: '/' },
      { name: 'b', default: true, persistenceFile: 'pb.json', corpusRoot: {} as never },
    ]
    const payload = mcp.handleRagStoreListingIpc(entries, () => 'loaded')
    expect(payload.stores[0]).toEqual({ name: 'a', default: false, persistenceFile: '', corpusRoot: '/', status: 'loaded' })
    expect(payload.stores[1]).toEqual({ name: 'b', default: true, persistenceFile: 'pb.json', corpusRoot: null, status: 'loaded' })
  })
})

describe('§5.2 — handleRagStoreListingIpc: fail-states (mcp-server.ts, RED)', () => {
  // Fail-states enumerated (§5.9 1–4):
  //   1 null entries → throw 'rag-store-listing: no rag store registry configured'
  //   2 a non-function statusOf → throw 'rag-store-listing: statusOf resolver required'
  //   3 a statusOf return OUTSIDE the three-member union → fail-loud, never a silent coercion
  //   4 a malformed entry (null / non-string or empty name) → SKIPPED (no throw, no phantom entry)
  it('RED 12 (fail 1) — null entries → EXACTLY Error("rag-store-listing: no rag store registry configured")', () => {
    expectThrow(
      () => mcp.handleRagStoreListingIpc(null, () => 'loaded'),
      'rag-store-listing: no rag store registry configured',
    )
  })

  it('RED 13 (fail 2) — a non-function statusOf → EXACTLY Error("rag-store-listing: statusOf resolver required")', () => {
    expectThrow(() => mcp.handleRagStoreListingIpc([MAIN_ENTRY], undefined as never), 'rag-store-listing: statusOf resolver required')
    expectThrow(() => mcp.handleRagStoreListingIpc([MAIN_ENTRY], null as never), 'rag-store-listing: statusOf resolver required')
  })

  it('RED 14 (fail 3) — a statusOf return OUTSIDE the union (e.g. "ok", 42, undefined) → EXACTLY Error(`rag-store-listing: unknown store status "<v>" for store "<name>"`) — fail-loud, NO silent coercion', () => {
    for (const bad of ['ok', 42, undefined, null]) {
      expectThrow(
        () => mcp.handleRagStoreListingIpc([MAIN_ENTRY], () => bad as never),
        `rag-store-listing: unknown store status "${String(bad)}" for store "main"`,
      )
    }
  })

  it('RED 15 (fail 4) — a malformed entry (a null entry; a non-string or empty name) is SKIPPED: no throw, no crash, no phantom entry; the VALID entries still project', () => {
    const malformed = [
      null,
      { name: 5 as never, default: false, persistenceFile: 'x', corpusRoot: null },
      { name: '', default: false, persistenceFile: 'x', corpusRoot: null },
      null,
    ]
    const payload = mcp.handleRagStoreListingIpc([...malformed, MAIN_ENTRY], () => 'loaded')
    expect(payload.stores).toEqual([{ ...MAIN_ENTRY, status: 'loaded' }])
    // the MED-1 discipline — no `operator-rag-store-undefined` id could be produced
    expect(payload.stores.some((e) => e.name === 'undefined')).toBe(false)
  })
})

// ===========================================================================
// §5.3 — the bridge: `stores()` + the `query(…, store?)` third param
// (the preload implementations are RELEGATED — imports `electron`, not
// node-importable; the pinned node-testable seams are the structural
// `SidebarBridge` sync (typecheck) + the host boot fetch in §5.5)
// ===========================================================================
describe('§5.3 — the structural SidebarBridge sync (typecheck leg; the canonical ProvidentBridge + the structural mirror must change in the SAME unit — RCA-6)', () => {
  it('typecheck — SidebarBridge.rag.query admits the optional THIRD `store?` param (a 3-arg call must be type-valid; today it is "Expected 1-2 arguments, but got 3" → tsc red)', () => {
    const b = {
      rag: {
        query: async (): Promise<RagQueryResult> =>
          ({ query: '', ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5, store: 'main' }) as RagQueryResult,
      },
    } as unknown as SidebarBridge
    // compile-time red today: the current signature is query(query, topK?) —
    // a 3-arg call errors. The runtime leg ignores the extra arg and passes.
    const p = b.rag.query('q', 5, 'research')
    expect(typeof p?.then).toBe('function')
  })

  it('typecheck — SidebarBridge.rag gained `stores(): Promise<RagStoreListingPayload>` (the property + the payload type are absent today → tsc red; the runtime leg witnesses the absent constant)', () => {
    // (sanctioned re-pin) provide a `stores` in the runtime fixture so the
    // witness actually observes the declared `() => Promise<RagStoreListingPayload>`
    // shape (an empty `rag` would make `stores` undefined at runtime regardless
    // of the type). The compile-time leg is the real assertion.
    const b = { rag: { stores: vi.fn(async () => ({ stores: [] }) as types.RagStoreListingPayload) } } as unknown as SidebarBridge
    const s: (() => Promise<types.RagStoreListingPayload>) | undefined = b.rag.stores
    expect(typeof s).toBe('function') // runtime-red today: undefined
    expect(typeof types.IPC_RAG_STORE_LISTING).toBe('string') // red: undefined
  })
})

// `bridge.rag.stores()` (preload.ts) itself is not node-testable (imports
// `electron`). The node-testable contract is the host boot CALLING it via
// `this.bridge.rag.stores()` (pinned in §5.5 happy 14 below). The preload
// implementation + the `query(…, store?)` byte-equal conditional-spread is
// verified by code review (the unit-v3 docHeads precedent).
describe.skip('the preload bridge method (verified by code review — not node-testable)', () => {
  it.skip('§5.3 happy 8 — bridge.rag.stores() sends the IPC_RAG_STORE_LISTING IPC (no payload arg) and resolves the RagStoreListingPayload', () => {})
  it.skip('§5.3 happy 9 — bridge.rag.query("q", 5, "X") builds the payload { query, topK, store: "X" } (Byte-equal)', () => {})
  it.skip('§5.3 happy 10 / BE-3 — bridge.rag.query("q", 5) builds { query, topK } with NO store key; query("q") builds { query }', () => {})
})

// ===========================================================================
// §5.6 — the `handleRagQueryIpc` `store: payload?.store` forward (mcp-server.ts)
// ===========================================================================
/** A resolver-only directory whose entries carry marker engines whose query
 *  results are distinguishable by `markdown` — so a forwarded/omitted store is
 *  provable from the RESULT's `store` stamp + `markdown` (U-MS2 F3: the result
 *  `store` is stamped at the ONE `handleRagTool` seam). */
function markerDir(defaultName: string, names: string[]): RagStoreDirectory {
  const entries = new Map<string, RagStoreEntry>()
  for (const name of names) {
    entries.set(name, {
      name,
      store: {} as unknown as RagStore,
      engine: {
        query: async (q: string) =>
          ({ query: q, ranked: [], context: [], markdown: `marker-${name}-${q}`, lineMap: { ranges: [] }, k: 5 }) as RetrievalResult,
        onStoreChanged: async () => {},
        setEmbedder: () => {},
      } as unknown as RetrievalEngine,
      corrupt: false,
      missing: false,
    })
  }
  return { entries, defaultName }
}

// ===========================================================================
// F-MS5-2 (LOW — spec §3a, ruling FIXED-WITH-REGRESSION) — the wiring-level
// defensive guard for the latent `!` deref at main.ts:394. main.ts is RELEGATED
// (never imported by node tests — §5.4; the module top-level runs
// app.whenReady), so the pinned wiring resolver — CURRENTLY
// `(name) => storeLoadStatus(plan.directory.entries.get(name)!)` — is driven
// through the RESOLVER/HANDLER SEAM: a stub directory MISSING the store the
// listing names, wired as `handleRagStoreListingIpc`'s `statusOf`. RED-first:
// the resolver is written first in the PRE-FIX (unguarded `!`) form — a name
// with no directory entry ⇒ `storeLoadStatus(undefined)` ⇒ the UNPINNED
// `TypeError: Cannot read properties of undefined (reading 'missing')`, so
// this block FAILS below on the byte-pinned assertion before the guard lands.
// ===========================================================================
describe('F-MS5-2 — the wiring-level defensive guard (the byte-pinned throw replaces the latent unpinned `!` TypeError)', () => {
  // A STUB directory holding ONLY 'main' — the 'research-2026-09' the listing
  // names has NO entry (the unreachable-today divergence the guard defends).
  const stubDir = new Map<string, RagStoreEntry>([
    ['main', { name: 'main', store: {} as never, engine: {} as never, corrupt: false, missing: false }],
  ])

  it('R — a `listingEntries`-style name with NO matching directory entry ⇒ EXACTLY Error(`rag-store-listing: no directory entry for store "<name>"`) — byte-pinned, NEVER the unpinned TypeError', () => {
    // The resolver main.ts:394 wires. PRE-FIX (this RED run): the unguarded
    // `storeLoadStatus(dir.get(name)!)` — a missing entry detonates the latent
    // deref ⇒ `storeLoadStatus(undefined)` ⇒ the unpinned TypeError. The F-MS5-2
    // guard finalizes it to `const e = dir.get(name); if (!e) throw new
    // Error('rag-store-listing: no directory entry for store "<name>"');
    // return storeLoadStatus(e)`.
    const statusOf = (name: string): types.RagStoreLoadStatus => {
      const e = stubDir.get(name)
      if (!e) throw new Error(`rag-store-listing: no directory entry for store "${name}"`)
      return storeLoadStatus(e)
    }
    expectThrow(
      () => mcp.handleRagStoreListingIpc([ALT_ENTRY], statusOf),
      'rag-store-listing: no directory entry for store "research-2026-09"',
    )
  })

  it('R — the guard leaves the PRESENT store resolving normally through the SAME seam (it never shadows a real directory entry)', () => {
    const statusOf = (name: string): types.RagStoreLoadStatus => {
      const e = stubDir.get(name)
      if (!e) throw new Error(`rag-store-listing: no directory entry for store "${name}"`)
      return storeLoadStatus(e)
    }
    expect(mcp.handleRagStoreListingIpc([MAIN_ENTRY], statusOf)).toEqual({
      stores: [{ ...MAIN_ENTRY, status: 'loaded' }],
    })
  })
})

describe('§5.6 — handleRagQueryIpc forwards `store: payload?.store` (MCP/UI mechanical symmetry; RED — today the payload type is { query?; topK? } and `store` is NOT forwarded)', () => {
  const dir = markerDir('main', ['main', 'research-2026-09'])
  const defaultStore = dir.entries.get('main')!.store
  const defaultEngine = dir.entries.get('main')!.engine

  it('RED 16 (happy 11) — WITH store: handleRagQueryIpc(engine, store, { query, topK, store: "X" }, dir) forwards store and RESOLVES store X on both surfaces (result.store === "X", the addressed entry\'s markdown)', async () => {
    const res = (await mcp.handleRagQueryIpc(defaultEngine, defaultStore, { query: 'q', topK: 5, store: 'research-2026-09' }, dir)) as RagQueryResult
    expect(res.store).toBe('research-2026-09')
    expect(res.markdown).toBe('marker-research-2026-09-q')
  })

  it('GREEN-guard (happy 12 / BE-4) — WITHOUT store: the forwarded tool args carry `store === undefined` ≡ omitted (assert the VALUE, NOT key-absence) ⇒ the default store is resolved (result.store === "main", the default\'s markdown)', async () => {
    const res = (await mcp.handleRagQueryIpc(defaultEngine, defaultStore, { query: 'q', topK: 5 }, dir)) as RagQueryResult
    // U-MS2 S1: omitted ⇒ default — the same on the MCP tool and the IPC (F4).
    expect(res.store).toBe('main')
    expect(res.markdown).toBe('marker-main-q')
  })

  it('RED (A9/F4, §5.6) — an UNKNOWN forwarded store FAILS LOUD on the IPC path too (the M2 resolveStoreArg path — identical to the MCP tool; today `store` is NOT forwarded, so the unknown store is invisible → the rejection never happens → RED)', async () => {
    await expect(
      mcp.handleRagQueryIpc(defaultEngine, defaultStore, { query: 'q', store: 'nope' }, dir),
    ).rejects.toThrow("rag.query: unknown store 'nope'")
  })
})

// ===========================================================================
// §5.5 — the settings-pane store-listing section (sidebar-panes.ts, RED)
// (the host is node-testable; lastStoreListing + the boot fetch + the listing
// section do NOT exist yet → every render assertion here is red)
// ===========================================================================
describe('§5.5 — the boot fetch + the host `lastStoreListing` cache (sidebar-panes.ts, RED)', () => {
  it('RED 17 (happy 14) — boot() calls bridge.rag.stores() and sets lastStoreListing BEFORE mountOperator (the first operator render includes the listing)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), storeListing: ZERO_CONFIG_ONE_MAIN })
    await h.host.boot(h.runtime)
    expect(h.bridge.rag.stores).toHaveBeenCalledTimes(1)
    const html = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('operator-pane-settings')
    expect(html).toContain('operator-rag-stores')
  })

  it('RED 18 (happy 15) — reDerive/refresh do NOT re-fetch the listing (D8 boot-time only): after a rag-store-changed re-derive, the stores() call count STAYS 1', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), storeListing: ZERO_CONFIG_ONE_MAIN })
    await h.host.boot(h.runtime)
    expect(h.bridge.rag.stores).toHaveBeenCalledTimes(1)
    // The host installs the edit.onRagStoreChanged handler at boot; fire it.
    const onRagStoreChanged = (h.bridge.edit.onRagStoreChanged.mock.calls as unknown as unknown[][])[0]?.[0] as unknown
    expect(typeof onRagStoreChanged).toBe('function')
    ;(onRagStoreChanged as (p: RagStoreChangedPayload) => void)({ kind: 'edited', ids: ['n1'] } as unknown as RagStoreChangedPayload)
    await awaitRebuild(h)
    // The re-derive re-renders the CACHED listing — it must NOT re-fetch.
    expect(h.bridge.rag.stores).toHaveBeenCalledTimes(1)
  })

  it('RED 19 (fail 5) — a boot bridge error on the listing fetch is NOT an abort: lastStoreListing stays null, the error is logged, and the boot CONTINUES (app graph boots; the placeholder renders) — the deliberate divergence from the snapshot/docHeads/template abort discipline', async () => {
    const h = makeHarness({ snapshot: validSnapshot() })
    h.bridge.rag.stores.mockRejectedValueOnce(new Error('store-listing boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
      // The app graph still renders the RAG document (boot did NOT abort).
      expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('Doc A')
      // The operator pane still mounts, with the '(stores unavailable)' placeholder.
      const html = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
      expect(html).toContain('operator-pane-settings')
      expect(html).toContain('(stores unavailable)')
    } finally {
      errSpy.mockRestore()
    }
  })
})

describe('§5.5 — the listing node structure (sidebar-panes.ts, RED)', () => {
  // The zero-config A4 row — EXACTLY one entry div (BE-1 content string).
  const BE1_CONTENT =
    'main — default: yes — persistence: provident-rag.json — corpus: (project root) — status: loaded'

  it('RED 20 (happy 16) — the zero-config implicit-`main` payload → EXACTLY ONE `operator-rag-store-main` div with the pinned BE-1 id/data/content', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), storeListing: ZERO_CONFIG_ONE_MAIN })
    await h.host.boot(h.runtime)
    const html = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('operator-rag-stores')
    expect(html).toContain('operator-rag-store-main')
    expect(html).toContain('data-store="main"')
    expect(html).toContain('data-default="true"')
    expect(html).toContain('data-status="loaded"')
    expect(html).toContain(BE1_CONTENT)
  })

  it('RED 21 (happy 13) — a populated listing → the `operator-rag-stores` div is the LAST section child, with the h3 + ONE entry div per store (payload order) carrying the pinned id/data-*/content format', async () => {
    const listing = {
      stores: [
        { name: 'main', default: true, persistenceFile: 'provident-rag.json', corpusRoot: null, status: 'loaded' },
        { name: 'research-2026-09', default: false, persistenceFile: 'provident-rag-research-2026-09.json', corpusRoot: '/abs/corpus', status: 'failed-corrupt' },
      ],
    }
    const h = makeHarness({ snapshot: validSnapshot(), storeListing: listing })
    await h.host.boot(h.runtime)
    const html = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('operator-rag-store-main')
    expect(html).toContain('operator-rag-store-research-2026-09')
    expect(html).toContain('data-store="research-2026-09"')
    expect(html).toContain('data-default="false"')
    expect(html).toContain('data-status="failed-corrupt"')
    expect(html).toContain('main — default: yes — persistence: provident-rag.json — corpus: (project root) — status: loaded')
    expect(html).toContain('research-2026-09 — default: no — persistence: provident-rag-research-2026-09.json — corpus: /abs/corpus — status: failed-corrupt')
    expect(html).toContain('RAG stores')
  })

  it('RED 22 (fail 6) — a null `lastStoreListing` at render → the "(stores unavailable)" p (never a TypeError)', async () => {
    // boot with a null listing (the bridge returns null).
    const h = makeHarness({ snapshot: validSnapshot(), storeListing: null })
    await h.host.boot(h.runtime)
    const html = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('(stores unavailable)')
    expect(html).not.toContain('operator-rag-store-')
  })

  it('RED 23 (fail 7) — an empty `stores: []` payload at render → the "(no stores)" p (never a crash)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), storeListing: { stores: [] } })
    await h.host.boot(h.runtime)
    const html = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('(no stores)')
    expect(html).not.toContain('operator-rag-store-')
  })

  it('RED 24 (fail 8, BE-5 guard) — the PRE-EXISTING settings rows byte-unchanged + the listing section APPENDED below them (no reordering of the pre-existing rows)', async () => {
    const h = makeHarness({ snapshot: validSnapshot(), storeListing: ZERO_CONFIG_ONE_MAIN })
    await h.host.boot(h.runtime)
    const html = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('operator-enabled-panes')
    expect(html).toContain('operator-default-document')
    expect(html).toContain('operator-topk')
    expect(html).toContain('operator-editing-mode')
    expect(html).toContain('operator-editing-mode-toggle')
    // the listing container is appended BELOW (its index in the section >
    // the pre-existing rows).
    const idxStores = html.indexOf('operator-rag-stores')
    const idxToggle = html.indexOf('operator-editing-mode-toggle')
    expect(idxStores).toBeGreaterThan(idxToggle)
  })
})

// ===========================================================================
// §5.9 fail 8 + fail 9 — the negative pins (no switcher; no MCP-visible store
// enumeration) + §5.7/§5.10 census guards (green-on-arrival where the current
// code already holds the negative)
// ===========================================================================
describe('§5.9 fail 8 — NO listing handlers / NO switcher (the operator pane stays read-only)', () => {
  it('GREEN-guard (fail 8) — `submitQuery` is UNCHANGED: its bridge.rag.query call carries EXACTLY TWO args and NEVER a store (RAG-QUERY-STORE-DISPLAY-ASYMMETRY; already true today, must stay true after U-MS5)', async () => {
    // The M13 gate (fail-closed) only lets `submitQuery` through when `rag` is
    // in the enabled security groups — the fixture enables it so the two-arg
    // call shape is actually exercised.
    const h = makeHarness({
      snapshot: validSnapshot(),
      storeListing: ZERO_CONFIG_ONE_MAIN,
      security: { token: null, enabled: ['rag', 'read', 'dispatch'] },
    })
    await h.host.boot(h.runtime)
    h.bridge.rag.query.mockClear()
    h.sidebar.submitQuery('hello world')
    expect(h.bridge.rag.query).toHaveBeenCalledTimes(1)
    const args = h.bridge.rag.query.mock.calls[0]
    expect(args).toHaveLength(2) // (value, topK) — NEVER a store arg
  })

  it('GREEN-guard (fail 8 / §5.10 census) — the handler-def census STAYS 12 (src/renderer/sidebar-panes.ts: no new registerHandlerDef on any listing node)', () => {
    const src = readFileSync(
      fileURLToPath(new URL('../src/renderer/sidebar-panes.ts', import.meta.url)),
      'utf8',
    )
    const count = src.match(/registerHandlerDef\(/g)?.length ?? 0
    expect(count).toBe(12)
  })
})

describe('§5.9 fail 9 + §5.10 census — NO MCP-visible store enumeration (B9/A9; the census is the operator UI ONLY)', () => {
  it('GREEN-guard (fail 9) — the five-seam security gate has NO store-census tool/group entry (the constant absent from the tool→group map; a "rag.list_stores"-style tool is FORBIDDEN)', () => {
    expect(groupForTool('rag.store-listing')).toBe(null)
    expect(groupForTool('rag.stores')).toBe(null)
    expect(groupForTool('rag.list_stores')).toBe(null)
    expect(groupForTool('store.list')).toBe(null)
    // the canonical rag-query group is unchanged (the census stays 12 rag/edit rows).
    expect(groupForTool('rag.query')).toBe('rag')
  })

  it('GREEN-guard (BE-7) — no new RpcMethod/tool name: the IPC channel constant is a STRING (it must be a channel string, not an RpcMethod member); the rag query/snapshot/backlinks/doc-heads channels still resolve as today', () => {
    expect(typeof types.IPC_RAG_STORE_LISTING).toBe('string') // red today: the import is undefined
    expect(types.IPC_RAG_QUERY).toBe('provident:rag-query')
    expect(types.IPC_RAG_DOC_HEADS).toBe('provident:rag-doc-heads')
  })
})

describe('§5.7 BE-6 + the zero-config acceptance rows (binding)', () => {
  it('typecheck/census — the BE rows are pinned by the seams above: BE-1/1a/2 (handler, RED), BE-3 (preload, relegated), BE-4 (handleRagQueryIpc, GREEN-guard), BE-5 (pane, RED), BE-7 (gate, GREEN-guard), BE-8 (broadcast, U-MS3). BE-6 — the handler performs NO disk write (pure)', () => {
    // BE-6 (handler purity — no fs/store/registry I/O): the handler's input is
    // the ALREADY-projected view; it writes nothing. Pinned by purity (RED 10).
    // Type-checks that the zero-config payload shape is `{ stores: [entry] }`.
    const entry: types.RagStoreListingEntry = {
      name: 'main',
      default: true,
      persistenceFile: 'provident-rag.json',
      corpusRoot: null,
      status: 'loaded',
    }
    const payload: types.RagStoreListingPayload = { stores: [entry] }
    expect(payload.stores).toHaveLength(1)
  })

  it('census (§5.10) — the U-MS5 surface census: 1 new channel constant + 1 new bridge method (stores) + 1 new shared handler + 1 changed handler (query forward)', () => {
    expect(typeof types.IPC_RAG_STORE_LISTING).toBe('string') // red: absent
    expect(types.IPC_RAG_DOC_HEADS).toBe('provident:rag-doc-heads') // the cloned pattern is intact
  })
})
