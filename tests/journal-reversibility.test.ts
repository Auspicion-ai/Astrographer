// tests/journal-reversibility.test.ts — the journal reversibility stress battery
// (docs/specs/journal-reversibility-battery.md). Drives the provident engine's
// journal surface (Supervisor.apply → journal, then undo()/redo()/replay())
// across the op matrix + mutation modes, and asserts reversibility (R1/R2),
// replay idempotency (R3), and atomicity (R5). Findings are recorded via
// console probes (the battery's purpose is to CONFIRM/DISPROVE the provisional
// verdicts in the spec §4 — engine gaps are recorded, never patched here).
import { describe, it, expect, beforeAll } from 'vitest'
import { translateLegacy, Supervisor, EventBridge, type Node } from 'provident-ssr'
import { installShim } from '../src/shared/dom-shim.js'

beforeAll(() => {
  installShim()
})

const ENV = {
  template: {
    root: {
      type: 'div',
      children: [
        { type: 'div', props: { id: 'a', tags: [] }, content: 'A0' },
        { type: 'div', props: { id: 'b' }, content: 'B0' },
        { type: 'div', props: { id: 'slot' }, content: 'SLOT' },
      ],
    },
  },
  content: [],
  clientConfig: { runInstantiation: true, runRendering: true },
}

interface G {
  sup: Supervisor
  byId: Map<string, Node>
}

function freshGraph(): G {
  const t = translateLegacy(ENV)
  const sup = new Supervisor({ events: new EventBridge() })
  for (const n of t.nodes) sup.registerNode(n)
  const cr = t.root.compile(t.nodes)
  sup.recordResolved(cr.actionable)
  const byId = new Map<string, Node>()
  for (const n of t.nodes) byId.set(n.props?.id as string, n)
  return { sup, byId }
}

function tagsOf(a: Node): unknown {
  return (a.props as { tags?: unknown }).tags
}

describe('journal reversibility — state-slice', () => {
  it('O1: state-slice (replace) undo/redo — RESOLVED in 0.1.5', () => {
    // DEFECT-JOURNAL-UNDO state-slice half fixed in provident-ssr 0.1.5: undo()
    // now journals sliceLayers and inverts state-slice exactly (removeLayer per
    // id). The undo must return the pre-op value; redo re-applies.
    const { sup, byId } = freshGraph()
    const a = byId.get('a')!
    const before = a.content
    sup.apply({ kind: 'state-slice', node: a, mutation: [{ targetProp: 'content', mode: 'replace', value: 'A1' }] })
    expect(a.content).toBe('A1')
    sup.undo()
    expect(a.content).toBe(before)
    sup.redo()
    expect(a.content).toBe('A1')
  })

  it('O2: append-mode state-slice replay idempotency — RESOLVED', () => {
    // With a replaceAll base, replay re-bases and stays stable (both 0.1.4 and
    // 0.1.5). The 0.1.5 sliceLayers gate makes it stable regardless.
    const { sup, byId } = freshGraph()
    const a = byId.get('a')!
    sup.apply({ kind: 'state-slice', node: a, mutation: [{ targetProp: 'props.tags', mode: 'replaceAll', value: ['x'] }] })
    sup.apply({ kind: 'state-slice', node: a, mutation: [{ targetProp: 'props.tags', mode: 'append', value: 'y' }] })
    const afterAppend = JSON.stringify(tagsOf(a))
    expect(afterAppend).toBe('["x","y"]')
    sup.replay()
    sup.replay()
    expect(JSON.stringify(tagsOf(a))).toBe(afterAppend)
  })

  it('O2b: append-first replay is idempotent — RESOLVED in 0.1.5', () => {
    // DEFECT-JOURNAL-REPLAY-APPEND fixed in 0.1.5: replay() gates a state-slice
    // whose recorded sliceLayers all exist (the OO-2 idempotency pattern), so a
    // replayed append never grows the array.
    const { sup, byId } = freshGraph()
    const a = byId.get('a')!
    expect(JSON.stringify(tagsOf(a))).toBe('[]')
    sup.apply({ kind: 'state-slice', node: a, mutation: [{ targetProp: 'props.tags', mode: 'append', value: 'x' }] })
    const afterAppend = JSON.stringify(tagsOf(a))
    expect(afterAppend).toBe('["x"]')
    sup.replay()
    sup.replay()
    expect(JSON.stringify(tagsOf(a))).toBe(afterAppend)
  })

  it('O3: replaceAll-mode state-slice replay is idempotent', () => {
    const { sup, byId } = freshGraph()
    const a = byId.get('a')!
    sup.apply({ kind: 'state-slice', node: a, mutation: [{ targetProp: 'props.tags', mode: 'replaceAll', value: ['x'] }] })
    const after1 = JSON.stringify(tagsOf(a))
    sup.replay()
    sup.replay()
    expect(JSON.stringify(tagsOf(a))).toBe(after1)
  })
})

describe('journal reversibility — structural ops', () => {
  it('O5: detach undo is a documented NO-OP (the G14 per-kind pin)', () => {
    // DEFECT-JOURNAL-UNDO detach half: the engine's G14 per-kind table
    // (ops.md §6, 2026-08-24) documents detach undo as a NO-OP needing the
    // pre-op {parent, priority} journaled (a parked fact-set). Assert the
    // no-op contract (not a silent-gap defect).
    const { sup, byId } = freshGraph()
    const b = byId.get('b')!
    sup.apply({ kind: 'detach', node: b })
    expect(b.isInTree).toBe(false)
    sup.undo()
    // documented no-op: the node stays detached (the pre-op parent is not
    // journaled, so undo cannot re-attach it).
    expect(b.isInTree).toBe(false)
  })

  it('O4: attach undo restores (the handled case)', () => {
    const { sup, byId } = freshGraph()
    const slot = byId.get('slot')!
    const a = byId.get('a')!
    // slot is already a family child of root — detach it first, then attach to a
    sup.apply({ kind: 'detach', node: slot })
    expect(slot.isInTree).toBe(false)
    const r = sup.apply({ kind: 'attach', node: slot, to: a })
    expect(r.status).toBe('applied')
    expect(slot.isInTree).toBe(true)
    sup.undo()
    // attach undo re-detaches (the handled case — undo() uses detachNodeSafe)
    expect(slot.isInTree).toBe(false)
    sup.redo()
    expect(slot.isInTree).toBe(true)
  })

  it('O7: clone-instance undo is a documented NO-OP (the G14 per-kind pin)', () => {
    // DEFECT-JOURNAL-UNDO clone half: the G14 per-kind table documents
    // clone-instance undo as a NO-OP (retention slot-stability collision —
    // the minted copy stays; undo leaves a tombstone placeholder, a user gate).
    // Assert the no-op contract (the copy is retained, not destroyed).
    const { sup, byId } = freshGraph()
    const a = byId.get('a')!
    const registeredBefore = sup.allNodes().length
    sup.apply({ kind: 'clone-instance', source: a, node: a })
    const registeredAfter = sup.allNodes().length
    expect(registeredAfter).toBe(registeredBefore + 1)
    sup.undo()
    // documented no-op: the minted copy is retained (not destroyed).
    expect(sup.allNodes().length).toBe(registeredAfter)
  })

  it('R11: destroy undo is a documented NO-OP (the contract pin)', () => {
    const { sup, byId } = freshGraph()
    const a = byId.get('a')!
    const registeredBefore = sup.allNodes().length
    sup.apply({ kind: 'destroy', node: a })
    const registeredAfter = sup.allNodes().length
    expect(registeredAfter).toBeLessThan(registeredBefore)
    sup.undo()
    // destroy is terminal — undo is a no-op (the documented pin, pending.md
    // REQ-GAP-12 + supervisor.js "destroy is terminal"). The graph stays torn.
    expect(sup.allNodes().length).toBe(registeredAfter)
  })
})

describe('journal reversibility — atomicity', () => {
  it('R5: a rejected op leaves the graph unchanged', () => {
    const { sup, byId } = freshGraph()
    const a = byId.get('a')!
    const slot = byId.get('slot')!
    const before = `${a.content}|${slot.content}`
    const r = sup.apply({ kind: 'state-slice', node: a, mutation: [{ targetProp: 'content', mode: 'replace', value: 'X' }] } as never)
    expect(r.status).toBe('applied')
    // the atomicity probe: an invalid op (unknown target) rejects, no mutation
    const before2 = `${a.content}|${slot.content}`
    const bad = sup.apply({ kind: 'attach', node: a, to: 'nope' } as never)
    expect(bad.status).toBe('rejected')
    expect(`${a.content}|${slot.content}`).toBe(before2)
  })
})
