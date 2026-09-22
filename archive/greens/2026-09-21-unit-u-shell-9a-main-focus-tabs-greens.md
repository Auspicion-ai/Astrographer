# Blind-test Greens — Unit: U-SHELL-9a — Main-Focus Tab Strip + Focus Model + Single-Active Render + MCP `provident.focus`

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** — derived from
  `docs/specs/unit-u-shell-9a-main-focus-tabs.md` (whole spec: §2 contract,
  §2.9 pins 1–9, §3 states 1–9, §4 fail-states F1–F9, §5 census) plus the
  pinned decision rows (`DECIDED: MCP-FOCUS-TOOL`, `DECIDED: MCP-UI-EQUIVALENCE`,
  `DECIDED: UI-CONFIG-CARRIER`). **NO implementation read**
  (`src/renderer/tab-state.ts`, `src/renderer/tab-strip.ts`,
  `src/renderer/sidebar-panes.ts`, `src/renderer/renderer.ts`,
  `src/main/mcp-server.ts`, `src/renderer/pane-graph.ts`) and **NO unit-test read**
  (`tests/unit-u-shell-9a-main-focus-tabs.test.ts`). The live module/API surface
  was discovered only by *executing* the modules (namespace enumeration +
  call/arity probing); every expected value below is derived from the spec, not
  from the implementation.
- **Run file:** a throwaway `tests/__blind_u_shell_9a.test.ts` (vitest),
  **DELETED after the run**; no `src/**` edits; no commit; no new dependencies.
- **Runner invocation:** `npx vitest run tests/__blind_u_shell_9a.test.ts` from
  the Astrographer repo root.
- **Source under test (LIVE modules):** `src/renderer/tab-state.ts`
  (`TAB_STATE_VERSION`, `defaultTabState`, `coerceTabState`, `targetEquals`,
  `activeTab`, `focusTarget`, `openTab`, `closeTab`, `reorderTab`,
  `setSearchParams`, `resolveDefaultTarget`, `ensureFirstTab`),
  `src/renderer/tab-strip.ts` (`TabStrip`), `src/renderer/sidebar-panes.ts`
  (`SidebarPanes.mountTab`/`getTabContext`/`expandSearchTab`/sidebar bridge),
  `src/renderer/pane-graph.ts` (`searchContent`/`searchTabContent`),
  `src/main/operator-settings-store.ts`, `src/main/mcp-server.ts`
  (`toolForName`/`RendererBackend`), `src/main/security.ts` (`groupForTool`),
  `src/main/traversal.ts`, `src/main/rag-store.ts`,
  `src/shared/types.ts` (`OperatorSettings.tabs`, `IPC_INVOKE`),
  `src/renderer/index.html`, and the `provident-ssr` engine (`Runtime`).
- **Harness note (not a spec surface):** the repo's minimal `ShimElement`
  (`src/shared/dom-shim.ts`) lacks `removeAttribute`/`hasAttribute`; the
  throwaway probe patches those two methods onto the shim prototype so the live
  `Runtime`/`SidebarPanes` can boot in node. No `src/**` edit.
- **Result:** **32 scenarios — 32 PASS / 0 FAIL.** No package findings. No
  host-side regressions surfaced in the node-testable contract. The live
  mount/unmount of non-`document` tab bodies is **deferred** per §2.9 pin 6
  (see "Spec statements not tested").
- **Post-blind adversarial pass (2026-09-12; NOT part of this blind run):** a
  separate read-only adversarial reviewer found + fixed eight HOST findings
  (**HOST-1..HOST-8** — spec §2.10), including HOST-1 (the `onActiveChange`
  stage-mount seam was unwired) and HOST-2..HOST-8. This blind run's
  "no host-side regressions" statement is scoped to this blind set; the HOST
  fixes add the "HOST adversarial-fix regressions" block in the unit file,
  which is **62 pass + 4 skip**. The §2.9 pin-6 deferral was narrowed by HOST-1
  (the `document` + landing stage mounts are now node-tested); the async
  **search**-body mount and the parked graph/template placeholders remain to be
  settled live (**W2-N10**).

## Legend

- **PASS** — observed behavior matches the spec contract.
- **FAIL** — doc/spec drift OR an un-hardened regression (never recorded as a pass).
- **DEFERRED** — behavior the spec explicitly places in the skipped live-runtime
  block (§2.9 pin 6) or an unexported live surface; recorded, not scored.

## Summary

| # | Scenario | Spec ref | Result |
| --- | --- | --- | --- |
| V1 | Boot with persisted set restores order/active; no set → targetless first-tab default | §3.1, §2.4 | PASS |
| V2 | `openTab` adds active entry; later tab requires a target | §3.2, §2.4 | PASS |
| V2b | Adversarial: targetless `newTab()` non-first is a no-op; `newTab(target)` opens+activates | §3.2, §2.4 | PASS |
| V3 | Close active → left neighbour active; persists | §3.3 | PASS |
| V4 | `reorderTab` changes `order` within the strip | §3.4 | PASS |
| V5 | Switch tabs → `activeTab` selects; stage single-active (doc swap) | §3.5, §2.3 | PASS |
| V6 | Load/coerce keeps open/active/order; identity stable (idempotent) | §3.6 | PASS |
| V7 | `focusTarget` find-or-open (existing activates, new opens) | §3.7 | PASS |
| V8 | `focusTarget` `newTab:true` duplicates + activates | §3.8 | PASS |
| V9 | Tabs persist through `OperatorSettings` + restore on restart (C9) | §3.9, §2.5 | PASS |
| F1 | Persisted `activeId` not in `open` → first tab / no active | §4 F1 | PASS |
| F2 | Deleted document target → never throws; target retained in model | §4 F2 | PASS (model; live render DEFERRED) |
| F3 | Empty tab set → single targetless first tab (default page) | §4 F3 | PASS |
| F4 | Close last tab → `closeTab` empty; `ensureFirstTab` materializes default | §4 F4, §2.9 pin 4 | PASS |
| F5 | Duplicate targets allowed with distinct tab ids | §4 F5 | PASS |
| F6 | Malformed `TabState` → fail-soft empty; `load` never crashes | §4 F6 | PASS |
| F9 | Unparked graph/template target accepted; never throws | §4 F9 | PASS (model; live render DEFERRED) |
| P1 | `tab-state.ts` exports the 12 pinned helpers | §2.9 pin 1 | PASS |
| P2 | `TabEntry` carries optional `search?` (C18 surface) | §2.9 pin 2 | PASS |
| P3 | Landing modelled as `{kind:'other', id:'landing'}` | §2.9 pin 3 | PASS |
| P4 | `closeTab` → empty set; `ensureFirstTab` materializes the default | §2.9 pin 4 | PASS |
| P5 | `provident.focus` registered in `dispatch`; one renderer invoke, no graph broadcast | §2.9 pin 5, §2.7 | PASS |
| P6 | Single-active render node-testable as `activeTab()` selection | §2.9 pin 6 | PASS |
| P7 | `index.html` `.tab-strip` `overflow-x: auto|scroll` | §2.9 pin 7 | PASS |
| P8 | `searchContent` pane-first expand-to-tab on:click control (2nd click handler) | §2.9 pin 8, §2.6 | PASS |
| P9 | `coerceTabState` drops dangling/duplicate ids; order permutation; activeId fallback | §2.9 pin 9 | PASS |
| A1 | Stage mount on tab switch is single-active (doc swap) | §2.3, §2.9 pin 6 | PASS |
| A2 | Real default context (`getTabContext`) exposes store docs + last-focused doc | §2.4, §2.9 pin 6 | PASS |
| A3 | Non-first new-tab without a target is a no-op | §2.4 | PASS |
| A4 | Search-result click opens a NEW document tab via the shared seam | §2.6, §2.8 | PASS |
| A5 | In-tab query change reuses the same tab (`editSearchQuery`) | §2.6 | PASS |
| A6 | Malformed/empty focus target is a no-op | §2.7 | PASS |

---

## §3 Valid paths

### V1 (§3.1, §2.4) Boot: persisted set vs no set
**Input:** `TabStrip.load({version:1, open:[t1→a, t2→b, t3→c], activeId:'t2', order:[t1,t2,t3]})`;
then `defaultTabState()` + `ensureFirstTab(empty, emptyCtx)` (no store), `ensureFirstTab(empty, focusCtx)`
(prev-focus `b`), `ensureFirstTab(empty, storeCtx)` (alpha-first among `b,a`).
**Spec-derived expectation:** the persisted set restores `open`/`order`/`activeId` and
`active()` is the `t2`/`b` target; with no set a single targetless first tab is
materialized via the default: prev-session focus → alphabetically first doc → landing.
**Observed:** `open=[t1,t2,t3]`, `order=[t1,t2,t3]`, `activeId='t2'`, `active().target={kind:'document',documentId:'b'}`;
`defaultTabState()={version:1,open:[],activeId:null,order:[]}`; empty ctx → tab-1 `{kind:'other',id:'landing'}`;
focusCtx → `{kind:'document',documentId:'b'}`; storeCtx → `{kind:'document',documentId:'a'}` (alpha-first).
**Result:** PASS

### V2 (§3.2, §2.4) New-tab requires a target after the first
**Input:** `ensureFirstTab(empty, emptyCtx)` then `openTab(s0,{kind:'document',documentId:'x'})`;
`openTab(s0, undefined)`.
**Spec-derived expectation:** a new `TabEntry` becomes active; only the first tab may
be targetless, later tabs require a target.
**Observed:** second tab added (`open.length 2`), `activeId` = the new entry; `openTab(s0, undefined)`
throws (`Cannot read properties of undefined (reading 'kind')` — target required).
**Result:** PASS

### V2b (§3.2, §2.4; adversarial non-first new-tab) Targetless `newTab()` no-op
**Input:** `TabStrip` with a focused store, `ensure()` then bare `newTab()`, then `newTab({kind:'document',documentId:'b'})`.
**Spec-derived expectation:** a targetless new-tab after the first is rejected
(no-op); a targeted new-tab opens + activates.
**Observed:** bare `newTab()` left the id set unchanged; `newTab(target)` added a 2nd tab,
active, targeting `b`.
**Result:** PASS

### V3 (§3.3) Close active → left neighbour
**Input:** `TabStrip.load(TAB)` (active `t2`), `close('t2')`.
**Spec-derived expectation:** neighbour becomes active (left first); the closed tab's
body unmounts; the state persists.
**Observed:** `open=[t1,t3]`, `activeId='t1'`; the `persist` sink and `onActiveChange`
sink both fired.
**Result:** PASS

### V4 (§3.4) Reorder within the strip
**Input:** `reorderTab(TAB,'t1',2)`; `TabStrip.load(TAB)` then `reorder('t1',2)`.
**Spec-derived expectation:** `order` changes (drag-to-reorder within the strip),
no pane relocation.
**Observed:** `order=['t2','t3','t1']` for both the pure helper and the strip
controller; the open set is a permutation (ids unchanged). (Signature discovered by
execution: `reorderTab(state, id, newIndex)` / `TabStrip.reorder(id, newIndex)`.)
**Result:** PASS

### V5 (§3.5, §2.3) Switch tabs → single-active
**Input:** `activeTab(ts.getState())`; `ts.focus({target:{documentId:'c'}})`; host
`mountTab(doc-a)` then `mountTab(doc-b)`.
**Spec-derived expectation:** only the active tab's body is mounted; switching mounts
the selected target's body and unmounts the previous body.
**Observed:** active selection tracked `t2`→`c`; `activeTab(state)` equals `active()`;
after the doc-b mount the stage carried `rag-head-b` and **not** `rag-head-a`
(previous body unmounted).
**Result:** PASS

### V6 (§3.6) RAG content change keeps tabs; identity stable
**Input:** `TabStrip.load(TAB)`, then `coerceTabState(round-trip)` and a second
`coerceTabState` of the result.
**Spec-derived expectation:** a content re-derive never closes/reorders tabs; the
open set/active/order are stable and tab identity is unchanged.
**Observed:** `open`/`order`/`activeId` preserved exactly; `coerceTabState` is
idempotent (`coerce(coerce(s)) === coerce(s)`). (The live re-derive + in-place
repopulate is the skipped live-runtime half — see "not tested".)
**Result:** PASS

### V7 (§3.7) `focusTarget` find-or-open
**Input:** `focusTarget(TAB,{kind:'document',documentId:'b'})` (already open);
`focusTarget(TAB,{kind:'document',documentId:'z'})` (new).
**Spec-derived expectation:** an existing target activates its tab (no new tab); a
new target opens + activates.
**Observed:** existing `b` → `open.length 3`, `activeId='t2'` (no new tab); new `z` →
`open.length 4`, active = the new entry.
**Result:** PASS

### V8 (§3.8) `focusTarget` `newTab:true`
**Input:** `focusTarget(TAB,{kind:'document',documentId:'b'},{newTab:true})`.
**Spec-derived expectation:** a duplicate tab opens + activates (distinct tab id).
**Observed:** `open.length 4`, two `document:b` tabs, all ids distinct, active = the
duplicate.
**Result:** PASS

### V9 (§3.9, §2.5) Persistence (C9) round-trip + restore
**Input:** `createOperatorSettingsStore({path})` → default `get()`; `set({tabs:TAB})`;
a **new** store on the same path → `get()`; `TabStrip.load(restored.tabs)`.
**Spec-derived expectation:** `OperatorSettings` gains `tabs: TabState` (additive,
versioned, fail-soft); open set + active + order round-trip and survive restart.
**Observed:** default `tabs={version:1,open:[],activeId:null,order:[]}`; restarted store
returned the full `TAB`; the strip restored `[t1,t2,t3]` active `t2`.
**Result:** PASS

---

## §4 Fail-states / edge cases

### F1 (§4 F1) Persisted `activeId` not in `open`
**Input:** `coerceTabState({open:[x],activeId:'zzz',order:['x']})`; raw
`activeTab({open:[x],activeId:'nope',order:['x']})`; `TabStrip.load(...)` with `activeId:'zzz'`.
**Spec-derived expectation:** fall back to the first tab / no active.
**Observed:** `coerce` → `activeId='x'` (first tab); raw `activeTab` → `null` (no active);
`TabStrip.load` → `active().id='x'`. Both branches of the pinned fallback are covered.
**Result:** PASS

### F2 (§4 F2) Deleted `document:` target
**Input:** `openTab(TAB,{kind:'document',documentId:'ghost'})`; `activeTab`;
`coerceTabState`.
**Spec-derived expectation:** the tab renders a missing-document state; never throws;
optionally auto-close.
**Observed (model):** the dangling target is retained, `activeTab` returns it, and no
call throws. The **live** missing-document stage render is the skipped live-runtime
half (§2.9 pin 6) — see "not tested". **Result:** PASS (model); live render DEFERRED.

### F3 (§4 F3) Empty tab set
**Input:** `ensureFirstTab(defaultTabState(), emptyCtx)`; `TabStrip.ensure()`.
**Spec-derived expectation:** fall back to a single targetless first tab (the default
page: prev-focus → first doc in wiki → "Getting started"); the strip renders the
new-tab control.
**Observed:** exactly one tab, active, target `{kind:'other',id:'landing'}`;
the strip renders a `.tab-new` control alongside the tab.
**Result:** PASS

### F4 (§4 F4; §2.9 pin 4) Close the last tab
**Input:** `closeTab(single,'only')`; `TabStrip.load(single)` + `close('only')` in a
no-store context and in a focused-store context.
**Spec-derived expectation:** allowed; the tab set falls back to the first-tab default
page (a fresh targetless tab) — never an empty stage.
**Observed:** the pure `closeTab` returns `{open:[],activeId:null,order:[]}`; the strip's
`close` then materializes the default: no-store → landing tab; store → alpha-first doc
`a`. Never empty.
**Result:** PASS

### F5 (§4 F5) Duplicate tab targets
**Input:** `openTab(TAB,{kind:'document',documentId:'b'})` (already open).
**Spec-derived expectation:** allowed — two tabs on one doc, distinct tab ids.
**Observed:** two `document:b` entries, `open.length` grew by 1, all ids unique.
**Result:** PASS

### F6 (§4 F6) Malformed `TabState`
**Input:** `coerceTabState` on `undefined`, `null`, `42`, `{}`, `{open:'nope',activeId:3,order:'x'}`,
`{version:99,...}`; `TabStrip.load({nope:1})`.
**Spec-derived expectation:** fail-soft to an empty tab set; never crashes boot.
**Observed:** every malformed input → `defaultTabState()` (`{version:1,open:[],activeId:null,order:[]}`);
`load` did not throw and left the empty set.
**Result:** PASS

### F9 (§4 F9) Unparked `graph:`/`template:` target
**Input:** `openTab(TAB,{kind:'graph',view:'g'})`, `openTab(TAB,{kind:'template',templateId:'x'})`,
`focusTarget(TAB,{kind:'graph',view:'g'})`.
**Spec-derived expectation:** the model declares graph/template (PARKED); a tab
referencing them renders the placeholder; never throws.
**Observed (model):** both targets are accepted and stored verbatim; `activeTab` does
not throw; the live placeholder render is the skipped live-runtime half (§2.9 pin 6) —
see "not tested". **Result:** PASS (model); live render DEFERRED.

---

## §2.9 Pins

### P1 (§2.9 pin 1) `tab-state.ts` exports
**Input:** module namespace of `src/renderer/tab-state.ts`.
**Spec-derived expectation:** exports `TAB_STATE_VERSION`, `defaultTabState`,
`coerceTabState`, `targetEquals`, `activeTab`, `focusTarget`, `openTab`, `closeTab`,
`reorderTab`, `setSearchParams`, `resolveDefaultTarget`, `ensureFirstTab`.
**Observed:** all twelve present (plus `TAB_LANDING`, `coerceTabTarget`, `nextQueryId`);
`TAB_STATE_VERSION === 1`.
**Result:** PASS

### P2 (§2.9 pin 2) `TabEntry.search?`
**Input:** `expandSearchTab('hello')`; inspect the search entry; `setSearchParams`.
**Spec-derived expectation:** `TabEntry` carries the C18 `rag.query` params as an optional
`search?` field.
**Observed:** the search entry carries `search:{query:'hello'}`; a document entry has no
`search`; `setSearchParams(state,id,{query:'world',topK:7})` updates it in place.
**Result:** PASS

### P3 (§2.9 pin 3) Landing target shape
**Input:** `TAB_LANDING`; `resolveDefaultTarget(emptyCtx)`; `ensureFirstTab`.
**Spec-derived expectation:** landing is `{kind:'other', id:'landing'}` (the union has no
`landing` kind).
**Observed:** all three produce `{kind:'other', id:'landing'}`.
**Result:** PASS

### P4 (§2.9 pin 4) Close vs default split
**Input:** `closeTab`; `ensureFirstTab(defaultTabState(), ctx)`.
**Spec-derived expectation:** `closeTab` returns the empty set; `ensureFirstTab`
materializes the first-tab default.
**Observed:** `closeTab` → `{open:[],activeId:null,order:[]}`; `ensureFirstTab` → one
default tab (landing / prev-focus / alpha-first).
**Result:** PASS

### P5 (§2.9 pin 5, §2.7; `DECIDED: MCP-FOCUS-TOOL`) MCP focus routing
**Input:** `toolForName('provident.focus')`; `groupForTool('provident.focus')`;
`new RendererBackend()` + a mock window; `invoke('focus',{target:{...}})`.
**Spec-derived expectation:** the tool is registered in group `dispatch`; the focus path
routes a single renderer invoke (`provident:invoke`, method `focus`) and emits **no**
`app-graph-changed` (it is not in `MUTATING_METHODS`).
**Observed:** `toolForName` → `'focus'`; `groupForTool` → `'dispatch'`; exactly **one**
`provident:invoke` with `method:'focus'`; zero `app-graph-changed` sends.
**Result:** PASS (registration + renderer-invoke seam; the full MCP `tools/call`
round-trip is not node-runnable — see "not tested").

### P6 (§2.9 pin 6) Single-active node-testable selection
**Input:** `activeTab(state)` before/after a focus switch.
**Spec-derived expectation:** single-active render is node-testable as the `activeTab()`
selection.
**Observed:** `activeTab()` tracks the active entry and equals `TabStrip.active()`.
**Result:** PASS

### P7 (§2.9 pin 7) Strip overflow CSS
**Input:** `src/renderer/index.html`.
**Spec-derived expectation:** an `overflow-x: auto|scroll` rule for the strip region.
**Observed:** `.tab-strip { … overflow-x: auto; overflow-y: hidden; … }` plus the
`<div id="tab-strip" class="top-bar tab-strip">` mount.
**Result:** PASS

### P8 (§2.9 pin 8, §2.6) `searchContent` pane-first expand control
**Input:** `searchContent(ctx, result, {})`; collect `event:'click'` handlers.
**Spec-derived expectation:** a second `on:click` handler (the expand-to-tab control),
structurally detected (no handler name pinned by §2.6).
**Observed:** three click handlers — `pane-search-advanced-toggle`,
`pane-search-expand-tab` (the expand control, content "Open in a tab"), and
`pane-search-result-open`. The expand control is present and is the second click control.
**Result:** PASS

### P9 (§2.9 pin 9) `coerceTabState` hardening
**Input:** duplicate ids + `order:['a','a']`; `order:['a','ghost']`; invalid target kind;
bad `activeId`.
**Spec-derived expectation:** drop dangling/duplicate ids; keep `order` a permutation of
`open[].id`; fall back `activeId` (F1/F6).
**Observed:** duplicate → one entry, `order:['a']`; dangling order id dropped;
invalid target → dropped (`open:[]`); bad `activeId` → first tab; every result satisfies
`order === open.map(id)`.
**Result:** PASS

---

## Adversarial regressions

### A1 (§2.3, §2.9 pin 6) Stage mount on tab switch
**Input:** boot host with a two-document store; `mountTab(doc-a)`; `mountTab(doc-b)`.
**Spec-derived expectation:** the single-active render mounts only the active body and
unmounts the previous.
**Observed:** after doc-a the stage contained `rag-head-a`; after doc-b it contained
`rag-head-b` and **not** `rag-head-a`.
**Result:** PASS

### A2 (§2.4, §2.9 pin 6) Real default context
**Input:** `host.boot(runtime)` (doc-heads + snapshot), then `host.getTabContext()`.
**Spec-derived expectation:** the default-resolution context is the focused store's
documents + the previous session's last-focused document (not a placeholder).
**Observed:** `{hasStore:true, lastFocusedDocumentId:'doc-a', documents:[{doc-a},{doc-b}]}`;
`resolveDefaultTarget(ctx)` → `{kind:'document',documentId:'doc-a'}`.
**Result:** PASS

### A3 (§2.4) Non-first new-tab target
**Input:** focused-store strip, `ensure()` then bare `newTab()`.
**Spec-derived expectation:** only the first tab may be targetless; a later targetless
new-tab is rejected.
**Observed:** state unchanged by the targetless `newTab()`.
**Result:** PASS

### A4 (§2.6, §2.8) Search result click → new tab
**Input:** booted host; `window.provident.sidebar.openDocumentTab('doc-b')`; inspect the
`pane-search-result-open` handler body.
**Spec-derived expectation:** a result click opens the link in a NEW `document` tab via
the same application-code focus seam the MCP side calls.
**Observed:** the sidebar bridge exposes `openDocumentTab` and it reached the injected
`tabs.openDocumentTab` delegate (`['openDocumentTab','doc-b']`); the handler body calls
`s.openDocumentTab(String(id))`.
**Result:** PASS

### A5 (§2.6) Search in-tab query reuse
**Input:** `window.provident.sidebar.searchTabQuery('tab-x','hello')`; inspect
`searchTabContent`'s submit handler.
**Spec-derived expectation:** changing the query inside a search tab reuses that same
tab (re-runs in place) — the entry's `search` params update, no new tab.
**Observed:** the bridge exposes `searchTabQuery` and it reached the injected
`tabs.editSearchQuery` delegate with `('tab-x',{query:'hello'})`; the in-tab submit
handler is `pane-search-tab-submit`.
**Result:** PASS

### A6 (§2.7) Malformed/empty focus target
**Input:** `strip.focus(undefined)`, `strip.focus({})`, `strip.focus('b')`.
**Spec-derived expectation:** an empty/malformed focus request is a no-op (no crash, no
tab change).
**Observed:** all three left the serialized state byte-identical.
**Result:** PASS

---

## Spec statements not tested (and why)

1. **§2.3 / §2.9 pin 6 — the live graph mount/unmount of non-`document` active bodies
   (`search`, landing `other`, `graph`, `template`).** The spec explicitly places the
   *live* single-active mount/unmount in the skipped live-runtime block; this run
   asserted the node-testable half (`activeTab()` selection, V5/P6/A1, and the document
   body swap). **Observation for the live battery:** in the node harness, `host.mountTab`
   mounted a stage body for `document` targets only; a `search`/`other`/`graph`/`template`
   `mountTab` call left the stage without `zone:main`. Whether that is a harness artifact
   (   the shim lacks a real `innerHTML` setter / live reconciler) or the live behavior must
   be settled by the skipped live-runtime block. Recorded here as a live-battery target,
   **not** scored as a FAIL because §2.9 pin 6 defers the live mount. *(Post-blind:
   HOST-1 landed the node-testable `document` + landing stage mounts (spec §2.10); the
   async search-body mount + the parked graph/template placeholders are tracked as
   **W2-N10**.)*
2. **§2.9 pin 6 — `F2` missing-document render and `F9` graph placeholder render.**
   The no-throw/model-retention halves were tested (see F2/F9); the visual missing state
   and placeholder are live-render surfaces deferred with item 1.
3. **§2.7 / §2.9 pin 5 — the full MCP `provident.focus` `tools/call` round-trip.**
   `handleRequest` is not exported from `mcp-server.ts`, so the end-to-end JSON-RPC tool
   call is not node-runnable. P5 verified the two exported seams instead: tool
   registration (`toolForName`) + group (`groupForTool === 'dispatch'`), and
   `RendererBackend.invoke('focus', payload)` emitting exactly one `provident:invoke`
   with zero `app-graph-changed`. The renderer RPC switch (`case 'focus' → tabStrip.focus`)
   was not exercised (renderer entry is a browser-only module).
4. **§2.4 "Overflow: the strip scrolls horizontally (no overflow dropdown)"** — only the
   CSS rule's presence was asserted (P7). Computed scroll geometry/overflow behavior is a
   live DOM surface.
5. **§2.6 step "on opening a tab, the search params are stored on the `TabEntry`" and
   "results are derived (re-run via `rag.query`), never stored"** — the `search` param
   storage was asserted (P2); the live results derivation/re-run is the agentic/live path
   (`rag.query` / `rag-query` IPC) and was not booted here.
6. **§2.2 drag-to-reorder-within-strip gesture** — the pure `reorderTab` / `TabStrip.reorder`
   model operation was exercised (V4); the pointer drag gesture itself is shell chrome /
   live DOM and is out of node scope.
7. **§3.6 live RAG content re-derive (in-place repopulation without teardown).** The
   model-level invariant (open/active/order stable, `coerceTabState` idempotent) was
   asserted (V6); the live re-derive/repopulate is the U-STATE-1 path exercised by the
   skipped live-runtime block.
8. **`MUTATING_METHODS` membership for `focus`.** Not exported; verified indirectly via
   `groupForTool('provident.focus') === 'dispatch'` and the absence of any
   `app-graph-changed` send on the focus seam (P5).
