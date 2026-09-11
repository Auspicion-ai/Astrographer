import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'

const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3787/mcp'), {
  requestInit: { headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' } },
})
const client = new Client({ name: 'live-runner', version: '1.0' })
await client.connect(transport)
const tools = await client.listTools()
const names = tools.tools.map((t) => t.name)
console.log('TOOL COUNT:', names.length)
const gnosis = names.filter((n) => n.startsWith('gnosis'))
console.log('GNOSIS TOOLS (' + gnosis.length + '):')
console.log(gnosis.join('\n'))
await client.close()
