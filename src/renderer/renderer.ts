// src/renderer/renderer.ts — browser entry for the Electron renderer.
// Bootstraps the provident-ssr producing process into #app and serves the
// MCP-facing operations over the preload bridge (main process = MCP server).
import { Runtime } from './runtime.js'
import { demoEnvelope } from '../shared/demo-envelope.js'
import { SecurePanels } from './secure-panels.js'
import { createEditController } from './edit-controller.js'
import { rebuildBackRefs } from '../main/traversal.js'
import type { RpcRequest, RpcReply } from '../shared/types.js'
import type { RagNode, RagEdge } from '../main/rag-store.js'

/** N3 (live-notification-review.md) — the MCP methods that mutate the APP graph
 *  (content/structural/re-derive). Only these trigger the app-graph-changed push
 *  AFTER the reply. Never triggered by the isolated SecurePanels graph. */
const MUTATING_METHODS = new Set(['dispatch', 'load', 'op', 'teardown', 'code.load', 'code.loadBatch', 'journal'])

function handleRequest(runtime: Runtime, req: RpcRequest, notify: (p: { uri: string }) => void): Promise<RpcReply> {
  return (async (): Promise<RpcReply> => {
    try {
      let value: unknown
      switch (req.method) {
        case 'dispatch':
          value = await runtime.dispatch(req.payload as never)
          break
        case 'renderedHtml':
          value = runtime.renderedHtmlResult()
          break
        case 'markdown':
          value = runtime.markdownResult()
          break
        case 'listTargets':
          value = runtime.listTargets()
          break
        case 'nodeState':
          value = runtime.nodeState(req.payload as never)
          break
        case 'load':
          value = runtime.load(req.payload as never)
          break
        case 'op':
          value = runtime.op(req.payload as never)
          break
        case 'export':
          value = runtime.export((req.payload as { format: 'legacy' | 'serialized' }).format)
          break
        case 'validate':
          value = runtime.validate((req.payload as { kind: 'legacy' | 'serialized'; export: unknown }).kind, (req.payload as { export: unknown }).export)
          break
        case 'teardown':
          value = await runtime.teardownResult()
          break
        case 'code.get':
          value = runtime.codeGet((req.payload as { path: string }).path)
          break
        case 'code.set':
          value = runtime.codeSet((req.payload as { path: string; value: unknown }).path, (req.payload as { value: unknown }).value)
          break
        case 'code.create':
          value = runtime.codeCreate((req.payload as { path: string; entry: unknown }).path, (req.payload as { entry: unknown }).entry)
          break
        case 'code.delete':
          value = runtime.codeDelete((req.payload as { path: string; index?: number }).path, (req.payload as { index?: number }).index)
          break
        case 'code.validate':
          value = runtime.codeValidate((req.payload as { envelope?: unknown }).envelope)
          break
        case 'code.load':
          value = runtime.codeLoad((req.payload as { envelope?: unknown }).envelope)
          break
        case 'code.loadBatch':
          value = runtime.codeLoadBatch((req.payload as { ops: unknown[] }).ops as never)
          break
        case 'journal':
          value = runtime.journal((req.payload as { action?: 'undo' | 'redo' | 'replay' } | null)?.action as 'undo' | 'redo' | 'replay')
          break
        default:
          throw new Error(`unknown method: ${(req as { method: string }).method}`)
      }
      return { id: req.id, ok: true, value }
    } catch (e) {
      return {
        id: req.id,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }
    }
  })().then((reply) => {
    // N3/N6 — after a MUTATING app-graph op succeeds, emit ONE app-graph-changed
    // push (the resource content changed). App-Runtime-only: SecurePanels never
    // calls this. Coalesced to once per tool invocation (after the reply).
    if (reply.ok && MUTATING_METHODS.has(req.method)) {
      notify({ uri: 'mcp://provident/app' })
    }
    return reply
  })
}

async function main(): Promise<void> {
  const mount = document.getElementById('app')
  if (!mount) throw new Error('mount #app missing')
  const bridge = window.provident
  // Read the persisted operator config (maxJournalLength) so the app Runtime's
  // Supervisor is constructed with the journal-condense threshold. The config
  // is manual-UI-only (never an MCP tool); the Runtime reads it at boot.
  let maxJournalLength: number | undefined
  if (bridge?.security) {
    try {
      const cfg = await bridge.security.get()
      maxJournalLength = cfg.maxJournalLength
    } catch {
      // keep the default (never condense) on a bridge error
    }
  }
  const runtime = new Runtime({ mount, envelope: demoEnvelope(), maxJournalLength })
  runtime.bootstrap()
  if (!bridge) {
    console.warn('[provident-renderer] no preload bridge — MCP endpoints unavailable (running as a plain page?)')
    return
  }
  // The operator-only Security + Debug panes render in their OWN isolated
  // provident graph (secure-panels.ts) — a separate GraphScope, so the MCP
  // endpoints (which read the app Runtime) can never see/dispatch them.
  const panesMount = document.getElementById('panes')
  const panels = panesMount ? new SecurePanels(panesMount) : null
  if (panels) {
    void panels.refresh()
    // the Debug pane's live census + SSR preview, sourced from the APP graph
    panels.refreshDebug(runtime)
  }
  bridge.onRequest((req) => {
    void handleRequest(runtime, req, (p) => bridge!.notify(p)).then((reply) => {
      panels?.refreshDebug(runtime)
      bridge.sendReply(reply)
    })
  })
  // Unit D §5.1.9/§5.1.10 — the re-traversal trigger. On `rag-store-changed`
  // (broadcast by main after ANY successful RAG-store mutation via an MCP
  // `edit.*` tool OR a UI commit-on-blur), the renderer calls `requestRebuild()`
  // on the edit controller (the dirty-edit guard queues it if a control is
  // dirty). The injected `commit` routes through the SAME edit op (`setContent`)
  // as the MCP tool (MCP/UI equivalence — §5.7).
  //
  // Finding 3 — the re-traversal is REAL (not a no-op). `onRebuild` fetches the
  // RAG store snapshot over the `rag-snapshot` IPC, re-derives the graph via
  // `buildTraversal` (Unit C), and feeds the resulting back-reference map back
  // into the controller's `backRefs` (the SOLE authoritative carrier, §5.3).
  // The controller holds the SAME Map reference, so mutating it in place is
  // visible to `isEditable`/`commit`/`restoreCaret`. The re-traversal is
  // fire-and-forget (the `onRebuild` signature is sync); a fetch/re-derive
  // failure leaves the current backRefs in place (never a crash).
  const backRefs = new Map<string, string[]>()
  const editController = createEditController({
    backRefs,
    commit: (nodeId, content) => bridge!.edit!.commit(nodeId, content),
    onRebuild: () => {
      void bridge!.rag!.snapshot().then(({ nodes, edges }) => {
        const rebuilt = rebuildBackRefs(nodes as RagNode[], edges as RagEdge[], 'main')
        backRefs.clear()
        for (const [k, v] of rebuilt) backRefs.set(k, v)
      }).catch(() => {
        // re-traversal failure — leave the current backRefs in place
      })
    },
  })
  bridge.edit?.onRagStoreChanged(() => {
    editController.requestRebuild()
  })
  bridge.ready()
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void main())
  } else {
    void main()
  }
}