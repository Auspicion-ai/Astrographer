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
import { createEditController } from './edit-controller.js'
import { applyThemeToRoot } from './theme.js'
import { applyLayoutToRoot, type LayoutState, type LayoutZoneName } from './layout-state.js'
import { TabStrip } from './tab-strip.js'
import type { RpcRequest, RpcReply } from '../shared/types.js'

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
type ActiveGesture =
  | {
      kind: 'gutter'
      host: SidebarPanes
      zone: LayoutZoneName
      layoutRect: GestureRect
      /** ADV2 — the originating pointer's id; a stale/lost pointer of a
       *  DIFFERENT id must never act on this gesture. */
      pointerId: number | null
    }
  | {
      kind: 'pane'
      host: SidebarPanes
      paneId: string
      lastZones: readonly ZoneBounds[]
      moved: boolean
      /** ADV2 — the originating pointer's id (see the gutter variant). */
      pointerId: number | null
    }

/** The delegated gesture-element selector (HOST-1). Resolved per `pointerdown`
 *  via `e.target.closest(...)` so gutters/frames authored AFTER install —
 *  the real app authors them at render — still route. No colon-bearing
 *  compound (the dom-shim `closest` rejects `[on:...]` selectors). */
const GESTURE_SELECTOR = '.gutter[data-zone], .pane-frame[data-pane-id]'

/** The delegated gutter element for the PERMANENT `dblclick` reset (ADV1) —
 *  resolved separately from the pointerdown selector so a double-click is
 *  decoupled from the gesture lifecycle. */
const GUTTER_SELECTOR = '.gutter[data-zone]'

/** The module-level active gesture (null when none — HOST-2/HOST-4). */
let activeGesture: ActiveGesture | null = null

/** ADV4 — the document instance `installShellPointers` is currently wired onto.
 *  Tied to the DOCUMENT (not a bare boolean) so each fresh document/install
 *  (per renderer boot, and per adversarial shim test) still registers exactly
 *  once, while a redundant second call on the SAME document is a no-op. The
 *  module-global `activeGesture` stays single-homed per wired document. */
let shellWiredDoc: unknown = null

/** True only for the four real layout zones. HOST-5 — a malformed `'bogus'`
 *  value must never be coerced into a real `left` `ZoneBounds`. */
function isLayoutZoneNameValue(value: unknown): value is LayoutZoneName {
  return value === 'left' || value === 'right' || value === 'header' || value === 'footer'
}

/** HOST-2 — register the per-gesture move/up/cancel handlers EXACTLY ONCE for
 *  the current gesture, removing any lingering prior handlers first so a second
 *  gesture never accumulates stale ones. The `dblclick` reset is NOT here (ADV1):
 *  it fires AFTER the second `pointerup` in a real two-click order, so tying it
 *  to the gesture lifecycle made it unreachable — it is a PERMANENT
 *  document-delegated listener registered in `installShellPointers` instead. */
function beginGesture(): void {
  if (typeof document?.addEventListener !== 'function') return
  // reset-guard — a previous gesture's teardown already removed these; removing
  // first is belt-and-suspenders against stale accumulation.
  document.removeEventListener('pointermove', onGestureMove)
  document.removeEventListener('pointerup', onGestureUp)
  document.removeEventListener('pointercancel', onGestureCancel)
  document.addEventListener('pointermove', onGestureMove)
  document.addEventListener('pointerup', onGestureUp)
  document.addEventListener('pointercancel', onGestureCancel)
}

/** HOST-2 — tear down the per-gesture listeners + clear the active gesture at
 *  the end of a gesture. Called from the `up`/`cancel`/supersede/lost-pointer
 *  paths. The permanent delegated `dblclick` is NOT torn down here (ADV1). */
function clearGesture(): void {
  activeGesture = null
  if (typeof document?.removeEventListener !== 'function') return
  document.removeEventListener('pointermove', onGestureMove)
  document.removeEventListener('pointerup', onGestureUp)
  document.removeEventListener('pointercancel', onGestureCancel)
}

/** The document-level `pointermove` — routes the active gesture's move through
 *  the module-level record (HOST-4 survives a frame re-mount). ADV2: a move from
 *  a DIFFERENT pointer than the one that started the gesture is ignored —
 *  a stale/lost gesture never acts on an unrelated pointer's events. */
function onGestureMove(e: { clientX?: number; clientY?: number; pointerId?: number } | null): void {
  const g = activeGesture
  if (g == null) return
  if (g.pointerId != null && e?.pointerId != null && g.pointerId !== e.pointerId) return // ADV2 — not our pointer
  try {
    const x = typeof e?.clientX === 'number' ? e.clientX : 0
    const y = typeof e?.clientY === 'number' ? e.clientY : 0
    if (g.kind === 'gutter') {
      g.host.moveGutter(gutterSizeForPoint(g.layoutRect, g.zone, { x, y }))
    } else {
      const point = { x, y }
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
        // HOST-5 — fail-closed: project ONLY a real LayoutZoneName. A malformed
        // `'bogus'` value is SKIPPED, never coerced into a `left` drop target.
        const dataZone = typeof el.getAttribute === 'function' ? el.getAttribute('data-zone') : null
        if (!isLayoutZoneNameValue(dataZone)) continue
        if (typeof el.getBoundingClientRect === 'function') {
          zones.push(toZoneBounds(dataZone, el.getBoundingClientRect()))
        }
      }
      g.lastZones = zones
      g.moved = true
      g.host.movePaneDrag(point, zones)
    }
  } catch {
    // fail-soft — a throwing move never breaks the gesture stream
  }
}

/** The document-level `pointerup` — one commit (or abort) per gesture, then the
 *  HOST-2 teardown. ADV2: a `pointerup` from a different/lost pointer is a no-op. */
function onGestureUp(e: { clientX?: number; clientY?: number; pointerId?: number } | null): void {
  const g = activeGesture
  if (g == null) return
  if (g.pointerId != null && e?.pointerId != null && g.pointerId !== e.pointerId) return // ADV2 — not our pointer
  try {
    if (g.kind === 'gutter') {
      g.host.endGutter()
    } else {
      const point = {
        x: typeof e?.clientX === 'number' ? e.clientX : 0,
        y: typeof e?.clientY === 'number' ? e.clientY : 0,
      }
      if (!g.moved) {
        g.host.cancelPaneDrag()
        return
      }
      const zone = dropZoneForPoint(point, g.lastZones, 24)
      if (zone == null) {
        g.host.cancelPaneDrag() // F1 — outside any zone → abort, no mutation
      } else {
        g.host.commitPaneDrop({ paneId: g.paneId, zone })
      }
    }
  } catch {
    // fail-soft
  } finally {
    clearGesture()
  }
}

/** The document-level `pointercancel` — revert the gesture (F4). ADV2: a
 *  `pointercancel` from a different/lost pointer is a no-op. */
function onGestureCancel(e: { pointerId?: number } | null): void {
  const g = activeGesture
  if (g == null) return
  if (g.pointerId != null && e?.pointerId != null && g.pointerId !== e.pointerId) return // ADV2 — not our pointer
  try {
    if (g.kind === 'gutter') g.host.cancelGutter() // F4 — revert, no commit
    else g.host.cancelPaneDrag() // re-hide with one final write, no mutation
  } catch {
    // fail-soft
  } finally {
    clearGesture()
  }
}

/** ADV3 — a new gesture supersedes an in-flight one cleanly: revert the PRIOR
 *  gesture (a pane drag → `cancelPaneDrag` so its reveal is re-hidden; a gutter
 *  → `cancelGutter`), then fully clear it before the new gesture starts. */
function revertPriorGesture(): void {
  const prior = activeGesture
  if (prior == null) return
  try {
    if (prior.kind === 'gutter') prior.host.cancelGutter()
    else prior.host.cancelPaneDrag()
  } catch {
    // fail-soft — a throwing revert never breaks the wire-up
  }
  clearGesture()
}

/** ADV2 — the document-delegated `lostpointercapture` handler. A pointer
 *  released without `pointerup`/`pointercancel` (dropped out of the window /
 *  capture lost) must NOT leak a stale gesture: when the active gesture's
 *  `pointerId` matches the event's, revert any gesture that actually MOVED
 *  (a moved pane drag → `cancelPaneDrag` to re-hide its reveal; a gutter →
 *  `cancelGutter`) and then `clearGesture()` — tearing down the per-gesture
 *  listeners so a later UNRELATED event can never re-commit. A never-moved
 *  dropped gesture is cleared cleanly without an extra seam write. */
function onLostPointerCapture(e: { pointerId?: number } | null): void {
  const g = activeGesture
  if (g == null) return
  if (g.pointerId != null && e?.pointerId != null && g.pointerId !== e.pointerId) return // not our pointer — leave it alone
  try {
    if (g.kind === 'gutter') g.host.cancelGutter()
    else if (g.moved) g.host.cancelPaneDrag() // reveal re-hidden only if the drag actually moved
  } catch {
    // fail-soft
  } finally {
    clearGesture() // never leak the stale gesture or its listeners
  }
}

/** The PERMANENT document-delegated `dblclick` (ADV1) — the gutter double-click
 *  reset, decoupled from the gesture lifecycle. Resolves the gutter via
 *  `.gutter[data-zone]` and, ONLY for a real layout zone, calls
 *  `host.resetGutter(dataZone)`. Fail-soft, never throws. */
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
 * install), then starts the gutter or pane gesture with exactly-once per-gesture
 * move/up/cancel/dblclick listeners (HOST-2) routed through the module-level
 * active-gesture record (HOST-4). TOTAL + fail-soft — never throws. */
function onDocumentPointerDown(host: SidebarPanes, e: unknown): void {
  if (host == null) return
  try {
    const target = (e as { target?: unknown })?.target
    if (target == null) return
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
    const dataPaneId = typeof gestureEl.getAttribute === 'function' ? gestureEl.getAttribute('data-pane-id') : null
    const pointerId = (e as { pointerId?: number })?.pointerId

    // Gutter gesture — the matched element carries a real layout `data-zone`.
    if (isLayoutZoneNameValue(dataZone)) {
      // read the `.layout` rect ONCE per gesture
      let layoutRect: GestureRect | null = null
      if (typeof document?.querySelector === 'function') {
        const layoutRoot = document.querySelector('.layout') as { getBoundingClientRect?: () => GestureRect } | null
        if (layoutRoot && typeof layoutRoot.getBoundingClientRect === 'function') {
          layoutRect = layoutRoot.getBoundingClientRect()
        }
      }
      if (layoutRect == null) return
      // ADV3 — a new gutter gesture supersedes any in-flight one first (a prior
      // pane drag's reveal is re-hidden, a prior gutter is reverted).
      revertPriorGesture()
      host.startGutter(dataZone)
      if (host.activeGutter() !== dataZone) return // §2.3 gate — empty/minimized zone: no gesture
      try {
        if (pointerId != null && typeof gestureEl.setPointerCapture === 'function') {
          gestureEl.setPointerCapture(pointerId) // F5 fail-soft
        }
      } catch {
        // capture unavailable/throws — proceed on the non-captured listeners
      }
      activeGesture = { kind: 'gutter', host, zone: dataZone, layoutRect, pointerId: pointerId ?? null }
      beginGesture()
      return
    }

    // Pane-drag gesture — the matched element carries a stable `data-pane-id`.
    if (dataPaneId != null && dataPaneId !== '') {
      if (isInteractiveControl(target as Element | null)) return // F9/HOST-3/ADV5 — never hijack a control
      // ADV3 — a new pane drag supersedes any in-flight one first (a prior pane
      // drag is cancelled so its reveal is re-hidden, a prior gutter is reverted).
      revertPriorGesture()
      host.startPaneDrag(dataPaneId)
      try {
        if (pointerId != null && typeof gestureEl.setPointerCapture === 'function') {
          gestureEl.setPointerCapture(pointerId) // F5 fail-soft
        }
      } catch {
        // capture unavailable/throws — degrade, never throw
      }
      activeGesture = { kind: 'pane', host, paneId: dataPaneId, lastZones: [], moved: false, pointerId: pointerId ?? null }
      beginGesture()
    }
  } catch {
    // fail-soft — a throwing gesture never breaks the renderer
  }
}

/** Unit U-SHELL-N7 (W2-N7) — the shell pointer-wiring integration pass. Real
 *  DOM pointer listeners (`pointerdown`/`pointermove`/`pointerup`/
 *  `pointercancel` with `setPointerCapture`) + `getBoundingClientRect` rect math
 *  that feed the EXISTING §2.1 host seams: the C7 gutter resize
 *  (`startGutter`/`moveGutter`/`endGutter`/`cancelGutter`/`resetGutter`) and the
 *  C4 pane drag/reorder/relocate with the C11 reveal + C12 minimize hooks
 *  (`startPaneDrag`/`movePaneDrag`/`commitPaneDrop`/`cancelPaneDrag`). This is
 *  SHELL CHROME (the one AGENTS.md exception to the provident-framework UI
 *  constraint), so raw DOM wiring is permitted here and nowhere else. The
 *  pointer→seam argument mapping rides the THREE NEW pure helpers (§2.2) —
 *  `gutterSizeForPoint`/`toZoneBounds`/`dropZoneForPoint` — never inlined. The
 *  wiring introduces ZERO graph writes: every gesture-state write flows through
 *  the controllers (no per-move render/render, no direct `setLayout`).
 *
 *  Fail-soft (F5/F11): no host, an environment without the DOM surface, a thrown
 *  `getBoundingClientRect`/`setPointerCapture`, or a throwing engine → the
 *  gesture degrades or no-ops; `installShellPointers` itself never throws (the
 *  app still boots). The DELEGATED `pointerdown` attaches ONCE at renderer boot
 *  (after the host is constructed, HOST-1) and resolves the gesture element per
 *  event, so the real app's render-time-authored `.gutter[data-zone]` /
 *  `.pane-frame[data-pane-id]` chrome is always reachable (HOST-1). The
 *  per-gesture move/up/cancel/dblclick listeners are registered exactly once and
 *  torn down on gesture end (HOST-2), routed through the module-level
 *  active-gesture record so a re-mount survives (HOST-4). */
export function installShellPointers(host: SidebarPanes): void {
  if (host == null) return // F11 — no host (no-bridge plain-page mode) → no-op
  try {
    if (typeof document === 'undefined' || typeof document.addEventListener !== 'function') return
    // ADV4 — idempotent: a SECOND call on the SAME document is a no-op (no
    // duplicate delegated `pointerdown`/`dblclick`/`lostpointercapture`
    // registration), keeping the module-global `activeGesture` single-homed.
    const currentDoc = document as unknown
    if (shellWiredDoc === currentDoc) return
    // HOST-1 — ONE document-level DELEGATED `pointerdown` listener. The gesture
    // element is resolved per-event via `e.target.closest(GESTURE_SELECTOR)`,
    // so gutters/frames authored AFTER install (the real app authors the `.gutter`
    // elements and the frame `data-pane-id` only at render) still route.
    document.addEventListener('pointerdown', (e) => {
      try {
        onDocumentPointerDown(host, e)
      } catch {
        // fail-soft — a throwing gesture never breaks the renderer
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
    document.addEventListener('lostpointercapture', (e) => {
      try {
        onLostPointerCapture(e as { pointerId?: number } | null)
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
  // HOST-1/HOST-2 — boot the host first so the store/doc-heads snapshot is
  // available, then load the persisted tabs + materialize the default + mount
  // the active body (the real default context). The host boot is not blocked.
  void host.boot(runtime).then(() => bootTabs()).catch((e) => {
    console.error('[provident-renderer] tab boot failed', e)
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