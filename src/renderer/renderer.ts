// src/renderer/renderer.ts — browser entry for the Electron renderer.
// Bootstraps the provident-ssr producing process into #app and serves the
// MCP-facing operations over the preload bridge (main process = MCP server).
import { Runtime } from './runtime.js'
import { SidebarPanes } from './sidebar-panes.js'
import { GnosisPanes } from './gnosis-panes.js'
import { GnosisCrudPanes } from './gnosis-crud-panes.js'
import { gutterSizeForPoint } from './pane-gutter.js'
import { toZoneBounds, dropZoneForPoint, type ZoneBounds } from './pane-drag.js'
import { createPaneRegistry } from './pane-registry.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../main/template-shape.js'
import type { LegacyInitialData } from 'provident-ssr'
import { SecurePanels } from './secure-panels.js'
import { installSettingsModal } from './modal-state.js'
import { createEditController } from './edit-controller.js'
import { applyThemeToRoot } from './theme.js'
import { type LayoutState, type LayoutZoneName } from './layout-state.js'
import { applyLayoutToRoot } from './layout-vars.js'
import { TabStrip } from './tab-strip.js'
import type { RpcRequest, RpcReply } from '../shared/types.js'
// ⟨`U-ZONE-REPLACEMENT` / `PD-UI-14` — §3 rows 4/5, §3.4: THE GESTURE SESSION IS THE
// VENDORED `gesture-session.ts`, ITS ELEMENT-BACKED SOURCE IS BUILT ON THE VENDORED
// `gutter-affordance.ts` `domEventSource()`, and THE WRITE IS THE VENDORED
// `gutter.ts` CONTROLLER'S `commit` — `§3.4(a)/(d)`: the renderer supplies the session
// (`{source, commit: <guard-only>}`, never the writer), the per-control opt-in capture
// capability the source advertises, the session seam the host's controller is composed
// over, and the fork's own element resolution (`closest` — OUTSIDE the module, whose
// bytes carry no selector). The hand-rolled per-gesture listener bookkeeping is
// REMOVED: the session owns establishment, tracking and the terminal.
import { createGestureSession, POINTER_TYPES, type EventSource } from '../shared/gesture-session.js'
import { cursorDeclarationFor, domEventSource } from '../shared/gutter-affordance.js'

/** N3 (live-notification-review.md) — the MCP methods that mutate the APP graph
 *  (content/structural/re-derive). Only these trigger the app-graph-changed push
 *  AFTER the reply. Never triggered by the isolated SecurePanels graph. */
const MUTATING_METHODS = new Set(['dispatch', 'load', 'op', 'teardown', 'code.load', 'code.loadBatch', 'journal'])

/** Unit U-SHELL-9a §2.7 — the shell tab strip (the shared focus-selection
 *  seam). Assigned in `main()`; the renderer's `focus` RPC method routes
 *  `provident.focus` here. Null until boot (or in a no-DOM environment). */
let tabStrip: TabStrip | null = null

function handleRequest(runtime: Runtime, req: RpcRequest, notify: (p: { uri: string }) => void): Promise<RpcReply> {
  return (async (): Promise<RpcReply> => {
    try {
      let value: unknown
      switch (req.method) {
        case 'dispatch':
          value = await runtime.dispatch(req.payload as never)
          break
        case 'renderedHtml':
          value = runtime.renderedHtmlResult()
          break
        case 'markdown':
          value = runtime.markdownResult()
          break
        case 'listTargets':
          value = runtime.listTargets()
          break
        case 'nodeState':
          value = runtime.nodeState(req.payload as never)
          break
        case 'load':
          value = runtime.load(req.payload as never)
          break
        case 'op':
          value = runtime.op(req.payload as never)
          break
        case 'export':
          value = runtime.export((req.payload as { format: 'legacy' | 'serialized' }).format)
          break
        case 'validate':
          value = runtime.validate((req.payload as { kind: 'legacy' | 'serialized'; export: unknown }).kind, (req.payload as { export: unknown }).export)
          break
        case 'teardown':
          value = await runtime.teardownResult()
          break
        case 'code.get':
          value = runtime.codeGet((req.payload as { path: string }).path)
          break
        case 'code.set':
          value = runtime.codeSet((req.payload as { path: string; value: unknown }).path, (req.payload as { value: unknown }).value)
          break
        case 'code.create':
          value = runtime.codeCreate((req.payload as { path: string; entry: unknown }).path, (req.payload as { entry: unknown }).entry)
          break
        case 'code.delete':
          value = runtime.codeDelete((req.payload as { path: string; index?: number }).path, (req.payload as { index?: number }).index)
          break
        case 'code.validate':
          value = runtime.codeValidate((req.payload as { envelope?: unknown }).envelope)
          break
        case 'code.load':
          value = runtime.codeLoad((req.payload as { envelope?: unknown }).envelope)
          break
        case 'code.loadBatch':
          value = runtime.codeLoadBatch((req.payload as { ops: unknown[] }).ops as never)
          break
        case 'journal':
          value = runtime.journal((req.payload as { action?: 'undo' | 'redo' | 'replay' } | null)?.action as 'undo' | 'redo' | 'replay')
          break
        case 'journalEntries':
          value = runtime.journalEntries(req.payload)
          break
        case 'focus':
          // Unit U-SHELL-9a §2.7 — UI focus only (find-or-open). NOT a graph
          // mutation: `focus` is not in MUTATING_METHODS (no app-graph-changed).
          value = tabStrip ? tabStrip.focus(req.payload as never) : null
          break
        default:
          throw new Error(`unknown method: ${(req as { method: string }).method}`)
      }
      return { id: req.id, ok: true, value }
    } catch (e) {
      return {
        id: req.id,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }
    }
  })().then((reply) => {
    // N3/N6 — after a MUTATING app-graph op succeeds, emit ONE app-graph-changed
    // push (the resource content changed). App-Runtime-only: SecurePanels never
    // calls this. Coalesced to once per tool invocation (after the reply).
    if (reply.ok && MUTATING_METHODS.has(req.method)) {
      notify({ uri: 'mcp://provident/app' })
    }
    return reply
  })
}

/** Unit U-SHELL-2 §2.4 (W1-N1) — apply the persisted/streamed operator theme at
 *  boot and re-resolve it live while the setting is `system`. The shell applies
 *  the theme by setting `document.documentElement.dataset.theme` (§2.3); the OS
 *  preference is read from `matchMedia('(prefers-color-scheme: dark)')`.
 *  Fail-soft (F2): an environment without `matchMedia` degrades to the light
 *  default and never throws. */
function installTheme(): void {
  const themeBridge = (window.provident ?? {}) as unknown as {
    operatorSettings?: {
      get(): Promise<{ theme?: unknown }>
      onChanged?(handler: (settings: { theme?: unknown }) => void): () => void
    }
  }
  let media: MediaQueryList | null = null
  try {
    if (typeof window.matchMedia === 'function') media = window.matchMedia('(prefers-color-scheme: dark)')
  } catch {
    media = null
  }
  const prefersDark = (): boolean => {
    try {
      return media ? media.matches : false
    } catch {
      return false
    }
  }
  let setting: unknown = 'system'
  const apply = (): void => {
    applyThemeToRoot(document.documentElement, setting, prefersDark())
  }
  // The OS listener is attached ONCE; its handler is inert while the setting is
  // explicit (`light`/`dark`), so an OS flip only re-applies under `system`.
  if (media) {
    try {
      media.addEventListener('change', () => {
        if (setting !== 'light' && setting !== 'dark') apply()
      })
    } catch {
      // a matchMedia without addEventListener — degrade, never throw
    }
  }
  // Live operator-settings changes (the settings pane) — re-apply from the payload.
  try {
    themeBridge.operatorSettings?.onChanged?.((payload) => {
      setting = payload?.theme
      apply()
    })
  } catch {
    // older bridge surface without onChanged — ignore
  }
  // Boot: read the persisted setting and apply. A bridge error keeps `system`.
  void themeBridge.operatorSettings
    ?.get?.()
    .then((payload) => {
      setting = payload?.theme
      apply()
    })
    .catch(() => {
      // keep the `system` default on a bridge error
    })
}

/** W2-N3 (AF-3) — apply the persisted `OperatorSettings.layout` to the shell
 *  grid's CSS custom properties (the shell chrome is not a provident node). The
 *  tracks in `index.html` read these vars (§2.4); the geometry is re-applied
 *  live when a layout mutation broadcasts an operator-settings change. Fail-soft:
 *  a bridge error / absent `documentElement` never throws. */
function installLayout(): void {
  const layoutBridge = (window.provident ?? {}) as unknown as {
    operatorSettings?: {
      get(): Promise<{ layout?: LayoutState }>
      onChanged?(handler: (settings: { layout?: LayoutState }) => void): () => void
    }
  }
  const apply = (layout: unknown): void => {
    applyLayoutToRoot(document.documentElement, layout as LayoutState)
  }
  // Live operator-settings changes carry the layout slice — re-apply.
  try {
    layoutBridge.operatorSettings?.onChanged?.((payload) => {
      if (payload?.layout !== undefined) apply(payload.layout)
    })
  } catch {
    // older bridge surface without onChanged — ignore
  }
  // Boot: read the persisted layout and apply. A bridge error keeps the
  // index.html fallback geometry.
  void layoutBridge.operatorSettings
    ?.get?.()
    .then((payload) => {
      if (payload?.layout !== undefined) apply(payload.layout)
    })
    .catch(() => {
      // keep the CSS fallback geometry on a bridge error
    })
}

/** U-SHELL-9a §2.7 — true when the pointerdown target is an interactive control
 *  (an `input`/`button`/`a`/`select`/`textarea` or a node carrying `on:click`/
 *  `on-click`/`data-handler`), so a click on a control is never hijacked into a
 *  pane drag (F9). §2.4: the collapse-toggle, minimize-toggle and tab controls
 *  are provident click handlers and stay clickable. TOTAL — never throws. */
function isInteractiveControl(target: Element | null): boolean {
  if (target == null) return false
  const isInteractive = (node: unknown): boolean => {
    const n = node as { tagName?: string; getAttribute?: (name: string) => string | null }
    const tag = typeof n?.tagName === 'string' ? n.tagName.toLowerCase() : ''
    if (tag === 'input' || tag === 'button' || tag === 'a' || tag === 'select' || tag === 'textarea') return true
    // ADV5 — interactive WRAPPER controls: a `label`/`fieldset` and any
    // `[contenteditable]` region are interactive, so a pointerdown on a label
    // wrapping an input/select/textarea (or an editable region) inside a
    // `.pane-frame` is never hijacked into a pane drag.
    if (tag === 'label' || tag === 'fieldset') return true
    if (typeof n?.getAttribute === 'function') {
      for (const attr of ['on:click', 'on-click', 'data-handler', 'on:pointerdown']) {
        if (n.getAttribute(attr) != null) return true
      }
      if (n.getAttribute('contenteditable') != null) return true
    }
    return false
  }
  // HOST-3 — walk TARGET AND ANCESTORS by DIRECT NODE INSPECTION (parentElement
  // → parent fallback), so a `span` nested inside an interactive `button`/`input`
  // returns true (never hijacked into a pane drag). Never a colon-bearing
  // compound via shim `closest` (the dom-shim rejects `[on:click]` selectors).
  let n: unknown = target
  while (n) {
    if (isInteractive(n)) return true
    const cur = n as { parentElement?: unknown; parent?: unknown }
    n = cur.parentElement ?? (cur as { parent?: unknown }).parent
  }
  return false
}

/** A `getBoundingClientRect()`-shaped rect (the gesture geometry the wiring
 *  reads). */
interface GestureRect {
  left: number
  top: number
  right: number
  bottom: number
}

/** U-SHELL-N7 (HOST-2/HOST-4) — the module-level active-gesture record. ONE
 *  in-flight gesture at a time; the document-level `move`/`up`/`cancel`/
 *  `dblclick` listeners route through it, so a re-mount of the frame/gutter
 *  mid-gesture NEVER orphans the gesture (HOST-4) and the per-gesture listeners
 *  are torn down on end — never accumulated across consecutive gestures
 *  (HOST-2 — a second gesture never re-commits an older zone). */
/** ⟨`U-ZONE-REPLACEMENT` / `PD-UI-14` — §3 rows 4/5: THE VENDORED SESSION.⟩ The
 *  module-level gesture state is the vendored `createGestureSession`'s own: one
 *  session for the gutter controls and one for the pane drag, each with the
 *  element-backed source the vendored `gutter-affordance.domEventSource()` supplies
 *  (its START turn; its three tracking turns are the fork's own document-bound
 *  tracking — `gutterGestureSource`) and a GUARD-ONLY `commit` — the write is the
 *  COMPOSED CONTROLLER's (`§3.4(a)/(b)`). `null` until `installShellPointers` wires the document
 *  (a no-DOM environment, and a host-less plain page, leave both unset), so the
 *  helpers below no-op rather than throw. */
let gutterSession: ReturnType<typeof createGestureSession> | null = null
let paneSession: ReturnType<typeof createGestureSession> | null = null

/** The control elements this boot already gave a POINTER-IDENTITY listener to (one
 *  per element): the listener is registered BEFORE the session's own start listener,
 *  so it is the fork's only reading of the gesture's pointer identity at the instant
 *  the session's capture turn runs (`§4` item (iii)'s deferred-capture policy). The
 *  fork's per-control SESSION INSTALL is no longer taken here: `§3.4(d)` makes the
 *  controller's `attach` the element's one install (and the capture opt-in travels
 *  through the session seam that install is given). */
const gutterPointerWatched = new Set<unknown>()

/** ⟨§4 item (iii) / §3.4(b) — THE GESTURE'S POINTER IDENTITY.⟩ The vendored session's
 *  capture turn calls the source's `capturePointer(element)` with NO identity (the
 *  upstream API gap this unit FILES, never patches), so the fork carries its own: the
 *  identity recorded by the element's own `pointerdown` listener (an already-installed
 *  control — the element-backed `begin` wins the slot) or by the delegated
 *  `pointerdown` (a control installed by this very gesture). `null` until the first
 *  gesture; a capture turn with no identity degrades to no capture, exactly as an
 *  engine without capture does. */
let currentGutterPointerId: number | null = null

/** Record the pointer identity a `pointerdown` carries, TOTAL and fail-soft. */
function noteGutterPointerId(event: unknown): void {
  try {
    const pointerId = (event as { pointerId?: unknown } | null | undefined)?.pointerId
    if (typeof pointerId === 'number' && Number.isFinite(pointerId)) currentGutterPointerId = pointerId
  } catch {
    // fail-soft — a hostile event leaves the previous identity (or null) in place
  }
}

/** ⟨§3 row 4's "policy that stays" — THE FORK'S IDENTITY LISTENER, registered ONCE per
 *  control element and BEFORE the session's own start listener.⟩ It begins NOTHING and
 *  cancels nothing: it reads the identity the capture turn will need. TOTAL. */
function watchGutterPointerIdentity(element: unknown): void {
  if (gutterPointerWatched.has(element)) return
  gutterPointerWatched.add(element)
  try {
    // The vendored element-backed source (`domEventSource`), whose handler is handed the
    // EVENT — the session's own `EventSource.on` seam is typed `() => void`, so the
    // identity reading goes through the member that actually carries the event.
    domEventSource().on(element, 'pointerdown', (event) => noteGutterPointerId(event))
  } catch {
    // fail-soft — an element with no listener surface simply carries no identity
  }
}
/** The elements this boot already installed on the pane session. */
const paneInstalled = new Set<unknown>()

/** The in-flight PANE drag's own fork-side record: the module owns establishment and
 *  the terminal, while WHICH pane is being dragged, the last projected zone bounds
 *  and whether the gesture has actually MOVED are the fork's facts. */
interface PaneDragState {
  host: SidebarPanes
  paneId: string
  lastZones: readonly ZoneBounds[]
  moved: boolean
  pointerId: number | null
  captureEl: { setPointerCapture(pointerId: number): void } | null
  /** ⟨gate-4 re-audit — THE LIVE CAPTURE TARGET.⟩ The frame node a gesture starts on
   *  is REPLACED by the establishment's own re-derive, so the capture claim resolves
   *  the frame by the pane's identity at the claim (never the pinned node). */
  captureTargetOf: () => { setPointerCapture(pointerId: number): void } | null
  downX: number | null
  downY: number | null
}
let paneDrag: PaneDragState | null = null

/** The in-flight GUTTER gesture's own fork-side record: the zone under the pointer
 *  and the `.layout` rect read ONCE at establishment (never per move). The session
 *  owns the gesture; this only carries the fork's own geometry facts. */
interface GutterGestureState {
  host: SidebarPanes
  zone: LayoutZoneName
  layoutRect: GestureRect
}
let gutterGesture: GutterGestureState | null = null


/** ADV4 — the document instance `installShellPointers` is currently wired onto.
 *  Tied to the DOCUMENT (not a bare boolean) so each fresh document/install
 *  (per renderer boot, and per adversarial shim test) still registers exactly
 *  once, while a redundant second call on the SAME document is a no-op. */
let shellWiredDoc: unknown = null

/** The module's `cancel` terminal accepts the control element; on the lost-capture
 *  path the fork does not hold it (the session's own record does), and the module's
 *  own contract reads an absent element as "the record's element" — the one gesture a
 *  session holds at a time. Named here so every call site passes the SAME value. */
const paneCancelElement: unknown = undefined

/** True only for the four real layout zones. HOST-5 — a malformed `'bogus'`
 *  value must never be coerced into a real `left` `ZoneBounds`. */
function isLayoutZoneNameValue(value: unknown): value is LayoutZoneName {
  return value === 'left' || value === 'right' || value === 'header' || value === 'footer'
}


/** F-1b — the pointer travel (px) at which a pane drag CLAIMS the pointer via
 *  `setPointerCapture`. Below it the gesture is still a click (the toggle / a
 *  row activation must reach its own handler). */
const PANE_DRAG_CAPTURE_THRESHOLD = 4

/** The delegated gesture-element selector (HOST-1). Resolved per `pointerdown`
 *  via `e.target.closest(...)` so gutters/headers authored AFTER install —
 *  the real app authors them at render — still route. TWO surface kinds:
 *    - the gutter (`.gutter[data-zone]`, unchanged), and
 *    - the pane HEADER (`.pane-collapse-toggle` — the frame's FIRST child in
 *      `src/renderer/pane-graph.ts`, carrying the authored
 *      `id="pane-collapse-<paneId>"`).
 *  F-1 (2026-09-15): the `.pane-frame[data-pane-id]` element is NO LONGER a
 *  surface — a `pointerdown` anywhere in the pane BODY (a provident row, a
 *  paragraph, the body root) must never start a pane drag and never capture the
 *  pointer on the frame, because that capture retargets the gesture's `click`
 *  away from the control the operator actually pressed.
 *
 *  The header compound deliberately does NOT use the frame-anchored child form
 *  (`.pane-frame[data-pane-id] > .pane-collapse-toggle`): the dom-shim CSS
 *  subset REJECTS `>` anywhere in a selector (non-match, never a throw), so that
 *  form would resolve NOTHING under the shim-covered tests. The un-anchored
 *  compound is equivalent here (the frame ancestry is resolved separately, and
 *  the `.pane-collapse-toggle` class is authored ONLY on the pane header). No
 *  colon-bearing compound either (the dom-shim `closest` rejects `[on:...]`). */
const GESTURE_SELECTOR = '.gutter[data-zone], .pane-collapse-toggle'

/** The delegated gutter element for the PERMANENT `dblclick` reset (ADV1) —
 *  resolved separately from the pointerdown selector so a double-click is
 *  decoupled from the gesture lifecycle. */
const GUTTER_SELECTOR = '.gutter[data-zone]'

/** F-1 — the pane HEADER's class (the grab surface). */
const PANE_HEADER_CLASS = 'pane-collapse-toggle'

/** F-1 — the pane FRAME's class (the element carrying `data-pane-id` and owning
 *  the pointer capture for a pane drag). */
const PANE_FRAME_CLASS = 'pane-frame'

/** F-1 — a class test that is TOTAL across a real DOM `className`
 *  (string), a `DOMTokenList` and a shim element (string). Never throws. */
function hasClass(el: unknown, cls: string): boolean {
  const raw = (el as { className?: unknown })?.className
  try {
    if (typeof raw === 'string') return raw.split(/\s+/).includes(cls)
    const list = raw as { contains?: (c: string) => boolean } | null | undefined
    if (list && typeof list.contains === 'function') return list.contains(cls) === true
  } catch {
    // fail-soft — a throwing className never breaks the gesture resolution
  }
  return false
}

/** F-1 — the nearest `.pane-frame` ANCESTOR of `el` (a real `.pane-frame`; the
 *  element itself is never its own ancestor). Returns `null` when the chain
 *  holds no frame (a detached/foreign header) — the caller then degrades.
 *  Direct node inspection (`parentElement` → `parent`), never a colon-bearing
 *  shim `closest` compound. */
function paneFrameAncestorOf(el: unknown): unknown | null {
  let n: unknown = (el as { parentElement?: unknown; parent?: unknown })?.parentElement ?? (el as { parent?: unknown })?.parent
  while (n) {
    if (hasClass(n, PANE_FRAME_CLASS)) return n
    const cur = n as { parentElement?: unknown; parent?: unknown }
    n = cur.parentElement ?? cur.parent
  }
  return null
}

/** F-1 — the pane id for a pane drag. The **`.pane-frame` ancestor is the
 *  DECISIVE source**: whenever a frame element exists, only the frame's
 *  `data-pane-id` can supply the identity — a frame that carries the attribute
 *  EMPTY, or does not carry it at all, resolves NOTHING (the header's own
 *  attribute is never substituted for a malformed/foreign frame; a malformed
 *  frame must degrade, never drag). Only a FRAME-LESS surface (no `.pane-frame`
 *  ancestor at all) falls back to its own `data-pane-id` (order (a) of the
 *  pinned resolution). The REAL app always authors the id on the frame
 *  (`src/renderer/pane-graph.ts` paneSubtreeRoot carries `data-pane-id` on BOTH
 *  the frame and the collapse toggle), so frame-decisive and header-first agree
 *  there. A missing/empty/non-string value is NEVER a pane identity. Never
 *  throws. */
function resolvePaneId(gestureEl: unknown, frame: unknown | null): string | null {
  const read = (el: unknown): unknown => {
    const g = (el as { getAttribute?: (name: string) => string | null })?.getAttribute
    return typeof g === 'function' ? g.call(el, 'data-pane-id') : null
  }
  const nonEmptyString = (v: unknown): v is string => typeof v === 'string' && v !== ''
  try {
    if (frame != null) {
      const fromFrame = read(frame)
      return nonEmptyString(fromFrame) ? fromFrame : null // the frame decides (empty/absent → no identity)
    }
    const own = read(gestureEl)
    if (nonEmptyString(own)) return own // frame-less fallback: the surface's own attribute
  } catch {
    // fail-soft — a throwing attribute read resolves nothing
  }
  return null
}

/** ⟨§3 row 4 — the session's `source` seam.⟩ The vendored `domEventSource()` binds a
 *  listener ON THE ELEMENT IT IS GIVEN, through that element's own member; the
 *  renderer's only addition is THE OPT-IN CAPTURE CAPABILITY (`§4` item (iii)): the
 *  source advertises `capturePointer`, and the SESSION invokes it AT MOST ONCE per
 *  gesture, inside `begin`, only after the gesture is established and only for a
 *  control that opted in with `capture: true`. NO capture call exists on the
 *  `pointerdown` path. */
function shellEventSource(): EventSource {
  const base = domEventSource()
  return {
    on: (element, type, handler) => base.on(element, type, handler),
    off: (element, type, handler) => base.off(element, type, handler),
    isConnected: (element) => base.isConnected?.(element) ?? true,
    capturePointer: (element) => {
      try {
        const capture = (element as { setPointerCapture?: unknown })?.setPointerCapture
        if (typeof capture !== 'function') return
        // ⟨§4 item (iii) / `F2`.⟩ THE DOM CALL CARRIES THE GESTURE'S POINTER IDENTITY: a
        // real `setPointerCapture` REQUIRES a pointer id and THROWS for the no-argument
        // call, so a no-argument capture is no capture at all — the gesture is lost the
        // moment the pointer leaves the element's box. The identity is the fork's own
        // (`currentGutterPointerId`); where none was recorded the call is SKIPPED rather
        // than made with an invented id (the declared degradation).
        const pointerId = currentGutterPointerId
        if (typeof pointerId !== 'number' || !Number.isFinite(pointerId)) return
        ;(capture as (this: unknown, pointerId: number) => void).call(element, pointerId)
      } catch {
        // capture unavailable/throws — the non-captured listeners carry the gesture
      }
    },
  }
}

/** ⟨§3 row 4's deferred-capture policy / §4 item (iii) — THE FORK'S OWN TRACKING.⟩
 *  THE GUTTER SESSION'S SOURCE. The START turn is ELEMENT-BACKED: the session is
 *  installed PER CONTROL ELEMENT, by identity (`C-6`'s ban is on a SELECTOR-resolving
 *  source, and this source resolves nothing — no `closest`, no `data-zone`, no
 *  selector enters it). The three TRACKING turns (`pointermove`/`pointerup`/
 *  `pointercancel`) are bound on the DOCUMENT, and that is the fork's own tracking,
 *  declared here rather than assumed: the capture is what RETARGETS a pointer that
 *  leaves the element's box back to the element, and the engine's capture semantics are
 *  exactly what the harness cannot model — so a gesture whose pointer leaves its box
 *  must still receive its move and its terminal, or it is LOST (the failure this unit
 *  fixes). The tracking listeners exist ONLY between a `begin` and its terminal (the
 *  session attaches and detaches them per gesture), so an idle document carries none.
 *  ONE delivery per event: the element does not also carry these three types. */
function documentTrackedGestureSource(): EventSource {
  const base = shellEventSource()
  const tracking: ReadonlySet<string> = new Set([POINTER_TYPES.move, POINTER_TYPES.end, POINTER_TYPES.cancel])
  /** The document root where one exists, else the element itself (the declared
   *  degradation — a host with no document keeps the element-backed binding). */
  const rootFor = (element: unknown): unknown =>
    typeof document === 'undefined' || typeof document.addEventListener !== 'function' ? element : document
  return {
    on: (element, type, handler) => base.on(tracking.has(type) ? rootFor(element) : element, type, handler),
    off: (element, type, handler) => base.off(tracking.has(type) ? rootFor(element) : element, type, handler),
    isConnected: (element) => base.isConnected?.(element) ?? true,
    capturePointer: (element) => base.capturePointer?.(element),
  }
}

/** THE GUTTER SESSION'S source — the shared document-bound tracking source above,
 *  declared here as the gutter's own name so `installGutterSession` reads the way
 *  the contract describes it. ONE implementation, TWO named consumers (the gutter
 *  and the pane): a re-point of the rule lands on both or on neither. */
function gutterGestureSource(): EventSource {
  return documentTrackedGestureSource()
}

/** ⟨§3.4(d) — THE SESSION SEAM THE CONTROLLER IS COMPOSED OVER.⟩ The vendored
 *  `createResizeController` builds its own per-control install options (`onStart`/
 *  `onMove`/`onEnd`/`onCancel`) and its `attach` is what calls the session's `install` —
 *  so the capture OPT-IN cannot travel through the controller, and the vendored
 *  `gutter-affordance` says so itself (*"the capture opt-in cannot be delivered by the
 *  composed controller's `attach`"*). This adapter is the fork's own two-SHAPE seam
 *  (never a second sink: the session's `commit` and the controller's `commit` stay
 *  DISTINCT, `§3.4(b)/(d)`): it forwards the controller's five usable members verbatim
 *  and merges the ONE caller-side opt-in the controller's own install options cannot
 *  carry. TOTAL — every member is present and callable in every case. */
function gutterControlSession(session: ReturnType<typeof createGestureSession>): unknown {
  return {
    install: (element: unknown, options?: unknown): boolean => {
      const input = (options ?? {}) as Record<string, unknown>
      return session.install(element, { ...input, capture: true })
    },
    reset: (element: unknown, gesture: unknown, value: unknown): unknown =>
      session.reset(element, gesture as Parameters<typeof session.reset>[1], value),
    cancel: (element: unknown, gesture?: unknown): unknown =>
      session.cancel(element, gesture as Parameters<typeof session.cancel>[1]),
    dispose: () => session.dispose(),
    stats: () => session.stats(),
    gesture: () => session.gesture(),
    get disposed(): boolean {
      return session.disposed
    },
  }
}

/** ⟨`U-ZONE-REPLACEMENT` / `PD-UI-14` — §3 row 5: THE CURSOR DECLARATION, ADOPTED.⟩
 *  THE FORK'S AXIS-TOKEN-TO-CURSOR MAPPING — the module's `cursorOf` seam, which
 *  `§3` row 5 names as *"the fork's axis-token→cursor mapping (the DECLARATION
 *  string is the caller's)"*. The AXIS TOKEN is the fork's own (`data-axis`,
 *  authored from `gutterAxis` at §3.1's authoring site); the DECLARATION VALUE is
 *  the caller's own vocabulary — the SAME `'col-resize'`/`'row-resize'` values the
 *  shell's `.layout .gutter[data-axis=…]` cursor rules carry — and it is supplied as
 *  the module's own producer ANSWER SHAPE (an object carrying an own `cursor`
 *  member), never pre-resolved here. PURE. */
const GUTTER_CURSOR_DECLARATIONS: Readonly<Record<string, string>> = { columns: 'col-resize', rows: 'row-resize' }

/** THE ONE RESOLUTION OF THE PRODUCER'S ANSWER — the MODULE's, never a fork copy.
 *  `cursorDeclarationFor` is the vendored member's total resolution (`§3` row 5's
 *  adopted member list; `§0A` note 8's own-property rule): a trimmed non-empty
 *  string, or `undefined` for EVERY absent/non-object/absent-member/non-string/
 *  empty-or-whitespace shape. A token the fork authored no declaration for resolves
 *  to `undefined` rather than to an invented default. PURE. */
function gutterCursorDeclarationFor(axisToken: unknown): string | undefined {
  const token = typeof axisToken === 'string' ? axisToken : ''
  return cursorDeclarationFor({ cursor: GUTTER_CURSOR_DECLARATIONS[token] })
}

/** THE FORK'S CURSOR WRITE — `§3` row 5's `applyCursor` seam, *"the fork's cursor write"*,
 *  THE SITE THE CONTRACT NAMES (the `applyCursor` seam of the row's eleven; `§2.1(e)`
 *  fixes the CSS half: the cursor RULES stay shell CSS and the module only ever
 *  receives the property value as a string). This function carries the module's
 *  RETURNED text to the affordance element the renderer already holds, applied as that
 *  element's cursor declaration. IT IS NOT A RE-POINT AND NOT A RE-VOCABULARY:
 *  `class="gutter"` + `data-zone` + `data-axis` and both `§3.2` dependents
 *  (`GESTURE_SELECTOR`, the two shell cursor rules) are UNTOUCHED — an element with no
 *  writable style, or an `undefined` declaration, keeps whatever the shell CSS already
 *  declares. TOTAL + fail-soft. */
function applyGutterCursorDeclaration(element: unknown, declaration: string | undefined): void {
  if (declaration === undefined) return
  try {
    const style = (element as { style?: unknown } | null | undefined)?.style
    if (style === null || style === undefined || typeof style !== 'object') return
    const declared = style as Record<string, unknown>
    declared['cursor'] = declaration
  } catch {
    // fail-soft — an unwritable/hostile style leaves the shell CSS rule in force
  }
}

/** ⟨§3.4(b) — THE SESSION'S `commit` IS GUARD-ONLY: IT CARRIES NO WRITE.⟩ The
 *  session's terminal fires with a `null` value on a REFUSED establishment as well as
 *  on an accepted `end`, so it cannot discriminate acceptance from refusal and must
 *  never invoke `setLayout`, `commitGutterSize` or the operator-settings persist. The
 *  fork's ONE write is the CONTROLLER's `commit` (`§3.4(a)/(d)`, `pane-gutter.ts` →
 *  `commitGutterSize`), which the composition above reaches exactly once per accepted
 *  gesture and zero times on a refusal. This hook does the fork's own BOOKKEEPING only:
 *  it closes the fork-side record and clears the per-gesture value channel. */
function gutterCommit(): void {
  const state = gutterGesture
  if (state == null) return
  try {
    state.host.endGutter()
  } catch {
    // fail-soft — a throwing commit never breaks the gesture stream
  } finally {
    gutterGesture = null
  }
}

/** The gutter session's PERMANENT hooks: a gutter gesture has no travel threshold, so
 *  its capture is part of the establishment and its commit is the terminal's. */
function installGutterSession(): ReturnType<typeof createGestureSession> | null {
  if (gutterSession != null) return gutterSession
  try {
    gutterSession = createGestureSession({
      source: gutterGestureSource(),
      // §3.4(b) — guard-only; the CONTROLLER's `commit` carries the write.
      commit: () => gutterCommit(),
    })
  } catch {
    gutterSession = null
  }
  return gutterSession
}

/** The pane-drag session's PERMANENT hooks. The establishment records the fork's own
 *  drag facts; the move turn carries the DEFERRED capture (`F-1b`: the frame is
 *  claimed only once the gesture has travelled past `PANE_DRAG_CAPTURE_THRESHOLD`, so
 *  a pure click still reaches the control the operator pressed); the terminal decides
 *  the drop. The session — never a fork listener — owns the per-gesture tracking. */
/** ⟨gate-4 re-audit finding — THE PANE SESSION'S TRACKING BINDS ON THE DOCUMENT
 *  TOO, and the measured reason is named rather than assumed.⟩ The pane session
 *  was built over `shellEventSource()` (element-backed), and the fork's OWN
 *  establishment path REPLACES the element it bound: `host.startPaneDrag(paneId)`
 *  re-derives the layout graph, so the `.pane-frame` the gesture started on is a
 *  DIFFERENT node from the one under the pointer a few pixels later (measured on
 *  the assembled app: `doc-nav#1` → `doc-nav#2` within the first four moves). An
 *  element-backed tracking turn attached to the discarded node never fires again,
 *  so the gesture received no move after that first 2px step, claimed no capture,
 *  and never got its terminal — the header drag moved nothing. The gutter path
 *  already solved exactly this shape with `documentTrackedGestureSource`; the pane
 *  session takes the SAME source (no new mechanism, and the rule now has ONE
 *  implementation for both consumers). The START turn stays ELEMENT-BACKED inside
 *  that source (the session is installed PER CONTROL ELEMENT by identity, `§2 C-6`). */
function installPaneSession(): ReturnType<typeof createGestureSession> | null {
  if (paneSession != null) return paneSession
  try {
    paneSession = createGestureSession({ source: documentTrackedGestureSource() })
  } catch {
    paneSession = null
  }
  return paneSession
}

/** The pane session's `onMove` hook: the DEFERRED capture, then the move routing.
 *  ADV2 — a move from a DIFFERENT pointer than the one that started the gesture is
 *  ignored, so a stale/lost gesture never acts on an unrelated pointer's events. */
function onPaneSessionMove(gesture: { readonly value?: unknown } | null): void {
  const g = paneDrag
  if (g == null) return
  try {
    if (g.captureEl != null && g.pointerId != null) {
      const cx = lastPointerX
      const cy = lastPointerY
      const dx = g.downX == null ? 0 : cx - g.downX
      const dy = g.downY == null ? 0 : cy - g.downY
      if (Math.hypot(dx, dy) >= PANE_DRAG_CAPTURE_THRESHOLD) {
        const el = g.captureEl
        g.captureEl = null // claim exactly ONCE per gesture
        try {
          // ⟨gate-4 re-audit⟩ The claim is made against the LIVE frame (the pinned node
          // was replaced by the establishment's own re-derive), and the DOM call carries
          // the gesture's POINTER IDENTITY — the same rule the gutter path's source
          // applies (§4 item (iii) / `F2`: a no-argument capture is no capture at all).
          const target = g.captureTargetOf() ?? el
          target.setPointerCapture(g.pointerId)
        } catch {
          // capture unavailable/throws — proceed on the non-captured listeners
        }
      }
    }
    const point = lastPointerPoint()
    const x = point.x
    const y = point.y
    const zones: ZoneBounds[] = []
    const containers =
      typeof document?.querySelectorAll === 'function' ? document.querySelectorAll('.layout [data-zone]') : []
    for (let i = 0; i < containers.length; i++) {
      const el = containers[i] as {
        className?: unknown
        getAttribute(name: string): string | null
        getBoundingClientRect(): GestureRect
      }
      // The `.layout [data-zone]` set also matches the resize GUTTERS (they
      // carry `data-zone` + `data-axis`, not `data-orientation`). A gutter is
      // NOT a drop container — skip it so it is never projected as a zone.
      const cls = typeof el.className === 'string' ? el.className : ''
      if (cls.split(/\s+/).includes('gutter')) continue
      // HOST-5 — fail-closed: project ONLY a real LayoutZoneName.
      const dataZone = typeof el.getAttribute === 'function' ? el.getAttribute('data-zone') : null
      if (!isLayoutZoneNameValue(dataZone)) continue
      if (typeof el.getBoundingClientRect === 'function') {
        zones.push(toZoneBounds(dataZone, el.getBoundingClientRect()))
      }
    }
    g.lastZones = zones
    g.moved = true
    g.host.movePaneDrag({ x, y }, zones)
  } catch {
    // fail-soft — a throwing move never breaks the gesture stream
  }
}

/** The pane session's terminal hook: ONE commit (or abort) per gesture. */
function onPaneSessionEnd(): void {
  const g = paneDrag
  if (g == null) return
  try {
    if (!g.moved) {
      g.host.cancelPaneDrag()
      return
    }
    const zone = dropZoneForPoint(lastPointerPoint(), g.lastZones, 24)
    if (zone == null) {
      g.host.cancelPaneDrag() // F1 — outside any zone → abort, no mutation
    } else {
      g.host.commitPaneDrop({ paneId: g.paneId, zone })
    }
  } catch {
    // fail-soft
  } finally {
    paneDrag = null
  }
}

/** The pane session's cancel hook: revert with no mutation (F4). */
function onPaneSessionCancel(): void {
  const g = paneDrag
  if (g == null) return
  try {
    g.host.cancelPaneDrag() // re-hide with one final write, no mutation
  } catch {
    // fail-soft
  } finally {
    paneDrag = null
  }
}

/** The gutter session's cancel hook: revert, no commit (F4). */
function onGutterSessionCancel(): void {
  const g = gutterGesture
  if (g == null) return
  try {
    g.host.cancelGutter()
  } catch {
    // fail-soft
  } finally {
    gutterGesture = null
  }
}

/** The last pointer position observed by the delegated listeners, in the shell
 *  coordinate space. Read by the pane drag's move/terminal routing (the module hands
 *  the handle, not the event, on its move channel). */
let lastPointerX = 0
let lastPointerY = 0
function lastPointerPoint(): { x: number; y: number } {
  return { x: lastPointerX, y: lastPointerY }
}

/** The PERMANENT document-delegated `dblclick` (ADV1) — the gutter double-click
 *  reset, decoupled from the gesture lifecycle. Resolves the gutter via
 *  `.gutter[data-zone]` and, ONLY for a real layout zone, calls
 *  `host.resetGutter(dataZone)` (the FORK-side reset route, §4 item (vii): the
 *  module's own `reset` refuses `'no-gesture'` outside a gesture). Fail-soft. */
function onGestureDblclick(host: SidebarPanes, e: unknown): void {
  if (host == null) return
  try {
    const target = (e as { target?: unknown })?.target
    if (target == null) return
    const t = target as { closest?: (sel: string) => { getAttribute?: (name: string) => string | null } | null }
    const gutterEl = typeof t.closest === 'function' ? t.closest(GUTTER_SELECTOR) : null
    const dataZone = gutterEl && typeof gutterEl.getAttribute === 'function' ? gutterEl.getAttribute('data-zone') : null
    // ONLY a real layout zone triggers the reset — a malformed `'bogus'` value
    // is never coerced into a registry-default commit (HOST-5 fail-closed).
    if (isLayoutZoneNameValue(dataZone)) host.resetGutter(dataZone)
  } catch {
    // fail-soft — a throwing reset never breaks the renderer
  }
}

/**
 * The document-level DELEGATED `pointerdown` — resolves the gesture element via
 * `e.target.closest(GESTURE_SELECTOR)` (HOST-1: works for chrome authored AFTER
 * install), INSTALLS that control on its session once and ESTABLISHES the gesture
 * through the SESSION's own `begin` (which is where capture happens, after
 * establishment and only for an opted-in control — §4 item (iii)). F-1: the two
 * surface kinds are distinguished explicitly — a match carrying `data-zone` is the
 * gutter; a match carrying the pane-header class is the pane HEADER, whose pane id
 * comes from its `.pane-frame` ancestor and whose pointer capture stays on that
 * FRAME. TOTAL + fail-soft — never throws. */
function onDocumentPointerDown(host: SidebarPanes, e: unknown): void {
  if (host == null) return
  try {
    const target = (e as { target?: unknown })?.target
    if (target == null) return
    lastPointerX = typeof (e as { clientX?: number }).clientX === 'number' ? (e as { clientX: number }).clientX : 0
    lastPointerY = typeof (e as { clientY?: number }).clientY === 'number' ? (e as { clientY: number }).clientY : 0
    const t = target as { closest?: (sel: string) => unknown }
    const gestureEl =
      typeof t.closest === 'function'
        ? (t.closest(GESTURE_SELECTOR) as {
            getAttribute?(name: string): string | null
            setPointerCapture?(pointerId: number): void
          } | null)
        : null
    if (gestureEl == null) return
    const dataZone = typeof gestureEl.getAttribute === 'function' ? gestureEl.getAttribute('data-zone') : null
    const pointerId = (e as { pointerId?: number })?.pointerId

    // Gutter gesture — the matched element carries a real layout `data-zone`.
    if (isLayoutZoneNameValue(dataZone)) {
      const session = installGutterSession()
      if (session == null) return
      // read the `.layout` rect ONCE per gesture
      let layoutRect: GestureRect | null = null
      if (typeof document?.querySelector === 'function') {
        const layoutRoot = document.querySelector('.layout') as { getBoundingClientRect?: () => GestureRect } | null
        if (layoutRoot && typeof layoutRoot.getBoundingClientRect === 'function') {
          layoutRect = layoutRoot.getBoundingClientRect()
        }
      }
      if (layoutRect == null) return
      // ADV3 — a new gutter gesture supersedes any in-flight one first.
      revertPriorGesture()
      const zone = dataZone
      const element = gestureEl
      // §3 row 5 — THE FORK'S CURSOR WRITE, on the ONE affordance element this
      // resolution already holds: the AXIS TOKEN the fork authored (`data-axis`) goes
      // through the ADOPTED mapping, the module resolves the producer's answer to the
      // DECLARATION, and the fork applies THAT text. The shell's cursor rules stay the
      // primary path (§3.2 dependent #2, unre-pointed): this writes the module's own
      // resolved text and never a second vocabulary.
      applyGutterCursorDeclaration(
        element,
        gutterCursorDeclarationFor(
          typeof element.getAttribute === 'function' ? element.getAttribute('data-axis') : null,
        ),
      )
      // ⟨§4 item (iii) — NO capture here: the session takes it INSIDE `begin`, after
      // the gesture is established, and only because this control opted in.⟩ The fork's own
      // TWO prep turns (the identity listener FIRST, so it precedes the session's own
      // start listener on an already-installed control; then the session install itself,
      // taken by the CONTROLLER's `attach` inside `host.startGutter` below — `§3.4(d)`).
      noteGutterPointerId(e)
      watchGutterPointerIdentity(element)
      const begun = establishGutterGesture({ host, zone, layoutRect }, session, element)
      if (!begun) return
    }

    // Pane-drag gesture — the matched element must be the pane HEADER surface
    // (F-1). A BODY element inside the frame (a provident row/paragraph/root) is
    // NOT a surface: it falls through here with no drag and no capture, so the
    // control's own `click` is never retargeted. A header-LESS `.pane-frame` is
    // not a surface either (the frame element itself never matches).
    const isHeaderSurface = hasClass(gestureEl, PANE_HEADER_CLASS)
    if (!isHeaderSurface) return
    // The pane FRAME: the header's nearest `.pane-frame` ancestor. It is BOTH
    // the pane-id source and the pointer-capture target (the move/up routing
    // reads the frame). No frame (detached/foreign header) → no pane identity.
    const frameEl = paneFrameAncestorOf(gestureEl)
    const dataPaneId = resolvePaneId(gestureEl, frameEl)
    if (dataPaneId == null || frameEl == null) return
    const session = installPaneSession()
    if (session == null) return
    // F9/HOST-3/ADV5 — never hijack a control. PINNED (supervisor decision, F-1
    // 2026-09-15): the header is itself a `button.pane-collapse-toggle`, so the
    // resolved HEADER surface is the pane's explicit GRAB SURFACE and is EXEMPT
    // from this guard. The guard stays armed as the second line of defence for
    // every other resolved target — i.e. any control inside the pane BODY.
    if (!isHeaderSurface && isInteractiveControl(target as Element | null)) return
    // ADV3 — a new pane drag supersedes any in-flight one first (a prior pane
    // drag is cancelled so its reveal is re-hidden, a prior gutter is reverted).
    revertPriorGesture()
    host.startPaneDrag(dataPaneId)
    // F-1b — the capture target is the pane's FRAME, claimed LAZILY once the gesture
    // passes `PANE_DRAG_CAPTURE_THRESHOLD` (see `onPaneSessionMove`). An immediate
    // capture here retargets the gesture's own `click` to the frame. ⟨gate-4
    // re-audit — THE TARGET IS THE LIVE FRAME, RESOLVED AT THE CLAIM.⟩ The
    // establishment path re-derives the layout graph, so the frame node this
    // resolution holds is REPLACED a few pixels into the gesture; a capture claim
    // made against the discarded node is a claim the engine refuses (`NotFoundError`
    // — the node is no longer in the document, which is exactly the zero
    // `gotpointercapture` reading), so the frame is looked up by its PANE IDENTITY at
    // the claim instead of pinned at the down. One `.pane-frame` per id is the frame
    // vocabulary's own rule (`PANE_FRAME_CLASS`). TOTAL: no frame/no document → null.
    const liveFrame = (): { setPointerCapture(pointerId: number): void } | null => {
      try {
        if (typeof document?.querySelector !== 'function') return null
        const found = document.querySelector(`.${PANE_FRAME_CLASS}[data-pane-id=${JSON.stringify(dataPaneId)}]`) as
          | { setPointerCapture?: unknown }
          | null
        if (found == null || typeof found.setPointerCapture !== 'function') return null
        return found as { setPointerCapture(pointerId: number): void }
      } catch {
        return null
      }
    }
    const captureEl = pointerId != null ? liveFrame() : null
    paneDrag = {
      host,
      paneId: dataPaneId,
      lastZones: [],
      moved: false,
      pointerId: pointerId ?? null,
      captureEl,
      captureTargetOf: liveFrame,
      downX: typeof (e as { clientX?: number }).clientX === 'number' ? (e as { clientX: number }).clientX : null,
      downY: typeof (e as { clientY?: number }).clientY === 'number' ? (e as { clientY: number }).clientY : null,
    }
    if (!paneInstalled.has(gestureEl)) {
      paneInstalled.add(gestureEl)
      try {
        session.install(gestureEl, {
          onMove: (gesture: unknown) => onPaneSessionMove(gesture as { readonly value?: unknown } | null),
          onEnd: () => onPaneSessionEnd(),
          onCancel: () => onPaneSessionCancel(),
        })
      } catch {
        paneDrag = null
        return
      }
    }
    // ⟨gate-4 re-audit finding — THE PANE PATH CONSUMES `begin`'s ANSWER (the gutter
    // path's own landed rule, §3.4: EXACTLY ONE ESTABLISHMENT PER GESTURE, AND A
    // `busy` ANSWER IS NEVER A FAILURE).⟩ The answer was previously DISCARDED, so a
    // refused establishment left the fork's `paneDrag` record and the `paneInstalled`
    // ledger entry live for a gesture no session holds — a state that later drags
    // read as `busy` with nothing reported. ONLY a refusal that means NO gesture
    // exists reverts the fork's record (the session's OWN start turn may already hold
    // the slot — the `busy` case, which is this very gesture, not a failure).
    const begun = session.begin(gestureEl)
    if (begun == null || (begun as { ok?: unknown }).ok !== true) {
      const code = begun == null ? 'refused' : (begun as { code?: unknown }).code
      if (code !== 'busy') {
        paneDrag = null
        try {
          host.cancelPaneDrag()
        } catch {
          // fail-soft — a throwing revert never breaks the renderer
        }
      }
    }
  } catch {
    // fail-soft — a throwing gesture never breaks the renderer
  }
}

/** Establish ONE gutter gesture. THE ORDER IS THE CONTRACT (§4 item (iii)): the fork
 *  records its own zone identity for the control on the CONTROLLER first (so the
 *  controller's establishment evaluation — axis, bounds, the FAIL-CLOSED
 *  resizability gate — runs inside the session's `begin`), and then the SESSION's own
 *  `begin` opens the gesture and takes the capture AFTER establishment and only
 *  because the control opted in. A refused establishment leaves the fork's record
 *  unset, so every terminal path is a no-op. Returns whether the gesture was
 *  established. */
function establishGutterGesture(
  state: GutterGestureState,
  session: ReturnType<typeof createGestureSession>,
  element: unknown,
): boolean {
  gutterGesture = state
  try {
    state.host.startGutter(state.zone, element)
    const begun = session.begin(element)
    if (begun != null && (begun as { ok?: unknown }).ok === true) return true
    // ⟨§3.4 — EXACTLY ONE ESTABLISHMENT PER GESTURE, AND A `busy` ANSWER IS NEVER A
    // FAILURE.⟩ Two routes can reach the session's `begin` for ONE gesture: the
    // element-backed source's own `pointerdown` turn (an already-installed control) and
    // this explicit one. Whichever loses reads `'busy'` while the SAME control holds the
    // slot — that is the gesture this fork record already describes, not a refused
    // establishment, so it must not be torn down (the tear-down is exactly what left the
    // gesture zoneless and its commit valueless). ONLY a refusal that means NO gesture
    // exists (‘not-installed’/‘disconnected’/‘disposed’/‘stale’) reverts the fork's record.
    const code = begun == null ? 'refused' : (begun as { code?: unknown }).code
    if (code === 'busy') return true
    gutterGesture = null
    state.host.cancelGutter()
    return false
  } catch {
    gutterGesture = null
    return false
  }
}

/** ADV3 — a new gesture supersedes an in-flight one cleanly: revert the PRIOR
 *  gesture (a pane drag → `cancelPaneDrag` so its reveal is re-hidden; a gutter →
 *  `cancelGutter`), then fully clear it before the new gesture starts. */
function revertPriorGesture(): void {
  const pane = paneDrag
  if (pane != null) {
    try {
      pane.host.cancelPaneDrag()
    } catch {
      // fail-soft — a throwing revert never breaks the wire-up
    }
    paneDrag = null
  }
  const gutter = gutterGesture
  if (gutter != null) {
    try {
      gutter.host.cancelGutter()
    } catch {
      // fail-soft
    }
    gutterGesture = null
  }
}

/** ADV2 — the document-delegated `lostpointercapture` handler. A pointer released
 *  without `pointerup`/`pointercancel` (dropped out of the window / capture lost)
 *  must NOT leak a stale gesture: the SESSION's own cancel terminal is taken, which
 *  detaches its tracking listeners and runs the fork's cancel hook — so a later
 *  UNRELATED event can never re-commit. A never-moved dropped pane drag is cleared
 *  without an extra seam write. */
function onLostPointerCapture(host: SidebarPanes): void {
  try {
    const pane = paneDrag
    if (pane != null) {
      // A never-moved dropped drag is cleared cleanly; a MOVED one re-hides its
      // reveal through the host seam (the same rule the pane path has always had).
      if (pane.moved) pane.host.cancelPaneDrag()
      paneDrag = null
    }
    const gutter = gutterGesture
    if (gutter != null) {
      gutter.host.cancelGutter()
      gutterGesture = null
    }
    // The sessions' own records are discarded through their cancel terminal, so no
    // stale gesture can survive a lost capture; a no-gesture session refuses and is
    // a no-op.
    if (paneSession?.gesture() != null) paneSession.cancel(paneCancelElement)
    if (gutterSession?.gesture() != null) gutterSession.cancel(paneCancelElement)
    void host
  } catch {
    // fail-soft
  }
}

/** Unit U-SHELL-N7 (W2-N7) — the shell pointer-wiring integration pass.
 *
 *  ⟨`U-ZONE-REPLACEMENT` / `PD-UI-14` — §3 rows 4/5: THE WIRING RE-POINTS AT THE
 *  VENDORED SESSION.⟩ The renderer keeps exactly what the family's own contract
 *  leaves to a consumer: the ONE delegated `pointerdown` (HOST-1, so chrome authored
 *  AFTER install still routes), the per-event element resolution through the fork's
 *  own `closest` call (`GESTURE_SELECTOR` — the module's bytes carry no selector),
 *  the fork's own surface rules (the pane HEADER is the grab surface, a BODY element
 *  is not), the opt-in CAPTURE CAPABILITY the injected source advertises, and the
 *  fork's own seam calls (`gutterSizeForPoint`/`toZoneBounds`/`dropZoneForPoint`).
 *  The gesture LIFECYCLE — establishment, the three tracking listeners, the
 *  terminal, the cancel and the at-most-once commit — is the SESSION's, installed PER
 *  CONTROL ELEMENT by identity (`§2 C-6`), never a per-event delegated selector
 *  resolution INSIDE the mechanism. The permanent `dblclick` reset and the
 *  `lostpointercapture` guard stay document-delegated (ADV1/ADV2) because they are
 *  not gesture turns: the reset must survive the gesture's own teardown, and the
 *  lost-capture guard's whole job is the case where no terminal arrives.
 *
 *  Fail-soft (F5/F11): no host, no DOM surface, a thrown `getBoundingClientRect`, or
 *  an unusable source degrades or no-ops; `installShellPointers` itself never throws
 *  (the app still boots). */
export function installShellPointers(host: SidebarPanes): void {
  if (host == null) return // F11 — no host (no-bridge plain-page mode) → no-op
  try {
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return
    // ADV4 — idempotent: a SECOND call on the SAME document is a no-op (no
    // duplicate delegated `pointerdown`/`dblclick`/`lostpointercapture`
    // registration), keeping the sessions single-homed per wired document.
    const currentDoc = document as unknown
    if (shellWiredDoc === currentDoc) return
    // The sessions are created ONCE per wired document, on the vendored factory.
    const wiredGutterSession = installGutterSession()
    installPaneSession()
    // ⟨§3.4(d) — ONE SESSION, ONE CONTROLLER, ONE WRITE.⟩ The host's gutter controller is
    // composed over THIS session (the only one with an element-backed source and the
    // per-control capture opt-in), so the controller's `commit` — the fork's ONE write
    // path — is reachable from the gesture the operator drives. FIRST-CONFIG-WINS: a
    // host that already carries a supplied session is left untouched.
    if (wiredGutterSession != null) {
      try {
        host.attachGutterGestureSession(gutterControlSession(wiredGutterSession))
      } catch {
        // fail-soft — a host that predates the seam keeps the declared inert composition
      }
    }
    // HOST-1 — ONE document-level DELEGATED `pointerdown` listener. The gesture
    // element is resolved per-event via `e.target.closest(GESTURE_SELECTOR)`,
    // so gutters/headers authored AFTER install (the real app authors the
    // gutter affordances on the producing graph and the pane chrome at render)
    // still route.
    document.addEventListener('pointerdown', (e) => {
      try {
        onDocumentPointerDown(host, e)
      } catch {
        // fail-soft — a throwing gesture never breaks the renderer
      }
    })
    // The pane drag's TRAVEL measure: the fork's own pointer-position reading. The
    // session's move turn hands the gesture handle, not the event, so the deferred
    // capture's travel check reads this coordinate. NOT a gesture authority: it
    // records a position and decides nothing.
    document.addEventListener('pointermove', (e) => {
      try {
        const ev = e as { clientX?: number; clientY?: number }
        if (typeof ev.clientX === 'number') lastPointerX = ev.clientX
        if (typeof ev.clientY === 'number') lastPointerY = ev.clientY
        // ⟨§3 row 3's `sizeFor` seam — THE FORK'S PER-MOVE GEOMETRY (§3.4(f): a caller
        // ROUTES INTO the one controller seam that carries the write).⟩ The element-backed
        // session's own move turn reaches the controller's hook on the ELEMENT's event
        // only, so an off-element move could never supply a size; the document sees every
        // move (on-element events bubble here), computes the candidate size from the
        // `.layout` rect read at establishment, and pushes it to the ONE value channel
        // (`host.moveGutter`). The module narrows it into the zone's window at the
        // terminal and the CONTROLLER writes it — nothing is written per move.
        const state = gutterGesture
        if (state != null) state.host.moveGutter(gutterSizeForPoint(state.layoutRect, state.zone, lastPointerPoint()))
      } catch {
        // fail-soft
      }
    })
    // ADV1 — a PERMANENT document-delegated `dblclick` (decoupled from the
    // gesture lifecycle, so a real two-click order down→up→down→up still
    // reaches it — the reset is reachable after the 2nd pointerup).
    document.addEventListener('dblclick', (e) => {
      try {
        onGestureDblclick(host, e)
      } catch {
        // fail-soft — a throwing dblclick never breaks the renderer
      }
    })
    // ADV2 — a document-delegated `lostpointercapture` so a pointer released
    // without `pointerup`/`pointercancel` reverts + clears the gesture (never
    // leaks a stale gesture or its listeners).
    document.addEventListener('lostpointercapture', () => {
      try {
        onLostPointerCapture(host)
      } catch {
        // fail-soft — a throwing revert never breaks the renderer
      }
    })
    shellWiredDoc = currentDoc // wired exactly once on THIS document
  } catch {
    // F11 — never break boot on any DOM/wiring failure
  }
}

async function main(): Promise<void> {
  const mount = document.getElementById('app')
  if (!mount) throw new Error('mount #app missing')
  const bridge = window.provident
  // Unit U-SHELL-2 §2.4 (W1-N1) — apply the persisted theme + watch the OS
  // preference live (`system`) before any graph mount.
  installTheme()
  // W2-N3 (AF-3) — apply the persisted layout geometry to the shell grid before
  // any graph mount (the index.html fallbacks pin the defaults until then).
  installLayout()
  // Read the persisted operator config (maxJournalLength) so the app Runtime's
  // Supervisor is constructed with the journal-condense threshold. The config
  // is manual-UI-only (never an MCP tool); the Runtime reads it at boot.
  let maxJournalLength: number | undefined
  if (bridge?.security) {
    try {
      const cfg = await bridge.security.get()
      maxJournalLength = cfg.maxJournalLength
    } catch {
      // keep the default (never condense) on a bridge error
    }
  }
  // Unit K §5.1 — the placeholder bootstrap envelope: the default content-window
  // template envelope (a bare `wiki-root` + one `main` zone container, NO content
  // payloads) so the Runtime is constructible synchronously. The `demoEnvelope()`
  // bootstrap is REMOVED — the SidebarPanes host loads the pane-inclusive
  // envelope (derived from the RAG store + the stored template) at boot.
  const placeholderEnvelope: LegacyInitialData = {
    template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
  const runtime = new Runtime({ mount, envelope: placeholderEnvelope, maxJournalLength })
  runtime.bootstrap()
  if (!bridge) {
    console.warn('[provident-renderer] no preload bridge — MCP endpoints unavailable (running as a plain page?)')
    return
  }
  // Unit U-SHELL-9a §2.7 — the shell top-bar tab strip (the shared
  // focus-selection seam). Boot: read the persisted `OperatorSettings.tabs`
  // (fail-soft), materialize the first-tab default when the set is empty, then
  // render. The MCP `provident.focus` tool routes to `tabStrip.focus` (the
  // renderer's `focus` RPC method — no app-graph-changed).
  const tabMount = document.getElementById('tab-strip')
  const tabBridge = (bridge as unknown as {
    operatorSettings?: {
      get?(): Promise<{ tabs?: unknown }>
      set?(patch: { tabs?: unknown }): Promise<unknown>
    }
  }).operatorSettings
  // U-SHELL-9a §2.3 (HOST-1) — the host owns the active tab's stage body. It is
  // constructed below (after the tab strip); the closures read it lazily so the
  // strip can be built first.
  let host: SidebarPanes | null = null
  tabStrip = new TabStrip({
    mount: tabMount,
    // HOST-2 — the REAL default-resolution context (the focused store's
    // documents + the previous session's last-focused document), read from the
    // host once it has booted. Empty until then (the first tab is materialized
    // after boot — see `bootTabs`).
    getContext: () => host?.getTabContext() ?? { hasStore: false, documents: [] },
    persist: (tabs) => {
      void tabBridge?.set?.({ tabs })
    },
    // HOST-1 — mount the active tab's body (and unmount the previous).
    onActiveChange: (entry) => {
      if (host) host.mountTab(entry)
    },
  })
  // HOST-1/HOST-2 — the tab boot: load the persisted tab set, materialize the
  // first-tab default from the REAL context, then mount the active body. Runs
  // AFTER the host boot so the store/doc-heads snapshot is available.
  const bootTabs = async (): Promise<void> => {
    if (!tabStrip) return
    try {
      const settings = await tabBridge?.get?.()
      tabStrip.load(settings?.tabs)
    } catch {
      tabStrip.load(undefined)
    }
    tabStrip.ensure()
    if (host) host.mountTab(tabStrip.active())
  }
  // The operator-only Security + Debug panes render in their OWN isolated
  // provident graph (secure-panels.ts) — a separate GraphScope, so the MCP
  // endpoints (which read the app Runtime) can never see/dispatch them.
  //
  // W1-N6 (PG12) — wire the operator-only module-tool runner: list the live
  // main-process `CapabilityRouter`'s tools over IPC (boot snapshot — the list is
  // authored into the isolated pane graph at construction) and invoke a selected
  // tool through the main-process two-gate (`module` AND `code`). Operator scope
  // only: this runner never appears in the app graph and is never an MCP tool.
  const moduleBridge = (bridge as unknown as {
    module?: {
      listTools?(): Promise<string[]>
      invoke?(tool: string, args: unknown): Promise<unknown>
    }
  }).module
  let moduleToolNames: string[] = []
  try {
    moduleToolNames = (await moduleBridge?.listTools?.()) ?? []
  } catch {
    // keep the empty list on a bridge error → the '(no module tools)' placeholder
    moduleToolNames = []
  }
  const moduleRunner = {
    listTools: (): string[] => moduleToolNames,
    invoke: (tool: string, args: unknown): unknown => {
      // Fail-closed: an older bridge without the runner surface must not read as
      // a successful no-op — surface a real error to the operator.
      if (!moduleBridge?.invoke) throw new Error('module-tool bridge unavailable')
      return moduleBridge.invoke(tool, args)
    },
  }
  const panesMount = document.getElementById('panes')
  const panels = panesMount ? new SecurePanels(panesMount, { moduleRunner }) : null
  if (panels) {
    void panels.refresh()
    // the Debug pane's live census + SSR preview, sourced from the APP graph
    panels.refreshDebug(runtime)
  }
  bridge.onRequest((req) => {
    void handleRequest(runtime, req, (p) => bridge!.notify(p)).then((reply) => {
      panels?.refreshDebug(runtime)
      bridge.sendReply(reply)
    })
  })
  // Unit D §5.1.9/§5.1.10 — the re-traversal trigger. On `rag-store-changed`
  // (broadcast by main after ANY successful RAG-store mutation via an MCP
  // `edit.*` tool OR a UI commit-on-blur), the renderer calls `requestRebuild()`
  // on the edit controller (the dirty-edit guard queues it if a control is
  // dirty). The injected `commit` routes through the SAME edit op (`setContent`)
  // as the MCP tool (MCP/UI equivalence — §5.7).
  //
  // Finding 3 — the re-traversal is REAL (not a no-op). `onRebuild` fetches the
  // RAG store snapshot over the `rag-snapshot` IPC, re-derives the graph via
  // `buildTraversal` (Unit C), and feeds the resulting back-reference map back
  // into the controller's `backRefs` (the SOLE authoritative carrier, §5.3).
  // The controller holds the SAME Map reference, so mutating it in place is
  // visible to `isEditable`/`commit`/`restoreCaret`. The re-traversal is
  // fire-and-forget (the `onRebuild` signature is sync); a fetch/re-derive
  // failure leaves the current backRefs in place (never a crash).
  const backRefs = new Map<string, string[]>()
  // Unit K §5.1 step 4 — the edit controller's `onRebuild` IS the host's
  // `reDerive` (the pane-inclusive re-traversal). `host` is declared above (so
  // the tab-strip closures can reference it); the closure only runs after the
  // host is constructed + booted (a store change → requestRebuild → reDerive).
  const editController = createEditController({
    backRefs,
    commit: (nodeId, content) => bridge!.edit!.commit(nodeId, content),
    onRebuild: (kind) => void host?.reDerive(kind),
  })
  // Unit K §5.1 — the SidebarPanes host. The renderer constructs the host with
  // the app mount (#app), the operator mount (#operator-panes — a NEW element,
  // NOT #panes which stays SecurePanels'; M3), the pane registry, the bridge,
  // the backRefs map, and the edit controller. The host owns the current-
  // document/node state. Then calls `host.boot(runtime)` (the pane-inclusive
  // envelope replaces the demoEnvelope() bootstrap). The host's boot subscribes
  // to rag-store-changed/template-changed and routes them through the edit
  // controller's dirty-edit guard → reDerive (the SOLE subscription; the old
  // renderer-level onRagStoreChanged closure is removed to avoid double-firing).
  const operatorMount = document.getElementById('operator-panes')
  const registry = createPaneRegistry()
  const pvBridge = bridge as never as {
    gnosis: {
      status(): Promise<import('../main/engine-rag-store.js').HealthReport>
      query(query: string, opts?: Record<string, unknown>): Promise<import('../main/engine-rag-store.js').EngineRagResult>
      // Unit A2 §5.5 — the document/wiki CRUD bridge surface (the SAME
      // `handleGnosisTool` handler as the `gnosis.document.*`/`gnosis.wiki.*`
      // MCP tools — MCP/UI equivalence).
      documents(tool: string, args: Record<string, unknown>): Promise<unknown>
      wikis(tool: string, args: Record<string, unknown>): Promise<unknown>
    }
    security: { get(): Promise<import('../shared/types.js').SecuritySettings> }
  }
  // Unit GN-MCP-UI §5.5 — the D4-parity gnosis GUI panes. Registered into the
  // SHARED registry BEFORE SidebarPanes.boot so the sidebars assemble the
  // `gnosis-status` operator pane (isolated scope, MCP-invisible) + the
  // `gnosis-query` app-graph pane (fail-closed on the `gnosis` group) into the
  // app-graph/operator envelopes. The pane handlers reach the bridge via
  // `window.provident.sidebar.gnosisStatus`/`gnosisQuery` (the M2 pattern).
  const gnosisPanes = new GnosisPanes({
    registry,
    bridge: pvBridge,
    // Re-render the pane-inclusive envelopes after a status/query settles so the
    // updated gnosis data renders (the host re-assembles + re-mounts).
    onChanged: () => {
      if (host) void host.refresh()
    },
  })
  gnosisPanes.registerPanes()
  // Unit A2 §5.5 — the D4-parity gnosis document-editor/wiki GUI panes.
  // Registered into the SHARED registry BEFORE SidebarPanes.boot so the
  // sidebars assemble the `gnosis-documents` + `gnosis-wikis` app-graph panes
  // (fail-closed on the `gnosis`/`gnosis-edit` groups) into the app-graph
  // envelope. The pane handlers reach the bridge via
  // `window.provident.sidebar.gnosisDocuments`/`gnosisWikis` (the M2 pattern).
  const gnosisCrudPanes = new GnosisCrudPanes({
    registry,
    bridge: pvBridge,
    // Re-render the pane-inclusive envelopes after a document/wiki call settles
    // so the updated CRUD data renders (the host re-assembles + re-mounts).
    onChanged: () => {
      if (host) void host.refresh()
    },
  })
  gnosisCrudPanes.registerPanes()
  host = new SidebarPanes({
    mount,
    operatorMount: operatorMount as HTMLElement,
    registry,
    bridge: bridge as never,
    backRefs,
    editController,
    gnosis: {
      status: () => gnosisPanes.refreshStatus(),
      query: (value: string) => gnosisPanes.submitQuery(value),
    },
    // Unit U-SHELL-9a §2.6 — the search-pane delegates: expand-to-tab
    // (HOST-1 seam), result open → NEW document tab (HOST-4), and the in-tab
    // query reuse (HOST-5).
    tabs: {
      expandSearchTab: (query: string) => { tabStrip?.expandSearchTab(query) },
      openDocumentTab: (id: string) => { tabStrip?.openDocumentTab(id) },
      editSearchQuery: (tabId: string, params) => { tabStrip?.editSearchQuery(tabId, params) },
    },
  })
  // Unit U-SHELL-N7 (W2-N7) — attach the shell pointer wiring ONCE after the
  // host is constructed. This hooks the C7 gutter resize + C4 drag/reorder/
  // relocate gestures (with C11 reveal/C12 minimize) to the existing host seams;
  // the host boot below populates the layout the gestures read. Shell chrome
  // only — the wiring never re-renders or writes the graph itself (§2.7).
  installShellPointers(host)
  // Unit U-SHELL-7 (C3) — host the EXISTING operator-only mounts
  // (`#panes` = SecurePanels, `#operator-panes` = the SidebarPanes operator
  // graph) inside the settings modal + wire the toggle/Escape/scrim affordances.
  // Runs AFTER installShellPointers and after both mounts exist (§2.6).
  installSettingsModal()
  // HOST-1/HOST-2 — boot the host first so the store/doc-heads snapshot is
  // available, then load the persisted tabs + materialize the default + mount
  // the active body (the real default context). The host boot is not blocked.
  // U-APP-HARNESS-READINESS §2.2 `B-1` item 4 — this chain's completion IS
  // the app's own definition of "the initial graph install completed", so the
  // SAME boundary reports it to main (the boot-install observable), and the
  // `.catch(...)` reports the failure BY NAME (`F-4`). The renderer does not
  // wait for anything: the signal is fire-and-forget, and main's observable is
  // a state a client polls.
  //
  // THE BLOCKING HOST FINDING (`U-APP-HARNESS-READINESS` `A-1` /
  // `U-DIVERGENCE-FIXTURE` `A-1`, the same code path) — the tab chain is now
  // AWAITED INSIDE this chain, for two reasons that are both properties of the
  // signal's MEANING ("no further boot-time graph install follows `installed`"):
  //   1. `bootTabs()` is `async` and awaits the persisted-tab read BEFORE
  //      `host.mountTab(...)` — and for a non-document tab that mount reaches
  //      `applyStageBody` → `loadAppGraph` → `runtime.loadEnvelope`, i.e. a
  //      SECOND whole-graph replacement. Signalling `ok: true` before it settled
  //      let that install land AFTER the signal, unordered against a client that
  //      trusted it (the leg's `waitForBootInstalled` → load race).
  //   2. The un-awaited call owned no rejection: a throw inside `bootTabs()`
  //      (e.g. `host.mountTab(...)`) never reached the `.catch(...)` below, so
  //      the `ok:false` arm never fired and `boot.status` stayed `pending`
  //      forever — the `F-4` violation. Awaiting it puts the tab chain inside
  //      this chain's own rejection path.
  // Nothing else moves: the chain still runs after the host boot and after the
  // settings-modal install seam above, and the signal is still fire-and-forget.
  void host
    .boot(runtime)
    .then(async () => {
      await bootTabs()
      bridge.bootSettled?.({ ok: true })
    })
    .catch((e) => {
      console.error('[provident-renderer] tab boot failed', e)
      bridge.bootSettled?.({ ok: false, error: `tab boot failed: ${e instanceof Error ? e.message : String(e)}` })
    })
  void gnosisPanes.boot()
  void gnosisCrudPanes.boot()
  bridge.ready()
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void main())
  } else {
    void main()
  }
}