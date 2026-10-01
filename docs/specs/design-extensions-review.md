# Change-Analysis Verdict + Gate Landing Record — the design extensions / clarifications input (2026-09-21)

- **Kind:** proposal-gate FINAL VERDICT (**step 4**, change-analysis) **and the gate's landing record**
  (`AGENTS.md` item 8) — the record that closes the proposal gate on
  `docs/feature-requests/design-extensions-2026-09-21.md` and either opens or refuses the spec gate.
- **Status:** **UNBLOCKED (2026-09-21) — the user has ruled on all four blocked questions (five
  rulings, §11).** *The status text below is **retained verbatim as the GATED record** (the state in
  which the step-4 verdict was issued) and is **addressed by the dated addendum immediately after
  it**; nothing in it is re-ruled, only superseded in status.* **GATED 2026-09-21 — VERDICT
  `PROCEED-WITH-AMENDMENTS` (split; `GN-1`/`GN-4` blocked on the user's answers).** Only **this
  passing record PLUS the user's go-ahead** may proceed to the spec gate; the `GN-*` parts may not
  proceed even then until the four questions in §10 are answered.
- **STATUS ADDENDUM (2026-09-21, appended by the SpecDoc pass — `docs/specs/design-extensions-review.md`
  is **not** on the `docs/specs/requirement-catalog.md` §2.5 MUST-NOT-EDIT list, so this amendment is
  legal):** the user answered **all four** questions of §10.3 and added a fifth ruling on the read model.
  The gate is therefore **UNBLOCKED (2026-09-21)**: the verdict stands `PROCEED-WITH-AMENDMENTS`, the
  `GN-*` block is **no longer blocked**, and the conditions that survive are the prerequisites (P2), the
  per-unit gates (§13), the `GN-2` per-item sign-off (§11.4) and the layer rule. **§11 records the five
  rulings verbatim**, §12 the read model, §13 the approved program, §14 the consequence table and the
  re-planned fences, §15 the closing status. **Nothing in this pass is app-green** — the layer is
  **DOC-LAYER / gate record** (RCA-12), unchanged from the line below.
- **Layer (RCA-12, mandatory):** **DOC-LAYER / gate record.** This file changes **no** `.ts` and no
  `.mjs` source, no `src/**`, no `scripts/**`, no `tests/**`, no tracker and no other spec. **Nothing
  in this pass is APP-GREEN, ENVELOPE-GREEN, STORE-GREEN or LIVE-GREEN.** The step-4 reviewer had
  read/search + doc-write tools only and **no shell**: every suite figure quoted here is a **reading**,
  never a claim, and no hash in this record was recomputed.
- **Input (the proposal under gate):** `docs/feature-requests/design-extensions-2026-09-21.md`
  (§1 verbatim user design input; §2 the itemization; §3 the candidate-collision table; §4 the status
  block that forbids cataloguing before the gate returns).
- **Reviewer:** the change-analysis agent (step 4). **This record is the step-4 deliverable; no other
  file was created or edited by this pass.**

---

## 1. THE INPUT AND ITS ID SET (the gate's working set)

**40 ids**, one per discrete statement, in ten groups (`docs/feature-requests/design-extensions-2026-09-21.md` §2):

| Group | Ids |
| --- | --- |
| Top-bar / outer frame | `TB-1` `TB-2` `TB-3` `TB-4` `TB-5` `TB-6` |
| Layout zones | `LZ-1` `LZ-2` `LZ-3` `LZ-4` `LZ-5` `LZ-6` |
| Panes | `PN-1` `PN-2` `PN-3` `PN-4` `PN-5` `PN-6` `PN-7` `PN-8` |
| Stage | `ST-1` `ST-2` `ST-3` `ST-4` `ST-5` `ST-6` |
| Tabs | `TAB-1` `TAB-2` |
| Doc-Nav | `DN-1` `DN-2` |
| Search | `SR-1` `SR-2` `SR-3` `SR-4` `SR-5` |
| Files | `FL-1` `FL-2` |
| Gnosis (the contract-changing block) | `GN-1` `GN-2` `GN-3` `GN-4` |
| Engineering / process | `EN-1` `EN-2` |

**The input's own §4 asserts no status, no verdict and no feasibility claim**, and forbids
cataloguing `GN-1`…`GN-4` as settled behavior before the gate returns **and** the user gives the
go-ahead. That instruction is **re-affirmed** by this record and is a condition of it (§9 C2).

---

## 2. THE FOUR-STEP CHAIN (verdicts + the raw records of the two spill-bearing steps)

| Step | Role | Verdict | Raw record |
| --- | --- | --- | --- |
| 1 | validity | **VALID-WITH-AMENDMENTS** | **no raw file exists** — the verdict is recorded here from the summary the supervisor supplied (accurate; see below) |
| 2 | critique | **PROCEED-WITH-AMENDMENTS** | `archive/reviews/2026-09-21-design-extensions-critique-raw.md` |
| 3 | architecture review | **PROCEED-WITH-AMENDMENTS — split three ways, with `GN-1`/`GN-4` blocked on the user** | `archive/reviews/2026-09-21-design-extensions-architecture-raw.md` (sections A–F) |
| 4 | change analysis (**this record**) | **PROCEED-WITH-AMENDMENTS** (verdict + conditions in §9/§10) | this file |

**Step 1's substance (recorded, since it has no file of record).** ~25 of the ~40 ids are already
catalogued behavior, already satisfied, or already scheduled; **only `GN-1`…`GN-4` (the MCP/authority
surface), `EN-2` (the catalog contract) and `ST-6` (a decision supersession) sit outside existing
shapes**; the `GN-1`…`GN-4` block is **NOT a valid basis for a spec as written** (it reverses ACTIVE
rows and re-asserts a transfer the prior gate rejected; its engine-absent clause is contradictory in
the literal reading); every undefined term must be pinned before a TestWriter red set exists;
`EN-1`'s causal claim is contradicted by the accepted O-0 measurement; and the id pair the user must
resolve first is **`GN-1` + `GN-3`/`GN-4`**.

**Step 2's substance (read in full; cited throughout).** The critique verified the reversal set
(`DECIDED: RAG-AUTHORITATIVE`, `DECIDED: SINGLE-WRITER-STORE`, `DECIDED: SINGLE-WRITER-STORE-PER-STORE`,
`DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT` — "EXTENDS `ARCH-GNOSIS-OFFLOAD` — supersedes NO row");
the engine-persists-nothing fact (`docs/HANDOFF.md` O-7 pointer row); `GN-2` as an unenumerated
mass-disposition over the non-prunable §C.4 ledger; `EN-2`'s frozen-vocabulary problem; the ~120-of-221
test-file import cross-section and the `tests/import-render-no-duplicates.test.ts` +
`tests/traversal.test.ts` fence; and the "two contract regimes in one landing pass" failure mode.

**Step 3's substance** is reproduced faithfully and completely in §3 below (sections A–F), because
§3 **is** the design a later SpecDoc derives each unit's spec from.

---

## 3. THE ARCHITECTURE'S SUBSTANTIVE RULINGS (A–F, faithful and complete)

> Source of record: `archive/reviews/2026-09-21-design-extensions-architecture-raw.md`. Where this
> section restates a ruling, it is the architecture's ruling, not a re-derivation.

### 3.1 A — gate scope: five classes, five artifacts

**The classification test (the class is decided by a rule, not by preference).** An id is
**contract-changing** iff satisfying it as written requires any of: (i) a new `SUPERSEDED` row against
an **ACTIVE** `docs/decisions.md` row; (ii) an amendment to a pinned contract clause
(`docs/specs/mcp-endpoint.md`, the frozen §C.5 vocabularies, the closed §C.1 16-capability partition,
the 13-field row schema); (iii) a reversal of a **frozen** behavioral pin whose owner is a landed unit
spec or a live oracle (`archive/tests/2026-10-04-unit-u-shell-3-collapsible-panes.test.ts`, `scripts/live-drive.mjs`); or
(iv) making a **local path depend on an external process's presence**, which
`DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT` forbids by name. `AGENTS.md` item 8's carve-out ("not to
fixes inside a documented contract's shape") is the escape valve for everything that fails the test.

| Class | Ids | Artifact owed |
| --- | --- | --- |
| **(i) Contract-changing — must land through THIS gate, each with its own supersession rows** | `GN-1` (reverses `RAG-AUTHORITATIVE` + `SINGLE-WRITER-STORE` + `SINGLE-WRITER-STORE-PER-STORE` + the `ASTROGRAPHER-SCOPE-REALIGNMENT` ruling, and via its persistence clause engages `ENGINE-ABSENT-DEGRADED-CONTRACT`); `GN-2` (mass disposition over the §C.4 39-row ledger, the four `invalidated-conflict` freeze carriers, and `docs/specs/mcp-endpoint.md`; §C.0 rule 2 forbids the catalog as a deletion authority at all); `GN-3`+`GN-4` **only in their joint as-written form** (spawn-on-not-found + "wiki can't be opened" reverses `ENGINE-ABSENT-DEGRADED-CONTRACT` and `GNOSIS-LAUNCHER-TOGGLE`); `EN-2` **if taken as a vocabulary change** (it becomes class (ii) doc-only in the forward-filing form of §3.4 D.2); `ST-1`+`ST-4`+`ST-5`+`ST-6` **as the `DECIDED: WHOLE-PAGE-EDITING` supersession carrier** (**no new gate**, but `SUPERSEDED` rows against `EDITING-MODE-SETTING` / `FORM-CONTROL-EDITING` are **owed at landing**); `LZ-1` (**spec item inside O-10/O-9**, not a new gate); `PN-7`+`DN-2` (**spec items inside the SCHEDULED O-9 unit — re-gating is forbidden**) | the gate landing (this file) + the per-id `SUPERSEDED`/ACTIVE amendment rows + (for O-9/O-10 items) an amendment paragraph in the owning unit's spec. **Nothing in (i) is delegated before its rows exist** (`AGENTS.md` item 9b) |
| **(ii) Inside a documented contract's shape — spec/unit only, no gate** | `TB-2`; `LZ-2`; `PN-2`; `PN-3`; `PN-4`; `PN-8`; `PN-1` (**with a hard sub-condition**, below); `ST-2`; `ST-3`; `TAB-1`; `TAB-2`; `SR-1`; `SR-2`; `SR-4`; `SR-5`; `GN-3`/`GN-4` **in the launcher-only framing** | one `docs/specs/unit-<name>.md` per unit (contract §3-style), a TestWriter red run, then the standard cycle |
| **(iii) Already satisfied — verification + tracker reconciliation only (no build unit)** | `TB-1` (nameplate left / controls right / tabs middle — `.app-nameplate` + `#tab-strip` + `titleBarStyle:'hidden'`/`titleBarOverlay`; catalog `PRUNE-101`); `TB-3` (drag-reorder landed — `TabStrip.reorder()`; catalog `PRUNE-148`); `TB-5` (**the *staying* half** — `#tab-strip` is a shell row OUTSIDE `#wiki-root`); `TB-6` (tagline on the landing page — `DECIDED: APP-BRANDING-IN-TOP-BAR`, catalog `PRUNE-102`); `LZ-3` (`grid-template-areas: "header header header" / "left main right" / "footer footer footer"` already spans all three columns); `LZ-4` (a sidebar's row spans header-bottom→footer-top by construction); **the static half of `LZ-5`** (`#wiki-root` is the stage's grid area) | a documented verification pass (**U-CHROME-VERIFY**) that states, per id, the landed artifact + the owning row, and writes **no** supersession, no spec, no red set (doc-layer; the `REQUIREMENT-CATALOG` DONE-row exemption shape) |
| **(iv) Already scheduled under another unit — re-express, never re-spec** | `TB-5` (staying half) + `LZ-6` + `LZ-5`'s stage-inset/scroll half → the open defects **`TABBAR-SCROLLS-AWAY`** + **`TOP-BAR-NOT-FIXED`** + **`PANE-NO-PLACEMENT-OR-SCROLLBOX`** as **ONE** unit; `PN-7` + `DN-2` → **O-9**(+O-3); `PN-5` + `LZ-1` → **O-10** + O-9's gesture surface (`PANE-SLOT-INSTABILITY-ON-DISCLOSURE` is O-10's live row); `PN-2` (+ `PN-5`'s "nothing else may affect size") → the unit **following O-10** (O-10 owns *order*, not *size*); `PN-6` → the PARKED **`FB-1`** (its runtime clause becomes an `FB-1` acceptance amendment); `LZ-2`/`LZ-3`/`LZ-4`'s **empty-zone caveat** → `EMPTY-ZONE-TRACK-NOT-COLLAPSED` / **`F-3`** (the `is-empty` → `0px` rules) | one re-affirmation row per owning unit + **at most one** amendment paragraph in that unit's spec; **no new spec, no new red set** — and per RCA-2 the owning unit's cycle is never merged with a new unit's |
| **(v) Future / parked** | `TB-4` (tab drag-out → new window — explicitly "Later feature"); `SR-3` (autocomplete/history — "future feature"); `FL-1`; `FL-2`; **`ST-1`'s live-markdown-formatting half** | `docs/pending.md` §SPECULATIVE rows with named revisit conditions (or a re-filing/repoint of the existing §SPECULATIVE rows for `FL-1`/`FL-2`), plus the tracker note that they are **not scheduled**. **No unit, no spec, no red set** |

**`PN-1`'s hard sub-condition.** Its visibility-menu clause is already ruled:
`DECIDED: C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL` ("the live requirement is
`PANE-VISIBILITY-IRREVERSIBLE`'s asked-for end state"), and its own X-1 resolution cell notes the
View→Panes submenu's only other consumer is `LIVE-12`. **So `PN-1` = (a) a provident-authored
import/disclosure pane in the top zone + (b) a *duplicate* import entry point, with the native
File→Import item retained** (a shell-chrome carve-out and a structurally non-exercisable surface per
`docs/pending.md` Unit U-IMPORT-1) **+ (c) the visibility half deferred to the C13-removal unit, which
must also amend `LIVE-12`.** `PN-1` **may not supersede the native menu item.**

**Named rulings that bind the whole input (A–C).** The existing corpus (**226 docs / 6 102 nodes /
9 266 edges**) has **NO migration story** → any future cutover owes a **named migration unit**; the
**multi-store registry stays ACTIVE** (`MULTI-STORE-REGISTRY`, `SINGLE-WRITER-STORE-PER-STORE`,
`FANOUT-INTERLEAVE-MERGE`; mapping the registry onto engine wikis is O-8/O-7 work); the
**security/operator stores stay host-owned** (`security-store`, `authority-store`,
`idempotency-registry`, `query-audit`, `OperatorSettings`, the vector cache — per
`docs/specs/astrographer-scope-realignment-review.md` §3.3's AUTHORITY/SECURITY SEAM row and
`docs/specs/mcp-endpoint.md`'s "host-side by contract"); the **MCP `edit` group and
`GNOSIS-CRUD-EDIT-GROUP` both stay ACTIVE** (`edit.set_content` becomes an alias only at a future
switch, via an amendment to `RAG-EDIT-MCP-GROUPS` + `MCP-UI-EQUIVALENCE` — **explicitly not implied by
`GN-1`**); and the **test fence** (`tests/import-render-no-duplicates.test.ts` +
`tests/traversal.test.ts`, "must stay green unchanged") is **EXEMPT BY NAME** and **may not be
re-derived by any `GN-*` unit** — a unit that cannot stay green under the fence is not a `GN-*`
implementation of `GN-1` but a **new proposal re-entering this gate**.

### 3.2 B — the precedence architecture for `GN-1`…`GN-4`

**The architecture is not "this is undecidable"**: it is **decidable in structure and blocked in one
place**, and the structure must be written BEFORE the user answers.

**B.1 The reading selected.** Select **the parked-destination reading with a candidate trigger,
expressed as one new ACTIVE decision row and a `BLOCKED-PENDING-USER` tracker row — not as
supersessions today.** Reject "supersede now" for three verified reasons:

> **⚠ SUPERSEDED BY USER RULING (2026-09-21) — `GN-1`.** *B.1 through B.3 below are the architecture's
> recommendation and its three verified reasons; they are **retained verbatim** — they are the record
> of the alternative and of the reviewer's reasoning, and their **facts still hold** (the engine
> persists nothing, O-8 is the prerequisite, the sync-read pin is load-bearing) **⟨CORRECTED 2026-09-28 (`X-7`): the *"the engine persists nothing"* fact NO LONGER HOLDS — the engine's own trackers record `D-D1`+`D-D2` DONE — LANDED-GREEN + ALL GATES RUN (2026-09-22) and `GR-7`'s trigger DISCHARGED (`../Gnosis/docs/next-steps.md` §DONE; `../Gnosis/docs/pending.md` `GR-7`; `docs/decisions.md` `DURABLE-STORE-LANDED`) — ENGINE-green, never app-green here, and UNVERIFIED LIVE from this repo. The O-8 prerequisite and the sync-read pin stand; the remaining engine conjunct is the PARKED INGEST/RECORD-COPY route (`GR-6a`). See §14.1 `C-1`.⟩** The **user has ruled
> `GN-1` "supersede now — engine owns document CRUD"**, which **overrides this recommendation's
> direction and its sequencing** while **adopting its prerequisite facts as the program's gates**
> (§11.1, §13 P2). Read B.1–B.3 as the rejected alternative, never as the current plan; `GN-3`'s
> launcher clause (B.3 clause 2) is **CONFIRMED** by the ruling and is **not** superseded. See §11.1
> for the ruling, its supersession targets, its consequences and what it does not decide.*
1. **The engine persists NOTHING today** (`docs/HANDOFF.md` O-7 pointer row, quoting the parked O-7
   constraints cell) — superseding `RAG-AUTHORITATIVE` now converts the operator's
   226-document corpus into a **restart-loss condition**. **⟨CORRECTED 2026-09-28 (`X-7`, the `W0` pass) — THIS FACT NO LONGER HOLDS: the engine's own trackers record `D-D1`+`D-D2` DONE — LANDED-GREEN + ALL GATES RUN (2026-09-22) and `GR-7`'s trigger DISCHARGED (`../Gnosis/docs/next-steps.md` §DONE; `../Gnosis/docs/pending.md` `GR-7`; `docs/decisions.md` `DURABLE-STORE-LANDED`) — ENGINE-green, never app-green here; the engine's durability is UNVERIFIED LIVE from this repo. The restart-loss condition STANDS on the corrected ground: no cutover has happened and the unsatisfied conjunct is the INGEST/RECORD-COPY route (`GR-6a`, PARKED, trigger UNDISCHARGED). This item's conclusion (do not supersede `RAG-AUTHORITATIVE` without the prerequisites) is UNCHANGED — only its stated premise is; see §14.1 `C-1` for the restated condition.⟩**
2. **O-8 is the track's PREREQUISITE, not a tail unit** (`docs/pending.md` §PARKED DESTINATION O-8;
   `docs/HANDOFF.md` O-8 pointer row; `docs/specs/astrographer-scope-realignment-review.md` §7.3(e)
   "O-8's authority-switch prerequisite remains unmet"). O-8's stated work *is* the
   `SINGLE-WRITER-STORE` amendment — so **the amendment belongs to O-8**.
3. **The sync-read pin is load-bearing**: `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT` pins `RagStore`
   reads **synchronous** (22 members, **13 sync reads / 9 async** — counted symbol-by-symbol in
   `src/main/rag-store.ts` `interface RagStore`, the source of record; the `16`/`6` figure this review
   originally carried was **counted wrong** and is corrected in this file, in `docs/decisions.md`'s
   provenance clause and in `docs/specs/unit-corpus-migration.md`; see §11.5, §12.2, §14.1 C-5) and
   **`createEngineCrudRagStore` is not
   a `RagStore`** — it is a separate 11-method document-CRUD interface. **No concrete type satisfies
   `GN-1` today.**

**The trigger.** `docs/pending.md`'s track trigger (c) reads **CANDIDATE-FIRED for the folder-row
disclosure only** (`traversal.build` 69.11 % / 69.34 % of the window) and **NOT for the document
open** (`reconcile.apply` 93.84 % of 2 222 ms; `traversal.build` 14.7 ms) — and the repo's own rule is
explicit: **"A CANDIDATE IS NOT A FIRED TRIGGER"**. `GN-1` therefore records the destination; it does
**not** fire a trigger.

**B.2 How it is recorded (the exact artifacts).**
1. **ONE new ACTIVE row in `docs/decisions.md`** (working name
   **`DECIDED: ENGINE-OWNERSHIP-DESTINATION-UNSCHEDULED`**) pinning: (a) the
   engine-owns-document-CRUD destination is **the parked O-6/O-7/O-8 track** and is **not scheduled**;
   (b) the prerequisites are **O-8 (authority switch / offline dual-path)** and **O-7 (engine
   persistence)** and they hold; (c) **`RagStore` reads stay synchronous** until an O-8 amendment says
   otherwise; (d) **`RAG-AUTHORITATIVE` / `SINGLE-WRITER-STORE` / `SINGLE-WRITER-STORE-PER-STORE` /
   `ASTROGRAPHER-SCOPE-REALIGNMENT` stay ACTIVE**; (e) `GN-1`'s persistence clause is recorded as **a
   stated destination, not current behaviour**; (f) `GN-2` is **archive-with-repoint only** over an
   enumerated set.
2. **ONE `BLOCKED-PENDING-USER` row** naming **`GN-1`/`GN-4`** and the four questions of §10.
   (`docs/pending.md`'s row vocabulary is closed to UPSTREAM/SCHEDULED/DEFERRED/PARKED/SPECULATIVE,
   so this goes in `docs/next-steps.md` as a blocking item; a `PARKED` row in `docs/pending.md`
   pointing at the ACTIVE decision row is the legal alternative. Either way **the row must exist before
   any catalog row references `GN-1`.** §8.1 P2 pins the placement.)
3. **`GN-2`'s disposition route**: an **enumeration-by-id** list, each item needing
   `prune_signoff:user-approved:<date>` **plus** its owning tracker row (§C.0 rule 2), executed as
   **archive-with-repoint** (AGENTS.md item 6 / `docs/specs/requirement-catalog.md` §3.6 shrink +
   tombstone: **the archive copy is not evidence; the git-visible tombstone is**). **Excluded by name**
   (each with its own recorded reason): `docs/specs/mcp-endpoint.md`; the security seam rows
   (`GNOSIS-SECURITY-CARVE-OUT`, `ENGINE-TRANSPORT-POLICY`, `IPC-SURFACE-NOT-GROUP-GATED`,
   `OPERATOR-ISOLATED-GRAPHSCOPE`); `docs/FORK-DIVERGENCE.md`; the **§C.4 39-row upstream-owed ledger**
   (`PRUNE-801`–`PRUNE-839`, including `PRUNE-838` the GR-7 durability row); the **four
   `invalidated-conflict` freeze carriers** (`PRUNE-100` X-15, `PRUNE-127` X-1, `PRUNE-152`/`PRUNE-375`
   X-14); and the parked O-6/O-7/O-8 rows. **Nothing in `GN-2` may be executed from the catalog's
   authority.**

**B.3 `GN-3`/`GN-4` land ONLY as a launcher amendment, with three mandatory clauses.**
- **Clause 1 — no boot refusal.** `GN-3`'s "launch if it can't find one" is a **best-effort launcher
  action**; `GN-4`'s "warn the user the wiki can't be opened" is the **typed-unavailable** surfacing
  `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT` already prescribes, **never** a refusal to open the local
  wiki. `ENGINE-ABSENT-DEGRADED-CONTRACT` and `GNOSIS-LAUNCHER-TOGGLE` **stay ACTIVE unamended**.
- **Clause 2 — WHO SPAWNS: the LAUNCHER.** `DECIDED: GNOSIS-LAUNCHER-TOGGLE` already records the spawn
  (`scripts/start-app.sh --mode=gnosis`, `$GNOSIS_SERVER_BIN`, `$GNOSIS_SERVER_PORT`, health-poll) and
  states "the shell remains a pure client; the launcher does the orchestration". **`src/` has no
  process-spawn capability anywhere** (the only `node:child_process` use is
  `execFileSync('curl', …)` in `src/main/embeddings.ts`, the ollama reachability probe). A shell-side
  spawn is a **new capability and a new security seam** and is therefore **its own gated proposal**,
  not a `GN-3` footnote.
- **Clause 3 — the amendment's own row.** A `DECIDED:` row amending `GNOSIS-LAUNCHER-TOGGLE` (or an
  appended provenance clause on it, the DEC-1 precedent) saying in terms: *"this amends the launcher's
  default; it supersedes no row and reverses no clause of `ENGINE-ABSENT-DEGRADED-CONTRACT`."*

**B.4 The adjacent surfaces (each must be NAMED in the row, not left implicit)** — the corpus ruling,
the multi-store ruling, the security/operator ruling, the MCP-edit-group ruling and the test-fence
ruling of §3.1 above, plus: `GN-1`'s "Astrographer persists no documents" must be **read as
documents**, never as these stores (the row must say so); and any cutover owes the **named migration
unit** with a rollback story.

**B.5 The smallest set of user questions** — reproduced verbatim in **§10** below.

### 3.3 C — the unit decomposition (execution order; C1/C2 are doc-layer and precede everything)

**The already-gated queue `O-0 → O-5 → O-9(+O-3) → O-10 → O-1 → O-2`** (`docs/specs/astrographer-scope-realignment-review.md`
§7.1; `docs/next-steps.md` NEXT QUEUE, **re-numbered after the ninth run: O-5 leads**) **is NOT
re-opened by anything below.**

| # | Unit | Ids | Class | Order / dependencies | Collision discipline |
| --- | --- | --- | --- | --- | --- |
| **C1** | **U-PROCESS (`EN-2` forward rule)** | `EN-2` | doc-process | **FIRST.** It changes the criterion by which every later row is filed, and it is the pass that **fires the deferred generator's trigger**. | None (no `src/`). `EN-1` is recorded as **contradicted by the accepted O-0 measurement** — a note, not a rule. |
| **C2** | **U-CHROME-VERIFY** | `TB-1`, `TB-3`, `TB-6`, `LZ-3`, `LZ-4` (+ the `LZ-5` static half) | doc-layer verification | Second. **Cheapest; zero code.** Produces the verification table + owning-row pointers; no supersession (already-satisfied, not reversed). | None. Touches no pin O-9/O-10 owns. |
| **C3** | **U-GN-CHECKPOINT** | `GN-1`…`GN-4` structural carrier | doc/gate | **Immediately after C1**, before any catalog row for `GN-*`. Produces the ACTIVE destination row + the `BLOCKED-PENDING-USER` row + the `GN-2` enumeration/exclusion list (§3.2 B). | Blocks `DN-1` only. Writes no supersession O-9/O-10 touch. |
| **C4** | **U-CHROME-PIN** (the top-bar/scroll unit) | `TB-5` (staying half), `TB-2`, `LZ-6`, `LZ-5` (inset/scroll half) | assembled/shell + CSS | After C2. **One unit — not one per id.** `TOP-BAR-NOT-FIXED` + `TABBAR-SCROLLS-AWAY` + `PANE-NO-PLACEMENT-OR-SCROLLBOX` share one root ("the page, not the stage, is the scroll container") and one fix shape; `TB-2` rides it. | Lands BEFORE `LZ-6`'s scroll-container move is claimed by any other unit. Does not touch `#wiki-root`'s grid tracks ⇒ no O-9/O-10 pin collision. Watch: the scroll-container change touches `archive/tests/2026-10-04-renderer-empty-zone-track.test.ts`-class pins; if a pin moves, it moves as **this** unit's re-derivation. |
| **C5** | **U-ZONES** (amendment to the O-9/O-10 track) | `LZ-2`, `PN-2`, `PN-5` | assembled/CSS + persisted operator state | **AFTER O-10 lands.** Delivered as **two spec items inside the O-9/O-10 unit specs**, each with its own red set under that unit's cycle — **not** a new unit that would run two units over one pin set. | **The collision-avoidance device**: `LZ-1`/`PN-5`'s gesture half is the same surface O-9's pin set re-derives and O-10 owns. |
| **C6** | **U-PANE-STRUCT** | `PN-6` | decomposition (`FB-1`) | **PARKED into `FB-1`**: the structural clause becomes an `FB-1` acceptance amendment; the runtime "universal features once" clause becomes an `FB-1`-scoped spec item. | Avoids two rewrites of `src/renderer/sidebar-panes.ts` (3 670 lines) + `pane-graph.ts` (1 750); `FB-1`'s constraint is byte-identical rendered/export output with a frozen public/MCP contract. |
| **C7** | **U-PANE-GESTURE** | `PN-3`, `PN-4`, `PN-8` | assembled/pointer + renderer | After O-10 (drop-target resolution is slot-order-dependent). Medium, self-contained. | `PN-3` builds on `PRUNE-600`'s relocation behavior and `PANE-DRAG-HEADER-ONLY`; an amendment paragraph, not a new authority. `PN-8` is CSS stacking/`pointer-events`. |
| **C8** | **U-STAGE-TYPE** | `ST-2` | envelope + renderer | Independent, cheap-medium. | Capability **`EDITING-RICH-TEXT`** — **no new capability** (the 16-capability partition is closed). |
| **C9** | **U-EDIT-1 (the `WHOLE-PAGE-EDITING` unit)** | `ST-1` (non-live-markdown half), `ST-3`, `ST-4`, `ST-5`, `ST-6` | **the biggest unit** — store + envelope + renderer | **Spec re-derivation first**; lands the `SUPERSEDED` rows against `EDITING-MODE-SETTING` + `FORM-CONTROL-EDITING` **in the landing pass**. `ST-4` must name the **in-house** module `src/main/rich-decompose.ts` `decomposeRichHtml` (not "the provident-editable import tools"). | Writes no shell pin O-9/O-10 owns. Must respect `PROJECT-JOURNAL` / `C16-CONSUMES-PROJECT-JOURNAL` (commit = one `applyBatch` = one invertible `batch` entry). |
| **C10** | **U-TAB-MERGE** | `TAB-1`, `TAB-2` | envelope + renderer + store | **STRICTLY AFTER C9.** **`TAB-2`'s conflict predicate is SPEC-FIRST; no code until the predicate is pinned** (a wrong predicate silently corrupts documents). `TAB-1` is cheap and separable *within* the unit (its own red→green), never merged. | None. |
| **C11** | **U-SEARCH** | `SR-1`, `SR-2`, `SR-4`, `SR-5` | renderer + shell accelerator | After C4. `SR-5` must be decided **with** `FIND-IN-PAGE-NOT-WIRED` — **one owning row, one Ctrl+F meaning**. `SR-4` is likely UI-only (`targetDocumentId` already exists). | **Matrix discipline:** the §5.U matrix is **capped at 8 and FULL** — a live assertion must **re-pin an existing row or enter as an extended row**, never claim a slot. |
| **C12** | **U-DOCNAV-LISTEN** | `DN-1` | **BLOCKED on C3** | Blocked on `GN-1`'s answer *and* on GR-5. Engine reading: it needs the engine's **store-change notification route** (the shell "must not invent" it) and parks with that reason. Parked reading: a **local** refresh path (poll / boot+focus / `lastDocHeads` extension) and a normal unit. | `DOC-NAV-NOT-A-TREE`'s root is `path: []` in the store; `GN-1` supplies no path segments. |
| **C13** | **U-FILES** | `FL-1`, `FL-2` | future | **PARKED.** No unit. | Re-file/repoint to the existing §SPECULATIVE rows with revisit conditions; do not schedule. |
| **C14** | **U-PARK-NOTES** | `TB-4`, `SR-3`, `ST-1` (live-markdown half) | future | **PARKED** with named revisit conditions. | None. |

**RCA-2 holds by construction: one unit = one spec, one red run, one green, one adversarial pass, one
doc review, one DONE row.** Nothing here shares an inline run with a sibling.

### 3.4 D — catalog / tracker integration

**D.1 How the input enters `docs/requirement-catalog.md`.**
- **Only after the user go-ahead** (the input's own §4; §C.0 rule 1 makes a `verdict` cell readable as
  settled).
- **New rows go in the `PRUNE-600`–`PRUNE-799` AMENDMENT / FIX-PASS block**, with the three rule-5
  duties: change-logged in **§C.8**, counted in **§C.6.3 `counts`**, ids **never reused and never
  renumbered** (the `600`–`603` rows are the precedent; the `100`–`599`/`800`–`899` blocks are closed
  to this pass).
- **No new capability** — the §C.1 partition is closed at 16. Mapping: `ST-2` → `EDITING-RICH-TEXT`;
  `PN-3`/`PN-4`/`PN-8` → `PANES`; `SR-4`/`SR-5` → `SEARCH-RETRIEVAL`; `TAB-2` → `TABS`; `TB-2` →
  `SHELL-CHROME`; `LZ-2` → `LAYOUT-ZONES`; `DN-1` → `DOC-NAV-TREE`.
- **MIRROR cells stay hand-authored + PROVISIONAL** (`derivation: hand-derived`, `derived:false`,
  `generator:<none>`), with `as_of` + input digests re-stamped per §3.8 — the §C.6 sentinel region is
  the **deferred generator's only write region**. An unmarked hand-written MIRROR cell is `FS4`.
- **§C.7 gains at most two conflict entries**: (a) **`GN-1` vs the ownership rows** — a *new* conflict
  only if the user **reverses**; in the parked reading it is the **continuation of the existing
  `X-11`** (the engine-owned heavy-work requirement vs the accepted structural gap, whose resolution
  cell already reads "the amendment is a scoping one — the engine-owned path is the parked
  destination"); (b) the **`PN-7`/`DN-2` collapsed-body pin vs the pure-`hidden` ask** — an
  `X-14`/`X-15`-class **tracker/unit-spec vs ask** conflict (neither authority governs), resolved by
  the **item-10d documentation reviewer via an O-9 spec amendment**, never by the catalog.
- **§C.7.2 waiver ledger**: every tracker id this pass mints must be **waived by name in the same
  pass** that creates it, or it is **`FS18`** (unwaived new id).
- **§C.4 stays UNTOUCHED** — nothing here is upstream-owed. The only §C.4-relevant fact: `GN-1`'s
  blocker rows (`PRUNE-838` the GR-7 durability row; the O-7/O-8 pointer rows) sit in the
  **non-prunable 39-row set** and may be **cited, never edited**.

**D.2 What `EN-2` amends in `docs/specs/requirement-catalog.md` — ONE amendment entry, and nothing
else.**
- It amends **no catalog cell** and **reclassifies no existing row**.
- **§C.5 vocabularies stay FROZEN** — `EN-2` introduces **no token** (6 provenance / 6 direction / 10
  owner / 5 verdict). It is therefore **not** a provenance or direction change and does **not** drive
  performance-complaint rows to `n/a` (which §C.5's R-A rule forbids on any `user-*` row, enforced by
  `FS20`).
- **The amendment's text = a forward-filing duty with three mandatory clauses** (a *filing-time* duty,
  verified at item 10d, deliberately **not** a mechanical check — §3.12's clause set (a)–(f) is the
  deferred test's checkset and must not be widened silently): **(i)** a **falsifiable, user-visible end
  state** (a D-class + oracle per `docs/specs/user-flow-audit.md` §3; the §5.U matrix is full, so an
  **extended row**; a `proxyPASS:true` is invalid per `DECIDED: D-GP-UFA-2`); **(ii)** an **owning
  tracker row**; **(iii)** a **live measurement** (`realInput:true`, painted geometry for any
  `D-visual` claim, per `DECIDED: D-GP-UFA-3`). **No promotion of a complaint into a requirement, and
  no demotion of one below it, without all three.**
- **No existing row is reclassified** — in particular **`PRUNE-129`** (`PANE-TOGGLE-FULL-REASSEMBLY`,
  `user-verbatim`, frozen at `keep-advisory` on a dangling-citation lineage) **keeps its freeze**;
  lifting it would make the row `escalate-prune`-eligible and hand `GN-2` a mechanism for retiring a
  live-measured user defect (1 011 ms document open; 505 ms folder disclosure) — the RCA-11/RCA-12
  failure mode.
- **§C.8's binding rule for future rows**: the `EN-2` clause is cited by the new rows it governs and
  by the next pass's change-log entry.
- **`O-5` is unaffected** — it remains the mechanism that turns a complaint into an enforced
  requirement, and `EN-2` neither removes its criterion nor closes its gate.
- **`EN-1` is NOT a catalog rule and must not be filed as one.** Its causal claim is **contradicted by
  the accepted measurement** (`reconcile.apply` 93.84 % of the document open; the pane-toggle profile's
  small JS self-time) and "unnecessary changes" is undefined. It is recorded as a **REJECTED causal
  reading** with the measurement pointer — **not a row**.

**D.3 What the item-10d documentation review must re-derive afterwards.** (1) the manifest counts in
§C.6.3 (`tier2`, `tier2_prunable_verdict`, `upstream_owed`, `checklist_rows`) — **recounted, never
copied** (count drift has already cost **two fix cycles**, per the catalog's own §C.8 C2/C3);
(2) every new pointer resolves (`status_pointer` against the §3.5.3 owning-row test / `FS24`;
`evidence_pointer` against the token it claims — the `GN-*` rows must resolve against the new ACTIVE
row + the `BLOCKED-PENDING-USER` row, since a pointer to a nonexistent
`DECIDED: GNOSIS-AUTHORITATIVE` would be an `FS8`-class phantom filed across ~20 ids); (3) the new
§C.7 entries + the waiver ledger (every minted id waived by name); (4) §C.4 **membership** of the rows
citing the O-7/O-8 pointer rows (cited, never counted, never edited); (5) the **`PN-7`/`DN-2` conflict
carried to O-9's spec as an explicit accept criterion**, including `APP-GRAPH-PANES-MCP-VISIBLE`'s
reading of a *collapsed* pane (today's pin makes the body **absent**, not hidden); (6) the review
record appended at **`archive/reviews/<date>-design-extensions-doc-review.md`**.

**D.4 The deferred generator's trigger — YES, this track fires it, and the owner must be named.**
`docs/pending.md` §SCHEDULED and `docs/specs/requirement-catalog.md` §3.12/§6.2 fix the trigger as
"**the FIRST prune-candidate request OR the FIRST tracker row edited after the catalog lands —
whichever comes first**". The `REQUIREMENT-CATALOG` DONE row in `docs/next-steps.md` **is** a
tracker-row edit after the catalog landed, and this input's cataloguing pass writes 5+ more.
- **Verdict: the trigger HAS ALREADY FIRED (on the catalog's own landing pass — before this input's
  landing pass).**
- **Owner: the `role_documentation_reviewer` of whichever pass first reports the trigger as fired**,
  recorded in `docs/next-steps.md` + the catalog's §C.8 change-log row — and **the generator's own
  spec must be authored BEFORE this pass's catalog amendment lands**, or the generator would encode a
  criterion (`EN-2`, `GN-2`) that had not been adjudicated when it was written.
- **Sequencing consequence:** C1 (`EN-2`) and C3 (the `GN` checkpoint) must land **before or with** the
  cataloguing pass, and the cataloguing pass must be **ONE atomic tracker-writing pass**, so the
  trigger is observed **once** rather than re-read per unit.

### 3.5 E — verification per unit class (RCA-12 layer + RCA-11 live + red-set shape)

| Unit class | Layer (RCA-12) | Live battery (RCA-11) | The red set must contain |
| --- | --- | --- | --- |
| **C1 U-PROCESS, C3 U-GN-CHECKPOINT, C2 U-CHROME-VERIFY, the D.4 generator spec** | **DOC-LAYER / ADVISORY** (the `REQUIREMENT-CATALOG` precedent: no test, no §5.x register — a **recorded** zero-row exemption, not a silent default; **no trio obligation**, trio as a regression *reading* only) | **N/A — no app surface at all; parking language must not be used** | Nothing is owed. Verification = the **read-only adversarial pass** (missing user statements, mis-tiered provenance, phantom citations, copied status text, line numbers, `archive/**` used canonically, unwaived unlinked ids, `X-`-class contradictions) + the item-10d review + **the `src/shared/o0-report.ts` + `scripts/live-drive.mjs` oracle-hash before/after** |
| **C4 U-CHROME-PIN** | **assembled / shell-CSS + window** — the dom-shim is layout-less/CSS-less, so `-webkit-app-region`, `position: fixed/sticky` and scroll geometry are **structurally unassertable in node** | **MANDATORY** (`scripts/live-drive.mjs`, proven harness: spawn mode + CDP + MCP, census 226) | Node: a **source-contract** red for the drag-region selectors + a DOM-shape assertion for the shell row. **Live (the discriminator):** scroll-invariance (after `scrollTo(0,N)` the strip's box stays in the viewport), scrollbar-geometry (the page scrollbar does not paint across the bar), `overflow-y:auto` on the pane body and on the zones/stage rather than `body`. **Assert the painted box, never computed-style alone** |
| **C5 U-ZONES** (O-9/O-10 amendment) | assembled/CSS + **pure** persisted state (`layout-state.ts` projections, `UI-CONFIG-CARRIER` serialization) | **MANDATORY** — `PN-2`'s "the size needed to present it without a scrollbar" is a **painted measurement** with no node oracle | Node: the size-control → custom-property write path; the "nothing else changes a pane's size/zone" invariant under re-derive/disclosure. Live: the default size is the **lesser** of half the previous empty space and the no-scrollbar size (bounding-box + `scrollHeight === clientHeight`, painted); the slot/order census does not move |
| **C6 U-PANE-STRUCT (FB-1)** | pure moves / byte-identical output | **No new battery** | `FB-1`'s own acceptance: a **frozen public-method/MCP snapshot + dependency-direction + rendered-output byte-equivalence** red set; the move's red fails because the target folder does not exist |
| **C7 U-PANE-GESTURE** | **pure** (drop-target/ghost geometry) + **assembled/pointer** (capture, painting) | **MANDATORY** for the painted ghost + the abort | Node: ghost/drop-target per slot order; right-click ⇒ pre-drag order **and** zone restored; the 4 px threshold honored. Live: a real hit-tested drag paints a ghost at the prospective slot and the layout rearranges; **the spec must pick the cancelling event** and define the overflow-menu timing; `PN-8` must not swallow a body control's click |
| **C8 U-STAGE-TYPE** | envelope + renderer | Recommended | Node: the control exists as a **provident-authored** node (a UI element outside the graph is a review finding); the handler applies the type to the caret's element or the selection; the write is **`setType`-class** (never delete+create; id/content/children preserved) |
| **C9 U-EDIT-1** | **store + envelope + assembled/renderer** — the largest cross-layer unit | **MANDATORY** (commit-on-blur against a real contenteditable) | Node: the diff granularity (which fields); a newly typed paragraph has no node to diff against — the **structural** representation must be pinned; the commit lands as **ONE `applyBatch`** with a single invertible `batch` journal entry (**coarse-vs-fine undo is an explicit decision**); a failed commit leaves the store unchanged and surfaces a **user-visible** warning; the heading blur writes the `doc-head` node and **preserves `data-doc-head`** (`setProps` merges for exactly this reason); textarea editors are **absent**. Live: whole-page selection spans paragraphs; heading→body caret movement with the arrow keys; the warning symbol survives a re-derive |
| **C10 U-TAB-MERGE** | pure (predicate) + assembled + store | **MANDATORY** (two tabs over a live store) | **A spec-first predicate red set BEFORE any code**: the conflict identity (same **RAG element** and same **field**; subtree-root vs children-offset **pinned, not implied**); a three-state dirty machine (clean / uncommitted / commit-failed) with the trigger for each; a defined **"no merge attempted"** outcome and what it does to the store; behaviour when the contained document is **deleted/archived** in the store |
| **C11 U-SEARCH** | renderer + shell accelerator | Recommended → mandatory for the Ctrl+F surface | Node: the mode matrix (in-pane vs in-tab × in-document-only vs global × `stores:"all"` × the advanced-search args — **in-pane shows only the document name**); `SR-4` expressible via `targetDocumentId`. **`SR-5`'s red is authored on the `FIND-IN-PAGE-NOT-WIRED` owning row**, with the selection-copy rule pinned. One Ctrl+F meaning, one row |
| **C12 U-DOCNAV-LISTEN** | main-process IPC + renderer | Recommended | **Parked reading:** pin the **local** refresh trigger + the `rag-doc-heads` path, with `ENGINE-ABSENT-DEGRADED-CONTRACT` explicitly satisfied. **Engine reading:** no red set exists until GR-5 lands — the unit is **parked with the recorded reason**, never parked by default |
| **C13/C14 parked ids** | — | — | Nothing. Their artifact is the §SPECULATIVE / PARKED row **with its named revisit condition** (a parked row without one is a review finding) |

**Cross-cutting, every code-bearing unit:** trio (`AGENTS.md` item 4) after the change; **RCA-3
adversarial** (read-only, recorded in the unit spec's §3a/§3b; host findings fixed here, package
findings → `docs/defects.md` + `docs/HANDOFF.md`); **RCA-4 blind greens** by an agent who did not
implement; **item-10d doc review** with the record at `archive/reviews/<date>-<unit>-doc-review.md`;
and the DONE row states **which layer** each verification covers and the **recorded red set** (RCA-1).

### 3.6 F — the architecture's verdict, its conditions, and what it must NOT do

**F.1 Verdict: `PROCEED-WITH-AMENDMENTS — split three ways, with `GN-1`/`GN-4` blocked on the user.**
- The **~35 non-Gnosis ids are NOT one work program**: 5 are already satisfied (verification only), 9
  are already scheduled under `O-9`/`O-10`/`FB-1` (re-express, never re-spec), 4 are future/parked,
  and the remainder decompose into **8 code-bearing units + 1 doc-layer verification pass**, with
  `TAB-2` strictly after `ST-4`, `PN-6` folded into `FB-1`, and `DN-1` blocked.
- **`GN-1`…`GN-4` are not a design to implement but a precedence question to adjudicate and a
  destination to record.** Answer: record the destination, keep the ACTIVE rows, hold the O-8/O-7
  prerequisites, hold the sync-read pin, exempt the test fence by name, exclude the
  security/MCP/multi-store surfaces by name, and ask the user the four questions (§10).
- **`PN-7`/`DN-2` are O-9 spec items under a closed gate, not new units.**
- **`EN-2` is a one-entry spec amendment** (forward-filing rule, three clauses, **no token, no
  reclassification**); **`EN-1` is a rejected causal reading, not a row.**

**F.2 The architecture's conditions (8).**
1. **The `design-extensions` gate landing must exist before any spec or catalog row** (`AGENTS.md`
   item 8; the input's §4). `docs/specs/design-extensions-review.md` did **not** exist in the tree —
   step 1's summary had no file of record — so the landing pass must create it and record
   validity/critique/architecture/change-analysis together. **(Discharged by this file.)**
2. **`GN-*` must be recorded in the state that exists** — ACTIVE destination row +
   `BLOCKED-PENDING-USER` row — **before any catalog row cites them**, and every `GN-*` catalog row's
   `status_pointer` must resolve.
3. **`PN-7`'s MCP-visibility clause is an explicit accept criterion in O-9's spec**, and that spec
   must resolve today's opposite pin (`archive/tests/2026-10-04-unit-u-shell-3-collapsible-panes.test.ts` §3.2: collapsed
   ⇒ the body marker is **ABSENT**; its own comment records that a CSS-only `display:none` reading was
   deliberately **not** pinned).
4. **`ST-4` must name `src/main/rich-decompose.ts` `decomposeRichHtml`**, not "the provident-editable
   import tools" (`DECIDED: RICH-TEXT-EDITING-GATE` records the package plan was replaced in-house).
5. **Every undefined term the two reviews named gets a spec definition before its unit is delegated** —
   `LZ-1` "if possible"; `PN-2` "the size needed to present it without a scrollbar"; `PN-3` "ghost";
   `PN-5` "deliberate"; `PN-8` "as long as they keep focus/mouseover"; `ST-3` "visually divided";
   `ST-5` "failure to commit"; `TAB-2` "diffs include same element"; `DN-1` "listen to Gnosis"; `SR-1`
   "unless the search has been opened in a tab already"; `SR-5`'s selection rule; `TB-2`'s drag-region
   vs tab-drag boundary.
6. **The `FL-1`/`FL-2` re-filing must be a repoint, not a second §SPECULATIVE row set** (item 6c:
   never leave a citation pointing at a moved/absent row).
7. **The `EN-2` amendment + the `GN` checkpoint precede the cataloguing pass, and the cataloguing pass
   is ONE atomic tracker-writing pass**, because the deferred generator's trigger is already fired and
   must be observed once.
8. **The `PN-1` visibility half is subordinated to `C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL` +
   `LIVE-12`**, and `PN-1`'s import half keeps the native File→Import item.

**F.3 What the architecture explicitly must NOT do (10 items — reproduced verbatim in force).**
1. **Must NOT catalogue `GN-1`…`GN-4` as settled** — no `keep`, no `invalidated-conflict`-without-a-
   conflict, no "the engine owns the store" inside a `statement` cell, and no 20-row set whose
   `status_pointer` resolves to a decision row that does not exist.
2. **Must NOT schedule the future ids** (`TB-4`, `SR-3`, `FL-1`, `FL-2`, `ST-1`'s live-markdown half) —
   and must not let them enter the NEXT QUEUE by being catalogued.
3. **Must NOT let a plan unit run over two contract regimes** — no unit spec'd against
   local-authoritative assumptions while its neighbour is spec'd against engine-authoritative ones
   (the RCA-2 failure mode scaled up; the concrete hazard is `ST-4`/`TAB-2` over a commit path the
   scope-realignment record excludes **by name**: "commit-on-blur editing cannot be async-chunked
   behind an engine hop").
4. **Must NOT re-open a closed gate.** `PN-7`/`DN-2` go into **O-9** (gate closed 2026-09-16, verdict
   recorded in `DECIDED: ARCH-GNOSIS-OFFLOAD`); `LZ-1`'s gesture half goes into **O-9/O-10**.
   Re-gating is a supersession of a closed gate, which `ASTROGRAPHER-SCOPE-REALIGNMENT` explicitly
   declines ("supersedes NO row").
5. **Must NOT prune on the strength of `GN-1` or `GN-2`** — not a §C.4 row, not a freeze carrier, not
   the MCP contract, not the security seam, not `docs/FORK-DIVERGENCE.md`, not an archived-but-still-
   cited file; §C.0 rule 2 forbids citing the catalog as a deletion authority, and the per-item
   sign-off is mandatory.
6. **Must NOT let `EN-2` retire a live-measured user-visible defect** — no reclassification of
   `PRUNE-129` or any `user-*`/dangling-lineage row, and no vocabulary token without the §9.1-style
   amendment cycle.
7. **Must NOT create a new capability, a new §C.5 token, a new `PRUNE` block, or a new §5.U matrix row
   silently** — the §C.1 partition is closed (16), the vocabularies are frozen, `600`–`799` is the only
   legal addition path for this pass, and the matrix is **full at 8**.
8. **Must NOT add a process-spawn capability to `src/`** as a side effect of `GN-3`; the launcher owns
   the spawn (`GNOSIS-LAUNCHER-TOGGLE`), and a shell-side exec surface is a new gated proposal.
9. **Must NOT edit the pinned corpora** — `docs/specs/ui-overhaul.md`, `docs/specs/user-flow-audit.md`,
   `docs/specs/unit-o-0-per-stage-breakdown.md`, `docs/specs/unit-o-0-per-stage-measurement.md`, the
   oracle pair, `BLOCKS`/`MATRIX_ROWS` (the `REQUIREMENT-CATALOG` §2.5 MUST-NOT-EDIT list) — and must
   not re-seed the operator store (the `O0_OPERATOR_DOCUMENTS = 226` census gate).
10. **Must NOT report any of this as app-green.** The verification class of C1/C2/C3 is DOC-LAYER, and
    RCA-12 binds the DONE rows: "never report 'the app works' from a node-green".

---

## 4. THE CHANGE ANALYSIS

### 4.1 Is the proposal a good idea, on balance?

**Yes, in its extension half — conditionally, in three places, and not as written in one.**

- **The ~35 extension/clarification ids are a legitimate, mostly-cheap work program**, and a large
  minority of them are **already satisfied or already scheduled** (`TB-1`/`TB-3`/`TB-6`, the static
  geometry of `LZ-3`/`LZ-4`/`LZ-5`, `PN-7`/`DN-2`/`LZ-1`/`PN-5` under O-9/O-10, `PN-6` under `FB-1`,
  `LZ-6`/`TB-5`/`TB-2` under the three open top-bar/scroll defects). Several restate requirements with
  a **better-specified** phrasing than the tracker carries (`PN-5`'s "nothing else may affect a pane's
  size", `PN-7`'s "pure `hidden` toggle", `LZ-6`'s independent scrolling) — that is a **net gain**,
  because each restatement gives the owning unit a sharper accept criterion.
- **Three places need a change before they work as written:**
  1. **`GN-1` is not implementable today and would be destructive if taken literally.** The engine
     **persists nothing**; `GN-1` today means **"the wiki is deleted at the first restart"**. **⟨CORRECTED 2026-09-28 (`X-7`): the *"persists nothing"* premise is STALE (engine-side `D-D1`+`D-D2` LANDED-GREEN; `GR-7` trigger DISCHARGED); the conclusion survives on the corrected ground — no cutover has happened, this repo has not verified the engine's durability live, and the INGEST/RECORD-COPY route (`GR-6a`) is PARKED. See §14.1 `C-1`.⟩** It also
     reverses three ACTIVE decision rows plus a gate-closed scope ruling, and **no concrete type
     satisfies it** (`createEngineCrudRagStore` is not a `RagStore`, and the 13 sync reads are pinned
     synchronous). → **Adapt, don't implement**: record the destination + hold the prerequisites
     (architecture §3.2 B).
  2. **`GN-2` is a self-authorizing mass disposition** over a corpus the catalog marks **non-prunable
     by construction** (§C.4's 39 rows), the four freeze carriers, and the pinned MCP contract — and
     §C.0 rule 2 says **no deletion may cite the catalog as its authority**. → **Adapt, narrow
     drastically**: archive-with-repoint, enumerated by id, per-item sign-off, over the named
     exclusions (§3.2 B.2), or drop it.
  3. **`EN-2` as written is a rule about *users' feedback* with no safeguard** — the exact mechanism
     that could retire a live-measured defect (`PRUNE-129`'s freeze lifting → `HEAVY-OPS-FREEZE-THE-PAGE`'s
     1 011 ms document open surviving only as an unowned parked row). → **Adapt into a forward-filing
     duty** with three mandatory clauses, **no token, no reclassification** (§3.4 D.2).
- **`GN-3`/`GN-4` are salvageable in exactly one framing** — launcher-only, best-effort spawn, typed-
  unavailable surfacing, **no boot refusal** — and are **forbidden as written** in their joint form
  (they reverse `ENGINE-ABSENT-DEGRADED-CONTRACT` and `GNOSIS-LAUNCHER-TOGGLE`).
- **`EN-1` should not be recorded at all** as a rule: the accept the repo already made
  (`reconcile.apply` 93.84 % of the document open) contradicts it.

### 4.2 Does a better solution exist?

**Yes, and it is the architecture's three-way split rather than an alternative design.** The two
"better solutions" worth naming explicitly, because a reader may reach for them:

| Candidate alternative | Ruling |
| --- | --- |
| **Implement `GN-1` now, in one cutover unit, with a migration** | **REJECTED.** It requires O-7 (engine persistence) **and** O-8 (authority switch) first — O-8 is the track's stated **PREREQUISITE**; without it the cutover has two writers over overlapping state (the split-brain O-8 exists to define) and the operator corpus has no migration story. The architecture's parked-destination record is strictly better: it costs one decision row and loses nothing (the input's own §4 forbids cataloguing `GN-*` as settled anyway). |
| **Re-gate `PN-7`/`DN-2` as new units** | **REJECTED.** They sit inside **O-9**, whose gate closed 2026-09-16, and `DECIDED: ARCH-GNOSIS-OFFLOAD` already names `APP-GRAPH-PANES-MCP-VISIBLE` as "the unit's sharpest hidden risk". Re-gating would supersede a closed gate, which `ASTROGRAPHER-SCOPE-REALIGNMENT` explicitly declines. The better solution is **an explicit accept criterion in O-9's spec**. |
| **Keep `GN-2` but "narrow it"** | **REJECTED as a middle path.** A narrowed-but-unnamed disposition is still unenumerated. The architecture's answer is the only one the repo's rules support: **archive-with-repoint, enumerated by id, per-item sign-off, exclusions named** — and a "no" from the user means `GN-2` is **dropped, not narrowed** (§10 Q4). |

### 4.3 Costs and benefits

**Benefits.** (i) ~20 ids that already have a home are **closed as reconciliation**, not re-spec'd —
the cheapest possible disposition; (ii) the remaining ids convert into **8 code-bearing units + 1
verification pass**, each with a layer declaration and a red set, i.e. the input becomes a plan rather
than 40 loose statements; (iii) the `WHOLE-PAGE-EDITING` decision — already a recorded REQUIREMENT
owing "a spec re-derivation + a live row" — finally gets its carrier (`ST-1`+`ST-4`+`ST-5`+`ST-6` as
one unit), which closes `WHOLE-PAGE-EDITING-REQUIREMENT`, `DOC-TITLE-NOT-EDITABLE`,
`TABLE-CELLS-NOT-EDITABLE` and the textarea half of `EDIT-MODE-TEXTAREA-UI` together; (iv) `EN-2`
becomes a filing duty that makes every future complaint-to-requirement promotion **falsifiable and
owned**; (v) the `GN` checkpoint converts an unrecordable ownership assertion into **one ACTIVE
destination row + one blocked row**, which the input's own §4 requires and which no other disposition
can produce today; (vi) the gate surfaces the **already-fired generator trigger**, which would
otherwise be silently re-read per unit.

**Costs.** (i) **One doc-layer pass (C1/C2/C3) + one spec pass (the generator) + the cataloguing pass**
— three passes of process, none of which changes `.ts`/`.mjs`; (ii) **8 code-bearing units** with full
cycles (spec + typed §5.x register + red + green + adversarial + blind-greens + doc review + trio),
one of which (C9 `U-EDIT-1`) is the **largest cross-layer unit in the input** and one of which (C10
`U-TAB-MERGE`) is **spec-first with no code until the conflict predicate is pinned**; (iii) **two
mandatory live batteries** (C4, C5, C7, C9, C10, C11) against `scripts/live-drive.mjs` — real cost,
and the only gate that can see this class (RCA-11); (iv) **four tracker files change digest** (the
catalog records `docs/defects.md`, `docs/decisions.md`, `docs/pending.md`, `docs/next-steps.md`), so
the cataloguing pass owes a **count + digest re-derivation**, and the digest-recount class has already
cost **two fix cycles**; (v) **the user is asked four questions** and two of the ids (`GN-1`, `GN-4`)
**cannot move** until they are answered; (vi) an **active risk that C1's spec amendment to
`docs/specs/requirement-catalog.md` is edited while the catalog's own contract changes underneath it**
(both the catalog and the contract are living docs — the amendment is legal, but the catalog's §C.8
owes a row, and §C.6's `excluded_specs`/digest bookkeeping must not drift).

**Net.** The benefit is a **plan with named owners and one blocked decision**, replacing a 40-item
wish list; the cost is **one doc pass now, one spec pass, one cataloguing pass, and 8 unit cycles**,
of which 9 of the 40 ids are pure reconciliation and 4 are parked. **That is a good trade.**

---

## 5. CHANGE INVENTORY — what this gate landing creates/modifies, and what it does not

### 5.1 Created by THIS pass (step 4)

| Path | What | Note |
| --- | --- | --- |
| `docs/specs/design-extensions-review.md` | **this file** — the proposal-gate landing record (`AGENTS.md` item 8) | DOC-LAYER; the only write of this pass |

### 5.2 Owed by the NEXT PASS (the landing/cataloguing pass) — the exact tracker rows

**Every row below is owed; none exists today.** Grouped by file.

**`docs/next-steps.md`**
- [ ] **R1 — the gate/DONE row.** `DONE (2026-09-21) — DESIGN-EXTENSIONS GATE LANDING`, carrying: the
  four-step chain (validity `VALID-WITH-AMENDMENTS` ∥ critique `PROCEED-WITH-AMENDMENTS` →
  architecture `PROCEED-WITH-AMENDMENTS` → change-analysis `PROCEED-WITH-AMENDMENTS`); the record path
  `docs/specs/design-extensions-review.md`; the two raw records
  (`archive/reviews/2026-09-21-design-extensions-critique-raw.md`,
  `archive/reviews/2026-09-21-design-extensions-architecture-raw.md`); **the layer declaration
  (DOC-LAYER — nothing app-green)**; the doc-only exemption cited
  (`docs/specs/astrographer-scope-realignment-review.md` §2.2 C8 + §6); **the recorded zero-row §5.x
  exemption**; the unit list this input decomposes into (§3.3 C) and the parked set; the **item-10d
  review record path** `archive/reviews/<date>-design-extensions-doc-review.md`; the two oracle hashes
  before/after (§6.2 of this record — **owed to a shell-bearing pass**); and the trio as a
  **regression reading**, never this unit's green.
- [ ] **R2 — the `BLOCKED-PENDING-USER` row** naming **`GN-1`/`GN-4`** and the **four questions** of
  §10, placed as a bolded blocking row at the head of `## CURRENT WORK / handover-state` (the file's
  own convention; see §8.1 P1), pointing at the new ACTIVE decision row.
- [ ] **R3 — the `(D-GEN)` queue-state correction.** The existing `(D-GEN)` paragraph states the
  generator "NOT in the O-5 chain and NOT next: its NAMED TRIGGER is the FIRST prune-candidate request
  OR the FIRST tracker row edited after the catalog lands". It must be **corrected to record that the
  trigger HAS FIRED** (on the catalog's own landing pass), that the generator is therefore **the next
  code-bearing item in that track**, and **who owns the observation** (the item-10d reviewer of the
  pass that first reports it). **Do not move it into the O-5 chain** — it is not in that chain.
- [ ] **R4 — the queue rows for the new units** (one row per unit, per RCA-2), placed in the NEXT
  QUEUE list **behind the O-5-led chain**, each with its class/layer, its dependencies, and its
  blocked/parked status: C4, C5 (as O-9/O-10 spec items), C6 (→ `FB-1`), C7, C8, C9, C10, C11, C12
  (**BLOCKED**), and the C13/C14 parked notes.

**`docs/decisions.md`**
- [ ] **R5 — ONE new ACTIVE row: `DECIDED: ENGINE-OWNERSHIP-DESTINATION-UNSCHEDULED`**, pinning the six
  clauses of §3.2 B.2 (destination = the parked O-6/O-7/O-8 track and **not scheduled**; prerequisites
  **O-8 + O-7** and they hold; **`RagStore` reads stay SYNCHRONOUS**; **`RAG-AUTHORITATIVE` /
  `SINGLE-WRITER-STORE` / `SINGLE-WRITER-STORE-PER-STORE` / `ASTROGRAPHER-SCOPE-REALIGNMENT` stay
  ACTIVE**; `GN-1`'s persistence clause is a **stated destination, not current behaviour**; `GN-2` is
  **archive-with-repoint only**). **No `SUPERSEDED` row is written by this pass.**
- [ ] **R6 — ONE new ACTIVE row amending the launcher toggle** (the `GN-3`/`GN-4` carrier), carrying
  the three mandatory clauses of §3.2 B.3 — **no boot refusal** (typed-unavailable surfacing);
  **WHO SPAWNS = the launcher** (`scripts/start-app.sh`), **NOT `src/`** (a shell-side spawn is a new
  exec capability + its own gated proposal); and **its own text stating it supersedes no clause of
  `ENGINE-ABSENT-DEGRADED-CONTRACT`**. This row may be written **only if** the user answers Q2/Q3 in
  the launcher/typed-unavailable direction (§10); otherwise it is owed in the reversal form the user
  chooses.
- [ ] **R7 — the `SUPERSEDED` rows owed at C9's landing** (not now): against
  `DECIDED: EDITING-MODE-SETTING` and `DECIDED: FORM-CONTROL-EDITING`, written **in the pass that
  implements** `WHOLE-PAGE-EDITING` (`DECIDED: WHOLE-PAGE-EDITING` already declares the supersession
  "once implemented").

**`docs/pending.md`**
- [ ] **R8 — §SPECULATIVE re-filings, as REPOINTS (never a second row set)** — item 6c:
  - [ ] `TB-4` → the §SPECULATIVE row(s) for tab drag-out / new-window-by-drag, with a named revisit
    condition;
  - [ ] `SR-3` → the §SPECULATIVE row(s) for search autocomplete + a recency-favouring history tool;
  - [ ] `FL-1` → the existing §SPECULATIVE row "Optional HTML export instead of markdown" (+ the
    parked Export/Validate UI row) — **repoint, don't duplicate**;
  - [ ] `FL-2` → the existing §SPECULATIVE row "Automatic (re-)export of markdown documents if contents
    are changed internally" — **repoint, don't duplicate**;
  - [ ] `ST-1`'s live-markdown-formatting half → a §SPECULATIVE row with its revisit condition.
- [ ] **R9 — the `GN-2` exclusion list** recorded as pending-row content **only if** `GN-2` is
  adopted (Q4 = yes), with the enumeration-by-id and the named exclusions of §3.2 B.2; otherwise the
  row records that `GN-2` is **dropped**.
- [ ] **R10 — a `PARKED` row is the legal alternative placement for the blocked row** (R2); if the
  landing pass chooses it, `docs/next-steps.md` carries the pointer and this record's §8.1 P1 is
  followed so **one** placement exists.

**`docs/specs/requirement-catalog.md`** (the catalog **contract** — legal to amend; see §8.1 P2)
- [ ] **R11 — the `EN-2` amendment as ONE new entry in §9.1** (the next numbered item, (27), on the
  2026-09-21 track), carrying the **forward-filing duty with the three mandatory clauses**, the **no
  new token / vocabularies stay frozen** statement, the **no-reclassification** statement (naming
  `PRUNE-129` explicitly as NOT released), the §C.8 binding rule for future rows, and the statement
  that **`O-5` is unaffected**. **`EN-1` is recorded as a REJECTED causal reading, not a row.**
- [ ] **R12 — §C.8 gains a change-log row** for this pass, naming the pass, the sections re-verified,
  the drift found, and the amendment added (`EN-2`).
- [ ] **R13 — §C.8's census line** ("Amendments (2026-09-21, §9.1) — **11** entries — §9 (16)–(26)")
  must be **recounted** to include the new entry (the current count is a landed census claim; a silent
  addition is the drift class the catalog's own change log records).

**`docs/requirement-catalog.md`** (the landed advisory catalog)
- [ ] **R14 — the new `PRUNE-###` rows** for this input's genuinely-new behaviors, authored **only in
  the `PRUNE-600`–`PRUNE-799` AMENDMENT / FIX-PASS block**, with the three rule-5 duties (change-logged
  in §C.8, counted in §C.6.3, ids never reused/renumbered).
- [ ] **R15 — §C.6.3 `counts` recounted** (`tier2`, `tier2_prunable_verdict`, `upstream_owed`,
  `checklist_rows`) — **recounted, never copied**. The current landed values are `tier2` **178**,
  `tier1` **44**, `upstream_owed` **39**, `checklist_rows` **112**, `tier2_prunable_verdict` **0**,
  `capabilities` **16**; a new-row pass that does not recount is the exact class that cost two fix
  cycles.
- [ ] **R16 — §C.6 / §C.7 bookkeeping**: the input digests for the **four tracker inputs this pass
  edits** (`docs/defects.md`, `docs/decisions.md`, `docs/pending.md`, `docs/next-steps.md`) are
  re-stamped; the 18-line digest block gains the catalog's own new digest (self-referential by
  construction — the deferred generator replaces it with a mechanically recomputed one); the
  `excluded_specs` partition gains any **new `docs/specs/**` path created by this input's units** and
  `excluded_specs` is recounted from its floor.
- [ ] **R17 — §C.7 conflict handling**: **at most two** entries — the **`GN-1` vs the ownership rows**
  conflict, which in the parked reading is recorded as a **continuation of X-11 (re-pointed, NOT a new
  `X-n`)** and becomes a **new conflict only if the user reverses**; and the **`PN-7`/`DN-2`
  collapsed-body pin vs the pure-`hidden` ask** as an **`X-14`/`X-15`-class** entry, resolved by the
  item-10d reviewer **via an O-9 spec amendment**, never by the catalog.
- [ ] **R18 — §C.7.2 waivers BY NAME for every id this pass mints** (`DECIDED:
  ENGINE-OWNERSHIP-DESTINATION-UNSCHEDULED`, the launcher-amendment row, the `BLOCKED-PENDING-USER`
  row, and any new defect/decision row) — an unwaived new id is **`FS18`**.
- [ ] **R19 — §C.4 is NOT touched** (recorded as a deliberate non-write in §C.8's row).

**`docs/defects.md`** — no new row is owed by *this* pass. New rows may be owed by the **units**
(e.g. RCA-3 adversarial host findings, and any defect the C4/C5/C7/C9/C10/C11 live batteries surface).
**The three top-bar/scroll defects are NOT re-filed** — `TABBAR-SCROLLS-AWAY`, `TOP-BAR-NOT-FIXED` and
`PANE-NO-PLACEMENT-OR-SCROLLBOX` **stay their own rows** and are consumed **as ONE unit** (C4).

**`docs/HANDOFF.md`** — no row is owed. The O-7/O-8 pointer rows already exist and are **cited, never
edited**.

### 5.3 NOT touched (pinned by this verdict)

- **Every pinned / MUST-NOT-EDIT corpus**: `docs/specs/ui-overhaul.md`, `docs/specs/user-flow-audit.md`,
  `docs/specs/unit-o-0-per-stage-breakdown.md`, `docs/specs/unit-o-0-per-stage-measurement.md`,
  `scripts/live-drive.mjs`'s `BLOCKS`/`MATRIX_ROWS`, `src/**`, `scripts/**`, `tests/**`.
- **The oracle pair** `src/shared/o0-report.ts` + `scripts/live-drive.mjs` (see §6.2).
- **The 39-row §C.4 upstream-owed ledger** (`PRUNE-801`–`PRUNE-839`; **39 ids, each used once** —
  recounted against `docs/requirement-catalog.md` §C.4 by the 2026-09-21 item-10d documentation review;
  an earlier line in this record read "18-row" and was **wrong**, corrected here) — cited, never
  edited; **§C.4 is untouched**.
- **The four `invalidated-conflict` freeze carriers** (`PRUNE-100`, `PRUNE-127`, `PRUNE-152`,
  `PRUNE-375`) — no freeze is lifted, added or re-adjudicated.
- **`PRUNE-129`** — no reclassification (the `EN-2` clause explicitly does not release it).
- **The §C.5 frozen vocabularies** (6 / 6 / 10 / 5) and the **§C.1 16-capability closed partition**.
- **The §5.U matrix** (cap 8, full — extended/re-pinned rows only; `MATRIX_ROWS` must not change).
- **The `GNOSIS-LAUNCHER-TOGGLE` spawn mechanism** in `scripts/start-app.sh` — this record changes no
  script; the amendment is a **decision row**, and the script change (if the user chooses it) is that
  row's own follow-up.
- **Any `SUPERSEDED` row** — none is written by this pass (the `GN-*` supersessions are **not** taken;
  the `EDITING-*` supersessions are owed at **C9's landing**).
- **The operator store** — no re-import, no re-seed, no live derive (`O0_OPERATOR_DOCUMENTS = 226`).
- **`docs/specs/mcp-endpoint.md`** — the pinned MCP contract (its `provident.focus` /
  `provident.get_journal` drift is an existing, separately-recorded defect; this input's `PN-1`/`SR-*`
  ids do not license an edit).

---

## 6. GATE-IMPACT ANALYSIS

### 6.1 Code-bearing vs doc-layer, per decomposed unit

**The obligation test.** A unit is **code-bearing** iff it changes any `.ts`/`.mjs`/test file, the
envelope authoring model, the store, or any observable app surface. A code-bearing unit owes: its own
`docs/specs/unit-<name>.md` contract; a **typed §5.x property register**; a **TestWriter red run,
reported (RCA-1)**; an **Implementer green**; the **trio** (`AGENTS.md` item 4); an **RCA-3
adversarial** pass recorded in the spec's §3a/§3b; **RCA-4 blind greens** by a non-author; an
**item-10d doc review**; and a DONE row stating the **layer** (RCA-12) and the recorded red set.

| Unit | Code-bearing? | Notes |
| --- | --- | --- |
| **C1 U-PROCESS** (`EN-2`) | **NO — DOC-LAYER** | Zero-row §5.x exemption **recorded**; no trio obligation; verification = read-only adversarial + item-10d + oracle-hash before/after |
| **C2 U-CHROME-VERIFY** | **NO — DOC-LAYER** | Same exemption shape; writes no spec, no red set |
| **C3 U-GN-CHECKPOINT** | **NO — DOC-LAYER** | The ACTIVE destination row + the blocked row + the `GN-2` enumeration |
| **the D.4 generator spec** | **DOC-LAYER at this pass** | The **generator unit itself** (`scripts/catalog-derive.mjs` + `tests/requirement-catalog-contract.test.ts`) **is code-bearing** and owes its own spec, typed register, red run, green, adversarial, blind-greens, doc review and trio — **none of which this pass discharges**. Its **spec must be authored before the catalog amendment lands.** |
| **C4 U-CHROME-PIN** | **YES** — assembled/shell-CSS + window | **MANDATORY live battery** |
| **C5 U-ZONES** (O-9/O-10 spec items) | **YES** — assembled/CSS + persisted operator state | **MANDATORY live battery**; two spec items with their own red sets under the owning unit's cycle |
| **C6 U-PANE-STRUCT (`FB-1`)** | **YES** — pure moves | No new battery; `FB-1`'s own acceptance (byte-equality + frozen public-surface snapshot) |
| **C7 U-PANE-GESTURE** | **YES** — pure + assembled/pointer | **MANDATORY live battery** |
| **C8 U-STAGE-TYPE** | **YES** — envelope + renderer | Live recommended |
| **C9 U-EDIT-1** | **YES** — store + envelope + renderer (the largest) | **MANDATORY live battery** |
| **C10 U-TAB-MERGE** | **YES** — pure + assembled + store | **SPEC-FIRST: no code until the conflict predicate is pinned**; mandatory live battery |
| **C11 U-SEARCH** | **YES** — renderer + shell accelerator | Recommended → mandatory for the Ctrl+F surface |
| **C12 U-DOCNAV-LISTEN** | **YES if unparked** | Currently **BLOCKED on C3**; parks only with the recorded reason |
| **C13 U-FILES / C14 U-PARK-NOTES** | **NO** | §SPECULATIVE / PARKED rows with named revisit conditions |

### 6.2 The ORDER (and where the frozen queue sits)

**The frozen, already-gated queue is NOT re-opened.** Per `docs/next-steps.md` NEXT QUEUE
(re-numbered after the ninth O-0 run) and `docs/specs/astrographer-scope-realignment-review.md` §7.1:

> **O-5 → O-9(+O-3) → O-10 → O-1 → O-2**, with O-4 **conditional** on the disclosure-only trigger.

**O-5 leads the queue and is UNBLOCKED** (the ninth edition's live form is the DEC-1-accepted artifact
and the oracle that certifies it is named and was sound — `driver.oracleIdentity` `92a74b7d`).

**Order of this input's units, and how they interleave:**

1. **O-5 leads** (the O-chain's own item; unchanged by this input).
2. **C1 → C2 → C3** — the doc-layer block, **before any catalog row for this input's ids**, and C1/C3
   **before or with** the cataloguing pass (which must be **ONE atomic tracker-writing pass**). The
   generator's **spec** is authored here too, before the catalog amendment lands.
3. **The cataloguing pass** — one pass, once.
4. **C4 (U-CHROME-PIN)** — after C2; independent of the O-chain's O-9/O-10 pins (it does not touch
   `#wiki-root`'s grid tracks).
5. **O-9(+O-3)** — **already scheduled and unchanged**; it **now carries C5's gesture half, `PN-7` and
   `DN-2` as spec items** (an amendment paragraph + an explicit accept criterion, **no new gate**).
6. **O-10** — **already scheduled and unchanged**; it carries `PN-5` + `LZ-1`'s gesture half.
7. **C5's `LZ-2`/`PN-2` size dimension** — the unit **following O-10** (O-10 owns *order*, not *size*).
8. **O-1 → O-2** — unchanged.
9. **C7 (U-PANE-GESTURE)** — after O-10 (drop-target resolution is slot-order-dependent).
10. **C8 (U-STAGE-TYPE)** — independent.
11. **C9 (U-EDIT-1)** — the big one; lands the `EDITING-MODE-SETTING` / `FORM-CONTROL-EDITING`
    `SUPERSEDED` rows **in its own landing pass**.
12. **C10 (U-TAB-MERGE)** — **strictly after C9**; spec-first.
13. **C11 (U-SEARCH)** — after C4 (pane placement/scroll context); `SR-5` decided **with**
    `FIND-IN-PAGE-NOT-FIXED`.
14. **C6 (`PN-6` → `FB-1`)** and **C12 (`DN-1`)** — whenever their owners unpark; **C12 stays blocked**
    on C3's answer (and on GR-5 in the engine reading).
15. **C13/C14** — parked, never sequenced behind a trigger they do not have.

**Two ordering facts a later SpecDoc must not lose:** (a) **no unit may run over two contract regimes**
(§3.6 F.3 item 3); (b) **the `SUPERSEDED` rows for `EDITING-MODE-SETTING` / `FORM-CONTROL-EDITING` are
written at C9's landing, not before** — writing them earlier would supersede a live model with an
unimplemented one.

**The oracle-identity hazard (the `src/shared/o0-report.ts` + `scripts/live-drive.mjs` pair).** The
recorded live provenance is keyed to the **djb2 composite of exactly two files** (recorded
`b89d6f19` + `194dfece` = composite `92a74b7d` for the ninth-run tree). **A change to EITHER file
invalidates the recorded live provenance (RCA-11)** and forces another live run → §3b re-audit → doc
review. Therefore:
- **The doc-layer units (C1/C2/C3 and the generator's spec) may NOT touch either file** — they have no
  reason to; the mechanical before/after hash check is the *proof of non-touch*.
- **C4/C5/C7/C9/C10/C11 may not touch the pair as a side effect** of a UI change; a change to
  `scripts/live-drive.mjs` is expected for **new live blocks** (that is the harness's own growth path)
  and **must be recorded as an oracle-identity change with its own live re-run** — never as an
  incidental edit inside a UI unit's diff.
- **No hash value in this record is recomputed** (step 4 has no shell). The mechanical before/after
  re-read is **owed to a shell-bearing pass** and must be reported in the DONE row.

---

## 7. INTERACTION AUDIT (verified against the files)

### 7.1 The O-5 queue state — **VERIFIED**

`docs/next-steps.md`'s NEXT QUEUE reads, in its authoritative short form, **"THE QUEUE BELOW NOW LEADS
WITH O-5"** with the re-numbered order **(1) O-5 (UNBLOCKED) → (2) O-9 + O-3 → (3) O-10 → (4) O-1 →
(5) O-2, with O-4 CONDITIONAL on the disclosure-only trigger**, and states the re-correction is "the
FOURTH time" after the ninth run. `docs/pending.md` §"O-0 schedule status" confirms **O-5's gate is
UNBLOCKED** and that **O-6/O-7/O-8 stay PARKED with their triggers unchanged**. **Nothing in this
input's decomposition touches that order** — the architecture's §3.3 C states it explicitly, and §6.2
above preserves it.

### 7.2 The oracle-identity hazard — **VERIFIED (and bounded)**

Recorded in `docs/specs/requirement-catalog.md` §2.2 fact 3 ("the O-0 oracle identity is the
SOURCE-HASH PAIR `src/shared/o0-report.ts` + `scripts/live-drive.mjs` … **a change to EITHER file
invalidates the recorded live provenance (RCA-11)**") and in `docs/next-steps.md`'s ninth-run DONE row
(`driver.oracleIdentity` = `b89d6f19` + `194dfece` = `92a74b7d`, identical on both legs). The
consequences are in §6.2 above. **Additional fact this pass pinned (§8.1 P3):** the pair is **not**
listed among the catalog's **18 input digest lines** (§C.6.2), so the catalog's manifest does not
depend on it — but the **live evidence** does.

### 7.3 The deferred-generator trigger — **ALREADY FIRED; the owner is named; and one thing must not happen**

- **Verified trigger text:** `docs/specs/requirement-catalog.md` §6.2 — "**the first prune-candidate
  request, OR the first tracker row edited after the catalog lands — whichever comes first**"; mirrored
  in `docs/pending.md` §SCHEDULED and in the `(D-GEN)` paragraph of `docs/next-steps.md`.
- **Verified firing:** the `REQUIREMENT-CATALOG` DONE row in `docs/next-steps.md` **is** a tracker-row
  edit after the catalog landed; this input's pass adds 5+ more.
- **Who owns it:** the **`role_documentation_reviewer` of the pass that first reports the trigger as
  fired**, recorded in `docs/next-steps.md` + the catalog's §C.8 change-log row.
- **What must NOT happen:** (a) **the generator must not be authored against an unadjudicated
  criterion** — its **spec** must exist **before** this pass's `EN-2`/`GN` catalog amendment lands;
  (b) **the trigger must not be re-read per unit** — the cataloguing pass is **ONE atomic
  tracker-writing pass**; (c) **the generator must not be reported as landed by this input** — it is
  its own code-bearing unit with its own full gate cycle; (d) the generator must not be moved into the
  O-5 chain (`docs/next-steps.md` already says it is **not** in that chain).

### 7.4 The §5.U matrix cap — **VERIFIED**

`docs/specs/gnosis-offload-review.md` records the matrix as **"capped at 8 rows and currently FULL
(U-1..U-8)"**, with amendment **A-6**: each unit's live assertion must **re-pin an existing row** or
**enter as an extended (non-matrix) row**; **"a unit cannot claim a §5.U matrix slot it does not
have"**, and `MATRIX_ROWS` must not change (it sits in the catalog contract's MUST-NOT-EDIT table).
`docs/specs/astrographer-scope-realignment-review.md` §2.2 C7 records the same zero-new-matrix-rows
position. **Consequence:** C4's, C5's, C7's, C9's, C10's and C11's live assertions enter as
**re-pins or extended rows**; none claims a slot.

### 7.5 The §C.4 non-prunable ledger — **VERIFIED**

`docs/requirement-catalog.md` §C.4 carries the upstream-owed ledger, landed count **39** rows
(`PRUNE-801`–`PRUNE-839`), described as **"NON-PRUNABLE BY CONSTRUCTION"**, with `escalate-prune` on one
being `FS11`, and "the set is COUNTED, never asserted" (verified count: 39, split 28 `UPSTREAM-OWED` +
12 carrying a §C.3 capability). `GN-2`'s disposition would touch it on any "contradicts `GN-1`"
reading; it is **excluded by name** (§3.2 B.2). **This input adds nothing upstream-owed, so §C.4 is
untouched** — the only relevant facts are that `GN-1`'s blocker rows (`PRUNE-838`, the GR-7 durability
row; the O-7/O-8 pointer rows) sit in the non-prunable set and may be **cited, never edited**.

### 7.6 The `FB-1`/O-9/O-10 ownership overlaps — **VERIFIED, per id**

| Id | Owning unit of record | What the overlap is | Discipline |
| --- | --- | --- | --- |
| **`PN-6`** | `docs/pending.md` §DEFERRED **`FB-1`/`FB-2`/`FB-3`** ("the large-file decomposition set"; request doc `docs/feature-requests/sidebar-panes-decomposition.md`; catalog §C.4 rows `PRUNE-831`–`PRUNE-834`) | "A pane is a GENERIC CONTAINER CLASS carrying all the universal pane features once" — a **runtime/authority** claim on the same file `FB-1` decomposes (`src/renderer/sidebar-panes.ts` 3 670 lines) | **`PN-6` does not open a parallel rewrite.** The runtime clause becomes an **`FB-1` acceptance amendment**; nothing else of `PN-6` is schedulable while `FB-1`'s target is in place. A parallel unit would break `FB-1`'s byte-identical-output constraint and invalidate its own red set |
| **`PN-7`** + **`DN-2`** | the SCHEDULED **O-9(+O-3)** unit; gate closed 2026-09-16; `DECIDED: ARCH-GNOSIS-OFFLOAD` names `APP-GRAPH-PANES-MCP-VISIBLE` as "the unit's sharpest hidden risk" | `PN-7`'s "pure `hidden` toggle" **contradicts today's live pin** (`archive/tests/2026-10-04-unit-u-shell-3-collapsible-panes.test.ts` §3.2: collapsed ⇒ the body marker is **ABSENT**; the test's own comment records that the CSS-only reading was deliberately **not** pinned), and today `togglePaneCollapse` writes through `setLayout` → a re-derive | **Spec items inside O-9 — re-gating is FORBIDDEN.** `PN-7`'s MCP-visibility clause is an **explicit accept criterion** in O-9's spec (the flip makes the collapsed body **more** graph-visible, so it is satisfiable — but it must be **stated, not assumed**) |
| **`PN-5`** + **`LZ-1`** | **O-10** (`LayoutState.panes[].order` as slot authority, lands BEFORE O-1) + O-9's gesture surface; `PANE-SLOT-INSTABILITY-ON-DISCLOSURE` is O-10's live row | `LZ-1`'s "element-local handlers" collides head-on with `DECIDED: PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE` and the landed hybrid (`installShellPointers`, parity at the application seam); a **separate** `LZ-1` unit would put two units on one gesture surface | **Spec items inside O-10/O-9** — the gutter half rides the existing gutter unit; **no separate LZ-1 unit** |
| **`PN-2`** | the unit **following O-10** | The "size needed to present it without a scrollbar" default is a **painted measurement** with no node oracle; O-10 owns *order*, not *size* | A **spec item** in that unit, with **MANDATORY live battery** (bounding-box + `scrollHeight === clientHeight`, painted) |
| **`LZ-2`/`LZ-3`/`LZ-4` (the empty-zone caveat)** | **`EMPTY-ZONE-TRACK-NOT-COLLAPSED` / `F-3`** (the `is-empty` → `0px` rules) | The stated full-width/inset geometry is **currently inert** for the header/footer because both zones are empty by default — the pane zones are exactly `['left','right','header','footer']` and there is **no `header toolbar` producer** in `src/renderer/**`, so `LZ-5`'s "margin below the header toolbar" names a surface that **does not exist** | **`F-3` is already FIXED + LIVE-CONFIRMED** (`docs/defects.md`: `#app > #wiki-root` consumes `--zone-<z>-track`; 25/25 `archive/tests/2026-10-04-renderer-empty-zone-track.test.ts`). So this is a **regression-watch item**, not new work: `LZ-3`/`LZ-4`'s geometry claim is **inert, not wrong**, and `LZ-5`'s "header toolbar" clause is **undefined pending a surface that does not exist** |
| **`TB-5` (staying half)** + **`LZ-6`** | the ONE top-bar/scroll unit (C4) over the three open defects `TABBAR-SCROLLS-AWAY`, `TOP-BAR-NOT-FIXED`, `PANE-NO-PLACEMENT-OR-SCROLLBOX` | `PANE-NO-PLACEMENT-OR-SCROLLBOX`'s own fix-shape cell already says "make the shell's scroll containers the ZONES/STAGE (not `body`)", and `TOP-BAR-NOT-FIXED`'s cell records the same root | **One unit, not one per id** — and it must not be split across three DONE rows |

### 7.7 Two further interactions this pass verified (and pinned in §8.1)

- **The catalog's `next-steps` pointer form**: the catalog addresses `docs/next-steps.md` by
  **`anchor-token`** (heading + a quoted row opening) and the file has **no row grammar**; the two rows
  that use it are `PRUNE-103` and `PRUNE-129` (the report-#3 block). **A new `docs/next-steps.md` row
  must be addressed as an anchor-token** and, if it becomes the `status_pointer` of a `GN-*` row, it
  must **satisfy the §3.5.3 owning-row test** (a gate record is a *record*, not an owning row for a
  behavior — but it **is** the owning row for its own blocked status, which is the §3.5.3
  "subject identity" case).
- **The catalog contract is a living doc, and it is NOT an input of the catalog's manifest**: the
  contract's own §2.5 MUST-NOT-EDIT table lists `src/**`, `scripts/**`, `tests/**`,
  `docs/specs/ui-overhaul.md`, `docs/specs/user-flow-audit.md`,
  `docs/specs/unit-o-0-per-stage-breakdown.md`, `docs/specs/unit-o-0-per-stage-measurement.md`,
  `docs/specs/requirement-catalog-review.md` and `docs/HANDOFF.md` — **the contract spec itself is not
  on that list**, and the catalog's 18 digest lines do **not** include it. So the `EN-2` amendment
  (§5.2 R11) is **landable**, does **not** invalidate any recorded input digest, and owes only the
  §C.8 row + the amendment-census recount (§5.2 R12/R13).

---

## 8. UNDER-SPECIFIED POINTS THIS PASS HAD TO PIN (the choice, and why)

**The architecture left these open; each is pinned here so no later pass re-derives it.**

- **P1 — the `BLOCKED-PENDING-USER` row's physical home.** The architecture says
  `docs/next-steps.md:§OPEN`, but **the file has no `## OPEN` section** — it is organised as `##`
  blocks of bolded, dated rows (`## CURRENT WORK / handover-state` is the head), and
  `docs/specs/requirement-catalog.md` §3.5 records the verified fact that the file has no row grammar.
  **Pinned:** the row lands as a **bolded blocking row at the head of
  `## CURRENT WORK / handover-state`**, in the file's own row convention, and the pointer from any
  `GN-*` catalog row uses the **`anchor-token`** form (heading + quoted opening) — because a
  `row-id`/`section-ref` pointer into this file would be an **`FS8` hard-fail**. The
  `docs/pending.md` §PARKED alternative is legal **only if** the landing pass then keeps **exactly one**
  placement (two placements of one blocked status is the "two status authorities" hazard §C.0 rule 1
  exists to prevent).
- **P2 — the `EN-2` amendment's exact home in `docs/specs/requirement-catalog.md`.** **Pinned:**
  **one new entry in §9.1**, as the **next numbered item (27)** on the existing
  "AMENDMENTS (2026-09-21)" track — **not** a new §9 item outside §9.1, and **not** an edit to §3.4's
  frozen vocabularies. *Why:* §9.1 is the section the landing pass already re-stamps against (items
  (16)–(26)), so a new entry is machine-findable and cannot be mistaken for an original contract
  clause; and §C.5's vocabularies must stay visibly untouched. Consequential edits pinned with it:
  §C.8's amendment-census line, and §C.8's binding rule for the rows the clause governs **cites** the
  duty (the duty is not re-stated per row).
- **P3 — the `GN-1` vs the ownership rows "which entry does the conflict land in".** **Pinned:** in the
  **parked reading** it is the **continuation of `X-11`** — the register rows' pointers are re-pointed
  and `X-11`'s resolution cell records the new ACTIVE row by name. **No new `X-16`** is minted for a
  non-conflict. A **new** conflict entry is owed **only if** the user answers Q1 "immediate
  supersession", in which case it is a genuine tracker-vs-tracker disagreement and the affected register
  rows freeze at **`invalidated-conflict`** per §3.7 rule 1. *Why:* §3.5.2 rule 6 ("exactly ONE
  `invalidated-conflict` row per conflict") and §C.7's own rule that a re-filed duplicate conflates two
  readings of one disagreement.
- **P4 — the catalog's dependency on the contract spec.** **Pinned (verified):** the amended contract is
  **not** one of the catalog's 18 input digest lines, so amending §9.1 **does not** invalidate any
  recorded digest and **does not** by itself make any row `stale`; the staleness duty comes from the
  **four tracker inputs this pass edits**. *Why:* a later pass must not "repair" a non-existent digest
  drift (the RCA-6 drift class) or, conversely, skip the recount because it assumed the amendment had
  invalidated everything.
- **P5 — the oracle-hash verification at the doc layer.** **Pinned:** the C1/C2/C3 pass records the
  check as a **read-only claim of non-touch** (no `src/**`/`scripts/**` write exists in a doc layer
  pass), and the **mechanical before/after hash re-read is owed to a shell-bearing pass** and reported
  in the DONE row. *Why:* the step-4 reviewer and the doc-layer units have **no shell**; claiming a
  computed hash would be exactly the fabricated-evidence class the catalog's §C.6.2 handling of its own
  digest line already refuses to commit.
- **P6 — the `docs/next-steps.md` `(D-GEN)` row's state.** **Pinned:** the row is **corrected, not
  deleted** — it now records that the trigger has fired and who owns the observation, and it **stays out
  of the O-5 chain**. *Why:* deleting it would hide the trigger's firing; moving it into the chain would
  mis-sequence a code-bearing unit ahead of the O-chain it does not block.
- **P7 — the "three defects = one unit" record.** **Pinned:** `TABBAR-SCROLLS-AWAY`,
  `TOP-BAR-NOT-FIXED` and `PANE-NO-PLACEMENT-OR-SCROLLBOX` **keep their own defect rows** and are
  consumed **as one unit (C4)**, landing as **one DONE row** with **one** red/green/adversarial/doc-
  review cycle (RCA-2). *Why:* three DONE rows for one root would repeat the "multi-unit deliverable
  inlined/lumped" miss in the opposite direction, and splitting the fix would re-open the same pin set
  three times.
- **P8 — `LZ-5`'s "header toolbar".** **Pinned:** `LZ-5`'s **"margin below the header toolbar" clause is
  undefined pending a surface that does not exist** (there is no `header toolbar` producer in
  `src/renderer/**`; the pane zones are exactly `['left','right','header','footer']`). The **static**
  half of `LZ-5` (the stage's grid area) is class (iii); the **inset/scroll** half is C4. *Why:* a spec
  that names a nonexistent producer cannot have a red set, and the architecture's own §A(iii)/(iv)
  split already distinguishes the two halves.

---

## 9. RISK LEDGER + REVERSIBILITY

### 9.1 Risk ledger

| # | Risk | Likelihood | Impact | Mitigation (present / missing) |
| --- | --- | --- | --- | --- |
| **K1** | **The two-regimes hazard** — units spec'd against local-authoritative assumptions while neighbours are spec'd against engine-authoritative ones (the RCA-2 failure mode scaled up) | **Medium** if the `GN` checkpoint is skipped or the cataloguing pass precedes C1/C3 | **Very high** — `ST-4`/`TAB-2`'s commit/merge contract is unstateable behind an engine hop (the scope-realignment record excludes the write path **by name**), and the suite's ~120-file data-layer cross-section becomes an unbounded re-derivation | **PRESENT:** the parked-destination record + the sync-read pin + the fence exemption by name + the "one atomic cataloguing pass" rule + the ordering in §6.2. **Missing:** nothing structural; the guard is compliance, so the DONE row must **state which contract regime** each unit assumed |
| **K2** | **A wrong `GN-1` reading → restart-loss of the operator corpus** | **Low** if the architecture's record is followed; **HIGH** if `GN-1`'s "supersede now" reading is taken | **Catastrophic** — the engine persists **nothing** (`docs/HANDOFF.md` O-7 pointer row); the 226-doc / 6 102-node / 9 266-edge corpus is lost at the first restart, with **no migration unit** **⟨CORRECTED 2026-09-28 (`X-7`): the *"engine persists nothing"* ground is STALE (engine-side `D-D1`+`D-D2` LANDED-GREEN, `GR-7` trigger DISCHARGED); the K2 risk rating and the "no migration unit" clause STAND on the corrected ground — no cutover has happened, this repo has not verified the engine's durability live, and the INGEST/RECORD-COPY route (`GR-6a`) is PARKED. See §14.1 `C-1`.⟩** | **PRESENT:** the three verified reasons in §3.2 B.1; the ACTIVE row's clause (e) ("stated destination, not current behaviour"); the named-migration-unit obligation; the `BLOCKED-PENDING-USER` row. **Missing:** nothing — but the user must be told the corpus consequence **in the brief for Q1** |
| **K3** | **`GN-2` as a self-authorizing mass disposition** | **Medium** — it is the input's single most dangerous item and the verb "pruned" reads as deletion | **Very high** — it would touch the non-prunable §C.4 ledger, the four freeze carriers, the pinned MCP contract, the security seam and `docs/FORK-DIVERGENCE.md`; §C.0 rule 2 forbids the catalog as a deletion authority, so the disposition would have to proceed on an authority the repo says it must not cite | **PRESENT:** archive-with-repoint + enumeration-by-id + per-item sign-off + the named exclusions + "nothing may be executed from the catalog's authority". **Missing:** the **enumeration itself** does not exist yet — it is a landing-pass artifact (§5.2 R9) and must be produced **before** any disposition, or Q4 cannot be answered meaningfully |
| **K4** | **`EN-2` retiring a live-measured defect** | **Medium** if `EN-2` is implemented *literally* (as a class-wide re-classification) | **Very high** — `PRUNE-129`'s `keep-advisory` freeze rests on `user-verbatim` + a dangling lineage; lifting it makes the row `escalate-prune`-eligible, and `HEAVY-OPS-FREEZE-THE-PAGE`'s **1 011 ms** document open survives only as an unowned parked row. That is the **RCA-11/RCA-12 failure mode** (the gate green, the app broken) | **PRESENT:** the three mandatory clauses (falsifiable user-visible end state + owning tracker row + live measurement); no token; no reclassification; `PRUNE-129` named as **not released**. **Missing:** nothing — but the clause is a **filing-time duty verified at item 10d**, deliberately **not** mechanized, so the doc review is the enforcement |
| **K5** | **Count drift in the catalog** (it has already cost **two fix cycles**) | **HIGH** — this pass edits 4 of the 6 tracker inputs, adds rows and mints ids | **Medium-high** — a drifted manifest makes the register's own counts untrustworthy and re-opens the class the catalog's §C.8 C2/C3 rows record | **PRESENT:** the recount duties (§C.8, §C.6.3), the §C.7.2 waiver duty, the single-atomic-pass rule, the item-10d recount. **Missing:** a **named owner for the recount** — the landing pass must name it in the §C.8 row, and the review record must show the recount, not a copied figure |
| **K6** | **Re-opening a closed gate** (`PN-7`/`DN-2`, `LZ-1`'s gesture half) | **Medium** — the ids read like new behaviors | **High** — it would supersede a closed gate, which `ASTROGRAPHER-SCOPE-REALIGNMENT` explicitly declines ("supersedes NO row"), and would put two units on one gesture surface / one pin set | **PRESENT:** the class (i)/(iv) rulings ("spec items inside O-9/O-10"); the "no new gate" statements; the explicit accept criterion for the `PN-7` MCP-visibility clause. **Missing:** nothing |
| **K7** | **The generator encoding an unadjudicated criterion** | **Medium-high** — the trigger is **already fired** and the generator is the next code-bearing item in that track | **High** — a generator written before `EN-2`/`GN-2` are adjudicated would **mechanize a rule the repo has not accepted**, and its determinism fixture would freeze that mistake | **PRESENT:** the "generator spec BEFORE the catalog amendment" rule; the owner named; the trigger-observed-once rule; §3.12's clause set (a)–(f) **must not be widened silently**. **Missing:** a **date-ordered gate** in the queue rows (the landing pass must show the generator's spec landing **before** the amendment in the same DONE chain) |
| **K8** | **A shell-side exec surface introduced as a side effect** (`GN-3` in `main.ts`) | **Low-medium** — the input's phrasing ("launches if it can't find an existing one") does not say *where* | **High** — `src/` has **no** process-spawn capability today; adding one creates an argv/exec **security seam** that must go through its own gate, and it would break the shell's "pure client" status (and `GNOSIS-LAUNCHER-TOGGLE`'s recorded contract) | **PRESENT:** the clause-2 ruling (WHO SPAWNS = the launcher) + the explicit "new gated proposal" statement + the F.3 must-NOT item 8. **Missing:** nothing — but **Q2 must be asked with the security consequence stated**, because a "yes, in `main.ts`" answer converts a doc amendment into a gated code proposal |
| **K9** | **Digest/staleness drift in the catalog's manifest** | **HIGH** — four input files change this pass | **Low-medium** — a stale recorded digest makes §C.6.2's evidence lines wrong (the class the catalog's own digest-line placeholder already handles honestly) | **PRESENT (this pass's pin, §8.1 P4):** the amended contract is **not** an input digest, so the amendment alone invalidates nothing; the four tracker digests are re-stamped by the landing pass; the catalog's own digest is self-referential by construction and the generator replaces it. **Missing:** the `bytes` column remains `not measured (doc-layer pass)` until a shell-bearing pass closes it |
| **K10** | **The gate record itself becoming a phantom pointer** | **Low** — `docs/specs/design-extensions-review.md` is new, and other `*-review.md` records sit in `docs/specs/**` while the deferred generator classifies `docs/specs/**` paths as inputs or `excluded_specs` | **Low-medium** — an unclassified path is **`FS23`** | **PRESENT:** §5.2 R16 requires the `excluded_specs` partition to gain any new `docs/specs/**` path with a reason class. **Missing:** nothing — but the landing pass must not forget that **this file** is one of those paths |

### 9.2 Reversibility

| Artifact / action | Reversible? | How |
| --- | --- | --- |
| **`docs/specs/design-extensions-review.md` (this file)** | **YES — single-diff revert** | Delete the file; nothing else references it until the landing pass writes pointers to it. The **cheapest possible** revert |
| **The doc-layer passes C1/C2/C3** | **YES — single-diff revert** | Each writes a spec/amendment + tracker rows; a `git revert` restores the prior text. Their verification is read-only, so nothing else changes |
| **A `SUPERSEDED` decision row** | **REVERSIBLE IN FORM, NOT IN EFFECT** | `docs/decisions.md` retains provenance text, so the row can be restored to ACTIVE by a later pass — but **the superseding unit's code/tests have moved by then**, so the *effect* is only reversible together with that unit's diff. **This is why the `EDITING-*` supersession is deferred to C9's landing** (writing it earlier would supersede a live model with an unimplemented one) and why the `GN-*` supersessions are **not taken at all** |
| **The test-fence exemption** (`tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts`) | **YES** | It is a recorded ruling in a landed review + the catalog; a later pass can re-derive it, at the cost of re-entering this gate |
| **An ARCHIVED row** (the `GN-2` route) | **NO — not by `git revert`** | The archive copy lands in the **gitignored** `archive/` tree, so `git revert` restores nothing; the only durable record is the **git-visible tombstone** (the `PRUNE-###` line in the deletion commit message + the tombstone row). **This is precisely why `GN-2` requires per-item sign-off and an enumerated list** |
| **An operator-corpus cutover** (a future `GN-1` implementation) | **NO** | The engine persists nothing today, there is no migration unit, and the local corpus is a whole-store JSON file whose rewrite is a one-way operation on the operator's data. **This is the single least-reversible action in the whole input**, and it is exactly what the parked-destination reading avoids. **⟨CORRECTED 2026-09-28 (`X-7`): *"the engine persists nothing today"* is STALE (engine-side `D-D1`+`D-D2` LANDED-GREEN, `GR-7` trigger DISCHARGED); the NO-reversibility verdict and the "no migration unit" clause STAND — this repo has not verified the engine's durability live and the INGEST/RECORD-COPY route (`GR-6a`) is PARKED. See §14.1 `C-1`.⟩** |
| **A catalog `verdict` change / a lifted freeze** | **Reversible in the register, NOT in the consequence** | The register is text; but a lifted freeze that let a sign-off proceed would already have deleted a row whose archive copy is gitignored. The `EN-2` clause's "no reclassification" is the guard |
| **A `docs/decisions.md` amendment row** (the launcher row, `GN-3`/`GN-4`) | **YES — single-diff revert** | A decision row is text; its follow-up (a `scripts/start-app.sh` edit) is a separate unit with its own diff |

---

## 10. VERDICT + CONDITIONS + THE USER QUESTIONS

### 10.1 VERDICT

> **PROCEED-WITH-AMENDMENTS — split three ways, with `GN-1`/`GN-4` blocked on the user.**

**Only this passing review PLUS the user's go-ahead may proceed to the spec gate** (`AGENTS.md` item
8). The `GN-*` parts may not proceed **even then** until Q1–Q4 are answered. **The gate is
`GATED 2026-09-21`.**

**ANSWERED — 2026-09-21.** Q1–Q4 **are answered** (the five user rulings in §11; the questions are
marked individually in §10.3), so the `GN-*` parts **may now move**, subject to the surviving
conditions in §10.2 and the program gates of §13. **The verdict itself is unchanged** — it remains
`PROCEED-WITH-AMENDMENTS`; only its **blocked** state is superseded. **The verdict is not a licence to
implement `GN-1` in one cutover**: the user's ruling makes the engine the authority while the engine
persists nothing**, so the prerequisite units of §13 P2 govern (§11.1, §14.1). **⟨CORRECTED 2026-09-28 (`X-7`): the premise is STALE — engine-side `D-D1`+`D-D2` are LANDED-GREEN and `GR-7`'s trigger DISCHARGED; the prerequisite-unit conclusion is UNCHANGED, re-aimed at the PARKED INGEST/RECORD-COPY route (`GR-6a`). See §14.1 `C-1`.⟩**


### 10.2 CONDITIONS (must hold before authoring starts — the architecture's 8, each verified/discharged above, plus 8 this step adds)

> **NOTE (2026-09-21, post-ruling).** The condition list below is **retained as written**; **two of its
> entries are affected by the rulings and are read as follows.** **Item 2** (`GN-*` recorded via an
> ACTIVE destination row + a `BLOCKED-PENDING-USER` row): the **`BLOCKED-PENDING-USER` row is now a
> RESOLVED row** (its answers are §11) and the **"ACTIVE destination row" form is REPLACED** by the
> ruling's rows — the three `SUPERSEDED` rows, the `ENGINE-ABSENT-DEGRADED-CONTRACT` reversal and the
> `GNOSIS-LAUNCHER-TOGGLE` amendment (§11.1/§11.3, owed by §13 P1). The **discipline in item 2 stands
> unchanged**: the rows must exist **before any catalog row cites them**, and every `GN-*`
> `status_pointer` must resolve. **Item 7** (the `EN-2` amendment + the `GN` checkpoint precede the
> cataloguing pass): **unchanged and still binding** (§13 P0/P1). **All other items stand verbatim.**

**From the architecture (F.2), restated with their status:**

1. **The `design-extensions` gate landing must exist before any spec or catalog row.** — **DISCHARGED
   by this file.**
2. **`GN-*` must be recorded in the state that exists** (ACTIVE destination row + `BLOCKED-PENDING-USER`
   row) **before any catalog row cites them**, and every `GN-*` `status_pointer` must resolve.
3. **`PN-7`'s MCP-visibility clause is an explicit accept criterion in O-9's spec**, which must resolve
   today's opposite pin (`archive/tests/2026-10-04-unit-u-shell-3-collapsible-panes.test.ts` §3.2 — collapsed ⇒ the body
   marker is **ABSENT**).
4. **`ST-4` must name `src/main/rich-decompose.ts` `decomposeRichHtml`.**
5. **Every undefined term named by the two reviews gets a spec definition before its unit is
   delegated** (the twelve terms of §3.6 F.2 item 5).
6. **The `FL-1`/`FL-2` re-filing must be a repoint, not a second §SPECULATIVE row set.**
7. **The `EN-2` amendment + the `GN` checkpoint precede the cataloguing pass, and the cataloguing pass
   is ONE atomic tracker-writing pass.**
8. **The `PN-1` visibility half is subordinated to `C13-PANE-VISIBILITY-SUPERSEDED-BY-REMOVAL` +
   `LIVE-12`**, and `PN-1`'s import half keeps the native File→Import item.

**Added by this change-analysis step:**

9. **The layer declaration is mandatory in every DONE row** — C1/C2/C3 and the generator's spec are
   **DOC-LAYER**, and **no unit of this input may be reported as app-green** from a node-suite green
   (RCA-12). A DONE row that does not state its layer is a review finding.
10. **The zero-row §5.x register exemption must be RECORDED, not silent**, for each doc-layer unit
    (the `REQUIREMENT-CATALOG` precedent), with its justification and the statement that the **trio is
    a regression reading, never that unit's green**.
11. **The `(D-GEN)` trigger correction must land with an owner** (§5.2 R3), and **the generator's spec
    must be authored BEFORE the catalog amendment** — with the order visible in the DONE chain.
12. **The three top-bar/scroll defects are consumed AS ONE UNIT (C4)** and land as **one** DONE row
    with **one** red/green/adversarial/doc-review cycle (§8.1 P7).
13. **`§C.4` is untouched** and the four freeze carriers are not re-adjudicated; **every `PRUNE`-id
    addition goes in the `PRUNE-600`–`PRUNE-799` block** with the three rule-5 duties.
14. **Every id this pass mints is waived by name in §C.7.2 in the same pass** (`FS18` guard), and the
    new `docs/next-steps.md` rows are addressed as **`anchor-token`** pointers (§8.1 P1).
15. **The oracle pair is not touched by any unit of this input as a side effect**; any change to
    `scripts/live-drive.mjs` (a new live block) is recorded as an **oracle-identity change** with its
    own live re-run, and the mechanical before/after hash re-read is **owed to a shell-bearing pass**
    (§6.2, §8.1 P5).
16. **The `§5.U` matrix is not extended** — live assertions for C4/C5/C7/C9/C10/C11 enter as **re-pins
    or extended rows**; `MATRIX_ROWS` must not change.

### 10.3 WHAT THE USER MUST ANSWER BEFORE THE BLOCKED PARTS MOVE (the four questions)

> **⚠ ANSWERED 2026-09-21 — the four questions below are RETAINED VERBATIM as the record of what was
> asked and of the architecture's recommendation. Each carries its answer pointer; the answers
> themselves (verbatim, with their supersession targets and consequences) are in §11. Nothing below
> is deleted: the recommendation text is the record of the alternative.**

1. **Does `GN-1` supersede `RAG-AUTHORITATIVE` + `SINGLE-WRITER-STORE` +
   `SINGLE-WRITER-STORE-PER-STORE` immediately, or is the engine-owns-document-CRUD destination
   PARKED behind O-8 (authority switch) and O-7 (engine persistence)?**
   *The architecture recommends PARKED.* **The consequence to state in the brief:** the engine
   **persists nothing today**, so an immediate supersession means **the operator's 226-document corpus
   is lost at the first restart** (no migration unit, no engine durability — `PRUNE-838`/GR-7 is
   parked). **⟨CORRECTED 2026-09-28 (`X-7`): the *"persists nothing today"* premise and the *"no engine durability"* parenthetical are STALE — the engine's own trackers record `D-D1`+`D-D2` DONE — LANDED-GREEN + ALL GATES RUN (2026-09-22) and `GR-7`'s trigger DISCHARGED; the sentence's conclusion is RETAINED on the corrected ground: no cutover has happened, this repo has not verified the engine's durability live, and the unsatisfied conjunct is the PARKED INGEST/RECORD-COPY route (`GR-6a`). See §14.1 `C-1`.⟩**
   → **ANSWERED: "Supersede now — engine owns document CRUD" (§11.1).** The recommendation above is
   **SUPERSEDED BY USER RULING**; the corpus-loss consequence it names is **accepted as a recorded
   condition** and is gated by §13 P2 (`U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION` before ANY cutover)
   and by §14.1.
2. **Does `GN-3`'s spawn live in the launcher (recommended — no new capability) or in `main.ts`?**
   **The consequence to state:** a shell-side spawn is a **new exec capability and a new security
   seam**, and it is therefore **its own gated proposal**, not part of this input.
   → **ANSWERED: "The launcher (`scripts/start-app.sh`) owns the spawn" (§11.2) — the recommendation
   is CONFIRMED, not superseded.** `src/` gains no exec capability; a shell-side spawn remains its own
   gated proposal.
3. **Does `GN-4`'s warning leave the local wiki fully usable (typed-unavailable — recommended) or
   refuse to open a wiki when no engine is found?** A refusal **reverses
   `ENGINE-ABSENT-DEGRADED-CONTRACT`** and must be stated as a reversal, with `GNOSIS-LAUNCHER-TOGGLE`
   superseded.
   → **ANSWERED: "Refuse to open a wiki without an engine" (§11.3) — the recommendation is OVERRIDDEN
   and `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT` is REVERSED by the ruling**, with
   `DECIDED: GNOSIS-LAUNCHER-TOGGLE` **AMENDED** (not superseded). Consequence, stated plainly: a user
   without the engine binary **can open no wiki**.
4. **`GN-2`: archive-with-repoint only, enumerated by id, per-item sign-off, over the named exclusions
   (the MCP contract; the four security/authority seam rows; `docs/FORK-DIVERGENCE.md`; the 39-row
   §C.4 ledger; the four `invalidated-conflict` freeze carriers; the parked O-6/O-7/O-8 rows) — yes or
   no?** **A "no" means `GN-2` is DROPPED, not narrowed.**
   → **ANSWERED: "Archive-with-repoint only, enumerated, per-item sign-off" (§11.4) — the
   recommendation is ADOPTED in full**, including every named exclusion, and the enumeration must be
   produced **before** any disposition.

### 10.4 What must NOT proceed (the must-NOT-do list — reproduced in force from §3.6 F.3)

**Not catalogue `GN-1`…`GN-4` as settled · not schedule the future ids · not let a plan unit run over
two contract regimes · not re-open a closed gate · not prune on the strength of `GN-1`/`GN-2` · not
let `EN-2` retire a live-measured defect · not create a new capability / vocabulary token / `PRUNE`
block / §5.U matrix row silently · not add a process-spawn capability to `src/` · not edit the pinned
corpora or re-seed the operator store · not report any of it as app-green.**

---

## 11. USER RULINGS (2026-09-21)

> **Source of record for this section.** These are the **user's rulings, given 2026-09-21**, on the four
> blocked questions of §10.3 plus one new ruling resolving the sync-read pivot. Each answer is quoted
> **verbatim**. Where this section restates a consequence, it is a **consequence of the ruling**, not a
> re-derivation of the verdict. **They do not re-run the gate**: the verdict stays
> `PROCEED-WITH-AMENDMENTS` (§10.1); the rulings resolve its blocked state and pin the design.
> **Layer: DOC-LAYER / gate record** (RCA-12) — nothing here is app-green.

| # | Id(s) | The ruling, in one line | Direction vs the architecture |
| --- | --- | --- | --- |
| **11.1** | `GN-1` | **Supersede now — engine owns document CRUD** | **OVERRIDES** the parked-destination recommendation (§3.2 B.1 — marked SUPERSEDED there) |
| **11.2** | `GN-3` | **The launcher (`scripts/start-app.sh`) owns the spawn** | **CONFIRMS** the architecture's recommendation (§3.2 B.3 clause 2) |
| **11.3** | `GN-4` | **Refuse to open a wiki without an engine** | **REVERSES** `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT` and **AMENDS** `DECIDED: GNOSIS-LAUNCHER-TOGGLE` |
| **11.4** | `GN-2` | **Archive-with-repoint only, enumerated, per-item sign-off** | **ADOPTS** the architecture's narrowed route (§3.2 B.2 item 3) in full |
| **11.5** | the read model | **A host read cache exists only for currently tab-owned documents and pane data; opening a new tab is an async Gnosis call** | **NEW RULING** resolving the sync-read pivot; **selects** the tab-scoped-cache pivot over the two alternatives **this record enumerates in §11.5** (the architecture named none) |

### 11.1 `GN-1` — **supersede now; the engine owns document CRUD**

**Verbatim answer.** *"Supersede now — engine owns document CRUD."* (2026-09-21, in answer to §10.3 Q1.)

**What it decides.**
- The **engine becomes the authority for document CRUD**; Astrographer does not persist documents.
- The **ACTIVE rows to be superseded** are `DECIDED: RAG-AUTHORITATIVE`, `DECIDED: SINGLE-WRITER-STORE`
  and `DECIDED: SINGLE-WRITER-STORE-PER-STORE`, replaced by an **engine-authoritative model**. The
  supersession rows are **owed** (see the gate obligations in §13) — this record does **not** write
  them.
- **This overrides the architecture's "parked destination" recommendation** (§3.2 B.1/B.2, which
  selected the parked reading "not as supersessions today"). That recommendation is **marked
  SUPERSEDED BY USER RULING in place** (§3.2 B.1) and **retained** — it is the record of the
  alternative and of the reviewer's reasoning, and its three verified facts are **still true today**
  (the engine persists nothing; O-8 is the track's prerequisite; the sync-read pin was load-bearing). **⟨CORRECTED 2026-09-28 (`X-7`): the *"persists nothing"* fact is STALE (engine-side `D-D1`+`D-D2` LANDED-GREEN, `GR-7` trigger DISCHARGED); the O-8 prerequisite and the sync-read pin STAND. See §14.1 `C-1`.⟩**
  The ruling **adopts those facts as the program's gates** (§13 P2) rather than as reasons to refuse.

**What it supersedes / amends (named).**

| Target | Form of change | Notes |
| --- | --- | --- |
| `DECIDED: RAG-AUTHORITATIVE` (`docs/decisions.md` §ACTIVE) | **SUPERSEDED** | "the RAG store is the persistent source of truth" — the authority moves engine-side |
| `DECIDED: SINGLE-WRITER-STORE` (`docs/decisions.md` §ACTIVE) | **SUPERSEDED** | "the main process owns all writes; MCP and UI both route through it" — the lock point moves |
| `DECIDED: SINGLE-WRITER-STORE-PER-STORE` (`docs/decisions.md` §ACTIVE) | **SUPERSEDED** | the per-store queue: the per-store mapping onto engine wikis is `U-AUTHORITY-SWITCH`'s work |
| `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT` (`docs/decisions.md` §ACTIVE) | **AMENDED, NOT superseded in full** | it "EXTENDS `ARCH-GNOSIS-OFFLOAD` — supersedes NO row" and pins *host-owned* MCP + *synchronous* `RagStore` reads; its **presentation-layer** half (the shell keeps the render path, `docs/specs/astrographer-scope-realignment-review.md` §3.1/§3.2) **stays ACTIVE and binding** — see the exclusion table below |
| `DECIDED: SOURCE-SWITCHABLE` (the "`createRemoteRagStore` anticipated but unfulfilled" clause) | **discharged/cited, not superseded** | its anticipated remote store is exactly what an engine-authoritative model realises; the ruling makes that clause **current** rather than anticipated |

**What this ruling does NOT decide (each still owed, each with a named owner).**
1. **The write-path contract.** The commit path becomes an **async engine write** — reversing
   `docs/specs/astrographer-scope-realignment-review.md` §3.3's WRITE PATH row ("commit-on-blur editing
   cannot be async-chunked behind an engine hop"). **That reversal is recorded explicitly in §12.7,**
   and the unit that must **restate the commit contract** is the `WHOLE-PAGE-EDITING` unit (`C9`
   `U-EDIT-1`, §3.3 C9) — **not** this record.
2. **The `edit.*` group vs the `gnosis-edit` group.** `RAG-EDIT-MCP-GROUPS` (host `edit`) and
   `GNOSIS-CRUD-EDIT-GROUP` (engine `gnosis-edit`) **both stay ACTIVE**; `edit.set_content` becomes an
   **alias at the switch**, via an amendment to `RAG-EDIT-MCP-GROUPS` + `MCP-UI-EQUIVALENCE`. This is
   **explicitly not implied by `GN-1`** (§3.1).
3. **The migration.** No migration story exists today; a **named migration unit**
   (`U-CORPUS-MIGRATION`, §13 P2) with journal/undo + rollback is **owed before any cutover**.
4. **The security/operator seam.** `GNOSIS-SECURITY-CARVE-OUT`, `ENGINE-TRANSPORT-POLICY`,
   `IPC-SURFACE-NOT-GROUP-GATED`, `OPERATOR-ISOLATED-GRAPHSCOPE`, the MCP contract
   (`docs/specs/mcp-endpoint.md`), the host-side stores (`security-store`, `authority-store`,
   `idempotency-registry`, `query-audit`, `OperatorSettings`, the vector cache), the **multi-store
   registry** (`MULTI-STORE-REGISTRY`, `FANOUT-INTERLEAVE-MERGE` — catalog `PRUNE-835`, a
   `user-directed-record` row frozen at `keep-advisory`) and **`docs/FORK-DIVERGENCE.md`** are **NOT
   superseded and NOT prunable** by this ruling. `GN-1`'s "Astrographer persists no documents" is read
   as **documents**, **never** as these stores (§3.2 B.4).
5. **The test fence.** `tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts` remain
   **exempt by name** and **may not be re-derived by any `GN-*` unit** (§3.1, §3.2 B.4). A unit that
   cannot stay green under the fence is **not** a `GN-1` implementation — it is a new proposal
   re-entering this gate. **§14.2 re-plans the fence explicitly** (it is not silently re-derived).
6. **The engine-absent behaviour** is decided separately (§11.3) — `GN-1` alone says nothing about a
   laptop with no engine binary.

**Consequences (stated plainly, and gated).**
- **Without `U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION`, the operator corpus is lost at the next
  restart** — the engine persists nothing today (`docs/HANDOFF.md` O-7 pointer row, quoting the parked
  O-7 constraints cell). **⟨CORRECTED 2026-09-28 (`X-7`): the *"the engine persists nothing today"* ground is STALE — engine-side `D-D1`+`D-D2` are DONE — LANDED-GREEN + ALL GATES RUN (2026-09-22) and `GR-7`'s trigger DISCHARGED; the `K2` risk and the §13 P2 fence are RETAINED on the corrected ground — no cutover has happened, this repo has not verified the engine's durability live, and the unsatisfied conjunct is the PARKED INGEST/RECORD-COPY route (`GR-6a`). See §14.1 `C-1`.⟩** This is the **`K2` risk materialised by the ruling** and is **RECORDED, never
  hidden** (§14.1). The **fence** is §13 P2: **nothing cuts over until those units land.**
- **Until P2 lands, the local store remains a TEMPORARY authority with a recorded sunset condition**
  (§13, sequencing rule S1).

### 11.2 `GN-3` — **the launcher owns the spawn** (the recommendation is CONFIRMED)

**Verbatim answer.** *"The launcher (`scripts/start-app.sh`) owns the spawn."* (2026-09-21, §10.3 Q2.)

**What it decides.** The launcher **detects-or-launches, health-polls and reports**; **the shell stays a
pure client**. **No new exec capability enters `src/`.**

**What it supersedes / amends.** **Nothing.** This **confirms** the architecture's §3.2 B.3 clause 2 and
`DECIDED: GNOSIS-LAUNCHER-TOGGLE`'s own recorded contract ("the shell remains a pure client; the
launcher does the orchestration"). The amendment row owed is a **provenance/amendment clause on
`GNOSIS-LAUNCHER-TOGGLE`** (the DEC-1 precedent) making the **auto-start the launcher's default**.

**Consequences.**
- The launcher-side change (a default flip) is that row's **own follow-up**, with its own diff; the
  **`GNOSIS-LAUNCHER-TOGGLE` spawn mechanism itself is unchanged** and this record changes no script.
- **`src/` gains nothing**: `src/main/embeddings.ts`'s `execFileSync('curl', …)` ollama reachability
  probe remains the **only** `node:child_process` use in `src/`. A shell-side spawn would be a **new
  exec/argv security seam and its own gated proposal** (`F.3` must-NOT item 8 stands).
- The launcher's **health-poll** and **fail-loud** behaviour are the seam the refusal of §11.3 reads.

**What it does NOT decide.** The **launcher's exact default** (auto-start vs `--mode=gnosis` opt-in) and
the **health-poll timeout/retry policy** are the amendment row's own text — pinned as **§13 P1's launcher
item**, not here. It also does not decide what the shell shows when the launcher reports no engine (that
is §11.3).

### 11.3 `GN-4` — **refuse to open a wiki without an engine** (a REVERSAL, stated as one)

**Verbatim answer.** *"Refuse to open a wiki without an engine. The app warns and does not open a wiki
when no Gnosis instance can be found."* (2026-09-21, §10.3 Q3.)

**What it decides.**
- When **no Gnosis instance can be found**, the app **warns the user and does not open a wiki**.
- **This REVERSES `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT`** ("with no engine every local path works
  IDENTICALLY; engine-absent reads are typed-unavailable, never silent; the launcher must fail loud").
  The reversal is **recorded as a reversal**, not as a clarification: the contract's **identity**
  clause is the clause being reversed ("works IDENTICALLY" is no longer true — with no engine, **no
  wiki opens**).
- **This AMENDS `DECIDED: GNOSIS-LAUNCHER-TOGGLE`** (an amendment, **not** a supersession): the toggle
  exists "precisely because the engine is optional" and the engine is now a **precondition of opening a
  wiki** — while the launcher's spawn ownership (§11.2) is confirmed and its recorded contract intact.

**What it supersedes / amends (named).**

| Target | Form | The clause at issue |
| --- | --- | --- |
| `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT` | **REVERSED** | the identity clause ("every local path works IDENTICALLY") and the typed-unavailable-as-the-only-surface rule |
| `DECIDED: GNOSIS-LAUNCHER-TOGGLE` | **AMENDED** | the "the engine is optional" rationale; the spawn mechanism and launcher ownership are **unchanged** |
| catalog `PRUNE-829` (§C.4, `keep`) + its §C.3 twin `PRUNE-361` (`merged-into:PRUNE-829`) | **affected rows, cited never edited** | both state the degraded contract; §C.4 is **non-prunable by construction** and must be **re-homed/re-pointed by the ruling's own pass**, never pruned |
| `docs/specs/astrographer-scope-realignment-review.md` §3.4 | **superseded in substance** | it is the contract's source of record; the reversal must be recorded **against** it |
| defects `DEMO-ENGINE-START-GAP`, `GNOSIS-SIDEBAR-SEAM-MISSING` | **status change owed** | their fix shape presumes the local path stays usable |
| `docs/HANDOFF.md` O-8 pointer row | **consequence** | offline-write reconciliation becomes a **hard** requirement, not a hedge |

**Consequences.**
- **A user without the engine binary can open NO wiki.** This is the single sharpest consequence of the
  ruling and it is **stated, not softened**: the local store still exists on disk and is still written
  by nothing, but it is **unreachable through the app's document surfaces**.
- **`GN-4` and §11.1 interlock**: `GN-1` makes the engine the authority; `GN-4` makes the engine's
  **presence** a precondition. Together they mean **engine absence is a total document-surface outage**,
  which is why §13 P2's `U-AUTHORITY-SWITCH` (the offline dual-path definition, O-8) is a
  **prerequisite** and not a tail unit, and why the ruling's own warning UX is a **first-class state**
  (§12.5) rather than an error page.
- The **typed-unavailable surface is retained as the failure vocabulary** even though the identity
  contract is reversed: a warning that names the missing engine is a **typed** failure, never a silent
  empty stage (§12.5).

**What it does NOT decide.**
1. **Whether the refusal is boot-wide or per-wiki.** The ruling says "does not open **a wiki**"; the
   read model (§12.5) pins the **per-wiki/tab-open** surfacing as the load-bearing case and leaves the
   **boot-wide** framing to `U-AUTHORITY-SWITCH`'s spec.
2. **Whether operator surfaces outside documents stay usable** (settings, security/operator panes,
   template data). The ruling addresses **opening a wiki**; the operator surfaces are `UI-CONFIG-CARRIER`
   state and are **not** documents (§11.1 item 4).
3. **The warning's exact wording/affordance** (toast, modal, inline stage state) — pinned as a spec
   obligation on the unit that implements it, with §12.5's `TAB-1` class as the carrier.

### 11.4 `GN-2` — **archive-with-repoint only, enumerated, per-item sign-off**

**Verbatim answer.** *"Archive-with-repoint only, enumerated, per-item sign-off."* (2026-09-21, §10.3 Q4.)

**What it decides.** `GN-2` is **ADOPTED in its narrowed route** (the architecture's §3.2 B.2 item 3),
with **no mass deletion**:
1. **Archive-with-repoint ONLY** — never hard deletion of a still-cited row (AGENTS.md item 6c: *never
   leave a citation pointing at a moved file*). The **archive copy is not evidence; the git-visible
   tombstone is** (`docs/specs/requirement-catalog.md` §3.6 shrink + tombstone).
2. **Enumerated by id, FIRST** — the affected rows/specs are enumerated **by id** and **each needs its
   own sign-off** (`prune_signoff:user-approved:<date>`) **plus** its owning tracker row
   (§C.0 rule 2: *no deletion may cite this catalog as its authority*). **One blanket approval is not a
   sign-off and cannot stand in for the enumeration.**
3. **The enumeration must exist BEFORE any disposition** — it is a landing-pass artifact owed by the
   `GN-2` carrier unit (§13 P0/P1), per `K3`'s "Missing" column.
4. **The exclusions are the architecture's, unchanged**, each with its own recorded reason (the
   "Excluded by name" table in this subsection — **cited elsewhere as §11.4's exclusion table**, since
   there is no separate `§11.4.1` heading).

**Excluded by name (nothing in `GN-2` may touch these).** Each exclusion is an **absolute** — a
"contradicts `GN-1`" reading **does not** reach any of them:

| Excluded | Reason (recorded) |
| --- | --- |
| **`docs/specs/mcp-endpoint.md`** | the **pinned MCP contract** (`AGENTS.md` item 5; "host-side by contract", `docs/specs/astrographer-scope-realignment-review.md` §3.3) |
| **`GNOSIS-SECURITY-CARVE-OUT`, `ENGINE-TRANSPORT-POLICY`, `IPC-SURFACE-NOT-GROUP-GATED`, `OPERATOR-ISOLATED-GRAPHSCOPE`** | the **security/operator seam rows** — a prune read "would delete the rationale for a trust boundary" |
| **`docs/FORK-DIVERGENCE.md`** | the **fork-divergence hedge** — the recorded fallback if upstream declines every request; its §3 rule 4 keeps every divergence in three places |
| **the §C.4 39-row upstream-owed ledger** (`PRUNE-801`–`PRUNE-839`, incl. `PRUNE-838` the GR-7 durability row) | **NON-PRUNABLE BY CONSTRUCTION** (`docs/requirement-catalog.md` §C.4) — **cited, never edited** |
| **the four `invalidated-conflict` freeze carriers** (`PRUNE-100` X-15, `PRUNE-127` X-1, `PRUNE-152`/`PRUNE-375` X-14) | a named tracker-vs-spec disagreement is **resolved by neither authority in the catalog**; freezing precedes any prune question |
| **the parked O-6/O-7/O-8 rows** (`docs/pending.md` §PARKED DESTINATION) | every parked row carries a **named revisit condition**; O-8 is now the program's prerequisite (§13 P2) |

**What it supersedes / amends.** **No row.** `GN-2` carries **no supersession**: it is a disposition
*route* over an enumerated set, executed only with per-item sign-off. In particular it **does not**
re-adjudicate `PRUNE-129`'s `keep-advisory` freeze (§3.4 D.2) and **does not** touch §C.4.

**Consequences.**
- The **enumeration is now the gate** for the whole `GN-2` disposition: **no enumeration, no
  disposition.** A landing pass that executes any archive before the enumerated list exists and is
  signed item-by-item is a **process violation**, not a partial credit.
- **`archival pass` is a program item, not a side effect** — the user's instruction that an **archival
  pass on obsolete documents runs as part of this program** is recorded in §13 as its own pass,
  carrying `GN-2`'s enumeration + per-item sign-off + these exclusions.
- The **irreversibility is unchanged** (§9.2): an archived row's copy lands in the **gitignored**
  `archive/` tree, so `git revert` restores nothing. This is *why* the per-item sign-off exists.

**What it does NOT decide.** **Which** rows end up enumerated (that is the enumeration's own
deliverable), and **the archive destination naming** (`archive/<topic>/<date>-<name>.md` is the
AGENTS.md convention the pass must follow).

### 11.5 THE READ MODEL — the selected pivot (verbatim)

**Verbatim ruling (2026-09-21).** *"Host read cache exists only for currently tab-owned documents and
pane data. Opening a new tab requires an async call to Gnosis to load the data into cache."*

**What it decides.** The **tab-scoped-cache pivot** is **SELECTED**. *Two alternatives to it exist in
the record's own logic — the "make the store itself synchronous over the engine" reading and the
"rewrite the 22-member interface async end-to-end" reading — and this record **enumerates and rules on
both** (table below) so neither is re-derived by a later pass; the architecture did **not** name them,
so the enumeration is **this pass's**, not an inherited list.* It **resolves the sync-read pivot** left
open by `GN-1`: the existing **synchronous
`RagStore` reads (**22 members, 13 sync reads / 9 async** — recounted symbol-by-symbol in
`src/main/rag-store.ts` `interface RagStore` by the 2026-09-21 item-10d documentation review; the
`16`/`6` split carried here earlier was wrong and the **13/9** counts are the source of record: 13 =
`getNode`, `listNodes`, `getEdge`, `listEdges`, `status`, `journal`, `undoDepth`, `redoDepth`,
`edgesFrom`, `edgesTo`, `edgesByKind`, `edgesForDocument`, `docHeadForDocument`; 9 = `putNode`,
`removeNode`, `putEdge`, `removeEdge`, `undo`, `redo`, `enqueue`, `applyBatch`, `teardown`)** are
**served from the cache**, so the **sync pin can stand for cache-resident data** — provided the
**cache-miss policy** and the **"who guarantees residency" rule** are pinned. §12 is the design pin.
The full rules (residency, miss policy, eviction, failure UX, persistence semantics, transport, the
re-scoped units) are in **§12**; the consequence table is **§14.1**.

**The two alternatives it was selected over** (recorded so neither is re-derived):

| Alternative | Why not selected |
| --- | --- |
| **Keep the sync-read interface and make the STORE itself synchronous over the engine** (a blocking/atomics read into the engine) | it needs an engine-side synchronous read surface, which the engine has no contract for, and it blocks the render thread on a network hop — the failure mode `ENGINE-ABSENT-DEGRADED-CONTRACT`/RCA-11-style live gating exists to catch |
| **Rewrite the reads async end-to-end (the 22-member interface becomes async)** | it re-opens the **~120-of-221 test-file data-layer cross-section** and the fence **unboundedly** (§14.2/§14.3), and it breaks the "no unit may run over two contract regimes" guard by forcing every consumer's red set to re-derive in one sweep |

**What it supersedes / amends.** **No decision row is superseded by name.** It **amends the reading**
of `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`'s sync-read pin (the pin **stands**; its *subject* becomes
the cache rather than the store) and it **re-scopes** the units listed in §12.8. It also **forces** the
commit-path reversal recorded in §12.7.

**Consequences.** Residency becomes a **precondition of rendering**; a **cache miss is a defined
failure, never a silent empty result**; the **tab-open fetch** is the async seam; **eviction** and the
**dirty-tab** case are pinned (§12.3/§12.4); and **`GN-1`'s "persists" means tabs' own state, not
document data** (§12.6).

**What it does NOT decide.** The **cache's serialization format** (none — it is a working set, §12.6);
the **prefetch policy beyond the active tab**; and the **engine-side wire shape of the tab-open fetch**
— GR-4's revisioned projection-snapshot route is **OWED upstream** (§C.4 `PRUNE-804`, whose ledger row
reframes the read as paginated cursor-tagged pages and refuses the revisioned framing), so **§14.4**
pins the **existing local seam** as the transport **until GR-4 lands**, and the revision/marker
requirement is a **prerequisite of `U-READS-PIVOT`**.

---

## 12. THE READ MODEL (tab-scoped cache)

> **Status of this section: the design PIN for the ruling in §11.5.** It states the contract a
> TestWriter derives red sets from and the obligation each re-scoped unit carries. **It is not an
> implementation**, and **nothing here is app-green**. Verified-against-code facts are marked
> **[verified]** with their path; claims that are **owed** are marked **[owed]** and are never asserted
> as landed.

### 12.1 The pin, in one paragraph

**The host keeps a read cache. The cache holds ONLY (a) the documents owned by currently-open tabs and
(b) pane data. Opening a tab is an async Gnosis fetch that loads that document's data into the cache
before/while the stage renders. A cache miss may not be served by a silent local read.** The existing
**synchronous `RagStore` reads are served from the cache**; the **sync pin stands for cache-resident
data**; and a read for a **non-resident** document is a **defined failure** (§12.2), never a silent
empty result.

**The cache's contents, exactly (the closed set).**
1. **Tab-owned documents** — the document subgraph + its derived materialization for each
   **currently-open tab's target**, and nothing else. A closed tab's document leaves (or ages out,
   §12.3).
2. **Pane data** — the pane-scoped reads that today are separate IPC surfaces:
   **doc-nav listings** (`rag-doc-heads`, `RagDocHeadsPayload`), **search results**
   (`RagQueryResult`), **crosslinks/backlinks** (`RagBacklinksPayload`), **doc-heads**, and
   **operator/template data as applicable** (`OperatorSettings`, the template payloads). The pane data
   set is **enumerable, not "whatever the pane happens to read"** — a pane read outside the set is a
   spec item on the pane's owning unit, not a silent new cache class.

**Everything else is NOT in the cache** — the whole-store snapshot as a *resident* structure, other
documents' subgraphs, the vector cache (`provident-vector-cache.json`, a **separate host-owned store**),
`security-store`/`authority-store`/`idempotency-registry`/`query-audit` (§11.1 item 4), and the
multi-store registry's other stores' corpora.

### 12.2 Residency, the miss policy, and WHO GUARANTEES RESIDENCY

**The residency rule (pinned here — the architecture did not specify it).**
- A document is **resident** iff its **tab is open** and **its tab-open fetch has completed
  successfully**. Residency is a **per-document** property, not per-store and not per-pane.
- **WHO GUARANTEES RESIDENCY — pinned: the host's tab-open load path.** The **tab lifecycle owns
  residency**, not the reader. Concretely: `TAB-OPEN → async fetch → cache-populate → notify → stage
  renders`. A sync read is legal **only** after the populate step for that document. **No consumer may
  assume residency**: consumers read through the store interface and must handle the miss.
  *Why this choice:* the alternative (each reader fetches on demand) puts an async call behind every
  sync read site — exactly the unbounded re-derivation §11.5 rejected — and makes the "13 sync reads"
  pin unimplementable. Making the **tab** the residency owner keeps a **single** async seam and a
  **single** place where the failure UX lives (§12.5).

**The miss policy (pinned here).** A **read for a non-resident document is a defined failure**:
1. it **throws / returns a typed `unavailable` failure** naming the document id and the reason class
   (**not resident** vs **engine absent** vs **load failed**) — **never** a silent empty result,
   `undefined`-as-empty, an empty node list, or an empty stage;
2. it **never** triggers a silent local read of the persisted local store as a fallback. A local read
   is legal **only** for a document the cache has populated, i.e. one whose data came through the
   tab-open fetch (this is the whole content of *"a cache miss may not be served by a silent local
   read"*);
3. it **must not** be swallowed by an empty-state guard. The existing M1 "empty-snapshot guard"
   (`src/renderer/pane-registry.ts` `PaneContext.snapshot: RagSnapshotPayload | null` → the
   "(no documents)" empty state) **[verified]** stays legal for a **genuinely empty store** and must
   **not** be reachable for a **miss** — the two states must be **distinguishable** in the spec's
   state matrix.
   *Why pinned:* today's `null`-snapshot guard conflates "not loaded yet" with "no documents"; under
   this ruling that conflation is a **silent empty stage**, which §12.5's failure UX forbids.
4. **Fail-state matrix the TestWriter must derive (per read):** (a) resident-and-loaded → value;
   (b) not resident, tab open, fetch in flight → **pending** (a typed in-flight state, not a
   value and not an empty); (c) not resident, no fetch in flight → **typed-not-resident**;
   (d) resident but the engine went absent mid-session → **typed-unavailable** (§11.3's warning
   surface); (e) resident, load failed → **typed-load-failed** (§12.5). **Five states, four of them
   failures or pendings — never one silent empty.**
   **The engine-absent-at-tab-open case is NOT a sixth read state:** under §11.3 the **wiki cannot be
   opened at all** when no engine is found, so an engine-absent tab-open is decided at the **refusal
   boundary** (`TAB-OPEN` refuses and surfaces the typed warning) **before** any read; case (d) covers
   the mid-session loss *after* that boundary. **Pinned so the two are not conflated:** the refusal is
   a **tab-open outcome**, the typed-unavailable is a **read outcome**.

### 12.3 EVICTION — what happens to a document's cache when its tab closes

**Pinned (the architecture did not specify it):**
1. **A document's cache entry is released when its LAST owning tab closes.** Two tabs over one
   document share **one** cache entry; closing one leaves the entry resident.
2. **Release is immediate on the last close for a CLEAN tab** (no uncommitted edits). "Clean" is the
   dirty-state machine's bottom state (§12.4).
3. **Release is DEFERRED for a DIRTY tab under a close** — and the deferral is a **spec'd state**, not
   an accident. Pinned shape: the tab enters **`closing-dirty`**; the cache entry **stays resident**
   while the commit is attempted; on a **successful** commit the entry is released; on a **failed**
   commit the tab **does not leave silently** — the failure surfaces (§12.5) and the entry is released
   **only** when the user resolves the warning (retry / discard). *Why:* releasing a dirty entry
   discards the only copy of the user's uncommitted text; keeping it forever leaks. The
   **resolve-or-discard** step is what makes the choice safe, and it must be **spec'd, not implied**.
4. **A re-opened tab re-fetches** — a released entry is **not** repopulated from a local read
   (§12.2 item 2). Re-opening a tab is a **new tab-open fetch**.
5. **No TTL/LRU eviction is pinned here.** The ruling's cache is a **working set**, so a time- or
   size-based evictor would be a **second eviction authority**; if one is wanted it is **its own spec
   item** with its own red set. **Pinned as NOT present.**
6. **Eviction is observable**: a release must be assertable in a node test (the entry's residency flips
   with a tab close), and the **dirty deferral** must be assertable on both legs (commit ok → released;
   commit fail → still resident + warning surfaced).

### 12.4 THE DIRTY STATES (`ST-4` / `TAB-2` interlock)

The ruling's eviction and failure rules read the **dirty machine**, which today is **not** pinned. This
record pins the **state names and transitions** and leaves the **conflict predicate** to `TAB-2`'s
**spec-first** red set (§3.3 C10 — *no code until the predicate is pinned*):

| State | Meaning | Set by | Cleared by |
| --- | --- | --- | --- |
| **`clean`** | the cache entry matches the committed store state for that document | a successful commit; a fresh tab-open fetch | any edit |
| **`uncommitted`** | the user has edited and the commit has **not** been attempted/settled (the **active tab during edits**) | an edit on the stage | a commit attempt |
| **`commit-failed`** | the commit was attempted and **failed** (`ST-5`'s "failure to commit") | a failed commit | a successful retry, or an explicit discard |
| **`closing-dirty`** | §12.3 item 3's deferred-release state | a close request while `uncommitted`/`commit-failed` | commit ok (→ release) / user resolve-or-discard |

**Pinned rules:** all three dirty states are **per tab** (not per document); `TAB-1`'s **warning symbol**
is bound to **`commit-failed`** (and to `closing-dirty` while it persists); **exactly one** state at a
time; and **`TAB-2`'s conflict predicate is defined OVER `ST-4`'s diff** — the conflict identity (same
RAG element **and** same field; subtree-root vs children-offset) is **`TAB-2`'s spec-first deliverable**
and is **NOT pinned by this record** (§3.3 C10, §3.5 E's C10 row).

### 12.5 FAILURE UX — an async load failure or engine-absence at tab-open must SURFACE

**Pinned:**
1. **The `TAB-1` warning-symbol class is the carrier.** An async load failure **or** an engine-absent
   condition at tab-open surfaces **in the tab** (the `TAB-1` warning-symbol class — *"a document that
   fails to commit displays a warning symbol in tab"*, extended by this ruling to **tab-open load
   failure / engine-absent**), **plus** whatever typed detail the stage shows. The **class is shared**
   between `ST-5`'s commit failure and this ruling's load failure; the **reason is distinguishable**.
2. **NEVER a silent empty stage.** The forbidden outcomes are enumerated so a red set can assert their
   absence: an empty stage that looks like a document with no content; a `null` snapshot rendering the
   empty-state guard's "(no documents)"; a swallowed rejection; a spinner that never resolves. Each is
   a **fail-state** in the spec.
3. **Engine-absent at tab-open is §11.3's refusal**, surfaced with the **typed** vocabulary (the
   `EngineUnavailable` class named by catalog `PRUNE-829` **[verified — §C.4 row 829]**: "engine-absent
   reads raise the typed unavailable error"). The **contract's identity clause is reversed** (§11.3),
   but the **typed-failure obligation is retained**: a refusal to open a wiki is a **loud, typed,
   user-visible** state — never a silent degrade.
4. **The warning survives a re-derive** (the `ST-5`/`TAB-1` obligation from §3.5 E's C9 live red set)
   — a tab state stored only in transient DOM does not satisfy this.
5. **`MCP-UI-EQUIVALENCE`**: the tab warning needs a **state owner** and an **MCP-visible counterpart**
   wherever the tab surface is app-graph authored. The counterpart shape is the owning unit's spec item,
   not this record's pin.

### 12.6 WHAT "PERSISTS" MEANS (`GN-1`'s persistence clause, read against the ruling)

**Pinned:**
- **The tabs' OWN state persists** — **open tabs / their targets / their order** (and the active tab),
  serialized through `DECIDED: UI-CONFIG-CARRIER`'s `OperatorSettings` shape (`openTabs`/`activeTab`)
  **[verified — `docs/decisions.md` §ACTIVE `UI-CONFIG-CARRIER`]**, with the carrier's fail-soft
  `sanitize`/defaults discipline and the rule that **credentials are never serialized here**.
- **The document data does NOT persist in the host.** The cache is a **working set, not a store**: it is
  a cache of engine-owned data, it is not the authority, and its loss is **recoverable by re-fetching**
  — which is exactly what makes `GN-1`'s "Astrographer persists no documents other than the data owned
  by current tabs" coherent under §11.1.
- **"Other than the data owned by current tabs" is therefore read as: a cache, not a persistence
  claim.** The host persists **no** document bytes. **Any** surviving local document persistence after
  the cutover is a **fence violation**, not a hedge.
- **Boot sequence (pinned):** restore tabs/targets/order from `OperatorSettings` → **fetch the active
  tab's document asynchronously** → render; **the other restored tabs do not pre-populate the cache** —
  they fetch on focus/open (§12.3 item 4). *Why:* pre-fetching N restored tabs at boot would make boot
  cost scale with tab count and would load documents the user may never look at — the opposite of a
  working set.

### 12.7 THE CONSEQUENCES THIS RULING FORCES

**(a) The commit path becomes an ASYNC ENGINE WRITE — a recorded REVERSAL.** `GN-1` (§11.1) makes the
engine the authority for document CRUD; therefore the commit is an **engine hop**, and the following
exclusion is **REVERSED**, explicitly and by name:

> **REVERSED (2026-09-21, by the §11.1 ruling + §11.5's read model):**
> `docs/specs/astrographer-scope-realignment-review.md` §3.3's WRITE PATH row —
> *"`src/main/edit-ops.ts`, `src/main/doc-flow.ts`, `src/main/rich-decompose.ts`,
> `src/main/paste-sanitize.ts` — **commit-on-blur editing cannot be async-chunked behind an engine
> hop**."* That exclusion no longer holds: under the ruling the commit **is** behind an engine hop.
> **The unit that must RESTATE the commit contract is the `WHOLE-PAGE-EDITING` unit** (`C9`
> `U-EDIT-1`, §3.3 C9) — its spec re-derivation carries the async commit, the one-`applyBatch`
> atomicity requirement (`DECIDED: BATCH-ATOMICITY-API`) as it survives the hop, the single invertible
> journal entry (`DECIDED: PROJECT-JOURNAL` + `C16-CONSUMES-PROJECT-JOURNAL`), and the
> **`commit-failed`** state of §12.4. **No other unit may restate it**, and no unit may implement an
> async commit before that restatement lands.

**(b) The fence plan.** §14.2 — the two fence tests are **explicitly re-planned**, not silently
re-derived; the fence exemption of §3.1/§3.2 **still stands** and the re-plan is the *reason it can
stand*.

**(c) The prerequisites.** §13 P2 — **`U-ENGINE-PERSIST`, `U-AUTHORITY-SWITCH` (O-8),
`U-CORPUS-MIGRATION`, `U-READS-PIVOT` + the fence plan** must land **before ANY cutover**.

**(d) The "temporary authority" gap.** §13 sequencing rule S1 — until P2 lands, the contract says
**engine-authoritative** while the code still writes **locally**; **that gap is RECORDED, never
hidden**, with a named sunset condition.

**(e) `DN-1` is re-opened by the ruling, not resolved by it.** §11.1's engine authority means the
doc-nav "listen to Gnosis" need (`DN-1`) is now a **real** need met by **GR-5**'s store-change
notification route — which is an **upstream-owed** row (`docs/HANDOFF.md`'s GR-5 item; §C.4
`PRUNE-805` **[verified — the ledger row reads "an opaque change cursor rather than a revision"]**).
**`DN-1` therefore stays PARKED with its GR-5 reason**, per §13 P3.

**(f) The two-contract-regimes guard is NOT lifted.** §3.6 F.3 item 3 stands: no unit may be spec'd
against local-authoritative assumptions while its neighbour is spec'd against engine-authoritative
ones. The ruling **sets the destination**; the **program** (§13) is what keeps any unit from running
over two regimes. **Every unit's DONE row must state which regime it assumed.**

### 12.8 THE UNITS THE READ MODEL RE-SCOPES

| Unit / row | How the read model re-scopes it |
| --- | --- |
| **`C9` `U-EDIT-1`** (the `WHOLE-PAGE-EDITING` unit) | **Re-scoped at its core**: its spec re-derivation now carries the **async commit** (§12.7(a)), the `commit-failed`/`uncommitted` states (§12.4) and the `TAB-1` warning class (§12.5) |
| **`C10` `U-TAB-MERGE`** (`TAB-1`, `TAB-2`) | **Strictly after `C9`** (unchanged), and now **also** read over the **dirty machine** (§12.4) and the **eviction deferral** (§12.3 item 3). `TAB-2` stays **spec-first** |
| **`C12` `DN-1`** | **Still PARKED on GR-5** (§12.7(e)); the ruling **strengthens** the reason (the engine is now the authority, so a local refresh path is a temporary-authority artifact with a sunset). `DN-2` is unaffected (it rides O-9) |
| **`C11` `U-SEARCH`** (`SR-1`…`SR-5`) | **Re-scoped**: search results are **pane data** (§12.1 item 2), so the in-pane/in-tab split (`SR-1`/`SR-2`) is now a **cache-class** question, and a search hit on a **non-resident** document must follow §12.2's miss policy rather than opening from a local read |
| **`C4` `U-CHROME-PIN`**, **`C5` `U-ZONES`**, **`C7` `U-PANE-GESTURE`**, **`C8` `U-STAGE-TYPE`**, **`C6` (`FB-1`)** | **Not re-scoped by the read model** (geometry/gesture/decomposition/structure only) — but each owes the **regime declaration** in its DONE row (§12.7(f)) |
| the **`GN` checkpoint carrier** (`C3`) | **Re-scoped**: instead of the destination row's "not scheduled / stay ACTIVE" clauses (§3.2 B.2 items 1(c)/(d)), it carries the **ruling's** rows: the three `SUPERSEDED` rows, the `ENGINE-ABSENT-DEGRADED-CONTRACT` reversal, the `GNOSIS-LAUNCHER-TOGGLE` amendment, the enumeration/exclusion record, and the **temporary-authority + sunset** clause |
| **the `D.4` generator spec** | **Unaffected in ordering** — it must still be authored **before** the catalog amendment lands (§3.4 D.4); the ruling adds the `EN-2`-untouched status of `GN-2` (no token, no reclassification) |
| **everything at `O-9`/`O-10`** | **Unaffected** — re-expression, never re-spec (§3.1 class (iv)); the read model writes no pin those units own |

---

## 13. THE APPROVED PROGRAM (P0–P4)

> **This is the plan the record now carries.** It is the user's approved program (2026-09-21),
> expressed as phases with **prerequisite gates**; it **restructures §6.2's order** only where the
> ruling requires it (the `GN-*` items stop being blocked and become a **contract-change phase** with
> real prerequisites). **The already-gated `O-0 → O-5 → O-9(+O-3) → O-10 → O-1 → O-2` queue is NOT
> re-opened** (§3.3 C, §6.2); the extension units interleave with it exactly as §6.2 says.

### 13.1 The phases

| Phase | Contents | Why it is in this order |
| --- | --- | --- |
| **P0 — the doc layer** | (a) the **gate tracker rows** (the landing pass's R1–R19, §5.2, in their ruled form); (b) the **`EN-2` amendment** (§3.4 D.2 — forward-filing duty, three mandatory clauses, **no token, no reclassification**); (c) **`U-CHROME-VERIFY`** (§3.3 C2 — already-satisfied verification pass, doc-layer, zero code); (d) the **catalog generator's SPEC authored FIRST — because its trigger has ALREADY FIRED** (§3.4 D.4) | P0 changes the criterion by which every later row is filed (C1/`EN-2`) and closes the already-satisfied set for free; and the **generator's spec must exist before the catalog amendment lands**, or the generator encodes an unadjudicated criterion (`K7`) |
| **P1 — the Gnosis contract change** | (a) the **supersession/amendment rows**: `RAG-AUTHORITATIVE`, `SINGLE-WRITER-STORE`, `SINGLE-WRITER-STORE-PER-STORE` **SUPERSEDED**; `ENGINE-ABSENT-DEGRADED-CONTRACT` **REVERSED**; `GNOSIS-LAUNCHER-TOGGLE` **AMENDED**; `ASTROGRAPHER-SCOPE-REALIGNMENT` **AMENDED** (§11.1/§11.3); (b) the **upstream handoff rows**: **engine persistence O-7** (+ the GR-7 durability direction, `PRUNE-838`), the **notification route GR-5** (`PRUNE-805`), the **GR inventory** (GR-1…GR-9 as a single indexed set, incl. **GR-4**'s revisioned projection route — the read model's own transport, §14.4), and the **durability direction**; (c) the `GN-2` **enumeration** + its exclusions (§11.4) | the contract must read as the ruling says **before** any unit is spec'd against it — otherwise a unit is spec'd against a contract that no longer exists (`K1`). P1 writes **decisions/tracker/handoff text only**: it is doc-layer for this repo, and every engine-side item is a **handoff, never a patch** (AGENTS.md item 7) |
| **P2 — PREREQUISITE UNITS — nothing cuts over before these land** | **`U-ENGINE-PERSIST`** (the engine's durable corpus; the O-7 leg), **`U-AUTHORITY-SWITCH`** (the O-8 authority-switch / offline dual-path — the track's stated PREREQUISITE), **`U-CORPUS-MIGRATION`** (the **226-doc / 6 102-node** operator corpus + **journal/undo + rollback**), **`U-READS-PIVOT`** (this ruling's read model, §12) **+ the explicit fence plan** (§14.2) | **This is the gate.** Without `U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION` the corpus is lost at the next restart (§14.1); without `U-AUTHORITY-SWITCH` there are two writers over overlapping state; without `U-READS-PIVOT` there is no defined read path; without the fence plan the fence is re-derived silently (`K1`) |
| **P3 — the extension units** | the architecture's order (§3.3 C / §6.2), with two hard rules: **`TAB-2` strictly after the `WHOLE-PAGE-EDITING` unit** (`C9`), and **`DN-1` PARKED with its GR-5 reason** | the order is the architecture's and is unchanged; the two hard rules are the ruling's consequences (§12.7(e), §12.8) |
| **P4 — parkings + close-out** | the parked sets (`C13`/`C14`; `TB-4`, `SR-3`, `FL-1`, `FL-2`, `ST-1`'s live-markdown half) **with named revisit conditions**, and **item-10d / the adversarial close-out** | a parked row without a named revisit condition is a review finding (§3.5 E); the close-out is the item-10d + RCA-3 obligation, run once at the end of the program as well as per unit |

**The program also carries the user's instruction: an ARCHIVAL PASS on obsolete documents runs as part
of this program** — with **`GN-2`'s enumeration + per-item sign-off + the exclusions** (§11.4). It is
its **own pass** (one atomic tracker-writing pass, §3.4 D.4), it **never** executes from the catalog's
authority, and it **may not** touch any named exclusion.

### 13.2 The sequencing rules (S1–S5)

- **S1 — TEMPORARY AUTHORITY + SUNSET (mandatory to state, never to hide).** **Until P2 lands, the
  local store is a TEMPORARY authority with a recorded sunset condition.** The contract **says**
  engine-authoritative while the code **still writes locally**; **that gap is RECORDED in the P1 rows
  and in every unit's DONE row — never hidden.** The **sunset condition** is: *the local store's
  authority ends when `U-AUTHORITY-SWITCH` (O-8) lands and the authority-switch row records the
  cutover* — from that point, any surviving local document write is a **fence violation**, not a
  temporary authority. **No pass may state the contract as if the cutover had already happened.**
- **S2 — no unit runs over two contract regimes** (§3.6 F.3 item 3; `K1`). The ruling **sets** the
  destination; a unit that cannot declare one regime **cannot be delegated**.
- **S3 — the fence is re-planned, not re-derived** (§14.2). Any unit whose work touches the fence must
  cite the re-plan; a unit that "adjusts" the fence is **re-entering this gate** (§11.1 item 5).
- **S4 — the prerequisites are gates, not tails.** `O-8` is the track's **PREREQUISITE, not a tail
  unit** — that fact is from the rejected recommendation's verified reasons and the ruling **adopts**
  it (§11.1). A phase plan that sequences `GN-1`'s implementation before O-8 **is not this program**.
- **S5 — one atomic tracker-writing pass per phase.** The generator's trigger is observed **once**
  (§3.4 D.4); P1's rows and the archival pass are **one pass each**.

### 13.3 Per-unit gate obligations

**The obligation test (unchanged from §6.1).** A unit is **code-bearing** iff it changes any
`.ts`/`.mjs`/test file, the envelope authoring model, the store, or any observable app surface.
**Code-bearing** units owe: their own `docs/specs/unit-<name>.md` contract; a **typed §5.x property
register**; a **TestWriter red run, reported (RCA-1)**; an **Implementer green**; the **trio**
(`AGENTS.md` item 4); an **RCA-3 adversarial** pass recorded in the spec's §3a/§3b; **RCA-4 blind
greens** by a non-author; an **item-10d doc review** (record at
`archive/reviews/<date>-<unit>-doc-review.md`); and a DONE row stating the **layer** (RCA-12), the
**recorded red set**, and the **contract regime** (S2). **Doc-layer** units owe: a **recorded zero-row
§5.x exemption** (never a silent default), **no trio obligation** (trio as a regression *reading*
only), and the read-only adversarial + item-10d + oracle-hash-before/after pair.

| Phase item | Code-bearing? | Mandatory gates beyond the standard set |
| --- | --- | --- |
| **P0**: the tracker rows, `EN-2`, `U-CHROME-VERIFY`, the generator **spec** | **NO — DOC-LAYER** | recorded zero-row exemption; read-only adversarial + item-10d; the generator's **own unit** (code) is **not** discharged by P0 |
| **P1**: the supersession/amendment rows, the handoff rows, the `GN-2` enumeration | **NO — DOC-LAYER** | as above; **every engine item is a handoff row, never a code change** (AGENTS.md item 7: *do not patch the Gnosis repo*) |
| **P2 `U-ENGINE-PERSIST`** | engine-side (**handoff**) + any host-side client seam | **live battery MANDATORY** for the round-trip; the durability direction (`PRUNE-838`) is the upstream owner's |
| **P2 `U-AUTHORITY-SWITCH`** (`O-8`) | **YES** | **live battery MANDATORY** (the two-writer/split-brain surface is an assembled-app property, RCA-12); the authority-switch row records the **sunset** (S1) |
| **P2 `U-CORPUS-MIGRATION`** | **YES** | **live battery MANDATORY** + the **rollback red set**: journal/undo, the corpus census (**226 docs / 6 102 nodes**), and a **verifiable restore**. `O0_OPERATOR_DOCUMENTS = 226` must not be re-seeded (§3.6 F.3 item 9) |
| **P2 `U-READS-PIVOT`** | **YES** | **live battery MANDATORY** (residency/eviction/failure-UX are assembled properties); node red set for the miss policy + the residency flip; the **fence plan** (§14.2) lands **with** it |
| **P3 extension units** | per §6.1's table — **unchanged** | `TAB-1`/`TAB-2` carry the warning class + dirty machine (§12.4/§12.5); the **assembled/UI units keep their MANDATORY live batteries** (`C4`, `C5`, `C7`, `C9`, `C10`, `C11`) |
| **P4 parkings + close-out** | **NO** | each parked row carries its **named revisit condition**; the close-out is item-10d + RCA-3 run at program end |

**Mandatory live batteries for the assembled/UI units (RCA-11) — restated, since the read model makes
them more load-bearing, not less:** `C4`, `C5`, `C7`, `C9`, `C10`, `C11` plus **P2's four units** run
against the app (`scripts/live-drive.mjs` on a usable display) **before** their DONE rows. **Parking
language may not be used** for an exercisable surface; only a **structurally non-exercisable** surface
(an OS-owned native dialog / a scope the MCP+CDP surface cannot reach) parks, **with the recorded
reason** (RCA-11). **The §5.U matrix is FULL at 8** — every live assertion enters as a **re-pin or an
extended row**; `MATRIX_ROWS` must not change (§6.2, §7.4).

**Oracle-identity discipline is unchanged (§6.2, §7.2):** a change to **either** file of the pair
(`src/shared/o0-report.ts` + `scripts/live-drive.mjs`) invalidates the recorded live provenance and
forces another live run → §3b re-audit → doc review. **No unit of this program may touch the pair as a
side effect.**

---

## 14. CONSEQUENCE TABLE + RE-PLANNED FENCES

### 14.1 The consequence table (so no reader can miss it)

| # | The condition, stated plainly | The gate that holds it |
| --- | --- | --- |
| **C-1** | **The engine persists NOTHING today (O-7 unmet) ⇒ without `U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION` first, the operator corpus is LOST at the next restart.** The corpus is **226 documents / 6 102 nodes / 9 266 edges** in the local store (`provident-rag.json` in userData). There is **no engine durability** (`PRUNE-838` / GR-7 is an upstream-owed, non-prunable ledger row) and **no migration unit exists**. | **`U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION` before ANY cutover** (§13 P2). This is the **least reversible action in the whole input** (§9.2) and the materialised `K2` risk. **⟨CORRECTED 2026-09-28 (`X-7`, the `W0` dossier-and-decision pass; ANNOTATE-BESIDE — the row above is the as-written record and is not rewritten).⟩** **THE PREMISE IS STALE AND THE CONDITION IS RESTATED, NOT DELETED:** the engine's own trackers record **`D-D1`** + **`D-D2`** as **DONE — LANDED-GREEN + ALL GATES RUN (2026-09-22)** (the durable store: format, the atomic temp → `fsync` → `rename` commit, recovery, retention/floor, the `durability` axis on `HealthReport`, §11's 22nd row) and **`GR-7`'s three-conjunct trigger as DISCHARGED** (*"The shell doesn't own it."*) — `../Gnosis/docs/next-steps.md` §DONE rows `D-D1`/`D-D2`; `../Gnosis/docs/pending.md` `GR-7`; `../Gnosis/docs/specs/durable-store-spec.md` §8A; `docs/decisions.md` `DURABLE-STORE-LANDED`. **LAYER: ENGINE-green — never app-green, envelope-green, store-green or live-green in this repo.** **RESTATED CONDITION:** the operator corpus (**226 documents / 6 102 nodes / 9 266 edges**, still in the LOCAL store `provident-rag.json`) is at risk at the next restart **because no cutover has happened**, and **this repo has NOT verified the engine's durability live**; the **unsatisfied conjunct is the engine's INGEST / RECORD-COPY route** (`GR-6a`, **PARKED, trigger UNDISCHARGED, unfireable from the fork** — `docs/pending.md` `GR-6a`; `docs/specs/gnosis-grq-inbound-review.md` §4 `GRQ-6` + §11; `docs/specs/unit-corpus-migration.md` §10.3 `FS-CM-1`), **not persistence**. **WHAT DISCHARGES IT:** the ingest/record-copy route accepted upstream → `U-CORPUS-MIGRATION`'s **live** run producing a verifiable `MigrationReceipt` (census equality across the move + a verified rollback restore, the first fork-side engine-persistence evidence) → `U-AUTHORITY-SWITCH`'s `authority-switch` record firing the sunset. **The `U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION`-before-ANY-cutover fence STANDS, scoped as `G-4` rules it** (it forbids removing a local write/read path for engine-owned data while the ingest route is parked, and does **not** forbid the `PD-UI-2` CSS-write replacement). **This is a GATE CONDITION, and the correction does not discharge it — it re-aims it: `U-AUTHORITY-SWITCH`'s condition `C2` ("engine persistent") is now satisfied at the ENGINE layer and must be read as an evidence-obligation on THIS repo, not as an upstream wait** (see `docs/specs/unit-authority-switch.md` §3.2 `C2` + the §2 layer block that already records what a green here does not establish). |
| **C-2** | **The read model makes RESIDENCY A PRECONDITION OF RENDERING.** With no resident cache entry there is no render: rendering is downstream of an async engine fetch, so **engine presence is on the render path** (§11.3 interlock). | **`U-READS-PIVOT`** (§12.2/§12.5) + the miss policy as a **red set**, and `U-AUTHORITY-SWITCH`'s offline dual-path |
| **C-3** | **The fence tests must be EXPLICITLY RE-PLANNED, not silently re-derived** — `tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts` ("must stay green unchanged"). | **§14.2's fence plan lands WITH `U-READS-PIVOT`** (§13 P2) |
| **C-4** | **~120 of 221 test files import the data layer directly** (259 direct import statements — a **reading**, §14.3), and the tests assert **store state and file shape**, not HTTP calls. | the **regime declaration** (S2) + the fence plan; the re-derivation set must be **scoped, never unbounded** (`K1`) |
| **C-5** | **The sync-read pin now rests on the cache, not the store** — the 22-member `RagStore` interface keeps its **13 synchronous reads** (22 = 13 sync + 9 async, recounted symbol-by-symbol in `src/main/rag-store.ts` `interface RagStore` by this review; the `16`/`6` figures carried earlier in this record were wrong), and they are legal **only** for resident data. | §12.2's residency rule + miss policy; the pin is **not** amended |
| **C-6** | **The commit path is an async engine write** — the scope-realignment write-path exclusion is **REVERSED** (§12.7(a)). | **`C9` `U-EDIT-1` restates the commit contract** — no unit implements an async commit before that restatement |
| **C-7** | **`GN-2`'s disposition is irreversible in one direction** — the archive copy is gitignored; only the git-visible tombstone is durable. | **the enumeration + per-item sign-off BEFORE any disposition** (§11.4) |
| **C-8** | **A user without the engine binary can open NO wiki.** | §11.3's reversal rows + §12.5's typed surfacing |

### 14.2 THE RE-PLANNED FENCES (explicit — this is the plan, not a re-derivation)

**The fence pair is exempt by name (§3.1/§3.2 B.4) and is re-planned here.** The exemption is *why* the
re-plan can stand.

| Fence | What it asserts (verified) | The re-plan |
| --- | --- | --- |
| **`tests/import-render-no-duplicates.test.ts`** | the **real import → render pipeline**: `parseMarkdown` → `createJsonRagStore` (**a LOCAL JSON store, created in a temp dir**) → `buildTraversal` → the Runtime's rendered DOM; every RAG node materialized **exactly once** and the text **1-1** **[verified — the test constructs `createJsonRagStore({path: join(dir,'rag.json')})` and imports through **one atomic `applyBatch`**]** | **Pinned: the fence stays GREEN UNCHANGED in P2.** It exercises the **local store + parse + traversal + render** path, which `U-READS-PIVOT` does **not** change (it changes the **host read/cache layer above** the store, and it changes the **transport**, not the parser/traversal/render contract). `U-CORPUS-MIGRATION` lands the corpus **through the same `applyBatch`** path, so this fence is the migration's **accept criterion**, not its casualty. **If `U-READS-PIVOT` cannot keep this green, the unit is not an implementation of the ruling — it is a new proposal re-entering this gate** (§11.1 item 5) |
| **`tests/traversal.test.ts`** | the main-process traversal **pure function** (`buildTraversal`, `TraversalInput`/`TraversalResult`/`LineNodeMap`) over a **local** `createJsonRagStore` **[verified — the test mocks/mounts the shim and builds real local stores]** | **Pinned: the fence stays GREEN UNCHANGED in P2.** `buildTraversal` **stays in-process** (a Node worker is the only sanctioned off-thread move = **O-4**, CONDITIONAL, `docs/specs/astrographer-scope-realignment-review.md` §3.1/§3.2), and the ruling moves **where the data comes FROM**, never where the traversal runs. Its input contract is unchanged |
| **the re-derivation set (NOT a fence)** | the wider cross-section that asserts store **state/file shape** | **Explicitly scoped, not deleted**: `U-AUTHORITY-SWITCH`'s spec names the **re-derivation set by file** and the **regime split**, and the read-model pivot is **chosen precisely to avoid** a wholesale async re-derivation (§11.5's reason against the async-end-to-end alternative). **A unit that finds itself rewriting fence-shaped assertions must stop and re-enter this gate** |

**Verification of the fence plan is a P2 gate:** the fence must be **run** (trio) as `U-READS-PIVOT`'s
and `U-CORPUS-MIGRATION`'s **regression reading**, and the reading recorded in their DONE rows — the
**last recorded reading** being `221 files / 4 988 passed / 58 skipped / 0 failed` (`docs/HANDOFF.md`,
`docs/next-steps.md`; a **READING**, §14.3). **No unit may report the fence green from a plan.**

### 14.3 The test-surface census (readings, never claims)

| Item | Figure | Status of the figure |
| --- | --- | --- |
| **Test files** | **221** | a recorded **reading** (`docs/HANDOFF.md`, `docs/next-steps.md`, `docs/defects.md` `SUITE-RED-AFTER-VITEST5-ELECTRON44`'s current-tree note) |
| **Test files importing the data layer DIRECTLY** | **~120 of 221** | a **grep reading** over `src/main/{rag-store,retrieval,traversal,adjacency,doc-flow,edit-ops,markdown-import,merge-store-results,engine-rag-store,engine-crud-rag-store}` imports (the critique's §1.2 count) — **an approximation, never a census claim** |
| **Direct import statements in that cross-section** | **259** | the same grep reading |
| **Suite reading** | **`221 files / 4 988 passed / 58 skipped / 0 failed`** | a **reading at a named pass** — **not** re-run or re-derived by this record |
| **The two fence files** | **2** | named, exempt, re-planned (§14.2) |
| **The `§5.U` matrix** | **8 — FULL** | pinned; assertions enter as re-pins/extended rows; `MATRIX_ROWS` must not change |

**The census rule this record obeys:** a figure in this table is a **reading with a named source**, and
**no hash or count in this record was recomputed** (this pass has no shell) — the mechanical re-read is
**owed to a shell-bearing pass** (§6.2, §8.1 P5, §10.2 item 15).

### 14.4 The transport, verified against the record and the code

**The question put to this pass: is the existing snapshot-pull seam the natural transport for the
tab-open fetch?** **Answer: YES for the local leg, with one correction and one owed item.**

| Fact | Verified where | What it means for the transport |
| --- | --- | --- |
| **`RagSnapshotPayload` is `{store, nodes, edges}`** — the **`revision` field is NOT in the type** | `src/shared/types.ts` `IPC_RAG_SNAPSHOT` / `RagSnapshotPayload` **[verified]** — the interface declares **three top-level fields** (`store`, `nodes`, `edges`), with `store` REQUIRED and naming the registry-resolved store, and a node carrying `ownedNodeIds` plus the optional inline `children` | **CORRECTION to the ruling's phrasing:** the seam the user named (`RagSnapshotPayload {nodes, edges, store, revision}`) carries **three** fields today; **`revision` is OWED** — recorded as owed by `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT` ("today's `RagSnapshotPayload {nodes, edges, store, revision}`, whose `revision` field is **OWED** — GR-4") and by `docs/specs/astrographer-scope-realignment-review.md` §3.1 ("the only engine→shell crossing is the revisioned `RagSnapshotPayload {nodes, edges, store, revision}` (the `revision` field is **OWED** — see §2.2 C2)"). **§14.4's pin: the tab-open fetch may be built on the existing seam, but a cache cannot be made coherent without a revision/marker — so the revision field (or an equivalent marker) is a PREREQUISITE of `U-READS-PIVOT`, and §11.5's "what it does NOT decide" records it** |
| **`DECIDED: RAG-SNAPSHOT-PRESERVED`** — "the `RagSnapshotPayload` + the `rag-snapshot` IPC are PRESERVED for `buildTraversal` (the rendering half)" | `docs/decisions.md` §ACTIVE **[verified]** | the seam is **pinned ACTIVE**; the read model **builds on** it and **does not supersede it** |
| **`DECIDED: SCOPED-LOAD` / `DECIDED: SCOPED-WALK`** — the doc list finds only heads; rendering walks only the reachable subgraph from the head | `docs/decisions.md` §ACTIVE **[verified]** | the tab-open fetch is **document-scoped by construction**: the scoped walk is exactly the per-tab granularity the ruling wants |
| **`computeDocumentSubgraph(store, documentId): DocumentSubgraph`** — the SINGLE shared derivation of a document's node ids + scoped edges; PURE; throws `computeDocumentSubgraph: store required` / `computeDocumentSubgraph: documentId must be a non-empty string`; used by **both** the scoped `buildTraversal` walk and the `rag.get_document` MCP tool | `src/main/traversal.ts` `DocumentSubgraph` / `computeDocumentSubgraph` **[verified]**; `src/main/mcp-server.ts` + `src/main/retrieval.ts` consume it | **the per-document load unit the tab-open fetch needs already exists as a shared derivation** — the fetch's **payload** is a document subgraph, and it must be built from **this** function, never re-derived inline (a second derivation would break `rag.get_document`'s single-source identity) |
| **`buildTraversal({store, documentIds, zoneName})`** — the scoped walk, in-process, pure | `src/main/traversal.ts` `TraversalInput` / `buildTraversal` **[verified]** | the traversal **stays host-side** (it is the render path's input); only its **data source** changes |
| **the pane-data IPC surfaces** (`IPC_RAG_DOC_HEADS`, `IPC_RAG_BACKLINKS`, `IPC_RAG_QUERY`, `IPC_RAG_STORE_LISTING`, `IPC_TEMPLATE_*`, `IPC_OPERATOR_SETTINGS_*`) | `src/main/preload.ts` **[verified]** | the **pane-data class** of §12.1 already has named, separate surfaces — the cache class is **enumerable**, not invented |

**The engine-side transport (owed upstream).** For the **engine** leg, the natural route is **GR-4**'s
bulk projection-snapshot route with a **monotonic revision** — which is **OWED** (`docs/HANDOFF.md`'s
GR inventory names GR-4 "the bulk projection-snapshot route with a monotonic revision";
`PRUNE-804` is its §C.4 ledger row **[verified]**) and whose inbound review **reframes the read as
paginated cursor-tagged pages and refuses the revisioned-projection framing** **[verified — `PRUNE-804`'s
`verdict_basis`]**. **Pinned:** the transport for **P2** is the **existing local seam** (document-scoped
`computeDocumentSubgraph` + the snapshot payload + the pane-data IPCs), and **GR-4 is a P1 handoff row**
— the cache's **revision/marker requirement** is what the engine route must satisfy, and the
**cursor-vs-revision difference is a recorded open question** for `U-READS-PIVOT`'s spec, **not** a
silent assumption.

### 14.5 THE "TEMPORARY AUTHORITY + SUNSET" RULE (restated where the consequence table lives)

**Until P2 lands, the local store is a TEMPORARY authority with a recorded sunset condition** (§13 S1).
**The contract says engine-authoritative while the code still writes locally; that gap is RECORDED,
never hidden.** Its obligations, stated so a later pass cannot quietly drop them:
1. **every** P1 row and every unit DONE row in P0–P2 **states the gap** (the contract's regime vs the
   code's regime);
2. **the sunset condition is named**: the gap closes when **`U-AUTHORITY-SWITCH` (O-8)** lands and the
   authority-switch row records the cutover; **from that point a surviving local document write is a
   fence violation**;
3. **no pass may describe the cutover as already done**, and **no pass may describe the local store as
   the authority after the switch**;
4. **the gap is not a licence**: it does not authorise new local-authoritative features, and it does
   **not** lower any P2 gate.

---

## 15. STATUS

**UNBLOCKED (2026-09-21).** The gate that was `GATED 2026-09-21 — VERDICT PROCEED-WITH-AMENDMENTS
(split; `GN-1`/`GN-4` blocked)` is **UNBLOCKED** by the user's five rulings (§11): the four questions
of §10.3 **are answered** and the sync-read pivot **is resolved**.

**The verdict is unchanged** — `PROCEED-WITH-AMENDMENTS`. What changed is the **blocked state** and the
**design pins**, not the assessment: the `GN-*` items were a **precedence question plus a destination
to record**, and they are now a **contract change with prerequisites** (§13 P1/P2).

**The conditions that still hold (each is a gate, not a note).**
1. **The prerequisites.** **Nothing cuts over before P2 lands**: `U-ENGINE-PERSIST`,
   `U-AUTHORITY-SWITCH` (O-8), `U-CORPUS-MIGRATION`, `U-READS-PIVOT` + the fence plan (§13 P2, §14.1).
2. **`GN-2`'s per-item sign-off.** The disposition is **archive-with-repoint only, enumerated by id,
   each item signed off**, over the named exclusions — **no enumeration, no disposition** (§11.4).
3. **The per-unit gates.** Every code-bearing unit owes spec → typed §5.x register → **reported
   TestWriter red** → green → trio → **RCA-3 adversarial** → **RCA-4 blind greens** → **item-10d doc
   review** → a DONE row stating **layer + regime + recorded red set**; doc-layer units owe the
   **recorded zero-row exemption** (§13.3).
4. **Mandatory live batteries** for the assembled/UI units (`C4`, `C5`, `C7`, `C9`, `C10`, `C11`) and
   for P2's four units (RCA-11) — **no parking language for an exercisable surface**.
5. **The fence is re-planned, never re-derived** (§14.2), and the **`§5.U` matrix stays full at 8**.
6. **The temporary-authority gap is RECORDED** with its sunset condition (§14.5) — never hidden.
7. **The `GN-1`/`GN-4` interlock is a stated consequence**: a user without the engine binary **can open
   no wiki** (§11.3), and the engine persists nothing today (§14.1 C-1). **⟨CORRECTED 2026-09-28 (`X-7`): the *"persists nothing today"* clause is STALE — see the restated `C-1` in §14.1; the *"a user without the engine binary can open no wiki"* conclusion is UNCHANGED.⟩**
8. **The catalog-amendment target list** (§15.1): the MIRROR/JUDGMENT prose correction, the `PRUNE-820`
   stale-model claim and the `PRUNE-829`/`PRUNE-361` re-homing are **recorded + filed as defects** and
   owed to the catalog's own pass — the artifact is **cited, never edited** from here.

**LAYER (RCA-12, mandatory and unchanged): DOC-LAYER / gate record.** This pass wrote **one file** —
`docs/specs/design-extensions-review.md` — and **no** `.ts`, no `.mjs`, no `tests/**`, no tracker, no
other spec. **Nothing in this record is APP-GREEN, ENVELOPE-GREEN, STORE-GREEN or LIVE-GREEN.**
Every suite figure in §14.3 is a **reading**; no hash was recomputed; the mechanical before/after
oracle re-read remains **owed to a shell-bearing pass**.

**Two obligations this pass records and does NOT discharge.**
- **`docs/skills/designing-pages.md` does not exist in this tree** (verified by glob over
  `docs/**/designing-pages*`): the page-design skill file, its test-use-case coverage matrix and its
  demo-page index are **absent**, so **no such update was possible or attempted** this pass. The
  ruling's UI consequences (residency/eviction/failure-UX states, the tab warning class, the dirty
  machine) are pinned **here** (§12) and must be carried into that skill **when it is authored** — this
  is **owed**, and it is recorded rather than silently skipped.
- **The P0–P4 tracker rows** (the ruled forms of §5.2's R1–R19, plus the phase rows) are **owed to the
  landing pass**: this pass wrote the **gate record** only.

### 15.1 OWED TO THE CATALOG AMENDMENT PASS (recorded here; the artifact is another pass's write target)

**The landed catalog (`docs/requirement-catalog.md`) is another pass's write target** — this record (and
every spec in this batch) **cites it, never edits it**. Three items that pass must carry are therefore
**filed as defect rows and recorded here**, so no reader has to reconcile two readings:

1. **The MIRROR/JUDGMENT prose contradicts the field table.** `docs/specs/requirement-catalog.md`
   §3.3's **field table** marks **five** cells MIRROR (`id`, `capability`, `provenance`, `direction`,
   `last_verified`) and **eight** JUDGMENT (`statement`, `status_pointer`, `evidence_pointer`,
   `owner_class`, `code_anchor`, `verdict`, `verdict_basis`, `prune_signoff`) = **13 fields**, while the
   contract's status block, §3.3's heading, §8's schema census row and **§9.1 item 16** say **"6 MIRROR
   + 7 JUDGMENT"** and instruct a reader to count a **sixth MIRROR field that does not exist**; the
   artifact's header and §C.3 repeat the prose while §C.3's own enumeration lists five. **The table is
   the authority** (§9.1 item 16 pins exactly that), so **the prose is the defect**. Filed as
   **`CATALOG-MIRROR-COUNT-PHANTOM-FIELD`** (`docs/defects.md`; found by
   `docs/specs/unit-catalog-generator.md` §2.2 / §9.6(a)).
2. **§C.4 row `PRUNE-820` asserts a model that has been superseded.** Its `verdict_basis` cell reads
   *"the main-process single-writer store owns every write today"* and its `evidence_pointer` cell
   cites `docs/decisions.md#SINGLE-WRITER-STORE` — **false since the `GN-1` ruling**, and a pointer to
   a row now marked **SUPERSEDED** (its replacement is `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`).
   §C.4 is **non-prunable and cited-never-edited**, so the correction needs a §C.4-safe route (a §C.3
   correction row, or a tracker row the §C.4 row may point at) — **the same shape §11.4 already
   prescribes for `PRUNE-829`** ("re-homed/re-pointed by the ruling's own pass"). Filed as
   **`CATALOG-C4-PRUNE-820-STALE-MODEL-CLAIM`** (`docs/defects.md`; found by
   `docs/specs/obsolete-document-disposition-2026-09-21.md` §D.4.3 finding F-3).
3. **`PRUNE-829` and its §C.3 twin `PRUNE-361` must be re-homed/re-pointed by that pass** — §11.3 names
   both as **affected rows, cited never edited**, and their typed-warning successor surface is pinned in
   §12.5. No register row is added, re-keyed or retired by any of these three corrections.

**Nothing in §15.1 is a code change and nothing in it is app-green**; it is the doc-layer target list
for the catalog amendment, and the two filed defect rows are its owning tracker rows.

**PROVENANCE CLARIFICATION (2026-09-21, the item-10d documentation review).** §16's "the only write of
this pass" statements describe the **step-4 change-analysis pass** (which produced this file's §1–§10
and the GATED report) — **not** the **SpecDoc amendment pass** that appended §11–§15 and wrote the
batch's **tracker rows** (`docs/decisions.md`, `docs/pending.md`, `docs/next-steps.md`,
`docs/HANDOFF.md`). The two are different passes on one file: the amendment pass's own record is the
`DESIGN-EXTENSIONS GATE LANDING` DONE row in `docs/next-steps.md` §CURRENT WORK / handover-state, and
the five new `docs/specs/unit-*.md` contracts are its deliverables. Read §16's scope statements
accordingly, so no reader infers that the trackers landed themselves.

---

## 16. REPORT TO THE SUPERVISOR

> **Renumbering note (this pass).** This section was **§11** in the GATED record. Because the user
> directed that the new sections be **appended after §10** and that §11 be titled exactly
> `## 11. USER RULINGS (2026-09-21)`, this closing report now follows them as **§16**. **§1–§10 are
> unrenumbered and unchanged in substance** (only the ANSWERED / SUPERSEDED markers of §10.2–§10.4 and
> the dated status addendum were added).


- **Written:** `docs/specs/design-extensions-review.md` (this file) — **the only write of this pass**.
  **No** input, raw record, tracker, other spec, `src/**`, `scripts/**` or `tests/**` file was edited,
  and the MUST-NOT-EDIT corpora are untouched. **Added by the SpecDoc pass (2026-09-21):
  `## 11. USER RULINGS (2026-09-21)`, §12, §13, §14, §15** — the exact §11 title is
  `## 11. USER RULINGS (2026-09-21)`; this closing report moved from §11 to §16 (see the renumbering
  note above).
- **Gate status:** **UNBLOCKED (2026-09-21)** — verdict `PROCEED-WITH-AMENDMENTS` **unchanged**, the
  `GN-1`/`GN-4` block **answered** (§10.3's four questions carry their answer pointers; §11 carries the
  rulings verbatim). *The GATED wording (`GN-1`/`GN-4` blocked on §10.3's four questions) is retained
  in the file's head matter as the historical record.*
- **Layer:** DOC-LAYER / gate record — **nothing in this pass is app-green, envelope-green,
  store-green or live-green.**
- **SUPERSESSION / AMENDMENT TARGETS OF THE FIVE RULINGS (§11).** **`GN-1`** (§11.1): **SUPERSEDED** —
  `DECIDED: RAG-AUTHORITATIVE`, `DECIDED: SINGLE-WRITER-STORE`, `DECIDED: SINGLE-WRITER-STORE-PER-STORE`;
  **AMENDED** — `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT` (its presentation-layer half stays ACTIVE);
  **discharged/cited** — `DECIDED: SOURCE-SWITCHABLE`; and the architecture's **parked-destination
  recommendation is marked SUPERSEDED BY USER RULING in place** (§3.2 B.1). **`GN-4`** (§11.3):
  **REVERSED** — `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT`; **AMENDED** — `DECIDED:
  GNOSIS-LAUNCHER-TOGGLE`; affected-and-cited — §C.4 `PRUNE-829` + its §C.3 twin `PRUNE-361`, defects
  `DEMO-ENGINE-START-GAP` / `GNOSIS-SIDEBAR-SEAM-MISSING`, `docs/specs/astrographer-scope-realignment-review.md`
  §3.4. **`GN-3`** (§11.2) supersedes **nothing** (it confirms). **`GN-2`** (§11.4) supersedes **no
  row**. **The read model** (§11.5) supersedes **no row by name** — it amends the *reading* of the
  sync-read pin and re-scopes the units in **§12.8**. **No `SUPERSEDED` row is written by this pass**;
  the rows are owed (§13 P1).
- **The units the read model RE-SCOPES** (§12.8): **`C9` `U-EDIT-1`** (the async commit + the dirty
  states + the `TAB-1` warning class), **`C10` `U-TAB-MERGE`** (the dirty machine + the eviction
  deferral; still strictly after `C9`), **`C12` `DN-1`** (still PARKED, on GR-5), **`C11` `U-SEARCH`**
  (results are pane data; a hit on a non-resident document follows the miss policy), the **`GN`
  checkpoint carrier `C3`** (now carries the ruling's rows + the temporary-authority/sunset clause).
  **`C4`/`C5`/`C7`/`C8`/`C6` are NOT re-scoped** — each owes only the regime declaration.
- **What this pass had to PIN that the architecture had not specified** (the choice + the reason, all
  in §12): **residency ownership** — *the tab-open load path owns residency*, not each reader (a single
  async seam keeps the 13 sync reads implementable); **the miss policy** — *a read for a non-resident
  document is a typed failure (`not-resident` / `pending` / `unavailable` / `load-failed`), never a
  silent empty result and never a silent local read* (a silent fallback would defeat the ruling);
  **the five-state read matrix** (resident / pending / not-resident / engine-absent / load-failed);
  **eviction** — *release on the LAST owning tab's close; deferred to `closing-dirty` when dirty, with
  resolve-or-discard; re-open re-fetches; NO TTL/LRU* (a TTL would be a second eviction authority and
  would risk discarding uncommitted text); **the dirty-state names** (`clean` / `uncommitted` /
  `commit-failed` / `closing-dirty`) with `TAB-2`'s **conflict predicate deliberately left to its
  spec-first red set**; **failure UX** — *the `TAB-1` warning-symbol class is the carrier for
  tab-open load failure and engine-absence, and the enumerated silent-empty outcomes are fail-states*;
  **`"persists"` semantics** — *tabs' own state (open tabs/targets/order) persists through
  `UI-CONFIG-CARRIER`; document data does not (a working set, not a store)*; **the boot sequence** —
  *restore tabs, fetch the ACTIVE tab only; the others fetch on focus* (boot cost must not scale with
  tab count); **the transport correction** — `RagSnapshotPayload` carries **`{store, nodes, edges}`
  today and `revision` is OWED** (so a revision/marker is a **prerequisite** of `U-READS-PIVOT`, and
  GR-4's paginated-cursor-vs-revision difference is a recorded open question, not a silent
  assumption); and **the fence plan** (§14.2) — both fence tests stay green unchanged, with the reason
  they can.
- **Tracker rows the landing pass owes:** R1–R19 (§5.2) — the gate/DONE row + the `(D-GEN)` trigger
  correction + the queue rows (`docs/next-steps.md`); the ACTIVE destination row + the launcher
  amendment row (`docs/decisions.md`); the §SPECULATIVE repoints + the `GN-2` enumeration
  (`docs/pending.md`); the `EN-2` amendment + the §C.8 row + the amendment recount
  (`docs/specs/requirement-catalog.md`); the new `PRUNE-600`-block rows + the §C.6.3 recount + the
  §C.6/§C.7 digest-and-conflict bookkeeping + the §C.7.2 waivers (`docs/requirement-catalog.md`).
  **Plus the `BLOCKED-PENDING-USER` row** (R2). **No new `docs/defects.md` row is owed by this pass.**
  **Updated by the rulings:** R2's `BLOCKED-PENDING-USER` row is now a **resolved** row (its answers are
  §11); R5's `DECIDED: ENGINE-OWNERSHIP-DESTINATION-UNSCHEDULED` row is **replaced** by the ruling's
  three `SUPERSEDED` rows + the reversal + the amendment; R6's launcher row carries the **confirmed**
  launcher clause; R7 stands (`EDITING-*` supersessions owed at **C9's landing**). **The P0–P4 phase
  rows (§13) and the `GN-2` enumeration (§11.4) are additionally owed.**
- **Under-specified points this pass pinned:** P1–P8 in §8 (the blocked row's physical home; the
  `EN-2` amendment's exact §9.1(27) home; `X-11`-continuation vs a new `X-16`; the contract-spec/input-
  digest relationship; the oracle-hash verification's doc-layer boundary; the `(D-GEN)` correction
  rather than deletion; the three-defects-one-unit rule; `LZ-5`'s undefined "header toolbar") —
  **plus the read-model pins listed in the bullet above (§12)**.
- **NOT done, and recorded as owed rather than skipped:** the `docs/skills/designing-pages.md` update
  (**the file does not exist in this tree** — verified by glob) and the P0–P4 tracker rows.
- **Owed to a shell-bearing pass:** the mechanical before/after re-read of
  `src/shared/o0-report.ts` + `scripts/live-drive.mjs` (oracle identity `b89d6f19` + `194dfece` =
  `92a74b7d` as recorded for the ninth-run tree) and the trio as a **regression reading** — neither is
  claimed here.
