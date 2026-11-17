// tests/integration/record-engine/entry-domain.test.ts — the fix round's rows for the entry's TWO DOMAINS: which MEMBER NAMES
// the family admits (`D-23`'s hard line) and which VALUES may cross the store's boundary at all.
//
// **FINDINGS THIS FILE CLOSES, EACH WITH ITS MEASUREMENT**:
//   · `B1-ADV-01` (MATERIAL) — **CONTENT WAS ADMITTED.** The parse judged only `documentId`/`caret`/`view` and ADMITTED every
//     other member, so a whole document — `content`, `text`, `html`, `title`, `markdown`, `body`, a `ragId`, a `tabId`, a nested
//     document object — parsed `{ok: true}`, was written and was PERSISTED. D-23's line is *no document content, ever*: a member
//     is now judged by an ALLOWLIST, refused with the member token and a sentence that NAMES document content as the fault, and
//     the deeper-node arm (`displayEntryMemberAdmits`) refuses an undeclared member NAME as well — a three-segment write is where
//     a member off the list could otherwise still land under a standing entry.
//   · `B1-ADV-02` (MATERIAL) — **PARSE-ADMITTED VALUES THREW AT THE CROSSING.** `path.every(nonNegativeInteger)` SKIPS holes and
//     a stated member's extra members were unjudged, so a sparse `path`, a `BigInt`, a function, a `Symbol`, a cycle, `NaN`, a
//     `Map`, a lone surrogate or an `undefined` reached the store and threw its own `ValueRefusedAtBoundary` instead of answering
//     this module's refusal record. The parse now walks `path` by INDEX (a hole is not an integer) and applies the foundation's
//     boundary domain (`../Provident-Electron/src/main/view-record/index.ts:527-533` `isBoundary`, ported and EXTENDED where the
//     installed release measures more than it does) to the WHOLE entry before any store verb.
//   · `B1-ADV-16` (INFO) — **AN OWN-`undefined` MEMBER WAS REFUSED.** `{documentId, caret: undefined}` is the ordinary optional
//     spread's result, and a writer's spread must not be a refusal: own-`undefined` is the LAWFUL ABSENT member here, and the
//     admitted entry spells that absence by not carrying the member (the crossing refuses `undefined` outright, so the parse
//     cannot hand one on).
//
// **THREE GRAINS, BECAUSE THE FAULT WAS MEASURED AT THREE**: `(entry·…)` the parse itself; `(entry·commit)` the record's write
// route over a COUNTING facade and then over a REAL crossing (a facade is what makes "zero store verbs" a count rather than a
// claim about the file), and `(entry·deep)` a three-segment write, which is the arm `F-R2` measured as REACHABLE. Each refusal is
// also read for the profile's BYTES, because a write that persisted would move the file even where it left the value alone.
//
// **AND THE ID'S OWN DOMAIN IS HERE** (`B1-ADV-05(a)`): a caller-controlled tab id that collides with a prototype key
// (`__proto__`, `constructor`, `prototype`) used to commit, VANISH from `read()` and become the READING'S PROTOTYPE while
// `readTab` still answered. The family keys one member per tab id, so an id that is a prototype key is a payload's shape fault and
// the SHAPE ARM refuses it — the row asserts the refusal, the reader's prototype and the bytes.
//
// WHAT THESE ROWS MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT the family object's projections, its deferral or its
// tag (`family-and-fanout.test.ts`); NOT the constraint's root arm or its repair (`display-record.test.ts` `(d)`,
// `family-constraint.test.ts`); NOT the client (`client-holding.test.ts`); NOT the cadence, the delivered address or a subscriber's
// arity (`delivery.test.ts`); and NOT the tier word, the root count or any id — every figure below is read off the module or is
// this file's own fixture.
//
// LAYER: `[T]`/envelope. A real store is constructed on a `mkdtempSync` path under `os.tmpdir()` and removed in `afterAll`;
// nothing here paints and nothing here is app-green.
import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  DISPLAY_ENTRY_MALFORMED_REASON,
  DISPLAY_MALFORMED_REASON,
  displayEntryAdmits,
  displayEntryIn,
  displayPlaceholder,
} from '../../../src/main/record-engine/display-shape.js'
import { createDisplayDelivery } from '../../../src/main/record-engine/delivery.js'
import { createDisplayRecord } from '../../../src/main/record-engine/record.js'
import {
  DISPLAY_ADDRESS,
  DISPLAY_TIER,
  displayConstraintDeclarations,
} from '../../../src/main/record-engine/display-family.js'
import { createProfileStore } from '../../../src/main/storeroom.js'

/** **ONE ADDRESS AS A COMPARABLE TUPLE — AND NEVER `join('/')`**: `['a/b']` and `['a', 'b']` are two DIFFERENT addresses sharing
 *  one joined spelling. */
const tupleOf = (address: readonly string[]): string => JSON.stringify([...address])

/** One value's spelling, for the readings that compare two values of the SAME kind (never a read-back against a fixture literal:
 *  the store CANONICALISES member order — see `docs/L2/record-engine/interface.md` §6 — so a read-back is compared with
 *  `toEqual`, member for member, and never as a string). **IT IS TOTAL ON PURPOSE**: three of the arms below are values
 *  `JSON.stringify` REFUSES (a cycle, a `BigInt`, a function), and a failure message that threw would hide the reading it is
 *  reporting. */
const jsonOf = (value: unknown): string => {
  try {
    return String(JSON.stringify(value))
  } catch {
    return '[a value JSON.stringify refuses: cyclic, or carrying a BigInt]'
  }
}

/** The tab id and the entry bodies below: ALL of them are this file's own fixtures. §2 fixes the key to be the ADDRESS SEGMENT
 *  and never a stored `tabId`. */
const A_TAB = 'tab-a'
const A_DOCUMENT = 'doc-a'
const A_RICH_EDGE = { path: [0, 3], offset: 7 }
const A_LAWFUL_CARET = { kind: 'rich', anchor: A_RICH_EDGE, focus: A_RICH_EDGE, focused: true }
const A_LAWFUL_VIEW = { offset: 120, section: 'sec-1' }
/** **THE POSITIVE CONTROL**: the three members the family states, in one entry — asserted to pass at the parse, through
 *  `commitTab` AND at a three-segment write, so none of the refusals below can be satisfied by a parse that refuses
 *  everything. */
const A_WHOLE_ENTRY = { documentId: A_DOCUMENT, caret: A_LAWFUL_CARET, view: A_LAWFUL_VIEW }

/** A caret with ONE edge replaced, so a refusal arm varies exactly one member of an otherwise lawful entry. */
const caretWithEdge = (edge: unknown): unknown => ({ kind: 'rich', anchor: edge, focus: A_RICH_EDGE, focused: true })

/** Every temp directory this file opened, so `afterAll` removes exactly what it made. */
const TEMP_DIRS: string[] = []

afterAll(() => {
  TEMP_DIRS.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

/** **ONE REAL CROSSING, BUILT AS §3 DESCRIBES IT**: the delivery before the store, its entries adopted at the one construction,
 *  the family's declarations registered there, and the holder bound AFTER the construction answers (the boot's own order). The
 *  sink records the addresses it was handed, so "a refusal delivers NOTHING" is a reading. */
interface Crossing {
  readonly store: ReturnType<typeof createProfileStore>
  readonly record: ReturnType<typeof createDisplayRecord>
  readonly filePath: string
  readonly sinkAddresses: (readonly string[])[]
}

function buildCrossing(): Crossing {
  const dir = mkdtempSync(join(tmpdir(), 'record-engine-entry-domain-'))
  TEMP_DIRS.push(dir)
  const filePath = join(dir, 'profile.store')
  const sinkAddresses: (readonly string[])[] = []
  const delivery = createDisplayDelivery((...args: unknown[]) => {
    const first = args[0]
    sinkAddresses.push(Array.isArray(first) ? first.map((segment) => String(segment)) : [])
  })
  let holder: ReturnType<typeof createProfileStore> | null = null
  const store = createProfileStore({
    filePath,
    listeners: [...delivery.entries],
    constraints: [...displayConstraintDeclarations(() => holder)] as never,
  })
  holder = store
  const record = createDisplayRecord({ store, delivery })
  return { store, record, filePath, sinkAddresses }
}

/** **A COUNTING FACADE OVER THE CALLER'S INSTANCE.** "Answered BEFORE ANY STORE VERB" is a COUNT, not an adjective: the facade
 *  wraps the two verbs the record can reach and the rows assert both counters are zero. It delegates to the REAL instance, so a
 *  path that did reach a verb still behaves exactly as it would have. */
interface VerbCounter {
  readonly store: ReturnType<typeof createProfileStore>
  readonly reads: () => number
  readonly writes: () => number
}

function countingStore(inner: ReturnType<typeof createProfileStore>): VerbCounter {
  let reads = 0
  let writes = 0
  const facade = {
    read: (...args: unknown[]): unknown => {
      reads += 1
      return (inner.read as unknown as (...rest: unknown[]) => unknown).apply(inner, args)
    },
    write: (...args: unknown[]): unknown => {
      writes += 1
      return (inner.write as unknown as (...rest: unknown[]) => unknown).apply(inner, args)
    },
  }
  return { store: facade as unknown as ReturnType<typeof createProfileStore>, reads: () => reads, writes: () => writes }
}

/** **THE PARSE'S OWN ANSWER, READ SO A THROW IS A READING AND NOT A CRASH**: a refusal is `{ok: false, reason, message}`; a
 *  THROW (a `ValueRefusedAtBoundary` escaping to the caller) is `record: null` with its words in `threw`, which is what makes the
 *  difference between "the module refuses" and "the store threw" visible in the failure message. */
interface ParseReading {
  readonly record: { readonly reason: string; readonly message: string } | null
  readonly threw: string | null
}

function answerOf(held: unknown): ParseReading {
  try {
    const answer = displayEntryIn(held) as unknown as { readonly ok?: unknown; readonly reason?: unknown; readonly message?: unknown }
    if (
      answer !== null &&
      typeof answer === 'object' &&
      answer.ok === false &&
      typeof answer.reason === 'string' &&
      typeof answer.message === 'string'
    ) {
      return { record: { reason: answer.reason, message: answer.message }, threw: null }
    }
    return { record: null, threw: null }
  } catch (thrown) {
    return { record: null, threw: thrown instanceof Error ? thrown.message : String(thrown) }
  }
}

/** **THE SMUGGLED WORDS — D-23's hard line, one member name at a time.** Every name here is a word a document's own content is
 *  spelled with in this fork (`content`/`text`/`html`/`markdown`/`body`/`title`), a member D-23 names and refuses (`ragId`), or a
 *  second authority for a fact the family already carries (`tabId` — the tab IS the address). `document` carries a whole nested
 *  document, which is the shape the line is really about. */
const SMUGGLED_MEMBERS: readonly { readonly member: string; readonly held: unknown }[] = [
  { member: 'content', held: '<p>the whole document</p>' },
  { member: 'text', held: 'the whole document, as text' },
  { member: 'html', held: '<article>the whole document</article>' },
  { member: 'title', held: 'A document title' },
  { member: 'markdown', held: '# the whole document' },
  { member: 'body', held: 'the whole document, as a body' },
  { member: 'ragId', held: 'rag-a' },
  { member: 'tabId', held: A_TAB },
  { member: 'document', held: { documentId: 'doc-b', content: '<p>a nested document</p>' } },
]

/** **THE BOUNDARY-HOSTILE VALUES — every one of them was MEASURED reaching the store and throwing its own
 *  `ValueRefusedAtBoundary`.** Nine arms, and each is placed where the OLD parse could not see it: a sparse `path` inside a
 *  lawful edge (`.every` skips holes), and the value-shaped faults inside a `view` that states its two admitted members and
 *  carries one more (the old parse judged `offset`/`section` and nothing else). A lone surrogate is the one that reaches the
 *  boundary as a STRING, which is why the boundary predicate judges strings and not only their type. */
const aViewCarrying = (extra: unknown): unknown => ({ offset: 120, section: 'sec-1', ...(extra as object) })
const A_CYCLE: Record<string, unknown> = { offset: 120, section: 'sec-1' }
A_CYCLE['self'] = A_CYCLE

const BOUNDARY_HOSTILE: readonly { readonly id: string; readonly held: unknown }[] = [
  {
    id: 'a SPARSE `path` — a hole is not an index, and `.every` skips holes',
    held: { documentId: A_DOCUMENT, caret: caretWithEdge({ path: new Array(2), offset: 7 }) },
  },
  { id: 'a `BigInt` inside a stated member', held: { documentId: A_DOCUMENT, view: aViewCarrying({ stray: 10n }) } },
  {
    id: 'a FUNCTION inside a stated member',
    held: { documentId: A_DOCUMENT, view: aViewCarrying({ stray: () => undefined }) },
  },
  { id: 'a `Symbol` inside a stated member', held: { documentId: A_DOCUMENT, view: aViewCarrying({ stray: Symbol('stray') }) } },
  { id: 'a CYCLE inside a stated member', held: { documentId: A_DOCUMENT, view: A_CYCLE } },
  { id: '`NaN` inside a stated member', held: { documentId: A_DOCUMENT, view: aViewCarrying({ stray: Number.NaN }) } },
  {
    id: 'a `Map` inside a stated member',
    held: { documentId: A_DOCUMENT, view: aViewCarrying({ stray: new Map<string, string>() }) },
  },
  {
    id: 'an `undefined` inside a stated member',
    held: { documentId: A_DOCUMENT, view: aViewCarrying({ stray: undefined }) },
  },
  {
    id: 'a LONE SURROGATE inside the document stamp',
    held: { documentId: `${A_DOCUMENT}\uD800` },
  },
]

describe('record-engine · B1-ADV-01 — the entry’s member names are an ALLOWLIST: document content is REFUSED, never admitted', () => {
  it('(entry·allowlist) · THE PARSE REFUSES EVERY MEMBER NAME OUTSIDE `documentId`/`caret`/`view` — with the member token and a sentence that NAMES document content', () => {
    SMUGGLED_MEMBERS.forEach(({ member, held }) => {
      const subject = { documentId: A_DOCUMENT, [member]: held }
      const reading = answerOf(subject)
      expect(
        displayEntryAdmits(subject),
        `\`displayEntryAdmits\` must REFUSE a member the family does not state: \`${member}\` was ADMITTED, and D-23's line is ` +
          `that no member of this family is a body, a title, a markdown, a node or a content/text/html key (value: ${jsonOf(held)})`,
      ).toBe(false)
      expect(
        reading.threw,
        `the parse must ANSWER a refusal record rather than throwing, even for a smuggled \`${member}\``,
      ).toBeNull()
      expect(
        reading.record?.reason,
        `an undeclared member is a MEMBER's fault, so the answer carries the member token — read ${jsonOf(reading.record)}`,
      ).toBe(DISPLAY_ENTRY_MALFORMED_REASON)
      expect(
        reading.record?.message.toLowerCase() ?? '',
        `and the sentence must NAME document content as the refused fault, so a reader is told WHAT was refused rather than ` +
          `only that something was: read ${jsonOf(reading.record?.message)}`,
      ).toContain('content')
    })
  })

  it('(entry·positive) · THE CONTROL — `{documentId, caret, view}` STILL PASSES the parse, `commitTab` AND a three-segment write', () => {
    // **WITHOUT THIS ARM EVERY REFUSAL ABOVE WOULD BE SATISFIED BY A PARSE THAT REFUSES EVERYTHING**, which is the failure mode an
    // allowlist invites. The control drives all three crossings the same way the refusals do.
    expect(displayEntryAdmits(A_WHOLE_ENTRY), 'the three lawful members are admitted TOGETHER — the allowlist is a list and not a shut door').toBe(true)
    const crossing = buildCrossing()
    crossing.sinkAddresses.length = 0
    expect(crossing.record.commitTab(A_TAB, A_WHOLE_ENTRY), 'and the record writes it').toMatchObject({ ok: true })
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'the whole entry stands at the leaf, member for member').toEqual(A_WHOLE_ENTRY)
    expect(crossing.sinkAddresses.length, 'and the one write delivered once').toBe(1)
    // THE THREE-SEGMENT CONTROL, on the same crossing: a DECLARED member name still lands under the standing entry.
    expect(
      () => crossing.store.write([...DISPLAY_ADDRESS, A_TAB, 'view'], DISPLAY_TIER, A_LAWFUL_VIEW),
      'a three-segment write NAMING a declared member is lawful and must still commit — the allowlist refuses names, not depth',
    ).not.toThrow()
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB, 'view']), 'and the declared member stands at its own node, member for member').toEqual(
      A_LAWFUL_VIEW,
    )
  })

  it('(entry·commit) · A SMUGGLED MEMBER IS REFUSED BY `commitTab` — `ok: false`, the member token, the LEAF address, ZERO store verbs, and the profile’s bytes unchanged', () => {
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_TAB, { documentId: A_DOCUMENT }), 'the row’s own seed write lands, so the leaf stands').toMatchObject({
      ok: true,
    })
    crossing.sinkAddresses.length = 0
    const bytesBefore = readFileSync(crossing.filePath)
    const standingBefore = jsonOf(crossing.store.read([...DISPLAY_ADDRESS]))

    SMUGGLED_MEMBERS.forEach(({ member, held }) => {
      // THE COUNTER IS THE MEASUREMENT OF "BEFORE ANY STORE VERB": the record is built over a facade whose two verbs count, and a
      // refusal that reached either one would red here even if it changed nothing.
      const counter = countingStore(crossing.store)
      const counted = createDisplayRecord({ store: counter.store, delivery: createDisplayDelivery(() => undefined) })
      const answer = counted.commitTab(A_TAB, { documentId: A_DOCUMENT, [member]: held }) as unknown
      const shape = answer as { readonly ok?: unknown; readonly reason?: unknown; readonly message?: unknown; readonly address?: unknown }
      expect(shape.ok, `a smuggled \`${member}\` is \`ok: false\`, never a credited write`).toBe(false)
      expect(shape.reason, `and it answers the member token: \`${member}\``).toBe(DISPLAY_ENTRY_MALFORMED_REASON)
      expect(String(shape.message).toLowerCase(), `with the sentence that names document content: \`${member}\``).toContain('content')
      expect(
        Array.isArray(shape.address) ? tupleOf(shape.address as readonly string[]) : null,
        `the refusal names the LEAF the write would have landed at — never the family root: \`${member}\``,
      ).toBe(tupleOf([...DISPLAY_ADDRESS, A_TAB]))
      expect(counter.reads(), `a refusal reached NO read verb: \`${member}\``).toBe(0)
      expect(counter.writes(), `and NO write verb — "answered before any store verb" is this count: \`${member}\``).toBe(0)
    })

    // AND NOTHING WAS WRITTEN ON THE REAL CROSSING EITHER: the standing family and the profile's own bytes are as they stood, and no
    // delivery fired (a delivery is a commit's consequence).
    expect(jsonOf(crossing.store.read([...DISPLAY_ADDRESS])), 'the standing family is unchanged by every refusal above').toBe(standingBefore)
    expect(readFileSync(crossing.filePath).equals(bytesBefore), 'and the profile’s BYTES are unchanged: nothing reached the file').toBe(true)
    expect(crossing.sinkAddresses, 'and nothing was delivered — a refused act commits nothing, so it fires nothing').toEqual([])
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'the seeded leaf still holds exactly the entry it held').toEqual({ documentId: A_DOCUMENT })
  })

  it('(entry·deep) · A THREE-SEGMENT WRITE NAMING AN UNDECLARED MEMBER IS REFUSED AT ITS OWN NODE — the deeper arm refuses the NAME, not only the value', () => {
    // **THIS IS THE ARM `F-R2` MEASURED AS REACHABLE**: the store's address domain is three segments, so `['display', <tabId>,
    // <member>]` LANDS whenever that tab's entry stands. Without a NAME judgement here, a member off the allowlist would be put
    // into a standing entry by a route no `commitTab` ever takes — and the family would then name an entry the parse cannot state,
    // which is `D-105`'s fault arriving one route over.
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_TAB, { documentId: A_DOCUMENT }), 'the standing entry the deeper write needs').toMatchObject({ ok: true })
    crossing.sinkAddresses.length = 0
    const bytesBefore = readFileSync(crossing.filePath)

    SMUGGLED_MEMBERS.forEach(({ member, held }) => {
      let refusal: unknown = null
      try {
        crossing.store.write([...DISPLAY_ADDRESS, A_TAB, member], DISPLAY_TIER, held)
      } catch (thrown) {
        refusal = thrown
      }
      expect(
        (refusal as { readonly status?: unknown } | null)?.status,
        `a three-segment write naming \`${member}\` must be REFUSED by the family’s pair — it LANDS otherwise, and the store then ` +
          `holds a member the read cannot state (D-105)`,
      ).toBe('ConstraintPassRefused')
    })

    // AND THE FAMILY IS UNTOUCHED BY ALL NINE: no member landed, nothing was repaired, and nothing was persisted or delivered.
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'the standing entry is exactly what the seed wrote').toEqual({ documentId: A_DOCUMENT })
    expect(Object.keys(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]) as object), 'and it gained NO member from the nine writes').toEqual([
      'documentId',
    ])
    expect(readFileSync(crossing.filePath).equals(bytesBefore), 'and the profile’s bytes are unchanged by the nine refusals').toBe(true)
    expect(crossing.sinkAddresses, 'a refused deeper write delivers nothing').toEqual([])
  })
})

describe('record-engine · B1-ADV-02 — the crossing’s own domain: a boundary-hostile value is REFUSED here, never thrown there', () => {
  it('(boundary·parse) · EVERY BOUNDARY-HOSTILE VALUE IS REFUSED BY THE PARSE — a record with the member token, and NEVER a throw', () => {
    BOUNDARY_HOSTILE.forEach(({ id, held }) => {
      const reading = answerOf(held)
      expect(displayEntryAdmits(held), `\`displayEntryAdmits\` must REFUSE ${id}: the store's boundary would throw on it`).toBe(false)
      expect(
        reading.threw,
        `${id} must be answered as a REFUSAL RECORD — the fault this row closes is the value escaping the parse and throwing the ` +
          `store's own \`ValueRefusedAtBoundary\` at the caller`,
      ).toBeNull()
      expect(reading.record?.reason, `${id} is a member's fault, so the answer carries the member token`).toBe(DISPLAY_ENTRY_MALFORMED_REASON)
      expect((reading.record?.message.length ?? 0) > 0, `${id} answers a sentence, not an empty span`).toBe(true)
    })
  })

  it('(boundary·commit) · AND EACH ONE IS REFUSED BY `commitTab` — ZERO store verbs (COUNTED), `ok: false`, and the value is not mutated', () => {
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_TAB, { documentId: A_DOCUMENT }), 'the row’s own seed write lands').toMatchObject({ ok: true })
    crossing.sinkAddresses.length = 0
    const bytesBefore = readFileSync(crossing.filePath)

    BOUNDARY_HOSTILE.forEach(({ id, held }) => {
      const before = jsonOf(held)
      const counter = countingStore(crossing.store)
      const counted = createDisplayRecord({ store: counter.store, delivery: createDisplayDelivery(() => undefined) })
      const answer = counted.commitTab(A_TAB, held) as unknown
      expect((answer as { readonly ok?: unknown }).ok, `${id} answers \`ok: false\``).toBe(false)
      expect((answer as { readonly reason?: unknown }).reason, `${id} answers the member token`).toBe(DISPLAY_ENTRY_MALFORMED_REASON)
      expect(counter.reads(), `${id} reached NO read verb`).toBe(0)
      expect(counter.writes(), `${id} reached NO write verb — this is the count the finding asked for`).toBe(0)
      expect(jsonOf(held), `${id} was not mutated by the refusal: the caller's value is its own`).toBe(before)
    })

    // AND NOTHING REACHED THE REAL STORE: the file's bytes, the standing family and the delivery count are all as they stood. This
    // is the second reading of the same fact on the instrument that would have PERSISTED the value.
    expect(readFileSync(crossing.filePath).equals(bytesBefore), 'the boundary refusals left the profile’s bytes exactly as they stood').toBe(true)
    expect(crossing.sinkAddresses, 'and delivered nothing').toEqual([])
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'and the leaf is still the seed’s own entry').toEqual({ documentId: A_DOCUMENT })
  })

  it('(boundary·deep) · A THREE-SEGMENT WRITE BELOW A TAB ID IS REFUSED TOO — AND THE MEASUREMENT SAYS BY WHICH ARM', () => {
    // **TWO SUBJECTS, BECAUSE THE TWO DOMAINS ARE ANSWERED BY TWO DIFFERENT ARMS, AND THE MEASUREMENT IS WHICH.**
    //   · a `view` carrying an UNDECLARED member whose value is boundary-LEGAL: the family's pair refuses it (`ConstraintPassRefused`),
    //     which is this module's judgement and the one a row must see;
    //   · a `view` carrying a `BigInt`: **the CROSSING refuses it first** (`ValueRefusedAtBoundary`, MEASURED here) — the store
    //     checks its own boundary before the constraint pass runs, so the member arm's boundary judgement is never reached on a
    //     value the crossing already rejects. The reading that matters is the SAME for both: nothing lands, and the standing entry
    //     is untouched. A row that asserted `ConstraintPassRefused` for the `BigInt` would be asserting an arm the engine never asks.
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_TAB, { documentId: A_DOCUMENT }), 'the standing entry the deeper writes need').toMatchObject({ ok: true })

    let inDomain: unknown = null
    try {
      crossing.store.write([...DISPLAY_ADDRESS, A_TAB, 'view'], DISPLAY_TIER, { offset: 120, section: 'sec-1', stray: 'a string' })
    } catch (thrown) {
      inDomain = thrown
    }
    expect(
      (inDomain as { readonly status?: unknown } | null)?.status,
      'a `view` naming an UNDECLARED member is refused by the FAMILY’s pair at its own node — the pair is an ANCESTOR of the act’s ' +
        'address, so “judged at its own node” is the arm that answers here',
    ).toBe('ConstraintPassRefused')

    let hostile: unknown = null
    try {
      crossing.store.write([...DISPLAY_ADDRESS, A_TAB, 'view'], DISPLAY_TIER, aViewCarrying({ stray: 10n }))
    } catch (thrown) {
      hostile = thrown
    }
    expect(hostile, 'a `view` carrying a `BigInt` must be REFUSED — the crossing refuses it itself, before the pair is ever asked').not.toBeNull()
    expect(
      ['ConstraintPassRefused', 'ValueRefusedAtBoundary'].includes(String((hostile as { readonly status?: unknown }).status)),
      `and the refusal is one of the two named statuses — read \`${String((hostile as { readonly status?: unknown }).status)}\``,
    ).toBe(true)
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'and the standing entry is untouched by either, member for member').toEqual({
      documentId: A_DOCUMENT,
    })
  })

})

describe('record-engine · B1-ADV-16 — an own-`undefined` OPTIONAL member is the LAWFUL ABSENCE, not a refusal', () => {
  it('(own-undefined) · `{documentId, caret: undefined}` IS ADMITTED — the ordinary optional spread must not be a refusal', () => {
    const spread = { documentId: A_DOCUMENT, caret: undefined, view: undefined }
    expect(
      displayEntryAdmits(spread),
      'an own-`undefined` `caret`/`view` is what `{...carried, caret: maybeCaret}` produces when no caret is saved; it means the ' +
        'same as the absent member and must be ADMITTED',
    ).toBe(true)
    const crossing = buildCrossing()
    crossing.sinkAddresses.length = 0
    expect(crossing.record.commitTab(A_TAB, spread), 'and the record writes it').toMatchObject({ ok: true })
    const standing = crossing.store.read([...DISPLAY_ADDRESS, A_TAB]) as Record<string, unknown>
    expect(standing, 'the stored entry holds the stamp and no `caret`/`view` member: an absent member is spelled by CARRYING nothing').toEqual({
      documentId: A_DOCUMENT,
    })
    expect(Object.hasOwn(standing, 'caret'), 'and the `undefined` member was not carried across the boundary, which refuses one').toBe(false)
  })

  it('(own-undefined·required) · THE STAMP IS REQUIRED — `{documentId: undefined}` is still REFUSED', () => {
    // The leniency is for the two members `DisplayEntry` declares OPTIONAL. `documentId` is neither optional nor coercible: an own
    // `undefined` there is the absence of the family's one required member.
    expect(displayEntryAdmits({ documentId: undefined }), 'the required stamp cannot be undefined').toBe(false)
    expect(answerOf({ documentId: undefined }).record?.reason, 'and it answers the member token').toBe(DISPLAY_ENTRY_MALFORMED_REASON)
  })
})

describe('record-engine · B1-ADV-05(a) — a tab id that collides with a PROTOTYPE KEY is refused by the shape arm', () => {
  const PROTOTYPE_KEYS = ['__proto__', 'constructor', 'prototype']

  it('(id·prototype) · `__proto__`, `constructor` and `prototype` ARE REFUSED — `ok: false`, the SHAPE token, and the reading’s prototype is untouched', () => {
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_TAB, { documentId: A_DOCUMENT }), 'the row’s own seed write lands').toMatchObject({ ok: true })
    crossing.sinkAddresses.length = 0
    const bytesBefore = readFileSync(crossing.filePath)
    const prototypeBefore = Object.getPrototypeOf(crossing.record.read() as object)
    const keysBefore = Object.keys(crossing.record.read() as object)

    PROTOTYPE_KEYS.forEach((tabId) => {
      const answer = crossing.record.commitTab(tabId, { documentId: A_DOCUMENT }) as unknown
      const shape = answer as { readonly ok?: unknown; readonly reason?: unknown }
      // **THE MEASURED FAULT WAS THAT THIS COMMITTED**: it then vanished from `read()` and became the READING'S PROTOTYPE, while
      // `readTab` still answered — a caller-held key that reaches the object model is a payload's shape fault, and the family keys
      // one member per tab id.
      expect(shape.ok, `a tab id that IS a prototype key (\`${tabId}\`) must be REFUSED, never committed: it is the READING's key space`).toBe(false)
      expect(shape.reason, `and the token is the SHAPE arm's — an id is the family value's outer shape, not a member's — for \`${tabId}\``).toBe(
        DISPLAY_MALFORMED_REASON,
      )
      const reading = crossing.record.read() as object
      expect(Object.getPrototypeOf(reading), `the reading's PROTOTYPE must be untouched by \`${tabId}\``).toBe(prototypeBefore)
      expect(Object.keys(reading), `and the reading gained no key from \`${tabId}\` — the refusal wrote nothing`).toEqual(keysBefore)
      expect(
        Object.hasOwn(reading, tabId),
        `and \`${tabId}\` is no OWN member of the family: a prototype key that only reaches the object model is exactly the fault this ` +
          `arm closes (the chain read of \`${tabId}\` is the prototype, which is why the reading's prototype is read above)`,
      ).toBe(false)

      expect(crossing.record.readTab(tabId), `while \`readTab('${tabId}')\` answers the absence, never an inherited object`).toBeNull()
    })

    expect(readFileSync(crossing.filePath).equals(bytesBefore), 'and the profile’s bytes are unchanged: nothing was written').toBe(true)
    expect(crossing.sinkAddresses, 'and nothing was delivered by any of the three').toEqual([])
  })

  it('(id·prototype·read) · AND A FAMILY ALREADY CARRYING SUCH A KEY IS NOT HANDED ON — the read answers the absence, never a smuggled prototype', () => {
    // **THE OUTSIDE-WRITER ARM** (`B1-ADV-03`'s own instrument): a store with NO constraint registered is what a profile image
    // written by another version, or by another process, looks like. Its family carries a `__proto__` member the module would never
    // write, and the read must not turn that member into the reading's prototype or drop it silently.
    const dir = mkdtempSync(join(tmpdir(), 'record-engine-entry-domain-image-'))
    TEMP_DIRS.push(dir)
    const filePath = join(dir, 'profile.store')
    const bare = createProfileStore({ filePath })
    const family: Record<string, unknown> = {}
    family['tab-a'] = { documentId: A_DOCUMENT }
    // A REAL own `__proto__` key, written the only way a plain assignment cannot: through the property definition.
    Object.defineProperty(family, '__proto__', {
      value: { documentId: 'doc-smuggled' },
      enumerable: true,
      configurable: true,
      writable: true,
    })
    bare.write([...DISPLAY_ADDRESS], DISPLAY_TIER, family)
    const record = createDisplayRecord({ store: bare, delivery: createDisplayDelivery(() => undefined) })
    const reading = record.read() as unknown
    expect(
      reading === null || Object.getPrototypeOf(reading as object) === Object.prototype,
      'the read must never answer a value whose PROTOTYPE is a family member: read() answers the family or the declared absence',
    ).toBe(true)
    expect((reading as Record<string, unknown> | null)?.['documentId'], 'and no member of the smuggled entry is reachable off the reading').toBeUndefined()
  })
})
