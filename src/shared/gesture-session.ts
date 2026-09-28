/** `U-GSESSION` — the node-local interaction session (`docs/specs/gsession.md` §2.1).
 *
 *  One gesture lifecycle per instance: one start listener on each control element it is
 *  handed, tracking listeners that exist only between a start and its terminal, exactly one
 *  call to the injected commit callback per gesture that reaches an `end`/`reset` terminal,
 *  and a `dispose()` that restores this session's own listener baseline. The session holds
 *  no policy — no bound, no default, no axis, no drop resolution — computes no value,
 *  validates nothing, and reads no field of any event object it is handed. It imports
 *  nothing and reads no ambient global: the event source and the controls are arguments. */

export type GestureElement = unknown

export interface EventSource {
  on(element: GestureElement, type: string, handler: () => void): void
  off(element: GestureElement, type: string, handler: () => void): void
  isConnected?(element: GestureElement): boolean
  /** OPTIONAL — THE SOURCE'S CAPTURE CAPABILITY. Invoked AT MOST ONCE per gesture, only
   *  inside `begin`, only after the gesture is established (after the three tracking
   *  attaches), and only for a control that opted in with a truthy `capture`. ITS ABSENCE
   *  IS THE DECLARED DEGRADATION: zero calls, no throw and no diagnostic, and the gesture
   *  still establishes and still terminates normally. A throw from it is swallowed by the
   *  same valid-state rule as the source's other callables — it never reaches the
   *  consumer boundary and never fails a gesture. */
  capturePointer?(element: GestureElement): void
}

export interface GestureOptionsInput {
  readonly capture?: unknown
  readonly onStart?: unknown
  readonly onMove?: unknown
  readonly onEnd?: unknown
  readonly onCancel?: unknown
}

export interface GestureOptions {
  readonly capture: boolean
  readonly onStart?: (element: GestureElement) => void
  readonly onMove?: (gesture: GestureHandle) => void
  readonly onEnd?: (element: GestureElement, value: unknown) => void
  readonly onCancel?: (element: GestureElement) => void
}

export interface GestureHandle {
  readonly id: number
  readonly element: GestureElement
  readonly active: boolean
  readonly outcome: 'end' | 'reset' | 'cancel' | null
  readonly value: unknown
  set(value: unknown): GestureHandle
}

export interface SessionOptions {
  readonly source?: EventSource
  readonly commit?: (gesture: GestureHandle, value: unknown) => void
}

/** The closed result-code union — seven members, no eighth. */
type GestureCode = 'ok' | 'not-installed' | 'busy' | 'disposed' | 'disconnected' | 'stale' | 'no-gesture'

type GestureOutcome = 'end' | 'reset' | 'cancel' | null

type BeginResult =
  | { readonly ok: true; readonly gesture: GestureHandle }
  | { readonly ok: false; readonly code: GestureCode }

type TerminalResult = {
  readonly ok: boolean
  readonly code: GestureCode
  readonly committed: boolean
}

type DisposeReport = {
  readonly removed: number
  readonly complete: boolean
}

export interface SessionStats {
  readonly installed: number
  readonly sourceCalls: number
  readonly gestures: number
  readonly commits: number
  readonly active: boolean
  readonly gestureId: number
  readonly lastCode: GestureCode
}

export interface GestureStats {
  readonly active: boolean
  readonly id: number
  readonly outcome: GestureOutcome
  readonly value: unknown
  readonly commits: number
}

interface GestureSession {
  install(element: GestureElement, options?: GestureOptionsInput): boolean
  begin(element: GestureElement): BeginResult
  end(element: GestureElement, gesture: GestureHandle, value?: unknown): TerminalResult
  reset(element: GestureElement, gesture: GestureHandle, value: unknown): TerminalResult
  cancel(element: GestureElement, gesture?: GestureHandle): TerminalResult
  dispose(): DisposeReport
  gesture(): GestureStats | null
  stats(): SessionStats
  readonly disposed: boolean
}

/** The four event type names this module contracts with its injected source. Frozen, and the
 *  only strings it owns besides its seven result codes: no caller-supplied event type exists,
 *  so no selector string and no cut-off number appears here at all. */
export const POINTER_TYPES: Readonly<Record<'start' | 'move' | 'end' | 'cancel', string>> = Object.freeze({
  start: 'pointerdown',
  move: 'pointermove',
  end: 'pointerup',
  cancel: 'pointercancel',
})

/** One installed control element, keyed by OBJECT IDENTITY. */
interface ControlEntry {
  readonly element: GestureElement
  readonly options: GestureOptions
  readonly handler: (() => void) | null
  readonly attached: boolean
}

/** The three tracking handlers a gesture opens and closes with it. */
interface TrackingHandlers {
  readonly move: () => void
  readonly finish: () => void
  readonly stop: () => void
}

/** AT MOST ONE record exists per session, and every terminal discards it. */
interface GestureRecord {
  readonly id: number
  readonly element: GestureElement
  readonly options: GestureOptions
  handle: GestureHandle
  tracking: TrackingHandlers
  value: unknown
  outcome: GestureOutcome
  active: boolean
  commits: number
}

/** A total member read: a hostile holder or a throwing accessor yields `undefined`. */
function readMember(holder: unknown, key: string): unknown {
  try {
    if (holder === null || holder === undefined) return undefined
    return (holder as Record<string, unknown>)[key]
  } catch {
    return undefined
  }
}

/** The usability rule: a source whose `on` and `off` are both callable. Anything else is the
 *  valid-state degradation, never a throw. */
function callableSource(candidate: unknown): EventSource | null {
  const onMember = readMember(candidate, 'on')
  const offMember = readMember(candidate, 'off')
  if (typeof onMember !== 'function' || typeof offMember !== 'function') return null
  return candidate as EventSource
}

/** The consumer's per-control input, resolved: `capture` to a boolean, hooks only where the
 *  caller supplied a callable. An absent `capture` is the ABSENCE OF OPT-IN. */
function resolveOptions(input?: GestureOptionsInput): GestureOptions {
  const startHook = readMember(input, 'onStart')
  const moveHook = readMember(input, 'onMove')
  const endHook = readMember(input, 'onEnd')
  const cancelHook = readMember(input, 'onCancel')
  return {
    capture: Boolean(readMember(input, 'capture')),
    onStart: typeof startHook === 'function' ? (startHook as (element: GestureElement) => void) : undefined,
    onMove: typeof moveHook === 'function' ? (moveHook as (gesture: GestureHandle) => void) : undefined,
    onEnd: typeof endHook === 'function' ? (endHook as (element: GestureElement, value: unknown) => void) : undefined,
    onCancel: typeof cancelHook === 'function' ? (cancelHook as (element: GestureElement) => void) : undefined,
  }
}

/** Attach the gesture-start listener for ONE control element, on the INJECTED source.
 *  Returns the handler it attached, or `null` when the source is unusable or the element is
 *  `null`/`undefined`. Never throws. */
export function installGestureListeners(
  source: EventSource | undefined,
  element: GestureElement,
  onStart: (element: GestureElement) => void,
): (() => void) | null {
  if (element === null || element === undefined) return null
  const seam = callableSource(source)
  if (seam === null || typeof onStart !== 'function') return null
  const handler = (): void => {
    onStart(element)
  }
  try {
    seam.on(element, POINTER_TYPES.start, handler)
  } catch {
    return null
  }
  return handler
}

/** Detach a handler previously attached by `installGestureListeners`, with the SAME three
 *  values. Returns `true` iff the source's `off` was callable and returned without throwing. */
export function detachGestureListeners(
  source: EventSource | undefined,
  element: GestureElement,
  handler: (() => void) | null,
): boolean {
  const seam = callableSource(source)
  if (seam === null || typeof handler !== 'function') return false
  try {
    seam.off(element, POINTER_TYPES.start, handler)
    return true
  } catch {
    return false
  }
}

/** The factory: total for ANY argument, including a hostile object, a primitive or
 *  `undefined`. An unusable source yields a usable, inert-until-usable instance. */
export function createGestureSession(options?: SessionOptions): GestureSession {
  const seam = callableSource(readMember(options, 'source'))
  const commitMember = readMember(options, 'commit')
  const commit =
    typeof commitMember === 'function' ? (commitMember as (gesture: GestureHandle, value: unknown) => void) : null
  const entries: ControlEntry[] = []
  const counters = { calls: 0, gestures: 0, commits: 0, lastCode: 'ok' as GestureCode }
  let slot: GestureRecord | null = null
  let ended = false

  const refuseBegin = (code: GestureCode): BeginResult => {
    counters.lastCode = code
    return { ok: false, code }
  }

  const refuseTerminal = (code: GestureCode): TerminalResult => {
    counters.lastCode = code
    return { ok: false, code, committed: false }
  }

  /** One `on` call through the injected source, counted only when it returns. */
  const callOn = (element: GestureElement, type: string, handler: () => void): boolean => {
    if (seam === null) return false
    try {
      seam.on(element, type, handler)
      counters.calls += 1
      return true
    } catch {
      return false
    }
  }

  /** One `off` call through the injected source, caught PER CALL so the remaining detaches
   *  still run. */
  const callOff = (element: GestureElement, type: string, handler: () => void): boolean => {
    if (seam === null) return false
    try {
      seam.off(element, type, handler)
      counters.calls += 1
      return true
    } catch {
      return false
    }
  }

  /** The ONE connectivity reading allowed, consulted once per `begin` attempt. Only an exact
   *  `false` is a failing answer; absence, a non-boolean and a throw are "no contrary
   *  evidence". */
  const connected = (element: GestureElement): boolean => {
    const probe = readMember(seam, 'isConnected')
    if (typeof probe !== 'function') return true
    try {
      const answer = (probe as (element: GestureElement) => unknown).call(seam, element)
      counters.calls += 1
      return answer !== false
    } catch {
      return true
    }
  }

  /** The capture call: inside `begin`, AFTER the tracking listeners are open, and only for a
   *  control that opted in. Never before establishment, never more than once. */
  const capturePointer = (element: GestureElement): void => {
    // ⟶ THE CAPTURE METHOD IS THE SOURCE'S OWN, DISCOVERED UNDER A MODULE-NEUTRAL
    // NAME (the 2026-09-27 ruling): the contract requires exactly ONE capture call
    // on an opted-in establishment while the module's own bytes may carry no
    // DOM-specific capture-method token — so the session calls whatever the
    // injected source supplies for this capability, and names it neutrally here.
    const member = readMember(seam, 'capturePointer')
    if (typeof member !== 'function') return
    try {
      ;(member as (element: GestureElement) => void).call(seam, element)
    } catch {
      return
    }
  }

  /** The handle of ONE gesture: live readings, and a `set` that is a no-op off the gesture. */
  const buildHandle = (record: GestureRecord): GestureHandle => {
    const handle: GestureHandle = {
      get id(): number {
        return record.id
      },
      get element(): GestureElement {
        return record.element
      },
      get active(): boolean {
        return record.active
      },
      get outcome(): GestureOutcome {
        return record.outcome
      },
      get value(): unknown {
        return record.value
      },
      set(value: unknown): GestureHandle {
        if (record.active) record.value = value
        return handle
      },
    }
    return handle
  }

  /** The ledger is keyed by identity, and only an ATTACHED entry is an installed control. */
  const attachedEntry = (element: GestureElement): ControlEntry | null => {
    for (const entry of entries) {
      if (entry.element === element && entry.attached) return entry
    }
    return null
  }

  const ledgerKnows = (element: GestureElement): boolean => {
    for (const entry of entries) {
      if (entry.element === element) return true
    }
    return false
  }

  /** The tracking three, detached in the pinned order, once each. */
  const detachTracking = (record: GestureRecord): number => {
    let removed = 0
    if (callOff(record.element, POINTER_TYPES.move, record.tracking.move)) removed += 1
    if (callOff(record.element, POINTER_TYPES.end, record.tracking.finish)) removed += 1
    if (callOff(record.element, POINTER_TYPES.cancel, record.tracking.stop)) removed += 1
    return removed
  }

  const handleIsCurrent = (record: GestureRecord, element: GestureElement, gesture: GestureHandle): boolean => {
    const id = readMember(gesture, 'id')
    const owned = readMember(gesture, 'element')
    return id === record.id && owned === element && element === record.element
  }

  /** The committing terminal path: detach, mark inactive, run `onEnd`, then invoke the
   *  injected commit EXACTLY ONCE. A consumer error propagates; the seam is never retried. */
  const runTerminal = (record: GestureRecord, element: GestureElement, value: unknown, outcome: 'end' | 'reset'): void => {
    detachTracking(record)
    record.active = false
    record.outcome = outcome
    const final = outcome === 'reset' ? value : value !== undefined ? value : record.value
    let hookError: unknown = null
    try {
      const endHook = record.options.onEnd
      if (endHook !== undefined) endHook(element, final)
    } catch (error) {
      hookError = error
    }
    slot = null
    let commitError: unknown = null
    if (commit !== null) {
      counters.commits += 1
      record.commits = 1
      try {
        commit(record.handle, final)
      } catch (error) {
        commitError = error
      }
    }
    counters.lastCode = 'ok'
    if (hookError !== null) throw hookError
    if (commitError !== null) throw commitError
  }

  const beginOperation = (element: GestureElement): BeginResult => {
    if (ended) return refuseBegin('disposed')
    if (slot !== null) return refuseBegin('busy')
    const entry = attachedEntry(element)
    if (entry === null) return refuseBegin('not-installed')
    if (!connected(element)) return refuseBegin('disconnected')
    const record: GestureRecord = {
      id: counters.gestures + 1,
      element,
      options: entry.options,
      handle: null as unknown as GestureHandle,
      tracking: null as unknown as TrackingHandlers,
      value: undefined,
      outcome: null,
      active: true,
      commits: 0,
    }
    record.handle = buildHandle(record)
    record.tracking = {
      move: (): void => {
        if (!record.active) return
        const moveHook = record.options.onMove
        if (moveHook !== undefined) moveHook(record.handle)
      },
      finish: (): void => {
        endOperation(record.element, record.handle)
      },
      stop: (): void => {
        cancelOperation(record.element, record.handle)
      },
    }
    slot = record
    // ⟶ ADV-GS-2 (2026-09-27): the three tracking attaches are CHECKED. A source whose
    // `on` refuses a tracking type must not leave a gesture that reports `ok` while no
    // move/up/cancel listener exists — that latched the consumer in `busy` for the rest
    // of the session. On any failure the successful attaches are ROLLED BACK, the element
    // stays installed, no ledger entry is created, and the refusal is reported with the
    // existing closed-domain code `'not-installed'` (no EIGHTH code member is invented —
    // §2.2/§4.4 S-9 keep the seven-member domain).
    const trackingAttached: boolean[] = [
      callOn(element, POINTER_TYPES.move, record.tracking.move),
      callOn(element, POINTER_TYPES.end, record.tracking.finish),
      callOn(element, POINTER_TYPES.cancel, record.tracking.stop),
    ]
    if (trackingAttached.some((ok) => !ok)) {
      detachTracking(record)
      record.active = false
      slot = null
      counters.lastCode = 'not-installed'
      return { ok: false, code: 'not-installed' }
    }
    if (record.options.capture) capturePointer(element)
    const startHook = record.options.onStart
    if (startHook !== undefined) {
      try {
        startHook(element)
      } catch (error) {
        detachTracking(record)
        record.active = false
        slot = null
        throw error
      }
    }
    // ⟶ ADV-GS-30 (2026-09-27): THE MID-CALL DISPOSAL IS RE-CHECKED HERE — at the END of the
    // establishment order and ABOVE the counter increment the two dated notes below pin. Two
    // of the four establishment steps ABOVE run CONSUMER code: the opt-in capture call (item
    // 6(b), which runs BEFORE `onStart`) and `onStart` itself — so a consumer can call
    // `dispose()` on the very session that is still inside `begin` (`§2.3` item 1(d)'s
    // establishment order, which item 7.7 cites). THE DISPOSAL GOVERNS THAT CALL (`§2.3` item
    // 7.7): it must NOT report success, so the attempt REFUSES with the EXISTING closed-domain
    // code `'disposed'` (no EIGHTH member is invented — `§2.2`/`§4.4` S-9), and the refused
    // attempt consumes NOTHING. The disposal has ALREADY discarded the record, marked it
    // inactive and emptied the ledger (item 7.3), so this refusal does not resurrect either:
    // `slot` stays `null`, the record stays inactive, `gesture()` stays `null`,
    // `stats().active` stays `false`, and the baseline stays restored (item 7.2, `I-5` —
    // `dispose()` detached the three tracking listeners AND the start listener, so nothing of
    // this attempt's comes back). `slot !== record` is the same order's OTHER discard shape —
    // consumer code that ends this attempt's own record while the call is still open (a
    // `cancel` of the same element needs no handle) — and it reports the same refusal, because
    // a call may not report success on a record that no longer exists; neither half is
    // reachable on an established path (`slot` is assigned this `record` above, and only a
    // terminal, a disposal, or this order's own re-entrancy can move it). `refuseBegin` sets
    // `counters.lastCode` the way this module's other refusals set their codes: `§2.1`'s
    // `lastCode` cell reads "the LAST result code this session produced", while item 7.7
    // records that it pins NO `lastCode` cell for this path — so the code set here is that
    // cell's DERIVATION and not an invented cell.
    if (ended || slot !== record) return refuseBegin('disposed')
    // ⟶ ADV-GS-15 (2026-09-27): the GESTURE COUNTER — and the id it feeds — is incremented
    // only by a `begin` that ESTABLISHES, i.e. AFTER the tracking-attach check above. The
    // counter previously moved before that check, so a REFUSED `begin` counted as a gesture
    // and consumed the id the next real gesture was handed. `§2.1`'s `SessionStats.gestures`
    // counts "Successful `begin` calls", and §2.4 item 4 has the id start at `1` and
    // increment on every SUCCESSFUL `begin` — a refusal creates no gesture (its record is
    // discarded above). Ids stay consecutive for successful gestures.
    // ⟶ ADV-GS-16 (2026-09-27): the SAME clause covers the hook path, so the increment now
    // sits after the `onStart` try/catch as well — a `begin` whose `onStart` THROWS is not a
    // successful `begin` (`§2.1`'s `gestures` cell, §2.4 item 4, M-2, §2.3 item 1(d)): it
    // returns no result and rethrows, so it consumes neither the counter nor the id. The
    // record's own `id` is still read at record-build time as `counters.gestures + 1` — the
    // id establishment WILL be given — so the ids handed to successful gestures stay
    // consecutive (`1, 2, 3…`) and this path's unused one is not consumed.
    counters.gestures += 1
    counters.lastCode = 'ok'
    return { ok: true, gesture: record.handle }
  }

  const endOperation = (element: GestureElement, gesture: GestureHandle, value?: unknown): TerminalResult => {
    if (ended) return refuseTerminal('disposed')
    const record = slot
    if (record === null || !record.active) return refuseTerminal('no-gesture')
    if (!handleIsCurrent(record, element, gesture)) return refuseTerminal('stale')
    runTerminal(record, element, value, 'end')
    return { ok: true, code: 'ok', committed: true }
  }

  const resetOperation = (element: GestureElement, gesture: GestureHandle, value: unknown): TerminalResult => {
    if (ended) return refuseTerminal('disposed')
    const record = slot
    if (record === null || !record.active) return refuseTerminal('no-gesture')
    if (!handleIsCurrent(record, element, gesture)) return refuseTerminal('stale')
    runTerminal(record, element, value, 'reset')
    return { ok: true, code: 'ok', committed: true }
  }

  /** The cancel path: detach, run `onCancel`, and invoke `commit` ZERO times. */
  const cancelOperation = (element: GestureElement, gesture?: GestureHandle): TerminalResult => {
    if (ended) return refuseTerminal('disposed')
    const record = slot
    if (record === null || !record.active) return refuseTerminal('no-gesture')
    if (element !== record.element) return refuseTerminal('no-gesture')
    if (gesture !== undefined && gesture !== null && !handleIsCurrent(record, element, gesture)) {
      return refuseTerminal('stale')
    }
    detachTracking(record)
    record.active = false
    record.outcome = 'cancel'
    slot = null
    counters.lastCode = 'ok'
    const cancelHook = record.options.onCancel
    if (cancelHook !== undefined) cancelHook(element)
    return { ok: true, code: 'ok', committed: false }
  }

  const installOperation = (element: GestureElement, options?: GestureOptionsInput): boolean => {
    if (ended) return false
    if (element === null || element === undefined) return false
    if (ledgerKnows(element)) return false
    if (seam === null) return false
    const resolved = resolveOptions(options)
    const handler = (): void => {
      beginOperation(element)
    }
    const attached = callOn(element, POINTER_TYPES.start, handler)
    // ⟶ ADV-GS-1 (2026-09-27): a FAILED start attach leaves NO ledger entry — the
    // contract says so twice (§2.4 item 6, §2.3 item 1(c)), and the old unconditional
    // push bricked the element for the session's whole lifetime (a transient seam
    // failure could never be retried). A successful attach still records, so a repeat
    // install stays a first-config-wins no-op.
    if (!attached) return false
    entries.push({ element, options: resolved, handler, attached: true })
    return true
  }

  /** The baseline restore: cancel without committing, detach EVERY listener this session
   *  attached, empty the ledger and leave the instance permanently inert. Idempotent. */
  const disposeOperation = (): DisposeReport => {
    if (ended) return { removed: 0, complete: true }
    ended = true
    let removed = 0
    let complete = true
    const record = slot
    if (record !== null && record.active) {
      const detached = detachTracking(record)
      removed += detached
      if (detached !== 3) complete = false
      record.active = false
      record.outcome = 'cancel'
      const cancelHook = record.options.onCancel
      if (cancelHook !== undefined) {
        try {
          cancelHook(record.element)
        } catch {
          complete = complete
        }
      }
    }
    slot = null
    for (const entry of entries) {
      if (entry.attached && entry.handler !== null) {
        if (callOff(entry.element, POINTER_TYPES.start, entry.handler)) removed += 1
        else complete = false
      }
    }
    entries.length = 0
    return { removed, complete }
  }

  const gestureReading = (): GestureStats | null => {
    const record = slot
    if (record === null) return null
    return {
      active: record.active,
      id: record.id,
      outcome: record.outcome,
      value: record.value,
      commits: record.commits,
    }
  }

  const statsReading = (): SessionStats => {
    let installed = 0
    for (const entry of entries) {
      if (entry.attached) installed += 1
    }
    return {
      installed,
      sourceCalls: counters.calls,
      gestures: counters.gestures,
      commits: counters.commits,
      active: slot !== null && slot.active,
      gestureId: slot !== null && slot.active ? slot.id : 0,
      lastCode: counters.lastCode,
    }
  }

  return {
    install: installOperation,
    begin: beginOperation,
    end: endOperation,
    reset: resetOperation,
    cancel: cancelOperation,
    dispose: disposeOperation,
    gesture: gestureReading,
    stats: statsReading,
    get disposed(): boolean {
      return ended
    },
  }
}
