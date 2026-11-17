// tests/unit/record-engine/display-admission.test.ts — unit `B-1` `record-engine-seam`'s red-set arm `(b)` at UNIT GRAIN:
// THE ONE PARSE OF THE `display` FAMILY'S VALUE (`src/main/record-engine/display-shape.ts`, §4 site 2).
//
// **IT IS RED ON ARRIVAL AND THAT IS THE RED-FIRST EVIDENCE** (RCA-1): `displayEntryIn`/`displayEntryAdmits`,
// `displayPlaceholder`, the payload types and the family's reasons and sentences are §4 site 2's and do not exist at this
// head, so the import fails and the run reds with it. No line here moves to make the tree compile.
//
// WHAT THIS ROW MEASURES, IN TWO GRAINS AND WHY IT TAKES BOTH. §2 states the admission once — "**REFUSE the member, never
// coerce**" — and says ONE parse serves the read, the record's write route AND the constraint (`paneOf`'s own rule). So:
//   · **GRAIN 1 (the parse itself)** — every refusal of §2's list, driven ONE AT A TIME, asserting `displayEntryAdmits`
//     answers `false`, that `displayEntryIn` answers a refusal CARRYING the family's own `reason` and sentence, that the two
//     lawful absences are ADMITTED, and that the value handed in is unchanged afterwards (no coercion, no partial mutation of
//     the caller's record). The admitted controls are asserted DEEP-EQUAL to what was handed in, which is the sharpest
//     reading of "never coerce": a `path` that comes back as `['0']`, an `offset` rounded to an integer, or a `focused` that
//     comes back `1` would each red here.
//   · **GRAIN 2 (the record's write route over the same values)** — because the parse has NO ADDRESS to carry and §3 says
//     `commitTab` answers "a typed refusal carrying the `reason`, the sentence and the address". This is where the hard rules'
//     two refusal readings are taken: **the standing value is unchanged after the refusal, and the refusal carries the
//     address it refused** — the LEAF `[…DISPLAY_ADDRESS, <tabId>]`, the address `commitTab` would have written. Plus the
//     reading that makes "each answered BEFORE ANY STORE VERB" non-vacuous: a refused act DELIVERS NOTHING.
//
// **THE REASONS AND THE SENTENCES ARE NEVER SPELLED HERE** (`D-43`'s discipline). §2 names three `reason` tokens and
// their sentences as landed exports (§4 site 2), so this row reads them OFF THE MODULE: an exported string is a string the
// module states, and the row asserts (i) that every member refusal carries the SAME `reason` and the SAME sentence — "ONE
// parse, ONE sentence" is the contract's own claim — and (ii) that both are among the module's exported strings. What it
// therefore CANNOT assert is WHICH word stands for which domain: that the entry-domain reason is the one §2 calls
// `malformed-display-entry` is the module's own naming, and no row of this unit pins the spelling. **THE MEMBER'S NAME IS
// NOT SIMILARLY FREE** (§2's one fact, one spelling: the foundation's `ViewRecordAnswer.refused.reason`): every row below
// reads `reason` and none of them accepts a second spelling, so a module answering a differently-named member reds here.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT the placeholder's role at creation or its repair —
// `delivery.test.ts` `(d)` and `display-record.test.ts` `(d)`; NOT the entries or the roots — `declared-entries.test.ts`
// (`FH-1`/`FH-2`); NOT the family object's projections, its deferral or its narrowing — `family-object.test.ts` (`FH-3`);
// NOT the cadence, the write count per event or the delivery's sink order — `delivery.test.ts` `(a)`/`(c)` and
// `display-record.test.ts`'s cadence arms; and NOT which tier the family declares, which is no row of this unit's to state.
// **AND IT DOES NOT ASSERT THAT THE CONSTRAINT'S OWN JUDGE REFUSES A STANDING MEMBER** — §2's arm (3) is a WRITE-instant
// judgement and belongs to the family row's subject rather than to this parse.
//
// LAYER: `[T]`/envelope. Nothing here paints and nothing here is app-green.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import * as displayShape from '../../../src/main/record-engine/display-shape.js'
import {
  displayEntryAdmits,
  displayEntryIn,
  displayPlaceholder,
} from '../../../src/main/record-engine/display-shape.js'
import { createDisplayDelivery } from '../../../src/main/record-engine/delivery.js'
import { createDisplayRecord } from '../../../src/main/record-engine/record.js'
import { DISPLAY_ADDRESS, DISPLAY_TIER, displayConstraintDeclarations } from '../../../src/main/record-engine/display-family.js'
import { createProfileStore } from '../../../src/main/storeroom.js'

/** **ONE ADDRESS AS A COMPARABLE TUPLE — AND NEVER `join('/')`**: `['a/b']` and `['a', 'b']` are two DIFFERENT addresses
 *  sharing one joined spelling, so a joined comparison would call a refusal at the wrong address a match. */
const tupleOf = (address: readonly string[]): string => JSON.stringify([...address])

/** One value's byte spelling, for the "nothing was coerced / the standing value is unchanged" readings. */
const jsonOf = (value: unknown): string => JSON.stringify(value)

// ═══════════════ THE ROW'S OWN FIXTURES — every id, path, offset and sentence below is THIS FILE'S ═══════════════
//
// **THE TAB ID IS THE ROW'S OWN AND IS NEVER A MODULE FIGURE**: §2 fixes that the key is the ADDRESS SEGMENT and never a
// stored `tabId`, so the only place this id appears is the address the refusal must name.
const A_TAB = 'tab-a'
const A_DOCUMENT = 'doc-a'
/** A lawful caret edge: a NON-ARRAY path is refused, so this one is an array of non-negative integers, and the offset is an
 *  integer because a non-integer is refused rather than rounded. */
const A_RICH_EDGE = { path: [0, 3], offset: 7 }
/** A lawful caret: the ONE kind the family states, two edges and the boolean. */
const A_LAWFUL_CARET = { kind: 'rich', anchor: A_RICH_EDGE, focus: A_RICH_EDGE, focused: true }
/** A lawful view: the scroll offset and the visible section. */
const A_LAWFUL_VIEW = { offset: 120, section: 'sec-1' }
/** The fully-populated ADMITTED control. */
const ADMITTED_FULL = { documentId: A_DOCUMENT, caret: A_LAWFUL_CARET, view: A_LAWFUL_VIEW }
/** The TWO LAWFUL ABSENCES §2 states, each meaning something and each ADMITTED: absent `caret` = no caret saved, absent
 *  `view` = no scroll saved. A parse that refused these would make every fresh tab unwritable. */
const ADMITTED_NO_CARET = { documentId: A_DOCUMENT }
const ADMITTED_NO_VIEW = { documentId: A_DOCUMENT, caret: A_LAWFUL_CARET }

/** A caret whose named edge is replaced, so each refusal below varies ONE member of an otherwise lawful entry. */
const caretWith = (overrides: { anchor?: unknown; focus?: unknown; kind?: unknown; focused?: unknown }): unknown => ({
  kind: 'rich',
  anchor: A_RICH_EDGE,
  focus: A_RICH_EDGE,
  focused: true,
  ...overrides,
})
/** A caret with ONE edge replaced by an edge carrying the given members. */
const caretWithAnchor = (edge: unknown): unknown => caretWith({ anchor: edge })

/**
 * **§2's REFUSAL LIST, ARM BY ARM, EACH WITH ONE OR MORE VALUES DRIVEN ONE AT A TIME.** The `id` is the arm's own sentence
 * for the failure message; the `helds` are the values, and a refusal arm may carry several spellings of ONE domain (a
 * non-integer offset is one arm, whether it is `1.5`, `-1` or `'7'`).
 */
interface RefusalArm {
  readonly id: string
  readonly helds: readonly unknown[]
}

const REFUSAL_ARMS: readonly RefusalArm[] = [
  {
    id: 'a `documentId` that is not a non-empty string',
    helds: [{ documentId: 7 }, { documentId: null }, { documentId: '' }, {}],
  },
  {
    id: 'a `caret` that is no plain record',
    helds: [
      { documentId: A_DOCUMENT, caret: 'rich' },
      { documentId: A_DOCUMENT, caret: null },
      { documentId: A_DOCUMENT, caret: [] },
    ],
  },
  {
    id: 'a `caret.kind` outside the one word the family states',
    helds: [
      { documentId: A_DOCUMENT, caret: caretWith({ kind: 'plain' }) },
      { documentId: A_DOCUMENT, caret: { anchor: A_RICH_EDGE, focus: A_RICH_EDGE, focused: true } },
    ],
  },
  {
    id: 'an `anchor` that is no plain record',
    helds: [
      { documentId: A_DOCUMENT, caret: caretWithAnchor([0, 3]) },
      { documentId: A_DOCUMENT, caret: caretWithAnchor('0:3') },
      { documentId: A_DOCUMENT, caret: caretWithAnchor(null) },
    ],
  },
  {
    id: 'a `focus` that is no plain record',
    helds: [
      { documentId: A_DOCUMENT, caret: caretWith({ focus: [0, 3] }) },
      { documentId: A_DOCUMENT, caret: caretWith({ focus: null }) },
    ],
  },
  {
    id: 'a NON-ARRAY caret path — refused, never rebuilt from a string',
    helds: [
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: '0,3', offset: 7 }) },
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: 3, offset: 7 }) },
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: null, offset: 7 }) },
    ],
  },
  {
    id: 'a path member that is not a non-negative integer',
    helds: [
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: [0, 1.5], offset: 7 }) },
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: [0, -1], offset: 7 }) },
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: [0, '3'], offset: 7 }) },
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: [null], offset: 7 }) },
    ],
  },
  {
    id: 'a NON-INTEGER edge offset — refused, never rounded',
    helds: [
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: [0, 3], offset: 1.5 }) },
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: [0, 3], offset: -1 }) },
      { documentId: A_DOCUMENT, caret: caretWithAnchor({ path: [0, 3], offset: '7' }) },
    ],
  },
  {
    id: 'a `focused` that is not a boolean',
    helds: [
      { documentId: A_DOCUMENT, caret: caretWith({ focused: 'true' }) },
      { documentId: A_DOCUMENT, caret: caretWith({ focused: 1 }) },
    ],
  },
  {
    id: 'a `view` that is no plain record',
    helds: [
      { documentId: A_DOCUMENT, view: 'top' },
      { documentId: A_DOCUMENT, view: null },
      { documentId: A_DOCUMENT, view: [] },
    ],
  },
  {
    id: 'a `view.offset` that is not a non-negative integer',
    helds: [
      { documentId: A_DOCUMENT, view: { offset: 1.5, section: 'sec-1' } },
      { documentId: A_DOCUMENT, view: { offset: -3, section: 'sec-1' } },
      { documentId: A_DOCUMENT, view: { offset: '120', section: 'sec-1' } },
    ],
  },
  {
    id: 'a `view.section` that is not a string',
    helds: [
      { documentId: A_DOCUMENT, view: { offset: 120, section: 7 } },
      { documentId: A_DOCUMENT, view: { offset: 120, section: null } },
    ],
  },
]

/** **THE MODULE'S OWN STRINGS, COLLECTED FROM ITS EXPORTS** (`D-43`): the reasons and the sentences are §4 site 2's landed
 *  exports, so this row reads them rather than spelling them. The floor is not decoration — an empty set would make every
 *  "the reason is the module's own" assertion below vacuously false and the row would red for the wrong reason. */
const EXPORTED_STRINGS: ReadonlySet<string> = new Set(
  Object.values(displayShape as Record<string, unknown>).filter((value): value is string => typeof value === 'string'),
)

/** **A REFUSAL READ OFF THE PARSE — THE MEMBER IS `reason`, AND NO SECOND SPELLING IS ACCEPTED.** §2 pins the refusal record
 *  as `{ok: false, reason, message}` ("one fact, one spelling — a refusal record carries `reason` and never a second name for
 *  it"), so this reader asks for `reason` and `message` and for nothing else: an answer carrying a differently-named member
 *  is `null` here, and `null` is what the arms below red on. A THROW is read as well, because a refusal that throws carries
 *  no record at all and must red rather than escape. */
function refusalOf(held: unknown): { readonly reason: string; readonly message: string } | null {
  let answer: unknown
  try {
    answer = displayEntryIn(held)
  } catch (thrown) {
    answer = thrown
  }
  if (answer === null || typeof answer !== 'object') return null
  const carried = answer as { readonly reason?: unknown; readonly message?: unknown }
  if (typeof carried.reason !== 'string' || typeof carried.message !== 'string') return null
  return { reason: carried.reason, message: carried.message }
}

/** **THE ADMITTED ANSWER, UNWRAPPED THE SAME TOLERANT WAY**: §2 does not spell whether the parse answers the entry itself or a
 *  credited `{ ok: true, entry }` arm, so this reader takes either and the deep equality below is applied to the ENTRY. */
function admittedOf(held: unknown): unknown {
  const answer = displayEntryIn(held) as unknown
  if (answer !== null && typeof answer === 'object' && (answer as { readonly ok?: unknown }).ok === true) {
    const carried = answer as { readonly entry?: unknown }
    if ('entry' in carried) return carried.entry
  }
  return answer
}

/** **THE ADDRESS A RECORD REFUSAL CARRIES**, read defensively because it is a refusal and not this row's own value. */
function addressOfAnswer(answer: unknown): readonly string[] | null {
  if (answer === null || typeof answer !== 'object') return null
  const carried = (answer as { readonly address?: unknown }).address
  return Array.isArray(carried) ? carried.map((segment) => String(segment)) : null
}

describe('record-engine · display admission — §2’s one parse: every member refused with the family’s own sentence, nothing coerced, the two absences lawful', () => {
  it('(b·shape) · THE PARSE STATES WHAT THE MODULE EXPORTS — the reason set is non-empty, so “the refusal is the module’s own” is a reading and not a tautology', () => {
    expect(
      EXPORTED_STRINGS.size,
      'the module exports at least one string (§4 site 2: the three `reason` tokens AND their sentences), so the arms below compare against something the module states',
    ).toBeGreaterThan(0)
  })

  REFUSAL_ARMS.forEach((arm) => {
    it(`(b·shape) · REFUSED — ${arm.id}`, () => {
      arm.helds.forEach((held) => {
        // THE VALUE THIS ROW HANDED IN, SPELLED BEFORE THE CALL, so "nothing was coerced" is read against the caller's own
        // record rather than against a copy the parse might have written through.
        const before = jsonOf(held)
        expect(
          displayEntryAdmits(held),
          `\`displayEntryAdmits\` must REFUSE a member whose domain is violated: ${arm.id} — the value is ${jsonOf(held)}`,
        ).toBe(false)
        const refusal = refusalOf(held)
        expect(
          refusal,
          `the refusal must CARRY the \`reason\` member and the family’s sentence (“refused, each with the family’s sentence”, §2; the member is \`reason\`, never a second name for it): ${jsonOf(held)}`,
        ).not.toBeNull()
        if (refusal === null) return // the assertion above is the arm; this is the compiler's arm
        expect(typeof refusal.reason, 'the refusal carries a `reason` the module states').toBe('string')
        expect(
          EXPORTED_STRINGS.has(refusal.reason),
          `the reason must be one the MODULE exports, never a word minted at the refusal site: read \`${refusal.reason}\` off \`(answer).reason\``,
        ).toBe(true)
        expect(
          EXPORTED_STRINGS.has(refusal.message),
          `the sentence must be one the MODULE exports, never a word minted at the refusal site: read \`${refusal.message}\``,
        ).toBe(true)
        expect(refusal.message.length, 'a sentence that stands is a sentence and not an empty span').toBeGreaterThan(0)
        // NOTHING IS COERCED AND NOTHING IS PARTIALLY WRITTEN: the caller's record is byte-identical after the refusal.
        expect(jsonOf(held), `a refused member must leave the value it was handed UNCHANGED — no coercion, no partial write: ${jsonOf(held)}`).toBe(before)
      })
    })
  })

  it('(b·shape) · ONE PARSE, ONE SENTENCE — every member refusal of §2’s list answers the SAME `reason` and the SAME sentence', () => {
    // **THIS IS WHERE "the family's OWN sentence" IS MEASURED RATHER THAN MERELY READ**: a parse that minted a fresh sentence
    // per member would pass every arm above and fail this one, and §2's "ONE parse" is exactly the claim that the family
    // speaks with one voice about its members.
    const reasons = new Set<string>()
    const messages = new Set<string>()
    REFUSAL_ARMS.forEach((arm) => {
      arm.helds.forEach((held) => {
        const refusal = refusalOf(held)
        expect(refusal, `every member refusal carries a \`reason\` and a sentence, or this arm has nothing to compare: ${arm.id}`).not.toBeNull()
        if (refusal === null) return
        reasons.add(refusal.reason)
        messages.add(refusal.message)
      })
    })
    expect([...reasons].length, `ONE \`reason\` for the member domain, never one per member: read ${JSON.stringify([...reasons])}`).toBe(1)
    expect([...messages].length, `ONE sentence for the member domain, never one per member: read ${JSON.stringify([...messages])}`).toBe(1)
  })

  it('(b·shape) · A NON-RECORD HELD IS THE OTHER DOMAIN — an entry that is no plain record is refused by the FAMILY-level reason, which is not the member reason', () => {
    // §2 mints THREE `reason` tokens for three domains: `malformed-display` for "a tab id that is no non-empty string, or no plain
    // record" and the member reason for a member's domain. The parse sees no tab id, so the one arm of the first reason reachable
    // HERE is the non-record value — and the reading is that the two domains are distinguishable, which the row asserts by
    // IDENTITY (the two `reason` values differ) rather than by spelling either word.
    const memberRefusal = refusalOf({ documentId: 7 })
    expect(memberRefusal, 'the member-domain arm answers a `reason`, so there is something to compare the second domain with').not.toBeNull()
    const familyRefusal = refusalOf('not-a-record')
    expect(familyRefusal, 'a value that is no plain record at all is refused with the FAMILY reason (§2: “no plain record”)').not.toBeNull()
    expect(displayEntryAdmits('not-a-record'), 'and `displayEntryAdmits` refuses it as well, so the boolean arm agrees').toBe(false)
    expect(
      familyRefusal?.reason,
      'the family-level domain is a DIFFERENT `reason` from the member-level one: folding them into one word would lose the distinction §2 states',
    ).not.toBe(memberRefusal?.reason)
  })

  it('(b·shape) · THE TWO LAWFUL ABSENCES ARE ADMITTED — absent `caret` means no caret saved, absent `view` means no scroll saved', () => {
    // §2: "An ABSENT member is lawful and means something". A parse that refused these would make every fresh tab unwritable,
    // and the two are asserted SEPARATELY because they are two meanings and not one leniency.
    expect(displayEntryAdmits(ADMITTED_NO_CARET), 'an entry with no `caret` is LAWFUL: no caret has been saved for that tab').toBe(true)
    expect(displayEntryAdmits(ADMITTED_NO_VIEW), 'an entry with a `caret` and no `view` is LAWFUL: no scroll has been saved for that tab').toBe(true)
    expect(displayEntryAdmits(ADMITTED_FULL), 'and the fully-populated entry is lawful, so the three arms are two absences and one presence').toBe(true)
  })

  it('(b·shape) · THE ADMITTED ENTRY COMES BACK UNCHANGED — the same path, the same integer offsets, the same boolean, and no member added', () => {
    // **THE SHARPEST READING OF "NEVER COERCE"**: the entry the parse answers is DEEP-EQUAL to the entry it was handed, so a
    // path rebuilt from a string (`['0']`), an offset rounded, or a `focused` turned into `1` reds here even though each would
    // have been admitted by a laxer parse.
    const admitted = admittedOf(ADMITTED_FULL)
    expect(jsonOf(admitted), 'the admitted entry is the value handed in, member for member — no coercion and no invention').toBe(jsonOf(ADMITTED_FULL))
    const caret = (admitted as { caret?: { anchor?: { path?: unknown } } }).caret
    expect(Array.isArray(caret?.anchor?.path), 'the path is still an ARRAY of segments, which is the member a non-array path refusal protects').toBe(true)
    expect(jsonOf(admittedOf(ADMITTED_NO_CARET)), 'and an entry with no `caret` comes back with no `caret` — the absence is preserved and not filled').toBe(
      jsonOf(ADMITTED_NO_CARET),
    )
  })

  it('(b·shape) · THE PLACEHOLDER IS THE EMPTY RECORD — ONE plain record at the root, stating no tab (§2)', () => {
    // §2: `displayPlaceholder()` = `{}`, and the emptiness is LOAD-BEARING rather than incidental: no tab has display state at a
    // construction, so the absence of a per-tab member is a declared meaning and never a gap to fill with a fallback.
    const placeholder = displayPlaceholder()
    expect(placeholder, 'the placeholder is the empty plain record, compared as the record it is').toEqual({})
    expect(Array.isArray(placeholder), 'and it is a RECORD and not an array — the family root holds one value and that value is a record').toBe(false)
    expect(Object.keys(placeholder as object).length, 'it states NO tab: a member here would be a tab the creation invented').toBe(0)
    // AND THE PLACEHOLDER IS NOT THE PARSE'S ADMITTED ENTRY: it carries no `documentId`, so it is a FAMILY value and not an
    // entry — the distinction the parse's `documentId` requirement draws.
    expect(displayEntryAdmits(placeholder), 'the placeholder is not an entry, and the entry parse refuses it').toBe(false)
  })
})

// ═══════════════ GRAIN 2 — THE RECORD'S WRITE ROUTE OVER THE SAME VALUES ═══════════════
//
// **WHY THIS GRAIN EXISTS AT ALL, AND WHY IT IS IN THIS FILE**: §3 fixes the record's refusal as carrying "`reason`, `message`,
// `address`", and the parse has no address to carry — so the hard rule that a refusal row asserts "the
// STANDING VALUE is unchanged after the refusal AND that the refusal carries the address it refused" can only be taken here.
// The parse is the SAME parse (§2: one parse for the read, the write route and the constraint), so the arms are the same
// values and the reasons must be the same reasons: a record that minted its own sentence would red on identity.
let tempDir = ''
let filePath = ''
let store: ReturnType<typeof createProfileStore>
let record: ReturnType<typeof createDisplayRecord>
const delivered: (readonly string[])[] = []

beforeAll(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'record-engine-admission-'))
  filePath = join(tempDir, 'profile.store')
  // THE DELIVERY IS THE CONSTRUCTION'S OWN LIST (§3): the entries are adopted at ONE construction and the sink records, so
  // "a refused act delivers NOTHING" is measured rather than assumed.
  const delivery = createDisplayDelivery((address) => {
    delivered.push([...address])
  })
  let holder: ReturnType<typeof createProfileStore> | null = null
  store = createProfileStore({
    filePath,
    listeners: [...delivery.entries],
    constraints: [...displayConstraintDeclarations(() => holder)] as never,
  })
  holder = store
  record = createDisplayRecord({ store, delivery })
  // THE FAMILY IS SEEDED BY HAND AND NOT BY THE REPAIR, deliberately: this row's subject is the REFUSAL, and a row that leaned
  // on the creation repair would red for the (d) row's fault. The tier is the family's own exported constant.
  store.write([...DISPLAY_ADDRESS], DISPLAY_TIER, displayPlaceholder())
  delivered.length = 0
})

afterAll(() => {
  if (tempDir !== '') rmSync(tempDir, { recursive: true, force: true })
})

describe('record-engine · display admission at the RECORD’s grain — the refusal carries the address it refused, the standing value is untouched and nothing is delivered', () => {
  it('(b·record) · THE STANDING FAMILY STANDS BEFORE ANY REFUSAL — otherwise “unchanged” has no subject', () => {
    expect(filePath.length, 'the construction supplied a real file path, so the family’s own tier can be written').toBeGreaterThan(0)
    expect(
      store.read([...DISPLAY_ADDRESS]),
      'the seeded placeholder stands at the family root, member for member: this is the value every refusal below must leave untouched',
    ).toEqual(displayPlaceholder())
  })

  it('(b·record) · EVERY MEMBER REFUSAL AT THE WRITE ROUTE — false, the family’s `reason` and sentence, the LEAF address, the standing value unchanged, and NO delivery', () => {
    const memberRefusal = refusalOf({ documentId: 7 })
    expect(memberRefusal, 'the parse’s member `reason` is the identity the record must answer with, so it is read first').not.toBeNull()
    const expectedAddress = [...DISPLAY_ADDRESS, A_TAB]
    REFUSAL_ARMS.forEach((arm) => {
      arm.helds.forEach((held) => {
        const standingBefore = jsonOf(store.read([...DISPLAY_ADDRESS]))
        const deliveriesBefore = delivered.length
        const heldBefore = jsonOf(held)
        const answer = record.commitTab(A_TAB, held) as unknown
        expect(answer, 'the write route ANSWERS a refusal and never throws for a member domain (§3)').not.toBeNull()
        expect((answer as { readonly ok?: unknown }).ok, `a refused member is \`ok: false\`, never a credited write: ${arm.id}`).toBe(false)
        expect(
          (answer as { readonly reason?: unknown }).reason,
          `the record answers the FAMILY’s own \`reason\`, the same one the parse answers: ${arm.id}`,
        ).toBe(memberRefusal?.reason)
        expect(
          typeof (answer as { readonly message?: unknown }).message === 'string',
          `and it carries the family’s sentence (§3: \`{ok: false, reason, message, address}\`): ${arm.id}`,
        ).toBe(true)
        expect(
          (answer as { readonly message?: unknown }).message,
          `the sentence is the parse’s own and not a second spelling minted at the write route: ${arm.id}`,
        ).toBe(memberRefusal?.message)
        // **THE ADDRESS IT REFUSED IS THE ADDRESS IT WOULD HAVE WRITTEN** — the LEAF (§2: the entry lands at `['display', <tabId>]`),
        // compared as a TUPLE so a segment carrying a separator cannot alias the root.
        expect(
          addressOfAnswer(answer) === null ? null : tupleOf(addressOfAnswer(answer) as readonly string[]),
          `the refusal carries the address it refused: the LEAF \`${tupleOf(expectedAddress)}\`, never the family root`,
        ).toBe(tupleOf(expectedAddress))
        // THE STANDING VALUE IS BYTE-IDENTICAL: no coercion, no partial write, no member dropped.
        expect(jsonOf(store.read([...DISPLAY_ADDRESS])), `a refused member leaves the standing family EXACTLY as it stood: ${arm.id}`).toBe(
          standingBefore,
        )
        // AND NOTHING WAS DELIVERED: a delivery is a write's consequence, so a refusal that delivered would have reached a store
        // verb — which is §2's "each answered BEFORE ANY STORE VERB" made measurable.
        expect(delivered.length, `a refusal produces NO delivery, so no store verb was reached: ${arm.id}`).toBe(deliveriesBefore)
        // AND THE CALLER'S OWN VALUE IS UNTOUCHED BY THE ROUTE AS BY THE PARSE.
        expect(jsonOf(held), `the route must not mutate the entry it was handed: ${arm.id}`).toBe(heldBefore)
      })
    })
  })
})
