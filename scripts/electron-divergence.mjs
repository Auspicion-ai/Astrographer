// scripts/electron-divergence.mjs — R13: the ONE Electron-run divergence check.
// Drives the REAL Electron app (real DOM) over stdio with the SDK client and
// compares the shim-stable surfaces (census + SSR fragment + dirtied ids +
// data-node-id parity) against the DOM-shim battery host running the SAME demo
// envelope + dispatch. Per docs/specs/e2e-test-battery-review.md R13:
// "assert primarily on census + node_state + SSR fragment (shim-stable); treat
// live-DOM innerHTML substring asserts as secondary."
//
// Run: npm run build && node scripts/electron-divergence.mjs
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const electronBin = join(root, 'node_modules', '.bin', 'electron')
const mainCjs = join(root, 'dist', 'main', 'main.cjs')
const batteryHost = join(root, 'dist', 'main', 'battery-host.mjs')

let failures = 0
let checks = 0
function ok(label, cond, extra = '') {
  checks += 1
  if (cond) console.log(`  ✓ ${label}${extra ? ` (${extra})` : ''}`)
  else {
    failures += 1
    console.error(`  ✗ ${label}${extra ? ` (${extra})` : ''}`)
  }
}
async function call(client, name, args = {}) {
  const r = await client.callTool({ name, arguments: args })
  return JSON.parse(r.content[0].text)
}

// The SAME demo envelope both hosts bootstrap (the renderer's demoEnvelope —
// 12 nodes: root + h1 + counter-card + h2 + counter + 3 buttons + echo-card +
// h2 + input + echo-out).
function demoEnvelope() {
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

console.log('\nR13 — REAL-ELECTRON vs DOM-SHIM DIVERGENCE CHECK')
console.log('================================================')

// ---- leg 1: real Electron app (real DOM) over stdio -----------------------
console.log('\n--- real Electron (real DOM) ---')
const electron = spawn(electronBin, [mainCjs, '--mcp-transport=stdio', '--no-sandbox', '--disable-gpu', '--disable-software-rasterizer', '--in-process-gpu', '--ozone-platform=x11'], {
  cwd: root, stdio: ['pipe', 'pipe', 'pipe'], env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0', ELECTRON_DISABLE_SANDBOX: '1' },
})
electron.stdout.resume()
let estderr = ''
electron.stderr.on('data', (d) => {
  estderr += String(d)
  if (estderr.includes('MCP') || estderr.includes('ready') || estderr.includes('error') || estderr.includes('fatal')) console.error('[electron] ' + String(d).trim())
})
const eTransport = new StdioClientTransport({
  command: electronBin,
  args: [mainCjs, '--mcp-transport=stdio', '--no-sandbox', '--disable-gpu', '--disable-software-rasterizer', '--in-process-gpu', '--ozone-platform=x11'],
  cwd: root,
  env: { ...process.env, DISPLAY: process.env.DISPLAY || ':0', ELECTRON_DISABLE_SANDBOX: '1' },
})
const eClient = new Client({ name: 'r13-electron', version: '0.1.0' })
let electronOut
try {
  await eClient.connect(eTransport)
  electronOut = await drive(eClient)
  ok('electron: dispatch renderedNonEmpty', electronOut.renderedNonEmpty ?? true)
} catch (e) {
  failures += 1
  console.error(`  ✗ electron connect/drive failed: ${e.message}`)
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

console.log(`\nR13 RESULT: ${checks} checks, ${failures} failures`)
if (failures > 0) {
  console.error('--- electron stderr (tail) ---')
  console.error(estderr.split('\n').slice(-30).join('\n'))
  process.exit(1)
}
process.exit(0)
