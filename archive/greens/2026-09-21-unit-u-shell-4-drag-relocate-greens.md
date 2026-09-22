# Blind-test Greens — Unit: U-SHELL-4 — Drag / Reorder / Relocate + C11 Reveal + C12 Minimize

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** — derived from
  `docs/specs/unit-u-shell-4-drag-relocate.md` (§2 contract, §2.5 pins 1–9,
  §2.6 adversarial findings H1–H6, §3 valid states 1–9, §4 fail-states F1–F8,
  §5 census) and `docs/specs/unit-u-shell-1-layout-zones.md` (the `LayoutState`
  / zone / grid contract this unit reuses). **NO implementation read**
  (`src/renderer/pane-drag.ts`, `src/renderer/pane-graph.ts`,
  `src/renderer/sidebar-panes.ts`, `src/renderer/layout-state.ts`) and **NO
  unit-test read** (`tests/unit-u-shell-4-drag-relocate.test.ts`). The live
  module/API surface was discovered only by *executing* the modules (namespace
  enumeration + prototype introspection) to RUN the scenarios; every expected
  value below is derived from the spec, not from the implementation.
- **Run file:** a throwaway `tests/__blind_u_shell_4.test.ts` (vitest),
  **DELETED after the run**; no `src/**` edits; no commit; no new dependencies.
- **Runner invocation:** `npx vitest run tests/__blind_u_shell_4.test.ts` from
  the Astrographer repo root.
- **Source under test (LIVE modules):** `src/renderer/pane-drag.ts`
  (`movePane`/`legalZonesForScope`/`withinSnapThreshold`/`createDragController`/
  `setZoneMinimized`/`zoneOrientation`; `insertionIndexForPoint` was added by the
  post-run F2 fix — see §F2), `src/renderer/pane-graph.ts`
  (`assembleAppGraphEnvelope`, `enabledZonePaneCounts`,
  `PANE_TAB_EXPAND_HANDLER`), `src/renderer/layout-state.ts`,
  `src/renderer/pane-registry.ts`, `src/renderer/runtime.ts`,
  `src/renderer/sidebar-panes.ts` (`commitPaneDrop`/`zoneMinimizeToggle`/
  `paneTabExpand`/`startPaneDrag`/`movePaneDrag`),
  `src/main/operator-settings-store.ts`, `src/shared/dom-shim.ts`, and
  `src/renderer/index.html`.
- **Result:** **31 scenarios — 31 PASS.** F2's initial FAIL was a host-side
  (`src/`) un-hardened regression, subsequently **FIXED** by the
  `commitPaneDrop` no-op + insertion-index work — see §F2. No package findings.

## Legend

- **PASS** — observed behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never recorded as a pass).

## Summary

| # | Scenario | Spec ref | Result |
| --- | --- | --- | --- |
| V1 | Reorder within `left` → order changes, siblings adjust, identity stable | §3.1, §2.2 | PASS |
| V2 | Relocate app-graph pane `left` → `right` | §3.2, §2.2 | PASS |
| V3 | Emptied `left` → `is-empty` + track-collapse CSS | §3.3, §2.3, §2.6 H6 | PASS |
| V4 | Drag near hidden `left` reveals; move away re-hides | §3.4, §2.3 | PASS |
| V5 | Operator pane → app-graph zone: no reveal, rejected, no mutation | §3.5, §2.2, §2.5 pin 2 | PASS |
| V6 | Minimize `left` → vertical tab strip; tab click expands | §3.6, §2.4 | PASS |
| V7 | Minimize `header` → horizontal tab strip | §3.7, §2.4 | PASS |
| V8 | `minimized` + last `size` persist and restore | §3.8, §2.4 | PASS |
| V9 | Drag/drop over a content change keeps `pane-<id>` identity | §3.9, §2.2 | PASS |
| F1 | Drop outside any zone → abort, no mutation | §4 F1 | PASS |
| F2 | Drop a pane onto itself → no-op | §4 F2, §2.5 pin 9 | PASS (reconciled — see §F2) |
| F3 | Scope-illegal target → no reveal, no accept | §4 F3 | PASS |
| F4 | Snap-boundary race → one write per crossing, idempotent re-hide | §4 F4 | PASS |
| F5 | Minimize an already-empty zone → C11 wins, no tab strip | §4 F5 | PASS |
| F6 | Minimize then relocate last pane out → empty-hidden, `minimized` retained | §4 F6 | PASS |
| F7 | Malformed drop payload → ignored, no partial mutation | §4 F7 | PASS |
| F8 | Unknown-zone orientation → `vertical`, never throws | §4 F8 | PASS |
| P1 | `src/renderer/pane-drag.ts` exports the six pinned helpers | §2.5 pin 1 | PASS |
| P2 | Pinned API shapes (`movePane`/`setZoneMinimized`/`zoneOrientation`/`withinSnapThreshold`/controller) | §2.5 pin 2 | PASS |
| P3 | Assembler `revealedZones?` input marks `is-revealed` | §2.5 pin 3 | PASS |
| P4 | Tab strip shape (`data-orientation`, `data-pane-id`, `on:click`) | §2.5 pin 4 | PASS |
| P5 | Tab click expands; `data-pane-id` identifies selection; no selection field | §2.5 pin 5 | PASS |
| P6 | Minimize REPLACES the pane stack with the tab strip | §2.5 pin 6 | PASS |
| P7 | One write per reveal crossing via `onRevealChange` | §2.5 pin 7 | PASS |
| P8 | `is-empty` from resolved enabled+placed census (fallback counts) | §2.5 pin 8 | PASS |
| P9 | `drop` pure; `movePane` only via `commitPaneDrop`, not the bridge | §2.5 pin 9 | PASS |
| H1 | `is-empty` drift: fallback-placed pane makes its zone non-empty | §2.6 H1, §2.5 pin 8 | PASS |
| H2 | C12 minimize is not a no-op on a fallback-placed zone | §2.6 H2 | PASS |
| H3 | Reordered-but-same reveal set → one `onRevealChange` call | §2.6 H3 | PASS |
| H4 | Duplicate zone bounds de-duped in the reveal list | §2.6 H4 | PASS |
| H6 | Empty-zone track-collapse CSS + `data-zone` hook present | §2.6 H6 | PASS |

---

## §3 Valid paths

### V1 (§3.1, §2.2) Reorder within `left`
**Input:** canonical 0-based layout `a@left#0, b@left#1, c@left#2`; call
`movePane(layout, 'a', 'left', 2)`; assemble the result.
**Spec-derived expectation:** `a`'s `order` changes (it becomes last); sibling
orders adjust to a permutation of the remaining slots; the `pane-a` root
identity is preserved; payload order reflects the new order.
**Observed:** `a@left#2,b@left#0,c@left#1`; `pane-a` identity stable; payload
order `["pane-b","pane-c","pane-a"]`; `pane-a` placement still
`{"targetPlacement":["left"]}`. (Numeric observation: `movePane` treats the
`order` argument as a **0-based insertion index** and re-emits the zone's
orders as contiguous 0-based indices; the spec does not pin the numeric base —
it pins "order changes; siblings adjust".)
**Result:** PASS

### V2 (§3.2, §2.2) Relocate an app-graph pane from `left` to `right`
**Input:** `a@left#0, b@left#1, c@right#0`; call
`movePane(layout, 'a', 'right', 1)`; assemble the result.
**Spec-derived expectation:** placement changes; `left` no longer contains `a`;
`right` reorders; `pane-a` targets `right`.
**Observed:** `a@right#1,b@left#0,c@right#0`; left panes `["b"]`;
`pane-a` placement `{"targetPlacement":["right"]}`.
**Result:** PASS

### V3 (§3.3, §2.3, §2.6 H6) Empty `left` → `is-empty` + track collapse
**Input:** layout placing the only pane `a` in `right`; assemble; inspect
`src/renderer/index.html`.
**Spec-derived expectation:** the emptied `left` carries `is-empty`; the shell
track collapses (`--zone-*-track` → `0px` for `.is-empty:not(.is-revealed)`,
per H6) and the stage reclaims the space; the zone node itself is stable.
**Observed:** `left` classes `["is-empty"]`; populated `right` classes `[]`;
`index.html` contains `.is-empty:not(.is-revealed)` and a `--zone-left-track`
(and `--zone-right/header/footer-track`) declaration. (Computed grid geometry
is not node-observable — see "not tested".)
**Result:** PASS

### V4 (§3.4, §2.3) Drag near a hidden `left` reveals; moving away re-hides
**Input:** `createDragController({threshold:24, scopeOf, onRevealChange})`;
`start('a')`; `move({x:10,y:10}, [{zone:'left',left:0,top:0,right:300,bottom:100}])`
(near); then `move({x:5000,y:5000}, …)` (away). Also assemble with
`revealedZones:['left']`.
**Spec-derived expectation:** the near move reveals `left` as a provisional
target (`is-revealed`); crossing away re-hides it; each crossing is one
`onRevealChange` write.
**Observed:** near `reveal()` → `["left"]`; away → `[]`; callback sequence
`[["left"],[]]`; assembled `left` classes `["is-empty","is-revealed"]`.
**Result:** PASS

### V5 (§3.5, §2.2, §2.5 pin 2) Operator pane cannot enter an app-graph zone
**Input:** `legalZonesForScope('operator')`; a controller whose `scopeOf`
returns `operator` for `op1`; `start('op1')`; `move` near `right`;
`drop({zone:'right', paneId:'op1'})`; and the host path
`startPaneDrag('op1')` → `movePaneDrag` near `right` → `commitPaneDrop(...)`.
**Spec-derived expectation:** an operator pane has no legal app-graph zone
(`legalZonesForScope('operator')` is empty); the zone does not reveal; the drop
is rejected; no state mutation.
**Observed:** `legalZonesForScope('operator') === []`, `('app-graph') ===
['left','right','header','footer']`; reveal `[]`, callback `[]`, `drop` `null`;
host `op1` stayed `op1@left#0` with **0** `operatorSettings.set` writes.
**Result:** PASS

### V6 (§3.6, §2.4) Minimize `left` → vertical tab strip; tab click expands
**Input:** layout `a@left#0, b@left#1` with `left.minimized:true`; assemble;
host `paneTabExpand('left','b')`.
**Spec-derived expectation:** the zone renders a **vertical** tab strip listing
its panes (each tab a provident node with `data-pane-id` + an `on:click`
handler), the pane stack is replaced; clicking a tab expands the zone
(`minimized:false`) and identifies the selected pane by `data-pane-id`.
**Observed:** `left` classes `["is-minimized"]`,
`data-orientation:"vertical"`; tabs
`zone-tab-left-a{paneId:"a", handler:"pane-tab-expand"}` and
`zone-tab-left-b{paneId:"b", …}`; no `pane-a` root under the zone; after
`paneTabExpand('left','b')` → `left.minimized:false` with 1 write.
**Result:** PASS

### V7 (§3.7, §2.4) Minimize `header` → horizontal tab strip
**Input:** layout `d@header#0` with `header.minimized:true`; assemble.
**Spec-derived expectation:** orientation is derived from the zone; `header`
renders **horizontal** tabs.
**Observed:** `header` `data-orientation:"horizontal"`; tab `zone-tab-header-d`.
**Result:** PASS

### V8 (§3.8, §2.4) `minimized` + last `size` persist and restore on restart
**Input:** `createOperatorSettingsStore({path})` → `set({layout})` with
`left {size:333, minimized:true}`; a **new** store on the same path → `get()`.
**Spec-derived expectation:** `minimized` (stored, C9) and the retained `size`
round-trip and restore on restart.
**Observed:** restarted store `layout.zones.left === {size:333, minimized:true}`.
**Result:** PASS

### V9 (§3.9, §2.2) `pane-<id>` identity across a content change and a relocate
**Input:** assemble the same registry/layout against two traversal envelopes
with different content (`content-docA` vs `content-docB`); then
`movePane(layout,'a','right',0)` and assemble again.
**Spec-derived expectation (U-STATE-1 preservation):** the `pane-<id>` root is
preserved — relocate is a placement change, not destroy+recreate — so identity
is stable across content change and across a drag/drop.
**Observed:** `pane-a` id present in both content variants and after relocation
(`["pane-a","pane-a","pane-a"]`).
**Result:** PASS

---

## §4 Fail-states / edge cases

### F1 (§4 F1) Drop on a non-zone area / outside any zone → abort
**Input:** controller `drop({zone:'stage', paneId:'a'})`, `drop({zone:'bogus',
paneId:'a'})`, `drop(null)`.
**Spec-derived expectation:** abort; no state mutation; `stage` is a region,
not a pane zone.
**Observed:** all three → `null` (rejected); no mutation.
**Result:** PASS

### F2 (§4 F2, §2.5 pin 9) Drop of a pane onto itself → no-op — **PASS (reconciled)**
**Input (pure):** canonical `a@left#0,b@left#1`; `movePane(layout,'a','left',0)`
(`a`'s own index). **Input (host, the only reachable drop path per pin 9):**
`startPaneDrag('a')`; `movePaneDrag({x:10,y:1}, [{zone:'left',left:0,top:0,
right:300,bottom:100}])` (pointer at the very top of `left`, i.e. on `a`'s own
position); `commitPaneDrop({zone:'left', paneId:'a'})`.
**Spec-derived expectation (§4 F2):** dropping a pane onto itself is a
**no-op** — no order change, and no managed write.
**Observed (pure):** `movePane(l,'a','left',0)` → `a@left#0,b@left#1`
(unchanged). **Observed (host, post-fix):** `a` stays `a@left#0`, `b` stays
`b@left#1`, and **0** `operatorSettings.set` writes.
**Result:** **PASS** (reconciled).
**Reconciliation / doc-drift history:** the initial blind run recorded this as
the single **FAIL**: the pure `movePane` correctly no-opped when given the
pane's own order, but the host drop path did not compute/compare the pane's
current position — `commitPaneDrop` always appended the dragged pane to the end
of the target zone, so a same-zone drop of a non-last pane reordered it to last
(and even the already-last pane emitted 1 redundant write), verified across
pointer `y ∈ {1,25,50,75,99}`. The Architect ruled this a genuine host-side
un-hardened regression (not doc drift), and the Implementer fixed it: the host
drop path now derives the within-zone insertion index from the recorded drop
point (`insertionIndexForPoint`, a new pure helper — spec §2.5 pin 2) and
**no-ops when the drop leaves the pane in its current zone+order**
(`sidebar-panes.ts:1849-1855`), so a self-drop emits zero writes. Two
regression tests were added
(`tests/unit-u-shell-4-drag-relocate.test.ts`, the F2 host self-drop +
within-zone insertion index cases); the unit file is **49 pass + 4 skip** and
the full suite **176 files / 4068 pass + 54 skip**. The observed host behavior
now matches §4 F2, so F2 is **PASS**.

### F3 (§4 F3) A scope-illegal target → no reveal, no accept
**Input:** controller with `scopeOf → 'operator'`; `start('op1')`; `move` near
`left`; `drop({zone:'left', paneId:'op1'})`.
**Spec-derived expectation:** no reveal, no accept.
**Observed:** reveal `[]`; `drop` `null`.
**Result:** PASS

### F4 (§4 F4) Snap-threshold boundary race → one write per crossing
**Input:** `move` near `left`, then far, then near again.
**Spec-derived expectation:** each crossing is one managed value write; the
in/out/in sequence yields exactly three `onRevealChange` calls; re-hide is
idempotent.
**Observed:** `onRevealChange` calls `[["left"],[],["left"]]` (3 calls, 1 per
crossing).
**Result:** PASS

### F5 (§4 F5) Minimize a zone that is already empty → C11 wins
**Input:** `setZoneMinimized(layoutOf([]), 'left', true, 0)`; assemble.
**Spec-derived expectation:** an empty zone ignores minimize; no tab strip;
`is-empty` (C11) applies.
**Observed:** `left.minimized:false`; assembled classes `["is-empty"]`; zone
children count `0` (no tab strip).
**Result:** PASS

### F6 (§4 F6) Minimize then relocate the last pane out
**Input:** `a@left#0` with `left.minimized:true`; `movePane(layout,'a','right',0)`;
assemble.
**Spec-derived expectation:** the zone becomes empty-hidden; `minimized` is
retained for the next non-empty state.
**Observed:** `moved.zones.left === {size:220, minimized:true}`; `a@right#0`;
assembled `left` classes `["is-empty","is-minimized"]` (empty-hidden via
`is-empty`; `minimized` retained).
**Result:** PASS

### F7 (§4 F7) A malformed drop payload → ignored, never partial mutation
**Input:** `drop({zone:'right'})` (no `paneId`), `drop(undefined)`, `drop(42)`;
`movePane(l, 'a', 'bogus')`, `movePane(l, 'ghost', 'right')`.
**Spec-derived expectation:** malformed payloads are ignored; the layout is
never partially mutated.
**Observed:** all three drops → `null`; `movePane` with an unknown zone or an
unknown pane id returns the layout unchanged; the input layout JSON is
byte-identical before/after.
**Result:** PASS

### F8 (§4 F8) Orientation for an unknown zone → vertical, never throws
**Input:** `zoneOrientation('unknown-zone')`.
**Spec-derived expectation:** defaults to `vertical`; never throws.
**Observed:** `"vertical"`, no throw.
**Result:** PASS

---

## §2.5 Pins

### P1 (§2.5 pin 1) New module `src/renderer/pane-drag.ts` exports the helpers
**Input:** module namespace of `src/renderer/pane-drag.ts`.
**Spec-derived expectation:** the module exists and exports `movePane`,
`legalZonesForScope`, `withinSnapThreshold`, `createDragController`,
`setZoneMinimized`, `zoneOrientation`.
**Observed (at the blind run):** exports exactly
`["createDragController","legalZonesForScope","movePane","setZoneMinimized","withinSnapThreshold","zoneOrientation"]`.
The post-run F2 fix adds a seventh export,
`insertionIndexForPoint` (see §F2 / spec §2.5 pin 2), so the current module
exports all seven pinned helpers.
**Result:** PASS

### P2 (§2.5 pin 2) Pinned API shapes
**Input:** call each helper; inspect the controller returned by
`createDragController({threshold, scopeOf, onRevealChange})`.
**Spec-derived expectation:** `movePane(layout,paneId,zone,order?)`;
`legalZonesForScope(scope)`; `withinSnapThreshold(pointer,zoneRect,threshold)`;
`createDragController({…})` → `{start,move,reveal,drop,cancel}`;
`setZoneMinimized(layout,zone,minimized,paneCount?)`;
`zoneOrientation(zone)`.
**Observed:** arities `movePane/4, setZoneMinimized/4, zoneOrientation/1,
withinSnapThreshold/3, createDragController/1`; controller methods
`["cancel","drop","move","reveal","start"]`; `withinSnapThreshold` returns
`true` for a point inside `{left,top,right,bottom}` and `false` for a far point.
**Result:** PASS

### P3 (§2.5 pin 3) Assembler `revealedZones?` input
**Input:** `assembleAppGraphEnvelope({registry, ctx, traversalEnvelope, layout,
revealedZones:['left']})` vs the same without `revealedZones`.
**Spec-derived expectation:** `revealedZones` marks the C11 provisional targets
(`is-revealed` on the zone container).
**Observed:** with → `["is-empty","is-revealed"]`; without → `["is-empty"]`.
**Result:** PASS

### P4 (§2.5 pin 4) Tab strip shape
**Input:** assembled minimized `left` zone.
**Spec-derived expectation:** the zone container carries
`data-orientation="vertical"|"horizontal"`; each tab is a provident node with
`data-pane-id` + an `on:click` handler.
**Observed:** `data-orientation:"vertical"`; tab `zone-tab-left-a` with
`data-pane-id:"a"` and a handler event `"click"`.
**Result:** PASS

### P5 (§2.5 pin 5) "Selects that pane"
**Input:** host `paneTabExpand('left','b')` on a minimized `left`.
**Spec-derived expectation:** minimizing → tab → click expands the zone
(`minimized:false`); the tab's `data-pane-id` identifies the selected pane; live
selection is deferred (no `LayoutState` selection field).
**Observed:** `left.minimized:false`; the tab carries `data-pane-id:"b"`;
`'selection' in host.layout === false`.
**Result:** PASS

### P6 (§2.5 pin 6) Minimize REPLACES the pane stack (not overlay)
**Input:** assembled minimized `left` zone children.
**Spec-derived expectation:** the pane roots are replaced by the tab strip.
**Observed:** children ids `["zone-minimize-left","zone-tab-left-a"]` — no
`pane-a` root under the zone; tabs present.
**Result:** PASS

### P7 (§2.5 pin 7) One write per crossing via `onRevealChange`
**Input:** a near move followed by a second near move (same reveal set).
**Spec-derived expectation:** the one-write-per-crossing discipline is exposed
through `onRevealChange`; a same-set repeat emits no extra call.
**Observed:** exactly **1** `onRevealChange` call.
**Result:** PASS

### P8 (§2.5 pin 8) `is-empty` from the resolved enabled+placed census
**Input:** empty `layout.panes` with a registry pane whose `defaultZone:'left'`
(fallback-placed); assemble; `enabledZonePaneCounts(registry, layout)`.
**Spec-derived expectation:** a fallback-placed pane makes its zone
**non-empty**; the mirror, minimize count, and tab count all use the single
enabled+placed census (not the overlay).
**Observed:** `left` classes `[]` (not `is-empty`); counts
`{left:1,right:0,header:0,footer:0}`.
**Result:** PASS

### P9 (§2.5 pin 9) `drop` pure; `movePane` only via `commitPaneDrop`
**Input:** host instance + bridge.
**Spec-derived expectation:** the pure `drop` accepts any scope-legal zone; the
`movePane` helper is reachable only through the host `commitPaneDrop` method,
never on the bridge.
**Observed:** `typeof host.commitPaneDrop === "function"`;
`typeof host.movePane === "undefined"`;
`typeof host.bridge.operatorSettings.movePane === "undefined"`.
**Result:** PASS

---

## §2.6 Adversarial regressions

### H1 (§2.6 H1, §2.5 pin 8) `is-empty` drift on a fallback-placed pane
**Input:** empty `layout.panes`; registry pane `a` with `defaultZone:'left'`;
assemble; `enabledZonePaneCounts`.
**Spec-derived expectation (post-fix):** `is-empty` derives from the resolved
`zonePanes[zone].length` (enabled+placed, post-fallback), so a fallback-placed
pane makes `left` non-empty; no `overlayCounts`.
**Observed:** `left` classes `[]`; counts `.left === 1`.
**Result:** PASS

### H2 (§2.6 H2) C12 minimize on a fallback-placed zone is not a no-op
**Input:** empty `layout.panes`; registry pane `a` with `defaultZone:'left'`;
host `zoneMinimizeToggle('left')`.
**Spec-derived expectation (post-fix):** the minimize count uses the same
enabled+placed census, so the toggle actually minimizes and emits one write.
**Observed:** `left === {size:220, minimized:true}` with **1** write.
**Result:** PASS

### H3 (§2.6 H3) Reordered-but-same reveal set emits one call
**Input:** `move` near `left`+`right`, then `move` again with the same two
zones in reversed bounds order.
**Spec-derived expectation (post-fix):** `sameZones` is a set comparison, so a
same-set reorder is **not** a new crossing → no extra write.
**Observed:** exactly **1** `onRevealChange` call.
**Result:** PASS

### H4 (§2.6 H4) Duplicate zone bounds de-duped
**Input:** `move` with `[{zone:'left',…},{zone:'left',…}]` (duplicate).
**Spec-derived expectation (post-fix):** `move` de-dupes, so the reveal list
contains `left` once.
**Observed:** calls `[["left"]]` (single `left`).
**Result:** PASS

### H6 (§2.6 H6) Empty-zone track-collapse CSS + `data-zone` hook
**Input:** `src/renderer/index.html`.
**Spec-derived expectation (post-fix):** `--zone-*-track` collapses to `0px` for
`.is-empty:not(.is-revealed)`; a `data-zone` hook exists.
**Observed:** `hasCollapse:true`, `hasTrack:true`, `hasDataZone:true`.
**Result:** PASS

---

## Spec statements not tested (and why)

1. **§2.4 / §3.3 "the stage reclaims the space"; §2.3 grid track collapse
   geometry** — computed CSS grid geometry is a live-renderer/DOM surface, not
   node-observable. Only the *inputs* were asserted (the `is-empty`/`is-revealed`
   mirror classes, V3/V4/P3, and the presence of the `--zone-*-track` collapse
   rule + `data-zone` hook, V3/H6). The geometry itself is the U-SHELL-1/5 grid
   concern.
2. **§3.6 "MCP-dispatchable" live `provident.dispatch` on the tab nodes** — the
   pin-4 node shape (a provident node with `data-pane-id` and an `on:click`
   handler body calling `paneTabExpand`) was asserted at the node level, and the
   handler *effect* was exercised via the host method `paneTabExpand`. The live
   `dispatch`/`list_targets` route against a running graph is the skipped
   live-runtime battery (the U-SHELL-1/3 convention); the running MCP host
   exposes the shell demo, not the Astrographer app graph.
3. **§2.2 "one `bridge.operatorSettings.set({layout})` + one graph mirror write"
   for the relocate** — the host write-through seam was exercised for minimize
   (V6/P5/H2) and setLayout (persist V8), and the pure `movePane` result +
   assembly placement were asserted (V1/V2/V9/F2). The exact "one bridge write
   + one mirror write" pairing on a successful relocate was not separately
   counted as a graph-mirror write (no live host boot in the node environment).
4. **§2.2 scope-boundary "an `operator` pane stays in the operator layer (the
   modal)"** — the isolation of the operator *graph scope* is owned by
   `OPERATOR-ISOLATED-GRAPHSCOPE` (U-SHELL-1 / U-SHELL-3); this run asserted the
   U-SHELL-4 gate (`legalZonesForScope('operator') === []`, no reveal, rejected
   drop, zero writes — V5/F3).
5. **§2.6 "Confirmed-safe" hostile-input items not individually re-derived**
   (prototype pollution / `__proto__`/`constructor`, unknown ids, `null` layout,
   rapid toggles, package-surface parity) — the task scoped this run to the
   §3 paths, F1–F8, pins 1–9, and H1/H2/H3/H4/H6. The total/no-throw property
   was partially observed (F7: malformed drops and unknown zone/pane ids are
   total and non-mutating), but the full hostile-input battery was not run.
6. **§2.5 pin 9 "the shell guarantees the hit-tested zone"** — true hit-testing
   (pointer geometry → zone) is a live DOM/battery surface. The pure `drop`
   acceptance and the host `commitPaneDrop` route were exercised; the
   geometry-to-zone hit-test itself was not. (The F2 fix means the host now
   consumes the recorded drop point — it derives the within-zone insertion index
   via `insertionIndexForPoint` — but the geometry-to-zone hit-test that selects
   the zone in the first place remains a live DOM concern.)
7. **H5** — §2.6 H5 is **DOCUMENTED** (not fixed): `drop` accepts any scope-legal
   zone without requiring it be revealed; per §2.5 pin 9 this is intentional and
   not bridge-reachable. It is a documented disposition, not a scenario; the
   pure `drop` behavior it describes was observed (P9/V5), and no tab
   `is-revealed` precondition was asserted as required.
