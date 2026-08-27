// tests/blind-ci-divergence.test.ts — BLIND-TEST artifact for D2 (A3-b)
// Encodes docs/specs/ci-divergence-greens.md D2.5-D2.7 from DOCUMENTATION ONLY.
// Produced by the blind-test writer; do not treat as the canonical A3-b pin
// (that is tests/runtime-battery.test.ts). Read-only against implementation.

import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import type { LegacyInitialData } from 'provident-ssr'

beforeAll(() => {
  installShim()
})

function r(): Runtime {
  return new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
}

type LegacyEnvelope = LegacyInitialData & { template: { root: { hooks?: string[] } } }

/** A tiny envelope whose handler reads translate-scoped `userData` and writes
 *  it into a display node ('alice' when userData present, else 'ANON'). */
function userEnvelope(): LegacyInitialData {
  const READ_USER = `function (event, context) {
    const ud = context.supervisor && context.supervisor.userData;
    const all = context.tree.allNodes();
    const node = all.find(function (n) { return n && n.props && n.props.id === 'ud-out'; });
    if (!node) return;
    const v = (ud && ud.username) ? String(ud.username) : 'ANON';
    context.clientAPI.apply(node.id, [{ targetProp: 'content', mode: 'replace', value: v }]);
  }`
  return {
    template: {
      root: {
        type: 'div',
        css: { id: 'ud-shell' },
        children: [
          { type: 'button', css: { id: 'ud-read' }, props: { id: 'ud-read' }, content: 'Read user', handlers: [{ name: 'read', event: 'click', format: 'legacy', body: READ_USER }] },
          { type: 'div', css: { id: 'ud-out' }, props: { id: 'ud-out' }, content: 'ANON' },
        ],
      },
    },
    content: [],
    clientConfig: { runInstantiation: true, runRendering: true },
  }
}

describe('D2 — the code.load teardown pin (ci-divergence-greens.md D2.5-D2.7)', () => {
  it('D2.5 — codeLoad() after a dispatch that generated pass-2 work leaves hasPendingWork() === false', async () => {
    const runtime = r()
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    // generate pending pass-2 work via a dispatch (counter increment)
    await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
    // code.load re-derives the graph — the teardown it performs MUST drain
    runtime.codeSet('template.root.hooks', ['theme'])
    runtime.codeLoad()
    expect(runtime.hasPendingWork()).toBe(false)
  })

  it('D2.6 — codeLoad(otherEnv) with no userData after an alice load → dispatch sees ANON, NOT alice', async () => {
    const runtime = r()
    // a userData-bearing load (alice), dispatch to confirm userData is seen
    const userEnv = userEnvelope()
    runtime.loadEnvelope(userEnv, { userData: { username: 'alice' } })
    const first = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' })
    expect(first.renderedHtml).toContain('alice')
    // codeLoad of an envelope with NO userData → prior userData must not leak
    const anon = userEnvelope()
    runtime.codeLoad()
    runtime.loadEnvelope(anon)
    runtime.codeSet('template.root.hooks', ['x'])
    runtime.codeLoad()
    const after = await runtime.dispatch({ target: { kind: 'cssId', cssId: 'ud-read' }, event: 'click' })
    expect(after.renderedHtml).toContain('ANON')
    expect(after.renderedHtml).not.toContain('alice')
  })

  it('D2.7 — code.load teardown IS provident.teardown (root-only-then-loaded census, inTree > 1)', async () => {
    const runtime = r()
    // a code.load of a fresh envelope after a loaded graph must leave the graph
    // in the same root-only-then-loaded state a teardown+load would (census
    // reflects the NEW load, not a half-torn-down mix).
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() })
    await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
    runtime.codeSet('template.root.hooks', ['theme'])
    runtime.codeLoad()
    expect(runtime.hasPendingWork()).toBe(false)
    // the census reflects the loaded (non-empty) graph — not root-only
    const census = runtime.renderedHtmlResult().census
    expect(census.inTree).toBeGreaterThan(1)
  })
})
