// tests/editing-mode-broadcast-host.test.ts — Unit U1: the HOST wiring for the
// `operator-settings-changed` re-derive broadcast + the button-toggle Settings
// control (docs/specs/unit-u1-editing-mode-setting.md §1.3/§1.4 + §2).
//
// This is the TestWriter RED set. The changes do NOT exist yet:
//   - `src/renderer/sidebar-panes.ts` has NO `operatorSettings.onChanged` in the
//     `SidebarBridge` structural type, NO `unsubSettings` field, NO `boot`
//     subscription, NO `onOperatorSettingsChanged` method, NO button-toggle in
//     `settingsContent`, and `operatorSet` STILL does the OLD inline
//     mountOperator + .then(lastOperatorSettings=settings) behavior.
//   - `src/main/main.ts` does NOT broadcast `IPC_OPERATOR_SETTINGS_CHANGED`
//     from the SET handler, and `src/main/preload.ts` has NO
//     `operatorSettings.onChanged`.
//   - `src/shared/types.ts` has NO `editingMode` / `IPC_OPERATOR_SETTINGS_CHANGED`.
//
// The host is exercised through the existing SidebarPanes host integration
// harness (the same `makeHarness` approach Unit K/U3 use). Host methods that do
// not exist yet are invoked through an `any` cast so vitest reaches the runtime
// failure ("onOperatorSettingsChanged is not a function") — the RED proof.
//
// Contract points pinned by the spec and tested here:
//   - boot subscribes via `bridge.operatorSettings.onChanged` (unsubSettings).
//   - a broadcast → `onOperatorSettingsChanged` → RE-FETCH (single source of
//     truth = main store, amendment 2) → set `lastOperatorSettings` +
//     `this.editingMode` → `editController.requestRebuild()` → the SAME single
//     re-derive as rag-store-changed/template-changed.
//   - FRESH re-derive on a mode toggle (Unit U3 F1) — never `refresh()` over the
//     cached spliced envelope; a contenteditable→textarea round-trip restores
//     the textareas.
//   - NO re-derive loop (amendment 2) — reDerive does NOT write settings, so a
//     re-derive never re-triggers the broadcast.
//   - the button-toggle control (text div = current mode; button label + data
//     -mode = toggled member) is provident-authored in the OPERATOR isolated
//     scope (never MCP-visible).
//   - the cross-unit textarea gate (amendment 4): in contenteditable mode an
//     eligible root exposes NO `textarea-<ragId>` after the mode-change re-derive.
//
// The real-DOM click dispatch (the click → `handleOperatorEvent` →
// supervisor.dispatchEvent path) is renderer-dependent → documented in a
// `.skip` block (the mirror of the Unit K host convention); the handler BODY is
// node-tested directly via `new Function(body)`.
//
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, vi } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { handlerDef, compileHandlerBody } from 'provident-ssr/core/registry.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry, type PaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController, type EditController } from '../src/renderer/edit-controller.js'
import { buildTraversal } from '../src/main/traversal.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type ContentWindowTemplate } from '../src/main/template-store.js'
import type {
  RagSnapshotPayload,
  RagQueryResult,
  TemplateChangedPayload,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
  EditingMode,
} from '../src/shared/types.js'
import type { BacklinkResult } from '../src/main/backlinks.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

// ===========================================================================
// fixtures
// ===========================================================================
function makeNode(id: string, overrides: Partial<RagSnapshotPayload['nodes'][number]> = {}): RagSnapshotPayload['nodes'][number] {
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
  kind: string,
  source: string,
  target: string,
  overrides: Partial<RagSnapshotPayload['edges'][number]> = {},
): RagSnapshotPayload['edges'][number] {
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

/** A valid one-document snapshot whose single section `s1` is an ELIGIBLE `p`
 *  root (the cross-unit textarea gate target). documentIds derive to ['doc']. */
function singleSectionSnapshot(): RagSnapshotPayload {
  return {
    nodes: [
      makeNode('doc', { type: 'h1', content: 'Doc' }),
      makeNode('s1', { type: 'p', content: 'hello' }),
    ],
    edges: [
      makeEdge('e-hd', 'doc-head', 's1', 'doc', { documentIds: ['doc'] }),
      makeEdge('e-end', 'doc-end', 's1', 'doc', { documentIds: ['doc'] }),
    ],
  }
}

function placeholderEnvelope(): LegacyInitialData {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'wiki-root' },
        children: [
          { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

// ===========================================================================
// the mock bridge + the harness
// ===========================================================================
/** A fake `ProvidentBridge` with vi.fn() spies + controllable state. The
 *  `operatorSettings` namespace carries the NEW `onChanged` subscription. */
function makeBridge(opts: {
  snapshot?: RagSnapshotPayload
  operatorSettings?: OperatorSettings
} = {}) {
  const state = {
    snapshot: opts.snapshot ?? { nodes: [], edges: [] },
    operatorSettings: opts.operatorSettings ?? { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' },
  }
  const bridge = {
    security: {
      get: vi.fn(async (): Promise<SecuritySettings> => ({ token: null, enabled: ['read', 'dispatch'] })),
    },
    edit: {
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      onRagStoreChanged: vi.fn(() => () => {}),
    },
    rag: {
      query: vi.fn(async (q: string, topK?: number): Promise<RagQueryResult> =>
        ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: topK ?? 5 })),
      snapshot: vi.fn(async (): Promise<RagSnapshotPayload> => state.snapshot),
      backlinks: vi.fn(async (): Promise<BacklinkResult> =>
        ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] })),
      // Unit V3 — the doc-nav data source (the `rag-doc-heads` IPC).
      docHeads: vi.fn(async () => ({ documents: [] })),
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
  backRefs: Map<string, string[]>
  editController: EditController
  onRebuild: ReturnType<typeof vi.fn>
  sidebar: {
    operatorSet: (patch: OperatorSettingsPatch) => void
  }
}

function makeHarness(opts: {
  snapshot?: RagSnapshotPayload
  operatorSettings?: OperatorSettings
} = {}): Harness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const { bridge, state } = makeBridge(opts)
  let host: SidebarPanes
  const onRebuild = vi.fn(() => host.reDerive())
  const editController = createEditController({ backRefs, commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })), onRebuild })
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
    state,
    backRefs,
    editController,
    onRebuild,
    get sidebar() {
      return sidebar()
    },
  }
}

/** Await the re-derive that `onRebuild` (the host's `reDerive`) triggered. */
async function awaitRebuild(h: Harness): Promise<void> {
  const calls = h.onRebuild.mock.calls.length
  if (calls === 0) return
  const result = h.onRebuild.mock.results[calls - 1]
  if (result && typeof result.value?.then === 'function') await result.value
}

/** Invoke the host's `onOperatorSettingsChanged` (RED — the method does not
 *  exist yet, so this is reached via an any-cast and THROWS until implemented). */
function onOperatorSettingsChanged(h: Harness, payload: OperatorSettings): void {
  ;(h.host as unknown as { onOperatorSettingsChanged(p: OperatorSettings): void }).onOperatorSettingsChanged(payload)
}

/** The host's private fields (accessed for assertion). */
function privateOf(h: Harness): {
  editingMode: EditingMode
  lastOperatorSettings: OperatorSettings | null
  unsubSettings: (() => void) | null
} {
  return h.host as unknown as {
    editingMode: EditingMode
    lastOperatorSettings: OperatorSettings | null
    unsubSettings: (() => void) | null
  }
}

// ===========================================================================
// CENSUS / §3 — the new host method + the structural bridge surface
// ===========================================================================
describe('census — the U1 host additions (§3)', () => {
  it('SidebarPanes.prototype exposes onOperatorSettingsChanged (the NEW host method)', () => {
    const proto = Object.getOwnPropertyNames(SidebarPanes.prototype)
    expect(proto).toContain('onOperatorSettingsChanged')
  })

  it('the SidebarBridge operatorSettings structural surface includes onChanged (typecheck + runtime shape)', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    expect(h.bridge.operatorSettings.onChanged).toHaveBeenCalled()
  })
})

// ===========================================================================
// boot subscription — §1.3
// ===========================================================================
describe('boot — the operatorSettings.onChanged subscription (§1.3)', () => {
  it('boot subscribes via bridge.operatorSettings.onChanged with a handler and stores the unsubscribe handle (unsubSettings)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    expect(h.bridge.operatorSettings.onChanged).toHaveBeenCalledTimes(1)
    const handler = h.bridge.operatorSettings.onChanged.mock.calls[0][0]
    expect(typeof handler).toBe('function')
    expect(typeof privateOf(h).unsubSettings).toBe('function')
  })

  it('a settings change firing the boot-captured onChanged handler routes through onOperatorSettingsChanged (payload-authoritative — no re-fetch)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const handler = h.bridge.operatorSettings.onChanged.mock.calls[0]?.[0] as ((s: OperatorSettings) => void) | undefined
    expect(handler).toBeDefined() // RED — boot does not subscribe via operatorSettings.onChanged yet
    // The broadcast payload IS the store result (amendment A) — the host uses it
    // directly, no re-fetch. Mirror the real flow: the store was already updated
    // (that is why the broadcast fired), so the re-derive's refresh re-fetches
    // the same contenteditable value.
    h.state.operatorSettings.editingMode = 'contenteditable'
    handler!({ enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable' })
    await awaitRebuild(h)
    expect(privateOf(h).editingMode).toBe('contenteditable')
    expect(privateOf(h).lastOperatorSettings?.editingMode).toBe('contenteditable')
  })
})

// ===========================================================================
// F1 (adversarial) — the PERSISTED editingMode is applied at boot
// ===========================================================================
describe('F1 — a persisted contenteditable editingMode is honored at boot (not just after a broadcast)', () => {
  it('boot with a persisted contenteditable setting applies the splice to the FIRST load (the graph is in contenteditable mode) + the control reflects it', async () => {
    // The persisted store already carries contenteditable — there is NO broadcast
    // before/during boot (the only get was previously in refresh(), which boot
    // never calls, so editingMode used to stay 'textarea' until a broadcast).
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable' } })
    await h.host.boot(h.runtime)
    // The app graph is spliced at boot: the eligible root's textarea is gone.
    const htmlCE = h.runtime.renderedHtmlResult().renderedHtml
    expect(htmlCE).not.toContain('textarea-s1')
    expect(htmlCE).toContain('contenteditable')
    // The host state reflects the persisted mode.
    expect(privateOf(h).editingMode).toBe('contenteditable')
    expect(privateOf(h).lastOperatorSettings?.editingMode).toBe('contenteditable')
    // The control reflects the persisted mode (no control/graph mismatch).
    const opHtml = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(opHtml).toContain('editingMode: contenteditable')
    expect(opHtml).toContain('Switch to textarea')
    expect(opHtml).toContain('data-mode="textarea"')
  })

  it('F1 — boot fetches the operator settings via bridge.operatorSettings.get (so a persisted mode is read), not left to a later broadcast', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    expect(h.bridge.operatorSettings.get).toHaveBeenCalled()
  })

  it('F1 — a bridge error during the boot operator-settings fetch keeps the textarea default (never a crash / never aborts the boot)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    h.bridge.operatorSettings.get.mockRejectedValueOnce(new Error('boom'))
    await expect(h.host.boot(h.runtime)).resolves.toBeUndefined()
    expect(privateOf(h).editingMode).toBe('textarea')
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('textarea-s1') // textarea default still loads
  })
})

// ===========================================================================
// onOperatorSettingsChanged — §1.3 host contract
// ===========================================================================
describe('onOperatorSettingsChanged — the re-derive handler (§2.1 state 21)', () => {
  it('state 21 — a broadcast → the host uses the PAYLOAD as authoritative (NO re-fetch): sets lastOperatorSettings + editingMode from the payload → requestRebuild (onRebuild fires)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    h.bridge.operatorSettings.get.mockClear()
    h.onRebuild.mockClear()
    // Mirror the real flow: the store was already updated (the broadcast fired
    // post-SET), so the re-derive's refresh re-fetches the same contenteditable.
    h.state.operatorSettings.editingMode = 'contenteditable'
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    // The payload IS the store's result (amendment A) — the handler does NOT
    // re-fetch (a re-fetch is redundant + an async race with the sync requestRebuild).
    expect(h.bridge.operatorSettings.get).not.toHaveBeenCalled()
    await awaitRebuild(h)
    expect(privateOf(h).lastOperatorSettings?.editingMode).toBe('contenteditable')
    expect(privateOf(h).editingMode).toBe('contenteditable')
    expect(h.onRebuild).toHaveBeenCalled()
  })

  it('state 4 / §2.2 — a malformed/absent editingMode in the payload is defensively coerced to textarea, and the handler STILL rebuilds (no throw, no crash — the payload is authoritative, not dropped)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    // Since there is NO re-fetch, the old re-fetch-failure path is gone. A
    // malformed payload is coerced (not dropped) and the handler still rebuilds.
    expect(() => onOperatorSettingsChanged(h, { editingMode: 'bogus' } as OperatorSettings)).not.toThrow()
    expect(privateOf(h).editingMode).toBe('textarea')
    expect(h.onRebuild).toHaveBeenCalled()
  })

  it('ADR-2 / §2.2 state 3 — the payload IS authoritative (amendment A, no re-fetch): a contenteditable payload → host uses contenteditable + rebuilds; a junk/absent editingMode → textarea', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    // The payload IS the store's result — the host trusts it (no payload-vs-fetch
    // divergence). Mirror the real flow: the store is already contenteditable.
    h.state.operatorSettings.editingMode = 'contenteditable'
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    await awaitRebuild(h)
    expect(privateOf(h).editingMode).toBe('contenteditable')
    expect(privateOf(h).lastOperatorSettings?.editingMode).toBe('contenteditable')
    expect(h.onRebuild).toHaveBeenCalled()
    // A junk editingMode in the payload is defensively coerced → textarea.
    onOperatorSettingsChanged(h, { editingMode: 'junk' } as OperatorSettings)
    expect(privateOf(h).editingMode).toBe('textarea')
  })

  it('ADR-3 — a malformed editingMode value in the PAYLOAD is defensively coerced (only "contenteditable" passes; everything else → textarea)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    onOperatorSettingsChanged(h, { editingMode: 'bogus' as EditingMode } as OperatorSettings)
    await awaitRebuild(h)
    expect(privateOf(h).editingMode).toBe('textarea')
  })

  it('F2 (adversarial) — a null/undefined payload is guarded (never dereferenced / never throws): coerced to textarea, coerced lastOperatorSettings, and the handler STILL rebuilds', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    h.onRebuild.mockClear()
    expect(() => onOperatorSettingsChanged(h, null as unknown as OperatorSettings)).not.toThrow()
    expect(privateOf(h).editingMode).toBe('textarea')
    expect(privateOf(h).lastOperatorSettings?.editingMode).toBe('textarea')
    expect(h.onRebuild).toHaveBeenCalled()
    h.onRebuild.mockClear()
    expect(() => onOperatorSettingsChanged(h, undefined as unknown as OperatorSettings)).not.toThrow()
    expect(privateOf(h).editingMode).toBe('textarea')
    expect(h.onRebuild).toHaveBeenCalled()
  })
})

// ===========================================================================
// the mode swap + the fresh re-derive — §2.1 states 22/23 + U3 F1 + §2.2 state 10
// ===========================================================================
describe('the mode swap in the app graph (§2.1 state 22)', () => {
  it('a contenteditable mode-change re-derive splices an ELIGIBLE root (textarea removed + contenteditable true); a textarea mode is a no-op', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    // Baseline (textarea default): the eligible root shows its textarea.
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('textarea-s1')
    // Switch to contenteditable via the re-derive path (the payload IS the store result).
    h.bridge.rag.snapshot.mockClear()
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    await awaitRebuild(h)
    const htmlCE = h.runtime.renderedHtmlResult().renderedHtml
    expect(htmlCE).not.toContain('textarea-s1') // the splice removed the textarea
    expect(htmlCE).toContain('contenteditable') // contenteditable: true is authored
  })

  it('state 23 + U3 F1 — a mode toggle triggers a FRESH re-derive (buildTraversalEnvelope re-runs: a snapshot fetch happens), NOT a refresh-over-cache', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    h.bridge.rag.snapshot.mockClear()
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    await awaitRebuild(h)
    // A fresh re-derive re-traverses → it fetches the snapshot (refresh() would NOT).
    expect(h.bridge.rag.snapshot).toHaveBeenCalled()
  })

  it('state 23 + §2.2 state 10 — a contenteditable→textarea round-trip RESTORES the textareas (no stale cached-envelope reuse)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    // contenteditable → textarea removed.
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    await awaitRebuild(h)
    expect(h.runtime.renderedHtmlResult().renderedHtml).not.toContain('textarea-s1')
    // textarea → the fresh traversal re-emits the textarea.
    onOperatorSettingsChanged(h, { editingMode: 'textarea' } as OperatorSettings)
    await awaitRebuild(h)
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('textarea-s1')
  })
})

// ===========================================================================
// the dirty-edit guard + the no-re-derive-loop — §2.1 state 25 + §2.2 state 8
// ===========================================================================
describe('the mode-toggle routing (§2.1 state 25, §2.2 state 8)', () => {
  it('state 25 — a mode toggle while a control is DIRTY is QUEUED by requestRebuild (not lost, not dropped); it runs once the dirty control clears', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    h.editController.markDirty('n1')
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild).not.toHaveBeenCalled()
    h.editController.clearDirty('n1')
    expect(h.onRebuild).toHaveBeenCalledTimes(1)
  })

  it('state 8 / ADR-1 — NO re-derive loop: reDerive does NOT write settings (no bridge.operatorSettings.set during a re-derive), so one settings change can never re-trigger the broadcast', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    h.bridge.operatorSettings.set.mockClear()
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    await awaitRebuild(h)
    // The re-derive path re-reads settings (get) but NEVER writes them (set).
    expect(h.bridge.operatorSettings.set).not.toHaveBeenCalled()
    // A redundant toggle still re-derives harmlessly (idempotent — one rebuild).
    expect(h.onRebuild.mock.calls.length).toBeGreaterThan(0)
  })

  it('F4 (adversarial) — two onOperatorSettingsChanged calls in RAPID succession coalesce through the re-derive in-flight guard (ONE coalesced traversal, NOT two interleaved ones / §2.2 state 11)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    h.bridge.rag.snapshot.mockClear()
    h.onRebuild.mockClear()
    // Fire two settings changes back-to-back WITHOUT awaiting (rapid double-fire).
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    // Both routed through requestRebuild → onRebuild (reDerive). The FIRST starts
    // the traversal; the SECOND hits the reDeriveInFlight guard and is QUEUED —
    // never run as a second interleaved/parallel traversal.
    expect(h.onRebuild).toHaveBeenCalledTimes(2)
    // Let both settle: the initial traversal + the single coalesced queued run.
    await h.onRebuild.mock.results[0].value
    await h.onRebuild.mock.results[1].value
    // Exactly ONE coalesced extra traversal: the snapshot was fetched by the
    // initial run + ONE queued run (2 total) — NOT an interleaved 3+ cascade.
    expect(h.bridge.rag.snapshot).toHaveBeenCalledTimes(2)
    // The last (authoritative) mode wins.
    expect(privateOf(h).editingMode).toBe('contenteditable')
  })
})

// ===========================================================================
// the Settings control (button-toggle) — §1.4 + §2.1 states 26/28 + §2.2 state 9
// ===========================================================================
describe('the button-toggle control in settingsContent (§1.4)', () => {
  it('state 28 — default (lastOperatorSettings null): text div "editingMode: textarea", button "Switch to contenteditable", data-mode="contenteditable", NO checked/selected prop', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    // boot does not set lastOperatorSettings (null) → the textarea default.
    const opHtml = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(opHtml).toContain('operator-editing-mode')
    expect(opHtml).toContain('editingMode: textarea')
    expect(opHtml).toContain('operator-editing-mode-toggle')
    expect(opHtml).toContain('Switch to contenteditable')
    expect(opHtml).toContain('data-mode="contenteditable"')
    // The pivot: NO boolean-attribute form state is authored.
    expect(opHtml).not.toContain('checked')
    expect(opHtml).not.toContain('selected')
  })

  it('state 26 — current mode contenteditable: text div "editingMode: contenteditable", button "Switch to textarea", data-mode="textarea"', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable' } })
    await h.host.boot(h.runtime)
    // A re-derive populates lastOperatorSettings from the store (contenteditable).
    await h.host.reDerive()
    const opHtml = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(opHtml).toContain('editingMode: contenteditable')
    expect(opHtml).toContain('Switch to textarea')
    expect(opHtml).toContain('data-mode="textarea"')
  })

  it('F-2 regression (blind-greens) — the broadcast-driven re-derive re-renders the operator control to the NEW stored mode: the textarea-default store boots, a post-SET contenteditable is fired through onOperatorSettingsChanged, and after the awaited re-derive BOTH the app graph splices AND the mounted control shows contenteditable', async () => {
    // The blind-greens F-2 finding: after a realistic toggle the app-graph splice
    // was correct but the mounted operator control stayed stale. This drives the
    // EXACT blind flow end-to-end and asserts BOTH halves — the state-22 app-graph
    // splice (no textarea-s1, contenteditable present) + the state-26 control
    // (editingMode: contenteditable / Switch to textarea / data-mode="textarea").
    const h = makeHarness({ snapshot: singleSectionSnapshot() }) // textarea-default store
    await h.host.boot(h.runtime)
    // Baseline (textarea-default store): the graph shows the textarea + the
    // control advertises textarea.
    expect(h.runtime.renderedHtmlResult().renderedHtml).toContain('textarea-s1')
    expect((h.operatorMount as unknown as { innerHTML: string }).innerHTML).toContain('editingMode: textarea')
    // Mimic a post-SET store (the real main store already holds contenteditable
    // because set() resolved — that is why the broadcast fired), so the
    // re-derive's refresh() re-fetch returns contenteditable.
    h.state.operatorSettings.editingMode = 'contenteditable'
    onOperatorSettingsChanged(h, { editingMode: 'contenteditable' } as OperatorSettings)
    await awaitRebuild(h)
    // The app graph spliced (state-22 convention).
    const htmlCE = h.runtime.renderedHtmlResult().renderedHtml
    expect(htmlCE).not.toContain('textarea-s1')
    expect(htmlCE).toContain('contenteditable')
    // The operator control reflects the new stored mode (state-26 convention).
    const opHtml = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    expect(opHtml).toContain('editingMode: contenteditable')
    expect(opHtml).toContain('Switch to textarea')
    expect(opHtml).toContain('data-mode="textarea"')
  })

  it('state 9 / ADR-7 — the control is OPERATOR-scope: it renders in the operator mount but is ABSENT from the app Runtime (never MCP-visible)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    expect((h.operatorMount as unknown as { innerHTML: string }).innerHTML).toContain('operator-editing-mode-toggle')
    const appHtml = h.runtime.renderedHtmlResult().renderedHtml
    expect(appHtml).not.toContain('operator-editing-mode-toggle')
    expect(appHtml).not.toContain('operator-editing-mode')
  })

  it('the existing 3 display-only divs are PRESERVED (the toggle is ADDED, not a replacement)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const opHtml = (h.operatorMount as unknown as { innerHTML: string }).innerHTML
    for (const id of ['operator-enabled-panes', 'operator-default-document', 'operator-topk']) {
      expect(opHtml).toContain(id)
    }
  })
})

// ===========================================================================
// the handler body — §1.4 + §2.1 state 27 + §2.2 state 5 (ADR-5)
// ===========================================================================
describe('the OPERATOR_EDITING_MODE_TOGGLE handler body (§2.1 state 27, §2.2 state 5)', () => {
  /** Execute the registered toggle handler body with a mock ctx + a mock
   *  window.provident.sidebar (the host binds the body via registerHandlerDef).
   *  F3 (adversarial): the body is resolved with `compileHandlerBody` — the app
   *  Runtime's mechanism (`new Function('return (' + src + ')')()`) — proving
   *  the registered body is compileHandlerBody-compatible (a SyntaxError here
   *  is the F3 red signal for the inner-statements form). */
  function runToggleBody(dataMode: unknown): { calls: OperatorSettingsPatch[] } {
    const h = makeHarness()
    h.host.bindHandlers()
    const def = handlerDef('operator-editing-mode-toggle')
    expect(def).toBeDefined()
    const calls: OperatorSettingsPatch[] = []
    const fakeWindow = { provident: { sidebar: { operatorSet: (p: OperatorSettingsPatch) => calls.push(p) } } }
    ;(globalThis as unknown as { window?: unknown }).window = fakeWindow
    const fn = compileHandlerBody(String(def!.body)) as (ctx: unknown) => void
    fn({ node: { props: { 'data-mode': dataMode } } })
    return { calls }
  }

  it('state 27 — a valid data-mode "contenteditable" → sidebar.operatorSet({ editingMode: "contenteditable" })', () => {
    const { calls } = runToggleBody('contenteditable')
    expect(calls).toEqual([{ editingMode: 'contenteditable' }])
  })

  it('state 27b — a valid data-mode "textarea" → operatorSet({ editingMode: "textarea" })', () => {
    const { calls } = runToggleBody('textarea')
    expect(calls).toEqual([{ editingMode: 'textarea' }])
  })

  it('ADR-5 — the handler reads data-mode, NOT the dispatched click value (a button\'s value is empty on click)', () => {
    // The body is invoked with a node carrying data-mode but NO value prop; it
    // still dispatches from data-mode.
    const { calls } = runToggleBody('contenteditable')
    expect(calls).toEqual([{ editingMode: 'contenteditable' }])
  })

  it('state 5 — a JUNK data-mode ("foo") is DROPPED (no operatorSet call, no write)', () => {
    const { calls } = runToggleBody('foo')
    expect(calls).toEqual([])
  })
})

// ===========================================================================
// the operatorSet simplification — §1.4 + §2.1 state 30
// ===========================================================================
describe('operatorSet simplification (§2.1 state 30, §1.4)', () => {
  it('state 30 — operatorSet({ editingMode }) fires bridge.operatorSettings.set(patch) and does NOT call mountOperator / does NOT update lastOperatorSettings inline (the broadcast drives both)', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot(), operatorSettings: { enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'textarea' } })
    await h.host.boot(h.runtime)
    const mountSpy = vi.spyOn(h.host as unknown as { mountOperator(): void }, 'mountOperator')
    const before = privateOf(h).lastOperatorSettings
    h.sidebar.operatorSet({ editingMode: 'contenteditable' })
    expect(h.bridge.operatorSettings.set).toHaveBeenCalledWith({ editingMode: 'contenteditable' })
    // The simplification removes the inline re-mount + the inline settings
    // update. Await the set promise + a microtask flush so the OLD
    // `.then(settings => { lastOperatorSettings = settings; mountOperator() })`
    // behavior (if it existed) would ALSO have fired by now — this must hold.
    await h.bridge.operatorSettings.set.mock.results[0].value
    await Promise.resolve()
    expect(mountSpy).not.toHaveBeenCalled()
    expect(privateOf(h).lastOperatorSettings).toBe(before)
    mountSpy.mockRestore()
  })

  it('F5 (adversarial) — operatorSet catches a REJECTED bridge.set (no unhandled rejection; the error is logged via console.error)', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)
    h.bridge.operatorSettings.set.mockRejectedValueOnce(new Error('boom'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let unhandled: unknown = null
    const onUnhandled = (reason: unknown): void => { unhandled = reason }
    process.on('unhandledRejection', onUnhandled)
    try {
      // Fire the set; the bridge.set promise REJECTS. Without the F5 .catch this
      // is an unhandled rejection (a footgun the adversarial review flagged).
      h.sidebar.operatorSet({ editingMode: 'contenteditable' })
      // Let the rejected promise + the operatorSet .catch run to completion
      // (do NOT await the raw rejected mock promise — that would rethrow here).
      await Promise.resolve()
      await Promise.resolve()
      // The .catch handled the rejection → logged, NOT surfaced as unhandled.
      expect(errSpy).toHaveBeenCalledWith('[sidebar-panes] operator settings set failed', expect.any(Error))
      expect(unhandled).toBeNull()
    } finally {
      process.off('unhandledRejection', onUnhandled)
      errSpy.mockRestore()
    }
  })
})

// ===========================================================================
// the end-to-end click-path equivalent — §2.1 state 29
// ===========================================================================
describe('the end-to-end mode-toggle path (§2.1 state 29)', () => {
  it('operatorSet → SET → onChanged broadcast handler → onOperatorSettingsChanged → re-derive → mode swap', async () => {
    const h = makeHarness({ snapshot: singleSectionSnapshot() })
    await h.host.boot(h.runtime)
    const handler = h.bridge.operatorSettings.onChanged.mock.calls[0]?.[0] as ((s: OperatorSettings) => void) | undefined
    expect(handler).toBeDefined() // RED — boot does not subscribe yet
    // The user clicks the toggle in textarea mode → operatorSet({ editingMode: 'contenteditable' }).
    h.sidebar.operatorSet({ editingMode: 'contenteditable' })
    expect(h.bridge.operatorSettings.set).toHaveBeenCalledWith({ editingMode: 'contenteditable' })
    // The main store SET resolves; main broadcasts operator-settings-changed →
    // the boot-captured onChanged handler fires with the store result (the
    // payload IS authoritative — amendment A).
    handler({ enabledPanes: [], defaultDocumentId: null, topK: 5, editingMode: 'contenteditable' })
    await awaitRebuild(h)
    expect(privateOf(h).editingMode).toBe('contenteditable')
    // The mode swap applied to the app graph.
    expect(h.runtime.renderedHtmlResult().renderedHtml).not.toContain('textarea-s1')
  })
})

// ===========================================================================
// Renderer-dependent (the real DOM click → handleOperatorEvent → supervisor
// dispatch path) — documented, NOT runnable in node. The handler BODY + the
// rendered control props + the operatorSet bridge path are node-tested above.
// ===========================================================================
describe.skip('renderer-dependent — the real DOM click dispatch (verified by code review / the e2e battery, not node-testable)', () => {
  it.skip('a DOM click on the operator-editing-mode-toggle button dispatches operator-editing-mode-toggle → operatorSet({ editingMode })', () => {})
  it.skip('the toggle control is absent from the app Runtime MCP surface (list_targets / get_rendered_html / get_markdown / dispatch)', () => {})
})
