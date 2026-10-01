// tests/stage-active-tab-display-adversarial.test.ts — the ADVERSARIAL half of
// Unit `U-STAGE-ACTIVE-TAB`'s node red set (spec §8.1's
// `tests/unit-stage-active-tab-display-adversarial.test.ts` slot; §5.5's
// non-throw/totality guarantees; §6's register rows in their HOSTILE-input
// direction).
//
// Split rationale (recorded so the two files are not read as one): the sibling
// `tests/unit-stage-active-tab-display.test.ts` carries the §5.4 state walk and
// the §5.5 FS-1..FS-9 rows on WELL-FORMED inputs; this file carries the
// totality/negative direction only — malformed and hostile inputs, `null`/empty
// identities, the multi-way settlement interleavings, and the "the generator
// must not be weakened" cases of §6's register (rows P-IM-1, P-IM-3, P-IM-4,
// P-SM-1, P-TP-2).
//
// The §5.5 "Non-throw / totality guarantees" this file pins, verbatim in intent:
//   - `mountTab(null)` and `mountTab` with any well-formed `TabEntry` never
//     throw and never leave the stage empty except in the pin-`null` case;
//   - a discarded async mount is NOT an error — a counted drop, never a console
//     error, never a rejection;
//   - `getActiveTabId()` / `getActiveTargetKind()` / `getActiveDocumentId()` /
//     `getStageMountDropped()` are TOTAL and side-effect-free;
//   - `restoreCaret` never throws and never returns a caret whose document is dead;
//   - `refresh()` never throws on a bridge failure.
//
// Cross-ref (do not duplicate): `tests/page-commit-tab-ownership.test.ts` owns
// the FS-5 / P-SM-2 cross-tab dirty/failure/caret-isolation rows (T1–T7). The
// rows here read the OWNERSHIP KEY only in its adversarial direction (the
// `pageSubjectDocument` totality of P-IM-4), never the isolation direction.
//
// ⟨A.1 — AMENDED 2026-09-22 (`docs/specs/unit-stage-active-tab-display.md` §A.1)⟩
// TWO rows in this file were amended (the other two amended rows + the new `R8`
// live in the sibling `tests/unit-stage-active-tab-display.test.ts`):
//   • `A4/P-SM-1` (§A.1.1/§A.1.3): `surfaceIds(h).length <= 1` is SUPERSEDED by
//     the EXACT §A.1.1 `I2-R` census per step, counted by BOTH discriminators
//     (the authored `PAGE_EDIT_SURFACE_ID` id AND the `data-edit-surface`
//     marker, which must agree) — a document tab with a ZERO surface must fail
//     the row. The `String(r).split('-')[0]` body reader was DEFECTIVE (it
//     collapsed `doc-a-head`/`doc-b-head` to `doc`, so the row passed
//     vacuously): it is replaced by a document-keyed census, and the body clause
//     is now explicitly non-total at the `mountTabs` seam only (§A.1.3).
//   • `A3/P-IM-4` (§A.1.4): `hookCalls.length > 0` + `toContain('t1')` were
//     unsatisfiable by ANY implementation (`HOSTILE_SUBJECTS` has no `'t1'`;
//     the read-before-save loop meant the caret-less early return never
//     consulted the hook). Re-pinned to the CONSULTATION SET: save a caret
//     under every hostile subject first, then read it back — `hookCalls`
//     EQUALS the hostile-subject list in read order and contains NO `'t1'`,
//     and a caret-less read returns `undefined` without consulting the hook.
//     The positive (`subject === activeTabId`) direction is NOT asserted here
//     (no read in this row receives `'t1'`); the sibling file owns it.
//
// **`P-TP-1` is NOT written here either — it is live-only (RCA-12).** The
// register marks it `live-only (assembled)`; no node run may claim it, and its
// discriminators are the §8.3 live blocks. Recorded, not silently skipped.
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { PAGE_EDIT_SURFACE_ID, DATA_EDIT_SURFACE } from '../src/renderer/pane-graph.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import type { OperatorSettings } from '../src/shared/types.js'
import type { TabEntry, TabTarget } from '../src/renderer/tab-state.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

beforeAll(() => {
  installShim()
})

const DOC_A = 'doc-a'
const DOC_B = 'doc-b'
const T = new Date().toISOString()

function makeNode(id: string, type: string, content: string): RagNode {
  return { id, type, content, ownedNodeIds: [], createdAt: T, updatedAt: T }
}
function makeEdge(id: string, source: string, target: string): RagEdge {
  return { id, kind: 'doc-head', source, target, createdAt: T, updatedAt: T, documentIds: [target] }
}
function docTab(id: string, documentId: string): TabEntry {
  return { id, target: { kind: 'document', documentId } as TabTarget, title: documentId }
}
function searchTab(id: string, query: string): TabEntry {
  return { ...docTab(id, ''), target: { kind: 'search', queryId: `q-${id}` } as TabTarget, title: `S:${query}`, search: { query, topK: 5 } }
}

interface Deferred<T> { promise: Promise<T>; resolve: (v: T) => void }
function deferred<T>(): Deferred<T> {
  let resolve!: (v: T) => void
  const promise = new Promise<T>((res) => { resolve = res })
  return { promise, resolve }
}
function queryResult(query: string) {
  return { query, ranked: [], results: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  mount: ReturnType<typeof mountEl>
  editController: ReturnType<typeof createEditController>
  backRefs: Map<string, string[]>
  settleNext: (n?: number, q?: string) => Promise<void>
  pendingCount: () => number
  queryCalls: () => number
}

function makeHarness(): Harness {
  const mount = mountEl()
  const operatorMount = mountEl()
  const registry = createPaneRegistry()
  const store = createSnapshotStore(
    [makeNode(`${DOC_A}-head`, 'h1', 'Doc A'), makeNode(`${DOC_B}-head`, 'h1', 'Doc B')],
    [makeEdge('ea', `${DOC_A}-head`, DOC_A), makeEdge('eb', `${DOC_B}-head`, DOC_B)],
  )
  const pendings: Array<Deferred<unknown>> = []
  let queryCount = 0
  const bridge = {
    security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: { onRagStoreChanged: () => () => {}, commitRich: async () => ({ ok: true }), batch: async () => ({ ok: true, results: [] }) },
    rag: {
      query: vi.fn((q: string) => {
        queryCount += 1
        const d = deferred<unknown>()
        pendings.push(d)
        return d.promise
      }),
      snapshot: async () => ({ store: 'main', nodes: store.listNodes(), edges: store.listEdges() }),
      backlinks: async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
      docHeads: async () => ({ documents: [{ documentId: DOC_A, title: 'A', path: [], tags: [] }, { documentId: DOC_B, title: 'B', path: [], tags: [] }] }),
      stores: async () => ({ stores: [] }),
      manage: async () => ({ ok: true }),
    },
    template: {
      get: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      validate: async () => ({ ok: true }),
      set: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      create: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      delete: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      reset: async () => ({ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }),
      onTemplateChanged: () => () => {},
    },
    operatorSettings: {
      get: async () => ({ enabledPanes: [], panesInitialized: true, defaultDocumentId: null, topK: 5 }) as unknown as OperatorSettings,
      set: async (p: Record<string, unknown>) => p as unknown as OperatorSettings,
      onChanged: () => () => {},
    },
  }
  const backRefs = new Map<string, string[]>([['t1', [`${DOC_A}-head`]], ['t2', [`${DOC_B}-head`]], ['s1', [`${DOC_A}-head`]]])
  let host: SidebarPanes
  const editController = createEditController({ backRefs, commit: async () => ({ ok: true, nodeId: 'x' }), onRebuild: (k) => void host.reDerive(k) })
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({
    mount: mount as never,
    envelope: { template: DEFAULT_CONTENT_WINDOW_TEMPLATE, content: [], clientConfig: { runInstantiation: true, runRendering: true } } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return {
    host,
    runtime,
    mount,
    editController,
    backRefs,
    pendingCount: () => pendings.length,
    queryCalls: () => queryCount,
    settleNext: async (n = 1, q = 'alpha') => {
      for (let i = 0; i < n; i++) {
        const d = pendings.shift()
        if (d) d.resolve(queryResult(q))
      }
      await flush()
    },
  }
}

async function boot(h: Harness): Promise<Harness> {
  await h.host.boot(h.runtime)
  return h
}
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}
type ShimLike = { innerHTML: string; querySelectorAll(sel: string): Array<{ getAttribute(k: string): string | null }> }
function el(h: Harness): ShimLike {
  return h.mount as unknown as ShimLike
}
function surfaceIds(h: Harness): Array<string | null> {
  return el(h)
    .querySelectorAll(`[${DATA_EDIT_SURFACE}]`)
    .map((e) => e.getAttribute(DATA_EDIT_SURFACE))
}
function documentRoots(h: Harness): number {
  return el(h).querySelectorAll('[data-rag-node-id]').length
}
/** ⟨§A.1.1 I2-R — AMENDED 2026-09-22⟩ the page-edit surface census counted by
 *  BOTH discriminators: the AUTHORED id `PAGE_EDIT_SURFACE_ID` (the shim's
 *  selector subset has no `#`-id form, so the equivalent `[id='…']`
 *  attribute-equals compound stands in) AND the `DATA_EDIT_SURFACE` marker. A
 *  live root carrying one without the other is the SAME violation (a leak), so
 *  `agrees` requires the two readings to be identical: same count AND the same
 *  marker value on every root, in DOM order. */
function surfaceRootCensus(h: Harness): {
  authored: number
  marked: number
  markerIds: Array<string | null>
  agrees: boolean
} {
  const authoredRoots = el(h).querySelectorAll(`[id='${PAGE_EDIT_SURFACE_ID}']`)
  const markedRoots = el(h).querySelectorAll(`[${DATA_EDIT_SURFACE}]`)
  const markerIds = markedRoots.map((e) => e.getAttribute(DATA_EDIT_SURFACE))
  const authoredMarkerIds = authoredRoots.map((e) => e.getAttribute(DATA_EDIT_SURFACE))
  return {
    authored: authoredRoots.length,
    marked: markedRoots.length,
    markerIds,
    agrees:
      authoredRoots.length === markedRoots.length &&
      authoredMarkerIds.length === markerIds.length &&
      authoredMarkerIds.every((v, i) => v != null && v === markerIds[i]),
  }
}
/** ⟨§A.1.3 — AMENDED⟩ the stage's body-root census keyed BY DOCUMENT. The
 *  previous `String(r).split('-')[0]` idiom collapsed `doc-a-head` and
 *  `doc-b-head` to the single token `doc`, so the "at most one document" row
 *  passed VACUOUSLY with both documents mounted (the recorded defect). An
 *  unattributable root is reported as `?<root>` so it can never pass silently. */
function bodyDocIds(h: Harness): string[] {
  const roots = el(h)
    .querySelectorAll('[data-rag-node-id]')
    .map((e) => String(e.getAttribute('data-rag-node-id')))
  const out: string[] = []
  for (const r of roots) {
    const key = [DOC_A, DOC_B].find((d) => r === d || r.startsWith(`${d}-`)) ?? `?${r}`
    if (!out.includes(key)) out.push(key)
  }
  return out
}
function stageKind(h: Harness): string {
  const html = el(h).innerHTML
  if (surfaceIds(h).length > 0 || documentRoots(h) > 0) return 'document'
  if (html.includes('stage-search-tab')) return 'search'
  if (html.includes('stage-landing')) return 'landing'
  if (html.includes('data-stage="placeholder"')) return 'placeholder'
  return 'unknown'
}
/** §5.2's readers — absent at HEAD (RED). */
function readerFn<T>(host: SidebarPanes, name: string): () => T {
  const fn = (host as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') throw new TypeError(`SidebarPanes.${name}() does not exist (§5.2 — RED)`)
  return () => (fn as () => T).call(host)
}

// ===========================================================================
// A1 — §5.5 non-throw/totality: hostile + malformed mounts
// ===========================================================================
describe('§5.5 non-throw guarantees — malformed and hostile mounts never throw', () => {
  it('A1 — `mountTab(null)` / a malformed entry / an unknown kind never throw, and the stage is defined at every step', async () => {
    const h = await boot(makeHarness())
    const hostile: Array<TabEntry | null> = [
      null,
      { id: '', target: { kind: 'document', documentId: DOC_A } } as TabEntry, // empty id
      { id: 'x', target: { kind: 'bogus' } } as unknown as TabEntry, // unknown kind
      { id: '__proto__', target: { kind: 'other', id: 'landing' } } as TabEntry,
      { id: 'x', target: { kind: 'document', documentId: '' } } as TabEntry, // empty document id
      undefined as unknown as TabEntry,
    ]
    for (const e of hostile) {
      expect(() => h.host.mountTab(e), `mountTab(${JSON.stringify(e)}) must not throw (§5.5 totality)`).not.toThrow()
      expect(typeof el(h).innerHTML, 'the stage is always readable after a mount attempt').toBe('string')
    }
    expect(() => h.host.mountTabs([]), 'mountTabs([]) never throws').not.toThrow()
    expect(() => h.host.mountTabs(undefined as never), 'a malformed open set never throws').not.toThrow()
  })

  it('A1 [RED] — after a hostile/empty-id mount the identity readers stay TOTAL (a string or null, never undefined)', async () => {
    const h = await boot(makeHarness())
    const id = readerFn<string | null>(h.host, 'getActiveTabId')
    const kind = readerFn<string | null>(h.host, 'getActiveTargetKind')
    const doc = readerFn<string | null>(h.host, 'getActiveDocumentId')
    const dropped = readerFn<number>(h.host, 'getStageMountDropped')

    h.host.mountTab({ id: '', target: { kind: 'document', documentId: DOC_A } } as TabEntry)
    expect([id(), kind(), doc()].every((v) => v === null || typeof v === 'string'), 'the readers are total (§5.5)').toBe(true)
    expect(typeof dropped(), 'getStageMountDropped() is total and side-effect-free (§5.5)').toBe('number')

    // side-effect-free: two consecutive reads agree, and a read changes nothing
    const before = [id(), kind(), doc(), dropped()]
    void [id(), kind(), doc(), dropped()]
    expect([id(), kind(), doc(), dropped()], 'a read never mutates the host state').toEqual(before)
  })
})

// ===========================================================================
// A2 — §5.3.1 hostile settlement interleavings (the P-IM-1 generator's cases)
// ===========================================================================
describe('§5.3.1 / P-IM-1 adversarial — arbitrary settlement order never lets an older attempt apply', () => {
  it('A2/FS-1 [RED] — three pending search mounts: settling ALL of them, out of order, leaves the LAST mount\'s body and counts 3 drops', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(searchTab('s1', 'one'))
    h.host.mountTab(searchTab('s2', 'two'))
    h.host.mountTab(searchTab('s3', 'three'))
    expect(h.pendingCount(), 'each mount issues its own query (§5.3.1 consequence 4)').toBe(3)

    await h.settleNext(3, 'q')
    const html = el(h).innerHTML
    expect(html, 'the LAST attempt is the displayed body (§6 P-IM-1)').toContain('data-tab-id="s3"')
    expect(html, 'an older attempt must never be the visible body').not.toContain('data-tab-id="s1"')
    expect(readerFn<number>(h.host, 'getStageMountDropped')(), 'two superseded settlements ⇒ 2 drops').toBe(2)
  })

  it('A2/FS-1 [RED] — a search settlement after `mountTab(null)` is discarded, and `null` does NOT increment the generation (§5.3.1)', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(searchTab('s1', 'alpha'))
    h.host.mountTab(null)
    await h.settleNext(1)
    const html = el(h).innerHTML
    expect(html, 'the discarded completion must not render the search body into a cleared stage').not.toContain('stage-search-tab')
    expect(surfaceIds(h), 'and no surface').toEqual([])
    expect(readerFn<number>(h.host, 'getStageMountDropped')(), 'the discard is counted (§5.3.1: no mount ⇒ no generation bump, but a counted drop)').toBe(1)
    expect(readerFn<string | null>(h.host, 'getActiveTabId')(), 'the identity stays null').toBeNull()
  })

  it('A2 [RED] — a discarded completion is SILENT: no console error, no unhandled rejection (FS-1\'s direction)', async () => {
    const errors: unknown[] = []
    const spy = vi.spyOn(console, 'error').mockImplementation((...a: unknown[]) => { errors.push(a) })
    try {
      const h = await boot(makeHarness())
      h.host.mountTab(searchTab('s1', 'alpha'))
      h.host.mountTab(docTab('t2', DOC_B))
      await h.settleNext(1)
      const html = el(h).innerHTML
      expect(html, 'the stale body must not be applied (FS-1)').not.toContain('stage-search-tab')
      expect(errors, 'a discarded async mount is NOT an error (§5.5: counted drop, never a console error)').toEqual([])
    } finally {
      spy.mockRestore()
    }
  })
})

// ===========================================================================
// A3 — §5.3.2/P-IM-4 hostile subjects: the hook must be TOTAL
// ===========================================================================
describe('§5.3.2 / P-IM-4 — `pageSubjectDocument` is total over hostile subject ids', () => {
  const HOSTILE_SUBJECTS = ['__proto__', 'constructor', '', ' ', 'doc-a', 'unknown-tab', 'null', 'hasOwnProperty', 't1\u0000x']

  it('A3/P-IM-4 [RED] — the hook is NEVER the identity function: every hostile subject resolves to `null`, and the consultation set is exactly the reads WITH a saved caret', async () => {
    // The hostile subjects ARE present in `backRefs`, so the LEGACY guard
    // (`backRefs.has(subjectId)`) would restore them — only the hook's `null`
    // answer can make this row discriminate (§5.3.2).
    const backRefs = new Map<string, string[]>(
      HOSTILE_SUBJECTS.map((subject) => [subject, []] as [string, string[]]).concat([[DOC_A, []] as [string, string[]]]),
    )
    const hookCalls: string[] = []
    const controller = createEditController({
      backRefs,
      commit: async () => ({ ok: true, nodeId: 'x' }),
      onRebuild: vi.fn(),
      pageSubjectDocument: (subject: string) => {
        hookCalls.push(subject)
        return subject === 't1' ? DOC_A : null
      },
    } as never)

    expect(backRefs.has('__proto__'), 'the legacy guard alone WOULD accept this hostile key (so the row is not vacuous)').toBe(true)
    const caret = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }
    // ⟨§A.1.4 — AMENDED 2026-09-22⟩ the pinned order is: `saved = carets.get(subject)`;
    // if `saved == null` ⇒ `undefined` and DO NOT consult `pageSubjectDocument`.
    // The hook's CONSULTATION SET is therefore EXACTLY the subjects read WITH a
    // saved caret entry, once per call, in read order. So: save an entry under
    // EVERY hostile subject FIRST, then read each one back. The hook's `null`
    // answer is what discriminates a hostile subject from the legacy
    // `backRefs.has(subjectId)` guard (which WOULD restore every one of them —
    // they are all `backRefs` keys in this row's fixture).
    for (const s of HOSTILE_SUBJECTS) controller.saveCaret(s, caret as never)
    for (const s of HOSTILE_SUBJECTS) {
      expect(
        controller.restoreCaret(s),
        `P-IM-4: the hostile subject ${JSON.stringify(s)} must not be restored — the answer is the hook's \`null\`, never \`backRefs.has(subjectId)\``,
      ).toBeUndefined()
    }
    expect(() => HOSTILE_SUBJECTS.forEach((s) => controller.restoreCaret(s)), 'P-IM-4: never throws').not.toThrow()
    // ⟨§A.1.4 — the re-pinned `:317`/`:318`⟩ `hookCalls` EQUALS the hostile-subject
    // list in read order (each consulted exactly once) and contains NO `'t1'`:
    // `HOSTILE_SUBJECTS` has no `'t1'`, so no `restoreCaret` call in this row ever
    // receives it (the former `if (s === 't1') continue` was dead code and the
    // former `toContain('t1')` was unsatisfiable by ANY implementation).
    expect(
      hookCalls,
      'P-IM-4/A.1.4: `pageSubjectDocument` is consulted exactly ONCE per read WITH a saved caret, in read order',
    ).toEqual(HOSTILE_SUBJECTS)
    expect(
      hookCalls,
      "A.1.4: the consultation set never contains 't1' — no read in this row receives it",
    ).not.toContain('t1')
    // ...and the CARET-LESS direction (§A.1.4 clause 1): a read with NO saved
    // entry returns `undefined` WITHOUT consulting the hook (a hook-first
    // implementation is the deviation the pin forbids).
    const consulted = hookCalls.length
    expect(controller.restoreCaret('t1'), 'A.1.4 clause 1: a caret-less read returns undefined').toBeUndefined()
    expect(hookCalls.length, 'A.1.4 clause 1: and does NOT consult the hook for it').toBe(consulted)
    expect(hookCalls, "A.1.4: still no 't1' in the consultation set").not.toContain('t1')
  })

  it('A3/P-IM-4 [RED] — a `__proto__`-class subject never becomes a live key that restores a foreign document\'s caret', async () => {
    const controller = createEditController({
      backRefs: new Map<string, string[]>([[DOC_A, []], ['__proto__', []]]),
      commit: async () => ({ ok: true, nodeId: 'x' }),
      onRebuild: vi.fn(),
      // The hook is asked about the ACTIVE tab only; `__proto__` is not it —
      // and the legacy guard WOULD accept it, which is the vacuity this closes.
      pageSubjectDocument: (s: string) => (s === 'tab-live' ? DOC_A : null),
    } as never)
    const caret = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }
    controller.saveCaret('__proto__', caret as never)
    expect(controller.restoreCaret('__proto__'), 'a prototype-class key must not validate against the active document').toBeUndefined()
    expect(Object.prototype.hasOwnProperty.call(controller, '__proto__'), 'no prototype pollution through a subject key').toBe(false)
  })

  it('A3/FS-6 [RED] — the WRONG-DOCUMENT direction: the guard consults the hook and never `backRefs.has(subjectId)`', async () => {
    // `t1` IS a `backRefs` key (as the harness convention gives every tab id a
    // live back-reference), so a `backRefs.has(subjectId)` guard restores it —
    // the FS-6 dead-guard direction. The hook says `t1`'s document is doc-a while
    // the ACTIVE document is doc-b (a STALE subject), so the caret must not be
    // restored against doc-b's surface.
    const controller = createEditController({
      backRefs: new Map<string, string[]>([['t1', ['x']], [DOC_B, ['y']]]),
      commit: async () => ({ ok: true, nodeId: 'x' }),
      onRebuild: vi.fn(),
      pageSubjectDocument: (s: string) => (s === 't2' ? DOC_B : null),
    } as never)
    const caret = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }
    controller.saveCaret('t1', caret as never)
    expect(
      controller.restoreCaret('t1'),
      'FS-6: a subject that is not the active tab must not be restored, even when it IS a `backRefs` key (the guard is the hook, not the key)',
    ).toBeUndefined()
  })
})

// ===========================================================================
// A4 — §5.3.3/P-SM-1: the stage seams under a hostile schedule
// ===========================================================================
describe('§5.3.3 / P-SM-1 adversarial — no seam may leave two documents in the stage', () => {
  it('A4/P-SM-1 [RED] — the seam alphabet leaves EXACTLY the active document\'s surface (both discriminators) and only the §A.1.3-carved-out bodies at every step', async () => {
    const h = await boot(makeHarness())
    // ⟨§A.1.1 / §A.1.3 — AMENDED 2026-09-22⟩ per-step, EXACT expectations.
    //  • `surfaces` is the §A.1.1 `I2-R` census: `1` iff a document tab is active
    //    (the marker value IS the active document id), else `0`. `<= 1` is
    //    SUPERSEDED — it is trivially satisfied by a build that authors NO
    //    surface on a document tab (step 1/2/3/8 must fail that build).
    //  • `mountTabs` sets NO active identity, so after step 2 the live surface is
    //    the ACTIVE document tab's (doc-a, from step 1): never 2 (the refused
    //    destroy, §A.1.2), never 0.
    //  • `bodies` is the §A.1.3 document-keyed census; the body clause is NOT
    //    total at the `mountTabs` seam (9b's simultaneous multi-mount is the
    //    whole point), so only that step may show two documents.
    const steps: Array<{ name: string; run: () => Promise<void> | void; bodies: string[]; surfaces: string[] }> = [
      // step 1 IS the explicit doc-tab pre-state (A.1.1), so step 2 starts from
      // an active DOCUMENT tab.
      { name: 'mountTab(doc A)', run: () => h.host.mountTab(docTab('t1', DOC_A)), bodies: [DOC_A], surfaces: [DOC_A] },
      { name: 'mountTabs([A,B])', run: () => h.host.mountTabs([docTab('t1', DOC_A), docTab('t2', DOC_B)]), bodies: [DOC_A, DOC_B], surfaces: [DOC_A] },
      { name: 'mountTab(doc B)', run: () => h.host.mountTab(docTab('t2', DOC_B)), bodies: [DOC_B], surfaces: [DOC_B] },
      { name: 'mountTab(search)', run: async () => { h.host.mountTab(searchTab('s1', 'alpha')); await h.settleNext(1) }, bodies: [], surfaces: [] },
      { name: 'reDerive(content)', run: () => h.host.reDerive('content'), bodies: [], surfaces: [] },
      { name: 'refresh()', run: () => h.host.refresh(), bodies: [], surfaces: [] },
      { name: 'mountTab(null)', run: () => h.host.mountTab(null), bodies: [], surfaces: [] },
      { name: 'mountTab(doc A)', run: () => h.host.mountTab(docTab('t1', DOC_A)), bodies: [DOC_A], surfaces: [DOC_A] },
    ]
    const seen: string[] = []
    for (const step of steps) {
      await step.run()
      const census = surfaceRootCensus(h)
      seen.push(
        `${step.name}: bodies=[${bodyDocIds(h).join(',')}] surfaces(authored=${census.authored},marked=${census.marked},values=[${census.markerIds.join(',')}],agrees=${census.agrees}) kind=${stageKind(h)}`,
      )
      const line = seen[seen.length - 1]
      expect(census.agrees, `I2-R: both discriminators must agree after "${step.name}" (${line})`).toBe(true)
      expect(
        census.authored,
        `I2-R: the EXACT surface census after "${step.name}" — a document tab with a ZERO surface fails here too (${line})`,
      ).toBe(step.surfaces.length)
      expect(
        census.markerIds,
        `I2-R: the live surface carries the ACTIVE document's marker after "${step.name}" (${line})`,
      ).toEqual(step.surfaces)
      expect(
        [...bodyDocIds(h)].sort(),
        `P-SM-1/A.1.3: the document-keyed body census after "${step.name}" (${line})`,
      ).toEqual([...step.bodies].sort())
      if (step.surfaces.length === 0) {
        // I2 non-document clause: no document body root off a document tab
        expect(documentRoots(h), `I2 non-document clause after "${step.name}" (${line})`).toBe(0)
      }
    }
    // §A.1.1's predicate FORM through the pinned §5.2 readers, at the settled
    // final step (a document tab): census === 1 and the DOM identity IS the
    // active document id. (The mid-loop identity is asserted against the known
    // ACTIVE document at that step so today's failure is the DOM CENSUS — 2 ≠ 1
    // at step 2 — rather than a missing reader preempting the whole loop; the
    // reader cross-check closes the same claim through the pinned seam.)
    const kind = readerFn<string | null>(h.host, 'getActiveTargetKind')()
    const finalCensus = surfaceRootCensus(h)
    expect(
      finalCensus.authored,
      `I2-R: census === (getActiveTargetKind() === 'document' ? 1 : 0) (kind=${kind}; authored=${finalCensus.authored})`,
    ).toBe(kind === 'document' ? 1 : 0)
    expect(
      finalCensus.markerIds,
      "I2-R: when the census is 1, the marker IS the active document id (§A.1.1)",
    ).toEqual([readerFn<string | null>(h.host, 'getActiveDocumentId')()])
  })

  it('A4 [RED] — `refresh()` never throws on a bridge failure (its own totality guarantee)', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    const w = (globalThis as unknown as { window: { provident: { rag: Record<string, unknown> } } }).window
    const original = w.provident.rag.snapshot
    w.provident.rag.snapshot = async () => { throw new Error('bridge down') }
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      await expect(h.host.refresh(), '§5.5: refresh() never throws').resolves.toBeUndefined()
    } finally {
      w.provident.rag.snapshot = original
      spy.mockRestore()
    }
  })
})

// ===========================================================================
// A5 — §5.3.5/P-TP-2: caret lifecycle totality across the 5-field space
// ===========================================================================
describe('§5.3.2 / P-TP-2 adversarial — the caret lifecycle is TOTAL across (subject, liveness, surface, kind)', () => {
  it('A5/P-TP-2 [RED] — every combination returns a caret IFF (active tab ∧ live document ∧ page-scoped), and never throws', async () => {
    const combos: Array<{
      name: string
      subject: string
      doc: string | null
      backRefs: string[]
      caretKind: string
      ragId: string
      expectRestore: boolean
    }> = [
      { name: 'live tab id, live doc, page caret', subject: 't1', doc: DOC_A, backRefs: [DOC_A], caretKind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, expectRestore: true },
      { name: 'live tab id, DELETED doc', subject: 't1', doc: DOC_A, backRefs: [], caretKind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, expectRestore: false },
      { name: 'non-document active tab (doc null)', subject: 't1', doc: null, backRefs: [DOC_A], caretKind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, expectRestore: false },
      { name: 'foreign subject (not the active tab)', subject: 't2', doc: null, backRefs: [DOC_A], caretKind: 'rich', ragId: PAGE_EDIT_SURFACE_ID, expectRestore: false },
      { name: 'caret addresses a non-surface root (FS2)', subject: 't1', doc: DOC_A, backRefs: [DOC_A], caretKind: 'rich', ragId: 'per-node-root', expectRestore: false },
    ]
    const results: string[] = []
    for (const c of combos) {
      const controller = createEditController({
        backRefs: new Map(c.backRefs.map((id) => [id, []])),
        commit: async () => ({ ok: true, nodeId: 'x' }),
        onRebuild: vi.fn(),
        pageSubjectDocument: (s: string) => (s === c.subject ? c.doc : null),
      } as never)
      const caret = { kind: c.caretKind as 'rich', ragId: c.ragId, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }
      controller.saveCaret(c.subject, caret as never)
      let out: unknown
      expect(() => { out = controller.restoreCaret(c.subject) }, `P-TP-2: ${c.name} must never throw`).not.toThrow()
      const restored = out !== undefined
      results.push(`${c.name} ⇒ ${restored ? 'restored' : 'undefined'}`)
      expect(restored, `P-TP-2 [${c.name}]: ${results[results.length - 1]}`).toBe(c.expectRestore)
    }
  })

  it('A5 [RED] — a cleared stale caret does not resurface after the same subject is re-saved (no ghost restore)', async () => {
    const controller = createEditController({
      backRefs: new Map<string, string[]>([[DOC_A, []]]),
      commit: async () => ({ ok: true, nodeId: 'x' }),
      onRebuild: vi.fn(),
      pageSubjectDocument: (s: string) => (s === 't1' ? null : DOC_A),
    } as never)
    const caret = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }
    controller.saveCaret('t1', caret as never)
    expect(controller.restoreCaret('t1'), 'first read: cleared (no live document)').toBeUndefined()
    expect(controller.restoreCaret('t1'), 'second read: still cleared (the entry was deleted, not hidden)').toBeUndefined()
  })
})

// ===========================================================================
// A6 — §5.3.6/P-IM-3: the ownership subject under a hostile tab set
// ===========================================================================
describe('§5.3.2 / P-IM-3 adversarial — the subject is never null/empty/undefined', () => {
  it('A6/P-IM-3 [RED] — for every reachable state the subject is a non-empty string that is never a document id', async () => {
    const h = await boot(makeHarness())
    const subject = () => {
      const m = (h.host as unknown as { pageEditSurfaceHandlerSubject?: () => string }).pageEditSurfaceHandlerSubject
      if (typeof m !== 'function') return '<missing>'
      return m.call(h.host)
    }
    const states: Array<[string, () => void]> = [
      ['no mount', () => {}],
      ['empty-id mount', () => h.host.mountTab({ id: '', target: { kind: 'document', documentId: DOC_A } } as TabEntry)],
      ['document mount', () => h.host.mountTab(docTab('t1', DOC_A))],
      ['search mount', () => h.host.mountTab(searchTab('s1', 'alpha'))],
      ['null mount', () => h.host.mountTab(null)],
      ['open-set mount', () => h.host.mountTabs([docTab('t2', DOC_B)])],
    ]
    const seen: string[] = []
    for (const [name, run] of states) {
      run()
      await flush()
      const s = subject()
      seen.push(`${name} ⇒ ${JSON.stringify(s)}`)
      expect(typeof s === 'string' && s.length > 0, `P-IM-3: the subject is never null/empty/undefined (${seen[seen.length - 1]})`).toBe(true)
      expect(s, `P-IM-3: a document id is NEVER the subject (${seen[seen.length - 1]})`).not.toBe(DOC_A)
      expect(s, `P-IM-3: nor the other document id (${seen[seen.length - 1]})`).not.toBe(DOC_B)
    }
  })

  it('A6/P-IM-3 [RED] — the subject always equals `getActiveTabId()` when non-null, else PAGE_EDIT_SURFACE_ID', async () => {
    const h = await boot(makeHarness())
    const subject = () => {
      const m = (h.host as unknown as { pageEditSurfaceHandlerSubject?: () => string }).pageEditSurfaceHandlerSubject
      if (typeof m !== 'function') throw new TypeError('pageEditSurfaceHandlerSubject() missing (§5.3.2)')
      return m.call(h.host)
    }
    const activeId = readerFn<string | null>(h.host, 'getActiveTabId')

    h.host.mountTab(docTab('t1', DOC_A))
    expect(subject(), 'non-null active tab ⇒ the tab id').toBe(activeId())
    h.host.mountTab(null)
    expect(activeId(), 'null mount ⇒ no active tab').toBeNull()
    expect(subject(), 'and the pinned fallback').toBe(PAGE_EDIT_SURFACE_ID)
  })
})
