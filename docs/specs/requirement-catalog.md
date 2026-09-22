# UNIT `REQUIREMENT-CATALOG` — the ADVISORY requirement/behavior catalog + the additive checklist columns — Spec

**Status:** **DRAFT — to be landed by this unit's authoring + landing pass.** This file is the
contract; it lands BEFORE the catalog it specifies (the catalog is *derived from* this spec, not
the reverse). The unit's own DONE state is recorded in `docs/next-steps.md:§CURRENT WORK / handover-state`
by the landing pass (§6.1).

**Layer (RCA-12, mandatory declaration):** **DOC-LAYER / ADVISORY.** This unit adds and edits
markdown under `docs/` only. It changes **no** `.ts`/`.mjs` source, no `src/**`, no envelope, no
renderer, no app behavior, and it produces **no** live or app evidence. **A pass here is a
DOC-LAYER pass: nothing in this unit is APP-GREEN, ENVELOPE-GREEN, STORE-GREEN or LIVE-GREEN**, and
no clause of the catalog may be quoted as evidence that the application behaves in any way (§3.1
the non-authority rule). The deferred generator unit (`scripts/catalog-derive.mjs`) is likewise a
doc-layer tool; the code-layer check of `code_anchor` (§3.4) is the ONLY clause that may ever read
`src/**`, and it may only READ.

**§5.x PBT property register — ZERO ROWS (recorded exemption, not a silent default).** This unit
adds or changes **no `.ts` and no `.mjs` source**; the repo's PBT gate is a property register over
code surfaces, and a register over a unit that adds no code surface would be padding. The register
is therefore **0 rows, 0 attempts of the 400 ceiling**, with that justification recorded here per
the PBT gate's zero-row rule (the same recorded-exemption shape as
`docs/specs/user-flow-audit.md` §2 "A zero-row matrix is an EXPLICIT recorded exemption, never a
silent default", and `docs/specs/astrographer-scope-realignment-review.md` §2.2 C8 / §6
"Doc-only ⇒ no red set, no trio"). The deferred generator unit (§3.12, Artifact C) **DOES** carry
a code surface and therefore **DOES** owe its own spec, its own typed §5.x register, its own red
run and its own full gate cycle — none of which is discharged by this unit.

**No TestWriter red set is owed for THIS unit.** It has no code obligation (§4.1). The unit's
verification is an authoring pass per cluster, a READ-ONLY adversarial pass, the mandatory
item-10d documentation review, and a final trio run **as a regression reading** — never as this
unit's green (§4.2–§4.5).

**Provenance / inputs.** The reviewed proposal and its gate-1 record:
`docs/specs/requirement-catalog-review.md` (`PROCEED-WITH-AMENDMENTS`; the risk ledger R1–R14 in
its §6 and the conditions C1–C13 in its §8 are the authority for every boundary and rule below —
each is mapped in §8). The user-approved architecture (gate-1 chain, user go-ahead GIVEN):
corpus = **everything in-repo, including upstream-owed requests**; the register is **ADVISORY with
per-item user sign-off**; **DOC-ONLY unit now**; the generator is a **DEFERRED follow-up unit**;
**this unit runs now, before the O-5 spec**. Format conventions: `docs/specs/user-flow-audit.md`,
`docs/specs/unit-o0-m1-m3-measurement-shape.md` (§5 register + §6 S/FS shape),
`docs/specs/astrographer-scope-realignment-review.md` §2.2 C7/C8 + §6 (the doc-only exemption).

**What this unit does NOT do (stated once, binding throughout).** It does not add, correct,
renumber or delete a single row of any tracker; it does not populate the catalog's rows in this
file; it does not create `scripts/catalog-derive.mjs` or `tests/requirement-catalog-contract.test.ts`;
it does not delete anything anywhere; it does not "close" or re-open the O-5 gate; it does not
claim the app works, or that any catalog row is verified by the application (§3.1).

---

## 1. What this unit asks

This unit lands two documents and the tracker rows that record them.

1. **Artifact A (NEW): `docs/requirement-catalog.md`** — the **ADVISORY** requirement/behavior
   catalog: a query-able inverse index mapping *"behavior currently expected"* → *its origin* →
   *its consumer*, over the whole in-repo corpus (including upstream-owed requests). §C.0–§C.8, the
   closed 16-capability partition, a Tier-1 capability×surface rollup, a Tier-2 pruning register of
   `PRUNE-###` rows, an upstream-owed ledger, frozen provenance/direction vocabularies, a
   derivation manifest, an open-conflicts + waiver ledger, and a change log (§3.1–§3.8).
2. **Artifact B (MODIFIED): `docs/specs/user-flow-audit-checklist.md`** — **exactly three columns
   added** (`Provenance | Direction | Catalog`) to its existing rows, **ADDITIVELY ONLY** (§3.9).
3. **Artifact C (DEFERRED — NOT this unit):** `scripts/catalog-derive.mjs` +
   `tests/requirement-catalog-contract.test.ts`, recorded as a SCHEDULED follow-up unit with a
   named trigger and its carried conditions (§3.12, §5.4).
4. **The landing-pass tracker rows** (§5) — a DONE row + a queue row in `docs/next-steps.md`, one
   ACTIVE row in `docs/decisions.md`, one new OPEN row in `docs/defects.md`, one SCHEDULED row in
   `docs/pending.md`.

**Why now, and why split.** The proposal's decisive objection (`requirement-catalog-review.md` §4
option (ii)) was that the code half as architected was **mis-gated and partly unsatisfiable**: its
byte-identity assertion coupled the trio to mutable tracker prose, three of its six inputs carry
**no stable row ids**, and a generated `last_verified` had a time input. Condition **C1** therefore
splits the doc-only catalog from a named follow-up generator+test unit; **C2/C3** de-couple that
test from live prose and pin its time source; **C11** makes the counts derived rather than asserted.
This spec is Unit 1. It exists so that Unit 2 is authored **against a register that already
exists**, not against a speculative shape (the `F7-1` lesson: "an accepted form unreachable by
construction").

---

## 2. Feasibility verdict

**FEASIBLE, and cheap in this form.** One doc-only pass: the catalog's content is authored from
the six tracker inputs + the two user-bug-report docs + the feature-request docs + the Gnosis
handoff rows, all of which already exist in-repo; the checklist edit is a three-column append with
no cell rewritten; the tracker rows are five rows in five files. Total gate cost is the doc-only
exemption (`AGENTS.md` item 3/4 do not apply to a unit that adds no test and no source), the
mandatory adversarial + item-10d review passes, and one regression trio reading.

**The three hazards, and how this contract contains each (verified this pass):**

| Hazard | Why it is real | Containment pinned here |
| --- | --- | --- |
| **Deletion is irreversible after the first signed-off prune** (R2/R10) | The design deletes a register row in the same pass, and the archive copy lands in the **gitignored** `archive/` tree (`AGENTS.md` item 6; `docs/pending.md` head repeats the convention) — so `git revert <catalog unit>` restores nothing | §3.6: `prune_signoff:none` is non-deletable **by construction**; this unit deletes nothing; the deferred shrink rule carries a **git-visible tombstone** |
| **A wrong "no user origin" claim would prune a real requirement** (R3) | The criterion's first clause is **absence-based**, and the repo demonstrably has **unwritten/dangling** user provenance ("report #3" is cited by **9 locations** — seven defect rows, one decisions row and one next-steps block — but exists only as prose) | §3.6: `escalate-prune` requires **positive negative evidence** (`origin_search` record + a documentation-reviewer confirmation + a one-cycle cooldown); any `user-*` or dangling-cited row **freezes at `keep-advisory`** |
| **The catalog becomes a second status authority** (R6) | `docs/next-steps.md` already carries four generations of status prose; two contradicting status sources is worse than none | §3.1: the tracker is the **sole** status authority; the catalog stores **pointers only**, never status text; on contradiction the row **freezes at `invalidated-conflict`** until the next cycle |

**Costs.** One doc pass + the user's per-item sign-off dialogue (only on a future prune request);
a re-verification step at each tracker-changing landing (the staleness duty, §3.7); and the
**accepted risk** in §2.3.

**Benefits.** One register where "expected behavior" meets "its origin" and "its consumer"; a
census that makes silent omission visible (C11); an advisory-only prune path whose worst case is a
wrong *candidate* the user declines (one conversation) rather than a wrong *deletion*; and a doc
set that stops citing a document that does not exist.

### 2.1 What this unit does NOT claim (honesty bounds)

- **No app/envelope/live claim of any kind** (§3.1; RCA-12).
- **`code_anchor` is NOT resolved** — the doc layer can only check presence/shape (§3.4, C9).
- **The O-5 gate is untouched** — this unit neither opens nor closes it (§7).
- **The counts are DERIVED, not asserted** — the ~40 / ~90 / ~25 figures of the architecture are
  estimates promoted to a shape; the landed figures are whatever the authoring pass derives, and
  the manifest records them (§3.8, C11).
- **The `≈112`-row census's own coverage debt is not closed** — the still-uncovered drivable
  checklist rows remain uncovered (`docs/next-steps.md:§CURRENT WORK` records them).
- **The register is PROVISIONAL** — every MIRROR cell lands marked `derived:false` (§3.3).

### 2.2 Verified boundary facts (stated so the landing pass need not re-derive them)

1. **`docs/specs/ui-overhaul.md` and `docs/specs/user-flow-audit.md` are IMPORT-CORPUS INPUTS in
   live tests.** `docs/specs/ui-overhaul.md` is read as a corpus by
   `tests/import-render-no-duplicates.test.ts` and by `tests/unit-import-batch-persist-contract.test.ts`
   (with a census assertion and a **3 000 ms** per-row budget that discriminates on `ui-overhaul.md`
   only, `user-flow-audit.md` being an already-fast **canary**), and by
   `tests/unit-v5-migration-contract.test.ts` (source-contract census over that corpus).
   **Editing either file moves a measured corpus and its budget/census pins.**
2. **`docs/specs/unit-o-0-per-stage-breakdown.md` is PARSED by a live pin**
   (`tests/unit-o0-m1-m3-adversarial-pins.test.ts` reads it; `tests/unit-o0-m1-m3-driver-contract.test.ts`
   reads it and byte-round-trip-verifies its embedded JSON).
3. **The O-0 oracle identity is the SOURCE-HASH PAIR `src/shared/o0-report.ts` + `scripts/live-drive.mjs`**
   (`o0OracleIdentity()`, `scripts/live-drive.mjs`; recorded composite `92a74b7d`). **A change to
   EITHER file invalidates the recorded live provenance (RCA-11)** and forces another live run →
   §3b re-audit → doc review.
4. **`docs/specs/user-flow-audit-checklist.md` is NOT read by any test at runtime.** The only
   references are **comments** in `scripts/live-drive.mjs` and in `tests/live-drive-contract.test.ts`
   (which reads `scripts/live-drive.mjs` source text and the exported `MATRIX_ROWS` literal — never
   the checklist). **Verified at this pass**: a grep over `tests/**` for the tracker + checklist
   names returns comments only, and no `readFileSync` site reads the checklist. The three-column
   edit therefore cannot change any test outcome.
5. **The checklist's row count is an approximation in the source file.** Its §16 coverage summary
   ends "**Total ≈ 112 rows.**" and `docs/decisions.md` D-GP-UFA-1 says "~112". The architecture's
   flat "112" is an approximation promoted to a count: **the landed figure must be recorded as
   DERIVED** (§3.9 rule 6, C6 (iv)). The per-surface figures in §16 sum to exactly 112; the
   authoring pass records the counted figure, not this one.
6. **Three of the tracker inputs have no row-id grammar** (`docs/next-steps.md` = prose under three
   headings; `docs/pending.md` = six row vocabularies with no id column; `docs/decisions.md` =
   ID-bearing titles plus ID-less provenance rows), so pointer addressing must NOT pretend an id
   grammar exists (§3.5, C4).

### 2.3 ACCEPTED RISK (recorded with its mitigation + revisit condition — do not silently absorb)

**RISK: adding a new `.md` under `docs/` adds ONE document to the operator corpus if the operator
store is ever re-imported.** The O-0 harness claims a **census GATE** `O0_OPERATOR_DOCUMENTS = 226`
(`scripts/live-drive.mjs`; the ninth run reads `226 = 226`), and the O-0/O-5 live path measures a
corpus imported from a **pre-seeded operator store**. A new `docs/requirement-catalog.md` would be
one additional document in a *re-import* of `docs/`.

- **Mitigation (binding on this unit):** the unit **must not re-import, re-seed or rebuild the
  operator store**, and must not run a live derive against it. The unit touches no `src/**`, no
  `scripts/**` and no live block, so the census as claimed by the O-0 harness is unchanged by this
  pass.
- **Revisit condition (binding on the O-5 pass):** if the O-5 pass (or any later pass) **re-seeds
  or re-imports** the operator store, it **re-derives the `O0_OPERATOR_DOCUMENTS` census claim** —
  a stale 226 against a corpus that now contains the catalog is a `FAIL` of the census gate, and
  the fix is to re-derive the constant in that pass, never to edit this spec.

### 2.4 CORRECTION to the change analysis (recorded, so it is not re-attempted)

`docs/specs/requirement-catalog-review.md` §3.2 / §5.3 (C6 (ii)) proposed "a §2 note in
`docs/specs/user-flow-audit.md`" recording that the checklist gained metadata columns and that
`§5.U` stays U-1..U-8, `MATRIX_ROWS` and the §6.1 schema are unchanged. **That amendment is NOT
landable in this form: `docs/specs/user-flow-audit.md` is an IMPORT-CORPUS INPUT in live tests**
(§2.2 fact 1) — a §2 edit changes a measured corpus and its budget/census pins. **This unit
therefore records the no-change statement HERE instead** (§3.9 rule 4), and the ACTIVE decision row
(§5.3) carries the authority. **`docs/specs/user-flow-audit.md` is on the MUST-NOT-EDIT list**
(§2.5) and must not be touched by this unit or by the deferred generator unit for this purpose.

### 2.5 HARD BOUNDARY — the MUST-NOT-EDIT list (verified, not cautious)

The following paths MUST NOT be edited by this unit, by its authoring clusters, or by the deferred
generator unit. Each entry carries its reason:

| Path | Reason |
| --- | --- |
| `src/**` | **No `src` edit at all**: any edit moves the bundle content hash (`3e3f1b80` / `1e652667`) and invalidates the recorded live provenance (RCA-11, C5). |
| `scripts/**` | Includes the O-0 oracle's second half (`scripts/live-drive.mjs`, `194dfece`) and the frozen `BLOCKS`/`MATRIX_ROWS` tables. **`MATRIX_ROWS` must not change** (C5). |
| `tests/**` | No test is written or edited by this unit; the `RA-2c`/edition-probe repoints are other units' business. |
| `docs/specs/ui-overhaul.md` | IMPORT-CORPUS INPUT with a census + a **3 000 ms** budget pin (§2.2 fact 1). |
| `docs/specs/user-flow-audit.md` | IMPORT-CORPUS INPUT + the §5.U / §6.1 authority (§2.4). |
| `docs/specs/unit-o-0-per-stage-breakdown.md` | Parsed + byte-round-trip-verified by the live pins (§2.2 fact 2). |
| `docs/specs/unit-o-0-per-stage-measurement.md` | The O-0 contract record (C5). |
| `docs/specs/requirement-catalog-review.md` | The gate-1 record: it is a HISTORICAL verdict, not a living doc. |
| `docs/HANDOFF.md` | The upstream-owed index is **counted, never asserted** (§3.4 ledger, C11); this unit adds no handoff row. |

**`docs/specs/unit-o0-m1-m3-measurement-shape.md` is listed in C5's boundary; it is not in this
unit's MUST-NOT-EDIT table because it is a landed unit spec rather than a hashed/pin-read artifact,
but the catalog's §C.7 may CITE its §14.5/§14.6/§14.7 OWED rows as engineering-only requirements —
**cite, never edit.**

**Mechanical proof owed by the landing pass (cheap, C5):** record the two content hashes of
`src/shared/o0-report.ts` and `scripts/live-drive.mjs` **before and after** the landing pass
(recorded as `b89d6f19` / `194dfece` for the ninth-run tree) as evidence that the composite oracle
identity `92a74b7d` is unchanged. The reading and its comparison belong in the DONE row (§5.1).

---

## 3. The pinned contract

### 3.1 The catalog artifact, its sections, and the NON-AUTHORITY rule

**Artifact:** `docs/requirement-catalog.md` (NEW, in-repo, git-visible, `docs/` tree).

**Title:** it MUST be titled **explicitly ADVISORY** — the title line and the §C.0 scope block both
carry the word, and the layer line names DOC-LAYER/advisory per RCA-12.

**Sections, in this order (closed — the deferred generator's sentinel region lives inside §C.6 and
nowhere else):**

| Section | Content | Shape |
| --- | --- | --- |
| **§C.0** | Scope + the NON-AUTHORITY rule | prose + the rule statements below |
| **§C.1** | The **16 capabilities** as a closed partition | one definition row per capability (16 rows) |
| **§C.2** | **Tier-1 capability×surface rollup** (~40 rows) | one row per `capability × surface` |
| **§C.3** | **Tier-2 pruning register** (`PRUNE-###`, ~90 rows of which ~70 prunable-verdict) | the 13-field row schema (§3.3) |
| **§C.4** | **Upstream-owed ledger** (~25 rows, NON-PRUNABLE by construction) | the same 13-field schema, with `verdict` pinned to a non-prunable value |
| **§C.5** | **Frozen provenance/direction vocabularies** | the closed token lists (§3.4) + the `code_anchor` advisory clause |
| **§C.6** | **Derivation manifest** | the manifest table + the sentinel region (§3.8) |
| **§C.7** | **Open conflicts + waiver ledger** | conflict rows + waiver rows (§3.7) |
| **§C.8** | **Change log** | one row per pass that re-verified the register |

**The NON-AUTHORITY rule (§C.0 — the block that makes the artifact safe, in these words or
stronger):**

1. **The tracker is the SOLE status authority.** The catalog stores **pointers**, never status
   text. On any disagreement the **tracker governs**, and the disagreeing row **freezes at
   `invalidated-conflict`** until the next cycle (§3.6).
2. **No deletion may cite the catalog as its authority.** A deletion's justification is the user's
   per-item sign-off (`prune_signoff:user-approved:<date>`) **plus the tracker row** — never this
   catalog, never a `verdict` value (C7).
3. **The register is ADVISORY.** A row's `verdict` is a *candidate for the user's consideration*.
   A wrong `keep` costs nothing; a wrong `escalate-prune` is declined by the user.
4. **No clause here is app evidence.** The catalog is not a test, not a coverage report, and not a
   status source; it is an index over other documents.
5. **The MIRROR cells are PROVISIONAL** until the deferred generator lands (`derived:false`, §3.3).

### 3.2 §C.1 — the 16 capabilities (a CLOSED partition)

The capability list is **closed**: exactly these 16 ids in this order, and the authoring pass may
**not** add, rename, split or merge one. Every catalog row belongs to **exactly one** of them;
**`UNCLASSIFIED` is a fail-state** (`FS1`).

| # | Capability | Owns |
| --- | --- | --- |
| 1 | `SHELL-CHROME` | the window frame, top bar / tab strip region, app-region, native menu + native dialogs as shell chrome |
| 2 | `LAYOUT-ZONES` | the `#wiki-root` grid, zone tracks, placement, gutters, resize, zone boundaries |
| 3 | `PANES` | pane frames, collapse/expand, drag/relocate, titles, zone minimize/tabs, orientation, per-pane content |
| 4 | `TABS` | tab create/close/switch/activate, the tab strip, open-in-tab content, cross-document tabs |
| 5 | `STAGE-DOCUMENT` | the stage/document surface: landing, per-paragraph single render, doc-head/typography, commit-on-blur as a document surface |
| 6 | `EDITING-RICH-TEXT` | the rich-text (contenteditable) editing surface and its eligibility/splice rules |
| 7 | `EDITING-MARKDOWN-MODE` | the textarea / markdown-mode editing surface and the markdown-as-data presentation |
| 8 | `HISTORY-UNDO` | undo/redo enabled-state, the history surface, click-to-point, journal read-back |
| 9 | `SEARCH-RETRIEVAL` | the search pane, search results, open-in-tab from search, retrieval semantics as surfaced |
| 10 | `DOC-NAV-TREE` | the document navigator: rows, folder grouping, tree semantics |
| 11 | `SETTINGS-MODAL-THEME` | the settings modal, operator panels, enabled-panes census, defaults, lazy-load, light/dark/system theme |
| 12 | `IMPORT-FS` | File → Import…, multi-file/folder selection, the cap, fail-loud behavior, import broadcast, path persistence |
| 13 | `GNOSIS-ENGINE-SURFACE` | the Gnosis GUI surface: panes, status, wikis/documents, engine-offload seams as surfaced |
| 14 | `MCP-ENDPOINT-CONTRACT` | the MCP endpoint contract and every MCP tool group's named UI home (parity) |
| 15 | `UPSTREAM-OWED` | behavior owed to an upstream project (package/foundation/docs): GR-1..GR-9, SC-1..SC-7, PS-1, the Gnosis handoff rows |
| 16 | `ENGINEERING-ONLY` | process/harness/measurement requirements with **no** user-visible behavior (O-0/O-5 harness rows, register/pin items, doc/process duties) |

**The two `EDITING-*` capabilities are deliberately separate and MUST NOT be merged** (the
architecture's explicit call): they carry **opposite directions** —
`WHOLE-PAGE-EDITING` (`docs/decisions.md`) wants the whole page editable as one block
(**`wants-change`**) while `EDIT-MODE-TEXTAREA-UI` (`docs/defects.md`) wants the per-node textarea
editors **removed** (**`wants-removal`**). Merging them into one capability would put two opposite
`direction` values on one row and make the register self-contradictory.

**Partition closure test (the deferred contract test mechanizes this, §3.12):** for every catalog
row, `capability ∈` the 16 ids; the per-capability counts sum to the total row count; and the set
of capabilities is exactly these 16.

### 3.3 The row schema — 13 fields, 6 MIRROR + 7 JUDGMENT

Every §C.3/§C.4 row carries all 13 fields. **MIRROR = derived** (produced by the generator when it
exists; **hand-edit forbidden** once it does). **JUDGMENT = authored** (written by a human/agent
pass; **status verbs forbidden**). This unit lands with every MIRROR cell **marked
`derived:false` / PROVISIONAL** (C1) because the generator is deferred.

| # | Field | Class | Domain / shape | Evidence rule (what makes a value legal) |
| --- | --- | --- | --- | --- |
| 1 | `id` | **MIRROR** | `PRUNE-###` (three digits, zero-padded; §C.4 rows carry the same `PRUNE-###` space; **per-cluster block allocation pinned in §3.5.1**) | Must be unique across the whole artifact; a retired id is **never reused** (the tombstone ledger retains it, §3.6) |
| 2 | `statement` | **JUDGMENT** | one user/operator-visible behavior, ≤ 2 lines; **no status verb, no date** | Must be a behavior statement, not a status report; must be readable without the trackers |
| 3 | `capability` | **MIRROR** | exactly one of the 16 §C.1 ids | `UNCLASSIFIED` is `FS1` |
| 4 | `provenance` | **MIRROR** | one of the 6 §3.4 provenance tokens | Must be the token the **cited origin** supports; `user-verbatim` requires a verbatim quote in `evidence_pointer` |
| 5 | `direction` | **MIRROR** | one of the 5 §3.4 direction tokens | Must agree with the cited origin's ask; `n/a` only for a requirement with no expressed direction (engineering/contract rows) |
| 6 | `status_pointer` | **JUDGMENT** | **a POINTER** to the owning tracker row (never copied status text) | Must resolve; must be the row that OWNS the status (§3.5). Multiple pointers allowed where two trackers disagree — then the row freezes (§3.7 rule 2) |
| 7 | `evidence_pointer` | **JUDGMENT** | one or more pointers (in-repo `path:§section` / `path symbol` / `path selector`, out-of-repo `../…` marked out-of-repo, `archive/**` allowed **only here** and marked) | At least one; each must be the origin the provenance claims (§3.5) |
| 8 | `owner_class` | **JUDGMENT** | one of the 10 §3.4 owner tokens | The primary owner; additional classes are named in `verdict_basis` |
| 9 | `code_anchor` | **JUDGMENT** (authority: this table — see §9 (16)) | a **symbol or grep token**, or `<none>`; **NEVER a line number** | `code_anchor` is **ADVISORY** at the doc layer (§3.4 rule 9, C9): presence/shape only; resolution is a code-layer check. It is an authored judgment about a symbol/token, **not** a derived mirror — its value is chosen by the author and is recomputable from **no** input, so it is not a generator-produced cell |
| 10 | `verdict` | **JUDGMENT** | one of the 5 §3.4 verdict forms, `merged-into:<id>` carrying a live id | `escalate-prune` requires the §3.6 evidence set; `prune_signoff:none` makes it non-deletable |
| 11 | `verdict_basis` | **JUDGMENT** | the mechanical test that produced the verdict, or the reason a freeze applies | For `escalate-prune` it MUST record the three-part criterion test (§3.6) verbatim enough to be re-run; for `invalidated-conflict` it names the two contradicting pointers |
| 12 | `prune_signoff` | **JUDGMENT** | `none` \| `user-approved:<date>` (`YYYY-MM-DD`) | MANDATORY before any deletion; `none` ⇒ non-deletable by construction (§3.6) |
| 13 | `last_verified` | **MIRROR** | a date `YYYY-MM-DD`, **never wall-clock** (§3.8) | On landing: the manifest `as_of` for every row. Stale = earlier than the manifest's newest input digest (§3.6 stale rule) |

**MIRROR-cell marking on landing.** Every MIRROR cell is accompanied (in the manifest, not per cell)
by `derived: false` + `derivation: "hand-derived"`, so **no reader can mistake a hand-authored
MIRROR cell for generated output**. The deferred generator flips `derived` to `true` for the cells
inside its sentinel region and only that region.

**JUDGMENT-cell discipline.** A JUDGMENT cell may contain a **pointer token** (`path:§section`,
`path symbol`, `path selector`) — pointers are not prose and are the only legal way to name another
document's state. A JUDGMENT cell may **not** contain a status verb (§3.4 rule 6) and may not
contain a line number (§3.4 rule 7).

### 3.4 §C.5 — the frozen vocabularies, the citation discipline, and the per-field rules

The §C.5 vocabularies are **frozen**: the generator consumes them and a new token is an amendment
to this spec, never a silent addition.

**Provenance (6 tokens).**

| Token | Means | Evidence required in `evidence_pointer` |
| --- | --- | --- |
| `user-verbatim` | the user's own words, quoted | the quote + its in-repo home (a report doc or a tracker section) |
| `user-directed-record` | a user instruction recorded in a decision/defect/pending row | that row's section pointer |
| `user-ratified-spec` | the user ratified a spec that binds the behavior | the spec `path:§section` |
| `agent-observed-live` | an observation recorded from the assembled app / a live run (not the user's words) | a live-record artifact (a defects row, a coverage report, an artifact section) — **never prose alone** |
| `contract-pinned` | a pinned contract in a spec/decision that is not user-verbatim | the pinning `path:§section` |
| `engineering-only` | a process/harness/measurement requirement with no user-visible behavior | the owning spec's `path:§section` |

**Direction (5 `wants-*` tokens + the `n/a` form = 6 legal values).** `wants-more` (the user wants
this behavior to exist or to cover more) | `wants-less` (the ask is to reduce scope/quantity while
keeping it) | `wants-change` (the behavior exists and must change shape) | `wants-removal` (the ask is
to REMOVE it — `EDIT-MODE-TEXTAREA-UI` and the pane-visibility option are the live instances) |
`wants-keep` (the behavior is to be KEPT in its current shape because the recorded report about it did
**not** reproduce) | `n/a` (no expressed direction: engineering/contract rows).

**`wants-keep` — the fifth token, with its assignment test (§9 (17)).** A row may be stamped
`wants-keep` **only** when all three hold: **(i)** an in-repo re-drive record exists (a
`scenario authored <name>` / a live re-drive PASS in a live-record artifact) for the behavior's
subject; **(ii)** that record contradicts the report the row's provenance rests on; and **(iii)** the
row's `statement` asserts the **existing** behavior, not a change to it. **Evidence rule:** the
`evidence_pointer` carries the **re-drive artifact** (`path:§section` or `path scenario`) — the same
evidence shape the keep-class (`PASS-not-reproduced`) rows use.
`wants-keep` and `n/a` are **not** interchangeable: `n/a` is for a requirement with **no expressed
direction at all** (contract/engineering rows); `wants-keep` is a **user-origin** row whose expressed
ask is that the behavior stay. **A `user-*` row therefore may NOT carry `n/a` where its recorded
re-drive contradicts the report (that is `FS3`);** it carries `wants-keep`. A row may also carry
`wants-keep` with a `contract-pinned` provenance where the pin is what the re-drive vindicated.

**Owner class (10 tokens).** `app-graph` (a provident-authored UI element inside the app graph) |
`shell-chrome` | `native-menu` | `native-dialog` | `launcher` | `main-process` | `test-harness` |
`upstream-package` | `upstream-docs` | `process/agent` (doc/process duties, agents' own rules).
**Precedence rule:** the MOST SPECIFIC class wins; a row spanning classes records the primary in
`owner_class` and the others by name in `verdict_basis`.

**Verdict (5 forms).** `keep` | `keep-advisory` | `escalate-prune` | `invalidated-conflict` |
`merged-into:<id>`.

**The 10 rules the per-field rules above rest on.**

1. **Tracker = sole status authority** (§3.1 rule 1). `status_pointer` is a pointer; **copied status
   text is `FS3`**.
2. **MIRROR cells are never hand-edited** once the generator exists. Before it exists, the landing
   marks them PROVISIONAL (`derived:false`); a silent MIRROR edit after that is `FS4`.
3. **`status_pointer` addresses the owning tracker row** — the row that owns the status, not a row
   that merely mentions the behavior (§3.5). **The owning-row test is pinned in §3.5.3** (the pointer
   must name the row that owns the **BEHAVIOR's** status, never the report that merely observed it).
4. **`evidence_pointer` addresses the ORIGIN** the provenance claims (§3.3 field 7). A provenance
   token unsupported by its evidence is `FS6`-adjacent and is an adversarial finding.
5. **A `user-*` provenance (or a dangling-citation lineage) may never reach `escalate-prune`** — it
   freezes at `keep-advisory` (§3.6, C7).
6. **Status verbs are FORBIDDEN in JUDGMENT cells** — the tracker status vocabularies
   (`OPEN`/`FIXED`/`DONE`/`ACTIVE`/`SUPERSEDED`/`SCHEDULED`/`PARKED`/`PENDING`/`IMPORTED`/`SHELVED`
   and their inflections) must not appear as a status assertion in a catalog-authored cell.
7. **CITATION DISCIPLINE — symbols/section refs ONLY, never line numbers.** Legal forms:
   `path symbol`, `path selector`, `path:§n.m`, `path:§<named section>`. **A line number in a
   catalog-authored cell is `FS5`.** The rule binds **catalog-authored cells** (C10); the MIRROR
   side carries ids/anchors only, never copied prose — so a tracker row saturated with line-number
   citations does not propagate them (§C.7 may at most carry an advisory aggregate count of them).
8. **`archive/**` may appear ONLY inside an `evidence_pointer`, never as canonical.** It MUST be
   marked (the `[archive]` marker) because `archive/` is gitignored and is **not evidence** — an
   `archive/**` pointer used as a `status_pointer` or as a canonical origin is `FS7`.
9. **`code_anchor` is ADVISORY** (C9): it is a symbol or a grep token, **never a line number**; the
   doc layer checks presence/shape only. **Symbol resolution is a CODE-layer check** belonging to
   the deferred unit or to a read-only audit pass, **which may READ `src/**` and may never edit it**.
   A `code_anchor` that no longer resolves must therefore never be reported as "verified" from a
   doc-layer pass.
10. **Out-of-repo statements are marked out-of-repo and cited by the fixed forms**
    `../Gnosis/docs/...`, `../Provident-Electron/docs/...`, `../Preempt-Providence/docs/...`
    (AGENTS.md: the upstream project is adjacent, not a dependency, and is never patched here).

### 3.5 Pointer addressing for id-less trackers (C4, pinned)

**VERIFIED FACT:** `docs/next-steps.md` has **NO row ids** (three `##` headings:
`CURRENT WORK / handover-state`, `OPEN`, `DONE`); `docs/pending.md` has **no id column** (six row
vocabularies: UPSTREAM / UPSTREAM foundation requests SC·PS / SCHEDULED / DEFERRED / PARKED /
SPECULATIVE); `docs/decisions.md` carries **ID-bearing titles plus ID-less provenance rows**.
**The catalog must not pretend an id grammar exists.** Pointer forms:

| Pointer | Legal form | Failure class |
| --- | --- | --- |
| **row-id** | an id that exists as a row id in its tracker (`PRUNE-###`-style or a row's own bolded id, e.g. a defects row id) | unresolved ⇒ **hard-fail** (`FS8`) |
| **section-ref** | `path:§<named section>` (e.g. a defects row group, a decisions section) | unresolved ⇒ **hard-fail** (`FS8`) |
| **anchor-token** | `path:§<heading>` **+ a quoted row opening** (the first ~6–12 words of the addressed row, quoted) | unresolved ⇒ **WARN, never fail** (`FS9`) |
| **none** | no pointer | legal only where a field explicitly allows `<none>` (`code_anchor`); elsewhere ⇒ `FS7` |

**Rules.**
1. **`docs/next-steps.md` and `docs/pending.md` are addressed by `anchor-token`** (heading + quoted
   row opening). Their pointers **warn** on churn and never hard-fail the deferred contract test —
   because item 6 requires a tracker edit on every landing and these files are prose.
2. **`docs/decisions.md` is addressed by row title** where the row has one (its title IS its id) and
   by `section-ref` where it does not (the ID-less provenance rows).
3. **Every pointer's resolution result is recorded per row** so a churned anchor is VISIBLE rather
   than silently dropped (C4). A `warn`-class pointer that has moved MUST appear in §C.7 as an open
   conflict or be re-pointed in the next pass.
4. **A pointer never crosses a tracker's status into the catalog**: the pointer names a location;
   the STATUS at that location is read by the reader from the tracker.

### 3.5.1 `PRUNE-###` ID ALLOCATION — per-cluster blocks (pinned here because §3.3 field 1 fixes only the FORMAT)

**The gap (§9 (19)).** §3.3 field 1 fixes `PRUNE-###` + global uniqueness + never-reuse, and §4.2 splits §C.3
across CL-3 and CL-4 — but no clause allocated an id **range** per cluster, so two authoring clusters
could collide (`FS2`). **The allocation is pinned here (and cross-referenced from §3.3 field 1):**

| Block | Owner | Status |
| --- | --- | --- |
| `PRUNE-001`–`PRUNE-099` | — | **RESERVED** (not allocable by an authoring cluster) |
| `PRUNE-100`–`PRUNE-299` | **CL-3** — §C.3 part 1 (the five UI capabilities) | allocated |
| `PRUNE-300`–`PRUNE-599` | **CL-4** — §C.3 part 2 (the remaining capabilities) | allocated |
| `PRUNE-600`–`PRUNE-799` | **the AMENDMENT / FIX-PASS block** — rows added by a post-merge fix or review pass over an already-merged catalog (a missing behavior, a mis-pointer repair, a merge repair) | **AMENDMENT / FIX-PASS** (rule 5): not allocable by an authoring cluster; every row is change-logged in §C.8 and counted in §C.6.3 |
| `PRUNE-800`–`PRUNE-899` | **CL-5** — the §C.4 ledger | allocated |
| `PRUNE-900`–`PRUNE-999` | — | **RESERVED** |

**Observed usage (recorded, so the census is checked rather than trusted):** CL-3 authored
`PRUNE-100`–`PRUNE-173`; CL-4 authored `PRUNE-300`–`PRUNE-399`; CL-5 authored `PRUNE-801`–`PRUNE-839`;
and the 2026-09-21 **fix pass** — a post-merge review pass over the already-merged catalog, **not** a
cluster — authored `PRUNE-600`–`PRUNE-603` in the amendment block. **Every authoring cluster reports the
block it occupied and its occupied range** (§4.2 rule 3), so MERGE can verify the partition arithmetic
instead of re-deriving it.

**Rules.**
1. **Global uniqueness (binding across clusters and passes):** one `PRUNE-###` id identifies **exactly
   one** row in the landed artifact, in every section, forever — the three allocated blocks are
   pairwise disjoint by construction, and a cluster may not author outside its block.
2. **A retired id is NEVER reused** (§3.3 field 1, §3.6 tombstone rule) — not by a later cluster, not
   by the deferred generator, not by a re-keying MERGE (see rule 4).
3. **A RESERVED block is not allocable without an amendment to this spec.** A cluster that exhausts its
   block reports the overflow and stops; it does **not** spill into a reserved block.
4. **The MERGE pass may renumber only MIRROR-adjacent provisional ids** — i.e. an id whose row is
   still PROVISIONAL (`derived:false`) **and** whose renumbering changes no judged content.
   **MERGE may never re-use an id** (rule 2) and **may never silently renumber a JUDGMENT row**: a
   renumber that would move a row's judged content, or that must retire an id, is a recorded §C.8
   change-log entry naming both the old and the new id, **never** a silent edit (`FS2`/`FS4` class).
   A JUDGMENT row keeps its id; if its capability is what is wrong, §3.5.2 governs, not renumbering.
5. **The `600`–`799` block is the AMENDMENT / FIX-PASS block** (§9 (26)): it holds the rows added by a
   **post-merge fix or review pass over an already-merged catalog** — a missing behavior, a mis-pointer
   repair, a merge repair. Three duties attach to such a row: **(a)** it is recorded in the artifact's
   **§C.8 change log**, naming the pass and the ids it added; **(b)** it is **counted in the §C.6.3
   `counts`**, so a fix-pass addition is visible to the register tally instead of being an unregistered
   extra; and **(c)** its id is **never re-used and never renumbered** (rule 2 applies unchanged — this
   block is an ADDITION path, never a re-keying path). The block is **not** an authoring cluster's
   allocation: a cluster may not author into it (rule 1), and rule 3 still forbids a cluster spilling
   into a RESERVED block.

### 3.5.2 CAPABILITY/CLUSTER STRADDLES — the merge resolution rule (pinned so MERGE acts mechanically)

**The gap (§9 (20)).** The §4.2 cluster split was never a capability boundary: CL-3 (scoped to five UI
capabilities) in fact authored rows whose behaviors belong to CL-4's capabilities, and CL-4 listed ~15
straddling rows by id. A row that straddles must be resolved by a **rule**, not by a preference.

**The rule (one behavior, one row, one capability):**
1. **The row whose `capability` matches the behavior's TRUE capability wins** — the capability the
   behavior's own subject falls under per §3.2's `Owns` clauses (a container/geometry change ⇒ the
   container's capability; a content/state/data behavior ⇒ the behavior's capability). **The row's id
   does NOT decide:** the numeric block (§3.5.1) records which cluster authored a row, never which
   capability owns it.
2. **The loser does not vanish.** It keeps its register slot (§3.6 merged rule), its `statement` and
   its own pointers, and its `verdict` becomes **`merged-into:<winner-id>`**, with the winner's id
   resolving to a live row in the same artifact (`FS10`).
3. **The pairing is recorded in §C.7** by name (winner id + loser id + the one-line reason), so the
   merge is visible rather than silent.
4. **A merge never deletes evidence.** The loser's `evidence_pointer` is **folded into the winner's
   `verdict_basis`** as a named pointer (not copied prose), and the loser's own pointers must still
   agree, else the row freezes (§3.6).
5. **Exactly ONE live row per behavior.** Two live rows for one behavior is a duplicate register row
   (`FS2`'s class); a `merged-into` chain with two live rows is the same condition.
6. **Exactly ONE `invalidated-conflict` row per conflict.** Where two clusters authored the same
   conflict (the mandatory C13-vs-`PANE-VISIBILITY-IRREVERSIBLE` instance), MERGE keeps one row
   carrying the freeze and merges the other into it.
7. **The one reported id/capability straddle — `PRUNE-346` — is resolved by rule 1, without a
   renumber.** CL-4 reported that `PRUNE-346`'s capability cell reads `MCP-ENDPOINT-CONTRACT` while
   its id sits numerically at the end of the `SETTINGS-MODAL-THEME` block. **MERGE must:** (a) keep
   the row's id `PRUNE-346` — **a renumber is unnecessary**, because §3.5.1 allocates `PRUNE-300`–`599`
   to CL-4 **as a block containing both capabilities**, so an `MCP-ENDPOINT-CONTRACT` row inside that
   block needs no re-keying and `PRUNE-600`–`799` is the **amendment / fix-pass block** (§3.5.1 rule 5,
   §9 (26)) — never an authoring cluster's spill space; (b) confirm the row carries
   **exactly one** capability id (§3.2), taking the one the behavior's subject supports; and (c)
   record the resolution (and the recount) in §C.8's change log. **No row is lost and no id is
   retired by this resolution.**

### 3.5.3 THE "OWNING ROW" TEST for `status_pointer` (pinned)

**The gap (§9 (21)).** §3.4 rule 3 says the pointer addresses "the row that owns the status, not a row
that merely mentions the behavior", but two authored cells cited a **report observation** rather than an
owning tracker row, which leaves the rule unusable by a mechanical check.

**The test (all three must hold for the cited row):**
1. **Subject identity** — the cited row's own subject **IS** the behavior (the row would be edited, and
   would be the row whose state changes, if the behavior changed); a row that merely *mentions*,
   *cross-refers*, *reproduces* or *observes* the behavior does not own it.
2. **Status ownership** — the cited row is the row whose status cell a reader would open to learn the
   behavior's state (`docs/defects.md` row status, `docs/decisions.md` row status, …). A **report
   doc**, a **session audit**, a **coverage report**, a live-scenario block or a `docs/next-steps.md`
   observation **never owns a status** — these can only appear in `evidence_pointer`.
3. **Tie-break** — where two rows both satisfy (1): the pointer names the row whose **own subject is
   the behavior** where one is a rollup/umbrella and the other is the specific row; two rows that
   disagree on the status freeze the row at `invalidated-conflict` (§3.7 rule 1).

**Fail-state.** A `status_pointer` aimed at an **observing report** (a report doc's observation row, a
session-audit row, a coverage-report row) **where an owning tracker row exists** is **`FS24`**. The two
recorded instances are `PRUNE-139` and `PRUNE-149`, both citing
`docs/specs/user-demo-bug-report-2-2026-09-15.md:§1` (row B7, a recorded observation) where an owning
`docs/defects.md` row exists for the same behavior. **Legal exception (must be recorded):** where **no**
owning tracker row exists anywhere in the enumerated source set (§3.6), the closest observing record may
stand **as `evidence_pointer`**, and the row records `invalidated-pointer` in `verdict_basis` — in which
case it may never be pruned (§3.6 stale/invalidated rule) and the gap is named in §C.7. An
`invalidated-pointer` row is **not** the same thing as an `invalidated-conflict` row: the first is a
missing owner, the second is two disagreeing owning rows.

### 3.6 §C.3/§C.4 — the verdict rules: prune criterion, positive negative evidence, sign-off gate, shrink/tombstone, stale

**The prune criterion (all three clauses must hold):**

> **`no requirement origin of ANY kind`** (no user origin, no decision origin, no pinned-spec
> origin, no upstream-contract origin) **AND `no non-test consumer` AND `no live-confirmed
> regression pin`** ⇒ `escalate-prune`, with the mechanical test recorded in `verdict_basis`.

Because the first clause is **absence-based** and this repo demonstrably has **unwritten/dangling**
user provenance (§6.4's report-#3 lineage), the criterion is **not sufficient** on its own:

**POSITIVE NEGATIVE EVIDENCE (mandatory, C7).** A row may reach `escalate-prune` only with **all
three**:

1. **An `origin_search` record** in `verdict_basis` — what was searched, when, and the result.
   Minimum enumerated source set: the six tracker inputs (`docs/defects.md`, `docs/decisions.md`,
   `docs/pending.md`, `docs/next-steps.md`, `docs/specs/user-flow-audit-checklist.md`, this catalog),
   **plus** `docs/HANDOFF.md`, **plus** `docs/feature-requests/*`, **plus** the report #1/#2 docs,
   **plus** the report-#3 prose block (§6.4), **plus** `docs/specs/**`. Shape:
   `origin_search: {date: <YYYY-MM-DD>, sources: [<enumerated paths>], result: none-found | found:<pointer>, searched_by: <role>}`.
2. **A documentation-reviewer confirmation** (item 10d) recorded at the row's section pointer.
3. **Survival of one full review cycle at `escalate-prune`** (a one-cycle cooldown) — a candidate
   may not be deleted in the same cycle it is raised.

**Freezes (never escalate, C7).** Any row whose provenance is `user-verbatim` /
`user-directed-record` / `user-ratified-spec`, **or** whose lineage touches a **dangling citation**
(§6.4), **freezes at `keep-advisory`** and can never escalate. "Freeze" means: the row remains
enumerated, `verdict: keep-advisory`, with the freeze reason in `verdict_basis`.

**The sign-off gate.** `prune_signoff: user-approved:<date>` is **MANDATORY before any deletion**;
`prune_signoff: none` makes a row **non-deletable by construction**. **This unit deletes NOTHING** —
not a register row, not a tracker row, not a file, not a cell.

**The stale rule.** A row is `stale` when its `last_verified` is **strictly earlier than the
manifest's newest input digest date** (§3.8). **`stale` rows, `invalidated-pointer` rows and
`invalidated-conflict` rows may NEVER be pruned** — a row the catalog cannot currently vouch for is
exactly the row that must not be deleted. (These three are *row conditions*, not `verdict` values;
they are recorded in `verdict_basis` and constrain the `verdict`.)

**The shrink rule (deferred; recorded here so the generator unit inherits it).** When a prune
actually lands (a future unit, with user sign-off):

1. the register row is **deleted in the same pass** as the deletion, and
2. it is **appended verbatim** to `archive/catalog/<date>-pruned.md`, **and**
3. **because `archive/` is gitignored, the same pass MUST leave a git-visible tombstone**:
   a `PRUNE-###` line in the **deletion commit message** naming every id, **and** a **tombstone
   row** in the catalog recording `(PRUNE id, date, sign-off, landing commit, deleted paths/spans)`.
   **The archive copy is NOT evidence; the tombstone is** (C8). A retired `PRUNE-###` id is never
   reused.

**§C.4 upstream-owed rows are NON-PRUNABLE BY CONSTRUCTION** — they are indexed from
`docs/HANDOFF.md` + `docs/pending.md:§UPSTREAM foundation requests` + `docs/feature-requests/*`
(GR-1..GR-9, SC-1..SC-7, PS-1, the four Gnosis handoff rows); their `verdict` is pinned to a
non-prunable form (`keep` / `keep-advisory`), and `escalate-prune` on a §C.4 row is `FS11`. **The
set is COUNTED, never asserted** (C11).

**The four Gnosis handoff rows, ENUMERATED (§9 (23)).** The phrase "the four Gnosis handoff rows" was
used in this contract **without an enumeration anywhere** and **without its members being named as
such**. **The verified set** — the Gnosis-repo-directed handoff rows in `docs/HANDOFF.md` §OPEN handoff
items — is: **`GNOSIS-ENGINE-QUERY-MODE-IGNORED`** · **`GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT`** ·
the **O-7 INGESTION-ONTO-THE-ENGINE pointer row** · the **O-8 AUTHORITY SWITCH / OFFLINE DUAL-PATH
pointer row** (the latter two are pointer rows to `docs/pending.md` §"PARKED DESTINATION — the engine
track"). **The fifth Gnosis-family row, `HOST-ENGINE-QUERY-POST-NO-ENVELOPE`, is NOT one of the four** —
it is this repo's app-side status owner (the shell-side fix for the GR-1 query route), so it is an
owning `status_pointer` for GR-1's row and belongs to the register's app-side capabilities, not to the
"four" count. **Authority, recorded because the count must not be re-derived differently in a later
pass:** this enumeration follows the GR-1..GR-9 index paragraph + the two bolded Gnosis defect rows +
the two O-7/O-8 bolded pointer rows (four bolded Gnosis-repo rows) in
`docs/HANDOFF.md:§OPEN handoff items`, and it matches the reading the §C.4 ledger cluster recorded
(reading the O-7/O-8 pointer rows as two of the four). **If a later pass reads the four differently**,
it must (a) name the alternative set in §C.8's change log with its pointer, and (b) keep the §C.4
count ≥ the enumerated set — **never silently re-derive the phrase**.

**`merged-into:<id>` (pinned choice, see §9).** A `merged-into:<id>` row **keeps its register slot**
(it is NOT deleted) so the merge stays reversible and the tombstone ledger is not needed for it;
its `statement` is retained for provenance; the target id **must resolve to a live row in the same
artifact** (unresolved ⇒ `FS10`); and a merged row's own pointers must still agree, else it freezes.

### 3.7 §C.7 — the conflict + waiver ledger, and the tracker-vs-tracker / tracker-vs-spec rules

**Rule 1 (tracker governs).** Where the catalog and a tracker disagree about STATUS, the **tracker
governs** and the catalog row is corrected in the next pass; where the row's **own pointers
contradict each other** (two owning rows, two readings), the row freezes at
**`invalidated-conflict`** until the next cycle and is named in §C.7.

**Rule 2 (tracker vs SPEC — neither governs automatically).** Where a **tracker** and a **spec**
disagree, the catalog **freezes the row and records the conflict in §C.7**; it does not pick a
winner. **The live instance (mandatory, first entry of §C.7):**
`docs/specs/ui-overhaul.md` **C13 pane-visibility dropdown — "confirmed by the user, 2026-09-11"**
(i.e. the option is a *confirmed* feature) **vs** `docs/defects.md` **`PANE-VISIBILITY-IRREVERSIBLE`**
— whose recorded user instruction is to **REMOVE** that option (there is no way back to a hidden
pane, so the affordance should not exist). These two cannot both hold. **Resolving it is a
tracker/spec amendment owned by the documentation reviewer (item 10d) — NOT by this catalog.**
The catalog's job is to freeze the row, name both pointers, and record the conflict.

**Rule 3 (waivers).** §C.7 is also the **waiver ledger**. Every **unlinked tracker id** (a tracker
row id that no catalog row points at) MUST be **waived BY NAME** in §C.7 with a reason — a silent
omission is `FS13` (C11). Waiver-row fields: `linked_id` | `kind` (id | section | anchor-token) |
`reason` | `owner` | `revisit_condition`. The same ledger carries the pointer-resolution `warn`s
(§3.5 rule 3).

**Rule 4 (§C.8 change log).** Each row records the pass date, which sections were re-verified, the
input hashes read, and the drift found. Rot thus becomes visible instead of silent (R1's residual
mitigation).

### 3.8 §C.6 — the derivation manifest, the digest, and determinism (C2/C3/C11)

The manifest records, for the landed artifact:

| Manifest field | Content | Rule |
| --- | --- | --- |
| `artifact` | `docs/requirement-catalog.md` | fixed |
| `derivation` | `hand-derived` (this unit) \| `generated` (later) | **this unit lands `hand-derived`** |
| `derived` | `false` (this unit) | the MIRROR cells are PROVISIONAL (§3.3) |
| `generator` | `<none>` (this unit) \| `scripts/catalog-derive.mjs` (later) | this unit creates no generator |
| `as_of` | `YYYY-MM-DD` — the **deterministic** as-of date | the authoring pass writes it explicitly and marks it PROVISIONAL; **never wall-clock, never mtime** |
| `inputs` | one row per input: `path`, `sha256`, `bytes`, `rows_read`, `newest_digest_date` | counts are **recorded** (C11); a missing input row is `FS12` |
| `counts` | `capabilities`, `tier1`, `tier2`, `tier2_prunable_verdict`, `upstream_owed`, `checklist_rows`, `excluded_specs` | all **DERIVED** by the authoring pass — the architecture's ~40/~90/~25 figures are estimates, never to be copied through |
| `excluded_specs` | **every non-input `docs/specs/**` path** present at landing (not just `unit-*.md`), each with a reason **class** | the O-5 spec must not land outside a "closed" partition (C11); a path that is neither an input nor excluded is `FS23` |

**Determinism rules (C3 — they bind the deferred generator too, and are recorded here so Unit 2
inherits them):**

1. **No `Date.now()`, no mtime, no git and no shell input may appear in the derived region.**
   `last_verified` is derived from a **deterministic** input: the `--as-of` date the generator is
   invoked with, or a date parsed from the input text — **never wall-clock**.
2. **The manifest digest is text.** A row is `stale` when its `last_verified` is strictly earlier
   than the newest `newest_digest_date` among the input rows. **`last_verified` is the as-of date of
   the pass that resolved the row; `stale` compares DATES only — never hash strings, never a
   `sha256`, never a byte count** (§9 (18)). **The per-input `newest_digest_date` is read from the
   input's own content (a dated header inside the file), with the manifest's `as_of` as the
   fallback, and NEVER from mtime or any other filesystem metadata** (`FS16`). With every input at
   the as-of date, **no row is `stale` on landing day**.
3. **The generator is import-safe** (no module-scope side effects) and **writes only inside its
   sentinel region** in §C.6 (`<!-- catalog:derived:begin -->` / `<!-- catalog:derived:end -->`).
4. **Determinism is proven against a FROZEN FIXTURE**, never against live prose (C2): the deferred
   test compares two runs over a committed snapshot under `tests/fixtures/**`, byte-for-byte.
   The live-region check is a **non-gating staleness report**.
5. **The deferred test must never write into `docs/` during `npm test`** (hermeticity).

### 3.9 ARTIFACT B — the checklist column addition (additive only)

**Target:** `docs/specs/user-flow-audit-checklist.md` (verified NOT read by any test at runtime —
§2.2 fact 4; only comments in `scripts/live-drive.mjs` and `tests/live-drive-contract.test.ts`
reference it).

**The edit: ADD exactly three columns**, `Provenance | Direction | Catalog`, **appended to the
right of the existing `Coverage` column** (keeping `| ID | Flow/Element | Spec ref | Proposed live
assertion | Coverage | Provenance | Direction | Catalog |` as the new row shape).

| Column | Legal cell content | Rule |
| --- | --- | --- |
| **`Provenance`** | one §3.4 provenance token (multiple ⇒ the set, comma-separated) | every row carries a **PROVISIONAL** hand-authored token; §C.0/the Coverage block marks it provisional |
| **`Direction`** | one §3.4 direction token (6 legal values: the five `wants-*` tokens + `n/a`) | `n/a` is legal where **no direction was expressed at all** (contract/engineering rows); a keep-class row (a report whose re-drive PASSED, `PASS-not-reproduced`) carries **`wants-keep`**, never `n/a` and never `wants-less` (§3.4 direction rule, §9 (17)) |
| **`Catalog`** | a `PRUNE-###` pointer (or a `capability` token where the row maps to a capability but no register row), or the empty-cell marker `—` | the `Catalog` cell is a **POINTER**, never a verdict; `—` is the ONLY empty-cell marker |

**Rules (each one is a review input):**

1. **ADDITIVE ONLY.** No existing cell is rewritten — not one character of `ID`, `Flow/Element`,
   `Spec ref`, `Proposed live assertion` or `Coverage` may change. **No row is added and no row is
   removed**: the row-ID set stays exactly as it is (the closed enumeration
   `docs/specs/user-flow-audit.md` §2 pins the ids; D-GP-UFA-1 calls the file "the full ~112-row
   census"). The only non-data edits are the header line and its separator row, extended for the
   three new columns in **each of the 14 data tables** — `§1` through `§14`, one table per section
   (`§15`/`§16`/`§17` carry no row tables). **Corrected in this pass: the count is 14, not 13**
   (§9 (22); a header + separator pair occurs once per `§1`..`§14`). **The mechanical rule for any
   later recount: count the `UF-` row ids in the data rows — never the number of tables and never
   the `Coverage` cell text.** The table count is only the count of header/separator pairs the edit
   touches; the row count is the count of `UF-` ids (§3.9 rule 2).
2. **NO ROW COUNT CHANGE.** The landed row count is whatever a count of the data rows returns; it
   is **recorded as DERIVED**, and it is **not** to be stated as the flat "112" (C6 (iv) — the file
   says "≈ 112", D-GP-UFA-1 says "~112"; per-surface §16 figures sum to 112).
3. **NON-VERDICT METADATA — restatement in the "Coverage vocabulary" block.** The block at the head
   of the checklist gains a short **non-authority restatement** in these terms: *"`Provenance`,
   `Direction` and `Catalog` are NON-VERDICT METADATA added by the ADVISORY requirement catalog.
   `Coverage` remains the ONLY live-status cell in this file. No prune verdict lives in this file —
   the `Catalog` column is a POINTER. No cell here is a coverage claim, and no catalog row is
   evidence for any row's coverage."*
4. **THE `user-flow-audit.md` NO-CHANGE STATEMENT LIVES HERE, NOT THERE.** Per §2.4, the
   no-change statement is recorded in this spec + the ACTIVE decision row (§5.3): **`docs/specs/user-flow-audit.md` §2's §5.U matrix stays U-1..U-8; `MATRIX_ROWS` in `scripts/live-drive.mjs`
   is unchanged; the §6.1 report schema is unchanged; and ZERO new matrix rows are claimed**
   (recorded, not silent — the C7-style disclosure). **The D-GP-UFA family stays the authority.**
5. **D-GP-UFA INTERACTION.** D-GP-UFA-2's proxy-PASS ban keys on each row's `Coverage` cell being
   that row's live-status cell; the new columns are metadata and do not create a new proxy surface
   **provided** the restatement (rule 3) is present. D-GP-UFA-1's ≤8 cap is on **§5.U U-rows**, not
   on checklist rows: **the three columns touch neither the cap nor `MATRIX_ROWS` nor the §6.1
   schema** (§5.3's decision row pins this).
6. **THE `Catalog` CELLS DO NOT HAVE TO BE POPULATED.** A checklist row with no register row keeps
   `—`; that is legal and is not an unlinked-id failure (§3.6's unlinked-id duty is about **tracker
   ids**, not checklist rows).

### 3.10 The closure / census duty (C11 — the test the deferred contract mechanizes)

For **each tracker input**, the catalog MUST publish four counts: **discovered ids**, **linked ids**,
**unlinked ids**, and (for the two id-less inputs) **anchor-tokens resolved/failed**. Definitions:

- **discovered** = every row id present in that tracker's own row grammar (a defects row id, a
  decisions row title, a pending SCHEDULED/DEFERRED/PARKED/SPECULATIVE row, a checklist row id);
- **linked** = referenced by at least one catalog row's `status_pointer` **or** `evidence_pointer`;
- **unlinked** = discovered − linked;
- **every unlinked id is waived BY NAME in §C.7 with a reason** (§3.7 rule 3).

**Closure tests** (the deferred contract test mechanizes exactly these):

1. every catalog row has exactly one capability, from the closed 16 (§3.2);
2. per-capability counts sum to the row total; Tier-1/Tier-2/§C.4 counts equal the manifest's
   `counts`;
3. every `prune_signoff:user-approved:<date>` row has a §3.6 evidence set (or is frozen);
4. no `escalate-prune` row carries a `user-*` provenance or a dangling-citation lineage;
5. the checklist's landed row count equals the manifest's `checklist_rows`, and no row id was added
   or removed (diff-checkable against the pre-edit file) — **the count is the number of `UF-` row ids
   in the data rows** (§3.9 rule 1's recount rule), never the number of tables and never a figure
   copied from the checklist's own coverage summary (§6.7 (c));
6. every unlinked id appears in §C.7 by name.

### 3.11 The landed catalog's own §C.x ↔ this spec's §n mapping (so the deferred unit can cite either)

The catalog's sections are named `§C.0`–`§C.8`; this spec's clauses are named `§1`–`§10`. The
mapping a reader needs: §C.0 ← §3.1 · §C.1 ← §3.2 · §C.2 ← §3.3 + §9 items 1–15 · §C.3 ← §3.3 + §3.6 ·
§C.4 ← §3.6 (the ledger's non-prunable clause) · §C.5 ← §3.4 · §C.6 ← §3.8 · §C.7 ← §3.5 rule 3 +
§3.7 · §C.8 ← §3.7 rule 4. **The catalog itself must not restate fail-states by number** (its
`verdict_basis` cells record the mechanical test, not an `FS-n` reference) — the `FS1`..`FS19` ids
are THIS spec's vocabulary and the deferred contract test's checkset.

### 3.12 ARTIFACT C — the DEFERRED generator + contract-test unit (recorded, NOT created here)

**Do NOT create** `scripts/catalog-derive.mjs` or `tests/requirement-catalog-contract.test.ts` in
this unit. They are recorded here and in `docs/pending.md` §SCHEDULED + `docs/next-steps.md`
§OPEN (§5.2/§5.4) as their own code-bearing unit with its own full gate cycle.

**The deferred unit's contract-test clause set (carried, for its own spec to adopt):**

| Clause | Asserts | Carried condition |
| --- | --- | --- |
| (a) | the derived region is byte-identical across two runs over a **committed frozen fixture snapshot** | **C2** (never against live trackers) |
| (b) | every in-repo pointer resolves, with **hard-fail** on `row-id`/`section-ref` and **warn** on `anchor-token` | **C4** |
| (c) | the manifest's `counts` equal the recount; every `docs/specs/unit-*.md` is an input or named in `excluded_specs` | **C11** |
| (d) | the §3.10 closure tests (capability partition, sign-off/evidence pairing, freeze rules, checklist row count, §C.7 waivers) | **C11/C7** |
| (e) | the citation-discipline scan over catalog-authored cells (no line numbers; `archive/**` only in `evidence_pointer`; no status verbs) | **C10** |
| (f) | `last_verified` is `--as-of`-driven — no time/mtime/git input in the derived region | **C3** |

**The deferred unit's own hard boundaries:** no `src/**` read-and-edit (READ only, for the
`code_anchor` resolution check, C9); no sentinel-region write outside §C.6; no `docs/` write during
`npm test`; no `BLOCKS`/`MATRIX_ROWS` change; **it must not couple the trio to mutable prose**
(C2). **Every regeneration of the catalog obligates the deferred unit's test to re-run against the
new register** — that obligation is the named trigger's consequence, not this unit's.

---

## 4. The unit's process (explicit — this is a DOC-ONLY unit)

### 4.1 No red set, no register, no trio obligation for THIS unit

- **No TestWriter red set** (AGENTS.md item 3): there is no code obligation — no `.ts`, no `.mjs`,
  no `src/**`, no test file is authored or changed.
- **No §5.x property register**: **0 rows, 0 attempts**, recorded in the status block above with
  its justification (no code surface). This is a recorded exemption, not a silent default.
- **No trio obligation**: `AGENTS.md` item 4 binds a unit that changes features/tests; this unit
  changes neither. The doc-only precedent is explicit
  (`docs/specs/astrographer-scope-realignment-review.md` §2.2 C8 + §6).
- **No handoff row, no live row, no `-greens.md`, no `-live-pending-battery.md`**: the unit has no
  app surface to exercise. **Parking language must not be used to mask this** — RCA-11's rule
  concerns a UI unit's live battery; this unit **has no live scope at all**, which is why the
  layer declaration (§status block) says so plainly.

### 4.2 The authoring pass — DELEGATED PER CLUSTER (RCA-2)

The catalog's content is authored in **clusters**, each its own delegated work item (RCA-2: a
multi-part deliverable is split, never inlined as one pass). The split:

| Cluster | Produces | Scope |
| --- | --- | --- |
| **CL-1** | §C.0 + §C.1 | the scope/non-authority block + the 16-capability definitions and mapping table |
| **CL-2** | §C.2 | the Tier-1 capability×surface rollup (its ~40 rows) |
| **CL-3** | §C.3 part 1 | the judgment-heavy register half (the rows whose verdicts need an origin search) |
| **CL-4** | §C.3 part 2 | the remaining register rows + the merge/verdict bookkeeping |
| **CL-5** | §C.4 | the upstream-owed ledger (counted, non-prunable) |
| **CL-6** | §C.5 + §C.7 | the frozen vocabularies + the conflicts/waivers ledger (incl. the mandatory C13-vs-N1 conflict, §3.7 rule 2) |
| **CL-7** | §C.6 + §C.8 + the checklist edit | the manifest, the change log, and Artifact B's three columns |
| **MERGE** | the single catalog file | the ONLY writer of `docs/requirement-catalog.md` |

**Rules.**
1. **Staging path for the per-cluster fragments:** `archive/catalog-authoring/<date>/<cluster>.md`
   (the gitignored `archive/` tree, mirroring `archive/pending/`). **The fragments must be merged
   into the single catalog file by the MERGE pass** — no cluster writes the catalog directly, and
   no cluster's fragment is left as a "canonical" file (a fragment cited as canonical is a review
   finding: `archive/**` may appear only inside an `evidence_pointer`, §3.4 rule 8).
2. **No authoring cluster may cite a line number** — the citation discipline (§3.4 rule 7) binds
   every cluster as if it were writing the catalog itself.
3. **Each cluster reports its counts** (rows produced per section, inputs read) so the MERGE pass
   can compute the manifest's `counts` instead of asserting them — **and reports the `PRUNE-###` block
   it occupied (§3.5.1), authoring only inside its allocated block** (CL-3 `100`–`299`, CL-4
   `300`–`599`, CL-5 `800`–`899`; a reserved block is not allocable without an amendment to this spec).
4. **The `Provenance`/`Direction` tokens are assigned by the cluster that owns the section they
   live in** (CL-7 for the checklist; CL-3/CL-4 for the register), never guessed by MERGE — **using the
   amended §3.4 vocabulary, in which a keep-class row carries `wants-keep`** (§9 (17)).
5. **A cluster authors the rows its scope names, and reports any row it authored for a behavior
   belonging to another cluster's capability** — MERGE resolves those by the §3.5.2 straddle rule, so a
   cluster never deletes a straddling row to "fix" the scope and never re-keys a capability cell
   silently.

### 4.3 The READ-ONLY adversarial pass (`role_adversarial_reviewer`, RCA-3)

After the merge, a read-only adversarial pass runs over the catalog and **hunts, at minimum**:
missing user statements; mis-tiered provenance (a `contract-pinned` row that is really
`user-verbatim`, and the reverse); **phantom citations**; **copied status text**; **line numbers**;
**`archive/**` used canonically**; **unwaived unlinked ids**; and **C13/N1-style contradictions**
(a tracker row and a spec row that cannot both hold, §3.7 rule 2). Findings are recorded in **this
spec's §6** (the fail-state table is the checkset) and each host-side finding is fixed in the same
pass. A DONE row that cites no adversarial pass is a review finding.

### 4.4 The mandatory documentation review (`role_documentation_reviewer`, item 10d / RCA-6)

A read-only documentation review reconciles **every pointer in the catalog against the trackers and
the actual build** — each `status_pointer` and `evidence_pointer` is opened and compared; each
`user-*` provenance is checked against its quoted origin; the census claims are recounted; the
section numbers and cross-references are checked; and **every stale entry is fixed in the same
pass**. Recorded at **`archive/reviews/<date>-requirement-catalog-doc-review.md`**. This review —
not the spec — owns the conflict resolution of §3.7 rule 2 and the C7 dangling-citation fix
(§6.4).

### 4.5 The final trio — a REGRESSION READING, not this unit's green

After the doc edits land, run the trio once: `npm test`, `npm run typecheck`, `npm run build`.
**Purpose: a regression check that the doc edits broke no doc-coupled test** — the checklist is not
read by any test (§2.2 fact 4) and no `src/**` was touched, so the expected reading is unchanged.
**Report the reading; state explicitly that it is a regression check and NOT this unit's green**
(§status block: nothing here is app-green). A **non-zero** result must be attributed to a
pre-existing or other-unit cause and recorded — never silently absorbed, never relabelled.

---

## 5. Fail-states (FS) and the exact observables

Each fail-state is loud: it names the row id / pointer / count **and** the rule it violates. A
catalog that trips any of these is **not landed**, and the deferred contract test must mechanize the
mechanizable subset (§3.12 clause set).

| # | Fail-state | Observable + exact rule violated |
| --- | --- | --- |
| **FS1** | A row has no capability, `UNCLASSIFIED`, or two capabilities | the row is refused naming `UNCLASSIFIED` (or both ids); **§3.2 the partition is closed and total** |
| **FS2** | **Id collision or duplicate register row** (the same `PRUNE-###` twice, or a retired id reused) | both occurrences are named; **ids are unique and retired ids are never reused** (§3.3 field 1, §3.6 tombstone rule) |
| **FS3** | **Copied status text** in a catalog-authored cell | the copied fragment is quoted and must be replaced by a pointer; **§3.1 rule 1 / §3.4 rule 1 — the tracker is the sole status authority** |
| **FS4** | **MIRROR hand-edit after the generator exists** (or an unmarked hand-authored MIRROR cell before it) | the edited cell is named; a pre-generator MIRROR cell must carry the manifest's `derived:false`; **§3.3 / §3.4 rule 2** |
| **FS5** | **A line number in a catalog-authored cell** | the offending cell and the number are named; **§3.4 rule 7 — symbols/section refs only** |
| **FS6** | **`archive/**` used as canonical** (a `status_pointer`, a §C.1/§C.2 cell, or an unmarked pointer) | the pointer is named; **§3.4 rule 8 — `archive/**` appears only inside a marked `evidence_pointer`** |
| **FS7** | A required field is empty or `<none>` where `<none>` is illegal | the field path is named (never coerced); only `code_anchor` admits `<none>`; **§3.3 field 9, §3.5 pointer `none` rule** |
| **FS8** | **An unresolved `row-id` or `section-ref` pointer (hard-fail)** | the pointer text is printed with "does not resolve"; **§3.5 — a row-id/section-ref pointer must resolve** |
| **FS9** | **A moved `anchor-token` pointer** (`docs/next-steps.md` / `docs/pending.md` heading + quoted opening no longer matches) | **WARN, never fail**: the pointer, the expected opening and the nearest candidate opening are printed, and the row enters §C.7 until re-pointed; **§3.5 rules 1 and 3** |
| **FS10** | **`merged-into:<id>` whose target does not resolve to a live row** | the target id is named; **§3.6 merged rule** |
| **FS11** | **`escalate-prune` on a §C.4 upstream-owed row**, or on a `stale` / `invalidated-pointer` / `invalidated-conflict` row | the row id, its §C.4 membership / condition, and the rule are named; **§3.6 "never pruned" set** |
| **FS12** | **`escalate-prune` without its full evidence set** — a missing `origin_search`, a missing doc-reviewer confirmation, a missing one-cycle cooldown, or a `user-*`/dangling predecessor | the missing part is named one by one; **§3.6 positive negative evidence + freezes (C7)** |
| **FS13** | **A deletion without sign-off** (or a row marked deletable while `prune_signoff:none`) | the row id and its sign-off value are named; **§3.6 — no deletion without `user-approved:<date>`; no deletion may cite the catalog as its authority** |
| **FS14** | **A pointer pair that contradicts itself, or a tracker-vs-spec conflict** left unrecorded | the two pointers/authorities are printed and the row's `verdict: invalidated-conflict` is required, with the conflict named in §C.7; **§3.7 rules 1 and 2** |
| **FS15** | **The manifest is missing, or an unresolved input hash/count** | the missing manifest field / input row is named; **§3.8 — six required fields + one row per input** |
| **FS16** | **A `last_verified`/date sourced from wall-clock, mtime, git or a shell read** | the value and its source are named; **§3.8 rule 1 / C3 — the derived region has no time input** |
| **FS17** | **A checklist row count change** (rows added, removed, or renumbered by the column edit) | the added/removed/renumbered ids are named; **§3.9 rule 1 — additive only, ids fixed** |
| **FS18** | **A newly added tracker row not waived** (an id present in a tracker input that appears in neither a catalog pointer nor a §C.7 waiver) | the id is named with "unlinked and unwaived"; **§3.10 closure test 6 / C11** |
| **FS19** | **An unwaived `anchor-token` `warn`** (§C.7 missing an FS9 entry after a landing) | the pointer and its §C.7 absence are named; **§3.5 rule 3** |
| **FS20** | **A `user-*` row (or a row whose recorded re-drive contradicts its report) stamped `n/a`** — the keep-class mis-stamp | the row id, its provenance token and its keep-class evidence are named, with the required token `wants-keep`; **§3.4 direction vocabulary — `n/a` is for rows with NO expressed direction; a user-origin keep-class row carries `wants-keep`** |
| **FS21** | **A capability/cluster straddle landing as two live rows for one behavior** (or two `invalidated-conflict` rows for one conflict) | both ids are named with the one-line reason; one row must carry `merged-into:<winner-id>` and the pairing must appear in §C.7; **§3.5.2 rules 1–6** |
| **FS22** | **A `PRUNE-###` id used outside its cluster's allocated block** (§3.5.1), or a renumber that re-uses a retired id / silently renumbers a JUDGMENT row | the id, its block of record and the rule are named; **§3.5.1 rules 1–4 / §3.3 field 1** |
| **FS23** | **A `docs/specs/**` path that is neither an input nor listed in `excluded_specs` with a reason class** | the path is named with "neither an input nor excluded"; **§3.8 `excluded_specs` — every non-input `docs/specs/**` path carries a reason** |
| **FS24** | **A `status_pointer` aimed at an observing report** (a report-doc observation row, a session-audit row, a coverage-report row) **where an owning tracker row exists** | the pointer and the owning row that should have been cited are both printed; **§3.5.3 owning-row test** (the legal no-owner case is recorded as `invalidated-pointer` in `verdict_basis`, not passed silently) |

**Not a fail-state (legal, and must not be flagged):** a checklist `Catalog` cell holding `—`;
`direction: n/a` **on a row with no expressed direction** (a `contract-pinned` / `engineering-only`
row — **NOT** on a user-origin keep-class row, which is `FS20`); `direction: wants-keep` on a
keep-class row; a `keep-advisory` freeze on a `user-*` row; an `escalate-prune` candidate the user
**declines** (the register's designed failure mode is a declined candidate, not a deletion);
a `merged-into:<winner-id>` row that keeps its register slot; a §C.4 row whose `verdict` is
non-prunable; a `PRUNE-###` id whose numeric block differs from the capability of the row it labels
where §3.5.1 permits the block (**`PRUNE-346`'s shape**) — the block is an authoring allocation, never
a capability claim.

---

## 6. The landing pass — required writes and their exact shapes

**Landing order (mechanical, C2/C14 — the tracker rows are themselves input to a future derive, so
they must be written before any derive):**

1. author the clusters (§4.2) → merge into `docs/requirement-catalog.md` (MERGE — the only writer);
2. apply the three columns to `docs/specs/user-flow-audit-checklist.md` (§3.9);
3. write the five tracker rows (§5.1–§5.5) — **the LAST writer before any future derive**;
4. finalize the manifest's `inputs` hashes + `counts` (re-read AFTER step 3) and the §C.8 row;
5. record the two oracle hashes before/after (§2.5) in the DONE row.

### 6.1 `docs/next-steps.md` → DONE row (in `§CURRENT WORK / handover-state`)

Must carry: the unit name `REQUIREMENT-CATALOG`; the date; **the layer as DOC-LAYER ONLY — verifies
no envelope/app behavior** (RCA-12, C13); the doc-only gate exemption **cited**
(`docs/specs/astrographer-scope-realignment-review.md` §2.2 C8 + §6); the DONE-state files (the
catalog, the checklist edit); the review-record path `archive/reviews/<date>-requirement-catalog-doc-review.md`;
the adversarial pass result (recorded in this spec's §7); **the §C.2/§C.3/§C.4/§C.5 counts as
DERIVED figures**; the two oracle hashes before/after; the trio reading **labelled a regression
check**; and **a pointer to the deferred generator unit** (§6.2). It must NOT claim app/envelope
green (C13).

### 6.2 `docs/next-steps.md` → OPEN/queue row (in `§OPEN` or the NEXT QUEUE list)

The deferred generator+test unit (`scripts/catalog-derive.mjs` +
`tests/requirement-catalog-contract.test.ts`) with its **NAMED TRIGGER**: **the first
prune-candidate request, OR the first tracker row edited after the catalog lands — whichever comes
first.** Shape: the paths, the trigger, the C2/C3/C11 conditions carried (§3.12), and the fact that
it owes its own spec + §5.x register + red run + green + adversarial + blind-greens + doc review +
trio (`AGENTS.md` items 3/9/10).

### 6.3 `docs/decisions.md` → ONE ACTIVE row

Pins, in one row: **the catalog is ADVISORY**; **the tracker is the sole status authority**; **every
prune requires `prune_signoff:user-approved:<date>` and no deletion may cite the catalog as its
authority**; **the C13/N1 conflict is resolved by a tracker/spec amendment, never by the catalog**;
and **the minimal D-GP-UFA amendment (C6)** — *the checklist's three new columns are METADATA: they
do not touch the §5.U ≤8-row cap, they do not touch `MATRIX_ROWS`, and they do not touch the §6.1
report schema; the row count is DERIVED; zero new matrix rows are claimed*. If any earlier row is
contradicted, add a **SUPERSEDED** row in the same table — **never a silent deletion**
(`docs/decisions.md` head convention).

### 6.4 `docs/defects.md` → ONE new OPEN row — the C7 DANGLING CITATION

**The verified instance.** *"report #3"* is cited as a source by `docs/decisions.md` (the
`WHOLE-PAGE-EDITING` requirement row), by the **seven** defect rows **`TOP-BAR-NOT-FIXED`** (C1),
**`NAMEPLATE-NO-SIDE-MARGIN`** (C2), **`TABLE-CELLS-NOT-EDITABLE`** (C3),
**`FIND-IN-PAGE-NOT-WIRED`** (C4), **`DOC-NAV-NOT-A-TREE`** (C5),
**`PANE-TOGGLE-FULL-REASSEMBLY`** (C6), **`DOC-TITLE-NOT-EDITABLE`** (C7) — and by
`docs/specs/session-feedback-doc-audit-2026-09-16.md` — **but NO standalone report-#3 file exists**:
the committed reports are report #1 (`docs/specs/user-demo-bug-report-2026-09-15.md`) and report #2
(`docs/specs/user-demo-bug-report-2-2026-09-15.md`), and report #3's content exists **only** as the
prose block **"USER-DEMO BUG REPORT #3 (2026-09-16)"** inside `docs/next-steps.md`
(§`CURRENT WORK / handover-state`).

**The new row must carry:** the symptom (a cited document that does not exist); the reproduction (a
search for a report-#3 file finds none; the nine citations are listed **by id**); the root cause (the
report was recorded as a prose block in a tracker rather than committed as a document); and the fix
shape with **the two legal fixes** — **(a)** commit report #3 as a document, **or (b)** repoint every
citation to the next-steps block — **and record which one was chosen** (AGENTS.md item 6c: never
leave a citation pointing at a moved file).

**The catalog's own handling of the lineage (pinned, so the authoring pass does not reinvent it):**
for those rows the `evidence_pointer` points at **the tracker rows + the report-#3 block in
`docs/next-steps.md`** (never at a non-existent report path), and **rows on this lineage FREEZE at
`keep-advisory`** (§3.6 freezes). This is the concrete case that motivates C7's positive-negative-
evidence rule — the repo cites a user requirement that was never written down.

### 6.5 `docs/pending.md` → ONE SCHEDULED row

Under **`§SCHEDULED (dated work, not yet started)`** (whose status vocabulary is `SCHEDULED`,
"never 'pending'"), the deferred generator unit with its **named trigger** (§6.2) and its
**revisit condition**. `docs/pending.md`'s own head rule applies: a retired row is ARCHIVED in
`archive/pending/<date>-<topic>.md` and removed from the file — so when the deferred unit lands, its
SCHEDULED row is retired to the archive, never left as a COMPLETE row. The row must name the
`docs/next-steps.md` queue row as the owner of the landed content.

### 6.6 Files this pass MAY write (the complete list)

`docs/requirement-catalog.md` (NEW) · `docs/specs/user-flow-audit-checklist.md` (three columns) ·
`docs/next-steps.md` (two rows) · `docs/decisions.md` (one ACTIVE row) · `docs/defects.md` (**five** OPEN
rows: the C7 dangling citation of §6.4 **plus the four corpus-defect rows of §6.7**) · `docs/pending.md`
(one SCHEDULED row) · the staging fragments under `archive/catalog-authoring/<date>/` · the review record
under `archive/reviews/`. **Nothing else.** Every path in §2.5 is forbidden; no `src/**`, no
`scripts/**`, no `tests/**` write exists anywhere in this unit.

### 6.7 THE CORPUS-DEFECT ROWS THE LANDING PASS MUST FILE (recorded, NOT filed here)

The authoring clusters found four corpus defects by reading the trackers and the checklist. **This unit
files none of them itself** — the landing pass owns every tracker write (§6), and a cluster's fragment is
not a tracker. They are recorded here as **the exact rows the landing pass must file in
`docs/defects.md`**, each with the cluster's evidence, its row id, its evidence pointer and its fix shape.
**No catalog row may absorb any of them as a "known issue"** — an unfiled defect is `FS18`'s cousin (a
discovered id that appears in neither a pointer nor a §C.7 waiver).

| # | Row id the landing pass must use | Symptom | Evidence pointer (verified this pass) | Fix shape |
| --- | --- | --- | --- | --- |
| **(a)** | **`CATALOG-CITES-NONEXISTENT-UNIT-SPEC`** | Two tracker rows route a fix through a spec path that **does not resolve**: `docs/specs/unit-l1-editing-mode-setting.md` is cited among "the affected unit specs" while the file does not exist in `docs/specs/` (the sibling `unit-l-textarea-editing-ui.md` **does** resolve) | `docs/defects.md` row **`EDIT-MODE-TEXTAREA-UI`** (its proposed-fix cell) + `docs/defects.md` row **`WHOLE-PAGE-EDITING-REQUIREMENT`** (its root-cause cell — the same missing path, recorded once, not twice) | Repoint **both** citations to the resolved path (`docs/specs/unit-l-textarea-editing-ui.md`), or land the missing spec under that name — and record which of the two was chosen (AGENTS.md item 6c: never leave a citation pointing at a moved/absent file) |
| **(b)** | **`MCP-FOCUS-TOOL-UNLISTED-IN-CONTRACT`** | `provident.focus` is cited as an MCP tool (checklist row **`UF-TABS-9`**; decision row **`MCP-FOCUS-TOOL`**) but the MCP endpoint contract's §3 tool table does not name it — the tool table lists six `provident.*` tools and **no `focus` tool appears anywhere in that file** | `docs/specs/user-flow-audit-checklist.md` row **`UF-TABS-9`** · `docs/decisions.md` row **`MCP-FOCUS-TOOL`** · the absence verified by a read of `docs/specs/mcp-endpoint.md` §3 · the drift is already annotated (recorded, not fixed) in `docs/specs/ui-overhaul.md` §5.1 row **`PG14`** and in `docs/specs/astrographer-scope-realignment-review.md` §4 C14 | Add the focus tool's row to the contract's §3 tool table (name, argument shape, return shape, and the named UI home the MCP↔UI parity rule requires) — **or** record the tool as out-of-contract with the reason; the `MCP-ENDPOINT-CONTRACT` capability row must not claim the table is complete until one of the two lands |
| **(c)** | **`CHECKLIST-COVERAGE-CENSUS-MISMATCH`** | The checklist's §16 coverage summary conflicts with its own status block **and** under-enumerates: §16's table shows a confirmed-defect figure of **9** with its confirmed-defects row enumerating **8** (`LIVE-UF1/2/5/6/7/8/9/10`), while the status block records the confirmed-defect count as **7** after `LIVE-UF2` was contradicted and fixed; §16's per-surface enumeration also **stops at `LIVE-UF10`** and does not account for the later-recorded **`F-1`/`F-2`/`F-3`** findings | `docs/specs/user-flow-audit-checklist.md` §16 (the Confirmed-defects row + its per-surface cells) **vs** the same file's head status block · `docs/defects.md` rows **`F-1 PANE-BODY-GESTURE-SWALLOWED`**, **`F-2 WIKI-ROOT-MOUNT-LEAK`**, **`F-3 EMPTY-ZONE-TRACK-NOT-COLLAPSED`** · the 9 `UF-DEFECT-*` row ids in the checklist's confirmed-defect section | Recount the confirmed-defect figure from the `UF-DEFECT-*` ids and from the `docs/defects.md` rows (never copy §16's number), state the count once, and add the three `F-*` findings to the enumeration — **any catalogue or census that assumes ten `LIVE-UF*` defects is wrong (see (d))** |
| **(d)** | **`LIVE-UF-ID-GAP-AND-TEN-DEFECT-ASSUMPTION`** | `docs/defects.md` has **NO `LIVE-UF3` and NO `LIVE-UF4` row** — the ids jump `LIVE-UF2` → `LIVE-UF5` — although the session audit's prose enumerates **ten** live-user defects, so **8 live-user-defect rows exist, not 10**. The checklist's confirmed-defect section heading also still reads `LIVE-UF1..10` | `docs/defects.md` §OPEN (the `LIVE-UF1`/`LIVE-UF2`/`LIVE-UF5`…`LIVE-UF10` bolded row ids, with no `LIVE-UF3`/`LIVE-UF4` between them) · the checklist's confirmed-defect section heading · the prose enumeration in `docs/specs/session-feedback-doc-audit-2026-09-16.md` | Record the absent ids explicitly (a "no such row" note with the gap named) and correct every census/heading that assumes a `LIVE-UF1..10` set to the counted set; **do not mint `LIVE-UF3`/`LIVE-UF4` ids** — a fabricated id would be an `FS8`-class phantom pointer for every later pass |

**Rules for the four rows.**
1. **One row per defect**, each with the symptom, the reproduction, the suspected root cause and a
   proposed fix shape (AGENTS.md item 7's catalogue shape), filed **OPEN** at the top of
   `docs/defects.md`'s open table.
2. **`docs/defects.md` is the owning tracker for all four** — (c) and (d) are also checklist defects, but
   the checklist is not a tracker and gains **no new row** (§3.9 rule 1: the checklist's row-ID set is
   fixed). The checklist's own stale cells are corrected by the fix shapes above, in the pass that
   files the rows, **without adding or removing a `UF-` row**.
3. **The ids above are new and verified absent from `docs/defects.md`** — no existing row id collides
   with any of the four (checked this pass).
4. **Filing them does not discharge the catalog's duty**: after filing, each row is linked from the
   catalog row whose evidence it corroborates, or waived by name in §C.7 (§3.7 rule 3 / §3.10) — the
   landing pass must not let the newly-minted ids become `FS18` unwaived ids in the same pass that
   creates them.

---

## 7. Cross-references (no line numbers — this spec is the first artifact of its own rule)

- Gate-1 record: `docs/specs/requirement-catalog-review.md` §1 (verdict), §2 (what the proposal
  asks), §3.5 (the tracker rows), §5.1 (queue state), §5.2 (the oracle-identity hazard), §5.3 (the
  D-GP-UFA interaction), §5.4 (sequencing), §6 (R1–R14), §7 (reversibility), §8 (C1–C13), §9
  (gaps/costs/benefits).
- Tracker conventions: `docs/defects.md` §OPEN (rows open on top) + the report-#3 defect rows ·
  `docs/decisions.md` head (ACTIVE/SUPERSEDED, D-GP-UFA-1..4, `WHOLE-PAGE-EDITING`,
  `EDITING-MODE-SETTING`, `FORM-CONTROL-EDITING`) · `docs/pending.md` head (the six row
  vocabularies + the retired-row rule) + §SCHEDULED · `docs/next-steps.md` §CURRENT WORK /
  handover-state, §OPEN, §DONE and the NEXT QUEUE list.
- Checklist: `docs/specs/user-flow-audit-checklist.md` head (the "Coverage vocabulary" block + the
  status block), its `§1`–`§14` row tables (one each — **14 data tables**, one header + separator pair
  per section), §15 (the cross-census claims), §16 (the coverage summary + "Total ≈ 112 rows." — whose
  confirmed-defect figure and enumeration are the subject of §6.7 (c)/(d)), §17.
- Authoring fragments the §9.1 amendments resolve (staging, `[archive]`, cited ONLY here and never as
  canonical — §3.4 rule 8): `archive/catalog-authoring/2026-09-21/CL-1.md` (capabilities §C.0/§C.1) ·
  `CL-3.md` (§C.3 part 1; id block `100`–`173`) · `CL-4.md` (§C.3 part 2; id block `300`–`399`; the
  straddle lists) · `CL-5.md` (§C.4 ledger; id block `801`–`839`; the "four Gnosis handoff rows"
  reading) · `CL-6.md` (§C.5/§C.7; the `code_anchor` and direction-count divergences) ·
  `CL-7.md` (§C.6/§C.8 + Artifact B; the 14-table count, the keep-row direction divergence, the fill
  rule for the digests).
- Specs: `docs/specs/user-flow-audit.md` §2 (the §5.U cap), §3 (§6.1 schema), §5/§6 ·
  `docs/specs/astrographer-scope-realignment-review.md` §2.2 C7/C8 + §6 (the doc-only exemption) + §4
  C14 (`provident.focus`) · `docs/specs/unit-o0-m1-m3-measurement-shape.md`
  §13.6/§13.7/§14.5/§14.7/§15 (OWED items that may be cited as `ENGINEERING-ONLY` rows) ·
  `docs/specs/mcp-endpoint.md` §3 (the tool table — **it does not name `provident.focus`**, §6.7 (b)) ·
  `docs/specs/unit-l-textarea-editing-ui.md` (the spec that DOES resolve, against the cited
  `docs/specs/unit-l1-editing-mode-setting.md`, which does not — §6.7 (a)) ·
  `docs/specs/session-feedback-doc-audit-2026-09-16.md` (the ten-defect prose enumeration, §6.7 (d)) ·
  the report-observation rows cited by `PRUNE-139`/`PRUNE-149`
  (`docs/specs/user-demo-bug-report-2-2026-09-15.md` §1) — observations, **never** owning rows
  (§3.5.3).
- Code/doc anchors cited by symbol only: `scripts/live-drive.mjs` (`o0OracleIdentity`,
  `MATRIX_ROWS`, `O0_OPERATOR_DOCUMENTS`) · `src/shared/o0-report.ts` · the import-corpus sites
  (`docs/specs/ui-overhaul.md`, `docs/specs/user-flow-audit.md`).
- Process: `AGENTS.md` items 1–12 + RCA-1..RCA-12; `docs/skills/process-guardrails.md`.
- **`docs/skills/designing-pages.md` does NOT exist in this tree and no page-design artifact is
  owed by this unit** (it changes no page design — a documentation index and three metadata columns
  are not page design; the same conclusion is recorded in
  `docs/specs/unit-o0-m1-m3-measurement-shape.md` §10's note). No test-use-case coverage matrix and
  no demo-page index exist to update.

---

## 8. Census / numeric claims (this spec's own claims, and which are derived)

| Claim | Value here | Status |
| --- | --- | --- |
| Capabilities (§C.1) | **16**, closed, non-reorderable | **asserted** (the partition is a pinned design output) |
| Tier-1 rollup rows (§C.2) | **~40** | **DERIVED at authoring** (the estimate is a shape, never copied through) |
| Tier-2 register rows (§C.3) | **~90**, of which **~70** carry a prunable verdict | **DERIVED at authoring** |
| Upstream-owed ledger rows (§C.4) | **~25** (at minimum the 21 named: GR-1..GR-9, SC-1..SC-7, PS-1, and the four Gnosis handoff rows **enumerated in §3.6**) | **DERIVED, must be ≥ the named set** |
| Checklist rows (Artifact B) | **"≈ 112"** in-file; the §16 per-surface figures sum to **112** | **DERIVED — recorded, never asserted as 112** |
| Checklist data tables gaining columns | **14** (`§1`..`§14`, one data table per section; **corrected from 13**, §9 (22)) | **asserted** — and the landing pass recounts by counting the `UF-` row ids, not the tables |
| Row schema fields | **13** = **6 MIRROR** + **7 JUDGMENT** (`code_anchor` is JUDGMENT on the authority of §3.3's field table — §9 (16); the earlier §9 enumeration that counted it MIRROR is corrected) | **asserted** |
| Provenance / direction / owner / verdict vocabularies | **6 / 5 (`wants-*`) + `n/a` = 6 legal direction values / 10 / 5** | **asserted (frozen)** |
| `PRUNE-###` id allocation (§3.5.1) | **6 blocks** — 3 authoring-allocated (`100`–`299` CL-3, `300`–`599` CL-4, `800`–`899` CL-5) + **1 amendment / fix-pass** (`600`–`799`, §9 (26)) + 2 reserved (`001`–`099`, `900`–`999`); observed usage CL-3 `100`–`173`, CL-4 `300`–`399`, CL-5 `801`–`839`, fix pass `600`–`603` | **asserted (pinned allocation); the occupied ranges are DERIVED per cluster** |
| C7 lineage rows | **7** defect rows + **1** decisions row + **1** next-steps block + **1** session-audit spec | **asserted (verified)** |
| Tracker rows written by the landing pass | **9** (**2** next-steps, **1** decisions, **5** defects — the C7 dangling citation of §6.4 + the four corpus-defect rows of §6.7 — **1** pending) | **asserted** |
| Fail-states (this spec) | **24** (`FS1`..`FS24`; `FS20`..`FS24` added by the amendments of §9 (17), (19), (20), (21), (22)) | **asserted** |
| Risks mapped / conditions mapped | **R1..R14 / C1..C13** | **asserted (complete)** |
| PBT register rows (this unit) | **0** (zero-row exemption, justified) | **asserted (recorded exemption)** |
| Inputs (`§C.6`) | 6 tracker inputs + `docs/HANDOFF.md` + `docs/feature-requests/*` + report #1/#2 docs + the report-#3 prose block + `docs/specs/**` (**every non-input `docs/specs/**` path** an input or named excluded with a reason class — §3.8/§9 (25)) | **recorded per input (C11)** |
| Amendments (2026-09-21, §9.1) | **12** entries — §9 (16)–(27); (27) is the `EN-2` forward-filing duty added by the catalog-amendment pass over the landed register | **asserted (each with its decision + reason)** |
| Corpus-defect rows for the landing pass (§6.7) | **4** (plus the §6.4 dangling-citation row = 5 defect rows) | **asserted (recorded, NOT filed — ids verified absent from `docs/defects.md`)** |

**Traceability map (condition → where it is pinned here).** C1 → §1/§3.3 · C2 → §3.8/§3.12 ·
C3 → §3.8 · C4 → §3.5 · C5 → §2.5 · C6 → §3.9 rules 3/4/5/2 + §6.3 · C7 → §3.6 + §6.4 ·
C8 → §3.6 shrink/tombstone · C9 → §3.4 rule 9 · C10 → §3.4 rule 7 · C11 → §3.8/§3.10 ·
C12 → §6 landing order / this unit's slot **before the O-5 spec** · C13 → the status block, §2.1,
§6.1, §3.12.

**Traceability map (risk → containment here).** R1 → §3.7 rule 4 + §3.3 · R2 → §3.1 + §3.6 · R3 →
§3.6 (C7) · R4 → §3.9 rule 5 + §6.3 · R5 → §3.9 rule 3 · R6 → §3.1 + §3.4 rule 1 · R7 → §3.8 rule
4 + §3.12 (a) · R8 → §3.8 rule 1 · R9 → §3.4 rule 9 · R10 → §3.6 tombstone · R11 → §3.8
`excluded_specs` + §3.10 · R12 → §2.5 · R13 → §3.4 rule 7 · R14 → §6 landing order.

**Traceability map (amendment → where it is pinned).** §9 (16) → §3.3 field 9 + §9 item 2 · §9 (17) →
§3.4 direction vocabulary + `FS20` + §3.9 `Direction` column + §8 census + §10 re-stamp line · §9 (18)
→ §3.6 stale rule + §3.8 rule 2 + §9 item 4 · §9 (19) → §3.5.1 + §3.3 field 1 + `FS22` · §9 (20) →
§3.5.2 + `FS21` · §9 (21) → §3.5.3 + §3.4 rule 3 + `FS24` · §9 (22) → §3.9 rule 1 + §8 census · §9
(23) → §3.6 Gnosis enumeration + §8 upstream-owed row · §9 (24) → §6.7 + §6.6 + §8 · §9 (25) → §3.8
`excluded_specs` + `FS23` + §3.12 clause (c) · §9 (26) → §3.5.1 (the `600`–`799` AMENDMENT /
FIX-PASS block + rule 5) + §3.5.2 rule 7 + §8 census (the id-allocation row).

---

## 9. Design points the approved architecture left UNDER-SPECIFIED (each pinned here, with why)

Each entry states the gap, the choice made, and the reason.

1. **Tier-1's ROW KEY was undefined.** The architecture says "capability × surface rollup (~40
   rows)" without fixing the surface vocabulary. **Pinned:** a Tier-1 row is one
   **`capability × surface`** pair, and §C.2's surface vocabulary is **derived at authoring from
   the checklist's own section vocabulary (§1–§14) extended by the non-checklist inputs**, recorded
   in §C.2 as a frozen list of 15 values. *Why:* an undefined key makes the ~40-row count
   unfalsifiable and lets two authors produce different rollups; deriving the vocabulary from the
   existing section set keeps the rollup traceable to the checklist without inventing a taxonomy.
2. **The exact MIRROR/JUDGMENT assignment was not enumerated.** The architecture names "6 MIRROR +
   7 JUDGMENT" but not which field is which. **Pinned:** MIRROR = `id`, `capability`, `provenance`,
   `direction`, `last_verified` (**+ §3.3's sixth MIRROR cell**, counted off the §3.3 table);
   JUDGMENT = `statement`, `status_pointer`, `evidence_pointer`, `owner_class`, `code_anchor`,
   `verdict`, `verdict_basis`, `prune_signoff`. **CORRECTED (§9 (16), 2026-09-21):** this item's
   earlier form listed `code_anchor` in the MIRROR set (7 MIRROR + 6 JUDGMENT) — a
   contract-internal contradiction with §3.3's field table, which classifies the field
   **JUDGMENT**. **§3.3's table is the authority and the split is 6 MIRROR + 7 JUDGMENT**;
   `code_anchor` is a **JUDGMENT** cell. *Why:* the generator's write region and the hand-edit
   prohibition are only meaningful per field, the deferred contract test's fixture comparison needs
   the exact set — and an author-chosen symbol/token is not derivable from any input, so it cannot be
   a MIRROR cell.
3. **`merged-into:<id>` had no shrink semantics.** The shrink rule deletes a register row on a
   landed prune; it is silent on merges. **Pinned:** a merged row KEEPS its slot (no deletion, no
   tombstone needed), retains its `statement` for provenance, and its target must resolve to a live
   row in the same artifact. *Why:* deleting a merged row would destroy the only record that the
   behavior was ever separate, and the tombstone ledger is specified for prunes only.
4. **"Stale = older than the newest manifest digest" was undefined.** **Pinned:** the digest is the
   manifest's `newest_digest_date` per input; the manifest carries a per-input `sha256` + `bytes` +
   `rows_read`; a row is `stale` when `last_verified` is strictly earlier. *Why:* "the newest digest"
   must be a comparable value, not a hash string, or `stale` cannot be evaluated by a test.
5. **`last_verified`'s deterministic source was only half-specified** (C3 fixed the generator's
   inputs; the hand-derived landing had no rule). **Pinned:** on landing, every row's `last_verified`
   equals the manifest's `as_of`, which the authoring pass writes explicitly and marks PROVISIONAL;
   the deferred generator takes it from `--as-of` (or a date parsed from input text). *Why:*
   without this, the landing pass would either omit the field or reach for wall-clock time — the
   exact defect C3 exists to prevent.
6. **The pointer FORMAT for the id-less trackers was unspecified.** **Pinned:** `anchor-token` =
   heading + a quoted row opening, and it **warns**, it never hard-fails (§3.5). *Why:* the files
   genuinely have no row ids (verified), so a "hard-fail on an unresolvable pointer" rule would make
   the deferred test unpassable on landing day — the objection that killed the fused unit.
7. **The `status_pointer` "owning row" rule had no disambiguation rule.** **Pinned:** the pointer
   addresses the row that OWNS the status; two owning rows that disagree freeze the row at
   `invalidated-conflict` (§3.7 rule 1). *Why:* most behaviors are mentioned in several rows; without
   "owner" the field is ambiguous and the freeze rule has no trigger.
8. **`owner_class` multi-membership was unspecified.** **Pinned:** the most specific class wins;
   the others are named by name in `verdict_basis`. *Why:* the field is singular by design, but real
   rows span e.g. `app-graph` + `test-harness`; naming the extras keeps the census honest.
9. **The `Catalog` cell's empty-state had no marker.** **Pinned:** `—` is the only empty-cell marker,
   and a cell may hold a `PRUNE-###` pointer **or** a capability token; checklist rows do not have to
   map to a register row. *Why:* an undefined empty state invites invented vocabularies ("N/A",
   "none", blank, "—") that a mechanical count cannot read.
10. **The prune criterion's second and third clauses were "grep-shaped"** with no defined subject
    set. **Pinned:** the `origin_search` record's enumerated source set (§3.6) *is* the subject set,
    and it includes `docs/specs/**`, `docs/HANDOFF.md`, `docs/feature-requests/*` and the report-#3
    block. *Why:* "no non-test consumer" is meaningless until the searched surface is enumerable —
    and this repo's live counterexample is a requirement whose only home is a prose block.
11. **C6 (ii) required a §2 note in `docs/specs/user-flow-audit.md`, which is a corpus input.**
    **Pinned (CORRECTION):** the no-change statement lives in this spec + the ACTIVE decision row,
    and that file is on the MUST-NOT-EDIT list (§2.4). *Why:* the proposed edit moves a measured
    import corpus and its budget/census pins — the change analysis's own C5 boundary forbids it, so
    C6 (ii) as written is unlandable and the amendment must be recorded rather than attempted.
12. **The "112-row" figure was simultaneously an estimate and a count.** **Pinned:** the landed
    figure is recorded as DERIVED, and the spec states the approximation ("≈ 112") rather than the
    flat 112. *Why:* C6 (iv) requires the derived count; D-GP-UFA-1 says "~112" and the file says
    "≈ 112"; promoting an estimate to a count is exactly the class of claim RCA-6 caught repeatedly.
13. **"One full review cycle" in C7's cooldown had no boundary.** **Pinned:** a review cycle is one
    landing pass of any unit that edits a tracker (item 6), recorded in §C.8's change log. *Why:*
    without a boundary the cooldown is unmeasurable and the deferred test cannot check it.
14. **§C.4's ledger had no pinned verdict.** **Pinned:** §C.4 rows carry a non-prunable verdict
    (`keep` / `keep-advisory`) by construction and `escalate-prune` on one is `FS11`. *Why:* "non-
    prunable by construction" needs a mechanical expression, or the guarantee is prose only.
15. **The `Provenance`/`Direction` token for each checklist row was undefined** (Artifact B names the
    columns but not who fills them or whether every row must be filled). **Pinned:** every checklist
    row receives a PROVISIONAL token, assigned by the cluster that owns that section (CL-7), and the
    Coverage block marks all three columns provisional. *Why:* an empty metadata column would make
    the artifact look complete while carrying no information — the failure mode the catalog exists
   to prevent.

### 9.1 AMENDMENTS (2026-09-21) — the divergences the authoring clusters reported, each DECIDED here

Each entry: the id, the section(s) amended, the decision, and the reason. **Everything above in §9 is
unchanged in meaning**; these entries are additions pinned after the fragments in
`archive/catalog-authoring/2026-09-21/` were authored (CL-1/CL-3/CL-4/CL-5/CL-6/CL-7), so the LANDING
pass can re-stamp or reconcile the affected authored content against a single authority.

16. **`code_anchor`'s field authority was CONTRADICTORY** (§3.3 field 9 vs §9 item 2, reported by the
    §C.5/§C.7 cluster as a contract-internal contradiction): §3.3's field table classified it
    **JUDGMENT** (yielding 6 MIRROR + 7 JUDGMENT), while §9 item 2's enumeration listed it in the
    **MIRROR** set (yielding 7 MIRROR + 6 JUDGMENT) — the same 13 fields, two counts. **Amended:**
    §3.3's field table is the **authority** and `code_anchor` is **JUDGMENT**; **§9 item 2's
    enumeration is corrected** (its MIRROR set no longer contains `code_anchor`), so §3.3 and §9 now
    agree. **The counts, stated once and consistently in both sections: 13 fields = 6 MIRROR + 7
    JUDGMENT**, where **MIRROR** is exactly the set §3.3's table marks MIRROR — `id`, `capability`,
    `provenance`, `direction`, `last_verified`, and the sixth field §3.3's table marks MIRROR (count
    them off the table: **6** cells) — and **JUDGMENT** is the 7 it marks JUDGMENT — `statement`,
    `status_pointer`, `evidence_pointer`, `owner_class`, **`code_anchor`** (the disputed one),
    `verdict`, `verdict_basis`, `prune_signoff` (count them off the same table: **7** cells). The
    table is the enumeration that settles the assignment; §9 item 2's earlier list is corrected to it.
    *Why the field takes the JUDGMENT
    side on the merits, not merely by table precedence:* `code_anchor` is the **author's own**
    statement about a symbol or grep token that identifies the behavior in the code surface; it is
    free-form, derivable from no input, and a generator could not recompute it — which is the
    definition §3.3 gives MIRROR ("derived … hand-edit forbidden once [the generator] exists"). Its
    table neighbours are hand-authored cells, and classifying it MIRROR would have made every symbol
    in the land generator-owned while the field's own rule calls it **ADVISORY** with a code-layer
    check (§3.4 rule 9). **Consequence for the landed artifact:** `code_anchor` is a JUDGMENT cell,
    so it is **not** inside the generator's write region and the MIRROR hand-edit prohibition (§3.4
    rule 2) does not apply to it; it still may never carry a line number (§3.4 rule 7).
17. **The `direction` vocabulary was UNDER-SPECIFIED and had no legal token for a KEEP-class row**
    (§3.4; reported by the §C.5/§C.7 cluster as a count contradiction and by the checklist cluster as a
    vocabulary gap): the heading said "5 tokens + `n/a`" while enumerating only **four** `wants-*`
    tokens, and the checklist's keep-class rows (`UF-KEEP-1..3` and the sibling rows `UF-PANES-6`,
    `UF-STAGE-3`, `UF-SEARCH-1`, plus the reported-and-PASSING `UF-STAGE-4` — **7 rows**), whose
    subject is a user report that did **not** reproduce, had **no legal token**: `n/a` is restricted
    to rows with no expressed direction, and the cluster in fact stamped them **`wants-less`** — a
    semantic mis-stamp, because the ask is not to reduce scope but that the behavior stay.
    **Amended (option (a): an explicit fifth token with its assignment test):** **`wants-keep`** is
    added as the fifth `wants-*` token, with a three-part assignment test and an evidence rule pinned
    in §3.4. The **four consequential edits**: **(i)** §3.4's direction heading + list now read
    **5 `wants-*` tokens + the `n/a` form = 6 legal values**; **(ii)** the §3.9 `Direction` column rule
    now legalizes `n/a` **only** where no direction was expressed and requires `wants-keep` on a
    keep-class row, with the matching clause in §5's fail-state table (**`FS20`**); **(iii)** §8's
    direction census row now reads **`5 (wants-*) + n/a` = 6 legal direction values**; **(iv)** §10
    gains the re-stamp line. *Why option (a) rather than legalizing `n/a` for a keep-class row:*
    `n/a` means "no direction was expressed", which is false for a keep-class row — that row's whole
    subject is the user's reported defect and its non-reproduction; legalizing `n/a` there would put
    two opposite meanings on one token and leave the register unable to distinguish "no ask" from
    "the ask is to keep". **Re-stamp owed by the LANDING pass** (recorded here; the fragments are not
    edited by this pass): the **7 rows** **`UF-KEEP-1`, `UF-KEEP-2`, `UF-KEEP-3`, `UF-PANES-6`,
    `UF-STAGE-3`, `UF-SEARCH-1`, `UF-STAGE-4`** carry **`wants-less`** in the Artifact B token table as
    authored and must be re-stamped **`wants-keep`**; each row's keep-class basis stays recorded in its
    own basis cell. **The 8 `n/a` cells that cluster authored are left UNCHANGED** — every one is a
    `contract-pinned` row with no expressed direction, which the amended rule still legalizes
    (verified: `UF-SEARCH-4`, `UF-HIST-4`, `UF-PARITY-1`, `UF-PARITY-6`, `UF-PARITY-7`, `UF-PARITY-8`,
    `UF-PARITY-9`, `UF-PARITY-11`). Every register row on that keep lineage carrying `wants-less` or
    `n/a` is re-stamped by the same rule.
18. **`last_verified` / the `stale` rule was AMBIGUOUS IN PRACTICE** (§3.6 stale rule + §3.8
    determinism rule 2 + §9 item 4): every cluster stamped its rows with the as-of date, which made
    every row `stale` (and therefore non-prunable, §3.6) as soon as any input's digest date was later
    — because the rule never said whether the comparison ran over **dates** or over **hash strings**,
    and never said where a digest **date** comes from. **Amended:** **`last_verified` = the as-of date
    of the pass that RESOLVED the row** (the landing pass's `as_of` on landing; a later resolving
    pass's own as-of date on re-verification, so a re-verified row moves forward rather than staying
    at its original landing date); **`stale` compares DATES** — the row's `last_verified` against the
    manifest's `newest_digest_date` — **never hash strings, never a `sha256`, never a byte count**; a
    row is `stale` when its `last_verified` is **strictly earlier** than that date; and **each input's
    `newest_digest_date` is read from the input's OWN CONTENT (a dated header inside the file), with
    the manifest's `as_of` as the fallback, NEVER from mtime or any other filesystem metadata**
    (§3.8 rule 1's no-time-input rule, `FS16`). *Why:* without a comparison domain the condition is
    unevaluable by a test, and without a content-derived date source the first landing pass would
    reach for `stat()`. **Stated for landing day:** with every input at the as-of date, **no row is
    `stale`**, so no row is barred from pruning by this condition on the day the register lands.
19. **No `PRUNE-###` id RANGE was allocated per cluster** (§4.2 splits the register across CL-3/CL-4
    while §3.3 field 1 fixed only the format; reported independently by three clusters). **Amended:**
    the allocation is **pinned in §3.5.1** — `001`–`099` reserved; **CL-3 (§C.3 part 1, the five UI
    capabilities) `100`–`299`**; **CL-4 (§C.3 part 2, the remaining capabilities) `300`–`599`**;
    `600`–`799` reserved (that marking itself is amended to the **AMENDMENT / FIX-PASS block** by
    §9 (26)); **CL-5 (§C.4 ledger) `800`–`899`**; `900`–`999` reserved — with the observed
    usage recorded (CL-3 authored `100`–`173`, CL-4 `300`–`399`, CL-5 `801`–`839`), the
    **global-uniqueness rule**, the **tombstone / never-reuse rule**, and the MERGE duty that it may
    **renumber only MIRROR-adjacent provisional ids** (never re-using an id, never silently
    renumbering a JUDGMENT row). §3.3 field 1 now cross-refers to it. *Why:* without a pinned block
    the two register halves can collide on an id (`FS2`) and a landed id is never reusable — so the
    collision must be impossible by construction rather than repaired after the fact.
20. **The cluster-scope OVERLAP had no resolution rule** (the §C.3 part-1 brief scoped CL-3 to five UI
    capabilities, but CL-3 authored rows belonging to CL-4's capabilities, and CL-4 listed ~15
    straddling rows by id; the ledger cluster's rows overlap both halves as well). **Amended:** the
    rule is **pinned in §3.5.2** — **the row whose `capability` matches the behavior's TRUE capability
    wins** (§3.2 `Owns` clauses; an id's numeric block never decides), **the loser keeps its register
    slot and becomes `merged-into:<winner-id>`** and the pairing is recorded in §C.7, **a merge never
    deletes evidence** (the loser's `evidence_pointer` is folded into the winner's `verdict_basis` as a
    named pointer), and **exactly one live row per behavior / exactly one `invalidated-conflict` row
    per conflict** — and the one reported **id/capability straddle** is pinned: **`PRUNE-346` keeps its
    id** (its capability cell reads `MCP-ENDPOINT-CONTRACT`, which §3.5.1's `300`–`599` block already
    contains, so no renumber and no allocation out of the reserved `600` block is owed), MERGE
    confirms it carries exactly one capability id and records the resolution in §C.8. *Why:* the rule
    must be mechanical or MERGE decides by preference; and the reported straddle must be resolved in a
    way that neither re-keys a MIRROR cell by hand nor retires an id.
21. **`status_pointer`'s "owning row" rule had NO TIE-BREAK TEST** (§3.4 rule 3 / §9 item 7; the
    §C.3 cluster reported two cells citing a **report observation** rather than an owning tracker row).
    **Amended:** the test is **pinned in §3.5.3** — subject identity (the cited row's own subject IS
    the behavior), status ownership (the row a reader would open to learn the behavior's state; a
    report doc, session audit, coverage report, live-scenario block or tracker observation **never
    owns a status**), and the tie-break (the specific row over a rollup/umbrella; two disagreeing
    owning rows freeze the row at `invalidated-conflict`). **The fail-state is `FS24`**: a
    `status_pointer` aimed at an observing report **where an owning tracker row exists**. **The legal
    no-owner case** is recorded as **`invalidated-pointer`** in `verdict_basis` (and bars pruning),
    never passed silently. **The two recorded instances are `PRUNE-139` and `PRUNE-149`** (both citing
    a report-observation row where an owning `docs/defects.md` row exists), which MERGE must re-point
    at the owning row or record as `invalidated-pointer`. *Why:* "the row that owns the status" stays
    a judgment call until the test is mechanical, and an observation-vs-owner pointer silently
    transfers the tracker's authority to a report — the §3.1 rule 1 hazard.
22. **§3.9's checklist TABLE count was WRONG** (§3.9 rule 1 and §8; reported as a divergence by the
    checklist cluster): the contract asserted **13** data tables while the file carries **14** — a
    header + separator pair occurs once per `§1`..`§14`. **Amended:** the count is **14** in §3.9 and
    in §8's census row, with the correction recorded, and the mechanical recount rule pinned: **count
    the `UF-` row ids in the data rows — never the number of tables, never the `Coverage` cell text.**
    *Why:* the count that matters is the row count (§3.9 rule 2 / `FS17`); the table count only says
    how many header/separator pairs the additive edit touches, and a wrong table count invites an edit
    that silently skips a section's header.
23. **"The four Gnosis handoff rows" was used WITHOUT AN ENUMERATION anywhere in this contract**
    (§3.6 and §8; reported by the §C.4 ledger cluster). **Amended:** the four are **enumerated in §3.6**
    — `GNOSIS-ENGINE-QUERY-MODE-IGNORED`, `GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT`, the O-7
    INGESTION-ONTO-THE-ENGINE pointer row, and the O-8 AUTHORITY SWITCH / OFFLINE DUAL-PATH pointer row
    — with `HOST-ENGINE-QUERY-POST-NO-ENVELOPE` explicitly **excluded** from the count (it is the
    app-side owner of GR-1's status, not an upstream-owed handoff row). §8's upstream-owed census row
    now points at that enumeration. *Why:* an un-enumerated "the N rows" is unfalsifiable — the §C.4
    count must be checkable against a named set, and a later pass must be forbidden from silently
    re-deriving the phrase.
24. **THE FOUR CORPUS-DEFECT ROWS the clusters found are RECORDED, NOT FILED** (§6.7, NEW). The
    clusters found (a) two tracker rows routing a fix through a **nonexistent** spec path
    (`docs/specs/unit-l1-editing-mode-setting.md`); (b) `provident.focus` cited as an MCP tool but
    **absent from the MCP endpoint contract's tool table**; (c) the checklist's §16 coverage summary
    conflicting with its own status block (**9** vs **7**) and stopping at `LIVE-UF10` while
    `F-1`/`F-2`/`F-3` exist; and (d) **no `LIVE-UF3`/`LIVE-UF4` rows** in `docs/defects.md`, so any
    catalogue that assumes ten live-user defects is wrong. **Amended:** §6.7 now records, for each
    defect, the **row id the landing pass must use**, its evidence pointer and its fix shape. *Why
    recorded rather than filed:* the unit's boundary states that it **files no tracker row** — the
    landing pass owns every tracker write (§6), and an authoring fragment is not a tracker; recording
    them here keeps them from being dropped silently while keeping the write authority where the
    contract put it.
25. **§3.8's `excluded_specs` SCOPE was too NARROW** (§3.8; reported as a divergence by the
    manifest/checklist cluster): as written the clause covered only `unit-*.md`, while the ledger's
    inputs extend past that family, and the cluster enumerated **all 130 non-input `docs/specs/**`
    paths** across reason classes — 112 `unit-*.md` (**74** `-greens` + **18** `-live-pending-battery`)
    **plus 18** non-`unit-` paths, i.e. **38** paths outside the `-greens`/`-live-pending-battery`
    classes. **Amended:** the rule now covers **every non-input `docs/specs/**` path, with a reason
    class per path**, and a path that is neither an input nor excluded is **`FS23`** (§3.12 clause (c)
    inherits the widened check). The `excluded_specs` **count** stays DERIVED — the cluster's 130 is a
    reading of the tree at that pass, never a pin. *Why:* the partition must be closed over the whole
    `docs/specs/**` tree; an out-of-family spec landing silently is exactly the condition the O-5
    must-not-land-outside-a-closed-partition clause exists to catch.
26. **The `600`–`799` block was marked RESERVED while a post-merge FIX PASS had authored four rows into
    it** (§3.5.1; reported by the adversarial fix pass over the landed catalog as an amendment owed to
    this contract — the fix pass authored the rows correctly and reported that its own block's marking
    contradicted them). §3.5.1 allocated `600`–`799` as **RESERVED** (item 19's pin) and its rule 3 makes
    a block "not allocable without an amendment to this spec", yet the fix pass added **four** register
    rows in that block — **`PRUNE-600`** (a missing user statement: the pane-drag relocation behavior),
    **`PRUNE-601`** (a missing behavior: the find-in-page affordance), and **`PRUNE-602`**/**`PRUNE-603`**
    (two keep-class behaviors, the `UF-KEEP-1` minimized-strip-layout row and the `UF-STAGE-3` stage
    editability row). The gap is the contract's: it had **no legal block** for a row authored by a pass
    over an already-merged catalog, so the block's marking — not the rows — was wrong. **Amended:** §3.5.1
    now pins `600`–`799` as the **AMENDMENT / FIX-PASS block** — the block for rows added by a post-merge
    fix or review pass over an already-merged catalog (a missing behavior, a mis-pointer repair, a merge
    repair) — with the three duties pinned as **rule 5** (the row is recorded in the artifact's **§C.8
    change log**, it is **counted in the §C.6.3 `counts`**, and its id is **never re-used and never
    renumbered**), and with the observed usage recorded as **`PRUNE-600`–`PRUNE-603`**. The three
    authoring blocks (`100`–`299` §C.3 part 1, `300`–`599` §C.3 part 2, `800`–`899` §C.4) and the reserved
    blocks `001`–`099` and `900`–`999` are **unchanged**, §3.5.1 rule 3 still bars a cluster from spilling
    into a reserved block, and §8's `PRUNE-###` id-allocation census row is restated to the four-way block
    classification (3 authoring + 1 amendment + 2 reserved) with the fix pass's occupied range. *Why:*
    the rows are correct, so leaving the block RESERVED would make landed content illegal by the
    contract's own rule 3 and would leave the next fix pass no block to author into; naming the block to
    its actual use keeps the never-reuse / never-renumber guarantee of rule 2 intact, leaves item 20's
    `PRUNE-346` no-renumber resolution valid, and makes every fix-pass addition visible to the census by
    construction rather than by convention. **The usage is already consistent with the amendment:** the
    artifact's §C.8 change log records the fix pass and the four ids it added, and its §C.6.3 `counts`
    carries the four rows in the `tier2` count (`178` §C.3 rows).
27. **THE `EN-2` ENGINEERING RULE — performance complaints are NOT requirements; the architecture
    decisions taken to resolve them ARE — is a FORWARD-FILING DUTY, not a vocabulary or a
    reclassification** (§3.6 freezes, §3.7 rules 3–4, §3.10 closure test 6; reported by the
    design-extensions gate landing as the one rule that could silently retire a live-measured user
    defect). **The rule** (the user's own engineering statement, recorded in
    `docs/feature-requests/design-extensions-2026-09-21.md` §1's Engineering paragraph and itemized as
    `EN-2` in its §2.10): **a user PERFORMANCE COMPLAINT is not a requirement; an ARCHITECTURE
    DECISION taken to resolve one IS a requirement.** Read as a filing criterion, a row may be filed
    — or kept — on a complaint's behalf only when **all three** of the following clauses hold:
    **(i) a falsifiable, user-visible END STATE.** The row's `statement` must name a behavior a user
    can observe and a test can falsify — a **D-class live assertion with a real-input oracle** in the
    sense of `docs/specs/user-flow-audit.md` §3 (its §5.U D-class and its oracle rule), and because
    that file's **§5.U matrix is FULL at 8 (U-1..U-8)**, the assertion must enter as an **EXTENDED
    (non-matrix) row ONLY — never as a new matrix slot**, and `MATRIX_ROWS` in
    `scripts/live-drive.mjs` must not change (the file is on §2.5's MUST-NOT-EDIT list). A
    **`proxyPASS` is INVALID** for this purpose (`docs/decisions.md`
    **`DECIDED: D-GP-UFA-2`**'s proxy-PASS ban: a row's own `Coverage` cell is its live-status cell,
    and a proxy cannot stand in for it). **(ii) an OWNING TRACKER ROW.** The row's `status_pointer`
    must resolve to the tracker row that owns the **behavior's** status under the §3.5.3 owning-row
    test — an observing report, a session audit, a coverage report or a live-scenario block never
    owns one (and `FS24` still fires when an owning row exists and is not cited). **(iii) a LIVE
    MEASUREMENT.** The behavior must have a live measurement: `realInput: true`, and — for any
    `D-visual` claim — **painted geometry**, per `docs/decisions.md` **`DECIDED: D-GP-UFA-3`**.
    **A complaint may not be promoted into a requirement, and a requirement may not be demoted below
    one, without all three.**
    **What this amendment does NOT do — stated as four binding negatives.** **(a) NO NEW VOCABULARY
    TOKEN.** §C.5's vocabularies stay **FROZEN** at their landed counts — 6 provenance tokens, 5
    `wants-*` tokens + the `n/a` form, 10 owner-class tokens, 5 verdict forms. `EN-2` is **not** a
    provenance or direction change; it introduces no token and legalizes none, and it does **not**
    drive performance-complaint rows to `direction: n/a` — which §C.5's rule R-A forbids on any
    `user-*` row in any case, a mis-stamp `FS20` mechanizes. **(b) NO RECLASSIFICATION of any existing
    row** — no `verdict` value, no `capability` cell, no `direction` cell, no `provenance` cell of an
    already-landed row changes, and no freeze is lifted. **In particular `PRUNE-129`**
    (`docs/defects.md#PANE-TOGGLE-FULL-REASSEMBLY`, `user-verbatim`, frozen at `keep-advisory` on a
    dangling-citation lineage) **KEEPS ITS FREEZE**: lifting it would make the row
    `escalate-prune`-eligible and hand the `GN-2` disposition route a mechanism for retiring a
    live-measured user defect (the `PANE-TOGGLE-FULL-REASSEMBLY` record reads **2 556 DOM mutations**
    for one collapse gesture; the `HEAVY-OPS-FREEZE-THE-PAGE` document-open record reads **1 011 ms**)
    — the RCA-11/RCA-12 failure mode (the gate green, the app broken). **(c) NO EFFECT ON EXISTING
    PERFORMANCE-COMPLAINT ROWS.** Every row already filed on a performance complaint **keeps its
    current verdict**; the duty binds the **next filing**, forward only. **(d) `EN-1` IS NOT A
    ROW AND NOT A RULE.** The input's causal claim (`EN-1`: the dominant cost of the observed freezes
    is downstream of the code but triggered by unnecessary changes) is **contradicted by the accepted
    O-0 measurement** (`docs/specs/unit-o-0-per-stage-breakdown.md`, the ninth edition: the document
    open is `reconcile.apply`-bound at **93.84 %** of the measured window, i.e. not an
    unnecessary-change artifact) and its term "unnecessary changes" has no definition anywhere;
    it is therefore recorded as a **REJECTED CAUSAL READING** with that measurement pointer —
    **never filed as a row**, never quoted as a rule, and never used to justify a prune. *Why this
    form rather than a token or a reclassification:* a class-wide re-read of every
    performance-complaint row is exactly the operation that could retire a live-measured defect, so
    the rule is pinned as a **filing-time duty** — deliberately **NOT mechanized** (§3.12's carried
    clause set (a)–(f) is the deferred test's checkset and must not be widened silently), verified by
    the item-10d documentation review instead. **Forward-filing duty for the next pass:** the clause
    is **cited** by the rows it governs and by the next §C.8 change-log entry — it is not re-stated
    per row. **`O-5` IS UNAFFECTED:** it remains the mechanism that turns a complaint into an
    enforced requirement, and this entry neither removes its criterion nor closes its gate.

**Not amended (recorded so a later pass does not re-open it):** the `docs/specs/ui-overhaul.md`
C13-vs-`PANE-VISIBILITY-IRREVERSIBLE` conflict stays a **tracker/spec amendment** owned by the
documentation reviewer (§3.7 rule 2 + §2.5's MUST-NOT-EDIT boundary on that file — the amendment must be
raised as a tracker row, never as an in-place edit of a measured import corpus); §3.6's prune criterion,
cooldown and sign-off gate are unchanged; and no cluster's row content is rewritten by this pass — only
the **7 direction re-stamps of item 17** and the **MERGE reconciliations of items 20–21** are owed
downstream.

---

## 10. Report to the supervisor (what the landing pass must be able to say)

- **Written:** `docs/requirement-catalog.md` (ADVISORY) + the three columns on
  `docs/specs/user-flow-audit-checklist.md` + **nine tracker rows** (§6: **2** in `docs/next-steps.md`,
  **1** in `docs/decisions.md`, **5** in `docs/defects.md` — the C7 dangling citation of §6.4 plus the
  four corpus-defect rows of §6.7 — **1** in `docs/pending.md`).
- **Layer:** DOC-LAYER/advisory only — **no app/envelope/live claim**.
- **Gate:** doc-only exemption; **no red set, no §5.x register (0 rows, recorded), no trio
  obligation**; the adversarial + item-10d review passes RAN; the trio reading is a **regression
  check**, reported as a reading and explicitly not this unit's green.
- **Counts:** the §C.2/§C.3/§C.4/§C.5 figures are DERIVED by the authoring pass; the checklist count
  is DERIVED; the architecture's ~40/~90/~25 are estimates and are not quoted as counts. **The
  corrected counts must be reported explicitly (§9 (16)/(17)/(22)):** the row schema as **13 fields =
  6 MIRROR + 7 JUDGMENT** (`code_anchor` on the JUDGMENT side), the checklist as **14 data tables**
  (§1..§14) with the row count derived by **counting `UF-` row ids, never tables**, and the direction
  vocabulary as **5 `wants-*` tokens + `n/a`**.
- **Amendments applied (report each, §9.1):** the six decisions of §9 (16)–(22) plus the enumeration of
  §9 (23), the recorded-not-filed corpus defects of §9 (24), the widened `excluded_specs` scope of
  §9 (25), the `600`–`799` AMENDMENT / FIX-PASS block marking of §9 (26), and **the `EN-2`
  forward-filing duty of §9 (27)** — reported by amendment id, section edited and decision taken.
  **The `EN-2` entry is reported with its four binding negatives:** no new vocabulary token (§C.5
  frozen), no reclassification of any existing row (`PRUNE-129` keeps its `keep-advisory` freeze),
  no effect on the verdicts of already-filed performance-complaint rows, and `EN-1` recorded as a
  **rejected causal reading** against the accepted O-0 measurement rather than as a row.
- **Re-stamps and reconciliations owed downstream (report each, with its result):** the **7 checklist
  direction re-stamps** of §9 (17) (`UF-KEEP-1/2/3`, `UF-PANES-6`, `UF-STAGE-3`, `UF-SEARCH-1`,
  `UF-STAGE-4`: `wants-less` → `wants-keep`); the **`PRUNE-###` block allocation** of §3.5.1 with each
  cluster's occupied range recounted; the **capability-straddle merges** of §3.5.2 (winners named,
  losers carrying `merged-into:<winner-id>`, evidence folded, the pairing recorded in §C.7) including
  the **`PRUNE-346`** id/capability straddle resolved **without a renumber**; and the **two
  `invalidated-pointer` cells** of §3.5.3 (`PRUNE-139`, `PRUNE-149`) re-pointed at an owning tracker
  row or recorded as `invalidated-pointer`.
- **Deferred:** `scripts/catalog-derive.mjs` + `tests/requirement-catalog-contract.test.ts`, with
  the named trigger (§6.2/§6.5) — **and its CONTRACT has now landed**
  (`docs/specs/unit-catalog-generator.md`, authored BEFORE this amendment so the generator could not
  encode an unadjudicated criterion). **The generator itself is still NOT landed** (`derived:false`,
  `generator:<none>`); once it lands, the MIRROR re-derivation is a **one-command operation**
  (`node scripts/catalog-derive.mjs --as-of <YYYY-MM-DD> --write`) over the sentinel region alone.
- **Boundary evidence:** `src/shared/o0-report.ts` + `scripts/live-drive.mjs` content hashes
  unchanged before/after; no `src/**`, `scripts/**` or `tests/**` write in this unit.
