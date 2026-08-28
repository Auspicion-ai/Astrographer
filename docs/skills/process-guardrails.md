# Skill — Process Guardrails for the Battery / Multi-Unit Deliverables

Consolidates the RCA lessons (RCA-1..RCA-9) for a fresh sub-agent, so the
battery B/C/D process miss and the narrative-as-action loop are not repeated.
Canonical records: `archive/parent-project/2026-08-26-process-rca-battery.md`
and `archive/parent-project/2026-08-27-process-rca-narrative-as-action.md`;
the rules live in `AGENTS.md` items 2/3/7/10.

## When this applies

Any source-code task. **Especially** a deliverable that spans 2+ spec'd units
(a multi-unit deliverable), or a single unit with a non-trivial contract.

## The miss (why this skill exists)

The battery pass (Units B/C/D/R13) was:
- implemented **inline** in one pass (context-budget rule ignored),
- **tests written AFTER** the implementation (red/green order inverted),
- merged with **no adversarial pass**,
- its `*-greens.md` **self-verified** by the implementer (never blind-run).

Net: the features worked and the trio passed, but the PROCESS compliance —
the thing that lets a fresh sub-agent inherit an accurate, reviewable state —
was absent at merge time. The RCA is
`archive/parent-project/2026-08-26-process-rca-battery.md`.

## The nine guards (RCA-1..RCA-9)

| # | Rule | How to comply |
| --- | --- | --- |
| RCA-1 | **Never invert red/green order.** Implementation-first is a violation even if the suite is green. | Write tests (red) FIRST, run + report the failing set, THEN implement the least code, re-run. Record the red set in the unit's DONE row: "TestWriter red: N failing" → "Implementer green: N pass". |
| RCA-2 | **A multi-unit deliverable is split PER UNIT.** | Each unit is its own red→green→adversarial→greens→doc-review cycle, delegated to sub-agents, landing as its own DONE row. Never implement 2+ units in one inline pass. |
| RCA-3 | **The adversarial pass is MANDATORY per unit, not optional.** | After each unit's green, run a READ-ONLY adversarial sub-agent (edge cases / unauthorized access / malformed inputs). Record findings in the unit's spec §3a/§3b; fix host findings here + regression-test; package findings → defects.md/HANDOFF.md. |
| RCA-4 | **Greens must be blind-verified, not self-verified.** | The `*-greens.md` scenario set is produced AND run by an agent who has NOT read the implementation, from the docs ONLY. A self-written greens set is a review finding. |
| RCA-5 | **>50%-context or multi-unit work is delegated, never inlined.** | If the deliverable spans 2+ spec units, split before starting; never share a unit's red→green→adversarial→greens→doc-review sequence with a sibling unit's in one inline run. |
| RCA-6 | **A documentation review is MANDATORY after the greens, not optional.** | AFTER the greens (before the unit is done), a read-only **documentation reviewer** reconciles the unit's spec + `*-greens.md` + active trackers against the ACTUAL build (names/signatures/return shapes/census claims/cross-refs/section numbers/test-counts). Fix stale entries in the SAME pass; record to `archive/reviews/<date>-<unit>-doc-review.md` (the archive is gitignored — the record is provenance only; the findings must land in the active trackers). This is the upstream archival loop (AGENTS.md item 6) applied AS A GATE — see item 10d. |
| RCA-7 | **A "waiting/reading" narrative must be paired with the tool call in the same turn — never narrate an action you are not performing.** | The loop failure mode: emitting "The X is running. Let me wait for it." / "Let me read X." WITHOUT calling the tool. Because the narrative calls no tool, the state never changes, so the next turn reproduces the same narrative — a fixed-point loop. Comply: (a) if you are going to wait on a background job, call `job_output(wait: true)` in the SAME turn; (b) if you are going to read, call `read` in the SAME turn; (c) if you have independent work, do it — never narrate waiting; (d) treat "Let me wait for it" / "Let me read X" as a red flag — if you are about to emit it without the tool call, that is the failure mode. A narration-only turn that advances no state is a review finding. **RECURRED 2026-08-28 (look-back adversarial pass):** after starting the L3 fix implementer, a series of "The L3 fix implementer is running. Let me wait for it." turns was emitted WITHOUT calling `job_output`. Root cause: the guard is a DOCUMENTED rule, not a mechanically-enforced one — the "waiting on a background job" state is a high-risk trigger, and the documented rule alone did not prevent the recurrence. The mechanical fix (the Agent Harness loop-detection feature request, `docs/feature-requests/agent-harness-loop-detection.md`) is not implemented in this harness. Mitigation for the supervisor: when a background job is running and its result is needed, call `job_output(wait: true)` in the SAME turn as any "waiting" narration; if there is independent work, do it instead of narrating. |
| RCA-8 | **A delegation that fails with max-tokens must be re-delegated with a FUNDAMENTALLY different approach, not the same task with cosmetic prompt tweaks.** | The loop failure mode: a large task is delegated to a subagent, it hits max-tokens before producing output, and the supervisor re-delegates the SAME task with only prompt wording changes — repeating the identical failure. Root cause: the task exceeds a single subagent's context budget (it reads a large test/spec + writes a large module in one context), and re-delegating the same shape cannot succeed. Comply: (a) after a max-tokens failure, CHANGE the approach — split the task into small, self-contained pieces (each fitting one context), or do the work inline in focused increments, or use a workflow to fan it out; (b) do NOT re-delegate the same task more than once with only prompt tweaks; (c) if a task is too large for one subagent, it is too large to re-delegate whole — split it. **OCCURRED 2026-08-28 (Unit K implementer):** the `SidebarPanes` host (a ~917-line test file + a large module) was re-delegated 5+ times, each implementer hitting max-tokens before writing anything, with only prompt wording changes. The fix is to split the implementation into small method-group pieces, each delegated with a tiny context (read only the relevant test describe blocks), OR implement inline in focused increments. |
| RCA-9 | **A supervisor loop that does not resolve must be broken by gathering NEW information, not by re-deriving the same conclusion.** | The loop failure mode: the supervisor fixates on one unresolved question and re-answers it identically across turns (same input → same reasoning → same output → no new fact → repeat), OR re-analyzes a contract instead of checking the actual repo/test state. Root cause: the loop adds no new information per pass, and the supervisor treats reading/analyzing as progress. Comply: (a) **empirical-first** — when a question is not resolving, run the failing test / read the actual assertion / check the real state, never re-derive the same dead-end; (b) **state-check-first** — after any interrupted or unknown-outcome tool call, verify external state (`git status`, test counts) before anything else; (c) **two-strikes rule** — if the same conclusion is reached twice, stop reasoning and change approach (empirical check, delegate, or ask the user); (d) **progress = state change** — count a pass as progress only if it changed the repo/test state, not the volume of analysis. **OCCURRED 2026-08-28 (Unit K supervisor):** the supervisor looped on "how can `buildContext().snapshot` equal the bridge snapshot without `boot()`?" — re-deriving the same reasoning verbatim across many turns instead of running the test (which answered it in one command: `expected null to deeply equal …`), and re-analyzed the contract after the implementer subagent was interrupted instead of checking `git status` + test counts (which showed 40/49 green, 0 stubs). The fix is the four comply rules above. |

## The per-unit cadence (the gold path)

1. **Spec** exists (`docs/specs/<unit>.md`) — the contract + every state / fail-state.
2. **TestWriter** (write/bash): writes tests from the spec ONLY (red). Runs + reports the failing set.
3. **Implementer** (read/edit/bash): runs after the red is reported; least code to green; re-runs the trio.
4. **Adversarial reviewer** (read-only): hunts edge/malformed/unauthorized after green. Findings recorded in the spec.
5. **Blind greens** — a fresh agent writes + runs the `*-greens.md` from docs ONLY (no impl read). Record pass/fail.
6. **Proofreader** — audits docs vs code+specs; fixes staleness.
7. **Documentation reviewer** (read-only) — AFTER the greens: reconcile the unit's spec + `*-greens.md` + the active trackers against the ACTUAL build (names/signatures/return shapes/census claims/cross-refs/section numbers/test-counts); fix stale entries in the SAME pass; record to `archive/reviews/<date>-<unit>-doc-review.md` (the archive is gitignored — the record is provenance only; findings land in the active trackers). This is the archival-loop gate (AGENTS.md item 6 + 10d, RCA-6).
8. **Trio** (`npm test`, `npm run typecheck`, `npm run build`) green; battery + MCP e2e + R13 as applicable.
9. **Docs** — merge findings into next-steps/pending/decisions/defects; the DONE row records the red set + adversarial + greens + the doc-review pass.

## Checklist a reviewer uses

- [ ] Each unit has a recorded RED run (not just "tests green").
- [ ] Each unit has a recorded adversarial pass with findings in the spec.
- [ ] Each unit's greens were authored + run by a blind agent (no impl read).
- [ ] Each unit has a recorded documentation-review pass (RCA-6): spec + trackers reconciled against the build, stale entries fixed in the same pass, record in `archive/reviews/` (gitignored — provenance only; findings land in the active trackers).
- [ ] Multi-unit deliverables were split per unit (not one merged run).
- [ ] Trio + battery + MCP e2e green.
- [ ] Defect-catalogue: host findings fixed here; package findings → defects.md/HANDOFF.md.
- [ ] Archival loop: obsolete docs archived into `archive/` (gitignored); every citation repointed (no dangling references).
