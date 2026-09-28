# Unit `PD-VENDOR` — the vendoring/pin unit (Phase 0): the vendored foundation mechanism set, the machine-readable manifest, the `A2` hash row, the `A3` cross-tree drift monitor, and the scoped conformance leg — Spec

**Status: SPEC — authored 2026-09-27. NO CODE LANDED, NO TEST LANDED, NOTHING RUN by this pass.**
**Pass kind:** SPEC (the contract only). **Program:** `docs/specs/post-division-rebuild-proposal.md` (its
§2 measured vendoring model, §4.1 corrected row set, §4.7 architecture amendment, §7.4/§7.5 rulings and
measured baselines). **Gate record:** `docs/specs/post-division-rebuild-proposal-review.md` (verdict
`BLOCKED-ON-SEMANTICS`; `X-1`…`X-11`). **Authority:** `docs/decisions.md`
**`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE`** (ACTIVE), read in full before this file was
authored, together with `DECIDED: REBUILD-ARCHIVE-POLICY` (ACTIVE, clauses (1)/(2)/(3)).

**Layer (RCA-12, mandatory declaration).** **DOC-LAYER for every claim in this file.** This spec asserts
**nothing** that is app-green, envelope-green, store-green, engine-green or live-green. Per deliverable:

| Deliverable | The layer its evidence covers | What that layer does NOT prove |
| --- | --- | --- |
| the vendored `src/shared/<x>.ts` copies | **`[T]` / source-layer** — byte-identity to a pinned commit | that any consumer works, and that the app renders (`G-6`, `RCA-12`) |
| `vendor/foundation.lock.json` | **DOC/MACHINE-DATA layer** — a provenance record | that the bytes it names exist until a row reads them |
| the `A2` hash row | **`[T]` / node-suite** (an ENVELOPE-green instrument) | drift upstream; IPC; layout; the assembled app |
| the `A3` cross-tree monitor | **`[D]`-class local instrument** (harness/script layer) | that the app works; it compares **files**, never behaviour |
| the conformance leg | **`[T]`/`[H]` — the foundation's OWN node suites**, re-run against the vendored copies | that the fork USES the modules correctly, or that the shell behaves (`G-6`) |
| anything about the Electron app | **NOT CLAIMED ANYWHERE IN THIS FILE** | — |

**A node-suite green is ENVELOPE-green, not APP-green** (`docs/specs/rca-live-bugs-green-pipeline.md`
`RCA-12`; `docs/specs/unit-stage-active-tab-display.md`'s layer block). **The foundation's greens are
envelope-layer only** (`G-6`): a vendored copy passing a vendored suite proves **the copy matches the pinned
contract**, never that the app works. **`npm run divergence` is RED at this branch head for an ENVIRONMENTAL
reason** (`/dev/shm` denial → Electron `SIGTRAP`; proposal §7.5) and `A-7` makes it a **mandatory pre-live**
leg — **this unit is NOT the harness fix** (that is its own owed unit, §9 item 1) and **claims no live leg**.

**Citation discipline.** `path` + **symbol** / **row id** / **§section**; **no line number appears in this
file** (`docs/specs/requirement-catalog.md` §3.4 rule 7). Where a quoted source carries a line number, it is
quoted **as that source's own text**, never adopted as this file's address.

**Verification markers used below.** **VERIFIED-BY-READ** = read in this pass from the named tree, and the
reader is named. **UNVERIFIED** = named, not settled by this pass, **with what would settle it**. **No md5
figure in this file is verified by this pass** — see §1.3, which is the unit's largest open item.

---

## 0. The rulings this unit derives from (recorded, NOT re-opened)

| # | Ruling, and its source | Carried here as |
| --- | --- | --- |
| **R-1** | **Vendoring is the consumption model.** The foundation's mechanisms are **copied into this repo's `src/shared/` as source**, because the foundation is **not an npm dependency**, the two trees **share no git history**, and the fifteen modules' complete import census is internal to the set. Submodule/subtree, a second remote, a local package extraction and re-baselining onto the foundation tree are all **rejected with recorded reasons**. — `docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` clause (1); `../Provident-Electron/docs/guide/seams.md` (*"a fork consumes them as source"*) | §3 the set; §2.1 the census |
| **R-2** | **The pin is MECHANICAL: `A3` monitor + a machine-readable manifest** (`vendor/foundation.lock.json`), **never prose md5s in a tracker** (a second hand-maintained truth). — `A-8`; `Q-A`; proposal §7.4 | §2.2, §3.3, §3.4 |
| **R-3** | **The four divergent baseline files are NOT replaced** — `src/shared/dom-shim.ts`, `src/shared/types.ts`, `src/shared/demo-envelope.ts`, `src/shared/path-fork-cycle.ts`. **A wholesale replacement is out of scope and would be a regression** (the fork's `dom-shim.ts` and `types.ts` are strictly larger than the foundation's at the pinned commit). — the decision row clause (2); proposal §2, §4.1's `C-14`; gate §2 | §2.3 (`N-1`), §4 (`P-IM-5`) |
| **R-4** | **The vendored suites enter as an ADDITIVE leg, never as a unit's red set** (`DECIDED: REBUILD-ARCHIVE-POLICY` clause (2)), **and NO vendored suite that mocks `'electron'` may be added** (the protected bridge-mock census pins the exact name-set). — `A-8`; `X-9`; `X-1` | §3.5, §4 (`P-SM-1`) |
| **R-5** | **The conformance leg is RESTRICTED to the suites whose import closure is exactly the vendored set** — four of the foundation's suites import `dom-shim.js`, `demo-envelope.js` or `runtime.js`, which resolve to this repo's **divergent** copies, so *"they prove the fork's copy IS the pinned contract"* is **false for those four**. — **`X-1` [BLOCKING]**; proposal §4.7's `A-8` as amended | §3.5 (the exclusion list, with the reason per suite) |
| **R-6** | **The four `SCH` asks the foundation now owns are WITHDRAWN** (`SCH-2`/`SCH-5`/`SCH-8`/`SCH-11`, with the `H-r9` note) — `Q-F`, decision row clause (5). **This unit does not re-litigate them** | §7 `D-6`; §9 |
| **R-7** | **`G-9`/`X-9` — the protected pin set** this unit brushes against: `tests/unit-v5-migration-contract.test.ts` pins **`package.json`'s test scripts**, **`vitest.config.ts`'s `testTimeout` exactly (floor AND ceiling: `15_000`)**, `src/main/markdown-import.ts`, two `DEEP_ROWS` files, and the **electron-mock name-set**; plus `tests/fixtures/v5-bridge-capture-fixture.js` | §2.4, §3.6, §4 (`P-SM-1`, `P-TP-1`) |
| **R-8** | **Phase 0 is the vendoring/pin unit PLUS the baseline measurements — not the `PD-UI-9` spike** — proposal §7.4. **The baseline measurements already ran** (§7.5): `npm run battery` = `184 checks, 0 failures` **GREEN** `[B]`; `npm run divergence` = `1 checks, 2 failures` **RED**, cause ENVIRONMENTAL | §6 (`G-1` extended), §8 |
| **R-9** | **`G-4` is SCOPED, not dropped** — it forbids removing a LOCAL WRITE path for ENGINE-OWNED DATA (the corpus) while the ingest route is parked, and **it does NOT forbid the `PD-UI-2` CSS-write replacement** | §1.3 (`O-6`), §7 `D-5` |

### 0A. The dated ruling notes — the clauses this filing DECIDES, and the clauses it ESCALATES (2026-09-27)

These are **CONTRACT, not commentary** (`../Provident-Electron/docs/specs/theme.md` §0A's form). Each is
either a decision this filing is entitled to take, or a named escalation.

1. **THE VENDORED SET IS THE FIFTEEN MODULES MINUS NONE.** The decision row's clause (1) is **by name**
   (fifteen modules), clause (2) names **four files that are NOT those** (`dom-shim`, `types`,
   `demo-envelope`, `path-fork-cycle`). **Therefore `slot-host.ts` and `owned-list-host.ts` ARE vendored** —
   §2.1 item 4 records the inference this ruling corrects, and §2.1 item 5 states the two different senses of
   *"out of the set"* so the exclusion is never over-read.
2. **THE VENDORED SUITES PLACE AT `vendor/Provident-Electron/tests/`, NOT AT `tests/`.** `A-8` says *"their
   `../src/shared/<x>.js` specifiers resolve unmodified at `tests/`"*. **That placement is REFUSED here**, and
   the reason is mechanical: `vitest.config.ts`'s `include` is `tests/**/*.test.ts` and **`vitest.config.ts` is
   a `G-9`-protected file** (`R-7`), while the same file's `testTimeout` is pinned **exactly**. A second
   `tests/**` tree of fifteen suites would enter the collected set of the `npm test` leg — the leg whose one
   carried red is the branch baseline (`G-1`) — and the only way to keep them out would be to edit the pinned
   config. **`vendor/Provident-Electron/tests/` preserves the identical relative depth** (`../../src/shared/`
   resolves to this repo's `src/shared/` from there, exactly as `../src/shared/` resolves from the foundation's
   `tests/`), so **every specifier resolves unmodified**, and `npm test` is untouched. **This is a recorded
   departure from the letter of `A-8`, preserving its purpose** — it is the unit's **second escalation**
   (§1.1 `O-2`).
3. **THE CONFORMANCE LEG IS NOT AN ALL-GREEN INSTRUMENT, AND THIS FILE DOES NOT CLAIM IT AS ONE.** Every
   candidate suite carries **rows that assert the FOUNDATION REPO'S OWN state** — an allow-list/diff-scope
   audit over its own unit's commit range (`git status --porcelain`), reads of the foundation's own
   `docs/specs/<unit>.md` / `<unit>-review.md` / `<unit>-greens.md` artifacts, `existsSync` probes of
   `docs/skills/designing-pages.md` **whose FAILURE is the intended reading in the foundation**
   (`../Provident-Electron/docs/specs/theme.md` §3.5 `X-4`/`designing-pages.md` absence probe), and reads of
   `src/shared/dom-shim.ts` as the **foundation's** frozen file. **In this repo those rows cannot pass and are
   NOT copy-fidelity evidence.** Therefore: the leg's **pass condition is scoped by this file** (§3.5 item 4),
   a suite may be filed with its audit rows **red**, and **no row of this unit may report the leg as green on
   the strength of a suite whose module-rows were not separately read**. **This is the unit's third
   escalation** (§1.1 `O-5`).
4. **THE `A2` HASH ROW READS THE SHIPPED FILE, NEVER THE CONFORMANCE COPY.** A row that hashed the
   `vendor/`-tree copy would be **self-satisfying** and would not pin what the app imports. **DECIDED**:
   `A2` hashes `src/shared/<x>.ts` against the manifest; §4 `P-TP-1` makes that discrimination a pinned row.
5. **THE PIN RECORD LIVES IN THE MANIFEST, NOT IN `docs/decisions.md`.** `V-13` owed `A1`'s record a durable
   home; `A-8` forbids prose md5 tables as a **second hand-maintained truth**. **DECIDED**: the durable record
   is `vendor/foundation.lock.json` **plus** the ACTIVE decision row's existing clause (which names the model
   and the mechanism, and no per-module figures). **This unit writes NO new `docs/decisions.md` row** (§1.2
   `O-4`).
6. **THE FOUNDATION'S FOUR IMPORT-EXTERNAL SUITES ARE EXCLUDED FROM THE LEG, NOT FROM THE VENDORING.** The
   exclusion is a **leg** disposition (§3.5 item 3). The four modules they test **stay vendored**.
7. **THE TWO UNEXPORTED RETURN SHAPES ARE A RECORDED CONSUMER COST, NOT A VENDORING COST.** `GestureSession`
   (`src/shared/gesture-session.ts`, declared **without** `export`) and the four module-local shapes the
   foundation's own guide names (`RelocateResetResult`, `FocusResult`, `FocusRefusal`, `FocusTransitionArg` —
   `../Provident-Electron/docs/guide/seams.md` *"Two return shapes you cannot import"*) are **not obtainable
   by a consumer**. **The fork re-declares them**; **the module bytes stay unmodified** (a patch would break
   §4 `P-IM-1`'s byte-identity). **This is the unit's fourth escalation** (§1.1 `O-7`).
8. **THE IMPORT-CLOSURE EVIDENCE IS A READ, AND ITS COMMAND IS RECORDED.** §2.1 item 3 states the read this
   pass ran and its exact match pattern, so `X-3`'s *"(measured | derived)"* labelling is satisfied: the
   census is **MEASURED** by this pass; the md5 table is **NOT** (§1.3).
9. **NO CLAIM IN THIS FILE IS A LIVE OR APP CLAIM.** Where this file reports `G-1`'s measurements it does so
   as **`RECORDED readings`** taken by the proposal's pass, labelled `[H]`/`[D]` at their own layer (§8).
10. **`docs/skills/designing-pages.md` DOES NOT EXIST IN THIS REPO AND THIS UNIT DOES NOT CREATE IT.** A glob
    of `docs/skills/*` in this repo returns `process-guardrails.md` **alone** (VERIFIED-BY-READ, this pass).
    **No page design is affected by this unit** (it renders nothing), so no coverage-matrix row and no
    demo-page entry are owed — **the honest form of that row is an ABSENCE row**, recorded in §9 item 5.

---

## 1. Scope

### 1.1 What this unit IS (the architect's own wording: *"the vendoring/pin unit"*)

Five deliverables, **all promised by proposal §4.7's `A-8` and owned by no unit until `X-2` minted this one**:

1. **The vendored set** — the foundation's mechanism modules copied into this repo's `src/shared/` as source,
   **byte-identical to the pinned commit** (§2.1, §3.1).
2. **`vendor/foundation.lock.json`** — the machine-readable manifest: the foundation commit and a
   **per-module md5**, plus the census and the exclusion records (§2.2, §3.3).
3. **The `A3` cross-tree drift monitor** — compares the vendored copies against
   `../Provident-Electron/src/shared/*.ts` **when that directory is present**, and is **SKIPPED when it is
   absent** (the fork must work standalone) (§2.3, §3.4).
4. **The `A2` hash row** — a `tests/**` row that hashes the vendored modules **against the manifest**
   (§2.4, §3.3, §4 `P-TP-1`).
5. **The scoped conformance leg** — the foundation's own node suites for the vendored modules, entering as an
   **ADDITIVE leg**, **restricted to the suites whose import closure is exactly the vendored set** (§3.5, §4).

**The four escalations this filing carries** (recorded here so the supervisor sees them without reading §9):

| # | Escalation | Why it is escalated, not decided |
| --- | --- | --- |
| **`O-1`** | **The md5 table is UNVERIFIED by this pass.** This session had **no shell tool** — `md5sum` could not be run — so the proposal's §2 table is **neither reproduced nor falsified** here (§1.3). | The instruction to *"recompute every md5 yourself and report any disagreement"* **cannot be discharged in this session**; the recomputation is a **named, mandatory pre-red obligation** (§3.3 item 1). |
| **`O-2`** | **The vendored suites' placement deviates from the letter of `A-8`** (`vendor/Provident-Electron/tests/` instead of `tests/`), for the pinned-config reason in §0A note 2. | The architect may prefer `tests/` with a config the pin does not forbid; **that would require amending `G-9`'s pin set or the frozen config**, which is the architect's ruling, not a spec's. |
| **`O-3`** | **The eleven candidate suites are NOT byte-portable as green legs.** Every one carries foundation-repo audit rows (§0A note 3); **their module-under-test imports are closed, but their assertions are not**. | Choosing between (a) filing every audit row **red and labelled**, (b) a row-level filter, or (c) filing only the four import-closed-and-otherwise-clean **sub-trees of the module rows** is a **contract decision about what the leg is FOR** — escalated per §0A note 3. |
| **`O-4`** | **`V-13` owed `A1`'s durable pin record a home.** §0A note 5 decides it is the manifest + the existing decision clause, and **writes no new decision row**. | If the architect wants a per-module figure in `docs/decisions.md` too, that **contradicts `A-8`** and is the architect's call. |

**What this unit is NOT.** It is **not** the harness fix for the red divergence leg (§9 item 1) · **not** the
`PD-UI-9` Phase-0 spike (`R-8`) · **not** any `PD-UI-*` renderer wave · **not** the `PD-UI-12` boundary ruling
(`Q-E`, taken at the HEAD of Phase 1) · **not** the `SCH` withdrawal work (`Q-F`, `R-6`) · **not** the engine
additive set (§4.3 of the proposal) · **not** the stale engine-persistence premise correction (`X-7`) · **not**
a fence edit, a live battery, or a tracker rewrite (the supervisor owns tracker rows). **It changes no renderer
behaviour, no host code, no IPC, no MCP tool, no store, no engine surface.**

### 1.2 What this unit changes in the tree, and NOTHING else

| Path | Change | Layer |
| --- | --- | --- |
| `src/shared/<x>.ts` ×15 | **NEW** (copied bytes) | source/`[T]` |
| `vendor/foundation.lock.json` | **NEW** (the manifest) | machine data |
| `vendor/Provident-Electron/tests/<x>.test.ts` ×N | **NEW** (byte copies of the included suites, `N` = §3.5 item 2) | `[T]`/`[H]` |
| `tests/foundation-vendor-manifest.test.ts` | **NEW** (the `A2` hash row) | `[T]` |
| `scripts/foundation-drift.mjs` | **NEW** (the `A3` monitor) | `[D]`-class local instrument |
| `vitest.conformance.config.ts` | **NEW** (the leg's own config) | harness |
| `package.json` | **ONE added script key** (`conformance`), **`test`/`test:watch`/`battery`/`divergence`/`typecheck`/`build` UNCHANGED** (`G-9`, `R-7`) | harness |
| **every other file** | **UNTOUCHED** — in particular `vitest.config.ts`, `src/shared/dom-shim.ts`, `src/shared/types.ts`, `src/shared/demo-envelope.ts`, `src/shared/path-fork-cycle.ts`, `src/main/markdown-import.ts`, `tests/unit-v5-migration-contract.test.ts`, `tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts`, `tests/fixtures/v5-bridge-capture-fixture.js`, every `docs/**` file | — |

### 1.3 THE HONESTY BLOCK — what this pass could NOT verify (each with what would settle it)

| # | Unverified item | What would settle it |
| --- | --- | --- |
| **`O-1`** | **The per-module md5 table.** This pass had **no shell**: `md5sum`, `md5`, `node -e "crypto…"`, `git cat-file` and `diff -q` were **all unavailable**. So the proposal §2 table is **NOT reproduced, NOT falsified, and NOT copied on trust into this spec's §2.2**. | `md5sum` (or any cryptographic digest tool) **run in the foundation tree at `main` = `8f193a8d1446ed1e64c4ab6c569941e988f82459`**, for the fifteen files, with the command recorded verbatim — §3.3 item 1 makes this a **pre-red obligation**, and the manifest may not be committed without it. |
| **`O-2`** | **The vendored-suite placement** (§0A note 2) and whether a `tests/**` placement is achievable under the frozen `vitest.config.ts`. | The architect's ruling, or a re-reading of `G-9`'s pin scope. |
| **`O-3`** | **Whether the conformance leg can be green at all** in this repo (§0A note 3) — and, if it cannot, whether the leg is (a) filed with audit rows red, (b) filtered by row title, or (c) reduced to the module rows. | A **run** of the leg after vendoring: `npx vitest run --config vitest.conformance.config.ts`, with the per-suite pass/fail tally recorded. **Nothing in this file predicts that tally.** |
| **`O-4`** | The durable-home question for `V-13`'s pin record (§0A note 5). | The architect's confirmation that the manifest is the home. |
| **`O-5`** | **Whether `import(/* @vite-ignore */ '../../src/shared/<x>.js')` resolves to `src/shared/<x>.ts` under this repo's Vite/vitest.** The foundation's guide states the **static** form is **`unverified`** (`../Provident-Electron/docs/guide/seams.md` *Code, runnable* + *Gotchas measured in this repo*), and the dynamic+`@vite-ignore` form is the one the fifteen suites actually use — but **this pass ran nothing**. | One run of a single vendored suite (or of one smoke row) under `npx vitest run` in this repo. |
| **`O-6`** | **`G-4`'s scope** — this filing carries the scoping ruling (R-9) but **cannot test it**; the corpus-write question belongs to `PD-UI-2`'s rows. | `PD-UI-2`'s own spec gate. |
| **`O-7`** | **The unexported return shapes** (§0A note 7): `GestureSession`, `RelocateResetResult`, `FocusResult`, `FocusRefusal`, `FocusTransitionArg`. | Nothing to settle — this is a **recorded consumer cost**; the fork re-declares. Recorded so no unit claims the shapes are importable. |
| **`O-8`** | **The suite-count disagreement** the gate carried unresolved (*"the `201`-vs-`221` suite-count disagreement"*, gate §5's residual ledger). **This pass did not recount the fork's collected suite**; it read the proposal's `201 .test.ts` figure and, separately, enumerated fork `tests/**` paths by glob (209 paths, of which the `.ts` files are within the `201`-class) — **two readings that do not reconcile into a single figure here**. | A `npx vitest list`/run reading at this branch head, **before** the vendored suites land, recorded as the baseline (§3.6 item 1). |

---

## 2. The surface (exact)

### 2.1 The vendored module set — THE SET, THE CENSUS, AND THE INFERENCE THIS FILING CORRECTS

**1. The set is FIFTEEN modules, and the manifest pins fifteen.** Their file names are the decision row's own
list (`census` · `container` · `focus-model` · `gesture-session` · `gutter` · `gutter-affordance` ·
`layout-projection` · `menu-template` · `mount-invariant-guard` · `overlay` · `owned-list-host` · `relocate` ·
`slot-host` · `theme` · `zones`), each as `src/shared/<name>.ts`. **All fifteen files exist in the foundation
tree at the pinned commit** (VERIFIED-BY-READ, this pass: `../Provident-Electron/src/shared/` holds **20** `.ts`
files — the fifteen plus `dom-shim.ts`, `types.ts`, `demo-envelope.ts`, `path-fork-cycle.ts` and **nothing
else**).

**2. NOT ONE MEMBER IS EXCLUDED, and the reason is the pin's own text.** Clause (2) of the decision row names
**exactly four** files as *"NOT replaced"*: `dom-shim.ts`, `types.ts`, `demo-envelope.ts`, `path-fork-cycle.ts`.
**None of the four is one of the fifteen**; all four are **outside** the set. So the fifteen stand entire, and
**not a single member is excluded for a row-level reason** — including the two names the change analysis
worried about.

**3. The inference this filing CORRECTS (stated explicitly, because the review asked for the set to be
determined from §4.1's corrected rows).** §4.1's table classifies **rows**, not modules: `PD-UI-11`
(`owned-list-host.ts`) is **`NOT-IN-SCOPE (KEEP)`** (`C-5`) and **`PD-UI-12`** (`slot-host.ts`) is
**deferred pending its own boundary spec** (`C-6`, `A-10`). **The tempting inference is therefore that
`slot-host.ts` and `owned-list-host.ts` must leave the vendored set. THAT INFERENCE IS WRONG, and it is wrong
three times over:**

- **The decision row mints the set by NAME** and the fifteen include both — **`slot-host` and
  `owned-list-host` are in the fifteen** (clause (1) of `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE`).
- **The architect's `A-8` names the SAME fifteen suites**, and **`A-8`'s `V-13`-adjacent duty is to vendor the
  modules for the whole set**; `A-8`'s exclusion is **suite-level and import-closure-based**, never module-level.
- **A `KEEP`/deferred row means "this fork artifact is not being deleted", i.e. the fork keeps its own code. It
  says nothing about whether the foundation module may sit vendored beside it.** Nothing in this repo imports
  a vendored module today (§2.1 item 6), so vendoring is inert until a wave re-points a consumer: **vendoring
  a module whose row is `KEEP` costs nothing and removes nothing** — whereas **excluding** it would falsify the
  pin's own name list and would leave `A-8`'s suite list (which names `slot-host.test.ts` and
  `owned-list-host.test.ts`) pointing at modules that are not there.

**4. THE TWO SENSES OF "OUT OF THE SET", stated so the exclusion is never over-read.**

| Sense | Members | Where it binds | Reason |
| --- | --- | --- | --- |
| **Out of the VENDORED MODULE set** | **NONE** — the set is fifteen, whole | §2.1, §3.1 | the pin's own name list; the four "NOT replaced" files are not members |
| **Out of the CONFORMANCE-LEDGER'S suite set** (the suites) | **`slot-host.test.ts`, `owned-list-host.test.ts`** (with `layout-projection.test.ts`, `mount-invariant-guard.test.ts`) | §3.5 item 3 | **static imports outside the vendored set** — both import `../src/shared/dom-shim.js` (`X-1`'s class); `layout-projection.test.ts` likewise, `mount-invariant-guard.test.ts` imports `dom-shim` **and** `runtime.js` **and** `demo-envelope.js` |
| **Out of the RELOCATED-UI DELETION set** (the §4.1 rows) | **`PD-UI-11` `KEEP`** (`owned-list-host.ts`), **`PD-UI-12` deferred** (`slot-host.ts`) | §4.1; **not this unit** | `C-5`; `C-6`/`A-10`. **A vendoring spec may not re-open a `KEEP` row and may not take `Q-E`** — it records the two rows' status and vendors the modules anyway (§2.1 item 3) |

**5. THE IMPORT CENSUS — MEASURED by this pass, with the command recorded (`X-3`'s labelling duty).**
**Read:** every `import`/`export … from '…'` statement in every file of `../Provident-Electron/src/shared/`
(the reader: this pass, pattern `^\s*(import|export)\s+.*from\s+['"]` over that directory). **Result: FIVE
files carry any import at all; the other FIFTEEN carry ZERO import statements.** The five:

| File | Its import statements (verbatim specifiers) | In the vendored set? |
| --- | --- | --- |
| `census.ts` | `from './zones.js'` (values `isEmpty`, `trackFor`) | **IN-SET** ✔ |
| `gutter-affordance.ts` | `from './gutter.js'` (values + a type); `from './gesture-session.js'` (the `POINTER_TYPES` value **and** the `GestureHandle` type) | **IN-SET** ✔ |
| `gutter.ts` | `from './gesture-session.js'` (**type-only**, `GestureHandle`) | **IN-SET** ✔ |
| `relocate.ts` | `from './gesture-session.js'` (**type-only**, `GestureHandle`) | **IN-SET** ✔ |
| **`path-fork-cycle.ts`** | `from 'provident-ssr'` (**type-only**) | **OUT-OF-SET — and NOT A MEMBER of the fifteen** ✔ |

**Therefore the closure claim is CONFIRMED and SHARPER than the proposal's wording:** the three edges the
proposal names (`census.ts`→`zones.js`; `gutter-affordance.ts`→`gutter.js`+`gesture-session.js`;
`gutter.ts`/`relocate.ts`→`gesture-session.js`) are **exactly** the set-internal edges, and **the only
out-of-set import in the whole directory belongs to a file the set does not contain**. **No vendored module
imports anything outside the set — and none imports `dom-shim.js`, `types.js`, `demo-envelope.js`,
`provident-ssr`, `node:*`, or `electron`.**

**6. NO VENDORED MODULE IS IMPORTED BY THIS REPO TODAY — MEASURED.** A read of `src/**` for
`from '…/<name>.js'` over the fifteen names returns **three matches, none of them a vendored member**:
`src/renderer/renderer.ts` imports `./pane-gutter.js` and `./theme.js`, and `src/renderer/sidebar-panes.ts`
imports `./pane-gutter.js`. **`src/renderer/theme.ts` is a FORK module that shares a FILE STEM with the
vendored `src/shared/theme.ts`** — a collision by stem, **not by specifier** (the specifiers differ:
`./theme.js` from `src/renderer/`, versus `src/shared/theme.ts`). The dossier's collision block carries it by
row (§3.2 there). **The vendoring is therefore inert: it adds fifteen modules that nothing imports.**

**7. The symbol census (for the record, so no later pass re-derives it).** Every exported name below is
VERIFIED-BY-READ this pass. **Two names the inventories report as exports are NOT exported**, and the
foundation's own guide already names four of them:

| Module | Exported values | Exported types | Notes |
| --- | --- | --- | --- |
| `theme.ts` | `resolveTheme`, `applyThemeDeclaration` | `ThemeResolution`, `ThemeAttributeWrite`, `ThemeEnv` | ✓ matches the adoption-surface ledger |
| `zones.ts` | `isEmpty`, `trackFor` | `TrackSpec` | ✓ **`2 + 1 = 3`**, matching its own unit's pin |
| `census.ts` | `computeTrackVars` | `ZoneId`, `TrackVars` | ✓ |
| `layout-projection.ts` | `project`, `projectVar`, `applyProjection`, **`applyVarsToRoot`** (a `const` alias of `applyProjection`) | `VarValues`, `VarSpec`, `ProjectionSkipReason`, `ProjectionSkip`, `Projection`, `VarWriteSink`, `ApplyResult` | ✓ **the alias is an export and the `U-PROJ` row's `removeProperty` question is `U-PROJ`'s, not this unit's** |
| `container.ts` | `tokensFor`, `orientationFor`, `containerDeclarationFor` | `ChromeTokenFn`, `AxisResolver`, `ContainerDeclaration` | ✓ exactly three values |
| `overlay.ts` | `overlayTransition`, `overlayInertDeclaration` | `OverlayState`, `OverlayTransition`, `OverlayInertWrite` | ✓ |
| `menu-template.ts` | `normalizeCatalog`, `buildMenuTemplate`, `selectCatalogItem` | `PickerFn`, `CatalogEntry`, `PlatformProjection`, `ProjectedItem`, `MenuTemplate`, `TemplateOptions` | ✓ |
| `gesture-session.ts` | `POINTER_TYPES`, `installGestureListeners`, `detachGestureListeners`, `createGestureSession` | `GestureElement`, `EventSource`, `GestureOptionsInput`, `GestureOptions`, `GestureHandle`, `SessionOptions`, `SessionStats`, `GestureStats` | ⚠ **`GestureSession` is declared WITHOUT `export`** though two functions return it — the fork re-declares it (§0A note 7) |
| `gutter.ts` | `clampToBounds`, `createResizeController` | `ClampBounds`, `AxisFor`, `BoundsFor`, `DefaultSizeFor`, `IsResizable`, `CommitSink`, `ResizeStats`, `ResizeControllerHandle`, `ResizeController`, `ResizeControllerOptions` | ✓ |
| `gutter-affordance.ts` | `cursorDeclarationFor`, `domEventSource`, `createGutterAffordance` | `PointerPosition`, `PointerResolver`, `SizeFromPointer`, `AxisOf`, `ApplyPreview`, `ApplyCursor`, `StartSizeOf`, `BoundsOf`, `ResizableOf`, `Commit`, `MoveTypeOf`, `CursorOf`, `EventSourceLike`, `PreviewState`, `GutterAffordanceOptions`, `GutterAffordance`, `GutterAffordanceStats` | ✓ (17 types) |
| `relocate.ts` | `withinProximity`, `createRelocateSession` | `CandidateFor`, `RelocateTargetFor`, `CommitSink`, `PreviewSink`, `RelocateHandle`, `RelocateOptions`, `RelocateSession`, `RelocateStats` | ⚠ **`RelocateResetResult` (the type of `reset`'s return) is declared WITHOUT `export`** — the fork re-declares it (§0A note 7) |
| `focus-model.ts` | `focusTransition`, `focusOrder`, `focusIndex`, `persist` | `FocusId`, `FocusEntry`, `FocusVerb`, `FocusRefusalCode`, `FocusState` | ⚠ **`FocusResult`, `FocusRefusal`, `FocusTransitionArg` are module-local** (§0A note 7) |
| `slot-host.ts` | `createSlotHost` | `SlotKey`, `SlotAttribute`, `SlotHostOptions`, `SlotHostRefusal`, `SlotHostResult`, `SlotHost` | ✓ |
| `owned-list-host.ts` | `createOwnedListHost` | `ListKey`, `ListEntry`, `ListHostRefusal`, `ListHostResult`, `OwnedListHost`, (`OwnedListHostOptions`) | ✓ |
| `mount-invariant-guard.ts` | `probeMountInvariant`, `assertMountInvariant` | `MountRootObservation`, `MountViolationCode`, `MountViolation`, `MountInvariantResult`, `MountExpectation` | ✓ — **and `reconcileMount` is NOT here**: it is a fix in the foundation's `src/renderer/runtime.ts` and is **not one of the fifteen** (proposal §4.1 `PD-UI-10`, `C-7`/`V-3`) |

### 2.2 `vendor/foundation.lock.json` — the manifest, key by key

**A machine-readable record, and the ONLY home of the per-module digest** (§0A note 5). **Normative shape**
(the implementer may add keys, never remove or rename these):

```jsonc
{
  "schema": "foundation-lock/1",
  "foundation": {
    "path": "../Provident-Electron",          // adjacent, NOT a dependency
    "remote": "https://github.com/LittleKingsguard/Provident-Electron",
    "ref": "main",
    "commit": "<40-hex>",                     // MUST equal the architect-measured 8f193a8d1446ed1e64c4ab6c569941e988f82459
    "measuredAt": "<ISO date of the md5 run>",
    "digestCommand": "md5sum …",              // the command, verbatim, as run (§3.3 item 1)
    "byteIdentity": "byte-identical to the pinned commit's blob at `commit`"
  },
  "modules": [                                 // EXACTLY fifteen entries; sorted by `name`
    {
      "name": "census",                        // no extension
      "source": "src/shared/census.ts",        // path IN THE FOUNDATION tree
      "vendored": "src/shared/census.ts",      // path IN THIS repo (MUST equal `source`)
      "md5": "<32-hex>",                       // the RECOMPUTED digest (§1.3 `O-1`)
      "lineCount": <integer>,
      "provenance": "proposal §2 table + the foundation-tree recomputation of <measuredAt>",
      "proposalTableAgreement": "REPRODUCED" | "DISAGREES" | "NOT-RECOMPUTED",
      "excludedFromVendorSet": false,           // always false — §2.1 item 2; present so a reader sees the question was asked
      "rowStatus": "<the §4.1 row id(s) that consume it, or `NONE (no wave owned yet)`>"
    }
    // … 14 more
  ],
  "moduleCount": 15,
  "baselineFilesNotReplaced": [                // clause (2) of R-3; a RECORD, never a vendoring target
    "src/shared/dom-shim.ts",
    "src/shared/types.ts",
    "src/shared/demo-envelope.ts",
    "src/shared/path-fork-cycle.ts"
  ],
  "importCensus": {                            // §2.1 item 5, as data
    "internalEdges": [
      { "from": "census",            "to": "zones" },
      { "from": "gutter-affordance", "to": "gutter" },
      { "from": "gutter-affordance", "to": "gesture-session" },
      { "from": "gutter",            "to": "gesture-session" },
      { "from": "relocate",          "to": "gesture-session" }
    ],
    "outOfSetImports": [],                     // MUST be empty; `path-fork-cycle`→`provident-ssr` is recorded under `nonMemberNotes`
    "nonMemberNotes": [ "path-fork-cycle (NOT a member) imports type-only from provident-ssr" ]
  },
  "conformance": {
    "leg": "<the script name added to package.json>",
    "config": "vitest.conformance.config.ts",
    "placement": "vendor/Provident-Electron/tests/",
    "included": [ /* §3.5 item 2, by file name */ ],
    "excluded": [
      { "suite": "layout-projection.test.ts",  "reason": "<§3.5 item 3 code>" }
      // … and the other three, each with its own reason
    ]
  },
  "baselines": {                               // §8 — RECORDED readings, each labelled with who measured it and at which layer
    "npmTest":     { "reading": "1 failed file / 200 passed (201 files); 1 failed / 4190 passed / 45 skipped / 4236", "layer": "harness/[T]", "measuredBy": "proposal §7/§5 `G-1` at `b6791e0`" },
    "typecheck":   { "reading": "exit 0", "layer": "harness", "measuredBy": "proposal §5 `G-1`" },
    "build":       { "reading": "exit 0", "layer": "harness", "measuredBy": "proposal §5 `G-1`" },
    "battery":     { "reading": "184 checks, 0 failures — GREEN", "layer": "harness/[H]", "measuredBy": "proposal §7.5" },
    "divergence":  { "reading": "1 checks, 2 failures — RED (ENVIRONMENTAL: /dev/shm denial → Electron SIGTRAP)", "layer": "harness/[D]", "measuredBy": "proposal §7.5" },
    "collectedSuiteCensus": { "reading": "UNVERIFIED by this pass (§1.3 `O-8`)", "layer": "harness", "measuredBy": "owed to the unit's own baseline reading" }
  }
}
```

**Manifest rules (each falsifiable, each carried by a register row).**

1. **`modules` carries EXACTLY fifteen entries, and every `name` is one of the pin's fifteen** (§4 `P-IM-1`).
2. **`vendored === source` for every entry** — the module is copied to the same relative path (§4.1).
3. **`md5` is 32 lowercase hex, unique per module, and every entry's `proposalTableAgreement` is `REPRODUCED`
   — or the disagreement is a recorded FINDING in `docs/defects.md`** (§3.3 item 3; §4 `P-IM-2`).
4. **`importCensus.outOfSetImports` is EMPTY** (§4 `P-IM-3`).
5. **`baselineFilesNotReplaced` names exactly the four files and NONE of the fifteen** (§4 `P-IM-5`).
6. **Every baseline reading carries its `layer` and its `measuredBy`** — a figure with no layer is a review
   finding (`RCA-12`).
7. **No prose md5 table is added to any `docs/**` file by this unit** (`R-2`; `V-13`'s duty is discharged by
   the manifest under §0A note 5).

### 2.3 `scripts/foundation-drift.mjs` — the `A3` cross-tree monitor (exact behaviour)

**The instrument's contract.** A node script (no Electron, no build, no network) that reads
`vendor/foundation.lock.json`, hashes each vendored module, and — **iff** `<foundation.path>/src/shared/`
is a readable directory — hashes the foundation's sibling file and compares.

| Situation | Required outcome | Exit code |
| --- | --- | --- |
| foundation tree absent (`src/shared/` not a directory) | **`SKIPPED`**, with the reason printed, **and NOT a failure** | `0` |
| foundation tree present; every module byte-equal | **`DRIFT RESULT: 15 checks, 0 differences — CLEAN`** | `0` |
| foundation tree present; one or more differ | each differing module named, with **both** digests; **also report whether the local copy still matches the MANIFEST** (the two failures are different faults: drift upstream vs a local edit) | non-zero |
| manifest missing / unparsable / `moduleCount ≠ 15` | a loud failure naming the manifest, **never a silent skip** | non-zero |
| a vendored module missing from `src/shared/` | a loud failure naming the missing path | non-zero |
| the foundation's file present but unreadable | a loud failure naming the path and the error | non-zero |

**Two rules that make the monitor honest.** (1) **The absent-tree case is a SKIP, never a pass and never a
failure** — the fork must work standalone (the architect's `A3` wording). (2) **The monitor reads FILES and
compares BYTES; it asserts nothing about behaviour, imports, types or the app.** Its layer is `[D]`-class
**local instrument**, and a `CLEAN` reading is **not** app evidence.

### 2.4 `tests/foundation-vendor-manifest.test.ts` — the `A2` hash row (placement, and why)

**It is a `tests/**` row (the architect's `A-8` wording) and it is therefore COLLECTED by `npm test`'s
`include` (`tests/**/*.test.ts`).** Consequences, stated because two of them are `G-9`-protected:

1. **It MUST NOT mock `'electron'`.** `tests/unit-v5-migration-contract.test.ts` derives the bridge-mock
   census by scanning `tests/**/*.test.ts` for a top-level `vi.mock('electron', …)` call and pins the **exact
   five-name set**. **A new file that mocks `'electron'` reds that protected row.** The hash row imports
   **`node:fs`, `node:crypto`, `node:path`/`node:url` and `vitest`** and **nothing else** ✔ (§4 `P-SM-1`).
2. **It must not read anything a `G-9` pin freezes** — in particular **not `vitest.config.ts`** (whose
   `testTimeout` is pinned exactly) · **not `src/main/markdown-import.ts`** · **not the two `DEEP_ROWS` files**
   · **not `tests/fixtures/v5-bridge-capture-fixture.js`** · **not `package.json`'s test scripts**.
3. **It hashes `src/shared/<x>.ts` — THE SHIPPED FILE — never the `vendor/`-tree copy** (§0A note 4).
4. **Its `describe`/`it` titles are census-stable:** one `it` per module (names derived from the manifest), so
   a module added to the manifest without a file is a loud failure, never a vacuous pass.

### 2.5 The `package.json` change — one added key, and the pinned keys untouched

| Key | Before | After | Pin status |
| --- | --- | --- | --- |
| `scripts.test` | `vitest run` | **UNCHANGED** | **`G-9`-pinned** (`R-7`) — an edit is a protected-pin violation |
| `scripts.test:watch` | `vitest` | **UNCHANGED** | `G-9`-pinned |
| `scripts.battery` | `npm run build && node tests/e2e-battery.test.mjs` | **UNCHANGED** | `A-7`/`G-5` own the `.mjs` runner question; **not this unit** |
| `scripts.divergence` | `npm run build && node scripts/electron-divergence.mjs` | **UNCHANGED** | `A-7` makes this leg mandatory pre-live; **the fix is another unit** |
| `scripts.conformance` *(new)* | — | **ADDED** — runs the leg (§3.5) | a **new key is not a `G-9` pin**; the pinned assertion is on the `test`/`test:watch` values |
| `scripts.drift` *(new, optional — one of the two is REQUIRED)* | — | **ADDED** — runs the `A3` monitor | as above |

**A `package.json` edit that changes ANY pinned value, or a `vitest.config.ts` edit of ANY kind, is a
protected-pin violation and a review finding** (`R-7`; `G-9` extended by `X-9`).

---

## 3. Mechanics (exact procedure, every fail-state)

### 3.1 Vendoring a module — the procedure, and its fail-states

**Procedure (per module, repeated fifteen times; order irrelevant since the set is import-closed).**

1. Read `<foundation.path>/src/shared/<name>.ts` at the pinned commit.
2. Write the **same bytes** to `src/shared/<name>.ts` in this repo.
3. **Verify the write**: the file's digest must equal the manifest's `md5` for that module **and** — when the
   foundation tree is present — equal the foundation file's digest.
4. Record nothing per-module in prose; the manifest is the record (§2.2).

**Fail-states (each loud).**

| # | Fail-state | The exact rule violated |
| --- | --- | --- |
| `V-1` | The copied file's bytes differ from the pinned blob **in any way** — one byte, a trailing newline, a BOM, CRLF, a reformat, a comment strip, a `prettier` pass, an import-extension "fix" | §4 `P-IM-1`. **A byte-identity check that normalizes whitespace is NOT the rule** — the rule is byte equality |
| `V-2` | A **sixteenth** file appears under the set (a fork helper, a re-export barrel, an `index.ts`) | §4 `P-IM-1` — the set is **exactly** the fifteen; a barrel would also create an **out-of-set import target**, so §4 `P-IM-3` reds |
| `V-3` | A **fourteenth** (a module silently dropped) | §4 `P-IM-1` |
| `V-4` | Any of the **four baseline files is written, replaced, or "harmonized"** while vendoring | §4 `P-IM-5`, clause (2) of `R-3`. **A vendoring pass that touches `src/shared/dom-shim.ts` is a REGRESSION, not a cleanup** |
| `V-5` | A vendored module is **edited to fit the fork** — an import rewritten to `./x.ts`, a symbol renamed to avoid the fork's stem collision, a `console.log` removed, a `TODO` added | §4 `P-IM-1`; §2.1 item 3's `KEEP` reasoning. **A consumer-side adapter is a WAVE's work, never a vendoring edit** |
| `V-6` | The copy is taken at the wrong revision (a working-tree read, a branch other than the pinned commit, a `node_modules` copy) | §4 `P-IM-2` — the `commit` key and every digest must agree with the pinned revision |
| `V-7` | The vendoring is committed **without** the manifest, or the manifest is committed **without** the recomputed digests | §2.2; §1.3 `O-1`; **the pre-red obligation in §3.3 item 1** |

### 3.2 The manifest — how the `A2` row reads it

1. The row **parses** `vendor/foundation.lock.json` (JSON, not JS; no `import` of a `.json` module — a
   `readFileSync` + `JSON.parse`, matching the fork's own config-reading idiom in
   `tests/unit-v5-migration-contract.test.ts`).
2. The row **hashes** each `src/shared/<name>.ts` with **`node:crypto`'s `createHash('md5')`** — the same
   algorithm the manifest records, and the algorithm the pin's table uses.
3. The row asserts, per module: **the file exists** · **its digest equals the manifest's `md5`** · **its
   `vendored` path equals its `source` path** · **its name is in the pin's fifteen**.
4. The row asserts, once: **`modules.length === 15`** · **the fifteen names are SET-EQUAL to the pin's list**
   (a count alone is not the assertion) · **`importCensus.outOfSetImports` is empty** ·
   **`baselineFilesNotReplaced` is the four files and excludes every set member**.
5. **Fail-state:** `vendor/foundation.lock.json` absent ⇒ **a loud failure naming the path**, never a skip. A
   manifest that exists but carries `proposalTableAgreement: "NOT-RECOMPUTED"` on any row ⇒ **a loud failure**
   (§3.3 item 1).

### 3.3 Computing and recording the digests — the `O-1` procedure

1. **The digest run is a PRE-RED OBLIGATION, and its command is recorded verbatim.** In the foundation tree at
   `main` = `8f193a8d1446ed1e64c4ab6c569941e988f82459`, run a digest over the fifteen files (e.g. `md5sum
   src/shared/{census,container,focus-model,gesture-session,gutter,gutter-affordance,layout-projection,menu-template,mount-invariant-guard,overlay,owned-list-host,relocate,slot-host,theme,zones}.ts`), capture the
   output, and paste the **command and its output** into the unit's DONE row and the manifest's
   `foundation.digestCommand`.
2. **Confirm the revision first.** `git -C <foundation> rev-parse HEAD` must print the pinned commit; the
   manifest's `foundation.commit` must equal it. **A digest run against a dirty or moved foundation tree is
   not the pin.**
3. **Reconcile against the proposal's §2 table, row by row, and RECORD THE RESULT — including disagreement.**
   For each module, set `proposalTableAgreement`:
   - `REPRODUCED` — the recomputed digest equals the proposal's cell;
   - `DISAGREES` — it does not; **then** the disagreement is a **finding in `docs/defects.md`** naming the
     module, both digests, and the revision read, **and the manifest is NOT committed until the finding row
     exists** (`AGENTS.md` item 6's tracker duty is the supervisor's write; the unit supplies the reading);
   - `NOT-RECOMPUTED` — **forbidden in a committed manifest** (§3.2 item 5).
4. **Line counts are recorded beside the digests, and this pass's reading of the *four baseline files* is
   stated with its convention** (§2.1 item 2's neighbourhood, because the proposal's ratios are load-bearing
   for `R-3`): read with the `read` tool's total-line figure, this pass measured
   **`dom-shim.ts` 508 vs 238** · **`types.ts` 874 vs 328** · **`demo-envelope.ts` 131 vs 434** ·
   **`path-fork-cycle.ts` 101 vs 101** (fork first, foundation second). **The proposal's table reads
   `508 / 237`, `874 / 328`, `131 / 433`, `101 / 101`** — **the three single-line differences are a
   NEWLINE-COUNTING convention difference (a trailing newline), not a content difference**, and the pass
   reports it here rather than in the manifest. **The three files DIFFER (`dom-shim`, `types`,
   `demo-envelope`) and `path-fork-cycle` does not — that conclusion is UNAFFECTED, and it is `R-3`'s
   operative reading** ✔.

### 3.4 The monitor — how it is wired and what it may not do

1. **It is invoked by a named script** (§2.5) so a DONE row cites a **RUN**, not an intention (`A-7`'s
   discipline applied to this leg).
2. **It never writes**: read-only, no tree mutation, no `git` mutation, no `npm install`, no network.
3. **It never blocks `npm test`**: a red monitor is **not** a red suite; the `A2` row is the in-repo
   instrument and `A3` is the cross-tree one (§2.3's table).
4. **It must not be added to any UI unit's trio as a green precondition** — a missing foundation tree is a
   `SKIP` (§2.3), so the leg's value is advisory by construction.

### 3.5 The conformance leg — the scoped suite list, with the reason per suite

**1. The candidate universe is the foundation's own suites for the fifteen modules** — the fifteen files
`A-8` names: `theme.test.ts` · `zones.test.ts` · `container.test.ts` · `overlay.test.ts` ·
`menu-template.test.ts` · `gutter.test.ts` · `relocate.test.ts` · `census.test.ts` · `focus-model.test.ts` ·
`gutter-ui.test.ts` · `gesture-session.test.ts` · `slot-host.test.ts` · `owned-list-host.test.ts` ·
`mount-invariant-guard.test.ts` · `layout-projection.test.ts`. **All fifteen exist in the foundation tree**
(VERIFIED-BY-READ, this pass).

**2. THE INCLUDED SET — the eleven suites whose MODULE-UNDER-TEST imports are exactly the vendored set.**

| # | Suite | Its module-under-test imports (VERIFIED-BY-READ) | In-set? |
| --- | --- | --- | --- |
| 1 | `theme.test.ts` | `../src/shared/theme.js` (type-only) | ✔ all in-set |
| 2 | `zones.test.ts` | `../src/shared/zones.js` (type-only) | ✔ |
| 3 | `container.test.ts` | `../src/shared/container.js` (type-only ×3) | ✔ |
| 4 | `overlay.test.ts` | `../src/shared/overlay.js` (type-only) | ✔ |
| 5 | `menu-template.test.ts` | `../src/shared/menu-template.js` (type-only ×6) | ✔ |
| 6 | `gutter.test.ts` | `../src/shared/gutter.js` (type-only ×10) + `../src/shared/gesture-session.js` (a **type** reference) | ✔ both in-set |
| 7 | `relocate.test.ts` | `../src/shared/relocate.js` (type-only ×8) | ✔ |
| 8 | `census.test.ts` | `../src/shared/census.js` (type-only ×2) + `../src/shared/zones.js` (**type-only ×1 AND a value namespace `import * as delegate`**) | ✔ both in-set (this is the delegate edge `census.md` pins) |
| 9 | `focus-model.test.ts` | `../src/shared/focus-model.js` (dynamic `@vite-ignore`) | ✔ |
| 10 | `gutter-ui.test.ts` | `../src/shared/gutter-affordance.js` (type-only ×many) + `../src/shared/gesture-session.js` (the `POINTER_TYPES` **value** and `createGestureSession` **value**, type `GestureHandle`) + `../src/shared/gutter.js` (dynamic `@vite-ignore`) | ✔ all three in-set |
| 11 | `gesture-session.test.ts` | `../src/shared/gesture-session.js` (type-only ×8) | ✔ |

**3. THE EXCLUDED SET — four suites, each with its OWN reason (the architect's `X-1` class plus one).**

| Suite | Import that is outside the vendored set (`X-1`'s class) | The divergence it would resolve to | Reason recorded |
| --- | --- | --- | --- |
| **`layout-projection.test.ts`** | **`installShim`, `mountEl`** and a `ShimElement` **type** from `../src/shared/dom-shim.js` | this repo's `src/shared/dom-shim.ts` **508** lines vs the foundation's **238** (`read`-measured; proposal reads 508 vs 237) | **`X-1` EXCLUSION — `dom-shim.js` resolves to this repo's DIVERGENT copy.** The suite would test the **fork's** shim, not the pinned one. It also reads `../src/shared/dom-shim.ts` **by path** and `../package.json`, and drives `git status --porcelain` against the repo |
| **`owned-list-host.test.ts`** | **`installShim`, `mountEl`, `ShimElement`** from `../src/shared/dom-shim.js` | as above | **`X-1` EXCLUSION — `dom-shim.js`** (the `U-LISTHOST` module itself **stays vendored**, §2.1 item 4) |
| **`slot-host.test.ts`** | **`installShim`, `mountEl`, `ShimElement`** from `../src/shared/dom-shim.js`; **and** `../src/main/security.js` + `../src/main/mcp-server.js` **by dynamic import** | as above; the two `src/main/**` modules are **the foundation's** and have no fork counterpart by that name | **`X-1` EXCLUSION — `dom-shim.js`, PLUS a second out-of-set import** (security/mcp-server). The `U-SLOTHOST` module itself **stays vendored** |
| **`mount-invariant-guard.test.ts`** | **`installShim`/`mountEl`** from `../src/shared/dom-shim.js`; **`Runtime`** from `../src/renderer/runtime.js`; **`demoEnvelope`** from `../src/shared/demo-envelope.js` | `dom-shim` as above; **`src/renderer/runtime.ts` has no foundation-sibling semantics here** (the fork's runtime is its MCP-facing producing process, ~2 000+ lines per the local inventory); **`demo-envelope.ts` `131` vs `434`** | **`X-1` EXCLUSION — THREE out-of-set imports.** The `U-MOUNTGUARD` module itself **stays vendored**; **its `reconcileMount` fix is not in the vendored set at all** (`PD-UI-10`, `C-7`/`V-3`) |

**4. THE LEG'S PASS CONDITION (scoped by this file; §0A note 3).** The leg runs the **included** suites from
`vendor/Provident-Electron/tests/` under its own config, **outside `npm test`**. **The leg's report is a
PER-SUITE, PER-ROW tally, not a green/red word.** Its contract:

- **The module-under-test rows are the leg's evidence.** A failure in a row that drives the vendored module
  is **copy-fidelity evidence against the copy** and **stops the unit's green**.
- **The audit rows are EXPECTED RED and are labelled.** A row that asserts the **foundation repo's** own state
  — a diff-scope/allow-list audit over a unit's commit range (`git status --porcelain`), a read of
  `../Provident-Electron/docs/specs/<unit>.md` / `<unit>-review.md` / `<unit>-greens.md`, an
  `existsSync('docs/skills/designing-pages.md')` **absence** probe, a read of `src/shared/dom-shim.ts` as the
  **foundation's frozen** file, or a `../package.json` script census — **cannot pass in this repo**, and its
  red is **not** copy-fidelity evidence. **The DONE row must report the tally with those rows NAMED.**
- **A suite that is ALL audit rows and NO module rows is not filed** (it would add a permanently-red file
  with no evidence). **Verified present:** all eleven included suites drive their module (each has a
  `MODULE_SPECIFIER`/`MODULE_SRC` resolution pair and a dynamic `@vite-ignore` import of it).
- **`npm test`'s collected census is UNCHANGED by the leg** (§4 `P-TP-1`).

**5. THE ABSOLUTE PROHIBITION ON THE LEG.** **No suite filed under the leg may contain `vi.mock('electron', …)`**
(`R-4`; the protected census pins five names). **MEASURED: none of the fifteen candidates contains an
`electron` mock** (a read of `vi.mock('electron'` over the foundation's `tests/**` returns **no match**) ✔ —
so the rule holds **provided** the implementer does not add one.

**6. The leg's runner, config and isolation.**

```
# vitest.conformance.config.ts  (NEW; vitest.config.ts is UNTOUCHED)
test: { include: ['vendor/Provident-Electron/tests/*.test.ts'], environment: 'node' }
```
- **`npm test` (`vitest run` with `vitest.config.ts`) still collects `tests/**/*.test.ts` ONLY** — the leg is
  invisible to it, and **the branch's one carried red (`G-1`) is not disturbed by the leg.**
- **The leg is NOT part of any unit's red set** (`R-4`; `REBUILD-ARCHIVE-POLICY` clause (2)).
- **The leg runs with `npm run build` NOT required** — it is a node leg; it needs no Electron and no bundle.
- **`O-5`'s resolution risk applies here**: whether the vendored suites' dynamic `@vite-ignore` imports resolve
  under this repo's vite/vitest is **UNVERIFIED** (§1.3); the first run settles it.

### 3.6 The protected pins this unit brushes — and how each is re-derived **in the same commit**

| Pin (all in `tests/unit-v5-migration-contract.test.ts` unless stated) | What it pins | What this unit does to it | How it is re-derived in the same commit |
| --- | --- | --- | --- |
| **The bridge-mock census** | the **exact five-name set** of `tests/**` files that call `vi.mock('electron')`, **derived** by scanning `tests/**/*.test.ts` | **adds ONE file to `tests/**`** (the `A2` row) — which **does not mock electron**, so the derived set is **unchanged** | **re-run the pin**; the assertion's own five names are **untouched** (no edit to the pinned list, ever) |
| **`vitest.config.ts` `testTimeout`** | **exactly `15_000`** — floor **and** ceiling, both asserted | **no edit to `vitest.config.ts` at all** | nothing to re-derive; the row is green **because the file is byte-unchanged** |
| **`package.json` test scripts** | `scripts.test` / `scripts.test:watch` carry no `--testTimeout` | **one ADDED key** (`conformance`); the two pinned values are **unedited** | the row reads `package.json` and asserts **the pinned values**, which still hold; the **new key is named in the DONE row** so a reader sees the add |
| **`DEEP_ROWS` (two files + their `repeat(10000)` literals)** | `tests/unit-u2-rich-decompose.test.ts` (`ADR-4`) · `tests/unit-s-paste-sanitization.test.ts` (`Tokenizer F1`) | **untouched** | nothing to re-derive |
| **`src/main/markdown-import.ts`** | ONE `applyBatch`, no per-op persist | **untouched** | nothing to re-derive |
| **`tests/fixtures/v5-bridge-capture-fixture.js`** | pinned by path | **untouched** | nothing to re-derive |
| **THE COLLECTED-FILE CENSUS** | **`npm test`'s file/test/skip counts** — the branch baseline reads *"1 failed file / 200 passed (201 files); 1 failed / 4190 passed / 45 skipped / 4236"* (RECORDED at `b6791e0`, proposal §5) | **the `A2` row is a NEW collected file (+1 file, +N tests)**; **the leg adds ZERO collected files** (§3.5 item 6) | **the DONE row prints the BEFORE → AFTER reading**, taken from `npm test` **in the same commit**, with **both** figures and the **delta** — and the `A2` row's own test count as the named term. **A DONE row that reports a count without its before-reading is a review finding** (`REBUILD-ARCHIVE-POLICY` clause (3)) |

**And the pins this unit does NOT touch, named so the DONE row can assert their absence:** the `PROTECTED`
nine-file set (including `tests/unit-live11-bridge-seams.test.ts`, which pins `defaultLayout`/`coerceLayout`)
· the **two fence files** (`tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts`) — **no
fence edit, no re-plan** · the O-0 hook-contract wrapper pins (`tests/unit-o-0-hook-contract.test.ts`) and the
`G-9` source-text pin sets · `tests/unit-u-shell-9a-main-focus-tabs.test.ts` · every `src/renderer/**` and
`src/main/**` file · `docs/specs/mcp-endpoint.md`'s tool rows.

---

## 4. The typed Property register (the house `§5.x` register — carried here as `§4`; **CODE-BEARING UNIT, register REQUIRED**)

**Section-number note (so a citation resolves):** the house convention calls this block a **`§5.x` Property
register** (`docs/specs/unit-u-edit-1-whole-page-editing.md` §7; `docs/specs/unit-stage-active-tab-display.md`;
`../Provident-Electron/docs/specs/theme.md` §5.5/§5.5.1), and the register's **row ids** below therefore use
the house prefixes — **`P-IM-` / `P-SM-` / `P-TP-` only** (never an `F-` row, never a `§6`/`FS-n` citation).
**In THIS file the register is `§4`**, because this unit's `§3` is its mechanics block; **internal
citations below say `§4`, never `§5`.**

**Why a register and not the zero-row exemption.** This unit **adds code** (the hash row's checker, the
monitor's comparator, the manifest reader) and its central claims are **quantifications over a finite
pinned set** — the fifteen modules, the manifest's keys, the leg's suite list. `AGENTS.md` item 11 /
`PBT-REGISTER-REQUIRED-FOR-CODE-UNITS` **forbids the zero-row exemption for a code-bearing unit**, and **no
superseded `§5.5.0` exemption exists in this repo** — so the register is authored, not exempted.

**Shared machinery (pinned once, binding on every row).**

- **Seed:** **`0x20260927`**, a fixed literal in the test file; **never** `Date.now()`, never `Math.random()`,
  never an environment read. Where a row uses a generator it is a **hand-rolled 32-bit LCG** with one step per
  draw (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`), the draw selecting a pool member by
  `index = stateₙ₊₁ mod pool.length` — the `../Provident-Electron/docs/specs/theme.md` §5.5.1 form.
- **Caps:** **≤100 attempts per row, ≤120 in total**; rows run **sequentially in register order**;
  **STOP AFTER 5 CONSECUTIVE FAILURES** (the running row's remaining attempts are abandoned, no further row
  starts). **No new dependency, no PBT library, no sixth leg** — plain deterministic vitest tables.
- **Terms (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`):** the total is printed **with its per-row terms**,
  and a term that counts *distinct inputs* rather than *drives* says so.
- **Control-draw reporting (required):** every row carries a **control whose expected outcome is the opposite
  of the row's verdict**, and the row is `held` **only if the control discriminates**.
- **Class meaning here:** **`P-IM` = an invariant of the vendored set / the manifest's data model** ·
  **`P-SM` = a safety property over the repo state this unit may not disturb** · **`P-TP` = a totality /
  discrimination property over the unit's own instruments.**
- **`(bounded)`** is marked where the row's property text quantifies more broadly than the finite domain it
  drives — a bounded row is **execution design, not a proof of the universal it states**.
- **Layer:** every row is **`[T]` (node/pure) or `[H]` (harness)**. **No row is app-green**, and no row may be
  reported as app evidence (`G-6`, `RCA-12`).

| # | Row id | Property (falsifiable) | Domain / strategy | Attempts | `(bounded)`? |
| --- | --- | --- | --- | --- | --- |
| 1 | **`P-IM-1`** | **THE SET IS EXACTLY THE FIFTEEN, AND EVERY MEMBER IS BYTE-IDENTICAL TO THE PIN.** For every module in the pin's fifteen-name list: `src/shared/<name>.ts` exists; its `md5` equals the manifest's `md5` for that name; the manifest's `vendored` path equals its `source` path; and the set of names in `src/shared/` that the manifest claims is **set-equal** to the pin's list — **no sixteenth, no fourteenth**. **Control (discriminating):** a synthetic manifest that **adds** a name, **drops** a name, or **perturbs one character** of a digest **MUST fail** the same oracle. | **strategy `strat:vendor-set-identity`** — enumerate the fifteen (the pin's list is the pool; `15` declared observations) **plus four synthetic controls** (one added name, one dropped name, one perturbed digest, one renamed file) | **19** = `15` modules + `4` controls | **NO** — the domain **is** the fifteen, matched exactly |
| 2 | **`P-IM-2`** | **THE PIN REPRODUCES.** For every manifest entry, `proposalTableAgreement ∈ {REPRODUCED, DISAGREES}` — **never `NOT-RECOMPUTED`** — and **every `DISAGREES` entry has a finding row** in `docs/defects.md` naming the module and both digests; the manifest's `foundation.commit` equals the pinned revision, and `digestCommand` is a non-empty command string. **Control:** a manifest entry with `NOT-RECOMPUTED` **MUST fail**, and a manifest with `DISAGREES` and **no** finding row **MUST fail**. | **strategy `strat:pin-reproduction`** — the fifteen entries + the two synthetic controls | **17** = `15` + `2` controls | **NO** — a closed enumeration over the manifest's own keys |
| 3 | **`P-IM-3`** | **IMPORT CLOSURE HOLDS.** For every manifest entry, the resolved import graph of the vendored file contains **only** set-internal specifiers; `importCensus.outOfSetImports` is **empty**; and the five recorded internal edges are **exactly** the set-internal edges the files carry (a **missing** edge and an **extra** edge both fail). **Control:** a synthetic edge `theme → dom-shim` **MUST fail**; a synthetic edge list with a *dropped* in-set edge **MUST fail**. | **strategy `strat:import-closure`** — the fifteen files' statements + the recorded edge list + 2 synthetic edge sets | **17** = `15` + `2` controls | **NO** for this set; **`(bounded)` ON THE CLOSURE READING** — see the bounded note below |
| 4 | **`P-SM-1`** | **NOTHING `G-9` PINS IS DISTURBED.** (a) The bridge-mock census derived by scanning `tests/**/*.test.ts` for a top-level `vi.mock('electron', …)` call is **exactly the five pinned names**, and **the `A2` row is not among them**; (b) `vitest.config.ts`'s `testTimeout` is **exactly `15_000`** and the file's text carries **no** forbidden override (`clearMocks`/`restoreMocks`/`mockReset`/`isolate`/`pool`/`poolOptions`); (c) `package.json`'s `scripts.test` and `scripts.test:watch` are the pinned values, each carrying **no `--testTimeout`**; (d) the four baseline files are **byte-unchanged against their pre-vendoring bytes**. **Control:** a synthetic `tests/**` file containing a `vi.mock('electron', …)` call **MUST** join the census (proving the census is derived, not hard-coded), and a synthetic config carrying `clearMocks: false` **MUST fail** the text oracle. | **strategy `strat:protected-pin-safety`** — enumerate the pins (`4` pin classes) × the derived readings, plus `1` synthetic mock file and `1` synthetic config | **12** = `4` pin classes × `2` + `4` controls | **NO** — the pin classes are enumerated exactly |
| 5 | **`P-SM-2`** | **THE FOUR BASELINE FILES ARE NOT REPLACED, AND NO VENDORED MODULE IS A BASELINE FILE.** For each of `dom-shim.ts`/`types.ts`/`demo-envelope.ts`/`path-fork-cycle.ts`: the file's digest equals its **pre-vendoring** digest (a recorded reading, taken at the unit's first red run), and its name is **absent** from the manifest's `modules`; and **conversely** no set member's name appears in `baselineFilesNotReplaced`. **Control:** a manifest that lists `dom-shim` as a module **MUST fail**. | **strategy `strat:baseline-non-replacement`** — the four files × two facts + the converse over the fifteen | **10** = `4` + `1` control + `5` converse spot-checks | **NO** — a closed enumeration |
| 6 | **`P-TP-1`** | **THE `A2` ROW DISCRIMINATES THE SHIPPED FILE FROM THE COPY.** An oracle reading the **`vendor/`-tree copy** or a **hard-coded digest constant** **MUST** be distinguishable from the required one: **given a synthetic perturbation of ONE byte in `src/shared/<x>.ts`, the required oracle fails** while a mutation of the `vendor/`-tree copy **does not** change its verdict. (This is the row that makes §0A note 4 falsifiable.) | **strategy `strat:hash-target-discrimination`** — one real module drawn by the pinned LCG over the fifteen, plus a synthetic perturbation pair (shipped-file mutation / copy mutation) | **8** = `1` drawn module × `2` perturbation targets × `2` readings × `2` runs | **NO** — the discrimination is one paired comparison, repeated across two draws |
| 7 | **`P-TP-2`** | **THE MONITOR IS TOTAL OVER ITS FIVE DECLARED SITUATIONS.** For each of: *(1)* foundation tree present and identical ⇒ `CLEAN`, exit `0`; *(2)* present and differing ⇒ named differences, non-zero exit; *(3)* **absent ⇒ `SKIPPED`, exit `0`, NOT a failure**; *(4)* manifest missing/unparsable/`moduleCount ≠ 15` ⇒ loud failure, non-zero exit; *(5)* a vendored module missing ⇒ loud failure naming the path — **nothing throws an unhandled exception in any of the five, and no situation is silently a pass**. **Control:** a synthetic absent-tree case **MUST** print `SKIPPED` and exit `0`, and a synthetic `moduleCount: 14` **MUST** exit non-zero. | **strategy `strat:monitor-situations`** — the five declared situations (`5` declared) × `2` drives each, plus `10` injection shapes (each situation driven from a real temp tree **and** from an injected answer) | **20** = `5` × `2` + `10` | **NO** — the five situations are the module's whole declared surface |

**Class tally:** `P-IM` ×3 (`P-IM-1`..3) · `P-SM` ×2 (`P-SM-1`, `P-SM-2`) · `P-TP` ×2 (`P-TP-1`, `P-TP-2`)
= **7 rows ≤ 8** ✔. **Attempt tally, printed with its terms:**
**`19` (`P-IM-1`) + `17` (`P-IM-2`) + `17` (`P-IM-3`) + `12` (`P-SM-1`) + `10` (`P-SM-2`) + `8` (`P-TP-1`) +
`20` (`P-TP-2`) = `103` attempts**, every row **≤ 100** ✔, **stop-after-5** ✔.

**THE `(bounded)` DECLARATIONS, and what they do NOT prove.** **`7` of the `7` rows are `NO`** — each drives
a **closed, pinned enumeration** that matches its property text exactly, **with one recorded carve-out**:
**`P-IM-3` carries `(bounded) ON THE CLOSURE READING`**, because the row's closure claim is asserted from
**this pass's read of the fifteen files' import statements** (MEASURED, §2.1 item 5) — a read is not a
runtime import-graph walk, and **a transitive edge introduced by a future edit would be caught only by
re-running the row, not by the row's existence**. **The `P-IM-3` bound is therefore stated, not hidden.**

**Rows considered and REJECTED (recorded so a later pass does not re-add them):**

- *"the vendored copy behaves identically to the foundation's"* — **rejected as a register row**: behaviour
  equivalence is what **the conformance leg** is for, and it is an `[T]`/`[H]` reading of the foundation's own
  suites, not a generated property (§3.5).
- *"no consumer in this repo is broken by the vendoring"* — **rejected**: this unit **adds no consumer**
  (§2.1 item 6), so the row would be vacuously true; it belongs to the first wave that re-points an importer.
- *"the app still renders"* — **rejected** as structurally unassertable in node (`RCA-12`; the dom-shim is
  layout-less/CSS-less). **This unit claims no app row and runs no live leg** (§8).
- *"`npm run typecheck` stays at exit 0"* — **rejected as a register row** (it is a **leg**, not a property);
  it is carried by §3.6's obligations and §8's verification set.
- *"`npm run divergence` becomes green"* — **rejected**: it is RED for an **environmental** reason and the
  fix is **another unit** (§9 item 1). **A row asserting it would be a false obligation.**
- *"the manifest schema is valid JSON-Schema"* — **rejected**: no schema-validation dependency exists and
  adding one is forbidden (§4's machinery: no new dependency). The **key-level** rules are `P-IM-2`/`P-SM-2`.

## 5. What this unit does NOT claim (the layer ledger)

1. **No app-green, no envelope-green-as-app, no live green.** No claim in this file is evidence that the
   Electron app boots, renders, or behaves (`RCA-12`; `G-6`).
2. **No `divergence` green, and no live-battery green.** The `divergence` leg is RED at the branch head for an
   **environmental** reason and is **mandatory pre-live** (`A-7`) — a precondition this unit **records and
   passes through**, never satisfies (§9 item 1).
3. **No `battery` claim beyond the recorded reading** (`184 checks, 0 failures`, `[H]`, proposal §7.5) — this
   unit **does not re-run it**; §8 marks it as the unit's own obligation.
4. **No engine claim.** The engine half of the program is `BLOCKED-ON-ENGINE` and is not in this gate
   (proposal §4.3; `G-3`).
5. **No consumer-correctness claim.** The vendored modules are imported by **nothing** in this repo at the
   end of this unit (§2.1 item 6); whether the fork USES them correctly is each wave's own evidence.
6. **No claim that the conformance leg is green** (§1.3 `O-3`, §3.5 item 4). The DONE row reports the tally.

---

## 6. The red-set plan (RCA-1: red FIRST, RUN, and REPORTED)

**This file authorizes no implementation.** The delegation gate (`AGENTS.md` item 9) is satisfied by **this
spec plus a TestWriter red set that has been RUN and REPORTED**.

**6.1 The red set, in authoring order.**

1. `tests/foundation-vendor-manifest.test.ts` — **the `A2` row and the register's rows** (they share the file
   and the harness; the register's rows ride the same file, **no new file, no new dependency**).
2. `scripts/foundation-drift.mjs`'s rows — `P-TP-2`'s five situations are driven by **injecting the file
   system answers** into the monitor's own comparison function (the monitor must expose a **pure comparator**
   taking `{ manifest, vendoredBytes, foundationBytes | null }` so the situations are drivable without
   touching a real tree). **If the monitor is written as an un-splittable script, `P-TP-2` cannot be driven —
   that is the red's own finding, reported, not worked around.**
3. The manifest and the vendored bytes themselves — **`git`-visible new files**, whose red is the **absence**
   of every path the rows read. **The red run's expected shape: every row fails by naming a missing path or a
   missing manifest, never by a collection error.**

**6.2 What the red is NOT.** Not a `src/**` behaviour change (the vendoring adds files nothing imports) · not
a consumer re-point (that is the first wave) · not a suite retirement (§6.3) · not a `docs/**` rewrite (the
supervisor owns tracker rows) · not a live leg.

**6.3 The archive question, answered explicitly.** **This unit retires NO test and archives NO file.** The
vendored suites are **ADDITIONS**; the `ARCHIVE-READY` class is **EMPTY (0 of 224)** and
`DECIDED: REBUILD-ARCHIVE-POLICY` clause (1) governs a **superseded** test's subject, which no vendoring here
supersedes. **A DONE row that claims an archive under this unit is a review finding.** (The gate's `X-8`
correction is carried: clause (1) is the spec-supersession ground; the *"ARCHIVE-READY IS EMPTY (0 of 224)"*
line traces to the **SUPERSEDED** `PRUNING-FOLLOWS-THE-IMPLEMENTING-UNIT` and is quoted as a **historical
reading**, not re-derived here.)

**6.4 The pre-red obligations (all must be discharged BEFORE the red is authored).** ① the **digest run** and
its recorded command (§3.3) · ② the **revision confirmation** (§3.3 item 2) · ③ the
**proposal-table reconciliation, with any disagreement filed** (§3.3 item 3) · ④ the **`O-2` placement
ruling** or the architect's alternative (§1.1) · ⑤ the **`O-3` pass-condition ruling** (§1.1) · ⑥ the
**baseline collected-suite reading** (§1.3 `O-8`). **A red set authored before ①–③ is a review finding.**

---

## 7. Decisions and defaults (recorded, so no later pass re-derives them)

| # | Decision | Default taken |
| --- | --- | --- |
| **`D-1`** | Where the per-module digest lives | **`vendor/foundation.lock.json` only**; **no prose md5 table in `docs/**`** (`A-8`; §0A note 5) |
| **`D-2`** | The vendored-suite placement | **`vendor/Provident-Electron/tests/`** (§0A note 2) — escalated as `O-2` |
| **`D-3`** | How the leg is kept out of `npm test` | **its own config + its own script**; `vitest.config.ts` **unedited** (`G-9`) |
| **`D-4`** | How the leg is reported | **a per-suite, per-row tally with the audit rows named** — never a single green word (§3.5 item 4) |
| **`D-5`** | `G-4`'s scope while its premise is stale | **carried as scoped** (R-9): a local write path for **engine-owned data** may not be removed; the `PD-UI-2` CSS-write replacement is **not** forbidden — **whose evidence is `PD-UI-2`'s** |
| **`D-6`** | The `SCH` withdrawal wave (`Q-F`, `R-6`) | **already ruled by the architect**; **this unit references it and does not re-open it** — a vendoring spec may not sequence another unit's tracker work |
| **`D-7`** | The `PD-UI-11`/`PD-UI-12` rows | **their status is RECORDED, not re-decided** (§2.1 items 3–4). **No vendoring pass may re-open a `KEEP` row, and `Q-E` stays the architect's** |
| **`D-8`** | Whether the vendoring unit's spec carries a register | **YES — 7 typed rows** (§4); the zero-row exemption is **not available** to a code-bearing unit |
| **`D-9`** | Whether this unit edits `docs/skills/designing-pages.md` | **NO — it does not exist in this repo** (§0A note 10). No coverage-matrix row, no demo-page entry; the honest form is an **absence row** (§9 item 5) |
| **`D-10`** | Whether this unit writes a new `docs/decisions.md` row | **NO.** The pin's record is the manifest (§0A note 5); the row that governs the model **already exists** (`R-1`'s citation) |

---

## 8. Verification (which leg covers which layer — and the unit's own obligations)

| Leg | What it covers | Layer | This unit's obligation |
| --- | --- | --- | --- |
| **`npm test`** (`vitest run`) | the `A2` row, the register's rows, and the **unchanged** existing suite | harness/`[T]` | the DONE row prints the **BEFORE → AFTER** file/test/skip counts **in the same commit** (§3.6) |
| **`npm run typecheck`** | `tsc --noEmit -p tsconfig.json` — **`src/**` only**; `tests/` is `exclude`d | harness | **exit 0**, and the vendored `src/shared/**` modules must typecheck **unmodified** (their zero/external imports are what makes this possible) |
| **`npm run build`** | the five bundles (`package.json`'s `build`) | harness | **exit 0**. **The vendored modules are in NO bundle** unless a bundle's entry imports them (the foundation's own reading: *"in no shipped bundle"*, `../Provident-Electron/docs/guide/seams.md` *Gotchas*) |
| **`npm run conformance`** *(new)* | the eleven included suites | `[T]`/`[H]` | **a per-suite tally with the audit rows named** (§3.5 item 4) — **no green word** |
| **`node scripts/foundation-drift.mjs`** *(new)* | the `A3` monitor | `[D]`-class local instrument | a **`CLEAN` or `SKIPPED`** reading with the tree state named |
| **`npm run battery`** | 184 checks | harness/`[H]` | **run it** (the branch baseline reading is `GREEN`, proposal §7.5) — and **state that a battery green is harness-green**, not app-green |
| **`npm run divergence`** | the real-Electron divergence leg | harness/`[D]` | **run it and report the reading.** At this branch head it is **RED for an ENVIRONMENTAL reason** (`/dev/shm` denial → `SIGTRAP`; proposal §7.5) and `A-7` makes it **mandatory pre-live**. **This unit does NOT fix it, does NOT claim it green, and does NOT claim an app boot** |
| **any live / app leg** | — | assembled/`[U]` | **NOT CLAIMED, NOT RUN, NOT OWED BY THIS UNIT** (it changes no renderer behaviour; `RCA-11`'s live mandate binds UI-overhaul units, and this unit renders nothing) |

**`G-1`, EXTENDED (per `X-6`), as this unit must state it.** The branch baseline is: **`npm test` 1 carried
red** (`P-SM-1`/`strat:stage-seam-schedule-single-active`, the APP-layer residual `PANE-TOGGLE-STAGE-COLLAPSE`)
· **`typecheck` 0** · **`build` 0** · **`battery` 184/0 GREEN** · **`divergence` RED on the Electron leg**
(ENVIRONMENTAL). **Every figure above is a RECORDED reading taken by the proposal's pass; this unit re-runs
each leg and reports its own delta** — never a prediction, and never a copy.

**Honest statements, recorded so no later pass over-reads this unit.**

1. **This spec ran nothing.** Every "VERIFIED-BY-READ" claim is a **read of the named tree**, not an execution.
2. **No md5 in this file is verified** (§1.3 `O-1`); §2.2 deliberately carries **no digest values**, because a
   copied table would be the second hand-maintained truth `A-8` forbids.
3. **Byte-identity is a claim about FILES.** It is satisfied by a digest, not by behaviour.
4. **The conformance leg's colour is unknown at filing time** (§1.3 `O-3`).
5. **The `V-13` pin record's durable home is a decision this filing took** (§0A note 5) — escalated as `O-4`.

---

## 9. Owed items and escalations (recorded, never hidden)

1. **THE DIVERGENCE HARNESS FIX IS OWED BY ANOTHER UNIT** — a harness unit touching `scripts/**` (the
   foundation's own harness landed `--disable-dev-shm-usage` + a fresh scratch `--user-data-dir` for exactly
   this class). **It has no spec and no red set**; the proposal §7.5 item 3 records it as owed. **This unit
   passes the red precondition through and claims nothing.**
2. **`X-3` — the per-file test disposition re-derivation** for the amended rows is **Phase 0's first duty**
   per the gate's §4, and is **not** this unit's (this unit's own disposition work is the suite list, §3.5).
3. **`X-4` — the markup/declaration row (`PD-UI-13`) and `PD-UI-3`'s wave assignment** are **NOT this unit's**.
4. **`X-11` — the runner for the two uncollected `.mjs` batteries** (`adapter-parity-battery.test.mjs`,
   `mcp-stdio-e2e.test.mjs`) is **NOT this unit's**: it would edit `package.json`'s script set beyond the one
   added key (§2.5) and is `A-7`'s own item.
5. **`docs/skills/designing-pages.md` — ABSENT in this repo** (VERIFIED-BY-READ: a glob of `docs/skills/*`
   returns `process-guardrails.md` alone). **This unit renders no page, so the honest coverage row is an
   ABSENCE row** — recorded here; **the file is not created by this unit** (`D-9`).
6. **The `SIGTRAP`/`/dev/shm` red is ENVIRONMENTAL and is reported as such in every DONE row** — never
   smoothed, never re-described as an app defect.
7. **`O-1`…`O-8`** (§1.3, §1.1) — **`O-1` (the digest recomputation) and `O-3` (the leg's pass condition) are
   the two that gate this unit's own red set**; `O-2`/`O-4` are placement/record rulings.

---

## 3a. Adversarial findings — **status as filed: `OWED`; this table is the SEED SET for the pass that will run**

`RCA-3` requires a read-only adversarial pass per completed unit, its findings recorded here. **This spec has
run none.** The seed set (each is a question to *falsify*, not a claim):

| # | The adversarial probe |
| --- | --- |
| `ADV-VD-1` | **Is the digest comparison evadable?** A row that hashes a **normalized** view (line endings unified, a trailing newline added, a BOM stripped) passes a copy that is **not** byte-identical. **Probe: mutate one byte that a normalization would hide, and require the row to fail.** |
| `ADV-VD-2` | **Does the `A2` row read the copy it should not?** A row reading `vendor/Provident-Electron/tests/` or a hard-coded constant is self-satisfying. **Probe: perturb the shipped file only, then the copy only; the verdicts must differ** (`P-TP-1`). |
| `ADV-VD-3` | **Is `SKIPPED` a disguised pass?** The monitor's absent-tree arm must be distinguishable from a `CLEAN` reading in the **report text and the exit code**; a `SKIPPED` that prints nothing is a silent pass. |
| `ADV-VD-4` | **Does the vendoring smuggle a baseline-file edit?** Re-read the four baseline files against their pre-vendoring digests **after** the vendor commit — not before (`P-SM-2`). |
| `ADV-VD-5` | **Does the leg's config leak into `npm test`?** A `vitest.conformance.config.ts` that also includes `tests/**` would double-collect; a run of `npm test` that suddenly reports the vendored suites is the finding. |
| `ADV-VD-6` | **Is the "eleven included" claim honest?** The excluded four are excluded for **import** reasons; **probe the four included-but-audit-heavy suites** (`gutter.test.ts`, `relocate.test.ts`, `zones.test.ts`, `gesture-session.test.ts` — each carries a diff-scope audit over `git status --porcelain`) and require the DONE row to have **named** them (§3.5 item 4), not absorbed them. |
| `ADV-VD-7` | **Does any vendored file carry a `'electron'` mock or an out-of-set import after copying?** Re-run **both** scans **on the vendored copies**, not only on the foundation originals. |
| `ADV-VD-8` | **Is the protected-pin re-derivation real?** The bridge-mock census is **derived**; adding a file that mocks `'electron'` must red it. **Probe: the synthetic mock file `P-SM-1` requires** — and then **remove it** in the same pass, restoring the census. |

## 3b. The adversarial pass's disposition table — **the SHAPE this contract will be reconciled to**

| Column | What it carries |
| --- | --- |
| `id` | `ADV-VD-n` |
| `severity` | `BLOCKING` · `HIGH` · `MEDIUM` · `LOW` |
| `class` | `COPY-FIDELITY` · `INSTRUMENT` · `PIN-SAFETY` · `REPORTING` · `DOC-DRIFT` |
| `owner` | `IMPLEMENTER` · `TESTWRITER` · `SUPERVISOR` (a tracker row) · `ARCHITECT` (a ruling: `O-2`/`O-3`/`O-4`) |
| `status` | `LANDED` · `REPORTED` · `ESCALATED` |
| `fix-shape` | the least change that makes the probe fail loudly, or the escalation with its reason |

**A finding that requires editing a vendored module is NOT fixable here** — it is either an
`ARCHITECT` escalation or a `docs/defects.md` handoff (`G-8`: a foundation spec defect is **handed off**,
never absorbed and never patched). **A finding that requires editing a pinned file is an `ARCHITECT`
escalation, full stop.**

---

## 10. Report to the supervisor (what this spec's landing pass must be able to say)

1. **The two spec artifacts** (`docs/specs/unit-pd-vendor-foundation-mechanisms.md`, this file; and
   `docs/specs/pd-vendor-adoption-dossier.md`).
2. **The vendored set** — the fifteen modules, **no member excluded**, with §2.1 items 3–4 as the reason.
3. **The digest verification result** — the command, the revision, and **a per-module
   `REPRODUCED`/`DISAGREES`** against the proposal's §2 table, with any disagreement filed.
4. **The conformance-leg lists** — §3.5 items 2 and 3, **with the reason per excluded suite**.
5. **The register** — **7 rows**, **`103` attempts** printed with its terms,
   `19+17+17+12+10+8+20`, and the `(bounded)` carve-out on `P-IM-3`.
6. **The dossier status** — the number of `defined` rows and **the full list of any
   `undefined-until-answered` row and any unreconciled collision hit**.
7. **The protected pins touched** and their same-commit re-derivation (§3.6).
8. **Every UNVERIFIED item** — `O-1`…`O-8` (§1.3), with `O-1`/`O-3` named as the gating two.

## 11. Cross-references (path + symbol / row id / `§section` — never a line number)

`docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` (clauses (1)/(2)/(5))
`DECIDED: REBUILD-ARCHIVE-POLICY` (clauses (1)/(2)/(3)) · `DECIDED: PANE-DRAG-HEADER-ONLY +
DEFERRED-POINTER-CAPTURE` (the fork row the dossier's collision block reconciles) ·
`docs/specs/post-division-rebuild-proposal.md` §2/§4.1/§4.4/§4.5/§4.7/§5/§6/§7.4/§7.5 ·
`docs/specs/post-division-rebuild-proposal-review.md` §1/§3/§4 (`X-1`…`X-11`)/§5/§6 ·
`docs/specs/post-division-foundation-adoption-surface.md` §0/§1/§2/§9/§10 ·
`docs/specs/post-division-local-elimination-inventory.md` §1/§2.1/§5 ·
`docs/specs/post-division-engine-offload-inventory.md` §2/§5 ·
`docs/specs/requirement-catalog.md` §3.4 rule 7 · `docs/specs/rca-live-bugs-green-pipeline.md` §3 ·
`docs/specs/user-flow-audit.md` §2/§3 · `docs/specs/live-battery-2026-09-22-page-commit-and-stage.md` §2 ·
`docs/specs/unit-u-edit-1-whole-page-editing.md` §7/§8/§10 (the register + layer + fail-state form) ·
`docs/specs/unit-stage-active-tab-display.md` (the status-block + layer form) ·
`tests/unit-v5-migration-contract.test.ts` (the pins) · `vitest.config.ts` · `package.json` ·
`../Provident-Electron/docs/guide/seams.md` *Code, runnable* + *Gotchas measured in this repo* ·
`../Provident-Electron/docs/specs/theme.md` §0A/§3.5/§5.5/§5.5.1/§5.5.3 (the register form this file
follows) · `../Provident-Electron/docs/specs/gsession.md` §2.2 `P-1`/`P-5`/`P-7`, §3.4 `R-1`, §5.5.1 ·
`../Provident-Electron/docs/specs/gutter.md` §2.2 `P-5`/`P-9`, §3.4 `R-1` ·
`../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md` §2/§3 ·
`../Provident-Electron/docs/specs/container.md` §2.4/§3.4 `R-8` ·
`../Provident-Electron/docs/specs/relocate.md` §2.4/§3.2 · `../Provident-Electron/docs/specs/zones.md`
§2.3/§3.4 · `../Provident-Electron/docs/specs/census.md` · `../Provident-Electron/docs/specs/gutter-ui.md`
§R.2/§R.3 · `../Provident-Electron/docs/specs/mcp-endpoint.md` §3.8.
