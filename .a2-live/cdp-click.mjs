// CDP diagnostics for the live security pane. Connects to the Electron page,
// inspects the #panes security toggles, and dispatches a real click on the
// gnosis toggle to reproduce the user's interaction.
import { WebSocket } from 'undici'

const wsUrl = process.argv[2]
const ws = new WebSocket(wsUrl)
let seq = 0
const pending = new Map()

function send(method, params = {}) {
  const id = ++seq
  return new Promise((resolve) => {
    pending.set(id, resolve)
    ws.send(JSON.stringify({ id, method, params }))
  })
}
ws.onmessage = (ev) => {
  const msg = JSON.parse(String(ev.data))
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result)
    pending.delete(msg.id)
  }
}
ws.onopen = async () => {
  await send('Runtime.enable')
  const eval_ = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })
    return r?.result?.value
  }
  // Inspect the #panes DOM: find toggles, check their listeners indirectly
  const before = await eval_(`(() => {
    const toggles = document.querySelectorAll('#panes #group-toggles label, #panes [data-group]');
    const out = [];
    toggles.forEach(t => out.push({
      id: t.id, dataset: {...t.dataset}, text: t.textContent.slice(0, 60),
      hasHandlerAttr: t.getAttribute('onclick') !== null,
    }));
    return { count: toggles.length, toggles: out };
  })()`)
  console.log('=== TOGGLES BEFORE CLICK ===')
  console.log(JSON.stringify(before, null, 2))

  // get current enabled state
  const enabled = await eval_(`(async () => {
    try { const s = await window.provident.security.get(); return s.enabled; } catch (e) { return 'ERR:'+e.message; }
  })()`)
  console.log('=== enabled BEFORE click ===')
  console.log(JSON.stringify(enabled))

  // dispatch a REAL click on the gnosis toggle
  const click = await eval_(`(() => {
    const t = document.getElementById('toggle:gnosis');
    if (!t) return 'NO toggle:gnosis';
    const e = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    t.dispatchEvent(e);
    return 'dispatched click on toggle:gnosis';
  })()`)
  console.log('=== CLICK ===', click)
  await new Promise((r) => setTimeout(r, 800))

  const afterEnabled = await eval_(`(async () => {
    try { const s = await window.provident.security.get(); return s.enabled; } catch (e) { return 'ERR:'+e.message; }
  })()`)
  console.log('=== enabled AFTER click ===')
  console.log(JSON.stringify(afterEnabled))

  const afterDom = await eval_(`(() => {
    const t = document.getElementById('toggle:gnosis');
    return t ? { id: t.id, text: t.textContent.slice(0,60), dataset: {...t.dataset} } : null;
  })()`)
  console.log('=== gnosis toggle DOM AFTER click ===')
  console.log(JSON.stringify(afterDom, null, 2))

  ws.close()
  process.exit(0)
}
