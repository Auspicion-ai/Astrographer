# Spec — MCP Security Gate & Agent Permissions (Unit: A1)

Status: **SPEC** (the delegation gate prerequisite for the A1 TDD unit).
Source: `docs/specs/architecture-review.md` A1 + `docs/specs/mcp-endpoint.md`
§6 (Security & agent permissions). This file pins the EXACT contract so a
TestWriter can enumerate every state / fail-state.

## 1. Scope

The MCP server (main process) MUST gate every tool by a **permission group**
and (HTTP transport) an optional **loopback bearer token**, and expose a
**manual-UI-only settings surface** (never an MCP tool) for the operator. The
`new Function` eval gate (code-authoring) must be unreachable unless a human
enables it (A1).

## 2. The tool-group model (pure, testable)

`ToolGroup = 'read' | 'dispatch' | 'graph' | 'code'`

`groupForTool(toolName: string): ToolGroup` — the group a fully-qualified
tool belongs to (tool names use the `provident.` prefix):

| Tool (full name) | Group |
| --- | --- |
| `provident.get_rendered_html` | read |
| `provident.get_markdown` | read |
| `provident.list_targets` | read |
| `provident.get_node_state` | read |
| `provident.code.get` | read |
| `provident.code.validate` (shape-only) | read |
| `provident.dispatch` | dispatch |
| `provident.load` | graph |
| `provident.op` | graph |
| `provident.export` | graph |
| `provident.validate` | graph |
| `provident.teardown` | graph |
| `provident.journal` | graph |
| `provident.code.set` | code |
| `provident.code.create` | code |
| `provident.code.delete` | code |
| `provident.code.load` | code |
| `provident.code.loadBatch` | code |

`toolAllowed(toolName, enabled: ReadonlySet<ToolGroup>): boolean` —
`true` iff `groupFor(toolName) ∈ enabled` AND the tool name is a known tool
(name not in the map ⇒ `false`, never a silent allow).

`groupFor` on an unknown name ⇒ `null` (toolAllowed ⇒ `false`).

## 3. Defaults

`defaultSecurityConfig(): { token: string | null, enabled: ToolGroup[] }`:
- `token: null` (no token required)
- `enabled: ['read', 'dispatch']` — `graph` and `code` are OFF (mutation /
  re-load / eval are a human grant).

## 4. The token check (HTTP transport)

`authorized(headers, token): boolean` — when `token` is null, any request is
authorized (`true`). When `token` is non-empty, the request must carry
`Authorization: Bearer <token>` (case-insensitive scheme) OR the `mcp-token`
header equal to the token; otherwise `false`.

`authorized` on an empty `Authorization` header with a non-null token ⇒
`false`. Token comparison is constant-time (`timingSafeEqual` when both are
strings of equal length; length-mismatch ⇒ `false`).

## 5. The enabled-set semantics (mutations)

`applyPatch(config, patch)` — `patch: { token?: string|null; groups?:
ToolGroup[]; disable?: ToolGroup[] }`. UNUAMBIGUOUS (resolved 2026-08-22 — the
additive/replace ambiguity the first TestWriter pass exposed):

- **`groups` is ADDITIVE** — each group is unioned into the current `enabled`
  (deduped; current order preserved, new groups appended). `groups: ['code']`
  on a default ⇒ `['read','dispatch','code']`.
- **`disable` REMOVES** — each group is dropped from `enabled`.
  `groups: ['read'], disable: ['dispatch']` ⇒ `['read']`.
- A `groups`/`disable` member OUTSIDE the union ⇒ the whole patch is REJECTED
  (the config is returned unchanged, no throw). Never silently partial.
- `read`/`dispatch` are only defaulted ON on a FRESH config; `applyPatch` does
  NOT special-case them (the operator may disable them via `disable`).

## 6. Manual-UI-only settings surface

- IPC (`main`↔renderer): `provident:security:get` returns the current config;
  `provident:security:set` applies a patch (both manual-UI-only — they are
  NOT MCP tools; no MCP tool may reach them).
- `applyPatch(patch): SecurityConfig` returns the new config (pure).

## 6a. Adversarial findings (2026-08-22) — MUST-fix before the blind test

An adversarial review of the first A1 green landed these. They are INTERNAL
code bugs in this repo's `security.ts` (not upstream package gaps). The green
scenarios (§8) encode the HARDENED behavior; the module must conform.

| # | Finding | Fix (documented contract) |
| --- | --- | --- |
| F1 | `authorized` CRASHES on a non-string/array `authorization` header (`auth.slice(...).toLowerCase` — a duplicate HTTP header is an array). | `authorized` treats any non-string header value as `undefined` (coerce/normalize; never throws in the auth path). |
| F2 | `toolAllowed(name, enabled)` throws when `enabled` is an ARRAY (the config's own type) — `enabled.has is not a function`. | `toolAllowed` accepts `ReadonlySet<ToolGroup> | readonly ToolGroup[]` (wrap arrays in a Set internally). |
| F3 | `applyPatch` stores a non-string `token` (garbage in a security field). | `applyPatch` validates `patch.token` is `string | null`; anything else ⇒ the whole patch is rejected (config unchanged). |
| F4 | `applyPatch` CRASHES on a non-iterable `disable` (`{}`). | `applyPatch` validates `groups`/`disable` are arrays of valid `ToolGroup`; malformed ⇒ rejected (config unchanged), never throws. |
| F5 | `applyPatch` returns the SAME `enabled` array reference on a no-op (aliasing breaks the declared purity). | `applyPatch` always returns a FRESH `enabled` array. |
| F6 (low) | Empty-string token (`''`) admits `Bearer ` / empty `mcp-token`. | Documented: a non-null token must be non-empty; `applyPatch({token:''})` is REJECTED. |
| F7 (low) | Header KEY casing is not normalized (caller must lowercase). | Documented at the HTTP seam: the transport normalizes header keys to lowercase before `authorized`. |

## 7. Verify behavior

- `toolAllowed('provident.dispatch', {'read','dispatch'})` ⇒ `true`.
- `toolAllowed('provident.code.load', {'read','dispatch'})` ⇒ `false`.
- `toolAllowed('provident.unknown', {'read','dispatch','graph','code'})` ⇒
  `false` (unknown tool is never allowed).
- `defaultSecurityConfig().enabled` = `['read','dispatch']`.
- `authorized({}, null)` ⇒ `true`; `authorized({}, 'secret')` ⇒ `false`;
  `authorized({ 'authorization': 'Bearer secret' }, 'secret')` ⇒ `true`;
  `authorized({ 'authorization': 'Bearer wrong' }, 'secret')` ⇒ `false`;
  `authorized({ 'mcp-token': 'secret' }, 'secret')` ⇒ `true`.
- `getPatch({ groups: ['code'] })` on a default config ⇒ `enabled`
  `['read','dispatch','code']`; `{ groups: ['read'], disable: ['dispatch'] }`
  ⇒ `['read']`; a bogus group in the patch is rejected (config unchanged).
- `code.*` tools are `false` under the default; a token alone does NOT enable
  `code` (the groups are the only enabler).
