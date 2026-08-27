# Green Scenarios — A1 MCP Security Gate (for the blind-test loop)

Status: **GREEN-SCENARIO SET** — to be attempted during the blind-test loop
(upstream AGENTS.md item 10 / subagents.md: an agent who has NOT read the
implementation validates the DOCUMENTATION against the RUNNING code). Each
scenario below is a behavior the docs (`docs/specs/mcp-security.md`) claim; the
blind-test agent runs it against the live module/transport and confirms it
PASSES. These encode the HARDENED behavior (the adversarial fixes F1..F7), so a
blind-test failure is a doc bug OR an un-hardened regression — never a pass.

The module under test: `src/main/security.ts` (built to `dist/main/security.js`).
A probe harness imports it. (In the battery the same surface is gated by the
MCP server; here the scenarios are unit-level + a transport-integration note.)

## G1 — Tool-group mapping (documentation: spec §2)

1. `groupForTool('provident.dispatch')` → `'dispatch'`.
2. `groupForTool('provident.get_rendered_html')` → `'read'`.
3. `groupForTool('provident.code.load')` → `'code'`.
4. `groupForTool('provident.teardown')` → `'graph'`.
5. `groupForTool('provident.code.get')` → `'read'`.
6. `groupForTool('provident.unknown')` → `null`.
7. `groupForTool('')` → `null`; `groupForTool('provident.code')` → `null`
   (a prefix is not a tool).

## G2 — Permission gate (spec §2/§3)

8. Under the default `['read','dispatch']`: `toolAllowed('provident.dispatch',
   ['read','dispatch'])` → `true`.
9. Under the default: `toolAllowed('provident.get_rendered_html', ['read',
   'dispatch'])` → `true`.
10. Under the default: `toolAllowed('provident.code.load', ['read','dispatch'])`
    → `false` (code OFF by default).
11. Under the default: `toolAllowed('provident.teardown', ['read','dispatch'])`
    → `false` (graph OFF by default).
12. Under the default: `toolAllowed('provident.unknown', ['read','dispatch',
    'graph','code'])` → `false` (unknown is never allowed).
13. `toolAllowed` accepts BOTH a Set and an array (`toolAllowed('provident.
    dispatch', new Set(['read','dispatch']))` and the array form both → `true`)
    — the array-vs-Set gap (F2) is closed.
14. Enabling `code` makes `code.*` allowed: `toolAllowed('provident.code.load',
    ['read','dispatch','code'])` → `true`.

## G3 — Defaults (spec §3)

15. `defaultSecurityConfig()` → `{ token: null, enabled: ['read','dispatch'] }`
    (order matters; `graph`/`code` are OFF).
16. Two calls return independent objects (mutating one `enabled` does not affect
    the other).

## G4 — Token authorization (spec §4 + F1/F6)

17. `authorized({}, null)` → `true` (no token ⇒ open).
18. `authorized({}, 'secret')` → `false`.
19. `authorized({ authorization: 'Bearer secret' }, 'secret')` → `true`.
20. `authorized({ authorization: 'Bearer wrong' }, 'secret')` → `false`.
21. `authorized({ authorization: 'bearer secret' }, 'secret')` → `true`
    (scheme case-insensitive).
22. `authorized({ 'mcp-token': 'secret' }, 'secret')` → `true`.
23. `authorized({ authorization: '' }, 'secret')` → `false` (empty header).
24. **F1**: `authorized({ authorization: ['Bearer x','Extra'] }, 'secret')` →
    `false` (a duplicate/non-string header NEVER throws; treated absent).
25. **F1**: `authorized({ authorization: 42 }, 'secret')` → `false` (no crash).
26. **F6**: `authorized({ authorization: 'Bearer ' }, '')` → `false` and
    `authorized({ 'mcp-token': '' }, '')` → `false` (an empty token admits
    nothing — the empty-token bypass is closed).

## G5 — applyPatch (spec §5 + F3/F4/F5)

27. Enabling `code`: `applyPatch(default, { groups: ['code'] }).enabled` →
    `['read','dispatch','code']`.
28. Additive + disable: `applyPatch(default, { groups: ['code'], disable:
    ['dispatch'] }).enabled` → `['read','code']`.
29. Disable-only: `applyPatch(default, { disable: ['dispatch'] }).enabled` →
    `['read']`.
30. A bogus group rejects the whole patch unchanged:
    `applyPatch(default, { groups: ['bogus'] })` → the SAME enabled
    `['read','dispatch']`.
31. **F4**: `applyPatch(default, { disable: {} })` → does NOT throw; the config
    is returned unchanged.
32. **F4**: `applyPatch(default, { groups: 'code' })` (string, not array) →
    does NOT throw; config unchanged.
33. **F3**: `applyPatch(default, { token: 123 })` → config unchanged (non-string
    token rejected, never stored).
34. **F6**: `applyPatch(default, { token: '' })` → config unchanged (empty token
    rejected).
35. **F5**: `applyPatch(default, {})` returns a NEW object whose `enabled` is a
    FRESH array (`result.enabled !== config.enabled` — no aliasing).
36. `applyPatch(default, { token: 's' })` sets the token and PRESERVES the
    enabled list.

## G6 — Transport-integration note (for the blind-test, not a unit assert)

37. The HTTP transport MUST normalize header keys to lowercase before
    `authorized` (Node's `IncomingMessage.headers` is already lowercase; a
    raw fetch-style object with `Authorization` must be lowercased by the
    caller). Documented contract (F7).
38. A group that is DISABLED is not merely filtered at the tool boundary — the
   gate is the single source of truth; a disabled-group tool is NOT registered
   (an MCP call to it returns the SDK's "tool not found", never a silent run).

## How the blind-test uses this

- The blind-test agent reads ONLY `docs/specs/mcp-security.md` (+ this file's
  claims) and runs each numbered scenario against the module, asserting PASS.
- A scenario that FAILS is a defect OR a doc/spec drift — the blind-test
  reviewer records it (AGENTS.md item 10 / subagents.md), never edits code.
- The green set is the regression net for F1..F7: each adversarial fix maps to
  at least one scenario here (F1→24/25, F2→13, F3→33, F4→31/32, F5→35,
  F6→26/34, F7→transport note).

---

## Part 2 — the SecurityGate (Unit A1-W)

Spec: `docs/specs/mcp-security-gate.md`. The class lives in
`src/main/security.ts` and is shared by the MCP server + the manual-UI settings
surface. The blind-test runs these against the running module. They include the
F-gate + F-key hardening the adversarial pass forced.

### G7 — construction & defaults
1. `new SecurityGate().enabled` ⊇ `{read,dispatch}`, excludes `graph`/`code`;
   `token` is `null`.
2. `new SecurityGate({token:'s', enabled:['read','code']})` copies the caller
   config — mutating the caller's config AFTER construction does NOT change the
   gate (no aliasing).
3. `defaultSecurityConfig()` twice → independent objects.

### G8 — checkRequest (the token gate)
4. `new SecurityGate().checkRequest({})` → `{ok:true}` (no token ⇒ open).
5. `new SecurityGate({token:'s', enabled:['read','dispatch']}).checkRequest({authorization:'Bearer s'})` →
   `{ok:true}`.
6. `...checkRequest({authorization:'Bearer wrong'})` → `{ok:false,
   reason:'unauthorized'}`.
7. `...checkRequest({authorization:['Bearer s']})` → `{ok:false}` (never
   throws — F1).
8. **F-gate**: `...checkRequest(null)` and `...checkRequest(undefined)` →
   `{ok:false}`, NEVER throws.
9. **F-key**: `...checkRequest({ Authorization: 'Bearer s' })` (uppercase key)
   → `{ok:true}`; `{ 'MCP-Token': 's' }` → `{ok:true}`.
10. **F6**: `...checkRequest({authorization:'Bearer '})` with `token:''` →
    `{ok:false}` (empty token admits nothing).

> **Note (blind-test finding, 2026-08-23):** the `SecurityGate` constructor
> requires `enabled` to be present + iterable — a token-only config
> (`{token:'s'}`) THROWS `TypeError: initial.enabled is not iterable`. The
> canonical construction form always includes `enabled` (per
> `mcp-security-gate.md` §5). The scenarios above use the canonical form.

### G9 — toolAllowed
11. `new SecurityGate().toolAllowed('provident.dispatch')` → `true`.
12. `new SecurityGate().toolAllowed('provident.code.load')` → `false` (code
    OFF default).
13. `new SecurityGate().toolAllowed('provident.unknown')` → `false`.
14. `new SecurityGate().apply({groups:['code']}).toolAllowed('provident.code.load')`
    → `true`, AND the original gate still denies it (purity).

### G10 — apply (the immutable patch)
15. `g.apply({groups:['code']}).config.enabled` → `['read','dispatch','code']`;
    the ORIGINAL `g.config.enabled` is unchanged.
16. `g.apply({token:'x'})` returns a NEW object (`!== g`); the original `g`
    still has its old token.
17. `g.apply({token:''})` → unchanged (empty token rejected — F6).
18. `g.apply({groups:'code'})` (string) / `{disable:{}}` / `{groups:['bogus']}`
    → all return a gate with the SAME config (rejected, never throw — F3/F4).
19. `g.apply({})` → `config.enabled` is a DIFFERENT array reference than the
    original (no aliasing — F5).
20. The `config` getter returns a fresh array each call; pushing to it does not
    affect the gate.

### Transport seam (integration note, not a unit assert)
21. The MCP HTTP transport passes `req.headers` (Node-lowercased) to
    `checkRequest`; the gate ALSO accepts upper-cased keys (F-key) so a
    proxied/capitalized header still authenticates.
