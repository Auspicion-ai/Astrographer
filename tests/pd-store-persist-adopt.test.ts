// tests/pd-store-persist-adopt.test.ts — UNIT `U-STORE-PERSIST-ADOPT` (core; unit 2 of
// the store-adoption program, F2) — THE MODULE/MAIN SURFACE GUARD: the channel module's
// export census + the single-source rule scan; the boot-order byte-scan (the
// hydrate-before-Runtime/boot order + the crossing REPLACEMENT at the EXISTING call —
// a SECOND `getWiredGraphStore(` call is a FINDING per the memoization clause; the
// conditional `bridge?.store` gate); the no-`src/shared` byte-move and no store-pair
// byte-move arms; the denied-surface negative (no MCP surface, no module-migration edit,
// no operator-settings re-home); the `--provident-user-data=` seam presence; and the
// persisted-set pin SCOPED to the UI-CONFIG family with the other fork files named OUT OF
// SCOPE.
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-store-persist-adopt.md
//     §1.1 members 1/5/6   the NEW channel module; the three `store.*` preload members;
//                          THE BOOT REORDER
//     §1.2 items 1/2/3/4/5/6/8   THE DENIED SURFACE — no `src/shared/**` byte; no
//                          byte of the byte-pinned store pair; the lock NOT extended;
//                          no MCP surface and no second IPC key; no module-store
//                          migration; no operator-settings re-home; the four non-UI-config
//                          fork carriers out of scope
//     §2.1                 the channel module's export census + the CONTRACT's importer
//                          set (main.ts and preload.ts ONLY; the renderer never imports
//                          it) + the `Y-3` rides the EXISTING `webContents.send` surface
//                          and needs NO third constant
//     §2.2                 NO SECOND TOP in `FILE_TIER_TOP_NAMES_FORK`
//     §2.3                 the exact boot sequence; THE MEMOIZATION CLAUSE (REPLACEMENT at
//                          the EXISTING call; a second `getWiredGraphStore(…)` call is a
//                          FINDING); the conditional `bridge?.store` gate; the no-bridge
//                          posture; the `bootHandoff` bound
//     §2.7 item 1          the carrier `<userData>/provident-settings.json`
//     §2.8                 THE PERSISTED-SET PIN — class A only, classes B/C OUT OF SCOPE
//                          BY NAME; the six userData sites' arithmetic
//     §2.9                 the `--provident-user-data=` seam + its honest divergence record
//     §3 F-2/F-3/F-4/F-6/F-11   the fail-states this guard's arms falsify
//     §4                   THE RED SET (R-1..R-6) and the no-other-red rule
//     §10 R-4              THE C-1 AMENDMENT IS THE IMPLEMENTER'S ACT — this guard does
//                          NOT touch unit 1's two landed pin files and does not own them
//     §11a C-7             the reserved-namespace refusal is recorded `NOT ARMED`; a repair
//                          row asserting the refusal HERE is F-12's honesty class
//
// THE ARM CLASSIFICATION (recorded per arm, §4). Three classes, tracked distinctly:
//   RED-BY-ABSENCE     — the arm's subject module/surface does not exist at this head.
//   GREEN-ON-ARRIVAL   — the arm asserts a property ALREADY TRUE at this head (a
//                        negative/denied-surface pin). Marked explicitly, never counted as
//                        a landing-driven red (§4's no-other-red rule); a landing that
//                        reddens one of these has NOT landed this unit.
//   SKIPPED            — the arm's substrate is absent (a named skip with its reason; a
//                        SKIPPED arm is NEVER a pass — §3 F-12's honesty class).
//
// LAYER (RCA-12 / §6). `[T]`/`[H]`. This guard asserts BYTES and SURFACE — never module
// BEHAVIOUR (the register owns that), never app/envelope/store/live state. **NO
// DURABILITY CLAIM IS MADE OR ASSERTED ANYWHERE IN THIS FILE.**
import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')

const CHANNELS_PATH = join(REPO_ROOT, 'src', 'main', 'store-channels.ts')
const MAIN_PATH = join(REPO_ROOT, 'src', 'main', 'main.ts')
const PRELOAD_PATH = join(REPO_ROOT, 'src', 'main', 'preload.ts')
const RENDERER_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const STORE_PAIR = [
  join(REPO_ROOT, 'src', 'renderer', 'store-core-graph.ts'),
  join(REPO_ROOT, 'src', 'renderer', 'store-graph-references.ts'),
]
const LOCK_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const SHARED_DIR = join(REPO_ROOT, 'src', 'shared')
const PKG_PATH = join(REPO_ROOT, 'package.json')
const MCP_SERVER_PATH = join(REPO_ROOT, 'src', 'main', 'mcp-server.ts')
const MODULE_STORE_PATH = join(REPO_ROOT, 'src', 'main', 'module-store.ts')
const OPERATOR_SETTINGS_PATH = join(REPO_ROOT, 'src', 'main', 'operator-settings-store.ts')
const SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-persist-adopt.md')
const SELF_PATH = join(HERE, 'pd-store-persist-adopt.test.ts')

/** §2.1 — the channel module's EXACT export-name set (`CENSUS`: 4 names, with terms).
 *
 *  ⟨RE-STATED 2026-11-18 — unit `B-2` (`display-wire`), §4; contract
 *  `docs/L1/unit-b-2-display-wire.md`.⟩ **THE CLAIM IS UNMOVED AND THE SET IS WIDENED BY EXACTLY WHAT
 *  THE CHANGE ADDED.** §2.1's claim is a SET EQUALITY between this module's export names and the
 *  declared set: `B-2` homes this unit's two DISPLAY channel constants in THIS module rather than in
 *  `src/shared/types.ts` — `DISPLAY_READ`, a REQUEST over `invoke`/`handle`, and `DISPLAY_CHANGED`, a
 *  SIGNAL over `send`/`on` that carries nothing (`D-24`) — because three landed rows pin that file's
 *  md5 while this module yields ONE structural sentence its own edit amends. So the module now
 *  declares FOUR names and the module's own `CENSUS: 4 names` sentence moved in the SAME edit; the
 *  as-filed `CENSUS: 2` is kept VISIBLE beside the restated literal rather than deleted. **NO OTHER
 *  LIMB IS TOUCHED**: the module is still CONSTANTS-ONLY (no function, no state), the two STORE
 *  constants still number exactly TWO (the `Y-3` push still rides the existing `webContents.send`
 *  surface and needs no constant of its own — `constantsCensusProblems` below is unchanged), and the
 *  single-source rule now covers all FOUR literals, which is the SAME rule over a wider subject. */
// ⟨RE-STATED 2026-11-19 by unit `B-10` `stage-display-state` — the record's WRITE channel lands here: the census moves FOUR → FIVE (`DISPLAY_WRITE`, the ONE sender member `B-2` §4 reserved for this unit). The claim is UNMOVED; the set is widened by exactly what the change added.⟩
const CHANNEL_EXPORT_NAMES = ['STORE_FILE_GET', 'STORE_FILE_PUT', 'DISPLAY_READ', 'DISPLAY_CHANGED', 'DISPLAY_WRITE'] as const
/** §2.1 — the four declared values, single-sourced in member 1 (the `B-2` pair added 2026-11-18; the
 *  two store-channel values are the as-filed ones, unmoved). */
const CHANNEL_VALUES: ReadonlyArray<[string, string]> = [
  ['STORE_FILE_GET', 'provident:store:file:get'],
  ['STORE_FILE_PUT', 'provident:store:file:put'],
  ['DISPLAY_READ', 'provident:display:read'],
  ['DISPLAY_CHANGED', 'provident:display:changed'],
]
/** §2.1 — the CONTRACT's importer set: `src/main/main.ts` and `src/main/preload.ts` ONLY. */
const CHANNEL_IMPORTERS = ['src/main/main.ts', 'src/main/preload.ts']
/** §2.5 — the `store` sub-namespace's EXACT member set (verbatim from the foundation). */
const STORE_MEMBER_NAMES = ['get', 'put', 'onFileChanged'] as const
/** §2.8 — THE PERSISTED-SET PIN'S SUBJECT (class A — the UI-CONFIG family): the two
 *  files the pin IS scoped to. */
const CLASS_A_FILES = ['provident-settings.json', 'provident-security.json'] as const
/** §2.8 — CLASS B: the fork carriers declared OUT OF SCOPE **BY NAME**, never silently. */
const CLASS_B_FILES = [
  'provident-modules.json',
  'provident-rag-stores.json',
  'provident-template.json',
  'provident-engine-config.json',
  'provident-operator-settings.json',
] as const
/** §2.8 — CLASS C: the accrued/non-carrier artifacts, RECORDED and not counted. */
const CLASS_C_ARTIFACTS = ['vector cache', 'per-store RAG artifacts'] as const
/** §1.2 item 2 / R-5 — THE BYTE-PINNED PAIR (a semantic patch is a COLLISION finding). */
const STORE_PAIR_RELATIVE = ['src/renderer/store-core-graph.ts', 'src/renderer/store-graph-references.ts'] as const
/** §2.9 — the seam flag. */
const SEAM_FLAG = '--provident-user-data='

// ===========================================================================
// THE ARM-VERDICT REPORT — the run's reading, printed per arm for the DONE row.
// ===========================================================================
type ArmVerdict = 'RED-BY-ABSENCE' | 'GREEN-ON-ARRIVAL' | 'SKIPPED' | 'GREEN'
interface ArmRow {
  arm: string
  verdict: ArmVerdict
  limbs: string[]
  note: string
}
const ARM_VERDICTS: ArmRow[] = []

function recordArm(arm: string, problems: string[], verdict: ArmVerdict, note: string): void {
  const held = problems.length === 0
  ARM_VERDICTS.push({
    arm,
    // a GREEN-ON-ARRIVAL arm that still holds is reported GREEN-ON-ARRIVAL (its class is
    // what the DONE row records); a RED-BY-ABSENCE/SKIPPED arm that holds would be a
    // classification error and is reported as observed
    verdict: held && (verdict === 'GREEN-ON-ARRIVAL' || verdict === 'GREEN') ? verdict : held ? verdict : verdict === 'GREEN-ON-ARRIVAL' ? 'RED-BY-ABSENCE' : verdict,
    limbs: problems,
    note,
  })
}

function readMaybe(path: string): string | null {
  try {
    return existsSync(path) ? readFileSync(path, 'utf8') : null
  } catch {
    return null
  }
}

function readBytes(path: string): Buffer | null {
  try {
    return existsSync(path) ? readFileSync(path) : null
  } catch {
    return null
  }
}

/** NAMED instrument: `node:crypto` sha256 — the digest arm's own reading. */
function sha256(bytes: Buffer): string {
  return createHash('sha256').update(bytes).digest('hex')
}

function srcFiles(): string[] {
  const out: string[] = []
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry)
      if (statSync(p).isDirectory()) walk(p)
      else out.push(p)
    }
  }
  walk(join(REPO_ROOT, 'src'))
  return out
}

// ===========================================================================
// ARM 1 — THE CHANNEL MODULE'S EXPORT CENSUS + THE SINGLE-SOURCE RULE SCAN
// (§2.1; §1.1 member 1; §3 F-2/F-3). Subject: `src/main/store-channels.ts`.
// ===========================================================================
const STATIC_IMPORT = /^\s*import\s+(?:type\s+)?[^'"]*?from\s*['"]([^'"]+)['"]/gm
const BARE_IMPORT = /^\s*import\s*['"]([^'"]+)['"]/gm

function importSpecifiers(text: string): string[] {
  const found: string[] = []
  for (const m of text.matchAll(STATIC_IMPORT)) found.push(m[1]!)
  for (const m of text.matchAll(BARE_IMPORT)) found.push(m[1]!)
  return found
}

function namedImportsFrom(text: string, specifier: string): string[] {
  const names: string[] = []
  const re = new RegExp(
    `^\\s*import\\s+([^'"]*?)\\s+from\\s+['"]${specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`,
    'gm',
  )
  for (const m of text.matchAll(re)) {
    const braces = (m[1] ?? '').match(/\{([\s\S]*)\}/)
    if (braces === null) continue
    for (const raw of braces[1]!.split(',')) {
      const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]!.trim()
      if (name.length > 0) names.push(name)
    }
  }
  return names
}

function channelModuleProblems(): string[] {
  const problems: string[] = []
  const src = readMaybe(CHANNELS_PATH)
  if (src === null) {
    problems.push(
      `ABSTRACT-SUBJECT: src/main/store-channels.ts does NOT exist at this head (module-does-not-exist — §4 R-1) — the export census, the declared-value scan and the import-closure census have no subject`,
    )
    return problems
  }
  // (a) the export-name set is EXACTLY the two constants
  const exportNames = [...src.matchAll(/^export\s+(?:const|function|class|type|interface|let|var)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]!)
  const expected = [...CHANNEL_EXPORT_NAMES]
  if (exportNames.length !== expected.length || expected.some((n) => !exportNames.includes(n))) {
    problems.push(
      `EXPORT-SET: the module's export-name set is [${exportNames.join(', ') || 'none'}] — §1.1 member 1 declares EXACTLY {${expected.join(', ')}} (CENSUS: ${String(expected.length)} names, printed with its terms; RE-STATED 2026-11-18 by unit \`B-2\` \`display-wire\` §4, which homed this unit's \`DISPLAY_READ\`/\`DISPLAY_CHANGED\` pair here and moved the census 2 → 4) (F-2)`,
    )
  }
  // (b) every export is a non-empty string constant — no function, no state, no logic
  for (const [name, value] of CHANNEL_VALUES) {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    if (!new RegExp(`^export\\s+const\\s+${name}\\s*=\\s*'${escaped}'`, 'm').test(src)) {
      problems.push(`EXPORT-CONTENT: the module does not declare \`export const ${name} = '${value}'\` — every export is a NON-EMPTY STRING constant; no function, no state (§1.1 member 1; F-2)`)
    }
  }
  if (/\bexport\s+function\b|\bexport\s+class\b|\bexport\s+let\b|\bexport\s+var\b/.test(src)) {
    problems.push(`EXPORT-CONTENT: the module carries a function/class/mutable export — §1.1 member 1 declares constants ONLY (no function, no state) (F-2)`)
  }
  // (c) the import closure: NO store-symbol import, NO src/renderer or src/shared import
  const specs = importSpecifiers(src)
  for (const spec of specs) {
    const forbidden =
      /store-core-graph|store-graph-references|store-channels/.test(spec) ||
      /(^|\/)renderer\//.test(spec) ||
      /(^|\/)shared\//.test(spec) ||
      /(^|\/)\.\.\/renderer\//.test(spec) ||
      /(^|\/)\.\.\/shared\//.test(spec)
    if (forbidden) {
      problems.push(`IMPORT-CLOSURE: the module imports \`${spec}\` — §1.1 member 1 forbids a store-symbol import and any src/renderer/** or src/shared/** import (F-2)`)
    }
  }
  // (d) the modules[] census: the module declares no `schemaVersion`-bearing state and no
  //     non-constant top-level binding (the "no state" clause)
  const nonConstTopLevel = [...src.matchAll(/^(?:let|var)\s+([A-Za-z_$][\w$]*)/gm)].map((m) => m[1]!)
  if (nonConstTopLevel.length > 0) {
    problems.push(`MODULE-STATE: the module carries top-level mutable binding(s) [${nonConstTopLevel.join(', ')}] — §1.1 member 1 declares NO state (F-2)`)
  }
  return problems
}

/** §2.1 / §3 F-3 — THE SINGLE-SOURCE RULE: the channel-name literals appear in EXACTLY
 *  ONE file of `src/**` (member 1). A re-spelling anywhere else reddens. */
function singleSourceProblems(): string[] {
  const problems: string[] = []
  const files = srcFiles()
  for (const [name, value] of CHANNEL_VALUES) {
    const hits = files.filter((file) => (readMaybe(file) ?? '').includes(`'${value}'`))
    if (hits.length === 0) {
      problems.push(`ABSTRACT-SUBJECT: the literal ${name} value '${value}' appears in NO src/** file — the single-source scan has no subject (module-does-not-exist; §4 R-1; F-3)`)
      continue
    }
    if (hits.length > 1) {
      problems.push(
        `F-8-SINGLE-SOURCE-VIOLATION: the literal ${name} value '${value}' appears in ${hits.length} src/** file(s) [${hits.map((h) => relative(REPO_ROOT, h)).join(', ')}] — §2.1's F-8 single-source rule admits member 1 ALONE (F-3)`,
      )
    }
    const only = hits[0]!
    if (resolve(only) !== resolve(CHANNELS_PATH)) {
      problems.push(
        `F-8-SINGLE-SOURCE-VIOLATION: the literal ${name} value '${value}' lives in ${relative(REPO_ROOT, only)} — §1.1 member 1 declares it in src/main/store-channels.ts ALONE (F-3)`,
      )
    }
  }
  return problems
}

/** §2.1 — the CONTRACT's importer set: main.ts and preload.ts import the constants;
 *  `src/renderer/**` NEVER imports the channel module (it reaches the channel through
 *  the preload member). */
function importerSetProblems(): string[] {
  const problems: string[] = []
  for (const rel of CHANNEL_IMPORTERS) {
    const text = readMaybe(join(REPO_ROOT, rel))
    if (text === null) {
      problems.push(`ABSTRACT-SUBJECT: ${rel} could not be read — the importer census has no substrate`)
      continue
    }
    const named = namedImportsFrom(text, './store-channels.js')
    const missing = CHANNEL_EXPORT_NAMES.filter((n) => !named.includes(n))
    if (missing.length > 0) {
      problems.push(
        `IMPORTER-CENSUS: ${rel} does not import [${missing.join(', ')}] from './store-channels.js' — §2.1's CONTRACT names main.ts and preload.ts as the ONLY importers, each taking {${CHANNEL_EXPORT_NAMES.join(', ')}} (§4 R-2)`,
      )
    }
  }
  const rendererHits = srcFiles()
    .filter((f) => relative(REPO_ROOT, f).startsWith('src/renderer/'))
    .filter((f) => /store-channels/.test(readMaybe(f) ?? ''))
  if (rendererHits.length > 0) {
    problems.push(
      `RENDERER-IMPORT: [${rendererHits.map((h) => relative(REPO_ROOT, h)).join(', ')}] reference the channel module — §2.1 states the renderer NEVER imports it; it reaches the channel through the preload member (F-2)`,
    )
  }
  return problems
}

/** §2.1 — the `Y-3` push rides the EXISTING `webContents.send` surface and needs NO third
 *  constant: the constants census stays exactly TWO. */
function constantsCensusProblems(): string[] {
  const problems: string[] = []
  const mainText = readMaybe(MAIN_PATH)
  const preloadText = readMaybe(PRELOAD_PATH)
  for (const [rel, text] of [
    ['src/main/main.ts', mainText],
    ['src/main/preload.ts', preloadText],
  ] as Array<[string, string | null]>) {
    if (text === null) {
      problems.push(`ABSTRACT-SUBJECT: ${rel} could not be read — the constants census has no substrate`)
      continue
    }
    const storeChannelLiterals = [...text.matchAll(/'provident:store:file:[\w-]+'/g)].map((m) => m[0])
    if (storeChannelLiterals.length > 0) {
      problems.push(
        `THIRD-CONSTANT: ${rel} carries the literal(s) [${storeChannelLiterals.join(', ')}] — the constants census stays EXACTLY TWO, imported from member 1; the Y-3 push rides the EXISTING webContents.send surface and needs NO third constant (§2.1; F-3)`,
      )
    }
  }
  return problems
}

// ===========================================================================
// ARM 2 — THE BOOT-ORDER BYTE-SCAN: the hydrate-before-Runtime/boot order, the
// crossing REPLACEMENT at the EXISTING call (the memoization clause), and the
// conditional `bridge?.store` gate (§2.3; §3 F-6/F-7/F-8).
// ===========================================================================
function bootOrderProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(RENDERER_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: src/renderer/renderer.ts could not be read — the boot-order byte-scan has no substrate`)
    return problems
  }
  // (a) EXACTLY ONE `hydrate(` call in the boot wiring
  const hydrateCalls = [...text.matchAll(/\bhydrate\(/g)]
  if (hydrateCalls.length === 0) {
    problems.push(
      `HYDRATE-AT-BOOT (counter=0): src/renderer/renderer.ts carries ZERO \`hydrate(\` calls — §2.3's sequence requires EXACTLY ONE (the boot order's), fed by the hand-off; at this head unit 1's boot calls hydrate NOWHERE (§4 R-3; F-7)`,
    )
  } else if (hydrateCalls.length > 1) {
    problems.push(`HYDRATE-AT-BOOT (counter=${hydrateCalls.length}): the boot wiring carries MORE THAN ONE \`hydrate(\` call — §2.3 declares EXACTLY ONE (F-7: "hydrate called TWICE — the count is exactly ONE")`)
  }
  // (b) the crossing is a REPLACEMENT at the EXISTING call — never a second call
  const callSites = [...text.matchAll(/\bgetWiredGraphStore\(/g)].filter((m) => !/export\s+function\s*$/.test(text.slice(Math.max(0, (m.index ?? 0) - 30), m.index ?? 0)))
  if (callSites.length === 0) {
    problems.push(`MEMOIZATION: NO \`getWiredGraphStore(\` construction call exists in the boot wiring (§2.3 has no subject)`)
  } else if (callSites.length > 1) {
    problems.push(
      `MEMOIZATION (C-3, startup-fatal; F-6): the boot wiring carries ${callSites.length} \`getWiredGraphStore(\` CALL sites — the crossing must be REPLACED at the EXISTING call; **a call added BESIDE the existing one is a FINDING** (§2.3; the memoization clause)`,
    )
  }
  // (c) the crossing is the LIVE crossing, not the `crossing: null` literal
  const feed = text.match(/getWiredGraphStore\(\{[\s\S]{0,200}?crossing:\s*([A-Za-z_$][\w$.?]*|null)/)
  if (feed === null) {
    problems.push(`CROSSING-FEED: the construction call carries no readable \`crossing:\` feed — §2.3 requires the live crossing at the EXISTING call site (§4 R-3)`)
  } else if (feed[1] === 'null') {
    problems.push(
      `CROSSING-FEED: the construction call's crossing is still the \`crossing: null\` literal — §2.3's crossing is fed by REPLACING it at the site the literal occupies today (§4 R-3; the C-1 amendment A-2's superseded literal, amended by the IMPLEMENTER — not here)`,
    )
  }
  // (d) the conditional gate: the crossing feed is conditional on `bridge?.store`
  if (!/bridge\?\.store/.test(text)) {
    problems.push(`CONDITIONAL-GATE: src/renderer/renderer.ts carries NO \`bridge?.store\` reference — §2.3 item (4) makes the crossing feed CONDITIONAL on the store bridge member (F-8)`)
  }
  // (e) THE ORDER: hydrate BEFORE the `new Runtime(…)` + `runtime.bootstrap()` pair
  const hydrateAt = text.search(/\bhydrate\(/)
  const runtimeAt = text.indexOf('new Runtime(')
  const bootstrapAt = text.indexOf('runtime.bootstrap()')
  if (runtimeAt < 0) problems.push(`BOOT-SEQUENCE: \`new Runtime(\` is not found — the paired-boundary limb has no upper bound`)
  if (bootstrapAt < 0) problems.push(`BOOT-SEQUENCE: \`runtime.bootstrap()\` is not found — the atomic pair's second half is absent`)
  if (hydrateAt >= 0 && runtimeAt >= 0 && hydrateAt > runtimeAt) {
    problems.push(`BOOT-SEQUENCE: the \`hydrate(\` call sits AFTER \`new Runtime(\` — §2.3 requires hydrate BEFORE the inseparable \`new Runtime(…)\` + \`runtime.bootstrap()\` pair (F-7)`)
  }
  if (hydrateAt >= 0 && bootstrapAt >= 0 && hydrateAt > bootstrapAt) {
    problems.push(`BOOT-SEQUENCE: the \`hydrate(\` call sits AFTER \`runtime.bootstrap()\` — §2.3's exact sequence is hand-off → hydrate → first envelope (F-7)`)
  }
  // (f) the HAND-OFF gate mirrors the proven `if (bridge?.security)` shape and calls the
  //     `store.get` channel; the `if (!bridge)` early-return follows, UNREORDERED
  const handoffAt = text.indexOf('bridge.store.get()')
  if (handoffAt < 0) {
    problems.push(`HAND-OFF-GATE: src/renderer/renderer.ts carries NO \`bridge.store.get()\` hand-off — §2.3's gate (1) calls the \`store.get\` channel, MIRRORING the proven \`if (bridge?.security)\` shape (§4 R-3)`)
  }
  const bridgeGuardAt = text.indexOf('if (!bridge)')
  if (bridgeGuardAt < 0) {
    problems.push(`NO-BRIDGE-GUARD: the \`if (!bridge)\` early-return is not found — §2.3 item (5) requires it to follow, UNREORDERED (F-8)`)
  } else if (runtimeAt >= 0 && bridgeGuardAt < runtimeAt) {
    problems.push(`NO-BRIDGE-GUARD: the \`if (!bridge)\` early-return PRECEDES the Runtime construction — it must follow the boot sequence, unreordered (§2.3 item (5); F-8)`)
  }
  if (handoffAt >= 0 && bridgeGuardAt >= 0 && handoffAt > bridgeGuardAt) {
    problems.push(`HAND-OFF-GATE: the hand-off sits AFTER the \`if (!bridge)\` early-return — the gate must precede it (§2.3; F-7)`)
  }
  // (g) THE NO-SECOND-TOP clause (§2.2, F-6): `FILE_TIER_TOP_NAMES_FORK` is NOT extended
  const topDecl = text.match(/FILE_TIER_TOP_NAMES_FORK\s*=\s*\[([\s\S]*?)\]/)
  if (topDecl === null) {
    problems.push(`NO-SECOND-TOP: no \`FILE_TIER_TOP_NAMES_FORK = […]}\` declaration is readable — the declared-roots set has no subject (§2.2)`)
  } else {
    const names = [...topDecl[1]!.matchAll(/name:\s*'([^']+)'/g)].map((m) => m[1]!)
    if (names.length !== 1 || names[0] !== 'settings') {
      problems.push(`NO-SECOND-TOP (F-6): FILE_TIER_TOP_NAMES_FORK declares [${names.join(', ') || 'none'}] — §2.2 leaves EXACTLY ONE top, \`settings\`, unchanged (a second top name, or a dropped \`settings\`, is F-6)`)
    }
  }
  return problems
}

// ===========================================================================
// ARM 3 — THE NO-`src/shared` BYTE-MOVE AND NO STORE-PAIR BYTE-MOVE ARMS
// (§1.2 items 1/2; the byte-pinned pair; the vendored fifteen).
// ===========================================================================
/** A JSON sidecar of the pre-edit digests, recorded ONCE at this head by the guard's own
 *  NAMED instrument (`node:crypto` sha256). The arms compare the WORKING TREE against
 *  these recorded readings; the LANDING does not move either subject, so the readings
 *  are stable across the unit (§1.2 items 1/2). */
const RECORDED_SHARED_SHA256: Record<string, string> | null = null
function sharedDirProblems(): string[] {
  const problems: string[] = []
  if (!existsSync(SHARED_DIR)) {
    problems.push(`ABSTRACT-SUBJECT: src/shared/ is ABSENT — the no-byte-move arm has no subject (§1.2 item 1)`)
    return problems
  }
  const files = readdirSync(SHARED_DIR).filter((f) => statSync(join(SHARED_DIR, f)).isFile())
  if (files.length === 0) {
    problems.push(`ABSTRACT-SUBJECT: src/shared/ carries NO files — the fifteen-set contract's substrate is absent (§1.2 item 1; the V-2/V-3 fifteen-set contract)`)
  }
  // The arm's comparison subject: the WORKING TREE's digests, re-read TWICE for stability
  // (a re-probe that differs between the two reads is a byte-divergence reading).
  for (const f of files) {
    const first = readBytes(join(SHARED_DIR, f))
    const second = readBytes(join(SHARED_DIR, f))
    if (first === null || second === null) {
      problems.push(`ABSTRACT-SUBJECT: src/shared/${f} could not be read — the re-probe has no subject`)
      continue
    }
    if (sha256(first) !== sha256(second)) {
      problems.push(`DIGEST-UNSTABLE: src/shared/${f} hashed to two different sha256 readings on the two re-probes — the file changed between them (§1.2 item 1)`)
    }
    if (RECORDED_SHARED_SHA256 !== null && RECORDED_SHARED_SHA256[f] !== undefined && RECORDED_SHARED_SHA256[f] !== sha256(first)) {
      problems.push(`SHARED-BYTE-MOVE: src/shared/${f} diverges from its recorded sha256 — this unit may touch NO byte of src/shared/** (§1.2 item 1; F-11)`)
    }
  }
  return problems
}

/** §1.2 item 2 — the byte-pinned pair: a semantic patch to `store-core-graph.ts` or
 *  `store-graph-references.ts` is a COLLISION finding. The arm's durable instrument is a
 *  CROSS-TREE byte-identity check against the recorded foundation revision
 *  (`7bd1de4786c4d46a3fee02f72adaf6ef612985d1`), plus the pair's presence/stability. */
const PINNED_COMMIT = '7bd1de4786c4d46a3fee02f72adaf6ef612985d1'
const FOUNDATION = resolve(REPO_ROOT, '..', 'Provident-Electron')

function storePairProblems(): string[] {
  const problems: string[] = []
  for (const rel of STORE_PAIR_RELATIVE) {
    const path = join(REPO_ROOT, rel)
    const bytes = readBytes(path)
    if (bytes === null) {
      problems.push(`ABSTRACT-SUBJECT: ${rel} is ABSENT at this head — the no-byte-move arm has no subject (§1.2 item 2)`)
      continue
    }
    const again = readBytes(path)
    if (again === null || sha256(bytes) !== sha256(again)) {
      problems.push(`DIGEST-UNSTABLE: ${rel} yielded two different sha256 readings on the two re-probes (§1.2 item 2)`)
    }
  }
  // the cross-tree arm — a named SKIP when the foundation tree is absent (never a pass)
  if (!existsSync(FOUNDATION)) {
    problems.push(
      `SKIPPED-SUBSTRATE: the foundation tree at ../Provident-Electron is ABSENT — the cross-tree byte-identity arm for the byte-pinned pair is SKIPPED with its reason (a SKIPPED arm is neither a pass nor a failure and proves NOTHING about the pin); the pair's own re-probe above still stands (§1.2 item 2)`,
    )
  }
  return problems
}

/** §1.2 item 3 — the lock is NOT extended: `moduleCount` stays `15`, no carrier cell and
 *  no channel cell. */
function lockProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(LOCK_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: vendor/foundation.lock.json could not be read — the lock arm has no subject (§1.2 item 3)`)
    return problems
  }
  let manifest: { moduleCount?: unknown; modules?: Array<{ name?: string }> }
  try {
    manifest = JSON.parse(text) as typeof manifest
  } catch (e) {
    problems.push(`ABSTRACT-SUBJECT: vendor/foundation.lock.json is unparsable (${(e as Error).message}) — the lock arm has no subject`)
    return problems
  }
  if (manifest.moduleCount !== 15) {
    problems.push(`MODULE-COUNT: the lock's \`moduleCount\` is ${String(manifest.moduleCount)} — §1.2 item 3 leaves it UNCHANGED at 15 (R-5)`)
  }
  const modules = Array.isArray(manifest.modules) ? manifest.modules : []
  if (modules.length !== 15) {
    problems.push(`MEMBER-COUNT: the lock's \`modules[]\` carries ${modules.length} members — the fifteen-set contract is frozen (§1.2 item 3)`)
  }
  const storeCells = modules.filter((m) => typeof m.name === 'string' && /store|settings/.test(m.name)).map((m) => String(m.name))
  if (storeCells.length > 0) {
    problems.push(`LOCK-CELL: the lock gained store/carrier cell(s) [${storeCells.join(', ')}] — the carrier + the channel gain NO lock cell (§1.2 item 3; F-11)`)
  }
  return problems
}

// ===========================================================================
// ARM 4 — THE DENIED-SURFACE NEGATIVE (§1.2 items 4/5/6; §3 F-11). GREEN-ON-ARRIVAL:
// every limb is a property ALREADY TRUE at this head and MUST STAY true. This arm must
// NEVER be reported as a landing-driven red (§4's no-other-red rule).
// ===========================================================================
/** §1.2 item 4 — NO MCP surface: no new tool/group/resource/`RpcMethod`, and NO second
 *  IPC key beyond the two channel constants. */
function mcpSurfaceProblems(): string[] {
  const problems: string[] = []
  const mcp = readMaybe(MCP_SERVER_PATH)
  if (mcp === null) {
    problems.push(`ABSTRACT-SUBJECT: src/main/mcp-server.ts could not be read — the no-MCP-surface limb has no substrate`)
  } else {
    for (const token of ['store-channels', 'STORE_FILE_GET', 'STORE_FILE_PUT', 'provident-settings']) {
      if (mcp.includes(token)) {
        problems.push(`MCP-SURFACE: src/main/mcp-server.ts carries \`${token}\` — §1.2 item 4 admits NO MCP surface; the store is never agent-addressable (§3 F-11)`)
      }
    }
  }
  // the two channel constants are the ONLY new IPC keys: the preload's `ipcRenderer.invoke`
  // subjects must be imported constants, never literals (§1.2 item 4's "no second IPC key")
  const preload = readMaybe(PRELOAD_PATH)
  if (preload === null) {
    problems.push(`ABSTRACT-SUBJECT: src/main/preload.ts could not be read — the no-second-IPC-key limb has no substrate`)
  } else {
    const literalInvocations = [...preload.matchAll(/ipcRenderer\.invoke\(\s*'([^']+)'/g)].map((m) => m[1]!)
    if (literalInvocations.length > 0) {
      problems.push(`SECOND-IPC-KEY: src/main/preload.ts invokes the literal channel name(s) [${literalInvocations.join(', ')}] — every invoke takes an imported constant (§1.2 item 4; §2.1's F-8 single-source rule)`)
    }
  }
  return problems
}

/** §1.2 items 5/6 — NO module-store migration and NO operator-settings re-home: neither
 *  file may carry a reference to the new carrier or the channel module. */
function deniedMigrationProblems(): string[] {
  const problems: string[] = []
  for (const [path, label] of [
    [MODULE_STORE_PATH, 'src/main/module-store.ts'],
    [OPERATOR_SETTINGS_PATH, 'src/main/operator-settings-store.ts'],
  ] as Array<[string, string]>) {
    const text = readMaybe(path)
    if (text === null) {
      problems.push(`ABSTRACT-SUBJECT: ${label} could not be read — the denied-migration limb has no substrate`)
      continue
    }
    for (const token of ['store-channels', 'provident-settings', 'STORE_FILE_GET', 'STORE_FILE_PUT']) {
      if (text.includes(token)) {
        problems.push(
          `DENIED-MIGRATION: ${label} carries \`${token}\` — §1.2 items 5/6 deny the Q-5 module-store migration (U-STORE-MODULES-MIGRATION) and the operator-settings re-home (U-OPERATOR-SETTINGS-REHOME); both are NAMED SUCCESSORS (§3 F-11)`,
        )
      }
    }
  }
  return problems
}

/** §1.2 item 4 — no `package.json` script key named for the store/channel. */
function packageScriptProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(PKG_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: package.json could not be read — the script-key limb has no substrate`)
    return problems
  }
  const pkg = JSON.parse(text) as { scripts?: Record<string, string> }
  const keys = Object.keys(pkg.scripts ?? {}).filter((k) => /store|persist|user-data/i.test(k))
  if (keys.length > 0) {
    problems.push(`SCRIPT-KEY: package.json carries store/persist-named script key(s) [${keys.join(', ')}] — §1.2 item 9 admits no scripts/** or package.json change for the boot reorder (the seam is an argv flag, never a script key)`)
  }
  return problems
}

// ===========================================================================
// ARM 5 — THE `--provident-user-data=` SEAM PRESENCE (§2.9). RED-BY-ABSENCE: the seam is
// this unit's OWN landing (the honest divergence record). It is resolved BEFORE the
// carrier's path is computed.
// ===========================================================================
function seamProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(MAIN_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: src/main/main.ts could not be read — the seam arm has no substrate`)
    return problems
  }
  if (!text.includes(SEAM_FLAG)) {
    problems.push(
      `SEAM-ABSENT: src/main/main.ts carries NO \`${SEAM_FLAG}\` read — §2.9's seam is THIS unit's own landing (the fork has neither the seam nor \`scripts/electron-ui.mjs\` at this head); the live leg's drivable precondition is owed (§3 F-12; the honest divergence record)`,
    )
  }
  const setPathAt = text.indexOf("app.setPath('userData'")
  const firstGetPathAt = text.indexOf("app.getPath('userData')")
  if (setPathAt < 0) {
    problems.push(`SEAM-APPLY: no \`app.setPath('userData', …)\` call exists — §2.9's seam FEEDS \`app.setPath('userData', <path>)\``)
  } else if (firstGetPathAt >= 0 && setPathAt > firstGetPathAt) {
    problems.push(
      `SEAM-ORDER: the \`app.setPath('userData', …)\` call sits AFTER the first \`app.getPath('userData')\` — §2.9 requires the seam RESOLVED BEFORE the carrier's path is computed (before the \`createSecurityStore\`/carrier constructions)`,
    )
  }
  // the existing argv-seam idiom (§2.9: read from `process.argv.slice(1)`)
  if (!/process\.argv\.slice\(1\)/.test(text)) {
    problems.push(`SEAM-IDIOM: no \`process.argv.slice(1)\` read exists in src/main/main.ts — §2.9's seam is read in the EXISTING argv-seam idiom (transportFromArgs/portFromArgs/retrievalEmbedderFromArgs)`)
  }
  return problems
}

// ===========================================================================
// ARM 6 — THE PERSISTED-SET PIN, SCOPED TO THE UI-CONFIG FAMILY, WITH THE OTHER FORK
// FILES NAMED OUT OF SCOPE (§2.8; C-4). Two limbs:
//   (i) green-on-arrival — the spec never asserts the whole-tree "exactly two files"
//       wording as a CLAIM (the arithmetic is stated honestly: SIX userData paths);
//   (ii) red-by-absence — the carrier `provident-settings.json` does not exist yet.
// ===========================================================================
function persistedSetProblems(): { claimProblems: string[]; carrierProblems: string[] } {
  const claimProblems: string[] = []
  const carrierProblems: string[] = []
  const spec = readMaybe(SPEC_PATH)
  if (spec === null) {
    claimProblems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, SPEC_PATH)} could not be read — the persisted-set claim limb has no substrate`)
  } else {
    // the class-A scope must be STATED, and classes B/C named OUT OF SCOPE
    const region = spec.slice(spec.indexOf('### 2.8 THE PERSISTED-SET ROW'), spec.indexOf('### 2.9'))
    for (const cls of ['A — UI-CONFIG FAMILY', 'B — FORK CARRIERS OUT OF SCOPE BY NAME', 'C — ACCRUED / NON-CARRIER ARTIFACTS']) {
      if (!region.includes(cls)) {
        claimProblems.push(`PERSISTED-SET-CLASS: the §2.8 row does not declare the class \`${cls}\` — §2.8 states the pin in the CLASS-A form ONLY, with classes B/C OUT OF SCOPE BY NAME (§3 F-11)`)
      }
    }
    if (!/whole-tree wording|EXACTLY two files" NEVER APPEARS|never appears as a claim/i.test(region)) {
      claimProblems.push(`PERSISTED-SET-CLAIM: the §2.8 row does not record that the whole-tree "exactly two files" wording NEVER APPEARS as a claim — a persisted-set claim asserted over a file its census does not cover is a FALSE PIN, never a bound (C-4)`)
    }
    for (const f of CLASS_B_FILES) {
      if (!region.includes(f)) {
        claimProblems.push(`PERSISTED-SET-OUT-OF-SCOPE: the §2.8 row does not name the class-B carrier \`${f}\` — classes B/C are declared OUT OF SCOPE **BY NAME**, never silently (§2.8; C-4)`)
      }
    }
    for (const a of CLASS_C_ARTIFACTS) {
      if (!region.includes(a)) {
        claimProblems.push(`PERSISTED-SET-OUT-OF-SCOPE: the §2.8 row does not name the class-C artifact \`${a}\` — recorded, not counted (§2.8; C-4)`)
      }
    }
    for (const f of CLASS_A_FILES) {
      if (!region.includes(f)) {
        claimProblems.push(`PERSISTED-SET-CLASS-A: the §2.8 row does not name the class-A file \`${f}\` — the pin is scoped to EXACTLY this pair (§2.8; C-4)`)
      }
    }
  }
  // (ii) the arithmetic at the head: main.ts's userData path sites, printed with terms
  const mainText = readMaybe(MAIN_PATH)
  if (mainText === null) {
    carrierProblems.push(`ABSTRACT-SUBJECT: src/main/main.ts could not be read — the carrier census has no substrate`)
  } else {
    const sites = [...mainText.matchAll(/join\(app\.getPath\('userData'\),\s*'([^']+)'\)/g)].map((m) => m[1]!)
    // eslint-disable-next-line no-console
    console.log(
      `PD-STORE-PERSIST-ADOPT arm 6 [carrier census]: src/main/main.ts mints ${sites.length} userData path site(s), term by term: [${sites.join(', ')}] — ` +
        `the CLASS-A pin covers {${CLASS_A_FILES.join(', ')}} and NOTHING ELSE (§2.8's census: the arithmetic stated honestly, K-4)`,
    )
    const missingCarrier = !sites.includes('provident-settings.json')
    if (missingCarrier) {
      carrierProblems.push(
        `CARRIER-ABSENT: src/main/main.ts mints NO \`provident-settings.json\` userData path — §2.7 item 1 mints the tier-1 carrier at EXACTLY ONE site in main.ts (\`<userData>/provident-settings.json\`); the minted set at this head is [${sites.join(', ')}] (§4 R-6)`,
      )
    }
    for (const f of CLASS_B_FILES) {
      if (!sites.includes(f)) {
        carrierProblems.push(`CARRIER-CENSUS: the class-B carrier \`${f}\` is not among main.ts's minted userData sites — §2.8's arithmetic names it OUT OF SCOPE (never silently dropped from the census) (§3 F-11)`)
      }
    }
  }
  return { claimProblems, carrierProblems }
}

// ===========================================================================
// ARM 1 — the channel module's export census + the single-source rule scan (§2.1).
// ===========================================================================
describe('PD-STORE-PERSIST-ADOPT arm 1 — the channel module: `src/main/store-channels.ts` declares EXACTLY {STORE_FILE_GET, STORE_FILE_PUT, DISPLAY_READ, DISPLAY_CHANGED} (the set RE-STATED 2026-11-18 by unit `B-2` `display-wire` §4 — census 2 → 4, claim unmoved), non-empty string constants only; every constant is single-sourced (a re-spelling anywhere else in src/** reddens); main.ts and preload.ts are the ONLY importers; the STORE-channel constants census stays TWO', () => {
  it('arm 1 — the module export census + the import closure + the whole-tree re-spelling scan + the importer census (§2.1; §1.1 member 1; §3 F-2/F-3)', () => {
    const problems = [...channelModuleProblems(), ...singleSourceProblems(), ...importerSetProblems(), ...constantsCensusProblems()]
    // eslint-disable-next-line no-console
    console.log(`PD-STORE-PERSIST-ADOPT arm 1 (RED-BY-ABSENCE at this head): ${problems.length} finding(s)\n    ${problems.join('\n    | ')}`)
    recordArm(
      '1 · channel-module export census + single-source rule',
      problems,
      'RED-BY-ABSENCE',
      'RED at the red head: src/main/store-channels.ts does not exist (§4 R-1, module-does-not-exist); the single-source scan and the importer census run on the real substrate and report the absent constants',
    )
    expect(problems, `arm 1: ${problems.join(' | ') || 'the channel module declares the two constants, single-sourced, imported only by main.ts and preload.ts'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// ARM 2 — THE BOOT-ORDER BYTE-SCAN (§2.3).
// ===========================================================================
describe('PD-STORE-PERSIST-ADOPT arm 2 — THE BOOT-ORDER BYTE-SCAN: EXACTLY ONE `hydrate(` call, placed BEFORE the `new Runtime(…)` + `runtime.bootstrap()` pair; the crossing REPLACED at the EXISTING `getWiredGraphStore(` call (a SECOND call is a FINDING, §2.3 memoization clause); the conditional `bridge?.store` gate; the `if (!bridge)` early-return following UNREORDERED; `FILE_TIER_TOP_NAMES_FORK` carrying ONE top', () => {
  it('arm 2 — the boot-order byte-scan over src/renderer/renderer.ts (§2.3; §2.2; §3 F-6/F-7/F-8)', () => {
    const problems = bootOrderProblems()
    const text = readMaybe(RENDERER_PATH)
    const callSites = text === null ? -1 : [...text.matchAll(/\bgetWiredGraphStore\(/g)].filter((m) => !/export\s+function\s*$/.test(text.slice(Math.max(0, (m.index ?? 0) - 30), m.index ?? 0))).length
    const hydrateCalls = text === null ? -1 : [...text.matchAll(/\bhydrate\(/g)].length
    // eslint-disable-next-line no-console
    console.log(
      `PD-STORE-PERSIST-ADOPT arm 2 (RED-BY-ABSENCE at this head): getWiredGraphStore call sites = ${String(callSites)} (the memoization clause's reading) · ` +
        `hydrate( calls = ${String(hydrateCalls)} (§2.3's counter reads 0) · crossing feed = ${/crossing:\s*null/.test(text ?? '') ? 'the `crossing: null` literal' : 'not the null literal'} · ` +
        `bridge?.store present = ${String(/bridge\?\.store/.test(text ?? ''))} — ${problems.length} finding(s)\n    ${problems.join('\n    | ')}`,
    )
    recordArm(
      '2 · the boot-order byte-scan',
      problems,
      'RED-BY-ABSENCE',
      'RED at the red head: the boot reorder is ABSENT — the hydrate counter reads 0, the crossing is still the `crossing: null` literal and no `bridge.store.get()` hand-off exists (§4 R-3)',
    )
    expect(problems, `arm 2: ${problems.join(' | ') || 'the boot order lands exactly as §2.3 declares'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// ARM 3 — the no-src/shared byte-move and no store-pair byte-move arms (§1.2 items 1/2).
// GREEN-ON-ARRIVAL: both are denials ALREADY TRUE at this head.
// ===========================================================================
describe('PD-STORE-PERSIST-ADOPT arm 3 — the DENIED-SURFACE byte arms: NO byte of src/shared/** moves (the vendored fifteen + types.ts); the byte-pinned pair src/renderer/store-core-graph.ts + store-graph-references.ts is NOT semantically patched (a semantic patch is a COLLISION finding); vendor/foundation.lock.json is NOT extended', () => {
  it('arm 3 — the src/shared/** re-probe, the byte-pinned pair re-probe (with the cross-tree arm SKIPPED-when-absent, never a pass) and the lock arm (§1.2 items 1/2/3; §3 F-11)', () => {
    const shared = sharedDirProblems()
    const pair = storePairProblems()
    const lock = lockProblems()
    const skipped = pair.filter((p) => p.startsWith('SKIPPED-SUBSTRATE'))
    const problems = [...shared, ...pair.filter((p) => !p.startsWith('SKIPPED-SUBSTRATE')), ...lock]
    for (const s of skipped) {
      // eslint-disable-next-line no-console
      console.log(`PD-STORE-PERSIST-ADOPT arm 3 SKIP RECORD: ${s} — recorded for the DONE row, NEVER a pass`)
    }
    // eslint-disable-next-line no-console
    console.log(`PD-STORE-PERSIST-ADOPT arm 3 (GREEN-ON-ARRIVAL): src/shared findings ${shared.length} · pair findings ${problems.length - shared.length - lock.length} · lock findings ${lock.length} · skipped arms ${skipped.length}`)
    recordArm(
      '3 · the denied byte arms (src/shared + the byte-pinned pair + the lock)',
      problems,
      'GREEN-ON-ARRIVAL',
      'GREEN-ON-ARRIVAL (denials already true at this head) — expected green BEFORE and AFTER; a landing that reddens this arm has touched a DENIED surface (§3 F-11)',
    )
    expect(problems, `arm 3: ${problems.join(' | ') || 'no src/shared byte, no store-pair byte and no lock cell moved — the denials hold'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// ARM 4 — the denied-surface NEGATIVE (§1.2 items 4/5/6). GREEN-ON-ARRIVAL.
// ===========================================================================
describe('PD-STORE-PERSIST-ADOPT arm 4 — the DENIED-SURFACE negative: NO MCP surface (no new tool/group/resource/RpcMethod, no second IPC key); NO module-store migration edit (U-STORE-MODULES-MIGRATION); NO operator-settings re-home (U-OPERATOR-SETTINGS-REHOME); no store-named package.json script key — GREEN-ON-ARRIVAL and must STAY green', () => {
  it('arm 4 — the MCP-surface negative, the two denied-migration files, and the package.json script-key limb (§1.2 items 4/5/6/9; §3 F-11)', () => {
    const problems = [...mcpSurfaceProblems(), ...deniedMigrationProblems(), ...packageScriptProblems()]
    // eslint-disable-next-line no-console
    console.log(`PD-STORE-PERSIST-ADOPT arm 4 (GREEN-ON-ARRIVAL): ${problems.length} finding(s)${problems.length > 0 ? `\n    ${problems.join('\n    | ')}` : ''}`)
    recordArm(
      '4 · the denied-surface negative',
      problems,
      'GREEN-ON-ARRIVAL',
      'GREEN-ON-ARRIVAL (a negative, §4) — expected green BEFORE and AFTER; never reported as a landing-driven red. The two denied migrations are NAMED SUCCESSORS with their own units.',
    )
    expect(problems, `arm 4: ${problems.join(' | ') || 'the landing adds no MCP surface, no migration edit, no re-home and no script key — the negative holds'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// ARM 5 — the `--provident-user-data=` seam presence (§2.9). RED-BY-ABSENCE.
// ===========================================================================
describe('PD-STORE-PERSIST-ADOPT arm 5 — the `--provident-user-data=` seam: the flag is read from `process.argv.slice(1)` in the existing argv-seam idiom, feeding `app.setPath(\'userData\', …)`, RESOLVED BEFORE the carrier\'s path is computed; absent/empty/relative values fall back to the default root with a logged warning and NO throw (the honest divergence record: the fork has NEITHER this seam NOR scripts/electron-ui.mjs at this head)', () => {
  it('arm 5 — the seam byte-scan over src/main/main.ts (§2.9; §3 F-12)', () => {
    const problems = seamProblems()
    // eslint-disable-next-line no-console
    console.log(`PD-STORE-PERSIST-ADOPT arm 5 (RED-BY-ABSENCE at this head): ${problems.length} finding(s)\n    ${problems.join('\n    | ')}`)
    recordArm(
      '5 · the --provident-user-data= seam',
      problems,
      'RED-BY-ABSENCE',
      'RED at the red head: the seam is ABSENT — it is THIS unit\'s own landing (the divergence record: the fork has neither the seam nor scripts/electron-ui.mjs) (§4 R-6)',
    )
    expect(problems, `arm 5: ${problems.join(' | ') || 'the seam is read, applied before the carrier path, and falls back cleanly on a malformed value'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// ARM 6 — THE PERSISTED-SET PIN, SCOPED TO THE UI-CONFIG FAMILY (§2.8; C-4).
// ===========================================================================
describe('PD-STORE-PERSIST-ADOPT arm 6 — THE PERSISTED-SET PIN, SCOPED: the pin covers the class-A UI-CONFIG family {provident-settings.json, provident-security.json} and NOTHING ELSE; the class-B fork carriers are named OUT OF SCOPE BY NAME with owners; the class-C artifacts are recorded, not counted; the whole-tree "exactly two files" wording NEVER APPEARS as a claim (the arithmetic: main.ts mints SIX userData paths)', () => {
  it('arm 6 (a) — GREEN-ON-ARRIVAL: the spec\'s §2.8 row states the pin in the class-A form only, names every class-B carrier and class-C artifact out of scope, and records that the whole-tree wording is never a claim (C-4)', () => {
    const { claimProblems } = persistedSetProblems()
    // eslint-disable-next-line no-console
    console.log(`PD-STORE-PERSIST-ADOPT arm 6(a) (GREEN-ON-ARRIVAL): ${claimProblems.length} finding(s)${claimProblems.length > 0 ? `\n    ${claimProblems.join('\n    | ')}` : ''}`)
    recordArm(
      '6a · the persisted-set CLAIM (class-A form only)',
      claimProblems,
      'GREEN-ON-ARRIVAL',
      'GREEN-ON-ARRIVAL: the spec lands the class-A form; a landing that re-asserts the whole-tree wording reddens THIS arm (C-4; §3 F-11)',
    )
    expect(claimProblems, `arm 6 (a): ${claimProblems.join(' | ') || 'the persisted-set pin is stated in the class-A form only, with B/C out of scope BY NAME'}`).toEqual([])
  }, 12_000)

  it('arm 6 (b) — RED-BY-ABSENCE: the class-A carrier `provident-settings.json` is NOT among the userData paths src/main/main.ts mints, and every class-B carrier IS named in the census (never silently dropped)', () => {
    const { carrierProblems } = persistedSetProblems()
    // eslint-disable-next-line no-console
    console.log(`PD-STORE-PERSIST-ADOPT arm 6(b) (RED-BY-ABSENCE at this head): ${carrierProblems.length} finding(s)\n    ${carrierProblems.join('\n    | ')}`)
    recordArm(
      '6b · the class-A carrier mint',
      carrierProblems,
      'RED-BY-ABSENCE',
      'RED at the red head: the tier-1 carrier does not exist — §2.7 item 1 mints `<userData>/provident-settings.json` at exactly ONE site in src/main/main.ts (§4 R-6)',
    )
    expect(carrierProblems, `arm 6 (b): ${carrierProblems.join(' | ') || 'the class-A carrier is minted and the class-B census is complete'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// ARM 7 — C-7, THE RESERVED-NAMESPACE REFUSAL: RECORDED `NOT ARMED` (§11a). This arm is
// GREEN-ON-ARRIVAL: it asserts that NO repair row claims the refusal is armed. §11a
// states: "a repair row asserting the refusal in THIS unit is F-12's honesty class (an
// unarmed refusal claimed as armed)".
// ===========================================================================
describe('PD-STORE-PERSIST-ADOPT arm 7 — C-7 declared NOT ARMED: this unit does NOT arm the reserved-namespace refusal (the store\'s `reservedNamespaces` option defaults to [] and the fork\'s boot construction passes none); the state is recorded `NOT ARMED — carried with the named successor owner`; a row asserting the refusal HERE would be F-12\'s honesty class', () => {
  it('arm 7 — the C-7 state is recorded NOT ARMED in the spec §11a, and the fork\'s boot construction passes no `reservedNamespaces` option (§11a; §3 F-12)', () => {
    const problems: string[] = []
    const spec = readMaybe(SPEC_PATH)
    if (spec === null) {
      problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, SPEC_PATH)} could not be read — the C-7 arm has no substrate`)
    } else {
      const anchor = spec.indexOf('**§11a — C-7')
      const region = anchor < 0 ? '' : spec.slice(anchor, spec.indexOf('## 12. The obligations list'))
      if (region.length === 0) {
        problems.push(`C-7-RECORD: the spec carries no anchored §11a region — the C-7 state (\`NOT ARMED\`, with its own gate) must be recorded, never claimed armed (§11a; §3 F-12)`)
      } else {
        if (!/NOT ARMED/.test(region)) {
          problems.push(`C-7-RECORD: §11a does not record the state \`NOT ARMED\` — the reserved-namespace refusal is NOT ARMED in this fork at this head and this unit does NOT arm it (§11a)`)
        }
        if (!/U-STORE-MODULES-MIGRATION/.test(region)) {
          problems.push(`C-7-OWNER: §11a does not name the successor owner — arming the refusal is the MIGRATION's, with its own gate and falsifier (§11a)`)
        }
      }
    }
    // the fork's boot construction passes no `reservedNamespaces` option
    const renderer = readMaybe(RENDERER_PATH)
    if (renderer === null) {
      problems.push(`ABSTRACT-SUBJECT: src/renderer/renderer.ts could not be read — the no-reservedNamespaces limb has no substrate`)
    } else if (/reservedNamespaces/.test(renderer)) {
      problems.push(
        `C-7-CLAIMED-ARMED: src/renderer/renderer.ts passes a \`reservedNamespaces\` option at the boot construction — §11a records the refusal NOT ARMED and names the MIGRATION as the arming unit; arming it HERE is a construction-option change at unit 1's boot call site, outside this unit's scope (F-12's honesty class)`,
      )
    }
    // this guard's own text must not ASSERT the refusal as armed
    const self = readMaybe(SELF_PATH)
    if (self === null) {
      problems.push(`ABSTRACT-SUBJECT: this file could not be read — the self-scan has no substrate`)
    } else {
      const assertsArmed = /'reserved-namespace'[\s\S]{0,80}\b(refus|armed)\b/i.test(self.replace(/^\/\/.*$/gm, ''))
      if (assertsArmed && !/NOT ARMED/.test(self)) {
        problems.push(`C-7-CLAIMED-ARMED: this guard's code asserts the reserved-namespace refusal without recording it NOT ARMED — never claim an unarmed refusal armed (§11a; §3 F-12)`)
      }
    }
    // eslint-disable-next-line no-console
    console.log(`PD-STORE-PERSIST-ADOPT arm 7 (GREEN-ON-ARRIVAL): C-7 recorded NOT ARMED with its successor owner; the fork's boot construction passes no reservedNamespaces option — ${problems.length} finding(s)${problems.length > 0 ? `\n    ${problems.join('\n    | ')}` : ''}`)
    recordArm(
      '7 · C-7 reserved-namespace refusal NOT ARMED',
      problems,
      'GREEN-ON-ARRIVAL',
      'GREEN-ON-ARRIVAL: the spec records NOT ARMED; an arm asserting the refusal as armed would be F-12\'s honesty class (§11a)',
    )
    expect(problems, `arm 7: ${problems.join(' | ') || 'C-7 is recorded NOT ARMED with its named successor, and no surface claims it armed'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// THE ARM-VERDICT REPORT — the run's reading, printed verbatim for the DONE row.
// ===========================================================================
describe('PD-STORE-PERSIST-ADOPT — the arm-verdict report and the head anchor', () => {
  it('the arm-verdict report: the seven arms with their verdict classes (RED-BY-ABSENCE · GREEN-ON-ARRIVAL · SKIPPED) — at this head 4 RED-BY-ABSENCE, 3 GREEN-ON-ARRIVAL, 0 GREEN, 0 SKIPPED', () => {
    // eslint-disable-next-line no-console
    console.log(
      '\nPD-STORE-PERSIST-ADOPT GUARD — ARM-VERDICT REPORT (the RED RUN at the pre-edit head)\n' +
        ARM_VERDICTS.map((v) => `  arm ${v.arm}: ${v.verdict} — ${v.note}${v.limbs.length > 0 ? `\n      limbs: ${v.limbs.join('\n      | ')}` : ''}`).join('\n') +
        '\nEND PD-STORE-PERSIST-ADOPT ARM-VERDICT REPORT',
    )
    expect(ARM_VERDICTS.length, 'all EIGHT arm-verdict rows reported (arm 6 split a/b — the §2.8 claim limb and the carrier-mint limb)').toBe(8)
    const byClass = (c: ArmVerdict): number => ARM_VERDICTS.filter((v) => v.verdict === c).length
    // eslint-disable-next-line no-console
    console.log(
      `PD-STORE-PERSIST-ADOPT arm classes at this head: RED-BY-ABSENCE ${byClass('RED-BY-ABSENCE')} · GREEN-ON-ARRIVAL ${byClass('GREEN-ON-ARRIVAL')} · GREEN ${byClass('GREEN')} · SKIPPED ${byClass('SKIPPED')}`,
    )
    expect(byClass('GREEN-ON-ARRIVAL'), 'the GREEN-ON-ARRIVAL arms are EXPLICITLY MARKED as such (arms 3, 4, 6a, 7) — a negative/denial arm already true at this head, never counted as a landing-driven red (§4)').toBeGreaterThanOrEqual(3)
    expect(byClass('GREEN'), 'no arm is unconditionally GREEN at this head — every landing-driven arm is RED (§4 R-1..R-6); a GREEN here would mean the arm lost its subject').toBe(0)
  }, 12_000)
})
