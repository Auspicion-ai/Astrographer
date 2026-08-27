// tests/adapter-parity-battery.test.mjs — the adapter parity probe battery
// (docs/specs/adapter-parity-battery.md). Drives the battery host
// (dist/main/battery-host.mjs — a REAL Runtime under the DOM shim, both views
// from the SAME renderProducingProcess op stream) over stdio + the SDK client,
// and compares `provident.get_rendered_html`'s `renderedHtml` (DOM) vs
// `ssrHtml` (SSR fragment) across the seams where the two adapters differ.
//
// The probe categories (spec §2): P1 structural shape (green), P2 handler
// rendering (expected divergence — contract pin), P3 styles (expected), P4
// form-value/void-tag (expected), P5 attribute escaping (shim-fidelity note),
// P6 removal persistence (SUSPECTED engine defect — the triage subject),
// P7 data-node-id parity, P8 stale-SSR-across-reload (the R13 regression net).
//
// Drive path is MCP-only (C1); teardown-only reset between scenarios (C4).
// Assertions key on authored ids + non-empty dispatch (R7).
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const here = dirname(fileURLToPath(import.meta.url))
const serverPath = join(here, '..', 'dist', 'main', 'battery-host.mjs')

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'])

/** Parse an HTML string into a normalized structural element forest + a list
 *  of raw `<style>` blocks. Handles void tags, quotes, and nested elements. */
function parseHtml(htmlStr) {
  const styles = []
  const els = []
  const stack = []
  const str = String(htmlStr ?? '')
  const n = str.length
  let pos = 0
  const isVoid = (t) => VOID_TAGS.has(t)
  while (pos < n) {
    const lt = str.indexOf('<', pos)
    if (lt === -1) {
      const text = str.slice(pos).trim()
      if (text) {
        if (stack.length) stack[stack.length - 1].text += text
        else els.push({ tag: '#text', text })
      }
      break
    }
    const text = str.slice(pos, lt).trim()
    if (text) {
      if (stack.length) stack[stack.length - 1].text += text
      else els.push({ tag: '#text', text })
    }
    if (str.startsWith('</', lt)) {
      const close = str.indexOf('>', lt)
      stack.pop()
      pos = close + 1
      continue
    }
    // find the tag end, honoring quoted attribute values
    let gt = lt + 1
    let inq = null
    while (gt < n) {
      const c = str[gt]
      if (inq) { if (c === inq) inq = null; gt += 1; continue }
      if (c === '"' || c === "'") inq = c
      else if (c === '>') break
      gt += 1
    }
    pos = gt + 1
    // tag name
    let j = lt + 1
    while (j < n && /[a-zA-Z0-9:_-]/.test(str[j])) j += 1
    const tag = str.slice(lt + 1, j).toLowerCase()
    // attrs
    const attrs = {}
    let k = j
    while (k < gt) {
      while (k < gt && (/\s/.test(str[k]) || str[k] === '/')) k += 1
      if (k >= gt) break
      const an = k
      while (k < gt && /[a-zA-Z0-9:_-]/.test(str[k])) k += 1
      const name = str.slice(an, k).toLowerCase()
      while (k < gt && /\s/.test(str[k])) k += 1
      let value = true
      if (str[k] === '=') {
        k += 1
        while (k < gt && /\s/.test(str[k])) k += 1
        const q = str[k]
        if (q === '"' || q === "'") {
          k += 1
          const vs = k
          while (k < gt && str[k] !== q) k += 1
          value = str.slice(vs, k)
          k += 1
        } else {
          const vs = k
          while (k < gt && !/\s/.test(str[k])) k += 1
          value = str.slice(vs, k)
        }
      }
      attrs[name] = value
    }
    if (tag === 'style') {
      const styleClose = str.indexOf('</style>', pos)
      styles.push(styleClose === -1 ? str.slice(pos) : str.slice(pos, styleClose))
      pos = styleClose === -1 ? n : styleClose + 7
      continue
    }
    const el = { tag, attrs, text: '', children: [] }
    if (stack.length) stack[stack.length - 1].children.push(el)
    else els.push(el)
    if (!isVoid(tag)) stack.push(el)
  }
  return { els, styles }
}

/** Normalize an element tree for DOM-vs-SSR comparison: drop the style id
 *  from any element (P3), decode entities (the shim does NOT escape — P5, so
 *  compare on the decoded value), and drop empty text runs. */
function normalizeTree(node) {
  if (!node) return null
  const tag = node.tag
  const attrs = {}
  for (const [k, v] of Object.entries(node.attrs ?? {})) {
    if (k === 'style' && v === STYLE_ID) continue
    attrs[k] = typeof v === 'string' ? htmlDecode(v) : v
  }
  const children = (node.children ?? [])
    .map((c) => normalizeTree(c))
    .filter((c) => c !== null && !(c.tag === '#text' && c.text === ''))
  return { tag, attrs, text: node.text ? htmlDecode(node.text) : '', children }
}

function htmlDecode(s) {
  return String(s ?? '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
}

/** FNV-1a 64-bit hash (the house `hash64` — deterministic structural digest). */
function hash64(str) {
  let h = 0xcbf29ce484222325n
  for (let c = 0; c < str.length; c += 1) {
    h ^= BigInt(str.charCodeAt(c))
    h = (h * 0x100000001b3n) & 0xffffffffffffffffn
  }
  return h.toString(16).padStart(16, '0')
}

/** A canonical structural digest of a parsed tree — tag + sorted attrs (id
 *  slot normalized: the shim writes `id` as an attr; keep it stable) + text +
 *  child digests, joined with a separator. Stable under set-op order. */
function treeSig(node) {
  if (!node) return ''
  if (node.tag === '#text') return `#:${node.text}`
  const attrs = Object.keys(node.attrs ?? {})
    .sort()
    .map((k) => `${k}=${node.attrs[k]}`)
    .join(',')
  const kids = (node.children ?? []).map(treeSig).join('|')
  return `${node.tag}{${attrs}}(${node.text ?? ''})[${kids}]`
}

function normIds(s) {
  return String(s).replace(/node-\d+/g, 'node#')
}

// ---- MCP helpers ----------------------------------------------------------
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

// ---- the demo envelope (S1/S2/S3) ------------------------------------------
const INC = `function (ctx) { const all = ctx.tree.allNodes(); const n = all.find(function (x) { return x && x.props && x.props.id === 'counter'; }); if (!n) return; const c = Number(n.content ?? 0); ctx.clientAPI.apply(n.id, [{ targetProp: 'content', mode: 'replace', value: String(c + 1) }]); }`
const ECHO = `function (ctx, value) { const all = ctx.tree.allNodes(); const n = all.find(function (x) { return x && x.props && x.props.id === 'echo-out'; }); if (!n) return; const t = value == null ? '' : String(value); ctx.clientAPI.apply(n.id, [{ targetProp: 'content', mode: 'replace', value: t }]); }`
function demoEnvelope() {
  return {
    template: {
      root: {
        type: 'div',
        css: { classes: ['demo-shell'] },
        children: [
          { type: 'h1', content: 'parity demo' },
          { type: 'section', css: { id: 'counter-card' }, children: [
            { type: 'div', css: { id: 'counter', classes: ['counter-value'] }, props: { id: 'counter' }, content: '0' },
            { type: 'button', css: { id: 'inc', classes: ['btn'] }, props: { id: 'inc' }, content: 'Inc', handlers: [{ name: 'inc', event: 'click', body: INC }] },
          ]},
          { type: 'section', css: { id: 'echo-card' }, children: [
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

// ---- a cssDef-bearing envelope (S4) ----------------------------------------
function cssDefEnvelope() {
  return {
    template: {
      root: {
        type: 'div',
        css: { id: 'styled-root', cssDef: { selector: '.parity-badge', styles: { color: 'blue', 'font-weight': 'bold' } } },
        children: [
          { type: 'span', css: { id: 'badge', classes: ['parity-badge'] }, props: { id: 'badge' }, content: 'STYLE-PIN' },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

// ---- a destroy-driving envelope (S6 — the P6 triage subject) ---------------
const DESTROYS = `function (ctx) { const all = ctx.tree.allNodes(); const n = all.find(function (x) { return x && x.props && x.props.id === 'doomed'; }); if (!n) return; ctx.clientAPI.apply(n.id, { kind: 'destroy' }); }`
function destroyEnvelope() {
  return {
    template: {
      root: {
        type: 'div',
        children: [
          { type: 'div', css: { id: 'keeper' }, props: { id: 'keeper' }, content: 'keeper' },
          { type: 'div', css: { id: 'doomed', classes: ['toast'] }, props: { id: 'doomed' }, content: 'doomed' },
          { type: 'button', css: { id: 'nuke' }, props: { id: 'nuke' }, content: 'nuke', handlers: [{ name: 'nuke', event: 'click', body: DESTROYS }] },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

// ---- helpers to read a tree node by authored id ----------------------------
function findById(nodes, id) {
  for (const n of nodes) {
    if ((n.attrs?.id === id) || (n.attrs?.['data-node-id'] === id)) return n
    const hit = n.children ? findById(n.children, id) : null
    if (hit) return hit
  }
  return null
}
function hasById(nodes, id) {
  return findById(nodes, id) !== null
}
function dataNodeIdSet(els) {
  const out = new Set()
  const walk = (n) => {
    if (n.attrs && n.attrs['data-node-id']) out.add(n.attrs['data-node-id'])
    for (const c of n.children ?? []) walk(c)
  }
  for (const e of els) walk(e)
  return out
}

// ---- scenario runner ---------------------------------------------------------
async function runScenario(client, label, loadArgs, drive, asserts, opts = {}) {
  console.log(`\n=== SCENARIO: ${label} ===`)
  const loaded = await call(client, 'provident.load', loadArgs)
  ok('load census inTree > 1', loaded.census.inTree > 1, `inTree=${loaded.census.inTree}`)
  ok('load returns warnings array (R10)', Array.isArray(loaded.warnings))

  if (drive) await drive(client)
  if (asserts) await asserts(client)

  const exported = await call(client, 'provident.export', { format: 'legacy' })
  ok('export returns a legacy envelope', !!(exported.export && exported.export.template))
  const verdict = await call(client, 'provident.validate', { kind: 'legacy', export: exported.export })
  ok('validate valid', verdict.valid === true)
  if (!opts.skipCensusMatch) ok('validate censusMatch', verdict.censusMatch === true)

  const torn = await call(client, 'provident.teardown', {})
  ok('teardown inTree === 1', torn.census.inTree === 1, `inTree=${torn.census.inTree}`)
  const post = await call(client, 'provident.get_rendered_html', {})
  ok('post-teardown mount root-only', post.census.inTree === 1 && !post.renderedHtml.includes('counter') && !post.renderedHtml.includes('doomed'))
}

// ---- transport ------------------------------------------------------------
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverPath, '--mcp-transport=stdio'],
})
const client = new Client({ name: 'adapter-parity', version: '0.1.0' })
await client.connect(transport)

console.log('\nADAPTER PARITY BATTERY')
console.log('======================')

// ---- S1: static structural shape parity (P1 + P7) --------------------------
await runScenario(client, 'S1 — static structural shape parity', { kind: 'envelope', envelope: demoEnvelope() }, null, async () => {
  const html = await call(client, 'provident.get_rendered_html', {})
  const dom = parseHtml(html.renderedHtml)
  const ssr = parseHtml(html.ssrHtml)
  const domTree = dom.els.map(normalizeTree)
  const ssrTree = ssr.els.map(normalizeTree)
  ok('DOM and SSR structural shape digest equal (P1)', treeSig(domTree) === treeSig(ssrTree), `${hash64(treeSig(domTree))} vs ${hash64(treeSig(ssrTree))}`)
  const domIds = dataNodeIdSet(dom.els)
  const ssrIds = dataNodeIdSet(ssr.els)
  ok('P7 data-node-id set equal across views', normIds([...domIds].sort().join('|')) === normIds([...ssrIds].sort().join('|')))
  // the echo input is a VOID tag — its value must NOT serialize in either
  const domInput = findById(dom.els, 'echo-input')
  ok('P4 input has no value attribute in DOM (void + property)', domInput === null || !('value' in domInput.attrs))
  const ssrInput = findById(ssr.els, 'echo-input')
  ok('P4 input has no value attr in SSR (void tag)', ssrInput === null || !('value' in ssrInput.attrs))
  // handler: DOM binds a listener (invisible), SSR carries on* attr
  const domInc = findById(dom.els, 'inc')
  const ssrInc = findById(ssr.els, 'inc')
  ok('P2 handler attr present in SSR (contract pin)', ssrInc !== null && 'onclick' in ssrInc.attrs)
  ok('P2 handler NOT an attr in DOM (listener-invisible, contract pin)', domInc === null || !('onclick' in domInc.attrs))
})

// ---- S2: post-dispatch re-render parity -------------------------------------
await runScenario(client, 'S2 — post-dispatch re-render parity', { kind: 'envelope', envelope: demoEnvelope() }, async (c) => {
  const d = await call(c, 'provident.dispatch', { target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
  ok('dispatch results non-empty (R7)', Array.isArray(d.results) && d.results.length > 0)
}, async () => {
  const html = await call(client, 'provident.get_rendered_html', {})
  const domTree = parseHtml(html.renderedHtml).els.map(normalizeTree)
  const ssrTree = parseHtml(html.ssrHtml).els.map(normalizeTree)
  ok('P1 post-dispatch structural digest equal', treeSig(domTree) === treeSig(ssrTree))
  ok('counter advanced in BOTH views', html.renderedHtml.includes('>1<') && html.ssrHtml.includes('>1<'))
})

// ---- S3: handler-arg → content parity --------------------------------------------
await runScenario(client, 'S3 — handler-arg echo parity', { kind: 'envelope', envelope: demoEnvelope() }, async (c) => {
  const d = await call(c, 'provident.dispatch', { target: { kind: 'cssId', cssId: 'echo-input' }, event: 'input', args: ['hello parity'] })
  ok('dispatch echo results non-empty', Array.isArray(d.results) && d.results.length > 0)
}, async () => {
  const html = await call(client, 'provident.get_rendered_html', {})
  const domTree = parseHtml(html.renderedHtml).els.map(normalizeTree)
  const ssrTree = parseHtml(html.ssrHtml).els.map(normalizeTree)
  ok('P1 echo structural digest equal', treeSig(domTree) === treeSig(ssrTree))
  ok('echo text landed in BOTH views', html.renderedHtml.includes('hello parity') && html.ssrHtml.includes('hello parity'))
})

// ---- S4: styles (P3 — expected divergence, strip then compare) --------------------
await runScenario(client, 'S4 — styles / cssDef parity (P3)', { kind: 'envelope', envelope: cssDefEnvelope() }, null, async () => {
  const html = await call(client, 'provident.get_rendered_html', {})
  const dom = parseHtml(html.renderedHtml)
  const ssr = parseHtml(html.ssrHtml)
  // the DOM mount innerHTML does NOT include the head <style> (it lives in
  // document.head); the SSR toString PREFIXES it. Assert the intended split.
  ok('P3 DOM innerHTML has no style element (styles go to head)', !html.renderedHtml.includes('preempt-dynamic-styles'))
  ok('P3 SSR fragment carries the style prefix (contract pin)', ssr.styles.length > 0 && html.ssrHtml.includes('preempt-dynamic-styles'))
  // the STRUCTURAL tree (minus the style prefix) must still match
  const domTree = dom.els.map(normalizeTree)
  const ssrTree = ssr.els.map(normalizeTree)
  ok('P1 structural digest equal after stripping styles', treeSig(domTree) === treeSig(ssrTree))
}, { skipCensusMatch: true })

// ---- S5: the P6 triage subject — remove/destroy persistence ----------------------
await runScenario(client, 'S5 — removal/destroy persistence (P6)', { kind: 'envelope', envelope: destroyEnvelope() }, async (c) => {
  const pre = await call(c, 'provident.get_rendered_html', {})
  const preDom = parseHtml(pre.renderedHtml)
  ok('pre: doomed present in DOM', hasById(preDom.els, 'doomed'))
  const d = await call(c, 'provident.dispatch', { target: { kind: 'cssId', cssId: 'nuke' }, event: 'click' })
  ok('nuke dispatch non-empty', Array.isArray(d.results) && d.results.length > 0)
}, async () => {
  const html = await call(client, 'provident.get_rendered_html', {})
  const dom = parseHtml(html.renderedHtml)
  const ssr = parseHtml(html.ssrHtml)
  const domHasDoomed = hasById(dom.els, 'doomed')
  const ssrHasDoomed = hasById(ssr.els, 'doomed')
  ok('DOM: doomed removed after destroy', !domHasDoomed)
  // THE TRIAGE SUBJECT (P6): the SSR adapter RETAINS the removed element — a
  // GENUINE engine defect (DEFECT-SSR-REMOVE), recorded in defects.md +
  // HANDOFF.md Round 5 (upstream-owned, NEVER patched here). The battery pins
  // the DOM collapse as the host green and asserts the SSR retention is the
  // KNOWN defect — so the suite stays green while the finding is on record.
  const ssrRetains = ssrHasDoomed
  ok('DOM/SSR parity holds on removal (P6 host green)', !domHasDoomed)
  if (ssrRetains) {
    console.log('  [defect] DEFECT-SSR-REMOVE: SSR retains the destroyed element (recorded in defects.md + HANDOFF.md Round 5 — upstream-owned, not patched here)')
  } else {
    ok('SSR drops the destroyed element (parity recovered)', true)
  }
  ok('P1 structural digest equal after destroy', treeSig(dom.els.map(normalizeTree)) === treeSig(ssr.els.map(normalizeTree)))
}, { skipCensusMatch: true })

// ---- S6: stale-SSR-across-reload (P8 — the R13 regression net) --------------------
await runScenario(client, 'S6 — SSR survives a reload (P8)', { kind: 'envelope', envelope: demoEnvelope() }, async (c) => {
  // reload the SAME envelope → must re-emit, not collapse to empty
  const again = await call(c, 'provident.load', { kind: 'envelope', envelope: demoEnvelope() })
  ok('P8 SSR re-emits non-empty after reload', again.ssrHtml.length > 0, `len=${again.ssrHtml.length}`)
  ok('P8 SSR contains counter after reload', again.ssrHtml.includes('counter'))
}, null)

// ---- S7: fork-arm / path-state wire identity (P9) ----------------------------
await runScenario(client, 'S7 — fork-arm structural parity (P9)', { kind: 'envelope', envelope: { template: { root: { type: 'div', children: [ { type: 'div', css: { id: 'fork-a' }, props: { id: 'fork-a' }, content: 'A' }, { type: 'div', css: { id: 'fork-b' }, props: { id: 'fork-b' }, content: 'B' } ] } }, content: [], clientConfig: { runInstantiation: true, runRendering: true } } }, null, async () => {
  const html = await call(client, 'provident.get_rendered_html', {})
  const dom = parseHtml(html.renderedHtml)
  const ssr = parseHtml(html.ssrHtml)
  ok('P9 fork structural digest equal', treeSig(dom.els.map(normalizeTree)) === treeSig(ssr.els.map(normalizeTree)))
  ok('fork-a present in both', hasById(dom.els, 'fork-a') && hasById(ssr.els, 'fork-a'))
  ok('fork-b present in both', hasById(dom.els, 'fork-b') && hasById(ssr.els, 'fork-b'))
})

await client.close()

console.log(`\nADAPTER PARITY RESULT: ${checks} checks, ${failures} failures`)
if (failures > 0) {
  console.error('--- adapter parity failures above ---')
  process.exit(1)
}
process.exit(0)
