# POST-DIVISION REBUILD — GATE-1 RECORD (the four-step proposal review)

**Date:** 2026-09-27 · **Branch:** `post-division-rebuild` · **Pass kind:** GATE RECORD (landed by the
supervisor from the four read-only step returns; the reviewer passes wrote nothing) ·
**Layer (RCA-12, mandatory):** **DOC-LAYER — nothing here is app-green, envelope-green, store-green,
engine-green or live-green.** Every figure is a **read** or a **quoted recorded reading**, labelled.

**The proposal:** `docs/specs/post-division-rebuild-proposal.md` (the gate-1 input; amended twice in-pass).
**The inputs:** `docs/specs/post-division-foundation-adoption-surface.md` (501 lines) ·
`docs/specs/post-division-local-elimination-inventory.md` (691 lines) ·
`docs/specs/post-division-engine-offload-inventory.md` (829 lines).

**Citation discipline:** `path` + **symbol** / **row id** / **§section**. **No line number appears here.**

---

## 1. THE FOUR STEPS AND THEIR VERDICTS

| Step | Role tool | Verdict | The decisive finding (quoted) |
| --- | --- | --- | --- |
| **1. Validity** | `role_validity` (read-only) | **`VALID-WITH-AMENDMENTS`** | *"the division is real and the elimination is authorised, but three of the twelve §4.1 rows' capability mappings do not reproduce (`PD-UI-1`, `PD-UI-3`, `PD-UI-10`) and the elimination mechanism is not reconciled with `DECIDED: REBUILD-ARCHIVE-POLICY`"* |
| **2. Critique** | `role_critique` (read-only) | **`NEEDS-REWORK`** | *"§4.1 was authored without the two inventories this repo already holds … so three of its twelve classifications are falsified by the foundation's own records and one row is a behaviour regression written as a deletion"* |
| **3. Architecture** | `role_architecture_review` (read-only, informed by 1+2) | **`PROCEED-WITH-AMENDMENTS`** | *"the program is buildable, but §4.1's row set is mis-shaped and incomplete in four places, W6 is falsely atomic as written, and the verification architecture still has no runnable assembled-layer gate"* |
| **4. Change analysis** | `role_change_analysis` (read-only, the gate's outcome) | **`BLOCKED-ON-SEMANTICS`** | *"the amended program is **shaped** correctly but **not delegable** — §4.7's own text escalates `PD-UI-7`/`PD-UI-8` ("both are the architect's; neither may be routed to a spec gate"), `A-9` makes `W0` un-executable against `docs/pending.md`, and `Q-A`'s pin-enforcement level is simultaneously declared open (§7.3) and pre-decided by `A-8`"* |

**Finding counts:** validity 13 (`V-1`..`V-13`) · critique 16 (`C-1`..`C-16`) · architecture 10
(`A-1`..`A-10`) · change analysis 11 (`X-1`..`X-11`).

**Why `BLOCKED-ON-SEMANTICS` is the CORRECT verdict and not a failure.** The gate's vocabulary is closed,
and the program carries **open identifiers and open rulings** that no record in either tree answers. The
protocol's rule is explicit: *a unit with any undefined row may not receive the delegable verdict — the
verdict is `BLOCKED-ON-SEMANTICS` with the open list attached, escalated to the architect IN THAT PASS,
never deferred to the spec filing.* This record is that escalation.

---

## 2. WHAT THE GATE CHANGED (the three amendments, applied in-pass)

| Amendment | Forced by | What it did |
| --- | --- | --- |
| **§4.1 re-classified** | `V-1`/`V-2`/`V-3`/`C-1`/`C-2`/`C-5`/`C-7`/`C-8` (both steps independently) | **`PD-UI-1` KEEPS its precedence resolver** (the foundation's `resolveTheme` decides nothing about appearance) · **`PD-UI-3` has NOTHING TO DELETE** (no `contain:` anywhere in `src/**`) · **`PD-UI-5` is a BUILD, not a deletion** (no gutter-affordance module exists) · **`PD-UI-10` is a behaviour-preserving replacement** (the shipped guard is a pure reader; the fix is the foundation's `reconcileMount`, not one of the fifteen vendored modules) · **`PD-UI-7`/`PD-UI-8` are `BLOCKED-ON-SEMANTICS`** · **`PD-UI-11` is `KEEP`** |
| **§4.2/§4.3/§4.4/§4.5/§4.6 added** | `C-3`/`C-13`, `V-6`, the inventories | the **measured seam gap** per row · the **engine half** (`BLOCKED-ON-ENGINE`: 7 of 19 ids; the unsatisfied conjunct is the **parked ingest route**, not persistence) · the **test-surface cost** (≈85–95 files ≈ 45 % of the suite; 9 `PROTECTED`; the `.mjs` batteries invisible to the trio) · the **W0–W9 ordering** · the **archive-policy reconciliation** |
| **§4.7 the architecture amendment** | `A-1`..`A-10` | row **splits** (`PD-UI-4` → `4a/4b/4c`; `PD-UI-2` → `U-ZONES`/`U-CENSUS`/`U-PROJ`) · **`PD-UI-3` RE-ADMITTED as a BUILD** · missing rows **minted** · `W6` → **`W6a`+`W6b`** · new constraint **`G-9`** (the source-text pin set) · the pin becomes a **machine-readable manifest + a vendored conformance leg** · the program **reshaped into three phases with `PD-UI-9` as the Phase-0 spike** |

**Three blocking findings were corroborated INDEPENDENTLY by both reviewers and by the inventories** —
the strongest signal the gate produced, and invisible to the proposal's first version: the theme row would
have deleted live behaviour behind green tests; two rows deleted artifacts that **do not exist**; and the
mount row would have regressed a **live-fixed defect** at the layer the node suite cannot see.

---

## 3. THE OPEN LIST ATTACHED TO THE VERDICT (the architect's, escalated in this pass)

| Id | The open ruling | Why it blocks |
| --- | --- | --- |
| **`Q-A`** | the vendoring pin's enforcement level (`A1` pin-only / `A2` pin + hash test / `A3` pin + cross-tree monitor). **`X-2`: §4.7's `A-8` pre-decides parts of it (a manifest + a hash row) while §7.3 leaves it open — and no unit owns either** | the vendoring unit cannot be specified until the pin's mechanism and its owner are ruled |
| **`Q-D`** | **(a) `PD-UI-7`** — the foundation's focus model **activates a matching target and appends nothing**; the fork's `newTab` **must append**, and `TabState.order` is a permutation carrier. *Who owns the duplicate/order policy?* **(b) `PD-UI-8`** — the **`provident.focus` NAME COLLISION**: the fork's tool takes a 5-kind `target` union + `tabId`; the foundation's takes `{target?: string, newTab?}` and **refuses any own key outside that set**. Adopt-and-drop, or keep-and-record-divergence? | both are **caller-visible MCP contracts**; routing either to a spec filing is exactly the two-hop deferral the foundation's own `threshold` RCA forbids |
| **`Q-E`** | **`PD-UI-12`** (the slot host — the keystone): its own boundary spec **before** any sibling row, or an explicit deferral? (`A-10` rules the deferral is safe **only if** the region boxes are recorded as staying fork-authored, since the foundation **declined `SCH-1`'s region-host half**) | **seven rows share `src/renderer/sidebar-panes.ts`** — this ruling sequences the program |
| **`Q-F`** | the **request-withdrawal wave**: the foundation's record orders the fork to **withdraw `SCH-2`/`SCH-5`/`SCH-8`/`SCH-11`** and carry the `H-r9` refile note, while `docs/pending.md` still reads *"no Astrographer unit may be sequenced against them"* for `SCH-6..SCH-11` — which `W2`/`W3`/`W5`/`W6` do | **`A-9`: `W0` is not executable until this lands** |
| **`Q-C`** | the fate of the carried baseline red (`PANE-TOGGLE-STAGE-COLLAPSE` / `P-SM-1`): dispose before, or carry as the recorded baseline | `G-1`; every unit's DONE row states its delta against it |

**Plus two structural decisions the change analysis raised (`X-2`, `X-4`):** whether the
**manifest/conformance-leg** and the **`W6a`/`W6b` markup row** become **owned units** (today they are
promised by §4.7 and owned by nobody), and whether **Phase 0 stays the main-process spike** (`PD-UI-9`,
which cannot exercise any of the three highest-risk layers) **or becomes the vendoring/pin unit plus a
baseline measurement** (`X-5`/`X-6`).

---

## 4. THE CORRECTIONS THE CHANGE ANALYSIS OWES (recorded, not all applied in this pass)

| Finding | The correction | Status |
| --- | --- | --- |
| **`X-1` [BLOCKING]** | the vendored conformance leg must be **restricted to the import-closed suites** — four of the fifteen foundation suites import `../src/shared/dom-shim.js`, `../src/renderer/runtime.js` or `../src/shared/demo-envelope.js`, which resolve to the fork's **divergent** copies the program rules out of scope; *"they prove the fork's copy IS the pinned contract"* is **false for those four** | **OWED — §4.7 amended on paper; the leg's spec must carry the restriction** |
| **`X-2` [BLOCKING]** | mint **one vendoring/pin unit** (manifest keys, hash row, conformance leg, its own dossier, the `docs/decisions.md` pin record per `V-13`) | **OWED — needs `Q-A` first** |
| **`X-3` [HIGH]** | re-derive the **per-file test disposition** per amended row before delegating, and mark every count `(measured \| derived)` — the inventory's §4 classes contradict its own §2.1 cells in at least two places and self-declare *"DERIVED … NOT measured"* | **OWED — Phase 0's first duty** |
| **`X-4` [HIGH]** | mint the **markup/declaration row** (`PD-UI-13`) and assign `PD-UI-3` to a wave — today `W6a`/`W6b` and the re-admitted BUILD have **no owning unit** | **OWED** |
| **`X-5`/`X-6` [HIGH]** | decide Phase 0's shape; **extend `G-1` to include `npm run divergence` and `npm run battery` at the branch head** (both **UNMEASURED** by every pass so far — and the foundation's own live battery took `PRECONDITION-FAILED` on a RED divergence leg) | **OWED — `Q` ruling + a baseline measurement** |
| **`X-7` [HIGH]** | the **stale engine-persistence premise** spans **more than the three sites the proposal names**: `docs/next-steps.md` §P2 · `docs/HANDOFF.md` `O-7` · `docs/specs/design-extensions-review.md` §14.1 `C-1` · **`docs/specs/unit-authority-switch.md` `C2` (a gate condition)** · `docs/specs/unit-corpus-migration.md` · `docs/specs/rebuild-drift-map-2026-09-21.md` · `docs/specs/gnosis-offload-proposal.md` · `docs/feature-requests/gnosis-engine-prerequisites.md` — while Gnosis records `D-D1`+`D-D2` **LANDED-GREEN** | **OWED — `W0`'s second deliverable, with a named owner** |
| **`X-8`** [MED] | re-cite the archive ground as `REBUILD-ARCHIVE-POLICY` **clause (1)** (spec supersession); the *"ARCHIVE-READY IS EMPTY (0 of 224)"* line belongs to the **SUPERSEDED** `PRUNING-FOLLOWS-THE-IMPLEMENTING-UNIT` | **OWED** |
| **`X-9`** [MED] | extend `G-9`: `tests/unit-v5-migration-contract.test.ts` also pins **`package.json`'s test scripts and `vitest.config.ts`'s `testTimeout` exactly (floor and ceiling)**, both touched by the new runners and by the +15 vendored suites | **OWED** |
| **`X-10`** [MED] | correct the proposal header / §7.2 and the two tracker rows to the gate's actual state | **DONE in this pass** (§7.4 + the trackers) |
| **`X-11`** [LOW] | rule the runner for the two uncollected `.mjs` batteries explicitly rather than *"or they stay invisible"* | **OWED — assign it** |

---

## 5. THE RESIDUAL RISK LEDGER (accepted / mitigated / unresolved)

| Risk | Disposition | Owner | What closes it |
| --- | --- | --- | --- |
| carried baseline red `PANE-TOGGLE-STAGE-COLLAPSE` | **accepted as the recorded baseline** (pending `Q-C`) | architect | a disposition row, or an explicit carry decision |
| `Q-A`/`Q-D`/`Q-E`/`Q-F` open rulings | **UNRESOLVED — the verdict driver** | architect | the rulings, with each dossier carrying no `undefined-until-answered` row; for `PD-UI-8`, a same-commit amendment to this repo's `docs/specs/mcp-endpoint.md` §3 (which carries **no focus row at all**) |
| the engine **elimination** half (7 of 19 ids) | **accepted as out of this gate** — `BLOCKED-ON-ENGINE` | upstream Gnosis | an accepted ingest/record-copy route (`GR-6a`'s trigger) + a caller-id route |
| the stale engine-persistence premise | **unresolved — correction owed, no owner** (`X-7`) | supervisor | `W0`'s second deliverable |
| `.mjs` batteries outside `vitest.config.ts`'s `include` | **partially mitigated** (`G-5` adds `npm run battery` per UI unit) | Phase-0 unit | `X-11`'s named runner |
| **`npm run divergence` / `npm run battery` state at the branch head** | **UNMEASURED by every pass** | supervisor | `X-6`'s baseline reading |
| the `201`-vs-`221` suite-count disagreement | **unresolved** | supervisor | a fresh measured reading at the branch head (the vendored suites move it again) |
| `PROTECTED` pin collisions (`unit-live11-bridge-seams` on `defaultLayout`/`coerceLayout`; the electron-mock census; the v5-migration pins) | **mitigated by design** (frozen exports, additive suites, no new electron mocks) | each wave | per-wave pin re-derivation (`G-9`, extended per `X-9`) |
| `threshold`/`selectors`/`data-zone` contraband vs adopted seam names | **unresolved until the dossiers land** | architect (collision blocks) | each dossier reconciling **every hit by row id** |
| foundation greens are envelope-layer; `gutter-ui-live-battery.md` **OPEN** on a RED divergence precondition | **accepted as a carried caution** (`G-6`) | each unit | the fork's own rendered/live evidence per unit |
| the two fork-side engine adoption defects (`resultVersion`/`commitToken` discarded; the `durability` axis dropped) | **recorded, independent of the chain** | the engine additive set | tracker rows now, or live drift later |

---

## 6. WHAT THE GATE AUTHORISES — AND WHAT IT DOES NOT

**Nothing in this gate authorises a spec, a test or a code change.** The verdict is `BLOCKED-ON-SEMANTICS`;
the open list is §3.

**What CAN proceed once the rulings land:** the corrected gate record and the tracker corrections (`X-7`,
`X-10`) · the `W0` dossier-and-decision pass · then **Phase 0 and the renderer chain ONE UNIT AT A TIME**,
each still gated by its own spec + a **run and reported** red set.

**What it does NOT authorise:** any **engine-side elimination** (that half stays `BLOCKED-ON-ENGINE`) ·
any **cutover of a local corpus write** (`G-4`, whose premise is stale and whose correction is owed) ·
any **new live matrix slot** (`G-5`: the matrix is full at 8) · any **fence edit** (`tests/traversal.test.ts`,
`tests/import-render-no-duplicates.test.ts`) without a re-planned fence · and any claim that a
foundation green is app evidence (`G-6`).
