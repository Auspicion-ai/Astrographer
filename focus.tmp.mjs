const targets = await (await fetch('http://127.0.0.1:9222/json')).json()
const page = targets.find(t=>t.type==='page')
const ws = new WebSocket(page.webSocketDebuggerUrl); await new Promise(r=>ws.onopen=r)
let id=0; const pend=new Map()
ws.onmessage=(e)=>{const m=JSON.parse(e.data); if(m.id&&pend.has(m.id)){pend.get(m.id)(m);pend.delete(m.id)}}
const send=(m,p={})=>new Promise(res=>{const i=++id;pend.set(i,res);ws.send(JSON.stringify({id:i,method:m,params:p}))}).then(x=>{if(x.error)throw new Error(JSON.stringify(x.error));return x.result})
const ev=async(e)=>{const {result}=await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});return result.value}
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms))
// open the mcp-endpoint doc as a tab through the host seam (a real UI path)
console.log('open tab:', JSON.stringify(await ev(`(async()=>{try{return await window.provident.sidebar.openDocumentTab('docs/specs/mcp-endpoint')}catch(e){return 'ERR '+e}})()`)).slice(0,80))
await sleep(3000)
console.log(JSON.stringify(await ev(`(()=>{
  const stage=document.getElementById('zone:main');
  const p=stage.querySelector('[data-rag-node-id="docs/specs/mcp-endpoint:p:1"]');
  const txt=p?(p.textContent||'').replace(/\\s+/g,' '):'';
  const head=p?p.closest('[data-doc-head]'):null;
  return {head:(stage.querySelector('[data-doc-head]')||{}).id, inlineInPlace:/parked Phase C \\(cross-process/.test(txt),
    snippet:txt.slice(txt.indexOf('parked'), txt.indexOf('parked')+70), nestedInHead:!!head,
    mounts:document.querySelectorAll('#wiki-root').length, appTop:Math.round(document.getElementById('app').getBoundingClientRect().y), scrollY:Math.round(window.scrollY)};
})()`),null,1))
process.exit(0)
