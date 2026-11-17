// tests/unit/record-engine/seam-census.test.ts — unit `B-1` `record-engine-seam`'s red-set arm `(f)` plus the SEAM'S OWN
// CENSUS: `src/main/storeroom.ts` is the ONE file that spells `provident-storeroom`, and the declared surface it publishes is
// RE-MEASURED against the INSTALLED package rather than copied down from the foundation's head.
//
// **IT IS RED ON ARRIVAL AND THAT IS THE RED-FIRST EVIDENCE** (RCA-1): `src/main/storeroom.ts` does not exist at this head, so
// the import fails AND the file census answers `[]` where the contract's §5(f) requires exactly
// `['src/main/storeroom.ts']`. No line here moves to make the tree compile.
//
// **WHY THE CENSUS IS A ROW AND NOT A HABIT** (§5(f), the foundation's `S-9` closure rule): a second `src/**` file that names
// the package is a second seam — the surface would be pinned in two places and a member could be re-spelled in one of them.
// The path in the expected list is the CONTRACT's own (§4 site 1 names the file and says "the ONE file that spells
// `provident-storeroom`"), never a figure this row derives: a census cannot derive its own subject.
//
// **AND THE CENSUS FIGURE IS `DEFECTS.md` `F-3`'s**: the foundation's declared census was measured at `1.9.3`/`1.10.0` while
// `package.json` declares `^1.11.0`, so this unit OWNS the re-measure. What that means for this row is the shape of its
// assertions: **the member list and the `memberCount` literal are compared with the INSTANCE** — `Object.getOwnPropertyNames`
// on a fresh store — so a stale literal reds here rather than passing by `length`, and **the construction-instant
// `Object.getOwnPropertySymbols` count is compared with the module's `symbolCount` literal** for the same reason. A copied-down
// `13` (the foundation's figure at `1.9.3`) reds against an instance that answers anything else.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT the store's own behaviour under a write, a
// constraint or a refusal beyond the two readings §3 asked for (`commitLog`'s discipline and the absent-`filePath` register);
// NOT the family, its placeholder, its repair or its tier — `display-admission.test.ts`, `delivery.test.ts` and
// `display-record.test.ts`; NOT the delivery's entries or the roots — `declared-entries.test.ts` (`FH-1`/`FH-2`); NOT a
// `--external` clause, a bundle or a boot — `package.json` and `src/main/main.ts` are outside this unit's write scope (§1
// scope ruling 1); and **NOT the names of the symbols** — the symbol list is INTERNAL and the module pins a COUNT only, so this
// row reads the count and never a symbol's spelling.
//
// LAYER: `[T]`/envelope, plus a filesystem census over this repo's own `src/` tree. Nothing here paints.
import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  DEFAULT_JOURNAL_LENGTH,
  STOREROOM_DECLARED_SURFACE,
  commitLog,
  createProfileStore,
} from '../../../src/main/storeroom.js'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))

/** One value's byte spelling, for the comparisons that must be byte-identical rather than merely deep-equal. */
const jsonOf = (value: unknown): string => JSON.stringify(value)

/** **THE ONE `src/**` FILE THE CONTRACT ALLOWS TO SPELL THE PACKAGE** (§4 site 1, §5(f)) — the path is the CONTRACT's, and it
 *  is spelled with forward slashes because that is how this census reports every path it walks. */
const THE_ONE_SEAM = ['src/main/storeroom.ts']

/** Walk `src/**` for `.ts` files, deepest first, so nothing is skipped by a shallow read. */
function walkSources(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...walkSources(path))
    else if (entry.name.endsWith('.ts')) found.push(path)
  }
  return found
}

let tempDir = ''
let filePath = ''

afterAll(() => {
  if (tempDir !== '') rmSync(tempDir, { recursive: true, force: true })
})

describe('record-engine · arm (f) — the seam census: ONE `src/**` file spells `provident-storeroom`', () => {
  it('(f) · EXACTLY ONE FILE NAMES THE PACKAGE — the census over `src/**/*.ts`, quoted as repo-relative paths', () => {
    const sources = walkSources(join(ROOT, 'src'))
    // NON-VACUITY: an empty or shallow walk cannot satisfy the negative below, and this tree's `src/` is not empty.
    expect(sources.length, 'the walk found source files, or an empty walk would answer "exactly one file" for free').toBeGreaterThan(0)
    const importers = sources
      .filter((file) => readFileSync(file, 'utf8').includes('provident-storeroom'))
      .map((file) => relative(ROOT, file).split('\\').join('/'))
      .sort()
    expect(
      importers,
      [
        'a second `src/**` file naming the package is a SECOND SEAM: the surface would be pinned in two places and a member',
        'could be re-spelled in one of them. The one file is `src/main/storeroom.ts` (§4 site 1).',
      ].join(' '),
    ).toEqual(THE_ONE_SEAM)
  })

  it('(f) · AND THE ONE FILE IS NOT A VACUOUS HIT — it actually carries the package’s own import, not a comment about it', () => {
    // The census above is a substring test, so a file that merely MENTIONED the package in prose would satisfy it. This arm
    // reads the module's own text for the import FORM, which is what makes the seam a seam. (The module is imported at the top
    // of this file too, so a missing module reds before this row runs: the reading is of the SUBJECT, not of the runtime.)
    const seam = readFileSync(join(ROOT, 'src/main/storeroom.ts'), 'utf8')
    expect(seam.length, 'the seam module has a body, so the two arms below are readings of something').toBeGreaterThan(0)
    expect(
      /from\s+['"]provident-storeroom['"]/.test(seam),
      'the seam imports the package by its own specifier — the census is about a real seam and not about a mention in prose',
    ).toBe(true)
  })
})

describe('record-engine · the declared surface RE-MEASURED against the installed package', () => {
  it('STOREROOM_DECLARED_SURFACE · the member list and the `memberCount` literal agree with EACH OTHER before either is compared with an instance', () => {
    // **THIS IS THE LITERAL'S OWN ROW, AND IT IS WHY A DUPLICATED LIST CANNOT HIDE**: `memberCount` exists so that a package
    // which silently grows a member fails the census instead of passing by length, and the two figures being ONE fact means a
    // half-edit reds here rather than at the instance.
    expect(STOREROOM_DECLARED_SURFACE.members.length, 'the declared census lists members at all').toBeGreaterThan(0)
    expect(
      STOREROOM_DECLARED_SURFACE.members.length,
      `the literal \`memberCount\` (${STOREROOM_DECLARED_SURFACE.memberCount}) must equal the list it counts, or the census is half-edited`,
    ).toBe(STOREROOM_DECLARED_SURFACE.memberCount)
    expect(
      STOREROOM_DECLARED_SURFACE.symbolCount,
      'the symbol count is a construction-instant figure and a count of internal symbols is non-zero on any instance that carries one',
    ).toBeGreaterThan(0)
  })

  it('STOREROOM_DECLARED_SURFACE · the INSTANCE’s own members, IN THE INSTANCE’S OWN ORDER, are the declared list — the order is the PACKAGE’S, and a stale literal or a reordered one reds here', () => {
    // A FRESH INSTANCE AND NO FILE PATH: the census is read AT CONSTRUCTION (§3: "the construction-instant `symbolCount`"), the
    // one instant every construction path shares, and a store built without a `filePath` reaches no filesystem act at all.
    const store = createProfileStore({})
    const names = Object.getOwnPropertyNames(store)
    expect(
      names.length,
      `the INSTALLED package answers ${names.length} own member(s) while the module declares ${STOREROOM_DECLARED_SURFACE.memberCount} — ` +
        're-measure the census at the installed release (`docs/defects.md` F-3 is this figure\'s source)',
    ).toBe(STOREROOM_DECLARED_SURFACE.memberCount)
    // **THE COMPARISON IS ORDERED AND THAT IS THE CONTRACT'S OWN READING** (§5(f)): the declared list is a reading of the order
    // `Object.getOwnPropertyNames` reports (`storeroom.ts`'s own wording: "the order `getOwnPropertyNames` reports them"), and that
    // order is a claim the contract PINS — the package's, not a caller's. So an ordered comparison is the correct one and a set
    // comparison would be strictly weaker: it would pass a declared list that had been re-sorted by hand.
    expect(
      jsonOf(names),
      `the instance's member list, IN THE PACKAGE'S OWN ORDER as \`getOwnPropertyNames\` reports it, must be the declared list (an ordered comparison: the order is the package's, and a set comparison would let a re-sorted declaration through): read ${jsonOf(names)} against ${jsonOf([...STOREROOM_DECLARED_SURFACE.members])}`,
    ).toBe(jsonOf([...STOREROOM_DECLARED_SURFACE.members]))
  })

  it('STOREROOM_DECLARED_SURFACE · the construction-instant SYMBOL count, re-measured on the instance and compared with the declared literal', () => {
    // **THE ONE FIGURE THAT MOVES BETWEEN RELEASES** (§3: it moved with `1.9.0` and again with `1.9.1`), and the reason this
    // row derives it from the instance instead of trusting the module: a literal copied from the foundation's head is exactly
    // the drift `F-3` records. **THE NAMES ARE NOT ASSERTED** — the symbol list is internal and the module pins a count only.
    const first = createProfileStore({})
    const second = createProfileStore({})
    const symbols = Object.getOwnPropertySymbols(first)
    expect(
      symbols.length,
      `the INSTALLED package answers ${symbols.length} own symbol(s) at construction while the module declares ` +
        `${STOREROOM_DECLARED_SURFACE.symbolCount} — the census is stale against this install, and a copied-down figure is how it goes stale`,
    ).toBe(STOREROOM_DECLARED_SURFACE.symbolCount)
    expect(
      Object.getOwnPropertySymbols(second).length,
      'two fresh constructions answer the SAME construction-instant count, so the figure is a property of the release and not of one instance',
    ).toBe(symbols.length)
  })

  it('ProfileStoreOptions · `createProfileStore()` WITH NO ARGUMENT constructs, and `DEFAULT_JOURNAL_LENGTH` is the journal it opens with', () => {
    // §3's `ProfileStoreOptions` is all-optional and `createProfileStore(opts: ProfileStoreOptions = {})`: an absent argument is
    // the ordinary no-constraint, no-listener store, which is what the boot's second act is not but what every row here is.
    expect(Number.isInteger(DEFAULT_JOURNAL_LENGTH), 'the default journal length is an integer figure the seam states').toBe(true)
    expect(DEFAULT_JOURNAL_LENGTH, 'and it is a journal length and not zero').toBeGreaterThan(0)
    expect(() => createProfileStore(), 'an absent argument list is in domain: the options record is all-optional').not.toThrow()
  })
})

describe('record-engine · `commitLog`’s `null` vs `[]` discipline (§3: `null` ≠ `[]`, and the seam throws nothing at any argument)', () => {
  it('commitLog · a record that was NEVER HANDED A LIST answers `null`, and NOT an empty array', () => {
    // §3: "`null` means *this record was never handed a list* and never *the list was empty*". The distinction is the whole
    // reason the accessor exists, so the absent arm is asserted on the values a caller actually passes: nothing, a non-object,
    // an object with no member, and an object whose member is not an array.
    expect(commitLog(null), 'a null record was never handed a list').toBeNull()
    expect(commitLog(undefined), 'an absent record was never handed a list either').toBeNull()
    expect(commitLog('a-record'), 'a string is not a record, and the answer is total rather than a throw').toBeNull()
    expect(commitLog({}), 'a plain object carrying no `log` member was never handed a list').toBeNull()
    expect(commitLog({ log: 'not-an-array' }), 'a member that is not an array is not a list, so the answer is `null` and not a coercion').toBeNull()
  })

  it('commitLog · a record HANDED AN EMPTY LIST answers `[]`, which is NOT `null` — the two arms are never folded', () => {
    // `[]` is *"the record was handed an empty one"* (§3's fourth clause: a refusal composed before any pass carries `[]`). A
    // seam that folded the two would make "no pass ran" indistinguishable from "no record was handed a list".
    const empty = commitLog({ log: [] })
    expect(empty, 'an empty list is answered as an empty list, never as the absent record').not.toBeNull()
    expect(Array.isArray(empty), 'and the answer is an array, so a caller can read its length without a guard').toBe(true)
    expect((empty ?? []).length, 'zero members, and it is the LIST\'s zero rather than the absent arm\'s `null`').toBe(0)
  })

  it('commitLog · a REAL passing write answers its commit’s entries as a COPIED, ENUMERABLE array — the member itself is not enumerable', () => {
    // §3: the log is carried NON-ENUMERABLY on a passing record, so a caller cannot pass the record on and expect the log to
    // travel. The reading here is the ACCESSOR's answer: an array with entries, surviving a JSON round trip (which is what
    // "copied into a fresh plain one" buys), and a FLOOR on the count because how many entries a commit appends is the
    // package's business and not this row's figure.
    const store = createProfileStore({})
    const receipt = store.write(['seam-census-probe'], 'mem', { value: 1 })
    const log = commitLog(receipt)
    expect(log, 'a passing top-level write was handed a list, so the answer is not the absent arm').not.toBeNull()
    expect(Array.isArray(log), 'and it is an array').toBe(true)
    expect((log ?? []).length, 'a passing write appends at least one entry, or the accessor answered an empty list').toBeGreaterThan(0)
    expect(
      (JSON.parse(JSON.stringify(log)) as unknown[]).length,
      'the answer survives serialisation, which is what the copy is for: the recorded member is NON-ENUMERABLE and would not travel',
    ).toBe((log ?? []).length)
  })

  it('commitLog · TOTAL AT EVERY ARGUMENT — no argument of any shape makes the seam throw', () => {
    // §3: "this seam throws nothing, at any argument". Driven over the shapes a caller could actually produce, one at a time,
    // including the two a `typeof` guard forgets (a function and a number).
    const arguments_: readonly unknown[] = [
      null,
      undefined,
      0,
      Number.NaN,
      'text',
      true,
      () => undefined,
      [],
      [1, 2, 3],
      {},
      { log: null },
      { log: {} },
      { log: [null, 'text', 7] },
      Symbol('a-record'),
      10n,
    ]
    arguments_.forEach((argument) => {
      expect(() => commitLog(argument), `\`commitLog\` must answer for any argument and never throw: ${String(argument)}`).not.toThrow()
    })
  })
})

describe('record-engine · the absent `filePath` — no file tier is opened, and a supplied one is passed through', () => {
  it('an ABSENT `filePath` leaves the register writable at its own tier, and a `file`-tier write is REFUSED with the address it refused', () => {
    // §3's `ProfileStoreOptions.filePath` note: "an absent `filePath` leaves the register at `mem`; a store's register tier is
    // FIXED at creation and never moves, so a store built without a `filePath` can never reach the `file` tier". **THE TWO
    // TIER WORDS ARE THE PACKAGE'S OWN PUBLIC VOCABULARY** (`file`/`mem`/`temp`) and the contract's §2/§3 name them as such —
    // they are not figures this module derives, and there is no export of them to read instead.
    const store = createProfileStore({})
    const probe = ['seam-census-probe']
    store.write(probe, 'mem', { value: 1 })
    // **`toEqual` AND NOT TWO STRINGS**: a read-back is the store's own round trip and its member ORDER is the store's
    // (`docs/L2/record-engine/interface.md` §6), so a value is compared member for member against a literal and never as a
    // canonicalised string — a string comparison here would be green by coincidence on a one-member value and would red on a
    // two-member one the day a member sorted differently.
    expect(store.read(probe), 'a write at the register’s own tier lands and reads back unchanged').toEqual({ value: 1 })


    let refusal: unknown = null
    try {
      store.write(['seam-census-file-probe'], 'file', { value: 1 })
    } catch (thrown) {
      refusal = thrown
    }
    expect(refusal, 'a `file`-tier write on a store with no `filePath` is REFUSED — nothing persisted without a path').not.toBeNull()
    const shape = refusal as { readonly status?: unknown; readonly address?: unknown }
    expect(typeof shape.status, 'the refusal is the package’s own form, carrying a status the caller can read').toBe('string')
    expect(
      Array.isArray(shape.address) ? jsonOf((shape.address as readonly unknown[]).map((segment) => String(segment))) : null,
      'and the refusal carries the ADDRESS it refused, so a caller can tell its own refused act from a sibling’s',
    ).toBe(jsonOf(['seam-census-file-probe']))
    expect(store.read(probe), 'and the refusal left the register it refused against exactly as it stood').toEqual({ value: 1 })

  })

  it('a SUPPLIED `filePath` is passed through — the `file` tier lands, and the temp directory carries the ONE file we named', () => {
    // The other half of the same reading, and it is what makes the arm above a measurement of the ABSENT path rather than of a
    // tier the package refuses everywhere. The directory is a `mkdtempSync` under `os.tmpdir()` and is removed in `afterAll`.
    tempDir = mkdtempSync(join(tmpdir(), 'record-engine-seam-census-'))
    filePath = join(tempDir, 'profile.store')
    const store = createProfileStore({ filePath })
    const probe = ['seam-census-file-probe']
    store.write(probe, 'file', { value: 1 })
    expect(store.read(probe), 'a `file`-tier write on a store that was given a path lands and reads back').toEqual({ value: 1 })

    expect(
      readdirSync(tempDir),
      'the store opened only the file the caller named — a second entry here would be a store the seam opened by itself',
    ).toEqual([basename(filePath)])
  })
})
