# Unit U-LIVE11 — Sidebar Bridge Seam Fix (LIVE-11 collapse-inert + LIVE-12/C + LIVE-5) — Fix-Spec

**Status: LANDED — GREEN + LIVE-CONFIRMED (2026-09-15).** This unit fixed the
code defect **LIVE-11 COLLAPSE-INERT** (`docs/defects.md` line 25) and **un-parked**
two parked/gapped neighbors: **LIVE-12/C** (the in-pane `paneVisibilityToggle`
that cannot work live) and **LIVE-5**'s `togglePaneVisibility` H3-guard symmetry.
**Layer (RCA-12): envelope-green vs app-green.** The node suite + dom-shim are
ENVELOPE-green (the dom-shim fallback at `sidebar-panes.ts:2759-2763` attaches every
method directly, so tests never catch the gap); the REAL `contextBridge` renderer is
APP-green-inert because the preload's fixed-key `sidebar` surface omits the four
collapse/visibility seams. This fix closed that preload-boundary seam gap (plus the
LIVE-8/9/11 `handleDomEvent` path-key dispatch seam) so the live battery went green —
**LIVE-11 FIXED + LIVE-CONFIRMED 2026-09-15** (native click collapse).

**Owning spec:** `docs/specs/unit-u-shell-3-collapsible-panes.md` (the C5 collapse
contract; this fix adds the bridge-exposure invariant to §2.5 + a fail-state, and
records the preload-exposure fix note — see the owning-spec edit in this same pass).

**Feasibility verdict: PROCEED** — the fix is a strict **preload-only additive
shape**: four default no-op holder keys + four delegation wrappers on the already-
generic `installSidebar(methods)` bridge, plus a one-line H3 touch in the renderer.
It touches **no** provident-ssr package, no model, no layout semantics.

---

## 1. Status / context

- **Unit:** U-LIVE11. **Defect:** LIVE-11 COLLAPSE-INERT (medium, HOST) — clicking a
  pane's collapse toggle leaves the pane expanded; live the collapse handler never
  re-renders a collapsed frame.
- **Root cause (authoritative probe, verified against the tree below):** the
  provident collapse-handler body (`pane-graph.ts` `PANE_COLLAPSE_BODY`, lines
  57-62) reads `window.provident.sidebar` and calls `s.togglePaneCollapse(id)`,
  guarded by `typeof s.togglePaneCollapse !== 'function'` (line 59). The renderer's
  `installSidebarBridge` **does** register `togglePaneCollapse`
  (`sidebar-panes.ts:2675`) plus siblings `paneVisibilityToggle` (:2677),
  `zoneMinimizeToggle` (:2681), `paneTabExpand` (:2682) into the holder via
  `installSidebar(methods)` (:2755-2757). **BUT** `src/main/preload.ts`
  `contextBridge` exposes a **fixed-key `sidebar` object literal that OMITS these
  four methods** — the default `sidebarHolder` (lines 260-296) and the exposed
  `sidebar` proxy (lines 552-597); only `installSidebar` (:598-600) is generic.
  So in the real Electron renderer
  `window.provident.sidebar.togglePaneCollapse === undefined` → the handler body's
  guard returns → **collapse inert**. The node tests never catch it because the
  dom-shim fallback attaches every method directly (`sidebar-panes.ts:2759-2763`).
- **Same gap makes siblings inert live:** LIVE-12/C's `paneVisibilityToggle`
  (`sidebar-panes.ts:2677`, reached by `OPERATOR_PANE_VISIBILITY_BODY` :292-295,
  guard `typeof s.paneVisibilityToggle !== 'function'` :293) and the C12
  `zoneMinimizeToggle`/`paneTabExpand` seams are **undefined in the real renderer**
  for exactly the same reason.
- **LIVE-5 hardening fold-in:** `togglePaneVisibility` (`sidebar-panes.ts:2823-2830`)
  flips `registry.setEnabled` + `persistEnabledPanes` + `refresh` but does **NOT**
  set `this.paneVisibilityTouched = true`, whereas the native seam
  `onPaneVisibilityChange` (:1312-1331) **does** (:1321). The field
  `paneVisibilityTouched` (:693) gates the stale boot-apply
  `applyPersistedPaneVisibility` (:1269) and is reset at boot (:1772). Without the
  touch, an in-pane toggle racing a stale boot settings fetch gets clobbered — the same
  H3 race the native seam already guards. Mirror it for symmetry/invariant consistency.

### 1.1 Fix shape (what the implementer ships — preload + one renderer line)

1. **Preload default `sidebarHolder`** (`src/main/preload.ts` :260-296): add the
   four omitted keys
   `togglePaneCollapse / paneVisibilityToggle / zoneMinimizeToggle / paneTabExpand`
   as no-ops (`()=>({})` or `()=>{}`), so the surface has the keys before the renderer
   installs.
2. **Preload exposed `sidebar` proxy** (:552-597): add the four delegation wrappers,
   e.g. `togglePaneCollapse: (id) => sidebarHolder.togglePaneCollapse?.(id)`,
   `paneVisibilityToggle: (id) => sidebarHolder.paneVisibilityToggle?.(id)`,
   `zoneMinimizeToggle: (zone) => sidebarHolder.zoneMinimizeToggle?.(zone)`,
   `paneTabExpand: (zone, paneId) => sidebarHolder.paneTabExpand?.(zone, paneId)`.
3. **`installSidebar` (:598-600)** is already generic (`sidebarHolder = methods`) —
   the renderer's methods flow through unchanged; **no change** needed there.
4. **Renderer `togglePaneVisibility` (:2823-2830)**: add
   `this.paneVisibilityTouched = true` (mirror `onPaneVisibilityChange` :1321),
   placed before the persist so the boot-apply guard holds.

This shape is the repo-wide **bridge-forwarding contract pattern** — the
`installSidebar`/holder sync — identical to the wave-1 decisions **W1-N7** (preload
`sidebar` forwards `docNavToggle`) and **W1-N11** (the C18/C19 seams
`searchAdvancedToggle`/`submitAdvancedQuery`/`expandSearchTab`/`hoverPreview*`).
The U-SHELL-3 §2.5 pin 2 single handler name `togglePaneCollapse` is the driver that
becomes live-functional once the seam is exposed.

---

## 2. Behavior contract (pinned invariants)

**§2.1 — the seams-exposed invariant (the LIVE-11 fix).** In the REAL `contextBridge`
renderer (the preload owns `window.provident.sidebar`; the renderer must never attach
`sidebar` to a frozen `window.provident`), after the preload loads and the renderer
calls `installSidebar(methods)`,
`window.provident.sidebar.togglePaneCollapse` **and its three siblings**
`paneVisibilityToggle`, `zoneMinimizeToggle`, `paneTabExpand` are **functions**
(`typeof === 'function'`). Before `installSidebar` they exist as no-ops that never
throw (the default holder). The `installSidebar` delegation forwards the exact
arguments unchanged.

**§2.2 — the collapse-flip invariant.** A DOM click on `.pane-frame
.pane-collapse-toggle` (or the equivalent `provident.dispatch` on the
`togglePaneCollapse` handler) → the handler body resolves
`window.provident.sidebar.togglePaneCollapse(id)` as a function → `SidebarPanes
.togglePaneCollapse(id)` flips `PaneLayoutEntry.collapsed` for `id` → commits ONCE
through `setLayout` (persists `layout`) → re-derives so the pane renders the
**body-less** collapsed frame carrying the `is-collapsed` class (`pane-graph.ts`
`PANE_COLLAPSED_CLASS`, line 67). The collapse is symmetric: a second toggle re-
expands, identity/root unchanged.

**§2.3 — the pane-visibility toggle invariant (LIVE-12/C un-park).** The operator
Settings pane's per-pane control (handler `operator-pane-visibility-toggle`, body
:292-295) → `window.provident.sidebar.paneVisibilityToggle(id)` is a function →
`SidebarPanes.togglePaneVisibility(id)` flips `registry.setEnabled` → persists
through `persistEnabledPanes` → re-renders. Round-trips: the persisted enabled set
is re-applied at the next boot.

**§2.4 — the H3-touched invariant (LIVE-5 symmetry).** `togglePaneVisibility` sets
`this.paneVisibilityTouched = true` before/at the persist, mirroring the native seam
`onPaneVisibilityChange` (:1321), so a stale boot `applyPersistedPaneVisibility`
(:1269) returning after an in-pane toggle is suppressed (never clobbers the toggle).
Symmetric: the native seam and the in-pane control are behaviorally equivalent with
respect to the boot-race guard.

---

## 3. States (TestWriter valid paths)

1. Preload loads in the contextBridge mock → `bridge.sidebar.togglePaneCollapse` and
   the 3 siblings are functions **before** `installSidebar` (no-op default holder).
2. `installSidebar(methods)` with the four keys → each exposed seam delegates to the
   installed holder with the exact args (`id`, `id`, `zone`, `zone+paneId`).
3. A `.pane-frame .pane-collapse-toggle` click → `PANE_COLLAPSE_BODY` guard passes →
   `togglePaneCollapse(id)` flips `collapsed` → body-less `is-collapsed` frame renders.
4. A second click re-expands; root identity unchanged.
5. Operator visibility control → `paneVisibilityToggle(id)` flips enable + persists;
   the persisted set round-trips after boot.
6. `togglePaneVisibility` sets `paneVisibilityTouched = true`; a post-toggle
   `applyPersistedPaneVisibility` is a no-op.
7. `provident.dispatch('togglePaneCollapse', …)` reaches the same seam as the DOM
   click (MCP/UI equivalence preserved).

## 3a. Adversarial findings (host fixes + regression, dated 2026-09-14)

The post-green adversarial pass on U-LIVE11 surfaced two HOST (this repo's
`src/`) findings. Both are fixed here + regression-tested; neither touches the
`provident-ssr` package (AGENTS.md §7 carve-out).

### AD-2026-09-14-1 (MED) — `togglePaneVisibility` bypassed the dirty-edit guard

**Finding.** `SidebarPanes.togglePaneVisibility` (pre-fix `sidebar-panes.ts:2832-2842`,
now at `:2851`) ended with `void this.refresh()`, which performs a direct,
SYNCHRONOUS `loadAppGraph` re-load UNCONDITIONALLY — bypassing the dirty-edit
queue/guard.
The native seam `onPaneVisibilityChange` (:1312-1331) instead branches on scope:
operator → `refreshOperator()` (:1325); app-graph →
`editController.requestRebuild('content')` (:1329) which IS dirty-edit-guarded.
U-LIVE11 made the in-pane path live-reachable, so the divergence now matters: a
visibility flip while an edit-control was dirty would fire a full `loadAppGraph`
re-load before the dirty edit committed (the F4 class of guard it must honor).

**Fix.** Mirror the native seam exactly: branch on `def.scope` — operator scope →
`refreshOperator()` (re-mount only the isolated scope); app-graph scope →
`editController.requestRebuild('content')` (the dirty-edit guard queues the
additive content reconcile while dirty, fires once the control clears). DROP the
`void this.refresh()` call — its layout/backlink reads are unneeded for a
visibility flip.

**Regression (test §(e)).** With a control marked dirty through the edit
controller, dispatch the in-pane `paneVisibilityToggle` on an app-graph pane:
`editController.hasQueuedRebuild() === true` and the rebuild's `onRebuild`
(loadAppGraph path) does **not** fire; clearing the dirty control executes the
queued content rebuild exactly once (`onRebuild('content')`). No-dirty path
fires immediately; operator-scope fires `refreshOperator()` only.

### AD-2026-09-14-2 (MED) — no structural guard against a renderer seam forgotten on the preload side

**Finding.** The renderer `installSidebarBridge` `methods` object
(`sidebar-panes.ts:2714-2715`) already carried `openDocumentTab` + `searchTabQuery`
that were ABSENT from the preload `SidebarMethods` type / `sidebarHolder` / exposed
`sidebar` proxy — dead at the live contextBridge boundary today (the dom-shim
fallback attaches every method directly, so node tests never caught it; a real
renderer would show them `undefined` → the HOST-4/HOST-5 handler-body guards
would return → silently inert).

**Fix.** (a) **Parity guard** — `installSidebarBridge` now asserts, before
`install(methods)` in the real contextBridge renderer, that every
`Object.keys(methods)` key is present as a function on the exposed preload
`sidebar` proxy; a forgotten seam THROWS (`[installSidebarBridge] preload
"sidebar" is missing seam …`) — fails loud at boot, not silent-inert. (b)
**Register the two seams** — `openDocumentTab(id)` + `searchTabQuery(tabId, query)`
added to the preload type + default `sidebarHolder` no-ops + the exposed proxy
delegation wrappers (same style as the LIVE-11 seams). These are NOT dead: the
`SEARCH_RESULT_OPEN_BODY`/`SEARCH_TAB_SUBMIT_BODY` handler bodies (`pane-graph.ts`
:907-911/:918-925) reach them for HOST-4/HOST-5. The four existing seams'
behavior is unchanged.

**Regression (test §(f)).** The preload exposes `openDocumentTab` + `searchTabQuery`
as no-op functions (default holder, never throw) and delegates the exact args
after `installSidebar`; and `installSidebarBridge` fails LOUD (throws) when the
exposed preload proxy lacks a registered seam.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | **Seam undefined at the preload boundary** — any of `togglePaneCollapse`/`paneVisibilityToggle`/`zoneMinimizeToggle`/`paneTabExpand` is `undefined` on `window.provident.sidebar` in the real renderer (or the default holder lacks the key). | **FAIL** — the handler-body guard returns and the feature is silently inert. This is the LIVE-11/LIVE-12/C state and MUST be eliminated. |
| F2 | **Guard no-op** — the handler body reaches a seam but `typeof … !== 'function'`. | **FAIL** — collapses the same as F1; the seam must be a function. |
| F3 | **Collapse not re-rendering** — `collapsed` flips in state but the frame is not body-less / lacks `is-collapsed`. | **FAIL** — the re-derive path must render the collapsed frame. |
| F4 | **Visibility not persisting** — `paneVisibilityToggle` flips the in-memory state but `persistEnabledPanes` does not write / boot does not re-apply. | **FAIL** — the LIVE-12/C/LIVE-5 persistence round-trip must hold. |
| F5 | **No delegation** — an exposed seam is a function but does NOT forward to the installed holder (e.g. shadows the holder, drops args). | **FAIL** — the renderer's methods would never run. |
| F6 | **H3 race** — `togglePaneVisibility` does not set `paneVisibilityTouched`. | **FAIL** — a stale boot settings fetch clobbers the toggle (the LIVE-5 hardening miss). |
| F7 | A malformed/unknown id on any of the four seams. | The host methods are unchanged contracts: `togglePaneCollapse`/`togglePaneVisibility` no-op on a non-string/empty id (F5-adversarial in the owning specs); the delegated wrapper is argument-transparent (no host-level behavior change). |

---

## 5. Census

- **Preload:** +4 default-holder keys +4 proxy delegation wrappers (`src/main/preload.ts`). No new deps.
- **Renderer:** +1 line (`paneVisibilityTouched = true` in `togglePaneVisibility`).
- **Reuse:** the `installSidebar`/holder sync + `SidebarMethods` types (already generic); the U-SHELL-1 `setLayout` persist; the U-SHELL-8 `persistEnabledPanes` path.

### 5.7 Property register (PBT)

Register convention (imported): rows typed **P-IM** (input-model), **P-SM**
(state-model), or **P-TP** (transform) — NEVER F-rows, ≤8 rows. Budget:
≤100-attempts-per-row / ≤400-total / stop-after-5.

| Row | T | Pinned invariant | Strategy key |
| --- | --- | --- | --- |
| `P-IM-1` | IM | **The preload `sidebar` surface exposes the four collapse/visibility seams as functions** after the preload loads, both before AND after `installSidebar`: `togglePaneCollapse`, `paneVisibilityToggle`, `zoneMinimizeToggle`, `paneTabExpand` are each `typeof 'function'` on `bridge.sidebar`. | `strat:seams-exposed` |
| `P-IM-2` | IM | **The default holder no-op + delegation is total + arg-transparent.** Before `installSidebar`, each exposed seam is a no-op (never throws, never mutates); after `installSidebar(methods)` with matching keys, the exposed seam forwards the call + exact args to the installed holder (`id`, `id`, `zone`, `zone+paneId`); a holder WITHOUT a key falls through via optional-call (`?.`) to a no-op, never a throw. | `strat:seam-delegation-total` |
| `P-SM-1` | SM | **The collapse flip renders the body-less `is-collapsed` frame.** A `.pane-frame .pane-collapse-toggle` click → guard passes (seam is a function) → `togglePaneCollapse(id)` flips `PaneLayoutEntry.collapsed` → `setLayout` persists → the re-derive renders the frame without its body, carrying `is-collapsed`; a second click re-expands with the same root identity. | `strat:collapse-flip-render` |
| `P-SM-2` | SM | **The pane-visibility toggle flips + persists (round-trips).** `paneVisibilityToggle(id)` → `togglePaneVisibility` flips registry enable + `persistEnabledPanes` → the persisted set is re-applied at the next boot. | `strat:visibility-flip-persist` |
| `P-SM-3` | SM | **MCP/UI equivalence preserved.** `provident.dispatch('togglePaneCollapse', …)` reaches the SAME seam as the DOM click (the inline handler + the dispatched handler share the one `window.provident.sidebar.togglePaneCollapse` seam). | `strat:dispatch-eq-click` |
| `P-TP-1` | TP | **The host flip is persistence-total.** Every `togglePaneCollapse`/`togglePaneVisibility` flip commits ONE write-through (`setLayout` / `persistEnabledPanes`) and the resulting persisted state round-trips across boot + survives a RAG content change; a flip before the operator-settings fetch resolves is not lost. | `strat:host-flip-persist` |
| `P-TP-2` | TP | **The H3-touched invariant holds for BOTH visibility paths.** `togglePaneVisibility` and the native `onPaneVisibilityChange` both set `paneVisibilityTouched = true` at/with the persist; a stale boot `applyPersistedPaneVisibility` that returns after the toggle is suppressed (the guard sees `paneVisibilityTouched`), so neither path is clobbered by the boot race. | `strat:h3-touched-both-paths` |

---

## 6. TestWriter red-set contract (derive every test from this)

The red set uses the repo's existing harnesses; each is **RED today / GREEN after the fix**.

**(a) Preload-surface test** (`mock electron` + import `src/main/preload.js`, capture
`contextBridge.exposeInMainWorld` — the `template-adversarial.test.ts` /
`unit-u5-rich-commit-ipc.test.ts` / `unit-wave-1-bridge-wiring.test.ts` pattern; the
wave-1 `SEAMS`-loop assertion at :263-284 is the exact shape): assert
`bridge.sidebar.togglePaneCollapse`, `bridge.sidebar.paneVisibilityToggle`,
`bridge.sidebar.zoneMinimizeToggle`, `bridge.sidebar.paneTabExpand` are `function`:
(before `installSidebar` — the default-holder no-ops) and again after
`installSidebar({ togglePaneCollapse, paneVisibilityToggle, zoneMinimizeToggle,
paneTabExpand })` — and that each exposed seam forwards the exact args to the
installed holder. **Today these four are `undefined` at the preload boundary → RED.**

**(b) Renderer integration test** (dom-shim, `installSidebarBridge`): dispatch the
collapse-handler body → `SidebarPanes.togglePaneCollapse(id)` wrote `collapsed: true`
for `id` + the re-derive rendered the body-less frame with `is-collapsed`; a second
dispatch re-expands, root identical. (Envelope-green; the seam surface here is already
green — the live gap is §(a), but (b) pins the render-host contract end-to-end.)

**(c) LIVE-5 seam test:** `togglePaneVisibility(id)` sets `this.paneVisibilityTouched
=== true` and persists; a subsequent `applyPersistedPaneVisibility(staleSettings)` is a
no-op (the boot-race guard). **RED today — the flag is not set.**

**(d) LIVE-12/C persist regression:** `paneVisibilityToggle` → `togglePaneVisibility`
→ `persistEnabledPanes` wrote the flipped set, and a fresh apply re-applies it
(round-trip). This un-parks LIVE-12/C.

---

## 7. Mandatory live battery (RCA-11/RCA-12 — a UI-overhaul unit is not pre-DONE while its live battery is parked)

Run against the assembled app on a usable display via `scripts/live-drive.mjs`:

- **Existing `collapse` block (`scripts/live-drive.mjs` :160-166)** — clicks
  `.pane-frame .pane-collapse-toggle` and asserts `.is-collapsed`
  (`[...document.querySelectorAll('.pane-frame')].some(f => f.classList.contains('is-collapsed'))`).
  **Today this FAILS live** (the click does nothing — the seam is undefined →
  guard no-op). **MUST PASS after this fix.**
- **A pane-visibility block (to be added)** — assert the in-pane toggle
  (`operator-pane-visibility-toggle` for an app-graph pane in the operator Settings
  pane) flips the pane's visibility AND the flipped set survives a boot/reload (the
  persistence round-trip). Today the control is inert live (seam undefined); it MUST
  pass after the fix.

**Park note:** park ONLY a structurally non-exercisable surface (an OS-owned native
dialog — RCA-11). The collapse + visibility blocks are fully reachable via the CDP
click surface — they are NOT park-eligible.

---

## 8. Cross-references

- `docs/defects.md` LIVE-11 (line 25), LIVE-12 (line 14), LIVE-5 (line 19).
- `docs/specs/unit-u-shell-3-collapsible-panes.md` §2.5 pin 2 (single handler name
  `togglePaneCollapse`), §5 Census, §4 F-states — the owning spec this fix hardens.
- `docs/specs/rca-live-bugs-green-pipeline.md` (RCA-11/RCA-12 — right-layer + live-battery gates).
- Wave-1 decisions **W1-N7 / W1-N11** (`docs/specs/wave-1-open-decisions.md`) — the
  `installSidebar`/holder bridge-forwarding pattern this fix follows.
- Build: `src/main/preload.ts` (`installSidebar` :271 + impl :637, the default
  `sidebarHolder` seam block :312-315, the exposed `sidebar` proxy delegation
  wrappers :627-630); `src/renderer/sidebar-panes.ts` (`installSidebarBridge`,
  `togglePaneCollapse`, `togglePaneVisibility`, `onPaneVisibilityChange` :1312-1331,
  `applyPersistedPaneVisibility` :1279, `paneVisibilityTouched` :693); `src/renderer/
  runtime.ts` (`handleDomEvent` :212-237); `src/renderer/pane-graph.ts`
  (`PANE_COLLAPSE_BODY`, `PANE_COLLAPSED_CLASS`).

## 9. Delimitation

Preload-boundary seam exposure + the LIVE-5 H3 touch ONLY. It does **not** change any
model, `LayoutState` semantics, collapse/visibility rendering logic, `setLayout`,
`persistEnabledPanes`, zone-minimize behavior, or the handler-body strings. It does
**not** patch `provident-ssr` (AGENTS.md). No new dependencies.
