// tests/unit-o-0-driver-contract.test.ts — TestWriter RED set (SOURCE-CONTRACT)
// for the O-0 harness surface in `scripts/live-drive.mjs`.
//
// Spec source: docs/specs/unit-o-0-per-stage-measurement.md
//   §3.1  the CLOSED 5 `o0_*` block names + their emitted fragments
//   §3.2  the block result shape (diagResult: row/dclass null, realInput false,
//         proxyPASS false, pass false, diagnostic true, extra.o0 = the freeze row)
//   §3.3  the pinned CLI flags (existing unchanged + `--gpu`, `--o0-corpus=`,
//         `--o0-out=`) and the conditional `--no-gpu`
//   §3.4  the seed `o0-2026-09-17` + the operator corpus census
//   §3.5  the run commands the artifact must record
//   §3.6  MANDATORY bundle identity (`driver.build` served-vs-disk) + the
//         measurement-only hook allowance (inert when unarmed)
//   §4.1  the committed artifact path
//   §3.6b the seam re-derivation + the two recorder instances (D19-D23: the
//         driver's self-validation over its OWN report, the non-vacuous
//         inertness rule, the mirror DELETION + the loud twin-import abort, the
//         caller-level seam (no page-side `provident.rag.*` wrap), the record
//         instance attribution, the structural marker and `mainSeamArmed`)
//   §6.1  the driver's non-row (diagnostic) result discipline + F6 (abort, exit 2)
//   §6 S11/S14-S17, F13a/F16/F17 — the fail-states the re-derivation pins
//
// WHY THIS IS A NODE-STATIC TEST (the tests/live-drive-contract.test.ts
// convention): `scripts/live-drive.mjs` calls `main(process.argv.slice(2))` at
// MODULE SCOPE, so importing it would spawn/attach the Electron app. These are
// SOURCE-CONTRACT assertions ONLY — never a claim about live behavior.
//
// DATA STATES ENUMERATED (the driver source is the unit under test):
//   S1 the 5 O-0 blocks present in the BLOCKS table, each returning diagResult
//   S2 the O-0 report fragment reachable from each block (`extra.o0`)
//   S3 the CLI surface: the new flags parsed + `--no-gpu` conditional
//   S4 the artifact path writable from the driver (`--o0-out`)
//   S5 the bundle-identity fields present in the emitted run rows
//   S6 the measurement-only hook (armed/inert) + its falsifiability row
//
// FAIL-STATES PINNED (the driver may not violate these):
//   F6  a hard failure aborts (catch → exit 2) and never writes a partial artifact
//   F4  `unseparated` is a recorded field on every stage entry (never imputed)
//   §6  the block loop prints FAIL + a non-zero exit code on a throw
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'

const SPEC = 'docs/specs/unit-o-0-per-stage-measurement.md'
const DRIVER_URL = new URL('../scripts/live-drive.mjs', import.meta.url)
const SRC = readFileSync(DRIVER_URL, 'utf8')

const O0_BLOCKS = ['o0_folder_row', 'o0_document_row', 'o0_gpu_control', 'o0_track_ablation', 'o0_repeat_determinism'] as const

/** The `BLOCKS` region (one `  <name>: [async] (h) => {` entry per block). */
function blocksRegion(): string {
  const lines = SRC.split('\n')
  const open = lines.findIndex((l) => /^const BLOCKS = \{/.test(l))
  if (open < 0) return ''
  let close = -1
  for (let i = open + 1; i < lines.length; i++) if (lines[i] === '}') { close = i; break }
  return lines.slice(open + 1, close < 0 ? lines.length : close).join('\n')
}
const REGION = blocksRegion()
const BLOCK_HEADER = /^ {2}([A-Za-z_$][\w$]*):\s*(?:async\s*)?\(?\s*h\s*\)?\s*=>\s*\{/
const BLOCK_ENTRIES: Array<{ name: string; body: string }> = (() => {
  const lines = REGION.split('\n')
  const heads: Array<{ name: string; line: number }> = []
  lines.forEach((l, i) => { const m = BLOCK_HEADER.exec(l); if (m) heads.push({ name: m[1], line: i }) })
  return heads.map((hd, i) => ({ name: hd.name, body: lines.slice(hd.line, i + 1 < heads.length ? heads[i + 1].line : lines.length).join('\n') }))
})()
function blockBody(name: string): string {
  return BLOCK_ENTRIES.filter((b) => b.name === name).map((b) => b.body).join('\n')
}
/** The CLI argument-parse region inside `main(argv)`. */
function cliRegion(): string {
  const at = SRC.indexOf('async function main(argv)')
  return at < 0 ? '' : SRC.slice(at, at + 3000)
}
/** The spawn/launch region (the conditional `--no-gpu`, §3.3). */
function spawnRegion(): string {
  const at = SRC.indexOf('const launchArgs =')
  return at < 0 ? '' : SRC.slice(Math.max(0, at - 900), at + 900)
}

describe(`O-0 §3.1 — the CLOSED 5 o0_* blocks (${SPEC} §3.1/§3.2/§8.1)`, () => {
  it('D1 the BLOCKS table parses and contains all 5 O-0 block names (census §8.1 = 5)', () => {
    expect(REGION, 'the BLOCKS region did not parse — keep one `  <name>: [async] (h) => {` entry per block').not.toBe('')
    const missing = O0_BLOCKS.filter((n) => blockBody(n) === '')
    expect(
      missing,
      `the O-0 block(s) ${missing.join(', ')} do not exist in scripts/live-drive.mjs — §3.1 pins exactly 5 blocks ` +
        `(${O0_BLOCKS.join(', ')}); each drives ONE freeze (§2 "one freeze per block")`,
    ).toEqual([])
    const o0 = BLOCK_ENTRIES.map((b) => b.name).filter((n) => n.startsWith('o0_'))
    expect([...new Set(o0)].sort(), 'no extra/duplicated o0_* block may be added (§3.1 is a CLOSED set of 5)').toEqual([...O0_BLOCKS].sort())
  })

  it('D2 every O-0 block returns the §3.2 diagResult shape (a diagnostic non-row: pass:false, no matrix row)', () => {
    const offenders = O0_BLOCKS.filter((n) => !/diagResult\s*\(/.test(blockBody(n)))
    expect(
      offenders,
      `O-0 block(s) not returning diagResult(detail, extra): ${offenders.join(', ') || '(none)'} — §3.2 requires the ` +
        'driver-declared NON-row shape (row/dclass null, realInput false, proxyPASS false, pass false, diagnostic true)',
    ).toEqual([])
    const claiming = O0_BLOCKS.filter((n) => /row\s*:\s*'(?:U-\d+|UF-[A-Z0-9])/.test(blockBody(n)))
    expect(claiming, `O-0 blocks must claim NO matrix/extended row (§3.2: §5.U stays at 8)`).toEqual([])
  })

  it('D3 each O-0 block carries its §4.3 freeze row under `extra.o0`', () => {
    const offenders = O0_BLOCKS.filter((n) => !/\bo0\s*:/.test(blockBody(n)))
    expect(
      offenders,
      `O-0 block(s) with no \`o0\` extra field: ${offenders.join(', ') || '(none)'} — §3.2 requires ` +
        '`extra.o0 = <the freeze row(s) of §4.3>` so the artifact can be written from the block output',
    ).toEqual([])
  })

  it('D4 the §4.3 freeze-row fields the artifact needs are produced by the driver (id/block/gesture/target/path/stages/longTasks/mutations/wallMs/gpu/pass/failReasons)', () => {
    const fields = ['id', 'block', 'gesture', 'target', 'path', 'stageCount', 'stages', 'longTasks', 'longTaskTotalMs', 'mutations', 'wallMs', 'gpu', 'trackAblation', 'bundleVerified', 'pass', 'failReasons']
    const absent = fields.filter((f) => !new RegExp(`\\b${f}\\b`).test(REGION))
    expect(
      absent,
      `the §4.3 freeze-row field(s) ${absent.join(', ')} appear nowhere in the O-0 blocks (and nowhere in BLOCKS) — the ` +
        'emitted artifact cannot satisfy the report-shape contract without them',
    ).toEqual([])
  })

  it('D5 the folder-row block uses the PINNED row selection (largest child-row count, ties lexicographic — §2.3), never a first-match pick', () => {
    const body = blockBody('o0_folder_row')
    expect(body, 'BLOCKS.o0_folder_row must exist').not.toBe('')
    expect(body, 'the folder gesture must target the pinned `#pane-doc-nav [data-folder-path]` selector').toMatch(/data-folder-path/)
    expect(body, 'the block must record the chosen folder path in the row (`folderPath`, §4.3)').toMatch(/folderPath/)
    expect(
      body,
      'the row selection must be the PINNED largest-child-row-count pick with the lexicographic tie-break (§2.3: a first-match ' +
        'pick would under-measure the operator corpus and make the artifact irreproducible)',
    ).toMatch(/childRowCount|child-row|largest|sort\(/)
  })

  it('D6 the document-row block drives a real doc-nav document-row gesture and the repeat block re-reports the stage-id SET (§3.1 P-SM-2)', () => {
    const doc = blockBody('o0_document_row')
    expect(doc, 'BLOCKS.o0_document_row must exist').not.toBe('')
    expect(doc, "the document gesture must be recorded as `gesture: 'document-row'`").toMatch(/document-row/)
    expect(doc, 'the block must record the focused document id (`documentId`, §4.3)').toMatch(/documentId/)
    const rep = blockBody('o0_repeat_determinism')
    expect(rep, 'BLOCKS.o0_repeat_determinism must exist').not.toBe('')
    expect(rep, 'the determinism block must re-run one gesture block and compare the stage-id SET (§3.1/§5 P-SM-2)').toMatch(/stageIds|stage-?id/i)
    const pair = blockBody('o0_gpu_control')
    expect(pair, 'the GPU block must PAIR its two leg runs (§3.1: "the pairing … is their point")').toMatch(/pairedWith|pair/i)
    const abl = blockBody('o0_track_ablation')
    expect(abl, 'the ablation block must apply a plain `display:block` to the stage grid cell (§2.4)').toMatch(/display\s*:?\s*'?block/)
    expect(abl, 'the ablation must be recorded as `trackAblation` with the exact style mutation (§4.3)').toMatch(/trackAblation|mutation/)
  })
})

describe(`O-0 §3.3 — the pinned CLI flags + the conditional --no-gpu (${SPEC} §3.3/§8.1)`, () => {
  it("D7 `--gpu`, `--o0-corpus=` and `--o0-out=` are parsed (3 new flags, census §8.1)", () => {
    const cli = cliRegion()
    expect(cli, 'the CLI parse region inside main(argv) was not found').not.toBe('')
    for (const flag of ['gpu', 'o0-corpus', 'o0-out']) {
      expect(
        cli,
        `the pinned O-0 flag \`--${flag}\` is not parsed in main(argv) (§3.3 pins exactly three new flags: --gpu, --o0-corpus=, --o0-out=)`,
      ).toMatch(new RegExp(`['"]${flag}['"]|${flag.replace('-', '\\-')}`))
    }
  })

  it("D8 the three flags are default-safe: `--gpu` off, `--o0-corpus` none, `--o0-out` none (default behavior unchanged)", () => {
    const cli = cliRegion()
    expect(cli, 'the O-0 option defaults must be declared in the `opt` initializer (§3.3 "both minimal, both default-safe")').toMatch(/o0/)
    expect(cli, '`--gpu` must default off (today\'s sanctioned launch path is the GPU-OFF leg)').toMatch(/gpu\s*:\s*false/)
  })

  it('D9 the launch args carry `--no-gpu` UNLESS `--gpu` is passed (§3.3: live-drive.mjs:2676 becomes conditional)', () => {
    const spawn = spawnRegion()
    expect(spawn, 'the launch-args region was not found').not.toBe('')
    expect(
      spawn,
      'launchArgs still hard-codes `--no-gpu` unconditionally — the GPU-ON leg is not reproducible (§2.4/§3.3), so the ' +
        'artifact could never carry both legs',
    ).toMatch(/(?:opt\.)?gpu\s*\?|gpu\s*&&|if\s*\([^)]*gpu/)
    expect(spawn, 'the conditional must still emit `--no-gpu` on the default (GPU-off) path').toMatch(/--no-gpu/)
  })

  it('D10 the existing flags are honored unchanged (§3.3) and `--display` still propagates into the spawn env', () => {
    const cli = cliRegion()
    for (const f of ['mode', 'port', 'cdp-port', 'home', 'seed', 'groups', 'block', 'display', 'no-seed', 'keep-home', 'connect']) {
      expect(cli, `the existing flag \`--${f}\` must keep parsing unchanged (§3.3)`).toContain(f)
    }
    expect(SRC, "§3.3: the spawn env sets DISPLAY from --display (the repo's env note)").toMatch(/DISPLAY:\s*'?:?'?\s*\+|DISPLAY:/)
  })
})

describe(`O-0 §3.5/§4.1/§3.6 — the artifact is writable, carries the run command + the bundle identity (${SPEC} §3.5/§3.6/§4.1)`, () => {
  it('D11 `--o0-out` WRITES the emitted report JSON to a file (the artifact cannot be committed otherwise)', () => {
    expect(
      SRC,
      'no file write for the O-0 report exists — §3.3/§4.1 require `--o0-out=<path>` to write the emitted report JSON ' +
        '(the driver today only prints; the committed artifact needs a file)',
    ).toMatch(/writeFileSync|writeFile\(|createWriteStream/)
    expect(SRC, 'the artifact path must come from the `--o0-out` option (opt.o0Out)').toMatch(/o0Out|o0-out/)
  })

  it("D12 a run without `--o0-out` records `artifactPath: null` (console-only output is a fail-state in the provenance, §3.3)", () => {
    expect(
      SRC,
      '§3.3: a run without --o0-out must record `artifactPath: null` in the report provenance',
    ).toMatch(/artifactPath/)
  })

  it('D13 the mandatory bundle identity (§3.6) is computed served-vs-disk and forces `verified:false` on a mismatch (F2)', () => {
    expect(SRC, 'the report must carry `driver.build` (§3.6)').toMatch(/build\s*:/)
    expect(
      SRC,
      'no comparison of the SERVED bundle against the ON-DISK file exists — §3.6 (docs/live-testing.md:119-124) requires ' +
        '`driver.build.verified` from exactly that comparison; a report with verified !== true is pass:false (F2)',
    ).toMatch(/dist\/(?:renderer\/renderer\.js|main\/main\.cjs)/)
    expect(SRC, 'the bundle identity must include the served-vs-disk verification flag').toMatch(/verified/)
    expect(SRC, 'the bundle identity must record the identity of the served bundle').toMatch(/served/)
  })

  it('D14 the artifact path is the committed §4.1 path and the exact §3.5 commands are recorded', () => {
    expect(
      SRC,
      "§3.5: the artifact's provenance must record the exact run commands used, incl. the pinned --block list",
    ).toMatch(/--block=o0_|o0_folder_row,o0_document_row|commands\s*:/)
    expect(
      SRC,
      '§4.1: the committed artifact path `docs/specs/unit-o-0-per-stage-breakdown.md` must be nameable from the driver ' +
        '(the report/artifact identity, or a doc pointer carrying it)',
    ).toMatch(/unit-o-0-per-stage-breakdown|o-0-per-stage-breakdown/)
    expect(SRC, "§3.4: the pinned seed 'o0-2026-09-17' must be the RECORDED run.seed constant").toMatch(/o0-2026-09-17/)
  })

  it('D15 §3.6 the measurement-only hook is INERT when unarmed and falsifiable (an armed hook that changes the numbers forces pass:false)', () => {
    expect(
      SRC,
      'no measurement-only hook surface exists (§3.6 permits `window.__o0`, armed by the block, for stages 4-8 only)',
    ).toMatch(/__o0/)
    const hooked = /__o0[\s\S]{0,400}?(armed|inert)/.test(SRC) || /(armed|inert)[\s\S]{0,400}?__o0/.test(SRC)
    expect(
      hooked,
      '§3.6(a): the hook must be INERT when unarmed (an armed/unarmed flag), and §3.6(c): a hook-induced change to the ' +
        'mutation count or the long-task total must force pass:false — neither is expressed in the driver',
    ).toBe(true)
  })

  it('D16 §6 F6 a hard failure ABORTS loudly (catch → exit code 2) and never writes a partial artifact', () => {
    expect(
      SRC,
      "the driver's main() catch must keep the F6 abort discipline (print `[live-drive] ERROR: <message>` + a non-zero exit code)",
    ).toMatch(/\[live-drive\] ERROR:/)
    expect(SRC, 'F6: the abort exit code must be non-zero (2)').toMatch(/process\.exitCode\s*=\s*2|process\.exit\(2\)/)
  })

  it('D17 §6 the block loop stays fail-loud (a throw prints FAIL + a non-zero exit code — a block that crashes is never a silent skip)', () => {
    const at = SRC.indexOf('for (const n of names)')
    const loop = at < 0 ? '' : SRC.slice(at, at + 1200)
    expect(loop, 'the per-block loop must keep printing a FAIL line on a throw').toMatch(/catch\s*\(/)
    expect(loop, 'a thrown block must increment the FAIL count').toMatch(/fail\+\+/)
    expect(SRC, 'a failing run must set a non-zero exit code').toMatch(/process\.exitCode\s*=\s*fail\s*>\s*0/)
  })

  it('D18 §4.3 the `unseparated` marker exists on the emitted stage entries (F4: a stage that cannot be separated is never imputed)', () => {
    const region = REGION
    expect(region, '`unseparated` is absent from every O-0 block — §4.3/§6 F4 require the marker + `ms: null` for a stage that cannot be separated').toMatch(/unseparated/)
    expect(region, 'the run must report the unseparated stage ids (F4: `unseparatedStages: [<ids>]`)').toMatch(/unseparatedStages|unseparated:/)
  })
})

// ===========================================================================
// §D2 — the §3.6b / §4.3-H3 / §6 S14-S17 re-derivation pins (§7 row 13's
//       TEST REMAND: the driver-contract file had NO row for the self-validation,
//       the non-vacuous inertness, the mirror deletion/abort, the window-bound
//       rule or the two-instance seam union). Source-contract only — never a
//       live claim about behavior.
// ===========================================================================
/** The span of ONE driver function (its declaration to the next top-level
 *  `function `/`async function ` declaration). */
function fnSpan(name: string): string {
  const at = SRC.indexOf(`function ${name}(`)
  if (at < 0) return ''
  const rest = SRC.slice(at)
  const next = rest.slice(1).search(/\n(?:async )?function [A-Za-z_$]/)
  return next < 0 ? rest : rest.slice(0, next + 1)
}

describe(`O-0 §3.6b/§4.3 — driver self-validation, the mirror deletion, the caller-level seams (${SPEC} §3.6b/§4.3/§6 S14-S17)`, () => {
  it('D19 §3.6b/F17a the driver runs the PURE validator over its OWN report BEFORE writing it, folds the validator failReasons into `driver.failReasons`, records `driver.selfValidation`, and still WRITES a rejected report with pass:false', () => {
    const build = fnSpan('o0BuildReport')
    expect(build, '`o0BuildReport` not found — §3.6b pins it as the site that validates its own report before writing').not.toBe('')
    for (const fn of ['validateO0Run', 'validateO0Report']) {
      expect(
        build,
        `o0BuildReport never calls \`${fn}\` — §3.6b: the driver's inline rules (\`o0RowPass\`) re-implement a SUBSET of the pinned module's row rules and can (and on this unit DID) disagree about which rows are acceptable. \`o0BuildReport\` must run the pure validator over the report it just built.`,
      ).toMatch(new RegExp(`${fn}\\s*\\(`))
    }
    expect(
      build,
      '`driver.selfValidation` must record `{ok, attempts, runIds, errors}` (§3.6b/F17a) — without it the self-validation is unobservable in the artifact',
    ).toMatch(/selfValidation/)
    expect(
      build,
      'the validator’s failReasons must be APPENDED to the driver’s own (`driver.failReasons`) so a report can never be written whose rows the pinned module would reject (§3.6b/F17a)',
    ).toMatch(/failReasons[\s\S]{0,160}?(push|concat|\.\.\.)|(push|concat|\.\.\.)[\s\S]{0,160}?failReasons/)
    expect(
      SRC,
      'F17a pins the forcing-reason shape: `driver self-validation rejected <n> row(s): <the validator’s reason(s)> (§3.6b)`',
    ).toMatch(/driver self-validation rejected/)
    expect(
      SRC,
      '§3.6b: the self-validation must run through the SAME guarded twin-import mechanism as `o0-hook.ts` — the driver must import the pinned report module (no re-implementation)',
    ).toMatch(/src\/shared\/o0-report\.ts/)
    // The report is STILL WRITTEN (the numbers stay inspectable) — never gated on
    // its own pass. A report carrying a duplicated stage id is therefore written
    // with pass:false + the validator's reason.
    const writeAt = SRC.indexOf('o0WriteReport(report')
    expect(writeAt, 'the driver must still write the report via `o0WriteReport(report, opt)` (F6/F16: no artifact only on a HARD abort)').toBeGreaterThan(-1)
    const before = SRC.slice(Math.max(0, writeAt - 400), writeAt)
    expect(
      before,
      '§3.6b: the report must be WRITTEN even when self-validation rejects it — the write is gated on `report.pass` (the numbers must stay inspectable)',
    ).not.toMatch(/if\s*\(\s*!?\s*report\.pass\s*\)/)
    expect(
      SRC,
      '§3.6b: the self-validation must run BEFORE the write (it is part of `o0BuildReport`, which `main()` calls ahead of `o0WriteReport`)',
    ).toBeTruthy()
    const svAt = SRC.indexOf('selfValidation')
    const writeAt2 = SRC.indexOf('function o0WriteReport(')
    expect(
      svAt < writeAt2,
      'the self-validation belongs to the build, i.e. its site must precede `o0WriteReport` in the source (a report is validated BEFORE it is written)',
    ).toBe(true)
  })

  it('D20 §6 S17/F17b the driver forces pass:false when runs ARMED the hook but NO inertness comparison was recorded — an empty `hookInertness` is legal only when nothing armed', () => {
    const pass = fnSpan('o0DeriveReportPass')
    expect(pass, '`o0DeriveReportPass` not found — §6 S17/F17b pins the vacuity rule there').not.toBe('')
    expect(
      pass,
      'F17b: a report whose runs armed the hook but carries no `driver.hookInertness` entry must be pass:false (`driver.hookInertness: []` is legal ONLY when no run armed the hook) — §12 finding 12 (the GPU-ON leg armed both runs and recorded no comparison)',
    ).toMatch(/hookInertness/)
    expect(
      pass,
      'F17b pins the reason shape: `no hook inertness comparison was recorded although <n> run(s) armed the hook — an unverified arm is not an inert arm`',
    ).toMatch(/no hook inertness comparison was recorded/)
    expect(
      pass,
      'the vacuity reason must name the §3.6(c) rule it enforces (the armed half of the inertness contract)',
    ).toMatch(/3\.6\s*\(c\)/)
    expect(
      SRC,
      'the driver must be able to see that a run ARMED the hook (the per-run arming flag the vacuity rule counts)',
    ).toMatch(/armed/)
  })

  it('D21 §3.6b/F16 the in-driver MIRROR of the stage-row aggregation is DELETED (option (b)): one implementation, one legal `stageRowsSource`, and an unavailable `.ts` twin import fails LOUD', () => {
    expect(
      SRC,
      'the in-driver mirror `o0StagesFromHookRecords` still EXISTS as a local implementation — §3.6b pins option (b): the mirror is DELETED, not audited (two implementations of one contract is a drift surface no recording field can close)',
    ).not.toMatch(/function\s+o0StagesFromHookRecords\s*\(/)
    expect(
      SRC,
      'the former mirror source value `driver-mirror:o0StagesFromHookRecords` is still reachable — §6 S11/F16 pin exactly ONE legal `hook.stageRowsSource` value',
    ).not.toMatch(/driver-mirror:o0StagesFromHookRecords/)
    expect(
      SRC,
      "the ONE legal value must be recorded: `hook.stageRowsSource = 'src/shared/o0-hook.ts:stagesFromO0HookRecords'` (§3.6b/§6 S11)",
    ).toMatch(/['"]src\/shared\/o0-hook\.ts:stagesFromO0HookRecords['"]/)
    expect(
      SRC,
      'the driver must import the pinned `.ts` twin exactly as it imports `src/shared/o0-report.ts` (§3.6b)',
    ).toMatch(/src\/shared\/o0-hook\.ts/)
    // The twin import must not be swallowed into a fallback: a `catch` that
    // assigns a null/"unavailable" sentinel (or any silent fallback assignment) is
    // the F16 defect. An unavailable import is a LOUD abort (`[live-drive] ERROR:`
    // + exit 2, no artifact).
    const twinAt = SRC.indexOf("src/shared/o0-hook.ts'")
    const twin = twinAt < 0 ? '' : SRC.slice(Math.max(0, twinAt - 600), twinAt + 600)
    expect(twin, 'the `.ts` twin import region must exist').not.toBe('')
    expect(
      twin,
      'the twin import is wrapped in a `catch` that swallows the failure — §3.6b/F16: an unavailable import is a loud abort ([live-drive] ERROR: + exit 2, NO artifact), never a fallback that emits a number',
    ).not.toMatch(/catch\s*\(/)
    expect(
      twin,
      'a fallback sentinel is still assigned to the twin handle — F16 forbids any silent fallback around the pinned module import',
    ).not.toMatch(/=\s*null\s*$/m)
    expect(SRC, 'F16 keeps the F6 abort discipline (the loud failure path the twin import must ride)').toMatch(/\[live-drive\] ERROR:/)
    expect(SRC, 'F16: the abort exit code stays non-zero (2) with no artifact written').toMatch(/process\.exitCode\s*=\s*2|process\.exit\(2\)/)
  })

  it('D22 §3.6b/§2.2 1/3 NO page-side wrap of `provident.rag.*` is attempted: the preload props are frozen (non-writable/non-configurable), so the round trip is recorded at the shell’s OWN call sites', () => {
    expect(
      SRC,
      '§3.6b: `window.provident.rag.snapshot`/`.docHeads` are `contextBridge` properties (`{writable:false, configurable:false}`, probed live — §12 H2), so a page-side wrap can never take; the page hook must attempt NONE (the bridge-wrap map is history, not contract)',
    ).not.toMatch(/\.wrap\(\s*['"`][^'"`]+['"`]\s*,\s*['"`]rag\./)
    expect(
      SRC,
      'the page-side bridge-wrap map still names a `rag.*` target — the CALLER-level seams of §3.6b replace it (the renderer records `snapshot.roundtrip`/`docheads.roundtrip` inside the bundle)',
    ).not.toMatch(/O0_BRIDGE_STAGES\s*=\s*\{[^}]*rag\./)
    expect(
      SRC,
      '§3.6b: the page-side hook may arm only the RENDER path through the published handle — the two bridge stages must not be page-wrapped',
    ).toMatch(/rendererArmed|__o0recorder/)
  })

  it('D23 §6 S14/F14 + §3.6b the driver attributes every record to its recorder instance, records the main-side arm, and keeps the STRUCTURAL vs merely-UNMEASURED distinction in its reasons', () => {
    expect(
      SRC,
      '§3.6b: `hook.stageRecords[]` must carry, per record, the instance it came from (`renderer` | `main`), so a reader can attribute every number',
    ).toMatch(/stageRecords/)
    expect(SRC, '§3.6b: the record instance attribution must name both instances').toMatch(/['"]renderer['"]/)
    expect(
      SRC,
      '§6 S14/F14: the STRUCTURAL marker must survive into the emitted rows/reasons — a stage with no seam in the executing bundle is `structural:true` + a `structuralReason`, never a bare `unseparated`',
    ).toMatch(/structuralReason|structural\s*:/)
    expect(
      SRC,
      '§6 S14 pins the reason form for the structural branch: `stage <id> is structurally unseparated — <reason>` (a reader must be able to tell "there is no seam" from "the seam was not armed")',
    ).toMatch(/structurally unseparated/)
    expect(
      SRC,
      '§3.6b/S15: the main-side refinement presence is RECORDED per leg (`driver.mainSeamArmed: true|false`) — a `--connect` run cannot arm it and that is recorded, never silently assumed',
    ).toMatch(/mainSeamArmed/)
  })
})
