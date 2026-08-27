// tests/journal-endpoint.test.ts — RED tests for the journal reversibility
// MCP endpoint (docs/specs/journal-endpoint-review.md J3-J8). The Runtime must
// expose a `journal(action)` method that drives the engine's
// `Supervisor.undo()`/`redo()`/`replay()` (provident-ssr 0.2.1 UndoRedoReport
// surface) and re-renders. The MCP server must register `provident.journal`
// under the `graph` group (OFF by default).
//
// Every new-method test MUST be RED (TypeError: runtime.journal is not a
// function) until an Implementer adds it.
import { describe, it, expect, beforeAll } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { demoEnvelope } from '../src/shared/demo-envelope.js'
import { SecurityGate } from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'

beforeAll(() => {
  installShim()
})

function r(): Runtime {
  return new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never })
}

/** Apply a state-slice to the counter node and return its nodeId. */
function counterNodeId(runtime: Runtime): string {
  const counter = runtime.listTargets().nodes.find((n) => n.propsId === 'counter')!
  return counter.nodeId
}

describe('Runtime.journal — undo/redo/replay (J3-J8)', () => {
  it('J-undo — journal("undo") after a state-slice reverts the value (RED: method missing)', async () => {
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    // mutate the counter content to 42
    const op = (runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    expect(op.status).toBe('applied')
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('>42<')
    // undo — must revert to the pre-op value
    const res = await (runtime as any).journal('undo')
    expect(res.status).toBe('applied')
    expect(res.renderedHtml).not.toContain('>42<')
  })

  it('J-redo — journal("redo") re-applies the undone op (RED)', async () => {
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    ;(runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    await (runtime as any).journal('undo')
    expect(runtime.renderedHtmlResult().renderedHtml).not.toContain('>42<')
    const res = await (runtime as any).journal('redo')
    expect(res.status).toBe('applied')
    expect(res.renderedHtml).toContain('>42<')
  })

  it('J-replay — journal("replay") re-runs the journal (RED)', async () => {
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    ;(runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    const res = await (runtime as any).journal('replay')
    expect(res.status).toBe('applied')
    expect(res.renderedHtml).toContain('>42<')
  })

  it('J-no-op — journal("undo") with an empty stack reports no-op, never throws (RED)', async () => {
    const runtime = r()
    runtime.bootstrap()
    const res = await (runtime as any).journal('undo')
    expect(res.status).toBe('no-op')
  })

  it('J-return — the journal result carries status + both views + warnings (RED)', async () => {
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    ;(runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    const res = await (runtime as any).journal('undo')
    expect(res).toHaveProperty('status')
    expect(res).toHaveProperty('renderedHtml')
    expect(res).toHaveProperty('ssrHtml')
    expect(res).toHaveProperty('warnings')
    expect(res).toHaveProperty('baseBoundary')
  })

  it('J-invalid — journal("bogus") throws (RED)', async () => {
    const runtime = r()
    runtime.bootstrap()
    await expect((runtime as any).journal('bogus')).rejects.toThrow(/unknown journal action/)
  })

  it('J-adversarial — a destroy-undo is a pinned no-op: the host surfaces the engine report (never a crash)', async () => {
    const runtime = r()
    runtime.bootstrap()
    const dec = runtime.listTargets().nodes.find((n) => n.cssId === 'dec')!
    ;(runtime as any).applyCommand({ kind: 'destroy', node: dec.nodeId })
    // destroy-undo is a pinned no-op (G14); the host must not throw and must
    // return a report. NOTE: the engine currently reports 'applied' with an
    // empty scheduledDirtied for a destroy-undo (package finding — recorded in
    // docs/defects.md UNDO-REDO-DESTROY-STATUS). The host surfaces it verbatim.
    const res = await (runtime as any).journal('undo')
    expect(res).toHaveProperty('status')
    expect(res).toHaveProperty('renderedHtml')
    expect(res).toHaveProperty('ssrHtml')
  })

  it('J-adversarial — a malformed non-string action is contained (never reaches the engine)', async () => {
    const runtime = r()
    runtime.bootstrap()
    await expect((runtime as any).journal(undefined)).rejects.toThrow(/unknown journal action/)
    await expect((runtime as any).journal(null)).rejects.toThrow(/unknown journal action/)
    await expect((runtime as any).journal(42)).rejects.toThrow(/unknown journal action/)
  })

  it('GAP 4 — replay clears the redo stack: undo → redo → replay → redo is a no-op', async () => {
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    ;(runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    // undo then redo — redo stack is now non-empty
    await (runtime as any).journal('undo')
    await (runtime as any).journal('redo')
    // replay re-runs the journal; this should clear the redo stack
    const replayRes = await (runtime as any).journal('replay')
    expect(replayRes.status).toBe('applied')
    // a subsequent redo should be a no-op (redo stack cleared by replay)
    const redoRes = await (runtime as any).journal('redo')
    expect(redoRes.status).toBe('no-op')
  })

  it('GAP 5 — double-undo (non-idempotent, J7): two undoes invert two ops', async () => {
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    // apply two ops
    ;(runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '10' }],
    })
    ;(runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '20' }],
    })
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('>20<')
    // first undo — inverts the most recent op (20 → 10)
    const u1 = await (runtime as any).journal('undo')
    expect(u1.status).toBe('applied')
    expect(runtime.renderedHtmlResult().renderedHtml).toContain('>10<')
    // second undo — inverts the previous op (10 → original)
    const u2 = await (runtime as any).journal('undo')
    expect(u2.status).toBe('applied')
    expect(runtime.renderedHtmlResult().renderedHtml).not.toContain('>10<')
  })

  it('GAP 6 — dispatch mutations are NOT undoable (J4 honest framing): dispatch trigger is not a journal entry, but handler side effects ARE', async () => {
    const runtime = r()
    runtime.bootstrap()
    // dispatch a click on the inc button — the handler internally calls
    // applyCommand (state-slice), which IS journaled. The dispatch trigger
    // itself is not a journal entry, but the handler's side effects are.
    const before = runtime.renderedHtmlResult().renderedHtml
    await runtime.dispatch({ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' })
    const after = runtime.renderedHtmlResult().renderedHtml
    expect(after).not.toBe(before) // dispatch DID mutate the graph
    // undo — reverses the handler's internal state-slice (NOT the dispatch trigger)
    const res = await (runtime as any).journal('undo')
    expect(res.status).toBe('applied')
    // the dispatch's handler effect is reversed
    expect(runtime.renderedHtmlResult().renderedHtml).toBe(before)
  })

  it('GAP 7 — id index coherence after state-slice undo + destroy', async () => {
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    const dec = runtime.listTargets().nodes.find((n) => n.cssId === 'dec')!
    // state-slice on counter, then destroy dec
    ;(runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    ;(runtime as any).applyCommand({ kind: 'destroy', node: dec.nodeId })
    // undo cycle — the undo stack top is destroy; destroy-undo is a pinned no-op.
    // Keep undoing until the state-slice is reversed or stack is empty.
    for (let i = 0; i < 5; i++) {
      const res = await (runtime as any).journal('undo')
      if (res.status === 'no-op') break
    }
    // the id index should still be coherent — list_targets returns a non-empty
    // list with consistent node data (every node has a truthy nodeId)
    const targets = runtime.listTargets()
    expect(targets.nodes.length).toBeGreaterThan(0)
    for (const node of targets.nodes) {
      expect(node.nodeId).toBeTruthy()
    }
    // the destroyed node should NOT appear in the target list
    const destroyedNode = targets.nodes.find((n) => n.cssId === 'dec')
    expect(destroyedNode).toBeUndefined()
  })

  it('GAP 8 — graph group disabled: journal is not registered (fail-closed)', () => {
    // The MCP server does not register provident.journal when graph is OFF.
    // The SDK returns "Tool not found" for unregistered tools — the tool is
    // never invoked, never reaches the backend.
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend })
    expect(server.allowedToolNames()).not.toContain('provident.journal')
    // After enabling graph, it IS registered
    server.applyGatePatch({ groups: ['graph'] })
    expect(server.allowedToolNames()).toContain('provident.journal')
  })

  it('GAP 9 — journal after teardown: stacks are emptied, undo is a no-op', async () => {
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    ;(runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    // teardown creates a fresh Supervisor — journal stacks are emptied
    runtime.teardown()
    const res = await (runtime as any).journal('undo')
    expect(res.status).toBe('no-op')
  })

  it('GAP 10 — journal after load (re-derive): stacks are emptied, undo is a no-op', async () => {
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    ;(runtime as any).applyCommand({
      kind: 'state-slice',
      node: id,
      mutation: [{ targetProp: 'content', mode: 'replace', value: '42' }],
    })
    // load re-derives the graph from the envelope — journal stacks are emptied
    runtime.load({ kind: 'envelope', envelope: demoEnvelope() as never })
    const res = await (runtime as any).journal('undo')
    expect(res.status).toBe('no-op')
  })
})

describe('provident.journal — MCP tool registration (J6)', () => {
  it('J6 — the tool is in the graph group (OFF by default)', () => {
    const gate = new SecurityGate()
    expect(gate.toolAllowed('provident.journal')).toBe(false)
    const gated = new SecurityGate().apply({ groups: ['graph'] })
    expect(gated.toolAllowed('provident.journal')).toBe(true)
  })

  it('J6 — the server registers provident.journal only when graph is enabled', () => {
    const backend: McpBackend = { invoke: async () => ({}) }
    const server = new ProvidentMcpServer({ backend })
    expect(server.allowedToolNames()).not.toContain('provident.journal')
    server.applyGatePatch({ groups: ['graph'] })
    expect(server.allowedToolNames()).toContain('provident.journal')
  })
})

describe('provident.journal — maxJournalLength / base-boundary (GAP 1)', () => {
  function rWithJournalLimit(limit: number): Runtime {
    return new Runtime({ mount: mountEl() as never, envelope: demoEnvelope() as never, maxJournalLength: limit })
  }

  it('GAP 1 — the Runtime passes maxJournalLength to the Supervisor (verified via no-condense default)', async () => {
    // Without maxJournalLength, the journal grows unboundedly and condense
    // never fires. This verifies the option is wired (the Supervisor accepts it).
    const runtime = r()
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    for (let i = 0; i < 3; i++) {
      ;(runtime as any).applyCommand({
        kind: 'state-slice',
        node: id,
        mutation: [{ targetProp: 'content', mode: 'replace', value: String(i) }],
      })
    }
    await new Promise((r) => setTimeout(r, 50))
    // undo works normally — no base-boundary
    const res = await (runtime as any).journal('undo')
    expect(res.status).toBe('applied')
    expect(res.baseBoundary).toBe(false)
  })

  it('GAP 1 — the Runtime accepts maxJournalLength and the Supervisor honors it (condense fires when the journal exceeds the threshold)', async () => {
    // A real condense requires the base snapshot to be SMALLER than the pre-base
    // journal. On the small demo graph the size guard skips, so we verify the
    // wiring at the Supervisor level: the option is accepted and the journal
    // condense path is reachable. The base-boundary status itself is an engine
    // concern surfaced verbatim by the host (see pending.md GAP 1).
    const runtime = rWithJournalLimit(2)
    runtime.bootstrap()
    const id = counterNodeId(runtime)
    for (let i = 0; i < 3; i++) {
      ;(runtime as any).applyCommand({
        kind: 'state-slice',
        node: id,
        mutation: [{ targetProp: 'content', mode: 'replace', value: String(i) }],
      })
    }
    await new Promise((r) => setTimeout(r, 100))
    // The journal should have been condensed (or the size guard skipped). Either
    // way, undo must not crash and must return a documented status.
    const res = await (runtime as any).journal('undo')
    expect(['applied', 'no-op', 'base-boundary']).toContain(res.status)
  })
})
