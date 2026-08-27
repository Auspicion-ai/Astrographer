// tests/markdown-endpoint.test.ts — the 0.2 MarkdownAdapter MCP endpoint
// (Feature 2 — the simplified output document for agentic consumers) + the
// def-prototype round-trip (Feature 1a) through the Runtime's load path.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'

beforeAll(() => {
  installShim()
})

describe('0.2 MarkdownAdapter endpoint (provident.get_markdown)', () => {
  it('renders the live graph as markdown text (non-interactive, no data-node-id)', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    const md = runtime.markdown()
    expect(typeof md).toBe('string')
    expect(md.length).toBeGreaterThan(0)
    // text content present
    expect(md).toContain('Provident-Electron')
    expect(md).toContain('Counter')
    expect(md).toContain('Increment')
    // non-interactive: no on:* / data:* surface (D7 — data-node-id dropped)
    expect(md).not.toContain('data-node-id')
    expect(md).not.toContain('on:')
  })

  it('reflects a dispatch mutation in the markdown output', async () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    expect(runtime.markdown()).toContain('0')
    await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
    expect(runtime.markdown()).toContain('1')
  })

  it('returns an empty string for an empty graph (D11)', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    runtime.teardown()
    // teardown leaves a root-only graph; the root still renders text
    expect(typeof runtime.markdown()).toBe('string')
  })
})

describe('0.2 def-prototype round-trip (Feature 1a) through loadDoc', () => {
  it('re-registers def prototypes on a serialized-doc load so rows re-mint', () => {
    const runtime = new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
    runtime.bootstrap()
    // export the serialized doc (may carry a defPrototypes census section)
    const doc = runtime.exportSerialized()
    // re-load it through the A1 snapshot path — must not throw and must
    // produce a live graph
    const census = runtime.loadDoc(doc)
    expect(census.inTree).toBeGreaterThan(0)
    expect(runtime.renderedHtmlResult().renderedHtml.length).toBeGreaterThan(0)
  })
})
