import { writeFileSync } from 'node:fs'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'

const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3787/mcp'))
const client = new Client({ name: 'live-list-summary', version: '1.0' })
await client.connect(transport)

const rows = []
const call = async (name, args) => {
  try {
    const r = await client.callTool({ name, arguments: args ?? {} })
    const t = r.content?.[0]?.type === 'text' ? r.content[0].text : JSON.stringify(r)
    let parsed = null
    try { parsed = t.startsWith('{') || t.startsWith('[') ? JSON.parse(t) : t } catch { parsed = t }
    return { isError: !!r.isError, text: t, err: r.isError ? t : '', parsed }
  } catch (e) {
    return { isError: true, text: String(e.message), err: String(e.message), parsed: null }
  }
}

const R = (scn, name, res) => {
  rows.push({ scn, name, ok: !res.isError, err: res.err, full: res.text })
  return res
}

// Fresh populated wiki round-trip
const w = await call('gnosis.wiki.create', { callerId: 'operator', name: 'list-summary-' + Date.now() })
R('setup', 'wiki.create', w)
const wikiId = w.parsed?.wikiId
let docId = null
if (wikiId) {
  const d = await call('gnosis.document.create', { callerId: 'operator', wikiId, title: 'doc-' + Date.now() })
  R('setup', 'document.create', d)
  docId = d.parsed?.documentId
}

// THE FIX: document.list on the POPULATED wiki
const listPop = await call('gnosis.document.list', { wikiId })
R('G1/G6', 'document.list (populated)', listPop)

// EMPTY wiki (zero docs)
const emptyWiki = await call('gnosis.wiki.create', { callerId: 'operator', name: 'empty-' + Date.now() })
const emptyWikiId = emptyWiki.parsed?.wikiId
R('setup', 'wiki.create (empty)', emptyWiki)
const listEmpty = await call('gnosis.document.list', { wikiId: emptyWikiId })
R('G4', 'document.list (empty)', listEmpty)

// Residual sanity — the reads + delete stay green (no GET-body / -32602)
const wikiGet = await call('gnosis.wiki.get', { wikiId })
R('read', 'wiki.get', wikiGet)
const docGet = docId ? await call('gnosis.document.get', { documentId: docId }) : { isError: true, err: 'no doc' }
R('read', 'document.get', docGet)
const del = docId ? await call('gnosis.document.delete', { callerId: 'operator', documentId: docId }) : { isError: true, err: 'no doc' }
R('read', 'document.delete', del)

writeFileSync('/tmp/gnosis-list-summary-live.txt', JSON.stringify(rows, null, 2))

// Human-readable summary
for (const r of rows) {
  console.log(`\n=== ${r.name}${r.scn ? '  [' + r.scn + ']' : ''}  ok=${r.ok}`)
  if (r.err) console.log('  ERR:', r.err.slice(0, 500))
  else console.log('  ', r.full.slice(0, 800))
}
await client.close()
