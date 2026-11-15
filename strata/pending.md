# pending — work that is real, agreed, and blocked (D-2). Ceiling 40 lines.

**Each row says what it waits on** (D-2). A row leaves this file when its work lands; one whose
blocker never clears is deleted with the reason recorded here, not quietly kept. Actionable work is
`strata/next-steps.md`.

| # | Work | Waits on | Owner when unblocked |
|---|---|---|---|
| 1 | **The foundation import's SCOPE ruling** — which part of the update since the pin is imported: the UI/layout window alone (pane control bar, collapsible zones, pane minimum, gutter geometry, menu relocation, the two legacy panes), the data/record-family work beside it, or both; and whether the import is a pin refresh of the fifteen vendored modules first or the divergent renderer/main port first | **the user's ruling** (D-12; the intake's finding table is `strata/records/foundation-update-2026-11-15-research.md`) | L1 (`role_l1_architect`), after the user rules |
| 2 | **The `docs/` migration ruling** — whether the existing corpus (`docs/specs/` 227 files and the five trackers) stays live beside the layers' write scopes or migrates into them | **the user's ruling** (D-1 records that no migration is taken at install) | L1, with the first unit that would touch the corpus |
