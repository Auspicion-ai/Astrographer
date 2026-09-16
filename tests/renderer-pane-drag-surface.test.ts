// tests/renderer-pane-drag-surface.test.ts — TestWriter RED set for defect
// **F-1 PANE-BODY-GESTURE-SWALLOWED** (docs/defects.md, live-confirmed
// 2026-09-15) + the pinned design's U-3 delta row
// (`docs/specs/user-flow-audit.md` §2 U-3: "The pane-drag gesture surface is
// the pane HEADER only — a click in the pane BODY is never hijacked").
//
// ============================================================================
// THE DEFECT (what this file pins, from the live evidence — NOT from src/)
// ============================================================================
// A REAL mouse click on any CLICKABLE provident row/control INSIDE an
// app-graph pane BODY is swallowed: the pane-drag gesture handler claims the
// pointer (`gestureEl.setPointerCapture(pointerId)` on `.pane-frame`) and the
// gesture's `click` retargets to `.pane-frame`, so the row's own handler never
// runs. Live probe: `pointerdown:<li>` → `click:pane-doc-nav` (the row's
// synthetic `.click()` works — the handler + dispatch seam are intact; only the
// REAL gesture dies).
//
// THE PINNED DESIGN (the Implementer's fix — asserted here, never written here):
//   1. The pane-drag GESTURE SURFACE is the pane HEADER region only — the
//      pane's `.pane-collapse-toggle` strip inside a
//      `.pane-frame[data-pane-id]` — NEVER the pane BODY. A `pointerdown` on a
//      pane-body element (an `li`, a `p`, an `input`, any provident-compiled
//      element carrying `data-node-id`) must NOT start a pane drag: no
//      `setPointerCapture`, no `startPaneDrag`.
//   2. A `pointerdown` on the pane HEADER still starts the pane drag for that
//      pane id; the pane id comes from the header's PARENT FRAME; the
//      `setPointerCapture` target stays the FRAME element (so the existing
//      pointermove/up/cancel routing is unchanged).
//   3. A gutter `pointerdown` (`.gutter[data-zone]`) is unchanged.
//   4. Fail-soft semantics unchanged (no host / malformed / missing
//      attributes / throwing `getBoundingClientRect` / `setPointerCapture` →
//      degrade, never throw).
//   5. The collapse-toggle CLICK still works. PINNED (supervisor decision F-1,
//      2026-09-15): the resolved HEADER surface is the pane's explicit GRAB
//      SURFACE and is EXEMPT from the `isInteractiveControl` guard (the guard
//      stays armed for the pane BODY), AND the gesture does NOT capture the
//      pointer at the pointerdown — capture is DEFERRED past a 4px travel
//      threshold (`PANE_DRAG_CAPTURE_THRESHOLD`), because an immediate capture
//      on the frame retargets the gesture's own `click` to the frame and makes
//      the header toggle inert. A pure header click therefore toggles; a header
//      DRAG still relocates the pane.
//
// ============================================================================
// STATE ENUMERATION (one valid/happy-path test per reasonable data state)
// ============================================================================
//   S1  frame + header (the REAL app shape: `button.pane-collapse-toggle` with
//       its own `data-pane-id`, inside `.pane-frame[data-pane-id]`) — the
//       header IS the gesture surface: the drag starts for the FRAME's id and
//       capture is requested on the FRAME.
//   S2  frame + header, non-interactive wrapper around the toggle (the gesture
//       surface resolves via an ancestor `.pane-collapse-toggle`, e.g. a header
//       STRIP wrapping the toggle) — same outcome.
//   S3  frame + header + EXPANDED body (`li[data-document-id][data-node-id]`,
//       a `p[data-node-id]`, an `input`) — a body `pointerdown` is NOT a pane
//       drag, and the row's own `click` handler runs (event NOT retargeted).
//   S4  frame with NO header (a malformed/foreign body) — a frame `pointerdown`
//       is NOT a pane drag (the frame element itself is no longer a gesture
//       surface).
//   S5  COLLAPSED frame (header only, no body) — the header gesture still
//       starts.
//   S6  gutter (`.gutter[data-zone='left']`) — unchanged: gutter gesture starts,
//       capture requested on the gutter.
//   S7  cross-surface ORDER: a gutter pointerdown supersedes an in-flight
//       BODY-initiated... (a) an in-flight HEADER pane drag (ADV3 unchanged).
//
// ============================================================================
// FAIL-STATE ENUMERATION (one fail-safe test per documented fail-state)
// ============================================================================
//   F-a  header with NO parent frame (`body > button.pane-collapse-toggle`) →
//        no pane id resolvable → zero seam calls, zero capture, never throws.
//   F-b  frame with NO `data-pane-id` → zero seam calls, zero capture, no throw.
//   F-c  frame with an EMPTY `data-pane-id=''` → zero seam calls, no throw.
//   F-d  `pointerdown` with NO `pointerId` → no capture requested, never throws.
//   F-e  `setPointerCapture` THROWS on the frame → no throw, the drag's
//        move/up routing still completes off capture.
//   F-f  `setPointerCapture` THROWS on the GUTTER → no throw, the gutter
//        gesture still completes.
//   F-g  `getBoundingClientRect` THROWS on the zone container → no throw, the
//        move degrades (zero projected zones), a `pointerup` still commits/
//        cancels exactly once.
//   F-h  a `pointerdown` on a DETACHED header (no parent) never throws.
//
// ============================================================================
// NOT-TESTABLE at this layer (recorded, NOT asserted — do NOT weaken the pins)
// ============================================================================
//   - The dom-shim does NOT simulate pointer-capture RETARGETING (the F-1
//     mechanism at the engine level): only the `setPointerCapture(pointerId)`
//     CALL is observable. S3 therefore pins the two things that ARE observable
//     and that the capture caused: (i) no drag starts from a body pointerdown
//     and (ii) a body control's own `click` handler still fires with itself as
//     `target` (never a `.pane-frame` retarget). The engine-level retarget
//     itself is a LIVE-only assertion (RCA-12 — envelope-green is not
//     app-green); it is covered by `scripts/live-drive.mjs` blocks
//     `uf_panes_12` / `uf_panes_14`.
//   - Real CSS grid/track geometry: only the rects a test configures via
//     `setRect` are observed.
//
// ============================================================================
// RED / GREEN-on-arrival inventory
// ============================================================================
//   RED (the fix is absent — `GESTURE_SELECTOR` still matches
//        `.pane-frame[data-pane-id]`, so a BODY pointerdown starts a pane drag):
//     S1, S2, S3 (a/b/c), the complementary frame-body negative, F-a..F-d
//     (a body/frame pointerdown is a drag today, so the "no seam call"
//     assertions fail), F-e (the capture target is the frame, never the header),
//     F-h.
//   GREEN-on-arrival (guards against regression once the fix lands):
//     S4 (today's frame matches, but a header-less frame dispatch is expected
//     to be inert after the fix — pinned so the fix cannot leave the frame as a
//     surface), S5/S6/S7 (assertions on paths the fix must NOT change), F-f/F-g
//     (fail-soft on surfaces the fix does not touch).
//
// ============================================================================
// SPEC-CONFLICT NOTE (raised to the supervisor — pinned, NOT worked around)
// ============================================================================
// The pinned design's clause 2 (a HEADER pointerdown starts the drag) and
// clause 5 (the existing `isInteractiveControl` guard on the header button
// "must keep the drag from being started by the toggle's own activation path
// where it already did") are in tension for the REAL app's header, because the
// header IS `button.pane-collapse-toggle` and `isInteractiveControl` returns
// true for ANY `button` tag (src/renderer/renderer.ts `:227`). With the header
// as the only gesture surface, an unchanged guard makes the header inert in
// exactly the way F-1 made the body inert. The tests below pin clause 2's
// intended behavior (header starts the drag) and report red; the supervisor
// must pin the guard ORDER (gesture surface resolved before the interactive
// guard) or exempt the resolved gesture surface.
import { describe, it, expect, beforeEach } from 'vitest'
import { installShellPointers } from '../src/renderer/renderer.js'
import { installShim, shimDocument, ShimElement } from '../src/shared/dom-shim.js'

// ===========================================================================
// The mock host — records EVERY seam call (the unit-u-shell-shell-wiring
// convention), so "no drag was started" is asserted as observable absence:
// zero `startPaneDrag` AND zero `setPointerCapture`.
// ===========================================================================
interface ZoneLike { zone: string; left: number; top: number; right: number; bottom: number }
interface DragPoint { x: number; y: number }

interface HostMock {
  calls: string[]
  draggedZones: ZoneLike[][]
  startGutter(zone: string): void
  moveGutter(size: number): void
  endGutter(): number | null
  cancelGutter(): void
  resetGutter(zone?: string): number | null
  activeGutter(): string | null
  startPaneDrag(paneId: string): void
  movePaneDrag(point: DragPoint, zones: readonly ZoneLike[]): void
  commitPaneDrop(payload?: unknown): unknown
  cancelPaneDrag(): void
  revealZones(): string[]
}

function makeHost(): HostMock {
  const calls: string[] = []
  const draggedZones: ZoneLike[][] = []
  return {
    calls,
    draggedZones,
    startGutter: (zone) => { calls.push(`startGutter:${zone}`) },
    moveGutter: (size) => { calls.push(`moveGutter:${size}`) },
    endGutter: () => { calls.push('endGutter'); return null },
    cancelGutter: () => { calls.push('cancelGutter') },
    resetGutter: (zone) => { calls.push(`resetGutter:${zone}`); return null },
    activeGutter: () => 'left',
    startPaneDrag: (paneId) => { calls.push(`startPaneDrag:${paneId}`) },
    movePaneDrag: (point, zones) => {
      calls.push(`movePaneDrag:${point.x},${point.y}`)
      draggedZones.push(zones.map((z) => ({ ...z })))
    },
    commitPaneDrop: (payload) => { calls.push(`commitPaneDrop:${JSON.stringify(payload)}`) },
    cancelPaneDrag: () => { calls.push('cancelPaneDrag') },
    revealZones: () => [],
  }
}

function countCalls(host: HostMock, prefix: string): number {
  return host.calls.filter((c) => c.startsWith(prefix)).length
}

// ===========================================================================
// Shell-chrome authoring helpers (the dom-shim DOM subset under
// `document.body`) — the REAL shape the app authors
// (`src/renderer/pane-graph.ts` paneSubtreeRoot: a `.pane-frame[data-pane-id]`
// whose FIRST child is `button.pane-collapse-toggle`, and — expanded — a body
// child that is the provident-compiled pane root carrying `data-node-id`).
// ===========================================================================
function el(tag: string, attrs: Record<string, string> = {}, cls = ''): ShimElement {
  const e = new ShimElement(tag)
  e.className = cls || ''
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  return e
}

interface Pane {
  frame: ShimElement
  header: ShimElement
  body: ShimElement | null
  layout: ShimElement
  zone: ShimElement
}

interface PaneOpts {
  /** The frame's `data-pane-id` — `null` omits the attribute entirely. */
  framePaneId?: string | null
  /** The header's OWN `data-pane-id` (the real app authors it; resolution must
   *  ride the PARENT FRAME, not this attribute). */
  headerPaneId?: string
  /** Author the body child (the provident-compiled pane root). */
  body?: boolean
  /** Author the header at all (`false` = a malformed/foreign body). */
  header?: boolean
  /** Author the body's own layout zone container. */
  zone?: boolean
}

/** Author `.layout > [data-zone='left'] (+ .pane-frame[data-pane-id] > button.pane-collapse-toggle (+ body))`. */
function authorPane(opts: PaneOpts = {}): Pane {
  const body = shimDocument.body
  const layout = el('main', {}, 'layout').setRect({ left: 0, top: 0, right: 1000, bottom: 600 })
  body.appendChild(layout)
  const zone = el('div', { 'data-zone': 'left' }).setRect({ left: 10, top: 10, right: 300, bottom: 590 })
  if (opts.zone !== false) layout.appendChild(zone)
  const frameAttrs: Record<string, string> = {}
  if (opts.framePaneId !== null) frameAttrs['data-pane-id'] = opts.framePaneId ?? 'notes'
  const frame = el('section', frameAttrs, 'pane-frame')
  layout.appendChild(frame)
  let header: ShimElement = frame
  if (opts.header !== false) {
    header = el(
      'button',
      { 'data-pane-id': opts.headerPaneId ?? opts.framePaneId ?? 'notes', 'data-pane-collapse': 'false' },
      'pane-collapse-toggle is-clickable',
    )
    frame.appendChild(header)
  }
  let bodyEl: ShimElement | null = null
  if (opts.body) {
    bodyEl = el('div', { 'data-node-id': 'pane-body-root' }, 'pane-body')
    frame.appendChild(bodyEl)
  }
  return { frame, header, body: bodyEl, layout, zone }
}

/** Author a header STRIP wrapping the real toggle button (the gesture surface
 *  resolves via the ancestor `.pane-collapse-toggle` compound). */
function authorPaneWithHeaderStrip(paneId: string): { frame: ShimElement; strip: ShimElement; toggle: ShimElement } {
  const frame = el('section', { 'data-pane-id': paneId }, 'pane-frame')
  const strip = el('div', { 'data-node-id': 'header-strip' }, 'pane-collapse-toggle')
  const toggle = el('button', { 'data-pane-id': paneId }, 'is-clickable')
  strip.appendChild(toggle)
  frame.appendChild(strip)
  shimDocument.body.appendChild(el('main', {}, 'layout').setRect({ left: 0, top: 0, right: 1000, bottom: 600 })).appendChild(frame)
  return { frame, strip, toggle }
}

beforeEach(() => {
  installShim() // a FRESH document tree per test
})

// ===========================================================================
// S1/S5 — the HEADER is the pane-drag gesture surface (clause 2).
// ===========================================================================
describe('F-1 U-3 — the pane-drag GESTURE SURFACE is the pane HEADER (clause 2)', () => {
  it('S1 — a pointerdown on `button.pane-collapse-toggle` starts the pane drag for the PARENT FRAME id; capture is DEFERRED until the gesture MOVES (F-1b: an immediate capture retargets the toggle\'s own `click`)', () => {
    const host = makeHost()
    const { frame, header } = authorPane({ framePaneId: 'notes', headerPaneId: 'notes' })
    installShellPointers(host)
    header.dispatchPointer('pointerdown', { pointerId: 3, clientX: 200, clientY: 200 })
    expect(countCalls(host, 'startPaneDrag:notes'), 'a HEADER pointerdown must start the pane drag (the header IS the gesture surface)').toBe(1)
    expect(frame.captureCalls, 'a PURE CLICK (pointerdown with no travel) must NOT capture — capturing the frame retargets the gesture\'s own `click` away from the header button, making the collapse/expand toggle inert live').toBe(0)
    // F-1b — once the gesture actually travels past the threshold it claims the pointer.
    header.dispatchPointer('pointermove', { pointerId: 3, clientX: 170, clientY: 200 })
    expect(frame.captureCalls, 'setPointerCapture must be requested on the FRAME element once the drag moves (the existing move/up routing target)').toBe(1)
    expect(frame.capturePointerId, 'the captured pointer id must be the header gesture\'s pointerId').toBe(3)
    expect(header.captureCalls, 'capture must NOT move to the header (the existing pointermove/up/cancel routing stays on the frame)').toBe(0)
  })

  it('S1b — the pane id comes from the header\'s PARENT FRAME, never the header\'s own data-pane-id', () => {
    const host = makeHost()
    // The header's own attribute deliberately LIES ('stale'); the frame is the source of truth.
    const { header } = authorPane({ framePaneId: 'notes', headerPaneId: 'stale' })
    installShellPointers(host)
    header.dispatchPointer('pointerdown', { pointerId: 4, clientX: 200, clientY: 200 })
    expect(countCalls(host, 'startPaneDrag:notes'), 'the frame id ("notes") must be used — the header attr must NOT win').toBe(1)
    expect(countCalls(host, 'startPaneDrag:stale'), 'the header\'s own data-pane-id must never be the resolved pane id').toBe(0)
  })

  it('S2 — a pointerdown on a non-interactive child INSIDE the header region resolves via the ancestor `.pane-collapse-toggle`', () => {
    const host = makeHost()
    const { frame, toggle } = authorPaneWithHeaderStrip('notes')
    installShellPointers(host)
    const glyph = el('span')
    toggle.appendChild(glyph)
    glyph.dispatchPointer('pointerdown', { pointerId: 5, clientX: 200, clientY: 200 })
    expect(countCalls(host, 'startPaneDrag:notes'), 'the header-region ancestor chain must resolve the gesture surface').toBe(1)
    expect(frame.captureCalls, 'a pure click inside the header region captures nothing (F-1b)').toBe(0)
    glyph.dispatchPointer('pointermove', { pointerId: 5, clientX: 160, clientY: 200 })
    expect(frame.captureCalls, 'capture stays on the frame, claimed once the gesture moves').toBe(1)
  })

  it('S5 — a COLLAPSED frame (header only, no body) still starts the pane drag from its header', () => {
    const host = makeHost()
    const { frame, header } = authorPane({ framePaneId: 'notes', body: false })
    installShellPointers(host)
    header.dispatchPointer('pointerdown', { pointerId: 6, clientX: 200, clientY: 200 })
    header.dispatchPointer('pointermove', { pointerId: 6, clientX: 150, clientY: 150 })
    header.dispatchPointer('pointerup', { pointerId: 6, clientX: 150, clientY: 150 })
    expect(countCalls(host, 'startPaneDrag:notes'), 'a collapsed pane\'s header is still the gesture surface').toBe(1)
    expect(frame.captureCalls, 'capture requested once on the frame').toBe(1)
    const terminal = countCalls(host, 'commitPaneDrop') + countCalls(host, 'cancelPaneDrag')
    expect(terminal, 'the header gesture must complete exactly ONCE (commit or cancel)').toBe(1)
  })
})

// ===========================================================================
// S3 — the BODY is NOT a gesture surface (clause 1). THE F-1 PIN.
// ===========================================================================
describe('F-1 U-3 — a pane-BODY pointerdown is NEVER hijacked into a pane drag (clause 1)', () => {
  it('S3a — a pointerdown on `li[data-document-id][data-node-id]` in the body starts NO drag and requests NO capture', () => {
    const host = makeHost()
    const { frame, body } = authorPane({ framePaneId: 'doc-nav', headerPaneId: 'doc-nav', body: true })
    installShellPointers(host)
    const row = el('li', { 'data-document-id': '.live-corpus/beta', 'data-node-id': 'beta' }, 'is-clickable')
    body!.appendChild(row)
    row.dispatchPointer('pointerdown', { pointerId: 7, clientX: 120, clientY: 300 })
    // RED (current wiring): GESTURE_SELECTOR matches `.pane-frame[data-pane-id]`
    // and `isInteractiveControl(li)` is false (no button/input/on:click attr) →
    // startPaneDrag fires + the frame captures the pointer → the click retarget.
    expect(countCalls(host, 'startPaneDrag'), 'a BODY row pointerdown must never start a pane drag (F-1)').toBe(0)
    expect(frame.captureCalls, 'the frame must NOT capture the pointer from a BODY pointerdown (the capture is what retargets the click)').toBe(0)
  })

  it('S3b — the same holds for a `p[data-node-id]` (a non-list provident body element)', () => {
    const host = makeHost()
    const { frame, body } = authorPane({ framePaneId: 'notes', body: true })
    installShellPointers(host)
    const p = el('p', { 'data-node-id': 'para-1' })
    body!.appendChild(p)
    p.dispatchPointer('pointerdown', { pointerId: 8, clientX: 120, clientY: 300 })
    expect(countCalls(host, 'startPaneDrag'), 'a `p[data-node-id]` body pointerdown must never start a pane drag').toBe(0)
    expect(frame.captureCalls, 'no capture from a body pointerdown').toBe(0)
  })

  it('S3c — a BODY control\'s own `click` handler runs: the event target is the control, never the `.pane-frame`', () => {
    const host = makeHost()
    const { frame, body } = authorPane({ framePaneId: 'doc-nav', body: true })
    installShellPointers(host)
    const row = el('li', { 'data-document-id': '.live-corpus/beta', 'data-node-id': 'beta' }, 'is-clickable')
    body!.appendChild(row)
    const seen: string[] = []
    row.addEventListener('click', (e) => { seen.push((e as { target: ShimElement }).target.className) })
    row.dispatchPointer('pointerdown', { pointerId: 9, clientX: 120, clientY: 300 })
    row.dispatchPointer('click', { pointerId: 9, clientX: 120, clientY: 300 })
    expect(seen.length, 'the BODY control\'s own click handler must RUN (live evidence: a real click never reaches it)').toBe(1)
    expect(seen[0], 'the click target must be the CONTROL itself — never retargeted to `.pane-frame`').toBe('is-clickable')
    expect(countCalls(host, 'startPaneDrag'), 'no drag may have been started from the body click path').toBe(0)
    expect(frame.captureCalls, 'the frame must not have captured the pointer (no capture → no click retarget)').toBe(0)
  })

  it('S3d — a pointerdown on the app-graph pane ROOT itself (the provident body root carrying data-node-id) starts no drag', () => {
    const host = makeHost()
    const { frame, body } = authorPane({ framePaneId: 'search', body: true })
    installShellPointers(host)
    body!.dispatchPointer('pointerdown', { pointerId: 10, clientX: 120, clientY: 300 })
    expect(countCalls(host, 'startPaneDrag'), 'the pane body ROOT pointerdown must never start a pane drag').toBe(0)
    expect(frame.captureCalls, 'no capture from the body root').toBe(0)
  })
})

// ===========================================================================
// S4 — the FRAME element itself is no longer a gesture surface.
// ===========================================================================
describe('F-1 U-3 — the `.pane-frame` element is NOT a gesture surface (the old convention is dead)', () => {
  it('S4 — a pointerdown on a HEADER-LESS `.pane-frame[data-pane-id]` starts no drag and captures nothing', () => {
    const host = makeHost()
    const { frame } = authorPane({ framePaneId: 'notes', header: false })
    installShellPointers(host)
    frame.dispatchPointer('pointerdown', { pointerId: 11, clientX: 200, clientY: 200 })
    expect(countCalls(host, 'startPaneDrag'), 'a header-less frame is no gesture surface — the frame body must never start a drag').toBe(0)
    expect(frame.captureCalls, 'the frame must not capture from a bare frame pointerdown').toBe(0)
  })
})

// ===========================================================================
// S6/S7 — the gutter path + the supersede order are UNCHANGED (clause 3).
// ===========================================================================
describe('F-1 U-3 — the gutter surface + supersede order are unchanged (clause 3)', () => {
  it('S6 — a `.gutter[data-zone=\'left\']` pointerdown still starts the gutter gesture and captures the GUTTER', () => {
    const host = makeHost()
    authorPane()
    const gutter = el('div', { 'data-zone': 'left', 'data-axis': 'columns' }, 'gutter')
    const layout = shimDocument.querySelector('.layout') as ShimElement
    layout.appendChild(gutter)
    installShellPointers(host)
    gutter.dispatchPointer('pointerdown', { pointerId: 12, clientX: 120, clientY: 300 })
    expect(countCalls(host, 'startGutter:left'), 'the gutter gesture must be unchanged').toBe(1)
    expect(gutter.captureCalls, 'the gutter captures its own pointer (unchanged)').toBe(1)
  })

  it('S7 — a gutter pointerdown supersedes an in-flight HEADER pane drag: cancelPaneDrag BEFORE startGutter', () => {
    const host = makeHost()
    const { header } = authorPane({ framePaneId: 'notes' })
    const gutter = el('div', { 'data-zone': 'left', 'data-axis': 'columns' }, 'gutter')
    ;(shimDocument.querySelector('.layout') as ShimElement).appendChild(gutter)
    installShellPointers(host)
    header.dispatchPointer('pointerdown', { pointerId: 13, clientX: 200, clientY: 200 })
    expect(countCalls(host, 'startPaneDrag:notes'), 'the header pane drag must start first').toBe(1)
    gutter.dispatchPointer('pointerdown', { pointerId: 14, clientX: 120, clientY: 300 })
    expect(countCalls(host, 'cancelPaneDrag'), 'the in-flight header drag must be reverted on supersede').toBe(1)
    expect(countCalls(host, 'startGutter:left'), 'the superseding gutter gesture must start').toBe(1)
    expect(host.calls.indexOf('cancelPaneDrag'), 'cancelPaneDrag must precede startGutter:left').toBeLessThan(host.calls.indexOf('startGutter:left'))
  })
})

// ===========================================================================
// FAIL-STATES (clause 4) — malformed / missing / throwing → degrade, never throw.
// ===========================================================================
describe('F-1 U-3 fail-states — malformed/missing attributes and throwing engines degrade, never throw (clause 4)', () => {
  it('F-a — a header with NO parent frame: no pane id resolvable → zero seam calls, zero capture, no throw', () => {
    const host = makeHost()
    installShellPointers(host)
    const orphan = el('button', { 'data-pane-id': 'notes' }, 'pane-collapse-toggle is-clickable')
    shimDocument.body.appendChild(orphan)
    expect(() => orphan.dispatchPointer('pointerdown', { pointerId: 20, clientX: 10, clientY: 10 })).not.toThrow()
    expect(countCalls(host, 'startPaneDrag'), 'an orphan header must not start a drag (no resolvable frame)').toBe(0)
    expect(orphan.captureCalls, 'an orphan header must not capture').toBe(0)
  })

  it('F-b — a frame with NO `data-pane-id`: header pointerdown → zero seam calls, no throw', () => {
    const host = makeHost()
    const { header, frame } = authorPane({ framePaneId: null, headerPaneId: 'notes' })
    installShellPointers(host)
    expect(() => header.dispatchPointer('pointerdown', { pointerId: 21, clientX: 200, clientY: 200 })).not.toThrow()
    expect(countCalls(host, 'startPaneDrag'), 'a frame without data-pane-id yields no pane id → no drag').toBe(0)
    expect(frame.captureCalls, 'no capture when no pane id resolves').toBe(0)
  })

  it('F-c — a frame with an EMPTY `data-pane-id=\'\'`: header pointerdown → zero seam calls, no throw', () => {
    const host = makeHost()
    const { header, frame } = authorPane({ framePaneId: '', headerPaneId: 'notes' })
    installShellPointers(host)
    expect(() => header.dispatchPointer('pointerdown', { pointerId: 22, clientX: 200, clientY: 200 })).not.toThrow()
    expect(countCalls(host, 'startPaneDrag'), 'an EMPTY pane id is not a pane identity → no drag').toBe(0)
    expect(frame.captureCalls, 'no capture for an empty pane id').toBe(0)
  })

  it('F-d — a header pointerdown with NO pointerId: the drag may start, but NO capture is requested and nothing throws', () => {
    const host = makeHost()
    const { frame, header } = authorPane({ framePaneId: 'notes' })
    installShellPointers(host)
    expect(() => header.dispatchPointer('pointerdown', { clientX: 200, clientY: 200 })).not.toThrow()
    expect(countCalls(host, 'startPaneDrag:notes'), 'the header gesture still starts without a pointerId').toBe(1)
    expect(frame.captureCalls, 'a missing pointerId must never produce a setPointerCapture call').toBe(0)
  })

  it('F-e — setPointerCapture THROWS on the frame: no throw, and the gesture\'s move/up routing still completes off capture', () => {
    const host = makeHost()
    const { frame, header } = authorPane({ framePaneId: 'notes' })
    frame.setPointerCapture = () => { throw new Error('capture unavailable') }
    installShellPointers(host)
    expect(() => header.dispatchPointer('pointerdown', { pointerId: 23, clientX: 200, clientY: 200 })).not.toThrow()
    expect(countCalls(host, 'startPaneDrag:notes'), 'the drag must still start when capture throws').toBe(1)
    header.dispatchPointer('pointermove', { pointerId: 23, clientX: 150, clientY: 150 })
    header.dispatchPointer('pointerup', { pointerId: 23, clientX: 150, clientY: 150 })
    expect(countCalls(host, 'movePaneDrag'), 'the move path must still route without capture').toBeGreaterThan(0)
    const terminal = countCalls(host, 'commitPaneDrop') + countCalls(host, 'cancelPaneDrag')
    expect(terminal, 'the gesture must still terminate exactly once without capture').toBe(1)
  })

  it('F-f — setPointerCapture THROWS on the GUTTER: no throw, the gutter gesture still completes', () => {
    const host = makeHost()
    authorPane()
    const gutter = el('div', { 'data-zone': 'left', 'data-axis': 'columns' }, 'gutter')
    ;(shimDocument.querySelector('.layout') as ShimElement).appendChild(gutter)
    gutter.setPointerCapture = () => { throw new Error('capture unavailable') }
    installShellPointers(host)
    expect(() => gutter.dispatchPointer('pointerdown', { pointerId: 24, clientX: 120, clientY: 300 })).not.toThrow()
    gutter.dispatchPointer('pointerup', { pointerId: 24, clientX: 340, clientY: 300 })
    expect(countCalls(host, 'endGutter'), 'the gutter gesture must still commit once when capture throws').toBe(1)
  })

  it('F-g — getBoundingClientRect THROWS on the zone container: no throw, the move degrades and the pointerup still terminates once', () => {
    const host = makeHost()
    const { frame, header, zone } = authorPane({ framePaneId: 'notes' })
    zone.getBoundingClientRect = () => { throw new Error('layout unavailable') }
    installShellPointers(host)
    expect(() => header.dispatchPointer('pointerdown', { pointerId: 25, clientX: 200, clientY: 200 })).not.toThrow()
    expect(countCalls(host, 'startPaneDrag:notes'), 'the drag starts before the geometry is read').toBe(1)
    expect(() => header.dispatchPointer('pointermove', { pointerId: 25, clientX: 150, clientY: 150 })).not.toThrow()
    expect(() => header.dispatchPointer('pointerup', { pointerId: 25, clientX: 150, clientY: 150 })).not.toThrow()
    const terminal = countCalls(host, 'commitPaneDrop') + countCalls(host, 'cancelPaneDrag')
    expect(terminal, 'a throwing rect must still terminate the gesture exactly once (degrade, never leak)').toBe(1)
    expect(frame.captureCalls, 'capture is requested once regardless of the throwing rect').toBe(1)
  })

  it('F-h — a pointerdown on a DETACHED header (no parent, no frame): never throws, no seam call', () => {
    const host = makeHost()
    installShellPointers(host)
    const detached = el('button', { 'data-pane-id': 'notes' }, 'pane-collapse-toggle')
    expect(() => detached.dispatchPointer('pointerdown', { pointerId: 26, clientX: 10, clientY: 10 })).not.toThrow()
    expect(countCalls(host, 'startPaneDrag'), 'a detached header must not start a drag').toBe(0)
    expect(detached.captureCalls, 'a detached header must not capture').toBe(0)
  })
})
