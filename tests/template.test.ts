// tests/template.test.ts — Unit I: Template Customization
// (docs/specs/unit-i-template.md §5.8 happy paths + §5.9 fail-states + §5.10
// census). This is the TestWriter RED set — the target modules do NOT exist yet:
//
//   - `src/main/template-store.js` (RED — module not found): the pure
//     `ContentWindowTemplate` shape, `DEFAULT_CONTENT_WINDOW_TEMPLATE`,
//     `createTemplateStore`, and `validateTemplate` (the zone-consistency
//     invariant).
//   - `src/main/traversal.js` (EXISTS, but the Unit I amendment is RED): the
//     `TraversalInput.template` field + the zone-producer defense-in-depth.
//   - `src/main/mcp-server.js` (EXISTS, but `handleTemplateTool` is RED): the
//     shared main-process handler + the `code.template.*` tools in ALL_TOOLS.
//   - `src/main/security.js` (EXISTS, but the `code.template.*` TOOL_GROUPS are
//     RED).
//   - `src/shared/types.js` (EXISTS, but the `IPC_TEMPLATE_*` channels +
//     `TemplateChangedPayload` are RED).
//   - `src/renderer/template-pane.js` (RED — module not found): the
//     template-editor pane (`createTemplateEditorPane` + `TEMPLATE_PANE_ID`).
//
// Imports that EXIST (used for fixtures/envelopes, so the pure red set isolates
// exactly the Unit I modules): `src/main/rag-store.js` (the RAG store),
// `src/main/traversal.js` (`buildTraversal` — real traversal envelopes),
// `src/main/security.js` (the five-seam gate), `src/main/mcp-server.js`
// (`ProvidentMcpServer`), `src/renderer/pane-registry.js` + `pane-graph.js`
// (the Unit H authoring the template-editor pane follows).
//
// The Electron/renderer-dependent parts (§5.8 items 14-16, §5.9 item 12, the
// re-derive render + the dirty-edit guard + the renderer switch negative) are
// documented in a `.skip` block at the bottom — the app Runtime re-render, the
// `template-changed` broadcast wiring, and the renderer `handleRequest` switch
// are NOT node-testable; they are verified by code review. The pure store +
// validation + CRUD tools + traversal amendment + shared handler + pane
// authoring ARE node-tested here.
//
// These tests are RED because the Unit I modules do not exist yet. The
// Implementer makes this file green with NO changes to these tests.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { LegacyNodeData, LegacyInitialData } from 'provident-ssr'

// ---- Unit I modules (RED — module not found / not exported) ----------------
import {
  createTemplateStore,
  validateTemplate,
  DEFAULT_CONTENT_WINDOW_TEMPLATE,
  type ContentWindowTemplate,
  type TemplateStore,
  type TemplateVerdict,
  type TemplateSource,
  type TemplateStatus,
} from '../src/main/template-store.js'
import { handleTemplateTool } from '../src/main/mcp-server.js'
import {
  IPC_TEMPLATE_GET,
  IPC_TEMPLATE_VALIDATE,
  IPC_TEMPLATE_SET,
  IPC_TEMPLATE_CREATE,
  IPC_TEMPLATE_DELETE,
  IPC_TEMPLATE_RESET,
  IPC_TEMPLATE_CHANGED,
  type TemplateChangedPayload,
} from '../src/shared/types.js'
import {
  createTemplateEditorPane,
  TEMPLATE_PANE_ID,
  type TemplatePaneContext,
} from '../src/renderer/template-pane.js'

// ---- imports that EXIST (fixtures / the five-seam gate / Unit H authoring) --
import { buildTraversal, type TraversalResult } from '../src/main/traversal.js'
import { createJsonRagStore, type RagStore, type RagNode, type RagEdge } from '../src/main/rag-store.js'
import { groupForTool, toolAllowed, defaultSecurityConfig, SecurityGate } from '../src/main/security.js'
import { ProvidentMcpServer, type McpBackend } from '../src/main/mcp-server.js'
import { createPaneRegistry, type PaneDefinition, type PaneContext } from '../src/renderer/pane-registry.js'
import { paneSubtreeRoot } from '../src/renderer/pane-graph.js'

// ---- fixtures --------------------------------------------------------------

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'provident-template-'))
}

function rmSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

function makeNode(id: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = new Date().toISOString()
  return {
    id,
    type: 'p',
    content: `content-${id}`,
    ownedNodeIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function makeEdge(
  id: string,
  kind: RagEdge['kind'],
  source: string,
  target: string,
  overrides: Partial<RagEdge> = {},
): RagEdge {
  const now = new Date().toISOString()
  return {
    id,
    kind,
    source,
    target,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

async function seedStore(store: RagStore, nodes: RagNode[], edges: RagEdge[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
  for (const e of edges) await store.putEdge(e)
}

/** A valid single-document flow: head → s1 → s2 → end, all scoped to 'doc'. */
function validDoc(): { nodes: RagNode[]; edges: RagEdge[] } {
  const nodes: RagNode[] = [
    makeNode('doc', { type: 'div' }),
    makeNode('head', { type: 'h1', content: 'Title' }),
    makeNode('s1', { type: 'p', content: 'Section one' }),
    makeNode('s2', { type: 'p', content: 'Section two' }),
    makeNode('end', { type: 'p', content: 'End' }),
  ]
  const edges: RagEdge[] = [
    makeEdge('e-head', 'doc-head', 'head', 'doc', { documentIds: ['doc'] }),
    makeEdge('e-n1', 'next-section', 'head', 's1', { documentIds: ['doc'] }),
    makeEdge('e-n2', 'next-section', 's1', 's2', { documentIds: ['doc'] }),
    makeEdge('e-n3', 'next-section', 's2', 'end', { documentIds: ['doc'] }),
    makeEdge('e-end', 'doc-end', 'end', 'doc', { documentIds: ['doc'] }),
  ]
  return { nodes, edges }
}

/** A well-formed custom template with a `main` container producer (valid
 *  against the default targetedZones ['main']). */
function customTemplateWithMain(): ContentWindowTemplate {
  return {
    root: {
      type: 'section',
      props: { id: 'custom-root' },
      children: [
        { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
      ],
    },
  }
}

/** A well-formed custom template with `main` + an extra `aside` zone (extra
 *  zones are allowed — §5.8.3). */
function customTemplateWithAside(): ContentWindowTemplate {
  return {
    root: {
      type: 'section',
      props: { id: 'custom-root' },
      children: [
        { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
        { type: 'div', props: { id: 'zone:aside' }, placement: { placementName: 'aside' } },
      ],
    },
  }
}

/** A template that DROPS the `main` zone (only an `aside` producer) — invalid
 *  against the default targetedZones ['main'] (missing-zone). */
function templateMissingMain(): ContentWindowTemplate {
  return {
    root: {
      type: 'section',
      props: { id: 'custom-root' },
      children: [
        { type: 'div', props: { id: 'zone:aside' }, placement: { placementName: 'aside' } },
      ],
    },
  }
}

/** The container producers in a template root's children (the HARD
 *  PRECONDITION): each offers a zone via placement.placementName. */
function containerProducers(tpl: ContentWindowTemplate): Array<{ placementName: string }> {
  const children = tpl.root.children ?? []
  return children
    .filter((c) => {
      const p = c.placement as { placementName?: string } | undefined
      return p !== undefined && typeof p.placementName === 'string'
    })
    .map((c) => ({ placementName: (c.placement as { placementName: string }).placementName }))
}

/** The container producers in an envelope template root's children. */
function envelopeContainerProducers(env: LegacyInitialData): Array<{ placementName: string }> {
  const children = env.template.root.children ?? []
  return children
    .filter((c) => {
      const p = c.placement as { placementName?: string } | undefined
      return p !== undefined && typeof p.placementName === 'string'
    })
    .map((c) => ({ placementName: (c.placement as { placementName: string }).placementName }))
}

/** Depth-first search for a node in a LegacyNodeData tree matching a predicate. */
function findNode(root: LegacyNodeData, pred: (n: LegacyNodeData) => boolean): LegacyNodeData | undefined {
  if (pred(root)) return root
  for (const c of root.children ?? []) {
    const hit = findNode(c, pred)
    if (hit) return hit
  }
  return undefined
}

/** All nodes in a LegacyNodeData tree matching a predicate. */
function findNodes(root: LegacyNodeData, pred: (n: LegacyNodeData) => boolean): LegacyNodeData[] {
  const out: LegacyNodeData[] = []
  if (pred(root)) out.push(root)
  for (const c of root.children ?? []) out.push(...findNodes(c, pred))
  return out
}

/** A TemplatePaneContext: the Unit H PaneContext PLUS the current template +
 *  the traversal-targeted zones. */
function makeTemplatePaneContext(overrides: Partial<TemplatePaneContext> = {}): TemplatePaneContext {
  return {
    snapshot: { nodes: [], edges: [] },
    currentDocumentId: null,
    currentNodeId: null,
    backRefs: new Map<string, string[]>(),
    crosslinks: [],
    template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
    targetedZones: ['main'],
    ...overrides,
  }
}

// ===========================================================================
// §5.8 HAPPY-PATH STATES (1-13 node-testable; 14-16 renderer-dependent → skip)
// ===========================================================================

describe('DEFAULT_CONTENT_WINDOW_TEMPLATE + the store — happy paths (§5.8)', () => {
  it('1. default template read: a fresh store with no persisted file → get() returns DEFAULT (one main zone); status() = {source:"default"}', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      expect(store.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(containerProducers(store.get())).toEqual([{ placementName: 'main' }])
      expect(store.status()).toEqual({ source: 'default' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. set happy: set(aValidCustomTemplate) → persists, status()={source:"custom"}, returns the stored template; a subsequent get() returns it', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'template.json')
      const store: TemplateStore = createTemplateStore({ path: file, targetedZones: ['main'] })
      const tpl = customTemplateWithMain()
      const returned = store.set(tpl)
      expect(returned).toEqual(tpl)
      expect(store.status()).toEqual({ source: 'custom' })
      expect(store.get()).toEqual(tpl)
      // persisted to the JSON file
      expect(existsSync(file)).toBe(true)
      const persisted = JSON.parse(readFileSync(file, 'utf8'))
      expect(persisted.version).toBe(1)
      expect(persisted.source).toBe('custom')
      expect(persisted.template).toEqual(tpl)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4b. persistence round-trip: a fresh store re-created from the same file reads the custom template', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'template.json')
      const store: TemplateStore = createTemplateStore({ path: file, targetedZones: ['main'] })
      store.set(customTemplateWithMain())
      const reopened: TemplateStore = createTemplateStore({ path: file, targetedZones: ['main'] })
      expect(reopened.get()).toEqual(customTemplateWithMain())
      expect(reopened.status()).toEqual({ source: 'custom' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4c. atomic write: the mutation writes via temp+rename (no .tmp left behind) with 2-space indent', () => {
    const dir = freshDir()
    try {
      const file = join(dir, 'template.json')
      const store: TemplateStore = createTemplateStore({ path: file, targetedZones: ['main'] })
      store.set(customTemplateWithMain())
      // no temp file left behind
      expect(existsSync(`${file}.tmp`)).toBe(false)
      // 2-space indent
      const raw = readFileSync(file, 'utf8')
      expect(raw).toContain('\n  ')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4d. get() returns a DEEP COPY — never the internal record (two calls return distinct objects)', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      expect(store.get()).not.toBe(store.get())
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('5. reset happy: after a custom set, reset() → restores DEFAULT, status()={source:"default"}', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithMain())
      expect(store.status()).toEqual({ source: 'custom' })
      const reset = store.reset()
      expect(reset).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(store.status()).toEqual({ source: 'default' })
      expect(store.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('14. get on a store that has never been customized → {source:"default", template: DEFAULT} (the baseline, not a fail)', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      expect(store.status()).toEqual({ source: 'default' })
      expect(store.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('validateTemplate — happy paths (§5.8)', () => {
  it('2. validateTemplate happy: a well-formed template with a main container producer, validated against ["main"] → {ok:true}', () => {
    expect(validateTemplate(customTemplateWithMain(), ['main'])).toEqual({ ok: true })
  })

  it('3. validateTemplate extra zone: a template with the main producer PLUS an extra aside zone, validated against ["main"] → {ok:true} (extra zones allowed)', () => {
    expect(validateTemplate(customTemplateWithAside(), ['main'])).toEqual({ ok: true })
  })
})

describe('handleTemplateTool — the code.template.* CRUD happy paths (§5.8)', () => {
  it('6. create of a NEW zone: create("aside") → adds the zone:aside container producer, persists, returns the updated template', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithMain())
      const changed: string[] = []
      const result = handleTemplateTool(store, 'code.template.create', { zone: 'aside' }, (p) => changed.push(p.source))
      expect(result).toMatchObject({ source: 'custom' })
      const tpl = (result as { template: ContentWindowTemplate }).template
      expect(containerProducers(tpl)).toEqual([{ placementName: 'main' }, { placementName: 'aside' }])
      // persisted + broadcast
      expect(store.get()).toEqual(tpl)
      expect(changed).toEqual(['custom'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. delete of a NON-targeted zone: delete("aside") where aside is not in targetedZones → removes the aside producer, persists, returns the updated template', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithAside())
      const changed: string[] = []
      const result = handleTemplateTool(store, 'code.template.delete', { zone: 'aside' }, (p) => changed.push(p.source))
      const tpl = (result as { template: ContentWindowTemplate }).template
      expect(containerProducers(tpl)).toEqual([{ placementName: 'main' }])
      expect(store.get()).toEqual(tpl)
      expect(changed).toEqual(['custom'])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. code.template.get happy: with the code group enabled, the tool returns {source, template}; with code DISABLED it is not callable (toolAllowed false)', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      // code enabled → the tool is callable
      expect(toolAllowed('code.template.get', ['code'])).toBe(true)
      const result = handleTemplateTool(store, 'code.template.get', {})
      expect(result).toEqual({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })
      // code disabled → not callable
      expect(toolAllowed('code.template.get', ['read', 'dispatch'])).toBe(false)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('9. MCP/UI equivalence (get): code.template.get (MCP) and bridge.template.get() (IPC) return the same {source, template} from the SAME store', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithMain())
      // The MCP tool and the UI IPC both route through handleTemplateTool with
      // the SAME store — the shared handler is the equivalence seam (§8.2).
      const mcp = handleTemplateTool(store, 'code.template.get', {})
      const ipc = handleTemplateTool(store, 'code.template.get', {})
      expect(mcp).toEqual(ipc)
      expect(mcp).toEqual({ source: 'custom', template: customTemplateWithMain() })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('10. MCP/UI equivalence (mutate + re-derive): code.template.set (MCP) and bridge.template.set (IPC) each write the SAME store and broadcast template-changed', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      const mcpChanged: TemplateChangedPayload[] = []
      const ipcChanged: TemplateChangedPayload[] = []
      // MCP path
      const mcp = handleTemplateTool(store, 'code.template.set', { template: customTemplateWithMain() }, (p) => mcpChanged.push(p))
      // IPC path — the SAME handler + the SAME store
      const ipc = handleTemplateTool(store, 'code.template.set', { template: customTemplateWithMain() }, (p) => ipcChanged.push(p))
      expect(mcp).toEqual({ source: 'custom', template: customTemplateWithMain() })
      expect(ipc).toEqual({ source: 'custom', template: customTemplateWithMain() })
      // both broadcast the template-changed payload (the re-derive trigger)
      expect(mcpChanged).toHaveLength(1)
      expect(mcpChanged[0]).toEqual({ source: 'custom', template: customTemplateWithMain() })
      expect(ipcChanged).toHaveLength(1)
      expect(ipcChanged[0]).toEqual({ source: 'custom', template: customTemplateWithMain() })
      // both wrote the SAME store
      expect(store.get()).toEqual(customTemplateWithMain())
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('code.template.validate happy: validates a proposed template against the store targetedZones (no mutation)', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      const ok = handleTemplateTool(store, 'code.template.validate', { template: customTemplateWithMain() })
      expect(ok).toEqual({ ok: true })
      const bad = handleTemplateTool(store, 'code.template.validate', { template: templateMissingMain() })
      expect(bad).toMatchObject({ ok: false, reason: 'missing-zone' })
      // no mutation
      expect(store.status()).toEqual({ source: 'default' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('code.template.reset happy: restores the default template, persists, broadcasts, returns {source:"default", template}', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithMain())
      const changed: string[] = []
      const result = handleTemplateTool(store, 'code.template.reset', {}, (p) => changed.push(p.source))
      expect(result).toEqual({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE })
      expect(store.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(changed).toEqual(['default'])
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('buildTraversal — the Unit I template amendment (§5.8)', () => {
  it('11. traversal with a custom template: buildTraversal({..., template: customTpl}) → the envelope template is customTpl (with the zoneName producer present); content roots render in the zoneName zone', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      const result: TraversalResult = buildTraversal({
        store,
        documentIds: ['doc'],
        zoneName: 'main',
        template: customTemplateWithMain(),
      })

      // the envelope template is the CUSTOM template (not the default wiki-root)
      expect(result.envelope.template.root.type).toBe('section')
      expect(result.envelope.template.root.props?.id).toBe('custom-root')
      expect(envelopeContainerProducers(result.envelope)).toEqual([{ placementName: 'main' }])
      // the content roots still target the zoneName zone
      for (const payload of result.envelope.content ?? []) {
        expect(payload.content[0].placement?.targetPlacement).toEqual(['main'])
      }
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('12. traversal defense-in-depth: a custom template that LACKS the zoneName producer → the traversal ADDS the producer (the subtree is NOT left unplaced)', async () => {
    const dir = freshDir()
    try {
      const store: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(store, nodes, edges)

      // custom template with only an 'aside' producer — NO 'main' producer
      const result: TraversalResult = buildTraversal({
        store,
        documentIds: ['doc'],
        zoneName: 'main',
        template: templateMissingMain(),
      })

      // the traversal ADDS the missing 'main' producer (defense-in-depth)
      const producers = envelopeContainerProducers(result.envelope)
      expect(producers.some((p) => p.placementName === 'main')).toBe(true)
      // the custom template's OTHER zones are preserved
      expect(producers.some((p) => p.placementName === 'aside')).toBe(true)
      // the custom root type is preserved
      expect(result.envelope.template.root.type).toBe('section')
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('the template-editor pane — Unit H authoring (§5.8)', () => {
  it('13. createTemplateEditorPane() returns a PaneDefinition: id="template-editor", scope="app-graph", title "Template"; render(ctx) returns a content root', () => {
    const pane = createTemplateEditorPane()
    expect(pane.id).toBe('template-editor')
    expect(pane.scope).toBe('app-graph')
    expect(pane.title).toBe('Template')
    const content = pane.render(makeTemplatePaneContext())
    expect(content).toBeDefined()
    expect(typeof content).toBe('object')
  })

  it('13b. paneSubtreeRoot wraps the pane render output with props.id="pane-template-editor" + targetPlacement:["sidebar"]', () => {
    const pane = createTemplateEditorPane()
    const ctx = makeTemplatePaneContext()
    const wrapped = paneSubtreeRoot(pane, ctx, 'sidebar')
    expect(wrapped.props?.id).toBe('pane-template-editor')
    expect(wrapped.placement?.targetPlacement).toEqual(['sidebar'])
  })

  it('13c. render(ctx) authors the template ROOT row: a node carrying props["data-template-root-id"] = <root.id>', () => {
    const pane = createTemplateEditorPane()
    const ctx = makeTemplatePaneContext({ template: customTemplateWithMain() })
    const content = pane.render(ctx)
    const rootRow = findNode(content, (n) => n.props?.['data-template-root-id'] === 'custom-root')
    expect(rootRow).toBeDefined()
  })

  it('13d. render(ctx) authors one row per zone container producer: a li with props["data-template-zone"]=<zoneName> + props["data-targeted"]="true" when the zone is in ctx.targetedZones', () => {
    const pane = createTemplateEditorPane()
    const ctx = makeTemplatePaneContext({ template: customTemplateWithAside(), targetedZones: ['main'] })
    const content = pane.render(ctx)
    const mainLi = findNode(content, (n) => n.props?.['data-template-zone'] === 'main')
    expect(mainLi).toBeDefined()
    expect(mainLi!.props?.['data-targeted']).toBe('true')
    const asideLi = findNode(content, (n) => n.props?.['data-template-zone'] === 'aside')
    expect(asideLi).toBeDefined()
    expect(asideLi!.props?.['data-targeted']).toBeUndefined()
  })

  it('13e. render(ctx) authors the zone-add input (props.id="template-zone-input") + the template-zone-add / template-zone-remove / template-reset / template-save handlers', () => {
    const pane = createTemplateEditorPane()
    const ctx = makeTemplatePaneContext({ template: customTemplateWithMain() })
    const content = pane.render(ctx)
    const input = findNode(content, (n) => n.props?.id === 'template-zone-input')
    expect(input).toBeDefined()
    const handlerNames = findNodes(content, () => true).flatMap((n) => (n.handlers ?? []).map((h) => h.name))
    expect(handlerNames).toContain('template-zone-add')
    expect(handlerNames).toContain('template-zone-remove')
    expect(handlerNames).toContain('template-reset')
    expect(handlerNames).toContain('template-save')
  })

  it('13f. empty template (no zone producers) → the zone list renders "(no zones)"', () => {
    const pane = createTemplateEditorPane()
    const empty: ContentWindowTemplate = { root: { type: 'div', props: { id: 'empty-root' }, children: [] } }
    const ctx = makeTemplatePaneContext({ template: empty })
    const content = pane.render(ctx)
    const text = JSON.stringify(content)
    expect(text).toContain('(no zones)')
  })
})

// ===========================================================================
// §5.9 FAIL-STATES (1-13 node-testable; 12 renderer-dependent → skip)
// ===========================================================================

describe('createTemplateStore — fail-states (§5.9)', () => {
  it('1. createTemplateStore with null/undefined opts or empty path → throws Error("template store: path required")', () => {
    expect(() => createTemplateStore(null as never)).toThrow('template store: path required')
    expect(() => createTemplateStore(undefined as never)).toThrow('template store: path required')
    expect(() => createTemplateStore({ path: '' })).toThrow('template store: path required')
  })

  it('2. corrupt/missing template file boot: a file that fails JSON.parse, is not an object, has a non-1 version, or whose template fails the shape check → boots to DEFAULT, status().source="default", NEVER throws', () => {
    const dir = freshDir()
    try {
      // missing file → default
      const missing = createTemplateStore({ path: join(dir, 'missing.json'), targetedZones: ['main'] })
      expect(missing.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(missing.status()).toEqual({ source: 'default' })

      // invalid JSON
      const badJson = join(dir, 'bad-json.json')
      writeFileSync(badJson, '{ not json')
      const s1 = createTemplateStore({ path: badJson, targetedZones: ['main'] })
      expect(s1.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(s1.status()).toEqual({ source: 'default' })

      // not an object
      const notObj = join(dir, 'not-obj.json')
      writeFileSync(notObj, '"hello"')
      const s2 = createTemplateStore({ path: notObj, targetedZones: ['main'] })
      expect(s2.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(s2.status()).toEqual({ source: 'default' })

      // non-1 version
      const badVersion = join(dir, 'bad-version.json')
      writeFileSync(badVersion, JSON.stringify({ version: 2, source: 'custom', template: customTemplateWithMain() }))
      const s3 = createTemplateStore({ path: badVersion, targetedZones: ['main'] })
      expect(s3.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(s3.status()).toEqual({ source: 'default' })

      // template fails the shape check (missing root)
      const badShape = join(dir, 'bad-shape.json')
      writeFileSync(badShape, JSON.stringify({ version: 1, source: 'custom', template: { root: null } }))
      const s4 = createTemplateStore({ path: badShape, targetedZones: ['main'] })
      expect(s4.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(s4.status()).toEqual({ source: 'default' })
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('validateTemplate — fail-states (§5.9)', () => {
  it('9. validateTemplate with a null/undefined zones (not an array) → throws Error("validateTemplate: zones required")', () => {
    expect(() => validateTemplate(customTemplateWithMain(), null as never)).toThrow('validateTemplate: zones required')
    expect(() => validateTemplate(customTemplateWithMain(), undefined as never)).toThrow('validateTemplate: zones required')
  })

  it('3. invalid-shape: null/non-object/no root/no root.type/no root.props → {ok:false, reason:"invalid-shape"}', () => {
    expect(validateTemplate(null, ['main'])).toMatchObject({ ok: false, reason: 'invalid-shape' })
    expect(validateTemplate(undefined, ['main'])).toMatchObject({ ok: false, reason: 'invalid-shape' })
    expect(validateTemplate('nope', ['main'])).toMatchObject({ ok: false, reason: 'invalid-shape' })
    expect(validateTemplate({}, ['main'])).toMatchObject({ ok: false, reason: 'invalid-shape' })
    expect(validateTemplate({ root: null }, ['main'])).toMatchObject({ ok: false, reason: 'invalid-shape' })
    expect(validateTemplate({ root: { props: { id: 'x' } } }, ['main'])).toMatchObject({ ok: false, reason: 'invalid-shape' })
    expect(validateTemplate({ root: { type: 'div' } }, ['main'])).toMatchObject({ ok: false, reason: 'invalid-shape' })
  })

  it('4. missing-zone: a template that drops a targeted zone → {ok:false, reason:"missing-zone", detail:"missing container for zone \\"<zone>\\""}', () => {
    const verdict = validateTemplate(templateMissingMain(), ['main'])
    expect(verdict).toMatchObject({ ok: false, reason: 'missing-zone' })
    expect((verdict as { detail: string }).detail).toContain('missing container for zone "main"')
    expect((verdict as { zones: string[] }).zones).toEqual(['main'])
  })

  it('4b. missing-zone: root.children missing/non-array is treated as an empty set → missing-zone for every zone', () => {
    const noChildren = validateTemplate({ root: { type: 'div', props: { id: 'x' } } }, ['main'])
    expect(noChildren).toMatchObject({ ok: false, reason: 'missing-zone' })
    const nonArray = validateTemplate({ root: { type: 'div', props: { id: 'x' }, children: 'nope' } }, ['main'])
    expect(nonArray).toMatchObject({ ok: false, reason: 'missing-zone' })
  })
})

describe('the template store set — fail-states (§5.9)', () => {
  it('3. set with an invalid-shape template → throws Error("template set: invalid-shape — <detail>"); the store is unchanged', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      expect(() => store.set(null as never)).toThrow(/template set: invalid-shape/)
      expect(() => store.set({} as never)).toThrow(/template set: invalid-shape/)
      expect(() => store.set({ root: null } as never)).toThrow(/template set: invalid-shape/)
      // the store is unchanged
      expect(store.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(store.status()).toEqual({ source: 'default' })
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('4. set with a missing-zone template (drops a targeted zone) → throws Error("template set: missing-zone — missing container for zone \\"<zone>\\""); the store is unchanged', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      expect(() => store.set(templateMissingMain())).toThrow(/template set: missing-zone/)
      expect(() => store.set(templateMissingMain())).toThrow(/missing container for zone "main"/)
      // the store is unchanged
      expect(store.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(store.status()).toEqual({ source: 'default' })
    } finally {
      rmSyncSafe(dir)
    }
  })
})

describe('handleTemplateTool — fail-states (§5.9)', () => {
  it('11. a code.template.* tool with a null template store → throws Error("code.template.<name>: no template store configured")', () => {
    expect(() => handleTemplateTool(null, 'code.template.get', {})).toThrow('code.template.get: no template store configured')
    expect(() => handleTemplateTool(null, 'code.template.set', { template: customTemplateWithMain() })).toThrow('code.template.set: no template store configured')
  })

  it('5. delete of a TARGETED zone (zone in store.targetedZones) → throws Error("template delete: cannot remove targeted zone \\"<zone>\\""); the store is unchanged', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithMain())
      expect(() => handleTemplateTool(store, 'code.template.delete', { zone: 'main' })).toThrow('template delete: cannot remove targeted zone "main"')
      // the store is unchanged
      expect(store.get()).toEqual(customTemplateWithMain())
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('6. delete of an UNKNOWN zone (no producer for zone) → throws Error("template delete: no zone \\"<zone>\\""); the store is unchanged', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithMain())
      expect(() => handleTemplateTool(store, 'code.template.delete', { zone: 'nope' })).toThrow('template delete: no zone "nope"')
      expect(store.get()).toEqual(customTemplateWithMain())
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('7. create with an empty/non-string zone → throws Error("template create: zone required")', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      expect(() => handleTemplateTool(store, 'code.template.create', { zone: '' })).toThrow('template create: zone required')
      expect(() => handleTemplateTool(store, 'code.template.create', {})).toThrow('template create: zone required')
      expect(() => handleTemplateTool(store, 'code.template.create', { zone: 42 })).toThrow('template create: zone required')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('8. create of an ALREADY-PRESENT zone → throws Error("template create: zone \\"<zone>\\" already present"); the store is unchanged (no duplicate producer)', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      store.set(customTemplateWithMain())
      expect(() => handleTemplateTool(store, 'code.template.create', { zone: 'main' })).toThrow('template create: zone "main" already present')
      // the store is unchanged (no duplicate producer)
      expect(containerProducers(store.get())).toEqual([{ placementName: 'main' }])
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('13. a mutating code.template.* tool with a malformed payload (set with no template) → the handler throws; the store is unchanged', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      expect(() => handleTemplateTool(store, 'code.template.set', {})).toThrow()
      expect(() => handleTemplateTool(store, 'code.template.set', { template: null })).toThrow()
      // the store is unchanged
      expect(store.get()).toEqual(DEFAULT_CONTENT_WINDOW_TEMPLATE)
      expect(store.status()).toEqual({ source: 'default' })
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// §5.10 CENSUS / NUMERIC CLAIMS
// ===========================================================================

describe('census (§5.10)', () => {
  it('ContentWindowTemplate has exactly 1 field (root); the default root is {type:"div", props:{id:"wiki-root"}} with exactly 1 zone (main)', () => {
    expect(Object.keys(DEFAULT_CONTENT_WINDOW_TEMPLATE)).toEqual(['root'])
    expect(DEFAULT_CONTENT_WINDOW_TEMPLATE.root.type).toBe('div')
    expect(DEFAULT_CONTENT_WINDOW_TEMPLATE.root.props?.id).toBe('wiki-root')
    expect(containerProducers(DEFAULT_CONTENT_WINDOW_TEMPLATE)).toEqual([{ placementName: 'main' }])
  })

  it('targetedZones default is ["main"] (a store with no targetedZones rejects a template missing main)', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json') })
      expect(() => store.set(templateMissingMain())).toThrow(/missing container for zone "main"/)
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('the template store exposes exactly 4 methods: get, set, reset, status', () => {
    const dir = freshDir()
    try {
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json') })
      expect(typeof store.get).toBe('function')
      expect(typeof store.set).toBe('function')
      expect(typeof store.reset).toBe('function')
      expect(typeof store.status).toBe('function')
    } finally {
      rmSyncSafe(dir)
    }
  })

  it('TemplateVerdict has 2 fail reasons (invalid-shape, missing-zone) + 1 happy path', () => {
    expect(validateTemplate(customTemplateWithMain(), ['main'])).toEqual({ ok: true })
    expect(validateTemplate(null, ['main'])).toMatchObject({ ok: false, reason: 'invalid-shape' })
    expect(validateTemplate(templateMissingMain(), ['main'])).toMatchObject({ ok: false, reason: 'missing-zone' })
  })

  it('the six code.template.* tools are all in the code group (default-off); 2 read-only + 4 mutating', () => {
    const names = [
      'code.template.get',
      'code.template.validate',
      'code.template.set',
      'code.template.create',
      'code.template.delete',
      'code.template.reset',
    ]
    for (const n of names) {
      expect(groupForTool(n)).toBe('code')
      // default-off: not in defaultSecurityConfig
      expect(toolAllowed(n, defaultSecurityConfig().enabled)).toBe(false)
    }
    // read-only: get + validate; mutating: set/create/delete/reset
    expect(toolAllowed('code.template.get', ['code'])).toBe(true)
    expect(toolAllowed('code.template.validate', ['code'])).toBe(true)
    expect(toolAllowed('code.template.set', ['code'])).toBe(true)
    expect(toolAllowed('code.template.create', ['code'])).toBe(true)
    expect(toolAllowed('code.template.delete', ['code'])).toBe(true)
    expect(toolAllowed('code.template.reset', ['code'])).toBe(true)
  })

  it('the six code.template.* names are in ALL_TOOLS (the MCP server registers them when code is enabled)', () => {
    const names = [
      'code.template.get',
      'code.template.validate',
      'code.template.set',
      'code.template.create',
      'code.template.delete',
      'code.template.reset',
    ]
    for (const n of names) {
      expect(ProvidentMcpServer.ALL_TOOLS).toContain(n)
    }
  })

  it('the seven IPC channels exist with the pinned names', () => {
    expect(IPC_TEMPLATE_GET).toBe('provident:template:get')
    expect(IPC_TEMPLATE_VALIDATE).toBe('provident:template:validate')
    expect(IPC_TEMPLATE_SET).toBe('provident:template:set')
    expect(IPC_TEMPLATE_CREATE).toBe('provident:template:create')
    expect(IPC_TEMPLATE_DELETE).toBe('provident:template:delete')
    expect(IPC_TEMPLATE_RESET).toBe('provident:template:reset')
    expect(IPC_TEMPLATE_CHANGED).toBe('provident:template-changed')
  })

  it('the template-editor pane is exactly 1: id="template-editor", scope="app-graph", title "Template"', () => {
    expect(TEMPLATE_PANE_ID).toBe('template-editor')
    const pane = createTemplateEditorPane()
    expect(pane.id).toBe('template-editor')
    expect(pane.scope).toBe('app-graph')
    expect(pane.title).toBe('Template')
  })

  it('the pane declares the 4 handlers: template-zone-add, template-zone-remove, template-reset, template-save', () => {
    const pane = createTemplateEditorPane()
    const content = pane.render(makeTemplatePaneContext({ template: customTemplateWithMain() }))
    const handlerNames = findNodes(content, () => true).flatMap((n) => (n.handlers ?? []).map((h) => h.name))
    expect(handlerNames).toContain('template-zone-add')
    expect(handlerNames).toContain('template-zone-remove')
    expect(handlerNames).toContain('template-reset')
    expect(handlerNames).toContain('template-save')
  })

  it('the zone-consistency invariant has 2 layers: save-time validation (store.set rejects a missing-zone) + traversal defense-in-depth (buildTraversal adds the producer)', async () => {
    const dir = freshDir()
    try {
      // Layer 1 — save-time: the store rejects a template that drops a targeted zone
      const store: TemplateStore = createTemplateStore({ path: join(dir, 'template.json'), targetedZones: ['main'] })
      expect(() => store.set(templateMissingMain())).toThrow(/missing container for zone "main"/)

      // Layer 2 — traversal defense-in-depth: buildTraversal adds the missing producer
      const rag: RagStore = createJsonRagStore({ path: join(dir, 'rag.json') })
      const { nodes, edges } = validDoc()
      await seedStore(rag, nodes, edges)
      const result: TraversalResult = buildTraversal({ store: rag, documentIds: ['doc'], zoneName: 'main', template: templateMissingMain() })
      expect(envelopeContainerProducers(result.envelope).some((p) => p.placementName === 'main')).toBe(true)
    } finally {
      rmSyncSafe(dir)
    }
  })
})

// ===========================================================================
// Renderer-dependent (§5.8 14-16, §5.9 12) — documented, NOT runnable in node.
// These are the app Runtime re-render after a template change, the
// `template-changed` broadcast wiring, the dirty-edit guard, and the renderer
// `handleRequest` switch negative contract. They are verified by code review /
// the e2e battery; the pure store + validation + CRUD tools + traversal
// amendment + shared handler + pane authoring above is the node-testable
// contract.
// ===========================================================================
describe.skip('renderer-dependent (verified by code review — not node-testable)', () => {
  it.skip('§5.8 14 — after loadAppGraph, the template-editor pane subtree is in the app Runtime → get_rendered_html/markdown/list_targets/dispatch see it', () => {})
  it.skip('§5.8 15 — bridge.template.set(...) → the pane + content-window re-render with the new template; the app-graph panes stay MCP-visible', () => {})
  it.skip('§5.8 16 — a template-changed broadcast while a template-editor control is dirty QUEUES the re-derive until the control is clean', () => {})
  it.skip('§5.9 12 — a code.template.* method that reaches the renderer switch throws unknown method (fail-closed, the Seam-4 negative contract)', () => {})
})
