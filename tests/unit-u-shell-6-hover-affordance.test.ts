// tests/unit-u-shell-6-hover-affordance.test.ts — Unit U-SHELL-6 (C6): the
// shared hover affordance. Derived from
// docs/specs/unit-u-shell-6-hover-affordance.md + wave-1-open-decisions W1-Q8:
// every provident node that carries a click/select handler authors the token
// class `is-clickable` (via `css.classes`), and a global stylesheet rule
// (`.is-clickable { cursor: pointer }` + `.is-clickable:hover { background:
// var(--hover) }`) ships the hover style. Node-testable against the PURE render
// helpers (pane-graph.ts gnosis document/wiki items, template-pane.ts controls)
// + the GnosisCrudPanes host buttons. A node WITHOUT a handler must NOT carry
// the class (presentation only — U-PARITY-DOCNAV owns adding handlers).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  gnosisDocumentsContent,
  gnosisWikisContent,
} from '../src/renderer/pane-graph.js'
import { createTemplateEditorPane } from '../src/renderer/template-pane.js'
import { GnosisCrudPanes } from '../src/renderer/gnosis-crud-panes.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { GnosisPanes } from '../src/renderer/gnosis-panes.js'
import { paneEnvelope } from '../src/renderer/secure-panels.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

// ---------------------------------------------------------------------------
// The render-shared surface (RED until implemented).
// ---------------------------------------------------------------------------
interface RenderShared {
  IS_CLICKABLE: string
  clickableClasses(extra?: string[]): string[]
}

async function loadShared(): Promise<RenderShared> {
  try {
    return (await import('../src/renderer/render-shared.js')) as RenderShared
  } catch (e) {
    throw new Error(
      'src/renderer/render-shared.ts not implemented (U-SHELL-6 RED — needs the Implementer)',
      { cause: e },
    )
  }
}

// ---------------------------------------------------------------------------
// Node-tree helpers (loose structural typing — the render output is
// LegacyNodeData).
// ---------------------------------------------------------------------------
interface AnyNode {
  type?: string
  content?: unknown
  props?: Record<string, unknown>
  css?: { classes?: string[] }
  handlers?: Array<{ name?: string; event?: string }>
  children?: AnyNode[]
}

function walk(node: AnyNode | null | undefined, out: AnyNode[] = []): AnyNode[] {
  if (node == null || typeof node !== 'object') return out
  out.push(node)
  for (const child of node.children ?? []) walk(child, out)
  return out
}

function classesOf(node: AnyNode): string[] {
  return node.css?.classes ?? []
}

function assertHandlerConvention(root: AnyNode, label: string): number {
  const nodes = walk(root)
  const withHandlers = nodes.filter((n) => (n.handlers?.length ?? 0) > 0)
  // Every handler-bearing node must advertise `is-clickable` (the shared
  // authoring convention, W1-Q8).
  for (const n of withHandlers) {
    expect(
      classesOf(n),
      `${label}: handler node <${String(n.type)}> must carry is-clickable`,
    ).toContain('is-clickable')
  }
  // No non-handler node may carry it (presentation does NOT imply interaction).
  const withoutHandlers = nodes.filter((n) => (n.handlers?.length ?? 0) === 0)
  for (const n of withoutHandlers) {
    expect(
      classesOf(n),
      `${label}: non-handler node <${String(n.type)}> must NOT carry is-clickable`,
    ).not.toContain('is-clickable')
  }
  return withHandlers.length
}

// ---------------------------------------------------------------------------
// Fixtures.
// ---------------------------------------------------------------------------
const WIKI = { wikiId: 'w1', name: 'Wiki One' }
const DOC = { documentId: 'd1', title: 'Doc One', revision: 3, state: 'Draft' }

function templatePaneContext(withZones: boolean): never {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'custom-root' },
        children: withZones
          ? [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }]
          : [],
      },
    },
    targetedZones: withZones ? ['main'] : [],
  } as never
}

// ---------------------------------------------------------------------------
// 1. The shared convention primitive.
// ---------------------------------------------------------------------------
describe('U-SHELL-6 — the shared is-clickable convention (render-shared)', () => {
  it('exports IS_CLICKABLE === "is-clickable"', async () => {
    const { IS_CLICKABLE } = await loadShared()
    expect(IS_CLICKABLE).toBe('is-clickable')
  })

  it('clickableClasses() yields the token class and MERGES (never drops) existing classes', async () => {
    const { IS_CLICKABLE, clickableClasses } = await loadShared()
    expect(clickableClasses()).toEqual([IS_CLICKABLE])
    const merged = clickableClasses(['btn', 'row'])
    expect(merged).toContain('btn')
    expect(merged).toContain('row')
    expect(merged).toContain(IS_CLICKABLE)
    // idempotent — an already-clickable node is not double-classed.
    expect(clickableClasses([IS_CLICKABLE])).toEqual([IS_CLICKABLE])
  })
})

// ---------------------------------------------------------------------------
// 2. The handler-bearing pane render helpers.
// ---------------------------------------------------------------------------
describe('U-SHELL-6 — handler-bearing app-graph render helpers carry is-clickable', () => {
  it('gnosisDocumentsContent: every handler node (wiki + document items) carries is-clickable; non-handler nodes do not', () => {
    const root = gnosisDocumentsContent({} as never, {
      wikis: [WIKI],
      documents: { items: [DOC] },
      document: DOC,
      conflict: null,
    } as never) as unknown as AnyNode
    const n = assertHandlerConvention(root, 'gnosisDocumentsContent')
    expect(n).toBeGreaterThan(0)
  })

  it('gnosisWikisContent: every handler node (wiki items) carries is-clickable; non-handler nodes do not', () => {
    const root = gnosisWikisContent({} as never, {
      wikis: [WIKI],
      wiki: WIKI,
    } as never) as unknown as AnyNode
    const n = assertHandlerConvention(root, 'gnosisWikisContent')
    expect(n).toBeGreaterThan(0)
  })

  it('createTemplateEditorPane().render: every handler node (zone-remove + add/reset buttons) carries is-clickable; non-handler nodes do not', () => {
    const pane = createTemplateEditorPane()
    const root = pane.render(templatePaneContext(true)) as unknown as AnyNode
    const n = assertHandlerConvention(root, 'template-editor')
    expect(n).toBeGreaterThan(0)
  })

  it('GnosisCrudPanes: every handler-bearing host control (buttons) carries is-clickable', () => {
    const registry = createPaneRegistry()
    const panes = new GnosisCrudPanes({
      registry,
      bridge: {
        gnosis: { documents: async () => null, wikis: async () => null },
        security: { get: async () => ({ enabled: ['gnosis', 'gnosis-edit'] }) },
      } as never,
      onChanged: () => {},
    })
    panes.registerPanes()

    const documents = registry.get('gnosis-documents')
    const wikis = registry.get('gnosis-wikis')
    expect(documents).toBeDefined()
    expect(wikis).toBeDefined()

    const docRoot = documents!.render({} as never) as unknown as AnyNode
    const wikiRoot = wikis!.render({} as never) as unknown as AnyNode
    const docHandlers = assertHandlerConvention(docRoot, 'gnosis-documents pane')
    const wikiHandlers = assertHandlerConvention(wikiRoot, 'gnosis-wikis pane')
    expect(docHandlers).toBeGreaterThan(0)
    expect(wikiHandlers).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// 2b. W1-N4 — the remaining shell hosts' handler-bearing nodes (gnosis-panes,
// secure-panels, sidebar-panes). Same invariant, authored-node inspection.
// ---------------------------------------------------------------------------
describe('U-SHELL-6 — W1-N4 shell host handler nodes carry is-clickable', () => {
  it('GnosisPanes: the status-refresh + query-submit controls carry is-clickable; non-handler nodes do not', () => {
    const registry = createPaneRegistry()
    const panes = new GnosisPanes({
      registry,
      bridge: {
        gnosis: { status: async () => null, query: async () => null },
        security: { get: async () => ({ enabled: ['gnosis'] }) },
      } as never,
      onChanged: () => {},
    })
    panes.registerPanes()

    const statusRoot = registry.get('gnosis-status')!.render({} as never) as unknown as AnyNode
    const queryRoot = registry.get('gnosis-query')!.render({} as never) as unknown as AnyNode
    expect(assertHandlerConvention(statusRoot, 'gnosis-status pane')).toBeGreaterThan(0)
    expect(assertHandlerConvention(queryRoot, 'gnosis-query pane')).toBeGreaterThan(0)
  })

  it('paneEnvelope (secure-panels): group toggles + token/journal controls carry is-clickable; non-handler nodes do not', () => {
    const root = paneEnvelope().template.root as unknown as AnyNode
    expect(assertHandlerConvention(root, 'secure-panels envelope')).toBeGreaterThan(0)
  })

  it('SidebarPanes settings pane: editing-mode toggle + registry-manage buttons carry is-clickable; non-handler nodes do not', () => {
    const registry = createPaneRegistry()
    const host = new SidebarPanes({
      mount: {} as never,
      operatorMount: {} as never,
      registry,
      bridge: {} as never,
      backRefs: new Map(),
      editController: {} as never,
    })
    host.registerPanes()
    // Seed the operator state the settings render reads (the manage rows render
    // only with a listing; the confirmation strip only with a pending op).
    const state = host as unknown as { lastStoreListing: unknown; pendingRegMgmt: unknown }
    state.lastStoreListing = {
      stores: [
        { name: 'main', default: true, persistenceFile: 'main.json', corpusRoot: null, status: 'loaded' },
        { name: 'research', default: false, persistenceFile: 'research.json', corpusRoot: '/corpus', status: 'loaded' },
      ],
    }
    state.pendingRegMgmt = { request: { op: 'remove', name: 'research' }, summary: 'Remove research?' }

    const root = registry.get('settings')!.render({} as never) as unknown as AnyNode
    expect(assertHandlerConvention(root, 'settings pane')).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// 3. The global stylesheet rule (token-driven, themeable with C1).
// ---------------------------------------------------------------------------
describe('U-SHELL-6 — the global hover stylesheet rule', () => {
  const html = readFileSync(
    fileURLToPath(new URL('../src/renderer/index.html', import.meta.url)),
    'utf8',
  )

  it('.is-clickable carries cursor:pointer', () => {
    expect(html).toMatch(/\.is-clickable\s*\{[^}]*cursor:\s*pointer/)
  })

  it('.is-clickable:hover uses the --hover appearance token', () => {
    expect(html).toMatch(/\.is-clickable:hover\s*\{[^}]*var\(--hover\)/)
  })
})
