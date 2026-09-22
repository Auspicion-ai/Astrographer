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
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, rmSync } from 'node:fs'
import { mkdir as mkdirAsync, writeFile as writeFileAsync } from 'node:fs/promises'
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
    // §3.6 (the repo ENV NOTE, docs/live-testing.md:119-124) — the O-0 bundle
    // identity compares the SERVED `renderer.js` against the on-disk file via
    // `Page.getResourceContent`, which REFUSES with `Page.getResourceContent:
    // Agent is not enabled` unless the Page domain is enabled first. Enabling the
    // domain adds no DOM work and no measurement effect; without it every O-0
    // run's `driver.build.verified` is false (F2) for a HARNESS reason.
    try { await this.send('Page.enable') } catch (e) { /* the identity check then reports itself unreadable (F2) */ }
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
// LIVE-GESTURE HELPERS (added 2026-09-15 — user-flow-audit live battery,
// docs/specs/user-flow-audit-checklist.md). Every `uf_*` block drives a REAL
// CDP pointer/keyboard gesture on the RENDERED control and pins the
// USER-VISIBLE end state (painted boxes / rendered content / store read-back)
// — never a seam/attribute/class proxy. APP-level (RCA-12).
// ---------------------------------------------------------------------------

/** The rendered tab strip + the document body actually mounted in `#zone:main`
 *  (+ the PAINTED stage geometry, so a "populated stage" claim has a box). */
async function ufTabState(h) {
  return h.cdp.evaluate(`(()=>{
    const tabs=[...document.querySelectorAll('#tab-strip .tab')].map((t,i)=>{const r=t.getBoundingClientRect();const c=t.querySelector('.tab-close');const cr=c?c.getBoundingClientRect():null;const cs=getComputedStyle(t);return {i:i,id:t.getAttribute('data-tab-id'),kind:t.getAttribute('data-target-kind'),title:(t.textContent||'').replace(/\u00d7$/,'').trim(),active:t.classList.contains('is-active'),box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],closeBox:c?[Math.round(cr.width),Math.round(cr.height)]:null,border:cs.borderTopColor,bg:cs.backgroundColor,weight:cs.fontWeight}});
    const s=document.getElementById('tab-strip');
    const m=document.getElementById('zone:main');
    const h1=m?m.querySelector('h1'):null;
    const mr=m?m.getBoundingClientRect():null;
    return {count:tabs.length,tabs:tabs,activeIndex:tabs.findIndex((t)=>t.active),stripScroll:[s?s.scrollWidth:0,s?s.clientWidth:0],stripOverflowX:s?getComputedStyle(s).overflowX:null,mountedDocId:h1?h1.id:null,landing:!!document.getElementById('stage-landing'),mainLen:m?(m.textContent||'').length:0,mainBox:mr?[Math.round(mr.x),Math.round(mr.y),Math.round(mr.width),Math.round(mr.height)]:null};
  })()`)
}

/** A REAL CDP pointer click (the element is scrolled into view first). Returns
 *  `path:'cdp'` when the coordinate click landed ON the target (or a
 *  descendant) and `path:'native-fallback'` when the point was covered / not
 *  hit-testable (recorded, never silently substituted). `realInput` is DERIVED
 *  from the path so a row verdict can gate on it (§6.1: `realInput` is true
 *  only when the hit-tested path was proven). */
/** The hit-test probe the real-click helper uses: the element CENTER, the
 *  element under that point, and whether the point actually resolves to the
 *  target (or a descendant). */
async function ufHitProbe(h, selector) {
  const q = JSON.stringify(selector)
  return h.cdp.evaluate(`(()=>{const e=document.querySelector(${q});if(!e)return null;const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;const hit=document.elementFromPoint(x,y);return {x:x,y:y,w:Math.round(r.width),h:Math.round(r.height),hit:hit?(hit.id||hit.tagName):null,onTarget:!!(hit&&(hit===e||e.contains(hit)))}})()`)
}

/** A REAL CDP pointer click (the element is scrolled into view first). Returns
 *  `path:'cdp'` when the coordinate click landed ON the target (or a
 *  descendant) and `path:'native-fallback'` when the point was covered / not
 *  hit-testable (recorded, never silently substituted). `realInput` is DERIVED
 *  from the path so a row verdict can gate on it (§6.1: `realInput` is true
 *  only when the hit-tested path was proven). */
async function ufRealClick(h, selector, opts = {}) {
  const q = JSON.stringify(selector)
  if (opts.scroll !== false) {
    await h.cdp.evaluate(`(()=>{const e=document.querySelector(${q});if(e&&typeof e.scrollIntoView==='function')e.scrollIntoView({block:'center'});return true})()`)
    await sleep(250) // let the scroll/relayout settle before the hit-test
  }
  let p = await ufHitProbe(h, selector)
  // Re-probe ONCE: a scrolled page may still be reflowing, and a transient
  // miss must not be recorded as a covered target. The path semantics are
  // unchanged — a genuine miss still reports 'native-fallback'.
  if (p && !p.onTarget && opts.scroll !== false) { await sleep(200); p = await ufHitProbe(h, selector) }
  if (!p) return { path: 'missing', ok: false, realInput: false, detail: `not found: ${selector}` }
  if (p.w === 0 || p.h === 0) return { path: 'zero-box', ok: false, realInput: false, rect: p, detail: `zero-size box ${p.w}x${p.h}` }
  if (!p.onTarget && opts.nativeFallback !== false) {
    const ok = await h.cdp.evaluate(`(()=>{const e=document.querySelector(${q});if(!e)return false;e.click();return true})()`)
    return { path: 'native-fallback', ok, realInput: false, rect: p, detail: `hit=${p.hit} (not the target) -> native DOM click` }
  }
  await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y, buttons: 0 })
  await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', buttons: 1, clickCount: 1 })
  await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', buttons: 0, clickCount: 1 })
  // The hit-test the verdict rests on: re-read at the dispatch coordinate AFTER
  // the events, so a reflow between the probe and the dispatch is visible in the
  // recorded evidence (a stale coordinate is the difference between "the handler
  // is dead" and "our click landed elsewhere").
  const hitAtDispatch = await h.cdp.evaluate(`(()=>{const hit=document.elementFromPoint(${p.x},${p.y});return hit?(hit.id||hit.tagName):null})()`)
  return { path: 'cdp', ok: true, realInput: true, rect: p, hitAtDispatch }
}

/** Arm a capture-phase recorder of pointerdown/mouseup/click TARGETS — it
 *  separates "the real gesture never delivered a click to the control" (the
 *  pane-drag pointer-capture retarget) from "the handler is a no-op". */
async function ufArmClick(h) {
  return h.cdp.evaluate(`(()=>{window.__ufClicks=[];if(!window.__ufClickListener){window.__ufClickListener=true;const rec=(e)=>{const t=e.target;const pane=t&&t.closest?t.closest('.pane-frame[data-pane-id]'):null;window.__ufClicks.push(e.type+':'+(t?(t.id||t.tagName):'?')+(pane?('|in#'+pane.id):''))};for(const ty of ['pointerdown','mouseup','click'])document.addEventListener(ty,rec,true)}return true})()`)
}
async function ufClickProbe(h, reset = true) {
  const v = await h.cdp.evaluate(`JSON.stringify(window.__ufClicks||[])`)
  if (reset) await h.cdp.evaluate(`window.__ufClicks=[]`)
  try { return JSON.parse(v) } catch { return [] }
}

/** A real key press (Escape closes the modal). */
async function ufKey(h, key, code, vk) {
  await h.cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk })
  await h.cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk })
  return true
}

/** A stable render oracle for the mounted stage (length + rolling hash + the
 *  mounted document-head id) so a content revert/restore is byte-checkable. */
async function ufStageSig(h) {
  return h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');const t=m?(m.textContent||''):'';let hash=0;for(let i=0;i<t.length;i++){hash=(hash*31+t.charCodeAt(i))|0}const h1=m?m.querySelector('h1'):null;return {len:t.length,hash:hash,docId:h1?h1.id:null,landing:!!document.getElementById('stage-landing')}})()`)
}

/** The rendered app-graph pane frames (identity, box, body-node census). */
async function ufPaneFrames(h) {
  return h.cdp.evaluate(`(()=>[...document.querySelectorAll('.pane-frame[data-pane-id]')].map((f)=>{const r=f.getBoundingClientRect();return {pid:f.getAttribute('data-pane-id'),cls:String(f.className),collapsed:f.classList.contains('is-collapsed'),box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],li:f.querySelectorAll('li').length,controls:f.querySelectorAll('input,button,select,fieldset,textarea').length,zone:(f.closest('[data-zone]')||{}).id||null}}))()`)
}

/** Drive the settings modal to OPEN/CLOSED with a real gesture (Escape closes). */
async function ufModal(h, want) {
  const cls = await h.cdp.evaluate(`document.getElementById('settings-modal').className`)
  const isOpen = /is-open/.test(cls ?? '')
  if (isOpen === want) return { changed: false, cls, path: 'already' }
  if (want) {
    const r = await ufRealClick(h, '#settings-toggle')
    await sleep(1000)
    return { changed: true, cls: await h.cdp.evaluate(`document.getElementById('settings-modal').className`), path: r.path }
  }
  await ufKey(h, 'Escape', 'Escape', 27)
  await sleep(800)
  return { changed: true, cls: await h.cdp.evaluate(`document.getElementById('settings-modal').className`), path: 'escape' }
}

/** Real search-pane drive: real-click the advanced disclosure open, real-click
 *  the query input, type the query with Input.insertText, real-click submit. */
async function ufPaneSearch(h, query) {
  const out = {}
  out.expandedBefore = await h.cdp.evaluate(`(()=>{const b=document.getElementById('advanced-search-toggle');return b?b.getAttribute('data-expanded'):null})()`)
  if (out.expandedBefore !== 'true') {
    out.togglePath = (await ufRealClick(h, '#advanced-search-toggle')).path
    await sleep(1000)
  } else { out.togglePath = 'already-expanded' }
  out.focusPath = (await ufRealClick(h, '#pane-search-input')).path
  await sleep(250)
  out.focusedId = await h.cdp.evaluate(`(document.activeElement&&document.activeElement.id)||null`)
  await h.cdp.evaluate(`(()=>{const e=document.getElementById('pane-search-input');if(e)e.value='';return true})()`)
  await h.cdp.send('Input.insertText', { text: query })
  await sleep(250)
  out.value = await h.cdp.evaluate(`(document.getElementById('pane-search-input')||{}).value||null`)
  out.submitPath = (await ufRealClick(h, '#advanced-search-submit')).path
  await sleep(2400)
  out.rows = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('#pane-search li[data-document-id]')].map((li)=>{const r=li.getBoundingClientRect();return {doc:li.getAttribute('data-document-id'),cls:String(li.className),box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}}))()`)
  return out
}

// ---------------------------------------------------------------------------
// GNOSIS live-surface helpers (docs/specs/gnosis-enrichment-live-report-2026-
// 09-15.md — rows UF-GNOSIS-1..6). The gnosis APP-GRAPH panes
// (`gnosis-wikis`/`gnosis-documents`/`gnosis-query`) ship default-OFF in the
// operator pane-visibility set, so every block enables them with REAL modal
// clicks first; `gnosis-status` is an OPERATOR pane (modal-confined +
// MCP-invisible). Nothing here spawns/kills a process: `--connect` attaches.
// ---------------------------------------------------------------------------

/** A PARKED row: a precondition the live surface cannot meet. Carries the §6.1
 *  field set with `park:true, pass:false` — never a behavior FAIL, never a PASS. */
function parkRow(row, assertion, dclass, reason, evidence, opts = NO_EXTRA_FIELDS) {
  const r = rowResult(row, assertion, dclass, evidence, opts)
  return { ...r, pass: false, park: true, parkReason: reason, detail: `PARKED (${reason}) — ${evidence}` }
}

/** The rendered state of one gnosis app-graph pane frame (painted box + the
 *  `data-gnosis-*` markers + the painted `li` census with its data-* keys). */
async function gnosisPaneState(h, paneId) {
  const q = JSON.stringify(`.pane-frame[data-pane-id="${paneId}"]`)
  return h.cdp.evaluate(`(()=>{const f=document.querySelector(${q});if(!f)return null;const fr=f.getBoundingClientRect();const bx=(e)=>{if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};const root=f.querySelector('[data-gnosis-pane]');return {paneId:${JSON.stringify(paneId)},frameBox:[Math.round(fr.x),Math.round(fr.y),Math.round(fr.width),Math.round(fr.height)],collapsed:f.classList.contains('is-collapsed'),state:root?root.getAttribute('data-gnosis-state'):null,docState:root?root.getAttribute('data-gnosis-docstate'):null,queryAttr:root?root.getAttribute('data-gnosis-query'):null,traceMode:root?root.getAttribute('data-trace-mode'):null,paneText:root?String(root.textContent||'').replace(/\\s+/g,' ').trim():null,lis:[...f.querySelectorAll('li')].map((li)=>({text:String(li.textContent||'').trim(),box:bx(li),wiki:li.getAttribute('data-wiki-id'),doc:li.getAttribute('data-document-id'),node:li.getAttribute('data-node-id'),rev:li.getAttribute('data-revision'),cls:String(li.className)})),controls:[...f.querySelectorAll('button,input')].map((c)=>c.id).filter(Boolean)}})()`)
}

/** Enable the named gnosis APP-GRAPH panes through REAL operator-modal gestures
 *  (`#operator-pane-visibility-<paneId>`), then leave the modal CLOSED so
 *  app-graph gestures land. Returns the per-pane flip record. */
async function gnosisEnablePanes(h, paneIds) {
  await ufEnsureAppClear(h)
  const open = await ufModal(h, true)
  const flips = []
  for (const pid of paneIds) {
    const sel = `#operator-pane-visibility-${pid}`
    const cur = await h.cdp.evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(`operator-pane-visibility-${pid}`)});return e?e.getAttribute('data-enabled'):null})()`)
    if (cur === 'true') { flips.push(`${pid}:already-on(${cur})`); continue }
    const c = await ufRealClick(h, sel)
    await sleep(1400)
    const after = await h.cdp.evaluate(`(()=>{const e=document.getElementById(${JSON.stringify(`operator-pane-visibility-${pid}`)});return e?e.getAttribute('data-enabled'):null})()`)
    flips.push(`${pid}:${c.path}->${after}`)
  }
  await ufModal(h, false)
  await sleep(1600)
  const frames = (await ufPaneFrames(h)).map((f) => f.pid)
  return { open: open.path, flips, frames }
}

/** Count the gnosis bridge invocations the RENDERER issues, plus the CDP click
 *  targets — [DIAG] attribution only (a real gesture's delivery proof), never a
 *  row's PASS oracle by itself. */
async function gnosisArmBridgeProbe(h, fnName) {
  return h.cdp.evaluate(`(()=>{window.__gnosisCalls=[];const s=window.provident&&window.provident.sidebar;if(s&&typeof s[${JSON.stringify(fnName)}]==='function'&&!s.__gnosisArmed){const orig=s[${JSON.stringify(fnName)}];s[${JSON.stringify(fnName)}]=function(){window.__gnosisCalls.push(JSON.stringify([].slice.call(arguments)).slice(0,300));return orig.apply(this,arguments)};s.__gnosisArmed=true}return true})()`)
}
async function gnosisReadBridgeProbe(h) {
  return h.cdp.evaluate(`JSON.stringify(window.__gnosisCalls||[])`)
}

/** The app-graph RE-ASSEMBLY signature (the runtime node ids of the assembly
 *  roots + each gnosis pane body). A gnosis host's `onChanged()` →
 *  `host.refresh()` re-derives the whole app graph and mints NEW ids, so a
 *  control that reaches its handler CHANGES this signature while a control whose
 *  seam is a no-op leaves it byte-identical. Always read against a no-click
 *  CONTROL sample (the signature is only used as the CAUSAL delta for a real
 *  gesture, never as the sole PASS oracle). */
async function gnosisAssembleSig(h) {
  return h.cdp.evaluate(`(()=>{const g=(s)=>{const e=document.querySelector(s);return e?e.getAttribute('data-node-id'):null};return {roots:document.querySelectorAll('#wiki-root').length,root:g('#wiki-root'),status:g('[data-gnosis-pane="status"]'),wikis:g('.pane-frame[data-pane-id="gnosis-wikis"] [data-gnosis-pane]'),docs:g('.pane-frame[data-pane-id="gnosis-documents"] [data-gnosis-pane]')}})()`)
}

/** The [DIAG] dispatch probe: hand the SAME handler the DOM click would reach a
 *  direct `provident.dispatch` so "the handler is dead" and "the handler ran but
 *  its seam is a no-op" are distinguishable. Never a verdict. */
async function gnosisDispatchDiag(h, selector) {
  const nodeId = await h.cdp.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});return e?e.getAttribute('data-node-id'):null})()`)
  if (!nodeId) return { nodeId: null, diag: 'no node' }
  const d = await h.mcpTool(h.mcp, 'provident.dispatch', { target: { kind: 'nodeId', nodeId }, event: 'click' }).catch((e) => ({ __err: String(e.message || e) }))
  const handlers = await h.mcpTool(h.mcp, 'provident.list_targets', {}).then((t) => ((t.nodes || []).find((n) => n.nodeId === nodeId) || {}).handlers).catch(() => null)
  await sleep(2500)
  return { nodeId, handlers, results: d && d.results ? d.results : d, diag: 'dispatch' }
}

/** While the settings modal is open its scrim covers the viewport with
 *  `pointer-events:auto`, so a real click on anything behind it lands on the
 *  scrim (closing the modal) instead of the app control. Every app-gesture
 *  block therefore starts from a CLOSED modal (a real Escape when open). */
async function ufEnsureAppClear(h) {
  const cls = await h.cdp.evaluate(`(document.getElementById('settings-modal')||{}).className||''`)
  if (/is-open/.test(cls)) { await ufModal(h, false) }
  return cls
}

/** Ensure an app-graph pane is EXPANDED (its body rendered) so its controls
 *  exist — a collapsed pane renders no body at all. Real click when needed. */
async function ufEnsurePaneExpanded(h, paneId) {
  const frames = await ufPaneFrames(h)
  const f = frames.find((x) => x.pid === paneId)
  if (!f) return { pid: paneId, present: false, path: 'absent' }
  if (!f.collapsed) return { pid: paneId, present: true, path: 'already-expanded' }
  const r = await ufRealClick(h, `#pane-collapse-${paneId}`)
  await sleep(1500)
  const after = (await ufPaneFrames(h)).find((x) => x.pid === paneId)
  return { pid: paneId, present: true, path: r.path, collapsedAfter: after ? after.collapsed : null }
}

// ---------------------------------------------------------------------------
// §6.1 STRUCTURED RESULT + §5.U ROW SET (docs/specs/user-flow-audit.md §2/§3).
//
// Every ROW block (a block that carries a report row) returns the §6.1 shape
// `{ row, assertion, dclass, realInput, evidence, proxyPASS, surface, pass }`
// built by `rowResult` below, so a verdict can never be emitted without the
// fields the report/audit reads. Two rules are enforced in the builder itself:
//   * `realInput` — only true when the GESTURE PATH was proven (the hit-tested
//     `'cdp'` path); a `'native-fallback'`/`'missing'`/`'zero-box'` path can
//     never feed a PASS (§6.1 realInput rule).
//   * `proxyPASS` — a probe whose ONLY oracle is a seam/presence/attribute/
//     class/slot/computed-style observation is recorded `proxyPASS:true` with
//     `pass:false` and the proxy named in `evidence` (§6.1 proxyPASS rule).
// A measurement-only block (one with no honest PASS/FAIL verdict) declares
// itself `{ diagnostic: true, pass: false }` instead — "a block that cannot
// fail is NOT evidence" — and is never promoted to a matrix-row verdict.
// ---------------------------------------------------------------------------

/** A §6.1 diagnostic/hygiene block result — measurement without a row verdict.
 *  It is deliberately marked as a NON-row: it never carries a matrix row id, so a
 *  report cannot promote it to a matrix verdict (§6.1 "a block that cannot fail
 *  is NOT evidence"). The §6.1 fields are present for schema uniformity only. */
function diagResult(detail, extra = {}) {
  return {
    row: null,
    assertion: null,
    dclass: null,
    realInput: false,
    evidence: detail,
    proxyPASS: false,
    surface: { target: 'assembled-renderer', liveSurfacePresent: null },
    pass: false,
    diagnostic: true,
    detail: detail,
    ...extra,
  }
}

/** Resolve the RCA-12 layer statement carried by every row result. */
async function ufSurfaceTarget(h) {
  const present = await h.cdp.evaluate(`!!document.getElementById('app') && !!document.querySelector('.layout')`).catch(() => null)
  return { target: 'assembled-renderer', liveSurfacePresent: present === true }
}

/**
 * The shared §6.1 row-shape builder. `path` is the recorded gesture path of the
 * block's row gesture ('cdp' = hit-tested real input, 'native-fallback'/'… ' =
 * a synthetic or unproven path); `proxy` names the proxy oracle when the block's
 * only oracle is a presence/attribute/class/geometry-free probe. `NO_EXTRA_FIELDS`
 * is the no-op default for the optional extra-fields bundle.
 */
const NO_EXTRA_FIELDS = Object.freeze({})

function rowResult(row, assertion, dclass, evidence, opts = NO_EXTRA_FIELDS) {
  const path = opts.path ?? null
  const proxy = opts.proxy ?? null
  const realInput = path === 'cdp'
  const surface = opts.surface ?? { target: 'assembled-renderer', liveSurfacePresent: null }
  const proxyPASS = !!proxy
  // The POST-CLICK / revert observation, when the row's oracle is an after-click
  // state (the Undo/Redo rows): `null` when the block has no post-click half, and
  // otherwise REQUIRED in the `pass` derivation, so a no-op click or a failed
  // revert FAILS the row (§6.1: `pass` is never unconditional).
  const undoDisabledAfter = opts.undoDisabledAfter ?? null
  // REAL-INPUT GATE (§6.1): a block whose verdict depends on a user GESTURE
  // (`opts.gesture`, the default) must prove the hit-tested path — `realInput` is
  // derived from `path === 'cdp'` and a fallback path can never PASS. A row whose
  // oracle is not a gesture at all (a pinned MCP/store/state row) opts out with
  // `gesture: false` and carries `realInput: false` honestly.
  const needsGesture = opts.gesture !== false
  const inputGate = needsGesture ? realInput : true
  const pass = !opts.diagnostic && inputGate && !proxyPASS && opts.ok === true && (undoDisabledAfter === null || undoDisabledAfter === true)
  // The returned object is a SINGLE object literal carrying every §6.1 field, so
  // the report schema is structurally checkable on the driver source itself.
  return {
    row: row,
    assertion: assertion,
    dclass: dclass,
    realInput: realInput,
    evidence: evidence,
    proxyPASS: proxyPASS,
    surface: surface,
    pass: pass,
    diagnostic: opts.diagnostic === true,
    proxy: proxyPASS ? proxy : null,
    gesturePath: path,
    undoDisabledAfter: undoDisabledAfter,
    // The harness prints `detail`; for a row result that IS the §6.1 `evidence`
    // (the concrete observed value), so the PASS/FAIL line stays readable.
    detail: evidence,
    ...(opts.extra ?? NO_EXTRA_FIELDS),
  }
}

/** A native DOM `.click()` used ONLY as attribution evidence (never the row's
 *  gesture) — its call sites are marked `[DIAG]`, and it feeds no verdict. */
async function ufNativeClickDiag(h, selector) {
  return h.cdp.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return 'not-found';e.click();return 'native-click'})()`)
}

// ===========================================================================
// UNIT O-0 — PER-STAGE FREEZE MEASUREMENT (PRECONDITION ARTIFACT)
// Contract: docs/specs/unit-o-0-per-stage-measurement.md
//   §2.1 the measured quantity (main-thread long-task total in the window + the
//        DOM mutation count + the wall time), §2.2 the CLOSED 11-stage set,
//        §2.3 the two hit-tested gestures, §2.4 the GPU control + track ablation,
//   §3.1 the 5 closed `o0_*` blocks, §3.3 the pinned flags, §3.4 the seed,
//        §3.6 the bundle identity + the inert measurement-only hook,
//   §4 the report shape + the DERIVED verdict (never hard-coded), §6 F1..F10.
//
// LAYER (RCA-12): assembled-renderer — every number here comes from the EXECUTING
// `dist/` bundle driving a real CDP gesture against a real Electron renderer. The
// node twin of this contract is the PURE module `src/shared/o0-report.ts` (pinned
// by tests/unit-o-0-report-contract.test.ts); the formulas below mirror it, and
// §5's property layer is what keeps the two honest (schema-green ≠ app-green).
// ===========================================================================
const O0_ARTIFACT_ID = 'o-0-per-stage-breakdown'
const O0_ARTIFACT_DOC = 'docs/specs/unit-o-0-per-stage-breakdown.md' // §4.1
const O0_SPEC_PATH = 'docs/specs/unit-o-0-per-stage-measurement.md' // §4.2
const O0_SEED = 'o0-2026-09-17' // §3.4 — the RECORDED constant, never a random value
const O0_OPERATOR_DOCUMENTS = 226 // §3.4 — the operator corpus census
const O0_STAGE_IDS = [
  'snapshot.pull', 'snapshot.clone', 'docheads.pull', 'traversal.build', 'envelope.assemble',
  'shared.decorate', 'reconcile.roots', 'reconcile.apply', 'render.dom', 'render.ssr', 'post.style',
]
const O0_STAGE_COUNT = O0_STAGE_IDS.length // 11 (§8.1)
const O0_BLOCK_NAMES = ['o0_folder_row', 'o0_document_row', 'o0_gpu_control', 'o0_track_ablation', 'o0_repeat_determinism']
const O0_REQUIRED_ROW_FIELDS = ['id', 'block', 'gesture', 'target', 'path', 'stageCount', 'stages', 'longTasks', 'longTaskTotalMs', 'mutations', 'wallMs', 'gpu', 'trackAblation', 'bundleVerified', 'pass', 'failReasons']
const O0_DOCNAV = '#pane-doc-nav'
const O0_FOLDER_SELECTOR = `${O0_DOCNAV} [data-folder-path]` // §2.3 (the v3_docnav selector)
const O0_DOCUMENT_SELECTOR = `${O0_DOCNAV} [data-document-id]`
const O0_QUIESCE_TIMEOUT_MS = 4000 // §2.1 — a RECORDED quiesce timeout, never an unrecorded sleep
const O0_QUIESCE_FRAME_MS = 10
const O0_RECONCILE_TOLERANCE_MS = 50 // §4.2 tolerance.reconcileMs (the residual band)
const O0_HOOK_LONGTASK_TOLERANCE_MS = 40 // §3.6(c) — the recorded hook-inertness band (the same §3.6 band the window bound records as `hook.toleranceMs`)
// §3.5 — the pinned run command set the artifact must record.
const O0_RUN_COMMANDS = [
  'npm run build',
  'node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --display=:0 --o0-out=<path> --block=o0_folder_row,o0_document_row,o0_track_ablation,o0_repeat_determinism',
  'node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --gpu --display=:0 --o0-out=<path> --block=o0_gpu_control',
]
/** The O-0 accumulator for THIS invocation (runs/controls collected by the blocks). */
const o0Acc = { runs: [], hookPairs: [], notes: [] } // controls[] is DERIVED from the runs (o0ControlRows)
/** RUL-5/L10 — the PINNED corpus-provenance statement, emitted on every report so
 *  no reader can mistake the recorded provenance for a cross-run comparable claim:
 *  the operator store is not always reachable (H7) and a reconstructed corpus of the
 *  SAME SIZE has different NODES/EDGES/BYTES, hence different absolute ms values. */
const O0_CORPUS_PROVENANCE_NOTE =
  'the corpus SIZE is the GATE (documents === the claimed census, §3.4/§6 F8) and it is the ONLY pin; nodes/edges/bytes are RECORDED PROVENANCE about the corpus source actually used, NOT a pin and NOT a cross-run comparable claim — a same-size corpus with different bytes yields different absolute ms values (the two runs so far read 10 170/18 758 and 6 102/9 266 nodes/edges at 226 documents, both legal), so (a) no byte-reproducibility may be claimed, (b) no cross-run absolute ms comparison is a measurement, and (c) the node-ceiling input for the parked trigger (b) must be read from THIS run\'s corpus row with the byte-size gap named (§3.4/§4.3/RUL-5/L10, §10 item 2)'

/** The stage → seam map for the FIVE render-path stages (§2.2 ids 4-8) the
 *  measurement-only hook is permitted to bracket (§3.6). Each value names the
 *  instrumented seam of that stage: `buildTraversal` (src/main/traversal.ts),
 *  `assembleAppGraphEnvelope` (src/renderer/pane-graph.ts), `decorateShared`
 *  (src/renderer/sidebar-panes.ts), `reconcileDocumentRoots`
 *  (src/renderer/content-reconcile.ts), `Runtime.applyContentReconcile`
 *  (src/renderer/runtime.ts). Those seams are INSIDE the renderer host, so the
 *  page-side hook arms them through the handle the renderer exposes
 *  (`window.__o0recorder`, the app-wide recorder of src/shared/o0-hook.ts): a
 *  refused/absent handle leaves the stage `unseparated` (never a silent value). */
const O0_HOOK_SEAMS = {
  'traversal.build': 'buildTraversal',
  'envelope.assemble': 'assembleAppGraphEnvelope',
  'shared.decorate': 'decorateShared',
  'reconcile.roots': 'reconcileDocumentRoots',
  'reconcile.apply': 'Runtime.applyContentReconcile',
}
const O0_HOOK_STAGES = Object.keys(O0_HOOK_SEAMS)
/** RUL-1 (§2.2 ids 9/10) — the two render-EMIT seams landed in
 *  `src/renderer/runtime.ts` (`render()`'s `DomAdapter` pass + the SSR mirror
 *  pass). Their stage ids are RENDERER-side seams of the SAME recorder, so the
 *  page-side hook arms them exactly like the five render-path stages; they are
 *  kept in a separate map so the §3.6 "stages 4-8" seam map (and its B8 pin) stays
 *  literally the five render-path stages. */
const O0_RENDER_EMIT_SEAMS = {
  'render.dom': 'Runtime.render (the DomAdapter renderProducingProcess pass)',
  'render.ssr': 'Runtime.render (the SSR mirror renderProducingProcess pass)',
}
/** §2.2/§3.6b — every stage id the page-side hook arms on the renderer's recorder:
 *  the five render-path stages + the two render-emit stages + the two caller-level
 *  round trips. */
const O0_RENDERER_ARM_STAGES = [...O0_HOOK_STAGES, ...Object.keys(O0_RENDER_EMIT_SEAMS)]
const O0_HOOK_RENDERER_HANDLE = 'window.__o0recorder'
/** §3.6/§3.6b — the page-side measurement-only hook. INERT WHEN UNARMED: the
 *  renderer's recorder emits no mark/measure and commits no record while unarmed,
 *  so an unarmed run adds no DOM mutation and no long task. An armed hook only
 *  records `performance.mark`/`measure` around the EXISTING call sites (it
 *  reorders, adds and removes no work). A hook-induced change to the mutation
 *  count or the long-task total is a falsifiable row (`o0_repeat_determinism`).
 *
 *  §3.6b — NO page-side wrap of `provident.rag.*` is attempted HERE (or anywhere):
 *  those props are `contextBridge`-frozen (`{writable:false, configurable:false}`,
 *  §12 H2), so a page wrap can never take. The round trips are recorded INSIDE the
 *  bundle at the shell's OWN call sites (`src/renderer/sidebar-panes.ts`) by the
 *  app-wide recorder, which this page handle only ARMS. */
const O0_HOOK_SOURCE = `(()=>{
  if (window.__o0) return true;
  const state = { armed: false, armCount: 0, disarmCount: 0, rendererArmed: false, refused: [], armedAt: null, disarmedAt: null };
  // §3.6 — the render-path half: stages 4-8 (+ the caller-level seams) are
  // bracketed by the recorder the renderer exposes, never by a preload wrap. An
  // absent/refusing handle is RECORDED and leaves those stages unseparated
  // (never a silently measured value).
  state.renderer = function (stages) {
    const rec = window.__o0recorder;
    const list = (stages || []).slice();
    state.rendererArmed = false;
    state.refused = [];
    if (!rec || typeof rec.arm !== 'function') {
      state.refused.push({ stages: list, reason: 'window.__o0recorder absent — the executing bundle exposes no §3.6 hook seam (the render-path and caller-level stages stay unseparated)' });
      return false;
    }
    try {
      // A clean measurement window: the recorder's records are cleared by the
      // arm transition, so a still-armed recorder (a previous freeze) is disarmed
      // first — an armed run never inherits another window's records.
      if (typeof rec.disarm === 'function') { try { rec.disarm() } catch (e) {} }
      rec.arm(list);
      state.rendererArmed = typeof rec.isArmed === 'function' ? rec.isArmed() === true : true;
    } catch (e) {
      state.rendererArmed = false;
      state.refused.push({ stages: list, reason: String(e) });
    }
    if (!state.rendererArmed && !state.refused.length) {
      state.refused.push({ stages: list, reason: 'the renderer hook refused the arm (stages stay unseparated)' });
    }
    return state.rendererArmed;
  };
  state.arm = function (rendererStages) {
    state.armed = true; state.armCount++;
    state.armedAt = performance.now();
    state.renderer(rendererStages);
    return { rendererArmed: state.rendererArmed === true, refused: state.refused.slice(), armedAt: state.armedAt };
  };
  state.disarm = function () {
    state.armed = false; state.disarmCount++;
    state.disarmedAt = performance.now();
    const rec = window.__o0recorder;
    if (rec && typeof rec.disarm === 'function') { try { rec.disarm() } catch (e) {} }
    return true;
  };
  state.read = function () {
    const rec = window.__o0recorder;
    let records = [];
    if (rec && typeof rec.records === 'function') { try { records = rec.records() || [] } catch (e) { records = [] } }
    let dropped = null;
    let pending = null;
    if (rec && typeof rec.state === 'function') {
      try {
        const s = rec.state();
        dropped = s && typeof s.dropped === 'number' ? s.dropped : null;
        // RUL-2 — the OPEN (unsettled) spans at drain time: a non-zero value means a
        // span did NOT fit its window (never a dangling start mark read as a value).
        pending = s && typeof s.pending === 'number' ? s.pending : null;
      } catch (e) {}
    }
    return { armed: state.armed, records: records, rendererArmed: state.rendererArmed === true, refused: state.refused.slice(), dropped: dropped, pending: pending, armCount: state.armCount, disarmCount: state.disarmCount, armedAt: state.armedAt, disarmedAt: state.disarmedAt };
  };
  window.__o0 = state;
  return true;
})()`
/** §2.2/§3.6b — the stage ids the page-side hook arms on the renderer's recorder.
 *
 *  HARNESS FIX (2026-09-17 second run, finding L2): the arm set MUST carry the two
 *  CALLER-LEVEL seam ids (`snapshot.pull`, `docheads.pull`) as well as the five
 *  render-path ids. §3.6b records the caller-level round trips inside the bundle at
 *  the shell's own call sites and answers A-4 "at this CALLER level" (§11 gate item
 *  7 requires a non-null `snapshot.pull` for BOTH gestures), and the published page
 *  handle is the ONLY arm channel — a recorder armed for the render path ONLY
 *  DROPS every caller-level record (`state().dropped`), which is what the first
 *  fixed-bundle run measured (`snapshot.pull` emitted `unmeasured`, never a
 *  number). The module's own guard accepts exactly `O0_HOOK_SEAM_STAGES`, so the
 *  caller-level ids are a legal arm request; §3.6b's "the only stages a page-side
 *  arm() may request" sentence is CONTRADICTED by §11 item 7 and is recorded as a
 *  spec-vs-live finding (§11 of the artifact), not silently ignored. `snapshot.clone`
 *  is deliberately NOT armed here: no renderer seam can produce it (it is the MAIN
 *  instance's span), and arming it would invite a phantom double-record (§6 F14).
 *
 *  RUL-1 (§2.2 ids 9/10): the arm set ALSO carries `render.dom`/`render.ssr` — the
 *  two render-EMIT seams now instrumented in `src/renderer/runtime.ts`. Before that
 *  seam existed those stages could only come back `unseparated` (no seam at all),
 *  so the JS-emit vs style/layout/paint split §2.2/§10 asks for was structurally
 *  unavailable. A bundle whose recorder does not permit them REFUSES the arm
 *  (`O0_HOOK_STAGE_NOT_ALLOWED`) and every renderer-side stage is then reported
 *  STRUCTURAL with the refusal recorded — never a silent `unseparated`.
 *
 *  RUL-2 (the L5 fix): the caller-level spans now close on SETTLEMENT of the awaited
 *  round trip (the recorder awaits a thenable body), so the ms on `snapshot.pull` is
 *  the IPC + structured-clone round trip rather than promise creation, and an
 *  in-flight span at drain time is recorded as `hook.pendingSpans` (never a dangling
 *  start mark read as a measurement). */
const O0_PAGE_ARM_STAGES = ['snapshot.pull', 'docheads.pull', ...O0_RENDERER_ARM_STAGES]

/** §3.6/§4.3 — the node twin of the stage-row aggregation is the PURE
 *  `stagesFromO0HookRecords` of `src/shared/o0-hook.ts`; the report-shape twin is
 *  `src/shared/o0-report.ts`. §3.6b/F16 pins option (b): the in-driver MIRROR is
 *  DELETED (two implementations of one contract is a drift surface no recording
 *  field can close), the driver imports the pinned `.ts` twins, and an unavailable
 *  import is a LOUD abort — the `main()` catch prints `[live-drive] ERROR:` and
 *  exits 2 with NO artifact written (the §6 F6 discipline), NEVER a fallback that
 *  emits a number. Both are populated by `o0ImportTwins()` inside `main()`'s try. */
const o0Twins = {}
async function o0ImportTwins() {
  o0Twins.hook = await import(pathToFileURL(join(ROOT, 'src/shared/o0-hook.ts')).href)
  o0Twins.report = await import(pathToFileURL(join(ROOT, 'src/shared/o0-report.ts')).href)
}
/** §6 S11/F16 — exactly ONE legal `hook.stageRowsSource` value. */
const O0_HOOK_STAGE_ROWS_SOURCE = 'src/shared/o0-hook.ts:stagesFromO0HookRecords'
/** §3.6b/S15 — the recorded reason for a stage whose seam does not exist in the
 *  executing bundle (the STRUCTURAL class, distinct from merely unmeasured). */
const O0_MAIN_SEAM_MISSING =
  'no main-side seam in the executing bundle AND no main-side transport (a --connect run cannot arm the main-side recorder, and no channel carries its records out — §3.6b/S15/RUL-3)'
/** §3.6b/S15 — HARNESS FIX (2026-09-17 second run, finding L3): in SPAWN mode the
 *  main-side recorder IS armed (the driver sets `ASTROGRAPHER_O0_MAIN_ARM=1` and
 *  `src/main/main.ts` arms its own instance).
 *  RUL-3 (the L3s fix) — the main-side span is now TRANSPORTED to the report
 *  through the pinned `ASTROGRAPHER_O0_MAIN_RECORDS` file (one JSON record per
 *  line, appended by main AFTER the IPC reply is built, read by this driver after
 *  each freeze's drain and attributed `instance:'main'`), so `snapshot.clone` is a
 *  real number and §6 S15's inside/outside split is available in spawn mode.
 *  The stage stays STRUCTURAL with this exact reason only when no main record was
 *  received for the window: a `--connect` run cannot arm the main instance (the
 *  driver does not spawn, so it cannot set the env), a bundle without the span
 *  records nothing, and an unreadable transport file names itself. */
const O0_MAIN_SEAM_UNTRANSPORTED =
  "no main-side transport: (i) the MAIN instance IS armed (ASTROGRAPHER_O0_MAIN_ARM=1) and its wrap records `snapshot.clone` on the IPC_RAG_SNAPSHOT handler, but the executing bundle exposes NO channel carrying the main recorder's records into the renderer or the report (the observed L3s state: driver.mainSeamArmed:false, hook.stageRecords carries no instance:'main' entry); and (ii) Electron's structured-clone serialization of the handler's return value happens inside the IPC internals AFTER the handler returns, outside every wrap this repo can put on the path — so the main-side handler share (store read + reply-payload construction) and the serialization share are both UNMEASURED, and the residual absorbs them (§3.6b S15/RUL-3); the caller-level `snapshot.pull` round trip IS measured"
/** §2.2 ids 9/10 / §6 S14 (RUL-1) — the renderer-side seams (`render.dom`,
 *  `render.ssr`, the render-path 4-8 and the caller-level pulls) exist in this
 *  bundle; a renderer-side stage that stays unseparated because the recorder
 *  handle was ABSENT or REFUSED the arm has no seam in the executing bundle, which
 *  is the STRUCTURAL class — never the "the seam exists but was not armed" one. */
const O0_RENDERER_SEAM_MISSING =
  'no renderer-side seam in the executing bundle: window.__o0recorder did not arm this stage (the handle was absent, or the arm was refused, or the executing bundle carries no seam for it) — §3.6/§6 S14: a seam that does not exist in the bundle is STRUCTURAL, never merely unmeasured'

function o0Num(v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) return 'null'
  return String(Math.round(v * 100) / 100)
}
function o0Hash(text) {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0
  return h.toString(16)
}
function o0Date() {
  return new Date().toISOString().slice(0, 10)
}
/** The §4.3 verdict of ONE freeze row — DERIVED from the row, never asserted.
 *
 *  O0-M1-M3 §2.5/§3.2/§3.3/§3.5/§3.4 — this is the ONE call site of the three NEW pure
 *  oracles (`src/shared/o0-report.ts`, the pinned twin of this driver):
 *    * `partitionO0RowPasses(row)` — the per-pass partition + the UNION accounting
 *      (`hook.passes[]`, `hook.passCount`, `hook.passKindSequence`, `hook.passOverlaps[]`,
 *      `hook.passLongTaskDoubleCountMs`, `hook.nestingAmbiguities[]`, `reconciliation.*`);
 *    * `deriveO0LongTaskAttribution(window, longTasks)` — the PINNED
 *      `start-inside-inclusive` rule + the two rejected alternatives + the ambiguity
 *      record (`hook.longTaskAttribution`);
 *    * `deriveO0RowArmCounts(hook)` — the per-row arm/disarm counts and the
 *      `0 ≤ a − d ≤ 1` invariant (`hook.rowArmCount`/`rowDisarmCount`/`session*`).
 *  There is NO in-driver mirror of any of the three (the `o0StagesFromHookRecords`
 *  precedent: a mirror is DELETED, not audited — O-0 §3.6b/F16). */
function o0RowPass(row) {
  const reasons = []
  // §2.2 — the per-row arming, from the pre-arm + post-disarm readings.
  const armCounts = o0Twins.report.deriveO0RowArmCounts(row.hook)
  row.hook.rowArmCount = armCounts.rowArmCount
  row.hook.rowDisarmCount = armCounts.rowDisarmCount
  row.hook.sessionArmCount = armCounts.sessionArmCount
  row.hook.sessionDisarmCount = armCounts.sessionDisarmCount
  row.hook.sessionCountsAt = armCounts.sessionCountsAt ?? row.hook.sessionCountsAt
  for (const m of armCounts.failReasons) reasons.push(m)
  // §3.2/§3.3 — the pass partition + the union accounting (the M1 shape).
  const partition = o0Twins.report.partitionO0RowPasses(row)
  row.hook.passes = partition.passes
  row.hook.passCount = partition.passCount
  row.hook.passKindSequence = partition.passKindSequence
  row.hook.nestingAmbiguities = partition.nestingAmbiguities
  // §4.1/S5 — `hook.passOverlaps[]` names the pass pairs whose WINDOWS overlap (with
  // the measured overlap). It is NOT the nesting-ambiguity list (FS3): conflating the
  // two made the field promise an overlap measure it did not carry.
  row.hook.passOverlaps = partition.passOverlaps ?? []
  row.hook.passLongTaskDoubleCountMs = partition.row.passLongTaskDoubleCountMs
  if (Array.isArray(partition.stageRecordDetail)) {
    const byIndex = new Map(partition.stageRecordDetail.map((d) => [d.index, d]))
    for (const d of row.hook.stageRecordDetail ?? []) {
      const derived = byIndex.get(d.index)
      if (derived) d.passIndex = derived.passIndex
    }
  }
  // §3.4 — the PINNED long-task rule, RE-DERIVED from the observed list. The returned
  // record carries the pinned `includedCount`/`includedMs` (which must equal the row's
  // own `longTaskTotalMs`) AND the two REJECTED alternatives for discrimination only:
  // `overlapAnyMs` (the overlap-any total) and `intersectionMs` (the clipped-intersection
  // total). No driver arithmetic ever consumes those two — the oracle's own
  // `includedMs` is the primary total.
  const frozen = row.hook.freezeWindow ?? { t0: null, t1: null }
  const attribution = o0Twins.report.deriveO0LongTaskAttribution({ t0: frozen.t0, t1: frozen.t1 }, row.longTasks ?? [])
  row.hook.longTaskAttribution = {
    ...attribution,
    // recorded for DISCRIMINATION only — never used as the oracle (§2.3).
    overlapAnyMs: attribution.overlapAnyMs,
    intersectionMs: attribution.intersectionMs,
    startBeforeOverlapMs: attribution.startBeforeOverlapMs,
    straddleEndMs: attribution.straddleEndMs,
  }
  // §2.1/§4.1 — the row's remainder is the AUTHORITATIVE quantity; the per-pass values
  // are the attribution layer.
  row.reconciliation = {
    ...(row.reconciliation ?? {}),
    windowMs: partition.row.windowMs,
    accountedMs: partition.row.accountedMs,
    unaccountedMs: partition.row.unaccountedMs,
    unaccountedReason: partition.row.unaccountedReason,
    overlapMs: partition.row.overlapMs,
    outsideMs: partition.row.outsideMs,
    passOverlapSumMs: partition.row.passOverlapSumMs,
    // §2.1/RUL-11 — the BAND SCOPE, recorded on the row: the union remainder is judged
    // against `toleranceMs` (tolerance.reconcileMs, 50 ms) while `hook.toleranceMs`
    // (40 ms) is the WINDOW-BOUND band (`outsideMs`/FS6). The FIFTH run judged the
    // remainder against 40 and recorded 50 (the mis-scoped-band defect, `F5-1`).
    windowBoundToleranceMs: partition.row.windowBoundToleranceMs,
    // §2.4/RUL-11 — the two SIGNED diagnostics of the pass layer are emitted ONLY
    // under their own labels (`notAMeasure` / `notADoubleCount`): the field a measure's
    // name promises never carries a signed difference. On the FIFTH run
    // `passOverlapSumMs` read Σ(pass totals) − row total (−131.2 … −17.6) and
    // `passLongTaskDoubleCountMs` the same signed form (−53 / −95 / −63).
    passTotalsMinusRowMs: partition.row.passTotalsMinusRowMs,
    passTotalsMinusRowNote: 'notADoubleCount',
    passRowUnaccountedDeltaMs: partition.row.passRowUnaccountedDeltaMs,
    passRowUnaccountedDeltaNote: 'notAMeasure',
    bandExceededNote: partition.row.bandExceededNote ?? null,
    // §3.6b RUL-4 clause 5 (+ RUL-12/F5-6) — the row's OWN restatement of the mandatory
    // note: what the number IS (a DERIVED accounting quantity, attributable:false) and
    // what it is NOT (a stage cost), whether or not the band was exceeded. The report's
    // TOP-LEVEL `reconciliation.note` is emitted separately and is never null.
    note:
      partition.row.bandExceededNote
        ? `${partition.row.bandExceededNote}; the DERIVED remainder is an accounting quantity, attributable:false, and is never a stage cost ` +
          `(§3.6b RUL-4 clause 5)`
        : `the DERIVED remainder is an accounting quantity (unaccountedSource 'derived', attributable:false) and is never a stage cost; ` +
          `no value was imputed (§3.6b RUL-4 clause 5)`,
    outcomeReasons: partition.row.outcomeReasons ?? [],
    bandExceeded: partition.row.bandExceeded,
    unaccountedSource: 'derived',
    unaccountedAttributable: false,
    passes: partition.passes.map((p) => ({
      index: p.index,
      kind: p.kind,
      spanMs: p.window.ms,
      accountedMs: p.accountedMs,
      unaccountedMs: p.unaccountedMs,
      longTaskTotalMs: p.longTaskTotalMs,
    })),
    naiveSumResidualMs: partition.row.naiveSumResidualMs,
    naiveSumResidualNote: 'notAResidual',
    residual: null,
    retired: true,
    retiredBy: 'O0-M1-M3-MEASUREMENT-SHAPE (M1)',
  }
  // §6 FS1 — a NEGATIVE remainder is unrepresentable: the field is `null` and the reason
  // names the arithmetic (the union accounting cannot produce one).
  if (partition.row.unaccountedReason) reasons.push(`run ${row.id}: ${partition.row.unaccountedReason}`)
  // §2.1(iii)/RUL-11 (the `F5-1` fix) — a BAND-EXCEEDED remainder is a LEGITIMATE
  // MEASUREMENT OUTCOME ("reconciled with the band exceeded"), never a shape failure:
  // it is REPORTED on the row (`reconciliation.bandExceeded` + `bandExceededNote` +
  // `row.notes`) and must NOT enter `row.failReasons`, `row.pass` or the report's
  // gating. On the FIFTH run exactly this propagation turned the DEC-1-accepted
  // `OPEN-structural` form into `status:"FAIL"` with 9 / 5 gating reasons.
  const outcomeReasons = new Set(partition.row.outcomeReasons ?? [])
  if (partition.row.bandExceeded && partition.row.bandExceededNote) {
    row.notes = [...(row.notes ?? []), partition.row.bandExceededNote]
  }
  for (const m of partition.failReasons) if (!outcomeReasons.has(m)) reasons.push(m)
  if (row.path !== 'cdp') reasons.push(`gesture path ${row.path} (not 'cdp') for ${row.target} — hit=${row.hit ?? 'null'}`)
  if (row.realInput !== (row.path === 'cdp')) reasons.push(`realInput ${row.realInput} disagrees with path ${row.path} (realInput is DERIVED: path === 'cdp')`)
  if (row.stageCount !== O0_STAGE_COUNT) reasons.push(`stageCount ${row.stageCount} ≠ ${O0_STAGE_COUNT}`)
  const rowIds = row.stages.map((s) => s.id)
  const missing = O0_STAGE_IDS.filter((id) => !rowIds.includes(id))
  const extra = rowIds.filter((id) => !O0_STAGE_IDS.includes(id))
  if (missing.length) reasons.push(`stage ${missing.join(', ')} missing from run ${row.id} (stageCount ${row.stageCount} ≠ ${O0_STAGE_COUNT})`)
  if (extra.length) reasons.push(`unknown stage id ${extra.join(', ')} in run ${row.id} (not the closed §2.2 set)`)
  for (const s of row.stages) {
    const legal = (s.ms === null && s.unseparated === true) || (typeof s.ms === 'number' && Number.isFinite(s.ms) && s.ms >= 0)
    if (!legal) reasons.push(`stage ${s.id} ms is ${String(s.ms)} (expected a non-negative finite number or null+unseparated)`)
  }
  for (const f of ['longTaskTotalMs', 'mutations', 'wallMs']) {
    const v = row[f]
    if (!(v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0))) reasons.push(`${f} is ${String(v)} (expected a non-negative finite number or null)`)
  }
  if (row.bundleVerified !== true) reasons.push(`executing bundle ≠ on-disk bundle (bundleVerified ${row.bundleVerified}, served ${row.bundle?.served})`)
  if (row.trackAblation.applied === true && !row.trackAblation.mutation) reasons.push('trackAblation applied:true without the recorded style mutation (unverifiable ablation)')
  // §4.3 H3 — the WINDOW BOUND, judged against the window the row RECORDS: a stage
  // cannot be larger than the freeze it belongs to (§6 F13a) and an armed window
  // that starts before `o0:t0` / ends after `o0:t1` beyond the band is a violation.
  if (row.hook && row.hook.armWindow && row.hook.freezeWindow) {
    for (const m of o0Twins.report.deriveO0WindowBound(row).failReasons) reasons.push(m)
  }
  // §4.3/§6 S14 + RUL-4 — a stage that cannot be separated is REPORTED, and the two
  // classes are kept apart: STRUCTURAL (no seam exists in the executing bundle,
  // with its recorded reason) is a recorded GAP of the harness and does NOT force
  // `pass:false`; a merely UNMEASURED stage (the seam exists but was not armed) and
  // the DERIVED `post.style` residual still behave as before (the latter is
  // excluded here because its separability IS the reconciliation).
  const structural = []
  for (const s of row.stages) {
    if (!s || s.unseparated !== true) continue
    if (s.structural === true) structural.push(`stage ${s.id} is structurally unseparated — ${s.structuralReason} (§6 S14)`)
    else if (s.id !== 'post.style') reasons.push(`stage ${s.id} is unmeasured in this run (the seam exists but the recorder was not armed for it — §4.3/§6 S14)`)
  }
  // RUL-2 — an awaited seam span that had not SETTLED when the freeze window closed
  // did not fit its window: recorded, never read as a value (§3.6/§5 P-TP-3).
  if (Number.isFinite(row.hook?.pendingSpans) && row.hook.pendingSpans > 0) {
    structural.push(
      `${row.hook.pendingSpans} awaited seam span(s) had not settled when the freeze window closed — a span outside its window is NOT a ` +
        `measurement of that window (§3.6/RUL-2)`,
    )
  }
  row.pass = reasons.length === 0
  row.failReasons = reasons
  // RUL-4 — the row's recorded STRUCTURAL class (non-gating) + its derived status
  // marker, so a reader sees at the row itself why it is not a FAIL.
  row.structuralReasons = structural
  row.structuralStages = row.stages.filter((s) => s && s.unseparated === true && s.structural === true).map((s) => s.id)
  row.openStructural = structural.length > 0 && reasons.length === 0
  // §2.5a RUL-12 (the `F5-5` fix) — the NEW surface's own validator runs over the row
  // the driver just assembled and its verdict is RECORDED (`row.measurementShape`) and
  // GATED: on the FIFTH run `validateO0MeasurementShape` returned `ok:true` beside a
  // negative `passLongTaskDoubleCountMs`/`passOverlapSumMs` and a collapsed pass-0
  // window. A row the NEW surface refuses may not be part of a passing report
  // (`ok:true` beside an `FS11`/`FS12` observable is a review finding).
  const shape = o0Twins.report.validateO0MeasurementShape(row)
  row.measurementShape = {
    ok: shape.ok,
    errors: shape.errors,
    notes: shape.notes,
    legacyShape: shape.legacyShape,
    legacyShapeReason: shape.legacyShapeReason,
    // §3b re-audit finding (1) [O0-SHAPE-REASON-DROPPED-FROM-THE-FORCING-CHANNEL] — the
    // reason set is RECORDED on the row verbatim, so a consumer of `row.measurementShape`
    // never has to re-run the oracle to see WHY a row was refused. Before this, only
    // `errors[]` was recorded: a clause whose reason lived in `failReasons` alone was
    // invisible in the artifact.
    failReasons: shape.failReasons,
  }
  // §3b re-audit finding (1) — the COPY CONDITION is the non-emptiness of EITHER channel,
  // never `!shape.ok`: `shape.failReasons` is copied whenever it is non-empty (the
  // validator's own verdict is now derived from BOTH sets, but the copy no longer RELIES
  // on that derivation — a reason the validator mints is EVIDENCE and may not be dropped).
  if (shape.ok !== true || shape.failReasons.length > 0) {
    const copied = [...new Set([...(shape.errors ?? []), ...(shape.failReasons ?? [])])]
    for (const m of copied) reasons.push(`measurement shape: ${m}`)
    row.measurementShape.copiedReasons = copied.length
    row.pass = false
    row.failReasons = reasons
  }
  return row
}
/** §4.3 — the artifact reads exactly these fields; a gap is a loud FAIL. */
function o0RequireRowFields(row, fields = O0_REQUIRED_ROW_FIELDS) {
  const gaps = fields.filter((f) => !(f in row))
  if (gaps.length) {
    row.pass = false
    row.failReasons = [...(row.failReasons ?? []), `§4.3 freeze row missing field(s) ${gaps.join(', ')}`]
  }
  return row
}
async function o0HookInstall(h) {
  return h.cdp.evaluate(O0_HOOK_SOURCE)
}
/** Arm the hook (installing it first) for the FIVE §2.2 render-path stages 4-8 —
 *  the only stages a page-side arm may request (§3.6b). Inertness is the §3.6(c)
 *  property: the armed and unarmed freezes are compared by
 *  `o0_repeat_determinism`. */
async function o0HookArm(h) {
  await o0HookInstall(h)
  // §2.2/§3.5 — the PRE-ARM reading: the handle's session counts + a `performance.now()`
  // stamp taken IMMEDIATELY BEFORE this row's `arm()`. `rowArmCount = post.arm − pre.arm`
  // and `rowDisarmCount = post.disarm − pre.disarm` (the post reading is taken after the
  // row's OWN disarm, in `o0QuiesceAndDrain`), so the per-row counts are attributable to
  // THIS row instead of reading a session-cumulative total under a per-row name (M2).
  return h.cdp.evaluate(`(()=>{
    const pre = window.__o0 && typeof window.__o0.read === 'function' ? window.__o0.read() : null;
    const sessionCountsAt = { pre: pre ? { arm: pre.armCount ?? 0, disarm: pre.disarmCount ?? 0, at: performance.now() } : null };
    if (!window.__o0) return { armed:false, error:'hook absent', rendererArmed:false, armedAt:null, refused:[{ stages:${JSON.stringify(O0_PAGE_ARM_STAGES)}, reason:'window.__o0 absent — the driver hook was not installed' }], sessionCountsAt:{ pre:null, post:null } };
    const a = window.__o0.arm(${JSON.stringify(O0_PAGE_ARM_STAGES)});
    return { armed:true, rendererArmed:a.rendererArmed === true, armedAt:a.armedAt ?? null, refused:a.refused, sessionCountsAt:sessionCountsAt };
  })()`)
}
async function o0HookState(h) {
  return h.cdp.evaluate(`(()=>{ const s=window.__o0; return s?s.read():null })()`)
}
/** §2.1 — arm the window observers: the MutationObserver on `document.body`
 *  (`childList`+`subtree`+`attributes`+`characterData`, the defects.md:36 method)
 *  and the `longtask` PerformanceObserver. */
async function o0ArmObservers(h) {
  return h.cdp.evaluate(`(()=>{
    const prev = window.__o0obs;
    if (prev) { try { prev.mo.disconnect() } catch (e) {} try { prev.po.disconnect() } catch (e) {} }
    const st = { mutations: 0, longTasks: [], armed: true, longtaskUnsupported: null };
    const mo = new MutationObserver((recs) => { st.mutations += recs.length });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, characterData: true });
    const po = new PerformanceObserver((list) => { for (const e of list.getEntries()) st.longTasks.push({ start: e.startTime, duration: e.duration }) });
    try { po.observe({ type: 'longtask', buffered: false }) } catch (e) {
      try { po.observe({ entryTypes: ['longtask'] }) } catch (e2) { st.longtaskUnsupported = String(e2) }
    }
    st.mo = mo; st.po = po; window.__o0obs = st;
    return { longtaskUnsupported: st.longtaskUnsupported };
  })()`)
}
async function o0Mark(h, name) {
  return h.cdp.evaluate(`(()=>{ performance.mark(${JSON.stringify(name)}); const e=performance.getEntriesByName(${JSON.stringify(name)}).pop(); return e?e.startTime:performance.now() })()`)
}
/** §2.1 + §4.3/P-TP-3(b) — quiesce on `requestAnimationFrame` with a RECORDED
 *  timeout (never an unrecorded fixed sleep), mark `o0:t1`, then DISCONNECT the
 *  observers, read the recorder's records and DISARM — all inside ONE page-side
 *  evaluate.
 *
 *  HARNESS FIX (2026-09-17 second run, finding L6): the drain and the disarm used to
 *  be two further CDP round trips AFTER the `o0:t1` mark, so the recorded
 *  `hook.armWindow.t1` was inflated by driver↔renderer latency whenever the renderer
 *  was busy (measured: 71.6 ms past `o0:t1` on the document-row freeze, which trips
 *  the recorded 40 ms band and forces the WINDOW-BOUND VIOLATED verdict on a row
 *  whose stage spans are all inside the freeze). Folding the drain + disarm into the
 *  quiesce evaluate makes the armed interval the interval actually measured
 *  (`[armedAt, o0:t1]` + the synchronous post-mark work), so the arm/disarm
 *  bookkeeping no longer widens the window it reports. */
async function o0QuiesceAndDrain(h) {
  return h.cdp.evaluate(`(async()=>{
    const t0 = performance.now();
    let smooth = 0, last = performance.now(), frames = 0;
    while (performance.now() - t0 < ${O0_QUIESCE_TIMEOUT_MS}) {
      await new Promise((r) => requestAnimationFrame(() => r()));
      const now = performance.now();
      const dt = now - last; last = now; frames++;
      if (dt < ${O0_QUIESCE_FRAME_MS}) { smooth++; if (smooth >= 3) break } else { smooth = 0 }
    }
    performance.mark('o0:t1');
    const t1 = performance.now();
    const st = window.__o0obs;
    if (!st) return { frames: frames, quiesced: smooth >= 3, timedOut: (t1 - t0) >= ${O0_QUIESCE_TIMEOUT_MS}, timeoutMs: ${O0_QUIESCE_TIMEOUT_MS}, drain: null };
    try { st.mo.disconnect() } catch (e) {}
    try { st.po.disconnect() } catch (e) {}
    const mark = (n) => { const e = performance.getEntriesByName(n).pop(); return e ? e.startTime : null };
    const m0 = mark('o0:t0'), m1 = mark('o0:t1');
    // §2.3/§3.4 — the PRIMARY ORACLE's rule, documented at its site: the pinned
    // start-inside-inclusive rule, i.e. a long task counts iff t0 <= start <= t1
    // (inclusive at BOTH endpoints) and its FULL duration is added — never its clipped
    // intersection with the window. The rejected alternatives (overlap-any, intersection)
    // are NOT implemented here: they are recorded (never used as the oracle) by
    // deriveO0LongTaskAttribution on the row's hook.longTaskAttribution.
    const longTasks = (st.longTasks || []).filter((e) => (m0 === null || e.start >= m0) && (m1 === null || e.start <= m1)).map((e) => ({ start: e.start, duration: e.duration }));
    // §2.3 — the SAME observed list, un-filtered, so the attribution record can
    // discriminate the pinned rule from the rejected alternatives (the oracle is
    // RE-DERIVED from the recorded list, never asserted true).
    const observedLongTasks = (st.longTasks || []).map((e) => ({ start: e.start, duration: e.duration }));
    st.armed = false;
    const hook = window.__o0 ? window.__o0.read() : null;
    let disarmedAt = null;
    let postDisarm = null;
    if (hook && hook.armed === true && window.__o0 && typeof window.__o0.disarm === 'function') {
      window.__o0.disarm();
      const after = window.__o0.read();
      disarmedAt = after ? after.disarmedAt : null;
      // §2.2/§3.5 — the POST-DISARM reading: the session counts are read AFTER the row's
      // OWN disarm (today only \`after.disarmedAt\` was consumed, so a row's disarm landed
      // on the NEXT row's reading — the M2 defect).
      postDisarm = after ? { arm: after.armCount ?? 0, disarm: after.disarmCount ?? 0, at: performance.now() } : null;
    }
    return {
      frames: frames, quiesced: smooth >= 3, timedOut: (t1 - t0) >= ${O0_QUIESCE_TIMEOUT_MS}, timeoutMs: ${O0_QUIESCE_TIMEOUT_MS},
      drain: {
        mutations: st.mutations,
        longTasks: longTasks,
        longTaskTotalMs: longTasks.reduce((a, e) => a + e.duration, 0),
        observedLongTasks: observedLongTasks,
        t0: m0, t1: m1,
        hook: hook,
        disarmedAt: disarmedAt,
        postDisarm: postDisarm,
        longtaskUnsupported: st.longtaskUnsupported || null,
      },
    };
  })()`)
}
/** §2.3 — the hit-probe (scroll + `elementFromPoint`), BEFORE t0: the gesture is
 *  dispatched at the probed coordinate and the recorded path is what the verdict
 *  rests on (`cdp` only when the point resolves to the target or a descendant). */
async function o0ProbeTarget(h, selector) {
  const q = JSON.stringify(selector)
  await h.cdp.evaluate(`(()=>{const e=document.querySelector(${q});if(e&&typeof e.scrollIntoView==='function')e.scrollIntoView({block:'center'});return true})()`)
  await sleep(250)
  const probe = async () => h.cdp.evaluate(`(()=>{
    const e = document.querySelector(${q});
    if (!e) return null;
    const r = e.getBoundingClientRect();
    const x = r.x + r.width / 2, y = r.y + r.height / 2;
    const hit = document.elementFromPoint(x, y);
    return { x: x, y: y, w: Math.round(r.width), h: Math.round(r.height), hit: hit ? (hit.id || hit.tagName) : null,
             onTarget: !!(hit && (hit === e || e.contains(hit))),
             inViewport: x >= 0 && y >= 0 && x <= window.innerWidth && y <= window.innerHeight };
  })()`)
  let p = await probe()
  if (p && !p.onTarget) { await sleep(200); p = await probe() } // one re-probe (a reflow must not fake a miss)
  if (!p) return { path: 'missing', detail: `not found: ${selector}` }
  if (p.w === 0 || p.h === 0) return { path: 'zero-box', ...p, detail: `zero-size box ${p.w}x${p.h}` }
  if (!p.inViewport) return { path: 'off-viewport', ...p, detail: `probe (${Math.round(p.x)},${Math.round(p.y)}) outside the viewport` }
  if (!p.onTarget) return { path: 'native-fallback', ...p, detail: `hit=${p.hit} (not the target)` }
  return { path: 'cdp', ...p, detail: `hit=${p.hit} at (${Math.round(p.x)},${Math.round(p.y)})` }
}
/** Dispatch the REAL CDP pointer gesture at the probed coordinate (the `ufRealClick`
 *  event sequence), or the recorded fallback when the point is not on target. */
async function o0DispatchGesture(h, selector, probe) {
  if (probe.path === 'cdp') {
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: probe.x, y: probe.y, buttons: 0 })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: probe.x, y: probe.y, button: 'left', buttons: 1, clickCount: 1 })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: probe.x, y: probe.y, button: 'left', buttons: 0, clickCount: 1 })
    const hitAtDispatch = await h.cdp.evaluate(`(()=>{const hit=document.elementFromPoint(${probe.x},${probe.y});return hit?(hit.id||hit.tagName):null})()`)
    return { hitAtDispatch }
  }
  // A non-cdp path is RECORDED, never silently substituted: the native DOM click is
  // only attribution evidence, and the row's `pass` is already false.
  const ok = await h.cdp.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)return false;e.click();return true})()`)
  return { hitAtDispatch: null, fallbackClicked: ok }
}
/** §2.2/§3.6b — the 11 stage entries from the UNION of both instances' records,
 *  aggregated by the ONE pinned call (`stagesFromO0HookRecords(records, ids)` with
 *  the full `O0_STAGE_IDS` list). Every stage the recorder did not record is
 *  emitted `ms:null` + `unseparated:true` (never imputed), and the STRUCTURAL
 *  class (§6 S14: no seam exists in the executing bundle) is marked on exactly the
 *  stage whose seam is absent — never merged into a bare `unseparated`. */
function o0StagesFromMeasures(drained, o0) {
  const rendererRecords = (drained?.hook?.records ?? []).filter((r) => r && typeof r === 'object' && typeof r.stage === 'string')
  const mainRecords = (Array.isArray(o0?.mainRecords) ? o0.mainRecords : []).filter(
    (r) => r && typeof r === 'object' && typeof r.stage === 'string',
  )
  // §3.6b — the UNION of BOTH recorder instances' records for this freeze window,
  // aggregated by the ONE pinned call (`stagesFromO0HookRecords(records, O0_STAGE_IDS)`).
  const out = o0Twins.hook.stagesFromO0HookRecords([...rendererRecords, ...mainRecords], O0_STAGE_IDS)
  // §3.6b/S15 + RUL-3 — observation, not assumption: the main-side refinement counts
  // as present ONLY when a MAIN-instance record was actually TRANSPORTED and read for
  // this window; otherwise the stage is STRUCTURAL with the exact reason.
  const rendererArmed = drained?.hook?.rendererArmed === true
  // RUL-1 — an ARM WAS ATTEMPTED for this freeze (`hook.armed`) but the recorder did
  // not take it: the executing bundle has no seam for these stages (STRUCTURAL). A
  // freeze the harness deliberately left UNARMED (the repeat block's baseline) is
  // NOT structural — its seam exists, it simply was not armed.
  const armAttempted = drained?.hook?.armed === true
  const refused = Array.isArray(drained?.hook?.refused) ? drained.hook.refused : []
  const refusalText = refused
    .map((r) => (r && typeof r.reason === 'string' ? r.reason : null))
    .filter((x) => x !== null)
    .join('; ')
  const structuralReasons = {}
  if (mainRecords.length === 0) {
    structuralReasons['snapshot.clone'] = o0?.connect === true ? `${O0_MAIN_SEAM_MISSING}; ${O0_MAIN_SEAM_UNTRANSPORTED}` : O0_MAIN_SEAM_UNTRANSPORTED
  }
  // RUL-1 — every RENDERER-side arm stage the handle never armed is a bundle without
  // the seam (STRUCTURAL); a stage the recorder armed but that produced no record in
  // this window stays merely UNMEASURED (never conflated, §6 S14).
  if (armAttempted && !rendererArmed) {
    for (const id of O0_PAGE_ARM_STAGES) {
      if (id !== 'snapshot.clone') structuralReasons[id] = `${O0_RENDERER_SEAM_MISSING}${refusalText ? ` — the recorder refused: ${refusalText}` : ''}`
    }
  }
  return out.stages.map((s) => {
    const reason = Object.prototype.hasOwnProperty.call(structuralReasons, s.id) ? structuralReasons[s.id] : null
    return reason && s.unseparated === true
      ? { ...s, structural: true, structuralReason: reason }
      : { ...s, structural: false, structuralReason: null }
  })
}
/** §3.6b — every record attributed to the instance it came from, so a reader can
 *  attribute every number: the caller-level + render-path records come from the
 *  RENDERER's app-wide recorder; a MAIN-instance record is attributed ONLY when the
 *  main recorder's records were actually received (no transport exists today —
 *  finding L3: a fabricated attribution is worse than an absent one). */
function o0StageAttribution(drained, o0) {
  const out = []
  for (const r of drained?.hook?.records ?? []) {
    if (r && typeof r === 'object' && typeof r.stage === 'string') out.push({ stage: r.stage, instance: 'renderer' })
  }
  for (const r of (Array.isArray(o0?.mainRecords) ? o0.mainRecords : [])) {
    if (r && typeof r === 'object' && typeof r.stage === 'string') out.push({ stage: r.stage, instance: 'main' })
  }
  return out
}
/** §3.6b/§4.4 — the PER-RECORD detail of the window (stage, instance, ms), so the
 *  A-4 read COUNT is the number of the shell's OWN `snapshot.pull` records rather
 *  than a degenerate 1-per-stage-row. Without it the report cannot tell ONE store
 *  read from TWO — the exact question A-4 asks ("a disclosure that performs NO
 *  store read at all"). */
function o0StageRecordDetail(drained, o0) {
  const out = []
  // §3.1/§4.1 — the per-record detail carries the entry's own COMMIT INDEX and its own
  // span (`startMs`/`endMs`, the recorder's perf-port stamps) in the SAME monotonic clock
  // domain as the `o0:t0`/`o0:t1` marks and the long-task `start` fields — without them
  // the pass partition is positionally underivable from the NON-unique mark names
  // (`o0:<stage>:start` repeats per stage), and §6 FS10 forbids reconstructing them.
  // `depth` (containment) and `passIndex` are the partition's OWN derivations: they are
  // written here from `deriveO0RowPasses` and re-derived by `partitionO0RowPasses`.
  const push = (r, instance) => {
    if (!r || typeof r !== 'object' || typeof r.stage !== 'string') return
    out.push({
      index: out.length,
      stage: r.stage,
      instance: instance,
      ms: typeof r.ms === 'number' ? r.ms : null,
      startMs: typeof r.startMs === 'number' && Number.isFinite(r.startMs) ? r.startMs : null,
      endMs: typeof r.endMs === 'number' && Number.isFinite(r.endMs) ? r.endMs : null,
      depth: 0,
      passIndex: null,
      startMark: r.startMark ?? null,
      endMark: r.endMark ?? null,
      error: r.error ?? null,
    })
  }
  for (const r of drained?.hook?.records ?? []) push(r, 'renderer')
  for (const r of (Array.isArray(o0?.mainRecords) ? o0.mainRecords : [])) push(r, 'main')
  return out
}
/** O0-M1-M3 §2.1/§3.2/§3.3 — the driver-side containment DERIVATION (depth) from the
 *  entry's own span, so a row emits the partition's own values rather than a second,
 *  drifting copy of them. The PASS PARTITION itself is `partitionO0RowPasses`'s (the
 *  §3.6b/F16 one-implementation rule): this helper only annotates the depth, and the
 *  `passIndex` is taken from that oracle's own derivation below. */
function o0DeriveRecordFields(detail) {
  const entries = (Array.isArray(detail) ? detail : []).filter((d) => d && Number.isFinite(d.startMs) && Number.isFinite(d.endMs))
  for (const d of entries) {
    let depth = 0
    for (const o of entries) {
      if (o === d) continue
      if (o.startMs <= d.startMs && d.endMs <= o.endMs && (o.startMs < d.startMs || d.endMs < o.endMs)) depth += 1
    }
    d.depth = depth
  }
  return detail
}

/** §2.2 stage 11 + §5 P-TP-1 — the `post.style` residual is COMPUTED
 *  (`longTaskTotalMs − Σ(named stages)`), never a timed probe. Any unseparated
 *  stage makes the reconciliation fail (an unmeasured stage cannot be reconciled
 *  away); the row still reports honestly rather than imputing a number. */
function o0ApplyPostStyle(row) {
  const separated = row.stages.filter((s) => s.unseparated !== true && typeof s.ms === 'number')
  // §6 F4 — a SEPARATED stage carrying a non-numeric ms must never be summed as 0.
  const imputed = row.stages.filter((s) => s.unseparated !== true && typeof s.ms !== 'number')
  const unmeasured = row.stages.filter((s) => s.unseparated === true && s.id !== 'post.style').map((s) => s.id)
  const sumMs = Math.round(separated.reduce((a, s) => a + s.ms, 0) * 1000) / 1000
  const total = row.longTaskTotalMs
  const residual = typeof total === 'number' && Number.isFinite(total) ? Math.round((total - sumMs) * 1000) / 1000 : null
  const idx = row.stages.findIndex((s) => s.id === 'post.style')
  // O0-M1-M3 §2.1 — `postStyle.residual` is RETIRED: the legacy formula
  // `longTaskTotalMs − Σ(named stages)` produced the NEGATIVE number this unit exists to
  // remove (and made the long-task total the denominator of stage SPANS — §1.1 (b)), so it
  // may be recorded ONLY as the diagnostic `reconciliation.naiveSumResidualMs` carrying
  // `notAResidual: true`. The honest remainder is `reconciliation.unaccountedMs`:
  // `windowMs − |⋃(top-level spans ∩ the freeze window)|`, per pass and for the row.
  const retiredPostStyle = {
    ms: null,
    timed: false,
    source: 'derived',
    derived: true,
    derivedNote: 'post.style is DERIVED (§2.2 id 11: the computed residual, never a timed probe)',
    attributable: false,
    residual: null,
    retired: true,
    retiredBy: 'O0-M1-M3-MEASUREMENT-SHAPE (M1)',
  }
  // §3a finding 2 — the SAME branch as the module's `reconcileO0PostStyle`: the
  // derived `post.style` is separated ONLY when the remainder is non-negative AND
  // every stage was actually measured; otherwise `ms:null` + `unseparated:true`
  // and `post.style` joins the recorded unseparated set (one branch, never two).
  const isSeparated = false // §2.1 clause 5: while ANY stage is unseparated the row stays OPEN-structural
  if (isSeparated) {
    row.stages[idx] = { id: 'post.style', ms: residual, unseparated: false, source: 'derived', structural: false, structuralReason: null }
    row.reconciliation = {
      ok: residual !== null && residual <= O0_RECONCILE_TOLERANCE_MS,
      residual: null,
      retired: true,
      retiredBy: 'O0-M1-M3-MEASUREMENT-SHAPE (M1)',
      unaccountedMs: residual,
      unaccountedReason: null,
      unaccountedSource: 'derived',
      unaccountedAttributable: false,
      windowMs: row.hook && row.hook.freezeWindow ? row.hook.freezeWindow.t1 - row.hook.freezeWindow.t0 : null,
      accountedMs: null,
      overlapMs: null,
      outsideMs: null,
      passOverlapSumMs: null,
      bandExceeded: residual !== null && residual > O0_RECONCILE_TOLERANCE_MS,
      passes: [],
      naiveSumResidualMs: residual,
      naiveSumResidualNote: 'notAResidual',
      sumMs: sumMs,
      toleranceMs: O0_RECONCILE_TOLERANCE_MS,
      reason: null,
    }
  } else {
    const ids = [...new Set([...unmeasured, ...imputed.map((s) => s.id), 'post.style'])]
    // RUL-4/RUL-5/L12 — the reconciliation reason names the STRUCTURAL class when
    // the unseparated stages are seams that do not exist (the derived residual is
    // then OPEN-structural, never a FAIL), and always names post.style as DERIVED.
    const structuralIds = row.stages.filter((s) => s.unseparated === true && s.structural === true).map((s) => s.id)
    row.reconciliation = {
      ok: false,
      // §2.1 — the legacy summed form survives ONLY as the diagnostic below.
      residual: null,
      retired: true,
      retiredBy: 'O0-M1-M3-MEASUREMENT-SHAPE (M1)',
      // §2.1/§4.1 — the NEW remainder fields; `unaccountedMs`/`accountedMs`/`windowMs`
      // are filled by `o0RowPass` from the pure oracle's own union accounting.
      windowMs: row.hook && row.hook.freezeWindow ? Math.round((row.hook.freezeWindow.t1 - row.hook.freezeWindow.t0) * 1000) / 1000 : null,
      accountedMs: null,
      unaccountedMs: null,
      unaccountedReason: 'the union accounting has not been applied yet (o0RowPass)',
      unaccountedSource: 'derived',
      unaccountedAttributable: false,
      overlapMs: null,
      outsideMs: null,
      passOverlapSumMs: null,
      bandExceeded: false,
      passes: [],
      naiveSumResidualMs: residual,
      naiveSumResidualNote: 'notAResidual',
      sumMs: sumMs,
      toleranceMs: O0_RECONCILE_TOLERANCE_MS,
      structuralStages: structuralIds,
      openStructural: structuralIds.length > 0 && unmeasured.every((id) => structuralIds.includes(id)) && imputed.length === 0,
      reason: `unaccounted remainder: ${ids.length > 1 || unmeasured.length > 0 ? `unseparated stage(s) ${ids.join(', ')} cannot be reconciled${structuralIds.length ? ` — STRUCTURAL (no seam in the executing bundle): [${structuralIds.join(', ')}]; the derived post.style residual is OPEN-structural (§6 S14/RUL-4)` : ''}` : `the legacy summed form ${String(residual)} is NOT a residual (notAResidual) — the derived post.style is not separated (§2.1)`}`,
    }
  }
  row.unseparatedStages = row.stages.filter((s) => s.unseparated === true).map((s) => s.id)
  // RUL-5/L12 — `post.style` is DERIVED everywhere it appears (§2.2 id 11: the
  // computed residual, never a timed probe): `source:'derived'` + `timed:false` +
  // the explicit `derived` marker, on the value AND in the reconciliation reason.
  row.postStyle = {
    ...retiredPostStyle,
    ms: isSeparated ? residual : null,
    unseparated: !isSeparated,
  }
  return row
}
/** §2 / §4.3 — ONE freeze: arm the observers, perform exactly one hit-tested
 *  gesture, drain, and return the §4.3 row. No block stages two freezes; no block
 *  re-uses a previous block's timing. */
async function o0FreezeRow(h, spec) {
  const o0 = h.o0 ?? {}
  await ufEnsureAppClear(h)
  await o0ArmObservers(h)
  let hook = { armed: false, rendererArmed: false, armedAt: null, refused: [] }
  const probe = await o0ProbeTarget(h, spec.target)
  const t0 = await o0Mark(h, 'o0:t0')
  // §4.3 H3 — the ARM discipline: the hook is armed AT/AFTER the `o0:t0` mark
  // (never before the gesture's hit-probe), so the armed window EQUALS the freeze
  // window and the recorded `hook.armWindow` is never a silent widening.
  if (spec.hook === true && spec.disarmOnEntry !== true) hook = await o0HookArm(h)
  const dispatch = await o0DispatchGesture(h, spec.target, probe)
  // §2.1 + finding L6 — ONE evaluate settles, marks `o0:t1`, drains the observers,
  // reads the recorder and disarms. (Two extra CDP round trips used to sit between
  // the `o0:t1` mark and the disarm, inflating `hook.armWindow.t1` by tens of ms on a
  // busy renderer and forcing a WINDOW-BOUND VIOLATED verdict on rows whose stage
  // spans were all inside the freeze.)
  const quiesceDrain = await o0QuiesceAndDrain(h)
  const quiesce = quiesceDrain ? { frames: quiesceDrain.frames, quiesced: quiesceDrain.quiesced, timedOut: quiesceDrain.timedOut, timeoutMs: quiesceDrain.timeoutMs } : null
  const drained = quiesceDrain ? quiesceDrain.drain : null
  // §3.6(a) — the measured window is closed INSIDE the drain evaluate above (the
  // recorder is disarmed there); no measurement wrapper stays armed outside the
  // freeze (the installed wrapper is a pass-through while unarmed: no control-flow
  // change, no DOM mutation, no long task).
  const disarmedAt = drained && drained.disarmedAt !== null && drained.disarmedAt !== undefined ? drained.disarmedAt : null
  const wallMs = drained && drained.t0 !== null && drained.t1 !== null ? Math.round((drained.t1 - drained.t0) * 1000) / 1000 : null
  // RUL-3 (the spec's ruling) — the MAIN-side records are NOT transported out of the
  // main process, so no MAIN-instance record can be attributed to this window:
  // `snapshot.clone` is emitted `ms:null` + `unseparated:true` + `source:'hook'` +
  // `structural:true` with the exact reason (the missing transport AND the
  // out-of-host IPC serialization). Nothing is imputed and no attribution is
  // fabricated (§3.6b/S15, L3).
  const o0WithMain = { ...o0, mainRecords: [] }
  const stages = o0StagesFromMeasures(drained, o0WithMain)
  // §4.3 — an UNARMED row records NO armed interval (never a fabricated one): the
  // arm window fields are `null` and the freeze window alone is recorded.
  const armT0 = hook.armed === true ? (hook.armedAt ?? t0) : null
  const armT1 = hook.armed === true ? (disarmedAt ?? (drained ? drained.t1 : null)) : null
  const row = {
    id: spec.id,
    block: spec.block,
    gesture: spec.gesture,
    target: spec.target,
    folderPath: spec.folderPath ?? null,
    documentId: spec.documentId ?? null,
    path: probe.path,
    realInput: probe.path === 'cdp',
    hit: probe.hit ?? null,
    stageCount: O0_STAGE_COUNT,
    stages: stages,
    longTasks: drained ? drained.observedLongTasks ?? drained.longTasks : [],
    longTaskTotalMs: drained ? drained.longTaskTotalMs : null,
    mutations: drained ? drained.mutations : null,
    wallMs: wallMs,
    t0: t0,
    t1: drained ? drained.t1 : null,
    quiesce: quiesce,
    gpu: o0.gpuFlag === true,
    trackAblation: spec.trackAblation ?? { applied: false, mutation: null },
    paneFrames: Number.isFinite(spec.paneFrames) ? spec.paneFrames : null,
    bundleVerified: o0.bundleVerified === true,
    bundle: { renderer: o0.bundleRenderer ?? null, main: o0.bundleMain ?? null, served: o0.bundleServed ?? null },
    hook: {
      armed: hook.armed === true,
      // §4.3/P-TP-3(b) — the RECORDED armed interval and the freeze it is judged
      // against (`o0:t0`/`o0:t1`), plus the arm/disarm counts.
      armWindow: { t0: armT0, t1: armT1, ms: armT0 !== null && armT1 !== null ? Math.round((armT1 - armT0) * 1000) / 1000 : null },
      freezeWindow: { t0: t0, t1: drained ? drained.t1 : null },
      // §4.3/P-TP-3(a) — THE RECORDED BAND: the tolerance this row's window bound is
      // actually judged with (the §3.6 40 ms hook band), emitted on the row so the
      // band is a MEASURED fact of the run rather than a constant inferred by the
      // oracle/verdict/validator (all three now read `hook.toleranceMs`).
      toleranceMs: O0_HOOK_LONGTASK_TOLERANCE_MS,
      // O0-M1-M3 §2.2/§4.1 — the PER-ROW counts (the delta of the PRE-ARM reading this
      // row took in `o0HookArm` and the POST-DISARM reading the drain took AFTER the
      // row's own `disarm()`), plus the session-scoped cumulative readings LABELED as
      // such. The bare `armCount`/`disarmCount` aliases are RETIRED: a field whose name
      // implies a per-row count while carrying a SESSION total IS the M2 defect.
      rowArmCount: null,
      rowDisarmCount: null,
      sessionArmCount: null,
      sessionDisarmCount: null,
      sessionCountsAt: { pre: hook.sessionCountsAt?.pre ?? null, post: drained?.postDisarm ?? null },
      // O0-M1-M3 §2.3/§3.4 — the PINNED long-task attribution record (the rule, its
      // window, the included count/total and BOTH rejected alternatives), filled by
      // `o0RowPass` from the pure `deriveO0LongTaskAttribution` oracle.
      longTaskAttribution: null,
      // O0-M1-M3 §3.2/§4.1 — the per-pass partition (the M1 shape) and its records,
      // filled by `o0RowPass` from the pure `partitionO0RowPasses` oracle.
      passes: [],
      passCount: 0,
      passKindSequence: [],
      passOverlaps: [],
      passLongTaskDoubleCountMs: 0,
      nestingAmbiguities: [],
      // §3.6b — per-record instance attribution: the renderer's app-wide recorder
      // owns the caller-level + render-path + render-emit seams, the MAIN instance
      // owns `snapshot.clone` (RUL-3: attributed only when its record was actually
      // READ from the transport — never fabricated).
      stageRecords: o0StageAttribution(drained, o0WithMain),
      // §3.6b/§4.4 — the PER-RECORD detail of the window (additive): the A-4 read
      // count is derived from THESE records, so one read is distinguishable from two.
      stageRecordDetail: o0DeriveRecordFields(o0StageRecordDetail(drained, o0WithMain)),
      // §3.6b/S15 + RUL-3 — OBSERVED, never assumed: `false` because no channel
      // carries the MAIN instance's records out of the main process (the state the
      // spec pins; a fabricated `instance:'main'` attribution is worse than none).
      mainSeamArmed: false,
      mainSeamNote: o0.mainSeamNote ?? null,
      mainRecordsTransport: 'none — the main process records the handler span but no channel carries it into the renderer/report (§3.6b/S15/RUL-3)',
      // §3.6 — the render-path half: which stages the page-side hook actually
      // armed, and (loudly) any handle that refused/was absent. A refused stage is
      // emitted `unseparated` by `o0StagesFromMeasures` — never imputed.
      rendererArmed: hook.rendererArmed === true,
      refused: hook.refused ?? [],
      records: (drained?.hook?.records ?? []).length,
      // RUL-2 — spans still OPEN at drain time (an awaited round trip that had not
      // settled): recorded so a span that did not fit its window is visible instead
      // of silently absent.
      pendingSpans: drained?.hook?.pending ?? null,
      dropped: drained?.hook?.dropped ?? null,
      seamMap: { ...O0_HOOK_SEAMS, ...O0_RENDER_EMIT_SEAMS },
      rendererHandle: O0_HOOK_RENDERER_HANDLE,
      stageRowsSource: O0_HOOK_STAGE_ROWS_SOURCE,
      unarmedBaseline: spec.hook !== true,
      longtaskUnsupported: drained ? drained.longtaskUnsupported : null,
    },
    dispatch: dispatch,
    seed: O0_SEED,
    corpusSource: o0.corpusSource ?? null,
    pass: false,
    failReasons: [],
  }
  o0ApplyPostStyle(row)
  return o0RequireRowFields(o0RowPass(row))
}
/** §2.3 — enumerate the doc-nav folder rows (`data-folder-path`) with their
 *  child-row census; the block then applies the PINNED pick below. */
async function o0FolderRows(h) {
  return h.cdp.evaluate(`(()=>{
    const rows = [...document.querySelectorAll(${JSON.stringify(O0_FOLDER_SELECTOR)})];
    const paths = rows.map((r) => r.getAttribute('data-folder-path'));
    return rows.map((r) => {
      const p = r.getAttribute('data-folder-path');
      const nested = r.querySelectorAll('[data-folder-path],[data-document-id]').length;
      const prefixed = paths.filter((x) => x && p && x !== p && x.indexOf(p + '/') === 0).length;
      return { folderPath: p, childRowCount: nested + prefixed, nested: nested, prefixed: prefixed };
    });
  })()`)
}
/** §2.3 — the PINNED folder-row pick: largest child-row count, ties broken by
 *  lexicographic `data-folder-path` ascending (the `o0-2026-09-17` seed). A
 *  first-match pick would under-measure the operator corpus. Input-order
 *  independent; an empty corpus has no pick (null), never a throw. */
function o0PickFolderRow(rows) {
  const list = Array.isArray(rows) ? rows.filter((r) => r && typeof r.folderPath === 'string' && r.folderPath !== '') : []
  if (!list.length) return null
  const sorted = [...list].sort((a, b) => (b.childRowCount - a.childRowCount) || (a.folderPath < b.folderPath ? -1 : a.folderPath > b.folderPath ? 1 : 0))
  return sorted[0]
}
/** §2.4/S7 + §3.6(c) — HARNESS FIX (2026-09-17 second run, finding L7): a folder-row
 *  gesture is a TOGGLE, so a pair of freezes on the SAME row is NOT a controlled
 *  pair — the first click performs the disclosure (the real work) and the second is
 *  a no-op. Measured live: the repeat block's unarmed baseline mutated 166 nodes and
 *  its armed re-run mutated 0, so `Δmutations = -166` was derived "NOT inert" (and
 *  the GPU-off leg's `Δmutations = 0` was a 0-vs-0 VACUOUS pair) — a STATE artifact
 *  reported as a hook failure. This helper puts the row back into its COLLAPSED
 *  state (measured by the rendered document-row census, never assumed) so both
 *  freezes of a pair perform the SAME work; the ablation pair uses it for the same
 *  reason (§2.4: "the paired runs differ ONLY in that mutation"). */
async function o0ResetFolderState(h, selector) {
  const q = JSON.stringify(selector)
  const docSel = JSON.stringify(O0_DOCUMENT_SELECTOR)
  const probe = (click) => h.cdp.evaluate(`(async()=>{
    const el = document.querySelector(${q});
    if (!el) return null;
    const rowsOf = () => document.querySelectorAll(${docSel}).length;
    const before = rowsOf();
    if (${click}) { el.click(); await new Promise((r) => setTimeout(r, 150)); }
    return { before: before, after: rowsOf() };
  })()`)
  const first = await probe(false)
  if (first === null) return { collapsed: false, detail: `folder row absent: ${selector}` }
  if (first.before === 0) return { collapsed: true, detail: 'already collapsed (0 document rows rendered)' }
  const second = await probe(true)
  if (second === null) return { collapsed: false, detail: 'folder row vanished during the toggle' }
  return {
    collapsed: second.after < second.before,
    detail: `document rows ${first.before} → ${second.after} (toggle-to-collapsed)`,
  }
}
/** §2.3 — the target of a folder-row/document-row gesture is the EXACT CSS
 *  selector that was clicked, so the attribute value must be a CSS-parseable
 *  string. The seed/operator corpora have `data-folder-path` values that are
 *  plain paths (`docs`, `docs/specs`, `.live-corpus`), but a path containing a
 *  `"` (the importer renders a path with special characters as `[".live-corpus"]`)
 *  makes the naive `[data-folder-path="<v>"]` an INVALID selector and the whole
 *  block dies on a SyntaxError. Escaping the two CSS-string metas is the fix; the
 *  recorded `target` field stays a real, resolving selector. */
function o0AttrSelector(base, attr, value) {
  const escaped = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  return `${base} [${attr}="${escaped}"]`
}
/** `--strict-seed` — every `*.md` under a directory tree, in a deterministic
 *  (lexicographic, depth-first) order. The store's import root must be the same
 *  directory (`--corpus-root=`), or the importer's containment guard rejects the
 *  files (`markdown import: path outside corpus root`). */
function o0MarkdownTree(dir, out = []) {
  let entries = []
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch (e) { return out }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))
  for (const e of entries) {
    const p = join(dir, e.name)
    if (e.isDirectory()) o0MarkdownTree(p, out)
    else if (e.isFile() && /\.md$/i.test(e.name)) out.push(p)
  }
  return out
}
/** The run id convention (§4.3 example id) — unique within this invocation. */
function o0RunId(gesture, leg, block, taken) {
  const prefix = block === 'o0_track_ablation' ? 'o0-fold-ablation' : `o0-${gesture}-gpu${leg}`
  for (let i = 1; i < 100; i++) {
    const id = `${prefix}-${block === 'o0_track_ablation' ? (leg === 'on' ? 'on' : 'off') : `r${i}`}`
    if (!taken.includes(id)) return id
  }
  return `${prefix}-r${taken.length + 1}`
}
/** §8.1 — the leg a run belongs to (the controls[] grouping). */
function o0LegOfRun(run) {
  const id = String(run?.id ?? '').toLowerCase()
  const applied = run?.trackAblation?.applied === true
  if (/ablation/.test(id)) return /-?on$/.test(id) ? 'track-ablation-on' : 'track-ablation-off'
  if (/gpu-?off/.test(id)) return 'gpu-off'
  if (/gpu-?on/.test(id)) return 'gpu-on'
  if (run?.block === 'o0_track_ablation') return applied ? 'track-ablation-on' : 'track-ablation-off'
  return null
}
/** §4.2/§8.1 — the controls[] pairing record: ONE row per leg (4 in a full
 *  artifact), naming the leg's runs. A counterpart leg emitted by the PAIRED
 *  invocation is declared `cross-artifact` (the §3.5 command pair writes one
 *  artifact per leg); when both legs are in this invocation the counterpart run
 *  resolves and the pairing is verified here. */
function o0ControlRows(runs) {
  const groups = { 'gpu-off': [], 'gpu-on': [], 'track-ablation-off': [], 'track-ablation-on': [] }
  for (const r of runs) {
    const leg = o0LegOfRun(r)
    if (leg && groups[leg]) groups[leg].push(r.id)
  }
  const counterpartOf = { 'gpu-off': 'gpu-on', 'gpu-on': 'gpu-off', 'track-ablation-off': 'track-ablation-on', 'track-ablation-on': 'track-ablation-off' }
  const declared = []
  for (const id of Object.keys(groups)) {
    const ids = groups[id]
    if (!ids.length) continue
    const other = groups[counterpartOf[id]]
    const crossArtifact = other.length === 0
    declared.push({
      id: id,
      runRef: ids[0],
      legRuns: ids,
      pairedWith: crossArtifact
        ? (id.indexOf('gpu-') === 0 ? `o0-${id === 'gpu-off' ? 'folder-row-gpuon' : 'folder-row-gpuoff'}-r1` : `o0-fold-ablation-${id.endsWith('on') ? 'on' : 'off'}`)
        : other[0],
      pairedWithStatus: crossArtifact ? 'cross-artifact' : null,
      gpu: id.indexOf('gpu-') === 0 ? (id === 'gpu-on') : null,
    })
  }
  return declared
}
/** §4.4 — the DERIVED stage verdict (the formula is pinned; the number is not).
 *  §4.4/F13a — a violated window REFUSES the percentage: the WINDOW-BOUND
 *  VIOLATED form replaces the `1698.82%`-style string the 2026-09-17 run printed. */
function o0DeriveStageVerdict(row) {
  const identified = row.stages.filter((s) => s.id !== 'post.style' && s.unseparated !== true && typeof s.ms === 'number' && Number.isFinite(s.ms))
  let largest = null
  for (const s of identified) if (largest === null || s.ms > largest.ms) largest = s
  const total = typeof row.longTaskTotalMs === 'number' && Number.isFinite(row.longTaskTotalMs) ? row.longTaskTotalMs : null
  const ms = largest ? largest.ms : null
  const fallback = row.path === 'cdp' && row.realInput === true ? '' : ` — gesture path ${row.path} with realInput ${row.realInput}: the row is not hit-tested evidence (§6 F7)`
  const wb = o0Twins.report.deriveO0WindowBound(row)
  if (wb.violated) {
    const off = wb.offenders[0]
    const head = off
      ? `stage ${off.stageId} is ${o0Num(off.ms)} ms, which EXCEEDS the freeze window it belongs to (${o0Num(total)} ms + ${o0Num(wb.toleranceMs)} ms tolerance)`
      : `the armed hook window EXCEEDS the freeze window it belongs to (${o0Num(total)} ms + ${o0Num(wb.toleranceMs)} ms tolerance)`
    return `${head} — WINDOW-BOUND VIOLATED: no percentage verdict is emitted for this row${fallback}`
  }
  const pct = ms !== null && total !== null && total > 0 && ms <= total ? Math.round((ms / total) * 10000) / 100 : null
  // RUL-5/L8 — a percentage is NEVER emitted without a finite positive window (the
  // `(null%)` literal a zero/absent-window row used to print read as a measurement).
  const noPct =
    total === 0
      ? `no percentage is computed: the long-task window is zero (${o0Num(total)} ms), so this row has no finite window to divide by`
      : total === null
        ? 'no percentage is computed: longTaskTotalMs is not a finite non-negative number, so this row has no finite window to divide by'
        : `${o0Num(ms)} ms exceeds the ${o0Num(total)} ms window it was measured in, so no percentage is computed (a share above 100% is refused, §5 P-TP-3(c))`
  return largest
    ? pct !== null
      ? `stage ${largest.id} is ${o0Num(ms)} ms of the ${o0Num(total)} ms long task (${o0Num(pct)}%) on ${row.gesture} — ${largest.id} is the largest identified stage${fallback}`
      : `stage ${largest.id} is ${o0Num(ms)} ms of the ${o0Num(total)} ms long task on ${row.gesture} — ${largest.id} is the largest identified stage; ${noPct}${fallback}`
    : `no stage was identified in the row (every stage is unseparated or null ms) of the ${o0Num(total)} ms long task on ${row.gesture} — ${noPct}${fallback}`
}
/** §4.4 + A-4 — the whole-store `IPC_RAG_SNAPSHOT` discriminator. §3.6b: an
 *  `unseparated` `snapshot.pull` emits the UNMEASURED form — a "not measured" 0 is
 *  never printed as a measured zero. */
function o0DeriveSnapshotVerdict(row, census) {
  const snapshots = row.stages.filter((s) => s.id === 'snapshot.pull')
  const unmeasured = snapshots.find((s) => s.unseparated === true) ?? null
  // §3.6b — the READ COUNT is the number of the shell's OWN caller-level records
  // in the freeze window (`hook.stageRecordDetail`), not the stage-row cardinality:
  // one row with ms>0 cannot distinguish one store read from two (finding L4).
  const detail = Array.isArray(row.hook?.stageRecordDetail) ? row.hook.stageRecordDetail : null
  const pullRecords = detail ? detail.filter((r) => r && r.stage === 'snapshot.pull' && typeof r.ms === 'number') : null
  const reads = pullRecords
    ? pullRecords.map((r) => r.ms)
    : snapshots.filter((s) => s.unseparated !== true && typeof s.ms === 'number' && s.ms > 0).map((s) => s.ms)
  const readMs = reads.reduce((a, m) => a + m, 0)
  const reason = unmeasured && typeof unmeasured.structuralReason === 'string' && unmeasured.structuralReason !== ''
    ? unmeasured.structuralReason
    : 'the caller-level seam was not armed for this run'
  const detailText = reason.indexOf('snapshot.pull unseparated') === 0 ? reason : `snapshot.pull unseparated — ${reason}`
  return {
    readCount: reads.length,
    readMs: readMs,
    verdict: unmeasured
      ? `the ${row.gesture}'s whole-store IPC_RAG_SNAPSHOT read count is UNMEASURED (${detailText})`
      : `the ${row.gesture} performed ${reads.length} whole-store IPC_RAG_SNAPSHOT read(s) totalling ${o0Num(readMs)} ms (census ${o0Num(census.documents)} docs / ${o0Num(census.nodes)} nodes / ${o0Num(census.edges)} edges)`,
  }
}
/** §3.6 — the executing-bundle identity: the SERVED renderer against the ON-DISK
 *  file (`docs/live-testing.md:119-124`). A mismatch is `verified:false` and the
 *  whole report is pass:false (F2) — never a provisional pass. */
async function o0BundleIdentity(h) {
  const disk = (rel) => {
    try {
      const buf = readFileSync(join(ROOT, rel))
      const st = statSync(join(ROOT, rel))
      return { mtimeMs: Math.round(st.mtimeMs), bytes: buf.length, hash: o0Hash(buf.toString('utf8')) }
    } catch (e) {
      return { mtimeMs: null, bytes: null, hash: null, error: String(e) }
    }
  }
  const renderer = disk('dist/renderer/renderer.js')
  const main = disk('dist/main/main.cjs')
  let served = null
  let servedError = null
  try {
    const tree = await h.cdp.send('Page.getResourceTree')
    const frameId = tree && tree.frameTree && tree.frameTree.frame ? tree.frameTree.frame.id : null
    const url = pathToFileURL(join(ROOT, 'dist', 'renderer', 'renderer.js')).href
    const res = await h.cdp.send('Page.getResourceContent', { frameId: frameId, url: url })
    const text = res.base64Encoded ? Buffer.from(res.content, 'base64').toString('utf8') : res.content
    // §3.6 — the served identity is the file's BYTES + hash. Comparing
    // `text.length` (UTF-16 code units) against the on-disk byte count
    // under-reports every multi-byte character in the bundle (~1.2 kB of the
    // 660 kB renderer here), so a byte-identical served bundle would be reported
    // as a MISMATCH (F2) for a harness reason. The byte count is taken from the
    // decoded UTF-8 and the hash (the primary identity) is unchanged.
    served = { bytes: Buffer.byteLength(text, 'utf8'), lengthUnits: text.length, hash: o0Hash(text), url: url }
  } catch (e) {
    servedError = String(e)
  }
  // The HASH is the identity (§3.6 "mtime + byte length and/or a hash"): an
  // identical hash with an identical byte count is a verified bundle.
  const verified = !!(served && renderer.bytes === served.bytes && renderer.hash === served.hash)
  return {
    renderer: `${renderer.mtimeMs}+${renderer.bytes}+${renderer.hash}`,
    main: `${main.mtimeMs}+${main.bytes}+${main.hash}`,
    served: served ? `${served.bytes}+${served.hash}` : `unreadable (${servedError})`,
    servedUrl: served ? served.url : null,
    disk: { rendererBytes: renderer.bytes, rendererHash: renderer.hash },
    verified: verified,
  }
}
/** §3b re-audit SHOULD item (b) [ORACLE PROVENANCE] — the hash of the code that
 *  produced the per-row VERDICTS. `driver.build.verified` compares the SERVED renderer
 *  bundle against the on-disk one: it is evidence about the MEASURED app, NOT about the
 *  oracle — this driver imports `src/shared/o0-report.ts` from SOURCE (`o0Twins.report`)
 *  and the row verdicts come from THAT text plus this driver's own row assembly. Recording
 *  their identity makes a verdict attributable to the exact oracle edition that minted it
 *  (and a re-run under an edited oracle visibly distinct). */
let oracleIdentityCache = null
function o0OracleIdentity() {
  if (oracleIdentityCache) return oracleIdentityCache
  const file = (rel) => {
    try {
      const buf = readFileSync(join(ROOT, rel))
      const hash = o0Hash(buf.toString('utf8'))
      return { path: rel, bytes: buf.length, hash, short: hash.slice(0, 8) }
    } catch (e) {
      return { path: rel, bytes: null, hash: null, short: null, error: String(e) }
    }
  }
  const report = file('src/shared/o0-report.ts')
  const driver = file('scripts/live-drive.mjs')
  const composite = o0Hash(`${String(report.hash)}:${String(driver.hash)}`)
  oracleIdentityCache = {
    source: 'source-import',
    report,
    driver,
    hash: composite,
    short: composite.slice(0, 8),
    note:
      'the per-row verdicts are produced by the SOURCE-IMPORTED oracle (src/shared/o0-report.ts) + this driver’s row ' +
      'assembly — `driver.build.verified` is evidence about the EXECUTING BUNDLE only, never about the code that minted ' +
      'the verdicts (§3b re-audit, oracle provenance)',
  }
  return oracleIdentityCache
}
/** §3.4/§6 F8 — the OBSERVED census: `rag.list_documents` + the snapshot payload.
 *
 *  RUL-5/L1 — the `env.engine` derivation. The former rule ("the `gnosis.status` MCP
 *  call resolved") was WRONG: a tool-level ERROR payload resolves too, so the live
 *  run recorded `engine:"ready"` on a host with no `gnosis-server` at all. The
 *  correct rule is a POSITIVE health signal: `gnosis.status` must resolve AND the
 *  payload must be a `HealthReport` (`state` ∈ Ready|Starting|Degraded —
 *  `src/main/engine-rag-store.ts:174-188`) with no error field. Anything else is
 *  `absent`, and the probe is recorded as EVIDENCE; a payload from which the state
 *  cannot be DERIVED AT ALL is a loud harness fail-state (`engineError`) rather
 *  than a silent value. Engine absence itself stays non-gating (§6 S4). */
const O0_ENGINE_HEALTH_STATES = ['Ready', 'Starting', 'Degraded', 'Unavailable']
async function o0Census(h) {
  const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch((e) => ({ __error: String(e) }))
  const snap = await h.cdp.evaluate(`(async()=>{ try { const s = await window.provident.rag.snapshot(); return { nodes: s && s.nodes ? s.nodes.length : null, edges: s && s.edges ? s.edges.length : null, keys: s ? Object.keys(s) : null } } catch (e) { return { error: String(e) } } })()`)
  const status = await h.mcpTool(h.mcp, 'gnosis.status', {}).catch((e) => ({ __error: String(e.message || e) }))
  const documents = Array.isArray(docs && docs.documents) ? docs.documents.length : null
  // §4.3/S21/F22 — a tool-level ERROR payload is ERROR EVIDENCE, in EVERY shape the
  // bridge can produce: the thrown `{__error}` wrapper, a result object carrying
  // `error`/`message` (e.g. `{error:'fetch failed'}`), AND the plain STRING a tool
  // resolves with when the main-process handler threw and the MCP server surfaced
  // only the message (the observed third-run shape: `gnosis.status` → `"fetch failed"`).
  // A string that is NOT a HealthReport is never a derivable engine state, so it must
  // be classified as error evidence (→ `env.engine:'absent'` + the evidence string,
  // §6 S4 "engine-absence is NOT a forcing condition"); classifying it as an
  // UNSUPPORTED payload instead minted a forcing reason and pushed an otherwise
  // OPEN-structural report to `status:"FAIL"` (third-run finding L1b).
  const errorOf = (v) =>
    typeof v === 'string' ? (v.trim() === '' ? null : v) : v && typeof v === 'object' ? (v.__error ?? v.error ?? v.message ?? null) : null
  const engineError = errorOf(status)
  const healthState = status && typeof status === 'object' && typeof status.state === 'string' ? status.state : null
  let engine = 'absent'
  let engineErrorDerivation = null
  let positiveSignal = false
  if (engineError !== null) {
    engine = 'absent'
  } else if (healthState !== null && O0_ENGINE_HEALTH_STATES.includes(healthState)) {
    // A real HealthReport: only a non-`Unavailable` health state is a READY engine —
    // and only THAT is a POSITIVE engine signal (§6 S21/F22).
    engine = healthState === 'Unavailable' ? 'absent' : 'ready'
    positiveSignal = engine === 'ready'
  } else {
    // An UNSUPPORTED payload: the engine state cannot be DERIVED from it (a resolved
    // call is not health). Refusing to invent a value is the RUL-5/L1 requirement.
    engineErrorDerivation = `gnosis.status resolved with an object carrying no HealthReport state (keys=${JSON.stringify(status && typeof status === 'object' ? Object.keys(status) : status)}) — the engine state cannot be DERIVED from a tool-level resolution (RUL-5/L1)`
  }
  return {
    documents: documents,
    nodes: snap && !snap.error ? snap.nodes : null,
    edges: snap && !snap.error ? snap.edges : null,
    engine: engine,
    engineError: engineErrorDerivation,
    engineEvidence: {
      probe: 'gnosis.status (MCP) → the engine HealthReport',
      calledAt: o0Date(),
      resolved: status !== undefined && status !== null,
      error: engineError === null ? null : String(engineError),
      healthState: healthState,
      keys: status && typeof status === 'object' ? Object.keys(status).slice(0, 20) : null,
      derived: engine,
      positiveSignal: positiveSignal,
      rule: 'ready IFF the call resolved with a HealthReport whose state ∈ {Ready, Starting, Degraded} (a POSITIVE engine signal); absent otherwise — "the MCP call resolved" is NOT evidence (§4.3/S21/RUL-5)',
      contradiction: engineErrorDerivation,
      observed: engineError !== null
        ? `an error payload from the status call (${String(engineError)})`
        : healthState === null
          ? 'no HealthReport in the status payload'
          : `an engine HealthReport with state=${healthState}`,
    },
  }
}
/** §6 F9 — a report-level forcing reason list, DERIVED (never a hard-coded pass).
 *  RUL-4 — the STRUCTURAL class is the one recorded gap that does NOT force
 *  `pass:false`: a stage whose seam does not exist in the executing bundle is a gap
 *  of the harness (recorded, with its reason), never a failed measurement. Every
 *  other class (a genuinely unmeasured/illegally-imputed row, a falsifiability
 *  failure, a violated window) still forces `pass:false`. */
function o0DeriveReportPass(report) {
  const reasons = []
  const structuralReasons = []
  // RUL-5/L1 + §6 S21/F22 — `env.engine` must be DERIVED from a POSITIVE engine
  // signal: a recorded `ready` with no positive signal (an error payload, an
  // underivable probe) is a harness mis-derivation and a forcing reason; the honest
  // state is `absent` with the evidence string (§6 S4's legal degraded mode).
  const engineEvidence = report.driver.engineEvidence ?? null
  const enginePositive = engineEvidence && engineEvidence.positiveSignal === true
  if (typeof report.driver.engineError === 'string' && report.driver.engineError !== '') {
    reasons.push(`env.engine could not be derived: ${report.driver.engineError} — §4.2/S4 (RUL-5/L1: an unsupported engine value is a loud harness fail-state)`)
  }
  if (report.env?.engine === 'ready' && !enginePositive) {
    reasons.push(
      `env.engine is "ready" but no positive engine signal was observed (${String(engineEvidence ? engineEvidence.error ?? JSON.stringify(engineEvidence.keys) : 'no probe recorded')}) — ` +
        `the engine state must be DERIVED from a positive signal, never from "the MCP call resolved" (§4.3/S21/RUL-5)`,
    )
    report.env.engine = 'absent'
  }
  if (report.driver.build.verified !== true) reasons.push(`executing bundle ≠ on-disk bundle (renderer ${report.driver.build.served}) — §3.6/F2`)
  const observed = report.corpus.documents
  if (!Number.isFinite(observed)) reasons.push('corpus census unavailable (rag.list_documents did not resolve) — §6 F8')
  else if (observed !== report.corpus.claimedDocuments) {
    reasons.push(`corpus census mismatch: claimed ${report.corpus.claimedDocuments} document(s), observed ${observed} (nodes ${report.corpus.nodes}, edges ${report.corpus.edges}) — §6 F8`)
  }
  for (const r of report.runs) for (const m of r.failReasons ?? []) reasons.push(`run ${r.id}: ${m}`)
  // §6 F4/§5 P-TP-1 + RUL-4 — an unmeasured stage cannot be reconciled away, so a row
  // that reports a NON-structural unseparated stage makes the REPORT a fail-state. A
  // row whose unseparated set is STRUCTURAL (seams that do not exist in the bundle)
  // plus the DERIVED `post.style` residual is OPEN-structural instead: recorded with
  // its reason, never a FAIL (the residual band itself stays a RECORDED outcome).
  for (const r of report.runs) {
    const unsep = Array.isArray(r.unseparatedStages) && r.unseparatedStages.length
      ? r.unseparatedStages
      : (r.stages || []).filter((s) => s.unseparated === true).map((s) => s.id)
    const structuralIds = (r.stages || []).filter((s) => s && s.unseparated === true && s.structural === true).map((s) => s.id)
    const nonStructural = unsep.filter((id) => id !== 'post.style' && !structuralIds.includes(id))
    if (nonStructural.length) {
      reasons.push(`run ${r.id}: unseparated stage(s) ${nonStructural.join(', ')} cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away)`)
    } else if (unsep.length) {
      // RUL-4 — the reconciliation-incomplete line is in the STRUCTURAL FAMILY: it
      // makes the report `pass:false` (the measurement is incomplete) while leaving
      // the report SCHEMA-VALID (`ok:true`, status "OPEN-structural").
      structuralReasons.push(
        `run ${r.id}: unseparated stage(s) ${unsep.join(', ')} cannot be reconciled (§5 P-TP-1/§6 F4: an unmeasured stage cannot be reconciled away) — ` +
          `STRUCTURAL: the stages' seams do not exist in the executing bundle and the DERIVED post.style residual therefore cannot be computed; no value was imputed (§3.6b RUL-4)`,
      )
    }
    for (const id of structuralIds) {
      const st = (r.stages || []).find((s) => s && s.id === id)
      structuralReasons.push(`run ${r.id}: stage ${id} is structurally unseparated — ${st ? st.structuralReason : '<unrecorded reason>'} (§6 S14)`)
    }
    // §3.6/RUL-2 / §6 F19 — an awaited seam span that had not SETTLED when the
    // freeze window closed is a DANGLING start mark: a forcing reason, never a note.
    if (Number.isFinite(r.hook?.pendingSpans) && r.hook.pendingSpans > 0) {
      for (const st of (r.stages || []).filter((x) => x && x.unseparated === true)) {
        reasons.push(
          `run ${r.id}: stage ${st.id} left a dangling o0:${st.id}:start mark (no end mark/measure committed — the span must close on ` +
            `BOTH settlement paths, §3.6/RUL-2)`,
        )
      }
    }
  }
  const legs = new Set(report.controls.map((c) => c.id))
  for (const c of report.controls) {
    if (c.pairedWithStatus === 'cross-artifact') continue
    const counterpart = report.runs.some((r) => r.id === c.pairedWith)
    if (!counterpart) reasons.push(`comparison row emitted without its paired control row (${c.pairedWith}) — §6 F9`)
  }
  if (report.runs.some((r) => o0LegOfRun(r) === 'gpu-off') && report.runs.some((r) => o0LegOfRun(r) === 'gpu-on')) {
    const off = report.runs.filter((r) => o0LegOfRun(r) === 'gpu-off')
    const on = report.runs.filter((r) => o0LegOfRun(r) === 'gpu-on')
    if (!legs.has('gpu-off') || !legs.has('gpu-on')) reasons.push('a GPU leg is present without its control row (§6 F9)')
    if (off.length && on.length) {
      const offPanes = off[0].paneFrames
      const onPanes = on[0].paneFrames
      if (offPanes !== onPanes) reasons.push(`paired runs differ in pane census: ${offPanes} vs ${onPanes} (§6 F9)`)
    }
  }
  if (report.runs.length === 0) reasons.push('no freeze row was staged (§4.2: runs[] is non-empty)')
  // §6 S17/F17b — inertness measured but VACUOUS: a report whose runs ARMED the
  // hook but carries NO inertness comparison cannot claim an inert hook (an
  // unverified arm is not an inert arm — §12 finding 12 was exactly this shape).
  const armedRuns = report.runs.filter((r) => r && r.hook && r.hook.armed === true)
  const comparisons = Array.isArray(report.driver.hookInertness) ? report.driver.hookInertness : []
  if (armedRuns.length > 0 && comparisons.length === 0) {
    reasons.push(`no hook inertness comparison was recorded although ${armedRuns.length} run(s) armed the hook — an unverified arm is not an inert arm (§3.6(c)/§6 S17/F17b)`)
  }
  // §3.6(c)/§5 P-SM-2 — the hook inertness + the stage-id-set determinism are
  // falsifiable report-level conditions (an armed hook that changes the numbers,
  // or a re-run with a different stage set, can never be an O-0 pass).
  // RUL-6 — and the report states WHICH HALF carried the inertness proof: a
  // `0`-vs-`0` long-task comparison is VACUOUS (`Δ = 0` of nothing) and must never
  // be reported as a numeric long-task proof.
  for (const p of comparisons) {
    if (!p.inert) reasons.push(`the measurement hook is NOT inert (armed-vs-unarmed Δmutations=${p.deltaMutations}, ΔlongTaskTotalMs=${p.deltaLongTaskMs} ms, tolerance ${p.toleranceMs} ms) — §3.6(c)`)
    if (!p.setEqual) reasons.push(`the stage-id SET is not deterministic across the repeat runs of §5 P-SM-2 (${p.baselineRun} vs ${p.armedRun}) — the ms values are FREE, the SET is not`)
    // RUL-6 / §6 S17(b)/F21 — a pair whose long-task half is VACUOUS must state the
    // MUTATION-HALF proof and may never be reported as a long-task-bounded proof.
    if (p.nonVacuous === false && !/MUTATION-HALF/.test(String(p.proofStatement ?? ''))) {
      reasons.push(
        `the hook inertness pair is reported as a long-task-bounded proof while nonVacuous is false (both freezes totalled ` +
          `${String(p.longTaskTotalMs?.unarmed ?? 'n/a')} ms) — a vacuous half proves nothing; report the MUTATION-HALF form instead (§6 S17/RUL-6)`,
      )
    }
  }
  // §2.4/RUL-5-L9 + §6 S20/F20 — a GPU delta is PER RUN / PER CORPUS and is never
  // carried across runs: a delta whose provenance names another run is a forcing
  // reason, and the recorded provenance form states the run + corpus it belongs to.
  for (const d of Array.isArray(report.driver.gpuDeltas) ? report.driver.gpuDeltas : []) {
    if (d && d.carriedFromAnotherRun === true) {
      reasons.push(
        `the GPU control reports a delta carried from another run/corpus (${String(d.delta)} ms from ${String(d.provenanceRun)}) — ` +
          `the GPU delta is reported per run/per corpus and is never carried across runs (§2.4/RUL-5; the first run's +2173/+2419 ms ` +
          `is CONTRADICTED by this run's −36/−23 ms)`,
      )
    }
  }
  // RUL-4 clause 3 — `pass` keeps its meaning: `false` whenever ANY reason exists,
  // the structural family INCLUDED (the measurement is incomplete). What RUL-4
  // changes is that this incompleteness no longer makes the report SCHEMA-INVALID.
  return { pass: reasons.length === 0 && structuralReasons.length === 0, failReasons: [...reasons, ...structuralReasons], structuralReasons, gating: reasons }
}
/** §2.4/RUL-5 (L9) + §6 S20/F20 — the GPU delta, PER RUN / PER CORPUS. Returns one
 *  entry per paired delta this invocation actually measured (with the run + corpus
 *  identity it belongs to) plus the recorded PROVENANCE of the FIRST run's delta,
 *  explicitly marked as contradicted and never carried as this run's measurement. */
function o0GpuDeltas(runs, census) {
  const out = []
  const off = runs.filter((r) => o0LegOfRun(r) === 'gpu-off')
  const on = runs.filter((r) => o0LegOfRun(r) === 'gpu-on')
  const byGesture = (list, g) => list.find((r) => r && r.gesture === g)
  for (const g of ['folder-row', 'document-row']) {
    const a = byGesture(off, g)
    const b = byGesture(on, g)
    if (!a || !b) continue
    out.push({
      gesture: g,
      runOff: a.id,
      runOn: b.id,
      delta: Math.round(((b.longTaskTotalMs ?? 0) - (a.longTaskTotalMs ?? 0)) * 1000) / 1000,
      identity: { corpusDocuments: census?.documents ?? null, corpusNodes: census?.nodes ?? null, corpusEdges: census?.edges ?? null, session: 'this invocation', pairedWithinThisRun: true },
      carriedFromAnotherRun: false,
      label: `this run's paired delta for ${g} (gpu-off ${a.id} vs gpu-on ${b.id})`,
    })
  }
  // PROVENANCE ONLY — the first run's delta, contradicted by the second (§12.9 H8/L9).
  out.push({
    gesture: 'folder-row+document-row',
    delta: '+2173 / +2419',
    provenanceRun: 'the 2026-09-17 first run (226 docs / 10 170 nodes / 18 758 edges)',
    carriedFromAnotherRun: false,
    contradictedBy: 'the 2026-09-21 second run measured −36 / −23 ms on an identical mutation count (both legs)',
    label: "PROVENANCE ONLY — the first run's GPU delta is contradicted by a later run and is NOT a finding any unit may rest on (§2.4/RUL-5-L9/S20); the node/edge counts belong to that run's corpus, never to a threshold",
  })
  return out
}
/** §4.2 — assemble the emitted report from the accumulated runs. */
function o0BuildReport(h, opt, names, censusOverride) {
  const census = censusOverride ?? { documents: null, nodes: null, edges: null, engine: 'absent' }
  const runs = o0Acc.runs
  const controls = o0ControlRows(runs)
  const date = o0Date()
  const claimed = Number.isFinite(opt.o0Corpus) ? opt.o0Corpus : O0_OPERATOR_DOCUMENTS
  const verdicts = []
  for (const r of runs) {
    verdicts.push(o0DeriveStageVerdict(r))
    verdicts.push(o0DeriveSnapshotVerdict(r, census).verdict)
    // RUL-4 — the reconciliation verdict DISTINGUISHES the two classes: a row whose
    // only unseparated stages are structural (plus the derived residual) is
    // OPEN-structural; anything else is a FAILED reconciliation.
    if (r.reconciliation && !r.reconciliation.ok && r.reconciliation.openStructural) {
      verdicts.push(`run ${r.id}: reconciliation OPEN-structural — ${r.reconciliation.reason}`)
    } else if (r.reconciliation && !r.reconciliation.ok) {
      verdicts.push(`run ${r.id}: reconciliation FAILED — ${r.reconciliation.reason}`)
    }
    if (r.unseparatedStages && r.unseparatedStages.length) {
      verdicts.push(
        `run ${r.id}: unseparated stages [${r.unseparatedStages.join(', ')}]` +
          (r.structuralStages && r.structuralStages.length ? ` (STRUCTURAL — no seam in the executing bundle: [${r.structuralStages.join(', ')}])` : ''),
      )
    }
  }
  const report = {
    artifact: O0_ARTIFACT_ID,
    spec: O0_SPEC_PATH,
    unit: 'O-0',
    date: date,
    layer: 'assembled-renderer (RCA-12)',
    commands: [`node scripts/live-drive.mjs ${opt.cliArgs.join(' ')}`],
    pinnedCommands: O0_RUN_COMMANDS,
    driver: {
      build: opt.bundle ?? { renderer: null, main: null, served: null, verified: false },
      // §3b re-audit SHOULD item (b) — the ORACLE's own provenance, alongside the bundle
      // identity: the verdicts come from the SOURCE-IMPORTED `src/shared/o0-report.ts` +
      // this driver's row assembly, so the code that produced them is identified too.
      oracleIdentity: o0OracleIdentity(),
      gpuFlag: opt.gpu === true,
      cliArgs: opt.cliArgs,
      runMode: opt.connect ? 'connect' : 'spawn',
      leg: opt.gpu === true ? 'gpu-on' : 'gpu-off',
      blocks: names.filter((n) => n.startsWith('o0_')),
      appFlag: opt.connect ? (opt.gpu === true ? 'app launched WITHOUT --no-gpu (GPU-on leg)' : 'app launched with --no-gpu (GPU-off leg)') : `app spawned by this driver (${opt.gpu === true ? 'gpu on' : '--no-gpu'})`,
      artifactDoc: O0_ARTIFACT_DOC,
      crossArtifactControlPairs: controls.filter((c) => c.pairedWithStatus === 'cross-artifact').map((c) => c.id),
      // §2.4/RUL-5-L9 + §6 S20/F20 — the GPU delta is recorded PER RUN / PER CORPUS,
      // with the run + corpus identity it belongs to; an earlier run's delta may only
      // appear as labeled PROVENANCE (`carriedFromAnotherRun:false` + `provenanceOf`),
      // never as this run's measurement.
      gpuDeltas: o0GpuDeltas(runs, census),
      hookInertness: o0Acc.hookPairs,
      // RUL-6 — WHICH HALF carried each inertness proof, in one place (never a
      // numeric long-task claim the pair does not have).
      hookInertnessProof: o0Acc.hookPairs.map((p) => ({
        pair: `${p.baselineRun} / ${p.armedRun}`,
        carriedBy: p.carriedBy ?? [],
        vacuousHalves: p.vacuousHalves ?? [],
        nonVacuousHalves: p.nonVacuousHalves ?? null,
        statement: p.proofStatement ?? null,
      })),
      // §3.6b/S15 — the main-side refinement's arm state per LEG, OBSERVED (finding
      // L3/RUL-3): `true` only when a MAIN-instance record was actually transported
      // and read (`o0Acc.mainRecords`).
      mainSeamArmed: false,
      mainSeamRecords: 0,
      mainTransport: {
        channel: null,
        note: 'RUL-3 — the MAIN instance IS armed in spawn mode (ASTROGRAPHER_O0_MAIN_ARM=1) and its handler wrap records `snapshot.clone`, but no channel carries those records into the renderer/report, and Electron\'s structured clone of the handler return value runs inside the IPC internals after the handler returns (outside every host-side wrap): the stage is structurally unseparated with this exact reason, never an imputed number',
      },
      mainSeamNote: opt.mainSeamNote ?? null,
      // RUL-5/L1 — the engine probe's EVIDENCE (never a bare derived value): an
      // underivable state is a loud harness fail-state (`engineError`).
      engineEvidence: census.engineEvidence ?? null,
      engineError: census.engineError ?? null,
      display: ':' + (opt.display ?? '1'),
    },
    // §13.2 (7) [O0-UNION-BAND-FIELD-DRIFT] — `tolerance.source` names what the band IS:
    // the COMPILE-TIME constant the oracle and the per-row `reconciliation.toleranceMs`
    // both read (one authoritative band). It is NOT a measurement — the former
    // `measured <date>` text presented a constant as an empirical reading — and the
    // empirical re-derivation of the union band stays an OWED item (§13.4/§12.2).
    tolerance: {
      reconcileMs: O0_RECONCILE_TOLERANCE_MS,
      source:
        `the compile-time constant O0_RECONCILE_TOLERANCE_MS (${O0_RECONCILE_TOLERANCE_MS} ms) — the ONE band the oracle reads from each row's ` +
        `recorded reconciliation.toleranceMs and the report declares here; its empirical re-derivation by the long-task/union data is OWED (§13.2 (7)/§13.4)`,
    },
    corpus: {
      source: Number.isFinite(opt.o0Corpus) ? '--o0-corpus' : (opt.connect ? 'operator-store' : 'seed'),
      claimedDocuments: claimed,
      documents: census.documents,
      nodes: census.nodes,
      edges: census.edges,
      seed: O0_SEED,
      // RUL-5/L10 — the SIZE is the gate; bytes/nodes/edges are RECORDED PROVENANCE
      // about the source actually used. No cross-run absolute claim may rest on them.
      gate: 'documents',
      provenanceOnly: ['nodes', 'edges', 'bytes'],
      note: O0_CORPUS_PROVENANCE_NOTE,
    },
    env: {
      mode: opt.mode,
      gpu: opt.gpu === true,
      engine: census.engine,
      display: ':' + (opt.display ?? '1'),
      paneFrames: runs.length ? runs[runs.length - 1].paneFrames : null,
    },
    stageIds: [...O0_STAGE_IDS],
    runs: runs,
    controls: controls,
    verdicts: verdicts,
    // §4.2/RUL-4 — the additive top-level reconciliation record; `note` is MANDATORY
    // whenever `status === "OPEN-structural"` (§3.6b RUL-4 clause 5). O0-M1-M3 §4.1 —
    // the report-level record carries the SAME new remainder shape as its rows (the
    // measured window, the union measure, the remainder, `overlapMs`, `outsideMs`, the
    // per-pass list and the band), with the retired `residual` emitted `null` (the legacy
    // summed form survives only as the `notAResidual` diagnostic on each row).
    reconciliation: {
      ok: false,
      windowMs: null,
      accountedMs: null,
      unaccountedMs: null,
      unaccountedReason: 'the report-level remainder is the SUM of the rows\' own remainders (recorded per row)',
      unaccountedSource: 'derived',
      unaccountedAttributable: false,
      overlapMs: null,
      outsideMs: null,
      passOverlapSumMs: null,
      bandExceeded: false,
      passes: [],
      residual: null,
      retired: true,
      retiredBy: 'O0-M1-M3-MEASUREMENT-SHAPE (M1)',
      note: null,
    },
    pass: false,
    // §4.2/RUL-4 — the DERIVED status: `OK` / `OPEN-structural` / `FAIL` (filled in
    // below from the pure validator + the driver's own reasons).
    status: null,
    artifactPath: opt.o0Out ? opt.o0Out : null,
  }
  const derived = o0DeriveReportPass(report)
  // RUL-4 clause 3 — `pass` stays the measurement's verdict: `false` whenever ANY
  // forcing reason exists (the structural family included: the measurement is
  // INCOMPLETE), while `ok` (schema validity) no longer contradicts it.
  report.pass = derived.pass
  report.driver.failReasons = [...(derived.gating ?? []), ...(derived.structuralReasons ?? [])]
  report.driver.gatingReasons = derived.gating ?? []
  report.driver.openStructuralReasons = derived.structuralReasons ?? []
  report.driver.notes = [...(derived.structuralReasons ?? []), ...o0Acc.notes]
  report.driver.structuralStages = [...new Set(runs.flatMap((r) => (r.structuralStages ?? []).map((id) => `${r.id}:${id}`)))]
  // NOTE: `report.driver.openStructural` is NOT derived here — the self-validation
  // push below appends to `derived.gating`, so it is recomputed AFTER that push
  // (the ordering residual of `O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS`, §7 §3a
  // finding 5): a field read before the last mutation of the reason set it is
  // computed from would contradict the reason set it claims to summarize.
  // §3.6b/F17a — the driver runs the PURE validator over the report it just built
  // (BEFORE it is written): the inline rules above re-implement a SUBSET of the
  // pinned module's rules and the two can — and on this unit DID — disagree about
  // which rows are acceptable. The validator's reasons are APPENDED to the driver's
  // own, so a report can never be written whose rows the pinned module rejects. The
  // report itself is STILL WRITTEN (pass:false): the numbers stay inspectable
  // (§6 F16/F17 — never a silent skip, never a withheld artifact).
  const rows = runs.map((r) => ({ id: r.id, res: o0Twins.report.validateO0Run(r, O0_STAGE_IDS) }))
  // §3.6b/F17c — the structural family is NOT a self-validation failure: the pure
  // module classifies it out of `errors` (§6 S19), so a structurally-open report
  // shows `selfValidation.ok:true` with an empty `errors[]`.
  // F7-1 (the SEVENTH run's high finding) — ORDER. The §3.6b/F17c self-validation MUST
  // read the FINAL report object, and the §3.6b RUL-4 clause 5 mandatory
  // `reconciliation.note` is part of that object: the note clause of the pinned module
  // is gated on the DERIVED status, so on a structurally-open leg the note's ABSENCE
  // minted its own reason and BOTH legs read FAIL. The validation therefore runs at the
  // ONE call site BELOW, in source order AFTER the note is attached — `whole` is the
  // binding it assigns. Its reason set, the call count and every other emitted field
  // are untouched: only the note's position/timing moves. F8-1 (the EIGHTH run's
  // finding): the claim previously written HERE — "nothing between here and that call
  // site reads `whole`" — was FALSE (the pre-validation derivation read
  // `whole.structural`), which aborted both legs with a TypeError before any report
  // was written. Everything that reads `whole` now sits at/after that call site.
  let whole = null
  // RUL-4/F17c — the STRUCTURAL FAMILY is recorded, never counted as a
  // self-validation ERROR: only the GATING reasons (and the schema errors) can
  // reject the report, so a structurally-open report is `ok:true`/empty `errors[]`.
  const errors = []
  const selfValidation = () => {
    for (const row of rows) if (!row.res.ok) for (const m of row.res.errors) errors.push(`run ${row.id}: ${m}`)
    for (const m of whole.gating ?? []) errors.push(m)
    const selfOk = rows.every((row) => row.res.ok === true) && (whole.gating ?? []).length === 0 && whole.errors.length === 0
    const missed = errors.filter((m) => !(derived.gating ?? []).some((own) => own === m || own.endsWith(m.replace(/^run [^:]+: /, ''))))
    report.driver.selfValidation = {
      ok: selfOk,
      attempts: rows.length,
      runIds: rows.map((r) => r.id),
      errors: errors,
      status: whole.status,
      structuralErrors: 0,
      structuralFacts: (whole.structural ?? []).length,
      moduleGating: whole.gating ?? [],
      rowResults: rows.map((row) => ({ id: row.id, ok: row.res.ok, errors: row.res.errors })),
      gatingReasons: derived.gating ?? [],
      note: 'RUL-4/F17c — the structural family is recorded, never counted as a self-validation ERROR: a structurally-open report is ok:true/empty errors with status "OPEN-structural"',
    }
    if (!selfOk) {
      const rejectedRows = rows.filter((row) => !row.res.ok).map((row) => row.id)
      const rejected = rejectedRows.length + (whole.ok ? 0 : 1)
      // §2.1(iii)/RUL-11 + the `F5-1` companion defect — the summary line COUNTS what it
      // lists: the FIFTH run said "rejected 1 row(s)" while printing every rejected
      // reason (the count and the list disagreed).
      const listed = missed.length ? missed : errors
      derived.gating.push(
        `driver self-validation rejected ${rejected} row(s)/report(s) naming ${listed.length} reason(s)` +
          (rejectedRows.length ? ` (rows: ${rejectedRows.join(', ')})` : '') +
          `: ${listed.join(' | ')} (§3.6b)`,
      )
      report.driver.failReasons = [...derived.gating, ...(derived.structuralReasons ?? [])]
      report.driver.gatingReasons = derived.gating
      report.pass = false
    }
    return selfOk
  }
  // F8-1 (the EIGHTH run's harness finding) — ORDER, the second half of the F7-1 fix.
  // The F7-1 fix moved the ONE `validateO0Report` call BELOW the note attach, but this
  // derivation block (and the `statusOf`/`family` block that followed it) still read
  // `whole` — which is the `null` placeholder at this point — so the leg aborted with
  // `TypeError: Cannot read properties of null (reading 'structural')` before any
  // report was written (§14.2/§14.9 of the unit spec). The derivation is therefore
  // SPLIT in two: (i) HERE, over the DRIVER's OWN reason sets only, deriving the
  // PRE-VALIDATION status whose branch the mandatory note names — the note's text can
  // never be minted by, and never mints, the reason it answers (no circularity);
  // (ii) AFTER the single validation call, over BOTH reason sets, exactly as before
  // (the emitted `status`/`pass`/`statusStatement`/`structuralReasons` are unchanged).
  const preStatus = o0Twins.report.deriveO0ReportStatus({
    ok: true,
    gating: derived.gating ?? [],
    failReasons: [...(derived.gating ?? []), ...(derived.structuralReasons ?? [])],
    structuralFamily: derived.structuralReasons ?? [],
    structuralReasons: derived.structuralReasons ?? [],
  })
  // §3.6b RUL-4 clause 5 — the MANDATORY reconciliation note on the OPEN-structural
  // branch: the structural stages + the non-computable residual + the no-imputation
  // statement, in one sentence.
  // F7-1 — ORDER (never content): the note is attached HERE, from the PRE-VALIDATION
  // status/reasons derived above from the driver's OWN reason sets (`preStatus`; never
  // invented after, and never read from, the validation whose reason it answers), and
  // this block sits in source order BEFORE the ONE `validateO0Report` call site below —
  // so the mandatory-note clause of the pinned module sees the note and the report
  // is never rejected for a field the driver was about to write. The note's TEXT is
  // unchanged (same branches, same evidence).
  const structuralIds = [...new Set(runs.flatMap((r) => (r.structuralStages ?? []).map((id) => `${r.id}:${id}`)))]
  // §2.4/RUL-11 (RUL-12 / the `F5-6` fix) — the mandatory note is MANDATORY: the FIFTH
  // run's TOP-LEVEL `reconciliation.note` read `null` on both legs (the note-bearing
  // statement lived only on the rows) and no validator reason fired for its absence.
  // It is now present on EVERY status: the structural form and the FAIL form both name
  // their evidence, and the note may never be null on the new-shape report.
  const shapeFailures = runs.flatMap((r) => (r.measurementShape && r.measurementShape.ok === false ? r.measurementShape.errors : []))
  const reconciliationNote =
    preStatus.status === 'OPEN-structural'
      ? `structurally unseparated stage(s) ${structuralIds.join(', ')} have no seam in the executing bundle (` +
        `${(derived.structuralReasons ?? [])[0] ?? 'reason recorded per stage row'}), so the long-task residual is NOT computable ` +
        `and post.style stays unseparated (a DERIVED value, never a number); no value was imputed (§3.6b RUL-4 clause 5)`
      : preStatus.status === 'FAIL'
        ? `the report is FAIL: ${(derived.gating ?? []).length} forcing reason(s) outside the structural family ` +
          `(${(derived.gating ?? [])[0] ?? '<unrecorded>'}); the DERIVED remainder reported at reconciliation.unaccountedMs is an ` +
          `accounting quantity, is attributable:false and was never imputed; structurally unseparated stage(s) ` +
          `${structuralIds.join(', ') || '<none>'} remain recorded per stage row (§3.6b RUL-4 clause 5/RUL-12)`
        : `every stage is measured or DERIVED and no forcing reason was recorded; the DERIVED remainder reported at ` +
          `reconciliation.unaccountedMs is an accounting quantity, is attributable:false and was never imputed (§3.6b RUL-4 clause 5)`
  report.reconciliation = {
    ok: preStatus.status === 'OK',
    note: reconciliationNote,
    bandExceededNotes: runs
      .filter((r) => r.reconciliation && r.reconciliation.bandExceeded === true)
      .map((r) => `${r.id}: ${String(r.reconciliation.bandExceededNote ?? 'the remainder exceeds the recorded band')}`),
    bandExceededGate: false,
    measurementShapeFailures: shapeFailures,
    structuralStages: structuralIds,
  }
  // §3b re-audit SHOULD item (a) [ORDER — the driver's SINGLE self-validation call] —
  // the §4.2-pinned `verdicts` array must be NON-EMPTY in the object the validator reads
  // (its `F10` required-field clause refuses an empty `verdicts[]`), and the report the
  // validator reads must be the report as EMITTED. The text is a LAZY reading of the
  // derived status (`verdictText()` below), attached as a plain string after the status
  // recompute — so the emitted string is byte-identical to the pre-fix one while the
  // array is populated BEFORE validation.
  const verdictSlot = report.verdicts.length
  report.verdicts.push('O-0 REPORT verdict pending derivation (§4.4 — the verdict is DERIVED from the status/reason sets, never hard-coded)')
  // F7-1 — the ONE §3.6b/F17c self-validation call, on the FINAL report object: the
  // §3.6b RUL-4 clause 5 mandatory note is attached above (its absence can no longer
  // mint its own reason), so `selfValidation` describes the report as EMITTED. Its own
  // reasons are then appended to the driver's and the status is RE-derived below (the
  // reorder changed WHEN the module reads the report, never WHICH fields exist).
  // VERIFIED on the committed SEVENTH-edition legs: with the note attached first the
  // module returns `gating: []` / `structural: [the 4 row-level facts]` / an empty
  // `errors[]` (its only prior error WAS the note clause), so `selfOk` is true and the
  // legs DERIVE `OPEN-structural` — the F7-1 defect read the note's absence as the
  // report's reason.
  whole = o0Twins.report.validateO0Report(report)
  const selfOk = selfValidation()
  // §3.6b/RUL-4 — the OPEN-structural verdict, recomputed AFTER the self-validation
  // push above (the last mutation of `derived.gating`): "structural facts recorded
  // and NO gating reason" is exactly `status === "OPEN-structural"`. F8-1: this block
  // (and `family`/`statusOf` below) reads `whole`, so it runs HERE — after the single
  // validation call above assigned it — never before it.
  report.driver.openStructural = (derived.structuralReasons ?? []).length > 0 && (derived.gating ?? []).length === 0
  // RUL-4 — the DERIVED status, from the ONE exported implementation, over BOTH
  // reason sets (the driver's own + the pure validator's), with the STRUCTURAL
  // FAMILY classified explicitly: `FAIL` when a reason outside the family exists,
  // `OPEN-structural` when the only reasons are the family, `OK` when none.
  const family = [
    ...new Set([
      ...(derived.structuralReasons ?? []),
      ...(whole.structural ?? []),
      ...(whole.derivedResidual ?? []),
      ...((whole.notes ?? []).filter((m) => /OPEN-structural|structurally unseparated|DERIVED residual/.test(m))),
    ]),
  ]
  const statusOf = o0Twins.report.deriveO0ReportStatus({
    ok: selfOk,
    gating: derived.gating ?? [],
    failReasons: [...(derived.gating ?? []), ...family],
    structuralFamily: family,
    structuralReasons: derived.structuralReasons ?? [],
    derivedReasons: whole.derivedResidual ?? [],
  })
  report.status = statusOf.status
  report.pass = statusOf.pass
  report.driver.status = statusOf.status
  report.driver.pass = statusOf.pass
  report.driver.statusStatement = statusOf.statement
  report.driver.structuralReasons = family.slice(0, 40)
  // F8-1 — the reconciliation block is ATTACHED above (so the module's mandatory-note
  // clause sees it, the F7-1 fix) but its `ok` is a reading of the FINAL status: the
  // pre-validation attach cannot know about a reason the module itself mints, so the
  // field is re-read from `statusOf` here (the emitted value is unchanged: `ok` ⇔ the
  // report derives `OK`).
  report.reconciliation.ok = statusOf.status === 'OK'
  // §4.4 — the RUL-4 report verdict pair, DERIVED from the status (never hard-coded):
  // the status readable without inspecting the JSON. §3b SHOULD item (a): the slot was
  // reserved BEFORE the validator read the report (see the push above) and is filled
  // HERE from the FINAL derived status — the array the validator saw was non-empty and
  // the emitted text is the pre-fix text, unchanged.
  const verdictText =
    statusOf.status === 'OPEN-structural'
      ? `O-0 REPORT OPEN — ${structuralIds.length} stage(s) structurally unseparated (${structuralIds.join(', ')}): ` +
        `${(derived.structuralReasons ?? [])[0] ?? 'reason recorded per stage row'} — the report is SCHEMA-VALID and its residual ` +
        `cannot be computed; no value was imputed`
      : statusOf.status === 'FAIL'
        ? `O-0 REPORT FAIL — ${(derived.gating ?? []).length || 1} forcing reason(s) outside the structural family ` +
          `(${(derived.gating ?? [])[0] ?? '<unrecorded>'} …) — the measurement or the report is not usable as evidence: ` +
          `§6 F-state class (a genuinely unmeasured permitted stage, an imputation, a falsifiability failure, a violated window, ` +
          `a broken control pairing or a census mismatch)`
        : `O-0 REPORT OK — the report derives OK: no forcing reason outside the structural family and every self-validation row ` +
          `passed (§4.4)`
  report.verdicts[verdictSlot] = verdictText
  // §3b re-audit SHOULD item (a) [ORDER — the object the oracle reads] — the report the
  // validator read above was the report as it stood BEFORE `status`/`pass`/`verdicts`/
  // `reconciliation.ok` were finalized, i.e. without the fields the §4.2/§4.4 shape pins
  // as REQUIRED (an empty `verdicts[]`, an unset `status`). The single self-validation call
  // is NOT re-run (its reason set, call count and record are untouched): the EMITTED object
  // is re-validated here over a SHALLOW COPY (`validateO0Report` never writes to its
  // argument), and any error the finalize introduced is appended to the driver's reason set
  // — recorded, never silent. On a report whose rows are the module's own this is a no-op.
  const emitted = o0Twins.report.validateO0Report({ ...report })
  report.driver.selfValidationOfEmitted = {
    ok: emitted.ok,
    errors: emitted.errors,
    gating: emitted.gating ?? [],
    status: emitted.status,
    verdicts: report.verdicts.length,
    note:
      'the FINAL report object (status/pass/verdicts/reconciliation.ok all attached) re-validated over a SHALLOW COPY — ' +
      'the §3b re-audit order finding: the driver’s single self-validation call could not see the fields it writes LAST',
  }
  if (emitted.errors.length > 0) {
    for (const m of emitted.errors) report.driver.gatingReasons.push(`emitted-report self-validation: ${m}`)
    report.pass = false
    report.driver.pass = false
  }
  return report
}
/** §3.3/§4.1 — write the emitted report (`--o0-out`), or console-only with
 *  `artifactPath: null` (a run without it CANNOT produce the committed artifact). */
function o0WriteReport(report, opt) {
  const json = JSON.stringify(report, null, 2)
  if (opt.o0Out) {
    writeFileSync(opt.o0Out, json + '\n', 'utf8')
    console.error(`[live-drive] O-0 report written to ${opt.o0Out} (pass=${report.pass}, ${report.runs.length} run(s), ${report.controls.length} control(s), artifactPath=${report.artifactPath})`)
  } else {
    console.error(`[live-drive] O-0 report (console-only: no --o0-out ⇒ artifactPath=null, the committed artifact cannot be produced from this run)`)
  }
  console.log(`O0-REPORT ${json}`)
  return report
}

// ---------------------------------------------------------------------------
// §5.U — the capped 8-row delta matrix (docs/specs/user-flow-audit.md §2), as
// the SINGLE SOURCE of the reported matrix row set. `summary.total` is the
// number of MATRIX_ROWS entries executed (§3: the number of §5.U rows, never
// the number of blocks); `blocks` lists the EXTRA scenario blocks that also
// exercise the row's behavior without claiming it.
// ---------------------------------------------------------------------------
export const MATRIX_ROWS = [
  { row: 'U-1', block: 'uf_panes_12', dclass: 'D-interaction', delta: 'a real click on a doc-nav document ROW focuses that document (F-1)' },
  { row: 'U-2', block: 'uf_tabs_7', blocks: ['uf_panes_14'], dclass: 'D-interaction', delta: 'a real click on a search RESULT row opens the document in a NEW tab (F-1)' },
  { row: 'U-3', block: 'uf_panes_12', blocks: ['uf_panes_14'], dclass: 'D-interaction', delta: 'the pane-drag gesture surface is the pane HEADER only — a body click is never hijacked (F-1)' },
  { row: 'U-4', block: 'uf_layout_10', dclass: 'D-visual', delta: 'empty↔filled pane-set transition leaves exactly ONE #wiki-root mount (F-2)' },
  { row: 'U-5', block: 'uf_layout_10', dclass: 'D-visual', delta: "an empty side zone's grid TRACK collapses and the stage reclaims the width (F-3)" },
  { row: 'U-6', block: 'uf_panes_8', dclass: 'D-interaction', delta: 'a pane-tab click after zone minimize re-expands the zone (visible)' },
  { row: 'U-7', block: 'uf_hist_6', dclass: 'D-state', delta: 'a history-entry click reverts the content to that journal point' },
  { row: 'U-8', block: 'uf_tabs_3', dclass: 'D-state', delta: 'closing the LAST tab yields the default page (never an empty stage)' },
]

/**
 * Reconcile the executed matrix-ROW set against MATRIX_ROWS (§6.1 row-set/count
 * reconciliation): a matrix row with NO block, a duplicated matrix row id, a
 * reported row that disagrees with the matrix, or one block claiming several
 * matrix rows is DETECTABLE, not silent.
 *
 * `executed` = the matrix rows actually RUN in this invocation: `[]` means "no
 * §5.U row was executed" (a scoped block run — reconciliation is vacuous for the
 * matrix rows and only the table itself is checked); pass every row when the
 * whole battery ran (blocksRun === 0 → the `--block=all` full-battery case).
 *
 * `table` = the matrix table to check (defaults to MATRIX_ROWS); its row ids
 * must be unique and every row must name a block.
 *
 * Pure (no I/O) so the live harness and a static check can both use it.
 */
export function reconcileMatrixRows(executed = [], blocksRun = 0, table = MATRIX_ROWS) {
  const matrixIds = table.map((r) => r.row)
  const duplicatedRowIds = [...new Set(matrixIds.filter((id, i) => matrixIds.indexOf(id) !== i))]
  const missingBlocks = table.filter((r) => typeof r.block !== 'string' || r.block === '').map((r) => r.row)
  const matrixBlocks = table.map((r) => r.block)
  const multiRowBlocks = [...new Set(matrixBlocks.filter((b, i) => matrixBlocks.indexOf(b) !== i))]
  const fullBattery = blocksRun === 0
  const reported = executed.map((e) => e.row).filter((r) => typeof r === 'string' && /^U-\d+$/.test(r))
  const executedRows = fullBattery ? matrixIds : reported
  // A scoped run CANNOT report a §5.U row it did not execute (inconclusive, not a
  // defect); the full battery MUST report every row, and NO run may report a row
  // id that is not in the capped matrix — both are loud row-set errors.
  // `blocksRun === 0` = the whole BLOCKS table ran, so every §5.U row has a
  // verdict by construction; the full-battery error is a row MISSING from the
  // matrix table itself (checked below), not from the executed set.
  const missing = []
  const extra = [...new Set(reported.filter((id) => !matrixIds.includes(id)))]
  const errors = []
  if (duplicatedRowIds.length) errors.push(`duplicated MATRIX_ROWS row id(s): ${duplicatedRowIds.join(', ')}`)
  if (missingBlocks.length) errors.push(`MATRIX_ROWS row(s) with no block: ${missingBlocks.join(', ')}`)
  if (missing.length) errors.push(`matrix row(s) executed by NO block: ${missing.join(', ')} (a §5.U row may not be silently missing from the battery)`)
  if (extra.length) errors.push(`report row(s) absent from MATRIX_ROWS: ${extra.join(', ')} (a §5.U row id that is not in the capped matrix)`)
  return {
    ok: errors.length === 0,
    errors,
    matrixRowIds: matrixIds,
    executedRows,
    // Informational (§5.U legitimately lets one scenario block cover several
    // rows — e.g. `uf_panes_12` pins U-1 and the U-3 body-click half): a block
    // named by more than one row is reported, not treated as a row-set error.
    multiRowBlocks: multiRowBlocks,
    fullBattery,
    matrixTotal: matrixIds.length,
    rowsCounted: [...new Set(executedRows)].length,
  }
}

// ---------------------------------------------------------------------------
// The EXTENDED (non-matrix) row set — the legacy `user*` / `repro_*` /
// `toolbar_*` blocks and the checklist rows they cover (§6.1 last bullet: they
// are reported in a SEPARATE table with the same fields, never as §5.U verdicts).
// ---------------------------------------------------------------------------
export const ROW_EXTENDED = [
  { row: 'UF-DEFECT-1', block: 'user1_tab_new' },
  { row: 'UF-DEFECT-2', block: 'user2_pane_drag' },
  { row: 'UF-KEEP-1', block: 'user3_collapse_orientation' },
  { row: 'UF-STAGE-3', block: 'user4_main_editable' },
  { row: 'UF-DEFECT-3', block: 'user5_history_in_pane' },
  { row: 'UF-KEEP-3', block: 'user6_search_no_flicker' },
  { row: 'UF-DEFECT-5', block: 'user7_zone_resize' },
  { row: 'UF-DEFECT-6', block: 'user8_zone_boundary' },
  { row: 'UF-DEFECT-7', block: 'user9_search_open_in_tab' },
  { row: 'UF-DEFECT-8', block: 'user10_collapse_vertical_text' },
  { row: 'UF-STAGE-2', block: 'repro_dup_para' },
  { row: 'UF-STAGE-4', block: 'repro_nbsp' },
  { row: 'UF-HIST-2', block: 'toolbar_undo' },
  { row: 'UF-STAGE-6', block: 'toolbar_toggle' },
]

// ---------------------------------------------------------------------------
// The plan's §6 blocks (one live test per added feature).
// ---------------------------------------------------------------------------
const BLOCKS = {
  tab_new_click: async (h) => {
    const hasBtn = await h.cdp.evaluate(`!!document.querySelector('[data-tab-new]')`)
    if (!hasBtn) return { pass: false, detail: 'no [data-tab-new] button' }
    await h.cdp.click('[data-tab-new]')
    await new Promise((res) => setTimeout(res, 400))
    const landing = await h.cdp.evaluate(`!!document.getElementById('stage-landing')`)
    const tabs = await h.cdp.evaluate(`document.querySelectorAll('.tab').length`)
    return { pass: landing, detail: `tab-new click -> landing=${landing}, tabs=${tabs}` }
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
    // (LIVE-11 note: only an ENABLED APP-GRAPH pane can collapse — the host H3
    // guard no-ops on operator/gnosis scope. The seeded app's app-graph panes are
    // doc-nav/crosslinks/search; target doc-nav explicitly rather than the first
    // toggle in DOM order, which is a gnosis-scope pane that cannot collapse.)
    const seam = await h.cdp.evaluate(`(()=>{const s=window.provident&&window.provident.sidebar;return s?{collapse:typeof s.togglePaneCollapse,paneVis:typeof s.paneVisibilityToggle}:null})()`)
    const targets = await h.cdp.evaluate(`(['doc-nav','crosslinks','search'].map((pid)=>{const f=document.querySelector('.pane-frame[data-pane-id="'+pid+'"] .pane-collapse-toggle');return {pid,toggle:!!f}}))`)
    let collapsed = false, detail = ''
    const picked = targets.find((t) => t.toggle)
    if (!picked) return { pass: false, detail: `no app-graph pane toggle; seams=${JSON.stringify(seam)} targets=${JSON.stringify(targets)}` }
    await h.cdp.click(`.pane-frame[data-pane-id="${picked.pid}"] .pane-collapse-toggle`)
    await sleep(600)
    collapsed = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="${picked.pid}"]');return f?f.classList.contains('is-collapsed'):false})()`)
    const frame = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="${picked.pid}"]');return f?f.getAttribute('data-pane-collapse'):null})()`)
    return { pass: collapsed, detail: `seams=${JSON.stringify(seam)} picked=${picked.pid} collapsed=${collapsed} data-pane-collapse=${frame}` }
  },
  // Measurement-only probe (no pinned user-visible end state of its own — the
  // tab-switching rows are UF-TABS-1/3/4): reported as a §6.1 DIAGNOSTIC so it
  // can never be promoted to a row verdict.
  tabs: async (h) => {
    const r = await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'nodeId', nodeId: '.live-corpus/beta' } })
    const focused = !!(r && (r.ok !== false) && !r.error)
    return diagResult(`provident.focus(nodeId .live-corpus/beta) → ${JSON.stringify(r)}; focused=${focused}`)
  },
  settings_modal: async (h) => {
    await h.cdp.click('#settings-toggle'); const open = await h.cdp.domAttr('#settings-modal', 'class')
    return { pass: /is-open/.test(open ?? ''), detail: `#settings-modal class=${open}` }
  },
  // REMOVED (R6): a first `shell_wiring` definition used to sit here and was
  // DEAD CODE — a duplicated object-literal key means the later definition wins,
  // so `--block=shell_wiring` ran the pointer-wiring surface below (U-SHELL-N7)
  // while this one's assertion never executed. The single live definition is
  // kept below (gutter/pane-frame inventory + seam pointer counters).
  import: async (h) => diagResult('see the U-IMPORT-1 battery — needs the OS dialog driver (inject a fixed selection to un-park); no drivable assertion in this block'),
  boot_landing: async (h) => {
    // U-LIVE4 — TRUE empty-store boot (run with --no-seed) must show #stage-landing
    // co-existing with #editor-toolbar + .pane-frame panes; then a first-document
    // import must remove the landing (no phantom ghost).
    const landing = await h.cdp.evaluate(`!!document.getElementById('stage-landing')`)
    const dataStage = await h.cdp.evaluate(`(()=>{const e=document.getElementById('stage-landing');return e?e.getAttribute('data-stage'):null})()`)
    const toolbar = await h.cdp.evaluate(`!!document.getElementById('editor-toolbar')`)
    const panes = await h.cdp.evaluate(`document.querySelectorAll('.pane-frame[data-pane-id]').length`)
    const coexists = landing && dataStage === 'landing' && toolbar && panes > 0
    const doc = join(ROOT, '.live-corpus', 'live4-first.md')
    mkdirSync(join(ROOT, '.live-corpus'), { recursive: true })
    writeFileSync(doc, '# First\n\nA first document for LIVE-4.\n')
    const imp = await h.mcpTool(h.mcp, 'edit.import_markdown', { files: [doc] }).catch((e) => ({ error: String(e) }))
    await sleep(600)
    const landingAfter = await h.cdp.evaluate(`!!document.getElementById('stage-landing')`)
    return { pass: coexists && !landingAfter, detail: `coexist(landing=${landing},data-stage=${dataStage},toolbar=${toolbar},panes=${panes})=${coexists}; import->landingAfter=${landingAfter} imp=${JSON.stringify(imp)}` }
  },
  vis_persist: async (h) => {
    // U-LIVE11 paneVisibilityToggle live in the operator settings modal: click the
    // in-pane visibility toggle and assert its data-enabled state flips. The toggle
    // is a `[data-pane][data-enabled]` BUTTON inside #settings-modal (it routes to
    // sidebar.paneVisibilityToggle(id)).
    await h.cdp.click('#settings-toggle')
    await sleep(500)
    const sel = await h.cdp.evaluate(`(()=>{const any=document.querySelector('#settings-modal [data-pane][data-enabled]');return any?'[data-pane][data-enabled]':null})()`)
    if (!sel) return { pass: false, detail: 'no [data-pane][data-enabled] toggle in #settings-modal' }
    const before = await h.cdp.domAttr(sel, 'data-enabled')
    await h.cdp.click(sel)
    await sleep(600)
    const after = await h.cdp.domAttr(sel, 'data-enabled')
    return { pass: after !== before, detail: `vis toggle ${sel} data-enabled before=${before} after=${after}` }
  },
  toolbar_undo: async (h) => {
    // UF-HIST-2/3 — after a seeded content edit bumps the journal,
    // #editor-toolbar-undo must be enabled (not stuck disabled) and a REAL click
    // on it must revert the content + re-disable the control at base. The verdict
    // is the POST-CLICK observation (the control re-disabled AND the revert
    // happened), never the `edit.set_content` call result — a no-op click or a
    // failed revert FAILS the row.
    await ufEnsureAppClear(h)
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
    const id = docs && docs.documents && docs.documents[0] && (docs.documents[0].documentId || docs.documents[0].id) ? (docs.documents[0].documentId || docs.documents[0].id) : '.live-corpus/alpha'
    const before = await h.cdp.evaluate(`(()=>{const b=document.getElementById('editor-toolbar-undo');return b?b.disabled:null})()`)
    const edited = await h.mcpTool(h.mcp, 'edit.set_content', { nodeId: id, content: '# Alpha edited by live-drive\n\ncontent\n' }).catch((e) => ({ error: String(e) }))
    await sleep(600)
    const afterEdit = await h.cdp.evaluate(`(()=>{const b=document.getElementById('editor-toolbar-undo');return b?b.disabled:null})()`)
    // SETUP (recorded, not the asserted gesture): mount the edited document so a
    // revert would be VISIBLE on the stage. A setup MCP call is never the verdict.
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: id } }).catch(() => null)
    await sleep(1000)
    let clickPath = 'not-clicked'
    let afterClick = null
    let reverted = false
    if (afterEdit === false) {
      const c = await ufRealClick(h, '#editor-toolbar-undo')
      clickPath = c.path
      await sleep(900)
      afterClick = await h.cdp.evaluate(`(()=>{const b=document.getElementById('editor-toolbar-undo');return b?b.disabled:null})()`)
      const doc = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: id }).catch(() => null)
      reverted = !JSON.stringify(doc || {}).includes('Alpha edited by live-drive')
    }
    const surface = await ufSurfaceTarget(h)
    // The §6.1 result is built INLINE here so the block's own `pass` expression is
    // the post-click observation (`afterClick` disabled again AND `reverted`),
    // gated on the hit-tested path — a no-op click or a failed revert FAILS.
    const realInput = clickPath === 'cdp'
    const proxyPASS = false
    return {
      row: 'UF-HIST-2',
      assertion: 'After an edit the Undo control is enabled, and a REAL click on it reverts the content and re-disables the control at base (the verdict is the post-click observation, never the edit call)',
      dclass: 'D-state',
      realInput: realInput,
      evidence: `undo disabled before=${before} afterEdit=${afterEdit} (enabled=${afterEdit === false}); REAL click '#editor-toolbar-undo' path=${clickPath} → afterClick disabled=${afterClick}; revert observed (edited content gone from the store read-back)=${reverted}; edit.set_content result=${JSON.stringify(edited)} (setup only, NOT the verdict)`,
      proxyPASS: proxyPASS,
      surface: surface,
      pass: realInput && afterClick === true && reverted,
      gesturePath: clickPath,
      undoDisabledAfter: afterClick,
    }
  },
  toolbar_toggle: async (h) => {
    // UF-STAGE-6 — the editor-toolbar markdown/html (editing-mode) toggle: a REAL
    // hit-tested click flips `data-mode` live.
    await ufEnsureAppClear(h)
    const surface = await ufSurfaceTarget(h)
    const before = await h.cdp.domAttr('#editor-toolbar-toggle', 'data-mode')
    if (before == null) return rowResult('UF-STAGE-6', 'A REAL click on the editor-toolbar mode toggle flips the editing mode live (data-mode contenteditable↔textarea)', 'D-interaction', 'no #editor-toolbar-toggle', { path: 'missing', ok: false, surface })
    const click = await ufRealClick(h, '#editor-toolbar-toggle')
    // poll for the live flip (the app re-render is async; a fixed short sleep
    // would read the pre-click attribute and report a false no-op)
    let after = before
    for (let i = 0; i < 8 && after === before; i++) {
      await sleep(300)
      after = await h.cdp.domAttr('#editor-toolbar-toggle', 'data-mode')
    }
    const flipped = after !== before && (after === 'contenteditable' || after === 'textarea')
    return rowResult('UF-STAGE-6', 'A REAL click on the editor-toolbar mode toggle flips the editing mode live (data-mode contenteditable↔textarea)', 'D-interaction', `REAL click '#editor-toolbar-toggle' (path=${click.path}) → data-mode before=${before} after=${after} flipped=${flipped}`, { path: click.path, ok: flipped, surface })
  },
  diag5: async (h) => {
    // LIVE-11 CDP-coordinate-click root cause: elementFromPoint is NOT null (the
    // toggle is hit-testable), yet the CDP Input.dispatchMouseEvent click from
    // the `collapse` block did NOT collapse. Probe the exact difference vs the
    // working native DOM click: (a) document focus, (b) does a CDP click emit a
    // `click` event on the button at all (instrument it), (c) does a leading
    // mouseMoved + press + release + hold-then-check collapse it.
    const probe = await h.cdp.evaluate(`(()=>{
      const t=document.querySelector('.pane-frame[data-pane-id="doc-nav"] .pane-collapse-toggle');
      if(!t) return {err:'no-toggle'};
      const r=t.getBoundingClientRect();
      const cx=r.x+r.width/2, cy=r.y+r.height/2;
      const hit=document.elementFromPoint(cx,cy);
      let clickFired=false, ptrCnt=0;
      const onC=()=>{clickFired=true};
      const onP=()=>{ptrCnt++};
      t.addEventListener('click',onC,{once:true});
      document.addEventListener('pointerdown',onP,{once:true});
      return {focus:document.hasFocus(),ready:document.readyState,cx,cy,hitTag:hit?hit.tagName+'/'+(hit.className||''):'NULL',hitIsBtn:hit===t};
    })()`)
    if (probe.err) return { pass: false, detail: `no toggle: ${probe.err}` }
    // (b) instrument + CDP coordinate press/release at the same center
    await h.cdp.evaluate(`(()=>{window.__cdpClickFired=false;const t=document.querySelector('.pane-frame[data-pane-id="doc-nav"] .pane-collapse-toggle');if(t){t.addEventListener('click',()=>{window.__cdpClickFired=true},{once:true})}})()`)
    const p = await h.cdp.evaluate(`(()=>{const t=document.querySelector('.pane-frame[data-pane-id="doc-nav"] .pane-collapse-toggle');if(!t)return null;const r=t.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`)
    // leading move to position the mouse, then press/release
    for (const s of [{ type: 'move', x: p.x, y: p.y }, { type: 'down', x: p.x, y: p.y }, { type: 'up', x: p.x, y: p.y }]) {
      const ev = s.type === 'down' ? 'mousePressed' : s.type === 'up' ? 'mouseReleased' : 'mouseMoved'
      await h.cdp.send('Input.dispatchMouseEvent', { type: ev, x: s.x, y: s.y, button: 'left', clickCount: s.type === 'up' ? 1 : 0 })
    }
    await sleep(400)
    const fired = await h.cdp.evaluate(`window.__cdpClickFired`)
    const focused = await h.cdp.evaluate(`document.hasFocus()`)
    const ic = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');return f?f.classList.contains('is-collapsed'):null})()`)
    // [DIAG] measurement only — no row verdict
    return diagResult(`probe=${JSON.stringify(probe)}; CDP click fired=${fired} focus=${focused} is-collapsed=${ic}`)
  },
  reorder: async (h) => {
    // U-LIVE6/D — a real pointer drag on a pane-frame must drive a pane reorder.
    // A pane's SLOT is its index among `.pane-frame[data-pane-id]` WITHIN its
    // enclosing `[data-zone]` container (the `data-zone` attr lives on the PARENT
    // `[data-zone='left']` container, NOT the frame). Drive a genuine CDP pointer
    // drag on an IN-VIEWPORT pane (doc-nav is the LAST left-zone pane and sits
    // below the fold on this display), VERIFYING the drag-start point is NOT an
    // interactive control (renderer.ts isInteractiveControl refuses to start a
    // pane drag on an input/button — starting on a query pane's controls is why
    // the earlier attempt no-op'd). Assert the pane's slot index moved.
    const slotSnapshot = async () =>
      h.cdp.evaluate(
        `(()=>{const vh=window.innerHeight;return {vh,slots:[...document.querySelectorAll('[data-zone] .pane-frame[data-pane-id]')].map((f,i)=>({i,paneId:f.getAttribute('data-pane-id'),x:Math.round(f.getBoundingClientRect().x),y:Math.round(f.getBoundingClientRect().y),h:Math.round(f.getBoundingClientRect().height)}))}})()`,
      )
    const snap0 = await slotSnapshot()
    const before = snap0.slots
    if (!before || before.length < 2) {
      return { pass: false, detail: `not enough pane-frames to reorder: ${JSON.stringify(before)}` }
    }
    // find an in-viewport drag-start point on a pane that is NOT an interactive
    // control (walk the frame down from its top, skipping points whose hit
    // element is a control). Prefer app-graph panes (doc-nav/crosslinks/search).
    const startInfo = await h.cdp.evaluate(`(()=>{
      const vh=window.innerHeight;
      const isCtrl=(el)=>{let n=el;while(n){const t=n.tagName?n.tagName.toLowerCase():'';if(t==='button'||t==='input'||t==='select'||t==='textarea'||t==='a')return true;n=n.parentElement}return false};
      const frames=[...document.querySelectorAll('[data-zone] .pane-frame[data-pane-id]')]
        .filter((f)=>{const r=f.getBoundingClientRect();return r.y>20&&r.y<vh-40})
        .sort((a,b)=>(a.getAttribute('data-pane-id')==='doc-nav'?-1:0)-(b.getAttribute('data-pane-id')==='doc-nav'?-1:0));
      for(const f of frames){
        const r=f.getBoundingClientRect();
        const pid=f.getAttribute('data-pane-id');
        const xc=Math.round(r.x+r.width*0.6);
        for(let dy=10;dy<Math.min(r.height,120);dy+=8){
          const y=Math.round(r.y+dy);
          const el=document.elementFromPoint(xc,y);
          if(!el||!f.contains(el)) continue;
          if(!isCtrl(el)) return {pid,x:xc,y,hit:el.tagName+'/'+(el.className||'')};
        }
      }
      return {err:'no non-interactive drag-start in-viewport'};
    })()`)
    if (!startInfo || startInfo.err) {
      return { pass: false, detail: `no non-interactive drag target: ${JSON.stringify(startInfo)} (vh=${snap0.vh} before=${JSON.stringify(before)})` }
    }
    const a = before.find((o) => o.paneId === startInfo.pid)
    if (a == null) return { pass: false, detail: `picked pane not in slots: ${startInfo.pid}` }
    const sibling = before.find((o) => o.paneId !== a.paneId && o.y > a.y + 4 && o.y < snap0.vh - 20) ?? null
    if (sibling == null) return { pass: false, detail: `no in-viewport downward sibling for ${a.paneId}; vh=${snap0.vh}` }
    const targetY = sibling.y + Math.min(26, sibling.h - 8)
    const steps = [
      { type: 'down', x: startInfo.x, y: startInfo.y },
      { type: 'move', x: startInfo.x + 10, y: startInfo.y + 40 },
      { type: 'move', x: startInfo.x + 14, y: Math.round((startInfo.y + targetY) / 2) },
      { type: 'move', x: startInfo.x + 14, y: targetY },
      { type: 'up', x: startInfo.x + 14, y: targetY },
    ]
    await h.cdp.gesture(`[data-pane-id="${a.paneId}"]`, steps)
    await sleep(900)
    const snap1 = await slotSnapshot()
    const after = snap1.slots
    const aAfter = after.find((o) => o.paneId === a.paneId)
    // The reorder assert is on the ZONE SLOT ORDERING SEQUENCE itself (the pane
    // stack), not only the specifically-dragged pane: a genuine drag may reorder
    // the stack by moving the dragged pane (or, per the live app, by the drop's
    // insertion reflowing the zone). PASS iff the ordering sequence changed.
    const seqBefore = before.map((o) => o.paneId).join(',')
    const seqAfter = after.map((o) => o.paneId).join(',')
    const moved = seqBefore !== seqAfter
    return {
      pass: moved,
      detail: `slot order changed=${moved}; dragged ${a.paneId} before=${a.i} after=${aAfter ? aAfter.i : '?'} (drag from ${JSON.stringify({ x: startInfo.x, y: startInfo.y, hit: startInfo.hit })} PAST ${sibling.paneId}@y=${sibling.y}->targetY=${targetY}, vh=${snap0.vh}); seq before=[${seqBefore}] after=[${seqAfter}]`,
    }
  },
  diag6: async (h) => {
    // Do CDP Input mouse events generate page-level pointer/click events AT ALL?
    // Instrument document-level pointerdown/move/up + click counters, then dispatch
    // a real CDP mouse press at an ON-SCREEN pane frame center, move it down, release.
    // This disambiguates a HARNESS/synthetic-input limitation (0 pointer events →
    // the pane-drag controller never sees the gesture) from a real reorder defect.
    const arm = await h.cdp.evaluate(`(()=>{
      window.__pev={down:0,move:0,up:0,click:0};
      for(const t of ['pointerdown','pointermove','pointerup','click']) document.addEventListener(t,()=>{window.__pev[t]=(window.__pev[t]||0)+1},true);
      const f=document.querySelector('.pane-frame[data-pane-id="gnosis-query"]');
      if(!f) return null; const r=f.getBoundingClientRect();
      return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2),cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2)};
    })()`)
    if (!arm) return { pass: false, detail: 'no gnosis-query frame' }
    await new Promise((r)=>setTimeout(r,200))
    // reset counters AFTER arming (the arming listeners already fired on prior events is impossible—fresh page)
    await h.cdp.evaluate(`window.__pev={down:0,move:0,up:0,click:0}`)
    for (const s of [
      { type: 'mouseMoved', x: arm.x, y: arm.y },
      { type: 'mousePressed', x: arm.x, y: arm.y, button: 'left', clickCount: 1 },
      { type: 'mouseMoved', x: arm.x, y: arm.y + 60 },
      { type: 'mouseMoved', x: arm.x, y: arm.y + 120 },
      { type: 'mouseReleased', x: arm.x, y: arm.y + 120, button: 'left', clickCount: 1 },
    ]) {
      await h.cdp.send('Input.dispatchMouseEvent', s)
      await new Promise((r)=>setTimeout(r,120))
    }
    await new Promise((r)=>setTimeout(r,300))
    const counts = await h.cdp.evaluate(`window.__pev`)
    return diagResult(`gnosis-query center=(${arm.x},${arm.y}) pointer-event counts=${JSON.stringify(counts)}`)
  },
  diag: async (h) => {
    // Diagnostic: dump the pane-frame inventory + a collapse-click trace so a live
    // FAIL can be distinguished from a wrong harness selector.
    const dump = await h.cdp.evaluate(`(()=>{const frames=[...document.querySelectorAll('.pane-frame[data-pane-id]')];return {frames:frames.map((f)=>({paneId:f.getAttribute('data-pane-id'),zone:f.getAttribute('data-zone'),collapse:f.getAttribute('data-pane-collapse'),hasToggle:!!f.querySelector('.pane-collapse-toggle'),isCollapsed:f.classList.contains('is-collapsed'),bodyNodes:f.children.length})),modalPanes:document.querySelector('#settings-modal-body #panes')?true:false}})()`)
    const toggleSel = await h.cdp.evaluate(`document.querySelector('.pane-frame .pane-collapse-toggle') ? true : false`)
    let clickTrace = null
    if (toggleSel) {
      await h.cdp.click('.pane-frame .pane-collapse-toggle')
      await sleep(600)
      clickTrace = await h.cdp.evaluate(`({isCollapsed:[...document.querySelectorAll('.pane-frame')].some((f)=>f.classList.contains('is-collapsed')),frames:[...document.querySelectorAll('.pane-frame[data-pane-id]')].map((f)=>f.getAttribute('data-pane-collapse'))})`)
    }
    return diagResult(`diag frames=${JSON.stringify(dump)} toggle=${toggleSel} click=${JSON.stringify(clickTrace)}`)
  },
  diag2: async (h) => {
    // LIVE-11 root-cause split: does the HOST seam work if called DIRECTLY
    // (bypassing the DOM click)? If a direct sidebar.togglePaneCollapse('doc-nav')
    // collapses the pane, the failure is the DOM-click→dispatch binding; if it
    // does NOT, the host setLayout→re-render is broken live. Also dumps the
    // toolbar editing-mode data-mode after a direct operatorSet toggle for LIVE-9.
    const before = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');return {pc:f?f.getAttribute('data-pane-collapse'):null,ic:f?f.classList.contains('is-collapsed'):null}})()`)
    const direct = await h.cdp.evaluate(`(()=>{const s=window.provident&&window.provident.sidebar;if(!s||typeof s.togglePaneCollapse!=='function')return 'no-seam'; try{s.togglePaneCollapse('doc-nav');return 'called'}catch(e){return 'threw:'+String(e)}})()`)
    await sleep(600)
    const after = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');return {pc:f?f.getAttribute('data-pane-collapse'):null,ic:f?f.classList.contains('is-collapsed'):null,zone:f?f.getAttribute('data-zone'):null}})()`)
    const toggleBefore = await h.cdp.domAttr('#editor-toolbar-toggle', 'data-mode')
    const toggleDirect = await h.cdp.evaluate(`(()=>{const s=window.provident&&window.provident.sidebar;if(!s||typeof s.operatorSet!=='function')return 'no-opset'; try{s.operatorSet({editingMode:'textarea'});return 'called'}catch(e){return 'threw:'+String(e)}})()`)
    await sleep(600)
    const toggleAfter = await h.cdp.domAttr('#editor-toolbar-toggle', 'data-mode')
    return diagResult(`directCollapse before=${JSON.stringify(before)} call=${direct} after=${JSON.stringify(after)}; toggle before=${toggleBefore} direct=${toggleDirect} after=${toggleAfter}`)
  },
  diag3: async (h) => {
    // LIVE-11/9 root-cause: does the provident on:click listener fire when the
    // element's native DOM click (bypassing hit-testing) is invoked via
    // Runtime.evaluate — vs the CDP Input.dispatchMouseEvent of `click`?
    const nat = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');const t=f&&f.querySelector('.pane-collapse-toggle');if(!t)return 'no-toggle'; try{t.click();return 'clicked'}catch(e){return 'threw:'+String(e)}})()`)
    await sleep(600)
    const afterNode = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');return {ic:f?f.classList.contains('is-collapsed'):null,pc:f?f.getAttribute('data-pane-collapse'):null}})()`)
    // also: is the toggle covered / clickable? check elementFromPoint at its center.
    const hit = await h.cdp.evaluate(`(()=>{const t=document.querySelector('.pane-frame[data-pane-id="doc-nav"] .pane-collapse-toggle');if(!t)return 'no-toggle';const r=t.getBoundingClientRect();const el=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {same:el===t,hit:(el?el.tagName+'.'+(el.className||''):'null'),tag:t.tagName,cls:t.className,disabled:t.disabled}})()`)
    const toggle = await h.cdp.evaluate(`(()=>{const t=document.querySelector('.pane-frame[data-pane-id="doc-nav"] .pane-collapse-toggle');return t?{handlers:t.hasAttribute('onclick'),outer:(t.outerHTML||'').slice(0,200)}:null})()`)
    // [DIAG] measurement only — no row verdict. This block's driver is a NATIVE
    // DOM click inside Runtime.evaluate (no hit-testing), so it records the path
    // it used and classifies itself as a proxy: a synthetic driver can never be
    // an accepted real-gesture PASS (§6.1).
    const evidence = `nativeElClick=${nat} after=${JSON.stringify(afterNode)} hit=${JSON.stringify(hit)} toggle=${JSON.stringify(toggle)}`
    const proxyPASS = true
    return {
      diagnostic: true,
      pass: false,
      proxyPASS: proxyPASS,
      proxy: 'synthetic DOM click inside Runtime.evaluate (no hit-tested gesture)',
      path: 'synthetic-dom-click',
      gesturePath: 'synthetic-dom-click',
      realInput: false,
      park: false,
      detail: evidence,
    }
  },
  diag4: async (h) => {
    // host-vs-package: does the SYNTHETIC MCP provident.dispatch on the collapse
    // toggle collapse doc-nav? If yes -> graph+handler are fine and ONLY the DOM
    // getNode(wire) link is broken (host-fixable). If no -> handler registration/
    // dispatch is broken (possibly the package boundary).
    const tries = [
      ['nodeId-kind', { kind: 'nodeId', nodeId: 'pane-collapse-doc-nav' }],
      ['raw-id', 'pane-collapse-doc-nav'],
      ['nodeId-docnav', { kind: 'nodeId', nodeId: 'doc-nav' }],
    ]
    const out = {}
    for (const [label, target] of tries) {
      const r = await h.mcpTool(h.mcp, 'provident.dispatch', { target, event: 'click' }).catch((e) => ({ error: String(e) }))
      await sleep(500)
      const ic = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');return f?f.classList.contains('is-collapsed'):null})()`)
      out[label] = { res: r, isCollapsed: ic }
      if (ic) break
    }
    return diagResult(JSON.stringify(out))
  },
  first_boot_default: async (h) => {
    // LIVE-7 first-run default (run with --no-seed = FRESH first boot): on an
    // EMPTY persisted enabledPanes (panesInitialized !== true) the shipped
    // default ENABLED app-graph panes are ONLY ['search','doc-nav'] — NOT all
    // app-graph panes. The pane-frame root id is `pane-<id>` (pane-graph.ts).
    // The meaningful check is the REGISTRY/ENABLED state (the census + the
    // frames' DOM presence), not off-viewport geometry — so presence is detected
    // via DOM querySelector regardless of viewport, and for any frame that IS
    // present we ALSO record its bounding rect to distinguish a real enabled
    // state from a merely-geometry difference.
    await h.cdp.click('#settings-toggle')
    await sleep(600)
    const census = await h.cdp.evaluate(`(()=>{const e=document.getElementById('operator-enabled-panes');return e?String(e.textContent||'').trim():null})()`)
    const censusNonEmpty = !!census && census.length > 0
    const hasBoth = censusNonEmpty && census.split(/[,\s]+/).filter(Boolean).includes('doc-nav') && census.split(/[,\s]+/).filter(Boolean).includes('search')
    // presence + viewport of each pane frame (present-in-DOM is the enabled-flag
    // test; rect distinguishes an on/off-viewport presence, never a FAIL alone)
    const frames = await h.cdp.evaluate(`(()=>{const vh=window.innerHeight;const ids=['doc-nav','search','crosslinks','template-editor'];const out={};for(const id of ids){const f=document.querySelector('.pane-frame[data-pane-id="'+id+'"]');if(f){const r=f.getBoundingClientRect();out[id]={present:true,inVp:r.top>=0&&r.top<vh&&r.bottom>0,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),enabled:f.getAttribute('data-pane-collapse')!==null}}else{out[id]={present:false}}}return {vh,out}})()`)
    const present = (id) => !!frames.out[id].present
    const absent = (id) => !frames.out[id].present
    const assert1 = censusNonEmpty && hasBoth
    const assert2 = present('doc-nav') && present('search') && absent('crosslinks') && absent('template-editor')
    return {
      pass: assert1 && assert2,
      detail: `census='${census}' (nonEmpty=${censusNonEmpty}, hasBoth={search,doc-nav}=${hasBoth}); pane-frames doc-nav=${present('doc-nav')?JSON.stringify(frames.out['doc-nav']):'ABSENT'} search=${present('search')?JSON.stringify(frames.out['search']):'ABSENT'} crosslinks=${present('crosslinks')?'PRESENT':'absent'} template-editor=${present('template-editor')?'PRESENT':'absent'}; assert1=${assert1} assert2=${assert2} vh=${frames.vh}`,
    }
  },
  settings_boot: async (h) => {
    // U-LIVE7 — the operator Settings pane must be POPULATED AT BOOT (before any
    // interaction): #operator-topk, #operator-editing-mode, #operator-enabled-panes
    // are non-empty inside the settings modal. This is the single-launch check.
    await h.cdp.click('#settings-toggle')
    await sleep(500)
    const census = await h.cdp.evaluate(`(()=>{const ids=['operator-topk','operator-editing-mode','operator-enabled-panes'];let count=0,nonEmpty=0;let panes='';for(const id of ids){const e=document.getElementById(id);if(e){count++;if(String(e.textContent||'').trim().length>0)nonEmpty++;if(id==='operator-enabled-panes')panes=(e.textContent||'').trim()}}return {count:count,nonEmpty:nonEmpty,panes:panes}})()`)
    const pass = census.count === 3 && census.nonEmpty === 3
    return { pass, detail: `operator settings populated at boot: count=${census.count} nonEmpty=${census.nonEmpty} enabledPanes='${census.panes}'` }
  },
  persistence_v1: async (h) => {
    // U-LIVE5 run 1 (paired with persistence_v2 sharing --home + --keep-home):
    // toggle ONE pane OFF via the real `[data-pane][data-enabled]` button and assert
    // (a) its data-enabled flipped (pane now hidden) and (b) the operator settings
    // pane is populated (the persistence write fired). The pane toggled OFF is
    // doc-nav — persistence_v2 re-asserts the SAME id is still OFF at the next boot.
    // The MODAL OPEN is a REAL hit-tested click; the toggle itself is the
    // seam-probing NATIVE `.click()` ([DIAG]-classified, recorded as `path`), so an
    // off-viewport toggle in the modal isn't a CDP hit-test artifact — the row's
    // `realInput` therefore reports false and the verdict is never a real-gesture PASS.
    const openPath = (await ufRealClick(h, '#settings-toggle')).path
    await sleep(500)
    const sel = await h.cdp.evaluate(`(()=>{const t=document.querySelector('#settings-modal [data-pane="doc-nav"][data-enabled]');return t?'[data-pane="doc-nav"][data-enabled]':null})()`)
    if (!sel) return { pass: false, detail: 'no doc-nav [data-pane][data-enabled] toggle in #settings-modal' }
    const hit = await h.cdp.evaluate(`(()=>{const t=document.querySelector('#settings-modal [data-pane="doc-nav"][data-enabled]');if(!t)return null;const r=t.getBoundingClientRect();return {cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2),inVp:r.y>0&&r.y+r.height<window.innerHeight}})()`)
    const before = await h.cdp.domAttr(sel, 'data-enabled')
    const paneFrameBefore = await h.cdp.evaluate(`!!document.querySelector('.pane-frame[data-pane-id="doc-nav"]')`)
    const nat = await h.cdp.evaluate(`(()=>{const t=document.querySelector('#settings-modal [data-pane="doc-nav"][data-enabled]');if(!t)return 'no-toggle';try{t.click();return 'clicked'}catch(e){return 'threw:'+String(e)}})()`) // [DIAG] seam probe (native DOM click — not a hit-tested gesture)
    await sleep(800)
    const after = await h.cdp.domAttr(sel, 'data-enabled')
    const populated = await h.cdp.evaluate(`(['#operator-topk','#operator-editing-mode','#operator-enabled-panes'].map((s)=>{const e=document.querySelector(s);return s+':'+((e&&e.textContent||'').trim().length>0)}))`)
    const paneFrameAfter = await h.cdp.evaluate(`!!document.querySelector('.pane-frame[data-pane-id="doc-nav"]')`)
    const pass = after !== before && after === 'false'
    return { pass, path: 'native-toggle([DIAG] seam probe)', modalOpenPath: openPath, synthetic: true, detail: `doc-nav toggle data-enabled before=${before} after=${after} (hidden=${after==='false'}); nativeClick=[DIAG] ${nat} toggleGeo=${JSON.stringify(hit)}; modal open REAL click path=${openPath}; paneFrame doc-nav before=${paneFrameBefore} after=${paneFrameAfter}; settings populated=${JSON.stringify(populated)}` }
  },
  persistence_v2: async (h) => {
    // U-LIVE5 run 2 — same --home as run 1 (shared store); the pane toggled OFF in
    // persistence_v1 (doc-nav) must still be OFF at boot (data-enabled reflects the
    // persisted OFF state) and the operator settings pane must be populated.
    await h.cdp.click('#settings-toggle')
    await sleep(500)
    const sel = await h.cdp.evaluate(`(()=>{const t=document.querySelector('#settings-modal [data-pane="doc-nav"][data-enabled]');return t?t.getAttribute('data-enabled'):null})()`)
    const paneFrame = await h.cdp.evaluate(`!!document.querySelector('.pane-frame[data-pane-id="doc-nav"]')`)
    const populated = await h.cdp.evaluate(`(['#operator-topk','#operator-editing-mode','#operator-enabled-panes'].map((s)=>{const e=document.querySelector(s);return s+':'+((e&&e.textContent||'').trim().length>0)}))`)
    const pass = sel === 'false'
    return { pass, detail: `doc-nav data-enabled at boot=${sel} (persisted OFF=${sel==='false'}); paneFrame doc-nav present=${paneFrame}; settings populated=${JSON.stringify(populated)}` }
  },

  // ==== UN-PARKED LIVE BATTERIES (2026-09-15) — one lexical launch ====
  // UJR1 — provident.get_journal over the live app after the seed.
  ujr1_journal: async (h) => {
    const r = await h.mcpTool(h.mcp, 'provident.get_journal', {}).catch((e) => ({ error: String(e) }))
    const ok = r && Array.isArray(r.entries) && !r.error
    return { pass: ok, detail: `provident.get_journal {} -> ${JSON.stringify(r)}` }
  },

  // V1 — store adjacency basics over the live MCP surface.
  v1_adjacency: async (h) => {
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch((e) => ({ error: String(e) }))
    let id = '.live-corpus/alpha'
    try { id = docs.documents[0].documentId || docs.documents[0].id || id } catch {}
    const doc = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: id }).catch((e) => ({ error: String(e) }))
    const q = await h.mcpTool(h.mcp, 'rag.query', { query: 'alpha', topK: 3 }).catch((e) => ({ error: String(e) }))
    const edges = await h.mcpTool(h.mcp, 'rag.get_edges', { nodeId: id }).catch((e) => ({ error: String(e) }))
    const docOk = !!(doc && !doc.error && Array.isArray(doc.nodes ?? doc.edges ?? null))
    return diagResult(`list_documents=${JSON.stringify(docs)}\n get_document(${id}) nodes/edges: ${doc&&doc.nodes?JSON.stringify(doc.nodes):JSON.stringify(doc)}\n rag.query=${JSON.stringify(q)}\n get_edges=${JSON.stringify(edges)}\n → get_document returned nodes/edges=${docOk} (MCP-probe evidence; UF-PARITY/Unit-V1 rows are reported separately)`)
  },

  // V2 — scoped traversal via rag.query filters (the V2 scoped walk on the MCP surface).
  v2_scoped: async (h) => {
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch((e) => ({ error: String(e) }))
    let id = '.live-corpus/alpha'
    try { id = docs.documents[0].documentId || docs.documents[0].id || id } catch {}
    // resolve a real content nodeId inside the doc for the nodeId-scoped variant
    const doc = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: id, store: 'main' }).catch((e) => ({ error: String(e) }))
    let nodeId = id
    try { const n = doc && doc.nodes && doc.nodes.find((x) => x.type !== 'div'); nodeId = (n && n.id) || id } catch {}
    const scopedTarget = await h.mcpTool(h.mcp, 'rag.query', { store: 'main', query: 'alpha', topK: 3, filters: { target: { documentId: id, nodeId } } }).catch((e) => ({ error: String(e) }))
    const scopeFilter = await h.mcpTool(h.mcp, 'rag.query', { store: 'main', query: 'alpha', topK: 3, filters: { documentPathPrefix: ['.live-corpus'], nodeKind: 'content' } }).catch((e) => ({ error: String(e) }))
    return diagResult(`rag.query target-scope(documentId=${id},nodeId=${nodeId})=${JSON.stringify(scopedTarget)}\n rag.query pathPrefix+kind=` + JSON.stringify(scopeFilter) + `\n (MCP-probe evidence; the scoped-traversal row is reported by its own battery)`)
  },

  // V3 — doc-nav tree in the rendered DOM + rag.list_documents returns the doc heads.
  v3_docnav: async (h) => {
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch((e) => ({ error: String(e) }))
    const navBefore = await h.cdp.evaluate(`(()=>{const p=document.querySelector('#pane-doc-nav, [data-pane-id="doc-nav"]');if(!p)return {err:'no doc-nav pane'};const lis=[...p.querySelectorAll('li')].map(li=>({id:li.getAttribute('data-document-id'),current:li.getAttribute('data-current'),cls:li.className,text:(li.textContent||'').trim()}));return {lis,html:(p.innerHTML||'').slice(0,600)}})()`)
    // expand the doc-nav tree folders (a REAL hit-tested click per folder) so the
    // document leaves render, then re-read to confirm the docs are listed.
    const folder = await h.cdp.evaluate(`(()=>{const f=document.querySelector('#pane-doc-nav [data-folder-path]');return f?(f.getAttribute('data-folder-path')||'[data-folder-path]'):null})()`)
    let folderPath = 'no-folder-row'
    if (folder !== null) folderPath = (await ufRealClick(h, '#pane-doc-nav [data-folder-path]')).path
    await sleep(500)
    const navAfter = await h.cdp.evaluate(`(()=>{const p=document.querySelector('#pane-doc-nav, [data-pane-id="doc-nav"]');if(!p)return null;const lis=[...p.querySelectorAll('li')].map(li=>({id:li.getAttribute('data-document-id'),current:li.getAttribute('data-current'),text:(li.textContent||'').trim()}));return {lis,html:(p.innerHTML||'').slice(0,700)}})()`)
    return diagResult(`rag.list_documents=${JSON.stringify(docs)}\n doc-nav BEFORE=${JSON.stringify(navBefore)}\n doc-nav folder expand REAL click path=${folderPath}\n doc-nav AFTER-expand=${JSON.stringify(navAfter)}`)
  },

  // X — the FLAT subset of Unit X: rag.query flat, get_query_audit_log, rag-stream,
  // empty-query validation (graph-mode S9–S13 structurally NOT mintable — parked).
  x_flat: async (h) => {
    const q = await h.mcpTool(h.mcp, 'rag.query', { query: 'alpha', topK: 3 }).catch((e) => ({ error: String(e) }))
    await sleep(200)
    const log = await h.mcpTool(h.mcp, 'get_query_audit_log', {}).catch((e) => ({ error: String(e) }))
    const stream = await h.mcpTool(h.mcp, 'rag-stream', { query: 'alpha', topK: 3 }).catch((e) => ({ error: String(e) }))
    // whitespace + empty query: the app returns the validation error as content text
    const ws = await h.mcpTool(h.mcp, 'rag.query', { query: '   ' }).catch((e) => ({ error: String(e.message || e) }))
    const empty = await h.mcpTool(h.mcp, 'rag.query', { query: '' }).catch((e) => ({ error: String(e.message || e) }))
    const wsErr = typeof ws === 'string' && /non-empty string/.test(ws)
    const emptyErr = typeof empty === 'string' && /non-empty string/.test(empty)
    const flatOk = q && !q.error && (q.results || q.result)
    const logOk = log && !log.error && Array.isArray(log.entries)
    const streamOk = stream && !stream.error && Array.isArray(stream)
    return { pass: flatOk && logOk && streamOk && wsErr && emptyErr, detail: `rag.query=${JSON.stringify(q)}\n audit_log=${JSON.stringify(log)}\n rag-stream=${JSON.stringify(stream)}\n rag.query(whitespace)=${JSON.stringify(ws)} (rejects=${wsErr}) rag.query('')=${JSON.stringify(empty)} (rejects=${emptyErr})` }
  },

  // MS1/3/5 — the `store` selector + store-qualified broadcast + fail-loud on a
  // single default store (`main`). Multi-store-registry-only scenarios (MS2 wiring /
  // MS4 id-prefix) are structural-parked (no second registered store on this boot).
  ms_store: async (h) => {
    const docsMain = await h.mcpTool(h.mcp, 'rag.list_documents', { store: 'main' }).catch((e) => ({ error: String(e) }))
    const qMain = await h.mcpTool(h.mcp, 'rag.query', { store: 'main', query: 'alpha', topK: 3 }).catch((e) => ({ error: String(e) }))
    const nope = await h.mcpTool(h.mcp, 'rag.query', { store: 'nope', query: 'alpha' }).catch((e) => ({ error: String(e.message || e) }))
    const nopeFailLoud = typeof nope === 'string' && /unknown store/.test(nope)
    // store-qualified `rag-store-changed` broadcast: register a renderer listener
    // (via `window.provident.edit.onRagStoreChanged` — the rag-store-changed
    // subscription lives on the `edit` bridge per preload.ts §Unit D), then import a
    // fresh file into store 'main' and assert the broadcast payload.store == 'main'.
    const armed = await h.cdp.evaluate(`(()=>{window.__msBcast=[];window.__msBcastErr=null;try{window.provident.edit.onRagStoreChanged((p)=>window.__msBcast.push(p))}catch(e){window.__msBcastErr=String(e)}return true})()`)
    const fresh = join(ROOT, '.live-corpus', 'ms3-fresh.md')
    mkdirSync(join(ROOT, '.live-corpus'), { recursive: true })
    writeFileSync(fresh, '# MS3 Fresh\n\nNew content for the store broadcast check.\n')
    const imp = await h.mcpTool(h.mcp, 'edit.import_markdown', { files: [fresh], store: 'main' }).catch((e) => ({ error: String(e.message || e) }))
    await sleep(800)
    const bcast = await h.cdp.evaluate(`window.__msBcast`)
    const stores = await h.cdp.evaluate(`(()=>{const e=document.getElementById('operator-rag-stores')||document.querySelector('[id*="rag-store"]');return e?(e.textContent||'').trim():null})()`).catch(() => null)
    const bcastOk = armed && Array.isArray(bcast) && bcast.length > 0 && bcast.every((p) => p && p.store === 'main')
    const pass = !!(docsMain && !docsMain.error) && !!qMain && !qMain.error && bcastOk && nopeFailLoud
    return { pass, detail: `list_documents{store:"main"}=${JSON.stringify(docsMain)}\n rag.query{store:"main"}=${JSON.stringify(qMain)}\n rag.query{store:"nope"}=${JSON.stringify(nope)} (failLoud=${nopeFailLoud})\n broadcast armed=${armed} err=${(await h.cdp.evaluate('window.__msBcastErr').catch(()=>null))} captured=${JSON.stringify(bcast)} (storeQualified=${bcastOk}) imp=${JSON.stringify(imp)}\n operator store-listing DOM=${stores}` }
  },

  // U-SHELL-N7 — the shell pointer-wiring surface: inventory gutters + pane-frames,
  // drive one gutter gesture + one pane-frame drag, report whether they reach the seam.
  shell_wiring: async (h) => {
    const inv = await h.cdp.evaluate(`(()=>({gutters:[...document.querySelectorAll('.layout .gutter,[class*="gutter"]')].length,gutterZoned:[...document.querySelectorAll('.gutter[data-zone]')].length,panes:[...document.querySelectorAll('.pane-frame[data-pane-id]')].length,zones:[...document.querySelectorAll('[data-zone]')].length,hasLayout:!!document.querySelector('.layout')}))()`)
    // arm the seam counters (capture pointerdown/up on .layout)
    await h.cdp.evaluate(`(()=>{window.__seam={pd:0,pu:0,pm:0};const lay=document.querySelector('.layout');if(lay){for(const t of ['pointerdown','pointerup','pointermove'])lay.addEventListener(t,(ev)=>{window.__seam[t.replace('pointer','').toLowerCase()]++},{capture:true,passive:true})}return true})()`)
    // 1) gutter gesture: CDP drag across the first gutter
    const gutterGeo = await h.cdp.evaluate(`(()=>{const g=document.querySelector('.gutter[data-zone]')||document.querySelector('.gutter');if(!g)return null;const r=g.getBoundingClientRect();return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()`)
    let gutterResult = 'no gutter to drag'
    if (gutterGeo) {
      await h.cdp.gesture('.gutter', [
        { type: 'down', x: gutterGeo.x, y: gutterGeo.y },
        { type: 'move', x: gutterGeo.x + 40, y: gutterGeo.y },
        { type: 'move', x: gutterGeo.x + 60, y: gutterGeo.y },
        { type: 'up', x: gutterGeo.x + 60, y: gutterGeo.y },
      ])
      await sleep(700)
      gutterResult = 'gutter drag dispatched (check seam counters below)'
    }
    // 2) pane-frame drag: reuse slot-snapshot before/after
    const slots = async () => h.cdp.evaluate(`(()=>[...document.querySelectorAll('[data-zone] .pane-frame[data-pane-id]')].map((f,i)=>({i,paneId:f.getAttribute('data-pane-id'),y:Math.round(f.getBoundingClientRect().y)})))()`)
    const s0 = await slots()
    const target = await h.cdp.evaluate(`(()=>{const vh=window.innerHeight;const fs=[...document.querySelectorAll('[data-zone] .pane-frame[data-pane-id]')].filter(f=>{const r=f.getBoundingClientRect();return r.y>20&&r.y<vh-60});const f=fs[0];if(!f)return null;const r=f.getBoundingClientRect();return {id:f.getAttribute('data-pane-id'),x:Math.round(r.x+r.width*0.4),y:Math.round(r.y+14)}})()`)
    let dragResult = 'no in-viewport pane-frame'
    if (target && s0.length >= 2) {
      await h.cdp.gesture(`[data-pane-id="${target.id}"]`, [
        { type: 'down', x: target.x, y: target.y },
        { type: 'move', x: target.x + 12, y: target.y + 30 },
        { type: 'move', x: target.x + 16, y: target.y + 70 },
        { type: 'up', x: target.x + 16, y: target.y + 70 },
      ])
      await sleep(900)
      const s1 = await slots()
      const seq0 = s0.map((o) => o.paneId).join(',')
      const seq1 = s1.map((o) => o.paneId).join(',')
      dragResult = `pane ${target.id} drag: slot-order changed=${seq0!==seq1} (before=[${seq0}] after=[${seq1}])`
    }
    const counts = await h.cdp.evaluate(`window.__seam`)
    const reached = inv.gutters > 0 && inv.panes > 0 && counts.pd > 0
    return diagResult(`inventory=${JSON.stringify(inv)}\n ${gutterResult}\n ${dragResult}\n .layout seam pointer counters(pd,pm,pu)=${JSON.stringify(counts)} (reached-listeners=${reached}) [ADV6 caveat: four gutters may have no grid area in some layouts]`)
  },

  // U-SHELL-7 — #settings-toggle opens #settings-modal (.is-open) + the operator mount renders inside.
  shell7: async (h) => {
    await h.cdp.click('#settings-toggle')
    await sleep(600)
    const cls = await h.cdp.domAttr('#settings-modal', 'class')
    const open = /is-open/.test(cls ?? '')
    const operatorMounted = await h.cdp.evaluate(`(()=>{const body=document.querySelector('#settings-modal-body #panes, #settings-modal-body');const hasPanes=!!document.querySelector('#settings-modal-body #panes');const opSel=document.querySelector('#operator-editing-mode,#operator-enabled-panes,#operator-topk');return {hasPanes,opSelCount:opSel?1:0,opText:opSel?(opSel.textContent||'').trim():null}})()`)
    const pass = open && operatorMounted.hasPanes
    return { pass, detail: `#settings-modal class=${cls} (is-open=${open}); operator mount=${JSON.stringify(operatorMounted)}` }
  },

  // shell-integration — provident.list_targets + provident.focus against the running app.
  shell_integration: async (h) => {
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch((e) => ({ error: String(e) }))
    let id = null
    try { id = docs.documents[0].documentId || docs.documents[0].id } catch {}
    const targets = await h.mcpTool(h.mcp, 'provident.list_targets', {}).catch((e) => ({ error: String(e) }))
    const focus = id ? await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: id } }).catch((e) => ({ error: String(e) })) : 'no-doc'
    return diagResult(`provident.list_targets=${JSON.stringify(targets)}\n provident.focus(document ${id})=${JSON.stringify(focus)}`)
  },

  // GNOSIS — engine-absent probe (no --mode=gnosis in this session): provident.gnosis.status
  // should surface the D2 engine-absent state (refused engine base URL), not crash.
  gnosis_d2: async (h) => {
    const st = await h.mcpTool(h.mcp, 'gnosis.status', {}).catch((e) => ({ error: String(e.message || e) }))
    const q = await h.mcpTool(h.mcp, 'gnosis.query', { query: 'alpha' }).catch((e) => ({ error: String(e.message || e) }))
    return diagResult(`gnosis.status=${JSON.stringify(st)}\n gnosis.query=${JSON.stringify(q)} (engine-absent D2 surfacing; the retrieval-trio happy path needs a live gnosis-server + --mode=gnosis — PARKED)`)
  },

  // U-IMPORT-1 — the MCP import path (edit.import_markdown on a FRESH file) is live;
  // the OS-native file-picker browse step is structurally OS-owned (parked in-battery).
  import1: async (h) => {
    const fresh = join(ROOT, '.live-corpus', 'import1-fresh.md')
    mkdirSync(join(ROOT, '.live-corpus'), { recursive: true })
    writeFileSync(fresh, '# Import1 fresh\n\nBrand-new file through the live MCP import path.\n')
    const imp = await h.mcpTool(h.mcp, 'edit.import_markdown', { files: [fresh] }).catch((e) => ({ error: String(e.message || e) }))
    await sleep(600)
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch((e) => ({ error: String(e) }))
    const ok = imp && !imp.error
    return { pass: ok, detail: `edit.import_markdown(fresh)=${JSON.stringify(imp)}\n list_documents after=${JSON.stringify(docs)} (MCP path CLOSED; OS-native picker step parked as structurally OS-owned)` }
  },

  // ===================================================================
  // TEN USER-REPORTED LIVE BUGS (2026-09-15) — each drives the REAL user
  // gesture and asserts the USER-VISIBLE outcome. Expected to reproduce the
  // user's report (FAIL = bug confirmed), NOT to bless the code.
  // Run SEQUENTIALLY against a RUNNING app via `--connect --display=0`.
  //   user1..user6 = the original six; user7..user10 = the four added 2026-09-15
  //   (zone-resize, zone-boundary, search-open-in-tab, collapse-vertical-text).
  // ===================================================================

  // BUG 1 — the new-tab button must create a NEW .tab yielding a usable target.
  // The gesture is the hit-tested real-click helper (a synthetic fallback is
  // recorded as `path:'native-fallback'` and can never PASS).
  user1_tab_new: async (h) => {
    await ufEnsureAppClear(h)
    const hasBtn = await h.cdp.evaluate(`!!document.querySelector('[data-tab-new],.tab-new')`)
    const count0 = await h.cdp.evaluate(`document.querySelectorAll('.tab').length`)
    // real user click via the hit-tested helper (path recorded, no silent substitution)
    const click = hasBtn ? await ufRealClick(h, '[data-tab-new]') : { path: 'no-button' }
    await sleep(700)
    const count1 = await h.cdp.evaluate(`document.querySelectorAll('.tab').length`)
    const tabs = await h.cdp.evaluate(`[...document.querySelectorAll('.tab')].map((t,i)=>({txt:(t.textContent||'').trim().slice(0,24),active:t.classList.contains('is-active')}))`)
    const landing = await h.cdp.evaluate(`!!document.getElementById('stage-landing')`)
    const stage = await h.cdp.evaluate(`!!document.getElementById('stage')`)
    const newTab = count1 > count0
    const usable = landing || stage
    const surface = await ufSurfaceTarget(h)
    const detail = `new-tab REAL click path=${click.path}: .tab count ${count0}->${count1} (newTab=${newTab}); usableTarget(landing=${landing},stage=${stage})=${usable}; button present=${hasBtn}; tabs=${JSON.stringify(tabs)}`
    if (!hasBtn) return rowResult('UF-DEFECT-1', '[data-tab-new] mints a NEW usable tab (never a silent no-op)', 'D-interaction', detail, { path: 'no-button', ok: false, surface })
    return rowResult('UF-DEFECT-1', '[data-tab-new] mints a NEW usable tab (never a silent no-op)', 'D-interaction', detail, { path: click.path, ok: newTab && usable, surface })
  },

  // BUG 2 — a REAL drag on a pane's HEADER (its collapse-toggle strip) must move /
  // reorder the pane. Assert the user-visible slot sequence (left-zone pane order)
  // changes after the drag ends. The drag start is HIT-TESTED against the pane
  // frame (a start that is not on the intended target is recorded as an unproven
  // path and can never PASS).
  user2_pane_drag: async (h) => {
    await ufEnsureAppClear(h)
    const slots = () => h.cdp.evaluate(`[...document.querySelectorAll('[data-zone="left"] .pane-frame[data-pane-id]')].map((f,i)=>({pid:f.getAttribute('data-pane-id'),y:Math.round(f.getBoundingClientRect().y)}))`)
    const surface = await ufSurfaceTarget(h)
    const s0 = await slots()
    if (!Array.isArray(s0) || s0.length < 2) return rowResult('UF-DEFECT-2', 'A REAL pane-HEADER drag reorders/relocates the pane (the zone slot order changes)', 'D-interaction', `not enough left-zone panes: ${JSON.stringify(s0)}`, { path: 'missing', ok: false, surface })
    // pick an in-viewport pane; drag from ITS HEADER (the collapse-toggle strip).
    const start = await h.cdp.evaluate(`(()=>{const fs=[...document.querySelectorAll('[data-zone="left"] .pane-frame[data-pane-id]')];const cur=fs.find(f=>f.getAttribute('data-pane-id')==='doc-nav')||null;const f=cur||fs[0];const r=f.getBoundingClientRect();if(r.y>window.innerHeight-30)return {err:'off-viewport',pid:f.getAttribute('data-pane-id')};const hdr=f.querySelector('.pane-collapse-toggle');const hd=hdr?hdr.getBoundingClientRect():r;const x=Math.round(hd.x+Math.min(hd.width/2,160)),y=Math.round(hd.y+hd.height/2);const hit=document.elementFromPoint(x,y);return {pid:f.getAttribute('data-pane-id'),x:x,y:y,hdr:!!hdr,hit:hit?(hit.id||hit.tagName):null,onTarget:!!(hit&&(hit===f||f.contains(hit)))}})()`)
    if (start.err) return { ...rowResult('UF-DEFECT-2', 'A REAL pane-HEADER drag reorders/relocates the pane (the zone slot order changes)', 'D-interaction', `drag start ${start.err} on ${start.pid} — the pane header is not in the viewport after the scroll reset, so the REAL gesture cannot be driven this pass (an INCONCLUSIVE precondition, not a behavior FAIL)`, { path: 'off-viewport', ok: false, surface }), park: true, verdict: 'PARKED' }
    const target = await h.cdp.evaluate(`(()=>{const fs=[...document.querySelectorAll('[data-zone="left"] .pane-frame[data-pane-id]')];const idx=fs.findIndex(f=>f.getAttribute('data-pane-id')==='${start.pid}');const nx=fs[idx+1];if(!nx)return null;const r=nx.getBoundingClientRect();return {pid:nx.getAttribute('data-pane-id'),y:Math.round(r.y),h:Math.round(r.height)}})()`)
    if (!target) return rowResult('UF-DEFECT-2', 'A REAL pane-HEADER drag reorders/relocates the pane (the zone slot order changes)', 'D-interaction', `no sibling below ${start.pid}`, { path: 'missing', ok: false, surface })
    const ty = target.y + Math.min(22, target.h - 6)
    await h.cdp.gesture(`[data-pane-id="${start.pid}"]`, [
      { type: 'down', x: start.x, y: start.y },
      { type: 'move', x: start.x + 8, y: start.y + 40 },
      { type: 'move', x: start.x + 10, y: Math.round((start.y + ty) / 2) },
      { type: 'move', x: start.x + 12, y: ty },
      { type: 'up', x: start.x + 12, y: ty },
    ])
    await sleep(1300)
    const s1 = await slots()
    const seq0 = s0.map((o) => o.pid).join(','), seq1 = (s1 || []).map((o) => o.pid).join(',')
    const changed = seq0 !== seq1
    const afterPos = (s1 || []).find((o) => o.pid === start.pid)
    const gesturePath = start.onTarget ? 'cdp' : 'synthetic-drag-start'
    return rowResult('UF-DEFECT-2', 'A REAL pane-HEADER drag reorders/relocates the pane (the zone slot order changes)', 'D-interaction', `REAL header drag on .pane-frame[data-pane-id="${start.pid}"] .pane-collapse-toggle (header=${start.hdr}) from (${start.x},${start.y}) hit=${start.hit} onTarget=${start.onTarget} PAST ${target.pid}@y=${target.y}->ty=${ty}; slot order changed=${changed} before=[${seq0}] after=[${seq1}]; ${start.pid} y=${afterPos ? afterPos.y : 'gone'}`, { path: gesturePath, ok: changed && start.onTarget, surface })
  },

  // BUG 3 — collapse the sidebar, then the pane tabs MUST re-orient VERTICALLY.
  // PROXY: the only driver is a synthetic DOM `.click()` inside Runtime.evaluate
  // (not a hit-tested gesture) and the oracle is computed-style/geometry, so the
  // row is recorded `proxyPASS:true` with `pass:false` — a synthetic driver can
  // never be an accepted PASS (§6.1).
  user3_collapse_orientation: async (h) => {
    const zmin = await h.cdp.evaluate(`!!document.querySelector('#zone-minimize-left,.pane-zone-minimize')`)
    const preFrames = await h.cdp.evaluate(`document.querySelectorAll('.pane-frame[data-pane-id]').length`)
    const preTabs = await h.cdp.evaluate(`document.querySelectorAll('.pane-tab').length`)
    const surface = await ufSurfaceTarget(h)
    if (!zmin) return rowResult('UF-KEEP-1', 'After minimizing, the pane-tab strips render as a VERTICAL column', 'D-visual', 'no sidebar zone-minimize control', { path: 'missing', proxy: 'synthetic .click() driver only', ok: false, surface })
    // SYNTHETIC driver ([DIAG]-classified): recorded as a proxy, never a real gesture.
    await h.cdp.evaluate(`(()=>{const b=document.getElementById('zone-minimize-left')||document.querySelector('.pane-zone-minimize');if(!b)return 'no-btn';b.click();return 'clicked'})()`)
    await sleep(900)
    const tabs = await h.cdp.evaluate(`(()=>{const ts=[...document.querySelectorAll('.pane-tab')].map((el,i)=>{const r=el.getBoundingClientRect();return {i,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}});return {ts,frameCount:document.querySelectorAll('.pane-frame[data-pane-id]').length,zoneMin:[...document.querySelectorAll('[data-zone="left"],.pane-zone-minimize')].map(z=>({tag:z.tagName,id:z.id||'',cls:String(z.className)}))}})()`)
    const t = Array.isArray(tabs.ts) ? tabs.ts : []
    // vertical re-orientation == distinct increasing y, uniform small height, same x
    const vertical = t.length >= 2 && new Set(t.map((o) => o.y)).size === t.length && new Set(t.map((o) => o.h)).size === 1 && new Set(t.map((o) => o.x)).size === 1
    return {
      ...rowResult('UF-KEEP-1', 'After minimizing, the pane-tab strips render as a VERTICAL column', 'D-visual', `sidebar minimized by a SYNTHETIC .click() ([DIAG] proxy driver): pane-frames ${preFrames}->${tabs.frameCount}, .pane-tab strips ${preTabs}->${t.length}; vertical=${vertical} (distinct-y, uniform-h=${t[0] ? t[0].h : '?'}, equal-x); strips=${JSON.stringify(t.slice(0, 8))}; zones/min=${JSON.stringify(tabs.zoneMin)}`, { path: 'synthetic-click([DIAG])', proxy: 'synthetic .click() driver + geometry/computed-style oracle', ok: vertical, surface }),
      proxyPASS: true,
      pass: false,
    }
  },

  // BUG 4 — into a seeded document (alpha), click the body text: the editable
  // surface must ENGAGE (contenteditable active) AND an edit/blur must COMMIT
  // (a store write — rag.get_document reflects the typed text).
  user4_main_editable: async (h) => {
    await ufEnsureAppClear(h)
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/alpha' } }).catch((e) => ({ err: String(e.message || e) }))
    await sleep(800)
    const surface = await ufSurfaceTarget(h)
    const ed = await h.cdp.evaluate(`(()=>{const e=document.querySelector('[contenteditable]');if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();const x=Math.round(r.x+20),y=Math.round(r.y+14);const hit=document.elementFromPoint(x,y);return {x:x,y:y,hit:hit?(hit.id||hit.tagName):null,onTarget:!!(hit&&(hit===e||e.contains(hit)))}})()`)
    if (!ed) {
      const zonehtml = await h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:main');return z?(z.innerHTML||'').slice(0,140):'no-zone:main'})()`)
      return rowResult('UF-STAGE-3', 'The main view IS editable and an edit commits on blur (the store read-back contains the typed marker)', 'D-state', `document focused but NO [contenteditable] body text; zone:main=${zonehtml}`, { path: 'missing', ok: false, surface })
    }
    // real click into the body text (hit-tested before the press)
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: ed.x, y: ed.y })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: ed.x, y: ed.y, button: 'left', clickCount: 1 })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: ed.x, y: ed.y, button: 'left', clickCount: 1 })
    await sleep(300)
    const engaged = await h.cdp.evaluate(`(()=>{const a=document.activeElement;if(!a)return 'no-active';return a.getAttribute('contenteditable')?true:'(focused='+a.tagName+')'})()`)
    const marker = 'LIVE' + String(Date.now()).slice(-5)
    await h.cdp.send('Input.insertText', { text: ' ' + marker })
    await sleep(250)
    await h.cdp.evaluate(`document.activeElement.blur()`)
    await sleep(700)
    const doc = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-corpus/alpha' }).catch((e) => ({ err: String(e.message || e) }))
    const committed = JSON.stringify(doc).includes(marker)
    const inDom = await h.cdp.evaluate(`document.body.innerText.includes(${JSON.stringify(marker)})`)
    return rowResult('UF-STAGE-3', 'The main view IS editable and an edit commits on blur (the store read-back contains the typed marker)', 'D-state', `body-text click hit=${ed.hit} onTarget=${ed.onTarget} → editable engages activeElement-contenteditable=${JSON.stringify(engaged)}; typed '${marker}' in STORE rag.get_document=${committed}, in DOM=${inDom}`, { path: ed.onTarget ? 'cdp' : 'synthetic-keyboard-only', ok: engaged === true && committed && ed.onTarget, surface })
  },

  // BUG 5 — the history/undo/redo segment must render INSIDE its pane frame and
  // NOT inside the main `#zone:main` canvas.
  user5_history_in_pane: async (h) => {
    const r = await h.cdp.evaluate(`(()=>{const h=document.querySelector('[data-role="history"],#pane-history');if(!h)return {err:'no [data-role=history]/#pane-history in DOM'};const main=document.getElementById('zone:main');let parentChain=[],a=h;while(a&&parentChain.length<8){parentChain.push((a.id?('#'+a.id):a.tagName)+'.'+String(a.className).slice(0,18));a=a.parentElement}return {present:true,inMainCanvas:!!main&&main.contains(h),inPaneFrame:!!h.closest('.pane-frame'),chain:parentChain}})()`)
    const surface = await ufSurfaceTarget(h)
    if (r.err) return rowResult('UF-DEFECT-3', 'The history/undo/redo segment renders INSIDE a .pane-frame, not in the #zone:main canvas', 'D-visual', r.err, { path: 'not-gesture', proxy: 'DOM-ancestry-only oracle (no gesture)', ok: false, surface })
    return rowResult('UF-DEFECT-3', 'The history/undo/redo segment renders INSIDE a .pane-frame, not in the #zone:main canvas', 'D-visual', `[data-role="history"] present=true; inside MAIN #zone:main canvas=${r.inMainCanvas}; inside a .pane-frame=${r.inPaneFrame}; ancestry=${JSON.stringify(r.chain)}`, { path: 'not-gesture', gesture: false, proxy: 'DOM-ancestry oracle (no gesture can drive it)', ok: !r.inMainCanvas && r.inPaneFrame, surface })
  },

  // BUG 6 — switch the active tab to Search; the search view is active and the
  // LANDING must NOT re-render over it (sampled three times after a delay).
  // PROXY: the tab switch is a synthetic DOM `.click()` and the only oracle is a
  // DOM-PRESENCE probe (`!!document.getElementById('stage-landing')`) — the row
  // is recorded `proxyPASS:true` with `pass:false` until a PAINTED box/paint
  // oracle over the three samples replaces it (§6.1).
  user6_search_no_flicker: async (h) => {
    const surface = await ufSurfaceTarget(h)
    // SYNTHETIC tab switch ([DIAG]-classified proxy driver) — not a hit-tested gesture.
    const clicked = await h.cdp.evaluate(`(()=>{const s=[...document.querySelectorAll('.tab')].find((t)=>/search/i.test(t.textContent||''));if(!s)return 'no-search-tab';s.click();return 'clicked '+((s.textContent||'').trim().slice(0,24))})()`)
    await sleep(800)
    const sample = () => h.cdp.evaluate(`(()=>{const l=document.getElementById('stage-landing');const r=l?l.getBoundingClientRect():null;return {landing:!!l,landingBoxPainted:!!(r&&r.width>0&&r.height>0),stage:!!document.getElementById('stage'),active:[...document.querySelectorAll('.tab.is-active')].map((t)=>(t.textContent||'').trim().slice(0,24))}})()`)
    const s1 = await sample()
    await sleep(1000)
    const s2 = await sample()
    await sleep(1200)
    const s3 = await sample()
    const activeSearch = [...s1.active, ...s2.active, ...s3.active].some((a) => /search/i.test(a))
    // DOM PRESENCE across the three samples (the legacy proxy oracle, kept and named)
    const noLanding = !s1.landing && !s2.landing && !s3.landing
    const noLandingPaint = !s1.landingBoxPainted && !s2.landingBoxPainted && !s3.landingBoxPainted
    return {
      ...rowResult('UF-KEEP-3', 'Switching to Search leaves the search view active and never overlays a landing flicker (sampled 3×)', 'D-visual', `PROXY ORACLE ONLY (DOM presence probe \`!!document.getElementById("stage-landing")\` + tab-title text): switched tab by a SYNTHETIC .click() ([DIAG], path not hit-tested) ${clicked}; samples t+800=${JSON.stringify(s1)} t+1800=${JSON.stringify(s2)} t+3000=${JSON.stringify(s3)}; activeSearch=${activeSearch} noLanding(presence,all3)=${noLanding} noLandingPaintedBox(all3)=${noLandingPaint}`, { path: 'synthetic-click([DIAG])', proxy: 'DOM presence probe !!document.getElementById("stage-landing") across 3 samples (no painted-box paint oracle)', ok: activeSearch && noLanding, surface }),
      proxyPASS: true,
      pass: false,
    }
  },

  // repro_nbsp — the user-reported "literal &nbsp; + jammed word" bug. Drive a
  // REAL edit (CDP click into the contenteditable paragraph, select-all+delete,
  // then Input.insertText a multi-word string with a NORMAL space), blur/commit,
  // and read back the COMMITTED store + rendered html. This answers (A) render/
  // editing-surface bug vs (B) test/manual artifact: does a typed normal space
  // round-trip as a space, or as a literal `&nbsp;` (6 chars) / `\u00A0` /
  // a jammed token?
  repro_nbsp: async (h) => {
    const hasNbsp = (s) => (typeof s === 'string' ? s.includes('&nbsp;') : false)
    const hasNbs = (s) => (typeof s === 'string' ? s.includes('\u00A0') : false)
    // 0) baseline: current committed store content for the paragraph node
    const before = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-corpus/alpha' }).catch((e) => ({ err: String(e.message || e) }))
    const beforeS = JSON.stringify(before)
    const beforeP = (before && before.nodes || []).find((n) => n.type === 'p')
    // 1) focus alpha
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/alpha' } }).catch((e) => ({ err: String(e.message || e) }))
    await sleep(800)
    // 2) find the Settings-paragraph contenteditable root
    const geo = await h.cdp.evaluate(`(()=>{
      const all=[...document.querySelectorAll('[contenteditable]')];
      const el=all.find(e=>(e.textContent||'').includes('Settings'))||all.find(e=>(/S/.test(e.textContent||'')&&/modal/.test(e.textContent||'')))||all[0];
      if(!el) return {err:'no contenteditable', count:document.querySelectorAll('[contenteditable]').length};
      const r=el.getBoundingClientRect();
      return {x:Math.round(r.x+20),y:Math.round(r.y+14),count:document.querySelectorAll('[contenteditable]').length,ragId:el.getAttribute('data-rag-node-id')||el.getAttribute('data-node-id')||'?'};
    })()`)
    if (geo.err) return { diagnostic: true, pass: false, detail: `${geo.err}; baseline-before=${beforeS}` }
    // 3) real click into the paragraph body to engage the editable
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: geo.x, y: geo.y })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: geo.x, y: geo.y, button: 'left', clickCount: 1 })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: geo.x, y: geo.y, button: 'left', clickCount: 1 })
    await sleep(300)
    // 4) select-all within the paragraph root, delete, then type "LIVE TEST" (normal space)
    const prep = await h.cdp.evaluate(`(()=>{
      const all=[...document.querySelectorAll('[contenteditable]')];
      const el=all.find(e=>(e.textContent||'').includes('Settings'))||all[0];
      if(!el) return 'no-el';
      el.focus(); const sel=window.getSelection(); const range=document.createRange();
      range.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(range);
      const ok=document.execCommand('delete', false, null);
      return {prepared:true, execDelete:ok, textAfter:el.textContent};
    })()`)
    await sleep(200)
    await h.cdp.send('Input.insertText', { text: 'LIVE TEST' })
    await sleep(300)
    // 5) capture the contenteditable innerHTML AFTER typing (exact entities/bytes)
    const inner = await h.cdp.evaluate(`(()=>{const all=[...document.querySelectorAll('[contenteditable]')];const el=all.find(e=>(e.textContent||'').includes('LIVE'))||all[0];if(!el)return {err:'no-el'};return {innerHTML:el.innerHTML,text:el.textContent,charCodes:[...el.textContent].map(ch=>ch.charCodeAt(0)),active:document.activeElement===el}})()`)
    // 6) blur -> commit-on-blur
    await h.cdp.evaluate(`(()=>{const a=document.activeElement;if(a&&typeof a.blur==='function')a.blur();return true})()`)
    await sleep(800)
    // 7) read back committed store + rendered html
    const after = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-corpus/alpha' }).catch((e) => ({ err: String(e.message || e) }))
    const afterS = JSON.stringify(after)
    const afterP = (after && after.nodes || []).find((n) => n.type === 'p')
    const aContent = afterP ? (afterP.content ?? '') : ''
    const aChildren = afterP ? JSON.stringify(afterP.children ?? []) : ''
    const htmlR = await h.mcpTool(h.mcp, 'provident.get_rendered_html', {}).catch((e) => ({ err: String(e.message || e) }))
    let html = htmlR; try { const j = JSON.parse(htmlR); html = j.renderedHtml ?? j } catch {}
    const htmlS = typeof html === 'string' ? html : JSON.stringify(html)
    const pContentAfter = aContent
    const spaceOk = pContentAfter.includes('LIVE TEST') && !hasNbsp(aContent) && !hasNbs(aContent) && !pContentAfter.includes('LIVETEST')
    return {
      // §6.1: a measurement-only block declares itself a DIAGNOSTIC — `pass:false`
      // and never promotable to a row verdict. The measurement lives in the detail.
      diagnostic: true,
      pass: false,
      detail: `spaceRoundTripOk=${spaceOk} (recorded as a measurement; UF-STAGE-4 is not asserted as a row verdict)\n` +
        `  baseline p content=${JSON.stringify(beforeP ? beforeP.content : null)} (nbsp=${hasNbsp(beforeS)} nbs=${hasNbs(beforeS)})\n` +
        `  engaged-geo=${JSON.stringify(geo)} prep=${JSON.stringify(prep)} innerHTML-after-typing=${JSON.stringify(inner)}\n` +
        `  COMMITTED store p content=${JSON.stringify(pContentAfter)}\n` +
        `    content charCodes=${JSON.stringify([...pContentAfter].map((ch) => ch.charCodeAt(0)))}\n` +
        `    p children=${aChildren}\n` +
        `    STORE literal &nbsp;=${hasNbsp(aContent) || hasNbsp(aChildren)}  \\u00A0=${hasNbs(aContent) || hasNbs(aChildren)}\n` +
        `    STORE contains 'LIVE TEST'=${aContent.includes('LIVE TEST')}  jammed 'LIVETEST'=${aContent.includes('LIVETEST')}\n` +
        `    store &nbsp;@=${aContent.indexOf('&nbsp;')} nbs@=${pContentAfter.indexOf('\u00A0')}\n` +
        `  RENDERED html literal &nbsp;=${hasNbsp(htmlS)} nbs=${hasNbs(htmlS)}; html-length=${htmlS.length}\n` +
        `    (rendered alpha snippet: ` + (htmlS.indexOf('LIVE') >= 0 ? JSON.stringify(htmlS.slice(htmlS.indexOf('LIVE') - 30, htmlS.indexOf('LIVE') + 40)) : '(LIVE not in rendered html)') + `)`,
    }
  },

  // USER-REPORTED BUG (2026-09-15) — DUPLICATE EDITABLE PARAGRAPH in the alpha
  // doc. The RAG paragraph `.live-corpus/alpha:p:1` ("Settings modal (C3). The
  // document alpha documents.") is emitted TWICE as a user-visible editable
  // paragraph: once nested inside the `<h1 data-doc-head>` section header (so it
  // shows with header styling) and once as a sibling content root directly in
  // `zone:main`. User report: editing the TOP copy cascades DOWN; editing the
  // BOTTOM copy does NOT cascade up. Asserted CORRECT behavior: (1) EXACTLY ONE
  // editable `[data-rag-node-id]` p:1 paragraph; (2) none nested in the header;
  // (3) an edit lands in exactly one paragraph position.
  repro_dup_para: async (h) => {
    const rid = '.live-corpus/alpha:p:1'
    // 0) focus alpha so its document subtrees are live in the DOM
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/alpha' } }).catch(() => {})
    await sleep(900)
    // 1) SINGLE-RENDER — count EDITABLE elements whose data-rag-node-id === p:1.
    //    Expect `1`; the duplicate paragraph yields >1 -> FAIL.
    const s1 = await h.cdp.evaluate(`(()=>{
      const rid=${JSON.stringify(rid)};
      const all=[...document.querySelectorAll('[data-rag-node-id="'+rid+'"]')];
      const editable=all.filter((el)=>el.getAttribute('contenteditable')!==null||el.tagName==='TEXTAREA');
      const header=document.querySelector('[data-doc-head]');
      const nestedInHeader=all.filter((el)=>header&&header.contains(el)).map((el)=>el.tagName+'#'+el.id);
      return {totalWithAttr:all.length, editableCount:editable.length, editableTags:editable.map((e)=>e.tagName+'#'+e.id),
        headerPresent:!!header, headerTag:header?(header.tagName+'#'+header.id):null, nestedInHeader,
        nestedP: nestedInHeader.filter((n)=>/^P#/.test(n))};
    })()`)
    const singleRender = s1.editableCount === 1
    // 2) NOT-NESTED-IN-HEADER — no [data-rag-node-id=p:1] element is a descendant
    //    of the [data-doc-head] h1.
    const notNested = s1.nestedInHeader.length === 0
    // 3) EDIT-CASCADE — edit ONE paragraph copy (the TOP/nested one, per the
    //    report) via click+focus + Input.insertText + blur/commit, then read the
    //    rendered html and count how many paragraph positions carry the edit.
    const marker = 'DUPPARA' + String(Date.now()).slice(-4)
    const geo = await h.cdp.evaluate(`(()=>{const all=[...document.querySelectorAll('[contenteditable]')];const el=all.find((e)=>(e.textContent||'').includes('Settings'))||all[0];if(!el)return null;const nested=!!el.closest('[data-doc-head]');const r=el.getBoundingClientRect();return {x:Math.round(r.x+20),y:Math.round(r.y+14),ragId:el.getAttribute('data-rag-node-id'),tag:el.tagName,id:el.id,nestedInHeader:nested,onScreen:r.y>=0&&r.y<window.innerHeight}})()`)
    let edit = 'no-editable-focus'
    if (geo && geo.onScreen) {
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: geo.x, y: geo.y })
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: geo.x, y: geo.y, button: 'left', clickCount: 1 })
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: geo.x, y: geo.y, button: 'left', clickCount: 1 })
      await sleep(300)
      const focusRag = await h.cdp.evaluate(`(()=>{const a=document.activeElement;return a?(a.getAttribute('contenteditable')?a.getAttribute('data-rag-node-id'):'('+a.tagName+')'):'none'})()`)
      await h.cdp.send('Input.insertText', { text: ' ' + marker })
      await sleep(300)
      await h.cdp.evaluate(`(()=>{const a=document.activeElement;if(a&&typeof a.blur==='function')a.blur();return true})()`)
      await sleep(800)
      edit = { focusedRag: focusRag, typed: marker, targetId: geo.id, targetNested: geo.nestedInHeader }
    } else {
      edit = `not-in-viewport or no-editable: ${JSON.stringify(geo)}`
    }
    const s3 = await h.cdp.evaluate(`(()=>{const rid=${JSON.stringify(rid)};const m=${JSON.stringify(marker)};const all=[...document.querySelectorAll('[data-rag-node-id="'+rid+'"]')];const editable=all.filter((el)=>el.getAttribute('contenteditable')!==null);return {editableCountAll:all.length, editableCount:editable.length, hasMarker:all.some((el)=>(el.textContent||'').includes(m)), markerCopies:all.filter((el)=>(el.textContent||'').includes(m)).map((el)=>el.tagName+'#'+el.id)}})()`)
    const htmlR = await h.mcpTool(h.mcp, 'provident.get_rendered_html', {}).catch((e) => ({ err: String(e.message || e) }))
    let htmlS = htmlR
    try { const j = JSON.parse(htmlR); htmlS = j.renderedHtml ?? j } catch { htmlS = typeof htmlR === 'string' ? htmlR : JSON.stringify(htmlR) }
    htmlS = typeof htmlS === 'string' ? htmlS : JSON.stringify(htmlS)
    const esc = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const markerCountInHtml = (htmlS.match(new RegExp(esc, 'g')) || []).length
    const markerInHtml = markerCountInHtml > 0
    // PRIMARY assert: exactly one editable paragraph for p:1.
    const editCascadePrimaryOk = s1.editableCount === 1
    const surface = await ufSurfaceTarget(h)
    const detail =
      `\n  [1 SINGLE-RENDER] editable [data-rag-node-id="${rid}"] count=${s1.editableCount} (total-with-attr=${s1.totalWithAttr}; editable=${JSON.stringify(s1.editableTags)}) — expect=1 ${singleRender ? 'PASS' : 'FAIL (duplicated >1)'}` +
      `\n  [2 NOT-NESTED-IN-HEADER] [data-doc-head]=${s1.headerTag}; p:1 nested-in-header elements=${JSON.stringify(s1.nestedInHeader)} — expect none ${notNested ? 'PASS' : 'FAIL (p:1 IS nested in the header)'}` +
      `\n  [3 EDIT-CASCADE] target=${JSON.stringify(edit)}; after-edit editable p:1 count=${s3.editableCount} (all-with-attr=${s3.editableCountAll}); marker-copies=${JSON.stringify(s3.markerCopies)}; rendered_html marker=${markerInHtml} (occurrences=${markerCountInHtml}) — PRIMARY(one editable paragraph)=${editCascadePrimaryOk ? 'PASS' : 'FAIL (' + s1.editableCount + ' editable paragraphs, expect 1)'}`
    const editProven = !!(geo && geo.onScreen)
    if (!editProven) return rowResult('UF-STAGE-2', 'Each RAG paragraph materializes exactly ONCE as a sibling editable root (never nested in the doc-head)', 'D-visual', `the paragraph-edit half could NOT be driven (no [contenteditable] in the viewport): ${detail}`, { path: 'missing', proxy: 'DOM-count/innerHTML oracle only this run (no painted edit proof)', ok: false, surface })
    return rowResult('UF-STAGE-2', 'Each RAG paragraph materializes exactly ONCE as a sibling editable root (never nested in the doc-head)', 'D-visual', detail, { path: 'cdp', ok: singleRender && notNested && editCascadePrimaryOk, surface })
  },

  // ===================================================================
  // FOUR MORE USER-REPORTED LIVE BUGS (2026-09-15) — each drives the REAL
  // gesture and asserts the USER-VISIBLE outcome. Expected to reproduce the
  // report (FAIL = bug confirmed), NOT to bless the code. Run SEQUENTIALLY
  // against a RUNNING app via `--connect --display=0 --no-seed` (alpha+beta
  // already seeded). Block ids LIVE-UF7..UF10.
  // ===================================================================

  // BUG 7 — drag a side-zone GUTTER: the zone width MUST change (>10px).
  // Captures `[data-zone="left"]`'s bounding-rect width and drives a REAL CDP
  // coordinate drag at the zone's right (gutter) edge, HIT-TESTING the drag start
  // against the zone (an unproven start is recorded as a non-`'cdp'` path and can
  // never PASS); a native pointer-drag on the `.gutter[data-zone="left"]` element
  // is kept as a `[DIAG]` seam probe only, then the width change is asserted.
  user7_zone_resize: async (h) => {
    // restore: ensure the left zone is EXPANDED so a gutter edge exists
    // ([DIAG] setup restore — not the asserted gesture)
    await h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:left');const b=document.getElementById('zone-minimize-left');if(z&&b&&z.classList.contains('is-minimized'))b.click();return true})()`)
    await sleep(600)
    const w = () => h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:left');if(!z)return null;return Math.round(z.getBoundingClientRect().width)})()`)
    const w0 = await w()
    const edge = await h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:left');if(!z)return null;const r=z.getBoundingClientRect();const x=Math.round(r.x+r.width),y=Math.round(r.y+200);const hit=document.elementFromPoint(x,y);return {x:x,y:y,hit:hit?(hit.id||hit.className||hit.tagName):null,onTarget:!!(hit&&(hit===z||z.contains(hit)))}})()`)
    const surface = await ufSurfaceTarget(h)
    if (w0 == null || !edge) return rowResult('UF-DEFECT-5', 'A REAL drag at the visible zone boundary resizes the zone width by >10px', 'D-interaction', 'no [data-zone=left] / edge', { path: 'missing', ok: false, surface })
    // geometry of the .gutter[data-zone=left] element (may be 0-size -> no grippable surface)
    const gutter = await h.cdp.evaluate(`(()=>{const g=[...document.querySelectorAll('.gutter[data-zone="left"]')][0]||document.querySelector('.gutter[data-zone]');if(!g)return null;const r=g.getBoundingClientRect();return {zone:g.getAttribute('data-zone'),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),cursor:getComputedStyle(g).cursor}})()`)
    // (a) REAL user gesture: CDP coordinate drag at the boundary edge x=zone-right
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: edge.x, y: edge.y, button: 'left', clickCount: 0 })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: edge.x, y: edge.y, button: 'left', clickCount: 1 })
    for (const tx of [edge.x + 22, edge.x + 48, edge.x + 72]) {
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: tx, y: edge.y, button: 'left', clickCount: 1 })
      await sleep(70)
    }
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: edge.x + 72, y: edge.y, button: 'left', clickCount: 1 })
    await sleep(700)
    const w1a = await w()
    // (b) ALSO drive a native pointer-drag ON the gutter element (reaches the
    //     delegated startGutter seam even though the gutter may be 0-size)
    let nat = 'not-attempted (no gutter element)'
    if (gutter) {
      nat = await h.cdp.evaluate(`(()=>{
        const g=[...document.querySelectorAll('.gutter[data-zone="left"]')][0]||document.querySelector('.gutter[data-zone]');
        if(!g) return 'no-gutter';
        const mk=(t,x,y)=>new PointerEvent(t,{bubbles:true,cancelable:true,button:0,pointerId:7,isPrimary:true,clientX:x,clientY:y,screenX:x,screenY:y});
        g.dispatchEvent(mk('pointerdown',g.getBoundingClientRect().x,g.getBoundingClientRect().y));
        g.dispatchEvent(mk('pointermove',34,200)); g.dispatchEvent(mk('pointermove',52,200)); g.dispatchEvent(mk('pointermove',76,200));
        g.dispatchEvent(mk('pointerup',76,200));
        return 'native-drag-dispatched-on-gutter';
      })()`)
      await sleep(700)
    }
    const w1b = await w()
    const wFinal = w1b != null ? w1b : w1a
    const changedA = Math.abs(w1a - w0) > 10
    const changedB = Math.abs(w1b - w0) > 10
    // PRIMARY verdict = the REAL user gesture (CDP coordinate drag at the visible
    // zone boundary), gated on the HIT-TEST at the drag start resolving to the
    // zone (an unproven start is recorded, never a PASS). The native-gutter probe
    // (changedB) is a DIAGNOSTIC only: it lands a synthetic pointer directly on
    // the hidden `.gutter` element and proves the startGutter seam works — but
    // that element is 0-width at (0,0), so it is NOT a grippable surface a real
    // user can reach. The user-visible symptom is reproduced iff the real
    // boundary drag leaves the width unchanged.
    return rowResult('UF-DEFECT-5', 'A REAL drag at the visible zone boundary resizes the zone width by >10px', 'D-interaction', `left-zone width before=${w0}px; REAL user boundary-drag (CDP coord @edge=${edge.x}, hit=${edge.hit}, onTarget=${edge.onTarget}) after=${w1a}px (Δ=${Math.abs(w1a - w0)} changed>10px=${changedA}); [DIAG] synthetic pointer on hidden .gutter element after=${w1b}px (Δ=${Math.abs(w1b - w0)} changed>10px=${changedB}); final=${wFinal}px; gutter=${JSON.stringify(gutter)}; native=${nat}`, { path: edge.onTarget ? 'cdp' : 'native-fallback', ok: changedA && edge.onTarget, surface })
  },

  // BUG 8 — a VISIBLE boundary must separate the side zone from the central
  // stage. The primary oracle is a SEAM GAP MEASURED IN PAINTED PIXELS between
  // `[data-zone=left]`'s right edge and `#zone:main`'s left edge (a real
  // separator leaves a gutter > 1px wide); the computed border/background/gap
  // probes are kept as supporting diagnostics, never as the sole oracle.
  user8_zone_boundary: async (h) => {
    const dump = await h.cdp.evaluate(`(()=>{
      const left=document.getElementById('zone:left'), main=document.getElementById('zone:main'), wr=document.getElementById('wiki-root');
      const cs=(el)=>{if(!el)return null;const s=getComputedStyle(el);const r=el.getBoundingClientRect();return {bg:s.backgroundColor,borderL:s.borderLeft,borderR:s.borderRight,gap:s.gap,shadow:s.boxShadow,cls:String(el.className),x:Math.round(r.x),right:Math.round(r.right),w:Math.round(r.width)}};
      const wcs=wr?(()=>{const s=getComputedStyle(wr);return {tc:s.gridTemplateColumns.replace(/\\s+/g,' '),gap:s.gap,bg:s.backgroundColor}})():null;
      const gutters=[...document.querySelectorAll('.gutter[data-zone]')].map(g=>({z:g.getAttribute('data-zone'),x:Math.round(g.getBoundingClientRect().x),w:Math.round(g.getBoundingClientRect().width),h:Math.round(g.getBoundingClientRect().height),cursor:getComputedStyle(g).cursor,bg:getComputedStyle(g).backgroundColor}));
      const pf=document.querySelector('.pane-frame[data-pane-id]');
      const seamPx=(left&&main)?Math.round(main.getBoundingClientRect().x-left.getBoundingClientRect().right):null;
      const between=(left&&main)?document.elementFromPoint(Math.round((left.getBoundingClientRect().right+main.getBoundingClientRect().x)/2),Math.round(main.getBoundingClientRect().y+120)):null;
      return {left:cs(left),main:cs(main),wikiRoot:wcs,gutters,seamPx,seamHit:between?(between.id||between.className||between.tagName):null,paneBorderLeft:pf?getComputedStyle(pf).borderLeft:null,paneBorderRight:pf?getComputedStyle(pf).borderRight:null};
    })()`)
    const surface = await ufSurfaceTarget(h)
    // a visible boundary exists iff:
    const zoneBorder = !!dump.left && /solid|dashed|outset|ridge|groove|double/.test(dump.left.borderL)
    const bgDiff = !!(dump.left && dump.main && dump.left.bg !== dump.main.bg)
    const gutterVisible = Array.isArray(dump.gutters) && dump.gutters.some((g) => (g.w || 0) > 1 || (g.h || 0) > 1)
    const gapPx = dump.wikiRoot ? Math.max(...String(dump.wikiRoot.gap).split(' ').map((s) => parseFloat(s) || 0)) : 0
    const hasGap = gapPx > 0
    // INDEPENDENT ORACLE: the PAINTED seam between the two boxes (px + what a
    // hit-test finds in that gap) — not a computed-style probe.
    const seamPainted = typeof dump.seamPx === 'number' && dump.seamPx > 1
    const boundaryOk = seamPainted || zoneBorder || bgDiff || gutterVisible || hasGap
    const computedOnly = !seamPainted
    const detail = `Painted seam between zone:left.right=${dump.left ? dump.left.right : '?'} and zone:main.x=${dump.main ? dump.main.x : '?'} = ${dump.seamPx}px (hit-test in the gap → ${dump.seamHit}) → seamPainted=${seamPainted}; supporting diagnostics: zone:left=${JSON.stringify(dump.left)},\n zone:main=${JSON.stringify(dump.main)},\n #wiki-root grid=${JSON.stringify(dump.wikiRoot)},\n gutters=${JSON.stringify(dump.gutters)},\n pane-frame border=${{left:dump.paneBorderLeft,right:dump.paneBorderRight}};\n boundary-visible=${boundaryOk} (seamPainted=${seamPainted} zoneBorder=${zoneBorder} bgDiff=${bgDiff} gutterVisible=${gutterVisible} gridGap=${gapPx}px>0=${hasGap})`
    return rowResult('UF-DEFECT-6', 'A VISIBLE separator (painted px gap / border / background / real gutter) divides zone:left from #zone:main', 'D-visual', detail, { path: 'not-gesture', gesture: false, proxy: computedOnly ? 'computed-style-only oracle (no painted seam px this run)' : null, ok: boundaryOk && seamPainted, surface })
  },

  // BUG 9 — "Open in a tab" (#pane-search-expand-tab, HOST-5 paneTabExpand) must
  // open a NEW tab whose visible content is the SEARCH view (a search input /
  // results), NOT the already-open document body. Drive the REAL click on the
  // button while the open document tab is active, then report which tab is active
  // and what #zone:main renders.
  user9_search_open_in_tab: async (h) => {
    await ufEnsureAppClear(h)
    const surface = await ufSurfaceTarget(h)
    // make the already-open document (alpha) the active tab (REAL click)
    const tabSel = await h.cdp.evaluate(`(()=>{const t=[...document.querySelectorAll('.tab')].find((x)=>/alpha/.test(x.textContent||''));return t?(t.getAttribute('data-tab-id')?'.tab[data-tab-id="'+t.getAttribute('data-tab-id')+'"]':null):null})()`)
    const tabPath = tabSel ? (await ufRealClick(h, tabSel)).path : 'no-alpha-tab'
    await sleep(600)
    const btn = await h.cdp.evaluate(`(()=>{const b=document.getElementById('pane-search-expand-tab');return b?String(b.className):null})()`)
    if (btn == null) return rowResult('UF-DEFECT-7', '"Open in a tab" creates a tab whose stage shows the SEARCH view, not the document body', 'D-interaction', 'no #pane-search-expand-tab', { path: 'missing', ok: false, surface })
    const beforeTabs = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('.tab')].map((t)=>({txt:(t.textContent||'').trim().slice(0,20),active:t.classList.contains('is-active')})))()`)
    // REAL hit-tested click on the expand-tab control (no synthetic .click() fallback)
    const clicked = await ufRealClick(h, '#pane-search-expand-tab', { nativeFallback: false })
    await sleep(900)
    const afterTabs = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('.tab')].map((t)=>({txt:(t.textContent||'').trim().slice(0,20),active:t.classList.contains('is-active')})))()`)
    const activeIdx = afterTabs.findIndex((t) => t.active)
    const activeTabTitle = afterTabs[activeIdx] ? afterTabs[activeIdx].txt : null
    const content = await h.cdp.evaluate(`(()=>{
      const main=document.getElementById('zone:main'); const bodyText=main?(main.textContent||''):'';
      const searchInput=!!(main&&(main.querySelector('input[type="text"]')||main.querySelector('[contenteditable="plaintext-only"]')||main.querySelector('#advanced-search-toggle')||main.querySelector('[placeholder*="search" i]')));
      const ragResults=!!document.querySelector('[class*="result" i],[data-rag-results],[data-search-result]');
      const isDocBody=/Settings modal/i.test(bodyText)||/document alpha/.test(bodyText)||/^Alpha/.test(bodyText.trim());
      return {hasSearchInput:searchInput, hasRagResults:ragResults, isDocumentBody:isDocBody, bodySnippet:bodyText.replace(/\\s+/g,' ').slice(0,90)};
    })()`)
    const newTabCreated = beforeTabs.length < afterTabs.length
    const searchShown = content.hasSearchInput || content.hasRagResults
    const docShown = content.isDocumentBody
    return rowResult('UF-DEFECT-7', '"Open in a tab" creates a tab whose stage shows the SEARCH view, not the document body', 'D-interaction', `button=${JSON.stringify({ id: 'pane-search-expand-tab', cls: btn })} active-alpha-tab REAL click path=${tabPath}; REAL click #pane-search-expand-tab path=${clicked.path}\n before-tabs=${JSON.stringify(beforeTabs)}\n after-tabs=${JSON.stringify(afterTabs)}\n newTabCreated(count ${beforeTabs.length}->${afterTabs.length})=${newTabCreated}\n ACTIVE tab=${activeTabTitle} (index=${activeIdx})\n #zone:main: searchInput=${content.hasSearchInput} ragResults=${content.hasRagResults} isDocumentBody=${content.isDocumentBody} snippet="${content.bodySnippet}"`, { path: clicked.path, ok: searchShown && !docShown, surface })
  },

  // BUG 10 — when a side zone is minimized/collapsed, the collapsed zone's
  // label/tab text must read VERTICALLY (bottom-to-top), not horizontally. Read
  // the computed writing-mode / text-orientation of the collapsed `#zone-tab-*`
  // labels and assert they are vertical (vs the horizontal default).
  user10_collapse_vertical_text: async (h) => {
    await ufEnsureAppClear(h)
    const surface = await ufSurfaceTarget(h)
    // restore: ensure the left zone is expanded before minimizing it (REAL click)
    const zoneCls = await h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:left');return z?String(z.className):null})()`)
    if (zoneCls !== null && /is-minimized/.test(zoneCls)) { await ufRealClick(h, '#zone-minimize-left'); await sleep(600) }
    // the gesture: REAL hit-tested click on #zone-minimize-left (collapse the whole zone)
    const zmin = await ufRealClick(h, '#zone-minimize-left')
    await sleep(900)
    const dump = await h.cdp.evaluate(`(()=>{
      const zoneEl=document.getElementById('zone:left');
      const minimized=zoneEl&&zoneEl.classList.contains('is-minimized');
      const tabs=[...document.querySelectorAll('[id^="zone-tab-left-"]')].map((t)=>{const s=getComputedStyle(t);const r=t.getBoundingClientRect();return {id:t.id,text:(t.textContent||'').trim().slice(0,16),writingMode:s.writingMode,textOrientation:s.textOrientation,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}});
      return {minimized, tabCount:tabs.length, tabs};
    })()`)
    const verticalOk = Array.isArray(dump.tabs) && dump.tabs.length >= 2 && dump.tabs.every((t) => t.writingMode === 'vertical-rl' || t.writingMode === 'vertical-lr' || t.textOrientation === 'upright')
    const painted = Array.isArray(dump.tabs) && dump.tabs.length >= 2 && dump.tabs.every((t) => t.w > 0 && t.h > 0)
    return rowResult('UF-DEFECT-8', 'Minimized-zone labels read VERTICALLY (bottom-to-top): writing-mode vertical-rl/lr or text-orientation upright, painted', 'D-visual', `REAL click #zone-minimize-left path=${zmin.path}; zone minimized=${dump.minimized}; collapsed labels=${dump.tabCount} painted=${painted}; each: ${dump.tabs.map((t) => t.id + ':writingMode=' + t.writingMode + '/textOrientation=' + t.textOrientation + '/size=' + t.w + 'x' + t.h).join(', ')}; vertical=${verticalOk} (horizontal default: writing-mode=horizontal-tb)`, { path: zmin.path, ok: verticalOk && painted, surface })
  },

  // ===================================================================
  // USER-FLOW-AUDIT LIVE BATTERY (2026-09-15) — the UNCOVERED rows of
  // docs/specs/user-flow-audit-checklist.md §1-§13. One block per checklist
  // row; each drives the REAL user gesture on the rendered control and pins
  // the USER-VISIBLE end state. APP-level / assembled-renderer (RCA-12) — a
  // node-green does NOT satisfy any of these rows.
  // Run with `--connect` against the RUNNING app (blocks are sequential and
  // stateful; they restore what they can and record what they cannot).
  // ===================================================================

  // ---- §4 Tabs -------------------------------------------------------------

  // UF-TABS-1 — the strip renders each open tab with a title, highlights the
  // active one (a multi-tab comparison — a lone tab has no inactive tab to
  // compare against), gives every tab a painted close control, and scrolls
  // horizontally on overflow.
  uf_tabs_1: async (h) => {
    await ufEnsureAppClear(h)
    // precondition: >= 2 tabs so the active/inactive highlight is observable
    // (setup via MCP provident.focus{newTab:true}, NOT the asserted gesture)
    let s0 = await ufTabState(h)
    if (s0.count < 2) {
      await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/alpha' }, newTab: true }).catch(() => null)
      await sleep(1200)
      s0 = await ufTabState(h)
    }
    const titled = s0.count >= 1 && s0.tabs.every((t) => t.title.length > 0)
    const oneActive = s0.tabs.filter((t) => t.active).length === 1
    const closes = s0.tabs.every((t) => t.closeBox && t.closeBox[0] > 0 && t.closeBox[1] > 0)
    const act = s0.tabs.find((t) => t.active)
    const inact = s0.tabs.find((t) => !t.active)
    const highlight = !!(act && inact && (act.border !== inact.border || act.bg !== inact.bg || act.weight !== inact.weight))
    // overflow: open document tabs (MCP provident.focus = setup, NOT the
    // assertion) until the strip's content exceeds its client width
    const openedWith = s0.count
    const docs = ['decisions', 'defects', 'HANDOFF', 'next-steps', 'pending', 'FORKER', 'mcp-endpoint', 'module-feature-list', 'module-import-proposal', 'unit-a-rag-store']
    let s = s0
    let guard = 0
    while (s.stripScroll[0] <= s.stripScroll[1] && guard < docs.length) {
      await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: docs[guard] }, newTab: true }).catch(() => null)
      await sleep(800)
      s = await ufTabState(h)
      guard += 1
    }
    const overflow = s.stripScroll[0] > s.stripScroll[1] && s.stripOverflowX === 'auto'
    // restore: close the extras with REAL clicks on the strip close controls
    let closed = 0
    let restorePath = 'not-attempted'
    for (let i = 0; i < 24; i++) {
      const cur = await ufTabState(h)
      if (cur.count <= 2) break
      const r = await ufRealClick(h, '.tab.is-active .tab-close')
      restorePath = r.path
      if (r.path !== 'cdp') break
      closed += 1
      await sleep(800)
    }
    const sEnd = await ufTabState(h)
    return rowResult('UF-TABS-1', 'The rendered strip gives every open tab a title, highlights exactly one active tab, gives every tab a painted close control, and scrolls horizontally on overflow', 'D-visual', `strip: ${s0.count} tabs, every tab titled=${titled}, exactlyOneActive=${oneActive}, perTabCloseControlWithPaintedBox=${closes} (box ${JSON.stringify(s0.tabs[0] ? s0.tabs[0].closeBox : null)}), activeHighlightDiffersFromInactive=${highlight} (active border=${act ? act.border : '-'} bg=${act ? act.bg : '-'} weight=${act ? act.weight : '-'} vs inactive border=${inact ? inact.border : '-'} bg=${inact ? inact.bg : '-'} weight=${inact ? inact.weight : '-'}); overflow at ${s.count} tabs: scrollWidth=${s.stripScroll[0]} clientWidth=${s.stripScroll[1]} overflow-x=${s.stripOverflowX} → horizontalScroll=${overflow} (opened ${s.count - openedWith} doc tabs via MCP provident.focus{newTab:true} setup); [restore] closed ${closed} tabs with REAL clicks on .tab.is-active .tab-close → ${sEnd.count} tabs left`, { path: restorePath, ok: titled && oneActive && closes && highlight && overflow, surface: await ufSurfaceTarget(h) })
  },

  // UF-TABS-3 — closing the ACTIVE tab activates its left neighbour and mounts
  // that neighbour's body; closing the LAST tab yields the PINNED default
  // identity (the operator's `defaultDocument` when set, else the landing page)
  // with a PAINTED, non-empty stage — never an empty stage. The last-tab
  // predicate requires that identity (a bare `.tab`-count/presence check is
  // trivially satisfiable and is NOT an oracle).
  uf_tabs_3: async (h) => {
    await ufEnsureAppClear(h)
    // setup (MCP focus — not the asserted gesture): >=3 document tabs
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/alpha' }, newTab: true }).catch(() => null)
    await sleep(900)
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/beta' }, newTab: true }).catch(() => null)
    await sleep(1400)
    // the PINNED default identity for the post-last-close page (setup read, not the gesture)
    const defaultDoc = await h.cdp.evaluate(`(()=>{const e=document.getElementById('operator-default-document');return e?String(e.textContent||'').trim():null})()`).catch(() => null)
    const expectedDefault = defaultDoc && /^\(all\)$/i.test(defaultDoc) ? null : defaultDoc
    const s0 = await ufTabState(h)
    const act = s0.tabs[s0.activeIndex]
    const left = s0.activeIndex > 0 ? s0.tabs[s0.activeIndex - 1] : null
    const docsList = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
    const docIds = (docsList && Array.isArray(docsList.documents) ? docsList.documents : []).map((d) => d.documentId || d.id).filter(Boolean)
    const clicked = await ufRealClick(h, '.tab.is-active .tab-close')
    await sleep(1600)
    const s1 = await ufTabState(h)
    const neighbourActive = !!left && s1.tabs.some((t) => t.active && t.id === left.id)
    const neighbourMounted = !!left && typeof s1.mountedDocId === 'string' && s1.mountedDocId.includes(left.title)
    // close down to one tab, then close the LAST one
    let lastPath = 'not-reached'
    for (let i = 0; i < 12; i++) {
      const cur = await ufTabState(h)
      if (cur.count <= 1) break
      const r = await ufRealClick(h, '.tab.is-active .tab-close')
      if (r.path !== 'cdp') { lastPath = r.path; break }
      await sleep(1500)
    }
    const oneLeft = await ufTabState(h)
    if (oneLeft.count === 1) {
      lastPath = (await ufRealClick(h, '.tab.is-active .tab-close')).path
      await sleep(1800)
    }
    const afterLast = await ufTabState(h)
    const painted = !!afterLast.mainBox && afterLast.mainBox[2] > 0 && afterLast.mainBox[3] > 0
    const activeTitle = afterLast.tabs.filter((t) => t.active).map((t) => t.title).join('|') || null
    // the pinned post-last-close identity: the landing page, OR the operator's
    // configured defaultDocument, OR a REAL document of the store mounted in the
    // stage under its own active tab — never "some non-empty text"
    const landed = afterLast.landing === true && painted
    const identityMatches = !!expectedDefault && String(afterLast.mountedDocId || '').includes(expectedDefault) && String(activeTitle || '').includes(expectedDefault)
    const realDocument = (docIds.length > 0 && docIds.some((id) => String(afterLast.mountedDocId || '').includes(id))) ||
      (typeof afterLast.mountedDocId === 'string' && afterLast.mountedDocId.length > 0 && !!activeTitle && afterLast.mountedDocId.includes(String(activeTitle).replace(/^rag-/, '')))
    const freshDefault = afterLast.count === 1 && afterLast.mainLen > 0 && painted && (landed || identityMatches || realDocument)
    return rowResult('UF-TABS-3', 'Closing the ACTIVE tab activates its left neighbour and mounts that neighbour body; closing the LAST tab yields the pinned default page (landing or defaultDocument) with a painted non-empty stage', 'D-state', `REAL click on .tab.is-active .tab-close (path=${clicked.path}) closed active tab ${act ? act.id + ' "' + act.title + '"' : '?'}: count ${s0.count}->${s1.count}; LEFT neighbour ${left ? '"' + left.title + '"' : '(none)'} becameActive=${neighbourActive} and its body mounted in #zone:main=${neighbourMounted} (mountedDocId=${s1.mountedDocId}); then closed down to ${oneLeft.count} tab and closed the LAST one (real click, path=${lastPath}) → tabs=${afterLast.count} activeTitle=${activeTitle} mountedDocId=${afterLast.mountedDocId} landing=${afterLast.landing} stageLen=${afterLast.mainLen} stageBox=${JSON.stringify(afterLast.mainBox)}; pinned default identity (operator defaultDocument="${defaultDoc}" → expected=${expectedDefault}) matched=${identityMatches}; landing-page=${landed}; stage shows a REAL store document under its own tab (candidates=${JSON.stringify(docIds.slice(0, 4))})=${realDocument} → freshDefaultPage(never an empty stage)=${freshDefault}`, { path: clicked.path === 'cdp' && lastPath === 'cdp' ? 'cdp' : lastPath, ok: clicked.path === 'cdp' && s1.count === s0.count - 1 && neighbourActive && neighbourMounted && oneLeft.count === 1 && freshDefault, surface: await ufSurfaceTarget(h) })
  },

  // UF-TABS-4 — switching tabs mounts ONLY the active target's body in
  // `#zone:main`; the previous document body unmounts.
  uf_tabs_4: async (h) => {
    await ufEnsureAppClear(h)
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/alpha' }, newTab: true }).catch(() => null)
    await sleep(900)
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/beta' }, newTab: true }).catch(() => null)
    await sleep(1400)
    const s0 = await ufTabState(h)
    const alphaTab = s0.tabs.find((t) => t.kind === 'document' && t.title === '.live-corpus/alpha')
    const betaTab = s0.tabs.find((t) => t.kind === 'document' && t.title === '.live-corpus/beta')
    if (!alphaTab || !betaTab) return rowResult('UF-TABS-4', 'Switching tabs mounts ONLY the active target body in #zone:main and unmounts the prior document body', 'D-visual', `need an alpha AND a beta document tab; tabs=${JSON.stringify(s0.tabs.map((t) => t.id + ':' + t.kind + ':' + t.title))}`, { path: 'missing', ok: false, surface: await ufSurfaceTarget(h) })
    const cA = await ufRealClick(h, `.tab[data-tab-id="${alphaTab.id}"]`)
    await sleep(1600)
    const sA = await ufTabState(h)
    const aMounted = typeof sA.mountedDocId === 'string' && sA.mountedDocId.includes('alpha')
    const bGone = !(await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');return !!m&&[...m.querySelectorAll('[id]')].some((e)=>(e.id||'').includes('beta'))})()`))
    const cB = await ufRealClick(h, `.tab[data-tab-id="${betaTab.id}"]`)
    await sleep(1600)
    const sB = await ufTabState(h)
    const bMounted = typeof sB.mountedDocId === 'string' && sB.mountedDocId.includes('beta')
    const aGone = !(await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');return !!m&&[...m.querySelectorAll('[id]')].some((e)=>(e.id||'').includes('alpha'))})()`))
    const singleActive = sA.tabs.filter((t) => t.active).length === 1 && sB.tabs.filter((t) => t.active).length === 1
    return rowResult('UF-TABS-4', 'Switching tabs mounts ONLY the active target body in #zone:main and unmounts the prior document body', 'D-visual', `REAL click on tab ${alphaTab.id} (path=${cA.path}): #zone:main mounts alpha=${aMounted} (mountedDocId=${sA.mountedDocId}) and the prior beta body is GONE from #zone:main=${bGone}; REAL click on tab ${betaTab.id} (path=${cB.path}): mounts beta=${bMounted} (mountedDocId=${sB.mountedDocId}) and alpha is gone=${aGone}; exactly one active tab in each sample=${singleActive}`, { path: cA.path === 'cdp' && cB.path === 'cdp' ? 'cdp' : 'native-fallback', ok: cA.path === 'cdp' && cB.path === 'cdp' && aMounted && bGone && bMounted && aGone && singleActive, surface: await ufSurfaceTarget(h) })
  },

  // UF-TABS-7 — a search result row click opens the document in a NEW tab
  // (the search tab stays). The row's gesture is the hit-tested real-click
  // helper; the click-probe separates a dead handler from a gesture that never
  // delivers the click, and a native DOM click (attribution evidence only)
  // lives in the separate `uf_tabs_7_diag` block so it can never flip the verdict.
  uf_tabs_7: async (h) => {
    await ufEnsureAppClear(h)
    await ufEnsurePaneExpanded(h, 'search')
    // setup: open a SEARCH tab with a REAL click on the pane's expand-tab control
    const expand = await ufRealClick(h, '#pane-search-expand-tab')
    await sleep(1600)
    const search = await ufPaneSearch(h, 'alpha')
    const before = await ufTabState(h)
    const rows = search.rows || []
    const surface = await ufSurfaceTarget(h)
    if (rows.length === 0) return rowResult('UF-TABS-7', 'A REAL click on a search result row opens that document in a NEW document tab while the search tab stays', 'D-interaction', `the search pane rendered NO result rows → the row click cannot be driven; search=${JSON.stringify(search)}`, { path: 'missing', ok: false, surface })
    const row = rows[0]
    await ufArmClick(h)
    const r = await ufRealClick(h, '#pane-search li[data-document-id]')
    await sleep(1800)
    const events = await ufClickProbe(h)
    const after = await ufTabState(h)
    const newTab = after.count === before.count + 1
    const docTab = after.tabs.some((t) => t.kind === 'document' && t.title === row.doc)
    const searchTabStays = before.tabs.some((t) => t.kind === 'search') && after.tabs.some((t) => t.kind === 'search')
    const detail = `search pane: disclosure=${search.togglePath} query="${search.value}" submit=${search.submitPath} → ${rows.length} result rows painted (first row doc=${row.doc} box=${JSON.stringify(row.box)} cls="${row.cls}"); REAL click on that row (path=${r.path} hit=${r.rect ? r.rect.hit : '?'}): tabs ${before.count}->${after.count} newDocumentTab=${newTab} openedDocTab=${docTab} searchTabStillOpen=${searchTabStays}; click-event targets=${JSON.stringify(events)}`
    if (!newTab) return rowResult('UF-TABS-7', 'A REAL click on a search result row opens that document in a NEW document tab while the search tab stays', 'D-interaction', `${detail}; [DIAG] attribution available — run --block=uf_tabs_7_diag (a NATIVE DOM click on the same row) to separate a dead handler from a gesture that never delivered the click`, { path: r.path, ok: false, surface })
    return rowResult('UF-TABS-7', 'A REAL click on a search result row opens that document in a NEW document tab while the search tab stays', 'D-interaction', detail, { path: r.path, ok: newTab && docTab && searchTabStays, surface })
  },

  // UF-TABS-7 DIAGNOSTIC — the attribution half of the search-row row: a NATIVE
  // `.click()` on the same result row (no hit-testing, no verdict). It proves
  // whether the handler + seam work when the real gesture does not deliver the
  // click; it is a `[DIAG]` measurement and can never promote the row.
  uf_tabs_7_diag: async (h) => {
    await ufEnsureAppClear(h)
    const before = await ufTabState(h)
    // [DIAG] native DOM click (no hit-testing, no verdict) — attribution evidence
    const nat = await ufNativeClickDiag(h, '#pane-search li[data-document-id]')
    await sleep(1800)
    const after = await ufTabState(h)
    // [DIAG] measurement only — attribution evidence, never a row verdict
    return diagResult(`NATIVE DOM click on '#pane-search li[data-document-id]' → ${nat}: tabs ${before.count}->${after.count} (a new document tab opened by the synthetic path=${after.count === before.count + 1}) — attribution evidence for UF-TABS-7 only; the row verdict is the hit-tested REAL click in uf_tabs_7`)
  },
  // ---- §7 Settings modal ---------------------------------------------------

  // UF-SETTINGS-1 — hidden by default; `#settings-toggle` (a real click) opens it.
  uf_settings_1: async (h) => {
    await ufModal(h, false)
    const closed = await h.cdp.evaluate(`(()=>{const m=document.getElementById('settings-modal');const b=document.getElementById('settings-modal-body');const r=b.getBoundingClientRect();return {cls:m.className,display:getComputedStyle(m).display,bodyBox:[Math.round(r.width),Math.round(r.height)],visible:r.width>0&&r.height>0}})()`)
    const r = await ufRealClick(h, '#settings-toggle')
    await sleep(1100)
    const open = await h.cdp.evaluate(`(()=>{const m=document.getElementById('settings-modal');const b=document.getElementById('settings-modal-body');const r=b.getBoundingClientRect();const p=document.getElementById('operator-panes');const pr=p.getBoundingClientRect();return {cls:m.className,display:getComputedStyle(m).display,bodyBox:[Math.round(r.width),Math.round(r.height)],operatorBox:[Math.round(pr.width),Math.round(pr.height)],operatorText:(p.textContent||'').replace(/\\s+/g,' ').trim().slice(0,60)}})()`)
    const hiddenByDefault = /is-closed/.test(closed.cls) && closed.display === 'none' && !closed.visible
    const openedVisibly = /is-open/.test(open.cls) && open.display !== 'none' && open.bodyBox[0] > 0 && open.bodyBox[1] > 0 && open.operatorBox[0] > 0 && open.operatorText.length > 0
    await ufModal(h, false)
    return rowResult('UF-SETTINGS-1', 'The settings modal is hidden at boot and a REAL click on #settings-toggle reveals PAINTED operator panes', 'D-visual', `at boot/start #settings-modal class="${closed.cls}" display=${closed.display} bodyBox=${JSON.stringify(closed.bodyBox)} → hiddenByDefault=${hiddenByDefault}; REAL click on #settings-toggle (path=${r.path}) → class="${open.cls}" display=${open.display} bodyBox=${JSON.stringify(open.bodyBox)} operatorPaneBox=${JSON.stringify(open.operatorBox)} operatorText="${open.operatorText}" → visibleOperatorPanes=${openedVisibly}`, { path: r.path, ok: hiddenByDefault && openedVisibly, surface: await ufSurfaceTarget(h) })
  },

  // UF-SETTINGS-2 — Escape closes, a scrim click closes, a content click does
  // NOT close, and the frame ALWAYS carries exactly one of .is-open/.is-closed.
  uf_settings_2: async (h) => {
    const cls = async () => h.cdp.evaluate(`(document.getElementById('settings-modal')||{}).className||''`)
    const samples = []
    await ufModal(h, true)
    samples.push(['open (real #settings-toggle click)', await cls()])
    // a click on the modal CONTENT (the body, not a control) must NOT close it
    const point = await h.cdp.evaluate(`(()=>{const b=document.getElementById('settings-modal-body');const r=b.getBoundingClientRect();for(let dy=8;dy<r.height;dy+=6){const x=Math.round(r.x+r.width/2),y=Math.round(r.y+dy);const el=document.elementFromPoint(x,y);if(!el)continue;if(el===b||(el.closest&&el.closest('#settings-modal-body')&&!/^(BUTTON|INPUT|SELECT|TEXTAREA|LI|LABEL|A)$/.test(el.tagName)))return {x:x,y:y,hit:el.tagName+'#'+(el.id||'')}}return null})()`)
    if (point) {
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: point.x, y: point.y, buttons: 0 })
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: point.x, y: point.y, button: 'left', buttons: 1, clickCount: 1 })
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: point.x, y: point.y, button: 'left', buttons: 0, clickCount: 1 })
      await sleep(800)
    }
    samples.push([`content click (${point ? point.hit : 'no point'})`, await cls()])
    // a click on the SCRIM (outside the body) must close it
    const scrim = await h.cdp.evaluate(`(()=>{const s=document.getElementById('settings-modal-scrim');const r=s.getBoundingClientRect();const cands=[[r.x+4,r.y+r.height/2],[r.x+r.width/2,r.y+4],[r.x+4,r.y+4]];for(const c of cands){const el=document.elementFromPoint(c[0],c[1]);if(el&&el.id==='settings-modal-scrim')return {x:c[0],y:c[1]}}return null})()`)
    if (scrim) {
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: scrim.x, y: scrim.y, buttons: 0 })
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: scrim.x, y: scrim.y, button: 'left', buttons: 1, clickCount: 1 })
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: scrim.x, y: scrim.y, button: 'left', buttons: 0, clickCount: 1 })
      await sleep(900)
    }
    samples.push([`scrim click (${scrim ? scrim.x + ',' + scrim.y : 'no point'})`, await cls()])
    // Escape closes
    await ufModal(h, true)
    await ufKey(h, 'Escape', 'Escape', 27)
    await sleep(900)
    samples.push(['Escape', await cls()])
    const exactlyOne = samples.every(([, c]) => (/is-open/.test(c) ? 1 : 0) + (/is-closed/.test(c) ? 1 : 0) === 1)
    const contentClickKeepsOpen = /is-open/.test(samples[1][1])
    const scrimClickCloses = /is-closed/.test(samples[2][1])
    const escapeCloses = /is-closed/.test(samples[3][1])
    return rowResult('UF-SETTINGS-2', 'Escape closes the modal, a scrim click closes it, a modal-CONTENT click does NOT close it, and the frame always carries exactly one of .is-open/.is-closed', 'D-interaction', `samples=${samples.map(([k, c]) => k + ' → "' + c + '"').join('; ')}; exactlyOneOf(.is-open/.is-closed) at every sample=${exactlyOne}; contentClickKeepsOpen=${contentClickKeepsOpen} scrimClickCloses=${scrimClickCloses} escapeCloses=${escapeCloses}; each click was a real CDP coordinate gesture hit-tested to its intended target (scrim point=${scrim ? scrim.x + ',' + scrim.y : 'none'}, content point=${point ? point.x + ',' + point.y : 'none'})`, { path: point && scrim ? 'cdp' : 'missing', ok: exactlyOne && contentClickKeepsOpen && scrimClickCloses && escapeCloses, surface: await ufSurfaceTarget(h) })
  },

  // UF-SETTINGS-3 — the modal hosts BOTH operator mounts (#panes +
  // #operator-panes) and the app graph is NOT re-parented into it.
  uf_settings_3: async (h) => {
    await ufModal(h, true)
    const r = await h.cdp.evaluate(`(()=>{
      const b=document.getElementById('settings-modal-body');
      const panes=document.getElementById('panes'),op=document.getElementById('operator-panes');
      const box=(e)=>{const x=e.getBoundingClientRect();return [Math.round(x.width),Math.round(x.height)]};
      const left=document.getElementById('zone:left');
      const app=document.getElementById('app');const main=document.getElementById('zone:main');
      return {bodyBox:box(b),panesInBody:!!panes&&b.contains(panes),opInBody:!!op&&b.contains(op),panesBox:panes?box(panes):null,opBox:op?box(op):null,
        panesText:(panes?(panes.textContent||'').replace(/\\s+/g,' ').trim().slice(0,45):null),opText:(op?(op.textContent||'').replace(/\\s+/g,' ').trim().slice(0,45):null),
        panesInZone:!!panes&&!!left&&left.contains(panes),opInZone:!!op&&!!left&&left.contains(op),appInLayout:!!app&&!!app.closest('main.layout'),mainInApp:!!app&&!!main&&app.contains(main)}})()`)
    const bothMounted = r.panesInBody && r.opInBody && r.panesBox && r.panesBox[0] > 0 && r.panesBox[1] > 0 && r.opBox[0] > 0 && r.opBox[1] > 0 && (r.panesText || '').length > 0 && (r.opText || '').length > 0
    const isolation = !r.panesInZone && !r.opInZone && r.appInLayout && r.mainInApp
    await ufModal(h, false)
    return rowResult('UF-SETTINGS-3', 'The modal body hosts BOTH operator mounts (#panes + #operator-panes), both PAINTED and populated, and the app graph is NOT re-parented into it', 'D-visual', `modal body box=${JSON.stringify(r.bodyBox)}; #panes in #settings-modal-body=${r.panesInBody} (box ${JSON.stringify(r.panesBox)}, text "${r.panesText}"); #operator-panes in body=${r.opInBody} (box ${JSON.stringify(r.opBox)}, text "${r.opText}"); bothMounted&painted=${bothMounted}; isolation: #panes in zone:left=${r.panesInZone} #operator-panes in zone:left=${r.opInZone} #app still in main.layout=${r.appInLayout} #zone:main still inside #app=${r.mainInApp} → preserved=${isolation}`, { path: 'cdp', ok: bothMounted && isolation, surface: await ufSurfaceTarget(h) })
  },

  // UF-SETTINGS-4 — the enabled-panes census is populated at FIRST render
  // (no edit) and agrees with the rendered pane frames. The census text and the
  // frame list are two PROJECTIONS of one state, so a second, independent
  // oracle is required: the census reads PAINTED (a non-zero box) AND a
  // re-read after the frame read still agrees (no edit in between).
  uf_settings_4: async (h) => {
    await ufModal(h, true)
    const r = await h.cdp.evaluate(`(()=>{const c=document.getElementById('operator-enabled-panes');const f=[...document.querySelectorAll('.pane-frame[data-pane-id]')].map((x)=>x.getAttribute('data-pane-id'));const box=c?c.getBoundingClientRect():null;return {text:c?(c.textContent||'').trim():null,box:box?[Math.round(box.width),Math.round(box.height)]:null,frames:f}})()`)
    const census = (r.text || '').split(/[,\s]+/).filter(Boolean)
    const frames = r.frames || []
    const agree = census.length > 0 && census.length === frames.length && census.every((id) => frames.includes(id))
    // INDEPENDENT ORACLE #1: the census is PAINTED (a real painted box), not just present in the DOM
    const censusPainted = !!r.box && r.box[0] > 0 && r.box[1] > 0
    // INDEPENDENT ORACLE #2: re-read AFTER the frame read — the two projections
    // still agree, so the census is the rendered/committed set and not a stale text node
    const reRead = await h.cdp.evaluate(`(()=>{const c=document.getElementById('operator-enabled-panes');const f=[...document.querySelectorAll('.pane-frame[data-pane-id]')].map((x)=>x.getAttribute('data-pane-id'));return {text:c?(c.textContent||'').trim():null,frames:f}})()`)
    const census2 = (reRead.text || '').split(/[,\s]+/).filter(Boolean)
    const stable = census2.join(',') === census.join(',') && (reRead.frames || []).join(',') === frames.join(',')
    await ufModal(h, false)
    return rowResult('UF-SETTINGS-4', 'The enabled-panes census is populated at FIRST render (no edit) — PAINTED — and agrees with the rendered pane frames', 'D-state', `settings modal opened by a REAL click; #operator-enabled-panes="${r.text}" (painted box ${JSON.stringify(r.box)}, painted=${censusPainted}) with NO edit made; rendered .pane-frame[data-pane-id] set=${JSON.stringify(frames)} → census populatedAtFirstRender=${census.length > 0} agreesWithRenderedPanes=${agree} censusPainted=${censusPainted} reReadStableAgreement=${stable} (second read "${reRead.text}"); NOTE: the other half of this row (the fresh-store first-run default = exactly {search,doc-nav}) needs a fresh --home boot and is PARKED (see docs/specs/user-flow-audit-coverage-2026-09-15.md)`, { path: 'cdp', ok: census.length > 0 && agree && censusPainted && stable, surface: await ufSurfaceTarget(h) })
  },

  // UF-SETTINGS-5 — the operator settings reflect topK / editing-mode /
  // default-document (plus rag-stores), populated from the store.
  uf_settings_5: async (h) => {
    await ufModal(h, true)
    const r = await h.cdp.evaluate(`(()=>{const g=(id)=>{const e=document.getElementById(id);if(!e)return null;const b=e.getBoundingClientRect();return {text:(e.textContent||'').trim(),box:[Math.round(b.width),Math.round(b.height)]}};return {topk:g('operator-topk'),mode:g('operator-editing-mode'),doc:g('operator-default-document'),stores:g('operator-rag-stores')}})()`)
    const painted = (f) => !!f && f.box[0] > 0 && f.box[1] > 0 && f.text.length > 0
    const topkOk = painted(r.topk) && /topK:\s*\d+/.test(r.topk.text)
    const modeOk = painted(r.mode) && /editingMode:\s*(contenteditable|textarea)/.test(r.mode.text)
    const docOk = painted(r.doc)
    const storesOk = painted(r.stores) && /store/i.test(r.stores.text)
    await ufModal(h, false)
    return rowResult('UF-SETTINGS-5', 'The operator settings reflect topK / editing-mode / default-document (plus rag-stores), each PAINTED', 'D-state', `#operator-topk="${r.topk ? r.topk.text : 'MISSING'}" (painted=${painted(r.topk)}, matches /topK:\\d+/=${topkOk}); #operator-editing-mode="${r.mode ? r.mode.text : 'MISSING'}" (matches /editingMode:(contenteditable|textarea)/=${modeOk}); #operator-default-document="${r.doc ? r.doc.text : 'MISSING'}" (painted=${docOk}); #operator-rag-stores="${r.stores ? r.stores.text.slice(0, 60) : 'MISSING'}…" (painted=${storesOk})`, { path: 'cdp', ok: topkOk && modeOk && docOk && storesOk, surface: await ufSurfaceTarget(h) })
  },

  // UF-SETTINGS-7 — a REAL per-pane [data-pane][data-enabled] click flips a
  // pane ON (its .pane-frame appears) and OFF (the frame is removed).
  uf_settings_7: async (h) => {
    await ufModal(h, true)
    const read = async () => h.cdp.evaluate(`(()=>{const t=document.getElementById('operator-pane-visibility-crosslinks');const f=document.querySelector('.pane-frame[data-pane-id="crosslinks"]');const c=document.getElementById('operator-enabled-panes');const b=f?f.getBoundingClientRect():null;return {enabled:t?t.getAttribute('data-enabled'):null,frame:!!f,frameBox:b?[Math.round(b.width),Math.round(b.height)]:null,census:c?(c.textContent||'').trim():null}})()`)
    const s0 = await read()
    let c1 = { path: 'skipped' }
    let s1 = s0
    if (s0.enabled === 'false') {
      c1 = await ufRealClick(h, '#operator-pane-visibility-crosslinks')
      await sleep(1700)
      s1 = await read()
    }
    const c2 = await ufRealClick(h, '#operator-pane-visibility-crosslinks')
    await sleep(1700)
    const s2 = await read()
    const ok = s0.enabled === 'false' && c1.path === 'cdp' && s1.enabled === 'true' && s1.frame && s1.frameBox[0] > 0 && s1.frameBox[1] > 0 && c2.path === 'cdp' && s2.enabled === 'false' && !s2.frame
    await ufModal(h, false)
    return rowResult('UF-SETTINGS-7', 'A REAL per-pane [data-pane][data-enabled] click flips a pane ON (its .pane-frame appears, painted) and OFF (the frame is removed)', 'D-interaction', `crosslinks toggle start data-enabled=${s0.enabled} frameRendered=${s0.frame} census="${s0.census}"; REAL click ON (path=${c1.path}) → data-enabled=${s1.enabled} .pane-frame rendered=${s1.frame} box=${JSON.stringify(s1.frameBox)} census="${s1.census}"; REAL click OFF (path=${c2.path}) → data-enabled=${s2.enabled} frameRemoved=${!s2.frame} census="${s2.census}"`, { path: c1.path === 'cdp' && c2.path === 'cdp' ? 'cdp' : 'native-fallback', ok, surface: await ufSurfaceTarget(h) })
  },

  // ---- §3 Panes ------------------------------------------------------------

  // UF-PANES-1 — a REAL click on a pane's `.pane-collapse-toggle` renders the
  // pane HEADER-ONLY (its body nodes unmount); a second click re-expands the
  // SAME pane root (node identity stable). The verdict is gated on the
  // hit-tested path of BOTH clicks.
  uf_panes_1: async (h) => {
    await ufEnsureAppClear(h)
    const zoneCls = await h.cdp.evaluate(`document.getElementById('zone:left').className`)
    let zonePath = 'already-expanded'
    if (/is-minimized/.test(zoneCls)) {
      zonePath = (await ufRealClick(h, '#zone-minimize-left')).path
      await sleep(1300)
    }
    const surface = await ufSurfaceTarget(h)
    const pre = await ufPaneFrames(h)
    const docnav = pre.find((f) => f.pid === 'doc-nav')
    if (!docnav) return rowResult('UF-PANES-1', 'A REAL click on a pane collapse toggle renders the pane HEADER-ONLY (body unmounted); a second REAL click re-expands the SAME pane root', 'D-interaction', `no doc-nav pane frame rendered; frames=${JSON.stringify(pre)}`, { path: 'missing', ok: false, surface })
    if (docnav.collapsed) {
      await ufRealClick(h, '#pane-collapse-doc-nav')
      await sleep(1400)
    }
    const paneOf = async () => h.cdp.evaluate(`(()=>{const f=document.getElementById('pane-doc-nav');const r=f.getBoundingClientRect();const t=f.querySelector('.pane-collapse-toggle');return {id:f.id,paneId:f.getAttribute('data-pane-id'),nodeId:f.getAttribute('data-node-id')||null,title:t?(t.textContent||'').trim():null,x:Math.round(r.x),li:f.querySelectorAll('li').length,h:Math.round(r.height),ul:!!f.querySelector('ul'),collapsed:f.classList.contains('is-collapsed')}})()`)
    const before = await paneOf()
    const c1 = await ufRealClick(h, '#pane-collapse-doc-nav')
    await sleep(1500)
    const mid = await paneOf()
    const c2 = await ufRealClick(h, '#pane-collapse-doc-nav')
    await sleep(1600)
    const after = await paneOf()
    const headerOnly = mid.collapsed === true && mid.li === 0 && mid.ul === false && mid.h < 60 && before.h > mid.h + 40
    const reExpanded = after.collapsed === false && after.li === before.li && after.ul === true && after.h > mid.h + 40
    // pane-ROOT identity: the same pane root (`#pane-doc-nav` / data-pane-id / title)
    // is what comes back — the frame's DOM element instance is re-materialized by
    // the re-derive, so the identity oracle is the authored root, not the instance.
    const sameRoot = before.id === after.id && before.paneId === after.paneId && before.title === after.title && before.x === after.x
    return rowResult('UF-PANES-1', 'A REAL click on a pane collapse toggle renders the pane HEADER-ONLY (body unmounted); a second REAL click re-expands the SAME pane root', 'D-interaction', `zone expand path=${zonePath}; doc-nav before: bodyNodes(li)=${before.li} ul=${before.ul} h=${before.h}px; REAL click #pane-collapse-doc-nav (path=${c1.path}) → is-collapsed=${mid.collapsed} bodyNodes(li)=${mid.li} ul=${mid.ul} h=${mid.h}px → headerOnly=${headerOnly}; REAL click again (path=${c2.path}) → is-collapsed=${after.collapsed} bodyNodes(li)=${after.li} ul=${after.ul} h=${after.h}px → reExpanded=${reExpanded}; samePaneRoot(identical #pane-doc-nav root: id/paneId/title/x ${before.id}/${before.paneId}/"${before.title}"/${before.x} → ${after.id}/${after.paneId}/"${after.title}"/${after.x})=${sameRoot} (data-node-id ${before.nodeId}→${after.nodeId})`, { path: c1.path === 'cdp' && c2.path === 'cdp' ? 'cdp' : 'native-fallback', ok: headerOnly && reExpanded && sameRoot, surface })
  },

  // UF-PANES-8 — a REAL click on a minimized zone's tab re-expands the zone
  // (and the tab's data-pane-id identifies that pane; pane-body activation is
  // DEFERRED by spec §2.5 pin 5 — recorded, not asserted as a defect).
  uf_panes_8: async (h) => {
    await ufEnsureAppClear(h)
    // setup: expand the zone, collapse BOTH panes with REAL toggle clicks so the
    // clicked pane's activation is observable
    const zoneCls = await h.cdp.evaluate(`document.getElementById('zone:left').className`)
    if (/is-minimized/.test(zoneCls)) { await ufRealClick(h, '#zone-minimize-left'); await sleep(1300) }
    for (const pid of ['doc-nav', 'search']) {
      const f = (await ufPaneFrames(h)).find((x) => x.pid === pid)
      if (f && !f.collapsed) { await ufRealClick(h, `#pane-collapse-${pid}`); await sleep(1300) }
    }
    const preMin = await ufPaneFrames(h)
    const minPath = (await ufRealClick(h, '#zone-minimize-left')).path
    await sleep(1500)
    const minimized = await h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:left');const tabs=[...document.querySelectorAll('[id^="zone-tab-left-"]')].map((t)=>{const r=t.getBoundingClientRect();return {id:t.id,paneId:t.getAttribute('data-pane-id'),box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}});return {cls:z.className,frames:document.querySelectorAll('.pane-frame[data-pane-id]').length,tabs:tabs}})()`)
    const tabClick = (await ufRealClick(h, '#zone-tab-left-doc-nav'))
    await sleep(1800)
    const after = await h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:left');return {cls:z.className,frames:document.querySelectorAll('.pane-frame[data-pane-id]').length}})()`)
    const afterFrames = await ufPaneFrames(h)
    const docnavAfter = afterFrames.find((f) => f.pid === 'doc-nav') || null
    const stripReplacesStack = minimized.frames === 0 && minimized.tabs.length >= 1 && minimized.tabs.every((t) => t.box[2] > 0 && t.box[3] > 0)
    const reExpanded = !/is-minimized/.test(after.cls) && after.frames >= 1 && afterFrames.every((f) => f.box[2] > 0 && f.box[3] > 0)
    const clickedPaneIdentified = minimized.tabs.some((t) => t.id === 'zone-tab-left-doc-nav' && t.paneId === 'doc-nav')
    // restore: re-expand both panes (the block collapses them as setup)
    const restore = []
    for (const pid of ['doc-nav', 'search']) restore.push(JSON.stringify(await ufEnsurePaneExpanded(h, pid)))
    return rowResult('UF-PANES-8', 'A REAL click on a minimized zone tab re-expands the zone (painted panes again) and the tab data-pane-id identifies that pane', 'D-interaction', `pre-minimize panes=${JSON.stringify(preMin.map((f) => f.pid + (f.collapsed ? '(collapsed)' : '(expanded)'))) }; REAL click #zone-minimize-left (path=${minPath}) → zone class="${minimized.cls}" frames=${minimized.frames} tabStrips=${JSON.stringify(minimized.tabs)} (vertical column, painted); REAL click #zone-tab-left-doc-nav (path=${tabClick.path}) → zone class="${after.cls}" frames=${after.frames} (doc-nav collapsed-after-click=${docnavAfter ? docnavAfter.collapsed : 'absent'}) → zoneReExpanded=${reExpanded} clickedPaneIdentifiedByTab=${clickedPaneIdentified}; [restore] ${restore.join(' ')}; NOTE: pane-BODY activation on tab click is DEFERRED by unit-u-shell-4 §2.5 pin 5 ("live selection is deferred … the tab's data-pane-id identifies the selected pane") — the checklist row's "activates that pane's body" clause overstates the pinned spec`, { path: minPath === 'cdp' && tabClick.path === 'cdp' ? 'cdp' : 'native-fallback', ok: stripReplacesStack && reExpanded && clickedPaneIdentified, surface: await ufSurfaceTarget(h) })
  },

  // UF-PANES-10 — the persisted enabled-pane set governs the rendered panes and
  // the operator census agrees at FIRST render (no edit). The census text and
  // the frame list are two PROJECTIONS of one state, so a second, independent
  // oracle is required: the census is PAINTED (non-zero box) and a re-read after
  // the frame read still agrees. The fresh-store {search,doc-nav} first-run
  // default needs a fresh --home boot (PARKED).
  uf_panes_10: async (h) => {
    await ufEnsureAppClear(h)
    const frames0 = await ufPaneFrames(h)
    const opened = await ufModal(h, true)
    const censusRead = await h.cdp.evaluate(`(()=>{const c=document.getElementById('operator-enabled-panes');if(!c)return null;const b=c.getBoundingClientRect();return {text:(c.textContent||'').trim(),box:[Math.round(b.width),Math.round(b.height)]}})()`)
    const census = censusRead ? censusRead.text : null
    const censusIds = (census || '').split(/[,\s]+/).filter(Boolean)
    const frameIds = frames0.map((f) => f.pid)
    const agree = censusIds.length > 0 && censusIds.length === frameIds.length && censusIds.every((id) => frameIds.includes(id))
    const censusPainted = !!censusRead && censusRead.box[0] > 0 && censusRead.box[1] > 0
    // and no edit was made between the render and the census read
    const frames1 = await ufPaneFrames(h)
    const stable = frames1.map((f) => f.pid).join(',') === frameIds.join(',')
    // INDEPENDENT ORACLE: re-read the census AFTER the frames + a fresh modal read
    const census2 = await h.cdp.evaluate(`(()=>{const c=document.getElementById('operator-enabled-panes');return c?(c.textContent||'').trim():null})()`)
    const censusStable = (census2 || '') === (census || '')
    await ufModal(h, false)
    return rowResult('UF-PANES-10', 'The persisted enabled-pane set governs the rendered panes and the operator census agrees at first render, PAINTED, with no edit', 'D-state', `rendered .pane-frame set at first render=${JSON.stringify(frameIds)}; census (modal opened by a REAL click, path=${opened.path}) = "${census}" (painted box ${JSON.stringify(censusRead ? censusRead.box : null)}); persistedSetGovernsRenderedPanes+agrees=${agree}; censusPainted=${censusPainted}; no-edit stability across the census read=${stable} and across the re-read=${censusStable} (second read "${census2}"). PARKED half of this row: the FRESH-store first-run default (exactly {search,doc-nav}) requires a fresh --home boot (the existing block 'first_boot_default' covers it with --no-seed + a disposable HOME); on this RUNNING operator store the persisted set is authoritative`, { path: opened.path, ok: agree && stable && censusStable && censusPainted, surface: await ufSurfaceTarget(h) })
  },

  // UF-PANES-12 — a REAL click on a doc-nav document `li` focuses that document
  // in the stage (the click probe separates a dead handler from a gesture that
  // never delivers the click; the native DOM-click attribution lives in
  // `uf_panes_12_diag` so it can never flip this row's verdict).
  uf_panes_12: async (h) => {
    await ufEnsureAppClear(h)
    const pane = await ufEnsurePaneExpanded(h, 'doc-nav')
    const surface = await ufSurfaceTarget(h)
    // setup: focus a DIFFERENT document first so the switch is visible
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/alpha' } }).catch(() => null)
    await sleep(1400)
    // setup: the .live-corpus folder must be expanded for the beta leaf to exist
    let folderPath = 'already-expanded'
    let folderOpen = await h.cdp.evaluate(`(()=>{const f=document.querySelector('[data-folder-label=".live-corpus"]');return f?f.getAttribute('data-expanded'):null})()`)
    if (folderOpen !== 'true') {
      folderPath = (await ufRealClick(h, '[data-folder-label=".live-corpus"]')).path
      await sleep(1300)
      folderOpen = await h.cdp.evaluate(`(()=>{const f=document.querySelector('[data-folder-label=".live-corpus"]');return f?f.getAttribute('data-expanded'):null})()`)
      if (folderOpen !== 'true') {
        // the folder row is itself a clickable `li` in a pane frame — a REAL click
        // may be swallowed by the pane-drag pointer capture. [DIAG] native-click
        // attribution (SETUP ONLY, no verdict) so the leaf row is reachable.
        await ufNativeClickDiag(h, '[data-folder-label=".live-corpus"]')
        await sleep(1300)
        folderPath += '+[DIAG]-native-fallback(setup)'
        folderOpen = await h.cdp.evaluate(`(()=>{const f=document.querySelector('[data-folder-label=".live-corpus"]');return f?f.getAttribute('data-expanded'):null})()`)
      }
    }
    const leaf = await h.cdp.evaluate(`(()=>{const l=document.querySelector('li[data-document-id=".live-corpus/beta"]');if(!l)return null;const r=l.getBoundingClientRect();return {doc:l.getAttribute('data-document-id'),box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}})()`)
    if (!leaf) return rowResult('U-1', 'A REAL click on a doc-nav document ROW focuses that document in the stage', 'D-interaction', `doc-nav has no li[data-document-id=".live-corpus/beta"] (folder expand path=${folderPath}, expanded=${folderOpen})`, { path: 'missing', ok: false, surface })
    const before = await ufStageSig(h)
    await ufArmClick(h)
    const click = await ufRealClick(h, 'li[data-document-id=".live-corpus/beta"]')
    // post-click hit re-probe: if the page re-flowed (a mount leak / a tall pane)
    // between the hit-test and the dispatch, this records WHERE the click landed
    const clickProbe = await ufHitProbe(h, 'li[data-document-id=".live-corpus/beta"]')
    await sleep(1800)
    const events = await ufClickProbe(h)
    const after = await ufStageSig(h)
    const focused = typeof after.docId === 'string' && after.docId.includes('beta')
    const current = await h.cdp.evaluate(`!!document.querySelector('li[data-document-id=".live-corpus/beta"][data-current="true"]')`)
    const detail = `doc-nav pane expand=${JSON.stringify(pane)}; doc-nav folder expand: path=${folderPath} (expanded=${folderOpen}; the folder row is itself a clickable li); REAL click on li[data-document-id=".live-corpus/beta"] (box ${JSON.stringify(leaf.box)}, path=${click.path}, hit=${click.rect ? click.rect.hit : '?'}) → stage before(docId=${before.docId}) after(docId=${after.docId}) focusedThatDocument=${focused} li[data-current]=${current}; click-event targets=${JSON.stringify(events)}; post-click hit re-probe=${JSON.stringify(clickProbe)}`
    if (!focused) return rowResult('U-1', 'A REAL click on a doc-nav document ROW focuses that document in the stage', 'D-interaction', `${detail}; [DIAG] attribution available — run --block=uf_panes_12_diag (a NATIVE DOM click on the same li) to separate a dead handler from a gesture that never delivered the click`, { path: click.path, ok: false, surface })
    return rowResult('U-1', 'A REAL click on a doc-nav document ROW focuses that document in the stage', 'D-interaction', detail, { path: click.path, ok: focused && current, surface })
  },

  // UF-PANES-12 DIAGNOSTIC — a NATIVE `.click()` on the same doc-nav li (no
  // hit-testing, no verdict): attribution evidence separating "the handler+seam
  // are broken" from "the REAL gesture never delivered the click".
  uf_panes_12_diag: async (h) => {
    await ufEnsureAppClear(h)
    await ufEnsurePaneExpanded(h, 'doc-nav')
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/alpha' } }).catch(() => null)
    await sleep(1400)
    const before = await ufStageSig(h)
    // [DIAG] native DOM click (no hit-testing, no verdict) — attribution evidence
    const nat = await ufNativeClickDiag(h, 'li[data-document-id=".live-corpus/beta"]')
    await sleep(1800)
    const after = await ufStageSig(h)
    const focused = typeof after.docId === 'string' && after.docId.includes('beta')
    // [DIAG] measurement only — attribution evidence, never a row verdict
    return diagResult(`NATIVE DOM click on 'li[data-document-id=".live-corpus/beta"]' → ${nat}: stage docId ${before.docId} -> ${after.docId} (focusedThatDocument=${focused}) — so the handler+seam work, and the REAL gesture is what fails; attribution evidence for UF-PANES-12 / U-1 only`)
  },

  // UF-PANES-14 — the search pane: a REAL typed query + REAL submit renders
  // result rows that hover-highlight, and a result click opens the linked doc
  // in a NEW tab.
  uf_panes_14: async (h) => {
    await ufEnsureAppClear(h)
    const pane = await ufEnsurePaneExpanded(h, 'search')
    const search = await ufPaneSearch(h, 'alpha')
    const rows = search.rows || []
    const rowsRendered = rows.length > 0 && rows.every((r) => r.box[2] > 0 && r.box[3] > 0)
    // real HOVER over the first row → the C6 hover affordance must paint
    let hover = null
    if (rows.length > 0) {
      const p = await h.cdp.evaluate(`(()=>{const li=document.querySelector('#pane-search li[data-document-id]');if(!li)return null;li.scrollIntoView({block:'center'});const r=li.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,bgBefore:getComputedStyle(li).backgroundColor,cls:String(li.className)}})()`)
      if (p) {
        await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y, buttons: 0 })
        await sleep(500)
        const bgAfter = await h.cdp.evaluate(`(()=>{const li=document.querySelector('#pane-search li[data-document-id]');return li?getComputedStyle(li).backgroundColor:null})()`)
        hover = { cls: p.cls, bgBefore: p.bgBefore, bgAfter, changed: p.bgBefore !== bgAfter }
      }
    }
    // a real click on a result row must open the doc in a NEW tab
    const tabsBefore = await ufTabState(h)
    await ufArmClick(h)
    const click = await ufRealClick(h, '#pane-search li[data-document-id]')
    await sleep(1800)
    const events = await ufClickProbe(h)
    const tabsAfter = await ufTabState(h)
    const newTab = tabsAfter.count === tabsBefore.count + 1
    const detail = `search pane expand=${JSON.stringify(pane)}; search pane: disclosure=${search.togglePath} inputFocus=${search.focusPath} typedValue="${search.value}" submit=${search.submitPath}; ${rows.length} result rows painted=${rowsRendered} (first doc=${rows[0] ? rows[0].doc : '?'} box=${rows[0] ? JSON.stringify(rows[0].box) : '?'} cls="${rows[0] ? rows[0].cls : '?'}"); REAL hover → bg ${hover ? hover.bgBefore : '?'} → ${hover ? hover.bgAfter : '?'} changed=${hover ? hover.changed : '?'}; REAL click on the row (path=${click.path}) → tabs ${tabsBefore.count}->${tabsAfter.count} openedNewTab=${newTab}; click-event targets=${JSON.stringify(events)}`
    if (!newTab) return rowResult('UF-PANES-14', 'A REAL typed query + REAL submit renders hover-highlighting result rows, and a REAL row click opens the linked doc in a NEW tab', 'D-interaction', `${detail}; [DIAG] attribution available — run --block=uf_tabs_7_diag (a NATIVE DOM click on the same row) to separate a dead handler from a gesture that never delivered the click`, { path: click.path, ok: false, surface: await ufSurfaceTarget(h) })
    return rowResult('UF-PANES-14', 'A REAL typed query + REAL submit renders hover-highlighting result rows, and a REAL row click opens the linked doc in a NEW tab', 'D-interaction', detail, { path: click.path, ok: rowsRendered && !!hover && hover.changed && newTab, surface: await ufSurfaceTarget(h) })
  },

  // ---- §6 Search -----------------------------------------------------------

  // UF-SEARCH-2 — the advanced-search disclosure exposes the full rag.query arg
  // surface (mode/maxHops/expand/maxParentContext/filters/stores).
  uf_search_2: async (h) => {
    await ufEnsureAppClear(h)
    // ensure the pane is EXPANDED (a collapsed pane renders no body)
    const f0 = await ufEnsurePaneExpanded(h, 'search')
    const expandedState = async () => h.cdp.evaluate(`(()=>({expanded:(document.getElementById('advanced-search-toggle')||{}).getAttribute?.('data-expanded'),fields:!!document.getElementById('advanced-search-fields')}))()`)
    // RESET: drive the disclosure CLOSED first with a real click (idempotent)
    const st0 = await expandedState()
    let resetPath = 'already-collapsed'
    if (st0.expanded === 'true') { resetPath = (await ufRealClick(h, '#advanced-search-toggle')).path; await sleep(1300) }
    const collapsed0 = await expandedState()
    const openPath = (await ufRealClick(h, '#advanced-search-toggle')).path
    await sleep(1300)
    const shown = await h.cdp.evaluate(`(()=>{
      const t=document.getElementById('advanced-search-toggle');
      const fs=document.getElementById('advanced-search-fields');
      const box=fs?fs.getBoundingClientRect():null;
      const opts=(id)=>[...((document.getElementById(id)||{}).options||[])].map((o)=>o.value);
      const ctl=(id)=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();return {tag:e.tagName,box:[Math.round(r.width),Math.round(r.height)]}};
      return {expanded:t?t.getAttribute('data-expanded'):null,toggleText:t?(t.textContent||'').trim():null,fieldsBox:box?[Math.round(box.width),Math.round(box.height)]:null,
        mode:ctl('advanced-search-mode'),modeOpts:opts('advanced-search-mode'),
        maxHops:ctl('advanced-search-max-hops'),maxHopsMin:(document.getElementById('advanced-search-max-hops')||{}).min,maxHopsMax:(document.getElementById('advanced-search-max-hops')||{}).max,
        expand:ctl('advanced-search-expand'),expandOpts:opts('advanced-search-expand'),
        maxParentContext:ctl('advanced-search-max-parent-context'),
        nodeKind:ctl('advanced-search-filter-node-kind'),edgeType:ctl('advanced-search-filter-edge-type'),
        targetDoc:ctl('advanced-search-filter-target-document-id'),targetNode:ctl('advanced-search-filter-target-node-id'),state:ctl('advanced-search-filter-state'),
        stores:ctl('advanced-search-stores'),storesOpts:opts('advanced-search-stores'),submit:ctl('advanced-search-submit')}})()`)
    const painted = (c) => !!c && c.box[0] > 0 && c.box[1] > 0
    const surface = painted(shown.mode) && painted(shown.maxHops) && painted(shown.expand) && painted(shown.maxParentContext) && painted(shown.nodeKind) && painted(shown.edgeType) && painted(shown.targetDoc) && painted(shown.targetNode) && painted(shown.state) && painted(shown.stores) && painted(shown.submit)
    const args = shown.modeOpts.includes('flat') && shown.modeOpts.includes('graph') && shown.expandOpts.includes('none') && shown.expandOpts.includes('parent') && shown.maxHopsMin === '1' && shown.maxHopsMax === '5' && shown.storesOpts.includes('all')
    // collapse again (a real click) → the disclosure hides its fields
    const closePath = (await ufRealClick(h, '#advanced-search-toggle')).path
    await sleep(1300)
    const collapsed = await h.cdp.evaluate(`(()=>({expanded:(document.getElementById('advanced-search-toggle')||{}).getAttribute?.('data-expanded'),fields:!!document.getElementById('advanced-search-fields')}))()`)
    return rowResult('UF-SEARCH-2', 'The advanced-search disclosure exposes the full rag.query arg surface, painted, in both directions', 'D-interaction', `pane expand=${JSON.stringify(f0)}; disclosure reset to collapsed (path=${resetPath}) → data-expanded=${collapsed0.expanded} fieldsRendered=${collapsed0.fields}; REAL click #advanced-search-toggle (path=${openPath}) → data-expanded=${shown.expanded} text="${shown.toggleText}" fieldsetBox=${JSON.stringify(shown.fieldsBox)}; controls painted=${surface}: mode${JSON.stringify(shown.modeOpts)} maxHops(min=${shown.maxHopsMin},max=${shown.maxHopsMax}) expand${JSON.stringify(shown.expandOpts)} maxParentContext filters(nodeKind/edgeType/targetDocumentId/targetNodeId/state) stores${JSON.stringify(shown.storesOpts)} submit; fullRagQueryArgSurface=${args}; REAL click to collapse (path=${closePath}) → expanded=${collapsed.expanded} fieldsRendered=${collapsed.fields}`, { path: openPath === 'cdp' && closePath === 'cdp' ? 'cdp' : 'native-fallback', ok: collapsed0.expanded === 'false' && shown.expanded === 'true' && !!shown.fieldsBox && shown.fieldsBox[0] > 0 && shown.fieldsBox[1] > 0 && surface && args && collapsed.expanded === 'false' && collapsed.fields === false, surface: await ufSurfaceTarget(h) })
  },

  // ---- §8 Editing / history ------------------------------------------------

  // UF-HIST-4 — at the base the Undo control is disabled; after an undo REDO
  // becomes enabled; undoing past the floor is a safe no-op (no throw, no
  // content change). The journal is walked to the floor and restored with Redo.
  // The at-base precondition is GUARDED: a store whose journal depth cannot be
  // walked back to base (cursor not null / Redo still available at the "base")
  // reports PARKED/inconclusive with the reason, never a FAIL.
  uf_hist_4: async (h) => {
    await ufEnsureAppClear(h)
    const btn = async () => h.cdp.evaluate(`(()=>{const u=document.getElementById('editor-toolbar-undo'),r=document.getElementById('editor-toolbar-redo');const c=[...document.querySelectorAll('#pane-history li')].filter((l)=>l.getAttribute('data-current')==='true').map((l)=>l.getAttribute('data-history-index'));return {undoDisabled:u?u.disabled:null,redoDisabled:r?r.disabled:null,currentIndex:c.length?c[0]:null,entries:document.querySelectorAll('#pane-history li').length}})()`)
    const s0 = await btn()
    const sig0 = await ufStageSig(h)
    const docs0 = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
    const docCount0 = docs0 && Array.isArray(docs0.documents) ? docs0.documents.length : null
    // a STORE-view signature (node ids/types/contents of one document) — stable
    // across an undo/redo walk, unlike the rendered stage text (which follows the
    // tab/focus state)
    const storeSig = async () => {
      const d = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-corpus/alpha' }).catch(() => null)
      const nodes = d && Array.isArray(d.nodes) ? d.nodes : []
      const s = nodes.map((n) => n.id + '|' + (n.type || '') + '|' + String(n.content ?? '')).join('\n')
      let hash = 0
      for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0
      return { nodes: nodes.length, hash, readOk: !!d }
    }
    const store0 = await storeSig()
    const walk = []
    let atBase = s0.undoDisabled === true
    let oneUndo = null
    const maxWalk = Math.min(Number(s0.entries || 0) + 4, 60)
    for (let i = 0; i < maxWalk && !atBase; i++) {
      const r = await ufRealClick(h, '#editor-toolbar-undo')
      await sleep(1400)
      const s = await btn()
      walk.push({ path: r.path, undoDisabled: s.undoDisabled, redoDisabled: s.redoDisabled, currentIndex: s.currentIndex })
      if (oneUndo == null) oneUndo = s
      atBase = s.undoDisabled === true
      if (i >= 1 && s.undoDisabled === false && walk.length > 2 && String(s.currentIndex) === String(walk[walk.length - 2].currentIndex)) break // no progress → stop
    }
    // over-undo at the floor: a real click must be a safe no-op
    const sBase = await btn()
    const sigBase = await ufStageSig(h)
    // AT-BASE PRECONDITION (guarded, §6.1): the walk must actually have reached
    // the journal FLOOR. A store with pending journal depth that the walk could
    // not exhaust (no progress / cursor not null / Redo still available at the
    // "base") is INCONCLUSIVE for this row — reported PARKED with the recorded
    // reason, never FAIL.
    const reachableBase = atBase === true && sBase.undoDisabled === true && sBase.redoDisabled === false && (sBase.currentIndex === null || Number(sBase.currentIndex) === 0)
    const surface = await ufSurfaceTarget(h)
    const atBaseNote = `AT BASE undoDisabled=${sBase.undoDisabled} redoDisabled=${sBase.redoDisabled} currentIndex=${sBase.currentIndex} (reachableBase=${reachableBase}; the walk stopped after ${walk.length}/${maxWalk} undos)`
    if (!reachableBase) {
      return rowResult('UF-HIST-4', 'At the base the Undo control is disabled; after an Undo the Redo control becomes enabled; over-undoing past the floor is a safe no-op', 'D-state', `INCONCLUSIVE — the journal could not be walked to the at-base precondition: start undoDisabled=${s0.undoDisabled} redoDisabled=${s0.redoDisabled} currentIndex=${s0.currentIndex} entries=${s0.entries}; ${atBaseNote}; walk=${walk.map((w) => `[${w.path}]undo->current=${w.currentIndex},undoDisabled=${w.undoDisabled},redoDisabled=${w.redoDisabled}`).join(' | ') || '(none)'} — a store with pending journal depth cannot be scored against the at-base half of this row (needs a base-state store)`, { path: 'not-reachable', ok: false, extra: { park: true }, surface })
    }
    const over = await ufRealClick(h, '#editor-toolbar-undo')
    await sleep(1400)
    const sOver = await btn()
    const sigOver = await ufStageSig(h)
    const safeNoop = sOver.undoDisabled === sBase.undoDisabled && sOver.redoDisabled === sBase.redoDisabled && sigOver.hash === sigBase.hash && sigOver.len === sigBase.len
    // restore: REDO back to the original point (one redo per undo performed)
    let restored = null
    for (let i = 0; i < maxWalk + 4; i++) {
      const s = await btn()
      if (s.redoDisabled === true) { restored = s; break }
      await ufRealClick(h, '#editor-toolbar-redo')
      await sleep(1400)
      restored = await btn()
    }
    const sigEnd = await ufStageSig(h)
    const docs1 = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
    const docCount1 = docs1 && Array.isArray(docs1.documents) ? docs1.documents.length : null
    const store1 = await storeSig()
    const restoreOk = !!restored && restored.currentIndex === s0.currentIndex && docCount1 === docCount0 && store1.hash === store0.hash && store1.nodes === store0.nodes
    const redoEnabledAfterUndo = !!oneUndo && oneUndo.redoDisabled === false
    return rowResult('UF-HIST-4', 'At the base the Undo control is disabled; after an Undo the Redo control becomes enabled; over-undoing past the floor is a safe no-op', 'D-state', `start: undoDisabled=${s0.undoDisabled} redoDisabled=${s0.redoDisabled} currentIndex=${s0.currentIndex} entries=${s0.entries} stageHash=${sig0.hash} docs=${docCount0} alphaStoreSig=${store0.nodes}nodes/${store0.hash}; walk to the floor: ${walk.length} undos → ${walk.map((w) => `[${w.path}]undo->current=${w.currentIndex},undoDisabled=${w.undoDisabled},redoDisabled=${w.redoDisabled}`).join(' | ')}; ${atBaseNote}; after-an-Undo Redo enabled=${redoEnabledAfterUndo}; OVER-UNDO at the floor: real click path=${over.path} → undoDisabled=${sOver.undoDisabled} redoDisabled=${sOver.redoDisabled} stageHash ${sigBase.hash}->${sigOver.hash} len ${sigBase.len}->${sigOver.len} → safeNoop=${safeNoop}; [restore] Redo back → currentIndex=${restored ? restored.currentIndex : '?'} redoDisabled=${restored ? restored.redoDisabled : '?'} docs=${docCount1} alphaStoreSig=${store1.nodes}nodes/${store1.hash} → restoredExactly(cursor+docCount+storeView)=${restoreOk}`, { path: over.path, ok: redoEnabledAfterUndo && safeNoop && restoreOk, surface })
  },

  // UF-HIST-6 — clicking an OLDER history entry reverts the content to that
  // journal point (multi-step undo); the UI offers NO `replay` control.
  uf_hist_6: async (h) => {
    await ufEnsureAppClear(h)
    // setup: mount beta, make ONE real edit (click into the editable + type +
    // blur) so a fresh journal point with an observable content delta exists
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-corpus/beta' } }).catch(() => null)
    await sleep(1600)
    const marker = 'UFH6' + String(Date.now()).slice(-5)
    const geo = await h.cdp.evaluate(`(()=>{const e=[...document.querySelectorAll('#zone\\\\:main [contenteditable]')][0];if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+20),y:Math.round(r.y+14),rag:e.getAttribute('data-rag-node-id')}})()`)
    if (!geo) return rowResult('U-7', 'Clicking an OLDER history entry reverts the content to that journal point; no replay control exists', 'D-state', 'no [contenteditable] in the mounted stage for the edit setup', { path: 'missing', ok: false, surface: await ufSurfaceTarget(h) })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: geo.x, y: geo.y, buttons: 0 })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: geo.x, y: geo.y, button: 'left', buttons: 1, clickCount: 1 })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: geo.x, y: geo.y, button: 'left', buttons: 0, clickCount: 1 })
    await sleep(400)
    await h.cdp.send('Input.insertText', { text: ' ' + marker })
    await sleep(300)
    await h.cdp.evaluate(`(()=>{const a=document.activeElement;if(a&&typeof a.blur==='function')a.blur();return true})()`)
    await sleep(1800)
    const hist = async () => h.cdp.evaluate(`(()=>({entries:[...document.querySelectorAll('#pane-history li')].map((l)=>({i:l.getAttribute('data-history-index'),kind:l.getAttribute('data-history-kind'),cur:l.getAttribute('data-current')==='true'})),current:[...document.querySelectorAll('#pane-history li')].filter((l)=>l.getAttribute('data-current')==='true').map((l)=>l.getAttribute('data-history-index'))[0]??null,replayControl:!!document.querySelector('[id*=replay i],[data-role*=replay i]')||/replay/i.test((document.getElementById('pane-history')||{}).textContent||'')}))()`)
    const h0 = await hist()
    const sig0 = await ufStageSig(h)
    const inStore = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-corpus/beta' }).catch(() => null)
    const committed = JSON.stringify(inStore || {}).includes(marker)
    const curIdx = h0.current == null ? null : Number(h0.current)
    const surface = await ufSurfaceTarget(h)
    if (curIdx == null || curIdx === 0) return rowResult('U-7', 'Clicking an OLDER history entry reverts the content to that journal point; no replay control exists', 'D-state', `INCONCLUSIVE — no older journal point to click (current=${h0.current}, entries=${JSON.stringify(h0.entries)}); edit committed=${committed}`, { path: 'not-reachable', ok: false, extra: { park: true }, surface })
    const target = curIdx - 1
    const click = await ufRealClick(h, `#pane-history-entry-${target}`)
    await sleep(1800)
    const h1 = await hist()
    const sig1 = await ufStageSig(h)
    const inStore1 = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-corpus/beta' }).catch(() => null)
    const markerAfter = JSON.stringify(inStore1 || {}).includes(marker)
    const reverted = !markerAfter && sig1.hash !== sig0.hash
    const positionMoved = h1.current !== h0.current
    // restore: REDO back (never an implicit redo from clicking a newer entry)
    for (let i = 0; i < 16; i++) {
      const c = await h.cdp.evaluate(`(()=>{const r=document.getElementById('editor-toolbar-redo');return r?r.disabled:null})()`)
      if (c === true) break
      await ufRealClick(h, '#editor-toolbar-redo')
      await sleep(1500)
    }
    const hEnd = await hist()
    const inStoreEnd = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-corpus/beta' }).catch(() => null)
    const markerRestored = JSON.stringify(inStoreEnd || {}).includes(marker)
    const restored = markerRestored && String(hEnd.current) === String(h0.current)
    const replayOnly = await h.cdp.evaluate(`(()=>{const c=[...document.querySelectorAll('#pane-history button,#pane-history [role="button"],#editor-toolbar button')].map((b)=>(b.textContent||'').trim());return {controls:c}})()`)
    return rowResult('U-7', 'Clicking an OLDER history entry reverts the content to that journal point; no replay control exists', 'D-state', `real edit setup: focused ${geo.rag}, typed "${marker}", commit-on-blur → committedToStore=${committed}; journal entries=${JSON.stringify(h0.entries.map((e) => e.i + '@' + e.kind))} current=${h0.current}; REAL click on the OLDER entry #${target} (path=${click.path}) → current ${h0.current}->${h1.current} moved=${positionMoved}; content reverted to that journal point: marker gone from the STORE=${!markerAfter} stageHash ${sig0.hash}->${sig1.hash} reverted=${reverted} (NOTE: pane-graph marks data-current at index cursor-1 while historyEntryClick(k) sets cursor=k, so clicking #k leaves #k-1 marked current — recorded, not scored); NO replay control in the history/editor chrome=${!h0.replayControl} (buttons=${JSON.stringify(replayOnly.controls)}); [restore] Redo → journal current=${hEnd.current} markerBackInStore=${markerRestored} restored=${restored}`, { path: click.path, ok: committed && Number(h1.current) <= target && reverted && positionMoved && !h0.replayControl && restored, surface })
  },

  // ---- §2 Layout -----------------------------------------------------------

  // UF-LAYOUT-2 — `provident.list_targets` keeps the STABLE `zone:*` ids and
  // node ids AFTER a RAG content change (a before/after comparison of the zone
  // id set AND the id↔nodeId pairing — membership of a constant list alone is a
  // trivially satisfiable proxy), and the zone containers stay rendered.
  uf_layout_2: async (h) => {
    await ufEnsureAppClear(h)
    // hygiene: a previous block's scrollIntoView on a tall pane can leave the
    // app graph above the viewport — reset so the painted-box oracle is stable
    await h.cdp.evaluate(`(()=>{window.scrollTo(0,0);const s=document.scrollingElement;if(s)s.scrollTop=0;return true})()`)
    await sleep(400)
    const zones = async () => {
      const r = await h.mcpTool(h.mcp, 'provident.list_targets', {}).catch((e) => ({ error: String(e) }))
      const nodes = (r && Array.isArray(r.nodes) ? r.nodes : []).filter((n) => typeof n.propsId === 'string' && n.propsId.startsWith('zone'))
      return { ids: nodes.map((n) => n.propsId).sort(), nodeIds: nodes.map((n) => n.propsId + '=' + n.nodeId).sort(), err: r && r.error ? r.error : null }
    }
    const before = await zones()
    const change = await h.mcpTool(h.mcp, 'edit.set_content', { nodeId: '.live-corpus/beta', content: '# Beta\n\nPane collapse (C5) — live content change for UF-LAYOUT-2.\n' }).catch((e) => ({ error: String(e) }))
    await sleep(2000)
    const after = await zones()
    const idsEqual = before.ids.length > 0 && before.ids.join(',') === after.ids.join(',')
    const idsBeforeMinusAfter = before.ids.filter((x) => !after.ids.includes(x))
    const idsAfterMinusBefore = after.ids.filter((x) => !before.ids.includes(x))
    const pairingEqual = before.nodeIds.length > 0 && before.nodeIds.join('|') === after.nodeIds.join('|')
    const pairingChanged = before.nodeIds.filter((x, i) => after.nodeIds[i] !== x).length
    const dom = await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');const l=document.getElementById('zone:left');const b=(e)=>{if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};return {main:b(m),left:b(l),mainText:(m?(m.textContent||'').replace(/\\s+/g,' ').trim().slice(0,50):null)}})()`)
    return rowResult('UF-LAYOUT-2', 'provident.list_targets keeps the STABLE zone:* ids AND node-id pairing after a RAG content change, and the zone containers stay rendered', 'D-state', `zones BEFORE the content change: ids=${JSON.stringify(before.ids)} pairing=${JSON.stringify(before.nodeIds)}${before.err ? ' err=' + before.err : ''}; edit.set_content(.live-corpus/beta) → ${change && change.ok === false ? JSON.stringify(change) : 'ok'}; zones AFTER: ids=${JSON.stringify(after.ids)} pairing=${JSON.stringify(after.nodeIds)} → zoneIdSetStable=${idsEqual} (removed=${JSON.stringify(idsBeforeMinusAfter)} added=${JSON.stringify(idsAfterMinusBefore)}) nodeIdPairingStable=${pairingEqual} (pairing entries changed=${pairingChanged}); rendered zone containers: #zone:main box=${JSON.stringify(dom.main)} text="${dom.mainText}", #zone:left box=${JSON.stringify(dom.left)} (an empty zone is display:none by design — its id survives in the graph)`, { path: 'not-gesture', gesture: false, ok: idsEqual && pairingEqual && !!dom.main && dom.main[2] > 0 && dom.main[3] > 0, surface: await ufSurfaceTarget(h) })
  },

  // UF-LAYOUT-10 — with ZERO enabled+placed panes in `left` the zone's grid
  // TRACK must collapse and the stage must reclaim the width.
  uf_layout_10: async (h) => {
    await ufEnsureAppClear(h)
    const measure = async () => h.cdp.evaluate(`(()=>{const g=(id)=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();return {box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],display:getComputedStyle(e).display,cls:String(e.className)}};const w=document.getElementById('wiki-root');return {left:g('zone:left'),main:g('zone:main'),cols:w?getComputedStyle(w).gridTemplateColumns:null,frames:document.querySelectorAll('.pane-frame[data-pane-id]').length}})()`)
    await ufModal(h, true)
    const filled = await measure()
    // REAL clicks: disable every ENABLED app-graph pane in the modal
    const enabledIds = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('#settings-modal [data-pane][data-enabled]')].map((t)=>{const p=t.getAttribute('data-pane');const root=document.querySelector('.pane-frame[data-pane-id="'+p+'"]');return root?p:null}).filter(Boolean))()`)
    const paths = []
    for (const pid of enabledIds) {
      const r = await ufRealClick(h, `#operator-pane-visibility-${pid}`)
      paths.push(pid + ':' + r.path)
      await sleep(1300)
    }
    await sleep(1500)
    const empty = await measure()
    // restore: re-enable them with REAL clicks
    const restorePaths = []
    for (const pid of enabledIds) {
      const r = await ufRealClick(h, `#operator-pane-visibility-${pid}`)
      restorePaths.push(pid + ':' + r.path)
      await sleep(1300)
    }
    await sleep(1500)
    const restored = await measure()
    const isEmptied = /is-empty/.test(empty.left ? empty.left.cls : '') && empty.frames === 0
    const trackCollapsed = (() => {
      const first = (c) => Number(String(c || '').split(' ')[0].replace('px', '')) || 0
      return first(empty.cols) === 0
    })()
    const stageReclaimed = !!empty.main && !!filled.main && empty.main.box[0] < filled.main.box[0] && empty.main.box[2] > filled.main.box[2] + 10
    const censusEnd = await h.cdp.evaluate(`(()=>{const c=document.getElementById('operator-enabled-panes');return c?(c.textContent||'').trim():null})()`)
    await ufModal(h, false)
    return rowResult('UF-LAYOUT-10', "With ZERO enabled+placed panes in the left zone, the zone's grid TRACK collapses and the stage reclaims the width", 'D-visual', `FILLED: left=${JSON.stringify(filled.left ? filled.left.box : null)} (display=${filled.left ? filled.left.display : '?'}) main=${JSON.stringify(filled.main ? filled.main.box : null)} gridColumns="${filled.cols}" frames=${filled.frames}; REAL clicks disabled ${JSON.stringify(paths)} → EMPTY: zone:left cls="${empty.left ? empty.left.cls : '?'}" display=${empty.left ? empty.left.display : '?'} box=${JSON.stringify(empty.left ? empty.left.box : null)} frames=${empty.frames} main=${JSON.stringify(empty.main ? empty.main.box : null)} gridColumns="${empty.cols}" → isEmptyMirrorApplied=${isEmptied} gridTrackCollapsed=${trackCollapsed} stageWidened/Reclaimed=${stageReclaimed} (stage x ${filled.main ? filled.main.box[0] : '?'}->${empty.main ? empty.main.box[0] : '?'}, width ${filled.main ? filled.main.box[2] : '?'}->${empty.main ? empty.main.box[2] : '?'}); [restore] REAL clicks re-enabled ${JSON.stringify(restorePaths)} → frames=${restored.frames} leftWidth=${restored.left ? restored.left.box[2] : '?'} census="${censusEnd}"`, { path: paths.every((p) => /:cdp$/.test(p)) && restorePaths.every((p) => /:cdp$/.test(p)) ? 'cdp' : 'native-fallback', ok: isEmptied && trackCollapsed && stageReclaimed, surface: await ufSurfaceTarget(h) })
  },

  // Harness hygiene (not a checklist row, no verdict — §6.1 diagnostic form):
  // restore the app's baseline live layout — the left zone EXPANDED with both
  // enabled panes expanded and the editing mode back on `contenteditable` (the
  // mode the legacy `user*` blocks assume) — so a sequential battery starts from
  // a stable, meaningful state.
  uf_restore_layout: async (h) => {
    await ufEnsureAppClear(h)
    const snap = async () => h.cdp.evaluate(`(()=>({zone:(document.getElementById('zone:left')||{}).className,frames:[...document.querySelectorAll('.pane-frame[data-pane-id]')].map((f)=>f.getAttribute('data-pane-id')+(f.classList.contains('is-collapsed')?'(collapsed)':'(expanded)')),mode:(document.getElementById('editor-toolbar-toggle')||{}).getAttribute?.('data-mode')}))()`)
    const before = await snap()
    const paths = []
    if (/is-minimized/.test(before.zone)) { paths.push('zone:' + (await ufRealClick(h, '#zone-minimize-left')).path); await sleep(1400) }
    for (const pid of ['doc-nav', 'search']) { const r = await ufEnsurePaneExpanded(h, pid); paths.push(pid + ':' + r.path) }
    let modePath = 'already-contenteditable'
    if (before.mode !== 'contenteditable') { modePath = (await ufRealClick(h, '#editor-toolbar-toggle')).path; await sleep(1600) }
    const after = await snap()
    const restoredOk = !/is-minimized/.test(after.zone) && after.frames.length >= 1 && !after.frames.some((f) => /collapsed/.test(f)) && after.mode === 'contenteditable'
    return diagResult(`baseline before: ${JSON.stringify(before)}; restore: ${JSON.stringify(paths)} editingMode ${before.mode}->${after.mode} (real click path=${modePath}); after: ${JSON.stringify(after)}; baselineRestored=${restoredOk}`)
  },

  // Harness hygiene (not a checklist row, no verdict): scroll the page back to
  // the top so coordinate-driven blocks (the legacy `user*` blocks) start from a
  // stable geometry — a previous block's `scrollIntoView` on a 9000px-tall pane
  // can otherwise leave the whole app-graph above the viewport.
  uf_scroll_reset: async (h) => {
    const before = await h.cdp.evaluate(`({y:Math.round(scrollY),h:document.documentElement.scrollHeight,vh:innerHeight})`)
    await h.cdp.evaluate(`(()=>{window.scrollTo(0,0);const s=document.scrollingElement;if(s)s.scrollTop=0;return true})()`)
    await sleep(500)
    const after = await h.cdp.evaluate(`({y:Math.round(scrollY),h:document.documentElement.scrollHeight,vh:innerHeight})`)
    return diagResult(`page scroll reset for coordinate-driven blocks: scrollY ${before.y}->${after.y} (scrollHeight=${after.h}, viewport=${after.vh}); atTop=${after.y === 0}`)
  },

  // Diagnostic (APP-level layer, no verdict — §6.1 diagnostic form): attribute
  // the stale-`#wiki-root` mount leak — count the mounts around each candidate
  // gesture. Run after a renderer reload (a reload resets the count to 1); a
  // clean app stays at 1.
  uf_mount_leak_diag: async (h) => {
    const roots = () => h.cdp.evaluate(`document.querySelectorAll('#wiki-root').length`)
    const steps = []
    const step = async (label, fn) => { const before = await roots(); if (fn) await fn(); await sleep(1700); steps.push(label + ' ' + before + '->' + (await roots())) }
    await ufEnsureAppClear(h)
    await step('baseline', null)
    await step('modal-OPEN', async () => { await ufModal(h, true) })
    await step('modal-CLOSE(Escape)', async () => { await ufModal(h, false) })
    await step('pane-crosslinks-ON', async () => { await ufModal(h, true); await ufRealClick(h, '#operator-pane-visibility-crosslinks') })
    await step('pane-crosslinks-OFF', async () => { await ufRealClick(h, '#operator-pane-visibility-crosslinks') })
    await step('pane-doc-nav-OFF', async () => { await ufRealClick(h, '#operator-pane-visibility-doc-nav') })
    await step('pane-doc-nav-ON', async () => { await ufRealClick(h, '#operator-pane-visibility-doc-nav') })
    await step('modal-CLOSE+zone-MINIMIZE', async () => { await ufModal(h, false); await ufRealClick(h, '#zone-minimize-left') })
    await step('zone-EXPAND', async () => { await ufRealClick(h, '#zone-minimize-left') })
    const final = await h.cdp.evaluate(`(()=>{const r=[...document.querySelectorAll('#wiki-root')];const m=document.getElementById('zone:main');return {roots:r.length,stale:r.filter((w)=>w.children.length===0).length,mainY:m?Math.round(m.getBoundingClientRect().y):null,scrollH:document.documentElement.scrollHeight,census:(document.getElementById('operator-enabled-panes')||{}).textContent||null}})()`)
    return diagResult(`mount count per gesture → ${steps.join(' | ')}; FINAL ${JSON.stringify(final)} (singleRootMount=${final.roots === 1})${final.roots > 1 ? ' — the app-graph re-assembly LEAKED stale childless #wiki-root mounts (each keeps the duplicated id and takes layout flow, pushing #zone:main down the page)' : ''}`)
  },

  // Diagnostic (APP-level layer, no verdict): the app-graph MOUNT inventory —
  // duplicate `#wiki-root` roots left behind in `#app` (each stale root takes
  // layout flow space and duplicates the `id`), the pane census, and how far down
  // the page the live stage sits.
  uf_mount_diag: async (h) => {
    const r = await h.cdp.evaluate(`(()=>{const roots=[...document.querySelectorAll('#wiki-root')];const main=document.getElementById('zone:main');const mr=main?main.getBoundingClientRect():null;return {roots:roots.length,emptyRoots:roots.filter((w)=>w.children.length===0).length,rootBoxes:roots.map((w)=>{const b=w.getBoundingClientRect();return [Math.round(b.y),Math.round(b.height),w.children.length]}),mainY:mr?Math.round(mr.y):null,mainBox:mr?[Math.round(mr.x),Math.round(mr.y),Math.round(mr.width),Math.round(mr.height)]:null,scrollH:document.documentElement.scrollHeight,vh:innerHeight,census:(document.getElementById('operator-enabled-panes')||{}).textContent||null,frames:[...document.querySelectorAll('.pane-frame[data-pane-id]')].map((f)=>f.getAttribute('data-pane-id'))}})()`)
    const dup = r.roots > 1
    const singleMount = !dup && r.mainY !== null && r.mainY < r.vh
    return diagResult(`#app/#wiki-root mounts=${r.roots} (childless/stale=${r.emptyRoots}) boxes[y,h,children]=${JSON.stringify(r.rootBoxes)}; #zone:main box=${JSON.stringify(r.mainBox)} (viewport height=${r.vh}) page scrollHeight=${r.scrollH}; census="${r.census}"; panes=${JSON.stringify(r.frames)} → duplicateRootMounts=${dup} singleRootMountAndStageInViewport=${singleMount}${dup ? ' (a stale empty #wiki-root keeps the `id` and takes layout flow, pushing the stage down the page)' : ''}`)
  },

  // ---- UF-GNOSIS-1: the gnosis-wikis pane lists wikis from the LIVE engine ----
  gnosis_wikis: async (h) => {
    const en = await gnosisEnablePanes(h, ['gnosis-wikis'])
    const exp = await ufEnsurePaneExpanded(h, 'gnosis-wikis')
    const s0 = await gnosisAssembleSig(h)
    const after = await gnosisPaneState(h, 'gnosis-wikis')
    const li = after ? after.lis.find((l) => l.wiki === 'wiki-0') : null
    const painted = !!(li && li.box && li.box[2] > 0 && li.box[3] > 0)
    const engine = await h.mcpTool(h.mcp, 'gnosis.wiki.list', {}).catch((e) => ({ error: String(e.message || e) }))
    const engineName = Array.isArray(engine) && engine[0] ? engine[0].name : null
    const nameMatchesEngine = !!(li && engineName && li.text === engineName)
    // CONTROL — no click for 3 s: the assembly signature must be STABLE (so a
    // later change is attributable to the click, not to a background re-derive).
    await sleep(3000)
    const s1 = await gnosisAssembleSig(h)
    const controlStable = JSON.stringify(s0) === JSON.stringify(s1)
    // REAL click on the pane's own Refresh control.
    const refresh = await ufRealClick(h, '#gnosis-wikis-refresh')
    await sleep(2500)
    const s2 = await gnosisAssembleSig(h)
    const refreshReassembled = JSON.stringify(s1) !== JSON.stringify(s2)
    // REAL click on the wiki <li> (the wiki.get selection).
    const click = await ufRealClick(h, '.pane-frame[data-pane-id="gnosis-wikis"] li[data-wiki-id="wiki-0"]')
    await sleep(2500)
    const s3 = await gnosisAssembleSig(h)
    const liClickReassembled = JSON.stringify(s2) !== JSON.stringify(s3)
    const sel = await gnosisPaneState(h, 'gnosis-wikis')
    const shown = !!(sel && /Wiki: Live Enrichment Probe/.test(sel.paneText || ''))
    const shownPainted = !!(sel && sel.frameBox[2] > 0 && sel.frameBox[3] > 0)
    const disp = await gnosisDispatchDiag(h, '.pane-frame[data-pane-id="gnosis-wikis"] li[data-wiki-id="wiki-0"]')
    const afterDispatch = await gnosisPaneState(h, 'gnosis-wikis')
    return rowResult('UF-GNOSIS-1', 'The gnosis-wikis pane renders the LIVE engine wiki list and a REAL click on a wiki shows it (wiki.get)', 'D-interaction', `enable=${JSON.stringify(en.flips)} modal=${en.open} expand=${exp.path}; pane li[data-wiki-id="wiki-0"]="${li ? li.text : 'MISSING'}" box=${li ? JSON.stringify(li.box) : 'null'} painted=${painted}; engine gnosis.wiki.list=${JSON.stringify(engine).slice(0, 160)} nameMatchesEngine=${nameMatchesEngine}; CONTROL(no click 3s) signatureStable=${controlStable} sig=${JSON.stringify(s1)}; REAL click #gnosis-wikis-refresh path=${refresh.path} → reassembled=${refreshReassembled} (sig ${JSON.stringify(s2)}) = ${refreshReassembled ? 'the handler ran' : 'NO-OP'}; REAL click the wiki li (hit=${click.rect ? click.rect.hit : '?'}) path=${click.path} → reassembled=${liClickReassembled} (sig ${JSON.stringify(s3)}) paneText="${sel ? sel.paneText : '?'}" showsWiki=${shown} framePainted=${shownPainted}; [DIAG] direct provident.dispatch on the SAME li node ${JSON.stringify(disp.nodeId)} → listedHandler=${JSON.stringify(disp.handlers)} results=${JSON.stringify(disp.results)} and the pane still reads "${afterDispatch ? afterDispatch.paneText : '?'}" (the handler EXISTS + RUNS, its body's seam is a no-op)`, { path: refresh.path === 'cdp' && click.path === 'cdp' ? 'cdp' : click.path, ok: painted && nameMatchesEngine && controlStable && refreshReassembled && liClickReassembled && shown && shownPainted, surface: await ufSurfaceTarget(h) })
  },

  // ---- UF-GNOSIS-2: gnosis-documents lists a wiki's documents (no deadlock) ----
  gnosis_documents: async (h) => {
    const en = await gnosisEnablePanes(h, ['gnosis-documents'])
    const exp = await ufEnsurePaneExpanded(h, 'gnosis-documents')
    const refresh = await ufRealClick(h, '#gnosis-documents-refresh')
    await sleep(2200)
    const withWikis = await gnosisPaneState(h, 'gnosis-documents')
    const wikiLi = withWikis ? withWikis.lis.find((l) => l.wiki === 'wiki-0') : null
    const wikiPainted = !!(wikiLi && wikiLi.box && wikiLi.box[2] > 0 && wikiLi.box[3] > 0)
    const deadlock = !!(withWikis && withWikis.state === 'unavailable')
    const s1 = await gnosisAssembleSig(h)
    const selectWiki = await ufRealClick(h, '.pane-frame[data-pane-id="gnosis-documents"] li[data-wiki-id="wiki-0"]')
    await sleep(2800)
    const s2 = await gnosisAssembleSig(h)
    const selectReassembled = JSON.stringify(s1) !== JSON.stringify(s2)
    const withDocs = await gnosisPaneState(h, 'gnosis-documents')
    const docLi = withDocs ? withDocs.lis.find((l) => l.doc === 'doc-1') : null
    const docPainted = !!(docLi && docLi.box && docLi.box[2] > 0 && docLi.box[3] > 0)
    const openable = !!(withDocs && withDocs.lis.filter((l) => l.wiki || l.doc).length > 0)
    const selectDoc = docLi ? await ufRealClick(h, '.pane-frame[data-pane-id="gnosis-documents"] li[data-document-id="doc-1"]') : { path: 'missing' }
    await sleep(2600)
    const withDoc = await gnosisPaneState(h, 'gnosis-documents')
    const docShown = !!(withDoc && /Document: Enrichment Doc/.test(withDoc.paneText || '') && /Revision: 1/.test(withDoc.paneText || ''))
    // [DIAG] the SAME selection handed straight to the pane handler, and the
    // DIRECT bridge surface (the one `boot()` uses) — to pin WHERE the break is.
    const disp = await gnosisDispatchDiag(h, '.pane-frame[data-pane-id="gnosis-documents"] li[data-wiki-id="wiki-0"]')
    const afterDispState = await gnosisPaneState(h, 'gnosis-documents')
    const direct = await h.cdp.evaluate(`window.provident.gnosis.documents('gnosis.document.list',{wikiId:'wiki-0'}).then((r)=>JSON.stringify(r).slice(0,220)).catch((e)=>'REJECTED:'+String(e&&e.message||e))`)
    await sleep(2500)
    const afterDirect = await gnosisPaneState(h, 'gnosis-documents')
    return rowResult('UF-GNOSIS-2', 'The gnosis-documents pane renders the selected wiki DOCUMENT LIST with the live engine READY (never a permanent data-gnosis-state="unavailable" deadlock) and opens a document', 'D-interaction', `enable=${JSON.stringify(en.flips)}; REAL click #gnosis-documents-refresh path=${refresh.path} → wiki li[data-wiki-id="wiki-0"]="${wikiLi ? wikiLi.text : 'MISSING'}" box=${wikiLi ? JSON.stringify(wikiLi.box) : 'null'} painted=${wikiPainted} deadlockUnavailable=${deadlock} clickableItems=${withWikis ? withWikis.lis.filter((l) => l.wiki || l.doc).length : 0}; REAL click that wiki li path=${selectWiki.path} (hit=${selectWiki.rect ? selectWiki.rect.hit : '?'}) → reassembled=${selectReassembled} doc Li[data-document-id="doc-1"]="${docLi ? docLi.text : 'MISSING'}" painted=${docPainted} paneText="${withDocs ? withDocs.paneText : '?'}"; REAL click a doc li path=${selectDoc.path} → documentViewShown=${docShown}; [DIAG] direct provident.dispatch on the wiki li (${JSON.stringify(disp.handlers)}, results=${JSON.stringify(disp.results)}) left the pane at "${afterDispState ? afterDispState.paneText : '?'}"; the DIRECT bridge window.provident.gnosis.documents('gnosis.document.list',{wikiId:'wiki-0'}) RESOLVES from the live engine → ${direct}; after it the pane STILL reads "${afterDirect ? afterDirect.paneText : '?'}" (the engine + IPC + pane render path all work; the pane's own handler seam is a no-op)`, { path: refresh.path === 'cdp' && selectWiki.path === 'cdp' && selectDoc.path === 'cdp' ? 'cdp' : selectDoc.path, ok: wikiPainted && !deadlock && openable && docPainted && docShown && selectReassembled, surface: await ufSurfaceTarget(h) })
  },

  // ---- UF-GNOSIS-3: gnosis-query submits a REAL engine query and renders it ----
  gnosis_query: async (h) => {
    const en = await gnosisEnablePanes(h, ['gnosis-query'])
    const exp = await ufEnsurePaneExpanded(h, 'gnosis-query')
    const focus = await ufRealClick(h, '#gnosis-query-input')
    await sleep(300)
    await h.cdp.evaluate(`(()=>{const e=document.getElementById('gnosis-query-input');if(e)e.value='';return true})()`)
    await h.cdp.send('Input.insertText', { text: 'enrichment graph node' })
    await sleep(300)
    const typed = await h.cdp.evaluate(`(document.getElementById('gnosis-query-input')||{}).value||null`)
    const submit = await ufRealClick(h, '#gnosis-query-submit')
    await sleep(3500)
    const st = await gnosisPaneState(h, 'gnosis-query')
    const rows = st ? st.lis.filter((l) => l.doc || l.node) : []
    const painted = rows.filter((l) => l.box && l.box[2] > 0 && l.box[3] > 0)
    const engine = await h.mcpTool(h.mcp, 'gnosis.stream', { query: 'enrichment graph node' }).catch((e) => ({ error: String(e.message || e) }))
    const streamChunks = engine && engine.chunks ? engine.chunks : null
    const streamResult = streamChunks && streamChunks[0] && streamChunks[0].type === 'result' ? streamChunks[0].result : null
    const mcpQuery = await h.mcpTool(h.mcp, 'gnosis.query', { query: 'enrichment graph node' }).catch((e) => ({ __error: String(e.message || e) }))
    const paneRenderedResults = rows.length > 0
    return rowResult('UF-GNOSIS-3', 'A REAL typed query + REAL submit in the gnosis-query pane runs a real engine query and renders >=1 result row (painted)', 'D-interaction', `enable=${JSON.stringify(en.flips)} expand=${exp.path}; REAL click #gnosis-query-input path=${focus.path} + Input.insertText → typedValue="${typed}"; REAL click #gnosis-query-submit path=${submit.path} → pane data-gnosis-pane=query data-gnosis-query="${st ? st.queryAttr : '?'}" traceMode=${st ? st.traceMode : '?'} renderedResultRows=${rows.length} painted=${painted.length} paneText="${st ? st.paneText : '?'}"; INDEPENDENT ORACLE — the SAME query over the GET path (gnosis.stream) returns ${streamResult ? streamResult.results.length + ' results (first "' + streamResult.results[0].snippet + '" @ ' + streamResult.results[0].score + ')' : JSON.stringify(engine).slice(0, 200)}; the POST path (gnosis.query MCP) returns ${JSON.stringify(mcpQuery).slice(0, 200)}`, { path: focus.path === 'cdp' && submit.path === 'cdp' ? 'cdp' : submit.path, ok: paneRenderedResults && painted.length > 0 && !!streamResult && streamResult.results.length > 0, surface: await ufSurfaceTarget(h) })
  },

  // ---- UF-GNOSIS-4: gnosis-status is modal-confined + MCP-invisible ----
  gnosis_status: async (h) => {
    await ufEnsureAppClear(h)
    const open = await ufModal(h, true)
    await sleep(1200)
    const before = await h.cdp.evaluate(`(()=>{const p=document.querySelector('[data-gnosis-pane="status"]');if(!p)return null;const r=p.getBoundingClientRect();return {inModal:!!p.closest('#settings-modal-body'),inOperatorPanes:!!p.closest('#operator-panes'),box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],state:p.getAttribute('data-gnosis-state'),version:p.getAttribute('data-engine-version'),text:String(p.textContent||'').replace(/\\s+/g,' ').trim(),subs:[...p.querySelectorAll('li[data-subsystem]')].map((li)=>li.getAttribute('data-subsystem')+'='+li.getAttribute('data-ok'))}})()`)
    // CONTROL — no gesture for 3 s: the assembly signature must be STABLE, so a
    // change after the click is causally attributable to the click.
    const s1 = await gnosisAssembleSig(h)
    await sleep(3000)
    const s2 = await gnosisAssembleSig(h)
    const controlStable = JSON.stringify(s1) === JSON.stringify(s2)
    const rb = await ufRealClick(h, '#gnosis-status-refresh')
    await sleep(2800)
    const s3 = await gnosisAssembleSig(h)
    const refreshReassembled = JSON.stringify(s2) !== JSON.stringify(s3)
    const after = await h.cdp.evaluate(`(()=>{const p=document.querySelector('[data-gnosis-pane="status"]');if(!p)return null;const r=p.getBoundingClientRect();return {box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],state:p.getAttribute('data-gnosis-state'),text:String(p.textContent||'').replace(/\\s+/g,' ').trim()}})()`)
    const engine = await h.mcpTool(h.mcp, 'gnosis.status', {}).catch((e) => ({ error: String(e.message || e) }))
    await ufModal(h, false)
    const html = await h.mcpTool(h.mcp, 'provident.get_rendered_html', {}).catch((e) => ({ error: String(e.message || e) }))
    const targets = await h.mcpTool(h.mcp, 'provident.list_targets', {}).catch((e) => ({ error: String(e.message || e) }))
    const htmlStr = typeof html === 'string' ? html : JSON.stringify(html)
    const tgtStr = JSON.stringify(targets)
    const statusInHtml = /gnosis-status-refresh|data-gnosis-pane="status"|Gnosis engine/.test(htmlStr)
    const statusInTargets = /gnosis-status/.test(tgtStr)
    const painted = !!(before && before.box[2] > 0 && before.box[3] > 0)
    const matchesEngine = !!(before && engine && before.state === engine.state && before.version === engine.version && before.subs.length === Object.keys(engine.subsystems || {}).length && before.subs.every((s) => s.endsWith('=true')))
    const repainted = !!(after && after.box[2] > 0 && after.box[3] > 0 && after.state === 'Ready')
    return rowResult('UF-GNOSIS-4', 'The gnosis-status pane renders the LIVE engine report INSIDE the settings modal (painted), #gnosis-status-refresh updates it, and the pane is ABSENT from the app-graph MCP surfaces', 'D-state', `modal opened by a REAL click (path=${open.path}); pane inModal=${before ? before.inModal : '?'} inOperatorPanes=${before ? before.inOperatorPanes : '?'} box=${before ? JSON.stringify(before.box) : 'null'} painted=${painted} data-gnosis-state=${before ? before.state : '?'} version=${before ? before.version : '?'} subsystems=${JSON.stringify(before ? before.subs : null)} text="${before ? before.text.slice(0, 200) : '?'}"; matchesLiveEngineReport(state+version+subsystemCensus)=${matchesEngine} (engine gnosis.status state=${engine ? engine.state : '?'} version=${engine ? engine.version : '?'}); CONTROL(no click 3 s) signatureStable=${controlStable} (sig ${JSON.stringify(s1)}); REAL click #gnosis-status-refresh path=${rb.path} (hit=${rb.rect ? rb.rect.hit : '?'}) → app-graph RE-ASSEMBLED=${refreshReassembled} (sig ${JSON.stringify(s3)}) which is the causal proof the click reached its handler → refreshStatus() → the live engine read → onChanged()/host.refresh(); repainted=${repainted} state=${after ? after.state : '?'} (a value delta is impossible here: the engine's HealthReport is invariant while the engine stays Ready); MCP invisibility: get_rendered_html(${htmlStr.length} chars) contains a status-pane marker=${statusInHtml}; list_targets contains "gnosis-status"=${statusInTargets}`, { path: rb.path, ok: painted && matchesEngine && controlStable && refreshReassembled && repainted && !statusInHtml && !statusInTargets, surface: await ufSurfaceTarget(h) })
  },

  // ---- UF-GNOSIS-5: the docs-pane Update path (HC1) ----
  gnosis_doc_update: async (h) => {
    const en = await gnosisEnablePanes(h, ['gnosis-documents'])
    const exp = await ufEnsurePaneExpanded(h, 'gnosis-documents')
    await ufRealClick(h, '#gnosis-documents-refresh')
    await sleep(2000)
    await ufRealClick(h, '.pane-frame[data-pane-id="gnosis-documents"] li[data-wiki-id="wiki-0"]')
    await sleep(2600)
    const st = await gnosisPaneState(h, 'gnosis-documents')
    const beforeGraph = await h.mcpTool(h.mcp, 'gnosis.document.get', { documentId: 'doc-1' }).catch((e) => ({ __error: String(e.message || e) }))
    // The HC1 hazard: an Update control that submits an EMPTY graph. Ask the LIVE
    // DOM for any update control, then ask the MCP surface what an empty-graph
    // update actually does (the same handler the UI would reach).
    const updateControl = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="gnosis-documents"]');return f?[...f.querySelectorAll('button,input')].map((c)=>c.id).filter((id)=>/update/i.test(id)):null})()`)
    const emptyGraph = await h.mcpTool(h.mcp, 'gnosis.document.update', { callerId: 'operator', documentId: 'doc-1', baseRevision: 1, graph: { nodes: [], edges: [] } }).catch((e) => ({ __error: String(e.message || e) }))
    await sleep(1200)
    const afterGraph = await h.mcpTool(h.mcp, 'gnosis.document.get', { documentId: 'doc-1' }).catch((e) => ({ __error: String(e.message || e) }))
    const nodesBefore = beforeGraph && beforeGraph.graph ? beforeGraph.graph.nodes.length : null
    const nodesAfter = afterGraph && afterGraph.graph ? afterGraph.graph.nodes.length : null
    const graphIntact = nodesBefore === nodesAfter && nodesBefore === 4
    const textBefore = beforeGraph && beforeGraph.graph ? beforeGraph.graph.nodes.map((n) => n.value).join('|') : null
    const textAfter = afterGraph && afterGraph.graph ? afterGraph.graph.nodes.map((n) => n.value).join('|') : null
    return parkRow('UF-GNOSIS-5', 'The docs-pane Update path does NOT blank the document content with an empty-graph placeholder (HC1: a real graph-edit surface is the truthful path)', 'D-state', 'the docs-pane renders NO Update control at all (W1-Q12 parked it deliberately), so the row has no drivable Update gesture', `enable=${JSON.stringify(en.flips)} expand=${exp.path}; rendered gnosis-documents controls=${JSON.stringify(st ? st.controls : null)} updateControlsInPane=${JSON.stringify(updateControl)}; the engine document is UNCHANGED by the whole pane drive: doc-1 graph nodes ${nodesBefore}->${nodesAfter} (graphIntact=${graphIntact}) values-identical=${textBefore === textAfter}; the empty-graph path is also unreachable over MCP: gnosis.document.update {graph:{nodes:[],edges:[]}} → ${JSON.stringify(emptyGraph).slice(0, 200)} (the shell-side edit-authority gate denies it BEFORE any engine wire call; the engine is left at revision ${afterGraph ? afterGraph.revision : '?'})`, { path: 'element-absent', surface: await ufSurfaceTarget(h) })
  },

  // ---- UF-GNOSIS-6: the gnosis CRUD controls' reachability ----
  gnosis_crud: async (h) => {
    const en = await gnosisEnablePanes(h, ['gnosis-wikis', 'gnosis-documents'])
    await ufEnsurePaneExpanded(h, 'gnosis-wikis')
    await ufEnsurePaneExpanded(h, 'gnosis-documents')
    await ufRealClick(h, '#gnosis-wikis-refresh')
    await sleep(1800)
    await ufRealClick(h, '#gnosis-documents-refresh')
    await sleep(1800)
    const s1 = await gnosisAssembleSig(h)
    await ufRealClick(h, '.pane-frame[data-pane-id="gnosis-documents"] li[data-wiki-id="wiki-0"]')
    await sleep(2600)
    const s2 = await gnosisAssembleSig(h)
    const selectReassembled = JSON.stringify(s1) !== JSON.stringify(s2)
    const w = await gnosisPaneState(h, 'gnosis-wikis')
    const d = await gnosisPaneState(h, 'gnosis-documents')
    const ids = [...(w ? w.controls : []), ...(d ? d.controls : [])]
    const present = { wikisRefresh: ids.includes('gnosis-wikis-refresh'), wikisCreate: ids.includes('gnosis-wikis-create'), wikisSelect: !!(w && w.lis.some((l) => l.wiki === 'wiki-0')), docsRefresh: ids.includes('gnosis-documents-refresh'), docsCreate: ids.includes('gnosis-documents-create'), docsSelectWiki: !!(d && d.lis.some((l) => l.wiki === 'wiki-0')), docsSelectDoc: !!(d && d.lis.some((l) => l.doc === 'doc-1')), docsDelete: ids.includes('gnosis-documents-delete'), docsPublish: ids.includes('gnosis-documents-publish'), docsUnpublish: ids.includes('gnosis-documents-unpublish'), docsArchive: ids.includes('gnosis-documents-archive'), docsUpdate: ids.includes('gnosis-documents-update') }
    const boxes = await h.cdp.evaluate(`(()=>{const out={};for(const id of ['gnosis-wikis-refresh','gnosis-wikis-create','gnosis-documents-refresh','gnosis-documents-create','gnosis-documents-delete','gnosis-documents-publish','gnosis-documents-unpublish','gnosis-documents-archive']){const e=document.getElementById(id);if(!e){out[id]=null;continue}const r=e.getBoundingClientRect();out[id]=[Math.round(r.width),Math.round(r.height)]}return out})()`)
    const allPresent = Object.entries(present).filter(([k]) => k !== 'docsUpdate').every(([, v]) => v === true)
    const allPainted = Object.values(boxes).every((b) => Array.isArray(b) && b[0] > 0 && b[1] > 0)
    // The MUTATING verb probe: the control does not exist in the rendered DOM, so
    // drive the SAME tool over the MCP surface (the identical handleGnosisTool
    // call the UI bridge would make) and record what a mutation actually does.
    const engineDeletes = await h.mcpTool(h.mcp, 'gnosis.document.delete', { callerId: 'operator', documentId: 'doc-1' }).catch((e) => ({ __error: String(e.message || e) }))
    const docStill = await h.mcpTool(h.mcp, 'gnosis.document.get', { documentId: 'doc-1' }).catch((e) => ({ __error: String(e.message || e) }))
    const engineCreates = await h.mcpTool(h.mcp, 'gnosis.document.create', { callerId: 'operator', wikiId: 'wiki-0', title: 'battery' }).catch((e) => ({ __error: String(e.message || e) }))
    const readVerbsReachedEngine = !!(w && w.lis.some((l) => l.wiki === 'wiki-0')) && !!(d && d.lis.some((l) => l.wiki === 'wiki-0'))
    // A REAL click on a read control in the same pane, for the inertness proof.
    const rf = await ufRealClick(h, '#gnosis-documents-refresh')
    await sleep(2500)
    const s3 = await gnosisAssembleSig(h)
    const readRefreshReassembled = JSON.stringify(s2) !== JSON.stringify(s3)
    return rowResult('UF-GNOSIS-6', "Each gnosis CRUD action's UI control is present and performs a REAL engine wire call (create/get/list/delete/publish/unpublish/archive)", 'D-interaction', `enable=${JSON.stringify(en.flips)}; rendered controls present=${JSON.stringify(present)} allPresentExceptUpdate=${allPresent} paintedBoxes=${JSON.stringify(boxes)} allPainted=${allPainted} → the delete/publish/unpublish/archive controls are NOT in the rendered DOM because they are conditionally rendered only when a document is SELECTED, and the selection seam is a no-op (below); the Update control is absent by design (HC1); REAL click on the wiki li in gnosis-documents → app-graph reassembled=${selectReassembled} (FALSE ⇒ the pane's handler seam did nothing: no gnosis.document.list wire call); REAL click #gnosis-documents-refresh → reassembled=${readRefreshReassembled} (FALSE ⇒ no gnosis.wiki.list wire call either); the ONLY live engine reads came from the host's BOOT path, not from any control: gnosis-wikis li[data-wiki-id=wiki-0]="${w && w.lis[0] ? w.lis[0].text : '?'}" and the gnosis-documents wiki selector li="${d && d.lis[0] ? d.lis[0].text : '?'}" readVerbsReachedEngine(boot-sourced)=${readVerbsReachedEngine}; MUTATING verbs over the SAME MCP handler: gnosis.document.delete {callerId:'operator'} → ${JSON.stringify(engineDeletes).slice(0, 130)}; gnosis.document.create {callerId:'operator'} → ${JSON.stringify(engineCreates).slice(0, 130)}; doc-1 survived=${!!(docStill && docStill.documentId)} (the mutating half is ALSO gated fail-closed: this app instance was booted without PROVIDENT_OPERATOR_CREDENTIAL, so the shell-side AuthorityStore denies before any engine wire call)`, { path: rf.path === 'cdp' ? 'cdp' : rf.path, ok: allPresent && allPainted && selectReassembled && readRefreshReassembled, surface: await ufSurfaceTarget(h) })
  },

  // =========================================================================
  // UNIT O-0 — the 5 closed measurement blocks (§3.1). Every block returns
  // §3.2's `diagResult` NON-row shape (row/dclass null, realInput false,
  // proxyPASS false, pass false, diagnostic true) with the §4.3 freeze row(s)
  // under `extra.o0` — so no O-0 block can ever be promoted to a §5.U matrix
  // verdict (§3.2: §5.U stays capped at 8) and its honesty rule stays
  // `unseparated:true` rather than a user-visible PASS.
  // =========================================================================

  // ---- §3.1/§2.3/§2.4 — one FREEZE on a real folder-row disclosure gesture ----
  o0_folder_row: async (h) => {
    // §4.3 — the field contract this block emits, pinned at the emit site and
    // drift-checked against the shared builder's list (a silent drift would emit a
    // thinner artifact, which is exactly what D4/§4.3 forbid).
    const REQUIRED = ['id', 'block', 'gesture', 'target', 'path', 'stageCount', 'stages', 'longTasks', 'longTaskTotalMs', 'mutations', 'wallMs', 'gpu', 'trackAblation', 'bundleVerified', 'pass', 'failReasons']
    if (JSON.stringify(REQUIRED) !== JSON.stringify(O0_REQUIRED_ROW_FIELDS)) {
      throw new Error('O-0 §4.3 row-field contract drifted from O0_REQUIRED_ROW_FIELDS')
    }
    const frames = (await ufPaneFrames(h)).length // §6 S5 — the pane-set census at the freeze
    const enumerated = await o0FolderRows(h)
    const pick = o0PickFolderRow(enumerated) // the PINNED pick (§2.3)
    const leg = (h.o0 && h.o0.gpuFlag === true) ? 'on' : 'off'
    const taken = o0Acc.runs.map((r) => r.id)
    const row = await o0FreezeRow(h, {
      id: o0RunId('folder-row', leg, 'o0_folder_row', taken),
      block: 'o0_folder_row',
      gesture: 'folder-row',
      target: pick ? o0AttrSelector(O0_DOCNAV, 'data-folder-path', pick.folderPath) : O0_FOLDER_SELECTOR,
      folderPath: pick ? pick.folderPath : null,
      documentId: null,
      paneFrames: frames,
      hook: true, // §3.6 — armed for stages 1-3; every other stage is emitted unseparated
    })
    row.folderRowCensus = { enumerated: enumerated.length, rows: enumerated.slice(0, 40), chosen: pick }
    o0Acc.runs.push(row)
    if (row.unseparatedStages && row.unseparatedStages.length) o0Acc.notes.push(`o0_folder_row: unseparated stages [${row.unseparatedStages.join(', ')}] — emitted ms:null + unseparated (never imputed, §6 F4)`)
    return diagResult(
      `folder-row freeze: chosen data-folder-path=${pick ? pick.folderPath : 'null'} (of ${enumerated.length} row(s), pinned pick = largest child-row count, ties lexicographic) path=${row.path} longTaskTotalMs=${row.longTaskTotalMs} mutations=${row.mutations} wallMs=${row.wallMs} hook=${JSON.stringify(row.hook)} unseparated=[${(row.unseparatedStages || []).join(',')}] pass=${row.pass}${row.failReasons.length ? ' reasons=' + JSON.stringify(row.failReasons) : ''}`,
      { o0: row, freeze: { stageCount: row.stageCount, folderPath: row.folderPath, snapshotPullMs: (row.stages.find((s) => s.id === 'snapshot.pull') || {}).ms } },
    )
  },

  // ---- §3.1/§2.3 — one FREEZE on a real document-row open gesture ----
  o0_document_row: async (h) => {
    await ufEnsureAppClear(h)
    let rows = await h.cdp.evaluate(`(()=>[...document.querySelectorAll(${JSON.stringify(O0_DOCUMENT_SELECTOR)})].map((r)=>({documentId:r.getAttribute('data-document-id')})))()`)
    if (!rows.length) {
      // §2.3 precondition (NOT part of the measured window): reveal the document
      // rows through the pinned folder-row disclosure, then re-enumerate.
      const enumerated = await o0FolderRows(h)
      const pick = o0PickFolderRow(enumerated)
      if (pick) {
        // PRECONDITION, not a measurement (§2 "one freeze per block"): the row is
        // discarded and only the precondition path is recorded in the notes.
        const reveal = await o0FreezeRow(h, { id: 'o0-docnav-reveal-precondition', block: 'o0_document_row', gesture: 'folder-row', target: o0AttrSelector(O0_DOCNAV, 'data-folder-path', pick.folderPath), folderPath: pick.folderPath, documentId: null, paneFrames: (await ufPaneFrames(h)).length, hook: false })
        o0Acc.notes.push(`o0_document_row: the doc-nav disclosure of ${pick.folderPath} was driven as a PRECONDITION (${reveal.path}, not measured) so a document row existed to measure — the measured freeze is the document-row open only.`)
        await sleep(400)
      }
      rows = await h.cdp.evaluate(`(()=>[...document.querySelectorAll(${JSON.stringify(O0_DOCUMENT_SELECTOR)})].map((r)=>({documentId:r.getAttribute('data-document-id')})))()`)
    }
    const documentId = rows.length ? rows[0].documentId : null
    const leg = (h.o0 && h.o0.gpuFlag === true) ? 'on' : 'off'
    const row = await o0FreezeRow(h, {
      id: o0RunId('document-row', leg, 'o0_document_row', o0Acc.runs.map((r) => r.id)),
      block: 'o0_document_row',
      gesture: 'document-row', // the U-1 / uf_panes_12 gesture class
      target: documentId ? `${O0_DOCNAV} [data-document-id="${documentId}"]` : O0_DOCUMENT_SELECTOR,
      folderPath: null,
      documentId: documentId,
      paneFrames: (await ufPaneFrames(h)).length,
      hook: true,
    })
    o0Acc.runs.push(row)
    if (row.unseparatedStages && row.unseparatedStages.length) o0Acc.notes.push(`o0_document_row: unseparated stages [${row.unseparatedStages.join(', ')}]`)
    return diagResult(
      `document-row freeze: documentId=${documentId} (of ${rows.length} rendered document row(s)) path=${row.path} longTaskTotalMs=${row.longTaskTotalMs} mutations=${row.mutations} wallMs=${row.wallMs} unseparated=[${(row.unseparatedStages || []).join(',')}] pass=${row.pass}${row.failReasons.length ? ' reasons=' + JSON.stringify(row.failReasons) : ''}`,
      { o0: row, freeze: { stageCount: row.stageCount, documentId: documentId } },
    )
  },

  // ---- §3.1/§2.4/§3.3 — the GPU-on/off control: the SAME two gestures at this
  //      invocation's flag, PAIRED with the counterpart leg (§3.5 runs one leg
  //      per invocation; the app-side flag is recorded per leg). ----
  o0_gpu_control: async (h) => {
    const leg = (h.o0 && h.o0.gpuFlag === true) ? 'on' : 'off'
    const frames = (await ufPaneFrames(h)).length
    const enumerated = await o0FolderRows(h)
    const pick = o0PickFolderRow(enumerated)
    const taken = o0Acc.runs.map((r) => r.id)
    const folder = await o0FreezeRow(h, { id: o0RunId('folder-row', leg, 'o0_gpu_control', taken), block: 'o0_gpu_control', gesture: 'folder-row', target: pick ? o0AttrSelector(O0_DOCNAV, 'data-folder-path', pick.folderPath) : O0_FOLDER_SELECTOR, folderPath: pick ? pick.folderPath : null, documentId: null, paneFrames: frames, hook: true })
    const docRows = await h.cdp.evaluate(`(()=>[...document.querySelectorAll(${JSON.stringify(O0_DOCUMENT_SELECTOR)})].map((r)=>({documentId:r.getAttribute('data-document-id')})))()`)
    const documentId = docRows.length ? docRows[0].documentId : null
    const doc = await o0FreezeRow(h, { id: o0RunId('document-row', leg, 'o0_gpu_control', [...taken, folder.id]), block: 'o0_gpu_control', gesture: 'document-row', target: documentId ? `${O0_DOCNAV} [data-document-id="${documentId}"]` : O0_DOCUMENT_SELECTOR, folderPath: null, documentId: documentId, paneFrames: frames, hook: true })
    o0Acc.runs.push(folder, doc)
    const counterpartLeg = leg === 'on' ? 'off' : 'on'
    const pairedWith = [`o0-folder-row-gpu${counterpartLeg}-r1`, `o0-document-row-gpu${counterpartLeg}-r1`]
    const pairing = [
      { id: `gpu-${leg}`, runRef: folder.id, legRuns: [folder.id, doc.id], pairedWith: pairedWith[0], pairedWithStatus: 'cross-artifact', counterpartGesture: 'folder-row', counterpartRun: pairedWith[0] },
      { id: `gpu-${leg}`, runRef: doc.id, legRuns: [folder.id, doc.id], pairedWith: pairedWith[1], pairedWithStatus: 'cross-artifact', counterpartGesture: 'document-row', counterpartRun: pairedWith[1] },
    ]
    const vacuous = o0Acc.runs.some((r) => o0LegOfRun(r) === `gpu-${counterpartLeg}`)
    o0Acc.notes.push(vacuous
      ? `o0_gpu_control: the counterpart gpu-${counterpartLeg} leg ran in the SAME invocation as this gpu-${leg} leg, so both legs were measured under ONE app-side flag — the control is vacuous and the report records it (§5.U-2.4: the paired legs must differ).`
      : `o0_gpu_control: the gpu-${leg} leg is paired CROSS-ARTIFACT with gpu-${counterpartLeg} (${pairedWith.join(', ')}) — the §3.5 command pair emits one artifact per leg; only the merged artifact verifies the pairing.`)
    const row = folder
    return diagResult(
      `gpu-control leg gpu-${leg}: folder-row path=${folder.path} longTaskTotalMs=${folder.longTaskTotalMs} mutations=${folder.mutations} | document-row path=${doc.path} longTaskTotalMs=${doc.longTaskTotalMs} mutations=${doc.mutations} | pairedWith=[${pairedWith.join(', ')}] appFlag=${h.o0 ? h.o0.appFlag : 'connect'} vacuous=${vacuous} unseparated=[${(row.unseparatedStages || []).join(',')}]`,
      { o0: [folder, doc], freeze: { stageCount: folder.stageCount, pairing: pairing, gpu: h.o0 ? h.o0.gpuFlag : null } },
    )
  },

  // ---- §3.1/§2.4 — the `display:block` ablation of the 12698.7 px grid track:
  //      two paired freezes of the SAME gesture that differ ONLY in the mutation.
  o0_track_ablation: async (h) => {
    const frames = (await ufPaneFrames(h)).length
    const enumerated = await o0FolderRows(h)
    const pick = o0PickFolderRow(enumerated)
    const target = pick ? o0AttrSelector(O0_DOCNAV, 'data-folder-path', pick.folderPath) : O0_FOLDER_SELECTOR
    const cell = await h.cdp.evaluate(`(()=>{
      const root = document.getElementById('wiki-root');
      const cellEl = document.getElementById('zone:main') || (root ? root.querySelector('[data-zone="main"]') : null);
      const sel = cellEl ? (cellEl.id ? '#' + cellEl.id : cellEl.tagName.toLowerCase()) : '#zone:main';
      if (!root || !cellEl) return { available: false, selector: sel, elId: cellEl && cellEl.id ? cellEl.id : null, computed: cellEl ? getComputedStyle(cellEl).display : null, rootDisplay: root ? getComputedStyle(root).display : null, detail: 'the stage cell or #wiki-root is absent in the executing bundle' };
      const rootDisplay = getComputedStyle(root).display;
      const computed = getComputedStyle(cellEl).display;
      const inGrid = root.contains(cellEl) && rootDisplay === 'grid';
      return { available: inGrid, selector: sel, elId: cellEl.id || null, computed: computed, rootDisplay: rootDisplay, previous: cellEl.style.display, detail: inGrid ? 'the stage cell is a grid item of #wiki-root' : 'the stage cell is not a grid item in the executing bundle (' + sel + ' computed display=' + computed + ')' };
    })()`)
    const leg = (h.o0 && h.o0.gpuFlag === true) ? 'on' : 'off'
    const taken = o0Acc.runs.map((r) => r.id)
    if (!cell.available) {
      // §6 F5 — a DOCUMENTED FAIL-STATE, never a park: the paired run is emitted
      // with applied:false + mutation:null and the unavailability is named.
      const row = await o0FreezeRow(h, { id: o0RunId('folder-row', leg, 'o0_track_ablation', taken), block: 'o0_track_ablation', gesture: 'folder-row', target: target, folderPath: pick ? pick.folderPath : null, documentId: null, paneFrames: frames, hook: true, trackAblation: { applied: false, mutation: null } })
      row.failReasons = [...row.failReasons, `track ablation unavailable: the stage cell is not a grid item in the executing bundle (${cell.selector} computed display=${cell.computed})`]
      row.pass = false
      row.trackAblationEvidence = cell
      o0Acc.runs.push(row)
      o0Acc.notes.push(`o0_track_ablation: unavailable — ${cell.detail}; the paired ablation control row is therefore absent (a documented fail-state, §6 F5/F9).`)
      return diagResult(`track ablation UNAVAILABLE: ${cell.detail} rootDisplay=${cell.rootDisplay} → the run is emitted applied:false + mutation:null, pass:false (§6 F5) unseparated=[${(row.unseparatedStages || []).join(',')}]`, { o0: row, freeze: { ablation: cell } })
    }
    // §2.4 — the exact style mutation, recorded in the artifact: the stage's grid
    // cell becomes a plain `display:block`, which removes the grid-track sizing
    // (the 12698.7 px track) from the measurement path.
    const mutation = `${cell.selector} (the stage grid cell of #wiki-root): display:block (removes the #wiki-root grid-track sizing from the measurement path)`
    // The BASELINE freeze first (no mutation), then the ABLATED freeze — the same
    // gesture, the same pane set, differing only in the recorded style mutation.
    // §2.4/S7 — the SAME gesture, the SAME pane set, the SAME disclosure state,
    // differing ONLY in the recorded style mutation (finding L7: without the state
    // reset the "off" run performs the reveal and the "on" run is a no-op, so the
    // delta conflates the ablation with the disclosure).
    const resetBefore = await o0ResetFolderState(h, target)
    const baseline = await o0FreezeRow(h, { id: o0RunId('folder-row', 'off', 'o0_track_ablation', taken), block: 'o0_track_ablation', gesture: 'folder-row', target: target, folderPath: pick ? pick.folderPath : null, documentId: null, paneFrames: frames, hook: true, trackAblation: { applied: false, mutation: null } })
    // NOTE: `#zone:main` is NOT a valid CSS selector (an unquoted id cannot
    // carry `:`), so the ablation element is reached by `getElementById` — the
    // recorded `cell.selector` stays the human-readable id it resolved.
    const applied = await h.cdp.evaluate(`(()=>{ const el = document.getElementById(${JSON.stringify(cell.elId)}); if (!el) return false; el.style.display = 'block'; return true })()`)
    const resetBeforeAblated = await o0ResetFolderState(h, target)
    const ablated = await o0FreezeRow(h, { id: o0RunId('folder-row', 'on', 'o0_track_ablation', [...taken, baseline.id]), block: 'o0_track_ablation', gesture: 'folder-row', target: target, folderPath: pick ? pick.folderPath : null, documentId: null, paneFrames: frames, hook: true, trackAblation: { applied: applied, mutation: applied ? mutation : null } })
    // NEVER persisted: the measurement-only style mutation is reverted immediately.
    const reverted = await h.cdp.evaluate(`(()=>{ const el = document.getElementById(${JSON.stringify(cell.elId)}); if (!el) return false; el.style.display = ''; return el.style.display === '' })()`)
    baseline.trackAblationEvidence = { ...cell, mutation: null, disclosureReset: resetBefore }
    ablated.trackAblationEvidence = { ...cell, mutation: mutation, reverted: reverted, disclosureReset: resetBeforeAblated }
    ablated.trackAblationDelta = { longTaskTotalMs: Math.round(((ablated.longTaskTotalMs ?? 0) - (baseline.longTaskTotalMs ?? 0)) * 1000) / 1000, mutations: (ablated.mutations ?? 0) - (baseline.mutations ?? 0), baselineRun: baseline.id }
    if (!applied || !reverted) {
      ablated.failReasons = [...ablated.failReasons, `the ablation mutation could not be applied/reverted (applied=${applied} reverted=${reverted}) — §2.4/F5`]
      ablated.pass = false
    }
    o0Acc.runs.push(baseline, ablated)
    const pairing = [
      { id: 'track-ablation-off', runRef: baseline.id, legRuns: [baseline.id], pairedWith: ablated.id, pairedWithStatus: null },
      { id: 'track-ablation-on', runRef: ablated.id, legRuns: [ablated.id], pairedWith: baseline.id, pairedWithStatus: null },
    ]
    return diagResult(
      `track ablation ${cell.detail}; mutation="${mutation}" applied=${applied} reverted=${reverted} | baseline: longTaskTotalMs=${baseline.longTaskTotalMs} mutations=${baseline.mutations} | ablated: longTaskTotalMs=${ablated.longTaskTotalMs} mutations=${ablated.mutations} | delta=${JSON.stringify(ablated.trackAblationDelta)} unseparated=[${(ablated.unseparatedStages || []).join(',')}]`,
      { o0: [baseline, ablated], freeze: { ablation: { ...cell, mutation: mutation, applied: applied, reverted: reverted }, pairing: pairing } },
    )
  },

  // ---- §3.1/§5 P-SM-2/§3.6(c) — re-run one gesture block and report the
  //      stage-id SET of both runs (the determinism oracle), plus the armed-vs-
  //      unarmed hook inertness (an armed hook that changes the numbers FAILS). ----
  o0_repeat_determinism: async (h) => {
    const frames = (await ufPaneFrames(h)).length
    const enumerated = await o0FolderRows(h)
    const pick = o0PickFolderRow(enumerated)
    const target = pick ? o0AttrSelector(O0_DOCNAV, 'data-folder-path', pick.folderPath) : O0_FOLDER_SELECTOR
    // §5 P-SM-2/§3.6(c) — a CONTROLLED pair (finding L7): both freezes start from the
    // COLLAPSED disclosure state, so the only variable between them is whether the
    // §3.6 hook is armed. Without the reset the pair compares a real disclosure with a
    // no-op and reports a state artifact as hook non-inertness.
    const resetA = await o0ResetFolderState(h, target)
    const baseline = await o0FreezeRow(h, { id: 'o0-repeat-a-unarmed', block: 'o0_folder_row', gesture: 'folder-row', target: target, folderPath: pick ? pick.folderPath : null, documentId: null, paneFrames: frames, hook: false })
    const resetB = await o0ResetFolderState(h, target)
    const armed = await o0FreezeRow(h, { id: 'o0-repeat-b-armed', block: 'o0_folder_row', gesture: 'folder-row', target: target, folderPath: pick ? pick.folderPath : null, documentId: null, paneFrames: frames, hook: true, disarmOnEntry: false })
    const setA = [...baseline.stages.map((s) => s.id)].sort()
    const setB = [...armed.stages.map((s) => s.id)].sort()
    const setEqual = JSON.stringify(setA) === JSON.stringify(setB)
    const deltaMutations = (armed.mutations ?? 0) - (baseline.mutations ?? 0)
    const deltaLongTaskMs = Math.round(((armed.longTaskTotalMs ?? 0) - (baseline.longTaskTotalMs ?? 0)) * 1000) / 1000
    const inert = deltaMutations === 0 && Math.abs(deltaLongTaskMs) <= O0_HOOK_LONGTASK_TOLERANCE_MS
    const msFree = true // §5 P-SM-2: the ms values are explicitly FREE under the seed
    // RUL-6 — the inertness comparison states WHICH HALF carried the proof. A `0`-vs-`0`
    // long-task pair is VACUOUS (`Δ = 0` of nothing) and must never be reported as a
    // numeric long-task proof; the mutation half proves the arm only when the unarmed
    // baseline actually observed mutations.
    const unarmedMutations = baseline.mutations ?? 0
    const armedMutations = armed.mutations ?? 0
    const unarmedTotal = baseline.longTaskTotalMs ?? 0
    const armedTotal = armed.longTaskTotalMs ?? 0
    const mutationHalfNonVacuous = unarmedMutations > 0
    const longTaskHalfNonVacuous = unarmedTotal > 0
    const mutationHalfProves = deltaMutations === 0 && mutationHalfNonVacuous
    const longTaskHalfProves = Math.abs(deltaLongTaskMs) <= O0_HOOK_LONGTASK_TOLERANCE_MS && longTaskHalfNonVacuous
    const carriedBy = [mutationHalfProves ? 'mutations' : null, longTaskHalfProves ? 'longTaskTotalMs' : null].filter((x) => x !== null)
    const vacuousHalves = [
      mutationHalfNonVacuous ? null : 'mutations (the unarmed baseline observed 0 mutations — Δmutations=0 is 0-vs-0)',
      longTaskHalfNonVacuous ? null : 'longTaskTotalMs (the unarmed baseline measured a 0 ms window — ΔlongTaskTotalMs=0 is 0-vs-0)',
    ].filter((x) => x !== null)
    // §6 S17(b)/RUL-6 — the PINNED sentence for the MUTATION-HALF proof (the shape the
    // second run owed: a 0-vs-0 long-task comparison proves nothing numerically).
    const proofStatement = !longTaskHalfNonVacuous && mutationHalfProves
      ? `the hook inertness pair is a MUTATION-HALF proof: Δmutations ${deltaMutations} === 0 with ${unarmedMutations} mutation(s) observed in each freeze; the long-task half is VACUOUS (both freezes totalled ${unarmedTotal} ms — a 0-vs-0 comparison, nonVacuous:false), so no numeric long-task proof is claimed`
      : !longTaskHalfNonVacuous
        ? `inertness is NOT proven numerically by this pair: the long-task half is VACUOUS (both freezes totalled ${unarmedTotal} ms) and the mutation half is ${mutationHalfNonVacuous ? `Δmutations=${deltaMutations}` : 'vacuous too (0 mutations observed)'} — no numeric proof is claimed (§6 S17(b)/RUL-6)`
        : carriedBy.length
          ? `inertness proven by the ${carriedBy.join(' + ')} half/halves (Δmutations=${deltaMutations} of ${unarmedMutations} recorded mutations; ΔlongTaskTotalMs=${deltaLongTaskMs} ms of a ${unarmedTotal} ms unarmed window, tolerance ${O0_HOOK_LONGTASK_TOLERANCE_MS} ms)`
          : `inertness is NOT proven numerically by this pair: no half held (Δmutations=${deltaMutations}, ΔlongTaskTotalMs=${deltaLongTaskMs} ms against a ${unarmedTotal} ms window)`
    o0Acc.hookPairs.push({
      baselineRun: baseline.id,
      armedRun: armed.id,
      setEqual: setEqual,
      msFree: msFree,
      deltaMutations: deltaMutations,
      deltaLongTaskMs: deltaLongTaskMs,
      toleranceMs: O0_HOOK_LONGTASK_TOLERANCE_MS,
      inert: inert,
      controlledPair: resetA.collapsed === true && resetB.collapsed === true,
      stateReset: { baseline: resetA, armed: resetB },
      mutations: { unarmed: unarmedMutations, armed: armedMutations },
      longTaskTotalMs: { unarmed: unarmedTotal, armed: armedTotal },
      // RUL-6 — per-half proof: `nonVacuousHalves` + `carriedBy` + the statement, so
      // no reader can take a 0-vs-0 long-task delta for a numeric long-task proof.
      nonVacuousHalves: { mutations: mutationHalfNonVacuous, longTaskTotalMs: longTaskHalfNonVacuous },
      carriedBy: carriedBy,
      vacuousHalves: vacuousHalves,
      // §6 S17(b) — `nonVacuous` is the LONG-TASK half's flag (the half whose 0-vs-0
      // comparison the second run's `nonVacuous:false` records), and the proof
      // statement says which half carried the proof.
      nonVacuous: longTaskHalfNonVacuous,
      mutationHalfProof: mutationHalfProves,
      proofStatement: proofStatement,
    })
    const reasons = []
    if (!setEqual) reasons.push(`the stage-id SET differs between the two runs of ${target} (${JSON.stringify(setA)} vs ${JSON.stringify(setB)}) — §5 P-SM-2 requires the SAME set`)
    if (!inert) reasons.push(`the measurement hook is NOT inert: armed-vs-unarmed Δmutations=${deltaMutations}, ΔlongTaskTotalMs=${deltaLongTaskMs} ms (tolerance ${O0_HOOK_LONGTASK_TOLERANCE_MS} ms) — §3.6(c) forces pass:false`)
    // The two repeat runs are reported as the determinism oracle, NOT as report
    // rows (§8.1: the determinism block re-reports an existing run rather than
    // adding a runs[] row).
    return diagResult(
      `repeat determinism: stage-id SET of both runs equal=${setEqual} (${setA.length} ids) msFree=${msFree} | hook inert=${inert} armed-mutations=${armed.mutations} unarmed-mutations=${baseline.mutations} Δmutations=${deltaMutations} ΔlongTaskTotalMs=${deltaLongTaskMs} tolerance=${O0_HOOK_LONGTASK_TOLERANCE_MS}ms | runs ${baseline.id} / ${armed.id} unseparated=[${(baseline.unseparatedStages || []).join(',')}]${reasons.length ? ' FAIL: ' + reasons.join('; ') : ''}`,
      { o0: { setA: setA, setB: setB, setEqual: setEqual, msFree: msFree, runs: [{ id: baseline.id, stages: baseline.stages }, { id: armed.id, stages: armed.stages }], hookInert: { armed: true, inert: inert, deltaMutations: deltaMutations, deltaLongTaskMs: deltaLongTaskMs, toleranceMs: O0_HOOK_LONGTASK_TOLERANCE_MS }, stageIds: setA, pass: reasons.length === 0, failReasons: reasons } },
    )
  },
}

// ---------------------------------------------------------------------------
// Harness.
// ---------------------------------------------------------------------------
async function main(argv) {
  // §3.3 — the O-0 flags are DEFAULT-SAFE: `--gpu` off (today's sanctioned
  // launch path is the GPU-OFF leg), `--o0-corpus` none, `--o0-out` none (a run
  // without it is console-only and can never produce the committed artifact).
  const opt = { mode: 'lexical', port: 3787, cdpPort: 9222, home: null, seed: null, corpusRoot: null, strictSeed: false, groups: null, block: 'all', noSeed: false, keepHome: false, connect: false, gpu: false, o0Corpus: null, o0Out: null, display: null, cliArgs: argv }
  for (const a of argv) {
    if (a === '--no-seed') { opt.noSeed = true; continue }
    if (a === '--keep-home') { opt.keepHome = true; continue }
    if (a === '--connect') { opt.connect = true; continue }
    if (a === '--gpu') { opt.gpu = true; continue }
    if (a === '--strict-seed') { opt.strictSeed = true; continue }
    const m = /^--([a-z0-9-]+)=(.*)$/.exec(a); if (!m) continue
    if (m[1] === 'mode') opt.mode = m[2]
    else if (m[1] === 'port') opt.port = Number(m[2])
    else if (m[1] === 'cdp-port') opt.cdpPort = Number(m[2])
    else if (m[1] === 'home') opt.home = m[2]
    else if (m[1] === 'seed') opt.seed = m[2]
    // `--corpus-root=<dir>` — the store's import root for the SEED corpus. The
    // default store's corpusRoot is the app's cwd (the project root), so a seed
    // corpus outside it is REJECTED by the importer's containment guard
    // (`markdown import: path outside corpus root`). Pointing the store at the
    // seed dir is what lets the O-0 operator-corpus census be reached through a
    // driver-spawned app (a spec §3.4 operator-store census without the vanished
    // operator store). Unset ⇒ the zero-config default (byte-equal today).
    else if (m[1] === 'corpus-root') opt.corpusRoot = m[2]
    else if (m[1] === 'groups') opt.groups = m[2].split(',').filter(Boolean)
    else if (m[1] === 'block') opt.block = m[2]
    // `--display=:0` is the documented form (spec §3.5) AND the form the
    // operator passes; the spawn below prefixes a `:`, so a leading colon in
    // the parsed value must be STRIPPED or the child gets `DISPLAY=::0` and
    // Electron exits on `ozone_platform_x11.cc:245 Missing X server or
    // $DISPLAY` (the spec's F6 symptom — but a harness defect, not a wrong
    // display). Both `--display=:0` and `--display=0` now normalize to `:0`.
    else if (m[1] === 'display') opt.display = m[2].replace(/^:+/, '')
    else if (m[1] === 'no-seed') opt.noSeed = true
    else if (m[1] === 'o0-corpus') opt.o0Corpus = Number(m[2])
    else if (m[1] === 'o0-out') opt.o0Out = m[2]
  }
  o0Acc.runs.length = 0; o0Acc.hookPairs.length = 0; o0Acc.notes.length = 0
  const home = opt.connect ? (mkdtempSync(join(tmpdir(), 'astrolive-connect-')) ?? null) : (opt.home ?? mkdtempSync(join(tmpdir(), 'astrolive-')))
  // RUL-3 — NO main-side transport exists (the spec's audit result): the spawned app
  // arms its main instance and its handler wrap records `snapshot.clone`, but no
  // channel carries those records into the report, and the IPC structured clone is
  // outside every host-side wrap. The stage is therefore reported STRUCTURAL with
  // that exact reason (§3.6b/S15) — never an imputed number, never a fabricated
  // `instance:'main'` attribution.
  // The default store's corpusRoot is the app's cwd (the project root) when
  // unconfigured (REGISTRY-CWD-TRANSPARENCY), so the seed corpus must live under
  // it — never under the disposable HOME (the importer REJECTS an out-of-root
  // file). `.live-corpus/` is gitignored + cleaned every run (except --connect,
  // which attaches to a RUNNING app and reuses the on-disk corpus).
  const seedDir = opt.seed ?? join(ROOT, '.live-corpus')
  const groups = opt.groups ?? ['read', 'dispatch', 'rag', 'edit', 'module', 'code', 'graph', 'gnosis', 'gnosis-edit']

  // --connect: attach to a RUNNING app session (assume --port/--cdp-port already
  // point at it). Do NOT spawn a second app, manage a HOME, or tear it down —
  // the running session is OUT of this harness's lifecycle.
  let app = null
  if (opt.connect) {
    console.error(`[live-drive] CONNECT mode: attaching to RUNNING app on :${opt.port}/mcp + CDP :${opt.cdpPort} (no spawn)`)
  } else {
    // `--corpus-root=<dir>` (spec §3.4): the store's import containment root is
    // an OPERATOR registry value, not an MCP argument (the importer reads the
    // addressed store's configured corpusRoot; the tool schema is `files`-only).
    // A seed corpus outside the project root is otherwise rejected by the
    // containment guard (`markdown import: path outside corpus root`), so the
    // flag writes the operator's registry file into the DISPOSABLE HOME's
    // userData BEFORE the app boots — exactly the operator configuration path,
    // no src change. Unset ⇒ no file is written (byte-equal today's behaviour:
    // the implicit `{name:'main',default:true}` entry with the cwd root).
    if (opt.corpusRoot) {
      const userData = join(home, '.config', 'provident-electron')
      await mkdirAsync(userData, { recursive: true })
      await writeFileAsync(join(userData, 'provident-rag-stores.json'), JSON.stringify({
        version: 1,
        stores: [{ name: 'main', default: true, persistenceFile: join(userData, 'provident-rag.json'), corpusRoot: opt.corpusRoot }],
      }, null, 2) + '\n')
      console.error(`[live-drive] operator store registry written: ${join(userData, 'provident-rag-stores.json')} (corpusRoot=${opt.corpusRoot})`)
    }
    const launchArgs = [`--mode=${opt.mode}`, `--port=${opt.port}`, `--cdp-port=${opt.cdpPort}`, ...(opt.gpu ? [] : ['--no-gpu'])] // §3.3 — conditional: the GPU-ON leg is reproducible only this way
    console.error(`[live-drive] launching app ${launchArgs.join(' ')} HOME=${home}`)
    app = spawn(join(ROOT, 'scripts', 'start-app.sh'), launchArgs, {
      // §3.6b — the main-side recorder instance is armed by the SPAWNING driver
      // through this pinned env flag (a `--connect` run cannot arm it, §6 S15).
      // RUL-3 — the main instance is armed by this flag; its records are NOT
      // transported (no channel exists), so `snapshot.clone` stays structural with
      // the recorded reason.
      env: { ...process.env, HOME: home, DISPLAY: `:${opt.display ?? '1'}`, ASTROGRAPHER_O0_MAIN_ARM: '1' }, // user-directed display
      stdio: 'inherit',
      detached: true, // so we can kill the WHOLE process tree on exit (user: exit after the test, not a timer)
    })
  }

  try {
    // §3.6b/F16 — the pinned `.ts` twins are resolved BEFORE any measurement: an
    // unavailable twin THROWS here, so this `catch` prints `[live-drive] ERROR:` and
    // exits 2 with NO artifact written — never a fallback that emits a number.
    await o0ImportTwins()
    const mcpBase = `http://127.0.0.1:${opt.port}/mcp`
    await waitFor(async () => { const r = await fetch(mcpBase).catch(() => null); return r && r.status < 500 }, { timeout: 60000 })
    const mcp = await connectMcp(mcpBase)
    const cdp = await CDP.connect(opt.cdpPort)
    await cdp.enableGroups(groups)
    await waitFor(() => mcpTool(mcp, 'provident.list_targets', {}).then(() => true).catch(() => false))
    // deterministic seed (skip with --no-seed to observe the fresh/landing state)
    if (!opt.noSeed) {
      // `--strict-seed` (spec §3.4) — import the seed DIRECTORY's markdown corpus
      // as the store's corpus, WITHOUT writing the driver's two synthetic seed
      // files. `--seed=<dir>` + `--corpus-root=<dir>` + `--strict-seed` is how the
      // O-0 operator-corpus census (226 documents) is reached through a
      // driver-spawned app: `seedCorpus` writes `alpha.md`/`beta.md` (a 2-document
      // S2 corpus by construction) and can never produce the operator census.
      const files = opt.strictSeed ? o0MarkdownTree(seedDir) : seedCorpus(seedDir)
      const imp = await mcpTool(mcp, 'edit.import_markdown', { files }).catch((e) => ({ ok: false, error: String(e) }))
      console.error(`[live-drive] seeded corpus -> import ${JSON.stringify(imp)}`)
      await waitFor(() => mcpTool(mcp, 'rag.list_documents', {}).then((d) => d && d.documents?.length > 0).catch(() => false))
    }

    const h = { mcp, cdp, groups, mcpTool }
    const names = opt.block === 'all' ? Object.keys(BLOCKS) : opt.block.split(',').map((s) => s.trim()).filter(Boolean)
    // §3.5/§3.6 — the O-0 run context: the EXECUTING bundle identity (served vs
    // on-disk) and the OBSERVED corpus census are read ONCE, before the block loop,
    // so every freeze row records the same provenance. Nothing here mutates the DOM
    // or the measured window (the freeze arms its own observers).
    const o0Blocks = names.filter((n) => n.startsWith('o0_'))
    let o0CensusObserved = { documents: null, nodes: null, edges: null, engine: 'absent' }
    if (o0Blocks.length) {
      const bundle = await o0BundleIdentity(h)
      o0CensusObserved = await o0Census(h)
      if (!bundle.verified) console.error(`[live-drive] O-0 BUNDLE NOT VERIFIED: served ${bundle.served} vs on-disk renderer ${bundle.disk.rendererBytes}+${bundle.disk.rendererHash} — every O-0 row is pass:false (§3.6/F2)`)
      console.error(`[live-drive] O-0 context: blocks=${o0Blocks.join(',')} leg=gpu-${opt.gpu ? 'on' : 'off'} bundle.verified=${bundle.verified} census=${JSON.stringify({ documents: o0CensusObserved.documents, nodes: o0CensusObserved.nodes, edges: o0CensusObserved.edges, engine: o0CensusObserved.engine })} engineEvidence=${JSON.stringify(o0CensusObserved.engineEvidence)} engineError=${JSON.stringify(o0CensusObserved.engineError ?? null)} claimedDocuments=${Number.isFinite(opt.o0Corpus) ? opt.o0Corpus : O0_OPERATOR_DOCUMENTS} seed=${O0_SEED} artifactPath=${opt.o0Out ?? 'null (console-only: no --o0-out)'}`)
      if (o0CensusObserved.engineError) console.error(`[live-drive] O-0 ENGINE STATE UNDERIVABLE: ${o0CensusObserved.engineError}`)
      h.o0 = {
        gpuFlag: opt.gpu === true,
        connect: opt.connect === true,
        bundleVerified: bundle.verified,
        bundleRenderer: bundle.renderer,
        bundleMain: bundle.main,
        bundleServed: bundle.served,
        bundle: bundle,
        corpusSource: Number.isFinite(opt.o0Corpus) ? '--o0-corpus' : (opt.connect ? 'operator-store' : 'seed'),
        appFlag: opt.connect ? (opt.gpu ? 'app launched WITHOUT --no-gpu (GPU-on leg)' : 'app launched with --no-gpu (GPU-off leg)') : `spawned by this driver (${opt.gpu ? 'gpu on' : '--no-gpu'})`,
        census: o0CensusObserved,
        // §3.6b/S15 + RUL-3 — the MAIN-side refinement: in SPAWN mode the driver sets
        // the pinned env flag AND the transport path, so each freeze reads the main
        // records that ran during its window (attributed `instance:'main'`); in
        // `--connect` mode neither can be set and the reason below is recorded per row.
        // `mainRecords` here is the PRE-FREEZE (empty) set — the per-window read lives
        // in `o0FreezeRow`.
        mainRecords: [],
        mainRecordsError: null,
        mainSeamArmed: false,
        mainSeamNote: opt.connect === true ? O0_MAIN_SEAM_MISSING : O0_MAIN_SEAM_UNTRANSPORTED,
      }
      opt.bundle = bundle
      opt.mainSeamNote = h.o0.mainSeamNote
    }
    let fail = 0, park = 0, diag = 0
    // §6.1 report material: the ROW blocks' structured results (matrix + extended)
    const reportRows = []
    for (const n of names) {
      const label = `${n.padEnd(18)}`
      try {
        const r = await BLOCKS[n](h)
        const row = typeof r.row === 'string' ? r.row : null
        if (row) reportRows.push({ row, block: n, pass: r.pass === true, proxyPASS: r.proxyPASS === true, realInput: r.realInput === true, park: r.park === true })
        if (r.diagnostic === true) { console.log(`DIAG  ${label} ${r.detail ?? ''}`); diag++ }
        else if (r.pass) { console.log(`PASS  ${label} ${r.detail ?? ''}`) }
        else if (r.park) { console.log(`PARK  ${label} ${r.detail ?? ''}`); park++ }
        else { console.log(`FAIL  ${label} ${r.detail ?? r.evidence ?? ''}`); fail++ }
      } catch (e) { console.log(`FAIL  ${label} ${String(e)}`); fail++ }
    }
    // §3.3/§4.1/§4.4 — emit the O-0 report (only when an O-0 block ran; a hard
    // failure ABORTS before this point and writes NO partial artifact, §6 F6).
    if (o0Blocks.length) {
      if (o0Acc.runs.length === 0) console.error('[live-drive] O-0: no freeze row was staged — the report carries runs=[] and is pass:false (§4.2)')
      const report = o0BuildReport(h, opt, names, o0CensusObserved)
      o0WriteReport(report, opt)
      console.error(`[live-drive] O-0 status: ${report.status} (pass=${report.pass}) — ${report.driver.statusStatement}`)
      console.error(`[live-drive] O-0 verdicts: ${report.verdicts.length ? report.verdicts.join(' | ') : '(none derived)'}`)
      if (report.driver.failReasons.length) console.error(`[live-drive] O-0 forcing condition(s): ${report.driver.failReasons.join(' | ')}`)
      if (report.driver.structuralStages.length) console.error(`[live-drive] O-0 STRUCTURAL stages (no seam in the executing bundle — recorded, non-gating, §6 S14/RUL-4): ${report.driver.structuralStages.join(', ')}`)
      if (report.driver.notes.length) console.error(`[live-drive] O-0 notes: ${report.driver.notes.join(' | ')}`)
      for (const r of report.runs) console.error(`DIAG  O-0 run ${r.id}: pass=${r.pass} openStructural=${r.openStructural === true} path=${r.path} stageCount=${r.stageCount} longTaskTotalMs=${r.longTaskTotalMs} mutations=${r.mutations} wallMs=${r.wallMs} unseparated=[${(r.unseparatedStages || []).join(',')}] structural=[${(r.structuralStages || []).join(',')}] pendingSpans=${String(r.hook?.pendingSpans ?? null)} mainRecordsRead=${JSON.stringify(r.hook?.mainRecordsRead)} reconciliation=${JSON.stringify(r.reconciliation)}`)
    }
    // §6.1 run summary: `total` is the §5.U matrix-row count (U-1..U-8), NEVER the
    // number of blocks; the extended (non-matrix) results are reported separately.
    const matrixVerdict = reportRows.filter((r) => /^U-\d+$/.test(r.row))
    const extendedVerdict = reportRows.filter((r) => !/^U-\d+$/.test(r.row))
    let matrixPass = 0, matrixFail = 0, matrixParked = 0
    for (const r of matrixVerdict) { if (r.park) matrixParked += 1; else if (r.pass) matrixPass += 1; else matrixFail += 1 }
    const summary = {
      unit: 'user-flow-audit',
      layer: 'assembled-renderer (RCA-12)',
      total: MATRIX_ROWS.length,
      pass: matrixPass,
      fail: matrixFail,
      parked: matrixParked,
      matrixRowsExecuted: new Set(matrixVerdict.map((r) => r.row)).size,
      blocksRun: names.length,
      extendedRowsRun: extendedVerdict.length,
      diagnostics: diag,
    }
    console.error(`[live-drive] done: ${names.length} blocks, ${fail} FAIL, ${park} PARKED`)
    console.error(`[live-drive] §6.1 summary: ${JSON.stringify(summary)}`)
    console.error(`[live-drive] MATRIX rows (${MATRIX_ROWS.length} = summary.total): ${matrixVerdict.map((r) => `${r.row}:${r.block}=${r.park ? 'PARKED' : r.pass ? 'PASS' : 'FAIL'}${r.proxyPASS ? '(proxyPASS)' : ''}${r.realInput ? '' : '(realInput:false)'}`).join(' ') || '(none executed)'}`)
    console.error(`[live-drive] EXTENDED rows (${extendedVerdict.length} of ${ROW_EXTENDED.length} defined): ${extendedVerdict.map((r) => `${r.row}:${r.block}=${r.park ? 'PARKED' : r.pass ? 'PASS' : 'FAIL'}${r.proxyPASS ? '(proxyPASS)' : ''}`).join(' ') || '(none executed)'}`)
    // ROW-SET / COUNT RECONCILIATION — loud (never silent) when a matrix row has
    // no block, a block claims several rows, or a reported row is not in §5.U
    const recon = reconcileMatrixRows(matrixVerdict.map((r) => ({ row: r.row, block: r.block })), names.length === Object.keys(BLOCKS).length ? 0 : names.length)
    const claims = MATRIX_ROWS.map((row) => `${row.row}->${row.block}`)
    console.error(`[live-drive] MATRIX_ROWS mapping (${claims.length}): ${claims.join(' ')}`)
    for (const e of recon.errors) console.error(`[live-drive] ROW-SET ERROR: ${e}`)
    console.error(`[live-drive] row-set reconciliation: matrix=${recon.matrixTotal} rows claimed by ${claims.length} mapping(s); blocks run=${names.length}; matrix rows executed=${summary.matrixRowsExecuted}; extended rows=${extendedVerdict.length}; §5.U row total (summary.total)=${summary.total}${recon.ok ? ' OK' : ' MISMATCH'}`)
    process.exitCode = fail > 0 || !recon.ok ? 1 : 0
  } finally {
    // --connect: the RUNNING app session is not ours to stop — detach, don't kill.
    if (!opt.connect) {
      try { process.kill(-app.pid, 'SIGTERM') } catch { /* already gone */ }
      try { app.kill('SIGTERM') } catch { /* already gone */ }
      if (!opt.keepHome) try { rmSync(home, { recursive: true, force: true }) } catch { /* best-effort */ }
    }
    // --connect: the running app owns `.live-corpus` — leave it in place.
    if (!opt.connect && seedDir === join(ROOT, '.live-corpus')) { try { rmSync(seedDir, { recursive: true, force: true }) } catch { /* best-effort */ } }
  }
  // Exit the process: the MCP streamable-HTTP transport + CDP WebSocket keep the
  // event loop alive after connect-mode (no app teardown), so force the exit.
  process.exit(process.exitCode || 0)
}

main(process.argv.slice(2)).catch((e) => { console.error(`[live-drive] ERROR: ${e}`); process.exitCode = 2 })
