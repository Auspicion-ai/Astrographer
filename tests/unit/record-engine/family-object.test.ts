// tests/unit/record-engine/family-object.test.ts — unit `B-1` `record-engine-seam`'s row `FH-3`: THE FAMILY OBJECT'S
// CONTRACT, for this fork's FIRST record family (the `display` family, `DISPLAY_ADDRESS`/`DISPLAY_MUST_STAND_ID`/
// `DISPLAY_TIER`).
//
// **IT IS RED ON ARRIVAL, AND THAT IS THE UNIT'S RED-FIRST EVIDENCE RATHER THAN A DEFECT** (RCA-1). The names it imports —
// the union `DisplayFamilySpec` with its two arms, the factory `displayFamily`, the module-scope tuple `DISPLAY_FAMILIES`
// and the two projections `displayDeclaredRoots`/`displayConstraintDeclarations` — are
// `docs/L1/unit-b-1-record-engine-seam.md` §4 site 3's and do not exist at this head, so the import fails and the run reds
// with it. **NOT ONE LINE HERE MOVES TO MAKE IT GREEN**: a line dropped to make the tree compile would delete the
// measurement rather than the defect.
//
// **THE OBJECT IS PORTED FROM THE FOUNDATION, NEVER VENDORED** (`ASM-B-1`): `ViewPairedFamily`
// (`../Provident-Electron/src/main/view-record/index.ts:1297`), `ViewUnpairedFamily` (`:1316`), `ViewFamilySpec` (`:1330`),
// `ViewFamily` (`:1336`), `viewFamily` (`:1349`), `VIEW_FAMILIES` (`:1374`) and the two projections (`:1414`, `:1455`). The
// `tag` discriminant is LOAD-BEARING (`forking.md` §2.5, `:214-219`) and `FH-3 (e)` below is where that is measured.
//
// **THE ARMS, AND WHICH OF THEM ARE `RUN`**(§5's `FH-3`): `(a)` one address projected twice · `(b)` the unpaired arm is an
// explicit `null` while its root stands · `(c)` the publications ARE its projections, both directions and a count · `(d)`
// the factory is DEFERRED · `(f)` the tag narrows · `(g)` the falsifier. **`(e)` IS SPLIT AND THE SPLIT IS SAID OUT LOUD**:
// the two ADMITTED controls are `RUN` arms driven in this file, while the five REFUSED literals live in
// `./spec-shape.fixture.ts` and are measured by a `tsc --noEmit` SUBPROCESS — the one callable route this fork has, because
// it has no `typecheck:tests` leg (`package.json` has no such key; `tsconfig.json` is `include: ["src/**/*.ts"]` with
// `exclude: [ … "tests"]`, so an `@ts-expect-error` in a `*.test.ts` file here suppresses nothing and measures nothing —
// `vitest` transpiles without typechecking). The route's own reading is reported by the unit, not asserted here.
//
// EVERY FIGURE IS DERIVED FROM THE MODULE AND NONE IS RESTATED (§5's closing rule, `D-43`): the arms read `DISPLAY_FAMILIES`
// and the two publications, never a spelled count, tier, id or address, and the only numeric readings are FLOORS
// (`toBeGreaterThan(0)`). **The root count, the tier value, the id value and the unpaired root's literal belong to NO row
// here** — `declaration ↔ root` is `tests/integration/central-data/declared-root.test.ts`'s in the foundation, and this
// unit's `tests/integration/record-engine/declared-entries.test.ts` owns `entries ↔ roots`.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT (`D-43`): NOT `declaration ↔ root` and NOT a root
// count or a tier word; NOT a handle's spelling, which is a module counter; NOT the entries, the delivery, a store act, a
// boot or a subscription — those are `declared-entries.test.ts`'s (`FH-1`/`FH-2`), `delivery.test.ts`'s (arms `(a)`, `(c)`)
// and `display-record.test.ts`'s (arms `(d)`, `(e)`, the cadence); NOT the value admission, which is
// `display-admission.test.ts`'s; and NOT an order, because no consumer reads the tuple's order. **NOTHING HERE IMPORTS
// `createDisplayDelivery`**, because the entries are `FH-1`'s row and the object MINTS NO ENTRY: the object DECLARES and
// never registers.
// **AND ADDRESSES ARE COMPARED AS TUPLES** (`JSON.stringify([…address])`) and never as joined strings, because `['a/b']`
// and `['a', 'b']` share one `join('/')` spelling.
import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import {
  DISPLAY_FAMILIES,
  displayConstraintDeclarations,
  displayDeclaredRoots,
  displayFamily,
} from '../../../src/main/record-engine/display-family.js'
import type {
  DisplayFamily,
  DisplayPairedFamily,
  DisplayUnpairedFamily,
} from '../../../src/main/record-engine/display-family.js'
import { ADMITTED_PAIRED, ADMITTED_UNPAIRED, narrowedIdOf } from './spec-shape.fixture.js'

/** **ONE ADDRESS AS A COMPARABLE TUPLE — AND NEVER `join('/')`**: the store's address space is a tuple of segments, so
 *  `['a/b']` and `['a', 'b']` are two DIFFERENT addresses sharing one joined spelling; a joining comparator would call a
 *  spurious member a match and this row would pass over the very drift it exists to see. `JSON.stringify` of the ARRAY is
 *  the tuple's own spelling, and the nesting inside it is what keeps a segment from aliasing its neighbours. */
const tupleOf = (address: readonly string[]): string => JSON.stringify([...address])

/** **THE TWO SHAPES THIS ROW COMPARES, DERIVED FROM THE MODULE'S OWN EXPORTS AND NOT SPELLED** (`D-43`): the declared root
 *  and the constraint declaration are §4 site 3's, and naming them here through `ReturnType` keeps this file from becoming
 *  a second spelling of the module's type surface. */
type DeclaredRoot = ReturnType<typeof displayDeclaredRoots>[number]
type ConstraintDeclaration = ReturnType<typeof displayConstraintDeclarations>[number]

/** **THE KEY A PROJECTED DECLARATION IS COMPARED BY: ITS ADDRESS TUPLE *AND* ITS `id`.** Two families may stand at one root
 *  (the store keeps one value per address and a family IS that value), so an address-only key would call two different
 *  declarations of one family interchangeable — which is exactly the drift this row exists to see. */
const declarationKeyOf = (declaration: ConstraintDeclaration): string =>
  JSON.stringify([[...declaration.address], declaration.id])

/**
 * **THE VERDICT — BOTH DIRECTIONS AND THE COUNT, FROM ONE FUNCTION.** Every arm of `(c)` and every control under `(g)`
 * reads THIS object: the row carries no set assertion of its own and the falsifier carries no copy of one, which is the
 * only shape in which a control can prove the row it controls.
 */
interface ProjectionVerdict {
  /** Members the OBJECT declares that the PUBLICATION does not carry — the omission direction. */
  readonly missing: readonly string[]
  /** Members the PUBLICATION carries that no spec declares — the direction that keeps a projection from inventing a half. */
  readonly extra: readonly string[]
  /** MULTIPLICITY — the one relation a `Set` comparison cannot see, because a duplicate collapses to one member. */
  readonly counts: { readonly declared: number; readonly published: number; readonly equal: boolean }
  /** `true` only when both directions are empty AND the counts agree. */
  readonly ok: boolean
}

/** **`publication ↔ object`, AS A SET EQUALITY IN BOTH DIRECTIONS PLUS A COUNT**: `missing` is declared minus published and
 *  `extra` is published minus declared, and neither direction can be satisfied by the other — which is what makes "the
 *  publications ARE its projections" one claim and not two. */
function compareProjection(declaredKeys: readonly string[], publishedKeys: readonly string[]): ProjectionVerdict {
  const declaredSet = new Set(declaredKeys)
  const publishedSet = new Set(publishedKeys)
  const missing = [...declaredSet].filter((key) => !publishedSet.has(key))
  const extra = [...publishedSet].filter((key) => !declaredSet.has(key))
  const counts = {
    declared: declaredKeys.length,
    published: publishedKeys.length,
    equal: declaredKeys.length === publishedKeys.length,
  }
  return { missing, extra, counts, ok: missing.length === 0 && extra.length === 0 && counts.equal }
}

/**
 * **THE TWO SIDES, READ ONCE EACH, OFF THE EXPORTS AND NEVER OFF A SPELLING OF THIS FILE'S**: the declared side is the
 * object's own tuple projected member by member, and the published side is the module's own two projections. Neither side is
 * sorted, filtered or re-ordered on its way in: the address (and id) is projected out of each element and that is all.
 * **THE PROJECTIONS ARE CALLED AT MODULE SCOPE HERE AND THAT IS THE ROW'S OWN READING, NOT THE MODULE'S DEED**: what the
 * contract forbids is the MODULE building a body at its own scope, and `(d)` measures THAT on a fixture whose counter is
 * this file's own. **AND THE COMPARISON IS OVER PROJECTED KEYS RATHER THAN OVER THE ELEMENTS THEMSELVES**, which is a
 * measurement and not a preference: the declaration batch is rebuilt on every call and its `constraint` members are fresh
 * closures, so two calls never answer the same function identity — an identity comparison here would judge machinery
 * instead of a publication.
 */
const publishedRoots: readonly DeclaredRoot[] = displayDeclaredRoots()
const publishedDeclarations: readonly ConstraintDeclaration[] = displayConstraintDeclarations(() => null)
const declaredRoots: readonly DeclaredRoot[] = DISPLAY_FAMILIES.map((family) => family.root)
const declaredDeclarations: readonly ConstraintDeclaration[] = DISPLAY_FAMILIES.map((family) =>
  family.declaration(() => null),
).filter((declaration): declaration is ConstraintDeclaration => declaration !== null)

/** **THE TWO ARMS OF THE TUPLE, DERIVED BY WHAT THE PROJECTION ANSWERS**: a family is PAIRED when its `declaration` answers
 *  a declaration and UNPAIRED when it answers `null`. Nothing here spells which family is which — which family is unpaired
 *  belongs to no row here, and `our` family is PAIRED while the unpaired ARM exists because the object must EXPRESS it
 *  (§7 item 4; the foundation's `['drag']` precedent). */
const pairedFamilies: readonly DisplayFamily[] = DISPLAY_FAMILIES.filter(
  (family) => family.declaration(() => null) !== null,
)
const unpairedFamilies: readonly DisplayFamily[] = DISPLAY_FAMILIES.filter(
  (family) => family.declaration(() => null) === null,
)

/** **A LAWFUL TIER FOR THIS FILE'S OWN FIXTURES, READ OFF THE MODULE'S OWN DECLARATION** (`D-43`): a spec needs one tier
 *  word to be a spec at all, and taking it from `DISPLAY_FAMILIES` keeps this file from being a second spelling of the tier's
 *  domain. The read is guarded because an emptied tuple is `(a)`/`(c)`'s red and not this fixture's. */
const A_TIER: DisplayPairedFamily['tier'] = (DISPLAY_FAMILIES[0]?.root.tier ?? undefined) as DisplayPairedFamily['tier']

/** A BODY THIS ROW OWNS: it ignores its context and answers the passing arm, so no fixture of this file touches a store —
 *  the body's subject here is the DEFERRAL and the shape, and a store act would be `(d)`'s opposite. */
const aPassingBody = (): true => true

// ═══════════════ (d) THE DEFERRED FACTORY — A COUNTING FIXTURE THE ROW OWNS ═══════════════
//
// **THE COUNT IS THIS FIXTURE'S OWN AND IT IS SAID SO RATHER THAN IMPLIED**: it cannot count the module's bodies, so what it
// measures is the CONTRACT on a spec this row owns — that `displayFamily` and `.root` build none and that each
// `declaration(getStore)` call builds exactly one. A body that ran at construction would close over a store that does not
// exist yet, which is why the deferral is a guarantee and not a style (§7's `D-26` item 4's neighbourhood; the
// foundation's `D-124` (iii)).
let bodiesBuilt = 0
const COUNTING_SPEC: DisplayPairedFamily = {
  tag: 'paired',
  address: ['a-subject-of-this-row'],
  tier: A_TIER,
  id: 'a-subject-of-this-row-must-stand',
  body: () => {
    bodiesBuilt += 1
    return aPassingBody
  },
}
// THE FAMILY IS BUILT AT MODULE SCOPE, exactly as `DISPLAY_FAMILIES`'s own elements are, so the reading below is taken
// across a module-scope construction and not around a comfortable empty one.
const COUNTING_FAMILY: DisplayFamily = displayFamily(COUNTING_SPEC)
const BODIES_BUILT_AT_MODULE_SCOPE = bodiesBuilt

// ═══════════════ (e)'s INSTRUMENT — THE `tsc --noEmit` SUBPROCESS OVER `./spec-shape.fixture.ts` ═══════════════
//
// **THE COMMAND IS THE MEASUREMENT AND ITS ARGUMENTS ARE THE FIXTURE'S OWN**: the fixture compiles under `--strict` with its
// five `@ts-expect-error` directives intact, and `tsc` answers exit 0 only while every suppressed error is really there (an
// unused directive is `TS2578`). **`--skipLibCheck`** keeps the toolchain's own `.d.ts` files out of the reading and
// **`--moduleResolution bundler`/`--module ESNext`** are what let the fixture's `…/display-family.js` specifier resolve to
// the module's `.ts` source, exactly as the repo's own `tsconfig.json` does. **THE SUBPROCESS ALSO COMPILES THE MODULES THE
// FIXTURE IMPORTS**, so a `--strict` error inside `src/main/record-engine/**` would red here as well; that fact is
// `npm run typecheck`'s and this row only reports the compiler's own output when it reds.
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const TSC = `${ROOT}node_modules/.bin/tsc`
const FIXTURE = fileURLToPath(new URL('./spec-shape.fixture.ts', import.meta.url))
const TSC_TIMEOUT_MS = 25_000
const TSC_ARGS: readonly string[] = [
  '--noEmit',
  '--strict',
  '--skipLibCheck',
  '--target',
  'ES2022',
  '--module',
  'ESNext',
  '--moduleResolution',
  'bundler',
  FIXTURE,
]

/** One compiler reading: the exit status, and both streams so a red can QUOTE the diagnostics instead of asserting a colour
 *  with no evidence. A thrown spawn is `threw: true` with a `null` status, never a silent zero. */
interface TscReading {
  readonly status: number | null
  readonly stdout: string
  readonly stderr: string
  readonly threw: boolean
}

function runTsc(args: readonly string[]): TscReading {
  try {
    const stdout = execFileSync(TSC, [...args], {
      cwd: ROOT,
      encoding: 'utf8',
      timeout: TSC_TIMEOUT_MS,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return { status: 0, stdout, stderr: '', threw: false }
  } catch (error) {
    const shape = error as { status?: unknown; stdout?: unknown; stderr?: unknown }
    return {
      status: typeof shape.status === 'number' ? shape.status : null,
      stdout: typeof shape.stdout === 'string' ? shape.stdout : '',
      stderr: typeof shape.stderr === 'string' ? shape.stderr : '',
      threw: true,
    }
  }
}

describe('record-engine · FH-3 — the display family object’s contract: two halves of one address, an explicit `null`, both publications, a deferred factory, a narrowing tag and the arm that reds', () => {
  it('FH-3 (a) · ONE ADDRESS, PROJECTED TWICE — a paired family’s root and its declaration carry the same address, the root its tier and the declaration its id', () => {
    // A FLOOR AND NOT THE FIGURE (`D-43`): an empty family set would satisfy every assertion below for free, and a row that
    // has stopped measuring looks exactly like that.
    expect(
      DISPLAY_FAMILIES.length,
      'the object declares at least one family, or (a) compares nothing with nothing — a FLOOR, never the count',
    ).toBeGreaterThan(0)
    expect(
      pairedFamilies.length,
      'at least one PAIRED family stands: the `display` family holds an invariant and its declaration is what mints the placeholder',
    ).toBeGreaterThan(0)
    pairedFamilies.forEach((family) => {
      const root = family.root
      const declaration = family.declaration(() => null)
      expect(
        declaration,
        'a paired family answers a declaration, so the two halves are one declaration and not two lists kept in step by hand',
      ).not.toBeNull()
      if (declaration === null) return // the assertion above is the arm; this is the compiler's arm
      expect(
        tupleOf(declaration.address),
        'the ONE address this family declares reaches both halves unchanged — a declaration published at another address would be a second family',
      ).toBe(tupleOf(root.address))
      expect(typeof root.tier, 'and the root carries its TIER, which the published type alone admits').toBe('string')
      expect(typeof declaration.id, 'while the declaration carries its ID, which the published type alone admits').toBe('string')
      expect(declaration.id.length, 'an id that stands is a word and not an empty span').toBeGreaterThan(0)
    })
  })

  it('FH-3 (b) · THE UNPAIRED ARM IS AN EXPLICIT `null` — present, `toBeNull()`, never `undefined` and never an empty stand-in, while its root STANDS', () => {
    // THE ARM IS DRIVEN ON A SPEC THIS ROW OWNS AND ON EVERY MEMBER THE TUPLE HAPPENS TO CARRY, because WHICH family is
    // unpaired belongs to no row here and the tuple may lawfully carry none: `display` is PAIRED, and the unpaired arm is
    // carried because the object must EXPRESS it (§7 item 4). A row that required an unpaired MEMBER would be asserting the
    // tuple's membership, which is `declared-entries.test.ts`'s to read — so the guaranteed subject is this file's own.
    const fromOwnSpec = displayFamily(ADMITTED_UNPAIRED)
    expect(fromOwnSpec.declaration(() => null), 'the unpaired arm’s declaration is `null`: a value a projection must TEST').toBeNull()
    expect(fromOwnSpec.declaration(() => null), 'and never `undefined`, which a projection could not tell from an omitted member').not.toBeUndefined()
    expect(
      fromOwnSpec.declaration(() => null),
      'and never an empty object standing in for the absence — `{}` is one `.filter` from being dropped silently',
    ).not.toEqual({})
    expect(fromOwnSpec.root, 'while its ROOT still stands: a root with no declaration is lawful and must stay expressible').toBeDefined()
    expect(
      tupleOf(fromOwnSpec.root.address),
      'and the standing root publishes the address the spec declared, so the lawful one-sided family is expressible end to end',
    ).toBe(tupleOf(ADMITTED_UNPAIRED.address))

    unpairedFamilies.forEach((family) => {
      expect(family.declaration(() => null), 'a tuple member whose projection answers `null` is the unpaired arm, and `null` is what it answers').toBeNull()
      expect(family.root, 'and its root stands beside it').toBeDefined()
    })
  })

  it('FH-3 (c) · THE PUBLICATIONS ARE ITS PROJECTIONS, BOTH DIRECTIONS — every root and every paired declaration is published, and nothing is published that a spec does not declare', () => {
    // THE ROOT HALF, keyed by the address tuple. Both directions are the claim: `missing` is the object declaring a root the
    // publication omits, `extra` is the publication inventing a half no spec declares.
    const roots = compareProjection(
      declaredRoots.map((root) => tupleOf(root.address)),
      publishedRoots.map((root) => tupleOf(root.address)),
    )
    expect(
      roots.missing,
      'a root the object declares and `displayDeclaredRoots()` omits — the projection is a projection of the tuple and of nothing else',
    ).toEqual([])
    expect(
      roots.extra,
      'and a published root no spec declares — `displayDeclaredRoots()` may not answer a family the tuple does not carry',
    ).toEqual([])
    expect(
      roots.counts.equal,
      'one published root per declared root, so a duplicate on either side cannot hide inside the set equality',
    ).toBe(true)

    // THE DECLARATION HALF, keyed by `(address, id)` because two families may stand at one root and one address alone would
    // call two different declarations interchangeable.
    const declarations = compareProjection(
      declaredDeclarations.map(declarationKeyOf),
      publishedDeclarations.map(declarationKeyOf),
    )
    expect(
      declarations.missing,
      'a declaration the object declares and `displayConstraintDeclarations(getStore)` omits — the batch is the paired subset and nothing else',
    ).toEqual([])
    expect(declarations.extra, 'and a published declaration no spec declares, which would be a pair minted outside the tuple').toEqual([])
    expect(
      declarations.counts.equal,
      'one published declaration per paired family, so multiplicity is read here and not by the set',
    ).toBe(true)

    // AND NEITHER HALF IS VACUOUS — the unpaired arm participates in the ROOT comparison and in no declaration comparison.
    expect(declaredRoots.length, 'the object declares at least one root, or the root comparison compares nothing').toBeGreaterThan(0)
    expect(publishedRoots.length, 'and it publishes at least one root, or the same comparison is one-sided').toBeGreaterThan(0)
  })

  it('FH-3 (d) · THE FACTORY IS DEFERRED — nothing is built by `displayFamily` or by `.root`, and exactly one body per `declaration(getStore)` CALL', () => {
    expect(
      BODIES_BUILT_AT_MODULE_SCOPE,
      'no body is built while the spec and its family are constructed at module scope: a body built there would close over a store that does not exist yet',
    ).toBe(0)
    expect(COUNTING_FAMILY.root, 'reading `.root` is reading a VALUE and builds no body either').toBeDefined()
    expect(bodiesBuilt, 'so the count is still zero after `.root`').toBe(0)

    const first = COUNTING_FAMILY.declaration(() => null)
    expect(bodiesBuilt, 'one body per `declaration(getStore)` call — the factory runs INSIDE the projection and nowhere else').toBe(1)
    expect(first, 'and the paired projection answers a declaration').not.toBeNull()
    expect(typeof first?.constraint, 'whose `constraint` IS the body the factory built, so the projection carries what it was handed').toBe('function')
    expect(first?.constraint({}), 'and the built body is a function the engine may invoke, answering through the closed union').toBe(true)

    COUNTING_FAMILY.declaration(() => null)
    expect(
      bodiesBuilt,
      'a second call builds a second body: the factory is per call and never memoised, so no answer is shared between two registrations',
    ).toBe(2)
  })

  it('FH-3 (e·admitted) · THE SHAPE ADMITS TWO — one lawful paired spec and one lawful unpaired spec are specs the factory ACCEPTS', () => {
    // **THE REFUSED HALF IS THE COMPILER'S AND ITS READING IS A SUBPROCESS** (the row below); what is read HERE is the other
    // half of the same claim, in RUN form — the union is not merely always-red, one literal per arm is admitted end to end.
    const fromPaired = displayFamily(ADMITTED_PAIRED)
    const fromUnpaired = displayFamily(ADMITTED_UNPAIRED)
    const pairedDeclaration = fromPaired.declaration(() => null)
    expect(pairedDeclaration, 'the admitted PAIRED literal is a spec the factory accepts, and it answers a declaration').not.toBeNull()
    expect(pairedDeclaration?.id, 'whose id is the fixture’s own — the projection carries what the spec declared').toBe(ADMITTED_PAIRED.id)
    expect(tupleOf(fromPaired.root.address), 'and its root is published at the address the spec declared').toBe(tupleOf(ADMITTED_PAIRED.address))
    expect(fromUnpaired.declaration(() => null), 'while the admitted UNPAIRED literal is accepted and answers the explicit `null`').toBeNull()
    expect(tupleOf(fromUnpaired.root.address), 'and it too publishes its declared address as a root, which is the lawful one-sided family').toBe(
      tupleOf(ADMITTED_UNPAIRED.address),
    )
  })

  it('FH-3 (e·refused) · THE SHAPE REFUSES FIVE — measured by a `tsc --noEmit` subprocess over `./spec-shape.fixture.ts`, whose five directives are UNUSED (TS2578) the moment the union widens', () => {
    // ═══ WHY A SUBPROCESS AND NOT AN IMPORT: the five refusals assert at COMPILE time and this fork has no `typecheck:tests`
    // leg, so nothing in a `*.test.ts` file here is ever typechecked. The fixture IS typechecked, by this command, and the
    // command's exit status is the whole measurement: exit 0 = every suppressed error is really there.
    expect(
      existsSync(TSC),
      `the measurement needs the toolchain’s own compiler at ${TSC} — a missing compiler is a missing instrument, never a pass`,
    ).toBe(true)
    expect(FIXTURE.endsWith('spec-shape.fixture.ts'), 'the subject is the fixture this row names, resolved from this file’s own location').toBe(true)

    const reading = runTsc(TSC_ARGS)
    expect(
      reading.status,
      [
        'the fixture must COMPILE: its five `@ts-expect-error` directives pass only while the errors they suppress are really',
        'there, so a widening of the spec union makes one directive UNUSED and `tsc` answers TS2578 and a non-zero status.',
        `spawn threw: ${String(reading.threw)}`,
        `exit: ${String(reading.status)}`,
        `stdout: ${reading.stdout}`,
        `stderr: ${reading.stderr}`,
      ].join('\n'),
    ).toBe(0)
    // AND THE READING IS REPORTED AS WELL AS ASSERTED, because §9 owes the instrument's verdict to the unit's record: a green
    // row that says nothing about WHICH command produced it is a colour with no citation.
    expect(reading.threw, 'a throw at the spawn is not an exit status, so it is read separately and never folded into a zero').toBe(false)
  }, 30_000)

  it('FH-3 (f) · THE NARROWING CONTROL — the tag narrows, so this read must COMPILE rather than fail', () => {
    // The read itself lives in `./spec-shape.fixture.ts`, where `tsc` measures that it COMPILES: inside a `tag === 'paired'`
    // branch `spec.id` IS a `string`, and a `never`-without-a-tag union would make it `string | undefined` in both arms.
    expect(
      narrowedIdOf(ADMITTED_PAIRED),
      'inside a `tag === \'paired\'` branch `spec.id` IS a string, and it is the same string the spec carries',
    ).toBe(ADMITTED_PAIRED.id)
    expect(narrowedIdOf(ADMITTED_UNPAIRED), 'and the unpaired arm has no `id` to read at all — the OTHER arm, not a `never` a caller must test').toBeNull()
  })

  it('FH-3 (g) · **THE FALSIFIER — THE COMPARISON CAN STILL FAIL ONCE THE OBJECT LANDS**: the same verdict driven over deliberately divergent pairs before it is trusted', () => {
    // **THIS FALSIFIER'S SUBJECT IS THE COMPARISON AND NOT THE RED**: `FH-3` is red on arrival by design, so what must be
    // proved here is that the machinery `(c)` leans on will still be able to FAIL on the day the object lands — every arm
    // below drives `compareProjection` itself, and no arm copies an assertion out of `(c)`.

    // (i) THE SAME TWO LISTS ARE ADMITTED — the comparator is not simply always-red.
    expect(
      compareProjection(['[["a"]]', '[["b"]]'], ['[["a"]]', '[["b"]]']).ok,
      'identical lists are admitted, so the comparator has two arms',
    ).toBe(true)

    // (ii) AN OMITTED MEMBER REDS THE DECLARED DIRECTION — and it is NAMED as a tuple, never merely counted.
    const omitted = compareProjection([['a'], ['b'], ['c']].map(tupleOf), [['a'], ['b']].map(tupleOf))
    expect(omitted.ok, 'a publication that omits a declared member MUST fail').toBe(false)
    expect(omitted.missing, 'and the missing member is named').toEqual([tupleOf(['c'])])
    expect(omitted.extra, 'with nothing spurious in this pair, so the direction that reds here is the omission one').toEqual([])

    // (iii) A SPURIOUS MEMBER REDS THE OTHER DIRECTION — "nothing is published that a spec does not declare".
    const spurious = compareProjection([['a']].map(tupleOf), [['a'], ['not-declared']].map(tupleOf))
    expect(spurious.ok, 'a publication carrying a member no spec declares MUST fail').toBe(false)
    expect(spurious.extra, 'and the undeclared member is named').toEqual([tupleOf(['not-declared'])])
    expect(spurious.missing, 'while the declared direction is clean, so the two arms are separate').toEqual([])

    // (iv) A DUPLICATE LEAVES THE SETS EQUAL AND REDS ONLY THE COUNT — the one relation a set comparison cannot see.
    const duplicated = compareProjection([['a']].map(tupleOf), [['a'], ['a']].map(tupleOf))
    expect(duplicated.missing, 'a duplicate hides in the set comparison, exactly as this row says it does').toEqual([])
    expect(duplicated.extra, 'and it is not a spurious member either — it is multiplicity').toEqual([])
    expect(duplicated.counts.equal, 'so only the count arm can read it').toBe(false)
    expect(duplicated.ok, 'and the verdict as a whole MUST fail').toBe(false)

    // (v) A SEPARATOR INSIDE A SEGMENT IS A DIFFERENT ADDRESS — the arm the tuple rule exists for.
    const collision = compareProjection([tupleOf(['a/b'])], [tupleOf(['a', 'b'])])
    expect(collision.ok, 'a joining comparator would call this a match and this one does not').toBe(false)
    expect(collision.missing, 'the declared member is missing under the tuple spelling').toEqual([tupleOf(['a/b'])])
    expect(collision.extra, 'and the published one is spurious under it').toEqual([tupleOf(['a', 'b'])])

    // (vi) THE DECLARATIONS' `id` HALF IS LOAD-BEARING — two families at ONE address are two different declarations, which is
    //      why `(c)` keys them by `(address, id)` and not by the address alone.
    const oneDeclaration = { address: ['a'] as readonly string[], id: 'a-must-stand', constraint: () => true as const }
    const anotherDeclaration = { address: ['a'] as readonly string[], id: 'a-must-stand-too', constraint: () => true as const }
    const byId = compareProjection([declarationKeyOf(oneDeclaration)], [declarationKeyOf(anotherDeclaration)])
    expect(byId.ok, 'a declaration whose id moved is NOT the declared one, so an address-only key would have passed it').toBe(false)
    expect(byId.missing, 'and the declared one is named').toEqual([declarationKeyOf(oneDeclaration)])
    expect(byId.extra, 'while the published one is spurious').toEqual([declarationKeyOf(anotherDeclaration)])

    // (vii) AND THE PUBLICATION IS DRIVEN ONE MEMBER AT A TIME ON THE MODULE'S OWN LISTS — every declared root participates, so
    //       a projection that dropped ONE of them reds here and not only on a divergent pair of this falsifier's making. **NO
    //       ARM MAY BE FILTERED OUT TO MAKE THE ROW GREEN**, and the drop is BY ADDRESS AND NEVER BY INDEX: the tuple's order
    //       is consumed by nothing and is not this row's to assert.
    declaredRoots.forEach((root) => {
      const withoutIt = compareProjection(
        declaredRoots.map((declared) => tupleOf(declared.address)),
        publishedRoots.map((published) => tupleOf(published.address)).filter((key) => key !== tupleOf(root.address)),
      )
      expect(withoutIt.ok, `dropping the publication of ${tupleOf(root.address)} MUST fail — every declared root is compared`).toBe(false)
      expect(withoutIt.missing, 'and that root is the one named').toContain(tupleOf(root.address))
    })
  })
})
