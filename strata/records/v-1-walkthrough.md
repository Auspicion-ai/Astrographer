# `V-1` `pin-restate` — the L0 exit walkthrough record (2026-11-15)

Scenario set (L0-authored from the documents, never from the source tree): the goal/expected pair is
the step's contract and its citation is resolved mechanically (`strata/walkthrough.md` §2, §4).

| # | Goal · expected | Cite |
|---|---|---|
| 1 | The manifest names the adjacent tree's current revision — `foundation.commit` = `git -C ../Provident-Electron rev-parse HEAD` | contract §1, §2 |
| 2–3 | `measuredAt` is the landing's own local day; the `digestCommand`'s single literal equals the pin | contract §2, §4 clause |
| 4–5 | The three `PINNED_COMMIT` constants agree; the §4 region carries four dated clauses, the LAST governs, and the register's two assertions read 4 | contract §2; pin-refresh contract §4 |
| 6–8 | Drift CLEAN with its PIN ARM read and equal; no module byte owed; the conformance leg a tally only, never green | `brief.md` §2, §6 |
| 9–10 | The unit's claims about what it left alone hold; the two store anchors keep the old revision and say why | contract §2, §6, §7.6; `pending.md` row 2 |
| 11–12 | The trackers state the post-landing pin; this record exists and does not over-claim | `brief.md` §2/§6, both next-steps |

## Run 1 — `STALE`

Eight of ten steps resolved mechanically and PASS; two of the unit's own claims were contradicted —
the contract said four copied suites moved and "the other seven are byte-unchanged" (the surface reads
all ELEVEN one revision behind), and it explained the parked store anchors by their files' "bytes
differ" (both paths are ABSENT at the new revision). Both findings named `docs/L1/`, so both routed
to L1, which corrected them annotate-beside with per-file md5s.

## Run 2 — `DOC-GAP`

Every value, agreement, blob and "left alone" claim reproduced mechanically; the two run-1 findings
now pass (`local == old 11/11`, `local == new 0/11`; both anchor paths `git show` exit 128 at the new
revision, 0 at the old). The verdict was DOC-GAP on documentation completeness alone: this record was
cited three times and did not yet exist, the repairs were uncommitted at the landing commit, one
sentence said "168 tests" where the four registers measure **162** (the 168 folded in the unit's own
six-row file, reported separately as 6/6), and two contract lines were stale (a `zones` digest prefix
typo; §7.8 still listing the archive copy as owed). All were discharged by the pass following this
record.

**Not settled, stated as such:** run 1's staging root excluded the two huge project trackers, so
their rows read `unverifiable` — never cleared; run 2 read them and found them current in the
worktree. An instrument's error is not a corpus finding (`walkthrough.md` §5): the `168`/`162`
discrepancy was L0's own arithmetic, corrected in the DONE row rather than smoothed.
