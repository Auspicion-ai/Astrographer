// scripts/mcp-cli.mjs — a local CLI toolset that drives ALL the Provident-Electron
// MCP endpoints (docs/specs/mcp-endpoint.md §3/§4) for development + dynamic
// testing. Two targets:
//   - battery (default): spawns dist/main/battery-host.mjs (a REAL Runtime under
//     the DOM shim, all tool groups pre-enabled) over stdio — a throwaway,
//     deterministic host for CI-style probing.
//   - http: connects to a RUNNING app (the real Electron app, or a standalone
//     server) at http://127.0.0.1:<port>/mcp — the live development target.
//
// Usage:
//   node scripts/mcp-cli.mjs [--target battery|http] [--port <n>] <command> [args...]
//
// Commands (one per MCP endpoint):
//   dispatch <target> <event> [jsonArgs] [requestId]
//   html                          -> provident.get_rendered_html
//   targets                       -> provident.list_targets
//   node-state <target>           -> provident.get_node_state
//   load-envelope <jsonFile|->     -> provident.load {kind:'envelope'}
//   load-doc <jsonFile|->          -> provident.load {kind:'doc'}
//   load-commands <jsonFile|->     -> provident.load {kind:'commands'}
//   op <jsonCommand>              -> provident.op
//   export <legacy|serialized>    -> provident.export
//   validate <legacy|serialized> <jsonExport>
//   teardown                      -> provident.teardown
//   code-get <path>               -> provident.code.get
//   code-set <path> <jsonValue>   -> provident.code.set
//   code-create <path> <jsonEntry>-> provident.code.create
//   code-delete <path> [index]    -> provident.code.delete
//   code-validate [jsonEnvelope]  -> provident.code.validate
//   code-load [jsonEnvelope]      -> provident.code.load
//   tools                         -> list the registered tools
//   run <steps.json|->            -> execute an ARRAY of {cmd, args} steps
//                                    against ONE persistent host (so a dispatch
//                                    can see a prior load). Each step's result
//                                    prints; the last step's result is the exit
//                                    value. `args` is the raw tool-arguments
//                                    object (targets/values passed verbatim).
//
// `target` is a bare string (resolved css.id -> nodeId) or a JSON object
// ({kind:'cssId',cssId} | {kind:'nodeId',nodeId} | {kind:'wire',wire}).
// A `-` for a JSON file reads stdin. Results print as pretty JSON.
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const here = dirname(fileURLToPath(import.meta.url))
const serverPath = join(here, '..', 'dist', 'main', 'battery-host.mjs')

function usage() {
  console.error(`Usage: node scripts/mcp-cli.mjs [--target battery|http] [--port <n>] <command> [args...]

Targets:
  battery (default)  spawn the battery host (DOM shim, all groups) over stdio
  http               connect to a RUNNING app at http://127.0.0.1:<port>/mcp
                     (the real Electron app, or a standalone server)

Commands (one per MCP endpoint):
  dispatch <target> <event> [jsonArgs] [requestId]
  html
  targets
  node-state <target>
  load-envelope <jsonFile|->
  load-doc <jsonFile|->
  load-commands <jsonFile|->
  op <jsonCommand>
  export <legacy|serialized>
  validate <legacy|serialized> <jsonExport>
  teardown
  code-get <path>
  code-set <path> <jsonValue>
  code-create <path> <jsonEntry>
  code-delete <path> [index]
  code-validate [jsonEnvelope]
  code-load [jsonEnvelope]
  tools
  run <steps.json|->`)
}

function parseTarget(t) {
  if (t === undefined) throw new Error('missing target')
  if (t.startsWith('{')) return JSON.parse(t)
  return t
}

async function readJsonArg(arg) {
  if (arg === undefined) return undefined
  if (arg === '-') {
    const fs = await import('node:fs')
    return JSON.parse(fs.readFileSync(0, 'utf8'))
  }
  if (arg.startsWith('{') || arg.startsWith('[')) return JSON.parse(arg)
  // a bare path to a JSON file
  const fs = await import('node:fs')
  if (fs.existsSync(arg)) return JSON.parse(fs.readFileSync(arg, 'utf8'))
  return arg
}

async function main() {
  const argv = process.argv.slice(2)
  // parse leading flags: --target <battery|http> and --port <n>
  let target = 'battery'
  let port = 3787
  const rest = []
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--target') {
      target = argv[++i]
    } else if (a === '--port') {
      port = Number(argv[++i])
    } else if (a === '--help' || a === '-h') {
      usage()
      process.exit(0)
    } else {
      rest.push(a)
    }
  }
  const [cmd, ...cmdArgs] = rest
  if (!cmd) {
    usage()
    process.exit(1)
  }

  let transport
  let client
  if (target === 'http') {
    transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/mcp`))
    client = new Client({ name: 'provident-mcp-cli', version: '0.1.0' })
    await client.connect(transport)
  } else {
    transport = new StdioClientTransport({
      command: process.execPath,
      args: [serverPath, '--mcp-transport=stdio'],
    })
    client = new Client({ name: 'provident-mcp-cli', version: '0.1.0' })
    await client.connect(transport)
  }

  const call = async (name, args = {}) => {
    const r = await client.callTool({ name, arguments: args })
    return JSON.parse(r.content[0].text)
  }

  let out
  switch (cmd) {
    case 'run': {
      const steps = await readJsonArg(cmdArgs[0])
      if (!Array.isArray(steps)) throw new Error('run expects an array of {cmd, args} steps')
      for (const step of steps) {
        const name = step.cmd
        const args = step.args ?? {}
        const r = await client.callTool({ name, arguments: args })
        const value = JSON.parse(r.content[0].text)
        console.log(`\n[${name}]`)
        console.log(JSON.stringify(value, null, 2))
        out = value
      }
      break
    }
    case 'tools': {
      const t = await client.listTools()
      out = { tools: t.tools.map((x) => x.name) }
      break
    }
    case 'dispatch': {
      const [target, event, argsJson, requestId] = cmdArgs
      const args = argsJson !== undefined ? JSON.parse(argsJson) : undefined
      out = await call('provident.dispatch', {
        target: parseTarget(target),
        event,
        ...(args !== undefined ? { args } : {}),
        ...(requestId !== undefined ? { requestId } : {}),
      })
      break
    }
    case 'html':
      out = await call('provident.get_rendered_html', {})
      break
    case 'targets':
      out = await call('provident.list_targets', {})
      break
    case 'node-state':
      out = await call('provident.get_node_state', { target: parseTarget(cmdArgs[0]) })
      break
    case 'load-envelope':
      out = await call('provident.load', { kind: 'envelope', envelope: await readJsonArg(cmdArgs[0]) })
      break
    case 'load-doc':
      out = await call('provident.load', { kind: 'doc', doc: await readJsonArg(cmdArgs[0]) })
      break
    case 'load-commands':
      out = await call('provident.load', { kind: 'commands', commands: await readJsonArg(cmdArgs[0]) })
      break
    case 'op':
      out = await call('provident.op', { command: await readJsonArg(cmdArgs[0]) })
      break
    case 'export':
      out = await call('provident.export', { format: cmdArgs[0] ?? 'legacy' })
      break
    case 'validate':
      out = await call('provident.validate', { kind: cmdArgs[0], export: await readJsonArg(cmdArgs[1]) })
      break
    case 'teardown':
      out = await call('provident.teardown', {})
      break
    case 'code-get':
      out = await call('provident.code.get', { path: cmdArgs[0] })
      break
    case 'code-set':
      out = await call('provident.code.set', { path: cmdArgs[0], value: await readJsonArg(cmdArgs[1]) })
      break
    case 'code-create':
      out = await call('provident.code.create', { path: cmdArgs[0], entry: await readJsonArg(cmdArgs[1]) })
      break
    case 'code-delete':
      out = await call('provident.code.delete', { path: cmdArgs[0], ...(cmdArgs[1] !== undefined ? { index: Number(cmdArgs[1]) } : {}) })
      break
    case 'code-validate':
      out = await call('provident.code.validate', cmdArgs[0] !== undefined ? { envelope: await readJsonArg(cmdArgs[0]) } : {})
      break
    case 'code-load':
      out = await call('provident.code.load', cmdArgs[0] !== undefined ? { envelope: await readJsonArg(cmdArgs[0]) } : {})
      break
    default:
      console.error(`unknown command: ${cmd}`)
      usage()
      await client.close()
      process.exit(1)
  }

  console.log(JSON.stringify(out, null, 2))
  await client.close()
  process.exit(0)
}

main().catch((e) => {
  console.error(`mcp-cli error: ${e.message}`)
  process.exit(1)
})
