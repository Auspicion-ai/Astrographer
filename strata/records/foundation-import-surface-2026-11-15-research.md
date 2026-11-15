# foundation import surface — intake findings (2026-11-15, `role_l0_research`, read-only)

Topic: what an import of the foundation's update would touch in THIS fork (`research.md` §2).

| Claim | Source | Conf | If false |
|---|---|---|---|
| The fork's chrome is **its own**, built on the pin's thin shell: at the pin the foundation had `index.html` 43 lines and `renderer.ts` 1203, while the fork today has `index.html` 376, `renderer.ts` 1601, `pane-graph.ts` 2039, `sidebar-panes.ts` 4234 | `git show <pin>:src/renderer/*` vs `wc -l` in the fork | high | the import would be a merge, not a port |
| The fork's seven divergent capabilities are `FORK-DIVERGENCE.md`'s SC-1…SC-7 (regions+mount safety, gesture controllers, overlay, theme tokens, zone tracks, tab strip, native menu) | `docs/FORK-DIVERGENCE.md:43-49` | high | the collision list |
| **The foundation now owns the same chrome**: `.pane-head`, `.pane-grab`, `.pane-collapse`, `[collapsed]`, `.pane-drop`, `.menus-menu`, `.zone-collapse` with CSS anchor positioning | foundation `src/renderer/index.html:973-1159, 1285-1292` | high | a port would be additive |
| **Vocabulary differs**: foundation zones `top\|bottom\|left\|right` + `[zone=]`; fork zones `header\|left\|right\|footer` + `data-zone` + `--zone-*-track`. Foundation theme `[theme="dark"]`; fork writes `data-theme` | foundation `index.html:1176,1285-1292`; fork `index.html:116-196`, `src/renderer/theme.ts:52-57` | high | a rename pass would be owed |
| **Prior imports** ran: contract from recorded rulings → red set RUN before any byte → ONE atomic commit → trio → adversarial → blind greens → park/doc gates; the pin literal lives at **four sites** (lock `commit`, the embedded `digestCommand`, three `PINNED_COMMIT` test files) plus the register's §4 clause | `docs/specs/unit-pd-vendor-pin-refresh.md:58-70`, `docs/specs/unit-foundation-rerevendor-2026-10-04.md:13-23,74` | high | a pin move would be split-landed |
| The drift leg reads the **pin arm before** the byte arm; a moved HEAD is a PIN fault **by design**, met by one atomic restatement, and the arm may never be made revision-tolerant | `scripts/foundation-drift.mjs:342-362,390-410`; pin-refresh R-7 | high | today's FAIL would be read as byte drift |
| The conformance leg is **11 included suites + 4 X-1 exclusions** (they import the fork's divergent `dom-shim`), supplies **no behaviour evidence**, and no green word may be reported from it | `vendor/foundation.lock.json:199-233`; pin-refresh R-5 | high | a refresh would over-claim |
| Four baseline files are **never replaced**: `dom-shim.ts`, `types.ts`, `demo-envelope.ts`, `path-fork-cycle.ts` | `vendor/foundation.lock.json:180-185` | high | the port's baseline |
| **Nine** of the fifteen vendored modules have fork consumers; five have **none** (`focus-model`, `menu-template`, `mount-invariant-guard`, `owned-list-host`, `slot-host`) | grep of `src/**` for `../shared/<name>.js` | high | which pins matter |
| Nine of the fork's renderer files carry the chrome an overhaul would hit: `index.html`, `renderer.ts`, `runtime.ts`, `layout-state.ts`, `layout-vars.ts`, `sidebar-panes.ts`, `pane-drag.ts`, `pane-gutter.ts`, `pane-graph.ts`, plus `modal-state.ts`, `theme.ts`, `tab-strip.ts`, `tab-state.ts`, `secure-panels.ts` | `wc -l` census + the file map in this record's source pass | high | the surface list |
| **Features at risk** in any port: SC-1 mount sweep · SC-2 header-only drag/deferred capture · SC-3 modal re-parent (upstream refuses it) · SC-4 tri-state theme on `data-theme` · SC-5 four-track zone collapse · SC-6 tab strip + `provident.focus` · SC-7 menu/import dialog · the 3b `journalDepth` seam · `store-channels.ts`'s single-source rule · the fifteen-module digest pin | `docs/FORK-DIVERGENCE.md:43-49`; `docs/next-steps.md:27,47`; `src/main/store-channels.ts` | high | the risk register |
| `docs/FORK-DIVERGENCE.md`'s size citations are **stale** (records `index.html 44 vs 304`, `renderer.ts 142 vs 1053`; today 376 vs 1999 and 1601 vs 7844) | `FORK-DIVERGENCE.md:100-107` vs census | high | its §2 row citations need re-reading (a doc-review finding) |
| The fork's live queue stands on `U-ATOMICITY-SWEEP-CLASS-B` (`b298a9e` frozen) with `U-STORE-MODULES-MIGRATION` and `U-OPERATOR-SETTINGS-REHOME` next | `docs/next-steps.md:27,64`; `docs/HANDOVER.md:36-37` | high | where an import enters the queue |

**The import is not one thing.** It decomposes into at least four separable surfaces: (a) the **pin
restatement** (lock + 4 sites + register §4, no module bytes owed); (b) the **vendored test copies**
(11 conformance suites vs the foundation's moved suites); (c) the **layout/UI port** (the foundation's rows 248…287's
behaviours into the fork's own chrome, with the vocabulary reconciliation); (d) the **record-family
backlog** (`data/*`, view/tabs records, operator settings, storeroom). No scope is committed by this
record — the ruling is the user's (`pending.md` row 1).
