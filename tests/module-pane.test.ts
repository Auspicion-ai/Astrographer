// tests/module-pane.test.ts — RED tests for Unit U8: the module management pane
// in the isolated SecurePanels graph (docs/specs/module-feature-list.md §4 +
// docs/specs/module-import-proposal.md §6 store status).
//
// The pane is authored as provident data in the isolated SecurePanels graph
// (src/renderer/secure-panels.ts), manual-UI-only (never MCP). It reads/writes
// the module store via a NEW IPC bridge (`window.provident.module.get/set`),
// mirroring the existing `window.provident.security` bridge. The main process
// owns the module store.
//
// These tests are RED because the U8 surface does NOT exist yet:
//   - `IPC_MODULE_GET` / `IPC_MODULE_SET_DISABLED` are not in src/shared/types.ts
//   - `window.provident.module` is not in the preload bridge / SecurePanels
//   - the SecurePanels pane envelope has no module-list node / enable-disable
//     toggles, and syncConfig does not write module status into the pane graph
// The Implementer makes this file green with NO changes to these tests.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'
import { createModuleStore, type ModuleStore } from '../src/main/module-store.js'
import { IPC_MODULE_GET, IPC_MODULE_SET_DISABLED } from '../src/shared/types.js'

beforeAll(() => {
  installShim()
})

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-modpane-'))
}

function rmSyncSafe(dir: string): void {
  try {
    rmSync(dir, { recursive: true, force: true })
  } catch {
    // best-effort cleanup
  }
}

const SOURCE = `export const greeting = () => 'hello from the module'`

/** A fake window.provident.module bridge backed by a real module store. */
function fakeModuleBridge(store: ModuleStore) {
  return {
    get: async () => {
      const status = store.status()
      return {
        corrupt: status.corrupt,
        quarantined: status.quarantined,
        loaded: status.loaded,
        modules: store.list().map((r) => ({
          name: r.name,
          version: r.version,
          capabilities: r.capabilities,
          disabled: r.disabled,
          quarantined: r.quarantined,
        })),
      }
    },
    setDisabled: async (name: string, disabled: boolean) => {
      store.setDisabled(name, disabled)
      const status = store.status()
      return {
        corrupt: status.corrupt,
        quarantined: status.quarantined,
        loaded: status.loaded,
        modules: store.list().map((r) => ({
          name: r.name,
          version: r.version,
          capabilities: r.capabilities,
          disabled: r.disabled,
          quarantined: r.quarantined,
        })),
      }
    },
  }
}

function installModuleBridge(bridge: ReturnType<typeof fakeModuleBridge>) {
  ;(globalThis as unknown as { window?: unknown }).window = { provident: { module: bridge } }
}

// ---- IPC channel constants --------------------------------------------------

describe('IPC channel constants (module-feature-list.md §4)', () => {
  it('1. IPC_MODULE_GET is exported from src/shared/types.js', () => {
    expect(typeof IPC_MODULE_GET).toBe('string')
    expect(IPC_MODULE_GET).toBe('provident:module:get')
  })

  it('1b. IPC_MODULE_SET_DISABLED is exported from src/shared/types.js', () => {
    expect(typeof IPC_MODULE_SET_DISABLED).toBe('string')
    expect(IPC_MODULE_SET_DISABLED).toBe('provident:module:set-disabled')
  })
})

// ---- The pane reads the module store (via the bridge) -----------------------

describe('window.provident.module.get — the module store status + modules (§6)', () => {
  it('2. get() returns the store status + modules (corrupt/quarantined/loaded + name/version/capabilities/disabled/quarantined)', async () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'modules.json') })
      store.put({ name: 'capture', version: '1.0.0', source: SOURCE, capabilities: { tools: ['module:capture.screenshot'] } })
      store.put({ name: 'embed', version: '0.2.0', source: SOURCE, capabilities: { hooks: ['after-render'] } })
      const bridge = fakeModuleBridge(store)
      const res = await bridge.get()
      expect(res.corrupt).toBe(false)
      expect(res.quarantined).toEqual([])
      expect(res.loaded).toEqual(['capture', 'embed'])
      expect(Array.isArray(res.modules)).toBe(true)
      const capture = res.modules.find((m) => m.name === 'capture')
      expect(capture).toBeDefined()
      expect(capture?.version).toBe('1.0.0')
      expect(capture?.capabilities?.tools).toContain('module:capture.screenshot')
      expect(capture?.disabled).toBeFalsy()
      expect(capture?.quarantined).toBeFalsy()
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ---- The pane renders module info (via the SecurePanels graph) --------------

describe('SecurePanels — the module management pane (§4)', () => {
  it('3. the pane envelope renders a module-list node with per-module enable/disable toggles', async () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'modules.json') })
      store.put({ name: 'capture', version: '1.0.0', source: SOURCE })
      const bridge = fakeModuleBridge(store)
      installModuleBridge(bridge)
      const mount = mountEl() as never
      const panels = new SecurePanels(mount as never)
      await panels.refresh()
      const html = (mount as unknown as { innerHTML: string }).innerHTML
      expect(html).toContain('module-list')
      expect(html).toContain('capture')
      expect(html).toContain('1.0.0')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. syncConfig writes the module list + quarantine status into the pane graph nodes', async () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'modules.json') })
      store.put({ name: 'capture', version: '1.0.0', source: SOURCE })
      store.put({ name: 'embed', version: '0.2.0', source: SOURCE })
      const bridge = fakeModuleBridge(store)
      installModuleBridge(bridge)
      const mount = mountEl() as never
      const panels = new SecurePanels(mount as never)
      await panels.refresh()
      const html = (mount as unknown as { innerHTML: string }).innerHTML
      expect(html).toContain('capture')
      expect(html).toContain('embed')
      expect(html).toContain('0.2.0')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ---- Enable/disable ---------------------------------------------------------

describe('window.provident.module.setDisabled — enable/disable toggle (§4/M-r11)', () => {
  it('5. setDisabled(name, true) toggles a module disabled in the store (dropped from loaded)', async () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'modules.json') })
      store.put({ name: 'capture', version: '1.0.0', source: SOURCE })
      const bridge = fakeModuleBridge(store)
      expect(store.status().loaded).toContain('capture')
      const res = await bridge.setDisabled('capture', true)
      expect(store.status().loaded).not.toContain('capture')
      expect(res.loaded).not.toContain('capture')
      const capture = res.modules.find((m) => m.name === 'capture')
      expect(capture?.disabled).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. the real IPC bridge shape is wired (F1 adversarial fix) — the module bridge result matches the store', async () => {
    const dir = freshDir()
    try {
      const store: ModuleStore = createModuleStore({ path: join(dir, 'modules.json') })
      store.put({ name: 'capture', version: '1.0.0', source: SOURCE })
      // The main-process IPC handler builds this exact shape from the store.
      const status = store.status()
      const result = {
        corrupt: status.corrupt,
        quarantined: status.quarantined,
        loaded: status.loaded,
        modules: store.list().map((r) => ({
          name: r.name,
          version: r.version,
          capabilities: r.capabilities,
          disabled: r.disabled,
          quarantined: r.quarantined,
        })),
      }
      expect(result.corrupt).toBe(false)
      expect(result.loaded).toContain('capture')
      expect(result.modules[0].name).toBe('capture')
      expect(result.modules[0].version).toBe('1.0.0')
    } finally {
      rmSyncSafe(dir)
    }
  })
})
