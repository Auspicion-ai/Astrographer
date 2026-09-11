import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3787/mcp'))
const client = new Client({ name: 'live-runner', version: '1.0' })
await client.connect(transport)
const tools = await client.listTools()
console.log(tools.tools.map((t) => t.name).sort().join('\n'))
await client.close()
