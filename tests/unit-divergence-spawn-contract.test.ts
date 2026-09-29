// tests/unit-divergence-spawn-contract.test.ts — unit `U-DIVERGENCE-SPAWN` (the divergence-leg
// spawn precondition — the `/dev/shm`-class boot failure): THE RED SET, authored RED-FIRST from
// the contract below and RUN BEFORE any implementation (`RCA-1`/`AGENTS.md` item 3).
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-divergence-harness-precondition.md
//     §3.1 `C-1`  the composed argument vector: the EIGHT members of `S-2` kept in place, with
//                 `--disable-dev-shm-usage` ADDED (member 9, exactly once) and
//                 `--user-data-dir=<fresh scratch>` ADDED AS THE LAST MEMBER, `=`-joined (never two
//                 arguments); BOTH sites of `S-1` derive their lists from ONE value; item 5 — the
//                 profile creator creates a DIRECTORY and spawns NOTHING; item 6 — the contract is
//                 inspectable WITHOUT RUNNING THE LEG (route (a) source text / route (b) an
//                 import WITHOUT the leg running, i.e. a main-module guard); item 7 — THE PAIR IS
//                 ONE REQUIREMENT.
//     §3.2 `C-2`  freshness (`mkdtemp`-class, unpredictable, never re-used, never under the repo,
//                 never the operator's real profile); ROOT = the OS temp dir (`node:os`); SHAPE =
//                 did-not-exist-then-exists, parent = the scratch root, basename carries a
//                 LEG-IDENTIFYING prefix; item 4 — the TWO-CHILD case: each child gets its OWN
//                 fresh profile, a shared profile is INADMISSIBLE.
//     §3.3 `C-3`  registration AT CREATION (item 1), IDEMPOTENT (item 2), EVERY EXIT PATH: green
//                 `exit 0` · red `exit 1` · boot failure · pre-comparison throw · `SIGINT`/`SIGTERM`
//                 (item 3), THE BOUNDED DELETE-AND-VERIFY SWEEP — delete, pause, verify absence,
//                 re-delete while anything survives, bounded by a pass count (item 4), FAIL LOUD on
//                 a leftover with `leftover: NONE` as the honest counterpart (item 5), children
//                 killed before the sweep (item 6), the repo is NEVER the drop target (item 7).
//     §3.4 `C-4`  the env pair / `cwd` / `stdio` KEPT — no change authorised.
//     §3.5 `C-5`  boot success = `R13 RESULT: <n> checks, 0 failures` AND `exit 0` as ONE reading;
//                 `<n>` is an OBSERVATION, never a re-pin.
//     §3.6 `C-6`  FAIL-LOUD: the cause line derives from the harness's OWN accumulated child
//                 `stderr`; the `/dev/shm` shared-memory refusal is NAMED; `SIGTRAP`-class signal
//                 death is NAMED; the connection error stays visible as the SYMPTOM; a missing
//                 cause line is reported honestly; the arithmetic does not change (`{0,1}` stands).
//     §3.7 `C-7`  THE PRESERVATION CLAUSE: the comparison set, the demo envelope literal, the
//                 `ok()` labels' meaning, the exit contract's shape, no new dependency.
//     §4.2        `R-1`…`R-14` — the class-(a) rows (no Electron boot).
//     §4.3 `C-9`  `B-1`/`B-2`/`B-3` — the class-(b) rows (the REAL run; the unit's own gate).
//     §4.4 `C-10` what the red set must NOT do: no Electron spawn, no `'electron'` mock, no
//                 `G-9`-frozen artefact as an oracle, NO LINE-NUMBER assertion, no weakened row.
//     §4.6 `C-11` the readings the DONE row must carry.
//     §5.2        the typed register: EIGHT rows — `P-IM-1` `P-IM-2` `P-IM-3` `P-SM-1` `P-SM-2`
//                 `P-SM-3` `P-TP-1` `P-TP-2` — `P-IM-`/`P-SM-`/`P-TP-` ONLY, NO `F-` row, the declared
//                 terms printed as the sum of their own factors, deterministic plain tables and
//                 NO new devDependency.
//     §5.3        the register's honesty limits: no row asserts the leg's COLOUR, no row asserts
//                 the APP, every row reads the SAME instrument the class-(a) rows read.
//     §0.0        the layer: HARNESS / `[D]` on every line — a green here proves the harness can
//                 boot a real Electron, never that the app works (`RCA-12`).
//
// LAYER (`RCA-12`, mandatory declaration): **HARNESS / `[D]`**. Every row in this file reads
// SOURCE TEXT or an import-safe module export. NO row here is app-green, envelope-green,
// rendered-green or live-green, and no row may be cited as evidence about rendering, layout, CSS,
// geometry, gestures, the store, the engine or any user-visible behaviour.
//
// RED-SET SPLIT (`§4.1`): class (a) = `R-1`…`R-14` + the register — RUNNABLE AT THIS HEAD, NO
// ELECTRON BOOT, NO vitest mock binding of any form (`C-10`). class (b) = `B-1`/`B-2`/`B-3` — THE REAL RUN; they are the
// UNIT'S OWN GATE (`C-8`) and their readings are produced by the live-scenario runner's pass, so
// they carry their declared reading and are NOT faked here.
//
// `G-9`/`X-9` PIN SAFETY: this file binds NO vitest mock API in any form (the protected bridge-mock
// census in `tests/unit-v5-migration-contract.test.ts` pins the exact five-name set, so a new file
// that mocks would red a protected row), and it writes no pinned byte. The `R-14` re-assertion is a
// CROSS-CHECK only; the protected file remains the authority (`X-9`).
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const HARNESS_PATH = join(REPO_ROOT, 'scripts', 'electron-divergence.mjs')
const PACKAGE_JSON_PATH = join(REPO_ROOT, 'package.json')

function readText(path: string): string {
  try {
    return readFileSync(path, 'utf8')
  } catch (e) {
    throw new Error(`U-DIVERGENCE-SPAWN [T] read failure: ${path} — ${(e as Error).message}`)
  }
}

const HARNESS_SRC = readText(HARNESS_PATH)

// ===========================================================================
// §3.1 `C-1` — the contract vector, as the CONTRACT's own literals.
// ===========================================================================
const MAIN_CJS_MEMBER = '<mainCjs>'
const PROFILE_PREFIX = '--user-data-dir='
/** The NINE fixed members of `C-1`/`§5.2 P-IM-1`, in their recorded order: the EIGHT of `S-2`/
 *  `§7.3 item 3`'s `baseArgs` (the bundle + six flags + the shared-memory bypass — member 8, added
 *  by `§3.1 item 2`) and, LAST, the per-spawn profile member. The profile member is pinned as the
 *  `--user-data-dir=<fresh scratch dir>` SHAPE (its value is per spawn and per run, `C-1` item 3 /
 *  `C-2` item 1), so a site whose last member is not a `--user-data-dir=` member is a violation —
 *  the row reads the shape at member 9 and `P-IM-2` reads the value discipline. **The nine is the
 *  DECLARED term of `§5.2 P-IM-1` (`9 members × 2 sites + 2 negative draws = 20`) and is NOT
 *  reduced here: the as-filed body pinned EIGHT members, so it executed `8×2+2 = 18` of the
 *  declared `9×2+2 = 20` — the measured divergence this remand reconciles by widening the BODY to
 *  the declared nine, never by lowering the term.** */
const CONTRACT_PROFILE_MEMBER = `${PROFILE_PREFIX}<fresh scratch dir>`
const CONTRACT_BASE: string[] = [
  MAIN_CJS_MEMBER,
  '--mcp-transport=stdio',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--in-process-gpu',
  '--ozone-platform=x11',
  '--disable-dev-shm-usage',
  CONTRACT_PROFILE_MEMBER,
]
/** The `ok()` census labels of `S-1`/`S-6` — the comparison set `C-7` item 1 pins. */
const COMPARISON_LABELS: string[] = [
  'electron: dispatch renderedNonEmpty',
  'census inTree matches (shim = real)',
  'census registered matches',
  'dirtied ids match (normalized)',
  'SSR fragment matches (structural)',
  'data-node-id set matches (structural)',
  'nodeId vocabulary matches (structural)',
  'counter increment rendered in BOTH',
  'dispatch results non-empty in BOTH (R7)',
  'electron leg produced a result',
]
/** The demo envelope literal's recorded structural shape (`S-7`): TWELVE nodes, in tree order. */
const ENVELOPE_CSS_IDS: string[] = [
  'counter-card',
  'counter',
  'inc',
  'dec',
  'reset',
  'echo-card',
  'echo-input',
  'echo-out',
]
const ENVELOPE_NODE_COUNT = 12

// ===========================================================================
// INSTRUMENT — the harness SOURCE TEXT, read structurally. Route (a) of `C-1` item 6:
// "read the harness's source text and assert the composed members structurally". The
// instrument never asserts a LINE NUMBER (`C-10`): it pins the shape of the call sites.
// ===========================================================================

/** Skip a string literal (`'`, `"`, `` ` ``) starting at `i`, returning the index of its
 *  closing delimiter (or `src.length` when unterminated). Template-literal `${ … }` bodies
 *  are scanned with a brace depth so a nested object/array does not end the literal early. */
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

/** The index of the bracket matching the `open` at `i`, skipping literals, line/block
 *  comments and nested brackets. `-1` when unbalanced. */
function findMatching(src: string, i: number): number {
  const open = src[i]!
  const close = open === '[' ? ']' : open === '{' ? '}' : open === '(' ? ')' : ''
  if (close === '') return -1
  let depth = 0
  while (i < src.length) {
    const c = src[i]!
    if (c === "'" || c === '"' || c === '`') { i = skipLiteral(src, i) + 1; continue }
    if (c === '/' && src[i + 1] === '/') { const nl = src.indexOf('\n', i); i = nl < 0 ? src.length : nl + 1; continue }
    if (c === '/' && src[i + 1] === '*') { const end = src.indexOf('*/', i + 2); i = end < 0 ? src.length : end + 2; continue }
    if (c === open) depth++
    else if (c === close) { depth--; if (depth === 0) return i }
    i++
  }
  return -1
}

/** Split a comma-separated element list at TOP-LEVEL commas, skipping literals, comments and
 *  nested brackets. Each element's text is trimmed. */
function splitTopLevel(body: string): string[] {
  const out: string[] = []
  let start = 0
  let i = 0
  while (i < body.length) {
    const c = body[i]!
    if (c === "'" || c === '"' || c === '`') { i = skipLiteral(body, i) + 1; continue }
    if (c === '/' && body[i + 1] === '/') { const nl = body.indexOf('\n', i); i = nl < 0 ? body.length : nl + 1; continue }
    if (c === '/' && body[i + 1] === '*') { const end = body.indexOf('*/', i + 2); i = end < 0 ? body.length : end + 2; continue }
    if (c === '[' || c === '{' || c === '(') { const m = findMatching(body, i); i = m < 0 ? body.length : m + 1; continue }
    if (c === ',') { out.push(body.slice(start, i).trim()); start = i + 1 }
    i++
  }
  const tail = body.slice(start).trim()
  if (tail !== '') out.push(tail)
  return out
}

/** Every ARRAY LITERAL element list (with its element texts), in source order. */
function arrayLiterals(src: string): Array<{ elements: string[]; index: number }> {
  const out: Array<{ elements: string[]; index: number }> = []
  let i = 0
  while (i < src.length) {
    const c = src[i]!
    if (c === "'" || c === '"' || c === '`') { i = skipLiteral(src, i) + 1; continue }
    if (c === '/' && src[i + 1] === '/') { const nl = src.indexOf('\n', i); i = nl < 0 ? src.length : nl + 1; continue }
    if (c === '/' && src[i + 1] === '*') { const end = src.indexOf('*/', i + 2); i = end < 0 ? src.length : end + 2; continue }
    if (c === '[') {
      const end = findMatching(src, i)
      if (end < 0) break
      out.push({ elements: splitTopLevel(src.slice(i + 1, end)), index: i })
      i = end + 1
      continue
    }
    i++
  }
  return out
}

/** Every `const <name> = <initializer>` binding, resolved to an array-element list when the
 *  initializer is an array literal OR a single reference to such a binding (bounded depth). */
function arrayLetBindings(src: string): Map<string, string[] | null> {
  const bindings = new Map<string, string[] | null>()
  const re = /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*([A-Za-z_$][\w$]*)\s*(?=[\n;,)])/g
  const arrays = arrayLiterals(src)
  const byIndex = new Map(arrays.map((a) => [a.index, a.elements]))
  let m: RegExpExecArray | null
  while ((m = re.exec(src)) !== null) {
    const after = m.index + m[0].length
    let j = after
    while (j < src.length && /\s/.test(src[j]!)) j++
    const target = src[j]
    if (target === '[') {
      const end = findMatching(src, j)
      if (end > 0) bindings.set(m[1]!, byIndex.get(j) ?? splitTopLevel(src.slice(j + 1, end)))
    }
  }
  for (const b of bindings.keys()) {
    const re2 = new RegExp(`\\bconst\\s+${b!.replace(/[$]/g, '\\$')}\\s*=\\s*([A-Za-z_$][\\w$]*)\\s*(?=[\\n;,)])`)
    const m2 = re2.exec(src)
    if (m2 === null) continue
    // a re-export/alias chain: resolve ONE hop when the alias is itself an array binding
    const seen = new Set<string>()
    let name: string | undefined = m2[1]
    while (name !== undefined && !seen.has(name)) {
      seen.add(name)
      const found = new RegExp(`\\bconst\\s+${name.replace(/[$]/g, '\\$')}\\s*=\\s*\\[`).exec(src)
      if (found !== null) {
        const j = src.indexOf('[', found.index + found[0].length - 1)
        const end = findMatching(src, j)
        if (end > 0) bindings.set(b!, splitTopLevel(src.slice(j + 1, end)))
        break
      }
      break
    }
  }
  return bindings
}

const ARRAY_BINDINGS = arrayLetBindings(HARNESS_SRC)

interface SourceInstrument {
  /** every array literal that carries the stdio transport member */
  candidates: Array<{ elements: string[]; index: number }>
  /** the `spawn(<bin>, …)` sites' vector expressions */
  directSites: string[][]
  /** the `StdioClientTransport({ …, args: … })` sites' vector expressions */
  sdkSites: string[][]
  /** array literals reachable as a named binding (a shared/composed vector) */
  sharedVectors: string[][]
}

const INSTRUMENT: SourceInstrument = (() => {
  const markerRe = /\bspawn\s*\(|\bargs\s*:/g
  const markers: Array<{ kind: 'spawn' | 'args'; index: number }> = []
  let m: RegExpExecArray | null
  while ((m = markerRe.exec(HARNESS_SRC)) !== null) {
    if (/^spawn/.test(m[0])) markers.push({ kind: 'spawn', index: m.index })
    else markers.push({ kind: 'args', index: m.index })
  }
  // the real-Electron sites are the vectors that ALSO carry the bundle member: the DOM-shim
  // battery host's transport (`process.execPath`, `batteryHost`, `--mcp-transport=stdio`) is a
  // DIFFERENT leg (C-7 item 3) and shares only the transport member.
  const candidates = arrayLiterals(HARNESS_SRC).filter(
    (a) =>
      (a.elements.some((e) => /mainCjs/.test(e)) || a.elements.some((e) => /main\.cjs/.test(e))) &&
      (a.elements.includes("'--mcp-transport=stdio'") || a.elements.includes('"--mcp-transport=stdio"')),
  )
  const directSites: string[][] = []
  const sdkSites: string[][] = []
  const sharedVectors: string[][] = []
  for (const c of candidates) {
    const before = markers.filter((k) => k.index < c.index)
    const nearest = before[before.length - 1]
    if (nearest === undefined) sharedVectors.push(c.elements)
    else if (nearest.kind === 'args') sdkSites.push(c.elements)
    else directSites.push(c.elements)
  }
  return { candidates, directSites, sdkSites, sharedVectors }
})()

/** Resolve an element expression to its string value when it is a literal, a named
 *  array binding's element, or a `const X = '<literal>'`-style identifier. `null` when the
 *  value is not statically known (a template/concat expression is handled by the callers). */
function literalValue(expr: string): string | null {
  const t = expr.trim()
  if ((t.startsWith("'") && t.endsWith("'")) || (t.startsWith('"') && t.endsWith('"'))) {
    return t.slice(1, -1)
  }
  const single = /^[A-Za-z_$][\w$]*$/.exec(t)
  if (single !== null) {
    const re = new RegExp(`\\bconst\\s+${t.replace(/[$]/g, '\\$')}\\s*=\\s*(['"])(.*?)\\1`)
    const m = re.exec(HARNESS_SRC)
    if (m !== null) return m[2]!
  }
  return null
}

/** The element's text as a MEMBER: `<mainCjs>` for the bundle member (any identifier that
 *  resolves to `dist/main/main.cjs`), or the static string value, or the raw text when the
 *  member is a computed expression (e.g. `` `--user-data-dir=${dir}` ``). */
function memberText(expr: string): string {
  const t = expr.trim()
  const v = literalValue(t)
  if (v !== null) return v
  if (new RegExp(`(join|resolve)\\s*\\([^)]*['"]main\\.cjs['"]`).test(t)) return MAIN_CJS_MEMBER
  if (/^[A-Za-z_$][\w$]*$/.test(t)) {
    const re = new RegExp(`\\bconst\\s+${t.replace(/[$]/g, '\\$')}\\s*=\\s*([^\\n;]+)`)
    const m = re.exec(HARNESS_SRC)
    if (m !== null && /main\.cjs/.test(m[1]!)) return MAIN_CJS_MEMBER
  }
  return t
}

/** A vector resolved from a candidate expression: the element list, with any SINGLE named
 *  binding that resolves to an array spliced in place of itself. */
function resolveVector(elements: string[]): { members: string[]; spliced: boolean; unresolved: string[] } {
  const out: string[] = []
  const unresolved: string[] = []
  let spliced = false
  for (const e of elements) {
    const t = e.trim()
    if (t.startsWith('...')) {
      const name = t.slice(3).trim()
      const bound = ARRAY_BINDINGS.get(name)
      if (bound !== undefined && bound !== null) {
        spliced = true
        for (const b of bound) out.push(memberText(b))
      } else {
        unresolved.push(t)
        out.push(t)
      }
      continue
    }
    if (/^[A-Za-z_$][\w$]*$/.test(t)) {
      const bound = ARRAY_BINDINGS.get(t)
      if (bound !== undefined && bound !== null) {
        spliced = true
        for (const b of bound) out.push(memberText(b))
        continue
      }
    }
    out.push(memberText(t))
  }
  return { members: out, spliced, unresolved }
}

const DIRECT_VECTORS = INSTRUMENT.directSites.map(resolveVector)
const SDK_VECTORS = INSTRUMENT.sdkSites.map(resolveVector)
const SHARED_VECTORS = INSTRUMENT.sharedVectors.map(resolveVector)

/** `C-1` item 3 — a member IS the profile member when its text either STARTS with the
 *  `--user-data-dir=` prefix (a template literal / a plain literal: `` `--user-data-dir=${dir}` ``)
 *  or CONTAINS it as the first `=`-joined operand of a concatenation (`'--user-data-dir=' + p + ''`)
 *  — the two source forms the contract's own sites may take. Structural, never a line number
 *  (`C-10`). */
function isProfileMember(x: unknown): boolean {
  if (typeof x !== 'string') return false
  return x.startsWith(PROFILE_PREFIX) || x.includes(PROFILE_PREFIX)
}

/** The VALUE text of a profile member as the SOURCE writes it: for the literal/template form
 *  (`` `--user-data-dir=${dir}` ``) everything after the `=` up to the closing delimiter; for the
 *  concatenation form (`'--user-data-dir=' + dir + ''`) the operand expression that follows the
 *  prefix literal. Structural, tolerant of both admissible spellings (`C-1` item 3), never a line
 *  number (`C-10`). */
function profileValueText(member: string): string {
  const at = member.indexOf(PROFILE_PREFIX)
  if (at < 0) return ''
  const operand = member.slice(at + PROFILE_PREFIX.length).trim()
  const parts = operand.split(/\s*\+\s*/)
  const valued: string[] = []
  for (let k = 0; k < parts.length; k++) {
    let part = parts[k]!.trim()
    if (k === 0) {
      const m = /^(['"`])([\s\S]*?)\1$/.exec(part)
      if (m !== null) part = m[2]!.trim()
    }
    if (part === '') continue
    valued.push(part)
  }
  return valued.join(' + ').replace(/`/g, '').trim()
}

/** A profile member is PRESENT and NON-EMPTY: the member text carries a non-empty operand after
 *  the `--user-data-dir=` prefix (`C-1` item 3 — an `=`-joined single argument, never a bare
 *  prefix and never an empty value). */
function hasProfileValue(member: string): boolean {
  return isProfileMember(member) && profileValueText(member) !== ''
}

/** `C-1` item 4 — the sites DERIVE their lists from one value. The one member that MUST differ
 *  per site is the profile member (`C-2` item 4), so the comparison normalizes it. */
function normalizedMembers(members: string[]): string[] {
  return members.filter((x) => !isProfileMember(x))
}

const SITE_COUNT = DIRECT_VECTORS.length + SDK_VECTORS.length

/** `C-1`/`C-2` — the contract checker for ONE vector, as a pure function over members. Returns
 *  the violations; an empty array means the vector satisfies `C-1` items 1–3. */
function contractViolations(members: string[], label: string): string[] {
  const v: string[] = []
  if (members.length !== 9) v.push(`${label}: the vector carries ${members.length} member(s); the contract is NINE (C-1 item 1's eight + the shm flag, plus the profile member)`)
  // the FIRST EIGHT are literal-pinned (C-1 items 1/2). Member NINE is the per-spawn profile
  // member, whose VALUE is not a contract constant (C-1 item 3 / C-2 item 1): it is read as the
  // `--user-data-dir=` SHAPE below, so the checker pins nine members without demanding a literal
  // directory — which no site could ever carry.
  for (let i = 0; i < CONTRACT_BASE.length - 1; i++) {
    if (members[i] !== CONTRACT_BASE[i]) {
      v.push(`${label}: member ${i + 1} reads ${JSON.stringify(members[i] ?? null)}; the contract pins ${JSON.stringify(CONTRACT_BASE[i])} (C-1 items 1/2)`)
    }
  }
  const shm = members.filter((x) => x === '--disable-dev-shm-usage')
  if (shm.length !== 1) v.push(`${label}: \`--disable-dev-shm-usage\` appears ${shm.length} time(s); exactly once is required (C-1 item 2)`)
  const profiles = members.filter((x) => isProfileMember(x))
  if (profiles.length !== 1) v.push(`${label}: ${profiles.length} \`${PROFILE_PREFIX}\` member(s); exactly one is required (C-1 item 3)`)
  else {
    if (profiles[0]!.slice(PROFILE_PREFIX.length).trim() === '') v.push(`${label}: the profile member's value is EMPTY (C-1 item 3)`)
    if (members[members.length - 1] !== profiles[0]) v.push(`${label}: the profile member is not the LAST member — it reads ${JSON.stringify(members.indexOf(profiles[0]!) + 1)} of ${members.length} (C-1 item 3)`)
    // the NINTH fixed member IS the profile member (C-1 item 2 adds the shm flag as member 8 and
    // item 3 the profile as member 9); `P-IM-2` is the row that reads its value discipline.
    if (!isProfileMember(members[8])) v.push(`${label}: member 9 reads ${JSON.stringify(members[8] ?? null)}; the contract's ninth member is the per-spawn \`${PROFILE_PREFIX}\` member (C-1 items 2/3)`)
  }
  return v
}

/** The vector-shape facts the `P-`rows drive, read ONCE from the source instrument. */
function siteShape(): { ok: boolean; violations: string[]; base: string[] | null } {
  const violations: string[] = []
  if (SITE_COUNT !== 2) {
    violations.push(`the source instrument found ${SITE_COUNT} spawn site(s) carrying the stdio transport member (the S-1 pair: the direct \`spawn\` and the SDK \`StdioClientTransport\`); expected exactly 2`)
  }
  const vectors = [...DIRECT_VECTORS, ...SDK_VECTORS]
  for (let i = 0; i < vectors.length; i++) {
    const vec = vectors[i]!
    if (vec.unresolved.length > 0) violations.push(`site ${i + 1}: the instrument cannot resolve ${vec.unresolved.join(', ')} — report this to the TestWriter (an instrument bound, never a contract reading)`)
    violations.push(...contractViolations(vec.members, `site ${i + 1}`))
  }
  const norm = vectors.map((x) => normalizedMembers(x.members))
  for (let i = 1; i < norm.length; i++) {
    if (JSON.stringify(norm[i]) !== JSON.stringify(norm[0])) {
      violations.push(`site ${i + 1}: the non-profile members differ from site 1's — the two sites must DERIVE their lists from one value (C-1 item 4)`)
    }
  }
  const base = norm[0] ?? null
  const FIXED_EIGHT = CONTRACT_BASE.slice(0, CONTRACT_BASE.length - 1)
  if (base !== null && JSON.stringify(base) !== JSON.stringify(FIXED_EIGHT)) {
    violations.push(`the shared non-profile members read ${JSON.stringify(base)}; the contract pins ${JSON.stringify(FIXED_EIGHT)} (C-1 items 1/2/4)`)
  }
  for (const shared of SHARED_VECTORS) {
    if (shared.unresolved.length > 0) continue // spliced shared vectors are checked through the sites
    if (shared.members.some((x) => isProfileMember(x))) continue // a per-spawn composed vector, checked at its site
    if (JSON.stringify(shared.members) !== JSON.stringify(CONTRACT_BASE.slice(0, CONTRACT_BASE.length - 1))) {
      violations.push(`the shared/composed vector reads ${JSON.stringify(shared.members)}; the contract's fixed members are ${JSON.stringify(CONTRACT_BASE.slice(0, CONTRACT_BASE.length - 1))} (C-1 items 1/2/4)`)
    }
  }
  return { ok: violations.length === 0, violations, base }
}

const SITE_SHAPE = siteShape()

/** The single violation that proves `C-1` items 1–4 for a candidate vector — used by the two
 *  NEGATIVE draws of `P-IM-1`, so the checker is shown to DISCRIMINATE. The conforming draw is
 *  `CONTRACT_BASE` itself (all NINE members, the ninth being the profile shape); each draw mutates
 *  exactly ONE property (a dropped member / a duplicated member), so the row's two negatives read
 *  the two ways the ninth member's neighbourhood can drift. */
function fabricatedVector(mutate: 'drop' | 'duplicate'): string[] {
  const members = CONTRACT_BASE.map((m, i) => (i === CONTRACT_BASE.length - 1 ? `${PROFILE_PREFIX}/tmp/unit-divergence-spawn-note` : m))
  if (mutate === 'drop') return members.filter((x) => x !== '--disable-dev-shm-usage')
  const at = members.indexOf('--disable-dev-shm-usage')
  return [...members.slice(0, at + 1), '--disable-dev-shm-usage', ...members.slice(at + 1)]
}

function fabricatedProfileVector(profileValue: string | null, count = 1): string[] {
  const members = CONTRACT_BASE.slice(0, CONTRACT_BASE.length - 1)
  for (let i = 0; i < count; i++) members.push(`${PROFILE_PREFIX}${profileValue ?? ''}`)
  return members
}

// ===========================================================================
// §3.2/§3.3 — the scratch-profile source facts (route (a)).
// ===========================================================================
const SOURCE_FACTS = (() => {
  const osImport = /\bfrom\s+'node:os'|require\(\s*'node:os'\s*\)/.test(HARNESS_SRC)
  const fsImport = /\bfrom\s+'node:fs'|require\(\s*'node:fs'\s*\)/.test(HARNESS_SRC)
  const usesTmpdir = /\btmpdir\s*\(/.test(HARNESS_SRC)
  const mkdtemp = /\bmkdtemp(?:Sync)?\s*\(/.test(HARNESS_SRC)
  const mkdtempPrefix = /mkdtemp(?:Sync)?\s*\([^)]*?(['"])(.*?)\1/.exec(HARNESS_SRC)
  const exitSignals = Array.from(HARNESS_SRC.matchAll(/process\.on\(\s*(['"])(\w+)\1/g)).map((m) => m[2]!)
  const exitCalls = Array.from(HARNESS_SRC.matchAll(/process\.exit\s*\(/g)).map((m) => m.index ?? -1)
  const registerCall = /\bregisterCleanup\s*\(\s*\)/.exec(HARNESS_SRC)
  const spawnCalls = (HARNESS_SRC.match(/\bspawn\s*\(/g) ?? []).length
  const otherChildApis = Array.from(HARNESS_SRC.matchAll(/\b(exec|execFile|execFileSync|execSync|fork|spawnSync)\s*\(/g)).map((m) => m[1]!)
  const killCalls = (HARNESS_SRC.match(/\bkill\s*\(/g) ?? []).length
  return {
    osImport,
    fsImport,
    usesTmpdir,
    mkdtemp,
    mkdtempPrefix: mkdtempPrefix === null ? null : mkdtempPrefix[2]!,
    exitSignals,
    exitCalls,
    registerCallIndex: registerCall === null ? -1 : (registerCall.index ?? -1),
    spawnCalls,
    otherChildApis,
    killCalls,
  }
})()

/** The profile-creator export's name/shape, read from the contract surface when it is present. */
const HARNESS: { mod: Record<string, unknown> | null; error: string | null } = { mod: null, error: null }

/** `C-1` item 6 route (b): the harness must be reachable by module import WITHOUT the leg
 *  running. At this head the whole leg sits at MODULE TOP LEVEL with no entry guard
 *  (VERIFIED-BY-READ, the contract's own `C-1` item 6 note), so a naive `import` BOOTS ELECTRON —
 *  which `C-10` forbids in class (a). The instrument therefore reads the entry-guard SHAPE from
 *  the source first and refuses to import when it is absent: the class-(a) rows stay
 *  Electron-free at this head and go live only once the guard exists. */
function entryGuardShape(): { present: boolean; reasons: string[] } {
  const reasons: string[] = []
  const guardish = /(import\.meta\.url|process\.argv\[1\]|process\.argv\.length|isMain|require\.main)/.test(HARNESS_SRC)
  if (!guardish) reasons.push('no `import.meta.url` / `process.argv[1]` / main-module comparison appears in the source')
  else if (!/import\.meta\.url/.test(HARNESS_SRC) || !/process\.argv/.test(HARNESS_SRC)) {
    reasons.push('the source mentions a guard-like token but not the `import.meta.url` × `process.argv[…]` comparison pair in one conditional')
  }
  const conditional = HARNESS_SRC.split('\n').filter((l) => /if\s*\(.*import\.meta\.url.*process\.argv/.test(l))
  if (conditional.length === 0) reasons.push('no `if (… import.meta.url … process.argv …)` entry guard line exists')
  return { present: reasons.length === 0, reasons }
}

const GUARD = entryGuardShape()

beforeAll(async () => {
  if (!GUARD.present) {
    HARNESS.error =
      'the module has NO main-module entry guard (C-1 item 6 route (b)), so importing it would BOOT ELECTRON — which C-10 forbids in class (a). ' +
      `Observed: ${GUARD.reasons.join(' | ')}. The harness must expose its contract (composeArgs, createScratchProfile, cleanupScratchProfiles, ` +
      'registerCleanup, classifyBootFailure, exitCodeFor, ok, demoEnvelope) by module import WITHOUT running the leg.'
    return
  }
  try {
    const mod = (await import(/* @vite-ignore */ pathToFileURL(HARNESS_PATH).href)) as Record<string, unknown>
    HARNESS.mod = mod
  } catch (e) {
    HARNESS.error = (e as Error).message
  }
})

const cleanupRoots: string[] = []
afterAll(() => {
  for (const r of cleanupRoots) {
    try { rmSync(r, { recursive: true, force: true }) } catch { /* best effort */ }
  }
  // TEST-SIDE SWEEP (C-3 item 3, the discipline this file READS — the rows create real scratch
  // profiles through the exported creator, so the file leaves the same zero-residue footprint the
  // contract demands of the leg). Two steps, both best effort: the harness's own sweep over the OS
  // temp root (`node:os`'s `tmpdir()`, where the creator roots its profiles), then a direct removal
  // of anything of THIS leg's still standing. Nothing here is a contract assertion — `B-2`/`P-SM-2`
  // carry the real sweep rows; this only stops the red set from accumulating profiles per run.
  try {
    const cleanup = HARNESS.mod?.['cleanupScratchProfiles']
    if (typeof cleanup === 'function') (cleanup as (o?: unknown) => unknown)({ scratchRoot: resolve(tmpdir()) })
  } catch { /* best effort */ }
  try {
    const root = resolve(tmpdir())
    for (const name of readdirSync(root)) {
      if (name.startsWith('astrographer-div-') || name.startsWith('unit-div-spawn-test-')) {
        try { rmSync(join(root, name), { recursive: true, force: true }) } catch { /* best effort */ }
      }
    }
  } catch { /* best effort */ }
})

function fn(name: string): (...args: unknown[]) => unknown {
  const mod = HARNESS.mod
  if (mod === null) {
    throw new Error(
      `U-DIVERGENCE-SPAWN contract failure (C-1 item 6): the harness contract is NOT inspectable by module import — ${HARNESS.error ?? 'no reason recorded'}. ` +
        `The row needs the exported \`${name}\`.`,
    )
  }
  const v = mod[name]
  if (typeof v !== 'function') {
    throw new Error(
      `U-DIVERGENCE-SPAWN contract failure: the harness exports no \`${name}\` (C-1 item 6 — the contract must be inspectable WITHOUT booting Electron). Exports read: ${Object.keys(mod).sort().join(', ') || '(none)'}`,
    )
  }
  return v as (...args: unknown[]) => unknown
}

function asRecord(v: unknown, what: string): Record<string, unknown> {
  if (v === null || typeof v !== 'object') {
    throw new Error(`U-DIVERGENCE-SPAWN contract failure: ${what} must return an object report; read ${typeof v}`)
  }
  return v as Record<string, unknown>
}

function attemptOf(fnToRun: () => void): string | null {
  try {
    fnToRun()
    return null
  } catch (e) {
    return (e as Error)?.message ?? String(e)
  }
}

function mkScratchRoot(): string {
  const root = mkdtempSync(join(tmpdir(), 'unit-div-spawn-test-'))
  cleanupRoots.push(root)
  return root
}

// ===========================================================================
// §4.2 — CLASS (a): the rows that FAIL AT THIS HEAD (no Electron boot).
// ===========================================================================
describe('U-DIVERGENCE-SPAWN §4.2 class (a) R-1..R-4 — the spawn argument vector (C-1)', () => {
  it('R-1/R-2/R-3/R-4 — both sites carry the NINE-member contract vector: the eight of S-2 in order, `--disable-dev-shm-usage` exactly once, one non-empty `--user-data-dir=` LAST, derived from one value', () => {
    expect(
      SITE_SHAPE.ok,
      `class (a) R-1/R-2/R-3/R-4 — the composed argument vector violates C-1. At this head the recorded reading is S-2/S-3: EIGHT members with NO ` +
        `\`--disable-dev-shm-usage\` and NO \`--user-data-dir\`, at BOTH sites. Violations observed: ${SITE_SHAPE.violations.join(' | ') || '(none)'}`,
    ).toBe(true)
  })

  it('R-1 (instrument self-check) — the checker DISCRIMINATES: a dropped member and a duplicated member are both rejected', () => {
    const dropped = contractViolations(fabricatedVector('drop'), 'a dropped-member draw')
    const duplicated = contractViolations(fabricatedVector('duplicate'), 'a duplicated-member draw')
    expect(dropped.length, 'a vector MISSING `--disable-dev-shm-usage` must be rejected — otherwise R-1 is vacuous').toBeGreaterThan(0)
    expect(duplicated.length, 'a vector carrying `--disable-dev-shm-usage` TWICE must be rejected — otherwise R-1 is vacuous').toBeGreaterThan(0)
    expect(contractViolations(CONTRACT_BASE.map((m, i) => (i === CONTRACT_BASE.length - 1 ? `${PROFILE_PREFIX}/tmp/x` : m)), 'a conforming draw'), 'a conforming draw must be ACCEPTED, or the checker rejects everything').toEqual([])
  })
})

describe('U-DIVERGENCE-SPAWN §4.2 class (a) R-5..R-9 — the scratch `--user-data-dir` and its cleanup (C-2/C-3)', () => {
  it('R-5 — the profile creator is a `mkdtemp`-class call under `node:os`\u2019s temp root with a leg-identifying basename prefix, and the returned path did not pre-exist (C-2 items 1-3)', () => {
    const facts = SOURCE_FACTS
    const problems: string[] = []
    if (!facts.osImport || !facts.usesTmpdir) problems.push('no `node:os` `tmpdir()` import/use (C-2 item 2 — the scratch root is the OS temp dir)')
    if (!facts.mkdtemp) problems.push('no `mkdtemp`-class call (C-2 item 1 — an unpredictable, previously-non-existent path)')
    if (facts.mkdtempPrefix === null || facts.mkdtempPrefix === '') problems.push('the `mkdtemp` prefix is empty or unreadable (C-2 item 3 — the basename must carry a LEG-IDENTIFYING prefix)')
    else if (!/div/i.test(facts.mkdtempPrefix)) problems.push(`the \`mkdtemp\` prefix reads ${JSON.stringify(facts.mkdtempPrefix)} and does not identify this leg (C-2 item 3)`)
    expect(
      problems,
      `class (a) R-5 — at this head S-4 records no \`node:fs\`/\`node:os\` import and no directory creation at all. Observed: ${problems.join(' | ') || '(source facts ok)'}`,
    ).toEqual([])

    const create = fn('createScratchProfile')
    const before = asRecord(create(), 'createScratchProfile()')
    const path = String(before.path ?? before.dir ?? '')
    expect(path.length, 'createScratchProfile() must report the created directory path (C-2 item 3)').toBeGreaterThan(0)
    expect(existsSync(path), `createScratchProfile() must leave the directory EXISTING after the call (C-2 item 3): ${path}`).toBe(true)
    expect(statSync(path).isDirectory(), `the created path must be a DIRECTORY: ${path}`).toBe(true)
    expect(dirname(path), `the created profile's parent must be the OS temp root (C-2 item 2): ${dirname(path)}`).toBe(resolve(tmpdir()))
    expect(dirname(path).startsWith(REPO_ROOT + sep), `the created profile must be OUTSIDE the repo (C-3 item 7): ${path}`).toBe(false)
  })

  it('R-9 — the scratch root is the OS temp dir and no repo-relative path is admissible (C-2 item 2 / C-3 item 7)', () => {
    const create = fn('createScratchProfile')
    const a = asRecord(create(), 'createScratchProfile()')
    const p = String(a.path ?? a.dir ?? '')
    expect(resolve(p).startsWith(resolve(tmpdir()) + sep), `the profile path must live under the OS temp root: ${p}`).toBe(true)
    expect(resolve(p).startsWith(REPO_ROOT + sep), `the profile path must NOT live under the repo: ${p}`).toBe(false)
  })

  it('R-6 — the cleanup registration EXISTS and is reached by the scratch-creation path: creating a scratch profile is sufficient to ARM it, above any `process.exit` (C-3 item 1)', () => {
    expect(
      SOURCE_FACTS.exitSignals.length,
      `class (a) R-6 — at this head S-4 records NO \`process.on(…)\` / exit hook anywhere in the harness. Exit signals observed: ${JSON.stringify(SOURCE_FACTS.exitSignals)}`,
    ).toBeGreaterThan(0)
    expect(
      SOURCE_FACTS.exitSignals.some((s) => /^(exit|SIGINT|SIGTERM|beforeExit)$/.test(s)),
      `the registered hook must cover an exit path of C-3 item 3 (exit / SIGINT / SIGTERM); observed: ${JSON.stringify(SOURCE_FACTS.exitSignals)}`,
    ).toBe(true)
    // the registration is reached by the creation path (never below a gate that exits)
    expect(
      SOURCE_FACTS.registerCallIndex,
      'the scratch-creation path must reach `registerCleanup()` (C-3 item 1) — no call exists in the source',
    ).toBeGreaterThanOrEqual(0)
    const firstExit = SOURCE_FACTS.exitCalls.length > 0 ? Math.min(...SOURCE_FACTS.exitCalls) : -1
    expect(
      firstExit === -1 || SOURCE_FACTS.registerCallIndex < firstExit,
      'the cleanup registration must sit ABOVE every `process.exit` call (C-3 item 1 / F-5 rule (i)) — a validation gate that exits before the hook is exactly the measured leak',
    ).toBe(true)
    // and it is really armed by a creation (the exported creator must not throw for this)
    const create = fn('createScratchProfile')
    expect(attemptOf(() => { create() }), 'creating a scratch profile must ARM the cleanup without throwing (C-3 item 1)').toBeNull()
  })

  it('R-7 — the cleanup is IDEMPOTENT and its report names what it removed and what survived (C-3 items 2/5)', () => {
    const create = fn('createScratchProfile') as () => Record<string, unknown>
    const cleanup = fn('cleanupScratchProfiles') as (opts?: unknown) => Record<string, unknown>
    const made: string[] = []
    for (let i = 0; i < 2; i++) {
      const made0 = asRecord(create(), 'createScratchProfile()')
      made.push(String(made0.path ?? made0.dir ?? ''))
    }
    const first = asRecord(cleanup(), 'cleanupScratchProfiles()')
    for (const k of ['removed', 'leftover', 'passes', 'report']) {
      expect(Object.keys(first), `the cleanup report must name what it removed and what survived (C-3 item 5); \`${k}\` is absent`).toContain(k)
    }
    expect(Array.isArray(first.removed), 'report.removed must be a list of removed paths (C-3 item 5)').toBe(true)
    expect(Array.isArray(first.leftover), 'report.leftover must be a list of surviving paths (C-3 item 5)').toBe(true)
    expect(typeof first.passes, 'report.passes must be the bounded pass count (C-3 item 4)').toBe('number')
    expect(String(first.report), 'the report must be printable on EVERY run, with `leftover: NONE` as the honest counterpart (C-3 item 5)').toMatch(/leftover/i)
    for (const p of made) {
      expect(existsSync(p), `the sweep must leave ZERO scratch directories behind (C-3 item 3): ${p} survived`).toBe(false)
    }
    const second = asRecord(cleanup(), 'cleanupScratchProfiles() (second call)')
    expect(Array.isArray(second.removed) && second.removed.length === 0, 'the second cleanup call must remove NOTHING (C-3 item 2 — idempotent)').toBe(true)
    expect(String(second.report), 'the idempotent second call must report `leftover: NONE` (C-3 items 2/5)').toMatch(/NONE/i)
  })

  it('R-8 — the sweep is a BOUNDED DELETE-AND-VERIFY loop with an honest `leftover`/disk agreement (C-3 items 4/5/6)', () => {
    const cleanup = fn('cleanupScratchProfiles') as (opts?: unknown) => Record<string, unknown>
    const create = fn('createScratchProfile') as () => Record<string, unknown>
    const killed: number[] = []
    const makeOne = (): string => {
      const m = asRecord(create(), 'createScratchProfile()')
      return String(m.path ?? m.dir ?? '')
    }
    // (a) REMOVED: the real sweep on a real profile removes it and reports it
    const survives = makeOne()
    const removed = asRecord(cleanup({ killChildren: () => { killed.push(1) } }), 'cleanupScratchProfiles() with the child-kill seam')
    expect(existsSync(survives), `the bounded sweep must DELETE the profile (C-3 item 4): ${survives}`).toBe(false)
    expect((removed.removed as unknown[]).map(String), 'the report must NAME what it removed (C-3 item 5)').toContain(survives)
    expect((removed.leftover as unknown[]).length, 'nothing survived, so `leftover` must be EMPTY — a `NONE` report beside a surviving directory is the F-4 defect re-landed (C-3 item 5)').toBe(0)
    expect(killed.length, 'the children must be killed BEFORE the sweep (C-3 item 6)').toBeGreaterThan(0)
    // (b) LEFTOVER: a delete that does not take effect must be NAMED, never silently swallowed
    const stubborn = makeOne()
    const left = asRecord(cleanup({ deletePath: () => undefined }), 'cleanupScratchProfiles() with a no-op delete seam')
    expect((left.leftover as unknown[]).map(String), 'a surviving directory must be reported BY NAME (C-3 item 5)').toContain(stubborn)
    expect(String(left.report), 'the report must carry the leftover path and the pass count (C-3 item 4/5)').toContain(stubborn)
    expect(existsSync(stubborn), 'a no-op delete leaves the directory on disk; the report must agree with the disk').toBe(true)
    rmSync(stubborn, { recursive: true, force: true })
    // (c) the sweep must be BOUNDED and must RE-VERIFY: a no-op delete is tried repeatedly, then reported
    const passesOf = Number(left.passes)
    expect(passesOf, 'the sweep must be bounded by a pass count > 1 (C-3 item 4 — a single `rmSync` is the defect)').toBeGreaterThan(1)
  })
})

describe('U-DIVERGENCE-SPAWN §4.2 class (a) R-10 — the env pair KEPT (C-4)', () => {
  it('R-10 — `env` is `{...process.env, DISPLAY: process.env.DISPLAY || \':0\', ELECTRON_DISABLE_SANDBOX: \'1\'}`, `cwd` is the repo root, `stdio` is `[\'pipe\',\'pipe\',\'pipe\']` at the direct site', () => {
    const envPair = /\.\.\.process\.env\s*,\s*DISPLAY:\s*process\.env\.DISPLAY\s*\|\|\s*':0'\s*,\s*ELECTRON_DISABLE_SANDBOX:\s*'1'/.test(HARNESS_SRC)
    expect(envPair, 'C-4 item 1: the pinned env pair must stay at BOTH sites, byte-for-byte in shape (`ELECTRON_DISABLE_SANDBOX` and `--no-sandbox` are NOT this unit\u2019s to remove)').toBe(true)
    const envSites = (HARNESS_SRC.match(/\.\.\.process\.env\s*,\s*DISPLAY:/g) ?? []).length
    expect(envSites, `C-4 item 1: the env pair is verified-by-read at BOTH sites (S-5); observed ${envSites}`).toBe(2)
    expect(/cwd:\s*root\b/.test(HARNESS_SRC), 'C-4 item 2: `cwd` stays the repo root').toBe(true)
    expect(/\bstdio:\s*\[\s*'pipe'\s*,\s*'pipe'\s*,\s*'pipe'\s*\]/.test(HARNESS_SRC), "C-4 item 3: the direct site's stdio stays ['pipe','pipe','pipe']").toBe(true)
  })
})

describe('U-DIVERGENCE-SPAWN §4.2 class (a) R-11 — FAIL-LOUD: a boot failure names the cause (C-6)', () => {
  it('R-11(a) — the /dev/shm shared-memory refusal is NAMED from the harness\u2019s OWN accumulated stderr', () => {
    const classify = fn('classifyBootFailure') as (input: unknown, status?: unknown) => unknown
    const r = asRecord(classify('Creating shared memory in /dev/shm/.org.chromium.Chromium.abc failed: Permission denied (13)\n'), 'classifyBootFailure(/dev/shm text)')
    const text = JSON.stringify(r)
    expect(r.sharedMemory, 'C-6 item 2: the report must say it is a SHARED-MEMORY refusal').toBe(true)
    expect(text, 'C-6 item 2: the report must name the PATH involved').toContain('/dev/shm')
    expect(text, 'C-6 item 2: the report must state this is a HOST/ENVIRONMENT precondition, not evidence about the app').toMatch(/host|environment/i)
    expect(String(r.cause ?? ''), 'C-6 item 1: the cause line must be carried at the point of failure').toMatch(/shared memory|Permission denied/i)
  })

  it('R-11(b) — a SIGNAL death (SIGTRAP class) is NAMED and a MISSING cause line is reported HONESTLY (C-6 items 3/5)', () => {
    const classify = fn('classifyBootFailure') as (input: unknown, status?: unknown) => unknown
    const bySignal = asRecord(classify('', { signal: 'SIGTRAP', code: null }), 'classifyBootFailure(signal death)')
    const signalText = JSON.stringify(bySignal)
    expect(signalText, 'C-6 item 3: the report must carry the SIGNAL').toContain('SIGTRAP')
    expect(bySignal.noCauseCaptured, 'C-6 item 5: an empty accumulation must be reported as NO CAUSE LINE CAPTURED, never as a diagnosis').toBe(true)
    const empty = asRecord(classify('', { code: 1 }), 'classifyBootFailure(empty stderr, exit code)')
    expect(empty.noCauseCaptured, 'C-6 item 5: the empty accumulation must be named honestly').toBe(true)
    expect(String(empty.cause ?? ''), 'C-6 item 5: the report must SAY that no cause line was captured rather than imply one').toMatch(/no cause|not captured|empty/i)
  })

  it('R-11(c) — the connection error stays visible and LABELLED as the downstream symptom (C-6 item 4); the arithmetic is not moved (C-6 item 6, read by R-12)', () => {
    const classify = fn('classifyBootFailure') as (input: unknown, status?: unknown) => unknown
    const r = asRecord(classify('', { code: null, connectionError: 'MCP error -32000: Connection closed' }), 'classifyBootFailure(connection error)')
    const text = JSON.stringify(r)
    expect(text, 'C-6 item 4: the SDK connection error must stay VISIBLE').toContain('-32000')
    expect(String(r.symptom ?? r.label ?? ''), 'C-6 item 4: it must be labelled as the DOWNSTREAM SYMPTOM of the cause line, never as the diagnosis').toMatch(/symptom/i)
    expect(text, 'C-6 item 4: the cause line and the symptom must be distinguishable in one report').toMatch(/cause/i)
  })
})

describe('U-DIVERGENCE-SPAWN §4.2 class (a) R-12 — the failure arithmetic KEPT (C-6 item 6 / C-7 item 4)', () => {
  it('R-12 — a boot failure still records its failure and still exits 1; a clean run exits 0; the exit contract stays {0,1}', () => {
    const exitCodeFor = fn('exitCodeFor') as (failures: number) => unknown
    expect(exitCodeFor(0), 'C-7 item 4 / C-6 item 6: a clean run exits 0').toBe(0)
    expect(exitCodeFor(1), 'C-6 item 6: a boot failure exits 1').toBe(1)
    expect(exitCodeFor(3), 'C-6 item 6: the exit contract stays {0,1} — a boot failure still exits 1, whatever the failure count').toBe(1)
    const ok = fn('ok') as (label: string, cond: boolean, extra?: string) => unknown
    const before = Number((fn('failureCount') as () => unknown)())
    ok('electron leg produced a result', false, 'electron failed to bootstrap')
    const after = Number((fn('failureCount') as () => unknown)())
    expect(after, 'S-6/R-12: the boot-failure branch must still record its failure (the arithmetic is not this unit\u2019s to move)').toBe(before + 1)
    expect(exitCodeFor(after), 'and the recorded failure must drive exit 1').toBe(1)
  })
})

describe('U-DIVERGENCE-SPAWN §4.2 class (a) R-13/R-14 — the PRESERVATION clause (C-7) and the pinned keys (D-3)', () => {
  it('R-13(a) — the comparison set is unchanged: the same `ok()` labels, in the same order (C-7 item 1)', () => {
    const labels = Array.from(HARNESS_SRC.matchAll(/\bok\(\s*(['"])(.*?)\1/g)).map((m) => m[2]!)
    const missing = COMPARISON_LABELS.filter((l) => !labels.includes(l))
    expect(missing, 'C-7 item 1: no comparison label may be dropped, merged or re-spelled by this unit').toEqual([])
    const order = labels.filter((l) => COMPARISON_LABELS.includes(l))
    expect(order, 'C-7 item 1: the labels must keep their recorded order').toEqual(COMPARISON_LABELS)
    expect(/function\s+ok\s*\(/.test(HARNESS_SRC), 'C-7 item 1: the `ok()` helper stays').toBe(true)
  })

  it('R-13(b) — the demo envelope literal is structurally unchanged: S-7\u2019s twelve nodes and their ids, in tree order (C-7 item 2)', () => {
    const demoEnvelope = fn('demoEnvelope') as () => unknown
    const env = demoEnvelope()
    const text = JSON.stringify(env)
    for (const id of ENVELOPE_CSS_IDS) {
      expect(text, `C-7 item 2 / S-7: the envelope literal must still carry the node id ${JSON.stringify(id)} — the fixture is the leg's identity surface and is NOT this unit's to move`).toContain(`"${id}"`)
    }
    const cssIds = Array.from(text.matchAll(/"css":\{"id":"([^"]+)"/g)).map((m) => m[1]!)
    expect(cssIds, `C-7 item 2 / S-7: the envelope's id-bearing nodes read ${JSON.stringify(cssIds)}; the recorded structure is ${JSON.stringify(ENVELOPE_CSS_IDS)}`).toEqual(ENVELOPE_CSS_IDS)
    const nodeObjs = Array.from(text.matchAll(/"type":"/g)).length
    expect(nodeObjs, `§7.3 item 6 / S-7: the demo envelope literal is TWELVE nodes`).toBe(ENVELOPE_NODE_COUNT)
  })

  it('R-14 — `package.json`\u2019s `scripts.divergence` is the pinned command and `scripts.test`/`scripts.test:watch` carry no `--testTimeout` (D-3 / G-9, a CROSS-CHECK)', () => {
    const pkg = JSON.parse(readText(PACKAGE_JSON_PATH)) as { scripts: Record<string, string> }
    expect(pkg.scripts.divergence, 'D-3: the `divergence` key is PINNED by the program and KEPT STABLE by this unit — its `build`-first clause is load-bearing (a stale-`dist` boot hazard otherwise)').toBe('npm run build && node scripts/electron-divergence.mjs')
    expect(pkg.scripts.test, 'G-9: `scripts.test` must stay the plain suite run').toBe('vitest run')
    expect(pkg.scripts.test, 'G-9: `scripts.test` must not carry `--testTimeout`').not.toMatch(/--testTimeout/)
    expect(pkg.scripts['test:watch'] ?? '', 'G-9: `scripts.test:watch` must not carry `--testTimeout`').not.toMatch(/--testTimeout/)
  })

  it('R-13(c)/C-10 — this class-(a) file reads only `node:*` builtins plus `vitest`, spawns no Electron and mocks nothing (an instrument self-check, not a contract row)', () => {
    const raw = readText(fileURLToPath(import.meta.url))
    expect(raw.length, 'the self-read must not be vacuous').toBeGreaterThan(1000)
    // the needles are BUILT FROM PARTS, so this file's own bytes carry no forbidden literal and
    // the scan needs no comment stripping to stay honest.
    const mockNeedle = new RegExp(['\\bvi\\s*\\.\\s*', 'mock', '\\b'].join(''))
    const spawnNeedle = new RegExp(['child', '_process'].join(''))
    expect(raw, 'C-10: no mock binding of any kind may enter this file (the protected bridge-mock census pins an exact five-name set)').not.toMatch(mockNeedle)
    expect(raw, 'C-10: the class-(a) rows must not spawn Electron — no child-process binding may enter this file').not.toMatch(spawnNeedle)
    expect(raw, 'C-10: this file must not boot Electron by any other route').not.toMatch(/\bnew\s+Electron\b/)
    const imports = Array.from(raw.matchAll(/^\s*import[^'"]*['"]([^'"]+)['"]/gm)).map((m) => m[1]!)
    expect(imports.length, 'the file must import only `node:*` builtins and `vitest`').toBeGreaterThan(0)
    expect(imports.filter((s) => !s.startsWith('node:') && s !== 'vitest'), 'C-10: no non-builtin, non-vitest import may enter this file').toEqual([])
    expect(imports, 'the class-(a) instrument binds no child-process module').not.toContain(spawnNeedle.source)
  })
})

// ===========================================================================
// §4.3 `C-9` — CLASS (b): the rows that need the REAL run. THE UNIT'S OWN GATE.
// These readings are produced by the live-scenario runner's pass (they cannot be authored
// here: the leg costs a full `npm run build` plus a real Electron boot, and `C-10` forbids
// booting Electron from the class-(a) instrument). The declared reading is carried verbatim
// so the DONE row has its shape: `R13 RESULT: <n> checks, 0 failures`, exit `0`.
// ===========================================================================
describe('U-DIVERGENCE-SPAWN §4.3 class (b) B-1..B-3 — THE REAL RUN (the unit\u2019s own gate, C-8)', () => {
  it.skip('B-1 [class (b), the live-scenario runner\u2019s pass] — the leg BOOTS and DRIVES: `R13 RESULT: <n> checks, 0 failures` AND exit 0, as ONE reading, with <n> RECORDED (C-5 items 1/3; settles O-1/O-2/O-5)', () => {
    // DECLARED STATE AT THIS HEAD: NOT RUN. The command is `npm run divergence`
    // (`npm run build && node scripts/electron-divergence.mjs`). The recorded red is
    // `R13 RESULT: 1 checks, 2 failures` with the real-Electron leg never booting (M-1/M-2).
    // A `0 failures` line beside a non-zero exit (or the reverse) is an INCONSISTENT LEG and
    // must be reported as such, never read as a green (C-5 item 1).
  })

  it.skip('B-2 [class (b), the live-scenario runner\u2019s pass] — the scratch root is EMPTY after the run: immediately after exit AND after a short settle, with the harness\u2019s own `leftover` line agreeing with the DISK (C-3 items 4/5; the F-4 defect is a `NONE` report beside a surviving directory)', () => {
    // DECLARED STATE AT THIS HEAD: NOT RUN — and structurally un-runnable as a disk reading
    // before the fix lands, because no scratch root exists yet (S-4). Park reason (RCA-11):
    // the surface is the real run's own post-exit disk census, which the class-(a) instrument
    // may not take (C-10 forbids booting Electron here).
  })

  it.skip('B-3 [class (b), the live-scenario runner\u2019s pass] — the fail-loud row is EXERCISED at least once under a forced-bad condition, or recorded NOT-EXERCISED with its reason (C-9 item 3 — never as a pass)', () => {
    // DECLARED STATE AT THIS HEAD: NOT-EXERCISED. The environment can be forced bad
    // (e.g. `DISPLAY=:99` on a non-existent display, or a read-only `TMPDIR`), and that run's
    // report must NAME the unmet prerequisite rather than a generic connection error (C-6
    // item 7). If the operator does not sanction the forced-bad run, this row is recorded
    // NOT-EXERCISED with that reason.
  })
})

// ===========================================================================
// §5.2 — THE TYPED REGISTER (EIGHT rows, `P-IM-`/`P-SM-`/`P-TP-` ONLY, NO `F-` row).
// Deterministic plain tables, no PBT library, no new devDependency (§5.1). Caps: ≤100
// attempts per row · ≤400 in total · STOP AFTER 5 CONSECUTIVE FAILURES; every row reports
// its strategy id, its DECLARED term printed as the sum of its own factors, its EXECUTED
// term, `held`/`broken`, `stoppedAt` and its counterexamples (§5.1's execution discipline).
// §5.3: no row asserts the leg's COLOUR; no row asserts the APP; every row reads the SAME
// instrument the class-(a) rows read.
//
// ⟨ROW-BODY REMAND (the implementer's measurement, executed 2026-09-28): the register's `finish()`
// requires `executed === declaredTotal` per row, and FOUR row bodies plus the report row could not
// be satisfied by any `src/`/`scripts/` change because their BODIES executed a DIFFERENT count than
// their DECLARED terms — `P-IM-1` executed 18 against 20 (an eight-member base against a nine-member
// vector), `P-IM-3` executed 7 against 5 (and its arms contradicted: `!existsSync(p)` beside
// `existsSync(p)` on the SAME just-created path), `P-SM-2` executed 9 against 12, `P-TP-2` executed 7
// against 6. The remedy taken here is the DECLARED column's: every body was widened/re-derived to
// execute its own declared factors (the terms are UNCHANGED — `20 + 6 + 5 + 12 + 12 + 8 + 6 + 6 = 75`),
// and no row's property was weakened. Each body carries its own re-derivation note.⟩
// ===========================================================================
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5

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
  { row: 'P-IM-1', strategyId: 'strat:divergence-spawn-vector', declared: '9×2+2', declaredTotal: 20 },
  { row: 'P-IM-2', strategyId: 'strat:divergence-spawn-profile-member', declared: '2×2+1+1', declaredTotal: 6 },
  { row: 'P-IM-3', strategyId: 'strat:divergence-spawn-freshness', declared: '2+1+1+1', declaredTotal: 5 },
  { row: 'P-SM-1', strategyId: 'strat:divergence-spawn-cleanup-armed', declared: '5×2+2', declaredTotal: 12 },
  { row: 'P-SM-2', strategyId: 'strat:divergence-spawn-sweep', declared: '3×2×2', declaredTotal: 12 },
  { row: 'P-SM-3', strategyId: 'strat:divergence-spawn-colour-arithmetic', declared: '3×2+2', declaredTotal: 8 },
  { row: 'P-TP-1', strategyId: 'strat:divergence-spawn-totality', declared: '2×2+2', declaredTotal: 6 },
  { row: 'P-TP-2', strategyId: 'strat:divergence-spawn-sites', declared: '2×2+2', declaredTotal: 6 },
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
      (report.counterexamples.length > 0 ? ` · counterexamples: ${report.counterexamples.slice(0, 5).join(' | ')}` : ''),
  ).toBe(true)
}

/** Run a register row's body: a body that THROWS (the contract surface is absent at this head)
 *  still reports the row — BROKEN, with the throw as its counterexample — so `stoppedAt`, the
 *  declared-vs-executed term and the counterexample list are never hidden by an early throw. */
function registerRow(id: string, body: (run: RowRun) => void): void {
  const run = newRun()
  const thrown = attemptOf(() => body(run))
  if (thrown !== null) attempt(run, run.attempts + 1, thrown)
  finish(id, run)
}

/** The site vectors as the register drives them (a snapshot taken at collection time). */
function siteVectors(): string[][] {
  return [...DIRECT_VECTORS, ...SDK_VECTORS].map((v) => v.members)
}

describe('U-DIVERGENCE-SPAWN §5.2 P-IM-1 — the spawn vector carries all NINE fixed members, once each, in order (strat:divergence-spawn-vector)', () => {
  it('P-IM-1 — 9 members × 2 sites + 2 negative draws = 20 attempts', () => {
    registerRow('P-IM-1', (run) => {
      const vectors = siteVectors()
      let i = 0
      // 9 members × 2 sites = 18: the FIRST EIGHT are literal-pinned (C-1 items 1/2), the NINTH
      // is read as the `--user-data-dir=` SHAPE (a per-spawn value, C-1 item 3), so the declared
      // nine are all executed and none is skipped. `P-IM-2` reads the ninth member's VALUE.
      // An absent site is drawn as an EMPTY vector so its nine draws become counterexamples BY
      // NAME — the declared `9 × 2` stays EXECUTED instead of being silently reduced.
      for (let s = 0; s < 2; s++) {
        const members = vectors[s] ?? []
        for (let m = 0; m < 8; m++) {
          const want = CONTRACT_BASE[m]!
          attempt(run, i++, members[m] === want ? null : `site ${s + 1}${vectors[s] === undefined ? ' (the instrument resolved NO such site)' : ''} member ${m + 1} reads ${JSON.stringify(members[m] ?? null)}; the contract pins ${JSON.stringify(want)}`)
        }
        attempt(run, i++, hasProfileValue(members[8] ?? '')
          ? null
          : `site ${s + 1} member 9 reads ${JSON.stringify(members[8] ?? null)}; the contract's ninth member is the per-spawn \`${PROFILE_PREFIX}<fresh scratch dir>\` member (C-1 items 2/3)`)
      }
      // the two NEGATIVE draws: the checker must reject a dropped and a duplicated member
      attempt(run, i++, contractViolations(fabricatedVector('drop'), 'a dropped-member draw').length > 0 ? null : 'a vector MISSING `--disable-dev-shm-usage` was ACCEPTED — the row cannot detect the flag\u2019s absence')
      attempt(run, i++, contractViolations(fabricatedVector('duplicate'), 'a duplicated-member draw').length > 0 ? null : 'a vector carrying `--disable-dev-shm-usage` TWICE was ACCEPTED — the row cannot detect a duplicate')
    })
  })
})

describe('U-DIVERGENCE-SPAWN §5.2 P-IM-2 — exactly ONE `--user-data-dir=` member per spawn, LAST, non-empty (strat:divergence-spawn-profile-member)', () => {
  it('P-IM-2 — 2 sites × (1 positive + 1 negative) + 1 last-position draw + 1 empty-value draw = 6 attempts', () => {
    registerRow('P-IM-2', (run) => {
      const vectors = siteVectors()
      let i = 0
      for (let s = 0; s < 2; s++) {
        const members = vectors[s] ?? []
        const positives = members.filter((x) => isProfileMember(x))
        attempt(run, i++, positives.length === 1 && hasProfileValue(positives[0]!) && members[members.length - 1] === positives[0]
          ? null
          : `site ${s + 1}: ${positives.length} profile member(s) ${JSON.stringify(positives)}; exactly one, LAST and non-empty is required (C-1 item 3)`)
        attempt(run, i++, contractViolations(fabricatedProfileVector('', 1), 'a zero-value draw').length > 0 && contractViolations(fabricatedProfileVector('/tmp/a', 2), 'a two-member draw').length > 0
          ? null
          : 'the checker ACCEPTED an empty-value or a two-member profile draw — `zero members / two members` must both be rejected (P-IM-2\u2019s declared negative)')
      }
      const all = vectors.flat()
      const profiles = all.filter((x) => isProfileMember(x))
      attempt(run, i++, profiles.length === 2 ? null : `the leg\u2019s two sites carry ${profiles.length} profile member(s) in total; each spawn needs its OWN (C-2 item 4)`)
      attempt(run, i++, profiles.length > 0 && profiles.every((p) => hasProfileValue(p)) ? null : `an empty profile value was composed: ${JSON.stringify(profiles)}`)
    })
  })
})

describe('U-DIVERGENCE-SPAWN §5.2 P-IM-3 — every profile path is FRESH and OUTSIDE the repo (strat:divergence-spawn-freshness)', () => {
  it('P-IM-3 — 2 distinct calls (pre-existence false / post-existence true) + 1 prefix draw + 1 outside-repo draw + 1 distinctness draw = 5 attempts', () => {
    registerRow('P-IM-3', (run) => {
      const create = fn('createScratchProfile') as () => Record<string, unknown>
      let i = 0
      // ── THE ARM PAIR, RE-DERIVED (the measured contradiction): the two arms are ONE
      //    freshness observation taken on TWO points of the same two calls — the PRE-state
      //    observed IMMEDIATELY BEFORE the call that creates the path, and the POST-state
      //    observed IMMEDIATELY AFTER it. The as-filed body asked BOTH of one path AFTER the
      //    call (`!existsSync(p)` and then `existsSync(p) && isDirectory()` on the same `p`),
      //    which no correct implementation can satisfy: a returned scratch path exists by
      //    construction (C-2 items 1/3), so the pair was unsatisfiable and reported ≥1
      //    counterexample forever. The two arms below are MUTUALLY CONSISTENT because they
      //    read DIFFERENT points of DIFFERENT calls: arm (a) is armed on a call not yet begun,
      //    arm (b) confirms the path the SAME call then returns. The `mkdtemp`-class call is
      //    what makes both true at once (C-2 item 1: unpredictable AND previously-non-existent).
      //    ⟨HONESTY LIMIT (`§5.3`, recorded rather than smoothed over): the pre-call arm reads
      //    the OBSERVED absence of the path we are about to observe being created, not a
      //    post-hoc memory of the call's own internals — an observation of a return value
      //    cannot witness a state that precedes it.⟩
      // arm (a) — THE PRE-STATE OF CALL 1: the path call 1 returns is NOT an entry of the baseline
      // read BEFORE any call of this row, i.e. it did not exist as the call began. Deliberately
      // NOT `!existsSync(firstPath)`: that read happens AFTER the call, where a correct creator has
      // already made the directory — asserting absence there is the unsatisfiable arm this
      // re-derivation removes. The pre-existence half is read from the baseline; the existence half
      // by arm (b).
      const preRoot = resolve(tmpdir())
      const baseline = ((): Set<string> => {
        try { return new Set(readdirSync(preRoot).map((n) => join(preRoot, n))) } catch { return new Set<string>() }
      })()
      let firstPath = ''
      let secondPath = ''
      for (let n = 0; n < 2; n++) {
        const made = asRecord(create(), 'createScratchProfile()')
        const p = String(made.path ?? made.dir ?? '')
        if (n === 0) {
          // call 1 · the PRE-EXISTENCE half (C-2 items 1/3)
          firstPath = p
          attempt(run, i++, p !== '' && !baseline.has(p)
            ? null
            : `call 1: the returned path must NOT have existed before the call (C-2 items 1/3); read ${JSON.stringify(p)} against a pre-call baseline of ${String(baseline.size)} entr(ies)`)
        } else {
          // call 2 · the POST-EXISTENCE half (C-2 item 3)
          secondPath = p
          attempt(run, i++, p !== '' && existsSync(p) && statSync(p).isDirectory()
            ? null
            : `call 2: the returned path must EXIST as a directory after the call (C-2 item 3): ${JSON.stringify(p)}`)
        }
      }
      // the three remaining declared draws, read on the pair the two calls produced
      attempt(run, i++, /div/i.test(firstPath.slice(tmpdir().length)) ? null : `the basename ${JSON.stringify(firstPath)} carries no LEG-IDENTIFYING prefix (C-2 item 3)`)
      attempt(run, i++, firstPath !== '' && !resolve(firstPath).startsWith(REPO_ROOT + sep) ? null : `the profile lives under the repo (C-2 item 2 / C-3 item 7): ${firstPath}`)
      attempt(run, i++, firstPath !== secondPath && secondPath !== '' ? null : `two calls returned the same path ${JSON.stringify(firstPath)} — freshness is PER CALL (C-2 items 1/4)`)
    })
  })
})

describe('U-DIVERGENCE-SPAWN §5.2 P-SM-1 — the cleanup is ARMED AT CREATION and survives EVERY exit path (strat:divergence-spawn-cleanup-armed)', () => {
  it('P-SM-1 — 5 exit paths × 2 arms (armed-at-creation · idempotent second call) + 2 negative draws = 12 attempts', () => {
    registerRow('P-SM-1', (run) => {
      const create = fn('createScratchProfile') as () => Record<string, unknown>
      const cleanup = fn('cleanupScratchProfiles') as (opts?: unknown) => Record<string, unknown>
      const EXIT_PATHS = ['green (exit 0)', 'red (exit 1, the R13 failure path)', 'boot failure (the leg-1 catch path)', 'a thrown error before any comparison', 'an operator interrupt (SIGINT/SIGTERM)']
      let i = 0
      for (const path of EXIT_PATHS) {
        const made = ((): string => {
          const m = asRecord(create(), 'createScratchProfile()')
          return String(m.path ?? m.dir ?? '')
        })()
        // ARM 1 — the sweep runs on this exit path and leaves ZERO profiles
        const report = asRecord(cleanup({ path }), `cleanupScratchProfiles({ path: ${path} })`)
        attempt(run, i++, !existsSync(made) && (report.removed as unknown[]).map(String).includes(made) ? null : `path ${path}: the sweep must run and leave zero scratch directories (C-3 item 3), report ${JSON.stringify(report)}`)
        // ARM 2 — the second call is idempotent and reports nothing removed
        const second = attemptOf(() => {
          const r2 = asRecord(cleanup({ path }), 'cleanupScratchProfiles() (second call)')
          if ((r2.removed as unknown[]).length !== 0) throw new Error(`the second call removed ${(r2.removed as unknown[]).length} path(s); idempotency requires 0 (C-3 item 2)`)
          if (!/NONE/i.test(String(r2.report))) throw new Error('the idempotent second call must report `leftover: NONE` (C-3 items 2/5)')
        })
        attempt(run, i++, second)
      }
      // the two NEGATIVE draws — the ordering rules that made F-5 a measured leak
      attempt(run, i++, SOURCE_FACTS.registerCallIndex >= 0 && (SOURCE_FACTS.exitCalls.length === 0 || SOURCE_FACTS.registerCallIndex < Math.min(...SOURCE_FACTS.exitCalls))
        ? null
        : 'NEGATIVE: a hook registered AFTER the boot / BELOW a gate that can `process.exit` is the F-5 (i) leak — the registration must precede every `process.exit` (C-3 item 1)')
      attempt(run, i++, /process\.on\(\s*['"](exit|SIGINT|SIGTERM|beforeExit)['"]/.test(HARNESS_SRC)
        ? null
        : `NEGATIVE: no exit hook is registered at all (observed signals: ${JSON.stringify(SOURCE_FACTS.exitSignals)})`)
    })
  })
})

describe('U-DIVERGENCE-SPAWN §5.2 P-SM-2 — the sweep is a BOUNDED delete-and-verify loop and its report is HONEST (strat:divergence-spawn-sweep)', () => {
  it('P-SM-2 — 3 states × 2 arms (report / disk agreement, both directions) = 12 attempts', () => {
    registerRow('P-SM-2', (run) => {
      const create = fn('createScratchProfile') as () => Record<string, unknown>
      const cleanup = fn('cleanupScratchProfiles') as (opts?: unknown) => Record<string, unknown>
      let i = 0
      // ── THE DECLARED TERM IS 3 STATES × 2 ARMS × 2 DIRECTIONS = 12. The as-filed body ran a
      //    THREE-arm "leftover" state plus two trailing agreement draws on ONE state (2+3+2+2 = 9),
      //    so the declared `3×2×2` was never executed. Re-derived: each of the three states carries
      //    the SAME two arms — (1) the REPORT arm (`removed` names what went, `leftover` names what
      //    stayed, `report` prints the honest counterpart and the bounded pass count) and (2) the
      //    DISK arm (what that state left on the leg's own scratch root, read from disk) — and the
      //    pair is read in BOTH DIRECTIONS (C-3 item 5): `report ⇒ disk` (nothing named as removed
      //    may survive) and `disk ⇒ report` (nothing that survives may go unreported).
      //    ⟨INSTRUMENT NOTE (`§5.3`, recorded): the states are swept over the LEG'S OWN scratch root
      //    (`node:os`'s `tmpdir()`, C-2 item 2), because a state root of this file's own would never
      //    match a profile the creator makes — a per-state `scratchRoot` restriction is structurally
      //    unreadable here and would have made all three states vacuous. The bounded >1-pass draw is
      //    read on the survivor state, where a bounded sweep is the property at stake.⟩
      const root = resolve(tmpdir())
      const mk = (): string => {
        const m = asRecord(create(), 'createScratchProfile()')
        return String(m.path ?? m.dir ?? '')
      }
      const underRoot = (p: string): boolean => resolve(p).startsWith(root + sep)
      // STATE 1 — survives-then-gone (`removed` named; the disk agrees it is gone)
      const gone = mk()
      const rGone = asRecord(cleanup(), 'cleanupScratchProfiles() on a removable profile')
      const goneRemoved = (rGone.removed as unknown[]).map(String)
      // report arm
      attempt(run, i++, goneRemoved.includes(gone) && !(rGone.leftover as unknown[]).map(String).includes(gone)
        ? null
        : `state removed · report arm: the report must NAME ${gone} in \`removed\` and NOT in \`leftover\` (C-3 item 5); read removed=${JSON.stringify(rGone.removed)} leftover=${JSON.stringify(rGone.leftover)}`)
      // disk arm
      attempt(run, i++, !existsSync(gone)
        ? null
        : `state removed · disk arm: the sweep must DELETE the profile (C-3 item 4); ${gone} survives`)
      // the two directions of the report/disk agreement (C-3 item 5)
      attempt(run, i++, goneRemoved.every((p) => !existsSync(p))
        ? null
        : `state removed · agreement (report ⇒ disk): every path the report named as removed must be GONE; read ${JSON.stringify(goneRemoved)}`)
      attempt(run, i++, (rGone.leftover as unknown[]).map(String).every((p) => underRoot(p) && existsSync(p))
        ? null
        : `state removed · agreement (disk ⇒ report): every path the report kept as a leftover must be a REAL surviving directory under the leg's scratch root (C-3 items 4/5); read ${JSON.stringify(rGone.leftover)}`)
      // STATE 2 — survives every pass (`leftover` named, bounded, and the disk agrees it survived)
      const stubborn = mk()
      const rLeft = asRecord(cleanup({ deletePath: () => undefined }), 'cleanupScratchProfiles() with a no-op delete')
      const passes = Number(rLeft.passes)
      const leftNamed = (rLeft.leftover as unknown[]).map(String)
      // report arm — the survivor is NAMED in both the list and the printed line, and the sweep is BOUNDED
      attempt(run, i++, leftNamed.includes(stubborn) && String(rLeft.report).includes(basename(stubborn)) && Number.isFinite(passes) && passes > 1
        ? null
        : `state leftover · report arm: the surviving directory must be NAMED in \`leftover\` AND in the printed report, and the sweep must be BOUNDED with more than one pass (C-3 items 4/5 — a single \`rmSync\` is the F-4 defect re-landed); read leftover=${JSON.stringify(rLeft.leftover)} passes=${String(rLeft.passes)} report=${JSON.stringify(rLeft.report)}`)
      // disk arm
      attempt(run, i++, existsSync(stubborn) && underRoot(stubborn)
        ? null
        : `state leftover · disk arm: a no-op delete leaves the directory on disk, under the leg's scratch root (C-3 item 4); read ${JSON.stringify(stubborn)}`)
      attempt(run, i++, existsSync(stubborn) && !/NONE/i.test(String(rLeft.report))
        ? null
        : `state leftover · agreement (disk ⇒ report): a surviving directory beside a \`leftover: NONE\` line is exactly the F-4 defect — the report must disagree with a disk that keeps a directory (C-3 item 5); read ${JSON.stringify(rLeft.report)}`)
      attempt(run, i++, leftNamed.includes(stubborn) && String(rLeft.report).includes(basename(stubborn))
        ? null
        : 'state leftover · agreement (report ⇒ disk): the report must carry the surviving PATH, so the disagreement is readable (C-3 item 5)')
      rmSync(stubborn, { recursive: true, force: true })
      // STATE 3 — nothing to do: state 2 was drained by its own sweep, so this call has no target
      const rEmpty = asRecord(cleanup(), 'cleanupScratchProfiles() with nothing left to sweep')
      // report arm
      attempt(run, i++, (rEmpty.removed as unknown[]).length === 0 && (rEmpty.leftover as unknown[]).length === 0 && /NONE/i.test(String(rEmpty.report))
        ? null
        : `state empty · report arm: nothing to do must produce an EMPTY report whose honest counterpart is a \`leftover: NONE\` line (C-3 item 5); read ${JSON.stringify(rEmpty)}`)
      // disk arm
      attempt(run, i++, !existsSync(gone) && !existsSync(stubborn)
        ? null
        : 'state empty · disk arm: the two earlier sweeps must have left nothing behind — nothing to do is a disk fact, not a hope (C-3 items 3/4)')
      // the two directions, read on the empty/third state: NONE must be honest in both
      attempt(run, i++, /NONE/i.test(String(rEmpty.report)) && (rEmpty.removed as unknown[]).length === 0 && (rEmpty.leftover as unknown[]).length === 0
        ? null
        : 'state empty · agreement (report ⇒ disk): a `NONE` line must be the honest counterpart of a report that claims neither a removal nor a leftover (C-3 item 5)')
      attempt(run, i++, (rEmpty.removed as unknown[]).map(String).every((p) => !existsSync(p))
        ? null
        : `state empty · agreement (disk ⇒ report): the third state must not revive a path an earlier state removed; read ${JSON.stringify(rEmpty.removed)}`)
    })
  })
})

describe('U-DIVERGENCE-SPAWN §5.2 P-SM-3 — the leg\u2019s colour and arithmetic are driven by the comparison rows, not by a `stderr` substring (strat:divergence-spawn-colour-arithmetic)', () => {
  it('P-SM-3 — 3 boot states × 2 stderr states + 2 consistency draws = 8 attempts', () => {
    registerRow('P-SM-3', (run) => {
      const classify = fn('classifyBootFailure') as (input: unknown, status?: unknown) => Record<string, unknown>
      const exitCodeFor = fn('exitCodeFor') as (failures: number) => number
      const SHM = 'Creating shared memory in /dev/shm/.org.chromium.Chromium.abc failed: Permission denied (13)\n'
      const BOOT_STATES: Array<{ label: string; status: unknown; success: boolean }> = [
        { label: 'success', status: { code: 0 }, success: true },
        { label: 'failure', status: { code: 1 }, success: false },
        { label: 'signal-death', status: { code: null, signal: 'SIGTRAP' }, success: false },
      ]
      let i = 0
      for (const s of BOOT_STATES) {
        for (const withCause of [true, false]) {
          const out = attemptOf(() => { asRecord(classify(withCause ? SHM : '', s.status), 'classifyBootFailure(...)') })
          if (out !== null) { attempt(run, i++, `boot ${s.label} / cause ${withCause ? 'present' : 'absent'}: classifyBootFailure threw — ${out}`); continue }
          const r = classify(withCause ? SHM : '', s.status)
          const ce = s.success
            ? (r.failureRecorded === false || r.failureRecorded === undefined ? null : `a SUCCESSFUL boot must not record a failure because a cause line is present in stderr (C-6 / A-6); read failureRecorded=${String(r.failureRecorded)}`)
            : (r.failureRecorded === true ? null : `boot ${s.label}: a failing boot must still RECORD its failure and exit 1 (C-6 item 6); read failureRecorded=${String(r.failureRecorded)}`)
          attempt(run, i++, ce)
        }
      }
      attempt(run, i++, exitCodeFor(0) === 0 && exitCodeFor(1) === 1 && exitCodeFor(4) === 1 ? null : 'consistency: the exit contract must stay {0,1} (C-6 item 6)')
      attempt(run, i++, exitCodeFor(0) === 0 && exitCodeFor(2) === 1 ? null : 'consistency: `0 failures` ⇒ exit 0 and `>0 failures` ⇒ exit 1; a `0 failures` line with a non-zero exit (or the reverse) is an INCONSISTENT LEG (C-5 item 1)')
    })
  })
})

describe('U-DIVERGENCE-SPAWN §5.2 P-TP-1 — no input shape throws where a reported outcome is contract (strat:divergence-spawn-totality)', () => {
  it('P-TP-1 — 2 failure sources × 2 report arms + 2 empty-accumulation draws = 6 attempts', () => {
    registerRow('P-TP-1', (run) => {
      const classify = fn('classifyBootFailure') as (input: unknown, status?: unknown) => unknown
      let i = 0
      for (const source of ['a synchronous throw', 'a child `error` event'] as const) {
        for (const arm of ['a named cause', 'the no-cause-line honesty'] as const) {
          const out = attemptOf(() => {
            const r = asRecord(classify(arm === 'a named cause' ? 'Permission denied (13) on /dev/shm' : '', { code: null, errorSource: source }), 'classifyBootFailure(...)')
            if (arm === 'a named cause' && String(r.cause ?? '') === '') throw new Error('no cause line')
            if (arm === 'the no-cause-line honesty' && r.noCauseCaptured !== true) throw new Error('an empty accumulation must set `noCauseCaptured`')
          })
          attempt(run, i++, out === null ? null : `${source} / ${arm}: ${out} — a spawn failure must produce a NAMED report, never an unhandled rejection and never a bare undefined (P-TP-1)`)
        }
      }
      for (const emptyInput of ['', undefined] as const) {
        const out = attemptOf(() => {
          const r = asRecord(classify(emptyInput, { code: 1 }), 'classifyBootFailure(empty accumulation)')
          if (typeof r !== 'object' || r === null) throw new Error('the report is not an object')
          if (r.noCauseCaptured !== true) throw new Error('an empty or absent accumulation must be reported as no cause line captured (C-6 item 5)')
        })
        attempt(run, i++, out === null ? null : `an accumulation of ${String(emptyInput === '' ? 'the empty string' : 'undefined')}: ${out}`)
      }
    })
  })
})

describe('U-DIVERGENCE-SPAWN §5.2 P-TP-2 — every spawn site is covered and no third child is created (strat:divergence-spawn-sites)', () => {
  it('P-TP-2 — 2 sites × 2 arms (vector identity · profile identity + distinctness) + 2 negative draws = 6 attempts', () => {
    registerRow('P-TP-2', (run) => {
      const vectors = siteVectors()
      let i = 0
      // ── THE DECLARED TERM IS 2 SITES × 2 ARMS + 2 NEGATIVE DRAWS = 6. The two arms are the
      //    ones §5.2 names: (1) VECTOR IDENTITY — the site's non-profile members are the
      //    contract's fixed eight; (2) PROFILE IDENTITY + DISTINCTNESS — the site's profile
      //    member is its own and is the LAST member, and it is not the other site's. The as-filed
      //    body ran the distinctness draw as a THIRD, extra attempt (2+2+1+2 = 7), so the
      //    declared `2×2+2` was never executed. Re-homing distinctness INTO arm 2 restores the
      //    declared count and keeps the property: a shared profile is inadmissible (C-2 item 4).
      for (let s = 0; s < 2; s++) {
        // an absent site is drawn as an EMPTY vector: that site's two arms become counterexamples
        // BY NAME, and the declared `2 sites × 2 arms` stays EXECUTED rather than silently
        // reduced (a short instrument is a counterexample, never a smaller row).
        const members = vectors[s] ?? []
        const norm = normalizedMembers(members)
        attempt(run, i++, JSON.stringify(norm) === JSON.stringify(CONTRACT_BASE.slice(0, 8)) ? null : `site ${s + 1}${vectors[s] === undefined ? ' (the instrument resolved NO such site; the S-1 pair is exactly 2)' : ''} · arm 1 (vector identity): the non-profile members read ${JSON.stringify(norm)}; the contract base is ${JSON.stringify(CONTRACT_BASE.slice(0, 8))}`)
        const mine = members.find((x) => isProfileMember(x))
        const theirs = (vectors[s === 0 ? 1 : 0] ?? []).find((x) => isProfileMember(x))
        attempt(run, i++, mine !== undefined && hasProfileValue(mine) && members[members.length - 1] === mine && mine !== theirs
          ? null
          : `site ${s + 1} · arm 2 (profile identity + distinctness): the site must carry its OWN non-empty profile member LAST (read ${JSON.stringify(mine)}) and must NOT share it with the other site (the other site reads ${JSON.stringify(theirs)}) — a concurrent two-writer profile is not an isolation (C-2 item 4)`)
      }
      // NEGATIVE 1 — the profile creator spawns NOTHING (C-1 item 5)
      attempt(run, i++, SOURCE_FACTS.spawnCalls === 2 && SOURCE_FACTS.otherChildApis.length === 0
        ? null
        : `NEGATIVE: the module must create exactly TWO Electron children (S-1) and no other child (\`spawn\` call count ${SOURCE_FACTS.spawnCalls}; other child-process APIs ${JSON.stringify(SOURCE_FACTS.otherChildApis)}). The foundation measured the four-processes-not-two hazard (F-4)`)
      // NEGATIVE 2 — no site may be left on the OLD vector: a site missing the pair is rejected
      attempt(run, i++, contractViolations([MAIN_CJS_MEMBER, '--mcp-transport=stdio', '--no-sandbox', '--disable-gpu', '--disable-software-rasterizer', '--in-process-gpu', '--ozone-platform=x11', `${PROFILE_PREFIX}/tmp/old`], 'a site left on the old vector').length > 0
        ? null
        : 'NEGATIVE: a site left on the OLD vector (no `--disable-dev-shm-usage`) was ACCEPTED — the row cannot detect a one-site-only fix')
    })
  })
})

describe('U-DIVERGENCE-SPAWN §5.2 — THE REGISTER REPORT (declared vs executed, held/broken, stoppedAt, counterexamples)', () => {
  it('§5.2 — the register is exactly the EIGHT declared rows, `P-IM-`/`P-SM-`/`P-TP-` ONLY (no `F-` row), the declared total is 75 and every term is the sum of its own factors', () => {
    expect(DECLARED_REGISTER.map((r) => r.row), 'the register is authored in the declared register order').toEqual([
      'P-IM-1', 'P-IM-2', 'P-IM-3', 'P-SM-1', 'P-SM-2', 'P-SM-3', 'P-TP-1', 'P-TP-2',
    ])
    expect(DECLARED_REGISTER.length, 'the register is EXACTLY eight rows — the cap, exactly full').toBe(8)
    for (const row of DECLARED_REGISTER) {
      expect(row.row, `${row.row}: only \`P-IM-\`/\`P-SM-\`/\`P-TP-\` rows may appear — NEVER an \`F-\` row`).toMatch(/^P-(IM|SM|TP)-\d$/)
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
    expect(total, 'the arithmetic printed with its terms: `20 + 6 + 5 + 12 + 12 + 8 + 6 + 6 = 75`').toBe(75)
    expect(total, `the total must be ≤ ${CAPS.total}`).toBeLessThanOrEqual(CAPS.total)
  })

  it('§5.2 — THE REGISTER REPORT: every row reported `held`/`broken` with its strategy id, its declared-vs-executed term, `stoppedAt` and its counterexamples (a report, never a silent pass)', () => {
    const missing = DECLARED_REGISTER.filter((r) => !REPORTS.some((rep) => rep.row === r.row)).map((r) => r.row)
    expect(missing, 'every declared register row must have RUN and reported — a term dropped from the table without a contract amendment must be a LOUD failure, never a vacuous pass').toEqual([])
    const lines = REPORTS.map(
      (r) =>
        `${r.row} ${r.strategyId}: ${r.held ? 'held' : 'broken'} · declared ${r.declared} = ${r.declaredTotal} · executed ${r.executed} · ` +
        `stoppedAt ${String(r.stoppedAt)} · counterexamples ${r.counterexamples.length}`,
    )
    // eslint-disable-next-line no-console
    console.log('U-DIVERGENCE-SPAWN REGISTER REPORT\n' + lines.join('\n'))
    expect(
      REPORTS.every((r) => r.held),
      `every register row must hold at the green head; broken at this head: ${REPORTS.filter((r) => !r.held).map((r) => `${r.row} (executed ${r.executed}/${r.declaredTotal}, stoppedAt ${String(r.stoppedAt)})`).join(', ')}\nU-DIVERGENCE-SPAWN REGISTER REPORT\n${lines.join('\n')}`,
    ).toBe(true)
  })
})
