// tests/live-drive-contract.test.ts — TestWriter RED set for the LIVE app driver
// `scripts/live-drive.mjs`.
//
// Spec source: docs/specs/user-flow-audit.md §3 (the §6.1 structured
// coverage-report schema) + §2 (§5.U, the capped 8-row delta matrix), the rows of
// docs/specs/user-flow-audit-checklist.md §1–§14, and the §6.2 read-only audit
// that REJECTED the 2026-09-15 report
// (docs/specs/user-flow-audit-coverage-2026-09-15.md, findings F-1..F-5 /
// Ad-1..Ad-12).
//
// WHY THIS IS A NODE-STATIC TEST (no live app, no network, deterministic):
// `scripts/live-drive.mjs` calls `main(process.argv.slice(2))` at MODULE SCOPE
// (its last line), so importing it would spawn/attach the Electron app. The
// house convention for a structural pin (`tests/unit-u-shell-shell-wiring.test.ts`)
// is to read the source text and assert on it. Where a PURE VALUE is reachable
// (the §6.1 `MATRIX_ROWS` table) we parse the exported literal out of the source
// instead of importing. Nothing here reads src/ or the app.
//
// ---------------------------------------------------------------------------
// DATA STATES ENUMERATED (the driver source is the unit under test)
// ---------------------------------------------------------------------------
//   S1. the §5.U matrix-row blocks (`uf_*` row blocks — 20 today: uf_tabs_1/3/4/7,
//       uf_settings_1..7, uf_panes_1/8/10/12/14, uf_search_2, uf_hist_4/6,
//       uf_layout_2/10) — the blocks the report's matrix rows cite.
//   S2. the EXTENDED (non-matrix) row blocks — the legacy `user*` / `repro_*` /
//       `toolbar_*` blocks that cover checklist rows in the report's separate
//       table (§6.1 last bullet: "the legacy user*/repro_* blocks and the
//       checklist rows they cover ... with the same fields").
//   S3. the DIAGNOSTIC blocks (measurement without a verdict: `diag*`,
//       `repro_nbsp`, `uf_mount_diag`, `uf_mount_leak_diag`) — allowed to exist,
//       but only in the §6.1 diagnostic form `{diagnostic:true, pass:false}`.
//   S4. the HARNESS-HYGIENE blocks (`uf_restore_layout`, `uf_scroll_reset`) —
//       neither rows nor verdicts.
//   S5. the legacy MCP-probe / misc blocks (`v1_adjacency`, `v2_scoped`,
//       `v3_docnav`, `shell_*`, `gnosis_d2`, `persistence_*`, `import1`, ...) —
//       reported in the extended table, never as §5.U matrix verdicts.
//
// FAIL-STATES PINNED (one test per rule; a fail-state is a rule the spec names
// that the driver may not violate):
//   R1 unfalsifiable verdict (`pass:true` with no observed value; the named
//      offenders `repro_nbsp` + `toolbar_undo`).
//   R2 an unproven gesture PATH: a click whose hit-test never resolved the
//      target (`native-fallback`) promoted into a PASS, or a bare synthetic
//      `.click()` used as the row's gesture.
//   R3 a proxy oracle (DOM presence / attribute / class / slot / computed style
//      only) recorded as a PASS instead of `proxyPASS:true` + `pass:false`; the
//      named offenders `user6_search_no_flicker` + `user3_collapse_orientation`.
//   R4 a report row missing any §6.1 field (row/assertion/dclass/realInput/
//      evidence/proxyPASS/surface/pass).
//   R5 a summary whose `total` counts blocks instead of §5.U rows, or a matrix
//      row with no block / a duplicated row id (undetectable row-set).
//   R6 a duplicated `BLOCKS` key (the dead `shell_wiring` first definition).
// ---------------------------------------------------------------------------
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const DRIVER_URL = new URL('../scripts/live-drive.mjs', import.meta.url)
const SRC = readFileSync(DRIVER_URL, 'utf8')

// ===========================================================================
// §0 — source extraction (the BLOCKS table + per-block bodies).
//     The harness itself requires one callable entry per block name
//     (`Object.keys(BLOCKS)` + `BLOCKS[n](h)`), so a block is a top-level
//     `  <name>: [async] (h) => {` entry inside `const BLOCKS = { ... }`.
// ===========================================================================
const BLOCKS_HEADER = /^ {2}([A-Za-z_$][\w$]*):\s*(?:async\s*)?\(?\s*h\s*\)?\s*=>\s*\{/

function blocksRegion(): string {
  const lines = SRC.split('\n')
  const open = lines.findIndex((l) => /^const BLOCKS = \{/.test(l))
  if (open < 0) return SRC
  let close = -1
  for (let i = open + 1; i < lines.length; i++) {
    if (lines[i] === '}') { close = i; break }
  }
  return lines.slice(open + 1, close < 0 ? lines.length : close).join('\n')
}
const REGION = blocksRegion()

interface BlockEntry { name: string; body: string }
const BLOCK_ENTRIES: BlockEntry[] = (() => {
  const lines = REGION.split('\n')
  const heads: Array<{ name: string; line: number }> = []
  lines.forEach((l, i) => {
    const m = BLOCKS_HEADER.exec(l)
    if (m) heads.push({ name: m[1], line: i })
  })
  return heads.map((hd, i) => ({
    name: hd.name,
    body: lines.slice(hd.line, i + 1 < heads.length ? heads[i + 1].line : lines.length).join('\n'),
  }))
})()

/** Every `BLOCKS` key IN SOURCE ORDER — duplicates included (rule 6 needs them). */
const BLOCK_NAMES: string[] = BLOCK_ENTRIES.map((b) => b.name)
const UNIQUE_BLOCK_NAMES: string[] = [...new Set(BLOCK_NAMES)]
const DUPLICATED_BLOCK_NAMES: string[] = [...new Set(BLOCK_NAMES.filter((n, i) => BLOCK_NAMES.indexOf(n) !== i))]

/** The concatenated body of every definition of `name` (a duplicated key keeps both). */
function blockBody(name: string): string {
  return BLOCK_ENTRIES.filter((b) => b.name === name).map((b) => b.body).join('\n')
}

/** Slice a top-level `function <name>(...) { ... }` definition out of the source. */
function helperSlice(name: string): string {
  const m = new RegExp(`(?:async\\s+)?function\\s+${name}\\s*\\(`).exec(SRC)
  if (!m) return ''
  const rest = SRC.slice(m.index)
  const end = rest.indexOf('\n}\n')
  return end < 0 ? rest.slice(0, 4000) : rest.slice(0, end + 2)
}

/** The VALUE expressions assigned to `pass:` inside raw source text (never its detail prose).
 *  Property positions are located in the MASKED text (so a `pass:` mention inside a template
 *  literal is not a verdict) while the value itself is read from the RAW text. */
function returnedPassValuesIn(text: string): string[] {
  const masked = maskCode(text)
  const out: string[] = []
  for (const m of masked.matchAll(/pass\s*[:=]\s*/g)) {
    const vs = m.index + m[0].length
    let ve = vs
    while (ve < masked.length && !/[,\n}]/.test(masked[ve])) ve++
    out.push(text.slice(vs, ve).trim())
  }
  return out
}
function returnedPassValues(name: string): string[] {
  return returnedPassValuesIn(blockBody(name))
}
function allPassValueExpressions(src: string): string[] {
  return returnedPassValuesIn(src)
}
/** Any `pass:` property OR `pass =` local set to the literal `true` (an unfalsifiable
 *  verdict — the property form and the object-shorthand form `{ pass, ... }` both count). */
function hasLiteralTruePass(text: string): boolean {
  return /pass\s*[:=]\s*true\b/.test(maskCode(text))
}

// ---------------------------------------------------------------------------
// §0.1 — the row-block census (§6.1: only row blocks carry a report row).
//        The SIX non-row `uf_*` blocks are the two harness-hygiene blocks and
//        the four diagnostics the coverage report lists separately
//        (`docs/specs/user-flow-audit-coverage-2026-09-15.md` §0/§5) — the
//        `*_diag` native-click attribution blocks are non-verdict by design
//        (a diagnostic block can never be promoted to a row verdict, §6.1).
// ---------------------------------------------------------------------------
const UF_NON_ROW_BLOCKS = [
  'uf_restore_layout', 'uf_scroll_reset', 'uf_mount_diag', 'uf_mount_leak_diag',
  'uf_tabs_7_diag', 'uf_panes_12_diag',
]
const UF_ROW_BLOCKS = UNIQUE_BLOCK_NAMES.filter((n) => n.startsWith('uf_') && !UF_NON_ROW_BLOCKS.includes(n))
const EXTENDED_ROW_BLOCKS = [
  'user1_tab_new', 'user2_pane_drag', 'user3_collapse_orientation', 'user4_main_editable',
  'user5_history_in_pane', 'user6_search_no_flicker', 'user7_zone_resize', 'user8_zone_boundary',
  'user9_search_open_in_tab', 'user10_collapse_vertical_text',
  'repro_nbsp', 'repro_dup_para', 'toolbar_undo', 'toolbar_toggle',
].filter((n) => UNIQUE_BLOCK_NAMES.includes(n))
const ROW_BLOCKS: string[] = [...UF_ROW_BLOCKS, ...EXTENDED_ROW_BLOCKS]

// ---------------------------------------------------------------------------
// §0.15 — code masking. String literals, template literals and comments are
//         replaced by same-length filler so that (a) prose inside a `detail`
//         template literal can never satisfy a field-presence check (the
//         "same row: tabs" trap) and (b) brace/paren balance stays aligned with
//         the RAW text (so raw value regexes can be run at masked offsets).
// ---------------------------------------------------------------------------
function maskCode(src: string): string {
  const out = src.split('')
  let i = 0
  let quote: string | null = null
  while (i < src.length) {
    const ch = src[i]
    if (quote) {
      if (ch === '\\') { i += 2; continue }
      if (ch === quote) { quote = null; i++; continue }
      out[i] = 'x'
      i++
      continue
    }
    if (ch === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') { out[i] = ' '; i++ }
      continue
    }
    if (ch === '/' && src[i + 1] === '*') {
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { out[i] = ' '; i++ }
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; i++; continue }
    i++
  }
  return out.join('')
}

/** The balanced `{ ... }` regions following each `return` in a (masked) body. */
function returnedObjectSlices(text: string): Array<{ raw: string; masked: string }> {
  const masked = maskCode(text)
  const out: Array<{ raw: string; masked: string }> = []
  for (const m of masked.matchAll(/\breturn\b/g)) {
    const braceAt = masked.indexOf('{', m.index)
    if (braceAt < 0) continue
    const end = scanBalanced(masked, braceAt)
    if (end < 0) continue
    out.push({ raw: text.slice(braceAt, end + 1), masked: masked.slice(braceAt, end + 1) })
  }
  return out
}

function helperTexts(name: string): string[] {
  const body = blockBody(name)
  const used = ROW_SHAPE_HELPERS.filter((h) => new RegExp(`\\b${h}\\s*\\(`).test(body))
  return used.map((h) => (HELPER_CANDIDATES.find((w) => w.name === h) ?? { text: '' }).text)
}
/** The returned result objects of a block (+ any shared row-shape builder it calls). */
function resultSlices(name: string): Array<{ raw: string; masked: string }> {
  const sources = [blockBody(name), ...helperTexts(name)]
  return sources.flatMap((s) => returnedObjectSlices(s))
}
function resultText(name: string, kind: 'raw' | 'masked'): string {
  return resultSlices(name).map((s) => s[kind]).join('\n')
}

// ---------------------------------------------------------------------------
// §0.2 — §6.1 field resolution, helper-aware: a row block may build its result
//        inline OR through a SHARED verdict builder (any function whose body
//        carries the full §6.1 field set). Both are accepted; a missing field
//        is a finding either way. Presence is checked on the MASKED result
//        object (code only) so a `detail` prose string cannot fake a field.
// ---------------------------------------------------------------------------
const SHAPE_FIELDS = ['row', 'assertion', 'dclass', 'realInput', 'evidence', 'proxyPASS', 'surface', 'pass'] as const

const HELPER_CANDIDATES: Array<{ name: string; text: string }> = (() => {
  const out: Array<{ name: string; text: string }> = []
  const re = /(?:export\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(SRC))) {
    const name = m[1] ?? m[2]
    out.push({ name, text: SRC.slice(m.index, m.index + 2500) })
  }
  return out
})()
const ROW_SHAPE_HELPERS: string[] = HELPER_CANDIDATES
  .filter((h) => SHAPE_FIELDS.every((f) => new RegExp(`\\b${f}\\s*:`).test(maskCode(h.text))))
  .map((h) => h.name)

function hasField(name: string, field: string): boolean {
  // `field: value` OR the object-shorthand form `{ field, ... }` (a local of that name),
  // searched in the CODE of the returned result object(s) only.
  return new RegExp(`\\b${field}\\s*:|[{,]\\s*${field}\\s*[,}]`).test(resultText(name, 'masked'))
}
/** §6.1's own escape hatch: a measurement-only block may declare itself a diagnostic/hygiene
 *  block — but only in the form the spec names: `{diagnostic:true, pass:false}`. */
function isMarkedNonRow(name: string): boolean {
  const masked = maskCode(blockBody(name))
  return /(?:diagnostic|hygiene)\s*:\s*true/.test(masked) && /pass\s*:\s*false\b/.test(masked)
}
function missingField(field: string): string[] {
  return ROW_BLOCKS.filter((n) => !isMarkedNonRow(n) && !hasField(n, field))
}
function hasValidRowId(name: string): boolean {
  return /\brow\s*[:=]\s*'(?:U-\d+|UF-[A-Z0-9][A-Z0-9/-]*)'/.test(resultText(name, 'raw'))
}
function hasValidDclass(name: string): boolean {
  return /\bdclass\s*[:=]\s*'(?:D-interaction|D-visual|D-state)'/.test(resultText(name, 'raw'))
}
function hasEmptyEvidence(name: string): boolean {
  return /\bevidence\s*[:=]\s*(?:''|""|``)/.test(resultText(name, 'raw'))
}

// ---------------------------------------------------------------------------
// §0.3 — the §5.U matrix table (`MATRIX_ROWS`), parsed as a static literal.
//        docs/specs/user-flow-audit.md §2 is a closed 8-row enumeration
//        (U-1..U-8); §3 requires `summary.total` == that row count, each
//        executed row mapping to exactly ONE block.
// ---------------------------------------------------------------------------
function scanBalanced(src: string, start: number): number {
  let depth = 0
  let i = start
  let quote: string | null = null
  while (i < src.length) {
    const ch = src[i]
    if (quote) {
      if (ch === '\\') { i += 2; continue }
      if (ch === quote) quote = null
      i++
      continue
    }
    if (ch === '/' && src[i + 1] === '/') {
      const nl = src.indexOf('\n', i)
      i = nl < 0 ? src.length : nl
      continue
    }
    if (ch === '/' && src[i + 1] === '*') {
      const c = src.indexOf('*/', i)
      i = c < 0 ? src.length : c + 2
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; i++; continue }
    if (ch === '[' || ch === '{' || ch === '(') depth++
    else if (ch === ']' || ch === '}' || ch === ')') { depth--; if (depth === 0) return i }
    i++
  }
  return -1
}
interface MatrixExtract { found: boolean; value?: unknown; error?: string; raw?: string }
function extractExportedLiteral(name: string): MatrixExtract {
  const m = new RegExp(`export\\s+const\\s+${name}\\s*=\\s*`).exec(SRC)
  if (!m) return { found: false }
  const start = m.index + m[0].length
  if (SRC[start] !== '[') return { found: true, error: `the exported ${name} is not a static array literal` }
  const end = scanBalanced(SRC, start)
  if (end < 0) return { found: true, error: `the ${name} array literal does not close` }
  const raw = SRC.slice(start, end + 1)
  try {
    return { found: true, value: new Function(`return (${raw})`)(), raw }
  } catch (e) {
    return { found: true, error: `the ${name} literal is not statically evaluable (pure data required): ${String(e)}`, raw }
  }
}
function matrixRows(): Array<Record<string, unknown>> {
  const ext = extractExportedLiteral('MATRIX_ROWS')
  if (!Array.isArray(ext.value)) return []
  return ext.value.filter((r): r is Record<string, unknown> => !!r && typeof r === 'object')
}

// ===========================================================================
// RULE 1 — FALSIFIABILITY (no row block may return an unconditional `pass:true`)
// ===========================================================================
describe('R1 falsifiability — every row verdict derives `pass` from an observed value', () => {
  it('R1.a `repro_nbsp` must not return a literal `pass:true` (it is a measurement-only block)', () => {
    const body = blockBody('repro_nbsp')
    expect(body, 'BLOCKS.repro_nbsp must exist in scripts/live-drive.mjs').not.toBe('')
    expect(
      returnedPassValues('repro_nbsp'),
      'repro_nbsp returns a literal `pass: true` (line ~1025: "diagnostic block — always report"). ' +
        'A block that cannot fail is NOT evidence (§6.1): either assert the observation, or return ' +
        '`{ diagnostic: true, pass: false }` and keep the measurement in `evidence`/`detail`.',
    ).not.toContain('true')
  })

  it('R1.b `repro_nbsp` must be marked `diagnostic:true` with `pass:false` (never a row verdict)', () => {
    const body = blockBody('repro_nbsp')
    expect(
      /diagnostic\s*:\s*true/.test(body),
      'repro_nbsp must carry the §6.1 diagnostic marker `diagnostic: true` so the runner cannot promote it to a matrix-row PASS',
    ).toBe(true)
    expect(
      /pass\s*:\s*false\b/.test(body),
      'repro_nbsp must return `pass: false` alongside `diagnostic: true` (§6.1: a diagnostic block must NOT be usable as a row verdict)',
    ).toBe(true)
  })

  it("R1.c `toolbar_undo`'s returned `pass` must reference its after-click/revert observation, never a bare `true`", () => {
    const body = blockBody('toolbar_undo')
    expect(body, 'BLOCKS.toolbar_undo must exist').not.toBe('')
    expect(
      returnedPassValues('toolbar_undo'),
      'toolbar_undo returns a literal `pass: true` after the undo click (line ~362) — it reports `afterClick`/the revert ' +
        'result in `detail` while the verdict is unconditional. The pass must be the post-click observation ' +
        '(e.g. `pass: afterClick === true && reverted`), so a no-op click/ a failed revert FAILS the row',
    ).not.toContain('true')
    expect(
      returnedPassValues('toolbar_undo').some((v) => /afterClick|reverted|revertOk|storeOk|undoDisabledAfter|disabledAfter/.test(v)),
      'toolbar_undo\'s `pass` value expression must reference the after-click / revert observation (one of ' +
        'afterClick|reverted|revertOk|storeOk|undoDisabledAfter|disabledAfter); today it is the literal `true`',
    ).toBe(true)
  })

  it('R1.d no `BLOCKS` entry may return a literal `pass:true` — measurement-only blocks must declare `{diagnostic:true, pass:false}`', () => {
    const offenders = UNIQUE_BLOCK_NAMES.filter((n) => {
      const b = blockBody(n)
      return hasLiteralTruePass(b) || returnedPassValues(n).includes('true')
    })
    expect(
      offenders,
      `blocks returning a literal \`pass: true\` (unfalsifiable — §6.1 "a block that cannot fail is NOT evidence"): ` +
        `${offenders.join(', ') || '(none)'}. Each must derive \`pass\` from an observed value, or return ` +
        '`{ diagnostic: true, pass: false }` with the measurement in evidence',
    ).toEqual([])
    const literalsInFile = [...maskCode(SRC).matchAll(/pass\s*[:=]\s*true\b/g)].length
    const literalsInBlocks = [...maskCode(REGION).matchAll(/pass\s*[:=]\s*true\b/g)].length
    expect(
      literalsInFile - literalsInBlocks,
      'a literal `pass: true` outside BLOCKS (e.g. hard-coded in a shared verdict helper) would defeat the falsifiability rule',
    ).toBe(0)
  })
})

// ===========================================================================
// RULE 2 — REAL-INPUT PROOF (the gesture PATH must be recorded and must gate `pass`)
// ===========================================================================
describe('R2 real-input proof — the click/drag PATH is recorded and gates the verdict', () => {
  it("R2.a `ufRealClick` must hit-test the pointer with `document.elementFromPoint` and report `path:'cdp'` only for an on-target hit", () => {
    const fn = helperSlice('ufRealClick')
    expect(fn, 'scripts/live-drive.mjs must keep a `ufRealClick`-style real-gesture helper').not.toBe('')
    expect(fn, 'the helper must hit-test the coordinate it is about to click').toMatch(/document\.elementFromPoint\(/)
    expect(fn, "the helper must return `path: 'cdp'` for the accepted (hit-tested) path").toMatch(/path\s*:\s*'cdp'/)
    expect(fn, 'the helper must resolve the hit against the intended target (element or descendant)').toMatch(/onTarget/)
  })

  it("R2.b a covered/missed target must be recorded as `path:'native-fallback'` — never silently reported as `'cdp'`", () => {
    const fn = helperSlice('ufRealClick')
    expect(fn, "the helper must record the synthetic fallback as `path: 'native-fallback'`").toMatch(/path\s*:\s*'native-fallback'/)
    expect(fn, 'the fallback branch must be reachable only after the hit-test says the point is NOT on the target').toMatch(/onTarget/)
  })

  it("R2.c a row verdict must be gated on the recorded path (`path==='cdp'` or a path-derived `realInput`)", () => {
    const gated =
      /pass\s*:[^\n]*path\s*===\s*'cdp'/.test(SRC) ||
      /pass\s*=[^\n]*path\s*===\s*'cdp'/.test(SRC) ||
      /realInput\s*[:=][^\n]*path\s*===\s*'cdp'/.test(SRC)
    expect(
      gated,
      "the driver must derive the row verdict from the gesture path (e.g. `pass: click.path === 'cdp' && observed`, " +
        "or `realInput = path === 'cdp'` feeding `pass`) so a fallback path can never be a PASS (§6.1 realInput rule)",
    ).toBe(true)
  })

  it("R2.d no row block may promote a non-'cdp' path into a PASS", () => {
    const offenders = ROW_BLOCKS.filter((n) => {
      const values = [...blockBody(n).matchAll(/pass\s*:\s*([^\n}]+)/g)].map((m) => m[1].trim())
      return values.some(
        (v) =>
          /path\s*!==/.test(v) ||
          /path\s*===\s*'(?:already|already-expanded|native-fallback|missing|zero-box|skipped)'/.test(v),
      )
    })
    expect(
      offenders,
      `row blocks whose \`pass\` accepts a non-'cdp' gesture path: ${offenders.join(', ') || '(none)'}. ` +
        "e.g. uf_panes_10 passes on `opened.path !== 'missing'`, which accepts 'native-fallback'; " +
        "§6.1 requires `pass` false unless the path is the hit-tested `'cdp'` one",
    ).toEqual([])
  })

  it('R2.e every `uf_*` row block that clicks must drive it through `ufRealClick`; a native `.click()` may only be a `[DIAG]`-marked non-verdict', () => {
    const clickers = UF_ROW_BLOCKS.filter((n) => /\.click\(\)/.test(blockBody(n)))
    const offenders = clickers.filter((n) => {
      const b = blockBody(n)
      return !/ufRealClick\(/.test(b) || !/\[DIAG\]/.test(b)
    })
    expect(
      offenders,
      `uf_* row blocks containing a bare native \`.click()\` without the ufRealClick gesture and a \`[DIAG]\` marker: ` +
        `${offenders.join(', ') || '(none)'} (inspectd ${clickers.length}: ${clickers.join(', ') || '(none)'})`,
    ).toEqual([])
  })

  it('R2.f a block that drives a gesture with a synthetic `.click()` must classify it (real CDP gesture, `[DIAG]`, or an affirmative proxy/synthetic/path record)', () => {
    const nativeClickers = UNIQUE_BLOCK_NAMES.filter((n) => /\.click\(\)/.test(blockBody(n)))
    const offenders = nativeClickers.filter((n) => {
      const b = maskCode(blockBody(n))
      const diagMarker = /\[DIAG\]/.test(b)
      const realGesture = /Input\.dispatchMouseEvent/.test(b) || /ufRealClick\(/.test(b) || /cdp\.gesture\(/.test(b)
      const classified =
        /proxyPASS\s*:\s*true/.test(b) ||
        /synthetic\s*:\s*true/i.test(b) ||
        /(?:diagnostic|hygiene)\s*:\s*true/.test(b) ||
        /\bpath\s*:/.test(b)
      return !diagMarker && !realGesture && !classified
    })
    expect(
      offenders,
      'blocks whose row gesture is a synthetic DOM `.click()` yet record no path/proxy classification ' +
        `(audit finding (c): synthetic fallbacks are indistinguishable from real gestures): ${offenders.join(', ') || '(none)'}. ` +
        'Route the gesture through ufRealClick, or record the synthetic/proxy nature (and the path) in the result',
    ).toEqual([])
  })
})

// ===========================================================================
// RULE 3 — NO PROXY ORACLE FOR A PASS
// ===========================================================================
describe('R3 no proxy oracle — a PASS carries `proxyPASS:false`; presence/attribute/class/computed-style-only oracles cannot PASS', () => {
  it('R3.a the driver must gate `pass` on `proxyPASS` (an accepted PASS requires `proxyPASS:false`)', () => {
    expect(
      SRC,
      'the §6.1 `proxyPASS` field does not exist anywhere in the driver — no PASS can be checked for a proxy oracle',
    ).toMatch(/proxyPASS/)
    const proxied = allPassValueExpressions(SRC).some((v) => /proxy|presence|domOnly|computedStyleOnly/i.test(v))
    expect(
      proxied,
      'no `pass` derivation references a proxy term; `pass` must be false when the oracle is a proxy ' +
        '(e.g. `pass: observed && !proxyPASS` or `pass: realInput && !isProxy && observed`)',
    ).toBe(true)
  })

  it('R3.b `user6_search_no_flicker` must be marked `proxyPASS:true` with `pass:false` (its oracle is DOM presence)', () => {
    const body = blockBody('user6_search_no_flicker')
    expect(body, 'BLOCKS.user6_search_no_flicker must exist').not.toBe('')
    expect(
      /noLanding/.test(body),
      'user6_search_no_flicker is expected to keep its `noLanding = !!document.getElementById(...)` presence sample, now marked as a proxy',
    ).toBe(true)
    expect(
      /proxyPASS\s*:\s*true/.test(body),
      'user6_search_no_flicker passes on `noLanding = !!document.getElementById(\'stage-landing\')` — DOM PRESENCE only, ' +
        'no painted/rendered oracle. §6.1 requires `proxyPASS:true` with the proxy named in `evidence`, and `pass:false`',
    ).toBe(true)
    expect(
      /pass\s*:\s*false\b/.test(body),
      'user6_search_no_flicker must return `pass: false` while its only oracle is a presence probe (§6.1 proxyPASS rule)',
    ).toBe(true)
  })

  it('R3.c `user3_collapse_orientation` must be marked `proxyPASS:true` with `pass:false` (its only driver is a synthetic `.click()`)', () => {
    const body = blockBody('user3_collapse_orientation')
    expect(body, 'BLOCKS.user3_collapse_orientation must exist').not.toBe('')
    expect(
      /proxyPASS\s*:\s*true/.test(body),
      'user3_collapse_orientation drives its gesture with a native `.click()` inside Runtime.evaluate (a synthetic DOM click, ' +
        'not a hit-tested CDP gesture) and passes on it — §6.1/rule 2 requires the synthetic path be recorded as ' +
        '`proxyPASS: true` (or a `synthetic` marker) with `pass: false`',
    ).toBe(true)
    expect(
      /pass\s*:\s*false\b/.test(body),
      'user3_collapse_orientation must return `pass: false` — a synthetic `.click()` is not a proven real gesture',
    ).toBe(true)
  })
})

// ===========================================================================
// RULE 4 — STRUCTURED §6.1 RESULT FIELDS
// ===========================================================================
describe('R4 structured result fields — every row-block result carries the §6.1 schema', () => {
  it('R4.0 the row-block census resolves (20 §5.U/checklist `uf_*` row blocks + the legacy extended rows)', () => {
    expect(
      BLOCK_ENTRIES.length,
      'the BLOCKS table could not be parsed: keep one `  <name>: [async] (h) => {` entry per block inside `const BLOCKS = { ... }`',
    ).toBeGreaterThanOrEqual(30)
    expect(UF_ROW_BLOCKS.length, `uf_* row blocks found: ${UF_ROW_BLOCKS.join(', ')}`).toBeGreaterThanOrEqual(20)
    expect(
      ROW_BLOCKS.length,
      'the §6.1 row-block scope (uf_* row blocks + the legacy extended-row blocks) must remain non-empty',
    ).toBeGreaterThanOrEqual(20)
    expect(
      ROW_BLOCKS.filter((n) => blockBody(n) === ''),
      'every row block must resolve to a real BLOCKS entry',
    ).toEqual([])
  })

  it("R4.1 every row block must declare its `row` id (a §5.U id `U-n` or a checklist id `UF-<SURFACE>-<n>`)", () => {
    const offenders = missingField('row').filter((n) => !hasValidRowId(n))
    expect(
      offenders,
      `row blocks with no §6.1 \`row\` id (a checklist/matrix row id such as 'U-1' or 'UF-PANES-12'): ` +
        `${offenders.join(', ') || '(none)'} — a report row cannot be emitted for these blocks`,
    ).toEqual([])
  })

  it('R4.2 every row block must declare the pinned user-visible end state in `assertion`', () => {
    const offenders = missingField('assertion')
    expect(
      offenders,
      `row blocks with no §6.1 \`assertion\` field (the pinned user-visible end state): ${offenders.join(', ') || '(none)'}`,
    ).toEqual([])
  })

  it("R4.3 every row block must declare `dclass` as one of D-interaction / D-visual / D-state", () => {
    const offenders = missingField('dclass').filter((n) => !hasValidDclass(n))
    expect(
      offenders,
      `row blocks with no valid §6.1 \`dclass\` (D-interaction|D-visual|D-state): ${offenders.join(', ') || '(none)'}`,
    ).toEqual([])
  })

  it('R4.4 every row block must declare the `realInput` boolean (derived from the gesture path)', () => {
    const offenders = missingField('realInput')
    expect(
      offenders,
      `row blocks with no §6.1 \`realInput\` field (§6.1: true only when the gesture PATH was proven): ${offenders.join(', ') || '(none)'}`,
    ).toEqual([])
  })

  it('R4.5 every row block must carry a non-empty `evidence` string with the concrete observed value', () => {
    const offenders = missingField('evidence').filter((n) => !hasEmptyEvidence(n))
    expect(
      offenders,
      `row blocks with no §6.1 \`evidence\` field (the concrete observed value): ${offenders.join(', ') || '(none)'}`,
    ).toEqual([])
  })

  it('R4.6 every row block must declare `proxyPASS` (false required for an accepted PASS)', () => {
    const offenders = missingField('proxyPASS')
    expect(
      offenders,
      `row blocks with no §6.1 \`proxyPASS\` field: ${offenders.join(', ') || '(none)'}`,
    ).toEqual([])
  })

  it("R4.7 every row block must declare `surface` ({ target:'assembled-renderer', liveSurfacePresent })", () => {
    const offenders = missingField('surface')
    expect(
      offenders,
      `row blocks with no §6.1 \`surface\` field (the RCA-12 layer statement): ${offenders.join(', ') || '(none)'}`,
    ).toEqual([])
  })

  it("R4.8 the driver must define the `surface` shape the §6.1 schema names (target 'assembled-renderer' + a liveSurfacePresent boolean)", () => {
    expect(
      SRC,
      "the §6.1 surface target literal 'assembled-renderer' (§3 schema) is missing from the driver",
    ).toMatch(/target\s*:\s*'assembled-renderer'/)
    expect(
      SRC,
      'the §6.1 surface must carry a `liveSurfacePresent` boolean so a report row states whether the live surface was reached',
    ).toMatch(/liveSurfacePresent\s*:/)
  })

  it('R4.9 every row block must still return a `pass` field (the verdict the report row reads)', () => {
    const offenders = missingField('pass')
    expect(offenders, `row blocks with no \`pass\` verdict at all: ${offenders.join(', ') || '(none)'}`).toEqual([])
  })
})

// ===========================================================================
// RULE 5 — ROW-SET / COUNT RECONCILIATION (summary.total == §5.U rows executed)
// ===========================================================================
describe('R5 row-set reconciliation — MATRIX_ROWS is the single source of the reported row set', () => {
  it('R5.a `MATRIX_ROWS` must be exported as a static table (the harness asserts the row set against it)', () => {
    expect(
      SRC,
      'no `export const MATRIX_ROWS = [ ... ]` table exists — the §5.U row set (and therefore `summary.total`) is ' +
        'not machine-checkable, and the report cannot be reconciled against the matrix',
    ).toMatch(/export\s+const\s+MATRIX_ROWS\s*=/)
    const ext = extractExportedLiteral('MATRIX_ROWS')
    expect(ext.error ?? null, `MATRIX_ROWS must be statically parseable pure data: ${ext.error ?? ''}`).toBe(null)
    expect(Array.isArray(ext.value), 'MATRIX_ROWS must be an array of rows').toBe(true)
  })

  it('R5.b `MATRIX_ROWS` must enumerate exactly the eight §5.U rows U-1..U-8, with no duplicated row id', () => {
    const rows = matrixRows()
    expect(
      rows.length,
      `MATRIX_ROWS must enumerate the §5.U closed set U-1..U-8 (8 rows); found ${rows.length}: ${JSON.stringify(rows.map((r) => r.row))}`,
    ).toBe(8)
    const ids = rows.map((r) => r.row)
    expect(
      [...ids].map(String).sort(),
      'MATRIX_ROWS row ids must be exactly U-1..U-8 (docs/specs/user-flow-audit.md §2, the capped 8-row delta matrix)',
    ).toEqual(['U-1', 'U-2', 'U-3', 'U-4', 'U-5', 'U-6', 'U-7', 'U-8'])
    expect(
      ids.length,
      `a duplicated matrix row id makes the row-set ambiguous: ${ids.join(', ')}`,
    ).toBe(new Set(ids).size)
  })

  it('R5.c every `MATRIX_ROWS` entry must name exactly ONE block, and that block must exist in `BLOCKS`', () => {
    const rows = matrixRows()
    expect(rows.length, 'non-vacuity: MATRIX_ROWS must be populated before this mapping can be checked').toBe(8)
    const bad = rows
      .filter((r) => typeof r.block !== 'string' || !UNIQUE_BLOCK_NAMES.includes(r.block as string))
      .map((r) => `${String(r.row)}->${JSON.stringify(r.block)}`)
    expect(
      bad,
      `matrix rows whose \`block\` is missing or does not name a BLOCKS key: ${bad.join(', ') || '(none)'} ` +
        '(each executed row must map to exactly one existing block — §6.1 row-set/count reconciliation)',
    ).toEqual([])
  })

  it('R5.d the run summary must report `total` == the executed matrix-row count (never the number of blocks)', () => {
    const m = /(?:const|let|var)\s+\w*[Ss]ummary\w*\s*=\s*\{|summary\s*:\s*\{/.exec(SRC)
    expect(
      m,
      'the driver emits no §6.1 run summary object at all (main() only prints `done: N blocks, F FAIL, P PARKED` to stderr)',
    ).not.toBeNull()
    const braceAt = SRC.indexOf('{', (m as RegExpExecArray).index)
    const end = scanBalanced(SRC, braceAt)
    const summaryText = end < 0 ? SRC.slice(braceAt, braceAt + 800) : SRC.slice(braceAt, end + 1)
    expect(
      summaryText,
      'the §6.1 summary `total` must be derived from the MATRIX_ROWS table (the §5.U row count), not from Object.keys(BLOCKS)',
    ).toMatch(/total\s*:[^,\n]*(MATRIX_ROWS|matrixRows)/)
    for (const key of ['pass', 'fail', 'parked']) {
      expect(
        summaryText,
        `the §6.1 summary must carry the \`${key}\` count ({ total, pass, fail, parked } — docs/specs/user-flow-audit.md §3)`,
      ).toMatch(new RegExp(`\\b${key}\\s*:`))
    }
  })

  it('R5.e the driver must reconcile the executed rows against MATRIX_ROWS so a missing block or duplicated row id is detectable', () => {
    const reconciles =
      /Set\(\s*MATRIX_ROWS/.test(SRC) ||
      /MATRIX_ROWS[^\n]*(?:\.every\(|\.filter\(|\.find\(|\.includes\(|\.map\()/.test(SRC)
    expect(
      reconciles,
      'nothing derives from MATRIX_ROWS: a matrix row with no block (or a row id executed twice) cannot be detected, ' +
        'so `summary.total` and the reported row set cannot be reconciled against §5.U',
    ).toBe(true)
  })
})

// ===========================================================================
// RULE 6 — DUPLICATE KEYS
// ===========================================================================
describe('R6 duplicate keys — the BLOCKS table must not silently drop a definition', () => {
  it('R6.a `BLOCKS` must not contain a duplicated key (`shell_wiring` is defined twice — the first definition is dead)', () => {
    expect(
      DUPLICATED_BLOCK_NAMES,
      `duplicated BLOCKS keys: ${DUPLICATED_BLOCK_NAMES.join(', ') || '(none)'} — the FIRST definition of a duplicated key is ` +
        'dead code (JS object-literal semantics), so `--block=shell_wiring` runs the later one while the earlier ' +
        "block's assertions never execute",
    ).toEqual([])
  })

  it('R6.b every BLOCKS definition must be reachable by name (no definition is shadowed)', () => {
    const shadowed = BLOCK_NAMES.filter((n, i) => BLOCK_NAMES.lastIndexOf(n) !== i)
    expect(
      [...new Set(shadowed)],
      `shadowed BLOCKS definitions (${shadowed.length} definition(s) never execute): ${[...new Set(shadowed)].join(', ') || '(none)'}`,
    ).toEqual([])
  })
})
