// tests/pd-store-core-adopt.test.ts — UNIT `U-STORE-CORE-ADOPT` (unit 1 of the
// store-adoption program, F2) — THE E-2 FIDELITY GUARD: the FIVE arms of
// `docs/specs/unit-store-core-adopt.md` §2.3, over the byte-pinned pair
// `src/renderer/store-core-graph.ts` (2372 L) + `src/renderer/store-graph-references.ts`
// (36 L).
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-store-core-adopt.md
//     §1.1 members 1/2  the pair lands BYTE-IDENTICAL to the foundation blob at
//                       `7bd1de4786c4d46a3fee02f72adaf6ef612985d1` (the recorded
//                       oracle; NEVER the working tree — R-2, F-2)
//     §1.2 item 2       the lock is NOT extended — the pair gains NO cell (R-4)
//     §1.2 item 3       `scripts/**`, `vitest.config.ts`'s `testTimeout`, and the
//                       `package.json` script key set stay untouched
//     §1.2 item 4       NO MCP surface — no tool/group/resource/`RpcMethod`/preload
//                       member/IPC key (K-3; F-8)
//     §2.1              the pair's ONLY import is `./store-graph-references.js`; the
//                       sibling imports NOTHING; zero ambient refs; the recorded
//                       readings `sha256:0664c52f…` / `5c0c1a97…` / span `29772ac7…`
//     §2.3              THE FIVE ARMS — existence; digest (local md5 re-probed twice ·
//                       recorded-reading re-probe with the guard's NAMED instrument ·
//                       the cross-tree blob arm, SKIPPED-when-absent, never a pass);
//                       import-closure census; the no-MCP-surface negative; the
//                       structural arm (`moduleCount` STAYS 15, no lock cell, the
//                       no-hydrate-at-boot limb)
//     §3 F-6/F-7        a `crossing` feed other than `null` and a `hydrate(` call in
//                       the boot wiring are MAJOR-7 fail-states
//     §4 R-1/R-1a       THE RED SET: arms 1, 2, 3 RED at the unit's own head (the
//                       modules do not exist — the module-does-not-exist class);
//                       arm 4 and arm 5's frozen-contract limbs GREEN-ON-ARRIVAL
//     §2.3              the honesty model: a SKIPPED arm is "neither a pass nor a
//                       failure", recorded with its reason — never reported as a pass
//
// HEAD ANCHORS: the recorded revision `7bd1de4786c4d46a3fee02f72adaf6ef612985d1`
// (the E-2 subject — the digest arms pin to it) and the fork's own pre-edit head
// `c62cdf9…` (REPORTED by the guard, never asserted: the landing moves it).
//
// THE RED-SET REPAIR RECONCILIATION (2026-10-04, the AUTHOR-ROLE correction — the
// spec-vs-store rows re-aimed to the LANDED store semantics; the module bytes
// `src/renderer/store-core-graph.ts` + `store-graph-references.ts` are the FROZEN
// AUTHORITY, byte-pinned to `7bd1de4786c4d46a3fee02f72adaf6ef612985d1` — never
// edited, never re-drived): the four re-aimed rows/limbs and the byte-true reading:
//   arm 1 — the sibling line census instrument RE-AIMED to wc-STYLE counting:
//     `split('\n').length` counts 37 for the byte-true 36-L blob (one phantom line
//     for the trailing newline); the re-aimed instrument counts `\n` separators
//     (a trailing-newline-aware census) — the byte-true sibling reads 36 L under it.
//   arm 2(b) — the recorded span literal `29772ac7…` is UNREPRODUCIBLE (a recording
//     error in `docs/specs/store-adoption-program.md` §1 row 18; the implementer
//     probed the pin, the HYDRATE-1 freeze and 11 amalgam variants — none match).
//     RE-AIMED to the byte-true span under the guard's own NAMED instrument
//     `sha256(mainBytes + siblingBytes)` in that order:
//     `6f6bc2f9ea3b285f624d6bf765e3ba2f10db2365cde5c20fc84d85c4229ba0bc` — computed
//     at this head (RE-CHECKED, never copied); the main/sibling sha256 limbs
//     (`0664c52f…` / `5c0c1a97…`) stay; the landing pass re-records the program
//     plan's §1 row 18 span cell.
//   arm 3 — the AMBIENT_TOKENS token regexes lacked the `g` flag →
//     `String.prototype.matchAll` THREW (a TypeError), aborting the census before its
//     `recordArm`; every token regex now carries the `g` flag — the scan's subjects
//     are the byte-true pair (ZERO ambient refs — the census must hold).
//   arm-verdict report — the unconditional pre-edit `expect(red).toBe(5)` is
//     UNREACHABLE at the landed head (the arm report counts the run's own arms; at
//     the landed head arms 4/5a are GREEN-ON-ARRIVAL and the rest green). RE-AIMED to
//     assert the LANDED head's verdicts — the seven arm rows (arm 2 split a+b/c;
//     arm 5 split frozen-limbs/MAJOR-7 evidence — the §2.3 arm enumeration's own
//     report shape) all GREEN; the red-run colours (§4 R-1/R-1a: arms 1/2(a+b)/2(c)/3
//     /5b RED — module-does-not-exist; 4/5a GREEN-ON-ARRIVAL) are RECORDED, never
//     asserted.
//
// LAYER (RCA-12): `[T]` node-suite / machine data. This guard asserts BYTES and
// SURFACE — never module BEHAVIOUR (the register owns that), never app/envelope/live
// state. Its git arms run `git` as a subprocess (the blob oracle's only honest form);
// the digest instruments are NAMED: `node:crypto` `createHash('md5')` /
// `createHash('sha256')`, and the SPAN instrument = `sha256(mainBytes + siblingBytes)`
// in that order (the pair-amalgam reading; re-checked, never copied).
//
// FENCE: every arm's `it` carries a bounded timeout strictly inside the untouched
// `testTimeout: 15_000` (`vitest.config.ts` is never edited — R-4, F-9).
import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const FOUNDATION = resolve(REPO_ROOT, '..', 'Provident-Electron')
const FOUNDATION_DISPLAY = '../Provident-Electron'

const MAIN_MODULE_PATH = join(REPO_ROOT, 'src', 'renderer', 'store-core-graph.ts')
const SIBLING_MODULE_PATH = join(REPO_ROOT, 'src', 'renderer', 'store-graph-references.ts')
const LOCK_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const RENDERER_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const MAIN_DIR = join(REPO_ROOT, 'src', 'main')
const PKG_PATH = join(REPO_ROOT, 'package.json')
const FORK_MCP_ENDPOINT_PATH = join(REPO_ROOT, 'docs', 'specs', 'mcp-endpoint.md')
const SELF_PATH = join(HERE, 'pd-store-core-adopt.test.ts')

/** MINOR 9 — THE P-16 CITATION SHAPE, as this guard's CODE carries it: `P-16` is cited
 *  to the FOUNDATION's `../Provident-Electron/docs/specs/mcp-endpoint.md` §6.4 ONLY —
 *  the fork's OWN `docs/specs/mcp-endpoint.md` is NEVER the citation site (it carries no
 *  `P-16` row). The SINGLE literal is the citation subject the arm-4 self-scan counts. */
const P16_CITATION = '../Provident-Electron/docs/specs/mcp-endpoint.md §6.4'

/** §1.1/§2.1 — the E-2 subject: the recorded foundation revision the pair is pinned to.
 *  The cross-tree blob arm AND the recorded-reading re-probes anchor here. */
const PINNED_COMMIT = '7bd1de4786c4d46a3fee02f72adaf6ef612985d1'

/** §2.1/§2.3 — the RECORDED readings (`docs/specs/store-adoption-program.md` §1,
 *  `RECORDED READING`s the digest arm re-probes: RE-CHECKED, never copied). The
 *  literals are recorded in their truncated `…` form, so the re-probe asserts the
 *  computed hash's recorded prefix. */
const RECORDED_MAIN_SHA256 = '0664c52f'
const RECORDED_SIBLING_SHA256 = '5c0c1a97'
/** THE SPAN READING, RE-AIMED (2026-10-04, RED-SET-REPAIR row 2 — annotate-beside
 *  beside the recording error's home): the plan's recorded `29772ac7…` (the span cell
 *  of `docs/specs/store-adoption-program.md` §1 row 18, the HYDRATE-1 freeze) is
 *  UNREPRODUCIBLE — a RECORDING ERROR: the implementer probed the pin, the HYDRATE-1
 *  freeze and 11 amalgam variants; none matches the guard's own NAMED instrument
 *  `sha256(mainBytes + siblingBytes)` in that order. The BYTE-TRUE span under that
 *  instrument, computed at this head (RE-CHECKED, never copied — the full reading,
 *  asserted by FULL equality so a diverged pair can never carry the prefix):
 *  `6f6bc2f9ea3b285f624d6bf765e3ba2f10db2365cde5c20fc84d85c4229ba0bc`. The landing
 *  pass re-records the program plan's §1 row 18 span cell with this value. */
const RECORDED_SPAN_SHA256 = '6f6bc2f9ea3b285f624d6bf765e3ba2f10db2365cde5c20fc84d85c4229ba0bc'

/** §2.3 arm 2 (a) — the LOCAL md5s the DONE row records as the pair's E-2 cell. */
interface LocalDigests {
  mainMd5: string | null
  siblingMd5: string | null
  mainSha256: string | null
  siblingSha256: string | null
  spanSha256: string | null
}

/** NAMED instruments: `node:crypto` md5/sha256, and the SPAN instrument =
 *  `sha256(mainBytes + siblingBytes)` (the pair-amalgam reading, in the order the
 *  program plan's E-2 class names the pair: file, then span). */
function md5(bytes: Buffer): string {
  return createHash('md5').update(bytes).digest('hex')
}
function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}
function spanSha256(mainBytes: Buffer, siblingBytes: Buffer): string {
  return sha256(Buffer.concat([mainBytes, siblingBytes]))
}

/** THE ARM-1 CENSUS INSTRUMENT, RE-AIMED (2026-10-04, the reconciliation block in the
 *  header — RED-SET-REPAIR row 1): wc-STYLE line counting. `split('\n').length`
 *  counts 37 for the byte-true 36-L sibling blob (ONE phantom line for the trailing
 *  newline); this instrument counts the `\n` SEPARATORS (trailing-newline-aware: a
 *  file that does not end in `\n` still has one last line) — the byte-true sibling,
 *  which ends in a trailing newline, reads its recorded 36 L under it. */
function wcStyleLineCount(text: string): number {
  const newlines = (text.match(/\n/g) ?? []).length
  return text.length > 0 && !text.endsWith('\n') ? newlines + 1 : newlines
}

function readMaybe(path: string): Buffer | null {
  try {
    return existsSync(path) ? readFileSync(path) : null
  } catch {
    return null
  }
}

function readText(path: string): string {
  return readFileSync(path, 'utf8')
}

/** The pair's digest reading at the head: every limb's subject, computed once. An
 *  absent file yields `null` limbs — the arm's absent-subject RED, never a pass. */
function localDigests(): LocalDigests {
  const main = readMaybe(MAIN_MODULE_PATH)
  const sibling = readMaybe(SIBLING_MODULE_PATH)
  return {
    mainMd5: main === null ? null : md5(main),
    siblingMd5: sibling === null ? null : md5(sibling),
    mainSha256: main === null ? null : sha256(main),
    siblingSha256: sibling === null ? null : sha256(sibling),
    spanSha256: main !== null && sibling !== null ? spanSha256(main, sibling) : null,
  }
}

/** §2.3 arm 2 (a) — the LOCAL md5 RE-PROBE: the file is read and hashed TWICE at the
 *  unit's head; the two readings must be stable (a re-probe that differs from the
 *  record is a byte-divergence RED). */
function localMd5ReProbe(path: string, label: string): string | null {
  const bytes = readMaybe(path)
  if (bytes === null) return `ABSTRACT-SUBJECT: ${label} is ABSENT at ${relative(REPO_ROOT, path)} — the local md5 re-probe has no subject (module-does-not-exist)`
  const first = md5(bytes)
  const second = md5(readFileSync(path))
  return first === second
    ? null
    : `MD5-UNSTABLE: ${label} hashed to ${first} then ${second} on the two re-probes — the file changed between the probes`
}

/** §2.3 arm 2 (b) — the recorded-reading re-probe. The guard's probe note states the
 *  readings are RE-CHECKED, never copied: the computed hashes must carry the recorded
 *  prefixes, and the FULL computed readings are printed for the DONE row's E-2 cell. */
function recordedReadingProbe(d: LocalDigests): string[] {
  const problems: string[] = []
  if (d.mainSha256 === null) {
    problems.push(`ABSTRACT-SUBJECT: store-core-graph.ts is ABSENT — the recorded file sha256 ${RECORDED_MAIN_SHA256}… cannot be RE-PROBED (module-does-not-exist)`)
  } else if (!d.mainSha256.startsWith(RECORDED_MAIN_SHA256)) {
    problems.push(`RECORDED-READING-DIVERGED: the main module's sha256 is ${d.mainSha256}… which does NOT carry the recorded ${RECORDED_MAIN_SHA256}… — the pair is not the recorded blob`)
  }
  if (d.siblingSha256 === null) {
    problems.push(`ABSTRACT-SUBJECT: store-graph-references.ts is ABSENT — the recorded sibling sha256 ${RECORDED_SIBLING_SHA256}… cannot be RE-PROBED (module-does-not-exist)`)
  } else if (!d.siblingSha256.startsWith(RECORDED_SIBLING_SHA256)) {
    problems.push(`RECORDED-READING-DIVERGED: the sibling's sha256 is ${d.siblingSha256}… which does NOT carry the recorded ${RECORDED_SIBLING_SHA256}…`)
  }
  if (d.spanSha256 === null) {
    problems.push(`ABSTRACT-SUBJECT: the pair is INCOMPLETE — the recorded span sha256 ${RECORDED_SPAN_SHA256.slice(0, 8)}… cannot be RE-PROBED (module-does-not-exist)`)
  } else if (d.spanSha256 !== RECORDED_SPAN_SHA256) {
    problems.push(`RECORDED-READING-DIVERGED: the pair-amalgam span sha256 is ${d.spanSha256}… which is NOT the byte-true span ${RECORDED_SPAN_SHA256} — the re-aimed equality reading (RED-SET-REPAIR row 2; the plan's recorded 29772ac7… is the recording error, re-recorded by the landing pass)`)
  }
  return problems
}

/** §2.3 arm 2 (c) — the cross-tree blob arm: `git -C ../Provident-Electron show
 *  <PINNED_COMMIT>:src/renderer/<name>.ts` → md5 vs the LOCAL md5. Byte-identity to
 *  the PINNED blob — never the working tree (R-2, D-1). Honesty model: with the
 *  foundation tree absent the arm is labelled SKIPPED with its reason — "neither a
 *  pass nor a failure", a skip that proves NOTHING about the pin (§2.3; the drift
 *  monitor's own model). */
type BlobArmVerdict =
  | { status: 'GREEN'; detail: string }
  | { status: 'RED'; detail: string }
  | { status: 'SKIPPED'; reason: string }

function crossTreeBlobArm(rel: string, label: string): BlobArmVerdict {
  const blob = spawnSync('git', ['-C', FOUNDATION, 'show', `${PINNED_COMMIT}:${rel}`], { maxBuffer: 64 * 1024 * 1024 })
  if (blob.status !== 0) {
    return {
      status: 'SKIPPED',
      reason: `the foundation tree is ABSENT or the blob is unreadable — \`git -C ${FOUNDATION_DISPLAY} show ${PINNED_COMMIT}:${rel}\` failed with status ${String(blob.status)} (${(blob.stderr ?? '').toString('utf8').trim() || '(no git error text)'}); a SKIPPED arm is neither a pass nor a failure and proves NOTHING about the pin`,
    }
  }
  const blobBytes = blob.stdout as Buffer
  const blobMd5 = md5(blobBytes)
  const local = readMaybe(join(REPO_ROOT, rel))
  if (local === null) {
    return {
      status: 'RED',
      detail: `the PINNED blob's md5 is ${blobMd5} but the LOCAL copy at ${rel} is ABSENT — the byte-identity comparison has no local subject (module-does-not-exist); a post-landing divergence of this class is F-2`,
    }
  }
  const localMd5 = md5(local)
  return localMd5 === blobMd5
    ? { status: 'GREEN', detail: `the local ${label} md5 ${localMd5} EQUALS the pinned blob's md5 at ${PINNED_COMMIT} — byte-identity to the recorded revision` }
    : { status: 'RED', detail: `the local ${label} md5 is ${localMd5} but the PINNED blob's md5 is ${blobMd5} — the copy diverges from the recorded revision (F-2)` }
}

/** ∂2.3 arm 3 — the import-closure census: the main module's entire import set is
 *  EXACTLY `{./store-graph-references.js}`; the sibling imports NOTHING (not even at
 *  type level); a whole-file scan of both copies returns ZERO
 *  `window`/`process`/`fetch`/`timers`/`structuredClone`/`dom-shim`/`src-shared`
 *  references. The scan reads SOURCE TEXT (the closure's own census), then drives the
 *  module's real load (the imports must actually resolve). */
const STATIC_IMPORT = /^\s*import\s+(?:type\s+)?[^'"]*?from\s*['"]([^'"]+)['"]/gm
const BARE_IMPORT = /^\s*import\s*['"]([^'"]+)['"]/gm
const AMBIENT_TOKENS: ReadonlyArray<[string, RegExp]> = [
  // THE `g` FLAG IS REQUIRED (RED-SET-REPAIR row 3): `String.prototype.matchAll`
  // THROWS a TypeError on a non-global regexp — the pre-repair scan aborted the whole
  // census with no arm verdict recorded. Every token regex carries `g`; the scan's
  // subjects are the byte-true pair (ZERO ambient refs — the census must hold).
  ['window', /\bwindow\b/g],
  ['process', /\bprocess\b/g],
  ['fetch', /\bfetch\b/g],
  ['timers', /\btimers\b/g],
  ['structuredClone', /\bstructuredClone\b/g],
  ['dom-shim', /\bdom-shim\b/g],
  ['src-shared', /\bsrc-shared\b/g],
]

function importSpecifiers(text: string): string[] {
  const found: string[] = []
  for (const m of text.matchAll(STATIC_IMPORT)) found.push(m[1]!)
  for (const m of text.matchAll(BARE_IMPORT)) found.push(m[1]!)
  return found
}

function closureCensusProblems(): string[] {
  const problems: string[] = []
  const mainText = readMaybe(MAIN_MODULE_PATH)
  const siblingText = readMaybe(SIBLING_MODULE_PATH)

  if (mainText === null) {
    problems.push(`ABSTRACT-SUBJECT: store-core-graph.ts is ABSENT — the import-set census has no subject (module-does-not-exist)`)
  } else {
    const imports = importSpecifiers(mainText.toString('utf8'))
    const set = new Set(imports)
    const expected = new Set(['./store-graph-references.js'])
    if (imports.length === 0) problems.push(`IMPORT-SET-EMPTY: store-core-graph.ts declares NO imports — the closure's only edge (the sibling) is missing`)
    if (set.size !== expected.size || [...set].some((s) => !expected.has(s))) {
      problems.push(`IMPORT-CLOSURE-DIVERGED: store-core-graph.ts's import set is [${imports.join(', ') || 'none'}] — the recorded closure is EXACTLY {./store-graph-references.js} (R-3)`)
    }
  }

  if (siblingText === null) {
    problems.push(`ABSTRACT-SUBJECT: store-graph-references.ts is ABSENT — the sibling's import census has no subject (module-does-not-exist)`)
  } else {
    const siblingImports = importSpecifiers(siblingText.toString('utf8'))
    if (siblingImports.length > 0) {
      problems.push(`SIBLING-IMPORTS-ANYTHING: store-graph-references.ts declares [${siblingImports.join(', ')}] — the sibling imports NOTHING (not even at type level)`)
    }
  }

  for (const file of [MAIN_MODULE_PATH, SIBLING_MODULE_PATH]) {
    const bytes = readMaybe(file)
    if (bytes === null) continue
    const text = bytes.toString('utf8')
    for (const [token, re] of AMBIENT_TOKENS) {
      const hits = [...text.matchAll(re)]
      if (hits.length > 0) {
        problems.push(`AMBIENT-REF: ${relative(REPO_ROOT, file)} carries ${hits.length} \`${token}\` reference(s) — the pair must add ZERO ambient refs (NW-4 injected-dependency shape)`)
      }
    }
  }
  return problems
}

/** ∂2.3 arm 4 — the no-MCP-surface negative (GREEN-ON-ARRIVAL and must STAY green):
 *  the landing adds NO tool/resource/group (`ALL_TOOLS`/`TOOL_GROUPS`), NO `RpcMethod`,
 *  NO preload/IPC member, NO `package.json` script key — the guard reads the fork's
 *  `src/main/**` surface + `package.json` at the head. `P-16` is cited to the
 *  FOUNDATION's `../Provident-Electron/docs/specs/mcp-endpoint.md` §6.4 ONLY — the
 *  fork's own `docs/specs/mcp-endpoint.md` carries no `P-16` row (K-3, F-8, MINOR 9). */
const STORE_SYMBOLS: ReadonlyArray<string> = ['store-core-graph', 'store-graph-references', 'getWiredGraphStore', 'createGraphStore']

function mainDirFiles(): string[] {
  const out: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry)
      if (statSync(p).isDirectory()) walk(p)
      else out.push(p)
    }
  }
  walk(MAIN_DIR)
  return out
}

function mcpSurfaceProblems(): string[] {
  const problems: string[] = []

  // (a) the adopted pair + the seam must have ZERO presence in the fork's main realm —
  //     the K-5 boundary: "an import of the pair in src/main/** is a finding"
  for (const file of mainDirFiles()) {
    const text = readText(file)
    for (const symbol of STORE_SYMBOLS) {
      if (text.includes(symbol)) {
        problems.push(`MAIN-REALM-STORE-REF: ${relative(REPO_ROOT, file)} carries the adopted symbol \`${symbol}\` — the pair/the seam must NOT touch ${relative(REPO_ROOT, MAIN_DIR)} (K-5; F-8)`)
      }
    }
  }

  // (b) no `package.json` script key named for the store (R-4: no script key added)
  const pkg = JSON.parse(readText(PKG_PATH)) as { scripts?: Record<string, string> }
  const storeScriptKeys = Object.keys(pkg.scripts ?? {}).filter((k) => /store/i.test(k))
  if (storeScriptKeys.length > 0) {
    problems.push(`SCRIPT-KEY: package.json carries store-named script key(s) [${storeScriptKeys.join(', ')}] — the landing adds NO script key (R-4, F-8)`)
  }

  // (c) no preload/IPC member named `store` — the fork's preload exposes its members at
  //     the two-space member-key indent; a `store` member would be `  store: …
  const preloadPath = join(REPO_ROOT, 'src', 'main', 'preload.ts')
  const preloadMember = /^  store\s*:/m
  const preloadText = readText(preloadPath)
  if (preloadMember.test(preloadText)) {
    problems.push(`PRELOAD-MEMBER: src/main/preload.ts exposes a top-level \`store\` member — the landing adds NO preload/IPC member (K-3)`)
  }

  // (d) the MCP server surface registers NO store-named tool/group/resource/RpcMethod —
  //     the store-symbol scan of the whole main realm in (a) already covers mcp-server.ts;
  //     this limb NAMES the surface so a future tool registration reds with its site
  const mcpPath = join(REPO_ROOT, 'src', 'main', 'mcp-server.ts')
  const mcpText = readText(mcpPath)
  for (const symbol of STORE_SYMBOLS) {
    if (mcpText.includes(symbol)) {
      problems.push(`MCP-SURFACE: src/main/mcp-server.ts carries \`${symbol}\` — the landing adds NO tool/resource/group/RpcMethod (P-5/K-9; the store is never agent-addressable)`)
    }
  }

  // (e) the `P-16` citation shape: cited to the FOUNDATION's mcp-endpoint.md §6.4 ONLY.
  //     (i) the fork's OWN mcp-endpoint.md must carry NO `P-16` row (falsifier: a fork
  //     citation site — the fork file carries no P-16 row, VERIFIED-BY-READ);
  //     (ii) this guard's code cites ONLY the foundation path for P-16.
  const forkEndpoint = readText(FORK_MCP_ENDPOINT_PATH)
  if (forkEndpoint.includes('P-16')) {
    problems.push(`P-16-CITATION: the fork's own docs/specs/mcp-endpoint.md carries a \`P-16\` row — P-16 is cited to the FOUNDATION's file ONLY (MINOR 9, F-8)`)
  }
  // (e)(ii) the guard's OWN code carries the FOUNDATION-path citation for P-16 (the
  // P16_CITATION const) — read comment-stripped; the needle is built from parts so this
  // scan never counts its own needle declaration, and a diagnostic's PROSE mention of
  // the fork's own path (limb (i)) is NOT a foundation citation
  const stripped = withoutComments(readText(SELF_PATH))
  const endpointNeedle = 'docs/specs/mcp' + '-endpoint.md'
  const citationRegex = new RegExp(endpointNeedle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
  // the ANCHOR is the path up to the needle's start: the citation's own `…/docs/specs/`
  // tail is part of the needle itself, so the foundation citation reads
  // `'../Provident-Electron/` + needle; a diagnostic's PROSE mention of the fork's own
  // path ends in something else and is never counted
  const citationAnchor = '../Provident-Electron/'
  let foundationCitations = 0
  for (const at of [...stripped.matchAll(citationRegex)]) {
    const pos = at.index ?? 0
    const before = stripped.slice(Math.max(0, pos - 40), pos)
    const citationOk =
      before.endsWith(citationAnchor) || before.endsWith(`'${citationAnchor}`) || before.endsWith('`' + citationAnchor)
    if (citationOk) foundationCitations++
  }
  if (foundationCitations === 0) {
    problems.push(`P-16-CITATION: the guard's own code carries NO foundation-path citation for P-16 — \`${P16_CITATION}\` is the citation shape (the FOUNDATION path + §6.4) arm 4 must carry (MINOR 9, F-8)`)
  }
  return problems
}

/** The comment-line stripper — the self-scans read comment-free code so a PROSE mention
 *  in this file's header or JSDoc is never mistaken for a READ. Every comment line is
 *  dropped: line comments and block-comment lines (the opening, the continuation
 *  asterisks, the closing) — the arm-4 self-scan must not count a citation named in a
 *  JSDoc block. */
function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*(\/\/|\/\*|\*|\*\/)/.test(line))
    .join('\n')
}

/** ∂2.3 arm 5 — the structural arm: `vendor/foundation.lock.json` `moduleCount` STAYS
 *  `15` and the pair gains NO lock cell (the modules[] membership + the V-2/V-3
 *  fifteen-set contract stay frozen), PLUS the no-hydrate-at-boot limb (a zero-match
 *  scan of src/renderer/renderer.ts) and the MAJOR-7 evidence limb (hydrate PRESENT in
 *  the landed pair bytes — the arm's non-vacuous half). */
interface LockReading {
  moduleCount: number | null
  memberCount: number | null
  storeCells: string[]
  how: string
}

function readLock(): LockReading {
  const bytes = readMaybe(LOCK_PATH)
  if (bytes === null) return { moduleCount: null, memberCount: null, storeCells: [], how: `${LOCK_PATH} is ABSENT` }
  try {
    const manifest = JSON.parse(bytes.toString('utf8')) as { moduleCount?: unknown; modules?: Array<{ name?: string }> }
    const modules = Array.isArray(manifest.modules) ? manifest.modules : []
    return {
      moduleCount: typeof manifest.moduleCount === 'number' ? manifest.moduleCount : null,
      memberCount: modules.length,
      storeCells: modules.filter((m) => typeof m.name === 'string' && (m.name.includes('store-core-graph') || m.name.includes('store-graph-references'))).map((m) => String(m.name)),
      how: 'read at the unit\'s head',
    }
  } catch (e) {
    return { moduleCount: null, memberCount: null, storeCells: [], how: `unreadable: ${(e as Error).message}` }
  }
}

function frozenContractProblems(): string[] {
  const problems: string[] = []
  const lock = readLock()
  if (lock.moduleCount !== 15) {
    problems.push(`MODULE-COUNT: the lock's \`moduleCount\` is ${String(lock.moduleCount)} — it must STAY 15 (R-4; E-2 arm 5; the V-2/V-3 fifteen-set contract)`)
  }
  if (lock.memberCount !== 15) {
    problems.push(`MEMBER-COUNT: the lock's \`modules[]\` carries ${String(lock.memberCount)} members — the fifteen-set contract is frozen (R-4)`)
  }
  if (lock.storeCells.length > 0) {
    problems.push(`LOCK-CELL: the lock gained store cell(s) [${lock.storeCells.join(', ')}] — the pair gets NO cell (R-4, F-9)`)
  }
  const rendererBytes = readMaybe(RENDERER_PATH)
  if (rendererBytes === null) {
    problems.push(`ABSTRACT-SUBJECT: src/renderer/renderer.ts is ABSENT — the no-hydrate-at-boot scan has no subject`)
  } else {
    const hydrateCalls = [...rendererBytes.toString('utf8').matchAll(/\bhydrate\(/g)]
    if (hydrateCalls.length > 0) {
      problems.push(`HYDRATE-AT-BOOT: src/renderer/renderer.ts carries ${hydrateCalls.length} \`hydrate(\` call(s) — unit 1's boot calls hydrate NOWHERE (R-5, F-7; PERSIST's edit owns the call)`)
    }
  }
  return problems
}

/** MAJOR-7 evidence limb: `hydrate` is PRODUCTION-PRESENT in the landed pair bytes —
 *  the structural arm is non-vacuous. At the red head the pair is absent → RED
 *  (module-does-not-exist class). */
function hydrateEvidenceProblems(): string[] {
  const problems: string[] = []
  const main = readMaybe(MAIN_MODULE_PATH)
  if (main === null) {
    problems.push(`ABSTRACT-SUBJECT: store-core-graph.ts is ABSENT — the MAJOR-7 evidence (\`hydrate\` present in the adopted bytes) cannot be read (module-does-not-exist)`)
    return problems
  }
  const hits = [...main.toString('utf8').matchAll(/\bhydrate\b/g)]
  if (hits.length === 0) {
    problems.push(`MAJOR-7-EVIDENCE: \`hydrate\` is NOT present in store-core-graph.ts's adopted bytes — the structural arm's non-vacuous half has lost its subject (F-7)`)
  }
  return problems
}

// ===========================================================================
// THE ARM-VERDICT REPORT — the run's reading, printed per arm. RE-AIMED at the
// LANDED head (2026-10-04, RED-SET-REPAIR row 4): the report asserts the LANDED
// head's verdicts — all SEVEN arm rows (the §2.3 five arms with arm 2 split
// a+b/c and arm 5 split frozen-limbs/MAJOR-7 evidence — the guard's own report
// shape) GREEN, 0 RED. The RED-RUN record (§4 R-1/R-1a: arms 1, 2(a+b), 2(c), 3
// and 5b RED at the unit's own head — module-does-not-exist; arms 4 and 5a
// GREEN-ON-ARRIVAL) is RECORDED in the note, never asserted (it is a property of
// the pre-landing head, not of this run).
// ===========================================================================
interface ArmVerdict {
  arm: string
  verdict: 'RED' | 'GREEN' | 'SKIPPED'
  limbs: string[]
  note: string
}
const ARM_VERDICTS: ArmVerdict[] = []

function recordArm(arm: string, problems: string[], note: string): void {
  ARM_VERDICTS.push({ arm, verdict: problems.length === 0 ? 'GREEN' : 'RED', limbs: problems, note })
}

// ===========================================================================
// ARM 1 — EXISTENCE (§2.3 arm 1). Pre-landing: the files are absent → RED.
// ===========================================================================
describe('E-2 arm 1 — existence: both files exist at the landing paths, the sibling reads 36 lines', () => {
  it('arm 1 — the pair exists at src/renderer/store-core-graph.ts + src/renderer/store-graph-references.ts; the sibling\'s line census is its own (a line census is NOT the E-2 claim — the digest is)', () => {
    const problems: string[] = []
    if (!existsSync(MAIN_MODULE_PATH)) {
      problems.push(`ABSTRACT-SUBJECT: src/renderer/store-core-graph.ts does NOT exist at this head (module-does-not-exist — §4 R-1)`)
    }
    if (!existsSync(SIBLING_MODULE_PATH)) {
      problems.push(`ABSTRACT-SUBJECT: src/renderer/store-graph-references.ts does NOT exist at this head (module-does-not-exist — §4 R-1)`)
    } else {
      const siblingLines = wcStyleLineCount(readText(SIBLING_MODULE_PATH))
      if (siblingLines !== 36) {
        problems.push(`SIBLING-LINE-CENSUS: store-graph-references.ts reads ${siblingLines} lines — the sibling's recorded census is 36 L (a line census is NOT the E-2 claim — the digest is; this is the sibling's own census, read with the RE-AIMED wc-style instrument — count of \\n separators, trailing-newline-aware)`)
      }
    }
    const mainLines = existsSync(MAIN_MODULE_PATH) ? wcStyleLineCount(readText(MAIN_MODULE_PATH)) : null
    // eslint-disable-next-line no-console
    console.log(`PD-STORE-CORE-ADOPT arm 1: main census ${mainLines === null ? 'ABSENT' : `${mainLines} L`} · sibling census ${existsSync(SIBLING_MODULE_PATH) ? `${wcStyleLineCount(readText(SIBLING_MODULE_PATH))} L` : 'ABSENT'} — the census is recorded (wc-style: \\n separators), the digest is the E-2 claim`)
    recordArm('1 · existence', problems, 'RED at the red head: absent subjects (module-does-not-exist)')
    expect(problems, `arm 1: ${problems.join(' | ') || 'the pair exists with the recorded census'}`).toEqual([])
  }, 10_000)
})

// ===========================================================================
// ARM 2 — DIGEST (§2.3 arm 2): (a) local md5s re-probed twice, stable,
// (b) the recorded readings RE-PROBED at the unit's head with the NAMED
// instrument (RE-CHECKED, never copied), (c) the cross-tree blob arm —
// SKIPPED-when-absent, never a pass.
// ===========================================================================
describe('E-2 arm 2 — digest: local md5 re-probe, the recorded-reading re-probe, and the cross-tree blob arm', () => {
  it('arm 2 (a)+(b) — the LOCAL md5s are re-probed TWICE and must be stable; the recorded sha256:0664c52f…/5c0c1a97…/span 6f6bc2f9… must be RE-PROBED with the guard\'s NAMED instrument (node:crypto sha256; the span instrument = sha256(mainBytes + siblingBytes)) and must EQUAL the recorded literals — the span literal is the RE-AIMED byte-true reading (RED-SET-REPAIR row 2; the recorded 29772ac7… is the program plan §1 row 18 recording error, re-recorded by the landing pass); the probe note states the readings are RE-CHECKED, never copied', () => {
    const problems: string[] = []
    const probeOne = localMd5ReProbe(MAIN_MODULE_PATH, 'store-core-graph.ts')
    const probeTwo = localMd5ReProbe(SIBLING_MODULE_PATH, 'store-graph-references.ts')
    if (probeOne !== null) problems.push(probeOne)
    if (probeTwo !== null) problems.push(probeTwo)
    const digests = localDigests()
    problems.push(...recordedReadingProbe(digests))
    // eslint-disable-next-line no-console
    console.log(
      `PD-STORE-CORE-ADOPT arm 2 (a)+(b): RE-CHECKED, NEVER COPIED — local md5s ${String(digests.mainMd5)} (main) / ${String(digests.siblingMd5)} (sibling) · ` +
        `recorded-reading re-probe: main sha256 ${digests.mainSha256 === null ? 'ABSENT' : `${digests.mainSha256.slice(0, 8)}…${digests.mainSha256.slice(-6)}`} · ` +
        `sibling sha256 ${digests.siblingSha256 === null ? 'ABSENT' : `${digests.siblingSha256.slice(0, 8)}…${digests.siblingSha256.slice(-6)}`} · ` +
        `pair span sha256 ${digests.spanSha256 === null ? 'ABSENT' : `${digests.spanSha256.slice(0, 8)}…${digests.spanSha256.slice(-6)}`} — the DONE row's E-2 cell records these readings`,
    )
    recordArm('2(a+b) · digest re-probes', problems, 'RED at the red head: absent subjects (module-does-not-exist)')
    expect(problems, `arm 2 (a)+(b): ${problems.join(' | ') || 'the recorded readings re-check at the unit\'s head'}`).toEqual([])
  }, 10_000)

  it('arm 2 (c) — the cross-tree blob arm: `git -C ../Provident-Electron show 7bd1de4…:src/renderer/<name>.ts` → md5 vs the LOCAL md5 — byte-identity to the PINNED blob, never the working tree; SKIPPED-when-absent, and a SKIPPED arm is NEVER reported as a pass', () => {
    const mainArm = crossTreeBlobArm('src/renderer/store-core-graph.ts', 'store-core-graph.ts')
    const siblingArm = crossTreeBlobArm('src/renderer/store-graph-references.ts', 'store-graph-references.ts')
    const problems: string[] = []
    for (const arm of [mainArm, siblingArm]) {
      // eslint-disable-next-line no-console
      console.log(`PD-STORE-CORE-ADOPT arm 2 (c): ${arm.status} — ${arm.status === 'SKIPPED' ? arm.reason : arm.detail}`)
      if (arm.status === 'RED') problems.push(arm.detail)
      if (arm.status === 'SKIPPED') {
        // the honesty model: a SKIPPED arm is neither a pass nor a failure — it is
        // RECORDED, and it can never make the arm green (the DONE row carries the skip)
        // eslint-disable-next-line no-console
        console.log(`PD-STORE-CORE-ADOPT arm 2 (c) SKIP RECORD: ${arm.reason} — recorded for the DONE row, never a green`)
      }
    }
    const skipped = [mainArm, siblingArm].filter((a): a is Extract<BlobArmVerdict, { status: 'SKIPPED' }> => a.status === 'SKIPPED').length
    recordArm(
      '2(c) · cross-tree blob',
      problems,
      `DRIVEN at this head (the foundation tree is present — the blob arm REDs on the absent LOCAL subjects); a ${skipped}/2 SKIPPED arm(s) would be recorded, never a pass`,
    )
    expect(problems, `arm 2 (c): ${problems.join(' | ') || 'the local files are byte-identical to the pinned blobs'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// ARM 3 — IMPORT-CLOSURE CENSUS (§2.3 arm 3). Pre-landing: absent subjects +
// the load limb's import failure → RED.
// ===========================================================================
describe('E-2 arm 3 — import-closure census: the main module\'s import set is EXACTLY {./store-graph-references.js}; the sibling imports NOTHING; zero ambient refs; the module\'s load resolves', () => {
  it('arm 3 — the source-text census of both copies + the whole-file ambient scan + the real load (the census arm\'s import failure at the red head: the module does not exist → the import throws)', async () => {
    const problems = closureCensusProblems()
    // the load limb: the pair's imports must actually RESOLVE — at the red head the
    // module does not exist and the load throws (the suite's import failure, §4 R-1)
    try {
      await import('../src/renderer/store-core-graph.js')
    } catch (e) {
      problems.push(`LOAD-FAILURE: ../src/renderer/store-core-graph.js did not load — ${(e as Error).message} (module-does-not-exist; the census arm's import failure, §4 R-1)`)
    }
    recordArm('3 · import-closure census', problems, 'RED at the red head: absent subjects + the import throws (module-does-not-exist)')
    expect(problems, `arm 3: ${problems.join(' | ') || 'the closure is exactly the sibling, the sibling imports nothing, zero ambient refs, the module loads'}`).toEqual([])
  }, 10_000)
})

// ===========================================================================
// ARM 4 — THE NO-MCP-SURFACE NEGATIVE (§2.3 arm 4). GREEN-ON-ARRIVAL (a
// negative) and must STAY green — never reported as red.
// ===========================================================================
describe('E-2 arm 4 — the no-MCP-surface negative: no tool/resource/group (ALL_TOOLS/TOOL_GROUPS), no RpcMethod, no preload/IPC member, no package.json script key; P-16 cited to the FOUNDATION\'s mcp-endpoint.md §6.4 ONLY', () => {
  it('arm 4 — the fork\'s src/main/** surface + package.json are read at the head; the adopted pair and the seam have ZERO presence in the main realm, the preload exposes no store member, package.json gains no store script key, and the P-16 citation shape is the foundation path alone — a GREEN-ON-ARRIVAL negative that must STAY green', () => {
    const problems = mcpSurfaceProblems()
    recordArm('4 · no-MCP-surface negative', problems, 'GREEN-ON-ARRIVAL (a negative, §4 R-1a) — expected green BEFORE and AFTER; never reported as red')
    expect(problems, `arm 4: ${problems.join(' | ') || 'the landing adds no MCP/IPC/script surface — the negative holds'}`).toEqual([])
  }, 10_000)
})

// ===========================================================================
// ARM 5 — STRUCTURAL (§2.3 arm 5). The frozen-contract limbs are GREEN-ON-
// ARRIVAL; the MAJOR-7 evidence limb (hydrate PRESENT in the pair's bytes) is
// RED on arrival — the pair is absent (module-does-not-exist class).
// ===========================================================================
describe('E-2 arm 5 — structural: the lock stays frozen at moduleCount 15 with no store cell; no hydrate( call at boot; the MAJOR-7 evidence (hydrate present in the adopted bytes)', () => {
  it('arm 5 (frozen-contract limbs) — vendor/foundation.lock.json moduleCount STAYS 15, modules[] is the fifteen-set, the pair gains NO lock cell, and src/renderer/renderer.ts carries ZERO hydrate( calls — GREEN-ON-ARRIVAL and must STAY green', () => {
    const problems = frozenContractProblems()
    recordArm('5a · frozen-contract limbs', problems, 'GREEN-ON-ARRIVAL (§4 R-1a; §2.3 arm 5) — the count/15 limb, the no-lock-cell limb and the no-hydrate-at-boot limb')
    expect(problems, `arm 5 (frozen): ${problems.join(' | ') || 'the lock is frozen at 15 with no store cell and the boot wiring calls hydrate nowhere'}`).toEqual([])
  }, 10_000)

  it('arm 5 (MAJOR-7 evidence limb) — hydrate is PRODUCTION-PRESENT in the adopted pair bytes (the structural arm\'s non-vacuous half): at the red head the pair is absent → RED, module-does-not-exist class; at the landed head the adopted bytes must carry hydrate, uncalled at boot', () => {
    const problems = hydrateEvidenceProblems()
    recordArm('5b · MAJOR-7 evidence (hydrate present)', problems, 'RED on arrival: the pair is absent (module-does-not-exist); must be GREEN at the landed head with hydrate uncalled at boot (F-7)')
    expect(problems, `arm 5 (evidence): ${problems.join(' | ') || 'hydrate is present in the adopted pair bytes — the non-vacuous MAJOR-7 evidence'}`).toEqual([])
  }, 10_000)
})

// ===========================================================================
// THE ARM-VERDICT REPORT — the run's reading, per §4 R-1/R-1a's recorded
// colours, printed verbatim for the DONE row.
// ===========================================================================
describe('E-2 — the arm-verdict report and the head anchor', () => {
  it('the arm-verdict report asserts the LANDED head\'s reading: the seven arm rows (arms 1, 2(a+b), 2(c), 3, 4, 5a, 5b) all GREEN, 0 RED — the RED-RUN record (§4 R-1/R-1a: arms 1, 2(a+b), 2(c), 3 and 5b RED at the unit\'s own head, module-does-not-exist; 4 and 5a GREEN-ON-ARRIVAL) is recorded, never asserted; the cross-tree blob arm is DRIVEN green at this head (the foundation tree is present and the local md5s equal the pinned blobs)', () => {
    const head = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' })
    const forkHead = head.status === 0 ? String(head.stdout ?? '').trim() : `(unreadable: ${String(head.status)})`
    // eslint-disable-next-line no-console
    console.log(
      `\nPD-STORE-CORE-ADOPT E-2 GUARD — ARM-VERDICT REPORT (head-anchored: fork HEAD ${forkHead}; E-2 subject revision ${PINNED_COMMIT})\n` +
        ARM_VERDICTS.map((v) => `  arm ${v.arm}: ${v.verdict} — ${v.note}${v.limbs.length > 0 ? `\n      limbs: ${v.limbs.join('\n      | ')}` : ''}`).join('\n') +
        '\nEND PD-STORE-CORE-ADOPT ARM-VERDICT REPORT',
    )
    expect(ARM_VERDICTS.length, 'all seven arm-verdict rows reported (arm 2 split a+b / c; arm 5 split frozen-limbs / MAJOR-7 evidence)').toBe(7)
    const green = ARM_VERDICTS.filter((v) => v.verdict === 'GREEN').length
    const red = ARM_VERDICTS.filter((v) => v.verdict === 'RED').length
    const skipped = ARM_VERDICTS.filter((v) => v.verdict === 'SKIPPED').length
    expect(green, 'the LANDED head reports ALL SEVEN arm rows GREEN (RED-SET-REPAIR row 4 re-aim: arms 1/2(a+b)/2(c)/3/5b landed green; 4/5a green-on-arrival — the recorded RED-run colours of §4 R-1/R-1a are a named record, never asserted at the landed head)').toBe(7)
    expect(red, 'at the LANDED head NO arm is red — the unconditional 5-red pre-edit assertion is removed (its subject is the pre-landing head only)').toBe(0)
    expect(skipped, 'no arm is SKIPPED at this head — the cross-tree blob arm is DRIVEN (the foundation tree is present; a SKIPPED arm would be recorded, never a pass)').toBe(0)
  }, 10_000)
})