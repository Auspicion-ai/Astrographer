# proposals — speculative work nobody has asked for (D-1). Ceiling 40 lines.

**Kept so it is not re-derived.** A proposal that becomes wanted moves to `next-steps.md` with a
decision row; one that is refused is deleted, and the refusal is recorded here in a line rather than
carried as a row (D-2). Nothing on this page is admitted, scheduled, or implied by the corpus's own
state.

| # | Proposal | What it would need | Why it is not next |
|---|---|---|---|

**THE SECOND BUILD (the pivot) IS ADMITTED FOR REVIEW AND `ADJUDICATION` IS ITS VERDICT** (2026-11-16):
a build on the foundation's head instead of continuing the port. The user's architecture direction is
D-23 (the record carries display state, never content) and D-24 (the app panes keep their data content
and take the foundation's relocation, display, styling and event-driven update behaviour). Both intake
reviews ran, independently, and both returned `ADJUDICATION`:
`strata/records/foundation-import-second-build-{validity,critique}-2026-11-16.md`. Their shared blocking
set: the base is a three-pane DEMO instance whose ids are literals in seven tables; the fork's store is
NOT the foundation's engine (0 storeroom references in the fork's `src/`); D-24's "or writes it to the
store record" has no subject until surface (d) exists, which is gated on this landing (D-15, `pending.md`
row 1); the display state D-23 names does not exist in either tree (caret is an in-memory map, scroll
nowhere); and — the one that decides the ordering — **the mandatory live gate goes blind**: 166 driver
selectors name the fork's vocabulary and the base renders none of it, so the app-green rows would become
`SKIPPED-BY-RULING` (recorded as "NOT a pass") rather than red.

**No SPECULATIVE proposal stands at this head** (measured 2026-11-15, the install pass). The page
exists so the first speculative item has a lawful home: a proposal is put to `role_l0_validity` and
`role_l0_critique` before any design work starts (D-1), and neither review may see the other's
findings.

**THE FOUNDATION-IMPORT PROGRAM IS NOT A PROPOSAL** — it was asked for by the user and ruled at D-13
(all four surfaces) and D-14 (the foundation's vocabulary where the two collide). Its two intake
reviews are its own intake gate, and their `ADJUDICATION` findings are filed as
`strata/records/foundation-import-validity-2026-11-15.md` and
`strata/records/foundation-import-critique-2026-11-15.md`; the rulings that unblock design are
`pending.md` row 1.
