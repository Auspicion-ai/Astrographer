# Blind-test Greens — Unit: U-SHELL-5 — Resizable Gutters (C7)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** — derived from
  `docs/specs/unit-u-shell-5-resizable-gutters.md` (§2 contract, §2.5 pins 1–7,
  §3 valid states 1–7, §4 fail-states F1–F6, §5 census) plus the four
  adversarial regressions **H-1/H-2/H-3/H-4** named by the unit's adversarial
  pass (recorded in the unit spec **§2.6** as of the 2026-09-12 doc review).
  **NO implementation read**
  (`src/renderer/pane-gutter.ts`, `src/renderer/layout-state.ts`,
  `src/renderer/sidebar-panes.ts`, `src/renderer/index.html` were not read for
  expectations) and **NO unit-test read** for expected values
  (`tests/unit-u-shell-5-resizable-gutters.test.ts`). The live module/API
  surface was discovered only by *executing* the modules (dynamic import +
  call) to RUN the scenarios; every expected value below is spec-derived, and
  the numeric bounds where the spec points at already-landed constants
  (`LAYOUT_ZONE_MIN` / `LAYOUT_ZONE_MAX`, `defaultLayout().zones[].size`) are
  read from those **live exported constants**, not from the implementation
  body.
- **Run file:** a throwaway `tests/__blind_u_shell_5.test.ts` (vitest),
  **DELETED after the run**; no `src/**` edits; no commit; no new dependencies.
- **Path confinement:** all temp state was created **in-repo** under
  `tests/.ushell5-probe/` (never `/tmp`); the probe dir was removed after the run.
- **Runner invocation:** `npx vitest run tests/__blind_u_shell_5.test.ts` from
  the Astrographer repo root.
- **Source under test (LIVE modules):** `src/renderer/pane-gutter.ts`
  (`createGutterController`, `clampGutterSize`, `gutterBounds`, `setZoneSize`,
  `isGutterResizable`, `gutterAxis`, `GUTTER_ZONES`),
  `src/renderer/layout-state.ts` (`LAYOUT_ZONE_MIN`, `LAYOUT_ZONE_MAX`,
  `defaultLayout`, `coerceLayout`, `layoutCssVars`),
  `src/main/operator-settings-store.ts` (`createOperatorSettingsStore`),
  `src/renderer/sidebar-panes.ts` (`SidebarPanes.resetGutter`),
  plus `src/shared/dom-shim.ts`, `src/renderer/pane-registry.ts`,
  `src/renderer/edit-controller.ts`, and `src/renderer/index.html`.
- **Result:** **24 scenarios — 24 PASS.** No package findings; no host
  regressions. (The post-green adversarial H-1/H-2/H-3/H-4 fixes are recorded in
  the unit spec §2.6; **H-5** — the shell pointer wiring gap — is recorded there
  as **W2-N7 (OPEN, MEDIUM)**, see "not testable" #1.)

## Legend

- **PASS** — observed behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never recorded as a pass).

## Summary

| # | Scenario | Spec ref | Result |
| --- | --- | --- | --- |
| V1 | Drag `left`\|`stage` → `left.size` commits once at end; track resizes | §3.1, §2.1, §2.2 | PASS |
| V2 | Drag `stage`\|`right` → `right.size` commits once at end | §3.2, §2.2 | PASS |
| V3 | Drag below the minimum → clamped commit; stage keeps a minimum | §3.3, §2.2 | PASS |
| V4 | Size round-trips through `operatorSettings.set`/`get`, restores on reload | §3.4, §2.2 | PASS |
| V5 | Exactly one settings write per gesture (no per-move write) | §3.5, §2.1 | PASS |
| V6 | Empty zone has no gutter; minimized zone is not resizable | §3.6, §2.3 | PASS |
| V7 | Header/footer rows resize (height) with the same one-commit model | §3.7, §2.2 | PASS |
| F1 | NaN/negative size on restore → fail-soft to the default track | §4 F1 | PASS |
| F2 | Pointer cancel → last valid commit or revert; no partial stream | §4 F2, §2.5 pin 6 | PASS |
| F3 | Drag over an empty/minimized zone → no-op | §4 F3, §2.3 | PASS |
| F4 | In-flight render → one queued write per gesture; no interleave | §4 F4 | PASS |
| F5 | Unknown zone key → ignored; never throws | §4 F5 | PASS |
| F6 | Settings write failure → in-memory size still applies | §4 F6 | PASS |
| P1 | `src/renderer/pane-gutter.ts` is importable | §2.5 pin 1 | PASS |
| P2 | Pinned API surface exists | §2.5 pin 2 | PASS |
| P3 | Side clamp = `LAYOUT_ZONE_MIN`/`MAX`; row bounds finite positive; never NaN/negative | §2.5 pin 3, §2.2 | PASS |
| P4 | A zone commit leaves `stage.size` untouched | §2.5 pin 4 | PASS |
| P5 | Double-click reset restores the registry default (one commit) | §2.5 pin 5, §2.2 | PASS |
| P6 | `cancel` commits last valid or reverts; at most one commit | §2.5 pin 6 | PASS |
| P7 | `index.html` gutter geometry reads C1 `--border`/`--hover` | §2.5 pin 7, §2.4 | PASS |
| H-1 | `reset` on a non-resizable zone is a no-op; host writes 0 | adversarial (see §2.3) | PASS |
| H-2 | `reset(bad-zone)` ignored; in-flight gesture intact | adversarial (see §4 F5) | PASS |
| H-3 | Non-boolean falsy resizability result refuses the gesture | adversarial (see §2.3) | PASS |
| H-4 | `start` over an active gesture resolves the prior; deterministic commits | adversarial (see §2.1) | PASS |

**Live constants observed (read from live exports, used as expected values):**
`LAYOUT_ZONE_MIN = 160`, `LAYOUT_ZONE_MAX = 640`;
`gutterBounds`: `left`/`right` = `{min:160,max:640}`, `header`/`footer` =
`{min:32,max:240}`; `defaultLayout().zones[]`: `left`/`right` = `220`,
`header`/`footer` = `48`.

---

## §3 Valid paths

### V1 (§3.1, §2.1, §2.2) Drag the `left`|`stage` gutter
**Input:** `createGutterController({ onCommit })`; `start('left')`; `move(240)`,
`move(280)`, `move(300)`; `end()`; then `setZoneSize(layout, 'left', 300)` and
`layoutCssVars(...)`.
**Spec-derived expected:** intermediate moves do **not** write; at gesture end
exactly **one** commit `('left', 300)`; `LayoutState.zones.left.size` becomes
`300`; the projected CSS var `--zone-left-size` becomes `300px`.
**Observed:** `{midWrites:0, writes:1, committed:300, size:300, css:"300px"}` → **PASS**.

### V2 (§3.2, §2.2) Drag the `stage`|`right` gutter
**Input:** `start('right')`; `move(260)`, `move(320)`; `end()`.
**Spec-derived expected:** exactly one commit `('right', 320)` at end.
**Observed:** `[["right",320]]` → **PASS**.

### V3 (§3.3, §2.2) Drag below the minimum
**Input:** `start('left')`; `move(2)`; `end()` → committed value; then
`setZoneSize` on a layout with `stage.size = 640`.
**Spec-derived expected:** the committed size is the **clamped** value
(`clampGutterSize('left', 2)` = `LAYOUT_ZONE_MIN`), never a collapsed/negative
track; the stage keeps its (positive) size.
**Observed:** `{got:["left",160], clamped:160, size:160, stage:640}` →
**PASS**.

### V4 (§3.4, §2.2) Persistence round-trip / restore
**Input:** `setZoneSize(default, 'left', 333)` → `store.set({layout})`; read
back; construct a **fresh** `createOperatorSettingsStore({path})` (the restart
proxy) and read `layout`.
**Spec-derived expected:** in-session `left.size = 333`, restored
`left.size = 333`, `--zone-left-size = 333px`.
**Observed:** `{inSession:333, restored:333, css:"333px"}` → **PASS**.

### V5 (§3.5, §2.1) One write per gesture (no per-move write)
**Input:** `start('left')`; `move(230..300 step 10)`; `end()`; a second `end()`.
**Spec-derived expected:** 0 writes during the moves; exactly one write from the
gesture; the second `end()` (no new `start`) writes nothing.
**Observed:** `{midWrites:0, writes:1}` → **PASS**.

### V6 (§3.6, §2.3) Empty / minimized zone has no gutter
**Input:** `isGutterResizable(false,false)`, `(true,false)`, `(false,true)`;
controller with `isResizable: () => false`, `start('left')`, `move(300)`, `end()`;
host `resetGutter('left')` on an empty zone (0 placed panes) and on a minimized
zone (1 pane, `minimized:true`).
**Spec-derived expected:** resizable only for a non-empty expanded zone; a
gesture is a no-op (0 commits, no active gesture); both host resets return
`null` and write 0 `operatorSettings.set`.
**Observed:** `{gate:{nonEmptyExpanded:true,empty:false,minimized:false}, committed:null, onCommits:0, emptyReset:null, emptyWrites:0, minReset:null, minWrites:0}` → **PASS**.

### V7 (§3.7, §2.2) Header/footer rows resize
**Input:** `start('header')`, `move(70)`, `move(80)`, `end()`; separate
`start('footer')` gesture; `setZoneSize(layout,'header',80)`; `layoutCssVars`.
**Spec-derived expected:** one commit `('header', clampGutterSize('header',80))`;
`--zone-header-size` reflects the committed height; the footer uses the same
model.
**Observed:** `{headerCommit:["header",80], expected:["header",80], css:"80px"}` → **PASS**.

---

## §4 Fail-states

### F1 (§4 F1) NaN/negative size on restore
**Input:** `coerceLayout` with `left.size = NaN`, `right.size = NaN`,
`header.size = -10`, `footer.size = -10`; compare to `defaultLayout()`.
**Spec-derived expected:** fail-soft to the zone default track; every zone
finite and positive.
**Observed:** `left:220, right:220, header:48, footer:48` (all finite/positive;
`left` equals the default) → **PASS**.

### F2 (§4 F2, §2.5 pin 6) Interrupted drag (pointer cancel)
**Input:** `start('left')`, `move(275)`, `cancel()`.
**Spec-derived expected:** commits the last valid size **or** reverts — at most
one commit, no partial stream; no lingering active gesture.
**Observed:** `{activeBefore:"left", activeAfter:null, writes:0, calls:[]}`
(reverted; 0 ≤ 1 commits; no lingering state) → **PASS**.

### F3 (§4 F3, §2.3) Drag over an empty/minimized zone
**Input:** controller with `isResizable: () => false`; `start('left')`,
`move(300)`, `end()`.
**Spec-derived expected:** no-op (0 commits, no active gesture).
**Observed:** `[]` → **PASS**.

### F4 (§4 F4) Resize during an in-flight render
**Input:** stray `move(300)` + `end()` with no gesture; then one gesture with two
moves; then a fresh independent gesture.
**Spec-derived expected:** no write without an active gesture; one queued write
per gesture; no interleave between gestures.
**Observed:** `{strayEnd:null, writes:2, calls:[["left",275],["left",290]]}` →
**PASS** (each gesture committed exactly once at its end; the stray call
produced nothing).

### F5 (§4 F5) Unknown zone key
**Input:** `start('bogus')`, `move(100)`, `end()`, `cancel()`,
`clampGutterSize('bogus',100)`, `setZoneSize(base,'bogus',100)`.
**Spec-derived expected:** ignored; never throws; no commit; the layout is
returned unchanged.
**Observed:** `{threw:null, writes:0, unchanged:true}` → **PASS**.

### F6 (§4 F6) Settings write failure
**Input:** `createOperatorSettingsStore({path: <a directory>})` (persist
cannot succeed); `store.set({layout: setZoneSize(...,'left',333)})`.
**Spec-derived expected:** never throws; the in-memory size still applies for
the session (`left.size = 333`).
**Observed:** `{threw:false, inMemory:333}` → **PASS**.

---

## §2.5 Pinned implementation details

### P1 (§2.5 pin 1) Module present
**Input:** dynamic `import('../src/renderer/pane-gutter.js')`.
**Spec-derived expected:** the module loads.
**Observed:** `{loaded:true}` → **PASS**.

### P2 (§2.5 pin 2) Pinned API surface
**Input:** namespace enumeration of the live module.
**Spec-derived expected:** `createGutterController`, `clampGutterSize`,
`gutterBounds`, `setZoneSize`, `isGutterResizable`, `gutterAxis` are functions
and `GUTTER_ZONES` is an array.
**Observed:** all six `"function"`, `GUTTER_ZONES:true` → **PASS**.

### P3 (§2.5 pin 3, §2.2) Clamp bounds + never NaN/negative
**Input:** `clampGutterSize('left',-50)`, `clampGutterSize('right',99999)`,
`gutterBounds` for all four zones, `clampGutterSize('header', NaN|Infinity|-Infinity)`.
**Spec-derived expected:** side columns clamp to the landed
`LAYOUT_ZONE_MIN`/`LAYOUT_ZONE_MAX`; row bounds are finite positive `min ≤ max`;
no clamp ever returns NaN/negative.
**Observed:** `sideMin:160, sideMax:640`; bounds
`left/right {160,640}`, `header/footer {32,240}`; junk all `32` → **PASS**.

### P4 (§2.5 pin 4) `stage.size` preserved
**Input:** `setZoneSize(makeLayout({stage:{size:777}}), 'left', 300)`.
**Spec-derived expected:** the zone size changes; `stage.size` is untouched
(no distinct stage-gutter mutation invented).
**Observed:** `{stage:777}` → **PASS**.

### P5 (§2.5 pin 5, §2.2) Double-click reset required
**Input:** `createGutterController({onCommit})`; `reset('left')`.
**Spec-derived expected:** restores the registry default
(`defaultLayout().zones.left.size = 220`) and commits it exactly once.
**Observed:** `{reset:220, expected:220, writes:1, calls:[["left",220]]}` →
**PASS**.

### P6 (§2.5 pin 6) Cancel semantics
**Input:** `start('left')`, `move(280)`, `cancel()`, then a second `cancel()`.
**Spec-derived expected:** commits the last valid size **or** reverts — at most
one commit; no lingering active gesture.
**Observed:** `{first:0, after:0, calls:[]}` (reverted; 0 ≤ 1) → **PASS**.

### P7 (§2.5 pin 7, §2.4) `index.html` gutter geometry + C1 tokens
**Input:** parse the `<style>` block of `src/renderer/index.html` and inspect
rules whose selectors include `gutter`.
**Spec-derived expected:** at least one gutter rule exists; its declarations read
`var(--border…`; a `:hover` gutter rule reads `var(--hover…`.
**Observed:** `{gutterRules:4, hasBorder:true, hasHover:true}` → **PASS**.

---

## Adversarial regressions H-1…H-4

### H-1 (adversarial — see §2.3/§3.6) Non-resizable `reset` + host write
**Input:** `reset('left')` under `isResizable: () => false`; host
`resetGutter('left')` on an empty zone and on a minimized zone.
**Spec-derived expected:** `null` + 0 commits; the host performs 0
`operatorSettings.set` writes.
**Observed:** `{result:null, commits:0, emptyReset:null, emptyWrites:0, minReset:null, minWrites:0}` → **PASS**.

### H-2 (adversarial — see §4 F5) Invalid explicit zone to `reset`
**Input:** active `start('left')` + `move(300)`; `reset('bogus')`.
**Spec-derived expected:** the invalid explicit zone is ignored (`null`, no
commit); the in-flight gesture is **not** retargeted — `active()` stays
`'left'`, `preview()` stays `300`. (Only `zone === undefined` may fall back to
the active gesture.)
**Observed:** `{result:null, active:"left", preview:300, commits:0}` → **PASS**.

### H-3 (adversarial — see §2.3) Fail-closed resizability predicate
**Input:** `isResizable` returning each of `undefined`, `null`, `0`, `''`;
`start('left')`, `move(300)`, `end()`.
**Spec-derived expected:** a non-boolean falsy result refuses the gesture
(fail closed): no active gesture, no commit.
**Observed:** for every falsy `{active:null, end:null, commits:0}` → **PASS**.

### H-4 (adversarial — see §2.1) `start` over an active gesture
**Input:** `start('left')`, `move(300)`, `start('right')`, `move(250)`, `end()`.
**Spec-derived expected:** the prior gesture is explicitly resolved (no silent
loss); the commit set is deterministic — `[['left',300],['right',250]]`; the
returned commit is `250`; no lingering active gesture.
**Observed:** `{committed:250, calls:[["left",300],["right",250]], active:null}` → **PASS**.

---

## Specification statements not testable in this run (and why)

1. **§2.1 "continuous pointer capture + `getBoundingClientRect`"** — the spec
   pins this as shell chrome. The live module is a pure gesture/clamp
   controller; there is no exposed DOM/pointer-capture seam in the spec, and
   **W2-N7** (`wave-2-open-decisions.md`) records that the DOM `pointerdown/move/up`
   + rect listener wiring is **absent** (`.gutter` CSS is dead;
   `startGutter` has no caller). Only the controller's gesture model + rect-math
   products (clamp/bounds) could be exercised; actual pointer capture against a
   real element was not.
2. **§2.1 "must not journal per pixel; one `ZoneLayout.size` write at gesture
   end"** — verified at the controller seam (one `onCommit` per gesture, V5/F4).
   The deeper engine claim (no per-pixel entry in the producing graph journal)
   cannot be exercised without the absent shell wiring (W2-N7) / a live Electron
   app.
3. **§2.3 "an `is-empty` zone has no gutter (its track is collapsed)"** —
   verified functionally via `isGutterResizable` + host `resetGutter`; the
   **rendered-DOM absence** of a gutter for an empty zone could not be observed
   in the live shell (W2-N7).
4. **§2.4 "the resize is purely geometry, no graph-state per frame"** — only the
   one-commit-per-gesture seam is observable; no per-frame graph write could be
   counted without the shell pointer wiring.
5. **§3.4 "restores on restart"** — approximated by constructing a **fresh**
   store from the same settings path (persistence round-trip). A true
   app-process restart was not performed.
6. **H-1/H-2/H-3/H-4 were not stated in the unit spec at blind-run time.**
   They were named by the unit's adversarial pass only; expectations above were
   derived from the governing clauses (§2.1/§2.3/§3.6/§4 F5) and the H-labels.
   **RESOLVED 2026-09-12 (doc review):** the spec now carries
   **`§2.6 Adversarial findings (2026-09-12)`** recording H-1…H-5 (H-1/H-2/H-3/
   H-4 FIXED; **H-5 → W2-N7 OPEN, MEDIUM**), so the next blind/verification pass
   can derive them from documentation.

## Notes / non-findings

- The probe used **in-repo** temp dirs (`tests/.ushell5-probe/`) exclusively;
  the probe file and temp dir were removed after the run. No `/tmp`, no parent
  `Projects/`, no `../Preempt-Providence` access.
- `F2`/`P6` cancel semantics satisfied the spec's disjunction ("commits the
  last valid size **or** reverts"): the implementation reverted (0 commits),
  which is within the pinned bound (≤ 1 commit). Not a failure.
- No package (`provident-ssr`) findings surfaced; no `docs/defects.md` /
  `docs/HANDOFF.md` addition required.
