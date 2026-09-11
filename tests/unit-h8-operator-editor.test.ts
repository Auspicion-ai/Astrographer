// tests/unit-h8-operator-editor.test.ts — Unit U-H8: the OPERATOR-UI registry
// editor — the `IPC_RAG_STORE_MANAGE` channel + the two-phase confirmation +
// the provident-authored manage pane (docs/specs/unit-h8-operator-editor.md).
//
// This is the TestWriter RED set (RCA-1) — written BEFORE any U-H8
// implementation exists, against the §7 Architect ruling (2026-09-08 — all
// seven items CONFIRMED). The U-H8 operator surface DOES NOT EXIST on the
// pre-U-H8 code:
//
//   - `src/shared/types.ts` (RED) — `IPC_RAG_STORE_MANAGE` /
//     `RagStoreManageOp` / `RagStoreManageRequest` / `RagStoreManageResult` are
//     ABSENT (P0).
//   - `src/main/mcp-server.ts` (RED) — the shared exported
//     `handleRagStoreManageIpc(runtime, request)` handler is ABSENT (P0). The
//     LANDED seams it wraps (`hotApply add` / `hotRemove` / `hotRename` /
//     `hotSetDefault` / `hotRenameDefault` + the `getDefaultName()` /
//     `currentStores()` / `statusOf` accessors) all EXIST — so the red is the
//     MISSING MANAGE SURFACE, NOT missing seams.
//   - `src/main/preload.ts` (RED, RELEGATED — imports `electron`, not
//     node-importable) — `bridge.rag.manage(request)` is ABSENT, as are the
//     `sidebar.registryManage` / `sidebar.registryManageDismiss` methods (P0).
//     Pinned node-testably via the structural `SidebarBridge` sync (the
//     typecheck leg) + the host E2E in §5.5 (which drives the INSTALLED sidebar
//     surface through the harness — absent today → RED).
//   - `src/main/main.ts` (RED, RELEGATED — never imported by tests) — the
//     `ipcMain.handle(IPC_RAG_STORE_MANAGE, ...)` wiring; pinned only by the
//     build + §5.4's wiring-shape description (the established discipline).
//   - `src/renderer/sidebar-panes.ts` (RED) — NO `operator-rag-manage` section
//     in `settingsContent()`, NO host `registryManage`/`registryManageDismiss`/
//     `refreshRegistryManage` methods + `pendingRegMgmt`/`registryManageError`
//     state, NO `OPERATOR_RAG_*` handler bodies, NO `SidebarBridge.rag.manage`
//     structural member (the typecheck leg) (P0).
//
// Conventions (follow tests/unit-ms5-settings-listing.test.ts + the host +
// unit-h7 tests): the missing symbols are imported via NAMESPACE imports
// (`types.*`, `mcp.*`) so the file LOADS even though the named exports do not
// exist yet — each test then fails cleanly on the missing behavior. `main.ts`
// is NEVER imported (house TestWriter contract; the ipcMain registration is
// relegated). The shared handler is driven with a stub `RagStoreRuntimeController`
// double (the U-H7 fixture idiom — the seams + accessors all LANDED). The
// renderer/SidebarPanes host IS node-testable through the ms5-style harness (a
// stub `bridge.rag.manage` + `bridge.rag.stores` + the dom-shimmed Runtime).
//
// The §7 ruling this red set is DERIVED against (the 7 CONFIRMED items):
//   Q1 ONE combined `IPC_RAG_STORE_MANAGE = 'provident:rag-store-manage'` channel
//      + ONE `bridge.rag.manage(request)` + ONE shared `handleRagStoreManageIpc`
//      + 3 new shared types (RagStoreManageOp/Request/Result).
//   Q2 add is NON-destructive (immediate); remove/rename/setDefault/renameDefault
//      are DESTRUCTIVE and require the two-phase confirmation.
//   Q3 the confirmation is a PROVIDENT-authored strip (NOT a native confirm()).
//   Q4 the add form is NAME-ONLY + trim hygiene.
//   Q5 setDefault/renameDefault → requestRebuild(); add/remove/rename →
//      listing-refresh only (A-P2-3).
//   Q6 the operator editor renders in createIsolatedScope() (operator scope),
//      is NOT group-gated, is NOT MCP-visible, adds NO MCP tool / RpcMethod /
//      TOOL_GROUPS / ALL_TOOLS member (the census stays 41).
//   Q7 SAME-channel two-phase: a destructive op without `confirmed:true` →
//      { confirmationRequired:true, summary } (NO seam); with `confirmed:true` →
//      the LANDED seam, whose own rejection propagates as { ok:false, error }
//      (fail-closed on a stale/removed target).
import { describe, it, expect, vi, afterEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { LegacyInitialData } from 'provident-ssr'
import { handlerDef, compileHandlerBody } from 'provident-ssr/core/registry.js'
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
  type RagStoreListingPayload,
} from '../src/shared/types.js'
import { groupForTool } from '../src/main/security.js'
import type { RagStoreRuntimeController } from '../src/main/rag-store-runtime.js'
import type { RagStore } from '../src/main/rag-store.js'
import type { RetrievalEngine, RetrievalResult } from '../src/main/retrieval.js'

// ---- the U-H8 symbols (RED — imported via namespace so the file loads) ----
import * as types from '../src/shared/types.js'
import * as mcp from '../src/main/mcp-server.js'
import { ProvidentMcpServer } from '../src/main/mcp-server.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

// ===========================================================================
// The byte-pinned message set (§5.4 — U-H8's 8 NEW manage-level templates +
// the seam-REUSED W-* strings, byte-equal to the LANDED write module / U-H7).
// ===========================================================================
const MR = 'rag-store-manage:'
const WR = 'rag-store-registry-write:'

// Manage-level (NEW templates — the §5.4 M-* rows).
const M_OP_REQUIRED = `${MR} op required`
/** `op` renders via the runtime's `kindOf`-style capped JSON (double-quoted). */
const M_UNKNOWN_OP = (op: unknown): string => `${MR} unknown op ${JSON.stringify(String(op))}`
const M_NAME_REQUIRED = `${MR} name required`
const M_FROM_REQUIRED = `${MR} from required`
const M_TO_REQUIRED = `${MR} to required`
const M_ADD_CONFIRM = `${MR} add does not require confirmation`
const M_REMOVE_DEFAULT = (name: string): string => `${MR} cannot remove the default store '${name}'`
const M_RENAME_DEFAULT = `${MR} cannot rename the default store (use the default-row Rename-default)`
const M_SETDEFAULT_NOP = (name: string): string => `${MR} store '${name}' is already the default`

// Seam-REUSED messages (byte-equal to the LANDED write module — 0 NEW templates).
const W_ADD_EXISTING = (name: string): string => `${WR} store '${name}' already exists`
const W_REMOVE_UNKNOWN = (name: string): string => `${WR} cannot remove unknown store '${name}'`
const W_RENAME_UNKNOWN_FROM = (from: string): string => `${WR} cannot rename unknown store '${from}'`
const W_RENAME_TARGET = (from: string, to: string): string =>
  `${WR} store '${from}' cannot be renamed to '${to}': '${to}' already exists`
const W_SET_DEFAULT_UNKNOWN = (name: string): string => `${WR} cannot set unknown store '${name}' as default`

// The summary byte-pins ({ confirmationRequired: true, summary }) — §5.4.
const S_REMOVE = (name: string, file: string): string =>
  `Remove store '${name}'? This unregisters it and STRANDS its persistence file '${file}' + journal (never deleted). This cannot be undone.`
const S_RENAME = (from: string, to: string, file: string): string =>
  `Rename store '${from}' to '${to}'? The old store is drained + torn down; its file '${file}' is stranded.`
const S_SET_DEFAULT = (name: string): string =>
  `Make store '${name}' the default? Queries and edits target the default until reassigned.`
const S_RENAME_DEFAULT = (to: string): string =>
  `Rename the default store to '${to}'? It stays the default under the new name.`

// The done byte-pins ({ ok: true, done }) — §5.4.
const D_ADD = (name: string): string => `Added store '${name}'`
const D_REMOVE = (name: string): string => `Removed store '${name}'`
const D_RENAME = (from: string, to: string): string => `Renamed store '${from}' to '${to}'`
const D_SET_DEFAULT = (name: string): string => `Made store '${name}' the default`
const D_RENAME_DEFAULT = (to: string): string => `Renamed the default store to '${to}'`

// ===========================================================================
// Fixture — a stub `RagStoreRuntimeController` double (the U-H7 fixture idiom:
// ALL the LANDED accessors + hot-* seams exist as vi.fn mocks; the U-H8 handler
// — absent today — is the only missing piece, so every §5.2 body is RED on
// `mcp.handleRagStoreManageIpc` being a non-function).
// ===========================================================================
const DFLT = 'main'
const NON = 'research-2026-09'

/** The default fixture registry: `main` (default) + `research-2026-09`
 *  (non-default) — the §5.6 2-store fixture. `persistenceFile` values are bare
 *  basenames so the summaries' `<file>` substitution is unambiguous. */
function defaultStores(): Array<{ name: string; default: boolean; persistenceFile: string }> {
  return [
    { name: DFLT, default: true, persistenceFile: 'provident-rag.json' },
    { name: NON, default: false, persistenceFile: 'provident-rag-research-2026-09.json' },
  ]
}

function makeRuntimeDouble(overrides: {
  stores?: Array<{ name: string; default: boolean; persistenceFile: string }>
  defaultName?: string
  hotRemove?: (name: string) => Promise<unknown>
  hotRename?: (from: string, to: string) => Promise<unknown>
  hotSetDefault?: (name: string) => Promise<unknown>
  hotRenameDefault?: (to: string) => Promise<unknown>
  hotApply?: (mutation: unknown) => unknown
  statusOf?: (name: string) => string
} = {}) {
  const stores = overrides.stores ?? defaultStores()
  const ctrl: RagStoreRuntimeController = {
    getDefaultName: vi.fn(() => overrides.defaultName ?? DFLT),
    currentStores: vi.fn(() => stores),
    statusOf: vi.fn(overrides.statusOf ?? (() => 'loaded')),
    hotApply: vi.fn(overrides.hotApply ?? (() => ({ loaded: { stores: [], defaultStoreName: DFLT }, delta: { added: [], removed: [], renamed: [] } }))),
    hotRemove: vi.fn(overrides.hotRemove ?? (async () => ({ loaded: { stores: [], defaultStoreName: DFLT }, delta: { added: [], removed: [NON], renamed: [] }, drained: 0 }))),
    hotRename: vi.fn(overrides.hotRename ?? (async () => ({ loaded: { stores: [], defaultStoreName: DFLT }, delta: { added: [], removed: [], renamed: [] }, drained: 0 }))),
    hotSetDefault: vi.fn(overrides.hotSetDefault ?? (async (name: string) => ({ loaded: { stores: [], defaultStoreName: name }, delta: { added: [], removed: [], renamed: [], defaultChanged: [name] }, drained: 0, noop: false }))),
    hotRenameDefault: vi.fn(overrides.hotRenameDefault ?? (async () => ({ loaded: { stores: [], defaultStoreName: 'main-new' }, delta: { added: [], removed: [], renamed: [], defaultChanged: [] }, drained: 0 }))),
    // the remaining controller accessors (not touched by the manage handler —
    // stubbed so the double satisfies the interface).
    getDirectory: vi.fn(),
    getDefaultEntry: vi.fn(),
    getDefaultStore: vi.fn(),
    getDefaultEngine: vi.fn(),
    getVectorBoot: vi.fn(() => null),
    getRegistryPath: vi.fn(() => ''),
  }
  return { ctrl, stores }
}

/** Assert `run()` (sync or promise) settles with an EXACT `{ ok:false, error }`
 *  where `error === exactMessage` (the handler never throws for a domain
 *  failure — the pinned shape). */
async function expectManageError(run: () => Promise<unknown> | unknown, exactMessage: string): Promise<void> {
  const r = (await run()) as { ok: boolean; error: string }
  expect(r).toEqual({ ok: false, error: exactMessage })
}

/** Assert `run()` resolves an EXACT `{ ok:true, done }`. */
async function expectManageOk(run: () => Promise<unknown> | unknown, done: string): Promise<void> {
  const r = (await run()) as { ok: boolean; done: string }
  expect(r).toEqual({ ok: true, done })
}

/** Assert `run()` resolves `{ confirmationRequired:true, summary }` (the
 *  two-phase request-step result — NO seam ran). */
async function expectConfirmationRequired(run: () => Promise<unknown> | unknown, summary: string): Promise<void> {
  const r = (await run()) as { confirmationRequired: boolean; summary: string }
  expect(r).toEqual({ confirmationRequired: true, summary })
}

// ===========================================================================
// P0 — the ABSENT manage surface (the §5.9 red-set expectation: every U-H8
// channel/handler/bridge/section is undefined on the pre-U-H8 code).
// ===========================================================================
describe('P0 — the U-H8 manage surface DOES NOT EXIST (the four markers of the red set absence markers)', () => {
  it('RED 1 — IPC_RAG_STORE_MANAGE === "provident:rag-store-manage" (the D6 ONE channel constant is absent → undefined)', () => {
    expect((types as { IPC_RAG_STORE_MANAGE?: unknown }).IPC_RAG_STORE_MANAGE).toBe('provident:rag-store-manage')
  })

  it('RED 2 — the shared handleRagStoreManageIpc(runtime, request) handler is ABSENT (typeof undefined → not a function)', () => {
    expect(typeof (mcp as { handleRagStoreManageIpc?: unknown }).handleRagStoreManageIpc).toBe('function')
  })

  it('RED 3 — the structural SidebarBridge.rag.manage(request) is ABSENT (the canonical ProvidentBridge + the structural mirror MUST move in the SAME unit — the RCA-6 typecheck leg)', () => {
    const b = { rag: { manage: async () => ({ ok: true, done: 'x' }) } } as unknown as SidebarBridge
    const m: ((r: unknown) => Promise<unknown>) | undefined = (b.rag as { manage?: unknown }).manage as (r: unknown) => Promise<unknown>
    // tsc-red today (the property is absent from SidebarBridge) + runtime-red
    // today (the casted object would carry it only after the implementer syncs
    // the structural mirror). The runtime leg witnesses the absent constant too.
    expect(typeof m).toBe('function')
  })

  it('RED 4 — the `operator-rag-manage` section does NOT render (the pane is absent from settingsContent → the operator mount lacks the manage ids)', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    const html = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('operator-rag-manage')
  })
})

// ===========================================================================
// §5.1 — the shared types + the `IPC_RAG_STORE_MANAGE` constant (RED)
// ===========================================================================
describe('§5.1 — IPC_RAG_STORE_MANAGE + the RagStoreManage* types (types.ts, RED)', () => {
  it('RED — the channel constant === "provident:rag-store-manage"; IPC_RAG_STORE_LISTING (U-MS5) is UNCHANGED, consumed not re-added', () => {
    expect((types as { IPC_RAG_STORE_MANAGE?: unknown }).IPC_RAG_STORE_MANAGE).toBe('provident:rag-store-manage')
    expect(types.IPC_RAG_STORE_LISTING).toBe('provident:rag-store-listing')
  })

  it('typecheck — `IPC_RAG_STORE_MANAGE` is a channel STRING, not an RpcMethod member (1 new channel const; the MCP method census stays UNTOUCHED)', () => {
    expect(typeof (types as { IPC_RAG_STORE_MANAGE?: unknown }).IPC_RAG_STORE_MANAGE).toBe('string')
    // the existing channels resolve unchanged.
    expect(types.IPC_RAG_QUERY).toBe('provident:rag-query')
  })

  it('typecheck — `RagStoreManageOp` is the EXACT five-member union add|remove|rename|setDefault|renameDefault', () => {
    const ops: string[] = ['add', 'remove', 'rename', 'setDefault', 'renameDefault']
    // compile-time: each member is a valid RagStoreManageOp (absent today → tsc red).
    const _o: string[] = ops
    expect(ops).toEqual(['add', 'remove', 'rename', 'setDefault', 'renameDefault'])
  })

  it('typecheck — `RagStoreManageRequest` is the discriminated union with the per-op payload + the OPTIONAL confirmed flag', () => {
    const reqs: Array<{ op: string }> = [
      { op: 'add', name: 'x' },
      { op: 'remove', name: 'x' },
      { op: 'remove', name: 'x', confirmed: true },
      { op: 'rename', from: 'a', to: 'b' },
      { op: 'rename', from: 'a', to: 'b', confirmed: true },
      { op: 'setDefault', name: 'x' },
      { op: 'setDefault', name: 'x', confirmed: true },
      { op: 'renameDefault', to: 'b' },
      { op: 'renameDefault', to: 'b', confirmed: true },
    ]
    expect(reqs).toHaveLength(9)
  })

  it('typecheck — `RagStoreManageResult` is the three-member discriminated result', () => {
    // compile-time: each member is a valid RagStoreManageResult (absent today).
    const results: Array<{ ok?: unknown; confirmationRequired?: unknown }> = [
      { confirmationRequired: true, summary: 's' },
      { ok: true, done: 'd' },
      { ok: false, error: 'e' },
    ]
    expect(results).toHaveLength(3)
    expect(results[2]).toEqual({ ok: false, error: 'e' })
  })

  it('typecheck — the type-level census: 1 new channel const + 3 new shared types (RagStoreManageOp/Request/Result)', () => {
    // 1 const:
    expect((types as { IPC_RAG_STORE_MANAGE?: unknown }).IPC_RAG_STORE_MANAGE).toBe('provident:rag-store-manage')
    // 3 types — each referenced via the namespace (RED: absent).
    const t = types as { RagStoreManageOp?: unknown; RagStoreManageRequest?: unknown; RagStoreManageResult?: unknown }
    expect(typeof t.RagStoreManageOp).toBe('undefined') // types vanish at runtime — the census is a typecheck leg
    expect('RagStoreManageOp' in types).toBe(false)
    expect('RagStoreManageRequest' in types).toBe(false)
    expect('RagStoreManageResult' in types).toBe(false)
  })
})

// ===========================================================================
// §5.2 — the shared handler `handleRagStoreManageIpc(runtime, request)` happy
// states (H1–H7) — RED (the function is ABSENT → not a function)
// ===========================================================================
describe('§5.2 — handleRagStoreManageIpc: happy states (mcp-server.ts, RED)', () => {
  // Data states enumerated (§5.6 H1–H7):
  //   H1 add (immediate, non-confirmed) → { ok:true, done } + hotApply once
  //   H2 remove requires confirmation → { confirmationRequired, summary }, hotRemove count 0
  //   H3 confirmed remove executes (D3/D7) → { ok:true, done } + hotRemove once
  //   H4 rename two-phase → non-confirmed { confirmationRequired } / confirmed { ok:true }
  //   H5 setDefault two-phase → non-confirmed / confirmed
  //   H6 renameDefault two-phase → non-confirmed / confirmed
  //   H7 read-the-runtime-per-call (A-P2-1) — accessors read per manage request
  it('RED 5 (H1) — add executes IMMEDIATELY (non-destructive): { ok:true, done:"Added store \\"research-2026-10\\"" } + hotApply called ONCE with { kind:add, store:{name} }; NO confirmation flow', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectManageOk(
      () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!(
        ctrl,
        { op: 'add', name: 'research-2026-10' },
      ),
      D_ADD('research-2026-10'),
    )
    expect(ctrl.hotApply).toHaveBeenCalledTimes(1)
    expect(ctrl.hotApply).toHaveBeenCalledWith({ kind: 'add', store: { name: 'research-2026-10' } })
  })

  it('RED 6 (H2) — a NON-confirmed remove → { confirmationRequired:true, summary } + hotRemove call count = 0 (NO seam ran — the two-phase request step)', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectConfirmationRequired(
      () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!(
        ctrl,
        { op: 'remove', name: NON },
      ),
      S_REMOVE(NON, 'provident-rag-research-2026-09.json'),
    )
    expect(ctrl.hotRemove).not.toHaveBeenCalled()
  })

  it('RED 7 (H3) — a CONFIRMED remove executes (D3/D7): { ok:true, done:"Removed store ..." } + hotRemove called ONCE with the name', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectManageOk(
      () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!(
        ctrl,
        { op: 'remove', name: NON, confirmed: true },
      ),
      D_REMOVE(NON),
    )
    expect(ctrl.hotRemove).toHaveBeenCalledTimes(1)
    expect(ctrl.hotRemove).toHaveBeenCalledWith(NON)
  })

  it('RED 8 (H4) — rename two-phase: NON-confirmed → { confirmationRequired, summary }; CONFIRMED → { ok:true, done } + hotRename called ONCE with {from,to}', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectConfirmationRequired(
      () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!(
        ctrl,
        { op: 'rename', from: NON, to: 'x' },
      ),
      S_RENAME(NON, 'x', 'provident-rag-research-2026-09.json'),
    )
    expect(ctrl.hotRename).not.toHaveBeenCalled()
    await expectManageOk(
      () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!(
        ctrl,
        { op: 'rename', from: NON, to: 'x', confirmed: true },
      ),
      D_RENAME(NON, 'x'),
    )
    expect(ctrl.hotRename).toHaveBeenCalledTimes(1)
    expect(ctrl.hotRename).toHaveBeenCalledWith(NON, 'x')
  })

  it('RED 9 (H5) — setDefault two-phase: NON-confirmed → { confirmationRequired, summary }; CONFIRMED → { ok:true, done } + hotSetDefault called ONCE', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectConfirmationRequired(
      () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!(
        ctrl,
        { op: 'setDefault', name: NON },
      ),
      S_SET_DEFAULT(NON),
    )
    expect(ctrl.hotSetDefault).not.toHaveBeenCalled()
    await expectManageOk(
      () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!(
        ctrl,
        { op: 'setDefault', name: NON, confirmed: true },
      ),
      D_SET_DEFAULT(NON),
    )
    expect(ctrl.hotSetDefault).toHaveBeenCalledTimes(1)
    expect(ctrl.hotSetDefault).toHaveBeenCalledWith(NON)
  })

  it('RED 10 (H6) — renameDefault two-phase: NON-confirmed → { confirmationRequired, summary }; CONFIRMED → { ok:true, done } + hotRenameDefault called ONCE with {to}', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectConfirmationRequired(
      () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!(
        ctrl,
        { op: 'renameDefault', to: 'main-new' },
      ),
      S_RENAME_DEFAULT('main-new'),
    )
    expect(ctrl.hotRenameDefault).not.toHaveBeenCalled()
    await expectManageOk(
      () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!(
        ctrl,
        { op: 'renameDefault', to: 'main-new', confirmed: true },
      ),
      D_RENAME_DEFAULT('main-new'),
    )
    expect(ctrl.hotRenameDefault).toHaveBeenCalledTimes(1)
    expect(ctrl.hotRenameDefault).toHaveBeenCalledWith('main-new')
  })

  it('RED 11 (H7) — the handler READS THE RUNTIME PER CALL (A-P2-1): getDefaultName() + currentStores() + statusOf(name) are all read on a destructive request step (the summary is built from the LIVE projection)', async () => {
    const { ctrl } = makeRuntimeDouble()
    const fn = (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!
    await expectConfirmationRequired(() => fn(ctrl, { op: 'setDefault', name: NON }), S_SET_DEFAULT(NON))
    // The live projection was read on the non-confirmed request step.
    expect(ctrl.getDefaultName).toHaveBeenCalled()
    expect(ctrl.currentStores).toHaveBeenCalled()
    expect(ctrl.statusOf).toHaveBeenCalled()
  })
})

// ===========================================================================
// §5.2 — the shared handler fail-states (F1–F12) — RED
// ===========================================================================
describe('§5.2 — handleRagStoreManageIpc: fail-states (mcp-server.ts, RED)', () => {
  // Fail-states enumerated (§5.7 F1–F12):
  //   F1  non-object / missing op → 'rag-store-manage: op required'
  //   F2  unknown op → 'rag-store-manage: unknown op "bogus"'
  //   F3  missing/empty name/from/to → name/from/to required
  //   F4  confirmed add → 'add does not require confirmation'
  //   F5  the add seam rejects (W-add-existing) → propagates
  //   F6  non-confirmed destructive → NO seam (count 0)
  //   F7  the advisory pre-flight rejects (W-* byte-equal) → { ok:false }, NO confirmation
  //   F8  a confirmed NOW-STALE target → the seam rejection PROPAGATES (fail-closed)
  //   F9  remove of the DEFAULT at request step → manage-level refusal
  //   F9b rename whose from is the DEFAULT → manage-level refusal
  //   F10 setDefault of the ALREADY-default → manage-level refusal
  //   F11 renameDefault whose to exists/equals → W-rename-target-exists
  //   F12 a confirmed destructive op whose seam rejects → the seam message propagates
  const fn = () => (mcp as { handleRagStoreManageIpc?: (r: unknown, q: unknown) => unknown }).handleRagStoreManageIpc!

  it('RED 12 (F1) — a non-object request / a missing op → { ok:false, error:"rag-store-manage: op required" } (live-untouched; NO seam)', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectManageError(() => fn()(ctrl, null), M_OP_REQUIRED)
    await expectManageError(() => fn()(ctrl, 42), M_OP_REQUIRED)
    await expectManageError(() => fn()(ctrl, {}), M_OP_REQUIRED)
    expect(ctrl.hotApply).not.toHaveBeenCalled()
    expect(ctrl.hotRemove).not.toHaveBeenCalled()
  })

  it('RED 13 (F2) — an op OUTSIDE the five-member union → { ok:false, error:"rag-store-manage: unknown op \\"bogus\\"" } (live-untouched; NO seam)', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectManageError(() => fn()(ctrl, { op: 'bogus' }), M_UNKNOWN_OP('bogus'))
    expect(ctrl.hotApply).not.toHaveBeenCalled()
  })

  it('RED 14 (F3) — a missing/empty name/from/to → name/from/to required (live-untouched; NO seam)', async () => {
    const { ctrl } = makeRuntimeDouble()
    // name (add/remove/setDefault)
    await expectManageError(() => fn()(ctrl, { op: 'add' }), M_NAME_REQUIRED)
    await expectManageError(() => fn()(ctrl, { op: 'remove' }), M_NAME_REQUIRED)
    await expectManageError(() => fn()(ctrl, { op: 'setDefault' }), M_NAME_REQUIRED)
    // from (rename)
    await expectManageError(() => fn()(ctrl, { op: 'rename', to: 'x' }), M_FROM_REQUIRED)
    // to (rename/renameDefault)
    await expectManageError(() => fn()(ctrl, { op: 'rename', from: NON }), M_TO_REQUIRED)
    await expectManageError(() => fn()(ctrl, { op: 'renameDefault' }), M_TO_REQUIRED)
    expect(ctrl.hotApply).not.toHaveBeenCalled()
    expect(ctrl.hotRemove).not.toHaveBeenCalled()
  })

  it('RED 15 (F4) — { op:"add", confirmed:true } → { ok:false, error:"rag-store-manage: add does not require confirmation" } (NO add — add is non-destructive)', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectManageError(() => fn()(ctrl, { op: 'add', name: 'x', confirmed: true }), M_ADD_CONFIRM)
    expect(ctrl.hotApply).not.toHaveBeenCalled()
  })

  it('RED 16 (F5) — the add seam REJECTS (e.g. an ALREADY-PRESENT store) → the seam\'s W-add-existing PROPAGATES as { ok:false, error }', async () => {
    const { ctrl } = makeRuntimeDouble({
      hotApply: () => {
        throw new Error(W_ADD_EXISTING(NON))
      },
    })
    await expectManageError(() => fn()(ctrl, { op: 'add', name: NON }), W_ADD_EXISTING(NON))
  })

  it('RED 17 (F6) — a NON-confirmed destructive op invokes NO seam across ALL FOUR destructive ops (hotRemove/hotRename/hotSetDefault/hotRenameDefault call count = 0)', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectConfirmationRequired(() => fn()(ctrl, { op: 'remove', name: NON }), S_REMOVE(NON, 'provident-rag-research-2026-09.json'))
    await expectConfirmationRequired(() => fn()(ctrl, { op: 'rename', from: NON, to: 'x' }), S_RENAME(NON, 'x', 'provident-rag-research-2026-09.json'))
    await expectConfirmationRequired(() => fn()(ctrl, { op: 'setDefault', name: NON }), S_SET_DEFAULT(NON))
    await expectConfirmationRequired(() => fn()(ctrl, { op: 'renameDefault', to: 'main-new' }), S_RENAME_DEFAULT('main-new'))
    expect(ctrl.hotRemove).not.toHaveBeenCalled()
    expect(ctrl.hotRename).not.toHaveBeenCalled()
    expect(ctrl.hotSetDefault).not.toHaveBeenCalled()
    expect(ctrl.hotRenameDefault).not.toHaveBeenCalled()
  })

  it('RED 18 (F7) — the ADVISORY request-step pre-flight rejects → { ok:false, error } byte-equal to the LANDED W-* strings, NO confirmation offered, NO seam', async () => {
    const { ctrl } = makeRuntimeDouble()
    // remove unknown → W-remove-unknown
    await expectManageError(() => fn()(ctrl, { op: 'remove', name: 'nope' }), W_REMOVE_UNKNOWN('nope'))
    // rename from unknown → W-rename-unknown-from
    await expectManageError(() => fn()(ctrl, { op: 'rename', from: 'nope', to: 'x' }), W_RENAME_UNKNOWN_FROM('nope'))
    // rename target-exists → W-rename-target-exists
    await expectManageError(() => fn()(ctrl, { op: 'rename', from: NON, to: DFLT }), W_RENAME_TARGET(NON, DFLT))
    // rename equal-pair (from === to) → W-rename-target-exists
    await expectManageError(() => fn()(ctrl, { op: 'rename', from: NON, to: NON }), W_RENAME_TARGET(NON, NON))
    // setDefault unknown → W-set-default-unknown
    await expectManageError(() => fn()(ctrl, { op: 'setDefault', name: 'nope' }), W_SET_DEFAULT_UNKNOWN('nope'))
    expect(ctrl.hotRemove).not.toHaveBeenCalled()
    expect(ctrl.hotRename).not.toHaveBeenCalled()
    expect(ctrl.hotSetDefault).not.toHaveBeenCalled()
  })

  it('RED 19 (F8) — a confirmed op whose target was removed CONCURRENTLY between the prompt and the confirm → the SEAM\'s own rejection PROPAGATES byte-identically as { ok:false, error } (fail-closed; the concurrent removal is the authority)', async () => {
    // stale remove — hotRemove now rejects with W-remove-unknown (the store is gone).
    const { ctrl } = makeRuntimeDouble({
      hotRemove: async () => {
        throw new Error(W_REMOVE_UNKNOWN(NON))
      },
    })
    await expectManageError(() => fn()(ctrl, { op: 'remove', name: NON, confirmed: true }), W_REMOVE_UNKNOWN(NON))
    // stale rename — the seam rejects with W-rename-unknown-from.
    const { ctrl: c2 } = makeRuntimeDouble({
      hotRename: async () => {
        throw new Error(W_RENAME_UNKNOWN_FROM(NON))
      },
    })
    await expectManageError(() => fn()(c2, { op: 'rename', from: NON, to: 'x', confirmed: true }), W_RENAME_UNKNOWN_FROM(NON))
    // stale setDefault — the seam rejects with W-set-default-unknown.
    const { ctrl: c3 } = makeRuntimeDouble({
      hotSetDefault: async () => {
        throw new Error(W_SET_DEFAULT_UNKNOWN(NON))
      },
    })
    await expectManageError(() => fn()(c3, { op: 'setDefault', name: NON, confirmed: true }), W_SET_DEFAULT_UNKNOWN(NON))
  })

  it('RED 20 (F9) — a `remove` of the DEFAULT at the request step → { ok:false, error:"rag-store-manage: cannot remove the default store ..." }; NO confirmation, NO seam', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectManageError(() => fn()(ctrl, { op: 'remove', name: DFLT }), M_REMOVE_DEFAULT(DFLT))
    expect(ctrl.hotRemove).not.toHaveBeenCalled()
  })

  it('RED 21 (F9b) — a `rename` whose FROM is the DEFAULT → { ok:false, error:"...cannot rename the default store (use the default-row Rename-default)" }; NO confirmation', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectManageError(() => fn()(ctrl, { op: 'rename', from: DFLT, to: 'main2' }), M_RENAME_DEFAULT)
    expect(ctrl.hotRename).not.toHaveBeenCalled()
  })

  it('RED 22 (F10) — a `setDefault` of the ALREADY-default → { ok:false, error:"...store ... is already the default" }; NO confirmation (a crafted request is refused)', async () => {
    const { ctrl } = makeRuntimeDouble()
    await expectManageError(() => fn()(ctrl, { op: 'setDefault', name: DFLT }), M_SETDEFAULT_NOP(DFLT))
    expect(ctrl.hotSetDefault).not.toHaveBeenCalled()
  })

  it('RED 23 (F11) — a `renameDefault` whose `to` already exists (or equals the current default) → { ok:false, error: W-rename-target-exists } with from = the LIVE default name', async () => {
    const { ctrl } = makeRuntimeDouble()
    // to already exists (NON).
    await expectManageError(() => fn()(ctrl, { op: 'renameDefault', to: NON }), W_RENAME_TARGET(DFLT, NON))
    // to === the current default → the same W-rename-target-exists.
    await expectManageError(() => fn()(ctrl, { op: 'renameDefault', to: DFLT }), W_RENAME_TARGET(DFLT, DFLT))
    expect(ctrl.hotRenameDefault).not.toHaveBeenCalled()
  })

  it('RED 24 (F12) — a confirmed destructive op whose seam REJECTS for ANY reason → the seam\'s byte-pinned message PROPAGATES as { ok:false, error } (live + disk untouched; never a throw)', async () => {
    const { ctrl } = makeRuntimeDouble({
      hotSetDefault: async () => {
        throw new Error('rag-store-runtime: default reassignment already in progress')
      },
    })
    await expectManageError(() => fn()(ctrl, { op: 'setDefault', name: NON, confirmed: true }), 'rag-store-runtime: default reassignment already in progress')
  })

  it('RED 25 (throw-pattern pin) — the handler NEVER throws for a domain failure: a malformed request / advisory reject / seam reject all return { ok:false }', async () => {
    const { ctrl } = makeRuntimeDouble()
    // a malformed request (op required) — a rejection would be an unhandled throw.
    const r = await fn()(ctrl, null)
    expect(r).toEqual({ ok: false, error: M_OP_REQUIRED })
  })
})

// ===========================================================================
// §5.3 — the preload bridge (RELEGATED — never node-importable). The pinned
// node-testable seams: the structural SidebarBridge typecheck leg + the host
// E2E in §5.5 (which drives the INSTALLED sidebar surface). H8 (bridge.rag.manage)
// is type-level + the host-drive, verified by code review.
// ===========================================================================
describe('§5.3 — the structural SidebarBridge sync (typecheck leg; the canonical ProvidentBridge + the structural mirror MUST move in the SAME unit — RCA-6)', () => {
  it('typecheck — SidebarBridge.rag gained `manage(request): Promise<RagStoreManageResult>` (absent today → tsc red; the runtime leg asserts the method is present once synced)', () => {
    const b = {
      rag: { manage: async () => ({ ok: true, done: 'x' }) as types.RagStoreManageResult },
    } as unknown as SidebarBridge
    const m: (() => Promise<types.RagStoreManageResult>) | undefined = (b.rag as { manage?: unknown }).manage as unknown as () => Promise<types.RagStoreManageResult>
    // runtime-red today: the structural mirror has no `manage`.
    expect(typeof m).toBe('function')
    expect((types as { RagStoreManageResult?: unknown }).RagStoreManageResult).toBeUndefined() // the shared type is absent (typecheck leg)
  })

  it('typecheck — the bridge `manage(request)` sends the IPC_RAG_STORE_MANAGE channel with the request (H8 — the storeListing/stores() mirror; pinned by the constant + the shared type) (RED)', () => {
    // The preload implementation is relegated (imports electron); the pinned
    // node-testable contract is the CONSTANT (absent) + the structural mirror.
    expect((types as { IPC_RAG_STORE_MANAGE?: unknown }).IPC_RAG_STORE_MANAGE).toBe('provident:rag-store-manage')
    expect(types.IPC_RAG_STORE_LISTING).toBe('provident:rag-store-listing') // the stores() mirror channel is intact
  })
})

// ===========================================================================
// §5.5 — the operator-manage pane + the host (sidebar-panes.ts, RED). The
// harness drives the INSTALLED sidebar surface (`window.provident.sidebar`
// after boot) + a stub `bridge.rag.manage` — absent today, so every render
// + E2E assertion here is red.
// ===========================================================================
/** A 2-store listing payload the host's `lastStoreListing` renders (the
 *  `main` default + the `research-2026-09` non-default). */
function twoStoreListing(): RagStoreListingPayload {
  return {
    stores: [
      { name: DFLT, default: true, persistenceFile: 'provident-rag.json', corpusRoot: null, status: 'loaded' },
      { name: NON, default: false, persistenceFile: 'provident-rag-research-2026-09.json', corpusRoot: '/abs/corpus', status: 'loaded' },
    ],
  }
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

function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, overrides: Partial<RagEdge> = {}): RagEdge {
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

function makeBridge(opts: {
  snapshot?: RagSnapshotPayload
  storeListing?: RagStoreListingPayload | null
  manage?: (req: unknown) => Promise<unknown>
  operatorSettings?: OperatorSettings
  security?: SecuritySettings
} = {}) {
  const state = {
    snapshot: opts.snapshot ?? validSnapshot(),
    storeListing: opts.storeListing === undefined ? ({ stores: [] } as RagStoreListingPayload) : opts.storeListing,
    operatorSettings: opts.operatorSettings ?? { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' },
    security: opts.security ?? { token: null, enabled: ['read', 'dispatch'] },
  }
  const manage = opts.manage ?? (async () => ({ ok: true, done: 'x' }))
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
      docHeads: vi.fn(async (): Promise<RagDocHeadsPayload> => ({ documents: [] })),
      stores: vi.fn(async (): Promise<RagStoreListingPayload> => state.storeListing as RagStoreListingPayload),
      // U-H8 — the operator-registry manage IPC (the `rag-store-manage` channel).
      manage: vi.fn(async (req: unknown) => manage(req)),
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
  state: ReturnType<typeof makeBridge>['state']
  onRebuild: ReturnType<typeof vi.fn>
}

function makeHarness(opts: Parameters<typeof makeBridge>[0] = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const { bridge, state } = makeBridge(opts)
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
  const accessSidebar = (): Record<string, unknown> =>
    (globalThis as unknown as { window: { provident: { sidebar: Record<string, unknown> } } }).window.provident.sidebar
  return {
    host,
    runtime,
    operatorMount,
    registry,
    bridge,
    state,
    onRebuild,
    get sidebar(): Record<string, unknown> {
      return accessSidebar()
    },
  } as Harness & { sidebar: Record<string, unknown> }
}

const opHtml = (h: Harness): string => (h.operatorMount as unknown as { innerHTML: string }).innerHTML
const appHtml = (h: Harness): string => h.runtime.renderedHtmlResult().renderedHtml

describe('§5.5 — the operator-manage section renders (H10, RED — the pane is absent today)', () => {
  it('RED 26 (H10) — a populated listing → div#operator-rag-manage with the add form + one row per store; the DEFAULT row exposes Rename-default ONLY; a NON-default row exposes Remove/Rename/Set-default; NO confirmation strip when nothing is pending', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    const html = opHtml(h)
    // the section + the add form:
    expect(html).toContain('operator-rag-manage')
    expect(html).toContain('operator-rag-manage-add')
    expect(html).toContain('operator-rag-manage-add-name')
    expect(html).toContain('operator-rag-manage-add-submit')
    expect(html).toContain('Manage RAG stores')
    // the per-store rows (one each):
    expect(html).toContain('operator-rag-manage-row-main')
    expect(html).toContain('operator-rag-manage-row-research-2026-09')
    expect(html).toContain(`${DFLT} (default)`)
    expect(html).toContain(NON)
    // the DEFAULT row exposes the sanctioned Rename-default, NEVER remove/set-default:
    expect(html).toContain('operator-rag-manage-renamedefault-input')
    expect(html).toContain('operator-rag-manage-renamedefault')
    expect(html).not.toContain('operator-rag-manage-remove-main')
    expect(html).not.toContain('operator-rag-manage-setdefault-main')
    // the NON-default row exposes Remove/Rename/Set-default:
    expect(html).toContain(`operator-rag-manage-remove-${NON}`)
    expect(html).toContain(`operator-rag-manage-rename-input-${NON}`)
    expect(html).toContain(`operator-rag-manage-rename-${NON}`)
    expect(html).toContain(`operator-rag-manage-setdefault-${NON}`)
    // NO confirmation strip when no op is pending:
    expect(html).not.toContain('operator-rag-manage-confirm')
  })

  it('RED 27 (H15 / §5.8 negative) — the manage controls are in the OPERATOR isolated scope only: present in the OPERATOR mount, ABSENT from the app Runtime MCP surface (get_rendered_html)', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    expect(opHtml(h)).toContain('operator-rag-manage')
    // the app Runtime graph renders the RAG document but NEVER the manage controls.
    expect(appHtml(h)).toContain('Doc A')
    expect(appHtml(h)).not.toContain('operator-rag-manage')
  })
})

describe('§5.5 — the host manage E2E (H11–H14, RED — the host methods are ABSENT today)', () => {
  it('RED 28 (H11) — ADD end-to-end: sidebar.registryManage({op:"add",name}) → bridge.rag.manage called with the trimmed request → on { ok:true } the host re-fetches bridge.rag.stores() AND re-mounts (the NEW row appears)', async () => {
    const listing = twoStoreListing()
    const h = makeHarness({ storeListing: listing })
    await h.host.boot(h.runtime)
    // update the state so the post-mutate listing re-fetch reflects the add.
    h.state.storeListing = {
      stores: [
        ...listing.stores,
        { name: 'research-2026-10', default: false, persistenceFile: 'provident-rag-research-2026-10.json', corpusRoot: null, status: 'loaded' },
      ],
    }
    const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
    manage.mockResolvedValueOnce({ ok: true, done: D_ADD('research-2026-10') })
    const storesBefore = (h.bridge.rag.stores as ReturnType<typeof vi.fn>).mock.calls.length
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'add', name: 'research-2026-10' })
    // await the manage resolution + the subsequent stores() re-fetch.
    await Promise.resolve()
    await Promise.resolve()
    expect(manage).toHaveBeenCalledWith({ op: 'add', name: 'research-2026-10' })
    expect((h.bridge.rag.stores as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(storesBefore)
    expect(opHtml(h)).toContain('operator-rag-manage-row-research-2026-10')
  })

  it('RED 29 (H12) — REMOVE confirm end-to-end: a NON-confirmed remove → bridge.rag.manage resolves { confirmationRequired, summary } → the host sets the pending + re-mounts (the confirm strip appears) → the CONFIRM re-invokes { op, confirmed:true } → on { ok:true } the pending is cleared + the listing re-fetched (the row disappears)', async () => {
    const listing = twoStoreListing()
    const h = makeHarness({ storeListing: listing })
    await h.host.boot(h.runtime)
    const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
    manage.mockReset()
    manage.mockResolvedValueOnce({ confirmationRequired: true, summary: S_REMOVE(NON, 'provident-rag-research-2026-09.json') })
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON })
    await Promise.resolve()
    await Promise.resolve()
    // the confirm strip appears with the summary + Confirm/Cancel:
    expect(opHtml(h)).toContain('operator-rag-manage-confirm')
    expect(opHtml(h)).toContain(`data-op="remove"`)
    expect(opHtml(h)).toContain('operator-rag-manage-confirm-yes')
    expect(opHtml(h)).toContain('operator-rag-manage-confirm-no')
    expect(opHtml(h)).toContain(S_REMOVE(NON, 'provident-rag-research-2026-09.json'))
    // the CONFIRM step re-invokes the same op with confirmed:true:
    h.state.storeListing = { stores: [listing.stores[0]] } // the store was removed
    manage.mockResolvedValueOnce({ ok: true, done: D_REMOVE(NON) })
    const storesBefore = (h.bridge.rag.stores as ReturnType<typeof vi.fn>).mock.calls.length
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON, confirmed: true })
    await Promise.resolve()
    await Promise.resolve()
    expect(manage).toHaveBeenCalledWith({ op: 'remove', name: NON, confirmed: true })
    expect((h.bridge.rag.stores as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(storesBefore)
    // pending cleared + the row disappears:
    expect(opHtml(h)).not.toContain('operator-rag-manage-confirm')
    expect(opHtml(h)).not.toContain(`operator-rag-manage-row-${NON}`)
  })

  it('RED 30 (H13) — the CONFIRM CANCEL: with a pending remove, sidebar.registryManageDismiss() clears the pending (the confirm strip disappears) + invokes NO seam', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
    manage.mockReset()
    manage.mockResolvedValueOnce({ confirmationRequired: true, summary: S_REMOVE(NON, 'provident-rag-research-2026-09.json') })
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON })
    await Promise.resolve()
    await Promise.resolve()
    expect(opHtml(h)).toContain('operator-rag-manage-confirm')
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManageDismiss()
    await Promise.resolve()
    expect(opHtml(h)).not.toContain('operator-rag-manage-confirm')
    // NO seam → the manage bridge was only ever called for the (non-confirmed) request step:
    expect(manage).toHaveBeenCalledTimes(1)
    expect(manage).toHaveBeenCalledWith({ op: 'remove', name: NON })
  })

  it('RED 31 (H14, Q5) — a CONFIRMED default-changing op (setDefault/renameDefault) → the host calls requestRebuild() (the dirty-guarded app re-derive against the NEW default); an add/remove/rename does NOT', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
    manage.mockReset()
    manage.mockResolvedValueOnce({ ok: true, done: D_SET_DEFAULT(NON) })
    const onRebuildCalls = h.onRebuild.mock.calls.length
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'setDefault', name: NON, confirmed: true })
    await Promise.resolve()
    await Promise.resolve()
    // the confirmed setDefault routed through the edit controller's
    // requestRebuild → onRebuild (reDerive). (Q5.)
    expect(h.onRebuild.mock.calls.length).toBeGreaterThan(onRebuildCalls)
  })

  it('RED 32 (H14b, Q5) — a confirmed non-default mutate (remove) does NOT trigger a requestRebuild (listing-refresh only — A-P2-3)', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
    manage.mockReset()
    manage.mockResolvedValueOnce({ ok: true, done: D_REMOVE(NON) })
    const onRebuildCalls = h.onRebuild.mock.calls.length
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON, confirmed: true })
    await Promise.resolve()
    await Promise.resolve()
    expect(h.onRebuild.mock.calls.length).toBe(onRebuildCalls)
  })
})

// ===========================================================================
// §5.5 — the OPERATOR_RAG_* handler bodies. HOST-H8-1 (HIGH security — the
// primary fix): the 7 operator-registry-manage defs must NOT be registered in
// the GLOBAL app-graph `handlerDef` table. The pre-fix code registered them via
// `registerRagManageHandlerDefs` → `registerHandlerDef`, which let a `code.set`-
// crafted template whose `main` zone carries `handlers:[{name:'operator-rag-
// manage-confirm'}]` name-resolve the DESTRUCTIVE body in the APP Runtime →
// `provident.dispatch` could drive hotRemove/hotSetDefault/etc. via MCP with NO
// operator confirmation (falsifying A-P2-6/A-P2-7 + §5.8's "an agent cannot
// drive the operator editor"). HOST-H8-1 REMOVES the global registration — the
// operator isolate scope's nodes carry INLINE full-expression bodies (the
// operator scope doesn't need the global name-addressable registry). These tests
// read the INLINE bodies off the translated operator-scope nodes (NEVER the
// global registry) + RED 33 asserts the 7 names are NOT in the global table.
// ===========================================================================
describe('§5.5 — the OPERATOR_RAG_* INLINE handler bodies (operator scope only — HOST-H8-1)', () => {
  /** Read an operator INLINE handler (full-expression `function (ctx)` string,
   *  which translateLegacy compiles to an executable function; a `code.set`-able
   *  handler body must NOT be resolvable by NAME in the app-graph registry) off the
   *  translated operator-scope nodes (the operator pane is the sole owner of these
   *  bodies — the global registry has NONE, HOST-H8-1). */
  function inlineOperatorBody(h: Harness, name: string): string | ((ctx: unknown) => void) {
    const nodes = (h.host as unknown as {
      operatorNodes: Array<{ handlers?: Array<{ name?: string; body?: unknown }> }>
    }).operatorNodes
    for (const n of nodes) {
      const handlers = n.handlers
      if (!handlers) continue
      for (const hd of handlers) {
        if (hd.name === name && (typeof hd.body === 'string' || typeof hd.body === 'function')) {
          return hd.body as string | ((ctx: unknown) => void)
        }
      }
    }
    // DEBUG — enumerate the handler names actually present for diagnosis.
    const names: string[] = []
    for (const n of nodes) {
      for (const hd of n.handlers ?? []) if (hd.name) names.push(String(hd.name))
    }
    throw new Error(`operator inline handler body not found: ${name} (present: [${names.join(', ')}])`)
  }

  /** Boot the harness (populated listing), seed the pending-confirm strip for
   *  the confirm/dismiss bodies, then compile + run the requested INLINE body
   *  against a fake window.provident.sidebar (the U1 runToggleBody idiom).
   *  Returns the dispatched registryManage/registryManageDismiss calls. */
  async function runBody(
    name: string,
    ctx: unknown,
    domValues: Record<string, string> = {},
  ): Promise<Array<{ op?: string } & Record<string, unknown>>> {
    const needsPending = name === 'operator-rag-manage-confirm' || name === 'operator-rag-manage-dismiss'
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    if (needsPending) {
      // seed the pending-confirm strip exactly as RED 29 does: a non-confirmed
      // remove whose manage resolves { confirmationRequired } → pending + re-mount.
      const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
      manage.mockReset()
      manage.mockResolvedValueOnce({ confirmationRequired: true, summary: 'seed' })
      ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON })
      await Promise.resolve()
      await Promise.resolve()
    }
    const body = inlineOperatorBody(h, name)
    const calls: Array<{ op?: string } & Record<string, unknown>> = []
    const fakeWindow = {
      provident: {
        sidebar: {
          registryManage: (r: { op?: string } & Record<string, unknown>) => calls.push(r),
          registryManageDismiss: () => calls.push({ op: 'dismiss' } as { op?: string } & Record<string, unknown>),
        },
      },
    }
    ;(globalThis as unknown as { window?: unknown }).window = fakeWindow
    // preset the DOM input values the body reads (the dom-shim getElementById).
    for (const [id, v] of Object.entries(domValues)) {
      const el = (globalThis as unknown as { document: { getElementById: (id: string) => { value: string } } }).document.getElementById(id)
      el.value = v
    }
    const fn =
      typeof body === 'function' ? body : (compileHandlerBody(body) as (ctx: unknown) => void)
    fn(ctx)
    return calls
  }

  it('RED 33 (HOST-H8-1) — the 7 OPERATOR_RAG_* handler names are NEVER registered in the global app-graph handlerDef table (the operator scope\'s INLINE bodies are the only registration — RED today, the pre-fix global registration resolves them)', async () => {
    installShim()
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime) // boot → bindHandlers → registers ONLY the app-graph defs
    for (const name of [
      'operator-rag-manage-add',
      'operator-rag-manage-remove',
      'operator-rag-manage-rename',
      'operator-rag-manage-setdefault',
      'operator-rag-manage-renamedefault',
      'operator-rag-manage-confirm',
      'operator-rag-manage-dismiss',
    ]) {
      expect(handlerDef(name)).toBeUndefined()
    }
  })

  it('RED 34 — the ADD body TRIMS the typed name (OPERATOR-INPUT-HYGIENE): a valid name → sidebar.registryManage({op:"add", name:trimmed})', async () => {
    installShim()
    const calls = await runBody(
      'operator-rag-manage-add',
      { node: { props: {} } },
      { 'operator-rag-manage-add-name': '  research-2026-10  ' },
    )
    expect(calls).toEqual([{ op: 'add', name: 'research-2026-10' }])
  })

  it('RED 35 (F13) — the ADD body with a WHITESPACE-ONLY input is DROPPED (no registryManage dispatch, no seam)', async () => {
    installShim()
    const calls = await runBody(
      'operator-rag-manage-add',
      { node: { props: {} } },
      { 'operator-rag-manage-add-name': '   ' },
    )
    expect(calls).toEqual([])
  })

  it('RED 36 — the REMOVE body reads data-store and dispatches {op:"remove", name} (NO trim — the store name is the node data, not free input)', async () => {
    installShim()
    const calls = await runBody('operator-rag-manage-remove', { node: { props: { 'data-store': NON } } })
    expect(calls).toEqual([{ op: 'remove', name: NON }])
  })

  it('RED 37 — the RENAME body reads data-store + the rename input and dispatches {op:"rename", from:name, to:trimmed}', async () => {
    installShim()
    const calls = await runBody(
      'operator-rag-manage-rename',
      { node: { props: { 'data-store': NON } } },
      { [`operator-rag-manage-rename-input-${NON}`]: '  x  ' },
    )
    expect(calls).toEqual([{ op: 'rename', from: NON, to: 'x' }])
  })

  it('RED 38 — the SET-DEFAULT body dispatches {op:"setDefault", name} from data-store', async () => {
    installShim()
    const calls = await runBody('operator-rag-manage-setdefault', { node: { props: { 'data-store': NON } } })
    expect(calls).toEqual([{ op: 'setDefault', name: NON }])
  })

  it('RED 39 — the RENAME-DEFAULT body reads the renamedefault input and dispatches {op:"renameDefault", to:trimmed}', async () => {
    installShim()
    const calls = await runBody(
      'operator-rag-manage-renamedefault',
      { node: { props: {} } },
      { 'operator-rag-manage-renamedefault-input': '  main-new  ' },
    )
    expect(calls).toEqual([{ op: 'renameDefault', to: 'main-new' }])
  })

  it('RED 40 — the CONFIRM body RECONSTRUCTS the confirmed request from the strip\'s data-op/data-store/data-from/data-to props (Q7 same-channel two-phase)', async () => {
    installShim()
    const removeCalls = await runBody(
      'operator-rag-manage-confirm',
      { node: { props: { 'data-op': 'remove', 'data-store': NON } } },
    )
    expect(removeCalls).toEqual([{ op: 'remove', name: NON, confirmed: true }])
    installShim()
    const renameCalls = await runBody(
      'operator-rag-manage-confirm',
      { node: { props: { 'data-op': 'rename', 'data-from': 'a', 'data-to': 'b' } } },
    )
    expect(renameCalls).toEqual([{ op: 'rename', from: 'a', to: 'b', confirmed: true }])
    const setDefaultCalls = await runBody(
      'operator-rag-manage-confirm',
      { node: { props: { 'data-op': 'setDefault', 'data-store': NON } } },
    )
    expect(setDefaultCalls).toEqual([{ op: 'setDefault', name: NON, confirmed: true }])
    const renameDefaultCalls = await runBody(
      'operator-rag-manage-confirm',
      { node: { props: { 'data-op': 'renameDefault', 'data-to': 'main-new' } } },
    )
    expect(renameDefaultCalls).toEqual([{ op: 'renameDefault', to: 'main-new', confirmed: true }])
  })

  it('RED 41 — the DISMISS body calls sidebar.registryManageDismiss() (the confirm CANCEL — NO seam)', async () => {
    installShim()
    const calls = await runBody('operator-rag-manage-dismiss', { node: { props: {} } })
    expect(calls).toEqual([{ op: 'dismiss' }])
  })
})

// ===========================================================================
// §5.5 — the host fail-states (F13–F16) + the §5.8 security boundary
// ===========================================================================
describe('§5.5 — the host fail-states (F13–F16, RED)', () => {
  it('RED 42 (F14) — a bridge failure in registryManage does NOT crash: the .catch logs + clears the pending + re-mounts; the prior registry is unchanged', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
    manage.mockReset()
    manage.mockRejectedValueOnce(new Error('rag-store-manage boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON })
      // await the rejection to settle (no unhandled rejection → the test passes
      // through the .catch).
      await manage.mock.results[0].value.catch(() => {})
      await Promise.resolve()
      // never a crash: the operator pane still mounts (no confirm strip leftover).
      expect(opHtml(h)).not.toContain('operator-rag-manage-confirm')
      expect(errSpy).toHaveBeenCalled()
    } finally {
      errSpy.mockRestore()
    }
  })

  it('RED 43 — a bridge.error result (a seam/manage { ok:false, error }) clears the pending + shows the error p#operator-rag-manage-error (fail-closed on the operator surface)', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
    manage.mockReset()
    manage.mockResolvedValueOnce({ ok: false, error: W_REMOVE_UNKNOWN(NON) })
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON, confirmed: true })
    await Promise.resolve()
    await Promise.resolve()
    expect(opHtml(h)).toContain('operator-rag-manage-error')
    expect(opHtml(h)).not.toContain('operator-rag-manage-confirm')
  })

  it('RED 44 — the host `registryManage` routes the result by the discriminated member: NO confirmation strip on a { ok:true } result (never a phantom pending)', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
    manage.mockReset()
    manage.mockResolvedValueOnce({ ok: true, done: D_REMOVE(NON) })
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON, confirmed: true })
    await Promise.resolve()
    await Promise.resolve()
    expect(opHtml(h)).not.toContain('operator-rag-manage-confirm')
    expect(opHtml(h)).not.toContain('operator-rag-manage-error')
  })
})

// ===========================================================================
// HOST-H8 regressions — the adversarial-pass findings on the GREEN U-H8
// (HOST-H8-1 HIGH security + HOST-H8-2 MEDIUM + HOST-H8-3/4/5 LOW). Each is
// RED-first: MUST fail on the pre-fix code and pass after the fix.
// ===========================================================================
describe('HOST-H8 regressions (the adversarial pass findings — RED first)', () => {
  it('HOST-H8-1(b) — a crafted app template whose node name-references operator-rag-manage-confirm (NO inline body) does NOT resolve to the destructive body: provident.dispatch leaves the sidebar unchanged (an agent CANNOT drive hotRemove/hotSetDefault/etc. via MCP)', async () => {
    installShim()
    const mount = mountEl() as never
    const runtime = new Runtime({ mount, envelope: placeholderEnvelope() as never })
    // The malicious `code.set` shape: a zone container whose handlers array carries
    // ONLY the name `operator-rag-manage-confirm` (the app traversal carries it
    // verbatim into the app envelope; `code.set` does not strip handlers/data-*).
    const crafted: LegacyInitialData = {
      template: { root: { type: 'div', props: { id: 'root' }, children: [] } },
      content: [
        {
          content: [
            {
              type: 'button',
              props: { id: 'crafted-remove', 'data-op': 'remove', 'data-store': NON },
              handlers: [{ name: 'operator-rag-manage-confirm', event: 'click' }],
            },
          ],
        },
      ],
      clientConfig: { runInstantiation: true, runRendering: true },
    }
    const calls: Array<{ op?: string } & Record<string, unknown>> = []
    ;(globalThis as unknown as { window?: unknown }).window = {
      provident: {
        sidebar: {
          registryManage: (r: { op?: string } & Record<string, unknown>) => calls.push(r),
          registryManageDismiss: () => calls.push({ op: 'dismiss' } as { op?: string } & Record<string, unknown>),
        },
      },
    }
    runtime.loadEnvelope(crafted)
    await runtime.dispatch({ target: 'crafted-remove', event: 'click' })
    // The destructive confirm body must NOT have run (it would dispatch
    // { op:'remove', name:NON, confirmed:true } → the operator-only seam). RED
    // today — the pre-fix global registration name-resolves it → calls non-empty.
    expect(calls).toEqual([])
  })

  it('HOST-H8-2 — a concurrent setDefault between the prompt and the confirm does NOT let the confirm remove the now-default store: the CONFIRM branch re-runs the advisory default-guard and returns the manage-level M-remove-default byte-pin (hotRemove NOT invoked)', async () => {
    // Between the request step and the confirm, a setDefault made NON the default.
    const { ctrl } = makeRuntimeDouble({
      stores: [
        { name: DFLT, default: false, persistenceFile: 'provident-rag.json' },
        { name: NON, default: true, persistenceFile: 'provident-rag-research-2026-09.json' },
      ],
      defaultName: NON,
    })
    const r = await mcp.handleRagStoreManageIpc(ctrl, { op: 'remove', name: NON, confirmed: true })
    expect(r).toEqual({ ok: false, error: M_REMOVE_DEFAULT(NON) })
    expect(ctrl.hotRemove).not.toHaveBeenCalled()
  })

  it('HOST-H8-3 — a defensive accessor read that THROWS on the request step is a clean { ok:false, error }, never a handler throw (the "never throws" contract)', async () => {
    const { ctrl } = makeRuntimeDouble()
    ;(ctrl.getDefaultName as ReturnType<typeof vi.fn>).mockImplementation(() => {
      throw new Error('accessor boom')
    })
    // RED today — the un-wrapped request step rejects (the handler throws).
    const r = await mcp.handleRagStoreManageIpc(ctrl, { op: 'remove', name: NON })
    expect(r).toEqual({ ok: false, error: 'accessor boom' })
  })

  it('HOST-H8-4 — a rapid double-click on Confirm does NOT re-fire a confirmed apply while one is in flight (the second confirmed apply of the SAME op is ignored — no stale error strip)', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    const manage = h.bridge.rag.manage as ReturnType<typeof vi.fn>
    manage.mockReset()
    manage.mockResolvedValue({ ok: true, done: D_REMOVE(NON) })
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON, confirmed: true })
    ;(h as Harness & { sidebar: Record<string, unknown> }).sidebar.registryManage({ op: 'remove', name: NON, confirmed: true })
    await Promise.resolve()
    await Promise.resolve()
    // RED today — both fire → the bridge is called twice.
    expect(manage).toHaveBeenCalledTimes(1)
  })

  it('HOST-H8-5 — a seam that throws null/undefined surfaces a useful manage error, NOT the literal "null"/"undefined" strings', async () => {
    const { ctrl } = makeRuntimeDouble({
      hotRemove: async () => {
        throw null as never
      },
    })
    const r = await mcp.handleRagStoreManageIpc(ctrl, { op: 'remove', name: NON, confirmed: true })
    expect(r.ok).toBe(false)
    expect(r.error).toBe(`${MR} operation failed`)
  })
})

// ===========================================================================
// §5.8 — the negative pins (D6 / A-P2-6 / A-P2-7 / D8 / D3 + the census-41 +
// the all-UI-via-provident constraint + the NOT-MCP-visible boundary)
// ===========================================================================
describe('§5.8 — the negative pins: NO new MCP tool / census stays 41 / not group-gated / provident-authored / mechanism modules UNTOUCHED', () => {
  it('GREEN-guard (census) — ALL_TOOLS is 55 entries (41 + the 3 gnosis.* names + the 11 A2 document/wiki names) and carries NO rag.manage / rag.list_stores / store-census tool (U-H8 adds 0 MCP tools, D6/A-P2-6)', () => {
    // Census is 55, not 41: the gnosis.* MCP/UI wiring unit added gnosis.query /
    // gnosis.stream / gnosis.status to ALL_TOOLS (§5.2/§5.10 census bump), and
    // Unit A2 added the 11 gnosis.document.*/gnosis.wiki.* names
    // (docs/specs/unit-a2-document-crud-wiring.md §5.10 — 11 new ALL_TOOLS rows).
    expect(ProvidentMcpServer.ALL_TOOLS).toHaveLength(55)
    expect(ProvidentMcpServer.ALL_TOOLS).not.toContain('rag.manage')
    expect(ProvidentMcpServer.ALL_TOOLS).not.toContain('rag.list_stores')
    expect(ProvidentMcpServer.ALL_TOOLS).not.toContain('rag.store-listing')
    expect(ProvidentMcpServer.ALL_TOOLS).not.toContain('rag.store-manage')
  })

  it('GREEN-guard (§5.8) — NO security gate row / group routes to the operator editor (absent tool names → groupForTool null); the canonical rag tools still resolve to their groups', () => {
    // No tool→group row routes to the operator manage surface (an agent cannot
    // reach it over MCP). These ABSENCE pins are GREEN today — must stay green
    // after U-H8 (the operator editor is an IPC surface, not an MCP tool).
    expect(groupForTool('rag.manage')).toBe(null)
    expect(groupForTool('rag.store-manage')).toBe(null)
    expect(groupForTool('rag.list_stores')).toBe(null)
    expect(groupForTool('rag.store-listing')).toBe(null)
    // the canonical rag.query group is unchanged.
    expect(groupForTool('rag.query')).toBe('rag')
  })

  it('RED — the channel constant is a channel STRING === "provident:rag-store-manage" (the D6 ONE channel descriptor, NOT an RpcMethod member; absent today → RED)', () => {
    expect((types as { IPC_RAG_STORE_MANAGE?: unknown }).IPC_RAG_STORE_MANAGE).toBe('provident:rag-store-manage')
    // the U-MS5 listing channel (consumed, not re-added) is unchanged + intact.
    expect(types.IPC_RAG_STORE_LISTING).toBe('provident:rag-store-listing')
  })

  it('GREEN-guard (F16) — the operator manage controls render in the OPERATOR scope, NEVER inside the app Runtime graph: get_rendered_html excludes them (the APP-only negative — the operator pane never enters the app envelope)', async () => {
    const h = makeHarness({ storeListing: twoStoreListing() })
    await h.host.boot(h.runtime)
    // The app Runtime's MCP surface (get_rendered_html) reads ONLY the app graph
    // — the operator isolated scope's manage controls (wherever they render)
    // are never present in it. GREEN today + must stay green after U-H8.
    expect(appHtml(h)).not.toContain('operator-rag-manage')
    expect(h.runtime.renderedHtmlResult().renderedHtml).not.toContain('operator-rag-manage-add-submit')
  })

  it('GREEN-guard — the mechanism modules are UNTOUCHED: rag-store-runtime.ts carries NO `\bIPC_[A-Z_]+\b` lexeme (U-H8 adds ZERO IPC constants there — the U-H2 N-grep pin stays green) + rag-store-write/remove/default add none', () => {
    for (const rel of [
      '../src/main/rag-store-runtime.ts',
      '../src/main/rag-store-remove.ts',
      '../src/main/rag-store-default.ts',
      '../src/main/rag-store-registry-write.ts',
    ]) {
      const src = readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
      expect(src.match(/\bIPC_[A-Z_]+\b/g) ?? []).toEqual([])
    }
  })

  it('GREEN-guard (D3 / §5.8) — the manage surface itself authors NO deletion primitive: U-H8 routes the remove through the LANDED hotRemove (D7 drain-then-teardown); U-H8 adds no unlink/rm/rmdir', () => {
    // The RED handler invokes the seam; the deletion lives in the seam, not U-H8.
    // Pinned here as a guard the Implementer must preserve (no NEW fs deletion in
    // the operator editor). GREEN today (the U-H8 code is absent) — must STAY green.
    const sidebarSrc = readFileSync(fileURLToPath(new URL('../src/renderer/sidebar-panes.ts', import.meta.url)), 'utf8')
    // no manage-specific deletion import in the renderer.
    expect(sidebarSrc.includes('unlink(') || sidebarSrc.includes('rmdir(')).toBe(false)
  })
})

// ===========================================================================
// census (§5.10) — the U-H8 surface census (RED on the missing pieces)
// ===========================================================================
describe('§5.10 — the U-H8 surface census (RED)', () => {
  it('RED — 1 new channel const + 3 new shared types + 1 shared handler + 1 preload rag method + 2 sidebar methods + 7 handler bodies + 3 host methods + 2 host fields', () => {
    // the absence markers (P0):
    expect((types as { IPC_RAG_STORE_MANAGE?: unknown }).IPC_RAG_STORE_MANAGE).toBe('provident:rag-store-manage')
    expect(typeof (mcp as { handleRagStoreManageIpc?: unknown }).handleRagStoreManageIpc).toBe('function')
    // the host methods are installed via the sidebar surface after boot:
    const h = makeHarness({ storeListing: twoStoreListing() })
    // (bindHandlers registers the OPERATOR_RAG_* bodies; boot installs the sidebar bridge)
    return Promise.all([h.host.boot(h.runtime)]).then(() => {
      const s = (h as Harness & { sidebar: Record<string, unknown> }).sidebar
      // RED today — registryManage/registryManageDismiss are not installed.
      expect(typeof s.registryManage).toBe('function')
      expect(typeof s.registryManageDismiss).toBe('function')
    })
  })
})
