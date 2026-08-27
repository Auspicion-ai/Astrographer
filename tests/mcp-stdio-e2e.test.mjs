// tests/mcp-stdio-e2e.test.mjs — drive the standalone MCP server (stdio AND
// http) with the SDK client end-to-end: tools listing, dispatch,
// rendered-html read, target listing, node state. Runs against the BUILT
// dist/main/standalone.mjs.
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const here = dirname(fileURLToPath(import.meta.url))
const serverPath = join(here, '..', 'dist', 'main', 'standalone.mjs')

async function exercise(client) {
  const tools = await client.listTools()
  console.log('TOOLS:', tools.tools.map((t) => t.name).join(', '))
  const r1 = await client.callTool({ name: 'provident.dispatch', arguments: { target: { kind: 'cssId', cssId: 'inc' }, event: 'click' } })
  console.log('DISPATCH:', JSON.stringify(JSON.parse(r1.content[0].text).results))
  const r2 = await client.callTool({ name: 'provident.get_rendered_html', arguments: {} })
  console.log('HTML has counter:', JSON.parse(r2.content[0].text).renderedHtml.includes('counter'))
  const r3 = await client.callTool({ name: 'provident.list_targets', arguments: {} })
  console.log('TARGETS:', JSON.parse(r3.content[0].text).nodes.length)
  const r4 = await client.callTool({ name: 'provident.get_node_state', arguments: { target: 'counter' } })
  console.log('NODE STATE states>0:', JSON.parse(r4.content[0].text).states.length > 0)
  await client.close()
}

// ---- leg 1: stdio ----------------------------------------------------------
console.log('--- STDIO ---')
{
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath, '--mcp-transport=stdio'],
  })
  const client = new Client({ name: 'provident-e2e', version: '0.1.0' })
  await client.connect(transport)
  await exercise(client)
}

// ---- leg 2: Streamable HTTP (standalone, Node 18 + crypto polyfill) --------
console.log('--- HTTP ---')
{
  const server = spawn(process.execPath, [serverPath, '--mcp-transport=http', '--mcp-port=3788'], {
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stderr = ''
  server.stderr.on('data', (d) => {
    stderr += String(d)
  })
  await new Promise((resolve, reject) => {
    const t0 = Date.now()
    const poll = () => {
      if (stderr.includes('http transport ready')) return resolve()
      if (Date.now() - t0 > 10000) return reject(new Error(`server not ready: ${stderr}`))
      setTimeout(poll, 100)
    }
    poll()
  })
  try {
    const transport = new StreamableHTTPClientTransport(new URL('http://127.0.0.1:3788/mcp'))
    const client = new Client({ name: 'provident-e2e', version: '0.1.0' })
    await client.connect(transport)
    await exercise(client)
  } finally {
    server.kill()
  }
}

console.log('MCP-E2E-OK')