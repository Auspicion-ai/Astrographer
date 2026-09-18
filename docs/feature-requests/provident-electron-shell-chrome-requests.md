# FEATURE REQUESTS → the **Provident-Electron foundation** project (handover from Astrographer)

**Date:** 2026-09-17 · **Requester:** the Astrographer shell (a fork of Provident-Electron) ·
**Status:** OPEN — filed; **the upstream project is never patched from here** (AGENTS.md item 7) ·
**Companion handoffs:** `docs/HANDOFF.md` (the index), `docs/specs/astrographer-scope-realignment-review.md` (the gate ruling),
`docs/feature-requests/gnosis-engine-feature-requests.md` (the sibling engine set GR-1..GR-9), `docs/FORK-DIVERGENCE.md`,
`docs/pending.md`.

> **Target project:** `Provident-Electron` — the Electron/MCP **foundation build** this repo forked, shipped at
> `/media/ryanr/Shared Files/Projects/Provident-Electron` (adjacent folder, not a dependency). Its work queue
> currently reads **"_(no open items — all work items are DONE as of 2026-08-26)_"**
> (`../Provident-Electron/docs/next-steps.md:13`), which is precisely why every item below is written as a
> foundation **mechanism** request rather than as a fix to a known upstream defect: nothing here is a bug report —
> each is a reusable shell primitive the foundation does not yet ship, and which every fork therefore re-invents.
>
> **Not this document's target:** the `provident-ssr` npm package. Requests against the package's upstream docs
> live in the sibling `docs/feature-requests/provident-ssr-expressibility-requests.md` (PS-1).
> **Package defects already filed as such** (`ENG-INLINE-ORDER`, `ENG-BODYRUNS-WIRE-REF-PATHSTATE`,
> `ENG-DESTROY-PLACEMENT-ANCHOR-RESIDUE`, `ENG-SUPERVISOR-HOOK-ACCUMULATION`, `REQ-GAP-*`, `ISO-ADV-D`,
> `UNDO-REDO-REPORT`, `DEFECT-SSR-REMOVE`, `DEFECT-JOURNAL-*`) are deliberately **not** repeated here.

**How each request is written:** *problem → today's fork implementation (file:line + what it hand-rolls) →
requested contract (proposed interface) → acceptance criteria (testable) → MCP-visibility consequence →
priority → target project → fallback if upstream declines → filing verdict*. Priorities: **P0** blocks a shipped
consumer path; **P1** blocks a planned consumer unit; **P2** quality/parity; **P3** destination/future.

**Verification discipline.** Every `file:line` below was re-read in this repo on 2026-09-17 and, where a cited
line had drifted since the ruling that named it, the correction is stated inline (SC-1, SC-5). No line is cited
from memory.

---

## Why these are foundation requests, not app features

`AGENTS.md`'s carve-out is **FUNCTIONAL, not geographic**: "The Electron shell's own chrome (the window frame,
the native menu bar, the preload bridge, the MCP server) is the only exception" (`AGENTS.md:23-34`). The exempt
list is a *kind of code* — OS-integration and frame/geometry mechanics that provident-authored graph data
cannot express — not a *directory*. Everything that is not that kind must be authored as provident-ssr data
(envelope nodes / handler bodies / hooks / component bindings) and driven through the producing graph, because a
UI element outside the graph is invisible to `provident.dispatch` / `get_rendered_html` / `get_markdown` and
defeats the foundation's whole purpose.

That boundary is exactly what these requests are about. Each SC-n asks for the **mechanism layer beneath
provident-authored control nodes**: the region/mount contract, the pointer-gesture delegate, the overlay frame,
the token layer, the track contract, the focus seam, the menu catalog. In `docs/specs/ui-overhaul.md` §2.1 the
same surface is classified Table A (provident means — required), Table B (hybrid: provident model + external
mechanic), and Table C (external HTML/chrome — allowed shell carve-out); **every SC-n request is a Table B/C
mechanic whose MODEL must stay provident/serialized**. The hybrid rule is the invariant these requests encode:
*"the **model is always Provident/serialized; only the mechanic is external** — external code commits one
managed write (hook / state-slice / structural op) at gesture end, never a per-frame stream"
(`docs/specs/ui-overhaul.md:151-153`, and the same rule at §2.1 Table B).

Consequences this document accepts:

1. **No request asks for a provident control node.** A collapse toggle, a tab, a modal open/close control, a
   theme toggle, a menu *item's* handler — all remain provident-authored in the fork (Table A rows,
   `ui-overhaul.md:111-118`). SC-1..SC-7 ask only for the frames, delegates, and contracts those nodes live in.
2. **Every request names the app-specific part it deliberately does NOT ask for** (see each request's
   "Requested contract" clause 5, plus the §"DO NOT FILE" list). The foundation must not learn Astrographer's
   panes, zones, import semantics, RAG vocabulary, or editor.
3. **The test surface is the dom-shim, not a browser.** The fork's node suite is deliberately layout-less and
   CSS-less (`AGENTS.md:207-212`, RCA-12: "a node-suite green is ENVELOPE-green, not APP-green"). Every
   acceptance criterion below is written so its mechanism half is assertable **without layout** — counts on
   elements, writes on a controller, call counts, attribute presence — and only the cosmetic half needs a
   rendered app.

---

## §0 The fork-divergence delta (in one paragraph — full detail in `docs/FORK-DIVERGENCE.md`)

The foundation ships a working MCP/Electron endpoint (`../Provident-Electron/src/main/main.ts:121-155`: one
`BrowserWindow` loading one `index.html`, the preload bridge, the MCP server) plus a renderer Runtime owning a
provident graph, and a **single flat `index.html`** whose entire shell chrome is
`<header>` + `<main class="layout">` + `#app` + `#panes`
(`../Provident-Electron/src/renderer/index.html:33-43`) with a two-column grid and an OS-only
`color-scheme: light dark` (`:8-12`). It has **no** top bar, no zones, no gutters, no modal, no tabs, no theme
tokens, no application menu, no gesture controllers, no focus model, and no shell regions. Astrographer's fork
carries all of those (SC-1..SC-7 each cite the file that implements one), which means **100% of the shell-chrome
layer an app needs is fork-local code with no upstream counterpart** — the exact condition under which a
foundation stops being a foundation. The delta table, the bounded-delta rule, and the reproducible method for
re-deriving it are in `docs/FORK-DIVERGENCE.md`.

---

## SC-1 — `SHELL-CHROME-REGION-CONTRACT` — shell regions are declared, and the graph mount is safe (P1)

**Target project:** Provident-Electron · **Filing verdict: FILE**

**Problem.** The foundation has no standard way to (a) declare shell-chrome regions (a top bar, resize gutters,
an overlay host) or (b) guarantee **mount safety** — that re-assembling the graph leaves exactly ONE in-flow
graph mount and no orphaned mount element. Every fork hand-authors its region markup directly in `index.html`
and then discovers the mount-leak failure mode empirically, in production, as a layout bug.

**Today's fork implementation (what it hand-rolls).**
- Regions are hand-authored HTML inside one static page: `src/renderer/index.html:278-301` declares
  `<div id="tab-strip">` (the top bar), four `<div class="gutter" data-zone=… data-axis=…>` resize strips
  (`:287-290`), and `<div id="settings-modal">` with `#settings-modal-scrim` + `#settings-modal-body`
  (`:297-300`), plus a `<button id="settings-toggle">` (`:301`). There is no declaration of what a region *is*,
  no region registry, and no invariant connecting them to the mount.
- The graph mount is `<div id="app">` (`:280`), and the graph's own root element materializes **inside** it as
  `#wiki-root` (the fork lays that out as the real shell grid: `:104-131`; the host also projects zone tracks
  onto it at `src/renderer/sidebar-panes.ts:1178-1200`).
- Mount safety is retrofitted inside the Runtime: `src/renderer/runtime.ts:1047-1068` (`tearDownGraph`) runs a
  `mount.querySelectorAll('#wiki-root')` sweep and **removes every element carrying a graph root id** before
  the next `render()`, because the previous graph's root element outlives its node when `loadEnvelope` replaces
  the Supervisor. The comment states the failure verbatim: the stale mount "stays in the mount as an in-flow
  grid box (a childless `#wiki-root` with a real height, pushing the live canvas — and the whole app — half-way
  down the page every time the app graph is re-assembled)" (`:1051-1053`).
- The fallout is recorded as a host defect, **live-confirmed and then fixed in the fork**: defect
  `STALE-MOUNT-PUSHES-CANVAS` (`docs/defects.md:27`) — "two `#wiki-root` mounts — a STALE childless one
  (`y=-11041, h=11589, children=0, display=grid`) and the live one (`y=548, h=11589, children=6`); `#app` box
  `y=-11058, h=11622` at `scrollY=11094`; page `scrollHeight=23230` (≈2× the app's own height)". Two mount
  elements, one of them orphaned, is the *general* failure of a foundation that does not own its mount.

**Requested contract.** A declared region surface + an enforced mount invariant.

```ts
export type ShellRegionName = 'topBar' | 'gutters' | 'modalHost'

export interface ShellRegionSpec {
  readonly name: ShellRegionName
  /** The element the region mounts INTO (created if absent, else adopted). */
  readonly host: unknown
  /** Ordering relative to the graph mount (topBar/header precede it; modalHost/gutters do not consume flow). */
  readonly flow: 'before-mount' | 'after-mount' | 'out-of-flow'
  readonly className: string
  readonly attributes?: Readonly<Record<string, string>>
}

export interface CreateShellRegionsOptions {
  readonly root: unknown                    // document
  readonly mount: unknown                   // the ONE graph mount element
  readonly regions: readonly ShellRegionSpec[]
}

export interface ShellRegions {
  /** The one in-flow graph mount. Re-mounting a graph uses THIS element — never a fresh sibling. */
  readonly mountRoot: unknown
  /** True for any element inside a declared chrome region (and for the region elements themselves). */
  isChrome(el: unknown): boolean
  /** Every element currently in flow that carries the graph root identity (mountRoot included). */
  graphMountElements(): unknown[]
  /** Detach/remove a region and its chrome without touching the mount or the graph. */
  disposeRegion(name: ShellRegionName): void
}
```

Invariants (the contract, not advice):

1. **Exactly ONE in-flow graph mount.** At every point in the lifecycle — before first render, between
   envelopes, after a teardown, after a region is added or disposed — `graphMountElements()` returns exactly
   one element, and it is `mountRoot`. A mount identity is the graph root element produced by the render plus
   `mountRoot`; the foundation pins the exact marker (the fork's is a root `css.id`, today `#wiki-root`).
2. **A chrome region never hosts graph content.** `isChrome(el) === true` implies `el` is not a graph mount and
   carries no graph root identity. Chrome is allowed to *place and format* graph content (Table B: "Content
   mount — the provident roots … | `DomAdapter` mount ownership into shell containers",
   `ui-overhaul.md:131`), never to be inside one.
3. **Region lifecycle never re-mounts the graph.** Adding, disposing, or re-declaring a region performs zero
   graph passes and zero renders.
4. **Mount safety is owned here, not by the consumer.** A region/graph teardown that would leave an orphaned
   mount is the foundation's failure to prevent; a fork must not need a Runtime-level `querySelectorAll` sweep
   to compensate (which is what `runtime.ts:1057-1065` is).
5. **NOT requested:** any specific region set, any Astrographer zone name (`left`/`right`/`header`/`footer`/
   `stage`/`top-bar`), pane framing, or the tabs/gutters themselves. The contract is *declaration + invariant*;
   the fork's regions are content the fork supplies. The zone container/placement layer stays provident
   (Reading 2, `ui-overhaul.md:1273-1290`) — this request is Table C geometry/region hosting only.

**Acceptance criteria (testable).**

1. Adding a chrome region and removing it again leaves `graphMountElements()` at cardinality 1 across every
   step (assert on element counts under the dom-shim; no layout needed).
2. A re-assembled graph (envelope A → envelope B) leaves exactly one in-flow mount and **zero** orphaned mount
   elements — the `STALE-MOUNT-PUSHES-CANVAS` reproduction, asserted structurally (count), not by geometry.
3. `provident.get_rendered_html` output is **byte-identical** with and without a declared chrome region added
   to the page (chrome is not graph content).
4. `isChrome(el)` is false for every element the render produced, and true for every declared region element.
5. Disposing a region performs no render and no graph op (assert render/op call-count zero).

**MCP-visibility consequence.** Chrome regions must stay outside the graph, so the shell's own furniture never
enters `provident.get_rendered_html` / `get_markdown` / `list_targets`. The *positive* corollary is the one that
matters for an MCP host: because the mount is single and stable, a node addressed by `provident.dispatch` keeps
its element identity across a re-assembly — the orphaned-mount failure mode was simultaneously an invisibility
bug (the live mount's rendered HTML could be shadowed by a stale sibling carrying the same root id) and a
dispatch-addressability risk.

**Priority.** P1 — blocks the fork's planned shell-chrome unit set (the region contract is the substrate every
other SC-n request sits on) and blocks a foundation-level guarantee a consumer cannot retrofit correctly.

**Fallback if upstream declines.** The fork keeps the hand-authored regions + the Runtime mount sweep, and
promotes both to a pinned host contract (a `shell-regions` module + the RCA-12 layer-labelled live battery
asserting the single-in-flow-mount census post-panes). Cost: every future fork re-derives the same leak, and the
foundation keeps shipping a mount it cannot guarantee.

---

## SC-2 — `GESTURE-CONTROLLER` — one managed write per gesture, and content clicks are never swallowed (P1)

**Target project:** Provident-Electron · **Filing verdict: FILE**

**Problem.** Continuous pointer gestures are not a foundation primitive. Every fork hand-rolls pointer capture,
a drag threshold, `lostpointercapture` reversion, `pointercancel`, and double-click reset — and a hand-rolled
version silently **swallows the click** of whatever provident node sits under the pointer, because an early
`setPointerCapture` on an ancestor retargets the gesture's own `click` away from the element that owns the
handler. That failure is invisible to a node suite and to `provident.dispatch` (a synthetic dispatch on the node
still works), so it survives every automated gate and only a real mouse reveals it.

**Today's fork implementation (what it hand-rolls).** THREE ad-hoc controllers, each repeating the same
machinery:
- `src/renderer/renderer.ts:752-796` (`installShellPointers`) — the DOM wiring half: ONE document-delegated
  `pointerdown` resolving the gesture element per event via `e.target.closest(GESTURE_SELECTOR)` (`:765-771`
  with `:634`), a PERMANENT document-delegated `dblclick` for the reset (`:775-781`), and a document-delegated
  `lostpointercapture` so a pointer released without `pointerup`/`pointercancel` reverts and clears the gesture
  (`:785-791`); per-document idempotence at `:759-760/792`. The gesture surface is pinned at `:326`
  (`GESTURE_SELECTOR = '.gutter[data-zone], .pane-collapse-toggle'`) with the lazy-capture threshold at `:304`
  (`PANE_DRAG_CAPTURE_THRESHOLD = 4`) applied in `onGestureMove` (`:463`).
- `src/renderer/pane-drag.ts:253` (`createDragController`) — the pane relocation gesture model: threshold-gated
  reveal-set recomputation emitting ONE `onRevealChange` write per threshold-crossing, never per frame
  (`:246-252`, `:285-293`).
- `src/renderer/pane-gutter.ts:151` (`createGutterController`) — the resize gesture model: "`end` performs the
  ONE `onCommit` write for the gesture (never per-move — W2-Q7/§2.1). `cancel` reverts with no write (F2: at
  most one commit). `reset` (double-click, §2.5 pin 5) commits the registry default once" (`:145-150`).

The swallowed-click failure is recorded as defect **`F-1 PANE-BODY-GESTURE-SWALLOWED`**
(`docs/defects.md:56`): a REAL click on any clickable provident row inside an app-graph pane body was inert
("click-probe `[pointerdown:<li>|in#pane-doc-nav, mouseup:pane-doc-nav, click:pane-doc-nav]`"), while a native
`.click()` on the same row worked — the handler and the dispatch seam were intact; the *real gesture* was what
died. Root cause as recorded: the gesture started from a `pointerdown` anywhere inside the frame and called
`setPointerCapture` on the frame, and "capture on the frame retargets the gesture's `click` to the frame"; the
second layer found during the fix was that capturing at pointerdown also retargeted the pane **header's** own
click, making the collapse toggle inert too. Fixed in the fork 2026-09-15 by pinning the gesture surface to the
header and deferring capture past a 4px threshold — a *local* fix to a *general* mechanism.

**Requested contract.** One reusable delegate that owns the whole gesture lifecycle.

```ts
export interface GestureDelegateOptions {
  /** Elements that may START a managed gesture (resolved per event via closest()). */
  readonly selectors: readonly string[]
  /** Which axis the gesture measures; 'both' for a free 2-D gesture. */
  readonly axis: 'x' | 'y' | 'both'
  /** Travel (px) before the gesture is considered REAL — capture is claimed only here. */
  readonly threshold: number
  /** The ONE managed write at gesture end. Never called per frame. */
  readonly onCommit: (g: GestureCommit) => void
  /** The reversion write on cancel/interrupt; receives the pre-gesture snapshot. */
  readonly onCancel?: (snapshot: GestureSnapshot) => void
  /** The optional double-click reset (one extra managed write). */
  readonly onReset?: (target: unknown) => void
}

export interface GestureCommit {
  readonly target: unknown          // the gesture element (closest() match)
  readonly source: unknown          // the original pointerdown target (the node that owns the click)
  readonly dx: number
  readonly dy: number
  readonly pointerId: number
}

export interface GestureDelegate {
  /** Attach the delegated listeners ONCE (idempotent per document). */
  install(doc: unknown): void
  /** True while a real (threshold-crossed) gesture is live. */
  isActive(): boolean
  /** Programmatic cancel — reverts with at most one write. */
  cancel(): void
  dispose(): void
}
```

Invariants (the contract, not advice):

1. **One managed write per gesture.** A gesture that crosses the threshold and ends calls `onCommit` exactly
   once, regardless of how many `pointermove` events arrived. A gesture that never crosses the threshold calls
   it zero times. **Never a per-frame write.**
2. **Lazy capture.** `setPointerCapture` is claimed only once travel ≥ `threshold`. A pure click never captures.
3. **The click is never retargeted.** A `pointerdown` on *content* (i.e. not on a `selectors` match) starts no
   gesture, requests no capture, and leaves the subsequent `click` targeted at the element the user pressed —
   the F-1 regression, asserted as "the click event's `target` is the pressed node".
4. **Revert on interruption.** `pointercancel` and `lostpointercapture` both revert to the pre-gesture snapshot
   with at most one `onCancel` write and leave no listeners and no captured pointer behind; a `dblclick` on a
   matched target performs exactly one `onReset` write.
5. **It CONSUMES the pinned gesture surface rather than moving it.** The fork's decision
   `PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE` (`docs/decisions.md:19`) pins the surface to
   `GESTURE_SELECTOR = '.gutter[data-zone], .pane-collapse-toggle'` and requires capture to be claimed only
   after a real drag threshold (4px). The delegate's `selectors`/`threshold` are exactly those values — the
   request **does not** propose a different surface, and the invariant "a pane body `pointerdown` never starts a
   drag and never captures" is clause 3 restated.
6. **NOT requested:** which gestures exist, what they resize/relocate, the pane layout model, or the drag image
   / `dataTransfer` content (that is host/app data — see SC-7's exclusion discipline and the DO-NOT-FILE list).
   The delegate is axis + threshold + commit plumbing; the fork supplies the meaning of a commit.

**Acceptance criteria (testable).**

1. A scripted pointer sequence (down → 20 × move → up) crossing the threshold produces **exactly one**
   `onCommit` call (call-count assertion; no layout).
2. A sequence that never crosses the threshold produces zero `onCommit` calls and zero `setPointerCapture`
   calls.
3. **F-1 regression:** `pointerdown` on a content element outside `selectors`, followed by up, delivers a
   `click` whose `target` is the pressed element — and starts no gesture.
4. `cancel()` mid-gesture reverts to the pre-gesture snapshot and calls `onCancel` at most once; a subsequent
   gesture starts from the reverted state (assert the snapshot equality).
5. `lostpointercapture` without `pointerup`/`pointercancel` clears the gesture (no stale state, no retained
   listeners — assert listener count returns to the installed baseline).
6. `dblclick` on a matched target performs exactly one `onReset` and never also fires `onCommit`.

**MCP-visibility consequence.** A swallowed click is an *MCP/UI equivalence* break, not a cosmetic bug: the
affected element is a provident node whose handler exists and is dispatchable, so `provident.dispatch` succeeds
while the human's click does nothing. That asymmetry is the one the foundation exists to prevent
(`MCP-UI-EQUIVALENCE`, `ui-overhaul.md:607-629`: the UI path and the MCP path must reach the same application
code). A foundation-level gesture delegate makes the asymmetric failure unreachable by construction, rather than
re-found by every fork via a live user-flow audit.

**Priority.** P1 — blocks the fork's planned shell gesture units (pane drag/relocate, gutter resize) and a
shipped correctness property (live-confirmed defect F-1).

**Fallback if upstream declines.** The fork keeps three ad-hoc controllers and promotes F-1 to a permanent
regression pin (already true: `tests/renderer-pane-drag-surface.test.ts` + the re-pinned shell-wiring suites).
Cost: the next fork re-introduces the same capture-at-pointerdown bug and needs its own live audit to find it.

---

## SC-3 — `OVERLAY-FRAME-PRIMITIVE` — a shell overlay with a documented MCP-invisibility contract (P1)

**Target project:** Provident-Electron · **Filing verdict: FILE**

**Problem.** The foundation ships no overlay (modal/popover/sheet) primitive. A fork that needs one hand-authors
a frame + scrim + a class-toggle state machine, and then has to *infer* the four behaviours that make an overlay
correct — focus containment, background `inert`, Escape-to-close, and a real "closed" state that removes the
overlay from flow — because the foundation's own docs treat them as environment properties. `ui-overhaul.md`
§2.1 records exactly this: the "**Limits**" bullet lists "focus trap/inert, native `<dialog>`, `:root`
custom-property application" among the things that "are not graph state" (`:92-97`), and Table C repeats "Native
gesture primitives (pointer capture, `dataTransfer`/drag image, focus trap, top-layer, Pointer Lock) | browser
API, not graph state" (`:144`). A host-side *inference* is not a contract.

**Today's fork implementation (what it hand-rolls).**
- `src/renderer/modal-state.ts:42` (`createModalController`) — a pure open/close/toggle state machine (idempotent
  `open`/`close`, `toggle` always flips, `isOpen()` as the single source of truth, fail-soft callbacks).
- `src/renderer/modal-state.ts:116` (`installSettingsModal`) — the shell wiring: resolves
  `#settings-modal` / `#settings-toggle` / `#settings-modal-scrim` / `#settings-modal-body`, wires exactly one
  toggle click, one document `keydown` routing `Escape` → close, and one DIRECT scrim click → close (a content
  click never closes), re-parents the two EXISTING operator mounts into the modal body, and mirrors
  `isOpen()` onto the frame's class tokens as `is-open` XOR `is-closed` (`:140-186`).
- `src/renderer/index.html:297-301` — the frame/scrim/body/toggle markup, hand-authored.
- `src/renderer/index.html:228-268` — the frame CSS, including `position: fixed; inset: 0; z-index: 100`,
  `.settings-modal.is-closed { display: none }`, a scrim that must RESET `pointer-events` to `auto` because the
  frame sets `pointer-events: none` (the comment records that the scrim-click-to-close was dead until that reset
  — an a11y/mechanic detail every fork must rediscover).
- Absent entirely: **no focus trap**, **no background `inert`**, **no native `<dialog>`/top-layer use**, no focus
  restoration to the opener. The modal is a fixed-position div with a z-index.
- Two pinned decisions constrain any replacement: `MODAL-SETTINGS-REPARENT`
  (`docs/decisions.md:228` — the modal hosts the existing operator mounts by RE-PARENTING them; neither graph is
  rebuilt; the modal "remains an isolation-system mount … no app-graph pane ever enters it") and
  `MODAL-DEDICATED-SCRIM` (`docs/decisions.md:229` — "a dedicated scrim child … NOT the frame doubling as the
  scrim; scrim-click closes, content-click never").

**The `inert` fact, verified (not asserted).** Per the task's SC-3 question, checked in this repo's installed
copy:
- The package's closed boolean-attribute set **does contain `inert`**: `BOOLEAN_ATTRS` at
  `node_modules/provident-ssr/dist/core/adapters.js:25-53` includes `'inert'` at **`:37`** (27 members total:
  `allowfullscreen, async, autofocus, autoplay, checked, controls, default, defer, disabled, formnovalidate,
  hidden, inert, ismap, itemscope, loop, multiple, muted, nomodule, novalidate, open, playsinline, readonly,
  required, reversed, selected, truespeed, typemustmatch`).
- It is handled on the dedicated boolean path, not generic `setAttribute`: `adapters.js:300-313` (DOM — the
  boolean branch opens at `:300` and reflects the DOM property at `:311-313`; the `else` at `:314-320` is the
  generic path) and `:520-528` (the SSR fragment) — "presence/absence, never `attr="false"`"; ON keeps the
  authored string form, OFF removes the attribute, and a boolean DOM property is reflected.
- Installed version: `provident-ssr@0.5.0` (`node_modules/provident-ssr/package.json:3`); the fork pins
  `^0.5.0` (`package.json:25`). The host's own handoff already records the resolution — "HOST/U1-ENG resolved
  via upstream `BOOLEAN-ATTRS` in `provident-ssr@0.5.0`" (`docs/HANDOFF.md:34-35`) — and
  `provident-ssr` 0.5.0 is the version the upstream `BOOLEAN-ATTRS` work shipped in.
- **Not verified:** the upstream docs. `BOOLEAN_ATTRS` is **not documented** in
  `../Provident-Electron/docs/decisions.md` (no `BOOLEAN`/`inert` row; the only `inert` match there is the
  unrelated `inert on<event>="true"` Phase-B import at `:26`) nor in its `docs/pending.md`. The only
  authoritative statement of the set's membership is the package source cited above.
- **Therefore:** `inert` is **expressible as a provident prop today** (`props: { inert: 'true' }` on a node);
  what the foundation does **not** ship is the **overlay primitive and its lifecycle** that should own when that
  prop is set and cleared. SC-3 asks for the primitive, and explicitly does **not** claim `inert` is
  unavailable — a claim that would have been wrong and would have mis-filed the request.

**Requested contract.** One overlay frame primitive with an explicit visibility contract.

```ts
export interface OverlayOptions {
  /** The frame element (hosted in a shell region — see SC-1's modalHost). */
  readonly frame: unknown
  /** The dedicated scrim child (a click here closes; a click on the frame's content never does). */
  readonly scrim: unknown
  /** Called when the user closes the overlay (Escape, scrim, or an explicit close). */
  readonly onEscape?: (reason: 'escape' | 'scrim' | 'api') => void
  /** Elements to mark inert / trap focus out of while open. Default: every sibling of the frame's region. */
  readonly background?: () => readonly unknown[] | undefined
  /** Restore focus to the opener on close (default true). */
  readonly restoreFocus?: boolean
}

export interface Overlay {
  open(): void
  close(reason?: 'api'): void
  isOpen(): boolean
  /** The class tokens the frame currently carries — `is-open` XOR `is-closed` (never both, never neither). */
  state(): 'open' | 'closed'
  dispose(): void
}
```

Invariants (the contract, not advice):

1. **Closed means out of flow.** While closed the frame is `display:none` (or an equivalent removal from layout —
   never merely transparent/zero-opacity/hidden-by-z-index). While open it sits above the page in a single
   top-layer-capable position.
2. **Focus containment while open.** Tab/Shift+Tab cycle within the frame; focus is placed inside the frame on
   open and restored to the opener on close. **Mechanism-agnostic:** the primitive may use the native
   `<dialog>`/top-layer machinery or an explicit trap — the contract is the behaviour, so a fork can adopt the
   better mechanism later without a contract change.
3. **Background `inert` while open.** Every element in `background()` (default: the frame region's siblings) is
   not focusable and not hit-testable while the overlay is open, and is restored on close. Because `inert` is a
   supported boolean prop (fact above), the mechanism is expressible either as a provident prop write on
   graph-owned nodes or as a host attribute set on chrome — the primitive must state which, for each side.
4. **Dedicated scrim.** A click on the scrim closes; a click anywhere inside the frame's content never closes
   (the pinned `MODAL-DEDICATED-SCRIM` rule); the scrim must itself be hit-testable even when the frame is
   pointer-transparent (the fork's dead-scrim finding).
5. **MCP-invisibility contract, documented.** `ui-overhaul.md` §2.1 Table B pairs the overlay node (provident:
   "the overlay node + state-driven `css.classes`") with "the focus trap / `inert` / top-layer / Escape" as the
   external half (`:130`), and C3 pins that the settings modal is "an **isolation-system mount** — content is
   authored in an isolated `createIsolatedScope()` graph, so the MCP endpoints that read the app Runtime can
   never see or dispatch it" (`:29`). The requested primitive must therefore document, for overlay content:
   **the overlay frame/scrim/chrome is invisible to `provident.get_rendered_html` / `get_markdown` /
   `list_targets`; overlay content authored in a SEPARATE graph scope stays in that scope** (its nodes are not
   reachable from the app Runtime); and an overlay whose content is authored in the APP graph does **not** become
   MCP-invisible merely by being in an overlay — the scope, not the overlay, decides visibility.
6. **NOT requested:** the Astrographer settings modal, the operator panes, the re-parent decision, or any pane
   content. The `MODAL-SETTINGS-REPARENT` / `MODAL-DEDICATED-SCRIM` decisions stay fork-side host behaviour; the
   primitive only has to be *compatible* with re-parenting existing mounts into its body (nothing in the
   contract may re-create or re-render those mounts).

**Acceptance criteria (testable).**

1. Closed → `display:none` (asserted on the frame's computed/inline style under the dom-shim); open → the frame
   is present and its state class is exactly one of `is-open`/`is-closed`.
2. `Escape` while open calls the close path exactly once; `Escape` while closed is a no-op (no write, no throw) —
   the fork's `modal-state.ts:149-157` semantics generalized.
3. A scrim click closes; a click dispatched on a frame content element does **not** close (assert `isOpen()`).
4. While open, every element returned by `background()` carries the inert attribute; on close, none do
   (attribute-presence assertion; no layout needed).
5. Tab traversal from the last focusable child inside the frame wraps to the first (or hands focus to the
   browser's native trap); focus returns to the opener after close (assert `document.activeElement` identity
   under the shim).
6. Opening an overlay performs **zero** graph passes and zero renders of graph content (call-count assertion) —
   the frame is chrome, not content.

**MCP-visibility consequence.** This is the request with the sharpest MCP consequence, and it is why the
invisibility contract is part of the requested contract rather than a footnote: the foundation's purpose is
agentic visibility, so *which* overlays are visible must be a documented property of the primitive (scope-driven)
rather than an emergent property of who happened to write the markup. A host can then state honestly whether a
given overlay's content appears in `get_rendered_html` — today the fork derives that from
`OPERATOR-ISOLATED-GRAPHSCOPE` + the C3 isolation mount, i.e. from a host-side inference about an engine feature.

**Priority.** P1 — blocks the fork's planned overlay/modal unit hardening (a11y: focus trap + `inert` are the two
recorded gaps) and every future fork that needs a dialog.

**Fallback if upstream declines.** The fork implements trap + `inert` + top-layer in `modal-state.ts` and
documents the invisibility contract host-side, keeping the `MODAL-*` decisions authoritative. Cost: the a11y
contract remains a per-fork invention, and the `inert`-is-expressible fact stays undocumented upstream.

---

## SC-4 — `THEME-TOKEN-LAYER` — a root token layer + appearance controller, tri-state, restart-stable (P1)

**Target project:** Provident-Electron · **Filing verdict: FILE**

**Problem.** The foundation has no root token layer and no appearance controller. Its appearance story is one
line of CSS that follows the OS and nothing else — so a fork cannot honour the two requirements every themed
Electron app has: (a) a manual light/dark/system choice that **wins over the OS across a restart**, and (b) a
theme flip that reaches **both** the graph content and the shell chrome. The foundation's own chrome (body
background, card borders, input colours) is hard-coded, so a themed app must retheme the shell itself.

**Today's fork implementation (what it hand-rolls).**
- `src/renderer/index.html:15-73` — the shell appearance token layer: `:root, html[data-theme='light']`
  declares 15 custom properties plus `color-scheme: light`; `html[data-theme='dark']` overrides all 15 plus
  `color-scheme: dark`; and because a renderer boot may not have applied an explicit attribute yet, an
  `@media (prefers-color-scheme: dark) { :root { … } }` block re-declares the dark set. The comment records the
  cascade reasoning the fork had to work out: ":root has LOWER specificity than html[data-theme=…], so an
  explicit choice still wins" (`:52-53`).
- `src/renderer/theme.ts:30` (`applyThemeToRoot`) — the pure applier: resolves then writes
  `root.dataset.theme`, fail-soft on a frozen/absent `dataset`, returning the resolved theme.
  `src/renderer/theme.ts:12` (`resolveTheme`) — the tri-state resolver: an explicit `'light'`/`'dark'` wins,
  everything else (including `'system'`, undefined, corrupt) follows `prefersDark`; TOTAL, never throws.
- `src/renderer/renderer.ts:126-180` (`installTheme`) — the wiring: reads `matchMedia('(prefers-color-scheme:
  dark)')` once, subscribes `change` ONCE with a handler that is inert while the setting is explicit
  (`:150-160`), re-applies on live operator-settings changes (`:161-169`), and reads the persisted setting at
  boot (`:170-179`).
- The persisted carrier is the fork's serialized UI-config state: `theme` is a `system|light|dark` field on
  `OperatorSettings` (decision `UI-CONFIG-CARRIER`, `docs/decisions.md:217`) with fail-soft defaults/versioning.
- The corresponding upstream surface is nil: `../Provident-Electron/src/renderer/index.html:8-9` is
  `:root { color-scheme: light dark; }` plus a hard-coded light `body` background, and no theme module exists.

**Requested contract.** A token layer + one appearance controller.

```ts
export type ThemeSetting = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeTokens {
  /** Token name → light value. The dark map must declare the SAME token names. */
  readonly light: Readonly<Record<string, string>>
  readonly dark: Readonly<Record<string, string>>
}

export interface ThemeControllerOptions {
  readonly tokens: ThemeTokens
  /** Persist an explicit choice; 'system' must be persistable too (as an explicit absence of override). */
  readonly persist?: (setting: ThemeSetting) => void
  /** The OS preference source. Injected so the controller is pure/testable. */
  readonly matchMedia?: (query: string) => { matches: boolean; addEventListener?: Function; addListener?: Function }
  readonly root?: unknown              // defaults to document.documentElement
}

export interface ThemeController {
  /** Apply the resolved theme; returns what was resolved. TOTAL — never throws. */
  apply(setting: unknown): ResolvedTheme
  /** The current explicit setting (defaults to 'system'). */
  setting(): ThemeSetting
  /** Stop listening (idempotent). */
  dispose(): void
}
```

Invariants (the contract, not advice):

1. **Root application, not node application.** The tokens are applied at the window root (`:root` /
   `documentElement`) so they reach the graph content AND the shell chrome with one flip — the Table C reason the
   fork's own spec gives: theme token application "must reach the window root incl. operator scope + shell
   chrome" (`ui-overhaul.md:140`). A node-scoped `css.cssDef` cannot do this, which is why the mechanism is
   external.
2. **Tri-state with an explicit choice winning across a restart.** `system` resolves the OS preference LIVE (an
   OS flip re-applies); an explicit `light`/`dark` overrides the OS and survives a restart by being persisted
   and re-applied at boot before the first graph mount.
3. **A theme flip triggers NO graph pass.** No render, no reconcile, no op, no node-state write. The theme is
   chrome-level styling; the model (the setting) is serialized separately (the fork's `UI-CONFIG-CARRIER`), and
   graph-owned styling stays graph-owned — the tokens are *read* by provident CSS (`css.classes`/`cssDef` rules
   consuming `var(--…)`), never *written* by the controller.
4. **TOTAL/fail-soft.** A malformed setting, a frozen root, a missing `matchMedia`, or a throwing persistence
   callback never throws and never breaks boot (the fork's `theme.ts` discipline, generalized).
5. **NOT requested:** the token NAMES or values, the appearance settings pane, the settings form, or the carrier
   store's shape. The controller receives a token map; a consumer supplies it. Astrographer's 15 tokens, its
   operator pane, and its `OperatorSettings.theme` field stay fork-side.

**Acceptance criteria (testable).**

1. `apply('dark')` with `matchMedia().matches === false` writes `data-theme="dark"` on the root; `apply('light')`
   with `matches === true` writes `data-theme="light"` (explicit beats OS, both directions).
2. **Restart:** with a persisted explicit `'dark'`, a controller constructed fresh and applied at boot produces
   `data-theme="dark"` even when `matchMedia().matches === false` (the restart-stability assertion).
3. Under `system`, an OS-preference change re-applies and the root's `data-theme` follows it; under an explicit
   choice, the SAME OS change performs **zero** root writes (call-count assertion).
4. **No graph pass:** a theme flip performs zero renders / zero reconciled nodes (call-count assertion on the
   render + op seams).
5. Malformed input (`undefined`, `null`, `42`, `'DARK'`, a throwing persist, a frozen root) never throws and
   leaves a resolvable theme applied (the fork's F2 pin, generalized).
6. Both halves theme together: a shell chrome element and a graph-authored element that each consume the same
   token show the same resolved value after one flip (asserted via the token values on the root + the elements'
   declared `var()` usage; the rendered-app half is a live-battery check).

**MCP-visibility consequence.** The token layer is deliberately MCP-invisible chrome: a theme flip changes no
graph node, so it produces no `get_node_state` delta and no `resource-updated` notification — correct, because
appearance is not data. The *serialized setting* is a separate concern that the fork keeps in its operator-scoped
UI-config carrier ("UI-config is a manual-UI surface", `docs/specs/ui-overhaul.md:536-539`), i.e. also invisible. A
foundation-level controller must document this split explicitly, or a fork will drift into making the theme a
graph node "so the agent can change it", which would put appearance into `get_rendered_html` and break the
carve-out's point.

**Priority.** P1 — blocks the fork's planned appearance/theme unit hardening and the two recorded requirements
(manual tri-state; a flip that reaches both halves).

**Fallback if upstream declines.** The fork keeps `theme.ts` + the `index.html` token block as a pinned host
contract, documented in `docs/FORK-DIVERGENCE.md` as fork-local. Cost: every fork re-derives the
specificity/media-query cascade and re-invents persistence + restart semantics.

---

## SC-5 — `ZONE-TRACK-CONTRACT` — tracks, containment, slot authority, empty-track collapse (P1)

**Target project:** Provident-Electron · **Filing verdict: FILE**

**Problem.** The foundation ships no layout contract for a shell that hosts multiple region tracks. Its shell is a
two-column grid (`grid-template-columns: 1fr 1fr`) and its graph mount is one card in that grid, so there is no
statement of: which element owns the tracks; whether geometry may be written from JS at all; what makes an empty
track collapse; who owns a slot's order; and whether heavy content may be windowed out of the graph. Every fork
answers these by accident, and the fork's answers were themselves defects.

**Today's fork implementation (what it hand-rolls).**
- `src/renderer/index.html:104-131` — the mount root declares the tracks:
  `#app > #wiki-root { display: grid; … --zone-left-track: var(--zone-left-size, 220px); … grid-template-columns:
  var(--zone-left-track) minmax(0, var(--stage-weight, 1fr)) var(--zone-right-track); grid-template-rows: … }`
  with named areas `header/left/main/right/footer` and per-zone `grid-area` rules.
- `src/renderer/index.html:147-150` — the empty-track collapse is **pure CSS**:
  `#app > #wiki-root:has([data-zone='left'].is-empty:not(.is-revealed)) { --zone-left-track: 0px; }` (one rule
  per zone), with the comment recording the cascade lesson — the declaration must live on the SAME element the
  rule targets or the override loses (`:107-115`).
- `src/renderer/layout-state.ts:214-224` (`layoutCssVars`) — the JS projection: five zone/top-bar sizes in `px`
  plus `--stage-weight: <size>fr` from the serialized `LayoutState`.
- `src/renderer/layout-state.ts:275-288` (`zoneTrackCssVars`) — the JS-computed per-zone **track** (`0px` for a
  zero-enabled-pane zone that is not being drag-revealed, else the persisted size), computed from the pane
  registry census (`isZoneEmpty`, `:233-265`).
- `src/renderer/sidebar-panes.ts:1178-1200` (`applyZoneTracks`) — the LIVE write path: queries
  `#app > #wiki-root` and sets `--zone-<zone>-track: 0px` (or removes it) — the synchronous half of the census,
  because the graph's `is-empty` mirror reconciles asynchronously (`:1168-1174`).
- The fallout is defects **`CANVAS-DIMENSIONS-JS-DRIVEN`** (`docs/defects.md:23` — live:
  `document.documentElement.getAttribute('style')` carried `--zone-left-size: 220px; … --stage-weight: 640fr; …`
  and the stage track was a JS-derived `fr` number) and **`EMPTY-ZONE-TRACK-NOT-COLLAPSED`** (referenced at
  `index.html:107`; "every collapsed-track variable was declared but never read, so an empty zone kept its track
  and the stage never reclaimed the space").
- **Citation correction (reported as required).** The ruling that named this request's evidence said
  "`layout-state.ts:214-308` (JS-written custom properties)". Re-read 2026-09-17: the module's range is
  **`:1-314`**, and the JS-written projection is `layoutCssVars` at **`:214-224`** plus `applyLayoutToRoot` at
  **`:300-314`**; `zoneTrackCssVars` (`:275-288`) computes but does NOT write (the write is
  `sidebar-panes.ts:1178-1200`). The earlier range is therefore off by the tail and conflates compute with
  write — the corrected ranges are the ones cited above.
- The governing fork decisions: `LAYOUT-IN-CSS` (`docs/decisions.md:23`) — "canvas/frame dimensions are BASIC
  CSS; JS must not adjust geometry on a WINDOW RESIZE … JS may only persist OPERATOR-CHOSEN sizes (a gutter
  drag/double-click reset) as custom properties … the stage track must become a plain CSS `minmax(0, 1fr)` …
  and no resize listener may exist" — and Reading 2 (`ui-overhaul.md:1273-1290`), which splits the layers: zone
  container nodes / pane roots / content roots are **provident graph (MCP-visible)**; the layout **state**
  (collapsed/minimized/visible/order/sizes) is the serialized `LayoutState` mirrored into the graph for
  state-derived rendering; **CSS grid geometry, gutters, drag/pointer mechanics, focus/inert, root theme tokens**
  are shell chrome. The scheduled fork unit for the remaining piece is **O-10** (the slot-order authority).

**Requested contract.** A documented layout contract — no new engine surface, a pinned division of ownership.

```ts
/** The contract a shell layout must satisfy. Types are illustrative; the invariants are binding. */
export interface ZoneTrackContract {
  /** The single element that DECLARES the tracks (grid-template-*), i.e. the mount root or its ancestor. */
  readonly trackOwner: unknown
  /** A track's width/height in CSS: the operator's persisted size, or 0px when the track is empty. */
  trackCss(zone: string): string
  /** True when a zone holds zero enabled+placed panes (DERIVED — never a stored flag). */
  isEmpty(zone: string): boolean
  /** Slot order within a zone — authoritative from the serialized model, never from DOM order. */
  orderOf(zone: string): readonly string[]
}
```

Binding invariants:

1. **The mount root declares the tracks.** Grid geometry lives in CSS on the element that owns the grid (or its
   shell ancestor); it is never derived from a JS-computed weight. The stage is `minmax(0, 1fr)`.
2. **No resize listener exists.** A window resize performs zero JS. JS may write ONLY operator-chosen sizes (a
   gutter drag commit, a double-click reset) as custom properties — never per-frame, never on resize.
3. **Container containment.** Pane/zone frames carry `contain: layout style paint` (equivalently: an equivalent
   containment statement) so a gesture inside a pane cannot invalidate the whole page's layout/style tree. A
   pane resize must not force a page-wide recalculation.
4. **An empty track collapses to `0px` in CSS.** Emptiness is DERIVED from the enabled+placed pane census (never
   a stored `hidden` flag, so it cannot go stale); the collapse is expressible as a stylesheet rule on the track
   owner, with any JS write being the synchronous mirror of an async state mirror — and the contract states which
   is authoritative (the fork's: the census).
5. **Slot order is authoritative from the serialized `panes[].order`.** The render/DOM order of pane slots in a
   zone is a projection of the serialized model; a reorder writes the model and the slots follow. DOM order is
   never the source of truth. (This is the fork's `LAYOUT-IN-CSS` + Reading 2 combination; the fork's remaining
   unit for it is O-10.)
6. **Rows stay GRAPH-RESIDENT — no graph-level windowing/virtualization.** Content rows are graph nodes with
   stable identity; a layout change, a collapse, a minimize, or a scroll must never unmount them to save work.
   Any virtualization is a CSS/scroll concern, never a graph one, because unmounting a row removes it from
   `provident.dispatch` / `get_rendered_html` / `list_targets` addressability.
7. **NOT requested:** the zone NAMES, the pane registry, the pane catalog, `enabledPanes`, which panes exist, the
   drag/relocate gesture (SC-2), the collapse/minimize controls (provident nodes, Table A), or minimum/maximum
   sizes. The contract is the ownership split and the four invariants above.

**Acceptance criteria (testable).**

1. A folder disclosure (a content change inside one pane) re-renders **no** pane slot: the pane roots' identities
   and the slot elements are unchanged (assert identity/count, not markup diffing).
2. A pane gesture causes **no** graph pass: zero renders, zero nodes reconciled (call-count assertion).
3. **No resize listener exists** — a static assertion over the shell modules (grep-level: no
   `resize`/`ResizeObserver` registration on the layout path) plus a runtime assertion that dispatching a
   window-resize event performs zero custom-property writes.
4. An empty zone's track resolves to `0px` and a non-empty zone's to its persisted size, asserted from the CSS
   declaration + the derived emptiness (the `:has(.is-empty)` rules and the census agree).
5. A reorder (serialized `order` change) changes the slot sequence and NO other model field; a DOM reorder that
   contradicts the serialized `order` is corrected on the next projection.
6. `contain: layout style paint` (or the equivalent) is present on pane/zone frames (declaration assertion).
7. A collapsed / minimized / hidden zone leaves every row node reachable: the node count and the
   `list_targets` census are unchanged across the collapse.

**MCP-visibility consequence.** Invariant 6 is the MCP-facing one, and it is the reason a layout contract belongs
in the foundation rather than in each app: a windowed/virtualized row is a node that `provident.dispatch` cannot
reach, so "the app got faster" and "the agent lost addressability" are the same edit. Invariants 1–4 are
deliberately invisible to MCP: layout geometry and containment change no node, produce no census delta, and emit
no notification — exactly the Table C boundary.

**Priority.** P1 — blocks the fork's planned layout unit (O-10 slot-order authority) and the two recorded layout
defects; the invariants are the difference between a shell that scales and one that re-lays-out the page per
gesture.

**Fallback if upstream declines.** The fork pins the contract in its own spec (the `LAYOUT-IN-CSS` decision plus
O-10) and keeps the CSS `:has()` collapse + `applyZoneTracks` mirror. Cost: the next fork re-derives containment,
JS-geometry, and empty-track collapse from defects.

---

## SC-6 — `FOCUS-TAB-SEAM` — one focus model behind both the shell strip and the MCP tool (P2)

**Target project:** Provident-Electron · **Filing verdict: FILE**

**Problem.** Tab/focus selection is app-level with no foundation seam. A fork that adds a browser-style tab strip
must also add its own find-or-open/activate/reorder/persist model, and if it also exposes a focus tool over MCP it
must then *prove by hand* that the strip and the tool reach the same state. The foundation's own parity rule says
this is required, not optional: "The requirement is that both surfaces **run in the same process and interface
with the same application code** — the MCP tool and the UI path must invoke the same underlying function / module
/ state store in the Electron **main** process. Sharing the application code **is** the parity"
(`ui-overhaul.md:607-614`). Without a foundation seam, that property is a per-fork coincidence.

**Today's fork implementation (what it hand-rolls).**
- `src/renderer/tab-state.ts:269` (`focusTarget`) — the find-or-open transition: activate an existing tab whose
  target equals the requested one, else append + activate a new entry (`newTab: true` forces a duplicate); PURE
  (state in, state out). Same module: `makeEntry` (`:255`), `openTab` (`:283`, only the first tab may open
  targetless — else it throws), `closeTab` (`:298`, active closure activates the LEFT neighbour else the RIGHT
  else `null`), plus the surrounding activate/reorder/persist transitions.
- `src/renderer/tab-strip.ts:58` (`class TabStrip`) — the shell strip controller: mounts into the top-bar
  element, reads a default-resolution context, persists through the C9 carrier, notifies `onActiveChange`, and
  owns the strip's own DOM (it removes only its OWN nodes on re-render so the fork's nameplate survives —
  `index.html:212-223`).
- The MCP counterpart: `provident.focus` is registered in `src/main/mcp-server.ts:1791` (`ALL_TOOLS`), with its
  registration guard at `:2247` and the tool registration/handler at `:2248`, which invokes the renderer seam via
  `backend.invoke('focus', args)` (`:2268`) with a target
  union of `document | search | graph | template | other` plus `tabId` and `newTab` (`:2256-2265`); the comment
  states the intent: "UI focus only (find-or-open), routed through the renderer's shared focus-selection seam …
  NOT a graph/RAG mutation (no broadcast; not in MUTATING_METHODS)" (`:2243-2246`).
- So the *seam* exists in the fork, but as fork-private code: `tab-state.ts` + `TabStrip` + a renderer RPC case,
  with nothing in the foundation describing the model, the transitions, or the parity obligation.

**Requested contract.** One focus model that a shell strip and an MCP tool both call.

```ts
export interface FocusTarget { readonly kind: string; readonly [k: string]: unknown }

export interface FocusEntry {
  readonly id: string
  readonly target: FocusTarget
  readonly title: string
}

export interface FocusModel {
  /** Find-or-open: activate an existing entry for the target, else open + activate. PURE transition. */
  open(target: FocusTarget, opts?: { newTab?: boolean; title?: string; id?: string }): void
  /** Activate an existing entry by id; an unknown id is a no-op. */
  activate(id: string): void
  /** Reorder within the strip (a move, never a re-mint). */
  reorder(id: string, toIndex: number): void
  /** The current view: entries + active + order. */
  state(): { readonly open: readonly FocusEntry[]; readonly activeId: string | null; readonly order: readonly string[] }
  /** The single persist hook (the consumer's serialized carrier). */
  persist(): void
}

export interface CreateFocusModelOptions {
  readonly initial?: unknown
  readonly persist?: (state: ReturnType<FocusModel['state']>) => void
  /** Notified on ANY committed transition — the shell strip and the MCP tool both see this. */
  readonly onChange?: (state: ReturnType<FocusModel['state']>) => void
}
export declare function createFocusModel(opts?: CreateFocusModelOptions): FocusModel
```

Invariants (the contract, not advice):

1. **One model, two callers.** The shell strip calls the model; an MCP tool calls the SAME model instance (in the
   same process). Neither surface re-implements find-or-open, activate, reorder, or persistence.
2. **PURE transitions, one commit each.** Each transition returns/applies a whole new state and fires `onChange`
   once (the fork's `tab-state.ts` discipline, generalized); no partial mutation is observable.
3. **Documented fail-states.** Unknown id → no-op; a second targetless open → refused (thrown or a typed error —
   the contract must state which, since the fork throws); a `newTab` on an existing target → a duplicate entry;
   close of the active entry → left neighbour, else right, else `null`.
4. **Persistence is the consumer's.** The model emits state; the carrier (a versioned serialized doc) is the
   consumer's — the foundation must not invent a store.
5. **NOT requested:** the tab strip's markup, the tab's provident body, the target vocabulary (a consumer's
   `document:`/`graph:`/… kinds), the strip's overflow behaviour, or the C14 tab semantics (document tabs,
   cross-document shared-node handling). The foundation ships the model + the seam; the fork ships the kinds.

**Acceptance criteria (testable).**

1. **Equivalence:** driving the model through the MCP tool path and driving it through the strip path with the
   same target produce **identical** `state()` (deep equality) and the same number of `persist()` calls.
2. Find-or-open: two opens of the same target yield one entry and one active id; `{ newTab: true }` yields two.
3. `activate` with an unknown id is a no-op (state identity, zero `onChange`).
4. Close-active selects the left neighbour; with no left, the right; with neither, `activeId === null`.
5. A targetless open after the first is refused with the documented fail-state (assert the exact shape: throw or
   typed error) — never a silent landing tab.
6. `reorder` preserves entry identity (ids unchanged) and changes only `order`.

**MCP-visibility consequence.** This request *is* the MCP consequence: `provident.focus` must not be a parallel
implementation of the strip — it must dispatch into the same model, so an agent's focus call and a human's click
are indistinguishable in the resulting state, and a bug fixed in one path is fixed in both. Note the deliberate
asymmetry the fork records: focus selection is UI-only, mutates no graph/RAG, and emits no
`resource-updated`/`app-graph-changed` notification (`mcp-server.ts:2243-2246`); the contract keeps that
(no broadcast), so an agent cannot use focus to force a re-render.

**Priority.** P2 — quality/parity. It blocks no shipped path in the fork (the seam exists and works), but it
blocks *reusable parity*: every future fork re-derives the model and re-proves the equivalence by hand.

**Fallback if upstream declines.** The fork keeps `tab-state.ts` + `TabStrip` + the `focus` RPC case as the
pinned seam, documented in `docs/FORK-DIVERGENCE.md`, with the equivalence asserted by a host test. Cost: parity
stays a fork-local property, and the foundation keeps shipping the parity *rule* without a way to satisfy it
mechanically.

---

## SC-7 — `MENU-CATALOG-CONTRACT` — a data-driven menu/dialog descriptor contract (P2)

**Target project:** Provident-Electron · **Filing verdict: FILE**

**Problem.** The foundation has no data-driven application-menu contract: its shell builds no menu at all, so a
fork that needs a native menu bar hand-writes an Electron template and a host-supplied file picker, and every
such template ends up encoding app semantics (filters, caps, containment, atomicity) inside the shell. The
foundation's native menu bar is an explicit carve-out, but a **descriptor contract** + a **documented dialog
seam** is the part that should be shared.

**Today's fork implementation (what it hand-rolls).**
- `src/main/app-menu.ts:93-135` (`buildMenuTemplate`) — the whole thing: it normalizes an untrusted pane catalog
  (`normalizePaneCatalog`, `:47`), orders it deterministically by scope then title then id (`orderPaneCatalog`,
  `:67`), maps it to checkbox items whose click routes to the host (`:102-109`), then builds a File menu
  (`Import…`, plus a separate `Import folder…` on win/linux — `:114-127`) and a View menu containing the Panes
  dropdown, disabled when the catalog is empty (`:128-134`). It is pure and `electron`-free by design (it returns
  `unknown[]` and takes injected actions + an injectable `platform`).
- The dialog shapes are pinned as constants in the same module — `IMPORT_DIALOG_FILTERS` (`:34`) and
  `IMPORT_DIALOG_PROPERTIES` (`:39`) — and the raw Electron `OpenDialogReturnValue` interpretation is
  `importSelectionFromDialog` (`:81-88`): a cancel/dismiss or empty selection is `null`; otherwise the raw
  selection is returned UNCHANGED.
- The `.md`-directory expansion + the app semantics live host-side: `src/main/import-directory.ts:14`
  (`MAX_IMPORT_FILES = 512`, enforced per directory read AND re-enforced on the aggregate, FAIL-LOUD never a
  silent truncate) with outcomes `not-a-directory` / `cap-exceeded` (`:16-19`) and
  `{ ok: false, reason: 'no-markdown-files' | 'cap-exceeded' }` (`:34-37`).
- Upstream has **no menu at all**: no file in `../Provident-Electron/src/` references `Menu`/`setApplicationMenu`
  (the fork's own gap row recorded it as SG3: "no `Menu` in `main.ts`; therefore no View menu (C13), no File menu
  (C17)", `ui-overhaul.md:1123`).

**Requested contract.** A catalog → template builder + a documented dialog seam.

```ts
export type MenuCatalogItem =
  | { readonly kind: 'action'; readonly id: string; readonly label: string; readonly accelerator?: string; readonly enabled?: boolean }
  | { readonly kind: 'toggle'; readonly id: string; readonly label: string; readonly checked: boolean; readonly group?: string }
  | { readonly kind: 'separator' }
  | { readonly kind: 'submenu'; readonly id: string; readonly label: string; readonly items: readonly MenuCatalogItem[] }

export interface MenuActionSeam {
  /** Every catalog item's `id` routes here. The host decides what it means. */
  invoke(id: string, payload?: { readonly checked?: boolean }): void
}

export interface BuildMenuOptions {
  readonly actions: MenuActionSeam
  readonly platform?: string
  /** The host's scope/group ordering key + label resolver (the foundation has no vocabulary opinion). */
  readonly orderOf?: (item: MenuCatalogItem) => number
}

/** PURE: no electron import; returns an Electron-shaped template as opaque data. */
export declare function buildMenuFromCatalog(
  catalog: unknown,
  options: BuildMenuOptions,
): unknown[]

/** The documented native-dialog seam: a host supplies the picker, the shell supplies the plumbing. */
export interface NativePickerSeam {
  /** Open a host-supplied picker. The shell never interprets the selection. */
  pick(spec: {
    readonly purpose: string
    readonly properties: readonly string[]
    readonly filters: readonly { readonly name: string; readonly extensions: readonly string[] }[]
  }): Promise<readonly string[] | null>
}
```

Invariants (the contract, not advice):

1. **The catalog drives the template.** No hard-coded menu item list in the builder; a new catalog entry appears
   without a shell change; an empty catalog yields a disabled/empty group rather than a fabricated list (the
   fork's F2 pin, generalized).
2. **Platform awareness is a parameter, not a branch in the host.** The builder takes `platform` and owns the
   platform shape (e.g. a leading app menu and a single combined picker on darwin vs a separate folder item
   elsewhere) — the consumer passes a value, not a `switch`.
3. **Every item's action routes to a host handler by `id`.** The builder performs no domain work: no fs access,
   no dialog call, no app state read. It emits structure + `invoke(id, …)`.
4. **A documented dialog seam for a host-supplied picker.** The shell owns opening/closing and the
   cancel/dismiss → `null` contract; the host owns the selection's meaning. The shell must never interpret,
   filter, expand, or cap a selection.
5. **EXPLICITLY EXCLUDED — the Import semantics.** The 512-file cap, the atomic one-batch commit, the
   `corpusRoot` containment, the `.md`/`.markdown` filter set, the directory → `.md` expansion, and the
   not-a-directory / cap-exceeded / no-markdown-files outcomes are **app-specific and stay in Astrographer**
   (`src/main/import-directory.ts:14-37`, `MAX_IMPORT_FILES`; the corpus-root containment decision
   `IMPORT-ROOT-PER-STORE`, `docs/decisions.md:121`). The foundation must not learn them, and this request must
   not be read as asking for an importer.
6. **NOT requested:** the pane-visibility model or `enabledPanes` (the fork's catalog is one consumer of the
   contract, not part of it), the menu labels, the pane registry, `module.*` tool surfacing, or the native
   context menu.

**Acceptance criteria (testable).**

1. A catalog containing `action`/`toggle`/`separator`/`submenu` items produces a template whose structure mirrors
   it, in the catalog's order after the supplied `orderOf` (deep-equality assertion against a fixture; pure, no
   Electron).
2. `platform: 'darwin'` and `platform: 'linux'` produce the documented different shapes from the SAME catalog
   (both asserted, including the single-vs-separate picker-item difference).
3. An item's `invoke` routes to the host handler with the item's `id` (and `checked` for a toggle) — exactly one
   call per activation.
4. An empty/non-array catalog yields a disabled group and never throws (the fork's F1/F4 fail-soft pins,
   generalized).
5. The dialog seam: a cancel/dismiss or empty selection resolves to `null`; a non-empty selection is passed
   through byte-identical, with zero interpretation (assert the exact array identity/equality).
6. The builder imports no `electron` and no `fs` (static assertion) — it is pure data transformation.

**MCP-visibility consequence.** The menu is native OS chrome and therefore MCP-invisible by design, and the
contract must keep it that way: a menu item's action routing to the host by `id` means the *action* is auditable
in the host (where the fork's pane-visibility channel and its MCP-tool gating live) while the menu itself stays
outside the graph. The exclusion in clause 5 is a visibility decision too: importing a corpus is an MCP-exposed
capability (`edit.import_markdown`), so folding its semantics into shell menu code would put domain policy in the
one layer an agent cannot see.

**Priority.** P2 — quality/parity. It blocks no shipped path (the fork's builder works and is already pure), but
it is the difference between a foundation that ships a menu-bar carve-out and one that ships a reusable
descriptor contract.

**Fallback if upstream declines.** The fork keeps `app-menu.ts` + `import-directory.ts` as a pinned host
contract, documented as fork-local in `docs/FORK-DIVERGENCE.md`. Cost: each fork re-derives the platform shapes,
the untrusted-catalog normalization, and the dialog cancel contract.

---

## DO NOT FILE (recorded so a later pass does not re-propose them)

| Not filed | One-line reason |
| --- | --- |
| A modal-toggle-`provident` request (make the settings modal a provident/dispatchable surface) | Already pinned as SHELL: `ui-overhaul.md:65` ("the shell may own open/close of the modal *frame*") + §7.1 Q2 (`:1167/1212`) — the ruling is shell frame + operator isolated-scope body, so there is nothing to request. |
| The doc-nav tree (folders/tags navigation) | App-specific document navigation (a consumer of the C15 directory slice), not a foundation mechanism. |
| The editor toolbar (markdown/HTML toggle, undo/redo/history controls) | Provident-authored pane content (Table A rows, `ui-overhaul.md:115-116`), MCP-visible app graph — no foundation mechanism is missing. |
| Hover-preview (C19 popup + 0.5 s dismissal) | App-graph provident content + a shell timing mechanic owned by the fork; already parked as a spec-level item, not a foundation gap. |
| Shared-subtree decoration (C20 background class + owners box) | App-specific cross-document semantics, provident-authored and MCP-visible; the foundation has no stake in it. |
| The RAG/pane registry | Astrographer's domain vocabulary; the foundation ships panes as generic registrations and must not learn the list. |
| `rag.*` / `edit.*` / `module.*` tools | App/engine surfaces; a foundation request for them would put RAG policy into the shell. (`module.*` already exists upstream as its own system.) |
| `enabledPanes` | Operator-only UI-config state in the fork's serialized carrier (decision `UI-CONFIG-CARRIER`), deliberately not an MCP capability. |
| The zone NAMES (`left`/`right`/`header`/`footer`/`stage`/`top-bar`) | Astrographer's layout vocabulary; SC-5 explicitly requests no zone set. |
| The Import semantics (512-file cap, atomic one-batch commit, `corpusRoot` containment, `.md` expansion) | App-specific policy (SC-7 clause 5); the capability is already MCP-exposed as `edit.import_markdown`. |
| Any `provident-ssr` package patch for the focus trap | A DOM/accessibility API, not a package gap — the trap is host-side; SC-3 requests the primitive, and the PS-1 doc requests only DOCUMENTATION of expressibility. |
| The scheduled shell units O-1 / O-2 / O-9 / O-10 | Fork-side implementation units (they consume whatever the foundation ships); filing an implementation unit as an upstream request would be mis-targeted. |
| Anything already covered by GR-1..GR-9 | The sibling engine set (`docs/feature-requests/gnosis-engine-feature-requests.md`) already owns those gaps; this doc must not duplicate them. |

---

## How to consume this document

1. **Filing.** Each SC-n becomes one issue against `Provident-Electron`. `docs/HANDOFF.md` §"OPEN handoff items"
   is the index — its **`FORMERLY NONE`** line
   (`docs/HANDOFF.md:29`) now records that this set replaced the former NONE, and the new SC/PS index row
   sits later in the file (`docs/HANDOFF.md:38-58`): the rows live there, and this file is the handover
   document they point into (mirroring how the GR set is indexed at `docs/HANDOFF.md:14-22`).
2. **Acceptance is upstream-side.** The acceptance criteria are written to be reproducible by the foundation
   (dom-shim-level assertions, no layout, no Astrographer code). A criterion that needs the assembled app is
   labelled as such.
3. **The fork fallback is per request.** Each request's "Fallback if upstream declines" clause names the
   fork-side home that already implements the behaviour; a decline therefore costs reuse, not function. The
   fork-local half of every delta is tabulated in `docs/FORK-DIVERGENCE.md` §2.
4. **Do not re-file.** The DO-NOT-FILE table above is binding for later passes; a new proposal that overlaps it
   must either cite the pinning decision or supersede it explicitly.
5. **The companion doc.** Package-documentation requests (not foundation mechanisms) are in
   `docs/feature-requests/provident-ssr-expressibility-requests.md` (PS-1).
