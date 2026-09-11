import { WebSocket } from 'undici'
const ws = new WebSocket(process.argv[2])
let seq = 0
const pending = new Map()
function send(m, p = {}) { const id = ++seq; return new Promise((r) => { pending.set(id, r); ws.send(JSON.stringify({ id, method: m, params: p })) }) }
ws.onmessage = (ev) => { const m = JSON.parse(String(ev.data)); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) } }
ws.onopen = async () => {
  await send('Runtime.enable')
  const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }))?.result?.value
  const out = await ev(`(async () => {
    // find demo buttons in the app graph (the counter inc/dec, echo)
    const btns = [...document.querySelectorAll('#app button')].map(b => ({ id: b.id, text: b.textContent.trim().slice(0,20) }));
    // capture rendered html of #app to see state before
    const before = document.getElementById('app')?.textContent?.slice(0,80);
    // try clicking the first app button AND the first group toggle; trace set calls
    const setCalls = [];
    try {
      const orig = window.provident.security.set.bind(window.provident.security);
      window.provident.security.set = (p) => { setCalls.push(p); return orig(p); };
    } catch(e) {}
    const appBtns = [...document.querySelectorAll('#app button')];
    const clickRes = [];
    for (const b of appBtns.slice(0,3)) {
      const e = new MouseEvent('click', { bubbles:true, cancelable:true, view:window });
      b.dispatchEvent(e);
      clickRes.push({ onClickAttr: b.getAttribute('onclick')!==null, id:b.id });
    }
    await new Promise(r=>setTimeout(r,400));
    const after = document.getElementById('app')?.textContent?.slice(0,80);
    return { appBtns: btns, clickRes, setCalls, before, after };
  })()`)
  console.log('RESULT:'); console.log(JSON.stringify(out, null, 2))
  ws.close(); process.exit(0)
}
