// tests/module-tools.test.ts — RED tests for Unit U3 of the module.* extension
// system (docs/specs/module-import-proposal.md §2 ModuleManifest + §3
// import/versioning/update/list + §5 gating). This unit wires the module store
// (U2) into the MCP tool surface. The module.* tools are MAIN-process (the
// persisted node:fs store), so they are handled by `handleModuleTool` in
// mcp-server.ts, NOT routed to the renderer.
//
// These tests are RED because the module.* tool surface does NOT exist yet:
//   - `ModuleManifest` / `ModuleInstallResult` / `ModuleListResult` are not in
//     src/shared/types.ts
//   - `RpcMethod` lacks 'module.install' / 'module.update' / 'module.list'
//   - `handleModuleTool` does not exist in mcp-server.ts
//   - `ProvidentMcpServer.ALL_TOOLS` lacks the module.* tools
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { Runtime } from '../src/renderer/runtime.js'
import { ProvidentMcpServer, handleModuleTool, type McpBackend } from '../src/main/mcp-server.js'
import { createModuleStore, type ModuleStore } from '../src/main/module-store.js'
import { SecurityGate } from '../src/main/security.js'
import type { ModuleManifest } from '../src/shared/types.js'

beforeAll(() => {
  installShim()
})

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-modtools-'))
}

function rmSyncSafe(dir: string): void {
  try {
    rmSync(dir, { recursive: true, force: true })
  } catch {
    // best-effort cleanup
  }
}

/** A main-process module store in a throwaway temp dir. */
function storeWithDir(): { store: ModuleStore; dir: string } {
  const dir = freshDir()
  return { store: createModuleStore({ path: join(dir, 'modules.json') }), dir }
}

const SOURCE = `export const greeting = () => 'hello from the module'`

// ---- Manifest types (compile-time + runtime shape) -------------------------

describe('ModuleManifest type shape (§2)', () => {
  it('1. a full ModuleManifest object is constructible with the contract shape', () => {
    const manifest: ModuleManifest = {
      name: 'capture',
      version: '1.0.0',
      capabilities: { tools: ['module:capture.screenshot'], hooks: ['after-render'], transforms: ['highlight'] },
      entry: SOURCE,
      needsCode: true,
      dependsOn: [{ name: 'embed', versionRange: '^1.0.0' }],
    }
    expect(manifest.name).toBe('capture')
    expect(manifest.version).toBe('1.0.0')
    expect(manifest.capabilities.tools).toContain('module:capture.screenshot')
    expect(manifest.capabilities.hooks).toContain('after-render')
    expect(manifest.capabilities.transforms).toContain('highlight')
    expect(manifest.entry).toBe(SOURCE)
    expect(manifest.needsCode).toBe(true)
    expect(manifest.dependsOn?.[0].name).toBe('embed')
    expect(manifest.dependsOn?.[0].versionRange).toBe('^1.0.0')
  })

  it('1b. a minimal pure-capability manifest (no entry/needsCode/dependsOn) is constructible', () => {
    const manifest: ModuleManifest = {
      name: 'embed',
      version: '0.2.0',
      capabilities: { hooks: ['after-render'] },
    }
    expect(manifest.entry).toBeUndefined()
    expect(manifest.needsCode).toBeUndefined()
    expect(manifest.dependsOn).toBeUndefined()
  })
})

// ---- handleModuleTool: module.install ---------------------------------------

describe('handleModuleTool — module.install (§3)', () => {
  it('2. installs a module and persists it (a later module.list includes it)', () => {
    const { store, dir } = storeWithDir()
    try {
      const res = handleModuleTool(store, 'module.install', { name: 'capture', source: SOURCE, version: '1.0.0' }) as { status: string }
      expect(res.status).toBe('installed')
      const listed = handleModuleTool(store, 'module.list', {}) as Array<{ name: string; version: string; capabilities?: unknown }>
      const found = listed.find((m) => m.name === 'capture')
      expect(found).toBeDefined()
      expect(found?.version).toBe('1.0.0')
      expect(found?.capabilities).toBeDefined()
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('3. same name+version is a no-op (idempotent, E-c1)', () => {
    const { store, dir } = storeWithDir()
    try {
      handleModuleTool(store, 'module.install', { name: 'capture', source: SOURCE, version: '1.0.0' })
      const res = handleModuleTool(store, 'module.install', { name: 'capture', source: SOURCE, version: '1.0.0' }) as { status: string }
      expect(res.status).toBe('no-op')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. same name + different version is rejected unless force:true (E-c1)', () => {
    const { store, dir } = storeWithDir()
    try {
      handleModuleTool(store, 'module.install', { name: 'capture', source: SOURCE, version: '1.0.0' })
      const rejected = handleModuleTool(store, 'module.install', { name: 'capture', source: SOURCE, version: '2.0.0' }) as { status: string }
      expect(rejected.status).toBe('rejected')
      const listed = handleModuleTool(store, 'module.list', {}) as Array<{ name: string; version: string }>
      expect(listed.find((m) => m.name === 'capture')?.version).toBe('1.0.0')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4b. force:true replaces the module at the new version', () => {
    const { store, dir } = storeWithDir()
    try {
      handleModuleTool(store, 'module.install', { name: 'capture', source: SOURCE, version: '1.0.0' })
      const res = handleModuleTool(store, 'module.install', { name: 'capture', source: SOURCE, version: '2.0.0', force: true }) as { status: string }
      expect(res.status).toBe('installed')
      const listed = handleModuleTool(store, 'module.list', {}) as Array<{ name: string; version: string }>
      expect(listed.find((m) => m.name === 'capture')?.version).toBe('2.0.0')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. a malformed payload (missing name/source) is a clean error, never a crash', () => {
    const { store, dir } = storeWithDir()
    try {
      expect(() => handleModuleTool(store, 'module.install', {} as never)).toThrow()
      expect(() => handleModuleTool(store, 'module.install', { name: 'x' } as never)).toThrow()
      expect(() => handleModuleTool(store, 'module.install', { source: SOURCE } as never)).toThrow()
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ---- handleModuleTool: module.list ------------------------------------------

describe('handleModuleTool — module.list (§3)', () => {
  it('6. returns the installed modules with name + version + capabilities', () => {
    const { store, dir } = storeWithDir()
    try {
      handleModuleTool(store, 'module.install', { name: 'capture', source: SOURCE, version: '1.0.0' })
      handleModuleTool(store, 'module.install', { name: 'embed', source: SOURCE, version: '0.2.0' })
      const listed = handleModuleTool(store, 'module.list', {}) as Array<{ name: string; version: string; capabilities?: unknown }>
      expect(listed.length).toBe(2)
      const names = listed.map((m) => m.name).sort()
      expect(names).toEqual(['capture', 'embed'])
      for (const m of listed) {
        expect(typeof m.name).toBe('string')
        expect(typeof m.version).toBe('string')
        expect(m.capabilities).toBeDefined()
      }
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ---- handleModuleTool: module.update -----------------------------------------

describe('handleModuleTool — module.update (§3)', () => {
  it('7. updates a module version/source; module.list reflects the new version', () => {
    const { store, dir } = storeWithDir()
    try {
      handleModuleTool(store, 'module.install', { name: 'capture', source: SOURCE, version: '1.0.0' })
      const res = handleModuleTool(store, 'module.update', { name: 'capture', source: SOURCE, version: '2.0.0' }) as { status: string }
      expect(res.status).toBe('updated')
      const listed = handleModuleTool(store, 'module.list', {}) as Array<{ name: string; version: string }>
      expect(listed.find((m) => m.name === 'capture')?.version).toBe('2.0.0')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ---- MCP registration + gating (J6-style) -----------------------------------

describe('MCP registration + gating (§5)', () => {
  it('8. module.install / module.update / module.list are in ALL_TOOLS', () => {
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('module.install')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('module.update')
    expect(ProvidentMcpServer.ALL_TOOLS).toContain('module.list')
  })

  it('9. default gate excludes module.* tools; module.list allowed after module granted', () => {
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    expect(server.allowedToolNames()).not.toContain('module.install')
    expect(server.allowedToolNames()).not.toContain('module.update')
    expect(server.allowedToolNames()).not.toContain('module.list')
  })

  it('9b. after applyGatePatch({groups:["module"]}), module.list IS allowed', () => {
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['module'] })
    expect(server.allowedToolNames()).toContain('module.list')
  })

  it('9c. module.install/update require module AND code (module-only does NOT allow them)', () => {
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['module'] })
    expect(server.allowedToolNames()).toContain('module.list')
    expect(server.allowedToolNames()).not.toContain('module.install')
    expect(server.allowedToolNames()).not.toContain('module.update')
  })

  it('9d. with module AND code granted, install/update/list are all allowed', () => {
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['module', 'code'] })
    expect(server.allowedToolNames()).toContain('module.install')
    expect(server.allowedToolNames()).toContain('module.update')
    expect(server.allowedToolNames()).toContain('module.list')
  })

  it('9e. disabling code re-gates module.install/update (F1 adversarial fix)', () => {
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend, transport: 'stdio', gate: new SecurityGate() })
    server.applyGatePatch({ groups: ['module', 'code'] })
    expect(server.allowedToolNames()).toContain('module.install')
    // disable code — module.install/update must drop out (two-gate), module.list stays
    server.applyGatePatch({ disable: ['code'] })
    expect(server.allowedToolNames()).not.toContain('module.install')
    expect(server.allowedToolNames()).not.toContain('module.update')
    expect(server.allowedToolNames()).toContain('module.list')
  })
})
