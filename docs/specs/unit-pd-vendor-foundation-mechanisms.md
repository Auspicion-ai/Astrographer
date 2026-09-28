# Unit `PD-VENDOR` — the vendoring/pin unit (Phase 0): the vendored foundation mechanism set, the machine-readable manifest, the `A2` hash row, the `A3` cross-tree drift monitor, and the scoped conformance leg — Spec

**Status: SPEC — authored 2026-09-27. NO CODE LANDED, NO TEST LANDED, NOTHING RUN by this pass.**
**⟨AMENDED 2026-09-28 — POST-CYCLE CONTRACT AMENDMENT; the as-filed status line above is KEPT as the
filing's reading, never deleted.⟩** The red set has since been RUN and the implementation has followed, so
the unit's status is now: **RED-SET RUN AND REPORTED (116 rows · 96 failed / 20 passed, as filed) →
IMPLEMENTATION LANDED → READING `113 pass / 3 fail` of `116`, full suite `204 files (3 failed / 201
passed) · 4352 tests (4 failed / 4303 passed / 45 skipped)`, `typecheck` 0, `build` 0, `battery` 184/0,
the md5 reconciliation **15/15 REPRODUCED**, the drift monitor **CLEAN when present / SKIPPED when
absent**. Those five readings are the supervisor's RUN readings of 2026-09-28, quoted here as recorded
input; **this amendment pass re-ran NOTHING** (it held no shell) and its own every claim is a **READ** of
the tree or a **derivation from the supervisor's measurements**, marked at its own layer below.** **This
amendment's own layer: DOC-LAYER.** It changes four clauses (`§0A` note 2 · `§3.5` items 4/7 · the three
row corrections of `§4`/`§2.1` · the `O-7` allowed-surface row) and **claims no envelope-green, no
app-green, no store-green and no live-green.** **Findings this amendment adjudicates:** `O-3` (the leg's
pass condition — now DECIDED, not escalated), `O-5` (**ANSWERED NEGATIVELY** — the falsification of
`§0A` note 2's resolution claim), `O-7` (not discharged — now a row-bearing obligation), and the three
contract-vs-row contradictions `C-AM-1`/`C-AM-2`/`C-AM-3`. **Its amendment ledger is §12.**
**⟨AMENDED 2026-09-28 — SECOND AMENDMENT, AFTER THE UNIT'S BLIND-GREENS PASS: `C3`, `C4`, `X-2`, `X-4`,
`X-5` ADJUDICATED — AND THE BLIND PASS'S `A-3` PIN VERIFICATION RECORDED. The blocks above are KEPT as
their passes' readings; nothing above is deleted or reworded.⟩** **The authority for every measurement
below is `docs/specs/unit-pd-vendor-foundation-mechanisms-greens.md`** — a **blind** artifact, authored
from the DOCUMENTATION ONLY (its writer never read `src/shared/**`, the monitor, the manifest or the unit's
test files) and then **RUN**. **Its scenario table carries the readings and its contradictions list carries
`X-1`…`X-6`; this amendment RE-MEASURED NOTHING** (`§13`), so **every figure it introduces is a
RUN-READING quoted as input, not this pass's own verification.** **This amendment's layer: DOC-LAYER —
envelope/tooling at most, NEVER app** (`RCA-12`; the conformance leg, the monitor and the trio are not app
evidence, and `npm run divergence` is RED at this head for an environmental `/dev/shm` reason and is not
this unit's to fix). **Five amendments are owed and all five are taken:** **(1) `C3` — the ZERO-COLLECTION
suite list and `§3.5` item 2's `8 + 3` split are corrected in MEMBERSHIP** (`census.test.ts`,
`gutter-ui.test.ts` and **`gutter.test.ts`** collect zero — `gutter.test.ts` reading as a **`Failed
Suites`** entry on an `ENOENT` for `vendor/Provident-Electron//src` — while **`focus-model.test.ts`
COLLECTS 78 tests / 70 failed**); **(2) `C4` — CLASS (i), THE LEG'S ENTIRE EVIDENCE, IS EMPTY**: all eight
collected suites fail their module drives, so **`§3.5` item 7's bound is RESTATED from three modules to ALL
FIFTEEN as `§3a` `A-1` pre-committed, and the leg's pass condition is now VACUOUS AS EVIDENCE**; **(3)
`X-2` — the resolution defect is DEEPER than `§0A` note 2 recorded: THREE resolution forms (the static
relative specifier, a `new URL('../src/shared/<x>.ts', import.meta.url)` form, and the protected dynamic
`@vite-ignore` import) all resolve under `vendor/Provident-Electron/src/shared/`**; **(4) `X-4` — the
counts are STALE**: the unit's own rows are now measured **`148/148` green**, not `113 pass / 3 fail` of
`116`, and `npm test` now reads **`4384 tests / 1 failed`**, not `4352 / 4`; **(5) `X-5` — the monitor
CONSUMES the `typescript` devDependency** (without it, `ERR_MODULE_NOT_FOUND` in a bare root), now recorded
in the surface/mechanics and the dependency posture. **AND THE STRONGEST EVIDENCE THIS UNIT HAS, recorded
because it is the opposite of a finding:** the **`A-3` pin fix was INDEPENDENTLY VERIFIED by an agent that
never read the implementation** — a `git init` tree at **another revision with equal bytes** produced
`FAIL — … the revision <X> is NOT the pinned commit 8f193a8d… — equal bytes at a different commit are NOT
the pinned state`, **exit 1, no `CLEAN`**; the `SKIPPED` arm read exit `0` **with its honesty statement**;
and `CLEAN` read when the foundation is present and matches (`§3a` `A-3`; `§8`). **Its layer is
envelope/tooling — NEVER app.** **This amendment widens NOTHING:** it authorises no edit under
`../Provident-Electron/**`, to a test file, to `vitest.config.ts`, to the four divergent baseline files, to
`package.json`'s six pinned keys, or to the vendored bytes (`§1.2`; `D-12`). **Its ledger is §13.**

**⟨AMENDED 2026-09-28 — THE STATUS BLOCK'S OWN TWO FIGURES ARE SUPERSEDED (`X-4`), AND BOTH READINGS STAY
VISIBLE WITH THEIR DATES. The as-filed RUN-READING quoted above — *"READING `113 pass / 3 fail` of
`116`"*, *"full suite `204 files (3 failed / 201 passed) · 4352 tests (4 failed / 4303 passed / 45
skipped)`"* — is KEPT above exactly as the supervisor's 2026-09-28 pass recorded it. THE CORRECTED
READINGS, MEASURED by the blind pass's own re-run at the artifact's head
(`ddde29c409e302d14e925f8285819757a6c23bc2`, 2026-09-28), are:⟩** **(a) the unit's OWN rows are
`148 passed (148)`, `0 failed`** — i.e. the `§12.3` remands **have LANDED** and the row count grew
**`116 → 148`**, so **`113 pass / 3 fail` of `116` is a SUPERSEDED reading of an earlier tree state, not a
false claim** (it was correctly labelled a RUN-READING and the amendment said it re-ran nothing); and
**(b) `npm test` reads `204 files (1 failed / 203 passed) · 4384 tests (1 failed / 4338 passed / 45
skipped)`** — **one** red, the **carried branch baseline** `PANE-TOGGLE-STAGE-COLLAPSE`
(`POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1); proposal §7.5), **NOT** the three
`pd-vendor` files. **ARITHMETIC, printed with its terms:** `4338 + 45 + 1 = 4384` ✔ and
`203 + 1 = 204` ✔; and against the superseded reading the deltas are `+32 tests`
(`4384 − 4352`) and `−3 failed tests` (`1 − 4`) — **the `3` reds were the unit's own red set, now green.**
**A DONE row or tracker row that still quotes `113/3` of `116` or `4352 / 4` is WRONG at this head**
(`§12.5` item 1's UNVERIFIED is thereby **PARTLY DISCHARGED**; the superseded figures remain visible here
and there). **Every figure in this block is a RUN-READING of the blind artifact; this amendment pass
re-ran nothing (`§13.7`'s UNVERIFIED item 1).**

**Pass kind:** SPEC (the contract only). **Program:** `docs/specs/post-division-rebuild-proposal.md` (its
§2 measured vendoring model, §4.1 corrected row set, §4.7 architecture amendment, §7.4/§7.5 rulings and
measured baselines). **Gate record:** `docs/specs/post-division-rebuild-proposal-review.md` (verdict
`BLOCKED-ON-SEMANTICS`; `X-1`…`X-11`). **Authority:** `docs/decisions.md`
**`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE`** (ACTIVE), read in full before this file was
authored, together with `DECIDED: REBUILD-ARCHIVE-POLICY` (ACTIVE, clauses (1)/(2)/(3)).

**Layer (RCA-12, mandatory declaration).** **DOC-LAYER for every claim in this file.** This spec asserts
**nothing** that is app-green, envelope-green, store-green, engine-green or live-green. Per deliverable:
**⟨SECOND AMENDMENT 2026-09-28 — THE LEG ROW'S *"EIGHT collected"* READING IS CORRECTED TO `9 COLLECTED / 2
ZERO-COLLECTION`, AND THE LEG SUPPLIES **ZERO** BEHAVIOUR EVIDENCE FOR **ALL FIFTEEN** MODULES: the blind
pass measured every collected suite failing its module drives (`C4`), so the pass condition is **VACUOUS AS
EVIDENCE** and no green subset may be reported. See `§13` and `§3.5` items 4/7.⟩**

| Deliverable | The layer its evidence covers | What that layer does NOT prove |
| --- | --- | --- |
| the vendored `src/shared/<x>.ts` copies | **`[T]` / source-layer** — byte-identity to a pinned commit | that any consumer works, and that the app renders (`G-6`, `RCA-12`) |
| `vendor/foundation.lock.json` | **DOC/MACHINE-DATA layer** — a provenance record | that the bytes it names exist until a row reads them |
| the `A2` hash row | **`[T]` / node-suite** (an ENVELOPE-green instrument) | drift upstream; IPC; layout; the assembled app |
| the `A3` cross-tree monitor | **`[D]`-class local instrument** (harness/script layer) | that the app works; it compares **files**, never behaviour |
| the conformance leg | **`[T]`/`[H]` — the foundation's OWN node suites**, re-run against the vendored copies — **but their MODULE DRIVES all fail: measured `11 files · 572 tests · 511 failed / 61 passed`, with NO green subset and THREE suites collecting ZERO tests** (`C3`/`C4`; `O-5`'s negative answer; `§3.5` items 2/4/7; `§13`) | that the fork USES the modules correctly, or that the shell behaves (`G-6`); and, at this head, **NOTHING about the vendored modules' behaviour at all — all FIFTEEN are uncovered, not three** (`§3.5` item 7's restated bound; `§3a` `A-1` discharged) |
| **⟨ADDED 2026-09-28⟩ the `A-3` pin arm — the `git`/`rev-parse` arm of the monitor** | **`[D]`-class local instrument / tooling** — a REVISION read compared to the manifest's `foundation.commit` | **app, envelope or behaviour of any kind**: it verifies the PIN, never the modules — **and the blind pass's independent verification of it (`§3a` `A-3`; `§8`) is envelope/tooling-grade, NEVER app evidence** |
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
**⟨AMENDED 2026-09-28.⟩** One further marker is used from here on: **RUN-READING** = a figure the
**supervisor's run of 2026-09-28** measured and this amendment quotes **as recorded input**, naming the
run. **This amendment pass ran nothing**; a RUN-READING is **not** this file's own verification, and the
`md5` statement above stands: **the `O-1` table was verified by the supervisor's run (`15/15
REPRODUCED`) and re-verified by NOBODY in this amendment pass.**

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

   **⟨AMENDED 2026-09-28 — `O-5` IS ANSWERED NEGATIVELY, AND THE CLAUSE *"every specifier resolves
   unmodified"* IS FALSIFIED. The original clause is KEPT above as the as-filed reading; it is WRONG.⟩**
   **The run that falsified it:** the leg's first run (`npx vitest run --config vitest.conformance.config.ts`
   over `vendor/Provident-Electron/tests/*.test.ts`) read **11 files · 572 tests · 511 failed / 61 passed**,
   and **3 of the 11 suites collected ZERO tests** (RUN-READING, supervisor's run of 2026-09-28). **Why,
   MEASURED and named — and it is NOT the whole directory:**
   - **THREE suites carry a STATIC VALUE import of an in-set module and are uncollectible there:**
     `vendor/Provident-Electron/tests/gutter-ui.test.ts` → `import { POINTER_TYPES, createGestureSession }
     from '../src/shared/gesture-session.js'`; `vendor/Provident-Electron/tests/census.test.ts` →
     `import * as delegate from '../src/shared/zones.js'` (a **value namespace**); and
     `vendor/Provident-Electron/tests/focus-model.test.ts` (**the third zero-collection suite**, whose
     **mechanism is NOT established by this amendment pass — see the UNVERIFIED note in §12**).
     **⟨ANNOTATED 2026-09-28 (`C3`; `X-1`; `X-6`) — THIS MEMBERSHIP IS WRONG AND IS KEPT AS FILED.
     `focus-model.test.ts` is NOT a zero-collection suite: MEASURED it COLLECTS `78 tests` (`70 failed`).
     The suite misidentified here as its mechanism's third member does not exist: the third
     zero-collection suite is `gutter.test.ts`, whose mechanism is established (a `REPO_ROOT`/`new URL`
     source-file walk under `vendor/Provident-Electron/`), NOT a static value import; and this item's
     claim that `focus-model.test.ts`'s mechanism could not be reconciled with its type-only import is
     **ANSWERED** — nothing about it is uncollectible (§12.5 item 2's UNVERIFIED, discharged; `§3.5`
     item 2's corrected membership and `§13.5`).⟩**
     **(VERIFIED-BY-READ at the paths named, this amendment pass)** — the two imports quoted are static
     **value** imports; the other **NINE files' `../src/shared/*.js` statements are `import type` only**
     (erased at transform), so they never reach a resolver.
   - **The DEPTH arithmetic of note 2 was right and its CONCLUSION was too broad.** From
     `vendor/Provident-Electron/tests/`, `'../src/shared/<x>.js'` resolves to
     `vendor/Provident-Electron/src/shared/<x>.ts`, which **does not exist** (this repo's `src/shared/`
     is **two levels up**, and the manifest's own `vendored`/`source` paths — `src/shared/<name>.ts` —
     are correct for **file reads, never for these specifiers**). The `new URL('../src/shared/<x>.ts',
     import.meta.url)` form named in the finding is the **same resolution fault seen from the file-system
     arm**: it yields `vendor/Provident-Electron/src/shared/<x>.ts`. **So the placement preserves relative
     depth but does NOT preserve what the depth must resolve TO**, and note 2's claim that the placement
     keeps the specifiers working is **falsified by measurement**, not by argument.
     **⟨ANNOTATED 2026-09-28 (`X-2`) — THE MECHANISM CLAIM ABOVE IS SUPERSEDED BY A FULLER MEASUREMENT.
     The sentence *"the `new URL('../src/shared/<x>.ts', import.meta.url)` form named in the finding is the
     same resolution fault seen from the file-system arm"* treated the `new URL` form as a second VIEW of
     the static one and left the guarded dynamic import as the working route. MEASURED: THREE separate
     resolution forms ALL land on the SAME wrong target `vendor/Provident-Electron/src/shared/`, and the
     third is the one the suites actually use.⟩** **(a) STATIC RELATIVE** — `'../src/shared/<x>.js'`, as
     above. **(b) STATIC `new URL(…)`** — `new URL('../src/shared/<x>.ts', import.meta.url)`, a suite-level
     `MODULE_SRC`, **and** `gutter.test.ts`'s `REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))`
     source-file walk, which is what produces the measured **`Error: ENOENT: no such file or directory,
     scandir '…/Astrographer/vendor/Provident-Electron//src'`** and makes that suite a **`Failed Suites`**
     entry — **it resolves under `vendor/Provident-Electron/src/shared/`, the same absent target.**
     **(c) PROTECTED DYNAMIC** — `import(/* @vite-ignore */ MODULE_SPECIFIER)`, which **fails with `Cannot
     find module` even though the target module EXISTS two levels further up**; so item 2's as-filed
     rationale clause *"their module is reached through the guarded dynamic
     `import(/* @vite-ignore */ MODULE_SPECIFIER)`"* **is NOT what happens** and the earlier claim is
     **superseded**. **All three forms are ONE fault with three faces, and NO form resolves** (RUN-READING,
     the blind artifact's `X-2`; `§13.2 · §13.3`; the per-suite red tally in `§3.5` item 2). **This note's
     PLACEMENT RULING below is UNAFFECTED** — it rests on byte-identity and on `G-9`'s pin, never on the
     resolution claim.
   - **THE PLACEMENT RULING (this amendment DECIDES it; it was `O-2`/`O-5`, escalated at filing).**
     **The eleven vendored suites STAY where they are, as BYTE COPIES.** Reason, in the order that binds:
     (i) **the bytes may not be edited** — a rewritten specifier breaks `§4` `P-IM-1`'s byte-identity and
     `§3.1` `V-5`; (ii) **the foundation may not be edited** (`G-8`; and this unit authorises **nothing**
     under `../Provident-Electron/**`); (iii) **the leg may not be collected under the main config** —
     `vitest.config.ts` is `G-9`-protected and its `testTimeout` is pinned **exactly**, so making the three
     suites resolvable by widening `include` or by adding resolver config to the **main** config is a
     **protected-pin violation** (`R-7`; §3.6); and (iv) a **moved** placement that reaches a resolvable
     depth would move the copies **out of** the byte-identity the manifest's `vendored` path records.
     **Consequence 1:** the leg is **RED BY CONSTRUCTION** on the three suites above and **can never be an
     all-green instrument** — its pass condition is therefore the **NAMED SUBSET** of §3.5 item 4, never
     the leg's colour. **Consequence 2:** `gutter-affordance` and `focus-model` and `census` — three of the
     fifteen — carry **reduced copy-fidelity coverage** (the `gutter-ui` edge into `gesture-session` is
     uncollected with it), recorded as the leg's own bound at §3.5 item 7. **⟨ANNOTATED 2026-09-28 (`C3`
     + `C4`) — THIS AS-FILED SENTENCE IS SUPERSEDED, NEVER REWRITTEN. Its `8 + 3` SPLIT IS WRONG IN ITS
     MEMBERSHIP and its three-module list is WRONG. MEASURED: the three ZERO-COLLECTION suites are
     `census.test.ts`, `gutter-ui.test.ts` and `gutter.test.ts` (the last as a `Failed Suites` entry on the
     `ENOENT` for `vendor/Provident-Electron//src`) — while **`focus-model.test.ts` COLLECTS `78 tests`
     (`70 failed`)**, so the corrected split is **`9 collected / 2 zero-collection`**; and `focus-model.ts`
     therefore carries the SAME (absent) behaviour coverage as every other module: **`C4` shows every
     collected suite failing its module drives, so the bound is not three modules but ALL FIFTEEN.** The
     `9/2` split and the per-suite red tally are carried at `§3.5` items 2/4/7, and the `focus-model.test.ts`
     *"static value import"* claim above is **WRONG** as to the mechanism while the first amendment's
     UNVERIFIED note (§12.5 item 2) is **ANSWERED** by the same measurement.⟩** **Consequence 3:** a **future
     green** of this leg requires either a **foundation-side** change (the bytes carrying resolvable
     specifiers — handed off, never patched here) or an **architect ruling that amends `G-9`'s pin set**
     so a resolver may live in a config the pin does not freeze. **Neither is this unit's to take, and
     neither is proposed here.** **A third route — a GENERATED RESOLVER placed in
     `vitest.conformance.config.ts` (its own, unpinned config) — is RECORDED, NOT TAKEN**: it would be a
     legitimate instrument, but it **widens this unit's surface** (a resolver module plus its own tests)
     beyond the four items this amendment is authorised to adjudicate, so it is **escalated to the
     architect** with its reason rather than adopted.
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

   **⟨AMENDED 2026-09-28 — `O-3` IS NOW DECIDED, NOT ESCALATED, and both red classes are MEASURED and
   NAMED. The original clause is KEPT above as the as-filed reading.⟩** The filing offered three routes
   (`§1.1` `O-3`: (a) audit rows filed red and labelled · (b) a row-level filter · (c) only the clean
   sub-trees). **The ruling is (a) — file them red, NAME them, and scope the leg's PASS CONDITION to a named
   subset — and the leg's two red classes are now the following, both MEASURED (RUN-READING, supervisor's
   run of 2026-09-28):**
   **(R-A) FOUNDATION-REPO AUDIT ROWS** — rows asserting the **foundation repo's own state**: the
   `git status --porcelain` diff-scope/allow-list audit over a unit's commit range, reads of the
   foundation's own `docs/specs/<unit>.md` / `-review.md` / `-greens.md` artifacts, the
   `existsSync('docs/skills/designing-pages.md')` **absence** probe (whose failure is the intended reading
   in the foundation), the foundation's **frozen** `src/shared/dom-shim.ts` read, and the
   `../package.json` script census. **These CANNOT pass in this repo and they are NOT copy-fidelity
   evidence** — they are `[H]`-class rows about another repository's tree.
   **(R-B) MODULE-ABSENCE ROWS** — the rows of the **three uncollectible suites** of §0A note 2
   (`gutter-ui.test.ts`, `census.test.ts`, `focus-model.test.ts`), whose module specifier does not resolve
   from `vendor/Provident-Electron/tests/`. **They are not copy-fidelity evidence either — they are
   STRUCTURAL.** §3.5 item 4 carries the ruled pass condition; §3.5 item 7 carries the resulting coverage
   bound. **`O-5`'s answer (NEGATIVE) is what fixes (R-B) as permanent for this placement**, and the
   placement ruling is in note 2.
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

   **⟨AMENDED 2026-09-28 — `O-7` WAS NOT DISCHARGED, AND ITS PATH WAS UNNAMED. The original clause is KEPT
   above as the as-filed reading; it was INCOMPLETE, not wrong.⟩** **The defect in this filing's own text:**
   the obligation was stated but **no allowed-surface row named a PATH for the re-declaration and no red row
   asserted the file's existence**, so **nothing forced the file to exist** and the landed tree carries
   **none** (VERIFIED-BY-READ, this amendment pass: no `src/shared/foundation-return-shapes.ts` in the tree).
   **RULED — the re-declaration path is `src/shared/foundation-return-shapes.ts`** (the implementer's
   proposal, **ADOPTED**). Reasons, each checkable: (i) the shapes are **this repo's own consumer-side type
   surface**, so they belong beside the vendored modules under `src/shared/` — the table below says why that
   directory may hold fork-local modules the pin does not claim; (ii) a **dedicated** file makes the
   obligation's **absence** a loud single-path red rather than an invisible gap inside another module; and
   (iii) the name is **not one of the pin's fifteen** and **not one of the four baseline files**, so it
   cannot be read as a sixteenth member or as a replaced baseline. **The obligation is now ROW-BEARING:**
   §1.2 carries the path in the allowed-surface table, §2.1 item 7 carries the per-shape declaration rule,
   and §4 `P-IM-4` is the register row that asserts it. **The foundation is NOT patched** (`G-8`): the
   export gap is a **HANDOFF item**, recorded by this amendment with its reason — the shapes are **returned
   by values and taken by callbacks**, so a consumer **cannot name them** at all — and the handoff row is
   **owed to the supervisor's write** (§9 item 8; §12 item 4).
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

Five deliverables, **all promised by proposal §4.7's `A-8` and owned by no unit until `X-2` minted this one**
(**⟨AMENDED 2026-09-28: the list below carries SIX entries — the sixth, `src/shared/foundation-return-shapes.ts`,
is ADDED by this amendment's `O-7` ruling; the as-filed count of five is KEPT here as provenance.⟩**):

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
6. **⟨ADDED 2026-09-28 — the re-declared return shapes.⟩** **`src/shared/foundation-return-shapes.ts`** —
   the **fork-local** re-declaration of the five shapes the foundation does not export (`GestureSession`,
   `RelocateResetResult`, `FocusResult`, `FocusRefusal`, `FocusTransitionArg`), the obligation `O-7` stated
   **without a path** at filing (§0A note 7; §1.2; §2.1 item 7; §4 `P-IM-4`). **This is the SIXTH
   deliverable, and it became one because the run established that nothing else forced the file to exist.**

**The four escalations this filing carries** (recorded here so the supervisor sees them without reading §9):
**⟨AMENDED 2026-09-28 — the table is KEPT as filed; `O-2`, `O-3` and `O-5` are now ADJUDICATED by this
amendment (§0A notes 2 and 3), and `O-4` stands ESCALATED. The fifth row below is ADDED by this amendment,
because `O-5` — `§0A` note 2's resolution claim — was an unnamed escalation at filing.⟩**

| # | Escalation | Why it is escalated, not decided | **⟨Amendment status (2026-09-28)⟩** |
| --- | --- | --- | --- |
| **`O-1`** | **The md5 table is UNVERIFIED by this pass.** This session had **no shell tool** — `md5sum` could not be run — so the proposal's §2 table is **neither reproduced nor falsified** here (§1.3). | The instruction to *"recompute every md5 yourself and report any disagreement"* **cannot be discharged in this session**; the recomputation is a **named, mandatory pre-red obligation** (§3.3 item 1). | **DISCHARGED BY THE RUN** — the supervisor's run read the reconciliation **15/15 REPRODUCED** (RUN-READING, §12 item 1). **NOT re-verified by this amendment pass.** **⟨2026-09-28, second amendment: the blind pass's `A2` row independently RE-READ the manifest and recomputed all fifteen digests — `15/15` equal to the manifest, so this discharge is CONFIRMED by a non-authoring agent at the envelope/`[T]` layer (`§13.4`: the `A2`-family rows read `148 passed (148)`).⟩** |
| **`O-2`** | **The vendored suites' placement deviates from the letter of `A-8`** (`vendor/Provident-Electron/tests/` instead of `tests/`), for the pinned-config reason in §0A note 2. | The architect may prefer `tests/` with a config the pin does not forbid; **that would require amending `G-9`'s pin set or the frozen config**, which is the architect's ruling, not a spec's. | **RULED — the placement STANDS** (byte copies at `vendor/Provident-Electron/tests/`; `G-9` forbids collecting them under the main config). The route that would amend `G-9` stays the architect's. **§0A note 2.** |
| **`O-3`** | **The eleven candidate suites are NOT byte-portable as green legs.** Every one carries foundation-repo audit rows (§0A note 3); **their module-under-test imports are closed, but their assertions are not**. | Choosing between (a) filing every audit row **red and labelled**, (b) a row-level filter, or (c) filing only the four import-closed-and-otherwise-clean **sub-trees of the module rows** is a **contract decision about what the leg is FOR** — escalated per §0A note 3. | **DECIDED — route (a), with a NAMED SUBSET pass condition** (§3.5 item 4). Both red classes measured and named. **§0A note 3; §3.5 items 4/7.** **⟨2026-09-28, second amendment: route (a) STANDS as the ruling, but its NAMED SUBSET IS NOW EMPTY — class (i) is red for every collected suite (`C4`), so `§3.5` item 4's *"MUST PASS, or the unit is not green"* has NO satisfiable instance at this head and `§3.5` item 7's bound is restated to ALL FIFTEEN modules. The ruling is unchanged in form; its evidentiary content is ZERO (§13.2/§13.4).⟩** |
| **`O-4`** | **`V-13` owed `A1`'s durable pin record a home.** §0A note 5 decides it is the manifest + the existing decision clause, and **writes no new decision row**. | If the architect wants a per-module figure in `docs/decisions.md` too, that **contradicts `A-8`** and is the architect's call. | **STANDS ESCALATED — unchanged by this amendment.** The landed manifest is the record (VERIFIED-BY-READ). |
| **`O-5`** | **Whether the vendored suites' specifiers resolve from `vendor/Provident-Electron/tests/`** (§1.3). | **ADDED 2026-09-28:** the filing asserted the resolution **in `§0A` note 2** without a run, so the claim was **unfalsified rather than verified** — an escalation that was never named as one. | **ANSWERED NEGATIVELY — the claim is FALSIFIED.** 3 of 11 suites collect **ZERO** tests; the leg reads **11 files · 572 tests · 511 failed / 61 passed**. **§0A note 2.** **⟨AMENDED 2026-09-28: the totals REPRODUCE and the MEMBERSHIP does not — the three zero-collection suites are `census.test.ts`, `gutter-ui.test.ts` and `gutter.test.ts`, and `focus-model.test.ts` COLLECTS 78 (70 failed). The resolved set is measured as `9 collected / 2 zero-collection`, the fault has THREE forms (`X-2`), and NO green subset exists (`C4`; `§3.5` items 2/4/7; `§13.1 · §13.3`).⟩** **AND THE SEPARATE QUESTION THE FIRST AMENDMENT LEFT OPEN (`§12.5` item 4, *"whether the eight collected suites' class (i) rows are green today"*) IS NOW ANSWERED TOO: they are RED for EVERY collected suite** — `theme 46/58` · `container 57/68` · `zones 54/58` · `overlay 57/69` · `menu-template 54/60` · `relocate 90/94` · `gesture-session 83/87` · `focus-model 70/78` (**collected|failed**), each labelled `src/shared/<x>.ts does not exist (…/vendor/Provident-Electron/src/shared/<x>.ts)` — so **class (i)'s evidence set is EMPTY**, `§3a` `A-1`'s pre-committed restatement is taken as **CONTRACT** (`§3.5` item 7), and **no green subset may ever be reported from this leg** (`C4`; `§13.2`). |

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
| **`src/shared/foundation-return-shapes.ts`** | **NEW ⟨ADDED 2026-09-28 by this amendment's `O-7` ruling — the re-declaration path the filing left UNNAMED.⟩** — fork-local TYPE re-declarations ONLY (§2.1 item 7; §4 `P-IM-4`) | source/`[T]` |
| `vendor/foundation.lock.json` | **NEW** (the manifest) | machine data |
| `vendor/Provident-Electron/tests/<x>.test.ts` ×N | **NEW** (byte copies of the included suites, `N` = §3.5 item 2) — **and, per the `O-5` ruling, the placement STANDS: three of those suites are uncollectible there BY CONSTRUCTION** (§0A note 2) — **⟨2026-09-28: the three are `census.test.ts`, `gutter-ui.test.ts`, `gutter.test.ts` (`C3`), and the remaining EIGHT collect but ALL fail their module drives (`C4`) — no `vendor/**` file is collected by `npm test`, so the leg stays invisible to it (`§3.5` item 6; §13).⟩** | `[T]`/`[H]` |
| `tests/foundation-vendor-manifest.test.ts` | **NEW** (the `A2` hash row) — **⟨AMENDED 2026-09-28: landed as THREE files, `tests/pd-vendor-set.test.ts` + `tests/pd-vendor-drift.test.ts` + `tests/pd-vendor-manifest.test.ts`; the planned name is kept as the as-filed reading, and the split satisfies every obligation of §2.4 (see that section's note and §12.5 item 9)⟩** | `[T]` |
| `scripts/foundation-drift.mjs` | **NEW** (the `A3` monitor) | `[D]`-class local instrument |
| `vitest.conformance.config.ts` | **NEW** (the leg's own config) — **⟨AMENDED 2026-09-28: NO RESOLVER is added to it; the generated-resolver route is ESCALATED, not taken (§0A note 2 consequence 3).⟩** | harness |
| `package.json` | **TWO added script keys** (`conformance`, `drift`) — **`⟨AMENDED 2026-09-28: the as-filed row said ONE key; the landed tree carries TWO, and this amendment records them as the AUTHORISED surface, not as a widening — the second key was optional-but-permitted at filing: §2.5's *"one of the two is REQUIRED"* clause.⟩`** `test`/`test:watch`/`battery`/`divergence`/`typecheck`/`build` **UNCHANGED** (`G-9`, `R-7`) | harness |
| **every other file** | **UNTOUCHED** — in particular `vitest.config.ts`, `src/shared/dom-shim.ts`, `src/shared/types.ts`, `src/shared/demo-envelope.ts`, `src/shared/path-fork-cycle.ts`, `src/main/markdown-import.ts`, `tests/unit-v5-migration-contract.test.ts`, `tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts`, `tests/fixtures/v5-bridge-capture-fixture.js`, **`tests/pd-vendor-*.test.ts` (the RED SET — a spec may not edit a test; the three row corrections below are REMANDS to the TestWriter)**, every `docs/**` file | — |

**⟨ADDED 2026-09-28 — TWO LIMITS ON THE ROW ABOVE, so the `O-7` addition is never over-read.⟩** (1)
**`src/shared/foundation-return-shapes.ts` is NOT a sixteenth vendored member and NOT a baseline file.** The
set is the pin's **fifteen** manifest-claimed names (§2.1 items 1–2, §4 `P-IM-1`), and the landed red set's
own row for "the repo's OTHER `src/shared/` fork modules" asserts exactly that reading — the repo's
`src/shared/` **already** carries fork-local modules the manifest does not claim (`document-tree.ts`,
`o0-hook.ts`, `o0-report.ts`, beside the four baseline files), so a further fork-local module is
**consistent with the landed contract, not a widening of it** (VERIFIED-BY-READ of the directory and of
`tests/pd-vendor-set.test.ts`'s §2.1 item 1 row, this amendment pass). (2) **No OTHER file is authorised by
this amendment.** Its four items require exactly this one path; anything further is a new unit or an
architect ruling.

### 1.3 THE HONESTY BLOCK — what this pass could NOT verify (each with what would settle it)

| # | Unverified item | What would settle it |
| --- | --- | --- |
| **`O-1`** | **The per-module md5 table.** This pass had **no shell**: `md5sum`, `md5`, `node -e "crypto…"`, `git cat-file` and `diff -q` were **all unavailable**. So the proposal §2 table is **NOT reproduced, NOT falsified, and NOT copied on trust into this spec's §2.2**. | `md5sum` (or any cryptographic digest tool) **run in the foundation tree at `main` = `8f193a8d1446ed1e64c4ab6c569941e988f82459`**, for the fifteen files, with the command recorded verbatim — §3.3 item 1 makes this a **pre-red obligation**, and the manifest may not be committed without it. |
| **`O-2`** | **The vendored-suite placement** (§0A note 2) and whether a `tests/**` placement is achievable under the frozen `vitest.config.ts`. | The architect's ruling, or a re-reading of `G-9`'s pin scope. **⟨AMENDED 2026-09-28 — RULED: the placement STANDS as byte copies; a `tests/**` placement is NOT achievable without amending `G-9`'s pin set, which is the architect's alone. §0A note 2.⟩** |
| **`O-3`** | **Whether the conformance leg can be green at all** in this repo (§0A note 3) — and, if it cannot, whether the leg is (a) filed with audit rows red, (b) filtered by row title, or (c) reduced to the module rows. | A **run** of the leg after vendoring: `npx vitest run --config vitest.conformance.config.ts`, with the per-suite pass/fail tally recorded. **Nothing in this file predicts that tally.** **⟨AMENDED 2026-09-28 — DECIDED: route (a), with a NAMED-SUBSET pass condition; the run was taken (`11 files · 572 tests · 511 failed / 61 passed`, 3 suites collecting zero tests). §3.5 items 4/7.⟩** |
| **`O-4`** | The durable-home question for `V-13`'s pin record (§0A note 5). | The architect's confirmation that the manifest is the home. |
| **`O-5`** | **Whether `import(/* @vite-ignore */ '../../src/shared/<x>.js')` resolves to `src/shared/<x>.ts` under this repo's Vite/vitest.** The foundation's guide states the **static** form is **`unverified`** (`../Provident-Electron/docs/guide/seams.md` *Code, runnable* + *Gotchas measured in this repo*), and the dynamic+`@vite-ignore` form is the one the fifteen suites actually use — but **this pass ran nothing**. | One run of a single vendored suite (or of one smoke row) under `npx vitest run` in this repo. **⟨AMENDED 2026-09-28 — ANSWERED NEGATIVELY, and the specifier in the question is not even the operative one. The operative specifier is the RELATIVE `'../src/shared/<x>.js'`, which from `vendor/Provident-Electron/tests/` resolves to `vendor/Provident-Electron/src/shared/<x>.js` — ABSENT. Measured: 3 of 11 suites collect ZERO tests; the leg reads 11 files · 572 tests · 511 failed / 61 passed. The as-filed `O-2` placement claim in `§0A` note 2 is FALSIFIED; the placement ruling and its three consequences are in `§0A` note 2.⟩** **⟨2026-09-28, second amendment (`X-2`) — THE MECHANISM IS THREE-FORM, NOT ONE: the STATIC RELATIVE specifier, a STATIC `new URL('../src/shared/<x>.ts', import.meta.url)` form AND the guarded dynamic `import(/* @vite-ignore */ …)` ALL resolve under `vendor/Provident-Electron/src/shared/`.** The dynamic form — the very form this row's question names as *"the one the fifteen suites actually use"* — **fails with `Cannot find module` although the module exists two levels up**, so the row's premise is doubly superseded (§0A note 2's annotation; `§13.3`). |
| **`O-6`** | **`G-4`'s scope** — this filing carries the scoping ruling (R-9) but **cannot test it**; the corpus-write question belongs to `PD-UI-2`'s rows. | `PD-UI-2`'s own spec gate. |
| **`O-7`** | **The unexported return shapes** (§0A note 7): `GestureSession`, `RelocateResetResult`, `FocusResult`, `FocusRefusal`, `FocusTransitionArg`. | Nothing to settle — this is a **recorded consumer cost**; the fork re-declares. Recorded so no unit claims the shapes are importable. **⟨AMENDED 2026-09-28 — NOT DISCHARGED AT FILING: the obligation named no PATH and the landed tree carries no re-declaration file. RULED: the path is `src/shared/foundation-return-shapes.ts`, the obligation is now ROW-BEARING (§2.1 item 7; §4 `P-IM-4`), and the foundation-side export gap is a HANDOFF item (§9 item 8).⟩** |
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

**⟨ANNOTATED 2026-09-28 (`C-AM-4`, DOC-DRIFT, LOW) — ONE READING OF THE SENTENCE ABOVE, because a landed
row's doc-comment reads the count the other way and both cannot be right.⟩** The sentence is **a census of the
DIRECTORY**, which is what item 5's own **Read:** clause says it measured: `../Provident-Electron/src/shared/`
holds **20** `.ts` files, of which **5** carry an import and **15** carry none. **It is NOT a statement about
the fifteen-module set**, where the split is **5 with imports / 10 without**. **Both readings are therefore
correct at their own scope and neither sentence is edited:** the spec's `5 + 15 = 20` is the directory, the
landed row's `5 + 10 = 15` is the set, and **the two must not be collapsed** — a collapse produces the wrong
*"the other FIFTEEN carry none"* reading of the set, which is the drift this annotation closes.

**⟨ADDED 2026-09-28 — THE ARITHMETIC THIS CENSUS CARRIES, because a landed row conflated two of its units
(`C-AM-2`).⟩** The table above counts **STATEMENTS**; `§2.2`'s `internalEdges` records **DISTINCT EDGES**,
and the two are **NOT** the same number here:

| Unit | Count | What it is |
| --- | --- | --- |
| Files carrying any import at all | **5** (`census`, `gutter-affordance`, `gutter`, `relocate`, `path-fork-cycle`) | the table's own row count; **10** of the fifteen carry **zero** import statements |
| **Set-internal IMPORT STATEMENTS** | **6** | `census.ts`→`zones` · `gutter-affordance.ts`→`gutter` · **`gutter-affordance.ts`→`gesture-session` ×2** · `gutter.ts`→`gesture-session` · `relocate.ts`→`gesture-session` |
| **Set-internal DISTINCT EDGES** | **5** | the `§2.2` `internalEdges` records — `gutter-affordance.ts` imports `./gesture-session.js` **twice**, once as a **value** (`POINTER_TYPES`) and once **type-only** (`GestureHandle`) |

**Two consequences, both BINDING.** (1) **`§2.2`'s `internalEdges` carries FIVE records** — a distinct-edge
set keyed by the pair `(from, to)`; a **sixth** record (the duplicate statement) is **NOT** the contract, and
neither is a **dropped** one. (2) **That double statement is itself the pin's content**: the value import is
what makes `gutter-ui.test.ts` uncollectible where the suite is filed (§0A note 2), and the type-only import
is what keeps `relocate.ts` and `gutter.ts` **import-closed without a runtime edge**. **A row that counts
statements and compares them to the five-record manifest is measuring a different quantity from the one the
manifest records** — §12 item 3(b) states the remand.

**6. NO VENDORED MODULE IS IMPORTED BY THIS REPO TODAY — MEASURED.** A read of `src/**` for
`from '…/<name>.js'` over the fifteen names returns **three matches, none of them a vendored member**:
`src/renderer/renderer.ts` imports `./pane-gutter.js` and `./theme.js`, and `src/renderer/sidebar-panes.ts`
imports `./pane-gutter.js`. **`src/renderer/theme.ts` is a FORK module that shares a FILE STEM with the
vendored `src/shared/theme.ts`** — a collision by stem, **not by specifier** (the specifiers differ:
`./theme.js` from `src/renderer/`, versus `src/shared/theme.ts`). The dossier's collision block carries it by
row (§3.2 there). **The vendoring is therefore inert: it adds fifteen modules that nothing imports.**

**⟨AMENDED 2026-09-28 — THE CLAUSE ABOVE IS KEPT AS FILED AND IS THE OPERATIVE READING; one landed ROW
misstates it, and the contradiction is ruled here (`C-AM-3`).⟩** The clause's own predicate is **"no vendored
member is imported by this repo today"** — **NOT "zero grep hits"**. The measured reading is exactly the
**three** matches above (**2** in `src/renderer/renderer.ts` + **1** in `src/renderer/sidebar-panes.ts`),
all three on fork modules that **share a stem** with a vendored member and **none of them a vendored
member** (VERIFIED-BY-READ at those two paths, this amendment pass: `from './pane-gutter.js'` at
`src/renderer/renderer.ts` and again at `src/renderer/sidebar-panes.ts`; `from './theme.js'` at
`src/renderer/renderer.ts`). **The row's satisfiable form is a REMAND to the TestWriter, and it is stated in
§12 item 3(c); the clause itself needs no change, and no `src/renderer/**` edit is authorised** (§3.6;
`C-7`). **A zero-hit form would require editing `src/renderer/renderer.ts`, which `§3.6` and `R-3`'s
neighbourhood forbid — so the ZERO-HIT FORM IS THE WRONG SIDE OF THE CONTRADICTION.**

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

**⟨ADDED 2026-09-28 — ITEM 7b: THE RE-DECLARATION OBLIGATION, WITH ITS PATH (`O-7`; §0A note 7).⟩** The
five ⚠ names above are **returned by values and taken by callbacks and cannot be imported**. **This repo
re-declares them at `src/shared/foundation-return-shapes.ts`**, under these rules:

1. **The file exists and declares ALL FIVE**: `GestureSession`, `RelocateResetResult`, `FocusResult`,
   `FocusRefusal`, `FocusTransitionArg`. A **missing declaration** is a loud failure naming the shape
   (§4 `P-IM-4`); a **partial** file is the same failure.
2. **It is a TYPE-ONLY module**: declared `interface`/`type`/`class`-type surface, **no runtime value**, and
   **no import of any kind** (in particular nothing from `provident-ssr`, from a vendored module, or from
   `node:*`) — so it is **not** an import-graph member and cannot become a sixteenth edge (§2.1 item 5).
3. **The structural shapes must MATCH the vendored modules' actual returned values**, not a paraphrase. The
   foundation's own suites already carry the mirror (`relocate.test.ts`'s module-type block,
   `focus-model.test.ts`'s structural surface type, `gesture-session.test.ts`'s type-only block); the
   re-declaration is the CONSUMER-side copy of that mirror, and the row asserts **declaration presence and
   the five-name set**, while equivalence to the returned values stays the **vendored suites' own**
   (envelope-layer) evidence — **never a claim this unit makes green** (§5 item 6).
4. **The vendored bytes stay UNMODIFIED** — adding `export` to any of the five declarations would break
   §4 `P-IM-1`'s byte-identity (`§3.1` `V-5`). **The foundation is NOT patched**: the export gap is a
   **handoff item** (§9 item 8) whose reason is exactly this clause.
5. **It is NOT a vendored member and NOT a baseline file** (§1.2's two limits): the manifest's `modules`
   still carries **exactly fifteen** entries and `baselineFilesNotReplaced` still exactly the four files.

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
8. **⟨ADDED 2026-09-28.⟩ `importCensus.internalEdges` carries EXACTLY FIVE records — a DISTINCT-EDGE set
   keyed by the pair `(from, to)`, never a statement list.** The two statements of
   `gutter-affordance.ts`→`gesture-session` are **ONE** record (§2.1 item 5's arithmetic block); a sixth
   record or a dropped record both fail (§4 `P-IM-3`, and the correction in §12 item 3(b)).
9. **⟨ADDED 2026-09-28.⟩ The manifest MAY carry the re-declaration record** — the implementer may add a key
   (the normative shape permits added keys, never removed or renamed ones) naming
   `src/shared/foundation-return-shapes.ts` and the five shapes it re-declares. **Optional; the `P-IM-4`
   obligation does not depend on it**, and the file's existence is asserted at the file system, not in the
   manifest.

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

**⟨ADDED 2026-09-28 — THE MONITOR'S RUNTIME DEPENDENCY, and the exact scope of *"standalone"* (`X-5`).⟩**
**The monitor CONSUMES the `typescript` devDependency** — its import-closure oracle derives the vendored
files' imports with the TypeScript **AST** (the `§3a` `A-10` HOST-FIX: `ImportDeclaration` /
`ImportExpression` / `require` `CallExpression`, replacing the old single-line regex), so `typescript` is a
**runtime** dependency of `scripts/foundation-drift.mjs`, not only a build-time one. **MEASURED:** in a bare
root (a temp tree with **no `node_modules`**) the script **CANNOT START**:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'typescript' imported from …/scripts/foundation-drift.mjs
```

and it starts normally once the repo's `node_modules` is reachable. **THE SCOPE OF THE STANDALONE CLAIM,
stated so it is never over-read:** *"the fork must work standalone"* (§2.3 row 1; decision clause (1)'s
vendoring model) is satisfied **for the ABSENT-FOUNDATION situation** — a missing
`<foundation.path>/src/shared/` yields `SKIPPED`, exit `0`, **with no dependency on the adjacent tree
whatsoever**. **It is NOT and never was a claim that the script runs with NO INSTALLED DEPENDENCIES**: the
instrument lives in the repo and runs from the repo (or from a copy of it) with the repo's
`devDependencies` installed. **`typescript` is ALREADY a devDependency of this repo and this amendment
ADDS NO DEPENDENCY, moves no pinned key and edits no `package.json` value** (§2.5; §3.4; `D-12`;
`§13.7`).

### 2.4 `tests/foundation-vendor-manifest.test.ts` — the `A2` hash row (placement, and why) **(LANDED AS `tests/pd-vendor-manifest.test.ts` + `tests/pd-vendor-set.test.ts` + `tests/pd-vendor-drift.test.ts` — the as-filed heading is KEPT; see the amendment note in this section)**

**It is a `tests/**` row (the architect's `A-8` wording) and it is therefore COLLECTED by `npm test`'s
`include` (`tests/**/*.test.ts`).** **⟨AMENDED 2026-09-28 — the LANDED file name differs, and the difference is
recorded rather than retro-fitted.⟩** The filing planned **ONE** file,
`tests/foundation-vendor-manifest.test.ts`; the landed red set is **THREE**
(`tests/pd-vendor-set.test.ts`, `tests/pd-vendor-drift.test.ts`, `tests/pd-vendor-manifest.test.ts`), i.e.
the `A2`-hash/register family lives in `tests/pd-vendor-manifest.test.ts` and the set/leg families in the
other two. **Everything that matters in this section is NAME-INDEPENDENT and holds for the split:** the row
is still **collected** by `npm test`, still **must not** mock `'electron'` (item 1), still **must not** read a
`G-9`-frozen file (item 2), still hashes **the shipped file** (item 3), and still keeps the
**census-stable** title rule (item 4) — which the three landed files satisfy **per module**. **A
name-level reconciliation is OWED to a later doc review; it changes no obligation in this section** (§12.5
item 9). Consequences, stated because two of them are `G-9`-protected:

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

**⟨ADDED 2026-09-28 — THE UNIT'S DEPENDENCY POSTURE (`X-5`), stated so no reader over-reads
*"standalone"*.⟩** **This unit adds NO dependency and edits NO dependency key.** Its two runtime consumers
of the existing `devDependencies` are: **`scripts/foundation-drift.mjs` → `typescript`** (the AST import-
closure oracle and the `§3a` `A-10` HOST-FIX; **without it the script cannot start** — `ERR_MODULE_NOT_FOUND`
in a bare root, §2.3's added note), and **the `tests/pd-vendor-*.test.ts` family → `node:*` builtins plus
`vitest` only**. **The `A2` family imports nothing else** (§2.4 item 1), and **no new package, no PBT
library and no sixth leg is added** (§4's shared machinery). **A row that requires `node_modules` to be
installed is NOT a row that violates "the fork works standalone":** that property is about the **ABSENT
FOUNDATION TREE** (§2.3 row 1), never about a dependency-free checkout.

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

**⟨AMENDED 2026-09-28 — THE COLUMN ABOVE IS *MODULE-UNDER-TEST* IMPORTS AND SAYS NOTHING ABOUT
COLLECTIBILITY; the run split the eleven into 8 + 3 (`O-5`; `§0A` note 2).⟩** **COLLECTED: 8** —
`theme.test.ts`, `zones.test.ts`, `container.test.ts`, `overlay.test.ts`, `menu-template.test.ts`,
`gutter.test.ts`, `relocate.test.ts`, `gesture-session.test.ts` (their `../src/shared/*.js` statements are
**type-only**, erased at transform, and their module is reached through the guarded dynamic
`import(/* @vite-ignore */ MODULE_SPECIFIER)`). **UNCOLLECTIBLE WHERE FILED: 3** —
**`gutter-ui.test.ts`** (`import { POINTER_TYPES, createGestureSession } from
'../src/shared/gesture-session.js'` — a **value** import), **`census.test.ts`** (`import * as delegate from
'../src/shared/zones.js'` — a **value namespace**), and **`focus-model.test.ts`** (a further static
`'../src/shared/focus-model.js'` reference whose exact collection mechanism is **NOT established by this
amendment pass** — recorded as UNVERIFIED in §12 item 2). **All three collect ZERO tests**, so **their
module rows are not evidence of anything** (§3.5 item 4's class (ii); item 7's coverage bound).

**⟨AMENDED 2026-09-28 (SECOND AMENDMENT) — THE `8 + 3` SPLIT ABOVE IS SUPERSEDED: its STRUCTURE holds (`3`
of the `11` collect ZERO) and its MEMBERSHIP is WRONG (`C3`; `X-1`; `X-3`). THE CORRECTED SPLIT IS
`9 COLLECTED / 2 ZERO-COLLECTION`, and every figure below is MEASURED.⟩**
**ZERO-COLLECTION: 2 — `census.test.ts`** (its static value namespace `import * as delegate from
'../src/shared/zones.js'` — **the mechanism this spec named, and it REPRODUCES**) and
**`gutter-ui.test.ts`** (its static value import `import { POINTER_TYPES, createGestureSession } from
'../src/shared/gesture-session.js'` — **also reproduces**). **Both mechanisms the first amendment named for
those two suites are CORRECT; both are wrong only about the THIRD member.** **THE THIRD ZERO-COLLECTION
ENTRY IS `gutter.test.ts`, NOT `focus-model.test.ts`** — and its mechanism is a **third, different** one: a
`REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))` **source-file walk** that resolves under
`vendor/Provident-Electron/`, surfacing as a **`Failed Suites`** entry with `Error: ENOENT: no such file or
directory, scandir '…/Astrographer/vendor/Provident-Electron//src'` — **it appears in the run's `Failed
Suites` list and NOT among the collected suites** (`X-2` item (b)). **`focus-model.test.ts` IS COLLECTED AND
IS DRIVEN — `78 tests`, `70 failed`** — so the first amendment's label *"the third zero-collection suite"*
and its *"static value import"* mechanism for that file are **BOTH WRONG**, and its UNVERIFIED item
(`§12.5` item 2) is **ANSWERED: nothing about `focus-model.test.ts` is uncollectible** (`X-6`).
**THE COLLECTED SET CARRIES NINE SUITES, AND EVERY ONE FAILS ITS MODULE DRIVES (`C4`).** **The measured
per-suite tally at the blind artifact's head, printed as `collected|failed` — the `§10` item 9 DONE-row
obligation taken as a READING:** **`theme 46|58` · `zones 54|58` · `container 57|68` · `overlay 57|69` ·
`menu-template 54|60` · `relocate 90|94` · `gesture-session 83|87` · `focus-model 70|78`** (**eight
collected suites, ALL FAILING their module drives**; the failure label is `<x>: src/shared/<x>.ts does not
exist (…/vendor/Provident-Electron/src/shared/<x>.ts)`) · **`gutter 0|0`**, **`census 0|0`**,
**`gutter-ui 0|0`** (**the two zero-collection suites plus the `Failed Suites` entry: their rows never run,
so they report NO row at all**). **THE SUMMED TERMS RECONCILE:** the eight failing suites contribute
`58 + 58 + 68 + 69 + 60 + 94 + 87 + 78 = 572` collected tests and
`46 + 54 + 57 + 57 + 54 + 90 + 83 + 70 = 511` failures, the remaining three contribute `0 + 0 + 0`, and
**`572 − 511 = 61` passed ✔** — the `61` being **class (iii) audit and absence-branch residue, NEVER a
copy-fidelity count** (§12.2's caveat stands). **The leg's totals are unchanged and reproduce exactly:
`11 files · 572 tests · 511 failed / 61 passed`, exit `1`.** **(EVERY FIGURE IN THIS ANNOTATION IS A
RUN-READING OF THE BLIND ARTIFACT; this amendment pass re-ran nothing and read no run log — `§13.7`'s UNVERIFIED item 1.)**

**⟨CORRECTED 2026-09-28 BY THE ITEM-10d DOCUMENTATION REVIEW (finding `DR-1`) — TWO CLAUSES OF THE BLOCK ABOVE ARE IMPRECISE AND ARE KEPT AS WRITTEN; the corrected reading is stated here, and nothing above is deleted or reworded.⟩** The block above calls **`gutter.test.ts`** one of the three **ZERO-COLLECTION** suites. **MEASURED, its failure is a different KIND, and the distinction is not cosmetic:** `census.test.ts` and `gutter-ui.test.ts` **COLLECT (0 tests)** — vitest reaches the file, its static value import of an in-set module fails to resolve, and the file reports zero rows — whereas **`gutter.test.ts` never enters the collected set at all**: it is a **`Failed Suites`** entry with `Error: ENOENT … scandir '…/vendor/Provident-Electron//src'`, produced by its `REPO_ROOT = fileURLToPath(new URL('..', import.meta.url))` source-file walk. **So the leg's honest three-part reading is `2 ZERO-COLLECTION + 1 COLLECTION-FAILED`, not three of one kind** — while the **`9 COLLECTED / 2 ZERO-COLLECTION` totals and the `11 files · 572 tests · 511 failed / 61 passed` reading the block states are UNAFFECTED and stand.** **A SECOND CLAUSE IS OVER-BROAD, and it is stated as a NEW FINDING rather than an edit to the mechanism:** the block above attributes the split to *"their `../src/shared/*.js` statements are **type-only**, erased at transform, and their module is reached through the guarded dynamic `import(/* @vite-ignore */ MODULE_SPECIFIER)`"* — **as a general claim about the other nine that is FALSE.** **MEASURED (VERIFIED-BY-READ, this review pass, of `vendor/Provident-Electron/tests/*.test.ts`): exactly TWO of the ELEVEN included suites carry a STATIC VALUE (non-`import type`) specifier into the set — `census.test.ts` (`import * as delegate from '../src/shared/zones.js'`) and `gutter-ui.test.ts` (`import { POINTER_TYPES, createGestureSession } from '../src/shared/gesture-session.js'`) — and THEY ARE EXACTLY THE TWO UNCOLLECTIBLE SUITES. The other NINE carry `import type` and/or the dynamic `import(/* @vite-ignore */ MODULE_SPECIFIER)` form exclusively, and they COLLECT.** **The mechanically correct statement is therefore: a STATIC VALUE specifier into the set is what makes a vendored suite uncollectible; the `import(/* @vite-ignore */ …)` form is what keeps the other nine collectible.** The block's parenthetical for `gutter.test.ts` — *"their module is reached through the guarded dynamic `import(…MODULE_SPECIFIER)`"* — **is FALSE for that one suite**, which the next clause of the same block already concedes (its mechanism is the `REPO_ROOT` walk). **Nothing here re-opens the placement ruling or the vacuity finding: `C3`'s `9/2` totals, `C4`'s empty class (i) and `§3.5` item 7's all-fifteen bound all STAND.** **What would settle the `ENOENT` text itself:** a run of the leg at a named head (this review pass did not run it); the two mechanisms above are reads of the files and are settled by them.

**3. THE EXCLUDED SET — four suites, each with its OWN reason (the architect's `X-1` class plus one).**

| Suite | Import that is outside the vendored set (`X-1`'s class) | The divergence it would resolve to | Reason recorded |
| --- | --- | --- | --- |
| **`layout-projection.test.ts`** | **`installShim`, `mountEl`** and a `ShimElement` **type** from `../src/shared/dom-shim.js` | this repo's `src/shared/dom-shim.ts` **508** lines vs the foundation's **238** (`read`-measured; proposal reads 508 vs 237) | **`X-1` EXCLUSION — `dom-shim.js` resolves to this repo's DIVERGENT copy.** The suite would test the **fork's** shim, not the pinned one. It also reads `../src/shared/dom-shim.ts` **by path** and `../package.json`, and drives `git status --porcelain` against the repo |
| **`owned-list-host.test.ts`** | **`installShim`, `mountEl`, `ShimElement`** from `../src/shared/dom-shim.js` | as above | **`X-1` EXCLUSION — `dom-shim.js`** (the `U-LISTHOST` module itself **stays vendored**, §2.1 item 4) |
| **`slot-host.test.ts`** | **`installShim`, `mountEl`, `ShimElement`** from `../src/shared/dom-shim.js`; **and** `../src/main/security.js` + `../src/main/mcp-server.js` **by dynamic import** | as above; the two `src/main/**` modules are **the foundation's** and have no fork counterpart by that name | **`X-1` EXCLUSION — `dom-shim.js`, PLUS a second out-of-set import** (security/mcp-server). The `U-SLOTHOST` module itself **stays vendored** |
| **`mount-invariant-guard.test.ts`** | **`installShim`/`mountEl`** from `../src/shared/dom-shim.js`; **`Runtime`** from `../src/renderer/runtime.js`; **`demoEnvelope`** from `../src/shared/demo-envelope.js` | `dom-shim` as above; **`src/renderer/runtime.ts` has no foundation-sibling semantics here** (the fork's runtime is its MCP-facing producing process, ~2 000+ lines per the local inventory); **`demo-envelope.ts` `131` vs `434`** | **`X-1` EXCLUSION — THREE out-of-set imports.** The `U-MOUNTGUARD` module itself **stays vendored**; **its `reconcileMount` fix is not in the vendored set at all** (`PD-UI-10`, `C-7`/`V-3`) |

**4. THE LEG'S PASS CONDITION (scoped by this file; §0A note 3).** **⟨AMENDED 2026-09-28 — the as-filed
clause below is KEPT; the pass condition is now a NAMED SUBSET, adjudicated against the measured run
(`O-3`; §0A note 3).⟩** The leg runs the **included** suites from `vendor/Provident-Electron/tests/` under
its own config, **outside `npm test`**. **The leg's report is a PER-SUITE, PER-ROW tally, not a green/red
word.** Its contract as filed:

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
  **⟨AMENDED 2026-09-28 — this clause is TRUE ABOUT THE SUITES' CONTENT and INSUFFICIENT about their
  COLLECTIBILITY: three of the eleven collect ZERO tests where they are filed (item 2's 8+3 split), so
  "drives its module" is not the same claim as "reports a module row". The distinction is now explicit in
  the class table below.⟩**
- **`npm test`'s collected census is UNCHANGED by the leg** (§4 `P-TP-1`).

**⟨ADDED 2026-09-28 — THE RULED PASS CONDITION (a NAMED SUBSET, not a colour).⟩** Every row the leg reports
falls into exactly ONE of three classes, and **the classes are the pass condition**:

| Class | Which rows | Status | Is it copy-fidelity evidence? |
| --- | --- | --- | --- |
| **(i) EVIDENCE ROWS** | rows of the **eight collected** suites that **drive the vendored module** (the dynamic `MODULE_SPECIFIER` import and the assertions over it) and make **no** assertion about another repository's tree | **MUST PASS, or the unit is not green** — **⟨SUPERSEDED 2026-09-28 (`C4`): MEASURED, the class is RED FOR EVERY COLLECTED SUITE — `theme 46/58` · `container 57/68` · `zones 54/58` · `overlay 57/69` · `menu-template 54/60` · `relocate 90/94` · `gesture-session 83/87` · `focus-model 70/78` as `failed/collected`, each failing on the labelled module absence. The as-filed condition is KEPT and is now VACUOUS — see the restated clause below.⟩** | **YES — this is the whole of the leg's evidence** — **⟨SUPERSEDED 2026-09-28: the evidence set is EMPTY at this head, so the class supplies ZERO copy-fidelity evidence and `§3.5` item 7's bound is restated to ALL FIFTEEN modules; NO green subset may ever be reported from this leg (`C4`; `§3a` `A-1` discharged; `§13.2`).⟩** |
| **(ii) RED-BY-CONSTRUCTION, structural (`O-5`)** | **all rows of the three uncollected suites** — `gutter-ui.test.ts`, `census.test.ts`, `focus-model.test.ts` (they report **no rows at all**; the file itself fails to collect). **⟨CORRECTED 2026-09-28 (`C3`): the three are `gutter-ui.test.ts`, `census.test.ts` and `gutter.test.ts` (the last as a `Failed Suites` `ENOENT` entry) — `focus-model.test.ts` COLLECTS (`78 tests` / `70 failed`) and belongs to the class (i) row above, where it also fails.⟩** | **RED BY CONSTRUCTION — the placement is RULED (byte copies, §0A note 2) and this red can never be cleared without a foundation-side change or a `G-9` amendment** | **NO — a zero-collection suite is evidence about NOTHING** |
| **(iii) RED-BY-CONSTRUCTION, foundation-repo audit (`X-1` class; §0A note 3 (R-A))** | rows asserting the **foundation repo's own state** — the `git status --porcelain` diff-scope/allow-list audit, reads of the foundation's own `docs/specs/<unit>.md`/`-review.md`/`-greens.md`, the `docs/skills/designing-pages.md` **absence** probe, the foundation's frozen `src/shared/dom-shim.ts` read, the `../package.json` script census | **RED BY CONSTRUCTION with its reason RECORDED per row** | **NO — it measures another repository, not this copy** |

**What a future GREEN would mean, and what it would NOT.** A green of class (i) means **the vendored bytes
reproduce the pinned contract's BEHAVIOUR as the foundation's own suite observes it** — an `[T]`/`[H]`
ENVELOPE-layer reading (§5 item 6; `G-6`), **never** that this fork uses the modules correctly and **never**
app app- or live-green (`RCA-12`). **Class (ii) becomes green only** by a foundation-side specifier change
(handed off, never patched) **or** an architect ruling that amends `G-9`'s pin set so a resolver may live in
an unfrozen config. **Class (iii) becomes green only** in the foundation's own tree — i.e. **never here**.
**The DONE row's obligation is therefore a TALLY WITH CLASS LABELS AND ROW COUNTS PER CLASS**, plus the
**named** list of the two red-by-construction classes with their reasons — and **a DONE row that reports the
leg as a single green/red word, or that counts a class (ii)/(iii) red as copy-fidelity evidence, is a review
finding.**

**⟨ADDED 2026-09-28 (SECOND AMENDMENT) — THE `§3a` `A-1` RESTATEMENT, WRITTEN AS A NORMATIVE CLAUSE: THE
LEG'S PASS CONDITION IS NOW VACUOUS AS EVIDENCE, AND THIS IS THE CONTRACT (`C4`; `X-2`; `§3a` `A-1`
DISCHARGED).⟩** **`A-1` pre-committed: *"read the per-suite tally before any DONE row; if class (i) is red,
restate `§3.5` item 7's bound from three modules to all fifteen (no behaviour evidence) and escalate —
never report a green subset."* The tally HAS been read and class (i) IS red, so the branch is TAKEN. The
following four clauses are CONTRACT, not commentary:**

1. **CLASS (i) IS EMPTY, AND THE PASS CONDITION IS VACUOUS.** Every suite that collects fails its module
   drives (`C4`), so the class (i) set has **no satisfiable instance** at this head: the condition *"class
   (i) rows MUST PASS, or the unit is not green"* is **true and vacuous** — **it can neither be satisfied
   nor violated by anything this leg does.** **The leg's pass condition therefore carries ZERO evidentiary
   weight, and a DONE row, a tracker row, a blind-greens artifact or a wave spec that treats it as met
   (or as evidence about the vendored modules) is a REVIEW FINDING.**
2. **NO GREEN SUBSET MAY EVER BE REPORTED FROM THIS LEG** — not *"the eight collected suites are green
   except their module rows"*, not *"the `61 passed` are the evidence rows"*, and not any per-suite
   qualification. **The measured reading is the whole reading: `11 files · 572 tests · 511 failed / 61
   passed`, and the `61` is class (iii) audit and absence-branch residue that evidences NOTHING about
   copy fidelity** (§12.2's caveat). **A green subset is unimplementable evidence, not a stylistic
   restraint.**
3. **THE COVERAGE BOUND IS ALL FIFTEEN, NOT THREE.** The bound restated at item 7 below is **normative**:
   **all fifteen vendored modules carry NO behaviour/copy-fidelity evidence from this leg.** Item 7's
   *"three modules"* form is **superseded, kept visible there**.
4. **WHAT WOULD MAKE THE LEG EVIDENCE AGAIN — the complete list, and nothing outside it does:** (a) a
   **foundation-side** change so the vendored bytes carry **resolvable** specifiers (handed off, **never**
   patched here — `G-8`); **or** (b) an **architect ruling that amends `G-9`'s pin set** so a resolver may
   live in a config the pin does not freeze (the generated-resolver route is **RECORDED, NOT TAKEN** —
   `§0A` note 2 consequence 3 — because it would widen this unit's surface); **or** (c) a **moved
   placement** that reaches a resolvable depth, which is refused because it would move the copies **out of**
   the byte-identity the manifest's `vendored` path records. **Absent (a)/(b)/(c), the leg is RED BY
   CONSTRUCTION FOR ALL FIFTEEN MODULES and stays that way — and NO unit may quote it as copy-fidelity
   evidence in the meantime.** **`npm run divergence`'s red is unrelated and environmental** (proposal
   §7.5) and does not enter this clause.

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
  under this repo's vite/vitest is **UNVERIFIED** (§1.3); the first run settles it. **⟨AMENDED 2026-09-28:
  it is UNRESOLVED — see `§0A` note 2's ruling and item 7 below. The leg's runner and config are otherwise
  UNCHANGED (`vitest.conformance.config.ts` carries no resolver).⟩**

**7. ⟨ADDED 2026-09-28 — THE LEG'S COVERAGE BOUND (the honest counterpart of the pass condition; `O-5`).⟩**
Because the placement is ruled and three suites are uncollectible there, **three of the fifteen vendored
modules carry NO copy-fidelity evidence from this leg**: `census.ts`, `focus-model.ts` and
`gutter-affordance.ts` — the third with **two** losses, since `gutter-ui.test.ts` also carries the only
collected-suite edge into `gesture-session.ts` (the other suites reach that module by **type-only**
statements, so the **runtime** behaviour of `gesture-session.ts` is exercised through `gutter.test.ts`/
`relocate.test.ts`'s own drives only). **What still covers those three, at their own layer:** the `A2` hash
row (`§4` `P-IM-1`/`P-IM-2`) proves their **bytes**; the `A3` monitor (`§2.3`) proves their **bytes** against
the adjacent tree; the **register** (`§4` `P-IM-3`) proves their **import closure**; and **NOTHING in this
repo proves their runtime behaviour.** **A DONE row, a blind-greens artifact or a wave spec that claims
`census`/`focus-model`/`gutter-affordance` behaviour was conformance-verified BY THIS UNIT is a review
finding.** The bound is discharged only by the two routes of item 4's class (ii).

**⟨RESTATED 2026-09-28 (SECOND AMENDMENT) — THE BOUND IS NOW NORMATIVE AND ITS SCOPE IS ALL FIFTEEN
MODULES. The paragraph above is KEPT as the first amendment's reading; its *"three of the fifteen"* form is
SUPERSEDED and its three-member list is WRONG IN MEMBERSHIP (`C3`/`C4`; `§3a` `A-1` DISCHARGED).⟩**
**THE CLAUSE (normative):**

1. **ALL FIFTEEN vendored modules carry NO behaviour/copy-fidelity evidence from the conformance leg at
   this head.** The measured reason is not three uncollectible suites but **the resolution fault itself
   (`X-2`: three resolution forms, one wrong target)**: the three zero-collection suites contribute **no
   rows at all** (`census.test.ts`, `gutter-ui.test.ts`, **`gutter.test.ts`** — the last as a `Failed
   Suites` entry), and **every suite that does collect fails its module drives** (`C4`: `theme 46/58` ·
   `container 57/68` · `zones 54/58` · `overlay 57/69` · `menu-template 54/60` · `relocate 90/94` ·
   `gesture-session 83/87` · `focus-model 70/78`, `failed/collected`). **The corrected membership of the
   ZERO-COLLECTION set — the as-filed *"`census.ts`, `focus-model.ts`, `gutter-affordance.ts`"* — is
   therefore `census.ts`, `gutter-affordance.ts` and `gutter.ts` for the zero-collection cause, and ALL
   FIFTEEN for the evidence cause.** **`focus-model.ts` is NOT one of the zero-collection three** (its
   suite collects `78 tests` and is driven), and **`focus-model.ts`'s mechanism claim in the first
   amendment is wrong** (`X-1`; `X-3`; `X-6`).
2. **What still covers the fifteen, at their own layers, and NOTHING else does:** the `A2` hash row (`§4`
   `P-IM-1`/`P-IM-2`) proves their **bytes**; the `A3` monitor (`§2.3`) proves their **bytes** against the
   adjacent tree; the monitor's revision arm (`§3a` `A-3`) proves the **pin**; the **register** (`§4`
   `P-IM-3`) proves their **import closure**; and **NOTHING IN THIS REPO PROVES THEIR RUNTIME BEHAVIOUR.**
3. **The prohibition is now ALL-FIFTEEN-WIDE, not three-module-wide.** A DONE row, a tracker row, a
   blind-greens artifact or a wave spec that claims **ANY** vendored module's behaviour was
   conformance-verified **BY THIS UNIT** — whether `census`/`gutter-affordance`/`gutter`, `focus-model`,
   `theme`, `zones`, `container`, `overlay`, `menu-template`, `relocate` or `gesture-session` — is a
   **review finding**. **A green subset may not be reported** (item 4's added clause 2).
4. **The bound is discharged ONLY by item 4's clause 4 routes (a)/(b)/(c)** — a foundation-side specifier
   change (handed off, never patched), a `G-9` pin-set amendment (the architect's), or a moved placement
   (refused: it breaks the byte-identity the manifest records). **`gutter-ui.test.ts`'s loss of the only
   collected-suite edge into `gesture-session.ts` remains a REAL loss inside this bound** (the other
   suites reach that module by **type-only** statements), but it is **no longer the operative
   distinction**: at this head **no** suite supplies behaviour evidence.

### 3.6 The protected pins this unit brushes — and how each is re-derived **in the same commit**

| Pin (all in `tests/unit-v5-migration-contract.test.ts` unless stated) | What it pins | What this unit does to it | How it is re-derived in the same commit |
| --- | --- | --- | --- |
| **The bridge-mock census** | the **exact five-name set** of `tests/**` files that call `vi.mock('electron')`, **derived** by scanning `tests/**/*.test.ts` | **adds ONE file to `tests/**`** (the `A2` row) — which **does not mock electron**, so the derived set is **unchanged** | **re-run the pin**; the assertion's own five names are **untouched** (no edit to the pinned list, ever) |
| **`vitest.config.ts` `testTimeout`** | **exactly `15_000`** — floor **and** ceiling, both asserted | **no edit to `vitest.config.ts` at all** | nothing to re-derive; the row is green **because the file is byte-unchanged** |
| **`package.json` test scripts** | `scripts.test` / `scripts.test:watch` carry no `--testTimeout` | **TWO added keys** (`conformance`, `drift`) **⟨AMENDED 2026-09-28: the as-filed row said ONE; the second was already permitted by §2.5's *"one of the two is REQUIRED"* clause, and the pinned values are untouched — a new key is NOT a `G-9` pin (`R-7`).⟩**; the two pinned values are **unedited** | the row reads `package.json` and asserts **the pinned values**, which still hold; the **new keys are named in the DONE row** so a reader sees the add |
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
| 1 | **`P-IM-1`** | **⟨`A-13` LABEL — THIS ROW'S TERM IS `DECLARED, NOT EXECUTED`.⟩** **DECLARED, NOT EXECUTED:** the `19` is **declared** (the fifteen names of the pin are the domain, and `4` controls are named), **asserted rather than produced** — **no generator was run for the term, and no landed artifact carries a per-row held/broken census**. The term is a **literal arithmetic shape**, not a reading. **THE SET IS EXACTLY THE FIFTEEN, AND EVERY MEMBER IS BYTE-IDENTICAL TO THE PIN.** For every module in the pin's fifteen-name list: `src/shared/<name>.ts` exists; its `md5` equals the manifest's `md5` for that name; the manifest's `vendored` path equals its `source` path; and the set of names in `src/shared/` that the manifest claims is **set-equal** to the pin's list — **no sixteenth, no fourteenth**. **Control (discriminating):** a synthetic manifest that **adds** a name, **drops** a name, or **perturbs one character** of a digest **MUST fail** the same oracle. | **strategy `strat:vendor-set-identity`** — enumerate the fifteen (the pin's list is the pool; `15` declared observations) **plus four synthetic controls** (one added name, one dropped name, one perturbed digest, one renamed file) | **19** = `15` modules + `4` controls — **DECLARED, NOT EXECUTED** | **NO** — the domain **is** the fifteen, matched exactly |
| 2 | **`P-IM-2`** | **⟨`A-13` LABEL — THIS ROW'S TERM IS `DECLARED, NOT EXECUTED`.⟩** **DECLARED, NOT EXECUTED:** the `17` is **declared** and **asserted rather than produced** — **no generator was run; no landed artifact carries a per-row held/broken census**, and the row's only landed reader is the literal tautology of its own arithmetic. **THE PIN REPRODUCES.** For every manifest entry, `proposalTableAgreement ∈ {REPRODUCED, DISAGREES}` — **never `NOT-RECOMPUTED`** — and **every `DISAGREES` entry has a finding row** in `docs/defects.md` naming the module and both digests; the manifest's `foundation.commit` equals the pinned revision, and `digestCommand` is a non-empty command string. **Control:** a manifest entry with `NOT-RECOMPUTED` **MUST fail**, and a manifest with `DISAGREES` and **no** finding row **MUST fail**. | **strategy `strat:pin-reproduction`** — the fifteen entries + the two synthetic controls | **17** = `15` + `2` controls — **DECLARED, NOT EXECUTED** | **NO** — a closed enumeration over the manifest's own keys |
| 3 | **`P-IM-3`** | **IMPORT CLOSURE HOLDS.** For every manifest entry, the resolved import graph of the vendored file contains **only** set-internal specifiers; `importCensus.outOfSetImports` is **empty**; and the five recorded internal edges are **exactly** the set-internal edges the files carry (a **missing** edge and an **extra** edge both fail). **Control:** a synthetic edge `theme → dom-shim` **MUST fail**; a synthetic edge list with a *dropped* in-set edge **MUST fail**. **⟨AMENDED 2026-09-28 — *"the five recorded internal edges are **exactly** the set-internal edges the files carry"* is KEPT and is the right side of `C-AM-2`: the comparison is a **DISTINCT-EDGE** set of `5` records, while the files carry **6 statements** (§2.1 item 5's arithmetic block). A row comparing six statement-derived edges to the five records measures the wrong quantity — the remand is §12 item 3(b).⟩** | **strategy `strat:import-closure`** — the fifteen files' statements + the recorded edge list + 2 synthetic edge sets | **17** = `15` + `2` controls | **NO** for this set; **`(bounded)` ON THE CLOSURE READING** — see the bounded note below |
| 4 | **`P-SM-1`** | **NOTHING `G-9` PINS IS DISTURBED.** (a) The bridge-mock census derived by scanning `tests/**/*.test.ts` for a top-level `vi.mock('electron', …)` call is **exactly the five pinned names**, and **the `A2` row is not among them**; (b) `vitest.config.ts`'s `testTimeout` is **exactly `15_000`** and the file's text carries **no** forbidden override (`clearMocks`/`restoreMocks`/`mockReset`/`isolate`/`pool`/`poolOptions`); (c) `package.json`'s `scripts.test` and `scripts.test:watch` are the pinned values, each carrying **no `--testTimeout`**; (d) the four baseline files are **byte-unchanged against their pre-vendoring bytes**. **Control:** a synthetic `tests/**` file containing a `vi.mock('electron', …)` call **MUST** join the census (proving the census is derived, not hard-coded), and a synthetic config carrying `clearMocks: false` **MUST fail** the text oracle. | **strategy `strat:protected-pin-safety`** — enumerate the pins (`4` pin classes) × the derived readings, plus `1` synthetic mock file and `1` synthetic config | **12** = `4` pin classes × `2` + `4` controls | **NO** — the pin classes are enumerated exactly |
| 5 | **`P-SM-2`** | **THE FOUR BASELINE FILES ARE NOT REPLACED, AND NO VENDORED MODULE IS A BASELINE FILE.** For each of `dom-shim.ts`/`types.ts`/`demo-envelope.ts`/`path-fork-cycle.ts`: the file's digest equals its **pre-vendoring** digest (a recorded reading, taken at the unit's first red run), and its name is **absent** from the manifest's `modules`; and **conversely** no set member's name appears in `baselineFilesNotReplaced`. **Control:** a manifest that lists `dom-shim` as a module **MUST fail**. | **strategy `strat:baseline-non-replacement`** — the four files × two facts + the converse over the fifteen | **10** = `4` + `1` control + `5` converse spot-checks | **NO** — a closed enumeration |
| 6 | **`P-TP-1`** | **THE `A2` ROW DISCRIMINATES THE SHIPPED FILE FROM THE COPY.** An oracle reading the **`vendor/`-tree copy** or a **hard-coded digest constant** **MUST** be distinguishable from the required one: **given a synthetic perturbation of ONE byte in `src/shared/<x>.ts`, the required oracle fails** while a mutation of the `vendor/`-tree copy **does not** change its verdict. (This is the row that makes §0A note 4 falsifiable.) **⟨CORRECTED 2026-09-28 — the property above is KEPT as filed and is UNIMPLEMENTABLE AS WORDED; the CORRECTED PROPERTY is stated immediately after the register table (`§4.1`). The row id is KEPT, the attempts term is KEPT (`8`), and the falsification is `C-AM-1`.⟩** | **strategy `strat:hash-target-discrimination`** — one real module drawn by the pinned LCG over the fifteen, plus a synthetic perturbation pair (shipped-file mutation / copy mutation) | **8** = `1` drawn module × `2` perturbation targets × `2` readings × `2` runs | **NO** — the discrimination is one paired comparison, repeated across two draws |
| 7 | **`P-TP-2`** | **⟨`A-13` LABEL — THIS ROW'S TERM IS `DECLARED, NOT EXECUTED`.⟩** **DECLARED, NOT EXECUTED:** the `20` is **declared** and **asserted rather than produced** — **no generator was run for the term, and no landed artifact carries a per-row held/broken census**; the rows that DRIVE the five situations are landed (§6.1 item 2's comparator), but the term itself is an arithmetic shape, not a produced reading. **THE MONITOR IS TOTAL OVER ITS FIVE DECLARED SITUATIONS.** For each of: *(1)* foundation tree present and identical ⇒ `CLEAN`, exit `0`; *(2)* present and differing ⇒ named differences, non-zero exit; *(3)* **absent ⇒ `SKIPPED`, exit `0`, NOT a failure**; *(4)* manifest missing/unparsable/`moduleCount ≠ 15` ⇒ loud failure, non-zero exit; *(5)* a vendored module missing ⇒ loud failure naming the path — **nothing throws an unhandled exception in any of the five, and no situation is silently a pass**. **Control:** a synthetic absent-tree case **MUST** print `SKIPPED` and exit `0`, and a synthetic `moduleCount: 14` **MUST** exit non-zero. **⟨AMENDED 2026-09-28 (`A-3`): the `CLEAN` situation now also requires the tree's own REVISION to equal the manifest's `foundation.commit`; a byte-equal tree at another commit is a PIN FAULT, never `CLEAN`.⟩** | **strategy `strat:monitor-situations`** — the five declared situations (`5` declared) × `2` drives each, plus `10` injection shapes (each situation driven from a real temp tree **and** from an injected answer) | **20** = `5` × `2` + `10` — **DECLARED, NOT EXECUTED** | **NO** — the five situations are the module's whole declared surface |
| 8 | **`P-IM-4`** *(**ADDED 2026-09-28** — the `O-7` obligation became row-bearing. **Appended as row 8 so NO as-filed row's `#` moves**; its class is `P-IM`, so the class tally prints it out of numeric order, which is stated rather than smoothed.)* | **THE FIVE UNEXPORTED SHAPES ARE RE-DECLARED BY THIS REPO — AND THE VENDORED BYTES STILL DO NOT EXPORT THEM.** For each of `GestureSession`, `RelocateResetResult`, `FocusResult`, `FocusRefusal`, `FocusTransitionArg`: **the re-declaration file `src/shared/foundation-return-shapes.ts` exists and exports it**; **and simultaneously** each shape remains **NON-EXPORTED in its vendored module** (`src/shared/gesture-session.ts`, `src/shared/relocate.ts`, `src/shared/focus-model.ts`), so `P-IM-1`'s byte-identity is not "fixed" by an added `export`. **The file is type-only:** it carries **no import of any kind** (so it cannot become a sixteenth edge, `P-IM-3`) and **is neither a manifest-claimed member nor a baseline file** (`P-IM-1`, `P-SM-2`). **Control (discriminating BOTH ways):** a **synthetic** re-declaration text missing ONE of the five **MUST fail** the same oracle, and a **synthetic** added `export` on a vendored shape **MUST fail** the non-exported half — **the two halves must not be satisfiable by one and the same synthetic text** (which is what makes the row non-vacuous). | **strategy `strat:return-shape-redeclaration`** — the five shapes × two facts (re-declared at the path / still non-exported in the bytes) + `2` synthetic controls (one missing declaration, one added `export`) | **12** = `5` × `2` + `2` controls | **NO** — the five names are a closed pinned set, matched exactly |

**Class tally:** `P-IM` ×3 (`P-IM-1`..3) · `P-SM` ×2 (`P-SM-1`, `P-SM-2`) · `P-TP` ×2 (`P-TP-1`, `P-TP-2`)
= **7 rows ≤ 8** ✔ — **⟨AMENDED 2026-09-28: the as-filed tally above is KEPT; the register now carries `8`
rows.**⟩** **Current tally: `P-IM` ×4 (`P-IM-1`..3 **and `P-IM-4`**, row 8) · `P-SM` ×2 · `P-TP` ×2 =
**8 rows = the register's ceiling, exactly** ✔ — the cap is `≤ 8` and it is now **FULL**, so **a further row
requires retiring one, and no further row is proposed by this amendment.**

**Attempt tally, printed with its terms (as filed, KEPT as provenance):**
**`19` (`P-IM-1`) + `17` (`P-IM-2`) + `17` (`P-IM-3`) + `12` (`P-SM-1`) + `10` (`P-SM-2`) + `8` (`P-TP-1`) +
`20` (`P-TP-2`) = `103` attempts**, every row **≤ 100** ✔, **stop-after-5** ✔.

**⟨AMENDED 2026-09-28 — CURRENT ATTEMPT TALLY, printed with its terms, so the sum and its terms stay
coherent (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`).⟩** **`103` (the as-filed total above) + `12`
(`P-IM-4`, the row ADDED by this amendment) = `115` attempts**, still **≤ 120 in total** ✔, every row
**≤ 100** ✔, **stop-after-5** ✔. **The `P-TP-1` term is UNCHANGED at `8`** — this amendment changes that
row's **property text**, never its arithmetic (`C-AM-1`: its two readings remain `2` perturbation targets ×
`2` readings × `2` runs × `1` drawn module). **Provenance of the delta:** the `+12` is exactly the new
row's `5 × 2 + 2 controls`, so **the printed total's terms are `19 + 17 + 17 + 12 + 10 + 8 + 20 + 12 = 115`**.

**⟨ADDED 2026-09-28 (Implementer pass) — THE REGISTER'S PER-ROW `EXECUTED`/`DECLARED` CENSUS (`§3a` `A-13`'s
second offered option, TAKEN).⟩** `§3a` `A-13` records that the register's *"115 attempts / 0 broken /
stop-after-5 not triggered"* exists in **no landed artifact**, that **6 of 8 rows have no generator**, and that
**three terms are literal tautologies**; its correction offers two routes — *"carry a per-row held/broken
census"* **or** *"label its terms `declared, not executed`"*. **The second route is TAKEN**, because a
held/broken census cannot be produced without running the generators, and **no generator was run for these
three terms**. **The label is carried IN THE ROW CELLS above** (row 1 `P-IM-1`, row 2 `P-IM-2`, row 7
`P-TP-2`) and printed as the census below, terms included:

| Row | Terms | Kind | Why |
| --- | --- | --- | --- |
| **`P-IM-1`** | **`19`** | **`DECLARED, NOT EXECUTED`** | the fifteen names are the pin's own pool and the `4` controls are named; **no generator produces the term** — its only landed reader is its own arithmetic |
| **`P-IM-2`** | **`17`** | **`DECLARED, NOT EXECUTED`** | the closed enumeration over the manifest's own keys; **no generator** |
| **`P-IM-3`** | **`17`** | **`EXECUTED`** | the fifteen files' import statements are read (now by the **AST** oracle of `§3a` `A-10`) and the two synthetic edge sets are driven |
| **`P-SM-1`** | **`12`** | **`MIXED`** | the pin classes are read from the tree and the two synthetic controls are driven; the `4 × 2 + 4` shape is declared |
| **`P-SM-2`** | **`10`** | **`EXECUTED`** | the four files' digests and the converse over the fifteen are read |
| **`P-TP-1`** | **`8`** | **`MIXED`** | the drawn module is driven by the pinned LCG and the `(FAIL, PASS)` oracle pair is driven (§4.1); the `1 × 2 × 2 × 2` shape is declared |
| **`P-TP-2`** | **`20`** | **`DECLARED, NOT EXECUTED`** | the five situations **are** driven through the pure comparator, but the term itself is an arithmetic shape and **no generator produces it** |
| **`P-IM-4`** | **`12`** | **`MIXED`** | the five shapes × two facts are read from the real texts and the two synthetic controls are driven; the `5 × 2 + 2` shape is declared |

**The census's two halves:** the three `DECLARED, NOT EXECUTED` terms are
**`19 + 17 + 20 = 56` of the `115` declared attempts** — **no executed reader exists for them**, and a
reading that quotes the `115` without this census is the artifact `A-13` says does not exist. **The
remaining `115 − 56 = 59`** are `EXECUTED` (`P-IM-3` `17` + `P-SM-2` `10` = `27`) or `MIXED`
(`P-SM-1` `12` + `P-TP-1` `8` + `P-IM-4` `12` = `32`), whose rows **are** driven against the landed tree.
**This is a LABEL, not a green:** it changes no row's colour and closes no row's over-strength judgement
(`A-3`/`A-10` are closed by `§3a`'s own `HOST-FIX` corrections in `scripts/foundation-drift.mjs`; `A-11`'s
mirror gap is closed by the exported AST member oracle).

**⟨CORRECTED 2026-09-28 BY THE ITEM-10d DOCUMENTATION REVIEW (finding `DR-2`) — THE PER-ROW CENSUS ABOVE AND THE LANDED TEST'S OWN CENSUS DISAGREE ON WHICH TERMS ARE `EXECUTED`; BOTH READINGS ARE KEPT AND THE CONTRADICTION IS FILED, NOT SMOOTHED.⟩** **The spec's census above assigns:** `DECLARED, NOT EXECUTED` to `P-IM-1` (`19`), `P-IM-2` (`17`) and `P-TP-2` (`20`) = `56` of `115` — **with `P-IM-3`, `P-SM-2` `EXECUTED` and `P-SM-1`, `P-TP-1`, `P-IM-4` `MIXED`.** **The landed artifact asserts a different split:** `tests/pd-vendor-manifest.test.ts`'s own census rows read **`['P-IM-3:EXECUTED', 'P-SM-1:EXECUTED', 'P-SM-2:EXECUTED', 'P-TP-1:EXECUTED', 'P-IM-4:EXECUTED']`** — i.e. **five rows `EXECUTED`, including the two the spec calls `MIXED`** — while the same file's declared-shape census names **`P-TP-1`'s `1*2*2*2`, `P-SM-1`'s `4*2+4` and `P-IM-4`'s `5*2+2`** as the terms *"a term that is ASSERTED rather than produced"*. **MEASURED (VERIFIED-BY-READ of `tests/pd-vendor-manifest.test.ts`, this review pass — the row titles `§4 P-IM-4 …`, the `EXECUTED`-labelled census rows and the three declared shapes above): the landed census and the spec's census cannot both be the contract, and the landed file does not contain `P-IM-3:EXECUTED`-contradicting text either way — `P-IM-3` is `EXECUTED` in BOTH readings, so the live disagreement is exactly `P-SM-1`, `P-TP-1` and `P-IM-4` (spec: `MIXED`; landed test: `EXECUTED`).** **This review does NOT adjudicate it (`A-13`'s two routes were the register's to choose, and a register-vs-row contradiction is a CONTRACT question — `§12`'s discipline forbids a doc review "fixing" a contract clause on its own authority). It is recorded as a NEW FINDING (`DR-2`) with its evidence, and the two readings stand side by side.** **What would settle it:** the TestWriter's or the architect's adjudication of whether `MIXED` and `EXECUTED` denote the same thing (a `MIXED` row whose controls are driven may have been labelled `EXECUTED` deliberately), or a restatement of whichever side is wrong. **The `115`-attempt total, the `≤100`/`≤120` caps and the `56`/`59` halves of the census above are UNCHANGED by this note.**

**§4.1 — THE CORRECTED `P-TP-1` PROPERTY (the row that was unsatisfiable as worded; `C-AM-1`).**

**Why the as-filed text cannot be implemented.** The row requires a **paired comparison** whose two readings
are driven by the **identical perturbed closure** (one byte perturbed in `src/shared/<x>.ts`), and then
requires the required oracle's verdict to be **`FAIL` in reading 1** and **`PASS` in reading 2**. **One
oracle over one closure has ONE verdict**, so the row demands `md5(synth) === declared` **and**
`md5(synth) !== declared` **at once — a strict contradiction for every draw and every manifest.** **The
as-filed wording is the wrong side; the SPEC's own §0A note 4 / §2.4 item 3 / §3.2 items 3–4 are the
contract** (the `A2` oracle hashes **`src/shared/<x>.ts`**, the shipped file, against the manifest's
declared `md5`).

**The corrected property, stated precisely enough to implement.** Draw **one** module with the pinned LCG
(seed `0x20260927`, one step per draw) and let `declared = entry.md5`, `vendored = entry.vendored`
(the **shipped** path, `src/shared/<name>.ts`). Then, for **each** of the two perturbation targets (the
**shipped** file, and the **`vendor/`-tree copy** *if a copy exists at a path the row computes*):

1. **THE REAL READING, on the UNPERTURBED tree:** the required oracle reads the **shipped** file and
   returns `PASS` **iff** `md5(shippedBytes) === declared`. **This is the only reading that says the shipped
   file is pinned.** Its control direction is the perturbation: **with ONE byte perturbed in the shipped
   file, the required oracle MUST `FAIL`** — that is the row's discriminating comparison and it needs **no
   second closure**.
2. **THE DISCRIMINATION — stated as a property of a *pair of oracles*, never as two verdicts of one:**
   define `oracleShipped(...)` (hash target = the shipped path) and `oracleCopy(...)` (hash target =
   `vendor/Provident-Electron/tests/`-tree copy or any hard-coded digest constant). **Given ONE byte
   perturbed in `src/shared/<x>.ts`, `oracleShipped` MUST fail and `oracleCopy` MUST still pass** — because
   the mutation is of the file the first one reads and **not** of the file the second one reads. **The
   two-oracle verdicts on the SAME perturbed closure are `(FAIL, PASS)`**, and **that pair — not equality
   between one oracle's two verdicts — is the falsifiable content.** A row that reads the copy, or that
   hard-codes the digest, **fails to produce the `(FAIL, PASS)` pair** and is thereby distinguishable from
   the required oracle.
3. **The copy-reading's own control, stated so it is not vacuous:** if the row's `vendor/`-tree copy does
   **not** exist as a separate file, reading 2 is driven against a **synthetic copy target** (a temp path
   holding the unperturbed shipped bytes) and the row says so; **the row MUST NOT claim a copy-reading
   result it did not take.**
4. **Retained from the as-filed row, unchanged:** one `it` per drawn run, `2 runs`, the pinned seed, the
   `8` attempts term, and the two source-text assertions (`shippedPathFor` present; no
   `vendor/**/shared`-targeted hash read) that pin `§0A` note 4's discrimination **in the row's own source**.
   **⟨The four sub-clauses above supersede only the row's *mechanism*, never its *purpose*: the purpose —
   an oracle reading the copy, or a constant, must be distinguishable from the required one — is the
   spec's and stays binding.⟩**

**THE `(bounded)` DECLARATIONS, and what they do NOT prove.** **`7` of the `7` rows are `NO`** — each drives
a **closed, pinned enumeration** that matches its property text exactly, **with one recorded carve-out**:
**`P-IM-3` carries `(bounded) ON THE CLOSURE READING`**, because the row's closure claim is asserted from
**this pass's read of the fifteen files' import statements** (MEASURED, §2.1 item 5) — a read is not a
runtime import-graph walk, and **a transitive edge introduced by a future edit would be caught only by
re-running the row, not by the row's existence**. **The `P-IM-3` bound is therefore stated, not hidden.**
**⟨AMENDED 2026-09-28 — the paragraph above is KEPT; with the added row the current reading is `8` of the
`8` rows `NO`, the single carve-out still `P-IM-3`'s. `P-IM-4` is `NO` for the same reason as its siblings:
the five shape names are a closed, pinned set and the row matches it exactly.⟩**

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

**⟨ADDED 2026-09-28 — TWO MORE ROWS CONSIDERED AND REJECTED BY THIS AMENDMENT (recorded so a later pass does
not re-add them, and so the register's FULL cap is not read as an oversight).⟩**

- *"the three uncollected suites become collectible here"* — **rejected**: that is **not a property of this
  repo's code**, it is a change to the vendored bytes (forbidden by `P-IM-1`/`V-5`) or to the foundation
  (forbidden by `G-8`) or to `G-9`'s pin set (the architect's). `§3.5` item 4's class (ii) records the red
  instead of asserting a green, and `§3.5` item 7 records the coverage bound. **A row here would be a false
  obligation** — the same reasoning that rejected *"`npm run divergence` becomes green"*.
- *"the conformance leg's pass condition is green"* — **rejected**: the leg's pass condition is a **named
  SUBSET** (§3.5 item 4), not a colour, and a row asserting the whole leg green would **contradict the
  measured run** (3 of 11 suites collect zero tests). **The class labels are the contract; a green word is
  not.**

## 5. What this unit does NOT claim (the layer ledger)

1. **No app-green, no envelope-green-as-app, no live green.** No claim in this file is evidence that the
   Electron app boots, renders, or behaves (`RCA-12`; `G-6`).
2. **No `divergence` green, and no live-battery green.** The `divergence` leg is RED at the branch head for an
   **environmental** reason and is **mandatory pre-live** (`A-7`) — a precondition this unit **records and
   passes through**, never satisfies (§9 item 1).
3. **No `battery` claim beyond the recorded reading** (`184 checks, 0 failures`, `[H]`, proposal §7.5) — this
   unit **does not re-run it**; §8 marks it as the unit's own obligation. **⟨AMENDED 2026-09-28: the
   supervisor's run read the battery at `184/0` GREEN (RUN-READING); it is a HARNESS reading — a battery
   green is harness-green, never app-green (§8), and this amendment re-ran nothing.⟩**
4. **No engine claim.** The engine half of the program is `BLOCKED-ON-ENGINE` and is not in this gate
   (proposal §4.3; `G-3`).
5. **No consumer-correctness claim.** The vendored modules are imported by **nothing** in this repo at the
   end of this unit (§2.1 item 6); whether the fork USES them correctly is each wave's own evidence.
6. **No claim that the conformance leg is green** (§1.3 `O-3`, §3.5 item 4). The DONE row reports the tally.
   **⟨AMENDED 2026-09-28 — this clause is now the PASS CONDITION, not only a disclaimer: the leg's colour is
   `RED` by construction on two named classes (§3.5 item 4), its evidence is the class (i) subset, and
   THREE modules (`census`, `focus-model`, `gutter-affordance`) carry no behaviour evidence at all (§3.5
   item 7). A green word here is impossible and would be a review finding.⟩** **⟨AMENDED 2026-09-28
   (SECOND AMENDMENT, `C4`) — STRONGER AND SIMPLER: the class (i) subset is **EMPTY**, so the leg carries
   **ZERO** copy-fidelity evidence and **ALL FIFTEEN** modules carry no behaviour evidence (§3.5 item 7's
   restated normative bound); the three-member list above is SUPERSEDED in both membership and scope
   (`census`, `gutter-affordance`, `gutter` for the zero-collection cause; **all fifteen** for the evidence
   cause). **No green subset may be reported from this leg, and this clause's own claim is a layer
   declaration — envelope/tooling, never app.**⟩**
7. **⟨ADDED 2026-09-28.⟩ No claim that the five re-declared shapes MATCH the foundation's actual returned
   values.** `P-IM-4` asserts **declaration presence and the five-name set**; structural equivalence to the
   returned values is the **vendored suites'** envelope-layer reading and is **partly uncollected**
   (`focus-model.test.ts` is one of the three, §3.5 item 2) — so this unit claims the **declaration**, never
   the equivalence. **⟨CORRECTED 2026-09-28 (SECOND AMENDMENT) — `focus-model.test.ts` is **NOT** one of the
   three (`C3`): the three are `census.test.ts`, `gutter-ui.test.ts` and `gutter.test.ts`, and
   `focus-model.test.ts` **COLLECTS** (`78 tests` / `70 failed`). The clause's CONCLUSION is stronger than
   it was filed: **no suite in the leg supplies behaviour evidence for ANY module** — all fifteen are
   uncovered (`C4`; `§3.5` items 2/7) — so the equivalence is unclaimed for a larger reason than this
   parenthesis states.⟩**
8. **⟨ADDED 2026-09-28.⟩ No claim that the three row corrections of §12 item 3 are LANDED.** They are
   **REMANDS to the TestWriter**; while they stand unimplemented, the landed reading `113 pass / 3 fail` is
   the honest figure and **the unit is not green**. **⟨AMENDED 2026-09-28 (SECOND AMENDMENT, `X-4`) — THE
   REMANDS HAVE LANDED AND THIS CLAUSE IS THEREFORE SATISFIED, NOT OPEN: the three landed
   `tests/pd-vendor-*.test.ts` files now read `148 passed (148)` / `0 failed`, so the row count is `148`
   (not `116`) and the *"unit is not green"* consequence **no longer attaches to any unimplemented remand**.
   The clause's FORM stays binding: a future remand that stands unimplemented makes this clause
   operative again. The `113/3`-of-`116` reading is KEPT as the earlier tree state's reading.⟩**

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

**⟨AMENDED 2026-09-28 — WHERE EACH OBLIGATION STANDS (RUN-READING; this amendment discharged none of
them by its own execution).⟩** ①–③ **DISCHARGED BY THE SUPERVISOR'S RUN**: the digest run reproduced the
proposal's §2 table **15/15** (`REPRODUCED`), the revision was confirmed, and no disagreement needed a
finding row. ④ **RULED by this amendment** — the placement **stands** (§0A note 2). ⑤ **RULED by this
amendment** — the pass condition is the **named subset** (§3.5 item 4). ⑥ **READ by the supervisor's run**:
`npm test` **204 files (3 failed / 201 passed) · 4352 tests (4 failed / 4303 passed / 45 skipped)** as the
post-landing reading; the **pre-vendoring** baseline reading is the proposal's recorded
`1 failed file / 200 passed (201 files)` (§3.6's table), and **`O-8`'s suite-count disagreement is NOT
resolved by this amendment — the two figures above are different tree states, not a reconciliation**
**⟨2026-09-28 (SECOND AMENDMENT, `X-4`) — obligation ⑥'s post-landing figure is SUPERSEDED: the blind pass
read `204 files (1 failed / 203 passed) · 4384 tests (1 failed / 4338 passed / 45 skipped)`, the one red
being the CARRIED BRANCH BASELINE, and the unit's own `pd-vendor` rows `148 passed (148)`. `O-8` remains
UNRESOLVED and this amendment does not reconcile it either — the figures now number five from at least
three tree states.⟩**
(UNVERIFIED, §12 item 5). **The order obligation ④⑤ states was met in NEITHER direction cleanly, and that is
recorded rather than smoothed: the red set was authored and RUN before this amendment took the ④/⑤
rulings, so the first run is the evidence that MADE the rulings necessary** — which is why the corrections
in §12 item 3 are **remands**, not retroactive edits. **A red set authored before ①–③ remains a review
finding, and it does not apply here: ①–③ were discharged by the run that produced the red set's reading.**

---

## 7. Decisions and defaults (recorded, so no later pass re-derives them)

| # | Decision | Default taken |
| --- | --- | --- |
| **`D-1`** | Where the per-module digest lives | **`vendor/foundation.lock.json` only**; **no prose md5 table in `docs/**`** (`A-8`; §0A note 5) |
| **`D-2`** | The vendored-suite placement | **`vendor/Provident-Electron/tests/`** (§0A note 2) — escalated as `O-2`. **⟨AMENDED 2026-09-28: RULED — the placement STANDS as BYTE COPIES; `G-9` forbids collecting them under the main config, the bytes may not be edited, and the foundation may not be patched. The leg is RED BY CONSTRUCTION on three suites (`O-5`); a generated resolver in `vitest.conformance.config.ts` is ESCALATED, NOT TAKEN (§0A note 2 consequence 3).⟩** |
| **`D-3`** | How the leg is kept out of `npm test` | **its own config + its own script**; `vitest.config.ts` **unedited** (`G-9`) |
| **`D-4`** | How the leg is reported | **a per-suite, per-row tally with the audit rows named** — never a single green word (§3.5 item 4). **⟨AMENDED 2026-09-28: the tally now carries THREE CLASS LABELS — (i) evidence rows (must pass) · (ii) structural RED-BY-CONSTRUCTION (`O-5`, three uncollected suites) · (iii) foundation-repo audit RED-BY-CONSTRUCTION (`X-1`). A class (ii)/(iii) red counted as copy-fidelity evidence is a review finding.⟩** |
| **`D-5`** | `G-4`'s scope while its premise is stale | **carried as scoped** (R-9): a local write path for **engine-owned data** may not be removed; the `PD-UI-2` CSS-write replacement is **not** forbidden — **whose evidence is `PD-UI-2`'s** |
| **`D-6`** | The `SCH` withdrawal wave (`Q-F`, `R-6`) | **already ruled by the architect**; **this unit references it and does not re-open it** — a vendoring spec may not sequence another unit's tracker work |
| **`D-7`** | The `PD-UI-11`/`PD-UI-12` rows | **their status is RECORDED, not re-decided** (§2.1 items 3–4). **No vendoring pass may re-open a `KEEP` row, and `Q-E` stays the architect's** |
| **`D-8`** | Whether the vendoring unit's spec carries a register | **YES — 7 typed rows** (§4); the zero-row exemption is **not available** to a code-bearing unit. **⟨AMENDED 2026-09-28: 8 rows — the register is now FULL at its ceiling** (`P-IM-4` added for `O-7`; `103` → `115` attempts). A further row requires retiring one.⟩** |
| **`D-9`** | Whether this unit edits `docs/skills/designing-pages.md` | **NO — it does not exist in this repo** (§0A note 10). No coverage-matrix row, no demo-page entry; the honest form is an **absence row** (§9 item 5) |
| **`D-10`** | Whether this unit writes a new `docs/decisions.md` row | **NO.** The pin's record is the manifest (§0A note 5); the row that governs the model **already exists** (`R-1`'s citation) |
| **`D-11`** | *(**ADDED 2026-09-28**)* Where the five unexported return shapes are re-declared | **`src/shared/foundation-return-shapes.ts`** — a **fork-local, type-only** file, **not** a vendored member and **not** a baseline file (§0A note 7; §1.2; §2.1 item 7; §4 `P-IM-4`). **The foundation is never patched**; the export gap is **handed off** (§9 item 8) |
| **`D-12`** | *(**ADDED 2026-09-28**)* Whether this amendment edits a test file to make a row pass | **NO — NEVER.** The three contradictions are **REMANDS** to the TestWriter (§12 item 3). **A spec may not edit a test**, and the implementer's refusal to do so was **correct** |

---

## 8. Verification (which leg covers which layer — and the unit's own obligations)

| Leg | What it covers | Layer | This unit's obligation |
| --- | --- | --- | --- |
| **`npm test`** (`vitest run`) | the `A2` row, the register's rows, and the **unchanged** existing suite | harness/`[T]` | the DONE row prints the **BEFORE → AFTER** file/test/skip counts **in the same commit** (§3.6). **⟨AMENDED 2026-09-28: the AFTER reading is `204 files (3 failed / 201 passed) · 4352 tests (4 failed / 4303 passed / 45 skipped)` — the 3 red FILES are the `PD-VENDOR` red set's own (`113 pass / 3 fail` of `116` rows) and the 1 carried red is the branch baseline (`G-1`); `4303 + 45 + 4 = 4352` ✔ and `201 + 3 = 204` ✔.⟩** **⟨SUPERSEDED 2026-09-28 (SECOND AMENDMENT, `X-4`) — the corrected AFTER reading is `204 files (1 failed / 203 passed) · 4384 tests (1 failed / 4338 passed / 45 skipped)`; the ONE red is the CARRIED BRANCH BASELINE (`PANE-TOGGLE-STAGE-COLLAPSE`) and the unit's own three `pd-vendor` files now read `148 passed (148)` / `0 failed`, so the as-filed *"3 red FILES are the PD-VENDOR red set's own"* and the `113/3`-of-`116` row census are BOTH superseded. Arithmetic of the corrected reading: `4338 + 45 + 1 = 4384` ✔ · `203 + 1 = 204` ✔.⟩** |
| **`npm run typecheck`** | `tsc --noEmit -p tsconfig.json` — **`src/**` only**; `tests/` is `exclude`d | harness | **exit 0**, and the vendored `src/shared/**` modules must typecheck **unmodified** (their zero/external imports are what makes this possible). **⟨AMENDED 2026-09-28: the run read `exit 0` — and the NEW `src/shared/foundation-return-shapes.ts` (a `src/**` file) is inside that reading, so the `P-IM-4` file, **when it lands**, must keep it at 0.⟩** |
| **`npm run build`** | the five bundles (`package.json`'s `build`) | harness | **exit 0**. **The vendored modules are in NO bundle** unless a bundle's entry imports them (the foundation's own reading: *"in no shipped bundle"*, `../Provident-Electron/docs/guide/seams.md` *Gotchas*) |
| **`npm run conformance`** *(new)* | the **eleven included suites — of which THREE collect ZERO tests** | `[T]`/`[H]` | **a per-suite tally with the audit rows named** (§3.5 item 4) — **no green word**. **⟨AMENDED 2026-09-28: the run read `11 files · 572 tests · 511 failed / 61 passed` with 3 suites collecting zero tests; the leg is RED BY CONSTRUCTION and its PASS CONDITION is the class (i) subset of §3.5 item 4, with the coverage bound of §3.5 item 7 (three modules carry no behaviour evidence).⟩** **⟨SUPERSEDED 2026-09-28 (SECOND AMENDMENT, `C3`/`C4`): the totals REPRODUCE exactly, but the three zero-collection suites are `census.test.ts`, `gutter-ui.test.ts`, `gutter.test.ts` (split `9 collected / 2 zero-collection`), the two-member *"eight collected"* wording above is the then-reading, **NO green subset exists** (class (i) is red for every collected suite), and `§3.5` item 7's bound is **ALL FIFTEEN** modules — **the leg reports a per-suite tally with class labels, never a colour**, and this cell's three-module claim is superseded. LAYER: `[T]`/`[H]` **envelope/tooling — never app** (`§13.2`).⟩** |
| **`node scripts/foundation-drift.mjs`** *(new)* | the `A3` monitor | `[D]`-class local instrument | a **`CLEAN` or `SKIPPED`** reading with the tree state named |
| **`npm run battery`** | 184 checks | harness/`[H]` | **run it** (the branch baseline reading is `GREEN`, proposal §7.5) — and **state that a battery green is harness-green**, not app-green |
| **`npm run divergence`** | the real-Electron divergence leg | harness/`[D]` | **run it and report the reading.** At this branch head it is **RED for an ENVIRONMENTAL reason** (`/dev/shm` denial → `SIGTRAP`; proposal §7.5) and `A-7` makes it **mandatory pre-live**. **This unit does NOT fix it, does NOT claim it green, and does NOT claim an app boot** |
| **any live / app leg** | — | assembled/`[U]` | **NOT CLAIMED, NOT RUN, NOT OWED BY THIS UNIT** (it changes no renderer behaviour; `RCA-11`'s live mandate binds UI-overhaul units, and this unit renders nothing) |

**`G-1`, EXTENDED (per `X-6`), as this unit must state it.** The branch baseline is: **`npm test` 1 carried
red** (`P-SM-1`/`strat:stage-seam-schedule-single-active`, the APP-layer residual `PANE-TOGGLE-STAGE-COLLAPSE`)
· **`typecheck` 0** · **`build` 0** · **`battery` 184/0 GREEN** · **`divergence` RED on the Electron leg**
(ENVIRONMENTAL). **Every figure above is a RECORDED reading taken by the proposal's pass; this unit re-runs
each leg and reports its own delta** — never a prediction, and never a copy.

**⟨ADDED 2026-09-28 (SECOND AMENDMENT) — WHAT THE BLIND PASS INDEPENDENTLY VERIFIED, stated as the unit's
verification set because it is the strongest evidence this unit has.⟩** The blind-greens pass
(`docs/specs/unit-pd-vendor-foundation-mechanisms-greens.md`) was authored **from the documentation only**
and then **RUN**; its author **never read `src/shared/**`, the monitor, the manifest or the unit's test
files**. It verified, at **envelope/tooling layer ONLY — NEVER app**:

1. **THE `A-3` PIN ARM — independently verified by an agent that never read the implementation.** A
   `git init` tree built at **another revision with EQUAL bytes** produced
   **`FAIL — 1 PIN fault(s): the adjacent foundation tree's revision <X> is NOT the pinned commit
   8f193a8d… — … equal bytes at a different commit are NOT the pinned state`**, **exit `1`**, **NO
   `CLEAN`** — i.e. **the strongest false-green the adversarial pass constructed (`§3a`'s verbatim
   block: *"THE PIN IS A RECORD, NOT AN INSTRUMENT"*) is FALSIFIED.** The report states the bytes are
   equal **while still refusing `CLEAN`**, which is the discrimination the fix was for.
2. **THE `SKIPPED` ARM** — foundation absent ⇒ `SKIPPED` **with its honesty statement** and **exit `0`**,
   `NOT a failure` (`§2.3` row 1; `ADV-VD-3`'s question answered by measurement).
3. **`CLEAN` WHEN PRESENT AND MATCHING** — `DRIFT RESULT: 15 checks, 0 differences — CLEAN`, exit `0`.
4. **The `A2`-family rows** — the three landed `tests/pd-vendor-*.test.ts` files read **`148 passed
   (148)` / `0 failed`** (the `§12.3` remands LANDED; `X-4`), the fifteen manifest digests recomputed
   `15/15` equal, and the `§2.1` item 5 census arithmetic (`5 + 10 = 15`; `6` statements / `5` distinct
   edges) reproduced.
5. **The trio as this unit's obligations need it** — `npm test` `204 files (1 failed / 203 passed) ·
   4384 tests (1 failed / 4338 passed / 45 skipped)` with the ONE red being the carried branch baseline ·
   `typecheck` exit `0` · `build` exit `0` · `battery` `184 checks, 0 failures` (**harness-green, NOT
   app-green**).

**What NONE of the above is:** **app evidence, rendered-DOM evidence, live evidence, or copy-fidelity
evidence for the vendored modules.** Items 1–3 are **tooling**; item 4 is **`[T]`/source-and-manifest
layer** (`A1`–`A6`); item 5 is **`[T]`/`[H]`/`[D]`**. **The unit still renders nothing, and the conformance
leg still supplies ZERO behaviour evidence for all fifteen modules** (`§3.5` item 7). **`npm run divergence`
was NOT run by this amendment pass and remains RED at this head for the environmental `/dev/shm` reason**
(proposal §7.5) — **not this unit's to fix, and not claimed.**

**⟨ADDED 2026-09-28 BY THE ITEM-10d DOCUMENTATION REVIEW — THE GATE-6 LIVE ROW, RECORDED AS AN `ABSENCE` ROW (`RCA-11` / `RCA-12`).⟩** **This is the unit's live-verification record, placed HERE (the verification section) rather than in `§5`'s layer ledger, because it is a gate result and not a layer disclaimer; `§5` item 1 carries the matching layer statement and `§9` item 1 carries the harness-fix hand-off.**

| Field | Entry |
| --- | --- |
| **Row kind** | **`ABSENCE`** — **not** `PASS`, **not** `FAIL`, **not** `PARK-REASON-UNKNOWN`, and **never the word *"waived"*.** **The repo's rule stands: *"waived"* is FORBIDDEN as a status here** (a waiver implies a live surface that was skipped by choice or by permission; this unit has **no live surface to skip**). |
| **What is absent** | **Every live / app / rendered-DOM verification row for `PD-VENDOR`.** No rendered surface, element, text, class or slot content is authored or changed; **`npm run divergence` (the branch's only assembled-real-Electron leg) could not be honestly run.** |
| **The falsifiable structural reason** | **The unit authors NO rendered surface and is imported by NOTHING that renders.** Its whole surface is: fifteen **byte-identical `.ts` copies** under `src/shared/` (no DOM authoring, no CSS, no class, no slot content, no envelope node, no handler body), **one JSON manifest** (`vendor/foundation.lock.json`), **one node script** (`scripts/foundation-drift.mjs`, no Electron, no build, no network — `§2.3`), **one type-only module that carries NO import of any kind** (`src/shared/foundation-return-shapes.ts`, `§2.1` item 7b rule 2), **byte-copied foundation suites** under `vendor/` (outside every collected include), and **two `package.json` script keys**. **MEASURED (VERIFIED-BY-READ, this review pass): a read of `src/**` for a specifier into the vendored set or into `foundation-return-shapes.ts` returns ZERO matches** — so **not one of these files is reachable from the renderer, the main process, the envelope graph or the MCP surface.** A live battery over this unit would have **nothing to exercise**: the falsifiable statement is *"remove this unit's files and no rendered surface changes"*, and that statement is TRUE. |
| **Why a live battery could not be run** | **`npm run divergence` is RED at this head for an ENVIRONMENTAL reason** — the real-Electron leg dies at bootstrap with `Creating shared memory in /dev/shm/… failed: Permission denied (13)` → Electron `exited with signal SIGTRAP` (proposal §7.5 read at `b6791e0`; `§8`'s divergence row; `§9` item 6). **A RED leg cannot honestly supply a live reading, and the unit claims no live leg** (`§5` item 2). |
| **The harness fix** | **ANOTHER OWED UNIT — never this one's, and NEVER SILENTLY PARKED.** `§9` item 1 records it: a harness unit touching `scripts/**` (the foundation's own harness landed `--disable-dev-shm-usage` + a fresh scratch `--user-data-dir` for exactly this class). It **has no spec and no red set**; the proposal §7.5 item 3 records it as owed, and `A-7` makes the leg **mandatory pre-live** for the units that DO render. **`PD-VENDOR` passes the precondition through and claims nothing.** |
| **Layer (RCA-12)** | **envelope / tooling at most — NEVER app.** **A node green is not app-green, and this unit's greens (the trio, the `148/148` rows, the monitor's `CLEAN`/`SKIPPED`/`FAIL` readings) are `[T]`/`[H]`/`[D]`/DOC-layer evidence only.** |

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

   **⟨ADDED 2026-09-28 BY THE ITEM-10d DOCUMENTATION REVIEW.⟩** **This item IS the hand-off that `§8`'s
   `ABSENCE` row points at: no unit owns it, no spec and no red set name it, and it is recorded OWED here so
   it is never silently parked.** **Until it lands, no tooling-only unit may claim a live reading either** —
   the absence is the HARNESS's, and it is reported as such, never re-described as an app defect (`§9` item
   6). **The forbidden status word does not apply:** this is an ABSENCE of an exercisable surface plus an OWED
   harness fix, **never a waiver**.
2. **`X-3` — the per-file test disposition re-derivation** for the amended rows is **Phase 0's first duty**
   per the gate's §4, and is **not** this unit's (this unit's own disposition work is the suite list, §3.5).
3. **`X-4` — the markup/declaration row (`PD-UI-13`) and `PD-UI-3`'s wave assignment** are **NOT this unit's**.
4. **`X-11` — the runner for the two uncollected `.mjs` batteries** (`adapter-parity-battery.test.mjs`,
   `mcp-stdio-e2e.test.mjs`) is **NOT this unit's**: it would edit `package.json`'s script set beyond the one
   added key (§2.5) and is `A-7`'s own item.
   **⟨AMENDED 2026-09-28: the as-filed clause says *"beyond the one added key"*; the landed tree carries TWO
   (§1.2, §2.5), neither of which is a `G-9` pin. The clause's POINT is unaffected — `X-11` would add a THIRD
   script surface, which this unit still does not authorise.⟩**
5. **`docs/skills/designing-pages.md` — ABSENT in this repo** (VERIFIED-BY-READ: a glob of `docs/skills/*`
   returns `process-guardrails.md` alone). **This unit renders no page, so the honest coverage row is an
   ABSENCE row** — recorded here; **the file is not created by this unit** (`D-9`). **⟨AMENDED 2026-09-28:
   re-VERIFIED-BY-READ by this amendment pass — `docs/skills/` still holds `process-guardrails.md` alone, so
   no design-doc update and no coverage-matrix/demo-page entry is owed (the change renders nothing).⟩**
6. **The `SIGTRAP`/`/dev/shm` red is ENVIRONMENTAL and is reported as such in every DONE row** — never
   smoothed, never re-described as an app defect.
7. **`O-1`…`O-8`** (§1.3, §1.1) — **`O-1` (the digest recomputation) and `O-3` (the leg's pass condition) are
   the two that gate this unit's own red set**; `O-2`/`O-4` are placement/record rulings.
   **⟨AMENDED 2026-09-28: `O-1` is DISCHARGED by the run (15/15 `REPRODUCED`); `O-3` is RULED (§3.5 item 4);
   `O-2` is RULED (the placement stands, §0A note 2); `O-5` is ADDED to the set and is ANSWERED NEGATIVELY;
   `O-7` is RULED (the path is `src/shared/foundation-return-shapes.ts`, §2.1 item 7 / §4 `P-IM-4`); `O-4`
   and `O-6` STAND ESCALATED; `O-8` remains UNVERIFIED (§12 item 5).⟩**

**8. ⟨ADDED 2026-09-28 — THE HANDOFF ITEM FOR THE FOUNDATION'S EXPORT GAP (`O-7`; `G-8`).⟩** **The gap:**
five shapes are declared **without `export`** in the foundation's `src/shared/gesture-session.ts`
(`GestureSession`), `src/shared/relocate.ts` (`RelocateResetResult`) and `src/shared/focus-model.ts`
(`FocusResult`, `FocusRefusal`, `FocusTransitionArg`), while **values return them and callbacks take them** —
so **a consumer cannot name the type of a value it is handed**, and must re-declare a **structural mirror**
that can drift silently from the module (the foundation's own guide names the class: `docs/guide/seams.md`'s
*"Two return shapes you cannot import"*). **Why this repo does not fix it:** the vendored bytes must stay
**byte-identical** (`§4` `P-IM-1`; `§3.1` `V-5`) and the foundation is **read-only** to this project
(`G-8`: hand off, never patch). **The fix shape (upstream-owned): export the five declarations** — an
additive `export` keyword, no behaviour change — **or** publish them from a type barrel the guide already
points a consumer at. **OWED TO THE SUPERVISOR'S WRITES:** a **`docs/defects.md`** row (foundation/PACKAGE
class, OPEN, *"NEVER patched here"*, naming the three modules, the five symbols and the consumer-cost reason)
and its **`docs/HANDOFF.md`** counterpart under `## OPEN handoff items` (AGENTS.md item 7). **This spec
supplies the reading and the reason; it writes no tracker row for another document** (`D-12`'s discipline
applied to trackers: the supervisor owns them). **Until it lands, the repo's own
`src/shared/foundation-return-shapes.ts` is the re-declaration, and its equivalence to the returned values
is NOT claimed (§5 item 7).**

---

## 3a. Adversarial findings — **THE PASS HAS RUN (2026-09-28): `PASS-WITH-FINDINGS`, thirteen findings (`A-1`..`A-13`), NO BLOCKING. The seed table below STANDS as filed, with each probe now dispositioned in §3b.**

**The pass was `role_adversarial_reviewer`, read-only, and it also performed the mandatory read-only PBT audit. Its
verdict, quoted: *"the vendoring itself re-derives, but the pin's mechanism, the leg's pass condition, and three
register rows are weaker than their claims"*.** Its own re-derivations: the fifteen modules exist with the manifest's
declared line counts (15/15); the same fifteen in the foundation tree match on line count and first line (15/15); one
file (`overlay.ts`) is textually identical in full; the import census is **6 statements / 5 distinct edges** with **no
out-of-set import** (so `internalEdges` = 5 and `outOfSetImports` = `[]` both hold); the row count **is 129**; the
register's printed total **equals the sum of its own terms** (`19+17+17+12+10+8+20+12 = 115`, the as-filed `103` being
the same eight-minus-one); and `foundation-return-shapes.ts`'s five shapes **match the vendored declarations
member-by-member today** (`GestureSession` 9, `RelocateResetResult` 3, `FocusResult` 7, `FocusRefusal` 3,
`FocusTransitionArg` 4) — **so `ADV-VD-10`'s suspected drift is an INSTRUMENT gap, not a live defect.**

**WHAT THE PASS COULD NOT RE-DERIVE, stated so no later pass reads it as verified:** the **md5 equality itself** (the
reviewer's tool wall has no `md5sum`/`diff`/`git`; its strongest check was line counts, first lines and one full-file
comparison, which **cannot see** CRLF/BOM/trailing-whitespace deltas) — so `P-IM-1`'s central claim **remains a
run-reading**, not an independently reproduced one; and the **leg's colour** (not runnable read-only).

### The findings, with dispositions

| Id | Sev | The finding (abridged) | Disposition | Correction |
| --- | --- | --- | --- | --- |
| **`A-3`** | **HIGH** | **THE PIN IS A RECORD, NOT AN INSTRUMENT — nothing in the repo ever checks the pinned commit.** `P-IM-1` drives `md5(shipped) === manifest.md5` against a manifest **the same pass authored** (circular); the monitor compares to the adjacent **working tree** and never reads `foundation.commit`; the only commit read is a tautology when the tree is absent. A foundation tree at **a different commit with equal bytes, or a dirty tree, reads CLEAN** | **HOST-FIX** | add a read-only pin arm (`git -C <foundation> show <commit>:src/shared/<x>.ts`, or a `rev-parse HEAD` equality check) to the monitor **plus a register row**, and state that a `SKIPPED` reading proves nothing about the pin |
| **`A-1`** | **HIGH** | the leg's pass condition (class (i) evidence rows MUST PASS) is **unsatisfiable as written**: every suite reaches its module through a **relative** specifier, so from `vendor/Provident-Electron/tests/` it resolves under `vendor/Provident-Electron/src/` — a directory the tree does not carry | **SPEC-AMBIGUITY → DISCHARGED (measured)** | read the per-suite tally before any DONE row; if class (i) is red, restate `§3.5` item 7's bound from three modules to **all fifteen** (no behaviour evidence) and escalate — **never report a green subset**. **⟨2026-09-28: the tally WAS read — class (i) IS red for every collected suite, so the pre-committed branch is TAKEN: the bound is restated to ALL FIFTEEN (normative, `§3.5` item 7) and the leg's pass condition is VACUOUS AS EVIDENCE. `§3.5` items 4/7; `§13.2`.⟩** |
| **`A-3`** | **HIGH → ⟨2026-09-28: VERIFIED-CLOSED (tooling layer)⟩** | **THE PIN IS A RECORD, NOT AN INSTRUMENT — nothing in the repo ever checks the pinned commit** (the strongest false-green the pass could construct: a foundation tree at a **different commit with equal bytes** reads `CLEAN`). | **HOST-FIX (applied) → the disposition is now EVIDENCE, not an intention.** | the pin arm lives in `scripts/foundation-drift.mjs`, and **the blind pass — an agent that never read the implementation — independently VERIFIED it: a `git` tree at ANOTHER revision with EQUAL bytes read `FAIL — … the revision <X> is NOT the pinned commit 8f193a8d… — equal bytes at a different commit are NOT the pinned state`, exit `1`, and NO `CLEAN`; the `SKIPPED` arm read exit `0` with its honesty statement; `CLEAN` read when the foundation is present and matches.** **LAYER: envelope/tooling (`[D]`-class local instrument) — NEVER app evidence** (`§5`; `§8`; `§13.6`). |
| **`A-4`** | MED | the monitor's manifest-validity arm checks only **counts** (`15`), never the declared **names**: fifteen duplicate entries (`census` ×15) print `CLEAN` while fourteen modules are never compared | **HOST-FIX** | assert the declared name set is **set-equal to the pin's fifteen** inside the monitor, and report **distinct-file** counts, not entry counts |
| **`A-5`** | MED | **byte-identity is satisfied by a SYMLINK** — every read is `existsSync` + `readFileSync` (dereferencing), so `src/shared/census.ts → ../Provident-Electron/src/shared/census.ts` keeps every row and the monitor green while `R-1`'s *"copied in as source"* and *"the fork must work standalone"* are violated | **HOST-FIX** | a per-module `lstat(...).isSymbolicLink() === false` (regular-file) assertion in the `A2` row **and** in the monitor's local arm |
| **`A-6`** | MED | **the drift suite is non-hermetic and can delete a directory it did not create**: `makeTempTree` targets `join(root,'..','Provident-Electron')` and a row's `finally` `rmSync(..., {recursive:true, force:true})` removes whatever sits at that shared global path | **TEST-DEFECT** | place the sibling **inside** the temp root and set the synthetic `foundation.path` to `./foundation`; never `rm` a path the test did not create |
| **`A-7`** | MED | `P-SM-2` **over-claims in its title and under-asserts in its body**: the divergence premise (*"the fork's `dom-shim`/`types` are strictly larger"*) is asserted **nowhere**, the row anchors on a **mutable hard-coded SHA** (`cf19d4e`) that disagrees with the manifest's red-set commit (`7d3b55c`), and its term (`10 = 4 + 1 + 5`) matches neither its Domain cell nor its executed rows | **TEST-DEFECT** | assert the four files against the foundation's **recorded** values held in the manifest beside `baselineFilesNotReplaced`, and retitle the row to what it drives |
| **`A-8`** | MED | `P-TP-1` **does not exercise the `A2` oracle at all** — it defines two local closures over bytes it read itself (`auditManifest`/`shippedDigest` are never called) — and its retained source-text guard is **non-discriminating** (the file itself contains the join the guard names, and the regex does not match it) | **TEST-DEFECT** | drive the real `shippedDigest`/`auditManifest` against a temp-copied tree, and replace the regex with a **path-level** assertion |
| **`A-9`** | MED | an **off-by-one in the census arithmetic**, repeated from this spec into the landed row: `§2.1` item 5 and `§12.3(d)` say *"5 files with imports + 10 without = the fifteen"*, but one of the five (`path-fork-cycle.ts`) is a **NON-MEMBER**, so the set splits **4 + 11** — the assertion is right and the **terms** are wrong | **TEST-DEFECT (+ SPEC-AMBIGUITY on the amendment's own annotation)** | state *"4 of the fifteen carry imports; 11 carry zero (5 of the directory's 20, one a non-member)"* and fix the title/comment |
| **`A-10`** | MED | `P-IM-3`'s closure oracle is a **single-line regex**, so it misses bare side-effect imports (`import './x.js'`), **multi-line** statements, dynamic `import(...)` and `require(...)` — the property is checked by a **proxy**, disclosed only as `(bounded)` | **HOST-FIX** | derive the import set with the `typescript` devDependency already used by `P-SM-1` (AST `ImportDeclaration` / `ImportExpression` / `require` `CallExpression`) instead of a regex |
| **`A-11`** | MED | `P-IM-4`'s oracle is **name-presence over a text**, and the file is **imported by nothing**, so a structurally wrong mirror keeps all 129 rows and `typecheck` green — the drift is silent (no live mismatch today) | **HOST-FIX** | add a row that **AST-extracts each shape's member names** from the vendored declarations and from the mirror and compares them (or a type-level assignability check in a typechecked location) |
| **`A-12`** | LOW | the `'electron'`-mock prohibition is **evadable in both derivations**: the census matches `callee === 'vi.mock'` on the literal `vi`, so an aliased or computed call joins neither the protected census nor the copy's derivation | **TEST-DEFECT** (the frozen pin must **NOT** be edited; that is an `ARCHITECT` escalation) | a new row flagging any **binding** of `vi.mock`/`vi['mock']`/an alias in `tests/**`, plus the escalation for the protected pin's own derivation |
| **`A-13`** | MED | **reporting is stale and the adversarial record was empty** (this section read `OWED`), no DONE/tracker row cited an adversarial pass, `docs/next-steps.md`'s row reports the **pre-remand** reading, and the register's *"115 attempts / 0 broken / stop-after-5 not triggered"* exists in **no landed artifact** — 6 of 8 rows have **no generator** and three terms are asserted as **literal tautologies** | **HOST-FIX (supervisor writes)** | **this section is the record**; the tracker row is restated at the current head; **and the register must either carry a per-row held/broken census or label its terms "declared, not executed"** |
| **`A-2`** | MED | a **fourth row class** exists in the vendored suites and is unnamed: **ABSENCE-BRANCH rows that PASS because the module is unreachable** (the foundation's RED-first cycles), inflating the leg's `61 passed` while evidencing nothing | **SPEC-AMBIGUITY** | add class (iv) `ABSENCE-BRANCH — not evidence` to `§3.5` item 4 and require the tally to label it; a row passing on an absent module must never count toward class (i) |

### The seed probes, dispositioned

| Probe | Outcome |
| --- | --- |
| `ADV-VD-1` (normalized-view evasion) | **NOT reproduced as a defect** — the rows compare raw digests; but the reviewer notes its own inability to re-derive md5, so the probe's residual risk is **the normalization gap is unmeasurable read-only** |
| `ADV-VD-2` (`A2` reads what it should not) | **CONFIRMED as `A-8`** |
| `ADV-VD-3` (`SKIPPED` a disguised pass?) | **NOT a finding** — the report text and the exit code distinguish `SKIPPED` from `CLEAN` |
| `ADV-VD-4` (smuggled baseline edit) | **CONFIRMED as `A-7`'s weak form** — the row drives bytes against a hard-coded SHA rather than the recorded values |
| `ADV-VD-5` (leg leaks into `npm test`) | **NOT a finding** — collected-file count is unchanged |
| `ADV-VD-6` (the "eleven included" claim) | **CONFIRMED as `A-1`/`ADV-VD-9`** — the 8+3 split is required in the tally |
| `ADV-VD-7` (out-of-set import / `'electron'` in the copies) | **NOT a finding** — the census is 6 statements / 5 edges, no out-of-set import |
| `ADV-VD-8` (protected-pin re-derivation real?) | **PARTLY — see `A-12`**: the direct-call form is caught, an aliased call is not |
| `ADV-VD-9` (the leg's suite list after the split) | **CONFIRMED as `A-1`/`A-2`** |
| `ADV-VD-10` (silent drift of the mirror) | **CONFIRMED as an INSTRUMENT gap (`A-11`)** — no live mismatch today |

### The PBT audit (read-only — NO generator was run, by rule)

**Rows: 8. Over-strength judgements:** `P-IM-1` **over-strength** (*"byte-identical to the PIN"* against a
same-pass-authored manifest — `A-3`); `P-IM-3` **over-strength** (*"resolved import graph"* for a line regex —
`A-10`); `P-SM-2` **over-strength** (its term matches neither its Domain cell nor its rows — `A-7`); `P-TP-1`
**over-strength and `(bounded)` by 2 draws while the property quantifies over every module**, driving local closures
rather than the `A2` oracle (`A-8`); `P-IM-4` **over-strength** (*"re-declared"* ≈ five exported **names**). `P-IM-2`,
`P-SM-1`, `P-TP-2` hold. **Arithmetic: the printed total equals the sum of its own printed terms ✓, every row ≤100,
total ≤120 ✓ — but the `broken`/executed accounting is NOT coherent with the row list, because no row or artifact
carries an executed/broken/stop census at all** (6 of 8 rows have no generator; the seed is used by `P-TP-1` alone;
three terms are literal tautologies: `1*2*2*2`, `4*2+4`, `5*2+2`).

**Prose counterexamples the rows would NOT catch (prose only — the reviewer wrote and ran nothing):**
(a) `import './types.js'`, a **multi-line** `import type … from '../x.js'`, or a `require(...)` in a vendored file
passes `P-IM-3` untouched; (b) a `census.ts` replaced by a **symlink** to the foundation passes `P-IM-1`/`P-SM-2`;
(c) `focus-model` and `gutter-affordance` behaviour **cannot be exercised by any row at all**.

**THE NEGATIVE GENERATORS TASKED TO THE TESTWRITER (one-pass remand):** (i) a synthetic **import-statement-shape**
generator (bare · multi-line · dynamic · `require`) asserting the closure oracle catches each; (ii) an `lstat`-based
**symlink** generator, per module; (iii) a **member-list** generator for `P-IM-4` (AST-extracted members of the five
shapes: mirror vs declaration).

### THE STRONGEST FALSE-GREEN THE PASS COULD CONSTRUCT (kept verbatim in substance)

*Take the foundation tree at a DIFFERENT commit (or dirty) whose `src/shared/*.ts` bytes are the ones this fork
vendored: `npm run drift` prints `DRIFT RESULT: 15 checks, 0 differences — CLEAN`, exit 0, and every row stays green —
because nothing in the repo ever hashes the pinned commit; `P-IM-1` compares the shipped file to a manifest this same
pass wrote, and the sole commit check is unreachable in a standalone checkout. Symmetrically, replace any vendored
module with a symlink into the foundation — `P-IM-1`'s "byte-identical to the pinned commit" is satisfied by whatever
bytes the manifest declares, the 129 rows stay green, and the unit's central claim is at that moment unevidenced:
THE PIN IS A RECORD, NOT AN INSTRUMENT.*

**`RCA-3` compliance: the adversarial pass HAS RUN and its findings are recorded here; its host fixes and its
test-side reminders are the unit's next cycle, and the foundation-side items are handoff rows (`G-8`) written to
`docs/defects.md` + `docs/HANDOFF.md` — never patched.**

---

## 3a-seed. The seed table (as filed — kept visible; every probe is dispositioned above)

`RCA-3` requires a read-only adversarial pass per completed unit, its findings recorded here. **This spec has
run none.** The seed set (each is a question to *falsify*, not a claim):

| # | The adversarial probe |
| --- | --- |
| `ADV-VD-1` | **Is the digest comparison evadable?** A row that hashes a **normalized** view (line endings unified, a trailing newline added, a BOM stripped) passes a copy that is **not** byte-identical. **Probe: mutate one byte that a normalization would hide, and require the row to fail.** |
| `ADV-VD-2` | **Does the `A2` row read the copy it should not?** A row reading `vendor/Provident-Electron/tests/` or a hard-coded constant is self-satisfying. **Probe: perturb the shipped file only, then the copy only; the verdicts must differ** (`P-TP-1`). **⟨AMENDED 2026-09-28: the as-filed probe asks ONE oracle for TWO verdicts, which no oracle can give (`C-AM-1`). The probe is now TWO ORACLES on ONE perturbed closure: `oracleShipped` MUST fail, `oracleCopy` MUST still pass (`§4.1` item 2).⟩** |
| `ADV-VD-3` | **Is `SKIPPED` a disguised pass?** The monitor's absent-tree arm must be distinguishable from a `CLEAN` reading in the **report text and the exit code**; a `SKIPPED` that prints nothing is a silent pass. |
| `ADV-VD-4` | **Does the vendoring smuggle a baseline-file edit?** Re-read the four baseline files against their pre-vendoring digests **after** the vendor commit — not before (`P-SM-2`). |
| `ADV-VD-5` | **Does the leg's config leak into `npm test`?** A `vitest.conformance.config.ts` that also includes `tests/**` would double-collect; a run of `npm test` that suddenly reports the vendored suites is the finding. |
| `ADV-VD-6` | **Is the "eleven included" claim honest?** The excluded four are excluded for **import** reasons; **probe the four included-but-audit-heavy suites** (`gutter.test.ts`, `relocate.test.ts`, `zones.test.ts`, `gesture-session.test.ts` — each carries a diff-scope audit over `git status --porcelain`) and require the DONE row to have **named** them (§3.5 item 4), not absorbed them. |
| `ADV-VD-7` | **Does any vendored file carry a `'electron'` mock or an out-of-set import after copying?** Re-run **both** scans **on the vendored copies**, not only on the foundation originals. |
| `ADV-VD-8` | **Is the protected-pin re-derivation real?** The bridge-mock census is **derived**; adding a file that mocks `'electron'` must red it. **Probe: the synthetic mock file `P-SM-1` requires** — and then **remove it** in the same pass, restoring the census. |
| **⟨ADDED 2026-09-28⟩** `ADV-VD-9` | **Is the leg's suite list still honest after the `O-5` split?** The spec says "eleven included", but **three of them collect ZERO tests** and are not evidence of anything. **Probe: require the DONE row's tally to carry the 8+3 split and the three NAMED uncollected suites; a tally that reports "eleven suites" without the split is the finding** (§3.5 items 2/4/7). |
| **⟨ADDED 2026-09-28⟩** `ADV-VD-10` | **Does the re-declaration file drift silently from the returned values?** `P-IM-4` asserts **existence and the five-name set**, and `focus-model.test.ts` — one of the three uncollected suites — is where the structural mirror would be checked. **Probe: re-declare a shape with a WRONG member and require the repo to have a row that fails; if no row fails, the drift is SILENT and that is the finding** (§5 item 7; §3.5 item 7). |

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
   `19+17+17+12+10+8+20`, and the `(bounded)` carve-out on `P-IM-3`. **⟨AMENDED 2026-09-28: **8 rows**
   (the register is **FULL**), **`115` attempts** printed with its terms,
   `19+17+17+12+10+8+20+12`, the same `P-IM-3` carve-out, **the `P-TP-1` term UNCHANGED at `8`**, and the
   new **`P-IM-4`** row with its `12 = 5 × 2 + 2 controls`.⟩**
6. **The dossier status** — the number of `defined` rows and **the full list of any
   `undefined-until-answered` row and any unreconciled collision hit**.
7. **The protected pins touched** and their same-commit re-derivation (§3.6).
8. **Every UNVERIFIED item** — `O-1`…`O-8` (§1.3), with `O-1`/`O-3` named as the gating two.
   **⟨AMENDED 2026-09-28: plus `O-5` (the leg's placement/resolution — answered NEGATIVELY), the three
   **REMANDS** to the TestWriter (§12 item 3), the **handoff row owed** for the foundation's export gap (§9
   item 8), the **`G-9`-amendment route and the generated-resolver route** (both ESCALATED, neither taken,
   §0A note 2 consequence 3), and **every item §12 marks UNVERIFIED**.⟩**
9. **⟨ADDED 2026-09-28.⟩ The leg's report must carry** the **8 + 3 split** of the eleven suites, the **three
   named uncollected suites**, the **per-class row counts** of §3.5 item 4, and the **coverage bound** of
   §3.5 item 7 (**three modules with no behaviour evidence**). **A report that omits any of the four is a
   review finding** (`O-5`'s consequence). **⟨AMENDED 2026-09-28 (SECOND AMENDMENT) — ALL FOUR OBLIGATIONS
   STAND IN FORM, AND TWO MOVE IN SUBSTANCE: the split is MEASURED `9 collected / 2 zero-collection`; the
   per-class row counts are MEASURED with **class (i) EMPTY**; and the coverage bound is **ALL FIFTEEN**
   modules. **So of the four carried terms, the second (the suite split) and the fourth (the three-module
   bound) are WRONG as filled above** — `focus-model.test.ts` is NOT one of the zero-collection suites
   (`C3`), and no suite supplies behaviour evidence (`C4`). **The report MUST carry the corrected split and
   the all-fifteen bound, MUST label the classes, and MUST NEVER report a green subset** (`§3.5` items 2/4/7;
   `§13.1 · §13.2`).⟩**

## 11. Cross-references (path + symbol / row id / `§section` — never a line number)

`docs/specs/unit-pd-vendor-foundation-mechanisms-greens.md` (**the blind-greens artifact — the authority for
every figure quoted in `§13`; its scenario table `A`–`F`, its `NOT-TESTABLE` set and its contradictions
`X-1`…`X-6`**) ·

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

---

## 13. THE SECOND AMENDMENT LEDGER (2026-09-28) — the five measured amendments, the `A-3` verification, and the tracker rows

**Placement note (so a citation resolves, and so the file's section order is stated rather than smoothed):**
**`§13` is the CURRENT-READING ledger and it is printed AHEAD of `§12`** (the first amendment's ledger, which
follows it below) **because a reader must meet the corrected readings before the ledger they correct** —
the same discipline by which this file's `§3a`/`§3b` follow `§9`. **Both are CONTRACT; where they disagree,
`§13` is the later measurement and says so item by item.** **`§12` is NOT renumbered, and no clause of it is
deleted: it is the first amendment's own record, kept as that pass's reading.**

**This section is CONTRACT, not commentary.** It is the current-reading index for the five amendments this
pass owes, **so a TestWriter, an Implementer, a blind-greens writer or a later doc reviewer sees which
reading is current without re-deriving it.** **Its layer is DOC-LAYER; the unit renders nothing, and
everything it records is envelope/tooling at most — NEVER app** (`RCA-12`: the conformance leg, the monitor
and the trio are **not app evidence**). **Authority for every figure below: the blind-greens artifact
`docs/specs/unit-pd-vendor-foundation-mechanisms-greens.md`, authored from the DOCUMENTATION ONLY by an
agent that never read `src/shared/**`, the monitor, the manifest or the unit's test files, and then RUN.**
**This pass re-ran NOTHING and read no run log** — every figure is a **RUN-READING quoted as input**.
**This amendment changes no code, no test, no config, no vendored byte, nothing under
`../Provident-Electron/**`, and no pinned `package.json` key** (`§1.2`; `D-12`).

**13.1 ITEM A — `C3`: THE ZERO-COLLECTION SUITE LIST IS WRONG, AND WITH IT `§3.5` ITEM 2's `8 + 3` SPLIT.**
**Amended clauses:** `§0A` note 2 (Consequence 2's annotation; the *"third zero-collection suite"* item) ·
the layer table's conformance-leg row · `§1.1` `O-5` · `§1.2` (the vendored-suites row) · `§3.5` items 2/4/7
· `§5` item 6 · `§8` (both leg cells) · `§10` item 9 · `§12.1`/`§12.2`/`§12.5` items 2/3/4.
**MEASURED: the three ZERO-COLLECTION suites are `census.test.ts`, `gutter-ui.test.ts` and
`gutter.test.ts`** — the last appearing as a **`Failed Suites`** entry with
`Error: ENOENT: no such file or directory, scandir '…/Astrographer/vendor/Provident-Electron//src'`, **where
the spec listed it as COLLECTED** — **while `focus-model.test.ts` COLLECTS `78 tests` (`70 failed`).**
**THE CORRECTED SPLIT IS `9 COLLECTED / 2 ZERO-COLLECTION`** (the `8 + 3` **structure** holds, its
**membership** does not), and the corrected **zero-collection module list** is `census.ts`,
`gutter-affordance.ts`, **`gutter.ts`** — **`focus-model.ts` is NOT among them.** **The `census` and
`gutter-ui` mechanisms the first amendment named REPRODUCE verbatim; its mechanism for the third member is
WRONG** (the real one is a `REPO_ROOT`/`new URL` source-file walk). **THE EARLIER `8 + 3` FORM IS
SUPERSEDED AND STAYS VISIBLE, dated, beside the corrected one** (`§0A` note 2; `§3.5` item 2) — **never
silently rewritten.** **No test file is edited by this amendment** (`D-12`): the corrected membership is a
**contract reading**, and any row that asserts the old membership is a **REMAND** to the TestWriter.

**13.2 ITEM B — `C4`: CLASS (i), THE LEG'S ENTIRE EVIDENCE, IS EMPTY — `§3a` `A-1` IS DISCHARGED AND
`§3.5` ITEM 7's BOUND IS RESTATED TO ALL FIFTEEN AS A NORMATIVE CLAUSE.** **Amended clauses:** `§0A` note 2
(Consequence 2) · the layer table · `§1.1` `O-1`/`O-3`/`O-5` · `§1.3` `O-5` · `§3.5` items 2/4/7 · `§5`
item 6 · `§8` · `§10` item 9 · `§12.1` · `§12.5` item 4 · `§3a` `A-1`'s disposition cell.
**MEASURED: all eight then-collected suites FAIL their module drives** — `theme 46/58` · `container 57/68` ·
`zones 54/58` · `overlay 57/69` · `menu-template 54/60` · `relocate 90/94` · `gesture-session 83/87` ·
`focus-model 70/78` (`failed/collected`) — **each labelled
`<x>: src/shared/<x>.ts does not exist (…/vendor/Provident-Electron/src/shared/<x>.ts)`**; the leg's totals
are **`11 files · 572 tests · 511 failed / 61 passed`, exit `1`**, and **the blind pass reported NO green
subset.** **`A-1`'s pre-committed branch is therefore TAKEN, as a CONTRACT CHANGE TO A BOUND and not as a
doc note:** **all fifteen vendored modules carry NO behaviour/copy-fidelity evidence from this leg**
(`§3.5` item 7's restated clause 1), **the leg's pass condition is VACUOUS AS EVIDENCE** (item 4's added
clause 1: class (i) has **no satisfiable instance**, so *"MUST PASS, or the unit is not green"* can neither
be satisfied nor violated), **NO GREEN SUBSET MAY EVER BE REPORTED FROM THIS LEG** (added clause 2), and
**the leg becomes evidence again ONLY by the three routes of added clause 4** — a foundation-side
resolvable-specifier change (handed off, `G-8`), a `G-9` pin-set amendment (the architect's), or a moved
placement (refused: it breaks the byte-identity the manifest records). **The `61 passed` is class (iii)
audit and absence-branch residue, NEVER a copy-fidelity count.** **The per-suite red tally the artifact
carries is recorded at `§3.5` item 2, with its terms summing to the leg's totals** (`572` collected /
`511` failed / `61` passed).

**13.3 ITEM C — `X-2`: THE DEFECT IS DEEPER THAN THE SPEC RECORDED — THREE RESOLUTION FORMS, ONE WRONG
TARGET.** **Amended clauses:** `§0A` note 2 (its mechanism annotation) · `§1.3` `O-5` · `§2.3` (the added
dependency note's neighbourhood) · `§3.5` item 2's corrected mechanism · `§3.5` item 7.
**The first amendment claimed a module is reached *"through the protected dynamic import"*. MEASURED, that
is NOT what happens: the STATIC form, a `new URL('../src/shared/<x>.ts', import.meta.url)` form AND the
protected dynamic `@vite-ignore` import ALL resolve under `vendor/Provident-Electron/src/shared/`** — the
static and `new URL` forms resolving to that absent path, the **dynamic** form failing with
`Cannot find module` although the module exists two levels up. **The amendment's as-filed sentence about the
`new URL` form is SUPERSEDED and is kept visible beside the corrected mechanism** (`§0A` note 2) — the
placement ruling there is unaffected, because it rests on byte-identity and on `G-9`'s pin, never on the
resolution claim. **The third form's failure is what makes `gutter.test.ts` a `Failed Suites` entry**
(`C3`).

**13.4 ITEM D — `X-4`: THE COUNTS ARE STALE, AND EVERY AFFECTED CELL IS RECONCILED WITH BOTH READINGS
VISIBLE.** **Amended clauses:** the status block · `§5` item 8 · `§6.4`'s ⑥ · `§8` (the `npm test` and leg
cells) · `§12.1`'s consequence (1) · `§12.5` items 1/3. **The as-filed figures stay visible with their
dates; the corrected readings sit beside them:** **the unit's own rows are now `148 passed (148)` /
`0 failed`** (the as-filed `113 pass / 3 fail` of `116` is a SUPERSEDED earlier-tree-state reading — **the
`§12.3` remands have LANDED**, and `116 → 148`), and **`npm test` is now
`204 files (1 failed / 203 passed) · 4384 tests (1 failed / 4338 passed / 45 skipped)`** (the as-filed
`204 files (3 failed / 201 passed) · 4352 tests (4 failed / 4303 passed / 45 skipped)` is superseded; **its
one red is the CARRIED BRANCH BASELINE `PANE-TOGGLE-STAGE-COLLAPSE`, NOT the unit's own files**).
**Arithmetic, printed with its terms:** `4338 + 45 + 1 = 4384` ✔ · `203 + 1 = 204` ✔ · deltas against the
superseded reading `+32 tests` and `−3 failed tests`. **`§12.5` item 1's UNVERIFIED is thereby PARTLY
DISCHARGED** (the legs were re-run by a non-authoring agent) **and NOT CLOSED** (this pass re-ran nothing).
**A tracker or DONE row still quoting `113/3` of `116` or `4352 / 4` is WRONG at this head.** **`O-8`'s
suite-count disagreement is NOT resolved by this amendment** (five figures now, from at least three tree
states).

**13.5 ITEM E — `X-5`: THE MONITOR NEEDS THE `typescript` DEVDEPENDENCY.** **Amended clauses:** `§2.3` (the
added runtime-dependency note) · `§2.5` (the added dependency-posture note) · `§3.4`'s neighbourhood.
**MEASURED: in a bare root the monitor cannot start** —
`Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'typescript' imported from …/scripts/foundation-drift.mjs`
— **it starts once the repo's `node_modules` is reachable.** **Reason: the `§3a` `A-10` HOST-FIX derives the
import closure with the TypeScript AST**, so `typescript` is a **runtime** dependency of the script.
**Scope, stated so nothing is over-read:** *"the fork must work standalone"* (§2.3 row 1; decision clause
(1)) is satisfied **for the ABSENT-FOUNDATION situation** and is **never** a claim of a dependency-free
checkout. **This unit adds no dependency, moves no pinned key and edits no `package.json` value.**

**13.6 ITEM F — WHAT THE BLIND PASS CONFIRMED, AT ITS LAYER.** The `A-3` pin fix is recorded as
**independently verified by an agent that never read the implementation** (`§3a` `A-3`'s row; `§8`'s
verification block): a `git init` tree at **another revision with equal bytes** read
`FAIL — … the revision <X> is NOT the pinned commit 8f193a8d… — equal bytes at a different commit are NOT
the pinned state`, **exit 1, no `CLEAN`**; the `SKIPPED` arm read **exit 0 with its honesty statement**;
`CLEAN` read when the foundation is present and matches. **Its layer is ENVELOPE/TOOLING (`[D]`-class local
instrument) — NEVER APP**, and it is **not** copy-fidelity evidence for any vendored module. **ALSO
INDEPENDENTLY CONFIRMED BY THE SAME BLIND PASS, at the same non-app layers, because a reader should see the
cleared set as well as the contradicted one:** the manifest **key by key** (`moduleCount 15` · set-equal
names · `vendored === source` · `proposalTableAgreement: REPRODUCED` · the four `baselineFilesNotReplaced`
excluded · `outOfSetImports: []` · **five** distinct `internalEdges`) and the fifteen recomputed digests ·
**`§2.1` item 5's census arithmetic** (`5` files with imports / `10` without = the fifteen-set reading;
`6` statements / `5` distinct edges) · **`§2.1` item 6**'s exactly-**three** inert-vendoring hits, none of
them a vendored member · **`§3.3` item 4**'s line-count convention · **`§2.1` item 7b**'s mirror
(existence, all five names, type-only, not a manifest member) · **`§3.6`'s pins and its "NOT touched"
list** · and the **ABSENCE of any app/live row** in the artifact. **All of it `[T]`/`[H]`/`[D]`/DOC-layer;
none of it app evidence.**

**13.7 WHAT THIS AMENDMENT COULD NOT VERIFY (each UNVERIFIED, with what would settle it).** **No item here
is smoothed into a claim, and `§12.5`'s items remain open except where marked answered above.**

| # | UNVERIFIED | What would settle it |
| --- | --- | --- |
| **1** | **Every figure in `§13` is a RUN-READING of the blind artifact.** This pass held **no shell** and **re-ran nothing**; it also read **no run log**. The corrected readings (`148/148` · `204 files / 4384 tests / 1 failed` · the per-suite red tally · `CLEAN`/`SKIPPED`/`FAIL` texts) are **quoted, never checked by this pass.** | Re-running the three legs at a named head and reading the output verbatim, or reading the supervisor's run record. |
| **2** | **The tracker rows' final wording.** `docs/next-steps.md`'s CURRENT-WORK block and `docs/pending.md`'s POST-DIVISION row are **supervisor-owned**; this pass **appends an anchored annotation** and does **not** rewrite a row (`RCA-8(c)`). | The supervisor's tracker pass reading the appended annotations and restating any row it prefers to own. |
| **3** | **Whether any LANDED test row still asserts the old membership or the old three-module bound** (e.g. a row asserting `focus-model.test.ts` collects zero, or a `§3.5` item 2 `8 + 3` literal). This pass **did not read** `tests/pd-vendor-*.test.ts` (it read only counts already published in the artifact) — **reading them to decide would be the failure mode the blind gate exists to catch.** | The TestWriter's / documentation-reviewer's cross-check of `§13.1`/`§13.2` against the landed rows — **a REMAND, not this spec's edit.** |
| **4** | **`O-8`'s suite-count reconciliation** (still open; now five figures from at least three tree states). | A `npx vitest list`/run reading at a **named** commit, with the vendored suites **excluded**, so the delta is attributable. |
| **5** | **The `typescript`-AST oracle's own behaviour under a hostile input** (`§3a` `ADV-VD-1`'s normalization residual, `A-11`'s mirror gap) — unchanged by this amendment and **not** exercised here. | The negative generators already tasked to the TestWriter (`§3a`'s PBT-audit block) plus a documentation review of their results. |
| **6** | **`npm run divergence`'s colour.** Quoted as **RED for an ENVIRONMENTAL reason** (`/dev/shm` denial → `SIGTRAP`); **the blind pass did not run it by instruction and neither did this pass.** **This unit claims nothing live and is not the harness fix** (`§9` item 1). | The leg's own output on a display with a usable `/dev/shm`. |
| **7** | **`docs/skills/designing-pages.md`.** Re-confirmed **ABSENT** as of the first amendment and **re-checked by nobody in this pass**; **this unit renders nothing**, so no coverage-matrix row and no demo-page entry are owed — **the honest form is the ABSENCE row at `§9` item 5** (`D-9`). | The page-design skill's own unit if one is ever authored; **this amendment does not create it.** |

**13.8 REGISTER ARITHMETIC — NOTHING MOVED.** **No figure in
`§4` changes: the register stays `8` rows, its class tally stays `4 + 2 + 2`, its total stays
`115` attempts printed with its terms (`19 + 17 + 17 + 12 + 10 + 8 + 20 + 12 = 115`), `P-TP-1`'s term stays
`8`, and the seed `0x20260927`, the `≤100`/`≤120` caps and the stop-after-5 rule are untouched.** **No row
id, no term, no seed and no cap is moved by this amendment** (`§4`; `D-8`). **The figures that DID move in
this document are row counts of LANDED TESTS, not register attempts: `116 → 148` unit rows and
`4352 → 4384` suite tests — both printed above with their terms and both kept visible in their superseded
form** (`§13.4`; the status block; `§8`). **A reader who finds a superseded reading anywhere in this
file must treat the `§13.1`–`§13.7` clause that names it as the current one.**

**13.9 THE TRACKER ROWS THIS AMENDMENT TOUCHED** (`AGENTS.md` item 6; **anchored edits only — never a
whole-file write**, `RCA-8(c)`; the supervisor owns the tracker rows and may restate them): (1)
**`docs/next-steps.md`** — the **post-division-rebuild CURRENT WORK area** carries an appended
**AMENDMENT LANDED** paragraph above the PD-VENDOR gate-5 row, stating that the five owed amendments are
written and naming the `§13` ledger, the discharged `A-1` restatement, the superseded readings and the
`A-3` verification **at its envelope/tooling layer**; and (2) **`docs/pending.md`** — the
**POST-DIVISION REBUILD** row carries an appended 2026-09-28 annotation naming the same amendment and the
restated leg bound. **Neither edit rewrites a row or moves a row id.**

---

## 12. The amendment ledger (2026-09-28) — the four adjudicated items, each with its layer and its evidence

**This section is CONTRACT, not commentary.** It exists so a TestWriter, an Implementer, a blind-greens
writer or a later doc reviewer can see **which reading is current** without re-deriving it. **Its layer is
DOC-LAYER**; **every measurement in it is a RUN-READING of the supervisor's run of 2026-09-28 or a
VERIFIED-BY-READ of this amendment pass, marked per clause; this pass ran nothing.** The four items below are
the four the amendment was authorised to adjudicate — **it adjudicates nothing else, and it widens no other
surface.** **⟨SUPERSEDED IN PART 2026-09-28 (SECOND AMENDMENT) — `§13`, printed ABOVE this section, is the
CURRENT-reading ledger: it corrects this section's suite membership (`C3`), its class-(i) evidence reading
and coverage bound (`C4`), its resolution mechanism (`X-2`), its run counts (`X-4`) and its dependency
posture (`X-5`), item by item. Every clause below is KEPT as this pass's reading; where the two disagree,
**`§13` is the later measurement.**⟩**

**12.1 ITEM 1 — `O-5` IS ANSWERED NEGATIVELY; `§0A` note 2's resolution claim is FALSIFIED, and the leg's
placement is RULED.** **Amended clauses:** the layer table's conformance-leg row · `§1.1` `O-5` (added as the
fifth escalation row) · `§1.3` `O-5` · `§0A` note 2 (the placement ruling and its three consequences) ·
`§1.2` (the vendored-suites row) · `§3.5` items 2/6/7. **Finding:** the first run read **11 files · 572
tests · 511 failed / 61 passed** with **3 of the 11 suites collecting ZERO tests** (RUN-READING). **RULING:**
the eleven vendored suites **STAY at `vendor/Provident-Electron/tests/` as BYTE COPIES**; the leg is **RED BY
CONSTRUCTION**; **`G-9` protects `vitest.config.ts` and forbids collecting them under the main config**, so
that route is closed; **moving them to a resolving depth is refused because it would break the byte-identity
the manifest records**; and the **generated-resolver route is ESCALATED, NOT TAKEN** (it would widen this
unit's surface beyond the four authorised items). **Consequences recorded:** (1) the pass condition is a
**named subset** (§3.5 item 4); (2) **three modules lose behaviour coverage** — `census`, `focus-model`,
`gutter-affordance` (§3.5 item 7); (3) a future green needs **a foundation-side change** (handed off,
`G-8`) **or a `G-9` pin-set amendment** (the architect's). **⟨AMENDED 2026-09-28 (SECOND AMENDMENT) —
CONSEQUENCES (1) AND (2) ARE SUPERSEDED IN SUBSTANCE: the "named subset" is now **EMPTY** (class (i) is red
for every collected suite — `C4`), and (2)'s three-module list is wrong in membership (`census`,
`gutter-affordance`, **`gutter`** for the zero-collection cause; **ALL FIFTEEN** for the evidence cause),
with `focus-model` **not** among them (`C3`; `§3.5` item 7; `§13.1 · §13.5`). Consequence (3) stands
unchanged and is now the **complete** discharge list (`§3.5` item 4's added clause 4).⟩**

**12.2 ITEM 2 — `O-3` IS DECIDED: the leg's pass condition is a NAMED SUBSET, and both red classes are
measured and named.** **Amended clauses:** `§0A` note 3 (classes `R-A`/`R-B`) · `§1.1` `O-3`'s status column ·
`§3.5` item 4 (the three-class table and what a future green would and would not mean) · `§3.5` item 2 (the
**8 + 3** split) · `D-2`/`D-4`/`D-8` · §6.4 · §8 · §10 item 9. **RULING:**
**(i) EVIDENCE ROWS** = the rows of the **eight collected** suites that drive the vendored module and assert
nothing about another repository — **these must pass**; **(ii) STRUCTURAL RED-BY-CONSTRUCTION** = all rows of
the **three uncollected** suites (`gutter-ui.test.ts`, `census.test.ts`, `focus-model.test.ts`) — **recorded
red with the reason, and evidence about nothing**; **(iii) FOUNDATION-REPO AUDIT RED-BY-CONSTRUCTION** = the
`git status --porcelain` diff-scope audits, the foundation's own `docs/specs/<unit>.md` reads, the
`designing-pages.md` **absence** probe, the foundation's frozen `dom-shim.ts` read, the `../package.json`
census — **recorded red with the reason, and NOT copy-fidelity evidence**. **What a future green means:**
class (i) green = **the bytes reproduce the pinned contract's behaviour as the foundation's own suite
observes it — `[T]`/`[H]` ENVELOPE-layer, never app-green (`RCA-12`)**. **A caveat on the measured `61
passed`:** that figure **mixes evidence rows with class (iii) rows that pass**, so **`61` is not a
copy-fidelity count** and must not be quoted as one (derivation from the run reading, this pass).

**12.3 ITEM 3 — THE THREE CONTRACT-VS-ROW CONTRADICTIONS, and which side is wrong in each.** Each is a
**REMAND to the TestWriter**: **no test is edited by this amendment** (`D-12`), and the implementer's refusal
to edit one was **correct**.

**(a) `tests/pd-vendor-manifest.test.ts` `P-TP-1` — THE ROW IS WRONG (finding `C-AM-1`).** Both of its
readings are driven by the **identical** perturbed closure, so the row requires an oracle to `FAIL` and
`PASS` on the same input — `md5(synth) === declared` **and** `md5(synth) !== declared` at once, a strict
contradiction for any manifest and every draw. **The spec's §0A note 4 / §2.4 item 3 / §3.2 items 3–4 are the
contract** and are **unchanged**: the `A2` oracle hashes **the shipped `src/shared/<x>.ts`** against the
manifest's declared `md5`. **THE CORRECTION THE TESTWRITER MUST MAKE:** implement the corrected property in
**`§4.1`** — **one drawn module**, the **shipped** oracle reading the shipped path and (`PASS` ⇔
`md5(shipped) === declared`), and the **discrimination stated as a pair of oracles on ONE perturbed
closure** — `oracleShipped` **MUST fail** and `oracleCopy` **MUST still pass** when **one byte of
`src/shared/<x>.ts`** is perturbed; the copy-reading is driven against the **unperturbed** bytes at its own
target (a synthetic copy path if no copy file exists, and the row says so). **The row id `P-TP-1` and the
`8`-attempt arithmetic are KEPT.** **Register consequence: printed in §4's amended tallies — `P-TP-1`'s term
stays `8`; the register grows to `8` rows and `115` attempts.**

**(b) `tests/pd-vendor-set.test.ts` `P-IM-3`'s edge row — THE ROW IS WRONG (finding `C-AM-2`).** The row
builds its edge set from **statements** (`6`, because `src/shared/gutter-affordance.ts` imports
`'./gesture-session.js'` **twice** — once as a **value**, `POINTER_TYPES`, once **type-only**,
`GestureHandle`) and compares it to the manifest's **`5` distinct-edge records**, and separately asserts the
manifest **must** carry the duplicate. **THE CONTRACT IS THE SPEC'S FIVE-RECORD `internalEdges`** (**§2.1**
item 5's arithmetic block; **§2.2** rule 8; **§4** `P-IM-3`), so **the manifest is RIGHT and the row is
WRONG**. **What the manifest MUST carry:** **exactly five** `(from, to)` records — `census→zones` ·
`gutter-affordance→gutter` · `gutter-affordance→gesture-session` (**ONE** record for the two statements) ·
`gutter→gesture-session` · `relocate→gesture-session` — and **`outOfSetImports: []`**. **THE CORRECTION THE
TESTWRITER MUST MAKE:** derive the comparison set as **DISTINCT `(from, to)` pairs** (dedupe the statements,
or key them as `from→to`), and — if the row still wants the statement count — assert **`6` statements / `5`
distinct edges** as a **separate, separately-named** row, never as the equality with the manifest. **The
"exactly five files carry any import" assertion and the two synthetic controls are UNCHANGED and CORRECT.**

**(c) `tests/pd-vendor-set.test.ts` `§2.1` item 6 — THE ROW IS WRONG (finding `C-AM-3`).** The row demands
**zero hits** after filtering `/shared/` out, but the spec's own `§2.1` item 6 **measures three legitimate
matches** — `from './pane-gutter.js'` ×2 (`src/renderer/renderer.ts`, `src/renderer/sidebar-panes.ts`) and
`from './theme.js'` (`src/renderer/renderer.ts`), the **stem collision the spec calls `C-7`** (VERIFIED-BY-READ
at those three sites, this pass). **A zero-hit form could only be satisfied by editing
`src/renderer/renderer.ts` — forbidden by `§3.6` and by the `C-7`/`R-3` reading — so the ROW is the wrong
side.** **THE CORRECTION THE TESTWRITER MUST MAKE:** the row's predicate is **"no hit resolves to a VENDORED
MEMBER"**, stated as an **exact set**, not an emptiness: assert the hit set is exactly the three above
(deriving each hit's specifier and checking it is **not** `./<name>.js` of any of the pin's fifteen **as a
module in this repo's `src/shared/`**), and keep the `/shared/` exclusion. **The spec's clause needs NO
change** and is annotated only to record the contradiction. **`§2.1` item 6's closing sentence *"the vendoring
is therefore inert"* is thereby restored to a satisfiable row.**

**(d) A FOURTH, ADJACENT READING THE TWO FILES DISAGREE ON, recorded so it is not re-derived (finding
`C-AM-4`, `DOC-DRIFT`, LOW).** `tests/pd-vendor-set.test.ts`'s `FILES_WITH_IMPORTS` doc-comment says
*"the other FIFTEEN carry none"* while the module set is **fifteen in total** — the landed ROW text at the
same place says **"the other TEN"**, which is **correct** (`5` files with imports + `10` without = `15`).
**The SPEC's §2.1 item 5 is correct as filed** (*"FIVE files carry any import at all; the other FIFTEEN carry
ZERO import statements"* — where *"the other FIFTEEN"* means **the twenty files of the foundation's
`src/shared/` directory**, of which `5` carry imports; the sentence is accurate about **the directory** and
reads wrong about **the fifteen-module set**). **The correction is a COMMENT fix in the TestWriter's file
(non-normative), and the spec's sentence is annotated with this reading rather than reworded.** **Annotated at
§2.1 item 5's arithmetic block.**

**12.4 ITEM 4 — `O-7` IS NOT DISCHARGED; ITS PATH IS RULED, the obligation is ROW-BEARING, and the
foundation-side gap is HANDED OFF.** **Amended clauses:** `§0A` note 7 · `§1.1` (the sixth deliverable) ·
`§1.2` (the allowed-surface row, with its two limits) · `§1.3` `O-7` · **§2.1 item 7b** (the five rules) ·
**§2.2** rule 9 (the optional manifest record) · **§4** `P-IM-4` · `D-11` · `§5` item 7 · `§9` item 8.
**RULING:** the re-declaration path is **`src/shared/foundation-return-shapes.ts`** (the implementer's
proposal, **ADOPTED**); it is **type-only** (no import of any kind), exports **all five** shapes, is **not** a
manifest-claimed member and **not** a baseline file, and the vendored bytes **stay unmodified**. **The
foundation is NOT patched** (`G-8`): the missing `export` on five declarations — shapes **returned by values
and taken by callbacks**, which a consumer therefore **cannot name** — is a **handoff item** (the
`docs/defects.md` row and its `docs/HANDOFF.md` counterpart under `## OPEN handoff items`), **owed to the
supervisor's writes** and **supplied as a reading by §9 item 8 of this file**.

**12.5 WHAT THIS AMENDMENT COULD NOT VERIFY (each marked UNVERIFIED, with what would settle it).** **No item
here is smoothed into a claim.**

| # | UNVERIFIED | What would settle it |
| --- | --- | --- |
| **1** | **The run readings themselves.** Every figure quoted from 2026-09-28 (`113/3` of `116` · `204 files / 4352 tests / 4 failed / 4303 passed / 45 skipped` · `typecheck` 0 · `build` 0 · `battery 184/0` · `15/15 REPRODUCED` · `11 files / 572 / 511 failed / 61 passed` · `CLEAN`/`SKIPPED`) is a **RUN-READING quoted as input**; **this pass held no shell and re-ran nothing**, and it did not read a run log. | Re-running the three legs at this head, or reading the supervisor's run record verbatim. **⟨AMENDED 2026-09-28 (SECOND AMENDMENT) — PARTLY DISCHARGED, NOT CLOSED. The blind pass ran the legs itself and its readings are: the unit's own rows `148 passed (148)` / `0 failed` (so `113/3` of `116` is **SUPERSEDED** — the remands landed and the count grew `116 → 148`); `npm test` `204 files (1 failed / 203 passed) · 4384 tests (1 failed / 4338 passed / 45 skipped)` (so `4352 / 4` is **SUPERSEDED**); `typecheck` exit `0` · `build` exit `0` · `battery 184 checks, 0 failures`; the leg `11 files / 572 / 511 failed / 61 passed` (the **totals reproduce exactly**); and `CLEAN` / `SKIPPED` both read as documented. STILL UNVERIFIED IN THIS FILE: those figures are a RUN-READING of the blind artifact — **the second-amendment pass re-ran nothing and read no run log**, so the superseded figures are kept visible with their dates beside the corrected ones (status block; `§8`; `§13.4`).⟩** |
| **2** | **`focus-model.test.ts`'s collection failure MECHANISM.** That it collects **ZERO** tests is a RUN-READING; **why** it does is **NOT established here** — its only `../src/shared/*.js` statement this pass could read is **type-only** (`import type { … } from '../src/shared/focus-model.js'`), which does not obviously explain an uncollectible file. The other two suites' mechanism **is** read (static **value** imports of `gesture-session.js` / `zones.js`). | The leg's own error output for that file, or a focused run of it alone. **Recorded as UNVERIFIED rather than asserted** — the placement ruling does not depend on it, but a later pass must not quote a mechanism this file did not measure. **⟨ANSWERED 2026-09-28 (SECOND AMENDMENT) — THE ITEM IS MOOT: `focus-model.test.ts` DOES **NOT** fail to collect. MEASURED it COLLECTS `78 tests` (`70 failed`) and IS DRIVEN; the third zero-collection suite is **`gutter.test.ts`** (a `REPO_ROOT`/`new URL` source-file walk surfacing as a `Failed Suites` `ENOENT`), and the "static value import" mechanism the first amendment attached to `focus-model.test.ts` is WRONG. The `census`/`gutter-ui` mechanisms it recorded **DO** reproduce (`X-1`; `X-6`; `§3.5` item 2; `§13.1`).⟩** |
| **3** | **The per-suite/per-row tally's composition.** **Which** of the `116` rows are the `3` red and **which** of the leg's `572` rows pass/fail per suite is **NOT read here**; the `8 collected / 3 uncollected` split is a **derivation from the brief's own statement** (*"a suite's `new URL(…)`… so three suites collect zero tests"*) plus this pass's read of the three files' import forms — **not** a re-measurement. | The leg's per-suite report. **A DONE row must quote it, not this table.** **⟨AMENDED 2026-09-28 (SECOND AMENDMENT) — THE LEG'S PER-SUITE REPORT HAS BEEN QUOTED: `theme 46/58` · `container 57/68` · `zones 54/58` · `overlay 57/69` · `menu-template 54/60` · `relocate 90/94` · `gesture-session 83/87` · `focus-model 70/78` (`failed/collected`) + `gutter`/`census`/`gutter-ui` `0/0`, with the split corrected to `9 collected / 2 zero-collection` — carried at `§3.5` item 2. The row-count note above is likewise superseded: the `116` rows are now `148` (§13.4).⟩** |
| **4** | **Whether the eight collected suites' class (i) rows are green today.** The brief names the leg's red classes (`O-3`) and not a per-row tally; **no claim in this file asserts a pass count for class (i)**, and §3.5 item 4's *"MUST PASS"* is a **condition**, not a reading. | The leg's per-row tally, with the class labels. **⟨ANSWERED 2026-09-28 (SECOND AMENDMENT) — THEY ARE **RED FOR EVERY COLLECTED SUITE** (`theme 46/58` · `container 57/68` · `zones 54/58` · `overlay 57/69` · `menu-template 54/60` · `relocate 90/94` · `gesture-session 83/87` · `focus-model 70/78`), each on the labelled module absence, so **class (i)'s evidence set is EMPTY**. The *"MUST PASS"* clause is thereby **VACUOUS AS EVIDENCE** and `§3.5` item 4's added clause 1 states the consequence normatively (`C4`; `§3a` `A-1` discharged; `§13.2`).⟩** |
| **5** | **`O-8`'s suite-count disagreement** (`§1.3`) — **still unresolved**: the proposal's `201 .test.ts` reading, this pass's `209`-path glob, the as-filed baseline `201 files`, and the post-landing `204 files` are **four figures from at least three tree states**, and **this amendment reconciles none of them**. | A `npx vitest list`/run reading at a **named** commit, taken with the vendored suites **excluded** as well as included, so the delta is attributable. |
| **6** | **The manifest's own content beyond the two reads made here.** This pass read `vendor/foundation.lock.json`'s `internalEdges` (**5 records**, correct per §12.3(b)) and `byteIdentity`; **it did not read the fifteen `md5` values, the `proposalTableAgreement` cells, or the `baselineFilesNotReplaced` list** — so **`15/15 REPRODUCED` is quoted, never checked**, and `P-IM-1`/`P-IM-2`'s current colour is **unknown to this pass**. | Reading the manifest in full, or re-running the `A2` row. |
| **7** | **Whether the vendored suites are BYTE COPIES of the pinned commit's files.** The brief states it (11 byte copies) and this pass read **their content and import forms**, but **no digest was compared by this pass** (`md5sum` was available to the supervisor, not used here on the vendored tree). | The manifest's per-module digests against the foundation tree, or the `A3` monitor's `CLEAN` reading **with its output read**, not summarised. |
| **8** | **`npm run divergence`'s current colour.** Quoted as **RED for an ENVIRONMENTAL reason** (`/dev/shm` denial → `SIGTRAP`); **not re-run here**, and the brief re-states it as RED at this head. **This unit claims nothing live.** | The leg's own output on a display with a usable `/dev/shm`. |
| **9** | **The `G-9` pin set's current colour** after the add of `tests/**` by the red set (three new `tests/pd-vendor-*.test.ts` files at **different names** from the one this spec planned). **The spec's §2.4 planned ONE file, `tests/foundation-vendor-manifest.test.ts`; the landed red set is THREE files, `tests/pd-vendor-set.test.ts` / `pd-vendor-drift.test.ts` / `pd-vendor-manifest.test.ts`.** That the bridge-mock census is **unchanged** (none of the three mocks `'electron'`) is the **supervisor's reading**; **this pass did not run the pin.** | Re-running `tests/unit-v5-migration-contract.test.ts`'s pins, or reading the census derivation's output. **Recorded because the file-name difference is a real, unannotated drift between §2.4's plan and the tree** — the **placement and the "one `it` per module" rule** are the parts of §2.4 that matter, and the landed three-file split satisfies them; **a later doc review must decide whether §2.4's single-file wording needs its own annotation.** |
