// tests/unit-live4-empty-store-landing.test.ts — Unit U-LIVE4: the empty-store
// landing co-authored INTO the pane-inclusive envelope (the LIVE-4 fix-spec).
//
// TestWriter RED set written from docs/specs/unit-live4-empty-store-landing.md
// §2 (INV-E1..E4) + §3 (F-L4-1..6) + §6 (the 7 red tests). The owning spec's
// §2.3 / state 10 is docs/specs/unit-u-shell-9a-main-focus-tabs.md. Nothing on
// the current (unfixed) tree has these invariants:
//
//   - `emptyStoreEnvelope()` (:2336-2342) returns a bare `DEFAULT_CONTENT_WINDOW`
//     envelope with `content: []` (:2339) — no landing authored into `content`
//     (§6 red test 2 / F-L4-3).
//   - `buildTraversalEnvelope(snapshot, [])` hits the `documentIds.length === 0`
//     branch (:2371-2374) → the bare-empty envelope, so the empty-boot assembly
//     is toolbar+panes with an EMPTY content zone — no `#stage-landing` (§6 red
//     tests 1/6 / F-L4-1/F-L4-5).
//   - `lastTraversalEnvelope` after an empty boot is that bare-empty envelope, so
//     a later `refresh()` / template re-derive reassembles the bare `content: []`
//     env — the landing is never present (§6 red tests 3/5 / F-L4-4).
//   - a still-empty content re-derive (`applyContentChange`) over the boot-co-
//     authored envelope never shows a landing today because the boot never
//     co-authored one (§6 red test 4 / F-L4-2).
//
// HOST-boot harness PATTERN borrowed from tests/unit-u-shell-9a-main-focus-tabs.test.ts
// (`stageHarness`) + tests/unit-u-shell-9b-w2n15-rederive-scope.test.ts
// (`runtime.materializedContentRoots()` graph inspection). The private
// empty-store seams named by the spec (§4 read-only pins) are reached on the
// instance via cast (TypeScript-private members exist at runtime; tests are
// excluded from `tsc --noEmit`, tsconfig `"exclude": ["tests"]`).
//
// NOTE on re-derive coverage (§6 tests 4/5 and the §6.7 stability check): the
// repopulate paths are exercised WITHOUT a manual `mountTab` first. A manual
// `applyStageBody`-driven mount on the CURRENT tree transiently overwrites
// `lastTraversalEnvelope` with the landing-only envelope, which spuriously
// makes a following re-derive keep the landing (green). The fix's intent is the
// BOOT-CO-AUTHORED landing (INV-E1) surviving the §2.2/§2.3 repopulate — so the
// red tests boot, then re-derive/refresh, and assert the landing is present.
//
// State machine covered (from §6 + INV-E1..E4):
//   S1  empty-store boot (no documents, no stores, no persisted tabs)  → INV-E1
//   S2  emptyStoreEnvelope()/buildTraversalEnvelope(snap, []) direct  → INV-E1
//   S3  lastTraversalEnvelope after empty boot (reload source)         → INV-E3
//   S4  still-empty RAG content re-derive (reDerive("content"))       → INV-E2
//   S5  template re-derive (reDerive("template")) / refresh()         → INV-E3
//   S6  co-existence: landing + editor-toolbar + panes in ONE graph    → INV-E1
//   S7  TRUE-empty-store tab resolution + landing stable over re-derive → INV-E4
// Fail-states pinned: F-L4-1 (landing absent at boot), F-L4-2 (landing lost on
// a still-empty content re-derive), F-L4-3 (bare-empty empty-store traversal),
// F-L4-4 (rederive/refresh drops to bare-empty), F-L4-5 (mutually-exclusive
// stage-body-or-panes), F-L4-6 (non-landing tab mount must not regress).
import { describe, it, expect } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-shape.js'
import { resolveDefaultTarget, ensureFirstTab, defaultTabState, TAB_LANDING, type TabEntry } from '../src/renderer/tab-state.js'

// The app-graph panes that render as `.pane-frame[data-pane-id]` (the §4 census
// app-graph pane set). Enabled so the co-existence surface is observable.
const APP_GRAPH_PANES = ['doc-nav', 'crosslinks', 'search', 'template-editor']

// ---------------------------------------------------------------------------
// The empty-store SidebarPanes host harness (the unit-9a stageHarness pattern;
// booted on a ZERO-document snapshot — no stores, no documents, no persisted
// tabs — with the app-graph panes enabled for the co-existence surface).
// ---------------------------------------------------------------------------
interface EmptyHarness {
  host: SidebarPanes
  runtime: Runtime
  mount: unknown
}

function emptyHarness(): EmptyHarness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  // A TRUE empty store: no doc-head edges, no docHeads, no store listing.
  const snapshot = { nodes: [], edges: [] }
  const docHeads = { documents: [] }
  const operatorSettings: Record<string, unknown> = {
    enabledPanes: APP_GRAPH_PANES,
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

// ---------------------------------------------------------------------------
// Inspection helpers.
// ---------------------------------------------------------------------------

/** The private empty-store seams the spec pins (§4 read-only pins). */
interface EmptySeams {
  emptyStoreEnvelope(): LegacyInitialData
  buildTraversalEnvelope(snapshot: unknown, documentIds: string[]): LegacyInitialData
  lastTraversalEnvelope: LegacyInitialData | null
}
function seams(host: SidebarPanes): EmptySeams {
  return host as unknown as EmptySeams
}

function contentRootIds(runtime: Runtime): string[] {
  return runtime
    .materializedContentRoots()
    .map((r) => (r.props as { id?: unknown } | undefined)?.id)
    .filter((id): id is string => typeof id === 'string')
}

/** Materialized `.pane-frame[data-pane-id]` (or `pane-`-prefixed) roots. */
function paneRootIds(runtime: Runtime): string[] {
  return runtime
    .materializedContentRoots()
    .filter(
      (r) =>
        (r.props as { 'data-pane-id'?: unknown } | undefined)?.['data-pane-id'] !== undefined ||
        (typeof (r.props as { id?: unknown } | undefined)?.id === 'string' &&
          (r.props as { id: string }).id.startsWith('pane-')),
    )
    .map((r) => ((r.props as { id?: unknown } | undefined)?.id as string | undefined) ?? 'pane')
}

function domHtml(h: EmptyHarness): string {
  return (h.mount as unknown as { innerHTML: string }).innerHTML
}

/** The root of `content[0]` of a traversal envelope (the §2.1 payload root). */
function firstPayloadRoot(env: LegacyInitialData): LegacyNodeData | undefined {
  const content = env.content as Array<{ content?: LegacyNodeData[] }> | undefined
  return content?.[0]?.content?.[0]
}

/** Asserts the rendered DOM carries the landing + editor-toolbar + pane frames. */
function expectCoexistence(h: EmptyHarness): void {
  const html = domHtml(h)
  expect(html).toMatch(/stage-landing/)
  expect(html).toMatch(/data-stage="landing"/)
  expect(html).toContain('editor-toolbar')
  expect(html).toMatch(/pane-frame/)
  expect(html).toMatch(/data-pane-id/)
}

function landingEntry(id = 'landing-tab'): TabEntry {
  return { id, target: { kind: 'other', id: 'landing' }, title: 'Landing' }
}

// ===========================================================================
// §6 RED TEST 1 — boot-assembly carries the landing in the SAME envelope.
// INV-E1 / F-L4-1 / F-L4-5.
// ===========================================================================
describe('U-LIVE4 §6.1 — empty-boot assembly contains #stage-landing in ONE pane-inclusive envelope', () => {
  it('RED — after empty boot the ONE assembled graph holds the landing root + editor-toolbar + pane frames', async () => {
    const h = emptyHarness()
    await h.host.boot(h.runtime)

    // The landing root as a payload in the SAME loaded graph (not an empty content
    // zone — F-L4-1 — and not a separate competing loadAppGraph — F-L4-5).
    expect(contentRootIds(h.runtime)).toContain('stage-landing')
    expect(paneRootIds(h.runtime).length).toBeGreaterThanOrEqual(1)

    // Rendered co-presence: landing AND toolbar AND pane frames together.
    expectCoexistence(h)
  })
})

// ===========================================================================
// §6 RED TEST 2 — emptyStoreEnvelope()/buildTraversalEnvelope(snap,[]) is NOT
// bare-empty. INV-E1 / F-L4-3.
// ===========================================================================
describe('U-LIVE4 §6.2 — the empty-store traversal envelope is landing-authored (NOT bare-empty)', () => {
  it('RED — emptyStoreEnvelope() carries the #stage-landing payload in content[0]', async () => {
    const h = emptyHarness()
    const env = seams(h.host).emptyStoreEnvelope()
    // P-IM-1: content.length === 1 and the root of content[0] is the landing div.
    expect(env.content).toHaveLength(1)
    const root = firstPayloadRoot(env)
    expect(root?.props?.['data-stage']).toBe('landing')
    expect((root?.props as { id?: unknown } | undefined)?.id).toBe('stage-landing')
  })

  it('RED — buildTraversalEnvelope(snapshot, []) on a zero-document snapshot authors the landing (never bare content: [])', async () => {
    const h = emptyHarness()
    const env = seams(h.host).buildTraversalEnvelope({ nodes: [], edges: [] }, [])
    expect(env.content).toHaveLength(1)
    const root = firstPayloadRoot(env)
    expect(root?.props?.['data-stage']).toBe('landing')
    expect((root?.props as { id?: unknown } | undefined)?.id).toBe('stage-landing')
    // F-L4-3 — NOT the bare `template`/`clientConfig` envelope with content: [].
    expect(env.content).not.toEqual([])
  })
})

// ===========================================================================
// §6 RED TEST 3 — lastTraversalEnvelope after empty boot is the LANDING
// envelope. INV-E3 / P-SM-1 / F-L4-4.
// ===========================================================================
describe('U-LIVE4 §6.3 — lastTraversalEnvelope after an empty boot is the landing envelope', () => {
  it('RED — the stored reload source carries the #stage-landing payload, not content: []', async () => {
    const h = emptyHarness()
    await h.host.boot(h.runtime)
    const last = seams(h.host).lastTraversalEnvelope
    // The source a `refresh()`/template re-derive reloads must repopulate the
    // landing (INV-E3), so it must carry the payload, not a bare empty env.
    expect(last).not.toBeNull()
    const root = firstPayloadRoot(last as LegacyInitialData)
    expect(root?.props?.['data-stage']).toBe('landing')
    expect((root?.props as { id?: unknown } | undefined)?.id).toBe('stage-landing')
  })
})

// ===========================================================================
// §6 RED TEST 4 — survives reDerive('content'). INV-E2 / F-L4-2.
// ===========================================================================
describe('U-LIVE4 §6.4 — a still-empty content re-derive keeps #stage-landing (INV-E2 / F-L4-2)', () => {
  it('RED — after reDerive("content") at a still-empty store the boot co-authored landing stays mounted with panes + toolbar intact', async () => {
    const h = emptyHarness()
    await h.host.boot(h.runtime)

    await h.host.reDerive('content')

    // INV-E2: repopulated in place — no teardown; landing + panes + toolbar intact.
    expectCoexistence(h)
  })
})

// ===========================================================================
// §6 RED TEST 5 — survives reDerive('template') / refresh(). INV-E3 / F-L4-4.
// ===========================================================================
describe('U-LIVE4 §6.5 — a template-class re-derive / refresh() repopulates the landing (INV-E3 / F-L4-4)', () => {
  it('RED — a template re-derive at a still-empty store reassembles the landing from lastTraversalEnvelope', async () => {
    const h = emptyHarness()
    await h.host.boot(h.runtime)

    await h.host.reDerive('template')

    // INV-E3 — re-renders #stage-landing again (never a bare content: [] env).
    expectCoexistence(h)
  })

  it('RED — refresh() at a still-empty store repopulates the landing from lastTraversalEnvelope', async () => {
    const h = emptyHarness()
    await h.host.boot(h.runtime)

    await h.host.refresh()

    expectCoexistence(h)
  })
})

// ===========================================================================
// §6 RED TEST 6 — co-existence: landing + panes + toolbar in ONE graph.
// INV-E1 / F-L4-5.
// ===========================================================================
describe('U-LIVE4 §6.6 — landing + editor-toolbar + panes co-exist (never mutually-exclusive)', () => {
  it('RED — the ONE loaded graph at empty boot carries the landing root AND the toolbar AND ≥1 pane frame simultaneously', async () => {
    const h = emptyHarness()
    await h.host.boot(h.runtime)

    // P-SM-2 / F-L4-5 — the landing root, the toolbar, and the pane roots are all
    // resident together; stage-body XOR panes (the two-loader pre-fix state) is the
    // failure.
    expect(contentRootIds(h.runtime)).toContain('stage-landing')
    expect(paneRootIds(h.runtime).length).toBeGreaterThanOrEqual(1)
    expectCoexistence(h)
  })
})

// ===========================================================================
// §6 RED TEST 7 — TRUE-empty-store tab resolution → TAB_LANDING + the landing
// is STABLE over the §2.2/§2.3 repopulate paths. INV-E4.
// (resolution + mountTab are green today; the boot-co-authored stability is red)
// ===========================================================================
describe('U-LIVE4 §6.7 — TRUE-empty-store tab resolution → TAB_LANDING + mountTab renders #stage-landing STABLY', () => {
  it('RED — resolution is total to the landing tab; the boot co-authored landing is present AND stable after a re-derive', async () => {
    // --- Resolution (green today) ---
    const h = emptyHarness()
    await h.host.boot(h.runtime)
    const ctx = h.host.getTabContext()
    expect(ctx.hasStore).toBe(false)
    expect(ctx.documents).toEqual([])
    expect(resolveDefaultTarget(ctx)).toEqual(TAB_LANDING)
    const firstTab = ensureFirstTab(defaultTabState(), ctx)
    expect(firstTab.open.map((t) => t.target)).toEqual([TAB_LANDING])
    expect(firstTab.activeId).toBe(firstTab.open[0]?.id ?? null)

    // --- mountTab on the landing target renders the §2.1 body (INV-E4) ---
    // A fresh harness so this transient mount cannot clobber the stability check.
    const m = emptyHarness()
    await m.host.boot(m.runtime)
    m.host.mountTab(landingEntry())
    expect(domHtml(m)).toContain('stage-landing')
    expect(domHtml(m)).toMatch(/data-stage="landing"/)

    // --- STABILITY (RED today) --- the boot co-authored landing must STICK
    // after the §2.2/§2.3 repopulate paths. Today the boot never co-authored it,
    // so after reDerive("content") no landing is present.
    await h.host.reDerive('content')
    expectCoexistence(h)
  })
})
