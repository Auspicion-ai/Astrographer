// src/main/preload.ts — the contextBridge between the renderer and the main
// process. The main process owns the MCP server; the renderer owns the
// provident-ssr graph + DOM. Requests flow main → renderer (webContents.send)
// and replies flow renderer → main (send). Exposed as a minimal `provident`
// surface (no Node objects leak into the page).
import { contextBridge, ipcRenderer } from 'electron'
import { IPC_INVOKE, IPC_REPLY, IPC_READY, IPC_SECURITY_GET, IPC_SECURITY_SET, IPC_NOTIFY, IPC_MODULE_GET, IPC_MODULE_SET_DISABLED, IPC_MODULE_TOOL_LIST, IPC_MODULE_TOOL_INVOKE, IPC_EDIT_COMMIT, IPC_EDIT_BATCH, IPC_EDIT_RICH_COMMIT, IPC_RAG_STORE_CHANGED, IPC_RAG_QUERY, IPC_RAG_SNAPSHOT, IPC_RAG_BACKLINKS, IPC_RAG_DOC_HEADS, IPC_RAG_STORE_LISTING, IPC_RAG_STORE_MANAGE, IPC_TEMPLATE_GET, IPC_TEMPLATE_VALIDATE, IPC_TEMPLATE_SET, IPC_TEMPLATE_CREATE, IPC_TEMPLATE_DELETE, IPC_TEMPLATE_RESET, IPC_TEMPLATE_CHANGED, IPC_OPERATOR_SETTINGS_GET, IPC_OPERATOR_SETTINGS_SET, IPC_OPERATOR_SETTINGS_CHANGED, IPC_GNOSIS_STATUS, IPC_GNOSIS_QUERY, IPC_GNOSIS_DOCUMENTS, IPC_GNOSIS_WIKIS, IPC_PANE_CATALOG, IPC_PANE_VISIBILITY, type RpcRequest, type RpcReply, type SecuritySettings, type NotifyPayload, type ModuleListEntry, type ModuleToolInvokePayload, type EditCommitPayload, type EditBatchPayload, type EditRichCommitPayload, type RichCommitResult, type RagQueryPayload, type RagQueryResult, type EditCommitResult, type RagStoreChangedPayload, type RagSnapshotPayload, type RagBacklinksPayload, type RagBacklinksResult, type RagDocHeadsPayload, type RagStoreListingPayload, type RagStoreManageRequest, type RagStoreManageResult, type TemplateChangedPayload, type OperatorSettings, type OperatorSettingsPatch, type PaneCatalogEntry } from '../shared/types.js'
import type { ContentWindowTemplate, TemplateSource, TemplateVerdict } from './template-store.js'
import type { BatchOp, BatchResult, RagNodeChild } from './rag-store.js'
import type { EngineRagResult, HealthReport, EngineRagQueryOptions } from './engine-rag-store.js'

export interface ModuleBridgeResult {
  corrupt: boolean
  quarantined: string[]
  loaded: string[]
  modules: ModuleListEntry[]
}

/** The Unit D §5.1.10 commit result (mirrors the controller's CommitResult). */
export type { EditCommitResult }

/** Unit MS3 §5.1 — a compat RE-EXPORT of the ONE shared `rag-store-changed`
 *  payload declaration (the three-structural-copy collapse; the canonical type
 *  lives in `../shared/types.js`). */
export type { RagStoreChangedPayload }

/** The renderer-registered `window.provident.sidebar` host methods (Unit K M2).
 *  The preload OWNS the exposed `sidebar` object (contextBridge freezes it), so
 *  each exposed method DELEGATES to the installed holder. W1-N11 — the C18/C19
 *  advanced-search/hover-preview seams + the Unit U4 contenteditable rich-editor
 *  seams live here alongside `selectDocument`/`docNavToggle`. */
export interface SidebarMethods {
  selectDocument(id: string): void
  /** W1-N7 (U-PARITY-DOCNAV PG14) — the doc-nav folder toggle seam. The key is
   *  the folder's `data-folder-path`. */
  docNavToggle(key: string): void
  submitQuery(value: string): void
  /** W1-N11 (U-PARITY-C18) — the advanced-search disclosure toggle + submit
   *  seams the `pane-search-advanced-*` handler bodies reach. */
  searchAdvancedToggle(): void
  submitAdvancedQuery(value: string, options: Omit<RagQueryPayload, 'query' | 'topK' | 'store'>): void
  /** W1-N11 (U-PARITY-C19) — the link hover-preview shell timing seams the
   *  `hover-preview-*` handler bodies reach. */
  hoverPreviewEnter(id: string): void
  hoverPreviewLeave(): void
  hoverPreviewPopupEnter(): void
  hoverPreviewPopupLeave(): void
  /** W1-N5 (U-PARITY-PARTIALS §1.1) — the template Validate result seam. */
  templateValidateResult(verdict: unknown): void
  templateAdd(zone: string): void
  templateRemove(zone: string): void
  templateReset(): void
  operatorSet(patch: OperatorSettingsPatch): void
  textareaInput(ragId: string): void
  textareaBlur(ragId: string, value: string): void
  /** W1-N11 (Unit U4) — the contenteditable rich-text handler seams the
   *  `rag-editor-*` handler bodies reach. */
  editorInput(ragId?: string): void
  editorBlur(ragId?: string, html?: string): void
  editorCompositionStart(ragId?: string): void
  editorCompositionEnd(ragId?: string): void
  /** U-H8 — the operator-registry manage dispatch. */
  registryManage(request: RagStoreManageRequest): void
  registryManageDismiss(): void
  gnosisStatus(): void
  gnosisQuery(value: string): void
  gnosisDocuments(tool: string, args: Record<string, unknown>): void
  gnosisWikis(tool: string, args: Record<string, unknown>): void
}

export interface ProvidentBridge {
  ready(): void
  onRequest(handler: (req: RpcRequest) => void): void
  sendReply(reply: RpcReply): void
  notify(payload: NotifyPayload): void
  /** Unit U-MENU-1 §2.2 — the renderer→main pane-catalog push. Sends the live
   *  pane catalog at boot + on every `PaneRegistry` change so the native
   *  View → Panes submenu is data-driven (never hard-coded). */
  pushPaneCatalog(catalog: PaneCatalogEntry[]): void
  /** Unit U-MENU-1 §2.3 — subscribe to the main→renderer pane-visibility action
   *  (`IPC_PANE_VISIBILITY`), sent when a View → Panes checkbox is toggled.
   *  Returns an unsubscribe function. The apply + persistence is U-SHELL-8. */
  onPaneVisibility(handler: (change: { id: string; enabled: boolean }) => void): () => void
  security: {
    get(): Promise<SecuritySettings>
    set(patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }): Promise<SecuritySettings>
  }
  module: {
    get(): Promise<ModuleBridgeResult>
    setDisabled(name: string, disabled: boolean): Promise<ModuleBridgeResult>
    /** W1-N6 (PG12) — the operator-only module-tool runner surface. Lists the
     *  live `CapabilityRouter`'s registered `module:<name>.<tool>` tools; the
     *  SecurePanels module pane authors one selectable row per name. Manual-UI
     *  only (never an MCP tool); if no tools are registered the pane shows the
     *  `(no module tools)` placeholder. */
    listTools(): Promise<string[]>
    /** W1-N6 (PG12) — invoke one registered module tool through the EXISTING
     *  two-gate (`module` AND `code`) in main. Resolves the tool result or
     *  rejects with the router/gate error. Manual-UI only. */
    invoke(tool: string, args: unknown): Promise<unknown>
  }
  edit: {
    /** Unit D §5.1.10 — the UI commit-on-blur write-back. Sends the
     *  `edit-commit` IPC to main, which calls `setContent` on the store (the
     *  SAME edit op as the MCP tool) and broadcasts `rag-store-changed`. */
    commit(nodeId: string, content: string): Promise<EditCommitResult>
    /** Unit P §5.1 — the UI batch write-back. Sends the `edit-batch` IPC to
     *  main, which calls `applyBatch` on the store (the SAME transaction
     *  primitive as the MCP `edit.batch` tool — MCP/UI equivalence, §8.2
     *  BINDING) and broadcasts `rag-store-changed` on success. Returns the
     *  `BatchResult`. */
    batch(ops: BatchOp[]): Promise<BatchResult>
    /** Unit U5 §1.4 — the atomic rich-text write-back. Sends the
     *  `edit-rich-commit` IPC to main, which calls the SAME `setRichText` op
     *  once and derives + broadcasts `rag-store-changed` on a real change.
     *  Returns the `RichCommitResult`. */
    commitRich(nodeId: string, content: string, children: RagNodeChild[]): Promise<RichCommitResult>
    /** Unit D §5.1.9 — subscribe to the `rag-store-changed` re-traversal
     *  trigger. Returns an unsubscribe function. */
    onRagStoreChanged(handler: (payload: RagStoreChangedPayload) => void): () => void
  }
  /** Unit E §5.7/§8.2 — the UI retrieval surface. Sends the `rag-query` IPC to
   *  main, which calls the SAME maintained retrieval engine as the MCP
   *  `rag.query` tool (MCP/UI equivalence). The renderer never computes
   *  retrieval itself. */
  rag: {
    /** U-MS5 — the third optional `store` param (MCP/UI mechanical symmetry,
     *  UI-SELECTOR-DEFERRED). Omitted ⇒ the default store (zero-config
     *  byte-equal; the settings/search pane's own path never passes it).
     *  W1-N9 — the fourth optional `options` param carries the advanced-search
     *  `rag.query` args (mode/maxHops/expand/maxParentContext/filters/stores),
     *  threaded into the SAME `RagQueryPayload` the MCP `rag.query` tool's args
     *  map to (MCP/UI equivalence). Omitted fields stay absent (byte-equal). */
    query(
      query: string,
      topK?: number,
      store?: string,
      options?: Omit<RagQueryPayload, 'query' | 'topK' | 'store'>,
    ): Promise<RagQueryResult>
    /** Finding 3 — the re-traversal data source. Returns a read-only snapshot
     *  of the RAG store (nodes + edges) so the renderer's `onRebuild` can
     *  re-derive the graph + back-reference map after a `rag-store-changed`
     *  broadcast. */
    snapshot(): Promise<RagSnapshotPayload>
    /** Unit G §5.4/§8.2 — the UI backlink surface. Sends the `rag-backlinks`
     *  IPC to main, which calls the SAME host-side enumeration (`enumerateLinks`)
     *  as the MCP `rag.backlinks` tool (MCP/UI equivalence). The renderer never
     *  computes the enumeration itself. */
    backlinks(nodeId: string): Promise<RagBacklinksResult>
    /** Unit V3 — the doc-nav data source. Returns the document list (the
     *  `doc-head` edges' targets + the head node content) — a strict subset of
     *  the snapshot. */
    docHeads(): Promise<RagDocHeadsPayload>
    /** U-MS5 — the read-only settings-pane store listing. Returns the registry's
     *  presentation view (one entry per configured store: name, default flag,
     *  persistence file name, corpus root, per-store load status). Manual-UI only:
     *  never an MCP tool — an agent must not enumerate the configured store names
     *  (B9/A9). */
    stores(): Promise<RagStoreListingPayload>
    /** U-H8 — the operator-registry management surface (the review §2 D6 ONE
     *  exemption). Sends the `rag-store-manage` IPC to main, which validates the
     *  request, reads the live projection, runs the two-phase confirmation (a
     *  destructive op without `confirmed:true` returns `{ confirmationRequired:
     *  true, summary }`), and invokes the LANDED hot-* seams. Manual-UI only:
     *  never an MCP tool — an agent must not add/remove/rename/re-default a
     *  store (A-P2-6/A-P2-7). */
    manage(request: RagStoreManageRequest): Promise<RagStoreManageResult>
  }
  /** Unit I §5.4/§8.2 — the UI template surface. Each method sends the
   *  `code.template.*`-equivalent IPC to main, which delegates to
   *  `handleTemplateTool` with the SAME template store as the MCP tools (MCP/UI
   *  equivalence). The renderer never computes template CRUD itself. */
  template: {
    get(): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    validate(tpl: unknown): Promise<TemplateVerdict>
    set(template: unknown): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    create(zone: string, id?: string): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    delete(zone: string): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    reset(): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    /** Subscribe to the template-change re-derive trigger. Returns an
     *  unsubscribe function. */
    onTemplateChanged(handler: (payload: TemplateChangedPayload) => void): () => void
  }
  /** Unit K §5.4 M9 — the operator-settings surface. The `settings` pane
   *  reads/writes the operator-owned config over these channels; the MCP tool
   *  handlers never route to them, so an agent cannot change the operator's
   *  view/retrieval defaults. */
  operatorSettings: {
    get(): Promise<OperatorSettings>
    set(patch: OperatorSettingsPatch): Promise<OperatorSettings>
    /** Unit U1 §1.3 — subscribe to the operator-settings-change re-derive
     *  trigger; returns an unsubscribe function. */
    onChanged(handler: (settings: OperatorSettings) => void): () => void
  }
  /** Unit GN-MCP-UI §5.5 — the gnosis GUI bridge surface (D4 MCP/UI parity).
   *  Sends the `gnosis-*` IPC to main, which calls the SAME `handleGnosisTool`
   *  handler as the `gnosis.*` MCP tools against the LANDED engine proxy
   *  (MCP/UI equivalence). The renderer never computes engine retrieval itself.
   *  Manual-UI only: never an MCP tool (an agent cannot reach these channels). */
  gnosis: {
    status(): Promise<HealthReport>
    query(query: string, opts?: EngineRagQueryOptions): Promise<EngineRagResult>
    /** Unit A2 §5.5 — the document/wiki CRUD bridge surface (D4 MCP/UI parity).
     *  Sends the `gnosis-documents` IPC to main, which calls the SAME
     *  `handleGnosisTool` handler as the `gnosis.document.*` MCP tools against
     *  the LANDED CRUD proxy (MCP/UI equivalence). The renderer never computes
     *  document CRUD itself. Manual-UI only: never an MCP tool. */
    documents(tool: string, args: Record<string, unknown>): Promise<unknown>
    /** Unit A2 §5.5 — the wiki CRUD bridge surface (D4 MCP/UI parity). Sends the
     *  `gnosis-wikis` IPC to main, which calls the SAME `handleGnosisTool` handler
     *  as the `gnosis.wiki.*` MCP tools against the LANDED CRUD proxy (MCP/UI
     *  equivalence). The renderer never computes wiki CRUD itself. Manual-UI only:
     *  never an MCP tool. */
    wikis(tool: string, args: Record<string, unknown>): Promise<unknown>
  }
  /** Unit K M2 — the `window.provident.sidebar` bridge the compiled handler
   *  bodies call (`var s = window && window.provident && window.provident.sidebar`).
   *  The preload OWNS the `sidebar` object (contextBridge FREEZES everything it
   *  exposes, so the renderer CANNOT attach `sidebar` to `window.provident` at
   *  runtime — a renderer-side attach throws in the real Electron renderer).
   *  `installSidebar(methods)` lets the renderer register its host methods; the
   *  exposed `sidebar.*` methods DELEGATE to the installed holder. */
  sidebar: SidebarMethods
  installSidebar(methods: SidebarMethods): void
}

// The renderer-installed sidebar host methods (Unit K M2 — set via
// `window.provident.installSidebar`). No-ops until the host boots and registers.
let sidebarHolder: SidebarMethods = {
  selectDocument: () => {},
  docNavToggle: () => {},
  submitQuery: () => {},
  searchAdvancedToggle: () => {},
  submitAdvancedQuery: () => {},
  hoverPreviewEnter: () => {},
  hoverPreviewLeave: () => {},
  hoverPreviewPopupEnter: () => {},
  hoverPreviewPopupLeave: () => {},
  templateValidateResult: () => {},
  templateAdd: () => {},
  templateRemove: () => {},
  templateReset: () => {},
  operatorSet: () => {},
  textareaInput: () => {},
  textareaBlur: () => {},
  editorInput: () => {},
  editorBlur: () => {},
  editorCompositionStart: () => {},
  editorCompositionEnd: () => {},
  registryManage: () => {},
  registryManageDismiss: () => {},
  gnosisStatus: () => {},
  gnosisQuery: () => {},
  gnosisDocuments: () => {},
  gnosisWikis: () => {},
}

const bridge: ProvidentBridge = {
  ready(): void {
    ipcRenderer.send(IPC_READY)
  },
  onRequest(handler: (req: RpcRequest) => void): void {
    ipcRenderer.on(IPC_INVOKE, (_event, req: RpcRequest) => {
      handler(req)
    })
  },
  sendReply(reply: RpcReply): void {
    ipcRenderer.send(IPC_REPLY, reply)
  },
  // N4 (live-notification-review.md) — the app-graph-changed push. Sourced
  // ONLY from the app Runtime re-render; main maps it to a resource-updated
  // notification over stdio. The isolated SecurePanels graph NEVER calls this.
  notify(payload: NotifyPayload): void {
    ipcRenderer.send(IPC_NOTIFY, payload)
  },
  // Unit U-MENU-1 §2.2/§2.3 — the application-menu pane-catalog surface. The
  // renderer pushes the live catalog (boot + registry change); main rebuilds the
  // native View → Panes submenu and sends back the toggled pane state.
  pushPaneCatalog(catalog: PaneCatalogEntry[]): void {
    ipcRenderer.send(IPC_PANE_CATALOG, catalog)
  },
  onPaneVisibility(handler: (change: { id: string; enabled: boolean }) => void): () => void {
    const listener = (_event: unknown, change: { id: string; enabled: boolean }): void => {
      handler(change)
    }
    ipcRenderer.on(IPC_PANE_VISIBILITY, listener)
    return () => {
      ipcRenderer.removeListener(IPC_PANE_VISIBILITY, listener)
    }
  },
  // The manual-UI security settings (mcp-endpoint.md §6.4): exposed to the
  // renderer Settings pane ONLY. The MCP tool handlers never route to these
  // channels, so an agent cannot grant itself capabilities.
  security: {
    get(): Promise<SecuritySettings> {
      return ipcRenderer.invoke(IPC_SECURITY_GET)
    },
    set(patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }): Promise<SecuritySettings> {
      return ipcRenderer.invoke(IPC_SECURITY_SET, patch)
    },
  },
  // U8 — the module management bridge (module-feature-list.md §4). Manual-UI
  // only: the module store is operator-owned; an agent never reaches it over MCP.
  module: {
    get(): Promise<ModuleBridgeResult> {
      return ipcRenderer.invoke(IPC_MODULE_GET)
    },
    setDisabled(name: string, disabled: boolean): Promise<ModuleBridgeResult> {
      return ipcRenderer.invoke(IPC_MODULE_SET_DISABLED, { name, disabled })
    },
    // W1-N6 (PG12) — the operator-only module-tool runner surface. Main lists
    // the live router's tools + invokes one through the two-gate. Manual-UI only.
    listTools(): Promise<string[]> {
      return ipcRenderer.invoke(IPC_MODULE_TOOL_LIST)
    },
    invoke(tool: string, args: unknown): Promise<unknown> {
      const payload: ModuleToolInvokePayload = { tool, args }
      return ipcRenderer.invoke(IPC_MODULE_TOOL_INVOKE, payload)
    },
  },
  // Unit D §5.1.9/§5.1.10 — the editing IPC surface. The UI commit-on-blur
  // routes through the SAME edit op (`setContent`) as the MCP tool; the
  // `rag-store-changed` event is the re-traversal trigger.
  edit: {
    commit(nodeId: string, content: string): Promise<EditCommitResult> {
      const payload: EditCommitPayload = { nodeId, content }
      return ipcRenderer.invoke(IPC_EDIT_COMMIT, payload)
    },
    batch(ops: BatchOp[]): Promise<BatchResult> {
      const payload: EditBatchPayload = { ops }
      return ipcRenderer.invoke(IPC_EDIT_BATCH, payload)
    },
    /** Unit U5 §1.4 — the atomic rich-text write-back. Sends the
     *  `edit-rich-commit` IPC to main, which calls the SAME `setRichText` op
     *  once and derives + broadcasts `rag-store-changed` on a real change.
     *  Returns the `RichCommitResult`. */
    commitRich(nodeId: string, content: string, children: RagNodeChild[]): Promise<RichCommitResult> {
      const payload: EditRichCommitPayload = { nodeId, content, children }
      return ipcRenderer.invoke(IPC_EDIT_RICH_COMMIT, payload)
    },
    onRagStoreChanged(handler: (payload: RagStoreChangedPayload) => void): () => void {
      const listener = (_event: unknown, payload: RagStoreChangedPayload): void => {
        handler(payload)
      }
      ipcRenderer.on(IPC_RAG_STORE_CHANGED, listener)
      return () => {
        ipcRenderer.removeListener(IPC_RAG_STORE_CHANGED, listener)
      }
    },
  },
  // Unit E §5.7/§8.2 — the UI retrieval surface. The `rag-query` IPC calls the
  // same maintained retrieval engine as the MCP `rag.query` tool.
  rag: {
    /** U-MS5 — the third optional `store` param builds the payload via the
     *  conditional-spread idiom (byte-equal: included ONLY when passed — a
     *  two-arg call carries NO `store` key, A4). */
    query(query: string, topK?: number, store?: string, options?: Omit<RagQueryPayload, 'query' | 'topK' | 'store'>): Promise<RagQueryResult> {
      // W1-N9 — the advanced-search args use the same conditional-spread idiom
      // as topK/store: an absent field is ABSENT from the payload (byte-equal).
      const o = options ?? {}
      const payload: RagQueryPayload = {
        query,
        ...(topK !== undefined ? { topK } : {}),
        ...(store !== undefined ? { store } : {}),
        ...(o.mode !== undefined ? { mode: o.mode } : {}),
        ...(o.maxHops !== undefined ? { maxHops: o.maxHops } : {}),
        ...(o.expand !== undefined ? { expand: o.expand } : {}),
        ...(o.maxParentContext !== undefined ? { maxParentContext: o.maxParentContext } : {}),
        ...(o.filters !== undefined ? { filters: o.filters } : {}),
        ...(o.stores !== undefined ? { stores: o.stores } : {}),
      }
      return ipcRenderer.invoke(IPC_RAG_QUERY, payload)
    },
    /** Finding 3 — the re-traversal data source. Returns a read-only snapshot
     *  of the RAG store (nodes + edges) so the renderer's `onRebuild` can
     *  re-derive the graph + back-reference map after a `rag-store-changed`
     *  broadcast. */
    snapshot(): Promise<RagSnapshotPayload> {
      return ipcRenderer.invoke(IPC_RAG_SNAPSHOT)
    },
    /** Unit G §5.4/§8.2 — the UI backlink surface. Sends the `rag-backlinks`
     *  IPC to main, which calls the SAME host-side enumeration (`enumerateLinks`)
     *  as the MCP `rag.backlinks` tool (MCP/UI equivalence). */
    backlinks(nodeId: string): Promise<RagBacklinksResult> {
      const payload: RagBacklinksPayload = { nodeId }
      return ipcRenderer.invoke(IPC_RAG_BACKLINKS, payload)
    },
    /** Unit V3 — the doc-nav data source. Sends the `rag-doc-heads` IPC to main,
     *  which returns the document list (the `doc-head` edges' targets + the head
     *  node content) — a strict subset of the snapshot. */
    docHeads(): Promise<RagDocHeadsPayload> {
      return ipcRenderer.invoke(IPC_RAG_DOC_HEADS)
    },
    /** U-MS5 — the read-only settings-pane store listing. Sends the
     *  `rag-store-listing` IPC to main, which projects the boot-loaded registry's
     *  presentation view (name, default flag, persistence file name, corpus root,
     *  per-store load status). */
    stores(): Promise<RagStoreListingPayload> {
      return ipcRenderer.invoke(IPC_RAG_STORE_LISTING)
    },
    /** U-H8 — the operator-registry manage dispatch. Sends the `rag-store-manage`
     *  IPC to main, which validates the request, reads the live projection, runs
     *  the two-phase confirmation, and invokes the LANDED hot-* seams. */
    manage(request: RagStoreManageRequest): Promise<RagStoreManageResult> {
      return ipcRenderer.invoke(IPC_RAG_STORE_MANAGE, request)
    },
  },
  /** Unit I §5.4/§8.2 — the UI template surface. Each method sends the
   *  `code.template.*`-equivalent IPC to main, which delegates to
   *  `handleTemplateTool` with the SAME template store as the MCP tools (MCP/UI
   *  equivalence). The renderer never computes template CRUD itself. */
  template: {
    get(): Promise<{ source: TemplateSource; template: ContentWindowTemplate }> {
      return ipcRenderer.invoke(IPC_TEMPLATE_GET)
    },
    validate(tpl: unknown): Promise<TemplateVerdict> {
      // MCP/UI equivalence: `handleTemplateTool` reads `args.template`, so the
      // IPC payload must wrap the template like `set` does (`{ template: tpl }`).
      // Sending the raw `tpl` made `args.template` undefined → invalid-shape.
      return ipcRenderer.invoke(IPC_TEMPLATE_VALIDATE, { template: tpl })
    },
    set(template: unknown): Promise<{ source: TemplateSource; template: ContentWindowTemplate }> {
      return ipcRenderer.invoke(IPC_TEMPLATE_SET, { template })
    },
    create(zone: string, id?: string): Promise<{ source: TemplateSource; template: ContentWindowTemplate }> {
      return ipcRenderer.invoke(IPC_TEMPLATE_CREATE, { zone, ...(id !== undefined ? { id } : {}) })
    },
    delete(zone: string): Promise<{ source: TemplateSource; template: ContentWindowTemplate }> {
      return ipcRenderer.invoke(IPC_TEMPLATE_DELETE, { zone })
    },
    reset(): Promise<{ source: TemplateSource; template: ContentWindowTemplate }> {
      return ipcRenderer.invoke(IPC_TEMPLATE_RESET)
    },
    /** Subscribe to the template-change re-derive trigger. Returns an
     *  unsubscribe function. */
    onTemplateChanged(handler: (payload: TemplateChangedPayload) => void): () => void {
      const listener = (_event: unknown, payload: TemplateChangedPayload): void => {
        handler(payload)
      }
      ipcRenderer.on(IPC_TEMPLATE_CHANGED, listener)
      return () => {
        ipcRenderer.removeListener(IPC_TEMPLATE_CHANGED, listener)
      }
    },
  },
  // Unit K §5.4 M9 — the operator-settings surface. Manual-UI only: the
  // `settings` pane reads/writes the operator-owned config over these channels;
  // the MCP tool handlers never route to them, so an agent cannot change the
  // operator's view/retrieval defaults.
  operatorSettings: {
    get(): Promise<OperatorSettings> {
      return ipcRenderer.invoke(IPC_OPERATOR_SETTINGS_GET)
    },
    set(patch: OperatorSettingsPatch): Promise<OperatorSettings> {
      return ipcRenderer.invoke(IPC_OPERATOR_SETTINGS_SET, patch)
    },
    /** Unit U1 §1.3 — subscribe to the operator-settings-change re-derive
     *  trigger. Returns an unsubscribe function. */
    onChanged(handler: (settings: OperatorSettings) => void): () => void {
      const listener = (_event: unknown, settings: OperatorSettings): void => {
        handler(settings)
      }
      ipcRenderer.on(IPC_OPERATOR_SETTINGS_CHANGED, listener)
      return () => {
        ipcRenderer.removeListener(IPC_OPERATOR_SETTINGS_CHANGED, listener)
      }
    },
  },
  // Unit GN-MCP-UI §5.5 — the gnosis GUI bridge surface. Sends the `gnosis-*`
  // IPC to main, which calls the SAME `handleGnosisTool` handler as the
  // `gnosis.*` MCP tools against the LANDED engine proxy (MCP/UI equivalence).
  // A rejection (e.g. the D2 engine-absent `EngineUnavailable`) propagates as
  // the invoke rejection so the pane handler catches it → the unavailable state.
  gnosis: {
    status(): Promise<HealthReport> {
      return ipcRenderer.invoke(IPC_GNOSIS_STATUS)
    },
    query(query: string, opts?: EngineRagQueryOptions): Promise<EngineRagResult> {
      const payload: { query: string } & EngineRagQueryOptions = {
        query,
        ...(opts ?? {}),
      }
      return ipcRenderer.invoke(IPC_GNOSIS_QUERY, payload)
    },
    // Unit A2 §5.5 — the document/wiki CRUD bridge surface. Sends the
    // `gnosis-documents`/`gnosis-wikis` IPC to main, which calls the SAME
    // `handleGnosisTool` handler as the `gnosis.document.*`/`gnosis.wiki.*` MCP
    // tools against the LANDED CRUD proxy (MCP/UI equivalence). A rejection
    // (e.g. the D2 engine-absent `EngineUnavailable`, or a `ConflictError` 409)
    // propagates as the invoke rejection so the pane handler catches it → the
    // unavailable/conflict state.
    documents(tool: string, args: Record<string, unknown>): Promise<unknown> {
      return ipcRenderer.invoke(IPC_GNOSIS_DOCUMENTS, { tool, args: args ?? {} })
    },
    wikis(tool: string, args: Record<string, unknown>): Promise<unknown> {
      return ipcRenderer.invoke(IPC_GNOSIS_WIKIS, { tool, args: args ?? {} })
    },
  },
  // Unit K M2 — the sidebar bridge the compiled handler bodies call. The preload
  // OWNS this object (contextBridge freezes exposed values, so the renderer must
  // NOT attach `sidebar` to `window.provident` — see installSidebarBridge).
  // `installSidebar(methods)` registers the renderer host's methods; each exposed
  // `sidebar.<method>` DELEGATES to the installed holder (a no-op until installed).
  sidebar: {
    selectDocument: (id) => sidebarHolder.selectDocument?.(id),
    docNavToggle: (key) => sidebarHolder.docNavToggle?.(key),
    submitQuery: (value) => sidebarHolder.submitQuery?.(value),
    // W1-N11 — the C18 advanced-search seams.
    searchAdvancedToggle: () => sidebarHolder.searchAdvancedToggle?.(),
    submitAdvancedQuery: (value, options) => sidebarHolder.submitAdvancedQuery?.(value, options),
    // W1-N11 — the C19 hover-preview timing seams.
    hoverPreviewEnter: (id) => sidebarHolder.hoverPreviewEnter?.(id),
    hoverPreviewLeave: () => sidebarHolder.hoverPreviewLeave?.(),
    hoverPreviewPopupEnter: () => sidebarHolder.hoverPreviewPopupEnter?.(),
    hoverPreviewPopupLeave: () => sidebarHolder.hoverPreviewPopupLeave?.(),
    templateValidateResult: (verdict) => sidebarHolder.templateValidateResult?.(verdict),
    templateAdd: (zone) => sidebarHolder.templateAdd?.(zone),
    templateRemove: (zone) => sidebarHolder.templateRemove?.(zone),
    templateReset: () => sidebarHolder.templateReset?.(),
    operatorSet: (patch) => sidebarHolder.operatorSet?.(patch),
    textareaInput: (ragId) => sidebarHolder.textareaInput?.(ragId),
    textareaBlur: (ragId, value) => sidebarHolder.textareaBlur?.(ragId, value),
    // W1-N11 — the Unit U4 contenteditable rich-editor seams.
    editorInput: (ragId) => sidebarHolder.editorInput?.(ragId),
    editorBlur: (ragId, html) => sidebarHolder.editorBlur?.(ragId, html),
    editorCompositionStart: (ragId) => sidebarHolder.editorCompositionStart?.(ragId),
    editorCompositionEnd: (ragId) => sidebarHolder.editorCompositionEnd?.(ragId),
    registryManage: (request) => sidebarHolder.registryManage?.(request),
    registryManageDismiss: () => sidebarHolder.registryManageDismiss?.(),
    gnosisStatus: () => sidebarHolder.gnosisStatus?.(),
    gnosisQuery: (value) => sidebarHolder.gnosisQuery?.(value),
    // Unit A2 §5.5 — the gnosis document/wiki CRUD GUI handlers (the M2
    // pattern). The `gnosis-documents`/`gnosis-wikis` pane handler bodies call
    // these; they DELEGATE to the installed holder (a no-op until installed).
    gnosisDocuments: (tool, args) => sidebarHolder.gnosisDocuments?.(tool, args),
    gnosisWikis: (tool, args) => sidebarHolder.gnosisWikis?.(tool, args),
  },
  installSidebar(methods) {
    sidebarHolder = methods
  },
}

contextBridge.exposeInMainWorld('provident', bridge)