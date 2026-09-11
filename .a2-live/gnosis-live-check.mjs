import { writeFileSync } from 'node:fs'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3787/mcp'))
const client = new Client({ name:'live', version:'1' })
await client.connect(transport)
const rows=[]
const R=(scn,name,res)=>{rows.push({scn,name,ok:!res.isError,text:(res.isError?res.err:res.text).slice(0,240)});return res}
const call=async(name,args)=>{try{const r=await client.callTool({name,arguments:args??{}});const t=r.content?.[0]?.type==='text'?r.content[0].text:JSON.stringify(r);return{isError:!!r.isError,text:t,err:r.isError?t:''}}catch(e){return{isError:true,text:String(e.message),err:String(e.message)}}}
// create fresh wiki+doc
const w=await call('gnosis.wiki.create',{callerId:'operator',name:'c'+Date.now()}); const wikiId=w.text?JSON.parse(w.text).wikiId:null
R('G11','wiki.create',w)
const d=await call('gnosis.document.create',{callerId:'operator',wikiId,title:'d'+Date.now()}); const docId=d.text?JSON.parse(d.text).documentId:null
R('G5','doc.create',d)
// G6 update with CORRECT wire graph shape {nodes:[],edges:[]}
R('G6','doc.update graph={nodes,edges}',await call('gnosis.document.update',{callerId:'operator',documentId:docId,baseRevision:0,graph:{nodes:[],edges:[]}}))
// G7 delete
R('G7','doc.delete',await call('gnosis.document.delete',{callerId:'operator',documentId:docId}))
writeFileSync('/tmp/gnosis-check.txt',JSON.stringify(rows,null,2))
await client.close()
