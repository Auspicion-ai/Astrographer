// tests/integration/record-engine/display-record.test.ts — unit `B-1` `record-engine-seam`'s red-set arms `(d)` and `(e)` plus
// the WRITE CADENCE (`docs/L1/unit-b-1-record-engine-seam.md` §2's pinned `DISPLAY_WRITE_EVENTS`, §5's `(d)`/`(e)`, §7's `D-26`
// item 3).
//
// **IT IS RED ON ARRIVAL AND THAT IS THE RED-FIRST EVIDENCE** (RCA-1): `createDisplayRecord`, `DISPLAY_WRITE_EVENTS`,
// `createDisplayDelivery`, `displayConstraintDeclarations`, `displayPlaceholder`, the seam and the renderer client are §4's sites
// 1–6 and do not exist at this head, so the import fails and the run reds with it. No line here moves to make the tree compile.
//
// **WHAT THESE ARMS MEASURE, EACH IN §5's OWN WORDS**:
//   · `(d)` "THE CREATION's own repair DELIVERS — the initial render is a delivery's turn and not a read's": the construction's
//     repair writes the placeholder and the sink HEARS `[…DISPLAY_ADDRESS]`, **before the record exists and before anything is
//     read**. The second arm is the same fact from the other side: a construction that adopts NO entry delivers nothing at all while
//     the family still stands and a `read()` still answers — so "the read is what delivers" is excluded by measurement and not by
//     argument.
//   · `(e)` "THE MODULE CONSTRUCTS NO STORE OF ITS OWN": the record writes into the CALLER-BUILT instance — the caller reads the
//     write back off ITS OWN handle — two records over one store see each other's writes, and the temp directory still carries
//     exactly the one file the caller named. **This arm's STATIC half is `seam-census.test.ts`'s `(f)`**: a module that could mint a
//     store would have to spell the package, and exactly one `src/**` file does.
//   · and the CADENCE §2 PINS: `DISPLAY_WRITE_EVENTS` is the three stated events, one whole-entry write per EVENT and never one per
//     member, and a `read()`/`readTab()`/`fill()` writes NOTHING — the standing value AND the standing bytes unchanged, with no
//     second delivery.
//
// **THE STANDING BYTES ARE READ OFF THE PROFILE FILE ON A `mkdtempSync` PATH** (`os.tmpdir()`), because a read that persisted would
// move the file even where it left the value alone; the value itself is read back through the caller's own store handle. Both are
// removed in `afterAll`.
//
// **MEASURED — AND THIS IS WHY NO ROW HERE ASSERTS MEMBER ORDER, SO DO NOT "RESTORE" A STRING COMPARISON OF A READ-BACK**: the
// installed `provident-storeroom@1.11.0` CANONICALISES object member order on every round trip — a written `{zeta:1, alpha:2,
// mid:3}` reads back `{alpha:2, mid:3, zeta:1}`, recursively, at the `file`, `mem` AND `temp` tiers, and in the `after.value` of the
// journal op — so every read-back below is compared with `toEqual`, which compares the MEMBERS AND THEIR VALUES rather than two
// spellings; §2 fixes the members' names and domains and never their spelling order, so a `JSON.stringify`-against-a-fixture
// assertion would measure the package's canonical order and not this unit's claim, and the package's order itself belongs to
// `docs/defects.md`'s catalogue rather than to this battery.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT the sink's delivered address for a LEAF write, nor the
// fan-out order, nor the arity of a subscriber — `delivery.test.ts` `(a)`/`(c)`; NOT the entry admission or the family's sentence —
// `display-admission.test.ts`; NOT the entries↔roots relation — `declared-entries.test.ts` (`FH-1`/`FH-2`); NOT the family object's
// projections, deferral or narrowing — `family-object.test.ts` `FH-3`; NOT the client's own discipline beyond the ONE reading that
// `fill()` writes nothing — `display-client.test.ts`; NOT the tier the family declares, the root count or an id, none of which any
// row of this unit states; and NOT the three capture SITES the cadence will be driven from — those are `B-10`'s (§2: "the three
// capture sites are `B-10`'s, whose red row counts the writes against this set").
//
// LAYER: `[T]`/envelope. A real store is constructed on a temp-dir path; nothing here paints and nothing here is app-green.
import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'

import { createDisplayDelivery } from '../../../src/main/record-engine/delivery.js'
import { DISPLAY_WRITE_EVENTS, createDisplayRecord } from '../../../src/main/record-engine/record.js'
import { DISPLAY_ADDRESS, displayConstraintDeclarations } from '../../../src/main/record-engine/display-family.js'
import { displayPlaceholder } from '../../../src/main/record-engine/display-shape.js'
import { createProfileStore } from '../../../src/main/storeroom.js'
import { createDisplayClient } from '../../../src/renderer/display-client.js'

/** **ONE ADDRESS AS A COMPARABLE TUPLE — AND NEVER `join('/')`**: `['a/b']` and `['a', 'b']` are two DIFFERENT addresses sharing one
 *  joined spelling, so a joined comparison would call the leaf a match for the root it is registered under. */
const tupleOf = (address: readonly string[]): string => JSON.stringify([...address])

/** **NEVER A READ-BACK AGAINST A FIXTURE** (see the header: the store canonicalises member order, so two spellings of one value
 *  are two strings for one fact). It is used only where both sides are the SAME kind of reading — a later reading of the store
 *  against an earlier one, or a read-back against the module's OWN value — and for the ONE comparison that is about order by
 *  contract, `DISPLAY_WRITE_EVENTS`'s pinned sequence. */
const jsonOf = (value: unknown): string => JSON.stringify(value)

/** The tab and the entry this row writes: both are THIS FILE'S fixtures. §2 fixes the key to be the ADDRESS SEGMENT and never a
 *  stored `tabId`, so the id appears only in the address. */
const A_TAB = 'tab-a'
/** An entry carrying EVERY member the family admits (`documentId`, `caret`, `view`) — the cadence arm's subject, because "one
 *  whole-entry write per EVENT" is only distinguishable from "one per member" on an entry with several members. */
const A_WHOLE_ENTRY = {
  documentId: 'doc-a',
  caret: { kind: 'rich', anchor: { path: [0, 2], offset: 5 }, focus: { path: [0, 2], offset: 9 }, focused: true },
  view: { offset: 240, section: 'sec-2' },
}

/** Every temp directory this file opened, so `afterAll` removes exactly what it made. */
const TEMP_DIRS: string[] = []

afterAll(() => {
  TEMP_DIRS.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

interface Crossing {
  readonly store: ReturnType<typeof createProfileStore>
  readonly delivery: ReturnType<typeof createDisplayDelivery>
  readonly record: ReturnType<typeof createDisplayRecord>
  readonly filePath: string
  readonly sinkAddresses: (readonly string[])[]
}

/**
 * **ONE REAL CROSSING, CONSTRUCTED EXACTLY AS §3 DESCRIBES IT**: the delivery is built BEFORE the store, its entries are adopted at
 * the one construction, and the family's declarations are registered there too, so the creation's repair mints the placeholder. The
 * holder is bound AFTER the construction answers — the boot's own order (`src/main/main.ts`'s `storeHolder`), and the reason a
 * registration-instant body judges `context.value` and reaches for no handle.
 *
 * `adoptEntries: false` is the SECOND ARM'S CONSTRUCTION: the same store, the same family, and NO listener — so the creation still
 * repairs and nothing is delivered, which is how "the read delivers" is excluded.
 */
function buildCrossing(options: { readonly adoptEntries?: boolean } = {}): Crossing {
  const dir = mkdtempSync(join(tmpdir(), 'record-engine-display-record-'))
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
    listeners: options.adoptEntries === false ? [] : [...delivery.entries],
    constraints: [...displayConstraintDeclarations(() => holder)] as never,
  })
  holder = store
  const record = createDisplayRecord({ store, delivery })
  return { store, delivery, record, filePath, sinkAddresses }
}

describe('record-engine · arm (d) — the CREATION’s own repair DELIVERS: the initial render is a delivery’s turn, never a read’s', () => {
  it('(d) · THE SINK HEARS THE FAMILY ROOT AT THE CONSTRUCTION — before the record exists and before anything has been read', () => {
    // THE DELIVERY IS BUILT BEFORE THE STORE AND READ FROM THE SINK, not from the record: the record is only built afterwards, so a
    // reading taken here cannot be a read's consequence. This is `D-219`'s order and §5(d)'s whole claim.
    const dir = mkdtempSync(join(tmpdir(), 'record-engine-display-record-creation-'))
    TEMP_DIRS.push(dir)
    const sinkAddresses: (readonly string[])[] = []
    const delivery = createDisplayDelivery((...args: unknown[]) => {
      const first = args[0]
      sinkAddresses.push(Array.isArray(first) ? first.map((segment) => String(segment)) : [])
    })
    let holder: ReturnType<typeof createProfileStore> | null = null
    const store = createProfileStore({
      filePath: join(dir, 'profile.store'),
      listeners: [...delivery.entries],
      constraints: [...displayConstraintDeclarations(() => holder)] as never,
    })
    holder = store

    // **THE MEASUREMENT IS TAKEN HERE, BETWEEN THE CONSTRUCTION AND THE RECORD.**
    expect(sinkAddresses.length, 'the creation’s repair DELIVERED: a repair that wrote without a delivery would make the initial render a read’s').toBe(1)
    expect(
      tupleOf(sinkAddresses[0] ?? []),
      `the delivered address is the FAMILY ROOT \`${tupleOf([...DISPLAY_ADDRESS])}\` — the address the creation’s repair writes at`,
    ).toBe(tupleOf([...DISPLAY_ADDRESS]))
    // AND THE REPAIR WROTE THE PLACEHOLDER: the family STANDS, so a leaf write at a tab id can land at all (a nested write does not
    // create its parent). **THE COMPARISON IS `toEqual` AND NOT TWO STRINGS**: the read-back's member ORDER is the store's (see the
    // header), so a value read back off the store is compared MEMBER FOR MEMBER against the module's own value and never as a
    // canonicalised string against a spelled literal.
    expect(
      store.read([...DISPLAY_ADDRESS]),
      'the creation repair wrote the module’s own placeholder at the family root — the value `B-10` reads as “open at the document’s start”',
    ).toEqual(displayPlaceholder())
  })

  it('(d·second-arm) · A CONSTRUCTION THAT ADOPTS NO ENTRY DELIVERS NOTHING — the family still stands and a `read()` still answers, so the read is not what delivers', async () => {
    const crossing = buildCrossing({ adoptEntries: false })
    expect(crossing.sinkAddresses.length, 'nothing was adopted as a listener, so the creation’s repair delivered to nobody').toBe(0)
    expect(
      crossing.store.read([...DISPLAY_ADDRESS]),
      'while the family STANDS: the repair is the declaration’s and not the listener’s, so an absent listener is not an absent repair',
    ).toEqual(displayPlaceholder())
    const reading = await Promise.resolve(crossing.record.read())
    expect(reading, 'and the read answers — the reading exists whether or not anything was ever delivered').not.toBeNull()
    expect(crossing.sinkAddresses.length, 'and the read did not deliver: a read writes nothing and therefore fires nothing').toBe(0)
  })
})

describe('record-engine · arm (e) — the module consumes a store the CALLER built and mints none', () => {
  it('(e) · THE RECORD WRITES INTO THE CALLER’S INSTANCE — read back off the CALLER’S OWN HANDLE, not off the record', () => {
    const crossing = buildCrossing()
    const answer = crossing.record.commitTab(A_TAB, A_WHOLE_ENTRY) as unknown
    expect((answer as { readonly ok?: unknown }).ok, 'the write commits through the record').toBe(true)
    // **THE READING IS TAKEN OFF THE STORE THE CALLER KEPT**, which is the whole of `(e)`: a record that minted its own instance would
    // have written there and this read would answer the placeholder. The comparison is `toEqual` — the SAME MEMBERS WITH THE SAME
    // VALUES — because the store's own canonical member order is not this row's subject (see the header).
    expect(
      crossing.store.read([...DISPLAY_ADDRESS, A_TAB]),
      'the entry stands in the CALLER’S store at the leaf the record wrote — the module owns no instance of its own',
    ).toEqual(A_WHOLE_ENTRY)
  })

  it('(e·one-instance) · TWO RECORDS OVER ONE STORE SEE EACH OTHER’S WRITES — and the temp directory still carries ONE file, the one the caller named', () => {
    const crossing = buildCrossing()
    const second = createDisplayRecord({ store: crossing.store, delivery: crossing.delivery })
    const otherTab = 'tab-b'
    const secondEntry = { documentId: 'doc-b' }
    expect(crossing.record.commitTab(A_TAB, A_WHOLE_ENTRY), 'the first record’s write commits').toMatchObject({ ok: true })
    expect(second.commitTab(otherTab, secondEntry), 'and the second record’s write commits against the same caller-built store').toMatchObject({ ok: true })
    // ONE INSTANCE, READ THROUGH ONE HANDLE: both writes stand together, which they could not if either construction had minted a store.
    // Both readings are `toEqual` — the same members with the same values; the store's canonical member order is not this row's subject.
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'the first record’s entry stands').toEqual(A_WHOLE_ENTRY)
    expect(crossing.store.read([...DISPLAY_ADDRESS, otherTab]), 'and the second record’s entry stands beside it in the SAME family').toEqual(
      secondEntry,
    )
    expect(
      readdirSync(dirname(crossing.filePath)),
      'the caller’s directory carries exactly the ONE file the caller named — a second file would be a store someone else opened',
    ).toEqual([basename(crossing.filePath)])
  })
})

describe('record-engine · the CADENCE §2 pins — one whole-entry write per EVENT, and a read writes nothing at all', () => {
  it('(cadence·pinned) · `DISPLAY_WRITE_EVENTS` IS EXACTLY THE THREE EVENTS §2 PINS — the cadence’s own cost, stated as data', () => {
    // §2: "`DISPLAY_WRITE_EVENTS = ['tab-switch', 'commit-on-blur', 'scroll-settle'] as const` — and one whole-entry write per EVENT,
    // never per keystroke and never per member". The three words are the CONTRACT's, and the order is the contract's too, so this
    // comparison is order-sensitive by design.
    expect(Array.isArray(DISPLAY_WRITE_EVENTS), 'the cadence is a list a capture site can iterate').toBe(true)
    expect(jsonOf([...DISPLAY_WRITE_EVENTS]), 'the pinned three, in the contract’s own order').toBe(jsonOf(['tab-switch', 'commit-on-blur', 'scroll-settle']))
  })

  it('(cadence·one-write) · ONE `commitTab` IS ONE DELIVERY AND ONE WHOLE-ENTRY WRITE — never one write per member', () => {
    const crossing = buildCrossing()
    crossing.sinkAddresses.length = 0
    expect(crossing.record.commitTab(A_TAB, A_WHOLE_ENTRY), 'the whole-entry write commits').toMatchObject({ ok: true })
    // AN ENTRY WITH THREE MEMBERS AND ONE DELIVERY: a per-member writer would deliver once per member (three times) and, worse, would
    // land three partial entries the parse could refuse mid-way.
    expect(crossing.sinkAddresses.length, 'one event is ONE write, so ONE delivery — an entry with three members is still one entry').toBe(1)
    expect(
      tupleOf(crossing.sinkAddresses[0] ?? []),
      'and the delivered address is the leaf of the one write: the write is whole-entry and per-tab, never per-member',
    ).toBe(tupleOf([...DISPLAY_ADDRESS, A_TAB]))
    // `toEqual` AND NOT TWO SPELLINGS: ONE value carrying ALL THREE members is the whole-entry claim, while the store's canonical
    // member order is the package's business and not this row's subject (see the header).
    expect(
      crossing.store.read([...DISPLAY_ADDRESS, A_TAB]),
      'the standing leaf holds the WHOLE entry, all three members in one value',
    ).toEqual(A_WHOLE_ENTRY)
  })

  it('(cadence·read) · A `read()`/`readTab()`/`fill()` WRITES NOTHING — the standing value, the standing BYTES and the delivery count are all unchanged', async () => {
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_TAB, A_WHOLE_ENTRY), 'the write this arm then refuses to disturb').toMatchObject({ ok: true })
    // The standing VALUE is captured as a value and compared with `toEqual` — the same members with the same values — while the
    // profile's own BYTES below are compared as bytes, because those two readings are different facts and only the second is about
    // a file. The store's canonical member order is not this row's subject (see the header).
    const valueBefore = crossing.store.read([...DISPLAY_ADDRESS])
    const bytesBefore = readFileSync(crossing.filePath)
    const deliveriesBefore = crossing.sinkAddresses.length
    expect(deliveriesBefore, 'the write delivered once, so “unchanged” has a non-zero baseline').toBeGreaterThan(0)

    // THE THREE READS THE MODULE OWES: the record's family read, the record's per-tab read, and the CLIENT's one stated boot read
    // through a port over the record's read (which is how `fill()` reaches this module without this row pretending the bridge exists).
    const reading = await Promise.resolve(crossing.record.read())
    expect(reading, 'the family read answers').not.toBeNull()
    const tabReading = await Promise.resolve(crossing.record.readTab(A_TAB))
    expect(jsonOf(tabReading), 'the per-tab read answers the entry this row committed').toContain('doc-a')
    expect(crossing.record.readTab('no-such-tab'), 'and an absent tab is a LAWFUL absence: it answers `null` rather than an invented entry').toBeNull()

    const client = createDisplayClient({
      read: () => crossing.record.read(),
      onChanged: () => () => undefined,
    } as unknown as Parameters<typeof createDisplayClient>[0])
    await Promise.resolve()
      .then(() => client.fill())
      .then(
        () => 'answered',
        () => 'threw',
      )
    expect(jsonOf(client.displayOf(A_TAB)), 'the client’s one stated read holds the entry the store stands').toContain('doc-a')

    // **NOTHING MOVED**: the value, the file's own bytes and the delivery count — a read that wrote would move at least one.
    expect(
      crossing.store.read([...DISPLAY_ADDRESS]),
      'a read writes nothing: the standing family still answers the same members with the same values',
    ).toEqual(valueBefore)
    expect(
      readFileSync(crossing.filePath).equals(bytesBefore),
      'and the profile’s own BYTES are unchanged — a read that persisted would move the file even where it left the value alone',
    ).toBe(true)
    expect(crossing.sinkAddresses.length, 'and no second delivery fired: a delivery is a write’s consequence and there was no write').toBe(deliveriesBefore)
  })
})
