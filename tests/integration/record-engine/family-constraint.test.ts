// tests/integration/record-engine/family-constraint.test.ts — the TWO rows unit `B-1` `record-engine-seam`'s L1 battery
// EXPLICITLY LEAVES UNCLAIMED: `docs/L1/unit-b-1-record-engine-seam.md` §5(g)'s **(g1)** and **(g2)**, the constraint's own
// value arms at a WRITE instant.
//
// **OWNERSHIP, STATED BECAUSE TWO LAYERS COULD HAVE TAKEN THEM.** L1 §5(g) says these "two rows are the L2/L3 TestWriters' to
// append in their own test dirs under this contract; the first battery (`role_l1_test_writer`, §9) declines them explicitly and
// must not be read as covering them". They are appended HERE, in `tests/integration/record-engine/`, which is the **L2-owned**
// directory (`strata/modules.json`'s `record-engine` row names both); the L3-owned `tests/unit/record-engine/` is left to the
// unit-grain rows §5 already files there. `docs/L2/record-engine/interface.md` §5 records the same sentence, and the L3 design's
// unit-grain map names these two rows by id so neither layer can read them as its own.
//
// **WHY THEY ARE INTEGRATION-CLASS AND NOT UNIT-CLASS**: every arm below is a fact about a REAL CONSTRUCTION — the constraint
// registered at the store's one `createProfileStore` call over a `mkdtempSync` path, a real `file` tier, real journal and real
// rollback. §2's arm (2)/(3) is a judgement made BY THE ENGINE over `context.value` at a write instant; the module's own
// functions cannot be handed a write instant at all, so a unit row would have had to fabricate one.
//
// **IT WAS WRITTEN AND RUN RED BEFORE THE ARM EXISTED** (RCA-1): at the head this file landed on, `src/main/record-engine/**` and
// `src/main/storeroom.ts` do not exist, so the imports fail at module resolution and the run reds with them — the SAME red set
// the L1 battery is already in (`7 suites failed at module resolution, 0 rows executed`), now `8`.
//
// **WHAT THESE ROWS MEASURE, IN THE CONTRACT'S OWN WORDS** (§2's constraint paragraph, arms (2) and (3)):
//   · **(g1)** "a family that STANDS and names an entry the parse cannot state → REFUSED, no repair (`D-105`: the read would drop
//     it while `source` still said `'record'`), guarded by the write-instant arm". So: the store REFUSES the act (its own closed
//     status `ConstraintPassRefused`), the standing family is IDENTICAL afterwards, member for member — **no repair ran**, which is
//     the whole difference between this arm and arm (1) — the profile's own BYTES on disk are unchanged, and NOTHING WAS DELIVERED (a
//     refusal is answered before the commit, so it cannot have fired a listener).
//   · **(g2)** "at or below a tab id the landed value is ONE entry and is judged at its own node, **never repaired** (`:1034-1035`
//     — repairing there would replace the whole family inside a commit that still answered `committed`)". So: a leaf write carrying
//     a value the parse cannot state is REFUSED at its own node, and the family's OTHER members are still standing afterwards —
//     the reading that separates "judged at the node" from "repaired at the root". A LAWFUL leaf write is the positive control, and
//     a write BELOW a tab id is driven too (see the measured note in that row).
//
// **WHAT THESE ROWS MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT**: NOT the absence/repair arm — that is the L1 battery's
// `(d)` (`tests/integration/record-engine/display-record.test.ts`), which measures the creation's own repair delivering the
// placeholder; NOT the entry parse's own member list — `tests/unit/record-engine/display-admission.test.ts`; NOT the reason tokens
// or the sentences — the same unit row reads them off the module; NOT the delivered address of a LAWFUL write, the fan-out order
// or a subscriber's arity — `tests/integration/record-engine/delivery.test.ts` `(a)`/`(c)` (the positive control below reads the
// delivered address only because a REFUSED write must deliver NOTHING, and the two are one comparison); NOT the family object's
// projections — `tests/unit/record-engine/family-object.test.ts` `FH-3`; and NOT the tier word, the root count or any member of the
// family's payload — every figure below is read off the module or is this file's own fixture.
//
// LAYER: `[T]`/envelope. A real store is constructed on a `mkdtempSync` path under `os.tmpdir()` and removed in `afterAll`;
// nothing here paints and nothing here is app-green.
import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createDisplayDelivery } from '../../../src/main/record-engine/delivery.js'
import { createDisplayRecord } from '../../../src/main/record-engine/record.js'
import { DISPLAY_ADDRESS, DISPLAY_TIER, displayConstraintDeclarations } from '../../../src/main/record-engine/display-family.js'
import { displayPlaceholder } from '../../../src/main/record-engine/display-shape.js'
import { createProfileStore } from '../../../src/main/storeroom.js'

/** **ONE ADDRESS AS A COMPARABLE TUPLE — AND NEVER `join('/')`**: `['a/b']` and `['a', 'b']` are two DIFFERENT addresses sharing
 *  one joined spelling, so a joined comparison would call the family ROOT a match for a leaf that merely shares its prefix. */
const tupleOf = (address: readonly string[]): string => JSON.stringify([...address])

/** One value's spelling, used **ONLY BETWEEN TWO READINGS OF THE SAME KIND** — a later read-back against an earlier one, where both
 *  sides come through the store's own round trip and the order is therefore the store's on both sides. **IT IS NOT A
 *  BYTE-IDENTITY ORACLE AND NO ROW BELOW USES IT AS ONE**: the installed store CANONICALISES object member order (sorted,
 *  recursively, `docs/L2/record-engine/interface.md` §6), so a read-back compared as a STRING against a literal spelled in insertion
 *  order is green by coincidence and red the moment a member sorts differently. Every comparison of a read-back against a FIXTURE
 *  below is `toEqual` — member for member — and the profile's own BYTES are compared as bytes where the file is the subject. */
const jsonOf = (value: unknown): string => JSON.stringify(value)

/** The tab ids and entries this file writes: ALL of them are this file's own fixtures, and §2 fixes the key to be the ADDRESS
 *  SEGMENT and never a stored `tabId`, so an id appears only in the address it is written at. */
const A_TAB = 'tab-a'
const A_SIBLING_TAB = 'tab-sibling'
const A_THIRD_TAB = 'tab-third'
/** A LAWFUL entry, carrying the one member every entry must state. */
const A_LAWFUL_ENTRY = { documentId: 'doc-a' }
/** A SECOND lawful entry: two standing members are what makes "the whole family was not replaced" readable at all. */
const A_SIBLING_ENTRY = { documentId: 'doc-sibling' }
const A_THIRD_ENTRY = { documentId: 'doc-third' }
/** **A VALUE THE PARSE CANNOT STATE, AND THE ARM IS THE PAYLOAD'S**: a `documentId` that is not a non-empty string. It is
 *  written INSIDE a member of an otherwise lawful family, which is exactly §2's arm (2) — the family STANDS and NAMES an entry
 *  the parse cannot state. */
const AN_UNSTATABLE_ENTRY = { documentId: 7 }
/** A leaf value that is no entry at all: §2's arm (3)'s subject, at a tab id. */
const AN_UNSTATABLE_LEAF = 'an-unadmitted-scalar'

/** Every temp directory this file opened, so `afterAll` removes exactly what it made and nothing else. */
const TEMP_DIRS: string[] = []

afterAll(() => {
  TEMP_DIRS.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

/** ONE REAL CROSSING, BUILT EXACTLY AS §3 DESCRIBES IT: the delivery before the store, its entries adopted at the one
 *  construction, the family's declarations registered there, and the holder bound AFTER the construction answers (the boot's own
 *  order — which is why a registration-instant body judges `context.value` and reaches for no handle). */
interface Crossing {
  readonly store: ReturnType<typeof createProfileStore>
  readonly record: ReturnType<typeof createDisplayRecord>
  readonly filePath: string
  readonly sinkAddresses: (readonly string[])[]
}

function buildCrossing(): Crossing {
  const dir = mkdtempSync(join(tmpdir(), 'record-engine-family-constraint-'))
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

describe('record-engine · L1 §5(g) — the constraint’s WRITE-INSTANT value arms, which the first battery declines', () => {
  it('(g1) · A STANDING FAMILY NAMING AN ENTRY THE PARSE CANNOT STATE IS REFUSED, WITH NO REPAIR — and the profile’s bytes are unchanged', () => {
    // **THE ARM IS `D-105`'s AND THE DISTINCTION IS THE WHOLE ROW**: arm (1) of §2's constraint REPAIRS an absent root with the
    // placeholder; this arm REFUSES and repairs NOTHING, because a repair here would replace a family whose members are the
    // operator's own display state — and the read would still answer `source: 'record'` while dropping what it could not state.
    const crossing = buildCrossing()
    // THE FAMILY STANDS WITH A MEMBER THIS FILE WROTE, so "unchanged" has a subject and "not replaced by the placeholder" is a
    // reading rather than a claim about an empty record.
    expect(crossing.record.commitTab(A_TAB, A_LAWFUL_ENTRY), 'the row’s own seed write lands, or every reading below is about nothing').toMatchObject({
      ok: true,
    })
    expect(
      crossing.store.read([...DISPLAY_ADDRESS, A_TAB]),
      'the seeded member stands at its leaf, member for member — the value the refusal must leave exactly as it is',
    ).toEqual(A_LAWFUL_ENTRY)

    // THE CREATION'S OWN DELIVERY IS `(d)`'s SUBJECT AND NOT THIS ROW'S, so the log is reset after the seeding writes.
    crossing.sinkAddresses.length = 0
    const valueBefore = jsonOf(crossing.store.read([...DISPLAY_ADDRESS]))
    const bytesBefore = readFileSync(crossing.filePath)

    // **THE ACT: ONE WHOLE-FAMILY WRITE CARRYING A MEMBER THE PARSE CANNOT STATE.** It is written AT the family root, which is the
    // one address at which arm (2) is the judgement (§2: "a family that STANDS and names an entry the parse cannot state").
    let refusal: unknown = null
    try {
      crossing.store.write([...DISPLAY_ADDRESS], DISPLAY_TIER, { [A_TAB]: A_LAWFUL_ENTRY, [A_SIBLING_TAB]: AN_UNSTATABLE_ENTRY })
    } catch (thrown) {
      refusal = thrown
    }

    // THE STORE REFUSED THE ACT, and the status is the package's own rank-20 member for a constraint refusal (§2/§5(g): "REFUSED
    // at a write instant"), which is asserted as the package's public vocabulary and never inferred from a shape of this file's.
    expect(refusal, 'a standing family naming an entry the parse cannot state is REFUSED at a write instant, never committed').not.toBeNull()
    const shape = refusal as { readonly status?: unknown; readonly message?: unknown }
    expect(shape.status, 'the refusal crosses as the package’s own constraint-refusal status, not as a bare throw').toBe('ConstraintPassRefused')

    // **NO REPAIR RAN, AND THE STANDING FAMILY SAYS SO**: identical to what it was, member for member — while a repair would have
    // left the module's own placeholder here (arm (1)'s value), which is asserted separately so the two arms cannot be confused by a
    // reader. The two readings compared here are two read-backs of the SAME store, so the member order is the store's on both sides;
    // the comparison against a FIXTURE below is `toEqual`, and the file's own bytes are read as BYTES.
    expect(jsonOf(crossing.store.read([...DISPLAY_ADDRESS])), 'a refusal repairs NOTHING: the standing family is unchanged').toBe(valueBefore)
    expect(
      crossing.store.read([...DISPLAY_ADDRESS]),
      'and the family was NOT replaced by the module’s own placeholder — that is arm (1)’s answer and this arm’s opposite',
    ).not.toEqual(displayPlaceholder())
    expect(
      crossing.store.read([...DISPLAY_ADDRESS, A_TAB]),
      'the member this row seeded is still standing at its leaf, so no member was dropped on the way out',
    ).toEqual(A_LAWFUL_ENTRY)


    // AND THE PROFILE'S OWN BYTES ARE UNCHANGED — the store rolled the act back, so nothing the caller wrote reached the file.
    expect(
      readFileSync(crossing.filePath).equals(bytesBefore),
      'the refusal left the profile’s bytes exactly as they stood: a rollback that rewrote the file would be a repair by another name',
    ).toBe(true)
    // AND NOTHING WAS DELIVERED: a refusal is answered before the commit, so a delivery here would have reached a store verb.
    expect(crossing.sinkAddresses, 'a refused act delivers NOTHING — the delivery fires on a commit and there was none').toEqual([])
  })

  it('(g2) · A WRITE AT A TAB ID IS JUDGED AT ITS OWN NODE AND NEVER REPAIRED — an unadmitted leaf is refused and the WHOLE family is not replaced', () => {
    // **THE HAZARD THIS ROW EXISTS FOR, IN §2's ARMS (3)'s OWN WORDS**: "repairing there would replace the whole family inside a
    // commit that still answered `committed`". `context.value` at a leaf write is the value the act LANDED — a scalar or an entry,
    // never the family — so a body that answered that as ABSENCE would write the placeholder at the ROOT and destroy every
    // sibling member. The row drives it and reads the siblings.
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_TAB, A_LAWFUL_ENTRY), 'the first standing member lands').toMatchObject({ ok: true })
    expect(crossing.record.commitTab(A_SIBLING_TAB, A_SIBLING_ENTRY), 'and a second one, so “the whole family” has two witnesses').toMatchObject({
      ok: true,
    })
    crossing.sinkAddresses.length = 0
    const valueBefore = jsonOf(crossing.store.read([...DISPLAY_ADDRESS]))
    const bytesBefore = readFileSync(crossing.filePath)

    let refusal: unknown = null
    try {
      crossing.store.write([...DISPLAY_ADDRESS, A_THIRD_TAB], DISPLAY_TIER, AN_UNSTATABLE_LEAF)
    } catch (thrown) {
      refusal = thrown
    }
    expect(refusal, 'a leaf value the parse cannot state is REFUSED at its own node — never committed and never repaired').not.toBeNull()
    const shape = refusal as { readonly status?: unknown }
    expect(shape.status, 'and it crosses as the package’s own constraint-refusal status').toBe('ConstraintPassRefused')

    // **THE FAMILY IS UNCHANGED, AND THAT IS THE WHOLE READING**: a body that repaired at the root would have replaced it with the
    // placeholder, taking both witnesses with it.
    expect(jsonOf(crossing.store.read([...DISPLAY_ADDRESS])), 'the standing family is unchanged — nothing was repaired at the root').toBe(
      valueBefore,
    )
    expect(
      crossing.store.read([...DISPLAY_ADDRESS]),
      'and it was NOT replaced by the module’s own placeholder, which is the arm a repair at the root would have produced',
    ).not.toEqual(displayPlaceholder())
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'the first sibling still stands at its leaf').toEqual(A_LAWFUL_ENTRY)
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_SIBLING_TAB]), 'and so does the second — the act took neither').toEqual(A_SIBLING_ENTRY)

    expect(readFileSync(crossing.filePath).equals(bytesBefore), 'and the profile’s bytes are unchanged: the refusal rolled back').toBe(true)
    expect(crossing.sinkAddresses, 'a refused leaf write delivers nothing').toEqual([])

    // **A WRITE BELOW A TAB ID, DRIVEN BECAUSE §2 SAYS "AT OR BELOW" — AND ITS MEASURED REACHABILITY IS WHY THIS ARM EXISTS.** At the
    // installed release the store's address domain is THREE segments, so `['display', <tabId>, documentId]` LANDS whenever that
    // tab's entry stands (measured on this construction), and the family's pair is an ancestor of it and is asked at that node. So
    // the arm is not hypothetical: without a member-level judgement here, a leaf write could put a value outside the domain into a
    // standing entry — and the family would then name an entry the parse cannot state, which is exactly `D-105`'s fault arriving one
    // route over. It is judged at its own node and, once more, NOT REPAIRED: the family must be byte-identical afterwards.
    const deeperValueBefore = jsonOf(crossing.store.read([...DISPLAY_ADDRESS]))
    let deeper: unknown = null
    try {
      crossing.store.write([...DISPLAY_ADDRESS, A_TAB, 'documentId'], DISPLAY_TIER, 7)
    } catch (thrown) {
      deeper = thrown
    }
    expect(deeper, 'a member write below a tab id carrying an unadmitted scalar is REFUSED at its own node').not.toBeNull()
    expect(
      (deeper as { readonly status?: unknown }).status,
      'and it is the family pair’s refusal — the pair is an ANCESTOR of the act’s address, so §2’s “judged at its own node” is the arm that answers here',
    ).toBe('ConstraintPassRefused')
    expect(jsonOf(crossing.store.read([...DISPLAY_ADDRESS])), 'and the family is unchanged after it: no repair ran at the root').toBe(
      deeperValueBefore,
    )
    expect(
      crossing.store.read([...DISPLAY_ADDRESS, A_TAB]),
      'the standing entry still carries the document stamp this row wrote — the member write changed nothing',
    ).toEqual(A_LAWFUL_ENTRY)


    // **THE POSITIVE CONTROL — "JUDGED AT ITS OWN NODE" IS NOT "A LEAF WRITE IS REFUSED"**: a lawful leaf still commits, still
    // delivers ITS OWN ADDRESS (the leaf, never the registered root) and leaves both standing siblings alone. Without this arm the
    // row above would be satisfied by a constraint that refused every leaf write.
    expect(crossing.record.commitTab(A_THIRD_TAB, A_THIRD_ENTRY), 'a lawful leaf write at a tab id still commits').toMatchObject({ ok: true })
    expect(
      tupleOf(crossing.sinkAddresses.at(-1) ?? []),
      'and it delivered the LEAF it landed at — the entry is registered at the ROOT and the pushed address is the write’s',
    ).toBe(tupleOf([...DISPLAY_ADDRESS, A_THIRD_TAB]))
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'with the two standing siblings untouched by it').toEqual(A_LAWFUL_ENTRY)
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_SIBLING_TAB]), 'both of them').toEqual(A_SIBLING_ENTRY)

  })
})
