import { writeFileSync } from 'node:fs'
import { WebSocket } from 'undici'
const wsUrl = process.argv[2]
const outPath = process.argv[3] || '/tmp/probe-out.txt'
const ws = new WebSocket(wsUrl)
let seq = 0
const pending = new Map()
function send(m, p = {}) { const id = ++seq; return new Promise((r) => { pending.set(id, r); ws.send(JSON.stringify({ id, method: m, params: p })) }) }
ws.onmessage = (ev) => { const m = JSON.parse(String(ev.data)); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) } }
ws.onerror = (e) => { writeFileSync(outPath, 'WSERR ' + String(e)); process.exit(1) }
ws.onopen = async () => {
  const log = []
  try {
    await send('Runtime.enable')
    const ev = async (e) => (await send('Runtime.evaluate', { expression: e, returnByValue: true, awaitPromise: true }))?.result?.value
    // Instrument security.set to observe calls
    await ev(`(() => { try { const o = window.provident.security.set.bind(window.provident.security); window.__calls=[]; window.provident.security.set=(p)=>{window.__calls.push(p); return o(p);}; window.__origGet=window.provident.security.get.bind(window.provident.security); } catch(e){ window.__calls=['ERR '+e.message]; } return 1; })()`)
    // 1) App demo buttons: enumerate + read counter/state before
    log.push('APP BUTTONS:')
    const appBtns = await ev(`(() => [...document.querySelectorAll('#app button')].map(b=>({id:b.id, text:b.textContent.trim().slice(0,25)})))()`)
    log.push(JSON.stringify(appBtns))
    const appCounterBefore = await ev(`(() => document.getElementById('counter')?.textContent || document.querySelector('#app .counter-value')?.textContent || '(none)')()`)
    log.push('app counter BEFORE: ' + appCounterBefore)
    // click first button
    if (appBtns && appBtns.length) {
      await ev(`(() => { const b=document.getElementById('${appBtns[0].id}')||document.querySelector('#app button'); b.click(); return 1; })()`)
      await new Promise((r) => setTimeout(r, 600))
    }
    const appCounterAfter = await ev(`(() => document.getElementById('counter')?.textContent || document.querySelector('#app .counter-value')?.textContent || '(none)')()`)
    log.push('app counter AFTER b.click(): ' + appCounterAfter)

    // 2) Security toggle real DOM click via .click()
    log.push('SECURITY:')
    log.push('enabled BEFORE: ' + JSON.stringify(await ev(`(async()=>{try{return (await window.provident.security.get()).enabled}catch(e){return 'ERR '+e.message}})()`)))
    const toggleInfo = await ev(`(() => { const t=document.getElementById('toggle:gnosis'); return t?{id:t.id, dataOn:t.dataset.on, text:t.textContent.slice(0,6)}:null })()`)
    log.push('toggle:gnosis BEFORE: ' + JSON.stringify(toggleInfo))
    const clickRs = await ev(`(() => { const t=document.getElementById('toggle:gnosis'); if(!t) return 'no toggle'; t.click(); return 'clicked'; })()`)
    log.push('click result: ' + clickRs)
    await new Promise((r) => setTimeout(r, 900))
    log.push('security.set calls: ' + JSON.stringify(await ev('(()=>window.__calls||[])()')))
    log.push('enabled AFTER: ' + JSON.stringify(await ev(`(async()=>{try{return (await window.provident.security.get()).enabled}catch(e){return 'ERR '+e.message}})()`)))
    const toggleAfter = await ev(`(() => { const t=document.getElementById('toggle:gnosis'); return t?{dataOn:t.dataset.on, text:t.textContent.slice(0,6)}:null })()`)
    log.push('toggle:gnosis AFTER: ' + JSON.stringify(toggleAfter))
  } catch (e) { log.push('ERR ' + String(e)) }
  writeFileSync(outPath, log.join('\n'))
  ws.close(); process.exit(0)
}
