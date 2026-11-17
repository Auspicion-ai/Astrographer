// tests/integration/record-engine/family-and-fanout.test.ts — the fix round's two LOW findings whose subjects are STRUCTURAL: the
// delivery's fan-out under a SUBSCRIBER THAT WRITES (`B1-ADV-08`) and the family object's runtime `tag` domain (`B1-ADV-09`).
//
// **B1-ADV-08 — RE-ENTRANCY.** A subscriber that writes re-entered the fan-out once per write and the recursion was unbounded
// (MEASURED: 380 levels → a `RangeError` inside the fan-out, the delivery truncated, and the outer `write` still answering
// `{ok: true}` because the entry body contains its own throw — so the failure was invisible to the caller). **The push is a SIGNAL
// whose only correct answer is a re-read** (`D-82`, §2's client paragraph), so a nested delivery is COALESCED rather than
// recursed: while a fan-out is in flight, a further delivery sets a pending flag and the OUTER fan-out runs ONE more pass after the
// sink. The row therefore measures FAN-OUT PASSES — the count a recursion inflates — and not merely that nothing threw: the throw
// is contained by design, which is exactly why "it did not crash" is not a reading.
//
// **B1-ADV-09 — THE TAG'S RUNTIME DOMAIN.** A spec whose `tag` is neither of the two literals (a typo, an absent tag) published a
// root with `declaration: null`: no creation repair ran, the family never stood, and every write then answered the store's own
// `AddressNotFound`. The type closes that at COMPILE time, but `DISPLAY_FAMILIES` is built at module scope from data a caller may
// one day hold at runtime, so `displayFamily` REFUSES an unknown tag with a thrown `TypeError` — a programming error, never a
// caller's input path. **THIS IS A DELIBERATE DIVERGENCE FROM THE DESIGN SOURCE**, which degrades silently into the unpaired arm;
// `docs/L2/record-engine/interface.md` §6 records it with this measurement.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT the leaf address a lawful write delivers, the arity of a
// subscriber, the fan-out-then-sink order or a two-member `AddressMalformed` (`delivery.test.ts`); NOT the withdrawn subscriber
// (`delivery.test.ts` `(c·withdraw)`); NOT the family's projections, its deferral or its narrowing (`family-object.test.ts` `FH-3`);
// NOT the tag's COMPILE-time refusals (`unit/spec-shape.fixture.ts`, measured by `FH-3 (e·refused)`); and NOT the creation's own
// repair (`display-record.test.ts` `(d)`).
//
// LAYER: `[T]`/envelope. A real store is constructed on a `mkdtempSync` path under `os.tmpdir()` and removed in `afterAll`; nothing
// here paints and nothing here is app-green.
import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createDisplayDelivery } from '../../../src/main/record-engine/delivery.js'
import { createDisplayRecord } from '../../../src/main/record-engine/record.js'
import {
  DISPLAY_ADDRESS,
  displayConstraintDeclarations,
  displayDeclaredRoots,
  displayFamily,
} from '../../../src/main/record-engine/display-family.js'
import { createProfileStore } from '../../../src/main/storeroom.js'

/** Every temp directory this file opened, so `afterAll` removes exactly what it made. */
const TEMP_DIRS: string[] = []

afterAll(() => {
  TEMP_DIRS.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

/** The tab this file seeds and the tab its subscribers write to: this file's own fixtures. */
const A_TAB = 'tab-seed'
const A_SUBSCRIBER_TAB = 'tab-from-subscriber'
const AN_ENTRY = { documentId: 'doc-seed' }

/** **THE FAN-OUT'S BOUND.** The contract asks for a BOUNDED number of passes, not for a particular number: two (the pass in flight
 *  and the ONE coalesced pass after the sink) is what the implementation runs, and this ceiling is what makes a recursion — which
 *  inflates the count once per write — a red rather than a slow green. */
const BOUNDED_PASSES = 4

interface Crossing {
  readonly store: ReturnType<typeof createProfileStore>
  readonly record: ReturnType<typeof createDisplayRecord>
  readonly delivery: ReturnType<typeof createDisplayDelivery>
  readonly sinkCalls: number[]
}

function buildCrossing(): Crossing {
  const dir = mkdtempSync(join(tmpdir(), 'record-engine-fanout-'))
  TEMP_DIRS.push(dir)
  const sinkCalls: number[] = []
  const delivery = createDisplayDelivery((...args: unknown[]) => {
    sinkCalls.push(args.length)
  })
  let holder: ReturnType<typeof createProfileStore> | null = null
  const store = createProfileStore({
    filePath: join(dir, 'profile.store'),
    listeners: [...delivery.entries],
    constraints: [...displayConstraintDeclarations(() => holder)] as never,
  })
  holder = store
  return { store, delivery, record: createDisplayRecord({ store, delivery }), sinkCalls }
}

describe('record-engine · B1-ADV-08 — a subscriber that WRITES is COALESCED, never recursed', () => {
  it('(fanout·one-write) · A SUBSCRIBER THAT WRITES ONCE SETTLES IN A BOUNDED NUMBER OF PASSES — and every sink call survives', () => {
    const crossing = buildCrossing()
    let passes = 0
    let writes = 0
    const release = crossing.delivery.subscribe(() => {
      passes += 1
      // ONE WRITE PER DELIVERY, which is the smallest re-entrancy there is: the write fires the listener from inside the fan-out.
      writes += 1
      crossing.record.commitTab(A_SUBSCRIBER_TAB, { documentId: `doc-${writes}` })
    })
    crossing.sinkCalls.length = 0

    let failure: unknown = null
    try {
      crossing.record.commitTab(A_TAB, AN_ENTRY)
    } catch (thrown) {
      failure = thrown
    }
    release()

    expect(failure, 'the write itself must not throw out of the record').toBeNull()
    expect(passes, 'the subscriber was served at all, so the reading below is not about a fan-out that never ran').toBeGreaterThan(0)
    expect(
      passes,
      `a nested delivery is COALESCED: the fan-out must run a BOUNDED number of passes (ceiling ${BOUNDED_PASSES}), never one per ` +
        `write in the chain — read ${passes}`,
    ).toBeLessThanOrEqual(BOUNDED_PASSES)
    expect(crossing.sinkCalls.length, 'and the sink heard the delivery rather than being truncated by an unbounded chain').toBeGreaterThan(0)
    expect(
      crossing.sinkCalls.length,
      `and the sink is not called once per coalesced write either: read ${crossing.sinkCalls.length} sink calls`,
    ).toBeLessThanOrEqual(BOUNDED_PASSES)
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'the outer write still landed, member for member').toEqual(AN_ENTRY)
  })

  it('(fanout·380) · A SUBSCRIBER THAT WRITES 380 TIMES STILL SETTLES BOUNDED — no `RangeError`, no truncated fan-out', () => {
    const crossing = buildCrossing()
    let passes = 0
    let wrote = false
    const release = crossing.delivery.subscribe(() => {
      passes += 1
      if (wrote) return
      // **THE MEASURED PRODUCER OF THE `RangeError`**: 380 writes inside ONE fan-out pass — each one fires the listener synchronously,
      // which under recursion is 380 nested fan-outs and a stack the engine gives up on.
      wrote = true
      for (let index = 0; index < 380; index += 1) {
        crossing.record.commitTab(A_SUBSCRIBER_TAB, { documentId: `doc-${index}` })
      }
    })
    crossing.sinkCalls.length = 0

    let failure: unknown = null
    try {
      crossing.record.commitTab(A_TAB, AN_ENTRY)
    } catch (thrown) {
      failure = thrown
    }
    release()

    // **THE THROW WAS CONTAINED BY THE ENTRY BODY, WHICH IS WHY THIS ROW DOES NOT MEASURE "IT THREW"**: the body contains its own
    // throw by contract (an uncontained one refuses a construction), so a `RangeError` inside the fan-out was INVISIBLE except as a
    // fan-out that stopped. The reading that sees it is the PASS COUNT, and a truncated chain is what the ceiling catches.
    expect(failure, 'no throw escapes the record, and that was true before the fix as well — it is not the measurement').toBeNull()
    expect(passes, 'the subscriber was served').toBeGreaterThan(0)
    expect(
      passes,
      `380 nested deliveries must COALESCE: the fan-out must run a BOUNDED number of passes (ceiling ${BOUNDED_PASSES}) instead of ` +
        `recursing once per write — read ${passes} passes for 381 deliveries`,
    ).toBeLessThanOrEqual(BOUNDED_PASSES)
    expect(crossing.sinkCalls.length, 'and the sink’s call for the outer write was not lost to a truncated chain').toBeGreaterThan(0)
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_TAB]), 'with the outer write standing in the store').toEqual(AN_ENTRY)
  })

  it('(fanout·control) · A SUBSCRIBER THAT DOES NOT WRITE STILL HEARS EVERY DELIVERY — coalescing must not swallow ordinary events', () => {
    // **THE CONTROL THAT KEEPS THE TWO ROWS ABOVE HONEST**: a coalescing implementation that simply stopped delivering would pass
    // every count above. A silent subscriber is served exactly once per delivery, and the sink exactly once with it.
    const crossing = buildCrossing()
    let passes = 0
    const release = crossing.delivery.subscribe(() => {
      passes += 1
    })
    crossing.sinkCalls.length = 0
    crossing.record.commitTab(A_TAB, AN_ENTRY)
    crossing.record.commitTab(A_SUBSCRIBER_TAB, AN_ENTRY)
    release()
    expect(passes, 'two writes are two deliveries, so the subscriber is served twice').toBe(2)
    expect(crossing.sinkCalls.length, 'and the sink twice: one delivery, one sink call').toBe(2)
  })
})

describe('record-engine · B1-ADV-09 — the family factory REFUSES an unknown `tag` at runtime (a DELIBERATE divergence)', () => {
  it('(tag·unknown) · A `tag` THAT IS NEITHER LITERAL THROWS A `TypeError` — a typo must not publish a family that degrades silently', () => {
    const subjects: readonly { readonly what: string; readonly spec: unknown }[] = [
      { what: 'a TYPO (`paire`)', spec: { tag: 'paire', address: ['a-subject'], tier: 'file', id: 'a-must-stand', body: () => () => true } },
      { what: 'an unknown word (`pair`)', spec: { tag: 'pair', address: ['a-subject'], tier: 'file', id: 'a-must-stand', body: () => () => true } },
      { what: 'an ABSENT tag', spec: { address: ['a-subject'], tier: 'file', id: 'a-must-stand', body: () => () => true } },
    ]
    subjects.forEach(({ what, spec }) => {
      let thrown: unknown = null
      try {
        displayFamily(spec as never)
      } catch (error) {
        thrown = error
      }
      // **A `TypeError` AND NOT A REFUSAL RECORD**: this is a PROGRAMMING error (a spec built against the type would not compile), so
      // it has no caller to answer with a record — it must be loud and it must be unreachable from an input path.
      expect(
        thrown instanceof TypeError,
        `\`displayFamily\` must THROW a \`TypeError\` for ${what}: it published a declaration-less root instead, which is the silent ` +
          `degradation this arm refuses (thrown: ${String(thrown)})`,
      ).toBe(true)

    })
  })

  it('(tag·lawful) · AND BOTH LAWFUL TAGS STILL CONSTRUCT — the refusal is not a shut door', () => {
    const paired = displayFamily({
      tag: 'paired',
      address: ['a-paired-subject'],
      tier: 'file',
      id: 'a-paired-must-stand',
      body: () => () => true,
    })
    expect(paired.declaration(() => null), 'the paired arm constructs and answers its declaration').not.toBeNull()
    const unpaired = displayFamily({ tag: 'unpaired', address: ['an-unpaired-subject'], tier: 'file' })
    expect(unpaired.declaration(() => null), 'and the unpaired arm constructs and answers the explicit `null`').toBeNull()
    // AND THE MODULE'S OWN TUPLE SURVIVED THE REFUSAL: `DISPLAY_FAMILIES` is built at module scope, so a factory that threw on a
    // lawful spec would have taken the whole module down with it.
    expect(displayDeclaredRoots().length, 'the module-scope tuple still publishes its roots').toBeGreaterThan(0)
  })
})
