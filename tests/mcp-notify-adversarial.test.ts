// tests/mcp-notify-adversarial.test.ts — the adversarial pass for the gated
// live-change-notification surface (live-notification-review.md N1-N7). Hunts:
//   A1  N3 — the notify source is app-Runtime-ONLY: a SecurePanels operator
//       action (group toggle / token regenerate) must NEVER emit a push (that
//       would leak operator activity to the agent through the push channel).
//   A2  N5 — a read-disabled gate delivers nothing (no resource capability).
//   A3  N1 — a notify is a per-resource content update, never a tool/list-
//       changed (those are applyGatePatch-only).
//   A4  N2 — an HTTP notify is a no-op, never a hang/throw.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim } from '../src/shared/dom-shim.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'
import { SecurityGate } from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'

beforeAll(() => {
  installShim()
})

function makeBackend(): McpBackend {
  return { invoke: async () => ({}) }
}

function fakeSecurity() {
  let cfg = { token: null, enabled: ['read', 'dispatch'] }
  return {
    bridge: {
      get: async () => ({ ...cfg }),
      set: async (patch: { token?: string | null; groups?: string[]; disable?: string[] }) => {
        const next = { ...cfg }
        if ('token' in patch) next.token = patch.token ?? null
        if (patch.groups) for (const g of patch.groups) if (!next.enabled.includes(g)) next.enabled.push(g)
        if (patch.disable) next.enabled = next.enabled.filter((g) => !patch.disable!.includes(g))
        cfg = next
        return { ...next }
      },
    },
  }
}

describe('A1 — N3: SecurePanels NEVER emits the notify (no operator leak)', () => {
  it('a pane graph has NO notify surface — an operator action cannot push to the agent', async () => {
    const fake = fakeSecurity()
    ;(globalThis as unknown as { window?: unknown }).window = { provident: { security: fake.bridge } }
    const panels = new SecurePanels(document.createElement('div'))
    await panels.refresh()
    // SecurePanels exposes NO notify — there is no code path from a pane
    // action to a renderer→main push. Its public surface is only refresh/
    // dispatch/refreshDebug/debugText, none of which touch window.provident.notify.
    const proto = Object.getPrototypeOf(panels) as unknown as Record<string, unknown>
    const methods = Object.getOwnPropertyNames(proto)
    expect(methods).not.toContain('notify')
    // and window.provident.notify exists but is a RENDERER-side channel SecurePanels
    // never calls — assert the pane's dispatch/refresh do not invoke it (they
    // only call .security).
    const spy = (globalThis as unknown as { window: { provident: { notify: () => void } } }).window.provident.notify
    const orig = spy
    ;(globalThis as unknown as { window: { provident: { notify: () => void } } }).window.provident.notify = () => {
      throw new Error('SecurePanels must not call notify')
    }
    try {
      await panels.dispatch('token-gen')
      await panels.refresh()
    } finally {
      ;(globalThis as unknown as { window: { provident: { notify: () => void } } }).window.provident.notify = orig
    }
  })
})

describe('A2 — N5: a read-disabled gate delivers nothing', () => {
  it('read OFF → stdio notify is a no-op (no resource capability)', async () => {
    const gate = new SecurityGate({ token: null, enabled: ['dispatch'] })
    const server = new ProvidentMcpServer({ backend: makeBackend(), transport: 'stdio', gate })
    await server.connectMockTransport()
    await expect(server.notifyGraphChanged()).resolves.toBe(false)
  })
})

describe('A3 — N1: notify is resource-updated, never tool-list-changed', () => {
  it('a delivered notify is notifications/resources/updated, not a tool/list change', async () => {
    const server = new ProvidentMcpServer({ backend: makeBackend(), transport: 'stdio' })
    const sent = await server.connectMockTransport()
    await server.notifyGraphChanged()
    expect(sent.some((m) => m.method === 'notifications/resources/updated')).toBe(true)
    expect(sent.some((m) => m.method === 'notifications/tools/list_changed')).toBe(false)
    expect(sent.some((m) => m.method === 'notifications/resources/list_changed')).toBe(false)
  })
})

describe('A4 — N2: an HTTP notify is a no-op (never a hang/throw)', () => {
  it('http → notifyGraphChanged returns false, does not throw', async () => {
    const server = new ProvidentMcpServer({ backend: makeBackend(), transport: 'http' })
    server.ensureServerRegistered()
    await expect(server.notifyGraphChanged()).resolves.toBe(false)
  })
})
