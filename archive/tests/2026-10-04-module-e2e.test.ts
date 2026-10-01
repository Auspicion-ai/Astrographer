// tests/module-e2e.test.ts — RED test for the FULL-STACK integration gap
// (the adversarial pass found the store→router→MCP dynamic-tool chain was never
// wired in production: a module.install persisted a module but never registered
// its tools into the CapabilityRouter, so module:<name>.<tool> was never
// callable). This test proves the fix: install → sync → invoke works end-to-end.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { Runtime } from '../src/renderer/runtime.js'
import { CapabilityRouter, type ModuleCtx } from '../src/renderer/extensions.js'
import { createModuleStore, type ModuleStore } from '../src/main/module-store.js'
import { syncModuleRouter, handleModuleTool, ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'
import { SecurityGate } from '../src/main/security.js'

beforeAll(() => {
  installShim()
})

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-mode2e-'))
}

function rmSyncSafe(dir: string): void {
  try {
    rmSync(dir, { recursive: true, force: true })
  } catch {
    // best-effort cleanup
  }
}

const SOURCE = `export const greeting = () => 'hello from the module'`

const both = () => new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'module', 'code'] })

describe('U9-FIX — the store→router→MCP dynamic-tool chain (integration)', () => {
  it('1. syncModuleRouter registers an installed module declared tools into the router', () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'm.json') })
      store.put({ name: 'capture', version: '1.0.0', source: SOURCE, capabilities: { tools: ['module:capture.screenshot'] } })
      const router = new CapabilityRouter()
      syncModuleRouter(router, store)
      expect(router.listTools()).toContain('module:capture.screenshot')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('2. after module.install, the router is re-synced so the new module tool is callable (the critical gap fix)', () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'm.json') })
      const router = new CapabilityRouter()
      // initial sync (no modules yet)
      syncModuleRouter(router, store)
      expect(router.listTools()).toEqual([])
      // install a module whose source IS a manifest declaring capabilities
      const manifest = JSON.stringify({ name: 'capture', version: '1.0.0', capabilities: { tools: ['module:capture.screenshot'] } })
      const res = handleModuleTool(store, 'module.install', { name: 'capture', source: manifest, version: '1.0.0' })
      expect(res.status).toBe('installed')
      // re-sync (the production server does this after install)
      syncModuleRouter(router, store)
      // the manifest's declared tool is now registered and callable
      expect(router.listTools()).toContain('module:capture.screenshot')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. a server built with a router lists + can invoke a synced module tool (full chain)', () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'm.json') })
      store.put({ name: 'capture', version: '1.0.0', source: SOURCE, capabilities: { tools: ['module:capture.screenshot'] } })
      const router = new CapabilityRouter()
      syncModuleRouter(router, store)
      const backend: McpBackend = { invoke: async () => ({}) }
      const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: both(), moduleStore: store, router })
      // the dynamic tool is registered + listed
      server.ensureServerRegistered()
      expect(server.allowedToolNames()).toContain('module:capture.screenshot')
      expect(server.registeredEnabled('module:capture.screenshot')).toBe(true)
      // and it can be invoked (two-gate satisfied: module AND code)
      const result = server.invokeTool('module:capture.screenshot', { id: 1 })
      expect(result).toEqual({ tool: 'module:capture.screenshot', args: { id: 1 } })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. a disabled module is NOT registered into the router (tools not callable)', () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'm.json') })
      store.put({ name: 'capture', version: '1.0.0', source: SOURCE, capabilities: { tools: ['module:capture.screenshot'] } })
      store.setDisabled('capture', true)
      const router = new CapabilityRouter()
      syncModuleRouter(router, store)
      expect(router.listTools()).toEqual([])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. disabling code re-gates the dynamic module:<name>.<tool> tools (re-gate colon fix, #4)', () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'm.json') })
      store.put({ name: 'capture', version: '1.0.0', source: SOURCE, capabilities: { tools: ['module:capture.screenshot'] } })
      const router = new CapabilityRouter()
      syncModuleRouter(router, store)
      const backend: McpBackend = { invoke: async () => ({}) }
      const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: both(), moduleStore: store, router })
      server.ensureServerRegistered()
      expect(server.registeredEnabled('module:capture.screenshot')).toBe(true)
      // disable code — the dynamic tool must drop out (two-gate re-gate)
      server.applyGatePatch({ disable: ['code'] })
      expect(server.registeredEnabled('module:capture.screenshot')).toBe(false)
      // and invocation is denied
      expect(() => server.invokeTool('module:capture.screenshot', {})).toThrow()
    } finally {
      rmSyncSafe(dir)
    }
  })
})
