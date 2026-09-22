# Blind-test Greens — Unit: U-SHELL-N7 — Shell Pointer-Wiring (C4/C7/C11/C12)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** — derived from
  `docs/specs/unit-u-shell-shell-wiring.md` (§2 contract, §2.2 the three NEW pure
  mapping helpers, §2.3 gauge wiring, §2.4 pane-drag wiring, §2.8 source-pinned
  listener surface, §3 valid-path states 1–10, §4 fail-states F1–F11, §5.7 PBT
  register P-IM-1…P-TP-3, §6 owning-spec refs) plus the two owning specs it
  consumes — `docs/specs/unit-u-shell-4-drag-relocate.md` (§2.2 scope legality,
  §2.5 pins 2/8/9, §3.1, §4 F2/F3) and
  `docs/specs/unit-u-shell-5-resizable-gutters.md` (§2.1, §2.3, §2.5 pins 3/5/6).
  **NO implementation read**: `src/renderer/pane-gutter.ts`,
  `src/renderer/pane-drag.ts`, `src/renderer/layout-state.ts`,
  `src/renderer/renderer.ts`, `src/renderer/sidebar-panes.ts` were not read for
  expectations (only the `tests/unit-u-shell-shell-wiring.test.ts` TEST-STRATEGY
  header/imports — the §2.8 source-pin house convention — per the blind-gate
  carve-out). Live module surfaces were discovered by **executing** the modules
  (dynamic import + call); the `renderer.ts` listener layer was asserted by the
  **source-pin** convention (the §2.8 statically-asserted layer), never by
  reading implementation logic.
- **Run file:** a throwaway `tests/__blind_u_shell_wiring.test.ts` (vitest),
  **DELETED after the run**; no persistent `src/**` or `tests/**` change; no
  commit (the artifact is the only commit).
- **Runner invocation:** `npx vitest run tests/__blind_u_shell_wiring.test.ts`
  from the Astrographer repo root.
- **Source under test (LIVE modules):** `src/renderer/pane-gutter.ts`
  (`createGutterController`, `clampGutterSize`, `gutterBounds`, `gutterAxis`,
  `setZoneSize`, `isGutterResizable`, `GUTTER_ZONES`, and the **NEW**
  `gutterSizeForPoint`), `src/renderer/pane-drag.ts` (`createDragController`,
  `movePane`, `withinSnapThreshold`, `zoneOrientation`, `legalZonesForScope`,
  `insertionIndexForPoint`, and the **NEW** `toZoneBounds` / `dropZoneForPoint`),
  `src/renderer/layout-state.ts` (`coerceLayout`, `defaultLayout`,
  `LAYOUT_ZONE_MIN`, `LAYOUT_ZONE_MAX`), and `src/renderer/renderer.ts`
  (source-pin only: `addEventListener('pointerdown|move|up|cancel`, …)`,
  `setPointerCapture`, `getBoundingClientRect`, `installShellPointers`, the
  mapping-helper calls, and a caller for every §2.1 host seam).
- **Result:** **35 PASS / 0 FAIL / 4 NOT-TESTABLE** (4 sub-scenarios require the
  live DOM/browser and are recorded NOT-TESTABLE; their registration surface is
  asserted by the §2.8 source-pin). No package findings; no host regressions.
- **RE-RUN (2026-09-14) on the FIXED §2.8 wiring (HOST-1..5 + ADV1..5 landed):**
  fresh blind re-run against the now-current `src/renderer/renderer.ts` +
  the live pure modules (throwaway
  `tests/__blind_u_shell_wiring_rerun.test.ts`, **deleted after the run**).
  Re-derived every expectation from this spec + this `*-greens.md` record +
  the two owning specs — NO implementation read for expectation logic (the
  §2.8 layer asserted by source-pin only; pure surfaces discovered by
  executing the modules). Result on the fixed code: **35 PASS / 0 FAIL /
  4 NOT-TESTABLE — the tally is UNCHANGED from the original**. The
  F5/F9/F11 + renderer-node-import sub-scenarios remain NOT-TESTABLE (their
  registration surface asserted by the §2.8 source-pin, which passes). **No
  drift; no regression.** One intermediate probe FAIL was a runner-script
  over-specification by the blind-test writer (a per-field read of
  `toZoneBounds` non-finite coercion vs the document-pinned whole-rect P-IM-2
  shape), corrected and re-run PASS — not a doc/spec drift. The three new pure
  mapping helpers are unchanged and still hold; every §2.8 source-pin literal
  (4 pointer listeners / `setPointerCapture` / `getBoundingClientRect` / the 3
  helper calls / the 9 seam callers / `installShellPointers`) is present in
  the current source.

## Legend

- **PASS** — observed behavior matches the spec contract (driven through the live
  pure modules, or statically source-pinned per §2.8).
- **FAIL** — doc/spec drift OR an un-hardened regression (never recorded as a pass).
- **NT** — NOT-TESTABLE in a node run (requires the live DOM/browser); the
  relevant spec is recorded and, where a §2.8 source-pin asserts the surface, the
  source-pin sub-scenario is run as PASS.

## Summary

| # | Scenario | Spec ref | Result |
| --- | --- | --- | --- |
| M1 | `pane-gutter.ts` importable; §2.1 surface present incl. new `gutterSizeForPoint` | §2.1/§2.2 | PASS |
| M2 | `pane-drag.ts` importable; §2.1 surface present incl. new `toZoneBounds`/`dropZoneForPoint` | §2.1/§2.2 | PASS |
| M3 | `layout-state.ts` importable (`coerceLayout`/`defaultLayout`/`LAYOUT_ZONE_MIN`/`MAX`) | §6, U-SHELL-1 | PASS |
| S1 | Gutter `left` resize: map + one commit at end | §3.1, §2.2.1, §2.3 | PASS |
| S2 | Gutter `right`/`header`/`footer` map + one commit each | §3.2, §2.2.1 | PASS |
| S3 | Gutter clamp to bounds; never negative/NaN; `stage.size` untouched | §3.3, §2.2 | PASS |
| S4 | Double-click reset restores registry default once | §3.4, §2.3 | PASS |
| S5 | Pane reorder within a zone (C4); sibling renumber; identity stable | §3.5, §2.4 | PASS |
| S6 | Pane relocate across zones (C4); source renumbers | §3.6, §2.4 | PASS |
| S7 | C11 empty-zone reveal once-per-crossing (idempotent); away re-hides | §3.7, §2.5 | PASS |
| S8 | C12 minimized zone stays a drop target; its gutter inert | §3.8, §2.5 | PASS |
| S9 | Scope legality: operator pane never reveals/accepts app-graph zones | §3.9, §2.4 | PASS |
| S10 | Self-drop no-op (F2): `movePane` at current zone+order is unchanged | §3.10, §2.4 | PASS |
| F1 | Drop outside any zone → `dropZoneForPoint` null → wiring aborts; no mutation | §4 F1, §2.4 | PASS |
| F2 | Drop onto own position → no-op (zero writes / no order change) | §4 F2 | PASS |
| F3 | Scope-illegal drop → no reveal, rejected (`null`), no mutation | §4 F3 | PASS |
| F4 | `pointercancel` → gutter `cancel` reverts / drag `cancel` re-hides with one final write | §4 F4 | PASS |
| F6 | Zero/degenerate rect maps harmlessly; no spurious hit | §4 F6 | PASS |
| F7 | Malformed input → total helpers (`0`/`null`/coerced-`0`); never throw | §4 F7, §2.2 | PASS |
| F8 | Non-resizable gutter → `start` is a no-op | §4 F8, §2.3 | PASS |
| F10 | Unknown gutter `data-zone` → `0`/ignored/`null`; never throw | §4 F10, §5.7 P-IM-1/H-2 | PASS |
| P-IM-1 | `gutterSizeForPoint` total + deterministic + axis-consistent | §5.7 | PASS |
| P-IM-2 | `toZoneBounds` total + deterministic + faithful | §5.7 | PASS |
| P-IM-3 | `clampGutterSize` total + clamped + idempotent | §5.7 | PASS |
| P-SM-1 | `withinSnapThreshold` total proximity predicate | §5.7 | PASS |
| P-SM-2 | `legalZonesForScope` total + fail-closed | §5.7 | PASS |
| P-TP-1 | `dropZoneForPoint` total, geometry-first hit-test (first zone) | §5.7 | PASS |
| P-TP-2 | `zoneOrientation` total + edge-derived | §5.7 | PASS |
| P-TP-3 | `movePane` total + deterministic + self-drop no-op | §5.7, §4 F2 | PASS |
| SP | §2.8 source-pin: 4 pointer listeners / capture / rect / 3 helpers / 9 seams / `installShellPointers` | §2.8, §3(b) | PASS (6 sub-asserts) |
| F5 | `setPointerCapture` fail-soft degrade | §4 F5 | NT — live DOM |
| F9 | `pointerdown` on interactive control → not hijacked | §4 F9, §2.4 | NT — live DOM |
| F11 | absent host → `installShellPointers` no-op, app boots | §4 F11 | NT — browser boot |
| — | `renderer.ts` node-import of `installShellPointers` (browser-only bootstrap) | §2.8 | NT — source-pinned instead |

**Live constants observed (read from live exports, used as expected values):**
`gutterBounds`: `left`/`right` = `{min:160,max:640}`, `header`/`footer` =
`{min:32,max:240}` (matching `LAYOUT_ZONE_MIN`/`MAX` for the side columns);
`defaultLayout().zones.left.size` = `220` (the registry default double-click-reset
value).

---

## §3 Valid paths (§3.1–§3.10)

### M1 / M2 / M3 — module importability (§2.1/§2.2)
**Input:** dynamic `import('../src/renderer/pane-gutter.js')`,
`import('../src/renderer/pane-drag.js')`,
`import('../src/renderer/layout-state.js')`; enumerate the live export namespaces.
**Spec-derived expected:** `pane-gutter.ts` exposes `GUTTER_ZONES`/`gutterAxis`/
`gutterBounds`/`clampGutterSize`/`setZoneSize`/`isGutterResizable`/
`createGutterController` **and the new `gutterSizeForPoint`**; `pane-drag.ts`
exposes `movePane`/`withinSnapThreshold`/`zoneOrientation`/`legalZonesForScope`/
`insertionIndexForPoint`/`createDragController` **and the new `toZoneBounds` /
`dropZoneForPoint`**; `layout-state.ts` exposes the constants/coercers the wiring
round-trips through.
**Observed:** M1 8/8 exports, M2 8/8 exports, M3 all four present → **PASS ×3**.

### S1 (§3.1, §2.2.1) Gutter `left` resize
**Input:** `layoutRect={left:100,top:100,right:700,bottom:500}`; point
`{x:300,y:200}`. `gutterSizeForPoint(layoutRect,'left',{x,y})` then
`createGutterController` `start('left')→move(size)→end()`.
**Spec-derived expected:** maps to `x − left = 200`; ONE commit `('left',200)` at
gesture end; no per-move write.
**Observed:** `{px:200, commits:[{zone:'left',size:200}]}` → **PASS**.

### S2 (§3.2, §2.2.1) Gutter `right` / `header` / `footer`
**Input:** same `layoutRect`; points at `x:400` (right), `y:200` (header),
`y:300` (footer); map + one-commit gesture for each.
**Spec-derived expected:** `right = right−x = 300`, `header = y−top = 100`,
`footer = bottom−y = 200`; each commits its clamped size once.
**Observed:** `{r:300,h:100,f:200}`; commits `[['right',300],['header',100],['footer',200]]`
each one per gesture → **PASS**.

### S3 (§3.3, §2.2.3) Gutter clamp
**Input:** `gutterSizeForPoint` for a pointer far right-of-edge / left-of-edge;
`clampGutterSize` on out-of-range values; a full drag `move(9999)` → `end()`.
**Spec-derived expected:** side columns clamp to `[160,640]`, rows to `[32,240]`;
committed value `640` (max); never negative/NaN; `stage.size` untouched (P4-style).
**Observed:** over `9999`→`640`, under `-50`→`160`, header `9999`→`240`, footer
`1`→`32`; commit `[['left',640]]`; bounds `left/right {160,640}`, `header/footer
{32,240}` → **PASS**.

### S4 (§3.4, §2.3) Double-click reset
**Input:** `createGutterController({onCommit})`; `reset('left')`.
**Spec-derived expected:** restores the registry default size (`220`) and commits
it exactly once.
**Observed:** `{res:220, exp:220, commits:[{zone:'left',size:220}]}` → **PASS**.

### S5 (§3.5, §2.4) Pane reorder within a zone (C4)
**Input:** layout with panes `a(left,0), b(left,1), c(right,0)`; derive the
in-zone insertion index via `insertionIndexForPoint({x:10,y:40}, leftRect, 2)`;
`movePane(layout,'b','left',idx)`.
**Spec-derived expected:** a top-edge drop derives index `0`; `b` reorders to
`(left,0)`, `a` renumbers to `1`; `c` untouched; node ids stay `a,b,c` (identity
stable).
**Observed:** `{idx:0, b:{order:0}, a:{order:1}, orders:'a@left:1 b@left:0 c@right:0'}`
→ **PASS**.

### S6 (§3.6, §2.4) Pane relocate across zones (C4)
**Input:** `insertionIndexForPoint({x:380,y:60}, rightRect, 2)`; `movePane(layout,'a','right',idx)`.
**Spec-derived expected:** `a` lands in `right`; source zone `left` renumbers its
remaining panes; `b` → `(left,0)`; node identity stable.
**Observed:** `{a:{zone:'right',order:0}, left:['b'], b:{order:0}}` → **PASS**.

### S7 (§3.7, §2.5 C11) Empty-zone reveal
**Input:** `createDragController({threshold:24, scopeOf:()=>'app-graph', onRevealChange})`;
`start('a')`; move near an empty `header` zone rect; repeat identical move; move
away.
**Spec-derived expected:** reveals `header` once per crossing; an identical repeat
is idempotent (no dupe); moving away re-hides with one final `[]` write.
**Observed:** `{near1:['header'], near2:['header'], away:[], revealLog:[['header'],[]]}`
→ **PASS**.

### S8 (§3.8, §2.5 C12) Minimized zone stays a drop target; gutter inert
**Input:** `isGutterResizable(false,true)`/`(true,false)`/`(false,false)`;
controller under minimized `isResizable:()=>false`; drag near a minimized/empty
`footer` zone.
**Spec-derived expected:** a minimized or empty zone is **not** resizable
(`isGutterResizable` false → `start` no-op, 0 commits); a scope-legal drag near it
reveals/accepts it (`['footer']`).
**Observed:** `{gutInert:true, gutCommits:0, near:['footer']}` → **PASS**.

### S9 (§3.9, §2.4 scope legality)
**Input:** `legalZonesForScope('operator'|'app-graph')`; an operator-scope drag
controller moved near an app-graph zone; `drop()`.
**Spec-derived expected:** operator → `[]`; app-graph → all four zones; an
operator pane never reveals an app-graph zone and `drop` returns `null`.
**Observed:** `{legalOp:[], legalApp:[left,right,header,footer], revealed:[], drop:null}`
→ **PASS**.

### S10 (§3.10, §2.4 F2) Self-drop no-op (pure)
**Input:** `movePane(layout,'a','left',0)` (a's current position).
**Spec-derived expected:** the result is `deep-equal` to the input; zero writes,
no order change.
**Observed:** `{same:true}` → **PASS**.

---

## §4 Fail-states (§4 F1–F11)

### F1 (§4 F1) Drop outside any zone
**Input:** `dropZoneForPoint({x:750,y:50}, zones, 24)` where the point is outside
every zone's snap band; an operator controller moved there; `drop()`.
**Spec-derived expected:** `dropZoneForPoint` → `null` (the wiring aborts via
`cancelPaneDrag`, per §2.4); no mutation.
**Observed:** `{hit:null}` → **PASS**. (Note: the pure `drop(payload)` itself may
return a scope-legal result once a zone is supplied — per U-SHELL-4 §2.5 pin 9 /
H5, the shell hit-tests and the controller accepts scope-legal zones; the wiring
only reaches `commitPaneDrop` when `dropZoneForPoint` is non-null. `hit === null`
here confirms the abort branch.)

### F2 (§4 F2) Self-drop no-op
**Input:** `movePane(layout,'b','left',1)` (b's current position).
**Spec-derived expected:** zero writes, no order change (deep-equal output).
**Observed:** `{outSame:true}` → **PASS**.

### F3 (§4 F3) Scope-illegal drop
**Input:** operator-scope controller moved near `left`; `drop({paneId, zone:'left'})`.
**Spec-derived expected:** no reveal, `drop` → `null`, no partial mutation.
**Observed:** `{revealed:[], drop:null, revealLog:[]}` → **PASS**.

### F4 (§4 F4) `pointercancel`
**Input:** gutter `start('left')→move(275)→cancel()`; drag `start→move(near)→cancel()`.
**Spec-derived expected:** gutter reverts (0 commits ≤ 1, no lingering active);
drag re-hides with one final `[]` `onRevealChange` write; no partial stream.
**Observed:** `{gutterCommits:[], gutterActive:null, revealedMid:['header'], revealedAfter:[], revealLog:[['header'],[]]}`
→ **PASS**.

### F6 (§4 F6) Zero / degenerate rect
**Input:** `toZoneBounds('left', {0,0,0,0})`; `dropZoneForPoint` / `withinSnapThreshold`
against a zero rect.
**Spec-derived expected:** maps harmlessly (a 0-floored `ZoneBounds`); the snap
predicate and hit-test return false/`null` — no spurious reveal or drop.
**Observed:** `{tb:{zone:'left',0,0,0,0}, hit:null, snap:false}` → **PASS**.

### F7 (§4 F7) Malformed input → total helpers
**Input:** `gutterSizeForPoint` w/ `'bogus'` zone and `NaN` point field;
`toZoneBounds` w/ `null` and `NaN` field; `dropZoneForPoint` w/ empty zones,
`NaN` point, and a negative threshold; `clampGutterSize(left,NaN)`.
**Spec-derived expected:** returns `0` / coerced-`0` `ZoneBounds` / `null` / min
clamp respectively — never throws, never NaN/negative-marker, never a partial
mutation.
**Observed:** `'bogus'→0`, `NaN point→0`, `toZoneBounds(null)→{0-floored}`,
`empty→null`, `NaN point→null`, `threshold -1→null`, `clampGutterSize(NaN)→160`
→ **PASS**.

### F8 (§4 F8) Non-resizable gutter
**Input:** controller with `isResizable:()=>false` (empty zone); `start('left')→move(300)→end()`.
**Spec-derived expected:** no-op — 0 commits, no active gesture.
**Observed:** `{commits:[], active:null}` → **PASS**.

### F10 (§4 F10) Unknown gutter `data-zone`
**Input:** `gutterSizeForPoint(lr,'bogus',…)`; `start('bogus')→move→end()`;
`reset('bogus')`.
**Spec-derived expected:** `0`; `startGutter('bogus')` ignored (0 commits, no
active); `reset('bogus')` → `null` (only an omitted zone falls back, H-2); never
throws.
**Observed:** `{sp:0, commits:[], active:null, reset:null}` → **PASS**.

---

## §5.7 PBT register (P-IM-1 … P-TP-3)

All eight rows run deterministically with fixed inputs on the live exported
helpers/controllers.

| Row | Checked proposition (spec) | Observed | Result |
| --- | --- | --- | --- |
| P-IM-1 | `gutterSizeForPoint`: 4 axes exact formulas, deterministic (deep-equal in/out), unknown/non-finite → `0` | left `150`/`150`, right `250`/`250`, header `160`/`160`, footer `140`/`140`; `'bogus'→0`, `NaN→0` | PASS |
| P-IM-2 | `toZoneBounds`: preserves `zone`, copies finite floats, non-finite/`null` → 0-floored, deep-equal in/out | `{zone:'footer',1.5,2,3,4}`; `null` and `NaN` → 0-floored typed bounds | PASS |
| P-IM-3 | `clampGutterSize`: within `[gutterBounds.min,max]`, non-finite→min, idempotent, never NaN/negative; side `[160,640]`, rows `[32,240]` | all junk clamped & idempotent; bounds observed as spec | PASS |
| P-SM-1 | `withinSnapThreshold`: inside→true, on-edge t=0→true, outside>t→false, monotone in t, non-finite/`0` t → t=0, malformed→false | `inside:true, edgeT0:true, outside:false, malformed:false, nonFiniteT:true, zeroTInside:true` | PASS |
| P-SM-2 | `legalZonesForScope`: app-graph = all four; operator/unknown = `[]`; deterministic | `app:[left,right,header,footer]`, `op:[], unknown:[]` | PASS |
| P-TP-1 | `dropZoneForPoint`: first containing zone, else `null`; empty/non-array/malformed → `null`; deterministic | `first:'header'` (overlap), `noHit:null`, `empty:null` | PASS |
| P-TP-2 | `zoneOrientation`: header/footer→`horizontal`, else→`vertical` | `h:horizontal,f:horizontal,left/right/bogus/null/undefined:vertical` | PASS |
| P-TP-3 | `movePane`: total, deterministic, self-drop no-op, relocate renumbers source+target, unknown id/zone → coerced base | `selfNoOp:true`; relocate `left:[b:0]`, `right:[a:1,c:0]`; `missing`/`bogus` panes unchanged | PASS |

---

## §2.8 Source-pinned listener-registration surface (renderer.ts)

**Prose correction (proofreader, 2026-09-13):** this file records the ORIGINAL
blind run's `35 PASS / 0 FAIL / 4 NT` tally. After that run the dom-shim was
extended (the `ShimElement` + synthetic document now provide
`getBoundingClientRect`/`setPointerCapture`/`releasePointerCapture`/`closest`/
`setRect` + a DELEGATED pointer dispatch), so the LIVE `installShellPointers` is
now node-testable — the §3a adversarial suite
(`tests/unit-u-shell-shell-wiring-adversarial.test.ts`) drives the delegated
listeners in-process. The listener **registration** below is asserted by the
**source-pin** house convention (`readFileSync` on the live
`src/renderer/renderer.ts`, matching `tests/unit-u-shell-shell-wiring.test.ts`
§2.8). All doc-pinned literals are present in the live source:

| Sub-assert | Spec / test pin | Observed |
| --- | --- | --- |
| `addEventListener('pointerdown\|move\|up\|cancel',` (all four) | §2.8 item 1–2 | all true → PASS |
| `setPointerCapture` | §2.8 item 1–2 / §2.6 | PASS |
| `getBoundingClientRect` | §2.8 / §2.6 | PASS |
| `gutterSizeForPoint(` / `toZoneBounds(` / `dropZoneForPoint(` (never inlined) | §2.2 / §2.8 | all true → PASS |
| `startGutter(`/`moveGutter(`/`endGutter(`/`cancelGutter(`/`resetGutter(`/`startPaneDrag(`/`movePaneDrag(`/`commitPaneDrop(`/`cancelPaneDrag(` each has a caller | §2.1 / §2.8 | all 9 true → PASS |
| `installShellPointers` helper exists (wired from renderer boot, §2.8/§2.7) | §2.8 / §2.7 | PASS |

The four-pointer-listener, capture, rect-read, mapping-helper, and 9-seam-caller
sub-asserts each pass; the W2-N7 "`startGutter`/`startPaneDrag` have no caller"
vacancy is removed (each seam literal appears as an invocation in the source).

---

## NOT-TESTABLE sub-scenarios (need the live DOM / browser)

1. **F5 — `setPointerCapture` fail-soft degrade** (`§4 F5`): the degraded
   behavior when capture is absent/throws needs a real captured element in a
   browser. The registration of `setPointerCapture` is **source-pinned PASS**;
   the fail-soft degrade cannot be node-driven. **NT.**
2. **F9 — `pointerdown` on an interactive control inside `.pane-frame` is not
   hijacked** (`§4 F9 / §2.4`): requires insp­ecting the real `event.target`
   chain (`input`/`button`/`a`/`on:*` guard) during a live pointerdown. **NT.**
3. **F11 — absent host → `installShellPointers` no-op, app still boots**
   (`§4 F11`): requires the renderer bootstrap path run with vs. without a
   `SidebarPanes` host (a browser boot). `installShellPointers`'s existence is
   source-pinned PASS. **NT.**
4. **`renderer.ts` node-import of `installShellPointers`**: `renderer.ts` is a
   browser-targeted bootstrap module (DOMContentLoaded + DOM construction); it is
   asserted **source-pinned** (§2.8), not via module import. **NT.**

These four are the **only** sub-scenarios that require the live Electron app.
Everything node-testable — the three new mapping helpers, the existing pure
controllers/seams, the §5.7 register, and every source-pin literal — runs green.

---

## Notes / non-findings

- The probe ran **in-repo** only (a throwaway `tests/__blind_u_shell_wiring.test.ts`,
  **deleted after the run**); no `src/**` or persistent `tests/**` change, no
  `/tmp`, no parent `Projects/`, no `../Preempt-Providence` access.
- Two initial **FAILs were runner-script bugs, not spec drifts** (S2: a `const`
  reassignment in the probe; P-TP-3: a bogus JSON-serialization sanity check).
  Both probe defects were corrected and the scenarios re-ran PASS. No
  doc/spec-drift or regression fail was observed; the final tally is
  **35 PASS / 0 FAIL / 4 NT**.
- **F1 note:** per U-SHELL-4 §2.5 pin 9 (H5), the pure `drop(payload)` accepts any
  scope-legal zone (the shell hit-tests first); the wiring only commits when
  `dropZoneForPoint` is non-null. The `dropZoneForPoint → null` observation
  confirms the F1 abort branch — not a failure.
- No package (`provident-ssr`) findings; no `docs/defects.md` /
  `docs/HANDOFF.md` addition required.
