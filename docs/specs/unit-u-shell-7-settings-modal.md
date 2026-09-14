# Unit U-SHELL-7 — Settings Modal (C3) — Spec

**Status:** **GREEN / COMPLETE — CODE LANDED (2026-09-14).** Adjudicated by the
**UI-overhaul umbrella gate** (PROCEED-WITH-AMENDMENTS) — C3 is pinned and
**NOT re-openable** here. This spec is the compile-horizon contract for the TestWriter (red set) +
Implementer (green) + adversarial (RCA-3) + blind-greens (RCA-4) + documentation-
review (RCA-6) loop. Resolves the modal layer per ui-overhaul §2 Rule + the
Architect rulings 1–4 (below). **Depends on** the already-landed operator
isolated-scope mounts (the SecurePanels graph into `#panes`, and the
SidebarPanes host's operator graph into `#operator-panes`) — this unit hosts
those EXISTING mounts inside the modal container; it does not author their
content. **Landed (2026-09-14):** `src/renderer/modal-state.ts` (NEW,
`createModalController` + `installSettingsModal`), the `renderer.ts` `main()`
call, the `index.html` shell-chrome modal; TestWriter red 37 → green 40 (incl.
the SH7-ADV1..3 adversarial regression pins — §3c); trio **4566 pass / 58 skip,
typecheck 0, build 0**.

---

## 1. What the proposal asks

`docs/specs/ui-overhaul.md` **C3** (line 29) asks:

> **Settings hidden by default; appear in a modal when clicking a toggle at the
> bottom of the left sidebar.**

The current state pins the gap: **Settings is always-rendered at the bottom as
the operator `settings` pane** (`SidebarPanes.registerPanes`, registered
`id: 'settings'`), **mounted in `#operator-panes`**, and the SecurePanels graph
is always-rendered in `#panes`. The draft reading (the C3 target) pins the
deliverable:

> A **modal layer** (shell frame/scrim) hosting the operator isolated-scope
> panels. Hidden by default; a fixed toggle at the bottom of the left sidebar
> opens it. The modal is an **isolation-system mount** — content is authored
> in an isolated `createIsolatedScope()` graph, so it is MCP-invisible by
> construction. The modal hosts **only operator-only panels** (security,
> operator settings, registry manage, modules, gnosis status,
> appearance/UI-config); **MCP-exposed app-graph panes never enter the modal**.

So this unit delivers **the shell frame/scrim + the fixed toggle + the
open/close state + the hosting of the EXISTING operator-only mounts inside the
modal container** — nothing else. The pane bodies stay exactly where the
landed units put them:

- the **SecurePanels** operator-only graph (Security Settings + Debug + Module
  management; `secure-panels.ts`, its own `createIsolatedScope()` GraphScope)
  rendered into the `#panes` mount — **this mount moves INTO the modal**;
- the **SidebarPanes host's operator isolated-scope graph**
  (`operatorScope`/`operatorSupervisor`/`operatorRoot`,
  `buildOperatorEnvelope` → the `settings` + `gnosis-status` operator panes)
  rendered into the `#operator-panes` mount — **this mount moves INTO the
  modal**.

The ui-overhaul boundary is binding (Table C + §2 Rule): the modal **frame +
scrim + open/close** are **shell chrome**; the operator panel **content** stays
provident-authored in an **isolated graph** (never hand-written DOM). The
"Modal open/close control" is a click-style control; the open/close state rides
`css.classes`/hook/state; the **frame mechanics** (scrim, Escape, focus) are
external browser primitives (ui-overhaul §2/Table B "Modal frame + scrim").
MCP-exposed app-graph panes (doc-nav, crosslinks, search, template-editor,
gnosis query/wikis/documents, inspector, console) **never** enter the modal
(ui-overhaul §2 "Isolation boundary (C3)").

**The requirement is already ADJUDICATED** (the umbrella gate + ui-overhaul
§5.7 **SG4** assigns "No modal / isolation mount" → **U-SHELL-7**; §7 **Q2**
resolves "Shell frame/scrim + existing operator isolated scope body (C3)"; §7
**Q11** resolves the modal does NOT host pane-visibility, which lives in the
View menu). This spec does not re-open C3; it pins the testable shell core.

## 2. Contract (pinned)

The Architect rulings 1–4 (the task brief) are binding and encoded verbatim
below. **Scope = the modal SHELL + toggle + re-mount only.**

### 2.1 The pure ModalController surface (NEW — node-testable, TOTAL)

Add a NEW pure module `src/renderer/modal-state.ts` (name is free) exporting:

```
createModalController(options?: ModalControllerOptions): ModalController

interface ModalControllerOptions {
  initialOpen?: boolean    // default false
  onOpen?: () => void      // OPTIONAL callback, fired on a close→open transition
  onClose?: () => void     // OPTIONAL callback, fired on an open→close transition
  onToggle?: () => void    // OPTIONAL callback, fired on EVERY successful toggle
}

interface ModalController {
  open(): void
  close(): void
  toggle(): void
  isOpen(): boolean
}
```

Pinned semantics (the node-testable core — this is what the TestWriter's red
set + the §5.7 PBT rows drive):

- **TOTAL on malformed options:** `createModalController()` with no arg,
  `null`, a non-object, or an object with non-function `onOpen/onClose/onToggle`
  and non-boolean `initialOpen` **never throws** and returns a working
  controller. A non-boolean `initialOpen` is coerced to **`false`** (fail-closed
  — the modal defaults hidden). Non-function callbacks are coerced to no-ops.
- **Constructor state:** `isOpen()` immediately after construction returns
  `initialOpen === true` (strict-equality boolean only). No callback fires at
  construction.
- **`open()`:** transitions closed→open. When **already open** it is a **no-op**
  (idempotent): state unchanged, `onOpen` NOT re-fired.
- **`close()`:** transitions open→closed. When **already closed** it is a
  **no-op** (idempotent): state unchanged, `onClose` NOT re-fired.
- **`toggle()`:** if `isOpen()` is `false` it behaves as `open()`, else as
  `close()` — i.e. flips the state. `onToggle` fires on EVERY successful toggle
  (a flip), in ADDITION to the `onOpen` or `onClose` callback for that
  transition. `toggle()` on a state is therefore NEVER a no-op (it always
  flips); a `toggle()` is the only call that produces both `onToggle` and the
  relevant `onOpen`/`onClose`.
- **`isOpen()`** is **deterministic** — it returns a boolean reflecting the
  LAST valid state transition (init → open/close/toggle). Equal sequences of
  calls yield equal `isOpen()` traces.
- **Callback ordering (deterministic):** on a closed→open transition the calls
  fire `onOpen()` then (iff the transition was driven by `toggle()`) `onToggle()`.
  On an open→closed transition `onClose()` then (iff driven by `toggle()`)
  `onToggle()`. Callbacks are invoked synchronously (not queued) in that order.
  A throwing `onOpen`/`onClose`/`onToggle` must NOT propagate out of
  `open`/`close`/`toggle` (fail-soft — the state transition still completes and
  the controller never throws).
- **No DOM dependency:** the controller is purely stateful. It never touches
  `document`, `window`, any element, or `css.classes`. All DOM application is
  the wiring's job (§2.3).

### 2.2 The shell-chrome elements (authored in `src/renderer/index.html`)

Add modal frame + scrim + a fixed bottom-left toggle as **shell chrome**
(Table C / AGENTS.md exception — plain authored elements, no `on:*` handler,
not MCP-visible). **The element ids ARE the pinned canonical census (NOT free to
the Implementer)** — the wiring queries them and the TestWriter's §2.8 source-pin
+ §3b dom-shim drive assert them by literal id: `MODAL_FRAME_ID =
'settings-modal'`, `SETTINGS_TOGGLE_ID = 'settings-toggle'`,
`SETTINGS_MODAL_BODY_ID = 'settings-modal-body'`, `SETTINGS_MODAL_SCRIM_ID =
'settings-modal-scrim'` (review finding 1 adjudicated):

- **Modal frame** — `id="settings-modal"`, an overlay `<div>` in `<body>`
  (OUTSIDE the `<main class="layout">` grid — the modal is a top-layer
  shell-chrome overlay, not a grid cell). Carries BOTH state classes
  `.settings-modal` and `.is-open`/`.is-closed` (one of the two, always —
  §2.3).
- **Scrim** — a dedicated scrim child `id="settings-modal-scrim"` (adjudicated
  Q4 — **`MODAL-DEDICATED-SCRIM`**, §8): the frame does NOT double as the scrim.
  The **scrim-click-to-close** surface is pinned (a click on the dedicated scrim
  element calls `controller.close()`, §2.4). A click on the modal's **inner
  content** (`#settings-modal-body`) must NOT close it (only the scrim zone).
- **Fixed bottom-left toggle** — `id="settings-toggle"`, a plain shell `<button>`
  (or click target) **fixed at the bottom of the left sidebar**. It is the ONLY
  affordance that calls `controller.toggle()` (§2.4).
- **Modal container** — the modal frame hosts an inner container
  `id="settings-modal-body"` into which the wiring MOVES the two EXISTING
  operator mounts `#panes` and `#operator-panes` as children (re-parenting —
  §2.5). (`#panes`/`#operator-panes` REMAIN the mount elements of their
  respectively-owned isolated graphs — the re-parent does NOT destroy the
  DomAdapter mount ownership; a DomAdapter renders into the SAME element it was
  constructed with regardless of ancestry. See W-U-SHELL-7-Q1 in §8.)

**Display rule (the class contract):** the modal frame carries exactly one of
`.is-open` / `.is-closed` at all times (the wiring guarantees it — §2.3). The
CSS rule hides the frame while closed:

```
#settings-modal.is-closed { display: none; }
```

The `.is-open` state needs no display rule (it is the default visibility). The
frame is **hidden by default** (closed) — this is the C3 "hidden by default"
requirement.

### 2.3 The state→class single write (single source of truth)

`installSettingsModal` (§2.6) DRIVES the ModalController and **mirrors
`isOpen()` onto the modal frame's `css.classes`** as the SINGLE source of
truth. Pinned:

- The frame element's `className` carries `.is-open` XOR `.is-closed` at all
  times after install:
  - `isOpen() === true` → class list includes `is-open`, excludes `is-closed`;
  - `isOpen() === false` → class list includes `is-closed`, excludes `is-open`.
- **Each transition is a SINGLE managed class-write** — the wiring writes the
  frame's class exactly once per open/close transition (not a per-gesture or
  per-affordance stream). The state transition IS the class write; there is no
  independent "open"/"close" DOM flip.
- The wiring **never flips the DOM independently** of the controller. Any
  class-mirror write must be causally coupled to a `controller.open/close/toggle`
  call.
- **Mirror mechanism (review finding 6 adjudicated):** the class write is driven
  by an **`isOpen()` READ** performed after each controller call — the controller
  is the SINGLE source of truth, the wiring reads `isOpen()` and applies the XOR
  class set. The `onOpen`/`onClose`/`onToggle` callbacks are **PURE state-transition
  notifications with NO DOM duty** (§2.1 — the controller never touches
  `css.classes`); the wiring does not put the class write inside the callbacks.
- **Node-testability of "hidden" (review finding 4 adjudicated):** the
  node-testable proxy for the modal's visibility is the **class-token XOR**
  (`is-open` XOR `is-closed`) — a TestWriter asserts the token set, never a
  computed `display`. The `#settings-modal.is-closed { display:none }` rendered
  visibility and `getComputedStyle` are **browser-only goals, NOT node-asserted**.

### 2.4 The close/toggle affordances (all wired, all call the controller)

| Affordance | Fired by | Controller call |
| --- | --- | --- |
| Fixed bottom-left toggle (`#settings-toggle`) | `click` | `controller.toggle()` |
| `Escape` keydown | a document-level `keydown` where `e.key === 'Escape'` | `controller.close()` |
| Scrim click | a DIRECT `click` listener on the dedicated scrim `#settings-modal-scrim` (review finding 2 adjudicated — a single pinned shape, NOT a document-delegated click), NOT the modal content | `controller.close()` |

Pinned behavior:

- The toggle registers EXACTLY ONCE (idempotent install — §4 F5); each click
  calls `controller.toggle()` (which flips + fires the callbacks). Clicking the
  toggle while open closes the modal; while closed opens it.
- `Escape` when the modal is already closed → `controller.close()` is a no-op
  (the controller's idempotency absorbs it; no class write, no `onClose`).
- Scrim-click when closed → same idempotent no-op.
- A click on MODAL CONTENT that bubbles is NOT a close — the scrim-close is a
  DIRECT listener on the dedicated `#settings-modal-scrim` element (a content
  click never reaches it; the content subtree is not an ancestor of the scrim).

### 2.5 Hosting the EXISTING operator mounts (isolation preserved)

`installSettingsModal` moves the two EXISTING operator-only mounts INTO the
modal container as their new DOM owner:

1. `#panes` (the SecurePanels graph's mount — Security Settings + Debug +
   Module management) — re-parented as a child of the modal body.
2. `#operator-panes` (the SidebarPanes host's operator graph's mount — the
   `settings` operator pane [operator settings + registry manage] + the
   `gnosis-status` operator pane) — re-parented as a child of the modal body.

Pinned:

- **Re-mount only.** The wiring does NOT construct/re-construct either graph,
   does NOT call `refresh()`/`refreshDebug()`/`boot()`, does NOT author any pane
   body, and does NOT re-run `buildOperatorEnvelope`. It only re-parents the
   existing mount elements.
- **Isolation is PRESERVED by construction:** both mounts already render an
   isolated `createIsolatedScope()` graph, so the modal remains MCP-invisible.
   The modal is an **isolation-system mount** (C3); the app Runtime's
   `dispatch` / `get_rendered_html` / `list_targets` never see it. The wiring
   adds NO graph surface and NO MCP surface.
- **No app-graph pane enters the modal (HARD INVARIANT):** the modal's children
   are EXACTLY `#panes` and `#operator-panes` (the two operator-only mounts).
   `#app` (the stage), the app-graph pane frames, `#tab-strip`, and the gutters
   never move into the modal. An attempt to re-parent `#app`/an app-graph pane
   under the modal is a review finding (§4 F9).

### 2.6 `installSettingsModal` — the shell wiring (invocation + placement)

Add a NAMED export `installSettingsModal` (module shape free — may live in
`modal-state.ts` for co-location or in a small wiring module). It is invoked
from `renderer.ts` `main()` AFTER the hosting mounts both have their isolated
graphs constructed. Pin:

- **Signature (free shape, pinned inputs):** `installSettingsModal(host?, panels?, mounts?)`
  where `host` is the `SidebarPanes`, `panels` is the `SecurePanels | null`,
  and `mounts` is a small object of the two mount element ids/elements. The
  exact parameter shape is Implementer-free, but the wiring MUST:
  1. **resolve the modal frame (`#settings-modal`) + the toggle (`#settings-toggle`)**
     (shim-queryable — §2.7),
  2. **construct the ModalController** (§2.1),
  3. **wire** the toggle `/` Escape `/` scrim affordances (§2.4) to the
     controller,
  4. **move/host** the operator mounts (`#panes` + `#operator-panes`) into the
     modal body (§2.5),
  5. **apply the initial hidden state** — mirror `isOpen()` (`initialOpen`,
     default `false`) onto the frame's classes (§2.3) ONCE at install.
- **Fail-soft (F11-style, §4 F9/F10):** absent frame / absent toggle / absent
  host / absent mounts / no DOM → **no-op, never breaks boot, never throws.**
  Mirror the `installShellPointers` discipline in `renderer.ts` (line 593–637):
  guard `typeof document`, wrap in `try/catch`, return early on `null`.
- **Idempotent (mirror ADV4):** a SECOND call on the SAME document is a no-op
  for the affordance registration (no duplicate toggle/Escape/scrim listeners)
  and the re-parent. A module-level per-document marker (e.g.
  `settingsModalWiredDoc`) prevents double-install — §4 F5.
- **Placement in `main()`:** after `installShellPointers(host)` (line 871) —
  the operator mounts + host are constructed by then (§1 current state:
  `panels` at line ~754, `host` at line ~846, `installShellPointers` at
  line ~871). The wiring must run AFTER those so the mounts exist to re-parent.

### 2.7 Node-testability (the dom-shim surface)

The wiring is **node-testable via the dom-shim** (`src/shared/dom-shim.ts`):
the shim document already supports `getElementById`, `querySelector`/
`querySelectorAll` (the documented CSS-SUBSET), `addEventListener`/
`removeEventListener` (delegated), `appendChild` (re-parent), and element
`className`/`getAttribute`/`setAttribute`. **Generic event dispatch (review
finding 5 adjudicated):** the shim dispatches listeners by event TYPE — a
synthetic `click`/`keydown` is driven via `shimDocument.dispatchPointer('click',
target, props)` / `dispatchPointer('keydown', { key: 'Escape' })` (and the
element-local `el.dispatchPointer(type, props)`), which fire the target's own +
the document's stored listeners for that type. The TestWriter can:
- author a shim `body` with `#settings-modal`, `#settings-toggle`, `#panes`,
  `#operator-panes`,
- drive the LIVE `installSettingsModal` under the shim,
- assert the class mirror (`is-open`/`is-closed` — the token XOR, never a
  computed `display`), the affordance listeners (by dispatching a synthetic
  `click` on `#settings-toggle` / `keydown` Escape / `click` on
  `#settings-modal-scrim`), and the re-parent (the modal body's children contain
  `#panes` + `#operator-panes`).

The pure controller (§2.1) is directly node-testable with plain values — it has
NO DOM dependency.

### 2.8 Source-pinned listening/class surface (the statically-asserted layer)

Following the `unit-u-shell-shell-wiring` / `unit-u-shell-8` module-private
source-pin house convention, the TestWriter statically asserts `installSettingsModal`
registers, by literal call (a source-snapshot assertion in the test; the exact
module/line is free):

1. ONE `addEventListener('click', …)` on the toggle (`#settings-toggle`) →
   `controller.toggle()`.
2. ONE document-level `addEventListener('keydown', …)` that routes
   `e.key === 'Escape'` → `controller.close()`.
3. ONE DIRECT `click` listener on `#settings-modal-scrim` (the dedicated scrim
   child — NOT a document-delegated click) → `controller.close()`.
4. ONE `createModalController(...)` call whose `options.initialOpen` is
   `false` (the default hidden state); the wiring mirrors `controller.isOpen()`
   onto the frame's classes via an **`isOpen()` READ** after each controller call
   (the `onOpen`/`onClose`/`onToggle` callbacks are pure notifications — the
   class write is NOT inside the callbacks).
5. ONE class-write mirror `isOpen()` → the frame `className` (`is-open` XOR
   `is-closed`), and NEVER an independent DOM flip.
6. ONE re-parent of `#panes` + `#operator-panes` into the modal body
   (`appendChild` / the modal-container children).

The TestWriter asserts these `addEventListener` literals, the `createModalController`
call, the `isOpen()`-mirror, and that the two operator mounts are re-parented.
The helper/module names are NOT pinned (Implementer-free), only the
registration + mirror + re-parent surface.

## 3. States (TestWriter red set — valid paths)

The valid paths split into **(a) the pure node-testable ModalController states**
and **(b) the source-pinned / dom-shim-driven wiring states**. Both halves are
MANDATORY for a green (the shell-wiring §3 "both halves" discipline).

### 3a. The ModalController (pure, node-testable)

1. **Initial-open construction:** `createModalController({ initialOpen: true })`
   → `isOpen() === true` at construction; NO callback fired; `close()` →
   `isOpen() === false`, `onClose` fired once. (The node-testable `.is-open`/
   `.is-closed` frame-class mirror is a §3b WIRING assertion — §3a asserts only
   the pure controller state, which has no frame.)
2. **Initial-closed construction:** `createModalController({ initialOpen: false })`
   (and the no-arg / default) → `isOpen() === false`; NO callback fired.
   (The node-testable "hidden" proxy is the wiring's `.is-closed` class-token XOR
   — §3b — not a computed `display`.)
3. **toggle closed→open:** `toggle()` from closed → `isOpen()` flips to
   `true`; `onOpen` + `onToggle` both fired (in that order — §2.1).
4. **toggle open→closed:** `toggle()` from open → `isOpen()` flips to
   `false`; `onClose` + `onToggle` both fired (in that order).
5. **open() when open is a no-op:** `open()` on an already-open controller →
   state unchanged, `onOpen` NOT re-fired, `onToggle` NOT fired, and the
   wiring's class write is a no-op (no redundant class churn).
6. **close() when closed is a no-op:** `close()` on an already-closed
   controller → state unchanged, `onClose` NOT fired, no class write.
7. **Toggle/Escape/scrim three-ways (wiring):** each of the three affordances
   drives the SAME controller path — the toggle flips, Escape and scrim close.

### 3b. The wiring (dom-shim / source-pinned)

8. **Hidden by default:** after `installSettingsModal` the modal frame is
   closed — `.is-closed` class-token present, `.is-open` absent — the
   node-testable proxy for C3 "hidden by default"; the rendered `display: none`
   is browser-only, NOT node-asserted (§2.3).
9. **Toggle opens:** a synthetic click on `#settings-toggle` → the frame's
   classes flip to `is-open`; the operator mounts are visible.
10. **Escape closes:** while open, a synthetic `keydown` `Escape` → the frame
    flips to `is-closed`.
11. **Scrim-click closes:** while open, a click routed to the scrim zone →
    closed; a click on the modal CONTENT does NOT close.
12. **Hosting both operator mounts (isolation preserved):** after install, the
    modal body contains BOTH `#panes` and `#operator-panes` as children; the
    SecurePanels graph + the SidebarPanes operator graph are unchanged
    (isolated scope preserved; MCP-invisible — the modal is an isolation mount).
13. **Single class-write per transition:** each open or close produces exactly
    ONE frame class write (observable via the mirror / a counted writer), not a
    per-gesture stream.
14. **Initial state applied at install:** the mirror reflects `initialOpen`
    (default false) as the frame's starting class set.

### 3c. Adversarial findings (RCA-3, 2026-09-14 — all host-side, fixed here)

The post-green adversarial re-audit found six findings on the landed wiring; the
fixed + regression-tested ones are:

- **SH7-ADV1 (HIGH) — FIXED:** the dedicated scrim inherits `pointer-events:
  none` from `.settings-modal`, so scrim-click-to-close was DEAD in a real
  browser (the node tests bypass hit-testing). Fixed: `#settings-modal-scrim {
  pointer-events: auto; }` in `src/renderer/index.html` + a source-pin regression
  (`tests/unit-u-shell-7-settings-modal.test.ts`).
- **SH7-ADV2 (MEDIUM) — FIXED:** the class mirror ran even on idempotent
  Escape/scrim no-ops (a DOM class write per gesture, letter-violating §2.4
  F3/F4 / §2.3 "no class write on no-op"). Fixed: `installSettingsModal`'s
  `settle(act)` helper reads `isOpen()` before/after and calls the mirror only
  when the state actually changed; regression counts the class writes.
- **SH7-ADV3 (LOW) — FIXED:** the mirror replaced the whole `className`, wiping
  sibling classes. Fixed: `apply()` preserves every non-`is-open`/`is-closed`
  class; regression pins a sibling class surviving transitions.

**ACCEPTED (INFO, recorded — no code change):**
- **SH7-ADV4 (INFO):** `createModalController` enforces TOTAL by plain property
  access; an options object with THROWING GETTERS would throw. Exotic, outside
  the pinned malformed enumeration (no-arg / null / non-object / non-function
  callbacks / non-boolean `initialOpen`).
- **SH7-ADV5 (INFO):** the per-document idempotency marker tracks ONE document;
  alternating installs A→B→A would re-register. Unreachable (one document per
  process / one shim per test).
- **SH7-ADV6 (INFO):** the wired-marker is committed at the end of the install;
  a pre-commit throw would let a retry duplicate. Unreachable today (the
  re-parent `appendChild` is guarded).

**Clean (verified, no finding):** the pure controller §2.1, the re-parent
§2.5/F9 (only `#panes` + `#operator-panes`; never `#app`/gutters; re-mount only),
FAIL-SOFT + idempotency §2.6/F5-F7/F11, the Escape-only-`Escape` routing (F8), and
the content-click-won't-close scrim boundary (F12).

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | malformed options to `createModalController` (no arg / `null` / non-object / non-function callbacks / non-boolean `initialOpen`) | TOTAL — never throws, returns a working controller; `initialOpen` coerces to `false`; non-function callbacks → no-ops (§2.1) |
| F2 | a throwing `onOpen` / `onClose` / `onToggle` | fail-soft — the state transition still completes; the controller never throws (§2.1) |
| F3 | `Escape` while the modal is closed | `controller.close()` is an idempotent no-op — no class write, no `onClose` |
| F4 | scrim-click while the modal is closed | idempotent no-op — no class write, no `onClose` |
| F5 | a wiring DOUBLE-install on the same document | idempotent — the affordance listeners + re-parent register ONCE (a per-document marker); a redundant call is a no-op (mirror ADV4 / `installShellPointers`) |
| F6 | absent modal frame / toggle / host / mounts | FAIL-SOFT — `installSettingsModal` is a no-op (no listener registration, no re-parent); the app still boots; never throws (F11-style) |
| F7 | no DOM (`typeof document === 'undefined'`) / absent `addEventListener` | the pure controller still works; the wiring no-ops; never throws |
| F8 | a document `keydown` with a non-`Escape` key | ignored — no close, never a throw |
| F9 | a click on an APP-GRAPH pane or `#app` / `#tab-strip` | **never** re-parented into the modal — the modal hosts ONLY `#panes` + `#operator-panes` (HARD INVARIANT, §2.5); an attempt to move app-graph content under the modal is a review finding |
| F10 | a re-parent while the modal is closed | the graphs keep their isolated mounts (the re-parent is ancestry-only, not a destroy); isolation + MCP-invisibility preserved |
| F11 | a click on the fixed toggle before the modal frame exists | the toggle listener is guarded (absent frame → no-op), never a throw |
| F12 | a content-click bubbling through the modal body | NOT a scrim-click — never closes (the scrim zone excludes the content subtree, §2.4) |

## 5. Census

### 5.7 Property register (PBT) — MANDATORY (code-bearing unit)

This is a **code-bearing** unit (it adds the NEW pure `ModalController`), so
the register is **mandatory** (§4/§5.7 rule — a zero-row exemption is NOT
allowed). It covers the **pure, node-testable surface** — the ModalController's
input-model / state-model / transform invariants and the honest open/close
state model. The DOM wiring (listener registration, re-parent) is NOT a property;
it is asserted by the §2.8 source-pin + the §3b dom-shim drive (never a register
row — the `unit-u-shell-shell-wiring` §5.7 note).

Rows are typed **P-IM** (input-model), **P-SM** (state-model), or **P-TP**
(transform) — NEVER F-rows, NEVER §4 rows. **Class tally ≤ 8.** All rows state
HONEST pure/state invariants observable from the pinned `createModalController`
surface (§2.1) — no row reaches into the wiring internals, none invents a
return field.

| Ref | Class | Invariant | Strategy | Checkable proposition (∀ pattern) |
|---|---|---|---|---|
| `P-IM-1` | IM | **`createModalController` is TOTAL over its option domain.** Every shape (no arg, `null`, non-object, an object with non-function callbacks and a non-boolean `initialOpen`) constructs a working controller — never a throw; a non-boolean `initialOpen` coerces to `false`; non-function `onOpen/onClose/onToggle` are coerced to no-ops. | `strat:modal-options-total` | ∀ generated `options ∈ {null, undefined, {}, {initialOpen:<any>}, {onOpen:<any>,…}}`: `createModalController(options)` returns; `isOpen()` immediately after is a boolean; non-boolean `initialOpen` ⇒ `isOpen() === false`; invoking `open/close/toggle` never throws. |
| `P-SM-1` | SM | **The open/close state is a 2-valued FLIP model, deterministic + idempotent.** `isOpen()` is a boolean reflecting the last valid transition; construction yields `initialOpen === true` else `false` (no callback fires at construction); `open()` on open is a no-op (state + callbacks unchanged); `close()` on closed is a no-op; equal call-sequences yield equal `isOpen()` traces. | `strat:modal-state-flip` | ∀ generated call-sequences over `{open, close}`: `isOpen()` is `true ⟺` construction opened OR the open-count-after-the-last-close is odd; `isOpen()` is deterministic across equal sequences; `open();isOpen()` and `open();open();isOpen()` are equal; `close();isOpen()` and `close();close();isOpen()` are equal. |
| `P-SM-2` | SM | **Transition callbacks fire EXACTLY on real transitions, in deterministic order.** `onOpen` fires once per closed→open transition; `onClose` once per open→closed transition; construction fires none; an idempotent open-on-open / close-on-close fires none; `onToggle` fires once per successful `toggle()` (every `toggle()` flips, so it always fires) alongside the matching `onOpen`/`onClose`, ordered `onOpen`→`onToggle` (open) / `onClose`→`onToggle` (close) — synchronous, in that order. | `strat:modal-callback-order` | ∀ generated sequences: `#onOpen` calls == number of real closed→open transitions; `#onClose` == open→closed transitions; `#onToggle` == number of `toggle()` calls; each `toggle()`'s fired callback set includes exactly one of `{onOpen, onClose}` plus `onToggle`; the relative call order is `onOpen`/`onClose` before `onToggle`; construction registers 0 callbacks. |
| `P-TP-1` | TP | **`toggle()` is exactly the invert transform.** `toggle()` maps the open state `S` to `¬S`, and is `true` ⟺ the previous `isOpen()` was `false`; `toggle()` is never a no-op (it always flips); two consecutive `toggle()` calls return to the original state (an involution); `toggle()` is deterministic over equal states. | `strat:modal-toggle-involution` | ∀ generated starting states `S ∈ {false,true}` and one `toggle()`: `isOpen() !== S`; `toggle();toggle()` ⇒ `isOpen() === S`; `toggle()` on both states always fires `onToggle` and exactly one of `{onOpen, onClose}`. |
| `P-TP-2` | TP | **`isOpen()` is deterministic + the single observable state carrier.** `isOpen()` returns the exact boolean the last valid transition set, is free of side effects (repeated reads are stable), and two controllers built from deep-equal options with identical call-sequences report identical `isOpen()` traces. | `strat:modal-isopen-deterministic` | ∀ generated option-pairs deep-equal: the two controllers' `isOpen()` values after identical sequences are equal; calling `isOpen()` 100× with no interleaved transition returns the same boolean every time. |
| `P-TP-3` | TP | **The controller's `isOpen()` (the single source of truth) maps 1:1 to the frame's class mirror.** `isOpen() === true` ⟺ the frame carries `is-open` and excludes `is-closed`; `isOpen() === false` ⟺ the frame carries `is-closed` and excludes `is-open`; ANY transition changes the class set exactly once (no churn on idempotent calls). *(The controller exposes only `isOpen()`; this row drives a test-built mirror wrapper that reflects `isOpen()` onto a shim frame's class tokens — the §2.3 wiring mirror, asserted as pure-state-adjacent.)* | `strat:modal-class-mirror` | ∀ generated sequences, with a shim frame reflecting the mirror: after every transition the frame's class list has EXACTLY one of `{is-open, is-closed}` and it equals `isOpen()` by the mapping above; an idempotent `open`-on-open / `close`-on-closed produces NO class change (the class write count is unchanged). |

**Class tally:** IM ×1, SM ×2, TP ×3 = **6 rows ≤ 8** ✔.

The rows are **NOT over-strength**: every proposition is directly observable
from the pinned `createModalController` surface (§2.1) + the pinned class mirror
(§2.3) — P-TP-3 uses a shim-frame mirror, never the real DOM. No row reaches
into `renderer.ts`/`sidebar-panes.ts` internals, none invents a return field,
and the DOM listener registration is deliberately EXCLUDED (covered by the
§2.8 source-pin + §3b dom-shim drive, per the `unit-u-shell-shell-wiring` §5.7
note). A correct controller + mirror passes every row; one that throws on
malformed options, breaks idempotency, mis-orders callbacks, fails the
involution, or desyncs the class mirror would fail.

### 5.8 Census — names, ids, classes, cross-refs

**Interfaces / module surface (NEW):**
- `createModalController(options?): ModalController` (§2.1).
- `ModalControllerOptions { initialOpen?; onOpen?; onClose?; onToggle? }` (§2.1).
- `ModalController { open(): void; close(): void; toggle(): void; isOpen(): boolean }` (§2.1).
- `installSettingsModal(host?, panels?, mounts?): void` (§2.6).

**Shell-chrome element ids (canonical census — Implementer-free in name, but the
wiring + TestWriter query these):**
- `MODAL_FRAME_ID = 'settings-modal'` — the modal frame/scrim `<div>` (in
  `<body>`, outside `<main class="layout">`).
- `SETTINGS_TOGGLE_ID = 'settings-toggle'` — the fixed bottom-left toggle
  (shell `<button>`/click target at the bottom of the left sidebar).
- `SETTINGS_MODAL_BODY_ID = 'settings-modal-body'` — the modal container the
  wiring re-parents the operator mounts into. (Names Implementer-free; the ids
  above are the census.)
- `SETTINGS_MODAL_SCRIM_ID = 'settings-modal-scrim'` — the MANDATORY dedicated
  scrim child (per `MODAL-DEDICATED-SCRIM`, Q4); the frame does NOT double as
  the scrim; it carries the DIRECT scrim-click→`controller.close()` listener.

**State classes (the class contract):** `.settings-modal`, `.is-open` (XOR)
`.is-closed` (§2.3). CSS: `#settings-modal.is-closed { display: none }`.

**The operator-only mounts that MUST live INSIDE the modal (re-parented, NOT
re-built):**
- `#panes` → the SecurePanels isolated graph (Security Settings `#settings-pane`
  + `#security-status`/`#security-token`/`#group-toggles`/`#journal-length`; Debug
  `#debug-pane`/`#status`; Module `#module-pane`/`#module-status`/`#module-list`/
  `#module-runner` + PG12 runner) — `secure-panels.ts` `paneEnvelope`.
- `#operator-panes` → the SidebarPanes host operator graph (the root
  `div#operator-panes` from `buildOperatorEnvelope` — `pane-graph.ts:492`) whose
  children are the `operator-pane-<id>` wrappers of every enabled operator pane:
  - **operator settings** (`id: 'settings'`, `sidebar-panes.ts:1181`) →
    `operator-pane-settings` containing `#operator-enabled-panes`,
    `#operator-default-document`, `#operator-topk`, `#operator-editing-mode` /
    `#operator-editing-mode-toggle`, `#operator-rag-stores` (U-MS5 listing), and
    the U-H8 **registry-manage** section `#operator-rag-manage`
    (`buildOperatorManageSection`, `sidebar-panes.ts:2174`).
  - **gnosis status** (`id: 'gnosis-status'`, `gnosis-panes.ts:100`) →
    `operator-pane-gnosis-status` with `#gnosis-status-refresh`.
  - **appearance / UI-config** — listed by C3 as modal-confined operator content;
    the current code carries no dedicated appearance pane id (U-SHELL-8 owns the
    appearance/UI-config surface, §6) — the modal must host a future appearance
    pane here when U-SHELL-8 lands; it must NOT host any app-graph pane.

**App-graph panes that NEVER enter the modal:** `doc-nav`, `crosslinks`,
`search` (+ advanced-search), `template-editor`, `gnosis-query`,
`gnosis-documents`, `gnosis-wikis`, the inspector + console (ui-overhaul
Table A app-graph row, line 109) — all MCP-visible by construction.

**Files:** `src/renderer/modal-state.ts` (NEW controller+likely wiring),
`src/renderer/index.html` (modal frame/scrim/toggle + `.is-closed { display:none }`),
`src/renderer/renderer.ts` (`installSettingsModal` call in `main()` after
`installShellPointers`), `src/shared/dom-shim.ts` (reused, unchanged).

## 6. Cross-references

- `docs/specs/ui-overhaul.md` — **§1 C3** (line 29, the requirement),
  **§2 Table B** ("Modal frame + scrim | overlay node + state-driven
  `css.classes` | focus trap / inert / top-layer / Escape") + **Table C**
  (shell chrome carve-out) + the **§2 Rule** ("The shell may own open/close of
  the modal frame and the layout mechanics") + **§2 "Isolation boundary (C3)"**
  (line 155–161), **§4/G8 + §5.7 SG4** (the gap → U-SHELL-7), **§6** (no new MCP
  tool; operator carve-out), **§7 Q2** (shell frame + existing operator
  isolated-scope body) + **Q11** (the modal does NOT host pane visibility).
- `docs/specs/unit-u-shell-shell-wiring.md` — the source-pin house convention
  (§2.8), the fail-soft F11 discipline, the ADV4 per-document idempotency, the
  `installShellPointers` pattern this wiring mirrors.
- `docs/specs/unit-u-shell-8-view-menu-pane-visibility.md` — the **appearance /
  UI-config** operator surface (C9 serialized UI-config state) that must land in
  the modal as operator content; the sibling code-bearing §5.7 register format.
- The operator-pane owning specs: **U-H8** (registry manage section,
  `operator-pane-settings`/`operator-rag-manage`), **GN-MCP-UI**
  (`gnosis-status` operator pane), **U-MS5** (store listing), and
  **secure-panels** (the `#panes` Security/Debug/Module graph) — the mounts the
  modal hosts.
- `src/renderer/renderer.ts` (`main()` lines ~753 `SecurePanels`, ~800
  `operatorMount`, ~846 `SidebarPanes` host, ~871 `installShellPointers` —
  the install placement), `src/renderer/index.html` (the `.layout` grid +
  `#panes`/`#operator-panes`, the modal/toggle to add), `src/shared/dom-shim.ts`
  (node-testability), AGENTS.md (the **shell-chrome exception** + the
  **isolation / MCP-invisibility** rules — the modal is an isolation mount, and
  a pane-body written by hand is a review finding).

## 7. Delimitation

This unit adds the **modal SHELL + toggle + re-mount** only. It does NOT:

- author any pane body (the operator panes stay provident-authored in their
  existing isolated graphs — never hand-written DOM);
- move any **app-graph** pane into the modal (MCP-visible panes never enter the
  modal — a hard invariant, §4 F9);
- add any **MCP surface / tool** (the modal is an isolation mount; the operator
  carve-out holds);
- re-build / re-boot / re-run any graph or the operator envelope (it only
  re-parents the existing `#panes` + `#operator-panes` mounts);
- **persist the open state across restart** — the modal open/close is
  **session-only transient shell state** (a NON-goal, §8/Q2); C9 persistence of
  UI-config values (theme / editing mode / layout / pane enablement) stays owned
  by U-SHELL-1/2/8, and the modal OPEN state is not one of them;
- implement a **focus trap / `inert` / top-layer** — the frame mechanics beyond
  scrim + Escape + the class-driven Display rule are **external browser
  primitives** (ui-overhaul Table C) and **optional / NON-goal** here (§8/Q3).

No `docs/skills/designing-pages.md` update is owed: the file does not exist in
the repo, and the modal frame/scrim/toggle are shell chrome (place/format
provident-authored content, not pane-body markup) — consistent with the
shell-wiring spec §7 note.

## 8. Open items / open decisions (W-U-SHELL-7-*)

The C3 text + the ui-overhaul §2 boundary resolve most decisions (below, marked
RESOLVED). The genuine unknowns are flagged for the Architect:

- **W-U-SHELL-7-Q1 (RESOLVED — Architect, 2026-09-14):** the SecurePanels mount
  **`#panes` is re-parented INTO the modal** (`#settings-modal-body`), as is
  `#operator-panes` — the "re-parent" shape. Decision **`MODAL-SETTINGS-REPARENT`**
  (see `docs/decisions.md`): the modal body hosts BOTH existing operator mounts as
  children; the DomAdapter keeps its mount ownership regardless of ancestry; neither
  graph is rebuilt, no SecurePanels re-mount/adapter re-create. The alternative
  (a fresh SecurePanels container + swapping its mount) is rejected as heavier +
  adapter-recreate risk.
- **W-U-SHELL-7-Q2 (RESOLVED — session-only):** whether the toggle/open-state
  persists across restart. Ruled **session-only transient shell state** (a NON-
  goal) — C9 persistence covers UI-config *values*, not the modal's open flag;
  the modal defaults hidden on every restart. **Revisit condition:** if a future
  requirement explicitly wants the modal open on boot, it is a separate C9
  persistence item, not this unit.
- **W-U-SHELL-7-Q3 (RESOLVED — optional/non-goal):** focus trap / `inert` /
  top-layer. Ruled **external browser primitives, OPTIONAL / NON-goal** (ui-overhaul
  §7 Table C); this unit delivers scrim + Escape + the class-driven display rule.
- **W-U-SHELL-7-Q4 (RESOLVED — Architect, 2026-09-14):** a **dedicated scrim
  child `#settings-modal-scrim`** (NOT the frame itself doubling as the scrim).
  Decision **`MODAL-DEDICATED-SCRIM`** (see `docs/decisions.md`): the scrim is a
  dedicated child element; the scrim-click-to-close zone is the scrim element
  ONLY (a click on the modal CONTENT never closes — §4 F12); the modal frame
  `#settings-modal` wraps the scrim + the `#settings-modal-body`.

**Resolved (no adjudication needed):** the app-graph panes never enter the modal
(C3 + ui-overhaul §2); no MCP surface is added (operator carve-out); pane
visibility does NOT live in the modal (Q11, it is the View menu's); the open
state rides the controller→class mirror (§2.3) with a single managed write;
`installSettingsModal` is FAIL-SOFT + idempotent (§2.6/§4 F5/F6).
