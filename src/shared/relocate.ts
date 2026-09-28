// src/shared/relocate.ts
// ===========================================================================
// `U-RELOCATE` — the node-local relocate/drop session composed on the landed
// gesture session, plus ONE exported pure total comparator (`withinProximity`).
//
// Contract: `docs/specs/relocate.md`. The module performs NO coordinate read, NO
// event read, NO geometry read, NO distance computation and NO unit-string or
// selector vocabulary of its own: the element is an OPAQUE argument, the measured
// scalar is the CALLER's and travels inside the candidate answer, and the ONE
// comparison this module owns is `withinProximity`'s. Every policy is injected.
//
// The ONLY import is TYPE-ONLY (the frozen session's handle type). The factory is
// TOTAL: it never throws for ANY argument, whatever the session or the seams do,
// with exactly TWO named propagation exceptions (a throwing sink at the terminal
// turn and a throwing presentation write at the observed-move turn).
// ===========================================================================
import type { GestureHandle } from './gesture-session.js'

/** THE PROXIMITY COMPARATOR — PURE and TOTAL, with NO REFUSAL DOMAIN.
 *  `threshold` is a proximity RADIUS around a candidate. The BOUNDARY IS INSIDE.
 *  The answer is `true` IFF BOTH operands pass the `typeof` gate AND are not `NaN`
 *  AND are NON-NEGATIVE AND (where finite) `distance <= threshold` holds; otherwise
 *  `false`. FOUR LIMBS, in that order:
 *
 *  (1) THE `typeof` GATE — a NON-NUMBER operand on either side answers `false` — no
 *      coercion, no parsing, no string round trip, and therefore a bigint operand
 *      cannot throw;
 *  (2) THE `NaN` LIMB — `NaN` on either side answers `false` (the comparison's own
 *      answer, and never the "not beyond" reading's `true`);
 *  (3) THE FINITE-NEGATIVE (UNUSABLE) LIMB — a FINITE operand `< 0` on either side
 *      answers `false`: a distance and a proximity radius are MAGNITUDES, so a
 *      negative value is not a distance. `-0` is NOT negative (`-0 < 0` is `false`)
 *      and keeps the boundary rule, and an INFINITE operand is NOT this class
 *      (`Number.isFinite(-Infinity)` is `false`) — this limb is NOT "any negative
 *      operand";
 *  (4) THE COMPARISON, VERBATIM over every remaining USABLE pair — the BOUNDARY IS
 *      INSIDE (`d === t` answers `true`), and a NON-FINITE operand REACHES THE
 *      COMPARISON UNCHANGED: `(-Infinity, a finite non-negative t)` is `true`,
 *      `(+Infinity, a finite t)` is `false`, `(+Infinity, +Infinity)` is `true` and
 *      `(-Infinity, -Infinity)` is `true` — no finiteness refusal exists.
 *
 *  MUTATES NOTHING, RETAINS NOTHING, READS NOTHING but its two arguments. */
export function withinProximity(distance: unknown, threshold: unknown): boolean {
  if (!isNumeric(distance) || !isNumeric(threshold)) return false
  if (Number.isNaN(distance) || Number.isNaN(threshold)) return false
  if (isFiniteNegative(distance) || isFiniteNegative(threshold)) return false
  return distance <= threshold
}

/** The numeric-operand reading, as a module-scope pure helper: the `typeof` gate
 *  is what makes the comparator total, and a named predicate keeps the ONE
 *  comparison inside the comparator itself. It holds no state. */
function isNumeric(value: unknown): value is number {
  return typeof value === 'number'
}

/** THE `distance` FIELD'S USABILITY CLASS — a FINITE, NON-NEGATIVE `number`, and
 *  nothing else. It is a CLASS TEST ON THE FIELD READ, never a comparison and never
 *  a second comparison site, and it is a DIFFERENT LAYER from the exported
 *  comparator's operand rule: a field value that is absent, a non-`number`, `NaN`
 *  or a NON-FINITE `number` is UNUSABLE and answers "nothing within proximity",
 *  while the SAME value handed to `withinProximity` as an OPERAND reaches that
 *  function's own limbs. The module reads the field ONCE per candidate and never
 *  repairs it: no default, no clamp and no re-read. */
function usableDistance(value: unknown): boolean {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

/** THE UNUSABLE-CLASS TEST — a FINITE negative operand, and nothing else. It is a
 *  CLASS TEST ON AN OPERAND, never a second comparison site: `Number.isFinite`
 *  excludes both infinities (which reach the comparison verbatim), `-0` is not
 *  negative, and `NaN` is answered by its own limb before this one runs. */
function isFiniteNegative(value: number): boolean {
  return Number.isFinite(value) && value < 0
}

/** THE CANDIDATE ANSWER — the shape the candidate source returns: an ARRAY of
 *  records, each carrying the caller's OPAQUE candidate beside the scalar the
 *  CALLER measured. This module never interprets the candidate, never compares it,
 *  never stringifies it and never keys anything by it. An unusable answer, a
 *  non-array answer, an element that is not a usable record and an unusable
 *  distance all answer "NOTHING WITHIN PROXIMITY" — never a throw, never a
 *  default. ONLY THE DISTANCE DECIDES proximity. */
export interface CandidateFor {
  readonly candidate: unknown
  readonly distance?: unknown
}

/** THE CHOSEN-TARGET SEAM — called DURING the gesture. It returns the caller's
 *  OPAQUE chosen target for that observation, or `undefined` for "no target this
 *  move" — and `undefined` is NOT a cancel. ABSENT / non-callable / THROWING
 *  answers the declared safe default `undefined`. */
export interface RelocateTargetFor {
  (element: unknown, candidates: readonly CandidateFor[], gesture: GestureHandle): unknown
}

/** THE ONE SINK — the composition's SINGLE SINK WRITER. The module invokes it
 *  EXACTLY ONCE at the terminal of any gesture that REACHED one: carrying the
 *  dragged/committed value on a completing terminal (and nothing at all when the
 *  resolved target is `undefined`) and the CALLER-SUPPLIED PRE-DRAG VALUE on the
 *  reset terminal the module's own move turn entered — ZERO times on a cancel and
 *  ZERO times on a terminal the session REFUSED. Its throw PROPAGATES to the
 *  caller of the terminal turn: it is a consumer boundary. */
export interface CommitSink {
  (gesture: GestureHandle, value: unknown): void
}

/** THE PER-MOVE TRANSIENT PRESENTATION WRITE — the ghost AND the show/hide of a
 *  candidate, including a retarget's hide-plus-show in ONE observed-move turn. It
 *  is invoked AT MOST ONCE PER OBSERVED MOVE, ZERO times at a terminal, and NEVER
 *  with a committing value: it is not the sink. Its throw PROPAGATES from the
 *  observed-move turn and the per-gesture record is discarded in the module's own
 *  `finally`. */
export interface PreviewSink {
  (state: unknown): void
}

/** THE PER-CONTROL HOOKS the consumer passes to `attach` — the FOUR hooks, all
 *  optional, forwarded into the session's own install call wherever the consumer
 *  supplied one, by IDENTITY. The module adds no fifth HOOK, no wrapping policy
 *  and no value computation; it owns and installs its own establishment and
 *  observation wrappers AROUND them.
 *
 *  ONE FURTHER MEMBER, AND IT IS NOT A HOOK: `preDragValueOf` reads the CALLER's
 *  pre-drag value. It is never forwarded into the options the session is handed
 *  and never invoked by the session. Its home is this per-control record only —
 *  the factory's option set stays closed, and no export is added. */
export interface RelocateHandle {
  readonly element: unknown
  readonly onStart?: (element: unknown) => void
  readonly onMove?: (gesture: GestureHandle) => void
  readonly onEnd?: (element: unknown, value: unknown) => void
  readonly onCancel?: (element: unknown) => void
  /** THE CALLER'S PRE-DRAG VALUE, read from this record. This module invokes it
   *  from its OWN establishment wrapper, for a gesture the session ESTABLISHED,
   *  EXACTLY ONCE per gesture, passing the element it received; the answer is held
   *  in the per-gesture record, handed on BY IDENTITY and discarded at every
   *  terminal in this module's own `finally`. It is the value the invalid arm
   *  commits as the THIRD argument of the session's reset terminal.
   *
   *  ITS DECLARED DEGRADATION: this is a VALUE-READING member, so a failure is
   *  ABSORBED and never propagated — ABSENT or carried with the value `undefined`,
   *  NON-CALLABLE, a callable that THROWS and a throwing accessor all answer THE
   *  NO-CALLER-VALUE REFUSAL: nothing is invented (no default, no sentinel), the
   *  third argument then reads `undefined`, neither `attach` nor the establishment
   *  turn throws, and the invalid arm's own counts and arity are UNCHANGED. */
  readonly preDragValueOf?: (element: unknown) => unknown
}

/** THE COMPOSITION'S OPTIONS — the SEVEN injected seams, and no eighth:
 *  `session`, `candidatesFor`, `resolveTarget`, `onReveal`, `commit`,
 *  `threshold`, `onPreview`. Every one is OPTIONAL and every one has a NAMED
 *  declared degradation; there is no capture member and no policy default. */
export interface RelocateOptions {
  readonly session?: unknown
  readonly candidatesFor?: unknown
  readonly resolveTarget?: RelocateTargetFor
  readonly onReveal?: unknown
  readonly commit?: CommitSink
  readonly threshold?: unknown
  readonly onPreview?: PreviewSink
}

/** THE MODULE — FIVE MEMBERS. Every member is TOTAL: none throws for ANY argument,
 *  whatever the session or the seams do, except the two named propagations. */
export interface RelocateSession {
  attach(element: unknown, hooks?: RelocateHandle): boolean
  detach(): boolean
  reset(element: unknown): RelocateResetResult
  stats(): RelocateStats
  readonly detached: boolean
}

/** THE MODULE'S OWN COUNTERS. All monotonic except `lastCode`. None of them counts
 *  a capture. */
export interface RelocateStats {
  /** Elements attached by THIS module, by identity. */
  readonly attached: number
  /** Gestures THIS module established — its own establishment wrapper ran. */
  readonly gestures: number
  /** OBSERVED MOVES — counted once per invocation of the module's own move wrapper. */
  readonly moves: number
  /** The candidate source's ATTEMPTS: counted once per observed move wherever the
   *  member carried a value other than `undefined` — including a non-callable and
   *  a callable that throws — and never retried. */
  readonly candidateCalls: number
  /** The resolve seam's ATTEMPTS, under the same reading as the candidate source. */
  readonly resolveCalls: number
  /** DURABLE REVEAL WRITES ATTEMPTED — every invocation of the reveal seam. */
  readonly revealWrites: number
  /** REVEAL WRITES THAT RETURNED without throwing. */
  readonly revealWritesApplied: number
  /** THE INVALID ARM — the number of times this module ENTERED the session's reset
   *  terminal, at most once per gesture. */
  readonly resets: number
  /** SINK CALLS ATTEMPTED — every invocation of the injected sink. */
  readonly sinkCalls: number
  /** SINK CALLS THAT RETURNED without throwing. */
  readonly written: number
  /** THE LAST SESSION CODE this module propagated. */
  readonly lastCode: string
}

/** The refusal record the module's own `reset(element)` entry point returns: the
 *  code domain is the SESSION's own closed union, propagated VERBATIM. */
interface RelocateResetResult {
  readonly ok: boolean
  readonly code: string
  readonly committed: boolean
}

/** The session's own members, as the module READS them. Every one is read through
 *  the module's own total member-read, so a hostile holder degrades to "unusable"
 *  rather than throwing. */
type SessionView = {
  readonly install: ((...args: unknown[]) => unknown) | null
  readonly reset: ((...args: unknown[]) => unknown) | null
  readonly dispose: ((...args: unknown[]) => unknown) | null
  readonly statsRead: ((...args: unknown[]) => unknown) | null
  readonly gestureRead: ((...args: unknown[]) => unknown) | null
  readonly disposedRead: boolean
}

/** The per-gesture record — the ONLY state that lives between an establishment and
 *  a terminal, and it is DISCARDED at every terminal in the module's own
 *  `finally`, never by asking the session anything. */
type GestureRecord = {
  handle: GestureHandle | null
  element: unknown
  hooks: Record<string, unknown> | null
  preDragValue: unknown
  lastAnswer: unknown
  target: unknown
  /** Whether the LAST observation placed a candidate within proximity — which is
   *  the question the committing turn's write is decided by (the resolved target
   *  alone cannot answer it, because the caller may resolve `undefined`). */
  within: boolean
  armed: boolean
  terminated: boolean
  /** WHETHER THIS GESTURE'S ONE SINK WRITE HAS ALREADY BEEN MADE. The arm's own
   *  `'reset'` terminal sets it, and from that turn on this gesture's sink slot is
   *  CONSUMED: a later terminal turn writes no second sink value, because the arm's
   *  commit is the gesture's one commit (`M-8`, `I-4`, `P-RL-SM-7`). The REVEAL is
   *  a different reading and is unaffected — a gesture that recovered into
   *  proximity still writes its one reveal at the completing terminal (`M-7`). */
  sinkSettled: boolean
  /** Whether the NEXT terminal turn to arrive is the ARM's own (the module sets
   *  this immediately before it enters the session's reset terminal, so that turn
   *  carries the caller-supplied pre-drag value and no reveal). */
  armPending: boolean
}

/** ONE total member-read. A missing member, a primitive holder and a THROWING
 *  ACCESSOR all read `undefined` rather than propagating. */
function readSlot(holder: unknown, member: string): unknown {
  if (holder === null || holder === undefined) return undefined
  const boxed: unknown = typeof holder === 'object' || typeof holder === 'function' ? holder : null
  if (boxed === null) return undefined
  try {
    return (boxed as Record<string, unknown>)[member]
  } catch {
    return undefined
  }
}

/** The session, read TOTAL. An absent, non-record, member-incomplete or hostile
 *  session reads as unusable and yields the VALID BUT INERT module. */
function readSession(holder: Record<string, unknown> | null): SessionView {
  const held = holder === null ? undefined : readSlot(holder, 'session')
  return {
    install: asFunction(readSlot(held, 'install')),
    reset: asFunction(readSlot(held, 'reset')),
    dispose: asFunction(readSlot(held, 'dispose')),
    statsRead: asFunction(readSlot(held, 'stats')),
    gestureRead: asFunction(readSlot(held, 'gesture')),
    disposedRead: readSlot(held, 'disposed') === true,
  }
}

function sessionUsable(view: SessionView): boolean {
  return view.install !== null && view.reset !== null && view.dispose !== null && !view.disposedRead
}

function asFunction(value: unknown): ((...args: unknown[]) => unknown) | null {
  return typeof value === 'function' ? (value as (...args: unknown[]) => unknown) : null
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'object' && typeof value !== 'function') return null
  return value as Record<string, unknown>
}

/** The sentinel `invokeSeam` answers when a seam THREW, so an absorbing call site
 *  can tell an absorbed throw from a seam that legitimately returned `undefined`.
 *  It is module-local and is never exposed: no code of this module's own exists in
 *  the session's closed union. */
const ABSORBED: unique symbol = Symbol('the absorbed reading of a value-reading seam')

/** ONE invocation of a value-reading seam: a throw is ABSORBED and answers the
 *  declared safe default. Never retried. */
function invokeSeam(seam: (...args: unknown[]) => unknown, args: unknown[]): unknown {
  try {
    return seam(...args)
  } catch {
    return ABSORBED
  }
}

/** THE FACTORY — TOTAL: never throws for ANY argument, including a hostile options
 *  record, a `Proxy` whose traps throw, a primitive, `null` and `undefined`. The
 *  session arrives as an OPTION and is never imported as a value. */
export function createRelocateSession(options?: RelocateOptions): RelocateSession {
  const holder = asRecord(options)
  const session = readSession(holder)
  const candidatesFor = holder === null ? undefined : readSlot(holder, 'candidatesFor')
  const resolveTarget = holder === null ? undefined : readSlot(holder, 'resolveTarget')
  const onReveal = holder === null ? undefined : readSlot(holder, 'onReveal')
  const commitSeam = holder === null ? undefined : readSlot(holder, 'commit')
  const threshold = holder === null ? undefined : readSlot(holder, 'threshold')
  const previewSeam = holder === null ? undefined : readSlot(holder, 'onPreview')

  const ledger: Set<unknown> = new Set()
  let record: GestureRecord | null = null
  let detachDone = false
  /** THE DISPLAYED-NESS, as the per-move channel's own reading: which candidate the
   *  last presentation write showed (or `undefined` when the last one hid). It is
   *  what makes a retarget's hide-plus-show ONE transition, and it is reset when a
   *  gesture is established — so nothing carries across a gesture boundary. */
  let shownNearby: unknown = undefined

  const counters = {
    attached: 0,
    gestures: 0,
    moves: 0,
    candidateCalls: 0,
    resolveCalls: 0,
    revealWrites: 0,
    revealWritesApplied: 0,
    resets: 0,
    sinkCalls: 0,
    written: 0,
    lastCode: 'ok',
  }

  /** THE CANDIDATE ANSWER'S SHAPE, read without touching an element: the answer
   *  must be an ARRAY, and nothing else about it is read (not a length, not a
   *  member, never the candidate itself). */
  const elementsOf = (answer: unknown): unknown[] | null => (Array.isArray(answer) ? (answer as unknown[]) : null)

  /** The nearest candidate whose caller-measured scalar is inside the threshold:
   *  the module's OWN move turn asks the caller's closure for the candidate set and
   *  asks `withinProximity` the ONE question. This is the module's ONLY comparison
   *  site. */
  const seek = (gestureRecord: GestureRecord): { readonly within: boolean; readonly shown: unknown; readonly answer: unknown } => {
    const seam = asFunction(candidatesFor)
    counters.candidateCalls += candidatesFor === undefined ? 0 : 1
    if (seam === null) return { within: false, shown: undefined, answer: undefined }
    const invoked = invokeSeam(seam, [gestureRecord.element])
    const answer = invoked === ABSORBED ? undefined : invoked
    let within = false
    let shown: unknown
    const list = elementsOf(answer)
    if (list !== null) {
      for (let index = 0; index < list.length; index += 1) {
        const element = list[index]
        // THE FIELD IS READ **EXACTLY ONCE** PER CANDIDATE (`ADV-RL-7`): the ONE total
        // member-read is held in this local, and the LOCAL is what the usability class
        // gates and what the comparator compares. A second read would be a SECOND,
        // possibly DIFFERENT, decision — an accessor that varies per read must still be
        // decided on the value the ONE read answered. No repair, no default, no re-read.
        const measured = readSlot(element, 'distance')
        if (usableDistance(measured) && withinProximity(measured, threshold)) {
          within = true
          shown = readSlot(element, 'candidate')
          break
        }
      }
    }
    return { within, shown, answer: list }
  }

  /** The chosen target for one observation, or the declared safe default when the
   *  seam is absent, non-callable or throwing. The handle it receives is the one
   *  the session handed the module's own observation wrapper, forwarded BY
   *  IDENTITY. */
  const choose = (gestureRecord: GestureRecord, list: unknown): unknown => {
    const seam = asFunction(resolveTarget)
    counters.resolveCalls += resolveTarget === undefined ? 0 : 1
    if (seam === null) return undefined
    const chosen = invokeSeam(seam, [gestureRecord.element, list, gestureRecord.handle])
    return chosen === ABSORBED ? undefined : chosen
  }

  /** THE PER-MOVE TRANSIENT WRITE: the ghost, and the hide/show of a candidate
   *  including a retarget's hide-plus-show — ONE invocation, ONE observed-move
   *  turn. Its throw PROPAGATES. */
  const present = (previous: unknown, next: unknown): void => {
    const seam = asFunction(previewSeam)
    if (seam === null) return
    seam(previous === next ? { withinProximity: true, shown: next } : { withinProximity: true, shown: next, hidden: previous })
  }

  /** The hide, on the same per-move channel, when the move places the dragged
   *  control outside every candidate's proximity. Its throw PROPAGATES like the
   *  show's. */
  const hide = (): void => {
    const seam = asFunction(previewSeam)
    if (seam === null) return
    seam({ withinProximity: false, shown: undefined })
  }

  /** CHANNEL (A): the durable reveal write, ABSORBED at the terminal — the attempt
   *  is counted, the throw is absorbed and the write is never retried. */
  const reveal = (gestureRecord: GestureRecord, target: unknown): void => {
    const seam = asFunction(onReveal)
    counters.revealWrites += seam === null ? 0 : 1
    if (seam === null) return
    const written = invokeSeam(seam, [target, gestureRecord.target])
    if (written !== ABSORBED) counters.revealWritesApplied += 1
  }

  /** THE SINK — the attempt is counted BEFORE the call and marked as written only
   *  when it RETURNS. Its throw PROPAGATES to the caller of the terminal turn. */
  const writeSink = (gestureRecord: GestureRecord, value: unknown): void => {
    const seam = asFunction(commitSeam)
    counters.sinkCalls += seam === null ? 0 : 1
    if (seam === null) return
    seam(gestureRecord.handle, value)
    counters.written += 1
  }

  /** THE TERMINAL WRITE for one gesture. The terminal's SHAPE decides which value
   *  the sink carries: the ARM's own terminal hands over the CALLER-SUPPLIED
   *  PRE-DRAG VALUE (`M-8`, `P-RL-SM-5`(1)), and a completing terminal carries the
   *  target the last observation resolved, writing the reveal ONCE for it. A
   *  gesture whose last observation was outside every candidate's proximity, a
   *  gesture whose caller resolved NO target (`undefined`) and an unusable target
   *  seam all commit NOTHING and reveal NOTHING (`F-16`, `P-RL-IM-2`).
   *
   *  THE SINK IS THE ARM'S ALREADY WHEN THE ARM RAN: its `'reset'` terminal is the
   *  gesture's one commit (`I-4`), so a completing terminal that still reaches this
   *  wrapper afterwards writes the REVEAL it owes a recovered gesture and NO second
   *  sink value. */
  const terminalWrite = (gestureRecord: GestureRecord, carryingPreDrag: boolean): void => {
    if (carryingPreDrag) {
      gestureRecord.sinkSettled = true
      writeSink(gestureRecord, gestureRecord.preDragValue)
      return
    }
    const target = gestureRecord.target
    if (gestureRecord.within && target !== undefined) {
      reveal(gestureRecord, target)
      if (!gestureRecord.sinkSettled) {
        gestureRecord.sinkSettled = true
        writeSink(gestureRecord, target)
      }
    }
  }

  /** THE TERMINAL TURN — the module's OWN installed terminal wrapper. The gesture's
   *  terminal writes through `terminalWrite` EXACTLY ONCE: the `'reset'` terminal
   *  the module's own move turn entered carrying the caller-supplied pre-drag value,
   *  and the `'end'` terminal carrying the target the last observation resolved. The
   *  consumer's own hook is forwarded AFTER, and the per-gesture record is DISCARDED
   *  in the module's own `finally`.
   *
   *  A gesture whose arm already entered the session's reset terminal carries the
   *  arm's ONE write and nothing more: a later completing turn writes NOTHING for
   *  that gesture (`M-8` — *"the later release commits NOTHING"*), so the turn is a
   *  pure forwarding of the consumer's own hook. */
  const finishTurn = (gestureRecord: GestureRecord, element: unknown, value: unknown, hooks: Record<string, unknown> | null): void => {
    try {
      if (gestureRecord.armPending) {
        // THE ARM'S OWN TERMINAL — entered from the module's own move turn, while the
        // gesture is still active — and it is this gesture's ONE terminal write.
        gestureRecord.armPending = false
        terminalWrite(gestureRecord, true)
      } else {
        terminalWrite(gestureRecord, false)
      }
      const consumerEnd = asFunction(hooks === null ? undefined : readSlot(hooks, 'onEnd'))
      if (consumerEnd !== null) consumerEnd(element, value)
    } finally {
      // A gesture the invalid arm already took KEEPS its record: the session's own
      // gesture is still running, so the per-move channel goes on receiving every
      // later observation, and a later completing turn carries its own resolved
      // target rather than the value the arm already committed. Every other
      // terminal ENDS the gesture and the record is discarded in this `finally`,
      // never by asking the session anything.
      if (!gestureRecord.armed) {
        gestureRecord.terminated = true
        discardRecord()
      }
      gestureRecord.armPending = false
    }
  }

  /** THE INVALID ARM: the module's own move turn enters the session's own reset
   *  terminal, ONCE per gesture, while the gesture is still active. The arm's ONE
   *  sink write is made from the terminal wrapper it enters, carrying the
   *  caller-supplied pre-drag value. A REFUSED terminal runs no terminal at all,
   *  so it carries no sink write. */
  const takeArm = (gestureRecord: GestureRecord): void => {
    if (!sessionUsable(session)) {
      discardRecord()
      counters.lastCode = 'no-gesture'
      return
    }
    const seam = session.reset
    if (seam === null) return
    counters.resets += 1
    gestureRecord.armPending = true
    const result = seam(gestureRecord.element, gestureRecord.handle, gestureRecord.preDragValue)
    const code = readSlot(result, 'code')
    counters.lastCode = typeof code === 'string' ? code : counters.lastCode
    if (readSlot(result, 'ok') !== true) discardRecord()
  }

  /** THE PER-GESTURE RECORD IS DISCARDED — at every terminal, in the module's own
   *  `finally`, and never by asking the session anything. */
  const discardRecord = (): void => {
    record = null
  }

  /** THE ESTABLISHMENT WRAPPER — the module's OWN establishment hook: the caller's
   *  pre-drag value is captured EXACTLY ONCE here for an ESTABLISHED gesture, and
   *  the consumer's own hook is forwarded BY IDENTITY. A gesture for an element
   *  this module did NOT attach is NOT its gesture, so the wrapper does nothing. */
  const startWrapper = (element: unknown, hooks: Record<string, unknown> | null): void => {
    if (!ledger.has(element)) return
    discardRecord()
    shownNearby = undefined
    const fresh: GestureRecord = {
      handle: null,
      element,
      hooks,
      preDragValue: undefined,
      lastAnswer: undefined,
      target: undefined,
      within: false,
      armed: false,
      terminated: false,
      sinkSettled: false,
      armPending: false,
    }
    try {
      fresh.preDragValue = capturePreDrag(hooks, element)
      counters.gestures += 1
      record = fresh
      const consumerStart = asFunction(hooks === null ? undefined : readSlot(hooks, 'onStart'))
      if (consumerStart !== null) consumerStart(element)
    } catch (error) {
      discardRecord()
      throw error
    }
  }

  /** THE CAPTURE — a value-reading member: its failure is ABSORBED at this very
   *  turn and answers THE NO-CALLER-VALUE REFUSAL (the value reads `undefined`).
   *  NOTHING is invented, nothing is retried, and no throw escapes. */
  const capturePreDrag = (hooks: Record<string, unknown> | null, element: unknown): unknown => {
    const seam = asFunction(hooks === null ? undefined : readSlot(hooks, 'preDragValueOf'))
    if (seam === null) return undefined
    const captured = invokeSeam(seam, [element])
    return captured === ABSORBED ? undefined : captured
  }

  /** THE OBSERVATION WRAPPER — the module's OWN move hook. The handle is captured
   *  HERE and nowhere else; the consumer's own hook is forwarded BY IDENTITY; the
   *  invalid arm is tested LAST, after the consumer has seen the same gesture state
   *  the session gave the module. */
  const moveWrapper = (gesture: GestureHandle): void => {
    counters.moves += 1
    const gestureRecord = record
    if (gestureRecord === null) return
    if (gestureRecord.handle !== gesture) gestureRecord.handle = gesture
    try {
      const observed = seek(gestureRecord)
      const chosen = observed.within ? choose(gestureRecord, observed.answer) : undefined
      const wasShowing = shownNearby
      if (!observed.within) hide()
      else present(wasShowing, observed.shown)
      shownNearby = observed.shown
      gestureRecord.lastAnswer = observed.answer
      gestureRecord.target = chosen
      gestureRecord.within = observed.within
      const consumerMove = asFunction(gestureRecord.hooks === null ? undefined : readSlot(gestureRecord.hooks, 'onMove'))
      if (consumerMove !== null) consumerMove(gesture)
      if (!observed.within && !gestureRecord.armed) {
        gestureRecord.armed = true
        takeArm(gestureRecord)
      }
    } catch (error) {
      discardRecord()
      throw error
    }
  }

  const cancelWrapper = (element: unknown, hooks: Record<string, unknown> | null): void => {
    const gestureRecord = record
    try {
      if (gestureRecord !== null) gestureRecord.terminated = true
      const consumerCancel = asFunction(hooks === null ? undefined : readSlot(hooks, 'onCancel'))
      if (consumerCancel !== null) consumerCancel(element)
    } finally {
      discardRecord()
    }
  }

  const attach = (element: unknown, hooks?: RelocateHandle): boolean => {
    if (element === null || element === undefined) return false
    if (ledger.has(element)) return false
    if (!sessionUsable(session)) return false
    const install = session.install
    if (install === null) return false
    const consumerHooks = asRecord(hooks)
    const delegated = {
      onStart: (el: unknown): void => startWrapper(el, consumerHooks),
      onMove: (gesture: GestureHandle): void => moveWrapper(gesture),
      onEnd: (el: unknown, value: unknown): void => {
        const gestureRecord = record
        if (gestureRecord === null) return
        finishTurn(gestureRecord, el, value, consumerHooks)
      },
      onCancel: (el: unknown): void => cancelWrapper(el, consumerHooks),
    }
    let installed: unknown
    try {
      installed = install(element, delegated)
    } catch {
      return false
    }
    if (installed === false) return false
    ledger.add(element)
    counters.attached += 1
    return true
  }

  /** THE MODULE'S OWN INVALID-ARM ENTRY POINT: **the SAME arm** the move turn takes,
   *  exposed for a consumer-driven reset — and it TAKES THE ARM'S DECLARED SHAPE
   *  (`ADV-RL-1`, the gate-4 host fix). Refusals are RETURNED, never thrown, and the
   *  code they carry is the SESSION's own closed-union reading — the module declares
   *  no code of its own.
   *
   *  WHAT "THE SAME ARM" MEANS, exactly, because this entry point used to delegate
   *  without arming anything and the session's own `'reset'` terminal then ran the
   *  COMPLETING branch: it fires `onReveal` (the arm's declared count is ZERO) and
   *  commits the RESOLVED TARGET where the contract requires the **CALLER-SUPPLIED
   *  PRE-DRAG VALUE** (`§2.1` item 7(g), `§2.3` item 4's channel (C) and item 6(d)'s
   *  `'reset'` limb, `§2.5` item 7 clause 2, `§0A` notes 13/16). So this turn:
   *  **(1)** ARMS the gesture (`armPending`), so the terminal it enters is the ARM's
   *  own terminal and `terminalWrite` makes the arm's ONE sink write carrying the
   *  caller-supplied pre-drag value — and ZERO reveals; **(2)** COUNTS the entry
   *  (`stats().resets`) exactly as the move turn's arm does; **(3)** delegates with
   *  ARITY THREE (`session.reset(element, handle, value)`, `§2.3` item 9(a)); and
   *  **(4)** marks the gesture `armed` ONLY where the session ACCEPTED, so a REFUSED
   *  consumer-driven arm is RETRYABLE while a gesture the arm has already taken stays
   *  sticky — *"at most once per gesture"* holds STRUCTURALLY, and a second
   *  `reset(el)` for a committed gesture cannot enter the session's arm again.
   *
   *  THE REFUSAL ORDER MIRRORS THE SESSION'S OWN PRECEDENCE, which reads the
   *  SESSION's end state FIRST and the GESTURE second: a DISPOSED session refuses
   *  `disposed` whatever this module's own held state says, then a held-but-ended
   *  gesture refuses `no-gesture`, then an unusable session refuses `no-gesture`.
   *  Reading the held state first would answer a DIFFERENT code than the session's
   *  own for the same call, and the propagation must be byte-identical. */
  const resetEntry = (element: unknown): RelocateResetResult => {
    const held = record
    if (session.disposedRead) {
      counters.lastCode = 'disposed'
      return { ok: false, code: 'disposed', committed: false }
    }
    if (held === null || held.terminated || !sessionUsable(session)) {
      counters.lastCode = 'no-gesture'
      return { ok: false, code: 'no-gesture', committed: false }
    }
    const seam = session.reset
    if (seam === null) return { ok: false, code: 'no-gesture', committed: false }
    if (held.armed) {
      // THE ARM IS ALREADY THIS GESTURE'S (`I-4`, `P-RL-SM-7`): the session's own slot
      // is gone, so the delegation is refused and NO second sink value is written.
      const spent = seam(element, held.handle, held.preDragValue)
      const spentCode = readSlot(spent, 'code')
      const propagatedSpent = typeof spentCode === 'string' ? spentCode : 'no-gesture'
      counters.lastCode = propagatedSpent
      return { ok: false, code: propagatedSpent, committed: false }
    }
    held.armed = true
    held.armPending = true
    counters.resets += 1
    const result = seam(element, held.handle, held.preDragValue)
    held.armPending = false
    const code = readSlot(result, 'code')
    const propagated = typeof code === 'string' ? code : 'no-gesture'
    counters.lastCode = propagated
    return {
      ok: readSlot(result, 'ok') === true,
      code: propagated,
      committed: readSlot(result, 'committed') === true,
    }
  }

  const detach = (): boolean => {
    if (detachDone) return false
    if (ledger.size !== 1) return false
    ledger.clear()
    discardRecord()
    detachDone = true
    const seam = session.dispose
    if (seam === null) return false
    const reported = seam()
    return readSlot(reported, 'complete') === true
  }

  /** THE MODULE'S OWN COUNTERS — its own readings, never a re-read of the
   *  session's. */
  const stats = (): RelocateStats => ({
    attached: counters.attached,
    gestures: counters.gestures,
    moves: counters.moves,
    candidateCalls: counters.candidateCalls,
    resolveCalls: counters.resolveCalls,
    revealWrites: counters.revealWrites,
    revealWritesApplied: counters.revealWritesApplied,
    resets: counters.resets,
    sinkCalls: counters.sinkCalls,
    written: counters.written,
    lastCode: counters.lastCode,
  })

  return {
    attach,
    detach,
    reset: resetEntry,
    stats,
    get detached(): boolean {
      return detachDone || session.disposedRead
    },
  }
}
