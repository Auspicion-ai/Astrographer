# FORK-DIVERGENCE — upstream Provident-Electron vs the Astrographer fork

**Date:** 2026-09-17 · **Purpose:** state, reproducibly and without a live app, exactly which shell-chrome and
layout capabilities this repo has that the upstream foundation does not — so (a) every one of them can be
justified as an SC-n feature request against the foundation, or recorded as deliberate fork-local behaviour, and
(b) a fresh fork agent can tell upstream-standard code from forked code **before** it edits either.

**Upstream target:** `Provident-Electron` — `/media/ryanr/Shared Files/Projects/Provident-Electron` (the adjacent
foundation build this repo forked; not a dependency, never patched from here). Its work queue reads
**"_(no open items — all work items are DONE as of 2026-08-26)_"** (`../Provident-Electron/docs/next-steps.md:13`).

**Companion docs:** `docs/feature-requests/provident-electron-shell-chrome-requests.md` (SC-1..SC-7 — the
foundation requests this delta justifies), `docs/feature-requests/provident-ssr-expressibility-requests.md`
(PS-1 — the package-docs request), `docs/feature-requests/gnosis-engine-feature-requests.md` (GR-1..GR-9 — the
sibling engine set), `docs/HANDOFF.md` (the filing index), `docs/FORKER.md` (fresh-fork orientation).

---

## 1. What upstream ships

The foundation is a **working MCP/Electron endpoint with a demo renderer** — deliberately minimal chrome. Read it
before assuming anything about it.

| Area | Upstream file:line | What it actually contains |
| --- | --- | --- |
| Shell markup | `../Provident-Electron/src/renderer/index.html:33-43` | `<header>` (h1 + tagline) → `<main class="layout">` containing exactly `<div id="app" class="card">` (the graph mount) and `<div id="panes">` (the isolated operator panes). **No top bar, no gutter, no modal, no tab strip, no region registry.** |
| Shell CSS | `../Provident-Electron/src/renderer/index.html:8-30` | `:root { color-scheme: light dark; }`, a hard-coded light `body` background, `.layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }`, and per-element styling for the demo panes. **No token layer, no `data-theme`, no `@media (prefers-color-scheme)`, no grid *tracks*, no containment, no empty-track rule.** |
| Main process | `../Provident-Electron/src/main/main.ts:136-155` | The whole shell integration: one `BrowserWindow` (980×720), `webPreferences { preload, contextIsolation: true, nodeIntegration: false }`, `backend.attachWindow(win)`, `win.loadFile(renderer/index.html)`, `mcp.start()`, and `win.on('closed')` → `mcp.close()` + `app.quit()`. **No application menu, no dialog, no file picker, no shell regions.** |
| Renderer runtime | `../Provident-Electron/src/renderer/runtime.ts` (1191 lines) | The MCP-facing producing process: it keeps the live Supervisor graph + the DOM render, and exposes synthetic dispatch, rendered-HTML visibility, target listing, and node state as plain methods. This is the surface a fork **keeps** (the fork does not fork the engine, it consumes `provident-ssr` directly). |
| Preload bridge | `../Provident-Electron/src/main/preload.ts:16-72` | The `ProvidentBridge`: `ready()`, `onRequest()`, `sendReply()`, `notify()`, `security.get/set()`, `module.get/setDisabled()`. **No RAG/edit/operator-settings/tab/pane surface** — every one of those channels is fork-added. |
| Renderer boot | `../Provident-Electron/src/renderer/renderer.ts:95-141` | Resolves `#app` (`:96`) and `#panes` (`:120`), constructs the Runtime with the demo envelope (`:111`), boots it (`:112`), mounts `SecurePanels` in its own isolated scope (`:121`), and routes MCP requests to the Runtime (`:127-131`). **No theme install, no layout install, no gesture wiring, no tabs, no modal.** |
| Work queue | `../Provident-Electron/docs/next-steps.md:11-13` | `## OPEN` / **"_(no open items — all work items are DONE as of 2026-08-26)_"** — the foundation considers itself feature-complete, which is why this delta is filed as **new-request** items rather than as fixes. |

**Consequence.** Every shell capability an application needs beyond "one card + one operator pane" is fork-local
code with no upstream counterpart. The table in §2 is the complete inventory of that chrome/layout layer.

---

## 2. The chrome/layout delta (what the fork added, and which request covers it)

| # | Capability | Fork implementation (file:line) | Upstream counterpart | Request covering it | Related defect / decision |
| --- | --- | --- | --- | --- | --- |
| 1 | **Shell regions + mount safety** — a declared top bar, four resize gutters, and an overlay host, plus a single-in-flow graph mount | `src/renderer/index.html:278-301` (region markup: `#tab-strip`, four `.gutter[data-zone][data-axis]`, `#settings-modal` + scrim + body, `#settings-toggle`); `src/renderer/runtime.ts:1047-1068` (the stale-mount sweep in `tearDownGraph`) | none | **SC-1** | defect `STALE-MOUNT-PUSHES-CANVAS` (`docs/defects.md:27`) — two `#wiki-root` mounts, page `scrollHeight` ≈ 2× the app height |
| 2 | **Pointer-gesture controllers** — capture, threshold, cancel/reversion, double-click reset, click-safety | `src/renderer/renderer.ts:752-796` (`installShellPointers`; surface at `:326`, capture threshold `:304`, lazy capture at `:463`); `src/renderer/pane-drag.ts:253` (`createDragController`); `src/renderer/pane-gutter.ts:151` (`createGutterController`) | none | **SC-2** | defect **F-1 `PANE-BODY-GESTURE-SWALLOWED`** (`docs/defects.md:56`); decision `PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE` |
| 3 | **Overlay/modal primitive** — frame + dedicated scrim + Escape + class-mirror state machine | `src/renderer/modal-state.ts:42` (`createModalController`), `:116` (`installSettingsModal`); `src/renderer/index.html:297-301` (markup), `:228-268` (frame/scrim CSS incl. the dead-scrim `pointer-events` fix) | none | **SC-3** | decisions `MODAL-SETTINGS-REPARENT` (`docs/decisions.md:228`), `MODAL-DEDICATED-SCRIM` (`:229`); the focus-trap/`inert`/top-layer gaps are recorded as *not graph state* at `docs/specs/ui-overhaul.md:92-97/130/144` |
| 4 | **Theme token layer + tri-state appearance** | `src/renderer/index.html:15-73` (`:root`/`[data-theme='light']` + `[data-theme='dark']` + the `@media` OS fallback); `src/renderer/theme.ts:12`/`:30` (`resolveTheme`/`applyThemeToRoot`); `src/renderer/renderer.ts:126-180` (`installTheme`) | none (`:root { color-scheme: light dark }` + a hard-coded light body only, `../Provident-Electron/src/renderer/index.html:8-9`) | **SC-4** | decision `UI-CONFIG-CARRIER` (`docs/decisions.md:217`) — the persisted `theme` field |
| 5 | **Zone tracks, containment, empty-track collapse, slot order** | `src/renderer/index.html:104-131` (the mount root declares the grid tracks + areas), `:147-150` (the pure-CSS `:has(.is-empty)` → `--zone-*-track: 0px` collapse); `src/renderer/layout-state.ts:214-224` (`layoutCssVars`), `:275-288` (`zoneTrackCssVars`), `:300-314` (`applyLayoutToRoot`); `src/renderer/sidebar-panes.ts:1178-1200` (`applyZoneTracks` — the synchronous census mirror) | none (a two-column `1fr 1fr` grid, `../Provident-Electron/src/renderer/index.html:12`) | **SC-5** | defects `CANVAS-DIMENSIONS-JS-DRIVEN` (`docs/defects.md:23`) + `EMPTY-ZONE-TRACK-NOT-COLLAPSED`; decision `LAYOUT-IN-CSS`; Reading 2 (`docs/specs/ui-overhaul.md:1273-1290`) |
| 6 | **Main-focus tab model + shell strip + MCP focus seam** | `src/renderer/tab-state.ts:269` (`focusTarget`) and the surrounding transitions; `src/renderer/tab-strip.ts:58` (`class TabStrip`); the MCP tool at `src/main/mcp-server.ts:1791` (`ALL_TOOLS`) / `:2248` (handler) / `:2268` (`backend.invoke('focus', …)`) | none | **SC-6** | `docs/specs/ui-overhaul.md:390-395` (the parity note: the shell strip need not be `provident.dispatch`-able; parity holds via shared application code) |
| 7 | **Data-driven native menu + dialog seam** | `src/main/app-menu.ts:93-135` (`buildMenuTemplate`), `:47` (`normalizePaneCatalog`), `:67` (`orderPaneCatalog`), `:81-88` (`importSelectionFromDialog`), `:34`/`:39` (the pinned dialog filter/property constants); `src/main/import-directory.ts:14-37` (the app-side cap/outcomes) | none (no `Menu`/`setApplicationMenu` anywhere in `../Provident-Electron/src/`) | **SC-7** | `docs/specs/ui-overhaul.md:1123` (gap SG3: "no `Menu` in `main.ts`"); decision `IMPORT-ROOT-PER-STORE` — app-side, explicitly excluded from SC-7 |
| 8 | **Content-only repopulation + pane/slot reconciliation** | `src/renderer/runtime.ts:480` (`applyContentReconcile`); `src/renderer/content-reconcile.ts:421` (`reconcileDocumentRoots`) | none | **not an SC request** — this is C10/§3.1 work *inside* the graph via already-published ops (`placement-attach`/`detach`/`destroy`/`state-slice`/`layer-apply`), i.e. a host use of existing engine primitives (`docs/specs/ui-overhaul.md:403-485`) | — |
| 9 | **Host/domain layer** (RAG store + registry, markdown import/parse, doc-flow, templates, editor, gnosis panes, content payloads, MCP tool surface) | `src/main/*` + `src/renderer/*` beyond the rows above (`src/main/rag-store.ts`, `markdown-import.ts`, `doc-flow.ts`, `mcp-server.ts`; `src/renderer/sidebar-panes.ts`, `gnosis-panes.ts`, `edit-controller.ts`, …) | none | **NOT filed** — app behavior, by design. Its engine-facing gaps belong to the GR set (engine) or stay in the fork (RAG policy) | `docs/HANDOFF.md:1-10` (the RAG layer is specific to this project, never handed off) |

**Reading the table.** Rows 1–7 are the **mechanism** layer: generic shell chrome that any app needs and that this
repo had to invent. Rows 8–9 are **not** divergence in the sense that matters here — row 8 uses published engine
primitives, and row 9 is the application itself. Only rows 1–7 produce feature requests.

---

## 3. The rule for keeping the delta bounded

A fork is supposed to diverge. It is not supposed to *drift*: the difference between the two is whether each
divergence is classified and routed. The rule:

1. **A fork change that is a MECHANISM belongs in an SC-n request.** Test: could a different app — on a different
   domain, with different panes and different data — reuse this unchanged? If yes, it is foundation material
   (region contract, gesture delegate, overlay frame, token layer, track contract, focus model, menu catalog). File
   it as a request in `docs/feature-requests/provident-electron-shell-chrome-requests.md`, add the row here, and
   keep the fork-local implementation as the documented fallback.
2. **A fork change that is APP BEHAVIOR stays in the fork.** Test: does it encode this domain — RAG policy,
   document semantics, corpus containment, gnosis/engine vocabulary, this app's pane list, this app's zone names,
   this app's editor or import rules? Then it is app code; it must never appear in a foundation request, and it
   must never be smuggled into a shared mechanism's *default* (e.g. a menu builder that knows `.md` files, a token
   layer that knows Astrographer's 15 token names, a focus model that knows `document:`/`gnosis-doc:`).
3. **A mechanism change whose MODEL is state does not become host-only.** The hybrid rule applies to every SC-n
   request and to every future divergence: *"the **model is always Provident/serialized; only the mechanic is
   external** — external code commits one managed write (hook / state-slice / structural op) at gesture end, never
   a per-frame stream"* (`docs/specs/ui-overhaul.md:151-153`, and Table B). A divergence that moves *state* out of
   the graph is not a shell-chrome divergence — it is a silent loss of MCP visibility and needs a decision row.
4. **Every divergence gets a home in three places.** (a) the implementation (fork code), (b) this table (the
   classification + the covering request), (c) `docs/decisions.md` (the pin, if the shape was chosen rather than
   inherited). A divergence missing any of the three is drift.
5. **The foundation is never patched from here** (AGENTS.md item 7). Divergence is *filed*, not merged: a fork
   change that the foundation adopts arrives there as an accepted request, not as a cherry-picked commit from this
   repo. Any package-level defect takes the defect route (`docs/defects.md` → `docs/HANDOFF.md`) with no local
   patch.

---

## 4. How to re-derive this delta (reproducible method — no live app)

Everything in §1/§2 was derived by reading files, not by running the app. To re-derive or extend it:

1. **Compare the file inventories.** List `src/**/*.ts` in both trees. Upstream has **16** modules
   (`../Provident-Electron/src/`: 8 main + 4 renderer… precisely `main.ts`, `preload.ts`, `mcp-server.ts`,
   `security.ts`, `security-store.ts`, `module-store.ts`, `standalone.ts`, `battery-host.ts`; `renderer.ts`,
   `runtime.ts`, `secure-panels.ts`, `extensions.ts`; `shared/types.ts`, `shared/dom-shim.ts`,
   `shared/demo-envelope.ts`, `shared/path-fork-cycle.ts`); this fork has **66**. The modules that
   exist in this repo and not upstream are the fork's additions — for each, decide §3 rule 1 vs rule 2.
2. **Diff the three shell files directly** (they are small upstream, so the diff is readable in full):
   - `diff -u "../Provident-Electron/src/renderer/index.html" src/renderer/index.html` — 44 lines upstream vs 304
     here; every added block is a region, a token, a track rule, or a chrome class.
   - `diff -u "../Provident-Electron/src/renderer/renderer.ts" src/renderer/renderer.ts` — 142 vs 1053 lines; the
     delta is the theme/layout/gesture/modal/tab boot wiring (`src/renderer/renderer.ts:120-200`, `:752-796`,
     `:798-1045`).
   - `diff -u "../Provident-Electron/src/main/preload.ts" src/main/preload.ts` — 72 vs 642 lines; the added
     bridge surfaces are the fork's host/domain channels (row 9) plus the two chrome-side ones (`sidebar` methods
     incl. `togglePaneCollapse`/`zoneMinimizeToggle`/`paneTabExpand`/`openDocumentTab`).
3. **Diff the main-process shell integration.** `../Provident-Electron/src/main/main.ts` is 167 lines and contains
   no menu/dialog code; the fork's `src/main/main.ts` is 868 and adds the app-menu wiring, the import IPC
   (`IPC_IMPORT_RESULT`), the pane catalog/visibility channels, and the RAG/operator-settings channels. Anything
   found there that is *generic* belongs in §2; anything domain-specific belongs in row 9.
4. **Confirm the foundation has no work queue for it.** Re-read `../Provident-Electron/docs/next-steps.md` (its
   `## OPEN` section) and `../Provident-Electron/docs/pending.md` — if the capability is already an upstream open
   item, the fork's job is to cite that item, not to file a duplicate request.
5. **Classify each delta with §3 rule 1 vs rule 2**, then add/refresh its row in §2 (capability · fork file:line ·
   upstream counterpart · covering request · defect/decision).
6. **Verify every citation before writing it.** Re-read each `file:line` in the current tree; if it drifted, fix
   the row and say so (the SC-5 citation was corrected exactly this way — the ruling named
   `layout-state.ts:214-308` for "JS-written custom properties"; the module is `:1-314`, the projection is
   `:214-224` + `:300-314`, and `zoneTrackCssVars` `:275-288` *computes* while `sidebar-panes.ts:1178-1200`
   *writes*).
7. **Do not assert behaviour from a line number's existence.** Where a claim is about what the *app does* (not
   what a module contains), it needs either a live check or the recorded RCA-12 layer label — a node-suite green is
   ENVELOPE-green, not APP-green (`AGENTS.md:207-212`).
