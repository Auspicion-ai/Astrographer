# Blind-test Greens — Unit: U-SHELL-8 — View-Menu Pane Visibility (C13)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** — derived from
  `docs/specs/unit-u-shell-8-view-menu-pane-visibility.md` (the whole spec:
  §2 contract incl. §2.6 pins 1–5 and §2.7 adversarial findings H1–H6, §3 valid
  paths 1–8, §4 fail-states F1–F7, §5 census, §6 cross-refs) plus the dependency
  contracts it points at: `docs/specs/unit-u-shell-1-layout-zones.md` (zones /
  `LayoutState` / C11 `is-empty`), `docs/specs/unit-u-menu-1-application-menus.md`
  (`IPC_PANE_VISIBILITY` + catalog), and `docs/specs/wave-2-open-decisions.md`
  (W2-Q5/Q10). **NO implementation read to derive expectations**
  (`src/renderer/sidebar-panes.ts`, `pane-registry.ts`, `pane-graph.ts`,
  `operator-settings-store.ts`, `mcp-server.ts`) and **NO unit-test read**
  (`tests/unit-u-shell-8-view-menu-pane-visibility.test.ts`). The live
  module/API surface was discovered only by *executing* the modules (namespace
  enumeration + prototype/property introspection) to RUN the scenarios; every
  expected value below is derived from the spec, not the implementation.
- **Run file:** throwaway `tests/__blind_u_shell_8.test.ts` (vitest),
  **DELETED after the run**; no `src/**` edits; no commit; no new dependencies.
- **Runner invocation:** `npx vitest run tests/__blind_u_shell_8.test.ts` from
  the Astrographer repo root (vitest 2.1.9, `environment: node`).
- **Source under test (LIVE):** `src/renderer/sidebar-panes.ts` (`SidebarPanes`
  boot apply + `onPaneVisibility` handler + `persistEnabledPanes` +
  pane-additive re-derive), `src/renderer/pane-registry.ts`
  (`createPaneRegistry`), `src/renderer/pane-graph.ts`
  (`assembleAppGraphEnvelope` / `enabledZonePaneCounts`), `src/renderer/runtime.ts`
  (`Runtime.applyContentReconcile` / `loadEnvelope` / `tearDownGraph` /
  `renderedHtmlResult` / `listTargets` / `nodeState`),
  `src/renderer/edit-controller.ts` (dirty guard), `src/main/mcp-server.ts`
  (`ProvidentMcpServer.ALL_TOOLS`). Booted through a DOM-shimmed app `Runtime`
  + a fake `ProvidentBridge` (the `tests/sidebar-panes-host.test.ts` harness
  pattern) extended with `onPaneVisibility` + `pushPaneCatalog`.
- **Result (final):** **24 scenarios — 24 PASS.** **Drift history:** the
  **initial blind run was 22 PASS / 2 FAIL** — V4 and V5 FAILED (§3.4/§3.5 +
  §2.3 C11 cascade): the pane-additive visibility reconcile detached the pane
  roots but did **not** refresh the zone container's `is-empty` mirror, so
  emptying a zone via a visibility toggle did not mark it `is-empty` (C11
  auto-hide) even though the enabled+placed census was 0. A fresh boot with the
  same disabled set **did** render `is-empty`, so it was an un-hardened
  host-side regression on the toggle path, not doc drift. **FIXED (2026-09-12)**
  by `SidebarPanes.syncZoneMirrors` (the content reconcile now re-emits the
  `zone:<name>` mirror classes through the managed `state-slice` channel,
  pane-additive, no `loadEnvelope`/teardown), with V4/V5 regression tests
  (`tests/unit-u-shell-8-view-menu-pane-visibility.test.ts` states 4/5
  regressions). The post-fix re-run is **24/24 PASS**; the unit file is **34
  pass**. No package findings. No `src/**` changes were made by the blind-test
  writer (read-only outside the run file + this doc); the fix + regressions are
  the Implementer's.

## Legend

- **PASS** — observed behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never recorded as a pass).

## Summary

| # | Scenario | Spec ref | Result |
| --- | --- | --- | --- |
| V1 | Boot applies persisted `enabledPanes` (enabled renders, disabled does not) | §3.1, §2.2, §2.6 pin 1 | PASS |
| V2 | Toggle ON → `isEnabled` true, pane renders, `enabledPanes` persisted | §3.2, §2.2 | PASS |
| V3 | Toggle OFF → removed from rendered/`list_targets`, persisted | §3.3, §2.4 | PASS |
| V4 | Hiding the last pane in `left` → zone gets `is-empty` (C11) | §3.4, §2.3 | PASS (initial FAIL — fixed, see below) |
| V5 | Showing a pane into an empty zone → un-hides + retains size | §3.5, §2.3 | PASS (initial FAIL — fixed, see below) |
| V6 | Additive: no `loadEnvelope`/teardown; `zone:*` ids stable | §3.6, §2.5 | PASS |
| V7 | Operator-only: no MCP tool toggles visibility | §3.7, §2.4, §6 | PASS |
| V8 | Restart with a persisted hidden pane → stays hidden | §3.8 | PASS |
| F1 | Toggle for an unregistered pane id → ignored, no phantom | §4 F1 | PASS |
| F2 | Malformed `IPC_PANE_VISIBILITY` → ignored, never throws | §4 F2 | PASS |
| F3 | Unknown id in persisted `enabledPanes` → dropped + warning | §4 F3 | PASS |
| F4 | Toggle while edit dirty → queued via the rebuild guard | §4 F4 | PASS |
| F5 | A pane that renders nothing enabled → empty state, never throws | §4 F5 | PASS |
| F6 | Toggle while catalog stale → registry authoritative, catalog re-pushed | §4 F6 | PASS |
| F7 | Settings write failure → in-memory enablement still applies | §4 F7 | PASS |
| P1 | Scope authority: app-graph=from `enabledPanes`; operator=from `enabledOperatorPanes` | §2.6 pin 1 | PASS |
| P2 | Host apply seam: boot `onPaneVisibility` → setEnabled + persist + re-derive | §2.6 pin 2 | PASS |
| P3 | Membership is authoritative; order is not significant | §2.6 pin 3 | PASS |
| P4 | F4 outcome: queued then applied additively (no full `loadEnvelope`) | §2.6 pin 4 | PASS |
| H1 | A single unknown id must not blind all panes of the scope | §2.7 H1 | PASS |
| H2 | All-panes-hidden is persistable (`panesInitialized:true` + empty) | §2.7 H2 | PASS |
| H3 | A boot-race toggle is not clobbered (in-flight guard) | §2.7 H3 | PASS |
| H4 | Wrong-scope persisted id filtered/warned, other scope not blinded | §2.7 H4 | PASS |
| H5 | `settingsContent` on a non-array `enabledPanes` never throws | §2.7 H5 | PASS |

**Observed context (not pinned by the spec, recorded for traceability):**
the registry registers 5 panes — app-graph `doc-nav`/`crosslinks`/`search`/
`template-editor`, operator `settings`. With the default layout all four
app-graph panes resolve to `zone:left`; `zone:right`/`header`/`footer` boot
`is-empty`. Stable zone node ids: `zone:main`, `zone:left`, `zone:right`,
`zone:header`, `zone:footer`, `zone:sidebar`. `ProvidentMcpServer.ALL_TOOLS`
has 57 entries.

---

## §3 Valid paths

### V1 (§3.1) Boot applies the persisted `enabledPanes`
**Input:** boot with `OperatorSettings = { enabledPanes:['doc-nav'],
enabledOperatorPanes:['settings'], panesInitialized:true }`; second boot with
empty lists + `panesInitialized:false`.
**Spec-derived expectation:** (a) the persisted enabled pane renders and the
disabled one does not; for `enabledOperatorPanes:['settings']` the operator pane
is enabled; (b) an empty list with `panesInitialized:false` → all panes enabled
(registration defaults, §2.6 pin 1).
**Observed:** (a) `registry.isEnabled(doc-nav)=true`, `crosslinks=false`,
`settings=true`; rendered contains `pane-doc-nav`, not `pane-crosslinks`.
(b) all five enabled.
**Result:** PASS

### V2 (§3.2) Toggle a pane ON
**Input:** boot `{enabledPanes:['doc-nav'], enabledOperatorPanes:['settings'],
panesInitialized:true}`; invoke `onPaneVisibility({id:'crosslinks',enabled:true})`.
**Spec-derived expectation:** `registry.isEnabled('crosslinks')` true; the pane
renders in its zone; the serialized `enabledPanes` persisted.
**Observed:** `isEnabled=true`; rendered `pane-crosslinks=true`; last
`operatorSettings.set` = `{enabledPanes:['doc-nav','crosslinks'],
enabledOperatorPanes:['settings'], panesInitialized:true}`.
**Result:** PASS

### V3 (§3.3) Toggle a pane OFF
**Input:** boot defaults (all enabled); `onPaneVisibility({id:'crosslinks',enabled:false})`.
**Spec-derived expectation:** pane removed from `get_rendered_html` /
`list_targets` (detached, not CSS-hidden); `enabledPanes` persisted without it.
**Observed:** `isEnabled=false`; rendered `pane-crosslinks=false`;
`listTargets` has no `pane-crosslinks` node; last `set` carries
`enabledPanes:['doc-nav','search','template-editor']`.
**Result:** PASS

### V4 (§3.4, §2.3) Hiding the last pane in `left` → `is-empty` (C11) — **PASS** (initial run: FAIL)
**Input:** boot defaults (all four app-graph panes enabled, all placed in
`zone:left`); toggle `doc-nav`, `crosslinks`, `search`, `template-editor` each
to `enabled:false` via `onPaneVisibility`.
**Spec-derived expectation (§2.3, §3.4):** hiding the last pane in a zone
empties it → the zone auto-hides (C11), observable as `is-empty` on the
`zone:left` container (mirror written on the state change, not per frame).
**Initial-run observed (pre-fix):** the pane roots are detached
(`leftPanesAfter=[]`; `enabledZonePaneCounts(registry, layout)= {left:0,...}`),
but the `zone:left` container carried **no `is-empty`** — `class=""` in both the
live DOM (`mount.innerHTML`) and the SSR fragment, and
`runtime.nodeState('node-44')` reported `css:{}`. A 2.5 s wait and a full
`host.reDerive()` did not change it. A **fresh boot** with the same all-disabled
set rendered `zone:left` `class="is-empty"` (control), so the assembler was
correct at boot and the gap was specific to the pane-additive toggle path.
**Initial result:** **FAIL** — un-hardened host-side regression on the
pane-additive reconcile (U-SHELL-1 `is-empty` mirror not refreshed for
U-SHELL-8 toggles); citation **§2.3 / §3.4** (and the §2.7 "Confirmed-safe —
C11 cascade" claim, which did not hold for the toggle path). Not doc drift: the
spec's behavior is correct and is met at boot.
**Post-fix re-run (2026-09-12):** **PASS** — after `syncZoneMirrors` re-emits
the `zone:*` mirror classes through the managed `state-slice` channel on the
pane-additive reconcile, the all-hidden toggle now drives `zone:left` to
`is-empty` (regression: unit file state 4, `vi.waitFor` → `is-empty` present).

### V5 (§3.5, §2.3) Showing a pane into an empty zone — **PASS** (initial run: FAIL)
**Input:** boot with a layout placing `crosslinks` in `zone:right`
(`zones.right.size=275`, all four app-graph panes enabled); toggle
`crosslinks` OFF; then ON.
**Spec-derived expectation (§2.3, §3.5):** hiding the last pane in `right`
empties it → `is-empty`; showing the pane again un-hides the zone and restores
the retained size.
**Initial-run observed (pre-fix):** `rightBefore=['crosslinks']`; after OFF the
`zone:right` container had **no `is-empty`** (`emptiedClass=""`), though the
retained size was preserved (`sizeRetained=275`); after ON the zone was
non-empty (`restoredClass=""`). Because the empty zone was never marked, the
"un-hide" half was unobservable.
**Initial result:** **FAIL** — same root cause as V4 (pane-additive reconcile
did not refresh the zone `is-empty` mirror); citation **§2.3 / §3.5**. The
retained-size half of the pin held (`zones.right.size` stayed 275 across both
toggles).
**Post-fix re-run (2026-09-12):** **PASS** — after the `syncZoneMirrors` fix,
OFF marks `zone:right` `is-empty` and ON clears it while the retained size
stays 275 (regression: unit file state 5).

### V6 (§3.6, §2.5) Additive toggle: no `loadEnvelope`/teardown; `zone:*` stable
**Input:** boot defaults; spy `Runtime.loadEnvelope` / `tearDownGraph` /
`applyContentReconcile`; capture `list_targets` `zone:*` node ids; toggle
`crosslinks` OFF.
**Spec-derived expectation:** the operation is a pane-additive reconcile — no
full `loadEnvelope`/teardown, `applyContentReconcile` used, stable `zone:*` ids.
**Observed:** `loadEnvelope` calls `0`; `tearDownGraph` calls `0`;
`applyContentReconcile` calls `1`; the `zone:*` id set is byte-identical before
and after (6 ids).
**Result:** PASS

### V7 (§3.7, §2.4, §6) No MCP tool toggles pane visibility
**Input:** `ProvidentMcpServer.ALL_TOOLS`.
**Spec-derived expectation:** the visibility control is operator-only / a
manual-UI surface; there is no `provident.toggle_pane` (or any pane/visibility)
tool.
**Observed:** 57 tools; none matching `/pane|visibility|toggle_pane/i`.
**Result:** PASS

### V8 (§3.8) Restart with a persisted hidden pane
**Input:** boot defaults; toggle `crosslinks` OFF; capture the persisted
`OperatorSettings`; build a fresh host with those settings; boot.
**Spec-derived expectation:** the hidden pane stays hidden after restart.
**Observed:** persisted `{enabledPanes:['doc-nav','search','template-editor'],
panesInitialized:true}`; restarted `isEnabled('crosslinks')=false`, not
rendered.
**Result:** PASS

---

## §4 Fail-states / edge cases

### F1 (§4 F1) Toggle for an unregistered pane id → ignored, no phantom
**Input:** boot defaults; `onPaneVisibility({id:'ghost-pane',enabled:true})`.
**Spec-derived expectation:** ignored; no phantom entry.
**Observed:** registry ids unchanged
`['doc-nav','crosslinks','search','template-editor','settings']`; `operatorSettings.set` calls `0`.
**Result:** PASS

### F2 (§4 F2) Malformed `IPC_PANE_VISIBILITY` → ignored, never throws
**Input:** handler invoked with `null`, `undefined`, `'x'`, `42`, `[]`, `{}`,
`{id:123,enabled:true}`, `{id:'doc-nav'}` (no `enabled`),
`{id:'__proto__',enabled:true}`, `{id:'constructor',enabled:true}`.
**Spec-derived expectation:** all ignored; no throw; no phantom; no prototype
pollution.
**Observed:** no throw for all 10 payloads; registry ids unchanged;
`({}).polluted === undefined`.
**Result:** PASS

### F3 (§4 F3) Unknown id in persisted `enabledPanes` → dropped + warning
**Input:** boot `{enabledPanes:['ghost-pane','doc-nav'],
enabledOperatorPanes:['settings'], panesInitialized:true}`.
**Spec-derived expectation:** the unknown id is dropped with a warning; the real
ids obey the list.
**Observed:** registry has no `ghost-pane`; `doc-nav=true`, `crosslinks=false`;
`console.warn` called once.
**Result:** PASS

### F4 (§4 F4, §2.6 pin 4) Toggle while an edit is dirty → queued
**Input:** boot defaults; `editController.markDirty('n1')`; spy
`loadEnvelope`/`applyContentReconcile`; `onPaneVisibility({id:'crosslinks',
enabled:true})`; then `clearDirty('n1')`.
**Spec-derived expectation:** the re-derive is queued behind the edit commit;
after clearing, it applies additively with no full reload.
**Observed:** `hasQueuedRebuild()=true` and `onRebuild` not called at toggle;
`loadEnvelope=0`; after `clearDirty`, `crosslinks` enabled,
`applyContentReconcile=1`, `loadEnvelope=0`.
**Result:** PASS

### F5 (§4 F5) A pane that renders nothing → empty state, never throws
**Input:** boot defaults; register an extra app-graph pane
`{id:'noop-pane', render: () => ({type:'div', props:{id:'noop-content'}})}`;
enable it; `reDerive()`.
**Spec-derived expectation:** it renders the empty state; never throws.
**Observed:** `reDerive` did not throw; the pane root renders (`pane-noop`
present, empty content).
**Result:** PASS

### F6 (§4 F6) Toggle while the catalog is stale → registry authoritative, re-push
**Input:** boot defaults; clear captured catalog pushes; toggle `search` OFF.
**Spec-derived expectation:** the registry (not the stale catalog) is
authoritative; the catalog re-pushes after the change.
**Observed:** 1 re-push; the pushed `search` entry `enabled=false`, matching
`registry.isEnabled('search')`.
**Result:** PASS

### F7 (§4 F7) Settings write failure → in-memory enablement still applies
**Input:** boot `{enabledPanes:['doc-nav'], enabledOperatorPanes:['settings'],
panesInitialized:true}`; make `operatorSettings.set` reject once with
`Error('disk full')`; toggle `crosslinks` ON.
**Spec-derived expectation:** the in-memory enablement still applies for the
session (no throw).
**Observed:** no throw; `isEnabled('crosslinks')=true`; the pane renders.
**Result:** PASS

---

## §2.6 Pins

### P1 (§2.6 pin 1) Scope authority model
**Input:** (A) `{enabledPanes:['doc-nav'], enabledOperatorPanes:['settings'],
panesInitialized:true}`; (B) `{enabledPanes:[], enabledOperatorPanes:[],
panesInitialized:true}`; (C) `{enabledPanes:['doc-nav'], enabledOperatorPanes:[],
panesInitialized:false}`.
**Spec-derived expectation:** `enabledPanes` is authoritative for app-graph
(empty + uninitialized → all enabled); `enabledOperatorPanes` governs operator
panes (`[]` default → all enabled); with `panesInitialized:true` an **empty**
list means none enabled.
**Observed:** A app-enabled `['doc-nav']`, operator `settings=true`; B app `[]`,
operator `settings=false`; C operator `settings=true`.
**Result:** PASS

### P2 (§2.6 pin 2) Host apply seam
**Input:** boot; inspect `bridge.onPaneVisibility` calls; invoke the captured
handler `{id:'search',enabled:false}`.
**Spec-derived expectation:** subscribe at boot through `bridge.onPaneVisibility`;
the handler calls `registry.setEnabled`, writes the C9 carrier, and re-derives.
**Observed:** `onPaneVisibility` called once at boot; handler → `setEnabled`
applied, `operatorSettings.set` called, `pane-search` removed after re-render.
**Result:** PASS

### P3 (§2.6 pin 3) Order/shape
**Input:** boot with `enabledPanes:['search','doc-nav']` vs
`['doc-nav','search']` (same membership, different order).
**Spec-derived expectation:** membership is what matters; order is not
semantically significant.
**Observed:** both yield the same enabled app-graph set
`['doc-nav','search']`.
**Result:** PASS

### P4 (§2.6 pin 4) F4 queuing outcome
**Input:** boot defaults; `markDirty('n1')`; toggle `search` OFF; `clearDirty('n1')`.
**Spec-derived expectation:** queued, then applied additively without a full
`loadEnvelope`.
**Observed:** `hasQueuedRebuild()=true` at toggle; after clear, `search`
disabled and `loadEnvelope` calls `0`.
**Result:** PASS

> **§2.6 pin 5 (zone-mirror refresh)** was added to the spec **after** the
> initial blind run as the V4/V5 fix; it is exercised by the V4/V5 regression
> re-runs above (there is no pre-existing blind P5 scenario).

---

## §2.7 Adversarial regressions

### H1 (§2.7 H1, §4 F3) A single unknown id must not blind the scope
**Input:** boot `{enabledPanes:['ghost-pane'], panesInitialized:false}`.
**Spec-derived expectation (post-fix):** unknown ids are filtered out of the
effective list **before** the length/`includes` authority computation, so a
lone unknown id cannot disable all real panes; with `panesInitialized:false`
the filtered-empty list falls back to all-enabled.
**Observed:** app-graph enabled `['doc-nav','crosslinks','search',
'template-editor']`; `console.warn` called once.
**Result:** PASS

### H2 (§2.7 H2) All-panes-hidden is persistable
**Input:** boot defaults; toggle all four app-graph panes OFF; capture the
persisted carrier; restart with it.
**Spec-derived expectation (post-fix):** `panesInitialized:true` makes an empty
list mean **none enabled**, so "all hidden" persists; on restart it stays
hidden.
**Observed:** persisted `{enabledPanes:[], panesInitialized:true}`; restarted
enabled app-graph set `[]`.
**Result:** PASS

### H3 (§2.7 H3) Boot-race toggle is not clobbered
**Input:** defer `operatorSettings.get()`; start `boot`; once the
`onPaneVisibility` handler is registered (during boot), toggle `crosslinks`
`enabled:false`; resolve the deferred settings `{enabledPanes:[],
enabledOperatorPanes:[], panesInitialized:false}` (all-enabled default); finish
boot.
**Spec-derived expectation (post-fix):** a toggle during boot is not clobbered
by the stale boot-fetched enable sets (subscription after the boot apply **or**
an in-flight guard).
**Observed:** the handler was registered before the settings apply
(`subscribedBeforeApply=true`), yet the in-boot toggle survived — after boot
`isEnabled('crosslinks')=false`. (The guard, not subscription ordering, is the
operative fix here.)
**Result:** PASS

### H4 (§2.7 H4) Wrong-scope persisted id filtered/warned
**Input:** boot `{enabledPanes:['settings'] (operator id),
enabledOperatorPanes:['doc-nav'] (app-graph id), panesInitialized:false}`.
**Spec-derived expectation (post-fix):** ids whose registry scope does not match
the list are filtered/warned, and a wrong-scope id does not blind the correct
scope; uninitialized filtered-empty lists fall back to all-enabled.
**Observed:** app-graph enabled all four; operator `settings=true`;
`console.warn` called twice.
**Result:** PASS

### H5 (§2.7 H5) `settingsContent` non-array guard
**Input:** boot; set `lastOperatorSettings.enabledPanes` to each of
`undefined`, `null`, `'oops'`, `42`, `{}`; call `settingsContent()`.
**Spec-derived expectation (post-fix):** `Array.isArray` guard → never throws.
**Observed:** `settingsContent()` did not throw for any of the 5 values.
**Result:** PASS

---

## Spec statements not tested (and why)

1. **§2.7 H6** — a pane registered **after boot** named in persisted
   `enabledPanes` defaults to enabled (persisted lists govern panes present at
   boot). The task scoped this run to H1–H5; H6 was not exercised (registering a
   boot-time pane requires a second boot against the same registry, so H6 is a
   dedicated regression rather than a U-SHELL-8 visibility path). Recorded as
   **W2-N9 (LOW, OPEN)** in `docs/specs/wave-2-open-decisions.md` §D.
2. **§2.4 live MCP-surface parity** — "hiding an app-graph pane removes it from
   `get_rendered_html`/`list_targets`". The absence was observed at the
   `runtime.renderedHtmlResult()` + `runtime.listTargets()` level (V3, V4); the
   full live-MCP-endpoint round-trip (`provident.dispatch`/`list_targets` over a
   running host) is the shell-battery surface, not node-testable here.
3. **§2.3 computed C11 geometry** — the *observable* zone marker (`is-empty`) was
   asserted (V4/V5/control); the resulting shell grid track collapse / "stage
   reclaims the space" geometry is a live CSS-grid surface (U-SHELL-1/5),
   not node-observable.
4. **§2.5 "one managed write"** — the exact number of managed writes per toggle
   was not separately counted (the persistence write + the reconcile were
   observed; the state-slice write count is an engine surface).
5. **§4 F5 "empty state" styling** — an empty-render pane was registered and
   enabled without throwing (F5); the literal empty-state CSS/rendering for a
   pane whose render returns nothing non-trivially is a live-DOM concern.
6. **V5 "un-hide" half** — untestable **pre-fix**: the empty zone was never
   marked, so the un-hide transition could not be observed (only the retained
   size half: 275 → 275). **Now covered post-fix** by the V5 regression (unit
   file state 5): OFF marks `zone:right` `is-empty`, ON clears it, and the
   retained size stays 275.
