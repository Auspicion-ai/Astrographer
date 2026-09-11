import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3787/mcp'))
const client = new Client({ name: 'live-runner', version: '1.0' })
await client.connect(transport)
const tools = await client.listTools()
console.log('TOOL COUNT:', tools.tools.length)
const gnosis = tools.tools.filter((t) => t.name.startsWith('gnosis'))
console.log('GNOSIS (' + gnosis.length + '):'); console.log(gnosis.map((t) => t.name).join('\n'))
await client.close()
