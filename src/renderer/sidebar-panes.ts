// src/renderer/sidebar-panes.ts — Unit K: the `SidebarPanes` renderer host
// (docs/specs/unit-k-sidebar-panes-host.md §5.6). The host wires the app-graph
// panes (doc-nav/crosslinks/search/template-editor) + the operator `settings`
// pane into the live renderer: the boot wiring (replacing the `demoEnvelope()`
// bootstrap), the re-derive wiring (rag-store-changed + template-changed), the
// pane registration + handler binding, and the operator mount (the isolated
// `createIsolatedScope()` GraphScope settings pane).
//
// STAGE 1 (this pass): the module + the supporting surfaces are wired so the
// import resolves and the build/typecheck pass. The host method BODIES are
// stubbed (`throw new Error('not implemented')`) — the next stage fills them in.
//
// NOTE: this module must NOT import from `src/main/preload.ts` (which imports
// `electron`) — the renderer bundle is built for the browser platform. The
// bridge surface is declared structurally here (the `SidebarBridge` type).
import type { LegacyInitialData } from 'provident-ssr'
import type { Runtime } from './runtime.js'
import type { PaneContext, PaneRegistry } from './pane-registry.js'
import type { AppGraphAssemblyResult } from './pane-graph.js'
import type { TemplatePaneContext } from './template-pane.js'
import type { EditController } from './edit-controller.js'
import type {
  RagSnapshotPayload,
  RagQueryResult,
  TemplateChangedPayload,
  SecuritySettings,
  OperatorSettings,
  OperatorSettingsPatch,
} from '../shared/types.js'
import type { BacklinkResult } from '../main/backlinks.js'
import type { CrosslinkWiring } from '../main/traversal.js'
import type { ContentWindowTemplate } from '../main/template-shape.js'

/** The Unit D §5.1.9 `rag-store-changed` payload (declared structurally here —
 *  the canonical type lives in `src/main/preload.ts`, which the renderer bundle
 *  cannot import). */
export interface RagStoreChangedPayload {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}

/** The preload IPC bridge surface the host consumes (structural — the canonical
 *  `ProvidentBridge` lives in `src/main/preload.ts`, which the renderer bundle
 *  cannot import). */
export interface SidebarBridge {
  security: {
    get(): Promise<SecuritySettings>
  }
  edit: {
    onRagStoreChanged(handler: (payload: RagStoreChangedPayload) => void): () => void
  }
  rag: {
    query(query: string, topK?: number): Promise<RagQueryResult>
    snapshot(): Promise<RagSnapshotPayload>
    backlinks(nodeId: string): Promise<BacklinkResult>
  }
  template: {
    get(): Promise<{ source: string; template: ContentWindowTemplate }>
    create(zone: string, id?: string): Promise<{ source: string; template: ContentWindowTemplate }>
    delete(zone: string): Promise<{ source: string; template: ContentWindowTemplate }>
    reset(): Promise<{ source: string; template: ContentWindowTemplate }>
    onTemplateChanged(handler: (payload: TemplateChangedPayload) => void): () => void
  }
  operatorSettings: {
    get(): Promise<OperatorSettings>
    set(patch: OperatorSettingsPatch): Promise<OperatorSettings>
  }
}

export interface SidebarPanesOptions {
  /** The app graph mount (#app) — the app Runtime renders the pane-inclusive
   *  envelope here. */
  mount: HTMLElement
  /** The operator mount (#operator-panes — NOT #panes, which is SecurePanels';
   *  M3) — the settings pane renders in its isolated GraphScope here. */
  operatorMount: HTMLElement
  /** The pane registry (the single authority over enabled panes). */
  registry: PaneRegistry
  /** The preload IPC bridge (window.provident). */
  bridge: SidebarBridge
  /** The current document root id accessor (the single-document view). */
  currentDocumentId: () => string | null
  /** The current node id accessor (the crosslink pane's focus node). */
  currentNodeId: () => string | null
  /** The back-reference map (the edit controller's map — the SOLE authoritative
   *  carrier). The host clears + repopulates it after each buildTraversal. */
  backRefs: Map<string, string[]>
  /** The edit controller (the dirty-edit guard + the re-traversal trigger). The
   *  host's reDerive is the controller's onRebuild callback. */
  editController: EditController
  /** The traversal zone name (default 'main'). */
  zoneName?: string
  /** The sidebar zone name (default SIDEBAR_ZONE). */
  sidebarZone?: string
}

export class SidebarPanes {
  constructor(_opts: SidebarPanesOptions) {
    throw new Error('not implemented')
  }

  /** Host-owned mutable state (M5): `currentDocumentId`/`currentNodeId` are
   *  READ-ONLY getters in `SidebarPanesOptions` — nothing sets them. The host
   *  owns the mutable backing state and exposes setters the handler bodies reach
   *  via the `window.provident.sidebar` bridge (M2). */
  setCurrentDocumentId(_id: string | null): void {
    throw new Error('not implemented')
  }

  setCurrentNodeId(_id: string | null): void {
    throw new Error('not implemented')
  }

  /** Register the concrete panes (doc-nav/crosslinks/search/template-editor
   *  app-graph + settings operator) + enable the app-graph panes + the settings
   *  pane. */
  registerPanes(): void {
    throw new Error('not implemented')
  }

  /** Bind the pane handlers to the IPC bridge (register the handler defs). */
  bindHandlers(): void {
    throw new Error('not implemented')
  }

  /** Build the base PaneContext from the current accessors + backRefs + the
   *  traversal crosslinks + the last-fetched pane data. */
  buildContext(): PaneContext {
    throw new Error('not implemented')
  }

  /** Build the TemplatePaneContext (PaneContext + template + targetedZones). */
  buildTemplateContext(): TemplatePaneContext {
    throw new Error('not implemented')
  }

  /** Assemble the pane-inclusive app-graph envelope from a traversal envelope
   *  + the enabled app-graph panes, recompute the backRefs from the ASSEMBLED
   *  envelope (M14), and LOAD it into the app Runtime. Returns the assembly
   *  result. */
  loadAppGraph(_runtime: Runtime, _traversalEnvelope: LegacyInitialData): AppGraphAssemblyResult {
    throw new Error('not implemented')
  }

  /** Mount the operator settings pane in its OWN isolated GraphScope (the
   *  SecurePanels pattern) from the enabled operator panes. */
  mountOperator(): void {
    throw new Error('not implemented')
  }

  /** Re-fetch the pane data (snapshot/backlinks/query/operator-settings) over
   *  the bridge and re-render. Re-renders the EXISTING app graph + the EXISTING
   *  operator graph (M17) — it NEVER rebuilds the operator envelope or re-runs a
   *  RAG re-traversal. Async. */
  async refresh(): Promise<void> {
    throw new Error('not implemented')
  }

  /** The full boot wiring: register + enable the panes, bind the handlers,
   *  fetch the snapshot + template, buildTraversal → assemble → load the
   *  pane-inclusive envelope, mount the operator pane, subscribe to
   *  rag-store-changed + template-changed. Async. */
  async boot(_runtime: Runtime): Promise<void> {
    throw new Error('not implemented')
  }

  /** The re-derive wiring: fetch the snapshot, buildTraversal (with the stored
   *  template), assemble the pane-inclusive envelope, re-load it into the app
   *  Runtime, repopulate the backRefs map. Async. */
  async reDerive(): Promise<void> {
    throw new Error('not implemented')
  }

  /** The rag-store-changed handler: routes through the edit controller's
   *  dirty-edit guard (requestRebuild). */
  onRagStoreChanged(_payload: RagStoreChangedPayload): void {
    throw new Error('not implemented')
  }

  /** The template-changed handler: updates the stored template + routes through
   *  the edit controller's dirty-edit guard (requestRebuild). */
  onTemplateChanged(_payload: TemplateChangedPayload): void {
    throw new Error('not implemented')
  }
}
