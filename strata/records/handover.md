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
| `U-1b` `zone-collapse` (`ee3725d` + the app-green pass) | one collapsed state (D-22), derived-and-overturnable; the sibling hide control; the `auto`/`hidden` extent partitioned from F-3's `0px`; the control's hit box and the settings-gear overlap fixed | envelope-green **and app-green on its three rows** |
| `U-1c` `theme-carrier` | `[theme="dark"]` via a widened `ThemeRoot`; `A-7` superseded by a dated clause; the seven pinned digests still match | envelope-green; **the paint is unclaimed** (no live row reads the carrier) |
| `U-4` `menu-opener` | the role-less View item over a dedicated channel | envelope-class; **PARKED with its reason** |
| `U-2` `pane-head` | the authored head row, the head out of the scroller, pane collapse as one leaf write, the minimum-is-the-head, the gutter pill | envelope-green **and app-green** (`UF-PANES-1/8`, `UF-LAYOUT-10`); two paints named as unclaimed |
| `U-3` `pane-move` | placement as `(zone, place)`, absence at the declared place, a no-op, ONE family write, the by-position zone form, the scoped query | APP-GREEN (the reveal defect it found is closed by `reveal-without-reassembly`) |

## What is owed, in order

1. **THE FOUNDATION ANSWERED `DLV-1…DLV-3` (D-26)** — its HEAD is `b312d83` (25 commits ahead), their
   `forking.md` §2.5/§3.4 and the `viewFamily` object are the answer, the fifteen vendored modules are still
   byte-equal (so the re-pin owes no module byte), and two of our asks were refused with reasons. **`B-0`
   `re-pin-b312d83` is now the program's first unit.**
2. **THE BASELINE PROGRAM IS MAPPED AND `B-1` IS ITS SECOND UNIT** (`docs/L1/foundation-migration-program.md`:
   ten units over three modules; `record-engine` and `gnosis-changes` are new). **The Gnosis event feed is
   LANDED engine-side** (`GET /changes`, `gnosis_server.rs:1056`) — the fork's consumer is unit `B-4`, so NO
   request is owed there. The foundation's own gaps are a filed request (`DLV-1`…`DLV-3`) plus one defect
   row (`F-3`, the seam's census measured at 1.9.3/1.10.0 against a declared `^1.11.0`).
   Carried into it, all named: `U-5:uf_layout_10=FAIL`, `RR-F6` (engine pass-2 drain in `runtime.ts`),
   `(c4)`/`RR-F2`, `U-1c`'s open theme-carrier row, the `D-22` relocation row, the opener's SIX UNREAD
   LINKS (the only behaviour in the port with no instrument of any class), and the tracker debt.
2. **The walkthroughs** — `E-1`, `V-2` and `U-1a` each read `STALE` on their last run and every finding
   since is repaired; `U-1b` has not had one. No unit has a recorded `PASS` except `V-1`.
3. **The superseded-vocabulary census** in `docs/` outside the units' grants (dated notes cover
   `FORK-DIVERGENCE` and `HANDOVER`; the rest are listed in `U-1a`'s and `U-1b`'s doc reviews).
4. Anything the baseline's units owe, each named in `docs/next-steps.md`'s DONE rows.

## Waiting on the user


- `pending.md` row 1 — surface (d), the record-family program (two rows now: the store-program relation
  and the `docs/` migration).
- Nothing else: D-22 closed the `U-1` adjudications and D-20 the dependency one.

## Process lessons from this session (each cost real time)

- **A string replace is not an edit unless the anchor is verified afterwards** (D-5) — three "repairs" were
  reported as landed and were not; the exit walkthrough caught it.
- **A walkthrough finds one class per run** (D-5). Eight runs on `V-1`, five on `E-1`, four on `V-2`. The
  findings were almost always *my own* tracker/census drift, never the unit's evidence.
- **The full live battery is bounded at 240 s and may not reach its reconciliation line** (D-10). Scope a block
  (`--block=<id>`) for a verdict rather than reading a truncated run as coverage.

**The pivot is CLOSED (D-25):** the second build on the foundation's head was declined after both intake
reviews returned `ADJUDICATION` (the demo-instance base; the fork's store is not the foundation's engine;
no display state exists yet; and the live gate would go blind under the branch-testing exemption). The
port finishes (`U-4`, the reveal defect, the tracker debt) and becomes the BASELINE for the D-23/D-24
work — the display-state seam and the panes' event-driven re-plumbing.
