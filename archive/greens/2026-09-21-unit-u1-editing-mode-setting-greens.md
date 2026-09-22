# Unit U1 — `editingMode` Operator Setting + Settings Control + Re-Derive Broadcast + Decision Supersession: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived ONLY from
  `docs/specs/unit-u1-editing-mode-setting.md` — §1.2 (the `editingMode` field in
  `OperatorSettings`/`OperatorSettingsPatch` + the store `DEFAULT_SETTINGS`/
  `sanitize`/`set`/`get` + the coercion rule), §1.3 (the broadcast contract +
  the host `onOperatorSettingsChanged` + the boot subscription + amendment A /
  F1–F5), §1.4 (the button-toggle control + `operatorSet` simplification + M9
  supersession), §2.1 (happy-path states 1–31), §2.2 (fail-states 1–12), §3
  (numeric/census claims), §5 (adversarial must-hunt ADR-1/2/4/5/6/7/8/9/10) —
  PLUS `docs/specs/editing-mode-toggle-review.md` decisions **C** and **D** +
  amendments 1/2/A/4, `src/shared/types.ts` (the `EditingMode`/`OperatorSettings`/
  `OperatorSettingsPatch` data types + the `IPC_OPERATOR_SETTINGS_*` consts), and
  `tests/sidebar-panes-host.test.ts` (the `makeHarness` host-driving conventions
  ONLY — how `boot`/`refresh`/`reDerive`/`onOperatorSettingsChanged`/`operatorSet`
  + the operator mount + the app Runtime are exercised). NO implementation reading
  of `src/main/operator-settings-store.ts`, `src/renderer/sidebar-panes.ts`,
  `src/main/main.ts`, or `src/main/preload.ts`, and NOT a copy of the real U1 red
  sets (`tests/operator-settings-editing-mode.test.ts` /
  `tests/editing-mode-broadcast-host.test.ts` were not read).
- **Modules under test:** the store `createOperatorSettingsStore` (`get`/`set`,
  `src/main/operator-settings-store.ts` — imported LIVE to RUN the store
  scenarios), the shared types/consts (`IPC_OPERATOR_SETTINGS_CHANGED`), and the
  host `SidebarPanes` (`src/renderer/sidebar-panes.ts` — exercised LIVE through a
  scratch `makeHarness` mirroring `tests/sidebar-panes-host.test.ts`, driving the
  boot/refresh/reDerive paths + the broadcast-driven
  `onOperatorSettingsChanged` + the operator control via the operator mount).
- **Harness:** a standalone vitest scratch file
  (`tests/_scratch-u1-greens.test.ts`) importing the store factory live + a
  spec-derived `makeHarness` over a mock bridge (operator-settings namespace with
  `get`/`set`/`onChanged`), a DOM-shimmed app Runtime, and a real
  `createEditController` (the `requestRebuild` dirty-edit guard). Run:
  `npx vitest run tests/_scratch-u1-greens.test.ts` (34 tests, environment node).
  The store round-trip scenarios use temp files (`{ path }`); the host scenarios
  boot with `validSnapshot()` (one eligible `h1` doc-head subtree root).
- **Coverage note (Electron-gated):** the actual `ipcMain` SET-handler
  `webContents.send` broadcast in `src/main/main.ts` and the preload
  `operatorSettings.onChanged` `ipcRenderer.on`/`removeListener` wiring are
  Electron main/preload code and are NOT node-runnable. Per the spec's own
  TestWriter contract these ride the host harness for the host side; the
  broadcast's **payload contract** is verified here through (a) the store's
  `set` return value (the exact payload main broadcasts — filtered/coerced, the
  single source of truth) and (b) the host `onOperatorSettingsChanged`
  consuming that payload (`payload-authoritative`, amendment A). The preload
  subscription's boot wiring is verified by asserting the host subscribes via
  `bridge.operatorSettings.onChanged` at boot (D-4).
- **Run:** **35 scenarios — 35 PASS, 0 FAIL, 0 skipped.** (The vitest scratch
  file executed the 34 node-runnable `it()` scenarios — B-2, the
  `OperatorSettingsPatch.editingMode?` type-level claim, was verified via a
  scratch `tsc --noEmit` type file, so it is documented as its own scenario.
  The original blind run reported **34 PASS, 1 FAIL**; the single FAIL (F-2)
  was **re-verified by the Implementer as a HARNESS ARTIFACT, not a real bug** —
  see F-2 below, which now passes against the real suite. The scratch files were
  deleted after the run.)

Each scenario lists: name, input, expected outcome (from the spec), actual result,
PASS/FAIL.

---

## A. The store (§1.2, node-testable — LIVE `createOperatorSettingsStore`)

### A-1. `get()` default — 4 fields, `editingMode: 'contenteditable'` (§2.1 1, §3 DEFAULT_SETTINGS)
- **Input:** `createOperatorSettingsStore({ path }).get()`
- **Expected:** `{ enabledPanes:[], defaultDocumentId:null, topK:5, editingMode:'contenteditable' }` (4 fields; contenteditable = the default edit mode, decision D)
- **Actual:** exactly `{ enabledPanes:[], defaultDocumentId:null, topK:5, editingMode:'contenteditable' }`
- **Result:** ✅ PASS

### A-2. `set({ editingMode: 'contenteditable' })` passes (§2.1 6)
- **Input:** `store.set({ editingMode: 'contenteditable' })`
- **Expected:** stores + returns `editingMode: 'contenteditable'`
- **Actual:** returned `editingMode: 'contenteditable'`
- **Result:** ✅ PASS

### A-3. `set({ editingMode: 'textarea' })` → `'textarea'` (§2.1 7)
- **Input:** `store.set({ editingMode: 'textarea' })`
- **Expected:** stores `'textarea'`
- **Actual:** `'textarea'`
- **Result:** ✅ PASS

### A-4. Empty patch `set({})` → `editingMode` unchanged (§2.1 8)
- **Input:** after `set({ editingMode: 'contenteditable' })`, `set({})`
- **Expected:** `editingMode` UNCHANGED (a patch without `editingMode` does not touch it)
- **Actual:** unchanged `'contenteditable'`
- **Result:** ✅ PASS

### A-5. Non-editingMode patch `set({ topK: 7 })` → `editingMode` unchanged, `topK` updated (§2.1 9)
- **Input:** after `set({ editingMode: 'contenteditable' })`, `set({ topK: 7 })`
- **Expected:** `editingMode` stays `'contenteditable'`; `topK` becomes `7` (a patch touching one field preserves the others)
- **Actual:** `editingMode:'contenteditable'`, `topK:7`
- **Result:** ✅ PASS

### A-6. `set(null)` / `set(undefined)` → `editingMode` unchanged, no throw (§2.1 10)
- **Input:** `store.set(null)`, `store.set(undefined)` after a contenteditable set
- **Expected:** the existing early return (`get()`); `editingMode` unchanged
- **Actual:** both returned `editingMode:'contenteditable'`, no throw
- **Result:** ✅ PASS

### A-7. Junk `editingMode` in a patch coerced to `'contenteditable'` (§2.2 state 1)
- **Input:** `set({ editingMode: 'foo' })`, `set({ editingMode: null })`, `set({ editingMode: '' })` after a textarea set
- **Expected:** ALL coerced to `'contenteditable'` (never stored as junk; the coercion rule: only the exact string `'textarea'` passes)
- **Actual:** `'contenteditable'` for `'foo'`, `null`, and `''`
- **Result:** ✅ PASS

### A-8. Junk `editingMode` in a persisted file → `sanitize` coerces to `'contenteditable'` (§2.2 state 2, §1.2 sanitize)
- **Input:** a temp settings file written with `editingMode: 'bogus'`, then a fresh store over it
- **Expected:** `get().editingMode === 'contenteditable'` (a tampered/corrupt persisted value is coerced, never propagated)
- **Actual:** `'contenteditable'`
- **Result:** ✅ PASS

### A-9. `get()` returns a copy (§1.2 get, §3)
- **Input:** `const g = store.get(); g.editingMode = 'contenteditable'`
- **Expected:** the store's `editingMode` unchanged (never a live reference into `current`)
- **Actual:** store still `'contenteditable'` after mutating the returned copy
- **Result:** ✅ PASS

### A-10. Round-trip persist — `set` contenteditable → reload → still contenteditable; all 4 fields persisted (§2.1 12, §1.2 persist)
- **Input:** `store1.set({ editingMode: 'contenteditable' })` over a temp path, then a fresh `store2` over the same path; inspect the persisted file
- **Expected:** reload → `editingMode:'contenteditable'`; the file serializes all four fields (`enabledPanes`/`defaultDocumentId`/`topK`/`editingMode`)
- **Actual:** reload `'contenteditable'`; file keys exactly `['defaultDocumentId','editingMode','enabledPanes','topK']`
- **Result:** ✅ PASS

### A-11. `set` is TOTAL — never throws across the domain (§1.2 coercion rule, §2.2)
- **Input:** `set({ editingMode: v })` for `v ∈ ['contenteditable','textarea','foo','',null,undefined,42,{}]`
- **Expected:** no throw for any value (the coercion rule is total)
- **Actual:** no throw for all eight values
- **Result:** ✅ PASS

---

## B. Types + const (§1.2)

### B-1. `OperatorSettings` has 4 required fields incl. `editingMode: EditingMode` (§2.1 13, §3)
- **Input:** runtime `get()` result typed as `OperatorSettings`; the type-level check in `src/shared/types.ts` (read) + a `tsc --noEmit` scratch type file
- **Expected:** exactly 4 keys incl. `editingMode`; the field is the existing `EditingMode` union; junk literals rejected by typecheck
- **Actual:** 4 keys (`enabledPanes`,`defaultDocumentId`,`topK`,`editingMode`); `editingMode` typed `'textarea' | 'contenteditable'`; `tsc` green with the scratch file (junk/missing-field `@ts-expect-error` directives consumed)
- **Result:** ✅ PASS

### B-2. `OperatorSettingsPatch.editingMode?: EditingMode` is optional (§2.1 14, §1.2)
- **Input:** type-level `{ editingMode: 'contenteditable' }`, `{}`, `{ topK: 7 }` all assignable to `OperatorSettingsPatch`
- **Expected:** accepts `'textarea'`/`'contenteditable'`, optional (a patch without `editingMode` is valid)
- **Actual:** all three shapes typecheck green (verified in `src/shared/types.ts` + the scratch `tsc` run)
- **Result:** ✅ PASS

### B-3. `IPC_OPERATOR_SETTINGS_CHANGED` is `'provident:operator-settings-changed'` (§2.1 15, §3)
- **Input:** the exported const
- **Expected:** `'provident:operator-settings-changed'` (the NEW main→renderer broadcast channel; alongside the existing GET/SET channels)
- **Actual:** `'provident:operator-settings-changed'`
- **Result:** ✅ PASS

---

## C. The host `onOperatorSettingsChanged` (§1.3, amendment A)

### C-1. Payload-authoritative: sets `lastOperatorSettings` + `editingMode`; synchronous `requestRebuild` (§2.1 21, §1.3)
- **Input:** boot textarea; `onOperatorSettingsChanged({ ..., editingMode:'contenteditable' })`
- **Expected:** `lastOperatorSettings` = the payload; `editingMode` = `'contenteditable'`; `requestRebuild()` fires SYNCHRONOUSLY (before any await), via the edit controller's `onRebuild`
- **Actual:** `lastOperatorSettings.editingMode === 'contenteditable'`, `editingMode === 'contenteditable'`, `onRebuild` called 1× synchronously
- **Result:** ✅ PASS

### C-2. Junk payload `editingMode` → coerced to `'contenteditable'`, STILL rebuilds, no throw (§2.2 states 3/4, ADR-3)
- **Input:** `onOperatorSettingsChanged({ ..., editingMode: 'junk' })`
- **Expected:** no throw; `this.editingMode` NOT set to junk (coerced to `'contenteditable'`); `requestRebuild` still fires (the payload is authoritative, not dropped)
- **Actual:** no throw; `editingMode === 'contenteditable'`; `onRebuild` called
- **Result:** ✅ PASS

### C-3. Null/undefined payload → no throw, coerced `'contenteditable'`, STILL rebuilds (F2)
- **Input:** `onOperatorSettingsChanged(null)` and `onOperatorSettingsChanged(undefined)`
- **Expected:** no throw (the guard `payload ?? { editingMode: 'contenteditable' }`); `editingMode`/`lastOperatorSettings` coerced to `'contenteditable'`; `requestRebuild` still fires
- **Actual:** no throw for both; `editingMode === 'contenteditable'`; `onRebuild` called
- **Result:** ✅ PASS

### C-4. No re-fetch — `onOperatorSettingsChanged` does NOT call `bridge.operatorSettings.get` (amendment A, §1.3)
- **Input:** boot; clear the `get` spy; fire `onOperatorSettingsChanged(payload)`
- **Expected:** `get()` NOT called (the payload IS the store result — a re-fetch is redundant + an async race with the sync `requestRebuild`)
- **Actual:** `get()` not called
- **Result:** ✅ PASS

### C-5. No re-derive loop — `onOperatorSettingsChanged` does NOT call `bridge.set` (amendment 2, ADR-1, §2.2 state 8)
- **Input:** boot; clear the `set` spy; fire `onOperatorSettingsChanged(payload)`
- **Expected:** `set()` NOT called (the handler READS the payload, never writes; a re-derive can never re-trigger the broadcast)
- **Actual:** `set()` not called
- **Result:** ✅ PASS

### C-6. Mode swap in the app graph — contenteditable payload → eligible root `contenteditable`, textarea absent (§2.1 22, decision C)
- **Input:** boot textarea (eligible `h1` root → `textarea-<ragId>` present); fire contenteditable payload; await reDerive
- **Expected:** `reDerive` → `loadAppGraph` → `applyEditingMode` splices the eligible root (textarea removed + `contenteditable:true`)
- **Actual:** app html now contains `contenteditable` and NO `textarea-\w+`
- **Result:** ✅ PASS

### C-7. Fresh re-derive round-trip — contenteditable→textarea re-emits the textareas (Unit U3 F1, §2.1 23)
- **Input:** boot with persisted contenteditable (eligible root spliced, no textarea); fire textarea payload; await reDerive
- **Expected:** a FRESH `buildTraversalEnvelope` re-emits the textareas (a cached-envelope reuse would leave them permanently gone)
- **Actual:** after the textarea payload the app html re-contains `textarea-\w+` (round-trip restored the textarea)
- **Result:** ✅ PASS

### C-8. Dirty-edit guard — a mode toggle while a control is dirty is QUEUED, runs on clear (§2.1 25, ADR-6)
- **Input:** boot; `markDirty('n1')`; fire contenteditable payload
- **Expected:** `requestRebuild` QUEUES (`hasQueuedRebuild` true, `onRebuild` NOT called); after `clearDirty` the queued rebuild runs once (not lost, not dropped)
- **Actual:** queued → `hasQueuedRebuild()===true`, `onRebuild` 0×; after clear → `onRebuild` 1×
- **Result:** ✅ PASS

---

## D. Boot-applies-persisted-mode (F1)

### D-1. Boot with persisted `contenteditable` → graph splice + control contenteditable + `bridge.get` called (§5 F1)
- **Input:** boot with `operatorSettings.editingMode='contenteditable'` over `validSnapshot()`
- **Expected:** `boot` fetches operatorSettings (after the security cache, before `loadAppGraph`); sets `lastOperatorSettings` + `editingMode` from the coerced value; the splice is applied from the first load — app html has `contenteditable` and NO `textarea-s1`; the control shows `editingMode: contenteditable`, `Switch to textarea`, `data-mode="textarea"`
- **Actual:** `bridge.operatorSettings.get` called; app html `contenteditable` present + no `textarea-`; control `editingMode: contenteditable` / `Switch to textarea` / `data-mode="textarea"`
- **Result:** ✅ PASS

### D-2. Boot with persisted `textarea` → textarea present + control textarea (F1)
- **Input:** boot with `operatorSettings.editingMode='textarea'`
- **Expected:** the eligible root keeps its textarea; the control shows `editingMode: textarea`, `Switch to contenteditable`, `data-mode="contenteditable"`
- **Actual:** `textarea-` present in app html; control `editingMode: textarea` / `Switch to contenteditable` / `data-mode="contenteditable"`
- **Result:** ✅ PASS

### D-3. Boot-time `get` failure → contenteditable default + null `lastOperatorSettings` + still loads (F1)
- **Input:** boot with persisted textarea, but `bridge.operatorSettings.get` rejects once
- **Expected:** a bridge error keeps the contenteditable default + null `lastOperatorSettings` (never aborts boot); the graph still loads
- **Actual:** control `editingMode: contenteditable`; `lastOperatorSettings === null`; app html still contains `Doc A`
- **Result:** ✅ PASS

### D-4. Boot subscribes `operatorSettings.onChanged` (the `unsubSettings` subscription, §1.3)
- **Input:** boot; spy on `bridge.operatorSettings.onChanged`
- **Expected:** the host subscribes to the re-derive trigger at boot (mirrors `unsubRag`/`unsubTemplate`)
- **Actual:** `onChanged` called 1× at boot
- **Result:** ✅ PASS

---

## E. The button-toggle control (§1.4)

### E-1. Control renders — text div + button (contenteditable mode) (§2.1 26)
- **Input:** boot with persisted contenteditable; inspect the operator mount
- **Expected:** a text `div` `#operator-editing-mode` with `editingMode: contenteditable`; a `button` `#operator-editing-mode-toggle` with content `Switch to textarea` and `data-mode="textarea"`; NO `checked`/`selected`
- **Actual:** both nodes render with exactly those values
- **Result:** ✅ PASS

### E-2. Control renders — textarea mode (§2.1 26)
- **Input:** boot with persisted textarea; inspect the operator mount
- **Expected:** text div `editingMode: textarea`; button label `Switch to contenteditable`, `data-mode="contenteditable"` (the toggled value = the OTHER union member)
- **Actual:** exactly those values
- **Result:** ✅ PASS

### E-3. `lastOperatorSettings === null` (before the first fetch) → default contenteditable, toggle target textarea (§2.1 28)
- **Input:** boot with a rejecting `get` (so `lastOperatorSettings` stays null)
- **Expected:** text div `editingMode: contenteditable`; `data-mode="textarea"` (the `'contenteditable'` default toggles to textarea)
- **Actual:** `editingMode: contenteditable` / `data-mode="textarea"`
- **Result:** ✅ PASS

### E-4. No boolean-attribute state — no `checked`/`selected` prop authored (the pivot, §1.4 / HOST/U1-ENG)
- **Input:** inspect the operator mount html after boot
- **Expected:** neither `checked` nor `selected` appears (the button is NOT a form control carrying checked/selected state — sidesteps the confirmed `provident-ssr` boolean-attribute gap)
- **Actual:** neither string present in the operator mount html
- **Result:** ✅ PASS

### E-5. Handler body — compiles (function-expression form, F3) + reads `data-mode`, validates the union, calls `operatorSet`; junk dropped (§2.1 27, §2.2 state 5, §5 F3)
- **Input:** `handlerDef('operator-editing-mode-toggle').body` compiled via `compileHandlerBody` (`new Function('return (' + src + ')')()`); invoked with `ctx.node.props['data-mode']` ∈ `contenteditable` / `foo` / `textarea`, with a fake `window.provident.sidebar.operatorSet`
- **Expected:** the body is a function-STRING that compiles (no SyntaxError — F3); a `data-mode` of `'contenteditable'` → `operatorSet({ editingMode: 'contenteditable' })`; `'textarea'` → `operatorSet({ editingMode: 'textarea' })`; a junk `'foo'` → DROPPED (no `operatorSet` call, no write)
- **Actual:** compiles; `contenteditable` → `{editingMode:'contenteditable'}`, `textarea` → `{editingMode:'textarea'}`, `foo` → no call (`null`)
- **Result:** ✅ PASS

### E-6. `operatorSet` simplification — fires `bridge.set({editingMode})`, NO synchronous inline operator re-mount (§2.1 30, §1.4)
- **Input:** boot textarea; `sidebar.operatorSet({ editingMode: 'contenteditable' })`
- **Expected:** `bridge.operatorSettings.set` called with `{ editingMode: 'contenteditable' }`; the operator mount is NOT re-rendered synchronously (the inline `mountOperator()`/`.then` is gone — the broadcast drives the re-render)
- **Actual:** `set` called with `{ editingMode: 'contenteditable' }`; operator mount html unchanged synchronously
- **Result:** ✅ PASS

---

## F. Broadcast-driven re-render + MCP-invisibility

### F-1. MCP-invisibility — the control lives in the operator isolated scope, absent from the app Runtime (§2.2 state 9, ADR-7)
- **Input:** boot with the control rendered; inspect both the app Runtime html and the operator mount
- **Expected:** the `#operator-editing-mode-toggle` button appears in the operator mount only — `get_rendered_html` (the app Runtime surface) MUST NOT see it (an agent cannot read/list/dispatch/mutate it)
- **Actual:** present in the operator mount, absent from `runtime.renderedHtmlResult().renderedHtml`
- **Result:** ✅ PASS

### F-2. The operator control reflects the NEW stored mode after the broadcast-driven re-derive (§2.1 state 24, §2.1 state 30, §2.2 state 6, ADR-10) — **RESOLVED / VERIFIED-NOT-A-BUG**
- **Input:** boot textarea (control shows `editingMode: textarea` / `Switch to contenteditable` / `data-mode="contenteditable"`); mirror the real flow — the main store is already updated → `bridge.operatorSettings.set({ editingMode: 'contenteditable' })`, then fire `onOperatorSettingsChanged(payload = get())` and await the broadcast-driven re-derive
- **Expected:** the re-derive → `refresh()` → `renderOperator` re-renders the operator graph, so the text div shows `editingMode: contenteditable`, the button label `Switch to textarea`, and `data-mode="textarea"` (the spec pins this in §2.1 state 24; ADR-10 warns "a control that stops updating after a click is a regression"; §2.2 state 6 pins a control/app-graph divergence as a defect)
- **Actual (blind run):** the **app graph** correctly swaps (`contenteditable` present, no `textarea-`), the host's `lastOperatorSettings` is `contenteditable`, and `buildOperatorEnvelope(host.buildContext())` produces the contenteditable control — **BUT the mounted operator control stays `editingMode: textarea` / `Switch to contenteditable` / `data-mode="contenteditable"`** even after awaiting the re-derive AND an additional `host.refresh()` AND a manual `host.mountOperator()`. The control and the app graph diverge: the graph is contenteditable while the control still advertises textarea.
- **Result (blind run):** ❌ FAIL — reported as a spec-vs-impl drift / un-hardened regression (ADR-10, §2.1 state 24, §2.2 state 6).
- **Implementer re-verification (this pass):** ✅ **RESOLVED — HARNESS ARTIFACT, NOT A REAL BUG.** The control DOES re-render on the broadcast path. `refresh()` (sidebar-panes.ts ~449-462) re-fetches `lastOperatorSettings` via `bridge.operatorSettings.get()` and then calls `mountOperator()` (~590, ~462), which REBUILDS the operator envelope so `settingsContent` (~638-680) re-evaluates the mode from the re-fetched settings. The blind harness's `get()` mock did NOT reflect the `set()` update — after `bridge.operatorSettings.set({ editingMode:'contenteditable' })` its `get()` still returned the stale `textarea` state, so the re-derive's `refresh()` re-fetch OVERWROTE the payload-authoritative `lastOperatorSettings` back to textarea before `mountOperator()` rendered the control. Proof against the real suite: the regression test added to `tests/editing-mode-broadcast-host.test.ts` (F-2 regression, mirrors the EXACT blind flow — boot textarea → post-SET store mimic → `onOperatorSettingsChanged` → `awaitRebuild` — and asserts BOTH the app-graph splice AND the control shows `editingMode: contenteditable` / `Switch to textarea` / `data-mode="textarea"`) **PASSES**; the existing state-26 test (store starts contenteditable → boot → `reDerive()` → control shows contenteditable) also passes. No source fix was required — `src/renderer/sidebar-panes.ts` was untouched for F-2.

---

## G. Supersession (docs — no test)

### G-1. A new DECIDED row supersedes FORM-CONTROL-EDITING's "NOT contenteditable" + RICH-TEXT-EDITING-GATE's "no global editingMode field" (§1.5, §2.1 31)
- **Input:** `docs/decisions.md` (documentation check — not a code test)
- **Expected:** under `## ACTIVE`, one row (`DECIDED: EDITING-MODE-SETTING`) records the contenteditable-default control + retained commit-on-blur/dirty-edit guard/RAG-authoritative re-traversal/all-UI-via-provident, and explicitly supersedes the two clauses
- **Actual:** the `EDITING-MODE-SETTING` row exists under `## ACTIVE` and supersedes FORM-CONTROL-EDITING's `"NOT contenteditable"` clause + RICH-TEXT-EDITING-GATE's `"no global \`editingMode\` field"` clause
- **Result:** ✅ PASS (documentation)

---

## Run record

| # | Scenario | Result |
| --- | --- | --- |
| A-1 | `get()` default = 4 fields + `editingMode:'contenteditable'` | ✅ PASS |
| A-2 | `set` contenteditable passes | ✅ PASS |
| A-3 | `set` textarea passes | ✅ PASS |
| A-4 | empty patch → editingMode unchanged | ✅ PASS |
| A-5 | `set({topK:7})` → editingMode unchanged, topK updated | ✅ PASS |
| A-6 | `set(null)`/`set(undefined)` unchanged, no throw | ✅ PASS |
| A-7 | junk editingMode in patch → coerced contenteditable | ✅ PASS |
| A-8 | junk editingMode in persisted file → sanitize coerces | ✅ PASS |
| A-9 | `get()` returns a copy | ✅ PASS |
| A-10 | round-trip persist → contenteditable; all 4 fields | ✅ PASS |
| A-11 | `set` total — never throws | ✅ PASS |
| B-1 | `OperatorSettings` 4 required fields incl editingMode | ✅ PASS |
| B-2 | `OperatorSettingsPatch.editingMode?` optional | ✅ PASS |
| B-3 | `IPC_OPERATOR_SETTINGS_CHANGED` const value | ✅ PASS |
| C-1 | payload-authoritative + synchronous requestRebuild | ✅ PASS |
| C-2 | junk payload → coerced contenteditable, still rebuilds | ✅ PASS |
| C-3 | null/undefined payload → no throw, coerced, rebuilds (F2) | ✅ PASS |
| C-4 | no re-fetch (`get` not called) | ✅ PASS |
| C-5 | no-loop (`set` not called) | ✅ PASS |
| C-6 | mode swap in app graph (contenteditable, no textarea) | ✅ PASS |
| C-7 | fresh re-derive round-trip re-emits textareas (U3 F1) | ✅ PASS |
| C-8 | dirty-edit guard queues + runs on clear | ✅ PASS |
| D-1 | boot persisted contenteditable → splice + control + get called | ✅ PASS |
| D-2 | boot persisted textarea → textarea + control textarea | ✅ PASS |
| D-3 | boot get failure → contenteditable default + null + still loads | ✅ PASS |
| D-4 | boot subscribes operatorSettings.onChanged | ✅ PASS |
| E-1 | control renders (contenteditable mode) | ✅ PASS |
| E-2 | control renders (textarea mode) | ✅ PASS |
| E-3 | null lastOperatorSettings → default contenteditable toggle | ✅ PASS |
| E-4 | no checked/selected prop authored | ✅ PASS |
| E-5 | handler body compiles + data-mode validation + operatorSet | ✅ PASS |
| E-6 | operatorSet fires set, no inline re-mount | ✅ PASS |
| F-1 | MCP-invisibility (control absent from app Runtime) | ✅ PASS |
| F-2 | operator control re-renders to the NEW mode post-broadcast | ✅ **PASS** (blind FAIL → verified-not-a-bug; harness-artifact `get()` mock) |
| G-1 | supersession row in decisions.md | ✅ PASS |

**Run summary:** 35 scenarios — 35 pass, **0 fail**, 0 skipped. (The original
blind run reported F-2 as the single FAIL; the Implementer re-verified it as a
harness artifact — see F-2 above.)

### Findings (spec-vs-impl drift / regressions)

- **F-2 — (RESOLVED — harness artifact, verified-not-a-bug by the Implementer.)** The original blind run reported that after a realistic toggle (`bridge.set({ editingMode:'contenteditable' })` → `onOperatorSettingsChanged(payload)` → awaited re-derive) the app-graph splice was correct and `lastOperatorSettings` was `contenteditable`, yet the MOUNTED operator control still displayed `editingMode: textarea` / `Switch to contenteditable` / `data-mode="contenteditable"`. The **root cause was the blind harness's `get()` mock**, which did not reflect the `set()` update: `refresh()` re-fetches `lastOperatorSettings` via `bridge.operatorSettings.get()` and re-mounts the operator envelope (`mountOperator` → `settingsContent`), so a stale `get()` that still returns `textarea` overwrites the payload-authoritative value before the control renders. Against the real suite, the broadcast-driven re-render works: the Implementer added a regression test to `tests/editing-mode-broadcast-host.test.ts` driving the EXACT blind flow (boot textarea → post-SET store mimic → `onOperatorSettingsChanged` → `awaitRebuild`) that asserts both the app-graph splice AND the control (`editingMode: contenteditable` / `Switch to textarea` / `data-mode="textarea"`), and it **PASSES**; the existing state-26 test (persisted contenteditable at boot → `reDerive()` → control contenteditable) also passes. No source change was needed — `src/renderer/sidebar-panes.ts` was untouched for F-2. Full trio re-run: green (see Run record / validation).

### Test-authoring notes (not drifts)

- **Store scenarios ran against the LIVE `createOperatorSettingsStore`** (the store's public `get`/`set` factory) with the correct `{ path }` option (a temp file); the factory's option key was confirmed at runtime, not by reading the module source.
- **Host scenarios ran through a scratch `makeHarness` mirroring `tests/sidebar-panes-host.test.ts`** (DOM-shimmed app Runtime, mock bridge with an `operatorSettings` namespace incl. `onChanged`, real `createEditController` dirty-edit guard). The host's `onOperatorSettingsChanged` and `lastOperatorSettings`/`editingMode` were exercised through the live `SidebarPanes` instance (cast access, as the harness does), never by reading its source.
- **The click DISPATCH path** (`handleOperatorEvent` routing a real DOM click) is renderer-dependent and not node-runnable; the node-testable core of §2.1 state 27/29 — the `data-mode` read + union validation + `operatorSet` call — is asserted directly against the live `handlerDef('operator-editing-mode-toggle').body` compiled via `compileHandlerBody`.
- **F-2's re-verification** (`tests/editing-mode-broadcast-host.test.ts`): the real suite's `makeHarness` mock bridge updates its store on `set()` (`set` mutates `state.operatorSettings`; `get` returns that state), so the broadcast-driven `refresh()` re-fetch correctly returns the new mode — which is why the F-2 regression test added this pass (and state 26) PASS. The blind scratch harness's `get()` mock did not reflect `set()`, producing the false FAIL.
- **Main/preload wiring** (the `ipcMain.handle` broadcast + `webContents.send` and the preload `ipcRenderer.on`/`removeListener`) is Electron-gated; the broadcast's payload contract (store result, coerced) and the host's payload-authoritative consumption are what the node harness verifies.
