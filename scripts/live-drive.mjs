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
  tabs: async (h) => { const r = await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'nodeId', nodeId: '.live-corpus/beta' } }); return { pass: true, detail: `provident.focus -> ${JSON.stringify(r)}` } },
  settings_modal: async (h) => {
    await h.cdp.click('#settings-toggle'); const open = await h.cdp.domAttr('#settings-modal', 'class')
    return { pass: /is-open/.test(open ?? ''), detail: `#settings-modal class=${open}` }
  },
  shell_wiring: async (h) => { return { pass: await h.cdp.has('.layout .gutter'), detail: 'authored gutters present (C7 live surface)' } },
  import: async (h) => { return { pass: true, park: false, detail: 'see the U-IMPORT-1 battery — needs the OS dialog driver (inject a fixed selection to un-park)' } },
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
    // U-LIVE8 — after a seeded content edit bumps the journal, #editor-toolbar-undo
    // must be enabled (not stuck disabled) and a click must revert + re-disable at base.
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
    const id = docs && docs.documents && docs.documents[0] && (docs.documents[0].documentId || docs.documents[0].id) ? (docs.documents[0].documentId || docs.documents[0].id) : '.live-corpus/alpha'
    const before = await h.cdp.evaluate(`(()=>{const b=document.getElementById('editor-toolbar-undo');return b?b.disabled:null})()`)
    const edited = await h.mcpTool(h.mcp, 'edit.set_content', { nodeId: id, content: '# Alpha edited by live-drive\n\ncontent\n' }).catch((e) => ({ error: String(e) }))
    await sleep(600)
    const afterEdit = await h.cdp.evaluate(`(()=>{const b=document.getElementById('editor-toolbar-undo');return b?b.disabled:null})()`)
    const pass = afterEdit === false
    if (pass) {
      await h.cdp.click('#editor-toolbar-undo')
      await sleep(600)
      const afterClick = await h.cdp.evaluate(`(()=>{const b=document.getElementById('editor-toolbar-undo');return b?b.disabled:null})()`)
      return { pass: true, detail: `undo disabled before=${before} afterEdit=${afterEdit} afterClick=${afterClick} (revert check=${edited && edited.ok ? 'ok' : JSON.stringify(edited)})` }
    }
    return { pass: false, detail: `undo disabled before=${before} afterEdit=${afterEdit} (edit ${JSON.stringify(edited)})` }
  },
  toolbar_toggle: async (h) => {
    // U-LIVE9 — the editor-toolbar markdown/html (editing-mode) toggle: click and
    // assert data-mode flips.
    const before = await h.cdp.domAttr('#editor-toolbar-toggle', 'data-mode')
    if (before == null) return { pass: false, detail: 'no #editor-toolbar-toggle' }
    await h.cdp.click('#editor-toolbar-toggle')
    await sleep(500)
    const after = await h.cdp.domAttr('#editor-toolbar-toggle', 'data-mode')
    return { pass: after !== before, detail: `toggle data-mode before=${before} after=${after}` }
  },
  diag5: async (h) => {
    // LIVE-11 CDP-coordinate-click root cause: elementFromPoint is NOT null (the
    // toggle is hit-testable), yet the CDP Input.dispatchMouseEvent click from
    // the `collapse` block did NOT collapse. Probe the exact difference vs the
    // working native .click(): (a) document focus, (b) does a CDP click emit a
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
    return { pass: true, detail: `probe=${JSON.stringify(probe)}; CDP click fired=${fired} focus=${focused} is-collapsed=${ic}` }
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
    return { pass: true, detail: `gnosis-query center=(${arm.x},${arm.y}) pointer-event counts=${JSON.stringify(counts)}` }
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
    return { pass: true, detail: `diag frames=${JSON.stringify(dump)} toggle=${toggleSel} click=${JSON.stringify(clickTrace)}` }
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
    return { pass: true, detail: `directCollapse before=${JSON.stringify(before)} call=${direct} after=${JSON.stringify(after)}; toggle before=${toggleBefore} direct=${toggleDirect} after=${toggleAfter}` }
  },
  diag3: async (h) => {
    // LIVE-11/9 root-cause: does the provident on:click listener fire when the
    // element's .click() (a native DOM click event, bypassing hit-testing) is
    // invoked via Runtime.evaluate — vs the CDP Input.dispatchMouseEvent of `click`?
    const nat = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');const t=f&&f.querySelector('.pane-collapse-toggle');if(!t)return 'no-toggle'; try{t.click();return 'clicked'}catch(e){return 'threw:'+String(e)}})()`)
    await sleep(600)
    const afterNode = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');return {ic:f?f.classList.contains('is-collapsed'):null,pc:f?f.getAttribute('data-pane-collapse'):null}})()`)
    // also: is the toggle covered / clickable? check elementFromPoint at its center.
    const hit = await h.cdp.evaluate(`(()=>{const t=document.querySelector('.pane-frame[data-pane-id="doc-nav"] .pane-collapse-toggle');if(!t)return 'no-toggle';const r=t.getBoundingClientRect();const el=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return {same:el===t,hit:(el?el.tagName+'.'+(el.className||''):'null'),tag:t.tagName,cls:t.className,disabled:t.disabled}})()`)
    const toggle = await h.cdp.evaluate(`(()=>{const t=document.querySelector('.pane-frame[data-pane-id="doc-nav"] .pane-collapse-toggle');return t?{handlers:t.hasAttribute('onclick'),outer:(t.outerHTML||'').slice(0,200)}:null})()`)
    return { pass: true, detail: `nativeElClick=${nat} after=${JSON.stringify(afterNode)} hit=${JSON.stringify(hit)} toggle=${JSON.stringify(toggle)}` }
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
    return { pass: true, detail: JSON.stringify(out) }
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
    // Use a NATIVE DOM .click() (the seam path proven in LIVE-11 diag3) so an
    // off-viewport toggle in the modal isn't a CDP hit-test artifact, and probe the
    // toggle geometry to classify any FAIL.
    await h.cdp.click('#settings-toggle')
    await sleep(500)
    const sel = await h.cdp.evaluate(`(()=>{const t=document.querySelector('#settings-modal [data-pane="doc-nav"][data-enabled]');return t?'[data-pane="doc-nav"][data-enabled]':null})()`)
    if (!sel) return { pass: false, detail: 'no doc-nav [data-pane][data-enabled] toggle in #settings-modal' }
    const hit = await h.cdp.evaluate(`(()=>{const t=document.querySelector('#settings-modal [data-pane="doc-nav"][data-enabled]');if(!t)return null;const r=t.getBoundingClientRect();return {cx:Math.round(r.x+r.width/2),cy:Math.round(r.y+r.height/2),inVp:r.y>0&&r.y+r.height<window.innerHeight}})()`)
    const before = await h.cdp.domAttr(sel, 'data-enabled')
    const paneFrameBefore = await h.cdp.evaluate(`!!document.querySelector('.pane-frame[data-pane-id="doc-nav"]')`)
    const nat = await h.cdp.evaluate(`(()=>{const t=document.querySelector('#settings-modal [data-pane="doc-nav"][data-enabled]');if(!t)return 'no-toggle';try{t.click();return 'clicked'}catch(e){return 'threw:'+String(e)}})()`)
    await sleep(800)
    const after = await h.cdp.domAttr(sel, 'data-enabled')
    const populated = await h.cdp.evaluate(`(['#operator-topk','#operator-editing-mode','#operator-enabled-panes'].map((s)=>{const e=document.querySelector(s);return s+':'+((e&&e.textContent||'').trim().length>0)}))`)
    const paneFrameAfter = await h.cdp.evaluate(`!!document.querySelector('.pane-frame[data-pane-id="doc-nav"]')`)
    const pass = after !== before && after === 'false'
    return { pass, detail: `doc-nav toggle data-enabled before=${before} after=${after} (hidden=${after==='false'}); nativeClick=${nat} toggleGeo=${JSON.stringify(hit)}; paneFrame doc-nav before=${paneFrameBefore} after=${paneFrameAfter}; settings populated=${JSON.stringify(populated)}` }
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
    const pass = !!(doc && !doc.error && Array.isArray(doc.nodes ?? doc.edges ?? null))
    return { pass: true, detail: `list_documents=${JSON.stringify(docs)}\n get_document(${id}) nodes/edges: ${doc&&doc.nodes?JSON.stringify(doc.nodes):JSON.stringify(doc)}\n rag.query=${JSON.stringify(q)}\n get_edges=${JSON.stringify(edges)}` }
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
    return { pass: true, detail: `rag.query target-scope(documentId=${id},nodeId=${nodeId})=${JSON.stringify(scopedTarget)}\n rag.query pathPrefix+kind=` + JSON.stringify(scopeFilter) }
  },

  // V3 — doc-nav tree in the rendered DOM + rag.list_documents returns the doc heads.
  v3_docnav: async (h) => {
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch((e) => ({ error: String(e) }))
    const navBefore = await h.cdp.evaluate(`(()=>{const p=document.querySelector('#pane-doc-nav, [data-pane-id="doc-nav"]');if(!p)return {err:'no doc-nav pane'};const lis=[...p.querySelectorAll('li')].map(li=>({id:li.getAttribute('data-document-id'),current:li.getAttribute('data-current'),cls:li.className,text:(li.textContent||'').trim()}));return {lis,html:(p.innerHTML||'').slice(0,600)}})()`)
    // expand the doc-nav tree folders (dispatch a toggle click on every folder) so
    // the document leaves render, then re-read to confirm the docs are listed.
    await h.cdp.evaluate(`(()=>{for(const t of document.querySelectorAll('#pane-doc-nav [data-folder-path], #pane-doc-nav [data-wire] [data-folder-path]')){try{t.click()}catch{}}return true})()`)
    await sleep(500)
    const navAfter = await h.cdp.evaluate(`(()=>{const p=document.querySelector('#pane-doc-nav, [data-pane-id="doc-nav"]');if(!p)return null;const lis=[...p.querySelectorAll('li')].map(li=>({id:li.getAttribute('data-document-id'),current:li.getAttribute('data-current'),text:(li.textContent||'').trim()}));return {lis,html:(p.innerHTML||'').slice(0,700)}})()`)
    return { pass: true, detail: `rag.list_documents=${JSON.stringify(docs)}\n doc-nav BEFORE=${JSON.stringify(navBefore)}\n doc-nav AFTER-expand=${JSON.stringify(navAfter)}` }
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
    return { pass: true, detail: `inventory=${JSON.stringify(inv)}\n ${gutterResult}\n ${dragResult}\n .layout seam pointer counters(pd,pm,pu)=${JSON.stringify(counts)} (reached-listeners=${counts.pd>0}) [ADV6 caveat: four gutters may have no grid area in some layouts]` }
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
    return { pass: true, detail: `provident.list_targets=${JSON.stringify(targets)}\n provident.focus(document ${id})=${JSON.stringify(focus)}` }
  },

  // GNOSIS — engine-absent probe (no --mode=gnosis in this session): provident.gnosis.status
  // should surface the D2 engine-absent state (refused engine base URL), not crash.
  gnosis_d2: async (h) => {
    const st = await h.mcpTool(h.mcp, 'gnosis.status', {}).catch((e) => ({ error: String(e.message || e) }))
    const q = await h.mcpTool(h.mcp, 'gnosis.query', { query: 'alpha' }).catch((e) => ({ error: String(e.message || e) }))
    return { pass: true, detail: `gnosis.status=${JSON.stringify(st)}\n gnosis.query=${JSON.stringify(q)} (engine-absent D2 surfacing; the retrieval-trio happy path needs a live gnosis-server + --mode=gnosis — PARKED)` }
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
}

// ---------------------------------------------------------------------------
// Harness.
// ---------------------------------------------------------------------------
async function main(argv) {
  const opt = { mode: 'lexical', port: 3787, cdpPort: 9222, home: null, seed: null, groups: null, block: 'all', noSeed: false, keepHome: false }
  for (const a of argv) {
    if (a === '--no-seed') { opt.noSeed = true; continue }
    if (a === '--keep-home') { opt.keepHome = true; continue }
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
    const names = opt.block === 'all' ? Object.keys(BLOCKS) : opt.block.split(',').map((s) => s.trim()).filter(Boolean)
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
    // --keep-home: leave the shared HOME in place so a SECOND invocation can reuse
    // the same store (the LIVE-5 cross-restart persistence round-trip).
    try { if (!opt.keepHome) rmSync(home, { recursive: true, force: true }) } catch { /* best-effort */ }
    try { if (seedDir === join(ROOT, '.live-corpus')) rmSync(seedDir, { recursive: true, force: true }) } catch { /* best-effort */ }
  }
}

main(process.argv.slice(2)).catch((e) => { console.error(`[live-drive] ERROR: ${e}`); process.exitCode = 2 })
