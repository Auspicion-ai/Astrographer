# Review — `module.*` extension-system (three-agent gate, 2026-08-26)

**Status**: GATE COMPLETE — **GO-CONDITIONAL** (8 blocking reshapes before any code).
**Inputs**: `docs/specs/module-import-proposal.md`; validity review (VERDICT
VALID-WITH-RESHAPES); critique review (VERDICT NOT READY); change-analysis.

## Design decisions (user-resolved, 2026-08-26)

| ID | Decision |
| --- | --- |
| E-v1 | Manifest + capabilities router (tools / hooks / transforms) |
| E-c1 | Reject-with-force on version conflict (same name+version → no-op; diff version → reject unless `force`) |
| E-g1 | A new `module` tool group, OFF by default |
| E-s1 | Persisted registry store (mirrors `SecurityStore`) |

## Gate reshapes (M-r1..M-r8 BLOCKING, M-r9..M-r12 ADVISORY)

### BLOCKING (must land before code)

| ID | Decision | Resolves |
| --- | --- | --- |
| **M-r1** | Sandbox module execution from `window.provident.security`; module entry is untrusted, renderer-isolated; gets a delegated `ctx`, never `window`/Runtime/SecurePanels | R1, F1.2 |
| **M-r2** | Executable module entries require the `code` group IN ADDITION to `module` (two-gate: `module` && `code`). A pure-capability module (no entry) needs only `module`. Resolves M-e1: compose, don't self-grant | R2, M-e1, F1.1 |
| **M-r3** | Namespace + gate-thread every module tool as `module:<name>.<tool>`; dynamic registration + live re-register/deregister on group change | R3, F3.1, M-cap |
| **M-r4** | Add a binary/image MCP tool-result channel (screen-capture acceptance depends on it) | R4, F1.4 |
| **M-r5** | Render-transform is EMIT-ONLY (never graph-mutating) + hook/transform ordering contract | R5, F3.3, F5.3 |
| **M-r6** | Add `module` to `VALID_GROUPS`, `MUTATING_METHODS`, secure-panels GROUPS | R6, F1.2 |
| **M-r7** | Post-install containment: limited data surface, no network unless declared, SecurePanels never reachable | F1.2, M-d2 |
| **M-r8** | Persisted store fail-closed on corrupt/missing source + hash-verified source (never falls back to default like security-store) | F4.1, F4.2 |

### ADVISORY (defer to a later phase; document as open)

| ID | Decision |
| --- | --- |
| **M-r9** | Downgrade/upgrade model: `force` required to downgrade; no module-to-module dependency graph this pass |
| **M-r10** | Router: undefined-capability returns error; a throwing module is quarantined |
| **M-r11** | Disable/enable + rollback |
| **M-r12** | Async-network hooks off the synchronous render path (bounded queue, not inline) |

## Tool-group model (recommended)

Composable two-gate: `module` = capability grant; `code` = additionally required to
install/run an executable `entry`. This reuses the hardened `code` eval gate
(no confused deputy), keeps pure-capability modules ergonomic, and keeps `module`
OFF by default.

## Test-case re-scoping

| Test case | Verdict |
| --- | --- |
| Screen-capture MCP tool | Keep as acceptance ONCE M-r4 (image channel) lands; re-scope interim to an in-repo SVG render capture |
| Vector embedding | Re-scope to an offline/local-store mock (not a real remote network call) until M-r12 async queue; async-only |
| Code formatter | Keep as acceptance (M-r5 emit-only, synchronous) |

## Persisted-store model (recommended)

Fail-closed + hash-verified: `{ name, version, capabilities, source, hash, installedAt }`,
source stored as string + SHA. Boot: any entry failing hash/sandbox eval is QUARANTINED
(kept, not loaded); a corrupt store file FAILS CLOSED (does NOT default to no-modules).

## Go/no-go

**GO-CONDITIONAL** — proceed only after the 8-blocking reshape set (M-r1..M-r8) is
written into the hardened proposal contract and the trio (test/typecheck/build) is
green. M-r9..M-r12 are documented as open in `docs/pending.md` before any unit is
reported done. **No code until then.**

## Speculative-tracker row

`docs/decisions.md` SPECULATIVE/IN GATE row (MODULE-EXTENSIONS) records the gate;
update to GATE-COMPLETE when the reshape contract is hardened.

---

## SECOND-PASS REVIEW (2026-08-26) — VERDICT: STILL-NOT-READY

The hardened contract (M-r1..M-r8) was re-run through the gate. Both the validity
reviewer and the critique reviewer independently returned **STILL-NEEDS-RESHAPE /
STILL-NOT-READY**, converging on ONE load-bearing blocker plus several sharpenings.

### The blocker: M-r1 "isolated realm" is not buildable as specified

**Validity (2nd pass):** M-r1 is unpinned — the contract names a goal ("isolated
realm / never `window.provident`") but no mechanism. The codebase has NO
JS-execution isolation primitive (only graph-scope isolation). Under CSP
`unsafe-eval`, a `new Function`-materialized module entry runs in the same global
scope that holds `window.provident.security` (the self-grant channel), and the
existing handler-string precedent (`secure-panels.ts` TOGGLE_BODY) PROVES the main
world reaches it. **M-r1 NOT-RESOLVED; M-r7's containment reduces to it.**

**Critique (2nd pass):** the "isolated realm" is unbuildable in this Electron
renderer. `new Function` binds the module to the renderer global scope — `window`,
`document`, `window.provident.security` all reachable. A true isolated realm
(ShadowRealm / sandboxed iframe / Worker) cannot synchronously mutate the live
Supervisor graph/DOM. So "isolated realm" and "drives the live graph" are mutually
exclusive. **The sandbox is security-theater as written.**

### Corroborating findings (both passes agree on these)

| Finding | Severity | Status |
| --- | --- | --- |
| F1.2 sandbox unreachable in this runtime | BLOCKING | STILL-OPEN |
| M-r6 gap: `security.ts:95` VALID_GROUPS + `ToolGroup` union (line 3) omitted from the file list — without it the `module` group can't be toggled | HIGH | **RESOLVED 2026-08-26 (U1)** — `module` added to `VALID_GROUPS` (security.ts + security-store.ts) + the `ToolGroup` union + secure-panels GROUPS |
| M-r4: image channel feasible, but `maybeDigest`/`largePayloadBytes` must extend to it (unbounded payload risk) | HIGH | **RESOLVED 2026-08-26 (U5)** — `maybeDigest`/`maybeDigestForTest` now bound a large IMAGE `content` block (base64 summed vs `largePayloadBytes`; over-bound → `{digest, truncated:true}`); `imageResult` + unicode-safe `ctx.captureView()` land the M-r4 image channel |
| F2.2: `dependsOn` declared but no resolver + no install-time rejection = dangling-dep partial state | HIGH | open |
| M-r8: fail-CLOSED on corrupt store bricks boot for an optional capability with no recovery (rollback deferred) — prefer fail-DISABLED/quarantine | MEDIUM | open |
| M-r5: emit-only transform not specified as applied to BOTH DOM + SSR adapters → MCP agent's ssrHtml/markdown can diverge from operator DOM | MEDIUM | open |
| Renderer CSP has no `connect-src` — a declared-network module is silently blocked; "no network unless declared" mechanism unspecified | MEDIUM | open |

### Overcorrection checks (passed)

Pure-capability (no-entry) modules correctly require `module` only — NOT over-restrictive.

### Architect decision needed

The gate has surfaced a genuine design fork that only the architect can resolve:

- **(a) Re-architect isolation honestly**: adopt cross-realm isolation (Worker /
  sandboxed iframe) with a message-bridge + its own permission plumbing, accepting
  that module tools/hooks can no longer synchronously mutate the live graph. Large
  redesign.
- **(b) Drop the isolation claim**: declare the module feature NON-isolating, lean
  entirely on the `module`-OFF-by-default + `code`-two-gate + token gate as the
  real boundary, and document that a granted module is trusted-equivalent to the
  `code` group. Simpler, honest about the runtime reality.
- **(c) Reject the feature**: the isolation requirement this repo's own security
  posture demands is not cheaply satisfiable; park it as a deferred speculative
  item.

Until the architect picks (a)/(b)/(c), the hardened contract must NOT go to code.

### ARCHITECT DECISION (2026-08-26): **(b) — DROP THE ISOLATION CLAIM, GATE-ONLY**

The architect chose option **(b)**: the module-extension feature is declared
**NON-isolating** — a granted module is trusted-equivalent to the `code` group.

**What this means:**
- M-r1 (isolated realm) is **REPLACED** by a **trust-equivalence pin**: module
  code is NOT sandboxed from `window.provident.security`; a granted module is as
  trusted as a `code`-group grant. The security boundary is the authorization
  gate, not a process barrier.
- A module with an executable `entry` requires **`module` AND `code`** (both OFF
  by default). A pure-capability module (no entry) requires `module` only.
- The **SecurePanels graph isolation still holds at the GRAPH level**: module
  tools/hooks route through the app Runtime (which cannot address the panes
  graph). This is the same graph-isolation already proven by the multi-graph
  decision.
- Honest doc language: **"a granted module is trusted-equivalent to the `code`
  group (arbitrary code execution); grant only to trusted modules."**

**Secure-module blocker (the WALL the gate hit, now resolved by (b)):** the
"sandbox" (M-r1) was unbuildable — `new Function` under CSP `unsafe-eval` binds
module code to the renderer global scope that holds `window.provident.security`
(the self-grant channel). Option (b) removes the impossible sandbox and instead
gates module code with the existing hardened `code` trust boundary. Full
blocker + the required internal toolset to build example modules WITHOUT allowing
arbitrary external code → `docs/specs/module-feature-list.md`.

---

## THIRD-PASS REVIEW (2026-08-26) — contract revised under (b)

Validity: **VALID-AS-STATED** (isolation honestly dropped; two-gate + OFF-by-default
is a coherent sole boundary; toolset is a sound sanctioned path; fail-disabled +
M-r6/M-r3/test-seams correctly specified).
Critique: **STILL-NOT-READY** — the trust-equivalence model itself is sound, but
two blockers remain before code.

### Blocking finding (critique pass 3): invocation-gate escalation

Module tools are gated at INVOCATION by `module` only (M-r3), but an installed
module's tool handler IS its entry = arbitrary code (trusted-equivalent to `code`).
A `module`-granted (not `code`-granted) agent could invoke `module:<name>.<tool>`
to run arbitrary renderer-context code, reaching `window.provident.security` and
self-granting. **Fix (must pin):** a per-call `module` AND `code` two-gate at
INVOCATION for any module backed by an executable entry; `force` never bypasses
authorization (only E-c1 version conflict); specify post-install re-gating.

### Blocking finding (critique pass 3): honest-label errors

1. "WITHOUT allowing arbitrary external code" (contract §7b, feature-list §3) is
   FALSE under (b) — the toolset is a sanctioned/ergonomic path, NOT a security
   barrier (a raw-`new Function` entry can reach anything). Re-label: "the
   sanctioned authoring path (ergonomics, NOT a security boundary)."
2. "SecurePanels never reachable / hard invariant" (contract §4, §9 M-d2) is
   OVERSTATED at the JS level — a module entry runs in the same document as
   `#panes`. Restate: "not reachable THROUGH the sanctioned module tool/hook
   (graph router) path."

### Corroborated still-open items (must land before code)

| Item | Status |
| --- | --- |
| M-r4: extend `maybeDigest`/`largePayloadBytes` to the image tool result | **RESOLVED 2026-08-26 (U5)** — `maybeDigest` image bounding + `imageResult` landed (`tests/module-image.test.ts` 8) |
| CSP `connect-src` mechanism for declared-network modules (none today) | open |
| M-r5: pin emit-only transform on BOTH DOM + SSR adapters in contract §4 | open |
| `dependsOn`-on-quarantined/absent module = no-op note (M-r9 deferral) | open |

### Verdict

The (b) trust-equivalence model is sound and honestly dropped the impossible
isolation. But the contract must land the invocation two-gate + the two label
corrections + the four open pins before it is READY-FOR-CODE. Architect may
accept these as the final blocking set, or re-defer the feature.

### U1 implementation status (2026-08-26)

The M-r2/M-r3/M-r6 + invocation-two-gate rulings are implemented in U1
(`src/main/security.ts`, `security-store.ts`, `src/renderer/secure-panels.ts`):
the `module` group + static `module.*` tools + the `module:`-prefix resolution
(empty-rest denied) and the `moduleToolAllowed` two-gate predicate (fail-closed
on malformed input + empty name), unit-tested (`tests/module-security-gate.test.ts`,
23 tests). **F1 residual (open):** `moduleToolAllowed` is not yet wired into a
module-tool dispatch path — that call-site enforcement + live re-register lands
with U9 (`docs/specs/module-feature-list.md` §5). The two label corrections
(§7b honest-label; §4/§9 M-d2 restatement) are reflected in the proposal contract.
