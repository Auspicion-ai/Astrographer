// src/shared/foundation-return-shapes.ts
// ===========================================================================
// THE FIVE FOUNDATION RETURN SHAPES THIS REPO MUST RE-DECLARE — FORK-LOCAL,
// TYPE-ONLY, WITH NO SPECIFIER CONSUMED IN ANY FORM.
//
// CONTRACT: docs/specs/unit-pd-vendor-foundation-mechanisms.md
//   §0A note 7 / §1.1 item 6 / §1.2 / `D-11`   THE RULED PATH IS THIS FILE
//   §2.1 item 7 / item 7b rules 1–5            the five declaration rules
//   §4 `P-IM-4`                                the register row (12 attempts)
//   §5 item 7                                  the DECLARATION is claimed,
//                                              never structural equivalence
//   §9 item 8 / `G-8`                          the foundation-side export gap
//                                              is HANDED OFF, never patched
//
// WHY THIS FILE EXISTS. `GestureSession` (`src/shared/gesture-session.ts`),
// `RelocateResetResult` (`src/shared/relocate.ts`) and `FocusResult` /
// `FocusRefusal` / `FocusTransitionArg` (`src/shared/focus-model.ts`) are
// DECLARED WITHOUT `export` in the vendored bytes. They are returned by values
// and taken by callbacks, so a consumer cannot name them from the vendored
// module at all. Adding the keyword to a vendored declaration would break
// `P-IM-1`'s byte-identity (§3.1 `V-5`), so this repo re-declares them here
// instead and the gap stays an upstream HANDOFF item.
//
// THE TYPE-ONLY RULE (§2.1 item 7b rule 2). This module carries no statement
// that consumes a specifier, from anywhere, in any form, and it carries no
// runtime value. It is therefore not an import-graph member and cannot become a
// sixteenth edge (§2.1 item 5 / `P-IM-3`); and it is neither a manifest-claimed
// member nor one of the four baseline files (rule 5).
//
// THE MIRROR'S READING (§5 item 7). The members below restate the vendored
// declarations' own member lists, and those declarations are the source. This
// file and its register row assert DECLARATION PRESENCE and the FIVE-NAME SET.
// Whether these members equal the foundation's actual RETURNED VALUES is the
// vendored suites' envelope-layer reading (and is partly uncollected), so that
// equivalence is NOT claimed here and is not a claim this unit makes green.
// ===========================================================================

// ---------------------------------------------------------------------------
// MIRRORS OF THE TYPES THE FIVE SHAPES NAME (unexported, per the type-only
// rule). No specifier may be consumed, so every type a re-declared shape
// mentions is restated here under the name its vendored declaration carries.
// The vendored modules export several of them at their own path
// (`GestureElement`, `GestureHandle`, `FocusId`, `FocusEntry`, `FocusVerb`,
// `FocusRefusalCode`, `FocusState`), so a consumer names those directly from
// the vendored module and reads the module-local remainder through these
// shapes.
// ---------------------------------------------------------------------------

/** `src/shared/gesture-session.ts` — `export type GestureElement = unknown`. */
type GestureElement = unknown

/** `src/shared/gesture-session.ts` — `GestureHandle` (exported there). */
interface GestureHandle {
  readonly id: number
  readonly element: GestureElement
  readonly active: boolean
  readonly outcome: 'end' | 'reset' | 'cancel' | null
  readonly value: unknown
  set(value: unknown): GestureHandle
}

/** `src/shared/gesture-session.ts` — `GestureOptionsInput` (exported there). */
interface GestureOptionsInput {
  readonly capture?: unknown
  readonly onStart?: unknown
  readonly onMove?: unknown
  readonly onEnd?: unknown
  readonly onCancel?: unknown
}

/** `src/shared/gesture-session.ts` — `GestureCode`: the closed seven-member
 *  result-code union, module-local there. */
type GestureCode = 'ok' | 'not-installed' | 'busy' | 'disposed' | 'disconnected' | 'stale' | 'no-gesture'

/** `src/shared/gesture-session.ts` — `GestureOutcome`, module-local there. */
type GestureOutcome = 'end' | 'reset' | 'cancel' | null

/** `src/shared/gesture-session.ts` — `BeginResult`, module-local there. */
type BeginResult =
  | { readonly ok: true; readonly gesture: GestureHandle }
  | { readonly ok: false; readonly code: GestureCode }

/** `src/shared/gesture-session.ts` — `TerminalResult`, module-local there. */
type TerminalResult = {
  readonly ok: boolean
  readonly code: GestureCode
  readonly committed: boolean
}

/** `src/shared/gesture-session.ts` — `DisposeReport`, module-local there. */
type DisposeReport = {
  readonly removed: number
  readonly complete: boolean
}

/** `src/shared/gesture-session.ts` — `SessionStats` (exported there). */
interface SessionStats {
  readonly installed: number
  readonly sourceCalls: number
  readonly gestures: number
  readonly commits: number
  readonly active: boolean
  readonly gestureId: number
  readonly lastCode: GestureCode
}

/** `src/shared/gesture-session.ts` — `GestureStats` (exported there). */
interface GestureStats {
  readonly active: boolean
  readonly id: number
  readonly outcome: GestureOutcome
  readonly value: unknown
  readonly commits: number
}

/** `src/shared/focus-model.ts` — `export type FocusId = unknown`. */
type FocusId = unknown

/** `src/shared/focus-model.ts` — `FocusEntry` (exported there, in the alias
 *  form its own comment states the reason for). */
type FocusEntry = {
  readonly id: unknown
  readonly target: unknown
  readonly label?: string
}

/** `src/shared/focus-model.ts` — `FocusVerb` (exported there). */
type FocusVerb = 'open' | 'activate' | 'close' | 'next' | 'prev'

/** `src/shared/focus-model.ts` — `FocusRefusalCode` (exported there). */
type FocusRefusalCode = 'unknown-verb' | 'duplicate-id' | 'unknown-id' | 'no-next' | 'no-previous'

/** `src/shared/focus-model.ts` — `FocusState` (exported there, in the alias
 *  form its own comment states the reason for). */
type FocusState = {
  readonly entries: readonly FocusEntry[]
  readonly activeId: FocusId | null
}

// ---------------------------------------------------------------------------
// THE FIVE RE-DECLARED SHAPES. This is the closed pinned set of §2.1 item 7 /
// §4 `P-IM-4`, in the `interface` form each vendored declaration itself uses
// (§2.1 item 7b rule 2's declared surface), and every one of the five is
// exported FROM THIS PATH.
// ---------------------------------------------------------------------------

/** §2.1 item 7 / `D-11` — re-declared for `src/shared/gesture-session.ts`'s
 *  `interface GestureSession`, which is declared there WITHOUT `export`. Nine
 *  members in declared order. */
export interface GestureSession {
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

/** §2.1 item 7 / `D-11` — re-declared for `src/shared/relocate.ts`'s
 *  `interface RelocateResetResult`, which is declared there WITHOUT `export`.
 *  The refusal record `reset(element)` returns. */
export interface RelocateResetResult {
  readonly ok: boolean
  readonly code: string
  readonly committed: boolean
}

/** §2.1 item 7 / `D-11` — re-declared for `src/shared/focus-model.ts`'s
 *  `interface FocusResult`, module-local there. Seven members in declared
 *  order. */
export interface FocusResult {
  readonly state: FocusState
  readonly accepted: boolean
  readonly verb: FocusVerb | 'unknown'
  readonly refusals: readonly FocusRefusal[]
  readonly seated: FocusId | null
  readonly changed: boolean
  readonly persisted: { readonly present: boolean; readonly value: unknown }
}

/** §2.1 item 7 / `D-11` — re-declared for `src/shared/focus-model.ts`'s
 *  `interface FocusRefusal`, module-local there. Three members in declared
 *  order: code, verb then id. */
export interface FocusRefusal {
  readonly code: FocusRefusalCode
  readonly verb: FocusVerb | 'unknown'
  readonly id: FocusId
}

/** §2.1 item 7 / `D-11` — re-declared for `src/shared/focus-model.ts`'s
 *  `interface FocusTransitionArg`, module-local there: the transition's third
 *  argument, whose three seams are all optional. */
export interface FocusTransitionArg {
  readonly entry?: FocusEntry
  readonly id?: FocusId
  readonly refuse?: (refusal: FocusRefusal) => void
  readonly onChange?: (next: FocusState, previous: FocusState, refusal?: FocusRefusal) => void
}
