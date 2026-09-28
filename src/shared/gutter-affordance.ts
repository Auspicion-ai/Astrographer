/** `U-GUTTER-UI` — the provident-authored gutter affordance: the UI half of the panes/zones family
 *  (`docs/specs/gutter-ui.md` §2). It COMPOSES the landed `U-GUTTER` controller (the ONE clamp and
 *  the controller factory) and, through it, the frozen session — and it adds no second writer and
 *  no second gesture authority. THIS MODULE AUTHORS NO UI CONTENT: the affordance is provident
 *  envelope DATA (`src/shared/demo-envelope.ts`), and the only element-scoped calls its own bytes
 *  make are the four listener registrations its `attach()` performs through the INJECTED source.
 *
 *  THIS UNIT'S RUNTIME VALUE SURFACE IS THREE NAMES (`§2.1` clause 1): the factory, the total
 *  cursor-declaration resolver and the element-backed event source. The module's own internals
 *  (`resolveEventPointer`, `seamAnswer`, `sizeClampedFor`) are NON-EXPORTED. The eleven caller
 *  seams are the family's DOWNSTREAM contract and are exported as TYPES beside the option and
 *  affordance records, so a fork imports the shape rather than re-declaring one.
 *
 *  THE IMPORTS ARE THE THREE STATEMENTS `§2.1` clause 2 pins: the controller's factory and its
 *  pure clamp as VALUES from the composed `E3` module (whose controller TYPE rides the same
 *  statement as a type-only binding), and the session's exported event-type constant as a VALUE
 *  plus its gesture-handle TYPE from the frozen session module. The session INSTANCE arrives as
 *  an ARGUMENT (`options.session`), never as an import.
 *
 *  THE SEAM-READ BUDGET (`§5.5.1 P-GU-IM-2`, `§2.6` item 4). Each caller seam is consulted at
 *  most once per gesture, and the three seams the composed controller reads at ESTABLISHMENT
 *  (the axis producer, the bounds producer and the resizability producer) are read by the
 *  CONTROLLER's own evaluation and merely OBSERVED here: the per-gesture record reads the
 *  decision the controller made instead of asking a second time, so the module's own
 *  `PreviewState` never adds a call. The pre-drag size, which the composed controller needs
 *  only at a reset terminal, is read here ONCE per gesture at establishment, and the bounds
 *  pair is kept from that same evaluation so the visible revert never needs a second read of
 *  it — and the controller's own default-size seam REUSES the establishment answer the record
 *  already holds rather than consulting the caller's seam again, so a gesture that takes the
 *  INVALID path reads the pre-drag seam EXACTLY ONCE, as the clause requires.
 *
 *  THE EVENT-SOURCE TYPE IS DECLARED LOCALLY rather than imported, so the module's imports stay
 *  the three statements the contract pins. */

import { clampToBounds, createResizeController, type ResizeController } from './gutter.js'
import { POINTER_TYPES } from './gesture-session.js'
import type { GestureHandle } from './gesture-session.js'

/** THE ONE COORDINATE READ IN THE PANES/ZONES FAMILY. TOTAL: it answers `null` for every input
 *  that is not a usable coordinate pair and NEVER throws. The gate is a `typeof` gate on BOTH
 *  members with a finite-number requirement on each, so a hostile holder whose traps throw, a
 *  throwing accessor, a BigInt, a Symbol, `NaN`, `Infinity`, a string, a missing member and a
 *  non-object all answer `null`. */
function resolveEventPointer(event: unknown): PointerPosition | null {
  if (event === null || event === undefined) return null
  const holder = event as Record<string, unknown>
  let x: unknown
  let y: unknown
  try {
    x = holder['clientX']
    y = holder['clientY']
  } catch {
    return null
  }
  return pointerPair(x, y)
}

/** **THE SAME TOTAL GATE READ OVER THE DECLARED PAIR** (`§2.1`'s `PointerResolver` cell): a
 *  caller-supplied `pointerOf` answers a `PointerPosition` — `{x, y}`, carrying no event
 *  reference — so its answer is read by the SAME rule the event reading uses, member by member.
 *  The gate is a `typeof` gate on BOTH members with a finite-number requirement on each, so a
 *  hostile holder whose traps throw, a throwing accessor, a BigInt, a Symbol, `NaN`, `Infinity`,
 *  a string, a missing member and a non-object all answer `null`; a usable pair is frozen. */
function resolvePointerPosition(value: unknown): PointerPosition | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'object' && typeof value !== 'function') return null
  const holder = value as Record<string, unknown>
  let x: unknown
  let y: unknown
  try {
    x = holder['x']
    y = holder['y']
  } catch {
    return null
  }
  return pointerPair(x, y)
}

/** THE ONE PAIR GATE both readings above end in. */
function pointerPair(x: unknown, y: unknown): PointerPosition | null {
  if (typeof x !== 'number' || typeof y !== 'number') return null
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null
  return Object.freeze({ x, y })
}

/** THE POINTER, as this unit reads it: the two coordinates ONLY. This is a VALUE record, frozen,
 *  carrying NO event reference, NO target, NO button and NO gesture identity — so a caller's size
 *  seam cannot receive the event and cannot re-read a coordinate from it. */
export interface PointerPosition {
  readonly x: number
  readonly y: number
}

/** THE CALLER'S POINTER RESOLVER — the OPTIONAL seam a fork owning its own channel supplies. When
 *  supplied it is the ONLY site the coordinate is obtained from; its answer is handed to the
 *  module's own TOTAL gate, so a non-object, a partial pair, a `NaN`, an `Infinity`, a throwing
 *  accessor or a throw from the seam itself yields `null` and the move is INVALID. */
export type PointerResolver = (event: unknown) => PointerPosition | null

/** THE ELEVEN CALLER SEAMS ARE EXPORTED CONTRACT (`§R.2`/`§R.3`): each is a requirement on the
 *  implementing consumer, and this module exports its TYPE so a fork imports the shape. */
export interface SizeFromPointer {
  (pointer: PointerPosition, start: number): unknown
}
export interface AxisOf {
  (element: unknown): unknown
}
export interface ApplyPreview {
  (state: PreviewState): void
}
export interface ApplyCursor {
  (element: unknown, declaration: string | undefined): void
}
export interface StartSizeOf {
  (element: unknown, token: unknown): unknown
}
export interface BoundsOf {
  (element: unknown, token: unknown): unknown
}
export interface ResizableOf {
  (element: unknown, token: unknown): unknown
}
export interface Commit {
  (gesture: unknown, value: number): void
}
export interface MoveTypeOf {
  (element: unknown): unknown
}

/** THE AXIS-TOKEN-TO-CURSOR MAPPING — the caller's seam. It maps the SAME OPAQUE TOKEN the axis
 *  producer answers to a declaration. The declaration is the property VALUE ONLY: the string is
 *  not interpreted beyond trimming, and the module carries NO vocabulary of its own. Total
 *  resolution: absent, non-callable, throwing, a non-object answer, an absent member, a
 *  non-string member and an empty-or-whitespace string ALL yield `undefined`. */
export type CursorOf = (token: unknown) => unknown

/** THE TOTAL RESOLUTION OF A CURSOR PRODUCER'S ANSWER: a trimmed non-empty string, or
 *  `undefined`. It NEVER throws, and it touches no element, no style object and no global
 *  scope.
 *
 *  **THE `cursor` MEMBER MUST BE AN *OWN* PROPERTY** (`§2.6` item 3, `§0A` note 8;
 *  ADV-GU-9). The as-filed read was a plain `value['cursor']` MEMBER READ, which walks the
 *  PROTOTYPE CHAIN — so a producer whose declaration rides on a PROTOTYPE (rather than on the
 *  answer object itself) resolved a declaration it never authored on that object, and the
 *  module's own "an own `cursor` string property" rule was not the rule its bytes implemented.
 *  `Object.hasOwn` is read through the same `try` as the member read, so a hostile holder's
 *  traps are still absorbed by the module's total gate. */
export function cursorDeclarationFor(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value !== 'object' && typeof value !== 'function') return undefined
  let declaration: unknown
  try {
    if (!Object.hasOwn(value, 'cursor')) return undefined
    declaration = (value as { readonly cursor?: unknown })['cursor']
  } catch {
    return undefined
  }
  if (typeof declaration !== 'string') return undefined
  const trimmed = declaration.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

/** THE EVENT SOURCE THIS UNIT INJECTS — a STRUCTURAL type: the frozen session's own registration
 *  shape. The handler is declared `(event: unknown) => void`, so the source forwards ONE
 *  argument; a source that calls its handlers with NO argument is a miswiring whose consequence
 *  is the DECLARED degradation (an unresolvable pointer makes the move INVALID), never a throw. */
export interface EventSourceLike {
  on(element: unknown, type: string, handler: (event: unknown) => void): void
  off(element: unknown, type: string, handler: (event: unknown) => void): void
  isConnected?(element: unknown): boolean
  capturePointer?(element: unknown): void
}

/** THE ELEMENT-BACKED SOURCE — the member of this module that registers a listener, ON THE
 *  ELEMENT IT IS GIVEN, through that element's own member, and removes it through the SAME
 *  element's counterpart with the SAME handler reference. It holds NO delegated listener, NO
 *  selector, NO global lookup and NO capture call of its own: the optional capture capability is
 *  simply not advertised (the declared degradation the session already carries). TOTAL: a null,
 *  non-object or listener-less element makes every call a NO-OP. */
export function domEventSource(): EventSourceLike {
  return {
    on(element: unknown, type: string, handler: (event: unknown) => void): void {
      if (element === null || element === undefined || typeof element !== 'object') return
      let attach: unknown
      try {
        attach = (element as { addEventListener?: unknown })['addEventListener']
      } catch {
        return
      }
      if (typeof attach !== 'function') return
      try {
        attach.call(element, type, handler)
      } catch {
        return
      }
    },
    off(element: unknown, type: string, handler: (event: unknown) => void): void {
      if (element === null || element === undefined || typeof element !== 'object') return
      let detach: unknown
      try {
        detach = (element as { removeEventListener?: unknown })['removeEventListener']
      } catch {
        return
      }
      if (typeof detach !== 'function') return
      try {
        detach.call(element, type, handler)
      } catch {
        return
      }
    },
    isConnected(element: unknown): boolean {
      if (element === null || element === undefined || typeof element !== 'object') return false
      let present: unknown
      try {
        present = (element as { isConnected?: unknown })['isConnected']
      } catch {
        return false
      }
      return present === true
    },
  }
}

/** THE VALUE DERIVATION AND ITS OUTCOME — what the preview seam and the counters speak. */
export interface PreviewState {
  /** The CLAMPED value for this observed move. */
  readonly value: number
  /** The axis token the producer answered for THIS gesture (opaque; passed on unchanged). */
  readonly token: unknown
  /** `true` iff this observed move's drag state was VALID by `§2.3` item 5's rule. */
  readonly valid: boolean
  /** `true` iff the composed controller found the gesture RESIZABLE at establishment. */
  readonly resizable: boolean
}

/** THE PER-CONTROL OPTIONS THIS UNIT READS — the caller-supplied seams and the four elements,
 *  none of them defaulted and none of them invented here. */
export interface GutterAffordanceOptions {
  /** THE SESSION. REQUIRED — the WIRING constructs it and hands it in. Its unusability degrades
   *  exactly as the composed controller declares (a VALID but INERT controller). */
  readonly session: unknown
  /** THE EVENT SOURCE this unit INJECTS. REQUIRED. */
  readonly source: EventSourceLike
  /** THE AFFORDANCE ELEMENT — the provident-rendered handle. REQUIRED. Never looked up and never
   *  re-resolved: the object the caller handed is the object every turn uses. */
  readonly element: unknown
  /** THE TARGET ELEMENT the preview is applied to. REQUIRED. */
  readonly target: unknown
  /** REQUIRED — the coordinate-to-size mapping. */
  readonly sizeFromPointer: SizeFromPointer
  /** OPTIONAL — the caller's pointer resolver (when supplied, the module's own resolver stands
   *  down). */
  readonly pointerOf?: PointerResolver
  /** OPTIONAL — the caller's move-event type for the element. The module's own fallback is the
   *  session's exported token; a non-string or empty answer registers NO move listener. */
  readonly moveTypeOf?: MoveTypeOf
  /** REQUIRED — the axis producer; also the composed controller's axis seam. */
  readonly axisOf: AxisOf
  /** REQUIRED — the cursor mapping. */
  readonly cursorOf: CursorOf
  /** REQUIRED — this module's ONE mid-drag preview call. */
  readonly applyPreview: ApplyPreview
  /** REQUIRED — this module's cursor calls, on the hover path. */
  readonly applyCursor: ApplyCursor
  /** REQUIRED — the pre-drag size source; also the controller's default-size seam. */
  readonly startSizeOf: StartSizeOf
  /** REQUIRED — the bounds pair source; also the controller's bounds seam. */
  readonly boundsOf: BoundsOf
  /** REQUIRED — the resizability source; also the controller's resizability seam. */
  readonly resizableOf: ResizableOf
  /** REQUIRED — THE ONE SINK, handed to the controller and never called by this module. */
  readonly commit: Commit
  /** DECLARED AND IGNORED: the capture opt-in cannot be delivered by the composed controller's
   *  `attach`, so this module passes no capture field anywhere. */
  readonly capturePointer?: boolean
  /** OPTIONAL — the caller's veto on a drag state. ONLY an exact `false` marks the drag INVALID;
   *  `true`, `undefined`, a non-boolean, an absent seam and a throw are NOT vetoes. */
  readonly isDragValid?: (state: PreviewState) => unknown
}

/** THE AFFORDANCE — FIVE MEMBERS, and this is the WHOLE surface. Every member is TOTAL: none
 *  throws for ANY argument, whatever the session, the callbacks or the events do. */
export interface GutterAffordance {
  attach(): boolean
  detach(): boolean
  readonly detached: boolean
  stats(): GutterAffordanceStats
  /** The controller this affordance composed, exposed READ-ONLY so a row can read the
   *  controller's own counters beside this module's. */
  readonly controller: ResizeController
}

/** THIS MODULE'S OWN COUNTERS. All monotonic except `lastCursor` (a string reading). */
export interface GutterAffordanceStats {
  /** Pointer-move turns OBSERVED by the module's own move listener (valid or not). */
  readonly moves: number
  /** Preview invocations. */
  readonly previews: number
  /** Cursor invocations carrying a declaration (the hover WRITE count). */
  readonly cursorWrites: number
  /** Cursor invocations carrying NO declaration (the hover CLEAR count). */
  readonly cursorClears: number
  /** Composed-controller resets this module ACCEPTED on the invalid-release path. */
  readonly resets: number
  /** The drop-revert path's own count. */
  readonly drops: number
  /** The LAST declaration resolved (`''` before anything happened). */
  readonly lastCursor: string
}

/** THE PER-GESTURE RECORD — ONE at most, discarded at every terminal, keyed by nothing: the
 *  instance holds it directly and NO element-keyed store exists (`§2.2` P-5). It carries the
 *  pre-drag size, the token the controller's axis evaluation produced for THIS gesture, the
 *  resizability the controller decided at establishment, the pair the last usable move was
 *  clamped against, the value the value channel's payload reads back, and the visible revert. */
interface DragRecord {
  readonly token: unknown
  start: unknown
  started: boolean
  establish: boolean
  resizable: boolean
  value: number | null
  /** THE BOUNDS PAIR this gesture's LAST evaluation obtained, kept so the record's own revert
   *  readings (`preRevert`/`revert`) never need a second read of the caller's seam. */
  pair: unknown
  paired: boolean
  /** **THE GESTURE'S VALIDITY, ESTABLISHED BY THE MOVE TURN AND STICKY FOR THE GESTURE**
   *  (`§2.3` item 5's closing clause: "INVALID IS STICKY FOR THAT GESTURE … no later valid move
   *  un-invalidates it"). The as-filed record carried the validity of ONE OBSERVED MOVE only
   *  (it lived in the move turn's own local), so the record itself could not answer "was this
   *  gesture's state valid" — the reading the `finally` obligation and the end terminal both
   *  want. It starts `false` (no state observed yet) and is only ever set, never cleared. */
  valid: boolean
  /** `true` iff THIS GESTURE has had a move observed by this module's own turn. It is the drop
   *  path's own precondition (`§2.3` row 6's "no gesture is active" versus row 10's "while a
   *  gesture is active"): the frozen session opens a gesture attempt on a `pointerdown` of ANY
   *  button, so a bare secondary press settles a record with no drag existing behind it. It is
   *  PER GESTURE — never the instance-wide `moves` counter, which a second gesture would inherit
   *  from the first. */
  moved: boolean
  /** THE VISIBLE REVERT — the PRE-DRAG SIZE the DROP and CANCEL terminals write back (`§2.5`
   *  item 3's `{value: preDragSize, …}` rule, `§R` `R7`/`R8`(d)). It is a property of the
   *  GESTURE rather than of one move, so a drag whose every observed move is VALID still carries
   *  it — which is what lets `§3.1 M-9`'s drop (a press that observes no move of its own) revert
   *  visibly. `null` when the pre-drag size itself is not a finite number: a non-finite preview is
   *  never written (`§2.5`, `§3.2 F-10`). */
  preRevert: PreviewState | null
  /** THE INVALID ARM'S OWN REVERT — the RESET terminal's reading, which is the clamp the
   *  composed reset itself applies (`§2.3` item 9, `§3.1 M-13`). `null` when that clamp's answer
   *  is not finite. */
  revert: PreviewState | null
}

/** The module-local, NON-EXPORTED total read of one seam's answer: a THROW from a VALUE-READING
 *  seam is ABSORBED here, inside the module's own listener turn (`§3.1` M-20 class 3, `§3.2`
 *  F-1), and reaches the caller as an absent answer. */
function seamAnswer(seam: unknown, args: readonly unknown[]): { readonly answered: boolean; readonly value: unknown } {
  if (typeof seam !== 'function') return { answered: false, value: undefined }
  try {
    return { answered: true, value: (seam as (...a: unknown[]) => unknown)(...args) }
  } catch {
    return { answered: false, value: undefined }
  }
}

/** THE CLAMPED PRE-DRAG SIZE — the value the visible revert carries. The composed controller's
 *  own exported clamp is the ONE clamp in the family; nothing is computed here. */
function sizeClampedFor(start: unknown, pair: unknown): number {
  return clampToBounds(start, pair)
}

/** **THE PRE-DRAG SIZE THE VISIBLE REVERT CARRIES** (`§2.5` item 3's `{value: preDragSize, …}`
 *  rule, `§3.1 M-9`/`M-13`, `§R` `R8`(d)). The pre-drag size is CLAMPED over the gesture's own
 *  pair through the family's one clamp; when that pair is UNUSABLE the clamp answers `NaN` and
 *  the reading FALLS BACK TO THE PRE-DRAG SIZE ITSELF — the value the caller's own
 *  `startSizeOf` seam answered — because a revert is a DECLARED state and the ruled reading on
 *  that shape is the pre-drag size (`§3.2 F-10`'s subject revert is `{value: 100, valid: false}`
 *  at an unusable pair). A fallback that is itself not a finite number yields `null`: no revert
 *  is carried at all rather than a non-finite one. */
function preDragReading(start: unknown, pair: unknown): unknown {
  const clamped = clampToBounds(start, pair)
  return Number.isFinite(clamped) ? clamped : start
}

/** **ONE REVERT STATE, OR NONE.** A revert is only ever constructed around a FINITE number:
 *  `§2.5`/`§3.2 F-10`/`§5.5.1 P-GU-SM-2` forbid a non-finite preview of ANY origin, so an answer
 *  that is not a finite number yields `null` (no revert) rather than a `NaN` one — the
 *  presentation channel carries declared states only. */
function revertStateFor(value: unknown, token: unknown, resizable: boolean): PreviewState | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return { value, token, valid: false, resizable }
}

/** THE FACTORY. TOTAL: NEVER THROWS, for ANY argument — including a hostile options object, a
 *  Proxied holder, a primitive or `undefined`. Every member of the returned affordance is
 *  present and callable in EVERY case, and an unusable session yields the controller's DECLARED
 *  degradation rather than a throw. It installs NO listener: `attach()` is the only installer.
 *
 *  THE CONTROLLER IS BUILT ONCE PER `attach()`-CAPABLE INSTANCE (`§2.1` clause 4): the module
 *  builds it here, once, from ONE closure per seam of the caller's own option. */
export function createGutterAffordance(options?: GutterAffordanceOptions): GutterAffordance {
  const read = (key: string): unknown => {
    try {
      return (options as unknown as Record<string, unknown> | null | undefined)?.[key]
    } catch {
      return undefined
    }
  }

  const session = read('session')
  const source = read('source')
  const element = read('element')
  const sizeFromPointer = read('sizeFromPointer')
  const pointerOf = read('pointerOf')
  const moveTypeOf = read('moveTypeOf')
  const axisOf = read('axisOf')
  const cursorOf = read('cursorOf')
  const applyPreview = read('applyPreview')
  const applyCursor = read('applyCursor')
  const startSizeOf = read('startSizeOf')
  const boundsOf = read('boundsOf')
  const resizableOf = read('resizableOf')
  const commit = read('commit')
  const isDragValid = read('isDragValid')

  const counters = { moves: 0, previews: 0, cursorWrites: 0, cursorClears: 0, resets: 0, drops: 0, lastCursor: '' }
  let record: DragRecord | null = null
  let hovered = false
  let attached = false
  let detached = false
  /** **THE HALF-ATTACHED STATE A REFUSED `attach()` MAY LEAVE** (`§2.1`'s `attach` cell): `true`
   *  only while the module's OWN registration set was refused AFTER some of it was taken, so
   *  `detach()` still has a delegation to complete. It is cleared by every completed `attach()`
   *  and by `detach()` itself, and it never stands in for the `attached` flag. */
  let recoverable = false
  const listeners: Array<{ readonly type: string; readonly handler: (event: unknown) => void }> = []

  /** **THE VISIBLE REVERT OF ONE GESTURE IS THE PRE-DRAG READING** (`§2.5` item 3's
   *  `{value: preDragSize, …}` rule, `§R` `R7`/`R8`(d), `§3.1 M-9`/`M-13`). It is taken through
   *  the family's ONE pure clamp and NEVER re-reads a caller seam (`§5.5.1 P-GU-IM-2`'s
   *  per-gesture budget: the pre-drag size is the answer this gesture's first observed move
   *  already obtained). `null` before that move, and `null` when the reading is not a finite
   *  number — a non-finite preview is never written (`§2.5`, `§3.2 F-10`; `§5.5.1 P-GU-SM-2`). */
  const revertFor = (current: DragRecord, pair: unknown): PreviewState | null =>
    current.started ? revertStateFor(preDragReading(current.start, pair), current.token, current.resizable) : null

  /** ONE preview call; a throw from it PROPAGATES, while this module's own counter has already
   *  moved (the invocation is counted, `§2.5` item 3). **A NON-FINITE VALUE IS NEVER WRITTEN**
   *  (`§2.5`, `§3.2 F-10`, `§5.5.1 P-GU-SM-2`): `applyPreview` is a presentation channel and a
   *  non-finite value is not a declared state, so the write — and the counter that counts THIS
   *  module's own presentations — is skipped rather than degraded. **⟶ ADV-GU-12: the counter
   *  counts INVOCATIONS, so it moves only where the seam is actually invoked: the as-filed form
   *  incremented BEFORE the callability check, so a `stats().previews` reading disagreed with
   *  the seam's own recorded call count whenever `applyPreview` was absent or non-callable.** */
  const writePreview = (state: PreviewState): void => {
    if (!Number.isFinite(state.value)) return
    if (typeof applyPreview !== 'function') return
    counters.previews += 1
    ;(applyPreview as (s: PreviewState) => void)(state)
  }

  /** THE INVALID ARM (`§2.3` row 9): the reset terminal is taken from the DRAG while the gesture
   *  is still ACTIVE, then the VISIBLE REVERT to the pre-drag size, then the record discarded.
   *  The counter moves only when the composed controller ACCEPTED the reset; a refusal (the
   *  pre-handle refusal's own reading, `§2.3` row 8) leaves it UNMOVED. The entry point is the
   *  composed controller's own RESET PROTOCOL member, read ONCE at construction so this module's
   *  bytes carry no session-member reference and reach the session through the controller. */
  const resetArm = (current: DragRecord): void => {
    const answer = resetEntry === null ? null : resetEntry(element)
    const accepted = answer !== null && answer !== undefined && answer.ok === true
    if (accepted) counters.resets += 1
    const revert = current.revert
    record = null
    if (revert !== null) writePreview(revert)
  }

  /** THE DROP PATH (`§2.3` row 10): a secondary press observed while a gesture is ACTIVE. This
   *  module calls NO session terminal — it writes the revert and lets the session's own cancel
   *  terminate the gesture (zero commits on that terminal). The revert it writes is the
   *  PRE-DRAG reading (`§2.5` item 3, `§3.1 M-9`), never the last live dragged value. */
  const dropArm = (current: DragRecord): void => {
    counters.drops += 1
    const revert = current.preRevert
    record = null
    // **`§0A` note 5 / `§3.1 M-3`: THE RECORD IS DISCARDED AROUND THE CONSUMER HOOK.** The record
    // is already dropped above; the `finally` is what makes the discard UNCONDITIONAL, so a
    // throwing `applyPreview` cannot leave a retained record behind.
    if (revert !== null) {
      try {
        writePreview(revert)
      } finally {
        record = null
      }
    }
  }

  /** THE MODULE'S OWN OBSERVED-MOVE TURN (`§2.3` row 8). It runs BEFORE the session's wrapped
   *  move hook (this module's move listener is registered after the controller's own attach, so
   *  the session's move turn reaches this module's hook afterwards), which is why the value it
   *  observes is pushed through the handle the HOOK captured and never through a channel of its
   *  own. */
  const onMoveTurn = (event: unknown): void => {
    counters.moves += 1
    const current = record
    if (current === null) return
    current.moved = true
    // **THE PRE-DRAG SIZE IS THE RECORD'S, READ AT ESTABLISHMENT** (`§2.4` item 3, `§2.3` row 7,
    // `§0A` note 5; ADV-GU-6). The as-filed form read `startSizeOf` HERE, lazily, on the FIRST
    // OBSERVED MOVE — so the pre-drag size's site was the move turn and not the establishment
    // turn the contract names. The record is seeded in `onStartHook`; this turn only ensures a
    // gesture that somehow reached a move without an establishment reading still gets one.
    if (!current.started) {
      current.start = seamAnswer(startSizeOf, [element, current.token]).value
      current.started = true
    }
    // **A CALLER-SUPPLIED `pointerOf` IS THE SITE THE COORDINATE IS OBTAINED FROM** (`§2.1`'s
    // `pointerOf` cell, `§2.4` item 1, `§3.1 M-12): when it is supplied this module's own
    // resolver STANDS DOWN, and the caller's answer passes this module's ONE total gate — so a
    // resolver answering the DECLARED `PointerPosition` shape (`{x, y}`, carrying no event
    // reference) is accepted as filed, while a non-object, a partial pair, a `NaN`, an
    // `Infinity`, a throwing accessor or a throw from the seam itself still yields `null` and
    // makes the move INVALID.
    const resolvePointer = (): PointerPosition | null =>
      typeof pointerOf === 'function'
        ? resolvePointerPosition(seamAnswer(pointerOf, [event]).value)
        : resolveEventPointer(event)
    const pointer = resolvePointer()
    // **THE BOUNDS PAIR THIS MOVE CLAMPS AGAINST** (`§2.4` item 2's value chain: `raw +
    // boundsOf(element, token) ⇒ clampToBounds(raw, bounds)`): read AT MOST ONCE per observed move
    // and over the SAME opaque token the axis producer answered for this gesture.
    const pairs = seamAnswer(boundsOf, [element, current.token])
    const pair = pairs.answered ? pairs.value : undefined
    const sizes = seamAnswer(sizeFromPointer, [pointer, current.start])
    const raw = sizes.answered ? sizes.value : undefined
    const value = clampToBounds(raw, pair)
    const state: PreviewState = { value, token: current.token, valid: true, resizable: current.resizable }
    const veto = typeof isDragValid === 'function' ? (isDragValid as (s: PreviewState) => unknown)(state) : undefined
    // **THE VALIDITY RULE HAS FOUR CLAUSES AND THIS EXPRESSION CARRIES ALL FOUR** (`§2.3` item 5;
    // ADV-GU-3). The as-filed form implemented THREE: (ii)/(iii) as `Number.isFinite(value)` and
    // (iv) as the exact-`false` veto — and it had DROPPED clause (i), *"`resolveEventPointer` (or
    // the caller's `pointerOf`) answered a `PointerPosition`"*. The missing clause is observable
    // whenever the size seam is POINTER-INDEPENDENT (it answers a finite number for a `null`
    // pointer): the as-filed expression then called the move VALID, pushed a value through the
    // handle, previewed it and committed it at the `end` terminal — a drag whose pointer was
    // never resolved at all. THE RULE: an unresolved pointer makes the move INVALID, and the
    // invalid arm (the reset) is what a null pointer has always been declared to take.
    const pointerResolved = pointer !== null
    const valid = pointerResolved && Number.isFinite(value) && veto !== false
    current.value = null
    // **BOTH REVERT READINGS ARE TAKEN FROM THIS GESTURE'S OWN PRE-DRAG EVALUATION.** The
    // PRE-DRAG reading is a property of the GESTURE, not of one move, so a drag whose every
    // observed move is VALID still carries it — which is what lets `§3.1 M-9`'s drop (a press
    // that observes no move of its own) revert visibly. The invalid arm's own reading is the
    // same clamp applied at the same evaluation (`§3.1 M-13`). Either reading is `null` when the
    // clamp's answer is not finite, so no non-finite preview is ever written (`§3.2 F-10`).
    current.preRevert = revertFor(current, pair)
    current.revert = revertFor(current, pair)
    if (!valid) {
      resetArm(current)
      return
    }
    current.valid = true
    current.value = value
    if (!current.resizable) return
    // **THE PREVIEW IS THE ONE CONSUMER HOOK THIS TURN CALLS, AND A THROW FROM IT MUST NOT LEAVE A
    // RETAINED RECORD** (`§0A` note 5, `§3.1 M-3`). The discard is therefore taken on the THROW
    // path of this turn's own hook invocation, while the SUCCESS path keeps the record: the SAME
    // event's session-owned wrapper (`E3`'s `onMove`, which `§2.3` row 8 orders AFTER this turn)
    // still has to read the value this turn observed through the handle, so a record discarded on
    // success would break the value channel (`§R` `R6`) outright.
    try {
      writePreview({ value, token: current.token, valid, resizable: current.resizable })
    } catch (thrown) {
      record = null
      throw thrown
    }
  }

  /** THE VALUE CHANNEL (`§R` R6): the composed controller's wrapped move turn is the ONLY legal
   *  handle channel, so the value this module's own turn observed is pushed through the handle
   *  HERE — once per observed move, only when the state is VALID. A move that arrives before the
   *  handle exists pushes nothing (there is nothing to push it into), and the module never
   *  invents a channel for it. */
  const onMoveHook = (gesture: GestureHandle): void => {
    const current = record
    if (current === null) return
    if (current.value === null) return
    gesture.set(current.value)
  }

  /** THE ESTABLISHMENT TURN. It calls NO caller seam of its own: the axis producer, the bounds
   *  producer and the resizability producer are read by the CONTROLLER's own establishment
   *  evaluation for this gesture, and the per-gesture record is SEEDED by those closure calls
   *  and READS their answers here instead of asking again (`§2.6` item 4: a second resizability
   *  evaluation FAILS `§5.5.1 P-GU-IM-2`).
   *
   *  **AND IT IS WHERE THE PRE-DRAG SIZE IS CAPTURED** (`§2.4` item 3: *"`startSizeOf(element,
   *  token)` is called exactly once per gesture, in `onStart`"*; `§2.3` row 7; ADV-GU-6). The
   *  as-filed module read it LAZILY on the first observed move, which is not the site the
   *  contract names and leaves the establishment turn with no pre-drag reading at all — so a
   *  gesture whose first move never arrives carries none. This turn is `E3`'s `onStart` hook, so
   *  the read happens at ESTABLISHMENT and the answer is stored in the record. */
  const onStartHook = (): void => {
    const current = record
    if (current === null) return
    current.establish = true
    const preDragSize = seamAnswer(startSizeOf, [element, current.token])
    current.start = preDragSize.value
    current.started = true
    const pairs = seamAnswer(boundsOf, [element, current.token])
    const pair = pairs.answered ? pairs.value : undefined
    // The visible revert is taken here, over THIS gesture's own pair, so a drag whose every
    // observed move is VALID still carries one (`§3.1 M-9`'s drop of a press that observes no move
    // of its own). **THE PAIR IS THE MOVE TURN'S OWN READ** (it is the value the clamp in
    // `§2.4` item 2's chain consumes), so this turn stores it for the record's own revert readings
    // and does not ask the caller for it a second time.
    current.pair = pair
    current.paired = true
    current.preRevert = revertFor(current, pair)
    current.revert = current.preRevert
  }

  /** THE TERMINAL DISCARD (`§0A` note 5): the per-gesture record is dropped at EVERY terminal,
   *  unconditional and never put back. */
  const onTerminal = (): void => {
    record = null
  }

  /** THE CANCEL TERMINAL (`§2.3` row 12): the visible revert to the PRE-DRAG SIZE, the record
   *  discarded, no sink write. */
  const onCancelHook = (): void => {
    const current = record
    if (current === null) return
    const revert = current.preRevert
    // `§0A` note 5 / `§3.1 M-3` — THE DISCARD IS UNCONDITIONAL, in a `finally` around the
    // consumer hook, so a throwing `applyPreview` cannot leave a retained record.
    try {
      if (revert !== null) writePreview(revert)
    } finally {
      record = null
    }
  }

  /** THE HOVER ENTER (`§2.3` row 4): the axis producer ONCE, the cursor mapping ONCE, the total
   *  resolution, and ONE cursor call carrying the resolved declaration.
   *
   *  **A HOVER THAT DECLARES NOTHING WRITES NOTHING HERE** (`§2.3` row 5: the exit's clear happens
   *  *"iff a declaration was written for this hover"*; `§3.1 M-11`: *"a no-declaration hover writes
   *  NOTHING and clears NOTHING"*). The as-filed form called `applyCursor` with `undefined` on the
   *  ENTER as well as on the EXIT, so the caller's cursor seam was invoked TWICE for a hover that
   *  declared nothing and one of the two calls could not be told from a write. THERE IS NO ENTER
   *  CALL WHEN THERE IS NO DECLARATION TO WRITE; the EXIT's clear — the ONE call such a hover
   *  legitimately produces — is untouched. ZERO session calls, ZERO controller calls. */
  const onHoverEnter = (): void => {
    hovered = true
    const token = seamAnswer(axisOf, [element])
    const mapped = seamAnswer(cursorOf, [token.value])
    const declaration = cursorDeclarationFor(mapped.answered ? mapped.value : undefined)
    if (declaration === undefined) return
    counters.cursorWrites += 1
    counters.lastCursor = declaration
    if (typeof applyCursor === 'function') (applyCursor as (el: unknown, d: string | undefined) => void)(element, declaration)
  }

  /** THE HOVER EXIT (`§2.3` row 5): the clear, on the SAME affordance, while a hover is in
   *  progress. */
  const onHoverExit = (): void => {
    if (!hovered) return
    hovered = false
    counters.cursorClears += 1
    if (typeof applyCursor === 'function') (applyCursor as (el: unknown, d: string | undefined) => void)(element, undefined)
  }

  /** THE MODULE'S OWN CONTEXT-BUTTON TURN (`§2.3` row 6b): the button read comes from the
   *  FORWARDED event through a `typeof` gate. Only a SECONDARY press on an ACTIVE record takes
   *  the drop path; every other shape is INERT — no session call, no terminal, no swallow.
   *
   *  WHETHER A GESTURE EXISTS TO DROP IS THIS MODULE'S OWN READING, NOT THE SESSION'S. The
   *  frozen session's own `'pointerdown'` install opens a gesture attempt on ANY button, so a
   *  bare secondary press makes the session's `begin` seed this module's record through the
   *  composed controller's establishment observer — a settled record therefore does NOT mean a
   *  drag exists. The drag exists once this module has OBSERVED a move of THAT GESTURE (the
   *  record's own `moved` reading, never the instance-wide `moves` counter): an inert secondary
   *  press (`§2.3` row 6, `§3.1 M-14`) and the secondary press arriving before the first observed
   *  move (`§2.3` row 14, `§3.2 F-7`) both read ZERO drops, while a press during an observed drag
   *  (`§2.3` row 10, `§3.1 M-9`) takes the drop path. */
  const onPointerDownTurn = (event: unknown): void => {
    let button: unknown
    try {
      button = (event as { readonly button?: unknown } | null | undefined)?.['button']
    } catch {
      button = undefined
    }
    if (typeof button !== 'number' || button !== 2) return
    const current = record
    if (current === null) return
    if (!current.moved) return
    dropArm(current)
  }

  /** THE THREE ESTABLISHMENT-TIME OBSERVERS. Each is the ONE closure the composed controller's
   *  own seam calls during its establishment evaluation: it evaluates the caller's seam ONCE for
   *  this gesture and seeds the per-gesture record with the answer, so this module's own turns
   *  READ the controller's decision instead of asking a second time. */
  const tokenFor = (el: unknown): unknown => {
    const token = seamAnswer(axisOf, [el]).value
    record = {
      token,
      start: undefined,
      started: false,
      establish: true,
      resizable: false,
      value: null,
      pair: undefined,
      paired: false,
      valid: false,
      moved: false,
      preRevert: null,
      revert: null,
    }
    return token
  }
  const decisionFor = (el: unknown): boolean => {
    const decision = seamAnswer(resizableOf, [el, record === null ? undefined : record.token])
    const resizable = decision.answered ? decision.value === true : false
    if (record !== null) record.resizable = resizable
    return resizable
  }

  const controller = createResizeController({
    session,
    axisFor: (el: unknown) => tokenFor(el),
    boundsFor: (el: unknown, token: unknown) => {
      const answer = seamAnswer(boundsOf, [el, token])
      return answer.answered ? answer.value : undefined
    },
    /** **THE GESTURE'S ALREADY-TAKEN PRE-DRAG READING IS REUSED HERE** (`§2.4` item 3:
     *  *"`startSizeOf(element, token)` is called EXACTLY ONCE per gesture, in `onStart`"*; `§5.5.1`
     *  `P-GU-IM-2`: *"`startSizeOf` — EXACTLY ONCE per gesture, at establishment"*). The composed
     *  controller reads this seam at a RESET terminal, and the as-filed closure consulted the
     *  caller's seam THERE — a second read on the invalid path (**MEASURED over a full invalid
     *  path: `1` read at establishment, `1` after a valid move, `2` after the INVALID move**). The
     *  record already holds that establishment answer, and the two readings cannot disagree
     *  (`§2.4` item 3's closing clause), so the record's own value IS what the reset clamps. The
     *  one fallback below serves only a gesture that never took an establishment reading at all
     *  (there is then nothing to reuse); it reuses nothing and hides nothing. */
    defaultSizeFor: (el: unknown, token: unknown) => {
      if (record !== null && record.started) return record.start
      const answer = seamAnswer(startSizeOf, [el, token])
      return answer.answered ? answer.value : undefined
    },
    isResizable: (el: unknown, token: unknown) => {
      const decision = seamAnswer(resizableOf, [el, token])
      const resizable = decision.answered ? decision.value === true : false
      if (record !== null) record.resizable = resizable
      return decision.answered ? decision.value : undefined
    },
    sizeFor: (_el: unknown, gesture: GestureHandle) => gesture.value,
    commit: commit as ((gesture: unknown, value: number) => void) | undefined,
  })

  /** THE COMPOSED CONTROLLER'S OWN RESET PROTOCOL MEMBER, read ONCE. It is the ONE
   *  session-touching call this module makes on the invalid arm (`§2.3` row 9), and it is the
   *  controller's member — never the session's. */
  const resetEntry = (() => {
    const member = (controller as unknown as Record<string, unknown>)['reset']
    return typeof member === 'function' ? (member as (el: unknown) => { readonly ok?: unknown } | null | undefined).bind(controller) : null
  })()

  /** One registration through the INJECTED source, recorded so `detach()` removes the SAME
   *  values. A source that cannot take the call leaves no listener behind. */
  const registerListener = (type: string, handler: (event: unknown) => void): boolean => {
    if (type.length === 0) return false
    const take = source === null || source === undefined ? undefined : (source as { on?: unknown })['on']
    if (typeof take !== 'function') return false
    try {
      ;(source as EventSourceLike).on(element, type, handler)
    } catch {
      return false
    }
    listeners.push({ type, handler })
    return true
  }

  /** **THE MODULE'S OWN LISTENERS ARE REMOVED AS ONE CONTIGUOUS BLOCK** (`§2.3` row 13: *"exactly
   *  FOUR `source.off` calls, the module's own four, each matching its `on` by the same three
   *  values … **before** the controller's own delegation"*). It is ONE body because it has TWO
   *  callers with the SAME obligation: `detach()`, and the ROLLBACK a refused `attach()` owes so no
   *  owner is left behind. A source that refuses the removal keeps the module's own record honest
   *  either way (the block is cleared regardless). */
  const removeOwnListeners = (): void => {
    const give = source === null || source === undefined ? undefined : (source as { off?: unknown })['off']
    for (const listener of listeners) {
      if (typeof give !== 'function') break
      try {
        ;(source as EventSourceLike).off(element, listener.type, listener.handler)
      } catch {
        continue
      }
    }
    listeners.length = 0
  }

  const attach = (): boolean => {
    if (attached || detached) return false
    if (element === null || element === undefined || typeof element !== 'object') return false
    // **`attach()` RETURNS `true` IFF EVERY DELEGATION SUCCEEDED** (`§2.1`'s `attach` cell,
    // `§2.3` row 2; ADV-GU-5). The as-filed body DISCARDED the four `registerListener` results,
    // so a source that refuses them yielded `attach() === true` with ZERO module listeners — a
    // green that says "attached" about an affordance that hears nothing. The three non-move
    // registrations are therefore checked BEFORE the controller is attached, and the move
    // registration (which must stay registered AFTER the controller's, `§2.3` row 8's ordering
    // clause) is checked after it.
    const hoverEnterRegistered = registerListener('pointerover', onHoverEnter)
    const hoverExitRegistered = registerListener('pointerout', onHoverExit)
    const pointerDownRegistered = registerListener('pointerdown', onPointerDownTurn)
    // **A REFUSED `attach()` LEAVES NO OWNER BEHIND** (`§2.1`'s `attach` cell: *"`true` iff every
    // delegation succeeded"*). The as-filed body returned `false` while KEEPING the listeners it had
    // already registered AND the controller's delegation, so the instance was half-attached,
    // `detach()` refused, and NOBODY removed the listeners (MEASURED: `attach()` `false` with
    // `attached: 1` on the controller, `3` residual listeners, `detach()` `false`). A refusal of the
    // module's OWN FOUR rollbacks its own registrations here, and marks the instance so that
    // `detach()` — the other half of the same obligation — can still complete the recovery.
    if (!hoverEnterRegistered || !hoverExitRegistered || !pointerDownRegistered) {
      removeOwnListeners()
      recoverable = true
      return false
    }
    const controllerAttached = controller.attach(element, {
      onStart: onStartHook,
      onMove: onMoveHook,
      onEnd: onTerminal,
      onCancel: onCancelHook,
    })
    if (!controllerAttached) {
      removeOwnListeners()
      return false
    }
    // **THE MOVE LISTENER IS ATTACHED ONLY FOR A NON-EMPTY STRING TOKEN** (`§2.1` item 9, `§R.3`'s
    // degradation row: *"a non-string or empty token ⇒ **NO move listener is attached**"*). The
    // as-filed gate admitted the EMPTY string through its `typeof` read and FELL BACK to the
    // session's own token for every NON-string answer, so a number, an object, a boolean and an
    // ABSENT seam each attached a listener under the fallback literal (MEASURED: `42`, `{}` and an
    // absent seam all registered `"pointermove"` with the drag half reading `moves 1`) — a drag half
    // the wiring never asked for, indistinguishable from a working one. A token that is not a
    // non-empty string now registers NOTHING AT ALL (never a fallback literal), and that declared
    // degradation is NOT a failed delegation: the three registrations above and the composed
    // controller's own delegation stand, and the session's own wrapped move turn is then the only
    // move turn (`§2.3` row 8).
    const moveType = seamAnswer(moveTypeOf, [element])
    const token = moveType.answered ? moveType.value : undefined
    if (typeof token === 'string' && token.length > 0) {
      if (!registerListener(token, onMoveTurn)) {
        removeOwnListeners()
        recoverable = true
        return false
      }
    }
    attached = true
    recoverable = false
    return true
  }

  const detach = (): boolean => {
    // **`detach()` COMPLETES A REFUSED `attach()`'s RECOVERY** (`§2.1`'s `attach` cell). A refused
    // attach is not a completed delegation, so the module's own `attached` flag is unset — but the
    // controller may already be attached, and refusing to detach there would strand its listeners
    // with no owner. The flag below admits exactly that state and nothing else: an instance that
    // never reached `attach()` still answers `false` (`§2.3` row 14's short-circuit).
    if ((!attached && !recoverable) || detached) return false
    removeOwnListeners()
    const reported = controller.detach()
    detached = true
    recoverable = false
    return reported === true
  }

  const stats = (): GutterAffordanceStats => ({
    moves: counters.moves,
    previews: counters.previews,
    cursorWrites: counters.cursorWrites,
    cursorClears: counters.cursorClears,
    resets: counters.resets,
    drops: counters.drops,
    lastCursor: counters.lastCursor,
  })

  return {
    attach,
    detach,
    get detached(): boolean {
      return detached || controller.detached === true
    },
    stats,
    controller,
  }
}
