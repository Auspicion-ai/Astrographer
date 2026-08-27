// src/main/preload.ts — the contextBridge between the renderer and the main
// process. The main process owns the MCP server; the renderer owns the
// provident-ssr graph + DOM. Requests flow main → renderer (webContents.send)
// and replies flow renderer → main (send). Exposed as a minimal `provident`
// surface (no Node objects leak into the page).
import { contextBridge, ipcRenderer } from 'electron'
import { IPC_INVOKE, IPC_REPLY, IPC_READY, IPC_SECURITY_GET, IPC_SECURITY_SET, IPC_NOTIFY, IPC_MODULE_GET, IPC_MODULE_SET_DISABLED, IPC_EDIT_COMMIT, IPC_RAG_STORE_CHANGED, IPC_RAG_QUERY, IPC_RAG_SNAPSHOT, IPC_RAG_BACKLINKS, type RpcRequest, type RpcReply, type SecuritySettings, type NotifyPayload, type ModuleListEntry, type EditCommitPayload, type RagQueryPayload, type RagQueryResult, type EditCommitResult, type RagSnapshotPayload, type RagBacklinksPayload, type RagBacklinksResult } from '../shared/types.js'

export interface ModuleBridgeResult {
  corrupt: boolean
  quarantined: string[]
  loaded: string[]
  modules: ModuleListEntry[]
}

/** The Unit D §5.1.10 commit result (mirrors the controller's CommitResult). */
export type { EditCommitResult }

/** The Unit D §5.1.9 `rag-store-changed` payload. */
export interface RagStoreChangedPayload {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}

export interface ProvidentBridge {
  ready(): void
  onRequest(handler: (req: RpcRequest) => void): void
  sendReply(reply: RpcReply): void
  notify(payload: NotifyPayload): void
  security: {
    get(): Promise<SecuritySettings>
    set(patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }): Promise<SecuritySettings>
  }
  module: {
    get(): Promise<ModuleBridgeResult>
    setDisabled(name: string, disabled: boolean): Promise<ModuleBridgeResult>
  }
  edit: {
    /** Unit D §5.1.10 — the UI commit-on-blur write-back. Sends the
     *  `edit-commit` IPC to main, which calls `setContent` on the store (the
     *  SAME edit op as the MCP tool) and broadcasts `rag-store-changed`. */
    commit(nodeId: string, content: string): Promise<EditCommitResult>
    /** Unit D §5.1.9 — subscribe to the `rag-store-changed` re-traversal
     *  trigger. Returns an unsubscribe function. */
    onRagStoreChanged(handler: (payload: RagStoreChangedPayload) => void): () => void
  }
  /** Unit E §5.7/§8.2 — the UI retrieval surface. Sends the `rag-query` IPC to
   *  main, which calls the SAME maintained retrieval engine as the MCP
   *  `rag.query` tool (MCP/UI equivalence). The renderer never computes
   *  retrieval itself. */
  rag: {
    query(query: string, topK?: number): Promise<RagQueryResult>
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
  }
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
  },
  // Unit D §5.1.9/§5.1.10 — the editing IPC surface. The UI commit-on-blur
  // routes through the SAME edit op (`setContent`) as the MCP tool; the
  // `rag-store-changed` event is the re-traversal trigger.
  edit: {
    commit(nodeId: string, content: string): Promise<EditCommitResult> {
      const payload: EditCommitPayload = { nodeId, content }
      return ipcRenderer.invoke(IPC_EDIT_COMMIT, payload)
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
    query(query: string, topK?: number): Promise<RagQueryResult> {
      const payload: RagQueryPayload = { query, ...(topK !== undefined ? { topK } : {}) }
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
  },
}

contextBridge.exposeInMainWorld('provident', bridge)