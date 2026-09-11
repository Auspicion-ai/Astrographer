import { WebSocket } from 'undici'
const ws = new WebSocket(process.argv[2])
let seq = 0
const pending = new Map()
function send(method, params = {}) {
  const id = ++seq
  return new Promise((res) => { pending.set(id, res); ws.send(JSON.stringify({ id, method, params })) })
}
ws.onmessage = (ev) => {
  const m = JSON.parse(String(ev.data))
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
}
ws.onopen = async () => {
  await send('Runtime.enable')
  const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }))?.result?.value
  // Wrap security.set to trace invocations, then dispatch real clicks.
  const out = await ev(`(async () => {
    const calls = [];
    const origSet = window.provident.security.set.bind(window.provident.security);
    window.provident.security.set = async (patch) => { calls.push(patch); return origSet(patch); };
    // also trace get
    const origGet = window.provident.security.get.bind(window.provident.security);
    const gets = [];
    window.provident.security.get = async () => { gets.push('get'); return origGet(); };

    const t = document.getElementById('toggle:gnosis');
    if (!t) return { error: 'no toggle:gnosis' };
    // does the element have ANY listener? we can't enumerate, but check handlers via __getEventListeners unavailable in page context.
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true, view: window });
    t.dispatchEvent(ev);
    await new Promise(r => setTimeout(r, 1200));
    return { calls, gets, enabledAfter: (await origGet()).enabled };
  })()`)
  console.log('RESULT:'); console.log(JSON.stringify(out, null, 2))
  ws.close(); process.exit(0)
}
