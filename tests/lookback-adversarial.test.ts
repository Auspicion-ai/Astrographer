// tests/lookback-adversarial.test.ts — regression tests for the L3 adversarial
// finding: the `rag`/`edit` tool groups were unreachable because
// `security-store.ts` VALID_GROUPS and `secure-panels.ts` GROUPS omitted them
// (diverging from `security.ts` and the shared types), and `main.ts`
// `mcp.applyGatePatch` consumed the RAW patch so the live gate could enable a
// group the persisted config dropped (live/persisted divergence on restart).
//
// Fix (L3):
//   (a) security-store.ts VALID_GROUPS now includes `rag`/`edit`.
//   (b) secure-panels.ts GROUPS now includes `rag`/`edit` (the pane renders
//       toggles for them).
//   (c) main.ts derives the live-gate patch from the STORE's FILTERED result
//       via `gatePatchFromStoreResult` (not the raw patch), so the live gate
//       and the persisted config stay in sync.
import { describe, it, expect, beforeAll } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createSecurityStore, gatePatchFromStoreResult } from '../src/main/security-store.js'
import { SecurityGate } from '../src/main/security.js'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-l3-'))
}

beforeAll(() => {
  installShim()
})

describe('L3 — security-store accepts the rag/edit groups (a)', () => {
  it('set({ groups: [rag, edit] }) persists both groups write-through', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'sec.json')
      const store = createSecurityStore({ path: file })
      const after = store.set({ groups: ['rag', 'edit'] })
      expect(after.enabled).toContain('rag')
      expect(after.enabled).toContain('edit')
      // reload/restart restores them (the persisted config keeps the groups)
      const reloaded = createSecurityStore({ path: file })
      expect(reloaded.get().enabled).toContain('rag')
      expect(reloaded.get().enabled).toContain('edit')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a pre-existing file with rag/edit enabled is loaded on construction', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'sec.json')
      writeFileSync(file, JSON.stringify({ token: null, enabled: ['read', 'rag', 'edit'] }))
      const store = createSecurityStore({ path: file })
      expect(store.get().enabled).toContain('rag')
      expect(store.get().enabled).toContain('edit')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('L3 — secure-panels GROUPS includes the rag/edit groups (b)', () => {
  it('the settings pane renders a toggle for the rag group', async () => {
    const mount = mountEl() as never
    const panels = new SecurePanels(mount)
    await panels.refresh()
    const html = (mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('toggle:rag')
    expect(html).toContain('rag.query')
    expect(html).toContain('get_document')
  })

  it('the settings pane renders a toggle for the edit group', async () => {
    const mount = mountEl() as never
    const panels = new SecurePanels(mount)
    await panels.refresh()
    const html = (mount as unknown as { innerHTML: string }).innerHTML
    expect(html).toContain('toggle:edit')
    expect(html).toContain('edit.set_content')
    expect(html).toContain('create_node')
  })
})

describe('L3 — the applyGatePatch path uses the store\'s filtered result (c)', () => {
  it('a group the store drops is never enabled live (no live/persisted divergence)', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'sec.json')
      const store = createSecurityStore({ path: file })
      const gate = new SecurityGate({ token: null, enabled: ['read', 'dispatch'] })
      let currentEnabled = store.get().enabled

      // The manual-UI settings pane sends a patch that includes a VALID group
      // (`rag`) and an INVALID group (`bogus`). The store filters the invalid
      // one out of the persisted config.
      const updated = store.set({ groups: ['rag', 'bogus'] })
      expect(updated.enabled).toContain('rag')
      expect(updated.enabled).not.toContain('bogus')

      // main.ts derives the live-gate patch from the STORE's filtered result.
      const gatePatch = gatePatchFromStoreResult(currentEnabled, updated)
      const live = gate.apply(gatePatch)

      // The live gate matches the persisted config exactly: `rag` enabled,
      // `bogus` NOT enabled (the store dropped it).
      expect(live.enabled.has('rag')).toBe(true)
      expect(live.enabled.has('bogus')).toBe(false)
      expect([...live.enabled].sort()).toEqual([...store.get().enabled].sort())
      currentEnabled = updated.enabled
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('a disable of a group the store drops leaves the live gate unchanged (still in sync)', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'sec.json')
      const store = createSecurityStore({ path: file })
      const gate = new SecurityGate({ token: null, enabled: ['read', 'dispatch', 'rag'] })
      let currentEnabled = store.get().enabled

      // Enable rag first (persisted), then try to disable a bogus group.
      store.set({ groups: ['rag'] })
      currentEnabled = store.get().enabled
      const updated = store.set({ disable: ['bogus'] })
      // The store drops the invalid disable; the persisted config is unchanged.
      expect(updated.enabled).toContain('rag')

      const gatePatch = gatePatchFromStoreResult(currentEnabled, updated)
      const live = gate.apply(gatePatch)
      // No spurious change: the live gate still matches the persisted config.
      expect([...live.enabled].sort()).toEqual([...store.get().enabled].sort())
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
