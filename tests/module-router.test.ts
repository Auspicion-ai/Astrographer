// tests/module-router.test.ts — RED tests for Unit U4: the capability router +
// internal toolset (docs/specs/module-import-proposal.md §4 + §7b, and
// docs/specs/module-feature-list.md §3). Imports from
// ../src/renderer/extensions.js.
//
// These tests are RED because `src/renderer/extensions.ts` does NOT exist yet:
// the import of `CapabilityRouter` / `ModuleCtx` fails at module load. The
// Implementer makes this file green by adding the router class + toolset to
// `src/renderer/extensions.ts` with NO changes to these tests.
import { describe, it, expect } from 'vitest'
import { CapabilityRouter, type ModuleCtx } from '../src/renderer/extensions.js'

describe('CapabilityRouter — registerModule + tool registration (§4, feature-list §3)', () => {
  it('RED — CapabilityRouter is exported', () => {
    expect(typeof CapabilityRouter).toBe('function')
  })

  it('1. ctx.tool("screenshot", handler) registers a tool under module:<name>.<tool>', () => {
    const router = new CapabilityRouter()
    router.registerModule('capture', (ctx: ModuleCtx) => {
      ctx.tool('screenshot', () => 'shot')
    })
    expect(router.hasTool('module:capture.screenshot')).toBe(true)
    expect(router.listTools()).toContain('module:capture.screenshot')
  })

  it('2. invokeTool("module:capture.screenshot", args) returns the handler result', () => {
    const router = new CapabilityRouter()
    router.registerModule('capture', (ctx: ModuleCtx) => {
      ctx.tool('screenshot', (args: unknown) => ({ took: args }))
    })
    expect(router.invokeTool('module:capture.screenshot', { id: 7 })).toEqual({ took: { id: 7 } })
  })

  it('3. the ctx prepends the module name (namespaced module:<name>.<tool>)', () => {
    const router = new CapabilityRouter()
    router.registerModule('capture', (ctx: ModuleCtx) => {
      ctx.tool('screenshot', () => 'shot')
      ctx.tool('save', () => 'saved')
    })
    expect(router.hasTool('screenshot')).toBe(false)
    expect(router.hasTool('module:capture.screenshot')).toBe(true)
    expect(router.hasTool('module:capture.save')).toBe(true)
    // Another module with the same bare tool name does NOT collide (namespace holds).
    router.registerModule('other', (ctx: ModuleCtx) => {
      ctx.tool('screenshot', () => 'other-shot')
    })
    expect(router.hasTool('module:other.screenshot')).toBe(true)
  })
})

describe('Hooks — ctx.onRender / runHooks (§7b, feature-list §3)', () => {
  it('4. runHooks("after-render", snapshot) calls the registered hook with the snapshot', () => {
    const router = new CapabilityRouter()
    let got: unknown = undefined
    router.registerModule('embed', (ctx: ModuleCtx) => {
      ctx.onRender((snapshot: unknown) => {
        got = snapshot
      })
    })
    router.runHooks('after-render', { nodes: ['a', 'b'] })
    expect(got).toEqual({ nodes: ['a', 'b'] })
  })

  it('5. multiple modules registering the same hook both run, in registration order', () => {
    const router = new CapabilityRouter()
    const order: string[] = []
    router.registerModule('first', (ctx: ModuleCtx) => {
      ctx.onRender(() => {
        order.push('first')
      })
    })
    router.registerModule('second', (ctx: ModuleCtx) => {
      ctx.onRender(() => {
        order.push('second')
      })
    })
    router.runHooks('after-render', {})
    expect(order).toEqual(['first', 'second'])
  })
})

describe('Transforms (emit-only, §7b + feature-list §3)', () => {
  it('6. ctx.transform(fn) → applyTransforms(fragment) returns the transformed fragment', () => {
    const router = new CapabilityRouter()
    router.registerModule('format', (ctx: ModuleCtx) => {
      ctx.transform((fragment: string) => fragment.toUpperCase())
    })
    expect(router.applyTransforms('hello')).toBe('HELLO')
  })

  it('7. transforms compose in registration order (module A then module B)', () => {
    const router = new CapabilityRouter()
    router.registerModule('a', (ctx: ModuleCtx) => {
      ctx.transform((fragment: string) => `${fragment}-a`)
    })
    router.registerModule('b', (ctx: ModuleCtx) => {
      ctx.transform((fragment: string) => `${fragment}-b`)
    })
    expect(router.applyTransforms('x')).toBe('x-a-b')
  })

  it('8. a transform that throws does NOT crash applyTransforms — the original fragment is returned', () => {
    const router = new CapabilityRouter()
    router.registerModule('bad', (ctx: ModuleCtx) => {
      ctx.transform(() => {
        throw new Error('transform blew up')
      })
    })
    router.registerModule('good', (ctx: ModuleCtx) => {
      ctx.transform((fragment: string) => fragment + '-ok')
    })
    expect(() => router.applyTransforms('hello')).not.toThrow()
    expect(router.applyTransforms('hello')).toBe('hello')
  })
})

describe('captureView + emit facade (§7b, feature-list §3)', () => {
  it('9. ctx.captureView() returns a string (the rendered fragment snapshot)', () => {
    const router = new CapabilityRouter()
    let view: string | undefined
    router.registerModule('capture', (ctx: ModuleCtx) => {
      view = ctx.captureView()
    })
    expect(typeof view).toBe('string')
  })

  it('10. ctx.emit(node, event) returns a Promise that resolves (facade records the call)', async () => {
    const router = new CapabilityRouter()
    let recorded: unknown = undefined
    router.registerModule('capture', (ctx: ModuleCtx) => {
      const p = ctx.emit('echo', 'click', ['x'])
      expect(p).toBeInstanceOf(Promise)
      p.then((v) => {
        recorded = v
      })
    })
    expect(recorded).toBeUndefined()
    await new Promise((r) => setTimeout(r, 0))
  })
})

describe('Introspection + error containment', () => {
  it('11. listTools() returns all registered module:<name>.<tool> names', () => {
    const router = new CapabilityRouter()
    router.registerModule('capture', (ctx: ModuleCtx) => {
      ctx.tool('screenshot', () => '')
      ctx.tool('embed', () => '')
    })
    router.registerModule('format', (ctx: ModuleCtx) => {
      ctx.tool('highlight', () => '')
    })
    const tools = router.listTools()
    expect(tools).toContain('module:capture.screenshot')
    expect(tools).toContain('module:capture.embed')
    expect(tools).toContain('module:format.highlight')
    expect(tools.length).toBe(3)
  })

  it('12. invokeTool on an unregistered tool throws a clean error, never crashes', () => {
    const router = new CapabilityRouter()
    expect(() => router.invokeTool('module:nope.missing', {})).toThrow()
  })

  it('13. a throwing hook is contained — a later hook still runs (F1 adversarial fix)', () => {
    const router = new CapabilityRouter()
    const order: string[] = []
    router.registerModule('bad', (ctx: ModuleCtx) => {
      ctx.onRender(() => {
        throw new Error('hook boom')
      })
    })
    router.registerModule('good', (ctx: ModuleCtx) => {
      ctx.onRender(() => {
        order.push('good')
      })
    })
    expect(() => router.runHooks('after-render', {})).not.toThrow()
    expect(order).toEqual(['good'])
  })

  it('14. module/tool names with "." or ":" are rejected (F2 namespace-injectivity fix)', () => {
    const router = new CapabilityRouter()
    expect(() => router.registerModule('a.b', () => {})).toThrow()
    expect(() => router.registerModule('a:b', () => {})).toThrow()
    router.registerModule('m', (ctx: ModuleCtx) => {
      expect(() => ctx.tool('x.y', () => '')).toThrow()
      expect(() => ctx.tool('x:y', () => '')).toThrow()
    })
  })

  it('15. a duplicate module name is rejected, never a silent overwrite (F3 fix)', () => {
    const router = new CapabilityRouter()
    router.registerModule('dup', (ctx: ModuleCtx) => {
      ctx.tool('one', () => '1')
    })
    expect(() => router.registerModule('dup', (ctx: ModuleCtx) => {
      ctx.tool('two', () => '2')
    })).toThrow()
    // the first module's tool is intact
    expect(router.hasTool('module:dup.one')).toBe(true)
  })

  it('16. a non-function tool handler is rejected at registration (F4 fix)', () => {
    const router = new CapabilityRouter()
    router.registerModule('bad', (ctx: ModuleCtx) => {
      expect(() => ctx.tool('t', 42 as never)).toThrow()
    })
  })
})
