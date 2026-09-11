import { writeFileSync } from 'node:fs'
import { WebSocket } from 'undici'
const wsUrl = process.argv[2], out = process.argv[3] || '/tmp/compare.txt'
const ws = new WebSocket(wsUrl); let seq=0; const P=new Map()
const send=(m,p={})=>{const id=++seq;return new Promise(r=>{P.set(id,r);ws.send(JSON.stringify({id,method:m,params:p}))})}
ws.onmessage=e=>{const m=JSON.parse(String(e.data));if(m.id&&P.has(m.id)){P.get(m.id)(m.result);P.delete(m.id)}}
ws.onerror=e=>{writeFileSync(out,'WSERR '+String(e));process.exit(1)}
ws.onopen=async()=>{
  const L=[]
  try{
    await send('Runtime.enable')
    const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true}))?.result?.value
    await ev(`(()=>{window.__calls=[];const o=window.provident.security.set.bind(window.provident.security);window.provident.security.set=p=>{window.__calls.push(p);return o(p)};return 1})()`)
    // Test pre-existing vs gnosis toggles: record data-on, then real .click()
    for (const id of ['toggle:read','toggle:rag','toggle:edit','toggle:gnosis','toggle:gnosis-edit']) {
      const before = await ev(`(()=>{const t=document.getElementById('${id}');return t?{id:t.id,on:t.dataset.on,text:t.textContent.slice(0,5)}:null})()`)
      await ev(`(()=>{const t=document.getElementById('${id}');if(!t)return'none';t.click();return'clicked'})()`)
      await new Promise(r=>setTimeout(r,700))
      const callsN = await ev('()=>window.__calls.length')
      L.push(`BEFORE ${JSON.stringify(before)} | afterClick setCalls=${callsN}`)
    }
    L.push('ALL calls: '+JSON.stringify(await ev('()=>window.__calls')))
    const enabled=await ev(`(async()=>{try{return (await window.provident.security.get()).enabled}catch(e){return'ERR '+e.message}})()`)
    L.push('enabled NOW: '+JSON.stringify(enabled))
  }catch(e){L.push('ERR '+String(e))}
  writeFileSync(out,L.join('\n'));ws.close();process.exit(0)
}
