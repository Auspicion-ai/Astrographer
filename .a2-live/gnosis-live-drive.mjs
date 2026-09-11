// Driveable live gnosis scenarios against the running app's MCP over HTTP.
import { writeFileSync } from 'node:fs'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'

const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3787/mcp'))
const client = new Client({ name: 'live-gnosis', version: '1.0' })
await client.connect(transport)

const out = []
const log = (k, v) => { out.push(`${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`) }

const call = async (name, args) => {
  try { return { name, ok: true, result: await client.callTool({ name, arguments: args }) } }
  catch (e) { return { name, ok: false, error: e.message } }
}

// G19: tools/list registration (already verified 14 gnosis tools)
const tools = await client.listTools()
const g = tools.tools.filter(t => t.name.startsWith('gnosis'))
log('G19 tools/list gnosis count', g.length)

// G18/G23: unknown gnosis tool fail-closed
log('G18 unknown gnosis.document.other', (await call('gnosis.document.other', {})))
log('G23 unknown gnosis.frobnicate', (await call('gnosis.frobnicate', {})))

// G4 listWikis (read round-trip — the E1 read half adjudication)
log('G4 wiki.list', await call('gnosis.wiki.list', {}))

writeFileSync(process.argv[3] || '/tmp/gnosis-live-out.txt', out.join('\n'))
await client.close()
