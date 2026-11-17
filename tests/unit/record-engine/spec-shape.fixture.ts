// tests/unit/record-engine/spec-shape.fixture.ts — `FH-3(e)`'s COMPILE-TIME FIXTURE: the five literals the `display`
// family's spec union MUST refuse and the two it MUST admit.
//
// **THIS FILE IS NOT A SUITE AND IS NOT COLLECTED AS ONE** (`vitest.config.ts`'s `include` is `tests/**/*.test.ts`, and this
// name is `*.fixture.ts`). It is the SUBJECT of `family-object.test.ts`'s `FH-3 (e)` row, which spawns
// `node_modules/.bin/tsc --noEmit --strict --skipLibCheck …` over it and asserts exit code 0. **Why a subprocess at all:**
// the foundation measures this arm with a `typecheck:tests` leg (`../Provident-Electron/tsconfig.tests.json`, whose
// `include` is the whole `tests/**` tree); this fork has NO such leg — `package.json` has no `typecheck:tests` key and
// `tsconfig.json` carries `include: ["src/**/*.ts"]` with `exclude: [… "tests"]` — so an `@ts-expect-error` written in a
// `*.test.ts` file here measures NOTHING (`vitest` transpiles without typechecking). This fixture plus the subprocess is
// the one callable route the unit takes instead, and `FH-3 (e)` reports the reading.
//
// **WHAT THE INSTRUMENT MEASURES, AND IT IS THE `@ts-expect-error` DIRECTIVE'S OWN SEMANTICS**: a directive passes only
// while the error it suppresses is REALLY THERE, so what makes these five a measurement rather than five comments is what
// a WIDENING does — make the unpaired arm's paired members optional `string`, give the paired arm's two members a `?`, or
// put a fourth word in the tier's domain, and the corresponding directive becomes UNUSED, which `tsc` reports as `TS2578`
// ("Unused '@ts-expect-error' directive") and the row reds. **THE PLACEMENT IS PART OF THE MEASUREMENT**: a MISSING-member
// error reports at the literal's OPENING (there is no member to point at), a refusal on a `never`-typed member reports AT
// THE MEMBER, and a wrong-typed member reports AT THE MEMBER — so one directive sits above a declaration and three above a
// member, and a directive one line off would silence the wrong error.
//
// **AND A MEMBER'S REFUSAL NAMES `undefined` RATHER THAN `never`**, which a reader checking the message against the
// contract could take for a mismatch: `readonly id?: never` makes the property type `never | undefined`, so a carried `id`
// reds as *"Type 'string' is not assignable to type 'undefined'"*. The `?` is load-bearing in both directions — a REQUIRED
// `never` member could not be satisfied by the lawful unpaired control below.
//
// **THE TWO ADMITTED CONTROLS ARE THE OTHER HALF OF THE CLAIM AND THEY ARE ALSO THE RUN ARMS**: `family-object.test.ts`
// imports them and drives them through `displayFamily`, so the union's refusal is proved by the compiler and its ADMISSION
// by `vitest`. A union that refused everything would pass the five directives and fail those two readings.
//
// **THE TIER VALUE IS TAKEN OFF THE MODULE'S OWN TUPLE AND NOT SPELLED** (`D-43`'s discipline, applied to a fixture): the
// spec needs one lawful tier word, and reading `DISPLAY_FAMILIES[0].root.tier` makes this file carry no figure of the
// module's at all. The foundation's `FH-3` spells `'file'` here through the published type; this row does not have to.
import { DISPLAY_FAMILIES } from '../../../src/main/record-engine/display-family.js'
import type {
  DisplayFamilySpec,
  DisplayPairedFamily,
  DisplayUnpairedFamily,
} from '../../../src/main/record-engine/display-family.js'

/** A LAWFUL TIER, READ OFF THE MODULE'S OWN DECLARATION (`D-43`): the spec needs one tier word to be a spec at all, and taking
 *  it from `DISPLAY_FAMILIES` keeps this fixture from being a second spelling of the tier's domain. **AN EMPTIED TUPLE IS
 *  `FH-3 (a)`/`(c)`'S RED AND NOT THIS FIXTURE'S**, so the read is guarded: this file must COMPILE for those rows to have an
 *  instrument at all. */
const A_TIER: DisplayPairedFamily['tier'] = (DISPLAY_FAMILIES[0]?.root.tier ?? undefined) as DisplayPairedFamily['tier']

/** A BODY THIS FIXTURE OWNS: it ignores its context and answers the passing arm, so no literal here touches a store — the
 *  subject is the SPEC SHAPE and a store act would be `FH-3 (d)`'s opposite. */
const aPassingBody = (): true => true

// ═══════════ THE TWO ADMITTED CONTROLS: these MUST compile, and they are the control that the union is not merely
// ═══════════ always-red — one lawful PAIRED spec and one lawful UNPAIRED spec, the latter a root with no pair, which the
// ═══════════ contract carries as LAWFUL and must stay expressible (§7 item 4, `forking.md` §2.5's `['drag']` precedent).
export const ADMITTED_PAIRED: DisplayPairedFamily = {
  tag: 'paired',
  address: ['a-subject'],
  tier: A_TIER,
  id: 'a-subject-must-stand',
  body: () => aPassingBody,
}
export const ADMITTED_UNPAIRED: DisplayUnpairedFamily = { tag: 'unpaired', address: ['a-lone-root'], tier: A_TIER }

// (1) A PAIRED SPEC THAT DROPPED ITS BODY — THE BLOCKER THIS WHOLE FORM EXISTS FOR (§7's `D-26`… the `tag` discriminant
//     "load-bearing": without it a paired spec that dropped its `body` compiles as a lawful unpaired one). The omission is
//     a MISSING member its own tagged arm requires, and the tag is what makes it NOT the other arm, whose tag is a
//     different literal — so no member set of the union admits it. **THE FIXTURE IS ANNOTATED WITH THE UNION ITSELF**, so
//     it is the TAG that selects the paired arm here and not this file's annotation.
// @ts-expect-error — a spec with no `body` is not a `DisplayFamilySpec`: *"Property 'body' is missing … but required in type 'DisplayPairedFamily'"*, reported at the literal's opening
export const REFUSED_NO_BODY: DisplayFamilySpec = { tag: 'paired', address: ['a-subject'], tier: A_TIER, id: 'a-subject-must-stand' }

// (2) A PAIRED SPEC THAT DROPPED ITS `id` — the same hole, one member over, and again at the UNION's own type.
// @ts-expect-error — a spec with no `id` is not a `DisplayFamilySpec`: *"Property 'id' is missing … but required in type 'DisplayPairedFamily'"*, also at the literal's opening
export const REFUSED_NO_ID: DisplayFamilySpec = { tag: 'paired', address: ['a-subject'], tier: A_TIER, body: () => aPassingBody }

// (3) AN UNPAIRED SPEC CARRYING AN `id` — REFUSED BY THE MEMBER'S TYPE, and the fixture is a DECLARED type, so a spec
//     hoisted to a `const` and spread reds exactly as a fresh literal would: this is the arm excess-property checking
//     never reaches, which is why the carriage is closed by the TYPE and not by literal freshness.
export const REFUSED_CARRIED_ID: DisplayUnpairedFamily = {
  tag: 'unpaired',
  address: ['a-lone-root'],
  tier: A_TIER,
  // @ts-expect-error — the unpaired arm declares `readonly id?: never`: carriage is refused by the TYPE, not by freshness
  id: 'a-subject-must-stand',
}

// (4) AN UNPAIRED SPEC CARRYING A BODY — the same member rule, the other member.
export const REFUSED_CARRIED_BODY: DisplayUnpairedFamily = {
  tag: 'unpaired',
  address: ['a-lone-root'],
  tier: A_TIER,
  // @ts-expect-error — `readonly body?: never` refuses a body an unpaired spec cannot have
  body: () => aPassingBody,
}

// (5) A FOURTH TIER WORD — the tier's domain is this module's own alias (the words the store has), so a word the store does
//     not have is refused AT THE MEMBER. **THE FIXTURE IS THE UNION'S TYPE AND IS OTHERWISE LAWFUL**, so the tier is the
//     only thing this literal can be refused for.
export const REFUSED_TIER: DisplayFamilySpec = {
  tag: 'paired',
  address: ['a-subject'],
  // @ts-expect-error — 'session' is not a tier this module's alias carries, reported AT THE MEMBER
  tier: 'session',
  id: 'a-subject-must-stand',
  body: () => aPassingBody,
}

// ═══════════ `FH-3 (f)`'s NARROWING CONTROL — THE ARM THAT PROVES THE TAG NARROWS, AND IT CARRIES NO DIRECTIVE:
// ═══════════ a directive here would be the row asserting that narrowing FAILS. Inside a `tag === 'paired'` branch
// ═══════════ `spec.id` IS a `string`, and that is what distinguishes the tagged union from the rejected
// ═══════════ `never`-without-a-tag form, where the arm is UNSTATED and `id` reads `string | undefined` in both arms, so
// ═══════════ every projection narrows at runtime with an `'id' in spec` test instead of by type. The row this file
// ═══════════ belongs to drives it a second time as a RUNTIME reading, because a compile-only control is exactly what the
// ═══════════ rest of this fork cannot measure.
export const narrowedIdOf = (spec: DisplayFamilySpec): string | null => (spec.tag === 'paired' ? spec.id : null)
