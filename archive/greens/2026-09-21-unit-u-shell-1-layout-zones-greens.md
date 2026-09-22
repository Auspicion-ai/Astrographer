# Blind-test Greens — Unit: U-SHELL-1 — Layout Model + Zones + Persistence

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** — derived from
  `docs/specs/unit-u-shell-1-layout-zones.md` (§2 contract + §2.6 pins + §2.7
  adversarial findings, §3 valid states 1–8, §4 fail-states F1–F8, §5 census)
  and `docs/specs/wave-2-open-decisions.md` (RESOLVED W2-Q1/Q2/Q3/Q4/Q5/Q16,
  §D W2-N1/N2/N3/N4, §E.1/E.2/E.7). **NO implementation read**
  (`src/renderer/layout-state.ts`, `src/renderer/pane-graph.ts`,
  `src/renderer/pane-registry.ts`, `src/main/operator-settings-store.ts`) and
  **NO unit-test read** (`tests/unit-u-shell-1-layout-zones.test.ts`). Only the
  live *execution* of those modules was used to run the scenarios.
- **Run file:** a throwaway `tests/__blind_u_shell_1_greens.test.ts` (vitest),
  **DELETED after the run**; no `src/**` edits; no commit; no new dependencies.
- **Runner invocation:** `npx vitest run tests/__blind_u_shell_1_greens.test.ts`
  from the Astrographer repo root.
- **Source under test (LIVE modules):** `src/renderer/layout-state.ts`
  (`defaultLayout`/`deriveLayout`/`coerceLayout`), `src/renderer/pane-graph.ts`
  (`assembleAppGraphEnvelope`), `src/renderer/pane-registry.ts`
  (`createPaneRegistry`), `src/main/operator-settings-store.ts`
  (`createOperatorSettingsStore`), `src/renderer/content-reconcile.ts`
  (`reconcileContentRoots`), plus `src/main/traversal.ts` /
  `src/main/adjacency.ts` for real traversal envelopes, and `src/renderer/index.html`.
- **Result:** **27 scenarios — 27 PASS** (P8's initial FAIL was doc-side drift:
  the spec pin 8 was corrected to match the built grid — see §P8).

## Legend

- **PASS** — observed behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never recorded as a pass).

## Summary

| # | Scenario | Spec ref | Result |
| --- | --- | --- | --- |
| S1 | Boot with no persisted layout → registry defaults + four `zone:*` containers | §3.1, §2.3, W2-Q3 | PASS |
| S2 | Persisted layout moves a pane to `right`; `left` order reflects entries | §3.2, §2.6.3 | PASS |
| S3 | Persisted `collapsed:true` → pane root `is-collapsed` | §3.3, §2.6.4 | PASS |
| S4 | A zero-pane zone → `is-empty` mirror | §3.4, §2.6.4 | PASS |
| S5 | `stage`/`top-bar` sizes round-trip and restore on restart | §3.5, W2-Q2 | PASS |
| S6 | RAG content change leaves `zone:*` ids + pane roots unchanged | §3.6, §2.3, W2-Q5 | PASS |
| S7 | Layout mutation round-trips through `operatorSettings.set` + `get` | §3.7, §2.5 | PASS |
| S8 | Layout is operator-scoped, absent from app-graph legacy export | §3.8, §2.2, W2-Q16 | PASS |
| F1 | Corrupt/unknown `layout` JSON → fail-soft default; never throws | §4 F1, W2-Q16 | PASS |
| F2 | `panes[]` naming an unregistered pane → dropped + `console.warn`; no phantom | §4 F2, §2.6.6 | PASS |
| F3 | Unknown `zone` value → default zone (`left`) | §4 F3, §2.6.7 | PASS |
| F4 | `size` invalid → zone default; finite positive preserved | §4 F4, §2.6.5, W2-N2 | PASS |
| F5 | Duplicate pane ids → first wins | §4 F5 | PASS |
| F6 | Credentials in the store → never copied into `layout` | §4 F6, §2.2 | PASS |
| F7 | A layout write fails → in-memory layout still applies | §4 F7 | PASS |
| F8 | `targetPlacement` names a missing container → producer reassembled | §4 F8, §2.3 | PASS |
| H1 | id-only `zone:left` child (no `placementName`) → real anchor; pane placed | §2.7 H1 | PASS |
| AF-2 | Malformed `version` → defaults | §2.7 AF-2, §2.6.9 | PASS |
| P1 | `layout-state.ts` publicly exports the model helpers | §2.6.1 | PASS |
| P2 | `assembleAppGraphEnvelope({ layout })` optional; omitted derives default | §2.6.2 | PASS |
| P3 | `order` manifests as payload order; no `data-order` prop | §2.6.3 | PASS |
| P4 | Mirror placement (`is-collapsed` pane; `is-empty`/`is-minimized` zone) | §2.6.4 | PASS |
| P5 | Finite positive size preserved (36–48 px strips) | §2.6.5 | PASS |
| P6 | Unregistered-pane warning channel is `console.warn` | §2.6.6 | PASS |
| P7 | Unknown zone coerces to `left` | §2.6.7 | PASS |
| P8 | `index.html` grid named areas `top-bar`/`header`/`left`/`stage`/`right`/`footer` | §2.6.8 | PASS |
| P9 | Malformed `version` treated as corrupt → defaults | §2.6.9 | PASS |

---

## §3 Valid paths

### S1 (§3.1, §2.3, W2-Q3) Boot with no persisted layout → registry defaults + four `zone:*` containers
**Input:** `assembleAppGraphEnvelope({ traversalEnvelope, registry, ctx })` with
**no** `layout`; registry contains enabled app-graph panes `x`, `y`; traversal
envelope has only a `main` zone.
**Spec-derived expectation:** panes placed by registry defaults (app-graph →
`left`); the four `zone:*` containers exist as provident producers (always
present, stable identity); the legacy `sidebar` producer is retained alongside
(§2.3).
**Observed:** container `placementName`s
`["main","left","right","header","footer","sidebar"]`; `pane-x` placement
`{"targetPlacement":["left"]}`; `pane-y` also `left`.
**Result:** PASS

### S2 (§3.2, §2.6.3) Persisted layout moves a pane to `right`; `left` order reflects entries
**Input:** layout `panes:[{a,right,order1},{b,left,order2},{c,left,order1}]`, all registered/enabled.
**Spec-derived expectation:** `pane-a` targets `right`; `left` payload order reflects `order` (c before b).
**Observed:** `pane-a` placement `{"targetPlacement":["right"]}`; left payload order `["pane-c","pane-b"]`.
**Result:** PASS

### S3 (§3.3, §2.6.4) Persisted `collapsed:true` → pane root `is-collapsed`
**Input:** layout `panes:[{a,left,order0,collapsed:true}]`.
**Spec-derived expectation:** the `pane-a` root carries the `is-collapsed` class (pin 4: on the pane root).
**Observed:** `pane-pane-a.css.classes = ["is-collapsed"]`.
**Result:** PASS

### S4 (§3.4, §2.6.4) A zero-pane zone → `is-empty` mirror
**Input:** layout `panes:[{a,left,order0}]` (only `left` populated).
**Spec-derived expectation:** a zone with zero panes carries `is-empty`; a populated zone does not.
**Observed:** `left.css = undefined` (no `is-empty`); `right`/`header`/`footer` `.css.classes = ["is-empty"]`.
**Result:** PASS

### S5 (§3.5, W2-Q2) `stage`/`top-bar` sizes round-trip and restore on restart
**Input:** `createOperatorSettingsStore({path: tmp})` → `set({layout})` with `stage {700}`, `topBar {40}`, then a **new** store on the same path.
**Spec-derived expectation:** `stage`/`top-bar` are serialized regions and restore on restart.
**Observed:** restarted `get().layout.stage = {"size":700}`, `.topBar = {"size":40}` (plus the pane entry preserved).
**Result:** PASS

### S6 (§3.6, §2.3, W2-Q5) RAG content change leaves `zone:*` ids + pane roots unchanged
**Input:** assemble with content `Doc A` vs `Doc B`; `reconcileContentRoots({previous, next:envelopeB, change:null})`.
**Spec-derived expectation:** the reconciler preserves the `zone:*` container nodes + pane roots across a RAG content change (only the changed RAG root reconciles).
**Observed:** zone ids stable `["zone:main","zone:left","zone:right","zone:header","zone:footer","zone:sidebar"]`; reconcile result `kept=["pane-x","pane-y"]`, `replaced=[rag-head-a]`, `added=[]`, `removed=[]`; result JSON contains no `zone:` reference (zone containers are never enumerated/replaced).
**Result:** PASS

### S7 (§3.7, §2.5) Layout mutation round-trips through `operatorSettings.set` + `get`
**Input:** `set({layout})` then `get().layout` (layout with a pane `{a,right,order5,collapsed:true}`).
**Spec-derived expectation:** the layout round-trips unchanged.
**Observed:** deep-equal to the input layout.
**Result:** PASS

### S8 (§3.8, §2.2, W2-Q16) Layout is operator-scoped, absent from the app-graph legacy export/MCP state
**Input:** assemble **with** a layout; inspect `result.envelope` keys and JSON; inspect `operatorSettings.get()` keys.
**Spec-derived expectation:** the layout is operator-scoped UI-config, NOT MCP-exported; only the derived graph mirror (classes) is visible.
**Observed:** envelope keys `["template","content","clientConfig"]`; `'layout' in envelope === false`; envelope JSON contains no `"layout"`; `get()` keys include `layout`. (The mirror classes present in the envelope are the derived, MCP-visible surface.)
**Result:** PASS

---

## §4 Fail-states / edge cases

### F1 (§4 F1, W2-Q16) Corrupt/unknown `layout` JSON → fail-soft default; never throws
**Input:** a store seeded with `{ not json ]`; a store seeded with `{layout:{version:'x',panes:'nope',zones:5}}`; `coerceLayout(null | fn | [])`.
**Spec-derived expectation:** fail-soft to the derived default; never throws (deep-sanitize, corrupt layout never crashes boot).
**Observed:** corrupt JSON → `get().layout` deep-equals `defaultLayout()`, no throw; bad-shape layout → `defaultLayout()`; `coerceLayout(null/fn/[])` → `defaultLayout()`; no throw.
**Result:** PASS

### F2 (§4 F2, §2.6.6) `panes[]` naming an unregistered pane → dropped + warning; no phantom node
**Input:** layout `panes:[{ghost,left,order0}]` with an empty registry.
**Spec-derived expectation:** the unregistered pane is dropped with a host `console.warn`; it never creates a phantom node; no graph surface.
**Observed:** no `pane-ghost` node in the envelope; exactly one `console.warn`:
`assembleAppGraphEnvelope: dropping layout entry for unregistered pane "ghost"`.
**Result:** PASS

### F3 (§4 F3, §2.6.7) Unknown `zone` value → default zone (`left`)
**Input:** `coerceLayout({version:1,panes:[{a,zone:<'bogus'|'stage'|'top-bar'|'nope'>,order1}]})`.
**Spec-derived expectation:** an unknown zone coerces to the default zone `left` (the legacy `[sidebar]` mapping; `stage`/`top-bar` are regions, not pane zones).
**Observed:** every case → `{id:'a',zone:'left',order:1,collapsed:false}`.
**Result:** PASS

### F4 (§4 F4, §2.6.5, W2-N2) `size` invalid → zone default; finite positive preserved
**Input:** `coerceLayout({version:1,zones:{left:{size:333},right:{size:-1},header:{size:Infinity},footer:{size:44}},stage:{size:700},topBar:{size:40}})`; plus per-value `0/-1/NaN/±Infinity`.
**Spec-derived expectation:** a finite positive size is preserved as-is; `≤0`, `NaN`, `±Infinity` fail soft to the zone default (never a negative/NaN track).
**Observed:** `left 333`, `footer 44`, `stage 700`, `topBar 40` preserved; `right -1 → 220`, `header Infinity → 48`; loop `0/-1/NaN/±Infinity → left 220`.
**Result:** PASS

### F5 (§4 F5) Duplicate pane ids in `panes[]` → first wins
**Input:** `coerceLayout({version:1,panes:[{a,left,order1,false},{a,right,order2,true}]})`.
**Spec-derived expectation:** first occurrence wins.
**Observed:** `[{id:'a',zone:'left',order:1,collapsed:false}]`.
**Result:** PASS

### F6 (§4 F6, §2.2) Credentials in the store → never copied into `layout`
**Input:** seeded settings file with top-level `token`/`password` and a layout carrying `token`/`auth`/`junk`.
**Spec-derived expectation:** credentials are never serialized into `layout`; unknown fields dropped.
**Observed:** `get()` keys exactly `["enabledPanes","defaultDocumentId","topK","editingMode","theme","layout"]`; layout keys exactly `["version","panes","zones","stage","topBar"]`; JSON contains no `token`/`password`/`junk`/`auth`.
**Result:** PASS

### F7 (§4 F7) A layout write fails → the in-memory layout still applies
**Input:** store created on an unwritable path (`/nonexistent-dir-xyz-12345/settings.json`); `set({layout})`.
**Spec-derived expectation:** the persist failure is swallowed and the in-memory layout still applies for the session.
**Observed:** `set` did not throw; `get().layout.panes = [{id:'z',zone:'right',order:0,collapsed:false}]`.
**Result:** PASS

### F8 (§4 F8, §2.3 HARD PRECONDITION) `targetPlacement` names a missing container → producer reassembled
**Input:** traversal envelope with only a `main` zone; layout places `a` in `left`.
**Spec-derived expectation:** every `targetPlacement` names a container that exists in the same envelope; the assembler adds the missing producer; never unplaced-silent.
**Observed:** a `left` container producer is emitted (`{"placementName":"left"}`); `pane-a` placement `{"targetPlacement":["left"]}`.
**Result:** PASS

---

## §2.7 Adversarial regressions

### H1 (§2.7 H1) id-only `zone:left` child (no `placementName`) → real anchor; pane not unplaced
**Input:** traversal envelope with an extra template child `{type:'div',props:{id:'zone:left'}}` (no `placementName`); layout places `a` in `left`.
**Spec-derived expectation:** a node matched only by `props.id` must not be treated as the container; a real producer is added or its `placementName` synthesized; panes targeting `left` are never unplaced-silent.
**Observed:** exactly one left container (an id-only `zone:left` whose `placementName` is `"left"`); `pane-a` placement `{"targetPlacement":["left"]}`. (This is the post-fix behavior recorded as FIXED in §2.7 H1.)
**Result:** PASS

### AF-2 (§2.7 AF-2, §2.6.9) Malformed `version` → defaults
**Input:** `coerceLayout({version:<NaN|-1|1.5|'1'|Infinity|-Infinity|undefined>,panes:[{a,right,order0}]})`.
**Spec-derived expectation:** a non-integer, negative, or non-finite version is corrupt → derive defaults.
**Observed:** every case → `panes:[]` and the whole value deep-equals `defaultLayout()`.
**Result:** PASS

---

## §2.6 Pins

### P1 (§2.6.1) `layout-state.ts` publicly exports the model helpers
**Input:** module namespace of `src/renderer/layout-state.ts`.
**Spec-derived expectation:** a public export owning the `LayoutState` types + `defaultLayout`/`deriveLayout`/`coerceLayout`.
**Observed:** exports `LAYOUT_VERSION (1)`, `LAYOUT_PANE_ZONES`, `LAYOUT_REGIONS`, `LAYOUT_ZONE_MIN/MAX`, `LAYOUT_REGION_MIN/MAX`, `isLayoutZoneName`, `defaultLayout`, `deriveLayout`, `coerceLayout` (all three helpers are functions). (Types are compile-time only — see "not tested".)
**Result:** PASS

### P2 (§2.6.2) `assembleAppGraphEnvelope({ layout })` optional; omitted derives default
**Input:** `assembleAppGraphEnvelope({traversalEnvelope,registry,ctx})` (no `layout`); `deriveLayout([{id:'a'},{id:'b',defaultZone:'right',defaultOrder:2}])`.
**Spec-derived expectation:** `layout` is optional and omitted → derive the default from the registry (additive `defaultZone`/`defaultOrder`, else scope-derived zone + registration order, W2-Q4).
**Observed:** omitted `layout` places `pane-a` at `left`; `deriveLayout` returns `[a(zone left), b(zone right, order 2)]` in registration order (positional fallback observed 0-based, e.g. `a.order=0`).
**Result:** PASS

### P3 (§2.6.3) `order` manifests as payload order; no `data-order` prop
**Input:** layout with panes `a(order2)`, `b(order1)`, `c(order3)` all in `left`.
**Spec-derived expectation:** `PaneLayoutEntry.order` manifests as the payload order panes are attached to a zone container; no `data-order` prop.
**Observed:** payload order `["pane-b","pane-a","pane-c"]`; envelope JSON contains no `data-order`.
**Result:** PASS

### P4 (§2.6.4) Mirror placement
**Input:** layout with `pane-a` `collapsed:true` in `left` and `left.minimized:true`.
**Spec-derived expectation:** `is-collapsed` on the `pane-<id>` root; `is-empty`/`is-minimized`/`is-revealed` on the `zone:<name>` container.
**Observed:** `pane-a.css = {classes:["is-collapsed"]}`; `left.css = {classes:["is-minimized"]}`; `right.css = {classes:["is-empty"]}`. (`is-revealed` is drag-time, U-SHELL-4 — see "not tested".)
**Result:** PASS

### P5 (§2.6.5) Finite positive size preserved (36–48 px strips)
**Input:** `coerceLayout({version:1,zones:{header:{size:36},footer:{size:48}},topBar:{size:36}})`.
**Spec-derived expectation:** a finite positive size is preserved on load, including 36–48 px strips.
**Observed:** `header 36`, `footer 48`, `topBar 36`.
**Result:** PASS

### P6 (§2.6.6) Unregistered-pane warning channel is `console.warn`
**Input:** layout naming an unregistered `ghost` pane (empty registry).
**Spec-derived expectation:** the dropped unregistered pane is reported via `console.warn`; no graph surface.
**Observed:** ≥1 `console.warn` captured; message `assembleAppGraphEnvelope: dropping layout entry for unregistered pane "ghost"`; no phantom node.
**Result:** PASS

### P7 (§2.6.7) Unknown zone coerces to `left`
**Input:** `coerceLayout({version:1,panes:[{a,zone:'bogus',order1}]})`.
**Spec-derived expectation:** unknown zone → `left`.
**Observed:** `{zone:'left'}`.
**Result:** PASS

### P8 (§2.6.8) `index.html` grid named areas `top-bar`/`header`/`left`/`stage`/`right`/`footer`
**Input:** `src/renderer/index.html`.
**Spec-derived expectation (pin 8):** CSS `grid-template-columns` / `grid-template-rows` /
`grid-template-areas` with **named areas `top-bar`, `header`, the mid row's three tracks
`left` / `stage` / `right`, and `footer`** (the mid row has **no** composite `main` area).
**Observed:** the three grid properties are present; the `grid-template-areas` declaration
(beginning `src/renderer/index.html:85`) names the area tokens
`["top-bar","top-bar","top-bar","header","header","header","left","stage","right","footer","footer","footer"]`.
There is no `main` named area (the middle row is `left stage right`; the stage cell is
styled via `.layout #app { grid-area: stage; }` at `:95`). The `<main class="layout">`
element is a DOM tag, not a grid-area name.
**Result:** PASS.
**Reconciliation:** the initial blind run recorded this as a FAIL because the then-current
pin 8 named a composite `main` area that conflicts with §2.4. The Architect corrected pin 8
(`unit-u-shell-1-layout-zones.md` §2.6 pin 8, "Reconciled after the blind-test P8 finding,
2026-09-12") to name the mid-row tracks `left`/`stage`/`right` with no composite `main`; the
built CSS already matches that corrected pin. Doc-side drift, now closed — no runtime
behavior was ever affected.

### P9 (§2.6.9) Malformed version treated as corrupt → defaults
**Input:** `coerceLayout({version:<NaN|-1|'1'|Infinity>,panes:[{a,right,order0}]})`.
**Spec-derived expectation:** the same fail-soft path as `version > 1`.
**Observed:** every case → `defaultLayout()`.
**Result:** PASS

---

## Spec statements not tested (and why)

1. **§2.1 `LayoutState`/`PaneLayoutEntry`/`ZoneLayout` TypeScript types** — compile-time
   shapes, not runtime-assertable in a greens run. The runtime `defaultLayout()` shape was
   asserted instead (`version/panes/zones{left,right,header,footer}/stage/topBar`).
2. **§2.2 `OperatorSettingsPatch.layout` + the operator-settings IPC transport** — the
   Electron main/preload IPC wiring (`IPC_OPERATOR_SETTINGS_GET/SET`) is not node-testable
   here; only the store's `get`/`set` (the transport payload) was exercised. The patch/type
   contract is compile-only.
3. **§2.3 `is-revealed` drag marker** — drag is U-SHELL-4 (deliberately out of U-SHELL-1 per
   §7); no reveal API is owned by this unit. Not testable here.
4. **§2.4 actual track collapse geometry** ("an empty zone's track collapses; a minimized
   zone's track collapses to its tab strip") and the **Q5 content-scope boundary** — DOM/CSS
   behavior. Only the *inputs* (the `is-empty`/`is-minimized` mirror classes, P4, and the grid
   mechanism, P8) are node-verifiable. The geometry gestures are U-SHELL-4/5 (Q9) and were not
   exercised.
5. **§2.5 boot host read + write-through** (`bridge.operatorSettings.set({layout})`) — recorded
   as W2-N1 **OPEN** (§D): the host boot read/write-through was not in U-SHELL-1's red set
   (node-level only). The store `set`/`get` path was exercised directly (S7/S5).
6. **§3.1 / §2.3 live `list_targets` provident-node visibility** — the running MCP host
   exposes an unrelated shell demo (`preempt-root`), not the Astrographer app graph. The
   zone-container provident producers were verified structurally in the assembled envelope
   (S1/F8/H1); the live-graph `list_targets` leg is the W2-N1 host-boot item.
7. **§2.7 AF-3 / AF-4** — the spec marks these **DEFERRED** (→ W2-N3/N4, both OPEN): zone
   `size` not yet applied to the shell grid; the operator-pane `grid-area` dead rule. They are
   recorded OPEN by the spec, not U-SHELL-1 failures.
8. **W2-Q16 "drop unknown pane ids" at the sanitize layer** — `coerceLayout` has no
   `PaneRegistry` argument, so it cannot drop *unregistered* ids by definition; the
   unregistered-drop is enforced at assembly (F2/P6) where the registry is available. The pure
   coerce path preserves ids by shape (F5 first-wins). Recorded as a minor spec ambiguity (the
   W2-Q16 phrasing places this on `sanitize`, the build places it on the assembler).
9. **§2.7 "confirmed-safe" prototype pollution** — `coerceLayout` with a `__proto__`-polluting
   input object was probed clean (`({}).polluted !== true`); the **full persist** path
   (memory→disk→reload) was not separately asserted beyond F6's unknown-field/credential drop.
   Partially covered.
