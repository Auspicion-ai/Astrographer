# Unit U-SHELL-3 — Collapsible Panes (C5) — Spec

**Status:** GREEN (IMPLEMENTED 2026-09-12). Gate: the UI-overhaul umbrella gate
(PROCEED-WITH-AMENDMENTS, A1). **Depends on U-SHELL-1** (zones/pane frames + the
serialized `LayoutState`). Decisions in `docs/specs/wave-2-open-decisions.md`
(W2-Q1/W2-Q2 RESOLVED; W2-N4 FIXED; W2-N5 opened).

**TDD cycle (2026-09-12, RCA-1/RCA-2):**
`tests/unit-u-shell-3-collapsible-panes.test.ts` was authored from this spec
ALONE and RUN red before the Implementer pass; after the Implementer it is
**26 tests (22 pass + 4 skip)** — the 4 skips are the §2.5 pin-4 live-runtime
battery placeholders (live `provident.dispatch`/`list_targets` + the F5
`unresolved target` result). Adversarial pass H1/H2/H3/H5 **FIXED** with
regression tests; H4 **RESOLVED (wording)**. Blind-greens
`unit-u-shell-3-collapsible-panes-greens.md` (19 scenarios: 18 PASS / 1 FAIL —
the F2 mechanism-wording drift, reconciled in §4 F2). Doc-review
`archive/reviews/2026-09-12-u-shell-3-doc-review.md`. Full trio at this unit:
**175 files / 4019 pass + 50 skip**, typecheck 0, build OK.

---

## 1. What the proposal asks

Panes are **collapsible** (C5): none today. Deliver a per-pane collapse toggle
so a pane renders as its header/handle only, with the collapsed state persisted.

## 2. Contract (pinned)

### 2.1 Collapse control (provident — app-graph)

- Each pane's shell frame supplies a **collapse toggle**; the control itself is
  a provident node with an `on:click` handler (Table A), so
  `provident.dispatch` reaches it (the pane body stays untouched provident
  content).
- Toggling writes `PaneLayoutEntry.collapsed` for the pane (one managed write: the
  serialized `layout` update via `setLayout`, which re-derives the pane frame).
  (The earlier "state-slice/hook on the pane root" wording did not ship — collapse
  is `layout`-only + re-derive.)

### 2.2 Collapsed rendering

- Collapsed = the pane's **header/handle only** (frame chrome); the pane body is
  not rendered/expanded. Collapsing never destroys the pane root — identity is
  stable so expand restores it.
- The graph mirror carries a collapsed class on the pane/zone node
  (`is-collapsed` → `cssDef`); `get_rendered_html` reflects the collapsed body.

### 2.3 Persistence

- `collapsed` is a **stored per-pane field** in `LayoutState` (C9 via
  `OperatorSettings.layout`), unlike C11 emptiness (derived). It round-trips and
  survives restart + a RAG content change (U-STATE-1).

### 2.4 Zone-level collapse — boundary

- C5 names "each pane **and** each pane zone" a collapse toggle. This unit's
  scope is the **per-pane** toggle; the zone-level collapse is reconciled with
  C12 **container-minimize → tab-list** (U-SHELL-4). Pinned default (W2-Q1): a
  zone's collapsed form is the C12 tab strip, so this unit does **not** add a
  second, distinct zone-collapse state. If the Architect rules they are distinct,
  the zone half moves here.

### 2.5 Pinned implementation details (post-TestWriter, 2026-09-12)

1. **Collapse unmounts the body (NOT CSS-only).** A collapsed pane's body nodes
   are **absent** from the app graph (the U-STATE-1 pane reconcile removes them;
   the pane root is kept, identity stable), so `get_rendered_html` /
   `list_targets` show header-only. A `display:none`-only hide is **rejected**
   (it would leave the body MCP-visible).
2. **Single handler name.** All pane frames share ONE collapse handler name
   (`togglePaneCollapse`) driving the sidebar host's per-pane toggle; the toggle
   writes `PaneLayoutEntry.collapsed` (one managed write) and persists `layout`.
3. **`is-collapsed` `cssDef`.** `index.html` gains an `is-collapsed` rule (the
   collapsed frame chrome); the pane root carries the class.
4. **§3.6 / F5** (live `dispatch`/`list_targets`, stale-id no-op) are covered by
   the skipped live-runtime battery (the U-SHELL-1 convention), not node tests.

### 2.6 Adversarial findings (2026-09-12)

Post-green read-only adversarial pass; host findings fixed here, no package findings.

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **H1** | medium | Toggling a pane **absent from `LayoutState.panes`** hardcoded `zone:'left'`/`order:length`, ignoring `defaultZone`/`defaultOrder` → the pane relocated/reordered and persisted that. | **FIXED** — the append branch resolves zone/order from the pane default (or backfills via `deriveLayout`). Regression test. |
| **H2** | medium | The collapse control had **no stable authored identity** (only volatile engine `nodeId`) → not addressable across re-derives. | **FIXED** — the control authors `props.id: 'pane-collapse-<paneId>'` (stable, unique per pane). Regression test. |
| **H3** | low | `togglePaneCollapse` accepted any registered pane (operator/disabled) → polluted the persisted layout. | **FIXED** — gate on `def.scope === 'app-graph' && registry.isEnabled(paneId)`. Regression test. |
| **H4** | low | F5 "no-op" is a thrown `unresolved target` (the host dispatch contract). | **RESOLVED (wording)** — F5 reworded; the safety property holds (no sibling mutation, ids never reused). |
| **H5** | low | `setLayout` dereferenced `bridge.operatorSettings` unguarded. | **FIXED** — guard the persist call. Regression test. |

**Confirmed-safe:** malformed/hostile toggle input (`null`/non-string/`__proto__`/`constructor`/unknown) all no-op with no prototype pollution; sibling isolation + rapid toggles; unmount integrity (collapsed body absent, expand restores the same root id, HARD PRECONDITION holds); F1/F2/F4; collapse survives a content change both ways; **MCP/UI equivalence** (dispatch runs the same seam as the DOM click). **Attack #3 resolved definitively:** `paneSubtreeRoot` has ONE production caller (`assembleAppGraphEnvelope`), which always supplies `collapsed` → no production pane can miss the collapse control (the 3-arg shape is test-only backward-compat). No package findings.

## 3. States (TestWriter red set — valid paths)
1. Boot (no persisted collapse) → every pane expanded.
2. Toggle a pane's collapse control → the pane renders header-only; the mirror
   carries the collapsed class.
3. Toggle again → the pane expands; the body returns; node identity unchanged.
4. A persisted `collapsed: true` renders collapsed after restart.
5. The collapse state survives a RAG content change (U-STATE-1).
6. The control is an app-graph node: `list_targets` includes it and
   `provident.dispatch` on it toggles the same state as a DOM click.
7. Collapsing one pane does not affect a sibling's collapsed state.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | a `collapsed` value on a pane not present | ignored; no phantom node |
| F2 | toggling while an edit is dirty | **content-safe** — the `layout` write applies (UI layout only, never a content mutation) and never throws; the rebuild path respects the dirty guard. (Blind-test drift: the earlier "queued via `requestRebuild`" mechanism wording did not match the shipped path; reworded to the verified outcome, 2026-09-12.) |
| F3 | a pane with no body (empty render) | collapse is a visual no-op; never throws |
| F4 | a malformed persisted `collapsed` | coerced to `false` (expanded) |
| F5 | dispatch on a stale node id | **rejected by the host `dispatch` (`unresolved target` error result); never mutates a sibling** (identity is stable; ids are never reused). Not a silent no-op — the host dispatch contract surfaces an error; the safety property holds. (Adversarial H4.) |

## 5. Census

- 1 provident-authored collapse control per pane frame + 1 handler def +
  `is-collapsed` `cssDef` rule; reuse of the U-SHELL-1 `LayoutState.collapsed`
  field + persistence path. 0 new dependencies.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C5, §3 (pane framing), §7.3 OB2.
- `docs/specs/unit-u-shell-1-layout-zones.md` (the model + zones),
  `unit-u-shell-4-drag-relocate.md` (C12 zone minimize).
- Build: `src/renderer/sidebar-panes.ts` (pane frame), `src/renderer/pane-graph.ts`
  (`paneSubtreeRoot`), `src/renderer/index.html` (frame CSS).

## 7. Delimitation

Per-pane collapse only. It does NOT build drag/relocate (U-SHELL-4), the C12
tab-list (U-SHELL-4), or any zone-level collapse distinct from C12. It does not
change pane body content.

## 8. Open items

**None blocking.** W2-Q1 is RESOLVED (per-pane `collapsed`, per-zone
`minimized`/`size`) and W2-N4 (operator-pane grid-area) is **FIXED (2026-09-12)**
— see `docs/specs/wave-2-open-decisions.md`. **W2-N5** (LOW, cleanup) records the
test-only `paneSubtreeRoot` 3-arg legacy branch (the `collapsed === undefined`
shape): no production pane misses the collapse control
(`assembleAppGraphEnvelope` always supplies `collapsed`), so the branch is
backward-compat for the pre-U-SHELL-3 tests only.
