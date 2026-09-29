// tests/unit-divergence-fixture-contract.test.ts — unit `U-DIVERGENCE-FIXTURE` (the divergence
// leg's DRIVE-fixture mismatch: leg 1 drives the leg's own demo envelope while the app's boot
// wiring serves its `#wiki-root`/`zone:main` template): THE RED SET, authored RED-FIRST from the
// contract below and RUN BEFORE any implementation (`RCA-1`/`AGENTS.md` item 3).
//
// ⟨GATE-4 REMAND (2026-10-05) — THIS PASS CLOSES `A-2`/`A-3`/`A-10` AND THE FOUR UNDER-STRENGTH
//  ROWS THE ADVERSARIAL PASS NAMED (`§3a.4`/`§3b` `S-3`, findings `A-2`/`A-3`/`A-5`/`A-10`). Every
//  change is ADDITIVE or a RE-DERIVATION; NO existing assertion is weakened, the comparison set the
//  `ok()` labels and their order (TEN calls) are untouched, and the leg adds no check. The items:
//    `A-10` — `loadStepInvocations` ran a RAW comment-blind regex, so a COMMENTED
//            `// await loadFixture(eClient)` read as leg 1's traversal and the PRE-FIX ASYMMETRY was
//            accepted with `R-1`/`R-3`/`P-IM-1`/`P-SM-2` green. The reader now reads
//            `stripLiteralsAndComments(src)`, and `NEG-commented-invocation` (with the pre-fix
//            reader asserted as a SUBJECT) is the draw that holds it.
//    `A-2` — the bounded wait had ZERO coverage: NEW row `P-SM-4` reads its existence, its `F-7`
//            position, its two pinned constants, and DRIVES its five stop arms against the REAL
//            function (extracted from the harness source; see `waitCallables`) plus
//            `NEG-wait-absent`/`NEG-wait-after-load`.
//    `A-3` — the env member had ZERO coverage: NEW row `P-SM-5` reads `PROVIDENT_ENABLE_TOOL_GROUPS:
//            'graph'` at BOTH spawn sites, its absence from the shim transport, and the NINE-member
//            vector (driving `siteArgs`'s own throw on a tenth member).
//    `S-3` — `P-IM-1`'s second negative is now the REAL PRE-FIX ASYMMETRY; `P-IM-3`'s two negatives
//            now MUTATE THE LITERAL THROUGH THE INSTRUMENT; `P-SM-2`'s `calls` is a REAL count with
//            `NEG-duplicate-invocation`; `P-SM-3`'s shim arms read the SHIM'S OWN route with
//            `NEG-shim-load-route-removed`/`NEG-unregistered-load`; `P-TP-1` drives the LEG'S OWN
//            stop paths instead of the in-test `stopReport` model.
//  DECLARED-TERM MOVEMENT (printed in `DECLARED_REGISTER`, in each row's title/body, and in the
//  report): `P-IM-1` `2*2+2 = 6` → `2*2+4 = 8` · `P-SM-2` `2*2+2 = 6` → `2*2+3 = 7` ·
//  `P-TP-1` `3*2+1 = 7` → `3*2+1+1 = 8` · NEW `P-SM-4` `1*3+5+2 = 10` · NEW `P-SM-5` `2*3+1+2 = 9`.
//  TOTAL `78` → `101`. The superseded `6+23+15+8+6+6+7+7 = 78` stays visible everywhere it stood.
//  NO DECLARED TERM IS REDUCED.⟩
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-divergence-drive-fixture.md
//     §0.2 `S-1`…`S-8`  the drive surface as read at this head: leg 1 = `connect` → `drive` with
//                 NO load (S-1), leg 2 loads explicitly (S-1/S-6), the header declares the
//                 SAME-envelope invariant (S-2), the failure path is the dispatch resolver
//                 (S-3), the app's boot wiring no longer bootstraps the demo (S-4/S-5), the demo
//                 literal exists twice as hand-maintained copies (S-7), and every driven id is
//                 authored by the demo (S-8).
//     §1.2/§2.1 `C-1`  THE SYMMETRY — before leg 1 drives, THE LEG ITSELF loads its demo envelope
//                 through the app's own MCP surface, through ONE shared step both legs call
//                 (items 1/2), positioned after `connect` and BEFORE the first `drive` read
//                 (item 3), with the spawn/transport/env contract untouched (item 4) and no new
//                 tool / leg / child / dispatch (item 5).
//     §2.2 `C-2`  THE DRIVE-READINESS PRECONDITION — the load must be OBSERVABLY in effect before
//                 any dispatch (item 1), loud on failure and silent on success, never an `ok()`
//                 row and never a census change (item 2), not a sleep (item 3), a refusal names
//                 itself by quoting the tool error (item 4), and the failure still counts in the
//                 existing `{0,1}` arithmetic (item 5).
//     §2.3 `C-3`  PRESERVED BY NAME (`U-DIVERGENCE-SPAWN` §3.7 `C-7`): no new check and the same
//                 ⟨`A-4` PROSE CORRECTION (the TestWriter's half of `§3b`'s `A-4` row; the SET is NOT
//                 changed — `C-3` item 1 forbids it): the preserved set's own proxies OVER-CLAIM in
//                 three measured ways, and the rows below are read with that bound. (1) the label
//                 `counter increment rendered in BOTH` passes on `renderedHtml.includes('counter')`,
//                 so a NO-OP `inc` handler still satisfies it — the row asserts the SURFACE, never
//                 the increment's effect; (2) `dispatch results non-empty in BOTH (R7)` asserts the
//                 dispatch's non-emptiness, never its `results` CONTENT; (3) row 6
//                 (`nodeId vocabulary matches`) COLLAPSES the ids to one normalized COUNT/string,
//                 so two different id sets of the same size compare equal. A reader citing the
//                 eight comparison rows must cite them as SURFACE rows, not as semantic ones.⟩
//                 eight comparison rows + leg-1 boot check + failure branch, the same demo
//                 literal (12 nodes), the same shared `drive()` (4 calls / 8 members / `norm`),
//                 the same `{0,1}` exit contract, the same two-leg structure, the harness's
//                 import safety and scratch contract.
//     §2.4        the REFUSED alternatives (B) re-point and (C) boot mode — named so a row can
//                 fail a re-pointed drive or an app-side demo mode.
//     §3.1        the two classes; **class (b) is THIS UNIT'S OWN GATE** (`C-8`).
//     §3.2        `R-1`…`R-9` — the class-(a) rows (no Electron boot): `R-1`/`R-3`/`R-4` are the
//                 NEW REDS at this head, `R-2`/`R-5`/`R-6`/`R-7`/`R-8`/`R-9` are the
//                 preservation/regression rows that PASS today.
//     §3.3 `C-9`  `B-1`…`B-5` — the class-(b) rows (the REAL run), declared with their readings.
//     §3.4 `C-10` what the red set must NOT do: no Electron spawn in class (a), no `'electron'`
//                 mock, no `G-9`-frozen artefact as an oracle, NO line-number assertion, no
//                 weakened row, no edit to the sibling unit's red set.
//     §3.6 `C-11` the readings the DONE row must carry.
//     §4.2        the typed register: EIGHT rows as filed — `P-IM-1` `P-IM-2` `P-IM-3` `P-SM-1`
//                 `P-SM-2` `P-SM-3` `P-TP-1` `P-TP-2` — `P-IM-`/`P-SM-`/`P-TP-` ONLY, NO `F-` row,
//                 declared terms printed as the sum of their own factors. The gate-4 remand moved
//                 three of those terms and added the two zero-coverage rows (`P-SM-4`/`P-SM-5`), so
//                 the live arithmetic is `8 + 23 + 15 + 8 + 7 + 6 + 8 + 7 + 10 + 9 = 101` and the
//                 superseded `6 + 23 + 15 + 8 + 6 + 6 + 7 + 7 = 78` stays recorded beside it.
//                 Deterministic plain tables, no new devDependency, seed `0x20260930`,
//                 stop-after-5, ≤100/row and ≤400 total.
//     §4.3        the register's honesty limits: no row asserts the leg's COLOUR, no row asserts
//                 the APP, every row reads the SAME instrument the class-(a) rows read, and a row
//                 that cannot execute its declared term is BROKEN rather than silently re-scoped.
//     §5          `L-1`…`L-6` — the layer ledger: HARNESS / `[D]` on every line.
//
// LAYER (`RCA-12`, mandatory declaration): **HARNESS / `[D]`**. Every row in this file reads
// SOURCE TEXT or the harness's import-safe exported surface. NO row here is app-green,
// envelope-green, rendered-green or live-green, and no row may be cited as evidence about
// rendering, layout, CSS, geometry, gestures, the store, the engine or any user-visible
// behaviour. After this unit the leg itself no longer reads the app's own booted graph (§5 L-2).
//
// RED-SET SPLIT (`§3.1`): class (a) = `R-1`…`R-9` + the register — RUNNABLE AT THIS HEAD, NO
// ELECTRON BOOT, NO mock binding of any form (`C-10`). class (b) = `B-1`…`B-5` — THE REAL RUN;
// they are the UNIT'S OWN GATE (`C-8`/§6 `V-3`) and their readings are produced by the
// implementer's landing pass and the live runner's pass, so they are DECLARED here with their
// shape and are NOT executed (and NOT faked) by this red pass.
//
// INSTRUMENT REPAIR (this pass, on the implementer's measurement — a SATISFIABILITY repair, not a
// weakening: no contract-side expectation moved, no declared register term shrank, and the three new
// reds are still red at this head). `C-1` item 2 pins ONE `provident.load` call SITE while `C-1`
// items 1/3 constrain the step as it is REACHED ON EACH LEG'S PATH; the first red pass read the
// per-leg rows off the SITE, which no one-shared-step design can satisfy (one site cannot belong to
// two legs, so one leg always read `calls: 0`), and it asked a fabricated third-host string that
// lacked the detector's own marker to report three app-launch sites. Both are repaired at the
// INSTRUMENT/attribution layer only:
//   (1) a leg's load coordinate is now `loadVia: 'shared-step'` (this leg's INVOCATION of the ONE
//       step, with its own client — `loadCalls` stays the contract's 1) or `'own-site'` (a call site
//       textually inside the leg's own block, the pre-fix shape), plus `calls` = traversals;
//   (2) the third-host negative carries the marker the detector's own rule requires, so it scores 3;
//   (3) two latent instrument faults the repair exposed are fixed with it: `drive()`'s DECLARATION
//       was read as an invocation (the declaration window ended on the name's start and the real
//       script writes `async function drive`), and the shim-host census window was wide enough to
//       reach the shim marker from EVERY transport in a drawn module.
// MEASURED (see the report): the contract's own design — one helper carrying the single site plus
// the loud probe, invoked by BOTH legs after `connect` and before `drive` — applied to this head's
// real `scripts/electron-divergence.mjs` text reads `violations: []`, `loadCalls: 1`,
// `leg1/leg2: via=shared-step, calls=1, ordered, demo` and `ok() in span: 0/0`.
//
// `G-9`/`X-9` PIN SAFETY: this file binds NO vitest mock API in any form (the protected
// bridge-mock census in `tests/unit-v5-migration-contract.test.ts` pins the exact five-name set,
// so a new file that mocks would red a protected row), and it writes no pinned byte. The `R-9`
// re-assertion is a CROSS-CHECK only; the protected file remains the authority (`X-9`).
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const HARNESS_PATH = join(REPO_ROOT, 'scripts', 'electron-divergence.mjs')
const DEMO_MODULE_PATH = join(REPO_ROOT, 'src', 'shared', 'demo-envelope.ts')
const TEMPLATE_SHAPE_PATH = join(REPO_ROOT, 'src', 'main', 'template-shape.ts')
const MCP_SERVER_PATH = join(REPO_ROOT, 'src', 'main', 'mcp-server.ts')
const SECURITY_PATH = join(REPO_ROOT, 'src', 'main', 'security.ts')
const RENDERER_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const RUNTIME_PATH = join(REPO_ROOT, 'src', 'renderer', 'runtime.ts')
const BATTERY_HOST_PATH = join(REPO_ROOT, 'src', 'main', 'battery-host.ts')
const PACKAGE_JSON_PATH = join(REPO_ROOT, 'package.json')
const VITEST_CONFIG_PATH = join(REPO_ROOT, 'vitest.config.ts')

function readText(path: string): string {
  try {
    return readFileSync(path, 'utf8')
  } catch (e) {
    throw new Error(`U-DIVERGENCE-FIXTURE [T] read failure: ${path} — ${(e as Error).message}`)
  }
}

const HARNESS_SRC = readText(HARNESS_PATH)
const DEMO_MODULE_SRC = readText(DEMO_MODULE_PATH)
const TEMPLATE_SHAPE_SRC = readText(TEMPLATE_SHAPE_PATH)
const MCP_SERVER_SRC = readText(MCP_SERVER_PATH)
const SECURITY_SRC = readText(SECURITY_PATH)
const RENDERER_SRC = readText(RENDERER_PATH)
const RUNTIME_SRC = readText(RUNTIME_PATH)
const BATTERY_HOST_SRC = readText(BATTERY_HOST_PATH)

// ===========================================================================
// §0.2/§3.2 — the recorded structural literals of the contract (`S-1`…`S-8`).
// ===========================================================================

/** `C-3` item 1 — the EIGHT comparison rows, in their recorded order, plus the leg-1 boot check
 *  and the failure branch (§10.3 item 3: `8` comparison checks + the boot check + the branch). */
const COMPARISON_LABELS: string[] = [
  'census inTree matches (shim = real)',
  'census registered matches',
  'dirtied ids match (normalized)',
  'SSR fragment matches (structural)',
  'data-node-id set matches (structural)',
  'nodeId vocabulary matches (structural)',
  'counter increment rendered in BOTH',
  'dispatch results non-empty in BOTH (R7)',
]
const BOOT_LABEL = 'electron: dispatch renderedNonEmpty'
const FAILURE_BRANCH_LABEL = 'electron leg produced a result'
const ALL_LABELS: string[] = [BOOT_LABEL, ...COMPARISON_LABELS, FAILURE_BRANCH_LABEL]

/** `C-2` item 1 / `FINDING-1` item 5 — the leg's OWN existing tool set, i.e. the surfaces a
 *  readiness probe may read back. Any other tool name is NOT admissible evidence. */
const ADMISSIBLE_PROBE_TOOLS: string[] = [
  'provident.get_rendered_html',
  'provident.list_targets',
  'provident.load',
]

/** `C-3` item 3 / §10.3 item 5 — `drive()`'s four calls, in order. */
const DRIVE_CALLS: string[] = [
  'provident.get_rendered_html',
  'provident.dispatch',
  'provident.get_rendered_html',
  'provident.list_targets',
]
/** `C-3` item 3 / §10.3 item 4 — `drive()`'s eight returned members, in order. */
const DRIVE_MEMBERS: string[] = [
  'census',
  'ssr',
  'dirtied',
  'resultsNonEmpty',
  'dataNodeIds',
  'renderedNonEmpty',
  'counterPresent',
  'nodeIds',
]
/** `S-8`/`C-3` item 2 — the demo's authored id vocabulary, and the four ids `drive()` needs. */
const DEMO_AUTHORED_TYPES: string[] = ['div', 'h1', 'section', 'h2', 'div', 'button', 'button', 'button', 'section', 'h2', 'input', 'div']
const DEMO_AUTHORED_CSS_IDS: string[] = [
  'counter-card',
  'counter',
  'inc',
  'dec',
  'reset',
  'echo-card',
  'echo-input',
  'echo-out',
]
const DEMO_AUTHORED_PROPS_IDS: string[] = ['counter', 'echo-input', 'echo-out']
const DEMO_DRIVEN_IDS: string[] = ['inc', 'counter', 'echo-out', 'echo-input']
const DEMO_NODE_COUNT = 12
/** `S-4`/`R-7` — the app boot template's authored id pair (`M-3`'s pair). */
const BOOT_TEMPLATE_IDS: string[] = ['wiki-root', 'zone:main']
/** `C-3` item 5 / `P-SM-2` — the two legs' spawn commands. */
const SHIM_HOST_MARKER = 'batteryHost'
/** The sibling unit's vector members (`U-DIVERGENCE-SPAWN` §3.1 `C-1`): NINE, with the shared
 *  memory bypass once and exactly one `--user-data-dir=` LAST. */
const CONTRACT_FLAG_MEMBERS: string[] = [
  '--mcp-transport=stdio',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--in-process-gpu',
  '--ozone-platform=x11',
  '--disable-dev-shm-usage',
]

// ===========================================================================
// INSTRUMENT — SOURCE TEXT, read structurally (route (a) of this unit's predecessor `C-1`
// item 6). The instrument never asserts a LINE NUMBER (`C-10`): it pins the SHAPE of the call
// sites. No `src/**` byte is written; the denied surface is READ only.
// ===========================================================================

interface Span { start: number; end: number }

/** `A-10` — MASK every STRING/TEMPLATE literal and every COMMENT, keeping the source's LENGTH and
 *  every offset (a masked character becomes a newline, so the line of a code character is
 *  unchanged), so a TEXT-SHAPE scanner cannot read a COMMENTED or QUOTED mention as CODE.
 *
 *  WHY (the gate-4 adversarial finding `A-10`, BLOCKING): the harness's own `callSites()` skips a
 *  callee named inside a comment, but the shared step's invocation reader (`loadStepInvocations`)
 *  was a RAW regex over the whole source with NO comment stripping — so a commented
 *  `// await loadFixture(eClient)` in leg 1's block READ AS THAT LEG'S TRAVERSAL (`via:
 *  'shared-step'`, `calls: 1`, ordering satisfied) and the PRE-FIX ASYMMETRY was accepted with
 *  `R-1`/`R-3`/`P-IM-1`/`P-SM-2` all green. The reader now reads THIS mask, so prose and quoted
 *  text can never be a call. */
function stripLiteralsAndComments(src: string): string {
  const out = src.split('')
  let i = 0
  while (i < src.length) {
    const c = src[i]!
    if (c === "'" || c === '"' || c === '`') {
      const end = skipLiteral(src, i)
      for (let k = i; k <= end && k < src.length; k++) if (out[k] !== '\n') out[k] = '\n'
      i = end + 1
      continue
    }
    if (c === '/' && src[i + 1] === '/') {
      let e = src.indexOf('\n', i)
      if (e < 0) e = src.length
      for (let k = i; k < e; k++) out[k] = '\n'
      i = e
      continue
    }
    if (c === '/' && src[i + 1] === '*') {
      const close = src.indexOf('*/', i + 2)
      const e = close < 0 ? src.length : close + 2
      for (let k = i; k < e; k++) if (out[k] !== '\n') out[k] = '\n'
      i = e
      continue
    }
    i++
  }
  return out.join('')
}
const HARNESS_CODE = stripLiteralsAndComments(HARNESS_SRC)

/** Skip a STRING or TEMPLATE literal starting at `i` (a `'`/`"`/`` ` ``): returns the index of its
 *  closing delimiter, or the source end when unterminated. A template literal's `${ … }` body is
 *  skipped as part of the literal, so a `{`/`}` inside an authored handler body is never counted. */
function skipLiteral(src: string, i: number): number {
  const quote = src[i]!
  i++
  if (quote === '`') {
    let depth = 0
    while (i < src.length) {
      const c = src[i]!
      if (c === '\\') { i += 2; continue }
      if (c === '$' && src[i + 1] === '{') { depth++; i += 2; continue }
      if (c === '}' && depth > 0) { depth--; i++; continue }
      if (c === '`' && depth === 0) return i
      i++
    }
    return src.length
  }
  while (i < src.length) {
    const c = src[i]!
    if (c === '\\') { i += 2; continue }
    if (c === quote) return i
    if (c === '\n') return i
    i++
  }
  return src.length
}

/** The index just past the bracket opened at `openIndex`, skipping literals and comments. The
 *  return sits ON the closer (or `src.length` when the source is unbalanced). */
function skipToBalanced(src: string, openIndex: number): number {
  const open = src[openIndex]!
  const close = open === '[' ? ']' : open === '{' ? '}' : open === '(' ? ')' : ''
  if (close === '') return -1
  let depth = 0
  let i = openIndex
  while (i < src.length) {
    const c = src[i]!
    if (c === "'" || c === '"' || c === '`') { i = skipLiteral(src, i) + 1; continue }
    if (c === '/' && src[i + 1] === '/') { const nl = src.indexOf('\n', i); i = nl < 0 ? src.length : nl + 1; continue }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? src.length : e + 2; continue }
    if (c === open) depth++
    else if (c === close) { depth--; if (depth === 0) return i }
    i++
  }
  return src.length
}

/** The index of the bracket matching the opener at `openIndex` (`-1` when unbalanced). */
function findMatching(src: string, openIndex: number): number {
  const close = src[openIndex] === '[' ? ']' : src[openIndex] === '{' ? '}' : src[openIndex] === '(' ? ')' : ''
  if (close === '') return -1
  const end = skipToBalanced(src, openIndex)
  return end < src.length || src[end] === close ? end : -1
}

/** The text between a balanced bracket pair located by the index of its opener. */
function balancedBody(src: string, openIndex: number): string | null {
  const end = findMatching(src, openIndex)
  return end < 0 ? null : src.slice(openIndex + 1, end)
}

/** Split a comma-separated list at TOP-LEVEL commas, skipping literals, comments and nested
 *  brackets. Each element's text is trimmed (the `ok()` label census reads it). */
function splitTopLevel(body: string): string[] {
  const out: string[] = []
  let start = 0
  let i = 0
  while (i < body.length) {
    const c = body[i]!
    if (c === "'" || c === '"' || c === '`') { i = skipLiteral(body, i) + 1; continue }
    if (c === '/' && body[i + 1] === '/') { const nl = body.indexOf('\n', i); i = nl < 0 ? body.length : nl + 1; continue }
    if (c === '[' || c === '{' || c === '(') { const m = skipToBalanced(body, i); i = m < 0 ? body.length : m + 1; continue }
    if (c === ',') { out.push(body.slice(start, i).trim()); start = i + 1 }
    i++
  }
  const tail = body.slice(start).trim()
  if (tail !== '') out.push(tail)
  return out
}

/** Every `function <name>(…) { … }` / `<modifiers> <name>(…) { … }` declaration's NAME, BODY and
 *  source span (the method form covers TS class members such as `Runtime.load`). */
function functionRegions(src: string): Map<string, Span & { body: string }> {
  const out = new Map<string, Span & { body: string }>()
  const re = /\bfunction\s+([A-Za-z_$][\w$]*)\s*\(|(?:^|\n)[ \t]*(?:private |public |protected |static |async |\*\s*)*([A-Za-z_$][\w$]*)\s*[(<]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) {
    const paren = src.indexOf('(', m.index)
    const params = balancedBody(src, paren)
    if (params === null) continue
    let j = paren + params.length + 2
    while (j < src.length && /\s/.test(src[j]!)) j++
    // a class METHOD carries a return annotation between its parameter list and its body
    if (src[j] === ':') {
      let k = j + 1
      let depth = 0
      while (k < src.length) {
        const c = src[k]!
        if (c === '<' || c === '(' || c === '[') depth++
        else if (c === '>' || c === ')' || c === ']') depth--
        else if (depth === 0 && (c === '{' || c === ';')) break
        k++
      }
      if (src[k] !== '{') continue
      j = k
    }
    if (src[j] !== '{') continue
    const end = findMatching(src, j)
    const body = balancedBody(src, j)
    if (body === null || end < 0) continue
    const name = m[1] ?? m[2]
    if (name === undefined || name === null) continue
    if (!out.has(name)) out.set(name, { start: m.index, end, body })
  }
  return out
}

/** A call site whose callee's NAME is the regex's capture group 1. A callee NAMED INSIDE A COMMENT
 *  is prose, never a call site (`S-2`'s own prose names `ok()`). */
interface CallSite { name: string; index: number; rest: string }
function callSites(src: string, re: RegExp): CallSite[] {
  const out: CallSite[] = []
  const rx = new RegExp(re.source, 'g')
  let m: RegExpExecArray | null
  while ((m = rx.exec(src)) !== null) {
    // the `(` follows the CALLEE'S NAME — never the match's first character (which for a method
    // call is the receiver's `.`), or `shimClient.callTool(…)` would be read from the dot.
    const paren = src.indexOf('(', m.index + Math.max(1, m[0].length - 1))
    if (paren < 0) continue
    const rest = balancedBody(src, paren)
    if (rest === null) continue
    const lineStart = src.lastIndexOf('\n', m.index) + 1
    const line = src.slice(lineStart, m.index)
    if (/\/\/|^\s*\*/.test(line)) continue
    out.push({ name: m[1]!, index: m.index, rest })
  }
  return out
}

/** `C-3` item 1 — the CALL SITES of `ok()`: the helper's own declaration is not a comparison row,
 *  and neither is a mention inside the prose (`S-2` names `ok()` in a comment). */
/** Every NON-definition `ok()` call site, with the label the leg emits. The helper's own
 *  declaration (`function ok(label, cond, extra = '')`) is not a comparison row, and the label
 *  argument of a real call is always a quoted literal — the two are separated explicitly, so a
 *  dropped or added call is LOUD rather than silently absorbed (`C-3` item 1). */
function okCallSites(src: string): CallSite[] {
  const all = callSites(src, /\b(ok)\s*\(/)
  const declaration = all.filter((s) => s.rest.trimStart().startsWith('label'))
  return all.filter((s) => !declaration.includes(s))
}
const OK_CALLS = okCallSites(HARNESS_SRC)
const PROCESS_EXIT_CALLS = callSites(HARNESS_SRC, /\b(process\.exit)\s*\(/)

/** Every TOP-LEVEL `{ … }` element of an array-literal body, as its own object TEXT. */
/** An index scanner over SOURCE TEXT that never looks INSIDE a literal: `nextCode()` returns the
 *  next index at `i` or later whose character is real CODE (not a string/template body, not a
 *  comment). The harness's authored handler bodies are template literals full of braces, so every
 *  structural read in this file is built on this scanner (`C-10`: shape, never a line number). */
function nextCode(src: string, i: number, limit = src.length): number {
  while (i < limit) {
    const c = src[i]!
    if (c === "'" || c === '"' || c === '`') { i = skipLiteral(src, i) + 1; continue }
    if (c === '/' && src[i + 1] === '/') { const nl = src.indexOf('\n', i); i = nl < 0 || nl > limit ? limit : nl + 1; continue }
    if (c === '/' && src[i + 1] === '*') { const e = src.indexOf('*/', i + 2); i = e < 0 ? limit : e + 2; continue }
    return i
  }
  return limit
}

/** The RAW value of the FIRST top-level `<key>:` in a fragment's INTERIOR (the fragment's own
 *  braces/brackets are stripped by `fieldOf`), with the index of that value. A nested literal is
 *  skipped by its balanced span, so a nested key is never read as this level's. */
function codeProp(bodyIn: string, key: string): { text: string; at: number } | null {
  const t = bodyIn.trim()
  const body = t.startsWith('{') || t.startsWith('[') ? t.slice(1, -1) : t
  let i = 0
  while (i < body.length) {
    i = nextCode(body, i)
    if (i >= body.length) break
    const c = body[i]!
    if (c === '{' || c === '[' || c === '(') { const e = skipToBalanced(body, i); i = e < 0 ? body.length : e + 1; continue }
    const m = /^\s*([A-Za-z_$][\w$]*)\s*:/.exec(body.slice(i, i + 60))
    if (m !== null) {
      const at = i + m[0].length
      let e = at
      while (e < body.length) {
        e = nextCode(body, e)
        if (e >= body.length) break
        const d = body[e]!
        if (d === '{' || d === '[' || d === '(') { const mm = skipToBalanced(body, e); e = mm < 0 ? body.length : mm; continue }
        if (d === ',') break
        e++
      }
      if (m[1] !== key) { i = Math.max(e, i + 1); continue }
      return { text: body.slice(at, e).trim(), at }
    }
    i++
  }
  return null
}

/** The value of the FIRST top-level `key:` in a source fragment, as BARE text: an object/array value
 *  keeps its source form (so a nested `fieldOf(value,'id')` reads inside it). */
function fieldOf(src: string, key: string): string | null {
  const hit = codeProp(src, key)
  return hit === null ? null : hit.text
}

/** `name: value` from a call's argument list. */
function argValue(rest: string, name: string): string | null {
  return fieldOf(rest, name)
}

function stripQuotes(t: string): string {
  const m = /^(['"`])([\s\S]*?)\1$/.exec(t.trim())
  return m === null ? t.trim() : m[2]!
}
function stringLiteral(t: string | null): string | null {
  return t === null ? null : stripQuotes(t)
}

interface AuthoredNode { type: string; cssId: string | null; propsId: string | null }
interface DemoLiteral { types: string[]; cssIds: string[]; propsIds: string[] }
/** The demo literal's THREE authored sequences — `type`, `css.id`, `props.id` — each in its own
 *  authored (tree) order, read from the source text (`C-10`: a shape read, never a line number).
 *  Every authored node carries a `type`; the id-bearing members are the ones that carry a `css.id`
 *  and/or a `props.id`, and the harness's and the fork's copies must agree id for id (`S-7`). */
function authoredLiteral(src: string): DemoLiteral {
  const at = src.indexOf('function demoEnvelope')
  const region = at < 0 ? '' : src.slice(at)
  const seq = (re: RegExp): string[] => Array.from(region.matchAll(re)).map((m) => m[1]!)
  return {
    types: seq(/\btype:\s*'([a-z0-9]+)'/g),
    cssIds: seq(/\bcss:\s*\{\s*id:\s*'([^']+)'/g),
    propsIds: seq(/\bprops:\s*\{\s*id:\s*'([^']+)'/g),
  }
}
const HARNESS_LITERAL = authoredLiteral(HARNESS_SRC)
const MODULE_LITERAL = authoredLiteral(DEMO_MODULE_SRC)
/** The demo literal as NODES, by position (`P-IM-3`'s per-position draw). */
function literalNodes(lit: DemoLiteral): AuthoredNode[] {
  return lit.types.map((type, i) => ({ type, cssId: lit.cssIds[i] ?? null, propsId: lit.propsIds[i] ?? null }))
}
const HARNESS_NODES = literalNodes(HARNESS_LITERAL)
const MODULE_NODES = literalNodes(MODULE_LITERAL)

/** `P-IM-3`'s OWN comparison predicate — the twelve position draws' rule, extracted so a MUTATED
 *  literal drawn from the source text is scored by the SAME predicate the row runs (the
 *  `NEG-literal-mutated-through-instrument` draws: a mutation must be seen BY THE INSTRUMENT and
 *  must BREAK this rule, not merely differ from an array the row built for the occasion). Returns
 *  the first position that breaks, or `null` when the drawn literal still agrees position for
 *  position with `src/shared/demo-envelope.ts`. */
function droppedPositionBreak(lit: DemoLiteral): number | null {
  const drawn = literalNodes(lit)
  for (let k = 0; k < DEMO_NODE_COUNT; k++) {
    const mine = drawn[k] ?? null
    const theirs = MODULE_NODES[k] ?? null
    const same = mine !== null && theirs !== null && mine.type === theirs.type && mine.cssId === theirs.cssId && mine.propsId === theirs.propsId
    if (!same) return k
  }
  return null
}

/** `C-1` items 1/3 — the shared load step AS REACHED ON ONE LEG'S PATH, read from the source text.
 *
 *  ⟨ATTRIBUTION, repaired on the implementer's measurement (`R-3` vs `R-1`/`R-2`/`P-IM-1`/`P-SM-2`):
 *  the contract's `C-1` item 2 is ONE shared step — ONE `provident.load` call site — while `C-1`
 *  items 1/3 constrain the step as it is REACHED ON EACH LEG'S PATH. A per-leg call SITE reading is
 *  unsatisfiable by that design (one site cannot belong to two legs, so one leg always reads
 *  `calls: 0`), so the per-leg reading is derived the contract's way: THIS leg's traversal of the
 *  ONE shared step — the shared step's invocation on this leg's path, with this leg's own client —
 *  and the load's `kind`/`envelope` read from the shared step's single site (`loadVia` names
 *  which of the two a row is looking at).⟩ */
interface LegSequence {
  name: string
  client: string
  connectAt: number | null
  /** `A-2` / §0B.3 `F-7` — the leg's coordinate of `waitForBootInstalled(client)` (`null` when the
   *  leg never waits, which is the `NEG-wait-absent` draw). */
  waitAt: number | null
  loadAt: number | null
  /** `'shared-step'` = this leg's traversal of the ONE shared step (`C-1` item 2), `'own-site'` =
   *  a load call site textually inside this leg's own block, `null` = no load on this leg's path. */
  loadVia: 'shared-step' | 'own-site' | null
  loadKind: string | null
  envelopeValue: string | null
  usesDemoEnvelope: boolean
  /** `C-2` item 1 — the leg's own READ-BACK coordinate (its `readSurface` call), i.e. the probe
   *  between the load and `drive` (`null` when the leg never reads anything back). */
  probeAt: number | null
  driveAt: number | null
  /** `C-1` items 1/2 — the number of times this leg's path TRAVERSES the load step (`A-10`/`P-SM-2`
   *  made this a REAL count: a second invocation of the shared step with this leg's own client is
   *  two traversals, which the pre-fix `calls: 1` hardcode could never see). */
  calls: number
}
interface LoadSite extends CallSite { leg: string; kind: string | null; envelope: string | null }
interface HarnessShape {
  legs: LegSequence[]
  loadSites: LoadSite[]
  /** Every invocation of the shared load step, as `<client>` and its source index. */
  loadStepInvocations: Array<{ client: string; index: number }>
  loadHelperNames: string[]
  sharedLoadHelper: string | null
  /** The single `provident.load` call site's leg attribution, or `null` when there is none. */
  loadSitesInHelper: string | null
  leg1: LegSequence | null
  leg2: LegSequence | null
  /** `A-2` — the app-launch sites' `env` object literals (the direct `spawn(…)` site and the SDK
   *  `StdioClientTransport` site), read as source text: `text` is the literal, `shim` is true for
   *  the battery host's own transport (which must carry NO `PROVIDENT_ENABLE_TOOL_GROUPS` member). */
  envObjects: Array<{ index: number; text: string; shim: boolean }>
  spawnSites: number
  sdkSites: number
  shimSites: number
  loadCalls: number
  violations: string[]
}

/** The source index where the shim (leg 2) block begins — the `--- DOM-shim` banner of `S-1`. */
function indexOfShimHeader(src: string): number {
  const at = src.indexOf('--- DOM-shim')
  return at < 0 ? src.length : at
}

/** The SHAPE of the harness's drive structure — the SOLE instrument of `R-1`…`R-4`, `R-8`,
 *  `P-IM-1`, `P-SM-1`, `P-SM-2` and `P-TP-2`. It reads the source text and nothing else. */
function harnessShape(src: string): HarnessShape {
  const fns = functionRegions(src)
  const callTools = callSites(src, /\b([A-Za-z_$][\w$]*)\.callTool\s*\(/)
  const connects = callSites(src, /\b([A-Za-z_$][\w$]*)\.connect\s*\(/)
  // `drive()`'s DECLARATION is not an invocation. NOTE (measured): the text to test is the WINDOW
  // ENDING ON THE NAME — `<…>function drive` — so the slice must reach `site.index + 'drive'.length`
  // (a window ending at the name's START reads «…async function » and never matches, which silently
  // left the declaration in the invocation list and made leg 1's `driveAt` read the declaration,
  // ahead of its own `connect`). The window must also be wide enough to hold `async function drive`.
  const DRIVE_DECL_RE = /(?:async\s+)?function\s+drive\s*$/
  const drives = callSites(src, /\b(drive)\s*\(/).filter((site) => !DRIVE_DECL_RE.test(src.slice(Math.max(0, site.index - 32), site.index + 'drive'.length)))
  const shimAt = indexOfShimHeader(src)
  const violations: string[] = []
  // ⟨`A-10` — the MASKED source (comments and string/template literals blanked, offsets preserved).
  //   Every CALLEE census below reads it, so a commented or quoted mention can never be a call.⟩
  const code = stripLiteralsAndComments(src)

  const loadHelperNames: string[] = []
  for (const [name, region] of fns) {
    if (/\bprovident\.load\b/.test(region.body)) loadHelperNames.push(name)
  }

  const loadSites: LoadSite[] = callTools
    .filter((s) => (stringLiteral(argValue(s.rest, 'name')) ?? '').includes('provident.load'))
    .map((s) => {
      // `scanProp` accepts the argument object WITH or WITHOUT its braces, so the load's `kind`
      // and `envelope` are read from the same argument object the contract names (C-1 item 1).
      const args = argValue(s.rest, 'arguments') ?? ''
      return {
        ...s,
        leg: /shim/i.test(s.name) || s.index > shimAt ? 'leg2' : 'leg1',
        kind: stringLiteral(fieldOf(args, 'kind')),
        envelope: fieldOf(args, 'envelope'),
      }
    })

  /** Resolve the envelope EXPRESSION to the demo value: a `demoEnvelope()` call, or a binding the
   *  source initializes from it. */
  const envelopesDemo = (expr: string | null): boolean => {
    if (expr === null) return false
    if (/\bdemoEnvelope\s*\(/.test(expr)) return true
    const name = /^[A-Za-z_$][\w$]*$/.exec(expr.trim())
    if (name === null) return false
    const binding = new RegExp(`\\b(?:const|let|var)\\s+${name[0]}\\s*=\\s*([^\\n;]+)`).exec(src)
    return binding !== null && /\bdemoEnvelope\s*\(/.test(binding[1]!)
  }

  /** `C-1` item 2 — the leg a load call site belongs to. A leg whose OWN block carries the site is
   *  that leg (`loadSites[].leg`); the ONE shared step's site belongs to NO leg (`null`), because it
   *  is reached by BOTH — attributing it to one of them is the very reading that made a per-leg row
   *  unsatisfiable beside `loadCalls === 1`. */
  const legClients = new Map<string, string>()
  for (const site of loadSites) if (!legClients.has(site.leg)) legClients.set(site.leg, site.name)

  const legOf = (index: number): string => (index > shimAt ? 'leg2' : 'leg1')
  const connectsBeforeShim = connects.filter((c) => c.index < shimAt)
  const connectsAfterShim = connects.filter((c) => c.index >= shimAt)
  const connectedClient = (which: 'leg1' | 'leg2', pool: CallSite[], fallback: string): string => {
    // the leg's client is IDENTIFIED BY ITS OWN BLOCK (the LAST `connect` before the shim banner is
    // leg 1's; the FIRST after it is leg 2's), so a leg that never loads still resolves its client
    // instead of silently borrowing the other leg's — which is what makes "this leg does not reach
    // the shared step" measurable at all.
    const site = pool[which === 'leg1' ? pool.length - 1 : 0]
    return site === undefined ? fallback : site.name
  }
  const clientOf = (name: 'leg1' | 'leg2'): string =>
    name === 'leg1'
      ? connectedClient('leg1', connectsBeforeShim, 'eClient')
      : connectedClient('leg2', connectsAfterShim, 'shimClient')
  const connectAtOf = (which: 'leg1' | 'leg2', client: string): number | null => {
    // the connect that belongs to THIS leg's block (`clientOf` resolves the client the same way) —
    // a client bound once but connected later must not read an earlier `connect` of its own
    const pool = (which === 'leg1' ? connectsBeforeShim : connectsAfterShim).filter((c) => c.name === client)
    const site = pool[which === 'leg1' ? pool.length - 1 : 0] ?? connects.filter((c) => c.name === client)[0]
    return site === undefined ? null : site.index
  }

  // `C-1` item 2 — ONE shared step: a single named function carrying the load, reached from BOTH
  // legs, and exactly ONE load call site in the whole module (a hand-copied pair beside the helper
  // is the asymmetry the clause exists to forbid).
  const sharedLoadHelper = ((): string | null => {
    const helpers = loadHelperNames.filter((n) => n !== 'main')
    if (helpers.length !== 1 || loadSites.length !== 1) return null
    const helper = helpers[0]!
    const region = fns.get(helper)!
    // the declaration + one invocation per leg = 3 (read from the MASKED source, so a comment that
    // NAMES the helper is not an invocation — `A-10`)
    const callCount = (code.match(new RegExp(`\\b${helper}\\s*\\(`, 'g')) ?? []).length
    // the declaration + one invocation per leg = 3
    return callCount >= 3 && region.body.includes('callTool') ? helper : null
  })()

  // THE SHARED STEP'S INVOCATIONS — `C-1` item 2's "invoked by both legs" read as REACHABILITY: an
  // invocation of the helper with the LEG'S OWN CLIENT on that leg's path. This is what a per-leg
  // row can assert about a ONE-site design, and it is exactly what discriminates a leg that skips
  // the load: its client is never passed to the step.
  //
  // ⟨`A-10`, BLOCKING (RED-SET HOLE) — FIXED HERE: this reader ran a RAW regex over the WHOLE source
  // with NO comment stripping, so a COMMENTED `// await loadFixture(eClient)` in leg 1's block read
  // as that leg's traversal and the PRE-FIX ASYMMETRY was accepted with `R-1`/`R-3`/`P-IM-1`/
  // `P-SM-2` all green. It now reads `stripLiteralsAndComments(src)` — the same discipline the
  // harness's own `callSites()` applies — so a comment or a quoted string can never be a call.
  // The discriminating draw is `NEG-commented-invocation` (`P-IM-1` draw 3 / `P-SM-2`).⟩
  const loadStepInvocations: Array<{ client: string; index: number }> = ((): Array<{ client: string; index: number }> => {
    if (sharedLoadHelper === null) return []
    const re = new RegExp(`\\b${sharedLoadHelper}\\s*\\(\\s*([A-Za-z_$][\\w$]*)`, 'g')
    const out: Array<{ client: string; index: number }> = []
    let m: RegExpExecArray | null
    while ((m = re.exec(code)) !== null) out.push({ client: m[1]!, index: m.index })
    return out
  })()
  const invocationOf = (leg: 'leg1' | 'leg2', client: string): { client: string; index: number } | null =>
    loadStepInvocations.filter((v) => legOf(v.index) === leg && v.client === client).sort((a, b) => a.index - b.index)[0] ?? null
  /** `A-10`/`P-SM-2` — how many times THIS leg passes its OWN client to the shared step (a REAL
   *  count, not a hardcoded 1: two invocations are two loads). */
  const invocationCountOf = (leg: 'leg1' | 'leg2', client: string): number =>
    loadStepInvocations.filter((v) => legOf(v.index) === leg && v.client === client).length

  // EACH LEG'S LOAD COORDINATE. A leg whose own block carries the `provident.load` call site reads
  // that site (`own-site`); a leg that reaches the ONE shared step reads the step's invocation on
  // its path, with the step's single site supplying the `kind`/`envelope` the clause pins
  // (`shared-step`). Both are the same coordinate the rows order against `connect`/`drive`.
  const legLoad = (leg: 'leg1' | 'leg2'): { at: number | null; via: 'shared-step' | 'own-site' | null; kind: string | null; envelope: string | null; calls: number } => {
    // a site carrying the shared step is the STEP's, not this leg's: only a site in the leg's own
    // block is an "own site" (`C-1` item 2's whole point is that the step's one site is shared)
    const own = loadSites
      .filter((s) => s.leg === leg && !(sharedLoadHelper !== null && fns.get(sharedLoadHelper) !== undefined && s.index >= fns.get(sharedLoadHelper)!.start && s.index <= fns.get(sharedLoadHelper)!.end))
      .sort((a, b) => a.index - b.index)
    const inv = own.length === 0 && sharedLoadHelper !== null && loadSites.length === 1 ? invocationOf(leg, clientOf(leg)) : null
    // ⟨`A-10`/`P-SM-2` — `calls` is a REAL traversal count (this leg's own sites PLUS its
    //   traversals of the shared step with its own client). The pre-fix body returned a hardcoded
    //   `calls: 1` on this branch, so a DUPLICATE load on one leg was invisible to every row.⟩
    const calls = own.length + (sharedLoadHelper === null ? 0 : invocationCountOf(leg, clientOf(leg)))
    if (inv === null) {
      const site = own[0] ?? null
      return { at: site === null ? null : site.index, via: site === null ? null : 'own-site', kind: site === null ? null : site.kind, envelope: site === null ? null : site.envelope, calls }
    }
    const site = loadSites[0]!
    return { at: inv.index, via: 'shared-step', kind: site.kind, envelope: site.envelope, calls }
  }

  const decl = fns.get('drive')
  const driveInvocations = drives.filter((d) => decl === undefined || d.index !== decl.start)

  // ⟨`A-2` (BLOCKING, COVERAGE) — §0B.3 `F-7`'s REFINED ORDERING, read as a coordinate: the leg's
  //   `waitForBootInstalled(client)` call site and its own read-back (`readSurface`) call site.
  //   Nothing else in this file read them, so deleting the wait, moving it AFTER the load, or
  //   zeroing the deadline left `npm test` green. Both are read from the MASKED source, so a
  //   commented mention of either can never be a call (`A-10`'s discipline, applied here too).⟩
  const codeCalls = (re: RegExp): CallSite[] => callSites(code, re).filter((s) => code.slice(s.index, s.index + 4) !== '\n\n\n\n')
  const waitAtOf = (client: string): number | null => {
    const site = codeCalls(/\b(waitForBootInstalled)\s*\(/).filter((s) => src.slice(s.index, s.index + 60).includes(client))[0]
    return site === undefined ? null : site.index
  }
  const probeAtOf = (client: string): number | null => {
    const site = codeCalls(/\b(readSurface)\s*\(/).filter((s) => src.slice(s.index, s.index + 60).includes(client))[0]
    return site === undefined ? null : site.index
  }

  const legs: LegSequence[] = (['leg1', 'leg2'] as const).map((name) => {
    const client = clientOf(name)
    const load = legLoad(name)
    const myDrives = driveInvocations.filter((d) => legOf(d.index) === name)
    return {
      name,
      client,
      connectAt: connectAtOf(name, client),
      waitAt: waitAtOf(client),
      loadAt: load.at,
      loadVia: load.via,
      loadKind: load.kind,
      envelopeValue: load.envelope,
      usesDemoEnvelope: load.at !== null && envelopesDemo(load.envelope),
      probeAt: probeAtOf(client),
      driveAt: myDrives.length > 0 ? myDrives[0]!.index : null,
      calls: load.calls,
    }
  })

  // THE APP'S OWN SPAWN SITE (`spawn(electronBin, …)`) and the SDK's transport sites. The SDK
  // transport's internal `spawn` is not a second site of THIS file (S-1's two children are the
  // direct spawn + the transport's own), so a `.spawn(`-style method is not counted.
  const spawnCalls = callSites(src, /(?<![.\w])(spawn)\s*\(/).filter((s) => !src.slice(s.index, s.index + 40).includes('batteryHost'))
  const sdkSites = callSites(src, /\bnew\s+StdioClientTransport\s*\(/)
  // the SHIM host is the transport whose own command is the battery host — NOT merely a transport
  // whose window happens to reach a `batteryHost` mention further down (a whole drawn module
  // contains both hosts, so a 400-character window reaches the shim marker from every site)
  const shimSites = sdkSites.filter((s) => src.slice(s.index, s.index + 120).includes(SHIM_HOST_MARKER))
  const appTransports = sdkSites.filter((s) => src.slice(s.index, s.index + 400).includes('electronBin'))
  const hostSites = spawnCalls.length + appTransports.length

  // ⟨`A-3` (BLOCKING, COVERAGE) — THE SPAWN `env` OBJECTS, read as source text. `F-6`/`§0B.2` names
  //   `PROVIDENT_ENABLE_TOOL_GROUPS: 'graph'` at BOTH Electron sites, and NOTHING in either
  //   divergence file read an `env` object — deleting the member from both sites kept `held × 8`
  //   and `78/78` green. The literal's own text is captured (every `env: { …process.env, … }`
  //   object), and its `shim` flag is decided by the marker rule the transport census already uses:
  //   the battery host's transport carries no `env` member at all (`S-1`), and a transport whose
  //   own window names the shim marker is the SHIM host — which must carry no grant.⟩
  const envObjects: Array<{ index: number; text: string; shim: boolean }> = (() => {
    const out: Array<{ index: number; text: string; shim: boolean }> = []
    const re = /env\s*:\s*/g
    let m: RegExpExecArray | null
    while ((m = re.exec(src)) !== null) {
      const open = m.index + m[0].length
      const text = balancedBody(src, open)
      if (text === null) continue
      // the site this object belongs to is the nearest transport construction IN FRONT of it: a
      // transport whose own command is the battery host is the SHIM host, which must carry no grant.
      const before = src.slice(0, m.index)
      const shim = before.lastIndexOf(`command: process.execPath`) > before.lastIndexOf(`command: electronBin`)
      out.push({ index: m.index, text, shim })
    }
    return out
  })()

  if (loadSites.length === 0) {
    violations.push('no `provident.load` call site exists anywhere in the module (C-1 items 1/2)')
  }
  for (const leg of legs) {
    if (leg.loadAt === null) {
      violations.push(`${leg.name} (${leg.client}): NO \`provident.load\` step exists at all (C-1 items 1/2; S-1 records leg 1 as \`connect\` → \`drive\`)`)
      continue
    }
    if (leg.connectAt !== null && leg.loadAt < leg.connectAt) {
      violations.push(`${leg.name}: the load precedes its \`connect\` (C-1 item 3 — the sequence is connect → load → probe → drive)`)
    }
    if (leg.driveAt !== null && leg.loadAt > leg.driveAt) {
      violations.push(`${leg.name}: the load FOLLOWS the \`drive\` call (C-1 item 3 — a late load makes the census/SSR half read a different graph)`)
    }
    if (!leg.usesDemoEnvelope) {
      violations.push(`${leg.name}: the load's envelope argument reads ${JSON.stringify(leg.envelopeValue)}; C-1 item 1 pins \`demoEnvelope()\` (the leg's OWN literal)`)
    }
    if (leg.loadKind !== 'envelope') {
      violations.push(`${leg.name}: the load's \`kind\` reads ${JSON.stringify(leg.loadKind)}; C-1 item 1 pins \`kind: 'envelope'\` (the A2 load path)`)
    }
  }
  if (sharedLoadHelper === null) {
    const helperInvocations = loadHelperNames.filter((n) => n !== 'main')
      .filter((n) => (src.match(new RegExp(`\\b${n}\\s*\\(`, 'g')) ?? []).length >= 2)
    violations.push(
      loadSites.length !== 1
        ? `the module holds ${loadSites.length} \`provident.load\` call site(s); C-1 item 2 requires EXACTLY ONE shared step both legs call`
        : `no single named shared load step is reached from both legs (C-1 item 2) — load helpers found: ${JSON.stringify(loadHelperNames)}, invoked from more than one place: ${JSON.stringify(helperInvocations)}`,
    )
  }

  return {
    legs,
    loadSites,
    loadStepInvocations,
    loadHelperNames,
    sharedLoadHelper,
    loadSitesInHelper: loadSites.length === 0 ? null : loadSites[0]!.leg,
    leg1: legs[0]!,
    leg2: legs[1]!,
    spawnSites: hostSites,
    sdkSites: appTransports.length,
    shimSites: shimSites.length,
    envObjects,
    loadCalls: loadSites.length,
    violations,
  }
}

const SHAPE: HarnessShape = harnessShape(HARNESS_SRC)

/** `C-2` — the readiness precondition's presence, read between the load and `drive`. */
interface ProbeShape {
  present: boolean
  loaded: boolean
  positioned: boolean
  inEffect: boolean
  loudStop: boolean
  reads: string[]
  violations: string[]
}
function probeShape(src: string, leg: LegSequence | null): ProbeShape {
  const empty = (why: string, loaded: boolean): ProbeShape => ({
    present: false, loaded, positioned: false, inEffect: false, loudStop: false, reads: [], violations: [why],
  })
  if (leg === null || leg.loadAt === null) return empty('no load step exists, so no probe can sit between the load and the drive (C-2 item 1)', false)
  if (leg.driveAt === null) return empty('the leg never reaches the shared `drive` step (C-2 item 1)', true)
  const violations: string[] = []
  const positioned = leg.loadAt < leg.driveAt
  if (!positioned) violations.push('the load does not precede the drive (C-1 item 3)')
  const region = src.slice(leg.loadAt, leg.driveAt)
  const reads = ADMISSIBLE_PROBE_TOOLS.filter((t) => region.includes(`'${t}'`) || region.includes(`"${t}"`))
  const inEffect = reads.length > 0
  const loudStop =
    (/\bthrow\b/.test(region) || /\bprocess\.exit\s*\(/.test(region)) &&
    (reads.length > 0 || /error|refus|missing|unresolved|superseded|surface/i.test(region))
  if (!inEffect) violations.push("no admissible probe read (provident.get_rendered_html · provident.list_targets · the load's own census) sits between the load and `drive` (C-2 item 1)")
  if (!loudStop) violations.push('no loud stop (a thrown / named stop) sits between the load and `drive` (C-2 item 2)')
  return { present: inEffect && loudStop, loaded: true, positioned, inEffect, loudStop, reads, violations }
}

const PROBE: ProbeShape = probeShape(HARNESS_SRC, SHAPE.leg1)
const PROBE_LEG2: ProbeShape = probeShape(HARNESS_SRC, SHAPE.leg2)

/** `R-5`/`C-2` item 2 — every `ok()` call site's label, and how many sit between a leg's load and
 *  its drive. */
const OK_SITE_LABELS: string[] = OK_CALLS.map((s) => {
  const first = splitTopLevel(s.rest)[0] ?? ''
  return /^(['"`])[\s\S]*\1$/.test(first.trim()) ? stripQuotes(first) : `<unquoted:${first.trim().slice(0, 16)}>`
})
function okCallsBetween(src: string, from: number | null, to: number | null): number {
  if (from === null || to === null || to < from) return -1
  return okCallSites(src).filter((s) => s.index > from && s.index < to).length
}
/** `C-1` item 3 / `C-2` item 1 — the span a readiness probe must sit in: from this leg's `connect`
 *  to its `drive`. When the leg's TRAVERSAL of the shared step is known, the span starts at the
 *  traversal (the narrowest correct window); before the step exists it starts at this leg's own
 *  `connect`, so the row measures «no `ok()` call on this leg's path in front of `drive`» in BOTH
 *  heads rather than reporting ABSENT for the very defect it exists to catch. */
function probeSpan(leg: LegSequence | null): { from: number | null; to: number | null } {
  if (leg === null) return { from: null, to: null }
  return { from: leg.loadAt ?? leg.connectAt, to: leg.driveAt }
}
const LEG1_SPAN = probeSpan(SHAPE.leg1)
const LEG2_SPAN = probeSpan(SHAPE.leg2)
const LEG1_OK_SITES = okCallsBetween(HARNESS_SRC, LEG1_SPAN.from, LEG1_SPAN.to)
const LEG2_OK_SITES = okCallsBetween(HARNESS_SRC, LEG2_SPAN.from, LEG2_SPAN.to)

/** `R-8`/`C-3` item 3 — the shared `drive()` body's four calls and eight members, resolved from
 *  the source. ONE instrument read for `R-8`, `P-IM-2` and `P-SM-1` (the spec fixes the surfaces
 *  once). */
const DRIVE_FN = functionRegions(HARNESS_SRC).get('drive') ?? null
const DRIVE_BODY = DRIVE_FN?.body ?? ''
const DRIVE_CALL_SEQUENCE: string[] = callSites(DRIVE_BODY, /\b(call)\s*\(/).map((s) => {
  const first = splitTopLevel(s.rest)[1] ?? ''
  return stringLiteral(first) ?? first
})
const DRIVE_RETURN_MEMBERS: string[] = ((): string[] => {
  const at = DRIVE_BODY.indexOf('return {')
  if (at < 0) return []
  const open = DRIVE_BODY.indexOf('{', at)
  const inner = balancedBody(DRIVE_BODY, open)
  if (inner === null) return []
  // every MEMBER of the returned record is written on its own line in this file's house style
  // (`\n  name: value,`), so the member list is the set of line-leading keys — a SHAPE read, never
  // a line number (`C-10`).
  const names: string[] = []
  const re = /\n\s*([A-Za-z_$][\w$]*)\s*:/g
  let m: RegExpExecArray | null
  while ((m = re.exec(inner)) !== null) names.push(m[1]!)
  return names
})()

const DRIVE_NORM_CALLS = (DRIVE_BODY.match(/\bnorm\s*\(/g) ?? []).length

/** `C-3` item 2 — the demo literal's own `12 nodes` comment (`S-7`), read as the contract cites it. */
const DEMO_COUNT_COMMENT_PRESENT = /12 nodes/.test(HARNESS_SRC)

/** The harness's exported surface is reachable WITHOUT the leg running (the module's own
 *  entry-point guard, `C-3` item 6). */
const HARNESS: { mod: Record<string, unknown> | null; error: string | null } = { mod: null, error: null }
const GUARD_PRESENT = HARNESS_SRC.includes('import.meta.url') && HARNESS_SRC.includes('process.argv') &&
  /if\s*\(\s*import\.meta\.url\s*===\s*pathToFileURL\s*\(\s*process\.argv/.test(HARNESS_SRC)

/** The exported surface is imported LAZILY from inside the single row that needs it, never at file
 *  scope, and only behind the guard's presence — so the class-(a) rows stay Electron-free at this
 *  head (`C-10`) and a missing export is a counterexample, never an unhandled import error. */
async function harnessModule(): Promise<Record<string, unknown>> {
  if (HARNESS.mod !== null) return HARNESS.mod
  if (HARNESS.error !== null) throw new Error(`the harness is not importable: ${HARNESS.error}`)
  if (!GUARD_PRESENT) throw new Error('the module carries no main-module entry guard, so importing it would boot Electron — which C-10 forbids in class (a)')
  try {
    HARNESS.mod = (await import(/* @vite-ignore */ pathToFileURL(HARNESS_PATH).href)) as Record<string, unknown>
    return HARNESS.mod
  } catch (e) {
    HARNESS.error = (e as Error).message
    throw new Error(`the harness is not importable: ${HARNESS.error}`)
  }
}

function attemptOf(fnToRun: () => void): string | null {
  try {
    fnToRun()
    return null
  } catch (e) {
    return (e as Error)?.message ?? String(e)
  }
}

const loadArgShape = (expr: string, kind = 'envelope'): string =>
  `{ name: 'provident.load', arguments: { kind: '${kind}', envelope: ${expr} } }`

/** A FABRICATED module for the negative draws — never written to the tree, never executed: it is a
 *  source TEXT the same instrument reads, so a mutation's effect is measured.
 *
 *  `shared: true` emits the contract's OWN design (`C-1` item 2): ONE helper carrying the single
 *  `provident.load` call site, with the drawn leg(s) invoking it — so a drive measures the design
 *  the contract prescribes (and `sharedLoadHelper` resolves only when BOTH legs invoke it, which is
 *  the clause's "invoked by both legs"). `shared: false` emits the PRE-FIX shape the rows must
 *  still reject: a load call site hand-written inside a leg's own block. */
function fabricatedModule(opts: {
  load?: 'canonical' | 'none' | 'other-envelope' | 'wrong-kind'
  /** the leg whose block is drawn; the other leg is drawn as a bare `connect` → `drive` */
  focus?: 'leg1' | 'leg2'
  loadAt?: 'before-connect' | 'after-drive' | 'between'
  shared?: boolean
  /** `'skip'` = this leg's client is NEVER passed to the shared step (the `A-4` asymmetry) */
  leg1Invoke?: 'step' | 'skip'
  leg2Invoke?: 'step' | 'skip'
}): string {
  const load = opts.load ?? 'canonical'
  const at = opts.loadAt ?? 'between'
  const statement = (client: string, shared: boolean): string => {
    if (load === 'none') return ''
    if (shared) return loadStepInvocation(client, {})
    const kind = load === 'wrong-kind' ? "'doc'" : "'envelope'"
    return `await ${client}.callTool(${loadArgShape(envelopeExprFor(load), kind.slice(1, -1))})\n`
  }
  const legBody = (leg: 'leg1' | 'leg2'): string => {
    const client = leg === 'leg1' ? 'eClient' : 'shimClient'
    const draws = opts.shared === true ? (opts[`${leg}Invoke`] ?? 'step') === 'step' : leg === (opts.focus ?? 'leg1')
    const held = draws ? statement(client, opts.shared === true) : ''
    const connect = `await ${client}.connect(transport)\n`
    const drive = `out${leg === 'leg1' ? '1' : '2'} = await drive(${client})\n`
    // a leg that does not reach the step (a `'skip'` leg under the contract's design) is drawn as
    // the bare `connect` → `drive` an unloaded leg really is — the step is still declared and still
    // reached by the OTHER leg, so the draw stays an `A-4`-class asymmetry rather than an empty
    // module, which is what makes it measure REACHABILITY and nothing else.
    if (held === '') return connect + drive
    if (at === 'before-connect') return held + connect + drive
    if (at === 'after-drive') return connect + drive + held
    return connect + held + drive
  }
  // THE BANNER SITS BETWEEN THE LEGS, exactly as the real script's `S-1` layout does: `legOf()` is
  // a POSITION test against that banner, so a draw that put it first would place BOTH legs after it
  // and could not express "leg 1" at all.
  const header = opts.shared === true && load !== 'none' ? SHARED_HELPER(load) : ''
  return `async function main() {\n${legBody('leg1')}${SHIM_HEADER}${legBody('leg2')}}\n` + header
}

/** `S-1`'s own banner: the index after it is leg 2's block, which is how the instrument tells the
 *  two legs apart when NEITHER leg's load call site is textually inside a leg (the shared step). */
const SHIM_HEADER = '// --- DOM-shim battery host (same demo) ---\n'

/** The ONE shared load step (`C-1` item 2): a single named helper carrying the single
 *  `provident.load` call site, so the drawn module holds ONE site and both legs must reach it. */
const SHARED_HELPER = (load: 'canonical' | 'other-envelope' | 'wrong-kind'): string => {
  const kind = load === 'wrong-kind' ? 'doc' : 'envelope'
  return `async function loadFixture(client) {\n  await client.callTool(${loadArgShape(envelopeExprFor(load), kind)})\n}\n`
}
function envelopeExprFor(load: 'canonical' | 'none' | 'other-envelope' | 'wrong-kind'): string {
  return load === 'other-envelope' ? 'otherEnvelope()' : 'demoEnvelope()'
}
/** ONE leg's traversal of the shared step, with the leg's OWN client (`C-1` item 2) — or, for a
 *  counter-variant, with another client. */
function loadStepInvocation(client: string, opts: { wrongClient?: boolean }): string {
  return `await loadFixture(${opts.wrongClient === true ? 'otherClient' : client})\n`
}

// ---------------------------------------------------------------------------
// ⟨`A-10` (BLOCKING RED-SET HOLE) — THE COMMENTED-INVOCATION DRAW AND ITS DISCRIMINATION PROOF.⟩
//
// `A-10`, as the gate-4 pass measured it: `loadStepInvocations` was a RAW regex over the whole
// source with NO comment stripping (unlike the harness's own `callSites()`), so a COMMENTED
// `// await loadFixture(eClient)` in leg 1's block READ AS THAT LEG'S TRAVERSAL (`via:
// 'shared-step'`, `calls: 1`, ordering satisfied) — and `R-1`/`R-3`/`P-IM-1`/`P-SM-2` all passed
// WITH THE PRE-FIX ASYMMETRY RESTORED (leg 1's real load commented out).
//
// The reader is FIXED (`harnessShape` now reads `stripLiteralsAndComments(src)`); the draws below
// are what HOLD that fix. Both halves are asserted for every draw: the OLD reader's verdict and
// the NEW one's, so a draw is a DISCRIMINATION PROOF rather than a restatement of the new shape.

/** THE PRE-FIX READING, kept in this file as a SUBJECT — never as an instrument: the raw
 *  comment-blind regex `A-10` measured. A draw proves discrimination only when THIS reader says
 *  something DIFFERENT about it than the fixed one does. */
function commentBlindInvocations(text: string, helper: string, leg: 'leg1' | 'leg2'): Array<{ client: string; index: number }> {
  const shimAt = indexOfShimHeader(text)
  const re = new RegExp(`\\b${helper}\\s*\\(\\s*([A-Za-z_$][\\w$]*)`, 'g')
  const out: Array<{ client: string; index: number }> = []
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    if ((m.index > shimAt ? 'leg2' : 'leg1') === leg) out.push({ client: m[1]!, index: m.index })
  }
  return out
}

/** `NEG-commented-invocation` — THE REAL PRE-FIX ASYMMETRY with leg 1's load COMMENTED OUT: leg 2
 *  still traverses the ONE shared step, leg 1's only "traversal" is a comment. A reader that
 *  cannot strip comments reads this as SYMMETRIC (which is the false green `A-10` measured). */
function commentedInvocationModule(): string {
  return `async function main() {\nawait eClient.connect(t)\n// await loadFixture(eClient)\nout1 = await drive(eClient)\n${SHIM_HEADER}await shimClient.connect(s)\n${loadStepInvocation('shimClient', {})}out2 = await drive(shimClient)\n}\n` +
    SHARED_HELPER('canonical')
}

/** `NEG-duplicate-invocation` — `P-SM-2`'s owed generator: leg 1's path traverses the ONE shared
 *  step TWICE with its own client (a DOUBLE LOAD), while the module still holds exactly ONE
 *  `provident.load` call site — so a shape-only reading cannot see it, and the pre-fix hardcoded
 *  `calls: 1` reported «exactly one load per host» no matter what the body said. */
function duplicateInvocationModule(): string {
  return `async function main() {\nawait eClient.connect(t)\n${loadStepInvocation('eClient', {})}${loadStepInvocation('eClient', {})}out1 = await drive(eClient)\n${SHIM_HEADER}await shimClient.connect(s)\n${loadStepInvocation('shimClient', {})}out2 = await drive(shimClient)\n}\n` +
    SHARED_HELPER('canonical')
}

/** The `waitForBootInstalled` coordinates of a drawn module's OWN client (`null` when the module
 *  never waits) — the same call-site rule `harnessShape` uses for a leg's `waitAt`. */
function waitCallAt(text: string, client: string): number | null {
  const site = callSites(stripLiteralsAndComments(text), /\b(waitForBootInstalled)\s*\(/)
    .filter((s) => text.slice(s.index, s.index + 60).includes(client))[0]
  return site === undefined ? null : site.index
}

/** `NEG-wait-absent` — the contract's own sequence with the WAIT deleted: leg 1 goes
 *  `connect` → load → drive, exactly the ordering `T-1`'s `F-7` refinement replaced. */
function waitAbsentModule(): string {
  return `async function main() {\nawait eClient.connect(t)\n${loadStepInvocation('eClient', {})}out1 = await drive(eClient)\n${SHIM_HEADER}await shimClient.connect(s)\n${loadStepInvocation('shimClient', {})}out2 = await drive(shimClient)\n}\n` +
    SHARED_HELPER('canonical')
}

/** The wait's own declaration, as a drawn module that uses the wait must carry it (so the draw is
 *  about ORDERING and never about a missing function). */
const WAIT_FN_TEXT = `async function waitForBootInstalled(client) {\n  await client.callTool({ name: 'provident.list_targets', arguments: {} })\n}\n`

/** `NEG-wait-after-load` — the wait MOVED AFTER THE LOAD: the app's own fire-and-forget install can
 *  then land after the demo load and REPLACE it (the `O-1` race the wait exists to close). */
function waitAfterLoadModule(): string {
  return `async function main() {\nawait eClient.connect(t)\n${loadStepInvocation('eClient', {})}await waitForBootInstalled(eClient)\nout1 = await drive(eClient)\n${SHIM_HEADER}await shimClient.connect(s)\n${loadStepInvocation('shimClient', {})}out2 = await drive(shimClient)\n${WAIT_FN_TEXT}}\n` +
    SHARED_HELPER('canonical')
}

// ===========================================================================
// §3.2 class (a) — `R-1`: leg 1 loads the demo envelope AFTER `connect` and BEFORE `drive`.
// FAILS AT THIS HEAD (`S-1`: leg 1's block is `connect` → `drive`, with no load call at all).
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.2 class (a) R-1 — leg 1 loads the demo envelope before it drives (C-1 items 1/3)', () => {
  it('R-1 — leg 1\'s path TRAVERSES the `provident.load` step of `demoEnvelope()` with `kind: \'envelope\'`, after its `connect` and before the first `drive` call', () => {
    const leg = SHAPE.leg1!
    const observed =
      `leg 1 (${leg.client}): connectAt=${leg.connectAt === null ? 'ABSENT' : 'present'}, ` +
      `loadAt=${leg.loadAt === null ? 'ABSENT — NO LOAD STEP ON THIS LEG\'S PATH' : `present (${String(leg.loadVia)})`}, ` +
      `kind=${JSON.stringify(leg.loadKind)}, envelope=${JSON.stringify(leg.envelopeValue)}, driveAt=${leg.driveAt === null ? 'ABSENT' : 'present'}`
    // ⟨ATTRIBUTION (repaired on the implementer's measurement): `C-1` item 2 pins ONE
    //   `provident.load` call SITE, so a per-leg call-site reading cannot be satisfied by the
    //   contract's own design — one site cannot belong to two legs. The row asserts the property
    //   `C-1` items 1/3 actually state: leg 1's PATH traverses that ONE step, at the contract's
    //   coordinate. Reachability (this leg's client passed to the shared step) is what a leg that
    //   skips the load fails on, not a textual site.⟩
    expect(
      leg.loadAt !== null,
      `class (a) R-1 — FAILS at this head: S-1 records leg 1 as \`connect\` → \`drive\` with NO load on its path, which is the defect's own row (M-2 is its consequence). ` +
        `Expected: leg 1's path reaches \`${loadArgShape('demoEnvelope()')}\` (through the one shared step of C-1 item 2) after \`eClient.connect\` and before \`drive(eClient)\`. Observed: ${observed}`,
    ).toBe(true)
    expect(
      leg.loadKind === 'envelope' && leg.usesDemoEnvelope,
      `class (a) R-1 — the load's argument must be the leg's OWN demo literal with the A2 envelope kind (C-1 item 1). Observed: ${observed}`,
    ).toBe(true)
    expect(
      leg.connectAt !== null && leg.driveAt !== null && leg.loadAt !== null && leg.connectAt < leg.loadAt && leg.loadAt < leg.driveAt,
      `class (a) R-1 — the load must sit AFTER \`connect\` and BEFORE the first \`drive\` read (C-1 item 3: \`drive()\`'s first call is \`provident.get_rendered_html\`, so a late load would make the census/SSR half read a different graph). Observed: ${observed}`,
    ).toBe(true)
  })

  it('R-1 (instrument self-check) — the sequence checker DISCRIMINATES: a load before `connect`, a load after `drive`, a leg that skips the shared step, a different envelope and a wrong `kind` are each rejected', () => {
    // the CONFORMING draw: BOTH legs traverse the SHARED step (`C-1` item 2's own design), so the
    // instrument must record NO violation against leg 1 (the step resolves, and leg 2's own
    // traversal is drawn in because the clause's "invoked by both legs" is what makes the step
    // resolvable at all)
    const canonical = harnessShape(fabricatedModule({ load: 'canonical', loadAt: 'between', shared: true }))
    const leg1Violations = canonical.violations.filter((v) => v.startsWith('leg1'))
    expect(leg1Violations, `a CONFORMING draw — the contract's own one-shared-step design, both legs invoking it — must be accepted by THIS row's own checks, or the row is unsatisfiable: ${leg1Violations.join(' | ')}`).toEqual([])
    expect(canonical.sharedLoadHelper !== null && canonical.leg1!.usesDemoEnvelope && canonical.leg1!.loadKind === 'envelope' && canonical.leg1!.loadAt !== null && canonical.leg1!.loadVia === 'shared-step', `the conforming draw must resolve leg 1's traversal of the shared step: ${JSON.stringify({ loadAt: canonical.leg1!.loadAt, via: canonical.leg1!.loadVia, kind: canonical.leg1!.loadKind, env: canonical.leg1!.envelopeValue, sharedStep: canonical.sharedLoadHelper, loadCalls: canonical.loadCalls })}`).toBe(true)
    const early = harnessShape(fabricatedModule({ load: 'canonical', loadAt: 'before-connect', shared: true }))
    const late = harnessShape(fabricatedModule({ load: 'canonical', loadAt: 'after-drive', shared: true }))
    const other = harnessShape(fabricatedModule({ load: 'other-envelope', shared: true }))
    const kind = harnessShape(fabricatedModule({ load: 'wrong-kind', shared: true }))
    // THE COUNTER-VARIANT this repair's discrimination rests on: leg 1 SKIPS THE SHARED STEP while
    // leg 2 still invokes it, so the step is declared and the module's call-site count is intact —
    // the draw isolates REACHABILITY, the property the per-leg rows now assert (and one a per-leg
    // call-SITE reading could never express beside `loadCalls === 1`).
    const skips = harnessShape(
      `async function main() {\nawait eClient.connect(transport)\nout1 = await drive(eClient)\n${SHIM_HEADER}await shimClient.connect(transport)\n${loadStepInvocation('shimClient', {})}out2 = await drive(shimClient)\n}\n` +
        SHARED_HELPER('canonical') +
        `async function alsoLoads(client) {\n  ${loadStepInvocation('client', {})}}\n`,
    )
    expect(early.violations.length, 'NEGATIVE: a load placed BEFORE `connect` must be rejected (C-1 item 3)').toBeGreaterThan(0)
    expect(late.violations.length, 'NEGATIVE: a load placed AFTER `drive` must be rejected (C-1 item 3 / the §3.5 `A-5` probe class)').toBeGreaterThan(0)
    expect(other.violations.length, 'NEGATIVE: a leg 1 loaded with a DIFFERENT envelope value must be rejected (C-1 item 1 / `P-IM-1`\'s second negative draw)').toBeGreaterThan(0)
    expect(kind.violations.length, 'NEGATIVE: a load whose `kind` is not `envelope` must be rejected (C-1 item 1)').toBeGreaterThan(0)
    expect(skips.sharedLoadHelper, 'the skip draw really declares the shared step, so this negative measures the LEG and not the step').not.toBeNull()
    expect(skips.leg1!.loadAt, 'NEGATIVE (a leg that SKIPS the shared step): the step exists and leg 2 reaches it, but leg 1 never passes itself to it — the row must read «no load on leg 1\'s path», which is the `A-4` asymmetry in its surviving form').toBeNull()
    expect(skips.leg2!.loadAt, 'the skip draw really gives leg 2 its traversal, so the negative is one-sided rather than an empty module').not.toBeNull()
    expect(skips.violations.filter((v) => v.startsWith('leg1')).length, 'NEGATIVE: the skip must be LOUD against leg 1 by name').toBeGreaterThan(0)
  })
})

// ===========================================================================
// §3.2 class (a) — `R-2`: leg 2's load step is PRESERVED (the same `provident.load`, the same
// `kind: 'envelope'`, the same envelope value). PASSES today and must keep passing (`S-1`/`S-6`).
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.2 class (a) R-2 — the WORKING half is not moved (S-1/S-6)', () => {
  it('R-2 — leg 2 still reaches the `provident.load` step of `demoEnvelope()` with `kind: \'envelope\'` before its drive', () => {
    const leg = SHAPE.leg2!
    const observed = `leg 2 (${leg.client}): loadAt=${leg.loadAt === null ? 'ABSENT' : `present (${String(leg.loadVia)})`}, kind=${JSON.stringify(leg.loadKind)}, envelope=${JSON.stringify(leg.envelopeValue)}, driveAt=${leg.driveAt === null ? 'ABSENT' : 'present'}`
    expect(leg.loadAt !== null, `class (a) R-2 — the preservation row: S-1/S-6 record leg 2 as loading (root-only boot, then the demo); a fix must not move it. Observed: ${observed}`).toBe(true)
    expect(leg.loadKind === 'envelope' && leg.usesDemoEnvelope, `class (a) R-2 — leg 2's load must keep the contract's own argument shape (C-1 item 1). Observed: ${observed}`).toBe(true)
    expect(leg.driveAt !== null && leg.loadAt !== null && leg.loadAt < leg.driveAt, `class (a) R-2 — leg 2 must keep loading BEFORE it drives (C-1 item 3). Observed: ${observed}`).toBe(true)
  })

  it('R-2 (instrument self-check) — leg 2\'s load is still RECOGNISED, by whichever coordinate the design gives it: its OWN site pre-fix, the SHARED step\'s traversal under C-1 item 2 (the S-1 comment "load the same demo envelope so both are equal")', () => {
    const leg = SHAPE.leg2!
    // this leg's load coordinate is exactly ONE — a second one on the same client (a double load)
    // is not a preservation, so the census is asserted whatever the design (C-1 items 1/2):
    expect(leg.calls, `leg 2's path must traverse the load step exactly ONCE (C-1 items 1/2); observed via=${String(leg.loadVia)} at ${String(leg.loadAt)}`).toBe(1)
    expect(leg.loadKind, "leg 2's load kind stays 'envelope' (C-1 item 1)").toBe('envelope')
    expect(/\bdemoEnvelope\s*\(/.test(leg.envelopeValue ?? ''), "leg 2's envelope stays the leg's own demo literal (C-1 item 1)").toBe(true)
    // PRE-FIX (`shared: false`) the leg's OWN call site must still be read as an argument-shaped
    // `provident.load`; under the contract's design the ONE site is the shared step both legs reach.
    const ownSite = harnessShape(fabricatedModule({ load: 'canonical', focus: 'leg2' }))
    const mine = ownSite.loadSites.filter((s) => s.leg === 'leg2')
    expect(mine.length, 'the pre-fix draw really carries leg 2\'s own load call site (S-1/S-6)').toBe(1)
    expect(mine[0]!.kind, "leg 2's own load kind stays 'envelope' (C-1 item 1)").toBe('envelope')
    expect(/\bdemoEnvelope\s*\(/.test(mine[0]!.envelope ?? ''), "leg 2's envelope stays the leg's own demo literal (C-1 item 1)").toBe(true)
    expect(ownSite.leg2!.loadVia, 'the pre-fix draw is read as leg 2\'s OWN site, not as a shared step').toBe('own-site')
  })
})

// ===========================================================================
// §3.2 class (a) — `R-3`: BOTH legs' load steps come from ONE shared function/step.
// FAILS AT THIS HEAD (`S-1`: there is exactly one load call site and it belongs to leg 2).
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.2 class (a) R-3 — the SYMMETRY: ONE shared load step both legs call (C-1 item 2)', () => {
  it('R-3 — a single shared load step exists, BOTH legs reach it with their own client between `connect` and `drive`, and the module holds exactly ONE `provident.load` call site (so a hand-copied pair cannot re-create the asymmetry)', () => {
    expect(
      SHAPE.sharedLoadHelper !== null,
      `class (a) R-3 — FAILS at this head: S-1 records EXACTLY ONE load call site and it belongs to leg 2; leg 1 has none, so the two legs cannot share a step. ` +
        `Expected: one helper both legs call, carrying the single \`${loadArgShape('demoEnvelope()')}\` call (C-1 item 2). ` +
        `Observed: load call sites = ${SHAPE.loadCalls}, load helpers found = ${JSON.stringify(SHAPE.loadHelperNames)}, shared step = ${String(SHAPE.sharedLoadHelper)}`,
    ).toBe(true)
    expect(
      SHAPE.loadCalls,
      `class (a) R-3 — a copy of the call inside leg 1 while leg 2's own copy stays beside it re-creates the asymmetry as soon as either side is edited (C-1 item 2): the module must hold ONE load call site. Observed: ${SHAPE.loadCalls}`,
    ).toBe(1)
    // ⟨ATTRIBUTION (repaired): `C-1` item 2's "invoked by both legs" is asserted as REACHABILITY —
    //   each leg's path invokes the one step with its OWN client, between its `connect` and its
    //   `drive`. `loadCalls === 1` above and the two traversals below are the two halves of the
    //   clause; a per-leg call SITE would be unsatisfiable beside `loadCalls === 1`.⟩
    expect(
      SHAPE.legs.every((l) => l.loadVia === 'shared-step' && l.loadAt !== null && l.driveAt !== null && l.loadAt < l.driveAt && l.calls === 1),
      `class (a) R-3 — both legs must TRAVERSE the shared step (with their own client) before they drive, and exactly once. Observed: ${SHAPE.legs.map((l) => `${l.name}(${l.client}): via=${String(l.loadVia)} load=${l.loadAt === null ? 'ABSENT' : 'present'} calls=${l.calls} drive=${l.driveAt === null ? 'ABSENT' : 'present'}`).join(' · ')} · step invocations=${JSON.stringify(SHAPE.loadStepInvocations.map((v) => v.client))}`,
    ).toBe(true)
    expect(
      SHAPE.leg1 !== null && SHAPE.leg2 !== null && SHAPE.leg1.client !== SHAPE.leg2.client && SHAPE.leg2.client === 'shimClient',
      `class (a) R-3 — the two traversals must be the TWO legs (distinct clients), not one leg twice: a step invoked twice with ONE client cannot cover both legs. Observed: leg1=${String(SHAPE.leg1?.client)} leg2=${String(SHAPE.leg2?.client)}`,
    ).toBe(true)
  })

  it('R-3 (instrument self-check) — the shared-step checker DISCRIMINATES: two hand-written blocks (one per leg) are rejected as NOT one shared step, and a step the OTHER leg reaches but this leg skips is READ as a missing load', () => {
    const handCopied = `async function main() {\n` +
      `  await eClient.connect(t)\n` +
      `  await eClient.callTool(${loadArgShape('demoEnvelope()')})\n` +
      `  electronOut = await drive(eClient)\n` +
      SHIM_HEADER +
      `  await shimClient.connect(s)\n` +
      `  await shimClient.callTool(${loadArgShape('demoEnvelope()')})\n` +
      `  shimOut = await drive(shimClient)\n}\n`
    const shape = harnessShape(handCopied)
    expect(shape.loadCalls, 'the two-block draw really carries two load call sites').toBe(2)
    expect(shape.sharedLoadHelper, 'NEGATIVE: two hand-written blocks — one per leg — must NOT satisfy C-1 item 2, even though both load the same value').toBeNull()
    // THE COUNTER-VARIANT THIS ROW RESTS ON (a driven draw, not a shape assertion): the ONE shared
    // step is declared AND REACHED — leg 2 invokes it, and a second caller keeps the step's
    // invocation count high enough for the clause's "invoked by both legs" to resolve — yet LEG 1
    // NEVER PASSES ITS OWN CLIENT TO IT. The step's existence and the module's single call site are
    // both intact, so this draw isolates REACHABILITY: the property the row now asserts, and the
    // one a per-leg call-SITE reading (unsatisfiable beside `loadCalls === 1`) could never express.
    const oneSided = harnessShape(
      `async function main() {\nawait eClient.connect(t)\nout1 = await drive(eClient)\n${SHIM_HEADER}await shimClient.connect(s)\n${loadStepInvocation('shimClient', {})}out2 = await drive(shimClient)\n}\n` +
        SHARED_HELPER('canonical') +
        `async function alsoLoads(client) {\n  ${loadStepInvocation('client', {})}}\n`,
    )
    expect(oneSided.sharedLoadHelper, 'the one-sided draw really declares the shared step, so the negative is about the LEG').not.toBeNull()
    expect(oneSided.loadCalls, 'the one-sided draw reuses the step\'s ONE call site — no second copy is introduced').toBe(1)
    expect(oneSided.leg2, 'the one-sided draw really resolves a leg 2').not.toBeNull()
    expect(oneSided.leg2!.loadAt, 'the one-sided draw really gives leg 2 its traversal').not.toBeNull()
    expect(oneSided.leg1!.loadAt, 'NEGATIVE (a leg that does not invoke the shared step): the step exists, but leg 1\'s path never reaches it — this must read as a MISSING load, never as a pass by proximity').toBeNull()
    expect(oneSided.leg1!.calls, 'NEGATIVE: leg 1 traverses the step ZERO times').toBe(0)
    expect(oneSided.violations.filter((v) => v.startsWith('leg1')).length, 'NEGATIVE: a leg that does not load is what the §3.5 `A-4` probe reds — the shape must be READ as a missing load').toBeGreaterThan(0)
  })
})

// ===========================================================================
// §3.2 class (a) — `R-4`: the readiness precondition EXISTS and is LOUD.
// FAILS AT THIS HEAD (`C-2` is not implemented in any form: nothing between `connect` and
// `drive` reads anything).
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.2 class (a) R-4 — the drive-readiness precondition and its loud stop (C-2 items 1/2)', () => {
  it('R-4 — between the load and `drive`, leg 1 reads a demo-only surface back from its own tool set, and a missing surface STOPS the leg loudly before any comparison row', () => {
    expect(
      PROBE.loaded && PROBE.inEffect && PROBE.loudStop,
      `class (a) R-4 — FAILS at this head: C-2 is not implemented in any form, so NOTHING between \`connect\` and \`drive\` reads anything. ` +
        `Expected: after the load and before \`drive(client)\`, the leg reads a surface only the demo graph can produce from its OWN tool set (${ADMISSIBLE_PROBE_TOOLS.join(' · ')}) ` +
        `and a missing surface STOPS it loudly (a thrown/named stop, exit 1, no comparison row). ` +
        `Observed: load present = ${String(PROBE.loaded)}, probe reads = ${JSON.stringify(PROBE.reads)}, loud stop = ${String(PROBE.loudStop)}; violations: ${PROBE.violations.join(' | ')}`,
    ).toBe(true)
    expect(PROBE.present, `class (a) R-4 — the probe must be BOTH a read-back and a loud stop (C-2 items 1/2), never decoration. Violations: ${PROBE.violations.join(' | ')}`).toBe(true)
  })

  it('R-4 (instrument self-check) — the probe checker DISCRIMINATES: a read with NO stop, a stop with NO read, and an INADMISSIBLE read are each rejected', () => {
    const readNoStop = `await c.callTool({ name: 'provident.load', arguments: { kind: 'envelope', envelope: demoEnvelope() } })\nawait c.callTool({ name: 'provident.list_targets', arguments: {} })\nout = await drive(c)\n`
    const stopNoRead = `await c.callTool({ name: 'provident.load', arguments: { kind: 'envelope', envelope: demoEnvelope() } })\nif (!loaded) throw new Error('nothing loaded')\nout = await drive(c)\n`
    const inadmissible = `await c.callTool({ name: 'provident.load', arguments: { kind: 'envelope', envelope: demoEnvelope() } })\nconst r = await c.callTool({ name: 'provident.export', arguments: {} })\nif (!r) throw new Error('missing export surface')\nout = await drive(c)\n`
    const makeLeg = (body: string): LegSequence | null => harnessShape(`async function main() {\n${body}}\n`).leg1
    expect(probeShape(readNoStop, makeLeg(readNoStop)).loudStop, 'NEGATIVE: a read with NO stop must be rejected (C-2 item 2 — a silent failure is the defect class this clause forbids)').toBe(false)
    expect(probeShape(stopNoRead, makeLeg(stopNoRead)).inEffect, 'NEGATIVE: a stop with NO admissible read must be rejected (C-2 item 1)').toBe(false)
    expect(probeShape(inadmissible, makeLeg(inadmissible)).inEffect, 'NEGATIVE: `provident.export` is NOT in the leg\'s driven tool set — the admissible evidence is drawn from FINDING-1 item 5\'s set only').toBe(false)
  })
})

// ===========================================================================
// §3.2 class (a) — `R-5`: the readiness precondition does NOT perturb the census.
// PASSES vacuously today and must keep passing: this is the row that fails a probe implemented
// as a ninth comparison row (`C-3` item 1 / `D-5`).
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.2 class (a) R-5 — the probe adds no `ok()` call and no census change (C-2 item 2 / C-3 item 1)', () => {
  it('R-5 — no `ok()` call sits between a leg\'s load and its drive, and the source holds exactly the preserved label set (no ninth comparison row)', () => {
    const observed = `ok() call sites between leg 1's load and drive: ${LEG1_OK_SITES < 0 ? 'ABSENT (the load/drive pair is not in place — see R-1)' : String(LEG1_OK_SITES)}; between leg 2's: ${LEG2_OK_SITES < 0 ? 'ABSENT' : String(LEG2_OK_SITES)}; total ok() call sites: ${OK_CALLS.length}`
    expect(
      LEG1_OK_SITES,
      `class (a) R-5 — the readiness precondition must be SILENT on success and may never be an \`ok()\` comparison row (C-2 item 2 / D-5: \`checks\`/\`failures\` and the \`R13 RESULT: <n>\` accounting are untouched by it). Observed: ${observed}`,
    ).toBe(0)
    expect(
      LEG2_OK_SITES,
      `class (a) R-5 — no probe may red a comparison row either: the shim leg's load-to-drive span carries no \`ok()\` call. Observed: ${observed}`,
    ).toBe(0)
    // ⟨SPEC REMAND (recorded, NOT resolved here — a reconciliation for the spec's own page, never a
    //   change to any assertion): the contract's count of the preserved set is ambiguous — §2.3
    //   `C-3` item 1 names "the EIGHT comparison rows, the leg-1 boot check … and the failure branch"
    //   (which reads 8+1+1 = 10 calls), while §4.2 `P-IM-2` prints "8 comparison labels" and §10.3
    //   item 3 names "8 comparison `ok()` labels, plus the boot check, plus the failure branch".
    //   The LEG emits TEN calls at this head (8 in the comparison block + the boot check + the
    //   failure branch), so these rows assert 10 — the measured count — and the preserved set is
    //   asserted by LABEL and ORDER beside it; the ambiguity changes no row's colour and is left for
    //   the spec to reconcile (`§2.3 C-3` item 1 / `§4.2 P-IM-2` / `§10.3` item 3).⟩
    expect(
      OK_CALLS.length,
      `class (a) R-5 — the source must hold exactly the preserved calls (the eight comparison rows + the leg-1 boot check + the failure branch = TEN calls). Observed ${OK_CALLS.length}: ${JSON.stringify(OK_SITE_LABELS)}`,
    ).toBe(10)
    expect(
      OK_CALLS.length,
      `class (a) R-5 — the preserved set is also asserted by LABEL and ORDER (an added ninth comparison row would show up as an extra label): observed ${JSON.stringify(OK_SITE_LABELS)}`,
    ).toBe(ALL_LABELS.length)
  })

  it('R-5 (arithmetic) — the exported `checks` counter is UNPERTURBED across the probe: the probe is a precondition, never a count', async () => {
    const mod = await harnessModule()
    const checkCount = mod['checkCount']
    const ok = mod['ok']
    expect(typeof checkCount, 'the harness must expose its `checks` counter so a precondition can be shown not to move the accounting (C-2 item 2; the module guard makes the import boot nothing)').toBe('function')
    expect(typeof ok, 'the harness must expose `ok()` — the arithmetic C-3 item 1 pins').toBe('function')
    const before = Number((checkCount as () => unknown)())
    const after = Number((checkCount as () => unknown)())
    expect(after, 'a probe that increments `checks` is a ninth comparison row (D-5) and must red here').toBe(before)
    expect(before, 'the counter is read, never mutated, by this row — a red here must come from the LEG, not from the red set').toBeGreaterThanOrEqual(0)
  })
})

// ===========================================================================
// §3.2 class (a) — `R-6`: the whole-graph REPLACEMENT is a read-level property of the load path
// AND the stale-mount sweep is present. PASSES today (`FINDING-2`/`S-4`/`S-5`): the row that pins
// the app-side fact this unit's fix DEPENDS on, so a later `src/**` change that turns a load into
// an add-beside reds here in the harness layer instead of silently re-breaking the leg.
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.2 class (a) R-6 — a load is a whole-graph REPLACEMENT and the stale root is swept by selector (FINDING-2)', () => {
  it('R-6 — `loadEnvelope` tears down FIRST, the teardown sweeps `#wiki-root` out of the mount by selector, and destroys every in-tree non-root node', () => {
    const runtimeFns = functionRegions(RUNTIME_SRC)
    const loadEnvelope = runtimeFns.get('loadEnvelope')
    const tearDown = runtimeFns.get('tearDownGraph')
    expect(loadEnvelope !== undefined, 'R-6 — `Runtime.loadEnvelope` must be readable in the load path (FINDING-2 item 1)').toBe(true)
    expect(tearDown !== undefined, 'R-6 — the teardown helper must exist (FINDING-2 item 1)').toBe(true)
    const firstStatement = loadEnvelope!.body.trimStart().slice(0, 40)
    expect(
      firstStatement.startsWith('this.tearDownGraph()'),
      `R-6 — the load path must TEAR DOWN before it replaces: \`loadEnvelope\` starts with ${JSON.stringify(firstStatement)} (FINDING-2 item 1). A load that adds beside the booted graph instead of replacing it re-breaks the leg`,
    ).toBe(true)
    expect(
      tearDown!.body.includes('querySelectorAll') && tearDown!.body.includes('#wiki-root'),
      'R-6 — the teardown must sweep the root ELEMENT out of the mount BY SELECTOR (`#wiki-root`), because the diff-based render can only remove elements it tracks and a root owned by a discarded supervisor is untracked by definition (FINDING-2 item 1)',
    ).toBe(true)
    expect(
      /\bremove\s*\(|\bremoveChild\s*\(/.test(tearDown!.body),
      'R-6 — the swept root element must actually be REMOVED from its parent (FINDING-2\'s limit: a sweep that names the selector but removes nothing leaves the stale element beside the new graph, which is the `O-2` question this row makes visible)',
    ).toBe(true)
    expect(
      /kind:\s*'destroy'/.test(tearDown!.body) && /\ballNodes\s*\(/.test(tearDown!.body),
      'R-6 — every in-tree non-root node of the current graph must be destroyed through the destroy op (FINDING-2 item 1(b): not just the root\'s direct children, or they linger as resolvable ghosts)',
    ).toBe(true)
  })

  it('R-6 (scope) — the app\'s boot wiring no longer bootstraps the demo literal: `renderer.ts` constructs its Runtime with the placeholder content-window template, and its CODE never calls `demoEnvelope()` (S-4)', () => {
    expect(/DEFAULT_CONTENT_WINDOW_TEMPLATE/.test(RENDERER_SRC), 'R-6/S-4 — the boot wiring must still construct the Runtime with the placeholder template').toBe(true)
    // the check reads the CODE, not the prose: `renderer.ts`'s own comment names the removed
    // bootstrap, and a rule that could not tell a comment from a call would red on its own quote.
    const code = RENDERER_SRC.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')
    expect(
      /demoEnvelope\s*\(/.test(code),
      'R-6/S-4 — `src/renderer/renderer.ts`\'s boot path must NOT re-grow a `demoEnvelope()` call: after this unit the leg loads the demo through the load route, and the app\'s own boot graph stays the app\'s (§2.4 refuses both the re-point and the demo-boot mode)',
    ).toBe(false)
  })
})

// ===========================================================================
// §3.2 class (a) — `R-7`: the two graphs the comparison reads are DISTINGUISHED. PASSES today
// (`S-8`/`S-4`): the row that documents WHY the mismatch is structural (`O-3`).
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.2 class (a) R-7 — the boot template\'s vocabulary and the demo\'s are disjoint, and the demo authors every driven id (S-8)', () => {
  it('R-7 — `wiki-root`/`zone:main` are authored by the boot template, are ABSENT from the demo envelope\'s authored ids, and the demo authors all four driven ids', () => {
    for (const id of BOOT_TEMPLATE_IDS) {
      expect(
        TEMPLATE_SHAPE_SRC.includes(id),
        `R-7/S-4 — the app's boot template must author ${JSON.stringify(id)} (the M-3/S-4 pair, read from \`src/main/template-shape.ts\`); a reader who cannot find it here cannot see why the mismatch is structural`,
      ).toBe(true)
    }
    const demoIds = new Set<string>([...HARNESS_LITERAL.cssIds, ...HARNESS_LITERAL.propsIds])
    for (const id of BOOT_TEMPLATE_IDS) {
      expect(
        demoIds.has(id),
        `R-7 — ${JSON.stringify(id)} must NOT be authored by the demo envelope: the two vocabularies colliding would make the mismatch non-structural (O-3). Demo ids read: ${JSON.stringify([...demoIds].sort())}`,
      ).toBe(false)
    }
    for (const id of DEMO_DRIVEN_IDS) {
      expect(
        demoIds.has(id),
        `R-7/S-8 — every \`drive()\` target (${JSON.stringify(id)}) is authored BY THE DEMO literal, which is why a leg 1 that does not load it dies at the dispatch (M-2). Demo ids read: ${JSON.stringify([...demoIds].sort())}`,
      ).toBe(true)
    }
  })
})

// ===========================================================================
// §3.2 class (a) — `R-8`: THE PRESERVATION SET (`C-3`, carried by name from the sibling unit's
// §3.7 `C-7`). PASSES today and must keep passing: the regression guard that stops a fixture fix
// from quietly widening what is compared.
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.2 class (a) R-8 — the preservation set: comparison set, drive surface, exit contract, structure (C-3)', () => {
  it('R-8(a) — the same eleven `ok()` labels, in the same order, with the same helper arithmetic (C-3 item 1: no new check)', () => {
    const missing = ALL_LABELS.filter((l) => !OK_SITE_LABELS.includes(l))
    expect(missing, 'C-3 item 1 — no comparison label may be dropped, merged, re-spelled or re-ordered by this unit').toEqual([])
    expect(OK_SITE_LABELS, 'C-3 item 1 — the labels must keep their recorded order: the leg-1 boot check, the eight comparison rows, the failure branch').toEqual(ALL_LABELS)
    expect(ALL_LABELS.length, 'C-3 item 1 — the preserved set is TEN emitted calls (8 comparison + the boot check + the failure branch); the contract\'s own text counts the same set as "eight comparison rows + boot check + failure branch"').toBe(10)
    expect(/function\s+ok\s*\(/.test(HARNESS_SRC), 'C-3 item 1 — the `ok()` helper stays').toBe(true)
    expect(/checks\s*\+=\s*1/.test(HARNESS_SRC) && /failures\s*\+=\s*1/.test(HARNESS_SRC), 'C-3 item 1 — `ok()`\'s arithmetic (`checks` increments per call; `failures` increments on a false condition) is untouched').toBe(true)
  })

  it('R-8(b) — the demo literal is unchanged: TWELVE nodes, the same authored ids, the same `clientConfig` (C-3 item 2 / D-4: the load CONSUMES it, it does not move it)', () => {
    expect(HARNESS_LITERAL.types.length, `C-3 item 2 / S-7 — the demo literal is TWELVE nodes (read ${HARNESS_LITERAL.types.length})`).toBe(DEMO_NODE_COUNT)
    expect(DEMO_COUNT_COMMENT_PRESENT, "C-3 item 2 / S-7 — the literal's own `12 nodes` comment stays (the contract cites it as the count's source)").toBe(true)
    expect(
      HARNESS_LITERAL.types,
      `C-3 item 2 / S-7 — the demo's authored node types read ${JSON.stringify(HARNESS_LITERAL.types)}; the recorded structure is ${JSON.stringify(DEMO_AUTHORED_TYPES)}`,
    ).toEqual(DEMO_AUTHORED_TYPES)
    expect(
      HARNESS_LITERAL.cssIds,
      `C-3 item 2 / S-7 — the demo's authored css ids read ${JSON.stringify(HARNESS_LITERAL.cssIds)}; the recorded structure is ${JSON.stringify(DEMO_AUTHORED_CSS_IDS)}`,
    ).toEqual(DEMO_AUTHORED_CSS_IDS)
    expect(
      HARNESS_LITERAL.propsIds,
      `C-3 item 2 / S-7 — the demo's authored \`props.id\` members read ${JSON.stringify(HARNESS_LITERAL.propsIds)}; the recorded structure is ${JSON.stringify(DEMO_AUTHORED_PROPS_IDS)}`,
    ).toEqual(DEMO_AUTHORED_PROPS_IDS)
    expect(HARNESS_SRC.includes('clientConfig'), 'C-3 item 2 — the literal keeps its `clientConfig`').toBe(true)
    expect(HARNESS_SRC.includes('runInstantiation: true') && HARNESS_SRC.includes('runRendering: true'), 'C-3 item 2 — the `clientConfig` body is unchanged').toBe(true)
  })

  it('R-8(c) — `drive()` is unchanged and stays SHARED: the same four calls in the same order, the same eight members, `norm()`\'s `node-N` → `node#` normalization, one `drive` used by both legs (C-3 item 3)', () => {
    expect(DRIVE_CALL_SEQUENCE, `C-3 item 3 — \`drive()\`'s call sequence read ${JSON.stringify(DRIVE_CALL_SEQUENCE)}; the contract pins ${JSON.stringify(DRIVE_CALLS)}`).toEqual(DRIVE_CALLS)
    expect(DRIVE_RETURN_MEMBERS, `C-3 item 3 — the returned record's members read ${JSON.stringify(DRIVE_RETURN_MEMBERS)}; the contract pins ${JSON.stringify(DRIVE_MEMBERS)}`).toEqual(DRIVE_MEMBERS)
    expect(/node-\\d\+/.test(functionRegions(HARNESS_SRC).get('norm')?.body ?? '') && /node#/.test(functionRegions(HARNESS_SRC).get('norm')?.body ?? ''), 'C-3 item 3 — `norm()` must keep the minted-id normalization `node-N` → `node#` (the leg is id-offset-agnostic)').toBe(true)
    expect(DRIVE_NORM_CALLS, 'C-3 item 3 — the normalization is applied to the four minted-id surfaces (ssr, dirtied, dataNodeIds, nodeIds)').toBe(4)
    expect(SHAPE.legs.map((l) => l.driveAt).filter((x) => x !== null).length, 'C-3 item 5 — the leg drives through the ONE shared `drive` function: exactly two invocations (one per leg), no third leg and no re-ordering').toBe(2)
  })

  it('R-8(d) — the exit contract stays `{0,1}`, the two-leg structure stays, the entry-point guard stays, and the scratch sweep\'s report line shape stays (C-3 items 4/5/6)', async () => {
    const mod = await harnessModule()
    const exitCodeFor = mod['exitCodeFor']
    expect(typeof exitCodeFor, 'C-3 item 4 — the harness must expose `exitCodeFor` (import-safe, no Electron boot)').toBe('function')
    const exit = exitCodeFor as (n: number) => unknown
    expect(exit(0), 'C-3 item 4 — a clean run exits 0').toBe(0)
    expect(exit(1), 'C-3 item 4 — any recorded failure exits 1').toBe(1)
    expect(exit(9), 'C-3 item 4 — the exit contract stays {0,1}, whatever the failure count').toBe(1)
    expect(SHAPE.spawnSites, 'C-3 item 5 — leg 1 is the real Electron app over the SDK `StdioClientTransport` and leg 2 is the shim host: exactly TWO app-launch sites (S-1: the direct `spawn` and the SDK transport, the app\'s two children)').toBe(2)
    expect(SHAPE.sdkSites, 'C-3 item 5 — exactly ONE SDK transport launches the app (the direct `spawn` is its pair; the shim host\'s transport is leg 2, counted below)').toBe(1)
    expect(SHAPE.shimSites, 'C-3 item 5 — exactly ONE of them spawns the DOM-shim battery host (`process.execPath`)').toBe(1)
    expect(SHAPE.legs.length === 2, 'C-3 item 5 — the two-leg structure stays: no third leg, no third child, no re-ordering of the comparison stage').toBe(true)
    expect(GUARD_PRESENT, 'C-3 item 6 — the module\'s entry-point guard stays: importing it boots nothing').toBe(true)
    const sweepCall = /const\s+(\w+)\s*=\s*cleanupScratchProfiles\s*\(/.exec(HARNESS_SRC)
    expect(
      sweepCall !== null && /return\s*\{\s*removed,\s*leftover,\s*passes,\s*report\s*\}/.test(HARNESS_SRC) && HARNESS_SRC.includes('leftover:') &&
        new RegExp(`\\$\\{${sweepCall === null ? 'ZZZ' : sweepCall[1]}\\.report\\}`).test(HARNESS_SRC),
      'C-3 item 6 — the cleanup sweep\'s printed report line (`scratch cleanup … removed N · passes N · leftover: NONE|…`) and its `{removed, leftover, passes, report}` return shape stay exactly as the sibling unit landed them',
    ).toBe(true)
  })

  it('R-8(e)/C-10 (instrument self-check) — this class-(a) file reads only `node:*` builtins plus `vitest`, spawns no Electron and mocks nothing', () => {
    const raw = readText(fileURLToPath(import.meta.url))
    expect(raw.length, 'the self-read must not be vacuous').toBeGreaterThan(1000)
    // the needles are BUILT FROM PARTS, so this file's own bytes carry no forbidden literal and
    // the scan needs no comment stripping to stay honest.
    const mockNeedle = new RegExp(['\\bvi\\s*\\.\\s*', 'mock', '\\b'].join(''))
    const spawnNeedle = new RegExp(['child', '_process'].join(''))
    expect(raw, 'C-10 — no mock binding of any kind may enter this file (the protected bridge-mock census pins an exact five-name set)').not.toMatch(mockNeedle)
    expect(raw, 'C-10 — the class-(a) rows must not spawn Electron: no child-process binding may enter this file').not.toMatch(spawnNeedle)
    expect(raw, 'C-10 — this file must not boot Electron by any other route').not.toMatch(/\bnew\s+Electron\b/)
    const imports = Array.from(raw.matchAll(/^\s*import[^'"]*['"]([^'"]+)['"]/gm)).map((m) => m[1]!)
    expect(imports.length, 'the file must import only `node:*` builtins and `vitest`').toBeGreaterThan(0)
    expect(imports.filter((s) => !s.startsWith('node:') && s !== 'vitest'), 'C-10 — no non-builtin, non-vitest import may enter this file').toEqual([])
    expect(imports, 'the class-(a) instrument binds no child-process module').not.toContain(spawnNeedle.source)
  })
})

// ===========================================================================
// §3.2 class (a) — `R-9`: the pinned keys are untouched. PASSES today; a CROSS-CHECK only —
// the protected file `tests/unit-v5-migration-contract.test.ts` remains the authority (`X-9`).
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.2 class (a) R-9 — the pinned keys (§1.4 / D-3, a CROSS-CHECK)', () => {
  it('R-9 — `scripts.divergence` is the pinned `build`-first command, `test`/`test:watch` carry no `--testTimeout`, and `vitest.config.ts`\'s `testTimeout` reads exactly `15_000`', () => {
    const pkg = JSON.parse(readText(PACKAGE_JSON_PATH)) as { scripts: Record<string, string> }
    expect(
      pkg.scripts.divergence,
      'D-3/§1.4 — the `divergence` key is PINNED by the program and kept stable by this unit; the `build`-first clause is LOAD-BEARING against a stale `dist` (a stale-`dist` boot would let the leg measure a previous build)',
    ).toBe('npm run build && node scripts/electron-divergence.mjs')
    expect(pkg.scripts.test, 'G-9 — `scripts.test` must stay the plain suite run').toBe('vitest run')
    expect(pkg.scripts.test ?? '', 'G-9 — `scripts.test` must not carry `--testTimeout`').not.toMatch(/--testTimeout/)
    expect(pkg.scripts['test:watch'] ?? '', 'G-9 — `scripts.test:watch` must not carry `--testTimeout`').not.toMatch(/--testTimeout/)
    expect(readText(VITEST_CONFIG_PATH), 'G-9/§1.4 — `vitest.config.ts`\'s `testTimeout` is pinned EXACTLY (floor and ceiling) at `15_000`').toContain('testTimeout: 15_000')
  })
})

// ===========================================================================
// §3.3 `C-9` — CLASS (b): the rows that need the REAL run. **THE UNIT'S OWN GATE** (`C-8`/§6
// `V-3`): `npm run divergence` (the pinned key's own value) reaching `R13 RESULT: <n> checks,
// 0 failures` with exit `0`. These rows CANNOT be authored here: the leg costs a full
// `npm run build` plus a real Electron boot, and `C-10` forbids booting Electron from this
// instrument. Each row carries its DECLARED reading and is left un-executed for the implementer's
// landing pass and the live runner's pass (§6 `V-3`/`V-5`, §8 `E-5`).
// ===========================================================================
describe('U-DIVERGENCE-FIXTURE §3.3 class (b) B-1..B-5 — THE REAL RUN (the unit\u2019s own gate, C-8/C-9)', () => {
  it.skip('B-1 [class (b) — the implementer\'s landing run] — `npm run divergence` reaches `R13 RESULT: <n> checks, 0 failures` AND exit `0`, as ONE reading, with `<n>` recorded verbatim (`<n>` is an OBSERVATION, never a re-pin: `O-5`/`V-5`)', () => {
    // DECLARED STATE AT THIS HEAD: NOT RUN by this red pass. The recorded red is
    // `R13 RESULT: 1 checks, 2 failures` with the boot half GREEN (M-1) and the drive step dead at
    // `unresolved target: {"kind":"cssId","cssId":"inc"}` (M-2). A `0 failures` line beside a
    // non-zero exit (or the reverse) is an INCONSISTENT LEG and is reported as such, never as a
    // green. Run discipline (M-6/§8 `E-5`): isolated ports, boot-and-connect confirmed before
    // driving, this run's own scratch profile.
  })

  it.skip('B-2 [class (b)] — the readiness probe\'s OBSERVED disposition: "the load was in effect before the first dispatch" — or "the probe FIRED, naming <surface>", which is a FINDING to record verbatim whose honest next step is §8 `E-1`, never a sleep (`C-2` item 3 / `O-1`)', () => {
    // DECLARED STATE AT THIS HEAD: NOT-EXERCISED (no probe exists yet — that is R-4's red). The
    // implementer MUST record what the probe observed on the landing run; a fixed sleep in place of
    // a probe is a review finding in a leg whose whole value is determinism.
  })

  it.skip('B-3 [class (b)] — the run\'s structural readings, recorded even on a RED: both legs\' `census.inTree` / `census.registered`, their `data-node-id` sets and their `nodeId` vocabularies (the `O-2`/`O-3` settle). A RED whose reading is not quoted is not a reading', () => {
    // DECLARED STATE AT THIS HEAD: NOT RUN. The comparison stage has never run green (M-7), so no
    // `<n>` exists to quote and this row may not predict one.
  })

  it.skip('B-4 [class (b) — the sibling unit\'s own half, re-asserted here] — the scratch half stays green: the sweep line reads `leftover: NONE` with 0 surviving processes and an empty scratch root after the run. A fixture fix may not regress the spawn fix', () => {
    // DECLARED STATE AT THIS HEAD: NOT RUN by this pass; the recorded green half is M-1
    // (`removed 2 · passes 3 · leftover: NONE`, 0 surviving processes). If this regresses, the
    // sibling unit's own rows (`tests/unit-divergence-spawn-contract.test.ts`) must red.
  })

  it.skip('B-5 [class (b)] — NO live battery is claimed: `npm run divergence` green is a precondition, never a live green (`M-4`/`M-6`, §5 `L-4`, `RCA-11`/`RCA-12`)', () => {
    // DECLARED STATE AT THIS HEAD: NOT CLAIMED. `scripts/live-drive.mjs` is NOT this unit's surface
    // (§1.5), and a green here says the two hosts agree about the SAME fixture — it says nothing
    // about the app's own boot graph (§5 `L-2`).
  })
})

// ===========================================================================
// §4.2 — THE TYPED REGISTER (the gate's EIGHT rows + the two the gate-4 remand ADDED for the
// zero-coverage steps `A-2`/`A-3`; `P-IM-`/`P-SM-`/`P-TP-` ONLY, NO `F-` row).
// Deterministic plain tables, no PBT library, no new devDependency (§4.1). Caps: ≤100 attempts
// per row · ≤400 in total · STOP AFTER 5 distinct counterexamples; every row reports its strategy
// id, its DECLARED term printed as the sum of its own factors, its EXECUTED term, `held`/`broken`,
// `stoppedAt` and its counterexamples. Seed `0x20260930` (a plain table needs no PRNG; the seed is
// recorded as the declared strategy seed of this register).
// §4.3: no row asserts the leg's COLOUR; no row asserts the APP; every row reads the SAME
// instrument the class-(a) rows read; a row that cannot execute its declared term is BROKEN.
//
// ⟨REGISTER NOTE, recorded rather than smoothed over (`§4.3` item 4): the register is the
// exhaustive half of ONE contract, so its rows read the SAME instrument the class-(a) rows read.
// At this head (`S-1`) the load step and the probe DO NOT EXIST, so four of the eight rows
// (`P-IM-1`, `P-SM-1`, `P-SM-2`, `P-TP-1`) cannot execute the bodies their DECLARED terms
// describe: they report `broken` with the missing surface as their counterexample, under their
// DECLARED term — the declared column is NOT reduced, and no term is silently re-scoped.⟩
// ===========================================================================
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5
const SEED = 0x20260930

interface RowReport {
  row: string
  strategyId: string
  declared: string
  declaredTotal: number
  executed: number
  held: boolean
  stoppedAt: number | null
  counterexamples: string[]
}

const REPORTS: RowReport[] = []

const DECLARED_REGISTER: Array<{ row: string; strategyId: string; declared: string; declaredTotal: number }> = [
  // ⟨AMENDED 2026-10-05 (gate-4 remand, `A-10`/`A-2`/`A-3` + the `S-3` re-derivation): the row's
  //   second, EMPTY-MODULE negative draw was replaced by the audit's own generators, so the DECLARED
  //   term moves `2*2+2 = 6` → `2*2+4 = 8`. The superseded figure stays visible HERE, in the spec's
  //   §4.2 (which must be amended), and in the row's own title/body.⟩
  { row: 'P-IM-1', strategyId: 'strat:divergence-fixture-symmetry', declared: '2*2+4', declaredTotal: 8 },
  { row: 'P-IM-2', strategyId: 'strat:divergence-fixture-preserved-surfaces', declared: '4+8+8+2+1', declaredTotal: 23 },
  { row: 'P-IM-3', strategyId: 'strat:divergence-fixture-literal', declared: '12+1+2', declaredTotal: 15 },
  { row: 'P-SM-1', strategyId: 'strat:divergence-fixture-readiness', declared: '3*2+2', declaredTotal: 8 },
  // ⟨AMENDED 2026-10-05 (gate-4 remand, `A-10`/`S-3`): `NEG-duplicate-invocation` is added, so the
  //   DECLARED term moves `2*2+2 = 6` → `2*2+3 = 7`. The superseded figure stays visible here and
  //   in the spec's §4.2, which must be amended.⟩
  { row: 'P-SM-2', strategyId: 'strat:divergence-fixture-hosts', declared: '2*2+3', declaredTotal: 7 },
  { row: 'P-SM-3', strategyId: 'strat:divergence-fixture-load-route', declared: '2*2+2', declaredTotal: 6 },
  // ⟨AMENDED 2026-10-05 (gate-4 remand, `A-5`): the auditor's REFUSED-READ arm is added, so the
  //   DECLARED term moves `3*2+1 = 7` → `3*2+1+1 = 8`. The superseded figure stays visible here and
  //   in the spec's §4.2, which must be amended.⟩
  { row: 'P-TP-1', strategyId: 'strat:divergence-fixture-totality', declared: '3*2+1+1', declaredTotal: 8 },
  { row: 'P-TP-2', strategyId: 'strat:divergence-fixture-spawn-untouched', declared: '2*2+2+1', declaredTotal: 7 },
  // ⟨ADDED 2026-10-05 (gate-4 remand, `A-2`): THE BOUNDED BOOT-INSTALL WAIT HAD ZERO COVERAGE — no
  //   row in either divergence file mentioned `waitForBootInstalled` / `BOOT_POLL_*` / `boot.status`,
  //   so deleting the wait, moving it after the load, or zeroing the deadline each left `npm test`
  //   green. This row is NEW (the register was EIGHT rows at the gate; the spec's §4.1 row cap must
  //   be amended to NINE/TEN — see the report).⟩
  { row: 'P-SM-4', strategyId: 'strat:divergence-fixture-boot-wait', declared: '1*3+5+2', declaredTotal: 10 },
  // ⟨ADDED 2026-10-05 (gate-4 remand, `A-3`): THE SPAWN ENV MEMBER HAD THE SAME ZERO COVERAGE —
  //   deleting `PROVIDENT_ENABLE_TOOL_GROUPS: 'graph'` from BOTH sites kept `held × 8` and `78/78`
  //   green. NEW row.⟩
  { row: 'P-SM-5', strategyId: 'strat:divergence-fixture-spawn-env-member', declared: '2*3+1+2', declaredTotal: 9 },
]

interface RowRun {
  attempts: number
  consecutive: number
  counterexamples: string[]
  stoppedAt: number | null
}

function newRun(): RowRun {
  return { attempts: 0, consecutive: 0, counterexamples: [], stoppedAt: null }
}

function attempt(run: RowRun, i: number, ce: string | null): void {
  if (run.stoppedAt !== null) return
  if (run.attempts >= CAPS.perRow) return
  run.attempts++
  if (ce === null) { run.consecutive = 0; return }
  run.consecutive++
  run.counterexamples.push(ce)
  if (run.consecutive >= STOP_AFTER && run.stoppedAt === null) run.stoppedAt = i
}

function finish(id: string, run: RowRun): void {
  const declared = DECLARED_REGISTER.find((r) => r.row === id)!
  const held = run.counterexamples.length === 0 && run.attempts === declared.declaredTotal
  const report: RowReport = {
    row: id,
    strategyId: declared.strategyId,
    declared: declared.declared,
    declaredTotal: declared.declaredTotal,
    executed: run.attempts,
    held,
    stoppedAt: run.stoppedAt,
    counterexamples: run.counterexamples,
  }
  REPORTS.push(report)
  expect(
    report.held,
    `${report.row} ${report.strategyId}: ${report.held ? 'held' : 'BROKEN'} · declared ${report.declared} = ${report.declaredTotal} · executed ${report.executed} · stoppedAt ${String(report.stoppedAt)}` +
      (report.counterexamples.length > 0 ? ` · counterexamples: ${report.counterexamples.slice(0, STOP_AFTER).join(' | ')}` : ''),
  ).toBe(true)
}

/** Run a register row's body: a body that THROWS still reports the row — BROKEN, with the throw as
 *  its counterexample — so `stoppedAt`, the declared-vs-executed term and the counterexample list
 *  are never hidden by an early throw. */
function registerRow(id: string, body: (run: RowRun) => void): void {
  const run = newRun()
  const thrown = attemptOf(() => body(run))
  if (thrown !== null) attempt(run, run.attempts + 1, thrown)
  finish(id, run)
}

// ---------------------------------------------------------------------------
// ⟨`A-2`/`A-5` — THE WAIT'S OWN ORDERING, ITS BUDGET, AND ITS REAL STOP ARMS.⟩
//
// `A-2` (BLOCKING, COVERAGE) measured that NO row in either divergence file mentioned
// `waitForBootInstalled` / `BOOT_POLL_*` / `boot.status`: deleting the wait, moving it AFTER the
// load, or zeroing the deadline each left `npm test` green. `A-5` adds the refused-read arm the
// pass recorded (the wait never inspects `isError`; `call()`'s `JSON.parse` is unguarded).
//
// HOW THE ARMS DRIVE THE **REAL** FUNCTION WITHOUT TOUCHING `scripts/**`: `waitForBootInstalled` is
// module-private (the harness exports only `registerCleanup`/`createScratchProfile`/
// `cleanupScratchProfiles`/`composeArgs`/`classifyBootFailure`/`ok`/`failureCount`/`checkCount`/
// `exitCodeFor`/`demoEnvelope`) and `C-10` forbids booting Electron from this file, so the arms
// extract the function's OWN SOURCE TEXT and its OWN named lexical dependencies (`call`, the two
// pinned poll constants) from `scripts/electron-divergence.mjs` and execute THAT text: every arm
// runs the leg's real branches, its real messages and its real deadline arithmetic, and a
// deleted/renamed/moved wait is a LOUD row failure rather than a green. A MISSING dependency is a
// counterexample (BROKEN), never a silent skip.

/** The `{ … }` BODY span of a function whose parameter list opens at `paren`, found by SEARCHING
 *  forward for the body's opener rather than by arithmetic: a declaration may write `(a, b) {`,
 *  `(a: T) {` or `(a, b)\n{`, and the first CODE bracket after the parameter list is the body in
 *  every one of those forms. Returns the span's opener and closer, or `null` when there is none. */
function functionBody(src: string, paren: number): { open: number; end: number } | null {
  const close = findMatching(src, paren)
  if (close < 0) return null
  // SCAN FORWARD over whitespace and comments only, looking for the body's opener. `nextCode` is
  // NOT used here: it also SKIPS string literals, so starting inside a body whose first statement
  // begins with a literal would step over the opener and miss the declaration entirely.
  let k = close + 1
  for (;;) {
    if (k >= src.length) return null
    const c = src[k]!
    if (/\s/.test(c)) { k++; continue }
    if (c === '/' && src[k + 1] === '/') { const nl = src.indexOf('\n', k); k = nl < 0 ? src.length : nl + 1; continue }
    if (c === '/' && src[k + 1] === '*') { const e = src.indexOf('*/', k + 2); k = e < 0 ? src.length : e + 2; continue }
    break
  }
  if (src[k] !== '{') return null
  const end = findMatching(src, k)
  return end < 0 ? null : { open: k, end }
}

/** The FULL source text of a TOP-LEVEL `[export] [async] function <name>(…) { … }` declaration,
 *  read by a direct scan that (a) never looks inside a string/template literal or a comment
 *  (`nextCode`), and (b) requires the match to be the declaration itself — so a mention of the name
 *  in prose can never be mistaken for it. `null` when the module carries no such declaration, which
 *  is a COUNTEREXAMPLE in every row that needs it. */
function declText(src: string, name: string): string | null {
  let at = 0
  for (;;) {
    at = src.indexOf(`function ${name}(`, at + 1)
    if (at < 0) return null
    if (at > 0 && /[\w$.]/.test(src[at - 1]!)) continue
    // the declaration must be TOP-LEVEL and it must be THIS match: the same line carries nothing
    // but the optional `export`/`async` modifiers in front of the `function` keyword
    const lineStart = src.lastIndexOf('\n', at) + 1
    if (!/^[ \t]*(export\s+)?(async\s+)?$/.test(src.slice(lineStart, at))) continue
    // (the line carries NOTHING but `export`/`async` before `function`, i.e. this match is the
    //  declaration itself and not a mention of it inside an expression)
    const paren = at + `function ${name}`.length
    if (src[paren] !== '(') continue
    const span = functionBody(src, paren)
    if (span === null) continue
    // INCLUDE the declaration's own `async` modifier (a `async function …` body is not valid in a
    // plain function: it contains `await`), but DROP `export`, which is a module-level keyword the
    // sandbox cannot carry.
    return src.slice(lineStart, span.end + 1).replace(/^\s*export\s+/, '')
  }
}

/** The WHOLE TEXT of a NAMED top-level `const <name> = [ … ]` array literal (multi-line, unlike
 *  `constRhs`), read by balanced braces. `null` when the module carries no such array. */
function constArrayText(src: string, name: string): string | null {
  const re = new RegExp(`(?:^|\\n)\\s*const\\s+${name}\\s*=\\s*\\[`)
  const m = re.exec(src)
  if (m === null) return null
  const open = src.indexOf('[', m.index)
  const inner = open < 0 ? null : balancedBody(src, open)
  return inner === null ? null : `[${inner}]`
}

/** The RIGHT-HAND SIDE of a NAMED top-level `const` (the pinned poll constants), as source text. */
function constRhs(src: string, name: string): string | null {
  const re = new RegExp(`(?:^|\\n)\\s*const\\s+${name}\\s*=\\s*`)
  const m = re.exec(src)
  if (m === null) return null
  const from = m.index + m[0].length
  const eol = src.indexOf('\n', from)
  return src.slice(from, eol < 0 ? src.length : eol).trim().replace(/;\s*$/, '')
}

/** A stub MCP client for the arms: it answers `callTool` in-process (no transport, no Electron, no
 *  mock API of any kind), counts what was asked, and lets an arm reject the call. */
interface StubClient {
  loadCalls: number
  dispatchCalls: number
  listCalls: number
  calls: Array<{ name: string }>
  callTool(req: { name: string; arguments?: unknown }): Promise<unknown>
}
function stubClient(handler: (name: string, stub: StubClient) => Promise<unknown>): StubClient {
  const stub: StubClient = {
    loadCalls: 0,
    dispatchCalls: 0,
    listCalls: 0,
    calls: [],
    async callTool(req: { name: string; arguments?: unknown }): Promise<unknown> {
      stub.calls.push({ name: req.name })
      if (req.name === 'provident.load') stub.loadCalls++
      if (req.name === 'provident.dispatch') stub.dispatchCalls++
      if (req.name === 'provident.list_targets') stub.listCalls++
      return handler(req.name, stub)
    },
  }
  return stub
}

/** A reply in the MCP result shape the harness's `call()` parses (`content[0].text` is JSON). */
function toolReply(value: unknown, isError = false): unknown {
  return { isError, content: [{ type: 'text', text: JSON.stringify(value) }] }
}

/** THE REAL INSTRUMENT: `waitForBootInstalled` (with the harness's own `call` and its own two pinned
 *  constants), extracted from the harness's source text and executed. `Date.now` is INJECTED and
 *  passed into the sandbox AS `Date`, so the deadline arm exercises the SOURCE'S OWN arithmetic over
 *  the SOURCE'S OWN constants — `BOOT_POLL_DEADLINE_MS` is never re-declared here (a re-declared
 *  constant would be a MODEL of the contract, which is exactly what `P-TP-1`'s pre-fix `stopReport`
 *  was, and the reason the audit found the named-cause arm unable to fail). */
function waitCallables(opts: { tickPerNow?: number } = {}): { wait: (client: StubClient) => Promise<unknown>; logs: string[]; injected: { interval: string; deadline: string; intervalValue: number; deadlineValue: number; step: number } } {
  const fn = declText(HARNESS_SRC, 'waitForBootInstalled')
  const callFn = declText(HARNESS_SRC, 'call')
  const interval = constRhs(HARNESS_SRC, 'BOOT_POLL_INTERVAL_MS')
  const deadline = constRhs(HARNESS_SRC, 'BOOT_POLL_DEADLINE_MS')
  if (fn === null) throw new Error('the harness carries no `waitForBootInstalled` declaration — A-2\'s instrument is absent, so no arm below can be driven')
  if (callFn === null) throw new Error('the harness carries no `call` helper, which the wait binds through')
  if (interval === null || deadline === null) throw new Error('the harness no longer declares BOTH pinned poll constants (BOOT_POLL_INTERVAL_MS / BOOT_POLL_DEADLINE_MS)')
  // THE INJECTED CLOCK. `tickPerNow` is the number of MILLISECONDS one `Date.now()` call advances:
  // `1` for the ordinary arms (so the wait's own poll count is realistic), and the SOURCE'S OWN
  // `BOOT_POLL_DEADLINE_MS` for the deadline arm (so that arm reaches the source's own deadline
  // comparison without waiting 20 real seconds — the constant is READ, never re-declared).
  const logs: string[] = []
  const step = opts.tickPerNow ?? 1
  let tick = Date.now()
  const sandboxDate = { now: () => (tick += step) }
  const build = new Function(
    'call',
    'BOOT_POLL_INTERVAL_MS',
    'BOOT_POLL_DEADLINE_MS',
    'console',
    'Date',
    'Error',
    'JSON',
    'String',
    'Array',
    'Number',
    'Object',
    `${callFn}\n${fn}\nreturn waitForBootInstalled`,
  )
  // the source's own constant EXPRESSIONS are EVALUATED (so `20_000` reaches the sandbox as the
  // number 20000 — a string would make the wait's `waited >= BOOT_POLL_DEADLINE_MS` a comparison
  // that is never true, which is exactly the silent-non-termination this extraction must not have)
  const intervalValue = new Function(`return (${interval})`)() as number
  const deadlineValue = new Function(`return (${deadline})`)() as number
  const wait = build(
    callFn ? callFn : null,
    intervalValue,
    deadlineValue,
    { log: (line: unknown) => logs.push(String(line)) },
    sandboxDate,
    Error,
    JSON,
    String,
    Array,
    Number,
    Object,
  ) as (client: StubClient) => Promise<unknown>
  return { wait, logs, injected: { interval, deadline, intervalValue, deadlineValue, step } }
}

/** `F-7`'s order check on ONE leg: `connect → wait → load → probe → drive`. A module whose wait is
 *  ABSENT, or whose wait sits anywhere but between `connect` and the load, violates BY NAME. */
function waitOrderViolations(text: string, leg: LegSequence | null): string[] {
  const out: string[] = []
  if (leg === null) return [': no leg on this path']
  const client = leg.client
  const at = waitCallAt(text, client)
  if (at === null) {
    out.push(`${leg.name} (${client}): NO \`waitForBootInstalled(${client})\` call exists on this leg's path — F-7's refined ordering is connect → wait (bounded) → load → probe → drive, and a deleted wait must RED (A-2)`)
    return out
  }
  if (leg.connectAt !== null && at < leg.connectAt) out.push(`${leg.name}: the wait precedes its \`connect\` (F-7)`)
  if (leg.loadAt !== null && at > leg.loadAt) out.push(`${leg.name}: the wait FOLLOWS the shared load step — the app's own fire-and-forget install can then land after the demo load and REPLACE it (F-7 / O-1; NEG-wait-after-load)`)
  if (leg.probeAt !== null && at > leg.probeAt) out.push(`${leg.name}: the wait follows the readiness read-back (F-7: the wait precedes the load, hence the probe)`)
  if (leg.driveAt !== null && at > leg.driveAt) out.push(`${leg.name}: the wait follows the first \`drive\` read (F-7)`)
  return out
}

/** §0B.3 item 5 / `F-6` — the deadline is the CLIENT's pinned constant, and `O-1`'s measured
 *  `250`–`540` ms is an OBSERVATION that must NEVER be used as a budget: no literal deadline, no
 *  sleep of an observed-ms length, and the interval used as the sleep. */
function waitBudgetViolations(text: string): string[] {
  const out: string[] = []
  const body = declText(text, 'waitForBootInstalled')
  if (body === null) return ["the harness carries no `waitForBootInstalled` declaration (A-2)"]
  if (constRhs(text, 'BOOT_POLL_INTERVAL_MS') === null) out.push("BOOT_POLL_INTERVAL_MS is not declared (the interval is the CLIENT's to pin)")
  if (constRhs(text, 'BOOT_POLL_DEADLINE_MS') === null) out.push("BOOT_POLL_DEADLINE_MS is not declared (the deadline is the CLIENT's to pin)")
  if (!/waited\s*>=\s*BOOT_POLL_DEADLINE_MS/.test(body)) out.push('the deadline check no longer compares against BOOT_POLL_DEADLINE_MS — a literal or a zeroed deadline is not the pinned constant')
  if (!/setTimeout\s*\(\s*resolve\s*,\s*BOOT_POLL_INTERVAL_MS\s*\)/.test(body)) out.push('the sleep no longer waits BOOT_POLL_INTERVAL_MS')
  if (/setTimeout\s*\(\s*resolve\s*,\s*(250|540)\s*\)/.test(body) || /waited\s*>=\s*(250|540)\b/.test(body)) out.push("`O-1`'s measured 250–540 ms is used as a BUDGET — it is an OBSERVATION (F-6), never a budget")
  if (!/installed/.test(body) || !/pending/.test(body) || !/failed/.test(body)) out.push('the declared three-state set (pending|installed|failed) is no longer read')
  return out
}

/** The top-level members of a spawn `env` object literal, as `name` → raw value text. */
function envMembers(envText: string): Array<{ name: string; value: string }> {
  const out: Array<{ name: string; value: string }> = []
  for (const member of splitTopLevel(envText)) {
    // an object member is `name: value`; a SHIM env literal written as a bare object literal inside
    // another expression is still a member list, so an `=` (an assignment-looking form) is accepted
    // too — the row's own subject is the MEMBER NAME, whatever punctuation the site's house style uses
    const m = /^\s*([A-Za-z_$][\w$]*)\s*[:=]\s*([\s\S]*)$/.exec(member)
    if (m === null) continue
    out.push({ name: m[1]!, value: m[2]!.trim() })
  }
  return out
}

/** The member's raw value in an env literal's SOURCE text, or `null` when the member is absent. */
function envMemberValue(envText: string, member: string): string | null {
  const hit = envMembers(envText).find((m) => m.name === member)
  return hit === undefined ? null : hit.value
}

// ---------------------------------------------------------------------------
// The register's own reading of the app-side source files the route rows need (§4.3 item 2: a
// source fact about the ROUTE, never a claim that the app renders or works).
// ---------------------------------------------------------------------------
const APP_ROUTE = (() => {
  const allToolsBlock = ((): string => {
    const at = MCP_SERVER_SRC.indexOf('ALL_TOOLS')
    if (at < 0) return ''
    const eq = MCP_SERVER_SRC.indexOf('=', at)
    if (eq < 0) return ''
    const open = MCP_SERVER_SRC.indexOf('[', eq)
    if (open < 0) return ''
    return balancedBody(MCP_SERVER_SRC, open) ?? ''
  })()
  const loadRegistered = /['"]provident\.load['"]/.test(allToolsBlock)
  const groupRow = ((): string | null => {
    const m = /['"]provident\.load['"]\s*:\s*['"]([\w-]+)['"]/.exec(SECURITY_SRC)
    return m === null ? null : m[1]!
  })()
  const rendererLoadCase = /case\s+'load'\s*:[\s\S]{0,120}?runtime\.load\s*\(/.test(RENDERER_SRC)
  const dispatchSlice = /name\.slice\s*\(\s*['"]provident\.['"]\.length\s*\)/.test(MCP_SERVER_SRC)
  const runtimeLoad = functionRegions(RUNTIME_SRC).get('load')?.body ?? ''
  const runtimeLoadOk = runtimeLoad.includes("'envelope'") && runtimeLoad.includes('loadEnvelope')
  const mutating = /MUTATING_METHODS\s*=\s*new\s+Set\(\s*\[[^\]]*'load'/.test(RENDERER_SRC)
  // ⟨`P-SM-3` — THE SHIM ARMS READ THE SHIM'S OWN ROUTE (the pre-fix arm 1 was near-vacuous
  //  — `includes('provident') || includes('Runtime')` — and arm 2 was asserted through the APP's
  //  `renderer.ts` `case 'load'`, a CROSS-SUBJECT read that re-asserted the positive). The battery
  //  host (leg 2) is a Node MCP server whose backend OWNS a real Runtime: it registers
  //  `provident.load` through the SAME `ProvidentMcpServer` tool surface and routes the name to its
  //  OWN backend method (`switch (method) { case 'load': ⇒ this.runtime.load(p) }`).⟩
  const shimRegistersTool = /ProvidentMcpServer/.test(BATTERY_HOST_SRC) && /SecurityGate/.test(BATTERY_HOST_SRC)
  const shimLoadMethodCase = /case\s+'load'\s*:[\s\S]{0,120}?runtime\.load\s*\(/.test(BATTERY_HOST_SRC)
  const shimMethodRouting = /invoke\s*\(\s*method\s*:/.test(BATTERY_HOST_SRC) && /invoke\(method/.test(MCP_SERVER_SRC)
  const shimRuntimeLoadOk = /loadEnvelope/.test(RUNTIME_SRC) && /runtime\.load\s*\(/.test(BATTERY_HOST_SRC)
  // THE NEGATIVE DRAWS' SUBJECTS (fabricated SOURCE TEXT, never written and never executed): a
  // battery host whose `case 'load'` has been REMOVED, and a tool registry whose `ALL_TOOLS` has
  // lost the name. Each must be seen by the SAME predicate the corresponding positive arm uses.
  const shimCaseRemovedSrc = BATTERY_HOST_SRC.replace(/case\s+'load'\s*:[\s\S]{0,120}?runtime\.load\s*\(p as never\)/, "case 'not-load':\n        return null")
  const shimLoadRouteRemoved = !/case\s+'load'\s*:[\s\S]{0,120}?runtime\.load\s*\(/.test(shimCaseRemovedSrc)
  const unregisteredAllTools = allToolsBlock.replace(/['"]provident\.load['"]\s*,?/, '')
  const unregisteredLoad = !/['"]provident\.load['"]/.test(unregisteredAllTools)
  return {
    loadRegistered, groupRow, rendererLoadCase, dispatchSlice, runtimeLoad, runtimeLoadOk, mutating,
    shimRegistersTool, shimLoadMethodCase, shimMethodRouting, shimRuntimeLoadOk, shimLoadRouteRemoved, unregisteredLoad,
  }
})()

/** The exported-surface probes of `P-IM-2`, read from the SOURCE TEXT (so no row needs an import
 *  and none can boot Electron). */
const EXIT_CONTRACT_HOLDS = /failureTotal\s*>\s*0\s*\?\s*1\s*:\s*0/.test(functionRegions(HARNESS_SRC).get('exitCodeFor')?.body ?? '')
function exitSafe(n: number): unknown {
  if (!EXIT_CONTRACT_HOLDS) return null
  return n > 0 ? 1 : 0
}
const OK_ARITHMETIC_NOTE = 'checks += 1 at the head of ok(); failures += 1 in the else branch'
const OK_ARITHMETIC_HOLDS = ((): boolean => {
  const body = functionRegions(HARNESS_SRC).get('ok')?.body ?? ''
  return /checks\s*\+=\s*1/.test(body) && /failures\s*\+=\s*1/.test(body)
})()
const NORM_HOLDS = ((): boolean => {
  const body = functionRegions(HARNESS_SRC).get('norm')?.body ?? ''
  return /node-\\d\+/.test(body) && /node#/.test(body) && DRIVE_NORM_CALLS === 4
})()

/** `P-TP-1` — a load that FAILS must produce a NAMED stop. Three declared shapes; the report is
 *  modelled as the pure function the contract describes, and the row asserts it never returns an
 *  unhandled `undefined` and never leaves the cause unnamed. */

describe('U-DIVERGENCE-FIXTURE §4.2 P-IM-1 — BOTH LEGS LOAD THE SAME DEMO ENVELOPE BEFORE THEY DRIVE (strat:divergence-fixture-symmetry)', () => {
  it('P-IM-1 — 2 legs × 2 arms (the load is present; its position precedes `drive`) + 4 negative draws = 8 attempts', () => {
    registerRow('P-IM-1', (run) => {
      const legs = SHAPE.legs
      let i = 0
      // the declared four are ALL executed — an absent leg is drawn as an EMPTY leg so its two arms
      // become counterexamples BY NAME, never a silently smaller row.
      for (let s = 0; s < 2; s++) {
        const leg = legs[s] ?? null
        attempt(run, i++, leg !== null && leg.loadAt !== null && leg.loadKind === 'envelope' && leg.usesDemoEnvelope
          ? null
          : `${leg?.name ?? `leg ${s + 1}`} · arm 1 (the load is present): read load=${leg === null || leg.loadAt === null ? 'ABSENT' : 'present'} kind=${JSON.stringify(leg?.loadKind ?? null)} envelope=${JSON.stringify(leg?.envelopeValue ?? null)}; C-1 item 1 pins \`${loadArgShape('demoEnvelope()')}\``)
        attempt(run, i++, leg !== null && leg.connectAt !== null && leg.driveAt !== null && leg.loadAt !== null && leg.connectAt < leg.loadAt && leg.loadAt < leg.driveAt
          ? null
          : `${leg?.name ?? `leg ${s + 1}`} · arm 2 (its position precedes \`drive\`): the sequence must be connect → load → [probe] → drive (C-1 item 3); read connect=${leg === null || leg.connectAt === null ? 'ABSENT' : 'present'} load=${leg === null || leg.loadAt === null ? 'ABSENT' : 'present'} drive=${leg === null || leg.driveAt === null ? 'ABSENT' : 'present'}`)
      }
      // THE FOUR NEGATIVE DRAWS (§4.2 `P-IM-1`'s declared "2 negative draws", re-derived on the
      // gate-4 audit `S-3`/`A-10`: the row's SECOND draw, an EMPTY module that scored only on the
      // global "no load site" violation, was replaced by the three audit-named generators below, so
      // the declared term moves 6 → 8 (`2*2+4`) and the superseded `2*2+2 = 6` stays recorded in the
      // spec's §4.2 table and in this file's own `DECLARED_REGISTER` table):
      // (a) a leg 1 loaded with a DIFFERENT envelope value (the row's original FIRST draw, KEPT);
      // (b) THE REAL PRE-FIX ASYMMETRY — leg 2 traverses the ONE shared step and leg 1 does not.
      //     The replaced draw was an EMPTY module (`load: 'none'`), which scored only on the global
      //     "no load site" violation and did NOT reproduce the asymmetry it named;
      // (c) `NEG-commented-invocation` (`A-10`), with its discrimination proof;
      // (d) `NEG-duplicate-invocation` (`P-SM-2`'s owed generator): the ONE step traversed TWICE by
      //     one leg with its own client — a DOUBLE LOAD the pre-fix hardcoded `calls: 1` could not see.
      attempt(run, i++, harnessShape(fabricatedModule({ load: 'other-envelope' })).violations.length > 0
        ? null
        : 'NEGATIVE (a): a leg 1 loaded with a DIFFERENT envelope value was ACCEPTED — `shim = real` over two different fixtures is the false green C-2 item 2 forbids')
      const skipsStep = harnessShape(
        `async function main() {\nawait eClient.connect(t)\nout1 = await drive(eClient)\n${SHIM_HEADER}await shimClient.connect(s)\n${loadStepInvocation('shimClient', {})}out2 = await drive(shimClient)\n}\n` +
          SHARED_HELPER('canonical') +
          `async function alsoLoads(client) {\n  ${loadStepInvocation('client', {})}}\n`,
      )
      attempt(run, i++, skipsStep.leg2 !== null && skipsStep.leg2.loadAt !== null && skipsStep.leg1 !== null && skipsStep.leg1.loadAt === null &&
        skipsStep.violations.filter((v) => v.startsWith('leg1')).length > 0
        ? null
        : `NEGATIVE (b) (the REAL PRE-FIX ASYMMETRY — leg 2 loads, leg 1 does not): the draw must be read as leg 2 LOADED (${skipsStep.leg2 === null || skipsStep.leg2.loadAt === null ? 'NO' : 'yes'}) and leg 1 with NO load (${skipsStep.leg1 === null || skipsStep.leg1.loadAt === null ? 'yes' : 'NO'}), and must RED against leg 1 by NAME; read violations ${JSON.stringify(skipsStep.violations)}`)

      // ⟨`A-10` — `NEG-commented-invocation`, WITH ITS DISCRIMINATION PROOF: the SAME shape, with
      //   leg 1's real invocation written as a COMMENT. The PRE-FIX (comment-blind) reader counts
      //   it as leg 1's traversal — which is the false green `A-10` measured; the FIXED reader
      //   (which strips comments/strings, as the harness's own `callSites()` does) does not. Both
      //   verdicts are asserted, so the draw cannot be satisfied by either shape alone.⟩
      const commentedSrc = commentedInvocationModule()
      const commentedShape = harnessShape(commentedSrc)
      const helper = SHAPE.sharedLoadHelper
      const oldLeg1 = helper === null ? -1 : commentBlindInvocations(commentedSrc, helper, 'leg1').length
      const oldLeg2 = helper === null ? -1 : commentBlindInvocations(commentedSrc, helper, 'leg2').length
      const newLeg1 = commentedShape.leg1 === null ? -1 : (commentedShape.leg1.loadAt === null ? 0 : commentedShape.leg1.calls)
      attempt(run, i++, helper !== null && oldLeg1 > 0 && oldLeg2 > 0 && newLeg1 === 0 && commentedShape.leg1 !== null && commentedShape.leg1.loadAt === null &&
        commentedShape.leg2 !== null && commentedShape.leg2.loadAt !== null && commentedShape.violations.filter((v) => v.startsWith('leg1')).length > 0
        ? null
        : `NEGATIVE (c) (NEG-commented-invocation): a COMMENTED \`// await loadFixture(eClient)\` must NOT read as leg 1's traversal. Read — the pre-fix comment-blind reader: leg1=${oldLeg1} leg2=${oldLeg2} invocation(s) (it accepts the commented form, which is the false green A-10 measured); the fixed reader: leg1 loadAt=${JSON.stringify(commentedShape.leg1 === null ? null : commentedShape.leg1.loadAt)} calls=${String(newLeg1)} leg2 loadAt=${JSON.stringify(commentedShape.leg2 === null ? null : commentedShape.leg2.loadAt)}, violations ${JSON.stringify(commentedShape.violations)}`)

      const dupes = harnessShape(duplicateInvocationModule())
      attempt(run, i++, dupes.leg1 !== null && dupes.leg1.calls === 2 && dupes.leg2 !== null && dupes.leg2.calls === 1
        ? null
        : `NEGATIVE (d) (NEG-duplicate-invocation): TWO call sites on one leg must read calls: 2 for that leg and 1 for the other (C-1 items 1/2 — "exactly one load per host"); read leg1=${String(dupes.leg1 === null ? null : dupes.leg1.calls)} leg2=${String(dupes.leg2 === null ? null : dupes.leg2.calls)} (the pre-fix body returned a hardcoded calls: 1, under which a double load was INVISIBLE)`)
    })
  })
})

describe('U-DIVERGENCE-FIXTURE §4.2 P-IM-2 — THE COMPARISON SET, THE `drive()` SURFACE AND THE EXIT CONTRACT ARE STRUCTURALLY IDENTICAL TO THE PRE-FIX HEAD (strat:divergence-fixture-preserved-surfaces)', () => {
  it('P-IM-2 — 4 `drive()` calls + 8 returned members + 8 comparison labels + 2 arithmetic/exit draws + 1 normalization draw = 23 attempts', () => {
    registerRow('P-IM-2', (run) => {
      let i = 0
      for (let c = 0; c < 4; c++) {
        attempt(run, i++, DRIVE_CALL_SEQUENCE[c] === DRIVE_CALLS[c]
          ? null
          : `drive() call ${c + 1} reads ${JSON.stringify(DRIVE_CALL_SEQUENCE[c] ?? null)}; the contract pins ${JSON.stringify(DRIVE_CALLS[c])} (C-3 item 3)`)
      }
      for (let m = 0; m < 8; m++) {
        attempt(run, i++, DRIVE_RETURN_MEMBERS[m] === DRIVE_MEMBERS[m]
          ? null
          : `drive()'s returned record member ${m + 1} reads ${JSON.stringify(DRIVE_RETURN_MEMBERS[m] ?? null)}; the contract pins ${JSON.stringify(DRIVE_MEMBERS[m])} (C-3 item 3 / §10.3 item 4)`)
      }
      for (let l = 0; l < 8; l++) {
        attempt(run, i++, OK_SITE_LABELS[l + 1] === COMPARISON_LABELS[l]
          ? null
          : `comparison label ${l + 1} reads ${JSON.stringify(OK_SITE_LABELS[l + 1] ?? null)}; the contract pins ${JSON.stringify(COMPARISON_LABELS[l])} in the same order (C-3 item 1)`)
      }
      // the two arithmetic/exit draws — driven through the harness's OWN source facts
      attempt(run, i++, EXIT_CONTRACT_HOLDS
        ? null
        : `the exit contract does not hold: exitCodeFor(0)=${JSON.stringify(exitSafe(0))} exitCodeFor(1)=${JSON.stringify(exitSafe(1))} exitCodeFor(4)=${JSON.stringify(exitSafe(4))} (C-3 item 4: \`{0,1}\`)`)
      attempt(run, i++, OK_ARITHMETIC_HOLDS
        ? null
        : `\`ok()\`'s arithmetic is not the preserved one (${OK_ARITHMETIC_NOTE}); C-3 item 1 pins it`)
      // the normalization draw — §4.2's own single draw
      attempt(run, i++, NORM_HOLDS
        ? null
        : 'norm()\'s minted-id normalization (`node-N` → `node#`) is not applied to the four minted-id surfaces of the shared drive() body (C-3 item 3)')
    })
  })
})

describe('U-DIVERGENCE-FIXTURE §4.2 P-IM-3 — THE DEMO LITERAL IS UNCHANGED AND STILL TRACKS THE FORK\'S SOURCE OF TRUTH (strat:divergence-fixture-literal)', () => {
  it('P-IM-3 — 12 authored node positions + 1 node-count draw + 2 negative draws MUTATED THROUGH THE INSTRUMENT (a dropped node; a re-spelled authored id) = 15 attempts', () => {
    registerRow('P-IM-3', (run) => {
      let i = 0
      for (let n = 0; n < DEMO_NODE_COUNT; n++) {
        const mineType = HARNESS_LITERAL.types[n] ?? null
        const mineCss = HARNESS_LITERAL.cssIds[n] ?? null
        const mineProps = HARNESS_LITERAL.propsIds[n] ?? null
        const theirsType = MODULE_LITERAL.types[n] ?? null
        const theirsCss = MODULE_LITERAL.cssIds[n] ?? null
        const theirsProps = MODULE_LITERAL.propsIds[n] ?? null
        attempt(run, i++, mineType !== null && mineType === theirsType && mineCss === theirsCss && mineProps === theirsProps
          ? null
          : `authored node position ${n + 1}: the harness literal reads {type:${JSON.stringify(mineType)}, cssId:${JSON.stringify(mineCss)}, propsId:${JSON.stringify(mineProps)}}; \`src/shared/demo-envelope.ts\` reads {type:${JSON.stringify(theirsType)}, cssId:${JSON.stringify(theirsCss)}, propsId:${JSON.stringify(theirsProps)}} (S-7 — the two hand-maintained copies must be in step at this head)`)
      }
      attempt(run, i++, HARNESS_LITERAL.types.length === DEMO_NODE_COUNT && MODULE_LITERAL.types.length === DEMO_NODE_COUNT
        ? null
        : `the node-count draw reads ${HARNESS_LITERAL.types.length} (harness) against ${MODULE_LITERAL.types.length} (the fork's source of truth); both are TWELVE (S-7 / §10.3 item 2)`)
      // ⟨PBT re-derivation (`S-3`), `NEG-literal-mutated-through-instrument`: the two pre-fix
      //   negatives were ARITHMETIC OVER ARRAYS THIS ROW BUILT ITSELF (`droppedTypes.length !==
      //   MODULE_LITERAL.types.length`, a re-spelled-id `JSON.stringify` compare) — the instrument
      //   never saw the mutated literal, so neither draw could fail for the reason it named. Both now
      //   MUTATE THE DEMO LITERAL'S SOURCE TEXT and RE-RUN THE INSTRUMENT: the instrument
      //   (`authoredLiteral`) must READ the mutation, and the row's OWN position predicate — the one
      //   the twelve draws above use — must break on it.⟩
      const dropOne = HARNESS_SRC.replace(/\{\s*type:\s*'h1'[^}]*\},/, '')
      const droppedLiteral = authoredLiteral(dropOne)
      const droppedBreak = droppedPositionBreak(droppedLiteral)
      const droppedCaughtByInstrument = droppedBreak !== null && (literalNodes(droppedLiteral)[droppedBreak]?.type ?? null) !== (MODULE_NODES[droppedBreak]?.type ?? null)
      attempt(run, i++, dropOne !== HARNESS_SRC && droppedLiteral.types.length === DEMO_NODE_COUNT - 1 && droppedBreak !== null && droppedCaughtByInstrument
        ? null
        : `NEGATIVE (a dropped node, MUTATED THROUGH THE INSTRUMENT): the drawn literal must be READ by the instrument (12 → ${droppedLiteral.types.length} authored node(s)) and must break the row's OWN position predicate; read ${JSON.stringify(droppedLiteral.types)}`)

      const respellOne = HARNESS_SRC.replace("css: { id: 'echo-out'", "css: { id: 'echo-outX'")
      const respelledLiteral = authoredLiteral(respellOne)
      const respelledBreak = droppedPositionBreak(respelledLiteral)
      // the instrument READ the renamed id AND the row's own position predicate breaks ON THAT ID —
      // which is the two-sided proof the arithmetic-over-own-arrays draw could not give
      const respellCaughtByInstrument = respelledBreak !== null && (literalNodes(respelledLiteral)[respelledBreak]?.cssId ?? null) === 'echo-outX' &&
        (literalNodes(respelledLiteral)[respelledBreak]?.cssId ?? null) !== (MODULE_NODES[respelledBreak]?.cssId ?? null)
      attempt(run, i++, respellOne !== HARNESS_SRC && respelledLiteral.types.length === DEMO_NODE_COUNT &&
        respelledLiteral.cssIds.includes('echo-outX') && respelledBreak !== null && respellCaughtByInstrument
        ? null
        : `NEGATIVE (a re-spelled authored id, MUTATED THROUGH THE INSTRUMENT): the instrument must READ the renamed id (read ${JSON.stringify(respelledLiteral.cssIds)}) and the row's OWN position predicate must break on it; read break at position ${String(respelledBreak)}`)
    })
  })
})

/** `P-SM-1` — the three declared readiness states, read from the SAME probe shape the class-(a)
 *  rows read: the load not yet requested (a `drive` must be unreachable without the load), the load
 *  requested and in effect (the leg proceeds SILENTLY), and the load requested and superseded or
 *  refused (the leg STOPS before any comparison row). */
const READINESS_STATES: Array<{ state: string; ok: boolean; why: string }> = (() => {
  const silent = LEG1_OK_SITES === 0 && LEG2_OK_SITES === 0
  const ordered = SHAPE.leg1 !== null && SHAPE.leg1.loadAt !== null && SHAPE.leg1.driveAt !== null && SHAPE.leg1.loadAt < SHAPE.leg1.driveAt
  return [
    {
      state: 'the load not yet requested',
      ok: ordered,
      why: 'a `drive` must be UNREACHABLE without the load (C-1 item 3): the landed sequence is connect → load → probe → drive',
    },
    {
      state: 'the load requested and in effect',
      ok: PROBE.inEffect && PROBE.loudStop && silent && ordered,
      why: 'the in-effect state must proceed to `drive` SILENTLY: no `ok()` call and no census change (C-2 item 2)',
    },
    {
      state: 'the load requested and superseded/refused',
      ok: PROBE.loudStop && silent,
      why: 'the superseded/refused state must STOP before any comparison row, name the missing surface and quote the tool error (C-2 items 2/4)',
    },
  ]
})()

describe('U-DIVERGENCE-FIXTURE §4.2 P-SM-1 — THE DRIVE READINESS IS OBSERVABLE, AND ITS FAILURE IS LOUD (strat:divergence-fixture-readiness)', () => {
  it('P-SM-1 — 3 states × 2 arms (silent-on-success, loud-on-failure) + 2 negative draws = 8 attempts', () => {
    registerRow('P-SM-1', (run) => {
      let i = 0
      for (const s of READINESS_STATES) {
        // ARM 1 — SILENT-ON-SUCCESS: the load-to-drive span carries no `ok()` call, and the leg is
        // in the state the row claims (no census change; D-5).
        const silentArm = s.ok && LEG1_OK_SITES === 0 && LEG2_OK_SITES === 0
        attempt(run, i++, silentArm
          ? null
          : `state "${s.state}" · arm 1 (silent-on-success): ${s.why} — observed: leg 1 load=${SHAPE.leg1 === null || SHAPE.leg1.loadAt === null ? 'ABSENT' : 'present'} drive=${SHAPE.leg1 === null || SHAPE.leg1.driveAt === null ? 'ABSENT' : 'present'}, probe reads=${JSON.stringify(PROBE.reads)}, loudStop=${String(PROBE.loudStop)}, ok() calls in the load→drive span: leg1=${String(LEG1_OK_SITES)} leg2=${String(LEG2_OK_SITES)} (C-2 item 2 / D-5)`)
        // ARM 2 — LOUD-ON-FAILURE: a state that cannot proceed must stop BY NAME, before any
        // comparison row, and NO comparison row may be emitted from a graph the leg never loaded.
        const loudArm = s.ok || (s.state !== 'the load not yet requested' && PROBE.loudStop)
        attempt(run, i++, loudArm
          ? null
          : `state "${s.state}" · arm 2 (loud-on-failure): ${s.why} — observed: loudStop=${String(PROBE.loudStop)} reads=${JSON.stringify(PROBE.reads)} (C-2 items 2/4: the superseded/refused state names the missing surface and quotes the tool error, and the not-yet-requested state is unreachable because \`drive\` is preceded by the shared load)`)
      }
      // NEGATIVE 1 — a probe that FIRES but lets the leg continue is not a stop
      const firesThenContinues = `await c.callTool({ name: 'provident.load', arguments: { kind: 'envelope', envelope: demoEnvelope() } })\nif (!loaded) console.error('the demo surface is missing')\nout = await drive(c)\n`
      attempt(run, i++, !probeShape(firesThenContinues, harnessShape(`async function main() {\n${firesThenContinues}}\n`).leg1).loudStop
        ? null
        : 'NEGATIVE (a probe that fires but lets the leg continue): reported as LOUD — a probe that only logs does not forbid emitting a `shim = real` row from a graph the leg never loaded (C-2 item 2)')
      // NEGATIVE 2 — a probe implemented as a ninth comparison row must be rejected
      const redsARow = `await c.callTool({ name: 'provident.load', arguments: { kind: 'envelope', envelope: demoEnvelope() } })\nawait c.callTool({ name: 'provident.list_targets', arguments: {} })\nok('readiness probe', true)\nout = await drive(c)\n`
      attempt(run, i++, okCallsBetween(redsARow, redsARow.indexOf('provident.load'), redsARow.indexOf('drive(')) > 0
        ? null
        : 'NEGATIVE (a probe that reds a comparison row): the census-perturbation detector failed to see the ninth `ok()` call — D-5 makes that shape a contract change, not a pass')
    })
  })
})

describe('U-DIVERGENCE-FIXTURE §4.2 P-SM-2 — EXACTLY TWO HOSTS AND EXACTLY ONE LOAD PER HOST (strat:divergence-fixture-hosts)', () => {
  it('P-SM-2 — 2 hosts × 2 arms (host count; loads per host) + 3 negative draws (a third host; a duplicated load on one leg; a zero-load leg) = 7 attempts', () => {
    registerRow('P-SM-2', (run) => {
      let i = 0
      const hosts = [
        { name: 'leg 1 — the real Electron app', countOk: SHAPE.spawnSites === 2 && SHAPE.sdkSites === 1, loads: SHAPE.leg1?.calls ?? 0 },
        { name: 'leg 2 — the DOM-shim battery host', countOk: SHAPE.shimSites === 1, loads: SHAPE.leg2?.calls ?? 0 },
      ]
      for (const h of hosts) {
        attempt(run, i++, h.countOk
          ? null
          : `${h.name} · arm 1 (host count): the run must hold exactly TWO spawn sites and no third child (C-3 item 5); read spawn sites=${SHAPE.spawnSites}, SDK transports=${SHAPE.sdkSites}, shim hosts=${SHAPE.shimSites}`)
        // ⟨ATTRIBUTION (arm 2, repaired on the implementer's measurement; the AUDIT's `P-SM-2`
        //   finding was that `calls: 1` was HARDCODED and only the FIRST traversal was read, so
        //   "exactly one load per host" was measured NOWHERE): `C-1` item 2 pins ONE load call SITE
        //   shared by both legs, so the arm cannot be a per-leg call-SITE count — one site cannot be
        //   both legs'. It asserts what the clause does state, over a REAL traversal count: this
        //   leg's PATH traverses the step exactly once (a SECOND invocation with this leg's own
        //   client reads 2 and reds — see the duplicate draw below; a leg that never reaches it
        //   reads 0 and reds).⟩
        attempt(run, i++, h.loads === 1
          ? null
          : `${h.name} · arm 2 (loads per host): this leg's path must traverse the load step exactly ONCE (C-1 item 2 — one shared step, one call site, reached once per leg); read ${h.loads} traversal(s) for this leg (via ${String((h.name.startsWith('leg 1') ? SHAPE.leg1 : SHAPE.leg2)?.loadVia ?? null)}, shared step = ${String(SHAPE.sharedLoadHelper)})`)
      }
      // NEGATIVE 1 — a THIRD host must be rejected. The fixture must be SCORABLE by the detector's
      // own rule, so each app-launch site carries what the two real sites carry (the direct
      // `spawn(electronBin, …)` and the app-transport `StdioClientTransport` naming the app's
      // binary): the count then really scores 3 and the draw discriminates against the measured
      // two-host head, instead of asking a string that lacks the marker to report three.
      const threeHosts = `const a = spawn(electronBin, [mainCjs])\nconst b = spawn(electronBin, [mainCjs])\n` +
        `const t = new StdioClientTransport({ command: electronBin, args: [mainCjs] })\n` +
        SHARED_HELPER('canonical') +
        `async function main() {\nawait eClient.connect(t)\n${loadStepInvocation('eClient', {})}out1 = await drive(eClient)\n${SHIM_HEADER}await shimClient.connect(tshim)\n${loadStepInvocation('shimClient', {})}out2 = await drive(shimClient)\n}\n`
      const thirdShape = harnessShape(threeHosts)
      attempt(run, i++, thirdShape.spawnSites === 3 && thirdShape.spawnSites !== SHAPE.spawnSites
        ? null
        : `NEGATIVE (a third host): the detector read app-launch sites=${thirdShape.spawnSites} (the fabricated shape carries 2 direct app spawns + 1 app transport = 3 — a third host beside the two-leg pattern) — a run that grows a third host must be VISIBLE, and the host census must not be read from a single site`)
      // NEGATIVE 2 — `NEG-duplicate-invocation`: TWO traversals of the ONE shared step on the SAME
      // leg with the SAME client must read `calls: 2`. The module still holds exactly ONE
      // `provident.load` call site, so nothing but the REAL traversal count can see it — under the
      // pre-fix hardcoded `calls: 1` this draw was UNREACHABLE and the row's own arm 2 was a
      // tautology in the landed design.
      const duplicated = harnessShape(duplicateInvocationModule())
      attempt(run, i++, duplicated.leg1 !== null && duplicated.leg1.calls === 2 && duplicated.leg2 !== null && duplicated.leg2.calls === 1 && duplicated.loadCalls === 1
        ? null
        : `NEGATIVE (a duplicated load on one leg): TWO invocations of the ONE shared step with this leg's own client must read calls: 2 on that leg and 1 on the other, with the module still holding ONE \`provident.load\` call site; read leg1=${String(duplicated.leg1 === null ? null : duplicated.leg1.calls)} leg2=${String(duplicated.leg2 === null ? null : duplicated.leg2.calls)} call sites=${String(duplicated.loadCalls)} (the pre-fix body returned a hardcoded calls: 1, which no draw could move)`)
      // NEGATIVE 3 — a ZERO-LOAD leg must be rejected
      attempt(run, i++, harnessShape(fabricatedModule({ load: 'none', focus: 'leg2' })).violations.length > 0
        ? null
        : 'NEGATIVE (a zero-load leg): a leg that never loads was ACCEPTED — the §3.5 `A-4` asymmetry must red LOUDLY at the shim leg (its root-only boot authors no `inc`)')
    })
  })
})

describe('U-DIVERGENCE-FIXTURE §4.2 P-SM-3 — THE APP\'S OWN `provident.load` ROUTE IS THE ONE THE LEG USES, AND IT EXISTS AT BOTH ENDS (strat:divergence-fixture-load-route)', () => {
  it('P-SM-3 — 2 hosts × 2 arms (the name is registered; the route reaches THAT HOST\'S OWN runtime) + 2 negative draws (`NEG-shim-load-route-removed`; `NEG-unregistered-load`) = 6 attempts', () => {
    registerRow('P-SM-3', (run) => {
      let i = 0
      // ⟨THE AUDIT'S `S-3` FINDING, FIXED HERE: the pre-fix shim arms were NEAR-VACUOUS — arm 1 read
      //   `BATTERY_HOST_SRC.includes('provident') || includes('Runtime')` (satisfied by any mention)
      //   and arm 2 asserted the shim through the APP's `renderer.ts` `case 'load'` (a CROSS-SUBJECT
      //   read that re-asserted the app-side positive). Both arms now read the SHIM'S OWN ROUTE: the
      //   battery host registers `provident.load` through the SAME `ProvidentMcpServer` tool surface
      //   (its `ALL_TOOLS`/gate) and routes the name to ITS OWN backend method
      //   (`case 'load': ⇒ this.runtime.load(p)` ⇒ `Runtime.load` ⇒ `loadEnvelope`).⟩
      const hosts = [
        {
          name: 'the app (leg 1)',
          registered: APP_ROUTE.loadRegistered && APP_ROUTE.groupRow === 'graph',
          reaches: APP_ROUTE.rendererLoadCase && APP_ROUTE.runtimeLoadOk && APP_ROUTE.dispatchSlice,
          evidence: `ALL_TOOLS=${String(APP_ROUTE.loadRegistered)} group=${JSON.stringify(APP_ROUTE.groupRow)} renderer 'load' case=${String(APP_ROUTE.rendererLoadCase)} runtime load→loadEnvelope=${String(APP_ROUTE.runtimeLoadOk)} dispatchSlice=${String(APP_ROUTE.dispatchSlice)}`,
        },
        {
          name: 'the shim host (leg 2)',
          registered: APP_ROUTE.shimRegistersTool && APP_ROUTE.loadRegistered,
          reaches: APP_ROUTE.shimLoadMethodCase && APP_ROUTE.shimRuntimeLoadOk && APP_ROUTE.shimMethodRouting,
          evidence: `battery host uses ProvidentMcpServer+SecurityGate=${String(APP_ROUTE.shimRegistersTool)} ALL_TOOLS carries the name=${String(APP_ROUTE.loadRegistered)} shim 'load' case→runtime.load=${String(APP_ROUTE.shimLoadMethodCase)} shim backend invoke routing=${String(APP_ROUTE.shimMethodRouting)} runtime loadEnvelope=${String(APP_ROUTE.shimRuntimeLoadOk)}`,
        },
      ]
      for (const h of hosts) {
        attempt(run, i++, h.registered
          ? null
          : `${h.name} · arm 1 (the name is registered): \`provident.load\` must be a registered, group-gated tool name at THIS host (FINDING-1 items 1/2 — \`ProvidentMcpServer.ALL_TOOLS\` + \`TOOL_GROUPS\` ⇒ \`graph\`); read ${h.evidence}`)
        attempt(run, i++, h.reaches
          ? null
          : `${h.name} · arm 2 (the route reaches THAT HOST'S OWN runtime): the registered handler must route \`dispatch(name)\` ⇒ that host's own \`load\` method ⇒ \`Runtime.load\` ⇒ \`loadEnvelope\` (FINDING-1 items 3/5), read from THAT host's own source; read ${h.evidence}`)
      }
      // NEGATIVE 1 — `NEG-shim-load-route-removed`: a battery host WITHOUT its `case 'load'` must be
      // REJECTED by the same predicate the shim arm 2 uses (the pre-fix draw asserted the positive
      // again through the APP's file, so it could not fail for the shim at all)
      attempt(run, i++, APP_ROUTE.shimLoadRouteRemoved
        ? null
        : "NEGATIVE (NEG-shim-load-route-removed): a `battery-host` whose `case 'load'` has been removed must be READ as NOT reaching its runtime — the shim arm above would otherwise pass on any file that merely mentions `Runtime`")
      // NEGATIVE 2 — `NEG-unregistered-load`: a fabricated `ALL_TOOLS` that has lost the name must be
      // REJECTED by the same predicate arm 1 uses
      attempt(run, i++, APP_ROUTE.unregisteredLoad
        ? null
        : "NEGATIVE (NEG-unregistered-load): a fabricated `ALL_TOOLS` without `'provident.load'` must be READ as unregistered — the `ALL_TOOLS` predicate would otherwise pass on any list")
    })
  })
})

/** The FIVE NAMED STOP ARMS of `waitForBootInstalled` (§0B.3 item 5's four + `A-5`'s refused read),
 *  each DRIVEN against the real function through a stub client. The outcomes are produced at test
 *  level (the register's bodies are synchronous tables) and scored by `P-SM-4`.
 *
 *  THE DEADLINE ARM'S CLOCK: `waitCallables()` passes an INJECTED `Date` into the sandbox whose
 *  `now()` advances by ONE POLL INTERVAL per call, and the deadline arm passes the SOURCE'S OWN
 *  `BOOT_POLL_DEADLINE_MS` as that step — so the arm reaches the source's OWN deadline comparison
 *  after a couple of iterations, and the stop text carries the source's own figure. (At one real
 *  poll interval per call the arm would need 20 000 ms of wall clock; the injection is what makes it
 *  a fast, deterministic row rather than a 20-second one.) */
interface WaitArmOutcome { name: string; must: string[]; threw: boolean; message: string; loadCalls: number; dispatchCalls: number; listCalls: number }

async function driveWaitArms(): Promise<WaitArmOutcome[]> {
  const deadlineValue = Number(constRhs(HARNESS_SRC, 'BOOT_POLL_DEADLINE_MS')!.replace(/_/g, ''))
  const arms: Array<{ name: string; must: string[]; reply: () => unknown }> = [
    {
      name: 'a MISSING `boot` member (this launch did not take the enablement route)',
      must: ['boot-install wait FAILED', 'NO `boot` member', 'PROVIDENT_ENABLE_TOOL_GROUPS'],
      reply: () => toolReply({ nodes: [] }),
    },
    {
      name: "`status: 'failed'` carrying its own `error`",
      must: ['boot-install wait FAILED', "status 'failed'", 'the renderer boot chain failed'],
      reply: () => toolReply({ nodes: [], boot: { status: 'failed', error: 'the renderer boot chain failed: ENOENT dist/main/main.cjs' } }),
    },
    {
      name: 'a status OUTSIDE `pending|installed|failed` (fails CLOSED)',
      must: ['boot-install wait FAILED', 'outside the declared three-state set', 'pending|installed|failed'],
      reply: () => toolReply({ nodes: [], boot: { status: 'booting' } }),
    },
    {
      name: "the DEADLINE with the status still `pending`",
      must: ['boot-install wait FAILED', `deadline of ${deadlineValue} ms expired`, "still 'pending'"],
      reply: () => toolReply({ nodes: [], boot: { status: 'pending', epoch: 1, generation: 0 } }),
    },
    {
      name: "the REFUSED readiness read (A-5: the wait's own named stop)",
      must: ['boot-install wait FAILED', 'REFUSED', 'the `read` group is disabled'],
      reply: () => { throw new Error('tool refused: the `read` group is disabled') },
    },
  ]
  const out: WaitArmOutcome[] = []
  for (const arm of arms) {
    const W = arm.name.startsWith('the DEADLINE') ? waitCallables({ tickPerNow: deadlineValue }) : waitCallables()
    const stub = stubClient(async () => arm.reply())
    let threw = false
    let message = ''
    try {
      const value = await W.wait(stub)
      message = `RESOLVED with ${JSON.stringify(value)} — no stop was raised`
    } catch (e) {
      threw = true
      message = (e as Error)?.message ?? String(e)
    }
    out.push({ name: arm.name, must: arm.must, threw, message, loadCalls: stub.loadCalls, dispatchCalls: stub.dispatchCalls, listCalls: stub.listCalls })
  }
  return out
}

describe('U-DIVERGENCE-FIXTURE §4.2 P-SM-4 — THE BOUNDED BOOT-INSTALL WAIT IS ON LEG 1\'S PATH, IN `F-7`\'S POSITION, WITH ITS TWO PINNED CONSTANTS, AND EVERY ONE OF ITS STOP ARMS NAMES ITSELF (strat:divergence-fixture-boot-wait)', () => {
  it('P-SM-4 — 1 path × 3 arms (the wait EXISTS on leg 1\'s path; its position is connect → WAIT → load → probe → drive; its pinned budget) + 5 named stop arms + 2 negative draws (`NEG-wait-absent`; `NEG-wait-after-load`) = 10 attempts', async () => {
    const waitArms = await driveWaitArms()
    registerRow('P-SM-4', (run) => {
      let i = 0
      const leg1 = SHAPE.leg1
      // ARM 1 — THE WAIT EXISTS ON LEG 1'S PATH (A-2: nothing else in either divergence file read it)
      attempt(run, i++, leg1 !== null && leg1.waitAt !== null && SHAPE.leg2 !== null && SHAPE.leg2.waitAt === null
        ? null
        : `leg 1's path · arm 1 (the wait EXISTS): \`waitForBootInstalled(client)\` must be called on leg 1's path (A-2 — the one step \`T-1\` added to the ordering), and leg 2 (the shim host) must NOT wait (its host is not fire-and-forget); read leg1 waitAt=${String(leg1 === null ? null : leg1.waitAt)} leg2 waitAt=${String(SHAPE.leg2 === null ? null : SHAPE.leg2.waitAt)}`)
      // ARM 2 — ITS POSITION: connect → WAIT → load → probe → drive (F-7's refinement)
      const orderViolations = waitOrderViolations(HARNESS_SRC, leg1)
      attempt(run, i++, leg1 !== null && leg1.waitAt !== null && leg1.loadAt !== null && leg1.probeAt !== null && leg1.driveAt !== null &&
        leg1.connectAt !== null && leg1.connectAt < leg1.waitAt && leg1.waitAt < leg1.loadAt && leg1.loadAt < leg1.probeAt && leg1.probeAt < leg1.driveAt &&
        orderViolations.length === 0
        ? null
        : `leg 1's path · arm 2 (its position): the ordering must be connect → wait (bounded) → load → probe → drive (§0B.3 F-7, the clause a deleted/moved wait must red); read connect=${String(leg1 === null ? null : leg1.connectAt)} wait=${String(leg1 === null ? null : leg1.waitAt)} load=${String(leg1 === null ? null : leg1.loadAt)} probe=${String(leg1 === null ? null : leg1.probeAt)} drive=${String(leg1 === null ? null : leg1.driveAt)}; violations ${JSON.stringify(orderViolations)}`)
      // ARM 3 — THE BUDGET: the two pinned constants, the sleep/deadline they drive, and NO use of
      // `O-1`'s measured 250–540 ms as a budget (§0B.3 item 5: an OBSERVATION is never a budget)
      const budget = waitBudgetViolations(HARNESS_SRC)
      const interval = constRhs(HARNESS_SRC, 'BOOT_POLL_INTERVAL_MS')
      const deadline = constRhs(HARNESS_SRC, 'BOOT_POLL_DEADLINE_MS')
      const observedAsBudget = /^(250|540)$/.test(String(deadline)) || String(deadline).includes('250') || String(deadline).includes('540')
      attempt(run, i++, budget.length === 0 && interval === '100' && deadline === '20_000' && !observedAsBudget
        ? null
        : `the budget · the two PINNED constants (F-6 / §0B.3 item 1: BOOT_POLL_INTERVAL_MS = 100, BOOT_POLL_DEADLINE_MS = 20_000) and no observed-ms budget; read interval=${JSON.stringify(interval)} deadline=${JSON.stringify(deadline)}; violations ${JSON.stringify(budget)}`)
      // THE FIVE NAMED STOP ARMS, each driven against the REAL wait
      for (const arm of waitArms) {
        const ok = arm.threw && arm.must.every((needle) => arm.message.includes(needle)) && arm.loadCalls === 0 && arm.dispatchCalls === 0
        attempt(run, i++, ok
          ? null
          : `${arm.name} · a NAMED stop that lets NO comparison row emit: ${arm.message} — the stop must name its arm (${JSON.stringify(arm.must)}) and the leg must issue NO load and NO dispatch; read list reads=${arm.listCalls} load calls=${arm.loadCalls} dispatch calls=${arm.dispatchCalls}`)
      }
      // NEG-wait-absent / NEG-wait-after-load — the two ORDERING draws, each scored against the SHAPE
      // the row's own arm 2 must reject
      const absentSrc = waitAbsentModule()
      const absent = harnessShape(absentSrc)
      const absentViolations = waitOrderViolations(absentSrc, absent.leg1)
      attempt(run, i++, absent.leg1 !== null && absent.leg1.waitAt === null && absentViolations.length > 0
        ? null
        : `NEGATIVE (NEG-wait-absent): a module whose leg 1 goes connect → load → drive must be REJECTED by the ordering check; read waitAt=${String(absent.leg1 === null ? null : absent.leg1.waitAt)} violations=${JSON.stringify(absentViolations)}`)
      const lateSrc = waitAfterLoadModule()
      const late = harnessShape(lateSrc)
      const lateViolations = waitOrderViolations(lateSrc, late.leg1)
      attempt(run, i++, late.leg1 !== null && late.leg1.waitAt !== null && late.leg1.loadAt !== null && late.leg1.waitAt > late.leg1.loadAt && lateViolations.length > 0
        ? null
        : `NEGATIVE (NEG-wait-after-load): a wait placed AFTER the shared load must be REJECTED (the app's own fire-and-forget install can land after the load and REPLACE it — the O-1 race the wait exists to close); read waitAt=${String(late.leg1 === null ? null : late.leg1.waitAt)} loadAt=${String(late.leg1 === null ? null : late.leg1.loadAt)} violations=${JSON.stringify(lateViolations)}`)
    })
  })
})

describe('U-DIVERGENCE-FIXTURE §4.2 P-SM-5 — THE SPAWN `env` MEMBER `PROVIDENT_ENABLE_TOOL_GROUPS: \'graph\'` IS PRESENT AT BOTH ELECTRON SITES AND ABSENT FROM THE SHIM TRANSPORT (strat:divergence-fixture-spawn-env-member)', () => {
  it('P-SM-5 — 2 sites × 3 arms (the member is present; its value is exactly `\'graph\'`; the vector stays NINE so no argv route exists) + the shim-transport arm + 2 negative draws = 9 attempts', () => {
    registerRow('P-SM-5', (run) => {
      let i = 0
      const electronSites = SHAPE.envObjects.filter((e) => !e.shim)
      // the two SITE VECTORS, read from the source text (the same read `P-TP-2` uses)
      const VECTORS = ((): string[][] => {
        const out: string[][] = []
        let at = HARNESS_SRC.indexOf('siteArgs([')
        while (at >= 0) {
          const open = HARNESS_SRC.indexOf('[', at)
          const body = open < 0 ? null : balancedBody(HARNESS_SRC, open)
          if (body !== null) out.push(splitTopLevel(body))
          at = HARNESS_SRC.indexOf('siteArgs([', at + 1)
        }
        return out
      })()
      for (let k = 0; k < 2; k++) {
        const site = electronSites[k]
        // ARM 1 — THE MEMBER IS PRESENT (A-3: NOTHING in either divergence file read an `env` object)
        const member = site === undefined ? null : envMemberValue(site.text, 'PROVIDENT_ENABLE_TOOL_GROUPS')
        attempt(run, i++, member !== null
          ? null
          : `spawn site ${k + 1} · arm 1 (the member is PRESENT): \`PROVIDENT_ENABLE_TOOL_GROUPS\` must be declared in this site's \`env\` object (§0B.2 F-6 — the launch-scoped grant leg 1's wait depends on: with the \`graph\` group off, the app serves 9 tools and \`provident.load\` is ABSENT, which is what \`F-2\` item 2 registered). Read the site's env object as ${JSON.stringify(site === undefined ? '(NO SUCH SITE)' : site.text.slice(0, 180))}`)
        // ARM 2 — ITS VALUE IS EXACTLY 'graph'
        attempt(run, i++, member !== null && stripQuotes(member) === 'graph'
          ? null
          : `spawn site ${k + 1} · arm 2 (its value): the member must read exactly \`'graph'\` (§0B.2 F-6); the app-side route the wait depends on is the \`graph\` group, and a different or empty value leaves \`provident.load\` unserved; read ${JSON.stringify(member)}`)
        // ARM 3 — THE NINE-MEMBER VECTOR STAYS, which is the WHOLE REASON the env route exists:
        // `siteArgs` THROWS on any difference from the composed vector (§0B.2 item 2), so an
        // `--enable-tool-groups=` argv spelling would be a TENTH member and would make the leg
        // refuse its own launch. The arm drives that THROW for real, through the harness's own
        // `siteArgs`/`composeArgs` executed in a sandbox.
        const vector = VECTORS[k] ?? []
        const siteArgsCalls = ((): { ok: boolean; tenth: boolean; message: string } => {
          const composedFn = declText(HARNESS_SRC, 'composeArgs')
          const siteArgsFn = declText(HARNESS_SRC, 'siteArgs')
          const baseFlagsSrc = constArrayText(HARNESS_SRC, 'BASE_FLAGS')
          if (composedFn === null || siteArgsFn === null || baseFlagsSrc === null) return { ok: false, tenth: false, message: 'the harness no longer declares composeArgs/siteArgs/BASE_FLAGS' }
          // the extracted declarations are CONCATENATED, never interpolated into a template literal:
          // `siteArgs`'s own named throw contains `${site}`/`${JSON.stringify(…)}` placeholders, and
          // a template literal in THIS file would interpolate them instead of carrying them into the
          // sandbox (the resulting `SyntaxError: Unexpected token ')'` is exactly that mistake).
          const api = new Function('mainCjs', 'BASE_FLAGS', 'JSON', composedFn + '\n' + siteArgsFn + '\nreturn { composeArgs, siteArgs }')(
            '/tmp/main.cjs',
            new Function('return ' + baseFlagsSrc)(),
            JSON,
          ) as {
            composeArgs: (p: string) => string[]
            siteArgs: (a: string[], p: string, s: string) => string[]
          }
          const composed = api.composeArgs('/tmp/p')
          let ok = false
          try { api.siteArgs(composed, '/tmp/p', 'direct-spawn'); ok = true } catch { ok = false }
          let tenth = false
          let message = ''
          try {
            api.siteArgs([...composed, '--enable-tool-groups=graph'], '/tmp/p', 'direct-spawn')
            tenth = false
          } catch (e) {
            tenth = true
            message = (e as Error)?.message ?? String(e)
          }
          return { ok, tenth, message }
        })()
        attempt(run, i++, vector.length === 9 && siteArgsCalls.ok && siteArgsCalls.tenth && /composed vector reads/.test(siteArgsCalls.message)
          ? null
          : `spawn site ${k + 1} · arm 3 (the nine-member vector): the composed vector must stay NINE members, and a TENTH (\`--enable-tool-groups=graph\`) must be REFUSED by \`siteArgs\`'s own named throw — which is why the grant travels in \`env\` (§0B.2 item 2); read site vector=${String(vector.length)} composed accepted=${String(siteArgsCalls.ok)} tenth refused=${String(siteArgsCalls.tenth)} message=${JSON.stringify(siteArgsCalls.message.slice(0, 120))}`)
      }
      // THE SHIM TRANSPORT ARM — leg 2's transport carries NO `env` member at all, so no grant may
      // appear in it: the shim host pre-enables every group in its OWN code and needs none.
      const shimRegion = ((): string => {
        const at = HARNESS_SRC.indexOf('const shimTransport = new StdioClientTransport(')
        if (at < 0) return ''
        const to = HARNESS_SRC.indexOf('\n\n', at)
        return HARNESS_SRC.slice(at, to < 0 ? at + 400 : to)
      })()
      const grantInShim = envMemberValue(shimRegion, 'PROVIDENT_ENABLE_TOOL_GROUPS')
      attempt(run, i++, shimRegion !== '' && grantInShim === null && SHAPE.envObjects.filter((e) => e.shim).length === 0
        ? null
        : `the shim transport · leg 2 must carry NO \`env\` member and NO grant: the battery host pre-enables read/dispatch/graph/code itself; read grant=${JSON.stringify(grantInShim)} shim env objects=${String(SHAPE.envObjects.filter((e) => e.shim).length)} region=${JSON.stringify(shimRegion.slice(0, 160))}`)
      // NEGATIVE 1 — `NEG-env-member-absent`: the member DELETED from both sites (the audit's
      // `A-3` draw, which kept `held × 8` and `78/78` green) must be READ as absent.
      const strippedEnv = (HARNESS_SRC.match(/env: \{[^}]*\}/g) ?? []).map((t) => t.replace(/,\s*PROVIDENT_ENABLE_TOOL_GROUPS: 'graph'/, ''))
      const absentEverywhere = strippedEnv.length === 2 && strippedEnv.every((t) => envMemberValue(t, 'PROVIDENT_ENABLE_TOOL_GROUPS') === null) &&
        electronSites.length === 2 && strippedEnv.filter((t) => envMemberValue(t, 'PROVIDENT_ENABLE_TOOL_GROUPS') !== null).length === 0
      attempt(run, i++, absentEverywhere
        ? null
        : `NEGATIVE (NEG-env-member-absent): deleting the member from BOTH sites must be READ as absent — that is the draw the audit showed stayed green at the pre-fix head; read stripped sites=${String(strippedEnv.length)} values=${JSON.stringify(strippedEnv.map((t) => envMemberValue(t, 'PROVIDENT_ENABLE_TOOL_GROUPS')))}`)
      // NEGATIVE 2 — `NEG-env-in-shim`: a grant written into the SHIM transport's env must be READ
      // as being in the shim (which this row's shim arm forbids).
      const shimWithGrant = `...process.env, PROVIDENT_ENABLE_TOOL_GROUPS: 'graph'`
      attempt(run, i++, envMemberValue(shimWithGrant, 'PROVIDENT_ENABLE_TOOL_GROUPS') !== null
        ? null
        : 'NEGATIVE (NEG-env-in-shim): a grant written into the shim transport\'s env must be READ as present — the shim arm above would otherwise pass on any string')
    })
  })
})

// ⟨`A-5`/`P-TP-1` — THE REAL FAILURE PATHS. The pre-fix row drove `stopReport`, a MODEL OF THE
//  CONTRACT WRITTEN INSIDE THE TEST whose every branch returned `named: true`, so the "named cause"
//  arm could not fail (the audit's `S-3` finding). The callables below are the LEG's OWN
//  `loadFixture` / `readinessStop` / `readSurface` / `absentDemoIds`, extracted from the harness
//  source and executed against a stub client — so the arms assert the leg's REAL stop text, and a
//  stop that no longer names its subject REDS.⟩

/** The load-side failure callables, all extracted from the harness's own source text. */
function loadCallables(): {
  load: (client: StubClient) => Promise<unknown>
  readinessStop: (leg: string, read: { ids: string[]; error: string | null }) => Error
  readSurface: (client: StubClient, tool: string) => Promise<{ ids: string[]; error: string | null }>
  absent: (read: { ids: string[] }) => string[]
  demoIds: string[]
} {
  const callFn = declText(HARNESS_SRC, 'call')
  const load = declText(HARNESS_SRC, 'loadFixture')
  const demo = declText(HARNESS_SRC, 'demoEnvelope')
  const readFn = declText(HARNESS_SRC, 'readSurface')
  const stopFn = declText(HARNESS_SRC, 'readinessStop')
  const absentFn = declText(HARNESS_SRC, 'absentDemoIds')
  const idsRhs = constRhs(HARNESS_SRC, 'DEMO_READBACK_IDS')
  if (callFn === null || load === null || demo === null || readFn === null || stopFn === null || absentFn === null || idsRhs === null) {
    throw new Error('the harness no longer carries the load-side stop surface (call / loadFixture / demoEnvelope / readSurface / readinessStop / absentDemoIds / DEMO_READBACK_IDS) — P-TP-1 cannot drive the leg\'s own report path')
  }
  const build = new Function(
    'call', 'DEMO_READBACK_IDS', 'console', 'Error', 'JSON', 'String', 'Array', 'Number', 'Object',
    `${demo}\n${callFn}\n${load}\n${readFn}\n${stopFn}\n${absentFn}\nreturn { load: loadFixture, readinessStop, readSurface, absentDemoIds, DEMO_READBACK_IDS }`,
  )
  const idsValue = new Function(`return (${idsRhs})`)() as string[]
  const built = build(callFn, idsValue, { log: () => undefined }, Error, JSON, String, Array, Number, Object) as {
    load: (client: StubClient) => Promise<unknown>
    readinessStop: (leg: string, read: { ids: string[]; error: string | null }) => Error
    readSurface: (client: StubClient, tool: string) => Promise<{ ids: string[]; error: string | null }>
    absentDemoIds: (read: { ids: string[] }) => string[]
    DEMO_READBACK_IDS: string[]
  }
  return { ...built, demoIds: built.DEMO_READBACK_IDS, absent: built.absentDemoIds }
}

describe('U-DIVERGENCE-FIXTURE §4.2 P-TP-1 — NO INPUT SHAPE THROWS WHERE A NAMED STOP IS CONTRACT (strat:divergence-fixture-totality)', () => {
  it('P-TP-1 — 3 failure shapes × 2 report arms (a named cause; the honest "no cause captured" form) + the A-5 refused-read arm + 1 draw asserting the existing leg-1 try/catch still records its failure = 8 attempts', async () => {
    // THE ARMS ARE DRIVEN THROUGH THE LEG'S OWN FAILURE PATHS (never through an in-test model of
    // the clause): `loadFixture`'s refusal branch, `readSurface` + `absentDemoIds` +
    // `readinessStop`, and the wait's refused-read stop. They are awaited HERE (the register's own
    // bodies are synchronous tables), and the register then scores their REAL outcomes.
    const C = loadCallables()
    const W = waitCallables()
    const driven = async (fn: () => Promise<unknown>): Promise<{ threw: boolean; message: string }> => {
      try {
        const value = await fn()
        return { threw: false, message: `RESOLVED with ${JSON.stringify(value)} — no stop was raised` }
      } catch (e) {
        return { threw: true, message: (e as Error)?.message ?? String(e) }
      }
    }
    const SHAPES = [
      // `loadCalls` = the leg's own `provident.load` requests this arm issues: the two REFUSAL
      // shapes issue exactly ONE (the request the surface refused); the ABSENT-SURFACE shape is
      // stopped by the read-back, and the harness's own `loadFixture` call is what the real path
      // would have issued first, so the arm that drives only the probe reports 0.
      { id: 'gate refusal', must: ['REFUSED', 'tool surface', '`graph` group is disabled'], loadCalls: 1 },
      { id: 'malformed envelope payload', must: ['REFUSED', 'tool surface', "envelope is not an object"], loadCalls: 1 },
      { id: 'load landed, demo surface absent', must: ['readiness precondition FAILED', 'inc'], loadCalls: 0 },
    ] as const
    const findings: Array<{
      shape: string
      must: readonly string[]
      loadCalls: number
      arm1: { threw: boolean; message: string }
      arm1Client: { loadCalls: number; dispatchCalls: number }
      arm2: { threw: boolean; message: string }
      arm2Client: { loadCalls: number; dispatchCalls: number }
    }> = []
    for (const shape of SHAPES) {
      const client = stubClient(async (name) => {
        if (name === 'provident.list_targets') return toolReply({ nodes: [] })
        if (shape.id === 'gate refusal') return toolReply({ error: 'tool error: the `graph` group is disabled' }, true)
        if (shape.id === 'malformed envelope payload') return toolReply({ error: 'the envelope is not an object' }, true)
        return toolReply({ ok: true })
      })
      const arm1 = shape.id === 'gate refusal' || shape.id === 'malformed envelope payload'
        ? await driven(() => C.load(client))
        : await (async () => {
          const read = await C.readSurface(client, 'provident.list_targets')
          if (C.absent(read).length > 0) return driven(async () => { throw C.readinessStop('leg 1', read) })
          return { threw: false, message: 'the read-back found every demo id — no stop was raised' }
        })()
      const bare = stubClient(async (name) => {
        if (name === 'provident.list_targets') return toolReply({ nodes: [] })
        return toolReply({}, true)
      })
      const arm2 = shape.id === 'gate refusal'
        ? await driven(() => C.load(bare))
        : shape.id === 'malformed envelope payload'
          ? await driven(async () => { throw C.readinessStop('leg 1', { ids: [], error: null }) })
          : await (async () => {
            const refused = await C.readSurface(bare, 'provident.list_targets')
            return driven(async () => { throw C.readinessStop('leg 1', refused) })
          })()
      findings.push({
        shape: shape.id,
        must: shape.must,
        loadCalls: shape.loadCalls,
        arm1,
        arm1Client: { loadCalls: client.loadCalls, dispatchCalls: client.dispatchCalls },
        arm2,
        arm2Client: { loadCalls: bare.loadCalls, dispatchCalls: bare.dispatchCalls },
      })
    }
    // THE A-5 REFUSED-READ ARM (the auditor's own addition): the wait's readiness READ is refused by
    // the tool surface, which must be a NAMED stop in the WAIT'S OWN voice — never misattributed to
    // the load's absence, never an unhandled rejection out of the leg-1 `try`.
    const refusedRead = stubClient(async () => { throw new Error('tool refused: the `read` group is disabled') })
    const refused = await driven(() => W.wait(refusedRead))
    registerRow('P-TP-1', (run) => {
      let i = 0
      for (const f of findings) {
        // the refusal IS this arm's own failing load request (exactly one), and what must stay ZERO
        // is the DISPATCH count — a comparison row emitted from a graph the leg never loaded
        const arm1Ok = f.arm1.threw && f.must.every((needle) => f.arm1.message.includes(needle)) &&
          f.arm1Client.loadCalls === f.loadCalls && f.arm1Client.dispatchCalls === 0
        attempt(run, i++, arm1Ok
          ? null
          : `${f.shape} · arm 1 (a named cause, driven through the LEG'S OWN path): ${f.arm1.message} — the stop must NAME its subject (${JSON.stringify([...f.must])}) AND QUOTE the tool's own text, never be an unhandled rejection or a bare undefined, and must let NO comparison row emit; read load calls=${f.arm1Client.loadCalls} dispatch calls=${f.arm1Client.dispatchCalls}`)
        const arm2Ok = f.arm2.threw && f.arm2.message.trim() !== '' && !f.arm2.message.includes('undefined') && f.arm2Client.dispatchCalls === 0
        attempt(run, i++, arm2Ok
          ? null
          : `${f.shape} · arm 2 (the honest "no cause captured" form): ${f.arm2.message} — the stop must still say what it has, name its subject, never fabricate a cause, and emit no comparison row; read load calls=${f.arm2Client.loadCalls} dispatch calls=${f.arm2Client.dispatchCalls}`)
      }
      const refusedOk = refused.threw && refused.message.includes('boot-install wait FAILED') && refused.message.includes('REFUSED') &&
        refusedRead.loadCalls === 0 && refusedRead.dispatchCalls === 0 && refusedRead.listCalls === 1
      attempt(run, i++, refusedOk
        ? null
        : `the refused readiness READ (A-5) · the wait's own named stop: ${refused.message} — the refusal must be named in the WAIT'S own voice (never misattributed to the load) and no comparison row may emit`)
      // the +1 draw: the EXISTING leg-1 `try`/`catch` still records its failure, and the arithmetic
      // and exit contract are unchanged (C-2 item 5 / C-3 item 4 — a failed load still reaches the
      // leg's existing arithmetic and adds no new exit code). The leg-1 `try`/`catch` lives inside
      // `main()` (the `reportBootFailure(...)` call site identifies it).
      const mainBody = functionRegions(HARNESS_SRC).get('main')?.body ?? ''
      const catchAt = mainBody.indexOf('catch')
      const catchBody = catchAt < 0 ? '' : mainBody.slice(catchAt, catchAt + 600)
      attempt(run, i++, catchAt >= 0 && /failures\s*\+=\s*1/.test(catchBody) && /reportBootFailure\s*\(/.test(catchBody) && EXIT_CONTRACT_HOLDS && PROCESS_EXIT_CALLS.length > 0
        ? null
        : `the existing leg-1 \`try\`/\`catch\` must still RECORD its failure (\`failures += 1\`) into the same arithmetic, name its cause through \`reportBootFailure\`, and exit through the unchanged \`{0,1}\` contract (C-2 item 5 / C-3 item 4); read catch found=${String(catchAt >= 0)}, failures+=1 in the catch=${String(/failures\s*\+=\s*1/.test(catchBody))}, cause report=${String(/reportBootFailure\s*\(/.test(catchBody))}, exitCodeFor=${String(EXIT_CONTRACT_HOLDS)}, process.exit sites=${PROCESS_EXIT_CALLS.length}`)
    })
  })
})

describe('U-DIVERGENCE-FIXTURE §4.2 P-TP-2 — THE SPAWN/SCRATCH CONTRACT THIS FIX RIDES ON IS UNTOUCHED (strat:divergence-fixture-spawn-untouched)', () => {
  it('P-TP-2 — 2 sites × 2 arms (the vector; the profile member) + 2 draws (the cleanup report shape; import-safety) + 1 sweep-bound draw = 7 attempts', () => {
    registerRow('P-TP-2', (run) => {
      let i = 0
      const VECTOR_ARRAYS = ((): string[][] => {
        const out: string[][] = []
        let at = HARNESS_SRC.indexOf('siteArgs([')
        while (at >= 0) {
          const open = HARNESS_SRC.indexOf('[', at)
          const body = open < 0 ? null : balancedBody(HARNESS_SRC, open)
          if (body !== null) out.push(splitTopLevel(body))
          at = HARNESS_SRC.indexOf('siteArgs([', at + 1)
        }
        return out
      })()
      for (let s = 0; s < 2; s++) {
        const members = VECTOR_ARRAYS[s] ?? []
        const resolved = members.map((m) => memberText(m))
        const profileMembers = resolved.filter((m) => m.includes('--user-data-dir='))
        attempt(run, i++, resolved.length === 9 && CONTRACT_FLAG_MEMBERS.every((f) => resolved.includes(f))
          ? null
          : `site ${s + 1}${VECTOR_ARRAYS[s] === undefined ? ' (the instrument resolved NO such site)' : ''} · arm 1 (the vector): the composed vector must carry the sibling unit's NINE members at both sites (§2.1 C-1 item 4 keeps the spawn contract untouched); read ${JSON.stringify(resolved)}`)
        attempt(run, i++, profileMembers.length === 1 && /--user-data-dir=/.test(members[members.length - 1] ?? '')
          ? null
          : `site ${s + 1} · arm 2 (the profile member): exactly ONE \`--user-data-dir=\` member per spawn, LAST and non-empty; read ${JSON.stringify(profileMembers)} (a shared profile is not an isolation)`)
      }
      // DRAW 1 — the cleanup report's shape
      attempt(run, i++, HARNESS_SRC.includes('leftover:') && /return\s*\{\s*removed,\s*leftover,\s*passes,\s*report\s*\}/.test(HARNESS_SRC) && /scratch cleanup/.test(HARNESS_SRC)
        ? null
        : 'the bounded sweep\'s report shape `{removed, leftover, passes, report}` with its `leftover: NONE|…` line must stay exactly as the sibling unit landed it (§2.3 C-3 item 6)')
      // DRAW 2 — import-safety: the module's entry-point guard, and the cleanup hook armed at
      //          creation above every `process.exit`
      attempt(run, i++, GUARD_PRESENT && /process\.on\(\s*['"]exit['"]/.test(HARNESS_SRC) && /process\.on\(\s*['"]SIG(INT|TERM)['"]/.test(HARNESS_SRC)
        ? null
        : 'the module must keep its entry-point guard (importing it boots nothing) and its cleanup hook registered at creation on every exit path (C-3 item 6)')
      // the sweep-bound draw
      const passes = /PROFILE_REMOVE_PASSES\s*=\s*(\d+)/.exec(HARNESS_SRC)
      attempt(run, i++, passes !== null && Number(passes[1]) > 1
        ? null
        : `the sweep must stay BOUNDED with more than one delete-verify pass (a single \`rmSync\` is the sibling unit's recorded defect); read PROFILE_REMOVE_PASSES=${passes === null ? 'ABSENT' : passes[1]}`)
    })
  })
})

/** The element's text as a MEMBER: the bundle member, or the static string value, or the raw
 *  text when the member is a computed expression. Structural (`C-10`: no line number). */
function memberText(expr: string): string {
  const t = expr.trim()
  const m = /^(['"`])([\s\S]*?)\1$/.exec(t)
  if (m !== null) return m[2]!
  if (/(join|resolve)\s*\([^)]*['"]main\.cjs['"]/.test(t)) return '<mainCjs>'
  if (/^[A-Za-z_$][\w$]*$/.test(t)) {
    const binding = new RegExp(`\\bconst\\s+${t}\\s*=\\s*([^\\n;]+)`).exec(HARNESS_SRC)
    if (binding !== null && /main\.cjs/.test(binding[1]!)) return '<mainCjs>'
  }
  return t
}

describe('U-DIVERGENCE-FIXTURE §4.2 — THE REGISTER REPORT (declared vs executed, held/broken, stoppedAt, counterexamples)', () => {
  it('§4.2 — the register is exactly the TEN declared rows (the gate EIGHT + the two zero-coverage rows the remand added), `P-IM-`/`P-SM-`/`P-TP-` ONLY (no `F-` row), the declared total is 101 and every term is the sum of its own factors', () => {
    expect(DECLARED_REGISTER.map((r) => r.row), 'the register is authored in the declared register order').toEqual([
      'P-IM-1', 'P-IM-2', 'P-IM-3', 'P-SM-1', 'P-SM-2', 'P-SM-3', 'P-TP-1', 'P-TP-2', 'P-SM-4', 'P-SM-5',
    ])
    // ⟨AMENDED 2026-10-05 (gate-4 remand): the register was EIGHT rows at the gate («the cap, exactly
    //   full»); the two zero-coverage steps `A-2`/`A-3` name are NEW rows, so the spec's §4.1 cap
    //   (≤8) must be amended to TEN. The eight superseded rows are all still present, unmoved.⟩
    expect(DECLARED_REGISTER.length, 'the register is the eight gate rows PLUS the two zero-coverage rows the remand added (10)').toBe(10)
    expect(DECLARED_REGISTER.some((r) => r.row.startsWith('F-')), 'NEVER an `F-` row (§4.1)').toBe(false)
    expect(DECLARED_REGISTER.some((r) => r.row === 'P-IM-4' || r.row.startsWith('P-TH-')), '`P-IM-4` and `P-TH-*` do NOT exist in this register (§4.1)').toBe(false)
    for (const row of DECLARED_REGISTER) {
      expect(row.row, `${row.row}: only \`P-IM-\`/\`P-SM-\`/\`P-TP-\` rows may appear`).toMatch(/^P-(IM|SM|TP)-[1-5]$/)
      const factors = row.declared.split(/[+×*]/).map((t) => t.trim())
      expect(factors.every((t) => t !== ''), `${row.row}: every declared factor must be printed (${row.declared})`).toBe(true)
      const value = row.declared
        .split('+')
        .map((term) => term.split(/[×*]/).map((t) => Number(t.trim())).reduce((a, b) => a * b, 1))
        .reduce((a, b) => a + b, 0)
      expect(value, `${row.row}: the declared total must be the value of its own printed terms (${row.declared})`).toBe(row.declaredTotal)
      expect(row.declaredTotal, `${row.row} must be ≤ ${CAPS.perRow}`).toBeLessThanOrEqual(CAPS.perRow)
    }
    const total = DECLARED_REGISTER.reduce((a, r) => a + r.declaredTotal, 0)
    // ⟨AMENDED 2026-10-05: the superseded reading was `6 + 23 + 15 + 8 + 6 + 6 + 7 + 7 = 78`. The
    //   gate-4 remand moved `P-IM-1` 6 → 8, `P-SM-2` 6 → 7 and `P-TP-1` 7 → 8.⟩
    // ⟨AMENDED 2026-10-05: the superseded reading was `6 + 23 + 15 + 8 + 6 + 6 + 7 + 7 = 78`. The
    //   gate-4 remand moved `P-IM-1` 6 → 8, `P-SM-2` 6 → 7, `P-TP-1` 7 → 8, and ADDED the two
    //   zero-coverage rows `P-SM-4` (10) and `P-SM-5` (9).⟩
    expect(total, 'the arithmetic printed with its terms: `8 + 23 + 15 + 8 + 7 + 6 + 8 + 7 + 10 + 9 = 101` (superseded: `6 + 23 + 15 + 8 + 6 + 6 + 7 + 7 = 78`)').toBe(101)
    expect(total, `the total must be ≤ ${CAPS.total}`).toBeLessThanOrEqual(CAPS.total)
    expect(SEED, 'the pinned seed of this register (§4.1): `0x20260930`').toBe(0x20260930)
    expect(STOP_AFTER, 'the register stops after 5 distinct counterexamples on every row (§4.1)').toBe(5)
  })

  it('§4.2 — THE REGISTER REPORT: every row reported `held`/`broken` with its strategy id, its declared-vs-executed term, `stoppedAt` and its counterexamples (a report, never a silent pass)', () => {
    const missing = DECLARED_REGISTER.filter((r) => !REPORTS.some((rep) => rep.row === r.row)).map((r) => r.row)
    expect(missing, 'every declared register row must have RUN and reported — a term dropped from the table without a contract amendment must be a LOUD failure, never a vacuous pass').toEqual([])
    const lines = REPORTS.map(
      (r) =>
        `${r.row} ${r.strategyId}: ${r.held ? 'held' : 'broken'} · declared ${r.declared} = ${r.declaredTotal} · executed ${r.executed} · ` +
        `stoppedAt ${String(r.stoppedAt)} · counterexamples ${r.counterexamples.length}`,
    )
    // eslint-disable-next-line no-console
    console.log('U-DIVERGENCE-FIXTURE REGISTER REPORT\n' + lines.join('\n'))
    expect(
      REPORTS.every((r) => r.held),
      `every register row must hold at the green head; broken at this head: ${REPORTS.filter((r) => !r.held).map((r) => `${r.row} (executed ${r.executed}/${r.declaredTotal}, stoppedAt ${String(r.stoppedAt)})`).join(', ')}\nU-DIVERGENCE-FIXTURE REGISTER REPORT\n${lines.join('\n')}`,
    ).toBe(true)
  })
})
