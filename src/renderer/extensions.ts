// src/renderer/extensions.ts — the capability router + internal toolset for the
// `module.*` extension system (docs/specs/module-import-proposal.md §4 + §7b,
// docs/specs/module-feature-list.md §3).
//
// Architect decision (b): modules are NON-isolating, trusted-equivalent to the
// `code` group. The module `entry` executes in the renderer global scope. The
// router hands the module a reduced, declarative `ctx` (the internal toolset)
// so the SANCTIONED path never passes the live Runtime/Supervisor/bridge. The
// toolset is an ERGONOMICS layer, NOT a security boundary (a hostile module
// writing raw `window` can reach `window.provident.security` — accepted).

/** The reduced, declarative context a module's entry receives. The SANCTIONED
 *  path for authoring a module — never the live Runtime/Supervisor/bridge. */
export interface ModuleCtx {
  /** Snapshot the rendered HTML fragment (read-only). */
  captureView(): string
  /** Register a named tool (namespaced `module:<name>.<tool>`). */
  tool(name: string, handler: (args: unknown) => unknown): void
  /** Register an after-render hook (receives a scoped read-only snapshot). */
  onRender(fn: (snapshot: unknown) => void): void
  /** Dispatch facade — routed through the app Runtime (SecurePanels unreachable). */
  emit(node: string, event: string, args?: unknown[]): Promise<unknown>
  /** Register an emit-only render transform (fragment → fragment). */
  transform(fn: (fragment: string) => string): void
  /** Bounded async queue (M-r12 deferred — stub). */
  uploadQueue(): { enqueue: (item: unknown) => void }
  /** Constrained network (CSP connect-src, M-r12 deferred — stub). */
  fetch(allowlist: string[]): (url: string, init?: unknown) => Promise<unknown>
}

interface RegisteredTool {
  handler: (args: unknown) => unknown
}
interface RegisteredHook {
  event: string
  fn: (snapshot: unknown) => void
}
interface RegisteredTransform {
  fn: (fragment: string) => string
}

/** The capability router: dispatches a capability name to its registered module.
 *  Tools are namespaced `module:<name>.<tool>`; hooks + transforms run in
 *  registration order. A throwing transform is contained (returns the original
 *  fragment, never crashes the render). */
export class CapabilityRouter {
  private readonly tools = new Map<string, RegisteredTool>()
  private readonly hooks: RegisteredHook[] = []
  private readonly transforms: RegisteredTransform[] = []
  private readonly modules = new Set<string>()
  private captureProvider: (() => string) | null = null

  /** U5 (M-r4) — set the capture provider: a function returning the current
   *  rendered fragment. `ctx.captureView()` wraps it as a data-URI. */
  setCaptureProvider(provider: () => string): void {
    this.captureProvider = provider
  }

  /** Register a module by calling its entry with a fresh ModuleCtx. The ctx's
   *  tool()/onRender()/transform() register the module's capabilities.
   *  F2/F3 (adversarial): module names must not contain `.`/`:` (namespace
   *  injectivity), and a duplicate module name is REJECTED (never a silent
   *  overwrite that orphans the prior module's tools). */
  registerModule(name: string, entry: (ctx: ModuleCtx) => void): void {
    if (typeof name !== 'string' || name === '' || name.includes('.') || name.includes(':')) {
      throw new Error(`module register: invalid name "${String(name)}" (must be a non-empty string without '.' or ':')`)
    }
    if (this.modules.has(name)) {
      throw new Error(`module register: name "${name}" already registered (reject, never silent-overwrite)`)
    }
    this.modules.add(name)
    // M1 (adversarial) — ONE queue per module ctx: `uploadQueue()` returns the
    // SAME object every call, so a module that captures it in a hook and calls
    // it again in a tool handler shares one buffer (no fragmented data loss).
    const MAX = 1000
    const buffer: unknown[] = []
    const queue = {
      enqueue: (item: unknown) => {
        buffer.push(item)
        if (buffer.length > MAX) buffer.shift()
      },
      drain: async (processor: (item: unknown) => void) => {
        const items = buffer.splice(0, buffer.length)
        for (const item of items) {
          try {
            // H1 (adversarial) — await the processor so an ASYNC processor
            // (e.g. a remote vector upload) is awaited AND its rejection is
            // contained (never an unhandled rejection).
            await processor(item)
          } catch {
            // a throwing/rejecting processor is contained — continue.
          }
        }
      },
    }
    const ctx: ModuleCtx = {
      captureView: () => {
        // U5 (M-r4) — wrap the capture provider's fragment as a data-URI
        // (SVG snapshot). If no provider is set, return an empty SVG data-URI.
        const fragment = this.captureProvider ? this.captureProvider() : ''
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml">${fragment}</div></foreignObject></svg>`
        // H1 (adversarial) — btoa only handles Latin1 and throws on unicode
        // (emoji/CJK in the fragment). Use a unicode-safe base64 via TextEncoder.
        const bytes = new TextEncoder().encode(svg)
        let bin = ''
        for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i])
        return `data:image/svg+xml;base64,${btoa(bin)}`
      },
      tool: (toolName, handler) => {
        // F4 (adversarial) — a non-function handler is rejected at registration.
        if (typeof toolName !== 'string' || toolName === '' || toolName.includes('.') || toolName.includes(':')) {
          throw new Error(`module ${name}: invalid tool name "${String(toolName)}"`)
        }
        if (typeof handler !== 'function') {
          throw new Error(`module ${name}: tool "${toolName}" handler must be a function`)
        }
        this.tools.set(`module:${name}.${toolName}`, { handler })
      },
      onRender: (fn) => {
        this.hooks.push({ event: 'after-render', fn })
      },
      emit: async (node, event, args) => {
        // Facade stub — records the call; the real dispatch routes through the
        // app Runtime (U9 wires the live graph). Returns a resolving Promise.
        return { node, event, args: args ?? [] }
      },
      transform: (fn) => {
        this.transforms.push({ fn })
      },
      uploadQueue: () => queue,
      fetch: () => async () => {
        throw new Error('module.fetch: network is deferred (M-r12)')
      },
    }
    entry(ctx)
  }

  hasTool(toolName: string): boolean {
    return this.tools.has(toolName)
  }

  listTools(): string[] {
    return [...this.tools.keys()]
  }

  /** U9-FIX — clear all registered modules/capabilities so the router can be
   *  re-synced from the persisted store (install/update/boot-load). */
  clear(): void {
    this.tools.clear()
    this.hooks.length = 0
    this.transforms.length = 0
    this.modules.clear()
  }

  invokeTool(toolName: string, args: unknown): unknown {
    const tool = this.tools.get(toolName)
    if (!tool) throw new Error(`module tool not registered: ${toolName}`)
    return tool.handler(args)
  }

  runHooks(event: string, snapshot: unknown): void {
    for (const h of this.hooks) {
      if (h.event !== event) continue
      // F1 (adversarial) — a throwing hook is CONTAINED (per-hook try/catch):
      // it must not crash the render pipeline, and a later hook still runs.
      try {
        h.fn(snapshot)
      } catch {
        // a throwing hook is quarantined for this pass — continue to the next.
      }
    }
  }

  /** Apply the registered transforms in order. A throwing transform is
   *  CONTAINED: the ORIGINAL fragment is returned (never a partial/crashed
   *  render). Emit-only — never touches Node/Supervisor. */
  applyTransforms(fragment: string): string {
    let out = fragment
    for (const t of this.transforms) {
      try {
        out = t.fn(out)
      } catch {
        // a throwing transform is quarantined for this pass — return the
        // original fragment, never crash the render.
        return fragment
      }
    }
    return out
  }
}
