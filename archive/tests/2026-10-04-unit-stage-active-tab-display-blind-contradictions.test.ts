// tests/unit-stage-active-tab-display-blind-contradictions.test.ts
// Unit `U-STAGE-ACTIVE-TAB` — the BLIND-CONTRADICTION remand (two rows) for the
// two FAILs of the independent blind-greens run.
//
// EVIDENCE ARTIFACT (read in full, cited in-row): `docs/specs/unit-stage-active-tab-display-greens.md`
//   • §A row A11  — boot seam, no `mountTab`: measured `census=1/1 marker=["doc-a"]` with
//                   `activeTargetKind=null`, `activeDocumentId=null`;
//   • §A row A11b — booted with the persisted `defaultDocumentId='doc-b'`: the marker is STILL
//                   `["doc-a"]` ⇒ the boot surface is authored with no owning tab;
//   • §C row C7   — the caret hook: `calls=[]` for BOTH the caret-less read and the saved-caret
//                   read, and a `null` answer / a `'ghost-doc'` answer each RESTORED the caret
//                   instead of clearing it;
//   • §D F1/F2    — those rows as the artifact's verbatim observed output, with the clause each
//                   contradicts; §E NT-9 — app-level reachability of the boot state is
//                   NOT-TESTABLE in node (so ROW 1 pins the HOST-level state only).
//
// CONTRACT (authority; expectations below are derived from THIS text + the artifact's measured
// facts, NEVER from the implementation): `docs/specs/unit-stage-active-tab-display.md`
//   • §5.1 I2 clause 3 — "the surface count in the stage region is **1 iff** a document tab is
//     active, else **0**" (the census predicate) **⟨§A.3.1 C1 — this is the TAB-STATE arm: from the
//     first `mountTab`/`mountTabs` onward. The `boot` pre-tab state is the CARVE-OUT below.⟩**;
//   • §A.3.1 RULING C1 (2026-09-22/23, superseding this file's original S1/S2 expectation) — the
//     **BOOT CARVE-OUT**: the pre-tab state is a CONTRACT STATE of its own (`isPreTabState() === true`
//     iff no tab state has been handed; monotonic), the census there is **1** with
//     `data-edit-surface === getPreTabDocumentId()`, and the pre-tab document is the retained
//     default-context document (`_currentDocumentId`, else the alphabetically-first doc-head — the
//     artifact A11b measurement: a persisted `defaultDocumentId='doc-b'` does NOT move it). No clause
//     makes the pre-tab surface equal the first tab's document; the first `mountTab` re-owns (clause (f));
//   • §A.3.2 RULING C2 — the **SEPARATE document-liveness carrier** `isDocumentLive` owns the caret's
//     document check (`EditControllerOptions.isDocumentLive`); `backRefs` keeps its documented
//     `Map<ragNodeId, nodeId[]>` invariant, so NO document id is ever a `backRefs` key;
//   • §A.1.1 `I2-R` — TOTAL at EVERY seam, and its seam list names **boot**; both discriminators
//     (the authored `PAGE_EDIT_SURFACE_ID` id AND the `DATA_EDIT_SURFACE` marker) are counted and
//     must AGREE; no seam exempt, no pre-unit behavior grandfathered;
//   • §5.2 — `_currentDocumentId` is NARROWED: never a stage-mount scope source (FS-7);
//   • §5.3.2 + §A.1.4 — the caret-hook ORDER is pinned and observable: a caret-less read returns
//     `undefined` WITHOUT consulting `pageSubjectDocument`; the hook's consultation set is exactly
//     the subjects read WITH a saved caret entry, ONCE per call, in read order; `doc === null` ⇒
//     clear + `undefined`; `!backRefs.has(doc)` ⇒ clear + `undefined`; legacy `backRefs.has(subjectId)`
//     ONLY when the hook is absent;
//   • §5.3.2 "Host side" — `SidebarPanes` supplies the hook as the LATE-BOUND host resolver
//     (`subject === activeTabId ? activeDocumentId : null`) — a late-bind the host cannot pass at
//     construction (it is handed an already-built controller);
//   • §5.5 `FS-6` (a caret dead or restored against the WRONG document), `FS-7` (a stale
//     `_currentDocumentId` used as the scope);
//   • §6 `P-IM-4` (the hook is total + stale-proof; a build that keeps `backRefs.has(subjectId)` as
//     the guard FAILS the row), `P-TP-2` (caret-lifecycle totality across a re-derive).
//
// SIBLINGS (authored CONCURRENTLY by other TestWriters — NOT edited by this file, only
// cross-referenced): `tests/unit-stage-active-tab-display-pbt-generators.test.ts` (the §6
// generator/attempt-budget half) and `tests/unit-stage-active-tab-display-contract-holes.test.ts`
// (the remaining contract holes). This file owns ONLY the two blind-contradiction rows, so the
// three files may be merged without duplication.
//
// LAYER (RCA-12 declaration): HOST/RENDERER + controller — node/dom-shim only. The **painted**
// stage identity (`P-TP-1`) and the app-level reachability of the boot state (artifact §E NT-9)
// are structurally unassertable here and are NOT claimed: ROW 1 pins the HOST-level state and the
// authored census in the mount subtree, nothing else.
//
// HARNESS PROVENANCE (discipline — the setup, never an expectation): the `SidebarPanes` /
// `Runtime` / bridge WIRING is not prose-pinned by the spec, so the constructor and bridge shapes
// were taken from the setup region of the unit's own suite
// (`tests/unit-stage-active-tab-display.test.ts` lines ~160–330) — the same disclosure the
// evidence artifact makes for its harness (§H `DL-1`/header). No assertion, expectation or
// threshold was copied from any test file: every expectation below is the spec clause quoted in
// its message, and every measured value it contradicts comes from the artifact's §A/§C/§D rows.
// `src/**` was read ONLY for symbol names / signatures (`boot`, `mountTab`, `reDerive`,
// `getActiveTabId`/`getActiveTargetKind`/`getActiveDocumentId`, `createEditController`,
// `saveCaret`/`restoreCaret`/`setPageSubjectDocument`, `PAGE_EDIT_SURFACE_ID`,
// `DATA_EDIT_SURFACE`, `CaretState`, `EditControllerOptions`).
//
// ---------------------------------------------------------------------------
// MEASURED STATUS (re-pinned by ⟨§A.3.1 RULING C1⟩ — the run's honest reading, never a forced red):
//   PRE-LANDING BASELINE (01:44, before `src/**` carried the ruling): ROW 1's S1/S2 were RED on the OLD
//     expectation (census 0) — the artifact's A11/A11b values (`1/1 marker=["doc-a"]`) are what the tree
//     measured. THAT IS NOT A VIOLATION under §A.3.1: the pre-tab state is a contract state of its own
//     whose census IS `1 / [getPreTabDocumentId()]`. S1/S2 are re-pinned to the carve-out, plus S1's
//     TAB-STATE half (`mountTab(search)`) and S2's FIRST-MOUNT half (`mountTab(doc-b)`).
//   POST-LANDING (01:49, `src/renderer/sidebar-panes.ts` carries `isPreTabState`/`getPreTabDocumentId`/
//     `isDocumentLive`): ROW 1's S1/S2 are GREEN and ROW 2 is GREEN (13/13) — including S5, whose
//     liveness now flows through the ⟨§A.3.2 C2⟩ carrier. A red set for the re-pin was NOT obtainable
//     pre-landing without touching `src/**` (the wall), so none is claimed: recorded, never fabricated.
//   ROW 2's other eight rows PASS in both readings. The landed `src/renderer/edit-controller.ts` DOES
//     consult `pageSubjectDocument` (exactly once per read WITH a saved caret, in read order), DOES clear
//     on `null`/non-string/foreign answers, and the `EditControllerOptions` field and the host's late-bind
//     `setPageSubjectDocument` AGREE. The artifact's §D F2 measurement (`calls=[]`; a `null` and a
//     `'ghost-doc'` answer each RESTORING the caret) does NOT reproduce on this tree. ROW 2 is therefore
//     kept as the REGRESSION PIN for the remand's (a)–(d) items — forcing it red would encode a behavior
//     §A.1.4/§5.3.2 FORBID. Recorded as a stale-evidence finding for the supervisor: the artifact's §D F2
//     and its §G `P-IM-4`/`P-TP-2` "FAIL" rows owe a re-measure (item-10d territory).
//
// THE TWO ROWS (each derived from one artifact FAIL):
//   ROW 1 — THE BOOT-SEAM CENSUS (§A.3.1 C1's CARVE-OUT + the tab-state arm / §5.1 I2 c3 / §5.2 / `FS-7`)
//           artifact A11 + A11b.  `describe('ROW 1 — …')`
//   ROW 2 — THE `pageSubjectDocument` HOOK (§A.1.4 / §5.3.2 / `FS-6` / `P-IM-4` + `P-TP-2`),
//           whose artifact-C7 premise ("the hook is NEVER consulted", `calls=[]`) is STALE at HEAD:
//           the rows below assert the PINNED semantics, and all nine states PASS here.
//           `describe('ROW 2 — …')`
//
// STATE MACHINE — the states enumerated BEFORE the rows were written (valid/happy first, then the
// documented fail-states). Each state is one `it` row; the row titles carry the state.
//   ROW 1 (the census predicate over the boot seam and its two arms):
//     S1  boot, NO mountTab, NO persisted default document → the PRE-TAB CARVE-OUT: 1 / [getPreTabDocumentId()]
//         + the TAB-STATE half: after `mountTab(searchTab('s1'))` ⇒ `isPreTabState() === false`, 0 / no bodies
//                                                                                  [RED: readers absent — §A.3.1]
//     S2  boot, NO mountTab, persisted `defaultDocumentId='doc-b'` → the carve-out is the ALPHABETICAL-FIRST
//         `doc-a` (artifact A11b) + after `mountTab(docTab('t1', DOC_B))` ⇒ 1 / [DOC_B], no stale root
//                                                                                  [RED: readers absent — §A.3.1]
//     S3  boot + `mountTab(document tab)`                           → 1 / [activeDocumentId]  (non-vacuity arm)
//     S4  boot + `mountTab(search tab)`                             → 0 (the `iff`'s else arm) (non-vacuity arm)
//   ROW 2 (the §A.1.4 consultation set + §5.3.2's four caret branches × both construction paths):
//     S5  saved caret, hook answers a LIVE document                 → caret returned, consulted ONCE per call [GREEN at HEAD]
//     S6  NO saved caret, hook supplied                             → `undefined`, NOT consulted       [PIN]
//     S7  saved caret, hook answers `null`                          → cleared, `undefined`             [GREEN at HEAD]
//     S8  saved caret, hook answers a non-string (`undefined`)      → cleared, `undefined` (`?? null`) [GREEN at HEAD]
//     S9  saved caret, hook answers a FOREIGN document (`'ghost-doc'`) → cleared, `undefined`          [GREEN at HEAD]
//     S10 the same state through BOTH construction paths (the `EditControllerOptions` field and the
//         host's late-bind `setPageSubjectDocument`)                 → identical observables         [GREEN at HEAD]
//     S11 host-owned controller (field ABSENT, host late-binds), document tab mounted, caret saved,
//         content re-derive                                        → caret restored iff the document is live [GREEN at HEAD]
//     S12 §A.1.4's own re-pin: a caret saved under EACH hostile subject, read back → every read
//         `undefined`; `hookCalls` EQUALS the hostile list in read order; `'t1'` absent   [GREEN at HEAD]
//     S13 `P-IM-4`: the HOST's late-bound resolver, observed through the seam it is supplied by →
//         `activeDocumentId` iff `subject === activeTabId` and the target is a document, else `null`
//         (stale/junk/`''`/`__proto__`/a document id), never a throw                     [GREEN at HEAD]
//   (S5–S13 are the artifact C7 rows; under ⟨§A.3.2 C2⟩ S5's liveness source moves to the carrier —
//    GREEN in the post-landing reading, see MEASURED STATUS above.)
//
// FAIL-STATES COVERED (spec §5.5): `FS-7` — its TAB-STATE arm only (S1's tab-state half / S2's
//   first-mount half: from the tab state onward NO surface may be authored for a non-document tab, and
//   no stale pre-tab root may be grandfathered — ⟨§A.3.1 C1⟩ clauses (d)/(f); the PRE-tab state itself
//   is the CARVE-OUT and is NOT an `FS-7` violation); and `FS-6` (ROW 2's S5/S7/S8/S9/S11 — the caret
//   dead or restored against the wrong document, now through the ⟨§A.3.2 C2⟩ carrier `isDocumentLive`).
//   `FS-6`'s non-throw totality (§5.5 "restoreCaret never throws") is asserted in every
//   ROW 2 row by construction (each `restoreCaret` call is the assertion target, never a `catch`).
// REGISTER ROWS COVERED (§6): `P-IM-4` (ROW 2 S6/S7/S8/S9/S10/S12/S13 — the hook's consultation set
//   and, at the host seam, its totality + stale-proofness), `P-TP-2` (ROW 2 S5/S7/S8/S9/S11 — caret
//   lifecycle across a re-derive). Both are GREEN AT HEAD: see MEASURED STATUS.
//
// ROW 2's `[RED]` labels in the `it` titles are corrected to the measured status below (a mislabelled
//   row is itself a finding): S7/S8/S9/S10/S11/S12/S13 are `[GREEN]`, and S5 is
//   `[⟨§A.3.2 C2⟩ carrier consulted — GREEN in the post-landing reading]`.
//
// GREEN-ON-PURPOSE ROWS (labelled `[PIN]`, never rewritten to red): S3/S4 are ROW 1's non-vacuity
//   arms — the spec's own `iff` requires the document arm to author EXACTLY one surface carrying the
//   active document (a build that authors NO surface must not pass the row), and S4 is the same
//   predicate's else arm. S6 is the §A.1.4 caret-less direction (a PIN): it holds at HEAD because the
//   landed controller reads the caret BEFORE the hook, and it is the discriminator that forbids
//   "consult the hook before the caret check" — it must never be relaxed to make a caret-less row pass.
// NOT PINNED HERE (recorded, never invented): (a) a resolver answer that is a TRUTHY non-string
//   (e.g. `42`) is outside the declared `string | null` member type and the spec's `?? null` says
//   nothing about it — only the `null`/`undefined` branch is pinned; (b) a CONFLICTING field-vs-late-bind
//   precedence (both supplied, different answers) is not specified by §5.3.2/§A.1.4, so S10 pins only
//   that the two paths AGREE on the S7 state (a disagreement is itself the row's finding).
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import {
  createEditController,
  type CaretState,
  type EditController,
} from '../src/renderer/edit-controller.js'
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

// ---------------------------------------------------------------------------
// fixtures — two documents (so "foreign document" is expressible) + the tab entries
// ---------------------------------------------------------------------------
const DOC_A = 'doc-a'
const DOC_B = 'doc-b'
const T = new Date().toISOString()

function makeNode(id: string, type: string, content: string): RagNode {
  return { id, type, content, ownedNodeIds: [], createdAt: T, updatedAt: T }
}
function makeEdge(id: string, source: string, target: string): RagEdge {
  return { id, kind: 'doc-head', source, target, createdAt: T, updatedAt: T, documentIds: [target] }
}
function docTarget(documentId: string): TabTarget {
  return { kind: 'document', documentId }
}
function docTab(id: string, documentId: string): TabEntry {
  return { id, target: docTarget(documentId), title: `Doc ${documentId}` }
}
function searchTab(id: string, query: string): TabEntry {
  return { id, target: { kind: 'search', queryId: `q-${id}` }, title: `Search: ${query}`, search: { query, topK: 5 } }
}

/** The page-scoped caret (§5.3.2's `FS2` check: `kind === 'rich'` AND
 *  `ragId === PAGE_EDIT_SURFACE_ID` — a caret addressing any other root is dropped). */
const CARET: CaretState = {
  kind: 'rich',
  ragId: PAGE_EDIT_SURFACE_ID,
  anchor: { path: [0], offset: 0 },
  focus: { path: [0], offset: 0 },
  focused: false,
}

// ---------------------------------------------------------------------------
// the harness (setup wiring only — see HARNESS PROVENANCE in the header)
// ---------------------------------------------------------------------------
function queryResult(query: string) {
  return { query, ranked: [], results: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  mount: ReturnType<typeof mountEl>
  editController: EditController
  backRefs: Map<string, string[]>
}

/** `defaultDocumentId` is the PERSISTED operator setting (§5.1's "persisted default context" —
 *  `_currentDocumentId`'s RETAINED role, §5.2). ROW 1's S2 boots with it set. */
function makeHarness(
  opts: { defaultDocumentId?: string | null; captureResolver?: (resolve: (subject: string) => string | null) => void } = {},
): Harness {
  const mount = mountEl()
  const operatorMount = mountEl()
  const registry = createPaneRegistry()
  const store = createSnapshotStore(
    [
      makeNode(`${DOC_A}-head`, 'h1', 'Doc A'),
      makeNode(`${DOC_A}-body`, 'p', 'body A'),
      makeNode(`${DOC_B}-head`, 'h1', 'Doc B'),
      makeNode(`${DOC_B}-body`, 'p', 'body B'),
    ],
    [
      makeEdge('ea-h', `${DOC_A}-head`, DOC_A),
      makeEdge('ea-n', `${DOC_A}-head`, `${DOC_A}-body`),
      makeEdge('ea-e', `${DOC_A}-body`, DOC_A),
      makeEdge('eb-h', `${DOC_B}-head`, DOC_B),
      makeEdge('eb-n', `${DOC_B}-head`, `${DOC_B}-body`),
      makeEdge('eb-e', `${DOC_B}-body`, DOC_B),
    ],
  )
  const bridge = {
    security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: {
      onRagStoreChanged: () => () => {},
      commitRich: async () => ({ ok: true, nodeId: 'x' }),
      batch: async () => ({ ok: true, results: [] }),
    },
    rag: {
      query: vi.fn(async (q: string) => queryResult(q)),
      snapshot: async () => ({ store: 'main', nodes: store.listNodes(), edges: store.listEdges() }),
      backlinks: async () => ({ nodeId: '', backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }),
      docHeads: async () => ({
        documents: [
          { documentId: DOC_A, title: 'Doc A', path: [], tags: [] },
          { documentId: DOC_B, title: 'Doc B', path: [], tags: [] },
        ],
      }),
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
      get: async () =>
        ({
          enabledPanes: [],
          panesInitialized: true,
          defaultDocumentId: opts.defaultDocumentId ?? null,
          topK: 5,
          representationMode: 'html',
        }) as unknown as OperatorSettings,
      set: async (patch: Record<string, unknown>) => patch as unknown as OperatorSettings,
      onChanged: () => () => {},
    },
  }
  const backRefs = new Map<string, string[]>()
  let host: SidebarPanes
  // ROW 2's host row (S11) needs a controller built WITHOUT the hook: the HOST is the one that
  // late-binds it (§5.3.2 "Host side"; the shipped renderer hands the host an already-built
  // controller, so the hook cannot be passed at construction).
  const editController = createEditController({
    backRefs,
    commit: async () => ({ ok: true, nodeId: 'x' }),
    onRebuild: (kind) => void host.reDerive(kind),
  })
  if (opts.captureResolver) {
    // §5.3.2 "Host side" — the host supplies the resolver through the late-bind seam, so wrapping
    // that seam is the ONLY way to observe `pageSubjectDocument` itself (P-IM-4's subject).
    const lateBind = editController.setPageSubjectDocument
    if (typeof lateBind !== 'function') {
      throw new Error('§5.3.2 / P-IM-4: the host cannot pass the hook at construction — `setPageSubjectDocument` must exist')
    }
    editController.setPageSubjectDocument = (resolve: (subject: string) => string | null): void => {
      opts.captureResolver?.(resolve)
      lateBind(resolve)
    }
  }
  host = new SidebarPanes({ mount, operatorMount, registry, bridge: bridge as never, backRefs, editController })
  const runtime = new Runtime({
    mount: mount as never,
    envelope: {
      template: DEFAULT_CONTENT_WINDOW_TEMPLATE,
      content: [],
      clientConfig: { runInstantiation: true, runRendering: true },
    } as never,
  })
  ;(globalThis as unknown as { window?: unknown }).window = { provident: bridge }
  return { host, runtime, mount, editController, backRefs }
}

async function boot(h: Harness): Promise<Harness> {
  await h.host.boot(h.runtime)
  return h
}

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// ---------------------------------------------------------------------------
// DOM readers — §A.1.1's BOTH-DISCRIMINATOR census
// ---------------------------------------------------------------------------
type ShimLike = {
  innerHTML: string
  querySelectorAll(sel: string): Array<{ getAttribute(k: string): string | null }>
}
function stageEl(h: Harness): ShimLike {
  return h.mount as unknown as ShimLike
}

/** ⟨§A.1.1 `I2-R`⟩ the census by BOTH discriminators: the AUTHORED id
 *  `PAGE_EDIT_SURFACE_ID` and the `DATA_EDIT_SURFACE` marker. `agrees` is true iff the two
 *  readings have the SAME count AND the same marker value on every root, in DOM order — a live
 *  root carrying one without the other is the SAME violation (a leak), never a rounding error. */
function census(h: Harness): { authored: number; marked: number; markers: Array<string | null>; agrees: boolean } {
  const authoredRoots = stageEl(h).querySelectorAll(`[id='${PAGE_EDIT_SURFACE_ID}']`)
  const markedRoots = stageEl(h).querySelectorAll(`[${DATA_EDIT_SURFACE}]`)
  const markers = markedRoots.map((el) => el.getAttribute(DATA_EDIT_SURFACE))
  const authoredMarkers = authoredRoots.map((el) => el.getAttribute(DATA_EDIT_SURFACE))
  return {
    authored: authoredRoots.length,
    marked: markedRoots.length,
    markers,
    agrees:
      authoredRoots.length === markedRoots.length &&
      authoredMarkers.length === markers.length &&
      authoredMarkers.every((v, i) => v != null && v === markers[i]),
  }
}

/** The census line every ROW 1 failure prints, so the observed value can never be read as a bare
 *  count (the artifact's A11/A11b shape: `census=1/1 marker=["doc-a"]`). */
function censusLine(h: Harness): string {
  const c = census(h)
  return `[${PAGE_EDIT_SURFACE_ID}]=${c.authored} [${DATA_EDIT_SURFACE}]=${c.marked} marker=[${c.markers.map((m) => JSON.stringify(m)).join(',')}] agrees=${c.agrees}`
}

/** ⟨§A.3.1 RULING C1⟩ the pinned PRE-TAB observers, read through DECLARED members (a build that
 *  sources the facts under other names is a further amendment — the member names are the contract,
 *  §A.3.4 item 3), so a missing reader reports "does not exist" rather than a private-field peek. */
function reader<T>(host: SidebarPanes, name: string): () => T {
  const fn = (host as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') {
    throw new TypeError(`SidebarPanes.${name}() does not exist (⟨§A.3.1 C1⟩ U-STAGE-ACTIVE-TAB — RED)`)
  }
  return () => (fn as () => T).call(host)
}
function preTabState(host: SidebarPanes): boolean {
  return reader<boolean>(host, 'isPreTabState')()
}
function preTabDocumentId(host: SidebarPanes): string | null {
  return reader<string | null>(host, 'getPreTabDocumentId')()
}

/** ⟨§A.1.3⟩ the BODY census keyed BY DOCUMENT (never by the first `-`-delimited token, which
 *  collapses `doc-a`/`doc-b` into one key and passes vacuously — the sibling suites' convention). */
function bodyDocIds(h: Harness): string[] {
  const roots = stageEl(h).querySelectorAll('[data-rag-node-id]').map((el) => String(el.getAttribute('data-rag-node-id')))
  const out: string[] = []
  for (const r of roots) {
    const key = [DOC_A, DOC_B].find((d) => r === d || r.startsWith(`${d}-`)) ?? `?${r}`
    if (!out.includes(key)) out.push(key)
  }
  return out
}

/** The HOST-level active-tab state (§5.2's pinned readers). */
function hostState(h: Harness): string {
  return `activeTabId=${JSON.stringify(h.host.getActiveTabId())} activeTargetKind=${JSON.stringify(h.host.getActiveTargetKind())} activeDocumentId=${JSON.stringify(h.host.getActiveDocumentId())}`
}

// ===========================================================================
// ROW 1 — the boot-seam census (§A.3.1 C1 the CARVE-OUT / §5.1 I2 c3's
// tab-state arm / §5.2 / FS-7's tab-state half)
// ===========================================================================
describe('ROW 1 — the boot-seam census: the PRE-TAB CARVE-OUT and the strict tab-state arm (§A.3.1)', () => {
  it('S1 [⟨§A.3.1 C1⟩ re-pinned — GREEN in the post-landing reading] — the pre-tab boot IS the carve-out: `isPreTabState()` with the census 1 / [getPreTabDocumentId()], and the tab-state arm is 0 from the first `mountTab`', async () => {
    const h = await boot(makeHarness())
    // The precondition the artifact recorded: boot runs with NO `mountTab` at all ⇒ §A.3.1's PRE-TAB state.
    const c = census(h)
    expect(
      c.agrees,
      `§A.3.1 clause (a): both discriminators must AGREE at the boot seam — observed ${censusLine(h)}`,
    ).toBe(true)
    expect(
      preTabState(h.host),
      `§A.3.1: no tab state has been handed (\`mountTab\`/\`mountTabs\` never called) ⇒ the state IS the pre-tab state — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(true)
    expect(
      preTabDocumentId(h.host),
      `§A.3.1 clause (a)/(g): the pre-tab stage displays the boot seam's retained default-context document — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(DOC_A)
    expect(
      c.authored,
      `§A.3.1 clause (a): the pre-tab arm IS a surface-owning state ⇒ EXACTLY 1 live surface (NOT 0 — the artifact's A11 census is the CARVE-OUT, not a violation) — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(1)
    expect(
      c.marked,
      `§A.3.1 clause (a): the marker count must equal the authored count at the same seam — observed ${censusLine(h)}`,
    ).toBe(1)
    expect(
      c.markers,
      `§A.3.1 clause (a): that root's \`${DATA_EDIT_SURFACE}\` EQUALS \`getPreTabDocumentId()\` — observed ${censusLine(h)}`,
    ).toEqual([preTabDocumentId(h.host)])
    // The host-level state the census predicate is quantified over (NT-9: the APP-level
    // reachability of this window is live-only and is NOT claimed here).
    expect(h.host.getActiveTabId(), `§5.2: boot with no tab ⇒ activeTabId === null — ${hostState(h)}`).toBeNull()
    expect(h.host.getActiveTargetKind(), `§5.2: boot with no tab ⇒ activeTargetKind === null — ${hostState(h)}`).toBeNull()
    expect(h.host.getActiveDocumentId(), `§5.2: boot with no tab ⇒ activeDocumentId === null — ${hostState(h)}`).toBeNull()

    // ---- THE TAB-STATE HALF (§A.3.1 clause (d): monotonic; the pre-tab arm is unavailable forever).
    h.host.mountTab(searchTab('s1', 'alpha'))
    const after = census(h)
    expect(
      preTabState(h.host),
      `§A.3.1 clause (d): ANY \`mountTab\` is tab state ⇒ \`isPreTabState()\` is false forever — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(false)
    expect(
      after.authored,
      `§A.3.1 clause (d): the strict arm — a NON-document tab authors 0 surfaces, and a stale pre-tab root must be DESTROYED — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(0)
    expect(
      bodyDocIds(h),
      `§A.3.1 clause (b): after a seam other than \`mountTabs\` the stage holds no document body root — observed bodies=[${bodyDocIds(h).join(',')}] / ${censusLine(h)}`,
    ).toEqual([])
  })

  it("S2 [⟨§A.3.1 C1⟩ re-pinned — GREEN in the post-landing reading] — a persisted `defaultDocumentId='doc-b'` does NOT move the pre-tab surface (artifact A11b), and the first `mountTab` re-owns it (§A.3.1 (d)/(f))", async () => {
    const h = await boot(makeHarness({ defaultDocumentId: DOC_B }))
    const c = census(h)
    expect(
      c.agrees,
      `§A.3.1 clause (a): both discriminators must AGREE at the boot seam — observed ${censusLine(h)}`,
    ).toBe(true)
    expect(
      preTabState(h.host),
      `§A.3.1: the state with the persisted default and no tab state is still the PRE-TAB state — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(true)
    expect(
      preTabDocumentId(h.host),
      `§A.3.1 clause (a) + the artifact A11b measurement: the pre-tab SURFACE carries the ALPHABETICAL-FIRST doc-head ('doc-a'), NOT the persisted default ('doc-b') — the persisted default is a retained BODY-context (\`stageDocumentScope()\`), never a surface scope, and no clause makes it move the pre-tab surface — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(DOC_A)
    expect(
      c.authored,
      `§A.3.1 clause (a): the pre-tab state authors EXACTLY 1 surface regardless of the persisted default — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(1)
    expect(
      c.markers,
      `§A.3.1 clause (a): and that root's marker EQUALS \`getPreTabDocumentId()\` — observed ${censusLine(h)}`,
    ).toEqual([preTabDocumentId(h.host)])
    expect(
      h.host.getActiveDocumentId(),
      `§5.2: the persisted default is NOT the active document id — observed ${hostState(h)}`,
    ).toBeNull()

    // ---- THE FIRST-MOUNT HALF (§A.3.1 clause (f): a `mountTab(entry)` synchronously re-owns the
    // stage; the pre-tab surface is never grandfathered and a stale one is destroyed).
    h.host.mountTab(docTab('t1', DOC_B))
    const mounted = census(h)
    expect(
      preTabState(h.host),
      `§A.3.1 clause (f): the first \`mountTab\` ends the pre-tab state — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(false)
    expect(
      mounted.authored,
      `§A.3.1 clause (d)/(f): the mounted document tab authors EXACTLY 1 surface — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(1)
    expect(
      mounted.markers,
      `§A.3.1 clause (a)/(f): the surface now carries the ACTIVE TAB's document (${DOC_B}), not the pre-tab one — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toEqual([DOC_B])
    expect(
      mounted.markers,
      `§A.3.1 clause (f): NO stale pre-tab root survives the first mount (the pre-tab surface is destroyed, never grandfathered) — observed ${censusLine(h)}`,
    ).not.toContain(DOC_A)
  })

  it('S3 [PIN — non-vacuity arm] — once a document tab IS mounted the predicate is 1 / [activeDocumentId], both discriminators agreeing', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    const c = census(h)
    expect(
      c.agrees,
      `§A.1.1: both discriminators must AGREE on a document tab — observed ${censusLine(h)}`,
    ).toBe(true)
    expect(
      c.authored,
      `§A.1.1 I2-R (the \`iff\`'s positive arm): a document tab IS active ⇒ EXACTLY 1 live surface (a build authoring none must not pass) — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(1)
    expect(
      c.markers,
      `§5.1 I2 / §A.1.1: the surface's \`${DATA_EDIT_SURFACE}\` EQUALS the active document id — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toEqual([h.host.getActiveDocumentId()])
    expect(h.host.getActiveTargetKind(), `§5.2: the mounted document tab's kind — observed ${hostState(h)}`).toBe('document')
    expect(h.host.getActiveDocumentId(), `§5.2: the active document id — observed ${hostState(h)}`).toBe(DOC_A)
  })

  it("S4 [PIN — non-vacuity arm] — the predicate's ELSE arm: a non-document tab authors zero surfaces", async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(searchTab('s1', 'alpha'))
    await flush()
    const c = census(h)
    expect(
      c.agrees,
      `§A.1.1: both discriminators must AGREE on a search tab — observed ${censusLine(h)}`,
    ).toBe(true)
    expect(
      c.authored,
      `§A.1.1 I2-R (the \`iff\`'s else arm): no document tab is active ⇒ 0 surfaces — observed ${censusLine(h)} / ${hostState(h)}`,
    ).toBe(0)
    expect(
      c.markers,
      `§A.1.1: no \`${DATA_EDIT_SURFACE}\` marker anywhere on a search tab — observed ${censusLine(h)}`,
    ).toEqual([])
    expect(h.host.getActiveTargetKind(), `§5.2: the active kind is 'search' — observed ${hostState(h)}`).toBe('search')
    expect(h.host.getActiveDocumentId(), `§5.2: a search tab has NO document id — observed ${hostState(h)}`).toBeNull()
  })
})

// ===========================================================================
// ROW 2 — the `pageSubjectDocument` hook is NEVER consulted (§A.1.4 / §5.3.2 /
// FS-6 / P-IM-4 + P-TP-2)
// ===========================================================================
type HookAnswer = string | null | undefined

/** A recording resolver: every consultation is appended to `calls` IN READ ORDER, and the answer
 *  is taken from `answers` (absent ⇒ `null`, i.e. §5.3.2's "no live surface document" branch).
 *  The declared member type is `string | null`, so `answers` may hold `undefined` only to drive the
 *  `?? null` branch (recorded in the header as a non-string answer the spec pins via `?? null`). */
function recordingHook(calls: string[], answers: Map<string, HookAnswer>): (subject: string) => string | null {
  return (subject: string) => {
    calls.push(subject)
    return (answers.has(subject) ? answers.get(subject) : null) as string | null
  }
}

/** `backRefs` carrying the tab id and its document's RAG NODE ids — and, per ⟨§A.3.2 RULING C2⟩,
 *  **NO document id**: the `seedActiveDocumentRef` seed is DELETED, so a document id never keys
 *  `backRefs` (the map's documented `Map<ragNodeId, nodeId[]>` invariant, `…contract-holes.test.ts`
 *  H-5). The liveness branch is owned by the SEPARATE carrier (`liveDocuments(DOC_A)` below), which
 *  the rows below hand to `makeController`, so the consultation pin stays isolated from it and the
 *  row cannot pass merely because the caret was cleared for an unrelated reason. */
function liveBackRefs(): Map<string, string[]> {
  return new Map<string, string[]>([
    ['t1', []],
    [`${DOC_A}-body`, []],
  ])
}

/** ⟨§A.3.2 RULING C2⟩ the SEPARATE document-liveness carrier: the documents the harness's snapshot
 *  knows. It is the observable the caret's document check consults (`EditControllerOptions
 *  .isDocumentLive`), so a dead/foreign answer (`'ghost-doc'`) is NOT live without any document id
 *  ever becoming a `backRefs` key. */
function liveDocuments(...documentIds: string[]): (documentId: string) => boolean {
  const live = new Set(documentIds)
  return (documentId: string) => live.has(documentId)
}

function makeController(opts: {
  backRefs?: Map<string, string[]>
  hook?: (subject: string) => string | null
  lateBind?: (subject: string) => string | null
  /** ⟨§A.3.2 C2⟩ the liveness carrier (§5.3.2 step 4's `isDocumentLive`); absent ⇒ the harness's
   *  own snapshot set, so the rows never fall back to the deleted document-id `backRefs` seed. */
  live?: (documentId: string) => boolean
}): EditController {
  const controller = createEditController({
    backRefs: opts.backRefs ?? liveBackRefs(),
    commit: async () => ({ ok: true, nodeId: 'x' }),
    onRebuild: vi.fn(),
    isDocumentLive: opts.live ?? liveDocuments(DOC_A),
    ...(opts.hook ? { pageSubjectDocument: opts.hook } : {}),
  })
  if (opts.lateBind) {
    // The host's seam (§5.3.2 "Host side"; `EditController.setPageSubjectDocument?`). A build
    // without it makes this row a "method does not exist" red, which is the pinned contract.
    if (typeof controller.setPageSubjectDocument !== 'function') {
      throw new Error(
        '§5.3.2 / §A.1.4: the host cannot pass `pageSubjectDocument` at construction, so the controller MUST expose the additive late-bind seam `setPageSubjectDocument`',
      )
    }
    controller.setPageSubjectDocument(opts.lateBind)
  }
  return controller
}

describe('ROW 2 — the `pageSubjectDocument` hook per §A.1.4/§5.3.2 (artifact C7 does NOT reproduce at HEAD: 8/9 GREEN; `S5` is RED until the ⟨§A.3.2 C2⟩ carrier lands)', () => {
  it('S5 [GREEN in the post-landing reading: the ⟨§A.3.2 C2⟩ carrier `isDocumentLive` IS consulted] — the saved-caret read consults `options.pageSubjectDocument` EXACTLY ONCE with the read subject, and the answer is live through the SEPARATE carrier (artifact C7: calls=[])', () => {
    const calls: string[] = []
    const answers = new Map<string, HookAnswer>([['t1', DOC_A]])
    const controller = makeController({ hook: recordingHook(calls, answers) })
    controller.saveCaret('t1', CARET)

    const restored = controller.restoreCaret('t1')
    expect(
      calls,
      `§A.1.4 step 2: a read WITH a saved caret entry consults the hook ONCE, with the READ subject, in read order — observed calls=[${calls.join(',')}]`,
    ).toEqual(['t1'])
    expect(
      restored,
      `§5.3.2 step 4 (⟨§A.3.2 C2⟩) / P-TP-2: the hook answers '${DOC_A}', which IS live in the SEPARATE carrier (\`isDocumentLive\`, never a \`backRefs\` key), so the saved page caret is RESTORED — observed ${JSON.stringify(restored)} (calls=[${calls.join(',')}])`,
    ).toEqual(CARET)
    // §A.1.4's "ONCE PER CALL": a live-document read does NOT clear the entry, so a second read
    // consults the hook again, in read order — the consultation set is per READ, not per subject.
    const restoredAgain = controller.restoreCaret('t1')
    expect(
      restoredAgain,
      `§5.3.2 branch 4: a live document keeps the saved caret restorable across reads — observed ${JSON.stringify(restoredAgain)}`,
    ).toEqual(CARET)
    expect(
      calls,
      `§A.1.4 ("once per call, in read order"): two reads of a subject whose caret SURVIVES ⇒ two consultations — observed calls=[${calls.join(',')}]`,
    ).toEqual(['t1', 't1'])
  })

  it('S6 [PIN] — the caret-less read does NOT consult the hook (the §A.1.4 order: the caret check comes FIRST)', () => {
    const calls: string[] = []
    const answers = new Map<string, HookAnswer>([['t1', DOC_A]])
    const controller = makeController({ hook: recordingHook(calls, answers) })

    const restored = controller.restoreCaret('t-no-saved-caret')
    expect(
      restored,
      `§A.1.4 step 1: a subject with no saved caret returns undefined — observed ${JSON.stringify(restored)}`,
    ).toBeUndefined()
    expect(
      calls,
      `§A.1.4 step 1: the hook MUST NOT be consulted for a caret-less read (consulting it is the deviation the pin forbids) — observed calls=[${calls.join(',')}]`,
    ).toEqual([])
  })

  it('S7 [GREEN at HEAD — artifact C7 stale] — a `null` answer CLEARS the caret and returns `undefined` (artifact C7: the caret was RESTORED)', () => {
    const calls: string[] = []
    const answers = new Map<string, HookAnswer>([['t1', null]])
    const controller = makeController({ hook: recordingHook(calls, answers) })
    controller.saveCaret('t1', CARET)

    const first = controller.restoreCaret('t1')
    const second = controller.restoreCaret('t1')
    expect(
      first,
      `§5.3.2 branch 2 / FS-6: doc === null ⇒ the subject has no live surface document ⇒ the saved caret is CLEARED and undefined returned — observed ${JSON.stringify(first)} (calls=[${calls.join(',')}])`,
    ).toBeUndefined()
    expect(
      second,
      `§5.3.2 branch 2 / §A.1.4: the stale entry is CLEARED, not merely hidden — a later read is still undefined — observed ${JSON.stringify(second)}`,
    ).toBeUndefined()
    expect(
      calls,
      `§A.1.4 steps 1+2: the \`null\` answer CLEARS the entry, so the SECOND read is caret-less and must NOT consult the hook again — exactly ONE consultation for two reads — observed calls=[${calls.join(',')}]`,
    ).toEqual(['t1'])
  })

  it('S8 [GREEN at HEAD — artifact C7 stale] — a non-string (`undefined`) answer takes the `?? null` branch and CLEARS the caret', () => {
    const calls: string[] = []
    const answers = new Map<string, HookAnswer>([['t1', undefined]])
    const controller = makeController({ hook: recordingHook(calls, answers) })
    controller.saveCaret('t1', CARET)

    const first = controller.restoreCaret('t1')
    const second = controller.restoreCaret('t1')
    expect(
      first,
      `§5.3.2: \`doc = pageSubjectDocument?.(subjectId) ?? null\` — a non-string (undefined) answer is NOT a live document id, so the caret is CLEARED and undefined returned — observed ${JSON.stringify(first)} (calls=[${calls.join(',')}])`,
    ).toBeUndefined()
    expect(
      second,
      `§5.3.2 / §A.1.4: the entry is cleared, so a later read is still undefined — observed ${JSON.stringify(second)}`,
    ).toBeUndefined()
    expect(
      calls,
      `§A.1.4 steps 1+2: one consultation (the read that HAD a saved caret); the second read is caret-less by the clear, so it must not consult — observed calls=[${calls.join(',')}]`,
    ).toEqual(['t1'])
  })

  it("S9 [GREEN at HEAD — artifact C7 stale] — a FOREIGN-document answer ('ghost-doc', not live in the carrier) CLEARS the caret (artifact C7: restored)", () => {
    const calls: string[] = []
    const answers = new Map<string, HookAnswer>([['t1', 'ghost-doc']])
    const controller = makeController({ hook: recordingHook(calls, answers) })
    controller.saveCaret('t1', CARET)

    const first = controller.restoreCaret('t1')
    const second = controller.restoreCaret('t1')
    expect(
      first,
      `§5.3.2 branch 3 (⟨§A.3.2 C2⟩) / FS-6 / P-IM-4: doc !== null but !isDocumentLive(doc) ⇒ the document is GONE ⇒ the saved caret is CLEARED and undefined returned — observed ${JSON.stringify(first)} (isDocumentLive('ghost-doc')=false, backRefs keys=[${[...liveBackRefs().keys()].join(',')}] — no document id keys them, calls=[${calls.join(',')}])`,
    ).toBeUndefined()
    expect(
      second,
      `§5.3.2 branch 3: the entry is cleared, never restored against a foreign document — observed ${JSON.stringify(second)}`,
    ).toBeUndefined()
    expect(
      calls,
      `§A.1.4 steps 1+2: the hook is consulted with the READ subject once, and only once (the clear makes the second read caret-less) — observed calls=[${calls.join(',')}]`,
    ).toEqual(['t1'])
  })

  it('S10 [GREEN at HEAD — the paths AGREE] — the `EditControllerOptions` field and the host late-bind must AGREE on the S7 state', () => {
    // Path A — the hook supplied at construction (§5.3.2's `EditControllerOptions` member).
    const callsA: string[] = []
    const a = makeController({ hook: recordingHook(callsA, new Map<string, HookAnswer>([['t1', null]])) })
    a.saveCaret('t1', CARET)
    const observedA = { first: a.restoreCaret('t1'), second: a.restoreCaret('t1'), calls: [...callsA] }

    // Path B — the SAME hook supplied by the host's late-bind (§5.3.2 "Host side": the host owns
    // the active-tab state and is handed an already-built controller).
    const callsB: string[] = []
    const b = makeController({ lateBind: recordingHook(callsB, new Map<string, HookAnswer>([['t1', null]])) })
    b.saveCaret('t1', CARET)
    const observedB = { first: b.restoreCaret('t1'), second: b.restoreCaret('t1'), calls: [...callsB] }

    expect(
      observedB.calls,
      `§5.3.2 "Host side" / §A.1.4: the late-bound host resolver MUST be consulted (a build that only reads the constructor field leaves the host's seam dead) — field path calls=[${observedA.calls.join(',')}] late-bind path calls=[${observedB.calls.join(',')}]`,
    ).toEqual(['t1'])
    expect(
      observedA.calls,
      `§5.3.2 / §A.1.4: the constructor-field path must consult too — field path calls=[${observedA.calls.join(',')}] late-bind path calls=[${observedB.calls.join(',')}]`,
    ).toEqual(['t1'])
    expect(
      { first: observedA.first, second: observedA.second },
      `§5.3.2 branch 2 (field path): the \`null\` answer clears the caret — observed ${JSON.stringify(observedA.first)} then ${JSON.stringify(observedA.second)}`,
    ).toEqual({ first: undefined, second: undefined })
    expect(
      observedB,
      `§5.3.2 branch 2 — THE TWO CONSTRUCTION PATHS MUST NOT DISAGREE: observed field path ${JSON.stringify(observedA)} vs late-bind path ${JSON.stringify(observedB)}`,
    ).toEqual(observedA)
  })

  it("S12 [GREEN at HEAD — artifact C7 stale] — §A.1.4's own re-pin: the hostile-subject consultation set equals the read order, and the caret-less direction is NOT consulted", () => {
    // §A.1.4 ("What the rows must assert instead"): save a caret under EACH hostile subject,
    // then read it back; every read returns `undefined` (the hook's `null` answer is the
    // discriminator), `hookCalls` EQUALS the hostile-subject list in read order, and `'t1'`
    // (the caret-less direction) is NOT in it.
    const HOSTILE = ['t-retired', '', '__proto__', DOC_A, 'ghost-tab', 't-other'] as const
    const calls: string[] = []
    const controller = makeController({ hook: recordingHook(calls, new Map<string, HookAnswer>()) })
    for (const s of HOSTILE) controller.saveCaret(s, CARET)

    const results = HOSTILE.map((s) => controller.restoreCaret(s))
    expect(
      results,
      `§A.1.4 / §5.3.2 branch 2 / P-IM-4: every hostile subject's caret is CLEARED (the hook's null answer) — observed ${JSON.stringify(results)} (calls=[${calls.join(',')}])`,
    ).toEqual(HOSTILE.map(() => undefined))
    expect(
      calls,
      `§A.1.4: \`hookCalls\` EQUALS the hostile-subject list in READ ORDER, each consulted exactly once — observed calls=[${calls.join(',')}]`,
    ).toEqual([...HOSTILE])
    expect(
      calls.includes('t1'),
      `§A.1.4: the caret-less direction ('t1' has no saved caret) must NEVER appear in the consultation set — observed calls=[${calls.join(',')}]`,
    ).toBe(false)
  })

  it('S13 [GREEN at HEAD — artifact C7 stale] — P-IM-4: the HOST\'s late-bound resolver is total and stale-proof (only the active document tab yields a document)', async () => {
    const captured: Array<(subject: string) => string | null> = []
    const h = await boot(makeHarness({ captureResolver: (r) => captured.push(r) }))
    expect(
      captured.length,
      '§5.3.2 "Host side": the host MUST late-bind exactly one `pageSubjectDocument` resolver (the shipped renderer hands it an already-built controller)',
    ).toBe(1)
    const resolve = captured[0]

    h.host.mountTab(docTab('t1', DOC_A))
    expect(
      resolve('t1'),
      `P-IM-4: subject === activeTabId AND the active target is a document ⇒ activeDocumentId — observed ${JSON.stringify(resolve('t1'))} (${hostState(h)})`,
    ).toBe(DOC_A)
    // The stale-proof direction (§5.3.2: "a STALE subject can never be validated against the
    // current document") — every non-active subject, including a document id and junk keys.
    const stale = ['t2', DOC_A, '', '__proto__', 'ghost-doc', 'constructor']
    for (const s of stale) {
      expect(
        resolve(s),
        `P-IM-4: a non-active subject returns null (never a document, never a throw) — subject=${JSON.stringify(s)} observed ${JSON.stringify(resolve(s))} (${hostState(h)})`,
      ).toBeNull()
    }

    h.host.mountTab(searchTab('s1', 'alpha'))
    await flush()
    expect(
      resolve('s1'),
      `§5.3.2: the active target is NOT a document ⇒ null — observed ${JSON.stringify(resolve('s1'))} (${hostState(h)})`,
    ).toBeNull()
    h.host.mountTab(null)
    expect(
      resolve('t1'),
      `§5.2/§5.3.2: no active tab ⇒ no document ⇒ null — observed ${JSON.stringify(resolve('t1'))} (${hostState(h)})`,
    ).toBeNull()
  })

  it('S11 [GREEN at HEAD — artifact C7 stale] — host-owned controller (late-bound hook), document tab mounted + content re-derive ⇒ the caret is restored (FS-6 / §5.1 I1 c3)', async () => {
    const h = await boot(makeHarness())
    h.host.mountTab(docTab('t1', DOC_A))
    h.editController.saveCaret('t1', CARET)
    await h.host.reDerive('content')
    await flush()

    const restored = h.editController.restoreCaret('t1')
    expect(
      restored,
      `§5.1 I1 caret-viability c3 / FS-6 / P-TP-2: with the surface present and its document live, \`saveCaret(activeTabId)\` followed by a re-derive RESTORES the caret (the host supplies the hook: subject === activeTabId ? activeDocumentId : null) — observed ${JSON.stringify(restored)} (${hostState(h)})`,
    ).toEqual(CARET)
  })
})
