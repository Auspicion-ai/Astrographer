# Change-Analysis Verdict — the Requirement Catalog (`docs/requirement-catalog.md`) + the advisory pruning register

- **Kind:** proposal-gate FINAL VERDICT (step 3 of the three-agent gate,
  `AGENTS.md` item 8) — the record that closes the proposal gate and opens (or
  refuses) the spec gate.
- **Proposal:** the user request *"Create a catalog of all behavior that is
  currently expected of application based on user feedback. This will be used to
  pare down obsolete code, test, and docs"*, as shaped by the **approved
  architecture**: Artifact 1 `docs/requirement-catalog.md` (§C.0–§C.8, the 16
  capabilities, Tier-1 rollup, Tier-2 pruning register, upstream-owed ledger,
  frozen enums, derivation manifest, conflicts, change log); Artifact 2 three
  additive columns on `docs/specs/user-flow-audit-checklist.md`; Artifact 3
  `scripts/catalog-derive.mjs` (deterministic read-only generator); Artifact 4
  `tests/requirement-catalog-contract.test.ts` (doc-layer contract test).
- **User decisions carried:** corpus = **everything in-repo incl. upstream-owed
  requests**; the pruning register is **ADVISORY ONLY** with **per-item user
  sign-off before any deletion**.
- **Reviewer:** change-analysis agent. **This record is the step-3 deliverable;
  NO existing file was edited by this pass** (the only write is this new file).
- **Inputs:** the proposal + the approved architecture; **validity =
  VALID-WITH-AMENDMENTS**; **critique = PROCEED-WITH-AMENDMENTS**; **architecture
  = ARCHITECTURE-APPROVED-WITH-AMENDMENTS**; `AGENTS.md` items 2/3/4/6/7/8/9/10 +
  RCA-1..RCA-12; `docs/next-steps.md`; `docs/decisions.md` (D-GP-UFA-1..4
  `:22-25`, DEC-1 `:14`, `:29`); `docs/defects.md` (`:24-30`, report-#3 rows
  `:72-78`); `docs/pending.md` (`:6-20`, `:121`, `:181-213`); `docs/HANDOFF.md`
  (`:37-91`); `docs/specs/user-flow-audit.md` §1/§2/§3/§4/§6; the full
  `docs/specs/user-flow-audit-checklist.md` (16 sections, "**Total ≈ 112 rows.**"
  `:332`); `tests/live-drive-contract.test.ts`; `tests/unit-o0-m1-m3-driver-contract.test.ts`;
  `scripts/live-drive.mjs` (`:1699-1733`, `:2366+`, `:3543`);
  `src/shared/o0-report.ts`; `docs/specs/unit-o0-m1-m3-measurement-shape.md`
  (§15), `docs/specs/unit-o-0-per-stage-measurement.md` (`:3292`),
  `docs/specs/unit-o-0-per-stage-breakdown.md` (NINTH edition);
  `docs/specs/astrographer-scope-realignment-review.md` (§2.2 C7/C8, §6);
  `package.json`, `tsconfig.json`, `vitest.config.ts`.

---

## 1. VERDICT

**PROCEED-WITH-AMENDMENTS.** The *catalog* is the right artifact and the user's
two decisions (in-repo corpus; advisory-only register with per-item sign-off)
make it safe. The **code half as written is mis-gated and partly
unsatisfiable**, and the **prune-criterion's negative clause is unsound by
construction**. Four things change: (a) split the **doc-only catalog unit** from
a **named follow-up generator+test unit**; (b) re-scope the contract test's
byte-identity assertion to a **frozen fixture** so the trio is not coupled to
mutable tracker prose; (c) require **positive negative evidence** for
`escalate-prune`; (d) keep a **git-visible prune tombstone** instead of deleting
the register row. With those, the proposal is a good idea on balance.

Decisive reasoning (max ~10 lines):

1. The artifact is the missing inverse index of this doc set. The repo already
   has forward indexes (`docs/defects.md`, `docs/decisions.md`, `docs/pending.md`,
   `docs/HANDOFF.md`, the checklist) but **nothing that maps "behavior currently
   expected" → "its origin" → "its consumer"**, which is exactly what a prune
   decision needs; user feedback exists in at least four un-joined places
   (reports #1/#2 docs, the report-#3 prose block, the defects rows, the
   decisions rows).
2. The user's constraints remove the danger the critique worried about: the
   register cannot delete anything and every prune needs the user's own sign-off.
   A wrong `keep` costs nothing; a wrong `escalate-prune` is caught by sign-off —
   **provided the criterion does not manufacture candidates from absent
   evidence**, which is amendment C7.
3. Artifacts 3 and 4 are **code**. Under `AGENTS.md` item 3 + item 9 + the PBT
   gate, a code-bearing unit owes its own spec, a typed §5.x register, a
   TestWriter red run, an Implementer green, an RCA-3 adversarial pass, an RCA-4
   blind-greens run, an RCA-6/item-10d doc review and the trio. Fusing that onto
   the catalog buys a mechanical census but **puts the user's deliverable behind
   a PBT cycle** and violates the repo's own precedent that doc-only work is
   exempt (`astrographer-scope-realignment-review.md` §2.2 C8 "**the register
   exemption is explicit and scoped to the doc artifacts only; the trio is not
   owed this pass**", §6 "Doc-only ⇒ no red set, no trio").
4. Artifact 4 as architected is **self-defeating**: (a) asserts the derived
   region is byte-identical to a fresh run, and (b) hard-fails on an unresolvable
   in-repo pointer — while three of its six inputs (`docs/next-steps.md` = prose
   under three headings `:22`/`:273`/`:605`; `docs/pending.md` = six different
   row vocabularies with **no ID column** `:6-13`; `docs/decisions.md` =
   ID-bearing titles **plus** provenance rows with no ID of their own `:15-19`)
   have no stable row ids, and item 6 **mandates** tracker edits on every landing.
   As written it is unsatisfiable on landing day and red after every future pass.
5. A generated `last_verified` (§C.2/§C.3 MIRROR field) is in direct tension
   with determinism: any `Date.now()`/mtime source makes (a) unpassable.
6. `code_anchor` — the field a pruning register most needs — **cannot be verified
   by a generator that never reads `src/**`**; the doc layer can only check
   "non-empty and not a line number". That is a layer-honesty issue (RCA-12) and
   is the strongest argument for the split.
7. The O-0 oracle-identity hazard is real but **fully containable**: the identity
   is a djb2 composite of exactly two files (`scripts/live-drive.mjs:1709-1720`).
   A new-file-only, docs-only unit cannot touch it — the architecture's boundary
   just needs three path additions (amendment C5).
8. Cost: this is cheap in its doc-only form (one pass, no trio, one-diff
   revert), expensive only in the deferred half (one full code gate cycle).
9. Benefit: it converts the repo's chronic status-lag (four superseded
   "CURRENT WORK" blocks in one file) into a **query-able origin map**, and gives
   every future "can we delete this?" question an evidence pointer instead of an
   archaeology exercise.
10. Residual risk if I am wrong: the register rots between the doc-only landing
    and the generator unit, and a reader mistakes a hand-authored MIRROR cell for
    a derived one — bounded by C1's `derived:false` marker and by the fact that
    no deletion can happen without the user.

---

## 2. WHAT THE PROPOSAL ASKS (as approved)

| Artifact | Path | Kind |
| --- | --- | --- |
| 1 | `docs/requirement-catalog.md` (NEW) | ADVISORY catalog; §C.0 scope/non-authority; §C.1 the 16 capabilities as a **closed partition**; §C.2 Tier-1 capability×surface rollup (~40 rows); §C.3 Tier-2 pruning register (~90 rows, `PRUNE-###`); §C.4 upstream-owed ledger (~25 rows, non-prunable by construction); §C.5 frozen provenance/direction enums; §C.6 derivation manifest; §C.7 open conflicts + waivers; §C.8 change log |
| 2 | `docs/specs/user-flow-audit-checklist.md` (MODIFIED) | +3 columns (`Provenance \| Direction \| Catalog`) on all rows; **additive only** |
| 3 | `scripts/catalog-derive.mjs` (NEW) | deterministic read-only generator; 6 tracker inputs + 4 out-of-repo existence checks; writes only inside `<!-- catalog:derived:begin/end -->`; emits MIRROR columns + manifest + id census; never reads `src/**`; byte-identical re-run; hard-fail on an unresolved in-repo pointer |
| 4 | `tests/requirement-catalog-contract.test.ts` (NEW) | doc-layer contract test (a)…(f); declares the doc-only layer (RCA-12) |

Row schema: 13 fields, **6 MIRROR** (generated, hand-edit forbidden) + **7
JUDGMENT** (authored, status verbs forbidden); `status_pointer` is a pointer to
the owning tracker row (never copied status text); `verdict ∈ {keep,
keep-advisory, escalate-prune, invalidated-conflict, merged-into:<id>}`;
`prune_signoff ∈ {none, user-approved:<date>}`.
Rules: **tracker = sole status authority** (on disagreement the tracker governs
and the row freezes at `invalidated-conflict`); prune criterion = *"no
requirement origin of ANY kind (user / decision / pinned spec / upstream
contract) AND no non-test consumer AND no live-confirmed regression pin"*;
`stale` rows may never be pruned; a landed prune deletes its register row in the
same pass and archives to `archive/catalog/<date>-pruned.md`; owner = the
documentation reviewer (item 10d); citation discipline = symbols only; sequencing
= its own doc-only unit **after the O-5 spec lands and before O-5's TestWriter red
run**, with a hard boundary on `src/shared/o0-report.ts` + `scripts/live-drive.mjs`.

---

## 3. CHANGE INVENTORY

### 3.1 Created

- `docs/requirement-catalog.md` — new ADVISORY doc (the deliverable).
- `scripts/catalog-derive.mjs` — **deferred** under this verdict (C1).
- `tests/requirement-catalog-contract.test.ts` — **deferred** under this verdict (C1).
- `archive/catalog/<date>-pruned.md` — only after a signed-off prune; **gitignored**
  (`AGENTS.md` item 6: "the GITIGNORED `archive/` dir"; `docs/pending.md:15`
  repeats the convention for its own retirements) ⇒ **not version-controlled** (C8).

### 3.2 Modified

- `docs/specs/user-flow-audit-checklist.md` — three columns appended to the
  5-column row shape (`| ID | Flow/Element | Spec ref | Proposed live assertion |
  Coverage |`, e.g. `:93`, `:104`, `:123`) in §1–§14, plus a restatement in the
  "Coverage vocabulary" block (`:21-25`) that the new columns are **non-verdict
  metadata**.
- `docs/next-steps.md` — a DONE row (→ `## DONE` `:605+`) and a queue entry for
  the deferred generator unit (→ `## OPEN` `:273+`).
- `docs/decisions.md` — one new ACTIVE row (advisory status + sole-status-authority
  + the prune gate + the D-GP-UFA amendment clause of C6).
- `docs/defects.md` — one new OPEN row for the **dangling "report #3" citation**
  (see §3.5).
- `docs/specs/user-flow-audit.md` — a §2 note: the checklist gained metadata
  columns; **§5.U stays U-1..U-8 and `MATRIX_ROWS` is unchanged** (C6).

### 3.3 NOT touched (pinned by this verdict)

- `src/**` (**no** edits at all — any `src` edit invalidates the recorded bundle
  identity of the ninth O-0 leg, RCA-11).
- `scripts/live-drive.mjs` and `src/shared/o0-report.ts` — the two files whose
  content hash IS the recorded oracle identity.
- `docs/specs/unit-o-0-per-stage-breakdown.md` — the artefact parsed by the live
  pins (`tests/unit-o0-m1-m3-driver-contract.test.ts:56-59`, `:448-528`;
  `tests/unit-o0-m1-m3-adversarial-pins.test.ts:196`) and byte-round-trip verified.
- `docs/specs/unit-o-0-per-stage-measurement.md`, `docs/specs/unit-o0-m1-m3-measurement-shape.md`
  — the O-0 contract records.
- `scripts/live-drive.mjs`'s `BLOCKS`/`MATRIX_ROWS` tables, `package.json`,
  `tsconfig.json`, `vitest.config.ts`, `docs/HANDOFF.md` (unless an unindexed
  upstream-owed item is found — then an index row only, `docs/HANDOFF.md:39-91`).

### 3.4 Blast radius on existing docs

- **No existing cell is rewritten** in the checklist (`docs/decisions.md` D-GP-UFA-1
  calls it "the full ~112-row census"; the row-ID set is the closed enumeration
  `docs/specs/user-flow-audit.md:35-36`, so **row ids must not be added, removed or
  renumbered**).
- **`tests/live-drive-contract.test.ts` is NOT affected**: it reads
  `scripts/live-drive.mjs` source text only (`:57-58`) and parses the exported
  `MATRIX_ROWS` literal; its checklist citation is a comment (`:6`). Verified: no
  test in `tests/**` reads the checklist or any tracker file (grep over
  `tests/*.ts` for `checklist|next-steps.md|decisions.md|pending.md|defects.md`
  returns comments only).
- **`scripts/live-drive.mjs` reads no tracker**: its only doc-path constants are
  recorded strings, not reads (`:501-502`, used at `:1996`/`:2014`), and its
  `readFileSync` sites are bundle-identity/oracle hashing (`:1660`, `:1711`) plus
  fixture writers (`:142-143`, `:2526`, `:2986`, `:3072`). **Adding columns to the
  checklist cannot change any live-drive behaviour.**
- **`docs/HANDOFF.md`**: unchanged; §C.4 is a pointer ledger over
  `docs/HANDOFF.md` + `docs/pending.md` §"UPSTREAM foundation requests" +
  `docs/feature-requests/*` (GR-1..GR-9, SC-1..SC-7, PS-1, the four Gnosis
  handoff rows) — count it, don't assert it (C11).

### 3.5 The tracker rows the landing pass must write (exact set)

1. `docs/next-steps.md` → **DONE row** for the doc-only catalog unit: layer stated
   per RCA-12 ("**DOC-LAYER ONLY** — verifies no envelope/app behavior"), the
   doc-only gate exemption cited (`astrographer-scope-realignment-review.md` §6 +
   §2.2 C7/C8), the review record path, the §C.4/§C.3 counts as *derived* figures,
   and the pointer to the deferred generator unit.
2. `docs/next-steps.md` → **OPEN/queue row** for the deferred generator+test unit
   with a **named trigger** (first prune-candidate request, or the first tracker
   row edited after the catalog lands).
3. `docs/decisions.md` → **one ACTIVE row**: the catalog is ADVISORY; the tracker
   is the sole status authority; every prune requires `prune_signoff:user-approved:<date>`;
   the D-GP-UFA amendment clause (C6). If any earlier row is contradicted, a
   **SUPERSEDED** row in the same table (never a silent deletion).
4. `docs/defects.md` → **one OPEN row** for the dangling citation: *"report #3"* is
   cited as a source by `docs/decisions.md:29` ("user requirement 2026-09-16
   (report #3 follow-up)"), by the seven C1–C7 defect rows
   (`docs/defects.md:72-78`), by `docs/next-steps.md:160` and by
   `docs/specs/session-feedback-doc-audit-2026-09-16.md:64-70` — **but no report-#3
   document exists**; the committed reports are report #1
   (`docs/specs/user-demo-bug-report-2026-09-15.md`) and report #2
   (`docs/specs/user-demo-bug-report-2-2026-09-15.md`), and report #3 exists only
   as the prose block at `docs/next-steps.md:160`. Fix shape (AGENTS.md item 6c,
   "never leave a citation pointing at a moved file"): commit report #3 as a
   document **or** repoint every citation to the next-steps block; record which.
5. `docs/pending.md` → **only if** the user defers the generator beyond the
   catalog landing: a **SCHEDULED** row (`:10`) with the named trigger — never an
   unowned "deferred" item without a revisit condition.
6. `docs/specs/user-flow-audit-checklist.md` + `docs/specs/user-flow-audit.md` →
   the additive columns + the two non-authority notes of C6.
7. **The landing pass must be the LAST writer before any derive** (C2): its own
   tracker rows change a generator input.

---

## 4. GATE-IMPACT ANALYSIS — three options (the decision the supervisor asked for)

Facts that bound all three options:

- **Trio shape:** `npm test` = `vitest run` (`package.json:19`) over ~**221 files /
  4 988 passed / 58 skipped** (`docs/next-steps.md:41`); `npm run typecheck` =
  `tsc --noEmit -p tsconfig.json` with **`include: ["src/**/*.ts"]`, `exclude:
  ["node_modules","dist","tests"]`** (`tsconfig.json:15-16`); `npm run build` =
  esbuild over `src/` entries only (`package.json:10`).
  ⇒ A new `scripts/catalog-derive.mjs` is **outside both the typecheck leg and the
  build leg**; its only verification is the new vitest file. Tests are excluded
  from typecheck too.
- **Doc-only precedent is explicit and recent**: "**Doc-only ⇒ no red set, no
  trio**" + a "doc artifacts only" register exemption
  (`astrographer-scope-realignment-review.md:339-344`, §2.2 C8 `:183-187`), with a
  **zero-new-matrix-rows** claim recorded rather than silent (C7 `:180-182`).
- **The suite is the repo's hard gate** and must stay hermetic: the current
  contract test refuses to import a module-scope-executing script and reads its
  source instead (`tests/live-drive-contract.test.ts:11-17`) — the house
  convention for harness pins.

### Option (i) — DOC-ONLY (no generator, no test)

- **Gate cost:** minimal. One doc-only pass; no spec-register, no PBT, no red run,
  no adversarial pass, no blind-greens, no trio. Exactly the C8 precedent. The
  catalog lands in the O-5 window without competing with the queue lead.
- **Drift risk:** high and **unbounded in time** — MIRROR cells are hand-authored
  against six trackers that item 6 requires every landing to edit; there is no
  census, so "which tracker rows are not in the catalog?" is unanswerable. This
  repo's own RCA-6 exists because batched/manual reconciliation produced "stale
  test-counts, phantom return fields, and renumbered sections" (`AGENTS.md`
  item 10d).
- **Pruning correctness:** the criterion's second and third clauses (no non-test
  consumer, no live-confirmed regression pin) are *grep-shaped* and a human will
  do them inconsistently; the sign-off gate still protects the user.
- **Verdict on (i):** acceptable fallback, but it forfeits the artifact's main
  mechanical value and pushes the rot onto the user's pruning decisions.

### Option (ii) — ONE CODE-BEARING UNIT (catalog + generator + test together)

- **Gate cost (per `AGENTS.md` items 3/9/10 + the PBT gate):** one spec with a
  typed §5.x register (≤8 rows, ≤100 attempts/row, ≤400 total — the pinned house
  convention), a TestWriter red run reported per unit, an Implementer green, an
  RCA-3 adversarial pass, an RCA-4 blind-greens set, an RCA-6/item-10d doc
  review, and the trio green. That is ~6 gates for a **documentation index**, and
  under RCA-2/RCA-5 the catalog's *content* work (the 16-capability partition, the
  ~90 judgment rows, the user sign-off dialogue) would share one unit with the
  code, which is precisely the "multi-unit deliverable inlined as one pass"
  anti-pattern the repo already paid for.
- **Unsatisfiability (the decisive objection):** as architected, the contract test
  couples the trio to **mutable tracker prose**: it asserts (a) byte-identity with
  a fresh generator run and (b) that every in-repo pointer resolves, while
  `docs/next-steps.md` has no rows at all (three headings, `:22`/`:273`/`:605`),
  `docs/pending.md` has **no ID column** (six row vocabularies, `:6-13`) and
  `docs/decisions.md` carries ID-less provenance rows (`:15-19`). Two
  consequences: it is unsatisfiable on landing day, and — because item 6 *requires*
  a tracker edit on every landing — **the trio would go red after every future
  pass** until the generator is re-run, coupling every unit in the repo to this
  one's freshness. A suite that reddens on prose churn will be loosened, and the
  loosening will be the RCA.
- **Determinism inside the trio:** assertable only if the generator is
  import-safe (the module-scope `main()` hazard is documented at
  `tests/live-drive-contract.test.ts:11-17`) or invoked as a child process; and
  only if the derivation has **no** time/mtime input (a generated `last_verified`
  as specified has one). If the test writes into `docs/` during `npm test` it also
  breaks hermeticity — a self-inflicted adversarial finding.
- **Repo's paid-for RCAs:** RCA-1/RCA-2/RCA-5 (battery B/C/D inline + tests
  after), RCA-3 (adversarial pass missing), and the run 5→9 sequence where every
  harness-shape defect (`F5-x`, `F7-1`, `F8-x`, `F9-1`) was discovered *after* the
  shape had been committed. `F7-1` in particular was a **harness ordering defect
  that made an accepted form unreachable by construction** — the same class as
  Artifact 4(a) here. The lesson is: land the doc target first, then derive
  against a shape that already exists.
- **Verdict on (ii):** **reject as written.**

### Option (iii) — TWO UNITS (doc-only catalog first; generator+test as its own named unit) — **RECOMMENDED**

- **Unit 1 (doc-only):** Artifacts 1 + 2 + the §3.5 tracker rows. Gate cost: the
  doc-only exemption; the DONE row records the layer (RCA-12) and the exemption
  citation. MIRROR columns land **marked `derived:false` / PROVISIONAL** so nothing
  can mistake them for generated output.
- **Unit 2 (code-bearing, deferred with a named trigger):** `scripts/catalog-derive.mjs`
  + the contract test, authored **against the register that already exists**
  (real target, not a speculative shape). Full gate: spec + §5.x register + red +
  green + RCA-3 adversarial + RCA-4 blind-greens + RCA-6 doc review + trio.
- **Drift between the units:** real but bounded — the interval is one named
  trigger, the register is explicitly provisional, and the only consumer of the
  register is a *human-gated* pruning decision, so drift cannot delete anything.
- **Cost/benefit:** one cheap doc pass now (the user's ask delivered), one honest
  code gate later (with a stable contract); total gate cost is lower than (ii)
  because the code unit is authored once against a known target instead of being
  re-shaped after a mid-flight discovery.
- **Residual risk if this recommendation is wrong:** the follow-up unit is never
  scheduled and the register rots. Mitigation: the DONE row + the queue row carry
  the named trigger, and the catalog's own §C.8 change log records each pass in
  which the register was re-verified — so rot is visible rather than silent.
  Second residual: a reader treats a provisional MIRROR cell as authoritative —
  mitigated by `derived:false` + §C.0 and by the fact that no deletion is possible
  without the user's per-item sign-off.

---

## 5. INTERACTION AUDIT (in-flight track)

### 5.1 The O-5 queue state (claim verified)

- `docs/next-steps.md:120` — "**the O-5 gate is SATISFIED and O-5 LEADS
  UNCONDITIONALLY** … (1) **O-5 — UNBLOCKED** (the NINTH edition's LIVE form is
  the accepted artifact and the oracle that certifies it is named and was sound:
  `driver.oracleIdentity` `92a74b7d`, the §3b clauses exercised live)".
- **No O-5 spec file exists**: `docs/specs/*o-5*` → no files; grep for `unit-o-5`
  across `docs/**` → no matches. Confirmed: the queue leads with a unit whose spec
  is unwritten.

### 5.2 The oracle-identity hazard — precisely what invalidates it

Mechanism (`scripts/live-drive.mjs:1699-1733`): `o0OracleIdentity()` computes a
djb2 hash of **`src/shared/o0-report.ts`** (200 143 B → `b89d6f19`) and of
**`scripts/live-drive.mjs`** (→ `194dfece`), then `composite = hash("b89d6f19:194dfece")`
= **`92a74b7d`**, recorded in the report (`:2007`) and in the NINTH edition
(`docs/specs/unit-o-0-per-stage-breakdown.md:88`, `:798`; `docs/next-steps.md:39`;
`docs/specs/unit-o-0-per-stage-measurement.md:3292`;
`docs/specs/unit-o0-m1-m3-measurement-shape.md` §15 rows `:2759`, `:2771`).

**Invalidated by:** any byte change to either file — a new block, a new flag, an
import, a comment, whitespace. Then the ninth edition's recorded identity no
longer describes the current oracle, and RCA-11's rule applies (a changed harness
invalidates prior live provenance ⇒ re-run → §3b re-audit → doc review — the exact
cost the repo paid across runs 7/8/9). **Not invalidated by:** new files
(`scripts/catalog-derive.mjs`, tests, docs) or edits to other docs.
**Separately:** any `src/**` edit changes the bundle content hash
(`3e3f1b80`/`1e652667`) and therefore the recorded *bundle* provenance (RCA-11),
so the unit must not touch `src/**` at all, not merely "not read it".

**Can this unit do it?** Not if the boundary holds, and the boundary makes it
**impossible by construction**: (1) the generator lives in a **new** file —
`scripts/catalog-derive.mjs` — never inside `live-drive.mjs`; (2) its input set
excludes both hashed files and all of `src/**`; (3) no `src/**` edits; (4) no new
live-drive block; (5) no edits to the O-0 artifact/spec records (which are parsed
by the live pins, §3.3). The architecture names (1)/(2) and the two paths; **C5
adds (3)/(4)/(5) and a cheap mechanical proof** — record both content hashes before
and after the landing pass.

### 5.3 The checklist columns vs D-GP-UFA-1..4 and `user-flow-audit.md` §5.U/§6.1

- **No conflict with the cap.** D-GP-UFA-1 (`docs/decisions.md:22`) pins the
  *per-pass live input* as `docs/specs/user-flow-audit.md` §2, "the ACTIVE
  delta-matrix (U-1..U-8)", and calls the checklist "the full ~112-row census".
  The cap (≤8) is on **§5.U U-rows** (`user-flow-audit.md:25-28`, `:32`), not on
  checklist rows. Adding three columns changes **no row id and no row count**, so
  the "closed enumeration" of row ids (`user-flow-audit.md:35-36`) is intact and
  the exemption register (`:52-55`) is untouched.
- **No conflict with D-GP-UFA-4** (`:25`): the §6.1 report schema pins the
  *report* fields (`row`/`block`/`verdict`/`assertion`/`dclass`/`realInput`/
  `evidence`/`proxyPASS`/`surface`) and `summary.total == MATRIX_ROWS.length`
  (`user-flow-audit.md:59-61`, `:94-103`). Nothing in the report is derived from a
  checklist column; `MATRIX_ROWS` lives in `scripts/live-drive.mjs`
  (`:2366+`) and stays untouched.
- **Residual interaction (the one to amend):** D-GP-UFA-2 (`:23`) forbids a proxy
  oracle from yielding an accepted PASS, and each checklist row's **`Coverage`**
  cell is that row's live-status cell. A new **`Catalog`** column pointing at a
  `PRUNE-###` row could be misread by the §6.2 auditor (or a future agent) as a
  coverage/verdict claim — i.e. a new proxy surface inside the very file the audit
  reads. Also: the file says "**Total ≈ 112 rows.**" (`:332`) and D-GP-UFA-1 says
  "~112", so the architecture's flat "112" is an **approximation promoted to a
  count**.
- **Minimal amendment (C6):** (i) restate in the "Coverage vocabulary" block
  (`:21-25`) that the three new columns are **non-verdict metadata**, that
  `Coverage` remains the only live-status cell, and that no prune verdict lives in
  the checklist (pointers only); (ii) add a §2 note in `docs/specs/user-flow-audit.md`
  that the checklist gained metadata columns, §5.U stays U-1..U-8, `MATRIX_ROWS`
  and the §6.1 schema are unchanged, and **zero new matrix rows** are claimed
  (C7-style, recorded not silent); (iii) land the amendment as a decision row so
  the D-GP-UFA family stays the authority; (iv) record the **derived** row count
  instead of "112".

### 5.4 Sequencing (one amendment)

The architecture slots the unit **after the O-5 spec lands and before O-5's
TestWriter red run**. The oracle hazard does not require that slot (doc edits
cannot touch the hashes), and the slot has a cost: a doc-only pass landing between
an in-flight unit's spec and its red run puts a **moving doc under an in-flight
unit** and buys nothing — O-5's tests read `src/`, not the trackers; the only
doc-reading pins are the O-0 artifact/live pins, which C5 forbids touching anyway.
**C12** therefore allows either **before the O-5 spec** or **after O-5's DONE row**,
never inside O-5's spec→red window. (If the supervisor keeps the mid-window slot,
the landing pass must re-run the O-5 red set afterwards — extra cost for no gain.)

---

## 6. RISK LEDGER

| # | Risk | Likelihood | Impact | Mitigation in the design | Missing mitigation (this verdict) |
| --- | --- | --- | --- | --- | --- |
| R1 | **Rot** — MIRROR/JUDGMENT cells drift from the trackers | **High** (item 6 edits trackers every landing; the repo already lags — four superseded CURRENT WORK blocks in `docs/next-steps.md`) | Medium (advisory only, but it misleads the user's pruning) | MIRROR/JUDGMENT split; tracker-as-sole-authority; `last_verified`; the generator's census (deferred) | Unit-1 marks MIRROR cells `derived:false`/PROVISIONAL; the update trigger must cover **doc-only/tooling passes** too (item 10d only runs for units with specs); §C.8 change log records every re-verification (C1) |
| R2 | **Misuse as deletion authority** — an agent treats `escalate-prune` as a warrant | Medium | **High** (deletes user-expected behavior/tests/docs) | §C.0 non-authority; `verdict` enum; `prune_signoff:user-approved:<date>`; `stale` rows never pruned; user decided per-item sign-off | A **hard rule**: no deletion may cite the catalog as its authority — the deletion's justification must be the user's sign-off + the tracker row (C7/C8); the register is not citable as a status source |
| R3 | **A wrong "no user origin" claim** — the criterion's first clause is absence-based | **High** (the repo demonstrably has unwritten/dangling user provenance: report #3 exists only as prose; `report #3` is cited 10+ times as if it were a document) | **High** (a real user requirement pruned) | `origin_search`-like evidence pointer; per-item user sign-off; §C.7 records the dangling citations | **C7**: `escalate-prune` requires POSITIVE negative evidence (a recorded search over the enumerated sources + date + result), a documentation-reviewer confirmation, and a one-cycle cooldown; a `user-*` row or a row with a dangling citation **freezes at `keep-advisory`, never escalates** |
| R4 | **Conflict with D-GP-UFA/DEC rows** — the column edit read as a matrix/schema change | Low–Medium | Medium (a mis-verified live gate) | Additive-only edit; no row-id change | **C6**: the two non-authority notes + a decision row + a derived row count |
| R5 | **The checklist edit read as a matrix change** by the §6.2 auditor | Medium | Medium (an audit `reject` against an unchanged matrix) | Columns are visibly metadata | C6(i)/(ii) + the §6.1 schema statement of no-change |
| R6 | **The generator becomes a second source of truth** | Medium–High | High (two contradicting status sources; `docs/next-steps.md` already carries four generations of status) | `status_pointer` only (no copied status); tracker governs; `invalidated-conflict` freeze | A citation rule: no tracker may cite the catalog for **status**; the catalog cites trackers, never the reverse; the MIRROR region is never hand-edited (contract test (a) — fixture-scoped, C2) |
| R7 | **Trio coupled to mutable docs** — the contract test reddens on every tracker edit | **High** if Artifact 4 lands as architected | **High** (blocks unrelated units; invites loosening the test) | — | **C2/C3**: determinism asserted over a **frozen fixture snapshot**; the live check is a non-gating staleness report; no `Date.now()`/mtime in the derived region; the test never writes during `npm test` |
| R8 | **`last_verified` breaks determinism** | High (as specified) | Medium (assertion (a) unpassable) | — | C3 |
| R9 | **`code_anchor` unverifiable at the doc layer** (the generator never reads `src/**`) — a symbol that no longer exists still reads "valid" | High | **High** for pruning correctness | The generator "never reads `src/**`" was intended as a safety boundary | **C9**: `code_anchor` is declared ADVISORY in the catalog; resolution is a CODE-layer check in the deferred unit (or a read-only audit), which may READ `src/**` and may never edit it |
| R10 | **Prune audit trail destroyed** — the register row is deleted at landing and `archive/` is gitignored | **Certain** once the first prune lands | High (provenance + reversal cost) | Archive copy in `archive/catalog/<date>-pruned.md` | **C8**: a git-visible tombstone ledger (PRUNE id, date, sign-off, commit, deleted paths/spans) + the deletion commit names the ids |
| R11 | **Silent under-coverage** — a fixed 6-input set excludes new specs (e.g. O-5's, due next); the ~40/~90/~25 counts are estimates | Medium–High | Medium–High (a "closed partition" that silently omits live requirements) | The 16-capability partition is closed at the capability level | **C11**: exact counts derived; every `docs/specs/unit-*.md` is either an input or explicitly recorded as excluded with a reason |
| R12 | **O-0 oracle-identity / bundle-provenance invalidation** (`92a74b7d`; `3e3f1b80`/`1e652667`) | Low if the boundary holds; High cost if not (re-run → §3b re-audit → doc review) | **High** | The two-path boundary + "never reads `src/**`" | **C5**: extend to **no `src/**` edits**, no O-0 artifact/spec edits, no new live-drive block; record `b89d6f19`/`194dfece` before and after |
| R13 | **Line-number discipline collides with the trackers** — the inputs are saturated with line-number citations (`docs/defects.md` rows cite `src/renderer/runtime.ts:1047-1068`; `docs/pending.md` cells cite `main.ts:751` etc.), so a MIRROR derivation that copies sentence text violates the catalog's own rule (e) | Medium | Medium (self-contradicting register; a flood of pseudo-findings) | Cell rule (e) | **C10**: the rule binds catalog-authored cells only; MIRROR columns carry ids/anchors, never copied prose; a tracker-side line-number census is at most an advisory §C.7 aggregate |
| R14 | **Doc-freeze ordering trap** — the landing pass's own tracker rows change a generator input, so the committed region is stale unless the derive is the last write | High (mechanical) | Medium | — | C2 (fixture scoping) + the landing-pass order note (§3.5 item 7) |

---

## 7. REVERSIBILITY

- **As a doc-only unit (recommended):** **yes, a single diff.** New files
  (`docs/requirement-catalog.md`) delete cleanly; the checklist columns are purely
  additive (removing three columns restores the 5-column shape verbatim — no
  existing cell was rewritten); the tracker rows are removed or, for decisions,
  **marked SUPERSEDED rather than deleted** (house convention,
  `docs/decisions.md:3-5`).
- **Landing the code half:** also a single diff while it is `NEW` files only —
  provided the generator writes **only** its sentinel region and no other file.
  The `archive/reviews/<date>-<unit>-doc-review.md` record is gitignored and
  vanishes regardless of a revert (accepted convention).
- **After a signed-off prune — NOT reversible as one diff.** Each prune is its own
  deletion diff; the design **deletes the register row in the same pass**, and the
  archive copy lands in the **gitignored** `archive/` tree. So after N prunes the
  catalog no longer enumerates what it authorized, and `git revert <catalog unit>`
  restores nothing — reconstructing the pruned set means walking N deletion
  commits and re-deriving whether each had sign-off. Cost of a single mistaken
  prune: recover the paths from git history + the commit message + (if unlucky)
  the archived register, then re-add and re-derive; cost of a mistaken **prune
  policy**: an unbounded archaeology pass over deletions that were never recorded
  in a git-visible ledger. **C8 removes both costs** (tombstones + PRUNE ids in the
  commit message), and it is cheap: it is a ledger row, not a new mechanism.

---

## 8. CONDITIONS (must hold before authoring starts)

**C1 — SPLIT THE GATE.** Land **Unit 1 = doc-only** (Artifacts 1+2 + the §3.5
tracker rows) under the doc-only exemption (`astrographer-scope-realignment-review.md`
§2.2 C8 + §6), with MIRROR cells marked `derived:false`/PROVISIONAL. Defer
`scripts/catalog-derive.mjs` + `tests/requirement-catalog-contract.test.ts` to a
**named follow-up code-bearing unit** (its own spec, §5.x typed register, red run,
green, RCA-3 adversarial, RCA-4 blind-greens, RCA-6 doc review, trio) with a named
trigger recorded in `docs/next-steps.md`.

**C2 — DE-COUPLE THE TEST FROM LIVE PROSE.** Artifact 4(a) may **not** assert
byte-identity against the live trackers. Determinism is asserted by running the
generator over a **committed frozen fixture snapshot** of the inputs (immutable,
in `tests/fixtures/**`) and comparing two runs byte-for-byte; the live-region check
is a **non-gating staleness report** (the region carries its input hashes so drift
is visible). The contract test must never write into `docs/` during `npm test`, and
the generator must be import-safe (no module-scope side effects — the documented
hazard at `tests/live-drive-contract.test.ts:11-17`).

**C3 — PIN THE TIME SOURCE.** No `Date.now()`, mtime, git or shell input may
appear in the derived region: `last_verified` must be derived from a **deterministic
input** (a date parsed from the input text) or be removed from the MIRROR set.
Otherwise C2 is unsatisfiable.

**C4 — POINTER SCHEMA.** Add `pointer_kind ∈ {row-id, anchor-token, section-ref, none}`.
Hard-fail (generator + test (b)) only on `row-id`/`section-ref`; an
`anchor-token` pointer (needed for `docs/next-steps.md`, which has **no rows**, and
`docs/pending.md`, which has **no ID column**) warns, never fails. Record the
resolution result per row so a churned anchor is visible.

**C5 — EXTEND THE HARD BOUNDARY (oracle + pins).** The unit (and the deferred
generator) must not add or edit a citation into, or otherwise touch:
`src/shared/o0-report.ts`, `scripts/live-drive.mjs`,
`docs/specs/unit-o-0-per-stage-breakdown.md`,
`docs/specs/unit-o-0-per-stage-measurement.md`,
`docs/specs/unit-o0-m1-m3-measurement-shape.md`; **no `src/**` edits at all**; no
new `BLOCKS`/live-drive block; no `MATRIX_ROWS` change. The landing pass records
the two content hashes (`b89d6f19`, `194dfece`) before and after as evidence that
`92a74b7d` is unchanged.

**C6 — THE D-GP-UFA AMENDMENT.** (i) A non-authority restatement in the checklist's
"Coverage vocabulary" block (`:21-25`): the three new columns are metadata,
`Coverage` remains the only live-status cell, and no prune verdict lives in the
checklist; (ii) a §2 note in `docs/specs/user-flow-audit.md` that §5.U stays
U-1..U-8, `MATRIX_ROWS` and the §6.1 schema are unchanged, and **zero new matrix
rows** are claimed; (iii) a decision row making the amendment authoritative within
the D-GP-UFA family; (iv) the checklist's row count recorded as **derived** (the
file says "≈ 112", D-GP-UFA-1 says "~112").

**C7 — POSITIVE NEGATIVE EVIDENCE FOR `escalate-prune`.** A row may reach
`escalate-prune` only with: a recorded `origin_search` (the enumerated sources
searched + date + result — including the six tracker inputs, `docs/HANDOFF.md`,
`docs/feature-requests/*`, the report-#1/#2 docs and the report-#3 prose block),
a documentation-reviewer confirmation, and survival of one full review cycle at
`escalate-prune`; plus the existing `prune_signoff:user-approved:<date>` gate.
Rows whose provenance is `user-verbatim`/`user-directed-record`/**dangling-cited**
freeze at `keep-advisory` and can never escalate. No deletion may cite the catalog
as its authority.

**C8 — GIT-VISIBLE PRUNE TOMBSTONES.** Do **not** delete a register row on
landing. Move it to a §C.3b `PRUNED (landed)` ledger (PRUNE id, date, sign-off,
the landing commit, the deleted paths/spans) — the archive copy is gitignored and
is not evidence — and require the deletion commit to name the PRUNE ids.

**C9 — `code_anchor` LAYER HONESTY.** Declare `code_anchor` ADVISORY in §C.5: the
doc-layer generator can only check presence/shape (never a line number). Symbol
resolution is a CODE-layer check belonging to the deferred unit or a read-only
audit pass, which may **read** `src/**` and may never edit it.

**C10 — CITATION DISCIPLINE SCOPE.** The "no line numbers" cell rule binds
**catalog-authored** cells; MIRROR derivations carry ids/anchors, never copied
prose; no sweep of tracker line-number citations (that would flood §C.7) — at most
an advisory aggregate count.

**C11 — CENSUS + INPUT-SET EXACTNESS.** §C.1's partition is closed at the
capability level; §C.2/§C.3/§C.4 counts must be **derived, not asserted**
(the ~40/~90/~25 estimates are unverified; the upstream-owed set is at least 21
named items — GR-1..GR-9, SC-1..SC-7, PS-1, and the four Gnosis handoff rows);
and every `docs/specs/unit-*.md` present at landing is either an input or
explicitly recorded as excluded with a reason (else the O-5 spec lands outside a
"closed" partition).

**C12 — SEQUENCING.** Land the doc-only unit **before the O-5 spec is authored or
after O-5's DONE row**; do not land it inside O-5's spec→TestWriter-red window.

**C13 — LAYER DECLARATION.** The DONE row, the decision row and (in the deferred
unit) the test header must state the layer per RCA-12: **DOC-LAYER only — this
verifies no envelope, renderer, or app behavior**, and a green here is never
app-green.

---

## 9. GAPS + COSTS / BENEFITS

**Gaps this closes:** the missing origin map (forward trackers exist; no inverse
index does); the "can we delete this?" archaeology loop; the un-joined user
feedback surfaces (report #1/#2 documents, the report-#3 prose block, the C1–C7
defects rows, the `WHOLE-PAGE-EDITING`/`LAYOUT-IN-CSS` decisions); the dangling
`report #3` citation (surfaced as a tracker row rather than left in prose).

**Gaps this does NOT close (must not be claimed):** `code_anchor` resolution
(needs the code layer, C9); the O-5 gate (untouched — this unit must not be used
to "close" or re-open it); the live/app layer (no live row, no rendered-DOM check
— RCA-12); the ~112-row census's own coverage debt (`docs/next-steps.md:173`
names the still-uncovered drivable checklist rows).

**Costs:** Unit 1 — one doc-only pass + the §3.5 tracker rows + the user's
per-item sign-off dialogue; no trio, no red set. Unit 2 (deferred) — one full
code-bearing gate cycle (spec + register + red + green + adversarial +
blind-greens + doc review + trio) for a generator whose surface is one sentinel
region, plus the `tests/live-drive-contract.test.ts`-style structural-pin cost if
the test reads source text instead of importing. Ongoing — a re-derivation step at
each tracker-changing landing (bounded by C2's non-gating staleness report).

**Benefits:** one query-able register where "expected behavior" meets "its origin"
and "its consumer"; a mechanical census that makes silent omission visible
(C11); an advisory-only prune path whose worst case is a wrong *candidate* that the
user declines (cost: one conversation) rather than a wrong *deletion*; and a doc
set that stops relying on a citation (`report #3`) which does not exist.

---

## 10. VERDICT (recap) + statement for the user

**PROCEED-WITH-AMENDMENTS** — conditions C1–C13. Only a passing review PLUS the
user's go-ahead opens the spec gate; nothing is delegated to a TestWriter until
then, and the deferred generator+test unit is not delegable until its own spec
exists and a TestWriter has reported its red set (`AGENTS.md` item 9).

**In plain language:** *the catalog is worth building and it cannot hurt anything
as long as it stays a register, not a warrant. Build it in two steps — write the
catalog and index the checklist first (documentation work, no gate cost), then
build the machine that regenerates it later, against the register that by then
really exists. Do not let the machine's freshness check redden the test suite
whenever someone edits a tracker, and do not let a row be marked "prunable"
because nobody wrote down where the requirement came from — in this repo one
user report was never committed at all, and it is cited as if it were.*
