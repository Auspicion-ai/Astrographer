// tests/integration/record-engine/root-invariant.test.ts — finding `B1-ADV-03` (MATERIAL): **THE ROOT INVARIANT IS RE-JUDGED BELOW
// THE ROOT.** A family that STANDS while naming a member the parse cannot state used to accept leaf writes, and `read()` then
// DROPPED that member for ever while the store still held it — `D-105`'s forbidden state, one route over from the root.
//
// **WHICH `D-105` ARM THIS FILE DRIVES, AND WHY IT IS THE RIGHT ONE.** `D-105`'s fault is *"the read drops a member while `source`
// still says `'record'`"*, and a contract can answer it in exactly two places:
//   · **(a) THE WRITE INSTANT — the constraint's own arm** (`docs/L1/unit-b-1-record-engine-seam.md` §2, arm (2): *"a family that
//     STANDS and names an entry the parse cannot state → REFUSED, no repair"*). This file drives it at EVERY depth a write can
//     land at — the root, a tab id, and a member's own node — because the constraint is only asked about the node the write is at,
//     so a root-only judgement is a judgement three routes can walk around. That is the arm the CONTRACT states, and rows
//     `(invariant·write · root/tab/deeper)` are it.
//   · **(b) THE READ — the declared absence.** For a value that arrived from OUTSIDE this module (an older image on disk, a second
//     process, a store built without the pair) no write instant ever ran, so (a) cannot answer. A read may not repair (a read
//     writes nothing, `D-82` clause 4) and must not drop (that IS `D-105`), so the only answer left is the DECLARED ABSENCE:
//     `read()` answers `null` for a family it cannot wholly state, and `readTab` answers `null` for the node it cannot state.
//     **The cost is stated rather than hidden**: an unstatable profile reads as no saved display state until a write heals it, and
//     a ROOT write of a statable family does heal it (`(invariant·heal)` measures that). The alternative — answer the statable
//     members and drop the rest — is the fault this finding is about.
// **AND THE CLOSURE OF THE MODULE'S OWN ROUTES** is `entry-domain.test.ts`'s (the allowlist at both depths + the crossing's
// boundary), which is what makes (b) reachable only by an outside writer.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT the member allowlist or the boundary domain at the
// parse (`entry-domain.test.ts`); NOT the creation's repair or its delivery (`display-record.test.ts` `(d)`); NOT the entries↔roots
// relation (`declared-entries.test.ts`); NOT the client (`client-holding.test.ts`); and NOT the tier word, the root count or an id.
//
// LAYER: `[T]`/envelope. Real stores on `mkdtempSync` paths under `os.tmpdir()`, removed in `afterAll`; nothing here paints.
import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createDisplayDelivery } from '../../../src/main/record-engine/delivery.js'
import { createDisplayRecord } from '../../../src/main/record-engine/record.js'
import { DISPLAY_ADDRESS, DISPLAY_TIER, displayConstraintDeclarations } from '../../../src/main/record-engine/display-family.js'
import { createProfileStore } from '../../../src/main/storeroom.js'

/** One value's spelling, for comparisons between two readings of the SAME kind — never a read-back against a fixture literal (the
 *  store canonicalises member order; `docs/L2/record-engine/interface.md` §6). */
const jsonOf = (value: unknown): string => JSON.stringify(value)

/** The tabs and entries below are this file's own fixtures. §2 fixes the key to be the ADDRESS SEGMENT and never a stored `tabId`. */
const A_HEALTHY_TAB = 'tab-healthy'
const AN_UNSTATABLE_TAB = 'tab-unstatable'
const A_HEALTHY_ENTRY = { documentId: 'doc-healthy' }
/** **THE UNSTATABLE MEMBERS, ONE PER ROUTE.** `{documentId: 7}` is an admitted NAME carrying a value outside its domain;
 *  `{documentId, content}` is a value whose MEMBER NAME the family does not state (`D-23`); and `{documentId, view: {…, stray}}`
 *  is a lawful name carrying a boundary-hostile member two levels down. Each is a member of a family the read cannot state. */
const AN_UNSTATABLE_ENTRY = { documentId: 7 }
const A_CONTENT_CARRYING_ENTRY = { documentId: 'doc-a', content: '<p>the whole document</p>' }
const A_BOUNDARY_CARRYING_ENTRY = { documentId: 'doc-a', view: { offset: 1, section: 'sec-1', stray: new Map<string, string>() } }
/** **THE THIRD SHAPE, AND THE ONE AN OUTSIDE WRITER IS MOST LIKELY TO LEAVE**: an undeclared member two levels down carrying a
 *  value the STORE'S OWN boundary admits — so the store holds it happily and only this family's parse can see that it is a member
 *  the read cannot state. (The `Map` above cannot be seeded through a constraint-free store: the crossing refuses it, which is
 *  `entry-domain.test.ts`'s subject and not this file's.) */
const A_NESTED_MEMBER_ENTRY = { documentId: 'doc-a', view: { offset: 1, section: 'sec-1', stray: 'a value the store carries happily' } }

/** Every temp directory this file opened, so `afterAll` removes exactly what it made. */
const TEMP_DIRS: string[] = []

afterAll(() => {
  TEMP_DIRS.forEach((dir) => rmSync(dir, { recursive: true, force: true }))
})

/** **THE OUTSIDE WRITER, AND THAT IS WHAT IT IS CALLED BECAUSE IT IS NOT THIS MODULE.** A store constructed through the seam with
 *  NO constraint registered is exactly what a profile's `file` tier looks like when the bytes were written by an older version, by
 *  another process, or by a caller who drove the store directly. Nothing in this module ran a write instant on it, so `(a)`'s arm
 *  never had its turn — which is the whole reason `(b)` has to answer. */
interface OutsideCrossing {
  readonly store: ReturnType<typeof createProfileStore>
  readonly record: ReturnType<typeof createDisplayRecord>
  readonly filePath: string
}

function buildOutsideWriter(): OutsideCrossing {
  const dir = mkdtempSync(join(tmpdir(), 'record-engine-root-invariant-'))
  TEMP_DIRS.push(dir)
  const filePath = join(dir, 'profile.store')
  const store = createProfileStore({ filePath })
  const record = createDisplayRecord({ store, delivery: createDisplayDelivery(() => undefined) })
  return { store, record, filePath }
}

/** ONE REAL CROSSING — the delivery before the store, its entries adopted at the one construction, the family's declarations
 *  registered there, and the holder bound after it answers (the boot's own order). This is the store the WRITE-INSTANT arms are
 *  driven on, because on it the pair is registered and asked. */
interface Crossing {
  readonly store: ReturnType<typeof createProfileStore>
  readonly record: ReturnType<typeof createDisplayRecord>
  readonly filePath: string
  readonly sinkAddresses: (readonly string[])[]
}

function buildCrossing(): Crossing {
  const dir = mkdtempSync(join(tmpdir(), 'record-engine-root-invariant-crossing-'))
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
  return { store, record: createDisplayRecord({ store, delivery }), filePath, sinkAddresses }
}

describe('record-engine · B1-ADV-03 (a) — the WRITE INSTANT: the root invariant is re-judged at every depth a write can land at', () => {
  it('(invariant·write · tab) · A TAB-NODE WRITE NAMING AN UNDECLARED MEMBER IS REFUSED — the tab node judges the WHOLE entry, allowlist included', () => {
    // **THE ROUTE THE FINDING MEASURED**: `commitTab` used to admit any member beside the three it knew, so a leaf write could
    // store `content` UNDER a standing tab — and the read then dropped it while `source` still said `'record'`. The tab node's arm
    // now judges the whole landed entry, so this write never commits.
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_HEALTHY_TAB, A_HEALTHY_ENTRY), 'the sibling that must survive').toMatchObject({ ok: true })
    expect(crossing.record.commitTab(A_HEALTHY_TAB, A_CONTENT_CARRYING_ENTRY), 'and the record refuses the member outright').toMatchObject({
      ok: false,
    })
    crossing.sinkAddresses.length = 0
    const bytesBefore = readFileSync(crossing.filePath)

    let refusal: unknown = null
    try {
      crossing.store.write([...DISPLAY_ADDRESS, AN_UNSTATABLE_TAB], DISPLAY_TIER, A_CONTENT_CARRYING_ENTRY)
    } catch (thrown) {
      refusal = thrown
    }
    expect(
      (refusal as { readonly status?: unknown } | null)?.status,
      'a tab-node write carrying a member the family does not state must be REFUSED at its own node — it LANDS otherwise and the ' +
        'store then holds a member `read()` cannot state (D-105)',
    ).toBe('ConstraintPassRefused')
    expect(readFileSync(crossing.filePath).equals(bytesBefore), 'and the profile’s bytes are unchanged: the refusal rolled back').toBe(true)
    expect(crossing.sinkAddresses, 'and a refused write delivers nothing').toEqual([])
  })

  it('(invariant·write · deeper) · A MEMBER-NODE WRITE IS REFUSED ON ITS NAME AND ON ITS VALUE — both judgements, at the node the act lands', () => {
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_HEALTHY_TAB, A_HEALTHY_ENTRY), 'the standing entry the member write needs').toMatchObject({ ok: true })
    // **TWO ARMS, TWO ANSWERS, AND THE MEASUREMENT IS WHICH** — the pair judges what the crossing let through, and the crossing judges
    // its own boundary BEFORE the pair is asked (measured: `ValueRefusedAtBoundary` arrives for a member value the boundary refuses).
    // So the STRICT reading is taken where the family's judgement is the only one that can answer, and the LOOSE one where either arm
    // is a correct refusal — with "nothing landed" asserted in both cases, because that is the fact D-105 turns on.
    const strict: readonly { readonly what: string; readonly address: readonly string[]; readonly value: unknown }[] = [
      { what: 'an undeclared MEMBER NAME', address: [...DISPLAY_ADDRESS, A_HEALTHY_TAB, 'content'], value: '<p>the whole document</p>' },
      { what: 'an undeclared member inside a declared member', address: [...DISPLAY_ADDRESS, A_HEALTHY_TAB, 'view'], value: { offset: 1, section: 'sec-1', stray: 'a string' } },
      { what: 'a declared member carrying an out-of-domain value', address: [...DISPLAY_ADDRESS, A_HEALTHY_TAB, 'documentId'], value: 7 },
    ]
    strict.forEach(({ what, address, value }) => {
      let refusal: unknown = null
      try {
        crossing.store.write([...address], DISPLAY_TIER, value)
      } catch (thrown) {
        refusal = thrown
      }
      expect(
        (refusal as { readonly status?: unknown } | null)?.status,
        `a member-node write carrying ${what} must be REFUSED by the FAMILY’s pair — the pair is an ANCESTOR of the act's address, ` +
          `which is why "judged at its own node" is the arm that answers here`,
      ).toBe('ConstraintPassRefused')
    })
    // AND THE CROSSING'S OWN DOMAIN IS ANSWERED BY THE CROSSING: a `BigInt` inside a declared member never reaches the pair, so the
    // reading here is only that the act is REFUSED and the family is untouched.
    let hostile: unknown = null
    try {
      crossing.store.write([...DISPLAY_ADDRESS, A_HEALTHY_TAB, 'view'], DISPLAY_TIER, A_BOUNDARY_CARRYING_ENTRY.view)
    } catch (thrown) {
      hostile = thrown
    }
    expect(hostile, 'a member value outside the crossing’s boundary is refused — by the crossing itself, before any pass runs').not.toBeNull()
    expect(
      ['ConstraintPassRefused', 'ValueRefusedAtBoundary'].includes(String((hostile as { readonly status?: unknown }).status)),
      `and it is one of the two named refusals — read \`${String((hostile as { readonly status?: unknown }).status)}\``,
    ).toBe(true)
    expect(crossing.store.read([...DISPLAY_ADDRESS, A_HEALTHY_TAB]), 'and the standing entry is exactly the seed’s entry, member for member').toEqual(
      A_HEALTHY_ENTRY,
    )
  })

  it('(invariant·write · root) · A ROOT WRITE NAMING AN UNSTATABLE ENTRY IS REFUSED — the whole family is judged, and no repair runs', () => {
    const crossing = buildCrossing()
    expect(crossing.record.commitTab(A_HEALTHY_TAB, A_HEALTHY_ENTRY), 'the standing member that must survive').toMatchObject({ ok: true })
    crossing.sinkAddresses.length = 0
    const standingBefore = jsonOf(crossing.store.read([...DISPLAY_ADDRESS]))
    let refusal: unknown = null
    try {
      crossing.store.write([...DISPLAY_ADDRESS], DISPLAY_TIER, {
        [A_HEALTHY_TAB]: A_HEALTHY_ENTRY,
        [AN_UNSTATABLE_TAB]: AN_UNSTATABLE_ENTRY,
      })
    } catch (thrown) {
      refusal = thrown
    }
    expect((refusal as { readonly status?: unknown } | null)?.status, 'the root arm refuses an entry the parse cannot state').toBe('ConstraintPassRefused')
    expect(jsonOf(crossing.store.read([...DISPLAY_ADDRESS])), 'and repairs NOTHING: the standing family is unchanged, never replaced by the placeholder').toBe(
      standingBefore,
    )
    expect(crossing.sinkAddresses, 'and no delivery fired').toEqual([])
  })
})

describe('record-engine · B1-ADV-03 (b) — THE READ: a family the module cannot state answers the DECLARED ABSENCE, never a silent drop', () => {
  it('(invariant·read) · `read()` ANSWERS `null` FOR A FAMILY CARRYING AN UNSTATABLE MEMBER — and `readTab` still answers the node it CAN state', () => {
    const outside = buildOutsideWriter()
    outside.store.write([...DISPLAY_ADDRESS], DISPLAY_TIER, {
      [A_HEALTHY_TAB]: A_HEALTHY_ENTRY,
      [AN_UNSTATABLE_TAB]: AN_UNSTATABLE_ENTRY,
    })

    // **THE READING ITSELF, TAKEN ON THE STORE’S OWN VALUE FIRST**, so the row cannot pass over an empty profile: the store really
    // does hold both members, and one of them is outside the domain the family can state.
    const stored = outside.store.read([...DISPLAY_ADDRESS]) as Record<string, unknown>
    expect(Object.keys(stored).sort(), 'the store holds two members, one statable and one not').toEqual([A_HEALTHY_TAB, AN_UNSTATABLE_TAB].sort())
    expect(stored[AN_UNSTATABLE_TAB], 'and the unstatable member is really there, in the store’s own bytes').toEqual(AN_UNSTATABLE_ENTRY)

    // **D-105’s FAULT WAS THE SILENT DROP**: `read()` answered `{[A_HEALTHY_TAB]: …}` and the second member disappeared with no word
    // said while the store still held it. The declared absence is the only contract-conforming answer left to a read.
    expect(
      outside.record.read(),
      'read() must NOT drop the member it cannot state: it answers the family it can state WHOLLY, or the declared absence — read ' +
        `${jsonOf(outside.record.read())}`,
    ).toBeNull()
    expect(outside.record.readTab(AN_UNSTATABLE_TAB), 'and the node it cannot state answers `null` rather than a partial entry').toBeNull()
    expect(
      outside.record.readTab(A_HEALTHY_TAB),
      'while a STABLE node still answers: the per-node claim is judged at its own node and is not held hostage by a sibling',
    ).toEqual(A_HEALTHY_ENTRY)
  })

  it('(invariant·read·content) · THE SAME ARM FOR A MEMBER NAME AND FOR A BOUNDARY-HOSTILE MEMBER — every route to an unstatable member reads the same', () => {
    // Three families, each unstatable for a DIFFERENT reason, and one behaviour: this is what makes the arm a rule and not a patch
    // for the one value the finding happened to measure.
    const subjects: readonly { readonly what: string; readonly member: unknown }[] = [
      { what: 'a member NAME the family does not state', member: A_CONTENT_CARRYING_ENTRY },
      { what: 'an out-of-domain `documentId`', member: AN_UNSTATABLE_ENTRY },
      { what: 'an undeclared member two levels down', member: A_NESTED_MEMBER_ENTRY },
    ]
    subjects.forEach(({ what, member }) => {
      const outside = buildOutsideWriter()
      outside.store.write([...DISPLAY_ADDRESS], DISPLAY_TIER, { [AN_UNSTATABLE_TAB]: member })
      expect(outside.record.read(), `read() answers the declared absence for ${what}, never a family minus the member`).toBeNull()
      expect(outside.record.readTab(AN_UNSTATABLE_TAB), `and \`readTab\` answers \`null\` for ${what}`).toBeNull()
    })
  })

  it('(invariant·heal) · A STATABLE ROOT WRITE HEALS IT, AND THE READ ANSWERS AGAIN — the absence is not sticky', () => {
    // **THE CONTROL, AND THE REASON THE ARM ABOVE IS NOT A LOCK-OUT**: the write instant still judges the root, so a caller who
    // writes a statable family replaces the offending member and the profile reads again. Without this arm `read()`'s `null` could
    // be satisfied by a read that stopped working.
    const outside = buildOutsideWriter()
    outside.store.write([...DISPLAY_ADDRESS], DISPLAY_TIER, { [AN_UNSTATABLE_TAB]: AN_UNSTATABLE_ENTRY })
    expect(outside.record.read(), 'the unstatable family answers the declared absence').toBeNull()
    outside.store.write([...DISPLAY_ADDRESS], DISPLAY_TIER, { [A_HEALTHY_TAB]: A_HEALTHY_ENTRY })
    expect(outside.record.read(), 'a statable root write replaces the family, and the read answers it whole').toEqual({ [A_HEALTHY_TAB]: A_HEALTHY_ENTRY })
    expect(outside.record.readTab(A_HEALTHY_TAB), 'with the healed member readable at its own node').toEqual(A_HEALTHY_ENTRY)
  })

  it('(invariant·read·healthy) · AND A HEALTHY FAMILY IS UNAFFECTED — the arm is not "the read answers `null` now"', () => {
    const outside = buildOutsideWriter()
    outside.store.write([...DISPLAY_ADDRESS], DISPLAY_TIER, { [A_HEALTHY_TAB]: A_HEALTHY_ENTRY })
    expect(outside.record.read(), 'a family every member of which the parse states is answered WHOLE, member for member').toEqual({
      [A_HEALTHY_TAB]: A_HEALTHY_ENTRY,
    })
  })
})
