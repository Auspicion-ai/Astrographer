# strata — the working corpus for Astrographer

This directory is the control corpus of the strata workflow in this project, installed 2026-11-15 as its first instance (D-1). Ceiling: 60 lines.

## What is here

| File | What it is | Ceiling |
|---|---|---|
| `brief.md` | the project brief: what the app is, the layers, the instruments — a unit's stage is `state`, never here (D-2) | 150 |
| `decisions.md` | the append-only register: user intent and measured rules, `D-n` (D-1) | 40 per row |
| `envelope.md` | the return contract every layer ends with (D-2) | 40 |
| `walkthrough.md` | the L0 exit pass: documentation sufficiency, blind (D-5) | 60 |
| `examiner.md` | the examiner's procedure at L1, L2 and L3 (D-6) | 45 |
| `rebuild.md` | the rebuild protocol and its threshold (D-4) | 40 |
| `modules.md` | module isolation, `modules.json`, the harness cap (D-7) | 40 |
| `research.md` | the L0 research procedure for intake (D-12) | 40 |
| `proposals.md` | speculative work nobody has asked for (D-2) | 40 |
| `next-steps.md` | open work that is actionable now (D-2) | 40 |
| `pending.md` | open work that is real but blocked, each row naming what it waits on (D-2) | 40 |
| `platform.md` | measured deployment and checkout constraints (D-2) | 60 |
| `archive.md` | where historical material lives and how citations resolve (D-2) | 60 |
| `modules.json` | the module map — L1-owned, absent until the first unit files it (`platform.md` §4) | — |
| `.strata/units/*.json` | state per unit, script-written (`platform.md` §4) | 40 |
| `records/<unit>-<pass>.md` | a review record: the scenario set or row table, replaced per run (D-5) | 40 |
| `records/<topic>-research.md` | an intake's finding table, replaced per pass (`research.md` §4) | 40 |
| `.strata/returns/*.json` | layer returns, as collected envelopes (D-2) | — |
| `records/handover.md` | the session handover, when one is written (D-2) | 60 |

The preset that supplies the roles lives in the deployment, not here (`platform.md` §1): personas
point, procedures rule, and nothing here restates one.

## How a unit moves

1. L0 interviews the user, records the row in `decisions.md`, and opens the unit (`init`, then
   `enter`). 2. L1 takes `brief.md` plus the tree, files the module map into `modules.json`, then
   designs `docs/L1/`. 3. Each module goes down L2 → L3 → L4 as `brief.md` §4 describes; each return
   carries `envelope.md`. 4. L0 runs the walkthrough (`walkthrough.md`); anything but `PASS` is a
   loop state, never readiness (D-5).

## State, not prose

`strata-state` owns progress: `init`, `enter --layer`, `artifact --id`, `assume --id --text
--alternative`, `pass`, `fail [--reason] [--from]`, `rebuild`, `close`, `show`. A unit's layer,
stage, artifacts, assumptions and per-artifact `streaks` live in `.strata/units/<unit>.json`,
overwritten at every transition; no document records where a unit stands (D-2). `stage` has two
legal values, written by the script alone — `design` at `init` and `rebuild`, `done` at `close` —
and **this paragraph is where that rule lives** (D-2). Readiness is the walkthrough's, never the
stage's (D-5).

## Checking this tree

L0 runs both at a unit's start and on every verdict; exit 0 means every ceiling, citation and shape
check passed. From the repo root:

```
node "../Agent Harness/strata/lint/strata-lint.mjs" strata
node "../Agent Harness/strata/state/strata-state.mjs" strata show <unit>
```

**Neither lives in this repository**: both ship with the adjacent `../Agent Harness/` checkout, not a dependency of this repo (`platform.md` §1).
