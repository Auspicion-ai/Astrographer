# Unit U-SHELL-8 — View-Menu Pane Visibility (C13) — Spec

**Status: GREEN — COMPLETE (2026-09-12).** Implemented + tested. Unit file
`tests/unit-u-shell-8-view-menu-pane-visibility.test.ts` — **34 pass**. Blind
artifact `unit-u-shell-8-view-menu-pane-visibility-greens.md` — **24/24 PASS**
(V4/V5 were an initial run FAIL; the toggle-path `zone:*` `is-empty` mirror was
fixed by `syncZoneMirrors` — see §2.6 pin 5 + the greens drift history). Trio:
**178 files / 4135 pass + 54 skip**, typecheck 0, build OK. Documentation review
(RCA-6): `archive/reviews/2026-09-12-u-shell-8-doc-review.md`. Gate: the
UI-overhaul umbrella gate (PROCEED-WITH-AMENDMENTS, A1). **Depends on
U-MENU-1** (the native View menu + catalog IPC + `IPC_PANE_VISIBILITY`, Wave 1),
**U-SHELL-1** (zones), and **C9** (`enabledPanes` serialization). Resolutions:
Q10 native View menu; Q11 operator-only; W1-Q2 catalog pushed on boot/change.
Open items in `docs/specs/wave-2-open-decisions.md` (W2-Q5/W2-Q10).

---

## 1. What the proposal asks

A **View menu** exposes a **pane-visibility selection dropdown** listing every
registered pane with a visibility toggle (C13). Today there is no application
menu, and `OperatorSettings.enabledPanes` exists but is only **displayed**
(`sidebar-panes.ts:1205`), never applied at runtime. Deliver the runtime
application + persistence.

## 2. Contract (pinned)

### 2.1 Data-driven from the registry

- The View → Panes submenu is built from the **live `PaneRegistry` catalog**
  pushed over `IPC_PANE_CATALOG` by U-MENU-1 (`paneCatalog()`,
  `sidebar-panes.ts:624`; re-pushed on `registry.onChanged`, `:883`). Never a
  hard-coded list; a newly registered pane appears without a main-process change.
- Grouped by scope (`app-graph` vs operator); deterministic order.

### 2.2 One model (C9)

- Toggling a checkbox sends `IPC_PANE_VISIBILITY { id, enabled }` (from
  U-MENU-1's menu item) → the renderer:
  1. `registry.setEnabled(id, enabled)`;
  2. writes the serialized **`enabledPanes`** in the C9 UI-config (the
     `OperatorSettings` carrier);
  3. re-derives the zones so the pane appears/disappears.
- U-MENU-1 owns the menu item + IPC; **U-SHELL-8 owns the apply + persistence +
  zone re-derive.**

### 2.3 Cascades into C11

- Hiding the **last** pane in a zone empties it → the zone auto-hides (C11) and
  reveals only on drag proximity (U-SHELL-4).
- Showing a pane into a hidden zone un-hides that zone (restores its retained
  size, U-SHELL-1).

### 2.4 Operator-only; no MCP tool

- The visibility control is a **manual-UI surface** (sibling of the settings
  toggle), **operator-only** (Q11). There is **no** MCP tool to toggle pane
  visibility (§6) — an agent must not blind the MCP-visible app graph.
- Hiding an app-graph pane deliberately removes it from
  `get_rendered_html` / `list_targets` (a human action). Hiding an operator pane
  removes it from the operator isolated scope only (already MCP-invisible).

### 2.5 Pane-additive application

- Applying a toggle should be a **pane-additive reconcile** (attach/detach the
  `pane-<id>` root through the U-SHELL-1 zone producers), **not** a full
  `loadEnvelope`/teardown — see W2-Q5. The content path (U-STATE-1) already
  reconciles panes; U-SHELL-8 reuses it.

### 2.6 Pinned implementation details (post-TestWriter, 2026-09-12)

1. **Scope authority model (W2-Q10) + FIRST-RUN-ENABLED-DEFAULT (2026-09-15, LIVE-7):** `enabledPanes` (existing) is the
   authoritative enabled set for **app-graph** panes. On a **FIRST boot** (an EMPTY persisted `enabledPanes` with `panesInitialized !== true`) the enabled app-graph panes default to **`['search','doc-nav']` ONLY** (NOT all panes — superseding the earlier "empty ⇒ all app-graph enabled" default), and that default is WRITTEN THROUGH via `persistEnabledPanes` so the census + a subsequent boot agree; a NON-EMPTY persisted list stays authoritative; after `panesInitialized` an empty list means **none** (H2). **Operator panes** are
   enabled by default and governed by a NEW additive
   `OperatorSettings.enabledOperatorPanes: string[]` (default `[]` → all operator
   panes enabled); the View menu lists + toggles them. This reconciles the
   existing host test that boots `enabledPanes:['doc-nav']` yet still expects the
   operator `settings` pane rendered (an empty operator list = operator default).
   Pinned: decision `FIRST-RUN-ENABLED-DEFAULT` (`docs/decisions.md`),
   defect LIVE-7 (`docs/defects.md`), and the re-derived
   `tests/unit-u-shell-8-view-menu-pane-visibility.test.ts` (36 tests: state 1, H1,
   H4, H2 first-boot expect only search+doc-nav on an empty first-run set).
2. **Host apply seam:** subscribe at boot via `bridge.onPaneVisibility(({ id,
   enabled }) => …)` (U-MENU-1's IPC); the handler calls
   `registry.setEnabled(id, enabled)`, writes the C9 carrier
   (`enabledPanes`/`enabledOperatorPanes` per scope), and re-derives the zones
   additively.
3. **Order/shape:** `enabledPanes`/`enabledOperatorPanes` membership is what
   matters; order is not semantically significant.
4. **F4 queuing:** the outcome (queued, then applied additively without a full
   `loadEnvelope`) is pinned; the exact rebuild kind is an implementation detail.
5. **Zone-mirror refresh (V4/V5):** `applyContentReconcile` reconciles content
   roots (`rag-`/`pane-`) ONLY, so a pane-additive visibility toggle that empties
   or repopulates a zone must ALSO re-emit that `zone:<name>` container's
   state-derived `is-empty`/`is-minimized` mirror classes — `syncZoneMirrors`
   applies the assembler-computed classes through the managed `state-slice`
   channel (pane-additive: no `loadEnvelope`/teardown, stable `zone:*`
   identities, no redundant write when the mirror already matches). This closes
   the V4/V5 blind FAIL (a fresh boot rendered the mirror correctly; the toggle
   path did not). See `docs/specs/wave-2-open-decisions.md` §D W2-N8 for the
   journal-layer follow-up.

### 2.7 Adversarial findings (2026-09-12) + pinned fixes

Read-only adversarial pass; host findings fixed here, no package findings.

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **H1** | med | F3 "unknown id dropped" only warned; the authority used the **unfiltered** list, so a single unknown id blinded **all** panes of that scope. | **FIXED** — filter unknown ids out of the effective list before the `length`/`includes` authority computation. |
| **H2** | med | "all panes hidden" was **unpersistable** (an empty enabled-subset is reinterpreted as all-enabled). | **FIXED** — add the additive `OperatorSettings.panesInitialized: boolean` (default `false`); when `true`, an empty list means **none enabled**. |
| **H3** | low | Boot TOCTOU: a toggle during boot was clobbered by the stale boot-fetched enable sets. | **FIXED** — the `paneVisibilityTouched` in-flight guard suppresses the boot `applyPersistedPaneVisibility` once any toggle has landed. The subscription is in fact registered **before** the boot apply (`boot` wires `onPaneVisibility` at `sidebar-panes.ts:1166`, then awaits the settings fetch and applies at `:1230`); the guard, not the ordering, is the operative fix (verified by the blind H3 `subscribedBeforeApply=true` observation). |
| **H4** | low | A wrong-scope persisted id silently blinded the other scope. | **FIXED** — filter/warn ids whose registry scope doesn't match the list. |
| **H5** | low | (pre-existing) `settingsContent` throws on a non-array `enabledPanes`. | **FIXED** — `Array.isArray` guard. |
| **H6** | low | A pane registered **after boot** named in persisted `enabledPanes` stayed disabled. | **PINNED** — a pane hot-registered AFTER boot defaults to **DISABLED** (the registry's deliberate default-off visibility contract). Persisted lists govern only panes present at boot. A hot-added pane becomes visible when the **HOST** explicitly enables it (an app-graph pane the operator wants shown is enabled through the registry/host enable path; no automatic enable on registration). The **W2-N9** test now pins default-disabled + host-enables-to-appear. |

**Confirmed-safe:** malformed/hostile `IPC_PANE_VISIBILITY` (non-object/non-string id/non-boolean/`__proto__`/`constructor`) all ignored, no throw, no prototype pollution, no phantom; scope isolation both directions; F1/F2/F7; no full reload (C10/§2.5 — `requestRebuild('content')` → `applyContentReconcile`, stable `zone:*`); MCP invisibility (§2.4/§6 — no pane tool in `ALL_TOOLS`, 57 entries); C11 cascade + retained size; restart persistence. **Correction (2026-09-12):** the "C11 cascade" half of this claim was recorded optimistically before the blind run. V4/V5 initially **FAILED** — the pane-additive toggle path detached the pane roots but did not refresh the `zone:*` `is-empty` mirror (a fresh boot rendered it correctly, the toggle path did not). **FIXED** by `syncZoneMirrors` (§2.6 pin 5); V4 (empty → `is-empty`) and V5 (un-hide → cleared `is-empty` + retained size) now **PASS** and the blind tally is **24/24**. No package findings.

## 3. States (TestWriter red set — valid paths)

1. Boot → `enabledPanes` from the store is applied to the registry (a persisted
   enabled pane renders; a disabled one does not).
2. Toggle a pane ON in the View menu → `registry.isEnabled` true; the pane
   renders in its zone; `enabledPanes` persisted.
3. Toggle a pane OFF → the pane is removed; `get_rendered_html`/`list_targets`
   no longer contain it; `enabledPanes` persisted.
4. Hiding the last pane in `left` → the zone becomes `is-empty` (C11).
5. Showing a pane into an empty zone → the zone un-hides + restores its size.
6. The operation is additive: no `loadEnvelope`/teardown; `zone:*` ids stable.
7. The control is operator-only: no MCP tool toggles visibility.
8. Restart with a persisted hidden pane → it stays hidden.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | a toggle for an unregistered pane id | ignored; no phantom entry |
| F2 | a malformed `IPC_PANE_VISIBILITY` payload | ignored; never throws |
| F3 | an unknown id in persisted `enabledPanes` | dropped + warning |
| F4 | toggling while an edit is dirty | queued via the rebuild guard |
| F5 | a pane that renders nothing when enabled | renders the empty state; never throws |
| F6 | a toggle while the catalog is stale | registry is authoritative; catalog re-pushes after |
| F7 | a settings write failure | the in-memory enablement still applies for the session |

### 5.7 Property register (PBT)

This is a CODE-BEARING unit, so the register is **mandatory**. It covers the PURE
pane-layout + visibility-mirror helpers in `src/renderer/pane-graph.ts` (the ONLY
pure module surface of this unit — the rest of U-SHELL-8 is the host wiring, not
purely propositional). Rows are typed **P-IM** (input-model), **P-SM**
(state-model), or **P-TP** (transform) — NEVER F-rows, NEVER §4/F-n rows (the
unit's fail-states already exist as §4 F1–F7). At most 8 rows, following the
**`docs/specs/unit-ujr1-get-journal.md` §5.7** convention (identical row typings,
class-tally line, and the non-over-strength note). `resolveEnabledZonePanes` is
module-private in `pane-graph.ts`, so its invariants are observed through the
exported `assembleAppGraphEnvelope`/`enabledZonePaneCounts` surface — the register
stays testable and never reaches into host wiring. **Relevance to the sibling
U-PARITY pane group:** the U-PARITY app-graph panes (`doc-nav`, `crosslinks`,
`search`, unit-u-parity-docnav / ·-c19-hover-preview / ·-c18-advanced-search) are
registered panes whose zone placement is governed by exactly these helpers, so a
property that pins the layout resolution also pins where every U-PARITY pane
lands after a visibility toggle.

| Ref | Class | Invariant | Strategy | Checkable proposition (∀ pattern) |
|---|---|---|---|---|
| `P-IM-1` | IM | **The pane-zone model + the mirror constants are stable.** `LayoutZoneName = {left, right, header, footer}`; `LAYOUT_PANE_ZONES` (layout-state.ts:60) covers exactly those four; `SIDEBAR_ZONE === 'sidebar'` (pane-graph.ts:43), `PANE_FRAME_CLASS === 'pane-frame'`, `PANE_COLLAPSED_CLASS === 'is-collapsed'`. After `coerceLayout`, every zone resolution in the pure helpers lands in `LayoutZoneName` — never a junk/stage/top-bar zone. | `strat:zone-constants` | ∀ generated (enabledAppGraph, layout): every key of a `resolveEnabledZonePanes` result is in `{left,right,header,footer}`; `Set(LAYOUT_PANE_ZONES) === {left,right,header,footer}`; `SIDEBAR_ZONE === 'sidebar'`, `PANE_COLLAPSED_CLASS === 'is-collapsed'`, `PANE_FRAME_CLASS === 'pane-frame'`. |
| `P-TP-1` | TP | **`resolveEnabledZonePanes` is total + deterministic over the (registry-enabled × layout) grid.** For any enabled app-graph pane list + any (coerceLayout-valid) `LayoutState`, the result is a FULL `Record<LayoutZoneName, ZonePane[]>` (all four zones present — never a missing key); the SAME inputs always yield the IDENTICAL placement — deterministic output (identical re-call yields the same envelope/paneIds) with a deterministic within-zone sort by `order` then `seq`. (Deliberately NOT claiming "no side effects / no global-state": the F2 unmatched-layout-id path calls `console.warn`, a global write.) | `strat:zone-resolve-total-deterministic` | ∀ generated `(enabledAppGraph, layout)`: the result has exactly the four zone keys and is deep-equal across two immediate calls; each pane's zone is the overlay `entry.zone` when the pane has a layout entry, else `defaultZone` when it is a known zone name, else `'left'` (the fallback); each zone array is ordered by `order` then `seq` ascending. |
| `P-SM-1` | SM | **Zone-membership is exact + disjoint; a disabled pane never appears.** Across all zones, the multiset union of resolved panes equals EXACTLY the enabled app-graph pane set — each enabled app-graph pane lands in exactly its declared zone, never duplicated across zones, and a disabled (or operator-scoped) pane never appears in any zone. | `strat:zone-membership-exact` | ∀ generated state: the pane-id union over all four zones is set-equal to the enabled app-graph id set (disjoint — `Σ zones.length == length(enabledAppGraph)`); every resolved pane is enabled and app-graph scoped; a registered-but-disabled pane id ∉ union. |
| `P-SM-2` | SM | **`enabledZonePaneCounts` is the per-zone census that sums to the enabled set.** `counts[zone] === resolved[zone].length` (a non-negative integer per zone), and `Σ counts[zone] === ` the number of enabled app-graph panes — the SINGLE enabled+placed census backing `is-empty`, minimize acceptance, and the tab count (pane-graph.ts:145–154), not the raw overlay. | `strat:zone-counts-census` | ∀ generated registry+layout: every `counts[zone] ≥ 0`; `counts[zone]` equals the number of resolution-derived panes in that zone; `Σ ZonePanes counts === registry.listByScope('app-graph').filter(isEnabled).length`. |
| `P-SM-3` | SM | **The visibility mirrors are deterministic functions of the layout state.** `is-collapsed` is authored on a pane frame EXACTLY when that pane's resolved `collapsed === true` (pane-graph.ts:244); `is-minimized` on a zone container EXACTLY when `layout.zones[zone].minimized === true` (:324–325); `is-revealed` EXACTLY when the zone is in `revealedZones` (:326); `is-empty` EXACTLY when `zonePanes[zone].length === 0` (:324). Same inputs → the IDENTICAL mirror-class set (`zoneMirrorClasses`, deterministic, no redundant/contradictory classes). | `strat:visibility-mirror-deterministic` | ∀ generated state + `revealedZones ⊆ {left,right,header,footer}`: the assembled `zone:<name>` container carries exactly `is-empty` / `is-minimized` / `is-revealed` **among the pane-mirror classes on the authored path** (additive — a future legitimate extra class is not rejected): `is-minimized` ⟺ `layout.zones[name].minimized`, `is-revealed` ⟺ `name ∈ revealedZones`, `is-empty` ⟺ zero panes in that zone; each pane frame carries `is-collapsed` ⟺ its resolved `collapsed === true`; re-assembling the same state yields the identical classes. |
| `P-TP-2` | TP | **`paneSubtreeRoot` is total over its documented domain.** A non-null `def` + non-null `ctx` + non-empty-string `sidebarZone` → ALWAYS a total `LegacyNodeData` root with `props.id === 'pane-<def.id>'` and `placement.targetPlacement == [zone]`; for `collapsed ∈ {false, true, undefined}` the root ALWAYS carries the U-SHELL-3 frame — the `PANE_FRAME_CLASS` `'pane-frame'` wrapper + the single `PANE_COLLAPSE_HANDLER` control — with `is-collapsed` iff `collapsed === true` (the W2-N5 `collapsed === undefined` no-frame branch was REMOVED, so a 3-arg/undefined caller renders the frame as expanded; the frame is the ONLY code path). A null `def`/`ctx`, an empty `sidebarZone`, or a `render` that returns nothing throws the DOCUMENTED guard error — never an unguarded crash or phantom node (pane-graph.ts:205–211). | `strat:pane-subtree-root-total` | ∀ valid (def, ctx, zone): returns a root with `props.id === 'pane-<def.id>'` + `placement.targetPlacement == [zone]`; ∀ `collapsed ∈ {false,true,undefined}`: the root carries the `PANE_FRAME_CLASS` `'pane-frame'` wrapper + `PANE_COLLAPSE_HANDLER` control, and `is-collapsed` ⟺ `collapsed === true`; ∀ null def / null ctx / empty-string zone / render-returns-nothing: throws `Error('paneSubtreeRoot: …')` — no phantom, no unwrapped TypeError. |

**Class tally:** IM ×1, SM ×3, TP ×2 = **6 rows ≤ 8** ✔.

The rows above are **NOT over-strength**: every proposition is directly observable
from the pinned pure surface (`pane-graph.ts` lines 43–67 [constants],
118–154 [`resolveEnabledZonePanes`+`enabledZonePaneCounts`], 199–253
[`paneSubtreeRoot`], 318–328 [`zoneMirrorClasses`]) or from the pinned
`LayoutState`/`LayoutZoneName` model (`layout-state.ts:16,60`) — none reach into
host wiring (the `onPaneVisibility` seam, the C9 store, the IPC), none invent a
field, and none demand a new seam. They consolidate the §3 placement/mirror states
and the §4 F3 (unknown-id dropped → the disabled-pane-never-appears consequence)
into invariant form rather than adding new fail-state surface. Because every row
faithfully mirrors the landed module's control flow, the register **cannot reject
a correct module**: all six propositions hold on the current `pane-graph.ts`.
The register does **not** expand the unit beyond its §2.4/§2.6 pure-helper set.

## 5.8 Census

- Reuse of U-MENU-1's `IPC_PANE_VISIBILITY` + catalog; new host wiring:
  `onPaneVisibility` subscription → apply/persist/re-derive; the pane-additive
  zone reconcile. 0 new dependencies; no new MCP tool.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C13, C11, §3 (view-menu visibility), §4 G10,
  §5.7 SG3, §6 (no `provident.toggle_pane` tool), §7 Q10/Q11.
- `docs/specs/unit-u-menu-1-application-menus.md`,
  `unit-u-shell-1-layout-zones.md`, `unit-u-shell-4-drag-relocate.md`.
- Build: `src/renderer/pane-registry.ts`, `src/renderer/sidebar-panes.ts`
  (`paneCatalog`/`pushPaneCatalog`), `src/main/preload.ts`
  (`onPaneVisibility`), `src/main/app-menu.ts`, `src/main/operator-settings-store.ts`.

## 7. Delimitation

This unit applies + persists pane visibility and re-derives the zones. It does
NOT build the native menu/catalog IPC (U-MENU-1), the zone model (U-SHELL-1), or
the drag mechanics (U-SHELL-4). It adds **no** MCP tool.

## 8. Open items

**None.** W2-Q5/Q10 RESOLVED (reuse the U-STATE-1 pane reconcile — detach = invisible to MCP; list both scopes) — see `docs/specs/wave-2-open-decisions.md`. `wave-2-open-decisions.md` §E.3 requires the pane-additive no-full-reload discipline be **verified** during implementation (the C10 discipline).
