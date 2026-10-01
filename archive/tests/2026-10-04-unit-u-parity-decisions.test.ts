// tests/unit-u-parity-decisions.test.ts — Unit U-PARITY-DECISIONS (PG12 + PG13).
//
// Spec: docs/specs/unit-u-parity-decisions.md §1 (PG12) + §3 fail-states F1/F2;
// rulings W1-Q14 (operator-only module-tool runner, never MCP) and W1-Q15
// (assistant suggestions PARKED until a source exists) in
// docs/specs/wave-1-open-decisions.md.
//
// PG12 (W1-Q14 a) scope under test:
//   - the modal module manager (the module pane authored in
//     src/renderer/secure-panels.ts) authors an OPERATOR-ONLY runner control:
//     a list of a module's registered `module:<name>.<tool>` tools + a minimal
//     args input + a run control + a result surface;
//   - invocation routes through the EXISTING two-gate `invokeModuleTool`
//     (module AND code) — the same seam as the MCP surface, but operator-scope;
//   - a gate-off module fails closed (the two-gate error surfaces, never a
//     crash, never a silent pass);
//   - a bad-args call surfaces the tool's own error;
//   - the runner is NOT MCP-visible (it lives in the isolated SecurePanels graph
//     the app Runtime / MCP endpoints cannot address) and adds NO new tool.
//
// PG13 (W1-Q15) has NO code (PARKED) — recorded in docs/pending.md; no test.
//
// RED set (these fail before the Implementer): SecurePanels has no runner seam,
// the module pane authors no runner control, and no invocation routes through
// the two-gate.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl, type ShimElement } from '../src/shared/dom-shim.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { CapabilityRouter, type ModuleCtx } from '../src/renderer/extensions.js'
import { invokeModuleTool } from '../src/main/mcp-server.js'
import { SecurityGate, type ToolGroup } from '../src/main/security.js'

beforeAll(() => {
  installShim()
})

/** The operator-only runner seam PG12 injects: the router's registered tool
 *  names + an invoke that routes through the EXISTING two-gate `invokeModuleTool`
 *  (module + code). */
interface Runner {
  listTools(): string[]
  invoke(toolName: string, args: unknown): unknown
}

/** A real CapabilityRouter (one `capture.screenshot` tool that throws on
 *  `{ bad: true }`) behind the two-gate `invokeModuleTool`. */
function makeRunner(groups: ToolGroup[]): { runner: Runner; router: CapabilityRouter } {
  const router = new CapabilityRouter()
  router.registerModule('capture', (ctx: ModuleCtx) => {
    ctx.tool('screenshot', (args: unknown) => {
      if (args && typeof args === 'object' && (args as { bad?: boolean }).bad) {
        throw new Error('screenshot: bad args')
      }
      return { shot: args }
    })
  })
  const gate = new SecurityGate({ token: null, enabled: groups })
  return {
    runner: {
      listTools: () => router.listTools(),
      invoke: (toolName, args) => invokeModuleTool(router, gate, toolName, args),
    },
    router,
  }
}

/** Walk a ShimElement tree and return the element whose authored id matches. */
function findById(root: ShimElement, id: string): ShimElement | null {
  if (root.id === id || root.attrs?.['id'] === id) return root
  for (const c of root.children ?? []) {
    const found = findById(c, id)
    if (found) return found
  }
  return null
}

/** Fire a real DOM-style event on a rendered control (the DomAdapter listener
 *  path) — mirrors the shell-6 / secure-panels real-click tests. */
function fire(el: ShimElement, type: string, value?: string): void {
  if (value !== undefined) el.value = value
  for (const fn of el.listeners[type] ?? []) fn({ type, target: el })
}

const TOOL = 'module:capture.screenshot'

// ---- PG12 — the operator-only runner control is authored --------------------

describe('PG12 — the module pane authors an operator-only runner control', () => {
  it('1. the module pane renders the tool list + args input + run control + result surface', async () => {
    const mount = mountEl()
    const { runner } = makeRunner(['read', 'dispatch', 'module', 'code'])
    const panels = new SecurePanels(mount as never, { moduleRunner: runner })
    await panels.refresh()
    const html = mount.innerHTML
    expect(html).toContain('module-tool-list')
    expect(html).toContain(TOOL)
    expect(html).toContain('module-args-input')
    expect(html).toContain('module-run')
    expect(html).toContain('module-run-result')
  })

  it('2. an empty runner renders a placeholder state, never a crash', async () => {
    const mount = mountEl()
    const panels = new SecurePanels(mount as never)
    await panels.refresh()
    const html = mount.innerHTML
    expect(html).toContain('module-tool-list')
    expect(html).toContain('(no module tools)')
    expect(html).toContain('module-run')
  })
})

// ---- PG12 — invocation routes through the two-gate --------------------------

describe('PG12 — invocation routes through the existing two-gate invokeTool', () => {
  it('3. selecting a tool + args then running returns the tool result on the result surface', async () => {
    const mount = mountEl()
    const { runner, router } = makeRunner(['read', 'dispatch', 'module', 'code'])
    const panels = new SecurePanels(mount as never, { moduleRunner: runner })
    await panels.refresh()
    expect(router.hasTool(TOOL)).toBe(true)

    await panels.dispatch(`module-tool:${TOOL}`)
    const input = findById(mount, 'module-args-input')
    expect(input).toBeTruthy()
    fire(input!, 'input', '{"id":7}')
    await new Promise((r) => setTimeout(r, 0))
    await panels.dispatch('module-run')

    const html = mount.innerHTML
    expect(html).toContain('shot')
    expect(html).toContain('7')
  })

  it('4. a gate-off module fails closed — the two-gate error surfaces, no crash (F2)', async () => {
    const mount = mountEl()
    // module enabled, code NOT — the invocation two-gate must deny.
    const { runner } = makeRunner(['read', 'dispatch', 'module'])
    const panels = new SecurePanels(mount as never, { moduleRunner: runner })
    await panels.refresh()
    await panels.dispatch(`module-tool:${TOOL}`)
    await expect(panels.dispatch('module-run')).resolves.toBeUndefined()
    const html = mount.innerHTML
    expect(html).toContain('error')
    expect(html).toContain('code')
  })

  it('5. a bad-args call surfaces the tool\'s own error (F1)', async () => {
    const mount = mountEl()
    const { runner } = makeRunner(['read', 'dispatch', 'module', 'code'])
    const panels = new SecurePanels(mount as never, { moduleRunner: runner })
    await panels.refresh()
    await panels.dispatch(`module-tool:${TOOL}`)
    const input = findById(mount, 'module-args-input')
    fire(input!, 'input', '{"bad":true}')
    await new Promise((r) => setTimeout(r, 0))
    await panels.dispatch('module-run')
    expect(mount.innerHTML).toContain('screenshot: bad args')
  })

  it('6. a missing tool body surfaces the router error (F1)', async () => {
    const mount = mountEl()
    const { runner } = makeRunner(['read', 'dispatch', 'module', 'code'])
    // A seam that advertises a tool the router cannot resolve.
    const ghost: Runner = {
      listTools: () => ['module:ghost.missing'],
      invoke: (toolName, args) => runner.invoke(toolName, args),
    }
    const panels = new SecurePanels(mount as never, { moduleRunner: ghost })
    await panels.refresh()
    await panels.dispatch('module-tool:module:ghost.missing')
    await panels.dispatch('module-run')
    expect(mount.innerHTML).toContain('module tool not registered')
  })
})

// ---- W1-N10 — the async (real-IPC) runner seam ------------------------------

describe('W1-N10 — the runner seam awaits an async invoke result', () => {
  it('8. an async invoke resolving a value renders the resolved result, never `ok: {}`', async () => {
    const mount = mountEl()
    // The production seam reaches main over async IPC (`IPC_MODULE_TOOL_INVOKE`),
    // so `invoke` returns a Promise. The pane must AWAIT it and render the
    // resolved value — a synchronous stringify of the Promise yields `ok: {}`.
    const asyncRunner: Runner = {
      listTools: () => [TOOL],
      invoke: async (_toolName, args) => {
        await new Promise((r) => setTimeout(r, 1))
        return { shot: args, async: true }
      },
    }
    const panels = new SecurePanels(mount as never, { moduleRunner: asyncRunner })
    await panels.refresh()
    await panels.dispatch(`module-tool:${TOOL}`)
    const input = findById(mount, 'module-args-input')
    fire(input!, 'input', '{"id": 42}')
    await new Promise((r) => setTimeout(r, 0))
    await panels.dispatch('module-run')
    const html = mount.innerHTML
    expect(html).not.toContain('ok: {}')
    expect(html).toContain('shot')
    expect(html).toContain('42')
    expect(html).toContain('async')
  })
})

// ---- PG12 — operator scope / not MCP-visible --------------------------------

describe('PG12 — operator scope: the runner is NOT MCP-visible', () => {
  it('7. the runner lives only in the isolated pane graph the app Runtime cannot address', async () => {
    const appMount = mountEl()
    const paneMount = mountEl()
    const { runner } = makeRunner(['read', 'dispatch', 'module', 'code'])
    const panels = new SecurePanels(paneMount as never, { moduleRunner: runner })
    await panels.refresh()

    // The app Runtime boots a DIFFERENT (agent-visible) graph — it must never
    // see the runner controls (MCP dispatch/get_rendered_html/list_targets read
    // only the app Runtime's graph).
    const app = new Runtime({ mount: appMount as never, envelope: demoEnvelope() as never })
    app.bootstrap()
    expect(app.renderedHtmlResult().renderedHtml).not.toContain('module-run')
    expect(app.renderedHtmlResult().renderedHtml).not.toContain('module-tool-list')
    const targets = app.listTargets().nodes
    expect(targets.some((n) => (n.content as string | undefined)?.includes('Run tool'))).toBe(false)

    // The operator pane's own graph shows it.
    expect(paneMount.innerHTML).toContain('module-run')
  })
})
