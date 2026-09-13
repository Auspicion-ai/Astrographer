// tests/unit-u-shell-3-collapsible-panes.test.ts — Unit U-SHELL-3: Collapsible
// Panes (C5). TestWriter RED set written from
// docs/specs/unit-u-shell-3-collapsible-panes.md §2 (contract), §3 (states) +
// §4 (fail-states) + §5 (census), with the W2-Q1 resolution
// (`docs/specs/wave-2-open-decisions.md`: per-pane `collapsed`, per-zone
// `minimized`/`size`).
//
// U-SHELL-1 ALREADY landed the mirror half: `paneSubtreeRoot(..., collapsed)`
// appends the `is-collapsed` class and `assembleAppGraphEnvelope` reads
// `PaneLayoutEntry.collapsed` from `OperatorSettings.layout`. What is NOT
// implemented (this unit):
//
//   - the collapse TOGGLE CONTROL (a provident node with an `on:click`
//     handler) on each pane frame (spec §2.1/§5 — "1 per pane frame + 1
//     handler def");
//   - the HEADER-ONLY Render: collapsed ⇒ the pane's body is NOT rendered
//     (spec §2.2 — "Collapsed = the pane's header/handle only; the pane body
//     is not rendered/expanded");
//   - the `is-collapsed` `cssDef` rule in `index.html` (spec §5);
//   - the host collapse TOGGLE seam / dirty-edit-guard integration (§2.1/F2).
//
// SPEC AMBIGUITIES FLAGGED IN THE RED REPORT (NOT invented here):
//   1. The handler NAME + the `window.provident.sidebar` toggle method name are
//      NOT pinned by the spec. The tests below detect the control STRUCTURALLY
//      (a node carrying an `on:click` handler) + assert every pane frame's
//      control shares ONE handler name (the §5 "1 handler def" census) rather
//      than hard-coding a name.
//   2. "the pane body is not rendered" is read literally (the body marker is
//      ABSENT from the collapsed subtree). A CSS-only `display:none` reading
//      would keep the body in the graph; the spec §2.2 wording ("not
//      rendered/expanded") is pinned as absence here.
//   3. The exact host toggle seam name is not pinned. The §2.1/§2.3
//      model-level write is exercised through the U-SHELL-1-pinned
//      `SidebarPanes.setLayout` + `OperatorSettings.layout`; the F2 dirty-guard
//      check rides the settings-broadcast path that any layout write triggers.
//
// MCP-visible equivalence (`list_targets`/`get_rendered_html`/`dispatch` — spec
// §3 state 6) and the stale-dispatch no-op (F5) are NOT node-testable; they are
// documented in the `.skip` block at the bottom (the U-SHELL-1 / Unit K
// convention).
import { describe, it, expect, vi } from 'vitest'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { createPaneRegistry, type PaneRegistry, type PaneDefinition } from '../src/renderer/pane-registry.js'
import { paneSubtreeRoot, assembleAppGraphEnvelope } from '../src/renderer/pane-graph.js'
import {
  coerceLayout,
  type LayoutState,
  type LayoutZoneName,
  type PaneLayoutEntry,
  type ZoneLayout,
} from '../src/renderer/layout-state.js'
import { createOperatorSettingsStore, type OperatorSettingsStore } from '../src/main/operator-settings-store.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createEditController } from '../src/renderer/edit-controller.js'

// ---------------------------------------------------------------------------
// Loose node helpers (the render output is LegacyNodeData).
// ---------------------------------------------------------------------------
interface AnyNode {
  type?: string
  content?: unknown
  props?: Record<string, unknown>
  css?: { classes?: string[] }
  placement?: { targetPlacement?: string[]; placementName?: string }
  handlers?: Array<{ name?: string; event?: string; body?: unknown }>
  children?: AnyNode[]
}

function walk(node: AnyNode | null | undefined, out: AnyNode[] = []): AnyNode[] {
  if (node == null || typeof node !== 'object') return out
  out.push(node)
  for (const child of node.children ?? []) walk(child, out)
  return out
}

interface EnvelopeLike {
  template?: { root?: AnyNode }
  content?: Array<{ content?: AnyNode[] }>
}

function allNodes(env: EnvelopeLike): AnyNode[] {
  const out: AnyNode[] = []
  if (env.template?.root) walk(env.template.root, out)
  for (const payload of env.content ?? []) {
    for (const root of payload.content ?? []) walk(root, out)
  }
  return out
}

function findById(env: EnvelopeLike, id: string): AnyNode | undefined {
  return allNodes(env).find((n) => n.props?.id === id)
}

/** The `pane-<id>` content root (U-SHELL-1 spec §2.6 pin 4 — the `is-collapsed`
 *  mirror home). */
function paneRoot(env: EnvelopeLike, paneId: string): AnyNode | undefined {
  return findById(env, `pane-${paneId}`)
}

function classesOf(node: AnyNode | undefined): string[] {
  return node?.css?.classes ?? []
}

/** Every node in the subtree that carries an `on:click` handler — the
 *  provident collapse control (spec §2.1) is detected structurally so the
 *  unpinned handler name is not hard-coded. */
function clickHandlerNodes(nodes: AnyNode[]): AnyNode[] {
  return nodes.filter((n) => (n.handlers ?? []).some((h) => h.event === 'click'))
}

/** The unique click-handler names across a subtree (the §5 "1 handler def"
 *  census is checked by comparing these across pane frames). */
function clickHandlerNames(nodes: AnyNode[]): string[] {
  const names = new Set<string>()
  for (const n of nodes) {
    for (const h of n.handlers ?? []) if (h.event === 'click' && h.name) names.add(h.name)
  }
  return [...names]
}

// ---------------------------------------------------------------------------
// The pane-body marker. The fixture `render` returns this node (the body); a
// collapsed frame must NOT contain it (spec §2.2 "header/handle only").
// ---------------------------------------------------------------------------
function bodyMarker(paneId: string): string {
  return `ushell3-body-${paneId}`
}

function bodyNode(paneId: string): LegacyNodeData {
  return { type: 'div', props: { id: `body-${paneId}` }, content: bodyMarker(paneId) } as unknown as LegacyNodeData
}

function hasBody(nodes: AnyNode[], paneId: string): boolean {
  return nodes.some((n) => n.content === bodyMarker(paneId))
}

// ---------------------------------------------------------------------------
// Fixtures.
// ---------------------------------------------------------------------------
type LayoutZoneNameLocal = LayoutZoneName

function makeLayout(partial: {
  version?: number
  panes?: PaneLayoutEntry[]
  zones?: Partial<Record<LayoutZoneNameLocal, Partial<ZoneLayout>>>
} = {}): LayoutState {
  const base: LayoutState = {
    version: 1,
    panes: [],
    zones: {
      left: { size: 220, minimized: false },
      right: { size: 220, minimized: false },
      header: { size: 48, minimized: false },
      footer: { size: 48, minimized: false },
    },
    stage: { size: 640 },
    topBar: { size: 36 },
  }
  return {
    version: partial.version ?? base.version,
    panes: partial.panes ?? base.panes,
    zones: {
      left: { ...base.zones.left, ...(partial.zones?.left ?? {}) },
      right: { ...base.zones.right, ...(partial.zones?.right ?? {}) },
      header: { ...base.zones.header, ...(partial.zones?.header ?? {}) },
      footer: { ...base.zones.footer, ...(partial.zones?.footer ?? {}) },
    },
    stage: base.stage,
    topBar: base.topBar,
  }
}

function collapsedEntry(paneId: string, collapsed: boolean, order = 0): PaneLayoutEntry {
  return { id: paneId, zone: 'left', order, collapsed }
}

interface PaneSpec {
  id: string
  scope?: 'app-graph' | 'operator'
  defaultZone?: LayoutZoneNameLocal
  defaultOrder?: number
}

function makeRegistry(specs: PaneSpec[]): PaneRegistry {
  const registry = createPaneRegistry()
  for (const s of specs) {
    const def: PaneDefinition = {
      id: s.id,
      title: s.id,
      scope: s.scope ?? 'app-graph',
      render: () => bodyNode(s.id),
    } as PaneDefinition
    if (s.defaultZone !== undefined) def.defaultZone = s.defaultZone
    if (s.defaultOrder !== undefined) def.defaultOrder = s.defaultOrder
    registry.register(def)
    registry.enable(s.id)
  }
  return registry
}

/** A traversal-style base envelope with a `main` container producer + a `rag-`
 *  content root (the pre-U-SHELL app graph, U-SHELL-1 fixture). */
function baseEnvelope(mainContent = 'main-body'): LegacyInitialData {
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
    content: [
      {
        content: [
          {
            type: 'div',
            props: { id: 'rag-docA' },
            content: mainContent,
            placement: { targetPlacement: ['main'] },
          } as unknown as LegacyNodeData,
        ],
      },
    ],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

function assemble(opts: {
  specs?: PaneSpec[]
  layout?: LayoutState
  env?: LegacyInitialData
}): { envelope: EnvelopeLike; paneIds: string[] } {
  const registry = makeRegistry(opts.specs ?? [])
  const result = assembleAppGraphEnvelope({
    traversalEnvelope: opts.env ?? baseEnvelope(),
    registry,
    ctx: {} as never,
    layout: opts.layout,
  } as never)
  return { envelope: result.envelope as unknown as EnvelopeLike, paneIds: result.paneIds }
}

/** A store with a throwaway temp path. */
function withTempStore(fn: (path: string, store: OperatorSettingsStore) => void): void {
  const dir = mkdtempSync(join(tmpdir(), 'ushell3-'))
  try {
    const path = join(dir, 'settings.json')
    fn(path, createOperatorSettingsStore({ path }))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function layoutOf(store: OperatorSettingsStore): LayoutState {
  return (store.get() as unknown as { layout?: LayoutState }).layout as LayoutState
}

/** U-SHELL-3 adversarial H1/H3/H5 — a minimally wired host (NO boot) whose
 *  `bridge.operatorSettings.set` is a spy, for exercising the private
 *  `togglePaneCollapse` seam + the public `setLayout` write-through against a
 *  controlled registry/layout. `layout` seeds the host's persisted overlay. */
function makeTogglableHost(
  specs: PaneSpec[],
  layout: LayoutState | null = null,
): { host: SidebarPanes; registry: PaneRegistry; set: ReturnType<typeof vi.fn> } {
  installShim()
  const registry = makeRegistry(specs)
  const backRefs = new Map<string, string[]>()
  const editController = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild: vi.fn(),
  })
  const set = vi.fn(async () => ({}))
  const host = new SidebarPanes({
    mount: mountEl() as never,
    operatorMount: mountEl() as never,
    registry,
    bridge: { operatorSettings: { set } } as never,
    backRefs,
    editController,
  })
  ;(host as unknown as { layout: LayoutState | null }).layout = layout
  return { host, registry, set }
}

/** Invoke the private host collapse seam. */
function toggle(host: SidebarPanes, paneId: string): void {
  ;(host as unknown as { togglePaneCollapse(id: string): void }).togglePaneCollapse(paneId)
}

/** A host with NO `operatorSettings` bridge surface (H5). */
function makeNoSettingsHost(specs: PaneSpec[]): SidebarPanes {
  installShim()
  const backRefs = new Map<string, string[]>()
  const editController = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild: vi.fn(),
  })
  return new SidebarPanes({
    mount: mountEl() as never,
    operatorMount: mountEl() as never,
    registry: makeRegistry(specs),
    bridge: {} as never,
    backRefs,
    editController,
  })
}

// ===========================================================================
// §2.1/§2.2 — the pane FRAME: the collapse control + header-only render (the
// pure `paneSubtreeRoot` seam the spec names in §6).
// ===========================================================================
describe('U-SHELL-3 — pane frame: header-only render + provident collapse control (§2.1/§2.2)', () => {
  function defFor(paneId: string): PaneDefinition {
    return { id: paneId, title: paneId, scope: 'app-graph', render: () => bodyNode(paneId) } as PaneDefinition
  }

  it('§3.1 boot (expanded): the pane root is `pane-<id>`, the body renders, and a collapse control is present', () => {
    const root = paneSubtreeRoot(defFor('doc-nav') as never, {} as never, 'left', false) as unknown as AnyNode
    const nodes = walk(root)
    // Identity is stable (`pane-<id>`), the body renders when expanded.
    expect(root.props?.id).toBe('pane-doc-nav')
    expect(hasBody(nodes, 'doc-nav')).toBe(true)
    expect(classesOf(root)).not.toContain('is-collapsed')
    // §2.1/§5 — every pane frame supplies a provident collapse control with an
    // `on:click` handler (one per frame).
    expect(clickHandlerNodes(nodes).length).toBeGreaterThan(0)
  })

  it('§3.2 collapsed: the body is NOT rendered, the root carries `is-collapsed`, and the control remains', () => {
    const root = paneSubtreeRoot(defFor('doc-nav') as never, {} as never, 'left', true) as unknown as AnyNode
    const nodes = walk(root)
    expect(root.props?.id).toBe('pane-doc-nav')
    expect(classesOf(root)).toContain('is-collapsed')
    // §2.2 — collapsed = header/handle only; the body is not rendered.
    expect(hasBody(nodes, 'doc-nav')).toBe(false)
    // The control must survive collapsing so the pane can expand again.
    expect(clickHandlerNodes(nodes).length).toBeGreaterThan(0)
  })

  it('§3.3 toggle again: expanding restores the body with the SAME `pane-<id>` identity', () => {
    const collapsed = paneSubtreeRoot(defFor('doc-nav') as never, {} as never, 'left', true) as unknown as AnyNode
    const expanded = paneSubtreeRoot(defFor('doc-nav') as never, {} as never, 'left', false) as unknown as AnyNode
    expect(collapsed.props?.id).toBe('pane-doc-nav')
    expect(expanded.props?.id).toBe('pane-doc-nav')
    expect(hasBody(walk(expanded), 'doc-nav')).toBe(true)
    expect(hasBody(walk(collapsed), 'doc-nav')).toBe(false)
  })

  it('§5 census: every pane frame carries the SAME single collapse handler name (1 handler def)', () => {
    const a = walk(paneSubtreeRoot(defFor('a') as never, {} as never, 'left', false) as unknown as AnyNode)
    const b = walk(paneSubtreeRoot(defFor('b') as never, {} as never, 'left', false) as unknown as AnyNode)
    const namesA = clickHandlerNames(a)
    const namesB = clickHandlerNames(b)
    expect(namesA.length).toBe(1)
    expect(namesB).toEqual(namesA)
  })

  it('H2 — the collapse control authors a stable `pane-collapse-<paneId>` id preserved across re-derives', () => {
    const def = defFor('doc-nav')
    const expanded = paneSubtreeRoot(def as never, {} as never, 'left', false) as unknown as AnyNode
    const collapsed = paneSubtreeRoot(def as never, {} as never, 'left', true) as unknown as AnyNode
    // The authored id is stable (not the volatile engine nodeId) + survives a
    // re-assemble (here: the collapse → expand frame shape change).
    expect(walk(expanded).some((n) => n.props?.id === 'pane-collapse-doc-nav')).toBe(true)
    expect(walk(collapsed).some((n) => n.props?.id === 'pane-collapse-doc-nav')).toBe(true)
    // Unique per pane.
    const other = paneSubtreeRoot(defFor('search') as never, {} as never, 'left', false) as unknown as AnyNode
    expect(walk(other).some((n) => n.props?.id === 'pane-collapse-doc-nav')).toBe(false)
    expect(walk(other).some((n) => n.props?.id === 'pane-collapse-search')).toBe(true)
  })

  it('F3 — a pane with no body (empty render): collapse never throws and still mirrors the class', () => {
    const emptyDef = {
      id: 'empty',
      title: 'Empty',
      scope: 'app-graph',
      render: () => ({ type: 'div', props: { id: 'empty-body' } }) as unknown as LegacyNodeData,
    } as PaneDefinition
    expect(() => paneSubtreeRoot(emptyDef as never, {} as never, 'left', false)).not.toThrow()
    const collapsed = paneSubtreeRoot(emptyDef as never, {} as never, 'left', true) as unknown as AnyNode
    expect(() => walk(collapsed)).not.toThrow()
    expect(classesOf(collapsed)).toContain('is-collapsed')
  })
})

// ===========================================================================
// §2.2/§2.3 — the assembled app graph: collapsed renders header-only + the
// `is-collapsed` mirror (U-SHELL-1 landed the class; U-SHELL-3 adds the
// header-only render + the control).
// ===========================================================================
describe('U-SHELL-3 — assembled app graph: collapsed rendering + mirror (§2.2/§2.3)', () => {
  it('§3.1 boot (no persisted collapse): every pane is expanded (no mirror class) and renders its body', () => {
    const { envelope } = assemble({ specs: [{ id: 'doc-nav' }, { id: 'search' }] })
    for (const id of ['doc-nav', 'search']) {
      const root = paneRoot(envelope, id)
      expect(root?.props?.id).toBe(`pane-${id}`)
      expect(classesOf(root)).not.toContain('is-collapsed')
      expect(hasBody(walk(root), id)).toBe(true)
    }
  })

  it('§3.2/§3.4 — a persisted `collapsed: true` pane renders header-only + `is-collapsed`; siblings stay expanded', () => {
    const { envelope } = assemble({
      specs: [{ id: 'doc-nav' }, { id: 'search' }],
      layout: makeLayout({ panes: [collapsedEntry('doc-nav', true, 0), collapsedEntry('search', false, 1)] }),
    })
    const collapsed = paneRoot(envelope, 'doc-nav')
    expect(classesOf(collapsed)).toContain('is-collapsed')
    expect(hasBody(walk(collapsed), 'doc-nav')).toBe(false)
    expect(clickHandlerNodes(walk(collapsed)).length).toBeGreaterThan(0)

    // §3.7 — collapsing one pane does not affect a sibling's state.
    const sibling = paneRoot(envelope, 'search')
    expect(classesOf(sibling)).not.toContain('is-collapsed')
    expect(hasBody(walk(sibling), 'search')).toBe(true)
  })

  it('§3.6/§2.1 — the assembled collapse control is an app-graph node carrying an `on:click` handler', () => {
    const { envelope } = assemble({ specs: [{ id: 'doc-nav' }] })
    const controls = clickHandlerNodes(allNodes(envelope))
    expect(controls.length).toBeGreaterThan(0)
    // The control lives inside the `pane-<id>` subtree (the frame), not loose.
    const root = paneRoot(envelope, 'doc-nav')
    expect(clickHandlerNodes(walk(root)).length).toBeGreaterThan(0)
  })

  it('F1 — a `collapsed` entry for a pane not present is ignored (no phantom pane node)', () => {
    const { envelope } = assemble({
      specs: [{ id: 'doc-nav' }],
      layout: makeLayout({ panes: [collapsedEntry('ghost', true, 0), collapsedEntry('doc-nav', false, 1)] }),
    })
    expect(findById(envelope, 'pane-ghost')).toBeUndefined()
    expect(paneRoot(envelope, 'doc-nav')).toBeDefined()
  })

  it('§3.5 — the collapse state survives a RAG content change (node identity + mirror preserved)', () => {
    const layout = makeLayout({ panes: [collapsedEntry('doc-nav', true, 0)] })
    const first = assemble({ specs: [{ id: 'doc-nav' }], layout, env: baseEnvelope('one') })
    const second = assemble({ specs: [{ id: 'doc-nav' }], layout, env: baseEnvelope('two') })
    expect(paneRoot(second.envelope, 'doc-nav')?.props?.id).toBe('pane-doc-nav')
    expect(paneRoot(second.envelope, 'doc-nav')?.props?.id).toBe(
      paneRoot(first.envelope, 'doc-nav')?.props?.id,
    )
    expect(classesOf(paneRoot(second.envelope, 'doc-nav'))).toContain('is-collapsed')
    expect(hasBody(walk(paneRoot(second.envelope, 'doc-nav')), 'doc-nav')).toBe(false)
  })
})

// ===========================================================================
// §2.3 — persistence through the C9 `OperatorSettings.layout` carrier.
// ===========================================================================
describe('U-SHELL-3 — `collapsed` persistence through OperatorSettings.layout (§2.3)', () => {
  it('§2.3 — a `collapsed` mutation round-trips through set + get and persists to JSON', () => {
    withTempStore((path, store) => {
      const next = makeLayout({ panes: [collapsedEntry('doc-nav', true, 0)] })
      store.set({ layout: next } as never)
      expect(layoutOf(store).panes[0].collapsed).toBe(true)
      const raw = JSON.parse(readFileSync(path, 'utf8'))
      expect(raw.layout.panes[0].collapsed).toBe(true)
    })
  })

  it('§3.4 — a persisted `collapsed: true` renders collapsed after restart (reload + assemble)', () => {
    withTempStore((path, store) => {
      store.set({ layout: makeLayout({ panes: [collapsedEntry('doc-nav', true, 0)] }) } as never)
      const reloaded = createOperatorSettingsStore({ path })
      const persisted = layoutOf(reloaded)
      expect(persisted.panes[0].collapsed).toBe(true)

      const { envelope } = assemble({ specs: [{ id: 'doc-nav' }], layout: persisted })
      expect(classesOf(paneRoot(envelope, 'doc-nav'))).toContain('is-collapsed')
      expect(hasBody(walk(paneRoot(envelope, 'doc-nav')), 'doc-nav')).toBe(false)
    })
  })

  it('F4 — a malformed persisted `collapsed` coerces to `false` (expanded), never throws', () => {
    withTempStore((path) => {
      writeFileSync(
        path,
        JSON.stringify({
          layout: { version: 1, panes: [{ id: 'doc-nav', zone: 'left', order: 0, collapsed: 'yes' }] },
        }),
      )
      const store = createOperatorSettingsStore({ path })
      expect(layoutOf(store).panes[0].collapsed).toBe(false)
    })
  })

  it('F4 — the pure coercion treats every non-`true` value as expanded (expanded default)', () => {
    for (const bad of ['yes', 'true', 1, 0, {}, null, undefined, []]) {
      const l = coerceLayout({
        version: 1,
        panes: [{ id: 'doc-nav', zone: 'left', order: 0, collapsed: bad }],
      })
      expect(l.panes[0].collapsed).toBe(false)
    }
  })
})

// ===========================================================================
// F2 — toggling while an edit is dirty is content-safe (queued via the
// dirty-edit guard). A layout/collapse write re-renders through the same
// settings-broadcast → `requestRebuild` path as any other operator change.
// ===========================================================================
describe('U-SHELL-3 — F2: a collapse/layout change while an edit is dirty is QUEUED', () => {
  function makeHost() {
    installShim()
    const mount = mountEl() as never
    const operatorMount = mountEl() as never
    const registry = createPaneRegistry()
    const backRefs = new Map<string, string[]>()
    const onRebuild = vi.fn()
    const editController = createEditController({
      backRefs,
      commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
      onRebuild,
    })
    const host = new SidebarPanes({
      mount,
      operatorMount,
      registry,
      bridge: {} as never,
      backRefs,
      editController,
    })
    return { host, editController, onRebuild }
  }

  it('F2 — a settings broadcast carrying a collapsed layout is queued while dirty, then applied', () => {
    const h = makeHost()
    h.editController.markDirty('n1')
    // The main-process broadcast a `setLayout` write triggers (the host treats
    // the payload as authoritative — W2-N1).
    ;(h.host as unknown as { onOperatorSettingsChanged(p: unknown): void }).onOperatorSettingsChanged({
      enabledPanes: [],
      defaultDocumentId: null,
      topK: 5,
      editingMode: 'contenteditable',
      theme: 'system',
      layout: makeLayout({ panes: [collapsedEntry('doc-nav', true, 0)] }),
    })
    // The collapse re-render must NOT clobber the in-progress edit.
    expect(h.editController.hasQueuedRebuild()).toBe(true)
    expect(h.onRebuild).not.toHaveBeenCalled()
    h.editController.clearDirty('n1')
    expect(h.onRebuild).toHaveBeenCalledTimes(1)
    expect(h.editController.hasQueuedRebuild()).toBe(false)
  })
})

// ===========================================================================
// §2.1/§2.3 — adversarial H1/H3/H5: the host collapse seam's placement
// defaults, scope gate, and guarded persist.
// ===========================================================================
describe('U-SHELL-3 — adversarial H1/H3/H5: placement defaults + scope gate + guarded persist', () => {
  it('H1 — toggling a pane ABSENT from layout.panes targets its `defaultZone` at `defaultOrder`', () => {
    const { host, set } = makeTogglableHost([
      { id: 'doc-nav' },
      { id: 'notes', defaultZone: 'right', defaultOrder: 3 },
    ])
    toggle(host, 'notes')
    expect(set).toHaveBeenCalledTimes(1)
    const patch = set.mock.calls[0][0] as { layout: LayoutState }
    const entry = patch.layout.panes.find((p) => p.id === 'notes')
    expect(entry).toBeDefined()
    // The append branch must NOT hardcode `left`/`panes.length`.
    expect(entry?.zone).toBe('right')
    expect(entry?.order).toBe(3)
    expect(entry?.collapsed).toBe(true)
  })

  it('H3 — toggling an operator-scope pane does not write the layout', () => {
    const { host, set } = makeTogglableHost([{ id: 'settings', scope: 'operator' }])
    toggle(host, 'settings')
    expect(set).not.toHaveBeenCalled()
  })

  it('H3 — toggling a disabled app-graph pane does not write the layout', () => {
    const { host, registry, set } = makeTogglableHost([{ id: 'doc-nav' }])
    registry.disable('doc-nav')
    toggle(host, 'doc-nav')
    expect(set).not.toHaveBeenCalled()
  })

  it('H5 — setLayout with a bridge lacking operatorSettings does not throw (layout still applies)', () => {
    const host = makeNoSettingsHost([])
    const next = makeLayout({ panes: [collapsedEntry('doc-nav', true, 0)] })
    expect(() => host.setLayout(next)).not.toThrow()
    expect((host as unknown as { layout: LayoutState | null }).layout?.panes[0].collapsed).toBe(true)
  })

  it('H5 — togglePaneCollapse with a bridge lacking operatorSettings does not throw', () => {
    const host = makeNoSettingsHost([{ id: 'doc-nav' }])
    expect(() => toggle(host, 'doc-nav')).not.toThrow()
  })
})

// ===========================================================================
// §5 — the `is-collapsed` cssDef rule in the shell grid (index.html).
// ===========================================================================
describe('U-SHELL-3 — the `is-collapsed` frame CSS rule (spec §5 census)', () => {
  const html = readFileSync(
    fileURLToPath(new URL('../src/renderer/index.html', import.meta.url)),
    'utf8',
  )
  const style = html.slice(html.indexOf('<style>'), html.indexOf('</style>'))

  it('index.html authors an `is-collapsed` rule that collapses the pane body (header/handle only)', () => {
    expect(style).toContain('is-collapsed')
  })
})

// ===========================================================================
// §3 state 6 + F5 — MCP-visible equivalence + the stale-dispatch no-op. These
// are NOT node-testable (they require the live Runtime + `provident.dispatch`);
// verified by code review / the e2e battery (the U-SHELL-1 / Unit K convention).
// ===========================================================================
describe.skip('U-SHELL-3 — MCP-visible equivalence (battery / live host)', () => {
  it.skip('§3.6 — `provident.list_targets` includes the per-frame collapse control', () => {})
  it.skip('§3.6 — `provident.dispatch` on the collapse control toggles the same state as a DOM click', () => {})
  it.skip('§2.2 — `get_rendered_html` reflects the collapsed header-only body', () => {})
  it.skip('F5 — dispatch on a stale node id is a no-op and never mutates a sibling', () => {})
})
