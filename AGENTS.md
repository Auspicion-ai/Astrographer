# Provident-Electron — Agent Configuration

Context management and process guidelines for agents working in this
repository. This is a PORT of the process rules from the upstream
Preempt-Providence repo (`AGENTS.md`, `docs/subagents.md`) adapted to this
project's two distinct goals:

1. **Implementation test of the `provident-ssr` npm package.** The original
   source + documentation live in the ADJACENT `Preempt-Providence` folder
   (not a dependency of this repo — read it at
   `../Preempt-Providence/`). Agents MUST NOT make direct changes to the
   package code (`node_modules/provident-ssr/` or the upstream folder).
   Any defect or requirement gap discovered during implementation is
   CATALOGUED in `docs/defects.md` and handed off as an issue to the
   original project (see `docs/HANDOFF.md`).
2. **Prebuild baseline for Electron apps using the provident-ssr framework.**
   Full synthetic-event access + rendered-HTML visibility for MCP endpoints
   (agentic use + debugging exposure). This implements the upstream's parked
   "Phase C" (cross-process MCP/Electron endpoint) as a consumer.

## Project-wide constraint (UI rendering)

**All UI elements that are not directly part of the Electron shell itself
(e.g. pre-existing menu/settings dropdowns, panels, dialogs, controls) MUST be
rendered with the provident framework** — authored as provident-ssr data
(envelope nodes / handler bodies / hooks / component bindings) and driven
through the producing graph, NOT as hand-written HTML/DOM in the renderer.
The Electron shell's own chrome (the window frame, the native menu bar, the
preload bridge, the MCP server) is the only exception. Rationale: the shell's
whole purpose is full synthetic-event access + rendered-HTML visibility for
MCP endpoints — a UI element rendered outside the provident graph is invisible
to `provident.dispatch`/`get_rendered_html`/`get_markdown` and defeats the
agentic/debugging surface. A UI element added outside the framework is a
review finding.

## Context budget rules (imported from upstream)

1. **75% threshold**: past 75% of available context, stop starting new work
   and switch to preparing handover documents so a fresh sub-agent can
   continue.
2. **50% task threshold**: a task estimated to take >50% of context is
   delegated to sub-agents, never done inline.
   **RCA-5 (2026-08-23): a multi-unit deliverable must be delegated PER UNIT, not
   inlined as one pass.** Context budget pressure was the primary cause of the
   B/C/D miss — the three units + R13 were implemented inline in a single pass
   instead of delegated as separate TestWriter-red → Implementer-green →
   adversarial → blind-greens cycles. Treat "delegate this multi-unit deliverable"
   as a hard gate: if the deliverable spans 2+ spec'd units, split it before
   starting, and never let a unit's red→green→adversarial→greens sequence share
   one inline run with a sibling unit's.
3. **Handover must include a documentation-staleness review**: before any
   handover is reported complete, reconcile the active trackers
   (`docs/next-steps.md`, `docs/pending.md`, `docs/defects.md`,
   `docs/decisions.md`, `docs/HANDOFF.md`) and the relevant
   `docs/specs/*.md` against the ACTUAL repo/build state — every DONE row
   that is now implemented, every OPEN item that changed status, every
   method/behavior named in a spec that drifted from the code, and every
   version/test-count claimed. Fix stale entries in the same pass so a fresh
   sub-agent inherits an accurate picture, and note the staleness pass in the
   handover doc itself. A handover that repeats an out-of-date DONE/OPEN
   status or a wrong method name is a review finding.

## Process requirements

3. **TDD, always (imported, subagents.md workflow)**: every source-code task
   is red → green → verify, in order: (a) write tests with the states /
   fail-states (red); (b) run them and report the failing set; (c) implement
   the least code that makes them green; (d) re-run the validation (item 5).
   A change that adds no test is itself a review finding. Delegation prompts
   must never be "implement X and add tests".
   **RCA-1 (2026-08-23): do NOT invert the order.** Writing the implementation
   first and the tests after is a process violation even if the final suite is
   green — the red set must be RUN and REPORTED per unit BEFORE implementation.
   Record the red set explicitly in the next-steps DONE row for that unit (e.g.
   "TestWriter red: N failing (method does not exist)" → "Implementer green: N
   pass"). An entry that claims green without a recorded red run for the unit is
   a review finding.
   **RCA-2 (2026-08-23): a multi-unit deliverable is split PER UNIT.** Do not
   implement Units B, C, D (+R13) as one inline run. Each unit is its own
   red→green→adversarial→verify cycle, delegated to sub-agents per item 2/9, and
   each lands as its own DONE row with its own red/green + adversarial + greens
   set. A single pass that implements several spec'd units together and writes
   all their tests at the end repeats the miss.
4. **Validation after features/tests**: after any feature or test change run
   the trio before reporting complete:
   ```
   npm test           # vitest — full suite
   npm run typecheck  # tsc --noEmit
   npm run build      # esbuild bundles (main cjs + preload cjs + renderer esm)
   ```
   (This project has no demo-smoke; the upstream's trio is test + typecheck +
   demo:smoke. The build is this project's third leg.)
5. **Specs + decision records**: behavior contracts live in `docs/specs/*.md`
   (this repo's contract = the MCP endpoint spec, `docs/specs/mcp-endpoint.md`).
   Design decisions are recorded in `docs/decisions.md` as `DECIDED:` /
   `ACTIVE` / `SUPERSEDED` rows. Keep both in sync with the implementation.
6. **Document-archival loop (imported from upstream Preempt-Providence
   AGENTS.md item 6, adapted)**: the git-visible `docs/` tree is for ACTIVE
   development work + the CURRENT contract/spec state. After EACH significant
   change (and as a MANDATORY per-unit step after the greens — see item 10b),
   run a cleanup pass: (a) merge the new/changed information into the core docs —
   `docs/specs/mcp-endpoint.md`, `docs/defects.md` (active defect/finding list —
   open on top, fixed rows below, superseded rows archived), `docs/decisions.md`
   (ACTIVE/SUPERSEDED status, pinned contracts with their sources),
   `docs/pending.md` (parked/upstream constraints + speculative items),
   `docs/next-steps.md` (work queue); (b) archive obsolete documentation, stale
   test data, findings reports, feedback reviews, and historical review records
   into the GITIGNORED `archive/` dir (`archive/<topic>/<date>-<name>.md` — see
   `archive/README.md`); (c) repoint or remove every reference to an archived
   file — never leave a citation pointing at a moved file; never archive a
   still-cited file without repointing it. The `archive/` dir is excluded from
   builds and tests. **Active trackers (maintained every pass):**
   `docs/defects.md`, `docs/decisions.md`, `docs/pending.md`, `docs/next-steps.md`
   — a change that fixes a defect, lands a decision, parks an item, or launches
   a speculative proposal MUST update these trackers in the same pass.
7. **Defect-catalogue + handoff rule (this project's core duty)**: ANY defect
   or requirement gap discovered in the `provident-ssr` package — a behavior
   that contradicts `../Preempt-Providence/docs/specs/*.md`, a missing
   convenience an MCP/Electron host needs, a documentation gap — is recorded
   in `docs/defects.md` with: the observed symptom, the reproduction, the
   suspected root cause, and a proposed fix shape (upstream-owned). The
   finished catalogue is written to `docs/HANDOFF.md` (the issue-handoff
   document) before a pass is reported complete. DO NOT fix the package.
   **Adversarial-loop carve-out:** the post-completion adversarial sub-agent
   hunts edge cases / unauthorized access / malformed inputs. If it finds a
   genuine defect in the PACKAGE code (`node_modules/provident-ssr/` or the
   upstream `../Preempt-Providence/` source — NOT this repo's host code), that
   is still a handoff item: record it in `docs/defects.md` + `docs/HANDOFF.md`
   exactly as any engine defect, and NEVER patch the package. Host-side
   findings (this repo's `src/`) are fixed here, not handed off.
   **RCA-3 (2026-08-23): the adversarial pass is MANDATORY per completed unit,
   not optional.** After each unit's green, a read-only adversarial sub-agent
   (edge cases / unauthorized access / malformed inputs) must run before the
   unit is reported done; its findings are recorded in the unit's spec
   (`docs/specs/*.md` §3a/§3b "Adversarial findings") and each host finding is
   fixed here + regression-tested. A unit DONE row that cites no adversarial
   pass (or whose findings are unrecorded) is a review finding. This closes the
   battery gap where Units B/C/D were merged without a structured adversarial
   pass.

## Process gates for sub-agents (imported, adapted)

8. **Proposal review — three-agent gate (imported)**: a user/design proposal
   that changes THIS repo's contract goes through three sequential read-only
   reviews first (validity → critique → change-analysis), then lands as
   `docs/specs/<proposal>-review.md` before any code. Steps 1 and 2 are
   independent; step 3 requires both outputs. This applies to changes to the
   MCP contract — not to fixes inside a documented contract's shape.
9. **Delegation gate (imported)**: a code unit is only delegable once (a) its
   `docs/specs/*.md` contract exists, (b) a TestWriter unit has run and
   reported the red set. Reviewer sub-agents are read-only.
10. **Blind-test → subagent review loop (imported, upstream AGENTS.md item 10;
    RCA-4 2026-08-23)**: after a feature/behavior change ships, its
    documentation + test claims are verified by agents who did NOT write them:
    a. A **writer** produces the green-scenario artifact from the DOCUMENTATION
       ONLY (`docs/specs/*.md` + the `*-greens.md` set; NO implementation
       reading). It runs the scenarios against the live modules/host and records
       pass/fail. A failure is a doc/spec drift OR an un-hardened regression —
       never a pass.
    b. A **proofreader** audits the docs against code+specs and fixes doc
       inconsistencies (spec refs, section numbers, claims vs behavior,
       version/test-count staleness).
    c. Findings merge into the active trackers and the trio must be green before
    the loop is complete. A unit whose `*-greens.md` set was authored by the
    same agent who implemented it, WITHOUT a blind re-run, is a review
    finding — the batteries B/C/D miss (self-verified greens, no fresh-agent
    run) is the exact anti-pattern this rule closes.
    d. **Documentation review (imported from the upstream archival loop —
       runs AFTER the greens, before the unit is reported done)**: a read-only
       **documentation reviewer** reconciles the unit's docs against the ACTUAL
       repo/build state immediately after the greens ship. It is the
       item-6 archival loop applied AS A GATE, not an afterthought:
       - reconcile every method/behavior named in the unit's spec
         (`docs/specs/<unit>.md`) + its `*-greens.md` against the code — names,
         signatures, return shapes, throw patterns, census/numeric claims;
       - reconcile the active trackers (`docs/next-steps.md`,
         `docs/pending.md`, `docs/decisions.md`, `docs/defects.md`,
         `docs/HANDOFF.md`) against the build — every DONE row now implemented,
         every OPEN item that changed status, every version/test-count claim;
       - reconcile cross-references + section numbers (no citation pointing at
         a moved/renumbered section); archive obsolete docs into `archive/` and
         repoint every reference;
       - fix stale entries in the SAME pass (a doc claim that drifted from the
         code is a review finding if left for the next agent). The full
         review record is appended to `archive/reviews/<date>-<unit>-doc-review.md`.
    **RCA-6 (2026-08-23): a documentation review is MANDATORY after the greens,
    not optional.** A unit DONE row that cites no documentation-review pass (or
    whose spec/trackers drifted uncaught into the next pass) is a review
    finding. The twentieth-pass design-compliance review surfaced stale
    test-counts, phantom return fields, and renumbered sections across every
    spec — exactly the drift this step prevents when run per-unit instead of
    batched.

## Roles (imported, adapted)

| Role | Tool set | Guardrails |
| --- | --- | --- |
| Architect (me / user) | read/edit | owns decisions; makes design calls |
| Reviewer | explore/general, read-only | never edits; returns findings; a code change with no test is a finding |
| TestWriter | write/bash | writes tests FIRST (red) from specs; never implements alongside |
| Implementer | read/edit/bash | runs only after TestWriter reports red; least code to go green; re-runs trio |
| Adversarial reviewer | explore/general, read-only | hunts edge cases / unauthorized access / malformed inputs AFTER each unit's green; records findings in the spec; host findings fixed here, package findings → defects.md/HANDOFF.md |
| Blind-test writer | write/bash | produces the green-scenario artifact from `docs/specs/*.md` + `*-greens.md` ONLY (no implementation read); runs scenarios against the live module/host |
| Proofreader | read/general, read-only | audits docs against code+specs; fixes doc/spec/version/test-count staleness |
| Documentation reviewer | explore/general, read-only | AFTER the greens: reconciles the unit's spec + `*-greens.md` + active trackers against the actual build (names/signatures/return shapes/census claims/cross-refs/section numbers/test-counts); fixes stale entries in the SAME pass; record to `archive/reviews/<date>-<unit>-doc-review.md` |

Inputs always read from `docs/specs/*.md` + the upstream docs
(`../Preempt-Providence/docs/`) unless stated. Artifacts commit in the repo.

## RCA lessons (2026-08-23 — the battery B/C/D process miss + the design-compliance drift)

The battery pass (Units B/C/D/R13) was implemented inline and tested after
(red/green order inverted), merged without an adversarial pass, and its greens
were self-verified rather than blind-run. The RCA is `docs/specs/process-rca-battery.md`.
The guards above (RCA-1..RCA-5) encode its lessons directly; the
`docs/skills/process-guardrails.md` skill consolidates them for fresh sub-agents.

**RCA-6 (2026-08-23 — the design-compliance drift)**: the twentieth-pass
compliance review surfaced stale test-counts, phantom return fields, and
renumbered sections across every spec — because the documentation review was
batched (run once, late) rather than per-unit after the greens. RCA-6 makes
the documentation review a MANDATORY per-unit gate (item 10d), importing the
upstream Preempt-Providence archival loop's cleanup-pass discipline: the
doc review is the archival loop applied AS A GATE, not an afterthought.