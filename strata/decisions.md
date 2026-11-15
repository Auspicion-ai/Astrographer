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
