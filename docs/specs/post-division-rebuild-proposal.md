# POST-DIVISION REBUILD — the proposal (branch `post-division-rebuild`)

**Date:** 2026-09-27 · **Pass kind:** PROPOSAL (gate-1 input; no code, no test, no spec below this file
is authorised by it) · **Branch:** `post-division-rebuild`, created from `main` at `b6791e0` ·
**Layer (RCA-12, mandatory):** **DOC-LAYER / proposal — NOT app-green, NOT envelope-green, NOT
store-green, NOT engine-green, NOT live-green.** Every code claim below is a **read** of one of the
three trees; every suite figure is labelled with who measured it.

**The product owner's instruction (verbatim, the authority for this proposal):**

> *"Start a post-division rebuild git branch for the project. This will be using the expanded version of
> the base Provident-Electron project hosted in an adjacent folder (or at
> https://github.com/LittleKingsguard/Provident-Electron) to replace the local implementations of the
> added elements documented in the guides (`/media/ryanr/Shared Files/Projects/Provident-Electron/docs/guide`).
> Additionally it will use the expanded Gnosis engine that offloads more of the Astrographer-internal
> graphing. All local code implementing the relocated UI or delegated engine functions, and the tests
> that apply to those features, will be eliminated in this branch."*

**Citation discipline.** `path` + **symbol** / **row id** / **§section**. **No line number appears in
this file** (the convention `docs/specs/requirement-catalog.md` §3.4 rule 7 establishes). Where a source
document's own citation is line-numbered, it is quoted as that document's text, never adopted here.

**Companion artifacts (the gate-1 inputs, ALL THREE NOW LANDED — read beside this file):**

| Artifact | What it is | Status |
| --- | --- | --- |
| `docs/specs/post-division-foundation-adoption-surface.md` | the FOUNDATION side — 23 rows (14 guide elements + 9 ledger units), each with its verified source symbol, adoption verdict, declared degradation, dossier class and 12 guide-vs-tree findings | **LANDED 2026-09-27 (501 lines)** |
| `docs/specs/post-division-local-elimination-inventory.md` | the FORK side — 19 candidate ids, the consumer maps, the PROTECTED set, the dependency-ordered wave table (W0–W9) and the test disposition | **LANDED 2026-09-27 (691 lines)** |
| `docs/specs/post-division-engine-offload-inventory.md` | the ENGINE side — the Gnosis surface, `GR-1..GR-9` verdicts, 19 ids / 31 modules, the blocking analysis and the six-item additive set | **LANDED 2026-09-27 (829 lines)** |

**Completion state of this file (revised 2026-09-27 — ALL FOUR GATE-1 STEPS HAVE RUN).** §1–§3, **§4**
(rewritten onto the inventories, then amended by §4.7 with every re-classification naming the finding that
forced it), §5 (amended: G-3/G-4/G-5/G-6 corrected, G-8 and G-9 added), §6 and §7 (the gate-1 record) are
complete. **This file is a REVIEWED INPUT, and the gate returned `BLOCKED-ON-SEMANTICS` — its open list is
§7.3 and the consolidated record is `docs/specs/post-division-rebuild-proposal-review.md`.** §4.1's rows
deliberately do **not** carry per-file consumer maps or per-file test dispositions — those are **each
unit's own spec-gate obligation**, and `X-3` owes their re-derivation per amended row before delegation
(§4.4 summarises the measured cost). **The engine ELIMINATION half is `BLOCKED-ON-ENGINE` and is explicitly
NOT part of the program this gate opened** (§4.3).



---

## 1. What the division is (established by reading both trees)

`docs/FORK-DIVERGENCE.md` records the fork's original position: the foundation shipped an MCP/Electron
endpoint with deliberately minimal chrome, and **rows 1–7 of its §2 table** were the shell-chrome
capabilities the fork had to invent locally (regions + mount safety, pointer-gesture controllers, the
overlay primitive, the theme token layer, the zone-track contract, the main-focus tab model, the
data-driven native menu). Each was filed against the foundation as **`SC-1..SC-7`**
(`docs/feature-requests/provident-electron-shell-chrome-requests.md`) and again as the implementation
work package **`SCH-1..SCH-13`** (`docs/feature-requests/provident-electron-shell-chrome-handoff.md`).

**The foundation has now adjudicated and landed that set itself.** Read from the foundation tree
(`../Provident-Electron/`, its own trackers):

- `docs/decisions.md` `DECIDED: SHELL-CHROME-HANDOFF-DISPOSITION` — the fork's package is *"adjudicated
  GO-CONDITIONAL and AMENDED … 6 `SCH`-derived units adopted-reshaped + 2 engine prerequisite units = 8
  units, 6 items declined/refiled, 1 split, 1 refile withdrawn, ZERO PARK"*, with the admission rule
  `S-d8` and its six prohibitions.
- `docs/next-steps.md` — the ledger closes at **`21 DONE / 0 open` UNITS = `21` units** (the
  `U-FOCUS-TOOL` `F3` close-out row). The units are the foundation's own: `U-ENGINE-PIN`,
  `U-ENGINE-DRIFT`, `U-MOUNTGUARD`, `U-LISTHOST`, `U-SLOTHOST`, `U-PROJ`, `U-CENSUS`, `U-GSESSION`,
  `U-MENULIB`, `U-OVERLAY`, `U-ZONES`, `U-CONTAINER`, `U-GUTTER`, `U-RELOCATE`, `U-THEME`,
  `U-THEME-CONTROL`, `U-FOCUS-MODEL`, `U-FOCUS-TOOL` (+ its harness units).
- `docs/guide/` — the **SIXTEEN** files that document the landed elements (`README.md`, `TEMPLATE.md`
  plus the fourteen pages: `00-base-surface.md`, `seams.md`, `theme.md`, `theme-control.md`, `overlay.md`,
  `menulib.md`, `container.md`, `relocate.md`, `gutter.md`, `gutter-ui.md`, `zones.md`, `focus-model.md`,
  `focus-tool.md`, `mcp-parity.md`). **`V-10` corrected the first version's "thirteen".**
- `docs/FORKER.md` §4 — the fork-facing digest, one row per unit, each stating **what a fork gets** and
  its **honest limits**.

**The consequence, stated per half — `V-5` corrected the first version's over-reach.** The first version
claimed *"every mechanism the fork hand-rolled in rows 1–7 is now foundation-owned"*. **That is FALSE for
one half: the foundation DECLINED `SCH-1`'s region-host half** (*"the region host stays declined;
`U-SLOTHOST` adopted host-only"* — foundation `docs/next-steps.md`'s Q6 answer and
`DECIDED: SHELL-CHROME-HANDOFF-DISPOSITION`'s *"6 items declined/refiled"*). **Corrected statement:**

| The fork's row-1..7 divergence (`docs/FORK-DIVERGENCE.md` §2) | Foundation disposition | This rebuild's effect |
| --- | --- | --- |
| gesture controllers (row 2) · overlay primitive (row 3) · theme token layer (row 4) · zone tracks (row 5) · focus/tab seam (row 6) · native menu catalog (row 7) | **OWNED** — landed as units and closed | their fork-local mechanisms are the duplicate set (§4.1) |
| **shell regions + mount safety (row 1)** | **SPLIT: the mount-invariant half is OWNED (`U-MOUNTGUARD`); the REGION-HOST half is DECLINED and stays fork-local** | **`PD-UI-10` may adopt the guard + port the host fix; the region host has NO foundation counterpart and stays** — the first version left this implied and `V-5` filed it |
| the app layer (rows 8–9: content reconcile, the RAG/domain/host layer) | **NOT FILED — app behavior by design** | untouched by this rebuild |

**And the elimination is what the product owner's instruction orders** — executed under
`DECIDED: REBUILD-ARCHIVE-POLICY` as §4.6 states (tests ARCHIVED, `src/**` deleted, coverage delta recorded).


**The same division on the engine side.** The fork's `docs/feature-requests/gnosis-engine-feature-requests.md`
(`GR-1..GR-9`) and `docs/HANDOFF.md` carry the asks against the sibling `Gnosis` engine. The rebuild's
engine half is bounded by §4.3's inventory and by §5's gating analysis — **it may not be assumed**.

---

## 2. The consumption model — MEASURED, and the one architect question it leaves open

`../Provident-Electron/docs/guide/seams.md` §"Gotchas measured in this repo" states the model in the
foundation's own words: *"those three modules are in **no shipped bundle** and **a fork consumes them as
source**."* The foundation's mechanisms are therefore **vendored**, not installed.

**Measured import closure (this pass, read from the foundation tree).** The fifteen mechanism modules
the foundation added are:

`census.ts` · `container.ts` · `focus-model.ts` · `gesture-session.ts` · `gutter-affordance.ts` ·
`gutter.ts` · `layout-projection.ts` · `menu-template.ts` · `mount-invariant-guard.ts` · `overlay.ts` ·
`owned-list-host.ts` · `relocate.ts` · `slot-host.ts` · `theme.ts` · `zones.ts`

Their **complete import census is internal to that set**: `census.ts` imports `zones.js`;
`gutter-affordance.ts` imports `gutter.js` + `gesture-session.js`; `gutter.ts` and `relocate.ts` import
`gesture-session.js` (types). **No module in the set imports any other file of the foundation's
`src/shared/`** — verified by reading every import statement in all fifteen.

**Why that matters — the baseline-collision finding (this pass).** Four `src/shared/` filenames exist in
**both** trees and the fork's copies are NOT the foundation's:

| File | Astrographer | Foundation | Differs? |
| --- | --- | --- | --- |
| `src/shared/dom-shim.ts` | 508 lines | 237 lines | **DIFFERS** |
| `src/shared/types.ts` | 874 lines | 328 lines | **DIFFERS** |
| `src/shared/demo-envelope.ts` | 131 lines | 433 lines | **DIFFERS** |
| `src/shared/path-fork-cycle.ts` | 101 lines | 101 lines | identical (md5-equal by line count and `diff -q`) |
| `src/shared/document-tree.ts` · `o0-hook.ts` · `o0-report.ts` | fork-only | — | — |

Because the fifteen mechanism modules import **none** of those four, adopting them is
**import-closed and collision-free**: the fork vendors the fifteen mechanism modules into
`src/shared/` and **replaces none of its own baseline files.** A wholesale replacement of the four
divergent files is therefore **out of scope and would be a regression** (the fork's `dom-shim.ts` and
`types.ts` are strictly larger than the foundation's at the pinned commit).

**The adoption pin — MEASURED.** The foundation tree is clean at **`main` = `8f193a8d1446ed1e64c4ab6c569941e988f82459`**.
Per-module md5 at that commit (the adoption's provenance basis, to be recorded as the pin):

| Module | md5 | Module | md5 |
| --- | --- | --- | --- |
| `census.ts` | `550d9d6fb1285e23062b3cd9e3691179` | `overlay.ts` | `931339d71ac0220e400190296d408ee5` |
| `container.ts` | `33071ff8a2453edb4febe52e9cba38a2` | `owned-list-host.ts` | `d576f0017747d4fa6dacab3e9fb27ccb` |
| `focus-model.ts` | `8ae4a59ca853c3dad14e1e07cc73477a` | `relocate.ts` | `83707f14ec249fa46fec45825d6b9be9` |
| `gesture-session.ts` | `50eb2dcc3e9e29427f7ae38716ddae90` | `slot-host.ts` | `bb53cdedad4f8f4359f603fe7e4ea86d` |
| `gutter-affordance.ts` | `90dae03fc92eb2c65e43f79843c3f0ef` | `theme.ts` | `c4b4d4c4127158d14bc035e58d857597` |
| `gutter.ts` | `7cb67bfef8e4b3750994e3b33846055f` | `zones.ts` | `91fb829d2a2be580538c7719b3f4bef0` |
| `layout-projection.ts` | `a507ea116d304e5f32241c63d2182196` | | |
| `menu-template.ts` | `98952f69f7c39bbabca0458a69258b4b` | | |
| `mount-invariant-guard.ts` | `a8ca65a5cd46ad7500d467d6355aaeb3` | | |

**Q-A (architect) — the ONE open question the consumption model leaves.** The vendoring pin is a
*reading*, not a mechanism: nothing in the fork will detect that the foundation's bytes moved. The
options are **(A1) pin-only** — record the commit + md5s in `docs/decisions.md` and in the units'
provenance cells, with no automatic check; **(A2) pin + a drift test** — a `tests/**` row that hashes the
vendored modules against the recorded md5s (an **in-repo** check that cannot see upstream movement, so it
detects local edits, not drift); **(A3) pin + a live cross-tree check** — a check that reads
`../Provident-Electron/src/shared/*.ts` when that folder is present and reports a difference, skipped
when it is absent (this is the foundation's own `U-ENGINE-DRIFT` shape applied in reverse). **This
proposal's recommendation is `A3`-as-a-monitor with `A1`'s record mandatory**, but the choice is the
architect's and it gates nothing below §4. **It is the first item this proposal escalates.**

---

## 3. The boundary the rebuild must not cross (re-derived, not invented)

The gate record `docs/specs/astrographer-scope-realignment-review.md` §4.1 rules that the tab strip
(C14), the gutters (C7), the modal frame/scrim (C3), the theme-token application (C1 mechanic) and the
native menus (C13/C17) are **already and correctly shell chrome**, and that the fileable part is *"the
**mechanism layer underneath**"*. Its **MUST-NOT-MOVE** list is binding on this rebuild:

| Control node (class) | Row | The rebuild may NOT touch it |
| --- | --- | --- |
| pane collapse toggle | `§4` C5 | the `pane-collapse-<id>` control, its handler name and its host seam stay provident-authored and dispatchable |
| container minimize + tab list | `§4` C12 | same |
| doc-directory tree | `§4` C15 | same |
| advanced search | `§4` C18 | same |
| hover-preview | `§4` C19 | same |
| shared subtrees | `§4` C20 | same |
| markdown/HTML toggle | `§4` C8 | same |
| stage content, content repopulation | `§4` C2/C10 | *"MUST NOT narrow what `get_rendered_html`/`list_targets` see"* |
| the RAG layer, the pane registry | `§5.2` DO-NOT-FILE | **the fork keeps these** — they are app behavior, not shell chrome |

**The project-wide UI constraint also still binds** (`AGENTS.md`): any UI element that is not the
Electron shell's own chrome (window frame, native menu bar, preload bridge, MCP server) must be authored
as provident-ssr data and driven through the producing graph. Adoption of a *mechanism* is therefore
permitted; moving a *control node* out of the graph is a review finding.

**And the hybrid rule binds every adopted unit:** *"the **model is always Provident/serialized; only the
mechanic is external** — external code commits one managed write (hook / state-slice / structural op) at
gesture end, never a per-frame stream"* (`docs/specs/ui-overhaul.md` §2.1 Table B).

---

## 4. The unit set (AMENDED 2026-09-27 — REWRITTEN ONTO THE THREE INVENTORIES AND THE GATE-1 FINDINGS)

**This section was rewritten after gate-1 steps 1 and 2 returned** (`VALID-WITH-AMENDMENTS` ∥
`NEEDS-REWORK`). The first version was authored from the trees alone and **three of its twelve
classifications were falsified** by the inventories and by both reviewers independently. **The
re-classifications below are the corrected rows, and every one names the finding that forced it.** The
gate record is §8.

**Granularity, stated so the gate reviews the right thing.** §4 carries **the unit set, each row's
corrected classification, its seam obligation and its gating**. The exhaustive per-file consumer maps
and per-file test dispositions live in the inventory artifacts (§4.4 summarises the cost) and are **each
unit's own spec-gate obligation**.

**Classification vocabulary:** `DELETE-WHOLE-FILE` · `DELETE-SUBSET-KEEP-ADAPTER` · `SUBSET+ADAPTER` ·
`NEW-BUILD-AND-ADAPT` · `BEHAVIOUR-PRESERVING-REPLACEMENT` · `PARTIALLY-SHARED-KEEP` · `NOT-IN-SCOPE` ·
`BLOCKED-ON-SEMANTICS` · `BLOCKED-ON-ENGINE`.

### 4.1 The relocated-UI rows, RE-CLASSIFIED

**Read the whole table before trusting any single row: NOT ONE ROW IS A WHOLE-FILE DELETION, and two
rows have NOTHING TO DELETE.** The foundation deliberately omits a half the fork owns in **every**
element it ships (`docs/specs/post-division-foundation-adoption-surface.md`: *"no element is
delete-wholesale at unit granularity"*).

| Row | Foundation element (module → symbol) | Fork artifact | **Corrected classification + the finding that forced it** |
| --- | --- | --- | --- |
| **PD-UI-1** | `theme.ts` → `resolveTheme`, `applyThemeDeclaration` | `src/renderer/theme.ts` (`resolveTheme`, `applyThemeToRoot`, `ResolvedTheme`, `ThemeRoot`) | **`SUBSET+ADAPTER` — THE RESOLVER IS KEPT.** `C-1`/`V-1`: the foundation's `resolveTheme(setting, env)` returns `{setting, prefersDark, source}` and **decides nothing about appearance**; the fork's returns `'light' | 'dark'` and IS the tri-state precedence rule (explicit setting wins, else OS). **Deleting it would delete the app's theme behaviour while every pure-layer test stayed green.** The unit adopts the **declaration + env reading** and keeps the precedence resolver; its token CSS (~15 token names) is app vocabulary and stays (`FORK-DIVERGENCE.md` §3 rule 2) |
| **PD-UI-2** | `zones.ts` → `isEmpty`/`trackFor` · `census.ts` → `computeTrackVars` · `layout-projection.ts` | `src/renderer/layout-state.ts` (`layoutCssVars`, `zoneTrackCssVars`, `applyLayoutToRoot`); `SidebarPanes.applyZoneTracks` | **`SUBSET+ADAPTER` — and the projections are FROZEN in shape.** `C-13`: `tests/unit-live11-bridge-seams.test.ts` is **PROTECTED** and imports `defaultLayout`/`coerceLayout`, so the adoption **cannot be a whole-file replacement**. `C-11`: the deleted half writes CSS (`setProperty('0px')` **and** `removeProperty`) → **needs the G-4 scope ruling** before it is deletable |
| **PD-UI-3** | `container.ts` → `tokensFor`, `orientationFor`, `containerDeclarationFor` | **NOTHING** | **`NOT-IN-SCOPE` as a deletion / `NEW-BUILD` if adopted — `V-2`/`C-2`: there is no `contain:` anywhere in `src/**`** (re-verified at this pass: zero matches). The fork has **no container module to delete**; `docs/specs/post-division-foundation-adoption-surface.md` independently classifies `U-CONTAINER` `CONFIG-ONLY`. **The first version of this row claimed a deletion that does not exist** |
| **PD-UI-4** | `gesture-session.ts` · `gutter.ts` → `createResizeController`/`clampToBounds` · `relocate.ts` → `createRelocateSession`/`withinProximity` | `installShellPointers` + the gesture machine (`src/renderer/renderer.ts`); `createDragController` (`src/renderer/pane-drag.ts`); `createGutterController` (`src/renderer/pane-gutter.ts`) | **SPLIT, NOT ONE ROW — `C-3`: `pane-gutter.ts` is a PURE module (no DOM, no Electron, no capture)**; the capture and the delegated wiring live in `renderer.ts`, and the foundation's `ResizeController` exposes a **different lifecycle** (`attach`/`detach`/`reset`/`stats` + hooks) than the fork's `start`/`move`/`end`/`cancel`/`reset`/`active`/`preview`. **The wiring is REWRITTEN, not re-pointed**: `gsession.md` §2.2 P-7 rejects document-delegated `pointerdown` · per-event `closest(selectors)` · capture at `pointerdown` — **all three of which this repo does** — and **`C-10` corrects the criterion: capture is permitted AFTER establishment, per-control opt-in** (`H-r9`), so *"no capture at all"* is not the rule |
| **PD-UI-5** | `gutter-affordance.ts` → `createGutterAffordance` (11 seams) | **NOTHING** | **`NEW-BUILD-AND-ADAPT` — `C-2`/`V`-series: the fork has NO gutter-affordance module** (`grep` for `gutter-affordance`/`createGutterAffordance` → zero hits; re-verified at this pass). What exists is **inline authored markup** (`index.html`) whose replacement is a **provident-authored affordance** — and the project-wide UI constraint means it must be authored as envelope data. **The largest real build-estimate risk in the set** |
| **PD-UI-6** | `overlay.ts` → `overlayTransition`, `overlayInertDeclaration` | `createModalController` (`src/renderer/modal-state.ts`) | **`SUBSET+ADAPTER`** — the foundation is 62 lines of pure transition + declaration with no write of any kind; the fork keeps the DOM wiring, the scrim, Escape, and the **RE-PARENT half, which the foundation REFUSES** (`docs/specs/post-division-foundation-adoption-surface.md` §2.3). **Also: `C`-finding on `overlay.md`'s `removal === (value !== true)` — the set arm returns the string `'true'`, so the equation is unsatisfiable as written; that is a FOUNDATION spec defect to hand off, never to absorb** |
| **PD-UI-7** | `focus-model.ts` → `focusTransition`, `focusOrder`, `focusIndex`, `persist` | `focusTarget`, `targetEquals` (`src/renderer/tab-state.ts`) | **`BLOCKED-ON-SEMANTICS` — `C-4`: the model ACTIVATES AN EXISTING MATCHING TARGET AND APPENDS NOTHING, and `FocusState` carries NO `order` and NO duplicate policy**; the fork's `focusTarget(state, target, {newTab:true})` **must append a duplicate** and `TabState.order` is a permutation carrier, with `newTab` live on the wire. **Adoption without a ruling deletes the fork's open policy.** The model supplies refusals + identity only |
| **PD-UI-8** | `U-FOCUS-TOOL` (`provident.focus`) | **the fork's OWN `provident.focus`** (`ALL_TOOLS`, its registration, its handler, the renderer's `case 'focus'`) | **`BLOCKED-ON-SEMANTICS` — `C-8`/`V-4`/inventory risk 1: A NAME COLLISION WITH INCOMPATIBLE CONTRACTS.** The fork's tool takes `{target?: <5-kind object union>, tabId?, newTab?}`; the foundation's takes `{target?: string, newTab?: boolean}` and **REFUSES any own key outside that set** — so adoption **drops `tabId` and re-shapes `target` object→string across a pinned live surface** (`tests/unit-u-shell-9a-main-focus-tabs.test.ts`, live-drive `user1_tab_new`). **A decision, not a deletion; needs an adoption dossier + a same-commit amendment to this repo's `docs/specs/mcp-endpoint.md` §3** (which carries **no focus row at all** — recorded drift) |
| **PD-UI-9** | `menu-template.ts` → `normalizeCatalog`, `buildMenuTemplate`, `selectCatalogItem` | `buildMenuTemplate`, `normalizePaneCatalog`, `orderPaneCatalog` (`src/main/app-menu.ts`) | **`SUBSET+ADAPTER` + a NAME COLLISION (`C-9`): `buildMenuTemplate` collides BY NAME with the fork's**, and the import semantics stay fork-side (`menulib.md` §2.1). `app-menu.ts` is one of the fork's smallest mechanism modules (136 lines) |
| **PD-UI-10** | `mount-invariant-guard.ts` → `probeMountInvariant`/`assertMountInvariant` **+ the HOST fix `reconcileMount` ported from the foundation's own `src/renderer/runtime.ts`** | `tearDownGraph`'s `#wiki-root` sweep (`src/renderer/runtime.ts`) | **`BEHAVIOUR-PRESERVING-REPLACEMENT` — `C-7`/`V-3`: the shipped guard is a PURE READER ("creates nothing, writes nothing") and REFUSES a real-DOM mount**; it **cannot** replace a sweep that REMOVES a stale root. The removal half is the foundation's **`reconcileMount`**, which is **not one of the fifteen vendored modules**. Defect `STALE-MOUNT-PUSHES-CANVAS` is FIXED + LIVE-CONFIRMED and **would regress at the ASSEMBLED layer only — the node suite is blind to it**. The sweep stays until the port lands, and the row owes a rendered/APP-layer row |
| **PD-UI-11** | `owned-list-host.ts` | `src/renderer/tab-strip.ts` (`TabStrip`, its context/options types, `notifyTabClosed`, `drainClosedTabIds`) | **`NOT-IN-SCOPE (KEEP)` — `C-5`: the local inventory mints this row `PD-FOCUS-2` **NOT-IN-SCOPE (KEEP)** for the class, and the foundation's host requires `mount` + `orderOf`/`itemFactory`/`onActivate`/`onClose` seams the fork does not have.** The first version of this row deferred the boundary to a spec gate — **a spec gate may not re-open a KEEP row without the architect** |
| **PD-UI-12** | `slot-host.ts` | the pane/slot hosting inside `src/renderer/sidebar-panes.ts` (4059 lines) | **OUT OF THE RELOCATED-UI SET AS SCOPED — `C-6`: this is the KEYSTONE, not a boundary question.** `sidebar-panes.ts` imports **eight or more** of the named mechanism-bearing modules, and the foundation's `createSlotHost` requires an injectable `container`/`containerFactory` policy **the fork has never had**. It needs **its own boundary spec BEFORE any sibling row**, or an explicit deferral recorded by the architect |

**Two rows that are NOT deletions, recorded rather than silently dropped:**

- **`U-THEME-CONTROL` — `NOT-IN-SCOPE`, but `C-15` corrected the REASON.** The first version claimed *"this
  repo already authors an operator theme control"* — **that is not in the tree**: there is no theme node
  in the provident authored surface and none in `index.html`; the persisted `theme` field defaults to
  `'system'` and only `installTheme` re-resolves on the media query. **Corrected disposition:
  `ABSENT → author-in-build` as part of `PD-UI-1`'s envelope work** (or explicitly declined).
- **`U-ENGINE-PIN`'s engine half is already satisfied** — this repo pins `provident-ssr: ^0.5.1`, the same
  pin the foundation installed. The shim-completion half is a separate candidate (the fork's
  `dom-shim.ts` is larger); **`C-14` adds the boundary: keep the "do not replace" ruling for
  `dom-shim.ts`/`types.ts`, but name `demo-envelope.ts` as the AUTHORED-DATA work `PD-UI-5`/`PD-UI-1`
  owe** (the foundation's is 433 lines to the fork's 131, and the guide requires a fork to author its
  own card). A wholesale replacement of `demo-envelope.ts` remains wrong; **authoring into it is the
  work.**

### 4.2 The seam gap — what the fork must SUPPLY, measured per row

The foundation's mechanisms are pure and total with caller-supplied seams; supplying nothing yields the
**declared degraded** answer (`../Provident-Electron/docs/guide/seams.md`). **A deletion that supplies no
seam is a silent behavior loss (G-7).** Measured at gate-1 step 2:

| Row | Seams the fork must supply | Present in the fork today? | **What adoption yields if it is not supplied** |
| --- | --- | --- | --- |
| PD-UI-1 | none (the `env` reading is an argument record) | yes (`matchMedia` + the `dataset.theme` write) | precedence **LOST** unless the resolver stays — this is why the row is `SUBSET+ADAPTER` |
| PD-UI-2 | census + `VarSpec` + the write sink | partly (`zoneTrackCssVars` + `applyZoneTracks`) | malformed/absent census ⇒ `''`/empty token; **UNVERIFIED whether `applyVarsToRoot` reproduces `applyZoneTracks`'s `removeProperty` arm** |
| PD-UI-3 | `tokenFn`, `axisResolver` (both REQUIRED) | **no** | the declared empty answer `undefined`, zero invocations |
| PD-UI-4 | `session`, `candidatesFor`, `resolveTarget`, `onReveal`, `commit`, `threshold`, `onPreview`, `preDragValueOf` + gutter's seven | partly (`dropZoneForPoint`, `legalZonesForScope`, `onRevealChange`; **no `commit` sink, no `threshold` value, no candidates answer**) | empty candidates ⇒ **the invalid arm AT ONCE, not a cancel**; `undefined` target ⇒ a committing terminal **writes nothing**; an unusable `threshold` ⇒ **nothing is ever within proximity**; a non-callable sink reads `sinkCalls` **0** |
| PD-UI-5 | nine REQUIRED + two OPTIONAL of eleven | **no** | `NaN` clamp ⇒ invalid move; refused cursor write; falsy `resizableOf` ⇒ **zero commits and zero previews** |
| PD-UI-6 | `callback` (OPTIONAL, not a seam) | yes (Escape/scrim) | no loss |
| PD-UI-7 | `refuse`, `onChange`, `persist` | no observers today | observation only — **no behaviour loss, but the fork loses its own duplicate/order policy** |
| PD-UI-8 | `McpBackend.invoke` (REQUIRED) + the renderer's `'focus'` answer | partly (the invoke exists; **the answer shape does not match**) | a member read as `undefined`, and `refused: {reason: undefined}` — the exact shape the contract forbids |
| PD-UI-9 | `picker` (OPTIONAL) + the `platform` VALUE | no picker closure today | the picker item is emitted **disabled on darwin**; `selectCatalogItem` ⇒ `null` |
| PD-UI-10 | none (an instrument); the HOST FIX is the deliverable | **no equivalent** | the sweep removed without the port ⇒ **`STALE-MOUNT-PUSHES-CANVAS` regresses, APP layer only** |
| PD-UI-11/12 | `mount` + `orderOf`/`itemFactory`/`onActivate`/`onClose`; `containerFactory` | **no** | typed refusals; **nothing ordered or placed** |

### 4.3 The engine-delegation half — `BLOCKED-ON-ENGINE`, with a bounded additive set that is NOT

**The inventory landed** (`docs/specs/post-division-engine-offload-inventory.md`, 19 candidate ids over
31 modules) and it **confirms the proposal's gating instinct and corrects its scale**:

- **`DELETE-WHOLE-FILE` 0 · `DELETE-SUBSET-KEEP-ADAPTER` 0** — *"the engine owns the DATA and the
  MUTATIONS, never the fork's DERIVATION or RENDERING."* `buildTraversal` **stays in-process by a
  standing ruling** (`docs/specs/design-extensions-review.md` §14.2: *"the ruling moves where the data
  comes FROM, never where the traversal runs"*).
- **7 of 19 ids / 15 of 31 modules are `BLOCKED-ON-ENGINE`** — gated by the P2 chain, whose
  **unsatisfied conjunct is the engine's ingest/record-copy route (GR-6a, PARKED, trigger
  UNDISCHARGED and unfireable from the fork)**. **So the engine-offload rebuild CANNOT proceed
  independently of the authority-switch chain; only the additive set below can start now.**
- **The additive set (eliminates nothing, and is therefore not part of this gate):** adopt `durability`
  into the client HealthReport · adopt `resultVersion`/`commitToken` · build the AUTH token hand-over
  seam · add clients for `GET /changes` + the paged reads · add clients for the four `POST /graph/…`
  routes · the two node-testable slices of `U-READS-PIVOT` and `U-AUTHORITY-SWITCH`.
- **TWO FORK-SIDE ADOPTION DEFECTS, independent of the chain and owed as tracker rows:**
  `resultVersion`/`commitToken` **appear nowhere in `src/` or `tests/`**, and `decodeCrudResponse`
  never checks `resultVersion` — so the engine's versioned mutating payload is accepted as unversioned
  and **its commit token is discarded**; likewise `decodeHealthReport` drops the engine's new
  `durability` axis.
- **A TRACKER CORRECTION THIS PROPOSAL MUST CARRY, because G-4 depends on it:** this repo's
  `docs/next-steps.md` §P2, `docs/HANDOFF.md`'s `O-7` row and `docs/specs/design-extensions-review.md`
  §14.1 `C-1` still read *"the engine persists NOTHING today"*, while Gnosis records `D-D1`+`D-D2`
  **LANDED-GREEN** and `GR-7`'s trigger **DISCHARGED**. **The corpus-loss framing is therefore STALE in
  its premise; the real remaining block is the ingest/record-copy route.** G-4 is restated in §5
  accordingly.

### 4.4 The test-surface cost (absent from the first version — and it is the program's largest term)

The product owner's instruction explicitly covers *"the tests that apply to those features"*. Measured:

| Reading | Figure |
| --- | --- |
| Collected suite | **201 `.test.ts`** files + **3 `.mjs`** batteries + 5 fixtures |
| **The `.mjs` batteries are OUTSIDE `vitest.config.ts`'s `include`** | so **`npm run battery` must be added to every UI unit's trio** — *"a rebuild that breaks the divergence battery is invisible to the trio"* |
| Distinct test files implicated (union across the twelve rows) | **≈ 85–95 — roughly 45 % of the collected suite** |
| Classed split (local inventory) | ARCHIVE 11 · SPLIT 8 · REWRITE 17 · KEEP ~180 · **PROTECTED 9** |
| **`ARCHIVE-READY IS EMPTY (0 of 224)`** | `docs/specs/test-pruning-disposition-2026-09-21.md` §0 — **nothing is archivable today** |
| **PROTECTED set** (pinned by path/name in `tests/unit-v5-migration-contract.test.ts`) | `unit-u2-rich-decompose` · `unit-s-paste-sanitization` · `template-adversarial` · **`unit-live11-bridge-seams`** (the critical collision — it pins `defaultLayout`/`coerceLayout`) · `unit-u5-rich-commit-ipc` · `unit-v5-bridge-capture` · `unit-wave-1-bridge-wiring` · `unit-import-batch-persist-contract` · `tests/fixtures/v5-bridge-capture-fixture.js`; and **`src/main/markdown-import.ts` is a protected `src/**` file** |
| **Fence files (a fence edit re-enters the gate)** | `tests/traversal.test.ts` · `tests/import-render-no-duplicates.test.ts` |
| Collisions by row | PD-UI-2 ↔ `unit-live11-bridge-seams` + `unit-wave-1-bridge-wiring`; PD-UI-10 ↔ `traversal.test.ts` + `unit-live11-bridge-seams`; PD-UI-4/5 ↔ `unit-wave-1-bridge-wiring` (a NEW electron-mocking file reds the census); PD-UI-7/8 ↔ `unit-u-shell-9a-main-focus-tabs`; PD-UI-9/12 ↔ `unit-import-batch-persist-contract` |
| **What the branch's suite looks like mid-program** | a growing rewrite set across the U-SHELL / page-commit / tab / props families; **one deliberately carried APP red** (`PANE-TOGGLE-STAGE-COLLAPSE`) plus the pre-existing `H-1`/`H-1b`/`H-2` reds in `unit-stage-active-tab-display-contract-holes`; and **a node suite whose green says nothing about the shell** (RCA-12: the dom-shim is layout-less and CSS-less) |

### 4.5 The ordering (absent from the first version — the rows are NOT independently executable)

**Seven of the rows share `sidebar-panes.ts` / `renderer.ts` / `pane-graph.ts` / `layout-state.ts` /
`tab-state.ts`**, the elimination rule requires consumers to change first, and a PROTECTED pin freezes the
layout module's exported names. The local inventory's wave table is adopted as the program's spine:

**W0** specs + the three adoption dossiers the collision rows MUST carry at gate 1 → **W1** `theme.ts` +
`modal-state.ts` (one `src/**` importer each) → **W2** `layout-state.ts`'s projection subset (7 importers
re-point in ONE commit; `defaultLayout`/`coerceLayout` FROZEN) → **W3** `pane-drag.ts`/`pane-gutter.ts`
controller halves → **W4** `renderer.ts` gesture machine + the affordance build → **W5**
`sidebar-panes.ts` `applyZoneTracks` + the tab-strip seam → **W6** `index.html` markup + grid CSS
(**ATOMIC with W2–W4** — a half-landing is a live regression every node gate reports green) → **W7**
`runtime.ts` mount sweep (**LAST**) → **W8** main-process (`app-menu.ts` builder; the `provident.focus`
row only after its ruling) → **W9** trackers + archive closure.

**RE-ISSUED 2026-09-28 BY THE `W0` PASS — the `W0`–`W9` table with each wave's PROVENANCE, its OWNING ROWS, and whether it is executable (`A-9`'s cross-check requirement).** **`W0`–`W9` ↔ `docs/specs/post-division-local-elimination-inventory.md` §3's table (`0`–`9`) is one-to-one**, and the splits `A-2`/`A-4`/`A-6` forced are applied below.

| Wave | Owning rows (post-amendment ids) | Executable? | What still blocks it, if anything |
| --- | --- | --- | --- |
| **W0** | none — **the pass that produced this table** | **RUN 2026-09-28** (dossier-and-decision) | — **no wave is fenced by the `SCH` withdrawal any more**; `W0`'s gate (`Q-F` / `A-9`) is discharged |
| **W1** | `PD-UI-1` (`theme.ts`) · `PD-UI-6` (`modal-state.ts`) | **YES** | each needs its own spec + reported red set + adoption dossier (`§4.1` collisions: `PD-UI-6` carries the re-parent refusal) |
| **W2** | `U-ZONES` · `U-CENSUS` · `U-PROJ` (the `A-4` split of `PD-UI-2`) | **YES** | the 7-importers-in-one-commit rule; `defaultLayout`/`coerceLayout` **FROZEN** (PROTECTED `unit-live11-bridge-seams`); the `removeProperty` question is `U-PROJ`'s own red-set obligation (`A-4`) |
| **W3** | `PD-UI-4b` (`U-GUTTER` + `pane-gutter.ts`) · `PD-UI-4c` (`U-RELOCATE` + `pane-drag.ts`) | **YES** | **depends on W4's session substrate by construction** — `A-2` split `PD-UI-4`, so `PD-UI-4a` (`U-GSESSION`) must land first or the two controllers fork the pointer lifecycle again; each row owes its own dossier/red set/live row (RCA-2/RCA-5) |
| **W4** | `PD-UI-4a` (`U-GSESSION` + the `installShellPointers` rewrite) · `PD-UI-5` (`PD-GUTTERAFF-1`, the affordance BUILD) | **YES** | the gesture wiring is **REWRITTEN, not re-pointed** (`gsession.md` §2.2 P-7; capture **after establishment, per-control opt-in** per `H-r9`); the affordance is **authored as envelope data** (project-wide UI constraint) and is the set's **largest build estimate**; the live matrix is **FULL at 8** (`G-5`) |
| **W5** | `PD-UI-2`'s host half (`PD-ZONES-3`) · `PD-FOCUS-2`'s subset + the **`S-7` closure-seam row** (`A-3`) | **YES** | `PD-UI-11` stays **`KEEP`** on the replaced reason; the seam row proceeds on the foundation's landed `U-LISTHOST` |
| **W6a** | **`PD-UI-13`** (the minted markup/declaration row) · `PD-UI-3` · `PD-ZONES-2` | **YES** | lands the **declaration/markup structure while the OLD collapse mechanism still functions** (`A-6`), so the suite stays meaningful; no slot-host dependency (`A-10`) |
| **W6b** | the cutover half of `PD-UI-13` | **YES, with a named red instrument** | **the LIVE `U-5`/`uf_layout_10` row is the red instrument, NEVER a node row** (`A-6`); it additionally requires the **mandatory pre-live `npm run divergence`** leg (`A-7`), which is **RED at this head for an environmental `/dev/shm` reason** and whose harness fix **has no spec and no red set** (§7.5 item 3) — so a `W6b` live pass must report **`PRECONDITION-FAILED` with that reading attached**, never park silently (RCA-11) |
| **W7** | `PD-REGION-2` (`PD-UI-10`) | **YES — and LAST by ruling** | the port is the foundation's **`reconcileMount`**, which is **NOT one of the fifteen vendored modules** (`C-7`); the sweep must not be removed before that port lands or `STALE-MOUNT-PUSHES-CANVAS` regresses at the **APP layer only** |
| **W8** | `PD-UI-9` (`PD-MENU-1`) · `PD-UI-8`/`PD-FOCUS-3` (the `provident.focus` row) | **YES** | `PD-UI-8`'s ruling **LANDED 2026-09-27** (`DECIDED: PROVIDENT-FOCUS-ADOPTS-THE-FOUNDATION-CONTRACT`: `tabId` dropped, `target` re-typed) — so the *"only after its ruling"* clause is satisfied; it owes a same-commit amendment to `docs/specs/mcp-endpoint.md` §3 (which carries **no focus row at all**) |
| **W9** | tracker + archive closure | **YES** | owes the repointed citations, the `SUPERSEDED` rows and the archive close-out — **not** a code gate |

**WAVE STATUS, STATED PLAINLY (`A-9`): every one of `W0`–`W9` is now EXECUTABLE. `W0` has RUN. No wave is fenced by a withdrawn-or-declined `SCH` id.** The three carried conditions that are **NOT** fences but must be named by the unit they bind: **(1)** the **carried baseline red** `PANE-TOGGLE-STAGE-COLLAPSE` / `P-SM-1`, whose disposition is the **FIRST Phase-1 obligation** (`Q-C`, `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1)); **(2)** the **RED `npm run divergence` precondition** (`A-7`), owed a harness unit of its own; **(3)** the **`G-9` source-text pin set** (`A-5`, extended per `X-9`), which every wave editing a pinned file owes **by name**. **`PD-UI-3`'s wave assignment, with its reason: `W6`, the `W6a` declaration land** — because `A-1` re-admitted it as a **BUILD** whose deliverable is *"supply `tokenFn`/`axisResolver` + apply `containerDeclarationFor`'s returned text at the fork's own WRITE SITE"*, and that write site **IS the `index.html` region/declaration markup** (verified this pass: the declaration has **no write site anywhere in `src/**`** — `containerDeclarationFor`/`tokensFor`/`orientationFor` have zero callers and `contain:` occurs only inside the vendored `src/shared/container.ts`). It therefore cannot land before `W6a` defines the site, and it must not be sequenced into `W2`/`W3`, whose projections it consumes rather than replaces; `W6a` is also where the `A-6` two-phase rule keeps the old collapse mechanism working while the declaration is introduced. **`PD-UI-13`'s placement (minted in the local inventory, not here) is recorded with its evidence at `docs/specs/post-division-local-elimination-inventory.md` §2.1 `PD-UI-13`:** its subject has **no foundation counterpart** (the region-host half is DECLINED), so it cannot be a `§4.1` row without breaking that table's foundation-element → fork-artifact shape.

**No unit is delegable until its wave's predecessors are named in its own spec.**

### 4.6 The elimination mechanism itself must be reconciled with the standing ruling

**`docs/decisions.md` `DECIDED: REBUILD-ARCHIVE-POLICY` (ACTIVE) governs every future test retirement:**
a superseded test is **ARCHIVED to `archive/tests/<date>-<name>.test.ts`, never deleted**, its behaviour
**re-derived by the owning unit's gated cycle with a fresh red set**, and the **coverage hole recorded**
(before → after counts). **The first version of this proposal used the word "eliminate" without naming
that route — `V-6`.** **Ruling carried here: "eliminated" in the product owner's instruction is executed
as ARCHIVE-per-`REBUILD-ARCHIVE-POLICY` for tests and as deletion for `src/**` artifacts, and each unit
records its before → after reading.** If the architect intends otherwise, that is a new decision row and
this proposal must be amended again.


### 4.7 THE ARCHITECTURE AMENDMENT — gate-1 step 3's findings, APPLIED (2026-09-27)

**`role_architecture_review` returned `PROCEED-WITH-AMENDMENTS`** with ten findings (`A-1`..`A-10`). **This
subsection is the amendment, applied per the repo's annotate-beside convention: the §4.1 table above stands
as written and is read THROUGH this block.** Every amendment below is binding on the unit set.

| Finding | The amendment, as a ruling |
| --- | --- |
| **`A-1` [BLOCKING]** — the set is **incomplete against the instruction**: `PD-UI-3` was withdrawn on a **module-existence test the instruction does not use** (*"the added elements documented in the guides"*), and the `index.html` **region/container half has no owning row** | **`PD-UI-3` IS RE-ADMITTED as a `BUILD` row** (`U-CONTAINER`: supply `tokenFn`/`axisResolver` + apply `containerDeclarationFor`'s returned text at the fork's own write site). The **markup/region declaration gets its own row**, owned by the `PD-UI-12` deferral ruling (`A-10`) — not left split between `PD-UI-5`'s affordance build and W6 |
| **`A-2` [BLOCKING]** — **`PD-UI-4` is FOUR foundation units in one row**, and **`U-GSESSION` is named by no row** (the substrate every gesture row composes) | **`PD-UI-4` SPLITS into `PD-UI-4a`** (`U-GSESSION` + the `installShellPointers` rewrite) · **`4b`** (`U-GUTTER` + `pane-gutter.ts`) · **`4c`** (`U-RELOCATE` + `pane-drag.ts`) — each with its own dossier, red set, live row and DONE row (RCA-2/RCA-5) |
| **`A-4` [HIGH]** — **`PD-UI-2` bundles three units with three semantics tables**, one of them UNVERIFIED by the row itself | **`PD-UI-2` SPLITS into `U-ZONES` / `U-CENSUS` / `U-PROJ` rows.** The `removeProperty` question **stops being a carried UNVERIFIED and becomes `U-PROJ`'s own red-set obligation** |
| **`A-3` [HIGH]** — **`PD-UI-11` moved a boundary the inventories had set**, and its stated reason contradicts the caller-supplied-seam pattern | **`PD-UI-11` stays `KEEP`, but the REASON IS REPLACED** (the strip is shell chrome that `W2-Q12` resolved as not-dispatchable — *not* "the seams are absent", which is the seam pattern itself). **The `S-7` closure-seam row (`notifyTabClosed`/`drainClosedTabIds`, the inventory's `DELETE-SUBSET-KEEP-ADAPTER`) is MINTED** as a separate row |
| **`A-9` [MED]** — **W0 is not executable against the tracker**: `docs/pending.md` reads *"no Astrographer unit may be sequenced against them"* for `SCH-6..SCH-11`, while W2/W3/W5/W6 sequence `SCH-6`/`SCH-7`/`SCH-8`/`SCH-11` | **W0's FIRST deliverable is the withdrawal of `SCH-2`/`SCH-5`/`SCH-8`/`SCH-11` + the gate-adopt/decline decisions.** **Every wave sequencing an un-gated `SCH` id is BLOCKED until that lands.** This is `Q-F`, and it gates W0. **⟨DISCHARGED 2026-09-28 — W0 (the dossier-and-decision pass) RAN; this deliverable is COMPLETE and NO WAVE IS FENCED.⟩** **THE W0 PASS, RECORDED IN THE ROW IT BLOCKED (pass record: `archive/reviews/2026-09-28-W0-dossier-and-decision.md`).** **(i) THE WITHDRAWAL, per id, with its ground and its Astrographer-side consequence** — ground: `../Provident-Electron/docs/specs/provident-electron-shell-chrome-handoff-review.md` (`H-r1`/`H-r6` binding; `S-d11` the panes/zones ruling; `H-r9` the refile note); the fork-side record is `docs/pending.md`'s `SCH-6..SCH-11` row, now annotated `SUPERSEDED IN PART`/`RESOLVED 2026-09-28`. **`SCH-2` WITHDRAWN** (foundation-owned as **`U-GSESSION`**) — an ask withdrawn, never a unit cancelled: **`PD-UI-4a` PROCEEDS on the foundation's landed session** (the `installShellPointers` rewrite is the unit's own work), and capture is **0 before establishment, permitted after, per-control opt-in** (`H-r9`) so *"no capture at all"* is **NOT** the criterion. **`SCH-5` WITHDRAWN** (**`U-MENULIB`**) — **`PD-UI-9` PROCEEDS on the landed builder** (the name collision is its dossier's work). **`SCH-8` WITHDRAWN** (**`U-PROJ`**, the projection/applier half only; the `computeTrackVars(census, …)` half was **REFILED**) — **`PD-UI-2`'s split rows `U-ZONES`/`U-CENSUS`/`U-PROJ` PROCEED on the landed projection + applier**, the census half staying fork-side. **`SCH-11` WITHDRAWN** (**`U-LISTHOST`**) — the **`S-7` closure-seam row / `PD-FOCUS-2`'s seam PROCEEDS on the landed owned-list host**; `PD-UI-11` stays `KEEP` (`A-3`). **(ii) THE `SCH-6..SCH-11` FENCE, ADJUDICATED (the ids the withdrawal does NOT cover have a RECORDED filing decision — `docs/feature-requests/provident-electron-shell-chrome-handoff.md` §3.14's requirement — all four DECLINED BY NAME at the foundation):** **`SCH-6`** DECLINED+REFILED (`ARITHMETIC-OVER-INJECTED-VALUES + SECOND-GESTURE-AUTHORITY`) → **`PD-UI-4b` proceeds on the foundation's landed `U-GUTTER`/`U-GUTTER-UI`, never on `SCH-6`**; **`SCH-7`** DECLINED+REFILED (`APP-POLICY-STATE`) → **`PD-UI-4c` proceeds on the landed `U-RELOCATE`** (the reveal set and the drop policy stay fork-side); **`SCH-9`** DECLINED (`AUTHORS-UI-CONTENT`) → the fork's top-bar slots and status/warning text **stay fork-owned and MCP-visible**, and `U-SLOTHOST` is **host-half only** (`H-r15` forbids re-merging); **`SCH-10`** DECLINED+REFILED (`CONSUMER-VOCABULARY + CSS`) → **the `A-1` re-admitted `PD-UI-3` BUILD proceeds on the foundation's landed `U-CONTAINER`, never on `SCH-10`**. **NO WAVE IS FENCED after this pass:** the sentence *"no Astrographer unit may be sequenced against them"* is **discharged by the filing decision it demanded** (its purpose was to stop an **UN-FILED** ask being treated as filed), and the fence text is **annotated, never deleted**. **(iii) `X-7` (this pass's second deliverable) IS ALSO COMPLETE:** the stale *"the engine persists NOTHING today"* premise was corrected **at every site** — **20 occurrences of the phrase family across 4 files** (`docs/specs/design-extensions-review.md` **11** · `docs/next-steps.md` **2** · `docs/HANDOFF.md` **2** · `docs/specs/unit-authority-switch.md` **4**) **plus 11 further sites** carrying the same premise in variant wording (`docs/specs/unit-authority-switch.md` `C2` — **a GATE CONDITION** · `docs/specs/unit-corpus-migration.md` · `docs/specs/rebuild-drift-map-2026-09-21.md` · `docs/specs/gnosis-offload-proposal.md` · `docs/feature-requests/gnosis-engine-prerequisites.md` · `docs/specs/gnosis-offload-review.md` · `docs/feature-requests/gnosis-engine-feature-requests.md`), and the **corpus-loss condition was RESTATED, not deleted** (`docs/next-steps.md` §"THE SUNSET RULE + THE CORPUS-LOSS CONDITION"; `docs/specs/design-extensions-review.md` §14.1 `C-1`), every one of them labelled **ENGINE-green, never app-green here, and UNVERIFIED LIVE from this repo**. The **two fork-side engine adoption defects are now tracker rows** (`docs/defects.md` `FORK-ENGINE-CRUD-VERSION-TOKEN-DISCARDED`, `FORK-ENGINE-HEALTH-DURABILITY-AXIS-DROPPED`). **(iv) `X-4` IS DISCHARGED: `PD-UI-13` (the markup/declaration row) is MINTED** — in `docs/specs/post-division-local-elimination-inventory.md` §2.1, with its placement rationale recorded there (its subject has **no foundation counterpart**, so it cannot be a `§4.1` row whose shape is foundation-element → fork-artifact → classification), and it carries the **`A-10` constraint** (the region boxes stay fork-authored markup; no region host, no mirror-class taxonomy inside `U-SLOTHOST`). **`PD-UI-3` IS ASSIGNED TO `W6` (the `W6a` declaration land), alongside `PD-UI-13` and `PD-ZONES-2`** — recorded in **§4.5** below with its reason. |
| **`A-6` [MED]** — **W6's "ATOMIC with W2–W4" is not achievable as a unit commit** and contradicts RCA-2/RCA-5; it would force four units into one commit | **W6 REPLACES with a two-phase land:** **W6a** lands the markup/declaration structure **while the old collapse mechanism still functions** (the suite stays meaningful) → **W6b** is the **single cutover commit** whose **red instrument is the LIVE `U-5` / `uf_layout_10` row, never a node row** |
| **`A-5` [HIGH]** — the **per-unit SOURCE-TEXT pins are absent from §4.4**, and W4/W5/W6/W7 edit exactly the files they pin | **A new constraint `G-9` (below) names the pin set** (`tests/unit-o-0-hook-contract.test.ts`'s `.record('traversal.build'|'envelope.assemble'|'shared.decorate'|'reconcile.roots'|'reconcile.apply')` wrappers over `renderer.ts`/`sidebar-panes.ts`/`pane-graph.ts`/`content-reconcile.ts`/`runtime.ts`, plus the text pins in `unit-u-shell-7-settings-modal`, `unit-u-shell-9a-main-focus-tabs`, `unit-u-shell-shell-wiring`, `unit-h8-operator-editor`, the two `blind-unit-ujr1-*` rows and the two `blind-unit-ud7-*` rows). **Each wave that edits a pinned file owes that pin's re-derivation explicitly** — these rows will go RED for reasons unrelated to behaviour, and that is why they are pre-identified |
| **`A-7` [MED]** — the verification architecture **inherits a mandate (RCA-11) with no runnable gate**, and misses the divergence precondition | **Three additions, all scheduling-or-script, no new mechanism:** (1) **`npm run divergence` becomes a MANDATORY PRE-LIVE leg** (the foundation's own live battery took `PRECONDITION-FAILED` on exactly this); (2) **a runnable live entry point is named** (`npm run build && node scripts/live-drive.mjs …`) so a DONE row cites a **RUN, not an intention**; (3) **the two `.mjs` batteries that are collected by NOTHING** (`adapter-parity-battery.test.mjs`, `mcp-stdio-e2e.test.mjs` — `package.json`'s `battery` runs only `e2e-battery.test.mjs`) **get a named runner**, or they stay invisible |
| **`A-8` [MED]** — the pin's enforcement **cannot see what it exists to detect**, and the strongest available instrument is unused | **The model is kept; the pin becomes MECHANICAL:** a machine-readable manifest (**`vendor/foundation.lock.json`**: foundation commit + per-module md5) that the `A2` hash row reads — **never prose md5s in `docs/decisions.md`, which would be a second hand-maintained truth** — **AND the foundation's OWN node suites for the same fifteen modules are vendored as an ADDITIVE CONFORMANCE LEG** (`theme.test.ts`, `zones.test.ts`, `container.test.ts`, `overlay.test.ts`, `menu-template.test.ts`, `gutter.test.ts`, `relocate.test.ts`, `census.test.ts`, `focus-model.test.ts`, `gutter-ui.test.ts`, `gesture-session.test.ts`, `slot-host.test.ts`, `owned-list-host.test.ts`, `mount-invariant-guard.test.ts`, `layout-projection.test.ts` — their `../src/shared/<x>.js` specifiers resolve unmodified at `tests/`). **They prove the fork's copy IS the pinned contract, not the fork's reading of it. Two conditions: they enter as an ADDITIVE leg, never as a unit's red set (`REBUILD-ARCHIVE-POLICY` clause 2), and NO vendored suite that mocks `'electron'` may be added** (the protected mock census pins the exact name-set) |
| **`A-10` [LOW]** — **`PD-UI-12`'s deferral is silent about the two things it owns**, so it blocks W6 by implication | **The deferral is recorded as an explicit ruling: the region boxes STAY fork-authored markup (`SCH-1` declined by the foundation), and therefore W6's declaration half has NO slot-host dependency.** `PD-UI-12` may be deferred without blocking the waves |

**THE PROCESS RESHAPE (`A`-series, the architect's ruling — this is the shape the units land in):**

- **PHASE 0 — ONE SPIKE UNIT, before any sibling: `PD-UI-9` (`U-MENULIB` / `src/main/app-menu.ts`).**
  Chosen because it is the *smallest complete instance of the pattern*: **1 `src/**` importer, no renderer,
  no live battery, no protected pin beyond a name census.** It exercises **every mechanism the rest
  depends on** — vendor the module, write the adoption dossier with its **collision block**
  (`buildMenuTemplate` collides by name), re-point the consumer, archive-per-`REBUILD-ARCHIVE-POLICY`,
  record the coverage delta, run the trio + the battery + the conformance leg. **Its DONE row is the
  program's TEMPLATE, and its findings amend §4.1/§4.2/§4.5 BEFORE any renderer wave is delegated.**
- **PHASE 1 — the renderer mechanism chain, ONE unit per row**, in the `W1 → W7` order with the splits above
  applied, each with its own red set, its own LIVE row and its own DONE row. **`PD-UI-12`'s boundary ruling
  is taken at the HEAD of Phase 1** (`A-10`), not inside it.
- **PHASE 2 — the engine ADDITIVE SET ONLY** (six items, none of which eliminates anything), sequenced by
  the P2 chain. **The engine elimination half stays `BLOCKED-ON-ENGINE` and is NOT in this gate's wave
  table.**

**THE RISK RANKING (the architect's, binding on verification burden):** **1 `PD-UI-10`** (mount sweep —
a wrong landing is invisible to node) · **2 `PD-UI-2`'s track/census write** (`U-PROJ`/`U-CENSUS` — the
collapse works *because* JS and CSS agree) · **3 the split gesture rows** (`PD-UI-4a/4b/4c` — capture,
threshold and revert are not node-assertable; `N3 PANE-DRAG-TOP-ONLY` is **OPEN** and an adoption does
**not** fix it). **Each carries the falsifier the architect named:** `U-4` + `uf_mount_diag`/`uf_mount_leak_diag`
(`#wiki-root` count exactly 1, no stale childless root, `scrollHeight` unchanged across the transition) ·
`U-5` (`gridTemplateColumns` reads `0px` for the empty zone on BOTH sides of the swap, `zone:main` reclaims
the width) · `user2_pane_drag` + `user7_zone_resize` + `U-1`/`U-3` (a body click never starts a gesture, a
header drag commits exactly once at terminal).

**A NEW CONSTRAINT (`A-5`) — `G-9`, the SOURCE-TEXT PIN SET:** the O-0 hook-contract pins
(`tests/unit-o-0-hook-contract.test.ts`) and the five further source-text pin sets **must be re-derived by
name in every wave that edits their targets** (`W4`/`W5`/`W6`/`W7`). A wave that reds them silently, or
"fixes" them by relaxing a pin, is a review finding.


## 5. The gating constraints the proposal must carry (AMENDED — G-3/G-4/G-5/G-6 CORRECTED AT GATE 1)

| # | Constraint | Citation | Effect on this rebuild |
| --- | --- | --- | --- |
| **G-1** | **The branch starts one-red.** `npm test` = 1 failed file / 200 passed (201 files), 1 failed / 4190 passed / 45 skipped / 4236; `typecheck` exit 0; `build` exit 0 — **measured by this pass at `b6791e0`**. The single red is the recorded APP-layer residual `P-SM-1` (`strat:stage-seam-schedule-single-active`) whose counterexamples are defect `PANE-TOGGLE-STAGE-COLLAPSE` | `docs/next-steps.md` (`U-STAGE-ACTIVE-TAB` row); `docs/defects.md` `PANE-TOGGLE-STAGE-COLLAPSE` | no unit may claim a clean trio until that row is dispositioned; every unit's DONE row states its own delta against this baseline |
| **G-2** | **The C9 `U-EDIT-1` unit is MID-CYCLE at `HEAD`** — spec landed, adapter `src/main/page-diff.ts` owed, the one-`applyBatch` commit owed, the live battery owed, three `SUPERSEDED` rows owed | `docs/next-steps.md` (`C9 U-EDIT-1` row, items (a)–(e)) | the rebuild inherits those open residuals; it must not silently re-scope them, and it must not delete `src/main/page-diff.ts`'s territory before that unit closes |
| **G-3** | **The engine authority switch is a PREREQUISITE CHAIN, not a tail**: `U-ENGINE-PERSIST` → `U-AUTHORITY-SWITCH` → `U-CORPUS-MIGRATION` → `U-READS-PIVOT`. **The landed inventory SHARPENS it: 7 of 19 engine candidates / 15 of 31 modules are `BLOCKED-ON-ENGINE`, and the unsatisfied conjunct is the engine's INGEST/RECORD-COPY route (`GR-6a`, PARKED, trigger UNDISCHARGED and unfireable from the fork) — not persistence** | `docs/next-steps.md` §P2; `docs/specs/post-division-engine-offload-inventory.md` §5; `docs/specs/design-extensions-review.md` §13.1/§13.2 S4 | every engine-**elimination** is gated; the **six-item additive adoption set (§4.3) is NOT gated and is not part of this gate** |
| **G-4** | **THE CORPUS-LOSS CONDITION — RESTATED, because its PREMISE IS STALE.** The first version said *"the engine persists nothing today"*, quoting `docs/next-steps.md` §P2, `docs/HANDOFF.md` `O-7` and `docs/specs/design-extensions-review.md` §14.1 `C-1`. **Gnosis records `D-D1`+`D-D2` LANDED-GREEN and `GR-7`'s trigger DISCHARGED** (`docs/specs/post-division-engine-offload-inventory.md` §2/§5) — **so those three fork tracker sites are STALE and owed a correction** | `docs/specs/post-division-engine-offload-inventory.md` §5; `../Gnosis/docs/pending.md` `GR-7`; the three stale fork sites | **the constraint stands as a carried caution but is SCOPED, not dropped: it forbids removing a LOCAL WRITE path for ENGINE-OWNED DATA (the corpus, 226 documents / 6 102 nodes / 9 266 edges) while the ingest route is parked — and it does NOT forbid the `PD-UI-2` CSS-write replacement.** `C-11` asked for exactly this scoping ruling and this is it; no fork unit may remove a local corpus write on the strength of a stale premise |
| **G-5** | **The `§5.U` delta matrix is FULL at 8** — live assertions enter as re-pins or extended rows, never new slots; `MATRIX_ROWS` must not change (`U-1`..`U-8`, verified at this pass) | `docs/specs/live-battery-2026-09-22-page-commit-and-stage.md` §2; `scripts/live-drive.mjs` `MATRIX_ROWS` | **corrected by `C-12`: the re-pin is NAMED per row — `U-3` (`uf_panes_12`, the pane-HEADER gesture surface), `U-5` (`uf_layout_10`, the empty-track collapse) and `U-1`/`U-2`/`U-6` are precisely the rows PD-UI-4/5/2/6 rewrite — and every UI unit's trio gains `npm run battery`**, because the three `.mjs` batteries sit OUTSIDE `vitest.config.ts`'s `include` (§4.4) |
| **G-6** | **The foundation's greens are ENVELOPE-green, not app-green** (RCA-12). **Restated per unit, per `V-8`: true per unit, FALSE as a blanket** — `U-GUTTER-UI` ran its mandatory live battery (leg 5 `PRECONDITION-FAILED` first, re-measured green in an addendum; findings `L-1`/`L-2` plus operator-owed rows), `U-THEME-CONTROL` took `[U]`, and `docs/specs/gutter-ui-live-battery.md` is **OPEN / LIVE-PENDING with the `npm run divergence` precondition RED** | `../Provident-Electron/docs/FORKER.md` §4 (row by row); `docs/specs/post-division-foundation-adoption-surface.md` §2.2/§2.8/§9 | each adopting unit states **which layer of foundation evidence it inherits — and that it owns its own rendered/live evidence. No fork unit may cite a foundation green as app evidence** |
| **G-7** | **The foundation's mechanism modules are pure and total, with caller-supplied seams and declared degradations** — a fork that supplies nothing gets the *declared empty/degraded* answer, never an invented default | `../Provident-Electron/docs/guide/seams.md` (the REQUIRED/OPTIONAL table); per-unit spec §2.4 | **§4.2 MEASURES this per row.** A deletion that supplies no seam is a silent behavior loss — **several rows adopted as the first version proposed would have produced ZERO commits, an immediate invalid arm, or a disabled picker** |
| **G-8** | **A FOUNDATION spec defect is HANDED OFF, never absorbed and never patched** — `overlay.md`'s `removal === (value !== true)` is unsatisfiable as written (the set arm returns the string `'true'`); `gutter.md` §2.1 declares an `SizeFor` export the module lacks; the foundation's `mcp-endpoint.md` §3.8 still declares `provident.focus` absent while its code ships it; `zones.ts` checks a callable `get` before its array/`Set` exclusion against its own spec; `menu-template-greens.md`'s POST-GREEN re-drive is owed | `docs/specs/post-division-foundation-adoption-surface.md` §7 (`G-1`..`G-12`) | **recorded as handoff items** (`docs/defects.md` → `docs/HANDOFF.md`, `AGENTS.md` item 7); **a defective foundation clause is never a licence for a silent fork-side divergence** |


---

## 6. The governance this rebuild will follow (no new process invented)

1. **One unit = one full cycle.** Per the gate topology and RCA-2/RCA-5, **nothing is implemented
   inline and no two units share a cycle**: gate 1 (validity ∥ critique → architecture → change
   analysis) → spec → TestWriter red (reported) → implementer green → adversarial (read-only) + the
   read-only PBT audit → blind greens → live scenario (mandatory for UI units) → proofreader → doc
   review → trio → trackers.
2. **Adoption semantics (STEP 0).** Every unit whose contract names, parameters or vocabulary originate
   **outside this project** — which is **every unit in §4.2 by construction**, and any §4.1/§4.3 unit
   that carries an adopted name — MUST carry an adoption dossier
   (`docs/specs/<unit>-adoption-dossier.md`, ≤ 8 identifier rows, each with its source citation and
   STATUS). The gate-1 verdict vocabulary is closed: `PROCEED` | `APPROVE-WITH-CONDITIONS` |
   `BLOCKED-ON-SEMANTICS` | `FLAWED` | `REJECTED`; a unit with any undefined row is
   `BLOCKED-ON-SEMANTICS` and is escalated **in that pass**.
   **This is not ceremony — the foundation has already run this exact failure once.** Its
   `docs/specs/rca-cross-project-handoff-semantics.md` records the `threshold` incident: an adopted
   identifier crossed the boundary **as a name with no meaning**, was simultaneously a *legitimate
   injected value* on one side and a **banned vocabulary token** on the other, and cost a full gate pass.
   `../Provident-Electron/docs/specs/gutter.md` §2.2 P-5 / §3.4 R-1 and `gsession.md` §2.2 P-1/P-5/P-7
   list `selectors` / `threshold` / `data-zone` as **contraband** vocabulary. **The collision is
   expected, not hypothetical — and it is verified in both directions at this pass:**
   - **The ban's scope, read exactly:** `gsession.md` `R-1` scans **the module's own file** (comments
     included) and states the scope explicitly; the consumer's code is not what that row scans. **But
     `gsession.md` §2.2 P-7 / row 4 lists the REJECTED SHAPES as consumer-side too** — *"no
     document-delegated `pointerdown` · no per-event `closest(selectors)` · no capture at
     `pointerdown`"*.
   - **The three rejected SHAPES reproduce in the wiring** — `src/renderer/renderer.ts`
     `installShellPointers` delegates `pointerdown` on the document, resolves per event through
     `closest(GESTURE_SELECTOR)` and calls `setPointerCapture` at gesture start — so adopting
     `U-GSESSION` forces that wiring to be **rewritten as local per-control attachment**, not merely
     re-pointed. **`data-zone` itself occurs in `src/renderer/index.html`, `src/renderer/renderer.ts`,
     `src/renderer/pane-graph.ts`, `src/shared/dom-shim.ts`, `scripts/live-drive.mjs` and six `tests/**`
     files — `V-7` corrected the first version, which also listed `src/renderer/pane-drag.ts`: that
     module is PURE and contains ZERO `data-zone` matches (re-verified at this pass).**


   **Consequence:** every adopted unit's dossier MUST carry a populated collision block — each adopted
   identifier checked against the consuming repo's prohibition/vocabulary rows, each hit reconciled **by
   row id** (`banned by row <R-id> for reason <Y>; legitimate in this layer because <Z>`) or **re-named
   by an explicit re-name request** — **never by relaxing a prohibition**.
3. **The elimination rule.** A fork-local artifact is eliminated only when (a) its replacement is
   landed, (b) its consumers are changed first (dependency order recorded per unit), and (c) the test
   disposition is recorded. **`tests/unit-v5-migration-contract.test.ts` pins several files BY PATH —
   any file pinned there is `PROTECTED` and immovable**, and the two §14.2 fence files
   (`tests/import-render-no-duplicates.test.ts`, `tests/traversal.test.ts`) stay green unchanged unless a
   unit's own gate re-plans the fence.
4. **The engine half never removes a write while G-4 holds**, and never claims engine-green as app-green
   (G-6).

---

## 7. Gate-1 state and the amended verdict request

### 7.1 The gate-1 records so far (steps 1–3 RUN, 2026-09-27)

| Step | Verdict | Decisive finding | Disposition |
| --- | --- | --- | --- |
| **1. Validity** (`role_validity`, read-only) | **`VALID-WITH-AMENDMENTS`** | *"the division is real and the elimination is authorised, but three of the twelve §4.1 rows' capability mappings do not reproduce (`PD-UI-1`, `PD-UI-3`, `PD-UI-10`) and the elimination mechanism is not reconciled with `DECIDED: REBUILD-ARCHIVE-POLICY`"* | **all thirteen findings `V-1`..`V-13` dispositioned in this amendment** (§4.1 re-classified, §4.6 added, §1/§2/§3/§5/§6.2 corrected in place with the finding id named) |
| **2. Critique** (`role_critique`, read-only) | **`NEEDS-REWORK`** | *"§4.1 was authored without the two inventories this repo already holds … so three of its twelve classifications are falsified by the foundation's own records and one row is a behaviour regression written as a deletion"* | **all sixteen findings `C-1`..`C-16` dispositioned: `C-1`/`C-2`/`C-3`/`C-4`/`C-5`/`C-6`/`C-7`/`C-8` re-classified the rows they attacked; `C-9`..`C-16` corrected §1/§2/§4.2/§5/§6.2 and added §4.3/§4.4/§4.5** |
| **3. Architecture** (`role_architecture_review`, informed by both) | **`PROCEED-WITH-AMENDMENTS`** | *"the program is buildable, but §4.1's row set is mis-shaped and incomplete in four places, W6 is falsely atomic as written, and the verification architecture still has no runnable assembled-layer gate"* | **all ten findings `A-1`..`A-10` applied as §4.7** — the row set splits (`PD-UI-4` → `4a/4b/4c`; `PD-UI-2` → three rows), **`PD-UI-3` is RE-ADMITTED as a BUILD**, the missing rows are minted, `W6` becomes `W6a`+`W6b`, `G-9` is added, the pin becomes a **machine-readable manifest + a vendored conformance leg**, and **the program is RESHAPED into three phases with `PD-UI-9` as the Phase-0 spike** |

**Three blocking findings are corroborated INDEPENDENTLY by both steps and by the inventories** — this is
the strongest signal the gate produced, and none of them was visible to the first version:

1. **`PD-UI-1` would have deleted the app's theme precedence** while every pure-layer test stayed green.
2. **`PD-UI-3` and `PD-UI-5` have NOTHING TO DELETE** — the fork has no container module and no gutter
   affordance module; both rows were written as deletions of artifacts that do not exist.
3. **`PD-UI-10` would have regressed a LIVE-FIXED defect** (`STALE-MOUNT-PUSHES-CANVAS`) at the assembled
   layer, which the node suite cannot see.

**The two inventories landed and are now inputs** (`docs/specs/post-division-foundation-adoption-surface.md`,
501 lines; `docs/specs/post-division-local-elimination-inventory.md`, 691 lines; plus
`docs/specs/post-division-engine-offload-inventory.md`, 829 lines) — `C-16` corrected the stale
companion table, and §4 is rewritten onto them.



### 7.2 THE GATE'S OUTCOME AND WHAT IT LEAVES OPEN

**ALL FOUR STEPS HAVE RUN** (recorded in §7.1; the consolidated record is
`docs/specs/post-division-rebuild-proposal-review.md`). **The gate's verdict is `BLOCKED-ON-SEMANTICS`** —
*"the amended program is **shaped** correctly but **not delegable**"* — **with the open list attached, which
is the protocol's correct routing, not a failure: a unit with any undefined row or open ruling may not
receive a delegable verdict, and the escalation belongs to THIS pass, never to a spec filing.**

**The open list (the architect's; §7.3 carries it in full): `Q-A`** the pin's enforcement (entangled with
`A-8`, which pre-decides parts of it and assigns them to no unit) · **`Q-C`** the carried baseline red ·
**`Q-D`** `PD-UI-7` (who owns the duplicate/order policy) and `PD-UI-8` (the `provident.focus` NAME
COLLISION — adopt-and-drop `tabId` + the typed `target`, or keep-and-record-divergence) · **`Q-E`**
`PD-UI-12`'s boundary · **`Q-F`** the `SCH-2`/`SCH-5`/`SCH-8`/`SCH-11` withdrawal, which gates `W0`.
**Two structural decisions join them (`X-2`/`X-4`/`X-5`/`X-6`):** whether the **vendoring/pin unit** and the
**markup row** become **owned units**, and whether **Phase 0 stays the main-process spike or becomes the
vendoring/pin unit plus a baseline measurement**.

**No spec is written, no test is written and no code is changed on the strength of this file until the
open rulings are answered AND the product owner gives the go-ahead.**


### 7.3 The escalated questions (amended)

- **Q-A** — the vendoring pin's enforcement level (§2: `A1` pin-only / `A2` pin + an in-repo hash test /
  `A3` pin + a live cross-tree drift monitor). **`V-13` adds: the pin currently exists ONLY in this file,
  so `A1`'s record must land somewhere durable** (a `docs/decisions.md` row) in the same pass that first
  vendors a module.
- **Q-B** — the program's shape. **The engine inventory has now landed and answers half of it: the engine
  ELIMINATION half is `BLOCKED-ON-ENGINE` (7 of 19 ids, unsatisfied conjunct = the parked ingest route)
  and only a six-item ADDITIVE set is executable now.** The question is therefore narrowed: **run the
  relocated-UI program through its own gates while the engine half waits on the ingest route** (this
  proposal's recommendation) **or hold everything for one gate.**
- **Q-C** — the fate of the carried baseline red (G-1): disposition `PANE-TOGGLE-STAGE-COLLAPSE` **before**
  the rebuild begins, or carry it as the recorded baseline.
- **Q-D** — the two `BLOCKED-ON-SEMANTICS` rows escalated **in this pass, not deferred to a spec filing**:
  **`PD-UI-7`** (the foundation's focus model activates a matching target and appends nothing; the fork's
  `newTab` must append — *who owns the duplicate/order policy?*) and **`PD-UI-8`** (the `provident.focus`
  NAME COLLISION — adopt the foundation contract and drop the fork's `tabId`/typed `target`, or keep the
  fork's tool and record the divergence?). **Both are the architect's; neither may be routed to a spec
  gate.**
- **Q-E** (new, from `C-6`) — **`PD-UI-12` (the slot host, the keystone): does it get its own boundary
  spec BEFORE any sibling row, or is it explicitly deferred?** Seven rows share `sidebar-panes.ts`, so
  this ruling sequences the program.
- **Q-F** (new, from `C-10`) — **the request-withdrawal wave:** the foundation's record orders the fork to
  **withdraw** `SCH-2`/`SCH-5`/`SCH-8`/`SCH-11` (now owned upstream) and to carry the `H-r9` refile note,
  while `docs/pending.md` still carries `SCH-6..SCH-11` as `NEW — NOT GATED` (*"no Astrographer unit may
  be sequenced against them"*). **That tracker conflict is the architect's to resolve, and it gates W0.**

### 7.4 THE ARCHITECT'S RULINGS (2026-09-27) AND THE MEASURED BASELINES

**Five rulings were returned, each recorded as an ACTIVE row in `docs/decisions.md`:**

| Id | Ruling | Decision row |
| --- | --- | --- |
| **`Q-A`** | **`A3` monitor + a machine-readable manifest (`vendor/foundation.lock.json`), owned by a NEW vendoring unit** | `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` |
| **`Q-D(a)`** | **ADOPT the model's activate-matching semantics** — a repeat open focuses the existing entry and appends nothing; the fork's duplicate policy is **replaced** | `DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS` |
| **`Q-D(b)`** | **ADOPT the foundation's `provident.focus` contract** — `tabId` **dropped**, `target` **re-typed to a string**; a BREAKING caller-visible change with a same-commit `mcp-endpoint.md` §3 amendment | `DECIDED: PROVIDENT-FOCUS-ADOPTS-THE-FOUNDATION-CONTRACT` |
| **`Q-F`** | **RULE THE WITHDRAWAL NOW** — `SCH-2`/`SCH-5`/`SCH-8`/`SCH-11` withdrawn with the `H-r9` note; `W0` records it and the waves unblock | `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` clause (5) |
| **Phase 0** | **the vendoring/pin unit PLUS the baseline measurements** — not the `PD-UI-9` spike | same row, clause (6) |

**STILL OPEN (the architect's; they block Phase 1, not Phase 0):** **`Q-C`** the carried baseline red
(`PANE-TOGGLE-STAGE-COLLAPSE`) — dispose before, or carry as the recorded baseline — and **`Q-E`**
`PD-UI-12`'s boundary (the keystone; seven rows share `src/renderer/sidebar-panes.ts`), which `A-10` rules
must be taken at the HEAD of Phase 1.

### 7.5 THE BASELINE MEASUREMENTS — RUN AT THIS PASS, and they change `G-1`

**Phase 0's second deliverable was executed rather than deferred.** Both legs had gone **unmeasured by
every prior pass** (`X-6`), and one of them is now a recorded finding:

| Leg | Reading | Layer |
| --- | --- | --- |
| **`npm run battery`** | **`BATTERY RESULT: 184 checks, 0 failures` — GREEN** | harness / `[H]` (the battery host, not the assembled app) |
| **`npm run divergence`** | **`R13 RESULT: 1 checks, 2 failures` — RED, and the cause is ENVIRONMENTAL, not the app's diff:** the real-Electron leg dies at bootstrap with `Creating shared memory in /dev/shm/.org.chromium.Chromium.* failed: Permission denied (13)` → `exited with signal SIGTRAP`, and the harness reports `electron connect/drive failed: MCP error -32000: Connection closed` | harness / `[D]` — the DOM-shim host leg ran; the **real-DOM Electron leg did not** |

**Consequences, recorded rather than smoothed:**

1. **`G-1` is EXTENDED, per `X-6`:** the branch baseline now reads `npm test` (the one carried red) ·
   `typecheck` 0 · `build` 0 · **`battery` 184/0 GREEN** · **`divergence` RED on the Electron leg**.
2. **The divergence red is a PRECONDITION for every UI unit's live battery** (`A-7` makes
   `npm run divergence` mandatory pre-live). **A live battery cannot be honestly claimed green while this
   leg is red**, so either the harness's Electron spawn is fixed in this environment (`/dev/shm` is
   unavailable here; the foundation's own harness landed `--disable-dev-shm-usage` + a fresh scratch
   `--user-data-dir` for exactly this class) **or every UI unit's live pass is `PRECONDITION-FAILED` with
   this reading attached** — never silently parked (`RCA-11`).
3. **The fix belongs to its own unit** (a harness unit touching `scripts/**`): it is **not** part of this
   gate, it has no spec and no red set, and it is therefore **recorded as owed** — the exact discipline
   that keeps a red precondition from being "fixed" inside a docs pass.
