# handover — where the branch stands (2026-11-15, L0)

The strata workflow ran for the first time in this project today. Read `strata/brief.md`, then
`strata/decisions.md` D-1…D-22, then this file. The program is the foundation import
(`docs/L1/foundation-import-program.md`), and five units have landed.

## Landed

| Unit | What it did | Layer reached |
|---|---|---|
| `V-1` `pin-restate` (`2d69aa8`) | the pin is `e8dfb57…`, measured 2026-11-15, five value lines + the register clause; no module byte owed (D-19) | `[T]`/`[D]`/DOC |
| `E-1` `deps-adopt` (`1cf44b4`) | `provident-ssr ^0.5.2` and `provident-storeroom ^1.11.0`; the 0.5.1 provider-drop finding closed by adoption (D-20) | `[T]`/`[D]`/DOC |
| `V-2` `conformance-refresh` (`8a868f7`) | the eleven copies are the pinned blobs; the lock's `conformance` block is a measured 147-suite disposition set; the register is the only copy-fidelity instrument (D-21) | `[T]`/`[D]`/DOC |
| `U-1a` `zone-vocabulary` (`15036dd`) | the zone vocabulary is the foundation's (`top\|bottom\|left\|right`, `[zone=]`, `order`→`index`); the MCP ids moved; `UF-LAYOUT-2` gained a literal limb and the LIVE leg read it `PASS` | envelope + **one app-green row** |
| `U-1b` `zone-collapse` (`ee3725d`) | one collapsed state (D-22), derived-and-overturnable; the sibling hide control; the `auto`/`hidden` extent partitioned from F-3's `0px` | envelope-green, **app-amber** |

## What is owed, in order

1. **`U-1b`'s three live rows** — the collapsed `auto` extent, the control's box as an assertion, and
   "no resize strip" are proven by no row; plus the measured defect that on an EMPTY derived-collapsed
   zone three of four controls are `20×4`/`14×20` (unhittable).
2. **The walkthroughs** — `E-1`, `V-2` and `U-1a` each read `STALE` on their last run and every finding
   since is repaired; `U-1b` has not had one. No unit has a recorded `PASS` except `V-1`.
3. **The 53-document superseded-vocabulary census** — the old `header`/`footer`/`data-zone` spellings in
   `docs/` outside the units' grants. `FORK-DIVERGENCE.md` and `HANDOVER.md` carry dated notes; the rest
   are listed in `U-1a`'s and `U-1b`'s doc reviews.
4. **`U-1c`** (the theme carrier and its supersession of `A-7`), then `U-2`/`U-3`/`U-4`.

## Waiting on the user

- `pending.md` row 1 — surface (d), the record-family program (two rows now: the store-program relation
  and the `docs/` migration).
- Nothing else: D-22 closed the `U-1` adjudications and D-20 the dependency one.

## Process lessons from this session (each cost real time)

- **A `python` string replace is not an edit unless the anchor is verified afterwards.** Three "repairs"
  were reported as landed and were not in the tree; the exit walkthrough — reading the corpus, not the
  commit message — is what caught it.
- **A walkthrough finds one class per run.** Eight runs on `V-1`, five on `E-1`, four on `V-2`. The
  findings were almost always *my own* tracker/census drift, never the unit's evidence.
- **The full live battery is bounded at 240 s and may not reach its reconciliation line.** Scope a block
  (`--block=<id>`) for a verdict rather than reading a truncated run as coverage.
