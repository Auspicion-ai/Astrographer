// Full live gnosis scenario drive (engine Ready): A2 G1-G14, G20-G23 +
// shell-integration R1 read round-trips. Records structured results.
import { writeFileSync } from 'node:fs'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'

const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3787/mcp'))
const client = new Client({ name: 'live-gnosis', version: '1.0' })
await client.connect(transport)
const rows = []
const R = (scn, name, res) => rows.push({ scn, name, ok: !res.isError, text: res.isError ? res.err : res.text })

const call = async (name, args) => {
  try {
    const r = await client.callTool({ name, arguments: args ?? {} })
    const text = r.content?.[0]?.type === 'text' ? r.content[0].text : JSON.stringify(r)
    return { isError: !!r.isError, err: text, text }
  } catch (e) { return { isError: true, err: String(e.message), text: String(e.message) } }
}

// G11 createWiki
const wiki = await call('gnosis.wiki.create', { callerId: 'operator', name: 'w-live' + Date.now() })
R('G11', 'wiki.create', wiki)
// G3/G4 wiki read round-trips
R('G4', 'wiki.list', await call('gnosis.wiki.list', {}))
// G5 createDocument
const doc = await call('gnosis.document.create', { callerId: 'operator', wikiId: 'w-live', title: 'T' + Date.now() })
R('G5', 'document.create', doc)
// G2 document.list
R('G2', 'document.list', await call('gnosis.document.list', { wikiId: 'w-live' }))

writeFileSync(process.argv[2] || '/tmp/gnosis-live-full.txt', JSON.stringify(rows, null, 2))
await client.close()
