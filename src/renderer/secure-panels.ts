// src/renderer/secure-panels.ts — the operator-only Security Settings + Debug
// panes, rendered as provident data in a SECOND, ISOLATED graph (multi-graph
// isolation adoption, 2026-08-25).
//
// The shell's project-wide constraint: every non-shell UI element must be
// rendered with the provident framework. The Security Settings pane is
// manual-UI-only (mcp-endpoint.md §6.4) — an agent must never be able to grant
// itself capabilities. So this pane lives in its OWN provident graph (a
// `createIsolatedScope()` GraphScope + own hub + own Supervisor + own
// DomAdapter → its own root element), ISOLATED from the agent-visible app
// graph: the app Runtime's `dispatch`/`get_rendered_html`/`list_targets`
// never see it (no cross-graph addressability — multi-graph-isolation-spec.md).
//
// Pane handlers call the IPC bridge (`window.provident.security.get/set`),
// NEVER an MCP tool — the security channel is main→renderer→main only. An
// agent cannot reach these handlers (they are in the isolated graph, not the
// app graph the MCP endpoints read).
import {
  translateLegacy,
  Supervisor,
  EventBridge,
  DomAdapter,
  renderProducingProcess,
  createLinkHub,
  type RenderOptions,
  type LegacyInitialData,
} from 'provident-ssr'
import { createIsolatedScope, type GraphScope } from 'provident-ssr/core/registry.js'
import type { SecuritySettings, RpcRequest, RpcReply } from '../shared/types.js'

declare global {
  interface Window {
    provident?: {
      ready(): void
      onRequest(handler: (req: RpcRequest) => void): void
      sendReply(reply: RpcReply): void
      notify(payload: { uri: string }): void
      security?: {
        get(): Promise<SecuritySettings>
        set(patch: { token?: string | null; groups?: string[]; disable?: string[]; maxJournalLength?: number | null }): Promise<SecuritySettings>
      }
      module?: {
        get(): Promise<{ corrupt: boolean; quarantined: string[]; loaded: string[]; modules: Array<{ name: string; version: string; capabilities?: unknown; disabled?: boolean; quarantined?: boolean }> }>
        setDisabled(name: string, disabled: boolean): Promise<{ corrupt: boolean; quarantined: string[]; loaded: string[]; modules: Array<{ name: string; version: string; capabilities?: unknown; disabled?: boolean; quarantined?: boolean }> }>
      }
      edit?: {
        commit(nodeId: string, content: string): Promise<{ ok: true; nodeId: string } | { ok: false; reason: 'deleted-node' | 'store-error'; error?: string }>
        onRagStoreChanged(handler: (payload: { kind: 'content' | 'structural'; nodeIds: string[]; edgeIds: string[] }) => void): () => void
      }
    }
  }
}

const GROUPS = ['read', 'dispatch', 'graph', 'code', 'module'] as const
const GROUP_LABELS: Record<string, string> = {
  read: 'read (get_rendered_html, get_markdown, list_targets, get_node_state, code.get, code.validate)',
  dispatch: 'dispatch (synthetic event driving)',
  graph: 'graph (load, op, export, validate, teardown)',
  code: 'code (code.set/create/delete/load — evaluates handler bodies)',
  module: 'module (module.install/update/list + module:<name>.<tool> extensions — trusted-equivalent to code)',
}

function randToken(len = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let out = ''
  for (let i = 0; i < len; i += 1) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

// ---- handler bodies (function-STRING data). They reach the IPC bridge via
// `window.provident.security` — NEVER an MCP API. The SecurePanels host
// re-fetches + re-renders after the change over the main-process store.
const TOKEN_GEN_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.security;
  if (!s) return;
  s.set({ token: String(Math.random().toString(36).slice(2, 34)) });
}`
const TOKEN_CLEAR_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.security;
  if (!s) return;
  s.set({ token: null });
}`
// One shared toggle body; the group + the "is it currently on?" are read from
// the node's OWN props (`data-group` / `data-on`). Toggling flips the group.
const TOGGLE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.security;
  if (!s) return;
  var group = ctx.node.props && ctx.node.props['data-group'];
  if (!group) return;
  var on = ctx.node.props && ctx.node.props['data-on'] === 'true';
  if (on) s.set({ disable: [group] }); else s.set({ groups: [group] });
}`
// The maxJournalLength input handler: reads the numeric value from the input
// and persists it via the managed channel. Empty/null clears the setting.
const JOURNAL_LENGTH_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.security;
  if (!s) return;
  var val = ctx.node && ctx.node.props && ctx.node.props['value'];
  var num = val ? parseInt(val, 10) : NaN;
  if (isNaN(num) || num <= 0) s.set({ maxJournalLength: null });
  else s.set({ maxJournalLength: num });
}`

/** The pane-graph envelope: the Security Settings pane + the Debug pane,
 *  authored as provident data. The group toggles are one node per group; their
 *  `data-on`/`data-group` props are refreshed by syncConfig on each refresh. */
function paneEnvelope(): LegacyInitialData {
  const toggles = GROUPS.map((g) => ({
    type: 'label',
    props: { id: `toggle:${g}`, 'data-group': g, 'data-on': 'false' },
    css: { classes: ['group-row'] },
    content: GROUP_LABELS[g],
    handlers: [{ name: `toggle-${g}`, event: 'click', body: TOGGLE_BODY }],
  }))
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'secure-panes' },
        children: [
          // ---- Security Settings pane -----------------------------------
          {
            type: 'section',
            props: { id: 'settings-pane' },
            css: { classes: ['card'] },
            children: [
              { type: 'h2', content: 'Security & agent permissions' },
              { type: 'p', css: { classes: ['hint'] }, content: 'Manual-UI only — never exposed over MCP (an agent cannot grant itself capabilities).' },
              { type: 'div', props: { id: 'security-status' }, content: 'loading…' },
              {
                type: 'div',
                props: { id: 'security-token' },
                children: [
                  { type: 'label', content: 'Loopback token' },
                  {
                    type: 'div',
                    css: { classes: ['token-row'] },
                    children: [
                      { type: 'input', props: { id: 'token-input', placeholder: '(none)', readonly: true } },
                      { type: 'button', props: { id: 'token-clear' }, css: { classes: ['btn'] }, content: 'Clear', handlers: [{ name: 'token-clear', event: 'click', body: TOKEN_CLEAR_BODY }] },
                      { type: 'button', props: { id: 'token-gen' }, css: { classes: ['btn'] }, content: 'Regenerate', handlers: [{ name: 'token-gen', event: 'click', body: TOKEN_GEN_BODY }] },
                    ],
                  },
                ],
              },
              { type: 'div', props: { id: 'group-toggles' }, children: toggles },
              {
                type: 'div',
                props: { id: 'journal-length' },
                css: { classes: ['group-row'] },
                children: [
                  { type: 'label', content: 'Max journal entries' },
                  {
                    type: 'div',
                    css: { classes: ['token-row'] },
                    children: [
                      { type: 'input', props: { id: 'journal-length-input', placeholder: '(never condense)', type: 'number', min: '1' } },
                      { type: 'button', props: { id: 'journal-length-apply' }, css: { classes: ['btn'] }, content: 'Apply', handlers: [{ name: 'journal-length-apply', event: 'click', body: JOURNAL_LENGTH_BODY }] },
                    ],
                  },
                ],
              },
            ],
          },
          // ---- Debug / agent-visibility pane -----------------------------
          {
            type: 'section',
            props: { id: 'debug-pane' },
            css: { classes: ['card'] },
            children: [
              { type: 'h2', content: 'Debug / agent visibility' },
              { type: 'div', props: { id: 'status' }, content: 'booting…' },
            ],
          },
          // ---- Module management pane (U8) --------------------------------
          {
            type: 'section',
            props: { id: 'module-pane' },
            css: { classes: ['card'] },
            children: [
              { type: 'h2', content: 'Modules / extensions' },
              { type: 'p', css: { classes: ['hint'] }, content: 'Manual-UI only — installed modules + versions + quarantine status.' },
              { type: 'div', props: { id: 'module-status' }, content: 'loading…' },
              { type: 'div', props: { id: 'module-list' }, content: '' },
            ],
          },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

const PREVIEW_MAX = 120

/** The isolated pane-graph owner. Renders the Security + Debug panes through
 *  its OWN GraphScope (isolated from the app graph), driven by the IPC bridge.
 *  Never an MCP surface — the MCP endpoints read the APP Runtime, which does
 *  not include this graph. */
export class SecurePanels {
  private scope: GraphScope
  private supervisor: Supervisor
  private adapter: DomAdapter
  private readonly mount: HTMLElement
  private root: unknown
  private nodes: unknown[]
  private prevMap: Map<string, unknown> | null = null
  private cfg: SecuritySettings = { token: null, enabled: ['read', 'dispatch'] }
  private debugValue = 'booting…'
  private moduleStatus = 'loading…'
  private moduleListText = ''

  /** Test/visibility accessor — the current Debug pane text (census + SSR
   *  preview). */
  debugText(): string {
    return this.debugValue
  }

  constructor(mount: HTMLElement) {
    this.mount = mount
    this.scope = createIsolatedScope()
    const hub = createLinkHub()
    const t = translateLegacy(paneEnvelope(), { hub, graphScope: this.scope })
    this.supervisor = new Supervisor({ events: new EventBridge(), graphScope: this.scope })
    for (const n of t.nodes as unknown[]) this.supervisor.registerNode(n as never)
    this.adapter = new DomAdapter(mount, { onEvent: this.handleDomEvent })
    this.root = t.root
    this.nodes = t.nodes as unknown[]
  }

  /** Wire a real DOM interaction on a pane control to the pane graph's
   *  synthetic dispatch (mirrors the app Runtime's onEvent path). */
  private handleDomEvent = (wire: string, domEvent: Event): void => {
    const node = this.supervisor.getNode(wire)
    if (!node) return
    const eventName = domEvent?.type ?? String(domEvent ?? '')
    const extra = domEvent?.target && 'value' in domEvent.target
      ? [String((domEvent.target as HTMLInputElement).value)]
      : []
    this.supervisor.dispatchEvent(node.id, eventName, ...extra)
    void this.supervisor.flush().then(() => {
      this.render()
      void this.refresh()
    })
  }

  /** The test seam: dispatch a synthetic click on a pane control by its
   *  authored props.id, in the PANE graph (never the app graph). */
  async dispatch(id: string): Promise<void> {
    const node = this.supervisor.allNodes().find((n) => (n.props as { id?: string })?.id === id)
    if (!node) throw new Error(`secure-panels: unresolved pane id '${id}'`)
    this.supervisor.dispatchEvent(node.id, 'click')
    await this.supervisor.flush()
    this.render()
    await this.refresh()
  }

  /** The Debug pane's live agent-visibility line: set from the APP runtime's
   *  census + SSR preview. Written into the pane graph's `#status` node (its
   *  own isolated graph — never the app graph). */
  refreshDebug(runtime: {
    renderedHtmlResult(): { census: { inTree?: unknown; registered?: unknown; unplaced?: unknown; destroyed?: unknown; prototypes?: unknown }; ssrHtml: unknown }
  }): void {
    const { census, ssrHtml } = runtime.renderedHtmlResult()
    const c = (v: unknown): string | number => (typeof v === 'number' && Number.isFinite(v) ? v : '?')
    const censusLine =
      `inTree ${c(census.inTree)} · registered ${c(census.registered)} · ` +
      `unplaced ${c(census.unplaced)} · destroyed ${c(census.destroyed)} · prototypes ${c(census.prototypes)}`
    const raw = typeof ssrHtml === 'string' ? ssrHtml : ''
    const collapsed = raw.replace(/\s+/g, ' ').trim()
    const preview = collapsed.length === 0
      ? '(empty)'
      : collapsed.length > PREVIEW_MAX
        ? collapsed.slice(0, PREVIEW_MAX) + '…'
        : collapsed
    this.debugValue = `${censusLine}\n${preview}`
    this.syncConfig()
    this.render()
  }

  /** Re-fetch the security config over IPC, merge it into the pane graph nodes,
   *  and re-render. Async (the bridge is async). */
  async refresh(): Promise<void> {
    const security = typeof window !== 'undefined' && window.provident?.security
    if (security) {
      try {
        this.cfg = await security.get()
      } catch {
        // keep the last-known config on a bridge error
      }
    }
    // U8 — read the module store status + list over the module bridge.
    const moduleBridge = typeof window !== 'undefined' && window.provident?.module
    if (moduleBridge) {
      try {
        const res = await moduleBridge.get()
        this.moduleStatus = `corrupt: ${res.corrupt} · quarantined: [${res.quarantined.join(', ')}] · loaded: [${res.loaded.join(', ')}]`
        this.moduleListText = res.modules
          .map((m) => `${m.disabled ? '☐' : '☑'} ${m.name}@${m.version}${m.quarantined ? ' (quarantined)' : ''}`)
          .join('\n')
      } catch {
        // keep the last-known module state on a bridge error
      }
    }
    this.syncConfig()
    this.render()
  }

  /** Write the current cfg into the pane graph nodes (token status, enabled
   *  groups, per-group toggle on/off) through the MANAGED CHANNEL (state-slice
   *  content + props writes), then the render reflects it. Never mutates a
   *  Node's derived fields directly. */
  private syncConfig(): void {
    for (const n of this.supervisor.allNodes()) {
      const id = (n.props as { id?: string })?.id
      const mutation: Array<{ targetProp: string; value: unknown; mode?: string }> = []
      if (id === 'security-status') {
        const jl = this.cfg.maxJournalLength !== undefined ? ` · journal: ≤${this.cfg.maxJournalLength}` : ' · journal: ∞'
        mutation.push({ targetProp: 'content', value: `token: ${this.cfg.token ? '••••' : '(none)'} · enabled: [${this.cfg.enabled.join(', ')}]${jl}` })
      } else if (id === 'status') {
        mutation.push({ targetProp: 'content', value: this.debugText })
      } else if (id === 'token-input') {
        mutation.push({ targetProp: 'content', value: this.cfg.token ?? '' })
      } else if (typeof id === 'string' && id.startsWith('toggle:')) {
        const g = id.slice('toggle:'.length)
        const on = this.cfg.enabled.includes(g)
        mutation.push({ targetProp: 'props.data-on', mode: 'replace', value: on ? 'true' : 'false' })
        mutation.push({ targetProp: 'content', value: `${on ? '☑' : '☐'} ${GROUP_LABELS[g]}` })
      } else if (id === 'journal-length-input') {
        mutation.push({ targetProp: 'props.value', mode: 'replace', value: this.cfg.maxJournalLength ?? '' })
      } else if (id === 'module-status') {
        mutation.push({ targetProp: 'content', value: this.moduleStatus })
      } else if (id === 'module-list') {
        mutation.push({ targetProp: 'content', value: this.moduleListText })
      }
      if (mutation.length > 0) {
        this.supervisor.apply({ kind: 'state-slice', node: n, mutation })
      }
    }
  }

  /** Compile the pane graph root + re-render into the pane mount. */
  private render(): void {
    const cr = (this.root as { compile(nodes: unknown[]): { actionable: unknown[] } }).compile(this.nodes as never)
    this.supervisor.recordResolved(cr.actionable as never)
    const byNode = new Map(this.supervisor.allNodes().map((n) => [n.id, n]))
    const renderOptions: RenderOptions = { nodeIdAttribute: true, graphScope: this.scope }
    this.adapter.beginBatch()
    const dom = renderProducingProcess(cr.actionable as never, byNode as never, this.adapter, this.prevMap as never, renderOptions)
    this.adapter.endBatch()
    this.prevMap = dom.prevMap as unknown as Map<string, unknown>
  }
}
