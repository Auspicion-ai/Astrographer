// tests/unit-runtime-applycommand-placement.test.ts — HOST defect
// HOST-APPLYCOMMAND-PLACEMENT-STATESLICE (docs/defects.md; ruling 2026-09-11):
// `Runtime.applyCommand({kind:'state-slice', ...})` is a silent no-op for a
// PLACEMENT-ROUTED content-root node (it returns applied/dirtied but neither
// the resolved state nor the render reflects the mutation), while the SAME
// mutation via the handler path (`ctx.clientAPI.apply` + `runtime.dispatch`)
// works.
//
// RED set written from the defect repro BEFORE the fix. Harness follows
// tests/runtime-host.test.ts + tests/unit-u-state-1b-host-application.test.ts.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'

beforeAll(() => {
  installShim()
})

/** A `rag-` content root placed into the `main` zone (placement-routed). */
function ragRoot(content: string): LegacyNodeData {
  return {
    type: 'div',
    props: { id: 'rag-docA' },
    content,
    placement: { targetPlacement: ['main'] },
  }
}

/** A traversal-style envelope: template with a `main` container producer +
 *  one placement-routed content root. */
function envelope(): LegacyInitialData {
  return {
    template: {
      root: {
        type: 'div',
        props: { id: 'shell' },
        children: [
          { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
          {
            type: 'button',
            css: { id: 'apply-z' },
            props: { id: 'apply-z' },
            content: 'apply',
            handlers: [
              {
                name: 'applyZ',
                event: 'click',
                body: `function (ctx) {
                  const all = ctx.tree.allNodes();
                  const node = all.find(function (n) { return n && n.props && n.props.id === 'rag-docA'; });
                  if (!node) return;
                  ctx.clientAPI.apply(node.id, [{ targetProp: 'content', mode: 'replace', value: 'Z' }]);
                }`,
              },
            ],
          },
        ],
      },
    },
    content: [{ content: [ragRoot('A')] }],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

function boot(): Runtime {
  const runtime = new Runtime({ mount: mountEl() as never, envelope: envelope() as never })
  runtime.bootstrap()
  return runtime
}

function ragNodeId(runtime: Runtime): string {
  return runtime.listTargets().nodes.find((n) => n.propsId === 'rag-docA')!.nodeId
}

describe('HOST-APPLYCOMMAND-PLACEMENT-STATESLICE — placement-routed state-slice', () => {
  it('content mutation via applyCommand updates the resolved state + render', () => {
    const runtime = boot()
    const node = ragNodeId(runtime)
    const result = (runtime as unknown as { applyCommand: (c: unknown) => { status: string } }).applyCommand({
      kind: 'state-slice',
      node,
      mutation: [{ targetProp: 'content', mode: 'replace', value: 'Z' }],
    })
    expect(result.status).toBe('applied')
    const state = runtime.nodeState({ kind: 'nodeId', nodeId: node })
    expect(state.states.some((s) => (s as { content?: unknown }).content === 'Z')).toBe(true)
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('>Z<')
  })

  it('css.classes mutation via applyCommand updates the render', () => {
    const runtime = boot()
    const node = ragNodeId(runtime)
    const result = (runtime as unknown as { applyCommand: (c: unknown) => { status: string } }).applyCommand({
      kind: 'state-slice',
      node,
      mutation: [{ targetProp: 'css.classes', mode: 'replace', value: ['toggled'] }],
    })
    expect(result.status).toBe('applied')
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('toggled')
  })

  it('contrast: the SAME mutation via the handler path works (control)', async () => {
    const runtime = boot()
    const node = ragNodeId(runtime)
    await runtime.dispatch({ target: { kind: 'cssId', cssId: 'apply-z' }, event: 'click' })
    const state = runtime.nodeState({ kind: 'nodeId', nodeId: node })
    expect(state.states.some((s) => (s as { content?: unknown }).content === 'Z')).toBe(true)
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('>Z<')
  })
})
