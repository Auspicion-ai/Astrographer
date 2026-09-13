# Unit U-SHELL-5 — Resizable Gutters (C7) — Spec

**Status:** GREEN 2026-09-12. **IMPLEMENTED + GATED.** Gate: the UI-overhaul
umbrella gate (PROCEED-WITH-AMENDMENTS, A1). **Depends on U-SHELL-1** (zone
tracks + `LayoutState.zones[].size`). Open items in
`docs/specs/wave-2-open-decisions.md` (W2-Q7/W2-Q9). **Final unit result:**
`tests/unit-u-shell-5-resizable-gutters.test.ts` **33 pass** (0 skip); full suite
`177 files / 4101 pass + 54 skip`; typecheck 0; build OK. **Blind artifact:**
`docs/specs/unit-u-shell-5-resizable-gutters-greens.md` (24 scenarios — 24 PASS).
**Doc review:** `archive/reviews/2026-09-12-u-shell-5-doc-review.md`.

---

## 1. What the proposal asks

Side widths can be adjusted by drag (C7). Today the grid is fixed (`1fr 1fr`);
there are no gutters. Deliver **resizable gutters** between the zone columns and
rows, with widths/heights persisted.

## 2. Contract (pinned)

### 2.1 Shell-only mechanic (Table C)

- The gutter drag is **continuous pointer capture + `getBoundingClientRect`** —
  Table C shell chrome. It must **not** journal per pixel; the external code
  commits **one** `ZoneLayout.size` write (via
  `bridge.operatorSettings.set({ layout })`) **at gesture end**.
- Gutters sit between: `left`|`stage`, `stage`|`right`, and the
  header/footer verses the main row.

### 2.2 Model + persistence

- The size lives in `LayoutState.zones[zone].size` (C7); the `stage` weight
  lives in `LayoutState.stage.size`. Both round-trip through the C9 carrier.
- **Clamping:** a per-zone min/max (pinned defaults: min track, max leaving the
  stage a minimum). A clamped drag commits the clamped value.
- **Double-click / reset:** a gutter double-click restores the registry default
  size (W2-Q9). **Required for v1** (see §2.5 pin 5).

### 2.3 Hidden / minimized zones

- An `is-empty` zone (C11) has no gutter (its track is collapsed); a
  `minimized` zone (C12) keeps a fixed tab-strip track and is **not** resizable
  until expanded.

### 2.4 Theme + tokens

- Gutter styling reads the C1 tokens (`--border`, `--hover`); the resize is
  purely geometry, no graph-state per frame. The final size is the only graph
  write.

### 2.5 Pinned implementation details (post-TestWriter, 2026-09-12)

1. **New module `src/renderer/pane-gutter.ts`** — the gutter controller (pure
   gesture state + clamp/axis/bounds/size helpers; the shell pointer-capture
   wiring is W2-N7, see §2.6 H-5).
2. **Pinned API** (the Implementer conforms to the red set's usage):
   `createGutterController` (`start / move / end / cancel / reset / active /
   preview`), `clampGutterSize`, `gutterBounds`, `setZoneSize`, `isGutterResizable`,
   `gutterAxis`, `GUTTER_ZONES`.
3. **Clamp bounds:** side columns use the landed `LAYOUT_ZONE_MIN` /
   `LAYOUT_ZONE_MAX` (`layout-state.ts`); row (header/footer) bounds are read from
   `gutterBounds` (per-axis). A clamped drag commits the clamped value; never
   negative/NaN.
4. **`stage.size` is preserved** — no distinct stage-gutter mutation is invented;
   a zone commit leaves `stage.size` untouched.
5. **Double-click reset is REQUIRED for v1** (restores the zone's default size).
6. **`cancel`** commits the last valid size OR reverts — at most one commit.
7. **`index.html`** gains the gutter geometry + reads the C1 `--border`/`--hover`
   tokens.

### 2.6 Adversarial findings (2026-09-12)

Post-green read-only adversarial pass (RCA-3); host findings fixed here, no package findings.

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **H-1** | medium | **`reset` bypassed the §2.3 resizability gate:** a gutter double-click committed the registry default on an empty/minimized zone (collapsed track / not resizable), unlike `start`. | **FIXED** — `reset` honours the SAME shared `resizable()` gate as `start`; a non-resizable zone commits nothing (`pane-gutter.ts` `reset`). Regression: `tests/unit-u-shell-5-resizable-gutters.test.ts` "H-1". |
| **H-2** | low | **Invalid explicit zone retargeted an in-flight gesture:** `reset('bogus')` fell back to the active gesture and committed it (only an OMITTED zone may fall back). | **FIXED** — only `zone === undefined` falls back to `activeZone`; an explicit invalid zone is ignored (`null`, no commit, gesture intact). Regression: "H-2". |
| **H-3** | low | **Resizability predicate failed OPEN:** a non-boolean falsy `isResizable` return (`undefined`/`null`/`0`/`''`) enabled the gesture. | **FIXED** — the shared `resizable()` gate is fail-closed: only an explicit `true` enables; a throwing predicate refuses. Regression: "H-3". |
| **H-4** | low | **`start` over an active gesture silently discarded the prior** (lost in-flight drag). | **FIXED** — `start` calls `finishGesture()` first, explicitly resolving the prior with ONE commit; `finishGesture()` is the shared `end`/takeover body. Regression: "H-4". |
| **H-5** | medium | **Shell pointer wiring absent:** the pure `pane-gutter.ts` controller + host seams (`startGutter`/`moveGutter`/`endGutter`/`cancelGutter`/`resetGutter`) exist, but no DOM `pointerdown/move/up` (capture) + `getBoundingClientRect` listeners are wired in `src/renderer/renderer.ts`/`index.html`, so the C7 gesture is unreachable in the live app (`.gutter` CSS is dead; `startGutter` has no caller). | **OPEN → W2-N7 (MEDIUM)** in `docs/specs/wave-2-open-decisions.md` §D. Options: (a) a shell-wiring integration pass (its own spec + TestWriter red), or (b) declare the pure-controller + host-seam split the deliberate boundary. Affects U-SHELL-4 (drag) + U-SHELL-5 (gutter). See the greens "not testable" #1. |

**Confirmed-safe:** unknown zone keys never throw (`start`/`move`/`end`/`cancel`/`reset`/`clampGutterSize`/`setZoneSize`, F5); a malformed/throwing `bounds` provider or `onCommit` consumer cannot break the gesture (`resolveBounds`/`safeCommit` fall back); the clamps are total (non-finite → min, never negative/NaN); `setZoneSize` is pure and leaves `stage.size`/`panes` untouched (§2.5 pin 4); at most one commit per gesture (F2/F4). No package findings surfaced (§3b: NONE).

## 3. States (TestWriter red set — valid paths)

1. Drag the `left`|`stage` gutter → `LayoutState.zones.left.size` updates once
   at drag end; the track resizes.
2. Drag the `stage`|`right` gutter → `right.size` updates.
3. Drag below the minimum → the committed size is clamped; never a collapsed
   stage.
4. The size round-trips through `operatorSettings.set`/`get` and restores on
   restart.
5. Resize produces exactly one settings write per gesture (no per-move write).
6. An empty zone has no active gutter; a minimized zone is not resizable.
7. The header/footer tracks resize (height) with the same model.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | NaN/negative size on restore | fail-soft to the default track |
| F2 | a drag interrupted (pointer cancel) | commits the last valid size or reverts; no partial stream |
| F3 | gutter drag over an empty/minimized zone | no-op |
| F4 | a resize during an in-flight render | one queued write; no interleave |
| F5 | an unknown zone key | ignored; never throws |
| F6 | a settings write failure | the in-memory size still applies for the session |

## 5. Census

- 1 pure shell gutter/resize controller (`src/renderer/pane-gutter.ts`:
  `createGutterController` + the clamp/axis/bounds/size helpers) + the host
  seams (`startGutter`/`moveGutter`/`endGutter`/`cancelGutter`/`resetGutter`/
  `previewGutter`/`activeGutter` + `commitGutterSize`); reuse of `LayoutState`
  sizes + the operator-settings persistence path (`setLayout` → ONE
  `operatorSettings.set` per gesture); `index.html` `.gutter` geometry reading
  the C1 `--border`/`--hover` tokens. 0 new dependencies. The DOM
  `pointerdown/move/up` capture + `getBoundingClientRect` rect math is **NOT**
  landed (W2-N7, OPEN — §2.6 H-5): the controller owns the gesture state; the
  shell pointer listeners are absent from `renderer.ts`/`index.html`.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C7, §2.1 Table C, §3, §7.3 OB2.
- `docs/specs/unit-u-shell-1-layout-zones.md`,
  `unit-u-shell-4-drag-relocate.md`, `unit-u-shell-2-appearance-tokens.md`.
- Build: `src/renderer/index.html`, `src/main/operator-settings-store.ts`.

## 7. Delimitation

Gutter geometry + size persistence only. It does NOT own the zone model
(U-SHELL-1), drag/reorder of panes (U-SHELL-4), or theming (U-SHELL-2).

## 8. Open items

W2-Q7/Q9 RESOLVED (restore last size; pinned min/max + double-click reset) — see `docs/specs/wave-2-open-decisions.md`. **W2-N3** (apply `ZoneLayout.size` to the shell grid) is **FIXED** (`layoutCssVars`/`applyLayoutToRoot` + `installLayout`, U-SHELL-1 pass). **W2-N7** (shell pointer wiring absent — `renderer.ts`/`index.html` has no `pointerdown/move/up` + `getBoundingClientRect` listener wiring, so the C7 gesture is unreachable in the live app; §2.6 H-5) is **OPEN (MEDIUM)** in `docs/specs/wave-2-open-decisions.md` §D. No other open item.
