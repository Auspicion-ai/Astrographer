// tests/unit-live-dom-click-dispatch.test.ts — the LIVE-8/9/11 root cause.
//
// A REAL DOM click on a provident `on:click` control must reach the host
// dispatch. Root cause (found live 2026-09-15, diag/diag2/diag3/diag4): the
// package DomAdapter binds a listener whose handler calls onEvent(wire,
// domEvent); the host `handleDomEvent` resolved the node via
// `supervisor.getNode(wire)`, but getNode is keyed by node.id and the DOM wire
// is a PATH-KEY (e.g. "root/left/node-663/node-857/node-858"), so getNode(wire)
// returned null and the real click was silently dropped. Synthetic
// provident.dispatch (resolved to node.id) and direct sidebar seam calls
// worked — only the real-DOM-click→dispatch seam failed (RCA-12).
// FIX (2026-09-15): handleDomEvent now falls back to the event target's
// `data-node-id` when getNode(wire) is null.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'

beforeAll(() => {
  installShim()
})

/** A Runtime whose envelope has a button (deeply nested so its DOM data-wire
 *  is a PATH-KEY, not its node id) whose click handler writes a display node. */
function clickEnvelope() {
  return {
    template: {
      root: {
        type: 'div',
        css: { id: 'shell', classes: ['shell'] },
        children: [
          {
            type: 'div',
            css: { id: 'deep', classes: ['deep'] },
            children: [
              {
                type: 'button',
                css: { id: 'go', classes: ['btn'] },
                props: { 'data-node-id': 'the-node', 'data-role': 'click' },
                content: 'Go',
                handlers: [
                  {
                    name: 'go-click',
                    event: 'click',
                    body: `function (ctx) {
                      var all = ctx.tree.allNodes();
                      var out = all.find(function (n) { return n && n.props && n.props.id === 'out'; });
                      if (out) ctx.clientAPI.apply(out.id, [{ targetProp: 'content', mode: 'replace', value: 'FIRED' }]);
                    }`,
                  },
                ],
              },
            ],
          },
          { type: 'div', css: { id: 'out' }, props: { id: 'out' }, content: 'IDLE' },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  } as never
}

function makeRuntime() {
  const mount = mountEl()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runtime = new Runtime({ mount, envelope: clickEnvelope() } as any)
  return { runtime, mount }
}

const settle = () => new Promise((r) => setTimeout(r, 0))

describe('LIVE root cause — the real-DOM-click→dispatch seam resolves a path-key wire', () => {
  it('handleDomEvent resolves a path-key wire to the element data-node-id and dispatches', async () => {
    const { runtime } = makeRuntime()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sup = (runtime as any).supervisor
    const buttonNode = sup.allNodes().find((n: any) => n.props?.['data-node-id'] === 'the-node')
    expect(buttonNode).not.toBeNull()
    const realId = buttonNode.id
    // getNode(pathKeyWire) must NOT resolve (it's a synthetic path key, not a node id).
    const pathKeyWire = `root/deep/${realId}/path-key`
    expect(sup.getNode(pathKeyWire)).toBeUndefined()
    // The real click path: DomAdapter.onEvent(wire, domEvent) → handleDomEvent.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(runtime as any).handleDomEvent(pathKeyWire, {
      type: 'click',
      target: { getAttribute: (k: string) => (k === 'data-node-id' ? realId : null) },
    })
    for (let i = 0; i < 5; i++) await settle()
    const out = sup.allNodes().find((n: any) => n.props?.id === 'out')
    expect(out).not.toBeNull()
    const content = String(out.content ?? (out.payload && out.payload.content) ?? '')
    expect(content).toContain('FIRED')
  })

  it('the node is reachable by its real node id; a path-key wire is not', async () => {
    const { runtime } = makeRuntime()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sup = (runtime as any).supervisor
    const buttonNode = sup.allNodes().find((n: any) => n.props?.['data-node-id'] === 'the-node')
    expect(buttonNode).not.toBeNull()
    expect(sup.getNode(buttonNode.id)).not.toBeNull() // real id resolves
    expect(sup.getNode(`root/oops/${buttonNode.id}`)).toBeUndefined() // path-key does NOT
  })
})
