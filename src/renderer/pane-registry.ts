// src/renderer/pane-registry.ts — Unit H: the host-side pane registry
// (docs/specs/unit-h-sidebar-panes.md §5.1, §5.8, §5.9). A PURE module (no
// Electron) — the single authority over which sidebar panes exist and which
// are enabled. Holds the `PaneDefinition` records + an enabled-state map.
import type { LegacyNodeData } from 'provident-ssr'
import type { RagNode, RagEdge } from '../main/rag-store.js'
import type { CrosslinkWiring } from '../main/traversal.js'

/** The scope of a sidebar pane. 'app-graph' panes render in the app Runtime
 *  graph → MCP-visible. 'operator' panes render in an isolated GraphScope →
 *  NOT MCP-visible (operator-only content). */
export type PaneScope = 'app-graph' | 'operator'

/** The host-provided data a pane's render reads. The registry treats this as
 *  opaque (a type parameter defaulting to PaneContext); the host (SidebarPanes)
 *  supplies it. */
export interface PaneContext {
  /** The current RAG store snapshot (nodes + edges), fetched over the
   *  `rag-snapshot` IPC. The doc-nav pane derives the document list from the
   *  `doc-head` edges. */
  snapshot: { nodes: RagNode[]; edges: RagEdge[] }
  /** The current document root id (the single-document view). null if none. */
  currentDocumentId: string | null
  /** The currently-selected RAG node id (the crosslink pane's focus node). */
  currentNodeId: string | null
  /** The back-reference map (the SOLE authoritative carrier). */
  backRefs: Map<string, string[]>
  /** The traversal's crosslink wiring (the outgoing crosslinks of the current
   *  materialization). */
  crosslinks: CrosslinkWiring[]
}

/** A sidebar pane. `render` authors the pane's content as provident-ssr data.
 *  For an 'app-graph' pane it returns a content ROOT (a LegacyNodeData the
 *  assembler attaches into the sidebar zone); for an 'operator' pane it returns
 *  a section (a LegacyNodeData mounted in the isolated-scope envelope). */
export interface PaneDefinition<C = PaneContext> {
  id: string
  title: string
  scope: PaneScope
  render: (ctx: C) => LegacyNodeData
}

/** One enabled-state change notification. */
export interface PaneChange {
  id: string
  enabled: boolean
}

export interface PaneRegistry {
  register(def: PaneDefinition): void
  get(id: string): PaneDefinition | undefined
  list(): PaneDefinition[]
  listByScope(scope: PaneScope): PaneDefinition[]
  isEnabled(id: string): boolean
  enable(id: string): void
  disable(id: string): void
  setEnabled(id: string, enabled: boolean): void
  onChanged(cb: (change: PaneChange) => void): () => void
}

export function createPaneRegistry(): PaneRegistry {
  const defs: PaneDefinition[] = []
  const enabled = new Map<string, boolean>()
  const subscribers: Array<(change: PaneChange) => void> = []

  function requireKnown(id: string): PaneDefinition {
    const d = defs.find((p) => p.id === id)
    if (!d) throw new Error(`pane registry: unknown pane "${id}"`)
    return d
  }

  function setState(id: string, value: boolean): void {
    requireKnown(id)
    if (enabled.get(id) === value) return // a no-op — never notifies
    enabled.set(id, value)
    const change: PaneChange = { id, enabled: value }
    // H4 (adversarial): iterate a SNAPSHOT copy of the subscriber list so a
    // subscriber that unsubscribes itself during iteration cannot splice the
    // live array and skip later subscribers; and wrap each callback in
    // try/catch so ONE throwing subscriber can never starve the rest of the
    // change. Every subscriber (as of the change) receives the change.
    for (const cb of [...subscribers]) {
      try {
        cb(change)
      } catch {
        // swallow a subscriber error — a throwing subscriber must not block
        // later subscribers from receiving the change.
      }
    }
  }

  return {
    register(def: PaneDefinition): void {
      if (def == null) throw new Error('pane registry: definition required')
      if (typeof def.id !== 'string' || def.id === '') {
        throw new Error('pane registry: id must be a non-empty string')
      }
      if (typeof def.title !== 'string' || def.title === '') {
        throw new Error('pane registry: title must be a non-empty string')
      }
      if (def.scope !== 'app-graph' && def.scope !== 'operator') {
        throw new Error(`pane registry: invalid scope "${String(def.scope)}"`)
      }
      if (typeof def.render !== 'function') {
        throw new Error('pane registry: render must be a function')
      }
      if (defs.some((p) => p.id === def.id)) {
        throw new Error(`pane registry: duplicate id "${def.id}"`)
      }
      defs.push(def)
      enabled.set(def.id, false) // newly registered panes are DISABLED
    },
    get(id: string): PaneDefinition | undefined {
      return defs.find((p) => p.id === id)
    },
    list(): PaneDefinition[] {
      return defs
    },
    listByScope(scope: PaneScope): PaneDefinition[] {
      return defs.filter((p) => p.scope === scope)
    },
    isEnabled(id: string): boolean {
      return enabled.get(id) === true
    },
    enable(id: string): void {
      requireKnown(id)
      setState(id, true)
    },
    disable(id: string): void {
      requireKnown(id)
      setState(id, false)
    },
    setEnabled(id: string, value: boolean): void {
      requireKnown(id)
      setState(id, value)
    },
    onChanged(cb: (change: PaneChange) => void): () => void {
      if (typeof cb !== 'function') {
        throw new Error('pane registry: onChanged requires a callback')
      }
      subscribers.push(cb)
      return () => {
        const idx = subscribers.indexOf(cb)
        if (idx >= 0) subscribers.splice(idx, 1)
      }
    },
  }
}
