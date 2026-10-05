#!/usr/bin/env node
// scripts/asw-class-b-live-battery.mjs — GATE-6 LIVE BATTERY for
// U-ATOMICITY-SWEEP-CLASS-B (docs/specs/unit-atomicity-sweep-class-b-live-battery.md).
//
// SCRATCH DRIVER. It REUSES unit 2's PROVEN harness pattern
// (docs/specs/unit-store-persist-adopt-live-pending-battery.md §2): a DIRECT
// `npx electron .` launch carrying the `--provident-user-data=<scratch>` seam,
// the renderer reached over CDP (`--remote-debugging-port`), and the carrier read
// as RAW BYTES from disk. It does NOT modify scripts/live-drive.mjs and it edits
// no src/** and no test.
//
// SUBJECT: the two carriers this unit re-shaped —
//   operator: <userData>/provident-operator-settings.json
//   engine:   <userData>/provident-engine-config.json
//
// CLAIM FORM: ORDER ONLY. write -> restart -> the value observed in the carrier.
// NO timing figure, NO latency, NO durability claim, NO crash-recovery claim.
//
// Usage: node scripts/asw-class-b-live-battery.mjs <scratchRoot>
//   <scratchRoot>/userdata  — the seam root (created if absent)
//   <scratchRoot>/home      — the disposable HOME
//   <scratchRoot>/evidence  — every raw reading this run takes

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, '..')
const SCRATCH = process.argv[2]
if (!SCRATCH) { console.error('usage: node scripts/asw-class-b-live-battery.mjs <scratchRoot>'); process.exit(2) }
const USERDATA = join(SCRATCH, 'userdata')
const HOME = join(SCRATCH, 'home')
const EVID = join(SCRATCH, 'evidence')
for (const d of [USERDATA, HOME, EVID]) mkdirSync(d, { recursive: true })

const OPERATOR = join(USERDATA, 'provident-operator-settings.json')
const ENGINE = join(USERDATA, 'provident-engine-config.json')
const PORT = 3801
const CDP_PORT = 9301

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const lines = []
function say(s) { lines.push(s); console.log(s) }

async function waitFor(fn, { timeout = 60000, step = 250 } = {}) {
  const t0 = Date.now()
  for (;;) {
    try { if (await fn()) return true } catch { /* retry */ }
    if (Date.now() - t0 > timeout) return false
    await sleep(step)
  }
}

// ---------------------------------------------------------------------------
// CDP — reused shape from scripts/live-drive.mjs (connect to the page target).
// ---------------------------------------------------------------------------
class CDP {
  constructor(ws) { this.ws = ws; this.id = 0; this.pending = new Map() }
  static async connect(port) {
    const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json()
    const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
    if (!page) throw new Error(`no page target on :${port}`)
    const ws = new WebSocket(page.webSocketDebuggerUrl)
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws error')) })
    const cdp = new CDP(ws)
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && cdp.pending.has(msg.id)) { cdp.pending.get(msg.id)(msg); cdp.pending.delete(msg.id) }
    }
    return cdp
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((res) => { this.pending.set(id, res); this.ws.send(JSON.stringify({ id, method, params })) })
      .then((msg) => { if (msg.error) throw new Error(`${method}: ${msg.error.message}`); return msg.result })
  }
  async evaluate(expression) {
    const { result } = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.subtype === 'error') throw new Error(`evaluate error: ${result.description}`)
    return result.value
  }
  close() { try { this.ws.close() } catch { /* */ } }
}

// ---------------------------------------------------------------------------
// The launch — unit 2's §2 verbatim shape, adapted to this battery's ports.
// ---------------------------------------------------------------------------
let child = null
async function launch(tag) {
  const args = [
    '.', '--no-sandbox', '--disable-dev-shm-usage',
    '--mcp-transport=http', `--mcp-port=${PORT}`,
    '--retrieval-embedder=lexical',
    `--remote-debugging-port=${CDP_PORT}`, '--disable-gpu',
    `--provident-user-data=${USERDATA}`,
  ]
  const logPath = join(EVID, `boot-${tag}.log`)
  const out = []
  child = spawn('npx', ['electron', ...args], {
    cwd: ROOT,
    env: { ...process.env, HOME },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true,
  })
  child.stdout.on('data', (d) => out.push(String(d)))
  child.stderr.on('data', (d) => out.push(String(d)))
  const ok = await waitFor(async () => {
    const r = await fetch(`http://127.0.0.1:${CDP_PORT}/json`).catch(() => null)
    if (!r) return false
    const t = await r.json()
    return Array.isArray(t) && t.some((x) => x.type === 'page')
  }, { timeout: 90000 })
  // let the boot settle (renderer ready)
  const settled = await waitFor(() => Promise.resolve(out.join('').includes('renderer ready')), { timeout: 60000 })
  await sleep(1500)
  const log = out.join('')
  writeFileSync(logPath, log)
  const cdp = ok ? await CDP.connect(CDP_PORT) : null
  return { ok: ok && settled, log, logPath, cdp, exited: child.exitCode !== null }
}

function killTree() {
  if (child === null) return
  try { process.kill(-child.pid, 'SIGKILL') } catch { /* */ }
  try { child.kill('SIGKILL') } catch { /* */ }
  child = null
}

// ---------------------------------------------------------------------------
// RAW READINGS — the carrier read as bytes, never interpreted.
// ---------------------------------------------------------------------------
function rawRead(p) {
  if (!existsSync(p)) return { exists: false, bytes: null, size: null }
  const buf = readFileSync(p)
  return { exists: true, bytes: buf.toString('utf8'), size: buf.length }
}
function dirListing() {
  return readdirSync(USERDATA).filter((n) => n.startsWith('provident-')).sort()
}
function tmpState() {
  return { operatorTmp: existsSync(OPERATOR + '.tmp'), engineTmp: existsSync(ENGINE + '.tmp') }
}
// does `topK` appear in the OPERATOR carrier as a raw byte reading?
function topKIn(bytes) {
  if (bytes === null) return null
  const m = bytes.match(/"topK":\s*(\d+)/)
  return m ? Number(m[1]) : null
}

const R = {}   // scenario -> verdict
function verdict(id, v, detail) { R[id] = { verdict: v, detail }; say(`[${id}] ${v} — ${detail}`) }

// ---------------------------------------------------------------------------
async function main() {
  say(`# ASW-CLASS-B LIVE BATTERY — scratch driver`)
  say(`# scratchRoot=${SCRATCH}`)
  say(`# USERDATA=${USERDATA}`)
  say(`# HOME=${HOME}`)
  say(`# ports mcp=${PORT} cdp=${CDP_PORT}`)
  say(`# head: ${spawnSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT }).stdout.toString().trim()}`)
  say(`# display: DISPLAY=${process.env.DISPLAY} WAYLAND_DISPLAY=${process.env.WAYLAND_DISPLAY}`)

  // =========================================================================
  // L-1 — THE COLD BOOT (no settings file): the app boots, the carrier is
  //       absent, nothing throws.
  // =========================================================================
  say(`\n## L-1 — COLD BOOT (empty root)`)
  rmSync(OPERATOR, { force: true }); rmSync(ENGINE, { force: true })
  say(`pre-write carrier state: operator=${JSON.stringify(rawRead(OPERATOR))} engine=${JSON.stringify(rawRead(ENGINE))}`)
  let b = await launch('l1-cold')
  say(`boot ok=${b.ok} log=${b.logPath}`)
  say(`boot log (filtered): ${b.log.split('\n').filter((l) => /provident-main|provident-mcp|fatal/.test(l)).join(' | ')}`)
  if (!b.ok || b.cdp === null) { verdict('L-1', 'FAIL', 'the app did not boot'); killTree(); return finish() }
  const bridge = await b.cdp.evaluate(`(function(){ return { hasProvident: !!window.provident, hasOperatorSettings: !!(window.provident && window.provident.operatorSettings), keys: window.provident ? Object.keys(window.provident).sort() : null, mounted: !!document.querySelector('#app') } })()`)
  say(`bridge probe: ${JSON.stringify(bridge)}`)
  const cold = await b.cdp.evaluate(`window.provident.operatorSettings.get().then(s => ({ topK: s.topK, theme: s.theme, representationMode: s.representationMode }))`)
  say(`operatorSettings.get() on a cold root: ${JSON.stringify(cold)}`)
  verdict('L-1', (bridge.hasOperatorSettings && cold && cold.topK === 5) ? 'PASS' : 'FAIL',
    `boot=${b.ok}; operatorSettings surface=${bridge.hasOperatorSettings}; cold get().topK=${cold && cold.topK}`)
  killTree(); await sleep(2500)

  // =========================================================================
  // L-2 — THE ORDER ROUND-TRIP, OPERATOR CARRIER (the unit's OWN claim form)
  //       operator action -> WRITE -> carrier bytes -> RESTART -> observed.
  // =========================================================================
  say(`\n## L-2 — OPERATOR CARRIER: write -> restart -> observed (ORDER CLAIM)`)
  b = await launch('l2-write')
  if (!b.ok || b.cdp === null) { verdict('L-2', 'FAIL', 'the app did not boot for the write run'); killTree(); return finish() }
  // THE REAL OPERATOR ACTION: the bridge set() that the settings pane issues
  // (sidebar-panes.ts `operatorSet` -> `bridge.operatorSettings.set(patch)`).
  const setReply = await b.cdp.evaluate(`window.provident.operatorSettings.set({ topK: 17, theme: 'dark' }).then(s => ({ topK: s.topK, theme: s.theme }))`)
  say(`operatorSettings.set({topK:17, theme:'dark'}) reply: ${JSON.stringify(setReply)}`)
  await sleep(1200)
  const afterWrite = rawRead(OPERATOR)
  say(`CARRIER BYTES after the write (raw, verbatim): ${afterWrite.bytes}`)
  say(`carrier size=${afterWrite.size} topK(raw byte read)=${topKIn(afterWrite.bytes)}`)
  say(`tmp state after the write: ${JSON.stringify(tmpState())}`)
  say(`provident-* dir listing: ${JSON.stringify(dirListing())}`)
  killTree(); await sleep(3000)
  say(`--- RESTART (a real process restart; a fresh electron launch over the SAME root) ---`)
  b = await launch('l2-restart')
  if (!b.ok || b.cdp === null) { verdict('L-2', 'FAIL', 'the app did not boot for the restart run'); killTree(); return finish() }
  const observed = await b.cdp.evaluate(`window.provident.operatorSettings.get().then(s => ({ topK: s.topK, theme: s.theme }))`)
  say(`OBSERVED after restart: operatorSettings.get() = ${JSON.stringify(observed)}`)
  const restartCarrier = rawRead(OPERATOR)
  say(`carrier bytes at restart (raw): topK=${topKIn(restartCarrier.bytes)}`)
  verdict('L-2', (observed && observed.topK === 17 && observed.theme === 'dark') ? 'PASS' : 'FAIL',
    `write reply=${JSON.stringify(setReply)}; carrier topK after write=${topKIn(afterWrite.bytes)}; observed after restart=${JSON.stringify(observed)}`)
  killTree(); await sleep(2500)

  // =========================================================================
  // L-3 — ZERO-BYTE / CORRUPT OPERATOR CARRIER -> boot -> usable store
  // =========================================================================
  say(`\n## L-3 — CORRUPT (zero-byte) OPERATOR CARRIER -> boot`)
  writeFileSync(OPERATOR, '')
  say(`carrier overwritten with ZERO BYTES; size=${statSync(OPERATOR).size}`)
  b = await launch('l3-zerobyte')
  if (!b.ok || b.cdp === null) { verdict('L-3', 'FAIL', 'the app did not boot over a zero-byte carrier'); killTree(); return finish() }
  const z0 = await b.cdp.evaluate(`window.provident.operatorSettings.get().then(s => ({ topK: s.topK, theme: s.theme }))`)
  const fatal3 = /\[provident-main\] fatal:/.test(b.log)
  say(`get() over a zero-byte carrier: ${JSON.stringify(z0)}; fatal line present=${fatal3}`)
  // the store is USABLE: a real write through it
  const setAfter = await b.cdp.evaluate(`window.provident.operatorSettings.set({ topK: 23 }).then(s => ({ topK: s.topK }))`)
  await sleep(1000)
  const afterRepair = rawRead(OPERATOR)
  say(`set({topK:23}) reply: ${JSON.stringify(setAfter)}; carrier topK now=${topKIn(afterRepair.bytes)}`)
  verdict('L-3', (!fatal3 && z0 && z0.topK === 5 && setAfter && setAfter.topK === 23 && topKIn(afterRepair.bytes) === 23) ? 'PASS' : 'FAIL',
    `boot over zero-byte carrier: defaults answered (topK=${z0 && z0.topK}), no fatal line=${!fatal3}, store USABLE (set -> on-disk topK=${topKIn(afterRepair.bytes)})`)
  killTree(); await sleep(2500)

  // =========================================================================
  // L-4 — UNBALANCED-PREFIX OPERATOR CARRIER -> boot -> usable store
  // =========================================================================
  say(`\n## L-4 — CORRUPT (unbalanced prefix) OPERATOR CARRIER -> boot`)
  const torn = '{"topK": 4, "theme": "da'
  writeFileSync(OPERATOR, torn)
  say(`carrier overwritten with unbalanced prefix (verbatim): ${torn}`)
  b = await launch('l4-prefix')
  if (!b.ok || b.cdp === null) { verdict('L-4', 'FAIL', 'the app did not boot over an unbalanced-prefix carrier'); killTree(); return finish() }
  const z1 = await b.cdp.evaluate(`window.provident.operatorSettings.get().then(s => ({ topK: s.topK, theme: s.theme }))`)
  const fatal4 = /\[provident-main\] fatal:/.test(b.log)
  say(`get() over the torn prefix: ${JSON.stringify(z1)}; fatal line present=${fatal4}`)
  const setAfter4 = await b.cdp.evaluate(`window.provident.operatorSettings.set({ topK: 31 }).then(s => ({ topK: s.topK }))`)
  await sleep(1000)
  const afterRepair4 = rawRead(OPERATOR)
  say(`set({topK:31}) reply: ${JSON.stringify(setAfter4)}; carrier topK now=${topKIn(afterRepair4.bytes)}`)
  verdict('L-4', (!fatal4 && z1 && z1.topK === 5 && setAfter4 && setAfter4.topK === 31) ? 'PASS' : 'FAIL',
    `boot over torn prefix: defaults answered (topK=${z1 && z1.topK}), no fatal line=${!fatal4}, store USABLE (set -> on-disk topK=${topKIn(afterRepair4.bytes)})`)

  // =========================================================================
  // L-5 — THE ENGINE CARRIER'S MARKER LIFECYCLE (the conflict marker's ends)
  // =========================================================================
  say(`\n## L-5 — ENGINE CARRIER conflict-marker lifecycle`)
  // (a) CLEAN BOOT over a GOOD engine record -> the marker is ABSENT.
  // NB (driver correction, recorded in the artifact): the seed MUST be a LOOPBACK
  // URL — `createEngineRagStore` calls `assertLoopback(opts.baseUrl, 'engine rag
  // store')` at boot, so a non-loopback seed aborts the app with
  // `[provident-main] fatal: Error: engine rag store: baseUrl must be loopback`.
  // That is the APP working as designed; the first draft's non-loopback seed
  // `http://clean-live` was a DRIVER defect and is recorded as such, never as an
  // app failure.
  writeFileSync(ENGINE, JSON.stringify({ engineBaseUrl: 'http://127.0.0.1:8099' }))
  say(`engine carrier seeded with a GOOD (loopback) record: ${rawRead(ENGINE).bytes}`)
  killTree(); await sleep(2500)
  b = await launch('l5-engine-clean')
  const cleanLog = b.log
  say(`CLEAN-boot log (filtered): ${cleanLog.split('\n').filter((l) => /provident-main|fatal/.test(l)).join(' | ')}`)
  if (!b.ok || b.cdp === null) { verdict('L-5', 'FAIL', 'the app did not boot over the good engine record'); killTree(); return finish() }
  const engClean = rawRead(ENGINE)
  say(`engine carrier at a clean boot (raw): ${engClean.bytes}`)
  const cleanHasMarker = /readConflict/.test(engClean.bytes || '')
  // (b) NOW a corrupt engine carrier -> boot -> then a write -> the marker appears
  killTree(); await sleep(2500)
  writeFileSync(ENGINE, '{not json at all')
  say(`engine carrier overwritten with unparsable bytes (verbatim): {not json at all`)
  b = await launch('l5-engine-corrupt')
  say(`CORRUPT-engine-boot log (filtered): ${b.log.split('\n').filter((l) => /provident-main|fatal/.test(l)).join(' | ')}`)
  if (!b.ok || b.cdp === null) { verdict('L-5', 'FAIL', 'the app did not boot over the corrupt engine record'); killTree(); return finish() }
  const carrAtCorruptBoot = rawRead(ENGINE)
  say(`engine carrier at the corrupt boot (raw, still the corrupt bytes): ${carrAtCorruptBoot.bytes}`)
  // Is the engine store drivable FROM THE LIVE APP? The carrier is read/written
  // INSIDE main for base-URL resolution and has NO IPC response of its own
  // (§2.3 ②'s own "no reader" disposition). Probe EVERY surface an agent could
  // reach: the renderer bridge namespaces, and the MCP tool list.
  const engineReach = await b.cdp.evaluate(`(function(){
    const p = window.provident || {};
    return {
      bridgeNamespaces: Object.keys(p).sort(),
      engineish: Object.keys(p).filter(k => /engine|gnosis|config/i.test(k)),
      operatorSettingsKeys: p.operatorSettings ? Object.keys(p.operatorSettings).sort() : null,
      anyWriteEngineMember: Object.keys(p).filter(k => {
        try { const v = p[k]; return v && typeof v === 'object' && Object.keys(v).some(m => /engineConfig|setEngine|baseUrl/i.test(m)) } catch(e) { return false }
      }),
    } })()`)
  say(`renderer-reachable surface probe: ${JSON.stringify(engineReach)}`)
  // And the MCP side: no tool may name the engine config (spec §7 item 11 / §1.2).
  const mcpTools = await fetch(`http://127.0.0.1:${PORT}/mcp`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
  }).then((r) => r.text()).catch((e) => `ERROR ${e}`)
  const engineTools = (mcpTools.match(/"name":"[^"]*"/g) || []).filter((s) => /engine|config|baseUrl/i.test(s))
  say(`MCP tools/list — total name tokens=${(mcpTools.match(/"name":"[^"]*"/g) || []).length}; engine/config-shaped tools=${JSON.stringify(engineTools)}`)
  writeFileSync(join(EVID, 'mcp-tools-list.txt'), mcpTools)
  verdict('L-5', cleanHasMarker ? 'FAIL' : 'OPEN',
    `the CLEAN-boot end is READ (a good engine record carries NO marker: ${!cleanHasMarker}); the MARKER-WRITE end needs a write through the engine carrier, and the live app exposes NO renderer/IPC/MCP path to it (the carrier is read/written INSIDE main for base-URL resolution — §2.3 ②'s own "no reader" disposition). Marked OPEN with that structural reason, never green.`)
  killTree(); await sleep(2500)

  // =========================================================================
  // L-6 — BOOT-LOG / CRASH-FREE readings for every boot above
  // =========================================================================
  say(`\n## L-6 — boot hygiene across the runs`)
  const fatalRuns = []
  for (const t of ['l1-cold', 'l2-write', 'l2-restart', 'l3-zerobyte', 'l4-prefix', 'l5-engine-clean', 'l5-engine-corrupt']) {
    const p = join(EVID, `boot-${t}.log`)
    if (!existsSync(p)) { fatalRuns.push(`${t}: NO LOG`); continue }
    const txt = readFileSync(p, 'utf8')
    const ready = txt.includes('renderer ready')
    const fatal = /\[provident-main\] fatal:/.test(txt)
    fatalRuns.push(`${t}: ready=${ready} fatal=${fatal}`)
  }
  say(fatalRuns.join('\n'))
  verdict('L-6', fatalRuns.every((r) => r.includes('ready=true') && r.includes('fatal=false')) ? 'PASS' : 'FAIL', fatalRuns.join('; '))

  return finish()
}

function finish() {
  const out = join(EVID, 'run-summary.md')
  writeFileSync(out, lines.join('\n') + '\n')
  say(`\n# VERDICTS`)
  for (const [id, v] of Object.entries(R)) say(`${id}: ${v.verdict}`)
  say(`# summary written: ${out}`)
  killTree()
  process.exit(0)
}

main().catch((e) => { say(`[driver] ERROR: ${String(e && e.stack ? e.stack : e)}`); killTree(); finish() })
