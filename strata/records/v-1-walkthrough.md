# `V-1` `pin-restate` — the L0 exit walkthrough record (replaced on every run)

The scenario set (L0-authored from the documents, never from the source tree) and the runs' outcomes;
this file is REPLACED, never appended (`strata/walkthrough.md` §6). The set's contract is the
goal/expected pair and a step's citation is resolved mechanically (§2, §4).

| # | Goal · expected | Cite |
|---|---|---|
| 1 | The manifest names the adjacent tree's current revision — `foundation.commit` = `git -C ../Provident-Electron rev-parse HEAD` | contract §1, §2 |
| 2–3 | `measuredAt` is the landing's own local day; the `digestCommand`'s single literal equals the pin | contract §2, §4 clause |
| 4–5 | The three `PINNED_COMMIT` constants agree; the §4 region carries four dated clauses, the LAST governs, and the register's two assertions read 4 | contract §2; pin-refresh contract §4 |
| 6–8 | Drift CLEAN with its PIN ARM read and equal; no module byte owed; the conformance leg a tally only, never green | `brief.md` §2, §6 |
| 9–10 | The unit's claims about what it left alone hold; the two store anchors keep the old revision, say why, and every pointer to that reason resolves | contract §2, §6; `pending.md` row 2 |
| 11–13 | The trackers state the post-landing pin and the landing; this record exists, is cited and over-claims nothing; three numeric claims reproduce against commands | `brief.md` §2/§6, both next-steps, this file |

## Runs to date

- **Run 1 — `STALE`.** Eight of ten steps passed mechanically; two of the unit's own claims about what
  it left alone were contradicted (it said four copied suites moved and seven were unchanged — all
  ELEVEN are one revision behind; and it explained the parked anchors by their files' "bytes differ",
  where both paths are ABSENT at the new revision). Both findings named `docs/L1/`, so both routed to
  L1, which corrected them annotate-beside with per-file md5s.
- **Run 2 — `DOC-GAP`.** Every value, agreement, blob and "left alone" claim reproduced; the verdict
  stood on documentation completeness alone: this record was cited and absent, the repairs were
  uncommitted, one sentence said "168 tests" where the four registers measure **162**, and two
  contract lines were stale (a `zones` digest prefix typo; §7.8 still listing the archive copy as
  owed). All were discharged by the pass that followed.
- **Run 3 — `STALE`.** The same class, one layer in: the project register's landing row still said
  `168`, and the contract's pointer to the anchors' reason sent readers to `pending.md` row 1, which
  the landing's tracker pass had renumbered to row 2. Both corrected beside themselves (`9a86be7`),
  the map's three stale pointers and its status line with them (`430f681`).
- **Run 4 — `DOC-GAP`.** All thirteen steps reproduced mechanically. Two documentation findings, both
  repaired: the contract's "no successor" evidence cited a path with no tree prefix (routed to L1,
  which found the archive it lives in), and this record lagged the runs the corpus cites (this rewrite).

## Not settled, stated as such

Run 1's staging root excluded the two huge project trackers, so their rows read `unverifiable` — never
cleared; later runs read them. An instrument's error is not a corpus finding (`walkthrough.md` §5): the
`168`/`162` discrepancy was L0's own arithmetic, corrected in the trackers rather than smoothed.
