// src/main/battery-host.ts — the battery host: a Node MCP server (no Electron
// display) whose backend owns a REAL provident-ssr Runtime running under the
// DOM shim. This is the un-parked HEADLESS / Node-only MCP server mode
// (docs/pending.md) + the battery's Unit D host (docs/specs/e2e-test-battery.md
// §6). Spawned over stdio by tests/e2e-battery.test.mjs; the Electron app is
// the same contract against a real DOM (R13 — one Electron run is the
// divergence check before the shim is trusted).
import { ProvidentMcpServer, type McpBackend, type McpTransportKind } from './mcp-server.js'
import { SecurityGate } from './security.js'
import { installShim, mountEl } from '../shared/dom-shim.js'
import { Runtime } from '../renderer/runtime.js'

// A root-only bootstrap envelope (C3): a bare template.root + empty content.
function rootOnlyEnvelope() {
  return {
    template: { root: { type: 'app', props: { id: 'preempt-root' } } },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

/** The Runtime-backed MCP backend: forwards each `provident.*` method to the
 *  live Runtime (battery mode). The Runtime boots root-only (C3); each load/
 *  teardown re-derives the graph. */
class RuntimeBackend implements McpBackend {
  readonly runtime: Runtime

  constructor(maxJournalLength?: number) {
    installShim()
    this.runtime = new Runtime({ mount: mountEl() as never, envelope: rootOnlyEnvelope() as never, maxJournalLength })
    this.runtime.bootstrap()
  }

  async invoke(method: string, payload: unknown): Promise<unknown> {
    const p = (payload ?? {}) as Record<string, unknown>
    switch (method) {
      case 'dispatch':
        return this.runtime.dispatch(p as never)
      case 'renderedHtml':
        return this.runtime.renderedHtmlResult()
      case 'markdown':
        return this.runtime.markdownResult()
      case 'listTargets':
        return this.runtime.listTargets()
      case 'nodeState':
        return this.runtime.nodeState(p as never)
      case 'load':
        return this.runtime.load(p as never)
      case 'op':
        return this.runtime.op(p.command as never)
      case 'export':
        return this.runtime.export(p.format as 'legacy' | 'serialized')
      case 'validate':
        return this.runtime.validate(p.kind as 'legacy' | 'serialized', p.export)
      case 'teardown':
        return this.runtime.teardownResult()
      case 'journal':
        return this.runtime.journal(p.action as 'undo' | 'redo' | 'replay')
      case 'code.get':
        return this.runtime.codeGet(p.path as string)
      case 'code.set':
        return this.runtime.codeSet(p.path as string, p.value)
      case 'code.create':
        return this.runtime.codeCreate(p.path as string, p.entry)
      case 'code.delete':
        return this.runtime.codeDelete(p.path as string, p.index as number | undefined)
      case 'code.validate':
        return this.runtime.codeValidate(p.envelope)
      case 'code.load':
        return this.runtime.codeLoad(p.envelope)
      case 'code.loadBatch':
        return this.runtime.codeLoadBatch(p.ops as never)
      default:
        throw new Error(`unknown method: ${method}`)
    }
  }
}

const transportArg = process.argv.find((a) => a.startsWith('--mcp-transport='))
const transport: McpTransportKind = transportArg?.endsWith('http') ? 'http' : 'stdio'
const portArg = process.argv.find((a) => a.startsWith('--mcp-port='))
const port = portArg ? Number(portArg.slice('--mcp-port='.length)) : 3789
const journalArg = process.argv.find((a) => a.startsWith('--max-journal-length='))
const maxJournalLength = journalArg ? Number(journalArg.slice('--max-journal-length='.length)) : undefined
const backend = new RuntimeBackend(maxJournalLength && maxJournalLength > 0 ? maxJournalLength : undefined)
// The battery host pre-enables ALL tool groups (a deterministic CI path with
// no interactive UI): the full surface — read/dispatch/graph/code — is what the
// battery drives. stdio is spawn-local (trusted).
const gate = new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'graph', 'code'] })
const server = new ProvidentMcpServer({ backend, transport, port, gate })
await server.start()

// A spawned (non-interactive) server must exit when its stdio client
// disconnects — otherwise a test run leaves an orphaned Node process holding
// the runtime open on the machine. StdioServerTransport does not auto-exit.
if (transport === 'stdio') {
  process.stdin.on('end', () => {
    void server.close().finally(() => process.exit(0))
  })
  process.stdin.on('error', () => process.exit(0))
}
