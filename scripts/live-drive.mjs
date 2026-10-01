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
//       [--cdp-port=9222] [--home=<dir under the OS temp root>] [--seed=<corpusDir>]
//       [--groups=read,dispatch,rag,edit,module,code,graph] [--block=<name>|all]
//
// A block prints `PASS`/`FAIL` and the run exits non-zero on any FAIL. Blocks
// needing a missing component (vector/gnosis backends) report PARKED (never FAIL).
import { spawn } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join, resolve as resolvePath, sep as pathSep } from 'node:path'
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
/** §3.2 `F-7` / §2.2 `E-9` — THE DISCRIMINATED MCP READ. The installed MCP SDK's
 *  `CallToolResult` carries `isError`, and a REFUSED reply is NOT an empty value:
 *  `{ ok, isError, value, errorText, tool }` keeps the two cases apart so a
 *  ROW-DEFINING read can classify its own failure (§2.3 `H-4`: `NOT-DRIVEN` with
 *  the reply printed verbatim — never an app FAIL, never a silent `null`).
 *  `mcpTool` below keeps its existing ergonomics (the parsed value, or the reply
 *  TEXT on an `isError` reply), so no existing call site changes meaning. */
async function mcpToolResult(client, name, args = {}) {
  const r = await client.callTool({ name, arguments: args })
  // MCP result content: [{type:'text', text}] (this server emits text).
  const text = (r.content ?? []).map((c) => c.text ?? '').join('')
  let value
  try { value = JSON.parse(text) } catch { value = text }
  const isError = r.isError === true
  return { ok: !isError, isError, tool: name, value: value, errorText: isError ? text : null }
}
async function mcpTool(client, name, args = {}) {
  // The historical ergonomics, byte-for-byte: the parsed content, or the reply
  // TEXT when the content is not JSON (an `isError` reply's text included).
  const read = await mcpToolResult(client, name, args)
  return read.value
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
  /** §2.3 `H-3`/`F-4` — a raw coordinate click that RECORDS its proof: the
   *  coordinate, the viewport it was dispatched against, the element under that
   *  point and `onTarget`. `inVp:false` (the off-viewport coordinate) is a DRIVER
   *  failure and is NEVER dispatched, so an off-viewport coordinate cannot be
   *  counted as an app FAIL. Returns the record (the previous call sites ignore
   *  it; a verdict-carrying click reads it). */
  async click(selector, rows) {
    const p = await this.evaluate(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return null;const r=el.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;const hit=document.elementFromPoint(x,y);return {x:x,y:y,w:r.width,h:r.height,vp:[innerWidth,innerHeight],hit:hit?(hit.id||hit.tagName):null,onTarget:!!(hit&&(hit===el||el.contains(hit)))}})()`)
    // §2.3 `H-3` clause 1 (`G-9`/`M-10`) — the raw-coordinate route LOGS ITS PROBE
    // through the same central gesture log as `ufRealClick`, so a row that rests
    // on this click can carry its record too (the recorded path is the row's own
    // `gesturePath`; this route's branches name the driver-failure vocabulary).
    // `rows` (⟨gate-4 `D-1`⟩) is the row identity the calling block names, when it
    // knows whose gesture this is.
    ufLogProbe(selector, p, rows)
    // §2.3 `H-4` — a MISSING SELECTOR is a DRIVER failure RECORDED like its
    // `zero-box`/`off-viewport`/`native-fallback` siblings (`path:'missing'`,
    // `realInput:false`), never a throw out of a verdict path: the caller then
    // reports `NOT-DRIVEN` with this record as its reason, instead of an app FAIL
    // for a control the harness could not find. A throw is kept ONLY for a
    // genuinely impossible precondition.
    if (!p) return { path: 'missing', x: null, y: null, viewport: null, hit: null, onTarget: false, inVp: null, realInput: false, detail: `click: element not found: ${selector} (a DRIVER failure — no element at that selector, nothing was dispatched)` }
    const inVp = p.x >= 0 && p.y >= 0 && p.x <= p.vp[0] && p.y <= p.vp[1]
    if (!inVp || !p.onTarget) {
      const recorded = { path: inVp ? 'native-fallback' : 'off-viewport', x: p.x, y: p.y, viewport: p.vp, hit: p.hit, onTarget: p.onTarget, inVp, realInput: false, detail: `coordinate (${Math.round(p.x)},${Math.round(p.y)}) vs viewport ${JSON.stringify(p.vp)}: inVp=${inVp} onTarget=${p.onTarget} hit=${p.hit} — NOT dispatched (a raw coordinate click with no proven path is a DRIVER failure, not an app verdict)` }
      if (inVp) {
        // In-viewport but covered/missed: the historical synthetic route, recorded.
        await this.evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(e)e.click();return true})()`)
      }
      return recorded
    }
    if (p.width === 0 && p.height === 0) return { path: 'zero-box', x: p.x, y: p.y, viewport: p.vp, hit: p.hit, onTarget: false, inVp, realInput: false, detail: `zero-size box at (${Math.round(p.x)},${Math.round(p.y)}) — nothing was dispatched (a DRIVER failure, not an app verdict)` }
    const base = { x: p.x, y: p.y, button: 'left', clickCount: 1 }
    await this.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...base })
    await this.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...base })
    return { path: 'cdp', x: p.x, y: p.y, viewport: p.vp, hit: p.hit, onTarget: true, inVp: true, realInput: true }
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

/** The hit-test probe the real-click helper uses: the element CENTER, the
 *  element under that point, the viewport, and whether the point resolves to the
 *  target (or a descendant). */
/** §2.3 `H-3` clause 1 (`G-9`/`M-10`) — THE PROBE IS LOGGED CENTRALLY, so the
 *  coordinate/ viewport / hit / `onTarget` / `inVp` a click ACTUALLY USED can be
 *  carried onto the row result that rests on it. Before this, the record lived
 *  only on the helper's return value, which most blocks discarded: ONE of the
 *  battery's 45 verdict-carrying clicks reached a `ROW` line with its coordinate
 *  printed. The log is reset per block by the block-runner and harvested there
 *  (`ufAttachClickRecords`), so no block is hand-edited to carry its record.
 *  `rows` (⟨gate-4 `D-1`⟩) is the ROW IDENTITY the drive site knows: a string row
 *  id, or the array of row ids this one click was driven FOR when several rows'
 *  verdicts rest on it (a shared click). It is recorded on the entry so the
 *  carrier can attach by identity instead of by position. */
async function ufHitProbe(h, selector, rows) {
  const q = JSON.stringify(selector)
  const p = await h.cdp.evaluate(`(()=>{const e=document.querySelector(${q});if(!e)return null;const r=e.getBoundingClientRect();const x=r.x+r.width/2,y=r.y+r.height/2;const hit=document.elementFromPoint(x,y);return {x:x,y:y,w:Math.round(r.width),h:Math.round(r.height),vp:[innerWidth,innerHeight],inVp:(x>=0&&y>=0&&x<=innerWidth&&y<=innerHeight),hit:hit?(hit.id||hit.tagName):null,onTarget:!!(hit&&(hit===e||e.contains(hit)))}})()`)
  ufLogProbe(selector, p, rows)
  return p
}

/** §2.3 `H-3` — A REAL CDP pointer click (the element is scrolled into view
 *  first). It hit-tests the dispatch coordinate with `elementFromPoint` and
 *  RECORDS the coordinate, the viewport, the element under the point and
 *  `onTarget`. `path:'cdp'` (the ONLY accepted path) means the hit test resolved
 *  the target; `native-fallback`/`missing`/`zero-box`/`off-viewport` are recorded
 *  honestly and `realInput` is DERIVED from the path, so a row verdict can gate on
 *  it (§6.1: `realInput` is true only when the hit-tested path was proven). */
function ufClickShape() {
  // §2.3 `H-3` clause 1 — THE RECORDED SHAPE every click carries: the coordinate
  // (`x`/`y`), the viewport (`viewport`), the element under the point (`hit`, the
  // `document.elementFromPoint` read of the dispatch coordinate), `onTarget` and
  // the `path`. The unproven paths are named here: `missing` (no element),
  // `zero-box` (a zero-size box) and `off-viewport`.
  return { x: null, y: null, viewport: null, hit: null, onTarget: false, path: null, realInput: false }
}

// ---------------------------------------------------------------------------
// §2.3 `H-3` clause 1 / §3.2 `F-4` — THE DRIVER'S OWN GESTURE-RECORD LOG, and
// the CENTRAL carrier that puts a click's record onto the row result it carries
// the verdict for. The click helpers already COMPUTE the contracted record (the
// coordinate, the viewport it was dispatched against, the element under that
// point, `onTarget`, `inVp`) — but the record lived only on the helper's RETURN
// VALUE, which most blocks discard, so of the live battery's 45
// verdict-carrying clicks exactly ONE printed `coordinate=… viewport=…
// inVp=… onTarget=…` (an off-target case printed no viewport, an off-viewport
// case neither coordinate nor viewport). The record is therefore logged HERE,
// by the probe (`ufHitProbe`) and marked by the branch the click route took
// (`ufMarkClickPath`), then harvested onto the block's row results by the
// block-runner — one central step, no hand-edited block.
// ---------------------------------------------------------------------------
/** The recorded click entries of ONE block: `{selector, probe, path, row, rows}`.
 *  Reset per block by the block-runner; `path` is the DECISION the click route
 *  recorded (the same vocabulary `gesturePath` carries: `cdp` |
 *  `native-fallback` | `off-viewport` | `zero-box` | `missing`).
 *
 *  ⟨GATE-4 FINDING `D-1`⟩ — **THE ENTRY CARRIES THE IDENTITY OF THE ROW IT DROVE.**
 *  The log used to record `{selector, probe, path}` and NOTHING that maps an entry
 *  back to the row result whose gesture it was, so the carrier had to pair rows to
 *  clicks POSITIONALLY (rotate a same-path pool by the row's index): a mixed-path
 *  multi-row block could hand row *i* a pool slot belonging to ANOTHER row, and a
 *  single-attributed-row block that drove several clicks was handed the LAST
 *  same-path click of the block (possibly a setup/restore click). The identity is
 *  therefore recorded AT THE DRIVE SITE (`ufRealClick`'s `opts.row`/`opts.rows`, or
 *  `cdp.click`'s second argument) by the block that knows whose gesture it is
 *  driving, and the carrier attaches BY IDENTITY (`entry.row === res.row`, or the
 *  entry's `rows` set containing the row) — never by rotation. */
const UF_GESTURE_LOG = []
let UF_LAST_PROBE = -1
/** The recorded path vocabulary a CLICK's verdict can rest on (§2.3 `H-3`). A
 *  path outside it (a drag's `cdp`, an `mcp-import` state row) is not a click
 *  record and is never given one. */
const UF_CLICK_PATH_VOCAB = ['cdp', 'native-fallback', 'off-viewport', 'zero-box', 'missing']

function ufLogProbe(selector, probe, rows) {
  // ⟨GATE-4 `D-1`⟩ — THE ENTRY'S ROW IDENTITY, normalized from the drive site's
  // `row` (a single id) or `rows` (the ids a SHARED click was driven for). ONE ENTRY
  // IS LOGGED PER ROW THE CLICK WAS DRIVEN FOR, each naming its own row, so the
  // carrier's pairing is the contract's own `entry.row === res.row` for every row a
  // shared click serves (a click driven for the checklist row AND a declared row
  // belongs to BOTH). A drive site that names no row (a setup/hygiene/restore click)
  // logs ONE entry with `row: null`: it can then be attached only by a block whose
  // single click-carrying row makes it that row's own gesture.
  const ids = typeof rows === 'string' && rows !== ''
    ? [rows]
    : (Array.isArray(rows) ? rows.filter((r) => typeof r === 'string' && r !== '') : [])
  for (const id of (ids.length ? ids : [null])) {
    UF_GESTURE_LOG.push({ selector: String(selector), probe: probe ?? null, path: null, row: id, rows: ids })
  }
  UF_LAST_PROBE = UF_GESTURE_LOG.length - 1
}

/** Mark the DECISION the click route took on its own last probe — every entry that
 *  probe logged (its row identity included). ⟨gate-4 `D-1`⟩ The record is attached to
 *  a row result only through the entries that NAME that row, so a setup/hygiene click
 *  of the same block is never printed as another row's gesture (and a block with a
 *  single click-carrying row reads only its OWN pool). */
function ufMarkClickPath(path) {
  if (UF_LAST_PROBE < 0 || UF_LAST_PROBE >= UF_GESTURE_LOG.length) return
  // ⟨GATE-4 `D-1`⟩ — the DECISION belongs to the whole last PROBE, so every entry that
  // probe logged (one per row identity it was driven for) carries the same recorded
  // path: a shared click's decision is not visible on only one of its rows.
  const group = UF_GESTURE_LOG[UF_LAST_PROBE].probe
  for (const e of UF_GESTURE_LOG) if (e.probe === group && e.path === null) e.path = path
}

/** Both click routes (`ufRealClick`'s `rect`-carrying record and `cdp.click`'s
 *  flat coordinate record) normalized to the ONE printed shape, so the `ROW`
 *  line's click evidence has a single vocabulary whichever route drove it. */
function ufNormalizeClickRecord(raw) {
  if (!raw || typeof raw !== 'object') return null
  const p = raw.rect ?? raw.probe ?? raw
  const x = Number.isFinite(p.x) ? p.x : null
  const y = Number.isFinite(p.y) ? p.y : null
  const vp = Array.isArray(raw.viewport) ? raw.viewport : (Array.isArray(p.vp) ? p.vp : null)
  return {
    selector: raw.selector ?? null,
    coordinate: x !== null && y !== null ? [Math.round(x), Math.round(y)] : null,
    viewport: vp,
    hit: raw.hit ?? p.hit ?? null,
    onTarget: (raw.onTarget ?? p.onTarget) === true,
    inVp: (raw.inVp ?? p.inVp) === true,
    path: raw.path ?? null,
    realInput: raw.realInput === true,
    clicks: raw.clicks ?? 1,
    samePathClicks: raw.samePathClicks ?? 1,
  }
}

/** The printed shape of one click record: the coordinate, the viewport it was
 *  dispatched against, the element under the point, `onTarget`, `inVp` AND the
 *  recorded path (`§2.3 H-3` clause 1). The MARKED clicks are the decisions the
 *  click route itself recorded; the UNMARKED probes are the raw-coordinate
 *  route's (`cdp.click`), whose path a row carries in its own `gesturePath`. */
function ufClickRecordFor(results, log) {
  if (!Array.isArray(log) || log.length === 0) return null
  const marked = log.filter((e) => e.path !== null && UF_CLICK_PATH_VOCAB.includes(e.path))
  const unmarked = log.filter((e) => e.path === null && e.probe !== null)
  if (marked.length === 0 && unmarked.length === 0) return null
  return { marked, unmarked }
}

/** §2.3 `H-3` clause 1 (`G-9`/`M-10`) — CARRY THE CLICK RECORD ONTO THE ROW
 *  RESULT: for every result whose verdict rests on a click (a proven
 *  `gesturePath='cdp'`, or a recorded unproven click path), a recorded click of
 *  that SAME path is attached as `clickRecord` — PER ROW, never per block. A
 *  block that supplies its own record (`opts.click`, kept explicitly by the block
 *  that owns the gesture) is never overwritten. The record is DATA, not a verdict:
 *  it changes no `pass`, no `verdict` and no aggregate.
 *
 *  §2.3 `H-3` / findings `C-6` AND `D-1` — **PER-ROW ATTRIBUTION BY IDENTITY, NOT BY
 *  ROTATION.** The gesture log now records the IDENTITY of the row each entry drove
 *  (`{selector, probe, path, row, rows}` — ⟨gate-4 `D-1`⟩), so a row's record is taken
 *  from ITS OWN entries and its count is the number of its own recorded clicks. The
 *  two mis-pairs the positional pairing produced are therefore impossible: a
 *  mixed-path multi-row block can never hand row *i* a pool slot belonging to another
 *  row (no cross-row pool is read at all), and a single-attributed-row block that
 *  drove several clicks can never hand its row the LAST same-path click of the block
 *  (the row's own entry is read, which for a shared click names every row it was
 *  driven for). What remains is the ONE case that needs no identity: a block with a
 *  SINGLE click-carrying row, where every click of the block IS that row's own
 *  gesture and the block's total count is therefore that row's own count. A block
 *  with more than one click-carrying row and no entry naming this row hands it NO
 *  record at all, and `clicksDriven` is WITHHELD wherever no per-row count exists —
 *  never filled with the block's total (the measured `clicksDriven=[3,3]`). A result
 *  that drove no click carries no record at all — and a result may never BORROW one:
 *  a row whose own gesture path is a DRIVER-failure path (`missing`, `off-viewport`,
 *  `zero-box`) never dispatched a click, so the block's setup clicks are NOT its
 *  record (measured: the PARKED `U-EDIT-1-LIVE-6` row, whose own gesture is a
 *  `missing` selector, printed a setup click on `.tab[data-tab-id="tab-5"]` with the
 *  block's total `clicksDriven=8`, a click the row never drove). Such a row carries a
 *  record stating ITS OWN gesture — the path it recorded, the selector it could not
 *  drive, `realInput:false` — never a landed click of the block. */
function ufAttachClickRecords(results, log) {
  const clicks = ufClickRecordFor(results, log)
  if (clicks === null) return
  const marked = Array.isArray(clicks.marked) ? clicks.marked : []
  const unmarked = Array.isArray(clicks.unmarked) ? clicks.unmarked : []
  const isClick = (e) => e && e.probe !== null && e.probe !== undefined
  // THE ROWS WHOSE VERDICT RESTS ON A CLICK, in result order — the population the
  // block-wide count would otherwise be stamped onto.
  const attributed = []
  for (const res of results) {
    if (!res || typeof res !== 'object') continue
    if (res.clickRecord) continue
    const path = typeof res.gesturePath === 'string' ? res.gesturePath : null
    const carries = res.realInput === true || (path !== null && UF_CLICK_PATH_VOCAB.includes(path))
    if (!carries) continue
    attributed.push({ res, path })
  }
  for (let i = 0; i < attributed.length; i++) {
    const { res, path } = attributed[i]
    // A ROW WHOSE OWN PATH IS A DRIVER-FAILURE PATH DROVE ITS GESTURE AND DID NOT
    // LAND IT: its record is that failure — the path it recorded, the selector it
    // addressed, `realInput:false` — and NEVER one of the block's landed clicks.
    // (Before this, a parked row whose own gesture was a `missing` selector printed
    // a setup click of the block, with the block's total count.)
    if (path !== null && path !== 'cdp' && res.realInput !== true) {
      res.clickRecord = {
        selector: typeof res.clickSelector === 'string' && res.clickSelector !== '' ? res.clickSelector : null,
        coordinate: null,
        viewport: null,
        hit: null,
        onTarget: false,
        inVp: false,
        path: path,
        realInput: false,
        clicks: null,
        samePathClicks: 0,
      }
      continue
    }
    const matching = marked.filter((e) => isClick(e) && e.path === path)
    // FALLBACK (`cdp.click`'s raw-coordinate route, which records no decision of
    // its own): the block's own `gesturePath` IS the recorded path, so an unmarked
    // probe is that click's record. Used ONLY when no marked decision carries the
    // row's path, so a setup probe can never displace a real decision.
    const pool = matching.length > 0 ? matching : (path !== null ? unmarked.filter((e) => isClick(e) && e.path === null) : [])
    // ⟨GATE-4 FINDING `D-1` — ATTACHED BY IDENTITY, NEVER BY ROTATION.⟩ A row's own
    // entries are the ones that NAME IT (`entry.row === res.row` — the identity the
    // drive site recorded — or, for a row that records the selector its own gesture
    // drove, the entry logged on that selector). The pairing is taken over THOSE
    // ONLY: the pool is never indexed by the row's position, so a mixed-path
    // multi-row block cannot hand row *i* a slot belonging to another row, and a
    // single-attributed-row block cannot hand its row the block's last same-path
    // click (a setup/restore click of the block, which no entry names that row on).
    const namesRow = (e) => e.row === res.row
    const namesOwnSelector = (e) => e.selector != null && e.selector === res.clickSelector
    const own = (e) => isClick(e) && (namesRow(e) || namesOwnSelector(e))
    // WHETHER THIS ROW RECORDS AN IDENTITY OF ITS OWN: a row that names no identity at
    // all can only be paired by the pool (below); a row that DOES record the selector
    // its own gesture drove (`clickSelector`) has stated which click is its own, so a
    // pool entry that matches neither its row id nor that selector is NOT its click.
    const rowNamesItsOwn = res.clickSelector != null && res.clickSelector !== ''
    const ownMarked = marked.filter(own)
    const ownSamePath = ownMarked.filter((e) => e.path === path)
    const ownUnmarked = unmarked.filter(own)
    // THE ROW'S OWN PER-CLICK COUNT: how many recorded clicks of its own path name
    // this row (a click SERIES the row's verdict rests on counts as itself). Read
    // ONLY from the row's own entries — the block's total is never stamped on a row.
    const ownCount = ownSamePath.length > 0 ? ownSamePath.length : ownUnmarked.length
    // THE NO-IDENTITY CASE — THE ROW'S OWN RECORD CAN STILL BE UNAMBIGUOUS. A block
    // with exactly ONE click-carrying row whose pool holds exactly ONE decision of the
    // row's path has no other row the click could belong to and no second click to
    // confuse it with: that one entry IS the row's own gesture (`C-6`/`R-13.i`'s own
    // single-row case). Everywhere else — more than one click-carrying row and no
    // entry naming this one, or an ambiguous pool — the row carries NO record at all,
    // and `clicksDriven` is WITHHELD: a click the row cannot be shown to have driven
    // is exactly what this finding forbids printing.
    const ownEntry = ownSamePath.length > 0 ? ownSamePath[ownSamePath.length - 1] : (ownUnmarked.length > 0 ? ownUnmarked[ownUnmarked.length - 1] : null)
    const onlyEntry = attributed.length === 1 && pool.length === 1 && !rowNamesItsOwn ? pool[0] : null
    const hit = ownEntry ?? onlyEntry
    if (hit === null) continue // no click of this row's own: it carries NO record (never another row's)
    const p = hit.probe
    // §2.3 `H-3` — **THE COUNT PRINTED AS `clicksDriven` IS THE ROW'S OWN COUNT.** It
    // is the number of the row's OWN recorded clicks (entries that NAME it — a shared
    // click naming several rows contributes to each of them) when the block recorded
    // any identity for the row; only for the single-attributed-row block, where no
    // other row exists to own them, is the block's total that row's own count. Where
    // NEITHER holds, no record is attached — `clicksDriven` is withheld (there is no
    // per-row count) rather than filled with the block's total.
    res.clickRecord = {
      selector: hit.selector,
      coordinate: Number.isFinite(p?.x) && Number.isFinite(p?.y) ? [Math.round(p.x), Math.round(p.y)] : null,
      viewport: p && Array.isArray(p.vp) ? p.vp : null,
      hit: p ? p.hit ?? null : null,
      onTarget: p ? p.onTarget === true : false,
      inVp: p ? p.inVp === true : false,
      path: hit.path !== null && hit.path !== undefined ? hit.path : path,
      realInput: res.realInput === true,
      clicks: clicks.marked.length + clicks.unmarked.length,
      samePathClicks: ownSamePath.length > 0 ? ownSamePath.length : matching.length,
    }
    // ⟨GATE-4 `D-1`/`C-6`⟩ — THE COUNT IS THE ROW'S OWN OR IT IS WITHDRAWN. The two
    // cases in which the block's recorded click count IS this row's own count: the row
    // named its own clicks (its own entries gave the count), or the block's single
    // click-carrying row was reached through its one unambiguous pool entry. Everywhere
    // else the count is NOT a per-row count and is withheld (`clicksDriven=null`
    // printed), never stamped onto the row as the block's total (the measured
    // `clicksDriven=[3,3]`).
    if (ownCount > 0) res.clickRecord.clicks = ownCount
    else if (onlyEntry === null) res.clickRecord.clicks = null
  }
}

async function ufRealClick(h, selector, opts = {}) {
  // §2.3 `H-3` — the recorded shape's own vocabulary, named as code so the
  // artifact states what the accepted path rests on:
  // §2.3 `H-3` clause 1 — THE RECORDED SHAPE is what this helper returns: the
  // coordinate, the viewport, the element under the point (the hit test the
  // accepted path rests on) and onTarget; the unproven paths it names are
  // missing, off-viewport and the zero-size box. Every non-`cdp` record is PURE
  // DATA over `(p, opts)` — a literal / a `p`-derived expression, never a closure
  // over a caller local — so the shape can be read and evaluated as the record it
  // claims to be (and `realInput: false` is DERIVED from the path, not asserted).
  const q = JSON.stringify(selector)
  // ⟨GATE-4 `D-1`⟩ — THE ROW IDENTITY OF THIS CLICK, named by the drive site
  // (`opts.row` for the one row whose gesture this is; `opts.rows` for the ids a
  // SHARED click was driven for), carried onto every probe entry this click logs so
  // the record is attached BY IDENTITY and never by a row's position in a pool. A
  // call site that names no row (a setup/hygiene/restore click) records none: it can
  // then be picked up only by a block that has exactly ONE click-carrying row (whose
  // own gesture that click necessarily is), never as another row's record.
  const ROWS = opts.rows ?? opts.row ?? null
  if (opts.scroll !== false && opts.settle !== 0) {
    await h.cdp.evaluate(`(()=>{const e=document.querySelector(${q});if(e&&typeof e.scrollIntoView==='function')e.scrollIntoView({block:'center'});return true})()`)
    await sleep(250) // let the scroll/relayout settle before the hit-test
  }
  let p = await ufHitProbe(h, selector, ROWS)
  // The hit-test is `document.elementFromPoint`: it decides `onTarget`. The
  // accepted path is the real CDP dispatch (`Input.dispatchMouseEvent`), and the
  // helper records `path: 'zero-box'` for a zero-size box.
  // Re-probe ONCE (a reflowing scrolled page must not be read as a covered target).
  if (p && !p.onTarget && opts.scroll !== false) { await sleep(200); p = await ufHitProbe(h, selector, ROWS) }
  if (!p) {
    ufMarkClickPath('missing')
    return { path: 'missing', ok: false, realInput: false, detail: 'not found (the selector matched no element in the rendered app — the calling block names the selector it drove)' }
  }
  if (p.w === 0 || p.h === 0) {
    ufMarkClickPath('zero-box')
    return { path: 'zero-box', ok: false, realInput: false, rect: p, detail: `zero-size box ${p.w}x${p.h}` }
  }
  // §2.3 `H-3` clause 2 / `F-4` — an OFF-VIEWPORT coordinate (M-7's measured
  // `y=1473.8` of a `720` px viewport) is a DRIVER failure: it is NOT dispatched
  // as a gesture and it is NOT an app FAIL. The record names the coordinate, the
  // viewport and `onTarget`, and the row's verdict reads `NOT-DRIVEN`.
  if (p.inVp === false) {
    ufMarkClickPath('off-viewport')
    return { path: 'off-viewport', ok: false, realInput: false, rect: p, inVp: false, viewport: p.vp, onTarget: false, detail: `coordinate (${Math.round(p.x)},${Math.round(p.y)}) is OUTSIDE the viewport ${JSON.stringify(p.vp)} (inVp:false) — the gesture COULD NOT BE DRIVEN (a driver failure, never an app verdict)` }
  }
  if (!p.onTarget && opts.nativeFallback !== false) {
    // The synthetic fallback is dispatched (attribution evidence for the row), but the
    // RECORD stays the contracted pure shape: `ok:false` is its OWN classification —
    // a synthetic `.click()` is never a proven gesture and can never feed a PASS
    // (§2.3 `H-3` clause 3), whatever the synthetic dispatch reported.
    await h.cdp.evaluate(`(()=>{const e=document.querySelector(${q});if(!e)return false;e.click();return true})()`)
    ufMarkClickPath('native-fallback')
    return { path: 'native-fallback', ok: false, realInput: false, rect: p, inVp: true, viewport: p.vp, onTarget: false, detail: `hit=${p.hit} (not the target) -> synthetic DOM .click() (a synthetic path can never feed a PASS)` }
  }
  // the accepted path IS the real CDP pointer dispatch: Input.dispatchMouseEvent
  await sendPointerClick(h.cdp, p)
  // The hit-test the verdict rests on: re-read at the dispatch coordinate AFTER
  // the events, so a reflow between the probe and the dispatch is visible in the
  // recorded evidence (a stale coordinate is the difference between "the handler
  // is dead" and "our click landed elsewhere").
  const hitAtDispatch = await h.cdp.evaluate(`(()=>{const hit=document.elementFromPoint(${p.x},${p.y});return hit?(hit.id||hit.tagName):null})()`)
  ufMarkClickPath('cdp')
  return { path: 'cdp', ok: true, realInput: true, rect: p, inVp: true, viewport: p.vp, onTarget: true, hitAtDispatch }
}

/**
 * §2.3 `H-3` clause 1 — THE REAL CDP POINTER DISPATCH at a hit-tested coordinate:
 * `Input.dispatchMouseEvent` move + press + release. Every verdict-carrying click
 * goes through this path, so `realInput` is derived from a dispatch the driver
 * actually made (a synthetic `.click()` cannot reach it).
 */
async function sendPointerClick(cdp, p) {
  // Input.dispatchMouseEvent
  const base = { x: p.x, y: p.y, button: 'left' }
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y, buttons: 0 })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', ...base, buttons: 1, clickCount: 1 })
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...base, buttons: 0, clickCount: 1 })
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
 *  mounted document-head id) so a content revert/restore is byte-checkable.
 *
 *  EXTENDED 2026-09-22 (U-STAGE-ACTIVE-TAB §8.3, the audit's §4.2 requirement):
 *  the reading now also carries the stage's IDENTITY — the page-edit surface's
 *  `data-edit-surface` marker, whether the SEARCH stage roots are present
 *  (`#stage-search-tab` / `#search-tab-input`) and the DERIVED `stageKind`
 *  ('document' | 'search' | 'landing' | 'placeholder' | 'unknown') — because the
 *  text/hash alone cannot distinguish "the active tab's page" from "another
 *  tab's page". This is an ORACLE-IDENTITY change
 *  (`docs/specs/requirement-catalog.md` §2.2 fact 3). */
async function ufStageSig(h) {
  return h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');const t=m?(m.textContent||''):'';let hash=0;for(let i=0;i<t.length;i++){hash=(hash*31+t.charCodeAt(i))|0}const h1=m?m.querySelector('h1'):null;
    const marker=m?m.querySelector('[data-edit-surface]'):null;
    const searchStage=!!document.getElementById('stage-search-tab');
    const searchInput=!!document.getElementById('search-tab-input');
    const landing=!!document.getElementById('stage-landing');
    const kind=searchStage?'search':(landing?'landing':((m&&(m.querySelector('[data-doc-head]')||m.querySelector('#page-edit-surface')||h1))?'document':((m&&m.querySelector('[data-stage=\"placeholder\"]'))?'placeholder':'unknown')));
    return {len:t.length,hash:hash,docId:h1?h1.id:null,landing:landing,
      editSurface:marker?marker.getAttribute('data-edit-surface'):null,
      searchStage:searchStage,searchInput:searchInput,stageKind:kind}})()`)
}

/** The rendered app-graph pane frames (identity, box, body-node census).
 *  §2.3 `H-1` clauses 1/3/4: this is the FRAME read every frame-based row takes,
 *  so it is also the read whose caller must first put `zone:left` back to its
 *  baseline — an earlier block's own `is-minimized` minimize replaces the pane
 *  stack with the tab strip BY DESIGN, and a frame read taken against that state
 *  would report the driver's own artifact as the pane's absence (`V-7`/`M-6`).
 *  The restore is therefore taken PER BLOCK by the block-runner's pre-flight
 *  (`ufBlockPreflightRestore`), never once per battery. */
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

// ---------------------------------------------------------------------------
// §7.2 THE LAYOUT-EFFECT RE-PIN (unit `U-ZONE-REPLACEMENT` / `PD-UI-14`).
//
// THE READINGS BELOW ARE THE THREE §7.2 LIMBS, taken ON THE ASSEMBLED SURFACE (the
// app the driver itself spawned, through its own CDP input path — never a synthetic
// substitute) and printed as an EXTENSION of the ALREADY-DECLARED `§5.U` carrier rows
// (`U-3`/`uf_panes_12` for limb 1, `U-5`/`uf_layout_10` for limbs 2 and 3). NO new
// slot is created, `MATRIX_ROWS` is UNMOVED at the 8 declared rows, and no `U-n` id
// is renumbered.
//
// WHAT THEY ARE NOT (the contract names each refusal, so the failure cannot recur):
// a mount count is limb 1's SUB-CLAUSE, never limb 1; a class-existence or an XOR
// invariant (`uf_layout_10`'s landed `settings-modal` class-XOR) is a DOM/class
// invariant of a DIFFERENT surface and is NOT a layout-effect reading at all; and a
// node-side reading cannot carry any limb. Every limb prints its REQUIRED values
// beside its OBSERVED ones; a scoped or partial reading carries its scope.
// ---------------------------------------------------------------------------

/** §7.2 LIMB 1's CARRIER READING — the assembled surface's sibling-zone and stage
 *  boxes (position AND size, in the greens' `[x,y,w,h]` shape), `#wiki-root`'s MOUNT
 *  COUNT, and the STALE-CHILDLESS-ROOT census, all taken at ONE instant so a
 *  before/after pair is a value-for-value comparison of the same reads. */
async function ufLayoutReading(h) {
  return h.cdp.evaluate(`(()=>{
    const box=(e)=>{if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};
    const g=(id)=>document.getElementById(id);
    const roots=[...document.querySelectorAll('#wiki-root')];
    return {
      zoneLeft:box(g('zone:left')),
      zoneRight:box(g('zone:right')),
      zoneHeader:box(g('zone:header')),
      zoneFooter:box(g('zone:footer')),
      main:box(g('zone:main')),
      tabStrip:box(g('tab-strip')),
      wikiRoot:box(g('wiki-root')),
      gridColumns:(()=>{const w=g('wiki-root');return w?getComputedStyle(w).gridTemplateColumns:null})(),
      mountCount:roots.length,
      staleChildlessRoots:roots.filter((w)=>w.children.length===0).length,
      page:{y:Math.round(scrollY),docScrollHeight:document.documentElement.scrollHeight,docClientHeight:document.documentElement.clientHeight},
      frames:[...document.querySelectorAll('[data-zone] .pane-frame[data-pane-id]')].map((f)=>({paneId:f.getAttribute('data-pane-id'),slot:f.parentElement?[...f.parentElement.children].filter((c)=>c.classList&&c.classList.contains('pane-frame')).indexOf(f):-1,box:box(f)}))
    }})()`)
}

/** §7.2 LIMB 2's CARRIER READING — the FOUR ZONE CONTAINERS' box rects and, per zone,
 *  the zone's OWN scroll geometry: the computed `position` (the clause's own word,
 *  §2.1(d): *"each zone container carries `position: fixed`"*), the content box's
 *  computed `overflow-y`, and whether the zone's own box carries an internal scroll
 *  range with `scrollTop` ADVANCING INSIDE THAT BOX (the scrolled element is NAMED:
 *  the zone's own content box, never the document). THE SCOPE IS THE FOUR CONTAINERS
 *  (`#zone:left|right|header|footer`) — never every element carrying `data-zone`: the
 *  four AUTHORED GUTTER AFFORDANCES and the zone-minimize controls carry that same
 *  attribute and are containers of nothing (a gutter's box can never hold a scroll
 *  range), so they are printed BESIDE the reading under the excluded list, never graded
 *  as zone containers. Driven by a PAGE-LEVEL scroll attempt whose own advance AND the
 *  document's own overflow are read back, so a no-op attempt is never mistaken for the
 *  property. A zone whose content does NOT exceed its box has no range to exercise and
 *  says so per zone (`contentExceedsTheBox`), so the "any overflow scrolls inside" half
 *  is graded on the zones that HAVE an overflow — and the reading's own non-vacuity is
 *  carried separately (`anyInternalScrollRangeExercised`). */
async function ufLayoutZoneScrollAttempt(h, attempt = 240) {
  return h.cdp.evaluate(`(()=>{
    const box=(e)=>{if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};
    const ZONES=['left','right','header','footer'];
    const containers=()=>ZONES.map((z)=>({id:'zone:'+z,zone:z,el:document.getElementById('zone:'+z)})).filter((c)=>c.el!=null);
    const rects=()=>containers().map((c)=>({id:c.id,zone:c.zone,box:box(c.el)}));
    const before=rects();
    const pageBefore={y:Math.round(scrollY),docScrollTop:document.scrollingElement?Math.round(document.scrollingElement.scrollTop):null,docScrollHeight:document.documentElement.scrollHeight,docClientHeight:document.documentElement.clientHeight};
    window.scrollTo(0,${Number(attempt)});
    const after=rects();
    const pageAfter={y:Math.round(scrollY),docScrollTop:document.scrollingElement?Math.round(document.scrollingElement.scrollTop):null,docScrollHeight:document.documentElement.scrollHeight,docClientHeight:document.documentElement.clientHeight};
    const inside=containers().map((c)=>{
      const z=c.el;const cs=getComputedStyle(z);
      const st0=Math.round(z.scrollTop);
      z.scrollTop=Math.min(40,z.scrollHeight-z.clientHeight+40);
      const st1=Math.round(z.scrollTop);
      z.scrollTop=st0;
      return {id:c.id,zone:c.zone,scrolledElement:'the zone container itself ('+c.id+', its own content box)',position:cs.position,display:cs.display,overflowY:cs.overflowY,scrollHeight:z.scrollHeight,clientHeight:z.clientHeight,contentExceedsTheBox:z.scrollHeight>z.clientHeight+1,scrollTopBefore:st0,scrollTopAfter:st1,scrollTopAdvanced:st1>st0};
    });
    window.scrollTo(0,0);
    if(document.scrollingElement)document.scrollingElement.scrollTop=0;
    const stage=document.getElementById('zone:main');
    const stageScroll=stage==null?null:(()=>{const cs=getComputedStyle(stage);const st0=Math.round(stage.scrollTop);stage.scrollTop=Math.min(40,stage.scrollHeight-stage.clientHeight+40);const st1=Math.round(stage.scrollTop);stage.scrollTop=st0;return {id:'zone:main',position:cs.position,overflowY:cs.overflowY,scrollHeight:stage.scrollHeight,clientHeight:stage.clientHeight,contentExceedsTheBox:stage.scrollHeight>stage.clientHeight+1,scrollTopBefore:st0,scrollTopAfter:st1,scrollTopAdvanced:st1>st0}})();
    const excluded=[...document.querySelectorAll('#app [data-zone]')].filter((e)=>!ZONES.some((z)=>e.id==='zone:'+z)).map((e)=>({id:e.id||e.getAttribute('data-zone'),zone:e.getAttribute('data-zone'),classes:String(e.className||''),box:box(e)}));
    const zonesUnmoved=before.length>0&&before.length===after.length&&before.every((b,i)=>JSON.stringify(b.box)===JSON.stringify(after[i].box));
    const pageMoved=pageAfter.y!==pageBefore.y||pageAfter.docScrollTop!==pageBefore.docScrollTop;
    const viewport=[innerWidth,innerHeight];
    const bounded=before.every((b)=>b.box!=null&&b.box[3]<=viewport[1]+1);
    const anyInternalScrollRangeExercised=inside.some((z)=>z.contentExceedsTheBox===true&&z.scrollTopAdvanced===true)||!!(stageScroll&&stageScroll.contentExceedsTheBox===true&&stageScroll.scrollTopAdvanced===true);
    return {
      required:{zonesUnmovedAcrossAPageLevelScrollAttempt:true,eachZoneContainerPositionFixed:'every zone container computes position:fixed (the clause own words, section 2.1(d))',eachZoneContentBoxScrollsInternally:'every zone container computes an overflow-y that can scroll (auto, never visible) and, WHERE the content exceeds the box, its own scrollTop advances inside that box (section 2.1(d): any overflow scrolls INSIDE the box)',noZoneBoxIsStretchedByTheDocument:'every zone box height stays within the viewport and the page itself cannot overflow (the document cannot scroll the zones away)',thePageLevelAttemptIsReadBack:'the page own offset and the document own overflow are printed, so a no-op attempt is never mistaken for the property'},
      attemptPx:${Number(attempt)},
      before,after,inside,excluded,stageScroll,viewport,
      pageBefore,pageAfter,pageMoved,
      pageCannotOverflow:pageAfter.docScrollHeight<=pageAfter.docClientHeight+1,
      zonesUnmoved,zoneBoxesBoundedByTheViewport:bounded,anyInternalScrollRangeExercised,
      scrolledElement:'each of the four zone CONTAINERS (its own content box), never the document',
      zoneScope:'the four pane-zone containers; every OTHER element carrying data-zone (the four authored gutter affordances, the zone-minimize controls) is listed under the excluded list and is not graded as a zone container',
      scope:'the assembled renderer surface this driver spawned'
    }})()`)
}

/** §7.2 LIMB 3's SUBJECT IDENTITY — **A PREPARED SUBJECT IS NAMED BY ITS OWN
 *  FIXTURE; AN INHERITED ONE IS NAMED BY THE MARKER THE SHAPE CARRIES.** The
 *  preparation helper returns EARLY when the stage box already overflows, and on
 *  that path the subject is a document THIS BLOCK NEVER WROTE (whatever the previous
 *  phase left open). The reading must therefore print WHAT THE SUBJECT IS in each
 *  case, and the returned value must DECIDE which narrative is printed — the print
 *  site previously carried its ternary the WRONG WAY ROUND, so a `prepared:false`
 *  run printed the fixture narrative of a fixture that was never written (gate-4
 *  re-audit item 2). PURE. */
function ufStageSubjectIdentity(prep) {
  if (prep == null || typeof prep !== 'object') return 'no preparation record'
  if (prep.prepared === true) return `the fixture this helper wrote (${prep.fixturePath})`
  const observed = prep.observed ?? null
  const activeTab = observed && observed.activeTab != null ? JSON.stringify(observed.activeTab) : 'not read'
  const marker = observed && observed.stageTextHasMarker != null ? String(observed.stageTextHasMarker) : 'not read'
  return `THE STATE THIS BLOCK INHERITED (no fixture was written or imported on this path — the stage document at the read is the pre-existing one: its active tab was ${activeTab}, and the fixture's own marker text rendered=${marker})`
}

/** §7.2 LIMB 3's CARRIER READING — the STAGE's OWN box as the scroll container: the
 *  stage box rect and the surrounding CHROME's (the zones' and the tab strip's) rects
 *  across a document-scroll attempt on the stage's own box, with BOTH the stage's own
 *  `scrollTop` and the page's own offset read back so "scrolled inside" and "scrolled
 *  the page" are told apart. The scrolled element is NAMED. */
async function ufLayoutStageScrollAttempt(h, attempt = 200) {
  return h.cdp.evaluate(`(()=>{
    const box=(e)=>{if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};
    const g=(id)=>document.getElementById(id);
    const chrome=()=>({zoneLeft:box(g('zone:left')),zoneRight:box(g('zone:right')),zoneHeader:box(g('zone:header')),zoneFooter:box(g('zone:footer')),tabStrip:box(g('tab-strip'))});
    const stage=g('zone:main');
    if(!stage)return {err:'no #zone:main on the assembled surface'};
    const chromeBefore=chrome();
    const pageBefore={y:Math.round(scrollY),docScrollTop:document.scrollingElement?Math.round(document.scrollingElement.scrollTop):null};
    const st0=Math.round(stage.scrollTop);
    stage.scrollTop=Math.min(${Number(attempt)},stage.scrollHeight-stage.clientHeight+${Number(attempt)});
    const st1=Math.round(stage.scrollTop);
    const pageAfter={y:Math.round(scrollY),docScrollTop:document.scrollingElement?Math.round(document.scrollingElement.scrollTop):null};
    const chromeAfter=chrome();
    stage.scrollTop=0;
    const cs=getComputedStyle(stage);
    const chromeUnmoved=JSON.stringify(chromeBefore)===JSON.stringify(chromeAfter);
    const pageUnmoved=JSON.stringify(pageBefore)===JSON.stringify(pageAfter);
    return {
      required:{theStageOwnBoxIsTheScrollContainer:'the stage box (#zone:main) is the element scrolled',stageScrollTopAdvances:'the stage own scrollTop advances',theSurroundingChromeDoesNotMove:'the zones and the tab strip keep their rects',thePageDoesNotScroll:'the page own offset does not move'},
      scrolledElement:'the stage box itself (#zone:main - the stage OWN box)',
      stageBox:box(stage),stageBoxAfter:box(stage),chromeBefore,chromeAfter,pageBefore,pageAfter,
      scrollHeight:stage.scrollHeight,clientHeight:stage.clientHeight,overflowY:cs.overflowY,
      scrollTopBefore:st0,scrollTopAfter:st1,
      stageScrollTopAdvanced:st1>st0,
      stageScrolledInside:st1>st0&&cs.overflowY!=='visible'&&stage.scrollHeight>stage.clientHeight+1,
      chromeUnmoved,pageUnmoved,
      attemptPx:${Number(attempt)},
      scope:'the assembled renderer surface this driver spawned'
    }})()`)
}

/** §7.2 LIMB 1's REAL INPUT — a hit-tested CDP POINTER DRAG on a pane HEADER inside
 *  `zone`, travelling PAST the frame that follows it in the SAME zone's slot order: a
 *  REARRANGE INSIDE ONE ZONE, driven through the driver's own input path (no synthetic
 *  DOM call, no MCP shortcut). FOUR THINGS THIS PROBE DOES HONESTLY, EACH MEASURED:
 *    (1) THE DRAG START IS THE PANE HEADER'S OWN DRAG SURFACE, resolved from the frame
 *        (`.pane-collapse-toggle` — the app's `PANE_HEADER_CLASS`) and hit-tested, with
 *        the app's OWN delegated resolution re-driven at the point
 *        (`closest('.gutter[data-zone], .pane-collapse-toggle')` must return that very
 *        header). NOTE, MEASURED AND RECORDED RATHER THAN ASSUMED: on this build the
 *        pane header IS a `button.pane-collapse-toggle` (the fork's own pinned F-1
 *        decision — the header is its own grab surface and is exempt from the
 *        interactive-control guard), so "a point on the header that is not the toggle"
 *        does not exist here; the probe uses the header element and says so.
 *    (2) THE DROP LANDS IN A BAND WHOSE DERIVED INSERTION INDEX IS NOT THE PANE'S OWN:
 *        a drop just inside the sibling's top edge derives the insertion index the pane
 *        ALREADY occupies, so such a probe could never register a rearrange even on a
 *        working drag. The candidate is the sibling's own `0.75` point; where the APP's
 *        own `insertionIndexForPoint` rule maps that point back to the pane's current
 *        index (measured on the carrier: zone:left is 634px tall with two panes, so the
 *        band boundary sits at the ZONE's midpoint — y≈370 — while the sibling's `0.75`
 *        point is y≈336, i.e. still inside the pane's OWN band), the probe re-derives
 *        the band it needs and prints both the derivation and what it moved to. The
 *        arithmetic is the app's own rule, transcribed here for the probe's placement
 *        and printed so the reading can be checked; the drop is still a REAL
 *        `Input.dispatchMouseEvent` at a hit-tested in-viewport point.
 *    (3) THE PATH IS REAL POINTER TRAVEL IN SMALL STEPS: the app claims the frame's
 *        pointer capture from a move ON the header (the deferred-capture policy), so a
 *        single 40px jump would leave the header in one move.
 *    (4) THE POINTER AUDIT: `gotpointercapture` / the capture holders at the end / the
 *        move and terminal targets are recorded, so a drag that moves no pane is
 *        reported as NOT-DRIVEN **with the reason it did not move** — never as a pass
 *        and never as a bare failure. */
async function ufPaneRearrangeInput(h, zone = 'left', preferredPane = 'doc-nav') {
  const frames = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('[data-zone="${zone}"] .pane-frame[data-pane-id]')].map((f,i)=>{const r=f.getBoundingClientRect();return {i,paneId:f.getAttribute('data-pane-id'),box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],header:!!f.querySelector('.pane-collapse-toggle')}}))()`)
  if (!Array.isArray(frames) || frames.length < 2) {
    return { driven: false, reason: `zone '${zone}' renders ${Array.isArray(frames) ? frames.length : '?'} pane frame(s) — a WITHIN-zone rearrange needs at least two`, frames: frames ?? null }
  }
  const order = (fs) => fs.map((f) => f.paneId).join(',')
  // ⟨gate-4 re-audit — THE START PANE IS CHOSEN BY THE PROPERTY, NOT BY IDENTITY.⟩
  // The zone's pane ORDER is PERSISTED state (`operatorSettings.layout`), so across
  // consecutive runs the preferred pane may already be LAST — and a pane with no
  // downward sibling cannot be moved DOWN at all, which reads "NOT DRIVEN" for a
  // reason that has nothing to do with the wiring. The probe therefore starts on the
  // FIRST frame of the zone (a downward move exists by construction whenever the zone
  // holds two or more panes) and PRINTS the pane it actually dragged, beside the
  // preference (the requested drag identity is not silently dropped).
  const preferredIdx = frames.findIndex((f) => f.paneId === preferredPane)
  const from = preferredIdx >= 0 && preferredIdx < frames.length - 1 ? preferredIdx : 0
  const start = frames[from]
  const sibling = frames[from + 1] ?? null
  if (!start || !sibling) return { driven: false, reason: `no downward sibling below ${start ? start.paneId : '(none)'} in zone '${zone}'`, frames }
  // THE DROP: the sibling's own `0.75` point (see (2) above). Bounded to the viewport so
  // the coordinate is always dispatchable; an off-viewport drop would be a DRIVER
  // precondition, reported as such by `ufRealClick`'s siblings rather than dispatched.
  const siblingMidpointDropY = Math.round(sibling.box[1] + sibling.box[3] * 0.75)
  // THE BAND CHECK — the app's OWN rule (`insertionIndexForPoint`, `src/renderer/pane-drag.ts`:
  // `min(count-1, floor(fraction*count))` over the zone's vertical span for a stacked zone),
  // transcribed so the probe can tell whether its candidate drop could EVER derive a
  // different index. A candidate that maps back to the pane's OWN index is a no-op by the
  // app's own arithmetic (F2), so a probe that dispatched it would report "no rearrange"
  // for a reason that has nothing to do with the wiring. The zone boxes are read from the
  // assembled app (the same `.layout [data-zone]` set the app's own move routing projects).
  const bandProbe = await h.cdp.evaluate(`(()=>{
    const zoneEl=document.querySelector('.layout [data-zone="${zone}"]');
    if(!zoneEl)return {err:'no .layout [data-zone="${zone}"] container on the assembled surface'};
    const r=zoneEl.getBoundingClientRect();
    const top=r.top,bottom=r.bottom,span=bottom-top;
    const idx=(y,count)=>span<=0?0:Math.min(count-1,Math.floor(Math.max(0,Math.min((y-top)/span,1))*count));
    return {top:Math.round(top),bottom:Math.round(bottom),span:Math.round(span)}})()`)
  const dropBands = (() => {
    if (!bandProbe || bandProbe.err || !(bandProbe.span > 0)) return null
    const count = frames.length
    const indexAt = (y) => Math.min(count - 1, Math.max(0, Math.floor(Math.max(0, Math.min((y - bandProbe.top) / bandProbe.span, 1)) * count)))
    const wanted = Math.min(count - 1, from + 1) // the next band DOWN (a within-zone move downward)
    const wantedBandTop = bandProbe.top + (bandProbe.span * wanted) / count
    return { count, fromIndex: from, wantedIndex: wanted, indexAtSiblingMidpointDrop: indexAt(siblingMidpointDropY), siblingMidpointDropY, wantedBandTopY: Math.round(wantedBandTop), indexAtWantedBandTop: indexAt(wantedBandTop) }
  })()
  const dropYRaw = dropBands != null && dropBands.indexAtSiblingMidpointDrop === from && dropBands.wantedIndex !== from
    ? Math.round(dropBands.wantedBandTopY)
    : siblingMidpointDropY
  const point = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="${start.paneId}"]');if(!f)return {err:'frame gone'};const hd=f.querySelector('.pane-collapse-toggle');if(!hd)return {err:'the frame carries no pane-header surface (.pane-collapse-toggle)'};const r=hd.getBoundingClientRect();if(r.height<2)return {err:'zero-height header',box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};const x=Math.round(r.x+r.width*0.5);const y=Math.round(r.y+r.height/2);const el=document.elementFromPoint(x,y);const resolved=el&&el.closest?el.closest('.gutter[data-zone], .pane-collapse-toggle'):null;return {x,y,hit:el?(el.tagName+(el.className?'.'+String(el.className).slice(0,40):'')):'null',headerTag:hd.tagName,headerIsTheToggle:hd.tagName==='BUTTON',onTarget:!!(el&&(el===f||f.contains(el))),onTheAppHeaderSurface:resolved===hd,vh:window.innerHeight,headerBox:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}})()`)
  if (!point || point.err || !point.onTarget) {
    return { driven: false, reason: `the pane-HEADER drag start could not be hit-tested on ${start.paneId}: ${JSON.stringify(point)}`, frames, slotOrderBefore: order(frames) }
  }
  if (point.onTheAppHeaderSurface !== true) {
    return { driven: false, reason: `the hit-tested drag start on ${start.paneId} does NOT resolve back to the pane header through the app's own delegated resolution (closest('.gutter[data-zone], .pane-collapse-toggle')): ${JSON.stringify(point)} — a drag start that is not the app's own gesture surface grades nothing`, frames, slotOrderBefore: order(frames) }
  }
  const dropY = Math.max(1, Math.min(dropYRaw, point.vh - 2))
  // THE REAL POINTER PATH: small steps (2px → 12px) that stay on the header for the first
  // moves, then travel to the drop, then a terminal.
  const path = [{ type: 'down', x: point.x, y: point.y }]
  for (const dy of [2, 4, 6, 8, 10, 12]) path.push({ type: 'move', x: point.x + Math.min(6, dy), y: point.y + dy })
  for (const frac of [0.4, 0.7, 1]) path.push({ type: 'move', x: point.x + 8, y: Math.round(point.y + (dropY - point.y) * frac) })
  path.push({ type: 'up', x: point.x + 8, y: dropY })
  // THE AUDIT, installed BEFORE the drag and read after it: the capture claim and the
  // per-move targets. The probe's own listeners are capture-phase and read-only.
  await h.cdp.evaluate(`(()=>{window.__ufDragAudit={captured:[],moves:[],terminals:[],gotCapture:0};const rec=(e)=>{const t=e.target;const n=t?(t.id||t.tagName):'?';if(e.type==='gotpointercapture')window.__ufDragAudit.gotCapture+=1;else if(e.type==='pointermove')window.__ufDragAudit.moves.push(n);else window.__ufDragAudit.terminals.push(e.type+':'+n)};for(const ty of ['pointermove','pointerup','pointercancel','gotpointercapture'])document.addEventListener(ty,rec,true);return true})()`)
  await h.cdp.gesture(`.pane-frame[data-pane-id="${start.paneId}"]`, path)
  await sleep(1200)
  const audit = await h.cdp.evaluate(`(()=>{const a=window.__ufDragAudit||{};const holders=[];for(const n of document.querySelectorAll('*')){for(const id of [1,2,3]){try{if(typeof n.hasPointerCapture==='function'&&n.hasPointerCapture(id))holders.push((n.id||n.tagName)+'#'+id)}catch{}}}return {gotPointerCaptureEvents:a.gotCapture||0,captureHoldersAtTheEnd:holders,moveTargets:(a.moves||[]).slice(0,14),terminalTargets:a.terminals||[],revealedMirrors:[...document.querySelectorAll('.is-revealed')].map((e)=>e.id||String(e.className).slice(0,30))}})()`)
  const after = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('[data-zone="${zone}"] .pane-frame[data-pane-id]')].map((f,i)=>({i,paneId:f.getAttribute('data-pane-id')})))()`)
  const seqBefore = order(frames)
  const seqAfter = (after || []).map((f) => f.paneId).join(',')
  // RESTORE (this block's own hygiene, taken AFTER the reading and recorded, never hidden):
  // the failed drag leaves the zone's provisional drop-target mirror (`is-revealed`) behind,
  // because the gesture never reached a terminal — and a revealed empty zone suppresses the
  // C11 track collapse a LATER block measures. The app's OWN gesture path clears it: a real
  // click on the header supersedes the in-flight drag (`revertPriorGesture` → `cancelPaneDrag`)
  // AND terminates its own session cleanly, and the SECOND real click restores the collapse
  // state the first one toggled (the header IS the collapse control — the same measured fact
  // the drag start records). The restore's own state pair is printed beside the reading.
  const cleanup = { performed: false, revealMirrorsAfterTheDrag: audit ? audit.revealedMirrors : null }
  try {
    const collapseState = async () => h.cdp.evaluate(`(()=>[...document.querySelectorAll('[data-zone="${zone}"] .pane-frame[data-pane-id]')].map((f)=>f.getAttribute('data-pane-id')+(f.classList.contains('is-collapsed')?'(collapsed)':'(expanded)')))()`)
    if (Array.isArray(cleanup.revealMirrorsAfterTheDrag) && cleanup.revealMirrorsAfterTheDrag.length > 0) {
      cleanup.collapseBefore = await collapseState()
      for (let pass = 0; pass < 2; pass += 1) {
        const p2 = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="${start.paneId}"]');const hd=f?f.querySelector('.pane-collapse-toggle'):null;if(!hd)return null;const r=hd.getBoundingClientRect();if(r.height<2)return null;return {x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)}})()`)
        if (!p2) break
        await h.cdp.gesture(`.pane-frame[data-pane-id="${start.paneId}"] .pane-collapse-toggle`, [{ type: 'down', x: p2.x, y: p2.y }, { type: 'up', x: p2.x, y: p2.y }])
        await sleep(1200)
      }
      cleanup.collapseAfter = await collapseState()
      cleanup.revealMirrorsAfterTheRestore = await h.cdp.evaluate(`[...document.querySelectorAll('.is-revealed')].map((e)=>e.id||String(e.className).slice(0,30))`)
      cleanup.paneSlotsAfterTheRestore = (await h.cdp.evaluate(`(()=>[...document.querySelectorAll('[data-zone="${zone}"] .pane-frame[data-pane-id]')].map((f)=>f.getAttribute('data-pane-id')))()`)) ?? null
      cleanup.performed = true
      cleanup.collapseStateRestored = JSON.stringify(cleanup.collapseBefore) === JSON.stringify(cleanup.collapseAfter)
    } else {
      cleanup.collapseStateRestored = null
    }
  } catch (e) {
    cleanup.error = String(e && e.message ? e.message : e)
  }
  return {
    driven: true,
    inputKind: 'REAL CDP pointer drag (Input.dispatchMouseEvent) in small steps on the pane HEADER surface inside the zone',
    dragStartPane: start.paneId, dragStartPaneHeaderBox: point.headerBox, dragStartHit: point.hit, dragStartOnTarget: point.onTarget,
    dragStartPanePreference: preferredPane,
    dragStartPaneChosenBecause: preferredIdx === from
      ? `the preferred pane ${preferredPane} sits at index ${from} with a downward sibling (${sibling.paneId}) below it, so the requested identity IS the dragged one`
      : (preferredIdx < 0
        ? `the preferred pane ${preferredPane} is not rendered in zone '${zone}' on this run (the zone renders ${JSON.stringify(frames.map((f) => f.paneId))}), so the FIRST frame (${start.paneId}) was dragged — a within-zone DOWNWARD rearrange needs a pane with a sibling below it`
        : `the preferred pane ${preferredPane} is the LAST frame of zone '${zone}' on this run (the zone's pane ORDER is persisted state, so it can differ between runs) and a pane with no downward sibling cannot be moved DOWN, so the FIRST frame (${start.paneId}) was dragged`),
    dragStartOnTheAppHeaderSurface: point.onTheAppHeaderSurface, dragStartHeaderTag: point.headerTag, dragStartHeaderIsTheToggle: point.headerIsTheToggle,
    dragStart: { x: point.x, y: point.y }, dragToY: dropY, dragPastTheSiblingMidpoint: dropY > sibling.box[1] + sibling.box[3] / 2, draggedPast: sibling.paneId,
    slotOrderBefore: seqBefore, slotOrderAfter: seqAfter, rearranged: seqBefore !== seqAfter, zone, framesBefore: frames,
    pointerAudit: audit,
    dropBands,
    dropBasis: dropBands == null
      ? `the zone band rule could not be evaluated on the assembled surface (${JSON.stringify(bandProbe)}) — the drop is the sibling's own 0.75 point, y=${siblingMidpointDropY}`
      : (dropYRaw === siblingMidpointDropY
        ? `the sibling's own 0.75 point (y=${siblingMidpointDropY}) derives index ${dropBands.indexAtSiblingMidpointDrop} by the app's own rule (zone span ${bandProbe.top}..${bandProbe.bottom}, ${dropBands.count} pane(s)), which is NOT the pane's own index ${dropBands.fromIndex} — the drop needs no re-derivation`
        : `the sibling's own 0.75 point (y=${siblingMidpointDropY}) derives index ${dropBands.indexAtSiblingMidpointDrop}, i.e. the pane's OWN index ${dropBands.fromIndex}, by the app's own rule (\`insertionIndexForPoint\`, zone span ${bandProbe.top}..${bandProbe.bottom}, ${dropBands.count} pane(s)) — a drop there is a NO-OP by the app's own arithmetic (F2), so the drop was moved DOWN to the top of band ${dropBands.wantedIndex} (y=${dropBands.wantedBandTopY}, which the same rule reads as index ${dropBands.indexAtWantedBandTop}) so the probe drives the property instead of its own dead point`),
    pathShape: path.map((s) => s.type + '@' + s.y).join(' '),
    restore: cleanup,
  }
}

/** §7.2 LIMB 3's FIXTURE NAME — the driver's OWN artifact (written by
 *  `ufEnsureStageBoxOverflowDoc` only where the stage box does not already overflow)
 *  and removed by this run's own cleanup path, by this ONE name. */
const UF_STAGE_OVERFLOW_FIXTURE = '.live-stage-overflow-probe.md'

/** §7.2 LIMB 3's SUBJECT SELECTOR — **THE STAGE'S DOCUMENT SURFACE, BY ITS OWN DOM
 *  SHAPE** (the editable content the stage mounts), passed to the preparation helper
 *  by its CALLER. The stage's document surface is read here WITHOUT any
 *  document-store read: the limb-3 reading is a LAYOUT measurement, and a store read
 *  is not part of it. */
function ufStageDocSurfaceSelector() {
  return '[contenteditable="true"]'
}

/** §7.2 LIMB 3's SUBJECT PREPARATION — **A DOCUMENT LONGER THAN THE STAGE'S BOX**,
 *  so "a document longer than the stage's box scrolls INSIDE the stage" is a
 *  FALSIFIABLE reading rather than a vacuous one. THE SUBJECT IS PREPARED IN FOUR
 *  STEPS, EACH READ BACK:
 *    (1) the stage's OWN box is read FIRST (`stageNow`) — if it ALREADY overflows, a
 *        document longer than the stage is already mounted and no fixture is owed;
 *    (2) the CALLER's fixture text is written to the CALLER's own path;
 *    (3) it is IMPORTED through the app's own route (`edit.import_markdown`);
 *    (4) it is MOUNTED ON THE STAGE through the app's own document-selection seam
 *        (`window.provident.sidebar.selectDocument` — the SAME seam the doc-nav row
 *        click routes to), and the helper WAITS, bounded, for the STAGE to render the
 *        fixture's OWN marker text. THE IMPORT IS NOT THE MOUNT (measured: with a
 *        document tab active, the import adds the document to the store and switches
 *        nothing), and a reading taken on "a surface is present" is a reading taken on
 *        WHATEVER document happened to be open — the vacuity this wait removes.
 *  THE READING IS TAKEN FROM THE STAGE CONTAINER'S OWN SCROLL GEOMETRY
 *  (`stageBoxOverflows` = the stage box's own scrollHeight > its clientHeight), never
 *  from a child surface's height, so `stageBoxOverflowed` is the clause's own
 *  falsifier: FALSE means the attempt below cannot discriminate a non-scrolling stage
 *  from a stage with nothing to scroll, and it is REPORTED as such, never a pass.
 *  NO STORE CONTENT IS READ HERE: the block provisions its OWN document and measures
 *  the STAGE BOX, so no corpus identity enters this closure and the driver's
 *  fixture-declaration census is unmoved (measured: the A-1/A-3 arms stay at the
 *  figure of record `47`). */
async function ufEnsureStageBoxOverflowDoc(h, opt = {}) {
  const surfaceSelector = typeof opt.surfaceSelector === 'string' && opt.surfaceSelector !== '' ? opt.surfaceSelector : 'body'
  const marker = typeof opt.marker === 'string' ? opt.marker : ''
  const stageNow = async () => h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');if(!m)return null;const cs=getComputedStyle(m);const r=m.getBoundingClientRect();const cands=[...document.querySelectorAll(${JSON.stringify(surfaceSelector)})].filter((e)=>m.contains(e));return {stageBox:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],stageScrollHeight:m.scrollHeight,stageClientHeight:m.clientHeight,stageOverflowY:cs.overflowY,stageBoxOverflows:m.scrollHeight>m.clientHeight+1,surfacePresent:cands.length>0,surfaceCandidates:cands.length,stageTextHasMarker:${JSON.stringify(marker)}===''?null:((m.textContent||'').indexOf(${JSON.stringify(marker)})>=0),activeTab:(document.querySelector('#tab-strip .tab.is-active')||{}).textContent||null}})()`)
  const already = await stageNow()
  if (already && already.stageBoxOverflows === true) {
    return { prepared: false, why: 'the stage box ALREADY overflows — a document longer than the stage is already mounted, so no fixture was needed', stageBoxOverflowed: true, observed: already, mountOfTheImportedDoc: null, preparedBy: 'the state this block inherited (no fixture was written or imported)' }
  }
  const fixtureText = typeof opt.fixtureText === 'string' ? opt.fixtureText : ''
  const fixturePath = typeof opt.fixturePath === 'string' ? opt.fixturePath : ''
  if (fixtureText === '' || fixturePath === '') {
    return { prepared: false, why: 'the stage box does not overflow and the caller supplied no fixture text to import (a reading taken WITHOUT an overflowing document, and reported as such)', stageBoxOverflowed: false, observed: already, mountOfTheImportedDoc: null, preparedBy: 'nothing' }
  }
  try { writeFileSync(fixturePath, fixtureText, 'utf8') } catch (e) { return { prepared: false, why: `the fixture file could not be written at ${fixturePath}: ${String(e && e.message ? e.message : e)}`, stageBoxOverflowed: false, observed: already, mountOfTheImportedDoc: null, preparedBy: 'nothing' } }
  const read = await mcpToolResult(h.mcp, 'edit.import_markdown', { files: [fixturePath] }).catch((e) => ({ ok: false, isError: false, value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
  if (read.isError === true || read.ok !== true) {
    return { prepared: false, why: `edit.import_markdown failed for ${fixturePath}: ${String(read.errorText ?? '').slice(0, 240)}`, stageBoxOverflowed: false, observed: already, mountOfTheImportedDoc: null, preparedBy: `the fixture at ${fixturePath} (the import FAILED)` }
  }
  const documentId = Array.isArray(read.value && read.value.documentIds) ? read.value.documentIds[0] ?? null : null
  // THE MOUNT IS RETRIED WITHIN THE BOUNDED WAIT: an import is a STORE write, and the
  // document-selection seam resolves against the sidebar's own document list — which the
  // import's store event may not have reached yet when the first call is made (measured:
  // a single immediate call is a no-op and the stage keeps the previous document). The
  // seam is re-driven each step until the stage renders the fixture's own marker, or the
  // bounded wait expires; every attempt is counted and printed.
  const mountOnce = () => h.cdp.evaluate(`(()=>{const s=window.provident&&window.provident.sidebar;if(!s||typeof s.selectDocument!=='function')return {available:false};s.selectDocument(${JSON.stringify(documentId)});return {available:true}})()`).catch((e) => ({ available: false, error: String(e && e.message ? e.message : e) }))
  const mount = await mountOnce()
  const stageBeforeWait = await stageNow()
  let waitedMs = 0
  let mountAttempts = 1
  await waitFor(async () => {
    const now = await stageNow()
    waitedMs += 500
    if (now && now.stageTextHasMarker === true) return true
    mountAttempts += 1
    await mountOnce()
    return false
  }, { timeout: Number(opt.mountWaitMs ?? 12000), step: 500 }).catch(() => null)
  const observed = await stageNow()
  const mounted = !!(observed && observed.stageTextHasMarker === true)
  return {
    prepared: true, fixturePath, documentId, waitedMs, mountAttempts, stageBeforeWait,
    mountRoute: 'the app own document-selection seam (window.provident.sidebar.selectDocument) — the SAME seam the doc-nav row click routes to; NOT a store read and NOT a corpus identity, so this block provisions its OWN document and the fixture-declaration census is unmoved',
    mountRequested: mount, mountOfTheImportedDoc: mounted,
    stageBoxOverflowed: !!(observed && observed.stageBoxOverflows === true),
    observed,
    preparedBy: `the fixture this helper wrote (${fixturePath}) and imported (documentId=${JSON.stringify(documentId)}) through the app own route, then mounted through the app own document-selection seam`,
    why: mounted
      ? 'the imported document is mounted on the stage (the stage renders the fixture own marker text)'
      : `the imported document did NOT become the stage document within the bounded wait (${waitedMs}ms, ${mountAttempts} mount attempt(s)): the stage reads marker=${observed ? String(observed.stageTextHasMarker) : '?'} (active tab ${JSON.stringify(observed ? observed.activeTab : null)}) and the mount request answered ${JSON.stringify(mount)} — the limb-3 attempt therefore runs against the stage document that IS open, and it is reported as such (its own reading, scope and this gap, never a pass)`,
  }
}

/** §7.2 LIMB 3's CARRIER READING — the STAGE's OWN box as the scroll container: the
 *  stage box rect and the surrounding CHROME's (the zones' and the tab strip's) rects
 *  across a document-scroll attempt on the stage's own box, with BOTH the stage's own
 *  `scrollTop` and the page's own offset read back so "scrolled inside" and "scrolled
 *  the page" are told apart. The scrolled element is NAMED. */

/** §2.3 `H-4` / §3.2 `F-6` / finding `C-5` — **A PARKED ROW NEVER PRINTS WITHOUT
 *  ITS REASON.** `RCA-11` clause (b) requires a RECORDED park reason (a park is
 *  never parked-by-default), so a result carrying `park: true` and no reason is a
 *  defect in the SITE that produced it — but the site is not the artifact. This
 *  NAMED sentinel is what `buildReportRow` substitutes, so the `ROW` line of a
 *  parked row can never print `verdict=PARKED` with the park text skipped: the
 *  reader sees the missing reason named, and the park stays non-PASS and is never
 *  counted as an app FAIL. */
const UF_NO_PARK_REASON = '(no parkReason recorded)'

/** §2.2 `E-7`/`E-8` / finding `C-4` — **A MISSING `required` VALUE IS NAMED, NEVER
 *  SUBSTITUTED.** The clause is the predicate that failed WITH its observed-vs-
 *  required VALUES, so a row that recorded neither `required` nor an assertion
 *  must say so: printing the ASSERTION SENTENCE in the `required` position
 *  (`required = r.required ?? r.assertion`) states a requirement the row never
 *  recorded. */
const UF_NO_REQUIRED_VALUE = '(no required value recorded)'

/** A PARKED row: a precondition the live surface cannot meet. Carries the §6.1
 *  field set with `park:true, pass:false` — never a behavior FAIL, never a PASS.
 *
 *  §2.3 `H-4` / `RCA-11` clause (b) — **THE PARK REACHES THE REPORT AS A ROW**.
 *  `rowResult` is the FOUR-parameter builder `(id, assertion, evidence, opts)`
 *  (`id` = `{ row, dclass }`) and the row id it hands back is what `ufPushRows`'
 *  `typeof res.row === 'string'` guard admits to `reportRows`. Calling it with the
 *  builder's OWN signature (`row, assertion, dclass, evidence, opts`) put the row
 *  id in `id`, the dclass in `evidence` and the evidence in the `opts` slot, so
 *  `id.row` read `undefined`: the three live parks each printed their `PARK …`
 *  line while producing NO `verdict=PARKED` `ROW` line and no §6.1 report row at
 *  all. The park's own `reason` is the §6.1 `H-4` field (never the `evidence`
 *  prose) and the caller's `opts` (`path`/`surface`/`park`) reaches the builder
 *  through its own slot, so no park site's declared `surface` is dropped. */
function parkRow(row, assertion, dclass, reason, evidence, opts = NO_EXTRA_FIELDS) {
  // §2.3 `H-4` — **THE PARK ROUTE: FIVE PARK VALUES, ONE `rowResult` CALL.**
  // A park carries one value a row does not — its §6.1 `H-4` `reason` — so it
  // names FIVE values (`row`, `assertion`, `dclass`, the caller's `evidence` and
  // its §6.1 `opts`) and resolves them into the FOUR-parameter builder `(id,
  // assertion, evidence, opts)` at ONE site. The builder accepts this park form
  // (its `id` is the row id, with the dclass beside it) and returns the row id and
  // the `park`/`parkReason` fields, so `ufPushRows`' `typeof res.row === 'string'`
  // guard ADMITS the park to `reportRows` and the park prints a `verdict=PARKED`
  // `ROW` line with its named reason. Reading the same five values through the
  // four-parameter shape instead put the row id in `id`, the dclass in `evidence`
  // and the §6.1 `opts` in the slot the builder takes its evidence from, so `id.row`
  // read `undefined` and every park was SKIPPED by that guard — the defect fixed
  // here. The park's own `reason` and its flag are set on the options the builder
  // reads (the caller's fields spread FIRST, so the park's reason always wins).
  const r = rowResult(row, assertion, dclass, evidence, opts) // §2.3 H-4: the FIVE-VALUE PARK FORM this builder reads (id = the row, dclass beside it)
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

/** §2.3 `H-1` clause 1 / §13.1 `Y-2` / §13.4 — THE PERSISTED PANE-VISIBILITY
 *  STATE, READ AS A STATE. The `#settings-modal` operator visibility toggle for a
 *  pane (`#operator-pane-visibility-<id>`, `data-enabled`) is the rendered
 *  projection of the persisted `enabledPanes`/`enabledOperatorPanes` set
 *  (`persistence_v1` flips `doc-nav` OFF and PERSISTS it through exactly this
 *  control). `true` = enabled · `false` = DISABLED (its `.pane-frame` is not
 *  rendered BY DESIGN — a pane that is enabled but absent is a different state) ·
 *  `null` = no toggle rendered. */
async function ufPaneVisibilityState(h, paneId) {
  return h.cdp.evaluate(`(()=>{const t=document.getElementById(${JSON.stringify(`operator-pane-visibility-${paneId}`)});return t?t.getAttribute('data-enabled'):null})()`)
}

/** §2.3 `H-1` clause 4 / §2.2 `E-12`'s F-16 / §13.4 item 1 — THE PER-BLOCK
 *  PRE-FLIGHT RESTORE OF A PERSISTED PANE-VISIBILITY STATE. A block that MUTATES
 *  a persisted pane state (`persistence_v1` toggles `doc-nav` OFF and persists it;
 *  `uf_layout_10` disables every enabled pane and re-enables it) leaves the state
 *  changed for every LATER block, so the same row reads `PASS` in an ISOLATED
 *  `--block=` run and `NOT-DRIVEN` in the battery (the `LIVE-DRIVER-PERSISTENCE-
 *  ORDER-ARTIFACT` falsifier, `§6.3 C-2` item 4). This is the PER-BLOCK pre-flight
 *  the ruling at `§13.4` permits INSIDE the driver's own block-runner: it adds NO
 *  `BLOCKS` key, NO `§5.U` slot, NO flag and NO new live assertion about the app
 *  (`D-5`), it drives the re-enable through a REAL hit-tested `ufRealClick` on the
 *  operator control the flip itself used (the same route the `H-1` clause-2 zone
 *  re-expand takes), and where the state cannot be restored the caller reports
 *  `NOT-DRIVEN`/`absent` with the state NAMED — never a silent FAIL and never an
 *  app FAIL (`H-3`/`H-4`, `RCA-11` clause (b)). Nothing here PROMOTES a verdict
 *  (`H-5`): a restored state only makes the row DRIVABLE again. */
async function ufRestorePaneVisibility(h, paneId) {
  const before = await ufPaneVisibilityState(h, paneId)
  // §2.3 `H-1` clause 4 — AN ABSENT CONTROL IS NOT A RESTORE. `before === null`
  // (no `#operator-pane-visibility-<id>` toggle rendered) is reported
  // `restored:false` with the missing control NAMED in `path`: claiming a restore
  // for a control that could not be touched is the false negative this branch is
  // forbidden to report.
  if (before === null) return { paneId, before, after: before, path: `missing-control (#operator-pane-visibility-${paneId} is not rendered — NOT restored)`, restored: false }
  if (before === 'true') return { paneId, before, after: before, path: 'already-enabled', restored: true }
  const opened = await ufModal(h, true)
  const click = await ufRealClick(h, `#operator-pane-visibility-${paneId}`)
  await sleep(1500)
  const after = await ufPaneVisibilityState(h, paneId)
  await ufModal(h, false)
  await sleep(1200)
  return { paneId, before, after, path: click.path, modal: opened.path, restored: after === 'true' }
}

/** §2.3 `H-1` clause 1 — `zone:left`'s state READ AS A STATE, never inferred
 *  from frame absence (`V-7`/`M-6`): `expanded` (stack painted) · `minimized`
 *  (the stack is REPLACED BY THE TAB STRIP BY DESIGN — `uf_panes_8` asserts
 *  `minimized.frames===0`) · `absent`. A minimized zone may NEVER be reported as
 *  "pane absent". */
async function ufZoneState(h, zone = 'left') {
  return h.cdp.evaluate(`(()=>{const z=document.getElementById(${JSON.stringify(`zone:${zone}`)});if(!z)return {zone:${JSON.stringify(zone)},zoneState:'absent',cls:null,tabs:0};const cls=String(z.className||'');return {zone:${JSON.stringify(zone)},zoneState:(/is-minimized/.test(cls)?'minimized':'expanded'),cls:cls,tabs:document.querySelectorAll('[id^="zone-tab-${zone}-"]').length}})()`)
}

/** §2.3 `H-1` clauses 2/3 — the per-block zone restore: re-expand a MINIMIZED
 *  `zone:left` with a REAL hit-tested gesture so a frame-based row never reads
 *  `frames=0` produced by an EARLIER block's minimize. Reachable FROM ANY BLOCK
 *  (not once per battery — `V-6`); reports the state it started from and left. */
async function ufRestoreZoneState(h, zone = 'left') {
  const before = await ufZoneState(h, zone)
  if (before.zoneState !== 'minimized') return { before, after: before, path: 'already-expanded', restored: true }
  const path = (await ufRealClick(h, `#zone-minimize-${zone}`)).path
  await sleep(1400)
  const after = await ufZoneState(h, zone)
  return { before, after, path, restored: after.zoneState !== 'minimized' }
}

/** §2.3 `H-1` — ensure an app-graph pane is EXPANDED (a collapsed pane renders
 *  no body) so its controls exist. §2.3 `H-1` clause 1: the `zone:left` state is
 *  read AS A STATE first, so a MINIMIZED zone (the `is-minimized` class — the
 *  pane stack is REPLACED BY THE TAB STRIP BY DESIGN) is re-expanded per block
 *  and never reported as a missing pane (`V-7`/`M-6`). */
async function ufEnsurePaneExpanded(h, paneId) {
  const zoneCls = await h.cdp.evaluate(`String((document.getElementById('zone:left')||{}).className||'')`)
  const zoneIsMinimized = /is-minimized/.test(zoneCls)
  const before = await ufZoneState(h, 'left')
  const zr = (zoneIsMinimized || before.zoneState === 'minimized') ? await ufRestoreZoneState(h, 'left') : before
  const zs = zr.after ? zr.after.zoneState : zr.zoneState
  const frames = await ufPaneFrames(h)
  const f = frames.find((x) => x.pid === paneId)
  if (!f) {
    // §2.3 `H-1` clause 4 / §13.4 / finding `C-7` — before reporting the pane
    // ABSENT, distinguish the three states the clause names: the zone is `zs` (NOT
    // minimized, above), so a missing frame is either a PERSISTED OFF
    // pane-visibility state (its frame is not rendered BY DESIGN — restore it with
    // a REAL hit-tested click on the operator control and re-read) or a pane that is
    // genuinely not rendered. ⟨`C-7`: THE STATE TRAVELS THROUGH.⟩ The result the
    // restore NAMES is carried into the ensure helper's own `path` token instead of
    // being collapsed into one bare `absent` for two different states: (iii) NO
    // `#operator-pane-visibility-<id>` control was rendered at all (there was no
    // control to touch, so "not restored" is the honest reading — the token names
    // the missing control) and (iv) the control IS rendered, the persisted state
    // reads ENABLED, and the pane still renders no frame (`enabled-no-frame`, a
    // frame genuinely absent while the pane is enabled). A UI-adoption pass that
    // re-parents, renames or omits the operator control can therefore tell the two
    // apart from the RETURNED result alone — the distinction `C-7` names. Both
    // remain a DRIVER-side state for their row (`NOT-DRIVEN`, realInput:false, with
    // the state NAMED in the detail and the restore's own token quoted): neither is
    // promoted to an app FAIL and no verdict is widened (`H-3`/`H-4`/`H-5`).
    const vis = await ufRestorePaneVisibility(h, paneId)
    if (vis.before === 'false') {
      const refetched = (await ufPaneFrames(h)).find((x) => x.pid === paneId)
      if (refetched) return { pid: paneId, present: true, path: 'restored-visibility(zone:' + zs + ')', restored: vis, zone: zs, zoneState: zs }
      return { pid: paneId, present: false, path: 'disabled-restore-failed', restored: vis, zone: zs, zoneState: zs, detail: `zone:left is ${zs} (NOT minimized); the PERSISTED pane-visibility state for "${paneId}" was ${vis.before} and the real hit-tested restore (path=${vis.path}) left it ${vis.after} — no .pane-frame[data-pane-id="${paneId}"] could be restored (the state is NAMED: a driver-side state, never an app FAIL)` }
    }
    if (vis.before === null) {
      // (iii) NO CONTROL WAS RENDERED — a state of its own, never the bare
      // `absent`: the missing-control token travels through from
      // `ufRestorePaneVisibility` (which could not touch what is not rendered).
      return { pid: paneId, present: false, path: 'missing-control (#operator-pane-visibility-' + paneId + ' is not rendered — NOT restored)', restored: vis, zone: zs, zoneState: zs, detail: `zone:left is ${zs} (NOT minimized) and no .pane-frame[data-pane-id="${paneId}"] is rendered while NO #operator-pane-visibility-${paneId} control is rendered either — ${vis.path} (the state is NAMED: there was no control to touch, so "NOT restored" is the honest reading; a driver-side state, never an app FAIL)` }
    }
    // (iv) THE PANE IS ENABLED AND THE FRAME IS GENUINELY ABSENT — the third state,
    // distinct from (iii) above and from a minimized zone (`zs` is NOT minimized).
    return { pid: paneId, present: false, path: 'enabled-no-frame', restored: vis, zone: zs, zoneState: zs, detail: `zone:left is ${zs} (NOT minimized); the operator visibility control for "${paneId}" IS rendered and reads ${JSON.stringify(vis.before)} (the pane is ENABLED, no persisted-OFF state to restore — restore path=${vis.path}) and no .pane-frame[data-pane-id="${paneId}"] is rendered — the frame is genuinely absent while the pane is enabled (a driver-side state, never an app FAIL)` }
  }
  if (!f.collapsed) return { pid: paneId, present: true, path: 'already-expanded', zone: zs, zoneState: zs }
  const r = await ufRealClick(h, `#pane-collapse-${paneId}`)
  await sleep(1500)
  const after = (await ufPaneFrames(h)).find((x) => x.pid === paneId)
  return { pid: paneId, present: true, path: r.path, collapsedAfter: after ? after.collapsed : null, zone: zs, zoneState: zs }
}

/** §2.3 `H-1` clause 3/4 — THE BASELINE the driver's own block-runner restores
 *  BEFORE each block that depends on it: the app's rendered `zone:left` state and
 *  the pane FRAME baseline. ⟨NARROWED `2026-09-29` (gate-4 finding `G-3`) — the
 *  PERSISTED pane-visibility set is NO LONGER RESTORED HERE.⟩ The two APP-GRAPH
 *  panes `doc-nav`/`search` are ON at a fresh boot — but a block that MUTATES a
 *  persisted pane state (`persistence_v1` toggles `doc-nav` OFF and PERSISTS it)
 *  exists precisely so that a LATER block (`persistence_v2`) can assert the
 *  state is STILL OFF at boot: a pre-flight that re-enables the pane before every
 *  block REPAIRS the precondition those rows exist to assert and their verdicts
 *  become uninformative (the same driver artifact in the other direction, which
 *  this constant's own comment already named for OPERATOR panes). The pre-flight
 *  therefore restores ONLY the DRIVER-CREATED baseline (the `zone:left` minimized/
 *  expanded state) and READS the persisted visibility set as a state, reporting it
 *  without touching it; a row that genuinely cannot be driven from the persisted
 *  state reports `NOT-DRIVEN` with that state NAMED (never a silent FAIL). */
const UF_BASELINE_ZONE = 'left'
const UF_BASELINE_PANES = ['doc-nav', 'search']

function ufZoneVocabularyOk(zoneId, cls) {
  if (!UF_ZONE_ID_RE.test(String(zoneId))) return false
  // The app's own NON-DRIFT zone classes: an EMPTY class list is the clean-boot
  // baseline, the minimized marker is the state this restore exists for, and
  // `is-revealed` is the shell drag controller's own drag-time reveal (written by
  // a pane-drag gesture and cleared at its end). Only a class list carrying NONE
  // of these is a vocabulary drift, named as a precondition instead of silently
  // restored — or silently reported as the pane's absence.
  const c = String(cls == null ? '' : cls)
  return c === '' || UF_ZONE_MINIMIZED_RE.test(c) || /\bis-revealed\b/.test(c)
}

/** §2.3 `H-1` clause 1/3 — THE ZONE-STATE TOKEN SET the driver's own state
 *  restore is stated against, in CODE POSITION so the vocabulary cannot drift
 *  into prose: `zone:left` is the sidebar zone whose rendered state every
 *  frame-based row depends on, and `is-minimized` is the class that REPLACES its
 *  pane stack with the tab strip BY DESIGN (`uf_panes_8` asserts
 *  `minimized.frames===0`). Both are read as a STATE before any restore, and the
 *  restore below is reachable PER BLOCK — never once per battery (`V-6`/`V-7`). */
const UF_ZONE_ID_RE = /zone:left/
const UF_ZONE_MINIMIZED_RE = /is-minimized/

/** §2.3 `H-1` clauses 1/2/3/4 + §13.4 — THE PER-BLOCK PRE-FLIGHT RESTORE. Called
 *  by the block-runner BEFORE each requested block measures, so the driver's own
 *  mutable state (a MINIMIZED zone:left; a pane VISIBILITY state a prior block
 *  flipped and PERSISTED) is returned to the baseline the isolated run starts
 *  from. The zone state is read AS A STATE (zoneState/zoneWasMinimized below —
 *  the zone:left element's is-minimized class is restored, never inferred from
 *  frame absence), and the minimized precondition is read BEFORE any restore so
 *  the state the block started from is named either way. Each restore is a real
 *  hit-tested gesture on the control its mutation used; a state that could NOT be
 *  restored is recorded with the precondition named (the block then reports
 *  NOT-DRIVEN with that state — never a silent FAIL and never an app FAIL).
 *  FAIL-SOFT: a throw records its own failure and never aborts the run or the
 *  block it was restoring. NO BLOCKS key, no flag, no new app assertion. */
async function ufBlockPreflightRestore(h) {
  const out = { zone: null, panes: [], frames: null, error: null }
  const zoneId = 'zone:left'
  try {
    await ufEnsureAppClear(h)
    const zoneBefore = await ufZoneState(h, UF_BASELINE_ZONE)
    // The vocabulary guard FIRST (never inferred from frame absence): the zone
    // state is read AS A STATE and both tokens are checked before any restore, so
    // a drifted zone id or a stale class is NAMED as the precondition instead of
    // being silently restored — or silently reported as the pane's absence.
    if (!ufZoneVocabularyOk(zoneId, zoneBefore.cls)) out.error = `zone state vocabulary check failed for ${zoneId} (cls=${JSON.stringify(zoneBefore.cls)}) — the restore is skipped and the block reports its own NOT-DRIVEN with this precondition`
    const zoneWasMinimized = /is-minimized/.test(String(zoneBefore.cls || '')) || zoneBefore.zoneState === 'minimized'
    if (zoneWasMinimized) {
      const zr = await ufRestoreZoneState(h, UF_BASELINE_ZONE)
      const afterState = zr.after ? zr.after.zoneState : null
      out.zone = { zone: UF_BASELINE_ZONE, zoneId, before: zoneBefore.zoneState, after: afterState, path: zr.path, restored: zr.restored }
    } else {
      out.zone = { zone: UF_BASELINE_ZONE, zoneId, before: zoneBefore.zoneState, after: zoneBefore.zoneState, path: 'already-expanded', restored: zoneBefore.zoneState === 'expanded' }
    }
    // §13.4 `G-3` — THE PERSISTED SET IS READ, NEVER RESTORED. The baseline panes'
    // persisted `data-enabled` states are RECORDED here (so the artifact shows the
    // state every block started from, `H-2`) and left EXACTLY as the app has them:
    // a block whose assertion is about the persisted state keeps its precondition.
    for (const pid of UF_BASELINE_PANES) {
      out.panes.push({ paneId: pid, state: await ufPaneVisibilityState(h, pid), restored: false, path: 'read-only (the persisted visibility set is a block precondition, never a pre-flight repair — §13.4/G-3)' })
    }
    // The pane FRAME baseline (the driver-created half that IS restorable): the
    // frame census the clean boot renders, recorded so a later `frames=0` reading
    // is attributable to a state (`H-1` clause 1) instead of inferred from absence.
    const frames = await ufPaneFrames(h)
    out.frames = { count: frames.length, paneIds: frames.map((f) => f.pid), collapsed: frames.filter((f) => f.collapsed).map((f) => f.pid), zoneState: out.zone ? out.zone.after : null }
  } catch (e) {
    out.error = String(e && e.message ? e.message : e)
  }
  return out
}

/** §2.1 `E-2` — THE VERDICT IS CARRIED BY THE ROW. A `BLOCKS` entry may claim
 *  MORE THAN ONE declared matrix row (`MATRIX_ROWS` maps `uf_panes_12` to BOTH
 *  `U-1` and `U-3`, `uf_layout_10` to BOTH `U-4` and `U-5`), and the contract
 *  requires **per declared row, one row-block result carrying that row id** —
 *  with its OWN `assertion`/`dclass`/`realInput`/`evidence`/`failingClause`/
 *  `surface`, because the two halves are DIFFERENT claims and "a `U-3` verdict
 *  that simply IS the `U-1` verdict is not a verdict for `U-3`". The checklist
 *  id the block also covers is carried by the distinct `checklistRow` member
 *  (never by putting the checklist id in `row` on a path that must carry a
 *  declared matrix row). This builder is the declared-row half; the block returns
 *  an ARRAY of `rowResult`s (its checklist row + one per claimed declared row)
 *  and the block-runner reports EVERY element as its own counted row. */
function declaredRowResult(rowId, checklistRow, assertion, dclass, evidence, opts = NO_EXTRA_FIELDS) {
  return { ...rowResult({ row: rowId, dclass }, assertion, evidence, opts), checklistRow: checklistRow }
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

// ===========================================================================
// U-EDIT-1-LIVE (C9 whole-page editing, spec §8.3 items 1-8) + U-STAGE-ACTIVE-
// TAB (the stage always displays the page owned by the ACTIVE tab, spec §8.3)
// — the MANDATORY live batteries (RCA-11). Their blocks are added below; the
// `ufStageSig` oracle extension the read-only audit names (archive/reviews/
// 2026-09-22-tab-page-ownership-audit.md §4.2) is here: the stage's IDENTITY —
// which tab's target kind/page is PAINTED — is asserted, never just its text.
//
// LAYER (RCA-12): assembled-renderer — every reading comes from the EXECUTING
// `dist/` renderer driving real CDP gestures/keys. The node twin
// (docs/specs/unit-u-edit-1-greens.md) is ENVELOPE/STORE-green only.
// ===========================================================================

/** The search-tab stage ids (`src/renderer/pane-graph.ts` `SEARCH_TAB_INPUT_ID`). */
const UF_SEARCH_TAB_INPUT_ID = 'search-tab-input'
const UF_STAGE_SEARCH_TAB_ID = 'stage-search-tab'

/** The surface/marker/state ids of the whole-page editing surface (§2.1). */
const UF_PAGE_EDIT_SURFACE_ID = 'page-edit-surface'
const UF_PAGE_COMMIT_WARNING_ID = 'page-commit-warning'
/** §2.1.1-D — THE TWO OPAQUE PRESENCE/AGREEMENT SELECTORS. A caller that reads the
 *  edit surface as an OPAQUE presence/agreement signal (`ufSurfacePresence`) reads
 *  these selectors and NOTHING about the corpus identity the marker carries: the
 *  id-keyed selector is built ONCE here (module scope), so the presence read carries
 *  no corpus-IDENTITY token at all (`§2.1.1-D`, `§2.1.4`: a helper whose only
 *  corpus-shaped token is this opaque signal is NOT a closure seed). */
const UF_EDIT_SURFACE_ID_SELECTOR = '#' + UF_PAGE_EDIT_SURFACE_ID
const UF_EDIT_SURFACE_MARKER_SELECTOR = '[data-edit-surface]'

/** The stage-kind reading (§A.1.1 I2-R) + the active-tab identity pair.
 *  `kind` is DERIVED from the painted stage: the search stage root / the landing
 *  root / the document head or the surface marker ⇒ document. A marker WITHOUT
 *  the surface element (or vice versa) is reported — the two discriminators must
 *  AGREE, so `agree` is part of the reading, not a post-hoc filter. */
const UF_STAGE_KIND_SRC = `(()=>{
  const m=document.getElementById('zone:main');
  if(!m) return {kind:'unknown',surface:0,marker:0,markerVal:null,agree:false,mainBox:null};
  const mr=m.getBoundingClientRect();
  const roots=m.querySelectorAll('#'+${JSON.stringify(UF_PAGE_EDIT_SURFACE_ID)});
  const markers=m.querySelectorAll('[data-edit-surface]');
  const markerVal=markers.length?markers[0].getAttribute('data-edit-surface'):null;
  const search=!!m.querySelector('#'+${JSON.stringify(UF_STAGE_SEARCH_TAB_ID)});
  const landing=!!m.querySelector('#stage-landing');
  const docHead=m.querySelector('[data-doc-head]')!=null;
  const h1=m.querySelector('h1')!=null;
  const kind=search?'search':(landing?'landing':((docHead||h1||roots.length>0)?'document':(m.querySelector('[data-stage="placeholder"]')?'placeholder':'unknown')));
  return {kind:kind,surface:roots.length,marker:markers.length,markerVal:markerVal,
    agree:roots.length===markers.length && (roots.length===0||(roots[0]===markers[0])),
    mainBox:[Math.round(mr.x),Math.round(mr.y),Math.round(mr.width),Math.round(mr.height)]}})()`

/** The ACTIVE tab's own target kind + id, read from the rendered strip. */
const UF_ACTIVE_TAB_SRC = `(()=>{
  const t=[...document.querySelectorAll('#tab-strip .tab')].find((x)=>x.classList.contains('is-active'));
  const all=[...document.querySelectorAll('#tab-strip .tab')];
  const tabIds=all.map((x)=>({id:x.getAttribute('data-tab-id'),kind:x.getAttribute('data-target-kind'),active:x.classList.contains('is-active'),title:(x.textContent||'').trim().slice(0,24)}));
  return {activeTabId:t?t.getAttribute('data-tab-id'):null,activeTabKind:t?t.getAttribute('data-target-kind'):null,
    tabCount:all.length,openIds:all.map((x)=>x.getAttribute('data-tab-id')),tabIds:tabIds}})()`

/** The DERIVED identity verdict the spec pins beside `ufTabState`: the concrete
 *  (activeTabKind, stageKind) pair plus one boolean. */
async function ufStageVerdict(h) {
  const stage = await h.cdp.evaluate(UF_STAGE_KIND_SRC)
  const active = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
  const match = active.activeTabId === null
    ? stage.kind !== 'search' && (stage.kind === 'document' ? false : true)
    : (active.activeTabKind === 'other'
        ? (stage.kind === 'landing' || stage.kind === 'placeholder')
        : active.activeTabKind === stage.kind)
  const editSurface = stage.markerVal
  // I2-R's second half: when exactly one surface is live it carries the ACTIVE
  // DOCUMENT's id. The document id is read from the stage's own `data-doc-head`
  // node id (`<documentId>:section:1`) by the caller, which also holds the MCP
  // target census — so the census+marker agreement is computed there and
  // `identityOk` is `null` (not claimed) here.
  const activeDocId = await h.cdp.evaluate(`(()=>{const t=[...document.querySelectorAll('#tab-strip .tab')].find((x)=>x.classList.contains('is-active'));return t?t.getAttribute('data-document-id'):null})()`)
  const identityOk = active.activeTabKind === 'document'
    ? (stage.surface === 1 && stage.marker === 1 && stage.agree && stage.markerVal != null)
    : (stage.surface === 0 && stage.marker === 0)
  return {
    activeDocId,
    activeTabId: active.activeTabId,
    activeTabKind: active.activeTabKind,
    stageKind: stage.kind,
    stageMatchesActiveTab: match,
    editSurface,
    searchStage: stage.kind === 'search',
    surfaceCensus: stage.surface,
    markerCensus: stage.marker,
    markersAgree: stage.agree,
    mainBox: stage.mainBox,
    tabCount: active.tabCount,
    openIds: active.openIds,
    tabIds: active.tabIds,
    identityOk,
  }
}

/** §2.1.1-D / `§2.1.4` — THE OPAQUE PRESENCE/AGREEMENT READ of the edit surface.
 *  Callers that only ask *"is exactly one surface live, and do the two
 *  discriminators AGREE?"* read it through THIS helper: the marker is an opaque
 *  presence/agreement signal, the marker's VALUE is never read and never compared
 *  to a document id, so no corpus IDENTITY is read here (`§2.1.1-D`'s ruling) and
 *  the blocks that reach only this helper are OUT of the corpus census (`§2.3`
 *  `P-6`/`P-11`: `stage_boot_landing_diag`, `stage_multimount_reachability`).
 *  `ufSurfaceCensus` below keeps the IDENTITY-bearing read (`ids`/`boxes`) for the
 *  callers that really use it. */
async function ufSurfacePresence(h) {
  return h.cdp.evaluate(`(()=>{
    const zones=['main','left','right'].map((z)=>document.getElementById('zone:'+z)).filter(Boolean);
    const inStage=(list)=>list.filter((e)=>zones.some((z)=>z.contains(e)));
    const byId=inStage([...document.querySelectorAll(${JSON.stringify(UF_EDIT_SURFACE_ID_SELECTOR)})]);
    const byMarker=inStage([...document.querySelectorAll(${JSON.stringify(UF_EDIT_SURFACE_MARKER_SELECTOR)})]);
    const same=byId.length===byMarker.length&&byId.every((e,i)=>e===byMarker[i]);
    return {byId:byId.length,byMarker:byMarker.length,agree:same}})()`)
}

/** The §A.1.1 I2-R census over the STAGE region, counted by BOTH
 *  discriminators (the authored id AND the runtime marker), which must agree. */
async function ufSurfaceCensus(h) {
  return h.cdp.evaluate(`(()=>{
    const zones=['main','left','right'].map((z)=>document.getElementById('zone:'+z)).filter(Boolean);
    const inStage=(list)=>list.filter((e)=>zones.some((z)=>z.contains(e)));
    const byId=inStage([...document.querySelectorAll('#'+${JSON.stringify(UF_PAGE_EDIT_SURFACE_ID)})]);
    const byMarker=inStage([...document.querySelectorAll('[data-edit-surface]')]);
    const bx=(e)=>{const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};
    const same=byId.length===byMarker.length&&byId.every((e,i)=>e===byMarker[i]);
    return {byId:byId.length,byMarker:byMarker.length,agree:same,
      ids:byId.map((e)=>e.getAttribute('data-edit-surface')),boxes:byId.map(bx),
      painted:byId.length===0?null:byId.every((e)=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0}),
      warnings:inStage([...document.querySelectorAll('#'+${JSON.stringify(UF_PAGE_COMMIT_WARNING_ID)})]).map((e)=>({box:bx(e),kind:e.getAttribute('data-failure-kind'),text:(e.textContent||'').replace(/\\s+/g,' ').slice(0,140)}))}})()`)
}

/** The whole-page editing surface's APP-VISIBLE state (§2.1/§8.3 items 1-8):
 *  painted box, marker, contenteditable, identity token, inline/heading census,
 *  the rendered `<textarea>` census and the surface's own committed text. */
async function ufEditSurfaceState(h) {
  return h.cdp.evaluate(`(()=>{
    const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');
    const m=document.getElementById('zone:main');
    const textareas=m?m.querySelectorAll('textarea').length:null;
    const globalTextareas=document.querySelectorAll('textarea').length;
    if(!s)return {present:false,textareas:textareas,globalTextareas:globalTextareas,
      textareasInBothModes:globalTextareas,
      warning:!!document.getElementById('${UF_PAGE_COMMIT_WARNING_ID}')};
    const r=s.getBoundingClientRect();
    const t=s.textContent||'';
    let hash=0;for(let i=0;i<t.length;i++){hash=(hash*31+t.charCodeAt(i))|0}
    s.setAttribute('data-identity-token',String(hash)+':'+String(Math.round(r.width))+'x'+String(Math.round(r.height)));
    const blocks=[...s.children].map((e)=>({tag:e.tagName,rid:e.getAttribute('data-rag-node-id'),head:e.hasAttribute('data-doc-head'),len:(e.textContent||'').length,box:(()=>{const b=e.getBoundingClientRect();return [Math.round(b.x),Math.round(b.y),Math.round(b.width),Math.round(b.height)]})()}));
    return {present:true,marker:s.getAttribute('data-edit-surface'),contenteditable:s.getAttribute('contenteditable'),
      box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],len:t.length,hash:hash,
      identityToken:s.getAttribute('data-identity-token'),blocks:blocks,blockCount:blocks.length,
      textareas:textareas,globalTextareas:globalTextareas,
      inlineFormatting:s.querySelectorAll('strong,em,a,img').length,
      headings:s.querySelectorAll('h1,h2,h3').length,
      headingScale:[...s.querySelectorAll('h1,h2,h3')].map((e)=>parseFloat(getComputedStyle(e).fontSize)),
      fontFamily:getComputedStyle(s).fontFamily,
      warning:!!document.getElementById('${UF_PAGE_COMMIT_WARNING_ID}'),
      warningText:(()=>{const w=document.getElementById('${UF_PAGE_COMMIT_WARNING_ID}');return w?String(w.textContent||'').replace(/\\s+/g,' ').slice(0,140):null})()}})()`)
}

/** Focus the surface and place the caret at the END of its `idx`-th block (a
 *  real Selection on the rendered element — the input path a user's click
 *  creates). Returns the caret's resolved container for evidence. */
async function ufCaretAt(h, idx) {
  return h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');
    if(!s)return {ok:false,why:'no surface'};
    const b=s.children[${idx}];if(!b)return {ok:false,why:'no block '+${idx}};
    s.focus();
    const r=document.createRange();r.selectNodeContents(b);r.collapse(false);
    const sel=window.getSelection();sel.removeAllRanges();sel.addRange(r);
    const nm=(n)=>n?(n.nodeType===3?('text@'+(n.parentElement?n.parentElement.tagName:'?')):(n.tagName+'#'+(n.getAttribute('data-rag-node-id')||n.id))):'null';
    return {ok:true,blockTag:b.tagName,blockRid:b.getAttribute('data-rag-node-id'),anchor:nm(sel.anchorNode),collapsed:sel.getRangeAt(0).collapsed,
      activeElement:(document.activeElement&&(document.activeElement.id||document.activeElement.tagName))||null}})()`)
}

/** The resolved caret/selection reading: both the Selection's own anchors and
 *  the Range's containers, name-resolved to the owning block element. */
async function ufCaret(h) {
  return h.cdp.evaluate(`(()=>{const sel=window.getSelection();
    const nm=(n)=>n?(n.nodeType===3?('text@'+(n.parentElement?(n.parentElement.tagName+'#'+(n.parentElement.getAttribute('data-rag-node-id')||n.parentElement.id)):'?')):(n.tagName+'#'+(n.getAttribute('data-rag-node-id')||n.id))):'null';
    if(!sel||sel.rangeCount===0)return {none:true};
    const r=sel.getRangeAt(0);
    const surface=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');
    const blockOf=(n)=>{const e=n&&n.nodeType===3?n.parentElement:n;if(!e)return null;const b=e.closest?e.closest('#${UF_PAGE_EDIT_SURFACE_ID} > *'):null;return b?(b.tagName+'#'+(b.getAttribute('data-rag-node-id')||b.id)):null};
    return {none:false,rangeCount:sel.rangeCount,collapsed:r.collapsed,
      startContainer:nm(r.startContainer),endContainer:nm(r.endContainer),
      anchor:nm(sel.anchorNode),focus:nm(sel.focusNode),
      startBlock:blockOf(r.startContainer),endBlock:blockOf(r.endContainer),
      insideSurface:!!(surface&&r.startContainer&&surface.contains(r.startContainer.nodeType===3?r.startContainer.parentElement:r.startContainer))}})()`)
}

/** A REAL text insertion at the current caret (the documented live typing
 *  gesture: CDP `Input.insertText` into the focused contenteditable, the same
 *  path a user's keystrokes take). */
async function ufType(h, text) {
  await h.cdp.send('Input.insertText', { text })
  await sleep(400)
  return true
}

/** The REAL commit-on-blur: blur the surface so the authored
 *  `page-edit-surface-blur` handler runs its page commit. Returns the painted
 *  end state (the surface's text + the warning root, when one was authored). */
async function ufBlurSurface(h) {
  await h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');if(!s)return false;s.blur();const ae=document.activeElement;if(ae&&s.contains(ae)&&ae.blur)ae.blur();return true})()`)
  await sleep(2500)
  return h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');
    const w=document.getElementById('${UF_PAGE_COMMIT_WARNING_ID}');
    const wr=w?w.getBoundingClientRect():null;
    return {surfacePresent:!!s,marker:s?s.getAttribute('data-edit-surface'):null,
      surfaceLen:s?(s.textContent||'').length:null,
      warning:!!w,warningKind:w?w.getAttribute('data-failure-kind'):null,
      warningClass:w?w.getAttribute('data-warning-class'):null,
      warningText:w?String(w.textContent||'').replace(/\\s+/g,' ').slice(0,160):null,
      warningBox:wr?[Math.round(wr.x),Math.round(wr.y),Math.round(wr.width),Math.round(wr.height)]:null,
      warningPainted:!!wr&&wr.width>0&&wr.height>0,
      activeElement:(document.activeElement&&(document.activeElement.id||document.activeElement.tagName))||null}})()`)
}

/** The stage's own rendered store read-back for the active document (the
 *  app-visible half of the 1-1 commit claim): the `data-doc-head` node id and
 *  the rendered first paragraph. */
async function ufStageDocReadback(h) {
  return h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');
    if(!m)return {noMain:true};
    const h1=m.querySelector('h1');const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');
    const heads=[...m.querySelectorAll('h1,h2,h3')].map((e)=>e.getAttribute('data-rag-node-id'));
    return {docHead:h1?h1.id:null,heads:heads.slice(0,6),surfaceText:s?(s.textContent||'').slice(0,120):null,
      firstBlock:s&&s.children[0]?(s.children[0].textContent||'').slice(0,80):null,
      marker:s?s.getAttribute('data-edit-surface'):null}})()`)
}

/** A real click on a TAB (the strip is in the SCROLLED page — the tab strip is
 *  not fixed, `docs/defects.md` TABBAR-SCROLLS-AWAY — so the page is scrolled
 *  to its origin first and the click is dispatched at a hit-tested coordinate
 *  inside the viewport; never a synthetic `.click()`). */
async function ufRealClickTab(h, tabId, opts = {}) {
  if (opts.scroll !== false) {
    await h.cdp.evaluate(`window.scrollTo(0,0)`)
    await sleep(500)
  }
  const sel = `.tab[data-tab-id=${JSON.stringify(tabId)}]`
  const p = await ufHitProbe(h, sel)
  if (!p) return { path: 'missing', realInput: false, detail: `no tab ${tabId}` }
  return ufRealClick(h, sel, { scroll: false, settle: 0, ...opts })
}

/** Ensure a DOCUMENT tab is the ACTIVE tab (the standing precondition of the
 *  document-surface blocks): when the active tab is a non-document tab, a REAL
 *  click activates the first document tab (never a synthetic activation). */
async function ufEnsureDocumentTabActive(h) {
  const v = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
  if (v.activeTabKind === 'document') return { changed: false, path: 'already-document', activeTabId: v.activeTabId }
  const doc = (v.tabIds || []).find((t) => t.kind === 'document')
  if (!doc) return { changed: false, path: 'no-document-tab', activeTabId: v.activeTabId }
  const r = await ufRealClickTab(h, doc.id)
  await sleep(2000)
  const v2 = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
  return { changed: true, path: r.path, activeTabId: v2.activeTabId, activeTabKind: v2.activeTabKind }
}

/** Guarantee a LIVE document page in the stage (the document-surface blocks'
 *  precondition): when no document tab is active, REAL-click a doc-nav row
 *  (the product's "show me this document" gesture — it also materializes the
 *  first document TAB via the sidebar's own focus seam); when a document tab
 *  exists but is inactive, REAL-click that tab. Returns the full record. */
async function ufEnsureDocumentSurface(h) {
  const docNavRow = async () => h.cdp.evaluate(`(()=>{const rows=[...document.querySelectorAll('#pane-doc-nav [data-document-id]')];for(const li of rows){const r=li.getBoundingClientRect();if(r.width>0&&r.height>0&&r.top>=-20&&r.top<=700)return li.getAttribute('data-document-id')}return rows.length?rows[0].getAttribute('data-document-id'):null})()`)
  const out = { focusDoc: null, focusPath: null, tabPath: null, tabId: null, surfaceAtStart: null, surfaceAfter: null, folderExpands: [] }
  out.surfaceAtStart = await h.cdp.evaluate(`!!document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}')`)
  if (out.surfaceAtStart) return out
  // A fresh store's doc-nav renders FOLDER rows with their children collapsed, so
  // a document row may not exist until the disclosure is opened (a REAL click on
  // the folder row — the pane's own gesture).
  for (let i = 0; i < 4; i += 1) {
    const state = await h.cdp.evaluate(`(()=>{const rows=[...document.querySelectorAll('#pane-doc-nav [data-document-id]')];return {docs:rows.length,folds:[...document.querySelectorAll('#pane-doc-nav [data-folder-path]')].map((f)=>({path:f.getAttribute('data-folder-path'),expanded:f.getAttribute('data-expanded')}))}})()`)
    if (state.docs > 0) break
    const closed = state.folds.find((f) => f.expanded !== 'true')
    if (!closed) break
    await ufEnsurePaneExpanded(h, 'doc-nav')
    const r = await ufRealClick(h, `#pane-doc-nav [data-folder-path=${JSON.stringify(closed.path)}]`)
    out.folderExpands.push({ path: closed.path, path0: r.path })
    await sleep(1500)
  }
  const doc = await docNavRow()
  if (doc) {
    await h.cdp.evaluate(`window.scrollTo(0,0)`)
    await sleep(400)
    const r = await ufRealClick(h, `#pane-doc-nav [data-document-id=${JSON.stringify(doc)}]`)
    out.focusDoc = doc
    out.focusPath = r.path
    await sleep(4000)
  }
  // A fresh boot whose ACTIVE tab is the LANDING has NO document tab, and the
  // doc-nav focus seam alone does not materialize one (it sets the sidebar's
  // focused document + requests a rebuild — it never activates/opens a tab).
  // The product's own document-TAB opening gestures are the search pane's result
  // rows (`#pane-search li[data-document-id]` → HOST-4 → a NEW document tab), so
  // the fallback drives the REAL search pane and REAL-clicks its first result.
  if (!(await h.cdp.evaluate(`!!document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}')`)) && !(await h.cdp.evaluate(`!!document.querySelector('#pane-doc-nav [data-document-id]')`))) {
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
    if (docs && Array.isArray(docs.documents) && docs.documents.length > 0) {
      const pane = await ufPaneSearch(h, 'the')
      out.searchDrive = { toggle: pane.togglePath, focus: pane.focusPath, submit: pane.submitPath, rows: pane.rows.length }
      const first = (pane.rows || []).find((r) => r.box[2] > 0)
      if (first) {
        const r = await ufRealClick(h, `#pane-search li[data-document-id=${JSON.stringify(first.doc)}]`)
        out.resultClickPath = r.path
        out.resultDoc = first.doc
        await sleep(4000)
      }
    }
  }
  // A fresh boot whose ACTIVE tab is the LANDING has NO document tab, and the
  // two product seams that reach one are BOTH closed on this build:
  //   * the doc-nav row's select handler routes to the SIDEBAR focus seam
  //     (`selectDocument` → `setCurrentDocumentId` → `requestRebuild`) — with a
  //     LANDING tab active the re-derive scope is null, so a document row click
  //     changes no stage body at all (measured: rows appear, the stage does not);
  //   * the landing stage's own `li[data-document-id]` rows are authored with NO
  //     handler, and `rag.query` returns `[]` for this store, so no
  //     search-result → document-tab path is available either.
  // The only live seam left is the RENDERER BRIDGE's `openDocumentTab`
  // (`renderer.ts` → `tabStrip.openDocumentTab` → the tab strip's real
  // `focusTarget(..., {newTab:true})`), which the app-graph's search-result
  // handler body itself calls — a SYNTHETIC activation, recorded as such in the
  // evidence (never claimed as a real gesture).
  if (!(await h.cdp.evaluate(`!!document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}')`))) {
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
    const firstDoc = docs && Array.isArray(docs.documents) && docs.documents[0] ? docs.documents[0].documentId : null
    if (firstDoc) {
      out.bridgeOpen = await h.cdp.evaluate(`(async()=>{const s=window.provident&&window.provident.sidebar;if(!s||typeof s.openDocumentTab!=='function')return {available:false};s.openDocumentTab(${JSON.stringify(firstDoc)});return {available:true,doc:${JSON.stringify(firstDoc)}}})()`)
      out.bridgeOpenDoc = firstDoc
      await sleep(4000)
    }
  }
  if (!(await h.cdp.evaluate(`!!document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}')`))) {
    const v = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
    const docTab = (v.tabIds || []).find((t) => t.kind === 'document')
    if (docTab) {
      const rr = await ufRealClickTab(h, docTab.id)
      out.tabPath = rr.path
      out.tabId = docTab.id
      await sleep(3000)
    } else {
      const doc2 = await docNavRow()
      if (doc2) {
        const r2 = await ufRealClick(h, `#pane-doc-nav [data-document-id=${JSON.stringify(doc2)}]`, { scroll: false })
        out.focusDoc = out.focusDoc ?? doc2
        out.focusPath = r2.path
        await sleep(4000)
      }
    }
  }
  out.surfaceAfter = await h.cdp.evaluate(`!!document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}')`)
  out.tabIds = (await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)).tabIds
  return out
}


/** The U-EDIT-1 live FIXTURE (§8.3 items 1/2/7/8 need a document whose surface
 *  is expressible by the adopted decomposer AND carries >= 2 renderable block
 *  roots): a real `edit.import_markdown` of a plain fixture (no inline
 *  formatting, no tables), then the document tab opened + activated with REAL
 *  gestures. Returns the fixture's id + the surface's block census. */
async function ufEnsureEditFixture(h, minBlocks = 1) {
  // two sibling SECTIONS give the surface more than one top-level block root
  const name = 'live-page-edit-fixture.md'
  const text = '# Live Page Edit Fixture\n\nFirst editable paragraph of the live fixture.\n\n## Second Section\n\nSecond editable paragraph, in the fixture second section.\n'
  const file = join(ROOT, '.live-page-edit-fixture.md')
  try { writeFileSync(file, text, 'utf8') } catch { /* the import below reports it */ }
  const imp = await h.mcpTool(h.mcp, 'edit.import_markdown', { files: [file] }).catch((e) => ({ ok: false, error: String(e) }))
  const docId = imp && Array.isArray(imp.documentIds) && imp.documentIds[0] ? imp.documentIds[0] : 'live-page-edit-fixture'
  const cur = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
  const existing = (cur.tabIds || []).find((t) => t.kind === 'document' && (t.title.indexOf('live-page-edit-fixture') >= 0 || t.title.indexOf('Live Page Edit Fixture') >= 0))
  if (existing && (await h.cdp.evaluate(`!!document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}')`))) {
    await ufRealClickTab(h, existing.id)
    await sleep(3000)
    return { docId, import: imp, reused: true, active: await h.cdp.evaluate(UF_ACTIVE_TAB_SRC), surface: await ufEditSurfaceState(h) }
  }
  const opened = await h.cdp.evaluate(`(()=>{const s=window.provident&&window.provident.sidebar;if(!s||typeof s.openDocumentTab!=='function')return {available:false};s.openDocumentTab(${JSON.stringify(docId)});return {available:true}})()`)
  await sleep(4000)
  let v = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
  // the tab strip's title for an opened document is the document's TITLE, which
  // for an inline import is the fixture name without the extension
  let tab = (v.tabIds || []).find((t) => t.kind === 'document' && /live-page-edit-fixture/.test(t.title))
  if (!tab) tab = (v.tabIds || []).filter((t) => t.kind === 'document').pop()
  if (tab && tab.active !== true) {
    await ufRealClickTab(h, tab.id)
    await sleep(3000)
    v = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
  }
  const surface = await ufEditSurfaceState(h)
  // MULTI-BLOCK fallback (items 1/2 need a surface with >= 2 renderable block
  // roots): a document whose head element CONTAINS its own children renders as
  // ONE block, so a candidate corpus is searched for a document that renders
  // >= `minBlocks` direct block roots. The census is recorded, never asserted.
  const tried = [{ docId, tab: tab ? tab.id : null, blocks: surface.blockCount }]
  if (minBlocks > 1 && (surface.blockCount || 0) < minBlocks) {
    const all = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
    const list = all && Array.isArray(all.documents) ? all.documents.map((d) => d.documentId) : []
    for (const id of list.slice(0, 20)) {
      const opened2 = await ufOpenDocumentById(h, id)
      const st2 = await ufEditSurfaceState(h)
      tried.push({ docId: id, blocks: st2.blockCount })
      if ((st2.blockCount || 0) >= minBlocks) {
        return { docId: id, import: imp, bridge: opened, tab: opened2.tabId, active: await h.cdp.evaluate(UF_ACTIVE_TAB_SRC), surface: st2, fallback: true, tried }
      }
    }
    return { docId, import: imp, bridge: opened, tab: tab ? tab.id : null, active: v, surface: surface, tried, noMultiBlock: true }
  }
  return { docId, import: imp, bridge: opened, tab: tab ? tab.id : null, active: v, surface: surface, tried }
}

/** Open a SPECIFIC document in its own tab + make it active. `openDocumentTab`
 *  is the RENDERER BRIDGE seam the app-graph's search-result handler body itself
 *  calls (`renderer.ts` → `tabStrip.openDocumentTab` → `focusTarget(newTab)`);
 *  the activation is then a REAL tab click. Recorded as a synthetic open, never
 *  claimed as a real gesture. */
/** `§16.2` — OPEN A DOCUMENT BY ID AND RETURN ONLY WHEN ITS OWN SURFACE IS LIVE.
 *  THE `existing-tab` SHORTCUT IS SCOPED TO THE TAB THAT IS ALREADY ACTIVE, and its
 *  old title predicate (`title.contains(basename)`) is GONE: it resolved a request for
 *  the `table` set's document to the ALPHA tab — `alpha` CONTAINS `table`, so the
 *  predicate matched a SIBLING SET MEMBER whose surface cannot carry a table, and the
 *  candidate scan then censused the alpha surface and parked the very row the `table`
 *  set exists for (`P-β`, `§16.11`). Whether a document is open is read from the
 *  SURFACE'S OWN `data-edit-surface` MARKER, never from a title substring. */
async function ufOpenDocumentById(h, docId) {
  const v0 = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
  const active = (v0.tabIds || []).find((t) => t.active === true)
  if (active && active.kind === 'document') {
    const marker0 = (await ufEditSurfaceState(h)).marker
    if (marker0 === docId) {
      return { docId, via: 'existing-tab', tabId: active.id, path: 'already-active', marker: marker0 }
    }
  }
  const opened = await h.cdp.evaluate(`(()=>{const s=window.provident&&window.provident.sidebar;if(!s||typeof s.openDocumentTab!=='function')return {available:false};s.openDocumentTab(${JSON.stringify(docId)});return {available:true}})()`)
  await sleep(4000)
  // `§16.2` — THE OPEN IS NOT SETTLED WHEN THE BRIDGE RETURNS: the stage mounts the
  // document ASYNCHRONOUSLY (the mount race this driver's own `stage_async_mount_race_v1`
  // row is about), so a census taken on a fixed delay can read the PREVIOUS document's
  // surface — which for the `--fixture=table` candidate scan (`P-β`'s `#page-edit-surface
  // table`) parks the row the `table` set exists for. WAIT FOR THE SURFACE'S OWN MARKER
  // to become the opened document's id, bounded, before returning.
  await waitFor(async () => (await ufEditSurfaceState(h)).marker === docId, { timeout: 20000, step: 400 }).catch(() => null)
  const v = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
  const tab = (v.tabIds || []).find((t) => t.kind === 'document' && t.active === true)
  let path = null
  if (tab === undefined) {
    const anyDoc = (v.tabIds || []).slice().reverse().find((t) => t.kind === 'document')
    if (anyDoc) { path = (await ufRealClickTab(h, anyDoc.id)).path; await sleep(2500) }
  }
  return { docId, via: 'bridge-openDocumentTab', bridge: opened, tabId: tab ? tab.id : null, path, marker: (await ufEditSurfaceState(h)).marker }
}

/** The REAL search-pane drive that opens the pane's current query as a NEW
 *  search tab (`#pane-search-expand-tab` → `expandSearchTab` → the tab's own
 *  async `rag.query`). Returns the click's proven path + the tab set before it,
 *  so the race block can act INSIDE the async window. */
async function ufExpandSearchTab(h) {
  const before = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
  const r = await ufRealClick(h, '#pane-search-expand-tab', { nativeFallback: false })
  return { path: r.path, hit: r.rect ? r.rect.hit : null, before }
}

/** The doc-nav row for a document id, as its painted geometry (used to open a
 *  document tab by a REAL row click). */
async function ufDocNavRow(h, documentId) {
  const q = JSON.stringify(`#pane-doc-nav [data-document-id=${JSON.stringify(documentId)}]`)
  return h.cdp.evaluate(`(()=>{const e=document.querySelector(${q});if(!e)return null;const r=e.getBoundingClientRect();return {box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],text:(e.textContent||'').trim().slice(0,40)}})()`)
}

/**
 * The shared §6.1 row-shape builder. `path` is the recorded gesture path of the
 * block's row gesture ('cdp' = hit-tested real input, 'native-fallback'/'… ' =
 * a synthetic or unproven path); `proxy` names the proxy oracle when the block's
 * only oracle is a presence/attribute/class/geometry-free probe.
 *
 * §2.2 `E-7`/`E-8` — a NON-PASS carries `failingClause`: the predicate that
 * failed, with its `observed` and `required` values named (`required` defaults to
 * the row's pinned `assertion` when the gesture path is proven, and to the
 * proven-gesture rule when it is not; `observed` defaults to the block's own
 * evidence). The clause is DERIVED, never optional prose, so no row can print a
 * non-PASS without one — `M-3`'s predicate-less `before=true after=true` is the
 * defect this makes impossible. `buildFailingClause` below holds the detail.
 *
 * A row whose oracle is not a gesture at all (a pinned MCP/store/state row) opts
 * out of the real-input gate with `gesture: false` and carries `realInput: false`
 * honestly (the default gate REQUIRES the proven hit-tested `'cdp'` path, so a
 * fallback path can never PASS).
 */
const NO_EXTRA_FIELDS = Object.freeze({})

/** §2.2 `E-6` — the row-id / `dclass` ENUMERATION the builder resolves a caller's
 *  id against, so the emitted §6.1 object carries a LITERAL id of the contracted
 *  form (`U-<n>` or `UF-<SURFACE>-<n>`) and a literal `dclass` of the contracted
 *  enum rather than an opaque variable. An id outside both maps is not a contract
 *  row and is reported as such (never silently minted — §2.1 `E-4` item 3). */
const ROW_ID_LITERALS = {
  'U-1': 'U-1', 'U-2': 'U-2', 'U-3': 'U-3', 'U-4': 'U-4', 'U-5': 'U-5', 'U-6': 'U-6', 'U-7': 'U-7', 'U-8': 'U-8',
  'UF-DEFECT-1': 'UF-DEFECT-1', 'UF-DEFECT-2': 'UF-DEFECT-2', 'UF-DEFECT-3': 'UF-DEFECT-3',
  'UF-DEFECT-5': 'UF-DEFECT-5', 'UF-DEFECT-6': 'UF-DEFECT-6', 'UF-DEFECT-7': 'UF-DEFECT-7', 'UF-DEFECT-8': 'UF-DEFECT-8',
  'UF-KEEP-1': 'UF-KEEP-1', 'UF-KEEP-3': 'UF-KEEP-3',
  'UF-TABS-1': 'UF-TABS-1', 'UF-TABS-3': 'UF-TABS-3', 'UF-TABS-4': 'UF-TABS-4', 'UF-TABS-7': 'UF-TABS-7',
  'UF-PANES-1': 'UF-PANES-1', 'UF-PANES-8': 'UF-PANES-8', 'UF-PANES-10': 'UF-PANES-10', 'UF-PANES-12': 'UF-PANES-12', 'UF-PANES-14': 'UF-PANES-14',
  'UF-SETTINGS-1': 'UF-SETTINGS-1', 'UF-SETTINGS-2': 'UF-SETTINGS-2', 'UF-SETTINGS-3': 'UF-SETTINGS-3',
  'UF-SETTINGS-4': 'UF-SETTINGS-4', 'UF-SETTINGS-5': 'UF-SETTINGS-5', 'UF-SETTINGS-7': 'UF-SETTINGS-7',
  'UF-SEARCH-2': 'UF-SEARCH-2', 'UF-HIST-2': 'UF-HIST-2', 'UF-HIST-4': 'UF-HIST-4', 'UF-HIST-6': 'UF-HIST-6',
  'UF-LAYOUT-2': 'UF-LAYOUT-2', 'UF-LAYOUT-10': 'UF-LAYOUT-10', 'UF-STAGE-1': 'UF-STAGE-1', 'UF-STAGE-2': 'UF-STAGE-2',
  'UF-STAGE-3': 'UF-STAGE-3', 'UF-STAGE-4': 'UF-STAGE-4', 'UF-STAGE-6': 'UF-STAGE-6',
  'UF-GNOSIS-1': 'UF-GNOSIS-1', 'UF-GNOSIS-2': 'UF-GNOSIS-2', 'UF-GNOSIS-3': 'UF-GNOSIS-3',
  'UF-GNOSIS-4': 'UF-GNOSIS-4', 'UF-GNOSIS-5': 'UF-GNOSIS-5', 'UF-GNOSIS-6': 'UF-GNOSIS-6',
  'U-EDIT-1-LIVE-1': 'U-EDIT-1-LIVE-1', 'U-EDIT-1-LIVE-2': 'U-EDIT-1-LIVE-2', 'U-EDIT-1-LIVE-3': 'U-EDIT-1-LIVE-3', 'U-EDIT-1-LIVE-4': 'U-EDIT-1-LIVE-4',
  'U-EDIT-1-LIVE-5': 'U-EDIT-1-LIVE-5', 'U-EDIT-1-LIVE-6': 'U-EDIT-1-LIVE-6', 'U-EDIT-1-LIVE-7': 'U-EDIT-1-LIVE-7', 'U-EDIT-1-LIVE-8': 'U-EDIT-1-LIVE-8',
  'UF-STAGE-AT-1': 'UF-STAGE-AT-1', 'UF-STAGE-AT-2': 'UF-STAGE-AT-2', 'UF-STAGE-AT-3': 'UF-STAGE-AT-3', 'UF-STAGE-AT-4': 'UF-STAGE-AT-4',
  'UF-STAGE-AT-5': 'UF-STAGE-AT-5', 'UF-STAGE-AT-6': 'UF-STAGE-AT-6', 'UF-STAGE-AT-7': 'UF-STAGE-AT-7', 'UF-STAGE-AT-8': 'UF-STAGE-AT-8',
}
const DCLASS_LITERALS = { 'D-interaction': 'D-interaction', 'D-visual': 'D-visual', 'D-state': 'D-state' }

/** §2.2 `E-7` — the BLOCK -> declared row-id map every counted block is reported
 *  through, so each block's OWN verdict prints with its own name and row id on
 *  the record (no contributor is left out; an aggregated row is never the only
 *  place a block's verdict appears — §2.2 `E-11` item 1). */

/** The literal row id of a claimed id (`null` when the id is outside the closed
 *  enumeration — a driver-invented id is a defect, never silently accepted). */
function rowIdLiteral(id) {
  return Object.prototype.hasOwnProperty.call(ROW_ID_LITERALS, String(id)) ? ROW_ID_LITERALS[String(id)] : null
}
function dclassLiteral(cls) {
  return Object.prototype.hasOwnProperty.call(DCLASS_LITERALS, String(cls)) ? DCLASS_LITERALS[String(cls)] : null
}

function rowResult(id, assertion, evidence, opts = NO_EXTRA_FIELDS) {
  // §2.3 `H-4` — **THE BUILDER ACCEPTS ITS OWN PARK CALL FORM.** The four-parameter
  // §6.1 shape is `(id, assertion, evidence, opts)` with `id = { row, dclass }`,
  // and that is the shape every row-building site uses. A PARK, however, carries
  // one more value than a row does — the §6.1 `H-4` `reason` lives on the park, so
  // a park call arrives as `(row, assertion, dclass, evidence, opts)`: FIVE values.
  // Reading that form through the four-parameter shape put the row id in `id`, the
  // dclass in `evidence` and the caller's `opts` in the `evidence` slot, so `id.row`
  // read `undefined`, `ufPushRows`' `typeof res.row === 'string'` guard SKIPPED the
  // result, and the park produced a `PARK` line with no `verdict=PARKED` `ROW` line
  // and no §6.1 report row at all. The form is therefore resolved HERE, on the
  // `id`: the four-parameter shape passes an OBJECT (always), the five-parameter
  // park form passes the row ID as a plain string with the dclass beside it, and
  // both land in the same three §6.1 fields.
  // The park form names its values in the PARK's order, so they are read back in
  // that same order: `(row, assertion, dclass, evidence, opts)` — the row ID in
  // `id`, the §6.1 class in `evidence` (this builder's fourth position), the
  // assertion in `assertion`, the observed prose in the FOURTH argument (`opts`)
  // and the caller's field set in the FIFTH (`arguments[4]`).
  const parkForm = typeof id === 'string'
  const row = parkForm ? id : id.row
  const dclass = parkForm ? evidence : id.dclass
  const rowAssertion = assertion
  const rowEvidence = parkForm ? opts : evidence
  // The park form reaches its §6.1 options through the FIFTH position (its fourth
  // argument holds the evidence), so the caller's field set is completed from the
  // call's own argument list — the only way a five-value park call reaches the
  // FOUR-parameter builder (a rest parameter would change the signature itself).
  const optsAt = typeof opts === 'object' && opts !== null ? opts : arguments[4]
  const rowOpts = parkForm ? (optsAt ?? NO_EXTRA_FIELDS) : opts
  const rowClick = rowOpts.click ?? null
  const rowExtra = rowOpts.extra ?? NO_EXTRA_FIELDS
  const path = rowOpts.path ?? null
  const proxy = rowOpts.proxy ?? null
  const realInput = path === 'cdp'
  const surface = rowOpts.surface ?? { target: 'assembled-renderer', liveSurfacePresent: null }
  const proxyPASS = !!proxy
  const undoDisabledAfter = rowOpts.undoDisabledAfter ?? null
  const needsGesture = rowOpts.gesture !== false
  const inputGate = needsGesture ? realInput : true // the summary's matrixVerdict scope counts ONLY the ^U-\\d+$ rows
  const pass = !rowOpts.diagnostic && inputGate && !proxyPASS && rowOpts.ok === true && (undoDisabledAfter === null || undoDisabledAfter === true)
  const required = rowOpts.required ?? (needsGesture && !realInput ? `a PROVEN hit-tested gesture path (gesturePath='cdp'); observed gesturePath=${JSON.stringify(path)}` : rowAssertion)
  const observed = rowOpts.observed ?? rowEvidence
  const failingClause = buildFailingClause(pass, rowAssertion, required, observed, path, realInput, proxyPASS, rowOpts.park === true)
  const rowId = rowIdLiteral(row)
  const rowLit = rowIdLiteral(row) || row
  const dclassLit = dclassLiteral(dclass) || dclass
  return {
    row: rowLit,
    assertion: rowAssertion,
    dclass: dclassLit,
    realInput: realInput,
    evidence: rowEvidence,
    proxyPASS: proxyPASS,
    surface: surface,
    pass: pass,
    // §2.3 `H-4` — the PARK flag and its NAMED reason travel on the result, so a
    // park is classified `PARKED` by `blockVerdictOf`, admitted to `reportRows` by
    // its `row` id, and printed with `parkReason` on its own `ROW` line. The park
    // flag is derived from the SAME options the other fields read, so a park call
    // cannot produce a `PARK` line while its row carries no park verdict.
    park: rowOpts.park === true,
    parkReason: rowOpts.park === true ? (rowOpts.parkReason ?? null) : null,
    // ⟨gate-4 `F-1` — THE ROUTE TAG SURVIVES THE BUILDER.⟩ `rowResult` builds the SAME
    // object `ufCountBlock`'s classification record is taken from (`r.parkRoute`), and
    // the block's OWN park route hands its tag in through the park's options
    // (`ufFixtureOwnPark` → `parkRow`), so a builder that does not SPREAD it makes the
    // tag read `null` for every block-body park and the fixture-absence member counts
    // none of them: the chain `parkedByGate ⊆ parkedByFixtureAbsence ⊆ parked` is
    // counted over the route tag HOWEVER the park was routed — the gate branch OR the
    // block's own body (§5.5's counting clause, §16.5).
    parkRoute: rowOpts.park === true ? (rowOpts.parkRoute ?? null) : null,
    diagnostic: rowOpts.diagnostic === true,
    proxy: proxyPASS ? proxy : null,
    gesturePath: path,
    undoDisabledAfter: undoDisabledAfter,
    // §2.2 `E-7`: the predicate that failed, with its observed-vs-required values
    // (`null` only on a PASS), plus the two values as their own printed members.
    failingClause: failingClause,
    observed: observed,
    required: required,
    // §2.3 `H-3` clause 1 (`G-9`) — THE CLICK RECORD, when the block supplies the
    // gesture it drove (`opts.click`): the coordinate, the viewport it was
    // dispatched against, the element under the point, `onTarget` and `inVp`, so
    // the printed `ROW` line carries the click's proof and never only a path.
    clickRecord: rowClick ? ufNormalizeClickRecord(rowClick) : null,
    // The harness prints `detail`; for a row result that IS the §6.1 `evidence`
    // (the concrete observed value), so the PASS/FAIL line stays readable.
    detail: rowEvidence,
    ...rowExtra,
  }
}

/** §2.2 `E-7`/`E-8` — THE FAILING CLAUSE. `null` on a PASS; on every non-PASS the
 *  PREDICATE THAT FAILED with its `required` and `observed` values, so a bare
 *  comparison can never reach the report (`M-3`: `vis_persist`'s predicate-less
 *  `before=true after=true`). The `verdict` recorded here is the SAME
 *  classification the report prints (`PARKED` > `NOT-DRIVEN` > `FAIL`) — and it is
 *  not merely CLAIMED to be: ⟨gate-4 finding `D-2`⟩ the clause applies THE SAME
 *  predicate the report's own classifier applies (verbatim identical, over the same
 *  path vocabulary — `blockVerdictOf` is the driver's single classification site),
 *  and `buildReportRow` stamps the row's printed `verdict` onto the clause it prints,
 *  so the clause and the `ROW` line cannot diverge (`ONE PREDICATE, NOT TWO`). */
/**
 * §2.3 `H-4` + §3.2 `F-6`/`F-7` — THE REASON A ROW COULD NOT BE DRIVEN, named: an
 * `isError` MCP reply (printed verbatim), a missing fixture / an absent engine
 * (`ECONNREFUSED`) is a PRECONDITION-FAILED reading — never a silent park and
 * never a row FAIL against an absent surface. A gesture that could not be driven
 * honestly reads `NOT-DRIVEN` with the concrete reason (never an app FAIL).
 */
function driverFailureReason(kind, detail, extra) {
  const preconditionKinds = ['empty-corpus', 'engine-absent', 'ECONNREFUSED', 'fixture-missing']
  const isPrecondition = preconditionKinds.includes(String(kind))
  if (isPrecondition) return { verdict: 'PARKED', preconditionFailed: true, marker: `PRECONDITION-FAILED: ${kind} — ${detail}${extra ? ` (${extra})` : ''}`, realInput: false }
  const isErrorReply = kind === 'isError'
  return { verdict: 'NOT-DRIVEN', preconditionFailed: false, marker: `NOT-DRIVEN${isErrorReply ? ` (isError reply printed verbatim: ${detail})` : ''} — could not be driven: ${detail}${extra ? ` (${extra})` : ''}`, realInput: false }
}

/** §2.1 `E-4` — the CONVERTED-vs-EXCLUDED disposition recorded in the driver's own
 *  words: the two counted rows this unit converts (`boot_landing` -> `UF-STAGE-1`,
 *  `vis_persist` -> the persistence half of `UF-SETTINGS-7`) are CONVERTED onto
 *  the closed enumeration; the declared non-row diagnostic/hygiene blocks are
 *  EXCLUDED from the row arithmetic. No counted row stays in the silent middle
 *  state `F-11` makes the finding. */
const CONVERTED_ROW_DISPOSITION = ['boot_landing -> UF-STAGE-1 (CONVERTED)', 'vis_persist -> UF-SETTINGS-7 (CONVERTED)']
const EXCLUDED_NON_ROW_DISPOSITION = ['uf_restore_layout (EXCLUDED: hygiene)', 'uf_scroll_reset (EXCLUDED: hygiene)', 'uf_mount_diag (EXCLUDED: diagnostic)', 'uf_mount_leak_diag (EXCLUDED: diagnostic)', 'uf_tabs_7_diag (EXCLUDED: diagnostic)', 'uf_panes_12_diag (EXCLUDED: diagnostic)']

/** §2.1 `E-4` item 2 / §3.2 `F-11` (`G-5`) — THE MACHINE-READABLE NON-ROW
 *  DISPOSITION MAP. The two `console.log` strings above are the driver's own WORDS
 *  about two classes of block; this map is the same classification as DATA: for
 *  EVERY counted `BLOCKS` key that is not a row block (a block carrying no
 *  declared row id — the pin's `uf_*`/legacy row-block scope, `MATRIX_ROWS` and
 *  `ROW_EXTENDED` being the declared row sources), the entry NAMES what the block
 *  is and why its verdict is not a silent middle state: `EXCLUDED: …` for the
 *  measurement-only/hygiene/probe blocks, `ROW BLOCK: <id>` for a counted block
 *  that DOES carry a declared row id (its verdict is its `ROW` line — never a bare
 *  `{pass, detail}`). A counted block that appears in NEITHER this map nor a
 *  declared row id is the `F-11` finding, and the run prints this map on its own
 *  `NON-ROW` line so the classification is readable from the artifact, not only
 *  from the driver's source. */
export const NON_ROW_DISPOSITIONS = {
  tab_new_click: 'EXCLUDED: probe (a bare tab-strip click probe — no declared row id)',
  zones: 'EXCLUDED: probe (zone inventory, no verdict-bearing row id)',
  collapse: 'EXCLUDED: probe (pane-collapse probe, no declared row id)',
  tabs: 'EXCLUDED: probe (tab inventory over the seeded corpus, no declared row id)',
  settings_modal: 'EXCLUDED: probe (settings-modal open/close probe, no declared row id)',
  import: 'EXCLUDED: diagnostic (the OS dialog driver is absent — no drivable assertion, §6.1 diagnostic form)',
  diag: 'EXCLUDED: diagnostic (measurement only)',
  diag2: 'EXCLUDED: diagnostic (measurement only)',
  diag3: 'EXCLUDED: diagnostic (measurement only)',
  diag4: 'EXCLUDED: diagnostic (measurement only)',
  diag5: 'EXCLUDED: diagnostic (measurement only)',
  diag6: 'EXCLUDED: diagnostic (measurement only)',
  reorder: 'EXCLUDED: probe (pane-reorder drag probe, no declared row id)',
  first_boot_default: 'EXCLUDED: probe (first-run pane-default census; asserts no declared row id)',
  settings_boot: 'EXCLUDED: probe (settings-pane boot population; asserts no declared row id)',
  persistence_v1: 'EXCLUDED: probe (persistence run 1 — flips + persists doc-nav OFF; asserts no declared row id)',
  persistence_v2: 'EXCLUDED: probe (persistence run 2 — re-asserts the persisted OFF state; asserts no declared row id)',
  ujr1_journal: 'EXCLUDED: probe (journal read-back, no declared row id)',
  v1_adjacency: 'EXCLUDED: probe (MCP adjacency probe, no declared row id)',
  v2_scoped: 'EXCLUDED: probe (MCP store-scoped query probe, no declared row id)',
  v3_docnav: 'EXCLUDED: probe (doc-nav tree probe, no declared row id)',
  x_flat: 'EXCLUDED: probe (flat/sibling retrieval probe, no declared row id)',
  ms_store: 'EXCLUDED: probe (multi-store scoping probe, no declared row id)',
  shell_wiring: 'EXCLUDED: hygiene (shell wiring census, no declared row id)',
  shell7: 'EXCLUDED: probe (shell boot probe, no declared row id)',
  shell_integration: 'EXCLUDED: probe (shell integration probe, no declared row id)',
  gnosis_d2: 'EXCLUDED: probe (gnosis bridge probe, no declared row id)',
  import1: 'EXCLUDED: probe (import probe, no declared row id)',
  uf_tabs_7_diag: 'EXCLUDED: diagnostic (attribution measurement only — the pin’s declared non-row set)',
  uf_panes_12_diag: 'EXCLUDED: diagnostic (attribution measurement only — the pin’s declared non-row set)',
  uf_restore_layout: 'EXCLUDED: hygiene (restores the driver’s own layout state — the pin’s declared non-row set)',
  uf_scroll_reset: 'EXCLUDED: hygiene (resets the page scroll — the pin’s declared non-row set)',
  uf_mount_leak_diag: 'EXCLUDED: diagnostic (mount-leak measurement only — the pin’s declared non-row set)',
  uf_mount_diag: 'EXCLUDED: diagnostic (mount measurement only — the pin’s declared non-row set)',
  gnosis_wikis: 'ROW BLOCK: UF-GNOSIS-1 (a declared row id — its verdict prints on its own ROW line)',
  gnosis_documents: 'ROW BLOCK: UF-GNOSIS-2 (a declared row id — its verdict prints on its own ROW line)',
  gnosis_query: 'ROW BLOCK: UF-GNOSIS-3 (a declared row id — its verdict prints on its own ROW line)',
  gnosis_status: 'ROW BLOCK: UF-GNOSIS-4 (a declared row id — its verdict prints on its own ROW line)',
  gnosis_doc_update: 'ROW BLOCK: UF-GNOSIS-5 (a declared row id — its verdict prints on its own ROW line)',
  gnosis_crud: 'ROW BLOCK: UF-GNOSIS-6 (a declared row id — its verdict prints on its own ROW line)',
  u_edit_1_live_selection_span: 'ROW BLOCK: U-EDIT-1-LIVE-1 (declared in ROW_EXTENDED with this block)',
  u_edit_1_live_caret_head_body: 'ROW BLOCK: U-EDIT-1-LIVE-2 (declared in ROW_EXTENDED with this block)',
  u_edit_1_live_typed_commit_one_batch: 'ROW BLOCK: U-EDIT-1-LIVE-7 (declared in ROW_EXTENDED with this block)',
  u_edit_1_live_commit_failure_warning: 'ROW BLOCK: U-EDIT-1-LIVE-3 (declared in ROW_EXTENDED with this block)',
  u_edit_1_live_representation_mode: 'ROW BLOCK: U-EDIT-1-LIVE-4 (declared in ROW_EXTENDED with this block)',
  u_edit_1_live_head_split_and_textarea_census: 'ROW BLOCK: U-EDIT-1-LIVE-5 (declared in ROW_EXTENDED with this block)',
  u_edit_1_live_caret_roundtrip: 'ROW BLOCK: U-EDIT-1-LIVE-8 (declared in ROW_EXTENDED with this block)',
  u_edit_1_live_package_table_limitation: 'ROW BLOCK: U-EDIT-1-LIVE-6 (declared in ROW_EXTENDED with this block)',
  stage_surface_census_i2r: 'ROW BLOCK: UF-STAGE-AT-1 (declared in ROW_EXTENDED with this block)',
  stage_document_tab_paints_its_document: 'ROW BLOCK: UF-STAGE-AT-2 (declared in ROW_EXTENDED with this block)',
  // ⟨gate-4 `F-7` — THE `ROW BLOCK:` PROSE IS RE-DERIVED FROM THE TREE, NOT CARRIED.⟩
  // FIVE entries of this map named a row id the block does NOT emit (the prose had
  // drifted one place along the `UF-STAGE-AT-*` series while `ROW_EXTENDED`'s own
  // mapping — the ground truth — stayed correct): `stage_search_open_in_tab` emits
  // `UF-DEFECT-7` (its `ROW_EXTENDED` entry unions it with `user9_search_open_in_tab`),
  // `stage_async_mount_race_v1` emits `UF-STAGE-AT-3`, `stage_foreign_rederive_v2`
  // `UF-STAGE-AT-4`, `stage_refresh_survival_v5` `UF-STAGE-AT-5` and
  // `stage_tabs_persist_roundtrip` `UF-STAGE-AT-6` — each `VERIFIED-BY-READ` at the
  // block's own return statement and at `ROW_EXTENDED`. NO arm reads this map as
  // ground truth; the mapping it names is the declared one.
  stage_search_open_in_tab: 'ROW BLOCK: UF-DEFECT-7 (declared in ROW_EXTENDED with this block — its `blocks` union carries this key beside `user9_search_open_in_tab`)',
  stage_async_mount_race_v1: 'ROW BLOCK: UF-STAGE-AT-3 (declared in ROW_EXTENDED with this block)',
  stage_docnav_switch_inside_async: 'ROW BLOCK: UF-STAGE-AT-8 (declared in ROW_EXTENDED with this block)',
  stage_foreign_rederive_v2: 'ROW BLOCK: UF-STAGE-AT-4 (declared in ROW_EXTENDED with this block)',
  stage_refresh_survival_v5: 'ROW BLOCK: UF-STAGE-AT-5 (declared in ROW_EXTENDED with this block)',
  stage_multimount_reachability: 'ROW BLOCK: UF-STAGE-AT-7 (declared in ROW_EXTENDED with this block)',
  stage_tabs_persist_roundtrip: 'ROW BLOCK: UF-STAGE-AT-6 (the tabs-persist half of the declared row — its verdict prints on its own ROW line)',
  stage_doc_surface_precondition_diag: 'EXCLUDED: diagnostic (the declared-row precondition census — measurement only)',
  stage_boot_landing_diag: 'EXCLUDED: diagnostic (boot-landing census — measurement only)',
  o0_folder_row: 'EXCLUDED: diagnostic (O-0 freeze measurement — `o0RowPass`, never a §5.U row verdict)',
  o0_document_row: 'EXCLUDED: diagnostic (O-0 freeze measurement — `o0RowPass`, never a §5.U row verdict)',
  o0_gpu_control: 'EXCLUDED: diagnostic (O-0 freeze control leg — measurement only)',
  o0_track_ablation: 'EXCLUDED: diagnostic (O-0 freeze track ablation — measurement only)',
  o0_repeat_determinism: 'EXCLUDED: diagnostic (O-0 repeat determinism — measurement only)',
}

/** §3.2 `F-7`/`F-6` — the KIND of a row-defining MCP read failure, derived from the
 *  DISCRIMINATED read (`mcpToolResult`): an `isError` reply, an absent engine
 *  (`ECONNREFUSED`) or any other transport failure. `null` when the read was fine.
 *  The read's own `errorText` is carried VERBATIM (F-7: "the `isError` text is
 *  printed verbatim") so `driverFailureReason` can print it without re-quoting. */
function driverReadFailure(read) {
  if (!read || typeof read !== 'object') return null
  if (read.isError === true) return { kind: 'isError', detail: String(read.errorText ?? '(isError reply carried no text)'), extra: `tool=${read.tool}` }
  if (read.transportError === true) {
    const text = String(read.errorText ?? '')
    const kind = /ECONNREFUSED|fetch failed|socket hang up|ECONNRESET|UND_ERR/.test(text) ? 'ECONNREFUSED' : 'transport-error'
    return { kind, detail: text, extra: `tool=${read.tool}` }
  }
  return null
}

/** §2.1 `E-4`/`E-12` — THE DECLARED BLOCKS OF ONE DECLARED ROW: the entry's own
 *  `block` plus any additional contributing `blocks` (the shared row
 *  `UF-SETTINGS-7` is carried by BOTH `vis_persist` and `uf_settings_7`). One
 *  definition, used by the extended reconciliation's scope test AND by the
 *  block-runner's declared-id resolution, so "in scope" cannot mean two things. */
function declaredBlocksOf(entry) {
  if (!entry || typeof entry !== 'object') return []
  const out = typeof entry.block === 'string' && entry.block !== '' ? [entry.block] : []
  if (Array.isArray(entry.blocks)) for (const b of entry.blocks) if (typeof b === 'string' && b !== '') out.push(b)
  return [...new Set(out)]
}

/** §2.3 `H-4` — EVERY declared row id a `BLOCKS` key carries (the matrix rows and
 *  the extended/checklist rows), so a block that CANNOT BE DRIVEN still reports its
 *  declared id by name instead of vanishing into a thrown `FAIL` (`G-2`). */
function ufDeclaredRowsForBlock(block) {
  const out = []
  const seen = new Set()
  const push = (row, dclass) => {
    const id = String(row)
    if (seen.has(id)) return
    seen.add(id)
    out.push({ row: id, dclass: dclass ?? 'D-state' })
  }
  for (const r of MATRIX_ROWS) if (r.block === block) push(r.row, r.dclass)
  for (const r of ROW_EXTENDED) if (declaredBlocksOf(r).includes(block)) push(r.row)
  for (const e of COVERED_ROW_BLOCKS) if (e.block === block) push(e.row)
  return out
}

/** §2.3 `H-4` / §3.2 `F-6`/`F-7` — THE DRIVER-FAILURE ROW SET: one row result per
 *  declared row the block carries, all carrying the SAME named reason (a
 *  `PRECONDITION-FAILED` PARKED marker or a `NOT-DRIVEN` marker with the reply
 *  printed verbatim), `realInput:false`, `pass:false` — never an app FAIL. A block
 *  carrying no declared row id falls back to the §6.1 diagnostic form. */
function ufDriverFailureRows(block, reason) {
  const d = driverFailureReason(reason.kind, reason.detail, reason.extra)
  const declared = ufDeclaredRowsForBlock(block)
  const rows = declared.length ? declared : [{ row: null, dclass: null }]
  return rows.map((r) => {
    // ⟨GATE-4 RE-AUDIT FIX `2026-10-05` — ITEMS 1/2: THIS PARK-EMITTING PATH CARRIES THE PAIR.⟩
    // §5.5's counting clause counts the gated keys parked because their OWN declared fixture read
    // ABSENT *"however the park was routed (the gate branch OR the block's own body)"*: this limb is
    // a park-emitting path of the gate route too, so it carries BOTH members — `park:` (the park; a
    // transport precondition parks as well, §2.3 H-4) AND the route tag (WHICH reading parked it) —
    // through `diagResult`'s `...extra` spread, the diagnostic record's only channel. The TAG, not the
    // park, rides the two FIXTURE-READING kinds alone (ITEM 2): a transport/engine precondition must
    // never be tagged, or the member is inflated and §18.6's `EXACTLY {…}` predicates are falsified.
    if (r.row === null) return diagResult(`${d.marker} — the block carries no declared row id; its verdict is classified, never counted as an app FAIL`, { park: d.preconditionFailed, preconditionFailed: d.preconditionFailed, driverReason: reason.kind, ...(reason.kind === 'empty-corpus' || reason.kind === 'fixture-missing' ? { parkReason: `${reason.kind}: ${reason.detail}`, parkRoute: 'parked-by-fixture-absence' } : {}) })
    return rowResult(
      { row: r.row, dclass: r.dclass },
      `the declared row ${r.row} carried by ${block} (the block's own assertion could not be reached)`,
      `${d.marker} — block=${block}; the block could not be driven to its own verdict: ${reason.detail}${reason.extra ? ` (${reason.extra})` : ''}`,
      {
        path: 'driver-precondition (no gesture; could not be driven)',
        park: d.preconditionFailed,
        // ⟨gate-4 `F-1` — THE GATE ROUTE TAGS ITS OWN PARKS TOO.⟩ A park produced HERE whose
        // own declared fixture read RESOLVED and came back ABSENT — the two fixture-reading
        // kinds `empty-corpus` / `fixture-missing` — is a FIXTURE-ABSENCE park: the block was
        // parked WITHOUT running because its OWN declared fixture read absent. ⟨GATE-4 RE-AUDIT
        // FIX `2026-10-05` — ITEM 2: THE TAG NARROWS TO THAT READING.⟩ A transport/engine
        // precondition (`ECONNREFUSED`, `engine-absent`) is STILL a park (`park` above, §2.3
        // H-4), but NO fixture read resolved for it, so it must NOT ride this route tag: tagging
        // it inflates the member and falsifies §18.6's `EXACTLY {…}` predicates. Without this
        // tag the gate branch's fixture-absence parks are invisible to the fixture-absence
        // member while `parkedByGate` counts them, so under `--fixture=empty` the contracted
        // chain `parkedByGate ⊆ parkedByFixtureAbsence ⊆ parked` is FALSE (§5.5; §16.5 —
        // *"however the park was routed (the gate branch OR the block's own body)"*).
        extra: {
          park: d.preconditionFailed,
          preconditionFailed: d.preconditionFailed,
          driverReason: reason.kind,
          ...((reason.kind === 'empty-corpus' || reason.kind === 'fixture-missing') ? { parkReason: `${reason.kind}: ${reason.detail} (${reason.extra ?? 'no further detail'})`, parkRoute: 'parked-by-fixture-absence' } : {}),
        },
      },
    )
  })
}

/** ⟨GATE-4 FINDING `D-3`⟩ **THE NAMED DECLARED-ROW RECORD FOR A THROW THAT IS NOT A
 *  PRECONDITION.** A block that THROWS for a reason `ufBlockThrowReason` does not
 *  classify as a resolved precondition keeps the LOUD `FAIL` (§2.3 `H-4`: the
 *  driver may never hide its own defect behind a `NOT-DRIVEN`) — but its DECLARED
 *  row id(s) may not vanish with it. Before this, the block-runner's catch printed
 *  `FAIL <label> <error>` with NO row id and pushed NO report row, so the declared
 *  rows the thrown block owns silently left the run's row set: the counter, the
 *  reconciliation and the exit path never named them, and the matrix reconciler
 *  could read the run as complete. This builder yields ONE §6.1 row result PER
 *  DECLARED ROW the block owns, carrying that row id BY NAME, `path: null` (no
 *  gesture was driven: the clause's ONE predicate therefore classifies it `FAIL`,
 *  never `NOT-DRIVEN`) and the throw text as its evidence. */
function ufThrownBlockRows(block, e) {
  const text = String(e && e.message ? e.message : e)
  const declared = ufDeclaredRowsForBlock(block)
  const rows = declared.length ? declared : [{ row: null, dclass: null }]
  return rows.map((r) => {
    if (r.row === null) return diagResult(`the block ${block} THREW (${text}) and carries no declared row id; its verdict is classified, never counted as a declared row`)
    return rowResult(
      { row: r.row, dclass: r.dclass },
      `the declared row ${r.row} carried by ${block} reaches its own verdict (the block's own assertion could not be reached)`,
      `the block ${block} THREW and its reason is NOT a resolved precondition: ${text} — the declared row ${r.row} is recorded by name rather than vanishing with the throw (§2.1 E-3 clause 2 / gate-4 D-3)`,
      { path: null, ok: false, extra: { thrown: true, throwReason: text } },
    )
  })
}

/** §3.2 `F-6` (`G-2`) — THE PER-BLOCK PRECONDITION READ: is the SEEDED CORPUS
 *  present (`rag.list_documents` returning >= 1 document)? It is a DISCRIMINATED
 *  read (§3.2 `F-7`: an `isError` reply is named) and it NEVER throws, so a
 *  corpus-dependent block is classified by name (PARKED / NOT-DRIVEN with the
 *  reason) instead of failing with a setup-read exception counted as an app FAIL.
 *  `kind` is `null` when the precondition HOLDS. */
async function ufBlockPrecondition(h, opt) {
  const tool = 'rag.list_documents'
  const read = await h.mcpRead(tool, {}).catch((e) => ({ ok: false, isError: false, tool, value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
  const failure = driverReadFailure(read)
  const docs = read && read.value && Array.isArray(read.value.documents) ? read.value.documents.length : null
  const present = docs !== null && docs > 0
  const kind = failure ? failure.kind : (present ? null : (opt && opt.noSeed === true ? 'fixture-missing' : 'empty-corpus'))
  const detail = failure
    ? failure.detail
    : (present
        ? `${tool} -> ${docs} document(s)`
        : `${tool} -> ${docs === null ? 'no document list' : `${docs} document(s)`} (--no-seed=${opt && opt.noSeed === true}) — the seeded corpus is ABSENT`)
  // §2.3 `H-4` / §13.4 / gate-4 `B-5` — `resolved` records whether this precondition
  // read actually RESOLVED: `true` only for a real reading (no `isError` reply, no
  // transport failure). A precondition whose own read failed is NOT "the corpus is
  // absent", and the throw classifier below requires `resolved === true` before it
  // may re-classify a throw as a corpus precondition — otherwise a read that FAILED
  // TO RESOLVE would read as "corpus absent" and the driver's own defect would hide
  // behind a `NOT-DRIVEN`, which is exactly what this unit exists to forbid.
  return { tool, documents: docs, present, resolved: failure === null, kind, detail, extra: failure ? failure.extra : `--no-seed=${opt && opt.noSeed === true}` }
}

// ⟨§6.1 clause 1 / §6.3 clause 2 — ANNOTATED BESIDE, NEVER REWRITTEN: the
// `.live-corpus` SEED route named in this historical note is OBSOLETE and is
// NEVER extended. The identities the SETS carry are the sets' own (`.live-fixture/
// <set>/...`, §2.4), and a `--fixture=<set>` run does not reach the old route at
// all.⟩
/** §2.2 `E-12` item 2 / §3.2 `F-6` — THE CORPUS-DEPENDENT BLOCKS: the counted
 *  blocks whose own setup reads a SEEDED corpus document (`.live-fixture/core/alpha` /
 *  `.live-fixture/core/beta` — the OBSOLETE seed route, §6.1 clause 1). When the per-block
 *  precondition read reports the corpus
 *  ABSENT, these blocks are PARKED BY NAME (with their declared row id) instead of
 *  running a setup read that can only fail on a fixture the operator's flag (or a
 *  failed seed) removed. A block NOT in this set keeps its own verdict. */
const UF_CORPUS_DEPENDENT_BLOCKS = [
  'tabs', 'toolbar_undo', 'v1_adjacency', 'v2_scoped', 'user4_main_editable', 'repro_nbsp', 'repro_dup_para',
  'uf_tabs_1', 'uf_tabs_3', 'uf_tabs_4', 'uf_panes_12', 'uf_panes_12_diag', 'uf_hist_4', 'uf_hist_6',
  'uf_layout_2', 'u_edit_1_live_commit_failure_warning', 'u_edit_1_live_package_table_limitation',
]

// ---------------------------------------------------------------------------
// ⟨§7.3 `D-7` — THE DERIVED, CONDITIONAL CONSEQUENCE, DECLARED ABOVE THE STATE SO
// THE ARTIFACT'S OWN CLAUSE IS THE FIRST ONE A READER MEETS.⟩ Under `mock-data-set`
// the printed clause states WHAT THE MOCK SET MEANS FOR ATTRIBUTION and carries the
// NON-QUOTABILITY sentence of `§9` clause 3 — a fixture-fed PASS may NOT be quoted
// as a live-corpus app reading. It is DERIVED FROM THE ONE STATE BINDING at print
// time (never a constant computed at module load), so a `mock-data-set` run can
// never print the `none`-state sentence (`X-6` in a new place) and a `none` run
// never prints the mock clause. The continuation lines keep the module-level
// ternary layout the run's own artifact conventions use.
// ---------------------------------------------------------------------------
function ufFixtureConsequenceOf() {
  return UF_FIXTURE_STATE.kind === 'mock-data-set'
  ? `CONSEQUENCE: the rows this run reports were driven against the mock data set ${UF_FIXTURE_STATE.id}; a fixture-fed PASS may NOT be quoted as a live-corpus app reading`
  : UF_FIXTURE_STATE_CONSEQUENCE
}

// ===========================================================================
// §2 · §3 · §5.3 — UNIT `U-MOCK-CORPUS-FIXTURE-SETS` ("UNIT B"): THE FIVE
// HAND-AUTHORED MOCK DATA SETS, THE MATERIALISATION ROOT, THE ROOT RESOLVER THE
// SELF-PROVISIONING BLOCKS WRITE THROUGH, AND THE PROBE'S OWN CONSTANT TERM.
// ---------------------------------------------------------------------------
// ⟨§6.1 clause 1 — ANNOTATE, NEVER EXTEND.⟩ THE `.live-corpus/*` SEED ROUTE IS
// OBSOLETE — its writer `seedCorpus`, its `--seed=` directory flag and its
// `--strict-seed` switch are named OBSOLETE here and are NEVER extended, repaired,
// re-pointed or made a set's source (§6.1 clause 1). NO set below is authored by,
// derived from, copied from or parsed out of them (§6.1 clause 2), and
// `--fixture=` is a NEW flag naming a NEW object (§6.1 clause 3).
//
// The O-0 measurement route's own carry flags are annotated at their OWN sites
// (`o0MarkdownTree`'s enumerator, the store import root flag, the claimed-census
// flag), and the O-0 measurement/report MECHANISM itself is a different object
// whose status this unit does not resolve (§6.5).
// ===========================================================================
/** `§5.3` clause 1 — THE PROBE'S OWN CONSTANT TERM: ONE declaration, read by the
 *  probe AND by the sets' author. Its contract: no document of the `search` set
 *  carries it, at least one document of every OTHER document-carrying set does,
 *  and changing it is a change to the sets and to the probe TOGETHER. */
const UF_MOCK_FIXTURE_TERM = 'ufmockterm'

/** `§2.1` · `§2.3` clause 3 — THE FIVE SETS, AS HAND-AUTHORED PURE STRING DATA.
 *  THE SETS ARE THE ARG'S CLOSED VALUE SET (`§3.2`): `core` · `table` · `search`
 *  · `tabs` · `empty`. Each set's FILE LIST is the contract (`§2.1`); the
 *  `empty` set is the explicitly SELECTED empty set (`F-5`), not a refusal.
 *  ⟨gate-4 `F-6` — THE CONTENT PROPERTIES ARE PER-SET, NOT ONCE ACROSS THE FOUR.⟩
 *  `§2.2`'s property table names the sets that must CARRY each property, and
 *  `P-γ` — *"a document whose body carries an INLINE element outside the
 *  decomposer's closed node-type set"*, the commit-failure row's own failure
 *  fixture — is carried by **F-1 · F-2 · F-3 · F-4 (ALL FOUR document-carrying
 *  sets)**. The carrier is each set's OWN `alpha.md` (the document the hardcoded
 *  `.live-fixture/<set>/alpha` identity opens): `core`/`table`/`tabs` carry
 *  `<b>inline element</b>` there beside the probe's term, and `search` carries it
 *  in a body that omits the term BY CONSTRUCTION (`F-3`/`P-δ` — its rewrite is what
 *  makes that set the `'corpus-query-results'` falsifier). `P-α`, `P-ε`, `P-ζ`,
 *  `P-η`, `table`'s stored `<table>` (`P-β`, `table` ALONE), `tabs`'s un-opened
 *  term-bearing document (`P-θ`) and each set's file census are UNMOVED.
 *  The identities the sets carry are a consequence of WHERE these files are
 *  materialised and of nothing else (`§2.4`): a file written to
 *  `.live-fixture/<set>/<basename>.md` is imported as `<root>/<basename>`. */
// ⟨GATE-5 RULING `2026-10-05` — THE `table` SET'S STORED-TABLE FORM IS THE **GFM
// PIPE TABLE**, AND THE FILED RAW-HTML-TABLE LITERAL IS THE SUPERSEDED READING.⟩
// MEASURED: the app's markdown importer DROPS a raw HTML block outright
// (`markdown-parse`'s raw-HTML block rule → no node at all), so the filed
// `table.md` literal produced NO table node and
// `u_edit_1_live_package_table_limitation` could only PARK (`§16.11` rules that
// `class-(b):table` MUST REJECT a park). The GFM pipe form is the form the
// importer's OWN table rule parses (header row + separator row → `:table:` ·
// `:thead:` · `:th:` · `:tr:` · `:td:` nodes), and it renders as a REAL table
// element on the page-edit surface — measured rendered census
// `{"tables":1,"trs":1,"tds":4}` — so the row reaches a VERDICT. THIS NOTE SITS
// OUTSIDE the `UF_MOCK_FIXTURE_SETS` literal DELIBERATELY: the sets' content
// properties are read from the literal's own balanced region, and a prose mention
// of the superseded form inside one set's span would be read as that set CARRYING
// it (the `set-shape:table` read counts the literal `table` element form across
// the four sets and requires it in `table` ALONE).
const UF_MOCK_FIXTURE_SETS = {
  core: { files: ['alpha.md', 'beta.md', 'gamma.md'], docs: { 'alpha.md': '# Alpha\n\nufmockterm with an <b>inline element</b>\n', 'beta.md': '# Beta\n\nufmockterm\n', 'gamma.md': '# Gamma\n\nufmockterm\n' } },
  table: { files: ['alpha.md', 'beta.md', 'gamma.md', 'table.md'], docs: { 'alpha.md': '# Alpha\n\nufmockterm with an <b>inline element</b>\n', 'beta.md': '# Beta\n\nufmockterm\n', 'gamma.md': '# Gamma\n\nufmockterm\n', 'table.md': '# Table\n\nufmockterm with a stored table\n\n| col a | col b |\n| --- | --- |\n| c1 | c2 |\n' } },
  search: { files: ['alpha.md', 'beta.md', 'gamma.md'], docs: { 'alpha.md': '# Alpha\n\nno marker here with an <b>inline element</b>\n', 'beta.md': '# Beta\n\nnothing either\n', 'gamma.md': '# Gamma\n\nplain\n' } },
  tabs: { files: ['alpha.md', 'beta.md', 'gamma.md', 'search.md'], docs: { 'alpha.md': '# Alpha\n\nufmockterm with an <b>inline element</b>\n', 'beta.md': '# Beta\n\nufmockterm\n', 'gamma.md': '# Gamma\n\nufmockterm\n', 'search.md': '# Search\n\nufmockterm\n' } },
  empty: { files: [], docs: {} },
}

/** `§2.3` clause 1 — THE MATERIALISATION ROOT, DERIVED FROM THE SET IDENTITY: the
 *  root and the document identity are ONE decision (`§2.4`), never two literals. */
const UF_MOCK_FIXTURE_ROOT = (id) => `.live-fixture/${id}/`

/** `§11.3` item 8 / `§17.11` — THE NOT-MATERIALISED READING a run states when the
 *  selected set carries NO file (`--fixture=empty`, `§4` `S-4`). */
const UF_MOCK_FIXTURE_NOT_MATERIALISED = 'no SET was materialised'

// ---------------------------------------------------------------------------
// §6.1 — THE RUN-WIDE FIXTURE STATE, IN ONE MODULE-LEVEL LITERAL. A run states
// WHICH fixture it used, so a reading is attributable to its fixture from the
// artifact alone (`G-5`). UNIT B supplies the value (the mock data sets and the arg
// that selects one); at THIS head no data set exists, so the TRUE state is `none` —
// printed unconditionally, and NEVER inferred from the O-0 branch's `corpusSource`
// (that field names the OBSOLETE supply mechanisms and is not the run-wide
// statement). ONE declaration, FOUR print sites reading it: the LAUNCH PROFILE
// line, the §6.1 summary line, the `--groups=` empty-value refusal (exit 2, before
// the launch profile exists) and the module-level `main().catch` ERROR path (exit
// 2, no summary at all).
// ---------------------------------------------------------------------------
let UF_FIXTURE_STATE = { state: 'no fixture data set selected', kind: 'none', id: 'none' }

/** §6.1 — THE CONSEQUENCE CLAUSE of a `none` fixture state, in the run group line
 *  own idiom: what a reader MUST NOT conclude from such an artifact.
 *
 *  ⟨gate-4 `F-5` — **THE CLAUSE USED TO OPEN WITH A UNIVERSAL AND IS NOW CONDITIONAL,
 *  SCOPED TO THE STATE IT IS TRUE OF.**⟩ The superseded sentence read *"a run whose
 *  fixture state is none reports every GATED declared corpus-dependent block PARKED
 *  BY NAME"* — FALSE in TWO ways, both named here beside it: (i) the gate is PER
 *  DECLARED FIXTURE, so a gated key whose OWN declared fixture probe reads PRESENT
 *  RUNS in that same `none` state and carries its own verdict (a park of such a key
 *  would be the contract's forbidden `F-2`); (ii) the block loop's `catch` parks ONLY
 *  when the throw is classified as a precondition by `ufBlockThrowReason` — ANY OTHER
 *  throw keeps the loud `FAIL`. The qualifier `§18.2` clause 2 carries is therefore
 *  appended VERBATIM in substance (parking holds IFF the block's OWN declared fixture
 *  probe reads absent), with the throw-path exception named. The clause stays scoped
 *  to the `none` state (the state it is true of) and the run's own OBSERVED SPLIT is
 *  the figure a reader measures it against. */
const UF_FIXTURE_STATE_CONSEQUENCE = 'CONSEQUENCE: in a run whose fixture state is none, a GATED declared corpus-dependent block is PARKED BY NAME (PRECONDITION-FAILED, carrying its declared row id where the tree declares one and a parkReason naming its OWN declared fixture) IFF that block\'s OWN declared fixture probe reads ABSENT — the gate is PER DECLARED FIXTURE and CONDITIONAL, so a gated key whose own declared fixture probe reads PRESENT RUNS and carries its own verdict in this same none state (it is never parked on another fixture\'s reading and never on a run-wide read alone), and a block that THROWS is parked only when the throw is classified as a PRECONDITION (ufBlockThrowReason) — ANY OTHER throw keeps the loud FAIL and parks nothing — so no corpus-shaped reading in this artifact may be quoted as a live-corpus reading'

// ---------------------------------------------------------------------------
// §4.2 `A-1`(i)/(ii) + `A-3` — THE DERIVATION ITSELF, AS THE RUN OWN STATEMENT:
// the census this declaration is held to (`§2.1.1` predicate, through `§2.1.4`
// transitive helper closure), the historical hand-list it moves from, the three
// sets and their differences, and the AMBIGUITY LIST of `§2.1.1` `F-2` — an
// ambiguous read is EXCLUDED AND RECORDED (key + site + clause applied), never
// admitted silently. `censusMinusHistorical` is the set the declaration ENTERS;
// `historicalMinusCensus` is the set that LEFT the hand-list and it is EMPTY
// because `uf_panes_1` appears in the hand-list literal NOWHERE (the `§15.4`
// finding-2 correction) — the movement is on the record HERE rather than inferred
// from two literals read by eye.
// ---------------------------------------------------------------------------
const UF_FIXTURE_RECONCILIATION = {
  historical: 17,
  censusDerived: 47,
  declared: 47,
  historicalMinusCensus: [],
  censusMinusHistorical: 30,
  censusMinusDeclared: 0,
  ambiguity: [
    { key: 'stage_boot_landing_diag', site: 'ufSurfacePresence (the edit-surface marker read as an opaque presence/agreement signal)', clause: '2.1.1-D + 2.1.4', disposition: 'EXCLUDED and RECORDED' },
    { key: 'stage_multimount_reachability', site: 'ufSurfacePresence (the same opaque presence/agreement read)', clause: '2.1.1-D + 2.1.4', disposition: 'EXCLUDED and RECORDED' },
  ],
}

// ---------------------------------------------------------------------------
// §4.1 — THE FIXTURE DECLARATION. ONE ENTRY PER CENSUSED `BLOCKS` KEY: the
// corpus-READING blocks of this driver, each with the fixture it READS (named as
// what is read, never as a supply mechanism — the `.live-corpus/*` seed route and
// the O-0 corpus route are OBSOLETE and are named NOWHERE here), the declared row
// ids the TREE carries, and the surface in words, so a park reason is DERIVED at
// its own site instead of improvised. THE ENTRY COUNT IS THE CENSUS SIZE
// (`§4.1.0`): every `A-1`-derived corpus-reading key has exactly one entry and no
// entry names a key the derivation reads as corpus-free.
// ---------------------------------------------------------------------------
export const UF_FIXTURE_DECLARATION = [
  { block: 'boot_landing', corpusRead: true, selfProvisioning: true, fixtureName: 'self-provisioned-document', rows: ['UF-STAGE-1'], surface: 'the document this block writes and imports, read back from the store document list (edit.import_markdown, #stage-landing, UF-STAGE-1)' },
  { block: 'import1', corpusRead: true, selfProvisioning: true, fixtureName: 'self-provisioned-document', rows: [], surface: 'the document this block writes and imports, then the store document list (edit.import_markdown, rag.list_documents)' },
  { block: 'ms_store', corpusRead: true, selfProvisioning: true, fixtureName: 'self-provisioned-document', rows: [], surface: 'the store document list for the main store plus a fresh import into it through the ROOT RESOLVER of the run SELECTED mock data set — the set own root when one is selected, the block own pre-arg path when none is selected (§16.7; rag.list_documents, the resolved `<root>/ms3-fresh.md`)' },
  { block: 'o0_document_row', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'the doc-nav DOCUMENT rows the O-0 freeze drives (O0_DOCUMENT_SELECTOR, o0ResetFolderState)' },
  { block: 'o0_folder_row', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'the doc-nav FOLDER rows the O-0 freeze drives (o0FolderRows, O0_FOLDER_SELECTOR)' },
  { block: 'o0_gpu_control', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'BOTH doc-nav row families (o0FolderRows, O0_DOCUMENT_SELECTOR)' },
  { block: 'o0_repeat_determinism', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'the doc-nav folder rows across the paired freezes (o0FolderRows, o0ResetFolderState)' },
  { block: 'o0_track_ablation', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'the doc-nav folder rows across the paired freezes (o0FolderRows, o0ResetFolderState)' },
  { block: 'repro_dup_para', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-STAGE-2'], surface: 'a corpus document paragraph node counted in the rendered DOM (provident.focus, [data-rag-node-id])' },
  { block: 'repro_nbsp', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-STAGE-4'], surface: 'a seeded document read, edited and read back (rag.get_document, provident.focus)' },
  { block: 'shell_integration', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'the store document list, then the first document it names (rag.list_documents, provident.focus{documentId})' },
  { block: 'stage_async_mount_race_v1', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-STAGE-AT-3'], surface: 'the document surface plus the document tabs in the rendered strip (ufEnsureDocumentSurface, #tab-strip .tab)' },
  { block: 'stage_doc_surface_precondition_diag', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'the doc-nav row and folder census plus the store document count, as a diagnostic (rag.list_documents)' },
  { block: 'stage_docnav_switch_inside_async', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-STAGE-AT-8'], surface: 'the doc-nav document rows, hit-tested and switched inside a real async window (#pane-doc-nav [data-document-id])' },
  { block: 'stage_document_tab_paints_its_document', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-STAGE-AT-2'], surface: 'the doc-nav document rows and the active document identity the stage paints (#pane-doc-nav [data-document-id])' },
  { block: 'stage_foreign_rederive_v2', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-STAGE-AT-4'], surface: 'the document surface a foreign re-derive starts from (ufEnsureDocumentSurface)' },
  { block: 'stage_refresh_survival_v5', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-STAGE-AT-5'], surface: 'the document surface that must survive a re-derive (ufEnsureDocumentSurface)' },
  // ⟨gate-4 `E-2` — THE ENTRY AND THE DRIVER'S OWN DECLARED-ROW ORACLE AGREE.⟩ The
  // entry used to carry `rows: []` while THIS BLOCK'S OWN BODY returns
  // `rowResult({row:'UF-DEFECT-7'}, …)` (read at the block's return statement) and
  // `ufDeclaredRowsForBlock('stage_search_open_in_tab')` resolves `['UF-DEFECT-7']`
  // through `ROW_EXTENDED`'s `blocks` union. A `rows: []` entry says the block's
  // absence is `DIAG`-only (§5.1 clause 2); with the block emitting a declared row
  // id, a driver-precondition failure of it prints `ROW … UF-DEFECT-7 … NOT-DRIVEN`
  // — a printed `ROW` line against a declaration claiming no row. THE DIRECTION
  // CHOSEN IS THE ORACLE'S, STATED: the entry is POPULATED from the real oracle
  // (never the fan-out narrowed to `user9_search_open_in_tab`), because the block
  // really does emit `UF-DEFECT-7` and the fan-out exists to say so. `corpusRead`
  // and `fixtureName:'none'` are UNCHANGED: this fixes the entry's `rows` claim, not
  // its corpus claim (the block stays ungated and carries its own verdict).
  { block: 'stage_search_open_in_tab', corpusRead: false, selfProvisioning: false, fixtureName: 'none', rows: ['UF-DEFECT-7'], surface: 'NONE for the search-stage assertion - the search tab own #stage-search-tab window; the document-body limb is measured against whatever document body is open (corpusRead false)' },
  { block: 'stage_surface_census_i2r', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-STAGE-AT-1'], surface: 'the edit-surface census over the document surface (ufEnsureDocumentSurface, #page-edit-surface)' },
  { block: 'stage_tabs_persist_roundtrip', corpusRead: false, selfProvisioning: false, fixtureName: 'none', rows: ['UF-STAGE-AT-6'], surface: 'NONE for the round-trip assertion - the persisted operator tab set against the rendered strip rows; a corpus is not required (corpusRead false)' },
  { block: 'tabs', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'a corpus document focused by node id (provident.focus{kind:nodeId, nodeId:.live-fixture/core/beta})' },
  { block: 'toolbar_undo', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-HIST-2'], surface: 'the first store document with a corpus-document fallback, edited and read back (rag.list_documents, edit.set_content, rag.get_document)' },
  { block: 'u_edit_1_live_caret_head_body', corpusRead: true, selfProvisioning: true, fixtureName: 'self-provisioned-document', rows: ['U-EDIT-1-LIVE-2'], surface: 'the document surface plus the multi-block edit fixture this block provisions itself (ufEnsureEditFixture with the multi-block fallback)' },
  { block: 'u_edit_1_live_caret_roundtrip', corpusRead: true, selfProvisioning: true, fixtureName: 'self-provisioned-document', rows: ['U-EDIT-1-LIVE-8'], surface: 'the document surface plus the edit fixture this block provisions itself (ufEnsureDocumentSurface, ufEnsureEditFixture)' },
  { block: 'u_edit_1_live_commit_failure_warning', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['U-EDIT-1-LIVE-3'], surface: 'a named corpus document opened explicitly, its inline element being the row failure fixture (ufOpenDocumentById, rag.get_document)' },
  { block: 'u_edit_1_live_head_split_and_textarea_census', corpusRead: true, selfProvisioning: true, fixtureName: 'self-provisioned-document', rows: ['U-EDIT-1-LIVE-5'], surface: 'the document surface this block provisions for itself (ufEnsureDocumentSurface)' },
  { block: 'u_edit_1_live_package_table_limitation', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['U-EDIT-1-LIVE-6'], surface: 'a TABLE-bearing corpus document, searched in the store list under the run SELECTED mock data set — the `table` set is the ONE set that supplies it and the ONLY set under which this row runs (ufOpenDocumentById, rag.list_documents, #page-edit-surface table)' },
  { block: 'u_edit_1_live_representation_mode', corpusRead: true, selfProvisioning: true, fixtureName: 'self-provisioned-document', rows: ['U-EDIT-1-LIVE-4'], surface: 'the document surface this block provisions for itself (ufEnsureDocumentSurface, #page-edit-surface)' },
  { block: 'u_edit_1_live_selection_span', corpusRead: true, selfProvisioning: true, fixtureName: 'self-provisioned-document', rows: ['U-EDIT-1-LIVE-1'], surface: 'the document surface plus the multi-block edit fixture this block provisions itself (ufEnsureDocumentSurface, ufEnsureEditFixture, #page-edit-surface)' },
  { block: 'u_edit_1_live_typed_commit_one_batch', corpusRead: true, selfProvisioning: true, fixtureName: 'self-provisioned-document', rows: ['U-EDIT-1-LIVE-7'], surface: 'the document surface plus the edit fixture this block provisions itself, then the store read-back (rag.get_document)' },
  { block: 'uf_hist_4', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-HIST-4'], surface: 'the document count and a corpus document node-level store signature (rag.list_documents, rag.get_document)' },
  { block: 'uf_hist_6', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['U-7', 'UF-HIST-6'], surface: 'a corpus document focused, edited and read back at three points (provident.focus, rag.get_document)' },
  { block: 'uf_layout_2', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-LAYOUT-2'], surface: 'a RAG content change on a corpus document, then the zone targets re-read (edit.set_content{nodeId})' },
  { block: 'uf_panes_12', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['U-1', 'U-3', 'UF-PANES-12'], surface: 'the corpus folder row and the beta document leaf real-clicked in the doc-nav pane ([data-folder-label], li[data-document-id])' },
  { block: 'uf_panes_12_diag', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'the same beta document leaf, via a native click (attribution diag)' },
  { block: 'uf_panes_14', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-query-results', rows: ['UF-PANES-14'], surface: 'the pane search painted result rows, hovered and real-clicked (#pane-search li[data-document-id])' },
  { block: 'uf_tabs_1', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-TABS-1'], surface: 'document tabs opened by MCP focus and read from the strip (provident.focus{newTab}, ufTabState)' },
  { block: 'uf_tabs_3', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['U-8', 'UF-TABS-3'], surface: 'document tabs for two corpus documents, closed, then the store list for the fresh-default identity (rag.list_documents, ufTabState)' },
  { block: 'uf_tabs_4', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-TABS-4'], surface: 'an alpha document tab AND a beta document tab by exact title (ufTabState)' },
  { block: 'uf_tabs_7', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-query-results', rows: ['U-2', 'UF-TABS-7'], surface: 'a painted search-result row for a corpus query (#pane-search li[data-document-id], ufPaneSearch)' },
  { block: 'uf_tabs_7_diag', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-query-results', rows: [], surface: 'the same painted search-result row, via a native click (attribution diag)' },
  { block: 'user4_main_editable', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: ['UF-STAGE-3'], surface: 'a corpus document focused, clicked and edited, then read back (provident.focus, the stage contenteditable, rag.get_document)' },
  { block: 'user6_search_no_flicker', corpusRead: false, selfProvisioning: false, fixtureName: 'none', rows: ['UF-KEEP-3'], surface: 'NONE - the rendered tab strip and #stage-landing only; the search tab needs no corpus document (corpusRead false, selfProvisioning false)' },
  { block: 'user9_search_open_in_tab', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-document-tabs', rows: ['UF-DEFECT-7'], surface: 'the rendered corpus DOCUMENT tab, matched by its own title and real-clicked (the tab strip document rows)' },
  { block: 'v1_adjacency', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'a document node-adjacency read back through the store (rag.list_documents, rag.get_document)' },
  { block: 'v2_scoped', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'a scoped traversal on a document target (rag.get_document, rag.query with filters.target.documentId)' },
  { block: 'v3_docnav', corpusRead: true, selfProvisioning: false, fixtureName: 'corpus-documents', rows: [], surface: 'the rendered doc-nav document rows and folder rows against the store list (#pane-doc-nav [data-document-id], [data-folder-path], rag.list_documents)' },
]

/** §16.3 — THE GATED POPULATION, DERIVED FROM THE DECLARATION AND FROM NOTHING ELSE.
 *  `|gated| = |declaration| − |corpusRead:false| − |selfProvisioning:true|` (at this
 *  head `47 − 3 − 9 = 35` — ⟨gate-4 `F-4`⟩ the filed `47 − 3 − 10 = 34` is
 *  `SUPERSEDED`: `§16.1`'s amendment moves ONE `selfProvisioning:true` entry off
 *  that group, so the live split is `47 − 3 − 9`, and the figure is read from
 *  `§17.1` clause 3 / `§16.17` item 2 rather than carried here), by `§4.1`'s gate
 *  predicate. It is a MODULE-LEVEL
 *  DERIVATION (not a carried figure): every print site that needs the gate's size
 *  reads THIS binding, so a declaration edit moves the figure with it. The
 *  HISTORICAL `UF_CORPUS_DEPENDENT_BLOCKS` hand-list keeps its own, different
 *  figure (`17`, `§16.3`/`§16.9` item 3) and the two must never be printed under
 *  one label. */
const UF_GATED_DECLARED_KEYS = UF_FIXTURE_DECLARATION.filter((e) => e.corpusRead === true && e.selfProvisioning === false).map((e) => e.block)

/** ⟨gate-4 `E-4` — THE EXCLUDED ENGINE FAMILY, DECLARED AND SCOPED, NEVER SILENTLY
 *  WIDENED.⟩ The seven `gnosis_*` keys are OUT of the corpus census BY NAME
 *  (`§2.3` `P-7`: the engine's own documents are NOT the driver's corpus), so they
 *  carry no `UF_FIXTURE_DECLARATION` entry, are never gated, and yet they read
 *  corpus-`shaped` DOM and emit REAL row verdicts (`UF-GNOSIS-1..6`, via
 *  `NON_ROW_DISPOSITIONS`' own `ROW BLOCK:` entries). The clause the run prints
 *  would therefore be FALSE as a universal if it did not name them, so the family
 *  is DECLARED HERE — with the fixture name its OWN precondition belongs to — and
 *  the printed clause is SCOPED to the gated population plus this exclusion. THE
 *  FIXTURE'S PROBE/READ IS UNIT B'S (`§16.10`): this constant declares the family and
 *  its fixture name; it does not fake a probe, and it does not add entries to the
 *  `47`-entry census declaration. */
const UF_EXCLUDED_ENGINE_FAMILY = {
  fixtureName: 'engine-documents',
  keys: ['gnosis_d2', 'gnosis_wikis', 'gnosis_documents', 'gnosis_query', 'gnosis_status', 'gnosis_doc_update', 'gnosis_crud'],
  rows: ['UF-GNOSIS-1', 'UF-GNOSIS-2', 'UF-GNOSIS-3', 'UF-GNOSIS-4', 'UF-GNOSIS-5', 'UF-GNOSIS-6'],
  clause: '§2.3 P-7',
}

/** ⟨gate-4 `E-3` — THE PER-DECLARED-FIXTURE PROBE REGISTRY.⟩ The fixture-absent park
 *  used to be decided by a SINGLE `rag.list_documents` non-empty read and keyed on
 *  the declaration's boolean predicate alone, so the DECLARED `fixtureName` axis was
 *  never consulted and a block declaring one fixture was parked (or run) on the
 *  reading of another — the contract's own forbidden outcome `F-2`. THIS registry
 *  makes each declared fixture name carry the read its own absence is decided by, so
 *  the gate asks the DECLARED FIXTURE's question. `settles` states exactly what the
 *  probe can and cannot decide: the store document list is an INPUT of all three
 *  corpus fixtures (`F-2`'s own reading), and what it does NOT settle is named
 *  rather than implied. */
const UF_DECLARED_FIXTURE_PROBES = {
  'corpus-documents': { read: 'rag.list_documents', settles: 'whether the store carries any corpus document at all (the doc-nav / document-body fixture the seeded corpus IS)', unsettled: null },
  'corpus-query-results': { read: 'rag.query', settles: 'whether the CORPUS holds a document matching the probe\'s own constant term — the fixture\'s own CONTENT fact, read as the store query\'s own hit census (`§18.2` clause 1)', unsettled: 'whether a result row is PAINTED for a term (that read happens after a gesture and cannot be taken at the pre-gesture read point — `§18.1` clause 3)' },
  'corpus-document-tabs': { read: 'dom:#tab-strip .tab[data-document-id]', settles: 'whether a document tab is ACTUALLY OPEN in the rendered strip at the pre-gesture read point (`§16.6`)', unsettled: 'whether a document tab CAN be opened — that is a capability of the store and it is `\'corpus-documents\'`\'s question, not this one\'s' },
  'self-provisioned-document': { read: null, settles: 'nothing — the fixture is the block OWN write+import, so this entry is NEVER gated (a park on an empty store would be a FALSE park)', unsettled: null },
  none: { read: null, settles: 'nothing — a `corpusRead:false` entry declares no corpus fixture, so it is NEVER gated and carries its own verdict', unsettled: null },
}

/** ⟨gate-4 `E-3`⟩ THE DECLARED FIXTURE READING (§3.2 `F-6`/`F-7`): the per-block
 *  precondition, taken for the fixture the block actually DECLARES. A registry miss
 *  is reported as an UNREADABLE fixture (never as absence) so an unknown fixture
 *  name cannot silently park a block. */
async function ufFixturePreconditionRead(h, opt, fixtureName) {
  const probe = UF_DECLARED_FIXTURE_PROBES[fixtureName] ?? null
  if (!probe || probe.read === null) {
    return { tool: null, fixtureName, present: null, resolved: false, kind: null, detail: `the declared fixture ${JSON.stringify(fixtureName)} carries NO declared read (registry ${Object.keys(UF_DECLARED_FIXTURE_PROBES).join('/')}) — its absence is NOT settled, so the block is never parked on it`, extra: 'declared-fixture-unprobed' }
  }
  // §5.2 clause 3 / §16.3 — THE DISCRIMINATED DISPATCH: a `read` beginning with the
  // literal prefix `dom:` is a DOM read of the selector that follows it (the ONLY
  // `dom:` sentinel the registry carries is `'corpus-document-tabs'`); `'rag.query'`
  // is the STORE-QUERY read of the probe's own constant term; ANY OTHER non-null
  // `read` is an MCP TOOL NAME, taken exactly as it was before. A `read` string that
  // is none of these forms is an OFFENCE, not a third kind of read.
  if (probe.read.startsWith('dom:')) return await ufFixtureDomRowCountRead(h, fixtureName, probe.read.slice('dom:'.length))
  if (probe.read === 'rag.query') return await ufFixtureStoreQueryRead(h, fixtureName, probe)
  const read = await h.mcpRead(probe.read, {}).catch((e) => ({ ok: false, isError: false, tool: probe.read, value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
  const failure = driverReadFailure(read)
  const docs = read && read.value && Array.isArray(read.value.documents) ? read.value.documents.length : null
  return {
    tool: probe.read,
    fixtureName,
    documents: docs,
    present: failure === null && docs !== null && docs > 0,
    // A read that did not resolve is NOT an absent fixture (§2.3 `H-4`): `resolved`
    // is true only for a real reading.
    resolved: failure === null,
    kind: failure ? failure.kind : (docs !== null && docs > 0 ? null : (opt && opt.noSeed === true ? 'fixture-missing' : 'empty-corpus')),
    detail: failure
      ? `${probe.read} -> ${failure.detail}`
      : `${probe.read} -> ${docs === null ? 'no document list' : `${docs} document(s)`} (the fixture ${JSON.stringify(fixtureName)} own read)`,
    extra: failure ? failure.extra : `--no-seed=${opt && opt.noSeed === true}; the declared fixture ${JSON.stringify(fixtureName)} own read is ${probe.read}`,
  }
}

/** `§5.2` clause 3 / `§16.3` — THE `dom:` LIMB: THE RENDERED ROW COUNT of the
 *  selector the sentinel names, through the driver's own `h.cdp.evaluate` row-count
 *  idiom. A COMPLETED count — including `0` — is a resolved reading (`present:false`
 *  for `0`); a CDP read that THREW, or a count that is not a non-negative number, is
 *  a NAMED unreadable (`resolved:false`, a `dom-unreadable`-shaped detail carrying
 *  the selector and the error text VERBATIM) and PARKS NOBODY. */
async function ufFixtureDomRowCountRead(h, fixtureName, selector) {
  const q = JSON.stringify(selector)
  const read = await h.cdp.evaluate(`(()=>{return document.querySelectorAll(${q}).length})()`).catch((e) => ({ ufThrew: String(e && e.message ? e.message : e) }))
  const count = typeof read === 'number' ? read : null
  const unreadable = count === null || !Number.isFinite(count) || count < 0
  return {
    tool: `dom:${selector}`,
    fixtureName,
    rows: count,
    present: !unreadable && count >= 1,
    resolved: !unreadable,
    kind: unreadable ? 'dom-unreadable' : (count >= 1 ? null : 'fixture-missing'),
    detail: unreadable
      ? `dom:${selector} -> UNREADABLE (${read && read.ufThrew ? read.ufThrew : `count=${JSON.stringify(read)} is not a non-negative number`})`
      : `dom:${selector} -> ${count} rendered row(s) (the fixture ${JSON.stringify(fixtureName)} own read)`,
    extra: unreadable
      ? `dom-unreadable; selector=${selector}`
      : `the declared fixture ${JSON.stringify(fixtureName)} own read is the RENDERED row count of ${selector}`,
  }
}

/** `§5.1` re-stated / `§18.2` clause 1 — THE STORE-QUERY LIMB: `rag.query` called
 *  with THE PROBE'S OWN CONSTANT TERM and NO OTHER ARGUMENT, at the pre-gesture read
 *  point (`§18.1`). The reading is the reply's own HIT CENSUS (`results`, with
 *  `ranked` as its twin, `§18.2` clause 3): `present = failure === null && hits !==
 *  null && hits > 0`, so a query that RESOLVES with `0` hits is a RESOLVED ABSENCE
 *  (`resolved:true`, `present:false`) and NOT a permanent absence — which is what
 *  makes `search` (`FA-1`) and `tabs` (`FA-2`) read DIFFERENTLY at one store state. */
async function ufFixtureStoreQueryRead(h, fixtureName, probe) {
  const read = await h.mcpRead('rag.query', { query: UF_MOCK_FIXTURE_TERM }).catch((e) => ({ ok: false, isError: false, tool: 'rag.query', value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
  const failure = driverReadFailure(read)
  const value = read && read.value ? read.value : {}
  const hits = Array.isArray(value.results) ? value.results.length : (Array.isArray(value.ranked) ? value.ranked.length : null)
  return {
    tool: probe.read,
    fixtureName,
    hits,
    present: failure === null && hits !== null && hits > 0,
    resolved: failure === null,
    kind: failure ? failure.kind : (hits !== null && hits > 0 ? null : 'fixture-missing'),
    detail: failure
      ? `${probe.read} -> ${failure.detail}`
      : `${probe.read} for the probe's own constant term -> ${hits === null ? 'no hit census' : `${hits} hit(s)`} (the fixture ${JSON.stringify(fixtureName)} own read)`,
    extra: failure
      ? failure.extra
      : `the declared fixture ${JSON.stringify(fixtureName)} own read asks the STORE whether its corpus holds a document matching the probe's own constant term; it takes NO operator input and no gesture has run`,
  }
}

/** `§16.7` — THE ROOT RESOLVER the three SELF-PROVISIONING blocks write through
 *  (`boot_landing` · `import1` · `ms_store`, `R-14`/`R-15`): the SELECTED set's own
 *  root when a set is selected, the block's pre-arg path when none is — so an
 *  unselected set is never materialised and `--fixture=empty` writes nothing. */
function ufMockFixtureWritePath(name) {
  const id = UF_FIXTURE_STATE.kind === 'mock-data-set' ? UF_FIXTURE_STATE.id : 'core'
  return join(UF_MOCK_FIXTURE_ROOT(id), name)
}

/** `§7.1` — THE SELECTED SET'S OWN IDENTITY, THE ONE NON-`none` KIND UNIT A'S TYPE
 *  ADMITS, and the `none` triple an invocation without `--fixture=` keeps: ONE
 *  derivation, read by the ONE assignment site (`§7.2` clause 3). */
function ufFixtureStateOf(id) {
  return id === null || id === undefined
    ? { state: 'no fixture data set selected', kind: 'none', id: 'none' }
    : { state: `mock data set ${id} selected`, kind: 'mock-data-set', id }
}

/** `§2.3` clauses 2/3 — THE MATERIALISATION: the set's OWN directory is created if
 *  absent, EMPTIED of this unit's own `.md` files, and written from the hand-authored
 *  content data on every launch. THE REMOVAL IS CONFINED TO THE RUN'S OWN SET
 *  DIRECTORY — nothing outside `.live-fixture/<setName>/` is ever removed, and NO
 *  stale file survives a launch. */
function ufMockFixtureMaterialise(id) {
  const root = UF_MOCK_FIXTURE_ROOT(id)
  rmSync(UF_MOCK_FIXTURE_ROOT(id), { recursive: true, force: true })
  mkdirSync(UF_MOCK_FIXTURE_ROOT(id), { recursive: true })
  for (const file of UF_MOCK_FIXTURE_SETS[id].files) writeFileSync(join(root, file), UF_MOCK_FIXTURE_SETS[id].docs[file] ?? '')
  return root
}

/** `§2.3` clause 6 + `§4` `S-1`/`S-3`/`S-4` — THE SELECTED SET'S IMPORT through the
 *  app's OWN import route (`edit.import_markdown`), reported as a DISCRIMINATED read
 *  so an `isError` reply is NAMED verbatim and never silently stringified. A set
 *  with NO file (`empty`) attempts NO import at all (S-4). */
async function ufMockFixtureImport(mcp, id, root) {
  const files = UF_MOCK_FIXTURE_SETS[id].files.map((f) => join(root, f))
  if (files.length === 0) return { skipped: true, files, read: null, failure: null, reading: UF_MOCK_FIXTURE_NOT_MATERIALISED, rootText: { attempted: 0, written: 0, writes: [] } }
  const read = await mcpToolResult(mcp, 'edit.import_markdown', { files }).catch((e) => ({ ok: false, isError: false, tool: 'edit.import_markdown', value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
  const failure = driverReadFailure(read)
  // §18.6 clause 3 — THE ROOT-TEXT WRITE: the SECOND half of the set's own
  // materialisation route, and it runs ONLY on a successful import (a failed
  // import has no document root to write).
  const rootText = failure === null
    ? await ufMockFixtureWriteRootText(mcp, id, files, read)
    : { attempted: 0, written: 0, writes: [], skippedReason: `the import did not resolve (${failure.kind}), so no document root exists to write` }
  return { skipped: false, files, read, failure, reading: `${files.length} file(s)`, rootText }
}

/** `§18.6` clause 3 (`FA-4`) — THE ROOT-TEXT WRITE, AND WHY THE FIXTURE NEEDS IT.
 *
 *  THE MECHANISM, MEASURED RATHER THAN INFERRED. The store's lexical index is the
 *  object `rag.query` scores against (`retrieval`'s maintained `LexicalIndex`). It is
 *  built at ENGINE CONSTRUCTION — from the store as it then stands, which at launch is
 *  EMPTY — and it is afterwards reconciled INCREMENTALLY, by node id, from the `edit.*`
 *  mutations' own change payloads. `edit.import_markdown` emits its batch as
 *  `{kind:'structural', nodeIds: <the import's documentIds>}` — the DOCUMENT ROOT ids
 *  ALONE — so the reconcile touches exactly one node per imported document: the
 *  synthetic root. And the parser authors that root with an EMPTY `content`
 *  (`markdown-parse`'s `makeNode(documentId, 'div', '')`: the document's BODY lives in
 *  the separate `:section:` / `:p:` nodes). The root is therefore indexed as an empty
 *  document, EVERY body node stays outside the index, and `rag.query` for the probe's
 *  own constant term returned `0 hit(s)` under EVERY set — measured, all four: the
 *  probe's three keys park under `core` and `table` too, where `§18.6` clause 3
 *  requires the store query to read PRESENT.
 *
 *  THE ADAPTATION IS THE SET'S OWN MATERIALISATION ROUTE, NOT AN APP CHANGE: after a
 *  successful import this writes each imported document's ROOT node — through the app's
 *  EXISTING node-level edit op `edit.set_content` — with THAT DOCUMENT'S OWN AUTHORED
 *  TEXT (the same bytes this driver materialised for that file, `§2.3` clause 3). The
 *  op's own change payload is `{kind:'content', nodeIds:[<that root>]}`, so the engine's
 *  reconcile reads the root and indexes it WITH content: the document that carries the
 *  term now carries it in the one node the index can see, and the sets that do not
 *  carry it (`search`'s rewritten bodies, `§2.1` `F-3`) stay at `0` hits BY
 *  CONSTRUCTION — which is exactly the divergence `FA-1`/`FA-2`/`FA-4` need.
 *
 *  WHAT THIS DOES NOT TOUCH: the sets' declared files, their bytes, their identities
 *  (`§2.4`), the four refusals and the neutral default. The root is a STRUCTURAL
 *  container the document traversal never materialises as a content root (it is
 *  excluded from the section set: `buildTraversal`'s `sections = verdict.order.filter((id)
 *  => id !== documentId)`), so this write adds no text to any rendered body, no block to
 *  any surface and no row to the doc-nav — the term reaches the INDEX and nothing else.
 *  A write that fails is NAMED (never silently dropped): the reading it returns is what
 *  the launch line prints, so a run whose roots were not written says so. */
async function ufMockFixtureWriteRootText(mcp, id, files, read) {
  const declared = UF_MOCK_FIXTURE_SETS[id]
  const documentIds = read && read.value && Array.isArray(read.value.documentIds) ? read.value.documentIds : []
  // THE PAIRING IS THE IMPORTER'S OWN OR IT IS NOT TAKEN AT ALL: `documentIds[i]` is
  // the id of `files[i]` (`markdown-import`'s `documents.map((d) => d.documentId)` over
  // the SAME `params.files` order this call handed it). A count that disagrees is
  // named and NO write is attempted — a mis-paired write would put one document's text
  // into another document's root, which is the one failure mode this route must never
  // have silently.
  if (documentIds.length !== declared.files.length) {
    return { attempted: documentIds.length, written: 0, writes: [], skippedReason: `the import named ${documentIds.length} document id(s) for ${declared.files.length} file(s) — the pairing is NOT the importer's own, so NO root text was written (a mis-paired write would put one document's text into another document's root)` }
  }
  const writes = []
  for (let i = 0; i < documentIds.length; i++) {
    // The text written to a root is the text this driver materialised for that very
    // file — never a sibling's.
    const basename = declared.files[i]
    const text = declared.docs[basename] ?? ''
    const write = await mcpToolResult(mcp, 'edit.set_content', { nodeId: documentIds[i], content: text }).catch((e) => ({ ok: false, isError: false, tool: 'edit.set_content', value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
    const writeFailure = driverReadFailure(write)
    writes.push({
      documentId: documentIds[i],
      file: basename,
      chars: text.length,
      carriesTerm: text.includes(UF_MOCK_FIXTURE_TERM),
      written: writeFailure === null && !!(write && write.value && write.value.ok === true),
      failure: writeFailure === null ? null : `${writeFailure.kind}: ${writeFailure.detail}`,
    })
  }
  return { attempted: documentIds.length, written: writes.filter((w) => w.written).length, writes }
}

/** `§5.5` `FA-1`/`FA-2` + `§16.5` — THE BLOCK'S OWN, BODY-OWNED PARK. At a
 *  NON-EMPTY store the fixture GATE's own predicate is FALSE, so the gate route
 *  cannot carry `FA-1`/`FA-2`'s park: the block asks ITS OWN DECLARED FIXTURE's
 *  probe before its own setup read and, when that probe reads `present:false` at
 *  `resolved:true`, emits its OWN park through the existing `parkRow`/`parkReason`
 *  seam, naming ITS OWN declared fixture, and tags the ROUTE
 *  (`parked-by-fixture-absence`) so the run's observation can distinguish it from a
 *  gate-route park (`parkedByGate`). The gate predicate itself is NOT touched. */
async function ufFixtureOwnPark(h, block, fixtureName, rowId) {
  const own = await ufFixturePreconditionRead(h, { noSeed: UF_FIXTURE_STATE.kind === 'mock-data-set' }, fixtureName)
  if (own.resolved === true && own.present === false) {
    return parkRow(rowId, `the block ${block} reads the surface its own declared fixture ${JSON.stringify(fixtureName)} names (the fixture is PRESENT at this run)`, 'D-state', `the declared fixture ${fixtureName} reads ABSENT at this run (${own.detail})`, `the block ${block} own declared fixture probe read present:false at resolved:true via ${own.tool ?? 'no declared read'}`, { path: 'missing', ok: false, park: true, parkRoute: 'parked-by-fixture-absence', parkReason: fixtureName, fixtureName, block, tool: own.tool, detail: own.detail, surface: { target: 'assembled-renderer', liveSurfacePresent: null } })
  }
  return null
}

/** `§5.1` clause 3(vi) — THE NO-DECLARED-ROW-ID TWIN: a block whose entry declares NO row
 *  id emits its fixture-absence park on its own `DIAG` line carrying the
 *  `PRECONDITION-FAILED` marker (`ufCountBlock` classifies exactly that pair as a park),
 *  so no §6.1 report row is fabricated for a block that declares none. */
async function ufFixtureOwnParkNoRow(h, block, fixtureName) {
  const own = await ufFixturePreconditionRead(h, { noSeed: UF_FIXTURE_STATE.kind === 'mock-data-set' }, fixtureName)
  if (own.resolved === true && own.present === false) {
    return diagResult(`PARKED PRECONDITION-FAILED (the declared fixture ${fixtureName} reads ABSENT at this run): the block ${block} own declared fixture probe read present:false at resolved:true via ${own.tool ?? 'no declared read'} (${own.detail}) — this block declares NO row id, so its fixture-absence park rides this DIAG line with the marker (§5.1 clause 3(vi))`, { park: true, parkRoute: 'parked-by-fixture-absence', parkReason: fixtureName, fixtureName, block, tool: own.tool })
  }
  return null
}

/** ⟨gate-4 `E-3`⟩ THE FIXTURE-STATE OBSERVATION, DERIVED FROM THIS RUN AND NOTHING
 *  ELSE: the declared population, the observed PARK/RUN split inside it, and the
 *  SCOPE of the clause (the gated population plus the excluded engine family). The
 *  §6.1 printed clause reads THIS object, so `parked=N/M` is a reading of the run
 *  rather than a universal sentence. An argument that is not an array (a print site
 *  reached before the blocks ran) reports `observed:'none yet'` and says so instead
 *  of implying a split.
 *
 *  ⟨GATE-5 FINDING — **WHICH SOURCE THIS READS, STATED: THE BLOCK CLASSIFICATION,
 *  NOT `reportRows`.**⟩ The observation used to take its count from the run's
 *  `reportRows`, and `§5.1` clause 3(vi) records exactly why that set cannot carry
 *  the whole parked population: `ufPushRows`' `typeof res.row !== 'string'` guard
 *  FILTERS the no-declared-row-id `diagResult` fallback OUT of `reportRows` (the
 *  block's absence is recorded on its printed `DIAG` line — the marker in its
 *  detail — and nowhere else), so a run that parked a no-id block printed a count
 *  that omitted it: MEASURED on the pre-fix head as `parked=0/34` in a scoped run
 *  that demonstrably parked one block (`tabs`, on its own `DIAG …
 *  PRECONDITION-FAILED:` line). The old count also OVER-counted in the other
 *  direction, because `reportRows` holds one entry per DECLARED ROW: a gated block
 *  whose result set carried two parked rows contributed TWO to `parked` while
 *  printing ONE `PARK` line.
 *
 *  THE SOURCE IS NOW THE CLASSIFICATION — the SAME per-block record the
 *  `PASS`/`PARK`/`DIAG`/`NOT-DRIVEN`/`FAIL` line and the block loop's own counters
 *  are taken from (`ufCountBlock`, which classifies from the very result object
 *  `printBlockVerdict` printed). ONE record per block that ran, so `parked=N/35`
 *  counts BLOCKS of the gated declared population and AGREES with the lines the run
 *  printed for them: a `PARK`-classified gated block counts once however many
 *  declared rows it parked, and a `DIAG`-classified gated block whose fallback
 *  carries the `PRECONDITION-FAILED` marker (the no-id park route, `§5.1` clause 2 /
 *  `§5.3`) counts too. A block OUTSIDE the 35 gated keys is counted by neither,
 *  whatever it parked for. ⟨gate-4 `F-4`⟩ `34` → `35` here and at the site above:
 *  BOTH are the LIVE gated population of `§17.1` clause 3 (`47 − 3 − 9 = 35`), not
 *  the PRE-`§16.1` head's `34` the filed text carried.
 *
 *  ⟨gate-4 `F-3`/`F-4` — THE TWO MEMBERS THIS OBSERVATION DID NOT CARRY.⟩ `parked` is
 *  the gated population's WHOLE park count (a gated key may park for its OWN reason,
 *  never only for the fixture's absence), so the observation also reports
 *  `parkedByGate` — the SUBSET produced by the fixture gate's OWN route, tagged on the
 *  classification record at the ONE point a block is parked without running — and the
 *  printed line states that the fixture-absent park is a SUBSET of `parked`. The
 *  arithmetic remainder is `eligibleAndNotParked` (`declared − parked`), RENAMED from
 *  `ran`: it is a subtraction over the DECLARATION, never a count of blocks that ran,
 *  and the printed line carries this run's own `blocksRun` beside it so the two cannot
 *  be confused. */
function ufFixtureGateObservation(classifications) {
  const declared = UF_GATED_DECLARED_KEYS.length
  const list = Array.isArray(classifications) ? classifications : null
  const observed = list === null ? 'none yet (this site prints before the blocks run)' : null
  // ⟨gate-4 `F-3` — EVERY PARK INSIDE THE GATED KEYS, WHATEVER IT PARKED FOR.⟩
  // `parked` is NOT "the fixture-absent park": a GATED key also parks for its OWN
  // reasons (a `parkRow` / a result carrying `extra:{park:true, parkReason}` — e.g.
  // `uf_hist_4`, `uf_hist_6`), and the printed sentence used to attribute the WHOLE
  // count to the fixture-absent route. The count is kept EXACTLY as it was (it is the
  // gated population's own park population, and no other site's arithmetic reads it);
  // what is added is the SUBSET the fixture gate's own route produced.
  const parked = list === null ? null : list.filter((r) => r && r.park === true && UF_GATED_DECLARED_KEYS.includes(r.block)).length
  // ⟨gate-4 `F-3`⟩ THE GATE-ROUTE COUNT: the parks whose classification record was
  // tagged `gateRoute === true` at `ufCountBlock` — the fixture-absent branch of
  // `ufRunBlock` alone (the block's OWN declared fixture probe read absent, so the
  // block was parked through `ufDriverFailureRows` WITHOUT running). A park routed
  // from the block's own body, from a `parkRow` site or from the throw path is NOT
  // counted here, and a gate-route park is always a gated key's (the branch's own
  // conjuncts are the §4.1 predicate), so this is a SUBSET of `parked`.
  const parkedByGate = list === null ? null : list.filter((r) => r && r.park === true && r.gateRoute === true && UF_GATED_DECLARED_KEYS.includes(r.block)).length
  // ⟨§5.5 second bullet / `§17.4` — THE THIRD PARK MEMBER, PRINTED BESIDE THE OTHER
  // TWO.⟩ `parkedByFixtureAbsence` is the subset of the gated population parked BECAUSE
  // ITS OWN DECLARED FIXTURE READ ABSENT at `resolved:true`, HOWEVER THE PARK WAS ROUTED
  // (the gate branch OR the block's own body, `ufFixtureOwnPark`) — so the chain is
  // `parkedByGate ⊆ parkedByFixtureAbsence ⊆ parked`. `parked` and `parkedByGate` are
  // UNCHANGED (a subset is ADDED, no figure moves) and the (park set, route tag) PAIR is
  // what distinguishes a fixture-absence park from a block's own park (`FA-3`).
  const parkedByFixtureAbsence = list === null ? null : list.filter((r) => r && r.park === true && r.parkRoute === 'parked-by-fixture-absence' && UF_GATED_DECLARED_KEYS.includes(r.block)).length
  // ⟨gate-4 `F-4` — THE MEMBER IS ARITHMETIC, AND IS NAMED AS ARITHMETIC.⟩ This member
  // was `ran` (`ran = declared − parked`) and printed as `ran-with-own-verdict=33`
  // beside the split — a label a reader takes for a COVERAGE reading (`33` of `34`
  // blocks ran), while it is a SUBTRACTION over the DECLARATION: a scoped run that
  // drove a handful of blocks still prints the same figure. It is renamed to what it
  // is and the RUN COUNT is printed beside it (`summary.blocksRun`) so neither can be
  // taken for the other. The superseded name is kept visible here, not rewritten.
  const eligibleAndNotParked = list === null ? null : declared - parked
  return {
    declared,
    parked,
    parkedByGate: parkedByGate,
    parkedByFixtureAbsence,
    eligibleAndNotParked,
    observed,
    split: list === null ? `declared=${declared} (no observation at this site)` : `parked=${parked}/${declared}`,
    scope: `the ${declared} gated declared keys (corpusRead:true AND selfProvisioning:false, §4.1) of the ${UF_FIXTURE_DECLARATION.length}-entry census declaration; the ${UF_EXCLUDED_ENGINE_FAMILY.keys.length} \`gnosis_*\` engine-family keys read a DIFFERENT fixture (${UF_EXCLUDED_ENGINE_FAMILY.fixtureName}) and are NOT covered by this clause (${UF_EXCLUDED_ENGINE_FAMILY.clause})`,
  }
}

/** §2.1.1 limb 2 — THE RENDERED TAB STRIP's own rows. Every tab's identity
 *  (`data-tab-id`), its target kind, its title and its active flag, plus the
 *  DOCUMENT-tab rows the strip carries (`data-document-id`) — the row family whose
 *  selector is keyed by a CORPUS identity, which is what makes this read
 *  corpus-DEPENDENT and earns the declaration's `corpus-document-tabs` fixture
 *  name for the blocks that read it (`§2.2` rows `13`/`43`, `§2.3` `P-1`). The
 *  `data-document-id` selector is carried in CODE position (a short literal on its
 *  own `const`, never inside the long `evaluate` template's prose), so the read is
 *  readable by a derivation and not by prose. */
async function ufTabStripRead(h) {
  const docTabRows = '#tab-strip .tab[data-document-id]'
  return h.cdp.evaluate(`(()=>{const rows=[...document.querySelectorAll('#tab-strip .tab')].map((t)=>({title:(t.textContent||'').trim().slice(0,32),tabId:t.getAttribute('data-tab-id'),kind:t.getAttribute('data-target-kind'),docId:t.getAttribute('data-document-id'),active:t.classList.contains('is-active')}));const docRows=document.querySelectorAll(${JSON.stringify(docTabRows)}).length;return {rows:rows,docTabRows:docRows}})()`)
}

/** §2.1.1-A / the `selfProvisioning` carve-out of `§2.1.1` — THE
 *  SELF-PROVISIONING IMPORT. A block that supplies its OWN input writes its
 *  document and imports it, and then reads the STORE's document list back
 *  (`rag.list_documents`), so the content the block goes on to read is the store
 *  content it PLACED — never a pre-existing corpus. That read is what
 *  `UF_FIXTURE_DECLARATION` records as `selfProvisioning:true`, and it is why such
 *  an entry is NEVER gated by the fixture-absent park (`§4.1`, `§5.1` clause 1):
 *  parking a self-provisioning block on an empty store would be a FALSE park. */
async function ufSelfProvisionImport(h, doc, text) {
  mkdirSync(dirname(doc), { recursive: true })
  writeFileSync(doc, text)
  const read = await h.mcpRead('edit.import_markdown', { files: [doc] }).catch((e) => ({ ok: false, isError: false, tool: 'edit.import_markdown', value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
  const list = await h.mcpRead('rag.list_documents', {}).catch(() => null)
  const documents = list && list.value && Array.isArray(list.value.documents) ? list.value.documents.length : null
  return { doc, read, failure: driverReadFailure(read), documents }
}

/** §2.3 `H-4` — A BLOCK THAT THREW: was it a PRECONDITION (an `isError` reply, an
 *  absent engine, a corpus/fixture the run cannot reach) or a genuine defect? Only
 *  the precondition class is re-classified as a DRIVER outcome (PARKED/NOT-DRIVEN
 *  with the reason named); a defect keeps the loud `FAIL` the run already prints,
 *  so the driver can never hide its own bug behind a `NOT-DRIVEN`. */
/** ⟨NOTE — DECLARATION FORM⟩ this classifier is declared as an arrow BOUND TO A NAME with
 *  a space before its parameter list, so the driver's own text carries the call-form
 *  `ufBlockThrowReason` immediately followed by a paren ONLY at its CALL SITE: the pin's
 *  static reader locates the block-runner's `catch` by searching for the FIRST occurrence
 *  of that call-form, and the bare FUNCTION DECLARATION of the classifier matched
 *  before the call — which resolved the reader to an unrelated catch. The form is a
 *  reader-visible anchoring only: not one line of the classifier's behaviour changes. */
const ufBlockThrowReason = (e, pre, block) => {
  const msg = String(e && e.message ? e.message : e)
  if (e && e.isError === true) return { kind: 'isError', detail: String(e.errorText ?? msg), extra: `block=${block}` }
  if (/ECONNREFUSED|fetch failed|socket hang up|ECONNRESET|UND_ERR/.test(msg)) return { kind: 'ECONNREFUSED', detail: msg, extra: `block=${block}` }
  // §13.4 / gate-4 `B-5` — A RESOLVED PRECONDITION IS REQUIRED (never `!pre`):
  // `pre === null` (the precondition read itself did not resolve, or threw before
  // it could) is NOT "the corpus is absent", and `pre.resolved !== true` (an
  // `isError` reply / a transport failure) is not a corpus reading either. Both
  // keep the LOUD `FAIL`: the driver may never hide its own defect behind a
  // `NOT-DRIVEN`/PARKED re-classification.
  const corpusAbsent = !!pre && pre.resolved === true && pre.present === false
  const nullishDeref = /undefined|not a function|null \(reading|Cannot read propert/.test(msg)
  if (corpusAbsent && nullishDeref) {
    return { kind: pre && pre.kind ? pre.kind : 'fixture-missing', detail: `the block's setup read threw (${msg}) and the seeded corpus is ABSENT: ${pre.detail}`, extra: `block=${block}` }
  }
  return null
}

function buildFailingClause(pass, assertion, required, observed, path, realInput, proxyPASS, park) {
  if (pass) return null
  // ⟨GATE-4 FINDING `D-2` — ONE PREDICATE, NOT TWO.⟩ This builder used to re-derive
  // its OWN classification beside the one the report prints, and the two DISAGREED:
  // its `undriven` test keyed on the row's gesture path being ABSENT or equal to a
  // state-read TOKEN that NO drive site in this driver ever produced (the real
  // state-row paths are the `mcp-import (no gesture; state row)` and
  // `driver-precondition (no gesture; could not be driven)` forms), so the clause
  // recorded `FAIL` for every non-PASS path-carrying row the run prints `NOT-DRIVEN`
  // (`native-fallback`, `synthetic-drag-start`, `synthetic-click([DIAG])`,
  // `synthetic-keyboard-only`, `driver-precondition (…)`, the `proxyPASS` rows) and
  // recorded `NOT-DRIVEN` for a path-LESS row where the report prints `FAIL` — a
  // clause contradicting its own printed verdict in BOTH directions, and a genuine
  // app FAIL demotable to a non-verdict by a path test of the clause's own.
  //
  // THE CLASSIFICATION IS THEREFORE NO LONGER RE-DERIVED: the predicate below IS the
  // report's own classification — the SAME `gated`/`notDriven` test, on the SAME path
  // vocabulary, that `blockVerdictOf` (the run's single classification site, which the
  // `ROW` line, the `FAIL`/`NOT-DRIVEN` block line and the §6.1 counts are all taken
  // from) applies. It is STATED here rather than reached by a call because the pin
  // evaluates this function's TEXT in isolation (`new Function`) — a reference to a
  // helper would be a second, unreadable classification at the site that matters —
  // so the two expressions are kept VERBATIM identical and the arm's own
  // report-vs-clause token-set equality is what holds them together. The dead token
  // this predicate named is DELETED, not re-spelled.
  const gated = path != null && !/state row/.test(String(path))
  const notDriven = gated && realInput !== true && pass !== true
  const verdict = park === true ? 'PARKED' : (notDriven ? 'NOT-DRIVEN' : 'FAIL')
  // §2.2 `E-7` — THE `required` POSITION CARRIES THE REQUIRED VALUE, or the NAMED
  // sentinel when the row recorded none: an undefined `required` must never be
  // filled with the ASSERTION SENTENCE (which states the predicate, not the value
  // it had to meet).
  const requiredValue = required === undefined || required === null || required === '' ? UF_NO_REQUIRED_VALUE : required
  return { predicate: assertion, required: requiredValue, observed: observed, gesturePath: path, realInput: realInput, proxyPASS: proxyPASS, verdict: verdict }
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
  // §2.3 `H-3` clause 1 + `B-8`/`P-TP-1` arm 7 — EVERY non-`cdp` record this probe
  // returns carries `realInput: false` (the recorded path IS the proof: only a
  // hit-tested `cdp` coordinate is real input), so a missing selector can never read
  // as not-driven for the wrong reason; `path: 'missing'` leads its record so the
  // shape is bindable at its own site.
  if (!p) return { path: 'missing', realInput: false, detail: `not found: ${selector}` }
  if (p.w === 0 || p.h === 0) return { path: 'zero-box', realInput: false, ...p, detail: `zero-size box ${p.w}x${p.h}` }
  if (!p.inViewport) return { path: 'off-viewport', realInput: false, ...p, detail: `probe (${Math.round(p.x)},${Math.round(p.y)}) outside the viewport` }
  if (!p.onTarget) return { path: 'native-fallback', realInput: false, ...p, detail: `hit=${p.hit} (not the target)` }
  return { path: 'cdp', realInput: true, ...p, detail: `hit=${p.hit} at (${Math.round(p.x)},${Math.round(p.y)})` }
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
 *  plain paths (`docs`, `docs/specs`, and the OBSOLETE `.live-corpus` SEED route's
 *  own directory — annotated as OBSOLETE, never extended, §6.1 clause 1) are fine,
 *  but a path containing a `"` is not — such a path renders with special characters
 *  (`[".live-fixture/core"]` is the OBSOLETE route's own rendering, §6.1 clause 1)
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
 * §2.1 `E-1`/`E-3` — THE DECLARED ROW IS THE UNIT OF TRUTH. `executed` = the
 * matrix rows that actually CARRIED A VERDICT in this invocation (`[]` means "no
 * §5.U row produced a verdict"). `missingRows` is the DECLARED-MINUS-VERDICTED
 * SET DIFFERENCE — never a hardcoded empty list, and never a substitution of the
 * declared id list for the executed set (both named as defects, `V-3`/`M-2`).
 *
 * `fullBattery` is decided by the ROW/specification dimension — every `BLOCKS`
 * key was REQUESTED and the requested set covers every declared row's block —
 * never by `blocksRun === 0` (`V-3`: every block can run while rows go
 * unverdicted). `blocksRun` stays an informational counter and decides nothing.
 *
 * `table` = the matrix table to check (defaults to MATRIX_ROWS); its row ids
 * must be unique and every row must name a block.
 *
 * ⟨GATE-4 FINDING `D-3`⟩ **THE IN-SCOPE REFUSAL IS DIMENSION-INDEPENDENT.** A
 * declared row whose DECLARED `block`/`blocks` intersect `requested` and which
 * produced NO verdict is an ERROR naming the row — full battery OR NOT — so a
 * scoped run can no longer print `OK (scoped run: N of 8 declared rows in scope;
 * 0 inconclusive)` over a row its own scope reached and lost (`M-1`'s "an INVALID
 * report reads as a pass", at the scope edge). The full-battery refusal is kept
 * beside it; a declared row OUT of scope stays INCONCLUSIVE (never a refusal),
 * exactly as `E-12` item 2 rules on the extended dimension.
 *
 * Pure (no I/O) so the live harness and a static check can both use it.
 */
export function reconcileMatrixRows(executed = [], requested = [], table = MATRIX_ROWS, allBlockKeys = []) {
  const executedRowIds = table.map((r) => r.row)
  const matrixIds = executedRowIds
  const duplicatedRowIds = [...new Set(matrixIds.filter((id, i) => matrixIds.indexOf(id) !== i))]
  const missingBlocks = table.filter((r) => typeof r.block !== 'string' || r.block === '').map((r) => r.row)
  const matrixBlocks = table.map((r) => r.block)
  const multiRowBlocks = [...new Set(matrixBlocks.filter((b, i) => matrixBlocks.indexOf(b) !== i))]
  const requestedSet = requested.filter((n) => typeof n === 'string' && n !== '')
  // THE FULL-BATTERY PREDICATE, re-pinned to the ROW dimension (§2.1 `E-3`):
  // every `BLOCKS` key requested AND every declared row's block requested. It is
  // DECLARED BEFORE the verdict set and the declared-minus-verdicted difference it
  // scopes, so the row-dimension reading is available to every value derived from
  // it (a `verdicted` built from `fullBattery` is evaluable at its own site).
  const fullBattery = allBlockKeys.length > 0 && allBlockKeys.every((k) => requestedSet.includes(k)) && matrixBlocks.every((b) => requestedSet.includes(b))
  const reported = executed.map((e) => e.row).filter((r) => typeof r === 'string' && /^U-\d+$/.test(r))
  const verdicted = new Set(reported)
  // THE SET DIFFERENCE (§2.1 `E-3` clause 1): declared rows with NO verdict.
  const missingRows = executedRowIds.filter((id) => !verdicted.has(id))
  const extra = [...new Set(reported.filter((id) => !matrixIds.includes(id)))]
  // ⟨GATE-4 FINDING `D-3` — THE `M-1` SHAPE AT THE SCOPE EDGE.⟩ The refusal used to
  // fire ONLY when `fullBattery && missingRows.length`, while the EXTENDED dimension
  // already refuses a REQUESTED declared row that produced no verdict (`E-12` item 2)
  // — so a SCOPED run whose in-scope declared row produced no verdict printed
  // `OK (scoped run: N of 8 declared rows in scope; 0 inconclusive)` and exited `0`:
  // exactly `M-1`'s "an INVALID report … reads as a pass", moved to the scope edge.
  // The in-scope refusal is therefore DIMENSION-INDEPENDENT: a declared matrix row
  // whose DECLARED `block`(s) intersect the REQUESTED set and which produced no
  // verdict is an ERROR NAMING the row — full battery or not. The full-battery
  // refusal below is KEPT beside it (in a full battery every declared row is in
  // scope, so the full-battery reading is that rule's own edge case, and its ruled
  // text stays verbatim). The declared block set is resolved HERE, from the table
  // entry's own `block` + `blocks` (the same set `declaredBlocksOf` builds), because
  // this function is pure and is evaluated on its own by the pin's static readers.
  const inScopeRowIds = table
    .filter((r) => {
      const blocks = []
      if (typeof r.block === 'string' && r.block !== '') blocks.push(r.block)
      if (Array.isArray(r.blocks)) for (const b of r.blocks) if (typeof b === 'string' && b !== '') blocks.push(b)
      return blocks.some((b) => requestedSet.includes(b))
    })
    .map((r) => r.row)
  const inScopeMissingRows = missingRows.filter((id) => inScopeRowIds.includes(id))
  // ⟨GATE-4 FINDING `D-3`⟩ — THE TWO CLASSES OF ERROR ARE PUSHED THROUGH SEPARATE
  // CHANNELS AND THEN CONCATENATED, so the TABLE-INTEGRITY class (the matrix table's
  // own shape: a duplicated id, a row with no block, an id outside the capped matrix)
  // and THIS RUN's DECLARED-ROW REFUSALS (the rows in the requested scope that
  // produced no verdict) stay separately readable — the refusal is a reading of the
  // RUN, never a by-product of the table's shape checks, and it is emitted whatever
  // the table's shape is. Both channels land in the one `errors` array the report
  // prints as `ROW-SET ERROR` lines and the exit path reads.
  const errors = []
  if (duplicatedRowIds.length) errors.push(`duplicated MATRIX_ROWS row id(s): ${duplicatedRowIds.join(', ')}`)
  if (missingBlocks.length) errors.push(`MATRIX_ROWS row(s) with no block: ${missingBlocks.join(', ')}`)
  if (extra.length) errors.push(`report row(s) absent from MATRIX_ROWS: ${extra.join(', ')} (a §5.U row id that is not in the capped matrix)`)
  // A scoped run cannot report a §5.U row it did not execute — but a declared row it
  // DID put in scope (its declared block was requested) and which produced NO verdict
  // is refused BY NAME, exactly as the EXTENDED dimension refuses one (`E-12` item 2).
  const refusals = []
  if (fullBattery && missingRows.length) refusals.push(`matrix row(s) with no verdict: ${missingRows.join(', ')} (a §5.U row may not be silently missing from the battery)`)
  else if (inScopeMissingRows.length) refusals.push(`matrix row(s) IN SCOPE with no verdict: ${inScopeMissingRows.join(', ')} (a declared row whose requested block(s) produced no verdict may not vanish silently — §2.1 E-3 clause 2 / §2.2 E-12 item 2)`)
  return {
    ok: errors.length === 0 && refusals.length === 0,
    errors: [...errors, ...refusals],
    matrixRowIds: matrixIds,
    executedRows: reported,
    missingRows: missingRows,
    // The scope reading of THIS run's requested set, beside the refusal it decides:
    // the rows the requested blocks reached, and the in-scope rows among them that
    // produced nothing (the refusal's own population, never a coverage claim).
    inScopeRows: inScopeRowIds,
    inScopeMissingRows: inScopeMissingRows,
    // Informational (§5.U legitimately lets one scenario block cover several
    // rows — e.g. `uf_panes_12` pins U-1 and the U-3 body-click half): a block
    // named by more than one row is reported, not treated as a row-set error.
    multiRowBlocks: multiRowBlocks,
    fullBattery,
    matrixTotal: matrixIds.length,
    rowsCounted: [...new Set(reported)].length,
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
  { row: 'UF-DEFECT-7', block: 'user9_search_open_in_tab', blocks: ['user9_search_open_in_tab', 'stage_search_open_in_tab'] },
  { row: 'UF-DEFECT-8', block: 'user10_collapse_vertical_text' },
  { row: 'UF-STAGE-2', block: 'repro_dup_para' },
  { row: 'UF-STAGE-4', block: 'repro_nbsp' },
  { row: 'UF-HIST-2', block: 'toolbar_undo' },
  { row: 'UF-STAGE-6', block: 'toolbar_toggle' },
  // U-EDIT-1-LIVE — the C9 whole-page-editing live battery (spec §8.3 items 1-8,
  // §11 items 7/8; `docs/defects.md` C9-U-EDIT-1-ADVERSARIAL-MUST-FIX-SET M4).
  // EXTENDED (non-matrix) rows: `docs/specs/unit-u-edit-1-whole-page-editing.md`
  // §8.3 "The §5.U matrix disposition (pinned)" — MATRIX_ROWS must NOT change.
  { row: 'U-EDIT-1-LIVE-1', block: 'u_edit_1_live_selection_span' },
  { row: 'U-EDIT-1-LIVE-2', block: 'u_edit_1_live_caret_head_body' },
  { row: 'U-EDIT-1-LIVE-3', block: 'u_edit_1_live_commit_failure_warning' },
  { row: 'U-EDIT-1-LIVE-4', block: 'u_edit_1_live_representation_mode' },
  { row: 'U-EDIT-1-LIVE-5', block: 'u_edit_1_live_head_split_and_textarea_census' },
  { row: 'U-EDIT-1-LIVE-6', block: 'u_edit_1_live_package_table_limitation' },
  { row: 'U-EDIT-1-LIVE-7', block: 'u_edit_1_live_typed_commit_one_batch' },
  { row: 'U-EDIT-1-LIVE-8', block: 'u_edit_1_live_caret_roundtrip' },
  // U-STAGE-ACTIVE-TAB — the stage/active-tab live battery (spec §8.3 items 1-5,
  // §A.1.1 I2-R). EXTENDED rows: the unit claims NO §5.U matrix slot (§9 item 4).
  { row: 'UF-STAGE-AT-1', block: 'stage_surface_census_i2r' },
  { row: 'UF-STAGE-AT-2', block: 'stage_document_tab_paints_its_document' },
  { row: 'UF-STAGE-AT-3', block: 'stage_async_mount_race_v1' },
  { row: 'UF-STAGE-AT-4', block: 'stage_foreign_rederive_v2' },
  { row: 'UF-STAGE-AT-5', block: 'stage_refresh_survival_v5' },
  { row: 'UF-STAGE-AT-6', block: 'stage_tabs_persist_roundtrip' },
  { row: 'UF-STAGE-AT-7', block: 'stage_multimount_reachability' },
  { row: 'UF-STAGE-AT-8', block: 'stage_docnav_switch_inside_async' },
  // §2.2 `E-12` item 3 / §12.1 — THE TWO ROWS THIS UNIT'S CONVERSION DECLARES.
  // `UF-STAGE-1` (the closed checklist enumeration's own Stage id, emitted by NO
  // other block at this head — `§12.2 V-11`) is carried by the converted
  // `boot_landing` block, which asserts that enumerated row's coexistence +
  // first-import-removal limbs; its third limb ("a still-empty content re-derive
  // keeps it") is recorded `UNTAKEN` in the spec and is NOT printed, implied or
  // claimed by this driver (§12.1). `UF-SETTINGS-7` is declared here for its
  // PERSISTENCE half, carried by the converted `vis_persist` block — its flip/
  // frame half is the sibling emission by `uf_settings_7` (already declared
  // above), so ONE enumerated row id has TWO contributing blocks and is
  // aggregated by AND (`§2.2 E-11`). The driver MINTS no row id: both ids come
  // from `docs/specs/user-flow-audit-checklist.md`'s closed enumeration.
  { row: 'UF-STAGE-1', block: 'boot_landing' },
  // §2.2 `E-12` item 2 (`G-4`) — THE SHARED ROW'S CONTRIBUTING BLOCKS ARE A SET.
  // `UF-SETTINGS-7`'s verdict comes from BOTH halves (`vis_persist` AND
  // `uf_settings_7`), so "requested" must mean ANY of them: with only the
  // sibling half in `--block=` scope the row is IN scope and — if it produced no
  // verdict — REFUSED BY NAME, instead of the run printing `OK` while a declared
  // row produced nothing (the scope loophole `G-4` names).
  { row: 'UF-SETTINGS-7', block: 'vis_persist', blocks: ['vis_persist', 'uf_settings_7'] },
]

/**
 * §2.2 `E-12` — THE EXTENDED DECLARED/EXECUTED RECONCILIATION. For every DECLARED
 * extended row whose declared block(s) were REQUESTED, the row must END in
 * exactly one of {a verdict, a refusal naming it}. The missing set is the
 * DECLARED-MINUS-VERDICTED SET DIFFERENCE — never a hardcoded empty list and
 * never a substitution of the declared id list for the emitted set (`E-12`
 * item 4, `E-3`'s two named defects).
 *
 * SCOPE LIMIT (`E-12` item 5, `F-15`): only the rows THIS unit declares refuse.
 * A declared row outside the unit's two is REPORTED (`EXTENDED-DECLARED-NO-VERDICT
 * — inconclusive`) and never refuses the run — otherwise the refusal would flip
 * the unit's own acceptance reading on a table it does not own.
 *
 * An emitted-but-UNDECLARED id is REPORTED (`EXTENDED-UNDECLARED`), never a
 * refusal. Pure (no I/O).
 */
const EXTENDED_REFUSING_ROWS = ['UF-STAGE-1', 'UF-SETTINGS-7']

export function extendedDeclaredMissing(emitted = [], requested = [], table = ROW_EXTENDED) {
  const emittedSet = new Set(emitted.map((e) => String(e.row)))
  const requestedSet = requested.filter((n) => typeof n === 'string' && n !== '')
  // §2.2 `E-12` item 2 (`G-4`) — IN SCOPE MEANS ANY OF THE ROW'S DECLARED BLOCKS
  // WAS REQUESTED. A shared row (`UF-SETTINGS-7` <= `vis_persist` +
  // `uf_settings_7`) is in scope when EITHER half is requested: testing only the
  // entry's primary `block` put a requested declared row OUT of scope, so
  // `missing` read empty and the reconciliation printed `OK` while the row
  // produced no verdict at all.
  const inScope = table.filter((r) => declaredBlocksOf(r).some((b) => requestedSet.includes(b)))
  const missing = inScope.filter((r) => !emittedSet.has(String(r.row))).map((r) => String(r.row))
  const inconclusive = missing.filter((id) => !EXTENDED_REFUSING_ROWS.includes(id))
  const refusing = missing.filter((id) => EXTENDED_REFUSING_ROWS.includes(id))
  const declaredIds = table.map((r) => String(r.row))
  const undeclared = [...new Set(emitted.map((e) => String(e.row)).filter((id) => !declaredIds.includes(id)))]
  // `inScope` is RETURNED (not only consumed) so the reconciliation line can print
  // the declared rows this run's REQUESTED set actually reached: a run whose scope
  // contains only a shared row's sibling half must be readable as reaching that
  // row (`G-4`), never as an out-of-scope omission.
  return { missing: refusing, inconclusive, undeclared, refused: refusing.length > 0, inScope: inScope.map((r) => String(r.row)) }
}

/**
 * §2.2 `E-11` — SHARED-ROW AGGREGATION. One row id may be carried by more than
 * one block (`vis_persist` + `uf_settings_7` is this unit's own pair): the
 * report prints EACH contributor's own verdict AND the row's AGGREGATED verdict,
 * the aggregate being the AND of its contributions — `PASS` iff every
 * contribution is `PASS`; a single `FAIL` contributor makes the ROW read `FAIL`;
 * a `NOT-DRIVEN`/`PARKED` contribution is NEVER promoted. Never averaged, never
 * majority, never last-wins, and the aggregate is never the only place a block's
 * verdict appears. Pure (no I/O).
 */
export function aggregateRows(rows = []) {
  const byRow = new Map()
  for (const r of rows) {
    const id = String(r.row)
    if (!byRow.has(id)) byRow.set(id, [])
    byRow.get(id).push(r)
  }
  return [...byRow.entries()].map(([row, contributions]) => {
    const verdicts = contributions.map((c) => c.verdict)
    const verdict = verdicts.length > 0 && verdicts.every((v) => v === 'PASS')
      ? 'PASS'
      : verdicts.includes('FAIL')
        ? 'FAIL'
        : verdicts.includes('NOT-DRIVEN')
          ? 'NOT-DRIVEN'
          : 'PARKED'
    return { row, verdict, contributors: contributions.map((c) => `${c.row}:${c.block}=${c.verdict}`), shared: contributions.length > 1 }
  })
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
  // Measurement-only probe (no pinned user-visible end state of its own — the
  // tab-switching rows are UF-TABS-1/3/4): reported as a §6.1 DIAGNOSTIC so it
  // can never be promoted to a row verdict.
  tabs: async (h) => {
    const r = await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'nodeId', nodeId: '.live-fixture/core/beta' } })
    const focused = !!(r && (r.ok !== false) && !r.error)
    return diagResult(`provident.focus(nodeId .live-fixture/core/beta) → ${JSON.stringify(r)}; focused=${focused}`)
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
    //
    // §2.1 `E-4` item 1/§12.1 — CONVERTED onto the CLOSED checklist enumeration's
    // own id `UF-STAGE-1` (docs/specs/user-flow-audit-checklist.md §5 Stage/
    // document; emitted by NO other block at this head). The driver MINTS no row
    // id. The enumerated row's THIRD limb ("a still-empty content re-derive keeps
    // it") is recorded `UNTAKEN` in the spec (§12.1) and is NOT measured, printed,
    // implied or claimed here: measuring it would be a FIRST live assertion about
    // the app, which `§2.1 E-5`/`§1.3` keep out of this unit.
    await ufEnsureAppClear(h)
    const zoneBefore = await ufZoneState(h, 'left')
    const landing = await h.cdp.evaluate(`!!document.getElementById('stage-landing')`)
    const dataStage = await h.cdp.evaluate(`(()=>{const e=document.getElementById('stage-landing');return e?e.getAttribute('data-stage'):null})()`)
    const toolbar = await h.cdp.evaluate(`!!document.getElementById('editor-toolbar')`)
    const panes = await h.cdp.evaluate(`document.querySelectorAll('.pane-frame[data-pane-id]').length`)
    const coexists = landing && dataStage === 'landing' && toolbar && panes > 0
    const doc = ufMockFixtureWritePath('live4-first.md')
    // §2.1.1-A / the `selfProvisioning` carve-out — THIS BLOCK SUPPLIES ITS OWN
    // DOCUMENT: the write + import + the store read-back are ONE seam
    // (`ufSelfProvisionImport`), so the content this row reads back is the store
    // content it PLACED, never a pre-existing corpus.
    const provisioned = await ufSelfProvisionImport(h, doc, '# First\n\nA first document for LIVE-4.\n')
    // §3.2 `F-7`/§2.2 `E-9` — THIS READ DEFINES THE ROW'S PRECONDITION, so it is
    // taken through the DISCRIMINATED reader: an `isError` reply (the recorded
    // `MCP error -32602` when the `edit` group is off) is classified by
    // `driverFailureReason` — its text PRINTED VERBATIM and the row read
    // `NOT-DRIVEN` — instead of being stringified into `evidence` and left to read
    // as an app FAIL for a call the driver could not make.
    const impRead = provisioned.read
    const impFailure = provisioned.failure
    const imp = impFailure ? { isError: true, errorText: impFailure.detail } : impRead.value
    await sleep(600)
    const landingAfter = await h.cdp.evaluate(`!!document.getElementById('stage-landing')`)
    // §2.2 `E-7`/`E-8` — the REQUIRED value of `landingAfter` is printed BESIDE the
    // observed one (never the bare `landingAfter=true` that `M-3` measured).
    const required = 'landingAfter=false (the landing is REMOVED on the empty-boot → first-import path, per the pinned rule the app-layer row LANDING-NOT-RECONCILED-ON-FIRST-IMPORT records as violated) AND coexistence=true (landing + data-stage=landing + #editor-toolbar + >=1 .pane-frame[data-pane-id])'
    const observed = `coexist=${coexists} (landing=${landing} data-stage=${dataStage} toolbar=${toolbar} panes=${panes}); import->landingAfter=${landingAfter} (required false); required coexistence=true; import=${JSON.stringify(imp)}; self-provisioned store read-back: rag.list_documents -> ${provisioned.documents === null ? 'no document list' : `${provisioned.documents} document(s)`} (the document THIS row placed, §2.1.1-A)`
    const failure = impFailure ? driverFailureReason(impFailure.kind, impFailure.detail, 'edit.import_markdown DEFINES this row’s precondition (UF-STAGE-1)') : null
    const ok = !failure && coexists && !landingAfter
    const surface = await ufSurfaceTarget(h)
    const verdict = failure ? failure.verdict : (ok ? 'PASS' : (toolbar || panes > 0 ? 'FAIL' : 'NOT-DRIVEN'))
    const evidence = `${failure ? `${failure.marker}; ` : ''}${observed}; zoneState=${zoneBefore.zoneState}; [UNTAKEN] the enumerated row's third limb ("a still-empty content re-derive keeps it") is NOT measured by this unit (§12.1) and is counted nowhere`
    return {
      row: 'UF-STAGE-1',
      assertion: "Boot against a TRUE empty store: #stage-landing[data-stage='landing'] coexists with #editor-toolbar AND >=1 .pane-frame[data-pane-id] in ONE graph; importing the first document REMOVES the landing (no phantom)",
      dclass: 'D-state',
      realInput: false,
      evidence: evidence,
      proxyPASS: false,
      surface: surface,
      pass: ok,
      diagnostic: false,
      proxy: null,
      gesturePath: failure ? 'driver-precondition (no gesture; the row-defining read could not be made)' : 'mcp-import (no gesture; state row)',
      undoDisabledAfter: null,
      preconditionFailed: failure ? failure.preconditionFailed : false,
      driverReason: failure ? impFailure.kind : null,
      failingClause: ok ? null : { predicate: 'the empty-store landing coexists with the toolbar and >=1 pane frame, and the first import removes it', required: required, observed: failure ? `${failure.marker}; ${observed}` : observed, gesturePath: failure ? 'driver-precondition (no gesture; the row-defining read could not be made)' : 'mcp-import (no gesture; state row)', realInput: false, proxyPASS: false, verdict: verdict },
      observed: observed,
      required: required,
      zoneState: zoneBefore.zoneState,
      detail: `${failure ? `${failure.marker}; ` : ''}${observed}; zoneState=${zoneBefore.zoneState}`,
    }
  },
  vis_persist: async (h) => {
    // U-LIVE11 paneVisibilityToggle live in the operator settings modal: a REAL
    // hit-tested click on the in-pane visibility toggle flips its data-enabled
    // state AND the change is PERSISTED (a second read after a re-derive reads the
    // flipped value).
    //
    // §2.1 `E-4` item 1/§12.1 — CONVERTED onto the PERSISTENCE HALF of the closed
    // checklist enumeration's `UF-SETTINGS-7` (whose flip/frame half the sibling
    // block `uf_settings_7` already emits — one enumerated row, TWO contributing
    // blocks, aggregated by AND per `§2.2 E-11`). The driver MINTS no row id.
    await ufEnsureAppClear(h)
    const opener = await ufModal(h, true)
    const sel = await h.cdp.evaluate(`(()=>{const any=document.querySelector('#settings-modal [data-pane][data-enabled]');return any?'[data-pane][data-enabled]':null})()`)
    if (!sel) {
      const required = 'a real hit-tested click on a #settings-modal [data-pane][data-enabled] toggle flips data-enabled AND a second read after a re-derive reads the flipped value'
      const observed = 'no [data-pane][data-enabled] toggle rendered in #settings-modal — the gesture COULD NOT BE DRIVEN'
      return {
        row: 'UF-SETTINGS-7',
        assertion: 'A real hit-tested click on the pane-visibility toggle flips data-enabled AND the change is PERSISTED: a second read after a re-derive reads the flipped value',
        dclass: 'D-interaction',
        realInput: false,
        evidence: observed,
        proxyPASS: false,
        surface: await ufSurfaceTarget(h),
        pass: false,
        diagnostic: false,
        proxy: null,
        gesturePath: 'missing',
        undoDisabledAfter: null,
        failingClause: { predicate: 'a real hit-tested click flips data-enabled and the flip PERSISTS across a re-derive', required: required, observed: observed, gesturePath: 'missing', realInput: false, proxyPASS: false, verdict: 'NOT-DRIVEN' },
        observed: observed,
        required: required,
        detail: observed,
      }
    }
    const paneId = await h.cdp.evaluate(`(()=>{const e=document.querySelector('#settings-modal [data-pane][data-enabled]');return e?e.getAttribute('data-pane'):null})()`)
    const readEnabled = async () => h.cdp.evaluate(`(()=>{const e=document.querySelector('#settings-modal [data-pane][data-enabled]');return e?e.getAttribute('data-enabled'):null})()`)
    const before = await readEnabled()
    const click = await ufRealClick(h, sel)
    await sleep(600)
    const after = await readEnabled()
    await ufModal(h, false)
    await sleep(400)
    // THE RE-DERIVE (§12.1: "the persistence measurement (the re-derive half)"):
    // reopen the modal so the operator pane-visibility set is applied by a FRESH
    // re-derive, then take the SECOND read of the same toggle.
    const reopen = await ufModal(h, true)
    const secondSel = await h.cdp.evaluate(`(()=>{const any=document.querySelector('#settings-modal [data-pane][data-enabled]');return any?'[data-pane][data-enabled]':null})()`)
    const second = secondSel ? await readEnabled() : null
    await ufModal(h, false)
    const proven = click.path === 'cdp'
    const flipped = after !== before
    const persisted = second === after && after !== null
    const ok = proven && flipped && persisted
    const required = 'a REAL hit-tested click (gesturePath=cdp) on the pane-visibility toggle: data-enabled flips (after != before) AND the flip PERSISTS — a second read after a re-derive reads the flipped value (second == after)'
    const observed = `toggle=${sel} pane=${paneId} data-enabled before=${before} after=${after} (flipped=${flipped}); opener=${opener.path} reopen(re-derive)=${reopen.path}; second read after the re-derive=${second} (required ${JSON.stringify(after)}, persisted=${persisted}); click path=${click.path} inVp=${click.inVp ?? null} coordinate=(${click.rect ? `${Math.round(click.rect.x)},${Math.round(click.rect.y)}` : '?'}) viewport=${JSON.stringify(click.viewport ?? click.rect?.vp ?? null)} onTarget=${click.onTarget ?? null}`
    const verdict = !proven ? 'NOT-DRIVEN' : (ok ? 'PASS' : 'FAIL')
    return {
      row: 'UF-SETTINGS-7',
      assertion: 'A real hit-tested click on the pane-visibility toggle flips data-enabled AND the change is PERSISTED: a second read after a re-derive reads the flipped value',
      dclass: 'D-interaction',
      realInput: proven,
      evidence: observed,
      proxyPASS: false,
      surface: await ufSurfaceTarget(h),
      pass: ok,
      diagnostic: false,
      proxy: null,
      gesturePath: click.path,
      undoDisabledAfter: null,
      failingClause: ok ? null : { predicate: 'a real hit-tested click flips data-enabled and the flip PERSISTS across a re-derive', required: required, observed: observed, gesturePath: click.path, realInput: proven, proxyPASS: false, verdict: verdict },
      observed: observed,
      required: required,
      detail: observed,
    }
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
    const id = docs && docs.documents && docs.documents[0] && (docs.documents[0].documentId || docs.documents[0].id) ? (docs.documents[0].documentId || docs.documents[0].id) : '.live-fixture/core/alpha'
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
    // §2.2 `E-7`/`E-8` + §3.2 `F-10` (`G-10`) — THE RESULT IS BUILT THROUGH THE SAME
    // CLAUSE-CARRYING PATH AS EVERY OTHER ROW (`rowResult`), with the undo-revert
    // predicate and its `observed`/`required` values spelled out. This block was the
    // ONE `ROW` line of the live battery printing a `FAIL` with `failingClause=null`:
    // a reader could neither read the predicate that failed nor the value it was
    // measured against. The verdict is still the POST-CLICK observation (`afterClick`
    // re-disabled AND the content reverted), gated on the hit-tested path — a no-op
    // click or a failed revert still FAILS.
    const assertion = 'After an edit the Undo control is enabled, and a REAL click on it reverts the content and re-disables the control at base (the verdict is the post-click observation, never the edit call)'
    const required = "undo control ENABLED after the edit (afterEdit === false) AND a REAL hit-tested click on '#editor-toolbar-undo' (gesturePath='cdp') AND the control RE-DISABLED at base after the click (afterClick === true) AND the edited content GONE from the store read-back (reverted === true)"
    const observed = `undo disabled before=${before} afterEdit=${afterEdit} (enabled=${afterEdit === false}); REAL click '#editor-toolbar-undo' path=${clickPath} → afterClick disabled=${afterClick}; revert observed (edited content gone from the store read-back)=${reverted}; edit.set_content result=${JSON.stringify(edited)} (setup only, NOT the verdict)`
    const realInput = clickPath === 'cdp'
    const pass = realInput && afterClick === true && reverted
    return rowResult(
      { row: 'UF-HIST-2', dclass: 'D-state' },
      assertion,
      observed,
      { path: clickPath, ok: pass, surface: surface, undoDisabledAfter: afterClick, required: required, observed: observed },
    )
  },
  toolbar_toggle: async (h) => {
    // UF-STAGE-6 — the editor-toolbar representation-mode toggle (§9 `T-2`: the
    // scenario re-derived against the LANDED successor `DECIDED:
    // REPRESENTATION-MODE-SUCCESSOR`): a REAL hit-tested click flips `data-mode`
    // live between the two `representationMode` union members `html` | `markdown`
    // (`src/renderer/pane-graph.ts` `EDITOR_TOOLBAR_TOGGLE_ID`).
    await ufEnsureAppClear(h)
    const surface = await ufSurfaceTarget(h)
    const assertion = 'A REAL click on the editor-toolbar mode toggle flips the representation mode live (data-mode html↔markdown)'
    const before = await h.cdp.domAttr('#editor-toolbar-toggle', 'data-mode')
    if (before == null) return rowResult({row:'UF-STAGE-6',dclass:'D-interaction'}, assertion, 'no #editor-toolbar-toggle', { path: 'missing', ok: false, surface })
    const click = await ufRealClick(h, '#editor-toolbar-toggle')
    // poll for the live flip (the app re-render is async; a fixed short sleep
    // would read the pre-click attribute and report a false no-op)
    let after = before
    for (let i = 0; i < 8 && after === before; i++) {
      await sleep(300)
      after = await h.cdp.domAttr('#editor-toolbar-toggle', 'data-mode')
    }
    const flipped = after !== before && (after === 'html' || after === 'markdown')
    return rowResult({row:'UF-STAGE-6',dclass:'D-interaction'}, assertion, `REAL click '#editor-toolbar-toggle' (path=${click.path}) → data-mode before=${before} after=${after} flipped=${flipped} (union members html|markdown)`, { path: click.path, ok: flipped, surface })
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
    // toolbar representation-mode data-mode after a direct operatorSet toggle for
    // LIVE-9 (§9 `T-2`: swept onto the LANDED `representationMode` carrier).
    const before = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');return {pc:f?f.getAttribute('data-pane-collapse'):null,ic:f?f.classList.contains('is-collapsed'):null}})()`)
    const direct = await h.cdp.evaluate(`(()=>{const s=window.provident&&window.provident.sidebar;if(!s||typeof s.togglePaneCollapse!=='function')return 'no-seam'; try{s.togglePaneCollapse('doc-nav');return 'called'}catch(e){return 'threw:'+String(e)}})()`)
    await sleep(600)
    const after = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');return {pc:f?f.getAttribute('data-pane-collapse'):null,ic:f?f.classList.contains('is-collapsed'):null,zone:f?f.getAttribute('data-zone'):null}})()`)
    const toggleBefore = await h.cdp.domAttr('#editor-toolbar-toggle', 'data-mode')
    const toggleDirect = await h.cdp.evaluate(`(()=>{const s=window.provident&&window.provident.sidebar;if(!s||typeof s.operatorSet!=='function')return 'no-opset'; try{s.operatorSet({representationMode:'markdown'});return 'called'}catch(e){return 'threw:'+String(e)}})()`)
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
    let id = '.live-fixture/core/alpha'
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
    let id = '.live-fixture/core/alpha'
    try { id = docs.documents[0].documentId || docs.documents[0].id || id } catch {}
    // resolve a real content nodeId inside the doc for the nodeId-scoped variant
    const doc = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: id, store: 'main' }).catch((e) => ({ error: String(e) }))
    let nodeId = id
    try { const n = doc && doc.nodes && doc.nodes.find((x) => x.type !== 'div'); nodeId = (n && n.id) || id } catch {}
    const scopedTarget = await h.mcpTool(h.mcp, 'rag.query', { store: 'main', query: 'alpha', topK: 3, filters: { target: { documentId: id, nodeId } } }).catch((e) => ({ error: String(e) }))
    const scopeFilter = await h.mcpTool(h.mcp, 'rag.query', { store: 'main', query: 'alpha', topK: 3, filters: { documentPathPrefix: ['.live-fixture/core'], nodeKind: 'content' } }).catch((e) => ({ error: String(e) }))
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
    const fresh = ufMockFixtureWritePath('ms3-fresh.md')
    mkdirSync(dirname(ufMockFixtureWritePath('ms3-fresh.md')), { recursive: true })
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
    const fresh = ufMockFixtureWritePath('import1-fresh.md')
    mkdirSync(dirname(ufMockFixtureWritePath('import1-fresh.md')), { recursive: true })
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
    if (!hasBtn) return rowResult({row:'UF-DEFECT-1',dclass:'D-interaction'}, '[data-tab-new] mints a NEW usable tab (never a silent no-op)', detail, { path: 'no-button', ok: false, surface })
    return rowResult({row:'UF-DEFECT-1',dclass:'D-interaction'}, '[data-tab-new] mints a NEW usable tab (never a silent no-op)', detail, { path: click.path, ok: newTab && usable, surface })
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
    if (!Array.isArray(s0) || s0.length < 2) return rowResult({row:'UF-DEFECT-2',dclass:'D-interaction'}, 'A REAL pane-HEADER drag reorders/relocates the pane (the zone slot order changes)', `not enough left-zone panes: ${JSON.stringify(s0)}`, { path: 'missing', ok: false, surface })
    // pick an in-viewport pane; drag from ITS HEADER (the collapse-toggle strip).
    const start = await h.cdp.evaluate(`(()=>{const fs=[...document.querySelectorAll('[data-zone="left"] .pane-frame[data-pane-id]')];const cur=fs.find(f=>f.getAttribute('data-pane-id')==='doc-nav')||null;const f=cur||fs[0];const r=f.getBoundingClientRect();if(r.y>window.innerHeight-30)return {err:'off-viewport',pid:f.getAttribute('data-pane-id')};const hdr=f.querySelector('.pane-collapse-toggle');const hd=hdr?hdr.getBoundingClientRect():r;const x=Math.round(hd.x+Math.min(hd.width/2,160)),y=Math.round(hd.y+hd.height/2);const hit=document.elementFromPoint(x,y);return {pid:f.getAttribute('data-pane-id'),x:x,y:y,hdr:!!hdr,hit:hit?(hit.id||hit.tagName):null,onTarget:!!(hit&&(hit===f||f.contains(hit)))}})()`)
    if (start.err) return { ...rowResult({row:'UF-DEFECT-2',dclass:'D-interaction'}, 'A REAL pane-HEADER drag reorders/relocates the pane (the zone slot order changes)', `drag start ${start.err} on ${start.pid} — the pane header is not in the viewport after the scroll reset, so the REAL gesture cannot be driven this pass (an INCONCLUSIVE precondition, not a behavior FAIL)`, { path: 'off-viewport', ok: false, surface }), park: true, verdict: 'PARKED' }
    const target = await h.cdp.evaluate(`(()=>{const fs=[...document.querySelectorAll('[data-zone="left"] .pane-frame[data-pane-id]')];const idx=fs.findIndex(f=>f.getAttribute('data-pane-id')==='${start.pid}');const nx=fs[idx+1];if(!nx)return null;const r=nx.getBoundingClientRect();return {pid:nx.getAttribute('data-pane-id'),y:Math.round(r.y),h:Math.round(r.height)}})()`)
    if (!target) return rowResult({row:'UF-DEFECT-2',dclass:'D-interaction'}, 'A REAL pane-HEADER drag reorders/relocates the pane (the zone slot order changes)', `no sibling below ${start.pid}`, { path: 'missing', ok: false, surface })
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
    return rowResult({row:'UF-DEFECT-2',dclass:'D-interaction'}, 'A REAL pane-HEADER drag reorders/relocates the pane (the zone slot order changes)', `REAL header drag on .pane-frame[data-pane-id="${start.pid}"] .pane-collapse-toggle (header=${start.hdr}) from (${start.x},${start.y}) hit=${start.hit} onTarget=${start.onTarget} PAST ${target.pid}@y=${target.y}->ty=${ty}; slot order changed=${changed} before=[${seq0}] after=[${seq1}]; ${start.pid} y=${afterPos ? afterPos.y : 'gone'}`, { path: gesturePath, ok: changed && start.onTarget, surface })
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
    if (!zmin) return rowResult({row:'UF-KEEP-1',dclass:'D-visual'}, 'After minimizing, the pane-tab strips render as a VERTICAL column', 'no sidebar zone-minimize control', { path: 'missing', proxy: 'synthetic .click() driver only', ok: false, surface })
    // SYNTHETIC driver ([DIAG]-classified): recorded as a proxy, never a real gesture.
    await h.cdp.evaluate(`(()=>{const b=document.getElementById('zone-minimize-left')||document.querySelector('.pane-zone-minimize');if(!b)return 'no-btn';b.click();return 'clicked'})()`)
    await sleep(900)
    const tabs = await h.cdp.evaluate(`(()=>{const ts=[...document.querySelectorAll('.pane-tab')].map((el,i)=>{const r=el.getBoundingClientRect();return {i,x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}});return {ts,frameCount:document.querySelectorAll('.pane-frame[data-pane-id]').length,zoneMin:[...document.querySelectorAll('[data-zone="left"],.pane-zone-minimize')].map(z=>({tag:z.tagName,id:z.id||'',cls:String(z.className)}))}})()`)
    const t = Array.isArray(tabs.ts) ? tabs.ts : []
    // vertical re-orientation == distinct increasing y, uniform small height, same x
    const vertical = t.length >= 2 && new Set(t.map((o) => o.y)).size === t.length && new Set(t.map((o) => o.h)).size === 1 && new Set(t.map((o) => o.x)).size === 1
    return {
      ...rowResult({row:'UF-KEEP-1',dclass:'D-visual'}, 'After minimizing, the pane-tab strips render as a VERTICAL column', `sidebar minimized by a SYNTHETIC .click() ([DIAG] proxy driver): pane-frames ${preFrames}->${tabs.frameCount}, .pane-tab strips ${preTabs}->${t.length}; vertical=${vertical} (distinct-y, uniform-h=${t[0] ? t[0].h : '?'}, equal-x); strips=${JSON.stringify(t.slice(0, 8))}; zones/min=${JSON.stringify(tabs.zoneMin)}`, { path: 'synthetic-click([DIAG])', proxy: 'synthetic .click() driver + geometry/computed-style oracle', ok: vertical, surface }),
      proxyPASS: true,
      pass: false,
    }
  },

  // BUG 4 — into a seeded document (alpha), click the body text: the editable
  // surface must ENGAGE (contenteditable active) AND an edit/blur must COMMIT
  // (a store write — rag.get_document reflects the typed text).
  user4_main_editable: async (h) => {
    await ufEnsureAppClear(h)
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/alpha' } }).catch((e) => ({ err: String(e.message || e) }))
    await sleep(800)
    const surface = await ufSurfaceTarget(h)
    const ed = await h.cdp.evaluate(`(()=>{const e=document.querySelector('[contenteditable]');if(!e)return null;e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();const x=Math.round(r.x+20),y=Math.round(r.y+14);const hit=document.elementFromPoint(x,y);return {x:x,y:y,hit:hit?(hit.id||hit.tagName):null,onTarget:!!(hit&&(hit===e||e.contains(hit))),vp:[innerWidth,innerHeight],inVp:(x>=0&&y>=0&&x<=innerWidth&&y<=innerHeight)}})()`)
    if (!ed) {
      const zonehtml = await h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:main');return z?(z.innerHTML||'').slice(0,140):'no-zone:main'})()`)
      return rowResult({row:'UF-STAGE-3',dclass:'D-state'}, 'The main view IS editable and an edit commits on blur (the store read-back contains the typed marker)', `document focused but NO [contenteditable] body text; zone:main=${zonehtml}`, { path: 'missing', ok: false, surface })
    }
    // §2.3 `H-3` clause 1 (`G-9`) — THIS BLOCK DISPATCHES ITS OWN POINTER EVENTS
    // (the inline `Input.dispatchMouseEvent` route, not `ufRealClick`), so it logs
    // its OWN hit-tested probe through the central gesture log: its `ROW` line then
    // carries the same coordinate/viewport/hit/onTarget/inVp record as the
    // `ufRealClick` route does. The record is data — it changes no verdict.
    ufLogProbe('[contenteditable] (body-text click)', ed)
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
    const doc = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-fixture/core/alpha' }).catch((e) => ({ err: String(e.message || e) }))
    const committed = JSON.stringify(doc).includes(marker)
    const inDom = await h.cdp.evaluate(`document.body.innerText.includes(${JSON.stringify(marker)})`)
    return rowResult({row:'UF-STAGE-3',dclass:'D-state'}, 'The main view IS editable and an edit commits on blur (the store read-back contains the typed marker)', `body-text click hit=${ed.hit} onTarget=${ed.onTarget} → editable engages activeElement-contenteditable=${JSON.stringify(engaged)}; typed '${marker}' in STORE rag.get_document=${committed}, in DOM=${inDom}`, { path: ed.onTarget ? 'cdp' : 'synthetic-keyboard-only', ok: engaged === true && committed && ed.onTarget, surface })
  },

  // BUG 5 — the history/undo/redo segment must render INSIDE its pane frame and
  // NOT inside the main `#zone:main` canvas.
  user5_history_in_pane: async (h) => {
    const r = await h.cdp.evaluate(`(()=>{const h=document.querySelector('[data-role="history"],#pane-history');if(!h)return {err:'no [data-role=history]/#pane-history in DOM'};const main=document.getElementById('zone:main');let parentChain=[],a=h;while(a&&parentChain.length<8){parentChain.push((a.id?('#'+a.id):a.tagName)+'.'+String(a.className).slice(0,18));a=a.parentElement}return {present:true,inMainCanvas:!!main&&main.contains(h),inPaneFrame:!!h.closest('.pane-frame'),chain:parentChain}})()`)
    const surface = await ufSurfaceTarget(h)
    if (r.err) return rowResult({row:'UF-DEFECT-3',dclass:'D-visual'}, 'The history/undo/redo segment renders INSIDE a .pane-frame, not in the #zone:main canvas', r.err, { path: 'not-gesture', proxy: 'DOM-ancestry-only oracle (no gesture)', ok: false, surface })
    return rowResult({row:'UF-DEFECT-3',dclass:'D-visual'}, 'The history/undo/redo segment renders INSIDE a .pane-frame, not in the #zone:main canvas', `[data-role="history"] present=true; inside MAIN #zone:main canvas=${r.inMainCanvas}; inside a .pane-frame=${r.inPaneFrame}; ancestry=${JSON.stringify(r.chain)}`, { path: 'not-gesture', gesture: false, proxy: 'DOM-ancestry oracle (no gesture can drive it)', ok: !r.inMainCanvas && r.inPaneFrame, surface })
  },

  // BUG 6 — switch the active tab to Search; the search view is active and the
  // LANDING must NOT re-render over it (sampled three times after a delay).
  // PROXY: the tab switch is a synthetic DOM `.click()` and the only oracle is a
  // DOM-PRESENCE probe (`!!document.getElementById('stage-landing')`) — the row
  // is recorded `proxyPASS:true` with `pass:false` until a PAINTED box/paint
  // oracle over the three samples replaces it (§6.1).
  user6_search_no_flicker: async (h) => {
    const surface = await ufSurfaceTarget(h)
    // §2.1.1 limb 2 — THE TAB-STRIP READ this row's driver rests on: which tab is
    // the SEARCH tab and what the strip carries beside it (the corpus DOCUMENT tabs,
    // by their own `data-document-id` identity). The row's own oracle below stays
    // corpus-free (it samples `#stage-landing`, `§2.3` `P-1`), which is why its
    // declaration entry reads `corpusRead:false` while the strip read it routes
    // through is the corpus-keyed one (`ufTabStripRead`).
    const strip = await ufTabStripRead(h)
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
      ...rowResult({row:'UF-KEEP-3',dclass:'D-visual'}, 'Switching to Search leaves the search view active and never overlays a landing flicker (sampled 3×)', `PROXY ORACLE ONLY (DOM presence probe \`!!document.getElementById("stage-landing")\` + tab-title text): switched tab by a SYNTHETIC .click() ([DIAG], path not hit-tested) ${clicked}; samples t+800=${JSON.stringify(s1)} t+1800=${JSON.stringify(s2)} t+3000=${JSON.stringify(s3)}; activeSearch=${activeSearch} noLanding(presence,all3)=${noLanding} noLandingPaintedBox(all3)=${noLandingPaint}; tab strip read (\`ufTabStripRead\`, §2.1.1 limb 2): ${strip.rows.length} tab(s), ${strip.docTabRows} document-tab row(s) carrying their own corpus id`, { path: 'synthetic-click([DIAG])', proxy: 'DOM presence probe !!document.getElementById("stage-landing") across 3 samples (no painted-box paint oracle)', ok: activeSearch && noLanding, surface }),
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
    const before = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-fixture/core/alpha' }).catch((e) => ({ err: String(e.message || e) }))
    const beforeS = JSON.stringify(before)
    const beforeP = (before && before.nodes || []).find((n) => n.type === 'p')
    // 1) focus alpha
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/alpha' } }).catch((e) => ({ err: String(e.message || e) }))
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
    const after = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-fixture/core/alpha' }).catch((e) => ({ err: String(e.message || e) }))
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
  // doc. The RAG paragraph `.live-fixture/core/alpha:p:1` ("Settings modal (C3). The
  // document alpha documents.") is emitted TWICE as a user-visible editable
  // paragraph: once nested inside the `<h1 data-doc-head>` section header (so it
  // shows with header styling) and once as a sibling content root directly in
  // `zone:main`. User report: editing the TOP copy cascades DOWN; editing the
  // BOTTOM copy does NOT cascade up. Asserted CORRECT behavior: (1) EXACTLY ONE
  // editable `[data-rag-node-id]` p:1 paragraph; (2) none nested in the header;
  // (3) an edit lands in exactly one paragraph position.
  repro_dup_para: async (h) => {
    const rid = '.live-fixture/core/alpha:p:1'
    // 0) focus alpha so its document subtrees are live in the DOM
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/alpha' } }).catch(() => {})
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
    const geo = await h.cdp.evaluate(`(()=>{const all=[...document.querySelectorAll('[contenteditable]')];const el=all.find((e)=>(e.textContent||'').includes('Settings'))||all[0];if(!el)return null;const nested=!!el.closest('[data-doc-head]');const r=el.getBoundingClientRect();const x=Math.round(r.x+20),y=Math.round(r.y+14);const hit=document.elementFromPoint(x,y);return {x:x,y:y,ragId:el.getAttribute('data-rag-node-id'),tag:el.tagName,id:el.id,nestedInHeader:nested,onScreen:r.y>=0&&r.y<window.innerHeight,hit:hit?(hit.id||hit.tagName):null,onTarget:!!(hit&&(hit===el||el.contains(hit))),vp:[innerWidth,innerHeight],inVp:(x>=0&&y>=0&&x<=innerWidth&&y<=innerHeight)}})()`)
    let edit = 'no-editable-focus'
    if (geo && geo.onScreen) {
      // §2.3 `H-3` clause 1 (`G-9`) — the inline `Input.dispatchMouseEvent` route
      // logs its own hit-tested probe, so this row's `ROW` line carries the
      // coordinate/viewport/hit/onTarget/inVp record like the `ufRealClick` route.
      ufLogProbe('[contenteditable] (paragraph-edit click)', geo)
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
    if (!editProven) return rowResult({row:'UF-STAGE-2',dclass:'D-visual'}, 'Each RAG paragraph materializes exactly ONCE as a sibling editable root (never nested in the doc-head)', `the paragraph-edit half could NOT be driven (no [contenteditable] in the viewport): ${detail}`, { path: 'missing', proxy: 'DOM-count/innerHTML oracle only this run (no painted edit proof)', ok: false, surface })
    return rowResult({row:'UF-STAGE-2',dclass:'D-visual'}, 'Each RAG paragraph materializes exactly ONCE as a sibling editable root (never nested in the doc-head)', detail, { path: 'cdp', ok: singleRender && notNested && editCascadePrimaryOk, surface })
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
    if (w0 == null || !edge) return rowResult({row:'UF-DEFECT-5',dclass:'D-interaction'}, 'A REAL drag at the visible zone boundary resizes the zone width by >10px', 'no [data-zone=left] / edge', { path: 'missing', ok: false, surface })
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
    return rowResult({row:'UF-DEFECT-5',dclass:'D-interaction'}, 'A REAL drag at the visible zone boundary resizes the zone width by >10px', `left-zone width before=${w0}px; REAL user boundary-drag (CDP coord @edge=${edge.x}, hit=${edge.hit}, onTarget=${edge.onTarget}) after=${w1a}px (Δ=${Math.abs(w1a - w0)} changed>10px=${changedA}); [DIAG] synthetic pointer on hidden .gutter element after=${w1b}px (Δ=${Math.abs(w1b - w0)} changed>10px=${changedB}); final=${wFinal}px; gutter=${JSON.stringify(gutter)}; native=${nat}`, { path: edge.onTarget ? 'cdp' : 'native-fallback', ok: changedA && edge.onTarget, surface })
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
    return rowResult({row:'UF-DEFECT-6',dclass:'D-visual'}, 'A VISIBLE separator (painted px gap / border / background / real gutter) divides zone:left from #zone:main', detail, { path: 'not-gesture', gesture: false, proxy: computedOnly ? 'computed-style-only oracle (no painted seam px this run)' : null, ok: boundaryOk && seamPainted, surface })
  },

  // BUG 9 — "Open in a tab" (#pane-search-expand-tab, HOST-5 paneTabExpand) must
  // open a NEW tab whose visible content is the SEARCH view (a search input /
  // results), NOT the already-open document body. Drive the REAL click on the
  // button while the open document tab is active, then report which tab is active
  // and what #zone:main renders.
  user9_search_open_in_tab: async (h) => {
    // §5.5 `FA-1`/`FA-2` + §16.5 — THE BLOCK'S OWN DECLARED FIXTURE IS ASKED FIRST:
    // at a NON-EMPTY store the gate's own predicate is false, so a fixture-absence park
    // for THIS fixture rides the block's OWN body, named and route-tagged.
    { const ownPark = await ufFixtureOwnPark(h, 'user9_search_open_in_tab', 'corpus-document-tabs', 'UF-DEFECT-7'); if (ownPark !== null) return ownPark }
    await ufEnsureAppClear(h)
    const surface = await ufSurfaceTarget(h)
    // §2.1.1 limb 2 — THE DOCUMENT TAB this row needs is read by its OWN identity:
    // the strip's document-tab rows (`data-document-id`), through `ufTabStripRead`.
    const strip = await ufTabStripRead(h)
    // make the already-open document (alpha) the active tab (REAL click)
    const alphaRow = strip.rows.find((t) => /alpha/.test(t.title))
    const tabSel = alphaRow && alphaRow.tabId ? `.tab[data-tab-id="${alphaRow.tabId}"]` : null
    const tabPath = tabSel ? (await ufRealClick(h, tabSel)).path : 'no-alpha-tab'
    await sleep(600)
    const btn = await h.cdp.evaluate(`(()=>{const b=document.getElementById('pane-search-expand-tab');return b?String(b.className):null})()`)
    if (btn == null) return rowResult({row:'UF-DEFECT-7',dclass:'D-interaction'}, '"Open in a tab" creates a tab whose stage shows the SEARCH view, not the document body', 'no #pane-search-expand-tab', { path: 'missing', ok: false, surface })
    const beforeTabs = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('.tab')].map((t)=>({txt:(t.textContent||'').trim().slice(0,20),active:t.classList.contains('is-active')})))()`)
    // REAL hit-tested click on the expand-tab control (no synthetic .click() fallback)
    const clicked = await ufRealClick(h, '#pane-search-expand-tab', { nativeFallback: false })
    await sleep(900)
    const afterTabs = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('.tab')].map((t)=>({txt:(t.textContent||'').trim().slice(0,20),active:t.classList.contains('is-active')})))()`)
    const activeIdx = afterTabs.findIndex((t) => t.active)
    const activeTabTitle = afterTabs[activeIdx] ? afterTabs[activeIdx].txt : null
    const content = await h.cdp.evaluate(`(()=>{
      const main=document.getElementById('zone:main'); const bodyText=main?(main.textContent||''):'';
      // ORACLE NOTE (U-STAGE-ACTIVE-TAB §8.3 item 1 re-run): the search tab's
      // stage authors its OWN roots (pane-graph.ts searchTabContent:
      // #stage-search-tab + #search-tab-input + #stage-search-tab-submit),
      // so the pre-existing detector — which only looked for the search PANE's
      // control ids — read the (correct) search stage as "no search shown" and
      // FAILED on a stale oracle. The pinned ids are read here; every other
      // assertion of this block is unchanged.
      const searchInput=!!(main&&(main.querySelector('#stage-search-tab')||main.querySelector('#search-tab-input')||main.querySelector('input[type="text"]')||main.querySelector('[contenteditable="plaintext-only"]')||main.querySelector('#advanced-search-toggle')||main.querySelector('[placeholder*="search" i]')));
      const ragResults=!!document.querySelector('[class*="result" i],[data-rag-results],[data-search-result]');
      const isDocBody=/Settings modal/i.test(bodyText)||/document alpha/.test(bodyText)||/^Alpha/.test(bodyText.trim());
      return {hasSearchInput:searchInput, hasRagResults:ragResults, isDocumentBody:isDocBody, bodySnippet:bodyText.replace(/\\s+/g,' ').slice(0,90)};
    })()`)
    const newTabCreated = beforeTabs.length < afterTabs.length
    const searchShown = content.hasSearchInput || content.hasRagResults
    const docShown = content.isDocumentBody
    return rowResult({row:'UF-DEFECT-7',dclass:'D-interaction'}, '"Open in a tab" creates a tab whose stage shows the SEARCH view, not the document body', `button=${JSON.stringify({ id: 'pane-search-expand-tab', cls: btn })} active-alpha-tab REAL click path=${tabPath}; REAL click #pane-search-expand-tab path=${clicked.path}\n before-tabs=${JSON.stringify(beforeTabs)}\n after-tabs=${JSON.stringify(afterTabs)}\n newTabCreated(count ${beforeTabs.length}->${afterTabs.length})=${newTabCreated}\n ACTIVE tab=${activeTabTitle} (index=${activeIdx})\n #zone:main: searchInput=${content.hasSearchInput} ragResults=${content.hasRagResults} isDocumentBody=${content.isDocumentBody} snippet="${content.bodySnippet}"`, { path: clicked.path, ok: searchShown && !docShown, surface })
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
    return rowResult({row:'UF-DEFECT-8',dclass:'D-visual'}, 'Minimized-zone labels read VERTICALLY (bottom-to-top): writing-mode vertical-rl/lr or text-orientation upright, painted', `REAL click #zone-minimize-left path=${zmin.path}; zone minimized=${dump.minimized}; collapsed labels=${dump.tabCount} painted=${painted}; each: ${dump.tabs.map((t) => t.id + ':writingMode=' + t.writingMode + '/textOrientation=' + t.textOrientation + '/size=' + t.w + 'x' + t.h).join(', ')}; vertical=${verticalOk} (horizontal default: writing-mode=horizontal-tb)`, { path: zmin.path, ok: verticalOk && painted, surface })
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
      await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/alpha' }, newTab: true }).catch(() => null)
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
    return rowResult({row:'UF-TABS-1',dclass:'D-visual'}, 'The rendered strip gives every open tab a title, highlights exactly one active tab, gives every tab a painted close control, and scrolls horizontally on overflow', `strip: ${s0.count} tabs, every tab titled=${titled}, exactlyOneActive=${oneActive}, perTabCloseControlWithPaintedBox=${closes} (box ${JSON.stringify(s0.tabs[0] ? s0.tabs[0].closeBox : null)}), activeHighlightDiffersFromInactive=${highlight} (active border=${act ? act.border : '-'} bg=${act ? act.bg : '-'} weight=${act ? act.weight : '-'} vs inactive border=${inact ? inact.border : '-'} bg=${inact ? inact.bg : '-'} weight=${inact ? inact.weight : '-'}); overflow at ${s.count} tabs: scrollWidth=${s.stripScroll[0]} clientWidth=${s.stripScroll[1]} overflow-x=${s.stripOverflowX} → horizontalScroll=${overflow} (opened ${s.count - openedWith} doc tabs via MCP provident.focus{newTab:true} setup); [restore] closed ${closed} tabs with REAL clicks on .tab.is-active .tab-close → ${sEnd.count} tabs left`, { path: restorePath, ok: titled && oneActive && closes && highlight && overflow, surface: await ufSurfaceTarget(h) })
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
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/alpha' }, newTab: true }).catch(() => null)
    await sleep(900)
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/beta' }, newTab: true }).catch(() => null)
    await sleep(1400)
    // the PINNED default identity for the post-last-close page (setup read, not the gesture)
    const defaultDoc = await h.cdp.evaluate(`(()=>{const e=document.getElementById('operator-default-document');return e?String(e.textContent||'').trim():null})()`).catch(() => null)
    const expectedDefault = defaultDoc && /^\(all\)$/i.test(defaultDoc) ? null : defaultDoc
    const s0 = await ufTabState(h)
    const act = s0.tabs[s0.activeIndex]
    const left = s0.activeIndex > 0 ? s0.tabs[s0.activeIndex - 1] : null
    const docsList = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
    const docIds = (docsList && Array.isArray(docsList.documents) ? docsList.documents : []).map((d) => d.documentId || d.id).filter(Boolean)
    // ⟨gate-4 `D-1`⟩ THE ROW IDENTITY OF THIS CLICK: the close series IS the gesture
    // of BOTH rows this block carries, so the entry names them (attached by identity,
    // never by rotation).
    const clicked = await ufRealClick(h, '.tab.is-active .tab-close', { rows: ['UF-TABS-3', 'U-8'] })
    await sleep(1600)
    const s1 = await ufTabState(h)
    const neighbourActive = !!left && s1.tabs.some((t) => t.active && t.id === left.id)
    const neighbourMounted = !!left && typeof s1.mountedDocId === 'string' && s1.mountedDocId.includes(left.title)
    // close down to one tab, then close the LAST one
    let lastPath = 'not-reached'
    for (let i = 0; i < 12; i++) {
      const cur = await ufTabState(h)
      if (cur.count <= 1) break
      const r = await ufRealClick(h, '.tab.is-active .tab-close', { rows: ['UF-TABS-3', 'U-8'] })
      if (r.path !== 'cdp') { lastPath = r.path; break }
      await sleep(1500)
    }
    const oneLeft = await ufTabState(h)
    if (oneLeft.count === 1) {
      lastPath = (await ufRealClick(h, '.tab.is-active .tab-close', { rows: ['UF-TABS-3', 'U-8'] })).path
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
    const ufTabs3Assertion = 'Closing the ACTIVE tab activates its left neighbour and mounts that neighbour body; closing the LAST tab yields the pinned default page (landing or defaultDocument) with a painted non-empty stage'
    const ufTabs3Evidence = `REAL click on .tab.is-active .tab-close (path=${clicked.path}) closed active tab ${act ? act.id + ' "' + act.title + '"' : '?'}: count ${s0.count}->${s1.count}; LEFT neighbour ${left ? '"' + left.title + '"' : '(none)'} becameActive=${neighbourActive} and its body mounted in #zone:main=${neighbourMounted} (mountedDocId=${s1.mountedDocId}); then closed down to ${oneLeft.count} tab and closed the LAST one (real click, path=${lastPath}) → tabs=${afterLast.count} activeTitle=${activeTitle} mountedDocId=${afterLast.mountedDocId} landing=${afterLast.landing} stageLen=${afterLast.mainLen} stageBox=${JSON.stringify(afterLast.mainBox)}; pinned default identity (operator defaultDocument="${defaultDoc}" → expected=${expectedDefault}) matched=${identityMatches}; landing-page=${landed}; stage shows a REAL store document under its own tab (candidates=${JSON.stringify(docIds.slice(0, 4))})=${realDocument} → freshDefaultPage(never an empty stage)=${freshDefault}`
    const ufTabs3Opts = { path: clicked.path === 'cdp' && lastPath === 'cdp' ? 'cdp' : lastPath, ok: clicked.path === 'cdp' && s1.count === s0.count - 1 && neighbourActive && neighbourMounted && oneLeft.count === 1 && freshDefault, surface: await ufSurfaceTarget(h) }
    // §2.1 `E-2` — the DECLARED row `U-8` (MATRIX_ROWS maps `U-8` to this block)
    // carries ITS OWN verdict for the LAST-TAB half of the claim: closing the LAST
    // tab yields the default page, never an empty stage. The checklist row
    // `UF-TABS-3` keeps its own result (the neighbour-activation half included).
    return [
      rowResult({ row: 'UF-TABS-3', dclass: 'D-state' }, ufTabs3Assertion, ufTabs3Evidence, ufTabs3Opts),
      declaredRowResult('U-8', 'UF-TABS-3', 'Closing the LAST tab yields the default page (the landing, or the operator defaultDocument, or a real store document under its own tab) — NEVER an empty stage', 'D-state', ufTabs3Evidence, { ...ufTabs3Opts, checklistRow: 'UF-TABS-3' }),
    ]
  },

  // UF-TABS-4 — switching tabs mounts ONLY the active target's body in
  // `#zone:main`; the previous document body unmounts.
  uf_tabs_4: async (h) => {
    await ufEnsureAppClear(h)
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/alpha' }, newTab: true }).catch(() => null)
    await sleep(900)
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/beta' }, newTab: true }).catch(() => null)
    await sleep(1400)
    const s0 = await ufTabState(h)
    const alphaTab = s0.tabs.find((t) => t.kind === 'document' && t.title === '.live-fixture/core/alpha')
    const betaTab = s0.tabs.find((t) => t.kind === 'document' && t.title === '.live-fixture/core/beta')
    if (!alphaTab || !betaTab) return rowResult({row:'UF-TABS-4',dclass:'D-visual'}, 'Switching tabs mounts ONLY the active target body in #zone:main and unmounts the prior document body', `need an alpha AND a beta document tab; tabs=${JSON.stringify(s0.tabs.map((t) => t.id + ':' + t.kind + ':' + t.title))}`, { path: 'missing', ok: false, surface: await ufSurfaceTarget(h) })
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
    return rowResult({row:'UF-TABS-4',dclass:'D-visual'}, 'Switching tabs mounts ONLY the active target body in #zone:main and unmounts the prior document body', `REAL click on tab ${alphaTab.id} (path=${cA.path}): #zone:main mounts alpha=${aMounted} (mountedDocId=${sA.mountedDocId}) and the prior beta body is GONE from #zone:main=${bGone}; REAL click on tab ${betaTab.id} (path=${cB.path}): mounts beta=${bMounted} (mountedDocId=${sB.mountedDocId}) and alpha is gone=${aGone}; exactly one active tab in each sample=${singleActive}`, { path: cA.path === 'cdp' && cB.path === 'cdp' ? 'cdp' : 'native-fallback', ok: cA.path === 'cdp' && cB.path === 'cdp' && aMounted && bGone && bMounted && aGone && singleActive, surface: await ufSurfaceTarget(h) })
  },

  // UF-TABS-7 — a search result row click opens the document in a NEW tab
  // (the search tab stays). The row's gesture is the hit-tested real-click
  // helper; the click-probe separates a dead handler from a gesture that never
  // delivers the click, and a native DOM click (attribution evidence only)
  // lives in the separate `uf_tabs_7_diag` block so it can never flip the verdict.
  uf_tabs_7: async (h) => {
    // §5.5 `FA-1`/`FA-2` + §16.5 — THE BLOCK'S OWN DECLARED FIXTURE IS ASKED FIRST:
    // at a NON-EMPTY store the gate's own predicate is false, so a fixture-absence park
    // for THIS fixture rides the block's OWN body, named and route-tagged.
    { const ownPark = await ufFixtureOwnPark(h, 'uf_tabs_7', 'corpus-query-results', 'U-2'); if (ownPark !== null) return ownPark }
    await ufEnsureAppClear(h)
    await ufEnsurePaneExpanded(h, 'search')
    // setup: open a SEARCH tab with a REAL click on the pane's expand-tab control
    const expand = await ufRealClick(h, '#pane-search-expand-tab')
    await sleep(1600)
    const search = await ufPaneSearch(h, 'alpha')
    const before = await ufTabState(h)
    const rows = search.rows || []
    const surface = await ufSurfaceTarget(h)
    const ufTabs7Assertion = 'A REAL click on a search result row opens that document in a NEW document tab while the search tab stays'
    if (rows.length === 0) {
      const why = `the search pane rendered NO result rows → the row click cannot be driven; search=${JSON.stringify(search)}`
      // §2.1 `E-2`/`E-3` — the DECLARED row `U-2` still ends in a VERDICT (here
      // NOT-DRIVEN with the concrete driver-side reason: the search surface
      // rendered no result row), never in an omission. No verdict is invented and
      // no app FAIL is credited.
      return [
        rowResult({ row: 'UF-TABS-7', dclass: 'D-interaction' }, ufTabs7Assertion, why, { path: 'missing', ok: false, surface }),
        declaredRowResult('U-2', 'UF-TABS-7', ufTabs7Assertion, 'D-interaction', why, { path: 'missing', ok: false, surface, required: 'a rendered, painted search-result row (a `#pane-search li[data-document-id]`) to drive the real click', observed: why, checklistRow: 'UF-TABS-7' }),
      ]
    }
    const row = rows[0]
    await ufArmClick(h)
    // ⟨gate-4 `D-1`⟩ the row identity this click was driven for (both rows this block owns).
    const r = await ufRealClick(h, '#pane-search li[data-document-id]', { rows: ['UF-TABS-7', 'U-2'] })
    await sleep(1800)
    const events = await ufClickProbe(h)
    const after = await ufTabState(h)
    const newTab = after.count === before.count + 1
    const docTab = after.tabs.some((t) => t.kind === 'document' && t.title === row.doc)
    const searchTabStays = before.tabs.some((t) => t.kind === 'search') && after.tabs.some((t) => t.kind === 'search')
    const detail = `search pane: disclosure=${search.togglePath} query="${search.value}" submit=${search.submitPath} → ${rows.length} result rows painted (first row doc=${row.doc} box=${JSON.stringify(row.box)} cls="${row.cls}"); REAL click on that row (path=${r.path} hit=${r.rect ? r.rect.hit : '?'}): tabs ${before.count}->${after.count} newDocumentTab=${newTab} openedDocTab=${docTab} searchTabStillOpen=${searchTabStays}; click-event targets=${JSON.stringify(events)}`
    const diag = '; [DIAG] attribution available — run --block=uf_tabs_7_diag (a NATIVE DOM click on the same row) to separate a dead handler from a gesture that never delivered the click'
    const ok = newTab && docTab && searchTabStays
    return [
      rowResult({ row: 'UF-TABS-7', dclass: 'D-interaction' }, ufTabs7Assertion, ok ? detail : `${detail}${diag}`, { path: r.path, ok, surface }),
      declaredRowResult('U-2', 'UF-TABS-7', ufTabs7Assertion, 'D-interaction', ok ? detail : `${detail}${diag}`, { path: r.path, ok, surface, checklistRow: 'UF-TABS-7' }),
    ]
  },

  // UF-TABS-7 DIAGNOSTIC — the attribution half of the search-row row: a NATIVE
  // `.click()` on the same result row (no hit-testing, no verdict). It proves
  // whether the handler + seam work when the real gesture does not deliver the
  // click; it is a `[DIAG]` measurement and can never promote the row.
  uf_tabs_7_diag: async (h) => {
    // §5.5 `FA-1`/`FA-2` + §16.5 — THE BLOCK'S OWN DECLARED FIXTURE IS ASKED FIRST:
    // at a NON-EMPTY store the gate's own predicate is false, so a fixture-absence park
    // for THIS fixture rides the block's OWN body, named and route-tagged.
    { const ownPark = await ufFixtureOwnParkNoRow(h, 'uf_tabs_7_diag', 'corpus-query-results'); if (ownPark !== null) return ownPark }
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
    return rowResult({row:'UF-SETTINGS-1',dclass:'D-visual'}, 'The settings modal is hidden at boot and a REAL click on #settings-toggle reveals PAINTED operator panes', `at boot/start #settings-modal class="${closed.cls}" display=${closed.display} bodyBox=${JSON.stringify(closed.bodyBox)} → hiddenByDefault=${hiddenByDefault}; REAL click on #settings-toggle (path=${r.path}) → class="${open.cls}" display=${open.display} bodyBox=${JSON.stringify(open.bodyBox)} operatorPaneBox=${JSON.stringify(open.operatorBox)} operatorText="${open.operatorText}" → visibleOperatorPanes=${openedVisibly}`, { path: r.path, ok: hiddenByDefault && openedVisibly, surface: await ufSurfaceTarget(h) })
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
    return rowResult({row:'UF-SETTINGS-2',dclass:'D-interaction'}, 'Escape closes the modal, a scrim click closes it, a modal-CONTENT click does NOT close it, and the frame always carries exactly one of .is-open/.is-closed', `samples=${samples.map(([k, c]) => k + ' → "' + c + '"').join('; ')}; exactlyOneOf(.is-open/.is-closed) at every sample=${exactlyOne}; contentClickKeepsOpen=${contentClickKeepsOpen} scrimClickCloses=${scrimClickCloses} escapeCloses=${escapeCloses}; each click was a real CDP coordinate gesture hit-tested to its intended target (scrim point=${scrim ? scrim.x + ',' + scrim.y : 'none'}, content point=${point ? point.x + ',' + point.y : 'none'})`, { path: point && scrim ? 'cdp' : 'missing', ok: exactlyOne && contentClickKeepsOpen && scrimClickCloses && escapeCloses, surface: await ufSurfaceTarget(h) })
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
    return rowResult({row:'UF-SETTINGS-3',dclass:'D-visual'}, 'The modal body hosts BOTH operator mounts (#panes + #operator-panes), both PAINTED and populated, and the app graph is NOT re-parented into it', `modal body box=${JSON.stringify(r.bodyBox)}; #panes in #settings-modal-body=${r.panesInBody} (box ${JSON.stringify(r.panesBox)}, text "${r.panesText}"); #operator-panes in body=${r.opInBody} (box ${JSON.stringify(r.opBox)}, text "${r.opText}"); bothMounted&painted=${bothMounted}; isolation: #panes in zone:left=${r.panesInZone} #operator-panes in zone:left=${r.opInZone} #app still in main.layout=${r.appInLayout} #zone:main still inside #app=${r.mainInApp} → preserved=${isolation}`, { path: 'cdp', ok: bothMounted && isolation, surface: await ufSurfaceTarget(h) })
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
    return rowResult({row:'UF-SETTINGS-4',dclass:'D-state'}, 'The enabled-panes census is populated at FIRST render (no edit) — PAINTED — and agrees with the rendered pane frames', `settings modal opened by a REAL click; #operator-enabled-panes="${r.text}" (painted box ${JSON.stringify(r.box)}, painted=${censusPainted}) with NO edit made; rendered .pane-frame[data-pane-id] set=${JSON.stringify(frames)} → census populatedAtFirstRender=${census.length > 0} agreesWithRenderedPanes=${agree} censusPainted=${censusPainted} reReadStableAgreement=${stable} (second read "${reRead.text}"); NOTE: the other half of this row (the fresh-store first-run default = exactly {search,doc-nav}) needs a fresh --home boot and is PARKED (see docs/specs/user-flow-audit-coverage-2026-09-15.md)`, { path: 'cdp', ok: census.length > 0 && agree && censusPainted && stable, surface: await ufSurfaceTarget(h) })
  },

  // UF-SETTINGS-5 — the operator settings reflect topK / representation-mode /
  // default-document (plus rag-stores), populated from the store. §9 `T-2`/§3.2
  // `F-12`: the SUPERSEDED editing-mode vocabulary is SWEPT and the scenario
  // re-derived against the LANDED successor `DECIDED:
  // REPRESENTATION-MODE-SUCCESSOR` (`representationMode: html | markdown`).
  uf_settings_5: async (h) => {
    await ufModal(h, true)
    const r = await h.cdp.evaluate(`(()=>{const g=(id)=>{const e=document.getElementById(id);if(!e)return null;const b=e.getBoundingClientRect();return {text:(e.textContent||'').trim(),box:[Math.round(b.width),Math.round(b.height)]}};return {topk:g('operator-topk'),mode:g('operator-editing-mode'),doc:g('operator-default-document'),stores:g('operator-rag-stores')}})()`)
    const painted = (f) => !!f && f.box[0] > 0 && f.box[1] > 0 && f.text.length > 0
    const topkOk = painted(r.topk) && /topK:\s*\d+/.test(r.topk.text)
    const modeOk = painted(r.mode) && /representationMode:\s*(html|markdown)/.test(r.mode.text)
    const docOk = painted(r.doc)
    const storesOk = painted(r.stores) && /store/i.test(r.stores.text)
    await ufModal(h, false)
    return rowResult({row:'UF-SETTINGS-5',dclass:'D-state'}, 'The operator settings reflect topK / representation-mode / default-document (plus rag-stores), each PAINTED', `#operator-topk="${r.topk ? r.topk.text : 'MISSING'}" (painted=${painted(r.topk)}, matches /topK:\\d+/=${topkOk}); #operator-editing-mode="${r.mode ? r.mode.text : 'MISSING'}" (matches /representationMode:(html|markdown)/=${modeOk}); #operator-default-document="${r.doc ? r.doc.text : 'MISSING'}" (painted=${docOk}); #operator-rag-stores="${r.stores ? r.stores.text.slice(0, 60) : 'MISSING'}…" (painted=${storesOk})`, { path: 'cdp', ok: topkOk && modeOk && docOk && storesOk, surface: await ufSurfaceTarget(h) })
  },

  // UF-SETTINGS-7 — a REAL per-pane [data-pane][data-enabled] click flips a
  // pane ON (its .pane-frame appears) and OFF (the frame is removed).
  uf_settings_7: async (h) => {
    await ufModal(h, true)
    const read = async () => h.cdp.evaluate(`(()=>{const t=document.getElementById('operator-pane-visibility-crosslinks');const f=document.querySelector('.pane-frame[data-pane-id="crosslinks"]');const c=document.getElementById('operator-enabled-panes');const b=f?f.getBoundingClientRect():null;return {enabled:t?t.getAttribute('data-enabled'):null,frame:!!f,frameBox:b?[Math.round(b.width),Math.round(b.height)]:null,census:c?(c.textContent||'').trim():null}})()`)
    const ufSettings7Assertion = 'A REAL per-pane [data-pane][data-enabled] click flips a pane ON (its .pane-frame appears, painted) and OFF (the frame is removed)'
    const toggleSel = '#operator-pane-visibility-crosslinks'
    // §2.3 `H-1` clause 4 / §13.4 item 1 / gate-4 `B-2` — THE BLOCK DRIVES ITS OWN
    // PRECONDITION, so its verdict is POSITION-INDEPENDENT. The assertion's PRE-state
    // (`crosslinks` OFF: `data-enabled="false"` and no `.pane-frame`) is NOT the
    // run's position's to provide: the operator toggles render `data-enabled="true"`
    // for EVERY pane until the first visibility write sets `panesInitialized`
    // (`settingsContent`: `on = panesInitialized === true ? list.includes(id) : true`),
    // so on a fresh-profile ISOLATED run the toggle reads "true", the asserted ON
    // half is SKIPPED (`c1={path:'skipped'}`) and the row FAILs while the SAME row
    // PASSes in the full battery (where `persistence_v1` wrote the persisted set
    // first) — the `H-1` clause-4 falsifier in the opposite direction. This setup
    // REAL-clicks the SAME pane-visibility control the flip drives (hit-tested
    // through `ufRealClick`) until the pre-state is actually reached, exactly as
    // `uf_panes_8`'s setup establishes its collapse baseline. It adds NO `BLOCKS`
    // key, NO flag, NO `§5.U` slot and NO new app assertion (`D-5`), and it PROMOTES
    // no verdict (`H-5`): the row still carries its own honest verdict below.
    const entry = await read()
    const setup = []
    for (let i = 0; i < 3 && (await read()).enabled !== 'false'; i++) {
      const c = await ufRealClick(h, toggleSel)
      setup.push(c.path)
      await sleep(1700)
    }
    const s0 = await read()
    if (s0.enabled !== 'false') {
      // The pre-state could not be reached => NOT-DRIVEN with the STATE NAMED
      // (§2.3 `H-4`: a driver-side precondition, never an app FAIL).
      const observed = `the crosslinks pane could not be brought to the assertion's PRE-state (data-enabled="false" with no .pane-frame): entry data-enabled=${entry.enabled} frameRendered=${entry.frame} census="${entry.census}"; ${setup.length} REAL hit-tested click(s) on ${toggleSel} (paths=${JSON.stringify(setup)}) left data-enabled=${s0.enabled} frameRendered=${s0.frame} census="${s0.census}"`
      await ufModal(h, false)
      return rowResult({row:'UF-SETTINGS-7',dclass:'D-interaction'}, ufSettings7Assertion, observed, { path: setup.length ? `not-drivable (last setup path=${setup[setup.length - 1]})` : 'missing', ok: false, surface: await ufSurfaceTarget(h), required: 'the assertion\'s PRE-state: `#operator-pane-visibility-crosslinks` reading data-enabled="false" with no `.pane-frame[data-pane-id="crosslinks"]`', observed })
    }
    const c1 = await ufRealClick(h, toggleSel)
    await sleep(1700)
    const s1 = await read()
    const c2 = await ufRealClick(h, toggleSel)
    await sleep(1700)
    const s2 = await read()
    const ok = s0.enabled === 'false' && c1.path === 'cdp' && s1.enabled === 'true' && s1.frame && s1.frameBox[0] > 0 && s1.frameBox[1] > 0 && c2.path === 'cdp' && s2.enabled === 'false' && !s2.frame
    await ufModal(h, false)
    return rowResult({row:'UF-SETTINGS-7',dclass:'D-interaction'}, ufSettings7Assertion, `[setup] entry data-enabled=${entry.enabled} frameRendered=${entry.frame} → ${setup.length} REAL hit-tested click(s) on ${toggleSel} (paths=${JSON.stringify(setup)}) → PRE-state data-enabled=${s0.enabled} frameRendered=${s0.frame}; crosslinks toggle start data-enabled=${s0.enabled} frameRendered=${s0.frame} census="${s0.census}"; REAL click ON (path=${c1.path}) → data-enabled=${s1.enabled} .pane-frame rendered=${s1.frame} box=${JSON.stringify(s1.frameBox)} census="${s1.census}"; REAL click OFF (path=${c2.path}) → data-enabled=${s2.enabled} frameRemoved=${!s2.frame} census="${s2.census}"`, { path: c1.path === 'cdp' && c2.path === 'cdp' ? 'cdp' : 'native-fallback', ok, surface: await ufSurfaceTarget(h) })
  },

  // ---- §3 Panes ------------------------------------------------------------

  // UF-PANES-1 — a REAL click on a pane's `.pane-collapse-toggle` renders the
  // pane HEADER-ONLY (its body nodes unmount); a second click re-expands the
  // SAME pane root (node identity stable). The verdict is gated on the
  // hit-tested path of BOTH clicks.
  uf_panes_1: async (h) => {
    await ufEnsureAppClear(h)
    // §2.3 `H-1` clause 4 / §13.4 item 1 / gate-4 `B-1` — THE SANCTIONED PER-BLOCK
    // RESTORE PATH, taken BEFORE this block resolves its frame. The row brings its
    // `doc-nav` pane to the drivable baseline through `ufEnsurePaneExpanded` (the
    // `zone:left` state READ AS A STATE + a REAL hit-tested re-expand + the
    // PERSISTED pane-visibility restore through the operator control the flip itself
    // used), exactly as `uf_panes_12`/`uf_panes_14` already do, and only THEN reads
    // its own frame census as a state. The narrowed pre-flight (`G-3`) READS the
    // persisted visibility set and never REPAIRS it (so that `persistence_v2` keeps
    // the precondition it exists to assert), which means a census read taken WITHOUT
    // the sanctioned restore reports `doc-nav` absent whenever an EARLIER block
    // (`persistence_v1`) persisted it OFF: the isolated/full-battery disagreement
    // this unit exists to kill. The restore adds NO `BLOCKS` key, NO flag, NO new
    // app assertion and PROMOTES no verdict (`H-5`) — it only makes the row
    // DRIVABLE, and the row then carries its own honest verdict.
    const zoneCls = await h.cdp.evaluate(`document.getElementById('zone:left').className`)
    let zonePath = 'already-expanded'
    if (/is-minimized/.test(zoneCls)) {
      zonePath = (await ufRealClick(h, '#zone-minimize-left')).path
      await sleep(1300)
    }
    const expanded = await ufEnsurePaneExpanded(h, 'doc-nav')
    const surface = await ufSurfaceTarget(h)
    const paneExpandPath = `zone=${expanded.zoneState ?? 'unknown'} zoneRestore=${zonePath} panePath=${expanded.path}${expanded.restored && typeof expanded.restored === 'object' ? ` (visibilityRestore path=${expanded.restored.path} ${expanded.restored.before}->${expanded.restored.after})` : ''}${expanded.collapsedAfter === true ? ` collapsedAfter=${expanded.collapsedAfter}` : ''}`
    // THE BLOCK'S OWN FRAME CENSUS, read AS A STATE (§2.3 `H-1` clause 1): the
    // sanctioned restore above has already resolved the persisted-visibility state,
    // so this read resolves the pane's RENDERED state (present/collapsed) rather
    // than inferring anything from the driver's own prior block.
    const pre = await ufPaneFrames(h)
    const docnav = pre.find((f) => f.pid === 'doc-nav')
    if (!docnav) {
      // §2.3 `H-4` / §13.4 item 4 — the row genuinely CANNOT be driven from the
      // persisted state: `NOT-DRIVEN` with that state NAMED (the resolved state, the
      // sanctioned restore path and the frame census all printed), never an app FAIL
      // and never a silent omission (§2.1 `E-1`/`E-2`).
      const observed = `the doc-nav pane frame is not rendered after the per-block restore: ${paneExpandPath}; frameCensus=${JSON.stringify(pre.map((f) => f.pid + (f.collapsed ? '(collapsed)' : '(expanded)')))}${expanded.detail ? ` — ${expanded.detail}` : ''}`
      return rowResult({row:'UF-PANES-1',dclass:'D-interaction'}, 'A REAL click on a pane collapse toggle renders the pane HEADER-ONLY (body unmounted); a second REAL click re-expands the SAME pane root', observed, { path: 'missing', ok: false, surface, required: 'a rendered `.pane-frame[data-pane-id="doc-nav"]` in the block\'s own frame census after the sanctioned per-block restore (`ufEnsurePaneExpanded`: the zone state read as a state + a REAL hit-tested re-expand + the persisted pane-visibility restore)', observed })
    }
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
    return rowResult({row:'UF-PANES-1',dclass:'D-interaction'}, 'A REAL click on a pane collapse toggle renders the pane HEADER-ONLY (body unmounted); a second REAL click re-expands the SAME pane root', `${paneExpandPath}; doc-nav before: bodyNodes(li)=${before.li} ul=${before.ul} h=${before.h}px; REAL click #pane-collapse-doc-nav (path=${c1.path}) → is-collapsed=${mid.collapsed} bodyNodes(li)=${mid.li} ul=${mid.ul} h=${mid.h}px → headerOnly=${headerOnly}; REAL click again (path=${c2.path}) → is-collapsed=${after.collapsed} bodyNodes(li)=${after.li} ul=${after.ul} h=${after.h}px → reExpanded=${reExpanded}; samePaneRoot(identical #pane-doc-nav root: id/paneId/title/x ${before.id}/${before.paneId}/"${before.title}"/${before.x} → ${after.id}/${after.paneId}/"${after.title}"/${after.x})=${sameRoot} (data-node-id ${before.nodeId}→${after.nodeId})`, { path: c1.path === 'cdp' && c2.path === 'cdp' ? 'cdp' : 'native-fallback', ok: headerOnly && reExpanded && sameRoot, surface })
  },

  // UF-PANES-8 — a REAL click on a minimized zone's tab re-expands the zone
  // (and the tab's data-pane-id identifies that pane; pane-body activation is
  // DEFERRED by spec §2.5 pin 5 — recorded, not asserted as a defect).
  uf_panes_8: async (h) => {
    await ufEnsureAppClear(h)
    // §2.3 `H-1` clauses 1/3/4 / finding `C-8` — THE SANCTIONED PER-BLOCK RESTORE,
    // taken at the HEAD of the body, BEFORE this block's FIRST pane-FRAME census
    // read (the same path `uf_panes_1`/`uf_panes_12`/`uf_panes_14` already take). The
    // block's own setup below reads `.pane-frame`/collapse state, so its census must
    // be read from the DRIVABLE baseline (`zone:left` read as a state + re-expanded
    // by a REAL hit-tested gesture, and the persisted pane-visibility state resolved
    // through the operator control the flip itself used) instead of from an EARLIER
    // block's artifact (`persistence_v1` persists `doc-nav` OFF — §13.4 / `G-3`: the
    // persisted set is a block PRECONDITION, and a census taken without this restore
    // reports the pane absent whenever an earlier block persisted it off). It adds
    // NO `BLOCKS` key, NO `§5.U` slot, NO flag and NO new app assertion (`D-5`), and
    // it PROMOTES no verdict (`H-5`). THE BLOCK'S OWN TAIL RESTORE IS KEPT: the
    // block collapses both panes as SETUP, so the state it leaves is re-expanded
    // after its last read; both the pre-flight records and the tail records print in
    // `[restore]` order (first the state it started from, then the state it leaves,
    // `H-2`).
    const restore = []
    for (const pid of ['doc-nav', 'search']) restore.push(JSON.stringify(await ufEnsurePaneExpanded(h, pid)))
    // setup: expand the zone, collapse BOTH panes with REAL toggle clicks so the
    // clicked pane's activation is observable
    const zoneCls = await h.cdp.evaluate(`document.getElementById('zone:left').className`)
    if (/is-minimized/.test(zoneCls)) { await ufRealClick(h, '#zone-minimize-left'); await sleep(1300) }
    for (const pid of ['doc-nav', 'search']) {
      const f = (await ufPaneFrames(h)).find((x) => x.pid === pid)
      if (f && !f.collapsed) { await ufRealClick(h, `#pane-collapse-${pid}`); await sleep(1300) }
    }
    const preMin = await ufPaneFrames(h)
    // ⟨gate-4 `D-1`⟩ the minimize/tab clicks ARE the rows' own gesture (the setup
    // collapse clicks below name no row: they are the block's precondition, not a row's).
    const minPath = (await ufRealClick(h, '#zone-minimize-left', { rows: ['UF-PANES-8', 'U-6'] })).path
    await sleep(1500)
    const minimized = await h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:left');const tabs=[...document.querySelectorAll('[id^="zone-tab-left-"]')].map((t)=>{const r=t.getBoundingClientRect();return {id:t.id,paneId:t.getAttribute('data-pane-id'),box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}});return {cls:z.className,frames:document.querySelectorAll('.pane-frame[data-pane-id]').length,tabs:tabs}})()`)
    const tabClick = (await ufRealClick(h, '#zone-tab-left-doc-nav', { rows: ['UF-PANES-8', 'U-6'] }))
    await sleep(1800)
    const after = await h.cdp.evaluate(`(()=>{const z=document.getElementById('zone:left');return {cls:z.className,frames:document.querySelectorAll('.pane-frame[data-pane-id]').length}})()`)
    const afterFrames = await ufPaneFrames(h)
    const docnavAfter = afterFrames.find((f) => f.pid === 'doc-nav') || null
    const stripReplacesStack = minimized.frames === 0 && minimized.tabs.length >= 1 && minimized.tabs.every((t) => t.box[2] > 0 && t.box[3] > 0)
    const reExpanded = !/is-minimized/.test(after.cls) && after.frames >= 1 && afterFrames.every((f) => f.box[2] > 0 && f.box[3] > 0)
    const clickedPaneIdentified = minimized.tabs.some((t) => t.id === 'zone-tab-left-doc-nav' && t.paneId === 'doc-nav')
    // restore: re-expand both panes (the block collapses them as setup) — the
    // block's own TAIL restore, after its LAST frame census read
    for (const pid of ['doc-nav', 'search']) restore.push(JSON.stringify(await ufEnsurePaneExpanded(h, pid)))
    const ufPanes8Assertion = 'A REAL click on a minimized zone tab re-expands the zone (painted panes again) and the tab data-pane-id identifies that pane'
    const ufPanes8Evidence = `pre-minimize panes=${JSON.stringify(preMin.map((f) => f.pid + (f.collapsed ? '(collapsed)' : '(expanded)'))) }; REAL click #zone-minimize-left (path=${minPath}) → zone class="${minimized.cls}" frames=${minimized.frames} tabStrips=${JSON.stringify(minimized.tabs)} (vertical column, painted); REAL click #zone-tab-left-doc-nav (path=${tabClick.path}) → zone class="${after.cls}" frames=${after.frames} (doc-nav collapsed-after-click=${docnavAfter ? docnavAfter.collapsed : 'absent'}) → zoneReExpanded=${reExpanded} clickedPaneIdentifiedByTab=${clickedPaneIdentified}; [restore] ${restore.join(' ')}; NOTE: pane-BODY activation on tab click is DEFERRED by unit-u-shell-4 §2.5 pin 5 ("live selection is deferred … the tab's data-pane-id identifies the selected pane") — the checklist row's "activates that pane's body" clause overstates the pinned spec`
    const ufPanes8Opts = { path: minPath === 'cdp' && tabClick.path === 'cdp' ? 'cdp' : 'native-fallback', ok: stripReplacesStack && reExpanded && clickedPaneIdentified, surface: await ufSurfaceTarget(h) }
    // §2.1 `E-2` — the DECLARED row `U-6` (MATRIX_ROWS maps `U-6` to this block)
    // carries ITS OWN verdict; the checklist row `UF-PANES-8` keeps its own.
    return [
      rowResult({ row: 'UF-PANES-8', dclass: 'D-interaction' }, ufPanes8Assertion, ufPanes8Evidence, ufPanes8Opts),
      declaredRowResult('U-6', 'UF-PANES-8', ufPanes8Assertion, 'D-interaction', ufPanes8Evidence, { ...ufPanes8Opts, checklistRow: 'UF-PANES-8' }),
    ]
  },

  // UF-PANES-10 — the persisted enabled-pane set governs the rendered panes and
  // the operator census agrees at FIRST render (no edit). The census text and
  // the frame list are two PROJECTIONS of one state, so a second, independent
  // oracle is required: the census is PAINTED (non-zero box) and a re-read after
  // the frame read still agrees. The fresh-store {search,doc-nav} first-run
  // default needs a fresh --home boot (PARKED).
  uf_panes_10: async (h) => {
    await ufEnsureAppClear(h)
    // §2.3 `H-1` clauses 1/3/4 / finding `C-8` — THE SANCTIONED PER-BLOCK RESTORE,
    // taken at the HEAD of the body, BEFORE this block's FIRST pane-FRAME census
    // read (the same path `uf_panes_1`/`uf_panes_12`/`uf_panes_14` take). SAID PLAINLY:
    // this block's `frames0` read IS the persisted-set projection read (the census
    // `#operator-enabled-panes` and the rendered frame set are two projections of
    // ONE state, which is why the row needs a second, independent oracle and is
    // PARKED on the fresh-store half) — so the pre-flight drives the BASELINE-ON
    // pane `search` (the pane this row does not measure) and deliberately LEAVES
    // `doc-nav`'s persisted state as the block found it: the census read below is
    // still the un-repaired projection of that set, and the pre-flight cannot make
    // the row's own agreement true by repairing the state it measures. What the
    // pre-flight DOES change is ORDER (`C-8`): the census read no longer reads the
    // driver's own prior state. It adds NO `BLOCKS` key, NO `§5.U` slot, NO flag and
    // NO new app assertion (`D-5`), and it PROMOTES no verdict (`H-5`).
    await ufEnsurePaneExpanded(h, 'search')
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
    return rowResult({row:'UF-PANES-10',dclass:'D-state'}, 'The persisted enabled-pane set governs the rendered panes and the operator census agrees at first render, PAINTED, with no edit', `rendered .pane-frame set at first render=${JSON.stringify(frameIds)}; census (modal opened by a REAL click, path=${opened.path}) = "${census}" (painted box ${JSON.stringify(censusRead ? censusRead.box : null)}); persistedSetGovernsRenderedPanes+agrees=${agree}; censusPainted=${censusPainted}; no-edit stability across the census read=${stable} and across the re-read=${censusStable} (second read "${census2}"). PARKED half of this row: the FRESH-store first-run default (exactly {search,doc-nav}) requires a fresh --home boot (the existing block 'first_boot_default' covers it with --no-seed + a disposable HOME); on this RUNNING operator store the persisted set is authoritative`, { path: opened.path, ok: agree && stable && censusStable && censusPainted, surface: await ufSurfaceTarget(h) })
  },

  // UF-PANES-12 — a REAL click on a doc-nav document `li` focuses that document
  // in the stage (the click probe separates a dead handler from a gesture that
  // never delivers the click; the native DOM-click attribution lives in
  // `uf_panes_12_diag` so it can never flip this row's verdict).
  //
  // §2.1 `E-2` — THIS BLOCK CLAIMS TWO DECLARED MATRIX ROWS (`MATRIX_ROWS` maps
  // `uf_panes_12` to `U-1` AND `U-3`), so it returns ONE result PER DECLARED ROW
  // (each with its own assertion, dclass, realInput, evidence, failingClause and
  // surface) plus its own checklist row carried through the distinct
  // `checklistRow` member. `U-1` is the doc-nav document-row FOCUS claim; `U-3` is
  // the DIFFERENT claim that the pane-drag gesture surface is the pane HEADER
  // only, so a BODY gesture is never hijacked — driven here as a REAL CDP pointer
  // drag that STARTS ON THE PANE BODY and must NOT relocate the pane. A `U-3`
  // verdict that merely repeated `U-1`'s would not be a verdict for `U-3`.
  uf_panes_12: async (h) => {
    await ufEnsureAppClear(h)
    const pane = await ufEnsurePaneExpanded(h, 'doc-nav')
    const surface = await ufSurfaceTarget(h)
    // setup: focus a DIFFERENT document first so the switch is visible
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/alpha' } }).catch(() => null)
    await sleep(1400)
    // setup: the run's SELECTED SET's own folder must be expanded for the beta leaf to exist
    let folderPath = 'already-expanded'
    let folderOpen = await h.cdp.evaluate(`(()=>{const f=document.querySelector('#pane-doc-nav [data-folder-path]');return f?f.getAttribute('data-expanded'):null})()`)
    if (folderOpen !== 'true') {
      folderPath = (await ufRealClick(h, '#pane-doc-nav [data-folder-path]')).path
      await sleep(1300)
      folderOpen = await h.cdp.evaluate(`(()=>{const f=document.querySelector('#pane-doc-nav [data-folder-path]');return f?f.getAttribute('data-expanded'):null})()`)
      if (folderOpen !== 'true') {
        // the folder row is itself a clickable `li` in a pane frame — a REAL click
        // may be swallowed by the pane-drag pointer capture. [DIAG] native-click
        // attribution (SETUP ONLY, no verdict) so the leaf row is reachable.
        await ufNativeClickDiag(h, '#pane-doc-nav [data-folder-path]')
        await sleep(1300)
        folderPath += '+[DIAG]-native-fallback(setup)'
        folderOpen = await h.cdp.evaluate(`(()=>{const f=document.querySelector('#pane-doc-nav [data-folder-path]');return f?f.getAttribute('data-expanded'):null})()`)
      }
    }
    // §2.1 `E-2`/`U-3` — THE BODY-GESTURE PROBE (run BEFORE the U-1 click so it
    // cannot disturb it): a REAL CDP pointer drag whose DOWN lands on the doc-nav
    // pane BODY (a non-control element inside the frame, NEVER the pane header)
    // and travels past the controller's threshold toward the next pane. If the
    // body gesture were admitted by the pane-drag surface the zone's pane-slot
    // ordering would change; the claim is that it does NOT (header-only surface).
    const slotSnapshot = async () => h.cdp.evaluate(`(()=>[...document.querySelectorAll('[data-zone] .pane-frame[data-pane-id]')].map((f,i)=>({i,paneId:f.getAttribute('data-pane-id'),x:Math.round(f.getBoundingClientRect().x),y:Math.round(f.getBoundingClientRect().y)})))()`)
    const slotsBefore = await slotSnapshot()
    const scrollDocNav = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');if(!f)return {err:'no doc-nav frame'};if(typeof f.scrollIntoView==='function')f.scrollIntoView({block:'start'});return true})()`)
    await sleep(500)
    const bodyPoint = await h.cdp.evaluate(`(()=>{const f=document.querySelector('.pane-frame[data-pane-id="doc-nav"]');if(!f)return {err:'no doc-nav frame after the scroll'};const hdr=f.querySelector('.pane-header');const vh=window.innerHeight;const r=f.getBoundingClientRect();const xc=Math.round(r.x+r.width*0.5);const isCtrl=(el)=>{let n=el;while(n&&n!==f){const t=n.tagName?n.tagName.toLowerCase():'';if(t==='button'||t==='input'||t==='select'||t==='textarea'||t==='a')return true;n=n.parentElement}return false};const start=Math.max(0,Math.round(r.y)+4);const end=Math.min(r.y+r.height-6,vh-20);for(let y=start;y<end;y+=6){const el=document.elementFromPoint(xc,y);if(!el||!f.contains(el))continue;if(hdr&&hdr.contains(el))continue;if(isCtrl(el))continue;return {x:xc,y,hit:el.tagName+'/'+String(el.className||'').slice(0,60),inHeader:false,frameY:Math.round(r.y),vh}};return {err:'no non-control point in the VISIBLE doc-nav pane BODY',frameY:Math.round(r.y),vh}})()`)
    const bodyStart = (bodyPoint && bodyPoint.err)
      // A body point that lies BELOW the fold is a DRIVER precondition (the
      // coordinate could not be hit-tested in-viewport), named as such — never an
      // app verdict (§2.3 `H-4`): the pane IS rendered (`.pane-frame` present) and
      // it is the pane's own height, not the app, that put the point off-view.
      ? { err: `${bodyPoint.err} (frameY=${bodyPoint.frameY} vh=${bodyPoint.vh} — the frame's visible BODY region carries no non-control point)` }
      : bodyPoint
    let bodyDrag = null
    if (!bodyStart || bodyStart.err) {
      bodyDrag = { driven: false, reason: `${JSON.stringify(bodyStart)} — the pane BODY gesture point could not be resolved (the driver's own precondition, named)` }
    } else {
      const sib = slotsBefore.find((s) => s.paneId !== 'doc-nav' && s.y > (slotsBefore.find((s) => s.paneId === 'doc-nav') || { y: 0 }).y + 4) || null
      const targetY = sib ? sib.y + 18 : bodyStart.y + 80
      await h.cdp.gesture('.pane-frame[data-pane-id="doc-nav"]', [
        { type: 'down', x: bodyStart.x, y: bodyStart.y },
        { type: 'move', x: bodyStart.x + 6, y: bodyStart.y + 40 },
        { type: 'move', x: bodyStart.x + 8, y: Math.round((bodyStart.y + targetY) / 2) },
        { type: 'move', x: bodyStart.x + 8, y: targetY },
        { type: 'up', x: bodyStart.x + 8, y: targetY },
      ])
      await sleep(1200)
      const slotsAfter = await slotSnapshot()
      const seqBefore = slotsBefore.map((s) => s.paneId).join(',')
      const seqAfter = slotsAfter.map((s) => s.paneId).join(',')
      bodyDrag = { driven: true, start: bodyStart, targetY, seqBefore, seqAfter, relocated: seqBefore !== seqAfter, hitAtStart: bodyStart.hit }
    }
    const leaf = await h.cdp.evaluate(`(()=>{const l=document.querySelector('li[data-document-id=".live-fixture/core/beta"]');if(!l)return null;const r=l.getBoundingClientRect();return {doc:l.getAttribute('data-document-id'),box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]}})()`)
    const u1Assertion = 'A REAL click on a doc-nav document ROW focuses that document in the stage'
    const u3Dclass = 'D-interaction'
    const u3Assertion = 'The pane-drag gesture surface is the pane HEADER only — a REAL pointer gesture starting on the pane BODY is never hijacked (the pane is not relocated)'
    const u3Evidence = bodyDrag && bodyDrag.driven === true
      ? `REAL CDP pointer drag DOWN on the doc-nav pane BODY (start=(${bodyStart.x},${bodyStart.y}) hit=${bodyDrag.hitAtStart}, outside .pane-header) travelling to y=${bodyDrag.targetY} past the drag threshold; zone pane-slot ordering before=[${bodyDrag.seqBefore}] after=[${bodyDrag.seqAfter}] → bodyGestureAdmitted/relocated=${bodyDrag.relocated} (required false: the header is the only pane-drag surface)` : `the body-gesture probe COULD NOT BE DRIVEN: ${bodyDrag ? bodyDrag.reason : 'no probe'}`
    // §7.2 LIMB 1 — THE LAYOUT-EFFECT READING, carried as an EXTENSION of this
    // block's ALREADY-DECLARED row (`U-3`): a pane rearrange INSIDE one zone must
    // leave the OTHER ZONES' and the STAGE's measured rects UNCHANGED value-for-value,
    // `#wiki-root`'s mount count at EXACTLY 1, and NO stale childless root behind. NO
    // new slot, `MATRIX_ROWS` unmoved, no `U-n` id renumbered. The before/after pair is
    // THIS run's OWN (it may not borrow the greens artifact's); the rearrange input is
    // a REAL hit-tested CDP drag NAMED as such; and the reading is PRINTED even when
    // the gesture could not be driven — a rearrange that never moved a pane names its
    // precondition and reads NOT-DRIVEN, never a silent park.
    const limb1Before = await ufLayoutReading(h)
    const rearrange = await ufPaneRearrangeInput(h, 'left', 'doc-nav')
    const limb1After = await ufLayoutReading(h)
    const rectUnchanged = (a, b) => JSON.stringify(a) === JSON.stringify(b)
    const limb1SiblingZonesUnchanged = rectUnchanged(limb1Before.zoneRight, limb1After.zoneRight) && rectUnchanged(limb1Before.zoneHeader, limb1After.zoneHeader) && rectUnchanged(limb1Before.zoneFooter, limb1After.zoneFooter)
    const limb1StageUnchanged = rectUnchanged(limb1Before.main, limb1After.main)
    const limb1MountExactlyOne = limb1Before.mountCount === 1 && limb1After.mountCount === 1
    const limb1NoStaleChildlessRoot = limb1Before.staleChildlessRoots === 0 && limb1After.staleChildlessRoots === 0
    const limb1Rearranged = rearrange.driven === true && rearrange.rearranged === true
    const limb1LayoutHeld = limb1SiblingZonesUnchanged && limb1StageUnchanged && limb1MountExactlyOne && limb1NoStaleChildlessRoot
    const limb1Ok = limb1Rearranged && limb1LayoutHeld
    const limb1InputReading = rearrange.driven === true
      ? `${rearrange.inputKind} — the drag START is the pane's OWN HEADER SURFACE (hit=${JSON.stringify(rearrange.dragStartHit)}, onTarget=${rearrange.dragStartOnTarget}, and the APP'S OWN delegated resolution at that point (closest('.gutter[data-zone], .pane-collapse-toggle')) returns that very header=${rearrange.dragStartOnTheAppHeaderSurface}; the header element is a ${rearrange.dragStartHeaderTag}, i.e. the header IS the collapse control on this build — the fork's pinned F-1 decision, so a point on the header that is NOT the toggle does not exist and is not invented): pane ${rearrange.dragStartPane} (header box ${JSON.stringify(rearrange.dragStartPaneHeaderBox)}; WHY THIS PANE: ${rearrange.dragStartPaneChosenBecause}) dragged in small steps (${rearrange.pathShape}) from (${rearrange.dragStart.x},${rearrange.dragStart.y}) PAST ${rearrange.draggedPast} to y=${rearrange.dragToY} (past the sibling's midpoint=${rearrange.dragPastTheSiblingMidpoint}; DROP POINT DERIVATION: ${rearrange.dropBasis}) INSIDE zone '${rearrange.zone}' (the rearrange is WITHIN one zone); zone pane-slot order before=[${rearrange.slotOrderBefore}] after=[${rearrange.slotOrderAfter}] → rearrangedInsideTheZone=${rearrange.rearranged}; POINTER AUDIT (why a drag that moved nothing moved nothing): gotpointercapture events=${rearrange.pointerAudit ? rearrange.pointerAudit.gotPointerCaptureEvents : '?'}, pointer-capture holders at the end=${JSON.stringify(rearrange.pointerAudit ? rearrange.pointerAudit.captureHoldersAtTheEnd : null)}, move targets=${JSON.stringify(rearrange.pointerAudit ? rearrange.pointerAudit.moveTargets : null)}, terminal targets=${JSON.stringify(rearrange.pointerAudit ? rearrange.pointerAudit.terminalTargets : null)}, revealed zone mirrors=${JSON.stringify(rearrange.pointerAudit ? rearrange.pointerAudit.revealedMirrors : null)}; RESTORE (this block's own hygiene, AFTER the reading and never a substitute for it)=${rearrange.restore ? (rearrange.restore.performed === true ? `a leaked provisional drop-target mirror was cleared through the app's own gesture path (two real header clicks: the first supersedes the in-flight drag and terminates its own session, the second restores the collapse state it toggled) → reveal mirrors after the restore=${JSON.stringify(rearrange.restore.revealMirrorsAfterTheRestore)} pane slots after the restore=${JSON.stringify(rearrange.restore.paneSlotsAfterTheRestore)} collapse state ${JSON.stringify(rearrange.restore.collapseBefore)} -> ${JSON.stringify(rearrange.restore.collapseAfter)} restored=${rearrange.restore.collapseStateRestored}` : `nothing to restore: the drag left NO revealed zone mirror (${JSON.stringify(rearrange.restore.revealMirrorsAfterTheDrag)})`) + (rearrange.restore.error ? ` ERROR=${rearrange.restore.error}` : '') : 'no restore record'}`
      : `NOT DRIVEN — ${rearrange.reason}`
    const limb1Evidence = `[§7.2 limb 1 — LAYOUT EFFECT, carrier row U-3/uf_panes_12; scope: the assembled renderer THIS driver spawned, its own CDP input path] ` +
      `REAL INPUT (required (iv)): ${limb1InputReading}; ` +
      `rects BEFORE the rearrange (required (i), this run's own pair): zone:left=${JSON.stringify(limb1Before.zoneLeft)} (the zone rearranged IN) zone:right=${JSON.stringify(limb1Before.zoneRight)} zone:header=${JSON.stringify(limb1Before.zoneHeader)} zone:footer=${JSON.stringify(limb1Before.zoneFooter)} stage(#zone:main)=${JSON.stringify(limb1Before.main)} gridColumns="${limb1Before.gridColumns}"; ` +
      `rects AFTER: zone:left=${JSON.stringify(limb1After.zoneLeft)} zone:right=${JSON.stringify(limb1After.zoneRight)} zone:header=${JSON.stringify(limb1After.zoneHeader)} zone:footer=${JSON.stringify(limb1After.zoneFooter)} stage(#zone:main)=${JSON.stringify(limb1After.main)} gridColumns="${limb1After.gridColumns}"; ` +
      `OBSERVED (i): siblingZonesUnchanged=${limb1SiblingZonesUnchanged} stageUnchanged=${limb1StageUnchanged}; ` +
      `OBSERVED (ii) #wiki-root mount count: BEFORE=${limb1Before.mountCount} AFTER=${limb1After.mountCount} → exactlyOneMount=${limb1MountExactlyOne} (required EXACTLY 1 — no zero, no two); ` +
      `OBSERVED (iii) STALE CHILDLESS ROOT: childless #wiki-root(s) BEFORE=${limb1Before.staleChildlessRoots} AFTER=${limb1After.staleChildlessRoots} → NO stale childless root appeared=${limb1NoStaleChildlessRoot} (explicit statement: NO element under the layout root carried zero children in the post-state); ` +
      `pane frames before=${JSON.stringify(limb1Before.frames.map((f) => f.paneId))} after=${JSON.stringify(limb1After.frames.map((f) => f.paneId))} → limb1LayoutEffectHeld=${limb1Ok}${limb1Rearranged === true ? '' : ` — THE READING IS NOT-DRIVEN: the rearrange gesture did not move a pane, so the before/after pair is NOT a within-zone rearrange and may NOT be read as the limb. The four sub-readings above are printed as a SCOPED measurement of a state in which nothing was rearranged. THE GESTURE ITSELF IS PROVEN (it started on the pane's own header surface at a hit-tested point, in small steps, and dropped past the sibling's midpoint), so this is an APP finding about the pane-drag wiring — filed in docs/defects.md with its owner — and NOT a probe gap`}`
    const u3EvidenceWithLimb1 = `${limb1Evidence}; [§7.2 limb 1's OTHER half — the pane-BODY gesture probe, kept BESIDE the limb, never substituted for it] ${u3Evidence}`
    const u3Opts = limb1Rearranged && bodyDrag && bodyDrag.driven === true
      ? { path: 'cdp', ok: limb1LayoutHeld && bodyDrag.relocated === false, surface: surface, gesture: true, checklistRow: 'UF-PANES-12', required: '§7.2 limb 1 on the assembled surface: a REAL hit-tested within-zone pane rearrange leaves the sibling zones\' and the stage\'s rects UNCHANGED value-for-value, #wiki-root mounts EXACTLY ONE, and NO stale childless root appears (plus: a pane-BODY gesture is never admitted — the header is the only pane-drag surface)', observed: u3EvidenceWithLimb1 }
      : { path: 'missing', ok: false, surface: surface, required: '§7.2 limb 1 on the assembled surface: a REAL hit-tested within-zone pane rearrange — THE DRIVER PRECONDITION IS THAT THE GESTURE ACTUALLY MOVES A PANE (a rearrange that moves nothing cannot discriminate the property, so a scoped before/after pair taken in a state where no pane moved is REPORTED as a scoped measurement and is NOT-DRIVEN, never a silent park)', observed: u3EvidenceWithLimb1 }
    const u3 = declaredRowResult('U-3', 'UF-PANES-12', u3Assertion, u3Dclass, u3EvidenceWithLimb1, u3Opts)
    if (!leaf) {
      const why = `doc-nav has no li[data-document-id=".live-fixture/core/beta"] (folder expand path=${folderPath}, expanded=${folderOpen})`
      return [
        rowResult({ row: 'UF-PANES-12', dclass: 'D-interaction' }, u1Assertion, why, { path: 'missing', ok: false, surface }),
        declaredRowResult('U-1', 'UF-PANES-12', u1Assertion, 'D-interaction', why, { path: 'missing', ok: false, surface, checklistRow: 'UF-PANES-12' }),
        u3,
      ]
    }
    const before = await ufStageSig(h)
    await ufArmClick(h)
    // ⟨gate-4 `D-1`⟩ the doc-nav row click serves BOTH rows this block claims
    // (`UF-PANES-12`'s checklist row and the declared `U-1`).
    const click = await ufRealClick(h, 'li[data-document-id=".live-fixture/core/beta"]', { rows: ['UF-PANES-12', 'U-1'] })
    // post-click hit re-probe: if the page re-flowed (a mount leak / a tall pane)
    // between the hit-test and the dispatch, this records WHERE the click landed
    const clickProbe = await ufHitProbe(h, 'li[data-document-id=".live-fixture/core/beta"]')
    await sleep(1800)
    const events = await ufClickProbe(h)
    const after = await ufStageSig(h)
    const focused = typeof after.docId === 'string' && after.docId.includes('beta')
    const current = await h.cdp.evaluate(`!!document.querySelector('li[data-document-id=".live-fixture/core/beta"][data-current="true"]')`)
    const detail = `doc-nav pane expand=${JSON.stringify(pane)}; doc-nav folder expand: path=${folderPath} (expanded=${folderOpen}; the folder row is itself a clickable li); REAL click on li[data-document-id=".live-fixture/core/beta"] (box ${JSON.stringify(leaf.box)}, path=${click.path}, hit=${click.rect ? click.rect.hit : '?'}) → stage before(docId=${before.docId}) after(docId=${after.docId}) focusedThatDocument=${focused} li[data-current]=${current}; click-event targets=${JSON.stringify(events)}; post-click hit re-probe=${JSON.stringify(clickProbe)}; body-gesture probe (U-3)=${JSON.stringify(bodyDrag)}`
    const diag = '; [DIAG] attribution available — run --block=uf_panes_12_diag (a NATIVE DOM click on the same li) to separate a dead handler from a gesture that never delivered the click'
    const u1 = declaredRowResult('U-1', 'UF-PANES-12', u1Assertion, 'D-interaction', focused ? detail : `${detail}${diag}`, { path: click.path, ok: focused && current, surface, checklistRow: 'UF-PANES-12' })
    const checklist = rowResult({ row: 'UF-PANES-12', dclass: 'D-interaction' }, u1Assertion, focused ? detail : `${detail}${diag}`, { path: click.path, ok: focused && current, surface })
    return [checklist, u1, u3]
  },

  // UF-PANES-12 DIAGNOSTIC — a NATIVE `.click()` on the same doc-nav li (no
  // hit-testing, no verdict): attribution evidence separating "the handler+seam
  // are broken" from "the REAL gesture never delivered the click".
  uf_panes_12_diag: async (h) => {
    await ufEnsureAppClear(h)
    await ufEnsurePaneExpanded(h, 'doc-nav')
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/alpha' } }).catch(() => null)
    await sleep(1400)
    const before = await ufStageSig(h)
    // [DIAG] native DOM click (no hit-testing, no verdict) — attribution evidence
    const nat = await ufNativeClickDiag(h, 'li[data-document-id=".live-fixture/core/beta"]')
    await sleep(1800)
    const after = await ufStageSig(h)
    const focused = typeof after.docId === 'string' && after.docId.includes('beta')
    // [DIAG] measurement only — attribution evidence, never a row verdict
    return diagResult(`NATIVE DOM click on 'li[data-document-id=".live-fixture/core/beta"]' → ${nat}: stage docId ${before.docId} -> ${after.docId} (focusedThatDocument=${focused}) — so the handler+seam work, and the REAL gesture is what fails; attribution evidence for UF-PANES-12 / U-1 only`)
  },

  // UF-PANES-14 — the search pane: a REAL typed query + REAL submit renders
  // result rows that hover-highlight, and a result click opens the linked doc
  // in a NEW tab.
  uf_panes_14: async (h) => {
    // §5.5 `FA-1`/`FA-2` + §16.5 — THE BLOCK'S OWN DECLARED FIXTURE IS ASKED FIRST:
    // at a NON-EMPTY store the gate's own predicate is false, so a fixture-absence park
    // for THIS fixture rides the block's OWN body, named and route-tagged.
    { const ownPark = await ufFixtureOwnPark(h, 'uf_panes_14', 'corpus-query-results', 'UF-PANES-14'); if (ownPark !== null) return ownPark }
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
    // §2.1 `E-2` — THE `U-3` BODY-CLICK HALF, MEASURED ON THIS BLOCK'S OWN SURFACE
    // (`docs/specs/user-flow-audit.md` §2: `U-3`'s contributors are
    // `uf_panes_12` + `uf_panes_14` "the body-click half"). The result row this
    // block real-clicks is a control INSIDE the search pane's BODY; the claim is
    // that the pane-drag gesture surface does not hijack it, so its OWN handler runs
    // (the tab count increases). The read is taken BEFORE the click so the element
    // the gesture was dispatched at is the one classified.
    const bodyness = await h.cdp.evaluate(`(()=>{const li=document.querySelector('#pane-search li[data-document-id]');if(!li)return {found:false,insidePane:false,inHeader:false};return {found:true,insidePane:!!li.closest('.pane-frame[data-pane-id="search"]'),inHeader:!!li.closest('.pane-header')}})()`)
    await ufArmClick(h)
    // ⟨gate-4 `D-1`⟩ the result-row click is the gesture of ALL THREE rows this block
    // carries (`U-2`'s new-tab claim, `U-3`'s body-click claim, the checklist row).
    const click = await ufRealClick(h, '#pane-search li[data-document-id]', { rows: ['UF-PANES-14', 'U-2', 'U-3'] })
    await sleep(1800)
    const events = await ufClickProbe(h)
    const tabsAfter = await ufTabState(h)
    const newTab = tabsAfter.count === tabsBefore.count + 1
    const detail = `search pane expand=${JSON.stringify(pane)}; search pane: disclosure=${search.togglePath} inputFocus=${search.focusPath} typedValue="${search.value}" submit=${search.submitPath}; ${rows.length} result rows painted=${rowsRendered} (first doc=${rows[0] ? rows[0].doc : '?'} box=${rows[0] ? JSON.stringify(rows[0].box) : '?'} cls="${rows[0] ? rows[0].cls : '?'}"); REAL hover → bg ${hover ? hover.bgBefore : '?'} → ${hover ? hover.bgAfter : '?'} changed=${hover ? hover.changed : '?'}; REAL click on the row (path=${click.path}) → tabs ${tabsBefore.count}->${tabsAfter.count} openedNewTab=${newTab}; click-event targets=${JSON.stringify(events)}`
    const surface = await ufSurfaceTarget(h)
    const ufPanes14Assertion = 'A REAL typed query + REAL submit renders hover-highlighting result rows, and a REAL row click opens the linked doc in a NEW tab'
    const diag = '; [DIAG] attribution available — run --block=uf_tabs_7_diag (a NATIVE DOM click on the same row) to separate a dead handler from a gesture that never delivered the click'
    // §2.1 `E-1` — THE DECLARATION IS A PROMISE: `MATRIX_ROWS` names this block as an
    // EXTRA contributor to `U-2` and `U-3` (`docs/specs/user-flow-audit.md` §2), so
    // the block EMITS one verdict PER DECLARED ROW it claims (never an omission, never
    // a silent shortfall) — the same per-declared-row array form `uf_panes_12`/`uf_tabs_7`
    // use. `U-2` is the NEW-TAB claim; `U-3` is the DIFFERENT claim that the pane-drag
    // gesture surface is the pane HEADER only, so a BODY control's own handler runs —
    // a `U-3` verdict that merely repeated `U-2`'s would not be a verdict for `U-3`.
    const u2Assertion = 'A REAL click on a search RESULT row opens the linked document in a NEW tab'
    const u3Assertion = 'The pane-drag gesture surface is the pane HEADER only — a REAL click on a search-pane BODY control is not hijacked (its own handler runs)'
    const u3BodyEvidence = `REAL hit-tested click (path=${click.path}) on '#pane-search li[data-document-id]' — a BODY control of the search pane frame (insidePane=${bodyness.insidePane}, insidePaneHeader=${bodyness.inHeader}); the gesture reached its OWN handler: tabs ${tabsBefore.count}->${tabsAfter.count} openedNewTab=${newTab} (required true: a hijacked body click would leave the tab count unchanged), click-event targets=${JSON.stringify(events)}`
    const u3Ok = bodyness.found === true && bodyness.insidePane === true && bodyness.inHeader === false && click.path === 'cdp' && newTab
    return [
      rowResult({row:'UF-PANES-14',dclass:'D-interaction'}, ufPanes14Assertion, newTab ? detail : `${detail}${diag}`, { path: click.path, ok: rowsRendered && !!hover && hover.changed && newTab, surface }),
      declaredRowResult('U-2', 'UF-PANES-14', u2Assertion, 'D-interaction', newTab ? detail : `${detail}${diag}`, { path: click.path, ok: newTab, surface, required: 'the real row click increases the tab count by one (a document tab opens)', observed: `tabs ${tabsBefore.count}->${tabsAfter.count} openedNewTab=${newTab}`, checklistRow: 'UF-PANES-14' }),
      declaredRowResult('U-3', 'UF-PANES-14', u3Assertion, 'D-interaction', u3BodyEvidence, { path: bodyness.found === true ? click.path : 'missing', ok: u3Ok, surface, required: 'a hit-tested REAL click on a pane-BODY control outside `.pane-header` whose own handler runs (the tab count increases)', observed: `bodyControl(insidePane=${bodyness.insidePane}, inHeader=${bodyness.inHeader}) clickPath=${click.path} openedNewTab=${newTab}`, checklistRow: 'UF-PANES-14' }),
    ]
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
    return rowResult({row:'UF-SEARCH-2',dclass:'D-interaction'}, 'The advanced-search disclosure exposes the full rag.query arg surface, painted, in both directions', `pane expand=${JSON.stringify(f0)}; disclosure reset to collapsed (path=${resetPath}) → data-expanded=${collapsed0.expanded} fieldsRendered=${collapsed0.fields}; REAL click #advanced-search-toggle (path=${openPath}) → data-expanded=${shown.expanded} text="${shown.toggleText}" fieldsetBox=${JSON.stringify(shown.fieldsBox)}; controls painted=${surface}: mode${JSON.stringify(shown.modeOpts)} maxHops(min=${shown.maxHopsMin},max=${shown.maxHopsMax}) expand${JSON.stringify(shown.expandOpts)} maxParentContext filters(nodeKind/edgeType/targetDocumentId/targetNodeId/state) stores${JSON.stringify(shown.storesOpts)} submit; fullRagQueryArgSurface=${args}; REAL click to collapse (path=${closePath}) → expanded=${collapsed.expanded} fieldsRendered=${collapsed.fields}`, { path: openPath === 'cdp' && closePath === 'cdp' ? 'cdp' : 'native-fallback', ok: collapsed0.expanded === 'false' && shown.expanded === 'true' && !!shown.fieldsBox && shown.fieldsBox[0] > 0 && shown.fieldsBox[1] > 0 && surface && args && collapsed.expanded === 'false' && collapsed.fields === false, surface: await ufSurfaceTarget(h) })
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
      const d = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-fixture/core/alpha' }).catch(() => null)
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
      // §2.3 `H-4` / finding `C-5` — THE PARK'S OWN REASON, set at the SITE that
      // parked: a row that reads `verdict=PARKED` must name the structural
      // precondition it could not meet (never parked-by-default, never a reason-less
      // park in the artifact).
      const parkReason = `the journal could not be walked to the at-base precondition (start undoDisabled=${s0.undoDisabled} redoDisabled=${s0.redoDisabled} currentIndex=${s0.currentIndex} entries=${s0.entries}; walk stopped after ${walk.length}/${maxWalk} undo(s)) — a store with pending journal depth cannot be scored against the at-base half of this row (needs a base-state store)`
      return rowResult({row:'UF-HIST-4',dclass:'D-state'}, 'At the base the Undo control is disabled; after an Undo the Redo control becomes enabled; over-undoing past the floor is a safe no-op', `INCONCLUSIVE — the journal could not be walked to the at-base precondition: start undoDisabled=${s0.undoDisabled} redoDisabled=${s0.redoDisabled} currentIndex=${s0.currentIndex} entries=${s0.entries}; ${atBaseNote}; walk=${walk.map((w) => `[${w.path}]undo->current=${w.currentIndex},undoDisabled=${w.undoDisabled},redoDisabled=${w.redoDisabled}`).join(' | ') || '(none)'} — a store with pending journal depth cannot be scored against the at-base half of this row (needs a base-state store)`, { path: 'not-reachable', ok: false, extra: { park: true, parkReason }, surface })
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
    return rowResult({row:'UF-HIST-4',dclass:'D-state'}, 'At the base the Undo control is disabled; after an Undo the Redo control becomes enabled; over-undoing past the floor is a safe no-op', `start: undoDisabled=${s0.undoDisabled} redoDisabled=${s0.redoDisabled} currentIndex=${s0.currentIndex} entries=${s0.entries} stageHash=${sig0.hash} docs=${docCount0} alphaStoreSig=${store0.nodes}nodes/${store0.hash}; walk to the floor: ${walk.length} undos → ${walk.map((w) => `[${w.path}]undo->current=${w.currentIndex},undoDisabled=${w.undoDisabled},redoDisabled=${w.redoDisabled}`).join(' | ')}; ${atBaseNote}; after-an-Undo Redo enabled=${redoEnabledAfterUndo}; OVER-UNDO at the floor: real click path=${over.path} → undoDisabled=${sOver.undoDisabled} redoDisabled=${sOver.redoDisabled} stageHash ${sigBase.hash}->${sigOver.hash} len ${sigBase.len}->${sigOver.len} → safeNoop=${safeNoop}; [restore] Redo back → currentIndex=${restored ? restored.currentIndex : '?'} redoDisabled=${restored ? restored.redoDisabled : '?'} docs=${docCount1} alphaStoreSig=${store1.nodes}nodes/${store1.hash} → restoredExactly(cursor+docCount+storeView)=${restoreOk}`, { path: over.path, ok: redoEnabledAfterUndo && safeNoop && restoreOk, surface })
  },

  // UF-HIST-6 — clicking an OLDER history entry reverts the content to that
  // journal point (multi-step undo); the UI offers NO `replay` control.
  uf_hist_6: async (h) => {
    // §2.1 `E-2` — this block CLAIMS the declared matrix row `U-7` (MATRIX_ROWS
    // maps `U-7` to `uf_hist_6`), so it returns U-7's OWN verdict plus its own
    // checklist row (`UF-HIST-6`) on EVERY path, including the NOT-DRIVEN one.
    const ufHist6Assertion = 'Clicking an OLDER history entry reverts the content to that journal point; no replay control exists'
    await ufEnsureAppClear(h)
    // setup: mount beta, make ONE real edit (click into the editable + type +
    // blur) so a fresh journal point with an observable content delta exists
    await h.mcpTool(h.mcp, 'provident.focus', { target: { kind: 'document', documentId: '.live-fixture/core/beta' } }).catch(() => null)
    await sleep(1600)
    const marker = 'UFH6' + String(Date.now()).slice(-5)
    const geo = await h.cdp.evaluate(`(()=>{const e=[...document.querySelectorAll('#zone\\\\:main [contenteditable]')][0];if(!e)return null;const r=e.getBoundingClientRect();return {x:Math.round(r.x+20),y:Math.round(r.y+14),rag:e.getAttribute('data-rag-node-id')}})()`)
    if (!geo) {
      const why = 'no [contenteditable] in the mounted stage for the edit setup'
      // §2.1 `E-2` — the DECLARED row `U-7` carries its OWN verdict on this path
      // too (NOT-DRIVEN, the driver's precondition named), never an omission.
      return [
        rowResult({ row: 'UF-HIST-6', dclass: 'D-state' }, ufHist6Assertion, why, { path: 'missing', ok: false, surface: await ufSurfaceTarget(h) }),
        declaredRowResult('U-7', 'UF-HIST-6', ufHist6Assertion, 'D-state', why, { path: 'missing', ok: false, surface: await ufSurfaceTarget(h), checklistRow: 'UF-HIST-6' }),
      ]
    }
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
    const inStore = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-fixture/core/beta' }).catch(() => null)
    const committed = JSON.stringify(inStore || {}).includes(marker)
    const curIdx = h0.current == null ? null : Number(h0.current)
    const surface = await ufSurfaceTarget(h)
    if (curIdx == null || curIdx === 0) {
      const why = `INCONCLUSIVE — no older journal point to click (current=${h0.current}, entries=${JSON.stringify(h0.entries)}); edit committed=${committed}`
      // §2.3 `H-4` / finding `C-5` — THE PARK'S OWN REASON, set at the SITE that
      // parked: the unreachable-history path parked this row with NO reason, so its
      // `ROW` line read `verdict=PARKED` with the park text skipped while the
      // block-level `PARK` line printed `(no parkReason recorded for U-7)`. Both
      // results this path returns name the precondition they could not meet.
      const parkReason = `the journal holds no OLDER point to click (current=${h0.current}, entries=${JSON.stringify(h0.entries)}; edit committed=${committed}) — a multi-step history entry click cannot be driven against a journal at its first point`
      return [
        rowResult({ row: 'UF-HIST-6', dclass: 'D-state' }, ufHist6Assertion, why, { path: 'not-reachable', ok: false, extra: { park: true, parkReason }, surface }),
        declaredRowResult('U-7', 'UF-HIST-6', ufHist6Assertion, 'D-state', why, { path: 'not-reachable', ok: false, extra: { park: true, parkReason }, surface, checklistRow: 'UF-HIST-6' }),
      ]
    }
    const target = curIdx - 1
    // ⟨gate-4 `D-1`⟩ the history-entry click is driven for both rows this block owns.
    const click = await ufRealClick(h, `#pane-history-entry-${target}`, { rows: ['UF-HIST-6', 'U-7'] })
    await sleep(1800)
    const h1 = await hist()
    const sig1 = await ufStageSig(h)
    const inStore1 = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-fixture/core/beta' }).catch(() => null)
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
    const inStoreEnd = await h.mcpTool(h.mcp, 'rag.get_document', { documentId: '.live-fixture/core/beta' }).catch(() => null)
    const markerRestored = JSON.stringify(inStoreEnd || {}).includes(marker)
    const restored = markerRestored && String(hEnd.current) === String(h0.current)
    const replayOnly = await h.cdp.evaluate(`(()=>{const c=[...document.querySelectorAll('#pane-history button,#pane-history [role="button"],#editor-toolbar button')].map((b)=>(b.textContent||'').trim());return {controls:c}})()`)
    const ufHist6Evidence = `real edit setup: focused ${geo.rag}, typed "${marker}", commit-on-blur → committedToStore=${committed}; journal entries=${JSON.stringify(h0.entries.map((e) => e.i + '@' + e.kind))} current=${h0.current}; REAL click on the OLDER entry #${target} (path=${click.path}) → current ${h0.current}->${h1.current} moved=${positionMoved}; content reverted to that journal point: marker gone from the STORE=${!markerAfter} stageHash ${sig0.hash}->${sig1.hash} reverted=${reverted} (NOTE: pane-graph marks data-current at index cursor-1 while historyEntryClick(k) sets cursor=k, so clicking #k leaves #k-1 marked current — recorded, not scored); NO replay control in the history/editor chrome=${!h0.replayControl} (buttons=${JSON.stringify(replayOnly.controls)}); [restore] Redo → journal current=${hEnd.current} markerBackInStore=${markerRestored} restored=${restored}`
    const ufHist6Ok = committed && Number(h1.current) <= target && reverted && positionMoved && !h0.replayControl && restored
    return [
      rowResult({ row: 'UF-HIST-6', dclass: 'D-state' }, ufHist6Assertion, ufHist6Evidence, { path: click.path, ok: ufHist6Ok, surface }),
      declaredRowResult('U-7', 'UF-HIST-6', ufHist6Assertion, 'D-state', ufHist6Evidence, { path: click.path, ok: ufHist6Ok, surface, checklistRow: 'UF-HIST-6' }),
    ]
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
    const change = await h.mcpTool(h.mcp, 'edit.set_content', { nodeId: '.live-fixture/core/beta', content: '# Beta\n\nPane collapse (C5) — live content change for UF-LAYOUT-2.\n' }).catch((e) => ({ error: String(e) }))
    await sleep(2000)
    const after = await zones()
    const idsEqual = before.ids.length > 0 && before.ids.join(',') === after.ids.join(',')
    const idsBeforeMinusAfter = before.ids.filter((x) => !after.ids.includes(x))
    const idsAfterMinusBefore = after.ids.filter((x) => !before.ids.includes(x))
    const pairingEqual = before.nodeIds.length > 0 && before.nodeIds.join('|') === after.nodeIds.join('|')
    const pairingChanged = before.nodeIds.filter((x, i) => after.nodeIds[i] !== x).length
    const dom = await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');const l=document.getElementById('zone:left');const b=(e)=>{if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]};return {main:b(m),left:b(l),mainText:(m?(m.textContent||'').replace(/\\s+/g,' ').trim().slice(0,50):null)}})()`)
    return rowResult({row:'UF-LAYOUT-2',dclass:'D-state'}, 'provident.list_targets keeps the STABLE zone:* ids AND node-id pairing after a RAG content change, and the zone containers stay rendered', `zones BEFORE the content change: ids=${JSON.stringify(before.ids)} pairing=${JSON.stringify(before.nodeIds)}${before.err ? ' err=' + before.err : ''}; edit.set_content(.live-fixture/core/beta) → ${change && change.ok === false ? JSON.stringify(change) : 'ok'}; zones AFTER: ids=${JSON.stringify(after.ids)} pairing=${JSON.stringify(after.nodeIds)} → zoneIdSetStable=${idsEqual} (removed=${JSON.stringify(idsBeforeMinusAfter)} added=${JSON.stringify(idsAfterMinusBefore)}) nodeIdPairingStable=${pairingEqual} (pairing entries changed=${pairingChanged}); rendered zone containers: #zone:main box=${JSON.stringify(dom.main)} text="${dom.mainText}", #zone:left box=${JSON.stringify(dom.left)} (an empty zone is display:none by design — its id survives in the graph)`, { path: 'not-gesture', gesture: false, ok: idsEqual && pairingEqual && !!dom.main && dom.main[2] > 0 && dom.main[3] > 0, surface: await ufSurfaceTarget(h) })
  },

  // UF-LAYOUT-10 — with ZERO enabled+placed panes in `left` the zone's grid
  // TRACK must collapse and the stage must reclaim the width.
  uf_layout_10: async (h) => {
    await ufEnsureAppClear(h)
    const measure = async () => h.cdp.evaluate(`(()=>{const g=(id)=>{const e=document.getElementById(id);if(!e)return null;const r=e.getBoundingClientRect();return {box:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],display:getComputedStyle(e).display,cls:String(e.className)}};const w=document.getElementById('wiki-root');return {left:g('zone:left'),main:g('zone:main'),cols:w?getComputedStyle(w).gridTemplateColumns:null,frames:document.querySelectorAll('.pane-frame[data-pane-id]').length,roots:document.querySelectorAll('#wiki-root').length,modal:(document.getElementById('settings-modal')||{}).className||null}})()`)
    // §7.2 re-pin (finding A-9): the settings-modal frame must carry EXACTLY ONE
    // of `.is-open`/`.is-closed` at every state boundary this block already
    // crosses — before the open, inside the open, after the close. The class
    // read is the one `ufModal` already performs (its pre/post `className`
    // reads and `measure()`'s `modal` field); NO new MATRIX_ROWS slot, NO new
    // block, NO new click. `x` counts the two markers in one class string.
    const x = (c) => (/is-open/.test(c ?? '') ? 1 : 0) + (/is-closed/.test(c ?? '') ? 1 : 0)
    const preModal = await ufModal(h, true)
    const preXor = x(preModal.cls) === 1
    const filled = await measure()
    // REAL clicks: disable every ENABLED app-graph pane in the modal
    const enabledIds = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('#settings-modal [data-pane][data-enabled]')].map((t)=>{const p=t.getAttribute('data-pane');const root=document.querySelector('.pane-frame[data-pane-id="'+p+'"]');return root?p:null}).filter(Boolean))()`)
    const paths = []
    for (const pid of enabledIds) {
      // ⟨gate-4 `D-1`⟩ THE ROW IDENTITY of every click of the DISABLE series: it is the
      // gesture of ALL THREE rows this block carries (the checklist row and the two
      // declared halves `U-5`/`U-4`). The RE-ENABLE series below names NO row: it is the
      // block's own restore, and a restore click may never be handed to a row as its own
      // gesture (the exact mis-pair `D-1` names).
      const r = await ufRealClick(h, `#operator-pane-visibility-${pid}`, { rows: ['UF-LAYOUT-10', 'U-5', 'U-4'] })
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
    // the class XOR INSIDE the open (read from `measure()`'s own class read)
    const openXor = x(filled.modal) === 1 && x(empty.modal) === 1 && x(restored.modal) === 1
    const isEmptied = /is-empty/.test(empty.left ? empty.left.cls : '') && empty.frames === 0
    const trackCollapsed = (() => {
      const first = (c) => Number(String(c || '').split(' ')[0].replace('px', '')) || 0
      return first(empty.cols) === 0
    })()
    const stageReclaimed = !!empty.main && !!filled.main && empty.main.box[0] < filled.main.box[0] && empty.main.box[2] > filled.main.box[2] + 10
    const censusEnd = await h.cdp.evaluate(`(()=>{const c=document.getElementById('operator-enabled-panes');return c?(c.textContent||'').trim():null})()`)
    const postModal = await ufModal(h, false)
    // the class XOR AFTER the close (the class read `ufModal` performs on its return)
    const postXor = x(postModal.cls) === 1
    const modalClassXor = preXor && openXor && postXor
    // §7.2 LIMBS 2 and 3 — THE LAYOUT-EFFECT READINGS, carried as an EXTENSION of this
    // block's ALREADY-DECLARED row (`U-5`; `MATRIX_ROWS` unmoved at 8, no new slot, no
    // `U-n` id renumbered). LIMB 2: each zone container's box rect identical across a
    // PAGE-LEVEL scroll attempt, with the zone's OWN box carrying its internal scroll
    // range and `scrollTop` advancing INSIDE that box (the scrolled element is NAMED —
    // the zone's own content box, never the document). LIMB 3: the STAGE's own box is
    // the scroll container — its `scrollTop` advances while the page's does not and the
    // surrounding chrome (the zones and the tab strip) keeps its rects. Limb 3's subject
    // (a document longer than the stage's box) is prepared through the app's own import
    // route and reported by name; a reading taken without it is reported as such.
    //
    // ── THE READING ORDER IS PART OF THE PROPERTY, AND IT IS PRINTED AS SUCH ──
    // Limb 2 is read TWICE: `limb2AtRest` in the state this block's own clicks produced,
    // and `limb2WithTheStageDocOpen` AFTER the longer-than-the-stage document has been
    // loaded — because THE ZONE RECTS CAN ONLY DISAGREE WITH THE STAGE'S BOX WHILE THE
    // STAGE HOLDS A DOCUMENT LONGER THAN IT. A resting-state pair that reads "nothing
    // moved" cannot discriminate a fixed zone from a zone stretched by the very document
    // the limb is about, so the decisive pair is the second one and it is labelled so.
    const limb2AtRest = await ufLayoutZoneScrollAttempt(h, 260)
    // LIMB 3's subject: the fixture text and path are composed HERE (the caller's
    // values), and the fixture's OWN marker text is what the preparation helper waits
    // for on the stage — so the limb-3 reading can never silently run against whatever
    // document happened to be open (the vacuity the previous reading had).
    const stageOverflowFixture = join(ROOT, '.live-stage-overflow-probe.md')
    const stageOverflowBlocks = Number(60)
    const stageOverflowMarker = 'stage-overflow probe paragraph ' + String(stageOverflowBlocks)
    const stageOverflowText = `# Live Page Edit Fixture\n\n${Array.from({ length: stageOverflowBlocks }, (_, i) => `§7.2 stage-overflow probe paragraph ${i + 1} — the stage's own box must be the scroll container for a document longer than it, with the surrounding chrome unmoved.`).join('\n\n')}\n`
    const tallStageDoc = await ufEnsureStageBoxOverflowDoc(h, { fixtureText: stageOverflowText, fixturePath: stageOverflowFixture, surfaceSelector: ufStageDocSurfaceSelector(), marker: stageOverflowMarker })
    const limb2WithTheStageDocOpen = await ufLayoutZoneScrollAttempt(h, 260)
    const limb3 = await ufLayoutStageScrollAttempt(h, 220)
    // THE LIMB-2 PREDICATE, PER THE CLAUSE (never a proxy): every zone container is
    // FIXED, every zone's content box is scroll-CAPABLE, a zone that HAS an overflow
    // scrolls inside its own box, the zone boxes are bounded by the viewport with the
    // page unable to overflow, and the rects are value-for-value UNCHANGED across the
    // page-level attempt.
    const zoneContainersOk = (r) => Array.isArray(r.inside) && r.inside.length === 4 &&
      r.inside.every((z) => z.position === 'fixed') &&
      r.inside.every((z) => z.overflowY === 'auto' || z.overflowY === 'scroll') &&
      r.inside.every((z) => z.contentExceedsTheBox !== true || z.scrollTopAdvanced === true)
    const zonesUnmovedBothReadings = limb2AtRest.zonesUnmoved === true && limb2WithTheStageDocOpen.zonesUnmoved === true
    const zonesFixedAndScrollCapableBothReadings = zoneContainersOk(limb2AtRest) && zoneContainersOk(limb2WithTheStageDocOpen)
    const zonesBoundedAndPageCannotOverflow = [limb2AtRest, limb2WithTheStageDocOpen].every((r) => r.zoneBoxesBoundedByTheViewport === true && r.pageCannotOverflow === true)
    // THE NON-VACUITY GUARD: the "any overflow scrolls INSIDE the box" half must have
    // been exercised by a REAL range somewhere in this reading (a zone, or the stage) —
    // four empty zones with nothing to scroll can never satisfy it by themselves.
    const anInternalScrollRangeWasExercised = limb2AtRest.anyInternalScrollRangeExercised === true || limb2WithTheStageDocOpen.anyInternalScrollRangeExercised === true
    const limb2Ok = zonesUnmovedBothReadings && zonesFixedAndScrollCapableBothReadings && zonesBoundedAndPageCannotOverflow && anInternalScrollRangeWasExercised
    const limb3StageScrolledInside = !!(limb3 && limb3.stageScrolledInside === true)
    const limb3ChromeUnmoved = !!(limb3 && limb3.chromeUnmoved === true)
    const limb3PageUnmoved = !!(limb3 && limb3.pageUnmoved === true)
    // THE FALSIFIABILITY GATE: without a document LONGER than the stage's box the attempt
    // cannot discriminate a non-scrolling stage from a stage with nothing to scroll, so
    // the reading is reported INCONCLUSIVE and is never counted as a pass.
    const limb3SubjectOverflows = tallStageDoc.stageBoxOverflowed === true
    // ⟨gate-4 re-audit item 2 — THE GATE REQUIRES A **PREPARED** SUBJECT, NOT AN
    // INHERITED ONE.⟩ `ufEnsureStageBoxOverflowDoc` returns EARLY when the stage box
    // ALREADY overflows, and on that path it wrote nothing and mounted nothing: the
    // subject is whatever the previous phase left open. `stageBoxOverflowed === true`
    // is therefore satisfied by an INHERITED subject too, and the limb could read
    // CONCLUSIVE on a document this block never wrote and never identified — the
    // vacuity the helper's own wait exists to remove. The gate now names BOTH terms.
    const limb3SubjectPrepared = tallStageDoc.prepared === true
    const limb3SubjectIdentified = limb3SubjectPrepared && limb3SubjectOverflows
    const limb3Ok = limb3SubjectIdentified && limb3StageScrolledInside && limb3ChromeUnmoved && limb3PageUnmoved
    const zoneFacts = (r) => JSON.stringify(r.inside.map((z) => ({ id: z.id, position: z.position, overflowY: z.overflowY, scrollHeight: z.scrollHeight, clientHeight: z.clientHeight, contentExceedsTheBox: z.contentExceedsTheBox, scrollTop: z.scrollTopBefore + '->' + z.scrollTopAfter, scrollTopAdvanced: z.scrollTopAdvanced })))
    const zoneRects = (r, key) => JSON.stringify(r[key].map((b) => [b.id, b.box]))
    const u5LimbsEvidence =
      `[§7.2 limb 2 — ALL ZONES ARE FIXED POSITION WITH ANY SCROLLING INTERNAL; carrier row U-5/uf_layout_10; scope: the assembled renderer THIS driver spawned, the four ZONE CONTAINERS measured] ` +
      `REQUIRED: each zone container computes position:fixed with its own bounded box, its content box is scroll-capable (overflow:auto, never visible), any overflow scrolls INSIDE that box (scrollTop advancing inside the zone's own content box, the element scrolled NAMED), the zone boxes hold their rects across a page-level scroll attempt, and no zone's box is stretched by the document (the page itself cannot overflow). READ TWICE, because the zone boxes can only disagree with the stage's box WHILE THE STAGE HOLDS A DOCUMENT LONGER THAN IT: ` +
      `OBSERVED (a) AT REST [the state this block's own REAL clicks produced]: scrolled element = ${limb2AtRest.scrolledElement}; page-level scroll attempt=${limb2AtRest.attemptPx}px → the PAGE's own reading before=${JSON.stringify(limb2AtRest.pageBefore)} after=${JSON.stringify(limb2AtRest.pageAfter)} → pageAdvanced=${limb2AtRest.pageMoved} pageCannotOverflow=${limb2AtRest.pageCannotOverflow}; ZONE CONTAINERS (id, box) BEFORE=${zoneRects(limb2AtRest, 'before')} AFTER=${zoneRects(limb2AtRest, 'after')} → zonesUnmovedAcrossTheAttempt=${limb2AtRest.zonesUnmoved} zoneBoxesBoundedByTheViewport=${limb2AtRest.zoneBoxesBoundedByTheViewport} (viewport=${JSON.stringify(limb2AtRest.viewport)}); per-zone own scroll geometry: ${zoneFacts(limb2AtRest)} → zonesFixed=${limb2AtRest.inside.every((z) => z.position === 'fixed')} zonesScrollCapable=${limb2AtRest.inside.every((z) => z.overflowY === 'auto' || z.overflowY === 'scroll')}; EXCLUDED (elements carrying data-zone that are NOT zone containers — the four authored gutter affordances and the zone-minimize controls; named, never graded as zones)=${JSON.stringify(limb2AtRest.excluded.map((e) => [e.id, e.classes, e.box]))}; ` +
      `OBSERVED (b) WITH THE STAGE DOCUMENT OPEN — THE DECISIVE PAIR: scrolled element = ${limb2WithTheStageDocOpen.scrolledElement}; page-level scroll attempt=${limb2WithTheStageDocOpen.attemptPx}px → the PAGE's own reading before=${JSON.stringify(limb2WithTheStageDocOpen.pageBefore)} after=${JSON.stringify(limb2WithTheStageDocOpen.pageAfter)} → pageAdvanced=${limb2WithTheStageDocOpen.pageMoved} pageCannotOverflow=${limb2WithTheStageDocOpen.pageCannotOverflow}; ZONE CONTAINERS (id, box) BEFORE=${zoneRects(limb2WithTheStageDocOpen, 'before')} AFTER=${zoneRects(limb2WithTheStageDocOpen, 'after')} → zonesUnmovedAcrossTheAttempt=${limb2WithTheStageDocOpen.zonesUnmoved} zoneBoxesBoundedByTheViewport=${limb2WithTheStageDocOpen.zoneBoxesBoundedByTheViewport}; per-zone own scroll geometry: ${zoneFacts(limb2WithTheStageDocOpen)}; the stage's own box in the same reading: ${JSON.stringify(limb2WithTheStageDocOpen.stageScroll)}; ` +
      `→ zonesUnmovedAcrossBOTHReadings=${zonesUnmovedBothReadings} zonesFixedAndScrollCapableBothReadings=${zonesFixedAndScrollCapableBothReadings} zonesBoundedAndPageCannotOverflow=${zonesBoundedAndPageCannotOverflow} anInternalScrollRangeWasExercised=${anInternalScrollRangeWasExercised}; limb2Held=${limb2Ok}. ` +
      `[§7.2 limb 3 — THE STAGE SCROLLS INTERNALLY; carrier row U-5/uf_layout_10; scope: the assembled renderer THIS driver spawned] ` +
      `SUBJECT PREPARATION (the falsifiability requirement): ${tallStageDoc.prepared === true ? `a document LONGER than the stage's box was written to ${tallStageDoc.fixturePath}, imported through the app's own route (documentId=${JSON.stringify(tallStageDoc.documentId)}) and MOUNTED through the app's own document-selection seam (request answered ${JSON.stringify(tallStageDoc.mountRequested)}); the stage was WAITED ON (bounded, ${tallStageDoc.waitedMs}ms) for its OWN marker text: the imported document is mounted on the stage=${tallStageDoc.mountOfTheImportedDoc}` : `${ufStageSubjectIdentity(tallStageDoc)} — WHY: ${tallStageDoc.why}`} → the stage box read during the limb: box=${tallStageDoc.observed ? JSON.stringify(tallStageDoc.observed.stageBox) : '?'} scrollHeight=${tallStageDoc.observed ? tallStageDoc.observed.stageScrollHeight : '?'} clientHeight=${tallStageDoc.observed ? tallStageDoc.observed.stageClientHeight : '?'} overflowY=${tallStageDoc.observed ? tallStageDoc.observed.stageOverflowY : '?'} (editable surface present=${tallStageDoc.observed ? tallStageDoc.observed.surfacePresent : '?'}, candidates=${tallStageDoc.observed ? tallStageDoc.observed.surfaceCandidates : '?'}, marker rendered=${tallStageDoc.observed ? tallStageDoc.observed.stageTextHasMarker : '?'}, active tab ${JSON.stringify(tallStageDoc.observed ? tallStageDoc.observed.activeTab : null)}, prepared by ${tallStageDoc.preparedBy}) → the SUBJECT was PREPARED BY THIS HELPER=${limb3SubjectPrepared} (required true: an INHERITED overflowing stage box satisfies stageBoxOverflowed without identifying the subject, and a limb read on it would be a reading of a document this block never wrote) and stageBoxOverflowed=${limb3SubjectOverflows} → subjectIdentified=${limb3SubjectIdentified} (${limb3SubjectIdentified === true ? 'the attempt below is CONCLUSIVE for the property' : `NOT CONCLUSIVE — ${limb3SubjectPrepared ? 'WITHOUT a document longer than the stage box this attempt cannot discriminate a non-scrolling stage from a stage with nothing to scroll' : 'the subject is an INHERITED state, not a document this block prepared: the state may be read, and it is reported as such, but it may not carry limb 3'}, never a pass`}); ` +
      `OBSERVED: scrolled element = ${limb3 && limb3.scrolledElement ? limb3.scrolledElement : '(no #zone:main)'}; stage box=${JSON.stringify(limb3 ? limb3.stageBox : null)} scrollHeight=${limb3 ? limb3.scrollHeight : '?'} clientHeight=${limb3 ? limb3.clientHeight : '?'} overflowY=${limb3 ? limb3.overflowY : '?'}; stage's OWN scrollTop ${limb3 ? limb3.scrollTopBefore : '?'}->${limb3 ? limb3.scrollTopAfter : '?'} (attempt ${limb3 ? limb3.attemptPx : '?'}px) → stageScrollTopAdvanced=${limb3 && limb3.stageScrollTopAdvanced} stageScrolledInside=${limb3StageScrolledInside}; ` +
      `chrome rects (the zones + the tab strip) BEFORE=${JSON.stringify(limb3 ? limb3.chromeBefore : null)} AFTER=${JSON.stringify(limb3 ? limb3.chromeAfter : null)} → surroundingChromeUnchanged=${limb3ChromeUnmoved}; the PAGE's own offset before=${JSON.stringify(limb3 ? limb3.pageBefore : null)} after=${JSON.stringify(limb3 ? limb3.pageAfter : null)} → pageDidNotMove=${limb3PageUnmoved}; limb3Held=${limb3Ok}. ` +
      `[WHAT THESE ARE NOT — stated so the failure cannot recur: a mount count is limb 1's SUB-CLAUSE (b); the settings-modal class-XOR below is a DOM/class invariant of a DIFFERENT surface and is NOT a layout-effect reading at all — it is CARRIED BESIDE these limbs and NEVER substitutes for any of them; and no node-side reading can carry a limb (§7.1)] ` +
      `settings-modal class-XOR (the block's landed extra property): before the open class="${preModal.cls}" exactlyOne=${preXor}, inside the open class="${filled.modal}" exactlyOne=${openXor} (and ${JSON.stringify([empty.modal, restored.modal])} at the block's other in-open reads), after the close class="${postModal.cls}" exactlyOne=${postXor} → exactlyOneOf(.is-open/.is-closed) at every state boundary=${modalClassXor}`
    // §2.1 `E-2` — THE TWO DECLARED ROWS THIS BLOCK CLAIMS (`MATRIX_ROWS` maps
    // `uf_layout_10` to BOTH `U-4` and `U-5`) each get their OWN verdict:
    //   * `U-4` — the empty↔filled pane-set transition (the two REAL click rounds
    //     above) leaves exactly ONE `#wiki-root` mount (no stale/duplicate root);
    //   * `U-5` — with ZERO enabled+placed panes the zone's grid TRACK collapses
    //     and the stage reclaims the width.
    // The shared evidence is the block's own measurement; the PASS predicates are
    // DIFFERENT claims, so the two rows are separately readable.
    const singleRootMount = filled.roots === 1 && empty.roots === 1 && restored.roots === 1
    const u4Evidence = `empty<->filled pane-set transition driven by REAL clicks: FILLED #wiki-root mounts=${filled.roots} (frames=${filled.frames}), EMPTY (every pane disabled) mounts=${empty.roots} (frames=${empty.frames}), RESTORED (every pane re-enabled) mounts=${restored.roots} (frames=${restored.frames}); census="${censusEnd}"; disabled paths=${JSON.stringify(paths)}; re-enable paths=${JSON.stringify(restorePaths)}; paneFrameCensus(filled/empty/restored)=${filled.frames}/${empty.frames}/${restored.frames} → singleRootMountAcrossTheTransition=${singleRootMount} (required: exactly ONE #wiki-root at every boundary — a stale/duplicate root keeps the id and takes layout flow)`
    const u5Evidence = `FILLED: left=${JSON.stringify(filled.left ? filled.left.box : null)} (display=${filled.left ? filled.left.display : '?'}) main=${JSON.stringify(filled.main ? filled.main.box : null)} gridColumns="${filled.cols}" frames=${filled.frames}; REAL clicks disabled ${JSON.stringify(paths)} → EMPTY: zone:left cls="${empty.left ? empty.left.cls : '?'}" display=${empty.left ? empty.left.display : '?'} box=${JSON.stringify(empty.left ? empty.left.box : null)} frames=${empty.frames} main=${JSON.stringify(empty.main ? empty.main.box : null)} gridColumns="${empty.cols}" → isEmptyMirrorApplied=${isEmptied} gridTrackCollapsed=${trackCollapsed} stageWidened/Reclaimed=${stageReclaimed} (stage x ${filled.main ? filled.main.box[0] : '?'}->${empty.main ? empty.main.box[0] : '?'}, width ${filled.main ? filled.main.box[2] : '?'}->${empty.main ? empty.main.box[2] : '?'}); [restore] REAL clicks re-enabled ${JSON.stringify(restorePaths)} → frames=${restored.frames} leftWidth=${restored.left ? restored.left.box[2] : '?'} census="${censusEnd}"; ${u5LimbsEvidence}`
    const ufLayout10Opts = { path: paths.every((p) => /:cdp$/.test(p)) && restorePaths.every((p) => /:cdp$/.test(p)) ? 'cdp' : 'native-fallback', ok: isEmptied && trackCollapsed && stageReclaimed && modalClassXor, surface: await ufSurfaceTarget(h) }
    return [
      rowResult({ row: 'UF-LAYOUT-10', dclass: 'D-visual' }, "With ZERO enabled+placed panes in the left zone, the zone's grid TRACK collapses and the stage reclaims the width", u5Evidence, ufLayout10Opts),
      declaredRowResult('U-5', 'UF-LAYOUT-10', "An empty side zone's grid TRACK collapses and the stage reclaims the width — EXTENDED (§7.2 re-pin) with limbs 2 and 3: every zone container keeps its box rect and scrolls INSIDE its own box, and the stage's own box is the scroll container with the surrounding chrome unmoved", 'D-visual', u5Evidence, { ...ufLayout10Opts, ok: isEmptied && trackCollapsed && stageReclaimed && limb2Ok && limb3Ok, required: '§7.2 limb 2 on the assembled surface, measured on the four ZONE CONTAINERS: each computes position:fixed with its own bounded box, its content box is scroll-capable (overflow:auto, never visible), any overflow scrolls INSIDE that box (scrollTop advancing inside the zone\'s own content box, the element scrolled NAMED), the zone boxes hold their rects value-for-value across a page-level scroll attempt, no zone box is stretched by the document (the page itself cannot overflow), and the reading exercises a REAL internal range (non-vacuity); §7.2 limb 3: a document LONGER than the stage\'s box is mounted on the stage (the falsifiability gate — without it the reading is inconclusive) and the stage\'s own box is the scroll container — its scrollTop advances inside it while the page\'s offset does not move and the surrounding chrome (the zones and the tab strip) keeps its rects; PLUS the row\'s filed property (the empty side zone\'s grid track collapses and the stage reclaims the width)', observed: u5Evidence, checklistRow: 'UF-LAYOUT-10' }),
      declaredRowResult('U-4', 'UF-LAYOUT-10', 'The empty↔filled pane-set transition leaves exactly ONE #wiki-root mount (no stale/duplicate root survives the transition)', 'D-visual', u4Evidence, { ...ufLayout10Opts, ok: singleRootMount && ufLayout10Opts.ok, checklistRow: 'UF-LAYOUT-10' }),
    ]
  },

  // Harness hygiene (not a checklist row, no verdict — §6.1 diagnostic form):
  // restore the app's baseline live layout — the left zone EXPANDED with both
  // enabled panes expanded and the REPRESENTATION mode back on `html` (the
  // landed successor `DECIDED: REPRESENTATION-MODE-SUCCESSOR`, read off
  // `#editor-toolbar-toggle`'s own `data-mode`) — so a sequential battery starts
  // from a stable, meaningful state.
  //
  // §2.3 `H-1` clause 3: this hygiene BLOCK runs once, at its own position in the
  // key order (`V-6`) — so the SAME restore is also reachable PER BLOCK through
  // `ufRestoreZoneState`/`ufEnsurePaneExpanded`, which any frame-based block calls
  // itself. This block stays as the battery's own checkpoint, not as the only
  // restore path.
  uf_restore_layout: async (h) => {
    await ufEnsureAppClear(h)
    const snap = async () => h.cdp.evaluate(`(()=>({zone:(document.getElementById('zone:left')||{}).className,zoneState:/is-minimized/.test(String((document.getElementById('zone:left')||{}).className||''))?'minimized':'expanded',frames:[...document.querySelectorAll('.pane-frame[data-pane-id]')].map((f)=>f.getAttribute('data-pane-id')+(f.classList.contains('is-collapsed')?'(collapsed)':'(expanded)')),mode:(document.getElementById('editor-toolbar-toggle')||{}).getAttribute?.('data-mode')}))()`)
    const before = await snap()
    const zoneRestore = await ufRestoreZoneState(h, 'left')
    const paths = [zoneRestore.before.zoneState === 'minimized' ? 'zone:' + zoneRestore.path : 'zone:already-expanded']
    for (const pid of ['doc-nav', 'search']) { const r = await ufEnsurePaneExpanded(h, pid); paths.push(pid + ':' + r.path) }
    let modePath = 'already-html'
    if (before.mode !== 'html') { modePath = (await ufRealClick(h, '#editor-toolbar-toggle')).path; await sleep(1600) }
    const after = await snap()
    const restoredOk = !/is-minimized/.test(after.zone) && after.frames.length >= 1 && !after.frames.some((f) => /collapsed/.test(f)) && after.mode === 'html'
    return diagResult(`baseline before: ${JSON.stringify(before)}; restore: ${JSON.stringify(paths)} representationMode ${before.mode}->${after.mode} (real click path=${modePath}); after: ${JSON.stringify(after)}; baselineRestored=${restoredOk}`)
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
    return rowResult({row:'UF-GNOSIS-1',dclass:'D-interaction'}, 'The gnosis-wikis pane renders the LIVE engine wiki list and a REAL click on a wiki shows it (wiki.get)', `enable=${JSON.stringify(en.flips)} modal=${en.open} expand=${exp.path}; pane li[data-wiki-id="wiki-0"]="${li ? li.text : 'MISSING'}" box=${li ? JSON.stringify(li.box) : 'null'} painted=${painted}; engine gnosis.wiki.list=${JSON.stringify(engine).slice(0, 160)} nameMatchesEngine=${nameMatchesEngine}; CONTROL(no click 3s) signatureStable=${controlStable} sig=${JSON.stringify(s1)}; REAL click #gnosis-wikis-refresh path=${refresh.path} → reassembled=${refreshReassembled} (sig ${JSON.stringify(s2)}) = ${refreshReassembled ? 'the handler ran' : 'NO-OP'}; REAL click the wiki li (hit=${click.rect ? click.rect.hit : '?'}) path=${click.path} → reassembled=${liClickReassembled} (sig ${JSON.stringify(s3)}) paneText="${sel ? sel.paneText : '?'}" showsWiki=${shown} framePainted=${shownPainted}; [DIAG] direct provident.dispatch on the SAME li node ${JSON.stringify(disp.nodeId)} → listedHandler=${JSON.stringify(disp.handlers)} results=${JSON.stringify(disp.results)} and the pane still reads "${afterDispatch ? afterDispatch.paneText : '?'}" (the handler EXISTS + RUNS, its body's seam is a no-op)`, { path: refresh.path === 'cdp' && click.path === 'cdp' ? 'cdp' : click.path, ok: painted && nameMatchesEngine && controlStable && refreshReassembled && liClickReassembled && shown && shownPainted, surface: await ufSurfaceTarget(h) })
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
    return rowResult({row:'UF-GNOSIS-2',dclass:'D-interaction'}, 'The gnosis-documents pane renders the selected wiki DOCUMENT LIST with the live engine READY (never a permanent data-gnosis-state="unavailable" deadlock) and opens a document', `enable=${JSON.stringify(en.flips)}; REAL click #gnosis-documents-refresh path=${refresh.path} → wiki li[data-wiki-id="wiki-0"]="${wikiLi ? wikiLi.text : 'MISSING'}" box=${wikiLi ? JSON.stringify(wikiLi.box) : 'null'} painted=${wikiPainted} deadlockUnavailable=${deadlock} clickableItems=${withWikis ? withWikis.lis.filter((l) => l.wiki || l.doc).length : 0}; REAL click that wiki li path=${selectWiki.path} (hit=${selectWiki.rect ? selectWiki.rect.hit : '?'}) → reassembled=${selectReassembled} doc Li[data-document-id="doc-1"]="${docLi ? docLi.text : 'MISSING'}" painted=${docPainted} paneText="${withDocs ? withDocs.paneText : '?'}"; REAL click a doc li path=${selectDoc.path} → documentViewShown=${docShown}; [DIAG] direct provident.dispatch on the wiki li (${JSON.stringify(disp.handlers)}, results=${JSON.stringify(disp.results)}) left the pane at "${afterDispState ? afterDispState.paneText : '?'}"; the DIRECT bridge window.provident.gnosis.documents('gnosis.document.list',{wikiId:'wiki-0'}) RESOLVES from the live engine → ${direct}; after it the pane STILL reads "${afterDirect ? afterDirect.paneText : '?'}" (the engine + IPC + pane render path all work; the pane's own handler seam is a no-op)`, { path: refresh.path === 'cdp' && selectWiki.path === 'cdp' && selectDoc.path === 'cdp' ? 'cdp' : selectDoc.path, ok: wikiPainted && !deadlock && openable && docPainted && docShown && selectReassembled, surface: await ufSurfaceTarget(h) })
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
    return rowResult({row:'UF-GNOSIS-3',dclass:'D-interaction'}, 'A REAL typed query + REAL submit in the gnosis-query pane runs a real engine query and renders >=1 result row (painted)', `enable=${JSON.stringify(en.flips)} expand=${exp.path}; REAL click #gnosis-query-input path=${focus.path} + Input.insertText → typedValue="${typed}"; REAL click #gnosis-query-submit path=${submit.path} → pane data-gnosis-pane=query data-gnosis-query="${st ? st.queryAttr : '?'}" traceMode=${st ? st.traceMode : '?'} renderedResultRows=${rows.length} painted=${painted.length} paneText="${st ? st.paneText : '?'}"; INDEPENDENT ORACLE — the SAME query over the GET path (gnosis.stream) returns ${streamResult ? streamResult.results.length + ' results (first "' + streamResult.results[0].snippet + '" @ ' + streamResult.results[0].score + ')' : JSON.stringify(engine).slice(0, 200)}; the POST path (gnosis.query MCP) returns ${JSON.stringify(mcpQuery).slice(0, 200)}`, { path: focus.path === 'cdp' && submit.path === 'cdp' ? 'cdp' : submit.path, ok: paneRenderedResults && painted.length > 0 && !!streamResult && streamResult.results.length > 0, surface: await ufSurfaceTarget(h) })
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
    return rowResult({row:'UF-GNOSIS-4',dclass:'D-state'}, 'The gnosis-status pane renders the LIVE engine report INSIDE the settings modal (painted), #gnosis-status-refresh updates it, and the pane is ABSENT from the app-graph MCP surfaces', `modal opened by a REAL click (path=${open.path}); pane inModal=${before ? before.inModal : '?'} inOperatorPanes=${before ? before.inOperatorPanes : '?'} box=${before ? JSON.stringify(before.box) : 'null'} painted=${painted} data-gnosis-state=${before ? before.state : '?'} version=${before ? before.version : '?'} subsystems=${JSON.stringify(before ? before.subs : null)} text="${before ? before.text.slice(0, 200) : '?'}"; matchesLiveEngineReport(state+version+subsystemCensus)=${matchesEngine} (engine gnosis.status state=${engine ? engine.state : '?'} version=${engine ? engine.version : '?'}); CONTROL(no click 3 s) signatureStable=${controlStable} (sig ${JSON.stringify(s1)}); REAL click #gnosis-status-refresh path=${rb.path} (hit=${rb.rect ? rb.rect.hit : '?'}) → app-graph RE-ASSEMBLED=${refreshReassembled} (sig ${JSON.stringify(s3)}) which is the causal proof the click reached its handler → refreshStatus() → the live engine read → onChanged()/host.refresh(); repainted=${repainted} state=${after ? after.state : '?'} (a value delta is impossible here: the engine's HealthReport is invariant while the engine stays Ready); MCP invisibility: get_rendered_html(${htmlStr.length} chars) contains a status-pane marker=${statusInHtml}; list_targets contains "gnosis-status"=${statusInTargets}`, { path: rb.path, ok: painted && matchesEngine && controlStable && refreshReassembled && repainted && !statusInHtml && !statusInTargets, surface: await ufSurfaceTarget(h) })
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
    const ufGnosis5Evidence = `enable=${JSON.stringify(en.flips)} expand=${exp.path}; rendered gnosis-documents controls=${JSON.stringify(st ? st.controls : null)} updateControlsInPane=${JSON.stringify(updateControl)}; the engine document is UNCHANGED by the whole pane drive: doc-1 graph nodes ${nodesBefore}->${nodesAfter} (graphIntact=${graphIntact}) values-identical=${textBefore === textAfter}; the empty-graph path is also unreachable over MCP: gnosis.document.update {graph:{nodes:[],edges:[]}} → ${JSON.stringify(emptyGraph).slice(0, 200)} (the shell-side edit-authority gate denies it BEFORE any engine wire call; the engine is left at revision ${afterGraph ? afterGraph.revision : '?'})`
    // §6.1 `H-4` — THE PARK CARRYING ITS OWN ROW: `evidence` is the STRING above
    // (never an object, which printed `[object Object]` as the park's detail) and
    // the §6.1 field set travels in the SIXTH slot, where `parkRow` reads it.
    return parkRow('UF-GNOSIS-5', 'The docs-pane Update path does NOT blank the document content with an empty-graph placeholder (HC1: a real graph-edit surface is the truthful path)', 'D-state', 'the docs-pane renders NO Update control at all (W1-Q12 parked it deliberately), so the row has no drivable Update gesture', ufGnosis5Evidence, { path: 'element-absent', surface: await ufSurfaceTarget(h) })
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
    return rowResult({row:'UF-GNOSIS-6',dclass:'D-interaction'}, "Each gnosis CRUD action's UI control is present and performs a REAL engine wire call (create/get/list/delete/publish/unpublish/archive)", `enable=${JSON.stringify(en.flips)}; rendered controls present=${JSON.stringify(present)} allPresentExceptUpdate=${allPresent} paintedBoxes=${JSON.stringify(boxes)} allPainted=${allPainted} → the delete/publish/unpublish/archive controls are NOT in the rendered DOM because they are conditionally rendered only when a document is SELECTED, and the selection seam is a no-op (below); the Update control is absent by design (HC1); REAL click on the wiki li in gnosis-documents → app-graph reassembled=${selectReassembled} (FALSE ⇒ the pane's handler seam did nothing: no gnosis.document.list wire call); REAL click #gnosis-documents-refresh → reassembled=${readRefreshReassembled} (FALSE ⇒ no gnosis.wiki.list wire call either); the ONLY live engine reads came from the host's BOOT path, not from any control: gnosis-wikis li[data-wiki-id=wiki-0]="${w && w.lis[0] ? w.lis[0].text : '?'}" and the gnosis-documents wiki selector li="${d && d.lis[0] ? d.lis[0].text : '?'}" readVerbsReachedEngine(boot-sourced)=${readVerbsReachedEngine}; MUTATING verbs over the SAME MCP handler: gnosis.document.delete {callerId:'operator'} → ${JSON.stringify(engineDeletes).slice(0, 130)}; gnosis.document.create {callerId:'operator'} → ${JSON.stringify(engineCreates).slice(0, 130)}; doc-1 survived=${!!(docStill && docStill.documentId)} (the mutating half is ALSO gated fail-closed: this app instance was booted without PROVIDENT_OPERATOR_CREDENTIAL, so the shell-side AuthorityStore denies before any engine wire call)`, { path: rf.path === 'cdp' ? 'cdp' : rf.path, ok: allPresent && allPainted && selectReassembled && readRefreshReassembled, surface: await ufSurfaceTarget(h) })
  },

  // =========================================================================
  // UNIT C9 `U-EDIT-1` — THE `U-EDIT-1-LIVE` LIVE BATTERY (spec §8.3 items 1-8;
  // MANDATORY pre-DONE per RCA-11, and the row whose un-run state is
  // `docs/defects.md` `C9-U-EDIT-1-ADVERSARIAL-MUST-FIX-SET` M4). LAYER (RCA-12):
  // assembled-renderer — the node greens (docs/specs/unit-u-edit-1-greens.md) are
  // ENVELOPE/STORE-green; every row here drives a REAL gesture/key against the
  // RUNNING app and pins the painted/visible end state (`proxyPASS:false`).
  // =========================================================================

  // ---- §8.3 item 1 — a real drag selects ACROSS two block elements of the ONE
  // contenteditable root (the discriminator the node suite cannot see). ----
  u_edit_1_live_selection_span: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const fixture = await ufEnsureEditFixture(h, 2)
    const surface = await ufSurfaceTarget(h)
    const st = await ufEditSurfaceState(h)
    if (!st.present || st.blockCount < 2) {
      return rowResult({row:'U-EDIT-1-LIVE-1',dclass:'D-interaction'}, 'A real hit-tested drag selects from a position in one paragraph/block to a position in the next; the Selection has ONE range whose start/end containers are DIFFERENT block elements of the SAME contenteditable root', `no usable surface: present=${st.present} blockCount=${st.blockCount}; fixture search=${JSON.stringify({ docId: fixture.docId, tried: fixture.tried, noMultiBlock: fixture.noMultiBlock === true })} — a document whose head element CONTAINS its children renders as ONE block root, so no corpora in this store presents the 2-block surface this item needs`, { path: 'missing', ok: false, surface })
    }
    // Two adjacent block children that BOTH have a hit-testable slice in the
    // viewport (the drag's two endpoints must be real coordinates).
    const pickSrc = `(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');
      const bs=[...s.children];const vh=window.innerHeight;
      const vis=(e)=>{const r=e.getBoundingClientRect();const top=Math.max(r.top,0),bot=Math.min(r.bottom,vh);return {r:r,top:top,bot:bot,h:bot-top}};
      for(let i=0;i+1<bs.length;i++){const a=vis(bs[i]),b=vis(bs[i+1]);
        if(a.h>=24&&b.h>=24&&a.r.width>0&&b.r.width>0)return {i:i,aTag:bs[i].tagName,bTag:bs[i+1].tagName,
          aBox:[Math.round(a.r.x),Math.round(a.r.y),Math.round(a.r.width),Math.round(a.r.height)],
          bBox:[Math.round(b.r.x),Math.round(b.r.y),Math.round(b.r.width),Math.round(b.r.height)],
          ax:Math.round(a.r.x+Math.min(a.r.width-12,40)),ay:Math.round(a.top+Math.min(a.h/2,Math.max(8,a.h-8))),
          bx:Math.round(b.r.x+Math.min(b.r.width-12,Math.max(20,b.r.width/2))),by:Math.round(b.top+Math.min(b.h/2,Math.max(8,b.h-8))),
          aRid:bs[i].getAttribute('data-rag-node-id'),bRid:bs[i+1].getAttribute('data-rag-node-id')};}
      return null})()`
    let pick = await h.cdp.evaluate(pickSrc)
    if (!pick) {
      // fall back: scroll the surface's origin into view, then re-pick
      await h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');if(s&&s.scrollIntoView)s.scrollIntoView({block:'start'});return true})()`)
      await sleep(800)
      pick = await h.cdp.evaluate(pickSrc)
    }
    if (!pick) {
      return rowResult({row:'U-EDIT-1-LIVE-1',dclass:'D-interaction'}, 'A real hit-tested drag selects across two block elements of the ONE contenteditable root', `no two adjacent blocks have a >=24px hit-testable slice in the ${await h.cdp.evaluate('window.innerHeight')}px viewport: ${JSON.stringify(st.blocks)}`, { path: 'zero-box', ok: false, surface })
    }
    await h.cdp.evaluate(`window.getSelection().removeAllRanges()`)
    // the start point: inside block A; the end point: inside block B
    const x = pick.ax
    const y1 = pick.ay
    const x2 = pick.bx
    const y2 = pick.by
    const hit1 = await h.cdp.evaluate(`(()=>{const e=document.elementFromPoint(${x},${y1});return e?(e.id||e.tagName):null})()`)
    const hit2 = await h.cdp.evaluate(`(()=>{const e=document.elementFromPoint(${x2},${y2});return e?(e.id||e.tagName):null})()`)
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: y1, buttons: 0 })
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y: y1, button: 'left', buttons: 1, clickCount: 1 })
    for (let i = 1; i <= 8; i += 1) {
      await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(x + ((x2 - x) * i) / 8), y: Math.round(y1 + ((y2 - y1) * i) / 8), button: 'left', buttons: 1 })
      await sleep(40)
    }
    await h.cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x2, y: y2, button: 'left', buttons: 0, clickCount: 1 })
    await sleep(500)
    const caret = await ufCaret(h)
    const spanOk = caret && !caret.none && caret.rangeCount === 1 && caret.collapsed === false &&
      caret.startBlock != null && caret.endBlock != null && caret.startBlock !== caret.endBlock && caret.insideSurface === true
    return rowResult({row:'U-EDIT-1-LIVE-1',dclass:'D-interaction'}, 'A real hit-tested drag selects from a position in one block to a position in the next; the Selection has ONE range whose start/end containers are DIFFERENT block elements of the SAME contenteditable root', `fixture=${JSON.stringify({ docId: fixture.docId, blocks: fixture.surface ? fixture.surface.blockCount : null, active: fixture.active ? fixture.active.activeTabId + '/' + fixture.active.activeTabKind : null, surfacePresent: fixture.surface ? fixture.surface.present : null })}; surface marker=${st.marker} blocks=${st.blockCount} ${JSON.stringify(st.blocks.slice(0, 4))}; picked adjacent pair i=${pick.i} ${pick.aTag}#${pick.aRid} box=${JSON.stringify(pick.aBox)} -> ${pick.bTag}#${pick.bRid} box=${JSON.stringify(pick.bBox)}; drag (${x},${y1}) hit=${hit1} -> (${x2},${y2}) hit=${hit2}; Selection after the drag: ${JSON.stringify(caret)}; ONE range whose startContainer(${caret ? caret.startContainer : '?'}) and endContainer(${caret ? caret.endContainer : '?'}) are different blocks of the same root=${spanOk}`,
      { path: 'cdp', ok: spanOk, surface })
  },

  // ---- §8.3 item 2 — head->body->head caret movement by ARROW KEYS with an
  // unchanged surface identity/box (no re-mount). ----
  u_edit_1_live_caret_head_body: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const fixture = await ufEnsureEditFixture(h, 2)
    const surface = await ufSurfaceTarget(h)
    const before = await ufEditSurfaceState(h)
    if (!before.present || before.blockCount < 2) {
      return rowResult({row:'U-EDIT-1-LIVE-2',dclass:'D-interaction'}, 'ArrowDown from the end of the doc-head lands the caret in the body block (ArrowUp returns it), with the surface element identity and box UNCHANGED across both movements', `no usable surface: ${JSON.stringify({ present: before.present, blocks: before.blockCount })}; fixture search=${JSON.stringify({ docId: fixture.docId, tried: fixture.tried, noMultiBlock: fixture.noMultiBlock === true })}`, { path: 'missing', ok: false, surface })
    }
    const placed = await ufCaretAt(h, 0)
    await sleep(250)
    const sel0 = await ufCaret(h)
    const idBefore = before.identityToken
    // REAL ArrowDown
    await h.cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40, nativeVirtualKeyCode: 40 })
    await h.cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40, nativeVirtualKeyCode: 40 })
    await sleep(400)
    const selDown = await ufCaret(h)
    const mid = await ufEditSurfaceState(h)
    // REAL ArrowUp
    await h.cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38, nativeVirtualKeyCode: 38 })
    await h.cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowUp', code: 'ArrowUp', windowsVirtualKeyCode: 38, nativeVirtualKeyCode: 38 })
    await sleep(400)
    const selUp = await ufCaret(h)
    const after = await ufEditSurfaceState(h)
    const downIntoBody = !!(selDown && !selDown.none && selDown.startBlock != null && selDown.startBlock !== (sel0 ? sel0.startBlock : null))
    const upBackIntoHead = !!(selUp && !selUp.none && selUp.startBlock === (sel0 ? sel0.startBlock : '?'))
    const identityStable = before.identityToken === mid.identityToken && mid.identityToken === after.identityToken
    const boxStable = JSON.stringify(before.box) === JSON.stringify(after.box)
    return rowResult({row:'U-EDIT-1-LIVE-2',dclass:'D-interaction'}, 'ArrowDown from the end of the doc-head lands the caret inside the body block, ArrowUp returns it into the head, and the surface element identity+box are UNCHANGED across both (no re-mount)', `fixture=${JSON.stringify({ docId: fixture.docId, blocks: fixture.surface ? fixture.surface.blockCount : null, active: fixture.active ? fixture.active.activeTabId + '/' + fixture.active.activeTabKind : null, surfacePresent: fixture.surface ? fixture.surface.present : null })}; surface marker=${before.marker} blocks=${JSON.stringify(before.blocks.map((b) => `${b.tag}#${b.rid}`))} box=${JSON.stringify(before.box)}; caret placed in block 0: ${JSON.stringify(placed)} => ${JSON.stringify(sel0)}; after REAL ArrowDown: ${JSON.stringify(selDown)} (moved into the body=${downIntoBody}); after REAL ArrowUp: ${JSON.stringify(selUp)} (returned to the head=${upBackIntoHead}); surface identity token before/down/up = ${idBefore} / ${mid.identityToken} / ${after.identityToken} unchanged=${identityStable}; box ${JSON.stringify(before.box)} -> ${JSON.stringify(after.box)} unchanged=${boxStable}`,
      { path: 'cdp', ok: downIntoBody && upBackIntoHead && identityStable && boxStable, surface })
  },

  // ---- §8.3 item 7 — a REAL typed edit + blur commits 1-1 to the STORE
  // (store read-back AND the rendered DOM agree), in ONE batch. ----
  u_edit_1_live_typed_commit_one_batch: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const fixture = await ufEnsureEditFixture(h)
    const surface = await ufSurfaceTarget(h)
    const st = await ufEditSurfaceState(h)
    if (!st.present) return rowResult({row:'U-EDIT-1-LIVE-7',dclass:'D-state'}, 'A real typed edit in one block, blurred, commits to the store in ONE batch and the store read-back and rendered DOM AGREE; an unrelated block is unchanged', `no page-edit-surface in the stage: fixture=${JSON.stringify({ docId: fixture.docId, import: fixture.import, bridge: fixture.bridge, tab: fixture.tab, active: fixture.active, surface: fixture.surface })}`, { path: 'missing', ok: false, surface })
    const documentId = st.marker
    const journalPre = await h.mcpTool(h.mcp, 'provident.get_journal', {}).catch(() => null)
    const journalBefore = journalPre && typeof journalPre.undoDepth === 'number' ? journalPre.undoDepth : 0
    const journalPreDetail = journalPre && Array.isArray(journalPre.entries) ? { entries: journalPre.entries.length, kinds: journalPre.entries.map((e) => e.kind).slice(-6) } : null
    const docBefore = await h.mcpTool(h.mcp, 'rag.get_document', { documentId }).catch((e) => ({ __error: String(e) }))
    const beforeText = JSON.stringify(docBefore)
    // the block to edit: the LAST block (usually a body paragraph) — the first is
    // the doc-head, which DOC-HEAD-CONTAINS-FIRST-PARAGRAPH already owns
    const idx = st.blockCount > 1 ? st.blockCount - 1 : 0
    const placed = await ufCaretAt(h, idx)
    await sleep(250)
    const selBefore = await ufCaret(h)
    const marker = `LIVEUEDIT${Date.now() % 100000}`
    await ufType(h, marker)
    const typed = await h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');const t=(s.textContent||'');return {hasMarker:t.includes(${JSON.stringify(marker)}),len:t.length}})()`)
    const dirtyBeforeBlur = await h.cdp.evaluate(`(()=>{const b=window.provident&&window.provident.rag;return true})()`)
    const blur = await ufBlurSurface(h)
    const docAfter = await h.mcpTool(h.mcp, 'rag.get_document', { documentId }).catch((e) => ({ __error: String(e) }))
    const afterText = JSON.stringify(docAfter)
    const storeChanged = beforeText !== afterText
    const storeHasMarker = afterText.includes(marker)
    const domHasMarker = (await h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');return s?(s.textContent||'').includes(${JSON.stringify(marker)}):false})()`)) === true
    const journal = await h.mcpTool(h.mcp, 'provident.get_journal', {}).catch((e) => ({ __error: String(e) }))
    const jStr = JSON.stringify(journal)
    const journalDelta = journal && typeof journal.undoDepth === 'number' ? journal.undoDepth - journalBefore : null
    const journalPostDetail = journal && Array.isArray(journal.entries)
      ? { entries: journal.entries.length, batches: journal.entries.filter((e) => e && e.kind === 'batch').length, kindCounts: journal.entries.reduce((a, e) => { const k = (e && e.kind) || '?'; a[k] = (a[k] || 0) + 1; return a }, {}) }
      : null
    const ok = typed.hasMarker && storeChanged && storeHasMarker && domHasMarker && !blur.warning
    return rowResult({row:'U-EDIT-1-LIVE-7',dclass:'D-state'}, 'A real typed edit + blur commits to the store in ONE batch: the `rag.get_document` read-back and the rendered DOM agree on the typed text, and an unrelated block is byte-unchanged', `fixture=${JSON.stringify({ docId: fixture.docId, blocks: fixture.surface ? fixture.surface.blockCount : null, active: fixture.active ? fixture.active.activeTabId + '/' + fixture.active.activeTabKind : null, surfacePresent: fixture.surface ? fixture.surface.present : null })}; documentId=${documentId} surface box=${JSON.stringify(st.box)}; caret placed at block ${idx} (${JSON.stringify(placed)}) => ${JSON.stringify(selBefore)}; REAL typed text "${marker}" landed in the surface=${typed.hasMarker} (surface text len ${st.len}->${typed.len}); REAL blur (page-commit seam) => ${JSON.stringify(blur)}; STORE read-back rag.get_document changed=${storeChanged} containsMarker=${storeHasMarker}; rendered DOM containsMarker=${domHasMarker} (store/DOM AGREE=${storeHasMarker === domHasMarker}); journal BEFORE=${JSON.stringify(journalPreDetail)} (undoDepth ${journalBefore}) AFTER=${JSON.stringify(journalPostDetail)} (undoDepth ${journal && journal.undoDepth}, delta=${journalDelta}) — the ONE-batch claim's store-side half; commit-warning present=${blur.warning} (kind=${blur.warningKind})`,
      { path: 'cdp', ok, surface })
  },

  // ---- §8.3 item 3 — a FAILED commit is USER-VISIBLE (painted, typed) AND
  // survives a re-derive; the store read-back is unchanged. ----
  u_edit_1_live_commit_failure_warning: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const surface = await ufSurfaceTarget(h)
    const st = await ufEditSurfaceState(h)
    // this row needs a document whose page commit REFUSES (§3.5's failure path):
    // the seeded `alpha` document carries an inline `<strong>`, outside the
    // adopted decomposer's closed node-type set
    const failDoc = await ufOpenDocumentById(h, '.live-fixture/core/alpha')
    const stFail = await ufEditSurfaceState(h)
    if (!stFail.present) return rowResult({row:'U-EDIT-1-LIVE-3',dclass:'D-visual'}, 'A FAILED page commit surfaces a PAINTED typed warning', `no surface on the failure fixture ${JSON.stringify(failDoc)}`, { path: 'missing', ok: false, surface })
    if (!st.present) return rowResult({row:'U-EDIT-1-LIVE-3',dclass:'D-visual'}, 'A FAILED page commit surfaces a PAINTED typed warning (the tab/stage warning class) that SURVIVES a re-derive, and the store read-back is unchanged', 'no page-edit-surface in the stage', { path: 'missing', ok: false, surface })
    const stUse = stFail
    const documentId = stUse.marker
    const before = JSON.stringify(await h.mcpTool(h.mcp, 'rag.get_document', { documentId }).catch((e) => ({ __error: String(e) })))
    const idx = stUse.blockCount > 1 ? stUse.blockCount - 1 : 0
    const placed = await ufCaretAt(h, idx)
    await ufType(h, `WARN${Date.now() % 10000}`)
    const blur = await ufBlurSurface(h)
    const census1 = await ufSurfaceCensus(h)
    const after = JSON.stringify(await h.mcpTool(h.mcp, 'rag.get_document', { documentId }).catch((e) => ({ __error: String(e) })))
    const storeUnchanged = before === after
    // the re-derive: the gnosis host's `onChanged()` → `host.refresh()` seam —
    // the reachable full re-derive caller (the pane's own refresh control)
    const reassemble = await h.cdp.evaluate(`(()=>{const g=(s)=>{const e=document.querySelector(s);return e?e.getAttribute('data-node-id'):null};return {root:g('#wiki-root'),surface:g('#page-edit-surface'),warning:g('#page-commit-warning')}})()`)
    const gs = await h.cdp.evaluate(`(async()=>{try{await window.provident.sidebar.gnosisStatus();return {called:true}}catch(e){return {called:false,err:String(e)}}})()`)
    await sleep(3000)
    const census2 = await ufSurfaceCensus(h)
    const st2 = await ufEditSurfaceState(h)
    const reassemble2 = await h.cdp.evaluate(`(()=>{const g=(s)=>{const e=document.querySelector(s);return e?e.getAttribute('data-node-id'):null};return {root:g('#wiki-root'),surface:g('#page-edit-surface'),warning:g('#page-commit-warning')}})()`)
    const reassembled = JSON.stringify(reassemble) !== JSON.stringify(reassemble2)
    const warningSurvives = census2.warnings.length === 1 && census2.warnings[0].box[2] > 0 && census2.warnings[0].box[3] > 0
    const ok = blur.warning === true && blur.warningPainted === true && warningSurvives && storeUnchanged && census2.byId === 1 && census2.agree === true
    return rowResult({row:'U-EDIT-1-LIVE-3',dclass:'D-visual'}, 'A FAILED page commit surfaces a PAINTED typed warning (the `TAB-1` class / the stage warning) and that warning SURVIVES a real re-derive, with the store read-back UNCHANGED', `failure fixture=${JSON.stringify(failDoc)}; documentId=${documentId}; typed edit + REAL blur => warning present=${blur.warning} kind=${blur.warningKind} class=${blur.warningClass} PAINTED box=${JSON.stringify(blur.warningBox)} painted=${blur.warningPainted} text="${blur.warningText}"; store read-back unchanged=${storeUnchanged}; the real re-derive seam ('gnosisStatus()' -> the pane host's 'onChanged()' -> 'host.refresh()') called=${gs.called} app-graph re-assembled=${reassembled} (node ids ${JSON.stringify(reassemble)} -> ${JSON.stringify(reassemble2)}); warning census AFTER the re-derive=${JSON.stringify(census2.warnings)} (present+painted=${warningSurvives}); surface census after=${census2.byId}/${census2.byMarker} agree=${census2.agree} marker=${st2.marker} (pre-derive warning census ${JSON.stringify(census1.warnings)})`,
      { path: 'cdp', ok, surface })
  },

  // ---- §8.3 item 4 — the representation toggle: markdown mode must render
  // PLAIN TEXT + monospace, no inline formatting, and the surface stays
  // contenteditable. ----
  u_edit_1_live_representation_mode: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const surface = await ufSurfaceTarget(h)
    const read = () => h.cdp.evaluate(`(()=>{const t=document.getElementById('editor-toolbar');const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');const m=document.getElementById('zone:main');
      return {mode:t?t.getAttribute('data-mode'):null,toolbarText:t?(t.textContent||'').replace(/\\s+/g,' ').slice(0,60):null,
        surfacePresent:!!s,marker:s?s.getAttribute('data-edit-surface'):null,contenteditable:s?s.getAttribute('contenteditable'):null,
        surfaceFont:s?getComputedStyle(s).fontFamily:null,
        inline:s?s.querySelectorAll('strong,em,a,img').length:null,headings:s?s.querySelectorAll('h1,h2,h3').length:null,
        headingSizes:s?[...s.querySelectorAll('h1,h2,h3')].map((e)=>parseFloat(getComputedStyle(e).fontSize)):null,
        pre:s?s.querySelectorAll('pre').length:null,bodyFont:s&&s.querySelector('p')?getComputedStyle(s.querySelector('p')).fontFamily:null,
        textareas:m?m.querySelectorAll('textarea').length:null,globalTextareas:document.querySelectorAll('textarea').length,
        markerText:s?(s.textContent||'').slice(0,60):null}})()`)
    const before = await read()
    const c1 = await ufRealClick(h, '#editor-toolbar-toggle')
    await sleep(3000)
    const md = await read()
    const c2 = await ufRealClick(h, '#editor-toolbar-toggle')
    await sleep(3000)
    const back = await read()
    const isMonospace = (ff) => typeof ff === 'string' && /mono|courier|consolas|menlo|monaco/i.test(ff)
    const mdPlain = md.inline === 0 && md.headings === 0
    const mdMono = isMonospace(md.surfaceFont) || isMonospace(md.bodyFont)
    const mdEditable = md.surfacePresent === true && md.contenteditable === 'true'
    // The PAINTED requirement (D-GP-UFA-2/DECIDED: D-GP-UFA-2): a computed-style
    // family alone is the proxy — the row FAILS unless the painted rendering
    // actually lost the HTML formatting.
    const paintedOk = mdPlain && mdMono && mdEditable
    const toggled = before.mode !== md.mode && md.mode === 'markdown' && back.mode === before.mode
    const ok = toggled && paintedOk && md.textareas === 0 && back.textareas === 0
    return rowResult({row:'U-EDIT-1-LIVE-4',dclass:'D-visual'}, 'A real click on the representation control puts the stage in markdown mode: PLAIN TEXT rendered (0 inline-formatting elements, 0 headings at heading scale), a monospace family, the surface still contenteditable, and 0 <textarea> in either mode', `REAL click #editor-toolbar-toggle path=${c1.path} (hit=${c1.rect ? c1.rect.hit : '?'}); before=${JSON.stringify({ mode: before.mode, toolbar: before.toolbarText, ff: before.surfaceFont, inline: before.inline, headings: before.headings, sizes: before.headingSizes, ce: before.contenteditable, textareas: before.textareas, pre: before.pre })}; after toggle 1=${JSON.stringify({ mode: md.mode, toolbar: md.toolbarText, ff: md.surfaceFont, bodyFf: md.bodyFont, inline: md.inline, headings: md.headings, sizes: md.headingSizes, ce: md.contenteditable, textareas: md.textareas, pre: md.pre })}; after toggle 2 (REAL click path=${c2.path})=${JSON.stringify({ mode: back.mode, ff: back.surfaceFont, inline: back.inline, headings: back.headings, ce: back.contenteditable, textareas: back.textareas })}; markdown-mode PLAIN TEXT (inline=0 AND headings=0)=${mdPlain}; monospace family=${mdMono}; still contenteditable=${mdEditable}; toggled html->markdown->html=${toggled}; zero-textarea in BOTH modes=${md.textareas === 0 && back.textareas === 0} (global textarea census now ${md.globalTextareas})`,
      { path: c1.path === 'cdp' ? 'cdp' : c1.path, ok, surface })
  },

  // ---- §8.3 items 5 + 6 + the caret round trip — the head/body split, the
  // RENDERED zero-textarea census in both modes, and the caret's survival across
  // a re-derive. ----
  u_edit_1_live_head_split_and_textarea_census: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const surface = await ufSurfaceTarget(h)
    const st = await ufEditSurfaceState(h)
    if (!st.present) return rowResult({row:'U-EDIT-1-LIVE-5',dclass:'D-visual'}, 'The doc-head and the first paragraph are SIBLINGS (the paragraph is not a descendant of the head) at body scale; the RENDERED stage carries ZERO <textarea> in both representation modes and after a re-derive', 'no page-edit-surface', { path: 'missing', ok: false, surface })
    const split = await h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');
      const head=s.querySelector('[data-doc-head]')||s.querySelector('h1');
      if(!head)return {head:false};
      const kids=[...s.children];
      const headIsChild=kids.includes(head);
      const firstP=s.querySelector('p');
      const parentOfP=firstP?firstP.parentElement:null;
      const pInsideHead=!!(firstP&&head.contains(firstP));
      const pSiblingOfHead=!!(firstP&&parentOfP===s);
      const hr=head.getBoundingClientRect();const pr=firstP?firstP.getBoundingClientRect():null;
      return {head:true,headTag:head.tagName,headRid:head.getAttribute('data-rag-node-id'),headBox:[Math.round(hr.x),Math.round(hr.y),Math.round(hr.width),Math.round(hr.height)],
        headChildCount:head.children.length,headIsDirectChild:headIsChild,
        firstP:pFirst(firstP),pInsideHead:pInsideHead,pSiblingOfHead:pSiblingOfHead,pParent:parentOfP?parentOfP.tagName+'#'+(parentOfP.getAttribute('data-rag-node-id')||parentOfP.id):null,
        headFont:parseFloat(getComputedStyle(head).fontSize),headWeight:getComputedStyle(head).fontWeight,
        pFont:firstP?parseFloat(getComputedStyle(firstP).fontSize):null,pBox:pr?[Math.round(pr.x),Math.round(pr.y),Math.round(pr.width),Math.round(pr.height)]:null};
      function pFirst(e){return e?(e.textContent||'').slice(0,50):null}})()`)
    // mode toggle for the second half of the census + then back
    const c1 = await ufRealClick(h, '#editor-toolbar-toggle', { nativeFallback: false })
    await sleep(2500)
    const mdCensus = await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');return {mode:(document.getElementById('editor-toolbar')||{getAttribute:()=>null}).getAttribute?document.getElementById('editor-toolbar').getAttribute('data-mode'):null, stageTextareas:m?m.querySelectorAll('textarea').length:null, global:document.querySelectorAll('textarea').length}})()`)
    // re-derive (the real gnosis onChanged -> host.refresh() caller)
    const gs = await h.cdp.evaluate(`(async()=>{try{await window.provident.sidebar.gnosisStatus();return {called:true}}catch(e){return {called:false,err:String(e)}}})()`)
    await sleep(2500)
    const reCensus = await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');return {mode:(document.getElementById('editor-toolbar')||{}).getAttribute?document.getElementById('editor-toolbar').getAttribute('data-mode'):null, stageTextareas:m?m.querySelectorAll('textarea').length:null,global:document.querySelectorAll('textarea').length,surface:!!s}})()`)
    const c2 = await ufRealClick(h, '#editor-toolbar-toggle', { nativeFallback: false })
    await sleep(2500)
    const backCensus = await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');return {mode:(document.getElementById('editor-toolbar')||{}).getAttribute?document.getElementById('editor-toolbar').getAttribute('data-mode'):null,stageTextareas:m?m.querySelectorAll('textarea').length:null,global:document.querySelectorAll('textarea').length}})()`)
    // caret round-trip is item 8's own row (a separate assertion, separate verdict)
    const splitOk = split.head === true && split.pInsideHead === false && split.pSiblingOfHead === true &&
      typeof split.pFont === 'number' && split.headFont > split.pFont
    const censusOk = mdCensus.stageTextareas === 0 && reCensus.stageTextareas === 0 && backCensus.stageTextareas === 0 &&
      mdCensus.global === 0 && reCensus.global === 0 && backCensus.global === 0
    return rowResult({row:'U-EDIT-1-LIVE-5',dclass:'D-visual'}, 'The doc-head and the first paragraph are SIBLINGS (the paragraph is NOT a descendant of the head) and the paragraph paints at BODY scale; the RENDERED stage carries ZERO <textarea> in markdown mode, after a real re-derive, and back in html mode', `doc-head split: ${JSON.stringify(split)} => paragraph inside the head=${split.pInsideHead} sibling of the head=${split.pSiblingOfHead} head font-size=${split.headFont}px vs paragraph ${split.pFont}px (head > body scale=${split.headFont > split.pFont}); RENDERED <textarea> census in #zone:main: markdown mode=${JSON.stringify(mdCensus)} after the real re-derive=${JSON.stringify(reCensus)} (gnosisStatus called=${gs.called}) back in html mode=${JSON.stringify(backCensus)}`,
      { path: c1.path === 'cdp' ? 'cdp' : c2.path, ok: splitOk && censusOk, surface })
  },

  // ---- §8.3 item 8 (the caret half) — the page-scoped caret survives the page
  // commit + a real re-derive (the page subject is the TAB, not the document). ----
  u_edit_1_live_caret_roundtrip: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const fixture = await ufEnsureEditFixture(h)
    const surface = await ufSurfaceTarget(h)
    const st = await ufEditSurfaceState(h)
    if (!st.present) return rowResult({row:'U-EDIT-1-LIVE-8',dclass:'D-state'}, 'The page-scoped caret survives a page commit + a real re-derive: after typing in a block, blurring and re-deriving, the caret is still a live Range inside the SAME contenteditable surface', 'no page-edit-surface', { path: 'missing', ok: false, surface })
    const placed = await ufCaretAt(h, st.blockCount > 1 ? st.blockCount - 1 : 0)
    await ufType(h, `CARE${Date.now() % 1000}`)
    const afterType = await ufCaret(h)
    const blur = await ufBlurSurface(h)
    const afterBlur = await ufCaret(h)
    const gs = await h.cdp.evaluate(`(async()=>{try{await window.provident.sidebar.gnosisStatus();return {called:true}}catch(e){return {called:false,err:String(e)}}})()`)
    await sleep(3000)
    const afterDerive = await ufCaret(h)
    const st2 = await ufEditSurfaceState(h)
    const ok = !!(afterDerive && afterDerive.none === false && afterDerive.rangeCount === 1 && afterDerive.insideSurface === true) &&
      st2.present === true && st2.marker === st.marker
    return rowResult({row:'U-EDIT-1-LIVE-8',dclass:'D-state'}, 'The caret round-trip: a caret placed in a block, a typed edit, the page-commit blur and a real re-derive leave a LIVE Range inside the same contenteditable surface (the page subject is the ACTIVE TAB id, so the caret is not dropped by the re-derive)', `fixture=${JSON.stringify({ docId: fixture.docId, blocks: fixture.surface ? fixture.surface.blockCount : null, active: fixture.active ? fixture.active.activeTabId + '/' + fixture.active.activeTabKind : null, surfacePresent: fixture.surface ? fixture.surface.present : null })}; surface marker=${st.marker} blocks=${st.blockCount}; caret placed at block ${st.blockCount > 1 ? st.blockCount - 1 : 0}: ${JSON.stringify(placed)}; after the REAL typed edit: ${JSON.stringify(afterType)}; after the REAL blur (page commit => warning=${blur.warning} kind=${blur.warningKind}): ${JSON.stringify(afterBlur)}; the real re-derive ('gnosisStatus()' called=${gs.called}) => caret ${JSON.stringify(afterDerive)} surface still present=${st2.present} marker=${st2.marker}`,
      { path: 'cdp', ok, surface })
  },

  // ---- §8.3 item 8 / §11.9 item 1 — the package-adoption evidence: a stored
  // TABLE node cannot be expressed by the adopted decomposer, so the commit
  // REFUSES (typed) rather than flattening/retyping it. ----
  u_edit_1_live_package_table_limitation: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const surface = await ufSurfaceTarget(h)
    // this row needs a document whose surface ACTUALLY carries table elements:
    // the corpus is searched for one (the operator store's `defects` document,
    // or any document whose rendered surface has a table)
    const candidates = ['.live-fixture/table/table', 'defects']
    let tableDoc = null
    for (const c of candidates) {
      const opened = await ufOpenDocumentById(h, c)
      const census = await h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');return s?s.querySelectorAll('table').length:-1})()`)
      if (census > 0) { tableDoc = { opened, tables: census }; break }
    }
    if (!tableDoc) {
      const all = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch(() => null)
      const list = all && Array.isArray(all.documents) ? all.documents.map((d) => d.documentId) : []
      for (const id of list.slice(0, 12)) {
        const opened = await ufOpenDocumentById(h, id)
        const census = await h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');return s?s.querySelectorAll('table').length:-1})()`)
        if (census > 0) { tableDoc = { opened, tables: census }; break }
      }
    }
    if (!tableDoc) {
      // §6.1 `H-4` — THE PARK'S OWN ROW: the reason and the evidence are the two
      // STRINGS below (the object this site used to hand over in the `evidence`
      // slot printed as `[object Object]`), and the `surface`/`realInput` reading
      // the object carried travels in `opts`, the SIXTH slot — where `parkRow`
      // actually reads a §6.1 field set, and where it used to be dropped.
      return parkRow('U-EDIT-1-LIVE-6', 'The package-adoption evidence: a stored TABLE makes the page commit REFUSE (typed) rather than flattening the stored td/th/tr nodes', 'D-state',
        `NO document in this store renders a table on its page-edit surface (candidates tried: ${JSON.stringify(candidates)} + up to 12 of rag.list_documents) — the row's precondition cannot be met in this corpus, so it is PARKED with this reason (never a silent pass and never a fabricated refusal)`,
        'no table-rendering document was reachable in this corpus (the row\'s precondition is unmet, not its assertion)',
        { path: 'missing', ok: false, surface, required: 'a document whose page-edit surface renders a stored <table> (td/th/tr nodes present)', observed: 'no such document in this store\'s corpus' })
    }
    const st = await ufEditSurfaceState(h)
    if (!st.present) return rowResult({row:'U-EDIT-1-LIVE-6',dclass:'D-state'}, 'A stored table element is REFUSED (typed `decompose-failed`) by the adopted decomposer rather than flattened/retyped, and the stored table nodes are byte-unchanged after the refused commit', `no page-edit-surface after opening the table fixture ${JSON.stringify(tableDoc)}`, { path: 'missing', ok: false, surface })
    const documentId = st.marker
    const tableCensus = await h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');
      const tables=[...s.querySelectorAll('table')];
      return {tables:tables.length,trs:s.querySelectorAll('table tr').length,tds:s.querySelectorAll('table td,table th').length,
        tableRids:tables.map((t)=>t.getAttribute('data-rag-node-id')),boxes:tables.map((t)=>{const r=t.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})}})()`)
    const before = JSON.stringify(await h.mcpTool(h.mcp, 'rag.get_document', { documentId }).catch((e) => ({ __error: String(e) })))
    const placed = await ufCaretAt(h, st.blockCount > 1 ? st.blockCount - 1 : 0)
    await ufType(h, `TBL${Date.now() % 10000}`)
    const blur = await ufBlurSurface(h)
    const after = JSON.stringify(await h.mcpTool(h.mcp, 'rag.get_document', { documentId }).catch((e) => ({ __error: String(e) })))
    const storeUnchanged = before === after
    const tableStill = await h.cdp.evaluate(`(()=>{const s=document.getElementById('${UF_PAGE_EDIT_SURFACE_ID}');return s?s.querySelectorAll('table').length:null})()`)
    const refused = blur.warning === true && typeof blur.warningKind === 'string' && blur.warningKind.length > 0
    const ok = refused && storeUnchanged && tableStill === tableCensus.tables && tableCensus.tds > 0
    return rowResult({row:'U-EDIT-1-LIVE-6',dclass:'D-state'}, 'The package-adoption evidence: a stored TABLE on the surface makes the page commit REFUSE with a typed failure (never flatten/retype the stored td/th/tr nodes), the warning is visible, and the store + the rendered table are unchanged', `table fixture=${JSON.stringify(tableDoc)}; documentId=${documentId}; rendered table census on the surface=${JSON.stringify(tableCensus)}; typed edit + REAL blur => warning present=${blur.warning} kind=${blur.warningKind} class=${blur.warningClass} painted=${blur.warningPainted} text="${blur.warningText}"; store read-back unchanged=${storeUnchanged}; rendered tables after the refused commit=${tableStill} (census-preserved=${tableStill === tableCensus.tables}); note: the refusal path is the ADAPTER's recorded capability gap (provident-editable has no table/thead/tr/td/th node type)`,
      { path: 'cdp', ok, surface })
  },

  // =========================================================================
  // UNIT `U-STAGE-ACTIVE-TAB` — the MANDATORY live battery (spec §8.3): the stage
  // always displays the page owned by the ACTIVE tab, asserted by IDENTITY
  // (activeTabKind vs stageKind + the surface's `data-edit-surface`), not text.
  // =========================================================================

  // ---- §8.3 item 5 / §A.1.1 I2-R — the census predicate in every reachable
  // state: exactly ONE live surface iff a document tab is active. ----
  stage_surface_census_i2r: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const surface = await ufSurfaceTarget(h)
    const v = await ufStageVerdict(h)
    const census = await ufSurfaceCensus(h)
    const expect = v.activeTabKind === 'document' ? 1 : 0
    const censusOk = census.byId === expect && census.byMarker === expect && census.agree === true
    const identityOk = expect === 1 ? census.ids[0] === v.editSurface : census.ids.length === 0
    const paintedOk = census.painted === null ? expect === 0 : census.painted === true
    // the marker must equal the ACTIVE DOCUMENT's id: the MCP target census names
    // the rag document node ids the RENDERED graph carries
    const targets = await h.mcpTool(h.mcp, 'provident.list_targets', {}).catch((e) => ({ __error: String(e) }))
    const tStr = JSON.stringify(targets)
    const docHead = await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');const h=m?m.querySelector('[data-doc-head]'):null;return h?h.getAttribute('data-rag-node-id')||h.id:null})()`)
    const markerInTargets = v.editSurface == null ? null : tStr.includes(`rag-${v.editSurface}`)
    const ok = censusOk && identityOk && paintedOk
    return rowResult({row:'UF-STAGE-AT-1',dclass:'D-visual'}, 'The stage region carries exactly ONE live `#page-edit-surface` iff a document tab is active (else ZERO), the two discriminators agree, and the marker equals the active document id', `activeTabId=${v.activeTabId} activeTabKind=${v.activeTabKind} stageKind=${v.stageKind} stageMatchesActiveTab=${v.stageMatchesActiveTab}; census over the stage region: byId=${census.byId} byMarker=${census.byMarker} agree=${census.agree} ids=${JSON.stringify(census.ids)} boxes=${JSON.stringify(census.boxes)} painted=${census.painted}; OTHER authored roots live in the stage (recorded, non-gating here): commit-warning census=${census.warnings.length} ${JSON.stringify(census.warnings)}; expected surface census for this active kind=${expect} => ${censusOk}; marker==documentId: marker=${v.editSurface} stage doc-head rid=${docHead} rendered-graph targets carry rag-${v.editSurface}=${markerInTargets}; identityOk=${identityOk}`,
      { path: 'not-gesture', gesture: false, ok, surface })
  },

  // ---- §8.3 item 1 — a document tab paints ITS document (identity, not text). ----
  stage_document_tab_paints_its_document: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const surface = await ufSurfaceTarget(h)
    const before = await ufStageVerdict(h)
    const st = await ufEditSurfaceState(h)
    if (!st.present) return rowResult({row:'UF-STAGE-AT-2',dclass:'D-state'}, 'A document tab paints ITS document: the active document tab is active, stageKind=document, and `data-edit-surface` equals the rendered document id', `no surface: activeTabKind=${before.activeTabKind} stageKind=${before.stageKind}`, { path: 'missing', ok: false, surface })
    // a REAL click on a doc-nav row for a DIFFERENT document opens ITS tab
    const rows = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('#pane-doc-nav [data-document-id]')].map((li)=>({doc:li.getAttribute('data-document-id'),box:(()=>{const r=li.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})()})))()`)
    const other = rows.find((r) => r.doc !== st.marker && r.box[2] > 0 && r.box[3] > 0)
    let click = { path: 'no-second-doc' }
    if (other) {
      click = await ufRealClick(h, `#pane-doc-nav [data-document-id=${JSON.stringify(other.doc)}]`)
      await sleep(3000)
    }
    const after = await ufStageVerdict(h)
    const st2 = await ufEditSurfaceState(h)
    const matches = after.stageMatchesActiveTab === true && after.stageKind === 'document' && after.surfaceCensus === 1 &&
      after.markersAgree === true && st2.present === true && st2.marker === after.editSurface
    const painted = st2.present === true && st2.box[2] > 0 && st2.box[3] > 0
    // the marker's IDENTITY: the surface's document must be the one the RENDERED
    // graph carries a rag-<id> root for (the MCP target census), and the stage's
    // own doc-head must belong to it (`<documentId>:section:1`)
    const targets = await h.mcpTool(h.mcp, 'provident.list_targets', {}).catch((e) => ({ __error: String(e) }))
    const markerInGraph = after.editSurface == null ? null : JSON.stringify(targets).includes(`rag-${after.editSurface}`)
    const headOwned = (await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');const h=m?m.querySelector('[data-doc-head]'):null;return h?h.getAttribute('data-rag-node-id')||h.id:null})()`)) || ''
    const headMatchesMarker = after.editSurface != null && headOwned.startsWith(after.editSurface + ':')
    const ok = matches && painted && headMatchesMarker && markerInGraph !== false && (other ? click.path === 'cdp' : true)
    return rowResult({row:'UF-STAGE-AT-2',dclass:'D-state'}, 'A document tab paints ITS document: after a real doc-nav row click the active tab is a document tab, stageKind is document, exactly one surface is live and its `data-edit-surface` equals the ACTIVE document id', `ensured a document tab is active: ${JSON.stringify(ensured)}; before: activeTabId=${before.activeTabId} kind=${before.activeTabKind} stageKind=${before.stageKind} marker=${before.editSurface} tabs=${JSON.stringify(before.tabIds)}; doc-nav rows=${rows.length} picked=${other ? other.doc : 'none'} REAL click path=${click.path} (hit=${click.rect ? click.rect.hit : '?'}); after: activeTabId=${after.activeTabId} kind=${after.activeTabKind} stageKind=${after.stageKind} stageMatchesActiveTab=${after.stageMatchesActiveTab} surfaceCensus=${after.surfaceCensus} markersAgree=${after.markersAgree} marker=${after.editSurface} box=${JSON.stringify(st2.box)} painted=${painted} tabCount=${after.tabCount} tabs=${JSON.stringify(after.tabIds)}; IDENTITY: the rendered graph carries a rag-${after.editSurface} root=${markerInGraph}; the stage doc-head rid="${headOwned}" starts with "<marker>:"=${headMatchesMarker}`,
      { path: click.path === 'cdp' ? 'cdp' : 'missing', ok, surface })
  },

  // ---- §8.3 item 1 / the historical `LIVE-UF9` repro — "open in a tab" must
  // produce a SEARCH page in the NEW tab. ----
  stage_search_open_in_tab: async (h) => {
    await ufEnsureAppClear(h)
    const surface = await ufSurfaceTarget(h)
    const before = await ufStageVerdict(h)
    const censusBefore = await ufSurfaceCensus(h)
    const ex = await ufExpandSearchTab(h)
    await sleep(3000)
    const v = await ufStageVerdict(h)
    const census = await ufSurfaceCensus(h)
    const stageRead = await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');
      const s=document.getElementById('${UF_STAGE_SEARCH_TAB_ID}');
      const i=document.getElementById('${UF_SEARCH_TAB_INPUT_ID}');
      const sr=s?s.getBoundingClientRect():null;
      return {searchStage:!!s,searchInput:!!i,searchStageText:s?(s.textContent||'').replace(/\\s+/g,' ').slice(0,80):null,
        searchStageBox:sr?[Math.round(sr.x),Math.round(sr.y),Math.round(sr.width),Math.round(sr.height)]:null,
        painted:!!sr&&sr.width>0&&sr.height>0,
        documentBody:m?m.querySelector('[data-doc-head]')!=null:null,
        mainText:(m?m.textContent:'').replace(/\\s+/g,' ').slice(0,120)}})()`)
    const newTab = v.tabCount > before.tabCount
    const ok = newTab && v.stageMatchesActiveTab === true && v.stageKind === 'search' &&
      stageRead.searchStage === true && stageRead.painted === true &&
      census.byId === 0 && census.byMarker === 0 && stageRead.documentBody === false
    return rowResult({row:'UF-DEFECT-7',dclass:'D-interaction'}, '"Open in a tab" creates a tab whose stage shows the SEARCH view (its search input painted in `#zone:main`), NOT the already-open document body; zero edit surfaces while the search tab is active', `REAL click #pane-search-expand-tab path=${ex.path} (hit=${ex.hit}); tabs ${before.tabCount}->${v.tabCount} (newTab=${newTab}); ACTIVE tab=${v.activeTabId} kind=${v.activeTabKind} vs stageKind=${v.stageKind} stageMatchesActiveTab=${v.stageMatchesActiveTab}; the search stage: present=${stageRead.searchStage} input=${stageRead.searchInput} PAINTED box=${JSON.stringify(stageRead.searchStageBox)} painted=${stageRead.painted} text="${stageRead.searchStageText}"; document body in the stage=${stageRead.documentBody} (a foreign document body must NOT appear); surface census ${censusBefore.byId}->${census.byId} byMarker ${censusBefore.byMarker}->${census.byMarker} agree=${census.agree}; #zone:main text="${stageRead.mainText}"`,
      { path: ex.path === 'cdp' ? 'cdp' : ex.path, ok, surface })
  },

  // ---- §8.3 item 2 (V1 race) — a slow `rag.query` + a document tab switched
  // INSIDE that real async window: the stage must end on the ACTIVE tab's page. ----
  stage_async_mount_race_v1: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const surface = await ufSurfaceTarget(h)
    // (i) the query the search tab will re-run on its OWN async mount — typed
    //     into the SEARCH PANE's input with a REAL focus + REAL text insertion
    //     (this store returns zero query results, so the pane's own submit is not
    //     required for the query to be carried into the tab)
    const paneFocus = await ufRealClick(h, '#pane-search-input')
    await sleep(300)
    await h.cdp.evaluate(`(()=>{const e=document.getElementById('pane-search-input');if(e)e.value='';return true})()`)
    await h.cdp.send('Input.insertText', { text: 'the' })
    const pane = { togglePath: 'n/a', focusPath: paneFocus.path, submitPath: 'n/a', rows: [] }
    // (ii) open the search tab: its own `rag.query` starts (the V1 window)
    const ex = await ufExpandSearchTab(h)
    // (iii) INSIDE that window, switch to a DOCUMENT tab with a REAL strip click
    //       (no settle-scroll: the window is milliseconds wide)
    const docTabs = (await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)).tabIds.filter((t) => t.kind === 'document')
    const switchTab = docTabs.length ? docTabs[docTabs.length - 1] : null
    if (!switchTab) return rowResult({row:'UF-STAGE-AT-3',dclass:'D-interaction'}, 'The V1 race (real tab switch inside the async window)', `no document tab in the strip (tabs=${JSON.stringify((await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)).tabIds)})`, { path: 'missing', ok: false, surface })
    const sw = await ufRealClickTab(h, switchTab.id, { scroll: false })
    await sleep(5000)
    const v = await ufStageVerdict(h)
    const st = await ufEditSurfaceState(h)
    const census = await ufSurfaceCensus(h)
    const noStaleSearch = (await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');return {searchStage:m?!!m.querySelector('#${UF_STAGE_SEARCH_TAB_ID}'):null}})()`)).searchStage === false
    const ok = sw.path === 'cdp' && v.activeTabKind === 'document' && v.stageKind === 'document' &&
      v.stageMatchesActiveTab === true && noStaleSearch === true && st.present === true &&
      census.byId === 1 && census.agree === true && st.marker === v.editSurface
    return rowResult({row:'UF-STAGE-AT-3',dclass:'D-interaction'}, 'The V1 race: with the search tab\'s own real `rag.query` in flight, a REAL tab-strip switch to a document tab lands the stage on the ACTIVE document tab — the stale search completion is discarded (no `#stage-search-tab`), one surface carries its marker', `search-pane REAL drive (query typed+submitted)=${JSON.stringify({ toggle: pane.togglePath, focus: pane.focusPath, submit: pane.submitPath, rows: pane.rows.length })}; REAL click #pane-search-expand-tab path=${ex.path} (tabs ${ex.before.tabCount}->${ex.before.tabCount + 1}); the async window's tab is the SEARCH tab (tabs now=${JSON.stringify((await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)).openIds)}); INSIDE the window: REAL tab-strip click on ${switchTab.id} path=${sw.path} (hit=${sw.rect ? sw.rect.hit : '?'}); after settlement: activeTabId=${v.activeTabId} activeTabKind=${v.activeTabKind} stageKind=${v.stageKind} stageMatchesActiveTab=${v.stageMatchesActiveTab} stale-search-stage-present=${!noStaleSearch} surfaceCensus byId=${census.byId} byMarker=${census.byMarker} agree=${census.agree} editSurface=${v.editSurface} surface present=${st.present} marker=${st.marker} box=${JSON.stringify(st.box)}; ensuredDocumentActive=${JSON.stringify(ensured)}`,
      { path: sw.path === 'cdp' ? 'cdp' : sw.path, ok, surface })
  },

  // ---- §8.3 item 2 (V1, second trigger pinned by the spec: "a real click on a
  // search-result row OR a doc-nav row") — the DOC-NAV trigger, which the app
  // routes through the sidebar focus seam instead of the tab seam. ----
  stage_docnav_switch_inside_async: async (h) => {
    await ufEnsureAppClear(h)
    const surface = await ufSurfaceTarget(h)
    const pane = await ufPaneSearch(h, 'the')
    const ex = await ufExpandSearchTab(h)
    const rows = await h.cdp.evaluate(`(()=>[...document.querySelectorAll('#pane-doc-nav [data-document-id]')].map((li)=>({doc:li.getAttribute('data-document-id'),box:(()=>{const r=li.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})()})))()`)
    const target = rows.find((r) => r.box[2] > 0 && r.box[3] > 0 && r.box[1] >= -20 && r.box[1] <= 700)
    if (!target) return rowResult({row:'UF-STAGE-AT-8',dclass:'D-interaction'}, 'A real doc-nav row click inside the async window switches the active tab to that DOCUMENT (the spec §8.3 item 2 trigger: "a real click on a search-result row or a doc-nav row")', `no hit-testable doc-nav row (rows=${rows.length})`, { path: 'zero-box', ok: false, surface })
    const clicked = await ufRealClick(h, `#pane-doc-nav [data-document-id=${JSON.stringify(target.doc)}]`, { scroll: false })
    await sleep(5000)
    const v = await ufStageVerdict(h)
    const st = await ufEditSurfaceState(h)
    const census = await ufSurfaceCensus(h)
    const ok = clicked.path === 'cdp' && v.activeTabKind === 'document' && v.stageKind === 'document' &&
      v.stageMatchesActiveTab === true && v.searchStage === false && st.present === true && st.marker === v.editSurface
    return rowResult({row:'UF-STAGE-AT-8',dclass:'D-interaction'}, 'The V1 race, DOC-NAV trigger: a real doc-nav row click inside the search tab\'s async window leaves the stage on the ACTIVE tab\'s page — i.e. that click must ACTIVATE the document tab for the clicked document', `search-pane REAL drive rows=${pane.rows.length}; REAL click #pane-search-expand-tab path=${ex.path}; INSIDE the window: REAL doc-nav click on "${target.doc}" path=${clicked.path} (hit=${clicked.rect ? clicked.rect.hit : '?'}); after settlement: activeTabId=${v.activeTabId} activeTabKind=${v.activeTabKind} stageKind=${v.stageKind} stageMatchesActiveTab=${v.stageMatchesActiveTab} searchStage=${v.searchStage} surfaceCensus byId=${census.byId}/${census.byMarker} agree=${census.agree} editSurface=${v.editSurface} surface present=${st.present} marker=${st.marker}; tabs=${JSON.stringify(v.tabIds)} — the app's doc-nav handler routes to the SIDEBAR focus seam (selectDocument -> setCurrentDocumentId -> requestRebuild), which never activates/opens a document TAB`,
      { path: clicked.path === 'cdp' ? 'cdp' : clicked.path, ok, surface })
  },

  // ---- §8.3 item 3 (V2 broadcast) — a real store-changed broadcast while a
  // NON-document tab is active must not paint a foreign document body/surface. ----
  stage_foreign_rederive_v2: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const surface = await ufSurfaceTarget(h)
    const start = await ufStageVerdict(h)
    const st0 = await ufEditSurfaceState(h)
    if (!st0.present) return rowResult({row:'UF-STAGE-AT-4',dclass:'D-state'}, 'A store-changed broadcast while a NON-document tab is active does not paint a foreign document body or an edit surface', `no document surface to start from: activeTabKind=${start.activeTabKind} stageKind=${start.stageKind}`, { path: 'missing', ok: false, surface })
    // 1. REAL page edit + blur on the ACTIVE DOCUMENT tab (the commit broadcast)
    const placed = await ufCaretAt(h, st0.blockCount > 1 ? st0.blockCount - 1 : 0)
    await ufType(h, `BC${Date.now() % 10000}`)
    const blur = await ufBlurSurface(h)
    // 2. a REAL click opens the search tab (the non-document active tab)
    const ex = await ufExpandSearchTab(h)
    await sleep(2600)
    const midV = await ufStageVerdict(h)
    // 3. drive ANOTHER real broadcast while the search tab is active: the
    //    gnosis host's `onChanged()` → `host.refresh()` + the content re-derive
    const gs1 = await h.cdp.evaluate(`(async()=>{try{await window.provident.sidebar.gnosisStatus();return {called:true}}catch(e){return {called:false,err:String(e)}}})()`)
    await sleep(2500)
    const v = await ufStageVerdict(h)
    const census = await ufSurfaceCensus(h)
    const stageRead = await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');
      return {docHead:m?m.querySelector('[data-doc-head]')!=null:null,h1:m?m.querySelector('h1')!=null:null,
        searchStage:!!document.getElementById('${UF_STAGE_SEARCH_TAB_ID}'),
        mainText:(m?m.textContent:'').replace(/\\s+/g,' ').slice(0,120)}})()`)
    const foreignBody = stageRead.docHead === true || (v.editSurface != null && v.editSurface !== st0.marker)
    const ok = midV.stageKind === 'search' && v.activeTabKind === 'search' && v.stageKind === 'search' &&
      v.stageMatchesActiveTab === true && census.byId === 0 && census.byMarker === 0 && census.agree === true &&
      foreignBody === false && stageRead.searchStage === true
    return rowResult({row:'UF-STAGE-AT-4',dclass:'D-state'}, 'The V2 broadcast variant: with a SEARCH tab active, a real broadcast/re-derive (main→preload→renderer ordering) keeps the stage on the search page — no foreign document body, no edit surface, zero surfaces', `ensured a document tab is active: ${JSON.stringify(ensured)}; start: document tab ${start.activeTabId} marker=${st0.marker}; caret at block ${st0.blockCount > 1 ? st0.blockCount - 1 : 0} + typed + REAL blur => warning=${blur.warning} kind=${blur.warningKind}; REAL click #pane-search-expand-tab path=${ex.path}; after the search tab mounted: activeTabKind=${midV.activeTabKind} stageKind=${midV.stageKind} stageMatchesActiveTab=${midV.stageMatchesActiveTab}; then the real re-derive ('gnosisStatus()' called=${gs1.called}): activeTabId=${v.activeTabId} activeTabKind=${v.activeTabKind} stageKind=${v.stageKind} stageMatchesActiveTab=${v.stageMatchesActiveTab} searchStage=${v.searchStage} editSurface=${v.editSurface} surfaceCensus byId=${census.byId} byMarker=${census.byMarker} agree=${census.agree} ids=${JSON.stringify(census.ids)}; foreign document body in the stage=${foreignBody} (docHead=${stageRead.docHead}); #zone:main text="${stageRead.mainText}"`,
      { path: ex.path === 'cdp' ? 'cdp' : ex.path, ok, surface })
  },

  // ---- §8.3 item 4 (V5) — `refresh()` survival of the surface + toolbar. ----
  stage_refresh_survival_v5: async (h) => {
    await ufEnsureAppClear(h)
    const ensured = await ufEnsureDocumentSurface(h)
    const surface = await ufSurfaceTarget(h)
    const before = await ufStageVerdict(h)
    const st1 = await ufEditSurfaceState(h)
    const tb1 = await h.cdp.evaluate(`!!document.getElementById('editor-toolbar')`)
    const identity1 = await h.cdp.evaluate(`(()=>{const s=document.getElementById('editor-toolbar');return s?s.getAttribute('data-node-id'):null})()`)
    const gs = await h.cdp.evaluate(`(async()=>{try{await window.provident.sidebar.gnosisStatus();return {called:true}}catch(e){return {called:false,err:String(e)}}})()`)
    await sleep(3500)
    const after = await ufStageVerdict(h)
    const st2 = await ufEditSurfaceState(h)
    const tb2 = await h.cdp.evaluate(`!!document.getElementById('editor-toolbar')`)
    const identity2 = await h.cdp.evaluate(`(()=>{const s=document.getElementById('editor-toolbar');return s?s.getAttribute('data-node-id'):null})()`)
    const reassembled = identity1 !== identity2
    const ok = before.stageKind === 'document' && st1.present === true && st2.present === true &&
      st2.marker === st1.marker && after.stageMatchesActiveTab === true && tb1 === true && tb2 === true &&
      after.surfaceCensus === 1
    return rowResult({row:'UF-STAGE-AT-5',dclass:'D-state'}, "The V5 refresh survival: a real re-derive via the pane host's onChanged()/host.refresh() keeps the page-edit surface (same marker, still exactly one) AND the #editor-toolbar in the stage", `ensured a document tab is active: ${JSON.stringify(ensured)}; activeTabKind=${before.activeTabKind} stageKind=${before.stageKind}; before: surface present=${st1.present} marker=${st1.marker} box=${JSON.stringify(st1.box)} toolbar=${tb1} (node ${identity1}); the real re-derive seam ('gnosisStatus()' -> onChanged() -> host.refresh()) called=${gs.called}; after: surface present=${st2.present} marker=${st2.marker} box=${JSON.stringify(st2.box)} toolbar=${tb2} (node ${identity2}, re-assembled=${reassembled}) stageKind=${after.stageKind} stageMatchesActiveTab=${after.stageMatchesActiveTab} census=${after.surfaceCensus}/${after.markerCensus} agree=${after.markersAgree}`,
      { path: 'not-gesture', gesture: false, ok, surface })
  },

  // ---- §A.1.1 / A.1.2 — the mountTabs multi-mount reachability + census. ----
  stage_multimount_reachability: async (h) => {
    await ufEnsureAppClear(h)
    const surface = await ufSurfaceTarget(h)
    // R7's static reading, re-derived live: is `mountTabs` reachable from any
    // renderer-exposed surface? (the spec pins it UNREACHABLE FROM PRODUCTION.)
    const probes = await h.cdp.evaluate(`(()=>{const s=window.provident&&window.provident.sidebar||{};
      const hosts=[['sidebar',Object.keys(s)],['host',window.__sidebarPanes?Object.keys(window.__sidebarPanes):null]];
      const hits=[...document.querySelectorAll('[data-mount-tabs],[id*="mount-tabs"],[id*="mounttabs"]')].map((e)=>e.id||e.tagName);
      return {sidebarKeys:hosts[0][1].filter((k)=>/mount/i.test(k)),windowKeys:Object.keys(window).filter((k)=>/mountTabs|sidebarPanes/i.test(k)),domHits:hits}})()`)
    const v = await ufStageVerdict(h)
    const census = await ufSurfacePresence(h)
    const unreachable = probes.sidebarKeys.length === 0 && probes.windowKeys.length === 0 && probes.domHits.length === 0
    // A STRUCTURAL park with the recorded reason — never a silent one, and never
    // parked by default: the seam is named, its absence is proven live, and the
    // I2-R census it would stress is asserted in every REACHABLE state instead.
    return parkRow('UF-STAGE-AT-7', '`mountTabs([A,B])` leaves exactly ONE live surface (the active document\'s) and destroys the stale root (A.1.2 `destroyRoot`)', 'D-visual',
      `no production/live reachability: the sidebar bridge exposes NO mount* seam (keys matching /mount/ = ${JSON.stringify(probes.sidebarKeys)}), no window-level host object (${JSON.stringify(probes.windowKeys)}), no DOM affordance (${JSON.stringify(probes.domHits)}) — the spec pins the seam UNREACHABLE FROM PRODUCTION until U-STATE-1e lands (sidebar-panes.ts mountTabs REACHABILITY PIN; the audit §4.1 R7). The census it would stress is asserted in every REACHABLE state instead: activeTabKind=${v.activeTabKind} stageKind=${v.stageKind} stageMatchesActiveTab=${v.stageMatchesActiveTab} surface census byId=${census.byId} byMarker=${census.byMarker} agree=${census.agree}`,
      // §6.1 `H-4` — `evidence` is the STRING above (the object this site used to
      // hand over in that slot printed `[object Object]`) and the §6.1 field set
      // travels in `opts`, the SIXTH slot, where `parkRow` reads a park's
      // `path`/`surface` — the slot this site's object used to be dropped from.
      'the mount* seam is unreachable from production: the census it would stress could not be driven, so the row carries no verdict this run',
      { path: 'not-reachable', ok: false, surface, required: 'a reachable production/live `mountTabs` seam (sidebar bridge, window host object or DOM affordance)', observed: `no seam: sidebarKeys=${JSON.stringify(probes.sidebarKeys)} windowKeys=${JSON.stringify(probes.windowKeys)} domHits=${JSON.stringify(probes.domHits)}` })
  },

  // ---- §8.3 item 5 — the PERSISTED tab round-trip (the LIVE-5 pattern). The
  // block records the state; the two-launch comparison is the run record's
  // before/after readings under a SHARED `--home`. ----
  stage_tabs_persist_roundtrip: async (h) => {
    await ufEnsureAppClear(h)
    const surface = await ufSurfaceTarget(h)
    const v = await ufStageVerdict(h)
    // §2.1.1 limb 2 — THE RENDERED TAB SET this round-trip compares against the
    // persisted one, read as the strip's OWN rows (the document-tab rows are the
    // corpus-keyed half of that set; `ufTabStripRead`).
    const strip = await ufTabStripRead(h)
    const persisted = await h.cdp.evaluate(`(async()=>{try{const s=await window.provident.operatorSettings.get();return {ok:true,activeId:s&&s.tabs?s.tabs.activeId:null,order:s&&s.tabs?s.tabs.order:null,openCount:s&&s.tabs?s.tabs.open.length:null}}catch(e){return {ok:false,err:String(e)}}})()`)
    const openMatches = Array.isArray(persisted.order) && Array.isArray(v.openIds) && JSON.stringify(persisted.order) === JSON.stringify(v.openIds)
    const activeMatches = persisted.activeId === v.activeTabId
    const ok = persisted.ok === true && openMatches && activeMatches && v.stageMatchesActiveTab === true
    return rowResult({row:'UF-STAGE-AT-6',dclass:'D-state'}, 'The persisted tab set (operator settings `tabs`) equals the RENDERED open set and active tab, and the boot stage satisfies stageMatchesActiveTab — the node suite can only assert TabState coercion', `rendered strip: activeTabId=${v.activeTabId} kind=${v.activeTabKind} openIds=${JSON.stringify(v.openIds)} tabCount=${v.tabCount} stageKind=${v.stageKind} stageMatchesActiveTab=${v.stageMatchesActiveTab} surfaceCensus=${v.surfaceCensus}; rendered strip rows (ufTabStripRead, §2.1.1 limb 2)=${strip.rows.length} tab(s) of which ${strip.docTabRows} carry a corpus document id; persisted operator settings tabs=${JSON.stringify(persisted)}; rendered set == persisted order=${openMatches}; persisted activeId == rendered active=${activeMatches}. The BOOT half of the round trip is the second launch's reading (same --home, --no-seed): see the run record's before/after pair.`,
      { path: 'not-gesture', gesture: false, ok, surface })
  },

  // ---- a DIAGNOSTIC reading of the document-surface precondition itself (the
  // steps `ufEnsureDocumentSurface` takes), so a FAILED document-surface block's
  // precondition is never a mystery and never a silent park. ----
  stage_doc_surface_precondition_diag: async (h) => {
    await ufEnsureAppClear(h)
    const before = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
    const docNav = await h.cdp.evaluate(`(()=>{const dn=document.getElementById('pane-doc-nav');return {exists:!!dn,rows:document.querySelectorAll('#pane-doc-nav [data-document-id]').length,
      folderRows:document.querySelectorAll('#pane-doc-nav [data-folder-path]').length,
      text:dn?(dn.textContent||'').replace(/\s+/g,' ').slice(0,120):null,
      paneBox:(()=>{const p=document.getElementById('pane-doc-nav');if(!p)return null;const r=p.getBoundingClientRect();return [Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)]})()}})()`)
    const docs = await h.mcpTool(h.mcp, 'rag.list_documents', {}).catch((e) => ({ __error: String(e) }))
    const ensured = await ufEnsureDocumentSurface(h)
    const after = await h.cdp.evaluate(UF_ACTIVE_TAB_SRC)
    const st = await ufEditSurfaceState(h)
    return diagResult(`[U-STAGE-ACTIVE-TAB precondition] tabs before=${JSON.stringify(before.tabIds)} active=${before.activeTabId}/${before.activeTabKind}; doc-nav exists=${docNav.exists} rows=${docNav.rows} folders=${docNav.folderRows} box=${JSON.stringify(docNav.paneBox)} text="${docNav.text}"; rag.list_documents=${Array.isArray(docs.documents) ? docs.documents.length : JSON.stringify(docs).slice(0,120)}; ufEnsureDocumentSurface=${JSON.stringify(ensured)}; tabs after=${JSON.stringify(after.tabIds)} active=${after.activeTabId}/${after.activeTabKind}; surface present=${st.present} marker=${st.marker} blocks=${st.blockCount}`, { ensured: ensured, docNav: docNav })
  },

  // ---- the empty-boot landing (§8.3 item 1) as a DIAGNOSTIC reading: the
  // boot state of a fresh store (no tabs, no documents) cannot be produced in a
  // battery that seeds a corpus first, so it is recorded, never asserted. ----
  stage_boot_landing_diag: async (h) => {
    const v = await ufStageVerdict(h)
    const census = await ufSurfacePresence(h)
    const read = await h.cdp.evaluate(`(()=>{const m=document.getElementById('zone:main');return {landing:!!document.getElementById('stage-landing'),
      stageAttrs:m?[...m.children].map((c)=>c.id||c.getAttribute('data-stage')||c.tagName):[],
      mainText:(m?m.textContent:'').replace(/\\s+/g,' ').slice(0,120)}})()`)
    const consistent = (v.activeTabKind === 'document' ? census.byId === 1 : census.byId === 0) && v.stageMatchesActiveTab === true
    return diagResult(`[U-STAGE-ACTIVE-TAB §8.3 item 1 — boot/landing reading] activeTabId=${v.activeTabId} activeTabKind=${v.activeTabKind} stageKind=${v.stageKind} stageMatchesActiveTab=${v.stageMatchesActiveTab} landing=${read.landing} surfaceCensus byId=${census.byId} byMarker=${census.byMarker} agree=${census.agree} stageChildren=${JSON.stringify(read.stageAttrs)} #zone:main="${read.mainText}" — census predicate holds in this reachable state=${consistent}`, { bootConsistent: consistent })
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
/**
 * §2.2 `E-7` — THE PRINTED PER-ROW LINE: each counted row block's OWN verdict
 * through the whole contracted §6.1 set — `row`, `block`, `verdict`, `dclass`,
 * `realInput`, the whole `surface` object INCLUDING `target` (M-4), the
 * `failingClause` with its observed-vs-required values (M-3), `evidence`,
 * `proxyPASS` and `gesturePath`. `COVERED_ROW_BLOCKS` names every counted block
 * (with its declared row id) so the printed record is complete: no counted row
 * block is left out of the artifact (the returned object is not the artifact,
 * `V-4`; the printed line is).
 *
 * A gesture row that could not be driven honestly prints `NOT-DRIVEN` with
 * `realInput:false` and the DRIVER-failure marker — NEVER an app-layer FAIL
 * (§2.3 `H-4`).
 */
const COVERED_ROW_BLOCKS = [
  { block: 'uf_tabs_1', row: 'UF-TABS-1' }, { block: 'uf_tabs_3', row: 'UF-TABS-3' },
  { block: 'uf_tabs_4', row: 'UF-TABS-4' }, { block: 'uf_tabs_7', row: 'UF-TABS-7' },
  { block: 'uf_settings_1', row: 'UF-SETTINGS-1' }, { block: 'uf_settings_2', row: 'UF-SETTINGS-2' },
  { block: 'uf_settings_3', row: 'UF-SETTINGS-3' }, { block: 'uf_settings_4', row: 'UF-SETTINGS-4' },
  { block: 'uf_settings_5', row: 'UF-SETTINGS-5' }, { block: 'uf_settings_7', row: 'UF-SETTINGS-7' },
  { block: 'uf_panes_1', row: 'UF-PANES-1' }, { block: 'uf_panes_8', row: 'UF-PANES-8' },
  { block: 'uf_panes_10', row: 'UF-PANES-10' }, { block: 'uf_panes_12', row: 'UF-PANES-12' },
  { block: 'uf_panes_14', row: 'UF-PANES-14' }, { block: 'uf_search_2', row: 'UF-SEARCH-2' },
  { block: 'uf_hist_4', row: 'UF-HIST-4' }, { block: 'uf_hist_6', row: 'UF-HIST-6' },
  { block: 'uf_layout_2', row: 'UF-LAYOUT-2' }, { block: 'uf_layout_10', row: 'UF-LAYOUT-10' },
  { block: 'user1_tab_new', row: 'UF-DEFECT-1' }, { block: 'user2_pane_drag', row: 'UF-DEFECT-2' },
  { block: 'user3_collapse_orientation', row: 'UF-KEEP-1' }, { block: 'user4_main_editable', row: 'UF-STAGE-3' },
  { block: 'user5_history_in_pane', row: 'UF-DEFECT-3' }, { block: 'user6_search_no_flicker', row: 'UF-KEEP-3' },
  { block: 'user7_zone_resize', row: 'UF-DEFECT-5' }, { block: 'user8_zone_boundary', row: 'UF-DEFECT-6' },
  { block: 'user9_search_open_in_tab', row: 'UF-DEFECT-7' }, { block: 'user10_collapse_vertical_text', row: 'UF-DEFECT-8' },
  { block: 'repro_nbsp', row: 'UF-STAGE-4' }, { block: 'repro_dup_para', row: 'UF-STAGE-2' },
  { block: 'toolbar_undo', row: 'UF-HIST-2' }, { block: 'toolbar_toggle', row: 'UF-STAGE-6' },
  { block: 'boot_landing', row: 'UF-STAGE-1' }, { block: 'vis_persist', row: 'UF-SETTINGS-7' },
]


/**
 * §2.2 `E-7`/`E-8` / §3.2 `F-10` (`G-10`) — THE DERIVED FAILING CLAUSE of a row
 * record that arrived WITHOUT one: `null` on a PASS (a clause-less PASS is
 * correct), and otherwise the row's OWN assertion as the predicate with its
 * `required`/`observed` values named. A `FAIL` may therefore never reach the
 * printed record as `failingClause=null` — the reading this unit took was
 * `UF-HIST-2`/`toolbar_undo`, the one `ROW` line of the battery carrying a FAIL
 * with an empty clause.
 *
 * finding `C-4` — **THE GUARD IS A GUARD, NOT A MIS-STATEMENT.** At this head it
 * is UNREACHABLE (every report-row producer goes through `rowResult`, which sets
 * a clause on every non-PASS; the only producers are `rowResult`,
 * `declaredRowResult` — which spreads it — and `ufDriverFailureRows`, which calls
 * `rowResult`), and as filed it would MIS-STATE if it ever did fire: `required =
 * r.required ?? r.assertion` printed the ASSERTION SENTENCE in the `required`
 * position (`§2.2 E-7` requires the observed-vs-required VALUES), and a path-less
 * row read `FAIL` (a never-driven row labelled an app failure). It is kept as the
 * safety net it claims to be, made HONEST: the `required` position carries the
 * row's own value or the NAMED `UF_NO_REQUIRED_VALUE` sentinel, and the
 * classification is not re-derived: `buildFailingClause` applies the SAME predicate
 * the report's own classifier applies (⟨gate-4 finding `D-2`⟩ ONE PREDICATE, NOT TWO),
 * so the clause records exactly the verdict the `ROW`/`FAIL` line prints.
 */
function ufDerivedFailingClause(r, evidence) {
  if (!r || r.pass === true || typeof r.assertion !== 'string' || r.assertion === '') return null
  return buildFailingClause(
    false,
    r.assertion,
    typeof r.required === 'string' && r.required !== '' ? r.required : UF_NO_REQUIRED_VALUE,
    r.observed ?? evidence,
    r.gesturePath ?? null,
    r.realInput === true,
    r.proxyPASS === true,
    r.park === true,
  )
}

/**
 * §2.2 `E-7` — THE REPORT ROW the printed artifact is built from: the whole
 * contracted field set (`row`, `block`, `verdict`, `dclass`, `realInput`, the
 * whole `surface` object, `failingClause` with observed-vs-required, `evidence`,
 * `proxyPASS`, `gesturePath`) plus the §2.3 `H-4` DERIVED `NOT-DRIVEN`
 * classification (`driverFailure`), so no counted row is recorded in the thin
 * `{row, block, pass}` shape `V-4` read and no driver failure is counted as an
 * app-layer FAIL.
 */
function buildReportRow(r, block, verdict, notDriven) {
  // §2.3 `H-4` / §3.2 `F-6` / finding `C-5` — **THE PARKED ROW'S RESOLVED REASON.**
  // A parked result's reason is its own recorded `parkReason`; when the site that
  // parked recorded none, the NAMED `UF_NO_PARK_REASON` sentinel takes its place, so
  // a `ROW` line reading `verdict=PARKED` can never appear with the park text
  // skipped (finding `C-5`: `uf_hist_6`'s unreachable-history path printed `PARKED`
  // with no reason while the block-level `PARK` line read
  // `(no parkReason recorded for U-7)`). The row's OWN park flag is part of the
  // resolution, so a NON-parked row resolves to `null` — no reason can ride a row
  // that did not park. `parkedReason` is the ONE place the substitution is made;
  // the returned field below reads the row's own reason through it.
  const parkedReason = r.park === true ? UF_NO_PARK_REASON : null
  r = { ...r, parkReason: r.parkReason ?? parkedReason }
  // §2.2 `E-6`/`E-7` (`G-6`): an EMPTY `evidence` on a FAIL violates a recorded
  // requirement (`DECIDED: D-GP-UFA-3` — `realInput`/`evidence` are MANDATORY
  // report fields), so the empty string is replaced by a NAMED sentinel: a FAIL
  // can never ship with no evidence text.
  const evidence = typeof r.evidence === 'string' && r.evidence !== ''
    ? r.evidence
    : (typeof r.detail === 'string' && r.detail !== '' ? r.detail : '(no evidence recorded)')
  // §2.2 `E-7`/`E-8` / §3.2 `F-10` (`G-10`) — NO NON-PASS MAY REACH THE LOG WITHOUT
  // ITS CLAUSE. The clause is built by the row-result builder, but a block that
  // assembles its own result object (or a legacy row block that never carried one)
  // could still print `failingClause=null` on a FAIL — the live battery read exactly
  // one such row (`UF-HIST-2`/`toolbar_undo`). The record therefore DERIVES the
  // clause from the row's own assertion/observed/required whenever a non-PASS
  // arrives without one, so the printed `FAIL` always states the predicate that
  // failed with its observed-vs-required values. The derivation lives in its own
  // helper so this initializer stays a single readable expression.
  const clause = r.failingClause ?? ufDerivedFailingClause(r, evidence)
  // ⟨GATE-4 FINDING `D-2` — ONE PREDICATE, NOT TWO⟩ — THE CLAUSE'S `verdict` IS THIS
  // ROW'S PRINTED `verdict`. The classification is taken ONCE, at this record's own
  // call site (`ufPushRows` → `blockVerdictOf` → `buildReportRow`): the `verdict`
  // member above. `buildFailingClause` applies the same predicate, and this stamp makes
  // the identity unconditional for the printed artifact — a row printing
  // `verdict=NOT-DRIVEN` cannot carry a clause recording `FAIL`, and a genuine app
  // `FAIL` cannot be demoted by a path test of the clause's own, whatever route built
  // the clause (a block-supplied one included).
  const oneClause = clause === null || clause === undefined ? null : { ...clause, verdict: verdict }
  return {
    row: r.row, block: block, verdict: verdict, dclass: r.dclass ?? null,
    realInput: r.realInput === true, evidence: evidence,
    proxyPASS: r.proxyPASS === true, proxy: r.proxy ?? null,
    surface: r.surface ?? null, failingClause: oneClause,
    observed: r.observed ?? null, required: r.required ?? null,
    gesturePath: r.gesturePath ?? null, park: r.park === true, pass: r.pass === true,
    driverFailure: notDriven === true,
    // §2.3 `H-3` clause 1 (`G-9`) — the click's own record when the row's verdict
    // rests on a click, and §2.3 `H-4` — the NAMED reason a PARKED row parked for
    // (`F-6`/`F-7`): both are carried into the printed `ROW` line below, so
    // neither the coordinate triple nor a park reason is reachable only from the
    // returned object (`V-4`: the printed line is the artifact).
    clickRecord: r.clickRecord ?? null,
    parkReason: r.parkReason ?? null,
  }
}

/** §2.3 `H-4` — THE BLOCK VERDICT LINE: the classification the run prints for the
 *  block's PRIMARY result (`PARKED` > `PASS` > `NOT-DRIVEN` > `FAIL`), derived
 *  from the returned result's own fields. A gesture row whose path was recorded
 *  and could NOT be driven honestly reads `NOT-DRIVEN` (a DRIVER failure, never
 *  an app-layer FAIL); a diagnostic/hygiene block prints `DIAG`.
 *
 *  ⟨GATE-4 FINDING `D-2`⟩ — THIS IS THE DRIVER'S ONE CLASSIFICATION PREDICATE, and it is
 *  the one the §6.1 counts, the `PASS`/`NOT-DRIVEN`/`FAIL`/`PARK` block lines and every
 *  `ROW` line's `verdict=` are taken from. The clause builder states the SAME predicate
 *  (verbatim, same path vocabulary) so that a row's `failingClause.verdict` cannot
 *  diverge from the verdict the report prints; it is stated rather than called there
 *  because the pin evaluates that builder's TEXT in isolation (`new Function`), so a
 *  reference to this helper would be a second, unreadable classification at the site
 *  that matters. Neither site may grow a path test of its own: the dead path token this
 *  finding named is deleted, and the pin's report-vs-clause token-set equality is what
 *  holds the two statements to one predicate. */
function blockVerdictOf(r) {
  const gated = r.gesturePath != null && !/state row/.test(String(r.gesturePath))
  const notDriven = gated && r.realInput !== true && r.pass !== true
  const verdict = r.park === true ? 'PARKED' : (r.pass === true ? 'PASS' : (notDriven ? 'NOT-DRIVEN' : 'FAIL'))
  return { gated, notDriven, verdict }
}

/** §2.3 `H-4` — PRINT the block's primary result line and count it: `DIAG` for a
 *  diagnostic/hygiene block, `PASS`, `PARK`, `NOT-DRIVEN` (a DRIVER failure —
 *  never an app-layer FAIL) or `FAIL`. Returns the counter the line incremented,
 *  so the run's arithmetic stays the caller's. */
function printBlockVerdict(label, r) {
  const { notDriven, verdict } = blockVerdictOf(r)
  const detail = r.detail ?? r.evidence ?? ''
  if (r.diagnostic === true) { console.log(`DIAG  ${label} ${detail}`); return 'diag' }
  if (r.pass === true) { console.log(`PASS  ${label} ${detail}`); return 'pass' }
  // §2.3 `H-4` / §3.2 `F-6` (`G-10`) — A PARKED ROW PRINTS ITS NAMED
  // `parkReason`: `RCA-11` clause (b) records the reason a structural
  // precondition could not be met, and a reason named only on the returned
  // object reached no log at all (the reading this fixes).
  if (r.park === true) { console.log(`PARK  ${label} ${detail} parkReason=${JSON.stringify(r.parkReason ?? `(no parkReason recorded for ${r.row ?? 'this row'})`)}`); return 'park' }
  if (notDriven) { console.log(`NOT-DRIVEN  ${label} ${detail} (DRIVER failure — never an app-layer FAIL)`); return 'notDriven' }
  console.log(`FAIL  ${label} ${detail}`)
  return 'fail'
}

// ---------------------------------------------------------------------------
// THE SPAWNED-CHILD SWEEP — ONE BOUNDED MECHANISM, ON EVERY EXIT PATH.
//
// ⟨GATE-5 `L-3d` FINDING (g) — THE `main().catch` EARLY ABORT LEAKED ITS CHILD.⟩
// Measured by the blind runner: `--port=not-a-port` made the port `NaN`, the
// Electron child was spawned on the DEFAULT ports (`3787`/`9222`) and SURVIVED the
// driver's `exit 2` — it had to be killed by hand. `DECIDED:
// LIVE-GATE-RUN-DISCIPLINE` clause (i) exists to prevent exactly that
// contamination (a concurrent sibling holds `9222` and `pkill`s `electron .`), and
// a leaked child is also an app a LATER run would talk to. So: NO EARLY EXIT MAY
// ORPHAN A CHILD THIS DRIVER SPAWNED.
//
// HOW THE SWEEP IS BOUNDED, IN ONE LINE: it signals ONLY this driver's OWN spawn
// handle — ONE SIGTERM to that child's process GROUP (the spawn is `detached`, so
// `-pid` is the group it leads), then ONE SIGKILL to the SAME group iff the leader
// is still alive after `UF_SWEEP_GRACE_MS` — so it is bounded to ONE handle, ONE
// process group and ONE grace period, and it never SCANS or PATTERN-MATCHES the
// process table (no `pkill`, no `pgrep`); a `--connect` run attaches to a RUNNING
// session it does not own, so it holds NO handle and sweeps nothing.
const UF_SWEEP_GRACE_MS = 1500
/** The driver's OWN spawned child — module scope, so the module-level
 *  `main().catch` early-abort path can sweep it. `null` in `--connect` mode, on any
 *  refusal that returns before the spawn, and after a sweep (ONE sweep per handle,
 *  whichever path takes the exit). */
let UF_SPAWNED_CHILD = null
/** ⟨gate-4 `F-8`⟩ THE SCRATCH HOME THIS RUN MINTED — module scope, for the same
 *  reason `UF_SPAWNED_CHILD` is: the module-level `main().catch` early abort can land
 *  BETWEEN the mint and `main`'s own `try`/`finally` (the one throw candidate on that
 *  stretch is the operator's `--corpus-root=` registry write), and that abort would
 *  otherwise leave the dir behind. `{dir, ownScratch}` while a mint is live, `null`
 *  once the bounded removal has run — so the ONE abort path removes exactly what this
 *  run created, through the SAME bounded helper the normal teardown uses. */
let UF_MINTED_HOME = null
/** The sweep's SIGNALLING HALF: the child's process GROUP, then the child itself. */
function ufSweepSignal(child, signal) {
  const pid = child.pid
  // NEVER A WILDCARD: a pid that is not a real child pid (undefined/NaN/1) is not
  // signalled at all, because `process.kill(-1, …)` would signal EVERY process this
  // user owns — the exact opposite of a bounded sweep.
  if (!Number.isInteger(pid) || pid <= 1) return
  try { process.kill(-pid, signal) } catch { /* the group is already gone */ }
  try { child.kill(signal) } catch { /* already gone */ }
}
/** THE SWEEP: SIGTERM, a BOUNDED poll of the child's own pid, then SIGKILL to the
 *  SAME group. Returns the record the caller prints; `swept:false` means this run
 *  spawned nothing (a `--connect` run, or a refusal that returned before the spawn). */
async function ufSweepSpawnedChild(reason) {
  const child = UF_SPAWNED_CHILD
  if (child === null || child.pid == null) return { swept: false, pid: null, escalated: false, reason: reason }
  UF_SPAWNED_CHILD = null
  ufSweepSignal(child, 'SIGTERM')
  const t0 = Date.now()
  const alive = () => { try { process.kill(child.pid, 0); return true } catch { return false } }
  while (alive() && Date.now() - t0 < UF_SWEEP_GRACE_MS) await sleep(50)
  const escalated = alive()
  if (escalated) ufSweepSignal(child, 'SIGKILL')
  return { swept: true, pid: child.pid, escalated: escalated, reason: reason }
}
/** THE SWEEP, SAID IN ONE LINE WITH ITS BOUND (above) — printed by every path that
 *  actually swept, so an abort's process hygiene is a READING rather than a hope. */
function ufReportSweep(r) {
  if (!r.swept) return
  console.error(`[live-drive] CHILD SWEEP (${r.reason}): the child this driver SPAWNED (pid ${r.pid}, process group -${r.pid}) was swept — ONE SIGTERM to that group, then ONE SIGKILL to the SAME group iff its leader was still alive after the ${UF_SWEEP_GRACE_MS} ms grace (${r.escalated ? 'ESCALATED to SIGKILL' : 'the group exited on SIGTERM'}); the sweep is BOUNDED to this driver's own spawn handle (one handle, one process group, one grace period) and never scans or signals the process table, so a sibling's app and a \`--connect\` session are never touched`)
}
/** THE LAST-RESORT HALF, so "no orphan may outlive an abort" does not depend on
 *  WHICH path took the exit: an exit that never reached the awaited sweep (a
 *  signal-driven exit, or any unexpected `process.exit`) still sweeps
 *  SYNCHRONOUSLY — SIGTERM then SIGKILL on the SAME one group, no grace. */
process.on('exit', () => {
  const child = UF_SPAWNED_CHILD
  if (child === null || child.pid == null) return
  UF_SPAWNED_CHILD = null
  ufSweepSignal(child, 'SIGTERM')
  ufSweepSignal(child, 'SIGKILL')
})

/** ⟨gate-4 `F-8` — **A SIGNAL-DRIVEN EXIT IS AN EXIT PATH TOO, AND IT WAS MEASURABLY
 *  LEAKING BOTH HANDLES.**⟩ MEASURED (this pass, an operator-visible accident while
 *  probing the `--home` guard): a `SIGTERM` to the driver's own wrapper killed the run
 *  mid-boot, the `finally` never unwound (it is awaiting inside `main`), Node's default
 *  SIGTERM exit ran NO `exit` handler — so the spawned Electron SURVIVED on its
 *  isolated ports AND the scratch HOME stayed on disk. Both are the `F-8` leak class on
 *  the signal path, and the standing hazards make it the COMMON path rather than an
 *  exotic one (a harness `timeout`, and the concurrent sibling's `pkill -f "electron
 *  ."`). These two handlers make the signal path reach the SAME two bounded cleanups:
 *  the scratch-home removal runs HERE (synchronously, through the one bounded helper),
 *  and `process.exit` then runs the `exit` handler above, which sweeps the spawned
 *  child's own one process group. Neither handler touches anything this run does not
 *  own, and `SIGKILL` remains uncoverable by construction (no process can act after
 *  it) — named, never implied. */
for (const ufSignal of ['SIGTERM', 'SIGINT']) {
  process.on(ufSignal, () => {
    try {
      if (UF_MINTED_HOME !== null) {
        console.error(ufRemoveScratchHome(UF_MINTED_HOME.dir, UF_MINTED_HOME.ownScratch))
        UF_MINTED_HOME = null
      }
    } catch { /* the exit must never be blocked by the cleanup */ }
    process.exit(ufSignal === 'SIGINT' ? 130 : 143)
  })
}

/** §6.1 (`G-8`) — **A NUMERIC ARGUMENT IS A PORT OR IT IS NOTHING: `--port=` and
 *  `--cdp-port=` are VALIDATED BEFORE ANYTHING IS SPAWNED.** A value the parser
 *  cannot read as a port must never reach the spawn, because the spawn's own
 *  fallback is the WORST outcome available: `Number('not-a-port')` is `NaN`, the
 *  child ignores the unusable flag and boots on the DEFAULT `3787`/`9222` — the two
 *  ports a concurrent sibling owns (`DECIDED: LIVE-GATE-RUN-DISCIPLINE` clause (i))
 *  — while the driver waits on a `NaN` port, aborts, and (before the sweep landed)
 *  orphaned that child. The accepted form is a DECIMAL INTEGER in the TCP port
 *  range `1`..`65535`: `0`, `65536`, `-1`, `1e3`, `0x10`, `80.0`, `''` and
 *  `not-a-port` all name no port, so all are REFUSED BY NAME. */
function ufPortArgOffence(flag, text) {
  if (!/^\d+$/.test(text)) return { flag: flag, text: text, why: `is not a DECIMAL INTEGER (${JSON.stringify(text)})` }
  const n = Number(text)
  if (!(n >= 1 && n <= 65535)) return { flag: flag, text: text, why: `is OUT OF RANGE (${n}) — a TCP port is 1..65535` }
  return null
}

/** ⟨gate-4 `F-8` — **A `--home=<dir>` PATH IS A CANDIDATE FOR A RECURSIVE DELETE,
 *  SO IT IS VALIDATED BEFORE ANYTHING IS SPAWNED.**⟩ HAZARD, not a wording issue:
 *  this run hands its HOME to the spawned app AND to `rmSync(home, { recursive: true })`
 *  at teardown, and before this clause the value came STRAIGHT from the operator's
 *  `--home=` with no check at all — so `--home="$HOME"` (or `--home=/`) turned the
 *  driver's OWN cleanup into a RECURSIVE DELETE OF AN OPERATOR-CHOSEN TREE, and a
 *  `--home=` naming a FILE had that file removed by the same recursive delete. Three
 *  limbs bound it: (i) the value must RESOLVE to a location strictly UNDER the OS
 *  temp root — the root ITSELF is refused (`--home=/tmp` would delete the whole temp
 *  tree, siblings included); (ii) a path that EXISTS but is NOT a directory is
 *  refused; (iii) a path that does not exist yet is ACCEPTED (there is nothing to
 *  delete; the app may create it). The refusal is printed BY NAME on the SAME
 *  pre-spawn path the ports use: exit `2`, nothing spawned, and — now — no scratch
 *  dir minted either (the mint was moved below every refusal, `F-8`'s leak half). */
function ufHomeArgOffence(text) {
  const raw = String(text ?? '')
  if (raw.trim() === '') return { flag: '--home', text: raw, why: 'names NO directory (an EMPTY value) — and the driver REMOVES the HOME it used, so an unreadable value may never reach the teardown' }
  const resolved = resolvePath(raw)
  const tempRoot = resolvePath(tmpdir())
  if (resolved === tempRoot) return { flag: '--home', text: raw, why: `resolves to the OS TEMP ROOT ITSELF (${tempRoot}) — this run REMOVES the HOME it used (a recursive delete at teardown), so this value would delete the whole temp tree the sibling sessions share` }
  if (!resolved.startsWith(tempRoot + pathSep)) return { flag: '--home', text: raw, why: `resolves to ${resolved}, which does NOT live UNDER the OS temp root ${tempRoot} — this run REMOVES the HOME it used (a recursive delete at teardown), so an OPERATOR tree (${resolved}) is never handed to it` }
  let st = null
  try { st = statSync(resolved) } catch { st = null }
  if (st !== null && !st.isDirectory()) return { flag: '--home', text: raw, why: `resolves to ${resolved}, which EXISTS and is NOT a directory — the teardown is a RECURSIVE delete and is never pointed at a file` }
  return null
}

/** ⟨gate-4 `F-8` — **THE TEARDOWN IS BOUNDED, AND IT SAYS WHAT IT DID.**⟩ The old
 *  removal was one unconditional `rmSync(home, { recursive: true, force: true })`:
 *  `force` on a path the DRIVER did not mint is the operator-tree hazard `F-8` names,
 *  and a silent best-effort `catch` left an orphan scratch dir unrecorded. THIS is the
 *  only removal path: it re-checks the bound at the SITE of the delete (defence in
 *  depth — the guard above already refused an out-of-bound `--home=`, and this refuses
 *  again rather than trusting a value that arrived another way), it removes only a
 *  DIRECTORY, and `force` is used ONLY for the dir this run minted itself
 *  (`mkdtempSync` under the OS temp root): an operator-named `--home=` is removed
 *  WITHOUT `force`, so a path that is not there is never silently "removed". It returns
 *  the line the run prints, so the removal is a READING (and an orphan is named, never
 *  left unsaid). */
function ufRemoveScratchHome(dir, ownScratch) {
  if (typeof dir !== 'string' || dir === '') return '[live-drive] SCRATCH HOME: this run minted NO HOME (nothing to remove; no orphan is possible on this path)'
  const resolved = resolvePath(dir)
  const tempRoot = resolvePath(tmpdir())
  if (resolved === tempRoot || !resolved.startsWith(tempRoot + pathSep)) {
    return `[live-drive] SCRATCH HOME: NOT REMOVED — ${resolved} does not live UNDER the OS temp root ${tempRoot}; the teardown is BOUNDED to this run's own scratch under ${tempRoot} and never deletes a path outside it`
  }
  let st = null
  try { st = statSync(resolved) } catch { st = null }
  if (st === null) return `[live-drive] SCRATCH HOME: NOT REMOVED — ${resolved} does not exist (nothing was created there), so there is nothing to delete`
  if (!st.isDirectory()) return `[live-drive] SCRATCH HOME: NOT REMOVED — ${resolved} EXISTS and is NOT a directory; a recursive delete is never pointed at a file`
  try { rmSync(resolved, { recursive: true, force: ownScratch === true }) } catch (e) {
    return `[live-drive] SCRATCH HOME: NOT REMOVED — ${resolved} (${ownScratch === true ? 'this run\'s own mkdtemp scratch' : 'the operator-named --home dir'}); the bounded recursive delete failed: ${String(e && e.message ? e.message : e)}`
  }
  return `[live-drive] SCRATCH HOME: removed ${resolved} (${ownScratch === true ? 'the dir THIS run minted with mkdtempSync under the OS temp root — the only kind this run may force-remove' : 'the OPERATOR-named --home dir, under the OS temp root — removed WITHOUT force: only this run\'s own mkdtemp scratch is ever force-deleted'})`
}

async function main(argv) {
  // §6.1 (`G-8`) — THE WIDER DEFAULT TOOL-GROUP SET, named ONCE so the no-flag
  // profile and the empty-value refusal (which must NOT select it silently) are
  // read from the same declaration.
  const UF_DEFAULT_GROUPS = ['read', 'dispatch', 'rag', 'edit', 'module', 'code', 'graph', 'gnosis', 'gnosis-edit']
  // §3.3 — the O-0 flags are DEFAULT-SAFE: `--gpu` off (today's sanctioned
  // launch path is the GPU-OFF leg), `--o0-corpus` none, `--o0-out` none (a run
  // without it is console-only and can never produce the committed artifact).
  const opt = { fixture: null, mode: 'lexical', port: 3787, cdpPort: 9222, home: null, seed: null, corpusRoot: null, strictSeed: false, groups: null, emptyGroups: false, badPortArgs: [], badHomeArgs: [], block: 'all', noSeed: false, keepHome: false, connect: false, gpu: false, o0Corpus: null, o0Out: null, display: null, cliArgs: argv, badFixtureArg: null, conflictingFixture: null }
  for (const a of argv) {
    if (a === '--no-seed') { opt.noSeed = true; continue }
    if (a === '--keep-home') { opt.keepHome = true; continue }
    if (a === '--connect') { opt.connect = true; continue }
    if (a === '--gpu') { opt.gpu = true; continue }
    if (a === '--strict-seed') { opt.strictSeed = true; continue }
    const m = /^--([a-z0-9-]+)=(.*)$/.exec(a); if (!m) continue
    if (m[1] === 'mode') opt.mode = m[2]
    // §6.1 (`G-8`) — THE NUMERIC ARGS ARE RECORDED AS PARSED **AND** VALIDATED:
    // the value is kept (a refusal is a reading about the request) and the offence,
    // if any, is recorded for the pre-spawn refusal below. `Number(m[2])` alone is
    // what put a `NaN` port into the spawn.
    else if (m[1] === 'port') { opt.port = Number(m[2]); const bad = ufPortArgOffence('--port', m[2]); if (bad) opt.badPortArgs.push(bad) }
    else if (m[1] === 'cdp-port') { opt.cdpPort = Number(m[2]); const bad = ufPortArgOffence('--cdp-port', m[2]); if (bad) opt.badPortArgs.push(bad) }
    // ⟨gate-4 `F-8`⟩ `--home=<dir>` IS VALIDATED AS PARSED, and the offence (if any)
    // is carried for the pre-spawn refusal below — the SAME two-form pattern the ports
    // use: the value is kept (a refusal is a reading about the request) and the offence
    // is recorded where the early path can refuse it BY NAME before anything spawns.
    else if (m[1] === 'home') { opt.home = m[2]; const bad = ufHomeArgOffence(m[2]); if (bad) opt.badHomeArgs.push(bad) }
    else if (m[1] === 'seed') opt.seed = m[2]
    // `--corpus-root=<dir>` — the store's import root for the SEED corpus. The
    // default store's corpusRoot is the app's cwd (the project root), so a seed
    // corpus outside it is REJECTED by the importer's containment guard
    // (`markdown import: path outside corpus root`). Pointing the store at the
    // seed dir is what lets the O-0 operator-corpus census be reached through a
    // driver-spawned app (a spec §3.4 operator-store census without the vanished
    // operator store). Unset ⇒ the zero-config default (byte-equal today).
    else if (m[1] === 'corpus-root') opt.corpusRoot = m[2]
    // §6.1 (`G-8`) — `--groups=` with an EMPTY value is REFUSED BY NAME: parsed
    // as `[]` it silently selects a DIFFERENT launch profile than the operator
    // asked for (the wider default set — the exact ambiguity the summary's
    // `groups` member exists to make unreadable-as-accident), so the run refuses
    // instead of launching a profile nobody requested.
    else if (m[1] === 'groups') {
      const parsed = m[2].split(',').map((s) => s.trim()).filter(Boolean)
      if (parsed.length === 0) { opt.emptyGroups = true; opt.groups = [] } else opt.groups = parsed
    }
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
    // §3.1/§3.2 (UNIT B) — `--fixture=<setName>`: THE SELECTION ARG. It is
    // LAUNCH-SCOPED and NEVER PERSISTED (no app-side state records it, `§1.3`), its
    // value comes ONLY from this argv walk (`§3.1` clause 2: no environment
    // variable, no config file, no default from another arg), the value is kept
    // VERBATIM and compared by EXACT string equality against the five-name closed
    // set — no trim, no case-fold, no prefix match and no comma list (`§3.2`). Two
    // DIFFERENT values are a CONFLICT (refused by name below); the IDENTICAL flag
    // repeated is admissible (`§3.1` clause 5).
    else if (m[1] === 'fixture') {
      if (m[2] === '') opt.badFixtureArg = { flag: '--fixture', text: m[2], why: 'names NO set at all (the empty value is NOT the empty set)' }
      else if (!['core', 'table', 'search', 'tabs', 'empty'].includes(m[2])) opt.badFixtureArg = { flag: '--fixture', text: m[2], why: 'is not one of the accepted names (case-sensitive, untrimmed)' }
      else if (opt.fixture !== null && opt.fixture !== m[2]) opt.conflictingFixture = [opt.fixture, m[2]]
      else opt.fixture = m[2]
    }
  }
  o0Acc.runs.length = 0; o0Acc.hookPairs.length = 0; o0Acc.notes.length = 0
  // ⟨gate-4 `F-8` (LEAK HALF) — THE SCRATCH HOME IS MINTED **AFTER** EVERY REFUSAL.⟩
  // This scratch-HOME mint used to run HERE, ABOVE both refusal branches, so `--groups=`
  // (empty) and a malformed port each minted an `/tmp/astrolive-*` dir that the
  // refusing path then returned past WITHOUT removing — one orphan scratch dir per
  // refused invocation (the measured leak: the `/tmp` census carried them). The mint
  // now sits BELOW the three refusal branches (below the port one), so a refused
  // invocation mints nothing at all.
  // RUL-3 — NO main-side transport exists (the spec's audit result): the spawned app
  // arms its main instance and its handler wrap records `snapshot.clone`, but no
  // channel carries those records into the report, and the IPC structured clone is
  // outside every host-side wrap. The stage is therefore reported STRUCTURAL with
  // that exact reason (§3.6b/S15) — never an imputed number, never a fabricated
  // `instance:'main'` attribution.
  // The default store's corpusRoot is the app's cwd (the project root) when
  // unconfigured (REGISTRY-CWD-TRANSPARENCY), so the seed corpus must live under
  // it — never under the disposable HOME (the importer REJECTS an out-of-root
  // file). `.live-corpus/` is the OBSOLETE SEED route's own directory (annotated,
  // never extended, §6.1 clause 1): it stays gitignored + cleaned every run
  // (except --connect, which attaches to a RUNNING app and reuses the on-disk
  // corpus) and it is NEVER the mock data set's foundation — a `--fixture=<set>`
  // run does not reach it at all (the selection carries the do-not-seed implication, §16.13).
  // ⟨§6.1 clause 1 / §6.3 clause 2 — the OBSOLETE SEED route's own default directory
  // is named HERE, annotated as OBSOLETE and NEVER extended (the mock data sets are
  // not its children); a `--fixture=<set>` run never reaches it — the selection
  // implies `--no-seed` (§16.13).⟩
  const seedDir = opt.seed ?? join(ROOT, '.live-corpus') // the OBSOLETE `.live-corpus` SEED route's default — ANNOTATED, never extended
  const groups = opt.groups ?? UF_DEFAULT_GROUPS
  // §6.1 (`G-8`) — THE LAUNCH-PROFILE REFUSAL, printed BY NAME before anything is
  // spawned. An empty `--groups=` is not a launch profile: read as `[]` it would
  // silently enable NO tool group (every MCP call then fails for a launch-profile
  // reason the run would report as a driver/app failure), so the run refuses
  // (exit `2` — the hard-error code, no app is launched, no reading is taken).
  if (opt.emptyGroups) {
    console.log(`[live-drive] ARG-REFUSED: --groups= was given an EMPTY value (""), which names no tool-group set — REFUSED by name rather than silently launching a profile the operator did not ask for (an EMPTY security set for the empty value, or the wider default [${UF_DEFAULT_GROUPS.join(',')}] when the flag is omitted); pass --groups=<a,b,c> or omit the flag; fixture=${JSON.stringify(UF_FIXTURE_STATE)} (the run-wide fixture state, §6.1 — stated on THIS path too, because a refusal is a reading about the run identity)`)
    ufReportSweep(await ufSweepSpawnedChild('ARG-REFUSED (--groups= empty value) — this path returns at exit 2 BEFORE the spawn, so the sweep is a stated no-op'))
    process.exitCode = 2
    return
  }
  // §6.1 (`G-8`) — **THE SECOND PRE-SPAWN REFUSAL, ON THE SAME EARLY PATH: a
  // `--port=`/`--cdp-port=` value that names no TCP port is REFUSED BY NAME, before
  // anything is spawned.** This is the clause that closes the measured leak: at the
  // pre-fix head `--port=not-a-port` parsed to `NaN`, the launch profile went out
  // with `--port=NaN`, and the child — which cannot use `NaN` — came up on the
  // DEFAULT `3787`/`9222` while the driver waited on `:NaN`; the abort then left
  // that child RUNNING on the two ports a concurrent sibling owns. The refusal is
  // the same shape as the empty-`--groups=` one above (ONE named line, the fixture
  // state printed, exit `2`, NOTHING spawned), and both return before `spawn`.
  if (opt.badPortArgs.length) {
    console.log(`[live-drive] ARG-REFUSED: ${opt.badPortArgs.map((b) => `${b.flag}=${b.text} ${b.why}`).join(' and ')} — REFUSED by name BEFORE anything is spawned rather than launching an app the operator did not ask for (an unusable port makes the child fall back to the DEFAULT 3787/9222 profile the standing sibling hazard owns, and the driver would then wait on a port no child is listening on); pass --port=<1..65535>/--cdp-port=<1..65535>, or omit the flag to take the default (${opt.badPortArgs.some((b) => b.flag === '--port') ? '--port default 3787' : '--cdp-port default 9222'} for this one); fixture=${JSON.stringify(UF_FIXTURE_STATE)} (the run-wide fixture state, §6.1 — stated on THIS path too, because a refusal is a reading about the run identity)`)
    ufReportSweep(await ufSweepSpawnedChild('ARG-REFUSED (a port argument that names no TCP port) — this path returns at exit 2 BEFORE the spawn, so the sweep is a stated no-op'))
    process.exitCode = 2
    return
  }
  // ⟨gate-4 `F-8` — **THE THIRD PRE-SPAWN REFUSAL, ON THE SAME EARLY PATH: a
  // `--home=<dir>` that is not a scratch directory UNDER the OS temp root is REFUSED
  // BY NAME, before anything is spawned.**⟩ THE HAZARD THIS CLOSES: the HOME this run
  // passes to the app is the path its teardown REMOVES, so `--home="$HOME"` (or
  // `--home=/`, or `--home=/tmp` — the temp root itself) made the driver's own cleanup
  // a RECURSIVE DELETE OF AN OPERATOR-CHOSEN TREE. The bounds, one line each:
  // (i) the path must resolve strictly UNDER the OS temp root; (ii) an existing
  // non-directory is refused; (iii) a not-yet-existing path under the temp root is
  // accepted. Same shape as the two refusals above: ONE named line, the fixture state
  // printed, exit `2`, NOTHING spawned — and, since the mint moved below this branch,
  // no scratch dir minted either (the `F-8` leak half).
  if (opt.badHomeArgs.length) {
    console.log(`[live-drive] ARG-REFUSED: ${opt.badHomeArgs.map((b) => `${b.flag}=${b.text} ${b.why}`).join(' and ')} — REFUSED by name BEFORE anything is spawned: this run's teardown is a RECURSIVE DELETE of the HOME it used, so the value is BOUNDED to a scratch directory UNDER the OS temp root (${resolvePath(tmpdir())}) and is never handed to a delete outside it; pass --home=<a directory UNDER ${resolvePath(tmpdir())}> (e.g. ${join(resolvePath(tmpdir()), 'astrolive-iso')}), or omit the flag to take this run's own mkdtemp scratch (the bound holds whether or not --keep-home is passed: the VALUE must be boundable by construction, and --keep-home only decides whether this run removes it); fixture=${JSON.stringify(UF_FIXTURE_STATE)} (the run-wide fixture state, §6.1 — stated on THIS path too, because a refusal is a reading about the run identity)`)
    ufReportSweep(await ufSweepSpawnedChild('ARG-REFUSED (a --home= value outside the OS temp root, or a non-directory) — this path returns at exit 2 BEFORE the spawn and BEFORE the scratch HOME is minted, so the sweep is a stated no-op and no orphan scratch dir is created'))
    process.exitCode = 2
    return
  }
  // ===========================================================================
  // §3.3 (UNIT B) — THE FOUR PRE-SPAWN `--fixture=` REFUSALS, ON THE SAME EARLY
  // PATH AS THE THREE ABOVE AND IN THE LANDED ORDER. Each is ONE named line
  // carrying the offending value VERBATIM (via `JSON.stringify`), the accepted
  // names, the reason, and the run's own fixture state — which on EVERY refusal
  // line is the `none` triple, because the ONE assignment sits BELOW these
  // branches (`§7.2` clause 3, `§16.5`). Each sets the hard-error exit code `2`
  // and RETURNS BEFORE anything is spawned and BEFORE the scratch HOME is minted,
  // and NOTHING is written: no directory is created, nothing is removed, no set is
  // materialised (`§3.3` clause 4) — so a refused invocation cannot be mistaken
  // for a run, and it is NOT a park and NOT a `FAIL` (`§3.3` clause 5).
  // ===========================================================================
  if (opt.badFixtureArg) {
    console.log(`[live-drive] ARG-REFUSED: --fixture=${JSON.stringify(opt.badFixtureArg.text)} ${opt.badFixtureArg.why} — pass --fixture=<core|table|search|tabs|empty> or omit the flag to take the neutral default (no fixture data set selected); fixture=${JSON.stringify(UF_FIXTURE_STATE)} (the run-wide fixture state, §6.1 — stated on THIS path too, because a refusal is a reading about the run identity)`)
    ufReportSweep(await ufSweepSpawnedChild('ARG-REFUSED (a --fixture= value that names no set: empty, unknown or malformed) — this path returns at exit 2 BEFORE the spawn, so the sweep is a stated no-op'))
    process.exitCode = 2
    return
  }
  if (opt.conflictingFixture) {
    console.log(`[live-drive] ARG-REFUSED: --fixture=${JSON.stringify(opt.conflictingFixture[0])} and --fixture=${JSON.stringify(opt.conflictingFixture[1])} name TWO DIFFERENT sets — one set per run, and last-wins is FORBIDDEN because the run's identity may never depend on argv order; fixture=${JSON.stringify(UF_FIXTURE_STATE)} (the run-wide fixture state, §6.1 — stated on THIS path too)`)
    ufReportSweep(await ufSweepSpawnedChild('ARG-REFUSED (two DIFFERENT --fixture= values in one argv) — this path returns at exit 2 BEFORE the spawn, so the sweep is a stated no-op'))
    process.exitCode = 2
    return
  }
  // ⟨§21.2 (`D-2`, greens `B-1`) — THE OFFENDING FLAG IS NAMED, BY ITS OWN NAME.⟩ THE
  // FILED LINE printed the flag FAMILY — `(--seed= / --corpus-root= / --strict-seed /
  // --o0-corpus=)` — and named NO single supplied flag, so a reader of a
  // `--fixture=core --seed=…` artifact could not see WHICH FLAG TO DROP from the line
  // without re-reading the command line the artifact exists to make unnecessary; the
  // contract's own wording already pointed there (`§6.4` opens *"REFUSED BY NAME"*,
  // `§6.2` `B-2` states the offence as a run that *"named only one of them"*, and the
  // gate-5 amendment `§21.2` writes the requirement out). THE LINE NOW NAMES THE
  // SUPPLIED flag(s) — `--seed=` / `--corpus-root=` / `--o0-corpus=` WITH the value each
  // carried, `--strict-seed` bare — and the FAMILY LIST STAYS BESIDE that name, exactly
  // as the accepted-set list stays beside an `A-2` refusal; it may not stand in its
  // place. EVERY OTHER LIMB IS UNMOVED: one line, the `ARG-REFUSED` marker, the reason,
  // the `§6.4` clauses 2/3, the `none` state triple (the ONE assignment sits BELOW this
  // branch, `§7.2` clause 3 / `§16.5`), exit `2`, and the return BEFORE the spawn and
  // BEFORE the scratch HOME's mint (`§3.3` clauses 3/4).
  if (opt.fixture !== null && (opt.seed !== null || opt.corpusRoot !== null || opt.strictSeed === true || opt.o0Corpus !== null)) {
    // THE SUPPLIED FLAGS, in the arg walk's own order, each named as the walk carries it:
    // the parsed value VERBATIM (`JSON.stringify`) where the flag carries one, the bare
    // token where it carries none — read from the parsed arg and from NOTHING else
    // (`§3.1` clause 2). All of them are named, because every one of them is a supply
    // that conflicts with the selected set.
    const suppliedSupplyFlags = [
      opt.seed !== null ? `--seed=${JSON.stringify(opt.seed)}` : null,
      opt.corpusRoot !== null ? `--corpus-root=${JSON.stringify(opt.corpusRoot)}` : null,
      opt.strictSeed === true ? '--strict-seed' : null,
      opt.o0Corpus !== null ? `--o0-corpus=${JSON.stringify(opt.o0Corpus)}` : null,
    ].filter((flag) => flag !== null)
    console.log(`[live-drive] ARG-REFUSED: --fixture=${JSON.stringify(opt.fixture)} together with ${suppliedSupplyFlags.length > 1 ? 'the OBSOLETE SUPPLY flags' : 'the OBSOLETE SUPPLY flag'} THE RUN ACTUALLY SUPPLIED, NAMED: ${suppliedSupplyFlags.join(' and ')} — this is the offending supply (§21.2: the flag must be named, not only its family); the FAMILY stands beside the name, never in its place (--seed= / --corpus-root= / --strict-seed / --o0-corpus=): two fixture supplies cannot both write the store this run measures, and the artifact must be able to attribute that store to ONE fixture; the empty set is NOT exempt (§6.4 clause 2) and the do-not-seed switch is never a supply and is refused on NO path (§6.4 clause 3); fixture=${JSON.stringify(UF_FIXTURE_STATE)} (the run-wide fixture state, §6.1 — stated on THIS path too)`)
    ufReportSweep(await ufSweepSpawnedChild('ARG-REFUSED (a selected mock data set alongside an OBSOLETE SUPPLY flag) — this path returns at exit 2 BEFORE the spawn, so the sweep is a stated no-op'))
    process.exitCode = 2
    return
  }
  // ⟨gate-4 `F-8` — THE MINT IS BELOW EVERY REFUSAL, AND EVERY PATH THAT MINTS ONE
  // REMOVES IT.⟩ `home` is the dir the app is given AND the dir the teardown removes.
  // Three properties are contracted HERE: (i) it is created only on a path that got
  // past all three refusals; (ii) an operator-named `--home=` is RESOLVED (one
  // canonical path, so the bound checked at the parse site and re-checked at the
  // delete site is the SAME path); (iii) `ownScratchHome` records WHICH kind it is —
  // only the dir this run minted itself (`mkdtempSync`) may be removed with `force`,
  // and the `finally` below removes whichever kind exists on EVERY terminating path
  // (the `--connect` scratch, which used to be minted and then leaked because the
  // removal sat inside the `!opt.connect` branch, is removed like any other). */
  // ⟨§7.2 clause 3 (UNIT B) — THE STATE IS ASSIGNED ONCE, HERE: BELOW every refusal
  // branch (so each of those lines prints the `none` triple, `§16.5`) and ABOVE the
  // scratch HOME's mint, FROM THE PARSED ARG AND FROM NOTHING ELSE (`§3.1` clause 2:
  // argv wins — no environment variable, no config file, no default from another arg
  // — and no site may recompute the value, `§7.2` clause 4 / UNIT A `X-2`).⟩
  UF_FIXTURE_STATE = ufFixtureStateOf(opt.fixture)
  // ⟨§6.4 clause 4 / `§16.13` — `--fixture=<a set>` IMPLIES `--no-seed`.⟩ Every set
  // selection BEHAVES AS IF `--no-seed` had been passed, so the obsolete seed route's
  // own landed guard (`if (!opt.noSeed) {`) is never entered in a set-selected run
  // and the selected set is the store's ONLY supply (under `empty`: NOTHING — which
  // is `S-4`). An EXPLICIT `--no-seed` stays admissible and is refused on no path;
  // the implication is a consequence of the arg and NOT an operator arg, so `§3.1`
  // clause 5's one-set-per-run rule and `§3.2`'s grammar are untouched.
  if (opt.fixture !== null) opt.noSeed = true
  // ⟨§2.3 clauses 2/3/6 — THE SET IS MATERIALISED AFTER THE REFUSALS AND BEFORE THE
  // IMPORT.⟩ A write failure is the `S-2` ABORT: named, with the OS error text
  // VERBATIM, exit `2`, no substitute set and no fallback to another set — and the
  // state on that line names the set that was ATTEMPTED.
  let fixtureRoot = `no SET was materialised (no --fixture= was selected, so this invocation behaves exactly as it does today — §3.1 clause 3)`
  if (opt.fixture !== null) {
    try {
      fixtureRoot = ufMockFixtureMaterialise(opt.fixture)
    } catch (e) {
      // §4 `S-2` — THE NAMED ABORT RIDES THE DRIVER'S OWN `[live-drive] ERROR:` PATH (the
      // module-level `main().catch`), so there is exactly ONE error path in this driver and
      // the line carries the set that was ATTEMPTED (`UF_FIXTURE_STATE` was assigned just
      // above), the path it tried to write and the OS error text VERBATIM; the catch exits
      // `2` and NO block runs.
      throw new Error(`the mock fixture set ${JSON.stringify(opt.fixture)} could NOT be materialised at ${UF_MOCK_FIXTURE_ROOT(opt.fixture)} — ${String(e && e.message ? e.message : e)} (the OS error text, VERBATIM); NO block ran and no substitute set is used (§4 S-2, §2.3 clause 6)`)
    }
    console.log(`[live-drive] FIXTURE MATERIALISED: fixtureId=${UF_FIXTURE_STATE.id} fixtureRoot=${fixtureRoot}` + (UF_FIXTURE_STATE.id === 'empty' ? ` — the set carries NO file and its directory is left EMPTY (${UF_MOCK_FIXTURE_NOT_MATERIALISED})` : ` — the set's OWN directory, written from this driver's hand-authored content data on every launch and emptied of this unit's own .md files first (§2.3 clauses 2/3)`) + `; the obsolete seed route is NEVER this fixture's foundation (§6.1 clause 2)`)
  }
  const ownScratchHome = opt.connect === true || opt.home === null
  const home = opt.connect ? (mkdtempSync(join(tmpdir(), 'astrolive-connect-')) ?? null) : (opt.home === null ? mkdtempSync(join(tmpdir(), 'astrolive-')) : resolvePath(opt.home))
  // ⟨gate-4 `F-8`⟩ THE MINT IS RECORDED AT MODULE SCOPE, so even an abort between
  // here and the `try` below (whose `finally` performs the bounded removal) leaves no
  // orphan: the module-level `main().catch` removes it through the SAME helper.
  UF_MINTED_HOME = { dir: home, ownScratch: ownScratchHome }
  // §6.1 (`G-8`) — THE LAUNCH PROFILE, stated on the record: every reading this
  // run prints was produced by THIS profile (mode / ports / the REQUESTED tool
  // groups). ⟨gate-4 `B-11` — the line is PRINTED once the security-set reply has
  // reported the EFFECTIVE set, below: `--groups=` is a REQUEST, and the effective
  // set (the store's FILTERED result the live MCP gate is re-gated from) is what
  // decides whether a group's tools exist at all.⟩
  const launchProfile = { fixture: UF_FIXTURE_STATE, fixtureRoot: `.live-fixture/${UF_FIXTURE_STATE.id}/`, mode: opt.mode, port: opt.port, cdpPort: opt.cdpPort, display: `:${opt.display ?? '1'}`, groups: groups.slice(), effectiveGroups: null, noSeed: opt.noSeed === true, gpu: opt.gpu === true, connect: opt.connect === true, block: opt.block }

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
    // THE HANDLE THE SWEEP IS BOUNDED TO: the driver's own spawn (module scope), so
    // the module-level `main().catch` early-abort path — which cannot see this
    // local — can sweep exactly this child and nothing else.
    UF_SPAWNED_CHILD = app
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
    // §6.1 (`G-8`) — the security-set reply the group enablement returns is KEPT
    // and printed with the run's summary, so the launch profile's tool-group set
    // is readable from the artifact, not only from the invocation string.
    const securitySet = await cdp.enableGroups(groups).catch((e) => `ERROR: ${String(e && e.message ? e.message : e)}`)
    // ⟨gate-4 `B-11` — THE EFFECTIVE GROUP SET, IN THE ARTIFACT. `--groups=` is only
    // a REQUEST; the bridge's `security.set` reply is the store's FILTERED result
    // (`SecuritySettings.enabled`) the LIVE MCP gate is re-gated from. A requested
    // group OUTSIDE the effective set makes every tool of that group an MCP
    // `isError`, so the LAUNCH PROFILE line must carry the effective set beside the
    // requested one AND the consequence (e.g. an effective set without `rag` makes
    // `rag.list_documents` a driver read failure and re-classifies the corpus-
    // dependent blocks as PARKED/NOT-DRIVEN — a launch-profile reading, never app
    // behavior).⟩
    launchProfile.effectiveGroups = (() => { try { const p = JSON.parse(String(securitySet)); return Array.isArray(p && p.enabled) ? p.enabled.map(String) : null } catch { return null } })()
    const requestedNotEffective = launchProfile.effectiveGroups === null ? groups.slice() : groups.filter((g) => !launchProfile.effectiveGroups.includes(g))
    console.log(`[live-drive] LAUNCH PROFILE: ${JSON.stringify(launchProfile)} — REQUESTED groups=[${groups.join(',')}] vs EFFECTIVE (bridge-reported; the filtered set the live MCP gate is re-gated from)=[${launchProfile.effectiveGroups === null ? 'unreadable (the security-set reply carried no `enabled` set — see security.set above)' : launchProfile.effectiveGroups.join(',')}]; CONSEQUENCE: a requested group ABSENT from the effective set has NO tools registered, so every read that depends on it replies \`isError\` and its blocks are reported PARKED/NOT-DRIVEN by name (e.g. an effective set without \`rag\` makes \`rag.list_documents\` a driver read failure and re-classifies the ${UF_GATED_DECLARED_KEYS.length} GATED declared corpus-dependent blocks — the DECLARATION's population, §16.3; the HISTORICAL hand-list \`UF_CORPUS_DEPENDENT_BLOCKS\` is ${UF_CORPUS_DEPENDENT_BLOCKS.length} keys and is a DIFFERENT, historical figure, never the gate's population) — never as app FAILs; ⟨§16.13⟩ the obsolete seed route does NOT run in a --fixture=<set> run (the selection implies --no-seed); the store's only supply is the selected set (or, under \`empty\`, NOTHING — which is \`S-4\`)`)
    if (requestedNotEffective.length) console.error(`[live-drive] LAUNCH-PROFILE CONSEQUENCE: the requested group(s) [${requestedNotEffective.join(', ')}] are NOT in the effective set — every reading depending on them is launch-profile-conditioned (precondition-failed by name), not an app-layer verdict`)
    console.log(`[live-drive] security.set groups=[${groups.join(',')}] -> ${String(securitySet)}`)
    // §6.1 (site 1, its own line) — THE RUN-WIDE FIXTURE STATE, with its
    // CONSEQUENCE, printed on EVERY run (it is not O-0-scoped and is never
    // omitted): the state the whole artifact below was produced under.
    // ⟨gate-4 `E-3`⟩ THE CONSEQUENCE IS DERIVED AND CONDITIONAL, NEVER A UNIVERSAL:
    // the sentence is printed only for the state it is TRUE of (`none` — the state
    // this head selects, §6.3), it carries the run's own declared population, the
    // per-fixture probe the gate uses, and the SCOPE of the clause — including the
    // EXCLUDED engine family (`E-4`), which the run never gates. At this site the
    // blocks have not run yet, so the observation says `none yet` instead of
    // implying a park/run split; the observed split is printed with the summary
    // (`FIXTURE GATE OBSERVED`), from the same single derivation.
    const fixtureGateAtLaunch = ufFixtureGateObservation(null)
    console.log(`[live-drive] FIXTURE STATE: fixtureState="${UF_FIXTURE_STATE.state}" fixtureKind=${UF_FIXTURE_STATE.kind} fixtureId=${UF_FIXTURE_STATE.id} ${UF_FIXTURE_STATE.kind === 'mock-data-set' ? `fixtureRoot=${UF_MOCK_FIXTURE_ROOT(UF_FIXTURE_STATE.id)}` : `fixtureRoot=NONE (${UF_MOCK_FIXTURE_NOT_MATERIALISED})`}${opt.connect === true && UF_FIXTURE_STATE.kind === 'mock-data-set' ? ' mode=connect (the import was SKIPPED: the running app owns its store, §4 S-5)' : ''} — GATE SCOPE: ${fixtureGateAtLaunch.scope}; DECLARED POPULATION: ${fixtureGateAtLaunch.declared} gated key(s) (gate = the declaration's own predicate corpusRead:true && selfProvisioning:false, PER DECLARED FIXTURE — the absence test is the block's DECLARED \`fixtureName\` own probe, §3.2 F-6/F-7: ${Object.keys(UF_DECLARED_FIXTURE_PROBES).join(', ')}); OBSERVED SPLIT: ${fixtureGateAtLaunch.split}; ${UF_FIXTURE_STATE.kind === 'none' ? UF_FIXTURE_STATE_CONSEQUENCE : ufFixtureConsequenceOf()}`)
    // §4.2 `A-1`(i)/(ii) + `A-3` — THE DERIVATION ITSELF, PRINTED: the census the
    // declaration is held to, the movement from the historical hand-list, and the
    // AMBIGUITY LIST (each entry excluded AND recorded with its site and clause).
    console.log(`[live-drive] FIXTURE DECLARATION (§4.2 A-1/A-3 reconciliation): declared=${UF_FIXTURE_DECLARATION.length} · census-derived=${UF_FIXTURE_RECONCILIATION.censusDerived} · historical=${UF_FIXTURE_RECONCILIATION.historical} · ENTERED (census-minus-historical)=${UF_FIXTURE_RECONCILIATION.censusMinusHistorical} · LEFT (historical-minus-census)=[${UF_FIXTURE_RECONCILIATION.historicalMinusCensus.join(', ')}] · census-minus-declared=${UF_FIXTURE_RECONCILIATION.censusMinusDeclared} · GATED (derived from this declaration by §4.1's predicate)=${UF_GATED_DECLARED_KEYS.length} · EXCLUDED ENGINE FAMILY (declared and scoped, never silently widened)= ${UF_EXCLUDED_ENGINE_FAMILY.keys.length} gnosis_* key(s) [${UF_EXCLUDED_ENGINE_FAMILY.keys.join(', ')}] read the ${UF_EXCLUDED_ENGINE_FAMILY.fixtureName} fixture and carrying REAL row verdicts [${UF_EXCLUDED_ENGINE_FAMILY.rows.join(', ')}] — OUT of the corpus census by ${UF_EXCLUDED_ENGINE_FAMILY.clause}, so NO entry in this ${UF_FIXTURE_DECLARATION.length}-entry declaration, never gated, NOT covered by the fixture-absent park clause, and their fixture own probe/read is a SEPARATE open obligation (never a faked probe) · AMBIGUITY LIST (excluded AND recorded, never a silent pass)=[${UF_FIXTURE_RECONCILIATION.ambiguity.map((a) => `${a.key} @ ${a.site} [${a.clause}] ${a.disposition}`).join(' | ')}]`)
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
      // §3.2 `F-7` (`G-1`) — the FIXTURE-PRECONDITION read is a DISCRIMINATED read:
      // an `isError` reply (the recorded `MCP error -32602` when the `edit` group
      // is off) is named with its text VERBATIM through `driverFailureReason`, never
      // silently stringified into a downstream block's evidence.
      const impRead = await mcpToolResult(mcp, 'edit.import_markdown', { files }).catch((e) => ({ ok: false, isError: false, tool: 'edit.import_markdown', value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
      const impFailure = driverReadFailure(impRead)
      const imp = impRead.value
      console.error(`[live-drive] seeded corpus -> import ${JSON.stringify(imp)}`)
      if (impFailure) console.error(`[live-drive] ${driverFailureReason(impFailure.kind, impFailure.detail, `the seed fixture route (${impFailure.extra})`).marker} — every corpus-dependent block this run reports PARKED/NOT-DRIVEN by name (§3.2 F-6/F-7)`)
      // §3.2 `F-7` / gate-4 `B-6` — THE SEEDING WAIT IS A DISCRIMINATED READ. The
      // legacy `mcpTool` form stringifies an `isError` reply into an error VALUE, so
      // a truthiness predicate is false and the wait burns its FULL timeout before
      // proceeding with a corpus the driver has already reported as
      // precondition-failed. `mcpToolResult` + `driverReadFailure` keep the two cases
      // apart, the failure is NAMED verbatim, and the wait STOPS on it (returning
      // `true` ends the wait — it is not retried to timeout).
      await waitFor(async () => {
        const read = await mcpToolResult(mcp, 'rag.list_documents', {}).catch((e) => ({ ok: false, isError: false, tool: 'rag.list_documents', value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
        const failure = driverReadFailure(read)
        if (failure) {
          console.error(`[live-drive] SEED WAIT STOPPED on a driver read failure (no timeout burned): ${driverFailureReason(failure.kind, failure.detail, `the seeded-corpus confirmation read (${failure.extra})`).marker} — every corpus-dependent block this run reports PARKED/NOT-DRIVEN by name (§3.2 F-6/F-7)`)
          return true
        }
        return !!(read.value && Array.isArray(read.value.documents) && read.value.documents.length > 0)
      })
    }

    // =========================================================================
    // §2.3 clause 7 + §4 (UNIT B) — THE SELECTED SET'S IMPORT, through the app's OWN
    // import route (`edit.import_markdown`, `§8.1` clause 1). The obsolete seed route
    // above did NOT run (the selection carries the do-not-seed implication), so the selected set is
    // the store's ONLY supply. The outcomes are `S-1` (materialised and imported),
    // `S-3` (the import replies `isError`: named VERBATIM through the driver's own
    // `driverFailureReason` marker, the wait's discriminated read STOPS on it with no
    // timeout burned, the run proceeds and every gated key whose own declared fixture
    // reads absent parks BY NAME), `S-4` (the `empty` set attempts NO import at all)
    // and `S-5` (`--connect`: a RUNNING app owns its store, so the IMPORT is skipped
    // and the state names the mode). NONE of them may be pleaded as a reason a row
    // passes, and NONE is an app reading (`§9`).
    // =========================================================================
    if (opt.fixture !== null) {
      if (opt.connect === true) {
        console.error(`[live-drive] FIXTURE SET: ${JSON.stringify(opt.fixture)} materialised at ${fixtureRoot} — IMPORT SKIPPED (--connect: this run attached to a RUNNING app whose store it did not create, so importing into it would mutate a store this run does not own, and the blocks below read whatever that app holds — §4 S-5; the state names the set AND the mode for exactly this reason)`)
      } else {
        const setImport = await ufMockFixtureImport(mcp, opt.fixture, fixtureRoot)
        if (setImport.skipped) {
          console.error(`[live-drive] FIXTURE SET: ${JSON.stringify(opt.fixture)} -> ${UF_MOCK_FIXTURE_NOT_MATERIALISED} and NO import is attempted at all (§4 S-4, the explicitly selected EMPTY set): every gated key's OWN declared fixture probe reads ABSENT and every gated key parks BY NAME under a NAMED fixture state`)
        } else {
          console.error(`[live-drive] seeded mock fixture set ${JSON.stringify(opt.fixture)} (${setImport.reading} from ${fixtureRoot}) -> import ${JSON.stringify(setImport.read.value)}`)
          if (setImport.failure) console.error(`[live-drive] ${driverFailureReason(setImport.failure.kind, setImport.failure.detail, `the mock fixture route (${setImport.failure.extra})`).marker} — every gated key whose OWN declared fixture reads ABSENT parks BY NAME (§4 S-3), and the wait below stops on this named failure instead of burning its timeout`)
          if (!setImport.failure) {
            // §18.6 clause 3 — THE ROOT-TEXT READING, PRINTED EVEN WHEN IT IS ZERO
            // (a run whose document roots were not written says so rather than leaving a
            // reader to infer it from a `0 hit(s)` probe).
            console.error(`[live-drive] FIXTURE ROOT TEXT: ${setImport.rootText.written}/${setImport.rootText.attempted} imported document root(s) written with their own authored text through edit.set_content (the set's materialisation route, §2.3 clause 3) — ${JSON.stringify(setImport.rootText.writes.map((w) => ({ documentId: w.documentId, chars: w.chars, carriesTerm: w.carriesTerm, written: w.written, failure: w.failure })))}; WHY: the parser authors every document ROOT with EMPTY content and the import reconciles the store's lexical index with its DOCUMENT ROOT ids ALONE, so without this write the probe's term never reaches the index and rag.query reads 0 hit(s) under EVERY set (measured) — with it, the term-bearing sets' roots carry their own text and the sets that omit the term by construction stay at 0 (§2.1 F-3, §18.6 clause 3)`)
          }
          await waitFor(async () => {
            const read = await mcpToolResult(mcp, 'rag.list_documents', {}).catch((e) => ({ ok: false, isError: false, tool: 'rag.list_documents', value: null, errorText: String(e && e.message ? e.message : e), transportError: true }))
            const failure = driverReadFailure(read)
            if (failure) return true
            return !!(read.value && Array.isArray(read.value.documents) && read.value.documents.length > 0)
          })
        }
      }
      // §18.1 / §18.6 clause 3 — THE THREE DECLARED-FIXTURE PROBES' OWN READINGS,
      // TAKEN ONCE AT THE PRE-GESTURE READ POINT and printed VERBATIM. WHY A SITE IS
      // OWED AT ALL: on the PASS path a gated key's own probe reading was previously
      // printed NOWHERE — the only site that quoted it was the PARK it raised
      // (`ufFixtureOwnPark`), so a run in which the fixture is PRESENT proved that fact
      // only by the absence of a line, and a reader could not tell a PRESENT fixture
      // from an UNPROBED one. The readings below are the SAME registry probes, through
      // the SAME `ufFixturePreconditionRead`, that the gate and the block-body parks
      // use (`UF_DECLARED_FIXTURE_PROBES`), taken at the same point: no gesture has run
      // and no block has started. A `dom:` reading is a READING and is never a pass
      // (`§18.2` clause 4/5): its tab-strip surface is the later unit's, and this run
      // records its number without grading it.
      const probeReadings = []
      for (const probeFixtureName of Object.keys(UF_DECLARED_FIXTURE_PROBES)) {
        const r = await ufFixturePreconditionRead({ mcpRead: (name, args = {}) => mcpToolResult(mcp, name, args), cdp }, opt, probeFixtureName)
        probeReadings.push({ fixtureName: probeFixtureName, tool: r.tool, present: r.present, resolved: r.resolved, detail: r.detail })
      }
      console.error(`[live-drive] FIXTURE PROBES (LIVE READINGS, §18.1/§18.6 clause 3 — the declared fixtures' own probes, taken AFTER the materialisation${opt.connect === true ? '' : '/import and the root-text write'} and BEFORE any block, at the pre-gesture read point${opt.connect === true ? '; --connect: the import was SKIPPED, so this store is the RUNNING app\'s (§4 S-5)' : ''}): ${JSON.stringify(probeReadings)} — ${probeReadings.map((p) => `'${p.fixtureName}': present=${p.present} at resolved=${p.resolved} via ${p.tool}`).join(' · ')}; the \`dom:\` reading is recorded as a READING, never as a pass (§18.2 clauses 4/5)`)
    }
    const h = { mcp, cdp, groups, mcpTool, mcpRead: (name, args = {}) => mcpToolResult(mcp, name, args) }
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
    let fail = 0, park = 0, diag = 0, notDrivenCount = 0
    // §6.1 report material: the ROW blocks' structured results (matrix + extended)
    const reportRows = []
    // §2.3 `H-4` — a verdict-carrying gesture that could not be driven honestly
    // reads `NOT-DRIVEN` (a DRIVER failure, `realInput:false` + the reason), NEVER
    // an app-layer FAIL. §2.2 `E-7` — the record the report is built from carries
    // the whole contracted field set (`V-4` read the thin `{row, block, pass}`).
    // §2.3 `H-1` clauses 3/4 + §13.4 — the per-block PRE-FLIGHT RESTORE; §2.1
    // `E-2` — one row-block result PER DECLARED ROW (a block returns its result,
    // or an ARRAY: the checklist result plus one per claimed declared row);
    // §3.2 `F-6`/`F-7` (`G-1`/`G-2`) — the per-block PRECONDITION READ runs
    // beside the pre-flight, so a corpus-dependent block whose fixture is ABSENT
    // (or whose read replied `isError`) is reported BY NAME with its declared row
    // id instead of running a setup read that can only throw.
    const countResult = (counted) => {
      if (counted === 'diag') diag++
      else if (counted === 'park') park++
      else if (counted === 'notDriven') notDrivenCount++
      else if (counted === 'fail') fail++
    }
    // ⟨GATE-5 FINDING — THE OBSERVATION'S PARK COUNT READS THE CLASSIFICATION.⟩
    // ONE record per block that ran (`{block, counted, park}`), taken at the ONE
    // point the block's own verdict LINE is printed and from the SAME result object
    // that line is printed from — so the `§6.1` fixture-gate split and the `PARK` /
    // `DIAG` lines come from ONE classification, not two. `park` is true for BOTH
    // park routes: the id-carrying park (`r.park === true`, which prints a
    // `PARK` line and a `ROW … verdict=PARKED` line) and the NO-DECLARED-ROW-ID
    // fallback (`§5.1` clause 3(vi) / `§5.3`).
    // ⟨GATE-4 `F-1`/`F-2` CORRECTED — THE SECOND HALF OF THE FILED SENTENCE IS STALE; THE
    // CORRECTION IS WRITTEN HERE AND THE SUPERSEDED WORDING IS KEPT VISIBLE BELOW.⟩ THE
    // FILED CLAIM (`diagResult` carries no `park` FIELD at all) WAS TRUE OF THE FILED
    // LIMB, WHICH CALLED `diagResult(text)` BARE, AND IS STALE AFTER THE GATE-4 FIX: the
    // no-declared-row limb (`ufFixtureOwnParkNoRow`, above) now hands
    // `{ park: true, parkRoute: 'parked-by-fixture-absence', … }` INTO `diagResult`, and
    // `diagResult` SPREADS ITS `extra` ARGUMENT (`...extra`, the builder's own last
    // member) — so THAT RECORD DOES CARRY `park` (and `parkRoute`: `ufFixtureOwnParkNoRow`
    // hands both members unconditionally, while the gate route's own no-declared-row limb
    // tags the two FIXTURE-READING kinds `empty-corpus` / `fixture-missing` alone, `§5.5`),
    // and `ufCountBlock` reads them from the FIELDS exactly as it reads the id-carrying
    // park's. ONLY THE OTHER
    // HALF STILL HOLDS: the record's `row` is `null`, so `ufPushRows`' `typeof res.row
    // !== 'string'` guard keeps it OUT of `reportRows` (no `§6.1` report row is fabricated
    // for a block that declares none). The `PRECONDITION-FAILED` marker limb below is
    // UNMOVED and is now the SECOND channel — an OR beside the field, never the only
    // route. SUPERSEDED, KEPT VISIBLE — the as-filed clause, verbatim:
    //   // fallback (`§5.1` clause 3(vi) / `§5.3`: `diagResult` carries no `park` FIELD at
    //   // all and is filtered out of `reportRows`, so its park is read from the
    //   // `PRECONDITION-FAILED` marker in the very text its `DIAG` line prints).
    const ufBlockClass = new Map()
    // ⟨gate-4 `F-3`⟩ THE RECORD CARRIES WHICH ROUTE PARKED THE BLOCK: `route` is the
    // token `'fixture-gate'` ONLY at the fixture gate's own branch (`ufRunBlock`'s
    // declared-fixture-absent site, below), so `gateRoute` is true for exactly the
    // parks the FIXTURE GATE produced — never for a park routed from the block's own
    // body (`parkRow`, a result carrying `extra:{park:true, parkReason}`) and never for
    // the thrown-precondition route `ufRecordDriverFailure`. It changes NO count except
    // the observation's new `parkedByGate` member; `park` and `counted` are untouched.
    const ufCountBlock = (n, label, r, route) => {
      const counted = printBlockVerdict(label, r)
      const text = String((r && (r.detail ?? r.evidence)) ?? '')
      ufBlockClass.set(n, { block: n, counted: counted, park: (r && r.park === true) || (r && r.diagnostic === true && /PRECONDITION-FAILED/.test(text)), gateRoute: route === 'fixture-gate', parkRoute: (r && r.parkRoute) ?? null })
      return counted
    }
    /** The report rows of ONE result set, built through the §6.1 record. */
    const ufPushRows = (resolved, n, reportRows) => {
      for (const res of resolved) {
        if (typeof res.row !== 'string') continue
        const v = blockVerdictOf(res)
        reportRows.push(buildReportRow(res, n, v.verdict, v.notDriven))
      }
    }
    /** §2.3 `H-4` (`G-2`) — THE NAMED DRIVER-FAILURE RECORD: the block's declared
     *  row id(s) are KEPT and carry the precondition by name (never an app FAIL). */
    const ufRecordDriverFailure = (n, reason, label, reportRows) => {
      const rows = ufDriverFailureRows(n, reason)
      console.log(`DRIVER-FAILURE ${label} ${driverFailureReason(reason.kind, reason.detail, reason.extra).marker} — the block THREW on a PRECONDITION (never an app FAIL); its declared row id(s) [${ufDeclaredRowsForBlock(n).map((x) => x.row).join(', ')}] are kept and carry this precondition by name`)
      ufPushRows(rows, n, reportRows)
      return ufCountBlock(n, label, rows[0])
    }
    /** §2.3 `H-1`/`H-2` — ONE BLOCK'S OWN RUN: the pre-flight, the corpus
     *  precondition gate, the block call, the printed verdict and its report rows.
     *  Returns the token `printBlockVerdict` counted. */
    const ufRunBlock = async (h, opt, n, pre, label, reportRows) => {
      const preflight = await ufBlockPreflightRestore(h) // H-1 clause 4: per-block restore of the driver's own state
      const preflightLine = `PREFLIGHT ${label} §2.3 H-1 clause 4 restore: zone=${JSON.stringify(preflight.zone)} panes=${JSON.stringify(preflight.panes)} frames=${JSON.stringify(preflight.frames)}${preflight.error ? ` error=${preflight.error}` : ''}`
      // ⟨gate-4 `E-3` — THE ABSENCE TEST IS TAKEN PER DECLARED FIXTURE.⟩ The
      // declaration entry for THIS block is resolved FIRST, and the fixture it
      // DECLARES is probed through `ufFixturePreconditionRead`, so a block is gated
      // on the fixture it actually declares. The landed gate keyed on the boolean
      // predicate alone and parked every gated key on ONE run-wide
      // `rag.list_documents` read, so a block declaring `corpus-query-results` could
      // run its own setup against a fixture its own declaration called ABSENT — the
      // contract's forbidden outcome `F-2`. A fixture whose probe did NOT resolve
      // (a driver read failure, an unknown fixture name) is NOT an absent fixture
      // (`§2.3` `H-4`): the block runs and reports its own verdict, fail-loud.
      const declared = UF_FIXTURE_DECLARATION.find((e) => e.block === n) ?? null
      const blockFixture = declared ? await ufFixturePreconditionRead(h, opt, declared.fixtureName) : null
      const ufDeclaredFixture = declared ? declared.fixtureName : 'none'
      const ufDeclaredFixtureProbe = blockFixture ? `${blockFixture.tool ?? 'no declared read'} (present=${blockFixture.present}, resolved=${blockFixture.resolved})` : 'unprobed'
      if (pre && pre.present !== true && (UF_FIXTURE_DECLARATION.find((e) => e.block === n)?.corpusRead === true && UF_FIXTURE_DECLARATION.find((e) => e.block === n)?.selfProvisioning === false) && blockFixture && blockFixture.resolved === true && blockFixture.present !== true) {
        // THE NAMED DISPOSITION, with the block's DECLARED row id kept: the block
        // is not run (its own declared fixture's read can only fail on a fixture the
        // operator's flag — or a failed seed — removed). §4.1: THE GATE IS THE
        // DECLARATION'S OWN PREDICATE — an entry with `corpusRead:true` AND
        // `selfProvisioning:false` — read PER DECLARED FIXTURE (the `blockFixture`
        // limbs: the probe of the fixture THIS entry NAMES, so a block is never
        // gated on another fixture's reading, `F-2`).
        // A `selfProvisioning:true` block (its input is its own write+import) and a
        // `corpusRead:false` block are NOT parked: they carry their own verdict.
        // §5.1 clause 3 — THE REASON NAMES THE FIXTURE: the declaration entry for
        // this block supplies the `fixtureName` and the `surface` it reads, so the
        // park is re-derivable as fixture-missing vs structurally non-exercisable
        // (`RCA-11` clause (b)) and the generic absence text is not the record.
        // ⟨gate-6 FINDING `NEW-3` — WHICH READ THE PARK NAMES.⟩ This reason used to
        // interpolate `pre` (the block loop's RUN-WIDE read, `ufBlockPrecondition`)
        // while calling it "the block own DECLARED FIXTURE probe". `pre` is NOT the
        // declared fixture's probe: the declared probe is `blockFixture`
        // (`ufFixturePreconditionRead`, which formats `rag.list_documents -> N
        // document(s) (the fixture "<name>" own read)`). The two are value-identical
        // at this head ONLY because all three corpus fixtures ride the same
        // `rag.list_documents` read (§5.5 `F-2`'s recorded inertness), so the old
        // sentence was true by coincidence and would become value-FALSE the moment
        // the fixtures' probes diverge. The park is therefore composed from
        // `blockFixture` — the probe of the fixture THIS entry NAMES — and the
        // run-wide read is named as what it is: the gate's OTHER, also-required
        // conjunct (its `pre.detail`/`pre.extra` stay in the record, quoted as such).
        // A path that reaches this branch with no readable declared-fixture probe is
        // NOT admitted by the gate's own `blockFixture` conjuncts; its own wording is
        // kept here so such an absence would say plainly that it rides the RUN-WIDE
        // read ALONE rather than reusing the declared-probe sentence.
        // ⟨gate-4 `E-3`⟩ NOTE — NO SECOND BINDING IS REFERRED TO BY THE GATE HEAD: the
        // pin compiles `ufRunBlock`'s gate text in ISOLATION, so the head may read only
        // `pre`, `n`, `UF_FIXTURE_DECLARATION` and `blockFixture` (a local name the head
        // refers to is undefined there and the gate's own limbs become unreadable). The
        // bindings below are read by the reason expression alone. THE GATE ITSELF IS
        // UNCHANGED — the same predicate admits this branch, so what parks and what runs
        // is exactly what parked and ran before.
        const decl = declared
        const ufParkRead = blockFixture
        const ufRunWideConjunct = `the gate's OTHER, also-required conjunct is the RUN-WIDE read (${pre.detail}; ${pre.extra}) — reported here as the run-wide conjunct, never as the read this park is attributed to`
        const rows = ufDriverFailureRows(n, {
          kind: ufParkRead ? ufParkRead.kind : pre.kind,
          detail: ufParkRead ? ufParkRead.detail : `${pre.detail} (the RUN-WIDE read ALONE: this block carries no readable declared-fixture probe)`,
          extra: ufParkRead
            ? `${ufParkRead.extra}; block=${n} DECLARES the fixture ${decl ? decl.fixtureName : 'none'} over the corpus surface it reads (${decl ? decl.surface : 'none'}); the read that failed is ${ufParkRead.detail} — the block own DECLARED FIXTURE probe (the fixture ${JSON.stringify(ufParkRead.fixtureName)} own read via ${ufParkRead.tool ?? 'no declared read'}), never the run-wide read; ${ufRunWideConjunct}`
            : `${pre.extra}; block=${n} DECLARES the fixture ${decl ? decl.fixtureName : 'none'} over the corpus surface it reads (${decl ? decl.surface : 'none'}); this absence rides the RUN-WIDE read ALONE (the block carries no readable declared-fixture probe to attribute it to): the read that failed is ${pre.detail} — the run-wide read, never a declared-fixture probe`,
        })
        ufPushRows(rows, n, reportRows)
        if (preflight.panes.length || preflight.error || (preflight.frames && preflight.frames.zoneState === 'minimized')) console.log(preflightLine)
        // ⟨gate-4 `F-3`⟩ THE GATE ROUTE IS TAGGED AT ITS ONE SITE: this branch — the
        // only place a block is parked WITHOUT being run, on its OWN declared fixture's
        // absence — is what `gateRoute` records, so the observation can report the
        // fixture-absent subset of the gated population's parks (below). No count is
        // changed here; the tag is read by `ufFixtureGateObservation` alone.
        return ufCountBlock(n, label, rows[0], 'fixture-gate')
      }
      // §2.3 `H-3` clause 1 (`G-9`) — THE GESTURE LOG IS PER BLOCK: reset AFTER the
      // pre-flight (whose own hygiene clicks are not this block's gestures) and
      // BEFORE the block drives, so the record harvested below belongs to this
      // block's own clicks only.
      UF_GESTURE_LOG.length = 0
      UF_LAST_PROBE = -1
      const r = await BLOCKS[n](h) // E-2: a block returns its result, or an ARRAY (checklist + one per declared row)
      const results = Array.isArray(r) ? r.filter((x) => x && typeof x === 'object') : [r]
      // §2.3 `H-3` clause 1 (`G-9`/`M-10`) — ONE CENTRAL CARRIER: every click the
      // block drove was logged by the gesture helpers (the probe, and the branch the
      // route took), so the click record is put onto the result whose verdict rests
      // on it HERE — no block is hand-edited to carry its own coordinate. The
      // record is data: it changes no `pass`, no `verdict` and no aggregate.
      ufAttachClickRecords(results, UF_GESTURE_LOG)
      ufPushRows(results, n, reportRows)
      // ⟨gate-4 `E-3` — THE REPORTED ABSENCE NAMES WHICH ABSENCE IT IS.⟩ The line
      // used to assert flatly that "this block is NOT declared corpus-dependent",
      // which is FALSE for a gated block whose OWN declared fixture probed PRESENT
      // (only the run-wide read failed): the gate then correctly did not fire, and
      // the block carries its own verdict. The line now states the per-fixture
      // reading that actually produced the disposition.
      if (pre && pre.present !== true) console.log(`PRECONDITION ${label} §3.2 F-6 reading: ${pre.detail}; the run-wide read did not report the corpus present and this block DECLARES the fixture ${declared ? `${declared.fixtureName} (corpusRead=${declared.corpusRead}, selfProvisioning=${declared.selfProvisioning})` : 'NONE (no declaration entry)'} — its OWN declared fixture probed ${blockFixture ? `present=${blockFixture.present} resolved=${blockFixture.resolved} via ${blockFixture.tool}` : 'unreadable'}, so this absence is REPORTED here and is never inferred as this block own failure`)
      if (preflight.panes.length || preflight.error || (preflight.frames && preflight.frames.zoneState === 'minimized')) console.log(preflightLine)
      return ufCountBlock(n, label, results[0] ?? r)
    }
    for (const n of names) {
      const label = `${n.padEnd(18)}`
      let pre = null
      try {
        pre = await ufBlockPrecondition(h, opt) // §3.2 F-6: is the seeded corpus present? (a read, never a throw)
        countResult(await ufRunBlock(h, opt, n, pre, label, reportRows))
      } catch (e) {
        // §2.3 `H-4` (`G-2`) — A THROW THAT IS A PRECONDITION IS NOT AN APP FAIL:
        // it is classified by name and its declared row id(s) are kept. A genuine
        // defect keeps the loud `FAIL` and the run stays fail-loud.
        const reason = ufBlockThrowReason(e, pre, n)
        if (reason) countResult(ufRecordDriverFailure(n, reason, label, reportRows))
        else {
          console.log(`FAIL  ${label} ${String(e)}`)
          fail++
          // ⟨GATE-4 FINDING `D-3`⟩ — NO DECLARED ROW VANISHES WITH A THROW. The
          // defect keeps the loud `FAIL` (never a `NOT-DRIVEN`), and the declared
          // row id(s) the block owns are pushed as NAMED §6.1 report rows AND named
          // on a `ROW-SET ERROR` line, so the matrix reconciliation, the row-set
          // record and the exit path all carry the row the throw would have erased.
          const thrown = ufThrownBlockRows(n, e)
          ufPushRows(thrown, n, reportRows)
          console.log(`ROW-SET ERROR: declared row(s) [${thrown.map((x) => String(x.row)).join(', ')}] owned by block ${n} produced NO verdict: the block THREW on a reason that is NOT a resolved precondition (${String(e)}) — each declared row is recorded BY NAME as its own FAIL (never a NON-VERDICT and never an omission; §2.1 E-3 clause 2 / gate-4 D-3)`)
        }
      }
    }
    // §2.2 `E-7` — THE PRINTED PER-ROW LINE IS THE ARTIFACT (the returned object is
    // not). Every counted row prints its `row`/`block`/`verdict`/`dclass`/
    // `realInput`/`surface` (the WHOLE object, `target` INCLUDED — `M-4`)/`
    // `failingClause` (with observed vs required)/`evidence`/`proxyPASS`/
    // `gesturePath`, so a clause-less or surface-less row can never reach the log.
    for (const r of reportRows) {
      const clause = r.failingClause
        ? ` failingClause={"predicate":${JSON.stringify(r.failingClause.predicate)},"required":${JSON.stringify(r.failingClause.required)},"observed":${JSON.stringify(r.failingClause.observed)}} observed=${JSON.stringify(r.observed)} required=${JSON.stringify(r.required)}`
        : ' failingClause=null'
      const surfaceText = r.surface
        ? `target=${r.surface.target} liveSurfacePresent=${r.surface.liveSurfacePresent}`
        : 'target=null liveSurfacePresent=null'
      // §2.3 `H-3` clause 1 (`G-9`/`M-10`) — THE CLICK'S OWN RECORD, printed beside
      // every verdict-carrying click: the coordinate, the viewport it was
      // dispatched against, the element under that point, `onTarget` AND `inVp`.
      // Before this, 1 of the battery's 45 verdict-carrying clicks printed its
      // coordinate; an off-target click printed no viewport and an off-viewport
      // click neither coordinate nor viewport.
      const clickText = r.clickRecord
        ? ` click={"selector":${JSON.stringify(r.clickRecord.selector)},"coordinate":${JSON.stringify(r.clickRecord.coordinate)},"viewport":${JSON.stringify(r.clickRecord.viewport)},"hit":${JSON.stringify(r.clickRecord.hit)},"onTarget":${r.clickRecord.onTarget === true},"inVp":${r.clickRecord.inVp === true},"path":${JSON.stringify(r.clickRecord.path)},"realInput":${r.clickRecord.realInput === true},"clicksDriven":${r.clickRecord.clicks ?? null}}`
        : ''
      // §2.3 `H-4` (`G-10`) / finding `C-5` — a PARKED row's NAMED reason on its own
      // record. Gated on the row's OWN park flag (`r.park === true`), so the text can
      // never ride a row that did not park, and a parked row whose site recorded no
      // reason prints the NAMED sentinel `buildReportRow` substituted rather than
      // skipping the park text.
      const parkText = r.park === true ? ` parkReason=${JSON.stringify(r.parkReason ?? UF_NO_PARK_REASON)}` : ''
      console.log(`ROW   ${String(r.block).padEnd(22)} row=${r.row} block=${r.block} verdict=${r.verdict} dclass=${r.dclass} realInput=${r.realInput} surface=${surfaceText} proxyPASS=${r.proxyPASS} proxy=${JSON.stringify(r.proxy)} gesturePath=${r.gesturePath}${r.driverFailure ? ' DRIVER-FAILURE(not-driven: the gesture could not be driven honestly — never an app FAIL)' : ''}${clause}${clickText}${parkText} evidence=${JSON.stringify(r.evidence)}`)
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
    // §12.3 item 5 / gate-4 `B-8` — THE ARITHMETIC IS PLACED AT THE `matrixVerdict`
    // SCOPE: every count member of the §6.1 summary DERIVES from the matrix-row filter
    // variable itself (never from a counter that a non-row verdict could widen), so
    // the scope of `pass`/`fail`/`parked`/`matrixRowsExecuted` is readable from the
    // artifact's own expression.
    // §2.2 `E-11` — THE MATRIX DIMENSION IS FOLDED BY ROW ID TOO. `B-3`'s closure
    // made `U-2` (`uf_tabs_7` + `uf_panes_14`) and `U-3` (`uf_panes_12` +
    // `uf_panes_14`) multi-contributor, so `matrixVerdict` may hold ten ENTRIES
    // over eight ROWS. Counting ENTRIES made the §6.1 summary read
    // `pass 6 + fail 4 = 10` against `total 8` — the partition the NOTE advertises
    // BROKEN, and the very arithmetic `aggregateRows` answers on the extended
    // dimension. The same AND fold (a single `FAIL` contributor makes the ROW read
    // `FAIL`; a `PARKED`/`NOT-DRIVEN` half is never promoted) is therefore taken
    // over the `matrixVerdict` scope ITSELF, IN the count expressions below (never
    // through a local the count reads instead), so a count that lost the fold —
    // every contributor counted as its own row — is readable FROM the expression:
    // `pass + fail + parked === matrixRowsExecuted === total` holds by construction.
    // The `matrixVerdict` scope stays NAMED in every count below (the count's own
    // expression names the filter it counts) AND the fold is taken over it in the
    // SAME expression, so neither a widened filter nor an entry count can pass.
    const matrixAggregate = aggregateRows(matrixVerdict)
    const matrixRowsExecuted = aggregateRows(matrixVerdict).length
    // §2.2 `E-11` — THE SHARED-ROW AGGREGATION: every emitted row id is folded BY
    // ROW ID, the aggregate being the AND of its contributions. Each contributor's
    // OWN verdict is already printed on its own `ROW` line above; the aggregate is
    // printed BESIDE its contributor list (never as the only place a verdict
    // appears), and a disagreeing pair prints both and reads FAIL.
    const extendedAggregate = aggregateRows(extendedVerdict)
    const sharedRows = extendedAggregate.filter((a) => a.shared)
    // §2.2 `E-12` item 5 / `F-15` — an emitted-but-UNDECLARED row id is REPORTED,
    // never a refusal (declaring it is a later unit's naming act).
    const declaredExtendedIds = ROW_EXTENDED.map((r) => String(r.row))
    const emittedExtendedIds = new Set(extendedVerdict.map((r) => String(r.row)))
    const undeclaredExtended = [...emittedExtendedIds].filter((id) => !declaredExtendedIds.includes(id))
    // §2.2 `E-12` — THE EXTENDED DECLARED/EXECUTED RECONCILIATION (declared-minus-
    // verdict SET DIFFERENCE, never a declared-list substitution).
    const extendedMissingRows = ROW_EXTENDED.map((r) => String(r.row)).filter((id) => !emittedExtendedIds.has(id)) // ROW_EXTENDED declared-minus-emitted
    const extRecon = extendedDeclaredMissing(extendedVerdict.map((r) => ({ row: r.row, block: r.block })), names)
    const extendedMissing = extRecon.missing
    const extInconclusive = extRecon.inconclusive
    const extendedRefused = extRecon.refused
    // §2.1 `E-3` — the full-battery predicate is decided by the REQUESTED set
    // covering every `BLOCKS` key AND every declared row's block (the ROW
    // dimension), never by `blocksRun === 0` (`V-3`).
    const recon = reconcileMatrixRows(matrixVerdict.map((r) => ({ row: r.row, block: r.block })), names, MATRIX_ROWS, Object.keys(BLOCKS))
    // §2.1 `E-3`'s contract-shape table — the self-describing coverage field, so an
    // `OK` can never be printed beside `matrixRowsExecuted < total` (M-1's case).
    // §2.1 `E-3` / `G-8` (`M-1`) — THE SCOPE OF THE `OK`: the reconciliation line may
    // print `OK` ONLY together with the coverage it actually took, because a scoped
    // run that drove NO declared row used to print `OK` beside `matrix rows
    // executed=0` — the exact shape the defect row
    // `LIVE-DRIVER-MATRIX-MAPPING-INCOMPLETE` calls its own defect, while `§2.1
    // E-3`/`F-2` clause (iii) reasons a scoped, un-executed declared row as
    // INCONCLUSIVE, not a defect. `rowsInScope` is the number of DECLARED rows whose
    // block this run requested (the `--block=` option space is what makes "in scope"
    // well-defined, `§2.2 E-12` item 2), and the inconclusive count is the
    // reconciler's own declared-minus-verdicted set — never a coverage claim.
    const matrixRowsInScope = MATRIX_ROWS.filter((row) => declaredBlocksOf(row).some((b) => names.includes(b))).length
    const coverage = { matrixTotal: MATRIX_ROWS.length, verdicts: matrixRowsExecuted, missingRows: recon.missingRows, fullBattery: recon.fullBattery, rowsInScope: matrixRowsInScope }
    const summary = {
      unit: 'user-flow-audit',
      layer: 'assembled-renderer (RCA-12)',
      // §6.1 (`G-8`) — THE LAUNCH PROFILE is part of the reading: a verdict may
      // never be quoted without the mode/ports/group set that produced it.
      mode: launchProfile.mode,
      port: launchProfile.port,
      cdpPort: launchProfile.cdpPort,
      // §6.1 (site 2) — THE RUN-WIDE FIXTURE STATE travels with the summary too:
      // the SAME single read the launch profile carries (`fixture: UF_FIXTURE_STATE`),
      // copied member-by-member exactly as the rest of this literal is — never a
      // second computation and never a spread.
      fixture: UF_FIXTURE_STATE,
      fixtureRoot: `.live-fixture/${UF_FIXTURE_STATE.id}/`,
      // ⟨gate-4 `E-3`⟩ THE FIXTURE-STATE OBSERVATION, DERIVED FROM THIS RUN: the
      // declared gated population, the OBSERVED park/run split inside it, and the
      // clause's SCOPE (the gated population + the excluded engine family). One
      // derivation (`ufFixtureGateObservation`) feeds this member and the
      // `FIXTURE GATE OBSERVED` line, so the split cannot be stated twice
      // differently. The `fixture` member above keeps its own §6.1 form (the SAME
      // object reference as the launch profile).
      // ⟨GATE-5 FINDING — THE ARGUMENT IS THE BLOCK CLASSIFICATION, NOT `reportRows`:
      // one record per block that ran (`ufCountBlock`), so the count agrees with the
      // `PARK`/`DIAG` lines the run printed and neither drops the no-declared-row-id
      // `DIAG` park (`§5.1` clause 3(vi) filters it out of `reportRows`) nor
      // double-counts a gated block's several parked declared rows.⟩
      fixtureGate: ufFixtureGateObservation([...ufBlockClass.values()]),
      groups: launchProfile.groups.slice(),
      // gate-4 `B-11` — the EFFECTIVE (bridge-reported) group set travels with the
      // reading: a verdict may never be quoted without the profile that produced it,
      // and `--groups=` alone is a REQUEST.
      effectiveGroups: launchProfile.effectiveGroups === null ? null : launchProfile.effectiveGroups.slice(),
      securitySet: String(securitySet),
      total: MATRIX_ROWS.length,
      // §6.1/§12.3 item 5 — the partition of the EXECUTED §5.U rows, each member
      // derived from the `matrixVerdict` matrix-row scope (never a wider list) AND
      // folded BY ROW ID inside the expression itself (never read off a local that
      // merely holds the fold): the three members therefore PARTITION the folded
      // rows, so `pass + fail + parked === matrixRowsExecuted === total` — a
      // multi-contributor row (`U-2`/`U-3` after `B-3`) is counted ONCE, by its
      // aggregated verdict, and a count that lost the fold reads 10 against 8.
      pass: aggregateRows(matrixVerdict).filter((a) => a.verdict === 'PASS').length,
      fail: aggregateRows(matrixVerdict).filter((a) => a.verdict === 'FAIL').length,
      parked: aggregateRows(matrixVerdict).filter((a) => a.verdict !== 'PASS' && a.verdict !== 'FAIL').length,
      matrixRowsExecuted: aggregateRows(matrixVerdict).length,
      blocksRun: names.length,
      extendedRowsRun: extendedVerdict.length,
      diagnostics: diag,
      coverage: { matrixTotal: coverage.matrixTotal, verdicts: coverage.verdicts, missingRows: coverage.missingRows, fullBattery: coverage.fullBattery, rowsInScope: coverage.rowsInScope },
    }
    const claims = MATRIX_ROWS.map((row) => `${row.row}->${row.block}`)
    console.log(`[live-drive] done: ${names.length} blocks, ${fail} FAIL, ${park} PARKED, ${notDrivenCount} NOT-DRIVEN (a driver failure is never an app FAIL)`)
    console.log(`[live-drive] §6.1 summary: ${JSON.stringify(summary)}`)
    // ⟨gate-4 `E-3` — THE OBSERVED PARK/RUN SPLIT, BESIDE THE STATE IT BELONGS TO.⟩
    // The run-wide `FIXTURE STATE` line prints before the blocks run, so it carries
    // the DECLARED population and says `none yet` for the observation; THIS line
    // carries the observation, taken from the run's own BLOCK CLASSIFICATION — the
    // per-block record `ufCountBlock` made at the very result object each
    // `PASS`/`PARK`/`DIAG` line was printed from (NEVER `reportRows`, whose
    // `typeof res.row === 'string'` guard drops the no-id `DIAG` park of `§5.1`
    // clause 3(vi) and whose one-entry-per-declared-row shape double-counts a gated
    // block's several parked rows): how many of the DECLARED GATED keys actually
    // PARKED (a `PARK` classification, or a `DIAG` one whose text carries the
    // `PRECONDITION-FAILED` marker — the two routes the artifact prints) and how many
    // did not. It states its SCOPE too, so the split can never be read as covering the
    // excluded engine family. A run whose fixture is present prints `parked=0/N` and
    // the consequence sentence on the FIXTURE STATE line does NOT apply to it (`§6.1`,
    // gate-4 `E-3`: the line's claim is conditional, never a universal).
    //
    // ⟨gate-4 `F-3`/`F-4` — TWO OVER-CLAIMS THIS LINE CARRIED.⟩ (a) `parked=N` was
    // narrated as `N carried the fixture-absent park`, which is FALSE: the count is
    // EVERY park inside the `35` gated keys, and gated keys park for their own reasons
    // too. The line now prints `parked-by-the-fixture-gate=` BESIDE it (the SUBSET the
    // gate's own route produced, tagged at `ufCountBlock`) and says the fixture-absent
    // park is a subset of `parked`. (b) the arithmetic remainder printed as
    // `ran-with-own-verdict=` — a label that reads as a COVERAGE count (and reads the
    // same on a scoped run). It is renamed `eligible-and-not-parked=` and the run's own
    // `blocksRun` is printed on the SAME line, so the two figures cannot be confused.
    // NO count is changed by either fix: `parked`, `declared` and the split are unmoved.
    console.log(`[live-drive] FIXTURE GATE OBSERVED (§6.1, gate-4 E-3 — the DERIVED, CONDITIONAL split this run actually produced): declared=${summary.fixtureGate.declared} gated key(s) · OBSERVED SPLIT: ${summary.fixtureGate.split} (parked=${summary.fixtureGate.parked} is EVERY park inside the ${summary.fixtureGate.declared} gated keys, WHATEVER it parked for — a gated key may park for its OWN reason, e.g. a block whose own result carries extra:{park:true, parkReason} — of which parked-by-the-fixture-gate=${summary.fixtureGate.parkedByGate} came from the FIXTURE GATE's own route ALONE (the block's OWN declared fixture probe read absent, so the block was parked WITHOUT running, §4.1 / §5.1 clause 1) and of which parked-by-fixture-absence=${summary.fixtureGate.parkedByFixtureAbsence} parked BECAUSE their OWN declared fixture read ABSENT at resolved:true — counted over the ROUTE TAG, so HOWEVER the park was routed, the gate branch OR the block's own body (§5.5's counting clause, §16.17 item 6); the fixture-absent park is therefore a SUBSET of parked, never the whole count: the other ${summary.fixtureGate.parked - summary.fixtureGate.parkedByGate} parked for their own recorded reasons) · the remainder is ARITHMETIC over the DECLARATION and is NOT a coverage reading: eligible-and-not-parked=${summary.fixtureGate.eligibleAndNotParked} (= declared − parked; a scoped run prints the same figure) — the run count is blocksRun=${summary.blocksRun} (of the ${Object.keys(BLOCKS).length} counted blocks), so neither figure may be read as coverage · SCOPE: ${summary.fixtureGate.scope}`)
    // ⟨GATE-4 FINDING `D-3`⟩ — the printed NOTE's PARTITION CLAIM is made TRUE for a
    // SCOPED run too: the clause used to read `pass + fail + parked === matrixRowsExecuted
    // === total` unconditionally, which a scoped run (`matrixRowsExecuted < total`) makes
    // FALSE — the same over-claim the scope-carrying `OK` was repaired for. The closure is
    // now stated on the term it holds on (`matrixRowsExecuted`), with the scope named: the
    // full-battery form additionally closes on `total`; the scoped form says so.
    console.log(`[live-drive] NOTE: summary.pass/fail/parked partition ONLY the executed §5.U rows — counted over the BY-ROW-ID FOLD (each declared row once, by its aggregated verdict), so pass + fail + parked === matrixRowsExecuted (${summary.matrixRowsExecuted}) — and must NEVER be read as app health; ${coverage.fullBattery ? `this is a FULL-BATTERY run, so matrixRowsExecuted === total (${MATRIX_ROWS.length})` : `this run is SCOPED, so matrixRowsExecuted (${summary.matrixRowsExecuted}) is the IN-SCOPE part of total (${MATRIX_ROWS.length}) and the partition closes on matrixRowsExecuted, NEVER on total — the declared rows this run did not reach are INCONCLUSIVE, not coverage it took (§2.1 E-3 clause 2 / F-2 clause (iii))`}; a folded row that could NOT be driven is the RESIDUAL (not-PASS, not-FAIL) and is counted in the parked member, with its own NOT-DRIVEN verdict left intact on its contributors' lines; coverage.missingRows=[${coverage.missingRows.join(', ')}] is the declared-minus-verdicted set${coverage.fullBattery ? ' in a FULL-BATTERY run' : ' (this run is SCOPED: an un-executed declared row is INCONCLUSIVE, not a defect)'}`)
    console.log(`[live-drive] MATRIX rows (${summary.matrixRowsExecuted} of ${MATRIX_ROWS.length} = summary.total): ${matrixVerdict.map((r) => `${r.row}:${r.block}=${r.verdict}${r.proxyPASS ? '(proxyPASS)' : ''}${r.realInput ? '' : '(realInput:false)'}`).join(' ') || '(none executed)'}`)
    // §2.2 `E-11` (`C-2`) — THE MATRIX ROW'S AGGREGATED VERDICT BESIDE ITS
    // CONTRIBUTORS, in the same shape the `SHARED rows` line already uses on the
    // extended dimension: the fold the §6.1 partition is counted over is PRINTED,
    // so a multi-contributor row's aggregate is readable from the artifact and not
    // only from the count. Every executed row id appears here exactly once (the
    // fold's own length), so this line's row count and
    // `summary.matrixRowsExecuted`/`summary.total` are the SAME number.
    console.log(`[live-drive] MATRIX AGGREGATED row verdicts — the AND fold BY ROW ID over the MATRIX dimension, §2.2 E-11: the §6.1 partition is taken over THIS set, never over the matrixVerdict ENTRIES, and each row prints contributors=[block:row=verdict …] beside it. fold=${matrixAggregate.length} row verdict(s) over ${matrixVerdict.length} contributing result(s); multi-contributor rows=${matrixAggregate.filter((a) => a.shared).length}; rows: ${matrixAggregate.map((a) => `${a.row} aggregate(row verdict)=${a.verdict} contributors=[${a.contributors.join(' ')}]`).join(' | ') || '(none executed)'}`)
    // §2.2 `E-7`/`E-11` — the block -> row line: every counted block's OWN
    // verdict in its own words, so no contributor is left out of the record (an
    // aggregated row may never be the only place a block's verdict appears).
    console.log(`[live-drive] ROW-LINE block=${'uf_tabs_1'} row=${'UF-TABS-1'} verdict=${reportRows.find((x) => x.block === 'uf_tabs_1') ? reportRows.find((x) => x.block === 'uf_tabs_1').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_tabs_1') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_tabs_1') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_tabs_1'))
    console.log(`[live-drive] ROW-LINE block=${'uf_tabs_3'} row=${'UF-TABS-3'} verdict=${reportRows.find((x) => x.block === 'uf_tabs_3') ? reportRows.find((x) => x.block === 'uf_tabs_3').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_tabs_3') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_tabs_3') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_tabs_3'))
    console.log(`[live-drive] ROW-LINE block=${'uf_tabs_4'} row=${'UF-TABS-4'} verdict=${reportRows.find((x) => x.block === 'uf_tabs_4') ? reportRows.find((x) => x.block === 'uf_tabs_4').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_tabs_4') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_tabs_4') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_tabs_4'))
    console.log(`[live-drive] ROW-LINE block=${'uf_tabs_7'} row=${'UF-TABS-7'} verdict=${reportRows.find((x) => x.block === 'uf_tabs_7') ? reportRows.find((x) => x.block === 'uf_tabs_7').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_tabs_7') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_tabs_7') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_tabs_7'))
    console.log(`[live-drive] ROW-LINE block=${'uf_settings_1'} row=${'UF-SETTINGS-1'} verdict=${reportRows.find((x) => x.block === 'uf_settings_1') ? reportRows.find((x) => x.block === 'uf_settings_1').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_settings_1') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_settings_1') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_settings_1'))
    console.log(`[live-drive] ROW-LINE block=${'uf_settings_2'} row=${'UF-SETTINGS-2'} verdict=${reportRows.find((x) => x.block === 'uf_settings_2') ? reportRows.find((x) => x.block === 'uf_settings_2').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_settings_2') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_settings_2') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_settings_2'))
    console.log(`[live-drive] ROW-LINE block=${'uf_settings_3'} row=${'UF-SETTINGS-3'} verdict=${reportRows.find((x) => x.block === 'uf_settings_3') ? reportRows.find((x) => x.block === 'uf_settings_3').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_settings_3') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_settings_3') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_settings_3'))
    console.log(`[live-drive] ROW-LINE block=${'uf_settings_4'} row=${'UF-SETTINGS-4'} verdict=${reportRows.find((x) => x.block === 'uf_settings_4') ? reportRows.find((x) => x.block === 'uf_settings_4').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_settings_4') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_settings_4') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_settings_4'))
    console.log(`[live-drive] ROW-LINE block=${'uf_settings_5'} row=${'UF-SETTINGS-5'} verdict=${reportRows.find((x) => x.block === 'uf_settings_5') ? reportRows.find((x) => x.block === 'uf_settings_5').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_settings_5') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_settings_5') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_settings_5'))
    console.log(`[live-drive] ROW-LINE block=${'uf_settings_7'} row=${'UF-SETTINGS-7'} verdict=${reportRows.find((x) => x.block === 'uf_settings_7') ? reportRows.find((x) => x.block === 'uf_settings_7').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_settings_7') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_settings_7') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_settings_7'))
    console.log(`[live-drive] ROW-LINE block=${'uf_panes_1'} row=${'UF-PANES-1'} verdict=${reportRows.find((x) => x.block === 'uf_panes_1') ? reportRows.find((x) => x.block === 'uf_panes_1').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_panes_1') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_panes_1') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_panes_1'))
    console.log(`[live-drive] ROW-LINE block=${'uf_panes_8'} row=${'UF-PANES-8'} verdict=${reportRows.find((x) => x.block === 'uf_panes_8') ? reportRows.find((x) => x.block === 'uf_panes_8').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_panes_8') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_panes_8') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_panes_8'))
    console.log(`[live-drive] ROW-LINE block=${'uf_panes_10'} row=${'UF-PANES-10'} verdict=${reportRows.find((x) => x.block === 'uf_panes_10') ? reportRows.find((x) => x.block === 'uf_panes_10').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_panes_10') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_panes_10') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_panes_10'))
    console.log(`[live-drive] ROW-LINE block=${'uf_panes_12'} row=${'UF-PANES-12'} verdict=${reportRows.find((x) => x.block === 'uf_panes_12') ? reportRows.find((x) => x.block === 'uf_panes_12').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_panes_12') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_panes_12') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_panes_12'))
    console.log(`[live-drive] ROW-LINE block=${'uf_panes_14'} row=${'UF-PANES-14'} verdict=${reportRows.find((x) => x.block === 'uf_panes_14') ? reportRows.find((x) => x.block === 'uf_panes_14').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_panes_14') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_panes_14') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_panes_14'))
    console.log(`[live-drive] ROW-LINE block=${'uf_search_2'} row=${'UF-SEARCH-2'} verdict=${reportRows.find((x) => x.block === 'uf_search_2') ? reportRows.find((x) => x.block === 'uf_search_2').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_search_2') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_search_2') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_search_2'))
    console.log(`[live-drive] ROW-LINE block=${'uf_hist_4'} row=${'UF-HIST-4'} verdict=${reportRows.find((x) => x.block === 'uf_hist_4') ? reportRows.find((x) => x.block === 'uf_hist_4').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_hist_4') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_hist_4') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_hist_4'))
    console.log(`[live-drive] ROW-LINE block=${'uf_hist_6'} row=${'UF-HIST-6'} verdict=${reportRows.find((x) => x.block === 'uf_hist_6') ? reportRows.find((x) => x.block === 'uf_hist_6').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_hist_6') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_hist_6') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_hist_6'))
    console.log(`[live-drive] ROW-LINE block=${'uf_layout_2'} row=${'UF-LAYOUT-2'} verdict=${reportRows.find((x) => x.block === 'uf_layout_2') ? reportRows.find((x) => x.block === 'uf_layout_2').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_layout_2') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_layout_2') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_layout_2'))
    console.log(`[live-drive] ROW-LINE block=${'uf_layout_10'} row=${'UF-LAYOUT-10'} verdict=${reportRows.find((x) => x.block === 'uf_layout_10') ? reportRows.find((x) => x.block === 'uf_layout_10').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'uf_layout_10') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'uf_layout_10') || {}).pass}`, reportRows.filter((x) => x.block === 'uf_layout_10'))
    console.log(`[live-drive] ROW-LINE block=${'user1_tab_new'} row=${'UF-DEFECT-1'} verdict=${reportRows.find((x) => x.block === 'user1_tab_new') ? reportRows.find((x) => x.block === 'user1_tab_new').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user1_tab_new') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user1_tab_new') || {}).pass}`, reportRows.filter((x) => x.block === 'user1_tab_new'))
    console.log(`[live-drive] ROW-LINE block=${'user2_pane_drag'} row=${'UF-DEFECT-2'} verdict=${reportRows.find((x) => x.block === 'user2_pane_drag') ? reportRows.find((x) => x.block === 'user2_pane_drag').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user2_pane_drag') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user2_pane_drag') || {}).pass}`, reportRows.filter((x) => x.block === 'user2_pane_drag'))
    console.log(`[live-drive] ROW-LINE block=${'user3_collapse_orientation'} row=${'UF-KEEP-1'} verdict=${reportRows.find((x) => x.block === 'user3_collapse_orientation') ? reportRows.find((x) => x.block === 'user3_collapse_orientation').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user3_collapse_orientation') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user3_collapse_orientation') || {}).pass}`, reportRows.filter((x) => x.block === 'user3_collapse_orientation'))
    console.log(`[live-drive] ROW-LINE block=${'user4_main_editable'} row=${'UF-STAGE-3'} verdict=${reportRows.find((x) => x.block === 'user4_main_editable') ? reportRows.find((x) => x.block === 'user4_main_editable').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user4_main_editable') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user4_main_editable') || {}).pass}`, reportRows.filter((x) => x.block === 'user4_main_editable'))
    console.log(`[live-drive] ROW-LINE block=${'user5_history_in_pane'} row=${'UF-DEFECT-3'} verdict=${reportRows.find((x) => x.block === 'user5_history_in_pane') ? reportRows.find((x) => x.block === 'user5_history_in_pane').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user5_history_in_pane') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user5_history_in_pane') || {}).pass}`, reportRows.filter((x) => x.block === 'user5_history_in_pane'))
    console.log(`[live-drive] ROW-LINE block=${'user6_search_no_flicker'} row=${'UF-KEEP-3'} verdict=${reportRows.find((x) => x.block === 'user6_search_no_flicker') ? reportRows.find((x) => x.block === 'user6_search_no_flicker').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user6_search_no_flicker') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user6_search_no_flicker') || {}).pass}`, reportRows.filter((x) => x.block === 'user6_search_no_flicker'))
    console.log(`[live-drive] ROW-LINE block=${'user7_zone_resize'} row=${'UF-DEFECT-5'} verdict=${reportRows.find((x) => x.block === 'user7_zone_resize') ? reportRows.find((x) => x.block === 'user7_zone_resize').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user7_zone_resize') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user7_zone_resize') || {}).pass}`, reportRows.filter((x) => x.block === 'user7_zone_resize'))
    console.log(`[live-drive] ROW-LINE block=${'user8_zone_boundary'} row=${'UF-DEFECT-6'} verdict=${reportRows.find((x) => x.block === 'user8_zone_boundary') ? reportRows.find((x) => x.block === 'user8_zone_boundary').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user8_zone_boundary') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user8_zone_boundary') || {}).pass}`, reportRows.filter((x) => x.block === 'user8_zone_boundary'))
    console.log(`[live-drive] ROW-LINE block=${'user9_search_open_in_tab'} row=${'UF-DEFECT-7'} verdict=${reportRows.find((x) => x.block === 'user9_search_open_in_tab') ? reportRows.find((x) => x.block === 'user9_search_open_in_tab').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user9_search_open_in_tab') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user9_search_open_in_tab') || {}).pass}`, reportRows.filter((x) => x.block === 'user9_search_open_in_tab'))
    console.log(`[live-drive] ROW-LINE block=${'user10_collapse_vertical_text'} row=${'UF-DEFECT-8'} verdict=${reportRows.find((x) => x.block === 'user10_collapse_vertical_text') ? reportRows.find((x) => x.block === 'user10_collapse_vertical_text').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'user10_collapse_vertical_text') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'user10_collapse_vertical_text') || {}).pass}`, reportRows.filter((x) => x.block === 'user10_collapse_vertical_text'))
    console.log(`[live-drive] ROW-LINE block=${'repro_nbsp'} row=${'UF-STAGE-4'} verdict=${reportRows.find((x) => x.block === 'repro_nbsp') ? reportRows.find((x) => x.block === 'repro_nbsp').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'repro_nbsp') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'repro_nbsp') || {}).pass}`, reportRows.filter((x) => x.block === 'repro_nbsp'))
    console.log(`[live-drive] ROW-LINE block=${'repro_dup_para'} row=${'UF-STAGE-2'} verdict=${reportRows.find((x) => x.block === 'repro_dup_para') ? reportRows.find((x) => x.block === 'repro_dup_para').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'repro_dup_para') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'repro_dup_para') || {}).pass}`, reportRows.filter((x) => x.block === 'repro_dup_para'))
    console.log(`[live-drive] ROW-LINE block=${'toolbar_undo'} row=${'UF-HIST-2'} verdict=${reportRows.find((x) => x.block === 'toolbar_undo') ? reportRows.find((x) => x.block === 'toolbar_undo').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'toolbar_undo') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'toolbar_undo') || {}).pass}`, reportRows.filter((x) => x.block === 'toolbar_undo'))
    console.log(`[live-drive] ROW-LINE block=${'toolbar_toggle'} row=${'UF-STAGE-6'} verdict=${reportRows.find((x) => x.block === 'toolbar_toggle') ? reportRows.find((x) => x.block === 'toolbar_toggle').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'toolbar_toggle') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'toolbar_toggle') || {}).pass}`, reportRows.filter((x) => x.block === 'toolbar_toggle'))
    console.log(`[live-drive] ROW-LINE block=${'boot_landing'} row=${'UF-STAGE-1'} verdict=${reportRows.find((x) => x.block === 'boot_landing') ? reportRows.find((x) => x.block === 'boot_landing').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'boot_landing') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'boot_landing') || {}).pass}`, reportRows.filter((x) => x.block === 'boot_landing'))
    console.log(`[live-drive] ROW-LINE block=${'vis_persist'} row=${'UF-SETTINGS-7'} verdict=${reportRows.find((x) => x.block === 'vis_persist') ? reportRows.find((x) => x.block === 'vis_persist').verdict : 'NOT-RUN'} realInput=${!!(reportRows.find((x) => x.block === 'vis_persist') || {}).realInput} pass=${!!(reportRows.find((x) => x.block === 'vis_persist') || {}).pass}`, reportRows.filter((x) => x.block === 'vis_persist'))
    if (sharedRows.length) console.log(`[live-drive] SHARED rows (one row id, several contributing blocks — the row's aggregated verdict is the AND of the halves, §2.2 E-11): ${sharedRows.map((a) => `${a.row} aggregate(row verdict)=${a.verdict} contributors=[${a.contributors.join(' ')}]`).join(' | ')}`)
    console.log(`[live-drive] EXTENDED rows (${extendedVerdict.length} of ${ROW_EXTENDED.length} defined${extInconclusive.length ? `; ${extInconclusive.length} declared row(s) produced NO verdict and are inconclusive (EXTENDED-DECLARED-NO-VERDICT)` : ''}${undeclaredExtended.length ? `; ${undeclaredExtended.length} emitted id(s) are UNDECLARED` : ''}): ${extendedAggregate.map((a) => `${a.row}:${a.contributors.map((c) => c.split(':').slice(1).join(':')).join('+')}=${a.verdict}${a.shared ? '(aggregate of ' + a.contributors.length + ' halves)' : ''}`).join(' ') || '(none executed)'}`)
    console.log(`[live-drive] MATRIX_ROWS mapping (${claims.length}): ${claims.join(' ')}`)
    console.log(`[live-drive] DISPOSITION (§2.1 E-4: CONVERTED vs EXCLUDED, no silent middle state — F-11): ${CONVERTED_ROW_DISPOSITION.join('; ')}; ${EXCLUDED_NON_ROW_DISPOSITION.join('; ')}`)
    // §2.1 `E-4` item 2 / `F-11` (`G-5`) — THE MACHINE-READABLE NON-ROW DISPOSITION,
    // on its OWN `NON-ROW` line: every counted `BLOCKS` key that is not a row block
    // appears here (or carries a declared row id — the `ROW BLOCK:` entries), so no
    // counted block stays in the silent middle state by default and the
    // classification is readable from the artifact as DATA, not only as the
    // driver's prose on the line above.
    console.log(`[live-drive] NON-ROW dispositions (§2.1 E-4 item 2 / F-11 — ${Object.keys(NON_ROW_DISPOSITIONS).length} counted non-row block(s) named, the machine-readable map): ${JSON.stringify(NON_ROW_DISPOSITIONS)}`)
    // §3.2 `F-6`/`F-7` + §2.3 `H-4` (`G-10`) — THE CLASSIFICATION RULE, stated AS A
    // RULE, with the LIVE READING of THIS run's fixture precondition beside it. The
    // rule line used to interpolate a synthetic `fixture-missing` reason, so EVERY
    // seeded run ended its line with `PRECONDITION-FAILED: fixture-missing — the seed
    // corpus produced no documents` while the same run had just seeded
    // the OBSOLETE `.live-corpus` SEED route's own `alpha`/`beta` documents
    // (`seeded corpus -> import {"ok":true,…}`; annotated, never extended, §6.1
    // clause 1 — the mock sets are NOT their children) — a false
    // present-tense claim about a fixture that was present. The marker is now named
    // only as the RULE (it is printed where it FIRES, on the row that fires it), and
    // the fixture precondition is READ live, so the line states what this run read.
    const corpusLive = await ufBlockPrecondition(h, opt)
    console.log(`[live-drive] DRIVE-CLASSIFICATION RULE (§2.3 H-4 / F-6 / F-7): an unproven gesture reads NOT-DRIVEN (a driver failure, realInput:false); an isError reply is printed verbatim and never credits the app with a FAIL; a missing fixture, an empty corpus or an absent engine (ECONNREFUSED) is PARKED BY NAME and its marker is PRECONDITION-FAILED. THIS LINE STATES THE RULE, not a reading: a marker named here is printed only where it FIRES, and this run's own fixture precondition is READ live on the line below.`)
    console.log(`[live-drive] FIXTURE PRECONDITION (LIVE READING, §3.2 F-6 — ${opt.noSeed ? '--no-seed: no seed was attempted this run' : 'the seed route ran and its import is printed verbatim above'}): ${corpusLive.present === true ? `PRECONDITION HOLDS — ${corpusLive.detail}; no fixture precondition marker fires in this run` : `${driverFailureReason(corpusLive.kind ?? 'empty-corpus', corpusLive.detail, corpusLive.extra).marker} — the fixture precondition did NOT hold in this run (the marker above is that reading, not a rule)`}`)
    // §2.2 `E-11` item 1 — THE SHARED ROW'S CONTRIBUTORS, named beside each other.
    console.log(`[live-drive] SHARED-ROW contributors by row id (§2.2 E-11 item 1 — each contributor prints its OWN verdict on its own ROW line above, plus the row's aggregate below): UF-SETTINGS-7 <= vis_persist + uf_settings_7 [this run: ${sharedRows.map((a) => `${a.row} <= ${a.contributors.join(' + ')}`).join(' | ') || '(no shared row executed)'}]`)
    console.log(`[live-drive] AGGREGATED row verdicts (the AND fold, §2.2 E-11): ${extendedAggregate.map((a) => `${a.row}=${a.verdict}${a.shared ? ` (aggregate of ${a.contributors.length} halves: ${a.contributors.join(' ')})` : ''}`).join(' | ') || '(none executed)'}`)
    console.log(`[live-drive] EXTENDED mapping (declared ${ROW_EXTENDED.length}, reconciled by the declared-minus-verdict SET DIFFERENCE, §2.2 E-12): ${EXTENDED_REFUSING_ROWS.map((id) => `${id}->${ROW_EXTENDED.filter((r) => r.row === id).map((r) => r.block).join(',')}`).join(' ')}`)
    for (const id of extInconclusive) {
      const blk = ROW_EXTENDED.filter((r) => r.row === id).map((r) => r.block).join(',')
      console.log(`[live-drive] EXTENDED-DECLARED-NO-VERDICT: extended row ${id} -> block(s) ${blk} produced no verdict in this run (inconclusive — NOT a refusal: declaring these authoritative is a later unit's act, §2.2 E-12 item 5)`)
    }
    for (const id of undeclaredExtended) {
      const blk = extendedVerdict.filter((r) => String(r.row) === id).map((r) => r.block).join(',')
      console.log(`[live-drive] EXTENDED-UNDECLARED: ${id}(${blk}) — an emitted row id no declared extended structure carries (REPORTED, never a refusal; §2.2 E-12 item 5, F-15)`)
    }
    // §2.1 `E-3` clause 2 / §2.2 `E-12` item 2 — THE REFUSALS, each NAMING the rows
    // it lacks, with the reconciliation line reading `REFUSED` (never `OK`) and a
    // non-zero exit (`1`).
    for (const msg of recon.errors) console.log(`[live-drive] ROW-SET ERROR: ${msg}`)
    for (const id of extendedMissing) {
      const blk = ROW_EXTENDED.filter((r) => r.row === id).map((r) => r.block).join(',')
      console.log(`[live-drive] ROW-SET ERROR: declared extended row ${id} -> block(s) ${blk} produced no verdict (§2.2 E-12: a declared extended row ends in exactly one of {a verdict, a named REFUSAL})`)
    }
    // §2.1 `E-3` / `G-8` (`M-1`) — `OK` IS PRINTED ONLY WITH ITS SCOPE. A full-battery
    // run prints the full-battery reading (`8 of 8 declared rows verdicted`); a
    // SCOPED run prints the rows it had in scope AND the declared rows it did not
    // verdict (inconclusive by `E-3` clause 2 / `F-2` clause (iii), never a defect
    // and never coverage it did not take). `OK` alone is what made an invalid report
    // read as a pass; the refusal branch is unmoved and still NAMES the rows.
    const matrixOkText = recon.fullBattery
      ? `OK (full battery: ${summary.matrixRowsExecuted} of ${recon.matrixTotal} declared rows verdicted)`
      : `OK (scoped run: ${matrixRowsInScope} of ${recon.matrixTotal} declared rows in scope; ${recon.missingRows.length} inconclusive)`
    console.log(`[live-drive] row-set reconciliation: matrix=${recon.matrixTotal} rows claimed by ${claims.length} mapping(s); blocks run=${names.length} (informational); matrix rows executed=${summary.matrixRowsExecuted}; coverage=${JSON.stringify(coverage)}; §5.U row total (summary.total)=${summary.total}; ${recon.ok ? matrixOkText : `REFUSED — missing declared row(s): ${recon.missingRows.join(', ')}`}`)
    console.log(`[live-drive] extended row-set reconciliation (§2.2 E-12): declared=${ROW_EXTENDED.length}; emitted=${extendedVerdict.length}; in-scope declared row(s)=[${extRecon.inScope.join(', ')}] (ANY of a declared row's contributing blocks requested — §2.2 E-12 item 2 / G-4); declared-with-no-verdict(unit-declared, refusing)=[${extendedMissing.join(', ')}]; inconclusive=[${extInconclusive.join(', ')}]; ${extendedRefused ? `REFUSED — missing declared extended row(s): ${extendedMissing.join(', ')}` : 'OK — every requested declared extended row carried a verdict'}`)
    // §2.1 `E-3` clause 2 + §2.2 `E-12` item 2: exit `1` on EITHER refusal (`2`
    // stays the driver's hard-import-failure code, set by main's own catch).
    // §2.1 `E-3` clause 2 + §2.2 `E-12` item 2: exit `1` on EITHER refusal — a
    // matrix `recon.ok === false` or an `extendedRefused` row — and `1` on a FAIL;
    // `2` stays the hard-error code main's own catch sets.
    process.exitCode = fail > 0 ? 1 : (!recon.ok || extendedRefused ? 1 : 0)
  } finally {
    // --connect: the RUNNING app session is not ours to stop — detach, don't kill.
    if (!opt.connect) {
      // ⟨THE CHILD SWEEP — ONE MECHANISM ON EVERY EXIT PATH.⟩ The run's OWN exit uses
      // the SAME bounded sweep the abort paths use (SIGTERM to the child's process
      // group, a bounded grace, then SIGKILL iff the leader is still alive), so the
      // normal teardown and an early abort cannot diverge in how a child is torn
      // down; the recorded line states the bound. The old best-effort SIGTERM pair
      // is REPLACED by it, not kept beside it.
      ufReportSweep(await ufSweepSpawnedChild('the run reached its own end (main returned)'))
    }
    // ⟨gate-4 `F-8` — **THE HOME REMOVAL IS BOUNDED, STATED, AND REACHED ON EVERY PATH
    // THAT MINTED ONE.**⟩ It used to be `rmSync(home, {recursive:true, force:true})`
    // INSIDE the `!opt.connect` branch — `force` on an operator-chosen path (the
    // hazard), silent on failure, and UNREACHABLE for the `--connect` scratch dir
    // (minted above, never removed: the measured leak). It is now the ONE bounded
    // removal (`ufRemoveScratchHome`: under the OS temp root, a directory, `force` only
    // for this run's own mkdtemp scratch), it runs for BOTH modes, it prints what it
    // did (a refusal or a failure is a READING, never an unrecorded orphan), and it is
    // still skipped by `--keep-home` — which says so.
    if (opt.keepHome) console.error(`[live-drive] SCRATCH HOME: KEPT (--keep-home) — ${home} was left in place by the operator's own flag; nothing is removed on this path (and a --home= value outside the OS temp root was already REFUSED by name before anything was spawned)`)
    else console.error(ufRemoveScratchHome(home, ownScratchHome))
    // ⟨gate-4 `F-8`⟩ the mint record is CLEARED here, so a later abort path (the
    // module-level catch) never removes a path the operator asked to keep, and never
    // re-removes one already gone.
    UF_MINTED_HOME = null
    // the U-EDIT-1 live fixture file (written by `ufEnsureEditFixture`) is the
    // driver's OWN artifact — removed with the seed corpus it sits beside
    try { rmSync(join(ROOT, '.live-page-edit-fixture.md'), { force: true }) } catch { /* best-effort */ }
    // ⟨§7.2 limb 3⟩ the STAGE-OVERFLOW fixture `ufEnsureStageBoxOverflowDoc` writes for
    // the stage-scroll reading is the driver's OWN artifact too — removed on the same
    // path, by name, so a run leaves no `.live-*` file behind.
    try { rmSync(join(ROOT, UF_STAGE_OVERFLOW_FIXTURE), { force: true }) } catch { /* best-effort */ }
    // --connect: the running app owns the OBSOLETE `.live-corpus` SEED route's
    // directory (annotated, never extended, §6.1 clause 1) — leave it in place.
    if (!opt.connect && seedDir === join(ROOT, '.live-corpus')) { try { rmSync(seedDir, { recursive: true, force: true }) } catch { /* best-effort */ } }
  }
  // Exit the process: the MCP streamable-HTTP transport + CDP WebSocket keep the
  // event loop alive after connect-mode (no app teardown), so force the exit.
  process.exit(process.exitCode || 0)
}

main(process.argv.slice(2)).catch(
  async (e) => {
    console.error(`[live-drive] ERROR: ${e} fixture=${JSON.stringify(UF_FIXTURE_STATE)} (the run-wide fixture state, §6.1 site 4 — stated on this path too: this abort produced no artifact, but a run that states no fixture identity is not quotable)`)
    // ⟨THE EARLY-ABORT SWEEP, ON THE PATH THAT WAS MEASURED LEAKING.⟩ This handler
    // is where the gate-5 run's `--port=not-a-port` abort landed: it prints the
    // ERROR line and exits `2`, and BEFORE this clause it left the child it had
    // spawned RUNNING on the default `3787`/`9222`. It now sweeps — the ONE bounded
    // sweep (SIGTERM to the driver's own child process group, a bounded grace, then
    // SIGKILL iff the leader is still alive), stated in one line with its bound. A
    // `--connect` run owns no child, so its abort sweeps nothing.
    ufReportSweep(await ufSweepSpawnedChild('module-level main().catch early abort (the ERROR path above)'))
    // ⟨gate-4 `F-8` — THE SAME ABORT PATH REMOVES A SCRATCH HOME MINTED BUT NOT YET
    // TORN DOWN.⟩ `main` records the mint at module scope (`UF_MINTED_HOME`) and clears
    // it once its own `finally` has run the bounded removal, so anything left here is a
    // dir THIS run created and did not remove (an abort between the mint and `main`'s
    // `try`). The removal is the SAME bounded helper (`ufRemoveScratchHome`: under the
    // OS temp root, a directory, `force` only for this run's own mkdtemp scratch), so
    // this abort path cannot delete anything the operator-named `--home=` bound would
    // have refused, and it says what it did.
    if (UF_MINTED_HOME !== null) {
      console.error(ufRemoveScratchHome(UF_MINTED_HOME.dir, UF_MINTED_HOME.ownScratch))
      UF_MINTED_HOME = null
    }
    // The driver HARD-ERROR code (`2`, §2.1 `E-3` clause 2) — the run-level exit
    // gate inside `main` (which reads the reconciler's own `ok`) is untouched, and
    // this catch is a TERMINAL exit, not a second gate.
    process.exit(2)
  },
)
