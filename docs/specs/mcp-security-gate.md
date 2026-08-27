# Spec — A1 Wiring: the SecurityGate (Unit: A1-W)

Status: **SPEC** (delegation gate for the A1-wiring TDD unit). Source:
`docs/specs/mcp-security.md` + `docs/specs/architecture-review.md` A1/A6.
Pins a `SecurityGate` that the MCP server + the manual-UI settings surface
share — a single pure store of the security config + the gate decisions, so
the gate is "the single source of truth" (adversarial F2/F7 note) and is
testable without Electron.

## 1. Scope

`src/main/security.ts` already provides the pure primitives
(`groupForTool`, `toolAllowed`, `defaultSecurityConfig`, `authorized`,
`applyPatch`). This unit adds the **wiring object** — `SecurityGate` — that
holds a config, applies patches, and exposes the two gate decisions the
transport + tool-dispatch seam need. It is transport-agnostic (no Electron).

## 2. The surface (exact)

```ts
export interface SecurityConfig { token: string | null; enabled: ToolGroup[] }
export class SecurityGate {
  constructor(initial?: SecurityConfig)
  get config(): SecurityConfig                 // a copy (never the live object)
  get enabled(): ReadonlySet<ToolGroup>
  toolAllowed(name: string): boolean           // a tool may run
  checkRequest(headers: Record<string, unknown> | null | undefined): { ok: true } | { ok: false; reason: string }
  apply(patch: { token?: string | null; groups?: ToolGroup[]; disable?: ToolGroup[] }): SecurityGate  // returns a NEW gate (immutable-ish)
  private: holds the config
}
```

## 3. Behavior (every state / fail-state)

- `new SecurityGate()` uses `defaultSecurityConfig()` (`token:null`,
  `enabled:['read','dispatch']`).
- `new SecurityGate(config)` copies `config` (does NOT hold the caller's
  object / array — mutating the caller's config later does not change the
  gate).
- `gate.enabled` is a `ReadonlySet` built from the config's `enabled` — the
  tool gate consumes the SET form (advisory F2 resolved at the gate seam).
- `gate.checkRequest(headers)`:
  - token null ⇒ `{ ok: true }` always.
  - token set ⇒ `{ ok: true }` iff `authorized(headers, token)`; else
    `{ ok: false, reason: 'unauthorized' }`. NEVER throws (F1: non-string
    header values handled by `authorized`).
- `gate.toolAllowed(name)` = `toolAllowed(name, gate.enabled)`. Unknown tool
  ⇒ `false`; a disabled group's tool ⇒ `false`.
- `gate.apply(patch)` returns a NEW `SecurityGate` with the patched config
  (never mutates the receiver). Rejected patch (bogus token/group/disable)
  returns a gate with the SAME config (fresh copy — never the same object).
- `gate.config` returns a COPY (fresh object + fresh array) so a caller can
  never mutate the gate through a getter.

## 4. Immutability/purity (states)

- `gate.apply({})` returns a NEW gate (not `this`), with an identical
  config (deep-fresh).
- Two gates created independently never share state.
- `gate.config.enabled` pushed to by a caller does not affect the gate.

## 5. Verify (these are the TestWriter's exact states)

- `new SecurityGate().enabled` ⊇ `{'read','dispatch'}`, NOT `graph`/`code`.
- `new SecurityGate().checkRequest({})` ⇒ `{ ok: true }` (no token).
- `new SecurityGate({token:'s', enabled:['read','dispatch']}).checkRequest(
  {authorization:'Bearer s'})` ⇒ `{ ok: true }`; with `Bearer wrong` ⇒
  `{ ok:false, reason:'unauthorized' }`; with `{authorization:['x']}` (array)
  ⇒ `{ ok:false, reason:'unauthorized' }` (never throws).
- `new SecurityGate().toolAllowed('provident.dispatch')` ⇒ `true`;
  `.toolAllowed('provident.code.load')` ⇒ `false`.
- `gate.apply({groups:['code']}).toolAllowed('provident.code.load')` ⇒
  `true`, and the ORIGINAL gate still denies it (purity).
- `gate.apply({})` ⇒ a different object (`!==`), same config values.
- `gate.apply({token:''})` ⇒ unchanged (empty token rejected).
- Two gates never share an `enabled` array reference.
