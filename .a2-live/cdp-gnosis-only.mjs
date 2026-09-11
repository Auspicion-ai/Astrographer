import { writeFileSync } from 'node:fs'
import { WebSocket } from 'undici'
const wsUrl=process.argv[2],out=process.argv[3]||'/tmp/gnosis-only.txt'
const ws=new WebSocket(wsUrl);let seq=0;const P=new Map()
const send=(m,p={})=>{const id=++seq;return new Promise(r=>{P.set(id,r);ws.send(JSON.stringify({id,method:m,params:p}))})}
ws.onmessage=e=>{const m=JSON.parse(String(e.data));if(m.id&&P.has(m.id)){P.get(m.id)(m.result);P.delete(m.id)}}
ws.onerror=e=>{writeFileSync(out,'WSERR '+String(e));process.exit(1)}
ws.onopen=async()=>{
  const L=[]
  try{
    await send('Runtime.enable')
    const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true}))?.result?.value
    // fresh instrumentation BEFORE any other click
    await ev(`(()=>{window.__patches=[];const o=window.provident.security.set.bind(window.provident.security);window.provident.security.set=p=>{window.__patches.push(JSON.parse(JSON.stringify(p)));return o(p)};return 1})()`)
    const enabledBefore=await ev(`(async()=>{try{return (await window.provident.security.get()).enabled}catch(e){return'ERR '+e.message}})()`)
    L.push('enabled BEFORE: '+JSON.stringify(enabledBefore))
    const gnosisBefore=await ev(`(()=>{const t=document.getElementById('toggle:gnosis');return t?t.dataset.on:null})()`)
    L.push('gnosis data-on BEFORE: '+gnosisBefore)
    await ev(`(()=>{const t=document.getElementById('toggle:gnosis');if(!t)return'none';t.click();return'clicked'})()`)
    await new Promise(r=>setTimeout(r,1000))
    const patches=await ev('()=>window.__patches')
    L.push('patches: '+JSON.stringify(patches))
    const enabledAfter=await ev(`(async()=>{try{return (await window.provident.security.get()).enabled}catch(e){return'ERR '+e.message}})()`)
    L.push('enabled AFTER: '+JSON.stringify(enabledAfter))
    const gnosisAfter=await ev(`(()=>{const t=document.getElementById('toggle:gnosis');return t?{on:t.dataset.on,text:t.textContent.slice(0,6)}:null})()`)
    L.push('gnosis AFTER: '+JSON.stringify(gnosisAfter))
  }catch(e){L.push('ERR '+String(e))}
  writeFileSync(out,L.join('\n'));ws.close();process.exit(0)
}
