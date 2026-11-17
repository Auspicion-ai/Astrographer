// tests/integration/record-engine/delivery.test.ts — unit `B-1` `record-engine-seam`'s red-set arms `(a)` and `(c)` plus the
// delivery's SINK and ARITY measurements (`docs/L1/unit-b-1-record-engine-seam.md` §5, §7's `D-26` items 1–2, `forking.md` §2.5's
// measured table at `:281-289`).
//
// **IT IS RED ON ARRIVAL AND THAT IS THE RED-FIRST EVIDENCE** (RCA-1): `createDisplayDelivery`, `createDisplayRecord`,
// `displayConstraintDeclarations` and the seam are §4 sites 1–4's and do not exist at this head, so the import fails and the run reds
// with it. No line here moves to make the tree compile.
//
// **WHAT THESE ARMS MEASURE, EACH IN §5's OWN WORDS**:
//   · `(a)` "A write at an admitted address commits and the delivery fires with the ADDRESS and no value" — ONE REAL CONSTRUCTION
//     (`createProfileStore({ filePath, listeners: [...createDisplayDelivery(sink).entries] })` on a temp-dir path), one `commitTab`,
//     and the sink's record read for the ADDRESS **and for how many arguments it was handed**. **THE ROW MEASURES WHETHER THE
//     DELIVERED ADDRESS IS THE LEAF `[…DISPLAY_ADDRESS, <tabId>]` OR THE REGISTERED ROOT `[…DISPLAY_ADDRESS]`** — §5 says this is
//     where our install answers, `forking.md` §2.5's table records a LEAF on the foundation's store, and §7's `D-26` item 2 makes
//     the leaf the contract. The row asserts the LEAF and quotes both readings in its own message, so a root answer reds with the
//     measurement in hand rather than as a mystery.
//   · `(c)` "The entry body writes nothing and contains its own throw" — a construction whose sink THROWS must still construct (an
//     uncontained throw at a registration instant refuses the act at rank 21 `ListenerBodyThrew`, and at the creation that is
//     `storeCreate` refusing), a throwing subscriber must starve no sibling, and one write must be ONE delivery and not one per
//     member.
//   · and the ARITY measurement §7's `D-26` item 1 pins: a subscriber is called at ARITY 0 and receives nothing, read with a
//     zero-parameter handler AND a rest-parameter handler, because a handler that reads a first argument would be reading
//     `undefined`.
//
// **THE SINK'S ADDRESS IS READ AS A TUPLE AND NEVER AS A JOINED STRING**, and the sink is declared with a REST parameter on purpose:
// "the address and no value" is measurable only by counting the arguments the delivery actually handed over.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT that the creation's own repair delivers — that is `(d)`,
// `display-record.test.ts`'s, and this file resets its sink log after construction for exactly that reason; NOT the entry
// admission or the family's sentence — `display-admission.test.ts`'s; NOT the entries↔roots relation — `declared-entries.test.ts`'s
// (`FH-1`/`FH-2`); NOT the family object — `family-object.test.ts`'s `FH-3`; NOT the renderer client — `display-client.test.ts`'s;
// NOT a handle's spelling, which is a module counter; and NOT the store's own status vocabulary beyond the one refusal §5 names
// (`AddressMalformed`), which is asserted against a THROWAWAY construction rather than inferred from a shape of this file's
// invention.
//
// LAYER: `[T]`/envelope. A real store is constructed on a `mkdtempSync` path under `os.tmpdir()` and removed in `afterAll`; nothing
// here paints and nothing here is app-green.
import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createDisplayDelivery } from '../../../src/main/record-engine/delivery.js'
import { createDisplayRecord } from '../../../src/main/record-engine/record.js'
import { DISPLAY_ADDRESS, displayConstraintDeclarations } from '../../../src/main/record-engine/display-family.js'
import { createProfileStore } from '../../../src/main/storeroom.js'

/** **ONE ADDRESS AS A COMPARABLE TUPLE — AND NEVER `join('/')`**: `['a/b']` and `['a', 'b']` are two DIFFERENT addresses sharing
 *  one joined spelling, so a joined comparison would call the ROOT a match for the LEAF that shares its prefix. */
const tupleOf = (address: readonly string[]): string => JSON.stringify([...address])

/** One value's byte spelling, for the readings that must be byte-identical rather than merely deep-equal. */
const jsonOf = (value: unknown): string => JSON.stringify(value)

/** The tab this row writes to, and the entry it writes: both are THIS FILE'S fixtures and neither is a module figure. §2 fixes
 *  the key to be the ADDRESS SEGMENT and never a stored `tabId`, so the id appears only in the address. */
const A_TAB = 'tab-a'
const AN_ENTRY = { documentId: 'doc-a', view: { offset: 40, section: 'sec-1' } }

/** Every temp directory this file opened, so `afterAll` removes exactly what it made and nothing else. */
const TEMP_DIRS: string[] = []

afterAll(() => {
  TEMP_DIRS.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

/** ONE SINK CALL AS THE DELIVERY ACTUALLY MADE IT — the address AND the argument count, because "the address and NO VALUE" is a
 *  reading about the arguments handed over and not about the first of them. */
interface SinkCall {
  readonly address: readonly string[]
  readonly argumentCount: number
}

/** A real construction: a temp-dir `filePath`, the delivery's OWN entries adopted at the one construction, and the family's
 *  declarations registered so the family STANDS for a leaf write to land (a nested write does not create its parent). */
interface RealConstruction {
  readonly store: ReturnType<typeof createProfileStore>
  readonly delivery: ReturnType<typeof createDisplayDelivery>
  readonly filePath: string
  readonly sinkCalls: SinkCall[]
}

function buildRealConstruction(options: { readonly sinkThrows?: boolean } = {}): RealConstruction {
  const dir = mkdtempSync(join(tmpdir(), 'record-engine-delivery-'))
  TEMP_DIRS.push(dir)
  const filePath = join(dir, 'profile.store')
  const sinkCalls: SinkCall[] = []
  // THE SINK IS DECLARED WITH A REST PARAMETER ON PURPOSE: the measurement is `argumentCount`, so a sink handed a reading or a value
  // beside the address would show it rather than silently read only the first argument.
  const delivery = createDisplayDelivery((...args: unknown[]) => {
    const first = args[0]
    sinkCalls.push({
      address: Array.isArray(first) ? first.map((segment) => String(segment)) : [],
      argumentCount: args.length,
    })
    if (options.sinkThrows === true) throw new Error('the sink refused this delivery')
  })
  let holder: ReturnType<typeof createProfileStore> | null = null
  const store = createProfileStore({
    filePath,
    listeners: [...delivery.entries],
    constraints: [...displayConstraintDeclarations(() => holder)] as never,
  })
  holder = store
  return { store, delivery, filePath, sinkCalls }
}

describe('record-engine · arm (a) — a write at an admitted address delivers the TRIGGERING address and no value', () => {
  it('(a·entry) · THE DELIVERY REGISTERS ITS ENTRIES AT THE FAMILY ROOT — the registered address is the root, and the DELIVERED one is what (a) measures', () => {
    const delivery = createDisplayDelivery(() => undefined)
    expect(delivery.entries.length, 'the delivery carries at least one entry, or there is nothing to register').toBeGreaterThan(0)
    delivery.entries.forEach((entry) => {
      // THE ROOT IS THE REGISTERED ADDRESS (`D-137`'s "a root the array omits is a write the renderer never hears") — and the fact
      // that a LEAF write delivers a LEAF is the next arm's, not this one's.
      expect(
        tupleOf(entry.address),
        'each entry is registered at the FAMILY ROOT the publication declares, compared as a tuple',
      ).toBe(tupleOf([...DISPLAY_ADDRESS]))
      expect(typeof entry.handle, 'and it carries a handle, which is the package’s registration name for it').toBe('string')
      expect(typeof entry.listener, 'and the THIRD member, which a two-member element is refused for lacking').toBe('function')
    })
  })

  it('(a) · THE WRITE COMMITS AND THE SINK HEARS THE TRIGGERING ADDRESS — the LEAF, never the registered ROOT, and with NO value', () => {
    const construction = buildRealConstruction()
    const record = createDisplayRecord({ store: construction.store, delivery: construction.delivery })
    // THE CREATION'S OWN DELIVERY IS `(d)`'s SUBJECT AND NOT THIS ARM'S (`display-record.test.ts`), so the log is reset AFTER the
    // construction and the readings below are all about the ONE write this arm drives.
    construction.sinkCalls.length = 0

    const answer = record.commitTab(A_TAB, AN_ENTRY) as unknown
    expect((answer as { readonly ok?: unknown }).ok, 'the write at an admitted address COMMITS (§5(a): "a write at an admitted address commits")').toBe(
      true,
    )
    expect(construction.sinkCalls.length, 'and it fires the delivery exactly ONCE — one write is one event').toBe(1)
    const call = construction.sinkCalls[0]
    expect(call, 'the sink was called at all, so the entry the construction adopted is the entry the write reached').toBeDefined()
    if (call === undefined) return // the assertion above is the arm; this is the compiler's arm

    const leaf = [...DISPLAY_ADDRESS, A_TAB]
    // **THIS IS THE MEASUREMENT §5(a) ASKS FOR, AND ITS MESSAGE CARRIES BOTH READINGS**: the delivered address is the LEAF the write
    // landed at (`forking.md` §2.5's table records a leaf on the foundation's store, and §7's `D-26` item 2 makes it the contract),
    // while the address the entry is REGISTERED at is the root. A store that delivered the root would red HERE with the reading in
    // hand.
    expect(
      tupleOf(call.address),
      `the delivered address must be the TRIGGERING LEAF \`${tupleOf(leaf)}\`: the entry is registered at the ROOT \`${tupleOf([...DISPLAY_ADDRESS])}\` ` +
        `and the row MEASURES which one arrives — measured \`${tupleOf(call.address)}\``,
    ).toBe(tupleOf(leaf))
    // AND IT IS NOT THE ROOT — asserted separately, because "the leaf arrived" and "the root did not" are the two halves of §7's
    // item 2 and a root answer would satisfy neither.
    expect(tupleOf(call.address), 'and it is NOT the registered root: a consumer routes on a PREFIX of the delivered address').not.toBe(
      tupleOf([...DISPLAY_ADDRESS]),
    )
    // **NO VALUE**: the delivery carries the address and nothing beside it. A reading, a family or a formatted value as a second
    // argument would be the second authority the design forbids.
    expect(call.argumentCount, 'the sink is handed the ADDRESS and NO VALUE — exactly one argument, never the address plus a reading').toBe(1)
  })

  it('(a·arity) · A SUBSCRIBER IS CALLED AT ARITY 0 AND RECEIVES NOTHING — read with a zero-parameter handler and with a REST-PARAMETER one', () => {
    const construction = buildRealConstruction()
    const record = createDisplayRecord({ store: construction.store, delivery: construction.delivery })
    const zeroSeen: number[] = []
    const restSeen: number[] = []
    const releaseZero = construction.delivery.subscribe(function (this: unknown) {
      zeroSeen.push(arguments.length)
    })
    const releaseRest = construction.delivery.subscribe(function (...args: unknown[]) {
      restSeen.push(args.length)
    })
    construction.sinkCalls.length = 0
    expect(record.commitTab(A_TAB, AN_ENTRY), 'the write commits, so the delivery has a reason to fan out').toMatchObject({ ok: true })

    expect(zeroSeen.length, 'the zero-parameter subscriber was called once for the one delivery').toBe(1)
    expect(restSeen.length, 'and the rest-parameter subscriber was called once as well, so the reading is not one handler’s luck').toBe(1)
    // §7's `D-26` item 1: "the handler is invoked with zero arguments and the ROW asserts `arguments.length === 0` (a rest-parameter
    // handler too), because a handler that reads a first argument is reading `undefined`".
    expect(zeroSeen[0], 'a subscriber is called at ARITY 0 — it is handed no address, no value and no reading').toBe(0)
    expect(restSeen[0], 'and a rest-parameter subscriber collects zero arguments, which is the same reading from the other side').toBe(0)
    releaseZero()
    releaseRest()
  })

  it('(a·order) · THE FAN-OUT RUNS FIRST AND THE SINK AFTER IT — one event with two readings, never two code paths', () => {
    // THE ORDER IS READ ON A CONSTRUCTION WHOSE SINK IS THIS ARM'S OWN, because the shared helper's sink records rather than sequences:
    // two readings of ONE event, so the array below is the whole claim.
    const dir = mkdtempSync(join(tmpdir(), 'record-engine-delivery-order-'))
    TEMP_DIRS.push(dir)
    const ordering: string[] = []
    const orderingDelivery = createDisplayDelivery(() => {
      ordering.push('sink')
    })
    let holder: ReturnType<typeof createProfileStore> | null = null
    const store = createProfileStore({
      filePath: join(dir, 'profile.store'),
      listeners: [...orderingDelivery.entries],
      constraints: [...displayConstraintDeclarations(() => holder)] as never,
    })
    holder = store
    // THE CREATION'S OWN DELIVERY IS `(d)`'s SUBJECT AND NOT THIS ARM'S, so the sequence starts after the construction.
    ordering.length = 0
    const orderedRecord = createDisplayRecord({ store, delivery: orderingDelivery })
    const orderedRelease = orderingDelivery.subscribe(() => {
      ordering.push('subscriber')
    })
    expect(orderedRecord.commitTab(A_TAB, AN_ENTRY), 'the ordering construction’s write commits').toMatchObject({ ok: true })
    expect(ordering, 'the fan-out runs BEFORE the sink on every delivery (§5(a): "the fan-out first, then the sink")').toEqual(['subscriber', 'sink'])
    orderedRelease()
  })
})

describe('record-engine · arm (c) — the entry body writes nothing and contains its own throw', () => {
  it('(c) · A THROWING SINK DOES NOT REFUSE THE CONSTRUCTION AND DOES NOT REFUSE THE WRITE — the body contains its own throw', () => {
    // **IF THE THROW ESCAPED, THE CONSTRUCTION ITSELF WOULD BE REFUSED** at rank 21 `ListenerBodyThrew` (`forking.md` §2.5: "at a
    // registration instant an uncontained one refuses the construction, which is this app's fatal arm"). So the assertion that the
    // construction ANSWERED is the containment reading, and the sink's own record is what proves the throw really happened.
    const construction = buildRealConstruction({ sinkThrows: true })
    expect(construction.sinkCalls.length, 'the creation repair delivered and the throwing sink was REALLY invoked, so containment is not vacuous').toBeGreaterThan(
      0,
    )
    const record = createDisplayRecord({ store: construction.store, delivery: construction.delivery })
    construction.sinkCalls.length = 0

    let answer: unknown = null
    expect(() => {
      answer = record.commitTab(A_TAB, AN_ENTRY)
    }, 'a throwing sink must not refuse the write: the throw stops inside the entry body').not.toThrow()
    expect((answer as { readonly ok?: unknown } | null)?.ok, 'and the write COMMITS — a sink’s failure is the sink’s').toBe(true)
    expect(construction.sinkCalls.length, 'the sink threw again on this delivery, so the containment was exercised a second time').toBe(1)
    // AND THE BODY WROTE NOTHING: one write is ONE delivery, and the standing value at the leaf is exactly the entry the RECORD
    // passed — a body that wrote would open a commit inside the commit that fired it. **`toEqual`, NOT TWO STRINGS**: the store
    // CANONICALISES member order on every round trip (`docs/L2/record-engine/interface.md` §6), so a read-back is compared member for
    // member and never as a canonicalised string against this file's literal — that comparison would be green by coincidence here
    // (`documentId` sorts before `view`) and red the moment a member sorted otherwise.
    expect(
      construction.store.read([...DISPLAY_ADDRESS, A_TAB]),
      'the body writes nothing: the leaf holds the entry the record wrote and no value of the delivery’s own',
    ).toEqual(AN_ENTRY)
  })

  it('(c·sibling) · A THROWING SUBSCRIBER STARVES NO SIBLING AND DOES NOT STOP THE SINK', () => {
    const construction = buildRealConstruction()
    const record = createDisplayRecord({ store: construction.store, delivery: construction.delivery })
    const served: string[] = []
    const releaseThrowing = construction.delivery.subscribe(() => {
      throw new Error('this subscriber refuses every delivery')
    })
    const releaseServed = construction.delivery.subscribe(() => {
      served.push('served')
    })
    construction.sinkCalls.length = 0
    expect(record.commitTab(A_TAB, AN_ENTRY), 'the write commits even though a subscriber throws').toMatchObject({ ok: true })
    expect(served, 'the standing sibling was still served — a thrower loses only its own call').toEqual(['served'])
    expect(construction.sinkCalls.length, 'and the sink was called after it, so the throw stopped at the fan-out').toBe(1)
    releaseThrowing()
    releaseServed()
  })

  it('(c·withdraw) · THE WITHDRAWAL IS LOCAL, IDEMPOTENT AND RUNS NO STORE VERB — and a withdrawn subscriber hears nothing', () => {
    const construction = buildRealConstruction()
    const record = createDisplayRecord({ store: construction.store, delivery: construction.delivery })
    const heard: string[] = []
    const release = construction.delivery.subscribe(() => {
      heard.push('heard')
    })
    construction.sinkCalls.length = 0
    release()
    // THE WITHDRAWAL RAN NO STORE VERB: nothing was written, so nothing was delivered, and the standing family is untouched.
    expect(construction.sinkCalls.length, 'a withdrawal delivers nothing — it runs no store verb, the registration is the construction’s').toBe(0)
    expect(() => release(), 'and a second withdrawal is not an error: the removal is idempotent by declaration').not.toThrow()

    expect(record.commitTab(A_TAB, AN_ENTRY), 'the write after the withdrawal still commits').toMatchObject({ ok: true })
    expect(heard, 'and the withdrawn subscriber heard nothing, while the sink (which is not a subscriber) still did').toEqual([])
    expect(construction.sinkCalls.length, 'the sink is the construction’s own registration and no subscription can withdraw it').toBe(1)
  })
})

describe('record-engine · the ENTRY SHAPE is the package’s to refuse — a two-member element never reaches a filesystem act', () => {
  it('(entry) · A TWO-MEMBER ELEMENT IS REFUSED `AddressMalformed` BY THE PACKAGE, before the file is created', () => {
    // **THIS ARM ASSERTS THE PACKAGE'S OWN REFUSAL AND NEVER A SHAPE OF THIS FILE'S INVENTION** (§5's instruction, `forking.md` §2.5:
    // "a two-member element is refused `AddressMalformed` before any filesystem act"): the entry is the delivery's REAL one, thinned
    // to `{ address, handle }`, and the construction is a THROWAWAY one on a fresh path so nothing else can answer.
    const [entry] = createDisplayDelivery(() => undefined).entries
    expect(entry, 'the delivery answers an entry, so there is a real address and a real handle to thin').toBeDefined()
    if (entry === undefined) return
    const thinned = { address: entry.address, handle: entry.handle }

    const dir = mkdtempSync(join(tmpdir(), 'record-engine-delivery-refusal-'))
    TEMP_DIRS.push(dir)
    const filePath = join(dir, 'profile.store')
    let refusal: unknown = null
    try {
      createProfileStore({ filePath, listeners: [thinned] })
    } catch (thrown) {
      refusal = thrown
    }
    expect(refusal, 'the construction REFUSES an element with no `listener`: the third member is required and this is not a shape a caller may thin').not.toBeNull()
    const shape = refusal as { readonly status?: unknown; readonly address?: unknown }
    // THE PACKAGE'S OWN CODE, spelled because §5(b)/`forking.md` §2.5 name it as THE refusal of this position — it is the package's
    // public vocabulary and not a figure this module derives.
    expect(shape.status, 'the refusal is the package’s `AddressMalformed`, the code it declares for this position').toBe('AddressMalformed')
    expect(
      readdirSync(dir),
      'and the refusal precedes the construction’s FIRST FILESYSTEM ACT: no file was opened for an element the store cannot register',
    ).toEqual([])
  })
})
