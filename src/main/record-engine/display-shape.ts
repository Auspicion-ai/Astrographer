// src/main/record-engine/display-shape.ts — THE `display` FAMILY'S PAYLOAD, ITS ONE PARSE, ITS PLACEHOLDER AND ITS SENTENCES
// (`docs/L1/unit-b-1-record-engine-seam.md` §2, §4 site 2). The fork's FIRST record family (D-23), ported in SHAPE from the
// foundation's `paneOf` discipline (`../Provident-Electron/src/main/view-record/index.ts:544` at our pin `b312d83`) and never
// vendored (`ASM-B-1`).
//
// **THE PAYLOAD, EXACTLY — ONE MEMBER PER TAB ID, THE KEY BEING THE ADDRESS SEGMENT AND NEVER A STORED `tabId`.** An entry
// lands at `['display', <tabId>]`, so the id is the ADDRESS and this family carries no `tabId` member anywhere: the
// foundation's own `paneOf(id, held)` writes the id INTO the record only because its panes compose a list, while a store keeps
// one value per address and the address already says whose it is. `DisplayEntry` is D-23's list and no more — `documentId`,
// and, where the operator has one, a `caret` and a `view`:
//   · `documentId` is a STAMP and not a decision (`ASM-B1-2`): the tab's TARGET stays where it already is
//     (`OperatorSettings.tabs`, `TabEntry.target`), and the entry's stamp only IDENTIFIES the document the tab was showing —
//     the restore rule a later unit fixes is *"the tab's target decides which document is shown; the entry's `documentId` only
//     identifies it"*, so an entry whose stamp is not the tab's current target is DROPPED and not restored. It is spelled ONCE,
//     at the entry level, which is the whole reason it is not `caret.ragId`: the fork's own caret vocabulary carries a subject,
//     and a caret with no subject is unrestorable, so the stamp is the entry-level spelling of that subject.
//   · `caret` is the fork's own caret vocabulary (`CaretState`, `src/renderer/edit-controller.ts:88-89`; `RichCaretEdge`,
//     `:70-81`) MINUS its `ragId` — which the stamp above carries once — and `view` is the scroll position and the visible
//     section, whose CARRIER this unit authors and whose capture is a later unit's (measured: neither `scrollTop` nor
//     `visibleSection` exists anywhere under `src/**`).
//
// **NO DOCUMENT CONTENT, EVER** (D-23): no member of this family is a body, a title, a markdown, a node or a `content`/`text`/
// `html` key. The parse below refuses a member whose DOMAIN is violated; a member that carries document CONTENT would be the
// second authority D-23 refuses outright and is a review finding wherever it lands.
//
// **THE ONE PARSE, AND THERE IS EXACTLY ONE** (§2, `paneOf`'s own rule): `displayEntryIn(held)` is the judgement and
// `displayEntryAdmits(held)` is the same judgement as a predicate — the READ, the RECORD's write route and the CONSTRAINT all
// call it, so the three cannot disagree about what the family states. It is a RECORD and never a bare `null`, because a
// `null` cannot carry the family's sentence and this family must: `{ok: true, entry}` or `{ok: false, reason, message}`.
//
// **REFUSE THE MEMBER, NEVER COERCE IT.** Every arm below is refused rather than repaired, rounded, re-built or dropped, and the
// ADMITTED answer is the value that was handed in — not a copy, not a normalized record — so "nothing was coerced" is readable
// member for member: a `path` rebuilt from a string, an `offset` rounded to an integer, or a `focused` turned into `1` would each
// be a different value here. **AN ABSENT MEMBER IS LAWFUL AND MEANS SOMETHING**: absent `caret` is no caret saved and absent
// `view` is no scroll saved, and a parse that refused them would make every fresh tab unwritable.
//
// **TWO REASON TOKENS, AND THEY ARE TWO DOMAINS** (`D-105`'s own split, and the contract's §2):
//   · `malformed-display` — a PAYLOAD's shape: a value that is no plain record at all (the entry's own outer shape; the record's
//     route adds the tab-id arm, because an id is the ROUTE's and the parse is handed no id);
//   · `malformed-display-entry` — a MEMBER's fault, which is the caller's at the route: a member NAME this family does not state, a
//     member's domain, a path with a hole in it, or a value outside the crossing's own boundary.
// Each refusal is answered BEFORE ANY STORE VERB, and there is **no third token**: the CONSTRAINT's arm answers with a SENTENCE and
// no token at all, because the package's constraint union is closed (`true` · `{message, repair}` · `{message, repair?: never}`) and
// a token minted there would be a word with no field to carry it. **THE WORD IS `reason` AND IT IS THE CORPUS'S** (the foundation's
// `ViewRecordAnswer.refused.reason`): one fact, one spelling — a refusal carries `reason` and never a second name for it.
//
// **THE MEMBER NAMES ARE AN ALLOWLIST AND THAT IS `D-23`'s HARD LINE MADE MECHANICAL.** The parse used to judge the three members it
// knew and ADMIT every other member, so `content`, `text`, `html`, `title`, `markdown`, `body`, a `ragId`, a `tabId` and a whole
// nested document object all parsed `{ok: true}` and were PERSISTED (`B1-ADV-01`, measured through `commitTab` and at a
// three-segment member node). An undeclared name is now REFUSED at every level with `malformed-display-entry` and a sentence that
// NAMES document content as the refused fault, which is the one thing a caller must be told: this family states a display POSITION
// and never the document it points at.
//
// **AND THE VALUES ARE JUDGED AT THE CROSSING'S OWN BOUNDARY** (`B1-ADV-02`). `path.every(nonNegativeInteger)` SKIPPED holes and a
// stated member's extra members were unjudged, so a sparse `path`, a `BigInt`, a function, a `Symbol`, a cycle, `NaN`, a `Map`, a
// lone surrogate and an `undefined` all reached the store and THREW its own `ValueRefusedAtBoundary` at the caller instead of
// answering this module's record. The path walk is by INDEX now (a hole is not an integer) and `isBoundary` — ported from the
// foundation's own predicate (`../Provident-Electron/src/main/view-record/index.ts:527-533`) — judges the WHOLE entry before any
// store verb. **THE PORT IS EXTENDED WHERE THE INSTALLED RELEASE MEASURES MORE THAN THE FOUNDATION'S PREDICATE DOES**: it refuses a
// CYCLE (the foundation's would recurse until the stack died), a record whose prototype is not `Object.prototype`/`null` (a `Map`
// is `plain` by the foundation's test and would have crossed), and a string carrying a LONE SURROGATE (a string is a string to that
// predicate, and the crossing refuses an ill-formed one).
//
// **AN OWN-`undefined` OPTIONAL MEMBER IS THE LAWFUL ABSENCE** (`B1-ADV-16`, INFO): `{documentId, caret: undefined}` is what an
// ordinary optional spread produces, and a writer's spread must not be a refusal. It means the same as the absent member — so it is
// ADMITTED, and the admitted entry spells the absence by NOT CARRYING the member, because the crossing refuses `undefined` outright
// and this parse cannot hand one on. That single normalisation is the one place the admitted answer is not the value handed in
// object for object; where no optional member is own-`undefined`, the answer IS the caller's own value.


/** One edge of a rich caret: the path into the document's own structure, and the offset within it. `path` is an ARRAY (a
 *  non-array is refused rather than re-built from a string) of non-negative integers, and `offset` is a non-negative integer (a
 *  non-integer is refused rather than rounded). */
export interface DisplayCaretEdge {
  readonly path: readonly number[]
  readonly offset: number
}

/** The caret the family states: ONE kind, two edges and whether the focus is in the document. */
export interface DisplayCaret {
  readonly kind: 'rich'
  readonly anchor: DisplayCaretEdge
  readonly focus: DisplayCaretEdge
  readonly focused: boolean
}

/** The view the family states: the scroll position and the visible section. */
export interface DisplayView {
  readonly offset: number
  readonly section: string
}

/** ONE TAB'S DISPLAY STATE — the value written at `['display', <tabId>]`, and D-23's list and no more (see the header). */
export interface DisplayEntry {
  readonly documentId: string
  readonly caret?: DisplayCaret
  readonly view?: DisplayView
}

/** **THE FAMILY'S WHOLE VALUE: ONE MEMBER PER TAB ID, THE KEY BEING THE ADDRESS SEGMENT.** One whole value at the root rather
 *  than one root per tab (`ASM-B1-1`): the store keeps one value per address, and a root per tab would make the declaration set
 *  grow with the tab count, which no projection could enumerate. */
export type DisplayFamilyValue = Readonly<Record<string, DisplayEntry>>

/** **A REFUSAL'S `reason`, AND THE FAMILY-LEVEL ONE**: the value handed in is no plain record — a PAYLOAD's shape. Exported as a
 *  string so a row reads the token off the module instead of spelling it (`D-43`). */
export const DISPLAY_MALFORMED_REASON = 'malformed-display'

/** **A REFUSAL'S `reason` FOR A MEMBER'S FAULT** — the caller's at the route: the entry is a record, but a member NAME is not one
 *  this family states, or a member's value is outside its domain or outside the crossing's boundary. */
export const DISPLAY_ENTRY_MALFORMED_REASON = 'malformed-display-entry'

/** The family's sentence for a value that is no plain record — the `malformed-display` arm's words. */
export const DISPLAY_SHAPE_MESSAGE =
  'a display family value must be a plain record, and this one is not: the family states one entry per tab id and nothing else'

/** The family's ONE sentence for a member whose VALUE is outside its domain — every domain arm answers these words and no others,
 *  because "one parse, one sentence" is the property the family's own row measures. */
export const DISPLAY_ENTRY_MESSAGE =
  'a display entry states a non-empty `documentId` and, where stated, a `rich` caret with two integer-path edges and a view; ' +
  'this member is outside that domain and is refused rather than coerced'

/** **THE ALLOWLIST'S SENTENCE, AND IT NAMES THE FAULT** (`B1-ADV-01`, `D-23`): an undeclared member name is refused with this
 *  sentence rather than the domain one, because the fault is not a value that failed a test — it is a member this family does not
 *  state, and the likeliest such member is the DOCUMENT ITSELF. */
export const DISPLAY_UNDECLARED_MEMBER_MESSAGE =
  'a display entry states `documentId`, `caret` and `view` and admits no other member: document content — a title, a body, a ' +
  'markdown, a text, an html, a ragId, a tabId or a nested document — is refused rather than stored or dropped, because this ' +
  'family carries a display position and never the document it points at'

/** **THE CROSSING'S SENTENCE** (`B1-ADV-02`): the value is outside the domain the store's boundary carries — `undefined`, a
 *  `BigInt`, a function, a `Symbol`, a `NaN`, a `Map`, a cycle, an ill-formed string, or an array with a hole in it. Refused HERE
 *  so it is this module's record the caller reads, and never the store's thrown `ValueRefusedAtBoundary` after a store verb. */
export const DISPLAY_BOUNDARY_MESSAGE =
  'the store crosses strings, booleans, finite numbers, plain records and arrays, and this value is outside that domain (or is ' +
  'an array with a hole in it, or a string that is not well formed): refused before any store act rather than thrown at the crossing'

/** The CONSTRAINT's sentence: the family stands and names an entry it cannot state. `display-family.ts`'s write-instant arm
 *  spends it and repairs nothing. **IT IS A SENTENCE AND NOT A TOKEN**: the package's constraint answer is a closed union of three
 *  arms, so a `reason` member here would be a word with no field to carry it.
 */
export const DISPLAY_UNUSABLE_MESSAGE =
  'the display family stands and names an entry it cannot state: this member is outside the domain the family admits, so the ' +
  'write is refused and nothing is repaired'


/** **ONE REFUSAL OR ONE ADMITTED ENTRY — the parse's whole answer, and never a bare `null`.** The refusal carries the family's
 *  `reason` and its sentence; the admitted arm carries the value that was HANDED IN, unchanged. */
export type DisplayAdmission =
  | { readonly ok: true; readonly entry: DisplayEntry }
  | { readonly ok: false; readonly reason: string; readonly message: string }

/** **A PLAIN RECORD — NOT AN ARRAY, NOT `null`, NOT A PRIMITIVE.** The one predicate this family's parse and its whole-family
 *  judgement share, spelled once so no caller invents a second reading of "a record". */
export const isPlainRecord = (held: unknown): held is Record<string, unknown> =>
  held !== null && typeof held === 'object' && !Array.isArray(held)

/** **A NON-NEGATIVE INTEGER, AND NOTHING ELSE IS ONE**: `1.5`, `-1`, `'2'`, `null`, `NaN` and `Infinity` are all refused — a
 *  value this family stores is a place in a document, and a place that had to be rounded is a place the caller did not state. */
const nonNegativeInteger = (held: unknown): held is number =>
  typeof held === 'number' && Number.isInteger(held) && held >= 0

/** **THE MEMBER NAMES THIS FAMILY STATES, AT EVERY LEVEL AND IN ONE PLACE.** The entry's three are the contract's; the nested
 *  fours are the shapes those three carry. **A NAME OUTSIDE ITS OWN LIST IS REFUSED, NOT IGNORED** — that is the whole of
 *  `D-23`'s line being mechanical, and it is also what stops the READ from ever having to drop a member: a member the parse
 *  refuses at the route can never reach the store, so the only way one is ever dropped is an outside writer's, which the read
 *  answers with the declared absence (`record.ts`). */
const DISPLAY_ENTRY_MEMBERS: readonly string[] = ['documentId', 'caret', 'view']
const DISPLAY_CARET_MEMBERS: readonly string[] = ['kind', 'anchor', 'focus', 'focused']
const DISPLAY_EDGE_MEMBERS: readonly string[] = ['path', 'offset']
const DISPLAY_VIEW_MEMBERS: readonly string[] = ['offset', 'section']

/** Every own member name is one the list states — the one allowlist test, spelled once and used at every level. */
const membersWithin = (held: Record<string, unknown>, allowed: readonly string[]): boolean =>
  Object.keys(held).every((member) => allowed.includes(member))

/** **THE PROTOTYPE'S OWN KEY NAMES — AND A TAB ID THAT IS ONE OF THEM IS A PAYLOAD'S SHAPE FAULT** (`B1-ADV-05(a)`, measured: such
 *  an id committed, vanished from `read()` and became the READING'S PROTOTYPE while `readTab` still answered). The family keys one
 *  member per tab id, so a key that reaches the object model instead of the member space is refused wherever a key is made: the
 *  record's shape arm, the family's whole-value arm, and the read. */
const PROTOTYPE_KEYS: readonly string[] = ['__proto__', 'constructor', 'prototype']

/** Is this name a key the object model owns rather than one the family does? */
export const isPrototypeKey = (name: string): boolean => PROTOTYPE_KEYS.includes(name)

/** **A STRING THE CROSSING CAN CARRY IS A WELL-FORMED ONE.** A lone surrogate is a `string` to every type test in the foundation's
 *  predicate and to `typeof`, and the crossing refuses it — measured; so the check is a code-unit walk and needs no library. */
const wellFormed = (held: string): boolean => {
  for (let index = 0; index < held.length; index += 1) {
    const unit = held.charCodeAt(index)
    if (unit >= 0xd800 && unit <= 0xdbff) {
      const following = held.charCodeAt(index + 1)
      if (!(following >= 0xdc00 && following <= 0xdfff)) return false
      index += 1
    } else if (unit >= 0xdc00 && unit <= 0xdfff) {
      return false
    }
  }
  return true
}

/** **THE STORE'S BOUNDARY DOMAIN, AS A TOTAL WALK OF ONE VALUE** — ported from the foundation's `isBoundary`
 *  (`view-record/index.ts:527-533`) and EXTENDED where the installed release measures more than it does:
 *   · a CYCLE is refused (the port recursed until the stack died, which is a throw of a different colour in the same place);
 *   · a record whose prototype is neither `Object.prototype` nor `null` is refused (the foundation's `plain` admits a `Map`, a
 *     `Set` and a `Date`, and the crossing does not);
 *   · an ILL-FORMED string is refused (`wellFormed` above);
 *   · an array with a HOLE in it is refused — `every` skips holes, which is exactly the skip the sparse-`path` fault rode in on.
 *  `seen` carries the objects on the walk's own path, so a value mentioned twice is fine and a value containing itself is not. */
const isBoundary = (value: unknown, seen: readonly object[] = []): boolean => {
  if (typeof value === 'string') return wellFormed(value)
  if (typeof value === 'boolean') return true
  if (typeof value === 'number') return Number.isFinite(value)
  if (value === null || value === undefined) return false
  if (typeof value !== 'object') return false
  if (seen.includes(value)) return false
  const path = [...seen, value]
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, String(index))) return false
      if (!isBoundary(value[index], path)) return false
    }
    return true
  }
  const prototype = Object.getPrototypeOf(value)
  if (prototype !== Object.prototype && prototype !== null) return false
  return Object.values(value as Record<string, unknown>).every((member) => isBoundary(member, path))
}

/** **AN OWN-`undefined` OPTIONAL MEMBER IS THE LAWFUL ABSENCE** (`B1-ADV-16`): the ordinary optional spread spells "no caret saved"
 *  that way, and it means exactly what the absent member means. */
const spelledAbsent = (held: Record<string, unknown>, member: string): boolean =>
  Object.hasOwn(held, member) && held[member] === undefined

/** One edge, admitted member by member: `path` an ARRAY of non-negative integers walked BY INDEX — **a HOLE IS NOT AN INTEGER**,
 *  and `.every` skips one, which is the fault `B1-ADV-02` measured — and `offset` a non-negative integer, never rounded. */
const caretEdgeAdmits = (held: unknown): held is DisplayCaretEdge => {
  if (!isPlainRecord(held)) return false
  if (!membersWithin(held, DISPLAY_EDGE_MEMBERS)) return false
  const path = held['path']
  if (!Array.isArray(path)) return false
  for (let index = 0; index < path.length; index += 1) {
    if (!Object.hasOwn(path, String(index))) return false
    if (!nonNegativeInteger(path[index])) return false
  }
  return nonNegativeInteger(held['offset'])
}

/** The `documentId`'s domain, spelled once: a NON-EMPTY STRING, and nothing is coerced into one. */
const documentIdAdmits = (held: unknown): held is string => typeof held === 'string' && held.length > 0

/** One caret: the ONE kind this family states, both edges, and a boolean `focused` — a non-boolean is refused rather than
 *  coerced, because `0`/`''` would make the caret's focus a truthiness question the family never states. Its member NAMES are the
 *  allowlist's, at this level as at every level. */
const caretAdmits = (held: unknown): held is DisplayCaret => {
  if (!isPlainRecord(held)) return false
  if (!membersWithin(held, DISPLAY_CARET_MEMBERS)) return false
  if (held['kind'] !== 'rich') return false
  if (!caretEdgeAdmits(held['anchor']) || !caretEdgeAdmits(held['focus'])) return false
  return typeof held['focused'] === 'boolean'
}

/** One view: an integer `offset` and a string `section`, and no third member. */
const viewAdmits = (held: unknown): held is DisplayView => {
  if (!isPlainRecord(held)) return false
  if (!membersWithin(held, DISPLAY_VIEW_MEMBERS)) return false
  return nonNegativeInteger(held['offset']) && typeof held['section'] === 'string'
}


/**
 * **ONE ENTRY MEMBER, JUDGED AT ITS OWN NODE — the parse's members, one at a time** (§2's arm (3): *"at or below a tab id the
 * landed value is ONE entry and is judged at its own node"*).
 *
 * **IT EXISTS BECAUSE A THIRD SEGMENT IS REACHABLE, WHICH WAS MEASURED AND NOT ASSUMED**: the store's address domain is three
 * segments, so a write at `['display', <tabId>, 'documentId']` LANDS when that tab's entry stands (measured on the installed
 * release) — the pair is an ancestor of it and is asked at that node. **AND IT JUDGES THE NAME AS WELL AS THE VALUE** (`B1-ADV-01`):
 * a member name this family does not state is REFUSED here, because a three-segment write is the one route through which a member
 * off the allowlist could still land under a standing entry — the store would then hold a member the read cannot state, which is
 * `D-105`'s fault arriving one route over. The value is judged by its own domain AND by the crossing's boundary, so the same fault
 * cannot arrive as a thrown `ValueRefusedAtBoundary` either.
 *
 * A MEMBER NODE STATES A VALUE, so unlike the entry the own-`undefined` leniency does not apply here: a three-segment write of
 * `undefined` is a value the crossing refuses, and it is refused here first.
 */
export function displayEntryMemberAdmits(member: string, held: unknown): boolean {
  if (member === 'documentId') return documentIdAdmits(held) && isBoundary(held)
  if (member === 'caret') return caretAdmits(held) && isBoundary(held)
  if (member === 'view') return viewAdmits(held) && isBoundary(held)
  return false
}

/**
 * **THE ONE PARSE OF ONE ENTRY** (§2): every member name judged by the allowlist, every member value refused rather than coerced,
 * both absences lawful, and the admitted answer IS the value handed in — except where an optional member spells its absence with
 * an own `undefined`, which is dropped because the crossing refuses one.
 *
 * The arms, in order, and the ORDER is load-bearing: a value that is no plain record is the FAMILY's reason (a payload's shape,
 * `malformed-display`) and not a member's; then the ALLOWLIST, because an undeclared name is a different fault from an
 * out-of-domain value and is the one `D-23` is about; then `documentId` — required, a non-empty string — and then each member ONLY
 * WHERE STATED, so an absent `caret` and an absent `view` pass without being filled; and last the crossing's own boundary over the
 * WHOLE entry, because a value may be in its member's domain and still be one the store cannot carry.
 */
export function displayEntryIn(held: unknown): DisplayAdmission {
  if (!isPlainRecord(held)) {
    return { ok: false, reason: DISPLAY_MALFORMED_REASON, message: DISPLAY_SHAPE_MESSAGE }
  }
  // ── THE ALLOWLIST, BEFORE ANY MEMBER IS JUDGED: a name this family does not state is refused as a NAME, and the sentence says
  // ── which fault it is — document content is the member this line exists for.
  if (!membersWithin(held, DISPLAY_ENTRY_MEMBERS)) {
    return { ok: false, reason: DISPLAY_ENTRY_MALFORMED_REASON, message: DISPLAY_UNDECLARED_MEMBER_MESSAGE }
  }
  const documentId = held['documentId']
  if (!documentIdAdmits(documentId)) {
    return { ok: false, reason: DISPLAY_ENTRY_MALFORMED_REASON, message: DISPLAY_ENTRY_MESSAGE }
  }
  if (Object.hasOwn(held, 'caret') && !spelledAbsent(held, 'caret') && !caretAdmits(held['caret'])) {
    return { ok: false, reason: DISPLAY_ENTRY_MALFORMED_REASON, message: DISPLAY_ENTRY_MESSAGE }
  }
  if (Object.hasOwn(held, 'view') && !spelledAbsent(held, 'view') && !viewAdmits(held['view'])) {
    return { ok: false, reason: DISPLAY_ENTRY_MALFORMED_REASON, message: DISPLAY_ENTRY_MESSAGE }
  }
  // ── THE ONE NORMALISATION THIS PARSE PERFORMS, AND IT IS SPELLING AN ABSENCE RATHER THAN COERCING A VALUE: an own-`undefined`
  // ── optional member is dropped, because the crossing refuses `undefined` and the member means "absent" anyway.
  let entry: DisplayEntry
  if (spelledAbsent(held, 'caret') || spelledAbsent(held, 'view')) {
    const normalized: Record<string, unknown> = {}
    for (const [member, value] of Object.entries(held)) {
      if (value === undefined && (member === 'caret' || member === 'view')) continue
      normalized[member] = value
    }
    entry = normalized as unknown as DisplayEntry
  } else {
    // THE ADMITTED ANSWER IS THE VALUE HANDED IN: no copy, no normalization, no member added or dropped, so a caller reads its own
    // record back and "never coerced" is a property of the answer rather than a promise.
    entry = held as unknown as DisplayEntry
  }
  // ── AND THE CROSSING'S BOUNDARY, OVER THE WHOLE ENTRY, BEFORE ANY STORE VERB: a value in its member's domain can still be one the
  // ── store cannot carry, and the store answers such a value by THROWING (measured: `ValueRefusedAtBoundary`).
  if (!isBoundary(entry)) {
    return { ok: false, reason: DISPLAY_ENTRY_MALFORMED_REASON, message: DISPLAY_BOUNDARY_MESSAGE }
  }
  return { ok: true, entry }
}


/** The same judgement as a predicate — ONE parse, two spellings of its answer (§2). */
export function displayEntryAdmits(held: unknown): boolean {
  return displayEntryIn(held).ok
}

/**
 * **THE PLACEHOLDER, MINTED AT CREATION: ONE PLAIN RECORD AT THE ROOT, STATING NO TAB** — `{}` (§2).
 *
 * Two reasons, both load-bearing. **A NESTED WRITE DOES NOT CREATE ITS PARENT** (measured: a leaf write over an absent parent
 * answers `AddressNotFound`), so the family must STAND for `['display', <tabId>]` to land at all — the repair therefore performs
 * the thing it keys, by writing this value at the root. **And a MEMBERLESS placeholder is CORRECT here**: no tab has display
 * state at a construction, and the absence of a per-tab member is a DECLARED MEANING rather than a gap — a consumer reads it as
 * *"open at the document's start"* and invents no fallback.
 */
export function displayPlaceholder(): DisplayFamilyValue {
  return {}
}
