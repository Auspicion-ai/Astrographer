// src/renderer/gnosis-crud-panes.ts — Unit A2 §5.5 (docs/specs/unit-a2-document-
// crud-wiring.md): the D4-parity GUI document-editor/wiki screens. The
// `gnosis-documents` + `gnosis-wikis` APP-GRAPH panes (MCP-visible) drive the
// LANDED `createEngineCrudRagStore` proxy through the `bridge.gnosis.documents`/
// `bridge.gnosis.wikis` IPC surface (the SAME main-process `handleGnosisTool`
// handler as the `gnosis.document.*`/`gnosis.wiki.*` MCP tools — MCP/UI
// equivalence).
//
// Both screens are provident-authored DATA (envelope nodes + function-string
// handler bodies) rendering through the PURE `gnosisDocumentsContent` /
// `gnosisWikisContent` helpers — never hand-written DOM (the project-wide
// constraint, AGENTS.md). The panes are gated FAIL-CLOSED on the `gnosis` group
// (read-only actions) + the `gnosis-edit` group (mutating actions); a rejected
// bridge call (the D2 engine-absent `EngineUnavailable`) renders the unavailable
// state — never a crash (§5.6).
//
// H1 (GNOSIS-SUPPLANTS-DOCUMENT-STORE): the A2 screens ARE the document surface
// over the engine — NOT a second editor, NO sync to the shell's local store.
// This host NEVER references the local JSON RAG store factory (the local store
// is the D2 fallback for the shell's OTHER document features, NOT a second
// editor for the A2 screens).
//
// H-1 (adversarial — the D4-parity gap): the PURE render helpers emit the
// wiki/document list items WITH the select `handlers` bound (the selection
// interaction). The MUTATING editor controls (create/update/delete/publish/
// unpublish/archive) are bound HERE in the host — the host's
// `documentsContent`/`wikisContent` methods wrap the PURE render helper output
// with the interactive controls (buttons) that carry `handlers:
// [{ name, event, body }]` using the host's body strings (the existing
// `gnosis-panes.ts` pattern). Each mutating body passes the fixed operator
// `callerId` ('operator'); the create bodies pass a fresh `requestId` per action.
//
// H-2 (adversarial — the no-edit-access state, §5.9-40): when a mutating action
// is attempted with the `gnosis-edit` group OFF (editClosed), the pane renders a
// DISTINCT no-edit-access indicator (never the normal read-only content).
//
// H-5 (adversarial — the pane group-gate inconsistency): ONE complete mutating-
// tool set (`MUTATING_TOOLS`, all 7 mutating document/wiki tools) gates BOTH the
// `gnosisDocuments` and `gnosisWikis` channels (the old `MUTATING_DOC_TOOLS`
// omitted `gnosis.wiki.create`).
//
// This host registers the panes into the app's SHARED PaneRegistry so the
// SidebarPanes host assembles them into the app-graph envelope. It is booted by
// renderer.ts — NOT by SidebarPanes.registerPanes() (which unit-h pins to the 5
// original panes).
import type { LegacyNodeData } from 'provident-ssr'
import { registerHandlerDef } from 'provident-ssr/core/registry.js'
import type { PaneContext, PaneRegistry } from './pane-registry.js'
import { gnosisDocumentsContent, gnosisWikisContent } from './pane-graph.js'
import { clickableClasses } from './render-shared.js'
import type { Document, DocumentList, Wiki } from '../main/engine-crud-rag-store.js'
import type { ConflictError } from '../main/engine-rag-store.js'
import type { SecuritySettings } from '../shared/types.js'

/** The preload bridge surface `GnosisCrudPanes` consumes (structural — the
 *  canonical `ProvidentBridge` lives in `src/main/preload.ts`). The mutating
 *  actions route through the bridge with a fixed operator `callerId` ('operator')
 *  and a fresh `requestId` per create action. */
export interface GnosisCrudBridge {
  gnosis: {
    documents(tool: string, args: Record<string, unknown>): Promise<unknown>
    wikis(tool: string, args: Record<string, unknown>): Promise<unknown>
  }
  security: {
    get(): Promise<SecuritySettings>
  }
}

/** The renderer-wired re-render trigger the gnosis-crud host calls after a
 *  bridge call settles (the host re-assembles the app-graph so the updated pane
 *  data renders). */
export type GnosisCrudOnChanged = () => void

export interface GnosisCrudPanesOptions {
  /** The app's shared PaneRegistry (the same registry SidebarPanes uses). */
  registry: PaneRegistry
  /** The preload bridge (`window.provident`). */
  bridge: GnosisCrudBridge
  /** Called when the pane state changes so the host re-renders the panes. */
  onChanged: GnosisCrudOnChanged
}

/** The fixed GUI operator caller identity (the single-operator shell — the
 *  operator is the human who enabled the `gnosis-edit` group in the settings
 *  pane). The `AuthorityStore` maps it to the operator's edit-authority
 *  credential (§5.5). */
const OPERATOR_CALLER_ID = 'operator'

/** H-5 — the ONE complete mutating document/wiki tool set (the `gnosis-edit`
 *  group, all 7 mutating tools). Gates BOTH the `gnosisDocuments` and
 *  `gnosisWikis` channels (the read-only tools get/list are gated on the
 *  `gnosis` group; the mutating tools on the `gnosis-edit` group — fail-closed). */
const MUTATING_TOOLS: ReadonlySet<string> = new Set([
  'gnosis.document.create',
  'gnosis.document.update',
  'gnosis.document.delete',
  'gnosis.document.publish',
  'gnosis.document.unpublish',
  'gnosis.document.archive',
  'gnosis.wiki.create',
])

// ---- the provident-authored handler bodies (function-STRING data). They reach
// the bridge via `window.provident.sidebar` (the M2 pattern) — NEVER an MCP tool.
// Each mutating body passes the fixed operator `callerId`; the create bodies pass
// a fresh `requestId` per action.
const GNOSIS_DOCUMENTS_REFRESH_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  s.gnosisDocuments('gnosis.wiki.list', {});
}`
const GNOSIS_DOCUMENTS_SELECT_WIKI_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var wikiId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-wiki-id'];
  if (wikiId) s.gnosisDocuments('gnosis.document.list', { wikiId: wikiId });
}`
const GNOSIS_DOCUMENTS_SELECT_DOC_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var documentId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-document-id'];
  if (documentId) s.gnosisDocuments('gnosis.document.get', { documentId: documentId });
}`
const GNOSIS_DOCUMENTS_CREATE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var wikiId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-wiki-id'];
  var el = document.getElementById('gnosis-doc-title');
  var title = el ? String(el.value || '') : '';
  if (!wikiId || !title) return;
  s.gnosisDocuments('gnosis.document.create', { callerId: 'operator', wikiId: wikiId, title: title, requestId: 'gui-' + Date.now() + '-' + Math.floor(Math.random() * 1e9) });
}`
const GNOSIS_DOCUMENTS_DELETE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var documentId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-document-id'];
  if (documentId) s.gnosisDocuments('gnosis.document.delete', { callerId: 'operator', documentId: documentId });
}`
const GNOSIS_DOCUMENTS_PUBLISH_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var documentId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-document-id'];
  if (documentId) s.gnosisDocuments('gnosis.document.publish', { callerId: 'operator', documentId: documentId });
}`
const GNOSIS_DOCUMENTS_UNPUBLISH_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var documentId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-document-id'];
  if (documentId) s.gnosisDocuments('gnosis.document.unpublish', { callerId: 'operator', documentId: documentId });
}`
const GNOSIS_DOCUMENTS_ARCHIVE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var documentId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-document-id'];
  if (documentId) s.gnosisDocuments('gnosis.document.archive', { callerId: 'operator', documentId: documentId });
}`
const GNOSIS_WIKIS_REFRESH_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  s.gnosisWikis('gnosis.wiki.list', {});
}`
const GNOSIS_WIKIS_SELECT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var wikiId = ctx && ctx.node && ctx.node.props && ctx.node.props['data-wiki-id'];
  if (wikiId) s.gnosisWikis('gnosis.wiki.get', { wikiId: wikiId });
}`
const GNOSIS_WIKIS_CREATE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var el = document.getElementById('gnosis-wiki-name');
  var name = el ? String(el.value || '') : '';
  if (!name) return;
  s.gnosisWikis('gnosis.wiki.create', { callerId: 'operator', name: name, requestId: 'gui-' + Date.now() + '-' + Math.floor(Math.random() * 1e9) });
}`

/** Unit A2 §5.5 — the host that registers + drives the two gnosis CRUD GUI
 *  panes. Owns the cached document/wiki state + the M13-style security cache
 *  (the fail-closed `gnosis`/`gnosis-edit` group gates). */
export class GnosisCrudPanes {
  private readonly registry: PaneRegistry
  private readonly bridge: GnosisCrudBridge
  private readonly onChanged: GnosisCrudOnChanged

  /** The last wiki list (null = the unavailable/empty state, §5.6). */
  private lastWikis: Wiki[] | null = null
  /** The last document list (null = the empty state). */
  private lastDocuments: DocumentList | null = null
  /** The last selected document (null = none). */
  private lastDocument: Document | null = null
  /** The last selected wiki (null = none). */
  private lastWiki: Wiki | null = null
  /** The last optimistic-concurrency conflict (a `ConflictError` from an
   *  `updateDocument` action, H2 — the 409 UX). null = no conflict. */
  private lastConflict: ConflictError | null = null
  /** H-2 — the no-edit-access flag: set when a mutating action is attempted with
   *  the `gnosis-edit` group OFF (the caller-side deny, §5.9-40). When true the
   *  pane renders a DISTINCT no-edit-access indicator. */
  private noEditAccess = false
  /** The M13-style security gate cache (null → fail-closed: NO group enabled). */
  private security: SecuritySettings | null = null
  /** The fail-closed flag for the read-only actions (the `gnosis` group is off). */
  private readClosed = false
  /** The fail-closed flag for the mutating actions (the `gnosis-edit` group is
   *  off). */
  private editClosed = false

  constructor(opts: GnosisCrudPanesOptions) {
    this.registry = opts.registry
    this.bridge = opts.bridge
    this.onChanged = opts.onChanged
  }

  /** Register + enable the two gnosis CRUD panes (both app-graph) into the
   *  shared registry, and bind the handler defs. Called by renderer.ts BEFORE
   *  SidebarPanes.boot so the sidebars assemble them into the envelopes. */
  registerPanes(): void {
    this.registry.register({
      id: 'gnosis-documents',
      title: 'Gnosis Documents',
      scope: 'app-graph',
      render: (ctx: PaneContext) => this.documentsContent(ctx),
    })
    this.registry.register({
      id: 'gnosis-wikis',
      title: 'Gnosis Wikis',
      scope: 'app-graph',
      render: (ctx: PaneContext) => this.wikisContent(ctx),
    })
    for (const id of ['gnosis-documents', 'gnosis-wikis']) {
      this.registry.enable(id)
    }
    registerHandlerDef('gnosis-documents-refresh', { name: 'gnosis-documents-refresh', body: GNOSIS_DOCUMENTS_REFRESH_BODY })
    registerHandlerDef('gnosis-documents-select-wiki', { name: 'gnosis-documents-select-wiki', body: GNOSIS_DOCUMENTS_SELECT_WIKI_BODY })
    registerHandlerDef('gnosis-documents-select-doc', { name: 'gnosis-documents-select-doc', body: GNOSIS_DOCUMENTS_SELECT_DOC_BODY })
    registerHandlerDef('gnosis-documents-create', { name: 'gnosis-documents-create', body: GNOSIS_DOCUMENTS_CREATE_BODY })
    registerHandlerDef('gnosis-documents-delete', { name: 'gnosis-documents-delete', body: GNOSIS_DOCUMENTS_DELETE_BODY })
    registerHandlerDef('gnosis-documents-publish', { name: 'gnosis-documents-publish', body: GNOSIS_DOCUMENTS_PUBLISH_BODY })
    registerHandlerDef('gnosis-documents-unpublish', { name: 'gnosis-documents-unpublish', body: GNOSIS_DOCUMENTS_UNPUBLISH_BODY })
    registerHandlerDef('gnosis-documents-archive', { name: 'gnosis-documents-archive', body: GNOSIS_DOCUMENTS_ARCHIVE_BODY })
    registerHandlerDef('gnosis-wikis-refresh', { name: 'gnosis-wikis-refresh', body: GNOSIS_WIKIS_REFRESH_BODY })
    registerHandlerDef('gnosis-wikis-select', { name: 'gnosis-wikis-select', body: GNOSIS_WIKIS_SELECT_BODY })
    registerHandlerDef('gnosis-wikis-create', { name: 'gnosis-wikis-create', body: GNOSIS_WIKIS_CREATE_BODY })
  }

  /** Fetch the security gate cache (the fail-closed group source) + refresh the
   *  wiki list. A bridge error keeps the gate fail-closed (null security). */
  async boot(): Promise<void> {
    try {
      this.security = await this.bridge.security.get()
    } catch {
      this.security = null // fail-closed (no group enabled)
    }
    this.readClosed = !(this.security?.enabled.includes('gnosis') ?? false)
    this.editClosed = !(this.security?.enabled.includes('gnosis-edit') ?? false)
    this.refreshWikis()
  }

  /** `sidebar.gnosisDocuments` — route a document tool call through the bridge.
   *  The read-only actions are gated fail-closed on the `gnosis` group; the
   *  mutating actions on the `gnosis-edit` group. A REJECTED bridge call (the
   *  D2 engine-absent `EngineUnavailable`, or a `ConflictError` 409) is CAUGHT
   *  and renders the unavailable/conflict state — never a crash (§5.6, H2).
   *  SYNCHRONOUS (fire-and-forget; the result routes on resolution). */
  gnosisDocuments(tool: string, args: Record<string, unknown>): void {
    const mutating = MUTATING_TOOLS.has(tool)
    // M13 — refresh the gate cache on each call so a runtime tightening is
    // honored (never a cached-ON gated call).
    void this.bridge.security.get().then((sec) => {
      this.security = sec
      const readOk = sec.enabled.includes('gnosis')
      const editOk = sec.enabled.includes('gnosis-edit')
      this.readClosed = !readOk
      this.editClosed = !editOk
      if (mutating && !editOk) {
        // fail-closed: the gnosis-edit group is off → the no-edit-access state
        // (H-2, §5.9-40 — a distinct indicator, never the normal read-only
        // content).
        this.lastConflict = null
        this.noEditAccess = true
        this.onChanged()
        return
      }
      if (!mutating && !readOk) {
        // fail-closed: the gnosis group is off → the closed/unavailable state.
        this.lastWikis = null
        this.lastDocuments = null
        this.lastDocument = null
        this.noEditAccess = false
        this.onChanged()
        return
      }
      this.noEditAccess = false
      void this.bridge.gnosis.documents(tool, args)
        .then((result) => {
          this.applyDocumentsResult(tool, result)
          this.onChanged()
        })
        .catch((e) => {
          // §5.6/H2 — a rejected bridge call (the engine absent / a ConflictError
          // 409): surface the unavailable/conflict state (never a crash). H-2 —
          // a caller-side deny (the operator has no edit authority, §5.9-40)
          // surfaces the no-edit-access state.
          if (e instanceof Error && /conflict|409|revision/i.test(e.message)) {
            this.lastConflict = e as ConflictError
            this.noEditAccess = false
          } else if (e instanceof Error && /no edit authority/i.test(e.message)) {
            this.noEditAccess = true
          } else {
            this.lastWikis = null
            this.lastDocuments = null
            this.lastDocument = null
            this.noEditAccess = false
          }
          this.onChanged()
        })
    }).catch(() => {
      // a security fetch failure → FAIL CLOSED (never issue a bridge call).
      this.security = null
      this.readClosed = true
      this.editClosed = true
      this.lastWikis = null
      this.lastDocuments = null
      this.lastDocument = null
      this.noEditAccess = false
      this.onChanged()
    })
  }

  /** `sidebar.gnosisWikis` — route a wiki tool call through the bridge. The
   *  read-only actions are gated fail-closed on the `gnosis` group; the mutating
   *  actions on the `gnosis-edit` group. A REJECTED bridge call is CAUGHT and
   *  renders the unavailable state — never a crash (§5.6). SYNCHRONOUS. */
  gnosisWikis(tool: string, args: Record<string, unknown>): void {
    const mutating = MUTATING_TOOLS.has(tool)
    void this.bridge.security.get().then((sec) => {
      this.security = sec
      const readOk = sec.enabled.includes('gnosis')
      const editOk = sec.enabled.includes('gnosis-edit')
      this.readClosed = !readOk
      this.editClosed = !editOk
      if (mutating && !editOk) {
        // fail-closed: the gnosis-edit group is off → the no-edit-access state
        // (H-2, §5.9-40 — a distinct indicator, never the normal read-only
        // content).
        this.lastWikis = null
        this.noEditAccess = true
        this.onChanged()
        return
      }
      if (!mutating && !readOk) {
        this.lastWikis = null
        this.lastWiki = null
        this.noEditAccess = false
        this.onChanged()
        return
      }
      this.noEditAccess = false
      void this.bridge.gnosis.wikis(tool, args)
        .then((result) => {
          this.applyWikisResult(tool, result)
          this.onChanged()
        })
        .catch((e) => {
          // §5.6 — the engine-absent / bridge-rejection path: the unavailable
          // state. H-2 — a caller-side deny (the operator has no edit authority,
          // §5.9-40) surfaces the no-edit-access state.
          if (e instanceof Error && /no edit authority/i.test(e.message)) {
            this.noEditAccess = true
          } else {
            this.lastWikis = null
            this.lastWiki = null
            this.noEditAccess = false
          }
          this.onChanged()
        })
    }).catch(() => {
      this.security = null
      this.readClosed = true
      this.editClosed = true
      this.lastWikis = null
      this.lastWiki = null
      this.noEditAccess = false
      this.onChanged()
    })
  }

  /** `sidebar.gnosisDocuments`-driven refresh of the wiki list (the document
   *  surface's wiki selector). */
  refreshWikis(): void {
    this.gnosisDocuments('gnosis.wiki.list', {})
  }

  /** Apply a resolved document-tool result to the cached state. */
  private applyDocumentsResult(tool: string, result: unknown): void {
    this.lastConflict = null
    if (tool === 'gnosis.wiki.list') {
      this.lastWikis = Array.isArray(result) ? (result as Wiki[]) : null
    } else if (tool === 'gnosis.document.list') {
      this.lastDocuments = (result ?? null) as DocumentList | null
    } else if (tool === 'gnosis.document.get') {
      this.lastDocument = (result ?? null) as Document | null
    } else if (tool === 'gnosis.document.create' || tool === 'gnosis.document.update' ||
      tool === 'gnosis.document.publish' || tool === 'gnosis.document.unpublish' ||
      tool === 'gnosis.document.archive') {
      this.lastDocument = (result ?? null) as Document | null
    } else if (tool === 'gnosis.document.delete') {
      this.lastDocument = null
    }
  }

  /** Apply a resolved wiki-tool result to the cached state. */
  private applyWikisResult(tool: string, result: unknown): void {
    if (tool === 'gnosis.wiki.list') {
      this.lastWikis = Array.isArray(result) ? (result as Wiki[]) : null
    } else if (tool === 'gnosis.wiki.get' || tool === 'gnosis.wiki.create') {
      this.lastWiki = (result ?? null) as Wiki | null
    }
  }

  /** Expose the current document/wiki state (the pane renders + tests read it). */
  readonly state = (): {
    wikis: Wiki[] | null
    documents: DocumentList | null
    document: Document | null
    wiki: Wiki | null
    conflict: ConflictError | null
  } => ({
    wikis: this.lastWikis,
    documents: this.lastDocuments,
    document: this.lastDocument,
    wiki: this.lastWiki,
    conflict: this.lastConflict,
  })

  /** The `gnosis-documents` app-graph pane content (provident data). The pane is
   *  gated FAIL-CLOSED on the `gnosis`/`gnosis-edit` groups; when the read group
   *  is off it renders the closed/unavailable state. Otherwise it renders the
   *  wiki selector + document list + document editor through the PURE
   *  `gnosisDocumentsContent` helper, wrapped with the H-1 mutating editor
   *  controls (create/update/delete/publish/unpublish/archive) + the H-2
   *  no-edit-access indicator. */
  private documentsContent(ctx: PaneContext): LegacyNodeData {
    if (this.readClosed) {
      return {
        type: 'div',
        props: { 'data-gnosis-pane': 'documents', 'data-gnosis-state': 'disabled' },
        children: [{ type: 'p', content: 'Gnosis documents unavailable — the gnosis group is not enabled' }],
      }
    }
    // H-1 — the create control's target wiki (the first wiki in the selector).
    const wikiId = this.lastWikis && this.lastWikis.length > 0 ? this.lastWikis[0].wikiId : ''
    const doc = this.lastDocument
    return {
      type: 'div',
      children: [
        {
          type: 'button',
          props: { id: 'gnosis-documents-refresh' },
          css: { classes: clickableClasses() },
          content: 'Refresh documents',
          handlers: [{ name: 'gnosis-documents-refresh', event: 'click', body: GNOSIS_DOCUMENTS_REFRESH_BODY }],
        },
        gnosisDocumentsContent(ctx, {
          wikis: this.lastWikis,
          documents: this.lastDocuments,
          document: this.lastDocument,
          conflict: this.lastConflict,
        }),
        // H-2 — the no-edit-access state (a mutating action was denied with the
        // gnosis-edit group off, §5.9-40).
        ...(this.noEditAccess
          ? [{ type: 'p' as const, props: { 'data-gnosis-state': 'no-edit-access' }, content: 'No edit access — the gnosis-edit group is not enabled' }]
          : []),
        // H-1 — the create control (wired to the create handler def; the body
        // reads the target wikiId from this node's `data-wiki-id` prop).
        {
          type: 'div',
          props: { 'data-wiki-id': wikiId },
          children: [
            { type: 'input', props: { id: 'gnosis-doc-title' } },
            {
              type: 'button',
              props: { id: 'gnosis-documents-create' },
              css: { classes: clickableClasses() },
              content: 'Create document',
              handlers: [{ name: 'gnosis-documents-create', event: 'click', body: GNOSIS_DOCUMENTS_CREATE_BODY }],
            },
          ],
        },
        // H-1 — the document action controls (wired to the mutating handler
        // defs; the bodies read the target documentId/revision from this node's
        // `data-document-id`/`data-revision` props).
        // W1-Q12 (U-PARITY-PARTIALS §1.2) — the Update control is PARKED: the
        // old button submitted a fake empty graph (`{ nodes: [], edges: [] }`)
        // to `gnosis.document.update`, which could blank a document but not edit
        // it. The real graph edit is deferred (the local↔Gnosis graph bridge +
        // engine-aware commit — docs/pending.md). Keep the real verbs; issue NO
        // fake update.
        ...(doc
          ? [{
              type: 'div' as const,
              props: { 'data-document-id': doc.documentId, 'data-revision': String(doc.revision) },
              children: [
                { type: 'button', props: { id: 'gnosis-documents-delete' }, css: { classes: clickableClasses() }, content: 'Delete', handlers: [{ name: 'gnosis-documents-delete', event: 'click', body: GNOSIS_DOCUMENTS_DELETE_BODY }] },
                { type: 'button', props: { id: 'gnosis-documents-publish' }, css: { classes: clickableClasses() }, content: 'Publish', handlers: [{ name: 'gnosis-documents-publish', event: 'click', body: GNOSIS_DOCUMENTS_PUBLISH_BODY }] },
                { type: 'button', props: { id: 'gnosis-documents-unpublish' }, css: { classes: clickableClasses() }, content: 'Unpublish', handlers: [{ name: 'gnosis-documents-unpublish', event: 'click', body: GNOSIS_DOCUMENTS_UNPUBLISH_BODY }] },
                { type: 'button', props: { id: 'gnosis-documents-archive' }, css: { classes: clickableClasses() }, content: 'Archive', handlers: [{ name: 'gnosis-documents-archive', event: 'click', body: GNOSIS_DOCUMENTS_ARCHIVE_BODY }] },
              ],
            }]
          : []),
      ],
    }
  }

  /** The `gnosis-wikis` app-graph pane content (provident data). The pane is
   *  gated FAIL-CLOSED on the `gnosis`/`gnosis-edit` groups; when the read group
   *  is off it renders the closed/unavailable state. Otherwise it renders the
   *  wiki list + view + create through the PURE `gnosisWikisContent` helper,
   *  wrapped with the H-1 wiki-create control + the H-2 no-edit-access
   *  indicator. */
  private wikisContent(ctx: PaneContext): LegacyNodeData {
    if (this.readClosed) {
      return {
        type: 'div',
        props: { 'data-gnosis-pane': 'wikis', 'data-gnosis-state': 'disabled' },
        children: [{ type: 'p', content: 'Gnosis wikis unavailable — the gnosis group is not enabled' }],
      }
    }
    return {
      type: 'div',
      children: [
        {
          type: 'button',
          props: { id: 'gnosis-wikis-refresh' },
          css: { classes: clickableClasses() },
          content: 'Refresh wikis',
          handlers: [{ name: 'gnosis-wikis-refresh', event: 'click', body: GNOSIS_WIKIS_REFRESH_BODY }],
        },
        gnosisWikisContent(ctx, { wikis: this.lastWikis, wiki: this.lastWiki }),
        // H-2 — the no-edit-access state (a mutating action was denied with the
        // gnosis-edit group off, §5.9-40).
        ...(this.noEditAccess
          ? [{ type: 'p' as const, props: { 'data-gnosis-state': 'no-edit-access' }, content: 'No edit access — the gnosis-edit group is not enabled' }]
          : []),
        // H-1 — the wiki-create control (wired to the create handler def).
        {
          type: 'div',
          children: [
            { type: 'input', props: { id: 'gnosis-wiki-name' } },
            {
              type: 'button',
              props: { id: 'gnosis-wikis-create' },
              css: { classes: clickableClasses() },
              content: 'Create wiki',
              handlers: [{ name: 'gnosis-wikis-create', event: 'click', body: GNOSIS_WIKIS_CREATE_BODY }],
            },
          ],
        },
      ],
    }
  }
}
