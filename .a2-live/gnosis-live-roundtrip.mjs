import { writeFileSync } from 'node:fs'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3787/mcp'))
const client = new Client({ name: 'live-gnosis', version: '1.0' })
await client.connect(transport)
const rows = []
const R = (scn, name, res) => { const txt = res.isError ? res.err : res.text; rows.push({ scn, name, ok: !res.isError, text: txt.slice(0, 300) }); return res }
const call = async (name, args) => { try { const r = await client.callTool({ name, arguments: args ?? {} }); const t = r.content?.[0]?.type==='text'?r.content[0].text:JSON.stringify(r); return { isError: !!r.isError, text:t, err:r.isError?t:'', parsed: t.startsWith('{')||t.startsWith('[')?JSON.parse(t):t } } catch(e){ return { isError:true, text:String(e.message), err:String(e.message), parsed:null } } }

// --- mutating round-trip (G11, G5, G6, G8, G9, G10, G7) ---
const w = await call('gnosis.wiki.create', { callerId:'operator', name:'rt'+Date.now() })
R('G11','wiki.create', w)
const wikiId = w.parsed?.wikiId
const d = await call('gnosis.document.create', { callerId:'operator', wikiId, title:'doc'+Date.now() })
R('G5','document.create', d)
const docId = d.parsed?.documentId
const upd = await call('gnosis.document.update', { callerId:'operator', documentId:docId, baseRevision:0, graph:{root:'div',children:[{type:'p',content:'hi'}]} })
R('G6','document.update', upd)
const pub = await call('gnosis.document.publish', { callerId:'operator', documentId:docId })
R('G8','document.publish', pub)
const unpub = await call('gnosis.document.unpublish', { callerId:'operator', documentId:docId })
R('G9','document.unpublish', unpub)
const arch = await call('gnosis.document.archive', { callerId:'operator', documentId:docId })
R('G10','document.archive', arch)
const del = await call('gnosis.document.delete', { callerId:'operator', documentId:docId })
R('G7','document.delete', del)

// --- read round-trips (the E1 read half / R1 — the GET-with-body adjudication) ---
R('G4/R1','wiki.list (GET-with-body)', await call('gnosis.wiki.list', {}))
R('G1/R1','document.get (GET-with-body)', await call('gnosis.document.get', { documentId: docId }))
R('G2/R1','document.list (GET-with-body)', await call('gnosis.document.list', { wikiId }))
R('G3/R1','wiki.get (GET-with-body)', await call('gnosis.wiki.get', { wikiId }))

// --- audit / group / deny (G20-G23, G18) ---
R('G20','get_query_audit_log (CRUD no-audit)', await call('get_query_audit_log', {}))
R('G18','unknown gnosis.document.other', await call('gnosis.document.other', {}))
R('G23','unknown gnosis.frobnicate', await call('gnosis.frobnicate', {}))
R('F40','mutate with no-authority caller (no callerId)', await call('gnosis.document.create', { wikiId, title:'noauth' }))

writeFileSync('/tmp/gnosis-live-rt.txt', JSON.stringify(rows, null, 2))
await client.close()
