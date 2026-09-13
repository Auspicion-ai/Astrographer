// tests/unit-u-shell-9a-main-focus-tabs.test.ts — Unit U-SHELL-9a: the
// main-focus tab strip + focus-descriptor model + the C9 `tabs` slice +
// single-active render + the new-tab/default rules (W2-Q11) + the `search`
// pane-first behavior (§2.6) + the MCP focus tool `provident.focus` (§2.7).
//
// TestWriter RED set written from
// docs/specs/unit-u-shell-9a-main-focus-tabs.md §2 (contract), §3 (states) +
// §4 (fail-states) + §5 (census), with the W2-Q11/Q12 resolutions from
// docs/specs/wave-2-open-decisions.md and the DECIDED rows
// (UI-CONFIG-CARRIER/C9, MCP-FOCUS-TOOL) in docs/decisions.md. Nothing here is
// implemented yet:
//
//   - `src/renderer/tab-state.ts` (the new pure model module) does not exist
//     (dynamic import → RED). It must expose the spec §2.2 `TabTarget`/
//     `TabEntry`/`TabState` types + the pure focus-selection/close/reorder/
//     default-resolution helpers.
//   - `src/main/operator-settings-store.ts` has no `tabs` slice (spec §2.5):
//     `sanitize` drops it and `get()` never returns it.
//   - `src/shared/types.ts` `OperatorSettings`/`OperatorSettingsPatch` lack the
//     additive `tabs` field (spec §2.5).
//   - `src/main/mcp-server.ts` `ALL_TOOLS` lacks `provident.focus`; the SDK
//     tool row + handler do not exist (spec §2.7).
//   - `src/main/security.ts` `TOOL_GROUPS` lacks `provident.focus` (RED —
//     `groupForTool` resolves null).
//   - `src/renderer/pane-graph.ts` `searchContent` has no pane-first
//     expand-into-a-full-tab control (spec §2.6).
//
// Behavior derived from the spec ALONE. The spec does NOT pin the new model
// module's file name or its helper names (the U-SHELL-1 spec §5 DID name
// `src/renderer/layout-state.ts`; this spec names no file). The RED report
// flags every seam name pinned below as a SPEC AMBIGUITY; the module follows
// the landed `layout-state.ts` convention (`coerceTabState`/`defaultTabState`/
// `TAB_STATE_VERSION`). The concrete named surfaces (`createOperatorSettingsStore`,
// `ProvidentMcpServer.ALL_TOOLS`, `groupForTool`, `searchContent`) are the
// spec's own §6 build references.
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createOperatorSettingsStore, type OperatorSettingsStore } from '../src/main/operator-settings-store.js'
import { groupForTool, toolAllowed, SecurityGate, type ToolGroup } from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'
import { searchContent, SEARCH_RESULT_OPEN_HANDLER, searchTabContent } from '../src/renderer/pane-graph.js'
import { TabStrip } from '../src/renderer/tab-strip.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { Runtime } from '../src/renderer/runtime.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-shape.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'

// ---------------------------------------------------------------------------
// Spec §2.2 — the model (mirrored locally; the module is RED, so these are the
// contract the test pins). `TabTarget` kinds + `TabEntry` + `TabState` shape.
// ---------------------------------------------------------------------------
type TabTarget =
  | { kind: 'document'; documentId: string }
  | { kind: 'search'; queryId: string }
  | { kind: 'graph'; view: string }
  | { kind: 'template'; templateId: string }
  | { kind: 'other'; id: string }

interface TabSearchParams {
  query: string
  topK?: number
  mode?: 'flat' | 'graph'
  maxHops?: number
  expand?: 'none' | 'parent'
  maxParentContext?: number
  filters?: unknown
  stores?: 'all'
}

interface TabEntry {
  id: string
  target: TabTarget
  title: string
  /** §2.6 — the search tab owns its `rag.query` params once opened. */
  search?: TabSearchParams
}

interface TabState {
  version: number
  open: TabEntry[]
  activeId: string | null
  order: string[]
}

/** §2.4 — the default-resolution context: the focused store's documents + the
 *  previous session's most-recently-focused document. `hasStore:false` ⇒ the
 *  no-store landing listing of available wikis. */
interface TabDefaultContext {
  hasStore: boolean
  lastFocusedDocumentId?: string | null
  documents: Array<{ documentId: string; title: string }>
}

// ---------------------------------------------------------------------------
// The new module (spec §2.2/§5) — dynamic import so a missing module fails each
// spec test individually (the U-SHELL-1 convention) rather than erroring the
// whole file.
// ---------------------------------------------------------------------------
interface TabStateModule {
  TAB_STATE_VERSION: number
  defaultTabState(): TabState
  coerceTabState(value: unknown): TabState
  targetEquals(a: TabTarget, b: TabTarget): boolean
  coerceTabTarget(value: unknown): TabTarget | null
  activeTab(state: TabState): TabEntry | null
  focusTarget(
    state: TabState,
    target: TabTarget,
    opts?: { newTab?: boolean; title?: string; id?: string; search?: TabSearchParams },
  ): TabState
  openTab(state: TabState, target: TabTarget | null, ctx?: TabDefaultContext): TabState
  closeTab(state: TabState, id: string): TabState
  reorderTab(state: TabState, id: string, toIndex: number): TabState
  setSearchParams(state: TabState, tabId: string, params: TabSearchParams): TabState
  resolveDefaultTarget(ctx: TabDefaultContext): TabTarget | null
  ensureFirstTab(state: TabState, ctx: TabDefaultContext): TabState
}

async function loadTabStateModule(): Promise<TabStateModule> {
  try {
    return (await import('../src/renderer/tab-state.js')) as unknown as TabStateModule
  } catch (e) {
    throw new Error(
      'src/renderer/tab-state.ts not implemented (U-SHELL-9a RED — needs the Implementer)',
      { cause: e },
    )
  }
}

// ---------------------------------------------------------------------------
// Fixtures.
// ---------------------------------------------------------------------------
const LANDING: TabTarget = { kind: 'other', id: 'landing' }

function docTarget(documentId: string): TabTarget {
  return { kind: 'document', documentId }
}
function searchTarget(queryId: string): TabTarget {
  return { kind: 'search', queryId }
}

function entry(id: string, target: TabTarget, title = id): TabEntry {
  return { id, target, title }
}

function makeState(partial: Partial<TabState> = {}): TabState {
  return {
    version: 1,
    open: [],
    activeId: null,
    order: [],
    ...partial,
  }
}

/** A state with `ids` open, in `order`, active on `activeId` (or the first). */
function stateWith(
  ids: string[],
  targets: Record<string, TabTarget> = {},
  activeId: string | null = ids[0] ?? null,
  order: string[] = ids,
): TabState {
  return makeState({
    open: ids.map((id) => entry(id, targets[id] ?? docTarget(id))),
    activeId,
    order,
  })
}

// A store with a throwaway temp path.
function withTempStore(fn: (path: string, store: OperatorSettingsStore) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'ushell9a-'))
  try {
    const path = join(dir, 'settings.json')
    fn(path, createOperatorSettingsStore({ path }))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function tabsOf(store: OperatorSettingsStore): TabState {
  return (store.get() as unknown as { tabs?: TabState }).tabs as TabState
}

// ===========================================================================
// §2.2 — the focus-descriptor model + the pure coercion (the new module)
// ===========================================================================
describe('U-SHELL-9a — the TabTarget/TabEntry/TabState model (spec §2.2)', () => {
  it('§2.2 — `defaultTabState()` yields the empty v1 tab set (version/open/activeId/order)', async () => {
    const { defaultTabState, TAB_STATE_VERSION } = await loadTabStateModule()
    expect(TAB_STATE_VERSION).toBe(1)
    const s = defaultTabState()
    expect(s.version).toBe(1)
    expect(s.open).toEqual([])
    expect(s.activeId).toBeNull()
    expect(s.order).toEqual([])
  })

  it('§2.2 — a valid TabState round-trips through `coerceTabState` byte-for-byte (all five kinds)', async () => {
    const { coerceTabState } = await loadTabStateModule()
    const valid = makeState({
      open: [
        entry('t-doc', docTarget('doc-a'), 'Doc A'),
        entry('t-search', searchTarget('q1'), 'Search: q1'),
        entry('t-graph', { kind: 'graph', view: 'knowledge' }),
        entry('t-template', { kind: 'template', templateId: 'tpl-1' }),
        entry('t-other', { kind: 'other', id: 'landing' }),
      ],
      activeId: 't-doc',
      order: ['t-doc', 't-search', 't-graph', 't-template', 't-other'],
    })
    expect(coerceTabState(valid)).toEqual(valid)
  })

  it('§2.2 — `targetEquals` compares by kind + the kind-specific id (search is not a document)', async () => {
    const { targetEquals } = await loadTabStateModule()
    expect(targetEquals(docTarget('a'), docTarget('a'))).toBe(true)
    expect(targetEquals(docTarget('a'), docTarget('b'))).toBe(false)
    expect(targetEquals(docTarget('a'), searchTarget('a'))).toBe(false)
    expect(targetEquals(searchTarget('q'), searchTarget('q'))).toBe(true)
    expect(targetEquals({ kind: 'graph', view: 'g' }, { kind: 'graph', view: 'g' })).toBe(true)
    expect(targetEquals({ kind: 'template', templateId: 'x' }, { kind: 'template', templateId: 'y' })).toBe(false)
    expect(targetEquals({ kind: 'other', id: 'x' }, { kind: 'other', id: 'x' })).toBe(true)
  })

  it('F6 — a malformed TabState fails soft to the empty tab set; never throws', async () => {
    const { coerceTabState } = await loadTabStateModule()
    for (const junk of [undefined, null, 0, 'x', true, [], () => {}, { open: 'nope' }]) {
      expect(() => coerceTabState(junk)).not.toThrow()
      const s = coerceTabState(junk)
      expect(s.version).toBe(1)
      expect(s.open).toEqual([])
      expect(s.activeId).toBeNull()
      expect(s.order).toEqual([])
    }
  })

  it('F1 — a persisted activeId NOT in open falls back to the first tab (or null), never a dangling active', async () => {
    const { coerceTabState } = await loadTabStateModule()
    const s = coerceTabState(
      makeState({ open: [entry('t1', docTarget('a')), entry('t2', docTarget('b'))], activeId: 'ghost', order: ['t1', 't2'] }),
    )
    expect(s.activeId === null || s.open.some((t) => t.id === s.activeId)).toBe(true)
  })

  it('§2.2 — `order` is a permutation of open[].id after coercion (dangling/duplicate ids dropped)', async () => {
    const { coerceTabState } = await loadTabStateModule()
    const s = coerceTabState(
      makeState({ open: [entry('t1', docTarget('a')), entry('t2', docTarget('b'))], activeId: 't1', order: ['t2', 't1', 'ghost', 't2'] }),
    )
    expect([...s.order].sort()).toEqual(['t1', 't2'])
    expect(new Set(s.order).size).toBe(s.order.length)
  })

  it('F5 — duplicate targets are allowed (distinct tab ids); coercion never dedupes distinct ids', async () => {
    const { coerceTabState } = await loadTabStateModule()
    const s = coerceTabState(
      makeState({
        open: [entry('t1', docTarget('a')), entry('t2', docTarget('a'))],
        activeId: 't2',
        order: ['t1', 't2'],
      }),
    )
    expect(s.open.filter((t) => t.target.kind === 'document' && t.target.documentId === 'a')).toHaveLength(2)
    expect(new Set(s.open.map((t) => t.id)).size).toBe(2)
  })
})

// ===========================================================================
// §2.3 — single-active render (only the active tab is the mounted body)
// ===========================================================================
describe('U-SHELL-9a — single-active render (spec §2.3)', () => {
  it('§2.3 — `activeTab` returns the entry named by `activeId`', async () => {
    const { activeTab } = await loadTabStateModule()
    const s = stateWith(['t1', 't2'], {}, 't2')
    expect(activeTab(s)?.id).toBe('t2')
    expect(activeTab(s)?.target).toEqual(docTarget('t2'))
  })

  it('§2.3 — `activeTab` is null when `activeId` is null (no body mounted)', async () => {
    const { activeTab } = await loadTabStateModule()
    expect(activeTab(makeState({ open: [entry('t1', docTarget('a'))], activeId: null, order: ['t1'] }))).toBeNull()
  })

  it('§2.3 — exactly ONE active tab at a time: switching activates the selected and de-activates the previous', async () => {
    const { focusTarget, activeTab } = await loadTabStateModule()
    const s = stateWith(['t1', 't2'])
    const switched = focusTarget(s, docTarget('t1'))
    expect(switched.activeId).toBe('t1')
    // Only the active id is returned — the previous body is not the active one.
    expect(activeTab(switched)?.id).toBe('t1')
    expect(activeTab(switched)?.id).not.toBe('t2')
  })

  it('§2.3 — inactive tabs are descriptors only (open[] entries, no separate body field)', async () => {
    const { activeTab } = await loadTabStateModule()
    const s = stateWith(['t1', 't2'], {}, 't2')
    const inactive = s.open.find((t) => t.id !== activeTab(s)?.id)
    expect(inactive).toBeDefined()
    expect(Object.prototype.hasOwnProperty.call(inactive as object, 'body')).toBe(false)
  })
})

// ===========================================================================
// §2.4 — new-tab / default rules (W2-Q11)
// ===========================================================================
describe('U-SHELL-9a — new-tab / default rules (spec §2.4, W2-Q11)', () => {
  it('§2.4 — the default resolves the previous session’s most-recently-focused document first', async () => {
    const { resolveDefaultTarget } = await loadTabStateModule()
    const target = resolveDefaultTarget({
      hasStore: true,
      lastFocusedDocumentId: 'doc-z',
      documents: [
        { documentId: 'doc-a', title: 'A' },
        { documentId: 'doc-z', title: 'Z' },
      ],
    })
    expect(target).toEqual(docTarget('doc-z'))
  })

  it('§2.4 — with no previous focus, the default resolves the ALPHABETICALLY first document in the focused store', async () => {
    const { resolveDefaultTarget } = await loadTabStateModule()
    const target = resolveDefaultTarget({
      hasStore: true,
      lastFocusedDocumentId: null,
      documents: [
        { documentId: 'doc-z', title: 'Z' },
        { documentId: 'doc-a', title: 'A' },
        { documentId: 'doc-m', title: 'M' },
      ],
    })
    expect(target).toEqual(docTarget('doc-a'))
  })

  it('§2.4 — an empty focused store falls back to the store/landing listing', async () => {
    const { resolveDefaultTarget } = await loadTabStateModule()
    expect(resolveDefaultTarget({ hasStore: true, documents: [] })).toEqual(LANDING)
  })

  it('§2.4 — with NO store, the first tab opens a landing page listing the available wikis', async () => {
    const { resolveDefaultTarget } = await loadTabStateModule()
    expect(resolveDefaultTarget({ hasStore: false, documents: [] })).toEqual(LANDING)
  })

  it('§3.1/F3 — an empty tab set materializes the single targetless FIRST tab via the default', async () => {
    const { ensureFirstTab, defaultTabState } = await loadTabStateModule()
    const s = ensureFirstTab(defaultTabState(), { hasStore: true, documents: [{ documentId: 'doc-a', title: 'A' }] })
    expect(s.open).toHaveLength(1)
    expect(s.open[0].target).toEqual(docTarget('doc-a'))
    expect(s.activeId).toBe(s.open[0].id)
    expect(s.order).toEqual([s.open[0].id])
  })

  it('F3 — an empty AT THE STORE level ensures the landing first tab (never an empty stage)', async () => {
    const { ensureFirstTab, defaultTabState } = await loadTabStateModule()
    const s = ensureFirstTab(defaultTabState(), { hasStore: true, documents: [] })
    expect(s.open).toHaveLength(1)
    expect(s.open[0].target).toEqual(LANDING)
  })

  it('F3 — `ensureFirstTab` is a no-op on a non-empty set (never opens a second default tab)', async () => {
    const { ensureFirstTab } = await loadTabStateModule()
    const s = stateWith(['t1', 't2'])
    expect(ensureFirstTab(s, { hasStore: true, documents: [] })).toEqual(s)
  })

  it('§2.4/§3.2 — only the FIRST tab may open without a target; a later targetless new-tab is rejected', async () => {
    const { openTab } = await loadTabStateModule()
    // The empty set accepts a targetless first tab (the default).
    expect(() => openTab(makeState(), null, { hasStore: true, documents: [{ documentId: 'doc-a', title: 'A' }] })).not.toThrow()
    // A non-empty set must NOT accept a targetless tab.
    expect(() => openTab(stateWith(['t1'], { t1: docTarget('a') }), null)).toThrow()
  })

  it('§3.2 — an explicit new-tab target appends + activates + persists the order', async () => {
    const { openTab } = await loadTabStateModule()
    const next = openTab(stateWith(['t1'], { t1: docTarget('a') }), docTarget('b'))
    expect(next.open).toHaveLength(2)
    const added = next.open.find((t) => t.target.kind === 'document' && t.target.documentId === 'b')
    expect(added).toBeDefined()
    expect(next.activeId).toBe(added?.id)
    expect([...next.order].sort()).toEqual([...next.open.map((t) => t.id)].sort())
  })

  it('F5 — duplicate targets open as distinct tabs (distinct tab ids)', async () => {
    const { openTab } = await loadTabStateModule()
    const first = openTab(makeState(), docTarget('a'))
    const second = openTab(first, docTarget('a'))
    expect(second.open).toHaveLength(2)
    expect(new Set(second.open.map((t) => t.id)).size).toBe(2)
  })

  it('§2.2 — the strip’s reorder is within-strip only (order changes; no pane relocation field)', async () => {
    const { reorderTab } = await loadTabStateModule()
    const s = stateWith(['t1', 't2', 't3'])
    const reordered = reorderTab(s, 't3', 0)
    expect(reordered.order[0]).toBe('t3')
    expect([...reordered.order].sort()).toEqual(['t1', 't2', 't3'])
    // The reorder never authors a pane/zone relocation on the model.
    expect(Object.prototype.hasOwnProperty.call(reordered, 'zone')).toBe(false)
  })

  it('§2.4 — overflow scrolls horizontally: index.html authors an overflow-x rule for the strip region', () => {
    const html = readFileSync(new URL('../src/renderer/index.html', import.meta.url), 'utf8')
    expect(html).toMatch(/top-bar|tab-strip|tabs/i)
    expect(html).toMatch(/overflow-x\s*:\s*(auto|scroll)/)
  })
})

// ===========================================================================
// §2.4 + §3.3 + F4 — close semantics
// ===========================================================================
describe('U-SHELL-9a — close semantics (spec §2.4, §3.3, F4)', () => {
  it('§3.3 — closing the active tab activates its LEFT neighbour', async () => {
    const { closeTab } = await loadTabStateModule()
    const s = stateWith(['t1', 't2', 't3'], {}, 't2')
    const next = closeTab(s, 't2')
    expect(next.open.map((t) => t.id)).toEqual(['t1', 't3'])
    expect(next.activeId).toBe('t1')
  })

  it('§2.4 — closing the FIRST (active) tab with no left neighbour falls to the RIGHT', async () => {
    const { closeTab } = await loadTabStateModule()
    const next = closeTab(stateWith(['t1', 't2', 't3'], {}, 't1'), 't1')
    expect(next.open.map((t) => t.id)).toEqual(['t2', 't3'])
    expect(next.activeId).toBe('t2')
  })

  it('§3.3 — closing a NON-active tab leaves the active tab unchanged', async () => {
    const { closeTab } = await loadTabStateModule()
    const next = closeTab(stateWith(['t1', 't2', 't3'], {}, 't3'), 't1')
    expect(next.activeId).toBe('t3')
    expect(next.open.map((t) => t.id)).toEqual(['t2', 't3'])
  })

  it('F4 — closing the last tab leaves an empty set (never throws); the caller then re-defaults the first tab', async () => {
    const { closeTab, ensureFirstTab } = await loadTabStateModule()
    const closed = closeTab(stateWith(['t1']), 't1')
    expect(closed.open).toEqual([])
    expect(closed.activeId).toBeNull()
    const redfault = ensureFirstTab(closed, { hasStore: true, documents: [{ documentId: 'doc-a', title: 'A' }] })
    expect(redfault.open).toHaveLength(1)
    expect(redfault.open[0].target).toEqual(docTarget('doc-a'))
  })

  it('F1 — closing an unknown id is a no-op (never a phantom removal or a throw)', async () => {
    const { closeTab } = await loadTabStateModule()
    const s = stateWith(['t1', 't2'], {}, 't1')
    expect(closeTab(s, 'ghost')).toEqual(s)
  })
})

// ===========================================================================
// §2.6 — the `search` pane-first target identity
// ===========================================================================
describe('U-SHELL-9a — `search` pane-first target identity (spec §2.6)', () => {
  it('§2.6 — a search tab stores its params ON the TabEntry (the tab owns its query state)', async () => {
    const { openTab, setSearchParams } = await loadTabStateModule()
    const params: TabSearchParams = { query: 'alpha', topK: 5, mode: 'graph', stores: 'all' }
    const s = openTab(makeState(), searchTarget('q1'))
    const tabId = s.open[0]?.id ?? ''
    const withParams = setSearchParams(s, tabId, params)
    expect(withParams.open[0]?.search?.query).toBe('alpha')
    expect(withParams.open[0]?.search).toEqual(params)
  })

  it('§2.6 — opening a new search from the pane ALWAYS opens a NEW tab', async () => {
    const { openTab } = await loadTabStateModule()
    const first = openTab(makeState(), searchTarget('q1'))
    const second = openTab(first, searchTarget('q2'))
    expect(second.open.filter((t) => t.target.kind === 'search')).toHaveLength(2)
  })

  it('§2.6 — changing the query INSIDE a search tab reuses that same tab (re-runs in place)', async () => {
    const { openTab, setSearchParams } = await loadTabStateModule()
    const opened = openTab(makeState(), searchTarget('q1'))
    const tabId = opened.open[0].id
    const rerun = setSearchParams(opened, tabId, { query: 'beta', topK: 9 })
    expect(rerun.open).toHaveLength(1)
    expect(rerun.open[0].id).toBe(tabId)
    expect(rerun.activeId).toBe(tabId)
    expect(rerun.order).toEqual(opened.order)
    expect(rerun.open[0].search?.query).toBe('beta')
  })

  it('§2.6 — a result click opens the link as a NEW document tab (the search tab stays)', async () => {
    const { openTab } = await loadTabStateModule()
    const searched = openTab(makeState(), searchTarget('q1'))
    const clicked = openTab(searched, docTarget('doc-a'))
    expect(clicked.open.filter((t) => t.target.kind === 'search')).toHaveLength(1)
    expect(clicked.open.filter((t) => t.target.kind === 'document')).toHaveLength(1)
    expect(clicked.activeId).toBe(clicked.open.find((t) => t.target.kind === 'document')?.id)
  })

  it('§2.6 — a search tab ALWAYS has a target, so it is never the targetless first tab', async () => {
    const { resolveDefaultTarget, ensureFirstTab, defaultTabState } = await loadTabStateModule()
    // The default resolution never yields a search target.
    const def = resolveDefaultTarget({ hasStore: true, documents: [{ documentId: 'doc-a', title: 'A' }] })
    expect(def?.kind).not.toBe('search')
    const first = ensureFirstTab(defaultTabState(), { hasStore: true, documents: [{ documentId: 'doc-a', title: 'A' }] })
    expect(first.open[0].target.kind).not.toBe('search')
  })

  it('§2.6 — search params round-trip through `coerceTabState` (persisted in TabState)', async () => {
    const { coerceTabState } = await loadTabStateModule()
    const params: TabSearchParams = { query: 'gamma', topK: 3, filters: { nodeKind: 'fact' } }
    const s = makeState({
      open: [{ id: 't1', target: searchTarget('q1'), title: 'Search', search: params }],
      activeId: 't1',
      order: ['t1'],
    })
    const coerced = coerceTabState(s)
    expect(coerced.open[0].search?.query).toBe('gamma')
    expect(coerced.open[0].search?.topK).toBe(3)
  })

  it('§2.6 — the search pane renders a pane-first expand-into-a-tab control (structurally: a click handler beyond the disclosure toggle)', () => {
    const content = searchContent({} as never, null, {}) as unknown as {
      children?: Array<{ type?: string; handlers?: Array<{ event?: string; name?: string }> }>
    }
    const clickHandlers = (content.children ?? []).filter((c) =>
      (c.handlers ?? []).some((h) => h.event === 'click'),
    )
    // The disclosure toggle already supplies 1; the pane-first expand control is
    // the second (spec §2.6 "a button to expand into a full tab").
    expect(clickHandlers.length).toBeGreaterThanOrEqual(2)
  })
})

// ===========================================================================
// §2.5 — the C9 `OperatorSettings.tabs` carrier
// ===========================================================================
describe('U-SHELL-9a — the `OperatorSettings.tabs` slice (spec §2.5, C9)', () => {
  it('§2.5 — boot with no persisted tabs defaults to a valid empty v1 TabState', () => {
    withTempStore((_path, store) => {
      const tabs = tabsOf(store)
      expect(tabs).toBeDefined()
      expect(tabs.version).toBe(1)
      expect(Array.isArray(tabs.open)).toBe(true)
      expect(Array.isArray(tabs.order)).toBe(true)
      expect(tabs.activeId === null || tabs.open.some((t) => t.id === tabs.activeId)).toBe(true)
    })
  })

  it('§2.5/§3.9 — a tabs mutation round-trips through set + get and persists to JSON', () => {
    withTempStore((path, store) => {
      const next = stateWith(['t1', 't2'], { t1: docTarget('a'), t2: docTarget('b') }, 't2')
      store.set({ tabs: next } as never)
      expect(tabsOf(store).open).toHaveLength(2)
      expect(tabsOf(store).activeId).toBe('t2')
      const raw = JSON.parse(readFileSync(path, 'utf8'))
      expect(raw.tabs.version).toBe(1)
      expect(raw.tabs.order).toEqual(['t1', 't2'])
      const reloaded = createOperatorSettingsStore({ path })
      expect(tabsOf(reloaded).open).toHaveLength(2)
      expect(tabsOf(reloaded).activeId).toBe('t2')
    })
  })

  it('§2.5 — a patch WITHOUT `tabs` leaves the stored tabs unchanged', () => {
    withTempStore((_path, store) => {
      store.set({ tabs: stateWith(['t1', 't2']) } as never)
      store.set({ topK: 7 } as never)
      expect(store.get().topK).toBe(7)
      expect(tabsOf(store).open).toHaveLength(2)
    })
  })

  it('F6 — a malformed persisted `tabs` fails soft to the empty tab set (never crashes boot)', () => {
    withTempStore((path) => {
      writeFileSync(path, JSON.stringify({ tabs: 'not-a-tab-state', topK: 5 }))
      const store = createOperatorSettingsStore({ path })
      expect(tabsOf(store).version).toBe(1)
      expect(tabsOf(store).open).toEqual([])
      expect(tabsOf(store).activeId).toBeNull()
    })
  })

  it('F1 — a persisted activeId not in open coerces at load (no dangling active)', () => {
    withTempStore((path) => {
      writeFileSync(
        path,
        JSON.stringify({
          tabs: { version: 1, open: [{ id: 't1', target: { kind: 'document', documentId: 'a' }, title: 'A' }], activeId: 'ghost', order: ['t1'] },
        }),
      )
      const store = createOperatorSettingsStore({ path })
      const tabs = tabsOf(store)
      expect(tabs.activeId === null || tabs.open.some((t) => t.id === tabs.activeId)).toBe(true)
    })
  })

  it('F6 — credentials are never copied into the `tabs` slice (carrier rule)', () => {
    withTempStore((path, store) => {
      writeFileSync(
        path,
        JSON.stringify({ tabs: { version: 1, open: [], activeId: null, order: [], token: 'secret', auth: { token: 'x' } } }),
      )
      const reloaded = createOperatorSettingsStore({ path })
      const tabs = tabsOf(reloaded) as unknown as Record<string, unknown>
      expect('token' in tabs).toBe(false)
      expect('auth' in tabs).toBe(false)
      store.set({ topK: 1 } as never)
    })
  })

  it('§2.5/§2.3 — a RAG content change leaves the tab open set/active/order intact (identity stable)', () => {
    withTempStore((path, store) => {
      const next = stateWith(['t1', 't2'], { t1: docTarget('a'), t2: docTarget('b') }, 't2')
      store.set({ tabs: next } as never)
      // A content change is another settings write that does NOT carry tabs.
      store.set({ topK: 11 } as never)
      const reloaded = createOperatorSettingsStore({ path })
      expect(reloaded.get().topK).toBe(11)
      expect(tabsOf(reloaded).open.map((t) => t.id)).toEqual(['t1', 't2'])
      expect(tabsOf(reloaded).activeId).toBe('t2')
      expect(tabsOf(reloaded).order).toEqual(['t1', 't2'])
    })
  })
})

// ===========================================================================
// §2.7 — the MCP focus tool `provident.focus`
// ===========================================================================
describe('U-SHELL-9a — the MCP focus tool `provident.focus` (spec §2.7)', () => {
  const TOOL = 'provident.focus'

  it('§2.7/§5 — `ALL_TOOLS` includes `provident.focus`', () => {
    expect(ProvidentMcpServer.ALL_TOOLS).toContain(TOOL)
  })

  it('§2.7 — the tool group is `dispatch`; default-on (read+dispatch) allows it; read-only does not', () => {
    expect(groupForTool(TOOL)).toBe('dispatch')
    expect(toolAllowed(TOOL, ['read', 'dispatch'])).toBe(true)
    expect(toolAllowed(TOOL, ['read'])).toBe(false)
  })

  it('§2.7 — the tool is NOT in the renderer `MUTATING_METHODS` (so it emits no app-graph-changed)', () => {
    const src = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')
    const setMatch = /const MUTATING_METHODS = new Set\(\[([^\]]*)\]\)/.exec(src)
    expect(setMatch, 'renderer MUTATING_METHODS set literal must exist').not.toBeNull()
    expect(setMatch![1]).not.toContain('focus')
  })

  it('§2.7 — registered over the SDK when `dispatch` is enabled, with the target/tabId/newTab args', async () => {
    const server = new ProvidentMcpServer({ backend: { invoke: async () => ({}) }, transport: 'stdio', gate: new SecurityGate() })
    server.ensureServerRegistered()
    server.applyGatePatch({ groups: ['read', 'dispatch'] })
    const sdkServer = server.ensureServerRegistered()
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'ushell9a', version: '0.1.0' })
    await Promise.all([
      client.connect(clientTransport),
      (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
    ])
    try {
      const { tools } = await client.listTools()
      const tool = tools.find((t) => t.name === TOOL)
      expect(tool, `${TOOL} must register when dispatch is enabled`).toBeDefined()
      const schema = tool!.inputSchema as { properties?: Record<string, unknown> }
      const keys = Object.keys(schema.properties ?? {})
      expect(keys).toContain('target')
      expect(keys).toContain('tabId')
      expect(keys).toContain('newTab')
    } finally {
      await client.close()
    }
  })

  it('§2.7 — invoking it returns the resulting TabState and persists the focus WITHOUT a graph/RAG broadcast', async () => {
    const returned: TabState = stateWith(['t1'], { t1: docTarget('a') }, 't1')
    const calls: Array<{ method: string; payload: unknown }> = []
    const broadcasts: Array<{ channel: string; msg: unknown }> = []
    const backend: McpBackend = {
      invoke: async (method, payload) => {
        calls.push({ method, payload })
        return returned
      },
      broadcast: (channel, msg) => broadcasts.push({ channel, msg }),
    }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.ensureServerRegistered()
    server.applyGatePatch({ groups: ['read', 'dispatch'] })
    const sdkServer = server.ensureServerRegistered()
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'ushell9a', version: '0.1.0' })
    await Promise.all([
      client.connect(clientTransport),
      (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
    ])
    try {
      const result = await client.callTool({ name: TOOL, arguments: { target: { kind: 'document', documentId: 'a' } } })
      const text = ((result.content as Array<{ type: string; text: string }>)[0]).text
      const parsed = JSON.parse(text) as TabState
      expect(parsed.version).toBe(1)
      expect(parsed.open.map((t) => t.id)).toEqual(['t1'])
      expect(parsed.activeId).toBe('t1')
      expect(calls).toHaveLength(1)
      // UI-focus only — no rag-store-changed / template-changed / graph push.
      expect(broadcasts).toHaveLength(0)
    } finally {
      await client.close()
    }
  })

  it('§2.7 — accepting a `{ tabId }` arg (activate an existing tab) as an alternative to a target', async () => {
    const received: unknown[] = []
    const backend: McpBackend = { invoke: async (_m, p) => { received.push(p); return stateWith(['t1']) } }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.ensureServerRegistered()
    server.applyGatePatch({ groups: ['read', 'dispatch'] })
    const sdkServer = server.ensureServerRegistered()
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'ushell9a', version: '0.1.0' })
    await Promise.all([
      client.connect(clientTransport),
      (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
    ])
    try {
      await client.callTool({ name: TOOL, arguments: { tabId: 't1' } })
      expect(received).toHaveLength(1)
      expect(received[0]).toMatchObject({ tabId: 't1' })
    } finally {
      await client.close()
    }
  })
})

// ===========================================================================
// Adversarial-fix regressions (2026-09-12). Each test pins one HOST finding:
// HOST-1 active-body stage mount, HOST-2 real default context, HOST-3 non-first
// new-tab target requirement, HOST-4 result click → new document tab, HOST-5
// in-tab search reuse, HOST-6 total target coercion (+ MCP min(1)), HOST-7
// collision-free search queryId, HOST-8 ghost tabId.
// ===========================================================================

function makeStrip(state?: TabState): TabStrip {
  const strip = new TabStrip({
    mount: null,
    getContext: () => ({ hasStore: true, documents: [{ documentId: 'doc-a', title: 'A' }] }),
  })
  if (state) strip.load(state)
  return strip
}

const STAGE_NOW = new Date().toISOString()
function stageNode(id: string, type: string, content: string) {
  return { id, type, content, ownedNodeIds: [], createdAt: STAGE_NOW, updatedAt: STAGE_NOW }
}
function stageEdge(id: string, source: string, target: string) {
  return { id, kind: 'doc-head', source, target, createdAt: STAGE_NOW, updatedAt: STAGE_NOW, documentIds: [target] }
}

/** A minimal `SidebarPanes` + `Runtime` host harness (the U-SHELL-4 pattern)
 *  sufficient to exercise the active-tab stage mount + the real default
 *  context. */
function stageHarness(opts: {
  documents: Array<{ documentId: string; title: string }>
  defaultDocumentId?: string | null
  tabs?: {
    expandSearchTab(query: string): void
    openDocumentTab?(documentId: string): void
    editSearchQuery?(tabId: string, params: { query: string }): void
  }
}) {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const snapshot = {
    nodes: opts.documents.map((d) => stageNode(`${d.documentId}-head`, 'h1', d.title)),
    edges: opts.documents.map((d, i) => stageEdge(`e${i}`, `${d.documentId}-head`, d.documentId)),
  }
  const docHeads = {
    documents: opts.documents.map((d) => ({ documentId: d.documentId, title: d.title, path: [], tags: [] })),
  }
  const operatorSettings: Record<string, unknown> = {
    enabledPanes: [],
    enabledOperatorPanes: [],
    panesInitialized: true,
    defaultDocumentId: opts.defaultDocumentId ?? null,
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
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController, tabs: opts.tabs as never })
  const runtime = new Runtime({
    mount,
    envelope: {
      template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, mount, operatorMount }
}

describe('U-SHELL-9a — HOST adversarial-fix regressions', () => {
  it('HOST-1 — switching the active tab switches the mounted stage body (single-active)', async () => {
    const h = stageHarness({ documents: [{ documentId: 'doc-a', title: 'Doc A' }] })
    await h.host.boot(h.runtime)
    expect((h.mount as unknown as { innerHTML: string }).innerHTML).toContain('Doc A')
    h.host.mountTab(entry('landing-1', LANDING, 'Landing'))
    expect((h.mount as unknown as { innerHTML: string }).innerHTML).toContain('stage-landing')
    h.host.mountTab(entry('doc-1', docTarget('doc-a'), 'Doc A'))
    const docHtml = (h.mount as unknown as { innerHTML: string }).innerHTML
    expect(docHtml).toContain('Doc A')
    expect(docHtml).not.toContain('stage-landing')
  })

  it('HOST-1 — `onActiveChange` fires with the new active entry on a tab switch', () => {
    const seen: Array<TabEntry | null> = []
    const strip = new TabStrip({ mount: null, onActiveChange: (e) => seen.push(e) })
    strip.load(stateWith(['t1', 't2'], {}, 't2'))
    strip.focus({ target: docTarget('t1') })
    expect(seen[seen.length - 1]?.id).toBe('t1')
  })

  it('HOST-2 — `getTabContext` supplies the real store/doc-heads + last-focused id', async () => {
    const { ensureFirstTab, defaultTabState } = await loadTabStateModule()
    const h = stageHarness({
      documents: [
        { documentId: 'doc-z', title: 'Z' },
        { documentId: 'doc-a', title: 'A' },
      ],
      defaultDocumentId: 'doc-z',
    })
    await h.host.boot(h.runtime)
    const ctx = h.host.getTabContext()
    expect([...ctx.documents.map((d) => d.documentId)].sort()).toEqual(['doc-a', 'doc-z'])
    expect(ctx.hasStore).toBe(true)
    expect(ensureFirstTab(defaultTabState(), ctx).open[0].target).toEqual(docTarget('doc-z'))
    expect(ensureFirstTab(defaultTabState(), { ...ctx, lastFocusedDocumentId: null }).open[0].target).toEqual(docTarget('doc-a'))
    expect(ensureFirstTab(defaultTabState(), { hasStore: false, documents: [] }).open[0].target).toEqual(LANDING)
  })

  it('HOST-3 — a non-first `+` with no target does not synthesize a tab', () => {
    const strip = makeStrip(stateWith(['t1'], { t1: docTarget('doc-a') }))
    const before = strip.getState()
    expect(strip.newTab()).toEqual(before)
  })

  it('HOST-4 — a search result `li` carries an on:click open-result handler', () => {
    const content = searchContent({} as never, {
      results: [{ documentId: 'doc-a', nodeId: 'n1', score: 1, snippet: 's' }],
    } as never, {}) as unknown as {
      children?: Array<{ type?: string; props?: Record<string, unknown>; handlers?: Array<{ event?: string; name?: string }> }>
    }
    const li = (content.children ?? []).find((c) => c.type === 'li' && c.props?.['data-document-id'] === 'doc-a')
    expect(li).toBeDefined()
    expect((li?.handlers ?? []).some((h) => h.event === 'click' && h.name === SEARCH_RESULT_OPEN_HANDLER)).toBe(true)
  })

  it('HOST-4 — openDocumentTab opens a NEW document tab (the search tab stays)', () => {
    const strip = makeStrip(stateWith(['s1'], { s1: searchTarget('q1') }, 's1'))
    const after = strip.openDocumentTab('doc-a')
    expect(after.open.filter((t) => t.target.kind === 'search')).toHaveLength(1)
    expect(after.open.filter((t) => t.target.kind === 'document')).toHaveLength(1)
    const doc = after.open.find((t) => t.target.kind === 'document')
    expect(after.activeId).toBe(doc?.id)
  })

  it('HOST-4 — the host `openDocumentTab` bridge seam opens a document tab', async () => {
    const strip = makeStrip(stateWith(['s1'], { s1: searchTarget('q1') }, 's1'))
    const h = stageHarness({
      documents: [{ documentId: 'doc-a', title: 'Doc A' }],
      tabs: {
        expandSearchTab: (q) => void strip.expandSearchTab(q),
        openDocumentTab: (id) => void strip.openDocumentTab(id),
        editSearchQuery: (tabId, params) => void strip.editSearchQuery(tabId, params),
      },
    })
    await h.host.boot(h.runtime)
    const sidebar = (globalThis as unknown as { window: { provident: { sidebar: { openDocumentTab(id: string): void } } } }).window.provident.sidebar
    sidebar.openDocumentTab('doc-a')
    expect(strip.getState().open.filter((t) => t.target.kind === 'document')).toHaveLength(1)
  })

  it('HOST-5 — editing the query inside a search tab reuses that same tab', () => {
    const strip = makeStrip(stateWith(['s1'], { s1: searchTarget('q1') }, 's1'))
    const after = strip.editSearchQuery('s1', { query: 'beta' })
    expect(after.open).toHaveLength(1)
    expect(after.open[0].id).toBe('s1')
    expect(after.activeId).toBe('s1')
    expect(after.open[0].search?.query).toBe('beta')
  })

  it('HOST-5 — the search-tab body renders its query + an in-tab submit handler', () => {
    const body = searchTabContent(entry('s1', searchTarget('q1')), { results: [] }) as unknown as {
      children?: Array<{ handlers?: Array<{ event?: string }> }>
    }
    expect((body.children ?? []).some((c) => (c.handlers ?? []).some((h) => h.event === 'click'))).toBe(true)
  })

  it('HOST-6 — an empty/unknown focus target is a no-op (no phantom tab)', () => {
    const strip = makeStrip(stateWith(['t1'], { t1: docTarget('doc-a') }))
    const before = strip.getState()
    expect(strip.focus({ target: { kind: 'document', documentId: '' } as never })).toEqual(before)
    expect(strip.focus({ target: { kind: 'bogus' } as never })).toEqual(before)
    expect(strip.focus({ target: null as never })).toEqual(before)
  })

  it('HOST-6 — `coerceTabTarget` is total (malformed/empty targets drop to null)', async () => {
    const mod = await loadTabStateModule()
    expect(mod.coerceTabTarget({ kind: 'document', documentId: '' })).toBeNull()
    expect(mod.coerceTabTarget({ kind: 'bogus' })).toBeNull()
    expect(mod.coerceTabTarget(null)).toBeNull()
    expect(mod.coerceTabTarget({ kind: 'document', documentId: 'a' })).toEqual(docTarget('a'))
  })

  it('HOST-6 — the MCP focus zod rejects empty ids (no backend call)', async () => {
    const calls: unknown[] = []
    const backend: McpBackend = { invoke: async (_m, p) => { calls.push(p); return {} } }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.ensureServerRegistered()
    server.applyGatePatch({ groups: ['read', 'dispatch'] })
    const sdkServer = server.ensureServerRegistered()
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
    const client = new Client({ name: 'ushell9a', version: '0.1.0' })
    await Promise.all([
      client.connect(clientTransport),
      (sdkServer as unknown as { connect(t: unknown): Promise<void> }).connect(serverTransport),
    ])
    try {
      const result = await client.callTool({ name: 'provident.focus', arguments: { target: { kind: 'document', documentId: '' } } })
      expect((result as { isError?: boolean }).isError).toBe(true)
      expect(calls).toHaveLength(0)
    } finally {
      await client.close()
    }
  })

  it('HOST-7 — expandSearchTab allocates collision-free queryIds across close/reopen', () => {
    const strip = makeStrip()
    strip.expandSearchTab('a')
    strip.expandSearchTab('b')
    const first = strip.getState().open.find((t) => t.target.kind === 'search')
    strip.close(first?.id ?? '')
    strip.expandSearchTab('c')
    const ids = strip.getState().open
      .filter((t) => t.target.kind === 'search')
      .map((t) => (t.target as { queryId: string }).queryId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('HOST-8 — focus({tabId:"ghost"}) is a no-op when tabs exist; the empty set still defaults', () => {
    const strip = makeStrip(stateWith(['t1'], { t1: docTarget('doc-a') }, 't1'))
    const before = strip.getState()
    expect(strip.focus({ tabId: 'ghost' })).toEqual(before)
    const empty = makeStrip()
    expect(empty.focus({ tabId: 'ghost' }).open).toHaveLength(1)
  })
})

// ===========================================================================
// Live-runtime / battery equivalence — not node-testable (the U-SHELL-1 /
// U-SHELL-3 convention). These require the live Runtime + `provident.dispatch`
// / `provident.get_rendered_html`.
// ===========================================================================
describe.skip('U-SHELL-9a — MCP-visible equivalence (battery / live host)', () => {
  it.skip('§3.1 — the strip renders the persisted tabs in `order` with the active tab highlighted', () => {})
  it.skip('§3.5 — `get_rendered_html` shows ONLY the active tab body mounted in the stage', () => {})
  it.skip('§3.6 — `provident.dispatch` on a strip control reorders/closes through the shared focus seam', () => {})
  it.skip('§2.7 — `provident.focus` find-or-opens against the live renderer (no `app-graph-changed`)', () => {})
})
