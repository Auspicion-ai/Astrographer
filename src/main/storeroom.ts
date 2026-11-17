// src/main/storeroom.ts — THE RECORD ENGINE'S SEAM: the ONE `src/**` file that spells the store package, ported by hand from
// the foundation's own seam (`../Provident-Electron/src/main/storeroom.ts` at our pin `b312d83`) and RE-MEASURED against the
// release installed here rather than copied down (`docs/L1/unit-b-1-record-engine-seam.md` §3/§4 site 1/§5(f)).
//
// WHAT THIS FILE IS, EXACTLY, AND WHAT IT IS NOT:
//
//  - IT IS the fork's ONE import of `provident-storeroom`, and that is a CENSUS-ENFORCED rule rather than a habit: a second
//    `src/**` file naming the package would be a SECOND SEAM — the surface pinned in two places, a member re-spellable in one
//    of them — so `tests/unit/record-engine/seam-census.test.ts`'s arm (f) walks `src/**/*.ts` and requires the importer list
//    to be exactly `['src/main/storeroom.ts']`. `tests/integration/record-engine/delivery.test.ts` sits on the same rule from
//    the other side: a module that could mint a store would have to spell the package, and only this one does.
//  - IT IS NOT a capability. Nothing here is exposed over MCP, rendered, or persisted to the operator's profile beyond what a
//    caller asks of the instance it constructs. The seam constructs a store and hands it to whoever asked; it wires nothing.
//  - IT IS NOT REACHABLE FROM THE BOOT at this head, and that is the unit's SCOPE RULING 1 rather than an oversight
//    (`docs/L1/unit-b-1-record-engine-seam.md` §1): the `build` leg carries `--external:electron` only, so the first `src/`
//    import reachable from `main.ts` would break it, and `package.json`'s `--external` clause belongs to the unit that owns the
//    boot's construction. `esbuild` therefore never reaches this module, `dist/main/main.cjs` carries no reference to the
//    package, and the wiring is a LATER unit's act.
//
// THE DECLARED SURFACE BELOW IS A CENSUS, NOT A DERIVATION, AND EVERY FIGURE IN IT WAS RE-MEASURED AT THE INSTALLED RELEASE.
// `docs/defects.md` `F-3` records the foundation's declared census as measured at `1.9.3`/`1.10.0` while this repo declares
// `^1.11.0`, so this unit OWNS the re-measure and answers `F-3` BY MEASUREMENT — on `provident-storeroom@1.11.0`, one fresh
// instance, `Object.getOwnPropertyNames` answering FIFTEEN names IN THE ORDER THIS FILE LISTS THEM and
// `Object.getOwnPropertySymbols` answering FOURTEEN at construction:
//   · **THE MEMBER LIST DID NOT MOVE INTO `1.11.0`**: the same fifteen the foundation read at `1.9.3`/`1.10.0`, `readTiered`
//     still third, so no rank of the list is re-spelled here and `memberCount` stays `15`;
//   · **THE SYMBOL COUNT DID MOVE, AND THE FOUNDATION'S `13` IS STALE AT THIS RELEASE**: `1.11.0` answers `14` own symbols at
//     construction (measured on the installed bytes, one fresh instance per arm: no `filePath`, a `filePath`, and empty
//     `listeners`/`constraints` — all three answer `14`), so this file declares **14** where the foundation declares `13`.
//     **AND ONE `write` INSTALLS ANOTHER**: the same store reads `15` after its first write, which is why the census is read
//     at CONSTRUCTION — the one instant every construction path shares — exactly as the foundation's own docblock reasons.
//  The two counts are stated as LITERALS beside the list so that a release which silently grows a member reds the census
//  instead of passing it by length (`memberCount` vs. the list it counts, and `symbolCount` vs. the instance).
//
// **AND THE CONSTRUCTION IS THREE REQUIRED POSITIONS, MEASURED RATHER THAN ASSUMED** (`1.11.0`): a `storeCreate` call with no
// `journalLength` refuses `ConstructionArgumentMissing` and one with no `listeners` refuses `AddressMalformed` before any
// filesystem act, so `createProfileStore` supplies all three keys — the journal length from `DEFAULT_JOURNAL_LENGTH`, and the
// two list keys as empty arrays — which is what makes `createProfileStore()` a lawful call with no argument at all.

import { storeCreate, type LogEntry, type StoreConfig, type StoreInstance, type WriteRecord } from 'provident-storeroom'

/** The store's own string members, in the order `getOwnPropertyNames` reports them — a READING of the installed instance, never
 *  a set the caller chooses: the census row compares this list with the instance's own order, so a re-sorted declaration reds. */
const MEMBERS = [
  'read',
  'readLiteral',
  'readTiered',
  'write',
  'delete',
  'rollback',
  'listen',
  'unlisten',
  'addConstraint',
  'constraintOn',
  'constraintOff',
  'constraints',
  'removeListener',
  'removeConstraint',
  'register',
] as const

/**
 * The declared surface census. `memberCount` is stated as a LITERAL so that a package which silently grows a member fails the
 * census instead of passing it by length, and `symbolCount` is the CONSTRUCTION-INSTANT figure `docs/defects.md` `F-3` owes a
 * re-measure — answered here at `1.11.0` as **14**, not the foundation's `13`.
 */
export const STOREROOM_DECLARED_SURFACE = {
  members: MEMBERS,
  memberCount: 15,
  /**
   * **Own symbols on the installed instance AT CONSTRUCTION; non-enumerable and internal, pinned as a COUNT only — never a
   * name.** The foundation declares `13`, read at `1.9.1`/`1.9.2`; the release installed here answers **14**, measured on the
   * installed bytes with one fresh instance per arm (no `filePath`, a `filePath`, empty list keys — all three `14`). **AND ONE
   * `write` INSTALLS A FIFTEENTH**, absent on a fresh store and present after the first write, which is the second reason this
   * figure is read at construction and at no other instant. The symbol list is INTERNAL: the census row reads the count and
   * never a symbol's spelling, so a release that renames one moves nothing here.
   */
  symbolCount: 14,
} as const

/** The journal length a profile store opens with when the caller does not decide. */
export const DEFAULT_JOURNAL_LENGTH = 4096

export interface ProfileStoreOptions {
  /** The journal length. Defaults to {@link DEFAULT_JOURNAL_LENGTH}. */
  journalLength?: number
  /** Pairs registered at construction. Defaults to none. */
  constraints?: StoreConfig['constraints']
  /** The listener entries adopted at construction. Defaults to none. */
  listeners?: StoreConfig['listeners']
  /** The file the `file` tier is backed by, where one is declared. ABSENT is in domain and leaves the register at `mem`: a
   *  store's register tier is FIXED at creation and never moves, so a store built without a `filePath` can never reach the
   *  `file` tier — and a `file`-tier write on such a store is refused with the address it refused. It is passed through only
   *  where a string is supplied: supplied and absent are not the same call. */
  filePath?: string
}

/**
 * Construct a profile store for this fork. No file tier is opened unless the caller supplies a `filePath`, nothing is persisted
 * without one, and no listener or constraint is registered unless the caller passes one — the defaults are the empty set, which
 * is what a fresh profile store is.
 *
 * **THE THREE CONFIG KEYS ARE SUPPLIED AND NONE IS LEFT TO THE PACKAGE'S DEFAULT, BECAUSE THE PACKAGE HAS NONE** (measured at
 * `1.11.0`): an absent `journalLength` refuses `ConstructionArgumentMissing` and an absent `listeners` refuses
 * `AddressMalformed`, both before any filesystem act. So `createProfileStore()` — the all-optional call the census row drives —
 * is lawful only because this function supplies them.
 */
export function createProfileStore(opts: ProfileStoreOptions = {}): StoreInstance {
  const config: StoreConfig = {
    journalLength: opts.journalLength ?? DEFAULT_JOURNAL_LENGTH,
    listeners: opts.listeners ?? [],
    constraints: opts.constraints ?? [],
  }
  // A SUPPLIED `filePath` is passed through and an absent one is left out, because the two are not the same call: an absent
  // `filePath` leaves the register at `mem`, and a supplied one is created exclusively at construction.
  return storeCreate(opts.filePath === undefined ? config : { ...config, filePath: opts.filePath })
}

/**
 * **THE MODULE'S TYPES, RE-EXPORTED SO NO OTHER `src/**` FILE HAS TO SPELL THE PACKAGE** (§4 site 1's one-seam rule, read for
 * types as well as values): a record family, a delivery and a client all need the store's own handle shape, and a second import
 * of the package — even a type-only one — would red the census row. So `StoreInstance` is the handle every `record-engine`
 * module is handed, `StoreConfig` is what this seam's options are built from, and `WriteRecord`/`LogEntry` are the two records a
 * caller reads (`commitTab`'s repair credits a `WriteRecord['op']`, and `commitLog` answers `LogEntry[]`).
 */
export type { LogEntry, StoreConfig, StoreInstance, WriteRecord }

/**
 * **THE COMMIT'S LOG, MATERIALIZED — AND THIS IS THE ONE DECLARED READER OF IT.** A passing act answers with the entries its
 * commit appended, at `record.log`; the member is NON-ENUMERABLE (a property read finds it, enumeration does not), so a caller
 * cannot pass the record on and expect the log to travel — this function COPIES the array into a fresh plain one, which is what
 * makes the answer survive every serialisation, and copies each entry so nothing served aliases the store's own state.
 *
 * **`null` ≠ `[]`, AND THE TWO MUST NEVER BE FOLDED.** `null` means *this record was never handed a list* — a bare value, a
 * non-object, an object with no `log` member, a member that is not an array, and the joined write a repair makes inside another
 * commit, whose record carries no `log` at all. `[]` means *the record was handed an empty one*: a refusal composed before any
 * pass carries exactly that, so `[]` reads as "no pass ran" and never as "nothing happened".
 *
 * `null` is also the answer for anything that is not an object, so a caller can treat the return as total and never catch: this
 * seam **throws nothing, at any argument**.
 */
export function commitLog(record: unknown): readonly LogEntry[] | null {
  if (record === null || typeof record !== 'object') return null
  // A PROPERTY READ FINDS A NON-ENUMERABLE OWN MEMBER; enumeration does not (measured).
  const carried = (record as { readonly log?: unknown }).log
  if (!Array.isArray(carried)) return null
  // COPIED ONE BY ONE, so neither the array nor an entry aliases the store's own release.
  return carried.map((entry) => ({ ...(entry as LogEntry) }))
}
