// src/main/record-engine/display-family.ts — THE FAMILY OBJECT: one spec, its root, its declaration, and the two projections
// (`docs/L1/unit-b-1-record-engine-seam.md` §2's constraint paragraph and §4 site 3). Ported BY HAND from the foundation's family
// object (`../Provident-Electron/src/main/view-record/index.ts` at our pin `b312d83`: `ViewPairedFamily` `:1297`,
// `ViewUnpairedFamily` `:1316`, `ViewFamilySpec` `:1330`, `ViewFamily` `:1336`, `viewFamily` `:1349`, `VIEW_FAMILIES` `:1374`,
// `viewConstraintDeclarations` `:1414`, `viewDeclaredRoots` `:1455`) and never vendored (`ASM-B-1`, D-9).
//
// **THE `tag` DISCRIMINANT IS LOAD-BEARING, AND THIS IS THE ONE THING A HAND-PORT GETS WRONG** (`forking.md` §2.5, `:214-219`):
// a `paired` spec requires `id` AND `body`; an `unpaired` spec declares them as OPTIONAL `never` — and the `?` is load-bearing in
// both directions, because a REQUIRED `never` could not be satisfied by the lawful unpaired control. Without the tag, a paired spec
// that dropped its `body` compiles as a lawful unpaired one; the tag closes the OMISSION and the `never` closes the CARRIAGE. The
// guarantee is ONE-DIRECTIONAL: **a root with no declaration is lawful and stays expressible** — our `display` family is PAIRED,
// and the unpaired arm is carried because the object must EXPRESS it.
//
// **THE OBJECT DECLARES AND NEVER REGISTERS.** It mints no entry, no handle and no store verb: the ONE registration per address is
// the construction's (the delivery's entries, adopted by the caller), and that split is why `FH-1`/`FH-2` compare two INDEPENDENT
// lists rather than one list with itself.
//
// **THE TWO HALVES ARE ONE DECLARATION AND NOT TWO LISTS KEPT IN STEP** (`D-292`'s ruling, ported): a spec carries its root and its
// declaration together, `root` is a VALUE built once (the delivery is built before the store is bound), and `declaration(getStore)`
// is a PROJECTION whose body factory is called INSIDE it — once per call, never at module scope, because a body built at module
// scope would close over a handle that does not exist yet.
//
// **THE ONE CONSTRAINT: `display-must-stand`, ONE DECLARATION AT `['display']`, TWO INSTANTS AND THE FOUNDATION'S OWN ORDER**
// (`panesMustStand`, `:1047-1067`; the write-instant guard `:871`; `nodeOf` `:880`):
//   (1) **ABSENCE AT THE ROOT** — `context.value` is not a plain record and the pass is at the family's own address — is REPAIRED
//       with the module's placeholder, through the module's ONE repair-write path. This is the hunk without which a per-tab write
//       cannot land at all: a nested write does not create its parent.
//   (2) **A FAMILY THAT STANDS AND NAMES AN ENTRY THE PARSE CANNOT STATE** is REFUSED, with NO REPAIR, at a WRITE instant only —
//       because the read would drop that member while the source still said `'record'`, and because a corrupt value in a profile's
//       BYTES must not make the app unable to start (at a registration instant there is no standing record for a rollback to
//       protect, so the value arms answer `true` and refuse only where a write's own rollback exists).
//   (3) **AT OR BELOW A TAB ID** the landed value is ONE ENTRY and is judged AT ITS OWN NODE, never repaired: `context.value` is
//       the value the act LANDED and the pair sits at an ANCESTOR of the act's address, so answering a leaf value as absence would
//       write the placeholder AT THE ROOT and REPLACE the whole family — the caller's own value and every sibling tab with it —
//       inside a commit that still answered `committed`.
//
// **AND THE REGISTRATION INSTANT'S LAWFUL SHAPE WAS MEASURED AT THE INSTALLED RELEASE RATHER THAN ASSUMED FROM THE FOUNDATION**
// (`docs/L1/unit-b-1-record-engine-seam.md` §2's *"REGISTRATION INSTANT'S LAWFUL SHAPE"*, which is the other place a hand-port
// goes wrong). **THREE INSTANTS, THREE RECORDS, AND NO ONE OF THEM IS "THE OTHER ONE PLUS A MEMBER"** (`RUN`, measured at the
// INSTALLED release by counting `Object.keys` on each record as it arrives):
//   · the CONSTRAINT BODY gets **five** members — `{address, tier, value, attempt, op}` — with **NO `write`**;
//   · a REGISTRATION repair gets **seven** — `{address, id, tier, value, op, pending, write}`;
//   · a LANDING repair gets **six** — `{address, id, op, tier, value, pending}` — and **NO `write`**, which is why the branch below
//     tests the record's own `write` member rather than the instant's name.
// The registration route takes the store's own **THREE** positions, `(address, tier, value)`, never a commit: supplying a fourth
// throws a `TypeError` BEFORE any store act, and the repair must therefore answer `{ok: true, op}` where `op` is THAT write's own
// returned op, so the body answers `true` on the registration's own RE-RUN. A repair that credits no op refuses the construction at
// rank 19 `ConstraintRefusedAtRegistration`, and an op that landed while the re-run still refuses is rank 20
// `ConstraintPassRefused`. **AT A LANDING INSTANT there is no `write` and there IS a `pending`**, so the repair falls to
// `store.write(address, tier, value, <the context's own commit>)` — measured to join that commit and to land, which is why both
// arms below exist and neither is dead code.


import type { StoreInstance, WriteRecord } from '../storeroom.js'
import {
  DISPLAY_UNUSABLE_MESSAGE,
  displayEntryAdmits,
  displayEntryMemberAdmits,
  displayPlaceholder,
  isPlainRecord,
  isPrototypeKey,
  type DisplayFamilyValue,
} from './display-shape.js'

/**
 * **THE TIER'S DOMAIN IS THE STORE'S OWN THREE WORDS** (`file` · `mem` · `temp`), spelled here rather than derived, because a
 * spec's `tier` is this module's own alias and a fourth word is refused AT THE MEMBER by the compiler (`FH-3 (e)`).
 */
export type DisplayTier = 'file' | 'mem' | 'temp'

/** **THE `display` FAMILY'S ADDRESS — ONE WHOLE VALUE AT ONE ROOT** (`ASM-B1-1`): one member per tab id beneath it, never one root
 *  per tab, because the store keeps one value per address and an address per tab would make the declaration set grow with the tab
 *  count. */
export const DISPLAY_ADDRESS: readonly string[] = ['display']

/** The constraint's `id`: the pair's handle in the store's ONE namespace, and the name a refusal's log entries carry. */
export const DISPLAY_MUST_STAND_ID = 'display-must-stand'

/** **THE FAMILY'S TIER IS `file`, AND IT IS THE ONE THAT SURVIVES A RESTART** (`ASM-B-3`, D-23's *"reconstruct"*): a `mem` family
 *  cannot reconstruct anything, so the operator's display state is persisted — and a store built without a `filePath` can never
 *  reach this tier, which is why the caller supplies one at the one construction. */
export const DISPLAY_TIER: DisplayTier = 'file'

/** **WHAT A REPAIR ANSWERS, IN THE PACKAGE'S OWN TWO ARMS**: the credited arm carries the op THAT WRITE returned (`op` is required
 *  by the contract and is the store's own operation record), and the failed arm states its words rather than falling into silence.
 *  A repair that reached no route and holds no store says so with the failed arm. */
export type DisplayRepairAnswer =
  | { readonly ok: true; readonly op: WriteRecord['op'] | null }
  | { readonly ok: false; readonly message: string }

/** A repair is handed the instant's own record and answers one of the two arms above. */
export type DisplayRepair = (context: unknown) => DisplayRepairAnswer

/** **WHAT A CONSTRAINT BODY MAY ANSWER, IN THE PACKAGE'S CLOSED THREE-ARM SET**: `true`, a repairable violation, or one no repair
 *  answers — and the UNREPAIRABLE arm spells `repair?: never`, which is the whole of its job: written as a bare
 *  `{message: string}`, a `void` repair would ride it, because excess-property checking reads the union's whole member set. */
export type DisplayConstraintAnswer =
  | true
  | { readonly message: string; readonly repair: DisplayRepair }
  | { readonly message: string; readonly repair?: never }

/** One element of the batch the caller constructs the instance with: the pair's address, its handle, and its body. */
export interface DisplayConstraintDeclaration {
  readonly address: readonly string[]
  readonly id: string
  readonly constraint: (context: unknown) => DisplayConstraintAnswer
}

/** **ONE DECLARED ROOT AS ANOTHER MODULE READS IT — the address and the family's own tier.** The tier is the one the address is
 *  pinned to, and this module is its authority: `DISPLAY_TIER` is the only spelling of that word in this file. */
export interface DisplayDeclaredRoot {
  readonly address: readonly string[]
  readonly tier: DisplayTier
}

/** **THE PAIRED ARM: an address, a tier, an `id` AND a body factory — both required** (`D-292`). `body` is
 *  `(getStore) => body` and is called INSIDE `declaration(getStore)`, once per call and never at module scope. */
export interface DisplayPairedFamily {
  readonly tag: 'paired'
  readonly address: readonly string[]
  readonly tier: DisplayTier
  readonly id: string
  readonly body: (getStore: () => StoreInstance | null) => (context: unknown) => DisplayConstraintAnswer
}

/** **THE UNPAIRED ARM: A ROOT WITH NO DECLARATION, WHICH IS LAWFUL AND STAYS EXPRESSIBLE.** Its two paired members are optional
 *  `never`, and the `?` is load-bearing: a REQUIRED `never` could not be satisfied by this arm at all, so the optionality is what
 *  lets the arm exist — and the `never` closes the CARRIAGE, refusing an `id` or a body by the MEMBER'S TYPE rather than by a
 *  literal's freshness, which is the arm excess-property checking never reaches. */
export interface DisplayUnpairedFamily {
  readonly tag: 'unpaired'
  readonly address: readonly string[]
  readonly tier: DisplayTier
  readonly id?: never
  readonly body?: never
}

/** **THE SPEC IS A DISCRIMINATED UNION ON AN EXPLICIT TAG, AND BOTH HALVES OF THE REFUSAL ARE EXCESS-PROPERTY-CHECKING-
 *  INDEPENDENT**: the TAG closes the OMISSION and the `never` above closes the CARRIAGE. */
export type DisplayFamilySpec = DisplayPairedFamily | DisplayUnpairedFamily

/** **ONE FAMILY, DECLARED ONCE: A `root` THAT IS A VALUE AND A `declaration` THAT IS A PROJECTION.** The asymmetry between the two
 *  halves is the ORDER and not a taste: `root` is read with no store because the delivery is built before the store is bound, while
 *  a body reads nothing at the registration instant — so the half that needs a store is handed one and the half that does not is
 *  not. */
export interface DisplayFamily {
  readonly root: DisplayDeclaredRoot
  declaration(getStore: () => StoreInstance | null): DisplayConstraintDeclaration | null
}

/** **THE FACTORY, AND THE BODY FACTORY IT IS HANDED IS NEVER CALLED HERE**: a spec's `body` is called INSIDE
 *  `declaration(getStore)`, once per call, so neither this function nor `.root` builds one and nothing closes over a store that does
 *  not exist yet. **`declaration` ANSWERS `null` WHEN UNPAIRED — never `undefined`, never `{}`, never an absent member**: `null` is
 *  a value a projection must TEST, while an absent or empty arm is one `.filter` from being dropped silently.
 *
 *  **AND THE `tag`'S RUNTIME DOMAIN IS THIS FUNCTION'S, NOT ONLY THE COMPILER'S** (`B1-ADV-09`, MEASURED: a spec whose tag was a typo
 *  published a root with `declaration: null`, so no creation repair ever ran, the family never stood, and EVERY WRITE then answered
 *  the store's own `AddressNotFound` — a silent degradation with a loud symptom three layers away). So an unknown tag THROWS a
 *  `TypeError`: this is a PROGRAMMING error and there is no caller input path to answer with a refusal record. **IT IS A DELIBERATE
 *  DIVERGENCE FROM THE DESIGN SOURCE**, which lets such a spec fall into the unpaired arm silently; the reason this fork refuses it is
 *  that `DISPLAY_FAMILIES` is built at module scope, where "silently unpaired" and "correctly published" are one typo apart and no
 *  row downstream can tell them apart. `docs/L2/record-engine/interface.md` §6 records the divergence with this measurement. */
export function displayFamily(spec: DisplayFamilySpec): DisplayFamily {
  const tag = (spec as { readonly tag?: unknown }).tag
  if (tag !== 'paired' && tag !== 'unpaired') {
    throw new TypeError(
      `displayFamily: a spec's \`tag\` must be 'paired' or 'unpaired', and this one is ${String(tag)}: a spec outside the two arms ` +
        'would publish a root with no declaration, and the family would then never stand',
    )
  }
  const root: DisplayDeclaredRoot = { address: spec.address, tier: spec.tier }
  if (spec.tag !== 'paired') {
    return { root, declaration: (): null => null }
  }
  const paired: DisplayPairedFamily = spec
  return {
    root,
    declaration(getStore: () => StoreInstance | null): DisplayConstraintDeclaration {
      return { address: paired.address, id: paired.id, constraint: paired.body(getStore) }
    },
  }
}


/** The instant a body is asked at, read off its own context: a REGISTRATION instant hands `tier: null`, and a WRITE's landing
 *  instant hands it set. The distinction is load-bearing rather than tidy — answering the unrepairable arm at a registration
 *  instant refuses the CONSTRUCTION, so a corrupt value in a profile's bytes would make the app unable to start. */
const writeInstant = (context: unknown): boolean =>
  isPlainRecord(context) && context['tier'] !== null && context['tier'] !== undefined

/** **THE NODE A PASS IS AT, RELATIVE TO THE FAMILY'S ROOT — A SUBTRACTION, NOT A GUESS.** A pass is asked at the WRITE's own
 *  address, so the family's root is a PREFIX of it and the remainder names the node the value is: `[]` at the root,
 *  `['<tabId>']` at a tab, and nothing deeper is reachable — the store's own address domain refuses a third segment under a
 *  two-segment record before any pass runs (measured: `WriteParentNotLink`). `null` where the context names no address under this
 *  root, which is an arm no measured act reaches and the one that must not refuse. */
const nodeOf = (context: unknown): readonly string[] | null => {
  const at = isPlainRecord(context) ? context['address'] : undefined
  if (!Array.isArray(at) || at.length < DISPLAY_ADDRESS.length) return null
  for (let index = 0; index < DISPLAY_ADDRESS.length; index += 1) {
    if (at[index] !== DISPLAY_ADDRESS[index]) return null
  }
  return at.slice(DISPLAY_ADDRESS.length) as readonly string[]
}

/** **THE WHOLE-FAMILY JUDGEMENT: a plain record whose every member is a tab id the address can carry and an entry the ONE parse
 *  states.** Every member is judged, so a family naming one unstatable entry is refused — which is the opposite disposition from the
 *  READ's, and deliberately: the read answers the declared absence rather than dropping a member, and this is exactly why a value
 *  that would lose a member must be refused BEFORE it lands (`D-105`).
 *
 *  **AND THE KEY SPACE IS JUDGED WITH THE ENTRIES** (`B1-ADV-05(a)`): a member named `__proto__`, `constructor` or `prototype` is a
 *  PROTOTYPE key rather than a tab id, so a family carrying one is one the read cannot state — refused here at the instant a caller
 *  could still be told, rather than persisted and then discovered by a reader whose object model it has joined. Every entry is judged
 *  by the parse, which is the allowlist AND the crossing's boundary (`B1-ADV-01`/`B1-ADV-02`). */
const displayFamilyAdmits = (held: unknown): held is DisplayFamilyValue =>
  isPlainRecord(held) &&
  Object.entries(held).every(
    ([tabId, entry]) => tabId.length > 0 && !isPrototypeKey(tabId) && displayEntryAdmits(entry),
  )


/**
 * **THE MODULE'S ONE REPAIR-WRITE PATH — AND IT BRANCHES ON THE RECORD'S OWN `write` MEMBER, NEVER ON THE INSTANT'S NAME.**
 *
 * A REGISTRATION-instant record CARRIES a `write` function and the store's own THREE positions: a fourth there is a `TypeError`
 * thrown before any store act, so naming the commit would refuse the registration rather than make the family stand. A
 * LANDING-instant record carries NO `write`, and the commit it is part of must be named at the store's fourth position — the
 * context IS a commit carrier, so the write JOINS the commit that asked the repair rather than opening a second one.
 *
 * **BOTH ARMS ANSWER `{ok: true, op}` WHERE `op` IS THAT WRITE'S OWN RETURNED OP** — the credit the registration's re-run turns
 * on — and the failed arm is STATED rather than fallen into: a repair that reached no route and holds no store says so, and a
 * landing record that names no commit is not written here at all.
 */
export function repairDisplay(getStore: () => StoreInstance | null): DisplayRepair {
  return (context: unknown): DisplayRepairAnswer => {
    const route = isPlainRecord(context) ? context['write'] : undefined
    if (typeof route === 'function') {
      const routeWrite = route as (address: readonly string[], tier: DisplayTier, value: unknown) => WriteRecord
      // THREE POSITIONS, AND NO FOURTH: supplying the commit here is the refusal this branch exists to avoid.
      const receipt = routeWrite(DISPLAY_ADDRESS, DISPLAY_TIER, displayPlaceholder())
      return { ok: true, op: receipt.op }
    }
    const store = getStore()
    if (store === null) {
      return { ok: false, message: 'the display family does not stand, and this repair reached no write route' }
    }
    if (!isPlainRecord(context) || !Object.hasOwn(context, 'pending')) {
      // A LANDING record that names no commit is not written here: the failed arm, never a second attempt's write.
      return { ok: false, message: 'the display family does not stand, and this repair was handed no commit to create it in' }
    }
    // THE FOURTH POSITION IS THE COMMIT THE ASKING ACT OPENED — and the context IS that carrier, which is the class the store's own
    // position tests. The double cast is what the position's class test costs: a `Record<string, unknown>` overlaps its carrier by
    // nothing the compiler can see, while the runtime's own test (an own `pending` on a non-null, non-array object) is what the
    // `Object.hasOwn(context, 'pending')` arm above already took.
    const receipt = store.write(
      DISPLAY_ADDRESS,
      DISPLAY_TIER,
      displayPlaceholder(),
      context as unknown as Parameters<StoreInstance['write']>[3],
    )
    return { ok: true, op: receipt.op }
  }
}

/**
 * **`display-must-stand` — THE FAMILY'S ONE INVARIANT, AND ITS THREE ARMS ARE `docs/L1/…-seam.md` §2's.**
 *
 * It JUDGES `context.value` AND NEVER REACHES FOR THE INSTANCE, because at the construction instant the caller's holder is
 * genuinely unassigned (it is bound only after the construction answers), so a body that read through a handle would abstain at
 * the exact instant it is the only one that can act. A registration instant hands the body the CURRENT VALUE at its own address,
 * so absence needs no handle — and the handle is wanted by the REPAIR alone, which runs at an instant where the route is on the
 * record or one exists.
 *
 * **THE FIRST ARM IS ABSENCE AND IT IS THE FAMILY ROOT'S**; **the second is the VALUE's** and it is guarded by the write instant;
 * **the third is the leaf's**, where the landed value is ONE entry and the repair is never reached; **and the fourth is a MEMBER's**
 * (`['display', <tabId>, <member>]`), which the store's three-segment address domain makes reachable when the entry stands — so it
 * is judged at ITS OWN NODE by the one parse's member arm, on the member's NAME as well as its value. **A WRITE AT OR BELOW A TAB ID
 * IS NEVER REPAIRED**, and the depth that cannot be reached at all — a fourth segment — is answered `true`: the arm is stated rather
 * than silently omitted.
 *
 * **`D-105`'S ARM AND ITS ACTUAL REACH, STATED HERE BECAUSE IT IS EASY TO OVER-READ** (`B1-ADV-03`): this body judges the value the
 * act LANDED, at the node the act's own address names. So a ROOT write is judged as a whole family, a TAB write as one whole entry
 * (allowlist, every member's domain, the crossing's boundary), and a MEMBER write as one name and one value. **WHAT IT NEVER SEES IS
 * A SIBLING** — the store asks the pair about this act's address and hands it this act's value, not the family around it. A member
 * that arrived from an OUTSIDE writer (an older image, a second process, a store built without this pair) therefore has no write
 * instant to answer it, and the arm that answers it is the READ's: `record.ts`'s read answers the DECLARED ABSENCE for a family it
 * cannot state whole rather than dropping the member — never a partial reading that claims `'record'` while losing what it could not
 * state. That split is what makes it true that no path through THIS MODULE's writes can leave the store holding a member the read
 * cannot state.
 */

export const displayMustStand =
  (getStore: () => StoreInstance | null) =>
  (context: unknown): DisplayConstraintAnswer => {
    const held = isPlainRecord(context) ? context['value'] : undefined
    const node = nodeOf(context)
    // ── (1) ABSENCE IS JUDGED AT THE ROOT AND NOWHERE ELSE: only the family's own address holding nothing is the fault the
    // ── repair answers. A value landed at or below a tab id is a MEMBER of the family, and a scalar there is the shape a leaf
    // ── write legitimately carries — never the absence of the family.
    if ((node === null || node.length === 0) && !isPlainRecord(held)) {
      return { message: DISPLAY_UNUSABLE_MESSAGE, repair: repairDisplay(getStore) }
    }
    if (node === null) return true
    // ── (2)/(3)/(4) THE VALUE ARMS, AT THE NODE THE WRITE IS AT: the whole family at the root, ONE entry at a tab id, and ONE
    // ── member at a member's own node. Nothing deeper is in the store's address domain.
    const admits =
      node.length === 0
        ? displayFamilyAdmits(held)
        : node.length === 1
          ? displayEntryAdmits(held)
          : node.length === 2
            ? displayEntryMemberAdmits(String(node[1]), held)
            : true
    if (admits) return true
    // REFUSED WITH NO REPAIR, AND ONLY WHERE A WRITE'S OWN ROLLBACK EXISTS: at a registration instant there is no standing record
    // to protect, and refusing there would refuse the CONSTRUCTION over a value the profile's bytes happen to carry.
    return writeInstant(context) ? { message: DISPLAY_UNUSABLE_MESSAGE } : true
  }

/** **THE TUPLE — ONE DECLARATION PER FAMILY, AND THE TWO PUBLICATIONS BELOW ARE ITS PROJECTIONS.** Every `address`, `id` and `tier`
 *  here is the exported constant above, so this list re-spells nothing and a family that moves one of them moves in ONE place.
 *  **IT IS EXPORTED AS PART OF THE CONTRACT AND NOT AS A TEST CONVENIENCE**: a row that measures the object's contract must read
 *  the object's own declaration set, and a module-private tuple would leave that claim measured by nothing. **AND IT MINTS NO
 *  ENTRY, NO HANDLE AND NO STORE VERB.** */
export const DISPLAY_FAMILIES: readonly DisplayFamily[] = [
  displayFamily({
    tag: 'paired',
    address: DISPLAY_ADDRESS,
    tier: DISPLAY_TIER,
    id: DISPLAY_MUST_STAND_ID,
    body: displayMustStand,
  }),
]

/** **THE BATCHED DECLARATIONS, COLLECTED BY THE CALLER** — a projection of `DISPLAY_FAMILIES` that spells no address, id or body of
 *  its own: every element is a PAIRED spec's `declaration(getStore)`, and an unpaired spec's explicit `null` is dropped HERE, at
 *  the projection, which must test it. **The return is TYPED** where the store's own licence would admit `void`, so a body or a
 *  repair that answers nothing is a compile error here. */
export function displayConstraintDeclarations(getStore: () => StoreInstance | null): readonly DisplayConstraintDeclaration[] {
  return DISPLAY_FAMILIES.map((family) => family.declaration(getStore)).filter(
    (declaration): declaration is DisplayConstraintDeclaration => declaration !== null,
  )
}

/** **THE ROOTS THIS FAMILY DECLARES, EACH WITH THE TIER IT IS DECLARED AT — as a projection of the tuple, in the tuple's order.**
 *  It spells no address and no tier of its own, so a family that moves one moves in ONE place; and the delivery's own address
 *  array is deliberately NOT derived from it, which is what makes the entries↔roots row a comparison of two independent lists. */
export function displayDeclaredRoots(): readonly DisplayDeclaredRoot[] {
  return DISPLAY_FAMILIES.map((family) => family.root)
}
