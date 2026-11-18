// tests/integration/record-engine/build-external.test.ts — unit `B-2` `display-wire`'s PROVE-IT ROW for the build's
// external, arm `(g)` of `docs/L1/unit-b-2-display-wire.md` §5 and §3 of the same document.
//
// **THE SUBJECT IS `package.json`'s OWN SCRIPT TEXT, NEVER A COPY.** §3 pins the change as: *both* esbuild invocations
// that bundle `src/main/main.ts` gain `--external:provident-storeroom` — the `build` script's first call and
// `build:watch`'s first call — and no other invocation gains it (preload, standalone, battery-host, renderer). The row
// reads those two strings out of `package.json`, finds the invocation whose entry point is `src/main/main.ts`, and reads
// the flag off THAT invocation.
//
// **AND IT IS MEASURED, NOT PREDICTED** (§5(g), `ASM-B1-4`): (g1) the flag is present on both main-bundling invocations;
// (g2) **the external is proved by CONTRAST** — the same invocation run TWICE, with the flag and without it, and the two
// emitted bundles compared; (g3) the REAL invocation exits 0 into a temp outfile and the output carries
// `require("provident-storeroom")`, which is what "an external `require` and none of its bytes" looks like from the
// bundle's side.
//
// **`(g2)`'S CONTRACT PREMISE WAS FALSIFIED BY MEASUREMENT (2026-11-17) AND THE ROW IS RE-GRAINED, NOT DELETED.** §5(g2)
// pinned *"running that same text with the flag stripped (into a temp outfile) exits NON-ZERO"*. Measured twice at this
// head, esbuild does **not** fail: it exits 0, reports `2.5mb ⚠️` (**a HISTORICAL reading — measured 2026-11-17 against
// `provident-storeroom@1.11.0`, with the seam landed; the row re-PRINTS the current pair on every run and pins no size as
// a literal**), and compiles the package's OWN sources into the bundle.
// No implementation can make that premise true, so the row now measures what IS true — the STRONGER claim, because the
// flag's real work is now visible: without it the build **succeeds silently and inlines the package**, i.e. it produces a
// bundle that cannot work at RUNTIME while reporting success. A silent inline is worse than a loud failure: a dead build
// is noticed, a wrong bundle ships. (g2) therefore asserts the flagged bundle carries the package as an EXTERNAL
// specifier and none of its bytes, and that the stripped twin still exits 0, is measurably LARGER, and carries the
// package's bytes under esbuild's own inline markers.
//
// **WHAT THIS ROW WILL NOT DO:** it never runs `npm run build` (that would rebuild the repo's `dist/` and could delete it
// first), it never writes inside the repo, and it never mutates `package.json`. Every esbuild run goes to a
// `mkdtempSync` outfile that `afterAll` removes; the binary is the repo's own `node_modules/.bin/esbuild`, invoked
// through `node:child_process` (`npm` is not consulted, so no cache and no network is involved).
//
// **THE FLAG'S SPELLING IS PINNED** (§5(g)'s amendment, and §3 spells the same token): the SINGLE token
// `--external:provident-storeroom`, on BOTH invocations that bundle `src/main/main.ts` — the `build` script's FIRST call
// and `build:watch`'s FIRST call. The two-token form `--external provident-storeroom` is esbuild-equivalent and is NOT
// admitted: one clause may not have two spellings, and the script already spells `--external:electron` this way. The row
// therefore asserts the exact token's presence (once, on the first call of each leg) AND the absence of the two-token
// form anywhere in the two scripts.
//
// LAYER (D-10, RCA-12): `[T]`/ENVELOPE — a build-script reading plus a real bundler run into a temp directory. No app
// boot, no Electron, no DOM, no network.
import { afterAll, describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..')
const PACKAGE_PATH = join(ROOT, 'package.json')
const ESBUILD_BIN = join(ROOT, 'node_modules', '.bin', 'esbuild')

/** §3/§5(g)'s pinned flag, spelled once in this file (it is the CONTRACT's literal, not a repo figure). §5(g)'s
 *  amendment pins the SPELLING too: the single token below, and NOT the two-token form esbuild also accepts. */
const EXTERNAL_FLAG = '--external:provident-storeroom'
const REFUSED_SPELLING = ['--external', 'provident-storeroom'] as const
/** The entry point every invocation under test bundles — §3's own subject. */
const MAIN_ENTRY = 'src/main/main.ts'
/** What the bundle must then say about the package (§3's second bullet). */
const BUNDLE_REQUIRE = 'require("provident-storeroom")'
/** **THE INLINE MARKERS — `(g2)`'s "none of its bytes", read off the two emitted bundles rather than predicted.**
 *  Without the flag esbuild compiles `src/main/storeroom.ts`'s import of the package straight into the bundle, and its
 *  CJS output says so twice over, in ITS OWN conventions (not this repo's strings, so they survive a source edit):
 *  (i) the INLINE-MODULE BANNER esbuild writes above every compiled-in module — measured **0** in the flagged build and
 *  **15** in the stripped one; (ii) the `import.meta` CJS SHIM esbuild synthesises for an inlined ESM module — measured
 *  **0** / **1**. **BOTH PAIRS ARE HISTORICAL COUNTS, taken 2026-11-17 against `provident-storeroom@1.11.0`; the row
 *  asserts each marker's PRESENCE / ABSENCE and never a count, so a version bump moves no assertion here.**
 *  The byte-size relation asserted below is the third, independent reading. Both markers are why this row
 *  could take the stronger, marker-based reading instead of falling back to sizes alone (the docblock above records it). */
const INLINE_BANNER = '// node_modules/provident-storeroom/'
const INLINE_META_SHIM = 'var import_meta = {}'

type AnyRecord = Record<string, unknown>

function show(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function msgOf(thrown: unknown): string {
  return thrown instanceof Error ? thrown.message : String(thrown)
}

function attempt(problems: string[], tag: string, run: () => string | null): void {
  let reading: string | null
  try {
    reading = run()
  } catch (thrown) {
    problems.push(`${tag} · the reading THREW before it completed: ${msgOf(thrown)}`)
    return
  }
  if (reading !== null) problems.push(`${tag} · ${reading}`)
}

/** `package.json`'s `scripts`, read from DISK — the subject, never a copy of it. */
interface Invocation {
  /** The script the invocation belongs to (`build` or `build:watch`). */
  readonly script: string
  /** The invocation's own text, byte-for-byte as the script spells it. */
  readonly text: string
  readonly argv: readonly string[]
}

function readScripts(): Record<string, string> {
  const raw = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8')) as { scripts?: Record<string, string> }
  return raw.scripts ?? {}
}

/** Split one script into its shell invocations. `&&` and a bare `&` (the `build:watch` separator) both start a new one;
 *  the scripts under test use no quoting, so a whitespace split is the tokenisation esbuild's own call sees. */
function splitInvocations(script: string, text: string): Invocation[] {
  return text
    .split(/\s*(?:&&|&)\s*/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((part) => ({ script, text: part, argv: part.split(/\s+/).filter((token) => token.length > 0) }))
}

function allInvocations(): Invocation[] {
  const scripts = readScripts()
  const found: Invocation[] = []
  for (const name of ['build', 'build:watch']) {
    const text = scripts[name]
    if (typeof text === 'string') found.push(...splitInvocations(name, text))
  }
  return found
}

const isEsbuild = (invocation: Invocation): boolean => (invocation.argv[0] ?? '').split('/').pop() === 'esbuild'

/** The invocation whose ENTRY POINT is `src/main/main.ts` — the only ones §3 permits the flag on. */
const bundlesMain = (invocation: Invocation): boolean => isEsbuild(invocation) && invocation.argv.includes(MAIN_ENTRY)

const tempDirs: string[] = []

function tempOutfile(label: string, extension = 'cjs'): string {
  const dir = mkdtempSync(join(tmpdir(), `b2-build-external-${label}-`))
  tempDirs.push(dir)
  return join(dir, `main.${extension}`)
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true })
})

/** Run one invocation's argv with the outfile redirected to a temp path (and `--watch` dropped, which would never exit),
 *  and answer what esbuild said. The repo's `dist/` is never named.
 *
 *  **THE SCRIPT'S OWN `esbuild` COMMAND WORD IS DROPPED** from the argv: the script spells `esbuild <entry> …` for a shell,
 *  and this row already holds the binary — passing the word through would make esbuild read `esbuild` as a SECOND INPUT
 *  FILE and refuse for a reason that has nothing to do with the package. */
function runInvocation(invocation: Invocation, label: string): { status: number | null; output: string; outfile: string } {
  const outfile = tempOutfile(label)
  const tokens = isEsbuild(invocation) ? invocation.argv.slice(1) : [...invocation.argv]
  const argv: string[] = []
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i] as string
    if (token === '--watch') continue
    if (token.startsWith('--outfile=')) {
      argv.push(`--outfile=${outfile}`)
      continue
    }
    if (token === '--outdir') {
      // the renderer invocation's form: redirect the DIRECTORY so nothing lands in `dist/` either
      i += 1
      argv.push(`--outdir=${dirname(outfile)}`)
      continue
    }
    argv.push(token)
  }
  if (!argv.some((token) => token.startsWith('--outfile=') || token.startsWith('--outdir='))) {
    argv.push(`--outfile=${outfile}`)
  }
  const run = spawnSync(ESBUILD_BIN, argv, { cwd: ROOT, encoding: 'utf8' })
  const output = `${run.stdout ?? ''}${run.stderr ?? ''}`.trim()
  return { status: run.status, output, outfile }
}

describe('build-external · arm (g) — the external, proved against `package.json`’s OWN text (§5(g), §3)', () => {
  it('(g1) · THE FLAG IS ON EVERY INVOCATION THAT BUNDLES `src/main/main.ts` (both `build` and `build:watch`) AND ON NO OTHER (§3, §5(g1))', () => {
    const problems: string[] = []
    const scripts = readScripts()
    const invocations = allInvocations()

    attempt(problems, 'g1·subject', () => {
      const msgs: string[] = []
      if (typeof scripts.build !== 'string' || scripts.build.trim().length === 0) {
        msgs.push('`package.json` carries no `build` script — §3\'s subject has no bytes at all')
      }
      if (typeof scripts['build:watch'] !== 'string' || scripts['build:watch'].trim().length === 0) {
        msgs.push('`package.json` carries no `build:watch` script — §3 rules that a watch leg keeping the flag off is the same broken build for the developer who runs it')
      }
      if (!existsSync(ESBUILD_BIN)) {
        msgs.push(`\`${ESBUILD_BIN.replace(ROOT, '.')}\` does not exist — the repo's own bundler is the row's runner and the measurement has no tool`)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    attempt(problems, 'g1·flag', () => {
      const mainInvocations = invocations.filter(bundlesMain)
      if (mainInvocations.length === 0) {
        return `NO invocation under \`build\`/\`build:watch\` bundles \`${MAIN_ENTRY}\` — §3's clause has no subject, and the app has no main bundle to be external about (invocations read: [${invocations.map((i) => `${i.script}: ${i.text}`).join(' | ')}])`
      }
      const msgs: string[] = []
      for (const script of ['build', 'build:watch']) {
        const forScript = mainInvocations.filter((invocation) => invocation.script === script)
        if (forScript.length === 0) {
          msgs.push(
            `\`${script}\` bundles \`${MAIN_ENTRY}\` in NO invocation — §3 pins the flag on BOTH legs' main call; found [${invocations.filter((i) => i.script === script).map((i) => i.text).join(' | ')}]`,
          )
          continue
        }
        // THE FIRST CALL IS THE CLAIM (§5(g)'s amendment names it explicitly): the leg's first esbuild invocation is the
        // one that bundles `src/main/main.ts`, and THAT is the argv the flag must be read off.
        const esbuildCalls = invocations.filter((invocation) => invocation.script === script && isEsbuild(invocation))
        const firstCall = esbuildCalls[0]
        if (firstCall === undefined) {
          msgs.push(`\`${script}\` carries no esbuild invocation at all — §3's clause has no call to pin the flag on`)
        } else if (!forScript.some((invocation) => invocation.text === firstCall.text)) {
          msgs.push(
            `\`${script}\`'s FIRST esbuild call is ${show(firstCall.text)} and it does not bundle \`${MAIN_ENTRY}\` — §3/§5(g) pin the flag on the leg's first call, which is the main bundle`,
          )
        }
        for (const invocation of forScript) {
          const spellings = invocation.argv.filter((token) => token === EXTERNAL_FLAG).length
          if (spellings === 0) {
            msgs.push(
              `\`${script}\`'s main-bundling invocation does not carry \`${EXTERNAL_FLAG}\`: ${show(invocation.text)} — §3/§5(g): without it the first reachable import of the package is INLINED into \`dist/main/main.cjs\`, addon and all, which is a second seam in disguise (ASM-B1-4, unit-e-1 §103)`,
            )
          } else if (spellings > 1) {
            msgs.push(
              `\`${script}\`'s main-bundling invocation carries \`${EXTERNAL_FLAG}\` ${spellings} times: ${show(invocation.text)} — §3 pins the clause ONCE, the same shape the script's \`--external:electron\` uses`,
            )
          }
        }
      }
      // AND NOWHERE ELSE: preload, standalone, battery-host and the renderer reach the payload through pure modules.
      for (const invocation of invocations) {
        if (bundlesMain(invocation)) continue
        if (invocation.argv.includes(EXTERNAL_FLAG)) {
          msgs.push(
            `\`${invocation.script}\`'s invocation ${show(invocation.text)} carries \`${EXTERNAL_FLAG}\` while bundling no \`${MAIN_ENTRY}\` — §3: "No other invocation gains it", because the renderer reaches the payload through \`display-client.ts\` and \`display-shape.ts\`, which are PURE`,
          )
        }
      }
      // AND IN THE ONE ADMITTED SPELLING (§5(g)'s amendment): the two-token form is esbuild-equivalent and is NOT admitted.
      // Read as adjacent tokens, so it is named as the refused spelling rather than silently tolerated.
      for (const invocation of invocations) {
        for (let i = 0; i < invocation.argv.length - 1; i += 1) {
          if (invocation.argv[i] === REFUSED_SPELLING[0] && invocation.argv[i + 1] === REFUSED_SPELLING[1]) {
            msgs.push(
              `\`${invocation.script}\`'s invocation ${show(invocation.text)} spells the flag as TWO tokens (\`${REFUSED_SPELLING[0]} ${REFUSED_SPELLING[1]}\`) — §5(g) pins the SINGLE token \`${EXTERNAL_FLAG}\`, the same shape the script's existing \`--external:electron\` uses; a second spelling of one clause is exactly what the census refuses`,
            )
          }
        }
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§3/§5(g1) — the flag on both main-bundling invocations and on no other (docs/L1/unit-b-2-display-wire.md §3, §5(g1))',
    ).toEqual([])
  })

  // ── `(g2)` RE-GRAINED. **THE CONTRACT'S PREMISE WAS FALSIFIED BY MEASUREMENT (2026-11-17).** §5(g2) and this file's
  // ── header once pinned *"running that same text with the flag stripped … exits NON-ZERO"*. Measured twice at this head
  // ── it does not: esbuild exits **0**, reports `2.5mb ⚠️` (HISTORICAL — the 2026-11-17 / `1.11.0` reading; the row prints
  // ── the live pair), and INLINES the package. "Exits NON-ZERO" cannot pass at any
  // ── head, so the row measures what is TRUE instead: the flag's absence does not break the BUILD, it breaks the ARTIFACT
  // ── — silently, which is the worse failure because nothing reds and the broken bundle ships.
  // ── WHICH READING WAS TAKEN, AND WHY: the MARKER-based one, not the narrow size-only fallback, because both markers are
  // ── esbuild's own conventions and were measured on the two real emissions (`0`-flagged / `15`-stripped banners;
  // ── `0`/`1` shims). The size relation is carried as a THIRD independent reading, and both byte counts are PRINTED so a
  // ── reader sees the silent-wrong-bundle rather than a claim about one.
  it('(g2) · THE EXTERNAL IS REAL — WITH the flag the bundle carries the package as a bare REQUIRE and NONE of its bytes; the SAME invocation WITHOUT it still exits 0, is measurably LARGER, and INLINES the package (§5(g2), RE-GRAINED to the measured claim)', () => {
    const problems: string[] = []

    attempt(problems, 'g2', () => {
      const msgs: string[] = []
      // THE SUBJECT IS `build`'s FIRST CALL — the leg that produces the file the app runs — and the SAME text is run
      // twice, with the flag and without it, so the comparison isolates the flag and nothing else.
      const invocations = allInvocations()
      const subject = invocations.find((invocation) => invocation.script === 'build' && bundlesMain(invocation))
      if (subject === undefined) {
        return `\`build\` has no invocation bundling \`${MAIN_ENTRY}\` — §5(g2)'s subject does not exist, so the external cannot be measured`
      }
      const stripped: Invocation = { ...subject, argv: subject.argv.filter((token) => token !== EXTERNAL_FLAG) }
      if (stripped.argv.includes(EXTERNAL_FLAG)) {
        return 'the stripped invocation still carries the flag — the measurement would be of the un-stripped build'
      }
      if (!subject.argv.includes(EXTERNAL_FLAG)) {
        return `\`build\`'s main-bundling invocation does not carry \`${EXTERNAL_FLAG}\` — (g1) reds that independently, and (g2)'s contrast has no flagged side without it`
      }

      // ── (b) THE FLAGGED BUILD: the package as an EXTERNAL REQUIRE, and NONE of its bytes.
      const flagged = runInvocation(subject, 'flagged')
      const flaggedRaw = flagged.status === 0 && existsSync(flagged.outfile) ? readFileSync(flagged.outfile) : null
      const flaggedBundle = flaggedRaw === null ? '' : flaggedRaw.toString('utf8')
      if (flagged.status !== 0) {
        msgs.push(
          `(b) the FLAGGED invocation exited ${show(flagged.status)} with \`${EXTERNAL_FLAG}\` present — this is the build the app ships, and §3/(g3) pin exit 0; esbuild said: ${show(flagged.output.slice(0, 600))}`,
        )
      } else if (flaggedRaw === null || flaggedRaw.length === 0) {
        msgs.push(`(b) the flagged invocation wrote no readable bundle at ${flagged.outfile} — the reading of its statement about the package is vacuous`)
      } else {
        if (!flaggedBundle.includes(BUNDLE_REQUIRE)) {
          msgs.push(
            `(b) the flagged bundle carries NO \`${BUNDLE_REQUIRE}\` — §3's second bullet: with \`${EXTERNAL_FLAG}\` the package must appear as a bare external REQUIRE and none of its bytes; a bundle that neither requires it nor inlines it means \`${MAIN_ENTRY}\` never reached the seam`,
          )
        }
        if (flaggedBundle.includes(INLINE_BANNER)) {
          msgs.push(
            `(b) the flagged bundle INLINES the package anyway — esbuild's inline-module banner \`${INLINE_BANNER}\` appears in a build carrying \`${EXTERNAL_FLAG}\`, so the flag is not doing its work`,
          )
        }
        if (flaggedBundle.includes(INLINE_META_SHIM)) {
          msgs.push(
            `(b) the flagged bundle carries the inlined ESM shim \`${INLINE_META_SHIM}\` — the package's own bytes are present in a build that was supposed to leave them out`,
          )
        }
      }

      // ── (c) THE FLAG STRIPPED: exits 0 and INLINES. This half REPLACES "the build dies" with the measured truth; a
      // non-zero exit here would mean the measurement's premise changed shape at this head, which is a FINDING to
      // re-grain rather than a pass — so it is reported, not tolerated.
      const bare = runInvocation(stripped, 'stripped')
      const bareRaw = bare.status === 0 && existsSync(bare.outfile) ? readFileSync(bare.outfile) : null
      const bareBundle = bareRaw === null ? '' : bareRaw.toString('utf8')
      if (bare.status !== 0) {
        msgs.push(
          `(c) the STRIPPED invocation exited ${show(bare.status)} — MEASURED (2026-11-17), it exits 0 and silently inlines the package, so a non-zero exit means this row's measured premise has changed at this head and must be re-grained again rather than trusted; esbuild said: ${show(bare.output.slice(0, 600))}`,
        )
      } else if (bareRaw === null || bareRaw.length === 0) {
        msgs.push(`(c) the stripped invocation exited 0 and wrote no readable bundle at ${bare.outfile} — the silent-wrong-bundle reading has no subject`)
      } else {
        if (bareBundle.includes(BUNDLE_REQUIRE)) {
          msgs.push(
            `(c) the stripped bundle STILL carries \`${BUNDLE_REQUIRE}\` — the flag cannot be what makes the package external, so the contrast proves nothing`,
          )
        }
        if (!bareBundle.includes(INLINE_BANNER)) {
          msgs.push(
            `(c) the stripped bundle carries NO esbuild inline-module banner \`${INLINE_BANNER}\` — the package was NOT inlined, so "a silent inline" is not the failure this row measures`,
          )
        }
        if (!bareBundle.includes(INLINE_META_SHIM)) {
          msgs.push(
            `(c) the stripped bundle does not carry the inlined ESM shim \`${INLINE_META_SHIM}\` — the second, independent inline marker is absent, so the inlining claim rests on one reading only`,
          )
        }
      }

      // ── (d) THE SIZE RELATION, as the third independent reading: an external require is SMALLER than its inlined twin
      // by the package's own bytes. Both figures below are PRINTED on every run — the failure messages quote them too, so
      // a green row still shows a reader the size of the silent-wrong-bundle it is standing guard over.
      const measured =
        flaggedRaw !== null && bareRaw !== null && flaggedRaw.length > 0 && bareRaw.length > 0
          ? `MEASURED: flagged ${flaggedRaw.length} B / stripped ${bareRaw.length} B (the stripped twin is ${bareRaw.length - flaggedRaw.length} B larger and inlines the package)`
          : 'MEASURED: at least one of the two bundles could not be read, so the byte relation has no reading'
      if (flaggedRaw !== null && bareRaw !== null && flaggedRaw.length > 0 && bareRaw.length > 0 && !(bareRaw.length > flaggedRaw.length)) {
        msgs.push(
          `(d) the stripped bundle (${bareRaw.length} B) is NOT larger than the flagged one (${flaggedRaw.length} B) — with \`${EXTERNAL_FLAG}\` the package's bytes are excluded and without it they are compiled in, so the stripped twin must carry MORE bytes; an equal-or-smaller figure means the flag is not what moved the package`,
        )
      }
      console.log(`[build-external] (g2) ${measured}`)

      return msgs.length > 0 ? `${msgs.join('; ')} — ${measured}` : null
    })

    expect(
      problems,
      '§5(g2) RE-GRAINED — the external proved by CONTRAST: an external require and none of the package’s bytes WITH the flag, a silent inline (exit 0, larger, package bytes present) WITHOUT it (docs/L1/unit-b-2-display-wire.md §5(g2); the contract’s "the build dies" premise was FALSIFIED BY MEASUREMENT on 2026-11-17)',
    ).toEqual([])
  })

  it('(g3) · THE REAL INVOCATION EXITS 0 INTO A TEMP OUTFILE AND THE BUNDLE CARRIES `require("provident-storeroom")` — an external require and none of the package’s bytes (§3, §5(g3))', () => {
    const problems: string[] = []

    attempt(problems, 'g3', () => {
      const invocations = allInvocations()
      const subject = invocations.find((invocation) => invocation.script === 'build' && bundlesMain(invocation))
      if (subject === undefined) {
        return `\`build\` has no invocation bundling \`${MAIN_ENTRY}\` — §5(g3)'s subject does not exist`
      }
      const run = runInvocation(subject, 'real')
      if (run.status !== 0) {
        return `the REAL invocation exited ${show(run.status)} with \`${EXTERNAL_FLAG}\` present — §5(g3) pins exit 0; esbuild said: ${show(run.output.slice(0, 600))}`
      }
      if (!existsSync(run.outfile)) {
        return `the invocation exited 0 and wrote no bundle at ${run.outfile} — the output reading has no subject`
      }
      const bundle = readFileSync(run.outfile, 'utf8')
      if (bundle.length === 0) return 'the bundle is empty — the reading of its statement about the package is vacuous'
      if (!bundle.includes(BUNDLE_REQUIRE)) {
        return (
          `the bundle carries NO \`${BUNDLE_REQUIRE}\` — §3's second bullet: with \`${EXTERNAL_FLAG}\` the package must appear as a bare external REQUIRE and none of its bytes; ` +
          `a bundle that neither requires it nor inlines it means \`${MAIN_ENTRY}\` never reached the seam`
        )
      }
      return null
    })

    expect(
      problems,
      '§3/§5(g3) — the real build exits 0 and the bundle carries the bare require (docs/L1/unit-b-2-display-wire.md §3, §5(g3))',
    ).toEqual([])
  })
})
