// tests/unit-live4-adversarial-fix.test.ts — AD-2026-09-14-1..4 host
// adversarial regressions for Unit U-LIVE4 (empty-store landing). The four
// host findings are recorded in docs/specs/unit-live4-empty-store-landing.md
// §3a; each is fixed in THIS pass (host-side only) and pinned here so the fix
// cannot silently revert.
//
// Finding 1 (HIGH — phantom landing ghost): the empty-boot `#stage-landing` is
//   a first-class content root (`extractContentRoots` admits it), but the
//   reconciler's `asContentRoot` had no branch for it → on the natural
//   first-import path (empty boot → first doc imported → reDerive('content')
//   → documentIds non-empty) the landing was in `previous` but invisible to
//   `asContentRoot` → never emitted `removed` → never destroyed → a phantom
//   `#stage-landing` persisted in a now non-empty store. FIX: a
//   `stage-landing` branch in `asContentRoot` (content-reconcile.ts) +
//   `LANDING_ROOT_ID` added to the `destroyRoot` `isRoot` gate (runtime.ts).
// Finding 2 (MED — vacuous repopulate): on a STILL-empty re-derive the landing
//   was invisible to `asContentRoot` → excluded from all buckets → never
//   repopulated when the stores/listing input changed (the mounted body stayed
//   stale — "Getting started"/"No documents yet." never flipping to "Available
//   wikis"). FIX: the Finding-1 branch classifies the landing as pane-like
//   always-shape-compared → `shapeChanged` drives a `replaced`.
// Finding 3 (LOW — input-source divergence): `emptyStoreEnvelope()` fed the
//   landing from `this.lastDocHeads` while the emptiness decision derives from
//   the snapshot's `doc-head` edges → a stale non-empty `lastDocHeads` with a
//   zero-doc-head snapshot rendered `li[data-document-id]` for non-traversable
//   docs. FIX: feed the landing from the same authoritative source (the
//   snapshot's doc-head edges).
// Finding 4 (MED/LOW — zone-not-in-layout drops landing): the empty path
//   authored `placement:{ targetPlacement:[this.zoneName] }` with no validation
//   → a template/layout lacking `this.zoneName` (default 'main') left the
//   landing resolving nowhere. FIX: ensure the target zone producer exists in
//   the envelope template (mirroring buildTraversal's ZONE-CONSISTENCY-ENSURE)
//   before authoring `targetPlacement`.
import { describe, it, expect } from 'vitest'
import type { LegacyInitialData, LegacyNodeData } from 'provident-ssr'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-shape.js'

const APP_GRAPH_PANES = ['doc-nav', 'crosslinks', 'search', 'template-editor']

interface HarnessOpts {
  snapshot?: { nodes: unknown[]; edges: unknown[] }
  docHeads?: Array<{ documentId: string; title: string; path: string[]; tags: string[] }>
  stores?: Array<{ name: string }>
  template?: unknown
}

interface AdversarialHarness {
  host: SidebarPanes
  runtime: Runtime
  mount: unknown
  snapshot: { nodes: unknown[]; edges: unknown[] }
  docHeads: Array<{ documentId: string; title: string; path: string[]; tags: string[] }>
  stores: Array<{ name: string }>
}

function makeHarness(opts: HarnessOpts = {}): AdversarialHarness {
  installShim()
  const mount = mountEl() as never
  const operatorMount = mountEl() as never
  const registry = createPaneRegistry()
  const snapshot = opts.snapshot ?? { nodes: [], edges: [] }
  const docHeads = opts.docHeads ?? []
  const stores = opts.stores ?? []
  const operatorSettings: Record<string, unknown> = {
    enabledPanes: APP_GRAPH_PANES,
    enabledOperatorPanes: [],
    panesInitialized: true,
    defaultDocumentId: null,
    topK: 5,
    editingMode: 'contenteditable',
    theme: 'system',
  }
  const bridge = {
    security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: { commit: async () => ({ ok: true, nodeId: 'x' }), onRagStoreChanged: () => () => {} },
    rag: {
      query: async (q: string) => ({ query: q, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }),
      snapshot: async () => snapshot,
      backlinks: async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
      docHeads: async () => ({ documents: docHeads }),
      stores: async () => ({ stores }),
    },
    template: {
      get: async () => ({ source: 'default', template: opts.template ?? DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      onTemplateChanged: () => () => {},
    },
    operatorSettings: {
      get: async () => operatorSettings,
      set: async (patch: Record<string, unknown>) => {
        Object.assign(operatorSettings, patch)
        return operatorSettings
      },
      onChanged: () => () => {},
    },
  }
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  const editController = createEditController({ backRefs, commit: async () => ({ ok: true, nodeId: 'x' }), onRebuild: (kind) => void host.reDerive(kind) })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({
    mount,
    envelope: {
      template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, mount, snapshot, docHeads, stores }
}

function domHtml(h: AdversarialHarness): string {
  return (h.mount as unknown as { innerHTML: string }).innerHTML
}

function contentRootIds(runtime: Runtime): string[] {
  return runtime
    .materializedContentRoots()
    .map((r) => (r.props as { id?: unknown } | undefined)?.id)
    .filter((id): id is string => typeof id === 'string')
}

function documentRootIds(runtime: Runtime): string[] {
  return contentRootIds(runtime).filter(
    (id) => id.startsWith('rag-') && id.length > 4,
  )
}

interface Seams {
  emptyStoreEnvelope?(snapshot: unknown): LegacyInitialData
  buildTraversalEnvelope(snapshot: unknown, documentIds: string[]): LegacyInitialData
  lastStoreListing?: unknown
}
function seams(host: SidebarPanes): Seams {
  return host as unknown as Seams
}

function firstPayloadRoot(env: LegacyInitialData): LegacyNodeData | undefined {
  const content = env.content as Array<{ content?: LegacyNodeData[] }> | undefined
  return content?.[0]?.content?.[0]
}

// ===========================================================================
// Finding 1 — phantom landing ghost: empty boot → first doc imported →
// reDerive('content') → `#stage-landing` is GONE; only the doc root remains.
// ===========================================================================
describe('U-LIVE4 AD-2026-09-14-1 — phantom landing ghost: the empty-boot landing is destroyed when the store fills', () => {
  it('empty boot → a MUTATED non-empty snapshot → reDerive("content") → no #stage-landing, only the doc root remains', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)

    // Empty boot: the landing + panes + toolbar are resident together.
    expect(contentRootIds(h.runtime)).toContain('stage-landing')
    expect(domHtml(h)).toContain('stage-landing')

    // The natural first-import path: the snapshot gains its first doc-head.
    const now = new Date().toISOString()
    ;(h.snapshot.nodes as { id: string }[]).push({
      id: 'head-a',
      type: 'h1',
      content: 'Doc A',
      ownedNodeIds: [],
      createdAt: now,
      updatedAt: now,
    })
    ;(h.snapshot.edges as { kind: string; target: string }[]).push({
      id: 'dh1',
      kind: 'doc-head',
      source: 'head-a',
      target: 'doc-a',
      createdAt: now,
      updatedAt: now,
      documentIds: ['doc-a'],
    })

    await h.host.reDerive('content')

    // The landing root is GONE from the reconcile result — no phantom persists
    // in the now non-empty store.
    const ids = contentRootIds(h.runtime)
    expect(ids).not.toContain('stage-landing')
    expect(domHtml(h)).not.toContain('stage-landing')
    expect(domHtml(h)).not.toMatch(/data-stage="landing"/)
    // Only the (one) document root remains — and it is resident.
    expect(documentRootIds(h.runtime)).toHaveLength(1)
  })
})

// ===========================================================================
// Finding 2 — vacuous repopulate: a still-empty re-derive after the
// stores/listing input changed repopulates the landing body (a `replaced`).
// ===========================================================================
describe('U-LIVE4 AD-2026-09-14-2 — vacuous repopulate: a stores/listing change repopulates the landing body on a still-empty re-derive', () => {
  it('boot empty ("Getting started" / "No documents yet.") → stores registered → reDerive("content") → "Available wikis" + li[data-store-name]', async () => {
    const h = makeHarness()
    await h.host.boot(h.runtime)

    // Empty + no stores → the boot-co-authored landing renders the empty state,
    // never a store/doc listing.
    const bootHtml = domHtml(h)
    expect(bootHtml).toContain('stage-landing')
    expect(bootHtml).not.toContain('Available wikis')
    expect(domHtml(h)).toContain('Getting started')

    // A store is registered so the listing input changes (the U-H8 seam
    // refreshes lastStoreListing → the next re-derive reads it).
    ;(h.host as unknown as { lastStoreListing: unknown }).lastStoreListing = {
      stores: [{ name: 'wiki-a', default: false, persistenceFile: 'provident-rag-wiki-a.json', corpusRoot: null, status: 'loaded' }],
    }

    await h.host.reDerive('content')

    // The still-empty re-derive repopulates the landing body from the fresh
    // store listing — NOT a stale "Getting started"/"No documents yet.".
    const html = domHtml(h)
    expect(html).toContain('stage-landing')
    expect(html).toContain('Available wikis')
    expect(html).toContain('data-store-name="wiki-a"')
    expect(html).not.toContain('Getting started')
  })
})

// ===========================================================================
// Finding 3 — input-source divergence: the landing documents come from the
// snapshot's doc-head edges (the emptiness source), never a stale lastDocHeads.
// ===========================================================================
describe('U-LIVE4 AD-2026-09-14-3 — input-source divergence: a stale lastDocHeads never renders non-traversable documents', () => {
  it('a stale non-empty lastDocHeads with a zero-doc-head snapshot → the landing shows no li[data-document-id]', async () => {
    // lastDocHeads is non-empty (the doc-nav IPC) but the snapshot has ZERO
    // doc-head edges (the true store state) — the stale-doc divergence.
    const h = makeHarness({
      docHeads: [{ documentId: 'stale-doc', title: 'Stale Doc', path: [], tags: [] }],
      snapshot: { nodes: [], edges: [] },
    })
    await h.host.boot(h.runtime)

    // The boot is empty (no snapshot doc-heads) → the empty-store landing.
    expect(contentRootIds(h.runtime)).toContain('stage-landing')

    // The landing lists documents from the SNAPSHOT (authoritative, empty), so
    // the landing BODY itself contains no `li[data-document-id]` for the
    // non-traversable stale doc — it degrades to "Getting started" + "No
    // documents yet." (the `li[data-document-id]` that MAY appear elsewhere is
    // the doc-nav pane's OWN listing of `lastDocHeads`, not the landing).
    const landingRoot = h.runtime
      .materializedContentRoots()
      .find((r) => (r.props as { id?: unknown } | undefined)?.id === 'stage-landing')
    expect(landingRoot).toBeDefined()
    const landingJson = JSON.stringify(landingRoot)
    expect(landingJson).not.toContain('data-document-id')
    expect(landingJson).toContain('No documents yet.')
    expect(landingJson).toContain('Getting started')
  })
})

// ===========================================================================
// Finding 4 — zone-not-in-layout: the empty path targets a REAL zone (the
// target zone producer is ensured in the template), never an unresolvable one.
// ===========================================================================
describe('U-LIVE4 AD-2026-09-14-4 — zone-not-in-layout: a template lacking the target zone still resolves the landing', () => {
  it('a custom template WITHOUT a `main` producer → the empty-store envelope adds the zone:main producer and the landing resolves', async () => {
    // A customized content-window template whose only container is `side` —
    // no `main` producer for the default `zoneName` ('main').
    const templateNoMain = {
      root: {
        type: 'div',
        props: { id: 'wiki-root' },
        children: [
          { type: 'div', props: { id: 'zone:side' }, placement: { placementName: 'side' } },
        ],
      },
    }
    const h = makeHarness({ template: templateNoMain })
    await h.host.boot(h.runtime)

    // Defense-in-depth: the empty-store envelope carries a `zone:main` producer
    // (mirroring buildTraversal's ensure), so the landing has a REAL target.
    const env = seams(h.host).buildTraversalEnvelope({ nodes: [], edges: [] }, [])
    const templateChildren = (env.template?.root?.children ?? []) as Array<{
      props?: Record<string, unknown>
      placement?: { placementName?: string }
    }>
    expect(templateChildren.some((c) => c.placement?.placementName === 'main')).toBe(true)

    // And the assembled graph resolves it: the landing is resident + rendered
    // (never silently dropped).
    expect(contentRootIds(h.runtime)).toContain('stage-landing')
    expect(domHtml(h)).toContain('stage-landing')
  })
})
