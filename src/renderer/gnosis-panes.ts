// src/renderer/gnosis-panes.ts — Unit GN-MCP-UI §5.5/§5.6: the D4-parity GUI
// screens (docs/specs/unit-gn-mcp-ui-wiring.md). The `gnosis-status` OPERATOR
// pane (isolated operator scope — MCP-invisible) + the `gnosis-query`
// APP-GRAPH pane (MCP-visible) drive the LANDED `createEngineRagStore` proxy
// through the `bridge.gnosis.*` IPC surface (the SAME main-process
// `handleGnosisTool` handler as the `gnosis.*` MCP tools — MCP/UI equivalence).
//
// Both screens are provident-authored DATA (envelope nodes + function-string
// handler bodies) rendering through the PURE `gnosisStatusContent` /
// `gnosisQueryContent` helpers — never hand-written DOM (the project-wide
// constraint, AGENTS.md). The `gnosis-query` pane is gated FAIL-CLOSED on the
// `gnosis` group; a rejected bridge call (the D2 engine-absent
// `EngineUnavailable`) renders the unavailable state — never a crash (§5.6).
//
// This host registers the panes into the app's SHARED PaneRegistry so the
// SidebarPanes host assembles them into the app-graph + isolated operator
// envelopes. It is booted by renderer.ts — NOT by SidebarPanes.registerPanes()
// (which unit-h pins to the 5 original panes).
import type { LegacyNodeData } from 'provident-ssr'
import { registerHandlerDef } from 'provident-ssr/core/registry.js'
import type { PaneContext, PaneRegistry } from './pane-registry.js'
import { gnosisStatusContent, gnosisQueryContent } from './pane-graph.js'
import type { EngineRagResult, HealthReport } from '../main/engine-rag-store.js'
import type { SecuritySettings } from '../shared/types.js'

/** The preload bridge surface `GnosisPanes` consumes (structural — the
 *  canonical `ProvidentBridge` lives in `src/main/preload.ts`). */
export interface GnosisBridge {
  gnosis: {
    status(): Promise<HealthReport>
    query(query: string, opts?: Record<string, unknown>): Promise<EngineRagResult>
  }
  security: {
    get(): Promise<SecuritySettings>
  }
}

/** The renderer-wired re-render trigger the gnosis host calls after a status or
 *  query settles (the host re-assembles the app-graph + re-mounts the operator
 *  so the updated pane data renders). */
export type GnosisOnChanged = () => void

export interface GnosisPanesOptions {
  /** The app's shared PaneRegistry (the same registry SidebarPanes uses). */
  registry: PaneRegistry
  /** The preload bridge (`window.provident`). */
  bridge: GnosisBridge
  /** Called when the pane state changes so the host re-renders the panes. */
  onChanged: GnosisOnChanged
}

// ---- the provident-authored handler bodies (function-STRING data). They reach
// the bridge via `window.provident.sidebar` (the M2 pattern) — NEVER an MCP tool.
const GNOSIS_STATUS_REFRESH_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  s.gnosisStatus();
}`
const GNOSIS_QUERY_SUBMIT_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var el = document.getElementById('gnosis-query-input');
  var value = el ? String(el.value || '') : '';
  if (value) s.gnosisQuery(value);
}`

/** Unit GN-MCP-UI §5.5 — the host that registers + drives the two gnosis GUI
 *  panes. Owns the cached engine state (last status report + last query result)
 *  + the M13-style security cache (the fail-closed `gnosis` group gate). */
export class GnosisPanes {
  private readonly registry: PaneRegistry
  private readonly bridge: GnosisBridge
  private readonly onChanged: GnosisOnChanged

  /** The last engine HealthReport (null = the unavailable state, §5.6). */
  private lastStatus: HealthReport | null = null
  /** The last EngineRagResult (null = the empty state). */
  private lastQuery: EngineRagResult | null = null
  /** The M13-style security gate cache (null → fail-closed: NO group enabled). */
  private security: SecuritySettings | null = null
  /** The fail-closed flag for the gnosis-query pane (the gnosis group is off).
   *  When true the pane renders the closed/unavailable state. */
  private queryClosed = false
  /** The D2 query-absent flag (a rejected bridge call, §5.6) → the empty/error
   *  state via a null lastQuery (gnosisQueryContent renders it). */
  private queryError = false

  constructor(opts: GnosisPanesOptions) {
    this.registry = opts.registry
    this.bridge = opts.bridge
    this.onChanged = opts.onChanged
  }

  /** Register + enable the two gnosis panes (operator status + app-graph query)
   *  into the shared registry, and bind the handler defs. Called by renderer.ts
   *  BEFORE SidebarPanes.boot so the sidebars assemble them into the envelopes. */
  registerPanes(): void {
    this.registry.register({
      id: 'gnosis-status',
      title: 'Gnosis Status',
      scope: 'operator',
      render: (ctx: PaneContext) => this.statusContent(ctx),
    })
    this.registry.register({
      id: 'gnosis-query',
      title: 'Gnosis Query',
      scope: 'app-graph',
      render: (ctx: PaneContext) => this.queryContent(ctx),
    })
    for (const id of ['gnosis-status', 'gnosis-query']) {
      this.registry.enable(id)
    }
    registerHandlerDef('gnosis-status-refresh', { name: 'gnosis-status-refresh', body: GNOSIS_STATUS_REFRESH_BODY })
    registerHandlerDef('gnosis-query-submit', { name: 'gnosis-query-submit', body: GNOSIS_QUERY_SUBMIT_BODY })
  }

  /** Fetch the security gate cache (the fail-closed group source) + refresh the
   *  engine status. A bridge error keeps the gate fail-closed (null security). */
  async boot(): Promise<void> {
    try {
      this.security = await this.bridge.security.get()
    } catch {
      this.security = null // fail-closed (no group enabled)
    }
    this.queryClosed = !(this.security?.enabled.includes('gnosis') ?? false)
    this.refreshStatus()
  }

  /** `sidebar.gnosisStatus` — refresh the engine HealthReport over the bridge.
   *  A REJECTED bridge call (the D2 engine-absent `EngineUnavailable`) is
   *  CAUGHT and renders the unavailable state (null lastStatus) — never a crash
   *  (§5.6). SYNCHRONOUS (fire-and-forget; the result routes on resolution). */
  refreshStatus(): void {
    void this.bridge.gnosis.status()
      .then((report) => {
        this.lastStatus = report
        this.onChanged()
      })
      .catch(() => {
        // §5.6 — the engine-absent / bridge-rejection path: the unavailable state.
        this.lastStatus = null
        this.onChanged()
      })
  }

  /** `sidebar.gnosisQuery` — the fail-closed `gnosis` query path. A caller with
   *  the `gnosis` group OFF gets the closed state (no IPC is fired). When the
   *  group is ON, issue `bridge.gnosis.query`; a REJECTED bridge call is CAUGHT
   *  and renders the empty/error state (null lastQuery) — never a crash (§5.6,
   *  §5.9-29). SYNCHRONOUS. */
  submitQuery(value: string): void {
    if (!value) return
    // M13 — refresh the gate cache on each submit so a runtime tightening is
    // honored (never a cached-ON gated call).
    void this.bridge.security.get().then((sec) => {
      this.security = sec
      if (!sec.enabled.includes('gnosis')) {
        // fail-closed: the gnosis group is off → the closed/unavailable state.
        this.queryClosed = true
        this.lastQuery = null
        this.onChanged()
        return
      }
      this.queryClosed = false
      void this.bridge.gnosis.query(value)
        .then((result) => {
          this.lastQuery = result
          this.queryError = false
          this.onChanged()
        })
        .catch(() => {
          // §5.6 — a rejected query call (the engine absent / EngineUnavailable):
          // surface as the empty/error state (never a crash).
          this.queryError = true
          this.lastQuery = null
          this.onChanged()
        })
    }).catch(() => {
      // a security fetch failure → FAIL CLOSED (never issue a query).
      this.security = null
      this.queryClosed = true
      this.lastQuery = null
      this.onChanged()
    })
  }

  /** Expose the current query state (the app-graph pane render + tests read it). */
  readonly state = (): { lastStatus: HealthReport | null; lastQuery: EngineRagResult | null } => ({
    lastStatus: this.lastStatus,
    lastQuery: this.lastQuery,
  })

  /** The `gnosis-status` operator pane content (provident data). Reuses the PURE
   *  `gnosisStatusContent` helper; a null report (or a bridge rejection) renders
   *  the unavailable state. */
  private statusContent(ctx: PaneContext): LegacyNodeData {
    const report = this.lastStatus
    return {
      type: 'section',
      children: [
        gnosisStatusContent(ctx, report),
        {
          type: 'button',
          props: { id: 'gnosis-status-refresh' },
          content: 'Refresh engine status',
          handlers: [{ name: 'gnosis-status-refresh', event: 'click', body: GNOSIS_STATUS_REFRESH_BODY }],
        },
      ],
    }
  }

  /** The `gnosis-query` app-graph pane content (provident data). The pane is
   *  gated FAIL-CLOSED on the `gnosis` group; when the group is off it renders
   *  the closed/unavailable state (never issues a query). Otherwise it renders
   *  the input + submit control + the PURE `gnosisQueryContent` result (the
   *  proxy-specific `EngineRagResult` — DISTINCT from the local `RagResult`). */
  private queryContent(ctx: PaneContext): LegacyNodeData {
    if (this.queryClosed) {
      return {
        type: 'div',
        props: { 'data-gnosis-pane': 'query', 'data-gnosis-query': '', 'data-gnosis-state': 'disabled' },
        children: [{ type: 'p', content: 'Gnosis query unavailable — the gnosis group is not enabled' }],
      }
    }
    return {
      type: 'div',
      children: [
        { type: 'input', props: { id: 'gnosis-query-input' } },
        {
          type: 'button',
          props: { id: 'gnosis-query-submit' },
          content: 'Query engine',
          handlers: [{ name: 'gnosis-query-submit', event: 'click', body: GNOSIS_QUERY_SUBMIT_BODY }],
        },
        // A rejected query call leaves lastQuery null → the pure helper's empty
        // state (never a TypeError).
        gnosisQueryContent(ctx, this.lastQuery),
      ],
    }
  }
}
