# Skill — Process Guardrails for the Battery / Multi-Unit Deliverables

Consolidates the RCA lessons (RCA-1..RCA-5) for a fresh sub-agent, so the
battery B/C/D process miss is not repeated. Canonical record:
`docs/specs/process-rca-battery.md`; the rules live in `AGENTS.md` items 2/3/7/10.

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
was absent at merge time. The RCA is `docs/specs/process-rca-battery.md`.

## The six guards (RCA-1..RCA-6)

| # | Rule | How to comply |
| --- | --- | --- |
| RCA-1 | **Never invert red/green order.** Implementation-first is a violation even if the suite is green. | Write tests (red) FIRST, run + report the failing set, THEN implement the least code, re-run. Record the red set in the unit's DONE row: "TestWriter red: N failing" → "Implementer green: N pass". |
| RCA-2 | **A multi-unit deliverable is split PER UNIT.** | Each unit is its own red→green→adversarial→greens→doc-review cycle, delegated to sub-agents, landing as its own DONE row. Never implement 2+ units in one inline pass. |
| RCA-3 | **The adversarial pass is MANDATORY per unit, not optional.** | After each unit's green, run a READ-ONLY adversarial sub-agent (edge cases / unauthorized access / malformed inputs). Record findings in the unit's spec §3a/§3b; fix host findings here + regression-test; package findings → defects.md/HANDOFF.md. |
| RCA-4 | **Greens must be blind-verified, not self-verified.** | The `*-greens.md` scenario set is produced AND run by an agent who has NOT read the implementation, from the docs ONLY. A self-written greens set is a review finding. |
| RCA-5 | **>50%-context or multi-unit work is delegated, never inlined.** | If the deliverable spans 2+ spec units, split before starting; never share a unit's red→green→adversarial→greens→doc-review sequence with a sibling unit's in one inline run. |
| RCA-6 | **A documentation review is MANDATORY after the greens, not optional.** | AFTER the greens (before the unit is done), a read-only **documentation reviewer** reconciles the unit's spec + `*-greens.md` + active trackers against the ACTUAL build (names/signatures/return shapes/census claims/cross-refs/section numbers/test-counts). Fix stale entries in the SAME pass; record to `archive/reviews/<date>-<unit>-doc-review.md` (the archive is gitignored — the record is provenance only; the findings must land in the active trackers). This is the upstream archival loop (AGENTS.md item 6) applied AS A GATE — see item 10d. |

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
