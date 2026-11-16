// tests/integration/shell-chrome/pane-move-instrument.test.ts — unit `U-3` `pane-move`'s
// INSTRUMENT row: the `C-6` live terms, read as the SOURCE they are.
//
// WHY THIS ROW EXISTS (the gap it closes, stated so a later reader does not mistake it for
// duplication). `pane-move-target.test.ts` grades limbs `A`…`H` — the LAW, the ACT, the WRITE,
// the projection, the admission, the inherited form, the record's figure and crossing-N-times.
// None of those can grade `C-6` itself: the relocation gesture, its five terms and the way those
// terms FOLD into the `uf_panes_12` row's verdict exist only in `scripts/live-drive.mjs`, and at
// this head NO node row read them (`tests/live-drive-contract.test.ts` grades the driver's block
// CENSUS and its parse — `node --check` — never the terms' composition). The failure this row
// exists to make impossible is the quiet one: an instrument whose terms print but never fold into
// `ok` reports five clean readings on a run whose property is broken, and whose `PROBLEMS=` token
// is elided when empty cannot be told apart from an instrument that never took a reading.
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-u-3-pane-move.md` §2 `C-6` (the helper + the FIVE terms
// inside the EXISTING `uf_panes_12` block, NO new `BLOCKS` key) and §4 `G8` ("the five live terms'
// readings verbatim"). §7a records the mutation proof that each tooth below can fail.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): this row is **envelope-class and source-class** — it reads
// TEXT and never runs the driver, never boots Electron and never asserts a painted surface. NOTHING
// here is app-green. The five terms' READINGS are `G8`-only and no node row may claim them; what
// this row proves is narrower and honest: the instrument that takes them is WIRED, names the
// contract's five, prints each one's own reading beside its verdict, always prints `PROBLEMS=`, and
// folds into the row's verdict — so a `PASS` on that row cannot be a verdict the terms never touched.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: it re-asserts no census `tests/live-drive-contract.test.ts`
// already owns (`BLOCKS` = 100 keys / its digest / the `node --check` parse), it spawns nothing, it
// writes nothing, and every path derives from THIS file's own location (`ROOT`) so a missing
// substrate FAILS (ENOENT) instead of skipping. Each tooth is paired with a MUTATED COPY of the same
// text that must read FALSE — the mutation is the falsifier, so no tooth can pass by being blind.
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

/** The repo root, derived from this file's own URL — never an absolute literal. */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const DRIVER_FILE = 'scripts/live-drive.mjs'
const source = readFileSync(`${ROOT}${DRIVER_FILE}`, 'utf8')

/** The contract's FIVE terms, in `§2 C-6`'s own order (i)…(v). */
const THE_FIVE = [
  'relocatedToTheDestinationZone',
  'theInheritedFormFollowed',
  'theDestinationZoneOpened',
  'oneGestureOneWrite',
  'restoredByASecondDrag',
] as const

/** How many times `needle` occurs in `text` (a census, never a `> 0` proxy). */
const occurrences = (text: string, needle: string): number => {
  let count = 0
  for (let at = text.indexOf(needle); at >= 0; at = text.indexOf(needle, at + needle.length)) count += 1
  return count
}

/** The body of ONE top-level `async function <name>(…)` — from its header to the first `\n}`
 *  at column 0. A STUB answers a short region, which the non-vacuity floor below refuses. */
function functionRegion(text: string, name: string): string | null {
  const header = `async function ${name}(`
  const start = text.indexOf(header)
  if (start < 0) return null
  const end = text.indexOf('\n}\n', start)
  if (end < 0) return null
  return text.slice(start, end + 3)
}

/** The body of ONE `BLOCKS` entry: from `\n  <key>: async (h) => {` to the NEXT `BLOCKS` key
 *  (the sibling at the same two-space indent), so a region is one block's own text and never
 *  its neighbours'. */
function blockRegion(text: string, key: string): string | null {
  const header = `\n  ${key}: async (h) => {`
  const start = text.indexOf(header)
  if (start < 0) return null
  const next = /\n {2}[A-Za-z0-9_]+: async \(h\) => \{/g
  next.lastIndex = start + header.length
  const match = next.exec(text)
  if (match == null) return null
  return text.slice(start, match.index)
}

/** The `ok:` expression of the `uf_panes_12` row's `u3Opts` — the ONE place the five terms'
 *  answers become the row's verdict. Delimited by its own first member and its `, surface:`
 *  neighbour, so it is read as an EXPRESSION and never as a window of neighbouring text. */
function verdictExpression(block: string): string | null {
  const at = block.indexOf('ok: limb1LayoutHeld')
  if (at < 0) return null
  const end = block.indexOf(', surface:', at)
  if (end < 0) return null
  return block.slice(at, end)
}

const helper = functionRegion(source, 'ufPaneRelocateInput')
const block = blockRegion(source, 'uf_panes_12')

describe('U-3 pane move — the `C-6` instrument: the helper is WIRED, the FIVE terms are named and printed, `PROBLEMS=` is never elided, and the terms FOLD into the row verdict', () => {
  it('T1 — the ONE helper exists once and the `uf_panes_12` block CALLS it (a helper nothing drives grades nothing)', () => {
    const problems: string[] = []
    expect(
      helper,
      '`scripts/live-drive.mjs` carries no `async function ufPaneRelocateInput(…)` — §2 `C-6`\'s ONE new gesture helper is ABSENT, so the five terms have no instrument at all',
    ).not.toBe(null)
    expect(
      block,
      '`scripts/live-drive.mjs` carries no `uf_panes_12: async (h) => {` entry — the block §2 `C-6` says the five terms live INSIDE is absent',
    ).not.toBe(null)
    const helperText = helper as string
    const blockText = block as string
    // NON-VACUITY FLOOR: a region that is a header and a stub cannot hold an instrument.
    if (helperText.length < 4000) {
      problems.push(`(T1) the helper region reads only ${helperText.length} characters — too short to be the gesture probe (the census is blind)`)
    }
    if (blockText.length < 4000) {
      problems.push(`(T1) the block region reads only ${blockText.length} characters — too short to hold the row it declares (the census is blind)`)
    }
    const defined = occurrences(source, 'async function ufPaneRelocateInput(')
    if (defined !== 1) {
      problems.push(`(T1) \`async function ufPaneRelocateInput(\` is defined ${defined} time(s), not exactly 1 — a second helper is a second instrument, and which one the row drives would be unreadable`)
    }
    // THE CALL: the block must INVOKE it and READ ITS ANSWER (an imported-but-uncalled helper is
    // the shape that ships a clean run over a property nobody measured).
    if (!blockText.includes('await ufPaneRelocateInput(h,')) {
      problems.push('(T1) the block never calls the helper (`await ufPaneRelocateInput(h, …)` absent) — the relocation gesture is never driven')
    }
    for (const read of ['placed.driven', 'placed.ok', 'placed.evidence', 'placed.evidence']) {
      if (!blockText.includes(read)) {
        problems.push(`(T1) the block never reads \`${read}\` off the helper's answer — the probe's result is discarded`)
      }
    }
    if (!blockText.includes('placed.evidence')) {
      problems.push('(T1) the helper\'s `evidence` never reaches the block — the five readings are never PRINTED')
    }
    // THE FALSIFIER: the SAME text with the call renamed must read as unwired, or the tooth above
    // is satisfied by any string that merely resembles a call.
    const unwired = blockText.replace('await ufPaneRelocateInput(h,', 'await ufPaneRelocateGone(h,')
    if (unwired.includes('await ufPaneRelocateInput(h,')) {
      problems.push('(T1) the call tooth cannot fail: a copy of the block with the call renamed still reads as calling it')
    }
    expect(
      problems,
      `T1 — §2 C-6's ONE helper and its wiring (§4 G8). ${problems.length} problem(s). The helper must exist exactly once, be CALLED from the ` +
        `EXISTING uf_panes_12 block, and have its answer's evidence printed. LAYER: source-class — this proves the instrument is wired, never that the gesture moves a pane.`,
    ).toEqual([])
  })

  it('T2 — the FIVE terms are the contract\'s five in the contract\'s order, each printing its OWN reading and naming itself when false', () => {
    const problems: string[] = []
    const helperText = helper as string
    // THE NAMES, parsed out of the helper's own `TERM_NAMES` list — not grepped, so a sixth term
    // (or a dropped one) is visible as a member difference and not as a count.
    const listMatch = /const TERM_NAMES = \[([\s\S]*?)\]/.exec(helperText)
    if (listMatch == null) {
      problems.push('(T2) the helper carries no `const TERM_NAMES = [ … ]` — the five terms are not enumerated in ONE place, so nothing fixes which terms a run reports')
    } else {
      const names = [...listMatch[1].matchAll(/'([A-Za-z0-9_]+)'/g)].map((m) => m[1])
      if (JSON.stringify(names) !== JSON.stringify([...THE_FIVE])) {
        problems.push(
          `(T2) the helper's term list reads ${JSON.stringify(names)}, not the contract's five in order ${JSON.stringify([...THE_FIVE])} — ` +
            `a term that is not in this list is never printed and never folds into the verdict`,
        )
      }
    }
    // EACH TERM PRINTS ITS OWN READING BESIDE ITS VERDICT (the honest-negative requirement).
    for (const member of ['${name}=', 'terms[name].ok === true ? \'true\' : \'false\'', 'terms[name].reading']) {
      if (!helperText.includes(member)) {
        problems.push(`(T2) the helper's evidence composition is missing \`${member}\` — a term would print a verdict without its reading, or a reading without its verdict`)
      }
    }
    // A FALSE TERM NAMES ITSELF IN `problems` and the aggregate is over ALL five.
    if (!helperText.includes('problems.push(name + \': \' + terms[name].reading)')) {
      problems.push('(T2) a failing term does not push its own name+reading into `problems` — a clean-looking `PROBLEMS=[]` could sit over a false term')
    }
    if (!helperText.includes('TERM_NAMES.every((name) => terms[name].ok === true)')) {
      problems.push('(T2) the helper\'s `ok` is not `TERM_NAMES.every(name => …)` — a term could be false while the probe reports ok:true')
    }
    // THE FALSIFIERS: drop a term from the list and the parsed list must diverge; invert the
    // self-naming push and the tooth must read false.
    const four = helperText.replace("    'restoredByASecondDrag',\n", '')
    const fourList = /const TERM_NAMES = \[([\s\S]*?)\]/.exec(four)
    const fourNames = fourList == null ? [] : [...fourList[1].matchAll(/'([A-Za-z0-9_]+)'/g)].map((m) => m[1])
    if (JSON.stringify(fourNames) === JSON.stringify([...THE_FIVE])) {
      problems.push('(T2) the term-list tooth cannot fail: a copy with `restoredByASecondDrag` deleted still parses as the five')
    }
    const inverted = helperText.replace('problems.push(name + \': \' + terms[name].reading)', 'if (false) problems.push(name)')
    if (inverted.includes('problems.push(name + \': \' + terms[name].reading)')) {
      problems.push('(T2) the self-naming tooth cannot fail: a copy with the push removed still reads as present')
    }
    expect(
      problems,
      `T2 — the five terms' names and printing (§2 C-6 (i)…(v); §4 G8). ${problems.length} problem(s). LAYER: source-class. The READINGS themselves are ` +
        `G8-only; this limb grades only that the instrument reports the contract's five, each with its own reading.`,
    ).toEqual([])
  })

  it('T3 — `PROBLEMS=` prints UNCONDITIONALLY on BOTH paths, so a clean run and a run that never took a reading are distinguishable', () => {
    const problems: string[] = []
    const helperText = helper as string
    const prints = occurrences(helperText, 'PROBLEMS=${JSON.stringify(problems)}')
    if (prints < 2) {
      problems.push(
        `(T3) the helper prints \`PROBLEMS=\${JSON.stringify(problems)}\` ${prints} time(s) — the DRIVEN path and the NOT-DRIVEN path must BOTH print it ` +
          `(a not-driven run that elides the token is indistinguishable from a clean one)`,
      )
    }
    // THE ANTI-ELISION TOOTH: the token is never behind a `problems.length` ternary — the landed
    // house idiom ELIDES an empty census, and this instrument deliberately does not.
    const elided = helperText.match(/problems\.length\s*\?/)
    if (elided != null) {
      problems.push('(T3) the helper guards its `PROBLEMS=` print behind a `problems.length ?` test — with five NEW terms, a clean run that prints no token cannot be told from a run whose terms never ran')
    }
    if (!helperText.includes('PROBLEMS=')) {
      problems.push('(T3) the helper never prints the `PROBLEMS=` token at all')
    }
    // THE FALSIFIER: the same composition with the token elided must read false.
    const elisionMutant = helperText.replace(
      '`PROBLEMS=${JSON.stringify(problems)}`',
      '`${problems.length ? `PROBLEMS=${JSON.stringify(problems)}` : \'\'}`',
    )
    if (occurrences(elisionMutant, 'PROBLEMS=${JSON.stringify(problems)}') !== prints) {
      problems.push('(T3) the elision-tooth cannot be built: the token could not be substituted, so this limb graded nothing')
    } else if (elisionMutant.match(/problems\.length\s*\?/) == null) {
      problems.push('(T3) the elision falsifier did not produce the eliding shape — the tooth is blind')
    }
    expect(
      problems,
      `T3 — the unconditional \`PROBLEMS=\` print (§2 C-6's printing ruling; §4 G8). ${problems.length} problem(s). LAYER: source-class. This is the tooth that ` +
        `keeps "five terms ran and were clean" distinguishable from "five terms never took a reading".`,
    ).toEqual([])
  })

  it('T4 — the five terms FOLD into the row\'s verdict beside the two landed conjuncts, so a broken term can FAIL the row', () => {
    const problems: string[] = []
    const blockText = block as string
    const expression = verdictExpression(blockText)
    if (expression == null) {
      problems.push('(T4) the block carries no `ok: limb1LayoutHeld …` expression followed by `, surface:` — the uf_panes_12 row\'s verdict has no readable shape (or the helper answer was folded by renaming the landed conjunct away)')
    } else {
      // THE FOUR CONJUNCTS: the two LANDED ones (unchanged, so nothing was weakened to buy a
      // green) and the two ADDED ones (the terms' own answers).
      const required = [
        'limb1LayoutHeld',
        'bodyDrag.relocated === false',
        'placed.driven === true',
        'placed.ok === true',
      ]
      for (const conjunct of required) {
        if (!expression.includes(conjunct)) {
          problems.push(
            `(T4) the row's \`ok\` expression is missing \`${conjunct}\` — ${conjunct === 'placed.ok === true' ? 'a run whose five terms did NOT all hold would still PASS the row' : conjunct === 'placed.driven === true' ? 'a NOT-DRIVEN relocation (one that never moved a pane) would still PASS the row' : 'a LANDED conjunct was dropped, so the row was weakened rather than extended'}`,
          )
        }
      }
      // THE FALSIFIERS: three separate weakenings of the SAME expression must each read false.
      const dropOk = expression.replace('&& placed.ok === true', '')
      const dropDriven = expression.replace('&& placed.driven === true', '')
      const constantOk = expression.replace('placed.ok === true', 'true')
      if (dropOk.includes('placed.ok === true')) {
        problems.push('(T4) the fold-tooth cannot fail: a copy with `placed.ok === true` deleted still reads as folding the terms')
      }
      if (dropDriven.includes('placed.driven === true')) {
        problems.push('(T4) the fold-tooth cannot fail: a copy with `placed.driven === true` deleted still reads as driven')
      }
      if (constantOk.includes('placed.ok === true')) {
        problems.push('(T4) the fold-tooth cannot fail: a copy weakening the conjunction to `true` still reads as `placed.ok === true`')
      }
    }
    expect(
      problems,
      `T4 — the terms fold into the verdict (§2 C-6's "folding into ok, no new slot"). ${problems.length} problem(s). LAYER: source-class. ` +
        `A printed term that does not fold is a reading with no consequence: the failure mode where five clean readings sit above a PASS the terms never touched.`,
    ).toEqual([])
  })

  it('T5 — the terms live INSIDE the existing `uf_panes_12` block: no new `BLOCKS` key was added for them', () => {
    const problems: string[] = []
    const keys = [...source.matchAll(/\n {2}(uf_panes_12[A-Za-z0-9_]*): async \(h\) => \{/g)].map((m) => m[1])
    const expected = ['uf_panes_12', 'uf_panes_12_diag']
    if (JSON.stringify(keys) !== JSON.stringify(expected)) {
      problems.push(
        `(T5) the \`uf_panes_12\`-prefixed BLOCKS keys read ${JSON.stringify(keys)}, not ${JSON.stringify(expected)} — §2 C-6 requires the five terms INSIDE the ` +
          `EXISTING block (a new key moves the frozen 100-key census, \`R-10\`)`,
      )
    }
    const blockText = block as string
    if (!blockText.includes("declaredRowResult('U-3', 'UF-PANES-12'")) {
      problems.push('(T5) the block does not declare the `U-3` row (`declaredRowResult(\'U-3\', \'UF-PANES-12\' …)` absent) — the terms have no row to fold into')
    }
    if (!blockText.includes('checklistRow: \'UF-PANES-12\'')) {
      problems.push('(T5) the `U-3` row lost its `checklistRow: \'UF-PANES-12\'` carrier — the row would stop standing for the checklist row it was declared for')
    }
    // THE FALSIFIER: a copy with the terms hoisted into their OWN key must read as a new slot.
    const hoisted = `${source}\n  uf_panes_12_relocate: async (h) => {\n    return null\n  },\n`
    const hoistedKeys = [...hoisted.matchAll(/\n {2}(uf_panes_12[A-Za-z0-9_]*): async \(h\) => \{/g)].map((m) => m[1])
    if (JSON.stringify(hoistedKeys) === JSON.stringify(expected)) {
      problems.push('(T5) the new-slot tooth cannot fail: a copy carrying an extra `uf_panes_12_relocate` key still reads as the two expected keys')
    }
    expect(
      problems,
      `T5 — no new block slot (§2 C-6; \`R-10\`'s frozen census). ${problems.length} problem(s). LAYER: source-class. The driver's own block CENSUS and its ` +
        `\`node --check\` parse are \`tests/live-drive-contract.test.ts\`'s rows and are NOT re-asserted here.`,
    ).toEqual([])
  })
})
