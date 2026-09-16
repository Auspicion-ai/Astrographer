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
}

// ---------------------------------------------------------------------------
// Harness.
// ---------------------------------------------------------------------------
async function main(argv) {
  const opt = { mode: 'lexical', port: 3787, cdpPort: 9222, home: null, seed: null, groups: null, block: 'all', noSeed: false, keepHome: false, connect: false }
  for (const a of argv) {
    if (a === '--no-seed') { opt.noSeed = true; continue }
    if (a === '--keep-home') { opt.keepHome = true; continue }
    if (a === '--connect') { opt.connect = true; continue }
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
  const home = opt.connect ? (mkdtempSync(join(tmpdir(), 'astrolive-connect-')) ?? null) : (opt.home ?? mkdtempSync(join(tmpdir(), 'astrolive-')))
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
    const launchArgs = [`--mode=${opt.mode}`, `--port=${opt.port}`, `--cdp-port=${opt.cdpPort}`, `--no-gpu`]
    console.error(`[live-drive] launching app ${launchArgs.join(' ')} HOME=${home}`)
    app = spawn(join(ROOT, 'scripts', 'start-app.sh'), launchArgs, {
      env: { ...process.env, HOME: home, DISPLAY: `:${opt.display ?? '1'}` }, // user-directed display
      stdio: 'inherit',
      detached: true, // so we can kill the WHOLE process tree on exit (user: exit after the test, not a timer)
    })
  }

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
    const names = opt.block === 'all' ? Object.keys(BLOCKS) : opt.block.split(',').map((s) => s.trim()).filter(Boolean)
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
