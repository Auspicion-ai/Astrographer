# Spec — Unit U1: `editingMode` Operator Setting + Settings Control + Re-Derive Broadcast + Decision Supersession

- **Status:** SPEC (the U1 unit of the editing-mode-toggle + contenteditable
  rich-text editor slice — decision **C** (the broadcast → `requestRebuild` →
  `reDerive` mechanism), decision **D** (the supersession), amendment 1 (the
  control fallback test-first), amendment 2 (no re-derive loop by construction),
  amendment 4 (the cross-unit textarea gate), amendment 8 (the `contenteditable`
  prop mapping) of `docs/specs/editing-mode-toggle-review.md` §4/§5, U1 row).
  Four pieces: (1) add `editingMode` to `OperatorSettings` +
  `OperatorSettingsPatch` + the store (`DEFAULT_SETTINGS`/`sanitize`/`set`) using
  the existing `EditingMode` type; (2) a NEW `operator-settings-changed`
  broadcast that drives the SAME single re-derive path as
  `rag-store-changed`/`template-changed`; (3) a Settings-pane editingMode
  control authored as provident data (the AGENTS.md UI-via-provident
  constraint) in the OPERATOR isolated scope; (4) a NEW `docs/decisions.md`
  DECIDED row superseding FORM-CONTROL-EDITING's "NOT contenteditable" pin +
  the "no global editingMode field" clause of RICH-TEXT-EDITING-GATE.
- **Scope:** `src/shared/types.ts` (`OperatorSettings`/`OperatorSettingsPatch`
  + `IPC_OPERATOR_SETTINGS_CHANGED`), `src/main/operator-settings-store.ts`
  (`DEFAULT_SETTINGS`/`sanitize`/`set`/`get`), `src/main/main.ts` (the SET
  handler broadcast), `src/main/preload.ts` (`operatorSettings.onChanged`),
  `src/renderer/sidebar-panes.ts` (`settingsContent` control + `operatorSet`
  simplification + `onOperatorSettingsChanged` + the `boot` subscription),
  `docs/decisions.md` (the supersession row). This unit does NOT implement the
  contenteditable UI handlers / caret / IME (`editorBlur`, `composingRagId`,
  `CaretState` rich path — Unit U4), the `setRichText` write-back op /
  `IPC_EDIT_RICH_COMMIT` (Unit U5), or the blur decomposition (Unit U2, landed).
  The `EditingMode` type + the host `editingMode` field + `applyEditingMode`
  splice already exist (Unit U3); U1 WIRES the field to the operator-settings
  value + the re-derive broadcast.
- **TestWriter contract:** every signature, return shape, state, and fail-state
  below is derivable from this spec ALONE. The store (`sanitize`/`set`/`get`/
  `DEFAULT_SETTINGS`) is fully node-testable (no Electron). The broadcast
  channel const + the `OperatorSettings`/`OperatorSettingsPatch` field additions
  are type-level (typecheck green). The main SET-handler broadcast + the preload
  `onChanged` subscription + the host `onOperatorSettingsChanged` +
  `settingsContent` control + the `operatorSet` simplification are tested
  through the existing SidebarPanes host integration harness (the same harness
  Unit K/U3 use). The design pivot (this rework) REPLACES the amendment-1
  SELECT-vs-radio control-form test-first gate with a **button-toggle** control: a
  `button` element RENDERS (adapters.js `createElement(type)` makes any tag) and is
  NOT a form control (∉ `FORM_CONTROLS`), so it carries NO checked/selected
  boolean-attribute state — the control AVOIDS the CONFIRMED `provident-ssr`
  boolean-attribute engine gap (`HOST/U1-ENG` in `docs/defects.md` +
  `docs/HANDOFF.md`, §1.4/§4/§5). No SELECT-form test-first gate is required; the
  control is green-testable via its click dispatch.

---

## 1. Status + signatures + broadcast + control + supersession

### 1.1 What the proposal asks (U1)

Toggling the editing control between `textarea` (the safe default) and
`contenteditable` (the opt-in rich editor) is an OPERATOR decision, persisted in
the operator settings. The operator picks the mode in the isolated Settings
pane; the change writes back to the main store; main broadcasts a
`operator-settings-changed` event with the STORE'S RESULT as the authoritative
payload; the host uses that payload directly (NO re-fetch — amendment A, see
§1.3), updates `this.editingMode`, and runs the SAME single re-derive path
(`requestRebuild` → `reDerive`) used by
`rag-store-changed`/`template-changed`. The re-derive re-traverses FRESH (never
`refresh()` over the cached envelope — Unit U3 finding F1), so
`loadAppGraph`'s `applyEditingMode` splices the envelope in the new mode,
swapping textareas for contenteditable editors. A single DECIDED row records
that contenteditable is the OPT-IN control when `editingMode ===
'contenteditable'`, textarea stays the default, and commit-on-blur, the
dirty-edit guard, RAG-authoritative re-traversal, and all-UI-via-provident
authoring are all retained.

### 1.2 The `editingMode` setting (types + store, pinned)

**`src/shared/types.ts`.** The `EditingMode` type already exists (Unit U3,
`'textarea' | 'contenteditable'`). This unit adds the field to the two settings
interfaces and the broadcast channel const.

```ts
export type EditingMode = 'textarea' | 'contenteditable'   // EXISTS (U3) — unchanged

export interface OperatorSettings {
  enabledPanes: string[]
  defaultDocumentId: string | null
  topK: number
  editingMode: EditingMode                                   // NEW (U1)
}

export interface OperatorSettingsPatch {
  enabledPanes?: string[]
  defaultDocumentId?: string | null
  topK?: number
  editingMode?: EditingMode                                  // NEW (U1)
}

export const IPC_OPERATOR_SETTINGS_CHANGED = 'provident:operator-settings-changed'   // NEW (U1)
```

**API rules (pinned):**
- **`OperatorSettings.editingMode: EditingMode`** — REQUIRED field, the 4th
  member. Default **`'textarea'`** (decision D — textarea stays the safe
  default).
- **`OperatorSettingsPatch.editingMode?: EditingMode`** — OPTIONAL patch field.
  A patch WITHOUT `editingMode` leaves the stored `editingMode` unchanged.
- **`IPC_OPERATOR_SETTINGS_CHANGED = 'provident:operator-settings-changed'`** —
  the NEW main→renderer broadcast channel. Payload: the current
  `OperatorSettings` (the store's filtered result — the exact return of
  `operatorSettingsStore.set(patch)`). One-way notification, NOT a
  request/response.

**`src/main/operator-settings-store.ts`.** Extend all four surfaces:

```ts
const DEFAULT_SETTINGS: OperatorSettings = {
  enabledPanes: [],
  defaultDocumentId: null,
  topK: 5,
  editingMode: 'textarea',          // NEW — the safe default (decision D)
}

function sanitize(input: unknown): OperatorSettings {
  // ...existing enabledPanes/defaultDocumentId/topK as today...
  const editingMode = (src.editingMode === 'contenteditable') ? 'contenteditable' : 'textarea'   // NEW
  return { enabledPanes, defaultDocumentId, topK, editingMode }
}

get(): OperatorSettings {
  return { enabledPanes: [...current.enabledPanes], defaultDocumentId: current.defaultDocumentId, topK: current.topK, editingMode: current.editingMode }
}

set(patch: OperatorSettingsPatch): OperatorSettings {
  // ...existing null/undefined-patch early return, enabledPanes, defaultDocumentId, topK as today...
  const editingMode =
    patch.editingMode !== undefined
      ? (patch.editingMode === 'contenteditable' ? 'contenteditable' : 'textarea')
      : current.editingMode                                    // NEW
  current = { enabledPanes, defaultDocumentId, topK, editingMode }
  persist()
  return this.get()
}
```

**Coercion rule (pinned — used identically in `sanitize` AND `set`):** any value
that is NOT exactly the string `'contenteditable'` coerces to `'textarea'`.
`undefined`, `null`, `''`, `'textarea'`, or any junk value → `'textarea'`. ONLY
the exact string `'contenteditable'` passes through. The function is TOTAL and
never throws for any `src.editingMode` / `patch.editingMode` value.
- **`sanitize`:** applied to the persisted file on every read (first-run,
  existing-file, corrupt-file fallback). A persisted `editingMode` of junk
  coerces to `'textarea'`.
- **`set`:** `patch.editingMode !== undefined` → coerce and apply;
  `patch.editingMode === undefined` → keep the current `editingMode`.
- **`get`:** returns `editingMode` in the copied result (never a live reference
  into `current`).
- **Persist:** `editingMode` is serialized with the rest (a settings write
  persists all four fields).

### 1.3 The broadcast + preload subscription + host re-derive (pinned)

**`src/main/main.ts`.** Extend the existing `IPC_OPERATOR_SETTINGS_SET` handler
(Unit K §5.4 M9, currently `ipcMain.handle(IPC_OPERATOR_SETTINGS_SET, (_event,
patch) => operatorSettingsStore.set(patch))`):

```ts
ipcMain.handle(IPC_OPERATOR_SETTINGS_SET, (_event, patch: OperatorSettingsPatch) => {
  const updated = operatorSettingsStore.set(patch)
  backend.broadcast(IPC_OPERATOR_SETTINGS_CHANGED, updated)   // NEW — the re-derive trigger
  return updated
})
```

**Broadcast contract (pinned):**
- The broadcast fires EXACTLY ONCE per `IPC_OPERATOR_SETTINGS_SET` invocation,
  AFTER `operatorSettingsStore.set(patch)` returns. The store's `set` NEVER
  throws for a domain failure (a null/undefined/junk patch returns the
  unchanged settings), so every SET invocation broadcasts exactly once.
- **Payload = the store's result** (`updated`), NOT the raw patch — the
  renderer receives the filtered/coerced current settings (single source of
  truth = the main store).
- The broadcast is a one-way `webContents.send` (mirroring the
  `IPC_RAG_STORE_CHANGED` / `IPC_TEMPLATE_CHANGED` pattern via `backend.broadcast`),
  NOT a request/reply.
- The broadcast is fired by MAIN only. It NEVER fires from inside the renderer's
  `reDerive`/`refresh`/`loadAppGraph` — reDerive does NOT write settings, so a
  re-derive can never re-trigger this broadcast (amendment 2: no re-derive loop
  by construction). `IPC_OPERATOR_SETTINGS_GET` does NOT broadcast.
- `IPC_OPERATOR_SETTINGS_GET` is UNCHANGED (returns `operatorSettingsStore.get()`).

**`src/main/preload.ts`.** Extend the `operatorSettings` bridge object:

```ts
operatorSettings: {
  get(): Promise<OperatorSettings> { return ipcRenderer.invoke(IPC_OPERATOR_SETTINGS_GET) }
  set(patch: OperatorSettingsPatch): Promise<OperatorSettings> { return ipcRenderer.invoke(IPC_OPERATOR_SETTINGS_SET, patch) }
  /** NEW (U1) — subscribe to the operator-settings-change re-derive trigger.
   *  Returns an unsubscribe function. */
  onChanged(handler: (settings: OperatorSettings) => void): () => void {
    const listener = (_event: unknown, settings: OperatorSettings): void => { handler(settings) }
    ipcRenderer.on(IPC_OPERATOR_SETTINGS_CHANGED, listener)
    return () => { ipcRenderer.removeListener(IPC_OPERATOR_SETTINGS_CHANGED, listener) }
  }
}
```

**`src/renderer/sidebar-panes.ts`.** Three changes: (a) add `operatorSettings.onChanged`
to the structural `SidebarBridge` type; (b) subscribe in `boot` with an
`unsubscribe` handle; (c) add `onOperatorSettingsChanged`.

```ts
// SidebarBridge (structural) — add:
operatorSettings: {
  get(): Promise<OperatorSettings>
  set(patch: OperatorSettingsPatch): Promise<OperatorSettings>
  onChanged(handler: (settings: OperatorSettings) => void): () => void   // NEW
}

// host fields — add alongside unsubRag/unsubTemplate:
private unsubSettings: (() => void) | null = null

// boot — subscribe alongside the other re-derive triggers:
this.unsubRag = this.bridge.edit.onRagStoreChanged((p) => this.onRagStoreChanged(p))
this.unsubTemplate = this.bridge.template.onTemplateChanged((p) => this.onTemplateChanged(p))
this.unsubSettings = this.bridge.operatorSettings.onChanged((p) => void this.onOperatorSettingsChanged(p))   // NEW

// NEW host method:
/** Unit U1 §1.3 (amendment A) — the operator-settings-changed handler. The
 *  broadcast payload IS the authoritative store state (main broadcasts
 *  `operatorSettingsStore.set()`'s result post-SET), so the host does NOT
 *  re-fetch — a re-fetch is redundant and creates an async race with the sync
 *  requestRebuild requirement. FULLY SYNCHRONOUS: set lastOperatorSettings +
 *  editingMode from the PAYLOAD (defensive coercion — only 'contenteditable'
 *  passes), then route through the edit controller's dirty-edit guard
 *  (requestRebuild) → the SAME single re-derive as rag-store-changed /
 *  template-changed. A malformed/absent editingMode is coerced to 'textarea'
 *  and the handler STILL rebuilds (the payload is authoritative, not dropped). */
private onOperatorSettingsChanged(payload: OperatorSettings): void {
  this.lastOperatorSettings = payload
  this.editingMode = payload.editingMode === 'contenteditable' ? 'contenteditable' : 'textarea'
  this.editController.requestRebuild()   // → reDerive (FRESH traversal — never refresh() over the cached envelope)
}
```

**Host contract (pinned):**
- **Payload-authoritative (amendment A):** the broadcast payload IS the store's
  result (main broadcasts `operatorSettingsStore.set()`'s return value
  post-SET), so the handler uses the PAYLOAD directly for host state — NO
  re-fetch. A re-fetch is redundant (the payload already carries the filtered/
  coerced current settings) and creates an async race with the sync
  `requestRebuild` requirement. The handler is FULLY SYNCHRONOUS.
- **`lastOperatorSettings` + `editingMode` from the payload:** the handler sets
  `this.lastOperatorSettings = payload` and derives `this.editingMode` from
  `payload.editingMode`. (The re-derive's own `refresh()` re-fetches
  `lastOperatorSettings` from the store on its own — in the real flow the store
  was already updated when the broadcast fired, so payload === store.)
- **Coercion:** `editingMode` is defensively coerced
  (`=== 'contenteditable' ? 'contenteditable' : 'textarea'`) — a malformed/
  absent `editingMode` in the payload coerces to `'textarea'`, and the handler
  STILL rebuilds (the payload is authoritative, not dropped; §2.2 state 4).
- **Same single re-derive path:** `requestRebuild()` routes through the edit
  controller's dirty-edit guard (`onRebuild` = `reDerive`) — the SAME path as
  `onRagStoreChanged` / `onTemplateChanged` (Unit K §5.2). The mode swap happens
  in `reDerive` → `loadAppGraph` → `applyEditingMode(result.envelope,
  this.editingMode)`.
- **Fresh traversal (Unit U3 F1, pinned):** `requestRebuild` → `reDerive`
  rebuilds the traversal envelope FRESH via `buildTraversalEnvelope(snapshot,
  documentIds)` — it NEVER calls `refresh()` directly, and it NEVER reuses the
  cached, spliced `lastTraversalEnvelope` as the mode-change source. A mode
  toggle MUST always trigger a fresh re-derive (the splice's in-place textarea
  removal is NOT reversible on a cached envelope; a contenteditable→textarea
  toggle that reused the cached envelope would leave textareas permanently gone).
- **No re-derive loop (amendment 2):** `onOperatorSettingsChanged` READS settings
  (uses the payload) — it NEVER calls `bridge.operatorSettings.set`, and
  `reDerive`/`loadAppGraph`/`renderOperator` never write settings. Therefore a
  re-derive can never re-trigger the broadcast → the broadcast → re-derive path
  terminates.
- **Subscription cleanup:** `boot` stores the unsubscribe handle in
  `this.unsubSettings` (mirrors `unsubRag`/`unsubTemplate`).

### 1.4 The Settings control + `operatorSet` simplification (pinned)

**Control (OPERATOR isolated scope, provident-authored).** Extend the existing
`settingsContent()` (Unit K §5.4 M9 — the current display-only divs are
preserved) with an editingMode **button-toggle** bound to
`lastOperatorSettings.editingMode`. The control is authored as provident data
(the AGENTS.md all-UI-via-provident constraint — NOT hand-written DOM). It lives
in the `#operator-panes` operator isolated scope (never the app Runtime → NEVER
MCP-visible, decision OPERATOR-ISOLATED-GRAPHSCOPE).

**The pivot (this rework — resolves the U1 review's finding 2 + the CONFIRMED
engine gap):** the amendment-1 design used a `select`/radio whose UNSELECTED state
is a boolean attribute (`selected`/`checked: false`). A U1 read-only review
CONFIRMED a genuine `provident-ssr` engine gap: `DomAdapter.setProp`
(`node_modules/provident-ssr/dist/core/adapters.js`) has NO boolean-attribute
special-casing — `checked: false` / `selected: false` routes to the generic
`else` branch `el.setAttribute(attr, bakeValue(val))`, and `bakeValue(false)` →
`'false'`, so the boolean attribute is STILL PRESENT (a radio renders checked / an
option renders selected). An agent CANNOT set a boolean-false attribute through
the prop path. Per AGENTS.md this package defect is NEVER patched here — it is
recorded as **`HOST/U1-ENG`** in `docs/defects.md` + `docs/HANDOFF.md` (§4/§5).
The control PIVOTS to AVOID the gap entirely: a `button` element RENDERS
(adapters.js `createElement(type)` makes any tag) and is NOT a form control
(∉ `FORM_CONTROLS`), so it carries NO checked/selected boolean state. The
button-toggle is provident-authored, operator-scope, and green-testable.

**Control shape (pinned):** the control is **2 nodes** — (1) a text `div` showing
the CURRENT mode (`editingMode: <s?.editingMode ?? 'textarea'>`), and (2) a
`button` whose label = the TOGGLE ACTION (e.g. "Switch to contenteditable") and
whose `data-mode` prop carries the TOGGLED (target) mode. Clicking the button
dispatches the shared operator-change path → `operatorSet({ editingMode: <toggled> })`
→ main SET → `operator-settings-changed` broadcast → host uses the payload
(authoritative — amendment A) → `requestRebuild` → fresh `reDerive` → mode swap.

```ts
// inside settingsContent() children, after the existing display-only divs:
{
  type: 'div',
  props: { id: 'operator-editing-mode' },
  content: `editingMode: ${s?.editingMode ?? 'textarea'}`,
},
{
  type: 'button',
  props: {
    id: 'operator-editing-mode-toggle',
    'data-mode': (s?.editingMode ?? 'textarea') === 'contenteditable' ? 'textarea' : 'contenteditable',
  },
  content: (s?.editingMode ?? 'textarea') === 'contenteditable' ? 'Switch to textarea' : 'Switch to contenteditable',
  handlers: [{ name: 'operator-editing-mode-toggle', event: 'click', body: OPERATOR_EDITING_MODE_TOGGLE_HANDLER }],
},
```

A NEW shared handler body reads the TOGGLED mode from the button node's
`data-mode` prop (NOT the dispatched click value — a `<button>` target's `value`
is the empty string via `handleOperatorEvent`, so the click arg is unusable) and
routes it through the existing `window.provident.sidebar.operatorSet` bridge
surface (M2). The handler is authored INLINE (a function string) because the
operator isolated scope does NOT run the app Runtime's name-referenced
handler-body resolution (the `resolveNameReferencedHandlerBodies` path is an
app-Runtime feature; the operator graph dispatches INLINE bodies — the
secure-panels.ts / `DOC_NAV_SELECT_BODY` pattern):

```ts
// NEW handler body (function-STRING data) — reads the toggled mode from the
// button node's `data-mode` prop, never ctx.node.props.value (a button's value
// is empty on click). Mirrors DOC_NAV_SELECT_BODY reading `data-document-id`.
// TWO representations of the SAME handler (matching the code):
//   - OPERATOR_EDITING_MODE_TOGGLE_HANDLER — the FULL function-expression string
//     the control's `handlers[].body` + the `registerHandlerDef` registration
//     use (compileHandlerBody-compatible — F3).
//   - OPERATOR_EDITING_MODE_TOGGLE_BODY — the INNER STATEMENTS only (what the
//     harness reads back and executes as `new Function('ctx', body)`).
const OPERATOR_EDITING_MODE_TOGGLE_HANDLER = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s) return;
  var mode = ctx && ctx.node && ctx.node.props && ctx.node.props['data-mode'];
  if (mode === 'textarea' || mode === 'contenteditable') s.operatorSet({ editingMode: mode });
}`
```

Registered in `bindHandlers()` via `registerHandlerDef('operator-editing-mode-toggle',
{ name: 'operator-editing-mode-toggle', body: OPERATOR_EDITING_MODE_TOGGLE_HANDLER })`
(additive; harmless in the app graph — the operator scope uses the inline body).

**The toggled value (pinned):** the authoring computes `data-mode` at
`settingsContent()` render time as the OTHER union member of the current stored
mode — `current === 'contenteditable' ? 'textarea' : 'contenteditable'` (when
`lastOperatorSettings === null`, current defaults to `'textarea'`, so the toggle
target is `'contenteditable'`). The handler body VALIDATES the `data-mode` value
against the two-member union before calling `operatorSet` — a junk `data-mode` is
dropped (no write). The label text always mirrors the toggle ACTION ("Switch to
<other-member>").

**Control contract (pinned):**
- **Text div reflects the CURRENT mode** (`editingMode: <s?.editingMode ?? 'textarea'>`);
  the button label reflects the TOGGLE ACTION; the button's `data-mode` carries the
  TOGGLED mode. All three re-render on every `settingsContent()` call (the
  broadcast → re-derive → `refresh()` → `renderOperator` re-render).
- **Click → `operatorSet({ editingMode })`:** a click dispatches
  `operator-editing-mode-toggle`, which calls
  `window.provident.sidebar.operatorSet({ editingMode: mode })` only when `mode`
  is one of the two members.
- **Provident-authored:** the text div + button are `LegacyNodeData` in
  `settingsContent()` — NO hand-written HTML/DOM (a control rendered outside the
  provident graph is a review finding).
- **OPERATOR isolated scope:** the control is authored into the operator envelope
  (`buildOperatorEnvelope` → `#operator-panes`), so it is NEVER MCP-visible — an
  agent cannot read it, list it, dispatch it, or mutate it.
- **No boolean-attribute state (the pivot):** the control uses NO
  `checked`/`selected` props — the `button` carries no form state, sidestepping
  the confirmed engine gap (`HOST/U1-ENG`). No `select`/`option`/`radio` elements
  are authored.
- **Existing display-only divs unchanged:** `operator-enabled-panes`,
  `operator-default-document`, `operator-topk` remain as-is; the button-toggle is
  ADDED, not a replacement.

**`operatorSet` simplification (pinned — the review's decision):** simplify the
current inline `operatorSet` to let the broadcast drive the re-render. REMOVE the
inline `mountOperator()` call AND the `.then((settings) => { this.lastOperatorSettings
= settings })` update (both are now redundant — the broadcast → re-derive →
`refresh()` re-fetches + re-renders the operator graph):

```ts
/** `operatorSet` — Unit U1 §1.4 — `bridge.operatorSettings.set` → main
 *  broadcasts `operator-settings-changed` → the host re-derives (fresh
 *  traversal) + `refresh()` re-renders the operator graph. SYNCHRONOUS (the IPC
 *  is fired; the broadcast drives the re-render — no inline re-mount). */
private operatorSet(patch: OperatorSettingsPatch): void {
  void this.bridge.operatorSettings.set(patch)
}
```

Rationale (pinned): the broadcast → `requestRebuild` → `reDerive` → `refresh()`
chain re-fetches `lastOperatorSettings` AND re-renders the operator scope
(`renderOperator`) — so the inline `.then` re-mount is a redundant duplicate
render. The mode change itself requires the re-derive (the app-graph splice
depends on `this.editingMode`), which the broadcast drives; the control's
text-div + button label/toggle update via the re-fetched settings. Eventual
consistency is
accepted: there is a transient window between `bridge.set` firing and the
broadcast-driven re-render where the control still shows the pre-toggle mode.

**M9 supersession (amendment B):** this `operatorSet` simplification supersedes
the Unit K M9 contract (`docs/specs/unit-k-sidebar-panes-host.md` §5.8.27), whose
inline `mountOperator()` + `.then(lastOperatorSettings = settings)` re-mount is
the U1-redundant path. The reconciled M9 test now asserts `operatorSet({ topK })`
→ `bridge.operatorSettings.set({ topK })`, then drives the re-render via the
broadcast path (fire the host's `onOperatorSettingsChanged` with the new settings)
and asserts the operator scope re-renders. The operator-graph re-render is
broadcast-driven, never an inline re-mount.

### 1.5 The supersession row (`docs/decisions.md`, pinned)

Add ONE new DECIDED row under `## ACTIVE` (matching the table's `Decision |
Date | What it pins | Source` columns) that supersedes:

- **line 17, FORM-CONTROL-EDITING:** the "NOT contenteditable (fights
  graph-is-authoritative; `DomAdapter.text` clobbers a live editor)" clause —
  superseded insofar as contenteditable is now the OPT-IN editing control when
  `editingMode === 'contenteditable'`. The commit-on-blur, dirty-edit guard,
  and caret/focus-host-state pins remain.
- **line 51, RICH-TEXT-EDITING-GATE:** the "no global `editingMode` field"
  clause (decision D) — superseded by the new global `editingMode` operator
  setting.

The row records: `editingMode: 'textarea' | 'contenteditable'` is an
`OperatorSettings` field (default `'textarea'`); contenteditable is the OPT-IN
editing control when `editingMode === 'contenteditable'` (a rich-eligible RAG
subtree root splices to `contenteditable: true`; ineligible roots fall back to
textarea); textarea stays the DEFAULT; a mode change writes the store → main
broadcasts `operator-settings-changed` → host uses the payload (authoritative,
amendment A — no re-fetch) → fresh re-derive; commit-on-blur, the dirty-edit
guard, RAG-authoritative re-traversal, and all-UI-via-provident authoring are
RETAINED.
Date + source as per the existing rows (source: `docs/specs/editing-mode-toggle-review.md` §4-D + §3 amendments 1/2/4; `docs/specs/unit-u1-editing-mode-setting.md`).

---

## 2. Every state + fail-state (TestWriter red set)

### 2.1 Happy-path states (TestWriter red set — valid paths)

**Store — `DEFAULT_SETTINGS` / `sanitize` / `set` / `get` (node-testable):**
1. **`DEFAULT_SETTINGS.editingMode === 'textarea'`** (the safe default, decision D).
2. **`sanitize({ editingMode: 'contenteditable' })`** → `editingMode: 'contenteditable'`.
3. **`sanitize({ editingMode: 'textarea' })`** → `editingMode: 'textarea'`.
4. **`sanitize` with `editingMode` ABSENT** → `'textarea'` (a v1 settings file
   without the field defaults to textarea — additive/backward-compatible).
5. **`sanitize` of a first-run / empty / corrupt file** → `editingMode: 'textarea'`
   (existing never-throws boot path extended with the 4th field).
6. **`set({ editingMode: 'contenteditable' })`** → stores + returns
   `editingMode: 'contenteditable'`, persists, and leaves the other 3 fields
   unchanged.
7. **`set({ editingMode: 'textarea' })`** → stores `'textarea'`.
8. **`set({})` (empty patch)** → `editingMode` UNCHANGED (a patch without
   `editingMode` does not touch it).
9. **`set({ topK: 7 })`** → `editingMode` unchanged, `topK` updated (a
   non-editingMode patch preserves `editingMode`).
10. **`set(null)` / `set(undefined)`** → the existing early return (`this.get()`);
    `editingMode` unchanged.
11. **`get()`** → returns a copy including `editingMode` (4 fields).
12. **Round-trip:** `set({ editingMode: 'contenteditable' })` → `get()` →
    `editingMode: 'contenteditable'`; persisted reload → still
    `'contenteditable'`.

**Type-level (typecheck green):**
13. **`OperatorSettings` has 4 required fields** incl. `editingMode: EditingMode`.
14. **`OperatorSettingsPatch.editingMode?: EditingMode`** accepts `'textarea'` /
    `'contenteditable'` and rejects nothing (optional).
15. **`IPC_OPERATOR_SETTINGS_CHANGED`** is the string
    `'provident:operator-settings-changed'`.

**Broadcast (main SET handler):**
16. **One broadcast per successful SET:** invoking `IPC_OPERATOR_SETTINGS_SET`
    with a valid patch → `operatorSettingsStore.set` runs, the SET handler
    broadcasts `IPC_OPERATOR_SETTINGS_CHANGED` EXACTLY ONCE with the store's
    result (payload `OperatorSettings` incl. the coerced `editingMode`), and
    returns that same result.
17. **Payload is the store's filtered result, not the raw patch:** a patch with a
    junk `editingMode` (e.g. `'foo'`) → the broadcast payload carries
    `editingMode: 'textarea'` (coerced), not `'foo'`.
18. **`IPC_OPERATOR_SETTINGS_GET` does NOT broadcast** (unchanged read-only path).
19. **The broadcast is one-way** (a `send`, not an `invoke`/reply) — no reply
    expected from the renderer.

**Preload subscription:**
20. **`operatorSettings.onChanged(handler)`** subscribes to
    `IPC_OPERATOR_SETTINGS_CHANGED`; a main broadcast invokes `handler(settings)`
    with the payload; the returned unsubscribe removes the listener (a later
    broadcast does NOT invoke it).

**Host — `onOperatorSettingsChanged`:**
21. **Valid broadcast → payload-authoritative state update → re-derive:** on a
    `operator-settings-changed` event, the host uses the PAYLOAD directly (it IS
    the store result — amendment A, NO re-fetch), sets `lastOperatorSettings` +
    `editingMode` from the payload, and calls `requestRebuild()` (→ `reDerive`, a
    FRESH `buildTraversalEnvelope`). The handler is fully synchronous.
22. **Mode swap in the app graph:** with the fetched `editingMode ===
    'contenteditable'`, the subsequent `reDerive` → `loadAppGraph` →
    `applyEditingMode` splices eligible roots (textarea removed +
    `contenteditable: true`); with `'textarea'`, it is a no-op (Unit U3 splice
    already green — this wires it to the operator setting).
23. **Mode toggle → fresh re-derive (Unit U3 F1):** toggling contenteditable→
    textarea runs a FRESH `buildTraversalEnvelope` (re-traversal re-emits the
    textareas) — NOT `refresh()` over the cached spliced envelope. Regression: a
    textarea→contenteditable→textarea round-trip restores all textareas.
24. **Operator control re-render:** after the broadcast-driven re-derive, the
    operator graph re-renders (`refresh()` → `renderOperator` →
    `settingsContent`), so the text div shows the NEW stored `editingMode`, the
    button label shows the NEW toggle action, and the button's `data-mode` carries
    the NEW toggled value.
25. **Dirty-edit guard (mode toggle mid-edit):** if a control is dirty
    (`requestRebuild` QUEUES the rebuild instead of executing — Unit D §5.2), the
    mode-toggle re-derive is queued and runs once the dirty control commits /
    clears (it is NOT lost, NOT dropped).

**Control — `settingsContent` (through the operator graph):**
26. **Button-toggle renders (the pivot):** the control renders a text `div`
    (`id: 'operator-editing-mode'`) whose content is `editingMode:
    <s?.editingMode ?? 'textarea'>` AND a `button` (`id: 'operator-editing-mode-toggle'`)
    whose `content` is the toggle action label and whose `data-mode` prop is the
    toggled mode. When current is `'textarea'`, the label is `'Switch to
    contenteditable'` and `data-mode` is `'contenteditable'`; when current is
    `'contenteditable'`, the label is `'Switch to textarea'` and `data-mode` is
    `'textarea'`. NO `checked`/`selected` prop is authored (no boolean-attribute
    state — the pivot).
27. **Click dispatch → `operatorSet({ editingMode })`:** a click on the button
    dispatches `operator-editing-mode-toggle`; the handler reads the button's
    `data-mode`, validates it against the union, and calls
    `window.provident.sidebar.operatorSet({ editingMode: <data-mode> })`. The
    handler does NOT use the dispatched click `value` arg (a button's `value` is
    the empty string on click).
28. **`lastOperatorSettings === null` (before the first fetch):** the text div
    shows `editingMode: textarea`, the button label is `'Switch to contenteditable'`,
    and `data-mode` is `'contenteditable'` (the `'textarea'` default → toggles to
    contenteditable).
29. **A click on the control → `operatorSet({ editingMode })` → SET → broadcast
    → re-derive → mode swap:** the full end-to-end path swaps the editor.

**`operatorSet` simplification:**
30. **`operatorSet({ editingMode: 'contenteditable' })`** fires
    `bridge.operatorSettings.set({ editingMode: 'contenteditable' })` and does
    NOT call `mountOperator()` / does NOT update `lastOperatorSettings` inline
    (the broadcast drives both). The operator graph is re-rendered by the
    broadcast-driven re-derive, not a direct re-mount.

**Supersession:**
31. **A new DECIDED row** appears under `## ACTIVE` in `docs/decisions.md`
    superseding FORM-CONTROL-EDITING's "NOT contenteditable" + RICH-TEXT-EDITING-GATE's
    "no global editingMode field" (decision D), recording the opt-in
    contenteditable control + textarea-default + retained commit-on-blur /
    dirty-edit guard / RAG-authoritative re-traversal / all-UI-via-provident.

### 2.2 Fail-states (TestWriter red set — documented fail-states)

1. **Junk `editingMode` in a patch:** `set({ editingMode: 'foo' })` /
   `set({ editingMode: null })` / `set({ editingMode: '' })` → coerced to
   `'textarea'` (never stored as junk; the union `EditingMode` is enforced at the
   boundary by the coercion rule).
2. **Junk `editingMode` in a persisted file:** `sanitize({ editingMode: 'bogus' })`
   → `'textarea'` (a tampered/corrupt persisted value is coerced, never
   propagated).
3. **Malformed settings payload on the broadcast (amendment A):** the host trusts
   the PAYLOAD as authoritative (it IS the store result) but defensively coerces
   `editingMode` (`=== 'contenteditable' ? 'contenteditable' : 'textarea'`). A
   malformed/garbage `editingMode` value in the payload does NOT set
   `this.editingMode` to junk — it coerces to `'textarea'` and the handler STILL
   rebuilds (the payload is authoritative, not dropped). Must NOT throw / crash
   the host.
4. **Payload-authoritative (amendment A — the re-fetch failure path is GONE):**
   there is NO re-fetch, so there is no `bridge.get()` rejection path in
   `onOperatorSettingsChanged`. A malformed/absent `editingMode` in the payload
   coerces to `'textarea'` and `requestRebuild` still fires (the mode change is
   NOT silently dropped). Must NOT throw / crash the host.
5. **Handler body with a junk `data-mode`:** a crafted button whose `data-mode`
   prop is NOT `'textarea'`/`'contenteditable'` (e.g. `'foo'`) → the handler
   drops it (no `operatorSet` call, no write). Must NOT set `editingMode` to junk.
6. **`operatorSet` with a partial patch from the control:** the control only ever
   sends `{ editingMode }`; `bridge.set` preserves the other 3 fields (the store's
   patch semantics) — a regression assertion that a mode toggle does NOT clobber
   `enabledPanes`/`defaultDocumentId`/`topK`.
7. **No-op SET still broadcasts once:** a `set` that leaves settings unchanged
   (e.g. `set({ editingMode: 'textarea' })` when already `'textarea'`) still
   broadcasts EXACTLY ONCE (the handler broadcasts after every SET). The host's
   re-derive on a redundant broadcast is harmless (idempotent), not a loop.
8. **No re-derive loop:** reDerive / loadAppGraph / renderOperator / refresh do
   NOT write settings → a re-derive can never re-trigger
   `IPC_OPERATOR_SETTINGS_CHANGED`. Regression: one settings SET → exactly one
   broadcast → exactly one host re-derive; the re-derive itself produces zero
   additional broadcasts.
9. **The control is NOT MCP-visible:** the editingMode button-toggle lives in the
   `#operator-panes` operator isolated scope — `get_rendered_html` /
   `get_markdown` / `list_targets` / `get_node_state` / `provident.dispatch`
   (which read the app Runtime) MUST NOT see or dispatch it. A regression
   assertion that the control is absent from the app Runtime's surface.
10. **Cross-unit textarea gate (amendment 4):** in contenteditable mode, an
    eligible root exposes NO `textarea-<ragId>` element after the mode-change
    re-derive (Unit U3 §2.2 state 5). The mode toggle re-derive must not leave a
    stale `textarea-<ragId>` for a now-contenteditable eligible root (the fresh
    traversal + splice handles this; a cached-envelope reuse would violate it —
    must-hunt §5).
11. **A button click firing during a re-derive:** the click dispatch →
    `operatorSet` → SET → broadcast → `onOperatorSettingsChanged` →
    `requestRebuild` — if a re-derive is already in flight, `requestRebuild`'s
    guard + `reDerive`'s in-flight coalescing queue the second change (not lost,
    not a duplicate parallel traversal). Regression: rapid double-click (double-fire)
    runs ONE additional coalesced re-derive, not two interleaved ones.
12. **`EditingMode` is the SAME type in U1 and U3:** the `OperatorSettings.editingMode`
    uses the existing `'textarea' | 'contenteditable'` type — a typecheck that a
    junk literal is rejected (only the two members are assignable). The host's
    runtime coercion is the defense-in-depth for values crossing the IPC.

---

## 3. Numeric / census claims

- **`OperatorSettings` fields:** **3 → 4** (`enabledPanes`, `defaultDocumentId`,
  `topK`, + `editingMode`).
- **`OperatorSettingsPatch` fields:** **3 → 4** (`enabledPanes?`,
  `defaultDocumentId?`, `topK?`, + `editingMode?`).
- **`EditingMode` members:** **2** — `'textarea'`, `'contenteditable'` (unchanged
  from U3).
- **New IPC channels:** **1** — `IPC_OPERATOR_SETTINGS_CHANGED` =
  `'provident:operator-settings-changed'` (added alongside the existing
  `IPC_OPERATOR_SETTINGS_GET`/`SET`).
- **New preload bridge methods:** **1** — `operatorSettings.onChanged(handler)`
  (returns an unsubscribe function; the same shape as `edit.onRagStoreChanged` /
  `template.onTemplateChanged`).
- **New host methods:** **1** — `onOperatorSettingsChanged(payload)`.
- **New host fields/subscriptions:** **1** — `unsubSettings` (alongside
  `unsubRag`/`unsubTemplate`).
- **New handler bodies:** **1** — `OPERATOR_EDITING_MODE_TOGGLE_HANDLER` (the
  button's click handler; shared by the single toggle; `OPERATOR_EDITING_MODE_TOGGLE_BODY`
  is the same handler's inner-statements form — the two-string representation).
- **`DEFAULT_SETTINGS`:** `editingMode: 'textarea'` (the 4th member).
- **Coercion rules:** **2** — one in `sanitize`, one in `set` (identical
  rule: only the exact string `'contenteditable'` passes; everything else →
  `'textarea'`).
- **Broadcast count:** exactly **1** per `IPC_OPERATOR_SETTINGS_SET` invocation
  (after the store `set` returns); **0** per `IPC_OPERATOR_SETTINGS_GET`.
- **Settings control (the pivot):** **1** editingMode button-toggle = **1** text
  `div` (the current mode) + **1** `button` (the toggle action) + **1** click
  handler (`operator-editing-mode-toggle`). **NO** `checked`/`selected`
  boolean-attribute props are authored (the pivot avoids the confirmed
  `provident-ssr` boolean-attribute engine gap — `HOST/U1-ENG`).
- **Existing display-only divs:** **3** preserved (`operator-enabled-panes`,
  `operator-default-document`, `operator-topk`).
- **Supersession:** **1** new DECIDED row; supersedes **2** clauses
  (FORM-CONTROL-EDITING "NOT contenteditable" + RICH-TEXT-EDITING-GATE "no global
  editingMode field").
- **Retained invariants (0 changes):** traversal stays PURE (still emits
  textarea); textarea stays the DEFAULT mode; commit-on-blur; the dirty-edit
  guard; RAG-authoritative re-traversal; all-UI-via-provident authoring.

---

## 4. Cross-references + section numbers

- **Proposal review:** `docs/specs/editing-mode-toggle-review.md` §4-C (decision
  **C** — the `operator-settings-changed` broadcast → `requestRebuild` →
  `reDerive` mechanism, the host `applyEditingMode` splice), §4-D / decision
  **D** (the supersession — one new DECIDED row; textarea stays the default), §3
  amendment 1 (the ORIGINAL SELECT-vs-radio control fallback test-first; **this
  rework pivots it to the button-toggle to AVOID the confirmed boolean-attribute
  engine gap** — see `HOST/U1-ENG` and the §4 engine reference), amendment 2 (no
  re-derive loop by construction) + amendment A (the broadcast payload IS the
  store's result and is authoritative for host state — NO re-fetch; §1.3/§2.2),
  amendment 4 (the cross-unit textarea gate — the
  `textarea-<ragId>` element is absent in contenteditable mode), amendment 8 (the
  `contenteditable` prop→attribute mapping — verified, no engine defect), §5 (the
  U1 row: `src/shared/types.ts`, `src/main/operator-settings-store.ts`,
  `src/main/main.ts`, `src/main/preload.ts`, `src/renderer/sidebar-panes.ts`,
  `docs/decisions.md`).
- **Unit U3:** `docs/specs/unit-u3-rich-eligibility-splice.md` §1.2/§1.3 (the
  existing `EditingMode` type + the host `editingMode` field + `applyEditingMode`
  splice that U1 wires), §5-F1 (**contract for U1: mode toggling MUST always
  trigger a fresh re-derive — never `refresh()` over the cached spliced
  envelope**), §2.2 state 5 (the cross-unit textarea gate).
- **Store:** `src/main/operator-settings-store.ts` — `OperatorSettings` default
  (`{enabledPanes:[], defaultDocumentId:null, topK:5}`, + `editingMode:
  'textarea'`), `sanitize` (coercion), `set` (patch), `get` (copy), `persist`.
- **Shared types:** `src/shared/types.ts` — `OperatorSettings` (~490),
  `OperatorSettingsPatch` (~500), `IPC_OPERATOR_SETTINGS_GET/SET` (~506),
  `EditingMode` (~427, already added in U3), the IPC channel list, the broadcast
  const (`IPC_OPERATOR_SETTINGS_CHANGED`).
- **Main:** `src/main/main.ts` — the `IPC_OPERATOR_SETTINGS_GET/SET` handlers
  (~311-312, the SET handler gains the broadcast), the `backend.broadcast`
  pattern for `IPC_RAG_STORE_CHANGED` (~230/267) / `IPC_TEMPLATE_CHANGED` (~297).
- **Preload:** `src/main/preload.ts` — the `operatorSettings` bridge (~272-279,
  + `onChanged`), the `on*` subscription pattern (`onRagStoreChanged` ~198-206,
  `onTemplateChanged` ~258-266).
- **Renderer host:** `src/renderer/sidebar-panes.ts` — `settingsContent` (~557-568,
  the display-only divs + the NEW button-toggle), `operatorSet` (~808-813, simplified),
  `boot` (the subscription wiring ~470-471, + `unsubSettings`), the `editingMode`
  field (~243), `onOperatorSettingsChanged` (NEW), `loadAppGraph`/`applyEditingMode`
  (the splice the re-derive drives), `handleOperatorEvent` (~848-861, the
  click-dispatch path — a button target carries an EMPTY `value`, so the toggle
  handler reads `data-mode`, not the click arg).
- **Edit controller:** `src/renderer/edit-controller.ts` §5.2 (`requestRebuild`
  dirty-edit guard, `clearDirty`/`commit` queued-rebuild execution,
  `onRebuild` = the host `reDerive`).
- **Decisions:** `docs/decisions.md` line 17 (FORM-CONTROL-EDITING — the "NOT
  contenteditable" clause superseded) + line 51 (RICH-TEXT-EDITING-GATE — the
  "no global editingMode field" clause superseded). Related: OPERATOR-ISOLATED-
  GRAPHSCOPE, UI-MOUNT-RE-DERIVE (the shared re-derive path), UI-MOUNT-OPERATOR,
  TEXTAREA-PROVIDENT-AUTHORING, MCP-UI-EQUIVALENCE.
- **Engine form-control + boolean-attribute gap (READ-ONLY reference):**
  `node_modules/provident-ssr/dist/core/adapters.js` — `FORM_CONTROLS`/`VALUE_FORMS`
  (lines 18-19) and `DomAdapter.setProp` (the generic `else` branch at ~196-202,
  `el.setAttribute(attr, bakeValue(val))`; `bakeValue(false)` → `'false'`).
  **This is the CONFIRMED engine gap `HOST/U1-ENG`:** a boolean attribute
  (`checked`/`selected`) set to `false` via the prop path is STILL PRESENT (a
  radio renders checked / an option renders selected) because `setProp` has NO
  boolean-attribute special-casing. The button-toggle control AVOIDS it (no
  `checked`/`selected` props). Do NOT modify the package — recorded in
  `docs/defects.md` + `docs/HANDOFF.md`.
- **SecurePanels / operator-handler pattern:** `src/renderer/secure-panels.ts` +
  `src/renderer/sidebar-panes.ts` `DOC_NAV_SELECT_BODY` (lines 114-119) — INLINE
  function-string handler bodies reaching the bridge via
  `window.provident.security` / `window.provident.sidebar`, reading target data
  from `ctx.node.props['data-*']` (the operator isolated-scope convention the U1
  toggle handler mirrors: `ctx.node.props['data-mode']`).

---

## 5. Adversarial must-hunt list + integration note

**Integration note:** U1 is the wiring unit — it connects the U3-shipped
`EditingMode` type + host `editingMode` field + `applyEditingMode` splice to the
operator-settings value, and it adds the broadcast that drives the re-derive. The
store pieces (§1.2) are fully node-testable; the broadcast / preload / host /
control pieces ride the existing SidebarPanes host integration harness. The
control is the **button-toggle** (this rework's pivot — §1.4), green-testable via
its click dispatch; NO SELECT-form test-first gate is required. A mode toggle
ALWAYS routes through `requestRebuild` → `reDerive` (a
fresh traversal) — never `refresh()` over the cached spliced envelope (Unit U3
F1).

**Adversarial must-hunt list (the post-green adversarial reviewer MUST verify
these; the TestWriter writes the regression tests NOW from this list):**

- **ADR-1 — re-derive loop:** the broadcast fires ONLY on a settings SET, never
  from inside `reDerive`/`refresh`/`loadAppGraph`/`renderOperator`; reDerive does
  NOT write settings; `onOperatorSettingsChanged` READS the payload (amendment A,
  no re-fetch) and never calls `bridge.set`. One settings SET → exactly one
  broadcast → exactly one host re-derive → zero additional broadcasts. A loop (a
  re-derive that re-triggers the broadcast) is a hard fail-state (§2.2 state 8).
- **ADR-2 — payload-authoritative (amendment A):** the broadcast payload IS the
  store's result (main broadcasts `operatorSettingsStore.set()`'s return
  post-SET), so the host trusts the payload directly for state — NO re-fetch
  (redundant + an async race with the sync `requestRebuild`). A payload
  `editingMode` of `'contenteditable'` → host uses `'contenteditable'` +
  rebuilds; a junk/absent `editingMode` → coerced to `'textarea'` (still
  rebuilds). The old payload-vs-fetch divergence is gone (§2.2 states 3/4).
- **ADR-3 — malformed settings payload:** a garbage/malformed `editingMode` in
  the payload, or a persisted corrupt file, must all be coerced (never set
  `this.editingMode` to junk) and never throw/crash the host (§2.2 states 3/4).
- **ADR-4 — control firing during a re-derive:** a button click while a
  re-derive is in flight must coalesce via the existing guard (`requestRebuild` +
  `reDerive` in-flight/queued), never run two interleaved traversals (§2.2 state
  11).
- **ADR-5 — the button toggle value (the pivot):** verify the click handler reads
  the CORRECT toggled mode from the button's `data-mode` prop (the OTHER union
  member of the current stored mode) and that the label/`data-mode` are mutually
  consistent on every `settingsContent()` render. Verify the handler does NOT
  depend on the dispatched click `value` arg (a button's `value` is the empty
  string via `handleOperatorEvent`). A `data-mode` that is NOT one of the two
  members is dropped (no write). A text div/button label/`data-mode` mismatch is
  a defect (§2.1 states 26/27/28).
- **ADR-6 — mode toggling mid-edit (dirty guard):** a mode toggle while a
  control is dirty must be QUEUED by `requestRebuild`, not lost, and must run
  once the dirty control commits/clears (§2.1 state 25). A toggle dropped while
  dirty is a defect.
- **ADR-7 — settings-pane control visibility:** the editingMode button-toggle is
  in the OPERATOR isolated scope (`#operator-panes`) — an MCP agent cannot read /
  list / dispatch / mutate it. A regression that the control is absent from the
  app Runtime's MCP surface (§2.2 state 9). A control leaked into the app graph
  is a review finding.
- **ADR-8 — cross-unit textarea gate (amendment 4):** in contenteditable mode an
  eligible root exposes NO `textarea-<ragId>` after a mode-change re-derive; a
  stale textarea lingering for a now-contenteditable root (cached-envelope reuse)
  is a defect (§2.2 state 10). The mode toggle MUST fresh re-derive (Unit U3 F1).
- **ADR-9 — redundant SET broadcast storm + click double-fire:** rapid repeated
  button clicks each fire SET → broadcast once and each re-derive coalesces; a
  DOUBLE-CLICK must run ONE additional coalesced re-derive, not two interleaved
  ones; a pathological loop of the operator control firing while its own re-render
  is pending must not cascade (§2.2 states 7/11). Also: clicking the toggle while
  already in the target mode (a redundant toggle) still broadcasts once — harmless
  (idempotent), not a loop.
- **ADR-10 — `operatorSet` simplification regressions:** after removing the inline
  `.then`/`mountOperator`, the operator graph STILL re-renders with the new mode
  (via the broadcast-driven `refresh()` → `renderOperator`); a control that stops
  updating after a click is a regression (§2.1 states 24/30). Also verify the
  control's mode-token write does NOT clobber the other 3 settings fields (§2.2
  state 6).

**Recording rule (RCA-3):** after the unit's green, the read-only adversarial
sub-agent runs the must-hunt list above plus any further edge cases. Every HOST
finding (this repo's `src/`) is fixed here + regression-tested, and the finding
record is appended to this §5. Every PACKAGE finding (in
`node_modules/provident-ssr/` or the upstream `../Preempt-Providence/` — e.g. the
CONFIRMED boolean-attribute engine gap `HOST/U1-ENG`: `checked`/`selected` set to
`false` via the prop path still renders the attribute present) is recorded in
`docs/defects.md` + `docs/HANDOFF.md`, never patched here.

**Adversarial finding record (RCA-3 — the post-green host findings, each fixed
here + regression-tested in `tests/editing-mode-broadcast-host.test.ts`):**

- **F1 (a-med) — persisted `editingMode` not applied at boot.** `boot()` never
  fetched `operatorSettings` (the only `get()` was in `refresh()`, which boot
  never calls), so `this.editingMode` stayed `'textarea'` until a broadcast — a
  persisted `'contenteditable'` was not honored at boot, and a later re-derive
  flipped the control but not the graph (control/app-graph mismatch). **FIX:**
  `boot()` now fetches `operatorSettings` (after the security cache, before
  `loadAppGraph`), sets `this.lastOperatorSettings` + `this.editingMode` from the
  coerced value (same coercion as `onOperatorSettingsChanged`: only
  `'contenteditable'` passes, else `'textarea'`), and then loads the graph so the
  persisted mode is honored from the very first load. A bridge error keeps the
  textarea default + null `lastOperatorSettings` (never aborts boot). **Regression
  (F1):** a boot with a persisted `contenteditable` yields `contenteditable` in the
  graph (the splice is applied — `textarea-s1` absent, `contenteditable` present) +
  the control (`editingMode: contenteditable`, "Switch to textarea",
  `data-mode="textarea"`); boot calls `bridge.operatorSettings.get`; a boot-time
  get failure keeps the textarea default + still loads.
- **F2 (minor) — `onOperatorSettingsChanged` not defensive against a null/undefined
  payload.** A null/undefined payload was dereferenced (`payload.editingMode`) and
  could throw. **FIX:** the handler now guards first —
  `payload = (payload ?? { editingMode: 'textarea' }) as OperatorSettings` — it
  never throws, coerces to `'textarea'`, and STILL rebuilds (the broadcast is
  authoritative, not dropped). **Regression (F2):** a null/undefined payload → no
  throw, `editingMode`/`lastOperatorSettings` coerced to `'textarea'`, and
  `requestRebuild` still fires.
- **F3 (minor) — the registered toggle body was the inner-statements form, not
  `compileHandlerBody`-compatible.** The app Runtime resolves `registerHandlerDef`
  bodies via `compileHandlerBody(src) = new Function('return (' + src + ')')()`,
  which SyntaxErrors on the inner form (inert then, but a footgun). **FIX:** the
  toggle is now registered with the FULL function-expression form
  (`OPERATOR_EDITING_MODE_TOGGLE_HANDLER`), matching every other `registerHandlerDef`
  body in the file. **Regression (F3):** the toggle-handler test resolves the
  registered body with `compileHandlerBody` (a SyntaxError there is the F3 red
  signal) and the click still dispatches `operatorSet({ editingMode })` from
  `data-mode`.
- **F4 (minor) — no mode-toggle double-click/in-flight coalescing regression.**
  **Regression (F4):** two `onOperatorSettingsChanged` calls fired in rapid
  succession coalesce through the re-derive in-flight guard — `onRebuild` fires
  twice, but the snapshot is fetched by the initial traversal + exactly ONE
  coalesced queued run (2 total, never an interleaved 3+ cascade), and the last
  (authoritative) mode wins (§2.2 state 11).
- **F5 (minor) — `operatorSet` swallowed a rejected set (unhandled rejection).**
  **FIX:** `operatorSet` now attaches `.catch((e) => console.error(...))` (mirrors
  the submitQuery/refresh bridge-error-catch pattern) so a rejected
  `bridge.operatorSettings.set` is logged, never an unhandled rejection. The
  broadcast drives the re-render, so a failed set leaves the prior mode in place.
  **Regression (F5):** a rejecting `bridge.set` → no unhandled rejection and
  `console.error('[sidebar-panes] operator settings set failed', e)` is logged.
