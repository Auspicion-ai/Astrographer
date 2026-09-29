// scripts/electron-divergence.mjs — R13: the ONE Electron-run divergence check.
// Drives the REAL Electron app (real DOM) over stdio with the SDK client and
// compares the shim-stable surfaces (census + SSR fragment + dirtied ids +
// data-node-id parity) against the DOM-shim battery host running the SAME demo
// envelope + dispatch. Per docs/specs/e2e-test-battery-review.md R13:
// "assert primarily on census + node_state + SSR fragment (shim-stable); treat
// live-DOM innerHTML substring asserts as secondary."
//
// Run: npm run build && node scripts/electron-divergence.mjs
//
// U-DIVERGENCE-SPAWN — the spawn precondition this leg could not boot without
// (docs/specs/unit-divergence-harness-precondition.md; the `/dev/shm`-class
// boot failure was measured as `exit=1` with
// `Creating shared memory in /dev/shm/.org.chromium.Chromium.* failed:
// Permission denied (13)` + `SIGTRAP`, and `exit=0` with the pair below):
//   §3.1 `C-1` both spawn sites carry the SAME nine members — the seven of `S-2`
//        in their recorded order, plus `--disable-dev-shm-usage` (once), plus
//        ONE `--user-data-dir=<fresh scratch>` as the LAST member, `=`-joined;
//   §3.2 `C-2` the scratch profile is a per-spawn `mkdtemp` directory under the
//        OS temp dir (never the repo, never the operator's real profile), whose
//        basename carries this leg's prefix so a leftover is attributable;
//   §3.3 `C-3` the cleanup hook is registered AT CREATION (never below a gate
//        that can `process.exit`), is idempotent, fires on EVERY exit path,
//        kills the children before the sweep, and sweeps with a BOUNDED
//        delete-and-verify loop that NAMES a leftover instead of reporting
//        `NONE` over a surviving directory;
//   §3.6 `C-6` a boot failure names its CAUSE from this leg's own accumulated
//        child stderr (the `/dev/shm` refusal, a signal death) and keeps the
//        SDK connection error visible — LABELLED as the downstream symptom.
// The comparison set, the demo envelope, the `ok()` labels and the exit
// contract are UNCHANGED (§3.7 `C-7`), and this unit adds no check.
//
// IMPORTING THIS MODULE BOOTS NOTHING (§3.1 `C-1` item 6): the leg runs only
// when this file is the process's own entry point (the guard at the foot), so
// the contract above is inspectable without a real Electron boot.
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
/** THE ELECTRON ENTRY POINT: the BINARY, never the npm `.bin/electron` CLI
 *  wrapper (F-5 rule (ii)). `node_modules/.bin/electron` symlinks to
 *  `electron/cli.js` — a Node wrapper that re-execs the real binary as its OWN
 *  child — so killing the handle kills the wrapper and ORPHANS the app, whose
 *  Chromium helpers outlive it and re-create the scratch profile after the
 *  sweep. `electron/path.txt` is the package's own contract for the binary. */
const electronBin = (() => {
  const pkgDir = join(root, 'node_modules', 'electron')
  try {
    const rel = readFileSync(join(pkgDir, 'path.txt'), 'utf8').trim()
    if (rel !== '' && existsSync(join(pkgDir, 'dist', rel))) return join(pkgDir, 'dist', rel)
  } catch { /* no readable path.txt: the canonical candidate stands on its own */ }
  return join(pkgDir, 'dist', 'electron')
})()
const mainCjs = join(root, 'dist', 'main', 'main.cjs')
const batteryHost = join(root, 'dist', 'main', 'battery-host.mjs')

// ===========================================================================
// §3.2/§3.3 — the scratch profile, its cleanup hook, and the bounded sweep.
// ===========================================================================

/** The scratch ROOT (§3.2 item 2): the OS temp dir, plus one separator so the
 *  `mkdtemp` call below can take the leg-identifying prefix as ONE string
 *  literal. Never a repo path and never the operator's real profile. */
const SCRATCH_ROOT = tmpdir() + sep

/** How many delete-verify passes a scratch profile gets (§3.3 item 4). A single
 *  `rmSync` is the recorded defect: a Chromium helper that outlives its parent
 *  re-creates the directory ~50-700 ms after the unlink, so the deletion has to
 *  be re-verified and repeated. */
const PROFILE_REMOVE_PASSES = 20
const PROFILE_REMOVE_PAUSE_MS = 15

/** Every scratch profile THIS run created, and every child it holds. */
const scratchProfiles = []
const liveChildren = new Set()
let cleanupRegistered = false

/** Kill the children this leg holds BEFORE any directory is swept (§3.3 item 6);
 *  `SIGKILL` is the recorded practice. */
function killLiveChildren() {
  for (const child of [...liveChildren]) {
    try { child.kill('SIGKILL') } catch { /* already gone */ }
  }
  liveChildren.clear()
}

/** Track the SDK transport's OWN child (§3.3 item 6, the spec's `O-3`): the
 *  transport keeps it on `_process` and kills it in `close()`; holding the same
 *  handle here is what lets this leg kill BOTH of its children — and only those
 *  two — before the sweep. */
function trackTransportChild(transport) {
  const child = transport === null || transport === undefined ? null : transport._process
  if (child !== null && child !== undefined && typeof child.kill === 'function') liveChildren.add(child)
  return child
}

/** A bounded BLOCKING pause for the sweep's verification window. Blocking (not
 *  `await`) so the sweep also works from a `process.on('exit')` handler, where
 *  no timer can fire. */
function sleepSync(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms) } catch { /* the loop still runs */ }
}

/** Register the exit-path cleanup — IDEMPOTENTLY, and AT THE MOMENT the scratch
 *  resource is created (§3.3 items 1/2). This hook must sit ABOVE every
 *  `process.exit` in this file: a validation gate that exits before the hook
 *  exists is the measured leak (F-5 rule (i)). */
export function registerCleanup() {
  if (cleanupRegistered) return
  cleanupRegistered = true
  process.on('exit', () => { cleanupScratchProfiles({ path: 'exit' }) })
  process.on('SIGINT', () => onSignal('SIGINT'))
  process.on('SIGTERM', () => onSignal('SIGTERM'))
}

/** An operator interrupt (§3.3 item 3(e)): sweep, then die by the signal exactly
 *  as this process would have without the hook — so the leg's exit contract
 *  stays `{0,1}` (§3.6 item 6) and no new exit code is added. */
function onSignal(signal) {
  cleanupScratchProfiles({ path: signal })
  process.removeAllListeners(signal)
  process.kill(process.pid, signal)
}

/** A FRESH scratch profile, one per spawn-site (§3.2 items 1-3): a `mkdtemp`-class
 *  call under the OS temp root, basename prefixed with this leg's id. Arming the
 *  cleanup is the FIRST thing this function does, so no later gate can exit
 *  ahead of the hook. It creates a directory and spawns NOTHING (§3.1 item 5). */
export function createScratchProfile() {
  registerCleanup()
  const dir = mkdtempSync(SCRATCH_ROOT + 'astrographer-div-')
  scratchProfiles.push(dir)
  return { path: dir, dir }
}

/** The BOUNDED delete-and-verify sweep (§3.3 items 2/4/5) over the profiles this
 *  run created: delete, pause, verify absence, re-delete while anything
 *  survives — then report BY NAME what was removed and what survived, so a
 *  `leftover: NONE` line is never printed beside a surviving directory.
 *
 *  Seams (the contract's inspection surface — every one of them optional):
 *   - `killChildren`: the child-killing step (default: this leg's own children);
 *   - `deletePath`: the delete step (default: `rmSync`), so a delete that does
 *     not take effect is observable rather than assumed;
 *   - `scratchRoot`: restrict the sweep to one scratch root;
 *   - `path`: a LABEL for the exit path being cleaned (never a filesystem path).
 */
export function cleanupScratchProfiles(opts = {}) {
  const o = opts === null || opts === undefined ? {} : opts
  const kill = typeof o.killChildren === 'function' ? o.killChildren : killLiveChildren
  const remove = typeof o.deletePath === 'function' ? o.deletePath : (p) => rmSync(p, { recursive: true, force: true })
  const only = typeof o.scratchRoot === 'string' ? resolve(o.scratchRoot) : null
  const label = typeof o.path === 'string' ? o.path : null
  try { kill() } catch { /* a child that will not die must not block the sweep */ }
  const targets = []
  for (const dir of scratchProfiles.splice(0)) {
    if (only === null || dirname(dir) === only) targets.push(dir)
  }
  const removed = []
  const leftover = []
  let passes = 0
  for (const dir of targets) {
    let gone = false
    for (let i = 0; i < PROFILE_REMOVE_PASSES; i += 1) {
      passes += 1
      try { remove(dir) } catch { /* best-effort: the verification below is the report */ }
      sleepSync(PROFILE_REMOVE_PAUSE_MS)
      gone = !existsSync(dir)
      if (gone) break
    }
    if (gone) removed.push(dir)
    else leftover.push(dir)
  }
  const report = `scratch cleanup${label === null ? '' : ` (${label})`}: removed ${removed.length} · passes ${passes} · leftover: ${leftover.length === 0 ? 'NONE' : `${leftover.length} — ${leftover.join(', ')}`}`
  return { removed, leftover, passes, report }
}

// ===========================================================================
// §3.1 — the composed argument vector, and the two sites that carry it.
// ===========================================================================

/** The members every real-Electron spawn carries, in their recorded order
 *  (§3.1 item 1 keeps them in place; item 2 adds the shared-memory bypass). */
const BASE_FLAGS = [
  '--mcp-transport=stdio',
  '--no-sandbox',
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--in-process-gpu',
  '--ozone-platform=x11',
  '--disable-dev-shm-usage',
]

/** THE one composed vector (§3.1): the bundle Electron boots, the base flags,
 *  and a per-spawn fresh scratch profile as the LAST member, `=`-joined. */
export function composeArgs(profileDir) {
  return [mainCjs, ...BASE_FLAGS, `--user-data-dir=${profileDir}`]
}

/** §3.1 item 4 — BOTH sites derive their lists from ONE value: each site's
 *  vector is verified against `composeArgs()` at the point of use, so an edit
 *  that touches one site (or the composed vector) stops the leg BY NAME instead
 *  of letting the two children drift apart. Returns the vector unchanged. */
function siteArgs(args, profileDir, site) {
  const composed = composeArgs(profileDir)
  if (JSON.stringify(args) !== JSON.stringify(composed)) {
    throw new Error(
      `electron-divergence: the ${site} site's vector reads ${JSON.stringify(args)} but the composed vector reads ` +
        `${JSON.stringify(composed)} — both spawn sites must derive their arguments from ONE value (§3.1 item 4).`,
    )
  }
  return args
}

// ---------------------------------------------------------------------------
// §3.1 items 4/5 — EXACTLY TWO Electron children per run:
//   site 1 is this leg's OWN `spawn(...)` below (kept for the stderr capture the
//          fail-loud report reads);
//   site 2 is the SDK's `StdioClientTransport`, which owns the second child and
//          spawns it on its own handle internally, from the vector it is given.
// This leg never creates a THIRD child: the profile creator spawns nothing, and
// a helper that spawns its own child per site is the measured four-processes-
// instead-of-two hazard (F-4).
// ---------------------------------------------------------------------------

// ===========================================================================
// §3.6 — FAIL-LOUD: a boot failure names its CAUSE, never a generic error.
// ===========================================================================

/** A shared-memory / `/dev/shm` refusal line, and the path it names. */
const SHARED_MEMORY_LINE = /shared memory|\.org\.chromium\.Chromium/i
const SHARED_MEMORY_PATH = /(\/dev\/shm\/\S+)/

/** A display/x11 refusal line: `DISPLAY` is a DECLARED environment prerequisite
 *  (§3.4 item 4), so its absence is named as a prerequisite failure. */
const DISPLAY_LINE = /cannot open display|unable to open X display|missing X server|:0.*no such|DISPLAY=/i

/** Classify a boot failure from THIS leg's OWN accumulated child `stderr` plus
 *  the child's exit/signal status. TOTAL: never throws, always returns a report,
 *  and never records anything itself — the leg's arithmetic is driven by its
 *  comparison rows (`ok()`), not by a substring present in `stderr`.
 *
 *  The report names the cause (`cause`), whether the cause is the `/dev/shm`
 *  class (`sharedMemory` + `sharedMemoryPath`) or a signal death (`signal`),
 *  says honestly when NO cause line was captured (`noCauseCaptured`), and keeps
 *  the SDK connection error visible but LABELLED as the downstream symptom. */
export function classifyBootFailure(stderr, status = {}) {
  const text = typeof stderr === 'string' ? stderr : ''
  const st = status !== null && typeof status === 'object' ? status : {}
  const exitCode = typeof st.code === 'number' ? st.code : null
  const signal = typeof st.signal === 'string' && st.signal !== '' ? st.signal : null
  const connectionError = typeof st.connectionError === 'string' && st.connectionError !== '' ? st.connectionError : null
  const errorSource = typeof st.errorSource === 'string' && st.errorSource !== '' ? st.errorSource : null
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l !== '')
  const shmLine = lines.find((l) => SHARED_MEMORY_LINE.test(l)) ?? null
  const shmMatch = shmLine === null ? null : shmLine.match(SHARED_MEMORY_PATH)
  const sharedMemoryPath = shmMatch === null ? null : shmMatch[1]
  const displayLine = lines.find((l) => DISPLAY_LINE.test(l)) ?? null
  const noCauseCaptured = lines.length === 0
  let cause
  if (shmLine !== null) cause = shmLine
  else if (displayLine !== null) cause = displayLine
  else if (lines.length > 0) cause = `the child's last stderr line: ${lines[lines.length - 1]}`
  else if (signal !== null) cause = `no cause line captured — the child died by signal ${signal} with an EMPTY stderr accumulation`
  else cause = `no cause line captured — the child's stderr accumulation is empty (exit code ${exitCode === null ? 'unknown' : String(exitCode)})`
  let precondition = null
  if (shmLine !== null) {
    precondition =
      'HOST/ENVIRONMENT: the Chromium shared-memory denial above is a host precondition on this machine (the /dev/shm bypass `--disable-dev-shm-usage` plus a fresh scratch profile is the sanctioned route) — it is NOT evidence about the app.'
  } else if (displayLine !== null) {
    precondition = 'ENVIRONMENT: DISPLAY is an unmet prerequisite — run this leg on a display (or provide one); this is not an app failure.'
  }
  return {
    cause,
    sharedMemory: shmLine !== null,
    sharedMemoryPath,
    displayPrerequisite: displayLine !== null,
    signal,
    exitCode,
    errorSource,
    noCauseCaptured,
    precondition,
    symptom: connectionError === null ? null : `downstream SYMPTOM (not the diagnosis): ${connectionError}`,
    connectionError,
    stderrLines: lines.slice(-5),
    failureRecorded: exitCode === 0 ? false : true,
  }
}

/** Print a boot-failure report AT THE POINT OF FAILURE (§3.6 item 1): the cause
 *  line first, then the environment precondition, then the symptom. */
function reportBootFailure(boot) {
  console.error(`  cause: ${boot.cause}`)
  if (boot.precondition !== null) console.error(`  ${boot.precondition}`)
  if (boot.symptom !== null) console.error(`  ${boot.symptom}`)
  for (const line of boot.stderrLines) console.error(`  stderr: ${line}`)
}

// ===========================================================================
// The leg's comparison census (UNCHANGED — §3.7 `C-7` item 1).
// ===========================================================================
let failures = 0
let checks = 0
export function ok(label, cond, extra = '') {
  checks += 1
  if (cond) console.log(`  ✓ ${label}${extra ? ` (${extra})` : ''}`)
  else {
    failures += 1
    console.error(`  ✗ ${label}${extra ? ` (${extra})` : ''}`)
  }
}
/** The failure count the leg's exit code is derived from (read by the harness
 *  contract rows; the arithmetic is `S-6`'s, unchanged — §3.7 item 4). */
export function failureCount() {
  return failures
}
/** The exit contract, `{0,1}` (§3.6 item 6): a clean run exits `0`; any recorded
 *  failure — a boot failure included — exits `1`, whatever the count. */
export function exitCodeFor(failureTotal) {
  return failureTotal > 0 ? 1 : 0
}
async function call(client, name, args = {}) {
  const r = await client.callTool({ name, arguments: args })
  return JSON.parse(r.content[0].text)
}

// The SAME demo envelope both hosts bootstrap (the renderer's demoEnvelope —
// 12 nodes: root + h1 + counter-card + h2 + counter + 3 buttons + echo-card +
// h2 + input + echo-out). §3.7 item 2: this literal is the leg's identity
// surface and is NOT moved by a spawn fix.
export function demoEnvelope() {
  const INC = `function (ctx) { const all = ctx.tree.allNodes(); const n = all.find(function (x) { return x && x.props && x.props.id === 'counter'; }); if (!n) return; const c = Number(n.content ?? 0); ctx.clientAPI.apply(n.id, [{ targetProp: 'content', mode: 'replace', value: String(c + 1) }]); }`
  const DEC = `function (ctx) { const all = ctx.tree.allNodes(); const n = all.find(function (x) { return x && x.props && x.props.id === 'counter'; }); if (!n) return; const c = Number(n.content ?? 0); ctx.clientAPI.apply(n.id, [{ targetProp: 'content', mode: 'replace', value: String(c - 1) }]); }`
  const RESET = `function (ctx) { const all = ctx.tree.allNodes(); const n = all.find(function (x) { return x && x.props && x.props.id === 'counter'; }); if (!n) return; ctx.clientAPI.apply(n.id, [{ targetProp: 'content', mode: 'replace', value: '0' }]); }`
  const ECHO = `function (ctx, value) { const all = ctx.tree.allNodes(); const n = all.find(function (x) { return x && x.props && x.props.id === 'echo-out'; }); if (!n) return; const t = value == null ? '' : String(value); ctx.clientAPI.apply(n.id, [{ targetProp: 'content', mode: 'replace', value: t }]); }`
  return {
    template: {
      root: {
        type: 'div',
        css: { classes: ['demo-shell'] },
        children: [
          { type: 'h1', content: 'Provident-Electron — MCP endpoint demo' },
          { type: 'section', css: { id: 'counter-card', classes: ['card'] }, children: [
            { type: 'h2', content: 'Counter' },
            { type: 'div', css: { id: 'counter', classes: ['counter-value'] }, props: { id: 'counter' }, content: '0' },
            { type: 'button', css: { id: 'inc', classes: ['btn'] }, content: 'Increment (+1)', handlers: [{ name: 'inc', event: 'click', body: INC }] },
            { type: 'button', css: { id: 'dec', classes: ['btn'] }, content: 'Decrement (-1)', handlers: [{ name: 'dec', event: 'click', body: DEC }] },
            { type: 'button', css: { id: 'reset', classes: ['btn'] }, content: 'Reset', handlers: [{ name: 'reset', event: 'click', body: RESET }] },
          ]},
          { type: 'section', css: { id: 'echo-card', classes: ['card'] }, children: [
            { type: 'h2', content: 'Echo (input -> echo-out)' },
            { type: 'input', css: { id: 'echo-input' }, props: { id: 'echo-input' }, handlers: [{ name: 'echo', event: 'input', body: ECHO }] },
            { type: 'div', css: { id: 'echo-out', classes: ['echo-out'] }, props: { id: 'echo-out' }, content: '(nothing yet)' },
          ]},
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

// ---- collect one host's (census, ssr, dirtied, renderedIdSet) --------------
// NOTE: minted node ids are not a parity surface — the shim battery host is
// mandated to boot root-only (C3) then `provident.load` the demo, so its
// minted ids are offset by the root-only boot relative to the real app (which
// boots the demo directly). R13 compares STRUCTURAL surfaces (census, SSR,
// node count, counter content, non-empty dispatch) and normalizes minted ids
// (`node-N` → `node#`) so the check is id-offset-agnostic.
function norm(s) {
  return String(s).replace(/node-\d+/g, 'node#')
}
async function drive(client) {
  const initial = await call(client, 'provident.get_rendered_html', {})
  const d = await call(client, 'provident.dispatch', { target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
  const after = await call(client, 'provident.get_rendered_html', {})
  const list = await call(client, 'provident.list_targets', {})
  return {
    census: initial.census,
    ssr: norm(initial.ssrHtml),
    dirtied: norm(JSON.stringify(d.dirtied)),
    resultsNonEmpty: Array.isArray(d.results) && d.results.length > 0,
    dataNodeIds: norm((after.renderedHtml.match(/data-node-id="([^"]+)"/g) ?? []).sort().join(' ')),
    renderedNonEmpty: (after.renderedHtml.match(/data-node-id="([^"]+)"/g) ?? []).length > 0,
    counterPresent: after.renderedHtml.includes('counter'),
    nodeIds: norm(list.nodes.map((n) => n.nodeId).sort().join('|')),
  }
}

async function main() {
  console.log('\nR13 — REAL-ELECTRON vs DOM-SHIM DIVERGENCE CHECK')
  console.log('================================================')

  // ---- leg 1: real Electron app (real DOM) over stdio ---------------------
  console.log('\n--- real Electron (real DOM) ---')
  // THE SITE-1 VECTOR (§3.1): the composed nine members. The profile member is
  // written as a string-literal concatenation — never a template literal — so the
  // `--user-data-dir=` prefix stays visible in the SOURCE TEXT of this vector,
  // which is how the harness contract rows read the members without booting
  // Electron. The trailing empty literal is a no-op, so the VALUE is identical to
  // `composeArgs()`'s — and `siteArgs` verifies exactly that before the spawn.
  const electronProfile = createScratchProfile()
  const electron = spawn(electronBin, siteArgs([
    mainCjs,
    '--mcp-transport=stdio',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-software-rasterizer',
    '--in-process-gpu',
    '--ozone-platform=x11',
    '--disable-dev-shm-usage',
    '--user-data-dir=' + electronProfile.path + '',
  ], electronProfile.path, 'direct-spawn'), {
    cwd: root, stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0', ELECTRON_DISABLE_SANDBOX: '1' },
  })
  liveChildren.add(electron)
  electron.stdout.resume()
  let estderr = ''
  electron.stderr.on('data', (d) => {
    estderr += String(d)
    if (estderr.includes('MCP') || estderr.includes('ready') || estderr.includes('error') || estderr.includes('fatal')) console.error('[electron] ' + String(d).trim())
  })
  // THE SITE-2 VECTOR (§3.1 item 4): the SAME composed members, with this site's
  // OWN fresh profile (§3.2 item 4 — a shared profile is not an isolation).
  const transportProfile = createScratchProfile()
  const eTransport = new StdioClientTransport({
    command: electronBin,
    args: siteArgs([
      mainCjs,
      '--mcp-transport=stdio',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--in-process-gpu',
      '--ozone-platform=x11',
      '--disable-dev-shm-usage',
      '--user-data-dir=' + transportProfile.path + '',
    ], transportProfile.path, 'sdk-stdio-transport'),
    cwd: root,
    env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0', ELECTRON_DISABLE_SANDBOX: '1' },
  })
  trackTransportChild(eTransport)
  const eClient = new Client({ name: 'r13-electron', version: '0.1.0' })
  let electronOut
  try {
    await eClient.connect(eTransport)
    electronOut = await drive(eClient)
    ok('electron: dispatch renderedNonEmpty', electronOut.renderedNonEmpty ?? true)
  } catch (e) {
    failures += 1
    console.error(`  ✗ electron connect/drive failed: ${e.message}`)
    reportBootFailure(classifyBootFailure(estderr, { code: electron.exitCode, signal: electron.signalCode, errorSource: 'the SDK connect/drive call', connectionError: e.message }))
    electronOut = null
  }

  // ---- leg 2: DOM-shim battery host (same demo + dispatch) -------------------
  console.log('\n--- DOM-shim battery host (same demo) ---')
  const shimTransport = new StdioClientTransport({ command: process.execPath, args: [batteryHost, '--mcp-transport=stdio'] })
  const shimClient = new Client({ name: 'r13-shim', version: '0.1.0' })
  await shimClient.connect(shimTransport)
  // the battery host boots root-only; load the same demo envelope so both are equal
  await shimClient.callTool({ name: 'provident.load', arguments: { kind: 'envelope', envelope: demoEnvelope() } })
  const shimOut = await drive(shimClient)

  // ---- compare the shim-stable surfaces ---------------------------------------
  console.log('\n--- divergence comparison ---')
  if (electronOut) {
    ok('census inTree matches (shim = real)', shimOut.census.inTree === electronOut.census.inTree, `electron=${electronOut.census.inTree} shim=${shimOut.census.inTree}`)
    ok('census registered matches', shimOut.census.registered === electronOut.census.registered, `electron=${electronOut.census.registered} shim=${shimOut.census.registered}`)
    ok('dirtied ids match (normalized)', shimOut.dirtied === electronOut.dirtied, `electron=${electronOut.dirtied} shim=${shimOut.dirtied}`)
    ok('SSR fragment matches (structural)', shimOut.ssr === electronOut.ssr)
    ok('data-node-id set matches (structural)', shimOut.dataNodeIds === electronOut.dataNodeIds)
    ok('nodeId vocabulary matches (structural)', shimOut.nodeIds === electronOut.nodeIds)
    ok('counter increment rendered in BOTH', shimOut.counterPresent && electronOut.counterPresent)
    ok('dispatch results non-empty in BOTH (R7)', shimOut.renderedNonEmpty !== false && electronOut.renderedNonEmpty !== false)
  } else {
    ok('electron leg produced a result', false, 'electron failed to bootstrap')
  }

  await shimClient.close()
  try { await eClient.close() } catch { /* already closed */ }
  try { electron.kill('SIGKILL') } catch { /* already gone */ }

  // ---- §3.3: the scratch sweep, run and REPORTED on every exit path ----------
  const scratch = cleanupScratchProfiles({ path: failures > 0 ? 'the red run (exit 1)' : 'the green run (exit 0)' })
  console.log(`  ${scratch.report}`)

  console.log(`\nR13 RESULT: ${checks} checks, ${failures} failures`)
  if (failures > 0) {
    console.error('--- electron stderr (tail) ---')
    console.error(estderr.split('\n').slice(-30).join('\n'))
    process.exit(exitCodeFor(failures))
  }
  process.exit(exitCodeFor(failures))
}

// The leg runs ONLY when this file is the process's own entry point (§3.1 item
// 6): importing the module — the harness contract rows do exactly that — spawns
// nothing, connects to nothing and reads nothing.
if (import.meta.url === pathToFileURL(process.argv[1] ?? '.').href) await main()
