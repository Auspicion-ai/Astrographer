// src/main/standalone.ts — a rendererless standalone MCP server (stdio or
// http). Reuses ProvidentMcpServer with a mock backend so the MCP tool wiring
// + transports can be verified without an Electron window (and to validate
// the "headless MCP mode" idea in docs/pending.md). Built to
// dist/main/standalone.mjs; driven by the SDK client (tests/mcp-stdio-e2e.test.mjs).
import { webcrypto } from 'node:crypto'
import { ProvidentMcpServer, type McpBackend, type McpTransportKind } from './mcp-server.js'

// The Streamable HTTP transport needs globalThis.crypto (Node ≥19 / Electron
// ≥20 embedded Node). Node 18 lacks it — polyfill so the HTTP path is
// testable on the dev shell too.
if (typeof globalThis.crypto === 'undefined') {
  ;(globalThis as Record<string, unknown>).crypto = webcrypto
}

class MockBackend implements McpBackend {
  async invoke(method: string, payload: unknown): Promise<unknown> {
    switch (method) {
      case 'dispatch': {
        const req = payload as { target: unknown; event: string; requestId?: string }
        return {
          results: [undefined],
          dirtied: ['node-2'],
          renderedHtml: '<div class="demo-shell"><div id="counter">1</div></div>',
          ssrHtml: '<div class="demo-shell"><div id="counter">1</div></div>',
          ...(req.requestId !== undefined ? { deduplicated: req.requestId === 'dup' } : {}),
        }
      }
      case 'renderedHtml':
        return {
          renderedHtml: '<div class="demo-shell"><div id="counter">0</div></div>',
          ssrHtml: '<div class="demo-shell"><div id="counter">0</div></div>',
          census: { registered: 9, inTree: 9, unplaced: 0, destroyed: 0, prototypes: 0 },
        }
      case 'listTargets':
        return {
          nodes: [
            { nodeId: 'node-2', cssId: 'counter', propsId: 'counter', type: 'div', content: '0', state: 'in-tree', inTree: true, handlers: [] },
            { nodeId: 'node-3', cssId: 'inc', type: 'button', state: 'in-tree', inTree: true, handlers: [{ name: 'inc', event: 'click' }] },
          ],
        }
      case 'nodeState':
        return { nodeId: 'node-2', states: [{ nodeId: 'node-2', status: 'ok' }], census: { registered: 9, inTree: 9, unplaced: 0, destroyed: 0, prototypes: 0 } }
      default:
        throw new Error(`unknown method: ${method}`)
    }
  }
}

const transportArg = process.argv.find((a) => a.startsWith('--mcp-transport='))
const transport: McpTransportKind = transportArg?.endsWith('http') ? 'http' : 'stdio'
const portArg = process.argv.find((a) => a.startsWith('--mcp-port='))
const port = portArg ? Number(portArg.slice('--mcp-port='.length)) : 3788
const server = new ProvidentMcpServer({ backend: new MockBackend(), transport, port })
await server.start()

// A spawned (non-interactive) server must exit when its stdio client
// disconnects — otherwise a test run leaves an orphaned Node process on the
// machine. StdioServerTransport does not auto-exit.
if (transport === 'stdio') {
  process.stdin.on('end', () => {
    void server.close().finally(() => process.exit(0))
  })
  process.stdin.on('error', () => process.exit(0))
}