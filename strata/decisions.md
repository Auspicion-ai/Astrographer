# Astrographer — strata decisions log

The only record of user intent for this project under the strata workflow. Append-only: a decision
is never edited, reworded or annotated, and a later decision supersedes an earlier one by naming it.
One section per decision, ≤ 40 lines each. **Source** is the user's own words or the exact option
they chose, or — for a rule the corpus derived from its own measured error — the measurement itself,
which the row names. An assumption no ruling settled belongs in `brief.md` as an `ASM-n`, not here.
A **corrigendum** row is sourced by the row it corrects plus the measurement that compelled it, and
it carries that row's authority: it may not change what a user decided.

Bare `D-n` in any other file means a row of THIS log. The workflow's own rules are adopted as its
corpus states them (D-1) and are named by this tree's own files and sections, never by a canonical id.

---

## D-1 — The strata preset is installed in this project, as its first instance

**Status:** ACTIVE · **Date:** 2026-11-15

**Source (user, verbatim):** "This is the first instance of the strata preset in this project, also
start install of the appropriate control docs."

**Decision:** `strata/` is created and carries the control corpus — this register, `brief.md`, the
procedures (`README.md`, `envelope.md`, `walkthrough.md`, `examiner.md`, `rebuild.md`, `modules.md`,
`research.md`, `proposals.md`), the references (`platform.md`, `archive.md`), the trackers
(`next-steps.md`, `pending.md`), and the `records/` and `.strata/` trees. The preset that supplies
the roles lives in the deployment (`platform.md` §1), never here. The workflow's own rules are
adopted as its corpus states them — record kinds and ceilings (`brief.md` §1), the five layers
(`brief.md` §3), the nested loop (`brief.md` §4), the walkthrough (`walkthrough.md`), the examiner
(`examiner.md`), module isolation (`modules.md`), rebuild (`rebuild.md`) — each cited by this tree's
file and section rather than restated.

**The existing corpus is not moved by this install.** No ruling exists about migrating `docs/` into
the layers' write scopes, and none is invented here: `docs/` stays the live documentation of the app
while a unit's layer documents are new files under the layer paths (`brief.md` §7, `pending.md` row
2). Rejected alternative: migrating `docs/` into `docs/L1…L3` at install time, which is a migration
decision the user has not taken.

---

## D-2 — The record kinds, their ceilings, and replace-never-annotate

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** the workflow corpus's own
ceilings and file classes, read at `../Agent Harness/strata/README.md` and enforced by
`../Agent Harness/strata/lint/strata-lint.mjs` (its `CLASS_MAX` and registry tables).

**Decision:** three record kinds. **State** is script-written and overwritten at every transition
and is never prose. **Design** belongs to exactly one layer and is replaced on revision. **This
register** is L0's and is append-only. In this corpus git is the history: a superseded artifact is
replaced, never annotated, and a document may declare a ceiling no higher than its class maximum
(`README.md`'s table). The trackers (`next-steps.md`, `pending.md`, `proposals.md`) carry 40 lines
each; a record carries 40, a handover 60, a retrospective 20 (`platform.md` §4).

---

## D-3 — Five layers, one artifact class and one write scope each

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** the workflow's layer table, as
the preset's role personas and the workflow corpus state it.

**Decision:** L0 is the user interface and owns `strata/`; L1 owns the e2e technical design
(`docs/L1/`, `tests/e2e/`, the module map); L2 owns one module's integration design
(`docs/L2/<module>/`, `tests/integration/<module>/`); L3 owns one module's design
(`docs/L3/<module>/`, `tests/unit/<module>/`); L4 owns the source files of one module and nothing
else. Write scopes are `brief.md` §3's table, and a lower layer may read upward artifacts and never
writes them.

---

## D-4 — The nested loop, and what a layer owes the one below

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** the workflow's loop as its
`examiner.md` and `rebuild.md` state it.

**Decision:** a layer examines the artifact the layer below produces; feedback travels down as
narrowed detail on the same artifact id, never as a re-derivation. L4 owns no design, so an
inability to reach green bubbles to L2. A lower layer's adjudication request is answered by the layer
above and counted as a failure. Repeat failure — the same artifact failing the same test class on
three consecutive repair passes — escalates to a rebuild, whose recommendation one layer above the
examiner decides (`rebuild.md` §1, §3).

---

## D-5 — The L0 exit walkthrough is a blind documentation pass

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** the workflow's walkthrough
procedure, and this project's existing blind-greens practice (`AGENTS.md` item 10a).

**Decision:** before L0 reports a unit, a fresh agent that has not seen the unit's code attempts a
scenario set from the documentation and the built surface. The verdict vocabulary is closed —
`PASS` | `DOC-GAP` | `STALE` | `UNUSABLE` — and a unit is recommended as ready only on `PASS`;
any other verdict still reaches the user, carrying a loop recommendation and never presented as
readiness (`walkthrough.md` §5). The set is at most twelve steps and is the user's acceptance path.

---

## D-6 — The examiner validates the battery before the code, and never patches

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** the workflow's examiner
procedure, consistent with this project's `AGENTS.md` process gates.

**Decision:** the examiner validates the battery first and examines code second, never reversed. It
may emit a root cause, an owning artifact id, a failing test id, a routing layer and a rebuild
recommendation; it never emits a snippet, a diff hunk, a signature or an ordered fix list. A code
finding against an invalid test is a finding against that layer's test writer
(`examiner.md` §1, §4).

---

## D-7 — One module per agent, and isolation is lint-enforced

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** the workflow's module-isolation
procedure and the lint's diff-scope check.

**Decision:** at and below L3 an agent is provisioned one module — its docs, its source subtree, its
tests and the L2 interface — and reads a sibling's surface through that interface, never through the
sibling's code. A module's harness is capped at `50 + 10×N` where `N` is the endpoint count its
`modules.json` row declares; exceeding the cap means the surface is too large. Isolation is
tool-wall plus diff-scope lint, never sandbox-enforced (`modules.md` §1, §4, §5).

---

## D-8 — The UI-authority non-negotiable stands for every layer

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** the project's process document,
`AGENTS.md`'s "Project-wide constraint (UI rendering)" section, carried into this corpus unchanged in
substance.

**Decision:** every UI element that is not the Electron shell's own chrome — window frame, native
menu bar, preload bridge, MCP server — is provident data driven through the producing graph, never
hand-written DOM in the renderer. An element rendered outside the framework is invisible to
`provident.dispatch`, `get_rendered_html` and `get_markdown`, and is a review finding at any layer
(`brief.md` §2).

---

## D-9 — The consumed packages and the foundation tree are read-only for every layer

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** `AGENTS.md` items 1 and 7 and
`docs/FORKER.md` §2, measured against this tree's `vendor/foundation.lock.json`.

**Decision:** no layer edits `node_modules/`, the upstream `../Preempt-Providence/` package source,
or the adjacent `../Provident-Electron` foundation checkout. A defect or requirement gap in
`provident-ssr`, `provident-editable` or the foundation is recorded as a finding and handed off,
never patched. A vendored foundation module changes only through an import unit whose pin and digest
table move with it (D-11).

---

## D-10 — The verification floor at this head

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** `package.json`'s `scripts`
block, `vitest.config.ts`, `vitest.conformance.config.ts` and the head commit's recorded readings
(`9119608`).

**Decision:** the floor is the trio `npm test`, `npm run typecheck`, `npm run build`; beside it stand
the `conformance`, `drift`, `battery` and `divergence` legs and the live driver
`scripts/live-drive.mjs`. A unit's green is the layer's own battery green and never wider: the node
suite runs under a layout-less DOM shim, so it is envelope-green and never app-green
(`brief.md` §6).

---

## D-11 — The foundation pin, and the discipline of moving it

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** `vendor/foundation.lock.json`
and `scripts/foundation-drift.mjs`, read in this seat.

**Decision:** the fork's shared foundation surface is the fifteen modules the lock lists, pinned at
foundation commit `7bd1de4786c4d46a3fee02f72adaf6ef612985d1` (measured 2026-10-04). A pin refresh is
a unit of its own that moves the lock, the per-module digests and the drift readings in the same
commit, and the conformance leg re-runs the vendored fifty's own suites against the new copies
(`vitest.conformance.config.ts`). The drift leg reads two faults apart — byte drift and a moved pin
arm — and its reading at this head is a `FAIL` on the `PIN` arm alone: the adjacent foundation tree
is at `e8dfb57730f657521d543c8d49f0d67e7ee1e6d4` while the fifteen vendored modules remain byte-equal.

---

## D-12 — The foundation update is admitted for intake, and no scope is committed yet

**Status:** ACTIVE · **Date:** 2026-11-15

**Source (user, verbatim):** "The foundation project (provident-electron) used for the UI/MCP layer
has had a comprehensive update intended to improve app responsiveness and UI consistency, check and
start planning for import."

**Decision:** L0 admits an intake. `role_l0_research` establishes what the update contains and what
this fork's tree would need, filed as `strata/records/foundation-update-2026-11-15-research.md`
(`research.md` §2, §4). No import scope is committed here: the scope ruling is the user's and is
carried in `pending.md` row 1, and design starts at L1 only after that ruling (`brief.md` §5).
Rejected alternative: treating the whole 911-commit backlog since the pin as one import unit, which
would design the scope at L0 and cannot be reviewed per unit (`brief.md` §4, D-4).

---

## D-13 — The import takes ALL FOUR surfaces, and the record-family rework comes with the UI port

**Status:** ACTIVE · **Date:** 2026-11-15

**Source (user, asked and answered this session):** the question put the intake's four separable
surfaces — (a) the pin restatement, (b) the vendored conformance copies, (c) the layout/UI port of
the foundation's rows 248…287, (d) the record-family backlog (`main/data/*`, the view and tabs
records, operator settings, storeroom, the mcp-server growth) — and the user answered **"All four
surfaces"**.

**Decision:** the import is one program spanning all four surfaces, and each surface is admitted as
its own unit — never as one pass — because a multi-unit deliverable is split per unit before any unit
starts (`brief.md` §4). The program's unit decomposition, order and interfaces are L1's to file
(`brief.md` §3, D-3); this row fixes only that no surface is left out and that the UI port does not
wait on the record-family work or the reverse. The intake's findings are the authority for what each
surface contains (`strata/records/foundation-update-2026-11-15-research.md`,
`strata/records/foundation-import-surface-2026-11-15-research.md`).

**The measured price this row names rather than hides:** surface (a) owes no module bytes — the
fifteen vendored modules are byte-equal to the foundation's head — but it does owe one atomic
restatement of the lock's four literal sites plus the register's §4 clause, and the drift arm may not
be made revision-tolerant (D-11). Surface (c) is a port into the fork's own chrome, not a copy: the
foundation's `renderer.ts` (7844 lines) and `renderer/index.html` (1999) are its own app, and the
fork's equivalents are `src/renderer/renderer.ts` (1601) and `index.html` (376).

---

## D-14 — The port adopts the foundation's vocabulary where the two collide

**Status:** ACTIVE · **Date:** 2026-11-15

**Source (user, asked and answered this session):** the question named the collisions — the
foundation's `.pane-head`/`.pane-grab`/`.pane-collapse`/`.pane-drop` and zones
`top|bottom|left|right` + `[zone=]` and theme `[theme="dark"]`, against the fork's
`header|left|right|footer` + `data-zone` and `data-theme` — and the user answered **"Adopt the
foundation's vocabulary where they collide"**.

**Decision:** where the ported behaviour needs a name the two trees spell differently, the
foundation's spelling wins: the zone attributes become `top|bottom|left|right` with `[zone=]`, the
theme carrier becomes `[theme="dark"]`, and the pane head/collapse names are the foundation's. The
fork's own app-level names — pane ids, pane titles, terminal predicates, the `updated` policy and the
fork's census figures — stay the fork's (`forking.md` §10's split, D-8).

**The measured price this row names rather than hides:** every row that names the old spelling moves
with it — the fork's zone track vars (`--zone-*-track`), `data-zone` readers, the theme adapter
(`src/renderer/theme.ts`), every `cssId`/`dispatch` target row that names a renamed node, and the
tests that assert those ids. The rename is therefore part of the unit that changes the behaviour, in
the same commit, never a separate sweep that leaves the tree reading two vocabularies.

---

## D-15 — The fork's own carriers stay the geometry authority; the record-family surface becomes a later program

**Status:** ACTIVE · **Date:** 2026-11-15 · **Narrows:** D-13's ordering clause stands as written

**Source (user, asked and answered this session):** the validity review's blocking question was put —
does pane/zone geometry **move** into the foundation's view record (making the UI port depend on the
record-family work and deleting the fork's operator-settings `layout` slice as a second authority), or
does the fork keep its slice and take only the behaviours — and the user answered **"Keep the fork's
carriers; (c) ports behaviours onto them"**.

**Decision:** the layout/UI port writes through the fork's existing carriers — the operator-settings
`layout` slice for pane and zone geometry, the fork's store carriers for everything beside it — and
does **not** adopt the foundation's view record as a geometry authority. D-13's ordering clause is
therefore true as written: the port neither waits on the record-family work nor blocks it. Surface (d)
stays in scope as a program of its own, admitted later and reconciled against what has landed by then
(`pending.md` row 2), and its record families are not a prerequisite for any surface (c) unit.

**Why this row exists rather than being left to the unit:** the two intake reviews established that
the fork already persists per-pane `collapsed` and per-zone `minimized` in its own slice while the
foundation's members live in its view record, so adopting both would have created two authorities for
one state — the adjudication the reviews returned. Rejected alternative: adopting the view record as
the geometry authority, which the user did not take.

---

## D-16 — The rename reaches the fork's closed zone domain and its MCP-visible `zone:` ids

**Status:** ACTIVE · **Date:** 2026-11-15

**Source (user, asked and answered this session):** the critique review's blocking question was put —
does D-14's vocabulary ruling reach the fork's closed `LayoutZoneName` domain and its MCP-visible
`zone:` ids (pinned by `R-9`, `P-IM-1`/`P-SM-2` and the `UF-LAYOUT-2` clause), or only carriers the
import newly authors — and the user answered **"Full rename — including the closed LayoutZoneName
domain and the MCP zone: ids"**.

**Decision:** the fork's zone vocabulary becomes the foundation's **everywhere**: `LayoutZoneName` is
`'top' | 'bottom' | 'left' | 'right'`, the carriers are `[zone=]` and the foundation's track variables,
and every row that names the old spelling is re-grained — `R-9`, `P-IM-1`/`P-SM-2`, the `UF-LAYOUT-2`
clause that requires `provident.list_targets` to carry stable `zone:` nodes, the zone-replacement
register rows and the live driver's own vocabulary. The rename lands **in the same unit that changes
the behaviour**, never as a separate sweep that leaves the tree reading two vocabularies (D-14).

**The measured price, named rather than hidden:** 149 `LayoutZoneName` matches (12 src files, the
3,851-line zone-replacement register, ~30 spec cells), 54 src / 19 test / 43 live-driver `data-zone`
sites, 32 `zone:header|footer` tokens, and two protected register rows. `UF-LAYOUT-2` is re-grained to
the new spellings rather than waived: the agent-visible ids move, and the row that checks them moves
with them in the same commit.

**Derived from D-14 rather than separately asked:** the state members that also collide — pane/zone
`minimized` against the foundation's `collapsed`, pane `order` against its `index` — follow D-14's
rule for colliding names. This is D-14's scope applied, and a unit that finds a genuine semantic
difference (not a spelling difference) between the two members reports it as an adjudication instead
of renaming it.

---

## D-17 — A unit's spec act is written by the layer that owns its contract, under L0's scoping grant

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** the strata install's layer
scopes (D-3) predate this project's corpus, whose unit contracts and amendments live in
`docs/specs/**` — a path no layer's persona claims. The first unit admitted after the install (V-1)
cannot reach green without amending one anchored clause in `docs/specs/unit-pd-vendor-pin-refresh.md`
and filing its own contract.

**Decision:** where a unit needs a document act in the existing corpus, L0 names that document in the
delegation, and the layer that owns the unit's behaviour writes it — the unit's own new contract file
and the specific clauses it amends, and nothing else. The grant is per unit, stated in the
delegation, and listed in the unit's DONE row; it never widens a layer's wall beyond the named
documents, and it never licenses a layer to edit a document another layer owns (D-3).

Rejected alternative: migrating `docs/` into the layer paths before any unit runs — a migration the
user has not ruled on (D-1, `pending.md`), and one that would make the first unit wait on a corpus
move it does not need.

---

## D-18 — Corrigendum to D-16's measured price: the reach re-read in both item-8 reviews

**Status:** ACTIVE · **Date:** 2026-11-15 · **Corrects:** D-16's price paragraph · **Source
(measurement):** three independent greps in this session — the validity reviewer's, the critique
reviewer's and this seat's own — none of which reproduces D-16's figures.

**Decision:** D-16's authority stands untouched; its PRICE is corrected where each reading disagrees.
`LayoutZoneName` reads **82–88 occurrences in 7 `src` files** (not 149 across 12), plus ~70 in docs and
the strata rows; `data-zone` reproduces at **54–56 src / 19–20 tests / 43 driver** sites; the
`zone:header|footer` literal reads **10–14** (not 32); and the `minimize → collapse` seam — a surface
D-16 did not measure at all — reads **39 explicit sites** (87 occurrences counting the `is-minimized`
paint class). A unit's contract re-measures its own list rather than quoting this row, and a figure
here is a reading at this head, never a constant.

The landing consequence, recorded rather than left to a unit: the **method** matters as much as the
count. A pattern that matches the type name, the literal token and the paint class reads three
surfaces at once, and D-16's "149 / 12 files / 32" mixed them. The unit's contract names the pattern
it used for each figure. Rejected alternative: editing D-16 in place, which the register forbids.

---

## D-19 — The foundation pin at this head, and what its move owed

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** unit `V-1` `pin-restate`'s
landing (`docs/L1/unit-v-1-pin-restate.md`, `strata/records/v-1-walkthrough.md`)

**Decision:** D-11's rule is unchanged; this row records the fact it governs. The lock's `commit`, its
`digestCommand`'s single literal and the three `PINNED_COMMIT` constants read
`e8dfb57730f657521d543c8d49f0d67e7ee1e6d4`, `measuredAt` reads `2026-11-15`, and the anchored §4
region of the pin-refresh contract carries **four** dated declared-refresh-reading clauses whose
**last** governs. The move owed **no module byte** — all fifteen vendored modules were byte-equal at
the new revision before any byte moved — and it left **two** sites deliberately at the old revision
(the two store-adopt anchors, whose subject no longer exists at the foundation's head) and **eleven**
sites one revision behind (the vendored conformance copies, which `V-2` owns).

D-11's older literal `7bd1de47…` is superseded as a reading, never deleted. Rejected alternative:
annotating D-11 in place, which the register forbids (D-2).

---

## D-20 — The fork adopts the foundation's package dependencies

**Status:** ACTIVE · **Date:** 2026-11-15

**Source (user, verbatim, answering `pending.md` row 1):** "Yes, use the dependecies" — the ruling the
item-8 reviews made necessary when they measured that the pinned engine cannot express the port's own
contract.

**Decision:** the fork takes the foundation's own runtime dependencies: **`provident-ssr` `^0.5.1` →
`^0.5.2`**, and **`provident-storeroom` `^1.11.0`** added. Both were verified published before the
ruling was recorded (registry query, this seat: `provident-ssr` 0.5.2 and `provident-storeroom` 1.11.0
exist). The engine finding that forced it is thus DISCHARGED BY ADOPTION rather than by a patch:
`provident-ssr` 0.5.1 drops an authored provider at render (`dist/core/node.js`'s `!isSeamProvider`
guard) while 0.5.2 renders it through the `valueRecord` gate, which is what the port's
zone-form-by-position depends on (D-9's rule that a package is catalogued and never patched is
untouched — a bug in 0.5.2 is a finding, never a local edit).

**The storage dependency is admitted AHEAD of its consumer:** `provident-storeroom` is what surface (d)'s
record families are built on, and (d) is a later program (D-15), so no unit may claim a storeroom
consumer until that program admits one; the dependency's landing unit proves only that the package
installs, resolves and leaves the trio, the drift leg and the conformance tally as they stood.

**Rejected alternative:** staying on 0.5.1 and dropping the by-position zone-form inheritance from the
UI port — which would have made the port's own §7.4 behaviour unwritable on the engine it ships with.

---

## D-21 — `V-2` landed the copies `D-19` recorded as one revision behind

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (measurement):** unit `V-2`'s landing and its
walkthrough record (`strata/records/v-2-conformance-refresh-walkthrough.md`)

**Decision:** D-19's clause "eleven sites one revision behind (the vendored conformance copies, which
`V-2` owns)" is SUPERSEDED AS A READING and kept as filed: those eleven copies now equal the pinned
commit's blobs, and the lock's `conformance` block states a measured 147-suite disposition set
(11 included · 4 excluded · 132 not-admitted · 7 retired · 4 caveats). The register at
`tests/integration/foundation-vendor/conformance-refresh-register.test.ts` is the copy-fidelity
instrument, with an anti-vacuity limb proved by driving a laundered disposition set to 131 violations.
The leg's tally is and stays a tally: 11 files, 11 failed, 511 failed / 59 passed (570). Rejected
alternative: annotating D-19 in place, which the register forbids (D-2).

---

## D-22 — The foundation's `collapsed` is the meaning, and the silent relocation is ACCEPTED and recorded

**Status:** ACTIVE · **Date:** 2026-11-15 · **Source (user, asked and answered this session):** Q1 —
what does `collapsed` mean — answered **"The foundation version is overriding"**; Q2 — the persisted
profile, migrate or accept — answered **"Accept the silent relocation and record it"**.

**Decision (1), the meaning:** `collapsed` carries the foundation's semantics — the extent is collapsed,
it is derived from emptiness, and the record may overturn it — and the fork's `minimized` does NOT survive
beside it. The operator's "minimize an occupied zone to a tab strip" becomes an ACT that overturns the
derivation on the same member, and the fork's tab-strip paint becomes the collapsed-zone paint. One
member, one paint family, two ways to reach the state (derivation and act).

**Decision (2), the profile:** `LAYOUT_VERSION` stays **1** and no migration arm is written. An existing
install's `header`/`footer` placements (and any resized edge track) are coerced to `left` on first load
and the coercion re-persists that loss. **This is ACCEPTED, and it is recorded as a defect row in
`docs/defects.md` and named in the affected units' DONE rows, so it can never be read as an unnoticed
regression.**

**Consequences the units inherit:** `U-1b` carries the ONE-state collapse — the `auto`/`hidden` extent
included, the member and act re-grained, the tab-strip paint folded into the collapsed paint; `U-1a`
drops the migration it would otherwise have carried, so its red set is the census rows and
`UF-LAYOUT-2`'s literal container-id limb; and the accepted relocation is a stated cost of the rename, not
a bug to be found later.

Rejected alternatives, named: the one-state-plus-migration pairing (the shape L1 recommended on Q2 — the
user took the state and refused the migration), and the two-state pairing (refused on Q1).

---

## D-23 — The record engine carries DISPLAY STATE, never document content

**Status:** ACTIVE · **Date:** 2026-11-16

**Source (user, verbatim):** "The app layer will still have to plug in to the record engine for full
migration. Saving ex. entire documents into the record storeroom is not strictly necessary and probably
wasteful of performance due to the storeroom update frequency, but it must be storing enough related
info to reconstruct ex. the last-displayed information from a tab (ex. document, caret position, scroll
position/visible section, etc.) so that the app layer can retrieve it from memory or from Gnosis."

**Decision:** the record engine's adopted surface (surface (d)) is a STATE SEAM, not a data migration.
The record carries what is needed to RECONSTRUCT a tab's last-displayed state — the document it showed,
the caret position, the scroll position / visible section, and whatever beside those a tab needs to come
back exactly as it was left. It never carries document CONTENT, and the reason is the user's own: the
storeroom's update frequency makes bulk content there wasteful. Document content stays where it is —
retrieved from memory or from Gnosis — and the record holds the reference plus the view state around it.

**What this changes for the program:** surface (d) shrinks from "the successor to the store the fork is
mid-adoption of" to a narrow seam — a display-state family and its read/write paths — and the fork's
existing content authorities (the RAG/Gnosis store, the store-adoption program's carriers) keep their
roles. Any design that moves document bodies into the record is refused by this row (D-9's "catalogue,
never patch" is untouched; a FOUNDATION-side gap the seam exposes is a finding, not an edit).

**Rejected alternative, and its reason:** writing whole documents into the record storeroom, on the
grounds that its update frequency makes that wasteful — the user's stated cost, recorded because it is
the load-bearing half of this ruling.

---

## D-24 — The app panes keep their data content and take the foundation's behaviour and update model

**Status:** ACTIVE · **Date:** 2026-11-16

**Source (user, verbatim):** "The app panes will keep their current internal data content, while using
the foundation's relocation, display, styling, and update behavior. They should also be migrated to use
the event-driven update behavior as the foundation renderer, ex. if a new backlink is detected the app
component can fire a listener for the backlink pane renderer to trigger an update, either directly or by
adding it to the store record."

**Decision:** the fork's app panes are re-plumbed onto the foundation's model in three dimensions and
keep their own fourth. They keep their INTERNAL DATA CONTENT — what a pane shows and the data it derives
it from are the fork's, unchanged in substance. They TAKE the foundation's RELOCATION, DISPLAY, STYLING
and UPDATE behaviour. And they migrate to the foundation renderer's EVENT-DRIVEN update: an app
component that learns something (the user's example — a new backlink detected) fires a listener for the
owning pane's renderer, or writes it to the store record, and the pane updates because it heard, not
because something re-assembled the tree.

**What this settles, and why it is recorded rather than assumed:** D-23 put the record's payload
(display state, never content) at the seam; this row puts the panes' BEHAVIOUR on the foundation's model
while their CONTENT stays the fork's. Together they describe a pane that is the fork's data inside the
foundation's machinery — and they make the fork's current chrome a SCAFFOLD whose lifetime is now a
planning question, not a permanent assumption (the intake gate for that question is running; see
`proposals.md` and the two review records it produces).

**The constraint this row does not relax:** every element is still AUTHORED provident data at the
envelope site (D-8) — "event-driven" means a listener or a record write drives the graph, never
hand-written DOM.
