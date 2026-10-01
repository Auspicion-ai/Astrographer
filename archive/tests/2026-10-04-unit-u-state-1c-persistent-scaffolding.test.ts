// tests/unit-u-state-1c-persistent-scaffolding.test.ts — Unit U-STATE-1c:
// persistent engine scaffolding (hub + Supervisor) + operator-scope
// persistence + incremental backRefs.
//
// TestWriter RED set written from docs/specs/unit-u-state-1c-persistent-scaffolding.md
// §4 (states 1–7) + §5 (F1–F5) BEFORE any implementation. What does NOT exist:
//
//   - Runtime has no stored `hub`; it has no `admitContentNodes` (RED).
//   - SidebarPanes.mountOperator is NOT idempotent (re-creates scope each call);
//     no `refreshOperator` (RED).
//
// Behavior derived from the spec ALONE (private fields read via `as any` casts,
// the house pattern). Harness follows tests/runtime-host.test.ts +
// tests/sidebar-panes-host.test.ts.
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import type { LegacyInitialData } from 'provident-ssr'

beforeAll(() => {
  installShim()
})

function envelope(): LegacyInitialData {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'shell' },
        children: [{ type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } }],
      },
    },
    content: [
      {
        content: [
          {
            type: 'div',
            props: { id: 'rag-docA' },
            content: 'A',
            placement: { targetPlacement: ['main'] },
          },
        ],
      },
    ],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

type RInternals = {
  hub?: unknown
  supervisor?: unknown
  nodes?: unknown[]
  admitContentNodes?: (nodes: unknown[]) => void
}

describe('U-STATE-1c — Runtime persistent scaffolding', () => {
  it('1. the Runtime stores a hub created once at construction', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: envelope() as never })
    const internals = runtime as unknown as RInternals
    expect(internals.hub).toBeDefined()
  })

  it('2. the Supervisor identity is stable across admitContentNodes (journal survives)', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: envelope() as never })
    const internals = runtime as unknown as RInternals
    const before = internals.supervisor
    internals.admitContentNodes!([])
    expect(internals.supervisor).toBe(before)
  })

  it('2b. admitContentNodes registers nodes into the LIVE supervisor and this.nodes', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: envelope() as never })
    const internals = runtime as unknown as RInternals
    const beforeCount = (internals.nodes ?? []).length
    internals.admitContentNodes!([])
    expect((internals.nodes ?? []).length).toBe(beforeCount) // [] is a no-op (F2)
  })

  it('3. hub identity is stable across admits (content-change path)', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: envelope() as never })
    const internals = runtime as unknown as RInternals
    const before = internals.hub
    internals.admitContentNodes!([])
    expect(internals.hub).toBe(before)
  })
})

// ---------------------------------------------------------------------------
// SidebarPanes — operator-scope persistence (§4 states 3/4; F1)
// ---------------------------------------------------------------------------

type HInternals = {
  operatorScope?: unknown
  operatorAdapter?: unknown
  refreshOperator?: () => void
}

function makeHost(): { host: SidebarPanes; operatorMount: ReturnType<typeof mountEl> } {
  const operatorMount = mountEl()
  const registry = createPaneRegistry()
  const backRefs = new Map<string, string[]>()
  const editController = createEditController({
    backRefs,
    commit: vi.fn(async () => ({ ok: true, nodeId: 'x' })),
    onRebuild: vi.fn(),
  })
  const host = new SidebarPanes({
    mount: mountEl() as never,
    operatorMount: operatorMount as never,
    registry,
    bridge: {} as never,
    backRefs,
    editController,
  })
  return { host, operatorMount }
}

// Note (RCA 2026-09-11, spec §6a): identity assertions below use booleans
// (`expect(a === b).toBe(true)`), NOT `expect(a).toBe(b)`. When mountOperator is
// non-idempotent the assertion is EXPECTED to fail; `toBe` on a GraphScope makes
// vitest serialize two large/cyclic objects for the diff message and OOMs the
// worker. Booleans keep the failure cheap.
describe('U-STATE-1c — operator scope persistence', () => {
  it('3. mountOperator() is idempotent — the isolated scope/adapter are created once', () => {
    const { host } = makeHost()
    host.registerPanes()
    host.mountOperator()
    const internals = host as unknown as HInternals
    const scope1 = internals.operatorScope
    const adapter1 = internals.operatorAdapter
    host.mountOperator() // second call
    // RCA (2026-09-11): assert IDENTITY via booleans — a failing
    // `expect(graphScope).toBe(other)` makes vitest serialize two large/cyclic
    // GraphScope objects for the diff and OOMs the worker. Booleans keep the
    // failure message cheap.
    expect(internals.operatorScope === scope1).toBe(true)
    expect(internals.operatorAdapter === adapter1).toBe(true)
  })

  it('4. refreshOperator() re-renders without re-creating the scope (RED — method absent)', () => {
    const { host } = makeHost()
    host.registerPanes()
    host.mountOperator()
    const internals = host as unknown as HInternals
    const scope1 = internals.operatorScope
    expect(typeof internals.refreshOperator).toBe('function')
    internals.refreshOperator!()
    expect(internals.operatorScope === scope1).toBe(true)
  })

  it('F1. a repeated mountOperator() does not duplicate the settings element in the mount', () => {
    const { host, operatorMount } = makeHost()
    host.registerPanes()
    host.mountOperator()
    host.mountOperator()
    const html = (operatorMount as unknown as { innerHTML: string }).innerHTML
    const occurrences = html.split('operator-pane-settings').length - 1
    expect(occurrences).toBe(1)
  })
})

