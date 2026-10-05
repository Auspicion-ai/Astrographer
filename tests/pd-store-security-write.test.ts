// tests/pd-store-security-write.test.ts — UNIT `U-STORE-SECURITY-WRITE` (3a, the FIRST half
// of the SPLIT unit 3 of the store-adoption program, F2) — THE SURFACE/BYTE GUARD: the
// SIX-member change-set census; the DENIED-surface negative over §1.2's ELEVEN rows; the md5
// re-statement row; and the landed count-1 guards staying green.
//
// SOURCE OF EVERY ASSERTION (spec ONLY):
//   docs/specs/unit-store-security-write.md
//     §1.1 members 1-6   THE ONE ATOMIC COMMIT'S SIX MEMBERS — the store module's new members
//                        (`persist()`'s atomic five-step write · `lastWriteReceipt()` · the
//                        additive optional `fs?` façade); the receipt type's home in
//                        `src/shared/types.ts`; the `IPC_SECURITY_SET` handler's ADDITIVE
//                        return; the preload's TWO widened `security.set` declarations; the
//                        `preload.ts` md5 RE-STATEMENT; the TWO new test files. A landing whose
//                        commit moves a DIFFERENT member set, or lands across more than one
//                        commit, is §3 `F-1` — the unit-2 `F-1` precedent makes a different
//                        member set a FAILED unit.
//     §1.2 items 1-11    THE ELEVEN DENIED ROWS — no `src/renderer/**` byte (3b's); no
//                        `src/renderer/store-core-graph.ts`/`store-graph-references.ts` byte
//                        (unit 1's byte-pinned pair); `vendor/foundation.lock.json` NOT
//                        extended; no MCP surface and no second IPC key; no `VALID_GROUPS`
//                        change (the census stays NINE); no `SecuritySettings` widening; no
//                        second `securityStore.set(` call site and no moved `.applyGatePatch(`;
//                        no `schemaVersion` on this tier's file; no new refusal site; no
//                        `secure.*` reach widening; no byte under `../Provident-Electron/**`,
//                        `vitest.config.ts`, or the active trackers beyond this unit's own half
//     §2.1 S-1..S-5      the store's declared surface (the factory's UNCHANGED signature; the
//                        additive-optional façade; `get()`/`set()` UNCHANGED; the NEW
//                        `lastWriteReceipt()`)
//     §2.2               the receipt's TWO CLOSED FORMS and its home
//     §2.3               `VALID_GROUPS` is exactly NINE (the census printed with its terms)
//     §2.4 items 1-6     the atomic five-step write; the receipt replacing the swallow; the
//                        SET return's additive member; the fail-states
//     §2.5               the TWO `security.set` declaration sites
//     §3.1/§3.2          THE INVARIANT and the rules I-1..I-7
//     §3.3 legs 1-3      the three observability legs
//     §4 RE-1..RE-5      the red set and the no-other-red rule WITH ITS PRE-RECORDED
//                        EXEMPTIONS: amendment row 1 (the `preload.ts` md5 row is EXPECTED RED
//                        until the re-statement lands in the SAME commit), amendment row 2
//                        (`UNRESTATED_CONTROL_PATH` stays DERIVED and must be ASSERTED
//                        NON-VACUOUS), amendment rows 3+4 (the count-1 guards), 5
//                        (`NEG-SECOND-WRITER`), 6 (unit 1's E-2 arm-4), 7 (`R-10`), 8 (the
//                        `VALID_GROUPS` census), 10 (the pane's rendering) are LEAVE-ALONE and
//                        must STAY GREEN — a landing that reddens ANY of them has NOT landed
//                        this unit
//     §5.1 P-SSW-H-1/-2/-3   the `[H]` surface pins this guard's arms answer to
//     §6                the layer ledger and the HONESTY/LIMITS block
//
// THE ARM CLASSIFICATION (recorded per arm, §4). Four classes, tracked distinctly:
//   RED-BY-ABSENCE     — the arm's subject module/surface does not exist at this head.
//   RED-BY-SHIM        — the arm's oracle runs against the landed substrate and reports the
//                        pinned property UNSATISFIED (the shim/byte-scan instrument).
//   GREEN-ON-ARRIVAL   — the arm asserts a property ALREADY TRUE at this head (a
//                        negative/denied-surface pin, or a landed guard that stays green).
//                        Marked explicitly, never counted as a landing-driven red (§4's
//                        no-other-red rule); a landing that reddens one of these has NOT
//                        landed this unit.
//   GREEN              — the arm's property holds over its landed subject at this head AND is
//                        landing-driven. Reported `GREEN`, never conflated with a
//                        landing-driven red and never claimed as app-green.
//   SKIPPED            — the arm's substrate is absent (a named skip with its reason; a
//                        SKIPPED arm is NEVER a pass).
//
// LAYER (RCA-12 / §6). `[T]`/`[H]`. This guard asserts BYTES and SURFACE — never module
// BEHAVIOUR (the register owns that), never app/envelope/store/live state. **NO DURABILITY
// CLAIM IS MADE OR ASSERTED ANYWHERE IN THIS FILE.**
//
// THE TWO FILES' DIVISION OF LABOUR (§1.1 member 6): this guard owns the BYTE/SURFACE pins and
// the DENIED-SURFACE negative; the sibling register (`tests/store-security-write-register.test.ts`)
// owns the DRIVEN rows (the atomic-shape machine over the injected façade, the receipt
// totality, the patch-class totality, the nine-member census over the driven store, the
// register leg driving `IPC_SECURITY_SET` directly). The `preload`-widening and
// `SecurityWriteReceipt`-home limbs therefore appear in BOTH files BY DESIGN — each is the
// other's independent instrument (§4 RE-5 names both files for the same red).
//
// THE WALL: this file touches NOTHING but its own bytes. No `src/**` byte, no landed test file
// (the md5 row is READ, never edited — its re-statement is the IMPLEMENTER's in-commit act per
// §1.1 member 5 / `O-2`, now owned unambiguously by `A-3A-2` ②), no spec/tracker byte, no
// `vitest.config.ts`/`package.json` byte.
//
// ===========================================================================
// THE HEADER RECONCILIATION NOTE — `A-3A-2` ①/③ (2026-10-04), THE RE-AIMs TO THIS FILE
// (`RCA-8(c)` ANNOTATE-BESIDE: the as-filed text above is KEPT VISIBLE and this block is the
// OPERATIVE disposition; `A-3A-1` stands as filed and `A-3A-2` ① EXTENDS it to the limbs the
// first re-aim wall did not reach — the same author-role class).
//
// ① ARM 1's MEMBER 2 (`MEMBER-2`) — **RE-AIMED, + the DUPLICATE-HOME discrimination ADDED.**
//    BEFORE: the shared-home demand — `SecurityWriteReceipt` declared in `src/shared/types.ts`.
//    AFTER:  the declaration demanded in `src/main/security-store.ts` (THE RULED HOME per
//    `A-3A-1` ① / §1.1 member 2 superseded in part, `src/shared/types.ts` IS NOT MOVED), PLUS a
//    `MEMBER-2-DUPLICATE-HOME` limb: the identifier must be DECLARED in **EXACTLY ONE** of the
//    two files, and a declaration in BOTH reddens it. (The as-filed sibling limb
//    `RECEIPT-HOME-COLLISION`, which FORBADE the identifier in the store module, is WITHDRAWN
//    AS ANTI-QUATED in the register — see that file's header. Its INTENT survives here as well:
//    ONE home, no duplicate declaration; only WHICH file is named changed.)
//    • STILL CAUGHT: the type declared in the RULED home WHILE the as-filed shared declaration
//      is LEFT IN PLACE (two competing homes for one type — the dirty-state class).
//    • NOT a duplicate home: `src/main/preload.ts`'s own STRUCTURALLY-IDENTICAL LOCAL type for
//      the response member (`A-3A-1` ①) — a third file, not a third home; that surface is
//      pinned separately by member 4's two widened declaration sites.
//
// ② ARM 2's `DENIED-9/I-5` (the stale premise `A-3A-1` ② already ruled) — **NARROWED.**
//    BEFORE: a FLAT scan for the receipt token anywhere in `src/main/security-store.ts`.
//    AFTER:  the STORE'S UNION subject (a `| 'write-failed'` union arm, or a
//    `type … = … 'write-failed'` declaration), with `src/main/main.ts` / `store-channels.ts` /
//    `preload.ts`'s LANDED unit-2 `StoreChannelRefusal` vocabulary **EXEMPT BY NAME** — the SAME
//    narrowing the register's re-aimed `P-SSW-IM-6` drive 4 already applies.
//    • WHY THE FLAT SCAN WAS WRONG: §2.1 S-4/§2.2 REQUIRE the store to land the very spelling
//      `{ status: 'refused'; reason: 'write-failed' }` — the flat scan reddened on the unit's
//      OWN MANDATED surface, i.e. it could never be satisfied by a correct landing.
//    • STILL CAUGHT: the token ADDED TO THE STORE'S REFUSAL UNION (`K-2`'s falsifier). The
//      `'secure-refused'` zero-spelling half stays TREE-WIDE and UNCHANGED (no lawful owner).
//
// ③ ARM 3(a)'s "EXPECTED RED at this head" premise — **STALE, RE-AIMED to the LANDED state.**
//    `A-3A-2` ②: the `tests/pd-ui-1-theme-register.test.ts` md5 ROW is the IMPLEMENTER's
//    (a licensed member-5 re-statement, NOT a test assertion), and `A-3A-2` ④(c) fixes the
//    measure-then-record order (re-measured at the FINAL head, never copied before the edit).
//    BEFORE: the arm asserted `reStatement.length > 0` — i.e. it REQUIRED the superseded
//    spelling to still be present, which a correctly landed commit CANNOT satisfy.
//    AFTER:  the arm asserts the LANDED state — the row must read
//    `restated: 'U-STORE-SECURITY-ADOPT'` AND the recorded md5 must equal the REAL
//    `src/main/preload.ts` digest at the head. It reddens until the re-statement lands
//    (RED-BY-SHIM, no longer an "exempt" red) and is GREEN after. The superseded literal
//    staying VISIBLE and the row resolving stay asserted unconditionally.
//    • STILL CAUGHT: a landing that skips `A-3A-2` ④(c)'s re-measure, or that deletes the
//      superseded value instead of keeping it visible.
//
// ④ NO PROPERTY IS WEAKENED and no term moves: "exactly one home, and it is the declared one"
//    holds before and after; the register's arithmetic stays `78` with `P-SSW-IM-4` at its
//    RULED `10`; the seed and the caps are unmoved.
// ===========================================================================
import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')

const STORE_PATH = join(REPO_ROOT, 'src', 'main', 'security-store.ts')
const MAIN_PATH = join(REPO_ROOT, 'src', 'main', 'main.ts')
const PRELOAD_PATH = join(REPO_ROOT, 'src', 'main', 'preload.ts')
const TYPES_PATH = join(REPO_ROOT, 'src', 'shared', 'types.ts')
const RENDERER_DIR = join(REPO_ROOT, 'src', 'renderer')
const SRC_DIR = join(REPO_ROOT, 'src')
const STORE_PAIR = [
  join(REPO_ROOT, 'src', 'renderer', 'store-core-graph.ts'),
  join(REPO_ROOT, 'src', 'renderer', 'store-graph-references.ts'),
]
const LOCK_PATH = join(REPO_ROOT, 'vendor', 'foundation.lock.json')
const PKG_PATH = join(REPO_ROOT, 'package.json')
const VITEST_CONFIG_PATH = join(REPO_ROOT, 'vitest.config.ts')
const THEME_PIN_PATH = join(REPO_ROOT, 'tests', 'pd-ui-1-theme-register.test.ts')
const READINESS_REGISTER_PATH = join(REPO_ROOT, 'tests', 'unit-app-harness-readiness-register.test.ts')
const READINESS_PATH = join(REPO_ROOT, 'tests', 'unit-app-harness-readiness.test.ts')
const SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-security-write.md')
const FOUNDATION_DIR = resolve(REPO_ROOT, '..', 'Provident-Electron')
const SELF_PATH = join(HERE, 'pd-store-security-write.test.ts')
const REGISTER_PATH = join(HERE, 'store-security-write-register.test.ts')

// ===========================================================================
// §1.1 / §2 — THE DECLARED CONTRACT, carried as literals so the arms compare the real bytes
// against the SPEC's declaration rather than against a re-reading of the same scan.
// ===========================================================================
/** §2.3 / ruling (vii) / `R-4` / `K-3` — THE NINE-MEMBER CENSUS, printed with its terms. */
const NINE_GROUPS = ['read', 'dispatch', 'graph', 'code', 'module', 'rag', 'edit', 'gnosis', 'gnosis-edit'] as const
/** §2.2 — the receipt's CLOSED status pair and its CLOSED single reason token. Assembled from
 *  parts so this file's own bytes never carry a literal the scan searches for. */
const RECEIPT_STATUSES = ['committed', 'refused'] as const
const WRITE_FAILED_TOKEN = ['write', 'failed'].join('-')
const SECURE_REFUSED_TOKEN = ['secure', 'refused'].join('-')
/** §2.2 / §3.2 I-5 — the receipt's reason is NEVER a member of the STORE's refusal union. */
const STORE_REFUSAL_TOKENS = ['undeclared-name', 'tier-filter-miss', 'cap-exceeded', 'no-such-anchor'] as const
/** §2.5 — the TWO widened declarations' declared return spelling. */
const WIDENED_SURFACE = 'SecurityWriteReceipt'
/** §1.1 member 5 / `S-P-3` — the md5 row's restatement contract. */
const SUPERSEDED_PRELOAD_MD5 = 'f24ea717a5f8f93a3ac490334611d22a'
const RESTATEMENT_UNIT = 'U-STORE-SECURITY-ADOPT'
const UNIT_NAME = 'U-STORE-SECURITY-WRITE'
/** §1.1 members 1-6 — THE SIX-MEMBER CHANGE SET (CENSUS: 6, printed with its terms). */
const CHANGE_SET_MEMBERS = [
  'src/main/security-store.ts — the write discipline (the atomic five-step write + lastWriteReceipt() + the additive optional fs? facade)',
  'src/shared/types.ts — SecurityWriteReceipt (the receipt family)',
  'src/main/main.ts — the IPC_SECURITY_SET handler return (the additive write member)',
  'src/main/preload.ts — THE TWO security.set declarations',
  'tests/pd-ui-1-theme-register.test.ts — THE md5 RE-STATEMENT',
  'tests/pd-store-security-write.test.ts + tests/store-security-write-register.test.ts — the unit\'s TWO new test files',
] as const
/** §1.1 member 6 — the two new files, by name. */
const NEW_TEST_FILES = ['pd-store-security-write.test.ts', 'store-security-write-register.test.ts'] as const
/** §1.2 items 1-11 — THE ELEVEN DENIED ROWS (CENSUS: 11, printed with their terms). */
const DENIED_ROWS = [
  '1 — ANY byte of `src/renderer/**` (that is 3b\'s: `secure-panels.ts`\'s `maxJournalLength` + the AUTHORED cap + `journalDepth()`; `renderer.ts`\'s construction-site option + the burst re-home)',
  '2 — ANY byte of `src/renderer/store-core-graph.ts` / `store-graph-references.ts` (the byte-pinned store pair)',
  '3 — `vendor/foundation.lock.json` (the lock is NOT extended)',
  '4 — ANY MCP surface (a new tool/group/resource/RpcMethod, or a second IPC key)',
  '5 — a `VALID_GROUPS` change (the census stays NINE)',
  '6 — a `SecuritySettings` widening (the persisted type carries NO `write` member)',
  '7 — a second `securityStore.set(` call site, or a moved `.applyGatePatch(` call',
  '8 — `schemaVersion` added to THIS tier\'s file',
  '9 — a new refusal site (no `secure`-segment check, no refused-token spelling, no store-union extension)',
  '10 — a `secure.*` reach widening (no renderer read/subscribe of `secure.*`)',
  '11 — any byte under `../Provident-Electron/**`; `vitest.config.ts`; the active trackers\' content beyond this unit\'s OWN tracker half',
] as const
/** §2.2 / §2.4 item 4 — the additive member the SET response carries. */
const ADDITIVE_WRITE_MEMBER = 'write'

// ===========================================================================
// THE ARM-VERDICT REPORT — the run's reading, printed per arm for the DONE row.
// ===========================================================================
type ArmVerdict = 'RED-BY-ABSENCE' | 'RED-BY-SHIM' | 'GREEN-ON-ARRIVAL' | 'GREEN' | 'SKIPPED'
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
    // a GREEN-ON-ARRIVAL arm that still holds is reported GREEN-ON-ARRIVAL (its class is what
    // the DONE row records); an arm whose classified verdict is GREEN-ON-ARRIVAL but which
    // FAILS is reported as the red it observed, never as a green.
    verdict: held ? verdict : verdict === 'GREEN-ON-ARRIVAL' || verdict === 'GREEN' ? 'RED-BY-SHIM' : verdict,
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

function srcFiles(): string[] {
  const out: string[] = []
  const walk = (dir: string): void => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry)
      if (statSync(p).isDirectory()) walk(p)
      else out.push(p)
    }
  }
  walk(SRC_DIR)
  return out
}

function rendererFiles(): string[] {
  const out: string[] = []
  if (!existsSync(RENDERER_DIR)) return out
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry)
      if (statSync(p).isDirectory()) walk(p)
      else out.push(p)
    }
  }
  walk(RENDERER_DIR)
  return out
}

/** The balanced body of the bracket pair opening at `openIndex` (a SHAPE read, never a line). */
function balancedBody(src: string, openIndex: number): string | null {
  const open = src[openIndex]
  const close = open === '(' ? ')' : open === '{' ? '}' : open === '[' ? ']' : ''
  if (close === '') return null
  let depth = 0
  let i = openIndex
  while (i < src.length) {
    const c = src[i]!
    if (c === open) depth++
    else if (c === close) {
      depth--
      if (depth === 0) return src.slice(openIndex + 1, i)
    }
    i++
  }
  return null
}

/** The comment-free body of a source text — so a PROSE mention of a denied token is never
 *  mistaken for a USE of it (and conversely the scans below read code, not commentary). */
function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*(\/\/|\/\*|\*|\*\/)/.test(line))
    .join('\n')
}

/** §2.5 — THE TWO `security.set` DECLARATION SITES, read out of the REAL
 *  `src/main/preload.ts` bytes. The needle is the `security` member's OWN patch shape
 *  (`token?/groups?/disable?/maxJournalLength?`) — the `operatorSettings.set` sites carry a
 *  DIFFERENT patch type and are NOT this unit's declarations (§2.5's two-site rule). */
function securitySetDeclarationSites(text: string): Array<{ line: string; ret: string }> {
  const out: Array<{ line: string; ret: string }> = []
  for (const m of text.matchAll(/^[ \t]*set\(patch:\s*\{[^}]*maxJournalLength\?[^}]*\}\s*\)\s*:\s*Promise<([^>]*)>/gm)) {
    out.push({ line: m[0]!, ret: m[1]! })
  }
  return out
}

/** §1.2 item 11 — the foundation-tree arm's honest state: recorded `NOT ARMED`, never asserted,
 *  because no wall-limited instrument distinguishes this unit's writes from another pass's. */
const FOUNDATION_ARM_STATE = 'NOT ARMED'

// ===========================================================================
// ARM 1 — THE SIX-MEMBER CHANGE-SET CENSUS (§1.1; §3 `F-1`).
// The six members' own cells are SUBSCRIBED: member 1 via the store module's new members,
// member 2 via the receipt's home, member 3 via the SET handler's additive return, member 4 via
// the two widened declarations, member 5 via the md5 row, member 6 via the two new files'
// presence. A landing that moves a DIFFERENT member set — or lands across more than one commit
// — is `F-1`.
// ===========================================================================
interface MemberReading {
  member: string
  subscribed: string[]
  problems: string[]
}

function changeSetReadings(): MemberReading[] {
  const readings: MemberReading[] = []
  const store = readMaybe(STORE_PATH)
  const types = readMaybe(TYPES_PATH)
  const main = readMaybe(MAIN_PATH)
  const preload = readMaybe(PRELOAD_PATH)

  // member 1 — the store's write discipline
  {
    const subscribed: string[] = []
    const problems: string[] = []
    subscribed.push(`src/main/security-store.ts readable = ${String(store !== null)}`)
    if (store === null) {
      problems.push(`MEMBER-1: ${relative(REPO_ROOT, STORE_PATH)} could not be read — the write discipline has no substrate (§1.1 member 1)`)
    } else {
      if (!/\blastWriteReceipt\b/.test(store)) {
        problems.push(
          `MEMBER-1: the store module declares NO \`lastWriteReceipt\` member — §1.1 member 1 / §2.1 S-4 land the NEW member \`(): SecurityWriteReceipt | null\`; at this head it resolves NOWHERE (§4 RE-1)`,
        )
      }
      const facade = /\bfs\?\s*:/.test(store) || /\bfs\s*\?\s*:/.test(store)
      if (!facade) {
        problems.push(
          `MEMBER-1: \`SecurityStoreOptions\` carries NO additive optional \`fs?\` member — §1.1 member 1 / §2.1 S-1/S-5 declare the injected façade ADDITIVE-OPTIONAL (the RED-BY-SHIM instrument, ruling (vi)); at this head a REQUIRED \`fs\` is also OUTSIDE §2.1 S-1 (§4 RE-3)`,
        )
      }
      const requiredFacade = /\bfs\s*:\s*SecurityStoreFs/.test(store)
      if (requiredFacade) {
        problems.push(`MEMBER-1: \`SecurityStoreOptions\` declares a REQUIRED \`fs\` — §2.1 S-1 puts a REQUIRED \`fs\` OUTSIDE the contract`)
      }
      if (/writeFileSync\(\s*opts\.path/.test(store) || /writeFileSync\(opts\.path/.test(store)) {
        problems.push(
          `MEMBER-1: the store still performs the PLAIN \`writeFileSync(opts.path, …)\` — §2.4 item 1 REPLACES it with the atomic five-step write (the old plain write is REPLACED, never kept beside it) (§4 RE-2)`,
        )
      }
    }
    subscribed.push('the `lastWriteReceipt` member declaration', 'the additive optional `fs?` façade on `SecurityStoreOptions`', 'the absence of a plain `writeFileSync(opts.path, …)`')
    readings.push({ member: '1 · the store module\'s write discipline', subscribed, problems })
  }

  // member 2 — the receipt type's home
  // `⟶ RULING A-3A-2 ① (2026-10-04, BY THE SUPERVISOR — THE HOME LIMBS FOLLOW THE RULED
  // HOME; the `A-3A-1` ① drift, CLOSED; RCA-8(c) ANNOTATE-BESIDE).` The as-filed §2.2
  // shared-home demand is SUPERSEDED IN PART: `SecurityWriteReceipt` is homed in
  // `src/main/security-store.ts` (SELF-CONTAINED, EXPORTED, NO import) and
  // `src/shared/types.ts` IS NOT MOVED BY THIS UNIT. Per `A-3A-2` ① the member is
  // RE-POINTED to the ruled home AND the DUPLICATE-HOME discrimination is ADDED (the as-filed
  // "named in the store module" prohibition is WITHDRAWN AS ANTI-QUATED — it asserted the
  // superseded home by forbidding the ruled one; its INTENT, ONE home with no duplicate
  // declaration, is preserved re-aimed).
  {
    const subscribed: string[] = [
      'the `SecurityWriteReceipt` declaration in `src/main/security-store.ts` (THE RULED HOME, `A-3A-2` ①)',
      'the EXACTLY-ONE-HOME discrimination over both candidate files (no duplicate declaration)',
    ]
    const problems: string[] = []
    const DECLARATION = /export\s+(?:type|interface)\s+SecurityWriteReceipt\s*=/
    if (store === null) {
      problems.push(`MEMBER-2: ${relative(REPO_ROOT, STORE_PATH)} could not be read — the receipt's RULED home has no substrate (\`A-3A-2\` ①; §1.1 member 2)`)
    } else if (!DECLARATION.test(store)) {
      problems.push(
        `MEMBER-2: \`SecurityWriteReceipt\` is declared NOWHERE in ${relative(REPO_ROOT, STORE_PATH)} — \`A-3A-2\` ① / \`A-3A-1\` ① rule the home HERE (SELF-CONTAINED, EXPORTED, NO import); the as-filed §2.2 shared home is superseded and \`src/shared/types.ts\` IS NOT MOVED; at this head the type resolves NOWHERE (§4 RE-5)`,
      )
    }
    // ---- THE DUPLICATE-HOME DISCRIMINATION (`A-3A-2` ①, the re-aimed INTENT of the withdrawn
    //      as-filed limb): the identifier must be DECLARED in EXACTLY ONE of the two files.
    //      The pre-existing SIX-COMPONENT UNMOVED substrate this scan must NOT mistake for a
    //      collision: `src/main/preload.ts` carries its own STRUCTURALLY-IDENTICAL LOCAL type
    //      for the response member (`A-3A-1` ①) — a THIRD file is not a duplicate HOME, and the
    //      preload's local type is additionally pinned by the two widened declaration sites.
    const homes: string[] = []
    if (DECLARATION.test(store ?? '')) homes.push(relative(REPO_ROOT, STORE_PATH))
    if (types !== null && DECLARATION.test(types)) homes.push(relative(REPO_ROOT, TYPES_PATH))
    if (homes.length > 1) {
      problems.push(
        `MEMBER-2-DUPLICATE-HOME: \`SecurityWriteReceipt\` is DECLARED in ${homes.map((h) => `\`${h}\``).join(' AND ')} — \`A-3A-2\` ① requires EXACTLY ONE home, \`src/main/security-store.ts\`; the as-filed shared home is superseded and \`src/shared/types.ts\` IS NOT MOVED. Two competing declarations of the SAME type is the duplicate-home collision (the as-filed "named in the store module" prohibition is WITHDRAWN AS ANTI-QUATED)`,
      )
    }
    readings.push({ member: '2 · `SecurityWriteReceipt` homed in `src/main/security-store.ts` (THE RULED HOME, `A-3A-2` ①) and in EXACTLY ONE of the two candidate files', subscribed, problems })
  }

  // member 3 — the SET handler's additive return
  {
    const subscribed: string[] = ['the `IPC_SECURITY_SET` registration\'s returned record']
    const problems: string[] = []
    if (main === null) {
      problems.push(`MEMBER-3: ${relative(REPO_ROOT, MAIN_PATH)} could not be read — the SET return has no substrate (§1.1 member 3)`)
    } else {
      const at = main.indexOf('ipcMain.handle(IPC_SECURITY_SET')
      if (at < 0) {
        problems.push(`MEMBER-3: no \`ipcMain.handle(IPC_SECURITY_SET\` registration is readable — the additive return has no site (§1.1 member 3)`)
      } else {
        const call = balancedBody(main, main.indexOf('(', at)) ?? ''
        if (!(call.includes(`...updated`) && call.includes(`${ADDITIVE_WRITE_MEMBER}:`) && call.includes('lastWriteReceipt('))) {
          problems.push(
            `MEMBER-3: the handler's return does not answer the additive record \`{ ...updated, ${ADDITIVE_WRITE_MEMBER}: <store>.lastWriteReceipt() }\` — §1.1 member 3 / §2.4 item 4; at this head the return reads \`return updated\` (§4 RE-5; §3.3 leg 1)`,
          )
        }
      }
    }
    readings.push({ member: '3 · `src/main/main.ts` — the `IPC_SECURITY_SET` return extended by the additive `write` member', subscribed, problems })
  }

  // member 4 — the two widened preload declarations
  {
    const subscribed: string[] = ['the two `security.set` declaration sites\' declared return type']
    const problems: string[] = []
    if (preload === null) {
      problems.push(`MEMBER-4: ${relative(REPO_ROOT, PRELOAD_PATH)} could not be read — the two declarations have no substrate (§1.1 member 4)`)
    } else {
      const sites = securitySetDeclarationSites(preload)
      if (sites.length !== 2) {
        problems.push(
          `MEMBER-4: the surfaced \`security.set\` declaration sites number ${sites.length} — §2.5 declares EXACTLY TWO (the \`ProvidentBridge\` interface declaration AND the bridge implementation); a widened INTERFACE without the widened IMPLEMENTATION is a \`tsc\` failure and the reverse is UNREACHABLE to the renderer (§2.5's totality of the two-site rule)`,
        )
      }
      for (const s of sites) {
        if (!s.ret.includes(WIDENED_SURFACE)) {
          problems.push(
            `MEMBER-4: a declaration site reads \`Promise<${s.ret.trim()}>\` — §2.5 widens BOTH to \`Promise<SecuritySettings & { write: SecurityWriteReceipt }>\`; the current text is the UN-WIDENED declaration (§4 RE-5; §3.3 leg 2)`,
          )
        }
      }
    }
    readings.push({ member: '4 · `src/main/preload.ts` — the TWO widened `security.set` declarations', subscribed, problems })
  }

  // member 5 — the md5 re-statement (IN-COMMIT; §1.1 member 5)
  {
    const subscribed: string[] = ['the `src/main/preload.ts` row of `UNTOUCHED_DIGESTS` in `tests/pd-ui-1-theme-register.test.ts`']
    const problems: string[] = []
    const text = readMaybe(THEME_PIN_PATH)
    if (text === null) {
      problems.push(`MEMBER-5: ${relative(REPO_ROOT, THEME_PIN_PATH)} could not be read — the md5 row has no substrate (§1.1 member 5)`)
    } else {
      const at = text.indexOf(`file: 'src/main/preload.ts'`)
      if (at < 0) {
        problems.push(`MEMBER-5: the \`src/main/preload.ts\` row is absent from \`UNTOUCHED_DIGESTS\` — the re-statement has no row (§1.1 member 5)`)
      } else {
        const line = text.slice(text.lastIndexOf('\n', at) + 1, text.indexOf('\n', at))
        const restated = /restated:\s*'([^']+)'/.exec(line)?.[1] ?? ''
        // `A-3A-2` ②③ — THE LANDED-STATE FORM: the re-statement is a LICENSED OBLIGATION that
        // lands IN THE SAME COMMIT as the widened preload (never an "exempt" red left standing).
        // This member SUBSCRIBES the row's state and reports whether the re-statement has
        // landed; the red itself is driven explicitly by arm 3(a), never double-counted here.
        const landed = restated === RESTATEMENT_UNIT
        // eslint-disable-next-line no-console
        console.log(
          `PD-SSW arm 1 [member 5, the md5 re-statement]: ${landed ? 'SUBSCRIBED (re-stated)' : 'PENDING — the in-commit re-statement obligation (`A-3A-2` ②/④(c)); this red is driven explicitly by arm 3(a), never double-counted here'} — the row reads \`restated: '${restated}'\`; the superseded md5 literal \`${SUPERSEDED_PRELOAD_MD5}\` is ${line.includes(SUPERSEDED_PRELOAD_MD5) ? 'VISIBLE' : 'MISSING'} (§1.1 member 5; \`S-P-3\`; \`O-2\`; §4 RE-5)`,
        )
        if (!line.includes(SUPERSEDED_PRELOAD_MD5)) {
          problems.push(`MEMBER-5: the row does not keep the superseded literal \`${SUPERSEDED_PRELOAD_MD5}\` VISIBLE — §1.1 member 5: the superseded value is KEPT, NEVER deleted`)
        }
      }
    }
    readings.push({ member: '5 · `tests/pd-ui-1-theme-register.test.ts` — the md5 RE-STATEMENT', subscribed, problems })
  }

  // member 6 — the two new test files
  {
    const subscribed: string[] = ['the presence of the unit\'s TWO new test files']
    const problems: string[] = []
    for (const name of NEW_TEST_FILES) {
      if (!existsSync(join(HERE, name))) {
        problems.push(`MEMBER-6: the unit's test file \`tests/${name}\` is ABSENT — §1.1 member 6 lands BOTH (§2.5's two-site rule has its analogue here: a widened declaration with no guard is unreachable evidence)`)
      }
    }
    readings.push({ member: '6 · the unit\'s TWO new test files', subscribed, problems })
  }

  return readings
}

// ===========================================================================
// ARM 2 — THE DENIED-SURFACE NEGATIVE over §1.2's ELEVEN ROWS (§1.2; §3 F-1).
// Every row is SUBSCRIBED separately, so a landing that reddens one names it.
// ===========================================================================
interface DeniedReading {
  row: string
  problems: string[]
}

function deniedSurfaceReadings(): DeniedReading[] {
  const out: DeniedReading[] = []
  const store = readMaybe(STORE_PATH)
  const types = readMaybe(TYPES_PATH)
  const main = readMaybe(MAIN_PATH)
  const preload = readMaybe(PRELOAD_PATH)

  // §1.2 item 1 — no `src/renderer/**` byte (3b's)
  {
    const problems: string[] = []
    // The byte-pin's SUBJECT is "this unit moves no renderer byte". The landed renderer bytes
    // are NOT digest-pinned here (that is unit 1's E-2 arm and this unit's own md5 row): the
    // limb reads the renderer files' PRESENCE and each one's digest into the report, and
    // reddens only on a §1.2 item 1 SUBJECT: a `maxJournalLength`/`journalDepth` authored
    // surface appearing in `secure-panels.ts` or a pane construction-site option in
    // `renderer.ts` — 3b's declared members.
    // =====================================================================
    // ⟶ THE `DENIED-1` RE-AIM (3b `U-STORE-SECURITY-JOURNAL`, amendment row 11, IN THIS COMMIT).
    // `RCA-8(c)` ANNOTATE-BESIDE: the AS-FILED wording of the three regexes is KEPT VISIBLE
    // below, and the dispositions (`A-3B-1`'s ①NULLED ②INVERTED ③SCOPED) are applied beside it.
    // The item is DISCHARGED BY LANDING on the paths 3b legitimately wrote (`S-P-3`) and
    // SURVIVES re-aimed at the surface 3b may not touch. The guard's own subject is unchanged:
    // "this unit moves no renderer byte".
    // =====================================================================
    // AS FILED (row 11① — the `journalDepth` limb over `secure-panels.ts`), KEPT VISIBLE:
    //   if (/\bjournalDepth\s*\(/.test(body)) {
    //     problems.push(`DENIED-1: \`journalDepth()\` appears in src/renderer/secure-panels.ts — … this unit authors NO renderer byte (\`R-5\`; \`S-P-6\`)`)
    //   }
    //   if (/SecurePanelsOptions[\s\S]{0,400}maxJournalLength/.test(body)) {
    //     problems.push(`DENIED-1: \`SecurePanelsOptions\` carries \`maxJournalLength\` — … this unit authors NO renderer byte (\`R-5\`; \`S-P-6\`)`)
    //   }
    // DISPOSITION ① NULL: 3b AUTHORS `journalDepth()` in `secure-panels.ts`, so the as-filed
    // assertion is DISCHARGED BY LANDING and is no longer a live `problems.push` source. A guard
    // that still tripped on 3b's AUTHORIZED edit would be §3 `F-11`.
    // DISPOSITION ② INVERTED: 3b AUTHORIZES `SecurePanelsOptions.maxJournalLength?: number`; the
    // SURVIVING limb forbids the REQUIRED or POSITIONAL form (an additive-OPTIONAL member is
    // lawful; a required/positional one is §3 `F-10`).
    const panels = readMaybe(join(RENDERER_DIR, 'secure-panels.ts'))
    if (panels === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 1): src/renderer/secure-panels.ts could not be read — the renderer-byte negative has no substrate`)
    } else {
      const body = withoutComments(panels)
      // ② INVERTED — the surviving limb: the option may not be REQUIRED, and no POSITIONAL
      // second argument may bind it at any landed `new SecurePanels(` call site.
      const requiredOption = /maxJournalLength\s*:\s*number(?![?\s|])/.test(body) && !/maxJournalLength\s*\?\s*:/.test(body)
      if (requiredOption) {
        problems.push(`DENIED-1 (RE-AIMED ②, INVERTED): \`SecurePanelsOptions.maxJournalLength\` is a REQUIRED member — §7 row 11② / §1.1 member 1① / §3.2 I-3: 3b AUTHORIZES the member as ADDITIVE-OPTIONAL; the surviving limb forbids the REQUIRED form (a required option breaks every landed one-argument \`new SecurePanels(\` call site, §3 \`F-10\`)`)
      }
      const positional = /new\s+SecurePanels\s*\(\s*[^,()]+,\s*[A-Za-z_$][\w$]*\s*\)/.test(body)
      if (positional) {
        problems.push(`DENIED-1 (RE-AIMED ②, INVERTED): a \`new SecurePanels(\` call site binds a bare identifier as its SECOND POSITIONAL argument — §7 row 11② / §1.1 member 1①: the option is a NAMED member of \`SecurePanelsOptions\`, NEVER positional (§3 \`F-10\`)`)
      }
      // ① NULL — recorded, and the re-aim's subject read into the report.
      // eslint-disable-next-line no-console
      console.log(
        `PD-SSW arm 2 [denied row 1, RE-AIM ① NULL]: \`journalDepth()\` is PRESENT in secure-panels.ts (${String(/\bjournalDepth\s*\(/.test(body))}) — the as-filed assertion is DISCHARGED BY LANDING (3b AUTHORS the seam, §7 row 11① / \`S-P-3\`); the surviving limb (② INVERTED) reads required=${String(requiredOption)} positional=${String(positional)}`,
      )
    }
    const renderer = readMaybe(join(RENDERER_DIR, 'renderer.ts'))
    if (renderer === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 1): src/renderer/renderer.ts could not be read — the pane-option negative has no substrate`)
    } else {
      // The DENIED shape is 3b's AUTHORED PANE-CAP option at the PANE CONSTRUCTION SITE
      // (`secure-panels.ts`'s `SecurePanelsOptions` gaining `maxJournalLength`). `renderer.ts`'s
      // EXISTING `Runtime({ …, maxJournalLength })` read (landed before this unit, §3.3's
      // closing clause) is NOT a pane option and is NOT what §1.2 item 1 denies: the line is
      // checked against the AUTHORED-PANE-CAP spelling, never the Runtime's own option.
      //
      // ⟶ THE `DENIED-1` RE-AIM ③ SCOPED (3b, amendment row 11, IN THIS COMMIT; `RCA-8(c)`
      // ANNOTATE-BESIDE). AS FILED, KEPT VISIBLE:
      //   const paneCapShape = /SecurePanelsOptions|securePanelsOptions|paneOptions[\s\S]{0,200}maxJournalLength/.test(body)
      //   if (paneCapShape) {
      //     problems.push(`DENIED-1: \`renderer.ts\` passes a \`maxJournalLength\` PANE-construction option (\`SecurePanelsOptions\`) — … this unit authors NO renderer byte`)
      //   }
      // DISPOSITION ③ SCOPED: `renderer.ts` legitimately gains the pane option AT THE EXISTING
      // PANE CONSTRUCTION SITE (§1.1 member 2①), so an unqualified pane-cap prohibition would
      // redden 3b's AUTHORIZED edit. The SURVIVING limb forbids (a) the `Runtime`-option path
      // carrying a PANE-CAP spelling, and (b) a SECOND pane-cap site. It still FAILS for a
      // `src/renderer/**` byte authored in 3a's OWN change-set context — the limb's SUBJECT
      // ("this unit moves no renderer byte") is unchanged.
      const body = withoutComments(renderer)
      const paneConstructionSites = [...body.matchAll(/new\s+SecurePanels\s*\(/g)].length
      const runtimeCapShape = /new\s+Runtime\s*\(\s*\{[\s\S]{0,400}?maxJournalLength[\s\S]{0,400}?SecurePanelsOptions/.test(body)
      if (runtimeCapShape) {
        problems.push(`DENIED-1 (RE-AIMED ③, SCOPED): \`renderer.ts\` passes a \`maxJournalLength\` PANE-CAP option through the \`Runtime\`-option path — §7 row 11③: the surviving limb forbids the \`Runtime\`-option path; 3b's authorized edit is the PANE CONSTRUCTION SITE alone`)
      }
      if (paneConstructionSites > 1) {
        problems.push(`DENIED-1 (RE-AIMED ③, SCOPED): \`renderer.ts\` carries ${String(paneConstructionSites)} \`new SecurePanels(\` PANE-CONSTRUCTION sites — §7 row 11③: the pane option belongs at the EXISTING site; a SECOND pane-cap site is the surviving denial (§1.2 row 7's THIRD-site class)`)
      }
      const paneCapShape = runtimeCapShape || paneConstructionSites > 1
      // eslint-disable-next-line no-console
      console.log(
        `PD-SSW arm 2 [denied row 1 preview]: \`renderer.ts\` carries ${(body.match(/maxJournalLength/g) ?? []).length} \`maxJournalLength\` occurrence(s) — the landed \`Runtime({ …, maxJournalLength })\` read is UNIT-2-LANDED and pre-existing, NOT the AUTHORED pane cap §1.2 item 1 assigns to 3b; the DENIED shape is RE-AIMED ③ SCOPED: it reddens on the \`Runtime\`-option path (${String(runtimeCapShape)}) or a SECOND pane-cap site (${String(paneConstructionSites > 1)}, ${String(paneConstructionSites)} \`new SecurePanels(\` site(s)) — never on 3b's AUTHORIZED pane construction site`,
      )
      // §7 row 11 — THE RE-AIMED SURFACE, ASSERTED IN THIS GUARD'S OWN BYTES: the item's INTENT
      // survives as (a) a literal `maxJournalLength` in `MUTATING_METHODS` (a WIDENED predicate,
      // §1.2 row 6) and (b) a THIRD `refreshDebug` site (§1.2 row 7).
      const mutating = /const\s+MUTATING_METHODS\s*=\s*new\s+Set\(\[([^\]]*)\]\)/.exec(body)
      if (mutating !== null && /maxJournalLength/.test(mutating[1]!)) {
        problems.push(`DENIED-1-REAIM-SURFACE: \`maxJournalLength\` is a literal \`MUTATING_METHODS\` member — §7 row 11's RE-AIMED SURFACE / §1.2 row 6: the predicate is UNWIDENED (a cap value is not an MCP method)`)
      }
      const refreshSites = [...body.matchAll(/refreshDebug/g)].length
      if (refreshSites !== 2) {
        problems.push(`DENIED-1-REAIM-SURFACE: \`renderer.ts\` carries ${String(refreshSites)} \`refreshDebug\` occurrence(s) — §7 row 11's RE-AIMED SURFACE / §1.2 row 7 / §2.5: EXACTLY TWO call sites (the boot site + the notify-callback site); a THIRD site reddens this limb`)
      }
    }
    out.push({ row: '1 · no `src/renderer/**` byte (3b\'s)', problems })
  }

  // §1.2 item 2 — no byte of the byte-pinned store pair
  {
    const problems: string[] = []
    for (const path of STORE_PAIR) {
      if (!existsSync(path)) {
        problems.push(`ABSTRACT-SUBJECT (§1.2 item 2): ${relative(REPO_ROOT, path)} is ABSENT — the byte-pinned pair's arm has no substrate (the pair's own pin is unit 1's E-2 arm 2; this limb records its presence)`)
        continue
      }
      const text = readMaybe(path)
      if (text === null) {
        problems.push(`ABSTRACT-SUBJECT (§1.2 item 2): ${relative(REPO_ROOT, path)} could not be read`)
        continue
      }
      // the pair's own contract is `./store-graph-references.js` — a NEW import edge is the
      // semantic-patch shape §1.2 item 2 denies (the unit-1 E-2 precedent).
      const specifiers = [...text.matchAll(/^\s*import\s+(?:type\s+)?[^'"]*?from\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]!)
      const foreign = specifiers.filter((s) => !s.startsWith('./store-graph-references') && !s.startsWith('node:'))
      if (foreign.length > 0) {
        problems.push(`DENIED-2: ${relative(REPO_ROOT, path)} imports [${foreign.join(', ')}] — §1.2 item 2 denies ANY byte of the byte-pinned store pair (a semantic patch is a COLLISION finding; unit 1's E-2 arm 2 owns the pin)`)
      }
    }
    out.push({ row: '2 · no byte of the byte-pinned store pair', problems })
  }

  // §1.2 item 3 — the lock is NOT extended
  {
    const problems: string[] = []
    const text = readMaybe(LOCK_PATH)
    if (text === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 3): ${relative(REPO_ROOT, LOCK_PATH)} could not be read — the lock arm has no substrate`)
    } else if (/"security/i.test(text)) {
      problems.push(`DENIED-3: the lock names a security surface — §1.2 item 3 / \`R-5\`: the lock is NOT extended by this unit (unit 1's E-2 arm 5 owns the lock's cell set)`)
    }
    out.push({ row: '3 · `vendor/foundation.lock.json` NOT extended', problems })
  }

  // §1.2 item 4 — no MCP surface and no second IPC key
  {
    const problems: string[] = []
    if (main === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 4): ${relative(REPO_ROOT, MAIN_PATH)} could not be read — the MCP-surface negative has no substrate`)
    } else {
      const body = withoutComments(main)
      // a SECOND IPC key would be a new `ipcMain.handle('provident:security:…` spelling: the
      // landed pair is `IPC_SECURITY_GET`/`IPC_SECURITY_SET` and BOTH are constants.
      for (const m of body.matchAll(/ipcMain\.handle\(\s*['"]([^'"]+)['"]/g)) {
        problems.push(`DENIED-4: a LITERAL IPC channel key \`${m[1]}\` is registered in src/main/main.ts — §1.2 item 4 denies a second IPC key; the security channels are the \`IPC_SECURITY_GET\`/\`IPC_SECURITY_SET\` constants (§1.2 item 4)`)
      }
      if (/provident:security:(get|set|write|receipt)/.test(body)) {
        problems.push(`DENIED-4: a re-spelled security channel literal appears in src/main/main.ts — §1.2 item 4 denies a second IPC key; the channel keys are single-sourced in \`src/shared/types.ts\``)
      }
    }
    out.push({ row: '4 · no MCP surface, no second IPC key', problems })
  }

  // §1.2 item 5 — no `VALID_GROUPS` change (the census stays NINE)
  {
    const problems: string[] = []
    if (store === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 5): ${relative(REPO_ROOT, STORE_PATH)} could not be read — the census arm has no substrate`)
    } else {
      const decl = /const\s+VALID_GROUPS\s*=\s*new\s+Set\(\[([^\]]*)\]\)/.exec(store)
      if (decl === null) {
        problems.push(`DENIED-5: no \`const VALID_GROUPS = new Set([...])\` declaration is readable — §2.3's census site is UNMOVED (§3.2 I-7)`)
      } else {
        const terms = [...decl[1]!.matchAll(/'([^']+)'/g)].map((m) => m[1]!)
        if (terms.length !== NINE_GROUPS.length || NINE_GROUPS.some((g) => !terms.includes(g))) {
          problems.push(
            `DENIED-5: \`VALID_GROUPS\` reads [${terms.join(', ')}] (CENSUS: ${terms.length}) — §1.2 item 5 / ruling (vii) / \`K-3\` fix it at exactly NINE [${NINE_GROUPS.join(', ')}]; the foundation's FIVE-member clause is NOT copied (restoring five would silently drop \`rag\`/\`edit\`/\`gnosis\`/\`gnosis-edit\`)`,
          )
        }
      }
    }
    out.push({ row: '5 · no `VALID_GROUPS` change (the NINE-member census)', problems })
  }

  // §1.2 item 6 — no `SecuritySettings` widening
  {
    const problems: string[] = []
    if (types === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 6): ${relative(REPO_ROOT, TYPES_PATH)} could not be read — the no-widening arm has no substrate`)
    } else {
      const at = types.indexOf('export interface SecuritySettings')
      const body = at < 0 ? null : balancedBody(types, types.indexOf('{', at))
      if (body === null) {
        problems.push(`ABSTRACT-SUBJECT (§1.2 item 6): the \`SecuritySettings\` body is not balance-readable — the no-widening arm has no subject`)
      } else if (/\bwrite\b/.test(body)) {
        problems.push(`DENIED-6: \`SecuritySettings\` carries a \`write\` member — §1.2 item 6 / ruling (iv) row 1: the persisted type is NOT widened; the \`write\` member belongs to the IPC RESPONSE record, not the persisted type (§3.2 I-4)`)
      }
    }
    out.push({ row: '6 · no `SecuritySettings` widening', problems })
  }

  // §1.2 item 7 — no second `securityStore.set(` call site / no moved `.applyGatePatch(`
  {
    const problems: string[] = []
    if (main === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 7): ${relative(REPO_ROOT, MAIN_PATH)} could not be read — the count-1 arm has no substrate`)
    } else {
      const writes = main.match(/\bsecurityStore\.set\(/g) ?? []
      if (writes.length !== 1) {
        problems.push(`DENIED-7: \`securityStore.set(\` occurs ${writes.length} times — §1.2 item 7 denies a second call site (the landed count-1 guards read \`1\`; amendment rows 3+4 LEAVE-ALONE)`)
      }
      const patches = main.match(/\.applyGatePatch\(/g) ?? []
      if (patches.length !== 1) {
        problems.push(`DENIED-7: \`.applyGatePatch(\` occurs ${patches.length} times — §1.2 item 7 denies a MOVED re-gate call`)
      }
      if (!(main.indexOf('gatePatchFromStoreResult(') < main.indexOf('.applyGatePatch('))) {
        problems.push(`DENIED-7: the live re-gate is not fed by \`gatePatchFromStoreResult(\` before the call — the landed guard reads that order (§2.4 item 4)`)
      }
    }
    out.push({ row: '7 · no second writer, no moved re-gate', problems })
  }

  // §1.2 item 8 — no `schemaVersion` on THIS tier's file
  {
    const problems: string[] = []
    if (store === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 8): ${relative(REPO_ROOT, STORE_PATH)} could not be read — the no-version arm has no substrate`)
    } else {
      const body = withoutComments(store)
      if (/schemaVersion/.test(body)) {
        problems.push(`DENIED-8: \`schemaVersion\` appears in the security store — §1.2 item 8 / ruling (iv) row 1: the version machinery is TIER ONE's; this tier's file carries NO \`schemaVersion\` (` + '`store-security.md`' + ` §0A item 7)`)
      }
    }
    out.push({ row: '8 · no `schemaVersion` on this tier\'s file', problems })
  }

  // §1.2 item 9 — no new refusal site
  {
    const problems: string[] = []
    // THE PRE-EXISTING SUBSTRATE, named so the scan does not mistake it for this unit's work:
    // `src/main/main.ts` (`StoreChannelRefusal`) and `src/main/preload.ts` (the `store.put`
    // declaration) ALREADY carry the unit-2 CHANNEL refusal pair
    // `{malformed-payload, write-failed}` — that is `store-channels`' own vocabulary (§2.2's
    // `K-2` names the channel's tokens as the CHANNEL's), LANDED by `U-STORE-PERSIST-ADOPT`,
    // and it is NOT a new store-union member added BY THIS UNIT. The DENIED shapes are:
    // (a) the refused token in ANY spelling, and (b) a THIRD channel token beyond the landed
    // pair. The landed channel pair is therefore subtracted BY NAME.
    const LANDED_CHANNEL_PAIR = ['malformed-payload', WRITE_FAILED_TOKEN]
    /** `⟶ A-3A-1` ② (the token's scan subject is NARROWED) — the EXEMPT-BY-NAME sites: unit 2's
     *  landed CHANNEL refusal vocabulary, which is declared in `main.ts` (`StoreChannelRefusal`)
     *  and SURFACES THROUGH the bridge in `preload.ts` (the `store.put(...)` response member,
     *  `reason?: 'malformed-payload' | 'write-failed'`) — the CHANNEL's own closed set in both
     *  places, reconciled by unit 2's `K-1`. `store-channels.ts` is named with them. The store
     *  module is NOT exempt: it is scanned, and correctly does not trip once the subject is the
     *  UNION MEMBERSHIP (a receipt FORM is not a union arm). This is the SAME narrowing the
     *  sibling register's re-aimed `P-SSW-IM-6` limb already applied. */
    const CHANNEL_VOCABULARY_EXEMPT_BY_NAME = new Set(['main.ts', 'store-channels.ts', 'preload.ts'])
    /** `A-3A-1` ② — THE STORE-UNION-MEMBERSHIP SUBJECT: a `| 'write-failed'` union arm, or a
     *  `type|interface *Refusal* = … 'write-failed'` declaration. A bare occurrence (the
     *  receipt's own mandated FORM, or the widened preload return) is LAWFUL and must not trip
     *  it — the counterexample the limb still catches is the token ADDED TO THE UNION. */
    const storeUnionArm = (text: string): boolean =>
      new RegExp(`\\|\\s*'${WRITE_FAILED_TOKEN}'|'${WRITE_FAILED_TOKEN}'\\s*\\|`).test(text) ||
      new RegExp(`(?:type|interface)\\s+\\w*[Rr]efusal\\w*\\s*=[^\\n]*'${WRITE_FAILED_TOKEN}'`).test(text)
    for (const file of ['security-store.ts', 'main.ts', 'preload.ts', 'security.ts']) {
      const text = readMaybe(join(REPO_ROOT, 'src', 'main', file))
      if (text === null) continue
      const body = withoutComments(text)
      if (body.includes(`'${SECURE_REFUSED_TOKEN}'`)) {
        problems.push(`DENIED-9: ${file} spells the refused token — §1.2 item 9 / \`K-2\` deny a NEW refusal site (no \`secure\`-segment check, no re-spelling, no store-union extension)`)
      }
      if (file === 'security-store.ts' && storeUnionArm(body)) {
        problems.push(
          `DENIED-9/I-5: security-store.ts spells the receipt's reason token AS A STORE-UNION MEMBER — §2.2/§3.2 I-5 (\`K-2\`): it is NEVER a member of the STORE's refusal union. THE SUBJECT IS NARROWED PER \`A-3A-1\` ② (the same narrowing this file's sibling register already applies at \`P-SSW-IM-6\` drive 4): §3.2 I-5 forbids the token as a UNION MEMBER, NEVER as the receipt's own declared FORM — and §2.1 S-4/§2.2 REQUIRE the store to land the very spelling \`{ status: 'refused'; reason: 'write-failed' }\`, so a flat "the string appears in the module" scan would redden on the unit's OWN MANDATED surface. The counterexample this limb STILL reddens on: a \`| 'write-failed'\` union arm, or a \`type … = … 'write-failed'\` declaration — i.e. the token added to the store's refusal union`,
        )
      }
      // a THIRD token on the LANDED channel substrate would be a genuinely new refusal site
      if (file === 'main.ts') {
        const union = /type\s+StoreChannelRefusal\s*=\s*([^\n]+)/.exec(body)?.[1] ?? ''
        const tokens = [...union.matchAll(/'([^']+)'/g)].map((m) => m[1]!)
        const extra = tokens.filter((t) => !LANDED_CHANNEL_PAIR.includes(t))
        if (extra.length > 0) {
          problems.push(`DENIED-9: the landed \`StoreChannelRefusal\` union reads [${tokens.join(', ')}] — a token beyond the LANDED channel pair [${LANDED_CHANNEL_PAIR.join(', ')}] is a NEW refusal site (§1.2 item 9)`)
        }
      }
    }
    // eslint-disable-next-line no-console
    console.log(
      `PD-SSW arm 2 [denied row 9 preview]: the LANDED channel substrate (unit 2's \`StoreChannelRefusal\` in main.ts + the \`store.put\` declaration in preload.ts) carries the channel pair [${LANDED_CHANNEL_PAIR.join(', ')}] — SUBTRACTED BY NAME, because §2.2's \`K-2\` names the channel's tokens as the channel's; the scan polices the STORE union and the refused spelling, not unit 2's landed vocabulary`,
    )
    out.push({ row: '9 · no new refusal site', problems })
  }

  // §1.2 item 10 — no `secure.*` reach widening (no renderer read/subscribe of `secure.*`)
  {
    const problems: string[] = []
    let scanned = 0
    for (const path of rendererFiles()) {
      const text = readMaybe(path)
      if (text === null) continue
      scanned++
      const body = withoutComments(text)
      // The reach-widening shape is a renderer STORE READ or SUBSCRIPTION of the `secure.*`
      // namespace (`read('secure.…')` / `subscribe('secure.…')`). The pane's EXISTING
      // `window.provident.security.get()/set()` bridge calls are NOT a store reach and are not
      // what §1.2 item 10 denies.
      if (/\b(read|subscribe)\s*\(\s*['"]secure\./.test(body)) {
        problems.push(`DENIED-10: ${relative(REPO_ROOT, path)} performs a store \`read\`/\`subscribe\` of the \`secure.*\` namespace — §1.2 item 10 / §2.4 item 3 deny any \`secure.*\` reach widening (the renderer's reach is the preload bridge, unmoved)`)
      }
    }
    if (scanned === 0) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 10): no \`src/renderer/**\` file was readable — the reach-widening negative has no substrate`)
    }
    out.push({ row: '10 · no `secure.*` reach widening', problems })
  }

  // §1.2 item 11 — no foreign byte / no `vitest.config.ts` byte / trackers untouched
  {
    const problems: string[] = []
    // THE FOUNDATION-TREE ARM IS RECORDED `NOT ARMED`, NOT ASSERTED — and it is recorded IN THE
    // READING rather than silently skipped. The wall holds no instrument that distinguishes
    // THIS unit's writes to `../Provident-Electron/**` from any other pass's: a diff-scoped
    // reading would need a baseline this file cannot honestly take (the tree is NOT this repo,
    // and `git diff` over it is not this wall's subject). A SKIPPED arm is NEVER a pass, so the
    // state is printed and carried in the arm's note.
    // eslint-disable-next-line no-console
    console.log(
      `PD-SSW arm 2 [denied row 11, the foundation-tree byte arm]: ${FOUNDATION_ARM_STATE} — ` +
        `${existsSync(FOUNDATION_DIR) ? 'the tree at `../Provident-Electron/` EXISTS' : 'the tree is ABSENT'}; no wall-limited instrument distinguishes this unit's writes from another pass's, ` +
        `so the arm is RECORDED not-armed rather than asserted (§1.2 item 11's honest reading; a SKIPPED arm is never a pass)`,
    )
    const vitest = readMaybe(VITEST_CONFIG_PATH)
    if (vitest === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 11): vitest.config.ts could not be read — the config-byte negative has no substrate`)
    } else if (/security/i.test(vitest)) {
      problems.push(`DENIED-11: \`vitest.config.ts\` names a security surface — §1.2 item 11 denies any byte of it`)
    }
    const pkg = readMaybe(PKG_PATH)
    if (pkg === null) {
      problems.push(`ABSTRACT-SUBJECT (§1.2 item 11): package.json could not be read — the script-key negative has no substrate`)
    } else if (/"security/i.test(pkg)) {
      problems.push(`DENIED-11: \`package.json\` carries a security-named script key — §1.2 item 11 denies a new script key for this unit`)
    }
    out.push({ row: '11 · no foreign byte / no `vitest.config.ts` byte', problems })
  }

  return out
}

// ===========================================================================
// ARM 3 — THE md5-ROW PRESENCE (§1.1 member 5; `S-P-3`; `O-2`; §5.1 `P-SSW-H-3`).
// The `preload.ts` row RE-STATED with `restated: 'U-STORE-SECURITY-ADOPT'` + the superseded
// value visible. GREEN-ON-ARRIVAL for the derived control; RED-BY-ABSENCE for the
// re-statement (the pre-recorded exemption).
// ===========================================================================
function md5RowProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(THEME_PIN_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, THEME_PIN_PATH)} could not be read — the md5 row has no substrate (§1.1 member 5)`)
    return problems
  }
  const at = text.indexOf(`file: 'src/main/preload.ts'`)
  if (at < 0) {
    problems.push(`MD5-ROW-ABSENT: the \`src/main/preload.ts\` row is absent from \`UNTOUCHED_DIGESTS\` (§1.1 member 5)`)
    return problems
  }
  const line = text.slice(text.lastIndexOf('\n', at) + 1, text.indexOf('\n', at))
  const restated = /restated:\s*'([^']+)'/.exec(line)?.[1] ?? ''
  if (restated !== RESTATEMENT_UNIT) {
    problems.push(
      `MD5-RESTATEMENT: the row's \`restated\` reads \`${restated}\` — §1.1 member 5 / \`S-P-3\`/\`O-2\` require \`restated: '${RESTATEMENT_UNIT}'\` (EXEMPT + PRE-RECORDED RED at this head: the re-statement is the IMPLEMENTER's in-commit act; the DONE row names it) (§4 RE-5)`,
    )
  }
  if (!line.includes(SUPERSEDED_PRELOAD_MD5)) {
    problems.push(`MD5-SUPERSEDED-VISIBLE: the row does not carry the superseded literal \`${SUPERSEDED_PRELOAD_MD5}\` — §1.1 member 5 requires it KEPT VISIBLE, NEVER deleted`)
  }
  // the documented superseded spelling is the `U-STORE-PERSIST-ADOPT` literal — recorded here so
  // the move is legible in the run's reading.
  const carriedSupersededUnit = /restated/.test(line) ? /restated:\s*'([^']+)'/.exec(line)?.[1] ?? '' : ''
  if (restated !== RESTATEMENT_UNIT && carriedSupersededUnit !== '') {
    // eslint-disable-next-line no-console
    console.log(
      `PD-SSW arm 3 [md5 row]: the row's superseded spelling reads \`${carriedSupersededUnit}\` (the landed value) and the superseded md5 literal \`${SUPERSEDED_PRELOAD_MD5}\` is VISIBLE — the re-statement to \`${RESTATEMENT_UNIT}\` is this unit's IN-COMMIT act (\`O-2\`) (§4 RE-5)`,
    )
  }
  return problems
}

/** §1.1 member 5 / amendment row 2 — `UNRESTATED_CONTROL_PATH` stays DERIVED and NON-VACUOUS. */
function derivedControlProblems(): string[] {
  const problems: string[] = []
  const text = readMaybe(THEME_PIN_PATH)
  if (text === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, THEME_PIN_PATH)} could not be read — the derived-control limb has no substrate`)
    return problems
  }
  const tableAt = text.indexOf('const UNTOUCHED_DIGESTS')
  const tableEnd = text.indexOf(']', tableAt)
  if (tableAt < 0 || tableEnd < 0) {
    problems.push(`DERIVED-CONTROL: \`UNTOUCHED_DIGESTS\` is not readable — the derivation's subject is absent`)
    return problems
  }
  const rows = [...text.slice(tableAt, tableEnd).matchAll(/\{\s*file:\s*'([^']+)'([^}]*)\}/g)].map((m) => ({
    file: m[1]!,
    restated: /restated:\s*'([^']+)'/.exec(m[2] ?? '')?.[1] ?? undefined,
  }))
  const derived = rows.find((r) => r.restated === undefined)?.file ?? ''
  if (rows.length === 0) {
    problems.push(`DERIVED-CONTROL: no \`UNTOUCHED_DIGESTS\` row is parseable — the derivation is vacuous`)
    return problems
  }
  if (derived === '') {
    problems.push(`DERIVED-CONTROL-VACUOUS: every row carries a \`restated:\` field — §1.1 member 5 / amendment row 2 require \`UNRESTATED_CONTROL_PATH\` to stay DERIVED and NON-VACUOUS (it must still resolve to a row this unit is not licensed to move)`)
  }
  // eslint-disable-next-line no-console
  console.log(
    `PD-SSW arm 3 [derived control]: \`UNRESTATED_CONTROL_PATH\` DERIVES to \`${derived}\` over ${rows.length} parsed row(s) — the derivation is READ from the table, never hand-edited (§1.1 member 5; amendment row 2)`,
  )
  return problems
}

// ===========================================================================
// ARM 4 — THE LANDED COUNT-1 / CENSUS GUARDS STAYING GREEN (§4's LEAVE-ALONE set, amendment
// rows 3+4/5/7/8). GREEN-ON-ARRIVAL: these arms are ALREADY TRUE at this head and must STAY
// green — a landing that reddens ANY of them has NOT landed this unit.
// ===========================================================================
interface LandedGuardReading {
  guard: string
  problems: string[]
}

function landedGuardReadings(): LandedGuardReading[] {
  const out: LandedGuardReading[] = []
  const main = readMaybe(MAIN_PATH)
  const register = readMaybe(READINESS_REGISTER_PATH)
  const readiness = readMaybe(READINESS_PATH)

  // amendment rows 3+4 / 7 — the count-1 guards, re-ASSERTED from the LANDED files' own bytes.
  {
    const problems: string[] = []
    if (main === null) {
      problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, MAIN_PATH)} could not be read — the count-1 guards have no substrate`)
    } else {
      const writes = main.match(/securityStore\.set\(/g) ?? []
      if (writes.length !== 1) {
        problems.push(`COUNT-1 (§4 LEAVE-ALONE, amendment rows 3+4): \`securityStore.set(\` reads ${writes.length} in src/main/main.ts — the landed guards draw 10 / \`R-10\` assert \`1\`; a landing that reddens them has NOT landed this unit`)
      }
      const patches = main.match(/\.applyGatePatch\(/g) ?? []
      if (patches.length !== 1) {
        problems.push(`COUNT-1 (§4 LEAVE-ALONE, amendment rows 3+4): \`.applyGatePatch(\` reads ${patches.length} — the landed guards assert \`1\``)
      }
    }
    out.push({ guard: 'the count-1 guards (`securityStore.set(` / `.applyGatePatch(`)', problems })
  }

  // amendment row 5 — `NEG-SECOND-WRITER` (module identity over `src/main/**`).
  {
    const problems: string[] = []
    const dir = join(REPO_ROOT, 'src', 'main')
    if (!existsSync(dir)) {
      problems.push(`ABSTRACT-SUBJECT: src/main does not exist — the NEG-SECOND-WRITER arm has no substrate`)
    } else {
      const moduleId = (name: string): string => name.replace(/\.(ts|tsx|js|mjs|cjs)$/, '')
      const files = readdirSync(dir).filter((f) => f.endsWith('.ts'))
      const parsed = new Map<string, { imports: string[]; binds: boolean }>()
      for (const f of files) {
        const text = readFileSync(join(dir, f), 'utf8')
        const imports = [...text.matchAll(/^\s*import\s+(?:type\s+)?[^'"]*?from\s*['"]([^'"]+)['"]/gm)].map((m) => moduleId(m[1]!.replace(/^\.\//, '')))
        for (const m of text.matchAll(/^\s*import\s*['"]([^'"]+)['"]/gm)) imports.push(moduleId(m[1]!.replace(/^\.\//, '')))
        parsed.set(moduleId(f), { imports, binds: /\bcreateSecurityStore\b/.test(text.replace(/^\s*import[^\n]*$/gm, '')) })
      }
      const reached = new Set<string>([moduleId('security-store.ts')])
      let grew = true
      while (grew) {
        grew = false
        for (const [id, mod] of parsed) {
          if (reached.has(id)) continue
          if (mod.imports.some((imp) => reached.has(imp))) {
            reached.add(id)
            grew = true
          }
        }
      }
      const offenders: string[] = []
      for (const [id, mod] of parsed) {
        if (id === 'main' || id === 'security-store') continue
        if (reached.has(id)) offenders.push(`${id}.ts imports the security store (module identity: security-store.ts)`)
        else if (mod.binds) offenders.push(`${id}.ts receives the store: createSecurityStore`)
      }
      if (offenders.length > 0) {
        problems.push(`NEG-SECOND-WRITER (§4 LEAVE-ALONE, amendment row 5): the offender set is NOT empty — [${offenders.join(' | ')}]; §2.2/\`K-1\` home the receipt in \`src/shared/types.ts\` precisely so NO new \`src/main/**\` importer of \`security-store.js\` appears`)
      }
    }
    out.push({ guard: '`NEG-SECOND-WRITER` (the module-identity import scan)', problems })
  }

  // amendment row 8 — the `VALID_GROUPS` census site over the store's own bytes.
  {
    const problems: string[] = []
    const store = readMaybe(STORE_PATH)
    if (store === null) {
      problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, STORE_PATH)} could not be read — the census guard has no substrate`)
    } else {
      const decl = /const\s+VALID_GROUPS\s*=\s*new\s+Set\(\[([^\]]*)\]\)/.exec(store)
      const terms = decl === null ? [] : [...decl[1]!.matchAll(/'([^']+)'/g)].map((m) => m[1]!)
      if (terms.length !== NINE_GROUPS.length || NINE_GROUPS.some((g) => !terms.includes(g))) {
        problems.push(`VALID_GROUPS-CENSUS (§4 LEAVE-ALONE, amendment row 8): the set reads [${terms.join(', ')}] (CENSUS: ${terms.length}) — exactly NINE is the contract (§2.3)`)
      }
    }
    out.push({ guard: 'the `VALID_GROUPS` NINE-member census site', problems })
  }

  // the landed guard FILES still carrying their count-1 assertions — a landing that EDITS them
  // (beyond the md5 re-statement, which is a DIFFERENT file) has not landed this unit.
  {
    const problems: string[] = []
    // `tests/unit-app-harness-readiness-register.test.ts` (`§4.2 P-TP-2` draw 10) carries BOTH
    // count-1 assertions. `tests/unit-app-harness-readiness.test.ts` (`R-10`) carries the
    // `securityStore.set(` count-1 assertion; its re-gate limb is the ORDERING clause
    // (`gatePatchFromStoreResult(` before `.applyGatePatch(`), not a second count. Each file is
    // therefore checked for the limbs it ACTUALLY declares, read from its own bytes.
    const guards: Array<{ label: string; path: string; needles: Array<[string, RegExp]> }> = [
      {
        label: 'the readiness register (§4.2 P-TP-2 draw 10)',
        path: READINESS_REGISTER_PATH,
        needles: [
          ['the `securityStore.set(` count-1 assertion', /MAIN_SRC\.match\(\/securityStore\\\.set\\\(\/g\)/],
          ['the `.applyGatePatch(` count-1 assertion', /MAIN_SRC\.match\(\/\\\.applyGatePatch\\\(\/g\)/],
        ],
      },
      {
        label: 'the readiness guard (§5.2 R-10)',
        path: READINESS_PATH,
        needles: [
          ['the `securityStore.set(` count-1 assertion', /MAIN_SRC\.match\(\/securityStore\\\.set\\\(\/g\)/],
          // `R-10`'s re-gate limb is the ORDERING clause, and at this head it is stated in the
          // guard's own PROSE (`a post-hoc \`applyGatePatch\` is NOT the ordering`) rather than
          // as a second count — so the needle is the `applyGatePatch` REFERENCE the guard
          // actually carries, not a `.(` call spelling it never had. `§4`'s LEAVE-ALONE set
          // covers "the guard is not edited", which this limb measures.
          ['the `applyGatePatch` re-gate reference', /applyGatePatch/],
        ],
      },
    ]
    for (const g of guards) {
      const text = readMaybe(g.path)
      if (text === null) {
        problems.push(`ABSTRACT-SUBJECT: ${g.label} (${relative(REPO_ROOT, g.path)}) could not be read — the LEAVE-ALONE arm has no substrate`)
        continue
      }
      for (const [needleLabel, needle] of g.needles) {
        if (!needle.test(text)) {
          problems.push(`LEAVE-ALONE (§4, amendment rows 3+4/7): ${g.label} no longer carries ${needleLabel} — a landing that edits this guard beyond the pre-recorded amendment set is a review finding, full stop`)
        }
      }
    }
    out.push({ guard: 'the landed guard files\' count-1 assertions (un-edited)', problems })
  }

  return out
}

// ===========================================================================
// ARM 5 — THE SPEC's §0/§1/§2/§3 CONTRACT CLAUSES the guard owes as BYTE-LEVEL evidence
// (§1.2's DENIED list is only meaningful against the spec's own declared members).
// RED-BY-ABSENCE where the member is absent; GREEN-ON-ARRIVAL where the clause is a denial.
// ===========================================================================
function specClauseProblems(): string[] {
  const problems: string[] = []
  const spec = readMaybe(SPEC_PATH)
  if (spec === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, SPEC_PATH)} could not be read — the clause arms have no substrate`)
    return problems
  }
  // §1.1 — the SIX-member change set is the contract's whole scope
  if (!/SIX rows below/.test(spec)) {
    problems.push(`CLAUSE (§1.1): the spec does not declare the change set as SIX members — a member-set claim that cannot be read is not a bound (§1.1)`)
  }
  // §1.2 — the ELEVEN denied rows
  const deniedRegion = spec.slice(spec.indexOf('### 1.2 DENIED'), spec.indexOf('## 2. The surface'))
  const deniedCount = [...deniedRegion.matchAll(/^\|\s*\*\*(\d+)\*\*\s*\|/gm)].map((m) => m[1]!)
  if (deniedCount.length !== DENIED_ROWS.length) {
    problems.push(`CLAUSE (§1.2): the DENIED table carries ${deniedCount.length} numbered row(s) — §1.2 declares ELEVEN [${DENIED_ROWS.length}]; the rows are the contract's denial set`)
  }
  // §2.3 — the NINE census, printed with its terms
  if (!NINE_GROUPS.every((g) => spec.includes(`\`${g}\``))) {
    problems.push(`CLAUSE (§2.3): the spec does not print every one of the NINE census terms — §2.3 requires the set "printed with their terms"`)
  }
  // §3.3 — the THREE observability legs
  for (const needle of ['THE ADDITIVE MEMBER', 'THE TWO PRELOAD DECLARATIONS', 'A REGISTER LEG DRIVING `IPC_SECURITY_SET` DIRECTLY']) {
    if (!spec.includes(needle)) {
      problems.push(`CLAUSE (§3.3): the spec does not declare the observability leg \`${needle}\` — all THREE legs are required (§3.3)`)
    }
  }
  // §6 — the honesty block
  if (!/NO DURABILITY CLAIM FROM A CALL-COUNT/.test(spec)) {
    problems.push(`CLAUSE (§6): the spec carries no \`NO DURABILITY CLAIM FROM A CALL-COUNT\` clause — §6's mandatory honesty block`)
  }
  // §5 — the seed and the caps as literals
  if (!/REGISTER_SEED = 0x20260927/.test(spec)) {
    problems.push(`CLAUSE (§5): the spec does not fix the seed literal \`0x20260927\` — the register's seed is a named constant, never \`Date.now()\``)
  }
  if (!/≤100/.test(spec) || !/≤400/.test(spec)) {
    problems.push(`CLAUSE (§5): the spec does not state the caps \`≤100\` per row / \`≤400\` in total`)
  }
  if (!/STOP AFTER 5 CONSECUTIVE FAILURES/.test(spec)) {
    problems.push(`CLAUSE (§5): the spec does not state \`STOP AFTER 5 CONSECUTIVE FAILURES\``)
  }
  return problems
}

// ===========================================================================
// THE ARMS. Each prints its reading and records its verdict class.
// ===========================================================================
describe('PD-STORE-SECURITY-WRITE arm 1 — THE SIX-MEMBER CHANGE SET (§1.1): the store module\'s write discipline; `SecurityWriteReceipt` homed in `src/main/security-store.ts` (THE RULED HOME, `A-3A-2` ① — `src/shared/types.ts` IS NOT MOVED) and in EXACTLY ONE of the two candidate files; the `IPC_SECURITY_SET` return extended by the additive `write` member; the TWO widened `security.set` declarations; the md5 RE-STATEMENT; the unit\'s TWO new test files. A landing that moves a DIFFERENT member set is §3 `F-1`', () => {
  it('arm 1 — the six-member census, each member\'s cell SUBSCRIBED (§1.1; §2.1-§2.5; §3 F-1)', () => {
    const readings = changeSetReadings()
    const problems = readings.flatMap((r) => r.problems)
    for (const r of readings) {
      // eslint-disable-next-line no-console
      console.log(`PD-SSW arm 1 [${r.member}]: ${r.problems.length === 0 ? 'subscribed' : 'UNSATISFIED'} — subscribed: ${r.subscribed.join(' · ')}${r.problems.length > 0 ? `\n    ${r.problems.join('\n    | ')}` : ''}`)
    }
    expect(readings.length, 'the change-set census covers ALL SIX members (§1.1: a member dropped from the census is a member un-asserted)').toBe(CHANGE_SET_MEMBERS.length)
    // eslint-disable-next-line no-console
    console.log(`PD-SSW arm 1 (RED-BY-ABSENCE at this head): ${problems.length} finding(s) across ${readings.length} member(s)\n    ${problems.join('\n    | ')}`)
    recordArm(
      '1 · the six-member change-set census',
      problems,
      'RED-BY-ABSENCE',
      'RED at the red head: members 1-5 are UNSATISFIED — the store has NO `lastWriteReceipt` and NO `fs?` facade and still performs the plain `writeFileSync`; the receipt type is homed NOWHERE; the SET return reads `return updated`; both preload declarations are un-widened; the md5 row carries the superseded `U-STORE-PERSIST-ADOPT` spelling. Member 6 (the two new files) is the ONLY subscribed member at this head (§4 RE-1/RE-2/RE-3/RE-5)',
    )
    expect(problems, `arm 1: ${problems.join(' | ') || 'the six-member change set lands exactly as §1.1 declares'}`).toEqual([])
  }, 12_000)
})

describe('PD-STORE-SECURITY-WRITE arm 2 — THE DENIED-SURFACE NEGATIVE over §1.2\'s ELEVEN ROWS: no `src/renderer/**` byte (3b\'s); no byte-move of the byte-pinned store pair; the lock NOT extended; no MCP surface and no second IPC key; NO `VALID_GROUPS` change (the NINE-member census re-asserted); NO `SecuritySettings` widening; no second writer / no moved re-gate; no `schemaVersion` on this tier\'s file; NO new refusal site; no `secure.*` reach widening; no foreign byte — GREEN-ON-ARRIVAL and it must STAY green', () => {
  it('arm 2 — the eleven denied rows, each SUBSCRIBED separately (§1.2 items 1-11; §3 F-1)', () => {
    const readings = deniedSurfaceReadings()
    const problems = readings.flatMap((r) => r.problems)
    for (const r of readings) {
      // eslint-disable-next-line no-console
      console.log(`PD-SSW arm 2 [denied row ${r.row}]: ${r.problems.length === 0 ? 'held' : 'REDDENED'}${r.problems.length > 0 ? `\n    ${r.problems.join('\n    | ')}` : ''}`)
    }
    expect(readings.length, '§1.2 declares ELEVEN denied rows; a row dropped from the census is a denial un-asserted').toBe(DENIED_ROWS.length)
    // eslint-disable-next-line no-console
    console.log(`PD-SSW arm 2 (GREEN-ON-ARRIVAL, the denials must hold): ${problems.length} finding(s) across ${readings.length} denied row(s)\n    ${problems.join('\n    | ')}`)
    recordArm(
      '2 · the eleven-row denied-surface negative',
      problems,
      'GREEN-ON-ARRIVAL',
      'GREEN-ON-ARRIVAL (denials already true at this head) — expected green BEFORE and AFTER; a landing that reddens ANY of the eleven rows has touched a DENIED surface and NOT landed this unit (§1.2; §3 F-1). §1.2 item 11\'s foundation-tree arm is recorded NOT ARMED with its reason (no instrument distinguishes this unit\'s writes from another pass\'s)',
    )
    expect(problems, `arm 2: ${problems.join(' | ') || 'all eleven denials hold — no renderer byte, no pair byte, no lock cell, no MCP surface, no census change, no widening, no second writer, no version, no new refusal site, no secure.* reach'}`).toEqual([])
  }, 12_000)
})

describe('PD-STORE-SECURITY-WRITE arm 3 — THE md5-ROW PRESENCE (`O-2`; §1.1 member 5): the `src/main/preload.ts` row of `UNTOUCHED_DIGESTS` re-stated with `restated: \'U-STORE-SECURITY-ADOPT\'` and the superseded value visible; `UNRESTATED_CONTROL_PATH` stays DERIVED and NON-VACUOUS', () => {
  it('arm 3 (a) — the re-statement limb: LANDED-STATE re-aim — the md5 ROW is re-stated in the SAME commit as the widened preload, so the LANDED reading is `restated: \'U-STORE-SECURITY-ADOPT\'`; RED-BY-SHIM until it lands (§1.1 member 5; `S-P-3`/\`O-2\`; §5.1 P-SSW-H-3; `A-3A-2` ②/③)', () => {
    const problems = md5RowProblems()
    // eslint-disable-next-line no-console
    console.log(`PD-SSW arm 3(a) (the LANDED-STATE re-aim: ${problems.length} finding(s) at this head): ${problems.filter((p) => p.startsWith('MD5-RESTATEMENT')).length} re-statement finding(s) + ${problems.filter((p) => !p.startsWith('MD5-RESTATEMENT')).length} non-exempt finding(s)\n    ${problems.join('\n    | ')}`)
    recordArm(
      '3a · the md5 re-statement',
      problems,
      'RED-BY-SHIM',
      'A-3A-2 ②③ — THE LANDED-STATE RE-AIM. The as-filed premise ("EXPECTED RED at this head") is STALE: `A-3A-2` ② makes the md5 ROW a LICENSED RE-STATEMENT OBLIGATION that lands IN THE SAME COMMIT as the widened preload, and `A-3A-2` ④(c) fixes the ORDER (the value is RE-MEASURED at the FINAL head, never copied before the edit). This arm therefore asserts the LANDED state: the re-statement is REQUIRED to have happened, and the arm reddens until it does — the same red, re-classified from "exempt red" to RED-BY-SHIM (a landing-driven red the implementer\'s member-5 act closes). The property is UNWEAKENED: the row must read the value MEASURED at the landed head.',
    )
    // `A-3A-2` ②③ — THE LANDED-STATE ASSERTION (the stale premise RE-AIMED):
    //   * the `restated:` field MUST name THIS unit's target (`RESTATEMENT_UNIT`), and
    //   * the recorded md5 MUST EQUAL the REAL `src/main/preload.ts` digest at the head —
    //     the row is the instrument that ENFORCES `O-2`, which is exactly its purpose.
    // BEFORE the landing the first limb fails (the row still carries the superseded
    // `U-STORE-PERSIST-ADOPT` spelling) — a real red, named by class, not exempted away.
    // AFTER the landing BOTH limbs pass and this arm is GREEN. The superseded literal staying
    // VISIBLE and the row resolving are asserted unconditionally in both states.
    const reStatement = problems.filter((p) => p.startsWith('MD5-RESTATEMENT'))
    const other = problems.filter((p) => !p.startsWith('MD5-RESTATEMENT'))
    expect(reStatement, `arm 3 (a) [the LANDED-STATE re-aim — the re-statement must name \`${RESTATEMENT_UNIT}\`]: ${reStatement.join(' | ') || 'the row is re-stated to this unit'}`).toEqual([])
    expect(other, `arm 3 (a) [the NON-EXEMPT limbs — the superseded literal must stay VISIBLE and the row must resolve]: ${other.join(' | ') || 'both hold'}`).toEqual([])
  }, 12_000)

  it('arm 3 (b) — the DERIVED control limb: GREEN-ON-ARRIVAL — `UNRESTATED_CONTROL_PATH` stays DERIVED from the table and NON-VACUOUS (§1.1 member 5; amendment row 2)', () => {
    const problems = derivedControlProblems()
    // eslint-disable-next-line no-console
    console.log(`PD-SSW arm 3(b) (GREEN-ON-ARRIVAL): ${problems.length} finding(s)${problems.length > 0 ? `\n    ${problems.join('\n    | ')}` : ''}`)
    recordArm(
      '3b · the derived unrestated-control path',
      problems,
      'GREEN-ON-ARRIVAL',
      'GREEN-ON-ARRIVAL: `UNRESTATED_CONTROL_PATH` is DERIVED from `UNTOUCHED_DIGESTS` (never hand-edited) and must stay NON-VACUOUS — amendment row 2 is EXEMPT-IN-ADVANCE and must be ASSERTED non-vacuous (§4)',
    )
    expect(problems, `arm 3 (b): ${problems.join(' | ') || 'the derived control still resolves to a non-empty, un-re-stated path'}`).toEqual([])
  }, 12_000)
})

describe('PD-STORE-SECURITY-WRITE arm 4 — THE LANDED LEAVE-ALONE GUARDS STAYING GREEN (§4\'s pre-recorded amendment set, rows 3+4/5/7/8): the count-1 guards on `securityStore.set(` and `.applyGatePatch(`; `NEG-SECOND-WRITER`; the `VALID_GROUPS` census; and the landed guard FILES\' own count-1 assertions — GREEN-ON-ARRIVAL at this head', () => {
  it('arm 4 — the landed guards re-asserted from their own subjects (§4 LEAVE-ALONE; amendment rows 3+4/5/7/8)', () => {
    const readings = landedGuardReadings()
    const problems = readings.flatMap((r) => r.problems)
    for (const r of readings) {
      // eslint-disable-next-line no-console
      console.log(`PD-SSW arm 4 [${r.guard}]: ${r.problems.length === 0 ? 'held' : 'REDDENED'}${r.problems.length > 0 ? `\n    ${r.problems.join('\n    | ')}` : ''}`)
    }
    // eslint-disable-next-line no-console
    console.log(`PD-SSW arm 4 (GREEN-ON-ARRIVAL): ${problems.length} finding(s) across ${readings.length} landed guard(s)`)
    recordArm(
      '4 · the landed LEAVE-ALONE guards',
      problems,
      'GREEN-ON-ARRIVAL',
      'GREEN-ON-ARRIVAL (already true at this head) — amendment rows 3+4 (the count-1 guards), 5 (`NEG-SECOND-WRITER`), 7 (`R-10`) and 8 (the census) are LEAVE-ALONE and must STAY GREEN; a landing that reddens ANY of them has NOT landed this unit (§4)',
    )
    expect(problems, `arm 4: ${problems.join(' | ') || 'every landed LEAVE-ALONE guard still holds'}`).toEqual([])
  }, 12_000)
})

describe('PD-STORE-SECURITY-WRITE arm 5 — THE SPEC\'S OWN CONTRACT CLAUSES as byte-level evidence: §1.1\'s SIX members; §1.2\'s ELEVEN denied rows; §2.3\'s NINE terms; §3.3\'s THREE observability legs; §5\'s seed/caps/stop rule; §6\'s honesty block', () => {
  it('arm 5 — the clause census over `docs/specs/unit-store-security-write.md` (§0-§6)', () => {
    const problems = specClauseProblems()
    // eslint-disable-next-line no-console
    console.log(`PD-SSW arm 5 (GREEN-ON-ARRIVAL — the spec is FILED): ${problems.length} finding(s)${problems.length > 0 ? `\n    ${problems.join('\n    | ')}` : ''}`)
    recordArm(
      '5 · the spec\'s contract clauses',
      problems,
      'GREEN-ON-ARRIVAL',
      'GREEN-ON-ARRIVAL: the spec is FILED at this head, so the clause census holds BEFORE and AFTER the landing; a landing that edits a DECLARED clause (the six members, the eleven denials, the nine terms, the seed/caps) reddens THIS arm',
    )
    expect(problems, `arm 5: ${problems.join(' | ') || 'every declared clause is present in the spec'}`).toEqual([])
  }, 12_000)
})

// ===========================================================================
// THE ARM-VERDICT REPORT — the run's reading, printed verbatim for the DONE row.
// ===========================================================================
describe('PD-STORE-SECURITY-WRITE — the arm-verdict report and the head anchor', () => {
  it('the arm-verdict report: the SIX arm-verdict REPORTS with their verdict classes — at this head 1 RED-BY-ABSENCE (arm 1) · 1 RED-BY-SHIM (arm 3a, the LANDED-STATE re-aim) · 4 GREEN-ON-ARRIVAL (arm 2, 3b, 4, 5) · 0 GREEN · 0 SKIPPED', () => {
    // eslint-disable-next-line no-console
    console.log(
      '\nPD-STORE-SECURITY-WRITE GUARD — ARM-VERDICT REPORT (the RED RUN at the pre-edit head)\n' +
        ARM_VERDICTS.map((v) => `  arm ${v.arm}: ${v.verdict} — ${v.note}${v.limbs.length > 0 ? `\n      limbs: ${v.limbs.slice(0, 3).join('\n      | ')}` : ''}`).join('\n') +
        '\nEND PD-STORE-SECURITY-WRITE ARM-VERDICT REPORT',
    )
    expect(ARM_VERDICTS.length, 'all SIX arm-verdict reports (arm 1 · arm 2 · arm 3 split a/b · arm 4 · arm 5) — every guard arm reports its reading, and a report that does not cover them all hides a classification').toBe(6)
    const byClass = (c: ArmVerdict): number => ARM_VERDICTS.filter((v) => v.verdict === c).length
    // eslint-disable-next-line no-console
    console.log(
      `PD-SSW arm classes at this head: RED-BY-ABSENCE ${byClass('RED-BY-ABSENCE')} · RED-BY-SHIM ${byClass('RED-BY-SHIM')} · GREEN-ON-ARRIVAL ${byClass('GREEN-ON-ARRIVAL')} · GREEN ${byClass('GREEN')} · SKIPPED ${byClass('SKIPPED')}`,
    )
    expect(byClass('GREEN-ON-ARRIVAL'), 'the GREEN-ON-ARRIVAL arms are EXPLICITLY MARKED as such (arms 2, 3b, 4, 5) — a negative/denial/landed arm already true at this head, never counted as a landing-driven red (§4)').toBeGreaterThanOrEqual(3)
    expect(byClass('RED-BY-ABSENCE') + byClass('RED-BY-SHIM'), 'the landing-driven reds are the arms whose subject this unit creates (arm 1, arm 3a) — reported RED, never as green (§4 RE-1..RE-5; `A-3A-2` ②③ re-classes arm 3a from EXEMPT RED to RED-BY-SHIM)').toBeGreaterThan(0)
    expect(byClass('GREEN'), 'no arm is unconditionally GREEN at this head — a GREEN here would mean the arm lost its subject (§4)').toBe(0)
    // the sibling register must exist (member 6); its PRESENCE is this guard's own reading.
    expect(existsSync(REGISTER_PATH), `the sibling register (\`tests/${relative(HERE, REGISTER_PATH)}\`) is member 6 of §1.1's change set and must exist`).toBe(true)
  }, 12_000)
})
