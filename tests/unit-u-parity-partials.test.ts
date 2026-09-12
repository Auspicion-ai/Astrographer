// tests/unit-u-parity-partials.test.ts — Unit U-PARITY-PARTIALS: the remaining
// PARTIAL closures (docs/specs/unit-u-parity-partials.md §3 states 1-4; the
// rulings W1-Q11 (a) / W1-Q12 (PARK) / W1-Q13 (DEFER) in
// docs/specs/wave-1-open-decisions.md §A/§B).
//
// Scope (the three pinned items):
//   1.1 code.template.validate (W1-Q11 a) — an explicit Validate control in the
//       template-editor pane (src/renderer/template-pane.ts) whose handler calls
//       the SAME `code.template.validate` application seam (the preload
//       `bridge.template.validate` → IPC → `handleTemplateTool` with the SAME
//       template store as the MCP tool) and whose result renders inline
//       (valid / the error list).
//   1.2 gnosis.document.update HC1 (W1-Q12 PARK) — the G5 gnosis-documents pane
//       (src/renderer/gnosis-crud-panes.ts) must author NO control that submits
//       the fake empty graph `{ nodes: [], edges: [] }` to
//       `gnosis.document.update`; the real verbs
//       (create/delete/publish/unpublish/archive/list/get) stay.
//   1.3 rag.get_document scoped-subgraph UI (W1-Q13 DEFER) — no code; recorded in
//       docs/pending.md (no test).
//
// RED set (the states that must fail before the Implementer):
//   (1.1-a) the template-editor pane authors a Validate control (id
//           `template-validate`) with a handler whose body calls the validate seam;
//   (1.1-b) a valid verdict renders inline feedback; an invalid verdict renders
//           the error list/detail;
//   (1.2)  the gnosis-documents pane authoring contains NO
//          `gnosis-documents-update` / `gnosis.document.update` /
//          `{ nodes: [], edges: [] }` fake-update control, while the real verbs
//          remain authored.
import { describe, it, expect } from 'vitest'
import type { LegacyNodeData } from 'provident-ssr'
import {
  createTemplateEditorPane,
  type TemplatePaneContext,
} from '../src/renderer/template-pane.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE, type TemplateVerdict } from '../src/main/template-shape.js'
import { GnosisCrudPanes } from '../src/renderer/gnosis-crud-panes.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'

// ---- fixtures --------------------------------------------------------------

/** A TemplatePaneContext: the Unit H PaneContext PLUS the template +
 *  targetedZones (+ the optional inline validation verdict). */
function makeTemplatePaneContext(
  overrides: Partial<TemplatePaneContext> = {},
): TemplatePaneContext {
  return {
    snapshot: { nodes: [], edges: [] },
    docHeads: null,
    currentDocumentId: null,
    currentNodeId: null,
    backRefs: new Map<string, string[]>(),
    crosslinks: [],
    template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
    targetedZones: ['main'],
    ...overrides,
  }
}

/** All nodes in a LegacyNodeData tree matching a predicate. */
function findNodes(root: LegacyNodeData, pred: (n: LegacyNodeData) => boolean): LegacyNodeData[] {
  const out: LegacyNodeData[] = []
  if (pred(root)) out.push(root)
  for (const c of root.children ?? []) out.push(...findNodes(c, pred))
  return out
}

/** The gnosis-documents pane bridge (per-tool canned results) + the security
 *  gate (both groups on, so the pane renders its editable surface). */
function makeGnosisBridge(): { bridge: unknown; calls: Array<{ tool: string }> } {
  const calls: Array<{ tool: string }> = []
  const DOC = {
    documentId: 'd1',
    wikiId: 'w1',
    revision: 0,
    state: 'Draft',
    graph: { nodes: [], edges: [] },
    title: 'Getting Started',
    createdAt: '2026-09-09T00:00:00Z',
    updatedAt: '2026-09-09T00:00:00Z',
    tags: ['guide'],
    author: 'alice',
  }
  const DOC_LIST = {
    items: [{ ...DOC, graph: undefined }],
    total: 1,
    page: 1,
    pageSize: 20,
  }
  const bridge = {
    gnosis: {
      documents: async (tool: string) => {
        calls.push({ tool })
        if (tool === 'gnosis.wiki.list') return [{ wikiId: 'w1', name: 'My Wiki' }]
        if (tool === 'gnosis.document.list') return DOC_LIST
        if (tool === 'gnosis.document.get') return DOC
        return null
      },
      wikis: async () => null,
    },
    security: { get: async () => ({ enabled: ['gnosis', 'gnosis-edit'] }) },
  }
  return { bridge, calls }
}

/** Build a booted GnosisCrudPanes host + its registry. */
async function makeGnosisPanes(): Promise<{
  registry: ReturnType<typeof createPaneRegistry>
  calls: Array<{ tool: string }>
}> {
  const registry = createPaneRegistry()
  const { bridge, calls } = makeGnosisBridge()
  const panes = new GnosisCrudPanes({ registry, bridge: bridge as never, onChanged: () => {} })
  panes.registerPanes()
  panes.gnosisDocuments('gnosis.wiki.list', {})
  panes.gnosisDocuments('gnosis.document.list', { wikiId: 'w1' })
  panes.gnosisDocuments('gnosis.document.get', { documentId: 'd1' })
  // Flush the fire-and-forget bridge chains (security.get → documents → apply).
  await new Promise((r) => setTimeout(r, 0))
  return { registry, calls }
}

// ===========================================================================
// 1.1 — code.template.validate (W1-Q11 a)
// ===========================================================================

describe('U-PARITY-PARTIALS 1.1 — the template-editor Validate control (W1-Q11 a)', () => {
  it('(a) authors a Validate control (id template-validate) with a click handler', () => {
    const pane = createTemplateEditorPane()
    const root = pane.render(makeTemplatePaneContext())
    const validate = findNodes(root, (n) => n.props?.id === 'template-validate')
    expect(validate).toHaveLength(1)
    const control = validate[0]
    expect(control.type).toBe('button')
    expect(String(control.content)).toMatch(/validate/i)
    const handlers = control.handlers ?? []
    expect(handlers.length).toBeGreaterThan(0)
    expect(handlers[0].event).toBe('click')
  })

  it('(a) the Validate handler calls the code.template.validate application seam', () => {
    const pane = createTemplateEditorPane()
    const root = pane.render(makeTemplatePaneContext())
    const validate = findNodes(root, (n) => n.props?.id === 'template-validate')[0]
    const body = String(validate.handlers?.[0]?.body ?? '')
    // the SAME seam: the preload `template.validate` (→ IPC → handleTemplateTool,
    // the same template store as the MCP `code.template.validate` tool).
    expect(body).toMatch(/\.validate\s*\(/)
    expect(body).toMatch(/provident/)
    // it must NOT be a fake local computation — no hardcoded verdict literal.
    expect(body).not.toMatch(/ok:\s*true/)
  })

  it('(b) a valid verdict renders inline "valid" feedback', () => {
    const pane = createTemplateEditorPane()
    const verdict: TemplateVerdict = { ok: true }
    const root = pane.render(makeTemplatePaneContext({ validation: verdict }))
    const feedback = findNodes(root, (n) => n.props?.id === 'template-validation')
    expect(feedback).toHaveLength(1)
    expect(feedback[0].props?.['data-validation']).toBe('valid')
    expect(JSON.stringify(feedback[0])).toMatch(/valid/i)
  })

  it('(b) an invalid verdict renders the error detail inline', () => {
    const pane = createTemplateEditorPane()
    const verdict: TemplateVerdict = {
      ok: false,
      reason: 'missing-zone',
      detail: 'missing container for zone "main"',
      zones: ['main'],
    }
    const root = pane.render(makeTemplatePaneContext({ validation: verdict }))
    const feedback = findNodes(root, (n) => n.props?.id === 'template-validation')
    expect(feedback).toHaveLength(1)
    expect(feedback[0].props?.['data-validation']).toBe('invalid')
    const json = JSON.stringify(feedback[0])
    expect(json).toContain('missing container for zone')
    // the reason is surfaced too
    expect(json).toMatch(/missing-zone/)
  })

  it('(F1) validate on a null template is guarded — render never throws, no fake feedback', () => {
    const pane = createTemplateEditorPane()
    expect(() => pane.render(makeTemplatePaneContext({ template: null as never }))).not.toThrow()
    const root = pane.render(makeTemplatePaneContext({ template: null as never, validation: null }))
    expect(findNodes(root, (n) => n.props?.id === 'template-validation')).toHaveLength(0)
  })
})

// ===========================================================================
// 1.2 — gnosis.document.update (W1-Q12 PARK)
// ===========================================================================

describe('U-PARITY-PARTIALS 1.2 — the G5 fake Update control is parked (W1-Q12)', () => {
  it('authors NO control that submits the fake empty graph to gnosis.document.update', async () => {
    const { registry } = await makeGnosisPanes()
    const node = registry.get('gnosis-documents')!.render({} as never)
    const json = JSON.stringify(node)
    // no fake Update control / handler def
    expect(json).not.toContain('gnosis-documents-update')
    expect(json).not.toContain('gnosis.document.update')
    // no fake empty-graph payload
    expect(json).not.toContain('nodes: [], edges: []')
    expect(json).not.toContain('"graph"')
  })

  it('keeps the real verbs authored (create/delete/publish/unpublish/archive)', async () => {
    const { registry } = await makeGnosisPanes()
    const node = registry.get('gnosis-documents')!.render({} as never)
    const json = JSON.stringify(node)
    expect(json).toContain('gnosis-documents-create')
    expect(json).toContain('gnosis-documents-delete')
    expect(json).toContain('gnosis-documents-publish')
    expect(json).toContain('gnosis-documents-unpublish')
    expect(json).toContain('gnosis-documents-archive')
    // the read/select verbs stay too
    expect(json).toContain('gnosis-documents-refresh')
    expect(json).toContain('gnosis-documents-select-doc')
  })

  it('a loaded document does NOT issue a gnosis.document.update bridge call', async () => {
    const { calls } = await makeGnosisPanes()
    expect(calls.map((c) => c.tool)).not.toContain('gnosis.document.update')
  })
})
