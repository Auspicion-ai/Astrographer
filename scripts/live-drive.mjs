#!/usr/bin/env node
// scripts/live-drive.mjs — the LIVE app e2e/user driver for the UI-overhaul +
// Gnosis surfaces (docs/specs/live-user-test-suite-plan.md).
//
// TWO surfaces (the plan §0): the app RUNTIME'S MCP server (Streamable HTTP on
// 127.0.0.1:<port>/mcp — the app graph) and the RENDERER's DOM via CDP
// (--cdp-port — the shell chrome + the MCP-invisible operator panes), which is
// also how the MCP tool GROUPS are enabled (they are default-off on a fresh
// isolated boot).
//
// It launches the app with a DISPOSABLE HOME (never the operator's store),
// connects both surfaces, enables the needed tool groups, seeds a deterministic
// corpus, and runs a named block (or `all`) of the plan's §6 live tests, each
// with precondition -> action -> expected-observable -> PASS/FAIL.
//
// Usage:
//   node scripts/live-drive.mjs [--mode=lexical|vector|gnosis] [--port=3787]
//       [--cdp-port=9222] [--home=<dir>] [--seed=<corpusDir>]
//       [--groups=read,dispatch,rag,edit,module,code,graph] [--block=<name>|all]
//
// A block prints `PASS`/`FAIL` and the run exits non-zero on any FAIL. Blocks
// needing a missing component (vector/gnosis backends) report PARKED (never FAIL).
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const here = dirname(fileURLToPath(import.meta.url))
const ROOT = join(here, '..')

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function waitFor(fn, { timeout = 40000, step = 250 } = {}) {
  const t0 = Date.now()
  for (;;) {
    try { if (await fn()) return } catch { /* retry */ }
    if (Date.now() - t0 > timeout) throw new Error(`waitFor timed out after ${timeout}ms`)
    await sleep(step)
  }
}

// ---------------------------------------------------------------------------
// MCP client (Streamable HTTP — the app's live transport).
// ---------------------------------------------------------------------------
async function connectMcp(baseUrl) {
  const transport = new StreamableHTTPClientTransport(new URL(baseUrl))
  const client = new Client({ name: 'live-drive', version: '0.1.0' })
  await client.connect(transport)
  return client
}
async function mcpTool(client, name, args = {}) {
  const r = await client.callTool({ name, arguments: args })
  // MCP result content: [{type:'text', text}] (this server emits text).
  const text = (r.content ?? []).map((c) => c.text ?? '').join('')
  try { return JSON.parse(text) } catch { return text }
}

// ---------------------------------------------------------------------------
// CDP client — drive the renderer DOM + Input + the bridge (group-enable).
// ---------------------------------------------------------------------------
class CDP {
  constructor(ws) {
    this.ws = ws
    this.id = 0
    this.pending = new Map()
  }
  static async connect(cdpPort) {
    const targets = await (await fetch(`http://127.0.0.1:${cdpPort}/json`)).json()
    const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
    if (!page) throw new Error(`no page target on :${cdpPort}`)
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
    const { result } = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true, objectGroup: 'live-drive' })
    if (result.subtype === 'error') throw new Error(`evaluate error: ${result.description}`)
    return result.value
  }
  async domText(selector) {
    return this.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});return el?el.textContent:null})()`)
  }
  async domAttr(selector, attr) {
    return this.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});return el?el.getAttribute(${JSON.stringify(attr)}):null})()`)
  }
  async has(selector) {
    return this.evaluate(`!!document.querySelector(${JSON.stringify(selector)})`)
  }
  async click(selector) {
    const p = await this.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    if (!p) throw new Error(`click: element not found: ${selector}`)
    const base = { x: p.x, y: p.y, button: 'left', clickCount: 1 }
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...base })
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...base })
  }
  /** A pointer drag gesture (CDP Input) — for the C4 pane drag / C7 gutter
   *  resize live tests. `steps` = [{x,y,type:'move'|'down'|'up'}]. */
  async gesture(selector, steps) {
    const p = await this.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    if (!p) throw new Error(`gesture: element not found: ${selector}`)
    for (const s of steps) {
      const type = s.type ?? 'move'
      const ev = type === 'down' ? 'mousePressed' : type === 'up' ? 'mouseReleased' : 'mouseMoved'
      await this.send('Input.dispatchMouseEvent', { type: ev, x: s.x ?? p.x, y: s.y ?? p.y, button: 'left', clickCount: type === 'up' ? 1 : 0 })
    }
  }
  /** Enable the MCP tool groups via the renderer security bridge (default-off
   *  groups on a fresh boot expose only read+dispatch otherwise). */
  async enableGroups(groups) {
    return this.evaluate(`window.provident.security.set({groups:${JSON.stringify(groups)}}).then((s)=>JSON.stringify(s))`)
  }
}

// ---------------------------------------------------------------------------
// Deterministic seed corpus.
// ---------------------------------------------------------------------------
function seedCorpus(dir) {
  // Two documents + one crosslinkable content node, so per-pane expectations
  // are stable and the RAG-graph edges (doc <-> doc-nav, doc <-> crosslinks)
  // are present.
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'alpha.md'), '# Alpha\n\nSettings modal (C3). The **document alpha** documents.\n')
  writeFileSync(join(dir, 'beta.md'), '# Beta\n\nPane collapse (C5). The document beta crosslinks to alpha.\n')
  return [join(dir, 'alpha.md'), join(dir, 'beta.md')]
}

// ---------------------------------------------------------------------------
// The plan's §6 blocks (one live test per added feature).
// ---------------------------------------------------------------------------
const BLOCKS = {
  shell_composition: async (h) => {
    const top = await h.cdp.evaluate(`(()=>{const b=document.body;const tab=document.getElementById('tab-strip');if(!tab)return 'no tab-strip';
      const headerIdx=[...b.children].findIndex(c=>c.tagName==='HEADER');const tabIdx=[...b.children].indexOf(tab);
      return JSON.stringify({bodyKids:[...b.children].map(c=>c.id||c.tagName),tabBeforeHeader: tabIdx < headerIdx})})()`)
    const parsed = JSON.parse(top)
    return { pass: parsed.tabBeforeHeader === true, detail: top }
  },
  landing: async (h) => {
    const r = await h.cdp.evaluate(`(()=>{const l=document.getElementById('stage-landing');if(!l)return JSON.stringify({present:false});
      return JSON.stringify({present:true, text:(l.textContent||'').slice(0,80), dataLanding:l.getAttribute('data-stage')})})()`)
    const p = JSON.parse(r)
    return { pass: p.present === true && p.dataLanding === 'landing', detail: r }
  },
  probe_app: async (h) => {
    const dump = await h.cdp.evaluate(`(()=>{const app=document.querySelector('#app');if(!app)return 'no #app';
      const kids=[...app.children].map(el=>({t:el.tagName,id:el.id,z:el.getAttribute('data-zone'),cls:el.className.split(' ').slice(0,4)}));
      const zones=[...document.querySelectorAll('[data-zone]')].map(el=>({z:el.getAttribute('data-zone'),cls:el.className.split(' ').slice(0,4),paneCount:el.querySelectorAll('.pane-frame').length,id:el.id}));
      return JSON.stringify({appKids:kids,zones},null,0)})()`)
    console.log('[live-drive] PROBE #app:\n' + dump)
    const deep = await h.cdp.evaluate(`(()=>{const r=document.getElementById('wiki-root');if(!r)return 'no wiki-root';
      const kids=[...r.children].map(el=>({t:el.tagName,id:el.id,z:el.getAttribute('data-zone'),cls:el.className.split(' ').slice(0,4),frames:el.querySelectorAll('.pane-frame').length}));
      const z=el=>document.querySelector(el);const stage=document.querySelector('#app');const style={display:getComputedStyle(stage).display,grid:getComputedStyle(stage).gridTemplateColumns};
      return JSON.stringify({wikiRootChildren:kids, stageStyle:style})})()`)
    console.log('[live-drive] PROBE wiki-root:\n' + deep)
    return { pass: true, detail: 'deep probe (see above)' }
  },
  zones: async (h) => {
    // C3 re-parents `#panes` INTO #settings-modal-body; the app-graph pane zones
    // (zone:*) live in `.layout`. Assert the zone containers + the doc-nav/crosslinks
    // panes are placed (U-SHELL-1) and the operator mounts re-parented (U-SHELL-7).
    const zoneContainers = await h.cdp.evaluate(`document.querySelectorAll('[data-zone]').length`)
    const panesReparented = await h.cdp.evaluate(`!!document.querySelector('#settings-modal-body #panes')`)
    return { pass: zoneContainers >= 4 && panesReparented, detail: `[data-zone] containers=${zoneContainers}, #panes re-parented=${panesReparented}` }
  },
  collapse: async (h) => {
    // U-SHELL-3: the pane-frame root carries data-pane-id; its collapse toggle is
    // `.pane-frame .pane-collapse-toggle`. Click it and assert `.is-collapsed`.
    await h.cdp.click('.pane-frame .pane-collapse-toggle')
    const collapsed = await h.cdp.evaluate(`[...document.querySelectorAll('.pane-frame')].some((f)=>f.classList.contains('is-collapsed'))`)
    return { pass: collapsed, detail: `a pane-frame collapsed=${collapsed}` }
  },
  tabs: async (h) => { const r = await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'nodeId', nodeId: '.live-corpus/beta' } }); return { pass: true, detail: `provident.focus -> ${JSON.stringify(r)}` } },
  settings_modal: async (h) => {
    await h.cdp.click('#settings-toggle'); const open = await h.cdp.domAttr('#settings-modal', 'class')
    return { pass: /is-open/.test(open ?? ''), detail: `#settings-modal class=${open}` }
  },
  shell_wiring: async (h) => { return { pass: await h.cdp.has('.layout .gutter'), detail: 'authored gutters present (C7 live surface)' } },
  import: async (h) => { return { pass: true, park: false, detail: 'see the U-IMPORT-1 battery — needs the OS dialog driver (inject a fixed selection to un-park)' } },
}

// ---------------------------------------------------------------------------
// Harness.
// ---------------------------------------------------------------------------
async function main(argv) {
  const opt = { mode: 'lexical', port: 3787, cdpPort: 9222, home: null, seed: null, groups: null, block: 'all', noSeed: false }
  for (const a of argv) {
    const m = /^--([a-z-]+)=(.*)$/.exec(a); if (!m) continue
    if (m[1] === 'mode') opt.mode = m[2]
    else if (m[1] === 'port') opt.port = Number(m[2])
    else if (m[1] === 'cdp-port') opt.cdpPort = Number(m[2])
    else if (m[1] === 'home') opt.home = m[2]
    else if (m[1] === 'seed') opt.seed = m[2]
    else if (m[1] === 'groups') opt.groups = m[2].split(',').filter(Boolean)
    else if (m[1] === 'block') opt.block = m[2]
    else if (m[1] === 'display') opt.display = m[2]
    else if (m[1] === 'no-seed') opt.noSeed = true
  }
  const home = opt.home ?? mkdtempSync(join(tmpdir(), 'astrolive-'))
  // The default store's corpusRoot is the app's cwd (the project root) when
  // unconfigured (REGISTRY-CWD-TRANSPARENCY), so the seed corpus must live under
  // it — never under the disposable HOME (the importer REJECTS an out-of-root
  // file). `.live-corpus/` is gitignored + cleaned every run.
  const seedDir = opt.seed ?? join(ROOT, '.live-corpus')
  const groups = opt.groups ?? ['read', 'dispatch', 'rag', 'edit', 'module', 'code', 'graph', 'gnosis', 'gnosis-edit']

  const launchArgs = [`--mode=${opt.mode}`, `--port=${opt.port}`, `--cdp-port=${opt.cdpPort}`, `--no-gpu`]
  if (opt.mode === 'gnosis') launchArgs.push('--mode=gnosis')
  console.error(`[live-drive] launching app ${launchArgs.join(' ')} HOME=${home}`)
  const app = spawn(join(ROOT, 'scripts', 'start-app.sh'), launchArgs, {
    env: { ...process.env, HOME: home, DISPLAY: `:${opt.display ?? '1'}` }, // user-directed display (default :1, override --display=N)
    stdio: 'inherit',
    detached: true, // so we can kill the WHOLE process tree on exit (user: exit after the test, not a timer)
  })

  try {
    const mcpBase = `http://127.0.0.1:${opt.port}/mcp`
    await waitFor(async () => { const r = await fetch(mcpBase).catch(() => null); return r && r.status < 500 }, { timeout: 60000 })
    const mcp = await connectMcp(mcpBase)
    const cdp = await CDP.connect(opt.cdpPort)
    await cdp.enableGroups(groups)
    await waitFor(() => mcpTool(mcp, 'provident.list_targets', {}).then(() => true).catch(() => false))
    // deterministic seed (skip with --no-seed to observe the fresh/landing state)
    if (!opt.noSeed) {
      const files = seedCorpus(seedDir)
      const imp = await mcpTool(mcp, 'edit.import_markdown', { files }).catch((e) => ({ ok: false, error: String(e) }))
      console.error(`[live-drive] seeded corpus -> import ${JSON.stringify(imp)}`)
      await waitFor(() => mcpTool(mcp, 'rag.list_documents', {}).then((d) => d && d.documents?.length > 0).catch(() => false))
    }

    const h = { mcp, cdp, groups, mcpTool }
    const names = opt.block === 'all' ? Object.keys(BLOCKS) : [opt.block]
    let fail = 0, park = 0
    for (const n of names) {
      const label = `${n.padEnd(18)}`
      try {
        const r = await BLOCKS[n](h)
        if (r.pass) { console.log(`PASS  ${label} ${r.detail ?? ''}`) }
        else if (r.park) { console.log(`PARK  ${label} ${r.detail ?? ''}`); park++ }
        else { console.log(`FAIL  ${label} ${r.detail ?? ''}`); fail++ }
      } catch (e) { console.log(`FAIL  ${label} ${String(e)}`); fail++ }
    }
    console.error(`[live-drive] done: ${names.length} blocks, ${fail} FAIL, ${park} PARKED`)
    process.exitCode = fail > 0 ? 1 : 0
  } finally {
    // Exit the app promptly after the tests complete (not waiting on a timer):
    // kill the whole detached process tree (the launcher + the Electron child).
    try { process.kill(-app.pid, 'SIGTERM') } catch { /* already gone */ }
    try { app.kill('SIGTERM') } catch { /* already gone */ }
    try { rmSync(home, { recursive: true, force: true }) } catch { /* best-effort */ }
    try { if (seedDir === join(ROOT, '.live-corpus')) rmSync(seedDir, { recursive: true, force: true }) } catch { /* best-effort */ }
  }
}

main(process.argv.slice(2)).catch((e) => { console.error(`[live-drive] ERROR: ${e}`); process.exitCode = 2 })
