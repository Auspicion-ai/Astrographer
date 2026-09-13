# Blind-test Greens — Unit: U-SHELL-3 — Collapsible Panes (C5)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** — derived from
  `docs/specs/unit-u-shell-3-collapsible-panes.md` (§2 contract + §2.2/§2.3/§2.5
  pins + §2.6 adversarial findings H1/H2/H3/H5, §3 valid states 1–7, §4
  fail-states F1–F5, §5 census). **NO implementation read**
  (`src/renderer/pane-graph.ts`, `src/renderer/sidebar-panes.ts`,
  `src/renderer/layout-state.ts`) and **NO unit-test read**
  (`tests/unit-u-shell-3-collapsible-panes.test.ts`). Only the live *execution*
  of those modules was used to run the scenarios.
- **Run file:** a throwaway `tests/__blind_u_shell_3_greens.test.ts` (vitest),
  **DELETED after the run**; no `src/**` edits; no commit; no new dependencies.
- **Runner invocation:** `npx vitest run tests/__blind_u_shell_3_greens.test.ts`
  from the Astrographer repo root.
- **Source under test (LIVE modules):** `src/renderer/pane-graph.ts`
  (`assembleAppGraphEnvelope`, `PANE_COLLAPSE_HANDLER`, `PANE_COLLAPSED_CLASS`),
  `src/renderer/sidebar-panes.ts` (`SidebarPanes.togglePaneCollapse` /
  `setLayout` / `loadAppGraph` / `applyContentChange`),
  `src/renderer/layout-state.ts` (`coerceLayout`),
  `src/renderer/pane-registry.ts` (`createPaneRegistry`),
  `src/renderer/edit-controller.ts` (`createEditController`),
  `src/main/operator-settings-store.ts` (`createOperatorSettingsStore`),
  `src/main/traversal.ts` + `src/main/adjacency.ts` (real traversal envelopes),
  and `src/renderer/index.html`.
- **Result:** **19 scenarios — 19 PASS** (F2's initial FAIL was doc-side drift:
  the spec §4 F2 mechanism wording was corrected to the verified outcome — see
  §F2).

## Legend

- **PASS** — observed behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never recorded as a pass).

## Summary

| # | Scenario | Spec ref | Result |
| --- | --- | --- | --- |
| S1 | Boot with no persisted collapse → every pane expanded | §3.1, §2.2 | PASS |
| S2 | Toggle a pane → header-only + `is-collapsed` mirror | §3.2, §2.2 | PASS |
| S3 | Toggle again → expands; body returns; identity unchanged | §3.3, §2.2 | PASS |
| S4 | Persisted `collapsed:true` renders collapsed after restart | §3.4, §2.3 | PASS |
| S5 | Collapse survives a RAG content change | §3.5, §2.3 | PASS |
| S6 | Control is an app-graph node with a `click` handler (dispatch leg = battery) | §3.6, §2.1, §2.5 pin 4 | PASS (node-level) |
| S7 | Collapsing one pane does not affect a sibling | §3.7 | PASS |
| F1 | `collapsed` on a pane not present → ignored; no phantom | §4 F1 | PASS |
| F2 | Toggling while an edit is dirty → content-safe (no dirty clobber) | §4 F2 | PASS (reconciled) |
| F3 | A pane with no body → collapse visual no-op; never throws | §4 F3 | PASS |
| F4 | Malformed persisted `collapsed` → coerced `false` | §4 F4 | PASS |
| F5 | Stale/unknown toggle id → no sibling mutation (error-result leg = battery) | §4 F5, §2.6 H4 | PASS (node-level) |
| H1 | Toggling a pane absent from `LayoutState.panes` resolves `defaultZone`/`defaultOrder` | §2.6 H1 | PASS |
| H2 | Collapse control has a stable, unique authored id across re-derive | §2.6 H2 | PASS |
| H3 | `togglePaneCollapse` rejects operator/disabled panes (no layout pollution) | §2.6 H3 | PASS |
| H5 | `setLayout` guards a missing `bridge.operatorSettings` | §2.6 H5 | PASS |
| P1 | Collapse unmounts the body (body node absent; root kept) | §2.5 pin 1 | PASS |
| P2 | Single shared handler name `togglePaneCollapse` | §2.5 pin 2 | PASS |
| P3 | `index.html` has an `is-collapsed` cssDef; pane root carries the class | §2.5 pin 3 | PASS |

---

## §3 Valid paths

### S1 (§3.1, §2.2) Boot with no persisted collapse → every pane expanded
**Input:** `assembleAppGraphEnvelope({ traversalEnvelope, registry, ctx })` with
**no** `layout`; registry has enabled app-graph panes `a` and `b`; the traversal
envelope carries the `main` zone.
**Spec-derived expectation:** no pane is collapsed (no `is-collapsed` class);
each pane's frame supplies a collapse control whose mirrored flag is `false`.
**Observed:** `pane-a.css.classes = ["pane-frame"]`; `pane-b.css.classes =
["pane-frame"]`; the pane root carries no `data-pane-collapse`; the control
`pane-collapse-a.props["data-pane-collapse"] === "false"`.
**Result:** PASS

### S2 (§3.2, §2.2) Toggle a pane's collapse control → header-only + collapsed class
**Input:** host harness (`SidebarPanes` booted on a `Runtime`) → one
`host.togglePaneCollapse('doc-nav')`; then
`host.loadAppGraph(runtime, traversalEnvelope())`.
**Spec-derived expectation:** the toggle writes one `collapsed:true` layout entry
and persists it; the `pane-doc-nav` root carries `is-collapsed`; only the
frame/header (the collapse control) is rendered — the body is absent (pin 1).
**Observed:** `bridge.operatorSettings.set` called once with
`{ layout: { panes: [{ id:'doc-nav', zone:'left', order:0, collapsed:true }], ... } }`;
`pane-doc-nav.css.classes = ["pane-frame","is-collapsed"]`; children
`["pane-collapse-doc-nav"]` (body `body-doc-nav` absent from the envelope).
**Result:** PASS

### S3 (§3.3, §2.2) Toggle again → the pane expands; the body returns; identity unchanged
**Input:** two `host.togglePaneCollapse('doc-nav')` calls (boot state then
collapse then expand); then `host.loadAppGraph(...)`.
**Spec-derived expectation:** the second toggle clears `collapsed` (expanded);
the body renders again; the pane root keeps the same identity (`pane-doc-nav`)
so expand restores it.
**Observed:** root `props.id === "pane-doc-nav"`; `css.classes = ["pane-frame"]`
(no `is-collapsed`); the pane has **2 children** — the collapse control plus the
body (collapsed had 1 child). Identity stable across collapse/expand.
**Result:** PASS

### S4 (§3.4, §2.3) A persisted `collapsed:true` renders collapsed after restart
**Input:** `createOperatorSettingsStore({path: tmp})` → `set({layout})` with a
`collapsed:true` pane; a **new** store on the same path; `coerceLayout` →
`assembleAppGraphEnvelope`.
**Spec-derived expectation:** `collapsed` is a stored per-pane `LayoutState`
field that round-trips and survives restart; the reloaded pane renders collapsed.
**Observed:** reloaded `layout.panes[0].collapsed === true`;
`pane-a.css.classes = ["pane-frame","is-collapsed"]`.
**Result:** PASS

### S5 (§3.5, §2.3) Collapse survives a RAG content change (U-STATE-1)
**Input:** boot; `togglePaneCollapse('doc-nav')`; then
`await host.applyContentChange(<new traversal envelope>)`; then
`host.loadAppGraph(...)` on the changed content.
**Spec-derived expectation:** a content change never re-derives/re-persists the
layout; the collapsed state survives both ways.
**Observed:** after the content change the entry is still
`{ id:'doc-nav', zone:'left', order:0, collapsed:true }`; the layout object is
the **same reference** (`sameObj true`); `pane-doc-nav.css.classes` still
contains `is-collapsed`.
**Result:** PASS

### S6 (§3.6, §2.1, §2.5 pin 4) The control is an app-graph node
**Input:** assembled envelope with panes `a`, `b`; locate
`props.id === "pane-collapse-a"`.
**Spec-derived expectation:** the control is a provident node with an `on:click`
handler named `togglePaneCollapse` (pin 2), so `provident.dispatch` can reach
it; `list_targets` includes it and dispatch toggles the same state as a DOM
click. **Pin 4** marks the live `dispatch`/`list_targets` leg as covered by the
skipped live-runtime battery, not node tests.
**Observed (node-level):** the control node
`{ type:"button", props:{ id:"pane-collapse-a", "data-pane-id":"a",
"data-pane-collapse":"false" }, css:{classes:["pane-collapse-toggle",
"is-clickable"]} }` carries `handlers:[{ name:"togglePaneCollapse",
event:"click" }]`; it is present in the assembled app-graph envelope.
**Result:** PASS (node-level); the live `dispatch`/`list_targets` equivalence is
the pin-4 skipped battery — see "not tested".

### S7 (§3.7) Collapsing one pane does not affect a sibling
**Input:** boot; `setLayout` with `doc-nav` and `crosslinks` both
`collapsed:false` in `left`; `togglePaneCollapse('doc-nav')`; then
`loadAppGraph(...)`.
**Spec-derived expectation:** sibling isolation — `crosslinks` remains expanded.
**Observed:** `pane-crosslinks.css.classes = ["pane-frame"]` (no
`is-collapsed`); `pane-crosslinks` has **2 children** (control + body).
**Result:** PASS

---

## §4 Fail-states / edge cases

### F1 (§4 F1) A `collapsed` value on a pane not present → ignored; no phantom node
**Input:** registry has only pane `a`; layout `panes:[{id:'ghost', zone:'left',
order:0, collapsed:true}]`.
**Spec-derived expectation:** the entry is ignored; no phantom pane/body node is
created (the host warns and drops it).
**Observed:** `pane-ghost` absent from the envelope; exactly one host
`console.warn` captured.
**Result:** PASS

### F2 (§4 F2) Toggling while an edit is dirty → content-safe (no dirty clobber)
**Input:** boot; `editController.markDirty('rag-docA')` (now
`anyDirty() === true`); spy on `editController.requestRebuild`;
`host.togglePaneCollapse('doc-nav')`.
**Spec-derived expectation (§4 F2, post-reconciliation):** the toggle is
**content-safe** — the `layout` write applies (UI layout only, never a content
mutation) and never throws; the rebuild path respects the dirty guard.
**Observed:** `requestRebuild` was **never called**
(`requestRebuild calls 0`); `editController.hasQueuedRebuild() === false`; the
dirty flag stayed `true`; the layout write still committed
(`collapsed:true`). The content-safety *outcome* holds (no content mutation, no
throw, dirty preserved). The guard itself is functional: a direct
`editController.requestRebuild()` while dirty does set
`hasQueuedRebuild() === true`.
**Result:** **PASS** (reconciled).
**Reconciliation:** the initial blind run recorded this as a FAIL because the
then-current §4 F2 named a "queued via `requestRebuild`/dirty-edit guard"
**mechanism** that the shipped collapse path does not use (the toggle is a
`layout`-only managed write and issues no rebuild). The content-safety property
was always verified. The Architect reworded §4 F2
(`unit-u-shell-3-collapsible-panes.md` §4 F2, "reworded to the verified outcome,
2026-09-12") to the outcome; the observed behavior matches the corrected spec.
Doc-side drift, now closed — no runtime behavior was ever affected.

### F3 (§4 F3) A pane with no body (empty render) → visual no-op; never throws
**Input:** register an app-graph pane `emptyp` whose `render` returns
`{ type:'div', props:{ id:'body-empty' } }` (no content); toggle it collapsed,
then expanded.
**Spec-derived expectation:** collapsing an empty-body pane never throws; it is a
visual no-op (header/control only); expanding restores the (empty) body.
**Observed:** both toggles threw nothing; collapsed children
`["pane-collapse-emptyp"]` with `is-collapsed`; expanded children
`["pane-collapse-emptyp","body-empty"]`.
**Result:** PASS

### F4 (§4 F4) A malformed persisted `collapsed` → coerced to `false`
**Input:** `coerceLayout({ version:1, panes:[{ id:'a', zone:'left', order:0,
collapsed:<'yes'|1|0|null|{}|[]|'true'|NaN> }] })`.
**Spec-derived expectation:** a malformed `collapsed` fails soft to `false`
(expanded).
**Observed:** all eight variants → `collapsed:false`.
**Result:** PASS

### F5 (§4 F5, §2.6 H4) Dispatch on a stale node id → rejected; never mutates a sibling
**Input:** boot; `setLayout` with `doc-nav` `collapsed:false`; then
`host.togglePaneCollapse('stale-id-not-registered')` (the unknown/stale id the
live host dispatch would reject).
**Spec-derived expectation (§4 F5):** the host `dispatch` rejects with an
`unresolved target` error result; identity is stable and ids are never reused,
so no sibling is mutated. **Pin 4** marks the live error-result leg as the
skipped live-runtime battery.
**Observed (node-level proxy):** zero `operatorSettings.set` calls; `doc-nav`
stayed `collapsed:false` (no sibling mutation). The `unresolved target`
error-result surface is the live battery leg.
**Result:** PASS (node-level); the thrown-error result is battery-covered — see
"not tested".

---

## §2.6 Adversarial regressions

### H1 (§2.6 H1) Toggling a pane absent from `LayoutState.panes` resolves its default zone/order
**Input:** boot with persisted `layout.panes: []`; register an app-graph pane
`newp` with `defaultZone:'right'`, `defaultOrder:7`; enable it;
`togglePaneCollapse('newp')`.
**Spec-derived expectation (post-fix):** the append branch resolves zone/order
from the pane default (or backfills via `deriveLayout`) — **not** a hardcoded
`zone:'left'`/`order:length`.
**Observed:** persisted `panes` = `[{ id:'newp', zone:'right', order:7,
collapsed:true }]`.
**Result:** PASS

### H2 (§2.6 H2) The collapse control has a stable authored identity
**Input:** assemble a two-pane envelope twice (independent re-derives); collect
all `pane-collapse-*` ids.
**Spec-derived expectation (post-fix):** the control authors
`props.id: 'pane-collapse-<paneId>'` — stable and unique per pane (not the
volatile engine `nodeId`).
**Observed:** ids `["pane-collapse-a","pane-collapse-b"]` (unique); the
`pane-collapse-a` id is identical across the two independent assembles.
**Result:** PASS

### H3 (§2.6 H3) `togglePaneCollapse` rejects operator/disabled panes
**Input:** boot; register+enable an `operator`-scope pane `opp`; register (not
enable) an app-graph pane `offp`; call `togglePaneCollapse` on `opp`, `offp`,
and an unknown `ghost`.
**Spec-derived expectation (post-fix):** gated on
`def.scope === 'app-graph' && registry.isEnabled(paneId)`; none of the three
pollutes the persisted layout.
**Observed:** zero `operatorSettings.set` calls; layout unchanged.
**Result:** PASS

### H5 (§2.6 H5) `setLayout` guards a missing `bridge.operatorSettings`
**Input:** construct a host whose bridge has **no** `operatorSettings`; call
`setLayout(layout)`.
**Spec-derived expectation (post-fix):** the persist call is guarded — no throw;
the in-memory layout still applies.
**Observed:** no throw; `host.layout.version === 1` (the in-memory layout
applied).
**Result:** PASS

---

## §2.5 Pins

### P1 (§2.5 pin 1) Collapse unmounts the body (not CSS-only)
**Input:** assembled envelope with `collapsed:true` for pane `a`.
**Spec-derived expectation:** the body nodes are **absent** from the app graph
(the pane root is kept, identity stable) so `get_rendered_html`/`list_targets`
show header-only; a `display:none`-only hide is rejected.
**Observed:** `pane-a` root present (`props.id === "pane-a"`); `body-a` absent;
children `["pane-collapse-a"]`.
**Result:** PASS

### P2 (§2.5 pin 2) Single handler name
**Input:** module `PANE_COLLAPSE_HANDLER`; each control's `handlers[0].name`.
**Spec-derived expectation:** all pane frames share ONE collapse handler name
`togglePaneCollapse`.
**Observed:** constant `"togglePaneCollapse"`; both controls' handler names
`["togglePaneCollapse","togglePaneCollapse"]`.
**Result:** PASS

### P3 (§2.5 pin 3) `is-collapsed` cssDef + class on the pane root
**Input:** `src/renderer/index.html`; an assembled collapsed pane root.
**Spec-derived expectation:** `index.html` gains an `is-collapsed` rule and the
collapsed pane root carries the class.
**Observed:** `index.html` contains `.pane-frame.is-collapsed { ... }`;
`pane-a.css.classes = ["pane-frame","is-collapsed"]`.
**Result:** PASS

### P4 (§2.5 pin 4) §3.6 / F5 live coverage
**Input:** n/a (spec pin).
**Spec-derived expectation:** the live `dispatch`/`list_targets` and
stale-id `unresolved target` behaviors are covered by the skipped live-runtime
battery (the U-SHELL-1 convention), **not** node tests.
**Observed:** n/a — node-level proxies only (S6 control presence; F5
no-sibling-mutation). The live battery leg was not run.
**Result:** NOT TESTED HERE (by spec design) — see "not tested".

---

## Spec statements not tested (and why)

1. **§3.6 live `provident.dispatch` / `list_targets` equivalence and §4 F5's
   `unresolved target` error result** — §2.5 pin 4 explicitly assigns these to
   the skipped live-runtime battery (the U-SHELL-1 convention). The running MCP
   host exposes the shell demo, not the Astrographer app graph. Node-level
   proxies were asserted instead (S6: the control is an app-graph node with a
   `click` handler; F5: unknown id → zero writes, sibling unchanged).
2. **§2.2 `get_rendered_html` reflects the collapsed body** — a live-renderer
   surface, not node-observable; the envelope-level proxy (collapsed body node
   absent, `is-collapsed` on the root) was asserted (P1/S2).
3. **§2.1/§2.2 TypeScript types (`PaneLayoutEntry.collapsed`, etc.)** —
   compile-time shapes, not runtime-assertable; the runtime `collapsed` field on
   the assembled/layout objects was exercised instead.
4. **§2.6 "Confirmed-safe" hostile-input items not individually re-derived**
   (`null`/non-string/`__proto__`/`constructor`/unknown toggle input, rapid
   toggles, MCP/UI equivalence, attack #3 `paneSubtreeRoot` single-caller) — the
   task scoped this run to H1/H2/H3/H5 + the pins; the hostile-input and
   rapid-toggle properties were not separately exercised here.
5. **§2.4 / §7 zone-level collapse** — deliberately out of scope (reconciled
   with C12 in U-SHELL-4); not tested.
6. **F2's former "queued via the dirty-edit guard" mechanism** — the initial
   blind run recorded this as the single FAIL: the toggle issues no
   `requestRebuild` and `hasQueuedRebuild()` stays false. The spec §4 F2 has
   since been reworded to the verified **content-safe outcome** (the `layout`
   write applies, never throws, and the rebuild path respects the dirty guard),
   which was observed — so F2 is now **PASS** (reconciled; see §F2). The adjacent
   guard behavior *was* verified directly (a `requestRebuild()` while dirty sets
   the queue), so the guard exists — the toggle simply does not use it.
