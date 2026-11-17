// tests/integration/record-engine/declared-entries.test.ts — rows `FH-1` and `FH-2` for THIS fork's first record crossing: THE
// DELIVERY'S ENTRY ADDRESSES AGAINST THE PUBLISHED ROOTS (`docs/L1/unit-b-1-record-engine-seam.md` §5's `FH-1`/`FH-2`,
// `forking.md` §2.5 `:221-228`).
//
// **IT IS RED ON ARRIVAL AND THAT IS THE RED-FIRST EVIDENCE** (RCA-1): `createDisplayDelivery` and `displayDeclaredRoots()` are
// §4 sites 3 and 4's and do not exist at this head, so the import fails and the run reds with it. No line here moves to make the
// tree compile.
//
// **WHAT THIS ROW IS, AND WHAT IT IS NOT.** `createDisplayDelivery(sink).entries` and `displayDeclaredRoots()` are TWO SEPARATE
// LISTS on purpose: §3 records that the delivery's address tuple is NOT derived from the family tuple ("the tuple is NOT derived
// from it — so the entries↔roots row compares two independent lists"), and that independence is the only thing that makes this
// comparison evidence rather than an identity. **SO THE ROW PROVES INDEPENDENCE AND NOT AGREEMENT**: it reds when an address is
// dropped from or duplicated in EITHER list — the half-edit §7's `D-26` item 3 names as this unit's whole arbitration — and it
// CANNOT catch a WRONG address spelled in both lists, which would pass every arm here. That limit is stated rather than left to
// be discovered, and `forking.md` §2.5 records it for the foundation's two rows in the same words.
//
// **OUR CENSUS IS 1 × 1, SO `FH-2`'S STRENGTH IS THE OPERATIVE ONE.** This unit declares ONE family and ONE delivered address, so
// the two directions of the set comparison are NOT a partition at this cardinality — one mismatch is named by BOTH subtractions
// of one comparison — and the arms that actually bite are `FH-2 (b)` (the count, the one relation a `Set` cannot see) and the
// falsifier's divergent pairs. A reader must not count `(a)`'s two direction names as two independent readings, and `FH-2 (f)`
// says so at its own site. **`FH-1` IS KEPT BESIDE IT ANYWAY** because the two names are what a failure is READ by, and because
// `forking.md` §2.5's shape is the one the next family added to this crossing will inherit.
//
// **AND THE FALSIFIER'S DROP IS BY ADDRESS AND NEVER BY INDEX**: the entries' internal order is consumed by nothing and is not
// this row's to assert, so an order-sensitive harness would smuggle in the one assertion the design forbids — green by luck on a
// re-ordered list and red on an honest one.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT `declaration ↔ root` — no row of this unit owns it and
// the foundation's `tests/integration/central-data/declared-root.test.ts` owns it there; NOT the root count, a tier value or an id
// value, which no row of this unit states; NOT a handle's spelling, which is a module counter (`'record-engine:' + ordinal + '@' +
// address.join('/')`); NOT the entries' ORDER and not the two deliveries' relative order; NOT the element's three-member SHAPE —
// a two-member element is the PACKAGE's to refuse `AddressMalformed` before any filesystem act, and `delivery.test.ts` drives that
// reading against a real construction rather than copying it here; and NOT a store, a boot, a subscription or a write — both
// builders run no store verb (§3: the object DECLARES and never registers).
//
// LAYER: `[T]`/envelope. No store is constructed here and nothing paints.
import { describe, expect, it } from 'vitest'

import { createDisplayDelivery } from '../../../src/main/record-engine/delivery.js'
import { displayDeclaredRoots } from '../../../src/main/record-engine/display-family.js'

/** **ONE ADDRESS AS A COMPARABLE TUPLE — AND NEVER `join('/')`**: the store's address space is a tuple of segments, so `['a/b']`
 *  and `['a', 'b']` are two DIFFERENT addresses sharing one joined spelling; a joining comparator would call a spurious entry a
 *  match and this row would pass over the very defect it exists for. `JSON.stringify` of the ARRAY is the tuple's own spelling,
 *  quoted so a nested segment cannot alias. */
const tupleOf = (address: readonly string[]): string => JSON.stringify([...address])

/** **THE VERDICT — BOTH DIRECTIONS AND THE COUNT, FROM ONE FUNCTION.** Every arm of `(a)`/`(b)` and every control under `(f)`
 *  reads THIS object: the row carries no set assertion of its own and the falsifier carries no copy of one, which is the only
 *  shape in which a control can prove the row it controls. */
interface EntriesRootsVerdict {
  /** A root with NO entry — `D-137`'s never-hears, the omission direction. */
  readonly omitted: readonly string[]
  /** An entry with NO published root — an address this module delivers that nothing publishes, which no guard is ever handed. */
  readonly spurious: readonly string[]
  /** MULTIPLICITY — the one relation a `Set` cannot see, and the one the store does not refuse (duplicates are KEPT). */
  readonly counts: { readonly entries: number; readonly roots: number; readonly equal: boolean }
  /** `true` only when the two directions are empty AND the counts agree. */
  readonly ok: boolean
}

/** **`entries ↔ roots`, AS A SET EQUALITY IN BOTH DIRECTIONS PLUS A COUNT** — one function, so the rows and their falsifier cannot
 *  drift: `omitted` is roots minus entries and `spurious` is entries minus roots, and neither can be satisfied by the other. **AT
 *  THIS ROW'S CARDINALITY THEY NAME THE SAME PAIR** — one address per side — which is the limit `FH-2` states at its own site. */
function compareEntriesToRoots(
  entryAddresses: readonly (readonly string[])[],
  rootAddresses: readonly (readonly string[])[],
): EntriesRootsVerdict {
  const entryTuples = new Set(entryAddresses.map(tupleOf))
  const rootTuples = new Set(rootAddresses.map(tupleOf))
  const omitted = [...rootTuples].filter((tuple) => !entryTuples.has(tuple))
  const spurious = [...entryTuples].filter((tuple) => !rootTuples.has(tuple))
  const counts = {
    entries: entryAddresses.length,
    roots: rootAddresses.length,
    equal: entryAddresses.length === rootAddresses.length,
  }
  return { omitted, spurious, counts, ok: omitted.length === 0 && spurious.length === 0 && counts.equal }
}

/** **THE TWO SIDES, READ ONCE AND OFF THE MODULE'S OWN EXPORTS**: the entries through the builder the construction calls, with a
 *  sink that RECORDS NOTHING because this row's subject is the addresses and not the push, and the roots through the projection the
 *  family publishes. **NEITHER LIST IS FILTERED OR SORTED ON ITS WAY IN** — the ADDRESS is projected out of each element and that is
 *  all — so nothing is dropped to make the row green. */
const delivered = createDisplayDelivery(() => undefined).entries
const published = displayDeclaredRoots()
const ENTRY_ADDRESSES: readonly (readonly string[])[] = delivered.map((entry) => entry.address)
const ROOT_ADDRESSES: readonly (readonly string[])[] = published.map((root) => root.address)

describe('record-engine · FH-1 — the delivery’s entry addresses against the published roots', () => {
  it('FH-1 (a) · SET EQUALITY OF THE TWO ADDRESS LISTS, BOTH DIRECTIONS — no root without an entry, and no entry without a root', () => {
    const verdict = compareEntriesToRoots(ENTRY_ADDRESSES, ROOT_ADDRESSES)
    // THE OMISSION DIRECTION: a published root the entry list omits is a write the renderer NEVER HEARS (`D-137`), and it is the
    // half-edit §7's `D-26` item 3 makes this unit's arbitration.
    expect(
      verdict.omitted,
      'a published root with no listener is `D-137`’s never-hears — the entry list and the publication must name the same addresses',
    ).toEqual([])
    // THE SPURIOUS DIRECTION: an entry at an address nothing publishes is a listener no guard is ever handed, so nothing judges a
    // write at it.
    expect(
      verdict.spurious,
      'an entry at an address no root declares is a listener the declared-tier guard cannot judge — both directions are the claim',
    ).toEqual([])
  })

  it('FH-1 (a) · AND THE COMPARISON IS NOT VACUOUS — both sides carry at least one address, so `a` is not the empty set matching itself', () => {
    // A FLOOR AND NOT THE FIGURE: HOW MANY roots there are is no row of this unit's to state, and this row derives every figure it
    // reads. What it refuses is the degenerate reading — two emptied lists compare equal, which is the one way to lose the evidence.
    expect(ENTRY_ADDRESSES.length, 'the delivery builds at least one entry, or (a) compares nothing with nothing').toBeGreaterThan(0)
    expect(ROOT_ADDRESSES.length, 'the publication carries at least one root, or (a) compares nothing with nothing').toBeGreaterThan(0)
  })

  it('FH-1 (f) · **THE FALSIFIER — THE ROW CAN STILL RED**: the same comparator, driven over deliberately divergent pairs before it is trusted; a row that cannot fail is a deleted row wearing a new name', () => {
    // ═══ EVERY ARM BELOW USES THE ROW'S OWN COMPARATOR. There is no second copy of the logic in this block, which is the point of
    // (f): a control written beside a set assertion proves that the CONTROL can fail, not that the row can.
    const honest = compareEntriesToRoots(ENTRY_ADDRESSES, ROOT_ADDRESSES)

    // (i) THE SAME TWO LISTS COMPARED WITH THEMSELVES ARE ADMITTED — the comparator is not simply always-red, and this is the arm
    //     that keeps (a)'s green honest.
    expect(compareEntriesToRoots(ROOT_ADDRESSES, ROOT_ADDRESSES).ok, 'identical lists are admitted, so the comparator has two arms').toBe(true)
    expect(honest.ok, 'and the delivery as it stands is admitted by the same function the falsifier drives').toBe(true)

    // (ii) AN OMITTED ENTRY REDS THE OMISSION DIRECTION — named as a tuple, never merely counted. **THE PAIR IS THE FALSIFIER'S OWN
    //      AND IS NOT CUT OUT OF THE TWO LISTS**, because a drop BY INDEX only reds after assuming the two lists are aligned element
    //      for element — the entries' order, consumed by nothing and not this row's to assert — so that assumption would arrive
    //      through the control as the one assertion the design forbids. (vi) drives the same relation over the REAL lists, by address.
    const omittedOne = compareEntriesToRoots([['b'], ['c']], [['a'], ['b'], ['c']])
    expect(omittedOne.ok, 'a delivery missing an entry MUST fail').toBe(false)
    expect(omittedOne.omitted, 'and the missing root is NAMED as a tuple').toEqual([tupleOf(['a'])])
    expect(omittedOne.spurious, 'and nothing is supplied that no root declares, so the direction that reds here is the omission one').toEqual([])

    // (iii) A SPURIOUS ENTRY REDS THE OTHER DIRECTION — appended to the REAL entry list, so the real publication is the thing being
    //       failed.
    const spuriousOne = compareEntriesToRoots([...ENTRY_ADDRESSES, ['not-a-declared-root']], ROOT_ADDRESSES)
    expect(spuriousOne.ok, 'an entry at an address no root declares MUST fail').toBe(false)
    expect(spuriousOne.omitted, 'and the direction is the spurious one — no root is missing in this pair').toEqual([])
    expect(spuriousOne.spurious, 'while the undeclared address is NAMED').toEqual([tupleOf(['not-a-declared-root'])])

    // (iv) A DUPLICATE LEAVES THE SETS EQUAL AND REDS THE COUNT — which is why (a) and (b) are two arms and not one, at EVERY
    //      non-zero cardinality, this row's included (duplicates are KEPT by the store, never refused).
    const duplicated = compareEntriesToRoots([...ENTRY_ADDRESSES, ENTRY_ADDRESSES[0] as readonly string[]], ROOT_ADDRESSES)
    expect(duplicated.omitted, 'a duplicate hides in the set comparison, exactly as the row says it does').toEqual([])
    expect(duplicated.spurious, 'and it is not a spurious address either — it is multiplicity').toEqual([])
    expect(duplicated.counts.equal, 'so ONLY the count arm can read it').toBe(false)
    expect(duplicated.ok, 'and the verdict as a whole MUST fail').toBe(false)

    // (v) A JOINED COMPARATOR WOULD CALL THIS A MATCH AND THIS ONE DOES NOT — the arm the tuple rule exists for: one segment carrying a
    //     separator against two segments that share its `join('/')` spelling.
    const joinedCollision = compareEntriesToRoots([['a/b']], [['a', 'b']])
    expect(joinedCollision.ok, 'a separator inside a segment is a DIFFERENT address and never a match').toBe(false)
    expect(joinedCollision.omitted, 'the root is missing under the tuple spelling').toEqual([tupleOf(['a', 'b'])])
    expect(joinedCollision.spurious, 'and the entry is spurious under it').toEqual([tupleOf(['a/b'])])

    // (vi) **NO ARM OF THE PUBLICATION MAY BE FILTERED OUT TO MAKE THIS ROW GREEN** — every published root participates: dropping the
    //      entry at its own ADDRESS reds the omission direction and names it. **THE DROP IS BY ADDRESS AND NEVER BY INDEX.**
    ROOT_ADDRESSES.forEach((address) => {
      const withoutIt = compareEntriesToRoots(
        ENTRY_ADDRESSES.filter((entry) => tupleOf(entry) !== tupleOf(address)),
        ROOT_ADDRESSES,
      )
      expect(withoutIt.ok, `dropping the entry at ${tupleOf(address)} MUST fail — every published root is compared`).toBe(false)
      expect(withoutIt.omitted, 'and that root is the one named').toContain(tupleOf(address))
    })
  })
})

describe('record-engine · FH-2 — the same relation read at THIS crossing’s 1 × 1 cardinality, where the count and the falsifier are what bite', () => {
  it('FH-2 (a) · THE ONE DELIVERED ADDRESS AND THE ONE PUBLISHED ADDRESS ARE THE SAME TUPLE — and both sides are non-empty, so the arm is not two emptied lists', () => {
    const verdict = compareEntriesToRoots(ENTRY_ADDRESSES, ROOT_ADDRESSES)
    expect(ENTRY_ADDRESSES.length, 'the delivery builds at least one entry, or the comparison has no subject').toBeGreaterThan(0)
    expect(ROOT_ADDRESSES.length, 'the publication carries at least one root, or the comparison has no subject').toBeGreaterThan(0)
    expect(verdict.omitted, 'no published root stands without an entry — at 1 × 1 this is the ONE address and it is named').toEqual([])
    expect(verdict.spurious, 'and no entry stands at an address nothing publishes').toEqual([])
  })

  it('FH-2 (b) · MULTIPLICITY — `entries.length` equals `roots.length`, the one relation a `Set` equality cannot see, and the load-bearing arm at 1 × 1', () => {
    // A DUPLICATE IS KEPT BY THE STORE AND IS INVISIBLE TO (a): two entries at one address collapse into one `Set` member, so the set
    // equality stands while the delivery registers the same address twice. **AT 1 × 1 THIS IS THE ONLY ARM THAT CAN SAY SO.**
    const verdict = compareEntriesToRoots(ENTRY_ADDRESSES, ROOT_ADDRESSES)
    expect(delivered.length, 'one listener per published root, not two at one address and none at another').toBe(published.length)
    expect(verdict.counts.equal, 'the verdict’s own count arm agrees with the lengths asserted above').toBe(true)
  })

  it('FH-2 (b·not-a-partition) · THE TWO DIRECTIONS ARE ONE COMPARISON AT THIS CARDINALITY — a single mismatch is named by BOTH subtractions, which is the limit this row states rather than hides', () => {
    // **THE ARM THAT KEEPS A READER FROM COUNTING TWO READINGS THAT CANNOT DIFFER IN KIND**: one address per side, so a divergence is one
    // fault and it appears in `omitted` AND in `spurious` at once. The foundation's view row has four addresses and its directions can
    // differ; ours cannot, and saying so is part of the row (`FH-2`'s own docblock in the foundation says the same of the tab crossing).
    const divergence = compareEntriesToRoots([['delivered']], [['published']])
    expect(divergence.counts.equal, 'the LENGTHS still agree, so the count cannot see this pair').toBe(true)
    expect(divergence.omitted, 'the published address is missing from the delivery').toEqual([tupleOf(['published'])])
    expect(divergence.spurious, 'and the delivered address is spurious against the publication — the SAME fault, read twice').toEqual([
      tupleOf(['delivered']),
    ])
    expect(divergence.ok, 'so the verdict as a whole fails, and it fails for one reason and not two').toBe(false)
  })

  it('FH-2 (f) · **THE FALSIFIER DRIVEN OVER THE REAL LISTS AT 1 × 1** — omission, spurious entry, duplicate and tuple collision each red this row’s own comparator', () => {
    // ═══ THE FALSIFIER IS THIS ROW'S LOAD-BEARING ARM (forking.md §2.5, `:226-228`): `(a)` and `(b)` are green on arrival by
    // construction once the module lands, so their whole bite is here.
    const honest = compareEntriesToRoots(ENTRY_ADDRESSES, ROOT_ADDRESSES)
    expect(honest.ok, 'the delivery as it stands is admitted by the same function every control below drives').toBe(true)

    // (i) OMISSION — the real entry list with the real root's address removed FROM IT.
    ROOT_ADDRESSES.forEach((address) => {
      const omitted = compareEntriesToRoots(
        ENTRY_ADDRESSES.filter((entry) => tupleOf(entry) !== tupleOf(address)),
        ROOT_ADDRESSES,
      )
      expect(omitted.ok, `omitting the entry at ${tupleOf(address)} MUST fail`).toBe(false)
      expect(omitted.omitted, 'and the omitted root is NAMED').toEqual([tupleOf(address)])
    })

    // (ii) SPURIOUS — the real entry list with one address the publication does not carry.
    const spurious = compareEntriesToRoots([...ENTRY_ADDRESSES, ['not-a-declared-root']], ROOT_ADDRESSES)
    expect(spurious.ok, 'an entry at an address no root publishes MUST fail').toBe(false)
    expect(spurious.spurious, 'and it is the spurious direction that names it').toEqual([tupleOf(['not-a-declared-root'])])

    // (iii) DUPLICATE — the sets stay equal and ONLY the count reds, which is the arm `FH-2 (b)` exists for.
    const duplicated = compareEntriesToRoots([...ENTRY_ADDRESSES, ENTRY_ADDRESSES[0] as readonly string[]], ROOT_ADDRESSES)
    expect(duplicated.omitted, 'a duplicate is invisible to the omission direction').toEqual([])
    expect(duplicated.spurious, 'and to the spurious one').toEqual([])
    expect(duplicated.counts.equal, 'and only the count reads it').toBe(false)
    expect(duplicated.ok, 'so the verdict fails').toBe(false)

    // (iv) TUPLE COLLISION — `['a/b']` and `['a','b']` share one joined spelling and are two addresses.
    const collision = compareEntriesToRoots([['a/b']], [['a', 'b']])
    expect(collision.ok, 'a joining comparator would call this a match and this one does not').toBe(false)
    expect(collision.counts.equal, 'the lengths agree, so the collision is invisible to the count as well').toBe(true)
  })
})
