# Astrographer — the L0 exit walkthrough

The blind documentation pass a unit must survive before L0 recommends it as ready (D-5). Ceiling: 60
lines.

## 1. What it is, and what it is not

A subagent that has never seen this unit's code attempts a scenario set using only the documentation
and the built surface. It tests whether the docs are **current** and **sufficient** — not whether the
feature works, which the batteries' job is (D-5). L0 authors the scenarios at exit from the
documentation and the brief, never from the source tree.

## 2. Scenarios

One set per unit, at most 12 steps. A step names a user-visible goal and the observable outcome that
would satisfy it. L0 shows the set to the user with the report, because it is the user's acceptance
path (D-5).

> EXEMPLAR — non-normative. Not a rule, not a constraint, not a default. A step reads
> "goal: open the security pane · expected: the group list shows the five groups and their current
> grant · source: docs/L1/security-pane.md §2". The set's contract is the goal/expected pair.

## 3. Staging and the runner

The staging root holds the documents a unit owns (this repo's `strata/` and the unit's `docs/L1…L3/`
pages), the `src/` those documents make claims about, the built artifact from `npm run build`, the
root pointers **and the manifest** — `README.md`, `AGENTS.md`, `package.json` — with `tests/`,
`scripts/`, `vendor/`, `archive/` and `node_modules/` left out (D-5). The runner is a fresh delegation
scoped to that root, and a claim the root cannot settle is recorded as **unverifiable**, never as
falsified (D-5).

## 4. Report

One row per step: `step · action taken · citation · outcome · guessed?`; the citation is a doc path
plus section and is resolved mechanically — an unresolvable citation is a DOC-GAP (D-2). Three lists
follow: `docs-insufficient` — knowledge no document supplies; `docs-stale` — a document claim the
surface contradicts; `undocumented` — surface behaviour a user would hit with no document at all.

## 5. Verdict and routing

Closed vocabulary: `PASS` | `DOC-GAP` | `STALE` | `UNUSABLE` (D-5). `DOC-GAP` and `STALE` route to the
owning layer of the cited document — L1, L2 or L3 — and L0 never edits another layer's document; a
finding against a procedure file or an L0-owned document routes to L0, which is its owner (D-3).
`UNUSABLE` routes to L1. A unit is recommended as ready only on `PASS`; any other verdict still
reaches the user, carrying a loop recommendation and never presented as readiness (D-5).

**The verdict's envelope form.** A run returns `PASS` for `PASS` and `FAIL` for the other three,
because `envelope.md` §2's set is closed and carries no walkthrough member; the record keeps the
four-word verdict, and the return's `rootCause` names what was contradicted (D-2).

**An instrument error is not a corpus finding.** When a staged root, a copied tree listing or the
runner's own tooling supplies a false reading, the record states it beside the verdict and the corpus
is not amended for it: that listing is L0's instrument, never evidence about the tree (§3, D-2).

## 6. Record

L0 writes the report to `strata/records/<unit>-walkthrough.md`, ≤ 40 lines, replaced on every run
(git holds the history), and it **stays live in `strata/records/`** — this corpus does not archive per
unit (`archive.md` §2). The scenario set lives in that same record, above the report — a step without
its goal/expected pair is not a scenario (D-5).
