// tests/unit-u-shell-shell-wiring-adversarial.test.ts — Unit U-SHELL-N7
// adversarial DOM-level regression set. Pins the confirmed HOST-1..HOST-5
// findings in the shell pointer-wiring unit against the LIVE wiring
// (`installShellPointers` in src/renderer/renderer.ts) driven by the extended
// dom-shim (`src/shared/dom-shim.ts`, U-SHELL-N7 additions — do NOT modify:
// `installShim()` installs a FRESH `globalThis.document`; `ShimElement` exposes
// `querySelector/All`, `closest`, `setRect`, `setPointerCapture`+
// `captureCalls`, `addEventListener/removeEventListener`, `dispatchPointer`,
// and the document exposes its own DELEGATED listener store +
// `dispatchPointer(type,target,props)` that bubbles target→ancestors→document).
//
// RED inventory:
//
//   PRIMARY RED (suite-load): the current src/renderer/renderer.ts defines
//     `installShellPointers` as a MODULE-PRIVATE function — it is NOT a named
//     export. The `import { installShellPointers } from '../src/renderer/renderer.js'`
//     below therefore THROWS at suite collection ("...does not provide an export
//     named 'installShellPointers'"). That is recorded explicitly as the primary
//     red. The per-HOST assertions below are the pins that MUST also be satisfied
//     for a green (they are unreachable until the export lands).
//
//   HOST-1 (HIGH) — the CURRENT wiring attaches pointers DIRECTLY to elements
//     found at INSTALL time (`document.querySelectorAll('.gutter[data-zone]')`
//     / `.pane-frame[data-pane-id]`). Elements authored AFTER install match
//     nothing → the gesture never routes. There is NO document-level delegated
//     `pointerdown` listener.
//   HOST-2 (HIGH) — per-gesture `pointermove/up/cancel/dblclick` listeners are
//     registered INSIDE `pointerdown` and NEVER removed → they are ACCUMULATED
//     onto the element across consecutive gestures → duplicate/stale commits.
//   HOST-3 (MEDIUM) — `isInteractiveControl(target)` inspects ONLY the deepest
//     node; it does not climb ancestors, so `pointerdown` on a `<span>` nested
//     inside an interactive `<button>` inside a `.pane-frame` is hijacked into a
//     pane drag.
//   HOST-4 (MEDIUM) — the drag gesture's move/up listeners live on the ORIGINAL
//     frame element. A re-mount (the frame/zone rects re-authored and/or a fresh
//     frame) detaches them → the gesture is ORPHANED (drop path never resolves).
//   HOST-5 (LOW) — every `[data-zone]` value (even a malformed `'bogus'`) is fed
//     into `toZoneBounds`, which (pane-drag.ts) coerces an unknown zone to
//     `'left'` → the malformed container is projected as a REAL `left` drop
//     target (fails open).
//
// GREEN-ON-ARRIVAL within the pinned assertions:
//   - `setPointerCapture` is a best-effort enhancement; the current wiring
//     already requests capture exactly once per accepted pointerdown, so the
//     `captureCalls` delta == 1-per-gesture pin is NOT a red (it is pinned to
//     guard the fix from regressing into per-move capture).
//   - the gutter seam calls `startGutter`/`moveGutter` on the happy path — the
//     current wiring routes these (HOST-1's red is specifically about the
//     DEFERRED/absent-at-install authoring, not the installed-case happy path).
//
// Constraints honoured: ONE test file only; `src/` is NEVER touched; the
// existing pure-surface + source-pin file
// (`tests/unit-u-shell-shell-wiring.test.ts`) is untouched. Vitest default
// `describe`/`it`/`expect`.
import { describe, it, expect, beforeEach } from 'vitest'
// NOTE — the PRIMARY RED: `installShellPointers` is not (yet) a named export of
// renderer.ts, so importing it throws at SUITE COLLECTION before any `it` body
// runs. This is the intended red. The fix (making it a named export) satisfies
// the import; the per-HOST assertions then pin the required behavior.
import { installShellPointers } from '../src/renderer/renderer.js'
import { installShim, shimDocument, ShimElement } from '../src/shared/dom-shim.js'

// ===========================================================================
// The mock host — records EVERY seam call into a `calls` log + per-seam
// counters, and captures the `zones` argument of every `movePaneDrag` so HOST-5
// can assert the malformed zone is never projected.
// ===========================================================================
interface ZoneLike {
  zone: string
  left: number
  top: number
  right: number
  bottom: number
}
interface DragPoint { x: number; y: number }

interface HostMock {
  calls: string[]
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
  // captured drag geometry
  draggedZones: ZoneLike[][]
}

function makeHost(activeZone: string | null = 'left'): HostMock {
  const calls: string[] = []
  const draggedZones: ZoneLike[][] = []
  return {
    calls,
    draggedZones,
    startGutter: (zone: string) => { calls.push(`startGutter:${zone}`) },
    moveGutter: (size: number) => { calls.push(`moveGutter:${size}`) },
    endGutter: () => { calls.push('endGutter'); return null },
    cancelGutter: () => { calls.push('cancelGutter') },
    resetGutter: (zone?: string) => { calls.push(`resetGutter:${zone}`); return null },
    activeGutter: () => activeZone,
    startPaneDrag: (paneId: string) => { calls.push(`startPaneDrag:${paneId}`) },
    movePaneDrag: (point: DragPoint, zones: readonly ZoneLike[]) => {
      calls.push(`movePaneDrag:${point.x},${point.y}`)
      draggedZones.push(zones.map((z) => ({ ...z })))
    },
    commitPaneDrop: (payload?: unknown) => { calls.push(`commitPaneDrop:${JSON.stringify(payload)}`) },
    cancelPaneDrag: () => { calls.push('cancelPaneDrag') },
    revealZones: () => [],
  }
}

function countCalls(host: HostMock, prefix: string): number {
  return host.calls.filter((c) => c.startsWith(prefix)).length
}

// ===========================================================================
// Shell-chrome authoring helpers (the dom-shim DOM subset under
// `document.body`).
// ===========================================================================
function el(tag: string, attrs: Record<string, string> = {}, cls = ''): ShimElement {
  const e = new ShimElement(tag)
  e.className = cls || ''
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v)
  return e
}

interface Shell {
  layout: ShimElement
  gutterLeft: ShimElement
  frame: ShimElement
  zoneLeft: ShimElement
  zoneBogus: ShimElement | null
}

/** Author `.layout` containing `.gutter[data-zone='left']`, a
 *  `.pane-frame[data-pane-id='notes']`, a real `[data-zone='left']` zone
 *  container, and (optionally) the malformed `[data-zone='bogus']` container —
 *  all appended under `document.body` with rect geometry. */
function authorShell(opts: { bogus?: boolean } = {}): Shell {
  const body = shimDocument.body
  const layout = el('main', {}, 'layout').setRect({ left: 0, top: 0, right: 1000, bottom: 600 })
  const gutterLeft = el('div', { 'data-zone': 'left', 'data-axis': 'columns' }, 'gutter')
  const zoneLeft = el('div', { 'data-zone': 'left' }).setRect({ left: 10, top: 10, right: 300, bottom: 590 })
  const frame = el('section', { 'data-pane-id': 'notes' }, 'pane-frame')
  body.appendChild(layout)
  layout.appendChild(gutterLeft)
  layout.appendChild(zoneLeft)
  layout.appendChild(frame)
  let zoneBogus: ShimElement | null = null
  if (opts.bogus) {
    zoneBogus = el('div', { 'data-zone': 'bogus' }).setRect({ left: 400, top: 10, right: 700, bottom: 590 })
    layout.appendChild(zoneBogus)
  }
  return { layout, gutterLeft, frame, zoneLeft, zoneBogus }
}

function leftGesture(host: HostMock, gutter: ShimElement, n: number): void {
  for (let i = 1; i <= n; i++) {
    gutter.dispatchPointer('pointerdown', { pointerId: i, clientX: 120, clientY: 300 })
    gutter.dispatchPointer('pointermove', { pointerId: i, clientX: 340, clientY: 300 })
    gutter.dispatchPointer('pointerup', { pointerId: i, clientX: 340, clientY: 300 })
  }
}

beforeEach(() => {
  installShim() // a FRESH document tree per test (dom-shim is already extended)
})

// ===========================================================================
// HOST-1 (HIGH) — delegated routing survives DEFERRED / absent-at-install
// authoring.
// ===========================================================================
describe('HOST-1 — the wiring routes gutters/frames authored AFTER install (delegated document pointerdown)', () => {
  it('routes a gutter + frame pointerdown when BOTH are authored after install', () => {
    const host = makeHost()
    installShellPointers(host) // install on an EMPTY body
    const shell = authorShell() // THEN author the chrome
    shell.gutterLeft.dispatchPointer('pointerdown', { pointerId: 1, clientX: 120, clientY: 300 })
    shell.frame.dispatchPointer('pointerdown', { pointerId: 2, clientX: 200, clientY: 200 })
    // RED (current wiring): the install-time selector results were empty, so no
    // gutter/frame listener was attached — neither seam fires.
    expect(countCalls(host, 'startGutter:left'), 'startGutter(left) must fire from a deferred-authored gutter').toBe(1)
    expect(countCalls(host, 'startPaneDrag:notes'), 'startPaneDrag(notes) must fire from a deferred-authored frame').toBe(1)
  })

  it('attaches the wiring via the DOCUMENT-level delegated pointerdown path (≥1 listener)', () => {
    const host = makeHost()
    installShellPointers(host)
    const docListeners = (shimDocument as unknown as {
      listeners: Record<string, unknown[]>
    }).listeners
    const down = (docListeners['pointerdown'] ?? [])
    // RED (current wiring): no document-level listener is registered — the
    // install-time per-element `addEventListener`s are the only path.
    expect(down.length, 'document must hold ≥1 delegated pointerdown listener (HOST-1 mechanism)').toBeGreaterThan(0)
  })
})

// ===========================================================================
// HOST-2 (HIGH) — exactly-once commit per gesture; no duplicate/stale
// per-gesture listeners accumulated across consecutive gestures.
// ===========================================================================
describe('HOST-2 — consecutive gutter gestures never accumulate duplicate/stale per-gesture listeners', () => {
  it('commits endGutter EXACTLY ONCE per pointerup (three full gestures)', () => {
    const host = makeHost()
    authorShell()
    // re-attach the authored chrome to a known reference after install
    const gutter = shimDocument.querySelector('.gutter[data-zone="left"]') as ShimElement
    installShellPointers(host)
    // gesture 1 — the happy path commits once (GREEN-on-arrival pin for the fix)
    gutter.dispatchPointer('pointerdown', { pointerId: 1, clientX: 120, clientY: 300 })
    gutter.dispatchPointer('pointermove', { pointerId: 1, clientX: 340, clientY: 300 })
    gutter.dispatchPointer('pointerup', { pointerId: 1, clientX: 340, clientY: 300 })
    expect(countCalls(host, 'endGutter'), 'gesture 1 pointerup must commit once').toBe(1)
    // three FULL gestures — FOUR pointerup cycles total (gesture 1 in the lines
    // above + the three from leftGesture). Each pointerup must commit EXACTLY
    // ONCE, so the cumulative count is 4 — never 1+2+3=6 (stale duplication).
    leftGesture(host, gutter, 3)
    // RED (current wiring): each pointerdown re-registers move/up/cancel on the
    // SAME gutter and never removes them → the Nth pointerup fires N accumulated
    // pointerup handlers → endGutter is called 1+2+3 = 6 times, not 4.
    expect(countCalls(host, 'endGutter'), 'each of the 4 pointerup cycles must commit exactly once → total 4, never stale-duplicated').toBe(4)
  })

  it('requests setPointerCapture exactly ONCE per gesture (delta == 1 per pointerdown)', () => {
    const host = makeHost()
    const gutter = shimDocument.body.appendChild(el('div', { 'data-zone': 'left' }, 'gutter'))
    gutter.setRect({ left: 100, top: 0, right: 104, bottom: 600 })
    shimDocument.body.appendChild(el('main', {}, 'layout').setRect({ left: 0, top: 0, right: 1000, bottom: 600 }))
    installShellPointers(host)
    let captureBefore = gutter.captureCalls
    for (let i = 1; i <= 3; i++) {
      gutter.dispatchPointer('pointerdown', { pointerId: i, clientX: 120, clientY: 300 })
      const delta = gutter.captureCalls - captureBefore
      expect(delta, `pointerdown ${i} must request capture exactly once`).toBe(1)
      captureBefore = gutter.captureCalls
    }
  })
})

// ===========================================================================
// HOST-3 (MEDIUM) — ancestor climb: a nested child of an interactive control
// is never hijacked into a pane drag.
// ===========================================================================
describe('HOST-3 — pointerdown on a <span> inside an interactive <button> inside a .pane-frame is NOT hijacked', () => {
  it('does not call startPaneDrag when the deepest target is a nested child of a button', () => {
    const host = makeHost()
    const { layout, frame } = authorShell()
    const button = el('button')
    const span = el('span')
    button.appendChild(span)
    frame.appendChild(button)
    void layout
    installShellPointers(host)
    // dispatch so the DEEPEST target is the <span> inside the <button> — the
    // bubble reaches the frame's pointerdown handler with e.target === span.
    span.dispatchPointer('pointerdown', { pointerId: 9, clientX: 200, clientY: 200 })
    // RED (current wiring): isInteractiveControl inspects ONLY the span (tag
    // `span`, no handler attrs) → false → the drag is hijacked.
    expect(countCalls(host, 'startPaneDrag'), 'a click inside an interactive control must never start a pane drag').toBe(0)
  })

  it('does not call startPaneDrag either when the deepest target is a nested child of an input', () => {
    const host = makeHost()
    const { layout, frame } = authorShell()
    const input = el('input')
    const svg = el('svg')
    input.appendChild(svg)
    frame.appendChild(input)
    void layout
    installShellPointers(host)
    svg.dispatchPointer('pointerdown', { pointerId: 10, clientX: 200, clientY: 200 })
    expect(countCalls(host, 'startPaneDrag'), 'a click inside an input must never start a pane drag').toBe(0)
  })
})

// ===========================================================================
// HOST-4 (MEDIUM) — an in-flight drag survives a re-mount / rect re-set (the
// gesture is not orphaned; the drop path still resolves).
// ===========================================================================
describe('HOST-4 — the gesture survives a re-mount between pointermove steps', () => {
  it('resolves the drop path even when the frame is re-authored mid-gesture', () => {
    const host = makeHost()
    const { layout, frame } = authorShell()
    installShellPointers(host)
    // pointerdown starts the drag on the ORIGINAL frame.
    frame.dispatchPointer('pointerdown', { pointerId: 5, clientX: 200, clientY: 200 })
    expect(countCalls(host, 'startPaneDrag:notes'), 'the drag must start').toBe(1)
    // SIMULATE a re-mount: remove the original frame + re-set the zone rect,
    // then author a FRESH frame in its place.
    frame.remove()
    ;(shimDocument.querySelector('[data-zone="left"]') as ShimElement)?.setRect({ left: 10, top: 10, right: 300, bottom: 590 })
    const fresh = el('section', { 'data-pane-id': 'notes' }, 'pane-frame')
    layout.appendChild(fresh)
    const before = countCalls(host, 'commitPaneDrop') + countCalls(host, 'cancelPaneDrag')
    // moves + up on the FRESH frame must still route through the active gesture.
    fresh.dispatchPointer('pointermove', { pointerId: 5, clientX: 150, clientY: 150 })
    fresh.dispatchPointer('pointerup', { pointerId: 5, clientX: 150, clientY: 150 })
    const after = countCalls(host, 'commitPaneDrop') + countCalls(host, 'cancelPaneDrag')
    // RED (current wiring): the move/up handlers were attached to the ORIGINAL
    // frame element at pointerdown; the fresh frame has none → neither the drop
    // nor the cancel path resolves (the gesture is orphaned).
    expect(after, 'a re-mount must NOT orphan the in-flight drag — the drop/cancel path must resolve').toBeGreaterThan(before)
  })
})

// ===========================================================================
// HOST-5 (LOW) — a malformed `[data-zone='bogus']` container is NEVER a real
// drop target (a real LayoutZoneName only).
// ===========================================================================
describe('HOST-5 — a malformed [data-zone=\'bogus\'] container is never projected as a real zone', () => {
  it('projects exactly ONE `left` zone bound (the real container), never the bogus one coerced to `left`', () => {
    const host = makeHost()
    const { layout, frame } = authorShell({ bogus: true })
    void layout
    installShellPointers(host)
    frame.dispatchPointer('pointerdown', { pointerId: 7, clientX: 200, clientY: 200 })
    frame.dispatchPointer('pointermove', { pointerId: 7, clientX: 150, clientY: 150 })
    expect(host.draggedZones.length, 'movePaneDrag must have received the zones array').toBeGreaterThan(0)
    const lastZones = host.draggedZones[host.draggedZones.length - 1]
    const realLeft = lastZones.filter((z) => z.zone === 'left')
    // RED (current wiring): toZoneBounds('bogus', rect) is called and coerces an
    // unknown zone to 'left', so BOTH the real container AND the bogus container
    // project as `zone === 'left'` → a malformed zone becomes a real drop target.
    expect(realLeft.length, 'there must be EXACTLY ONE `left` ZoneBounds — the real container only, never the bogus one').toBe(1)
    const bogus = lastZones.filter((z) => z.zone === 'bogus')
    expect(bogus.length, 'a malformed zone must be SKIPPED entirely (fail-closed), not projected').toBe(0)
  })
})

// ===========================================================================
// HOST-N7-ADV regression set — adversarial re-audit findings (RED vs the
// CURRENT src/renderer/renderer.ts wiring; expected GREEN after the planned
// ADV fixes).
//
//   ADV1 (HIGH) — a `dblclick` fires AFTER the second `pointerup` in a real
//     two-click order, so a dblclick listener tied to the gesture lifecycle
//     (removed at `pointerup` in `clearGesture`) makes `host.resetGutter`
//     UNREACHABLE. The fix registers a PERMANENT document-delegated `dblclick`
//     in `installShellPointers` (next to the `pointerdown`) that resolves the
//     gutter via `.gutter[data-zone]` and calls `host.resetGutter(dataZone)`
//     for a real layout zone, independent of the active gesture; `dblclick` is
//     REMOVED from `beginGesture`/`clearGesture`.
//   ADV2 (HIGH) — a dropped pointer (pointer released without `pointerup` /
//     `pointercancel`) must never leak a stale gesture. The fix records the
//     gesture's `pointerId` in `activeGesture`; `onGestureMove/Up/Cancel` only
//     act when the event `pointerId` matches the active gesture's; and a
//     document-delegated `lostpointercapture` handler reverts + clears the
//     active gesture.
//   ADV3 (MEDIUM) — a new gesture supersedes an in-flight one cleanly: when a
//     gutter `pointerdown` starts over an in-flight PANE drag (or vice-versa),
//     the prior gesture is reverted first (a pane drag → `host.cancelPaneDrag()`
//     so its reveal is re-hidden) before the new gesture starts.
//   ADV5 (MEDIUM) — `isInteractiveControl` additionally treats `label` and
//     `fieldset` and a `[contenteditable]` attribute as interactive, so a
//     `pointerdown` on a `label` wrapping an `input`/`select`/`textarea` inside
//     a `.pane-frame` does NOT start a pane drag.
//   ADV4 (LOW) — `installShellPointers` is idempotent: a module-level flag makes
//     a second call a no-op (no second delegated `pointerdown` listener).
// ===========================================================================
describe('HOST-N7-ADV regression set — adversarial re-audit findings', () => {
  const docListeners = (): Record<string, unknown[]> =>
    (shimDocument as unknown as { listeners: Record<string, unknown[]> }).listeners

  // -------------------------------------------------------------------------
  // ADV1 — double-click gutter reset reachable.
  // -------------------------------------------------------------------------
  describe('ADV1 — the gutter double-click reset is reachable after two FULL pointerdown→pointerup cycles', () => {
    it('fires host.resetGutter(left) when a dblclick lands after TWO full cycles (real two-click order down→up→down→up)', () => {
      const host = makeHost()
      authorShell()
      const gutter = shimDocument.querySelector('.gutter[data-zone="left"]') as ShimElement
      installShellPointers(host)
      // Two full cycles so `clearGesture` has run on the SECOND `pointerup` —
      // the exact order a real double click produces (down→up→down→up). In the
      // CURRENT wiring the dblclick listener was registered in `beginGesture`
      // and removed at that second `up`, so a dblclick dispatched now is gone.
      leftGesture(host, gutter, 2)
      gutter.dispatchPointer('dblclick', { pointerId: 2, clientX: 120, clientY: 300 })
      // RED (current): the dblclick handler never fires → resetGutter unreachable.
      expect(host.calls, 'resetGutter(left) must be reachable after the two-click order (permanent delegated dblclick)').toContain('resetGutter:left')
    })
  })

  // -------------------------------------------------------------------------
  // ADV2 — a dropped pointer never leaks a stale gesture.
  // -------------------------------------------------------------------------
  describe('ADV2 — a lost-pointer gesture is reverted + cleared, never re-committed by an unrelated event', () => {
    it('ADV2a — after lostpointercapture, a later UNRELATED pointerup on a different element/pointerId never commits/cancels/ends', () => {
      const host = makeHost()
      const { frame } = authorShell()
      installShellPointers(host)
      // Start a pane drag (a matching pane frame + geometry).
      frame.dispatchPointer('pointerdown', { pointerId: 1, clientX: 200, clientY: 200 })
      expect(countCalls(host, 'startPaneDrag:notes'), 'the pane drag must start').toBe(1)
      // The pointer is dropped WITHOUT a pointerup/pointercancel → lostpointercapture.
      frame.dispatchPointer('lostpointercapture', { pointerId: 1 })
      // An UNRELATED later pointerup on a DIFFERENT element + different pointerId.
      const other = el('div')
      shimDocument.body.appendChild(other)
      other.dispatchPointer('pointerup', { pointerId: 999, clientX: 300, clientY: 300 })
      // RED (current): lostpointercapture is ignored, the stale gesture persists,
      // and the unrelated pointerup routes through onGestureUp → it commits/cancels.
      expect(countCalls(host, 'commitPaneDrop'), 'an unrelated pointerup after a dropped pointer must never commit a stale drop').toBe(0)
      expect(countCalls(host, 'cancelPaneDrag'), 'an unrelated pointerup after a dropped pointer must never cancel (the gesture was already cleared)').toBe(0)
      expect(countCalls(host, 'endGutter'), 'an unrelated pointerup after a dropped pointer must never end a gutter gesture (none was active)').toBe(0)
    })

    it('ADV2b — lostpointercapture tears down the per-gesture listeners (document pointerup listener drops to 0)', () => {
      const host = makeHost()
      authorShell()
      const gutter = shimDocument.querySelector('.gutter[data-zone="left"]') as ShimElement
      installShellPointers(host)
      gutter.dispatchPointer('pointerdown', { pointerId: 1, clientX: 120, clientY: 300 })
      const before = docListeners()['pointerup'] ?? []
      expect(before.length, 'precondition: a gutter pointerdown registered its per-gesture pointerup listener').toBe(1)
      gutter.dispatchPointer('lostpointercapture', { pointerId: 1 })
      // RED (current): lostpointercapture is ignored → the per-gesture pointerup
      // listener LEAKS (still registered on the document).
      expect((docListeners()['pointerup'] ?? []).length, 'a dropped pointer must tear down the per-gesture pointerup listener').toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // ADV3 — a new gesture supersedes an in-flight one cleanly.
  // -------------------------------------------------------------------------
  describe('ADV3 — a gutter pointerdown superseding an in-flight PANE drag reverts it first', () => {
    it('calls host.cancelPaneDrag() (re-hides the reveal) BEFORE host.startGutter when a gutter gesture supersedes a pane drag', () => {
      const host = makeHost()
      const { gutterLeft, frame } = authorShell()
      installShellPointers(host)
      frame.dispatchPointer('pointerdown', { pointerId: 1, clientX: 200, clientY: 200 })
      expect(countCalls(host, 'startPaneDrag:notes'), 'the in-flight pane drag must start').toBe(1)
      // A gutter pointerdown starts a NEW gesture OVER the in-flight pane drag.
      gutterLeft.dispatchPointer('pointerdown', { pointerId: 2, clientX: 120, clientY: 300 })
      // RED (current): no cross-kind revert on supersede — the pane drag's reveal
      // is never re-hidden → cancelPaneDrag never fires.
      expect(countCalls(host, 'cancelPaneDrag'), 'the prior in-flight pane drag must be reverted on supersede (reveal re-hidden)').toBe(1)
      expect(countCalls(host, 'startGutter:left'), 'the superseding gutter gesture must start').toBe(1)
      // and the revert must happen BEFORE the new gesture starts.
      const cancelIdx = host.calls.indexOf('cancelPaneDrag')
      const startIdx = host.calls.indexOf('startGutter:left')
      expect(cancelIdx, 'cancelPaneDrag must be present in the call sequence').toBeGreaterThan(-1)
      expect(startIdx, 'startGutter:left must be present in the call sequence').toBeGreaterThan(-1)
      expect(cancelIdx, 'cancelPaneDrag must precede startGutter:left in the call sequence').toBeLessThan(startIdx)
    })
  })

  // -------------------------------------------------------------------------
  // ADV5 — interactive WRAPPER controls are not hijacked.
  // -------------------------------------------------------------------------
  describe('ADV5 — a pointerdown on a <label> wrapping an <input> inside a .pane-frame is NOT hijacked', () => {
    it('does not call startPaneDrag when the deepest target is a label wrapping an input', () => {
      const host = makeHost()
      const { layout, frame } = authorShell()
      void layout
      const label = el('label')
      const input = el('input')
      label.appendChild(input)
      frame.appendChild(label)
      installShellPointers(host)
      // DEEPEST target = the <label>, which WRAPS the interactive <input>. The
      // input is a CHILD, not an ancestor — the current ancestor climb never
      // sees it — and `label` is not in the interactive-tag set → hijacked.
      label.dispatchPointer('pointerdown', { pointerId: 9, clientX: 200, clientY: 200 })
      // RED (current): label is not interactive → the pane drag is hijacked.
      expect(countCalls(host, 'startPaneDrag'), 'a pointerdown on a label wrapping an input must never start a pane drag').toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // ADV4 — installShellPointers is idempotent.
  // -------------------------------------------------------------------------
  describe('ADV4 — installShellPointers is idempotent (a second call is a no-op)', () => {
    it('registers EXACTLY ONE delegated pointerdown listener across two install calls', () => {
      const host = makeHost()
      installShellPointers(host)
      installShellPointers(host)
      // RED (current): every call adds another document-level delegated pointerdown
      // listener → a second install doubles the wiring.
      expect((docListeners()['pointerdown'] ?? []).length, 'installShellPointers must be idempotent — exactly ONE delegated pointerdown listener').toBe(1)
    })
  })
})
