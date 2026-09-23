# LIVE BATTERY — `C9 U-EDIT-1` (`U-EDIT-1-LIVE`) + `U-STAGE-ACTIVE-TAB` — 2026-09-22

- **Runner role:** Live Scenario Runner (RCA-11 / RCA-12 live-gate duty).
- **Units under test:** (1) `docs/specs/unit-u-edit-1-whole-page-editing.md` §8.3 items 1–8 +
  §11 items 7/8 (the `U-EDIT-1-LIVE` battery; `docs/defects.md`
  `C9-U-EDIT-1-ADVERSARIAL-MUST-FIX-SET` **M4** is exactly this un-run battery);
  (2) `docs/specs/unit-stage-active-tab-display.md` §8.3 items 1–5 + §9 + amendment §A.1.1
  (`I2-R`) + the audit `archive/reviews/2026-09-22-tab-page-ownership-audit.md` §4.2.
- **Layer declaration (RCA-12):** every reading below is **assembled-renderer** — it comes from the
  EXECUTING `dist/` renderer in a running Electron app, driven through `scripts/live-drive.mjs`
  (MCP Streamable-HTTP on `127.0.0.1:3787` + CDP on `:9222`) with real CDP pointer/keyboard input.
  The node greens (`docs/specs/unit-u-edit-1-greens.md`, 41/41) are **ENVELOPE/STORE-green** and are
  **not** app-green; this artifact is the APP layer.

---

## 0. App launch state, driver provenance, commands

| item | value |
| --- | --- |
| App launcher | `DISPLAY=:0 bash scripts/start-app.sh --mode=lexical --cdp-port=9222` (the script builds `dist/` first and passes `--no-sandbox --disable-dev-shm-usage`) |
| Operator-app session (recon + regression runs) | started by **this pass** as a managed background job (`bash-302`), pid tree root `3040431` (`npm exec electron . --no-sandbox … --remote-debugging-port=9222`), **stopped at the end of the battery** (`job_kill bash-302`, verified: `MCP:000 CDP:000`). |
| Formal battery sessions | driver-spawned, `--home=/tmp/astro-…` (disposable) + `XDG_CONFIG_HOME=/tmp/astro-xdg` for the persistence pair; every spawned app was torn down by the driver (`electron exited with signal SIGTERM`). No orphaned process remains (`ps` + port checks recorded in §6). |
| Corpus note (state provenance) | two corpora were used and each is named per row: **(a)** the driver's deterministic seed (`alpha.md` + `beta.md`, `--seed` default `.live-corpus/`) — the formal battery; **(b)** the **operator store** (63 documents, incl. `defects`) — the *connect* recon run (`--no-seed`, no store writes: the failed commits never reach the store, §4.2). The row that needs a **table-bearing** document (`U-EDIT-1-LIVE-6`) searched both and **PARKED** for lack of one (§4.4). No operator data was destroyed: no successful page commit was ever made against the operator store (§4.2), and the persistence pair ran under a disposable `XDG_CONFIG_HOME`. |

**Commands actually run (verbatim; full logs kept under `/tmp/astro-live/`):**

```
# formal battery (driver-spawned app, disposable HOME + seed corpus)
node scripts/live-drive.mjs --mode=lexical --port=3787 --cdp-port=9222 --display=:0 \
  --block=u_edit_1_live_selection_span,u_edit_1_live_caret_head_body,\
u_edit_1_live_head_split_and_textarea_census,u_edit_1_live_representation_mode,\
u_edit_1_live_package_table_limitation,u_edit_1_live_typed_commit_one_batch,\
u_edit_1_live_commit_failure_warning,u_edit_1_live_caret_roundtrip,\
stage_surface_census_i2r,stage_document_tab_paints_its_document,stage_search_open_in_tab,\
stage_async_mount_race_v1,stage_docnav_switch_inside_async,stage_foreign_rederive_v2,\
stage_refresh_survival_v5,stage_tabs_persist_roundtrip,stage_multimount_reachability,\
stage_boot_landing_diag,user9_search_open_in_tab
  → /tmp/astro-live/FINAL-spawn-battery.log      "done: 19 blocks, 4 FAIL, 2 PARKED"

# §6.1 matrix completeness run (whole BLOCKS table)
node scripts/live-drive.mjs --mode=lexical --port=3787 --cdp-port=9222 --display=:0 \
  --home=/tmp/astro-full-home --block=all
  → /tmp/astro-live/FULL-battery-all.log         "done: 100 blocks, 40 FAIL, 3 PARKED"

# persistence round trip (SAME userData across two app lifecycles)
XDG_CONFIG_HOME=/tmp/astro-xdg node scripts/live-drive.mjs … --home=/tmp/astro-xdg-home \
  --block=stage_document_tab_paints_its_document,stage_tabs_persist_roundtrip   # run A
XDG_CONFIG_HOME=/tmp/astro-xdg node scripts/live-drive.mjs … --home=/tmp/astro-xdg-home \
  --block=stage_tabs_persist_roundtrip,stage_boot_landing_diag                  # run B (restart)

# the audit's pinned re-run + the neighboring regression blocks (operator app, --no-seed)
node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --display=:0 --no-seed \
  --block=user9_search_open_in_tab,uf_tabs_1,uf_tabs_3,uf_tabs_7,uf_panes_12,uf_panes_14,\
toolbar_toggle,user4_main_editable,repro_dup_para,user1_tab_new

# O-0 oracle-identity live re-run (owed by the driver edit, §11 item 7)
node scripts/live-drive.mjs --mode=lexical … --block=o0_document_row   # console-only, no --o0-out
```

---

## 1. The driver additions (what was authored, and the O-0 obligation)

**Added to `scripts/live-drive.mjs`** (one file; `MATRIX_ROWS` **unchanged** — verified by
`git diff scripts/live-drive.mjs | grep "^[+-].*row: 'U-[0-9]'"` → **empty**):

| what | symbol(s) |
| --- | --- |
| the audit's §4.2 **stage-identity oracle extension** (pinned shape, verified live after the edit) | `ufStageSig` now returns `{len, hash, docId, landing, editSurface, searchStage, searchInput, stageKind}` — the previous text/hash-only reading could not tell "the active tab's page" from "another tab's page". **Live post-edit reading** (fresh-store boot): `{"len":147,"hash":-1223690585,"docId":null,"landing":true,"editSurface":null,"searchStage":false,"searchInput":false,"stageKind":"landing"}` — all eight keys present |
| the derived identity pair + census helpers | `ufStageVerdict` (activeTabId/activeTabKind vs stageKind vs `data-edit-surface`), `ufSurfaceCensus` (`I2-R`: counts BOTH discriminators and requires agreement), `ufEditSurfaceState`, `ufCaretAt`, `ufCaret`, `ufType`, `ufBlurSurface`, `ufStageDocReadback`, `ufRealClickTab`, `ufExpandSearchTab`, `ufDocNavRow` |
| preconditions / fixtures (recorded, never silent) | `ufEnsureDocumentSurface` (doc-nav folder disclosure + doc-nav focus + bridge `openDocumentTab` recovery), `ufEnsureEditFixture` (a real `edit.import_markdown` of a two-section plain fixture), `ufOpenDocumentById` |
| blocks (19) | `u_edit_1_live_selection_span`, `u_edit_1_live_caret_head_body`, `u_edit_1_live_commit_failure_warning`, `u_edit_1_live_representation_mode`, `u_edit_1_live_head_split_and_textarea_census`, `u_edit_1_live_package_table_limitation`, `u_edit_1_live_typed_commit_one_batch`, `u_edit_1_live_caret_roundtrip`, `stage_surface_census_i2r`, `stage_document_tab_paints_its_document`, `stage_search_open_in_tab`, `stage_async_mount_race_v1`, `stage_docnav_switch_inside_async`, `stage_foreign_rederive_v2`, `stage_refresh_survival_v5`, `stage_tabs_persist_roundtrip`, `stage_multimount_reachability`, `stage_doc_surface_precondition_diag`, `stage_boot_landing_diag` |
| `ROW_EXTENDED` entries (16) | `U-EDIT-1-LIVE-1..8`, `UF-STAGE-AT-1..8` (extended, non-matrix — both units' specs pin **zero** new §5.U slots) |
| **one oracle FIX in an existing block** | `user9_search_open_in_tab`: its `searchShown` detector only recognised the search **PANE's** control ids, so it read the (now correct) search TAB stage as "no search shown". The stage's pinned roots (`#stage-search-tab` / `#search-tab-input`, `pane-graph.ts` `searchTabContent`/`SEARCH_TAB_INPUT_ID`) are now what it reads; every other assertion of the block is untouched. Without this the block FAILED on a stale oracle while the requirement held (§4.3). |

**O-0 oracle identity (owed by §11 item 7 — the pair `src/shared/o0-report.ts` + `scripts/live-drive.mjs`, `requirement-catalog.md` §2.2 fact 3):**

| | `src/shared/o0-report.ts` | `scripts/live-drive.mjs` | composite |
| --- | --- | --- | --- |
| **BEFORE** (recorded at the start of this pass) | `b89d6f19` (200 143 B) | `194dfece` (395 314 B) | `92a74b7d` |
| **AFTER** (this pass's tree; re-read by the live O-0 run) | `b89d6f19` (200 143 B — **`src/shared/o0-report.ts` was NOT touched**) | `b880677` (490 123 B) | `4d70ad64` |

The **live re-read** (`--block=o0_document_row`, console-only, `--o0-out` **not** passed so the
committed O-0 artifact could not be overwritten) printed
`oracleIdentity: {report b89d6f19, driver b880677, hash 4d70ad64}` — i.e. the re-run is recorded on
the edited oracle. **That run's own O-0 verdict is FAIL for a corpus reason** (its census claims 226
operator documents, the run's store has 2) — the O-0 measurement gate is **not** this pass's
subject and is **not** claimed green here.

---

## 2. §5.U delta-matrix rows for these two units — **ZERO ROWS (capped 8 unchanged)**

Both units' specs pin this **explicitly, with the reason**, so this is a **recorded exemption, not a
silent default**:

- `docs/specs/unit-u-edit-1-whole-page-editing.md` §8.3 *"The §5.U matrix disposition (pinned)"*:
  the matrix is **FULL at 8**, `MATRIX_ROWS` must not change; this unit's live assertions **re-pin
  existing rows** (`U-1`'s stage row, `UF-STAGE-6`, `UF-SETTINGS-5`, `UF-STAGE-3`) and its new
  assertions enter as **extended (non-matrix) rows**.
- `docs/specs/unit-stage-active-tab-display.md` §9 item 4: *"The §5.U row-set is NOT triggered in the
  additive sense … zero new matrix rows, with the reason being the cap plus the re-pin route."*

**Cap statement:** the delta contribution is **0 rows** against a cap of 8; nothing was exceeded.
The extended-row table in §4 is the same-shape review input (`D-GP-UFA-4`'s separate table), and its
8-row head is the compact form the review gate consumes.

---

## 3. §6.1 structured coverage report

### 3.1 The §5.U matrix rows (the driver's own emitted summary — the full-battery run)

`--block=all` (100 blocks) emitted, verbatim:

```json
{"unit":"user-flow-audit","layer":"assembled-renderer (RCA-12)","total":8,
 "pass":0,"fail":2,"parked":0,"matrixRowsExecuted":2,"blocksRun":100,
 "extendedRowsRun":54,"diagnostics":27}
```

`summary.total` = **8** = `MATRIX_ROWS.length` ✓, row-set reconciliation `OK` ✓. **Honest limit:** the
driver reports **one** §6.1 row result per block while `MATRIX_ROWS` maps two rows to one block
(`U-1`/`U-3 → uf_panes_12`, `U-2 → uf_tabs_7 …`), so only 2 of the 8 rows came back as typed matrix
verdicts even though all eight matrix blocks ran. The eight rows, with their executed verdict or the
recorded limit:

| row | block | verdict | assertion (user-visible end state) | dclass | realInput | evidence (concrete) |
| --- | --- | --- | --- | --- | --- | --- |
| U-1 | uf_panes_12 | **FAIL** (`realInput:false`) | a real doc-nav ROW click focuses that document | D-interaction | false | `doc-nav has no li[data-document-id=".live-corpus/beta"] (folder expand path=missing+[DIAG]-native-fallback(setup), expanded=null)` |
| U-2 | uf_tabs_7 | FAIL (block-level; row not typed) | a search RESULT click opens the doc in a NEW tab | D-interaction | false | `the search pane rendered NO result rows → the row click cannot be driven` (this store returns 0 `rag.query` results) |
| U-3 | uf_panes_12 | (row not typed by the driver — same block as U-1) | pane-drag surface = header only | D-interaction | — | see U-1's block run (`uf_panes_12`) |
| U-4 | uf_layout_10 | FAIL (block-level; row not typed) | ONE `#wiki-root` mount across empty↔filled | D-visual | — | `FILLED left=[33,53,160,499] main=[193,53,754,499]; → EMPTY: … isEmptyMirrorApplied=false gridTrackCollapsed=false stageWidened/Reclaimed=false` |
| U-5 | uf_layout_10 | FAIL (same block as U-4) | an empty side zone's track collapses | D-visual | — | same reading as U-4 |
| U-6 | uf_panes_8 | FAIL (block-level; row not typed) | a pane-tab click after minimize re-expands | D-interaction | cdp | `zone class="is-minimized" frames=0 tabStrips=[{"id":"zone-tab-left-search" …}]`, the re-expand click `path=miss` |
| U-7 | uf_hist_6 | **FAIL** | a history-entry click reverts the content | D-state | cdp | `typed "UFH661527", commit-on-blur → committedToStore=false; … REAL click on the OLDER entry #1 → current 2->0 moved=true; marker gone from the STORE=true … [restore] Redo → restored=false` |
| U-8 | uf_tabs_3 | **PASS** (block-level; the driver did not type it as a row verdict this run) | closing the LAST tab yields the default page | D-state | cdp | `closed active tab tab-4 ".live-corpus/beta": count 4->3; LEFT neighbour ".live-corpus/alpha" becameActive=true and its body mounted in #zone=main=true` |

`proxyPASS:false` for every row above except the ones the driver itself marked `FAIL(proxyPASS)`
(`UF-KEEP-1`, `UF-DEFECT-3`, `UF-KEEP-3`, `UF-DEFECT-6` — extended rows, not matrix rows).

### 3.2 The two units' extended (non-matrix) rows — the battery's actual verdicts

Run: the formal battery above (`FINAL-spawn-battery.log`; `done: 19 blocks, 4 FAIL, 2 PARKED`).
Verdicts: **C9 `U-EDIT-1`: 4 PASS / 3 FAIL / 1 PARKED; `U-STAGE-ACTIVE-TAB`: 6 PASS / 1 FAIL /
1 PARKED.** (`UF-DEFECT-7`'s re-run is counted with the stage unit.)

| row | block | verdict | assertion / invariant | dclass | realInput | evidence (concrete observed values) | layer |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `U-EDIT-1-LIVE-1` | u_edit_1_live_selection_span | **PASS** | a real hit-tested drag selects from one block into the next; ONE range, start/end containers in DIFFERENT block elements of the SAME `contenteditable` root | D-interaction | true | fixture `.live-page-edit-fixture` (2 blocks: `H1#…:section:1` box `[253,74,694,118]`, `H2#…:section:2` box `[253,224,694,60]`); drag `(293,133)` hit `rag-.live-page-edit-fixture:section:1` → `(600,254)` hit `rag-….section:2`; Selection `rangeCount=1 collapsed=false startContainer=text@P#…:p:1 endContainer=P#…:p:2 startBlock=H1#…:section:1 endBlock=H2#…:section:2 insideSurface=true` | assembled-renderer |
| `U-EDIT-1-LIVE-2` | u_edit_1_live_caret_head_body | **PASS** | ArrowDown from the head lands in the body, ArrowUp returns, surface identity+box UNCHANGED (no re-mount) | D-interaction | true | `ArrowDown → text@H2#…:section:2 (movedIntoBody=true)`; `ArrowUp → text@P#…:p:1 (returnedToHead=true)`; identity token `785…:679x4847` identical before/down/up; box `[253,74,694,210]` unchanged | assembled-renderer |
| `U-EDIT-1-LIVE-3` | u_edit_1_live_commit_failure_warning | **PASS** | a FAILED commit is USER-VISIBLE (painted, typed) AND survives a real re-derive; store read-back unchanged | D-visual | true | failure fixture `.live-corpus/alpha` (inline `<strong>`); blur → `warning=true kind=decompose-failed class=commit-failed painted=true box=[253,454,694,46] text="⚠ Commit failed (decompose-failed): page decomposer refused: the block element <strong> is outside the closed RagNodeType set"`; store read-back unchanged=true; after the real re-derive (`gnosisStatus()` → `onChanged()` → `host.refresh()`, app-graph re-assembled=true) the warning census is still `1`, painted, box `[253,793,679,68]`; surface census `1/1 agree=true` | assembled-renderer |
| `U-EDIT-1-LIVE-4` | u_edit_1_live_representation_mode | **FAIL** | markdown mode must render PLAIN TEXT (0 inline-formatting elements, 0 headings at heading scale) in a monospace family; the surface stays `contenteditable`; 0 `<textarea>` in either mode | D-visual | true | REAL click `#editor-toolbar-toggle` (hit-tested `path=cdp`): `data-mode html→markdown→html` ✓ **but** the stage does not change: `inline=0→0`, `headings=2→2`, `headingSizes=[32,16]→[32,16]`, `fontFamily system-ui, sans-serif`, `<pre>=0`; `stillContenteditable=true`; **zero `<textarea>` in both modes=true** | assembled-renderer |
| `U-EDIT-1-LIVE-5` | u_edit_1_live_head_split_and_textarea_census | **FAIL** | doc-head and first paragraph are SIBLINGS, the paragraph at BODY scale; 0 `<textarea>` in markdown mode, after a re-derive and back in html mode | D-visual | true | `firstP` is INSIDE the head: `pInsideHead=true pSiblingOfHead=false pParent="H1#…:section:1" headFont=32px pFont=32px headWeight=700`; textarea census `markdown={stage 0, global 0}`, `after re-derive={0,0}`, `html={0,0}` ✓ | assembled-renderer |
| `U-EDIT-1-LIVE-6` | u_edit_1_live_package_table_limitation | **PARKED** | a stored TABLE makes the commit REFUSE (typed) instead of flattening the stored `td/th/tr` nodes | D-state | false | `NO document in this store renders a table on its page-edit surface` (candidates `.live-corpus/alpha`, `defects` + up to 12 of `rag.list_documents`) — **precondition unmet in this corpus**, recorded park (the operator-store corpus run in §4.4 DID exercise the same refusal path with `kind=decompose-failed`, tables 3/87 cells, store unchanged) | assembled-renderer |
| `U-EDIT-1-LIVE-7` | u_edit_1_live_typed_commit_one_batch | **PASS** | a real typed edit + blur commits 1-1 to the store: `rag.get_document` read-back and the rendered DOM AGREE, no failure warning | D-state | true | fixture `.live-page-edit-fixture`; caret at block 1; REAL typed text `LIVEUEDIT50285` present in the surface (`text len 138→152`); REAL blur → `warning=false`; **store changed=true containsMarker=true; DOM containsMarker=true (AGREE=true)**; journal channel caveat §4.5 | assembled-renderer |
| `U-EDIT-1-LIVE-8` | u_edit_1_live_caret_roundtrip | **FAIL** | the page-scoped caret survives the page commit + a real re-derive (the caret is the TAB's page state) | D-state | true | after the typed edit the caret is a live Range in the block (`text@P#…:p:2 insideSurface=true`), after the blur still inside, **after the real re-derive it is `DIV#app` with `insideSurface=false`** (surface itself still present, marker unchanged) | assembled-renderer |
| `UF-STAGE-AT-1` | stage_surface_census_i2r | **PASS** | `I2-R`: exactly ONE live `#page-edit-surface` iff a document tab is active, both discriminators agree, marker = active document id | D-visual | n/a (census row) | document case: `activeTabId=tab-3 kind=document stageKind=document stageMatchesActiveTab=true; byId=1 byMarker=1 agree=true ids=[".live-page-edit-fixture"] boxes=[[253,74,694,275]] painted=true`; search case (connect run): `kind=search stageKind=search byId=0 byMarker=0 agree=true`; rendered-graph `rag-<marker>` root present=true; stage doc-head rid `<marker>:section:1` | assembled-renderer |
| `UF-STAGE-AT-2` | stage_document_tab_paints_its_document | **PASS** | a document tab paints ITS document (identity, not text) | D-state | true | REAL doc-nav click on `.live-corpus/beta` `path=cdp`; after: `activeTabId=tab-2 kind=document stageKind=document stageMatchesActiveTab=true surfaceCensus=1 markersAgree=true marker=.live-corpus/alpha box=[253,74,679,4803] painted=true`; graph carries `rag-.live-corpus/alpha`=true; stage doc-head `…alpha:section:1` | assembled-renderer |
| `UF-DEFECT-7` (stage re-pin) | stage_search_open_in_tab | **PASS** | "open in a tab" creates a tab whose stage is the SEARCH page (painted input), not the document body; 0 surfaces while a search tab is active | D-interaction | true | REAL click `#pane-search-expand-tab` `path=cdp`; tabs 5→6; `activeTabId=tab-6 kind=search vs stageKind=search stageMatchesActiveTab=true`; `#stage-search-tab present=true #search-tab-input present=true painted box=[253,57,694,125] text="Search resultsSearch(no results)"`; `documentBody=false`; census `1→0/1→0 agree=true` | assembled-renderer |
| `UF-STAGE-AT-3` | stage_async_mount_race_v1 | **PASS** | V1 race: a REAL tab switch INSIDE the search tab's own `rag.query` window lands the stage on the ACTIVE tab (stale completion discarded) | D-interaction | true | query typed into `#pane-search-input` (REAL focus+insert); REAL click `#pane-search-expand-tab` (tabs 7→8, the window's tab = search); INSIDE the window REAL tab-strip click on `tab-7` `path=cdp`; after settlement `activeTabId=tab-7 kind=document stageKind=document stageMatchesActiveTab=true stale-search-stage-present=false census 1/1 agree=true editSurface=.live-corpus/alpha` | assembled-renderer |
| `UF-STAGE-AT-4` | stage_foreign_rederive_v2 | **PASS** | V2: with a NON-document tab active, a real broadcast/re-derive paints no foreign document body and no edit surface | D-state | true | document tab `tab-…` edit+blur (warning `decompose-failed`) then REAL `#pane-search-expand-tab`; then the real re-derive: `activeTabKind=search stageKind=search stageMatchesActiveTab=true searchStage=true editSurface=null byId=0 byMarker=0 agree=true ids=[]`, `docHead=false`, `#zone:main="Search results…"` | assembled-renderer |
| `UF-STAGE-AT-5` | stage_refresh_survival_v5 | **PASS** | V5: a real `refresh()` keeps the page-edit surface (same marker, exactly one) AND the `#editor-toolbar` | D-state | n/a | before `surface present=true marker=.live-corpus/alpha box=[253,78,679,161] toolbar=true (node-6909)`; the real seam (`gnosisStatus()` → `onChanged()` → `host.refresh()`) called=true; after `present=true marker=.live-corpus/alpha box=[253,78,679,161] toolbar=true (node-…, re-assembled=true) census=1/1 agree=true` | assembled-renderer |
| `UF-STAGE-AT-6` | stage_tabs_persist_roundtrip | **PASS** | the persisted tab set equals the rendered open set + active tab; the boot stage satisfies `stageMatchesActiveTab` | D-state | n/a | rendered `activeTabId=tab-12 kind=document openIds=[tab-1…tab-12]`; persisted `{"ok":true,"activeId":"tab-12","order":[tab-1…tab-12],"openCount":12}`; **restart (run B, same `XDG_CONFIG_HOME`)**: `activeTabId=tab-2 kind=document openIds=["tab-1","tab-2"] stageKind=document stageMatchesActiveTab=true surfaceCensus=1` with `#zone:main="Alpha Settings modal (C3). The document alpha documents…"` (surface painted) | assembled-renderer |
| `UF-STAGE-AT-7` | stage_multimount_reachability | **PARKED** | `mountTabs([A,B])` census (`A.1.2 destroyRoot`) | D-visual | false | **structural park with the recorded reason**: the sidebar bridge exposes **no** `mount*` seam (`/mount/` keys = `[]`), no window-level host object, no DOM affordance — the spec pins the seam UNREACHABLE FROM PRODUCTION until `U-STATE-1e` lands. The census it would stress is asserted in every *reachable* state instead (AT-1/AT-3/AT-4) | assembled-renderer |
| `UF-STAGE-AT-8` | stage_docnav_switch_inside_async | **FAIL** | the spec §8.3 item 2 doc-nav trigger: a real doc-nav row click inside the async window leaves the stage on the ACTIVE tab's page (i.e. it must activate the document tab) | D-interaction | true | REAL click on `#pane-doc-nav [data-document-id=".live-corpus/alpha"]` `path=cdp` (hit `preempt-node-…`); after settlement `activeTabId=tab-9 activeTabKind=search stageKind=search stageMatchesActiveTab=true searchStage=true surfaceCensus 0/0 editSurface=null surface present=false`; tabs show `tab-9 Search: search-9 active=true` — the doc-nav handler routes to the SIDEBAR focus seam (`selectDocument` → `setCurrentDocumentId` → `requestRebuild`) and never activates/opens a document TAB | assembled-renderer |
| `UF-DEFECT-7` (legacy re-run) | user9_search_open_in_tab | **PASS** | the audit's §2.6 re-run: in steady state the search tab mounts the SEARCH view in the new tab's `#zone:main` | D-interaction | true | REAL click `#pane-search-expand-tab` `path=cdp`; tabs 1→2; ACTIVE tab `Search: search-2`; `#zone:main: searchInput=true isDocumentBody=false` — **the historical `LIVE-UF9` repro no longer reproduces.** NOTE: this block PASSED only after its detector was re-aimed at the search tab's own roots (§1); with the stale detector it reported FAIL on a correct stage (§4.3) | assembled-renderer |

**Diagnostics (no verdict — "a block that cannot fail is not evidence"):**
`stage_doc_surface_precondition_diag` (the precondition record: landing tab at boot, 0 doc-nav rows
until the folder disclosure is opened, the bridge `openDocumentTab` recovery) and
`stage_boot_landing_diag` (empty-store boot reading; see §4.1).

---

## 4. Findings, parks, and the raw evidence (failures are never passes)

### 4.1 The empty-boot landing reading (a DIAG, never asserted)

A fresh store boots with **one `other`/landing tab** and `stageKind=landing`,
`stageMatchesActiveTab=true`, `#zone:main children=["stage-landing","editor-toolbar","pane-history"]`,
surface census `0/0`. The driver's own `--block` battery cannot assert this state because it seeds a
corpus (and a store with documents) before the first block; the reading comes from the driver's
initial state (recorded in `/tmp/astro-live/…` session logs and in
`stage_doc_surface_precondition_diag`). **Reachable defect the precondition work exposed (new
finding):** on a fresh, document-less boot there is **no live gesture anywhere that opens a document
TAB** — the landing stage's `li[data-document-id]` rows carry **no handler**
(`pane-graph.ts` `landingContent`), and the doc-nav row's own handler does not activate a tab, so a
user with a store but no persisted tabs (or after closing every tab while the landing is shown)
cannot reach the page-edit surface at all. This is a **structural reachability gap for the live
surface**, recorded here as a finding (owner: the tab/stage unit that owns `openDocumentTab`
wiring); the battery works around it with the bridge `openDocumentTab` seam, recorded in every
affected row's evidence (never claimed as a real gesture).

### 4.2 `U-EDIT-1-LIVE-7` PASS — but against the STORE layer only (honest limit)

The typed edit **does** commit: `rag.get_document` read-back changed and carries the typed marker,
and the rendered DOM agrees. **The "ONE `edit.batch`" half could not be measured live in this pass:**
the reachable journal channel (`provident.get_journal`) is the **ENGINE Supervisor journal**
(`mcp-server.ts` — *"the engine journal … undo/redo stacks"*), **not** the RAG store's project
journal (`handleRagJournalIpc` / `RagStore.journal()`, which the history sub-pane consumes); on this
host the engine is `absent`, so the read is `{entries:0, undoDepth:0}` before and after the commit in
one run and a `20 × destroy` delta in another (measurement channel instability, recorded). The
one-batch claim's live oracle therefore **remains unexercised**; its only evidence today is the node
layer (greens `C1`: exactly one `applyBatch`, no `enqueue`). **No store damage:** the fixture document
is the driver's own import, and the operator store was never committed to (§0).

### 4.3 The `user9_search_open_in_tab` oracle fix (a live-contradiction resolved in the oracle, not the app)

Raw pre-fix reading (operator app, 2026-09-22):
`FAIL … ACTIVE tab=Search: search-2 … #zone:main: searchInput=false ragResults=false isDocumentBody=false
snippet="Search resultsSearch(no results)Editing: HTML…"`. The stage **was** correct
(`#stage-search-tab` + `#search-tab-input` painted, no document body, 0 surfaces); the block's
detector only looked for the search **pane's** ids. The detector now reads the pinned search-tab ids;
the block then PASSES on both corpora. **Recorded as an oracle fix (spec-named ids), not an app
change, and not a softened assertion.**

### 4.4 `U-EDIT-1-LIVE-6` PARK — with both halves recorded

In the formal corpus (2-doc seed) **no document renders a table on its page-edit surface**, so the
row is PARKED with that reason (§3.2). The same refusal path **was** exercised on the operator store
(63 documents incl. `defects`) in the connect recon run — raw reading:
`rendered table census={"tables":3,"trs":11,"tds":87,"tableRids":["defects:table:1..3"]}`; typed edit
+ REAL blur → `warning=true kind=decompose-failed class=commit-failed painted=true box=[253,815,679,68]
text="⚠ Commit failed (decompose-failed): page decomposer refused: a <table> block cannot be expressed
by the adopted decomposer (recorded capability gap — a stored ta…"`; `store read-back unchanged=true`;
rendered tables after the refused commit `=3 (census preserved)`. **That is not a PASS of the parked
row** (the formal run's corpus could not present the precondition) but it is the recorded evidence
that the refusal behaviour is what the spec pins.

### 4.5 The three `U-EDIT-1` FAILs and the two stage FAILs — one-line reproductions

| finding | reproduction (driver block) | what the app does instead |
| --- | --- | --- |
| `DOC-HEAD-CONTAINS-FIRST-PARAGRAPH` still live | `u_edit_1_live_head_split_and_textarea_census` | the first `<p>` is a CHILD of the `h1` (`pInsideHead=true`, `pFont=32px === headFont=32px`) — the owed live row of that defects row FAILS |
| markdown mode is not a plaintext representation | `u_edit_1_live_representation_mode` | the REAL toggle flips `data-mode` and the toolbar label, but the stage keeps the rich HTML (`headings=2`, `headingSizes=[32,16]`, `fontFamily system-ui`, `pre=0`) — nothing in `src/**` renders `representationMode` (`grep` over `src/` shows only `sidebar-panes.ts`/`pane-graph.ts`/`operator-settings-store.ts` consumers, no renderer/traversal path) |
| the page caret does not survive the re-derive | `u_edit_1_live_caret_roundtrip` | after the successful commit the caret is a live Range in the block; after the real re-derive it is `DIV#app` (`insideSurface=false`) while the surface itself survives |
| the doc-nav click never activates a document tab | `stage_docnav_switch_inside_async` | a real doc-nav row click inside the async window leaves the ACTIVE tab = the search tab, `stageKind=search`, 0 surfaces; the handler routes to the sidebar focus seam only |

### 4.6 Structural park (the only one)

`UF-STAGE-AT-7` — `mountTabs` is **unreachable from production** in the shipped shell (no bridge
seam, no host object, no DOM affordance; the seam's own docblock pins it as unreachable until
`U-STATE-1e`). **Recorded park reason + evidence** in §3.2; per RCA-11 this is a *structural*
non-exercisable seam, not a parked-by-default UI-overhaul unit — every other stage/`I2-R` property
was exercised live in §3.2.

---

## 5. §6.1 row-set / count reconciliation (this report)

- The formal battery's own emitted summary is quoted verbatim in §3.1
  (`total=8 = MATRIX_ROWS.length`, `blocksRun=19`, `extendedRowsRun=18`, `diagnostics=1`,
  reconciliation `OK`).
- This report's extended-row set = the 16 `ROW_EXTENDED` entries added by this pass
  (`U-EDIT-1-LIVE-1..8`, `UF-STAGE-AT-1..8`) + the re-run `UF-DEFECT-7` = **17 rows reported, 0
  invented, 0 dropped**. `U-EDIT-1-LIVE-6` and `UF-STAGE-AT-7` are **PARKED** (reasons recorded);
  every other row carries an explicit PASS/FAIL.
- No row in this artifact is marked PASS on a proxy oracle: every PASS names a hit-tested `path=cdp`
  gesture and a painted/state value; `proxyPASS:false` throughout.
- This report is **not** self-blessed: §6.2's read-only audit remains the acceptance gate.

## 6. Blocker / environment notes (raw evidence)

1. **The operator app was not running at the start** — `curl -s -o /dev/null -w '%{http_code}'
   http://127.0.0.1:3787/mcp` → `000`. It was started by this pass (managed job `bash-302`,
   `DISPLAY=:0 bash scripts/start-app.sh --mode=lexical --cdp-port=9222`) and **stopped** at the end
   (`job_kill bash-302`; re-check `MCP:000 / CDP:000`). `--cdp-port=9222` must be passed explicitly:
   `scripts/start-app.sh` has **no default** CDP port, so the driver's `--cdp-port=9222` cannot
   attach to an app launched without it.
2. **The app's userData ignores `HOME` on this host** — `XDG_CONFIG_HOME` is exported
   (`/home/ryanr/.config/kdedefaults:…`); a run with `--home` but without `XDG_CONFIG_HOME` wrote
   nothing under the disposable HOME (evidence: `/tmp/astro-persist-home` remained empty while
   `~/.config/provident-electron/provident-operator-settings.json` stayed at its old mtime
   `2026-09-19 20:27`). The persistence pair therefore ran with
   `XDG_CONFIG_HOME=/tmp/astro-xdg` and produced its own settings file
   (`{"activeId":"tab-2","order":["tab-1","tab-2"],"open":[…]}`).
3. **`edit.import_markdown` takes FILE PATHS, not inline `{name,text}` objects** —
   `Invalid arguments for tool edit.import_markdown: Invalid input: expected string, received object
   at files[0]`; the fixture helper writes `.live-page-edit-fixture.md` under the project root (the
   store's corpus root) and the driver removes it in its `finally` (the file is the driver's own
   artifact).
4. **`rag.query` returns zero results for both corpora** (`{results:[],ranked:[],k:5}` for
   `alpha`/`the`/`document`), so the search-pane result-row gestures are unavailable; the V1 race uses
   the tab-strip switch (a real gesture on the real seam) and the missing result rows are recorded in
   the affected evidence (`uf_tabs_7` FAIL, `U-2`).
5. **`--strict-seed --seed=<quoted path>` did not take effect** in the `--block=all` invocation (its
   log shows the 2-doc seed import; O-0 census `documents:2`), so the O-0 rows in that run fail on
   the corpus census by construction — unrelated to this battery's verdicts.
6. `ps` check after teardown: no `start-app`/`electron` process from any run of this pass remains;
   the only surviving processes are unrelated (Discord/Postman crashpad handlers).

---

## 7. What this artifact does NOT claim

- It does **not** claim the two units are DONE: three `U-EDIT-1` rows FAIL, one stage row FAILS, one
  row PARKs on a formal-corpus precondition, and one row PARKs on a structural seam.
- It does **not** claim app-green for the node greens: the node `41/41` (`unit-u-edit-1-greens.md`)
  is ENVELOPE/STORE-green, and four of its NOT-TESTABLE items are exactly the rows that FAIL here
  (`N1` census, `N2` caret, `N3` markdown rendering, `N5` painted warning — `N5`'s live half PASSES).
- It does **not** re-derive `MATRIX_ROWS` (unchanged, 8 rows) and it does **not** touch
  `docs/defects.md`, `docs/next-steps.md`, `docs/decisions.md`, `docs/pending.md`, or any other unit's
  spec. The findings above are stated here for the supervisor's tracker pass.
