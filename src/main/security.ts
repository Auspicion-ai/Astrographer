import { timingSafeEqual } from 'node:crypto'

export type ToolGroup = 'read' | 'dispatch' | 'graph' | 'code' | 'module'

const TOOL_GROUPS: Record<string, ToolGroup> = {
  'provident.get_rendered_html': 'read',
  'provident.get_markdown': 'read',
  'provident.list_targets': 'read',
  'provident.get_node_state': 'read',
  'provident.code.get': 'read',
  'provident.code.validate': 'read',
  'provident.dispatch': 'dispatch',
  'provident.load': 'graph',
  'provident.op': 'graph',
  'provident.export': 'graph',
  'provident.validate': 'graph',
  'provident.teardown': 'graph',
  'provident.journal': 'graph',
  'provident.code.set': 'code',
  'provident.code.create': 'code',
  'provident.code.delete': 'code',
  'provident.code.load': 'code',
  'provident.code.loadBatch': 'code',
  // U1 (module-extension system, docs/specs/module-import-proposal.md §5) — the
  // `module` group (OFF by default). The static module.* management tools.
  'module.install': 'module',
  'module.update': 'module',
  'module.list': 'module',
  'module.disable': 'module',
  'module.enable': 'module',
  // R1 (mcp-resources-review.md) — the read-group resources. Keyed by
  // `resource:<uri>` so `toolAllowed` gates them with the `read` group. A
  // resource is registered ONLY when its group is allowed (never always-
  // registered).
  'resource:mcp://provident/app': 'read',
  'resource:mcp://provident/targets': 'read',
  'resource:mcp://provident/node/{nodeId}': 'read',
}

export function groupForTool(toolName: string): ToolGroup | null {
  // M-r3 (module-import-proposal.md §5) — a dynamic module tool is namespaced
  // `module:<name>.<tool>`. It resolves to the `module` group via PREFIX (the
  // dynamic tool names cannot be enumerated statically in TOOL_GROUPS). An
  // exact-name static tool always wins; the prefix only catches `module:` names.
  // F4 (adversarial): `module:` with an EMPTY rest (no `<name>.<tool>`) is
  // malformed and denied, never resolved to `module`.
  if (typeof toolName !== 'string') return null
  if (toolName in TOOL_GROUPS) return TOOL_GROUPS[toolName]
  if (toolName.startsWith('module:') && toolName.length > 'module:'.length) return 'module'
  return null
}

export function toolAllowed(toolName: string, enabled: ReadonlySet<ToolGroup> | readonly ToolGroup[]): boolean {
  const group = groupForTool(toolName)
  const set: ReadonlySet<ToolGroup> = enabled instanceof Set ? enabled : new Set(enabled)
  return group !== null && set.has(group)
}

/** U1 (third-pass blocking fix) — the module-tool INVOCATION two-gate. A module
 *  tool backed by an executable `entry` is trusted-equivalent to the `code`
 *  group, so invoking it requires BOTH `module` AND `code`. A pure-capability
 *  (non-executable) module tool needs `module` only. Only `module:`-prefixed
 *  tools are gated here; any other name is denied (not a module tool).
 *  `executable` defaults to TRUE (fail-closed): a module tool that could carry
 *  code is denied unless `code` is also enabled. */
export function moduleToolAllowed(
  toolName: string,
  enabled: ReadonlySet<ToolGroup> | readonly ToolGroup[] | null | undefined,
  opts?: { executable?: boolean },
): boolean {
  if (typeof toolName !== 'string' || !toolName.startsWith('module:') || toolName.length <= 'module:'.length) return false
  // F3 (adversarial) — malformed `enabled` (non-iterable object) FAILS CLOSED
  // (false), never throws. null/undefined → empty set → false.
  if (!(enabled instanceof Set || Array.isArray(enabled))) return false
  const set: ReadonlySet<ToolGroup> = enabled instanceof Set ? enabled : new Set(enabled)
  if (!set.has('module')) return false
  const executable = opts?.executable ?? true
  if (executable && !set.has('code')) return false
  return true
}

export function defaultSecurityConfig(): { token: string | null; enabled: ToolGroup[] } {
  return { token: null, enabled: ['read', 'dispatch'] }
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(Buffer.from(a), Buffer.from(b))
}

/** F1 — a non-string header value (a duplicate HTTP header is an array, a
 *  hostile value may be a number/object) is treated as ABSENT. Never crash. */
function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined
}

/** F-key — a case-insensitive header lookup (callers may pass `Authorization`
 *  or `authorization`; the transport seam uses Node-lowercased keys). */
function header(headers: Record<string, unknown> | null | undefined, name: string): string | undefined {
  if (headers === null || headers === undefined) return undefined
  if (name in headers) return asString(headers[name])
  const lower = name.toLowerCase()
  for (const k of Object.keys(headers)) {
    if (k.toLowerCase() === lower) return asString(headers[k])
  }
  return undefined
}

export function authorized(
  headers: Record<string, unknown> | null | undefined,
  token: string | null,
): boolean {
  // F-gate — a null/undefined headers object is a hostile/wiring input; treat
  // as NO headers (fails closed), never throw.
  if (headers === null || headers === undefined) return token === null
  // F6 — a non-null token must be non-empty (an empty-string token would admit
  // `Bearer ` / an empty `mcp-token`); an empty token authenticates nothing.
  if (token === null || token === '') return token === null
  // F-key — case-insensitive header lookup (a caller may pass
  // `Authorization`/`MCP-Token`; the transport seam uses Node-lowercased keys).
  const auth = header(headers, 'authorization')
  if (auth !== undefined && auth !== '') {
    const scheme = auth.slice(0, 7).toLowerCase()
    if (scheme === 'bearer ') {
      const supplied = auth.slice(7)
      if (safeEqual(supplied, token)) return true
    }
  }
  const mcpToken = header(headers, 'mcp-token')
  if (mcpToken !== undefined && safeEqual(mcpToken, token)) return true
  return false
}

const VALID_GROUPS: ReadonlySet<string> = new Set(['read', 'dispatch', 'graph', 'code', 'module'])

/** F3/F4 — a token/groups/disable field of the wrong shape ⇒ the whole patch
 *  is REJECTED (config unchanged, never throws). */
function isToolGroup(v: unknown): v is ToolGroup {
  return typeof v === 'string' && VALID_GROUPS.has(v)
}

export function applyPatch(
  config: { token: string | null; enabled: ToolGroup[] },
  patch: {
    token?: string | null
    groups?: ToolGroup[]
    disable?: ToolGroup[]
  },
): { token: string | null; enabled: ToolGroup[] } {
  const { groups, disable } = patch
  // F3 — token must be string|null (non-empty if set).
  if (patch.token !== undefined && (typeof patch.token !== 'string' || patch.token === '')) {
    return config
  }
  // F4 — groups/disable must be arrays of valid ToolGroup (non-iterable/mixed
  // inputs reject the whole patch, never throw).
  if (groups !== undefined && (!Array.isArray(groups) || !groups.every(isToolGroup))) {
    return config
  }
  if (disable !== undefined && (!Array.isArray(disable) || !disable.every(isToolGroup))) {
    return config
  }
  const add = groups ?? []
  const del = disable ?? []
  // F5 — always a FRESH enabled array (no aliasing into the caller's config).
  const enabled = [...config.enabled]
  for (const g of add) if (!enabled.includes(g)) enabled.push(g)
  for (const g of del) {
    const i = enabled.indexOf(g)
    if (i !== -1) enabled.splice(i, 1)
  }
  return {
    token: patch.token !== undefined ? patch.token : config.token,
    enabled,
  }
}

export interface SecurityConfig { token: string | null; enabled: ToolGroup[] }

export class SecurityGate {
  private readonly _config: { token: string | null; enabled: ToolGroup[] }

  constructor(initial?: SecurityConfig) {
    this._config = initial
      ? { token: initial.token, enabled: [...initial.enabled] }
      : defaultSecurityConfig()
  }

  get config(): SecurityConfig {
    return { token: this._config.token, enabled: [...this._config.enabled] }
  }

  get enabled(): ReadonlySet<ToolGroup> {
    return new Set(this._config.enabled)
  }

  toolAllowed(name: string): boolean {
    return toolAllowed(name, this.enabled)
  }

  checkRequest(headers: Record<string, unknown> | null | undefined): { ok: true } | { ok: false; reason: string } {
    return authorized(headers, this._config.token)
      ? { ok: true }
      : { ok: false, reason: 'unauthorized' }
  }

  apply(patch: { token?: string | null; groups?: ToolGroup[]; disable?: ToolGroup[] }): SecurityGate {
    return new SecurityGate(applyPatch(this.config, patch))
  }
}
