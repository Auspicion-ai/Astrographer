// src/shared/focus-model.ts
// ===========================================================================
// U-FOCUS-MODEL — THE PURE ORDERED-ENTRY TRANSITION REDUCER.
// CONTRACT: docs/specs/focus-model.md (APPROVED at the spec gate).
//
// NINE EXPORTED NAMES, IN TWO HALVES: the four VALUE EXPORTS focusTransition,
// focusOrder, focusIndex and persist, and the five TYPE DECLARATIONS FocusId,
// FocusEntry, FocusVerb, FocusRefusalCode and FocusState. THERE IS NO FACTORY,
// NO SESSION AND NO OPTIONS OBJECT HERE.
//
// THE IMPORT CENSUS IS ZERO — not one statement, not even type-only — because
// the five types are declared in this file, no sibling surface is composed and
// the two landed order-projecting hosts are boundaries and never imports.
//
// THE ERROR PATTERN IS UNIFORM AND IT IS PART OF THE CONTRACT: none of the four
// value exports throws, for any argument and for any seam shape. A refusal is a
// VALUE the result carries, and an unusable or throwing seam is absorbed with
// its declared degradation.
//
// THE MODULE OWNS: its four function names, its five type names, the member
// names of its four declared records, the five verb bodies, the normalised body
// unknown and the five refusal codes. IT OWNS NOTHING ELSE: no state, no entry,
// no id, no target, no label, no order, no comparator, no index, no store, no
// cache, no default, no policy, no DOM and no surface.
//
// THE ELEVEN DECLARED STRING LITERAL BODIES are the five verb bodies open,
// activate, close, next and prev, the normalised verb body unknown, and the five
// refusal codes unknown-verb, duplicate-id, unknown-id, no-next and no-previous.
// THE MEMBER NAMES, THE FUNCTION NAMES AND THE TYPE NAMES ARE IDENTIFIERS AND
// ARE NEVER SPOKEN AS LITERALS — see readOwn below, which takes a member name
// from an IDENTIFIER-NAMED key of a record this module owns.
//
// NO MODULE-LEVEL BINDING EXISTS: every value in this file is either a
// declaration, a literal at its use site, or a local of the call that needs it.
// ===========================================================================

/** AN ENTRY IDENTITY. The type unknown IS the whole of the opacity declaration,
 *  so no coercion, no naming and no structural comparison is even available to
 *  this module. Identity equality is the ONE rule and there is no comparator
 *  parameter and no equality seam. */
export type FocusId = unknown

/** THE ENTRY RECORD — a closed record of THREE members and no fourth.
 *  id     — REQUIRED. The caller own opaque identity, echoed into results and
 *           refusals by identity and consulted only by the one equality test the
 *           ownership rule needs.
 *  target — REQUIRED. The caller own opaque payload: CARRIED AND RETURNED, NEVER
 *           CONSULTED and NEVER COMPARED, except by the one licensed identity
 *           test that decides activation. Any value, including null, undefined,
 *           an object, a function, a Symbol or a hostile holder.
 *  label  — OPTIONAL, and the caller own string: echoed verbatim or absent, never
 *           trimmed, defaulted, parsed or validated. This module owns no label
 *           vocabulary and no label literal. */
// DECLARED IN THE ALIAS FORM, SO THE CALLER CAN NAME ITS OWN RECORDS: an
// INTERFACE carries no implicit index signature, so a caller holding a plain
// record and asserting it into this shape through the type is REFUSED by the
// compiler (TS2352) — the alias form admits that assertion while the members,
// their order and their optionality stay exactly as declared.
export type FocusEntry = {
  readonly id: unknown
  readonly target: unknown
  readonly label?: string
}

/** THE CLOSED FIVE-MEMBER VERB UNION — the transition alphabet, and no sixth
 *  member. An unrecognised verb is TOTAL: no throw, the prior state returned by
 *  identity, and exactly one refusal of the code unknown-verb. */
export type FocusVerb = 'open' | 'activate' | 'close' | 'next' | 'prev'

/** THE CLOSED REFUSAL-CODE UNION — FIVE members, this unit own, borrowed from
 *  neither landed host. */
export type FocusRefusalCode = 'unknown-verb' | 'duplicate-id' | 'unknown-id' | 'no-next' | 'no-previous'

/** THE CALLER-OWNED STATE — TWO members, declared order entries then activeId.
 *  The CALLER owns it: this module never holds it, never mutates it, and returns
 *  it BY IDENTITY on every refusal. activeId is null when nothing is active, and
 *  entries is the CALLER OWN ORDER — this module sorts nothing. */
// The alias form, for the reason the entry record states above.
export type FocusState = {
  readonly entries: readonly FocusEntry[]
  readonly activeId: FocusId | null
}

/** THE SEAMS — all three OPTIONAL, each with a declared degradation, and none
 *  retained after the call returns. refuse and onChange arrive as members of the
 *  transition third argument; the returned-write seam called persist is a
 *  top-level value export and is NEVER called by focusTransition. */
interface FocusTransitionArg {
  /** The caller entry for the current attempt, consumed only by open. */
  readonly entry?: FocusEntry
  /** The caller opaque id for activate and for close. */
  readonly id?: FocusId
  /** Notified ONCE PER REFUSAL, in attempt order, and NEVER the gate. */
  readonly refuse?: (refusal: FocusRefusal) => void
  /** Notified EXACTLY ONCE PER ACCEPTED TRANSITION, including a no-op acceptance,
   *  and never for a refusal. */
  readonly onChange?: (next: FocusState, previous: FocusState, refusal?: FocusRefusal) => void
}

/** A refusal is DATA, never a throw and never a callback verdict: THREE members,
 *  declared order code, verb then id. */
interface FocusRefusal {
  readonly code: FocusRefusalCode
  readonly verb: FocusVerb | 'unknown'
  readonly id: FocusId
}

/** THE RETURNED TRANSITION VALUE — SEVEN members in declared order. */
interface FocusResult {
  readonly state: FocusState
  readonly accepted: boolean
  readonly verb: FocusVerb | 'unknown'
  readonly refusals: readonly FocusRefusal[]
  readonly seated: FocusId | null
  readonly changed: boolean
  readonly persisted: { readonly present: boolean; readonly value: unknown }
}

// ---------------------------------------------------------------------------
// THE RECORD READS — TOTAL, OWN-MEMBER ONLY, AND NOTHING RAISED.
// ---------------------------------------------------------------------------

/** ONE OWN-MEMBER READ: whether the member is an OWN member of the holder, and
 *  the value that reading it yields. */
type Read = { readonly present: boolean; readonly value: unknown }

/** THE DECLARED ABSENCE — a fresh record every time, so no reading of a caller
 *  record is ever shared, retained or cached. */
function absent(): Read {
  return { present: false, value: undefined }
}

/** THE MEMBER NAME, SPOKEN AS AN IDENTIFIER AND NEVER AS A LITERAL: the name is
 *  taken from the single IDENTIFIER-NAMED key of a record this module owns, so no
 *  member name is ever written as a string body and the declared literal set
 *  stays the closed eleven. */
function soleName(bag: Readonly<Record<string, unknown>>): string {
  return Object.getOwnPropertyNames(bag)[0] as string
}

/** THE OWN-MEMBER READ THIS CONTRACT LICENSES. An absent member, an INHERITED
 *  member, a non-record holder and a THROWING accessor all read as the declared
 *  absence, and NOTHING RISES OUT OF HERE for any holder shape. */
function readOwn(holder: unknown, bag: Readonly<Record<string, unknown>>): Read {
  try {
    const name = soleName(bag)
    const described = Object.getOwnPropertyDescriptor(holder as object, name)
    if (described === undefined) return absent()
    return { present: true, value: (holder as Record<string, unknown>)[name] }
  } catch {
    return absent()
  }
}

/** THE CALLER ORDER, READ TOTALLY: a usable array reads its own elements in its
 *  own order, and EVERY other shape reads the declared empty sequence. */
function entriesOf(state: unknown): readonly FocusEntry[] {
  try {
    const read = readOwn(state, { entries: null })
    return Array.isArray(read.value) ? (read.value as readonly FocusEntry[]) : []
  } catch {
    return []
  }
}

/** THE CALLER ACTIVE SLOT, READ TOTALLY AND CARRIED BY IDENTITY. The member's
 *  value is returned UNTOUCHED — this function NEVER MAPS ONE VALUE ONTO
 *  ANOTHER — because `undefined` is a LEGAL opaque id value and is DISTINCT FROM
 *  `null`, which is the declared nothing-active reading and is carried as
 *  itself. An absent, inherited or unreadable member, and every unusable holder,
 *  read the declared absence, which is `undefined` — the same value the member
 *  itself would have carried had the caller written it. NOTHING RISES OUT OF
 *  HERE for any holder shape, and an `undefined` active id is therefore a
 *  POSITION: `next` over it takes the accepted arm rather than a refusal about
 *  a value it never named. */
function activeOf(state: unknown): FocusId | null {
  return readOwn(state, { activeId: null }).value as FocusId | null
}

/** THE SAME-VALUE-ZERO RULE the one permitted keying uses: identity, with the
 *  boundary that makes NaN an ordinary identity. */
function isSame(left: unknown, right: unknown): boolean {
  return left === right || (left !== left && right !== right)
}

/** THE OWNERSHIP LOOKUP — a Map keyed by the caller IDENTITY itself, which is the
 *  ONLY keying this contract permits because it coerces nothing. THE
 *  FIRST-OCCURRENCE RULE: the first occurrence of an id owns it, and a refused
 *  occurrence reserves nothing because this table is built from the entries the
 *  caller supplied and from nothing else. */
function ownershipOf(entries: readonly FocusEntry[]): Map<unknown, number> {
  const owners = new Map<unknown, number>()
  let at = 0
  for (const entry of entries) {
    const read = readOwn(entry, { id: null })
    if (read.present && !owners.has(read.value)) owners.set(read.value, at)
    at += 1
  }
  return owners
}

/** THE ONE LICENSED TARGET OPERATION: the position of the FIRST entry whose own
 *  target is IDENTICAL to this attempt target, or -1. The comparison reads
 *  NOTHING: no member is consulted, no hook is invoked and no structure is
 *  inspected, so a hostile or revoked holder is compared without being touched. */
function targetAt(entries: readonly FocusEntry[], target: unknown): number {
  let found = -1
  let at = 0
  for (const entry of entries) {
    if (found < 0 && readOwn(entry, { target: null }).value === target) found = at
    at += 1
  }
  return found
}

// ---------------------------------------------------------------------------
// THE VERB ALPHABET AND THE SEAMS.
// ---------------------------------------------------------------------------

/** THE ONE OPERATION THIS MODULE PERFORMS ON A VERB: an identity test against
 *  its five declared bodies. No coercion, no case fold, no trim and no prefix
 *  match, and the string unknown is not a verb. */
function verbBodyOf(verb: unknown): FocusVerb | null {
  if (verb === 'open') return 'open'
  if (verb === 'activate') return 'activate'
  if (verb === 'close') return 'close'
  if (verb === 'next') return 'next'
  if (verb === 'prev') return 'prev'
  return null
}

/** THE TWO ARGUMENT SEAMS, read as values and never called here. */
function seamsOf(arg: unknown): { readonly refuse: unknown; readonly onChange: unknown } {
  return {
    refuse: readOwn(arg, { refuse: null }).value,
    onChange: readOwn(arg, { onChange: null }).value,
  }
}

/** A SEAM IS OBSERVATION AND NEVER THE GATE. It is invoked here for its
 *  observation ONLY, and its outcome is discarded: an absent seam, a non-callable
 *  seam and a THROWING seam are all absorbed at this call site, so a caller-code
 *  throw is NEVER reported as a refusal of this contract and NO refusal code is
 *  ever invented for it. Nothing is held after the call returns. */
function observe(seam: unknown, first: unknown, second: unknown, third: unknown): void {
  try {
    ;(seam as (one: unknown, two: unknown, three: unknown) => void)(first, second, third)
  } catch {
    // A caller-code throw is CALLER code: it changes no verdict of this module.
  }
}

/** THE DECLARED ABSENCE OF A RETURNED WRITE: present is false and value is
 *  undefined, exactly as declared for every not-called arm. */
function notCalled(): { readonly present: boolean; readonly value: unknown } {
  return { present: false, value: undefined }
}

// ---------------------------------------------------------------------------
// THE TWO OUTCOMES.
// ---------------------------------------------------------------------------

/** A REFUSED ATTEMPT: accepted false, changed false, EXACTLY ONE refusal, and
 *  the PRIOR STATE RETURNED BY IDENTITY. seated is the prior activeId, so a
 *  boundary refusal names the position it could not leave.
 *
 *  THE ORDER OF OPERATIONS IS DECLARED AND IT IS INVERTED HERE: THE RECORD IS
 *  BUILT FIRST, THE RESULT IS ASSEMBLED AROUND IT, AND ONLY THEN IS A COPY
 *  HANDED TO THE OBSERVER. The result therefore carries THE MODULE'S OWN refusal
 *  record, while the callback receives a COPY IT MAY MUTATE FREELY — every field
 *  rewritten, deleted, or a mutation interrupted by a THROW — and NO OUTCOME
 *  MOVES: not the refusal, not its code, not its order and not its count. The
 *  copy carries the very same values by identity, so it is NOT the value-losing
 *  copy the contract bans (no re-stringing, no round-trip and no deep clone),
 *  and it is built from a record this module owns rather than from any caller
 *  holder, so no caller member name is ever read here. */
function refusalResult(
  priorState: FocusState,
  priorActive: FocusId | null,
  verb: FocusVerb | 'unknown',
  code: FocusRefusalCode,
  id: FocusId,
  seams: { readonly refuse: unknown; readonly onChange: unknown },
): FocusResult {
  const record: FocusRefusal = { code, verb, id }
  const refusals: readonly FocusRefusal[] = [record]
  const result: FocusResult = {
    state: priorState,
    accepted: false,
    verb,
    refusals,
    seated: priorActive,
    changed: false,
    persisted: notCalled(),
  }
  const observation: FocusRefusal = { code: record.code, verb: record.verb, id: record.id }
  observe(seams.refuse, observation, undefined, undefined)
  return result
}

/** AN ACCEPTED ATTEMPT: a FRESH state record whenever the attempt moved the
 *  state, the PRIOR state BY IDENTITY when it did not, and changed measured on
 *  state identity alone. The change observer fires EXACTLY ONCE for every
 *  accepted attempt, INCLUDING a no-op acceptance, and never for a refusal. */
function acceptedResult(
  priorState: FocusState,
  priorActive: FocusId | null,
  verb: FocusVerb,
  nextEntries: readonly FocusEntry[],
  nextActive: FocusId | null,
  seams: { readonly refuse: unknown; readonly onChange: unknown },
): FocusResult {
  const settled = isSame(nextActive, priorActive) && (nextEntries as unknown) === (entriesOf(priorState) as unknown)
  const nextState: FocusState = settled ? priorState : { entries: nextEntries, activeId: nextActive }
  const refusals: readonly FocusRefusal[] = []
  const result: FocusResult = {
    state: nextState,
    accepted: true,
    verb,
    refusals,
    seated: nextActive,
    changed: nextState !== priorState,
    persisted: notCalled(),
  }
  observe(seams.onChange, nextState, priorState, undefined)
  return result
}

// ---------------------------------------------------------------------------
// THE FOUR VALUE EXPORTS.
// ---------------------------------------------------------------------------

/** THE TRANSITION — PURE, TOTAL, STATELESS. Returns the SEVEN-member result for
 *  the caller state under the caller verb and optional argument. A refused
 *  attempt returns the prior state BY IDENTITY, accepted false, exactly one
 *  refusal and changed false; an accepted attempt returns a FRESH state,
 *  accepted true, an empty refusal list and changed measured on state identity.
 *  The ends refuse rather than wrapping or clamping. It mutates no argument,
 *  reads no ambient value, holds nothing between calls and NEVER THROWS. It does
 *  NOT call persist. */
export function focusTransition(
  state: FocusState,
  verb: unknown,
  arg?: FocusTransitionArg,
): FocusResult {
  const body = verbBodyOf(verb)
  const priorActive = activeOf(state)
  const seams = seamsOf(arg)
  const record: FocusVerb | 'unknown' = body === null ? 'unknown' : body
  if (body === null) return refusalResult(state, priorActive, record, 'unknown-verb', null, seams)
  const entries = entriesOf(state)

  if (body === 'open') {
    const entry = readOwn(arg, { entry: null }).value
    const own = readOwn(entry, { id: null })
    if (!own.present) return refusalResult(state, priorActive, record, 'unknown-id', undefined, seams)
    const id = own.value
    // THE DUPLICATE RULE IS AN ID EQUALITY ON THE ENTRIES CURRENTLY IN THE SET:
    // the target is never compared for a duplicate, and an id that is already
    // owned is refused whatever its target.
    const owners = ownershipOf(entries)
    if (owners.has(id)) return refusalResult(state, priorActive, record, 'duplicate-id', id, seams)
    // THE ACTIVATION ARM: an unowned id whose target is IDENTICAL to an existing
    // entry target activates that entry, appends nothing and seats the EXISTING
    // entry own id.
    const at = targetAt(entries, readOwn(entry, { target: null }).value)
    if (at >= 0) {
      return acceptedResult(
        state, priorActive, body, entries, readOwn(entries[at], { id: null }).value, seams,
      )
    }
    // THE APPEND ARM: the caller own entry object is appended at the END, so the
    // element identity is the caller one and nothing is re-sorted.
    return acceptedResult(state, priorActive, body, entries.concat([entry as FocusEntry]), id, seams)
  }

  if (body === 'activate') {
    const id = readOwn(arg, { id: null }).value
    const at = ownershipOf(entries).get(id)
    if (at === undefined) return refusalResult(state, priorActive, record, 'unknown-id', id, seams)
    return acceptedResult(
      state, priorActive, body, entries, readOwn(entries[at], { id: null }).value, seams,
    )
  }

  if (body === 'close') {
    const id = readOwn(arg, { id: null }).value
    const at = ownershipOf(entries).get(id)
    if (at === undefined) return refusalResult(state, priorActive, record, 'unknown-id', id, seams)
    // THE DECLARED RE-SEATING: the entry that was AFTER the closed one, and the
    // new LAST entry when the closed one was last, and null when nothing
    // remains. Closing a NON-ACTIVE entry leaves the seat untouched.
    const rest = entries.slice(0, at).concat(entries.slice(at + 1))
    const wasActive = isSame(readOwn(entries[at], { id: null }).value, priorActive)
    const seated = wasActive && rest.length > 0
      ? readOwn(rest[Math.min(at, rest.length - 1)], { id: null }).value
      : null
    return acceptedResult(state, priorActive, body, rest, wasActive ? seated : priorActive, seams)
  }

  // next and prev MOVE ONE STEP OVER THE CALLER ORDER, BY IDENTITY, and THE ENDS
  // REFUSE: no wrap, no clamp, and an unowned or absent active id is no position
  // at all.
  const code: FocusRefusalCode = body === 'next' ? 'no-next' : 'no-previous'
  const at = ownershipOf(entries).get(priorActive)
  if (priorActive === null || at === undefined) {
    return refusalResult(state, priorActive, record, code, priorActive, seams)
  }
  const to = body === 'next' ? at + 1 : at - 1
  if (to < 0 || to >= entries.length) {
    return refusalResult(state, priorActive, record, code, priorActive, seams)
  }
  return acceptedResult(
    state, priorActive, body, entries, readOwn(entries[to], { id: null }).value, seams,
  )
}

/** THE CALLER SEQUENCE — returned as the CALLER OWN array, in the caller own
 *  order, permuted by nothing, sorted by nothing, deduped by nothing and copied
 *  by nothing. A non-array reads as the EMPTY SEQUENCE. NEVER THROWS. */
export function focusOrder(entries: readonly FocusEntry[]): readonly FocusEntry[] {
  try {
    return Array.isArray(entries) ? entries : []
  } catch {
    return []
  }
}

/** THE CALLER POSITION — the zero-based index of the entry whose id is the SAME
 *  IDENTITY as this id, or the declared sentinel -1 when the id is not owned,
 *  when the state carries no usable entries array, and by construction when the
 *  id is null and no entry id is null. Every return is a number. NEVER THROWS. */
export function focusIndex(state: FocusState, id: FocusId): number {
  try {
    const at = ownershipOf(entriesOf(state)).get(id)
    return at === undefined ? -1 : at
  } catch {
    return -1
  }
}

/** THE RETURNED-WRITE SEAM — a caller-supplied callback this module INVOKES with
 *  the state and whose RETURN VALUE is handed back to the caller. IT CALLS NO
 *  STORAGE: it stores nothing, writes no file, touches no storage surface, holds
 *  no store, keeps no cache and retains no reference to the seam or to its return
 *  value once the call returns. An absent, non-callable or THROWING seam reads
 *  the declared absence, and a seam that RETURNS has its own return handed back
 *  verbatim BY IDENTITY, whatever shape it is, including undefined and including
 *  a promise this module neither awaits nor inspects. NEVER THROWS. */
export function persist(
  seam: unknown,
  state: FocusState,
): { readonly present: boolean; readonly value: unknown } {
  let present = false
  let value: unknown = undefined
  try {
    value = (seam as (held: FocusState) => unknown)(state)
    present = true
  } catch {
    present = false
  }
  return { present, value }
}
