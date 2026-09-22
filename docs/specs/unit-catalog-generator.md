# UNIT `CATALOG-GENERATOR` — the requirement-catalog derivation generator + its contract test — Spec

**Status:** **DRAFT — to be landed by this unit's own authoring + landing pass.** This file is the
contract; it lands BEFORE the generator it specifies (the generator is *derived from* this spec, not the
reverse). The unit's DONE state is recorded in `docs/next-steps.md` §CURRENT WORK / handover-state by the
landing pass (§10).

**Layer (RCA-12, mandatory declaration): DOC-TOOLING.** This unit adds **one Node `.mjs` generator**
(`scripts/catalog-derive.mjs`) and **one doc-layer contract test**
(`tests/requirement-catalog-contract.test.ts`). It changes **no** `src/**`, no envelope, no renderer, no
store, no IPC, no app behavior, and it produces **no** live or app evidence. **A green here is a TOOLING
green: it is never APP-GREEN, never ENVELOPE-GREEN, never STORE-GREEN, never LIVE-GREEN, and never a
BEHAVIOR green.** The generator's only output is prose and counts inside the catalog's own sentinel region
plus a console report; its only oracle is the catalog's text and the six tracker inputs' text. No clause of
this unit may be quoted as evidence that the application behaves in any way (the catalog's own
non-authority rule, `docs/specs/requirement-catalog.md` §3.1 rules 1–5, restated in
`docs/requirement-catalog.md` §C.0).

**Why this unit precedes the catalog's next amendment.** `docs/pending.md` §SCHEDULED and
`docs/specs/requirement-catalog.md` §3.12/§6.2 fix the trigger as *"the FIRST prune-candidate request OR
the FIRST tracker row edited after the catalog lands — whichever comes first"*, and that trigger has
**already fired** (the catalog's own DONE rows are such edits, and further tracker rows are landing). This
contract is therefore authored **against the already-landed register** so that the generator cannot be
written later against a criterion that was never adjudicated — the `F7-1`-class trap
(`docs/specs/requirement-catalog-review.md` §4 option (ii): an accepted form unreachable by construction;
recorded in `docs/defects.md` **`O0-REPORT-VALIDATED-BEFORE-THE-NOTE-ATTACH`** for the harness instance).

**Provenance / inputs.** The gate-1 record is `docs/specs/requirement-catalog-review.md` (verdict
`PROCEED-WITH-AMENDMENTS`; its §6 risk ledger R1–R14 and §8 conditions C1–C13 are the authority for every
boundary below, mapped in §12). The deferred unit's carried clause set is
`docs/specs/requirement-catalog.md` §3.12 (a)–(f), its determinism rules §3.8 rules 1–5, its pointer schema
§3.5, its closure duty §3.10, and the register it derives against is `docs/requirement-catalog.md`
(§C.1 the 16 capabilities, §C.3 the 13-field rows, §C.4 the ledger, §C.5 the frozen vocabularies, §C.6 the
manifest + the sentinel region, §C.7 the conflict/waiver ledger, §C.8 the change log). The manifest
skeleton and fill rules the hand-derived pass used are
`archive/catalog-authoring/2026-09-21/CL-7.md` `[archive]` — **staging only, never canonical, never
evidence** (`docs/specs/requirement-catalog.md` §3.4 rule 8; §4.2 rule 1). Format conventions:
`docs/specs/unit-u-import-1-import-surface.md` (§5.7 register shape), `docs/specs/unit-import-batch-persist.md`
(§5.7 register with a source-contract row + the declared-upper-bound attempt note),
`docs/specs/unit-o0-m1-m3-measurement-shape.md` (§6 S/FS shape),
`tests/live-drive-contract.test.ts` (the house source-contract convention: read a module's **text**, never
import a module-scope-executing script).

**Citation discipline (binding on this file).** `docs/specs/requirement-catalog.md` §3.4 rule 7 binds every
artifact this contract governs, so it binds **this spec too**: every cross-reference below is a
**`path` + row id / decision name / `§section` / symbol**. **No line number appears anywhere in this file**,
and no line number may appear in the generator's output.

**What this unit does NOT do (stated once, binding throughout).** It does not change a single row, cell,
field or count of the catalog; it does not adjudicate a verdict, a freeze, a waiver or a conflict; it does
not delete anything; it does not read `src/**`; it does not "close" or re-open the O-5 gate; it does not
claim the app works, or that any catalog row is verified by the application; and it does not touch a
citation into the O-0 oracle-hash pair (`src/shared/o0-report.ts` + `scripts/live-drive.mjs`) or any
MUST-NOT-EDIT corpus path (§9.4).

---

## 1. What this unit asks

This unit lands two code artifacts and the tracker rows that record them.

1. **Deliverable A (NEW): `scripts/catalog-derive.mjs`** — a **deterministic, read-only-by-default**
   generator over the landed catalog and its tracker inputs. It (i) recomputes the derived cells, (ii)
   renders them into the catalog's sentinel region **only when explicitly asked to write**, (iii) reports
   its counts, its pointer resolution results and a non-gating staleness report, and (iv) is
   **import-safe** (no module-scope side effects).
2. **Deliverable B (NEW): `tests/requirement-catalog-contract.test.ts`** — the doc-layer contract test
   (§5). It mechanizes the §3.12 clause set (a)–(f) and the §3.10 closure tests over the **frozen
   fixture** and the **landed artifact**, and it **never writes into `docs/`** during `npm test`.
3. **Deliverable C (the region the generator owns): the catalog's sentinel region**
   (`docs/requirement-catalog.md` §C.6.5, `<!-- catalog:derived:begin -->` … `<!-- catalog:derived:end -->`).
   **Exactly one region, in §C.6 and nowhere else** (the artifact's own scope statement + §3.1's section
   list). On landing the region is empty with its markers present.
4. **The landing-pass tracker rows** (§10) — a DONE row + the retirement of the SCHEDULED row + the
   defect rows this spec's reading produces (§9.6).

**Why one unit and not three.** The generator, its test and its write-region are one code-bearing unit
because the test's oracle *is* the generator's output: splitting them would leave the generator free of a
red set, which is exactly the "no test written" review finding (AGENTS.md item 3). The **content** the
generator indexes is not this unit's: the catalog landed already
(`docs/specs/requirement-catalog.md` §1 C1 — the doc-only unit and the code unit are separate units, RCA-2).

---

## 2. Feasibility verdict

**FEASIBLE, with one adjudicated defect in the register's own prose (§2.2).** The generator's write surface
is one sentinel-delimited region; its oracle is text that already exists; its determinism is provable over a
committed fixture rather than over mutable trackers (review §8 C2); its time source is one CLI flag (C3).
The contract test is a doc-layer test in the house source-contract style — it reads text and computes,
never imports an app module and never starts the app.

### 2.1 The three hazards, and how this contract contains each

| Hazard | Why it is real | Containment pinned here |
| --- | --- | --- |
| **The trio reddens on tracker prose churn** (review §6 R7; the `F7-1` class) | Item 6 (`AGENTS.md`) *requires* a tracker edit on every landing; three of the six inputs carry no stable row ids | **§3.1/§4.1**: determinism is asserted **only** over a committed frozen fixture; the live-region check is a **non-gating staleness report**; an `anchor-token` pointer **warns, never fails** (C2/C4) |
| **A generated date breaks determinism** (review §6 R8) | any `Date.now()`/mtime/git read is a non-deterministic input | **§3.3**: `--as-of` is the ONLY date source in the derived region; the test scans for the forbidden sources and fails on one (C3) |
| **The generator becomes a second status authority** (review §6 R6) | two contradicting status sources are worse than none | **§3.5**: the generator writes **counts, ids and pointers only** — never status text, never a verdict, never a judgment cell; the derived fragment carries `derived:true` for the cells it computes and is forbidden from touching any JUDGMENT cell (C10/the catalog's §3.1 rule 1) |

### 2.2 THE ADJUDICATED CONTRACT DEFECT — the "6 MIRROR" claim, and what the generator actually owns

**Found by this authoring pass, recorded here because the generator's write region cannot be pinned
against a phantom field.**

- `docs/specs/requirement-catalog.md` §3.3's **field table is the authority** (`docs/specs/requirement-catalog.md`
  §9.1 item 16 pins exactly that: "the table is the enumeration that settles the assignment"). Counted off
  that table, the MIRROR fields are **five**: `id` (field 1), `capability` (field 3), `provenance` (field 4),
  `direction` (field 5), `last_verified` (field 13). The JUDGMENT fields are **eight**: `statement`,
  `status_pointer`, `evidence_pointer`, `owner_class`, `code_anchor`, `verdict`, `verdict_basis`,
  `prune_signoff`. **5 + 8 = 13**, which is the contract's own field count.
- The contract's **prose summary** says "**6 MIRROR + 7 JUDGMENT**" — in its status block, in §3.3's
  MIRROR-marking paragraph, in §8's schema census row, and in §9.1 item 16, where it instructs a reader to
  "count them off the table" — and there describes the sixth MIRROR cell as *"the sixth field §3.3's table
  marks MIRROR"*. **That field does not exist**: nothing in the 13-row table is marked MIRROR a sixth time.
  The landed artifact inherits the claim (`docs/requirement-catalog.md`'s header and §C.3 both say
  "6 MIRROR + 7 JUDGMENT" while §C.3's landing-state paragraph enumerates **five** MIRROR cells).
- **The adjudication (this unit's, recorded here so the generator is not blocked and the next amendment has
  a target):** **the field table governs; the MIRROR set is exactly the five cells above; the generator's
  write region is those five cells; the "6 MIRROR + 7 JUDGMENT" summary is a DOC DEFECT** filed as
  **`CATALOG-MIRROR-COUNT-PHANTOM-FIELD`** (§9.6). No candidate sixth cell is acceptable: every remaining
  field is either a pointer/judgment (`statement`, `status_pointer`, `evidence_pointer`, `owner_class`,
  `code_anchor`, `verdict_basis`, `prune_signoff`) or the verdict itself, and the contract's own §3.4 rule 9
  calls `code_anchor` *"recomputable from no input"* — the definition it gives MIRROR. A generator that
  claimed a sixth MIRROR cell would have to invent it, which is the `F7-1`-class failure this unit exists to
  avoid.
- **Consequence for the landed artifact:** `docs/requirement-catalog.md`'s header/§C.3/§6.1 prose is
  corrected to **13 fields = 5 MIRROR + 8 JUDGMENT** by the catalog's NEXT amendment cycle (a
  `601`–`799`-block amendment pass, `docs/specs/requirement-catalog.md` §3.5.1 rule 5 — no row is added by
  the correction itself, and no id is retired). **This unit performs no such edit**: it records the defect
  (§9.6) and pins the generator against the table.

### 2.3 What the generator may and may NOT claim about the two authored-token MIRROR cells

`provenance` and `direction` are MIRROR cells (the table marks them so) **but they are not mechanically
derivable from the inputs**: `provenance` is decided by the **origin the evidence pointer names** and
`direction` by **the ask the origin expresses** — both are readings of prose, which is why the landed
edition marks every MIRROR cell `derived:false` / `hand-derived`. The generator therefore:
**(a)** reads them from the artifact, **(b)** **shape-validates** them against the frozen vocabularies
(`docs/requirement-catalog.md` §C.5.1's 6 provenance tokens, §C.5.2's 5 `wants-*` tokens + `n/a`), and
**(c)** reports them in the derived fragment flagged **`authored-passthrough`**, never
**`derived`**. The fragment's per-field basis is the honesty mechanism (§3.2 field 3): a reader can see
**which** of the five cells the generator computed (`id`, `capability` shape, `last_verified`) and which it
merely carried forward. A generator that stamped `derived:true` on those two cells would be making a false
claim, and `P-SM-2` (§5.7) fails it.

### 2.4 ACCEPTED RISK (recorded with its mitigation + revisit condition — do not silently absorb)

**RISK: the derived region and the hand-derived rows can disagree, and the derived region is the newer
one.** The generator recomputes `id` / `capability` / `last_verified` and reads back `provenance` /
`direction`; a row whose hand-authored cell the generator can only shape-check stays as authored. **A
reader could take the `derived:true` region as the authority for the whole row set.**

- **Mitigation (binding):** the region's payload declares **per-field** bases (§3.2 field 3), and its
  `mirror_divergences` list names **every** divergence (§3.5 rule 3) so a diverging cell is visible rather
  than silently overridden — and the generator **never writes** a divergent value into the artifact.
- **Revisit condition (binding on the next amendment):** if a later pass makes `provenance`/`direction`
  mechanically derivable (e.g. by pinning an origin-token grammar per pointer kind), that pass **widens
  the derived basis** and records it in §C.8; the widening is an amendment to this spec, never a silent
  change to the generator.

---

## 3. The pinned contract — the generator

### 3.1 Deliverable, CLI, and the write boundary

**Path:** `scripts/catalog-derive.mjs` (NEW; ESM `.mjs`; lives in `scripts/`, **never** inside
`scripts/live-drive.mjs`).

**Import-safety (mandatory).** Importing the module must execute nothing: no module-scope side effect, no
`main(process.argv…)` call at module scope, no top-level read, no top-level write. Every export is a pure
function of its arguments. **Why:** `tests/live-drive-contract.test.ts` documents this repo's hazard — a
module that calls `main()` at module scope cannot be imported by a test, so the house convention is either
an import-safe module or a source-text pin. This unit takes the **importable** route (its functions are pure
and worth calling directly), and the test ALSO carries the source-text pins it needs (§5.2 rule 9).

**CLI (pinned):**

```
node scripts/catalog-derive.mjs [--root <dir>] [--catalog <path>] [--as-of <YYYY-MM-DD>]
                                [--check] [--write] [--json] [--quiet]
```

| Flag | Meaning | Default |
| --- | --- | --- |
| `--root <dir>` | the repository root the input paths are resolved against — the fixture lever (§4.2) | the directory containing the resolved `scripts/../` (i.e. the repo root) |
| `--catalog <path>` | the catalog file to read (relative to `--root`) | `docs/requirement-catalog.md` |
| `--as-of <YYYY-MM-DD>` | **the ONLY date source in the derived region** (§3.3) | **required when `--write` is passed**; in dry-run it defaults to the manifest's `as_of` and the run records `as_of_source: "manifest"` |
| `--check` | validate only: resolve pointers, recompute counts, scan the citation discipline, compare input digests | off |
| `--write` | rewrite the sentinel region **in place** | **off — dry run** |
| `--json` | emit the report as JSON on stdout | off (human-readable text) |
| `--quiet` | suppress the human-readable report (exit code only) | off |

**Default is DRY RUN.** With no `--write` the generator makes **no file write at all** and prints the
rendered derived block plus its report to stdout. **A test may only ever invoke the no-write form**
(§5.2 rule 8).

**Exit codes (pinned).**

| Code | When |
| --- | --- |
| `0` | no hard failure. **A non-gating report — staleness, an `anchor-token` warn, an unresolved advisory `code_anchor`, a `mirror_divergence` — does NOT change the exit code.** |
| `1` | one or more **hard failures** (§7) — every failing rule is named, one per line, before exit |
| `2` | the run could not start: `--as-of` missing with `--write`, an unreadable `--catalog`/`--root`, a malformed `--as-of` (not `YYYY-MM-DD`) |

**The write boundary (the ONLY file the generator may ever write).**

1. The generator writes **exactly one file** — the catalog named by `--catalog` — and **exactly one span**
   inside it: the bytes **strictly between** `<!-- catalog:derived:begin -->` and
   `<!-- catalog:derived:end -->`.
2. It locates the markers by **exact text match**. It **fails hard** (`FS1`) if the marker pair is absent,
   appears more than once, is out of order (end before begin), or appears **anywhere other than inside §C.6**.
3. Every byte outside the region is **byte-preserved**. There is no reformatting, no table realignment, no
   whitespace normalization, no line-ending rewrite anywhere in the file.
4. It **never** writes: any tracker input, any `docs/specs/**` file, any `tests/**` file, any `src/**`
   file, any `archive/**` file, or any new file.
5. `--write` **refuses** to run when a hard failure is present: the artifact is left byte-identical and the
   exit code is `1`. A partial or best-effort write is forbidden.

### 3.2 The derived fragment — the exact payload shape

The region's content is **deterministic JSON, pretty-printed with a pinned 2-space indent and LF line
endings**, wrapped in the markers and nothing else. The payload:

```
{"derived_block": {
  "schema": 1,
  "derivation": "generated",
  "generator": "scripts/catalog-derive.mjs",
  "as_of": "<YYYY-MM-DD>",
  "as_of_source": "flag" | "manifest",
  "catalog_sha256": "<sha256 of the catalog IN ITS PRE-WRITE STATE>",
  "inputs": [ {"path": "<repo-relative>", "sha256": "<hex>", "bytes": <int>,
               "rows_read": <int>, "newest_digest_date": "<YYYY-MM-DD>"} ],
  "counts": { "capabilities": 16, "tier1": <int>, "tier2": <int>, "tier2_live": <int>,
              "tier2_prunable_verdict": <int>, "upstream_owed": <int>,
              "reg_capability_counts": { "<capability>": <int> },
              "checklist_rows": <int>, "checklist_data_tables_gaining_columns": <int>,
              "checklist_provenance_census": { "<token>": <int> },
              "checklist_direction_census": { "<token>": <int> },
              "excluded_specs": <int> },
  "mirror_basis": { "id": "derived", "capability": "derived+shape-checked",
                    "provenance": "authored-passthrough+shape-checked",
                    "direction": "authored-passthrough+shape-checked",
                    "last_verified": "derived" },
  "mirror_cells": [ {"id": "PRUNE-###", "capability": "…", "provenance": "…",
                     "direction": "…", "last_verified": "<YYYY-MM-DD>", "verdict": "…"} ],
  "pointer_resolution": [ {"row": "PRUNE-###", "field": "status_pointer"|"evidence_pointer",
                           "kind": "row-id"|"section-ref"|"anchor-token"|"none",
                           "pointer": "…", "result": "resolved"|"warn"|"unresolved"} ],
  "closure": { "discovered": {"<input path>": <int>}, "linked": <int>, "unlinked": <int>,
               "waived": [ "<id>" ], "unlinked_unwaived": [ "<id>" ] },
  "mirror_divergences": [ {"id": "PRUNE-###", "field": "…", "artifact": "…", "recomputed": "…"} ],
  "excluded_specs": [ {"path": "docs/specs/…", "reason_class": "EG"|"LB"|"GV"|"LNS"} ],
  "staleness": { "newest_input_date": "<YYYY-MM-DD>", "as_of": "<YYYY-MM-DD>",
                 "changed_since_manifest": [ {"path": "…", "manifest_sha256": "…",
                                              "actual_sha256": "…"} ],
                 "stale_rows": [ "PRUNE-###" ], "gating": false }
}}
```

**Field rules.**

1. **`catalog_sha256` is the hash of the catalog as it was READ** (the pre-write state), so the region is
   **non-self-referential**: filling the region does not change the value it records. This is the mechanical
   fix for the artifact's hand-computed self-digest (`docs/requirement-catalog.md` §C.6.2, whose digest line
   is self-referential by construction and says so) — the generator **replaces that hand-computed value
   with a mechanically recomputed one on every run** (the artifact's own recorded expectation) **without
   editing the digest line itself**: the recomputed value lives in the region.
2. **`inputs` is a set, not a fixed list**: one entry per input actually present, in ascending path order
   (codepoint). The enumeration rule is **the contract's** (`docs/specs/requirement-catalog.md` §3.8's
   `inputs` row + §3.6's source set + §3.12's carried conditions): the six tracker inputs
   (`docs/defects.md`, `docs/decisions.md`, `docs/pending.md`, `docs/next-steps.md`,
   `docs/specs/user-flow-audit-checklist.md`, the catalog itself), `docs/HANDOFF.md`, **every**
   `docs/feature-requests/*.md` present, the report observations docs (`docs/specs/user-demo-bug-report-2026-09-15.md`,
   `docs/specs/user-demo-bug-report-2-2026-09-15.md`, `docs/specs/user-demo-bug-report-3-2026-09-16.md`),
   and the two import-corpus files the checklist is read alongside (`docs/specs/ui-overhaul.md`,
   `docs/specs/user-flow-audit.md`). **A NEW file under `docs/feature-requests/` is an input
   automatically** — that is why the rule is a set and not the manifest's 18-line block (the tree gained
   `docs/feature-requests/design-extensions-2026-09-21.md` after the manifest was filled, which is exactly
   the drift the set rule handles without a false failure).
3. **`mirror_basis` is mandatory** and carries the per-field basis of §2.3. A missing or single-valued
   basis is `FS12`.
4. **`mirror_cells` is the derived view of the five MIRROR cells**, one entry per §C.3/§C.4 row, ascending
   by `PRUNE-###`. It is **never** the write surface for the artifacts' cells (§3.5).
5. **`pointer_resolution` carries one entry per pointer occurrence** (not per row) so a multi-pointer
   `evidence_pointer` resolves each part; `result:"warn"` is reserved for `anchor-token` (§3.4).
6. **`staleness.gating` is always the literal `false`** — the field exists so a consumer cannot mistake the
   report for a gate (§3.6).
7. **`counts.capabilities` is the only asserted count** (the closed partition,
   `docs/specs/requirement-catalog.md` §3.2). **Every other count is a literal recomputation** and is
   compared against the manifest rather than copied from it (C11).
8. **Key order is pinned** (the shape above, in that order) so byte-identity is a meaningful assertion; the
   JSON carries no trailing whitespace, no tabs and no CRLF.

### 3.3 The time source — `--as-of` is the ONLY one (C3)

**Rule.** No `Date.now()`, no `new Date()`, no `performance.now()`, no `process.hrtime`, no mtime/`stat`
read, no git invocation and no shell-out may appear in the derived region or influence any value written
into it.

- `last_verified` for every generated row = **the `--as-of` value** (or the manifest's `as_of` in dry-run
  with `as_of_source:"manifest"`). Nothing else may be its source.
- `newest_digest_date` per input is read from **the input's own content** (a dated header inside the file),
  with the run's `as_of` as the fallback — **never** from filesystem metadata
  (`docs/specs/requirement-catalog.md` §9.1 item 18, `FS16` there).
- A run in which the same input set yields two different `as_of` values yields two different
  `last_verified` columns **and nothing else changed** — that is the pinned discriminating behavior
  (`P-SM-1`, §5.7).

**The scan is a check, not a promise.** The test (§5.2 rule 6) scans the generator's **source text** for the
forbidden constructs and the derived region for an unexpected date, and fails on a match — because "no
`Date.now()`" is otherwise a claim nobody verifies.

### 3.4 The input set and the per-input id grammar (`pointer_kind`)

**Addressing rule (the contract's §3.5, C4).** Every pointer is classified as exactly one
`pointer_kind ∈ {row-id, section-ref, anchor-token, none}`; **`row-id` and `section-ref` hard-fail when
unresolved; `anchor-token` warns and never fails.** The grammar the generator actually implements, per
input:

| Input | `pointer_kind` it is addressed by | The ID GRAMMAR the generator matches | Resolution test | Failure class |
| --- | --- | --- | --- | --- |
| `docs/defects.md` | **`row-id`** | a **bolded row id** in the open/shelved/fixed tables: `**` + an id token + `**` + (optional ` (YYYY-MM-DD …)` parenthetical) + the table's cell separator — the id is the maximal prefix of uppercase letters, digits, `-` and `.`; a leading date parenthetical is stripped; **`LIVE-UF3`/`LIVE-UF4` do not exist and must never be minted** (the file's own id gap, recorded in `docs/defects.md` **`LIVE-UF-ID-GAP-AND-TEN-DEFECT-ASSUMPTION`**) | the id is an own id of that file | unresolved ⇒ `FS4` |
| `docs/decisions.md` | **`row-id`** (title-as-id), else **`section-ref`** | the text of a `DECIDED:` cell: `**DECIDED: ` + the token up to the first ` — ` — the **title IS the id**; rows with **no** `DECIDED:` title (the ID-less provenance clauses) are addressed by `section-ref` only | a `DECIDED:`-titled row resolves by title; an ID-less row resolves only as a section | unresolved ⇒ `FS4` |
| `docs/specs/user-flow-audit-checklist.md` | **`row-id`** | `UF-<GROUP>-<n>` — `UF-` + one or more uppercase groups/digits joined by `-` — **counted over the data rows only, never the header, never the `Coverage` cell text** (`docs/specs/requirement-catalog.md` §3.9 rule 1's recount rule; the count is 112 at the landed edition, recorded as DERIVED) | the id occurs as a row's first cell | unresolved ⇒ `FS4` |
| `docs/specs/mcp-endpoint.md` | **`section-ref`** | none — addressed by §section (`§3`, `§3.4`, `§6.2`, …) | the `§`-numbered section exists as a heading | unresolved ⇒ `FS4` |
| the catalog itself (`docs/requirement-catalog.md`) | **`row-id`** for `PRUNE-###`; **`section-ref`** for `§C.x` | `PRUNE-` + exactly three digits | the id occurs exactly once as a row id; every `merged-into:<id>` target resolves to a **live** row | unresolved ⇒ `FS4`; a dead `merged-into` target ⇒ `FS6` |
| `docs/next-steps.md` | **`anchor-token`** | none — the file has **NO row ids**: three `##` headings (`§CURRENT WORK / handover-state`, `§OPEN`, `§DONE`) and bolded prose rows under them | the named heading exists **and** the quoted row opening (the first ~6–12 words) appears under it | unresolved ⇒ **`FS5` — WARN, never fail** |
| `docs/pending.md` | **`anchor-token`** | none — **no id column**: six row vocabularies under `§UPSTREAM (imported constraints)`, `§UPSTREAM foundation requests`, `§SCHEDULED`, `§DEFERRED`, `§PARKED`, `§SPECULATIVE` | as above | unresolved ⇒ **`FS5` — WARN, never fail** |
| `docs/HANDOFF.md`, `docs/feature-requests/*.md`, the report docs | **`section-ref`** / **`row-id`** where the file has one; `anchor-token` where it does not | per the file's own shape, decided by the same rules above | as above | per the resolved kind |

**Rules.**

1. **The grammar is read from the file, never assumed.** A grammar mismatch is a **warning naming the file
   and the pattern** and a zero discovered-count for that input; it is **not** a hard failure, because a
   tracker's shape may legitimately change (`FS9`-class visibility is the point).
2. **`docs/next-steps.md` and `docs/pending.md` may not be hard-failed, ever.** Item 6 requires a tracker
   edit on every landing and these two files are prose; a hard-fail pointer rule here is the
   unsatisfiable-test objection that produced the split
   (`docs/specs/requirement-catalog-review.md` §4 option (ii)).
3. **Every pointer's resolution result is recorded per occurrence** (§3.2 field 5) so a churned anchor is
   VISIBLE rather than dropped, and each `warn` is listed in the report and **must be waivable by name** —
   a `warn` that `docs/requirement-catalog.md` §C.7 does not carry is not this unit's failure to fix
   (the ledger is an artifact the artifact's own pass owns), so the generator reports it as a **non-gating
   warn** and the contract test asserts only that the warn was *reported*.
4. **Out-of-repo pointers (`../…`) are existence-checked only.** A missing one is **`FS10` — non-gating
   warn**, never a hard failure: the adjacent projects are not dependencies of this repo and their absence
   is not this unit's defect (`AGENTS.md`'s adjacent-project rule; the contract's §3.4 rule 10 fixed
   out-of-repo forms). A pointer marked out-of-repo that **resolves** is recorded as resolved.
5. **A pointer never carries status into the output.** The generator records the *location*; it never reads
   a status cell into the region (the catalog's §3.1 rule 1). The one status-shaped value the fragment
   carries is the row's `verdict` **string**, carried only to exclude `escalate-prune` rows from the
   staleness/prune bookkeeping — never restated as prose (`FS11` if the generator emits status vocabulary
   as text).

### 3.5 The MIRROR/JUDGMENT split at generation time (the write-region rule)

1. **The generator owns exactly five cells per row** (§2.2): `id`, `capability`, `provenance`, `direction`,
   `last_verified`. Its write region is the derived fragment that carries them (§3.2 field 4).
2. **It NEVER rewrites a JUDGMENT cell** and never writes any cell into a §C.3/§C.4 row: `statement`,
   `status_pointer`, `evidence_pointer`, `owner_class`, `code_anchor`, `verdict`, `verdict_basis`,
   `prune_signoff` are **read-only inputs to validation**. There is no code path that edits a row's cell
   anywhere in the artifact.
3. **It VALIDATES the JUDGMENT cells it must reason about** — pointer resolution (§3.4), the frozen
   vocabularies, `merged-into` target liveness, the verdict/freeze legality of the contract's §3.4 rule 5
   and §3.6 — and **reports** a violation as a hard failure or a warn; it **never repairs** one.
4. **On a diverging MIRROR/JUDGMENT pair** — where a JUDGMENT cell (typically `verdict_basis` or
   `status_pointer`) contradicts the recomputed mirror value, e.g. a row whose `verdict` is
   `merged-into:<id>` while its `capability` cell names a capability the artifact's own merge record does
   not pair — the generator emits a **`mirror_divergence` diff report**: `{id, field, artifact: <the
   artifact's value>, recomputed: <the derived value>}`, printed in the report, recorded in the region's
   `mirror_divergences` array, and **non-gating**. **The artifact wins; the generator does not write.**
5. **A `mirror_divergence` is a finding, not a failure** — the register is ADVISORY
   (`docs/requirement-catalog.md` §C.0 rule 3) and the tracker is the sole status authority
   (`docs/requirement-catalog.md` §C.0 rule 1), so a mechanical tool may not overwrite a judged cell on a
   disagreement. The divergence appears in the next `§C.8` change-log cycle instead (§3.7 here).

### 3.6 The staleness report (NON-GATING — C2's live half)

**What it is.** The generator compares, per input, the digest recorded in the catalog's manifest
(`docs/requirement-catalog.md` §C.6.2) against the digest of the file it just read, and reports:

| Report field | Content |
| --- | --- |
| `changed_since_manifest` | every input whose `sha256` differs, with both values |
| `newest_input_date` | the newest `newest_digest_date` across the input set |
| `stale_rows` | every `PRUNE-###` whose `last_verified` is **strictly earlier** than `newest_input_date` — a **DATE comparison only**, never a hash string and never a byte count (`docs/specs/requirement-catalog.md` §9.1 item 18) |
| `gating` | the literal `false`, always |
| `summary` | one line: how many inputs changed, how many rows are stale, and the sentence **"non-gating: staleness is reported, never enforced"** |

**Rules.**

1. **A changed digest and a stale row are NOT failures.** They do not change the exit code (`0`), they do
   not block `--write`, and the contract test **must not** assert that the live inputs match the manifest.
   **This is the clause that keeps the trio off mutable prose** (C2; review §6 R7).
2. **The staleness check is the ONLY behavior that reads the live trackers' digests**, and it is
   **report-only**: no derived value depends on it. The derived cells depend only on the **text read**,
   which is why the frozen fixture reproduces them byte-for-byte regardless of the live tree's state.
3. **A missing or unparsable manifest digest line is `FS7` (hard failure)** — the generator cannot report
   drift against a manifest it cannot read — **but an ABSENT digest line for a newly-added input is a
   report line, not a failure** (§3.2 field 2's set rule).
4. **Staleness never gates `--write`, and `--write` never clears it.** Rewriting the region does not
   re-verify the register: re-verification is the `§C.8` change-log duty and the item-10d documentation
   review's (`docs/specs/requirement-catalog.md` §3.7 rule 4).

### 3.7 What a regeneration obligates downstream (recorded so it is not lost)

Every regeneration of the catalog obligates: **(a)** a `docs/requirement-catalog.md` §C.8 change-log row
for the cycle (one row per cycle, appended, never rewritten — the artifact's §C.8.2 rules); **(b)** the
`documentation review` reconciliation of the region against the rows it summarises (item 10d / RCA-6);
and **(c)** `docs/next-steps.md`'s DONE row to state which layer the reading covers (RCA-12). **The
regeneration itself is ONE COMMAND** (`node scripts/catalog-derive.mjs --as-of <date> --write`), and it is
the unit's central deliverable: after it lands, the catalog's hand-computed self-digest is replaced
**mechanically**, and MIRROR cells stop being hand-derivable.

---

## 4. Inputs

### 4.1 The resolved input set

1. **The six tracker inputs** (`docs/specs/requirement-catalog.md` §3.6's minimum enumerated source set +
   §3.12's input list): `docs/defects.md`, `docs/decisions.md`, `docs/pending.md`, `docs/next-steps.md`,
   `docs/specs/user-flow-audit-checklist.md`, `docs/requirement-catalog.md` (the catalog itself).
2. **`docs/HANDOFF.md`** — the upstream-owed index; **counted, never asserted**
   (`docs/specs/requirement-catalog.md` §3.6/§8).
3. **Every `docs/feature-requests/*.md` present at read time** — a set, not a list (§3.2 field 2).
4. **The report observations docs** — `docs/specs/user-demo-bug-report-2026-09-15.md`,
   `docs/specs/user-demo-bug-report-2-2026-09-15.md`, `docs/specs/user-demo-bug-report-3-2026-09-16.md`
   (report #3 exists as a document as of the item-10d resolution recorded in
   `docs/decisions.md` **`REPORT-3-COMMITTED-AS-A-DOCUMENT`**; the `docs/next-steps.md` prose block is
   retained as history and is covered by that file's digest).
5. **The two import-corpus files** `docs/specs/ui-overhaul.md` and `docs/specs/user-flow-audit.md`
   (**read-only inputs; they are on the MUST-NOT-EDIT list**, §9.4).
6. **The whole `docs/specs/**` tree as a directory** — every path is either an input or named in
   `excluded_specs` with a reason class (§4.3).

### 4.2 The fixture lever (`--root`)

**Rule.** Every input path is resolved against `--root`, so a committed fixture tree replays identically
without touching the live repo. **The generator has no other fixture mechanism** — no environment switch, no
"test mode" branch, no injected filesystem. This keeps the tested code path **the same code path** the repo
runs: the test's fixture is a directory of text, not a mock.

### 4.3 `excluded_specs` (the closure over `docs/specs/**`)

**Rule.** Every `docs/specs/**` path that is **not** an input is reported with a **reason class**, by the
class rule the artifact already carries (`docs/requirement-catalog.md` §C.6.4):

| Class | Rule |
| --- | --- |
| `EG` | a `docs/specs/unit-*-greens.md` path |
| `LB` | a `docs/specs/unit-*-live-pending-battery.md` path |
| `GV` | a path whose name ends `-review.md`, or one of the proposal/gate/verdict/report record documents |
| `LNS` | every other non-input `docs/specs/**` path |

1. **The partition is total and exclusive**: a path belongs to exactly one class, and a path that is neither
   an input nor classifiable is **`FS13`** (hard failure) — the contract's `FS23` class
   (`docs/specs/requirement-catalog.md` §3.8).
2. **The `excluded_specs` COUNT is a DERIVED reading, never a pin.** The artifact currently reports
   **118 as an explicit FLOOR** (`docs/requirement-catalog.md` §C.6.3: 75 `(EG)` + 18 `(LB)` + 25 `(GV)`)
   and states that its `(LNS)` class is given by rule rather than enumerated
   path-by-path. **The generator closes that gap by enumeration** (that is the artifact's recorded owed
   item) and reports the true count; the contract test asserts **the rule and the exclusivity**, never the
   number (§5.3). **A SECOND reading of the same quantity exists and is recorded here so the two are
   never silently equated:** the catalog contract's §9.1 item 25 (the 2026-09-21 amendment that widened
   §3.8's scope) records the cluster's reading of **130 non-input `docs/specs/**` paths** (112
   `unit-*.md` = 74 `-greens` + 18 `-live-battery`, **plus 18** non-`unit-` paths) and marks it *"a
   reading of the tree at that pass, never a pin"*. **118 is the artifact's FLOOR; 130 is the
   contract's pass reading; neither is asserted by this unit's test** — the generator's job is to make
   the count mechanical and let both sources be reconciled against its output. (Recorded drift: the two
   figures are **not** reconciled anywhere today, and the reconciliation is owed to the catalog's next
   amendment cycle together with §15.1's two items — see `docs/specs/design-extensions-review.md`
   §15.1.)
3. **This is the clause that lets the O-5 spec land safely**: a new `docs/specs/**` file is either an input
   or classified; it can never be silently outside a "closed" partition (C11).

---

## 5. The contract test

### 5.1 Path, name, and why

**Path (pinned): `tests/requirement-catalog-contract.test.ts`.**

**Why this name — the choice, with its reason.** The repo's contract-test convention is
`tests/<subject>-contract.test.ts` (`tests/live-drive-contract.test.ts`,
`tests/unit-o-0-report-contract.test.ts`, `tests/unit-o-0-driver-contract.test.ts`,
`tests/unit-v5-migration-contract.test.ts`, `tests/unit-o0-m1-m3-driver-contract.test.ts`,
`tests/unit-import-batch-persist-contract.test.ts`) — i.e. `<subject>` is the **artifact or module under
test**, prefixed by `unit-` only when the subject *is* a unit. **Both candidate names conform**, so the
deciding criterion is **referential integrity, not style**: the name
`tests/requirement-catalog-contract.test.ts` is **already pinned by the landed artifact and both trackers**
in four places — `docs/specs/requirement-catalog.md` §1 Artifact C, §3.12, §5.4; `docs/next-steps.md`
§OPEN (**D-GEN**); `docs/pending.md` §SCHEDULED; and `docs/requirement-catalog.md`'s closing
"Provenance and process". `tests/catalog-derive-contract.test.ts` (the generator-named alternative, matching
`live-drive-contract`'s subject-naming) would leave four live citations pointing at a non-existent path —
an `FS8`-class defect in this repo's own vocabulary (`docs/specs/requirement-catalog.md` §3.5) and a direct
violation of `AGENTS.md` item 6c ("never leave a citation pointing at a moved file"). **Decision: keep the
pinned name; the four citations stay correct, and the naming divergence from `live-drive-contract` is
recorded here rather than silently introduced.** (The `--root` CLI flag is this unit's fixture mechanism, so
the test's subject — the derivation — is named by the artifact it derives, not by the script.)

**Style.** The test is a **source-text + text-analysis test**: it reads the generator's source for the
structural pins it needs (§5.2 rule 9) and **imports the generator's pure functions** for everything else
(the module is import-safe by contract, §3.1). It never starts the app, never touches the network, never
imports `src/**`, and **never writes** (§5.2 rule 8).

### 5.2 What the test SHALL assert

Clause letters **(a)–(f)** are the contract's carried set (`docs/specs/requirement-catalog.md` §3.12); the
numbered clauses are this unit's.

1. **(a) DETERMINISM — byte-identity over the frozen fixture.** Two runs over the **same committed fixture
   root**, with the **same `--as-of`**, produce **byte-identical** derived blocks and byte-identical
   reports. Asserted for every fixture case in §5.4, including the hard-failure cases (a failing run is
   deterministic too). **Never asserted against the live trackers.**
2. **(a′) THE TIME SOURCE.** Same input set + a different `--as-of` ⇒ **only** the `as_of` /
   `last_verified` values change, byte-for-byte elsewhere identical.
3. **(b) POINTER RESOLUTION.** Over the landed artifact: every `row-id` and every `section-ref` pointer
   **resolves**; every `anchor-token` pointer that does not resolve is **reported as a warn** (and the test
   asserts the **warn's presence in the report**, never the pointer's resolution).
4. **(c) COUNTS + `excluded_specs`.** The recomputed counts equal the manifest's `counts` **per key**, and
   every `docs/specs/**` path is an input or carries exactly one reason class. **The `excluded_specs`
   *number* is not asserted** (§5.3).
5. **(d) THE CLOSURE TESTS (`§3.10`).** (i) every row's `capability` is one of the closed 16; (ii) the
   per-capability counts sum to the row total; (iii) every `unlinked` discovered id appears in the §C.7
   waiver ledger **by name**; (iv) the checklist's `UF-` row count equals the manifest's `checklist_rows`;
   (v) no `escalate-prune` row carries a `user-*` provenance or a dangling-citation lineage.
6. **(e) CITATION + VOCABULARY DISCIPLINE.** Over catalog-authored cells: no line number; no
   `archive/**` outside a marked `evidence_pointer`; no status verb in a JUDGMENT cell; every vocabulary
   token in its frozen set (`docs/requirement-catalog.md` §C.5.1–§C.5.4). **Plus the generator's source
   scan**: the forbidden time/fs sources of §3.3 are absent from the module's text. **Vacuity control
   (mandatory):** a scan that examined **zero** cells fails the clause — an empty scan is a FAILURE, never a
   pass (the `unit-import-batch-persist.md` §4 `FS8` control-draw discipline).
7. **(f) THE DERIVED REGION IS NON-SELF-REFERENTIAL AND REGION-SCOPED.** (i) the region's
   `catalog_sha256` equals the sha256 of the catalog **in its pre-write state** (so re-running `--write`
   over an already-written catalog is **idempotent**: the second run's output equals the first's); (ii) a
   run with `--write` against a fixture alters **only** the bytes inside the sentinel region — asserted by a
   before/after byte diff over the fixture catalog's full text, with the region masked out.
8. **(g) HERMETICITY.** The test **writes nothing**: it invokes the generator **without `--write`** (and,
   for the write-path clause (f)(ii), into a **temp copy** whose path lives outside `docs/`), and it fails
   if any file under the repo's `docs/` tree changed during the run. No test in this file may mutate the
   repository.
9. **(h) THE STRUCTURAL PINS ON THE GENERATOR'S SOURCE.** Because a source-text pin is the only way to
   assert the *absence* of a construct: the module's text contains **no** `Date.now(`, **no**
   `new Date(`, **no** `performance.now(`, **no** `process.hrtime`, **no** `statSync`/`lstatSync` on an
   input (used for a date), **no** `child_process` import, **no** `execSync`, **no** git invocation, **no**
   `src/` path literal, and **no** write call other than the single region-scoped writer. Each absence is a
   distinct assertion naming the construct.
10. **(i) THE `code_anchor` LIMIT.** The test asserts the **shape** rule only: every `code_anchor` is
    non-empty text, carries **no** line number, and is either a symbol/selector/grep token or `<none>`.
    **It asserts nothing about resolution** (§6.3).

### 5.3 What the test deliberately does NOT assert

1. **It does not assert byte-identity against the LIVE trackers.** That is the whole point of C2: the live
   check is the **non-gating staleness report** (§3.6), asserted only for its *presence*, never for its
   emptiness.
2. **It does not assert that the live inputs match the manifest's digests.** A tracker edit landing between
   two suite runs must not redden the trio. `changed_since_manifest` may be non-empty at any time.
3. **It does not assert the `excluded_specs` count** (118, or any figure), because the artifact records it
   as a floor and the tree moves. It asserts the class rule and the partition's exclusivity.
4. **It does not assert any `PRUNE-###` id, row count, capability distribution or verdict** as a literal:
   the register is amended by later passes (`docs/specs/requirement-catalog.md` §3.5.1 rule 5's
   AMENDMENT/FIX-PASS block) and a literal pin would redden the trio on every amendment. **It asserts the
   *relationships*** (partition closure, count identities, waiver coverage).
5. **It does not assert any judgment's correctness** — no verdict, no freeze, no waiver reason, no
   provenance/direction assignment is judged by this test. Those are the register's own review duties
   (adversarial + item 10d).
6. **It does not resolve `code_anchor` symbols** (§6.3) and does not read `src/**` for any purpose.
7. **It does not write into `docs/`** — not the catalog, not a tracker, not a report artifact.
8. **It does not assert that the "6 MIRROR + 7 JUDGMENT" prose is right** (§2.2): the phantom-field defect is
   filed for the catalog's next amendment, and the test pins the **five-cell** MIRROR set the field table
   enumerates.
9. **It does not assert that a non-gating warn is *fixed*** — only that it was *reported* (§3.4 rule 3).
10. **It does not import or exercise any app module, any `src/**` file, or the live driver.**

### 5.4 The frozen fixture snapshot (C2)

**Path (NEW): `tests/fixtures/catalog-derive/`** — committed, immutable, one directory per case:

| Fixture case | What it carries | What it exercises |
| --- | --- | --- |
| `base/` | a self-contained `--root`: all inputs (§4.1) as small but **grammar-faithful** copies — a defects table with two bolded row ids, a decisions table with one `DECIDED:` row + one ID-less provenance row, a pending file with two anchor-token rows across two headings, a next-steps file with three headings, a checklist with `UF-` ids + 14 data tables, a catalog with the sentinel markers, `§C.1`'s 16 capabilities, a handful of `PRUNE-###` rows and a §C.7 waiver ledger | the happy path: everything resolves; counts recompute; determinism (a)/(a′); region-scoping (f) |
| `warn-anchor/` | `base/` with **one quoted anchor-token opening edited** in the pending/next-steps copy | `FS5` warn-not-fail; exit code stays `0` (§5.3 rule 1) |
| `hardfail-pointer/` | `base/` with one `status_pointer` aimed at an id that is not in the defects copy | `FS4` hard failure, exit `1`, `--write` refused (§3.1 rule 5) |
| `hardfail-unwaived/` | `base/` with a defects row id that appears in no pointer and in no §C.7 waiver | `FS13`-class closure failure (`FS14` here) + the vacuity control (§5.2 rule 6) |
| `hardfail-mergetarget/` | `base/` with a `merged-into:PRUNE-999` whose target is absent | `FS6` |
| `hardfail-manifest/` | `base/` with one input's digest line deleted from the manifest | `FS7` |
| `divergent-mirror/` | `base/` with a row whose judged cell contradicts its recomputed mirror value | `mirror_divergence` reported, non-gating, region unchanged (§3.5 rule 4) |
| `no-sentinel/` | `base/` with the sentinel markers removed | `FS1` |
| `sentinel-outside/` | `base/` with a second marker pair outside §C.6 | `FS1` (§3.1 rule 2) |

**Rules.**

1. **The fixture is a SNAPSHOT and is never edited to make a test pass.** A new requirement is a **new
   fixture case** (a new directory), added in the same commit as the assertion that needs it. Editing a
   fixture case's text to make an assertion green is a review finding.
2. **Every fixture file's dated content uses the pinned `--as-of` value the test passes**, so no test
   depends on wall-clock time.
3. **The fixture root is the only difference between the tested and the live code path** (§4.2). A branch
   keyed on "am I in a fixture" is forbidden.
4. **The fixture is small on purpose**: it exercises the **grammar** and the **relationships**, never the
   real corpus — so it stays legible and never has to track a live tracker.

---

## 6. The `code_anchor` limit — ADVISORY at this layer (C9)

1. **The generator cannot resolve a symbol at the doc layer.** It must not read `src/**`
   (`docs/specs/requirement-catalog.md` §3.12's hard boundary; the `code_anchor` field's own table row calls
   symbol resolution "a CODE-layer check"), so **`code_anchor` resolution stays ADVISORY** and this unit's
   test asserts **presence/shape only** (§5.2 rule 10).
2. **`code_anchor` is a JUDGMENT cell** (`docs/specs/requirement-catalog.md` §3.3's field table, whose
   authority §9.1 item 16 pins) — the generator neither writes it nor claims to.
3. **Resolution is a later code-layer check**, owned by a later unit or a read-only audit pass, which
   **may READ `src/**` and may never edit it**. This unit does not perform it, does not schedule it, and
   does not report a resolution status.
4. **A `code_anchor` that no longer resolves may NEVER be reported as "verified" from a doc-layer pass** —
   the artifact states the same rule in §C.0 rule 4 and §C.3's landing-state paragraph. The generator's
   report must therefore say **`advisory: not resolved at this layer`** beside any anchor count it prints,
   and a test asserts that sentence is present whenever an anchor count is printed.
5. **A stale anchor is not a fail-state of this unit.** It is a finding for the code-layer check; a
   `code_anchor`-driven hard failure here would make the doc-layer test depend on `src/**`'s shape, which is
   precisely the coupling C9 forbids.

---

## 7. Fail-states (FS) — THIS unit's numbering

**Numbering convention, stated once (and matched to the repo's own practice).** The repo numbers fail-states
**per unit**, restarting at `FS1` in each unit spec (`docs/specs/unit-import-batch-persist.md` §4
`FS1..FS8`; `docs/specs/unit-o0-m1-m3-measurement-shape.md` §6 `FS1..FS12`;
`docs/specs/requirement-catalog.md` §5 `FS1..FS24`). **This unit follows that convention and starts at
`FS1`**, and §7.2 maps every row to the catalog contract's fail-state of record. **A reference to "the
catalog contract's `FS1`..`FS26`" is inaccurate**: that contract defines **`FS1`..`FS24`** (§5's table and
its §8 census row "Fail-states (this spec) | **24**"); it has **no `FS25`/`FS26`**, and any citation of one
is itself a dangling-citation-class defect.

**Each fail-state is loud**: it names the artifact, the row id / the pointer / the count / the file, **and**
the rule it violates. A catalog that trips one is not regenerated, and `--write` refuses.

| # | Fail-state | Observable + exact rule violated |
| --- | --- | --- |
| **FS1** | **The sentinel region is missing, malformed, or out of place** — markers absent, more than one pair, out of order, or a pair outside `docs/requirement-catalog.md` §C.6 | the artifact and the marker text are printed with "sentinel region not usable"; **§3.1 rule 2 — one region, in §C.6 and nowhere else** |
| **FS2** | **A required section is missing and cannot be derived** — no §C.1 capability table, no §C.3/§C.4 row table, no §C.5 vocabulary block, no §C.6 manifest, no §C.7 waiver ledger | the section name is printed with "required section absent"; **§3.2/§3.4 — the derivation has no invented defaults; nothing is inferred from an absent section** |
| **FS3** | **A count does not recompute** — a `counts` key differs from the literal recomputation, or `capabilities !== 16` | the key, the manifest value and the recomputed value are printed; **§3.2 field 7 / C11 — counts are DERIVED, never asserted or copied** |
| **FS4** | **An unresolved `row-id` or `section-ref` pointer (hard failure)** | the pointer text, its kind and its owning input are printed with "does not resolve"; **§3.4 — a `row-id`/`section-ref` pointer must resolve** |
| **FS5** | **A moved `anchor-token` pointer** (heading + quoted opening no longer matches in `docs/next-steps.md` / `docs/pending.md`) | **WARN, never fail**: the pointer, the expected opening and the nearest candidate opening are printed; **§3.4 rules 2–3 — these two inputs are prose and item 6 edits them on every landing** |
| **FS6** | **A `merged-into:<id>` whose target does not resolve to a live row** | the target id and the referring row are printed; **§3.4, the catalog contract §3.6's merged rule** |
| **FS7** | **The manifest is missing a required field, or an input's digest line is absent/unparsable** | the missing field or digest line is named; **§3.6 rule 3 / the catalog contract §3.8's `inputs` row** |
| **FS8** | **A date or a value sourced from wall-clock, mtime, git or a shell read reaches the derived region** | the value and its source are named; **§3.3 / C3 — `--as-of` is the ONLY date source** |
| **FS9** | **A `last_verified` is strictly earlier than the newest input date** | **REPORT ONLY, non-gating**: the row id, its date and the newest input date are printed; **§3.6 — staleness never gates and never blocks `--write`** |
| **FS10** | **An out-of-repo (`../…`) pointer does not exist** | **REPORT ONLY, non-gating**: the pointer is printed with "out-of-repo, not present"; **§3.4 rule 4 — the adjacent projects are not dependencies of this repo** |
| **FS11** | **A line number, an unmarked `archive/**` pointer, or a status verb appears in a catalog-authored cell** | the cell, the row id and the offending fragment are printed; **the catalog contract §3.4 rules 6–8 / C10 — symbols and section refs only; `archive/**` only inside a marked `evidence_pointer`; no status vocabulary** |
| **FS12** | **The MIRROR basis is missing or over-claims** — a `provenance`/`direction` cell reported as `derived` rather than `authored-passthrough`, or a `capability` cell outside the closed 16 | the field and the claimed basis are printed; **§2.2/§2.3 — the generator owns five cells and may not claim to have computed a reading of prose** |
| **FS13** | **A `docs/specs/**` path is neither an input nor classified** | the path is printed with "neither an input nor excluded"; **§4.3 / the catalog contract §3.8's `excluded_specs`** |
| **FS14** | **An unlinked discovered tracker id is not waived by name in §C.7**, or a discovered id is unwaived in the fixture | the id and its owning input are printed with "unlinked and unwaived"; **the catalog contract §3.10 closure test 6 / C11** |
| **FS15** | **The scan is VACUOUS** — a scan examined zero cells, zero rows or zero ids, so its clean result is meaningless | the scan's name and its zero count are printed with "empty scan — a vacuous pass is a failure"; **§5.2 rule 6 — the control-draw discipline** |
| **FS16** | **A run wrote outside the sentinel region, or wrote any file other than the catalog** | every touched path and the changed span are printed; **§3.1 rules 1/3/4 — one file, one span, byte-preserved elsewhere** |
| **FS17** | **A JUDGMENT cell was rewritten, or a hand-authored MIRROR cell outside the region was edited by a run** | the cell and the before/after values are printed; **§3.5 rule 2 — the generator never writes a judged cell; the region is its only write surface** |
| **FS18** | **A MIRROR/JUDGMENT divergence was neither reported nor recorded** | the row, the field and both values are printed with "divergence unreported"; **§3.5 rule 4 — the diff report is mandatory, the artifact wins, the generator does not write** |

### 7.1 NOT fail-states (legal, and must not be flagged by the generator or the test)

**A changed input digest**; **a stale row** (both are the non-gating staleness report);
**a moved `anchor-token`** (a warn, `FS5`); **a missing out-of-repo pointer** (a warn, `FS10`);
**an unresolved ADVISORY `code_anchor`** (§6.5); **a `mirror_divergence`** (§3.5 rule 4);
**an `escalate-prune`-free register** (the landed artifact has **zero** such rows — that is the criterion
working, not the generator failing); **a `merged-into:<id>` row that keeps its register slot**;
**a checklist `Catalog` cell holding `—`** (legal where no register row exists, the artifact's §3.9 rule 6);
**a newly-added `docs/feature-requests/*.md` file** (an automatic input, §3.2 field 2);
**an absent `docs/specs/**` path that used to exist** (classification is over the tree **as read**, and a
removed path is simply not in it); **a §C.4 ledger row's non-prunable verdict** (by construction).

### 7.2 Cross-reference to the catalog contract's fail-states of record

`docs/specs/requirement-catalog.md` §5 owns `FS1`..`FS24`. The mapping (the catalog's numbering is a
different unit's vocabulary; **the numbers are NOT interchangeable**):

| This unit | The catalog contract's fail-state(s) mechanized | Relationship |
| --- | --- | --- |
| `FS1` | (none) | new here: the generator's own write-boundary precondition |
| `FS2` | (none) | new here: the artifact's required sections |
| `FS3` | `FS15` (manifest missing / unresolved count) | narrower: this unit names **which count** failed to recompute |
| `FS4` | `FS8` | identical rule; **hard failure in both** |
| `FS5` | `FS9` (+ `FS19`, the unwaived warn) | identical rule; **warn in both** |
| `FS6` | `FS10` | identical |
| `FS7` | `FS15` | this unit's manifest/digest half |
| `FS8` | `FS16` | identical (C3) |
| `FS9` | `FS11`'s `stale` condition | **non-gating here**, a "never pruned" condition there |
| `FS10` | (none) | new here: out-of-repo existence, non-gating |
| `FS11` | `FS3` (copied status) + `FS5` (line number) + `FS6` (`archive/**` canonical) | this unit's scan bundles the three citation/vocabulary rules |
| `FS12` | (none) | new here: the MIRROR-basis honesty rule of §2.2/§2.3 |
| `FS13` | `FS23` | identical rule, widened to the whole tree (the artifact's §9.1 item 25) |
| `FS14` | `FS18` | identical rule (closure test 6) |
| `FS15` | the `unit-import-batch-persist.md` §4 `FS8` control-draw discipline | imported from a sibling unit rather than from the catalog contract |
| `FS16` | (none) | new here: the write-boundary assertion |
| `FS17` | `FS4` (MIRROR hand-edit) | this unit's generator-side form of the same prohibition |
| `FS18` | (none) | new here: the divergence-report duty |

**Not mechanized by this unit (and deliberately so):** the catalog's `FS1` (capability partition), `FS2`
(id collision / duplicate row), `FS7` (empty required field), `FS12` (prune evidence set), `FS13`
(deletion without sign-off), `FS14` (unrecorded conflict), `FS17` (checklist row-count change), `FS20`
(keep-class mis-stamp), `FS21` (straddle → two live rows), `FS22` (`PRUNE-###` block allocation), `FS24`
(`status_pointer` at an observing report) — each is a **judgment-bearing register rule** whose mechanizable
part is the *shape* this unit validates (`FS3`/`FS4`/`FS14`) and whose *adjudication* stays the register's own
adversarial + documentation-review duty. **The generator must not pretend to check them**; a generator that
hard-failed on `FS24` would have to decide ownership of a behavior, which is exactly the judgment
(`docs/specs/requirement-catalog.md` §3.5.3) the doc layer may only *validate*, not *decide*.

---

## 8. The `§5.x` typed Property register (PBT) — MANDATORY (code-bearing unit)

This unit adds a code surface (`scripts/catalog-derive.mjs`), so the register is **mandatory** — a zero-row
exemption is NOT allowed. Rows are typed **`P-IM`** (input-model), **`P-SM`** (state-model) or **`P-TP`**
(transform) — **never `F`-rows, never §7 rows**.

**Seed (pinned): `0xC47A1060`.** Deterministic and reused by every row; a row that needs a second
independent stream derives it as `seed ^ <row index>` and records which stream drew which case.

**Budget (pinned, with its declared-upper-bound note).** **≤100 generated cases per row · ≤400 total ·
stop-after-5.** Every row stops after **5 counterexamples** and reports the 5; a row that exhausts its
budget with no counterexample is `HELD`, and the count of cases actually run is reported. **The 400 figure is
a DECLARED UPPER BOUND, never a claim that 400 cases ran** (the sibling note in
`docs/specs/unit-import-batch-persist.md` §5.7's register-count paragraph).

**Held / broken reporting rule (binding).**
1. A row reports **`HELD`** with `cases_run`, `counterexamples: 0`, and its **control draws** (the draws that
   prove the oracle *can* fail — a row whose control passes is `BROKEN`, not `HELD`).
2. A row reports **`BROKEN`** when at least one counterexample was found; the report carries **up to 5**
   counterexamples, each with the drawn input (or its seed + index) and the observed value.
3. **A `BROKEN` row is a unit finding, not a test flake**: it is recorded in this spec's §11 (adversarial
   findings) and either the implementation is fixed or the **invariant is amended here** — never silenced by
   weakening the row.
4. **An over-strength row is also a finding** (the read-only PBT audit's job, `AGENTS.md` item 10 + the
   RCA-3 pass): a row whose proposition is not observable from the pinned surfaces is `OVER-STRENGTH` and is
   amended, not kept.

| Ref | Class | Invariant | Generator strategy (`strat:`) | Checkable proposition (∀ pattern) | Budget |
| --- | --- | --- | --- | --- | --- |
| `P-IM-1` | IM | **The derivation is a pure function of the fixture text**: two runs over the SAME fixture root with the SAME `--as-of` produce **byte-identical** derived blocks and byte-identical reports, for the happy path **and** for every hard-failure fixture. Determinism is a property of the derivation, never of the host's state or the run order. | `strat:derive-determinism` | ∀ fixture cases `c ∈ {base, warn-anchor, hardfail-pointer, hardfail-unwaived, hardfail-mergetarget, hardfail-manifest, divergent-mirror, no-sentinel, sentinel-outside}`, run `derive(c, as_of)` twice (and once with the case DIRECTORY copied to a second temp path, to prove no dependence on the path itself): `renderBlock(run1) === renderBlock(run2)` byte-for-byte, `report(run1) === report(run2)`, and `exitCode` is identical. **Control:** the `warn-anchor` and `hardfail-pointer` cases must produce DIFFERENT reports from `base` (a run that returns the base report for every case is vacuous, `FS15`). | 100/row |
| `P-IM-2` | IM | **Read/write containment**: no run reads anything under `src/`, and no run writes any file except the catalog, inside the sentinel region, and only with `--write`. The input set is exactly §4.1's resolved set — nothing more is read from the tree. | `strat:read-write-containment` | ∀ fixture cases × `{no-write (default), --check, --write}`: the set of paths **read** is a subset of §4.1's resolved input set (asserted by an instrumented read of the run's own reported `inputs` + a source-text scan for `src/` and for read sites), and the set of paths **written** is `{}` without `--write` and `{the fixture catalog}` with `--write`. **Control:** a draw with `--write` must show a **non-empty** write set (a write-path assertion that never observes a write is vacuous, `FS15`); a fixture catalog whose content changed only inside the region, and whose pre/post bytes are equal outside it (`FS16`). | 100/row |
| `P-SM-1` | SM | **`--as-of` is the ONLY date source**: varying `--as-of` changes exactly the `as_of`, `as_of_source`, and the `last_verified` values, and nothing else; and `last_verified` for a row that has been re-verified equals the run's as-of (a re-verified row moves FORWARD rather than staying at its landing date — the artifact's §9.1 item 18 rule). | `strat:as-of-sole-time-source` | ∀ fixture case `base` × `as_of ∈ {2026-09-21, 2026-09-22, 2026-09-30}` (plus a manifest-fallback draw with no flag): the two derived blocks differ **only** at `as_of`, `as_of_source`, and the `last_verified` fields; every other byte is identical; a drawn `as_of` that is later than an input's `newest_digest_date` leaves `stale_rows` empty, and one that is earlier than it **cannot** be produced (the generator uses the flag verbatim and reports, never clamps). **Control:** the source-text scan must find the forbidden constructs when it is run against a synthetic text carrying `Date.now()` (a scan that cannot fail is vacuous, `FS15`). | 60/row |
| `P-SM-2` | SM | **The MIRROR basis is honest and complete**: for every row, `mirror_basis` is present and per-field; `id`/`capability`/`last_verified` are `derived`; `provenance`/`direction` are `authored-passthrough` (never `derived`); and no `provenance`/`direction` value is reported as computed from an input. | `strat:mirror-basis-honesty` | ∀ fixture case `base` × generated row subsets (drawn from the fixture's `PRUNE-###` set, including a degenerate one-row set and a set whose `provenance` tokens are drawn from the whole six-token vocabulary): `mirror_basis` has exactly the five keys; the three derived keys read `derived` (or `derived+shape-checked`); the two authored keys read `authored-passthrough+shape-checked`; and the rendered region contains no `"provenance": … "basis": "derived"` pairing. **Control:** a synthetic row whose `provenance` value is reported derived must FAIL the same check. | 40/row |
| `P-SM-3` | SM | **Discovery completeness (the closure duty)**: over a generated id population, every tracker id the input grammar matches is either **linked** (referenced by at least one pointer) or **waived by name**; `unlinked_unwaived` is empty on a compliant population and names **exactly** the seeded unwaived ids on a non-compliant one; `discovered − linked = unlinked`, and `linked + unlinked_unwaived + waived` accounts for every discovered id. | `strat:closure-population` | ∀ generated populations (fixture `base`'s ids plus synthetic ids injected into a temp copy of the input set, drawn from: an id linked by a `status_pointer`; an id linked only by an `evidence_pointer`; an id waived in the §C.7 ledger; an id neither linked nor waived; an id that collides with an existing one; an id present twice): the reported `closure` set-partitions the discovered ids; `unlinked_unwaived` equals the seeded unwaived set exactly (order-insensitive); `|discovered| ≥ |linked|`. **Control:** a population with at least one seeded unwaived id must report a NON-EMPTY `unlinked_unwaived` (the vacuity control of §5.2 rule 6). | 100/row |
| `P-SM-4` | SM | **Staleness is a DATE comparison and is always non-gating**: `stale_rows` = every row whose `last_verified` is strictly earlier than `newest_input_date` — never derived from hash strings, byte counts, or file metadata; and `staleness.gating` is the literal `false` on every path, including a run with changed digests and stale rows. | `strat:staleness-date-compare` | ∀ generated `(row last_verified dates × input newest_digest_dates)`: `stale ⟺ last_verified < newest_input_date` (a row equal to the date is **not** stale — the strictness boundary); a run whose report has a non-empty `changed_since_manifest` still exits `0` and still permits `--write`; `staleness.gating === false` in every report; a modified `sha256` with an unchanged date does **not** create a stale row. **Control:** a draw that sets an input date later than every row's `last_verified` must report a non-empty `stale_rows`. | 80/row |
| `P-TP-1` | TP | **Pointer resolution is TOTAL and three-valued**: every pointer occurrence resolves to exactly one of `resolved` / `warn` / `unresolved`; `row-id` and `section-ref` never yield `warn`; `anchor-token` never yields `unresolved`; an empty or `<none>` pointer yields `unresolved` (a field where `none` is illegal) or is excluded (`code_anchor`, the one field that admits `<none>`). | `strat:pointer-resolution-three-valued` | ∀ generated pointer occurrences (kind drawn from the four `pointer_kind` values × existence drawn from {present, absent, present-under-a-different-kind, near-miss-typo, empty-string}): the resolution is exactly one value; `kind ∈ {row-id, section-ref}` ⇒ result ≠ `warn`; `kind === 'anchor-token'` ⇒ result ≠ `unresolved` and the report carries the expected + nearest-candidate openings; the aggregate `pointer_resolution` length equals the number of pointer occurrences (never the number of rows). **Control:** a `row-id` aimed at an absent id must yield `unresolved` (a resolver that only ever returns `resolved` is vacuous). | 100/row |
| `P-TP-2` | TP | **The generated region never overwrites a JUDGMENT cell and is idempotent**: for any fixture catalog, a `--write` run changes bytes **only** inside the sentinel region, leaves every §C.3/§C.4 row cell byte-identical, and a second `--write` produces a byte-identical file (the region is a fixed point). | `strat:write-region-idempotent` | ∀ fixture cases carrying a catalog `× {one write, two writes, a write after a hand-edit OUTSIDE the region}`: `outside(region)` bytes before === after (asserted by masking the region span and comparing the remainder); every row's 13 cells compare equal; `renderBlock(after run 1) === renderBlock(after run 2)`; and a hand-edit outside the region survives the write unchanged. **Control:** a drawn write must change the region's bytes (a writer that never writes is vacuous, `FS16`). | 100/row |
| `P-TP-3` | TP | **The citation + vocabulary scan is complete and non-vacuous**: the scan reports every line number, every unmarked `archive/**` pointer and every status verb in a catalog-authored cell, and it reports zero findings on a clean fixture **while examining a non-zero number of cells**. | `strat:citation-scan-complete` | ∀ generated cell populations (drawn from: a clean cell; a cell carrying a `path:§n.m` ref; a cell carrying a `:1234`-shaped line number; a cell carrying `src/x.ts:88-92`; a cell carrying `archive/…` marked and unmarked; a JUDGMENT cell carrying `OPEN`/`FIXED`/`DONE`/`SCHEDULED`; a cell carrying `archive/…` inside a marked `evidence_pointer`): the scan's findings equal the seeded violations exactly (order-insensitive), a clean population yields zero findings **and** `cells_examined > 0`, and a `cells_examined === 0` population FAILS the row (`FS15`). **Control:** every seeded violation class must be reported at least once across the draws. | 100/row |

**Class tally:** IM ×2 (`P-IM-1`, `P-IM-2`), SM ×4 (`P-SM-1`…`P-SM-4`), TP ×3 (`P-TP-1`…`P-TP-3`) = **9 rows**.
**DECLARED EXCEPTION (recorded against the ≤8 convention, not passed silently):** the house convention is
"≤8 rows" (`docs/specs/unit-import-batch-persist.md` §5.7's register-count paragraph,
`docs/specs/unit-u-shell-9b-cross-document-shared.md` §5.7), and this unit's §8 would be **9**. The
**ninth** row is `P-TP-3`, and the honest choice is between dropping it and declaring the exception:
**`P-TP-3` is KEPT and the exception is declared**, because the citation-discipline scan is **the carried
condition C10's only mechanization** and it is the one scan whose vacuity failure (`FS15`) is invisible in
every other row — dropping it would leave C10 asserted by nothing. If the PBT audit rules the ninth row
removable, the remedy is to **fold `P-TP-3` into `P-TP-1`** (both are total-scan rows over generated
populations) and record the fold in §11 — never to delete the assertions.

**Row budget total:** `100 + 100 + 60 + 40 + 100 + 80 + 100 + 100 + 100` = **680 ≤ 900** (9 × 100) and the
**declared ceiling is 900 = 9 rows × 100**, not the 400 ceiling the house's 8-row register implies — the
**400 ceiling is a convention over 8 rows, and this unit's declared bound is stated explicitly so no reader
reads "400" as this register's budget.** **Every row is ≤100, every row stops after 5 counterexamples, and
the counts above are DECLARED UPPER BOUNDS, never ran-case claims.**

**NOT over-strength (the audit's read).** Every proposition is observable from the pinned surfaces: the
generator's CLI, its derived fragment, its console report and its exit code. No row reaches into the
catalog's content (rows are read, never judged), none invents a return field, and none depends on the live
tree. A correct implementation passes every row; one that reads `src/`, writes outside the region, sources a
date from the filesystem, hard-fails an `anchor-token`, silently counts a stale row as a failure, stamps
`derived` on an authored token, rewrites a judgment cell, or passes a scan it never ran would fail.

---

## 9. The unit's own process, sequencing, and boundaries

### 9.1 Process (the mandatory cycle, in order — RCA-1/RCA-2/RCA-3/RCA-6/RCA-12)

1. **Spec → this file.** No TestWriter is delegated until this spec exists and the user's go-ahead is given
   (`AGENTS.md` item 9).
2. **TestWriter RED (recorded).** A TestWriter writes `tests/requirement-catalog-contract.test.ts` (§5) and
   the fixture set (§5.4) from **this spec only**, runs it, and reports the failing set. **The red set is
   recorded verbatim in the DONE row** (§10) — "RED: N failing (the module does not exist / the module
   exports nothing)" — per RCA-1. The red run must fail for the documented reason, never for a typo.
3. **Implementer GREEN.** The Implementer writes `scripts/catalog-derive.mjs` (least code that makes the red
   set green), re-runs the file, and reports the green set.
4. **READ-ONLY ADVERSARIAL pass (RCA-3).** A read-only adversarial reviewer hunts, at minimum: a run that
   reads `src/**`; a write outside the region; a date from the filesystem; an `anchor-token` hard-fail; a
   live-tree-coupled assertion; a vacuous scan; a judgment cell rewritten; a `provenance`/`direction` value
   claimed derived; a write during `npm test`; a fixture edited to make an assertion pass; and a hard failure
   that the CLI reports as a success. **Findings are recorded in this spec's §11**, each host finding fixed
   in the same pass with a regression pin, and a DONE row that cites no adversarial pass is a review
   finding.
5. **PBT AUDIT (read-only, over §8).** The audit re-reads every register row for over-strength and for
   generator coverage, and reports **`HELD` / `BROKEN` / `OVER-STRENGTH` per row** with the counts. Its
   verdict on the ninth-row exception (§8) is recorded in §11.
6. **The trio** — `npm test`, `npm run typecheck`, `npm run build` (`AGENTS.md` item 4) — is the item-4 gate.
   **Layer honesty (RCA-12, mandatory):** the trio's green here covers the **doc-tooling** layer only: the
   `.mjs` generator is **outside** `tsconfig.json`'s `include` (`src/**/*.ts`) and outside the esbuild
   entries, so **`typecheck` and `build` do not verify it at all** — its verification is the vitest file plus
   the trio's regression reading. **A green here is never app-green, envelope-green or behavior-green.**
7. **The MANDATORY documentation review (item 10d / RCA-6), recorded at
   `archive/reviews/<date>-unit-catalog-generator-doc-review.md`.** It reconciles: every name, signature,
   path and return shape in this spec + the `-greens` record against the code as landed; the §7 fail-state
   list against the implemented rules; the §8 register's `HELD`/`BROKEN` set and its counts; the active
   trackers (`docs/next-steps.md`, `docs/pending.md`, `docs/decisions.md`, `docs/defects.md`,
   `docs/HANDOFF.md`) against the build; the §5 test name's four live citations (§5.1) **and the
   `tests/catalog-derive-contract.test.ts` alternative recorded as NOT adopted**; the census claims of §13;
   the section numbers and cross-references; and **the §2.2 phantom-field defect** (§9.6). Stale entries are
   fixed in the same pass.
8. **The DONE row** (§10) states **which layer each verification covers** (RCA-12) and carries: the red set,
   the green set, the adversarial result, the PBT audit's per-row verdict, the doc-review record path, the
   trio reading **labelled a doc-tooling reading**, and the retired SCHEDULED row's disposition.

### 9.2 Sequencing (this unit's slot)

1. **This unit lands BEFORE the catalog's next amendment.** The trigger has fired (§status block); the
   generator's contract must be pinned before an amendment pass re-keys, adds to or re-derives the register,
   so the amendment is a **one-command re-derivation** afterwards rather than a hand edit.
2. **After it lands, a re-derivation is ONE COMMAND** — `node scripts/catalog-derive.mjs --as-of <date>
   --write` — and the catalog's **hand-computed self-digest is replaced mechanically** inside the region
   (§3.2 field 1).
3. **The landing order inside this unit** (mechanical): write the fixture → the test (red) → the generator
   (green) → run the trio → the adversarial + PBT audit → the doc-review → **then** the tracker rows (§10),
   because the tracker rows are themselves generator inputs and must be the LAST writer before any derive
   (`docs/specs/requirement-catalog.md` §6's landing order). A re-derivation is **not** owed by this unit's
   landing pass (the region may land empty with its markers, exactly as the artifact has it) — but if the
   pass does re-derive, the region's content is the derived fragment (§3.2).
4. **Not inside another unit's spec→red window:**
   `docs/specs/requirement-catalog-review.md` §8 C12's rule applies to this unit too — do not land inside an
   in-flight unit's spec→TestWriter-red window.

### 9.3 What this unit does NOT do

- It does **not** edit `docs/requirement-catalog.md` outside the sentinel region — not a cell, not a row, not
  a count, not the header's "6 MIRROR" prose, not the §C.6.2 digest line by hand (§2.2 resolves the phantom
  field as a **defect to be filed**, and the digest line's recomputed value lives in the region).
- It does **not** adjudicate a verdict, a freeze, a waiver, a merge or a conflict.
- It does **not** delete anything, anywhere.
- It does **not** resolve `code_anchor` symbols (§6) and does not read `src/**`.
- It does **not** schedule the later code-layer anchor check; it records the boundary only.
- It does **not** touch the O-0 oracle-hash pair, the O-0 spec/artifact records, `BLOCKS`/`MATRIX_ROWS`, or
  any MUST-NOT-EDIT corpus path (§9.4).
- It does **not** update `docs/skills/designing-pages.md` (**that file does not exist in this tree**; the
  only file under `docs/skills/` is `docs/skills/process-guardrails.md`), and it owes **no page-design
  artifact**: a command-line derivation tool and a text-analysis test are not page design, and there is no
  test-use-case coverage matrix and no demo-page index in this repo to update. **This is the same recorded
  conclusion** as `docs/specs/requirement-catalog.md` §7's last bullet and
  `docs/specs/unit-u-import-1-import-surface.md` §7's closing note.

### 9.4 HARD BOUNDARY — the paths this unit must not write (verified, not cautious)

| Path | Why |
| --- | --- |
| `src/**` | **No edit at all, and no read by the generator.** Any edit moves the bundle content hash and invalidates the recorded live provenance (RCA-11; the catalog contract's §2.5/MUST-NOT-EDIT rows). |
| `scripts/live-drive.mjs` | Half of the O-0 oracle identity (`o0OracleIdentity`; composite `92a74b7d`). **This unit must not touch a citation into it, add a block to it, or edit a byte of it.** |
| `src/shared/o0-report.ts` | The other half of the same oracle pair. **Same prohibition, and the generator must not read `src/**` at all** — so no pointer, `code_anchor` or scan in this unit may name a path under `src/` as something to open. |
| `docs/specs/unit-o-0-per-stage-breakdown.md`, `docs/specs/unit-o-0-per-stage-measurement.md`, `docs/specs/unit-o0-m1-m3-measurement-shape.md` | Parsed / byte-round-trip-verified by the live pins; the O-0 contract records. **Cite-never-edit.** |
| `docs/specs/ui-overhaul.md`, `docs/specs/user-flow-audit.md` | **IMPORT-CORPUS INPUTS** read by live tests with census + budget pins. The generator **reads** them (they are inputs, §4.1) and never writes them. |
| `docs/specs/user-flow-audit-checklist.md` | An input and the artifact's own three-column target; **read-only here** — this unit adds no column and edits no cell. |
| `docs/specs/requirement-catalog.md`, `docs/specs/requirement-catalog-review.md` | The catalog's contract and its historical gate-1 verdict. **Cite-never-edit** (the verdict record is a historical verdict, not a living doc). |
| `docs/HANDOFF.md` | The upstream-owed index is **counted, never asserted**; this unit adds no handoff row. |
| `docs/decisions.md`, `docs/defects.md`, `docs/pending.md`, `docs/next-steps.md` | Tracker writes belong to the landing pass's own rows (§10), never to the generator. |

**Mechanical proof owed by the landing pass (cheap).** Record the two O-0 oracle content hashes
(`src/shared/o0-report.ts`, `scripts/live-drive.mjs`) **before and after** this unit's landing pass and state
in the DONE row that they are unchanged — the same evidence shape the catalog's landing pass used
(`docs/next-steps.md` §CURRENT WORK / handover-state). **This unit cannot invalidate them by construction**
(it writes two NEW files plus the catalog's region and no other path), and the proof is what makes that
construction checkable.

### 9.5 The generator's relationship to the artifact it derives (one paragraph, so no reader re-derives it)

The generator is a **reader of the artifact and a writer of ONE region inside it**. It is not the artifact's
author: it cannot add a row, change a verdict, resolve a conflict, or repair a citation. Its derived fragment
is a **machine-view summary** of cells the artifact already carries, plus the counts and pointer-resolution
results a reviewer would otherwise compute by hand. The artifact remains ADVISORY, and the tracker remains
the sole status authority. **A regeneration therefore never "closes" anything** — it makes drift visible
(§3.6) and the census mechanical (C11).

### 9.6 The defect rows this unit's reading produces (recorded here; FILED by the landing pass)

**This unit files no defect row itself** — as with the catalog unit, the landing pass owns every tracker
write. Recorded here so nothing is dropped silently. **STATUS (updated 2026-09-21 by the
design-extensions item-10d documentation review): row (a) `CATALOG-MIRROR-COUNT-PHANTOM-FIELD` IS
FILED and OPEN in `docs/defects.md`** (with its symptom, evidence pointer and fix shape); **row (b)
`CATALOG-EXCLUDED-SPECS-FLOOR` remains RECORDED and NOT FILED**, because it is discharged by this
unit's own landing (§4.3 rule 2) and is therefore not a standing defect. The generator's write region
is pinned against the **field table's five MIRROR cells** either way (§2.2), so the filed row does not
block this unit.

| # | Row id the landing pass must use | Symptom | Evidence pointer (verified this pass) | Fix shape |
| --- | --- | --- | --- | --- |
| **(a)** | **`CATALOG-MIRROR-COUNT-PHANTOM-FIELD`** | The catalog contract and the landed artifact both claim **"6 MIRROR + 7 JUDGMENT"** while the authority table enumerates **five** MIRROR cells and **eight** JUDGMENT cells; §9.1 item 16 instructs a reader to count a **sixth MIRROR field** that does not exist. A generator cannot own a phantom cell, so the write region is unpinnable until the claim is corrected. | `docs/specs/requirement-catalog.md` §3.3's field table (the authority — five MIRROR rows out of thirteen) **vs** its status block + §3.3's MIRROR-marking paragraph + §8's schema census row + §9.1 item 16 **vs** `docs/requirement-catalog.md`'s header and §C.3's schema paragraph and landing-state paragraph (which enumerate five). **This unit's resolution is recorded in §2.2.** | Correct the prose to **13 fields = 5 MIRROR + 8 JUDGMENT** in the contract (an amendment) and in the artifact's header/§C.3/§C.6 prose (the artifact's NEXT amendment cycle, `600`–`799`-block bookkeeping per `docs/specs/requirement-catalog.md` §3.5.1 rule 5); **no register row is added, re-keyed or deleted by the correction**, and the generator's five-cell write region is already pinned to the table. |
| **(b)** | **`CATALOG-EXCLUDED-SPECS-FLOOR`** | The artifact records `excluded_specs` as **118 named (a FLOOR, by reason class)** and states that its `(LNS)` class is given **by rule rather than enumerated path-by-path**, with the full enumeration owed to this unit. Until then the "closed" partition over `docs/specs/**` is asserted by a rule with no counted membership. | `docs/requirement-catalog.md` §C.6.3's `excluded_specs` row + §C.6.4's closing "Recorded gap in this enumeration" paragraph + §C.6.4's partition rule. | **Discharged by THIS unit** (§4.3 rule 2 closes the gap by enumeration and reports the rule + the exclusivity, not the number). The row is filed so the floor is tracked as a recorded gap until the generator lands, and closed by the generator's own DONE row. |

**Rules for the two rows.** One row per defect, each OPEN at the top of `docs/defects.md`'s open table, each
with symptom / reproduction / root cause / fix shape; **the ids are new and must be verified absent before
filing**; and each newly-minted id is either linked from a catalog row's pointer or **waived by name in
`docs/requirement-catalog.md` §C.7** in the same pass — a newly-minted id that lands as an unwaived unlinked
id is the artifact's `FS18` class and this unit's `FS14` (`docs/specs/requirement-catalog.md` §6.7 rule 4 is
the precedent).

---

## 10. The landing pass — required writes and their exact shapes

**Landing order (mechanical):** fixture → test (red) → generator (green) → trio → adversarial → PBT audit →
doc-review → **the tracker rows below (the LAST writer before any derive)** → the two oracle hashes
before/after in the DONE row.

### 10.1 `docs/next-steps.md` — the DONE row (in §CURRENT WORK / handover-state)

Must carry: the unit name **`CATALOG-GENERATOR`**; the date; **the layer as DOC-TOOLING — the `.mjs` is
outside `tsconfig`'s include and outside the esbuild entries, so `typecheck` and `build` do not verify it and
a green here is never app-green** (RCA-12, stated in those terms); the landed files
(`scripts/catalog-derive.mjs`, `tests/requirement-catalog-contract.test.ts`,
`tests/fixtures/catalog-derive/**`); the **recorded red set** and the green set (RCA-1); the **adversarial
result** and the **PBT audit's per-row verdict**; the review record path
`archive/reviews/<date>-unit-catalog-generator-doc-review.md`; the **trio reading**, labelled a doc-tooling
regression reading; the two O-0 oracle hashes before/after (§9.4); the census/deduction pointers of §13; the
**DONE-of the two defect rows of §9.6** (or their OPEN state, each named); and **the one-command
re-derivation** (§9.2 rule 2).

### 10.2 `docs/pending.md` — the SCHEDULED row's retirement

The §SCHEDULED row (`docs/pending.md` §SCHEDULED, the deferred generator + contract test) is
**RETIRED**, not left as a COMPLETE/SCHEDULED row: its landed content's owner is the new
`docs/next-steps.md` DONE row, and the retirement follows the file's own head rule (a retired row is
**archived** under `archive/pending/<date>-<topic>.md` with the row verbatim, the retirement date, the owner
of the landed content, and every citation that had to be repointed) and is removed from the file. **Every
citation of the retired row is repointed in the same pass** (`AGENTS.md` item 6c) — including
`docs/specs/requirement-catalog.md` §3.12/§5.4/§6.2/§6.5's own references if the doc-review finds any that
read as a live SCHEDULED pointer.

### 10.3 `docs/decisions.md` — one ACTIVE row

Pins, in ONE row: **the generator is read-only by default and writes ONE span inside the catalog's §C.6
sentinel region; its write region is the FIVE MIRROR cells the contract's field table enumerates
(`id`, `capability`, `provenance`, `direction`, `last_verified`), of which `provenance`/`direction` are
carried as authored-passthrough rather than recomputed; `--as-of` is the ONLY date source; determinism is
proven against a committed frozen fixture and the live check is a NON-GATING staleness report; `code_anchor`
resolution stays ADVISORY at this layer; and no clause of the generator is app/envelope/store/live
evidence.** If any earlier row is contradicted, add a **SUPERSEDED** row in the same table — never a silent
deletion.

### 10.4 `docs/defects.md` — the §9.6 rows

The two rows of §9.6, filed OPEN at the top of the open table, each with symptom / reproduction / root cause
/ fix shape, ids verified absent, and the linkage-or-waiver rule of §9.6's closing paragraph.

### 10.5 The catalog (`docs/requirement-catalog.md`) — what MAY and may NOT change

**MAY change:** the bytes inside the §C.6 sentinel region, **and only if the landing pass chooses to
re-derive** (§9.2 rule 3 — the region may equally land empty with its markers). **MAY NOT change:** the
header, §C.0–§C.8's prose, every §C.3/§C.4 row cell, §C.6.1's fields, §C.6.2's digest lines, §C.6.3's
counts, §C.6.4's enumeration, §C.7's ledger and §C.8's log. **The phantom-field correction of §2.2/§9.6 (a)
is the catalog's NEXT amendment cycle's job, not this unit's.**

### 10.6 Files this pass MAY write (the complete list)

`scripts/catalog-derive.mjs` (NEW) · `tests/requirement-catalog-contract.test.ts` (NEW) ·
`tests/fixtures/catalog-derive/**` (NEW) · this spec (NEW) · `docs/requirement-catalog.md`'s sentinel region
(conditional, §10.5) · `docs/next-steps.md` (one DONE row + the queue/pointer repairs the retirement
requires) · `docs/pending.md` (the SCHEDULED retirement) · `docs/decisions.md` (one ACTIVE row) ·
`docs/defects.md` (the §9.6 rows) · the archive retirement file under `archive/pending/` · the review record
under `archive/reviews/`. **Nothing else**; every path in §9.4 is forbidden, and no `src/**` write exists
anywhere in this unit.

---

## 11. Findings from the unit's own passes (to be filled by the passes; structure pinned here)

**§11a Adversarial findings (`role_adversarial_reviewer`, read-only, RCA-3) — placeholders, filled at the
pass.** Each finding: id, severity, what it hunts (§9.1 rule 4's list), the fix (host-side, fixed here with
a regression pin) and its classification (`host` / `doc` / `package`). A **package** finding is a handoff
item (`docs/defects.md` + `docs/HANDOFF.md`) and **never patched here** (`AGENTS.md` item 7).

**§11b PBT audit (`read-only`, per row) — the table to fill.** One row per register row: `Ref | Class |
Invariant (short) | §8 | HELD / BROKEN / OVER-STRENGTH`, plus the audit's verdict on the ninth-row exception
and the per-row `cases_run` + counterexample counts. A `BROKEN` row's counterexample is recorded here (§8's
held/broken rule 3).

**§11c Documentation review (item 10d / RCA-6) — the reconciliation record**, with the review path
`archive/reviews/<date>-unit-catalog-generator-doc-review.md` and the list of every stale entry fixed.

---

## 12. Cross-references (no line numbers — this spec obeys the rule it enforces)

- **The catalog contract:** `docs/specs/requirement-catalog.md` §3.1 (sections + the non-authority rule),
  §3.2 (the closed 16 capabilities), §3.3 (the 13-field schema + the field table that governs §2.2), §3.4
  (the frozen vocabularies + citation discipline + `code_anchor`'s advisory rule 9), §3.5 (pointer
  addressing), §3.5.1 (the `PRUNE-###` blocks incl. the `600`–`799` AMENDMENT/FIX-PASS block), §3.5.2
  (straddles/merges), §3.5.3 (the owning-row test), §3.6 (verdicts/prune rules/freezes/stale), §3.7
  (conflicts/waivers/change log), §3.8 (the manifest, the digest, determinism rules 1–5), §3.9 (Artifact B's
  three columns), **§3.10 (the closure/census duty)**, §3.11 (the §C.x ↔ §n mapping), **§3.12 (this unit's
  carried clause set (a)–(f) + its hard boundaries)**, §5 (`FS1`..`FS24`), §6 (the landing writes/order),
  §6.7 (the corpus-defect-row precedent), §7 (cross-references incl. the "no page-design artifact owed"
  note), §8 (census/traceability), §9 + §9.1 (the pinned design points and the amendments, incl. item 16's
  `code_anchor` authority and item 26's amendment block).
- **The gate-1 record:** `docs/specs/requirement-catalog-review.md` §1 (verdict), §2 (the artifacts), §3.5
  (the tracker rows), §4 options (i)/(ii)/(iii) — **option (ii)'s rejection is why C2/C3 exist**, §5.2 (the
  oracle-identity hazard), §5.4 (sequencing, C12), §6 (R1–R14), §7 (reversibility), **§8 (C1–C13)**.
- **The artifact being derived:** `docs/requirement-catalog.md` §C.0 (the non-authority rules), §C.1 (the 16
  capabilities + the closure statements), §C.2 (the rollup + the counting rules), §C.3 (the 13-field rows),
  §C.4 (the ledger), §C.5 (the frozen vocabularies), **§C.6 (the manifest + §C.6.5 the sentinel region)**,
  §C.7 (conflicts/waivers/merges), §C.8 (the change log + the cooldown clock), and the closing
  "Provenance and process" block (the deferred-unit statement + the pinned test path).
- **The manifest skeleton / fill rules (staging, `[archive]`, never canonical):**
  `archive/catalog-authoring/2026-09-21/CL-7.md` `[archive]` §C.6.1–§C.6.5 (the manifest fields, the digest
  lines, the counts, the `excluded_specs` classes, the sentinel region), its B.1–B.3 (the checklist header
  rows + the restatement blocks) and its B.4 token table; plus `CL-3`/`CL-4`/`CL-5`/`CL-6` `[archive]` for
  the id blocks and the vocabularies. **Cited only here and never as canonical or as evidence.**
- **Trackers:** `docs/next-steps.md` §CURRENT WORK / handover-state + §OPEN (**the `D-GEN` trigger-gated
  row**) + §DONE · `docs/pending.md` head (the six vocabularies + the retired-row rule) + **§SCHEDULED (the
  row this unit retires)** · `docs/decisions.md` (the `ADVISORY-REQUIREMENT-CATALOG` row, the D-GP-UFA-1..4
  family, `REPORT-3-COMMITTED-AS-A-DOCUMENT`, `C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL`) · `docs/defects.md`
  §OPEN (incl. `LIVE-UF-ID-GAP-AND-TEN-DEFECT-ASSUMPTION` and the five 2026-09-21 catalog-filed rows) ·
  `docs/HANDOFF.md` (§OPEN handoff items).
- **Inputs:** `docs/specs/user-flow-audit-checklist.md` (head: the Coverage vocabulary + the NON-VERDICT
  METADATA block; §1–§14's 14 data tables; §15–§17) · `docs/specs/mcp-endpoint.md` §3 (the tool table) ·
  `docs/feature-requests/*` · the three report docs.
- **Code/doc anchors cited by SYMBOL only:** `scripts/live-drive.mjs` (`o0OracleIdentity`, `MATRIX_ROWS`,
  `O0_OPERATOR_DOCUMENTS`) · `src/shared/o0-report.ts` · `scripts/catalog-derive.mjs` (this unit's NEW file)
  · the import-corpus sites (`docs/specs/ui-overhaul.md`, `docs/specs/user-flow-audit.md`).
- **Process:** `AGENTS.md` items 1–12 + RCA-1..RCA-12 · `docs/skills/process-guardrails.md`.
- **Format conventions:** `docs/specs/unit-u-import-1-import-surface.md` §2/§4/§5.7/§6/§7 (the contract +
  register + cross-reference shape) · `docs/specs/unit-import-batch-persist.md` §4/§5.7 (the source-contract
  row + the declared-upper-bound attempt note) · `docs/specs/unit-o0-m1-m3-measurement-shape.md` §6 (S/FS
  shape) · `tests/live-drive-contract.test.ts` (the source-contract convention + the import-safety hazard
  note).
- **`docs/skills/designing-pages.md` does NOT exist in this tree** and no page-design artifact is owed
  (§9.3); there is no test-use-case coverage matrix and no demo-page index to update.

---

## 13. Census / numeric claims (this spec's own claims, and which are derived)

| Claim | Value here | Status |
| --- | --- | --- |
| New code files | **2** (`scripts/catalog-derive.mjs`, `tests/requirement-catalog-contract.test.ts`) | **asserted** |
| New fixture cases (§5.4) | **9** directories under `tests/fixtures/catalog-derive/` | **asserted** |
| The generator's write region | **1** file · **1** span (§C.6's sentinel region) | **asserted** |
| MIRROR cells the generator owns (§2.2) | **5** (`id`, `capability`, `provenance`, `direction`, `last_verified`) — of which **3** are `derived` and **2** are `authored-passthrough` | **asserted** (the field table is the authority; the "6 MIRROR" prose is the defect of §9.6 (a)) |
| JUDGMENT cells the generator never writes | **8** (`statement`, `status_pointer`, `evidence_pointer`, `owner_class`, `code_anchor`, `verdict`, `verdict_basis`, `prune_signoff`) | **asserted** (5 + 8 = 13, the contract's own field count) |
| `pointer_kind` values | **4** (`row-id`, `section-ref`, `anchor-token`, `none`) | **asserted** (the contract's §3.5) |
| Hard-failing pointer kinds | **2** (`row-id`, `section-ref`); `anchor-token` **warns** | **asserted** (C4) |
| `pointer_kind` per input (§3.4) | `row-id`: `docs/defects.md`, `docs/decisions.md` (titled rows), `docs/specs/user-flow-audit-checklist.md`, the catalog; `section-ref`: `docs/specs/mcp-endpoint.md` + ID-less decisions rows + §-addressed inputs; **`anchor-token`: `docs/next-steps.md`, `docs/pending.md`** | **asserted** (the id-less pair is the C4 fact) |
| The six tracker inputs | **6** | **asserted** (the contract's §3.6/§3.12 set) |
| Input set total (`docs/feature-requests/*.md`) | **a SET, count DERIVED per run** — **8** files at this authoring pass (the manifest enumerated **7**: `docs/feature-requests/design-extensions-2026-09-21.md` landed after the manifest was filled — the exact drift the set rule exists for) | **DERIVED — never pinned**; the manifest's 18-line block is **stale by construction** and the set rule (§3.2 field 2) is what the generator implements |
| Input set total (all paths) | **a SET, count DERIVED per run** — **20** distinct paths at this authoring pass (**6** tracker inputs incl. the catalog + `docs/HANDOFF.md` + **8** `docs/feature-requests/*.md` + **3** report docs + **2** import-corpus files; the manifest enumerated **18** + the 2 import-corpus files = 20 with **7** feature-requests, i.e. the same 20 before the eighth request landed) | **DERIVED — never pinned**, and the test asserts **membership of the resolved set**, never the number |
| Fail-states (this unit) | **18** (`FS1`..`FS18`) | **asserted** |
| The catalog contract's fail-states | **`FS1`..`FS24`** — **not** `FS1`..`FS26`; there is **no `FS25`/`FS26`** in `docs/specs/requirement-catalog.md` | **asserted (verified this pass)** — a citation of `FS25`/`FS26` is a dangling-citation-class defect |
| PBT register rows | **9** (`P-IM` ×2, `P-SM` ×4, `P-TP` ×3) — **one row over the ≤8 convention, declared (§8)** | **asserted (declared exception, justified)** |
| Attempt budget | **≤100/row · declared ceiling 900 (9 × 100) · stop-after-5 · seed `0xC47A1060`** — the **400** figure is the 8-row convention's ceiling, **not** this register's | **asserted (declared upper bound, never a ran-case claim)** |
| Conditions mapped | **C1..C13** (§14) | **asserted (complete)** |
| Risks mapped | **R1..R14** (§14) | **asserted (complete)** |
| Tracker rows written by this unit's landing pass | **1** DONE (`docs/next-steps.md`) + **1** retirement (`docs/pending.md` §SCHEDULED) + **1** ACTIVE (`docs/decisions.md`) + **2** defect rows (`docs/defects.md`, §9.6) = **5** writes across **4** files | **asserted** |
| Layers this unit's green covers | **1** (doc-tooling); **`typecheck` and `build` cover 0 of it** (the `.mjs` is outside `tsconfig`'s `include` and outside the esbuild entries) | **asserted (RCA-12)** |
| Defects this reading produces (§9.6) | **2** — `CATALOG-MIRROR-COUNT-PHANTOM-FIELD` and `CATALOG-EXCLUDED-SPECS-FLOOR` | **(a) FILED 2026-09-21** by the design-extensions item-10d documentation review (row OPEN at the top of `docs/defects.md`'s open table; the id was verified absent beforehand). **(b) still recorded, NOT filed** — it is discharged by this unit's own landing (§9.6 (b)) |

---

## 14. Traceability maps

**Condition → where it is pinned here.** C1 (split the gate; this is Unit 2, authoring against a landed
register) → the status block + §1 · C2 (de-couple the test from live prose) → §3.6 + §5.2 clause (a) +
§5.3 rules 1–2 + §5.4 · C3 (pin the time source) → §3.3 + §5.2 clause (a′) + §5.2 rule 6 + `P-SM-1` ·
C4 (the pointer schema) → §3.4 + §5.2 clause (b) + `P-TP-1` · C5 (the extended hard boundary: no
`src/**` edits, no O-0 pins/oracle edits, no `BLOCKS`/`MATRIX_ROWS` change, before/after hashes) → §9.4 +
§6.2 + §10.6 · C6 (the D-GP-UFA amendment) → not this unit's clause; §10.5/§10.6 keep the checklist and
`docs/specs/user-flow-audit.md` read-only · C7 (positive negative evidence) → the catalog's own contract;
**not mechanized here** (§7.2's "not mechanized" list) · C8 (tombstones) → not this unit's clause; the
generator deletes nothing (§9.3) · C9 (`code_anchor` layer honesty) → §6 + §5.2 rule 10 + §5.3 rule 6 ·
C10 (citation-discipline scope) → §5.2 rule 6 + `P-TP-3` + §7's `FS11` · C11 (census + input-set exactness) →
§3.2 fields 2/7 + §4.1/§4.3 + §5.2 clause (c)/(d) + `P-SM-3` · C12 (sequencing) → §9.2, esp. rule 4 ·
C13 (layer declaration) → the status block + §9.1 rule 6 + §10.1.

**Risk → containment here.** R1 (rot) → §3.6 (drift visible) + §3.7 (the regeneration obligation) ·
R2 (misuse as deletion authority) → §9.5 + §3.5 rule 2 (the generator cannot delete or edit a verdict) ·
R3 (a wrong "no user origin" claim) → §7.2's "not mechanized" list (the criterion is not the generator's
to run) · R4/R5 (the D-GP-UFA interaction) → §9.4 (the checklist is read-only here) · R6 (a second status
authority) → §3.4 rule 5 + §3.5 + §9.5 · **R7 (trio coupled to mutable docs) → §3.6 + §5.2 clause (a) +
§5.3 rules 1–3 + §5.4 rule 1** · R8 (`last_verified` breaks determinism) → §3.3 + `P-SM-1` ·
**R9 (`code_anchor` unverifiable at the doc layer) → §6** · R10 (the prune audit trail) → not this unit's
clause (it deletes nothing) · R11 (silent under-coverage) → §4.3 + §5.2 clause (d) + `P-SM-3` ·
R12 (oracle-identity / bundle-provenance invalidation) → §9.4 + the mechanical proof ·
R13 (line-number discipline collides with the trackers) → §3.4 rule 5 + §5.2 rule 6 + `P-TP-3` (the scan
binds **catalog-authored cells**, never the trackers' own citation style) · R14 (the doc-freeze ordering
trap) → §9.2 rule 3 + §10's landing order.

**The catalog contract's clause set → where it is mechanized here.** (a) byte-identity over a committed
frozen fixture → §5.2 clause (a) + §5.4 + `P-IM-1` · (b) pointer resolution with hard-fail/warn → §5.2
clause (b) + §3.4 + `P-TP-1` · (c) `counts` recomputed + every `docs/specs/**` path an input or excluded →
§5.2 clause (c) + §4.3 + `P-SM-3` · (d) the §3.10 closure tests → §5.2 clause (d) · (e) the
citation-discipline scan → §5.2 rule 6 + `P-TP-3` · (f) `last_verified` is `--as-of`-driven → §3.3 + §5.2
clauses (a′)/6 + `P-SM-1`. **Plus this unit's own clauses:** (g) hermeticity · (h) the source-text structural
pins · (i) the `code_anchor` shape-only limit.

---

## 15. Report to the supervisor (what the landing pass must be able to say)

- **Written:** `scripts/catalog-derive.mjs` + `tests/requirement-catalog-contract.test.ts` +
  `tests/fixtures/catalog-derive/**` + this spec; the catalog's §C.6 sentinel region **only if** the pass
  re-derived (§10.5); **five tracker writes across four files** (§10.1–§10.4) + the archive retirement + the
  review record.
- **Layer:** **DOC-TOOLING only — no app/envelope/store/live claim**; the `.mjs` is outside the typecheck and
  build legs, so **the trio verifies it only through the vitest file plus the regression reading** (RCA-12).
- **Gate:** spec → recorded TestWriter red → Implementer green → read-only adversarial + PBT audit →
  **the mandatory item-10d documentation review at
  `archive/reviews/<date>-unit-catalog-generator-doc-review.md`** → the trio as the item-4 gate.
- **Counts:** the §13 table, with the **DERIVED** entries (the input-set count, the closure counts, the
  `excluded_specs` count) reported as readings and never as pins.
- **Contract points decided here, each with its reason:** (§2.2) the MIRROR set is the field table's
  **five** cells and the "6 MIRROR" prose is a defect; (§2.3) `provenance`/`direction` are
  **authored-passthrough**, not derived; (§3.2 field 2) the input set is a **set**, not the manifest's
  18-line list; (§3.6) staleness is **non-gating** and never blocks a write; (§5.1) the test keeps its
  **already-pinned name** for referential integrity; (§8) a **ninth** register row is kept as a **declared
  exception**; (§7) fail-states restart at `FS1` per the repo's per-unit convention and the catalog contract
  has **`FS1`..`FS24`**, not `FS26`.
- **Deferred:** the `code_anchor` symbol-resolution check (a code-layer check, §6) and the catalog's own
  amendment cycle (§2.2/§9.6 (a)).
