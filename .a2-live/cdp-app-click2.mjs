import { writeFileSync } from 'node:fs'
import { WebSocket } from 'undici'
const ws = new WebSocket(process.argv[2])
let seq = 0
const pending = new Map()
function send(m, p = {}) { const id = ++seq; return new Promise((r) => { pending.set(id, r); ws.send(JSON.stringify({ id, method: m, params: p })) }) }
ws.onmessage = (ev) => { const m = JSON.parse(String(ev.data)); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) } }
ws.onerror = (e) => { writeFileSync('/tmp/cdp-app-click.txt', 'WSERR ' + String(e)); process.exit(1) }
ws.onopen = async () => {
  try {
    await send('Runtime.enable')
    const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }))?.result?.value
    const out = await ev(`(async () => {
      const appBtns = [...document.querySelectorAll('#app button')].map(b => ({ id:b.id, text:b.textContent.trim().slice(0,20) }));
      const before = document.getElementById('app')?.textContent?.slice(0,60);
      const clickRes = [];
      for (const b of appBtns.slice(0,3)) {
        b.dispatchEvent(new MouseEvent('click', { bubbles:true, cancelable:true, view:window }));
        clickRes.push({ id:b.id, hasOnclickAttr: b.getAttribute('onclick')!==null });
      }
      await new Promise(r=>setTimeout(r,500));
      const after = document.getElementById('app')?.textContent?.slice(0,60);
      return { appBtnCount: appBtns.length, appBtns, clickRes, before, after };
    })()`)
    writeFileSync('/tmp/cdp-app-click.txt', JSON.stringify(out, null, 2))
  } catch (e) { writeFileSync('/tmp/cdp-app-click.txt', 'ERR ' + String(e)) }
  ws.close(); process.exit(0)
}
