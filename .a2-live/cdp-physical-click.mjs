// Physical-click reproduction via CDP Input domain. Gets the screen coords of
// the gnosis toggle, sends a real mouse click (down+up), then checks whether
// security.set was called and whether enabled gained gnosis.
import { writeFileSync } from 'node:fs'
import { WebSocket } from 'undici'
const ws = new WebSocket(process.argv[2])
let seq = 0
const pending = new Map()
function send(m, p = {}) { const id = ++seq; return new Promise((r) => { pending.set(id, r); ws.send(JSON.stringify({ id, method: m, params: p })) }) }
ws.onmessage = (ev) => { const m = JSON.parse(String(ev.data)); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) } }
ws.onerror = (e) => { writeFileSync('/tmp/physical-click.txt', 'WSERR ' + String(e)); process.exit(1) }
ws.onopen = async () => {
  try {
    await send('Runtime.enable')
    await send('Input.enable')
    const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }))?.result?.value
    // instrument security.set to observe any call
    const setup = await ev(`(async () => {
      const calls = [];
      try {
        const orig = window.provident.security.set.bind(window.provident.security);
        window.provident.security.set = (p) => { calls.push(p); return orig(p); };
        window.__calls = calls;
      } catch(e){ window.__calls = ['ERR '+e.message]; }
      const r = document.getElementById('toggle:gnosis').getBoundingClientRect();
      return { x: r.x + r.width/2, y: r.y + r.height/2, w: r.width, h: r.height };
    })()`)
    const { x, y } = setup
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1 })
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: Math.round(x), y: Math.round(y), button: 'left', clickCount: 1 })
    await new Promise((r) => setTimeout(r, 1200))
    const after = await ev(`(async () => {
      const calls = window.__calls || [];
      const s = await window.provident.security.get();
      const t = document.getElementById('toggle:gnosis');
      return { calls, enabled: s.enabled, toggleText: t ? t.textContent.slice(0,8) : null, toggleOn: t ? t.dataset.on : null };
    })()`)
    writeFileSync('/tmp/physical-click.txt', JSON.stringify({ rect: setup, after }, null, 2))
  } catch (e) { writeFileSync('/tmp/physical-click.txt', 'ERR ' + String(e)) }
  ws.close(); process.exit(0)
}
