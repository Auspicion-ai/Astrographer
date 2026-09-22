// tests/template-adversarial.test.ts — regression tests for the Unit I
// adversarial findings (I3, I4, I5 — all HOST findings, fixed in `src/`).
//
//   I3 (MEDIUM) — `bridge.template.validate` payload shape breaks MCP/UI
//     equivalence. `preload.ts` sent the raw `tpl` as the IPC payload, but
//     `handleTemplateTool` reads `args.template` → `args.template` was
//     `undefined` → `invalid-shape`, while the MCP `code.template.validate`
//     (zod `{ template: z.unknown().optional() }`) passes `{ template: tpl }`
//     and works. Fixed: `validate` now wraps the template like `set` does.
//   I4 (LOW) — `get()` returned a shallow copy sharing the nested `root`, so a
//     caller could mutate the store's internal template through `get()`,
//     bypassing the zone-consistency validation. Fixed: `get()` returns a deep
//     copy.
//   I5 (LOW) — `targetedZones` was exposed by reference, so a caller could
//     `store.targetedZones.push('x')` and change which zones set/delete/validate
//     enforce. Fixed: the accessor returns a copy.
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { ContentWindowTemplate } from '../src/main/template-store.js'

// ---- electron mock (hoisted BEFORE the preload import) ----------------------
const invokeMock = vi.hoisted(() => vi.fn())
const onMock = vi.hoisted(() => vi.fn())
const removeListenerMock = vi.hoisted(() => vi.fn())
const sendMock = vi.hoisted(() => vi.fn())
/** Holds the API object the preload exposed at MODULE EVALUATION. A box created
 *  INSIDE vi.hoisted is in scope (and already initialised) when the hoisted
 *  factory runs; a module-scope `let` is NOT (TDZ at preload evaluation). */
const bridgeBox = vi.hoisted(() => ({ current: undefined as
  Record<string, unknown> | undefined }))

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn((_name: string, api: Record<string, unknown>) => {
      bridgeBox.current = api
    }),
  },
  ipcRenderer: {
    invoke: invokeMock,
    on: onMock,
    removeListener: removeListenerMock,
    send: sendMock,
  },
}))

// Import AFTER the electron mock is installed (vi.mock is hoisted).
import { IPC_TEMPLATE_VALIDATE } from '../src/shared/types.js'
import '../src/main/preload.js'
import { createTemplateStore } from '../src/main/template-store.js'

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-template-adv-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

/** A well-formed custom template with a `main` container producer (valid
 *  against the default targetedZones ['main']). */
function customTemplateWithMain(): ContentWindowTemplate {
  return {
    root: {
      type: 'section',
      props: { id: 'custom-root' },
      children: [
        { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
      ],
    },
  }
}

/** A template that DROPS the `main` zone (only an `aside` producer) — invalid
 *  against the default targetedZones ['main'] (missing-zone). */
function templateMissingMain(): ContentWindowTemplate {
  return {
    root: {
      type: 'section',
      props: { id: 'custom-root' },
      children: [
        { type: 'div', props: { id: 'zone:aside' }, placement: { placementName: 'aside' } },
      ],
    },
  }
}

/** The `window.provident` bridge captured by contextBridge.exposeInMainWorld. */
function capturedBridge(): Record<string, unknown> {
  return bridgeBox.current as Record<string, unknown>
}

// ===========================================================================
// I3 — bridge.template.validate payload shape (MCP/UI equivalence)
// ===========================================================================
describe('I3 — bridge.template.validate sends { template: tpl } (MCP/UI equivalence)', () => {
  beforeEach(() => {
    invokeMock.mockReset()
  })

  it('validate(tpl) invokes IPC_TEMPLATE_VALIDATE with the template WRAPPED as { template: tpl } (like set)', () => {
    // The bridge is captured by contextBridge.exposeInMainWorld at preload load.
    const bridge = capturedBridge() as {
      template: { validate: (tpl: unknown) => Promise<unknown> }
    }
    const tpl = customTemplateWithMain()
    bridge.template.validate(tpl)
    // handleTemplateTool reads args.template — the payload MUST be { template: tpl }.
    expect(invokeMock).toHaveBeenCalledWith(IPC_TEMPLATE_VALIDATE, { template: tpl })
  })

  it('validate(undefined) still wraps the template (payload is { template: undefined }, not a bare undefined)', () => {
    const bridge = capturedBridge() as {
      template: { validate: (tpl: unknown) => Promise<unknown> }
    }
    bridge.template.validate(undefined)
    expect(invokeMock).toHaveBeenCalledWith(IPC_TEMPLATE_VALIDATE, { template: undefined })
  })
})

// ===========================================================================
// I4 — get() returns a deep copy (never the internal record)
// ===========================================================================
describe('I4 — get() returns a deep copy; mutating it does NOT affect the store', () => {
  it('mutating the returned template root does NOT change the store internal record', () => {
    const dir = freshDir()
    try {
      const store = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithMain())

      const got = store.get()
      // mutate the NESTED root (the shallow-copy leak) + a child
      got.root.props = { id: 'mutated-root' }
      got.root.children = []

      // the store's internal record is unchanged
      expect(store.get()).toEqual(customTemplateWithMain())
      expect(store.get().root.props?.id).toBe('custom-root')
      expect(store.get().root.children).toHaveLength(1)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('mutating the returned template does NOT bypass the zone-consistency validation (a later set still enforces it)', () => {
    const dir = freshDir()
    try {
      const store = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithMain())

      // corrupt the returned copy — must NOT corrupt the store
      const got = store.get()
      got.root.children = []
      expect(store.get()).toEqual(customTemplateWithMain())

      // the store still rejects a template that drops the targeted zone
      expect(() => store.set(templateMissingMain())).toThrow(/missing container for zone "main"/)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// I5 — targetedZones is exposed by copy (never the internal array)
// ===========================================================================
describe('I5 — targetedZones returns a copy; mutating it does NOT change the validation set', () => {
  it('mutating the returned targetedZones array does NOT change the store validation set', () => {
    const dir = freshDir()
    try {
      const store = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })

      const zones = store.targetedZones
      zones.push('x')
      zones.push('y')

      // the store's validation set is unchanged
      expect(store.targetedZones).toEqual(['main'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('a template missing ONLY the original targeted zone is still rejected after the returned array is mutated', () => {
    const dir = freshDir()
    try {
      const store = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })

      // mutate the returned array to add a bogus zone
      store.targetedZones.push('aside')

      // the store still enforces the ORIGINAL set: a template with only an
      // 'aside' producer (no 'main') is still rejected
      expect(() => store.set(templateMissingMain())).toThrow(/missing container for zone "main"/)
      // and a template WITH the main producer is still accepted
      expect(store.set(customTemplateWithMain())).toEqual(customTemplateWithMain())
    } finally {
      rmSyncSafe(dir)
    }
  })
})
