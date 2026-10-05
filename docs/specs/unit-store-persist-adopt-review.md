# U-STORE-PERSIST-ADOPT — GATE-1 RECORD (unit 2 of the store-adoption program, F2; the four-step proposal review + the STEP-0 semantics block + the verdict, the recorded SPLIT, and conditions C-1..C-11)

**Date: 2026-10-04 · Branch: `post-division-rebuild` (HEAD `c004dc0`) · Pass kind:** GATE RECORD, landed by the CHANGE-ANALYSIS step (the gate's step 4) from the three read-only step returns plus this pass's own **read-only** verification · **Layer (`RCA-12`, mandatory):** **DOC-LAYER + machine-data — `[T]`/`[H]`-PLANNED only; NOTHING here is app-green, envelope-green, store-green, engine-green or live-green.** Every figure below is `VERIFIED-BY-READ` (reader named), a `RECORDED READING` (measurer named), or `OWED` (owner named). **This pass ran no leg: no `npm test`, no `typecheck`, no `build`, no `git`, no `md5sum`; every digest cell is quoted from a named artifact or `OWED`.**

**The proposal:** NEW `src/main/store-channels.ts` (`STORE_FILE_GET`/`STORE_FILE_PUT`) + the Y-1/Y-2 handlers before the window + the atomic five-step write (`tmp`→fsync→rename→dir-fsync) + `bootRecord` + three `store.*` preload members + the renderer boot reorder (hand-off → `hydrate(bootHandoff)` → first envelope) + the tier-1 carrier `<userData>/provident-settings.json` with `schemaVersion` + the Q-5 module-store migration + `operator-settings-store.ts` re-homed + the persisted set "EXACTLY two files" + the HOST-PERSISTENCE re-annotation; verify `[T]`+`[H]`+a live boot battery.

**The admission authority:** the gate-1 for the admitted set is **DISCHARGED** by the architect's *"Add the store"* ruling (`docs/specs/foundation-rebuild-clone-review.md` §11, `RCA-8(f)` — the architect admits ROWS), recorded at `docs/specs/store-adoption-program.md` §2 row 2; the user separately instructed *"Proceed with store persist and security adopt waves"*. **This pass produces the unit's verdict + artifacts + the re-shaped unit set; delegation proceeds under the standing ruling — NO new user pause.**

**The three step returns (digest at §3):** **STEP-1 VALIDITY — `REVIEWABLE`** (twelve duties/must-fixes). **STEP-2 CRITIQUE — `WEAK`** (21 fork-line-cited CRITICALs). **STEP-3 ARCHITECTURE — `SPLIT — THREE UNITS` + `APPROVE-WITH-CONDITIONS` for the core (C-1..C-11)** with decisive rulings on the boot order, the persisted set, the migration, the re-home, the live leg and the sequential landing.

**Citation discipline.** `path` + **symbol** / **row id** / **§section**. **No line number appears in this file** (`docs/specs/requirement-catalog.md` §3.4 rule 7) — **EXCEPT the two amendment subjects, where the line IS the subject** (the gate's own allowance), and the `:1289` construction call, which is the cited site by symbol.

---

## §1. THE VERDICT — `APPROVE-WITH-CONDITIONS` (core unit), with the SPLIT recorded

| Verdict | Why it is NOT / IS the verdict |
| --- | --- |
| `PROCEED` | **NOT AVAILABLE.** The proposal as WRITTEN does not work: the boot reorder collides with **two LANDED byte-scan pins that go RED on arrival** (step 2; `VERIFIED-BY-READ` this pass in both files), the *"EXACTLY two files"* pin is **arithmetically false** against the fork's six userData sites, the persisted-set/migration/re-home fractions reach outside the plan's declared unit scope, and the live leg has no drivable seam (`--provident-user-data=`) in the fork. Unconditional `PROCEED` would launder a known-red landing as delegable. |
| `APPROVE-WITH-CONDITIONS` | **THE VERDICT — for the CORE unit, with the SPLIT recorded.** The proposal is a good idea on balance **as re-shaped**: its mechanism (channel + atomic write + hand-off ordering + carrier) is the facility's real persistence half, all its facts are byte-verified, and every CRITICAL is resolved by the architecture review's re-shape (C-1..C-11) + the three-way split. **C-1 — the amendment of unit 1's two landed pins — is BLOCKING and is this unit's own landing act**, under the **F1 member-7a precedent** (`foundation-rebuild-clone-review.md` §11's annotation: the pre-recorded register act `.toBe(2)` → `.toBe(3)`, granted by that gate). The shape is fixed by precedent: a **dated ANNOTATE-BESIDE** keeping each superseded literal visible + a **literal RE-STATEMENT in the SAME commit**. |
| `BLOCKED-ON-SEMANTICS` | **DOES NOT FIRE.** The STEP-0 run (§4) yields **8 rows, all `defined`, 0 `undefined-until-answered`, EMPTY open-semantics list**. The architecture review's eight named rows are each pinned to a source (FOUNDATION specs/bytes) or to unit 1's landed dossier; the gaps the critique found are **implementation/spec-naming duties (C-2..C-11)**, never undefined identifiers. No OPEN/OVERFLOW entry exists. |
| `FLAWED` | **NOT SUPPORTED ON THE EVIDENCE.** The reviews agree the mechanism is REAL and correctly stated: the store is landed and green at this head (`src/renderer/store-core-graph.ts` + `store-graph-references.ts` exist; `VERIFIED-BY-READ`), the construction call site exists at `src/renderer/renderer.ts`'s Runtime construction site feeding `storeGraphReferences(FILE_TIER_TOP_NAMES_FORK)` + `crossing: null` (`VERIFIED-BY-READ`), the six userData sites exist with the exact filenames (line numbers ARE the subject here; `VERIFIED-BY-READ`), and every critique CRITICAL is **fixable within the re-shaped unit set** — each is carried into C-2..C-11 with an owner. The predicate of `FLAWED` (the central mechanism cannot be made right) is not met. |
| `REJECTED` | **NOT SUPPORTED.** The adoption is the architect's explicit §11 ruling and the user's separate wave instruction; persistence is the facility's actual purpose (*"the data management issues that were blocking previous builds"*), the tier-1 carrier + channel wire is exactly what the ruling names for this unit, and the coherent core remainder (channel + atomic write + handlers + preload members + boot reorder, one atomic commit) is the ONLY landing the admitted set permits. The costs (below) are real and bounded — never a rejection ground. |

**Costs/benefits, for the record. Benefits:** the fork's data-management blocker is removed at its root (the store finally DURABLY crosses the `file` tier); one atomic-write discipline replaces a mixed plain-`writeFileSync` set; the boot order becomes an asserted ORDER (hand-off before the first envelope) rather than an accident; the `Y-2` single-sink rule is enforced at one channel. **Costs:** this unit's landing REDDENS two landed unit-1 guards until its own amendment lands in the same commit (C-1, blocking); the unit touches three files shared with units 2b/3 (`preload.ts`, `main.ts`, `renderer.ts`), forcing **sequential** landings and repeated `md5` re-statements; the `fsync` legs are shape-assertable only in node, so a durability claim is permanently unavailable from `[T]`; and the migration + re-home reach 2 landed suites + 7 renderer call sites — the reason both are split out.

---

## §2. WHAT THE PROPOSAL ASKS — and what it is NOT

**The delegable CORE unit (as re-shaped):** ONE atomic commit landing (i) NEW `src/main/store-channels.ts` (the two channel constants, single source) · (ii) the `Y-1`/`Y-2` handlers in `src/main/main.ts` wired BEFORE the window is created · (iii) the atomic five-step write (`tmp` → fsync → rename → dir-fsync) + `bootRecord` + the carrier `<userData>/provident-settings.json` with `schemaVersion` minted on first write · (iv) the three `store.*` preload members in `src/main/preload.ts` · (v) the `src/renderer/renderer.ts` boot reorder (§5's exact sequence) + the crossing feed REPLACING the `crossing: null` literal at the existing construction call · (vi) **the C-1 amendment of unit 1's two landed pins** · (vii) the spec + this gate-1 record + the STEP-0 dossier · (viii) the `[T]`/`[H]` register and the materialized live battery (or its NAMED park).

**What it is NOT (external owners, named):** **`U-STORE-MODULES-MIGRATION`** (the Q-5 module-store migration) · **`U-OPERATOR-SETTINGS-REHOME`** (the operator-settings re-home onto the carrier) · **`U-STORE-SECURITY-ADOPT`** (`provident-security.json`'s own carrier + the `secure` tier) · the FOCUS/MODULES/PANE-DRAG/READS/LANES units · any new MCP tool/resource/group/method (`P-16` — the store is never agent-addressable; the three preload members are renderer↔main IPC) · the fork's four non-UI-config carriers (OUT OF SCOPE BY NAME, §6) · **NOT** a durability claim from node evidence.

---

## §3. THE THREE SUB-REVIEWS — digest and disposition

### Step 1 — VALIDITY: `REVIEWABLE` (must-fixes, all carried)

| # | Duty (digest) | Disposition |
| --- | --- | --- |
| 1 | **memoization** — `getWiredGraphStore` builds ONCE, so the call's `crossing: null` must be **REPLACED**, not re-called | **CARRIED** — §5's memoization clause + the amendment row; `VERIFIED-BY-READ`: the realm binding constructs only when `null` |
| 2 | **boot order** — the reorder cannot be appended past the `if (!bridge)` guard | **CARRIED** — §5: the hand-off is a NEW gate MIRRORING the proven `if (bridge?.security)` shape, placed BEFORE the Runtime construction |
| 3 | **"exactly two files"** arithmetically false — SIX userData files + the vector cache + per-store RAG files | **CARRIED** — §6's re-scope (UI-CONFIG family, others by name) |
| 4 | no `scripts/electron-ui.mjs`, no `--provident-user-data=` seam in the fork (`VERIFIED-BY-READ`: absent) | **CARRIED** — §8's live-leg row (ADD the seam, or park with a NAMED reason) |
| 5 | **`schemaVersion` is not zero-hit here** | **CARRIED** — dossier row 4's note; the spec names the collision at its own gate |
| 6 | the **operator-settings collision** undecided | **CARRIED** — §7: DEFERRED to `U-OPERATOR-SETTINGS-REHOME` |
| 7 | the migration's second writer class (`src/main/mcp-server.ts`) outside scope | **CARRIED** — §7: SPLIT to `U-STORE-MODULES-MIGRATION` |
| 8 | **NW-17 preload set-equality row has no fork home** | **CARRIED** — §6's obligations: the spec must name the fork home or file it as not-adopted with a rationale |
| 9-12 | the subsumption covers only the four adopted tokens, NOT the unit's NEW identifiers; the live battery IS genuinely owed; the pins' fork-line homes; the handler/ordering duties | **CARRIED** — the dossier's rows 1–8 + §8's live-leg row + §9's sequential order |

### Step 2 — CRITIQUE: `WEAK` (21 CRITICALs — fork-line-cited, each resolved by the re-shape)

| Finding (digest) | Disposition |
| --- | --- |
| the boot reorder **COLLIDES with unit 1's two LANDED pins** (`tests/pd-store-core-adopt.test.ts` — any `hydrate(` hit ⇒ RED; `tests/store-core-adopt-register.test.ts` `P-STORE-CORE-H` — pins `crossing: null` + zero `hydrate(` + the construction site); both `VERIFIED-BY-READ` this pass) | **RESOLVED — C-1 BLOCKING**, the amendment row (§10), same commit, annotate-beside + re-statement |
| the **no-bridge posture** undeclared | **RESOLVED — C-5**: §5 declares where the reorder sits relative to the no-bridge early-return, and what a no-bridge boot does (no hand-off → no hydrate → the crossing is not fed) |
| the **fsync legs structurally un-drivable in node** (shape ≠ durability) | **RESOLVED — C-6**: dossier row 2's mandatory disclosure; the `[T]` rows assert the CALL SEQUENCE only; the live leg carries what node cannot |
| the migration's **array→keyed payload change reddens landed module suites** | **RESOLVED BY THE SPLIT** — the migration becomes `U-STORE-MODULES-MIGRATION` with its own gate/red set |
| the **reserved-namespace refusal not armed** (`reservedNamespaces` defaults to `[]`; the fork passes none — `VERIFIED-BY-READ`) | **RESOLVED — C-7**: the spec either arms it (naming unit 1's call-site change) or records it NOT ARMED with its own gate |
| the **operator-settings re-home** breaks 7 renderer call sites + 2 landed suites (one pinning the file BY RECORDED `md5`, where it is also the `UNRESTATED_CONTROL_PATH` — `VERIFIED-BY-READ`) | **RESOLVED BY THE SPLIT** — `U-OPERATOR-SETTINGS-REHOME` owns the re-statement |
| the live battery's `/dev/shm` precondition head-dependent with no named park reason | **RESOLVED — C-8/§8** |
| units 2+3 **SHARE `preload.ts` + `main.ts` + `renderer.ts`** (cannot land in one wave) | **RESOLVED — C-10/§9**: SEQUENTIAL landings, each re-stating the `md5`-pinned rows in its own commit |
| **no row separates "the channel wrote the file" from "the channel was never invoked"** | **RESOLVED — C-9**: a positive-invocation row + a not-invoked negative, distinct subjects |
| the three remaining CRITICAL classes (boot-order authority; the persisted-set arithmetic; the migration scope) | **RESOLVED** — §5 / §6 / §7 respectively |

### Step 3 — ARCHITECTURE REVIEW: `SPLIT — THREE UNITS`; `APPROVE-WITH-CONDITIONS` for the core (C-1..C-11)

**Decisive rulings carried verbatim:** (i) the boot reorder's exact form + **the two landed pins AMENDED by the F1 member-7a precedent** (C-1 BLOCKING) · (ii) the persisted-set re-scope to the UI-CONFIG family with the others OUT OF SCOPE BY NAME with owners · (iii) the migration SPLIT OUT · (iv) the re-home DEFERRED · (v) the live leg = add the `--provident-user-data=` seam + a boot-order probe, or park with a NAMED reason · (vi) units 2/2b/3 land SEQUENTIALLY, each re-stating `tests/pd-ui-1-theme-register.test.ts`'s `md5` rows · (±) the STEP-0 dossier with the eight named rows and collisions K-1..K-5.

---

## §4. THE SEMANTICS BLOCK (STEP 0 run) — REQUIRED

| Field | Reading |
| --- | --- |
| **Dossier path** | `docs/specs/unit-store-persist-adopt-adoption-dossier.md` (**written by this pass**, same commit as this record) |
| **Content-hash snapshot** | **Line census (the file-read tool's own line census — the F1 precedent's named instrument, `wc -l`-equivalent): dossier `59` lines · this record `189` lines — both taken THIS pass at this head, reader: the change-analysis pass, measured immediately after writing. NOTE: the line census is a READING of the filing's bytes, never the content hash; later amendments must re-take it and keep the superseded figure visible (`RCA-8(c)` annotate-beside).** **`md5`: `OWED` — this wall holds no shell and no digest instrument** (the F1 precedent: the drafting pass holds no shell; the supervisor's shell-bearing pass discharges the cell). **Owner: the supervisor's shell-bearing pass; instrument `md5sum`; commands `md5sum docs/specs/unit-store-persist-adopt-adoption-dossier.md` and `md5sum docs/specs/unit-store-persist-adopt-review.md`; recorded at this head. The re-take moves with any later in-place amendment (this record's own §4 census is a FILING reading, taken before nothing since it is the last edit of this pass).** |
| **Open-rows inventory** | **0 open.** Row tally: **8 rows (≤ 8 — cap CLOSED), `defined`: 8, `undefined-until-answered`: 0** — `STORE_FILE_GET` (1) · `STORE_FILE_PUT` (2) · `provident-settings.json` (3) · `schemaVersion` (4) · `bootRecord` (5) · `Y-1`/`Y-2`/`Y-3` (6) · the channel refusal tokens, SUBSUMED from unit 1 (7) · the unit-1 subsumption citation row (8). **Origins: 5 FOUNDATION · 2 SUBSUMED · 0 FORK** |
| **Open-semantics list** | **EMPTY (none).** No identifier row stands `undefined-until-answered` and no OPEN/OVERFLOW entry exists. The overflow discipline: every further name (the `store.*` preload spellings, the re-home surface, the migration payload) is carried by NAMED OWNERSHIP in §2/§6/§7 — never dropped, never silently adopted |
| **Architect answers** | **"none pending — the standing §11 ruling + the user's wave instruction cover the admitted set; the spec must name conditions C-1..C-11."** No identifier-semantics question is open. **Effect on the verdict: none beyond the conditions themselves — `APPROVE-WITH-CONDITIONS` WITH the open list EMPTY** |
| **Collision block** | `K-1`..`K-5` (dossier §3) — **every hit reconciled by row id, by unit/namespace ownership, or by the dated pre-recorded amendment; NO prohibition row relaxed; NO re-name requested** |

---

## §5. THE BOOT-ORDER ROW (keyed `boot-order`) — the exact sequence and the "first envelope"

**The sequence, exact (all `VERIFIED-BY-READ` at this head unless marked):** (1) the **hand-off** — a NEW gate in `main()`, **MIRRORING the proven `if (bridge?.security)` shape** (`renderer.ts`'s `maxJournalLength` read: the same `try/catch` + fail-soft-to-default posture), calling the `store.get` channel; (2) **`hydrate(bootHandoff)`** — synchronous, fed by (1)'s answer; (3) **the FIRST ENVELOPE** = the **placeholder bootstrap envelope** at the existing `placeholderEnvelope` binding (`LegacyInitialData`, `DEFAULT_CONTENT_WINDOW_TEMPLATE`, empty `content`) — **constructing `new Runtime({ mount, envelope: placeholderEnvelope, maxJournalLength })` and its `runtime.bootstrap()` is the atomic pair that consumes it**; (4) the crossing is fed at the **EXISTING construction call** (`getWiredGraphStore({ declarations: …, crossing: <the live crossing> })` — the site the `crossing: null` literal occupies today), **conditional on `bridge?.store`**; (5) the `if (!bridge)` early-return follows, unreordered.

**The MEMOIZATION CLAUSE (startup-fatal if violated).** `getWiredGraphStore` builds the store **ONCE** — the realm binding constructs only when `null` (`VERIFIED-BY-READ`: `let wiredGraphStore: GraphStore | null = null` + the guarded assignment). Therefore the crossing must be **REPLACED at the EXISTING call**, never "re-called with an argument": a second call cannot re-feed a live store and would silently no-op. **A `getWiredGraphStore(...)` call added beside the existing one is a FINDING.**

**The NO-BRIDGE POSTURE (declared, C-5).** With no bridge there is no hand-off channel: the gate is skipped, `hydrate` is not called, the crossing is not fed (the store stays unit 1's inert `crossings: 1`-with-zero-puts state) — and the existing `if (!bridge)` early-return still fires with its warning. The posture is DECLARED at the spec, never inferred.

**The LIVE-BATTERY identification.** The "first envelope" the battery's ORDER row asserts is the placeholder above — the live row asserts the hand-off is ANSWERED before that envelope pair runs (an ORDER, never a timing figure).

---

## §6. THE PERSISTED-SET ROW (keyed `persisted-set`) — three classes, owners named

| Class | Files | In the pin? | Owner |
| --- | --- | --- | --- |
| **A — UI-CONFIG FAMILY (the pin's subject)** | **`provident-settings.json`** (this unit's tier-1 carrier) + **`provident-security.json`** (post-migration) | **YES — the pin is re-scoped to exactly this pair** | this unit (settings) + `U-STORE-SECURITY-ADOPT` (security) |
| **B — FORK CARRIERS OUT OF SCOPE BY NAME** | `provident-modules.json` · `provident-rag-stores.json` · `provident-template.json` · `provident-engine-config.json` — plus `provident-operator-settings.json` until the re-home | **NO — declared out of scope BY NAME, never silently** | the module store → `U-STORE-MODULES-MIGRATION`; the operator-settings file → `U-OPERATOR-SETTINGS-REHOME`; the RAG registry/template/engine config → their own existing owners (NOT this program's units) |
| **C — ACCRUED / NON-CARRIER ARTIFACTS** | the RAG **vector cache** · **per-store RAG artifacts** (per-store directories) | **NO — recorded, not counted** | the RAG subsystem's existing owners |

**The arithmetic, stated (critique CRITICAL, `K-4`):** `src/main/main.ts` mints **SIX** userData paths for class-A/B files; the fork additionally writes class-C artifacts. **"EXACTLY two files" is therefore FALSE as a whole-tree pin and TRUE only as a class-A pin.** The spec must state the pin in the class-A form. **A persisted-set claim asserted over a file its census does not cover is a false pin, never a bound.**

---

## §7. THE DECOMPOSITION ROW (keyed `decomposition`) — `SPLIT — THREE NAMED UNITS`

| Field | The row |
| --- | --- |
| **`disposition`** | **`SPLIT — THREE NAMED UNITS`** |
| **Named fractions** | **(a) `U-STORE-PERSIST-ADOPT` (THE CORE — the delegable unit of §2):** the channel file, the `Y-1`/`Y-2` handlers, the atomic five-step write, `bootRecord`, the three preload members, the boot reorder, the carrier + `schemaVersion`, the C-1 amendment, the `[T]`/`[H]` register, the live leg. **(b) `U-STORE-MODULES-MIGRATION` (2b):** the Q-5 module-store migration onto the carrier — its second writer class (`src/main/mcp-server.ts`), the array→keyed payload change, and the landed module suites that change red→green. **(c) `U-OPERATOR-SETTINGS-REHOME` (DEFERRED, successor named):** `operator-settings-store.ts`'s re-home onto the carrier, the 7 renderer `operatorSettings` call sites, and the 2 landed suites — including `tests/pd-ui-1-theme-register.test.ts`'s recorded-`md5` row where the file is also the `UNRESTATED_CONTROL_PATH` (`VERIFIED-BY-READ`). |
| **Boundary** | The core is the **MECHANISM** (a channel that durably carries the `file` tier + the boot order that feeds it). The two successors are **CONSUMERS of one carrier**: (b) migrates a fork-owned payload onto it, (c) merges a fork-owned store into it. Neither is required for the mechanism to work, and both change landed suites in ways that are their own red sets. `U-STORE-SECURITY-ADOPT` (unit 3) is the third carrier author. |
| **Why the remainder is the coherent core** | The core's members share ONE atomic-commit property: the channel constant, its handler, the preload member that reaches it, the crossing that feeds it, and the boot order that hydrates from it are **unclaimable as sub-states** — a channel without its preload member is unreachable, a crossing without the channel is a no-op, a boot order without both is a reorder with nothing to order. The two split-out fractions each begin with a **landed-suite change**, which is exactly the property that makes them non-atomic with the above. **No member of the core is a consumer-payload migration.** |

---

## §8. THE LIVE-LEG ROW (keyed `live-leg`)

**RCA-11/RCA-12 position: the live battery IS GENUINELY OWED** (step 1's validity finding; program plan §5 row 2: *"YES — the boot/persistence battery; ORDER claimed, never a timing figure"*). **It is NOT parkable-by-default.**

**The blocker, `VERIFIED-BY-READ`:** the fork has **no `scripts/electron-ui.mjs`** and **no `--provident-user-data=` seam** (the absence named in step 1; `package.json`'s script set carries no such entry). A battery asserting a persisted re-boot order needs a **controlled userData root** — without the seam the live leg has no drivable precondition.

**THE RULING (step 3 (v), adopted):** the unit must **ADD the `--provident-user-data=` seam** (a boot-argument seam feeding `app.setPath('userData', …)`, owned as a first-class member of this unit's landing) **plus a boot-order probe** — **OR** park the leg with a **NAMED reason**. **No unnamed park is permitted.** If parked, the park reason must name the STRUCTURALLY non-exercisable surface (`RCA-11` clause (b)), and the battery ships as `*-live-pending-battery.md` marked OPEN/live-pending — **never green/DONE**. **The `/dev/shm` precondition, if the seam lands, is head-dependent** (a display/precondition head the battery must record or reject by name) — never assumed.

---

## §9. THE UNITS-ORDER ROW (keyed `units-order`) — sequential

**Units 2 (core), 2b (`U-STORE-MODULES-MIGRATION`) and 3 (`U-STORE-SECURITY-ADOPT`) SHARE `src/main/preload.ts` + `src/main/main.ts` + `src/renderer/renderer.ts`** (step 2's CRITICAL, `VERIFIED-BY-READ` for all three paths: they are the unit-3 and unit-2 edit sites alike). **Therefore they CANNOT land in one wave.** **Ruling:** **SEQUENTIAL landings — 2 → 2b → 3** (2b may interleave after 2; 3 follows), each in its own commit with its own red→green cycle. **The re-statement mechanism:** each landing **re-states `tests/pd-ui-1-theme-register.test.ts`'s recorded `md5` rows in ITS OWN commit** (`UNTOUCHED_DIGESTS` — `preload.ts` is already a superseded/re-stated row there, `VERIFIED-BY-READ`), because every wave moves that file's bytes. **An un-recorded `md5` move fails the ⟨A-1⟩ digest limb** — so an un-re-stated landing is red, by construction.

---

## §10. THE AMENDMENT ROW (keyed `amendment`) — C-1, BLOCKING, the F1 member-7a precedent

| # | The pin (file + the line that IS the subject) | The superseded literal | The amendment act |
| --- | --- | --- | --- |
| **A-1** | **`tests/pd-store-core-adopt.test.ts`** — arm 5's **frozen-contract limb**, the zero-match `hydrate(` scan of `src/renderer/renderer.ts` (`VERIFIED-BY-READ`: the scan and its `HYDRATE-AT-BOOT` failure string) | **zero `hydrate(` calls in the boot wiring** | **dated ANNOTATE-BESIDE** keeping the zero-match reading visible as unit 1's own state, **plus a RE-STATEMENT** in the same commit: the amended arm asserts the count the unit's spec names (the ONE hydrate call the boot order introduces) and the falsifier becomes ≥2 calls or a call outside the declared gate |
| **A-2** | **`tests/store-core-adopt-register.test.ts`** — row **`P-STORE-CORE-H`**'s byte-scan construction-site pin (`VERIFIED-BY-READ`: the required-literals list, the `if (!bridge)` ordering limb, and the zero-`hydrate(` limb) | **the `crossing: null` literal** + **zero `hydrate(` calls** (the ordering limb — the construction call before the no-bridge early-return — **STANDS and is NOT amended**) | **dated ANNOTATE-BESIDE** + **RE-STATEMENT in the same commit**: `crossing: <the live crossing>` (subject to the §5 memoization clause — REPLACEMENT at the existing site) and the one declared `hydrate(` call; the ordering limb is re-stated UNCHANGED |
| **A-3** | **`tests/pd-store-core-adopt.test.ts`** — arm 4's no-preload-`store`-member negative (`VERIFIED-BY-READ`) | **no top-level `store` member in the preload** | **dated ANNOTATE-BESIDE** + **RE-STATEMENT in the same commit**: the negative moves from *"no store surface"* to *"exactly the three `store.*` members this unit's spec names"* — the teeth RELAX NOTHING (`K-3`) |

**The precedent, cited:** the F1 gate GRANTED exactly this class of act as a **pre-recorded register/pin act** — `foundation-rebuild-clone-review.md` §11's annotation records *"the pre-recorded member-7a register act (the `G-3` clause-count assertions `.toBe(2)` → `.toBe(3)`)"* landing inside F1's ONE atomic commit. **C-1 is the same class: a pre-recorded, dated, in-commit amendment of a landed pin whose subject this unit legitimately changes.** **C-1 is BLOCKING: the unit cannot land green without it, and the amendment is the unit's OWN landing act — not a separate unit, not a later pass.** **Discipline (binding):** annotate-BESIDE (a superseded literal is never deleted) + RE-STATEMENT in the SAME commit + a DONE row naming the amended pin. An amendment that deletes a superseded literal, or lands in a later commit, is a FINDING.

---

## §11. THE ACCEPTANCE CONDITIONS C-1..C-11 — the spec must name them (the standing ruling grants them)

| # | Condition | Source finding |
| --- | --- | --- |
| **C-1** | **BLOCKING** — the THREE landed pin rows amended per §10 (A-1 and A-2 are the two byte-scan pins the critique named; A-3 is the preload negative arm of the same guard): dated annotate-beside + literal re-statement in the same commit; the `P-STORE-CORE-H` ordering limb re-stated UNCHANGED | step 2 CRITICAL; step 3 (i); the F1 member-7a precedent |
| **C-2** | the boot order lands EXACTLY as §5 (the mirrored hand-off gate; `hydrate` before the `new Runtime` + `bootstrap()` pair; the crossing at the EXISTING call; the placeholder envelope IS the "first envelope") | step 1 duty 2; step 2 no-bridge CRITICAL; step 3 (i) |
| **C-3** | the **memoization clause** is named as a falsifiable duty: the crossing is REPLACED at the existing call; a second `getWiredGraphStore(...)` call is a finding | step 1 duty 1; step 3 (i) |
| **C-4** | the persisted-set pin is stated in the **class-A form** only, with classes B and C declared OUT OF SCOPE BY NAME with owners (§6); the "exactly two files" wording never appears as a whole-tree claim | step 1 duty 3; step 2 CRITICAL; step 3 (ii) |
| **C-5** | the **no-bridge posture** is declared (§5), and the `if (!bridge)` early-return is not reordered | step 2 CRITICAL; §5 |
| **C-6** | the atomic five-step write's **node evidence is SHAPE only** — the register asserts the CALL SEQUENCE; no durability claim from any node-green; the honest layer split is recorded | step 2 CRITICAL; dossier row 2 |
| **C-7** | the **reserved-namespace refusal** is either ARMED (naming the construction-option change at unit 1's call site) or recorded **NOT ARMED** with its own gate — never claimed armed | step 2 CRITICAL; dossier row 7 |
| **C-8** | the **live leg** per §8: ADD the `--provident-user-data=` seam + a boot-order probe, OR park with a NAMED reason referencing `RCA-11` clause (b); never parked-by-default; a parked leg ships OPEN/live-pending, never green | step 1 duty 4; step 2 CRITICAL; step 3 (v); `RCA-11` |
| **C-9** | the register carries **DISTINCT rows** for *"the channel wrote the file"* (a positive invocation + the bytes on disk) and *"the channel was never invoked"* (a not-invoked negative) — two subjects, never one | step 2 CRITICAL |
| **C-10** | the **sequential landing order** (§9): 2 → 2b → 3, each re-stating `tests/pd-ui-1-theme-register.test.ts`'s recorded `md5` rows in its own commit | step 2 CRITICAL; step 3 (vi) |
| **C-11** | the **SW-17/`NW-17`-class preload set-equality row** gets a fork home at the spec (an explicit census row) or is filed **not-adopted with a written rationale** — never left with no home | step 1 duty 8 |

---

## §12. THE PENDING-OBLIGATIONS LIST — each with its OWNER

| # | Obligation | Owner | State here |
| --- | --- | --- | --- |
| **O-1** | the digest cells (this record's + the dossier's `md5`) | the supervisor's **shell-bearing pass** (`md5sum`, at this head; commands named at §4) | **⟶ DISCHARGED 2026-10-04 BY THE SUPERVISOR'S SHELL (instrument `md5sum`): dossier `c9f5f88f254520e96243ba96d3e7e12a` (59 lines) · this record `90bae8a70483ebfff796c020bccbde0e` (189 lines) — taken at this head; a later in-place amendment moves them and owes a re-take.** |
| **O-2** | the **HOST-PERSISTENCE re-annotation** (`docs/decisions.md` `HOST-PERSISTENCE-SINK-BOUNDARY-AND-HOST-SIDE-OWNERSHIP`) | this unit's **tracker half** (the F1 record's `O-3` carry) | **OWED — this unit's; the `HOST-PERSISTENCE-ATOMICITY-AND-CONSISTENCY` defect row was annotated `2026-10-04` by unit 1 and remains OPEN** (`VERIFIED-BY-READ`) |
| **O-3** | the `grading`/`greens` + item-10d documentation review of the landed core | the landing pass + the item-10d reviewer (`RCA-6`) | **OWED — the landing's own gates** |
| **O-4** | the `U-STORE-MODULES-MIGRATION` gate-1 (its own dossier, red set, and the module suites' re-statement) | that unit | **OWED — named successor** |
| **O-5** | the `U-OPERATOR-SETTINGS-REHOME` gate-1 (the 7 renderer call sites + the 2 landed suites + the `md5` re-statement) | that unit | **OWED — named successor** |
| **O-6** | the adversarial pass + the materialized/`live-pending` battery per §8 | the landing's own cycle (`RCA-3`/`RCA-11`) | **OWED** |

---

## §13. What this gate authorises — and what it does NOT

**Authorised:** `APPROVE-WITH-CONDITIONS` + the standing §11 ruling → the spec gate files `docs/specs/unit-store-persist-adopt.md` naming **C-1..C-11** → the core unit's own cycle (spec → red → green → trio → adversarial → item-10d) → then units 2b and 3 **sequentially**. **NOT authorised:** anything before the spec names C-1..C-11 · landing WITHOUT the C-1 amendment in the same commit · the migration or the re-home inside the core unit · a whole-tree "exactly two files" claim · a durability claim from node evidence · a parked live leg with no named reason · any new MCP surface · any write under `../Provident-Electron/**`. **Nothing in this record is app-green, envelope-green, store-green, engine-green or live-green.**

---

## Cross-references (path + symbol / row id / §section — never a line number)

`docs/specs/unit-store-persist-adopt-adoption-dossier.md` (the STEP-0 dossier: rows 1–8, subsumption record, collisions `K-1`..`K-5`) · `docs/specs/unit-store-persist-adopt.md` (the spec, OWED — names C-1..C-11) · `docs/specs/store-adoption-program.md` §1 rows 3/4 · §2 row 2 (KEPT VERBATIM + the ANNOTATE-BESIDE re-shape block) · §3 · §5 · `docs/specs/unit-store-core-adopt-review.md` + `docs/specs/store-core-adopt-adoption-dossier.md` (unit 1's gate-1 + dossier; rows 1/2/7/8 subsumed) · `docs/specs/unit-store-core-adopt.md` §1.2 (`R-5`; the DENIED rows 4/5/6 this unit opens) · `docs/specs/foundation-rebuild-clone-review.md` §11 (the standing ruling; the member-7a annotation; clause (5)'s `RCA-8(f)`) · `docs/specs/post-division-rebuild-proposal.md` §6.2 · `src/main/main.ts` (`getPath('userData')` · the six carrier sites · the Y-1/Y-2 handler neighbourhood) · `src/main/preload.ts` (`operatorSettings` · the bridge exposure · the `IPC_SECURITY_*`/`IPC_MODULE_*` neighbours) · `src/main/store-channels.ts` (NEW, OWED) · `src/main/operator-settings-store.ts` (`createOperatorSettingsStore`) · `src/main/mcp-server.ts` (the migration's second writer class) · `src/renderer/renderer.ts` (`getWiredGraphStore` · the construction call site · the `if (!bridge)` guard · `placeholderEnvelope` · `new Runtime` + `bootstrap()`) · `src/renderer/sidebar-panes.ts` (`operatorSettings` call sites) · `tests/pd-store-core-adopt.test.ts` (arms 4/5 — the amendment subjects) · `tests/store-core-adopt-register.test.ts` (`P-STORE-CORE-H`) · `tests/pd-ui-1-theme-register.test.ts` (`UNTOUCHED_DIGESTS` · `UNRESTATED_CONTROL_PATH`) · `tests/representation-mode.test.ts` · `tests/unit-live11-bridge-seams.test.ts` · `docs/decisions.md` `UI-CONFIG-CARRIER` · `MULTI-STORE-REGISTRY` · `HOST-PERSISTENCE-SINK-BOUNDARY-AND-HOST-SIDE-OWNERSHIP` · `docs/defects.md` `HOST-PERSISTENCE-ATOMICITY-AND-CONSISTENCY` · `../Provident-Electron/docs/specs/store-persist.md` §2.1/§2.2/§2.3/§2.5/§2.6/§2.7 · `../Provident-Electron/docs/specs/store-core-graph.md` §2.4 · `../Provident-Electron/docs/decisions.md` `E10-SINGLE-SINK-CHANNEL` · `FOUR-TIER-DATA-OWNERSHIP-MODEL` · `docs/specs/rca-live-bugs-green-pipeline.md` (`RCA-11`/`RCA-12`) · `docs/specs/requirement-catalog.md` §3.4 rule 7 · `AGENTS.md` items 3/8/9/10.
