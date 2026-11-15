# Astrographer — where historical material lives, and how citations resolve

The corpus installed at D-1 sits BESIDE the project's existing documentation, it does not replace it
(D-1). Ceiling: 60 lines.

## 1. What moved

**Nothing moved at install.** `docs/` is retained whole and stays live (`brief.md` §7): 250 tracked
files, 227 of them under `docs/specs/`, beside `docs/decisions.md`, `docs/defects.md`,
`docs/pending.md`, `docs/next-steps.md`, `docs/HANDOFF.md`, `docs/HANDOVER.md`, `docs/FORKER.md`,
`docs/FORK-DIVERGENCE.md`, `docs/requirement-catalog.md`, `docs/live-testing.md` and `docs/skills/`
(D-1). The workflow's own layer documents are new files under `docs/L1/`, `docs/L2/<module>/` and
`docs/L3/<module>/` (`brief.md` §3), created on first write.

`archive/` is the project's pre-existing historical store: **199 tracked files** at this head, in
per-topic folders (`archive/gate-reviews/`, `archive/greens/`, `archive/findings/`, `archive/specs/`,
`archive/decisions/`, `archive/pending/`, `archive/handoffs/`, and the rest — measured 2026-11-15 by
`git ls-files 'archive/**'`). This project's archive is tracked, unlike the workflow's own corpus,
which gitignores its archive (`README.md`).

## 2. The prefix mapping

**There is no prefix substitution in this repo.** A citation to a historical record resolves at its
own path under `archive/<topic>/<date>-<name>.md`, and a citation to a live document resolves where
that document stands. A `docs/…` citation in `src/`, `tests/` or `scripts/` comments is a claim about
the existing corpus and is read there.

## 3. What the install did to the suite

Nothing: the install wrote only under `strata/`, and no `src/`, `tests/`, `scripts/` or `vendor/` file
was touched (measured 2026-11-15 by the install pass's diff). The suite's readings are `brief.md` §6's
and are not restated here (D-2).

## 4. Records, and why they are not archived per unit

A unit's review record, walkthrough report and retrospective stay live in `strata/records/` and are
replaced on every run — git is the history (`README.md`, D-2). This corpus does not archive per unit:
the archive holds the project's historical gate material, and a live record moved there would leave
the walkthrough's citations unresolvable (D-5).

## 5. When you need an archived fact

Read it at its archive path and treat it as history. There is no topic index — search it:
`grep -rl <term> archive/`. A fact still load-bearing is re-filed through the loop — L1's map, L2's
surface, L3's design, or `decisions.md` if it is user intent — as an ordinary unit, never a copy: the
archive copy stays where it is (D-2).
