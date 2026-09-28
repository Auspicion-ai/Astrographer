/** `U-GUTTER` — the node-local resize controller composed on the landed session, plus the
 *  exported pure `clampToBounds` (`docs/specs/gutter.md` §2.1).
 *
 *  The controller owns no lifecycle: the composed session establishes, tracks and terminates
 *  every gesture, and this module only reads the values a gesture carries. Its one output is
 *  an arithmetic one — a value read at the terminal, narrowed into the caller's own pair, and
 *  handed to the injected sink at most once. It computes no magnitude of its own: the value
 *  is produced by the consumer, which pushes it through the handle it is given. It reads no
 *  coordinate, takes no event object, holds no persistent state, and knows nothing about what
 *  it is resizing. */

import type { GestureHandle } from './gesture-session.js'

export interface ClampBounds {
  readonly min: number
  readonly max: number
}

export interface AxisFor {
  (element: unknown): unknown
}

export interface BoundsFor {
  (element: unknown, axis: unknown): unknown
}

export interface DefaultSizeFor {
  (element: unknown, axis: unknown): unknown
}

export interface IsResizable {
  (element: unknown, axis: unknown): unknown
}

export interface CommitSink {
  (gesture: GestureHandle, value: number): void
}

export interface ResizeStats {
  readonly attached: number
  readonly gestures: number
  readonly sinkCalls: number
  readonly written: number
  readonly resets: number
  readonly lastCode: string
}

export interface ResizeControllerHandle {
  readonly element?: unknown
  readonly onStart?: (element: unknown) => void
  readonly onMove?: (gesture: GestureHandle) => void
  readonly onEnd?: (element: unknown, value: unknown) => void
  readonly onCancel?: (element: unknown) => void
}

export interface ResizeController {
  attach(element: unknown, hooks?: ResizeControllerHandle): boolean
  detach(): boolean
  reset(element: unknown): ResizeResetResult
  stats(): ResizeStats
  readonly detached: boolean
}

export interface ResizeControllerOptions {
  readonly session?: unknown
  readonly axisFor?: AxisFor
  readonly boundsFor?: BoundsFor
  readonly defaultSizeFor?: DefaultSizeFor
  readonly isResizable?: IsResizable
  readonly sizeFor?: (element: unknown, gesture: GestureHandle, axis: unknown) => unknown
  readonly commit?: CommitSink
}

/** The controller's reset answer: what the composition did, never a session-side guess. */
type ResizeResetResult = {
  readonly ok: boolean
  readonly code: string
  readonly committed: boolean
}

/** The composition's closed code domain: the session's own seven members, propagated
 *  verbatim, plus the two codes this module emits on the paths where the session is never
 *  consulted at all. */
type ResizeCode =
  | 'ok'
  | 'not-installed'
  | 'busy'
  | 'disposed'
  | 'disconnected'
  | 'stale'
  | 'no-gesture'
  | 'unusable-default'
  | 'not-resizable'

type AnySeam = (...args: unknown[]) => unknown

/** The one value-bearing answer this module produces: total, with a refusal domain of none. */
export function clampToBounds(value: unknown, bounds: unknown): number {
  const notANumber = Number.NaN
  if (typeof value !== 'number') return notANumber
  const holder = bounds as { readonly min?: unknown; readonly max?: unknown } | null | undefined
  let low: unknown
  let high: unknown
  try {
    low = holder === null || holder === undefined ? undefined : holder.min
    high = holder === null || holder === undefined ? undefined : holder.max
  } catch {
    return notANumber
  }
  if (typeof low !== 'number' || typeof high !== 'number') return notANumber
  return Math.max(low, Math.min(value, high))
}

function readMember(host: unknown, key: string): unknown {
  try {
    return (host as Record<string, unknown> | null | undefined)?.[key]
  } catch {
    return undefined
  }
}

function callableMember(host: unknown, key: string): AnySeam | null {
  const member = readMember(host, key)
  return typeof member === 'function' ? (member as AnySeam) : null
}

/** A session is usable when its five members are callable. Anything else is the declared
 *  valid-but-inert degradation, never a throw at the consumer boundary. */
function usableSession(candidate: unknown): boolean {
  for (const key of ['install', 'reset', 'dispose', 'stats', 'gesture']) {
    if (callableMember(candidate, key) === null) return false
  }
  return true
}

/** One attached control, and the per-gesture state that lives exactly as long as the gesture. */
interface ResizeEntry {
  readonly element: unknown
  readonly hooks: ResizeControllerHandle
  attached: boolean
  gesture: GestureHandle | null
  axis: unknown
  resizable: boolean
  narrowed: unknown
  narrowedSet: boolean
  spent: boolean
  wrappedOnStart: (element: unknown) => void
  wrappedOnMove: (gesture: GestureHandle) => void
  wrappedOnEnd: (element: unknown, value: unknown) => void
  wrappedOnCancel: (element: unknown) => void
}

/** The composition: total for ANY argument, including a hostile holder, a primitive or
 *  nothing at all. An unusable session yields a usable but inert instance. */
export function createResizeController(options?: ResizeControllerOptions): ResizeController {
  const session = readMember(options, 'session')
  const seamAxis = readMember(options, 'axisFor')
  const seamBounds = callableMember(options, 'boundsFor')
  const seamDefault = callableMember(options, 'defaultSizeFor')
  const seamResizable = callableMember(options, 'isResizable')
  const seamSize = callableMember(options, 'sizeFor')
  const commit = callableMember(options, 'commit')

  const inert = !usableSession(session)
  const entries: ResizeEntry[] = []
  const counters = { attached: 0, gestures: 0, sinkCalls: 0, written: 0, resets: 0, lastCode: 'ok' as ResizeCode }
  let ended = false

  /** THE SESSION'S OWN PERMANENT-INERT READING — one of the three members this composition may
   *  READ, read through the total reader and never assigned here. It is the second limb of
   *  `detached`, and the state on which every delegation below is refused. */
  const sessionEnded = (): boolean => readMember(session, 'disposed') === true

  const refusal = (code: ResizeCode): ResizeResetResult => {
    counters.lastCode = code
    return { ok: false, code, committed: false }
  }

  /** THE TOKEN: produced once per gesture and handed on untouched. An absent, non-callable
   *  or throwing producer yields `undefined` — never a throw of its own. */
  const tokenFor = (element: unknown): unknown => {
    if (typeof seamAxis !== 'function') return undefined
    try {
      return (seamAxis as AnySeam).call(options, element)
    } catch {
      return undefined
    }
  }

  /** THE DECISION: read once per gesture, ahead of any evaluation of it. Truthiness decides,
   *  and a refusal of any kind is a falsy decision rather than an error. */
  const decisionFor = (element: unknown, axis: unknown): boolean => {
    if (seamResizable === null) return false
    try {
      return seamResizable.call(options, element, axis) ? true : false
    } catch {
      return false
    }
  }

  const entryOf = (element: unknown): ResizeEntry | null => {
    for (const entry of entries) {
      if (entry.element === element) return entry
    }
    return null
  }

  const liveEntryOf = (element: unknown): ResizeEntry | null => {
    for (const entry of entries) {
      if (entry.element === element && entry.attached) return entry
    }
    return null
  }

  const attachedCount = (): number => {
    let live = 0
    for (const entry of entries) {
      if (entry.attached) live += 1
    }
    return live
  }

  const pairFor = (element: unknown, axis: unknown): unknown => {
    if (seamBounds === null) return undefined
    return seamBounds.call(options, element, axis)
  }

  /** THE ONE WRITE — this module's only call site of the sink, reached only from a
   *  committing terminal and at most once per gesture. A sink that throws is COUNTED as an
   *  attempt and never retried: the attempt reaches the consumer boundary as a value, not as
   *  a failure. */
  const write = (gesture: GestureHandle, narrowed: unknown, reset?: boolean): void => {
    if (typeof narrowed !== 'number' || narrowed !== narrowed) {
      return
    }
    if (commit === null) return
    counters.sinkCalls += 1
    try {
      if (reset === true) gesture.set(narrowed)
      commit(gesture, narrowed)
      counters.written += 1
    } catch {
      return
    }
  }

  /** The hooks this composition hands the session: only the move turn is wrapped — it is the
   *  session's one legal handle channel — and the consumer's own hooks travel onward
   *  unchanged, never swallowed, reordered or altered. */
  const buildEntry = (element: unknown, hooks: ResizeControllerHandle): ResizeEntry => {
    const entry: ResizeEntry = {
      element,
      hooks,
      attached: false,
      gesture: null,
      axis: undefined,
      resizable: false,
      narrowed: undefined,
      narrowedSet: false,
      spent: false,
      wrappedOnStart: (element0: unknown): void => {
        entry.axis = tokenFor(element)
        entry.resizable = decisionFor(element, entry.axis)
        entry.gesture = null
        entry.narrowed = undefined
        entry.narrowedSet = false
        entry.spent = false
        counters.gestures += 1
        const consumer = entry.hooks === null || entry.hooks === undefined ? undefined : entry.hooks.onStart
        if (typeof consumer === 'function') (consumer as (element: unknown) => void)(element0)
      },
      wrappedOnMove: (gesture: GestureHandle): void => {
        entry.gesture = gesture
        entry.narrowed = undefined
        entry.narrowedSet = false
        entry.spent = false
        const consumer = entry.hooks === null || entry.hooks === undefined ? undefined : entry.hooks.onMove
        if (typeof consumer === 'function') consumer(gesture)
      },
      wrappedOnEnd: (element0: unknown, value: unknown): void => {
        const gesture = entry.gesture
        const suppliedSet = entry.narrowedSet
        entry.gesture = null
        entry.narrowedSet = false
        if (!suppliedSet) {
          entry.narrowed = undefined
          if (entry.resizable && gesture !== null && seamSize !== null) {
            const size = seamSize.call(options, element, gesture, entry.axis)
            if (seamBounds === null) {
              entry.narrowed = clampToBounds(size, undefined)
            } else {
              const pair = seamBounds.call(options, element, entry.axis)
              entry.narrowed = pair === undefined ? clampToBounds(size, undefined) : clampToBounds(size, pair)
            }
          }
        }
        try {
          const consumer = entry.hooks === null || entry.hooks === undefined ? undefined : entry.hooks.onEnd
          if (typeof consumer === 'function') {
            ;(consumer as (element: unknown, value: unknown) => void)(element0, value)
          }
        } finally {
          // THE TERMINAL'S OWN BOOKKEEPING IS UNCONDITIONAL, and the record is never put back: the
          // per-gesture handle is discarded whether or not the consumer hook returned, so a later
          // `reset(element)` can never reach for a dead handle. A value the reset path supplied
          // belongs to the session's committing terminal, which has not recorded it yet at this
          // point; the write below is what carries it.
          const narrowed = entry.narrowed
          const spent = entry.spent
          entry.gesture = null
          entry.narrowed = undefined
          entry.narrowedSet = false
          if (gesture !== null && !spent) {
            entry.spent = true
            write(gesture, narrowed, suppliedSet)
          }
        }
      },
      wrappedOnCancel: (element0: unknown): void => {
        const consumer = entry.hooks === null || entry.hooks === undefined ? undefined : entry.hooks.onCancel
        if (typeof consumer === 'function') (consumer as (element: unknown) => void)(element0)
      },
    }
    return entry
  }

  const attach = (element: unknown, hooks?: ResizeControllerHandle): boolean => {
    if (ended || inert || sessionEnded()) return false
    if (element === null || element === undefined) return false
    if (entryOf(element) !== null) return false
    const installer = callableMember(session, 'install')
    if (installer === null) return false
    const entry = buildEntry(element, hooks === null || hooks === undefined ? {} : hooks)
    const wrapped: Record<string, unknown> = {
      onStart: entry.wrappedOnStart,
      onMove: entry.wrappedOnMove,
      onEnd: entry.wrappedOnEnd,
      onCancel: entry.wrappedOnCancel,
    }
    let installed = false
    try {
      installed = Boolean(installer.call(session, element, wrapped))
    } catch {
      installed = false
    }
    if (!installed) return false
    entry.attached = true
    entries.push(entry)
    counters.attached = attachedCount()
    return true
  }

  const detach = (): boolean => {
    if (ended || inert || sessionEnded()) return false
    if (attachedCount() > 1) return false
    const closer = callableMember(session, 'dispose')
    if (closer === null) return false
    let report: unknown
    try {
      report = closer.call(session)
    } catch {
      return false
    }
    ended = true
    for (const entry of entries) {
      entry.attached = false
      entry.gesture = null
        entry.narrowed = undefined
      entry.narrowedSet = false
      entry.spent = false
    }
    counters.attached = 0
    const record = report as { readonly complete?: unknown } | null | undefined
    return record !== null && record !== undefined && record.complete === true
  }

  const reset = (element: unknown): ResizeResetResult => {
    if (inert) return { ok: false, code: 'no-gesture', committed: false }
    const entry = liveEntryOf(element)
    if (entry === null || entry.gesture === null) return refusal('no-gesture')
    if (!entry.resizable) return refusal('not-resizable')
    const gesture = entry.gesture
    let supplied: unknown
    if (seamDefault !== null) {
      try {
        supplied = seamDefault.call(options, element, entry.axis)
      } catch {
        return refusal('unusable-default')
      }
    }
    if (!(typeof supplied === 'number') || Number.isNaN(supplied as number)) {
      return refusal('unusable-default')
    }
    const pair = pairFor(element, entry.axis)
    const narrowed = clampToBounds(supplied, pair)
    const terminal = callableMember(session, 'reset')
    if (terminal === null) return refusal('no-gesture')
    const before = counters.written
    entry.narrowed = narrowed
    entry.narrowedSet = true
    entry.spent = false
    let answer: unknown
    try {
      answer = terminal.call(session, element, gesture, narrowed)
    } catch {
      entry.narrowed = undefined
      entry.narrowedSet = false
      entry.spent = false
      return refusal('no-gesture')
    }
    entry.narrowed = undefined
    entry.narrowedSet = false
    entry.spent = false
    entry.gesture = null
    counters.resets += 1
    const record = answer as { readonly code?: unknown } | null | undefined
    const code =
      record !== null && record !== undefined && typeof record.code === 'string' ? (record.code as ResizeCode) : 'ok'
    counters.lastCode = code
    const wrote = counters.written > before
    return { ok: wrote, code, committed: wrote }
  }

  const stats = (): ResizeStats => {
    return {
      attached: counters.attached,
      gestures: counters.gestures,
      sinkCalls: counters.sinkCalls,
      written: counters.written,
      resets: counters.resets,
      lastCode: counters.lastCode,
    }
  }

  return {
    attach,
    detach,
    reset,
    stats,
    get detached(): boolean {
      return ended || sessionEnded()
    },
  }
}
