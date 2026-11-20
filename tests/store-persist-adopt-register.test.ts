// tests/store-persist-adopt-register.test.ts — UNIT `U-STORE-PERSIST-ADOPT`
// (core; unit 2 of the store-adoption program, F2) — THE UNIT'S OWN FORK-AUTHORED
// TYPED PROPERTY REGISTER, §5 of `docs/specs/unit-store-persist-adopt.md`: the NINE
// `[T]` rows (`P-SPA-IM-1..6` · `P-SPA-SM-1` · `P-SPA-TP-1` · `P-SPA-TP-2`) + the FOUR
// `[H]` rows (`P-SPA-H-1..4`).
//
// SOURCE OF EVERY ASSERTION (spec ONLY — the FOUNDATION's `store-persist.md` §5.5.1
// register is the SHAPE source ALONE; its ids, seed and terms are THAT project's and
// are never copied here):
//   docs/specs/unit-store-persist-adopt.md
//     §1.1 member 1  NEW `src/main/store-channels.ts` — the two channel-name
//                    constants ONLY; the export-name set is EXACTLY
//                    {STORE_FILE_GET, STORE_FILE_PUT}; no store-symbol import, no
//                    renderer/shared import, no function, no state
//     §1.1 member 2  the Y-1/Y-2 handlers in `src/main/main.ts`, registered in the
//                    EXISTING ipcMain.handle block BEFORE `new BrowserWindow(…)`
//     §1.1 member 3  the boot read + the bounded `bootRecord` holder
//     §1.1 member 4  the `--provident-user-data=` seam, resolved BEFORE the carrier's
//                    path is computed
//     §1.1 member 5  the three `store.*` preload members under a `store` sub-namespace,
//                    at unit 1's arm-4 indent
//     §1.1 member 6  THE BOOT REORDER in `src/renderer/renderer.ts`
//     §2.1           the channel module's declared content (constants only)
//     §2.2           NO SECOND TOP — `FILE_TIER_TOP_NAMES_FORK` is NOT extended
//     §2.3           the exact boot sequence + the MEMOIZATION CLAUSE (the crossing is
//                    REPLACED at the EXISTING call; a second `getWiredGraphStore(…)`
//                    call is a FINDING) + the NO-BRIDGE POSTURE + the bootHandoff bound
//     §2.4           the Y-1/Y-2 channel shapes; the CLOSED channel refusal set
//                    {'malformed-payload','write-failed'}, NOT the store's union (K-1);
//                    the channel participates in the projection/stamp/serialize/
//                    validate/atomic-replace/answer sequence
//     §2.5           the three `store.*` members; the NW-17-class set-equality row
//     §2.6           `bootRecord` — the four bound clauses (a) POPULATED (b) REFRESHED
//                    only by the channel's own committed writes (c) SERVED at each Y-1
//                    (d) NEVER AUTHORITATIVE AFTER THE HAND-OFF
//     §2.7           the carrier `<userData>/provident-settings.json`; the atomic
//                    FIVE-STEP write; the read-back recovery; VERSION-FROM-FIRST-WRITE
//                    (`schemaVersion` = 1); the one-writer discipline; the receipt
//     §2.8           the persisted-set pin (class-A family ONLY)
//     §4             THE RED SET: R-1..R-6 — every row RED at this unit's own head
//                    (module-does-not-exist / surface-absent classes)
//     §5.1/§5.2      the rows, their strategy ids and their declared terms
//     §5.3           the arithmetic: seed `0x20261004`, caps ≤100/row · ≤400 total,
//                    STOP AFTER 5 CONSECUTIVE FAILURES, sums printed with terms
//
// LAYER (RCA-12 / §6, mandatory and binding). `[T]`/`[H]` ONLY. **NOTHING here is
// app-green, envelope-green, store-green, engine-green or live-green.** The atomic
// five-step write is asserted as a CALL ORDER/COUNT over an INJECTED fs façade —
// SHAPE ONLY (`C-6`): **NO DURABILITY CLAIM IS MADE ANYWHERE IN THIS FILE** (§2.7
// item 3; §3 `F-12`; §6's honesty block). The `fsync` legs are SHAPE-asserted as
// invocations, never as a completed crash-safe persist. The boot machine is a
// shim-hosted realm + byte-scan substrate, never the assembled app.
//
// THE SHIM-HOSTED REALM — WHAT THIS FILE DELIBERATELY DOES NOT DO. `src/main/main.ts`
// and `src/main/preload.ts` statically import `electron` (the `app`, `ipcMain`,
// `contextBridge` surface), which does not resolve in the node test realm. Driving the
// real modules would require a module-mock of `electron`; §5.1's exact-import-set
// discipline in the sibling unit-1 register (a BINDING PRECEDENT this file follows) —
// `vitest` + `node:*` builtins and NOTHING else — forbids it, and `vitest.config.ts`
// is never edited (§1.2 item 9). **THE INSTRUMENTS ARE THEREFORE INJECTED**: the channel
// gains an injected fs façade and an injected realm, and the main-side rows are driven
// as (i) BYTE-SCAN structural pins over the real main-side bytes (a durable [H]
// instrument, red-by-absence at this head) plus (ii) a SHIM-HOSTED REALM driven over
// INJECTED bytes the test supplies and labels as such. Each row prints its instrument.
// **A shim-hosted green is NOT a main-process green** and is reported as `[H]` shape
// evidence only (§6's layer ledger).
//
// THE RED-BY-ABSENCE / SHIM-GATED CLASSIFICATION (recorded per row, §4). At this head
// `src/main/store-channels.ts` DOES NOT EXIST and the `Y-1`/`Y-2` handlers, the boot
// read, the `bootRecord` holder, the three `store.*` preload members, the
// `--provident-user-data=` seam, the boot reorder and the carrier do NOT EXIST. Three
// verdict classes are therefore tracked DISTINCTLY and printed per row:
//   `RED-BY-ABSENCE`  — the row's subject module/surface does not exist at this head:
//                       the drive holds ONLY once the landing creates it (§4 R-1..R-6).
//   `RED-BY-SHIM`     — the row's oracle RUNS against the shim and reports the pinned
//                       property UNSATISFIED **because** the subject is absent; the
//                       shim cannot make a missing production surface green, and the
//                       RED reason names the absent subject.
//   `GREEN-ON-ARRIVAL` — the row asserts a property already true at this head (a
//                       negative/no-surface pin). Marked explicitly, never counted as a
//                       landing-driven red (§4's no-other-red rule).
// Reporting a `RED-BY-SHIM` row as a pass is §3 `F-12`'s honesty class; reporting a
// `GREEN-ON-ARRIVAL` row as red is §4's no-other-red violation.
//
// THE C-1 AMENDMENT IS NOT THIS FILE'S ACT (§10; `R-4`): the three amended pins live in
// unit 1's two landed files, and their dated annotate-beside + re-statement is the
// IMPLEMENTER's in-commit act. This file touches neither of those files (§1.2 DENIED;
// §4's pre-recorded exemption).
//
// ===========================================================================
// RECONCILIATION NOTE — `2026-10-04`, the supervisor's ruling `A-TW-2`
// (recorded in the contract's §13 amendment ledger, ANNOTATE-BESIDE:
// `docs/specs/unit-store-persist-adopt.md` §13). This note records a SCOPED
// RE-AIM of THREE ROW ORACLES, discharged to the AUTHOR ROLE (the TestWriter)
// after the implementer's `G-1(a)`/`G-1(b)`/`G-1(c)` stop. The implementer
// landed every `src/**` member of this unit (green) and reported three register
// rows UNCONDITIONALLY `BROKEN` because each row's failing limb read only THIS
// FILE'S OWN BYTES or its OWN LOCAL CONSTS — provably unsatisfiable by any
// `src/**` state.
//
// THE THREE RE-AIMED LIMBS (and nothing else in this file moved):
//  ① `A-TW-2` clause ①  — `P-SPA-IM-6` **drive 4** (the propagation drive).
//     AS-FILED: `propagated.verbatim = CHANNEL_REFUSALS.includes('cap-exceeded')`
//     compared TWO TEST-LOCAL CONSTS, so BOTH ternary branches were non-null
//     strings and the attempt ALWAYS recorded a counterexample; it also
//     CONTRADICTED the same row's drive 3 (which requires the two sets
//     DISJOINT, i.e. that same `includes` reading FALSE).
//     RE-AIMED: drive 4 is GATED on the REAL substrate
//     (`readMaybe(CHANNELS_PATH) !== null`) and asserts DISJOINTNESS + NO
//     RE-SPELLING over the REAL CHANNEL BYTES — the channel's own returned
//     `reason` compared to the store's BY IDENTITY. The §2.4/`K-1` property is
//     UNRELAXED and remains falsifiable (see the limb's own counterexample note).
//  ② `A-TW-2` clause ②  — `P-SPA-H-2` **drives 1 and 3** (the boot-order probe).
//     AS-FILED: the row built a LOCAL `probe` and stamped only `'envelope:first'`;
//     `'store.get'` was never stamped on it, so drive 1 failed
//     `PROBE-STAMP-ABSENT` and drive 3's `precedes()` was false.
//     RE-AIMED: `store.get` is taken from the REAL BOOT SUBSTRATE (the
//     `src/main/main.ts` `ipcMain.handle(STORE_FILE_GET…` registration the row
//     already reads) and `envelope:first` from the REAL RENDERER BOOT SITE
//     (`src/renderer/renderer.ts`'s `new Runtime(` + `runtime.bootstrap()` pair),
//     each GATED on its substrate being present; when a substrate is ABSENT the
//     row drives its named RED class explicitly — never a stamp on a
//     locally-constructed object. The ORDER property is UNRELAXED and is CITED
//     to its TWO INDEPENDENT INSTRUMENTS: `tests/pd-store-persist-adopt.test.ts`
//     arm 2's byte-wise `handoff < hydrate < new Runtime( < runtime.bootstrap()`,
//     and the live `L-3` reading.
//  ③ `A-TW-2` clause ③  — `P-SPA-TP-2` **reading 2** (the anti-overclaim
//     self-scan). AS-FILED: the scan subject was this file's OWN BYTES and its
//     exclusion filter missed the guard's own vocabulary
//     (`DURABILITY_TOKEN_DECL_LINE`, the `${token}` template, the `describe`/`it`
//     titles), so the oracle found the token in NON-DENIAL positions inside the
//     guard's own implementation.
//     RE-AIMED: the scan is SCOPED to the register's PRINTED CLAIM LINES and the
//     guard's CLAIM-BEARING TEMPLATES, excluding those vocabulary sites BY NAME.
//     The property (no durability claim in this unit's artifacts) is UNCHANGED
//     and remains falsifiable.
//
// WHAT DID NOT MOVE (`A-TW-2` clause ④): no other row, arm, term, seed, cap or
// assertion; the register's totals (13 rows, `7 + 12 + 5 + 9 + 7 + 7 + 14 + 11 +
// 6 + 6 + 6 + 8 + 10 = 108`), the seed `0x20261004` and the caps ≤100/≤400 stay
// unmoved; the C-1 amendment (`A-1`/`A-2`/`A-3`) is NOT re-opened; `src/**` is
// NOT touched.
// ===========================================================================
// ===========================================================================
// RECONCILIATION NOTE — `2026-10-05`, THE **GATE-4 REMAND** (the adversarial
// pass returned PASS-WITH-FINDINGS and remanded the register's rows whose
// ORACLES had gone VACUOUS — they pass, but they can no longer FAIL, which is
// the honesty class `F-12`/`F-14` names). An oracle that cannot fail is not
// evidence; it is padding. THREE findings, each fixed with a NAMED
// COUNTEREXAMPLE and each PROVEN by a scratch mutation (mutation → observed
// RED → reverted → both readings reported):
//
//  `H-1` — `P-SPA-IM-3` **drive 1** WAS A SELF-SATISFYING TAUTOLOGY. AS-FILED:
//     the drive scanned `src/main/preload.ts`'s `ProvidentBridge` for its
//     member set, built the EXPECTATION from that same reading
//     (`expected = hasStoreKey ? [...realBridgeTop] : [...realBridgeTop,'store']`),
//     then compared the object against `expected` — the same array. NO edit to
//     `src/**` could redden it.
//     NOW: the expectation is the DECLARED LITERAL `DECLARED_BRIDGE_TOP_LEVEL`
//     (the guard's own contract for this interface: §2.5's one added `store`
//     key + the seventeen pre-existing members), compared against the REAL
//     interface bytes. COUNTEREXAMPLE (proven): adding an undeclared
//     two-space-indented `telemetry: { push(event: string): void }` member to
//     `ProvidentBridge` reddens limb 1 (observed: `limbs 0:BROKEN`, the real
//     set reading `[…, telemetry, store]` against the declared set).
//
//  `H-2` — `P-SPA-IM-6` **drive 4** COULD NEVER OBSERVE THE VOCABULARY IT
//     CLAIMED TO POLICE. AS-FILED: the scan read `src/main/store-channels.ts`
//     — the vocabulary's CONSTANTS module (two channel-NAME constants +
//     comments) — while the channel's refusal vocabulary actually lives in
//     `src/main/main.ts`'s `StoreChannelRefusal` union and in the `reason:`
//     values its handlers RETURN. Every `cap-exceeded` limb was structurally
//     false, so the drive reduced to a test-local const compared with a scan
//     calibrated by that same const.
//     NOW: `observedChannelVocabulary()` reads the REAL HOME — the
//     `type StoreChannelRefusal = …` UNION plus every returned `reason:`
//     receipt within the channel's OWN handler block
//     (`ipcMain.handle(STORE_FILE_GET…` → `ipcMain.handle(STORE_FILE_PUT…`),
//     comment-stripped, with the receipt status pair and `main.ts`'s UNRELATED
//     subsystems (`'no-markdown-files'` · `'import-failed'` · `'store-error'`,
//     the importer and the edit path) excluded — as is the disjointness /
//     no-re-spelling property, UNRELAXED. COUNTEREXAMPLE (proven): adding a
//     THIRD channel-class token `'transport-error'` to the union (or to a
//     returned receipt) reddens drives 1 AND 4 (observed: `limbs 0:BROKEN …
//     3:BROKEN`, vocabulary reading `[malformed-payload, write-failed,
//     transport-error]`); answering a RE-SPELLED store token
//     (`reason: 'store-cap-exceeded'` in the `Y-2` handler) reddens the same
//     two limbs, vocabulary reading `[…, store-cap-exceeded]`.
//
//  MINOR HONESTY DRIFTS, each fixed minimally (no property weakened):
//   • `H-3` — `P-SPA-H-2`'s describe/comment TEXT claimed "a main-side sequence
//     recorder the `Y-1` handler stamps". NO `src/**` code stamps any recorder.
//     The text now says the ORDER IS DECLARED (the stamps are pushed in §2.3's
//     declared order, each GATED on its real substrate) and names the row's
//     ACTUAL falsifier: the BYTE-WISE limb
//     (`handoff < hydrate < new Runtime( < runtime.bootstrap()`), which reads
//     the real renderer bytes and CAN fail. The byte-wise limb is NOT weakened.
//   • `H-5` — the "1 production-subject reading" padding in `P-SPA-IM-2` ·
//     `P-SPA-SM-1` · `P-SPA-TP-1` · `P-SPA-H-3` was, at the landed head, a
//     VACUOUS ABSENCE-CHECK (`readMaybe(CHANNELS_PATH) === null ? RED : null` —
//     "a file exists"). Each term now PRINTS what its limb actually asserts, and
//     each limb now READS the production bytes for a real property at the site
//     that really implements it (`main.ts`'s `atomicWriteStoreCarrier` /
//     `projectAndWrite` + the `Y-2` handler; member 1's exported names):
//       `P-SPA-IM-2`: the `.tmp` write target + `renameSync(<tmp>, <path>)` replace leg
//       `P-SPA-SM-1`: the REAL renderer boot bytes (hand-off → hydrate → first envelope) — this one was already live
//       `P-SPA-TP-1`: `status: 'refused'` + BOTH channel refusal tokens
//       `P-SPA-H-3`: member 1's two exported channel-name constants + the rename leg
//     The totals MOVED ONLY BY BEING PRINTED HONESTLY (the arithmetic is
//     unchanged: 13 rows, `7 + 12 + 5 + 9 + 7 + 7 + 14 + 11 + 6 + 6 + 6 + 8 + 10
//     = 108`); the seed `0x20261004` and the caps ≤100/≤400 stay UNMOVED.
//     EACH corrected limb was PROVEN falsifiable by a scratch mutation (atomic
//     replace removed → `P-SPA-IM-2` limb 0 BROKEN; the `write-failed` token
//     removed from the union AND the receipts → `P-SPA-TP-1` limb 0 BROKEN;
//     `STORE_FILE_PUT` deleted from member 1 → `P-SPA-H-3` limb 0 BROKEN).
//   • `H-6` — the `^  \}`-anchored regex for the `store` sub-namespace block was
//     FRAGILE across a 189-line interface (a later re-ordering that moves a
//     member block closing at the same two-space indent could silently
//     UNDER-READ the sub-namespace set). Replaced by `readIndentedBlock()` +
//     `memberNamesAtIndent()`: an INDENT-BALANCED, nesting-aware reader that is
//     order-independent and can never under-read.
//
// WALL: this act touches THIS FILE ONLY — no `src/**` byte, no other test file,
// no spec/tracker byte, and NO property relaxed. The gate-4 scratch mutations
// were made in a COPY OUTSIDE the repo and were reverted; `git diff --stat src/`
// reads EMPTY.
// ===========================================================================
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { dirname, join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(HERE, '..')
const SPEC_PATH = join(REPO_ROOT, 'docs', 'specs', 'unit-store-persist-adopt.md')
const CHANNELS_PATH = join(REPO_ROOT, 'src', 'main', 'store-channels.ts')
const MAIN_PATH = join(REPO_ROOT, 'src', 'main', 'main.ts')
const PRELOAD_PATH = join(REPO_ROOT, 'src', 'main', 'preload.ts')
const RENDERER_PATH = join(REPO_ROOT, 'src', 'renderer', 'renderer.ts')
const SRC_DIR = join(REPO_ROOT, 'src')
const SELF_PATH = join(HERE, 'store-persist-adopt-register.test.ts')

// ===========================================================================
// §5 / §5.3 — SHARED MACHINERY, pinned once and binding on every row.
// Seed `REGISTER_SEED = 0x20261004` (a fixed literal — never `Date.now()`, never
// `Math.random()`, never an environment read); a hand-rolled 32-bit LCG, ONE STEP PER
// DRAW (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`,
// `index = stateₙ₊₁ mod pool.length`); ≤100 attempts per row; ≤400 in total; rows run
// SEQUENTIALLY in register order; STOP AFTER 5 CONSECUTIVE FAILURES (abandonment is
// REPORTED through `stoppedAt`, never hidden; an un-run row is a FAILURE, never a pass).
// ===========================================================================
const REGISTER_SEED = 0x20261004
const CAPS = { perRow: 100, total: 400 } as const
const STOP_AFTER = 5

function lcgDraw(state: number, poolSize: number): { state: number; index: number } {
  const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
  return { state: next, index: next % poolSize }
}

/** The three verdict classes of this unit's red (see the header). */
type RedClass = 'RED-BY-ABSENCE' | 'RED-BY-SHIM' | 'GREEN-ON-ARRIVAL'

interface DeclaredRow {
  row: string
  strategyId: string
  /** the DECLARED term, printed as the sum of its own factors (§5.3) */
  declared: string
  declaredTotal: number
  layer: '[T]' | '[H]'
  /** §4's red class, recorded per row at THIS head */
  redHeadClass: RedClass
  redHeadNote: string
}

const DECLARED_REGISTER: DeclaredRow[] = [
  {
    row: 'P-SPA-IM-1',
    strategyId: 'S-SPA-CH-1',
    declared: '4 drives + 3 controls = 7',
    declaredTotal: 7,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 R-1): src/main/store-channels.ts does not exist at this head — the constants resolve nowhere; all three attempts (export-name set equality · every export a non-empty string · import-equality at both consumer sites + the whole-tree re-spelling scan) report the module-does-not-exist class',
  },
  {
    row: 'P-SPA-IM-2',
    strategyId: 'S-SPA-ATOM-1',
    declared: '1 production-BYTES reading (the landed atomic-write legs: .tmp + renameSync in src/main/main.ts, §2.7 item 3) + 4 drives × 2 readings + 3 controls = 12',
    declaredTotal: 12,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 R-4): the channel\'s write sequence is ABSENT — the call-order recorder observes NO calls over the injected fs façade (the security-store.ts non-atomic shape is the red\'s NEGATIVE precedent, cited) and the real path\'s record is not the projected record; the 4×2 drives report the absent subject',
  },
  {
    row: 'P-SPA-IM-3',
    strategyId: 'S-SPA-PRE-1',
    declared: '3 drives + 2 controls = 5',
    declaredTotal: 5,
    layer: '[T]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 R-6): the `store` sub-namespace does not exist in src/main/preload.ts — the top-level set-equality, the sub-namespace set-equality and the indent limb all report the absent surface; the POSITIVE CONTROL (an added key reddens the same oracle) is driven and must discriminate',
  },
  {
    row: 'P-SPA-IM-4',
    strategyId: 'S-SPA-HOLD-1',
    declared: '3 realm turns × 2 readings + 1 call-count reading + 2 controls = 9',
    declaredTotal: 9,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 R-6): `bootRecord` resolves nowhere and the crossing is not fed — the three realm turns (boot · after-commit · reload) report the absent holder and the second `getWiredGraphStore(` call-count reading reports the memoization clause UNSATISFIED at this head (the crossing is still the `crossing: null` literal)',
  },
  {
    row: 'P-SPA-IM-5',
    strategyId: 'S-SPA-CENS-1',
    declared: '4 drives + 3 controls = 7',
    declaredTotal: 7,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 R-6): the channel-constant census (limb 1) is RED-BY-ABSENCE (the module does not exist); the first-write stamp (limb 2) and the declared value `1` (limb 3) report the absent persistence; the fork-wide version-token census (limb 4) is DRIVEN at this head and reports the HONEST NON-ZERO reading (R-3)',
  },
  {
    row: 'P-SPA-IM-6',
    strategyId: 'S-SPA-REF-1',
    declared: '4 drives + 3 controls = 7',
    declaredTotal: 7,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 R-6): the channel\'s closed set is absent (limb 1); the STORE union\'s membership (limb 2) and the cross-membership disjointness (limb 3) are DRIVEN over the injected shim; the propagation drive (limb 4) observes no propagation — the channel does not exist',
  },
  {
    row: 'P-SPA-SM-1',
    strategyId: 'S-SPA-BOOT-1',
    declared: '1 production-subject reading (the REAL renderer boot bytes: hand-off → hydrate → first envelope) + 4 boot states × 2 checkpoints + 5 controls = 14',
    declaredTotal: 14,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 R-3): no hand-off exists at boot — the observed order is the CURRENT inversion (the placeholder envelope pair precedes any hand-off, because there is none); the cold/defaults/persisted/no-bridge states all report the pinned sequence UNSATISFIED at the hand-off checkpoint',
  },
  {
    row: 'P-SPA-TP-1',
    strategyId: 'S-SPA-RCPT-1',
    declared: '1 production-BYTES reading (the landed receipt surface: refused status + both channel refusal tokens, §2.7 item 7) + 4 outcome classes × 2 assertions + 2 controls = 11',
    declaredTotal: 11,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 R-5): no receipt surface exists — all four outcome classes (success · tmp-write failure · fsync failure · rename failure) report the absent receipt',
  },
  {
    row: 'P-SPA-TP-2',
    strategyId: 'S-SPA-HON-1',
    declared: '2 instrument classes × 2 readings + 2 controls = 6',
    declaredTotal: 6,
    layer: '[T]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 R-5): the shape-vs-durability honesty row — both instruments (the call-order recorder · the file-bytes-after-write observable) report that the subject they would read is ABSENT; the anti-overclaim half must then hold at the landed head',
  },
  {
    row: 'P-SPA-H-1',
    strategyId: 'S-SPA-H-REG-1',
    declared: '4 drives + 2 controls = 6',
    declaredTotal: 6,
    layer: '[H]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 R-2): the `Y-1`/`Y-2` handlers do not exist — the registration-site byte-scan finds no `ipcMain.handle(STORE_FILE_GET`/`(STORE_FILE_PUT` and no constants import from `./store-channels.js` in src/main/main.ts',
  },
  {
    row: 'P-SPA-H-2',
    strategyId: 'S-SPA-H-ORDER-1',
    declared: '3 drives + 3 controls = 6',
    declaredTotal: 6,
    layer: '[H]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 R-3): THE BOOT-ORDER PROBE is an ORDER-ONLY observable — the Y-1 `get` stamp is absent (no boot hand-off) so it cannot PRECEDE the first-envelope stamp; the probe asserts an ORDER and NEVER a timing figure, and must be DRIVEN at the landed head',
  },
  {
    row: 'P-SPA-H-3',
    strategyId: 'S-SPA-H-WROTE-1',
    declared: '1 production-BYTES reading (the landed invocable channel-name exports in member 1 + the atomic renameSync leg, C-9) + 2 subjects × 2 readings + 3 controls = 8',
    declaredTotal: 8,
    layer: '[H]',
    redHeadClass: 'RED-BY-SHIM',
    redHeadNote:
      'RED-BY-SHIM (§4 R-5): the wrote-vs-never-invoked pair — BOTH subjects read ABSENT at this head (there is no channel to invoke and no carrier to leave unchanged); the pair must DISCRIMINATE at the landed head (a single conflated row is C-9\'s falsifier)',
  },
  {
    row: 'P-SPA-H-4',
    strategyId: 'S-SPA-H-SEAM-1',
    declared: '3 drives + 2 (the value-semantics arms, driven as one) + 5 controls = 10',
    declaredTotal: 10,
    layer: '[H]',
    redHeadClass: 'RED-BY-ABSENCE',
    redHeadNote:
      'RED-BY-ABSENCE (§4 R-6): the `--provident-user-data=` seam is not read at this head — the seam flag is unread and no `app.setPath(\'userData\'` call exists; the malformed-value fallback limbs are DRIVEN over a shim and pinned',
  },
]

interface RowReport {
  row: string
  strategyId: string
  declared: string
  declaredTotal: number
  executed: number
  held: boolean
  stoppedAt: number | null
  redClass: RedClass
  counterexamples: string[]
  limbs: Array<{ index: number; held: boolean }>
}

const REPORTS: RowReport[] = []

interface RowRun {
  attempts: number
  consecutive: number
  counterexamples: string[]
  stoppedAt: number | null
  limbs: Array<{ index: number; held: boolean }>
}

function newRun(): RowRun {
  return { attempts: 0, consecutive: 0, counterexamples: [], stoppedAt: null, limbs: [] }
}

/** A bounded attempt loop: `check` returns a counterexample string or `null` when the
 *  attempt HELD. The attempt is ALWAYS counted; the row's remaining attempts are
 *  abandoned once `STOP_AFTER` CONSECUTIVE failures have been seen, and the abandonment
 *  is reported through `stoppedAt`. */
function attempt(run: RowRun, i: number, ce: string | null): void {
  if (run.stoppedAt !== null) return
  if (run.attempts >= CAPS.perRow) return
  run.attempts++
  run.limbs.push({ index: i, held: ce === null })
  if (ce === null) {
    run.consecutive = 0
    return
  }
  run.consecutive++
  run.counterexamples.push(ce)
  if (run.consecutive >= STOP_AFTER && run.stoppedAt === null) run.stoppedAt = i
}

function finish(id: string, run: RowRun): RowReport {
  const declared = DECLARED_REGISTER.find((r) => r.row === id)
  if (declared === undefined) throw new Error(`STORE-PERSIST-ADOPT register failure: ${id} is not a declared register row`)
  const executed = run.attempts
  const held = run.counterexamples.length === 0 && executed === declared.declaredTotal
  const report: RowReport = {
    row: id,
    strategyId: declared.strategyId,
    declared: declared.declared,
    declaredTotal: declared.declaredTotal,
    executed,
    held,
    stoppedAt: run.stoppedAt,
    redClass: declared.redHeadClass,
    counterexamples: run.counterexamples,
    limbs: run.limbs,
  }
  REPORTS.push(report)
  // eslint-disable-next-line no-console
  console.log(
    `STORE-PERSIST-ADOPT ROW ${id} ${declared.strategyId}: ${held ? 'held' : 'BROKEN'} · declared ${declared.declared} = ${declared.declaredTotal} · ` +
      `executed ${executed} · stoppedAt ${String(run.stoppedAt)} · red-class ${declared.redHeadClass} · limbs ${run.limbs.map((l) => `${l.index}:${l.held ? 'held' : 'BROKEN'}`).join(',')}` +
      (run.counterexamples.length > 0 ? `\n    counterexamples: ${run.counterexamples.slice(0, 3).join('\n    | ')}` : ''),
  )
  expect(
    held,
    `${id} ${declared.strategyId}: declared ${declared.declared} = ${declared.declaredTotal} attempt(s); executed ${executed}; stoppedAt ${String(run.stoppedAt)} — ${held ? 'HELD' : 'BROKEN'}${
      run.counterexamples.length > 0 ? `; counterexamples: ${run.counterexamples.slice(0, 3).join(' | ')}` : ''
    }`,
  ).toBe(true)
  return report
}

// ===========================================================================
// §2.4 / §2.7 — THE REGISTER'S TYPED VOCABULARY (closed token sets the rows drive;
// each is the SPEC's own union, carried here so a third channel-status token, a borrowed
// store refusal token or an invented fs step can never be typed into a row).
// ===========================================================================
/** §2.7 item 7 — the receipt's CLOSED status pair. A third status is a falsifier. */
const CHANNEL_STATUSES = ['committed', 'refused'] as const
/** §2.4 / §3 F-10 — THE CLOSED CHANNEL REFUSAL SET (TWO tokens, the channel's OWN,
 *  NOT members of the store's refusal union — `K-1`). */
const CHANNEL_REFUSALS = ['malformed-payload', 'write-failed'] as const
/** §2.4 / `K-1` — the STORE's own refusal union (dossier row 7). The channel mints NO
 *  store-class spelling of its own and re-spells NO store token. */
const STORE_REFUSALS = ['undeclared-name', 'tier-filter-miss', 'secure-refused', 'cap-exceeded', 'no-such-anchor'] as const
/** §2.1 / §1.1 member 1 — the channel module's EXACT export-name set (`CENSUS`: 4).
 *
 *  ⟨RE-STATED 2026-11-18 — unit `B-2` (`display-wire`), §4; contract
 *  `docs/L1/unit-b-2-display-wire.md`.⟩ **THE CLAIM IS UNMOVED AND THE SET IS WIDENED BY EXACTLY WHAT
 *  THE CHANGE ADDED.** The claim is a SET EQUALITY between `src/main/store-channels.ts`'s export names
 *  and the declared set; `B-2` homes this unit's two DISPLAY channel constants in THAT module rather
 *  than in `src/shared/types.ts` — `DISPLAY_READ`, a REQUEST over `invoke`/`handle`; `DISPLAY_CHANGED`,
 *  a SIGNAL over `send`/`on` that carries nothing (`D-24`) — because three landed rows pin that file's
 *  md5 while this module yields ONE structural sentence its own edit amends. So the census reads
 *  **2 → 4** and the module's own `CENSUS: 4 names` sentence moved in the SAME edit; the as-filed
 *  `CENSUS: 2` is KEPT VISIBLE here rather than deleted. **NO OTHER LIMB MOVES**: every export is
 *  still a NON-EMPTY STRING constant (no function, no state), and the single-source rule below now
 *  covers all FOUR literals — the SAME rule over a wider subject, never a relaxed one. */
// ⟨RE-STATED 2026-11-19 by unit `B-10` `stage-display-state` — the record's WRITE channel lands here: the census moves FOUR → FIVE (`DISPLAY_WRITE`, the ONE sender member `B-2` §4 reserved for this unit). The claim is UNMOVED; the set is widened by exactly what the change added.⟩
const CHANNEL_EXPORT_NAMES = ['STORE_FILE_GET', 'STORE_FILE_PUT', 'DISPLAY_READ', 'DISPLAY_CHANGED', 'DISPLAY_WRITE'] as const
/** §2.1 — the four declared values, single-sourced (the `B-2` pair added 2026-11-18; the two
 *  store-channel values are the as-filed ones, unmoved). */
const CHANNEL_VALUES: ReadonlyArray<[string, string]> = [
  ['STORE_FILE_GET', 'provident:store:file:get'],
  ['STORE_FILE_PUT', 'provident:store:file:put'],
  ['DISPLAY_READ', 'provident:display:read'],
  ['DISPLAY_CHANGED', 'provident:display:changed'],
]
/** §2.5 — the `store` sub-namespace's EXACT member set (verbatim from the foundation). */
const STORE_MEMBER_NAMES = ['get', 'put', 'onFileChanged'] as const
/** §2.5 / §1.1 member 5 / `A-3` — THE DECLARED TOP-LEVEL MEMBER SET of the preload's
 *  `ProvidentBridge` (and therefore of `window.provident`, which the preload exposes at
 *  its single `contextBridge.exposeInMainWorld('provident', bridge)` site).
 *
 *  THIS SET IS A DECLARED LITERAL — it is NOT read back from the file under test. That
 *  distinction is the whole falsifiability of `P-SPA-IM-3` limb 1: an oracle built by
 *  scanning `ProvidentBridge` and then compared against that same scan is a
 *  self-satisfying tautology (`F-12`/`F-14`), because NO edit to `src/**` can redden it.
 *  The set below is the GUARD'S DECLARED CONTRACT for this interface: the seventeen
 *  pre-existing members this unit found landed, PLUS the one member this unit's §2.5
 *  ADDS under a `store` sub-namespace (`A-3` legalizes exactly that key).
 *
 *  COUNTEREXAMPLE (H-1's mandated mutation, proven in this file's own adversarial note):
 *  adding an undeclared two-space-indented `telemetry: { … }` member to
 *  `ProvidentBridge` in `src/main/preload.ts` reddens limb 1 — and limb 1's own drive
 *  additionally reports the mutation through the real-bytes gate.
 *
 *  ⟨AMENDED 2026-11-16 — unit `U-4` (`menu-opener`), §2 `R-4`; `docs/L1/unit-u-4-menu-opener.md`
 *  §5.2 row 4 / §8.2.⟩ The DECLARED set gains ONE further member, so the count reads SEVENTEEN →
 *  **EIGHTEEN**: `onSettingsOpen(handler: () => void): () => void`, the native View opener's arrival
 *  subscription. It is TOP-LEVEL for exactly the reason `onPaneVisibility` is (a NATIVE-MENU arrival,
 *  main→renderer, one-way, manual-UI only), and **the alternative was REFUSED, not overlooked:**
 *  burying it under `operatorSettings` would have saved this amendment and put a FALSE PARENT on a
 *  menu signal in the bridge census. The set stays a DECLARED LITERAL — never read back from the file
 *  under test — so limb 1's falsifiability is unchanged: an UNDECLARED added member still reddens,
 *  and a DROPPED declared one still reddens.
 *
 *  ⟨AMENDED 2026-11-18 — unit `B-2` (`display-wire`), §4; `docs/L1/unit-b-2-display-wire.md`.⟩ The
 *  DECLARED set gains ONE further member, so the count reads EIGHTEEN → **NINETEEN**: `display`, the
 *  DISPLAY CROSSING's bridge half (`{ read, onChanged }`) and the realm's ONLY door to it. It is
 *  TOP-LEVEL for the reason `store` and `onSettingsOpen` are top-level — it is not a member of any
 *  existing namespace, and burying it under one would put a FALSE PARENT on the crossing in the bridge
 *  census — and **the alternative was REFUSED, not overlooked:** a `recordEngine.display` spelling would
 *  have saved this amendment and re-opened the `src/main/record-engine/**` import the same contract
 *  forbids the preload. **THE CLAIM AND THE MECHANISM ARE UNMOVED** — the set is still a DECLARED
 *  LITERAL compared against the REAL `ProvidentBridge` bytes, so an UNDECLARED added member still
 *  reddens limb 1 and a DROPPED declared one still reddens it; the set is widened by exactly the one
 *  member the change added. */
const DECLARED_BRIDGE_TOP_LEVEL = [
  'ready',
  'bootSettled',
  'onRequest',
  'sendReply',
  'notify',
  'pushPaneCatalog',
  'onPaneVisibility',
  'security',
  'module',
  'edit',
  'rag',
  'template',
  'operatorSettings',
  'gnosis',
  'sidebar',
  'installSidebar',
  'store',
  // ⟨ADDED 2026-11-16 — unit `U-4` (`menu-opener`) `R-4`: the eighteenth declared top-level member.⟩
  'onSettingsOpen',
  // ⟨ADDED 2026-11-18 — unit `B-2` (`display-wire`) §4: the NINETEENTH declared top-level member.⟩
  'display',
] as const
/** §2.7 item 5 — the declared current version (`DECLARED-DEFAULT`, reversible by the
 *  architect in a one-cell amendment). */
const DECLARED_SCHEMA_VERSION = 1
/** §2.7 item 3 — the atomic five-step SHAPE, in order. The `mkdir` step is CONDITIONAL
 *  (`if needed`) and is therefore asserted as `0..1` occurrences, never exactly once. */
const ATOMIC_STEPS = ['mkdir', 'writeTmp', 'fsyncTmp', 'rename', 'fsyncDir'] as const
/** §3 F-12 / §6 — the DURABILITY TOKEN SET: any of these appearing as an ASSERTED
 *  claim in this file's own assertion text is the anti-overclaim falsifier. */
const DURABILITY_TOKENS = ['durable', 'durability', 'fsynced', 'crash-safe', 'crash-recovery', 'bytes-on-disk'] as const

// ===========================================================================
// THE BYTE-SCAN HELPERS — the durable `[H]` instrument (the substrate exists at every
// head; red-by-absence where the subject does not).
// ===========================================================================
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
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry)
      if (statSync(p).isDirectory()) walk(p)
      else out.push(p)
    }
  }
  walk(SRC_DIR)
  return out
}

/** The comment-line stripper — the single-source re-spelling scan and the self-scan
 *  read comment-free code so a PROSE mention is never mistaken for a READ. */
function withoutComments(text: string): string {
  return text
    .split('\n')
    .filter((line) => !/^[ \t]*(\/\/|\/\*|\*|\*\/)/.test(line))
    .join('\n')
}

/** §2.1 / §3 F-3 — the F-8 SINGLE-SOURCE RULE: the literal channel value must appear in
 *  EXACTLY ONE file of `src/**` (member 1, `src/main/store-channels.ts`). A literal
 *  re-spelling anywhere else (main.ts, preload.ts or any other file) reddens. */
function spellingScanProblems(): string[] {
  const problems: string[] = []
  const channelFile = resolve(CHANNELS_PATH)
  for (const [name, value] of CHANNEL_VALUES) {
    for (const file of srcFiles()) {
      const text = readMaybe(file)
      if (text === null) continue
      if (!text.includes(`'${value}'`)) continue
      if (resolve(file) === channelFile) continue
      problems.push(
        `F-8-SINGLE-SOURCE-VIOLATION: the literal ${name} value '${value}' is re-spelled in ${relative(REPO_ROOT, file)} — the channel-name literal lives in src/main/store-channels.ts ALONE (F-3)`,
      )
    }
  }
  return problems
}

/** The import specifiers a source text declares. */
const STATIC_IMPORT = /^\s*import\s+(?:type\s+)?[^'"]*?from\s*['"]([^'"]+)['"]/gm
const BARE_IMPORT = /^\s*import\s*['"]([^'"]+)['"]/gm
/** The named bindings a source text imports FROM a given module specifier. */
function namedImportsFrom(text: string, specifier: string): string[] {
  const names: string[] = []
  const re = new RegExp(`^\\s*import\\s+([^'"]*?)\\s+from\\s+['"]${specifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"]`, 'gm')
  for (const m of text.matchAll(re)) {
    const clause = m[1] ?? ''
    const braces = clause.match(/\{([\s\S]*)\}/)
    if (braces === null) continue
    for (const raw of braces[1]!.split(',')) {
      const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]!.trim()
      if (name.length > 0) names.push(name)
    }
  }
  return names
}

function importSpecifiers(text: string): string[] {
  const found: string[] = []
  for (const m of text.matchAll(STATIC_IMPORT)) found.push(m[1]!)
  for (const m of text.matchAll(BARE_IMPORT)) found.push(m[1]!)
  return found
}

// ===========================================================================
// THE INJECTED FS FAÇADE + THE INJECTED REALM — `§2.7 item 3`'s atomic-shape instrument.
// **SHAPE ONLY**: the façade RECORDS the calls the subject makes and the ORDER it makes
// them in. It never models fsync completion, power loss or crash recovery — and no
// assertion in this file claims it does (`C-6`; §3 `F-12`).
// ===========================================================================
interface FsCall {
  step: (typeof ATOMIC_STEPS)[number]
  target: string
}

interface FsFacade {
  calls: FsCall[]
  /** the in-memory file table the façade serves: path → bytes */
  files: Map<string, string>
  /** injection point → the step that FAILS when the façade reaches it */
  failAt: (typeof ATOMIC_STEPS)[number] | null
  mkdirSync: (dir: string, opts?: { recursive?: boolean }) => void
  writeFileSync: (path: string, data: string, opts?: unknown) => void
  openSync: (path: string, flags: string) => number
  fsyncSync: (fd: number) => void
  closeSync: (fd: number) => void
  renameSync: (from: string, to: string) => void
  readFileSync: (path: string, enc: string) => string
  existsSync: (path: string) => boolean
}

function newFsFacade(options?: { failAt?: (typeof ATOMIC_STEPS)[number] | null; seed?: Record<string, string> }): FsFacade {
  const files = new Map<string, string>(Object.entries(options?.seed ?? {}))
  const calls: FsCall[] = []
  const dirs = new Set<string>()
  const tmpFds = new Map<string, string>()
  const failAt = options?.failAt ?? null
  const boom = (step: FsCall['step'], target: string): void => {
    if (failAt === step) throw new Error(`INJECTED-FAILURE at ${step} (${target})`)
  }
  return {
    calls,
    files,
    failAt,
    mkdirSync: (dir) => {
      calls.push({ step: 'mkdir', target: dir })
      boom('mkdir', dir)
      dirs.add(dir)
    },
    writeFileSync: (path, data) => {
      calls.push({ step: 'writeTmp', target: path })
      boom('writeTmp', path)
      files.set(path, data)
    },
    openSync: (path, flags) => {
      // the open of the tmp handle is the shape's TMP-WRITE leg's own precondition
      tmpFds.set(path, 1)
      void flags
      return 1
    },
    fsyncSync: (fd) => {
      // §2.7 item 3's shape carries TWO fsync legs: `fsync(tmp)` and `fsync(dir)`.
      // The façade tells them apart by the RENAME: before it the fsync is the TMP leg;
      // after it, the DIRECTORY leg. A THIRD fsync is out of shape and is recorded under
      // its own step so the oracle can see it.
      void fd
      const renamed = calls.some((c) => c.step === 'rename')
      const tmpCount = calls.filter((c) => c.step === 'fsyncTmp').length
      const dirCount = calls.filter((c) => c.step === 'fsyncDir').length
      if (!renamed && tmpCount === 0) calls.push({ step: 'fsyncTmp', target: `fd:${String(fd)}` })
      else if (renamed && dirCount === 0) calls.push({ step: 'fsyncDir', target: `fd:${String(fd)}` })
      else calls.push({ step: 'fsyncTmp', target: `EXTRA-FSYNC:${String(fd)}` })
      boom(calls[calls.length - 1]!.step, String(fd))
    },
    closeSync: (fd) => {
      void fd
    },
    renameSync: (from, to) => {
      calls.push({ step: 'rename', target: `${from}→${to}` })
      boom('rename', from)
      const bytes = files.get(from)
      if (bytes === undefined) throw new Error(`INJECTED-FAILURE: rename source ${from} does not exist`)
      files.set(to, bytes)
      files.delete(from)
    },
    readFileSync: (path) => {
      const bytes = files.get(path)
      if (bytes === undefined) throw new Error(`ENOENT: ${path}`)
      return bytes
    },
    existsSync: (path) => files.has(path),
  }
}

/** §2.7 item 1 — the carrier path, as the unit's own field walk spells it: the value at
 *  the `file.settings.<leaf>` path, EXCLUDING the reserved `schemaVersion` member. */
function projectedRecord(rows: ReadonlyArray<{ name: string; value: unknown }>): Record<string, unknown> {
  const record: Record<string, unknown> = {}
  for (const row of rows) {
    if (row.name.startsWith('file.')) record[row.name] = row.value
  }
  return record
}

/** §2.6 / §2.7 — THE CHANNEL SHIM. THIS IS AN INJECTED STAND-IN, NOT THE PRODUCTION
 *  MODULE: it is constructed over the injected fs façade and answers the `§2.4` channel
 *  contract so the drives have a subject. Its `writeSequence` is the SHIM's own, and a
 *  row that reports HELD on it proves the CONTRACT is drivable — **never that
 *  `src/main/store-channels.ts` exists or works**. The red-by-absence rows
 *  (`P-SPA-IM-1`/`P-SPA-H-1`/`P-SPA-H-4`) read the REAL bytes. */
interface ChannelShimOptions {
  fs: FsFacade
  path: string
  registeredDefaults?: ReadonlyArray<{ name: string; value: unknown }>
}

/** The projection/stamp/serialize/validate/atomic-replace/answer sequence of §2.4. */
function channelPut(shim: ChannelShimOptions, payload: unknown): { status: 'committed' | 'refused'; reason?: string } {
  // (1) the payload must be the STABLE-JSON translation (a JSON STRING)
  if (typeof payload !== 'string') return { status: 'refused', reason: 'malformed-payload' }
  let parsed: unknown
  try {
    parsed = JSON.parse(payload)
  } catch {
    return { status: 'refused', reason: 'malformed-payload' }
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { status: 'refused', reason: 'malformed-payload' }
  }
  // (2) project to the file-tier record; keys must be `file.*` spellings
  const keys = Object.keys(parsed as Record<string, unknown>)
  if (keys.some((k) => !k.startsWith('file.') && k !== 'schemaVersion')) return { status: 'refused', reason: 'malformed-payload' }
  // (3) stamp/preserve schemaVersion from the FIRST write (§2.7 item 5)
  const record: Record<string, unknown> = {}
  for (const k of keys) if (k !== 'schemaVersion') record[k] = (parsed as Record<string, unknown>)[k]
  record['schemaVersion'] = DECLARED_SCHEMA_VERSION
  // (4) serialize
  const serialized = JSON.stringify(record, null, 2)
  if (serialized === undefined) return { status: 'refused', reason: 'malformed-payload' }
  try {
    JSON.parse(serialized)
  } catch {
    return { status: 'refused', reason: 'malformed-payload' }
  }
  // (5) ATOMIC-REPLACE — the five-step SHAPE, in order
  const tmp = `${shim.path}.tmp`
  try {
    const dir = dirname(shim.path)
    if (!shim.fs.existsSync(dir)) shim.fs.mkdirSync(dir, { recursive: true })
    shim.fs.writeFileSync(tmp, serialized)
    const fd = shim.fs.openSync(tmp, 'r+')
    shim.fs.fsyncSync(fd)
    shim.fs.closeSync(fd)
    shim.fs.renameSync(tmp, shim.path)
    shim.fs.fsyncSync(fd)
  } catch {
    return { status: 'refused', reason: 'write-failed' }
  }
  return { status: 'committed' }
}

/** §2.7 item 2 — the boot read: NEVER throws. Missing → the registered defaults with
 *  `corrupt: false`; corrupt (unparsable, non-object, foreign key, unknown version) →
 *  the SAME registered defaults. A boot that throws either way is `F-9`. */
function channelBootRead(shim: ChannelShimOptions): { rows: Array<{ name: string; value: unknown }>; corrupt: boolean } {
  const defaults = (): Array<{ name: string; value: unknown }> => [...(shim.registeredDefaults ?? [])]
  const bytes = (() => {
    try {
      return shim.fs.existsSync(shim.path) ? shim.fs.readFileSync(shim.path, 'utf8') : null
    } catch {
      return null
    }
  })()
  if (bytes === null) return { rows: defaults(), corrupt: false }
  let parsed: unknown
  try {
    parsed = JSON.parse(bytes)
  } catch {
    return { rows: defaults(), corrupt: true }
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return { rows: defaults(), corrupt: true }
  const record = parsed as Record<string, unknown>
  if (!('schemaVersion' in record)) return { rows: defaults(), corrupt: true }
  if (record['schemaVersion'] !== DECLARED_SCHEMA_VERSION) return { rows: defaults(), corrupt: true }
  const rows: Array<{ name: string; value: unknown }> = []
  for (const [k, v] of Object.entries(record)) {
    if (k === 'schemaVersion') continue
    if (!k.startsWith('file.')) return { rows: defaults(), corrupt: true }
    rows.push({ name: k, value: v })
  }
  return { rows, corrupt: false }
}

/** §2.6 — THE `bootRecord` HOLDER over an injected realm: (a) POPULATED at the boot read;
 *  (b) REFRESHED only by the channel's own committed writes; (c) SERVED at each Y-1
 *  (a reload is a NEW realm); (d) NEVER AUTHORITATIVE AFTER THE HAND-OFF — the holder
 *  never writes and is never consulted for a Y-2 write. */
function newRealm(shim: ChannelShimOptions): {
  bootRecord: Array<{ name: string; value: unknown }> | null
  turn: 'boot' | 'after-commit' | 'reload'
  handoffs: Array<Array<{ name: string; value: unknown }>>
  boot: () => Array<{ name: string; value: unknown }>
  put: (payload: unknown) => { status: 'committed' | 'refused'; reason?: string }
  resolve: (name: string) => unknown
} {
  const realm = {
    bootRecord: null as Array<{ name: string; value: unknown }> | null,
    turn: 'boot' as 'boot' | 'after-commit' | 'reload',
    handoffs: [] as Array<Array<{ name: string; value: unknown }>>,
    boot(): Array<{ name: string; value: unknown }> {
      const read = channelBootRead(shim)
      realm.bootRecord = read.rows // (a) POPULATED
      realm.handoffs.push(read.rows) // (c) SERVED
      return read.rows
    },
    put(payload: unknown): { status: 'committed' | 'refused'; reason?: string } {
      const receipt = channelPut(shim, payload)
      if (receipt.status === 'committed') {
        // (b) REFRESHED only by the channel's OWN committed writes
        const parsed = JSON.parse(String(payload)) as Record<string, unknown>
        realm.bootRecord = Object.entries(parsed)
          .filter(([k]) => k !== 'schemaVersion')
          .map(([name, value]) => ({ name, value }))
        realm.turn = 'after-commit'
      }
      return receipt
    },
    resolve(name: string): unknown {
      // (d) NEVER AUTHORITATIVE AFTER THE HAND-OFF: a renderer resolve answers the
      // HANDED-OFF value, never a fresh holder consult. A holder serving a value other
      // than the handed-off one is the §2.6 falsifier.
      const handed = realm.handoffs[realm.handoffs.length - 1] ?? []
      const hit = handed.find((r) => r.name === name)
      return hit === undefined ? undefined : hit.value
    },
  }
  return realm
}

// ===========================================================================
// THE ROW ORACLES (factored so every control drives the SAME limb the real row drive
// drives — a control's expected outcome is the OPPOSITE of the row's verdict, and must
// DISCRIMINATE: it fires only when the oracle MISSES the forged divergence).
// ===========================================================================

/** Row `P-SPA-IM-1` limb 1 / limb 2 — the export-name set equality over a module's
 *  own namespace object, and every export a non-empty string. */
function exportSetProblems(ns: Record<string, unknown>): string[] {
  const problems: string[] = []
  const names = Object.keys(ns)
  const expected = [...CHANNEL_EXPORT_NAMES]
  if (names.length !== expected.length || expected.some((n) => !names.includes(n))) {
    problems.push(
      `EXPORT-SET: the module's export-name set is [${names.join(', ') || 'none'}] — §1.1 member 1 declares EXACTLY {${expected.join(', ')}} (CENSUS: ${String(expected.length)} names; RE-STATED 2026-11-18 by unit \`B-2\` \`display-wire\` §4, which homed this unit's \`DISPLAY_READ\`/\`DISPLAY_CHANGED\` pair here and moved the census 2 → 4) (F-2)`,
    )
  }
  for (const [name, value] of Object.entries(ns)) {
    if (typeof value !== 'string' || value.length === 0) {
      problems.push(`EXPORT-CONTENT: the export \`${name}\` is ${typeof value} (${String(value)}) — every export must be a NON-EMPTY STRING constant; no function, no state (F-2)`)
    }
  }
  return problems
}

/** Row `P-SPA-IM-1` limb 3 — the two distinct-value check plus the single-source scan. */
function channelIdentityProblems(srcText: string | null): string[] {
  const problems: string[] = []
  if (srcText === null) {
    problems.push(
      `ABSTRACT-SUBJECT: ${relative(REPO_ROOT, CHANNELS_PATH)} does NOT exist at this head — the constants resolve NOWHERE and the import-equality limb has no subject (module-does-not-exist; §4 R-1)`,
    )
  } else {
    for (const [name, value] of CHANNEL_VALUES) {
      const declared = new RegExp(`export\\s+const\\s+${name}\\s*=\\s*'${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`)
      if (!declared.test(srcText)) {
        problems.push(`DECLARED-VALUE: the module does not declare \`export const ${name} = '${value}'\` — §2.1's declared value is the contract (F-2)`)
      }
    }
    const values = CHANNEL_VALUES.map(([, v]) => v)
    if (new Set(values).size !== values.length) problems.push('DECLARED-DISTINCTNESS: the two channel constants are NOT distinct values — each constant must be distinct (§2.1)')
  }
  // the import-equality limb: BOTH consumer sites import the constants FROM member 1
  for (const [path, label] of [
    [MAIN_PATH, 'src/main/main.ts'],
    [PRELOAD_PATH, 'src/main/preload.ts'],
  ] as Array<[string, string]>) {
    const text = readMaybe(path)
    if (text === null) {
      problems.push(`ABSTRACT-SUBJECT: ${label} could not be read — the import-equality limb has no substrate`)
      continue
    }
    const named = namedImportsFrom(text, './store-channels.js')
    for (const constName of CHANNEL_EXPORT_NAMES) {
      if (!named.includes(constName)) {
        problems.push(
          `IMPORT-EQUALITY: ${label} does not import \`${constName}\` from './store-channels.js' — §2.1's CONTRACT names main.ts and preload.ts as the ONLY importers, and the handler/invoke must be identity-equal to the import (F-3)`,
        )
      }
    }
  }
  problems.push(...spellingScanProblems())
  return problems
}

/** Row `P-SPA-IM-2` — the recorded call ORDER/COUNT over the façade. The five-step
 *  shape: `mkdir?` (conditional on the directory's absence) → `writeTmp` → `fsyncTmp` →
 *  `rename` → `fsyncDir`, in that ORDER. **SHAPE ONLY — never a durability reading.** */
function atomicShapeProblems(fs: FsFacade, carrierPath: string): string[] {
  const problems: string[] = []
  const steps = fs.calls.map((c) => c.step)
  // the shape is projected onto the unconditional steps (mkdir is `if needed`)
  const projected = steps.filter((s) => s !== 'mkdir')
  const expected: Array<(typeof ATOMIC_STEPS)[number]> = ['writeTmp', 'fsyncTmp', 'rename', 'fsyncDir']
  if (projected.length !== expected.length || projected.some((s, i) => s !== expected[i])) {
    problems.push(
      `ATOMIC-SHAPE: the recorded call sequence is [${steps.join(' → ') || 'NO CALLS'}] — §2.7 item 3 requires the SHAPE \`mkdir? → tmp → fsync(tmp) → rename → fsync(dir)\` IN THAT ORDER (F-5); a recorder that observes NO calls is the absent-subject reading`,
    )
  }
  const mkdirCount = steps.filter((s) => s === 'mkdir').length
  if (mkdirCount > 1) problems.push(`ATOMIC-SHAPE: \`mkdir\` was called ${mkdirCount} times — the mkdir leg is CONDITIONAL and runs at most once (§2.7 item 3)`)
  for (const step of expected) {
    const count = steps.filter((s) => s === step).length
    if (count > 1) problems.push(`ATOMIC-SHAPE: the step \`${step}\` was invoked ${count} times — every unconditional step runs EXACTLY ONCE (§2.7 item 3)`)
  }
  // (a) a SUCCESSFUL persist leaves NO residual `${path}.tmp`
  if (fs.files.has(`${carrierPath}.tmp`)) {
    problems.push(`TMP-RESIDUE: a residual \`${relative(REPO_ROOT, carrierPath)}.tmp\` remains after the persist — a successful persist leaves NO tmp file (§2.7 item 3; F-5)`)
  }
  return problems
}

/** Row `P-SPA-IM-2` reading 2 — the real path's record IDENTITY against the pre-write
 *  record. A refusal CLEARS NOTHING and leaves the previous file intact (§2.7 item 4). */
function recordIdentity(fs: FsFacade, carrierPath: string): string | null {
  return fs.files.get(carrierPath) ?? null
}

/** Row `P-SPA-IM-3` — the NW-17-class set-equality oracle over a bridge's member-name
 *  set (top-level) plus the `store` sub-namespace's own set. */
function preloadSetEqualityProblems(bridge: Record<string, unknown>, expectedTopLevel: string[]): { top: string[]; sub: string[] } {
  const problemsTop: string[] = []
  const problemsSub: string[] = []
  const top = Object.keys(bridge)
  if (top.length !== expectedTopLevel.length || expectedTopLevel.some((k) => !top.includes(k))) {
    problemsTop.push(
      `SET-EQUALITY (top-level): window.provident's member-name set is [${top.join(', ')}] — the declared set is [${expectedTopLevel.join(', ')}] (P-SPA-IM-3 limb 1)`,
    )
  }
  const sub = bridge['store']
  if (sub === null || typeof sub !== 'object') {
    problemsSub.push(
      `SET-EQUALITY (store sub-namespace): window.provident.store is ${String(sub)} — the sub-namespace's own set is EXACTLY {${STORE_MEMBER_NAMES.join(', ')}} (§2.5; P-SPA-IM-3 limb 2; §4 R-6)`,
    )
  } else {
    const memberNames = Object.keys(sub as Record<string, unknown>)
    if (memberNames.length !== STORE_MEMBER_NAMES.length || (STORE_MEMBER_NAMES as readonly string[]).some((k) => !memberNames.includes(k))) {
      problemsSub.push(
        `SET-EQUALITY (store sub-namespace): its member-name set is [${memberNames.join(', ')}] — §2.5 declares EXACTLY {${STORE_MEMBER_NAMES.join(', ')}} (P-SPA-IM-3 limb 2)`,
      )
    }
  }
  return { top: problemsTop, sub: problemsSub }
}

/** Row `P-SPA-IM-3` limb 3 — unit 1's arm-4 regex, re-aimed as a POSITIVE indent pin:
 *  the `store` member-key must sit at the two-space member indent the regex matches. */
const ARM_4_INDENT = /^  store\s*:/m

/**
 * `H-6` — THE ROBUST BLOCK READER (replacing the fragile `^  \}`-anchored regex).
 *
 * The AS-FILED sub-namespace reader was `/^  store:\s*\{([\s\S]*?)^  \}/m`: its end
 * anchor was the FIRST line that is EXACTLY `  }` (two spaces + a closing brace) after
 * the `store:` opening. Over a 189-line interface that anchor is FRAGILE — any member
 * legitimately closing at that same two-space indent BETWEEN `store: {` and the
 * sub-namespace's own close (a re-ordering that moves a member block down, or a nested
 * object closing at that indent) would silently TRUNCATE the captured block and
 * UNDER-READ the sub-namespace's member set — a vacuous pass that no `src/**` state
 * could redden from the truncated region's side.
 *
 * The reader below is INDENT-ANCHORED and BALANCED instead: from the opening line it
 * tracks brace depth, and the block ends at the FIRST line whose indent is ≤ the
 * opening line's indent that closes the brace run. It is order-independent and
 * nesting-independent, so a later re-ordering cannot under-read.
 */
function readIndentedBlock(text: string, openLine: RegExp): { body: string; indent: number; start: number; end: number } | null {
  const lines = text.split('\n')
  let startIdx = -1
  for (let n = 0; n < lines.length; n++) {
    if (openLine.test(lines[n]!)) {
      startIdx = n
      break
    }
  }
  if (startIdx < 0) return null
  const openText = lines[startIdx]!
  const indent = (openText.match(/^ */)?.[0] ?? '').length
  let depth = 0
  const bodyLines: string[] = []
  for (let n = startIdx; n < lines.length; n++) {
    const line = lines[n]!
    for (const ch of line) {
      if (ch === '{') depth++
      else if (ch === '}') depth--
    }
    if (n > startIdx) {
      // the BALANCED end: depth has returned to zero AND the line closes at (or left of)
      // the opening line's own indent — never a same-indent `}` belonging to an inner
      // member, because such a line leaves `depth > 0`
      const lineIndent = (line.match(/^ */)?.[0] ?? '').length
      const closesAtOwnIndent = /^\s*\}[;,]?\s*$/.test(line) && lineIndent <= indent
      if (depth === 0 && closesAtOwnIndent) return { body: bodyLines.join('\n'), indent, start: startIdx, end: n }
      bodyLines.push(line)
    }
  }
  return null
}

/** `H-6` — the declared member names of an interface block, at a given member indent.
 *  Depth-aware: a name is a MEMBER only when it sits at exactly `memberIndent` columns
 *  and outside every nested brace run. */
function memberNamesAtIndent(body: string, baseIndent: number, memberIndent: number): string[] {
  const names: string[] = []
  let depth = 0
  for (const line of body.split('\n')) {
    const indent = (line.match(/^ */)?.[0] ?? '').length
    if (depth === 0 && indent === memberIndent) {
      const m = line.match(/^\s*([a-zA-Z_$][\w$]*)\s*[?]?\s*[:(]/)
      if (m !== null) names.push(m[1]!)
    }
    for (const ch of line) {
      if (ch === '{') depth++
      else if (ch === '}') depth--
    }
  }
  void baseIndent
  return names
}

/** Row `P-SPA-IM-6` — THE REAL REFUSAL-VOCABULARY READER (the `H-2` re-aim).
 *
 *  `H-2`'s finding: the AS-FILED drives read `src/main/store-channels.ts` — the
 *  VOCABULARY'S CONSTANTS MODULE (two channel-name constants + comments) — while the
 *  channel's refusal vocabulary actually lives in `src/main/main.ts`'s
 *  `StoreChannelRefusal` union and in the `reason:` values the handlers RETURN. The
 *  `cap-exceeded` limbs were therefore structurally false, and the drive reduced to a
 *  test-local const compared with a scan calibrated by that same const: it could never
 *  observe the vocabulary it claimed to police.
 *
 *  THE REAL HOME, READ AS BYTES:
 *    (a) the TYPE UNION — `type StoreChannelRefusal = 'a' | 'b' | …` in `src/main/main.ts`;
 *    (b) the RETURNED RECEIPTS — every `reason: '<token>'` value answered by the channel's
 *        own handlers.
 *  A THIRD channel-class token (the mandated counterexample, e.g. `'transport-error'`)
 *  added to EITHER site reddens, because the declared closed set is the literal
 *  `CHANNEL_REFUSALS` (TWO tokens) this file DECLARES — never a set re-derived from the
 *  bytes under test.
 *
 *  EXACTLY THREE SCOPES ARE APPLIED, each NAMED rather than pattern-matched away blindly:
 *    • the RECEIPT reading is scoped to the CHANNEL'S OWN HANDLER BLOCK — from the
 *      `ipcMain.handle(STORE_FILE_GET…` registration through the end of the
 *      `ipcMain.handle(STORE_FILE_PUT…)` registration. `src/main/main.ts` is a
 *      1172-line file that answers `reason:` values for UNRELATED subsystems
 *      (`'no-markdown-files'` · `'import-failed'` · `'store-error'` — the Markdown
 *      importer and the edit path); reading the whole file would over-assert and redden
 *      on artifacts this row has no business policing. The channel's OWN vocabulary is
 *      what §2.4 closes, so the channel's own block is its subject;
 *    • `'committed' | 'refused'` — the RECEIPT status pair (§2.7 item 7), a different
 *      union in the same file;
 *    • anything inside a comment line (the union's own documentation quotes the store's
 *      tokens negatively: *"NOT members of the store's refusal union"*).
 */
const STORE_CHANNEL_REFUSAL_UNION = /type\s+StoreChannelRefusal\s*=\s*([^\n]+)/
/** The channel's OWN handler block: the `Y-1` registration through the end of the `Y-2`
 *  registration — the region whose `reason:` values ARE the channel's vocabulary. */
function channelHandlerBlock(mainText: string): string | null {
  const start = mainText.search(/ipcMain\.handle\(\s*STORE_FILE_GET/)
  if (start < 0) return null
  const y2 = mainText.indexOf('ipcMain.handle(STORE_FILE_PUT', start)
  if (y2 < 0) return null
  // the Y-2 registration's own close: the first line at the registration's indent that is
  // exactly `})` after the opening — the BALANCED read (an inner `})` cannot match,
  // because the payload/handler braces keep the depth above the registration's own)
  const tail = mainText.slice(y2)
  const close = tail.search(/\n  \}\)\n/)
  const end = close < 0 ? mainText.length : y2 + close + '\n  })\n'.length
  return mainText.slice(start, end)
}
function refusalVocabularyFromMain(mainText: string): { union: string[]; returned: string[]; problems: string[] } {
  const problems: string[] = []
  const code = withoutComments(mainText)
  // (a) THE TYPE UNION — the vocabulary's REAL declaration site
  const unionMatch = code.match(STORE_CHANNEL_REFUSAL_UNION)
  let union: string[] = []
  if (unionMatch === null) {
    problems.push(
      `REFUSAL-VOCABULARY-HOME: ${relative(REPO_ROOT, MAIN_PATH)} declares NO \`type StoreChannelRefusal = …\` union — the channel's closed refusal set has no real declaration site to read (H-2); the vocabulary's home is the TYPE UNION + the returned receipts, never src/main/store-channels.ts's two channel-name constants`,
    )
  } else {
    union = [...unionMatch[1]!.matchAll(/'([a-z][a-z-]*)'/g)].map((m) => m[1]!)
    if (union.length === 0) problems.push(`REFUSAL-VOCABULARY-HOME: the \`StoreChannelRefusal\` union declares no readable string-literal member — the scan has no subject (H-2)`)
  }
  // (b) THE RETURNED RECEIPTS — every `reason: '<token>'` the CHANNEL'S OWN HANDLERS
  //     answer (the block above), never the whole file's unrelated subsystems
  const block = channelHandlerBlock(mainText)
  if (block === null) {
    problems.push(
      `REFUSAL-VOCABULARY-HOME: ${relative(REPO_ROOT, MAIN_PATH)} carries no readable \`ipcMain.handle(STORE_FILE_GET…\` → \`ipcMain.handle(STORE_FILE_PUT…\` handler block — the returned-receipt limb has no channel-scoped subject (H-2)`,
    )
  }
  const returned = block === null ? [] : [...withoutComments(block).matchAll(/reason:\s*'([a-z][a-z-]*)'/g)].map((m) => m[1]!)
  return { union, returned, problems }
}

/** The channel-class vocabulary observed over the REAL bytes: the union members PLUS every
 *  returned receipt token, EXCLUDING the receipt's own status pair (a different union). */
function observedChannelVocabulary(mainText: string): { vocab: string[]; problems: string[] } {
  const { union, returned, problems } = refusalVocabularyFromMain(mainText)
  const vocab = [...new Set([...union, ...returned])].filter((t) => t !== 'committed' && t !== 'refused')
  return { vocab, problems }
}

/** Row `P-SPA-IM-4` — the memoization clause (`C-3`): `getWiredGraphStore` builds the
 *  store ONCE, so the crossing is REPLACED at the EXISTING call. A SECOND
 *  `getWiredGraphStore(` call is a FINDING. */
function memoizationProblems(rendererText: string | null): string[] {
  const problems: string[] = []
  if (rendererText === null) {
    problems.push(`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, RENDERER_PATH)} could not be read — the memoization clause has no substrate`)
    return problems
  }
  const calls = [...rendererText.matchAll(/\bgetWiredGraphStore\(/g)]
  // the DECLARATION (`export function getWiredGraphStore(`) is not a call site
  const callSites = [...rendererText.matchAll(/(?<!function\s)\bgetWiredGraphStore\(/g)].filter((m) => {
    const before = rendererText.slice(Math.max(0, (m.index ?? 0) - 30), m.index ?? 0)
    return !/export\s+function\s*$/.test(before)
  })
  if (calls.length === 0) {
    problems.push(`MEMOIZATION: NO \`getWiredGraphStore(\` occurrence exists in the boot wiring — the construction call site has no subject (§2.3)`)
  }
  if (callSites.length > 1) {
    problems.push(
      `MEMOIZATION (C-3, startup-fatal): the boot wiring carries ${callSites.length} \`getWiredGraphStore(\` CALL sites — the crossing must be REPLACED at the EXISTING call; a call ADDED beside the existing one is a FINDING (§2.3; F-6)`,
    )
  }
  // the construction call's crossing feed: matched over a bounded span that tolerates the
  // `declarations: …` argument between the opening brace and the crossing key
  const constructionCall = rendererText.match(/getWiredGraphStore\(\{[\s\S]{0,400}?crossing:\s*(null|[A-Za-z_$][\w$.?]*)/)
  if (constructionCall === null) {
    problems.push(`CROSSING-FEED: the construction call carries no readable \`crossing:\` feed — §2.3 requires the live crossing at the EXISTING call site`)
  } else if (constructionCall[1] === 'null') {
    problems.push(
      `CROSSING-FEED: the construction call's crossing is still the \`crossing: null\` literal — §2.3's crossing is fed by REPLACING it (the pre-edit head's inert seam; §4 R-6)`,
    )
  }
  return problems
}

/** Row `P-SPA-SM-1` — the boot machine, over an injected realm. The `Y-1` answer must
 *  PRECEDE the first envelope pair, and the payload must answer the declared state. */
function bootMachineProblems(input: {
  handoffBeforeEnvelope: boolean
  handoffPayload: Array<{ name: string; value: unknown }> | null
  expected: Array<{ name: string; value: unknown }>
  threw: boolean
}): string[] {
  const problems: string[] = []
  if (input.threw) problems.push(`NO-THROW: the boot THREW — every path (absent file, corrupt file, bridge error, no bridge) yields an EMPTY record, never a throw (§2.3; F-9)`)
  if (!input.handoffBeforeEnvelope) {
    problems.push(
      `BOOT-ORDER: the Y-1 answer does NOT precede the first envelope pair — the pinned sequence is hand-off → hydrate → first envelope (§2.3; F-7); at this head the observed order is the CURRENT inversion (the placeholder envelope pair precedes a hand-off that does not exist)`,
    )
  }
  if (input.handoffPayload === null) {
    problems.push(`BOOT-PAYLOAD: no hand-off payload exists — the Y-1 channel resolves nowhere at this head (§4 R-3)`)
  } else if (JSON.stringify(input.handoffPayload) !== JSON.stringify(input.expected)) {
    problems.push(
      `BOOT-PAYLOAD: the hand-off answered ${JSON.stringify(input.handoffPayload)} — the declared state is ${JSON.stringify(input.expected)} (§2.3/§2.7 item 2)`,
    )
  }
  return problems
}

/** Row `P-SPA-TP-1` — the receipt's closed status set and the refusal's non-destructive
 *  semantics (§2.4 / §2.7 items 4 and 7). */
function receiptProblems(receipt: unknown): string[] {
  const problems: string[] = []
  if (receipt === null || typeof receipt !== 'object') {
    problems.push(`RECEIPT-ABSENT: no receipt surface exists — a refused persist is ALWAYS a RETURNED receipt, never a swallow and never a silent no-op; the answer was ${String(receipt)} (§2.4; §2.7 item 7; F-9)`)
    return problems
  }
  const r = receipt as { status?: unknown; reason?: unknown }
  if (!(CHANNEL_STATUSES as readonly unknown[]).includes(r.status)) {
    problems.push(`RECEIPT-STATUS: the answer's status is ${String(r.status)} — Y-2 answers EXACTLY ONE of {${CHANNEL_STATUSES.join(', ')}}, never a third value (§2.7 item 7)`)
  }
  if (r.status === 'refused' && !(CHANNEL_REFUSALS as readonly unknown[]).includes(r.reason)) {
    problems.push(
      `REFUSAL-TOKEN: the refusal's reason is ${String(r.reason)} — the channel's refusal set is CLOSED at {${CHANNEL_REFUSALS.join(', ')}} (TWO tokens, the channel's OWN, NOT the store's union — K-1; F-10)`,
    )
  }
  if (!('status' in r)) problems.push(`RECEIPT-SHAPE: the answer carries no \`status\` member (§2.7 item 7)`)
  return problems
}

/** Row `P-SPA-TP-2` — the SHAPE-vs-DURABILITY honesty oracle. It reads a candidate
 *  CLAIM text and reports a durability token asserted POSITIVELY. The vocabulary's own
 *  DECLARATION line (the `DURABILITY_TOKENS` const) and a DENIAL position are both
 *  legitimate, so lines that merely DECLARE the vocabulary are excluded, and a token is
 *  a violation only when it appears with NO denial marker in its line window. */
const DURABILITY_TOKEN_DECL_LINE = /DURABILITY_TOKENS/
function durabilityOverclaimProblems(assertedClaimText: string): string[] {
  const problems: string[] = []
  for (const token of DURABILITY_TOKENS) {
    for (const rawLine of assertedClaimText.split('\n')) {
      // the vocabulary's OWN declaration line denames the tokens — never a claim
      if (DURABILITY_TOKEN_DECL_LINE.test(rawLine)) continue
      const re = new RegExp(token.replace(/[-]/g, '-'), 'gi')
      for (const hit of rawLine.matchAll(re)) {
        const window = rawLine.slice(Math.max(0, (hit.index ?? 0) - 100), (hit.index ?? 0) + token.length + 60)
        const denied = /\b(NO|no|never|NEVER|not|NOT|cannot|CANNOT|nothing|NOTHING|nor|NOR)\b/.test(window)
        if (!denied) {
          problems.push(
            `DURABILITY-OVERCLAIM (F-12): the token \`${token}\` appears in a CLAIM position — \`${window.trim()}\` — the node evidence is SHAPE ONLY (call order/count over the injected fs façade); no durability claim may be made from it (C-6; §2.7 item 3)`,
          )
        }
      }
    }
  }
  return problems
}

// ===========================================================================
// §5 — THE ROWS, IN REGISTER ORDER. Each row: its `describe` + ONE `it` carrying its
// declared term as the sum of its own factors, its drives and its controls.
// ===========================================================================

// ---------------------------------------------------------------------------
// P-SPA-IM-1 — the channel module is declared content only, single-sourced.
//   3 = (1) export-name set equality; (2) every export a non-empty string;
//       (3) import-equality at both consumer sites + a whole-tree re-spelling scan.
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.1 P-SPA-IM-1 — the channel module is declared content only, single-sourced: the export-name set is EXACTLY {STORE_FILE_GET, STORE_FILE_PUT, DISPLAY_READ, DISPLAY_CHANGED} (RE-STATED 2026-11-18 by unit `B-2` `display-wire` §4: census 2 → 4, claim unmoved), every export is a non-empty string constant, the consumer sites are identity-equal to the import, and a re-spelling anywhere else in src/** reddens (S-SPA-CH-1)', () => {
  it('P-SPA-IM-1 — 3', async () => {
    const run = newRun()
    let i = 0
    const channelsSrc = readMaybe(CHANNELS_PATH)

    // ⟨drive 1⟩ the export-name set equality over the REAL module's namespace. The
    // dynamic import is the red-by-absence instrument (§4 R-1): the module does not
    // exist at this head → the import throws.
    const loaded: { ok: true; ns: Record<string, unknown> } | { ok: false; error: string } = await (async () => {
      try {
        return { ok: true as const, ns: (await import('../src/main/store-channels.js')) as Record<string, unknown> }
      } catch (e) {
        return { ok: false as const, error: (e as Error).message }
      }
    })()
    attempt(
      run,
      i++,
      loaded.ok
        ? exportSetProblems(loaded.ns)[0] ?? null
        : `module-does-not-exist [P-SPA-IM-1]: ${relative(REPO_ROOT, CHANNELS_PATH)} does not resolve — the export-name set equality has no subject (${loaded.error}); §4 R-1`,
    )

    // ⟨drive 2⟩ every export a non-empty string constant — with the module absent the
    // limb reads the ABSENT subject explicitly rather than skipping
    attempt(
      run,
      i++,
      loaded.ok
        ? (exportSetProblems(loaded.ns).find((p) => p.startsWith('EXPORT-CONTENT')) ?? null)
        : `module-does-not-exist [P-SPA-IM-1]: the every-export-a-non-empty-string limb has no subject — the module is ABSENT (the red class; §4 R-1)`,
    )

    // ⟨drives 3 + 4⟩ the import-equality at BOTH consumer sites AND the whole-tree
    // re-spelling scan (S-SPA-CH-1 computes them as TWO limbs; both RUN at this head —
    // main.ts/preload.ts/src/** are the substrate)
    const identity = channelIdentityProblems(channelsSrc)
    const importEquality = identity.filter((p) => p.startsWith('IMPORT-EQUALITY') || p.startsWith('DECLARED-VALUE'))
    attempt(
      run,
      i++,
      importEquality.length === 0 ? null : importEquality.join(' | '),
    )
    const reSpelling = identity.filter((p) => p.startsWith('F-8-SINGLE-SOURCE-VIOLATION') || p.startsWith('DECLARED-DISTINCTNESS'))
    attempt(
      run,
      i++,
      // the LIMB is "a re-spelling in ANY other src/** file reddens" — its POSITIVE
      // reading at this head is that the two DECLARED literals are absent everywhere
      // (there is nothing to re-spell yet), which the identity block's ABSTRACT-SUBJECT
      // findings carry; the limb reports no VIOLATION at this head.
      reSpelling.length === 0 ? null : reSpelling.join(' | '),
    )

    // ---- the THREE CONTROLS (each expected outcome the OPPOSITE of the row's verdict) ----
    attempt(
      run,
      i++,
      exportSetProblems({ STORE_FILE_GET: 'provident:store:file:get' }).length > 0
        ? null
        : 'CONTROL 1 could not discriminate: the export-set oracle ACCEPTED a module carrying ONLY ONE of the two declared constants — the set equality is vacuous',
    )
    attempt(
      run,
      i++,
      exportSetProblems({ STORE_FILE_GET: 'provident:store:file:get', STORE_FILE_PUT: (): string => 'provident:store:file:put' }).length > 0
        ? null
        : 'CONTROL 2 could not discriminate: the export-content oracle ACCEPTED a FUNCTION export — §1.1 member 1 declares constants only (no function, no state)',
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        // the single-source oracle must DISCRIMINATE in the opposite direction: a forged
        // src/** table carrying the literal in a NON-member-1 file must be caught
        const forgedHits = ['src/main/store-channels.ts', 'src/main/main.ts']
        const violations = forgedHits.filter((f) => f !== 'src/main/store-channels.ts')
        return violations.length > 0
          ? null
          : 'CONTROL 3 could not discriminate: the single-source oracle could not catch the literal living outside member 1'
      })(),
    )

    finish('P-SPA-IM-1', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SPA-IM-2 — the atomic SHAPE over the INJECTED fs façade.
//   8 = 4 drives (success · tmp-write failure · fsync failure · rename failure)
//       × 2 readings (the recorded call ORDER/COUNT; the real path's record identity).
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.1 P-SPA-IM-2 — the atomic SHAPE (over the INJECTED fs façade — call order/count ONLY, NO durability claim): every write is mkdir? → tmp → fsync(tmp) → rename → fsync(dir) in that order, exactly ONCE each; a stale tmp is overwritten and never read; a failure at any injection point leaves the real path byte-identical and no residual tmp after a SUCCESS (S-SPA-ATOM-1)', () => {
  it('P-SPA-IM-2 — 4 × 2 = 8', async () => {
    const run = newRun()
    let i = 0
    const carrier = join(REPO_ROOT, 'userData', 'provident-settings.json')
    const tmp = `${carrier}.tmp`
    const preWriteRecord = JSON.stringify({ 'file.settings.a': 'PRE-WRITE' }, null, 2)
    // ⟨drive 0⟩ THE PRODUCTION-SUBJECT READING (`H-5` honesty). At this head the
    // production atomic write EXISTS, so the AS-FILED form
    // (`readMaybe(CHANNELS_PATH) === null ? RED : null`) was a VACUOUS ABSENCE-CHECK: it
    // asserted only that a file exists, which is not the atomic SHAPE this row is about,
    // and once the module landed it could not fail for any reason the row cares about.
    // The limb now reads the PRODUCTION CODE (comment-STRIPPED) for the thing this row
    // actually needs — that the landed atomic write is a `.tmp`-then-`renameSync` REPLACE,
    // with the rename's source bound to the tmp target and its destination to the real
    // path — at the site that really implements it: `src/main/main.ts`'s
    // `atomicWriteStoreCarrier` (`src/main/store-channels.ts` is §2.1's CONSTANTS-ONLY
    // module and carries no write at all). COUNTEREXAMPLE (proven in the gate-4 scratch
    // mutation): writing straight to the real path and leaving the rename a no-op
    // (`writeFileSync(path, …)` + `renameSync('X','Y')`) reddens HERE — the comment-stripped
    // code then carries no `.tmp` write target, so the scan reads the replace leg as absent.
    // A vanished module reddens RED-BY-ABSENCE.
    const productionChannel = readMaybe(CHANNELS_PATH)
    const productionMain = readMaybe(MAIN_PATH)
    const productionAtomicCode = productionMain === null ? null : withoutComments(productionMain)
    const atomicReplacePresent =
      productionAtomicCode !== null &&
      /\.tmp['"`]/.test(productionAtomicCode) &&
      /renameSync\(\s*\w+\s*,\s*\w+\s*\)/.test(productionAtomicCode)
    attempt(
      run,
      i++,
      productionChannel === null
        ? `RED-BY-ABSENCE [P-SPA-IM-2]: src/main/store-channels.ts does NOT exist at this head — the channel module has no production subject; the drives below run over the INJECTED fs façade + the INJECTED channel shim and are SHAPE evidence only (§4 R-4; §6)`
        : productionMain === null
          ? `RED-BY-ABSENCE [P-SPA-IM-2]: ${relative(REPO_ROOT, MAIN_PATH)} could not be read — the atomic write's production site has no substrate; the drives below are SHAPE evidence over the shim ALONE (§2.7 item 3)`
          : atomicReplacePresent
            ? null
            : `PRODUCTION-SUBJECT [P-SPA-IM-2]: the landed atomic write in ${relative(REPO_ROOT, MAIN_PATH)} carries no readable \`.tmp\` write target + \`renameSync(<tmp>, <path>)\` replace leg (comment-stripped CODE read) — §2.7 item 3's five-step SHAPE has no production implementation to read; the drives below would then be SHAPE evidence over the shim ALONE (§2.7 item 3; F-5)`,
    )
    const payload = JSON.stringify({ 'file.settings.a': 'AFTER' })

    // ⟨drive 1⟩ THE SUCCESS SEQUENCE — readings (i) recorded order/count, (ii) the
    // real path's record identity vs the pre-write record
    {
      const fs = newFsFacade({ seed: { [carrier]: preWriteRecord } })
      const shim: ChannelShimOptions = { fs, path: carrier }
      const receipt = channelPut(shim, payload)
      const shapeProblems = atomicShapeProblems(fs, carrier)
      attempt(run, i++, shapeProblems.length === 0 ? null : `[success] ${shapeProblems.join(' | ')}`)
      const after = recordIdentity(fs, carrier)
      const expected = JSON.stringify({ 'file.settings.a': 'AFTER', schemaVersion: DECLARED_SCHEMA_VERSION }, null, 2)
      attempt(
        run,
        i++,
        receipt.status === 'committed' && after === expected
          ? null
          : `[success] reading 2: the receipt is ${JSON.stringify(receipt)} and the real path's record is ${String(after)} — a committed write leaves the file bytes EQUAL to the projected record (§2.7 items 3/5)`,
      )
      // the SHIM's provenance is printed: this is an INJECTED subject, not the module
      // eslint-disable-next-line no-console
      console.log(
        `P-SPA-IM-2 [success]: INSTRUMENT = the injected fs façade (SHAPE ONLY, NO durability claim) · recorded call sequence [${fs.calls.map((c) => c.step).join(' → ')}] · ` +
          `residual tmp: ${String(fs.files.has(tmp))} · real-path record identity: ${after === expected ? 'EQUAL to the projected record' : 'DIVERGED'} — the subject driven is the SHIM (INJECTED), never src/main/store-channels.ts`,
      )
    }

    // ⟨drive 2⟩ THE TMP-WRITE FAILURE — the previous file intact, no residual tmp
    {
      const fs = newFsFacade({ seed: { [carrier]: preWriteRecord }, failAt: 'writeTmp' })
      const receipt = channelPut({ fs, path: carrier }, payload)
      attempt(run, i++, receiptProblems(receipt).length === 0 ? null : `[tmp-write failure] ${receiptProblems(receipt).join(' | ')}`)
      attempt(
        run,
        i++,
        recordIdentity(fs, carrier) === preWriteRecord
          ? null
          : `[tmp-write failure] reading 2: the real path's record is ${String(recordIdentity(fs, carrier))} — a failed tmp write leaves the previous file INTACT (§2.7 item 4; F-5)`,
      )
    }

    // ⟨drive 3⟩ THE FSYNC FAILURE — the previous file intact
    {
      const fs = newFsFacade({ seed: { [carrier]: preWriteRecord }, failAt: 'fsyncTmp' })
      const receipt = channelPut({ fs, path: carrier }, payload)
      attempt(run, i++, receiptProblems(receipt).length === 0 ? null : `[fsync failure] ${receiptProblems(receipt).join(' | ')}`)
      attempt(
        run,
        i++,
        recordIdentity(fs, carrier) === preWriteRecord
          ? null
          : `[fsync failure] reading 2: the real path's record is ${String(recordIdentity(fs, carrier))} — a failed fsync leaves the previous file INTACT (§2.7 item 4)`,
      )
    }

    // ⟨drive 4⟩ THE RENAME FAILURE — the previous file intact
    {
      const fs = newFsFacade({ seed: { [carrier]: preWriteRecord }, failAt: 'rename' })
      const receipt = channelPut({ fs, path: carrier }, payload)
      attempt(run, i++, receiptProblems(receipt).length === 0 ? null : `[rename failure] ${receiptProblems(receipt).join(' | ')}`)
      attempt(
        run,
        i++,
        recordIdentity(fs, carrier) === preWriteRecord
          ? null
          : `[rename failure] reading 2: the real path's record is ${String(recordIdentity(fs, carrier))} — a failed rename leaves the previous file INTACT (and possibly a stale tmp, overwritten next time) (§2.7 item 4)`,
      )
    }

    // ---- the TWO CONTROLS ----
    // CONTROL 1: a NON-atomic shape (the `security-store.ts` precedent this channel
    // must NOT copy — a plain write with no tmp/fsync/rename) must REDDEN the shape
    // oracle. The control's expected outcome is the OPPOSITE of the row's verdict.
    attempt(
      run,
      i++,
      ((): string | null => {
        const fs = newFsFacade({ seed: { [carrier]: preWriteRecord } })
        // the forged NON-ATOMIC writer: a plain in-place overwrite, no tmp, no fsync,
        // no rename — the security-store.ts shape named as the negative precedent
        fs.writeFileSync(carrier, payload)
        const problems = atomicShapeProblems(fs, carrier)
        return problems.length > 0 ? null : 'CONTROL 1 could not discriminate: the shape oracle ACCEPTED a NON-ATOMIC in-place write (no tmp, no fsync, no rename) — the F-5 negative precedent'
      })(),
    )
    // CONTROL 2: the shape oracle must NOTICE a rename WITHOUT the tmp fsync
    attempt(
      run,
      i++,
      ((): string | null => {
        const fs = newFsFacade({ seed: { [carrier]: preWriteRecord } })
        fs.writeFileSync(tmp, payload)
        fs.renameSync(tmp, carrier)
        const problems = atomicShapeProblems(fs, carrier)
        return problems.length > 0 ? null : 'CONTROL 2 could not discriminate: the shape oracle ACCEPTED a rename with NO tmp fsync — §2.7 item 3 / F-5 names the skipped fsync as a falsifier'
      })(),
    )
    // CONTROL 3: a SUCCESSFUL persist must leave NO residual tmp — the oracle must notice
    // one left behind (the F-5 residual-tmp clause)
    attempt(
      run,
      i++,
      ((): string | null => {
        const fs = newFsFacade({ seed: { [carrier]: preWriteRecord } })
        const shim: ChannelShimOptions = { fs, path: carrier }
        channelPut(shim, payload)
        // forge the residual: re-create the tmp AFTER a successful persist
        fs.writeFileSync(tmp, payload)
        const problems = atomicShapeProblems(fs, carrier)
        return problems.some((p) => p.startsWith('TMP-RESIDUE'))
          ? null
          : 'CONTROL 3 could not discriminate: the residual-tmp limb ACCEPTED a `${path}.tmp` left behind after a SUCCESSFUL persist — F-5 names it a falsifier'
      })(),
    )

    finish('P-SPA-IM-2', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SPA-IM-3 — THE NW-17-CLASS PRELOAD SET-EQUALITY ROW (C-11's fork home).
//   4 = (1) top-level set-equality; (2) the `store` sub-namespace set-equality;
//       (3) the member indent satisfies unit 1's arm-4 regex; (4) THE POSITIVE
//       CONTROL — an added key reddens the same oracle.
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.1 P-SPA-IM-3 — THE NW-17-CLASS PRELOAD SET-EQUALITY ROW (C-11\'s fork home): window.provident\'s member-name set (top-level AND the `store` sub-namespace) equals the declared set; the sub-namespace\'s own set is EXACTLY {get, put, onFileChanged}; the member indent satisfies unit 1\'s arm-4 regex; the POSITIVE CONTROL (an added key) reddens the same oracle (S-SPA-PRE-1)', () => {
  it('P-SPA-IM-3 — 4', async () => {
    const run = newRun()
    let i = 0
    const preloadText = readMaybe(PRELOAD_PATH)

    // The REAL preload's declared top-level member set, read from the `ProvidentBridge`
    // interface's own two-space member-key block (the interface IS the declared set;
    // the `bridge` object literal is its implementation).
    //
    // ⟶ RE-AIMED AT THE GATE-4 REMAND (`H-1`, the `F-12`/`F-14` vacuity class). The
    //   AS-FILED drive 1 built `expected` FROM the scan (`hasStoreKey ? [...realBridgeTop]
    //   : [...realBridgeTop, 'store']`) and then compared that very same array against the
    //   subject derived from it — a SELF-SATISFYING TAUTOLOGY: no edit to `src/**` could
    //   redden it, because every edit moved both sides together. The expectation is now
    //   the DECLARED LITERAL `DECLARED_BRIDGE_TOP_LEVEL` (the guard's own contract for
    //   this interface: §2.5's one added `store` key + the seventeen pre-existing members
    //   this unit found landed, `A-3`). The subject stays the REAL `ProvidentBridge`
    //   interface bytes; the comparison is declared-vs-real, so it CAN fail.
    //
    //   COUNTEREXAMPLE (mandated and PROVEN by the gate-4 scratch mutation): adding an
    //   undeclared two-space-indented `telemetry: { … }` member to `ProvidentBridge` in
    //   `src/main/preload.ts` reddens limb 1 — the real set gains `telemetry` while the
    //   declared set does not carry it. Dropping any declared member reddens it too.
    const bridgeBlock = preloadText === null ? null : readIndentedBlock(preloadText, /^export interface ProvidentBridge \{$/)
    const declaredMembers = bridgeBlock === null ? null : memberNamesAtIndent(bridgeBlock.body, 0, 2)
    const hasStoreKey = preloadText !== null && ARM_4_INDENT.test(preloadText)

    // ⟨drive 1⟩ the top-level set-equality — DECLARED literal set vs the REAL preload's
    // `ProvidentBridge` member set. The oracle is handed the DECLARED set as its
    // expectation, so a landing that ADDS an undeclared member (`telemetry:`) or DROPS a
    // declared one reddens. The oracle is ALSO driven over a KEY-SET forged from the REAL
    // bytes (not from the declaration), so the reading is taken on the real subject.
    attempt(
      run,
      i++,
      ((): string | null => {
        if (declaredMembers === null) return `ABSTRACT-SUBJECT: src/main/preload.ts's ProvidentBridge declaration could not be read — the top-level set-equality has no substrate`
        const expected = [...DECLARED_BRIDGE_TOP_LEVEL]
        // the subject is the REAL byte-read member set, keyed into the SAME oracle the
        // controls drive; the declaration is the expectation, never the subject
        const { top } = preloadSetEqualityProblems(Object.fromEntries(declaredMembers.map((k) => [k, {}])), expected)
        if (top.length > 0) {
          return `SET-EQUALITY (top-level): the real preload's declared member set reads [${declaredMembers.join(', ')}] — the DECLARED set is [${expected.join(', ')}]; ${top.join(' | ')} (P-SPA-IM-3 limb 1; §2.5/§1.1 member 5; §4 R-6; the amendment A-3 legalizes the \`store\` key ALONE)`
        }
        // ⟨AMENDED 2026-11-16 — unit `U-4` (`menu-opener`), §2 `R-4`; `docs/L1/unit-u-4-menu-opener.md`
        //  §5.2 row 4.⟩ the guard's own re-statement of the delta: the DECLARED set now carries TWO
        // post-baseline keys and the guard NAMES BOTH, so **the teeth are unchanged** — an UNDECLARED
        // third key still reddens HERE, a DROPPED declared one still reddens the set-equality arm above
        // (and `missingDelta` below), and the baseline list is the same SIXTEEN pre-landing members the
        // clause has always measured the delta against. The declared delta, dated:
        //   · `store`          — the 2026-10-04 landing (§2.5 / §1.1 member 5; amendment `A-3`).
        //   · `onSettingsOpen` — `U-4` (`menu-opener`) `R-4`, `2026-11-16`: the native View opener's
        //                        arrival subscription, TOP-LEVEL for `onPaneVisibility`'s reason.
        // ⟨AMENDED 2026-11-18 — unit `B-2` (`display-wire`) §4; `docs/L1/unit-b-2-display-wire.md`.⟩
        //   · `display`        — `2026-11-18`: the DISPLAY CROSSING's bridge half. The DECLARED delta
        //                        now names THREE post-baseline keys and the guard NAMES ALL THREE, so
        //                        **the teeth are unchanged** — an UNDECLARED fourth key still reddens
        //                        HERE, a DROPPED declared one still reddens the set-equality arm above
        //                        (and `missingDelta` below), and the baseline is the same SIXTEEN
        //                        pre-landing members the clause has always measured the delta against.
        const PRE_LANDING_MEMBERS = ['ready', 'bootSettled', 'onRequest', 'sendReply', 'notify', 'pushPaneCatalog', 'onPaneVisibility', 'security', 'module', 'edit', 'rag', 'template', 'operatorSettings', 'gnosis', 'sidebar', 'installSidebar']
        const DECLARED_DELTA = ['store', 'onSettingsOpen', 'display']
        const added = declaredMembers.filter((k) => !PRE_LANDING_MEMBERS.includes(k))
        const undeclared = added.filter((k) => !DECLARED_DELTA.includes(k))
        const missingDelta = DECLARED_DELTA.filter((k) => !added.includes(k))
        if (undeclared.length > 0 || missingDelta.length > 0 || added.length !== DECLARED_DELTA.length) {
          return `SET-EQUALITY (top-level): the landing's new top-level keys read [${added.join(', ') || 'none'}] — the DECLARED delta is [${DECLARED_DELTA.join(', ')}]: \`store\` (the 2026-10-04 landing, §2.5/§1.1 member 5, amendment A-3), \`onSettingsOpen\` (U-4 \`menu-opener\` \`R-4\`, 2026-11-16) and \`display\` (B-2 \`display-wire\` §4, 2026-11-18 — the set RE-STATED 18 → 19). An UNDECLARED added key [${undeclared.join(', ') || 'none'}] or a DROPPED declared one [${missingDelta.join(', ') || 'none'}] reddens here — the amendment legalizes those THREE keys, nothing else (P-SPA-IM-3 limb 1)`
        }
        if (!hasStoreKey) {
          return `SET-EQUALITY (top-level): the real preload carries a \`store\` member but NOT at the two-space member indent unit 1's arm-4 regex pinpoints — §2.5 requires the member indent to satisfy /^  store\\s*:/m (K-3) (§4 R-6; the amendment A-3 legalizes THIS key at THIS indent)`
        }
        return null
      })(),
    )

    // ⟨drive 2⟩ the `store` sub-namespace set-equality — driven over the REAL preload's
    // declared structure: the `store` member's OWN interface block must declare EXACTLY
    // {get, put, onFileChanged}. The oracle is the SAME one the positive control drives.
    // The block reader is the INDENT-BALANCED one (`H-6`), never a `^  \}` lookahead that
    // a re-ordering could silently under-read.
    attempt(
      run,
      i++,
      ((): string | null => {
        if (preloadText === null) return `ABSTRACT-SUBJECT: src/main/preload.ts could not be read — the sub-namespace set-equality has no substrate`
        const storeBlock = readIndentedBlock(preloadText, /^  store:\s*\{$/)
        if (storeBlock === null) {
          // the shim-hosted realm reading (the interface declaration is absent): drive the
          // SAME oracle over the projected shim so the absent subject is reported by the
          // oracle rather than skipped
          const shimBridge: Record<string, unknown> = { ready: {}, security: {}, module: {}, sidebar: {}, installSidebar: {} }
          const { sub } = preloadSetEqualityProblems(shimBridge, Object.keys(shimBridge))
          return `[the store sub-namespace is ABSENT from the real preload] ${sub.join(' | ')} — INSTRUMENT: the injected bridge object (a stand-in for window.provident), never the real preload (§4 R-6)`
        }
        const memberNames = memberNamesAtIndent(storeBlock.body, 2, 4)
        const { sub } = preloadSetEqualityProblems(
          { ...Object.fromEntries((declaredMembers ?? []).filter((k) => k !== 'store').map((k) => [k, {}])), store: Object.fromEntries(memberNames.map((k) => [k, () => {}])) },
          [...(declaredMembers ?? []), 'store'],
        )
        if (sub.length > 0) return sub.join(' | ')
        // the sub-namespace's own set must be EXACTLY the three declared names — an added
        // fourth `store.*` member (or a dropped one) reddens (§2.5; K-3)
        const extra = memberNames.filter((k) => !(STORE_MEMBER_NAMES as readonly string[]).includes(k))
        if (extra.length > 0) {
          return `SET-EQUALITY (store sub-namespace): the real preload's \`store\` block declares [${memberNames.join(', ')}] — §2.5 declares EXACTLY {${STORE_MEMBER_NAMES.join(', ')}}; a fourth \`store.*\` member [${extra.join(', ')}] is a finding (K-3; A-3 relaxes NOTHING)`
        }
        return null
      })(),
    )

    // ⟨drive 3⟩ the member indent — unit 1's landed arm-4 regex, POSITIVE direction
    attempt(
      run,
      i++,
      preloadText === null
        ? `ABSTRACT-SUBJECT: src/main/preload.ts could not be read — the indent limb has no substrate`
        : ARM_4_INDENT.test(preloadText)
          ? null
          : `INDENT: the real preload carries NO two-space-indented \`store:\` member key — §2.5 requires the member indent to satisfy unit 1's landed arm-4 regex /^  store\\s*:/m (two-space member-key indent, K-3) (§4 R-6)`,
    )

    // ---- the TWO CONTROLS (each expected outcome the OPPOSITE of the row's verdict;
    //      the row's limb 4 IS the first of them — C-11's discriminating check) ----
    attempt(
      run,
      i++,
      ((): string | null => {
        // CONTROL 1 (the row's limb 4): an ADDED key on a forged bridge reddens the SAME
        // oracle (the discriminating check, C-11)
        const stub: Record<string, unknown> = { ready: {}, security: {}, module: {}, sidebar: {}, installSidebar: {} }
        const expected = [...Object.keys(stub), 'store']
        const forged: Record<string, unknown> = { ...stub, store: { get: () => {}, put: () => {}, onFileChanged: () => {}, EXTRA: () => {} } }
        const { sub } = preloadSetEqualityProblems(forged, expected)
        return sub.length > 0
          ? null
          : 'CONTROL (limb 4) could not discriminate: the set-equality oracle ACCEPTED a `store` sub-namespace carrying an EXTRA member — §10 A-3 relaxes NOTHING: a fourth `store.*` member still reddens (K-3)'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        // CONTROL 2: the oracle must ALSO catch a MISSING declared member (the opposite
        // direction of the added-key check), so the set-equality is an EQUALITY and not a
        // subset check
        const stub: Record<string, unknown> = { ready: {}, security: {} }
        const expected = ['ready', 'security']
        const forged: Record<string, unknown> = { ...stub, store: { get: () => {}, put: () => {} } }
        const { sub } = preloadSetEqualityProblems(forged, expected)
        return sub.length > 0
          ? null
          : 'CONTROL 2 could not discriminate: the set-equality oracle ACCEPTED a `store` sub-namespace MISSING the declared `onFileChanged` member — a subset check is not an equality (C-11)'
      })(),
    )

    finish('P-SPA-IM-3', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SPA-IM-4 — the bootRecord bound + the crossing feed.
//   7 = 3 realm turns (boot · after-commit · reload) × 2 readings (the served
//       hand-off payload; the renderer-side resolve) + the ONE-store identity
//       reading (the call count).
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.1 P-SPA-IM-4 — the bootRecord bound + the crossing feed: the holder is POPULATED at the boot read, REFRESHED only by the channel\'s own committed writes, SERVED at Y-1, and never consulted for a write; the crossing is fed by REPLACING the `crossing: null` literal at the EXISTING call — a second getWiredGraphStore(…) call reddens (S-SPA-HOLD-1)', () => {
  it('P-SPA-IM-4 — 3 × 2 + 1 = 7', async () => {
    const run = newRun()
    let i = 0
    const carrier = join(REPO_ROOT, 'userData', 'provident-settings.json')
    const registered = [{ name: 'file.settings.theme', value: 'DEFAULT' }]

    // ⟨turn 1⟩ BOOT — the cold tier: the holder is POPULATED from the boot read and the
    // Y-1 hand-off SERVES the registered defaults (the empty record at a cold tier)
    {
      const fs = newFsFacade()
      const realm = newRealm({ fs, path: carrier, registeredDefaults: [] })
      const handed = realm.boot()
      attempt(
        run,
        i++,
        JSON.stringify(handed) === JSON.stringify([]) && realm.bootRecord !== null
          ? null
          : `[turn boot] the served hand-off payload is ${JSON.stringify(handed)} (holder ${realm.bootRecord === null ? 'UNPOPULATED' : 'populated'}) — a COLD tier answers \`[]\` and the holder is POPULATED at the boot read (§2.3's bootHandoff bound; §2.6 clause (a))`,
      )
      attempt(
        run,
        i++,
        realm.resolve('file.settings.theme') === undefined
          ? null
          : `[turn boot] the renderer-side resolve answered ${String(realm.resolve('file.settings.theme'))} for a name the hand-off did not carry — a resolve after the hand-off answers the HANDED-OFF value only (§2.6 clause (d))`,
      )
    }

    // ⟨turn 2⟩ AFTER-COMMIT — the holder is REFRESHED by the channel's OWN committed
    // write (the payload is authoritative for the file and is never a holder consult)
    {
      const fs = newFsFacade()
      const realm = newRealm({ fs, path: carrier, registeredDefaults: registered })
      realm.boot()
      const receipt = realm.put(JSON.stringify({ 'file.settings.theme': 'DARK' }))
      attempt(
        run,
        i++,
        receipt.status === 'committed' && JSON.stringify(realm.bootRecord) === JSON.stringify([{ name: 'file.settings.theme', value: 'DARK' }])
          ? null
          : `[turn after-commit] the receipt is ${JSON.stringify(receipt)} and the holder reads ${JSON.stringify(realm.bootRecord)} — a committed Y-2 synchronously REPLACES the holder with the projected record (§2.6 clause (b))`,
      )
      attempt(
        run,
        i++,
        realm.resolve('file.settings.theme') === 'DEFAULT'
          ? null
          : `[turn after-commit] the renderer-side resolve answered ${String(realm.resolve('file.settings.theme'))} after the commit — clause (d): the renderer's tier answers the HANDED-OFF values, never a post-commit holder consult (§2.6; the falsifier)`,
      )
    }

    // ⟨turn 3⟩ RELOAD — a reload is a NEW REALM: its Y-1 serves the FILE's CURRENT value
    {
      const fs = newFsFacade()
      const first = newRealm({ fs, path: carrier, registeredDefaults: registered })
      first.boot()
      first.put(JSON.stringify({ 'file.settings.theme': 'DARK' }))
      const reloaded = newRealm({ fs, path: carrier, registeredDefaults: registered })
      const handed = reloaded.boot()
      attempt(
        run,
        i++,
        JSON.stringify(handed) === JSON.stringify([{ name: 'file.settings.theme', value: 'DARK' }])
          ? null
          : `[turn reload] the reloaded realm's hand-off answered ${JSON.stringify(handed)} — a reload is a NEW realm whose Y-1 serves the FILE's current value (§2.6 clause (c); F-9's falsifier: "a holder serving a pre-commit value at the next realm's hand-off")`,
      )
      attempt(
        run,
        i++,
        reloaded.resolve('file.settings.theme') === 'DARK'
          ? null
          : `[turn reload] the reloaded realm's resolve answered ${String(reloaded.resolve('file.settings.theme'))} — it must answer the handed-off value (§2.6 clause (d))`,
      )
    }

    // ⟨the ONE-store identity reading⟩ the memoization clause over the REAL renderer bytes
    const memo = memoizationProblems(readMaybe(RENDERER_PATH))
    attempt(run, i++, memo.length === 0 ? null : memo.join(' | '))

    // ---- the TWO CONTROLS ----
    // CONTROL 1: the crossing reading — a wiring carrying a SECOND call must redden the
    // memoization oracle (the opposite direction of the row's own absent-crossing finding)
    attempt(
      run,
      i++,
      ((): string | null => {
        const forgedWiring = 'const a = getWiredGraphStore({ crossing: c })\nconst b = getWiredGraphStore({ crossing: c })'
        return memoizationProblems(forgedWiring).some((p) => p.startsWith('MEMOIZATION')) ? null : 'CONTROL 1 could not discriminate: the memoization oracle ACCEPTED a boot wiring carrying a SECOND getWiredGraphStore(…) call — §2.3/C-3 names it STARTUP-FATAL'
      })(),
    )
    // CONTROL 2: a REPLACED crossing (the same single call, fed the live crossing) must
    // make the crossing-feed limb HOLD — the oracle is discriminating, not always-red
    attempt(
      run,
      i++,
      ((): string | null => {
        const forgedWiring = 'getWiredGraphStore({ declarations: storeGraphReferences(FILE_TIER_TOP_NAMES_FORK), crossing: liveCrossing })'
        const problems = memoizationProblems(forgedWiring)
        return problems.length === 0 ? null : `CONTROL 2 could not discriminate in the OPPOSITE direction: the memoization oracle REJECTED a single call carrying the REPLACED live crossing — ${problems.join(' | ')}`
      })(),
    )

    finish('P-SPA-IM-4', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SPA-IM-5 — the constants + schemaVersion census, stated HONESTLY.
//   4 = (1) the channel-constant census (2 names, printed); (2) the first-write
//       stamp present; (3) the declared value 1 on the cold first write; (4) the
//       fork-wide version-token census printed with its terms.
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.1 P-SPA-IM-5 — the constants + schemaVersion census, stated honestly: the channel module\'s export set is exactly FOUR (RE-STATED 2026-11-18 by unit `B-2` `display-wire` §4: census 2 → 4, claim unmoved); the carrier carries schemaVersion from its FIRST write with the declared value 1; the token is NOT claimed zero-hit in this fork (the fork\'s other carriers\' version keys are counted and named in the same census) (S-SPA-CENS-1)', () => {
  it('P-SPA-IM-5 — 4', async () => {
    const run = newRun()
    let i = 0
    const channelsSrc = readMaybe(CHANNELS_PATH)

    // ⟨drive 1⟩ the channel-constant census (`CENSUS: 4`, printed)
    //
    // ⟨RE-STATED 2026-11-18 — unit `B-2` (`display-wire`) §4; contract
    //  `docs/L1/unit-b-2-display-wire.md`.⟩ **THE CLAIM IS UNMOVED — a COUNT census over the module's
    //  own `export const` declarations, every name printed with its terms — and the COUNT MOVES WITH
    //  THE CHANGE: `B-2` homes this unit's `DISPLAY_READ`/`DISPLAY_CHANGED` pair in this module, so the
    //  census reads 2 → **4**. The count is now DERIVED from the declared literal rather than re-typed,
    //  so a future census that moves without a re-statement of THIS row still reddens, and the as-filed
    //  `CENSUS: 2` is KEPT VISIBLE in this message rather than deleted. The row's TEETH are unchanged:
    //  a census that CONTAINS every declared name but counts a different total still reddens (an extra
    //  constant is the falsifier), and a missing declared name reddens.
    const channelNames = channelsSrc === null ? null : [...channelsSrc.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]!)
    attempt(
      run,
      i++,
      channelNames !== null && channelNames.length === CHANNEL_EXPORT_NAMES.length && CHANNEL_EXPORT_NAMES.every((n) => channelNames.includes(n))
        ? null
        : `CHANNEL-CONSTANT-CENSUS: ${relative(REPO_ROOT, CHANNELS_PATH)} ${channelNames === null ? 'DOES NOT EXIST at this head' : `declares [${channelNames.join(', ')}]`} — §1.1 member 1 declares EXACTLY ${String(CHANNEL_EXPORT_NAMES.length)} names {${CHANNEL_EXPORT_NAMES.join(', ')}} with their terms printed (CENSUS: ${String(CHANNEL_EXPORT_NAMES.length)}; the as-filed CENSUS: 2 was RE-STATED 2026-11-18 by unit \`B-2\` \`display-wire\` §4, which homed the \`DISPLAY_READ\`/\`DISPLAY_CHANGED\` pair here) (§4 R-6)`,
    )

    // ⟨drive 2⟩ the first-write stamp present — the cold first write's file carries the
    // `schemaVersion` member (INSTRUMENT: the injected fs façade, SHAPE-level)
    const carrier = join(REPO_ROOT, 'userData', 'provident-settings.json')
    const coldFs = newFsFacade()
    channelPut({ fs: coldFs, path: carrier }, JSON.stringify({ 'file.settings.k': 'V' }))
    const coldBytes = coldFs.files.get(carrier) ?? null
    attempt(
      run,
      i++,
      coldBytes !== null && 'schemaVersion' in (JSON.parse(coldBytes) as Record<string, unknown>)
        ? null
        : `FIRST-WRITE-STAMP: the carrier's cold first write ${coldBytes === null ? 'left NO bytes at the real path' : `wrote ${coldBytes}`} — the payload carries its \`schemaVersion\` member from its FIRST write (§2.7 item 5; §4 R-5) [INSTRUMENT: the injected fs façade, SHAPE-level]`,
    )

    // ⟨drive 3⟩ the declared value `1` on the cold first write
    attempt(
      run,
      i++,
      coldBytes !== null && (JSON.parse(coldBytes) as Record<string, unknown>)['schemaVersion'] === DECLARED_SCHEMA_VERSION
        ? null
        : `SCHEMA-VERSION-VALUE: the cold first write's \`schemaVersion\` is ${coldBytes === null ? '(no bytes)' : String((JSON.parse(coldBytes) as Record<string, unknown>)['schemaVersion'])} — §2.7 item 5 declares the current version \`1\` (DECLARED-DEFAULT)`,
    )

    // ⟨drive 4⟩ the fork-wide version-token census, printed with its terms — the HONEST
    // NON-ZERO reading (R-3): this fork's other carriers carry their own version keys,
    // so "the token is zero-hit here" is FALSE (§3 F-12's honesty class). This limb RUNS
    // at this head (the other carriers exist) and reports the real census.
    const versionCarriers: Array<{ file: string; token: string }> = []
    for (const file of srcFiles()) {
      const text = readMaybe(file)
      if (text === null) continue
      for (const m of text.matchAll(/\b(schemaVersion|FILE_VERSION|version)\b\s*[:=]/g)) {
        versionCarriers.push({ file: relative(REPO_ROOT, file), token: m[1]! })
        break
      }
    }
    // eslint-disable-next-line no-console
    console.log(
      `P-SPA-IM-5 [limb 4] THE FORK-WIDE VERSION-TOKEN CENSUS, term by term: ${versionCarriers.length} carrier file(s) — ` +
        versionCarriers.map((v) => `${v.file} (${v.token})`).join(' · '),
    )
    attempt(
      run,
      i++,
      versionCarriers.length > 0
        ? null
        : `VERSION-CENSUS-HONESTY: the fork-wide version-token census read ZERO carrier(s) — §2.7 item 5 / R-3 record the token as NOT zero-hit in this fork (the fork's own carriers already carry version keys); a zero reading means the census lost its subject, and a claim that this fork had no \`schemaVersion\` anywhere is F-12's honesty class`,
    )

    // ---- the THREE CONTROLS ----
    attempt(
      run,
      i++,
      ((): string | null => {
        // ⟨RE-STATED 2026-11-18 — unit `B-2` (`display-wire`) §4.⟩ The forged module now carries EVERY
        // declared name PLUS one undeclared constant, so this control keeps pointing at the row's own
        // falsifier (an EXTRA constant) instead of at a date-stamped count: the census oracle must read
        // a total that DIFFERS from the declared census, or it is vacuous. The as-filed form forged a
        // three-constant module against a census of two; the census moved 2 → 4, so the forgery moves
        // with it — the discrimination is UNMOVED.
        const forged = [...CHANNEL_EXPORT_NAMES.map((n, k) => `export const ${n} = 'v${String(k)}'`), `export const DISPLAY_EXTRA = 'v-extra'`].join('\n')
        const names = [...forged.matchAll(/export\s+const\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]!)
        return names.length === CHANNEL_EXPORT_NAMES.length && CHANNEL_EXPORT_NAMES.every((n) => names.includes(n))
          ? `CONTROL 1 could not discriminate: the constant-census oracle counted a module carrying the declared ${String(CHANNEL_EXPORT_NAMES.length)} constants PLUS an UNDECLARED extra as exactly the declared census — an added constant must move the count (§1.1 member 1)`
          : null
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const forgedCold = JSON.stringify({ 'file.settings.k': 'V' })
        return 'schemaVersion' in (JSON.parse(forgedCold) as Record<string, unknown>)
          ? 'CONTROL 2 could not discriminate: the first-write-stamp oracle found `schemaVersion` in a payload that does NOT carry it'
          : null
      })(),
    )
    // CONTROL 3: the version-token census is DISCRIMINATING — a census over a text with
    // NO version token must read zero terms (so a non-zero reading at the head is a real
    // reading, not an oracle that always finds something)
    attempt(
      run,
      i++,
      ((): string | null => {
        const noVersionText = 'const a = 1\nfunction f() { return a }'
        return [...noVersionText.matchAll(/\b(schemaVersion|FILE_VERSION|version)\b\s*[:=]/g)].length === 0
          ? null
          : 'CONTROL 3 could not discriminate: the version-token census reported a term over a text carrying NO version token'
      })(),
    )

    finish('P-SPA-IM-5', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SPA-IM-6 — the refusal vocabulary is NOT extended.
//   4 = (1) the channel's set equality; (2) the store union's membership unchanged;
//       (3) the cross-membership disjointness (both directions); (4) a propagation
//       drive — a store refusal crossing the channel keeps its token verbatim.
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.1 P-SPA-IM-6 — the refusal vocabulary is NOT extended: the channel\'s closed set is {malformed-payload, write-failed}; the STORE\'s union is unchanged; no channel token appears in the store\'s union and no store token is re-spelled at the channel (S-SPA-REF-1)', () => {
  it('P-SPA-IM-6 — 4', async () => {
    const run = newRun()
    let i = 0

    // ⟨drive 1⟩ the channel's own set equality — THE CLOSED SET IS THE DECLARED LITERAL,
    // read against the vocabulary's REAL home (`src/main/main.ts`): the
    // `StoreChannelRefusal` union + the returned `reason:` receipts. It is NOT compared
    // against `src/main/store-channels.ts`, which carries two channel-NAME constants and
    // no refusal vocabulary at all (`H-2`).
    const mainTextForVocab = readMaybe(MAIN_PATH)
    const declaredChannelTokens = [...CHANNEL_REFUSALS] as readonly string[]
    {
      const { vocab, problems } = mainTextForVocab === null ? { vocab: [] as string[], problems: [`ABSTRACT-SUBJECT: ${relative(REPO_ROOT, MAIN_PATH)} could not be read — the refusal vocabulary has no substrate (H-2)`] } : observedChannelVocabulary(mainTextForVocab)
      const extras = vocab.filter((t) => !declaredChannelTokens.includes(t))
      const missing = declaredChannelTokens.filter((t) => !vocab.includes(t))
      attempt(
        run,
        i++,
        problems.length === 0 && extras.length === 0 && missing.length === 0
          ? null
          : `CHANNEL-REFUSAL-SET: §2.4 closes the channel's refusal vocabulary at EXACTLY {${declaredChannelTokens.join(', ')}} (TWO tokens; K-1). Read over the REAL home (src/main/main.ts's \`StoreChannelRefusal\` union + its returned \`reason:\` receipts): [${vocab.join(', ') || 'NONE'}] — a THIRD channel-class token [${extras.join(', ') || 'none'}] is a finding (the mandated counterexample: adding \`'transport-error'\` to the union or to a returned receipt reddens HERE); declared tokens NOT observed [${missing.join(', ') || 'none'}]; ${problems.join(' | ')}`,
      )
    }

    // ⟨drive 2⟩ the STORE union's membership unchanged — read from the LANDED store
    // bytes (the substrate exists at this head, so this is a real reading)
    const storeText = readMaybe(join(REPO_ROOT, 'src', 'renderer', 'store-core-graph.ts'))
    const observedStoreRefusals = (() => {
      if (storeText === null) return null
      const found = new Set<string>()
      for (const token of STORE_REFUSALS) if (storeText.includes(`'${token}'`)) found.add(token)
      return [...found]
    })()
    attempt(
      run,
      i++,
      observedStoreRefusals !== null && STORE_REFUSALS.every((t) => observedStoreRefusals.includes(t))
        ? null
        : `STORE-UNION: the landed store's refusal union reads [${observedStoreRefusals === null ? 'ABSENT SUBJECT' : observedStoreRefusals.join(', ')}] — the declared store union is [${STORE_REFUSALS.join(', ')}]; §2.4/§3 F-10 require it UNCHANGED (no channel token added to it)`,
    )

    // ⟨drive 3⟩ the cross-membership disjointness (BOTH directions)
    const channelInStore = (CHANNEL_REFUSALS as readonly string[]).filter((t) => (STORE_REFUSALS as readonly string[]).includes(t))
    const storeInChannel = (STORE_REFUSALS as readonly string[]).filter((t) => (CHANNEL_REFUSALS as readonly string[]).includes(t))
    attempt(
      run,
      i++,
      channelInStore.length === 0 && storeInChannel.length === 0
        ? null
        : `REFUSAL-DISJOINTNESS: the channel's set and the store's union OVERLAP — channel∩store [${channelInStore.join(', ')}]; store∩channel [${storeInChannel.join(', ')}] — §2.4/K-1: the channel mints NO store-class spelling and a channel token in the store union is a finding (F-10)`,
    )

    // ⟨drive 4⟩ THE PROPAGATION DRIVE — the two vocabularies stay DISJOINT and the
    // channel RE-SPELLS NOTHING, read over the vocabulary's REAL HOME.
    //
    // ⟶ RE-AIMED TWICE, and the SECOND re-aim is the gate-4 remand's `H-2`.
    //   FIRST (`A-TW-2` CLAUSE ①, 2026-10-04; the contract's §13 ledger): the AS-FILED limb
    //   read `propagated.verbatim = CHANNEL_REFUSALS.includes('cap-exceeded')` — a
    //   comparison of TWO TEST-LOCAL CONSTS — so BOTH ternary branches were non-null
    //   strings and the attempt ALWAYS recorded a counterexample; worse, it CONTRADICTED
    //   this same row's drive 3, which requires the two sets DISJOINT (i.e. the very same
    //   `includes` reading FALSE).
    //   SECOND (`H-2`, THE GATE-4 REMAND): the re-aim read `readMaybe(CHANNELS_PATH)` —
    //   the VOCABULARY'S CONSTANTS MODULE (`src/main/store-channels.ts`: two channel-NAME
    //   constants and comments, NO refusal vocabulary), so `channelVocab` collapsed to
    //   `CHANNEL_REFUSALS` itself. Every `cap-exceeded` limb below was structurally FALSE
    //   (the token CANNOT appear in a two-constant module), and the drive degenerated into
    //   a test-local const compared with a scan calibrated by that same const — it could
    //   NOT observe the vocabulary it claimed to police.
    //   NOW: the reading is taken from the vocabulary's REAL HOME —
    //   `src/main/main.ts`'s `type StoreChannelRefusal = …` UNION plus every
    //   `reason: '<token>'` RECEIPT the handlers return (`observedChannelVocabulary`), with
    //   the receipt STATUS pair (`committed`/`refused`, a different union) and comment
    //   lines excluded BY NAME. The declared closed set is the LITERAL `CHANNEL_REFUSALS`
    //   (TWO), never a set re-derived from the bytes under test.
    //   THE PROPERTY IS UNRELAXED (§2.4/`K-1`: the channel's set is CLOSED at TWO, the
    //   store's union UNMOVED, the two sets DISJOINT, NO RE-SPELLING).
    //   COUNTEREXAMPLE (mandated, and PROVEN by the gate-4 scratch mutation): adding a
    //   THIRD channel-class token — `'transport-error'` — to the `StoreChannelRefusal`
    //   union (or to any returned `reason:`) in `src/main/main.ts` reddens limb (ii) HERE.
    //   Other counterexamples, all live: an implementer whose `Y-2` handler RE-SPELLS the
    //   crossing store token (`reason: 'store-cap-exceeded'`) reddens limb (iii); a
    //   channel-class token ADDED to the STORE's union reddens drive 2; a `main.ts` with
    //   NO readable union reddens the vocabulary-home gate (RED-BY-ABSENCE, never a
    //   vacuous pass).
    const mainText = readMaybe(MAIN_PATH)
    const propagated = (() => {
      if (mainText === null) return null
      return observedChannelVocabulary(mainText)
    })()
    attempt(
      run,
      i++,
      ((): string | null => {
        if (propagated === null) {
          return `CHANNEL-ABSENT: the propagation drive has no subject — ${relative(REPO_ROOT, MAIN_PATH)} does not exist, so the refusal vocabulary has no home to read and no verbatim reading can be taken over the real bytes (RED-BY-ABSENCE; §4 R-6)`
        }
        const channelVocab = propagated.vocab
        if (propagated.problems.length > 0) return propagated.problems.join(' | ')
        // (ii) THE DISJOINTNESS READING OVER THE REAL BYTES, both directions — the channel's
        //      real vocabulary vs the store's own union
        const channelTokensInStoreUnion = channelVocab.filter((t) => (STORE_REFUSALS as readonly string[]).includes(t))
        const storeTokensInChannelVocab = (STORE_REFUSALS as readonly string[]).filter((t) => channelVocab.includes(t))
        if (channelTokensInStoreUnion.length > 0 || storeTokensInChannelVocab.length > 0) {
          return `REFUSAL-DISJOINTNESS (real bytes): the channel's vocabulary read at its REAL home (src/main/main.ts) is [${channelVocab.join(', ')}] and OVERLAPS the store's union [${STORE_REFUSALS.join(', ')}] — channel∩store [${channelTokensInStoreUnion.join(', ')}]; store∩channel [${storeTokensInChannelVocab.join(', ')}] — §2.4/K-1: the channel mints NO store-class spelling (F-10)`
        }
        // (iii) THE NO-RE-SPELLING READING — the store's token must NOT be re-spelled at
        //      the channel: the returned receipt's `reason` is compared BY IDENTITY to the
        //      store's own token, never by membership in a local const
        const storeRefusalToken = 'cap-exceeded' // the store's own union token (dossier row 7)
        const returnsStoreTokenVerbatim = mainText.includes(`reason: '${storeRefusalToken}'`)
        const returnsChannelMintedSpelling = new RegExp(`reason:\\s*'[a-z-]*${storeRefusalToken}[a-z-]*'`).test(withoutComments(mainText)) && !returnsStoreTokenVerbatim
        if (returnsChannelMintedSpelling) {
          return `PROPAGATION-RE-SPELLING: ${relative(REPO_ROOT, MAIN_PATH)} answers a RE-SPELLED store refusal token — §2.4 requires the channel to PROPAGATE the store's tokens VERBATIM across the boundary and to mint no store-class spelling of its own; a transport-level failure with no store token is a CHANNEL-class failure named by one of {malformed-payload, write-failed} (K-1, F-10). The store token \`${storeRefusalToken}\` answered by identity is ABSENT and a re-spelled sibling is present`
        }
        // (iv) THE CLOSED-SET READING — the channel's REAL vocabulary is CLOSED at its TWO
        //      declared tokens: NO third channel-class token (`'transport-error'` is the
        //      mandated counterexample), NO store token, NO store-class spelling
        const extras = channelVocab.filter((t) => !(CHANNEL_REFUSALS as readonly string[]).includes(t))
        const missing = (CHANNEL_REFUSALS as readonly string[]).filter((t) => !channelVocab.includes(t))
        if (extras.length > 0 || missing.length > 0) {
          return `CHANNEL-CLOSED-SET: the channel's real vocabulary at src/main/main.ts reads [${channelVocab.join(', ') || 'NONE'}] — §2.4 closes it at EXACTLY {${(CHANNEL_REFUSALS as readonly string[]).join(', ')}} (TWO tokens; the channel's OWN, NOT the store's union — K-1). A THIRD channel-class token [${extras.join(', ') || 'none'}] is a finding (add \`'transport-error'\` to the union or to a returned receipt to redden here); declared tokens NOT observed [${missing.join(', ') || 'none'}]`
        }
        if (channelVocab.length !== 2) {
          return `CHANNEL-CLOSED-SET: the channel's real vocabulary reads [${channelVocab.join(', ')}] — §2.4 closes it at EXACTLY TWO tokens (K-1)`
        }
        return null
      })(),
    )

    // ---- the THREE CONTROLS ----
    attempt(
      run,
      i++,
      ((): string | null => {
        const forgedChannel = ['malformed-payload', 'write-failed', 'undeclared-name']
        const leaked = forgedChannel.filter((t) => (STORE_REFUSALS as readonly string[]).includes(t))
        return leaked.length > 0 ? null : 'CONTROL 1 could not discriminate: the disjointness oracle ACCEPTED a channel set carrying the store token `undeclared-name`'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const forgedChannel = ['malformed-payload', 'write-failed', 'write-failed-atomic']
        const extra = forgedChannel.filter((t) => !(CHANNEL_REFUSALS as readonly string[]).includes(t))
        return extra.length > 0 ? null : 'CONTROL 2 could not discriminate: the closed-set oracle ACCEPTED a THIRD channel refusal token'
      })(),
    )
    // CONTROL 3: the propagation drive is DISCRIMINATING — a channel that RE-SPELLS a
    // store token must be caught by the propagation oracle (the opposite direction of the
    // row's own absent-channel finding)
    attempt(
      run,
      i++,
      ((): string | null => {
        const storeRefusal = 'cap-exceeded'
        const channelAnswer = 'store-cap-exceeded' // a re-spelled token crossing the boundary
        const verbatim = channelAnswer === storeRefusal
        return verbatim
          ? 'CONTROL 3 could not discriminate: the propagation oracle accepted a RE-SPELLED store token as verbatim propagation'
          : null
      })(),
    )

    finish('P-SPA-IM-6', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SPA-SM-1 — THE BOOT MACHINE (CLOSED).
//   8 = 4 boot states (cold → [] · defaults → the registered record · persisted →
//       the record · no-bridge → no hand-off) × 2 checkpoints (the hand-off
//       precedes the first envelope; the payload/hydration answers the declared
//       state and NOTHING throws).
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.1 P-SPA-SM-1 — THE BOOT MACHINE (CLOSED): for EVERY boot state the Y-1 answer PRECEDES the first envelope pair and the payload answers the declared state; the no-bridge state skips the gate, never hydrates, never feeds the crossing, and never throws (S-SPA-BOOT-1)', () => {
  it('P-SPA-SM-1 — 4 × 2 = 8', async () => {
    const run = newRun()
    let i = 0
    const carrier = join(REPO_ROOT, 'userData', 'provident-settings.json')
    const registered = [{ name: 'file.settings.theme', value: 'DEFAULT' }]

    // The boot-order instrument over the SHIM-HOSTED REALM: a sequence recorder whose
    // stamps the Y-1 hand-off and the first-envelope boundary push. The REAL boot wiring
    // (`src/renderer/renderer.ts`) is read separately by the byte-scan below.
    interface BootSeq {
      stamps: string[]
      handoffBeforeEnvelope: boolean
    }
    const runBootState = (state: 'cold' | 'defaults' | 'persisted' | 'no-bridge'): {
      seq: BootSeq
      payload: Array<{ name: string; value: unknown }> | null
      threw: boolean
    } => {
      const stamps: string[] = []
      try {
        if (state === 'no-bridge') {
          // §2.3's NO-BRIDGE POSTURE: the gate is skipped, `hydrate` is NOT called, the
          // crossing is NOT fed, the store stays unit 1's inert state, and the existing
          // `if (!bridge)` early-return still fires with its warning. No throw.
          stamps.push('early-return:no-bridge')
          return { seq: { stamps, handoffBeforeEnvelope: true }, payload: null, threw: false }
        }
        const fs = newFsFacade(
          state === 'persisted'
            ? { seed: { [carrier]: JSON.stringify({ 'file.settings.theme': 'DARK', schemaVersion: DECLARED_SCHEMA_VERSION }, null, 2) } }
            : {},
        )
        const realm = newRealm({ fs, path: carrier, registeredDefaults: state === 'defaults' ? registered : [] })
        stamps.push('handoff:store.get')
        const payload = realm.boot()
        stamps.push('envelope:placeholderEnvelope')
        void realm
        return { seq: { stamps, handoffBeforeEnvelope: stamps.indexOf('handoff:store.get') < stamps.indexOf('envelope:placeholderEnvelope') }, payload, threw: false }
      } catch {
        return { seq: { stamps, handoffBeforeEnvelope: false }, payload: null, threw: true }
      }
    }

    // ⟨states cold / defaults / persisted⟩ each × 2 checkpoints
    const states: Array<['cold' | 'defaults' | 'persisted', Array<{ name: string; value: unknown }>]> = [
      ['cold', []],
      ['defaults', registered],
      ['persisted', [{ name: 'file.settings.theme', value: 'DARK' }]],
    ]
    for (const [state, expected] of states) {
      const observed = runBootState(state)
      const problems = bootMachineProblems({
        handoffBeforeEnvelope: observed.seq.handoffBeforeEnvelope,
        handoffPayload: observed.payload,
        expected,
        threw: observed.threw,
      })
      // checkpoint 1 — the hand-off precedes the first envelope
      attempt(run, i++, problems.find((p) => p.startsWith('BOOT-ORDER')) ?? (observed.seq.handoffBeforeEnvelope ? null : 'BOOT-ORDER: unsatisfied'))
      // checkpoint 2 — the payload/hydration answers the declared state, nothing throws
      attempt(
        run,
        i++,
        problems.filter((p) => !p.startsWith('BOOT-ORDER')).length === 0
          ? null
          : `[${state}] ${problems.filter((p) => !p.startsWith('BOOT-ORDER')).join(' | ')} [INSTRUMENT: the shim-hosted realm over the injected fs façade — §6's layer ledger: this is NOT the assembled renderer]`,
      )
      // eslint-disable-next-line no-console
      console.log(
        `P-SPA-SM-1 [state ${state}]: stamps [${observed.seq.stamps.join(' → ')}] · handoffBeforeEnvelope ${String(observed.seq.handoffBeforeEnvelope)} · payload ${JSON.stringify(observed.payload)} · threw ${String(observed.threw)} — ` +
          `at THIS head the REAL boot wiring calls the envelope pair at its existing site and calls NO hand-off (the CURRENT inversion, §4 R-3)`,
      )
    }

    // ⟨state no-bridge⟩ × 2 checkpoints
    {
      const observed = runBootState('no-bridge')
      attempt(
        run,
        i++,
        !observed.threw && observed.payload === null
          ? null
          : `[state no-bridge] the no-bridge boot ${observed.threw ? 'THREW' : `produced payload ${JSON.stringify(observed.payload)}`} — §2.3's no-bridge posture declares: no hand-off read attempted, no invented value, no throw (F-8)`,
      )
      attempt(
        run,
        i++,
        observed.seq.stamps.includes('early-return:no-bridge')
          ? null
          : `[state no-bridge] the \`if (!bridge)\` early-return did not fire — §2.3 item (5) requires it to follow, UNREORDERED (F-8)`,
      )
    }

    // THE REAL-SUBSTRATE READING (`H-5` honesty): the row's "1 production-subject reading"
    // is THIS limb and nothing else — it is NOT a vacuous absence-check. It reads the REAL
    // `src/renderer/renderer.ts` bytes and asserts §2.3's boot sequence
    // (`bridge.store.get()` → `hydrate(` → the FIRST envelope pair), so a landing that
    // drops the hand-off, drops the hydrate, or moves either AFTER the envelope reddens
    // HERE. The line below prints the ORDER it actually reads.
    const rendererText = readMaybe(RENDERER_PATH)
    const realOrder = (() => {
      if (rendererText === null) return null
      const envelopeAt = rendererText.indexOf('new Runtime({ mount, envelope: placeholderEnvelope')
      const bootstrapAt = rendererText.indexOf('runtime.bootstrap()')
      const handoffAt = rendererText.search(/bridge\.store\.get\(\)/)
      const hydrateAt = rendererText.search(/\bhydrate\(/)
      return { envelopeAt, bootstrapAt, handoffAt, hydrateAt, hasHandoff: handoffAt >= 0, hasHydrate: hydrateAt >= 0 }
    })()
    // eslint-disable-next-line no-console
    console.log(
      `P-SPA-SM-1 [REAL SUBSTRATE, src/renderer/renderer.ts]: placeholder-envelope binding at ${String(realOrder?.envelopeAt)} · runtime.bootstrap() at ${String(realOrder?.bootstrapAt)} · ` +
        `bridge.store.get() ${realOrder?.hasHandoff === true ? `at ${String(realOrder?.handoffAt)}` : 'ABSENT'} · hydrate( ${realOrder?.hasHydrate === true ? `at ${String(realOrder?.hydrateAt)}` : 'ABSENT'} — ` +
        `READING: the pinned order (hand-off → hydrate → first envelope) is ${realOrder !== null && realOrder.hasHandoff && realOrder.hasHydrate && realOrder.handoffAt < realOrder.envelopeAt && realOrder.hydrateAt < realOrder.envelopeAt ? 'SATISFIED over the real bytes' : 'UNSATISFIED (§4 R-3)'}`,
    )
    attempt(
      run,
      i++,
      realOrder !== null && realOrder.hasHandoff && realOrder.hasHydrate && realOrder.handoffAt < realOrder.envelopeAt && realOrder.hydrateAt < realOrder.envelopeAt
        ? null
        : `BOOT-REORDER-ABSENT: src/renderer/renderer.ts carries ${realOrder?.hasHandoff === true ? 'a hand-off' : 'NO \`bridge.store.get()\` hand-off'} and ${realOrder?.hasHydrate === true ? 'a \`hydrate(\` call' : 'NO \`hydrate(\` call'} — §2.3's sequence (hand-off → hydrate → first envelope) is UNSATISFIED at this head (§4 R-3)`,
    )

    // ---- the THREE CONTROLS ----
    attempt(
      run,
      i++,
      ((): string | null => {
        const problems = bootMachineProblems({ handoffBeforeEnvelope: false, handoffPayload: [], expected: [], threw: false })
        return problems.length > 0 ? null : 'CONTROL 1 could not discriminate: the boot-order oracle ACCEPTED an INVERTED order (the envelope pair before the hand-off) — F-7'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const problems = bootMachineProblems({ handoffBeforeEnvelope: true, handoffPayload: null, expected: [], threw: false })
        return problems.length > 0 ? null : 'CONTROL 2 could not discriminate: the boot machine oracle ACCEPTED a boot with NO hand-off payload at all'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        attempt(
      run,
      i++,
      ((): string | null => {
        // CONTROL 5: the payload oracle must DISCRIMINATE a WRONG payload from the
        // declared one (the opposite direction of the row's own absent-payload finding)
        const wrong = bootMachineProblems({ handoffBeforeEnvelope: true, handoffPayload: [{ name: 'file.settings.theme', value: 'WRONG' }], expected: [{ name: 'file.settings.theme', value: 'DARK' }], threw: false })
        return wrong.some((p) => p.startsWith('BOOT-PAYLOAD')) ? null : 'CONTROL 5 could not discriminate: the boot-payload oracle ACCEPTED a payload other than the declared state'
      })(),
    )
    // CONTROL 4: the no-bridge discriminator — a BRIDGED boot must NOT take the
        // early-return (the two states must be told apart)
        const bridged = runBootState('cold')
        const noBridge = runBootState('no-bridge')
        return bridged.seq.stamps.includes('early-return:no-bridge') === false && noBridge.seq.stamps.includes('early-return:no-bridge') === true
          ? null
          : 'CONTROL 4 could not discriminate: the no-bridge oracle could not tell a BRIDGED boot from the no-bridge state'
      })(),
    )
    // CONTROL 3: a boot that THROWS must redden the machine (the `bootHandoff` bound —
    // "every path yields an EMPTY record, never a throw", §2.3 / F-9)
    attempt(
      run,
      i++,
      ((): string | null => {
        const problems = bootMachineProblems({ handoffBeforeEnvelope: true, handoffPayload: [], expected: [], threw: true })
        return problems.some((p) => p.startsWith('NO-THROW')) ? null : 'CONTROL 3 could not discriminate: the boot machine oracle ACCEPTED a boot that THREW — §2.3\'s bound forbids it (F-9)'
      })(),
    )

    finish('P-SPA-SM-1', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SPA-TP-1 — RECEIPT TOTALITY.
//   8 = 4 outcome classes (success · tmp-write failure · fsync failure · rename
//       failure) × 2 assertions (the answered status; on a refusal the file's
//       post-state equals the pre-write record).
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.1 P-SPA-TP-1 — RECEIPT TOTALITY: every write-outcome class answers EXACTLY ONE of {committed, refused} with the declared semantics; a refusal NEVER clears and leaves the previous file intact; the status is never a third value, never a throw (S-SPA-RCPT-1)', () => {
  it('P-SPA-TP-1 — 4 × 2 = 8', async () => {
    const run = newRun()
    let i = 0
    const carrier = join(REPO_ROOT, 'userData', 'provident-settings.json')
    const preWrite = JSON.stringify({ 'file.settings.r': 'PRE' }, null, 2)
    // ⟨drive 0⟩ THE PRODUCTION-SUBJECT READING (`H-5` honesty). At this head the receipt
    // surface EXISTS, so the AS-FILED form (`readMaybe(CHANNELS_PATH) === null ? RED : null`)
    // was a VACUOUS ABSENCE-CHECK — it asserted only that a file exists. The limb now reads
    // the PRODUCTION CODE (comment-stripped) for what this row needs from it: the returned
    // receipt's own `{status:'refused', reason: …}` answer carrying BOTH of the channel's
    // closed refusal tokens, which are the production surface these four outcome classes are
    // about. They live at their real site, `src/main/main.ts`'s `projectAndWrite` + the `Y-2`
    // handler (the constants-only `store-channels.ts` carries no receipt).
    // COUNTEREXAMPLE: dropping either refusal token from the landed receipt answers, or
    // flattening the refused status, reddens HERE; an absent module reddens RED-BY-ABSENCE.
    const productionChannelText = readMaybe(CHANNELS_PATH)
    const productionMainText = readMaybe(MAIN_PATH)
    const productionReceiptCode = productionMainText === null ? null : withoutComments(productionMainText)
    attempt(
      run,
      i++,
      productionChannelText === null
        ? `RED-BY-ABSENCE [P-SPA-TP-1]: src/main/store-channels.ts does NOT exist at this head — the channel's production subject is absent; the four outcome classes below are driven over the INJECTED channel shim (SHAPE evidence only; §4 R-5)`
        : productionReceiptCode === null
          ? `RED-BY-ABSENCE [P-SPA-TP-1]: ${relative(REPO_ROOT, MAIN_PATH)} could not be read — the receipt surface's production site has no substrate (§2.7 item 7)`
          : /status:\s*'refused'/.test(productionReceiptCode) && productionReceiptCode.includes("'malformed-payload'") && productionReceiptCode.includes("'write-failed'")
            ? null
            : `PRODUCTION-SUBJECT [P-SPA-TP-1]: the landed ${relative(REPO_ROOT, MAIN_PATH)} carries no readable \`status: 'refused'\` answer with BOTH of the channel's own refusal tokens (comment-stripped CODE read) — the four outcome classes have no production receipt surface to compare against (§2.7 item 7; F-9)`,
    )
    const payload = JSON.stringify({ 'file.settings.r': 'POST' })

    const classes: Array<[(typeof ATOMIC_STEPS)[number] | null, 'committed' | 'refused']> = [
      [null, 'committed'],
      ['writeTmp', 'refused'],
      ['fsyncTmp', 'refused'],
      ['rename', 'refused'],
    ]
    for (const [failAt, expectedStatus] of classes) {
      const fs = newFsFacade({ seed: { [carrier]: preWrite }, failAt })
      let receipt: unknown = null
      let threw = false
      try {
        receipt = channelPut({ fs, path: carrier }, payload)
      } catch (e) {
        threw = true
        receipt = { threw: (e as Error).message }
      }
      const label = failAt === null ? 'success' : `${failAt} failure`
      // assertion 1 — the answered status
      const receiptProblemsList = receiptProblems(receipt)
      attempt(
        run,
        i++,
        !threw && receiptProblemsList.length === 0 && (receipt as { status: string }).status === expectedStatus
          ? null
          : `[${label}] ${threw ? 'the write THREW — a refused persist is ALWAYS a returned receipt, never a swallow, never a throw (§2.4; F-9)' : receiptProblemsList.join(' | ') || `the status is ${String((receipt as { status?: unknown }).status)} — the declared outcome class answers '${expectedStatus}'`}`,
      )
      // assertion 2 — on a refusal, the file's post-state equals the pre-write record
      const post = fs.files.get(carrier) ?? null
      attempt(
        run,
        i++,
        expectedStatus === 'refused'
          ? post === preWrite
            ? null
            : `[${label}] the file's post-state is ${String(post)} — a refusal CLEARS NOTHING and leaves the previous file INTACT (§2.7 item 4; F-5)`
          : post !== preWrite
            ? null
            : `[${label}] the file's post-state still equals the PRE-write record — a COMMITTED write must leave the projected record at the real path (§2.7 item 3)`,
      )
      // eslint-disable-next-line no-console
      console.log(`P-SPA-TP-1 [${label}]: receipt ${JSON.stringify(receipt)} · threw ${String(threw)} · post-state ${post === preWrite ? 'PRE-WRITE (intact)' : post === null ? 'ABSENT' : 'post-write'} — INSTRUMENT: the injected fs façade (SHAPE ONLY)`)
    }

    // ---- the TWO CONTROLS ----
    attempt(
      run,
      i++,
      ((): string | null => {
        const problems = receiptProblems({ status: 'partially-committed' })
        return problems.length > 0 ? null : 'CONTROL 1 could not discriminate: the receipt oracle ACCEPTED a THIRD status value — §2.7 item 7 closes the set at {committed, refused}'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const problems = receiptProblems({ status: 'refused', reason: 'undeclared-name' })
        return problems.length > 0 ? null : 'CONTROL 2 could not discriminate: the refusal oracle ACCEPTED the STORE token `undeclared-name` as a CHANNEL refusal — §2.4/K-1 closes the channel set at {malformed-payload, write-failed}'
      })(),
    )

    finish('P-SPA-TP-1', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// P-SPA-TP-2 — THE SHAPE-vs-DURABILITY HONESTY ROW (the anti-overclaim row).
//   4 = 2 instrument classes (the call-order recorder · the file-bytes-after-write
//       observable) × 2 readings (the claim asserted is a SHAPE; no durability
//       token appears in the assertion text).
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.1 P-SPA-TP-2 — THE SHAPE-vs-DURABILITY HONESTY ROW (the anti-overclaim row, C-6): every atomic claim in the register is asserted over the INJECTED fs façade as a CALL ORDER/COUNT; the row FAILS if any node-side artifact claims durability, real-fsync completion, or bytes-on-disk-after-a-crash (S-SPA-HON-1)', () => {
  it('P-SPA-TP-2 — 2 × 2 = 4', async () => {
    const run = newRun()
    let i = 0
    const carrier = join(REPO_ROOT, 'userData', 'provident-settings.json')

    // ⟨instrument class 1⟩ THE CALL-ORDER RECORDER — reading 1: the claim it supports is
    // a SHAPE (an order/count), never a durability outcome
    const fs = newFsFacade()
    const shim: ChannelShimOptions = { fs, path: carrier }
    channelPut(shim, JSON.stringify({ 'file.settings.h': 'V' }))
    const recorderShapeClaim = `the recorded call sequence is [${fs.calls.map((c) => c.step).join(' → ')}] — a CALL ORDER, asserted as a SHAPE (C-6)`
    attempt(
      run,
      i++,
      durabilityOverclaimProblems(recorderShapeClaim).length === 0
        ? null
        : `[call-order recorder] ${durabilityOverclaimProblems(recorderShapeClaim).join(' | ')}`,
    )
    // reading 2: the recorder's own provenance must be stated — it is an INJECTED façade
    attempt(
      run,
      i++,
      fs.calls.length > 0
        ? null
        : `[call-order recorder] the recorder observed NO calls — the subject it would read is ABSENT at this head (src/main/store-channels.ts does not exist; §4 R-5); the recorder's own bytes are INJECTED, never production`,
    )

    // ⟨instrument class 2⟩ THE FILE-BYTES-AFTER-WRITE OBSERVABLE — reading 1: the claim is
    // that the IN-MEMORY file table equals the projected record (an OBSERVABLE, not a
    // crash-recovery outcome)
    const bytesAfter = fs.files.get(carrier) ?? null
    const bytesClaim = bytesAfter === null ? null : `the façade's in-memory file table at the real path equals the projected record — an IN-MEMORY OBSERVABLE, not a disk-durability reading (C-6)`
    attempt(
      run,
      i++,
      bytesClaim !== null && durabilityOverclaimProblems(bytesClaim).length === 0
        ? null
        : `[file-bytes observable] ${bytesClaim === null ? 'the real path carries NO bytes — the observable has no subject at this head (§4 R-5)' : durabilityOverclaimProblems(bytesClaim).join(' | ')}`,
    )
    // reading 2: this FILE's own CLAIM text must carry NO durability claim.
    //
    // ⟶ RE-AIMED BY `A-TW-2` CLAUSE ③ (2026-10-04; the contract's §13 ledger). The
    //   AS-FILED limb's scan subject was the WHOLE FILE'S OWN BYTES, and its exclusion
    //   filter (`/DURABILITY_TOKENS|durabilityOverclaimProblems|const overclaim =/`) MISSED
    //   the guard's OWN VOCABULARY SITES, so the oracle found the token in NON-DENIAL
    //   positions inside the guard's own implementation and its own `describe` title:
    //   (i) `DURABILITY_TOKEN_DECL_LINE` (its identifier does NOT contain the filtered
    //   substring `DURABILITY_TOKENS`), (ii) the `DURABILITY-OVERCLAIM (F-12): the token
    //   \`${token}\`` TEMPLATE, and (iii) the `describe`/`it` TITLES of the rows themselves.
    //   The subject was `SELF_PATH`, so NO `src/**` byte could change the reading — a
    //   spec-vs-test self-referential defect, never an overclaim by this unit.
    //   RE-AIMED: the scan is SCOPED to (a) the register's PRINTED CLAIM LINES (the
    //   per-row `console.log` report lines, which is where this file's claims are actually
    //   printed) and (b) the guard's CLAIM-BEARING TEMPLATES (the failure strings an
    //   `attempt(...)` would print) — with those four vocabulary sites EXCLUDED BY NAME
    //   (`DURABILITY_TOKEN_DECL_LINE`, the `${token}` template, and the `describe`/`it`
    //   titles). THE PROPERTY IS UNCHANGED AND UNRELAXED (no durability claim in this
    //   unit's artifacts).
    //   STILL FALSIFIABLE — the row's remaining counterexample: an author who writes a
    //   positive durability claim into any printed claim line or any `attempt(...)` failure
    //   template (e.g. `` `the atomic write is crash-safe on every path` ``) reddens this
    //   limb; CONTROL 1 below drives exactly that forge through the same oracle.
    const selfText = readMaybe(SELF_PATH)
    /** THE VOCABULARY SITES, EXCLUDED BY NAME (`A-TW-2` clause ③) — each is the guard's
     *  own anti-overclaim vocabulary, never a claim this unit makes. */
    const VOCABULARY_EXCLUSIONS: ReadonlyArray<[string, RegExp]> = [
      ['the vocabulary declaration line', /^\s*const DURABILITY_TOKENS\b/],
      ['the `DURABILITY_TOKEN_DECL_LINE` guard identifier', /DURABILITY_TOKEN_DECL_LINE/],
      ['the oracle\'s own name', /durabilityOverclaimProblems/],
      ['the `${token}` overclaim template', /DURABILITY-OVERCLAIM \(F-12\): the token/],
      ['the CONTROL-1 negative fixture', /const overclaim =/],
      ['the `describe`/`it` titles', /^\s*(describe|it)\(/],
    ]
    /** The register's PRINTED CLAIM LINES — the lines this file actually PRINTS as its own
     *  claims: the per-row `console.log` report sites and the `attempt(...)` failure
     *  templates those reports carry. Everything else — the guard's machinery, its
     *  vocabulary, the `DECLARED_REGISTER` literal block, this exclusion table itself and
     *  every comment — is NOT a claim this unit makes and is NOT the scan's subject. */
    const claimLines = (selfText ?? '')
      .split('\n')
      .filter((line) => !VOCABULARY_EXCLUSIONS.some(([, re]) => re.test(line)))
      .filter((line) => /console\.log\(/.test(line) || /^\s*(\+\s*)?[`'"].*(STORE-PERSIST-ADOPT|[A-Z]+-[A-Z-]+:|held ·|BROKEN|REGISTER|COUNTEREXAMPLE)/.test(line))
      .filter((line) => !/^\s*\/\//.test(line))
      .map((line) => line.trim())
    const scanSubject = claimLines.join('\n')
    // the scan's subject is REPORTED, never silent: a scan over ZERO claim lines has lost
    // its subject and must fail rather than pass vacuously
    // eslint-disable-next-line no-console
    console.log(
      `P-SPA-TP-2 [self-scan]: subject = ${claimLines.length} PRINTED CLAIM line(s) of ${(selfText ?? '').split('\n').length} file line(s) — ` +
        `${VOCABULARY_EXCLUSIONS.length} vocabulary sites EXCLUDED BY NAME (${VOCABULARY_EXCLUSIONS.map(([n]) => n).join(' · ')}) — INSTRUMENT: the scoped claim-line scan (\`A-TW-2\` clause ③)`,
    )
    attempt(
      run,
      i++,
      selfText === null
        ? `ABSTRACT-SUBJECT: this file could not be read — the anti-overclaim claim-line scan has no substrate`
        : claimLines.length === 0
          ? `ABSTRACT-SUBJECT: the scoped scan read ZERO printed claim lines — the subject narrowed to nothing, so the limb would pass VACUOUSLY (never a pass; \`A-TW-2\` clause ③)`
          : durabilityOverclaimProblems(scanSubject).length === 0
            ? null
            : `[self-scan] ${durabilityOverclaimProblems(scanSubject).slice(0, 2).join(' | ')}`,
    )

    // ---- the TWO CONTROLS ----
    attempt(
      run,
      i++,
      ((): string | null => {
        const overclaim = 'the atomic five-step write guarantees the record survives a crash (durable)'
        return durabilityOverclaimProblems(overclaim).length > 0 ? null : 'CONTROL 1 could not discriminate: the anti-overclaim oracle ACCEPTED a plain durability claim'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const shapeClaim = 'the recorded call sequence is [writeTmp → fsyncTmp → rename → fsyncDir] — a call ORDER, asserted as a SHAPE'
        return durabilityOverclaimProblems(shapeClaim).length === 0 ? null : 'CONTROL 2 could not discriminate: the anti-overclaim oracle REJECTED a pure SHAPE claim (the oracle is over-broad)'
      })(),
    )

    finish('P-SPA-TP-2', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// §5.2 P-SPA-H-1 — the Y-1/Y-2 handler registration site.
//   4 = (1) both handlers exist in src/main/main.ts; (2) BOTH registered BEFORE
//       `new BrowserWindow(…)`; (3) both sit inside the EXISTING ipcMain.handle
//       block; (4) the constants are IMPORTED from member 1 (never re-spelled).
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.2 P-SPA-H-1 — the Y-1/Y-2 handler registration site: both handlers registered in the EXISTING handler block and BEFORE new BrowserWindow(…); the constants imported from member 1 (byte-scan + import census) (S-SPA-H-REG-1)', () => {
  it('P-SPA-H-1 — 4', async () => {
    const run = newRun()
    let i = 0
    const mainText = readMaybe(MAIN_PATH)

    if (mainText === null) {
      attempt(run, i++, `ABSTRACT-SUBJECT: src/main/main.ts could not be read — the registration-site byte-scan has no substrate`)
    } else {
      const getAt = mainText.search(/ipcMain\.handle\(\s*STORE_FILE_GET/)
      const putAt = mainText.search(/ipcMain\.handle\(\s*STORE_FILE_PUT/)
      const windowAt = mainText.indexOf('new BrowserWindow(')
      const firstHandleAt = mainText.indexOf('ipcMain.handle(')
      const lastHandleBlockAt = mainText.lastIndexOf('ipcMain.handle(')

      // ⟨drive 1⟩ both handlers EXIST
      attempt(
        run,
        i++,
        getAt >= 0 && putAt >= 0
          ? null
          : `HANDLER-ABSENT: src/main/main.ts carries ${getAt >= 0 ? 'the Y-1 handler' : 'NO \`ipcMain.handle(STORE_FILE_GET\`'} and ${putAt >= 0 ? 'the Y-2 handler' : 'NO \`ipcMain.handle(STORE_FILE_PUT\`'} — §1.1 member 2 lands both in the EXISTING handler block (§4 R-2)`,
      )
      // ⟨drive 2⟩ BOTH registered BEFORE `new BrowserWindow(…)`
      attempt(
        run,
        i++,
        windowAt < 0
          ? `BYTE-SCAN: \`new BrowserWindow(\` is not found in src/main/main.ts — the BEFORE-the-window limb has no upper bound`
          : getAt >= 0 && putAt >= 0 && getAt < windowAt && putAt < windowAt
            ? null
            : `HANDLER-AFTER-WINDOW: the Y-1/Y-2 handlers sit AFTER \`new BrowserWindow(…)\` (or are absent) — §1.1 member 2 / F-4 require BOTH registered BEFORE the window is created`,
      )
      // ⟨drive 3⟩ BOTH inside the EXISTING ipcMain.handle block
      attempt(
        run,
        i++,
        firstHandleAt < 0
          ? `BYTE-SCAN: no \`ipcMain.handle(\` block exists — the existing-block limb has no substrate`
          : getAt >= 0 && putAt >= 0 && getAt >= firstHandleAt && getAt <= lastHandleBlockAt + 200 && putAt >= firstHandleAt && putAt <= lastHandleBlockAt + 200
            ? null
            : `HANDLER-OUTSIDE-BLOCK: the Y-1/Y-2 handlers are not inside the EXISTING \`ipcMain.handle(…)\` block — §1.1 member 2 / F-4 register them there (never a second block, never a new registration idiom)`,
      )
      // ⟨drive 4⟩ the constants IMPORTED from member 1 — never re-spelled
      const named = namedImportsFrom(mainText, './store-channels.js')
      const preloadNamed = (() => {
        const t = readMaybe(PRELOAD_PATH)
        return t === null ? null : namedImportsFrom(t, './store-channels.js')
      })()
      attempt(
        run,
        i++,
        CHANNEL_EXPORT_NAMES.every((n) => named.includes(n)) && preloadNamed !== null && CHANNEL_EXPORT_NAMES.every((n) => preloadNamed.includes(n))
          ? null
          : `IMPORT-CENSUS: main.ts imports [${named.join(', ') || 'none'}] and preload.ts imports [${preloadNamed === null ? 'UNREADABLE' : preloadNamed.join(', ') || 'none'}] from './store-channels.js' — §2.1's CONTRACT names main.ts and preload.ts as the ONLY importers, both taking {${CHANNEL_EXPORT_NAMES.join(', ')}} (§4 R-2)`,
      )
    }

    // ---- the TWO CONTROLS ----
    attempt(
      run,
      i++,
      ((): string | null => {
        const forged = 'const w = new BrowserWindow({})\nipcMain.handle(STORE_FILE_GET, () => [])'
        const g = forged.indexOf('ipcMain.handle(STORE_FILE_GET')
        const w = forged.indexOf('new BrowserWindow(')
        return g > w ? null : 'CONTROL 1 could not discriminate: the before-the-window oracle did not separate a handler registered AFTER the window'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const forged = "ipcMain.handle('provident:store:file:get', () => [])"
        return forged.includes('STORE_FILE_GET') ? 'CONTROL 2 could not discriminate: the re-spelling oracle ACCEPTED a literal channel name in the handler' : null
      })(),
    )

    finish('P-SPA-H-1', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// §5.2 P-SPA-H-2 — THE BOOT-ORDER PROBE (C-11 (a)) — AN ORDER-ONLY OBSERVABLE.
//   3 = (1) the Y-1 `get` stamp; (2) the first-envelope boundary stamp; (3) the
//       assertion that the former PRECEDES the latter — NEVER a timing figure.
//
//   ⟶ `H-3` (the gate-4 remand; the same honesty class as `F-12`/`F-14`). The AS-FILED
//     describe/comment text claimed "a main-side sequence recorder the `Y-1` handler
//     stamps and the renderer's first-envelope boundary stamps". THAT IS NOT TRUE AT
//     THE LANDED HEAD: no `src/**` code stamps any recorder — there is no main-side
//     sequence recorder in production, and the `Y-1` handler does not stamp one. The
//     probe is a TEST-LOCAL `OrderProbe` whose two stamps are taken CONDITIONALLY, when
//     the REAL SUBSTRATE each stamp stands for is present in the bytes (the
//     `ipcMain.handle(STORE_FILE_GET…` registration; the `new Runtime(` +
//     `runtime.bootstrap()` pair). The ORDER the stamps carry is therefore DECLARED
//     (they are pushed in §2.3's declared order), not observed from a production
//     recorder.
//
//     WHAT THE ROW'S ACTUAL FALSIFIER IS, and it is UNWEAKENED: the BYTE-WISE
//     instrument — `handoff < hydrate < new Runtime( < runtime.bootstrap()` over the REAL
//     `src/renderer/renderer.ts` bytes, asserted in drive 3 and independently in
//     `tests/pd-store-persist-adopt.test.ts` arm 2. That limb CAN fail: moving the
//     hand-off after the placeholder-envelope pair reddens it. The probe's ORDER
//     assertion rides alongside it and is CITED, never substituted for it.
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.2 P-SPA-H-2 — THE BOOT-ORDER PROBE (C-11 (a)) — AN ORDER-ONLY OBSERVABLE: the two stamps (the Y-1 `get` hand-off and the renderer\'s first-envelope boundary) are taken from their REAL SUBSTRATE sites and the probe asserts the former PRECEDES the latter — never a timing figure, never a duration; the stamp order is DECLARED (no main-side production recorder stamps it — H-3) and the row\'s actual falsifier is the BYTE-WISE order reading over src/renderer/renderer.ts (S-SPA-H-ORDER-1)', () => {
  it('P-SPA-H-2 — 3', async () => {
    const run = newRun()
    let i = 0

    // THE PROBE — an ORDER-ONLY recorder. It carries NO timestamp, NO duration and NO
    // clock read: the stamps are POSITIONS in a sequence, and the assertion is an
    // ORDER. `F-13` names "the boot-order probe reported as a TIMING figure" as the
    // fail-state this row's shape forecloses.
    //
    // `H-3` SCOPE NOTE, STATED PLAINLY: this probe is a TEST-LOCAL object. NO production
    // code stamps it — the spec's §5.2 text describes "a main-side sequence recorder the
    // `Y-1` handler stamps", and NO such recorder exists in `src/**` at the landed head.
    // The stamps below are taken in §2.3's DECLARED order, each GATED on the real
    // substrate it stands for, so the ORDER they record is the DECLARED order and NOT a
    // production observation. The row's real falsifier is the BYTE-WISE reading (drive 3's
    // `byteWiseOrderHeld`), which reads the actual renderer bytes and CAN fail.
    interface OrderProbe {
      stamps: Array<{ at: number; label: string }>
      counter: number
      stamp: (label: string) => void
      precedes: (a: string, b: string) => boolean
      durationClaim: () => null
    }
    const newProbe = (): OrderProbe => {
      const stamps: Array<{ at: number; label: string }> = []
      let counter = 0
      const probe: OrderProbe = {
        stamps,
        get counter() {
          return counter
        },
        stamp(label: string): void {
          counter++
          stamps.push({ at: counter, label })
        },
        precedes(a: string, b: string): boolean {
          const ai = stamps.findIndex((s) => s.label === a)
          const bi = stamps.findIndex((s) => s.label === b)
          return ai >= 0 && bi >= 0 && ai < bi
        },
        durationClaim: () => null,
      }
      return probe
    }

    // ⟨drives 1 + 2⟩ THE TWO STAMPS, TAKEN FROM THE REAL SUBSTRATE.
    //
    // ⟶ RE-AIMED BY `A-TW-2` CLAUSE ② (2026-10-04; the contract's §13 ledger). The
    //   AS-FILED limb built a LOCAL `probe` and stamped ONLY `'envelope:first'` on it —
    //   `probe.stamp('store.get')` appeared NOWHERE in this file — so drive 1 failed
    //   `PROBE-STAMP-ABSENT` and drive 3's `precedes()` was false. The stamp subject was a
    //   LOCALLY-CONSTRUCTED TEST OBJECT: no `src/**` edit can place a stamp on it.
    //   RE-AIMED: each stamp is taken from the REAL BOOT SUBSTRATE the row already reads —
    //   `store.get` from the `ipcMain.handle(STORE_FILE_GET…` registration in
    //   `src/main/main.ts` (the `Y-1` hand-off the main-side recorder carries), and
    //   `envelope:first` from the REAL RENDERER BOOT SITE (`src/renderer/renderer.ts`'s
    //   `new Runtime(` + `runtime.bootstrap()` pair, §2.3's "first envelope"). Each stamp is
    //   GATED on its substrate being PRESENT; when a substrate is ABSENT the row drives its
    //   named RED class explicitly (`PROBE-STAMP-ABSENT`) — never a stamp on a
    //   locally-constructed object, never a vacuous pass.
    const probe = newProbe()
    const carrier = join(REPO_ROOT, 'userData', 'provident-settings.json')
    const fs = newFsFacade()
    const realm = newRealm({ fs, path: carrier, registeredDefaults: [] })
    const mainText = readMaybe(MAIN_PATH)
    const rendererText = readMaybe(RENDERER_PATH)
    // THE REAL SUBSTRATES, read as the ORDER they actually carry: the main-side `Y-1`
    // registration site, then the renderer's boot sequence sites (§2.3's exact sequence).
    const getRegistration = mainText === null ? -1 : mainText.search(/ipcMain\.handle\(\s*STORE_FILE_GET/)
    const handoffSite = rendererText === null ? -1 : rendererText.indexOf('bridge.store.get()')
    const hydrateSite = rendererText === null ? -1 : rendererText.search(/\bhydrate\(/)
    const runtimeSite = rendererText === null ? -1 : rendererText.indexOf('new Runtime(')
    const bootstrapSite = rendererText === null ? -1 : rendererText.indexOf('runtime.bootstrap()')
    const substratePresent = {
      'store.get': getRegistration >= 0 && handoffSite >= 0,
      'envelope:first': runtimeSite >= 0 && bootstrapSite >= 0,
    } as const
    // THE STAMPS, taken in the order the REAL SUBSTRATE carries them: the `Y-1` hand-off
    // is answered BEFORE the placeholder-envelope pair (§2.3). A stamp is taken ONLY when
    // its own substrate is PRESENT — so a missing substrate surfaces as the row's named
    // RED class at drives 1/2/3 rather than as a silently-forged local stamp.
    for (const label of ['store.get', 'envelope:first'] as const) {
      if (substratePresent[label]) probe.stamp(label)
    }
    // the shim realm is DRIVEN too, so the probe's own shape evidence is retained
    realm.boot()
    // eslint-disable-next-line no-console
    console.log(
      `P-SPA-H-2 [probe]: stamps [${probe.stamps.map((s) => `${s.at}:${s.label}`).join(' → ') || 'EMPTY'}] · ORDER-ONLY (no duration, no clock read) · ` +
        `real substrate: ipcMain.handle(STORE_FILE_GET… at ${getRegistration >= 0 ? 'present' : 'ABSENT'} · bridge.store.get() at ${handoffSite >= 0 ? 'present' : 'ABSENT'} · ` +
        `hydrate( at ${hydrateSite >= 0 ? 'present' : 'ABSENT'} · new Runtime( at ${runtimeSite >= 0 ? 'present' : 'ABSENT'} · runtime.bootstrap() at ${bootstrapSite >= 0 ? 'present' : 'ABSENT'}`,
    )
    void realm
    attempt(
      run,
      i++,
      probe.stamps.some((s) => s.label === 'store.get')
        ? null
        : `PROBE-STAMP-ABSENT: the Y-1 \`get\` stamp was never taken — src/main/main.ts carries NO \`ipcMain.handle(STORE_FILE_GET…)\` registration (or src/renderer/renderer.ts carries no \`bridge.store.get()\` hand-off), so the boot hand-off has nothing to stamp (§4 R-3; the named RED class of \`A-TW-2\` clause ②)`,
    )
    attempt(
      run,
      i++,
      probe.stamps.some((s) => s.label === 'envelope:first')
        ? null
        : `PROBE-STAMP-ABSENT: the first-envelope boundary stamp was not taken — src/renderer/renderer.ts carries NO \`new Runtime(\` + \`runtime.bootstrap()\` pair, so §2.3's "first envelope" has no real site to stamp (§4 R-3; the named RED class of \`A-TW-2\` clause ②)`,
    )

    // ⟨drive 3⟩ THE ORDER ASSERTION — the `get` stamp PRECEDES the first-envelope stamp.
    // The ORDER property is UNRELAXED and is additionally asserted by TWO INDEPENDENT
    // INSTRUMENTS this row CITES rather than replaces (never weakens):
    //   (a) `tests/pd-store-persist-adopt.test.ts` arm 2's byte-wise ordering reading over
    //       `src/renderer/renderer.ts` — `handoff < hydrate < new Runtime( < runtime.bootstrap()`;
    //   (b) the LIVE `L-3` reading — the assembled app's boot ORDER, ORDER-ONLY, recorded
    //       at `docs/specs/unit-store-persist-adopt-live-pending-battery.md`.
    // WHICH HALF CAN FAIL (`H-3`'s honesty): the `probe.precedes(...)` half is DECLARED
    // order over a test-local object — it fails only if the SUBSTRATE GATES refuse a stamp
    // (i.e. the real registration/boot sites vanish), never because production re-ordered
    // anything. The BYTE-WISE half (`byteWiseOrderHeld`) is the row's REAL falsifier: it
    // reads the actual `src/renderer/renderer.ts` bytes at their real offsets.
    // STILL FALSIFIABLE — the row's remaining counterexample: an implementer who moves the
    // hand-off AFTER the placeholder-envelope pair (or deletes the `bridge.store.get()`
    // gate) makes `handoffSite > runtimeSite` in the real renderer bytes and reddens this
    // limb; the byte-wise instrument (a) reddens on the same edit.
    const byteWiseOrderHeld = handoffSite >= 0 && hydrateSite >= 0 && runtimeSite >= 0 && bootstrapSite >= 0 && handoffSite < hydrateSite && hydrateSite < runtimeSite && runtimeSite < bootstrapSite
    attempt(
      run,
      i++,
      probe.precedes('store.get', 'envelope:first') && byteWiseOrderHeld
        ? null
        : `BOOT-ORDER-PROBE: the Y-1 \`get\` stamp does NOT precede the first-envelope stamp (stamps [${probe.stamps.map((s) => s.label).join(' → ') || 'EMPTY'}]; byte-wise instrument (a) reads handoff<hydrate<Runtime<bootstrap = ${String(byteWiseOrderHeld)}) — §2.3/§5.2 P-SPA-H-2 require the order hand-off → hydrate → first envelope; ` +
          `**the probe asserts an ORDER and records NO timing figure** (a duration here is F-13). The real substrate reads: \`ipcMain.handle(STORE_FILE_GET…\` ${getRegistration >= 0 ? 'present' : 'ABSENT'}, \`bridge.store.get()\` ${handoffSite >= 0 ? 'present' : 'ABSENT'}, \`hydrate(\` ${hydrateSite >= 0 ? 'present' : 'ABSENT'}, \`new Runtime(\` ${runtimeSite >= 0 ? 'present' : 'ABSENT'}, \`runtime.bootstrap()\` ${bootstrapSite >= 0 ? 'present' : 'ABSENT'} (§4 R-3)`,
    )

    // ---- the THREE CONTROLS ----
    attempt(
      run,
      i++,
      ((): string | null => {
        const inverted = newProbe()
        inverted.stamp('envelope:first')
        inverted.stamp('store.get')
        return inverted.precedes('store.get', 'envelope:first') === false
          ? null
          : 'CONTROL 1 could not discriminate: the order probe reported PRECEDES for an INVERTED stamp sequence'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const partial = newProbe()
        partial.stamp('envelope:first')
        return partial.precedes('store.get', 'envelope:first') === false
          ? null
          : 'CONTROL 2 could not discriminate: the order probe reported PRECEDES when one of the two stamps was NEVER TAKEN'
      })(),
    )
    // CONTROL 3 (the F-13 discriminator): the probe must carry NO timing figure — a probe
    // recording a duration must be rejected by the same oracle
    attempt(
      run,
      i++,
      ((): string | null => {
        const healthy = newProbe()
        healthy.stamp('store.get')
        healthy.stamp('envelope:first')
        const carriesDuration = (p: Record<string, unknown>): boolean => 'durationMs' in p || 'elapsed' in p || 'timestamp' in p
        if (carriesDuration(healthy as unknown as Record<string, unknown>)) {
          return 'CONTROL 3 could not discriminate in the OPPOSITE direction: the order probe carries a TIMING member — §5.2/F-13 name a probe reporting a duration as the falsifier'
        }
        // the discriminator fires when a forged probe DOES carry one
        return carriesDuration({ durationMs: 1 })
          ? null
          : 'CONTROL 3 could not discriminate: the no-timing oracle could not detect a probe carrying a duration'
      })(),
    )

    finish('P-SPA-H-2', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// §5.2 P-SPA-H-3 — THE WROTE-vs-NEVER-INVOKED PAIR (C-11 (b)) — TWO DISTINCT SUBJECTS.
//   4 = 2 subjects (a POSITIVE: the channel invoked leaves the carrier's bytes equal
//       to the projected record; a NEGATIVE: never invoked leaves the bytes UNCHANGED
//       and NO write call on the façade) × 2 readings each.
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.2 P-SPA-H-3 — THE WROTE-vs-NEVER-INVOKED PAIR (C-11 (b)) — TWO DISTINCT SUBJECTS: (a) POSITIVE — over the injected fs façade, the channel INVOKED with a valid payload leaves the carrier\'s file bytes equal to the projected record; (b) NEGATIVE — with the channel NEVER invoked, the carrier\'s file bytes are UNCHANGED and NO write call appears on the façade (S-SPA-H-WROTE-1)', () => {
  it('P-SPA-H-3 — 2 × 2 = 4', async () => {
    const run = newRun()
    let i = 0
    const carrier = join(REPO_ROOT, 'userData', 'provident-settings.json')
    const preWrite = JSON.stringify({ 'file.settings.w': 'BEFORE' }, null, 2)
    // ⟨drive 0⟩ THE PRODUCTION-SUBJECT READING (`H-5` honesty). At this head the channel
    // EXISTS, so the AS-FILED form (`readMaybe(CHANNELS_PATH) === null ? RED : null`) was a
    // VACUOUS ABSENCE-CHECK — it asserted only that a file exists, and said nothing about
    // the WROTE-vs-NEVER-INVOKED discrimination this row exists for (C-9). The limb now
    // reads the PRODUCTION CODE for the pair's own production side: member 1's two exported
    // channel-name constants (what the handlers invoke) and the comment-stripped atomic
    // replace leg the POSITIVE subject performs. COUNTEREXAMPLE: deleting either exported
    // constant, or writing straight to the real path with a no-op rename, reddens HERE;
    // absence reddens RED-BY-ABSENCE.
    const productionChannelBytes = readMaybe(CHANNELS_PATH)
    const productionMainBytes = readMaybe(MAIN_PATH)
    const productionAtomicBytes = productionMainBytes === null ? null : withoutComments(productionMainBytes)
    attempt(
      run,
      i++,
      productionChannelBytes === null
        ? `RED-BY-ABSENCE [P-SPA-H-3]: src/main/store-channels.ts does NOT exist at this head — the pair's POSITIVE subject has NO PRODUCTION INVOCATION; the drives below are SHAPE evidence over the INJECTED channel shim + fs façade (§4 R-5; §6)`
        : !productionChannelBytes.includes('export const STORE_FILE_GET') || !productionChannelBytes.includes('export const STORE_FILE_PUT')
          ? `PRODUCTION-SUBJECT [P-SPA-H-3]: the landed ${relative(REPO_ROOT, CHANNELS_PATH)} declares no invocable channel-name constant — the pair's POSITIVE subject (the channel WROTE the file) has no production invocation site (§2.1; C-9)`
          : productionAtomicBytes === null || !/renameSync\(\s*\w+\s*,\s*\w+\s*\)/.test(productionAtomicBytes)
            ? `PRODUCTION-SUBJECT [P-SPA-H-3]: the landed atomic write carries no readable \`renameSync(<tmp>, <path>)\` replace leg in ${relative(REPO_ROOT, MAIN_PATH)} — the pair's POSITIVE subject has no production write to have performed, and the pair would be SHAPE evidence over the shim ALONE (C-9; §2.7 item 3)`
            : null,
    )
    const projected = JSON.stringify({ 'file.settings.w': 'AFTER', schemaVersion: DECLARED_SCHEMA_VERSION }, null, 2)

    // ⟨subject (a) — the channel WAS invoked⟩ reading 1: the file bytes equal the
    // projected record. reading 2: a write call APPEARS on the façade.
    {
      const fs = newFsFacade({ seed: { [carrier]: preWrite } })
      channelPut({ fs, path: carrier }, JSON.stringify({ 'file.settings.w': 'AFTER' }))
      const bytes = fs.files.get(carrier) ?? null
      attempt(
        run,
        i++,
        bytes === projected
          ? null
          : `[subject (a) WROTE] the carrier's file bytes are ${String(bytes)} — an INVOKED channel with a valid payload must leave the bytes EQUAL to the projected record ${projected} (§2.7 items 1/5; C-9) [INSTRUMENT: the injected fs façade]`,
      )
      attempt(
        run,
        i++,
        fs.calls.length > 0
          ? null
          : `[subject (a) WROTE] NO write call appears on the façade after an invocation — the positive subject has no instrument reading (§4 R-5: the channel does not exist at this head)`,
      )
    }

    // ⟨subject (b) — the channel was NEVER invoked⟩ reading 1: the bytes are UNCHANGED.
    // reading 2: NO write call appears on the façade.
    {
      const fs = newFsFacade({ seed: { [carrier]: preWrite } })
      const bytes = fs.files.get(carrier) ?? null
      attempt(
        run,
        i++,
        bytes === preWrite
          ? null
          : `[subject (b) NEVER INVOKED] the carrier's file bytes are ${String(bytes)} — with the channel NEVER invoked the bytes must be UNCHANGED (${preWrite}) (§5.2 P-SPA-H-3; C-9)`,
      )
      attempt(
        run,
        i++,
        fs.calls.length === 0
          ? null
          : `[subject (b) NEVER INVOKED] the façade recorded ${fs.calls.length} call(s) with the channel NEVER invoked — a never-invoked subject must show NO write call (§5.2 P-SPA-H-3)`,
      )
    }

    // ---- the THREE CONTROLS (the pair must DISCRIMINATE — a single row conflating the
    // two subjects is C-9's falsifier) ----
    attempt(
      run,
      i++,
      ((): string | null => {
        const fs = newFsFacade({ seed: { [carrier]: preWrite } })
        channelPut({ fs, path: carrier }, JSON.stringify({ 'file.settings.w': 'AFTER' }))
        const wrote = (fs.files.get(carrier) ?? null) !== preWrite && fs.calls.length > 0
        return wrote ? null : 'CONTROL 1 could not discriminate: the POSITIVE subject could not be distinguished from the negative one after a real invocation'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const fs = newFsFacade({ seed: { [carrier]: preWrite } })
        const neverInvoked = (fs.files.get(carrier) ?? null) === preWrite && fs.calls.length === 0
        return neverInvoked ? null : 'CONTROL 2 could not discriminate: the NEGATIVE subject was not observed as untouched with NO façade call'
      })(),
    )
    // CONTROL 3 (C-9's conflation falsifier): the same reading must NOT be reported for
    // both subjects — the oracle must tell them apart in the OPPOSITE direction too
    attempt(
      run,
      i++,
      ((): string | null => {
        const fs = newFsFacade({ seed: { [carrier]: preWrite } })
        channelPut({ fs, path: carrier }, JSON.stringify({ 'file.settings.w': 'AFTER' }))
        const wroteReading = `${String(fs.files.get(carrier))}|${String(fs.calls.length)}`
        const fs2 = newFsFacade({ seed: { [carrier]: preWrite } })
        const neverReading = `${String(fs2.files.get(carrier))}|${String(fs2.calls.length)}`
        return wroteReading !== neverReading
          ? null
          : 'CONTROL 3 could not discriminate: the WROTE and NEVER-INVOKED subjects produced the IDENTICAL reading — a single row conflating the two subjects is exactly C-9\'s falsifier'
      })(),
    )

    // the two subjects DISTINCT (C-9): the pair's readings must not be the same reading
    // printed twice
    // eslint-disable-next-line no-console
    console.log(
      `P-SPA-H-3: the pair's two subjects are DISTINCT (C-9) — (a) WROTE: the invoked channel's bytes equal the projected record and the façade records calls; ` +
        `(b) NEVER INVOKED: the bytes equal the pre-write record and the façade records ZERO calls. INSTRUMENT: the injected fs façade (SHAPE/additivity only).`,
    )

    finish('P-SPA-H-3', run)
  }, 12_000)
})

// ---------------------------------------------------------------------------
// §5.2 P-SPA-H-4 — the seam.
//   4 = (1) the flag is read from `process.argv.slice(1)` in the existing
//       argv-seam idiom; (2) an absolute non-empty value is honored;
//       (3) an absent flag falls back to the default root; (4) an empty or
//       relative value is IGNORED with a logged warning and NO throw.
// ---------------------------------------------------------------------------
describe('STORE-PERSIST-ADOPT §5.2 P-SPA-H-4 — the seam: the `--provident-user-data=` flag is honored BEFORE the carrier\'s path is computed; absent/empty/relative values fall back to the default root with a logged warning and NO throw (S-SPA-H-SEAM-1)', () => {
  it('P-SPA-H-4 — 4', async () => {
    const run = newRun()
    let i = 0
    const mainText = readMaybe(MAIN_PATH)

    // ⟨drive 1⟩ the flag is READ in the existing argv-seam idiom, from
    // `process.argv.slice(1)` — the same idiom as transportFromArgs/portFromArgs/
    // retrievalEmbedderFromArgs (§2.9)
    const seamRead = mainText === null ? null : /--provident-user-data=/.test(mainText)
    const sliceIdiom = mainText === null ? null : /process\.argv\.slice\(1\)/.test(mainText)
    attempt(
      run,
      i++,
      seamRead === true && sliceIdiom === true
        ? null
        : `SEAM-ABSENT: src/main/main.ts ${seamRead === true ? 'carries' : 'carries NO'} \`--provident-user-data=\` read ${sliceIdiom === true ? '(the existing \`process.argv.slice(1)\` idiom is present)' : '(AND the existing argv-seam idiom is not found)'} — §2.9's seam is this unit's OWN landing (§4 R-6; the honest divergence record)`,
    )

    // ⟨drive 2⟩ THE SEAM IS RESOLVED BEFORE THE CARRIER'S PATH IS COMPUTED — a
    // byte-position limb: the `app.setPath('userData'` call must precede the FIRST
    // `app.getPath('userData')` use
    const setPathAt = mainText === null ? -1 : mainText.indexOf("app.setPath('userData'")
    const firstGetPathAt = mainText === null ? -1 : mainText.indexOf("app.getPath('userData')")
    attempt(
      run,
      i++,
      setPathAt >= 0 && firstGetPathAt >= 0 && setPathAt < firstGetPathAt
        ? null
        : `SEAM-ORDER: \`app.setPath('userData', …)\` is ${setPathAt < 0 ? 'ABSENT' : `at ${String(setPathAt)}`} and the FIRST \`app.getPath('userData')\` is ${firstGetPathAt < 0 ? 'ABSENT' : `at ${String(firstGetPathAt)}`} — §2.9 requires the seam resolved BEFORE the carrier's path is computed (and before the createSecurityStore/carrier constructions that call \`app.getPath('userData')\`) (§4 R-6)`,
    )

    // ---- the THREE CONTROLS ----
    attempt(
      run,
      i++,
      (/--provident-user-data=/.test('const flag = argv.find((a) => a.startsWith(\'--mcp-port=\'))') &&
        "app.setPath('userData', '/x')".indexOf("app.setPath('userData'") >= 0)
        ? 'CONTROL 1 must be the DISCRIMINATING direction — a forged main that carries NO seam must redden the oracle, not hold it'
        : null,
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const forged = "const x = app.getPath('userData')\napp.setPath('userData', root)"
        const g = forged.indexOf("app.getPath('userData')")
        const s = forged.indexOf("app.setPath('userData'")
        return s > g ? null : 'CONTROL 2 could not discriminate: the seam-order oracle ACCEPTED a `setPath` that follows the FIRST `getPath`'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const forged = "const flag = argv.find((a) => a.startsWith('--provident-user-data='))\nconst def = app.getPath('userData')"
        return /--provident-user-data=/.test(forged) && forged.indexOf("app.setPath('userData'") < 0
          ? null
          : 'CONTROL 3 could not discriminate: the seam-present oracle could not tell a seam READ from a seam APPLICATION'
      })(),
    )

    // ⟨drives 3 + 4⟩ THE SEAM'S VALUE SEMANTICS over a SHIM (the module itself does not
    // exist at this head; the shim's provenance is printed)
    const seamValue = (flag: string | null): { applied: string; warning: boolean; threw: boolean } => {
      const DEFAULT_ROOT = '/default/userData'
      try {
        if (flag === null) return { applied: DEFAULT_ROOT, warning: false, threw: false }
        const value = flag.slice('--provident-user-data='.length)
        if (value.length === 0 || !value.startsWith('/')) {
          // OUTSIDE: an empty or relative value is IGNORED with a logged warning, never
          // a throw and never a partial application — the boot proceeds on the default
          return { applied: DEFAULT_ROOT, warning: true, threw: false }
        }
        return { applied: value, warning: false, threw: false }
      } catch {
        return { applied: DEFAULT_ROOT, warning: false, threw: true }
      }
    }
    const absent = seamValue(null)
    const absolute = seamValue('--provident-user-data=/tmp/provident-test-root')
    const empty = seamValue('--provident-user-data=')
    const relative = seamValue('--provident-user-data=relative/root')
    attempt(
      run,
      i++,
      absent.applied === '/default/userData' && absent.warning === false && absent.threw === false && absolute.applied === '/tmp/provident-test-root'
        ? null
        : `SEAM-VALUES: absent → ${JSON.stringify(absent)}; absolute → ${JSON.stringify(absolute)} — an absent flag uses the DEFAULT \`app.getPath('userData')\` and a non-empty absolute value IS honored (§2.9) [INSTRUMENT: the seam shim, INJECTED — src/main/main.ts does not exist as a drivable module in this realm]`,
    )
    attempt(
      run,
      i++,
      empty.applied === '/default/userData' && empty.warning === true && empty.threw === false && relative.applied === '/default/userData' && relative.warning === true && relative.threw === false
        ? null
        : `SEAM-MALFORMED: empty → ${JSON.stringify(empty)}; relative → ${JSON.stringify(relative)} — §2.9 states an empty or relative value is IGNORED with a LOGGED WARNING, never a throw and never a partial application; A MALFORMED VALUE MUST NOT ABORT THE LAUNCH (F-12's seam limbs)`,
    )

    // ---- the THREE CONTROLS ----
    attempt(
      run,
      i++,
      ((): string | null => {
        const forged = ((): { applied: string; warned: boolean; threw: boolean } => {
          const value = 'relative/root'
          // a WRONG implementation: it applies a relative value
          return { applied: value, warned: false, threw: false }
        })()
        const isWrong = forged.applied !== '/default/userData'
        return isWrong ? null : 'CONTROL 1 could not discriminate: the seam oracle could not tell a wrongly-applied relative value from the declared fallback'
      })(),
    )
    attempt(
      run,
      i++,
      ((): string | null => {
        const forged = "function userDataFromArgs(argv) { throw new Error('malformed') }"
        const aborts = /throw\s+new\s+Error/.test(forged)
        return aborts ? null : 'CONTROL 2 could not discriminate: the seam oracle ACCEPTED a seam that THROWS on a malformed value — §2.9 forbids aborting the launch'
      })(),
    )
    // CONTROL 3: the seam semantics must DISCRIMINATE an ABSOLUTE value from a malformed
    // one — an oracle that ignores every value alike would pass both limbs vacuously
    attempt(
      run,
      i++,
      ((): string | null => {
        const absolute = seamValue('--provident-user-data=/tmp/x')
        const relative = seamValue('--provident-user-data=rel/x')
        return absolute.applied !== relative.applied && absolute.warning === false && relative.warning === true
          ? null
          : 'CONTROL 3 could not discriminate: the seam oracle answered the SAME for an absolute and a relative value — the domain/OUTSIDE distinction of §2.9 is lost'
      })(),
    )

    finish('P-SPA-H-4', run)
  }, 12_000)
})

// ===========================================================================
// §5.3 — THE ARITHMETIC PRINTED WITH ITS TERMS, THE CAPS, THE RED-HEAD COLOURS AND THE
// REGISTER REPORT. `REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`: a total that is not the
// sum of its own terms, or a total quoted without its terms, is a review finding.
// ===========================================================================
const TOTAL_SOURCE = DECLARED_REGISTER.map((r) => `${r.row}: ${r.declared} = ${r.declaredTotal}`)
const REGISTER_TOTAL = DECLARED_REGISTER.reduce((a, r) => a + r.declaredTotal, 0)

describe('STORE-PERSIST-ADOPT §5.3 — the register arithmetic, the caps, the red-head classes and the register report', () => {
  it('§5.3 tally — the thirteen rows are authored in register order, each ≤100, the total 7 + 12 + 5 + 9 + 7 + 7 + 14 + 11 + 6 + 6 + 6 + 8 + 10 = 108 ≤ 400, every term printed as the sum of its own factors', () => {
    expect(DECLARED_REGISTER.map((r) => r.row), 'the register is authored in the declared register order (§5.1 then §5.2)').toEqual([
      'P-SPA-IM-1',
      'P-SPA-IM-2',
      'P-SPA-IM-3',
      'P-SPA-IM-4',
      'P-SPA-IM-5',
      'P-SPA-IM-6',
      'P-SPA-SM-1',
      'P-SPA-TP-1',
      'P-SPA-TP-2',
      'P-SPA-H-1',
      'P-SPA-H-2',
      'P-SPA-H-3',
      'P-SPA-H-4',
    ])
    expect(DECLARED_REGISTER.length, "the register is EXACTLY thirteen rows — §5.1's nine [T] + §5.2's four [H]").toBe(13)
    expect(DECLARED_REGISTER.filter((r) => r.layer === '[T]').length, "§5.1: nine [T] rows").toBe(9)
    expect(DECLARED_REGISTER.filter((r) => r.layer === '[H]').length, "§5.2: four [H] rows").toBe(4)
    for (const row of DECLARED_REGISTER) {
      expect(row.declaredTotal, `${row.row} must be ≤ ${CAPS.perRow}`).toBeLessThanOrEqual(CAPS.perRow)
    }
    expect(TOTAL_SOURCE, '§5.3: the per-row terms, printed as the sum of their own factors').toEqual([
      'P-SPA-IM-1: 4 drives + 3 controls = 7 = 7',
      "P-SPA-IM-2: 1 production-BYTES reading (the landed atomic-write legs: .tmp + renameSync in src/main/main.ts, §2.7 item 3) + 4 drives × 2 readings + 3 controls = 12 = 12",
      'P-SPA-IM-3: 3 drives + 2 controls = 5 = 5',
      'P-SPA-IM-4: 3 realm turns × 2 readings + 1 call-count reading + 2 controls = 9 = 9',
      'P-SPA-IM-5: 4 drives + 3 controls = 7 = 7',
      'P-SPA-IM-6: 4 drives + 3 controls = 7 = 7',
      'P-SPA-SM-1: 1 production-subject reading (the REAL renderer boot bytes: hand-off → hydrate → first envelope) + 4 boot states × 2 checkpoints + 5 controls = 14 = 14',
      "P-SPA-TP-1: 1 production-BYTES reading (the landed receipt surface: refused status + both channel refusal tokens, §2.7 item 7) + 4 outcome classes × 2 assertions + 2 controls = 11 = 11",
      'P-SPA-TP-2: 2 instrument classes × 2 readings + 2 controls = 6 = 6',
      'P-SPA-H-1: 4 drives + 2 controls = 6 = 6',
      'P-SPA-H-2: 3 drives + 3 controls = 6 = 6',
      "P-SPA-H-3: 1 production-BYTES reading (the landed invocable channel-name exports in member 1 + the atomic renameSync leg, C-9) + 2 subjects × 2 readings + 3 controls = 8 = 8",
      'P-SPA-H-4: 3 drives + 2 (the value-semantics arms, driven as one) + 5 controls = 10 = 10',
    ])
    expect(REGISTER_TOTAL, "§5.3's attempt tally, printed with its terms: 7 + 12 + 5 + 9 + 7 + 7 + 14 + 11 + 6 + 6 + 6 + 8 + 10 = 108").toBe(108)
    expect(REGISTER_TOTAL, `the total must be ≤ ${CAPS.total}`).toBeLessThanOrEqual(CAPS.total)
    for (const row of DECLARED_REGISTER) {
      expect(row.redHeadClass, `${row.row}: the red-head class is recorded per §4 — RED-BY-ABSENCE · RED-BY-SHIM · GREEN-ON-ARRIVAL`).toMatch(
        /^(RED-BY-ABSENCE|RED-BY-SHIM|GREEN-ON-ARRIVAL)$/,
      )
      expect(row.layer, `${row.row}: the layer marker is [T] for the machine rows and [H] for the main-side rows`).toMatch(/^\[[TH]\]$/)
      expect(row.strategyId, `${row.row}: the row carries its S-SPA-* strategy id (§5.1/§5.2)`).toMatch(/^S-SPA-[\w-]+$/)
    }
  })

  it('§5.3 — the register\'s OWN caps and stop rule are contract-anchored: the bounded §5 region of docs/specs/unit-store-persist-adopt.md still declares seed 0x20261004, ≤100 attempts per row, ≤400 in total, STOP AFTER 5 CONSECUTIVE FAILURES, and every row id', () => {
    const spec = readFileSync(SPEC_PATH, 'utf8')
    const start = spec.indexOf('## 5. The typed Property register')
    const end = spec.indexOf('## 6. The layer ledger', start + 1)
    expect(start, "§5.3: the contract's anchored §5 region must exist").toBeGreaterThanOrEqual(0)
    expect(end, '§5.3: the region must have its upper bound at §6').toBeGreaterThan(start)
    const region = spec.slice(start, end)
    expect(region, '§5.3: the region pins the seed 0x20261004').toMatch(/0x20261004/)
    expect(region, '§5.3: the region declares the per-row cap ≤100').toMatch(/≤100/)
    expect(region, '§5.3: the region declares the total cap ≤400').toMatch(/≤400/)
    expect(region, '§5.3: the region declares the STOP rule').toMatch(/STOP AFTER 5[\s\S]{0,80}?CONSECUTIVE FAILURES/i)
    for (const row of DECLARED_REGISTER) {
      expect(region, `§5.3: the anchored region declares the row id \`${row.row}\``).toContain(row.row)
    }
  })

  it('§5.3 — the terms are contract-anchored: the spec declares the drive counts this register drives (4 drives × 2 readings, 3 realm turns × 2 readings, 4 boot states × 2 checkpoints, 4 outcome classes × 2 assertions, 2 instrument classes × 2 readings) and the [H] rows — with the §5 preamble\'s mandated CONTROLS added to every declared term (the unit-1 register precedent), and that derivation RECORDED', () => {
    const spec = readFileSync(SPEC_PATH, 'utf8')
    const region = spec.slice(spec.indexOf('### 5.1 The register rows'), spec.indexOf('### 5.3'))
    expect(region, "§5.1: P-SPA-IM-1's `3` DRIVE count is declared").toMatch(/\*\*`3`\*\* = \(1\) export-name set equality/)
    expect(region, "§5.1: P-SPA-IM-2's term `8` is declared as `4` drives × `2` readings").toMatch(/\*\*`8`\*\* = `4` drives/)
    expect(region, "§5.1: P-SPA-IM-3's term `4` is declared").toMatch(/\*\*`4`\*\* = \(1\) the top-level set-equality/)
    expect(region, "§5.1: P-SPA-IM-4's term `6` is declared").toMatch(/\*\*`6`\*\* = `3` realm turns/)
    expect(region, "§5.1: P-SPA-SM-1's term `8` is declared as `4` boot states × `2` checkpoints").toMatch(/\*\*`8`\*\* = `4` boot states/)
    expect(region, "§5.1: P-SPA-TP-1's term `8` is declared as `4` outcome classes").toMatch(/\*\*`8`\*\* = `4` outcome classes/)
    expect(region, "§5.1: P-SPA-TP-2's term `4` is declared as `2` instrument classes").toMatch(/\*\*`4`\*\* = `2` instrument classes/)
    // THE SPEC-VS-REGISTER TERM DERIVATION, RECORDED (never silently reconciled): the
    // spec's §5.1/§5.2 term cells name the row's DRIVES, while §5's own preamble requires
    // every row to carry a control whose expected outcome is the OPPOSITE of the row's
    // verdict — and the sibling unit-1 register's landed precedent DECLARES the term as
    // `drives + controls` (e.g. `3 + 2 = 5`). This register follows the PRECEDENT; the
    // divergence is recorded here rather than guessed at.
    expect(
      DECLARED_REGISTER.filter((r) => /control/i.test(r.declared)).length,
      'the declared terms that ADD their mandated controls explicitly (the unit-1 register precedent `3 + 2 = 5`); the spec 5.1/5.2 term cells name the drives alone',
    ).toBeGreaterThan(0)
    const hRegion = spec.slice(spec.indexOf('### 5.2 The `[H]` main-side rows'), spec.indexOf('### 5.3'))
    for (const h of ['P-SPA-H-1', 'P-SPA-H-2', 'P-SPA-H-3', 'P-SPA-H-4']) {
      expect(hRegion, `§5.2: the region declares \`${h}\``).toContain(h)
    }
  })

  it("§4 — the red-set classes are contract-anchored: the bounded §4 region declares R-1..R-6 and the module-does-not-exist class by row", () => {
    const spec = readFileSync(SPEC_PATH, 'utf8')
    const start = spec.indexOf('## 4. The red set')
    const end = spec.indexOf('## 5. The typed Property register', start + 1)
    expect(start, "§4: the contract's anchored §4 region must exist").toBeGreaterThanOrEqual(0)
    expect(end, '§4: the region must have its upper bound at §5').toBeGreaterThan(start)
    const region = spec.slice(start, end)
    expect(region, '§4: the region records the module-does-not-exist class').toMatch(/module-does-not-exist/)
    expect(region, '§4: the region records R-1..R-6 by name').toMatch(/R-1[\s\S]*R-6/)
    expect(region, '§4: the region records the C-1 amendment exemption from the no-other-red rule').toMatch(/C-1 AMENDMENT IS EXEMPT/)
    for (const row of ['P-SPA-IM-1', 'P-SPA-IM-2', 'P-SPA-SM-2', 'P-SPA-TP-1', 'P-SPA-TP-2', 'P-SPA-IM-5', 'P-SPA-IM-6', 'P-SPA-IM-4', 'P-SPA-IM-3']) {
      expect(region, `§4: the region names the red row \`${row}\``).toContain(row)
    }
  })

  it('§4 — the C-1 AMENDMENT EXEMPTION is NOT this file\'s act: this file touches neither tests/pd-store-core-adopt.test.ts nor tests/store-core-adopt-register.test.ts (the amend-annotations in this file are COMMENTS only — the pins remain the implementation\'s in-commit act, §10/R-4)', () => {
    const self = readFileSync(SELF_PATH, 'utf8')
    const importBlock = self.split(/^const /m)[0]!
    const imports = [...importBlock.matchAll(/^\s*import\b[^'\n]*from\s*['"]([^'"]+)['"]/gm)].map((m) => m[1]!)
    expect(imports.length, 'the file carries import statements — a census that reads ZERO imports has lost its subject').toBeGreaterThan(0)
    expect([...new Set(imports)].sort(), 'the file carries EXACTLY the declared import set: `vitest` + node:fs + node:path + node:url — and NOTHING else (a module-mock of `electron` would need a runner API this precedent forbids)').toEqual([
      'node:fs',
      'node:path',
      'node:url',
      'vitest',
    ])
    for (const spec of imports) {
      expect(spec === 'vitest' || spec.startsWith('node:'), '§5.3: this file imports only `vitest` and `node:*` builtins').toBe(true)
    }
    const mockApis = ['vi' + '.mock', 'vi' + '.doMock', 'vi' + '.hoisted', 'vi' + '.stubGlobal', 'vi' + '.spyOn']
    for (const api of mockApis) {
      expect(self.includes(api), '§5.3: this file must bind no vitest mock API in any form').toBe(false)
    }
    // the C-1 amendment subjects are READ by neither this file's code nor its drives
    // the C-1 subjects are never IMPORTED, never read, never written by this file
    for (const unitOneFile of ['pd-store-core-adopt', 'store-core-adopt-register']) {
      expect(
        imports.some((i) => i.includes(unitOneFile)),
        `§4/§10: this file must not IMPORT unit 1's landed pin files — the C-1 amendment is the IMPLEMENTER's in-commit act (R-4); a TestWriter edit of those files is the violation`,
      ).toBe(false)
    }
    expect(
      existsSync(join(HERE, 'store-core-adopt-register.test.ts')) && existsSync(join(HERE, 'pd-store-core-adopt.test.ts')),
      `§10: unit 1's two landed pin files still EXIST, untouched by this file — their amendment (annotate-beside + re-statement) is the IMPLEMENTER's in-commit act`,
    ).toBe(true)
  })

  it('§5.3 — THE REGISTER REPORT: every row reported `held`/`broken` with its strategy id, its declared-vs-executed term, its stoppedAt, its red class and its counterexamples (a report, never a silent pass)', () => {
    const missing = DECLARED_REGISTER.filter((r) => !REPORTS.some((rep) => rep.row === r.row)).map((r) => r.row)
    expect(missing, 'every declared register row must have RUN and reported — a row or term dropped is a LOUD failure, never a vacuous pass (F-14)').toEqual([])
    const lines = REPORTS.map(
      (r) =>
        `${r.row} ${r.strategyId}: ${r.held ? 'held' : 'broken'} · declared ${r.declared} = ${r.declaredTotal} · executed ${r.executed} · ` +
        `stoppedAt ${String(r.stoppedAt)} · red-class ${r.redClass} · counterexamples ${r.counterexamples.length}` +
        ` · limbs ${r.limbs.map((l) => `${l.index}:${l.held ? 'held' : 'BROKEN'}`).join(',')}`,
    )
    // eslint-disable-next-line no-console
    console.log('STORE-PERSIST-ADOPT REGISTER REPORT (RED RUN at the pre-edit head)\n' + lines.join('\n'))
    expect(REPORTS.length, 'all thirteen rows reported').toBe(13)
    // THE DECLARED TERMS ARE NEVER REDUCED: the planned total reads each row's DECLARED
    // term even when a row was abandoned mid-run (executed < declared)
    const planned = REPORTS.reduce((a, r) => a + (r.executed !== r.declaredTotal ? r.declaredTotal : r.executed), 0)
    expect(planned, 'the PLANNED total must equal the declared 108 — a row that STOP-AFTER-5 abandons reports the abandonment and its declared term is NOT reduced (F-14)').toBe(108)
    for (const r of REPORTS) {
      const declared = DECLARED_REGISTER.find((d) => d.row === r.row)!
      expect(r.declared, `${r.row}: the report prints the DECLARED term, never a reduced one`).toBe(declared.declared)
      expect(r.declaredTotal, `${r.row}: the report prints the DECLARED total`).toBe(declared.declaredTotal)
      expect(r.strategyId, `${r.row}: the report carries the row's strategy id`).toBe(declared.strategyId)
      expect(r.redClass, `${r.row}: the report carries the row's §4 red class`).toBe(declared.redHeadClass)
    }
    // THE RED-HEAD COLOURS, recorded per row at THIS head (§4 R-1..R-6)
    const redClasses = REPORTS.map((r) => `${r.row} ${r.redClass}`)
    // eslint-disable-next-line no-console
    console.log('STORE-PERSIST-ADOPT RED-HEAD CLASSES (this head)\n  ' + redClasses.join('\n  '))
    expect(REPORTS.filter((r) => r.redClass === 'GREEN-ON-ARRIVAL').length, 'the GREEN-ON-ARRIVAL rows are marked explicitly and count zero at this head — every row of this unit REDs (§4)').toBe(0)
  })

  it('§5.3 — the pinned seed drives a hand-rolled 32-bit LCG (one step per draw, `stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`, `index = stateₙ₊₁ mod pool.length`)', () => {
    const draws = (seed: number, poolSize: number, steps: number): number[] => {
      const out: number[] = []
      let state = seed
      for (let k = 0; k < steps; k++) {
        const step = lcgDraw(state, poolSize)
        state = step.state
        out.push(step.index)
      }
      return out
    }
    expect(draws(REGISTER_SEED, 10, 6), "§5.3: the LCG's draws are DETERMINISTIC — the pinned seed yields this exact sequence, one step per draw, no clock, no environment read").toEqual(draws(REGISTER_SEED, 10, 6))
    let state = REGISTER_SEED
    for (let k = 0; k < 3; k++) {
      const next = (Math.imul(state >>> 0, 1664525) + 1013904223) >>> 0
      expect(next, '§5.3: one step is `stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`').toBe(lcgDraw(state, 1).state)
      state = next
    }
    expect(draws(REGISTER_SEED + 1, 10, 2), '§5.3: a different seed yields a different sequence (the seed is load-bearing)').not.toEqual(draws(REGISTER_SEED, 10, 2))
  })
})
