# Unit U-SHELL-4 — Drag / Reorder / Relocate + Empty-Zone Reveal + Container Minimize (C4, C11, C12) — Spec

**Status:** GREEN — IMPLEMENTED + GATED (2026-09-12). Gate: the
UI-overhaul umbrella gate (PROCEED-WITH-AMENDMENTS, A1). **Depends on
U-SHELL-1** (zones + `LayoutState`) and **U-STATE-1** (node identity must hold
across a drag/drop; SG1 landed). Open items in
`docs/specs/wave-2-open-decisions.md` (W2-Q6/Q7/Q8 — all RESOLVED).

**Cycle (RCA-1/2/3/4/6):** TestWriter red 37 (of 46) → Implementer green 42 pass
+ 4 skip; adversarial pass found H1–H6 (see §2.6) — H1/H2/H3/H4/H6 **FIXED**
with regression tests, H5 documented (§2.5 pin 9); the H1 test assertion amended
with proof. The blind-test gate then surfaced **F2** (self-drop no-op), a
host-side un-hardened regression, subsequently **FIXED** by the host
`commitPaneDrop` no-op + `insertionIndexForPoint` work (see §2.6 and the greens
§F2). Final unit file **49 pass + 4 skip**; full suite **176 files / 4068 pass +
54 skip**, typecheck 0, build OK. **Blind-test**
(`docs/specs/unit-u-shell-4-drag-relocate-greens.md` — **31 scenarios, 31 PASS**;
F2's initial FAIL reconciled) **+ documentation-review**
(`archive/reviews/2026-09-12-u-shell-4-doc-review.md`) gates **DONE**.

---

## 1. What the proposal asks

Utility panes get **handles to drag and rearrange within a sidebar or relocate
between sidebars/header/footer** (C4); an emptied zone **hides** and reveals as
a snap target only when a dragged pane comes near it (C11); a **minimize button**
collapses a zone to a **tab-list** of its panes, vertically for sidebars and
horizontally for header/footer (C12). None exist today.

## 2. Contract (pinned)

### 2.1 Hybrid split (Table B)

| Half | Provident (model / mirror) | Shell (mechanic) |
| --- | --- | --- |
| Handle + drag | the frame/handle node + `on:*` markers; the layout model mutation | pointer capture / drag-image / drop |
| Reorder / relocate (C4) | `PaneLayoutEntry.zone`/`order` mutation (managed write at drop) | continuous pointer stream |
| Empty-zone reveal (C11) | the zone's `is-empty`/`is-revealed` class | proximity detection vs zone bounds + snap threshold |
| Container minimize (C12) | `minimized` state + the tab-strip subtree + expand/select handlers | grid-track collapse + orientation styling |

**The model is always provident/serialized; only the mechanic is external.**
External code commits **one managed write at gesture end / threshold crossing** —
never a per-frame stream.

### 2.2 Reorder / relocate (C4)

- **Pointer-based** shell handles (Q3 default; W2-Q6): reorder within a zone
  (mutate `order`) and relocate across `left`/`right`/`header`/`footer`
  (mutate `zone`). On drop, one `bridge.operatorSettings.set({ layout })` +
  one graph mirror write.
- **Scope legality (Q9 / §5.7 item 7):** an `app-graph` pane may target all four
  zones; an `operator` pane stays in the operator layer (the modal), never the
  MCP-visible app graph. A zone that is illegal for the dragged pane's scope
  does not reveal and does not accept the drop.
- **Stable identity:** the `pane-<id>` root is preserved (relocate = a placement
  change, not destroy+recreate) so MCP targets + rendered-HTML diffs stay valid.

### 2.3 Empty-zone auto-hide + proximity reveal (C11)

- A zone with **zero enabled+placed panes (post-overlay/fallback resolution)**
  hides (its grid track collapses; the stage reclaims the
  space). Emptiness is **derived** from the pane layout — never a stored flag.
- During a drag, if the pointer (or dragged-pane edge) comes within a **snap
  threshold** of a hidden zone's region, that zone **reveals** as a provisional
  drop target (minimum drop area + insertion indicator). Crossing away, or an
  aborted/illegal drop, re-hides it.
- The zone's **last size is retained** in `LayoutState` and restored when it
  next becomes non-empty (pinned; W2-Q7 covers the reset-to-minimum alternative).
- The reveal is **state-derived** (`is-empty`/`is-revealed` → `cssDef`), with a
  **stable zone node** so drop-target wiring + `get_rendered_html` survive.

### 2.4 Container minimize → tab-list (C12)

- Three independent zone states: **expanded** / **minimized** (stored
  `minimized`, still has panes) / **empty-hidden** (derived, C11); plus per-pane
  collapse (U-SHELL-3) as the inner level. A minimized zone is non-empty (C11
  does not apply); an empty-hidden zone has nothing to minimize.
- The zone container carries a **minimize button**; minimizing renders a **tab
  strip** instead of the pane stack. **Orientation is derived:** `left`/`right`
  → vertical tabs; `header`/`footer` → horizontal tabs.
- The tab strip is a **provident subtree**; each tab is a provident node with an
  `on:click` handler that **expands the zone and selects that pane**
  (MCP-dispatchable). The `minimized` field is stored (C9); the retained `size`
  restores on expand.
- A minimized zone still presents its tab strip as a **drop target** and can be
  revealed/expanded by a nearby drag (C11); scope legality gates acceptance.

### 2.5 Pinned implementation details (post-TestWriter, 2026-09-12)

1. **New module `src/renderer/pane-drag.ts`** — the shell pointer drag controller +
   the pure helpers (per §5).
2. **Pinned API** (the Implementer conforms to the red set's usage):
   - `movePane(layout, paneId, zone, order?) : LayoutState` (pure; reorder/relocate;
     adjusts sibling `order`).
   - `legalZonesForScope(scope)` → the legal `LayoutZoneName[]` (an `app-graph`
     pane: all four zones; an `operator` pane: none / the operator layer only).
   - `withinSnapThreshold(pointer, zoneRect, threshold) : boolean`.
   - `insertionIndexForPoint(point, zoneRect, slots) : number` (blind F2 / §3.1;
     maps a drop point to a 0-based within-zone insertion index, so the host drop
     lands where the pointer is rather than always at the zone end).
   - `createDragController({ threshold, scopeOf, onRevealChange })` with
     `start / move / reveal / drop / cancel`.
   - `setZoneMinimized(layout, zone, minimized, paneCount?) : LayoutState` (F5: an
     empty zone ignores minimize).
   - `zoneOrientation(zone) : 'vertical' | 'horizontal'` (F8: unknown → `vertical`).
3. **Assembler reveal input:** `assembleAppGraphEnvelope({ layout, revealedZones? })`
   where `revealedZones?: LayoutZoneName[]` marks the C11 provisional targets.
4. **Tab strip shape:** the zone container carries `data-orientation="vertical"|"horizontal"`;
   each tab is a provident node with `data-pane-id` + an `on:click` handler.
5. **"Selects that pane":** minimizing→tab→click = expand the zone
   (`minimized:false`) + the tab's `data-pane-id` identifies the selected pane;
   live selection is deferred to the skipped battery block (no `LayoutState`
   selection field).
6. **Minimize = REPLACE the pane stack** with the tab strip (not overlay).
7. **One-write-per-crossing** is exposed via the controller's `onRevealChange`
   callback (W2-Q7/F4) — not a per-frame write.
8. **`is-empty` definition (adversarial H1; W2-N6 RESOLVED 2026-09-12):** a zone
   is empty ⇔ **zero enabled+placed panes after overlay/fallback resolution**
   (`zonePanes[zone].length === 0`) — NOT zero overlay entries. A fallback-placed
   (defaultZone/registration-order) pane makes its zone **non-empty**. The
   `is-empty` mirror, the minimize count, and the C12 tab count all use this
   single census.
9. **`drop` acceptance:** the shell guarantees the hit-tested zone; the pure
   `drop` accepts any **scope-legal** zone (documented). `movePane` is reachable
   only through `commitPaneDrop` (not on the bridge), so MCP cannot synthesize a
   drop. `commitPaneDrop` derives the within-zone insertion index from the drop
   point (`insertionIndexForPoint`) and is a **no-op** when the drop leaves the
   pane in its current zone+order (blind F2 — zero writes).

### 2.6 Adversarial findings (2026-09-12)

Post-green read-only adversarial pass; host findings fixed here, no package findings.

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **H1** | medium | **`is-empty` drift (C11):** deriving emptiness from the overlay census marked a zone `is-empty` while it rendered a **fallback-placed** pane. | **FIXED** — mirror derives from the resolved `zonePanes[zone].length` (enabled+placed, post-fallback); `overlayCounts` deleted; the wrong test assertion amended with proof. See §2.5 pin 8. |
| **H2** | medium | **C12 minimize no-op on a fallback-placed zone** (same root cause) — `zoneMinimizeToggle` counted the overlay. | **FIXED** — minimize count uses the same enabled+placed census. |
| **H3** | low | F4 spurious write: a reordered-but-same reveal set emitted 2 `onRevealChange` calls. | **FIXED** — `sameZones` is a set comparison. |
| **H4** | low | Duplicate zone bounds produced a duplicated reveal list. | **FIXED** — `move` de-dupes. |
| **H5** | low | `drop` accepted any scope-legal zone (not requiring revealed). | **DOCUMENTED** — §2.5 pin 9 (the shell hit-tests; not bridge-reachable). |
| **H6** | low | The empty-zone **track-collapse CSS** was absent (C11 §2.3 / U-SHELL-1 §2.4). | **FIXED** — `--zone-*-track` collapses to `0px` for `.is-empty:not(.is-revealed)`; `data-zone` hook added. |

**Blind-test finding (F2) — FIXED (2026-09-12):** the blind run's single FAIL
was the host drop path: `commitPaneDrop` always appended the dragged pane to the
target zone, so a same-zone drop of a non-last pane reordered it (rather than
no-op) and even an already-last self-drop emitted 1 redundant `operatorSettings.set`
write (§4 F2). Fixed by deriving the within-zone insertion index from the
recorded drop point (`insertionIndexForPoint`) and no-op'ing an unchanged
zone+order (`src/renderer/sidebar-panes.ts`); 2 regression tests added. Recorded
in the greens §F2; reconciled to PASS.

**Confirmed-safe:** malformed drag input (unknown ids / NaN/±Inf order / `null` layout) pure + total, no prototype pollution; scope boundary (operator panes cannot reveal/drop/mutate the app-graph layout); relocate identity (no destroy+recreate, no dangling placement); C12 F5/F6/F8; F1/F2/F3/F7; MCP/parity ids (`zone-minimize-<zone>`, `zone-tab-<zone>-<paneId>`) stable + dispatchable; reveal write discipline in the normal path. No package findings.

## 3. States (TestWriter red set — valid paths)

1. Reorder a pane within `left` → its `order` changes; sibling order adjusts;
   node identity stable.
2. Relocate an app-graph pane from `left` to `right` → placement changes; the
   `left` zone sees the pane removed; the `right` zone reorders.
3. Empty `left` (last pane moved out) → the zone renders `is-empty`; its track
   collapses; the stage reclaims the space.
4. Drag near the hidden `left` → it reveals (`is-revealed`) as a drop target;
   move away → it re-hides.
5. Attempt to relocate an operator pane into an app-graph zone → the zone does
   not reveal, the drop is rejected, no state mutation.
6. Minimize `left` → the tab strip renders vertically; tabs list the contained
   panes; clicking a tab expands + selects that pane.
7. Minimize `header` → horizontal tab strip.
8. The `minimized` state + last `size` persist and restore on restart.
9. A drag/drop over a content change (U-STATE-1) preserves `pane-<id>` identity.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | drop on a non-zone area / outside any zone | abort; no state mutation |
| F2 | drop of a pane onto itself | no-op |
| F3 | a scope-illegal target | no reveal, no accept |
| F4 | a snap threshold boundary race (in/out repeatedly) | each crossing is one managed value write; idempotent re-hide |
| F5 | minimize a zone that is already empty | C11 wins (empty-hidden); no tab strip |
| F6 | minimize then relocate the last pane out | zone becomes empty-hidden; `minimized` retained for next non-empty |
| F7 | a malformed drop payload | ignored; never a partial mutation |
| F8 | orientation for an unknown zone | defaults to vertical; never throws |

## 5. Census

- Provident: per-pane handle/frame nodes, the tab-strip subtree + tab
  handlers, the `is-empty`/`is-revealed`/`is-minimized` mirror rules.
- Shell: pointer-based drag controller + the pure model/proximity helpers
  (`movePane`/`legalZonesForScope`/`withinSnapThreshold`/`zoneOrientation`/
  `setZoneMinimized`/`insertionIndexForPoint`), committed as one managed write
  each.
- Reuse of U-SHELL-1 `LayoutState` (`zone`/`order`/`minimized`); 0 new
  dependencies; no `provident-ssr` change.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C4, C11, C12, §2.1 Table B, §3, §7 Q3/Q9, §7.3 OB2.
- `docs/specs/unit-u-shell-1-layout-zones.md`,
  `unit-u-shell-3-collapsible-panes.md`, `unit-u-shell-5-resizable-gutters.md`.
- `docs/specs/unit-u-state-1b-host-application.md` (identity preservation).
- Build: `src/renderer/sidebar-panes.ts`, `src/renderer/pane-graph.ts`,
  `src/renderer/index.html`.

## 7. Delimitation

This unit adds the drag/reorder/relocate gestures, C11 reveal, and C12 minimize.
It does NOT own the layout model/persistence (U-SHELL-1), per-pane collapse
(U-SHELL-3), or gutter resize (U-SHELL-5). It must not change pane body content
or the operator-scope boundary.

## 8. Open items

**None.** W2-Q6/Q7/Q8 RESOLVED (Q6 pointer-based now; HTML5 DnD parked; Q7 restore last size, one write per threshold; Q8 (a) minimized zones stay drop targets) — see `docs/specs/wave-2-open-decisions.md`.
