// tests/unit-stage-active-tab-display-pbt-generators.test.ts — Unit
// `U-STAGE-ACTIVE-TAB` §8.1's MANDATED property-based-generator suite (the
// register of `docs/specs/unit-stage-active-tab-display.md` §6, seed
// **`0x7A6AC71D`**).
//
// WHY THIS FILE EXISTS (the audit's finding, recorded so it is not re-derived):
// the unit's two example suites (`tests/unit-stage-active-tab-display.test.ts`
// — 29 deterministic rows — and `tests/stage-active-tab-display-adversarial.test.ts`
// — 14) were judged SUFFICIENT FOR EXAMPLES and the register's PROPERTY LAYER
// ABSENT. This file is that layer: one seeded generator per node-assertable
// register row, each reporting `held` or `broken` WITH ITS STRATEGY ID and its
// attempt count, stop-after-5, deterministic (mulberry32 over the pinned seed —
// never `Math.random()`, never `Date.now()`).
//
// ---------------------------------------------------------------------------
// BUDGET (§6's shared machinery; the ≤100-per-row / ≤400-total bounds are the
// binding constraint, the split is not). §6 allocates 66 × 3 + 70 × 3 + 62 = 400,
// giving 70 to `P-TP-1` — which is **LIVE-ONLY** and gets **NO node row here**
// (below). The node rows therefore re-allocate the same 400:
//     P-IM-1  66   P-IM-2  60   P-IM-3  60   P-IM-4  62
//     P-SM-1  66   P-SM-2  46   P-TP-2  40            = 400 total, every row ≤ 100
// ---------------------------------------------------------------------------
// **`P-TP-1` IS LIVE-ONLY — NO NODE ROW IS WRITTEN FOR IT, BY DESIGN.** §6 types
// it `live-only (assembled)`: the proposition is the PAINTED `#zone:main`
// identity vs `.tab.is-active[data-tab-id]`, whose discriminators are the §8.3
// live blocks (a real `rag.query` round trip, the real main→preload→renderer
// `IPC_RAG_STORE_CHANGED` ordering). RCA-12: a node green may never be reported
// as covering it; the dom-shim is layout-less, so the claim is unassertable here
// (the blind-greens artifact records it as `NT-1`). Reported, never silently
// skipped.
// ---------------------------------------------------------------------------
// LAYER (RCA-12): HOST/RENDERER (the mount/derive ordering, the ownership key,
// the scope seams) + ENVELOPE for `P-IM-2`'s assembler leg. NOT APP-GREEN.
// ---------------------------------------------------------------------------
//
// THE ROWS AND WHAT THE RUN REPORTS (this tree, uncommitted implementation;
// seed `0x7A6AC71D`, deterministic — the counts below are THIS run's reading,
// re-derive them, never copy them):
//   P-IM-1 `strat:mount-generation-dominance`        → BROKEN @43 attempts
//          (the DE-DUPE: a REPEAT as the last attempt supersedes the pending
//          settlement — the stage keeps the previous body, or none. The COUNT
//          identity `drops === superseded` HOLDS; the over-strength
//          `drops === settlements` form is the thing this row corrects.)
//   P-IM-2 `strat:surface-census-by-active-kind`     → BROKEN @51 attempts
//          (the MIXED-document envelope: the surface authored for the active
//          document adopts a FOREIGN document's `data-rag-node-id` root)
//   P-IM-3 `strat:subject-is-tab-id`                 → HELD @60 (property pin)
//   P-IM-4 `strat:page-subject-document-total`       → HELD @62 (property pin). The oracle's liveness
//          conjunct is the ⟨§A.3.2 C2⟩ carrier `h.host.isDocumentLive(docId)` (no document id in
//          `backRefs`) — GREEN in the post-landing reading; RED ("does not exist") before that member
//   P-SM-1 `strat:stage-seam-schedule-single-active` → BROKEN at HEAD @27 (THIS reading, re-derived —
//          never copied) — after ⟨§A.3.1 RULING C1⟩ the `boot` draw is the PRE-TAB CARVE-OUT and is NO
//          LONGER a counterexample (census 1 with the pre-tab document, that document's body,
//          `mountedDocumentIds` that document, identity triple null). NO clause (2) test-side
//          counterexample remains after this adjudication — the residual reds are PRODUCTION and are
//          REPORTED, never re-pinned or relaxed:
//            (a) STATE O (open set LIVE from the schedule, NO active tab): a re-author/reconcile seam
//                (`reDerive('content')`, `refresh()`, `rerenderAppGraph()`) DROPS the open set —
//                `mounted=[]` with census 0, `bodies=[]`, `stage=empty` (and one partial reading
//                `mounted=[doc-a] census=1 bodies=[doc-a]`). §A.3.1 clause (c)/H-3 admit the OPEN SET
//                there, so the empty read is the MISSING mount, not an admissible value.
//            (b) `mountTabs(openSet)` with no active entry: census 0 (the §A.3.1 H-3 violation) and NO
//                body materialized (`open-set-bodies` — measured on a clause-(2)-bypassed probe).
//            (c) the STALE MOUNT: `tab=null mounted=[doc-a] census=1 bodies=[doc-a]` after a
//                `reDerive('template')`/`refresh()`/`rerenderAppGraph()` — clause (d) requires `[]`/0
//                there, and the bodies arm (§5.1 I2 clause 3) reports it once clauses (2)/(3) are
//                bypassed for the reading. The bodies arm is NOT relaxed (see the probe note below).
//          ⟨SUPERVISOR ADJUDICATION — the `bodies` clause ONLY (the `mountedDocumentIds` clause below
//          is a SEPARATE adjudication and is untouched by this one)⟩ the former residual (b) is
//          RE-PINNED: at a re-derive/refresh step in the OPEN-SET state (two document tabs open, one
//          active) this row asserted `bodies === [activeDocumentId]` while the MEASURED value is
//          `['doc-b','doc-a']` (the reconcile's attach order). That is OVER-STRENGTH: the committed
//          pinned contract `tests/unit-u-shell-9b-cross-document-shared.test.ts` §3.3 `:701-709`/
//          `:723-731` and §3.9 `:733-742` pins that BOTH bodies SURVIVE a `reDerive('content')` in the
//          open set (order-insensitive `toContain`), and this spec §A.1.3 pins body COEXISTENCE (§A.4.3
//          D3: the ORDER of coexisting bodies is NOT contract). Clause (4) is therefore STATE-based:
//          in the OPEN-SET state the materialized body SET equals the OPEN SET (compared SORTED,
//          membership EXACT); in a SINGLE-DOCUMENT / NO-TAB state it is EXACT (`[activeDocumentId]`,
//          the §A.3.1 pre-tab document, or none). The SURFACE census stays STRICT in BOTH states.
//          ⟨SUPERVISOR ADJUDICATION (clause (2) `mountedDocumentIds` ONLY) — STATE-BASED⟩ §A.3.1
//          clause (c) admits a STATE-DEPENDENT value — `[stageOwner(s).id]` OR **the open set** OR `[]` —
//          so a single-value expectation outside the states §A.3.1 pins one for is OVER-STRENGTH. Clause
//          (2) is now the state predicate `mountedClauseViolation`, whose state comes from the SCHEDULE
//          (`preTab`/`openSetLive` + the host's `isPreTabState()`) — never from the graded value:
//            • PRE (`start:boot`, the carve-out): EXACTLY `[getPreTabDocumentId()]`.
//            • S (one document tab active, open set collapsed): EXACTLY `[activeDocumentId]` — the read
//              must be a non-empty string[] CONTAINING it.
//            • O (open set LIVE, NO active tab at all — `getActiveTabId() === null`): EXACTLY the open
//              set — §A.3.1 H-3 requires the open set's body present there and a pane-additive flip
//              mounts no tab (the residual (a) above is this arm firing, correctly).
//            • OH (open set LIVE, a NON-DOCUMENT tab active): `[]` ONLY — a re-derive under a
//              non-document active tab must not leave a document mount (§6 P-SM-1 direction (i)).
//            • OA (open set LIVE, one document tab active): a NON-EMPTY SUBSET of the open set that
//              contains the active document (the `mountTabs` seam and the seams it leaves live).
//            • E (`!isPreTabState()`, no document tab, EMPTY open set): `[]` ONLY — clause (d)'s strict arm.
//            • N (pre-tab with no pre-tab document — the empty-store boot, clause (g)): `[]`.
//          The predicate stays DISCRIMINATING in every state (proved: 18/18 cases, 9 rejected/9 admitted,
//          run against the extracted predicate — a foreign/stale id, a NON-EMPTY set in state E or OH
//          where only `[]` is admissible, a MISSING active document in S/OA, an EMPTY/undefined read in
//          PRE/S/O, and a pre-tab set without the pre-tab document are ALL rejected; the PRE/S/O/OA/E/OH
//          admissible values are all admitted). The clause (2) pin on `bodyDocIds` is untouched, as is
//          the `pane-additive` census clause (still strict).
//          PROBE NOTE (the bodies residual's reading, TEST-side only, never committed): with clause (2)
//          temporarily bypassed the row's FIRST clause-(4) counterexample is exactly
//          `bodies/§5.1 I2 clause 3: a non-document (or no) active tab holds NO document body root
//          (step="reDerive('template')" tab=null kind=null doc=null mounted=[doc-a]
//          census(#page-edit-surface=1 [data-edit-surface]=1 values=[doc-a] agrees=true) bodies=[doc-a])`
//          on this tree — i.e. the residual REPRODUCES at HEAD, reading `mounted=[doc-a] census=1
//          bodies=[doc-a]` (the task's `mounted=[] census=0` shape was NOT sampled in this seed's 5
//          reported attempts); `reDerive('content')`/`refresh()`/`rerenderAppGraph()` all three carry it,
//          and `mountTabs(openSet)`-no-active-entry additionally reports `open-set-bodies` (bodies EMPTY
//          while the open set is open). The arm is NOT relaxed.
//   P-SM-2 `strat:two-tab-page-state-isolation`      → HELD @46 (property pin)
//   P-TP-2 `strat:caret-lifecycle-total`             → HELD @40 (property pin). Its caret clause now
//          expresses both legs through the ⟨§A.3.2 C2⟩ carrier (`isDocumentLive`, no document id in
//          `backRefs`, `'doc-gone'` dead) — GREEN in the post-landing reading
//   THE READINGS ABOVE ARE THE RUN'S, never a copy: the pre-landing baseline (01:44) had P-SM-1 BROKEN
//   on the `boot` draw and P-IM-4/P-TP-2 HELD on the legacy `backRefs` oracle; `src/**` landed the two
//   rulings at 01:46–01:48 (during this pass), so the re-pinned rows are green now. A red set for the
//   re-pin was NOT obtainable pre-landing without touching `src/**` (the TestWriter wall): recorded,
//   never fabricated.
// A HELD row is a PIN, never a vacuous pass: its generator draws its row's
// discriminator classes, and the in-row NON-VACUITY assertions fail the row when a
// required class was never drawn (the de-dupe, the reject outcome, the surviving
// settlement, the mixed payload, every `k` member, the NO-TAB state, a document-id
// subject, the junk hook answers, a success AND a failure outcome, the boot and
// open-set seams).
// The exact held/broken verdicts and the counterexamples are the ROW OUTPUT: each
// assertion prints `${row} ${strategyId}: ${counterexamples}` on failure, so the
// red set is read from the run, never asserted from this comment.
//
// GENERATOR-DISCIPLINE NOTES (recorded so a reader can never read a constraint as
// a weakened generator):
//   1. `P-IM-2`: a `document` kind is paired only with a payload that CARRIES
//      document body roots (`data-rag-node-id`). §6's "exactly one surface iff
//      k === 'document'" is otherwise over-strength by construction:
//      `assembleAppGraphEnvelope` authors a surface only when `surfaceBodyRoots`
//      is non-empty (§5.3.5 rule 2), and a document tab whose envelope carries no
//      body root is a generator artifact, not a host state.
//   2. `P-IM-3`: tab ids are drawn from a pool DISJOINT from the document ids. A
//      tab whose id coincides with a document id makes "the subject is never a
//      document id" unsatisfiable by ANY implementation (the subject IS the tab
//      id by the identity clause) — that case is a row defect, not a violation,
//      and is reported as a spec-side over-strength note instead of being drawn.
//   3. `P-IM-4`/`P-SM-2`/`P-TP-2`: the host's `pageSubjectDocument` hook is
//      LATE-BOUND by `SidebarPanes` (it re-wires at construction), so a
//      harness-supplied hook handed to a HOST is not the one consulted. The
//      host-wired path is asserted as such (the shipped seam); the
//      "harness-supplied hook wins" reading is a recorded SPEC-SIDE CONFLICT
//      (the blind-greens artifact's `C7`/`F2`) and is NOT asserted here.
//   4. `P-SM-1`: `mountTabs` is TEST-ONLY (§5.3.6 rule 1's reachability pin
//      holds — the sibling suite asserts the static census green). It is drawn
//      because §A.1.1 makes the surface census TOTAL at that seam while §A.1.3
//      carves out BODIES only.
//   5. `P-SM-2`: the commit events keep `setCurrentDocumentId` in step with the
//      active document, so the row exercises the per-tab KEYING and does NOT
//      depend on the `commitPageEdit` scope defect the `U-EDIT-1 (C9)` remand
//      owns (cross-referenced, never pinned here).
//   6. `P-SM-2` FIXTURE FIDELITY (the C9 remand; recorded so it is not
//      re-derived): the harness's `bridge.edit.batch` answers like the PRODUCTION
//      STORE — `storeBatchResult` echoes `rag-store.ts`'s `applyBatchOp` result
//      per op (the applied node/edge record, the op's own `nodeId`, the removal
//      outcome), NOT a kind-only `{ op: op.op }`. Two readings of the answer are
//      audited per call: the PRODUCTION reading (`sidebar-panes.ts`
//      `isAcknowledgedBatch`/`acknowledgesOp`: one entry per op, kind agreement,
//      any carried identity is the op's) and the STRICT ECHO reading (every entry
//      carries the op's OWN identity). NOTE, because it changes how the remand's
//      cause reads: the CURRENT contract tolerates an ABSENT identity ("an absent
//      identity carries no contrary claim"), so the old kind-only answer was still
//      read as acknowledged while the entry count matched the ops — `P-SM-2` was
//      HELD, with its successes coming back through the batch seam, not vacuously
//      via the §7 no-op path. The strict-echo half is what gives the guard teeth:
//      with the kind-only answer the row now reports `fixture-fidelity … STRICT
//      ECHO: entry 0 does not carry the applied node record`. The row prints its
//      fixture split (`[PBT] P-SM-2 fixture — batch-answered successes
//      (acknowledged): N | no-op-path successes: M | failures: K`) and asserts
//      `acknowledged-through-the-batch > 0`, so a future contract OR fixture
//      change cannot silently make the success clause vacuous again.
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { Runtime } from '../src/renderer/runtime.js'
import { createPaneRegistry } from '../src/renderer/pane-registry.js'
import { createEditController } from '../src/renderer/edit-controller.js'
import { assembleAppGraphEnvelope, PAGE_EDIT_SURFACE_ID, DATA_EDIT_SURFACE } from '../src/renderer/pane-graph.js'
import { createSnapshotStore } from '../src/main/adjacency.js'
import { DEFAULT_CONTENT_WINDOW_TEMPLATE } from '../src/main/template-store.js'
import type { RagNode, RagEdge } from '../src/main/rag-store.js'
import type { OperatorSettings } from '../src/shared/types.js'
import type { TabEntry, TabTarget } from '../src/renderer/tab-state.js'
import { SidebarPanes } from '../src/renderer/sidebar-panes.js'

beforeAll(() => {
  installShim()
})

// ===========================================================================
// The §6 shared machinery — deterministic mulberry32, pinned seed, stop-after-5.
// ===========================================================================
const PBT_SEED = 0x7a6ac71d // §6: the unit's pinned seed ("TAGC-AT1D")
const PBT_STOP_AFTER = 5
const PBT_BUDGET = {
  'P-IM-1': 66,
  'P-IM-2': 60,
  'P-IM-3': 60,
  'P-IM-4': 62,
  'P-SM-1': 66,
  'P-SM-2': 46,
  'P-TP-2': 40,
} as const

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}
function int(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}
function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

interface RowReport {
  row: string
  strategyId: string
  held: boolean
  counterexamples: string[]
  attempts: number
}
/** The row runner: ≤100 attempts (the caller passes the §6 allocation),
 *  stop-after-5, deterministic. Reports `${n} attempts` for `held` too, so a
 *  held row can never be reported from a run that did not execute. */
async function runProperty(
  rowId: string,
  strategyId: string,
  attempts: number,
  check: (i: number, rng: () => number) => Promise<string | null> | string | null,
): Promise<RowReport> {
  const rng = mulberry32(PBT_SEED + rowId.length * 0x9e3779b1)
  const counterexamples: string[] = []
  let executed = 0
  for (let i = 0; i < attempts; i++) {
    executed += 1
    let ce: string | null
    try {
      ce = await check(i, rng)
    } catch (e) {
      ce = `threw: ${(e as Error)?.message ?? String(e)}`
    }
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  const rep: RowReport = { row: rowId, strategyId, held: counterexamples.length === 0, counterexamples, attempts: executed }
  // eslint-disable-next-line no-console
  console.log(
    `[PBT] ${rep.row} ${rep.strategyId} — ${rep.held ? 'HELD' : 'BROKEN'} over ${rep.attempts} attempts (≤${attempts})` +
      (rep.held ? '' : ` | first counterexample: ${rep.counterexamples[0]}`),
  )
  return rep
}
function report(rep: RowReport): void {
  expect(
    rep.held,
    `${rep.row} ${rep.strategyId} BROKEN over ${rep.attempts} attempts — counterexamples: ${rep.counterexamples.join(' || ')}`,
  ).toBe(true)
}

// ===========================================================================
// Fixtures + the harness (the sibling suites' convention: dom shim + the real
// Runtime + a real SidebarPanes + a bridge stub; ONE controllable settlement).
// ===========================================================================
const DOC_A = 'doc-a'
const DOC_B = 'doc-b'
const T = '2026-09-22T00:00:00.000Z'

function makeNode(id: string, type: string, content: string): RagNode {
  return { id, type, content, ownedNodeIds: [], createdAt: T, updatedAt: T }
}
function makeEdge(id: string, kind: RagEdge['kind'], source: string, target: string, documentIds: string[]): RagEdge {
  return { id, kind, source, target, createdAt: T, updatedAt: T, documentIds }
}
function docTab(id: string, documentId: string): TabEntry {
  return { id, target: { kind: 'document', documentId } as TabTarget, title: `Doc ${documentId}` }
}
function searchTab(id: string, query: string): TabEntry {
  return { ...docTab(id, ''), target: { kind: 'search', queryId: `q-${id}` } as TabTarget, title: `Search ${query}`, search: { query, topK: 5 } }
}
function graphTab(id: string): TabEntry {
  return { ...docTab(id, ''), target: { kind: 'graph', view: 'knowledge' } as unknown as TabTarget, title: 'Graph' }
}
function templateTab(id: string): TabEntry {
  return { ...docTab(id, ''), target: { kind: 'template', templateId: 'tpl-1' } as unknown as TabTarget, title: 'Template' }
}
function landingTab(id: string): TabEntry {
  return { ...docTab(id, ''), target: { kind: 'other', id: 'landing' } as TabTarget, title: 'Landing' }
}

interface Harness {
  host: SidebarPanes
  runtime: Runtime
  mount: ReturnType<typeof mountEl>
  registry: ReturnType<typeof createPaneRegistry>
  editController: ReturnType<typeof createEditController>
  backRefs: Map<string, string[]>
  nodeIds: Set<string>
  /** `P-IM-1`: queries issued so far (one per NON-de-duped search mount). */
  issued: () => number
  pending: () => number
  settleAll: (outcome: 'resolve' | 'reject') => Promise<void>
  /** `P-SM-2`: what `bridge.edit.batch` answers next. */
  batchBehaviour: { ok: boolean }
  batchCalls: () => number
  /** FIXTURE FIDELITY (non-vacuity): of the calls whose drawn arm was the
   *  ACKNOWLEDGING one, how many answers the C9 contract reads as an
   *  acknowledgement of the ops actually sent (one agreeing entry per op, §3.3
   *  item 6 / `FS19`; `sidebar-panes.ts` `isAcknowledgedBatch`). */
  batchAcks: () => number
  /** Every ACK-arm answer that did NOT acknowledge the ops sent — never any. */
  batchAckMismatches: () => string[]
  /** FIXTURE STRENGTH: every ACK-arm entry must carry the op's OWN identity (a
   *  store-shaped echo) — a kind-only answer is a fixture weakening, even though
   *  the current contract tolerates an absent identity. */
  batchEchoMismatches: () => string[]
}

/** The op shapes the page seam sends (`page-diff.ts` `buildPageOps`) — read
 *  structurally, because this harness answers the bridge, it does not type it. */
type BatchOpLike = { op: string } & Record<string, unknown>
const BATCH_OP_KINDS = new Set(['putNode', 'removeNode', 'putEdge', 'removeEdge', 'setProps', 'setSubtree', 'setType'])

/** THE FIXTURE'S ANSWER SHAPE = THE PRODUCTION STORE'S OWN (`rag-store.ts`
 *  `applyBatchOp` → `BatchOpResult`): the entry's `op` IS the op's kind and every
 *  identity it carries (`node`/`edge`/`nodeId`/`props`/`children`/`type`) is the
 *  op's OWN identity — the applied record, echoed back.
 *  The C9 contract (`sidebar-panes.ts` `acknowledgesOp`, §3.3 item 6 / `FS19`)
 *  reads a batch as acknowledged only when `results.length === ops.length` AND
 *  each entry agrees with the op it acknowledges. A KIND-ONLY answer
 *  (`{ op: op.op }`) therefore is NOT an acknowledgement: it routes every batch
 *  success into the `store-rejected` arm and leaves the success clause of every
 *  row that commits satisfied by the §7 no-op path alone — a silently VACUOUS
 *  pass. The echo is deliberately the applied record, exactly as the store
 *  returns it, so the fixture can never answer more weakly than production. */
function storeBatchResult(op: BatchOpLike): Record<string, unknown> {
  switch (op.op) {
    case 'putNode':
      return { op: 'putNode', node: op.node }
    case 'putEdge':
      return { op: 'putEdge', edge: op.edge }
    case 'removeNode':
      return { op: 'removeNode', removed: true }
    case 'removeEdge':
      return { op: 'removeEdge', removed: true }
    case 'setProps':
      return { op: 'setProps', nodeId: op.nodeId, props: op.props ?? {} }
    case 'setSubtree':
      return { op: 'setSubtree', nodeId: op.nodeId, children: op.children ?? [] }
    case 'setType':
      return { op: 'setType', nodeId: op.nodeId, type: op.type }
    default:
      return { op: op.op } // an unknown kind is never an acknowledgement
  }
}

/** The local restatement of the acknowledgement contract (`FS19`), used ONLY to
 *  audit the FIXTURE against the ops it was sent — it never relaxes a row and is
 *  never used in place of the host's own reading of the answer.
 *  `requireOpIdentity: false` = the PRODUCTION reading (`sidebar-panes.ts`
 *  `acknowledgesOp`: an absent identity carries no contrary claim);
 *  `requireOpIdentity: true` = the STRICT ECHO reading (`rag-store.ts`
 *  `applyBatchOp`: the entry carries the applied record / the op's own id). */
function batchAnswerAcknowledges(
  answer: unknown,
  ops: readonly BatchOpLike[],
  opts: { requireOpIdentity: boolean },
): string | null {
  const r = answer as { ok?: unknown; results?: unknown } | null | undefined
  if (r == null || typeof r !== 'object' || r.ok !== true) return 'the ACK-arm answer is not `ok: true`'
  const results = (r as { results?: unknown }).results
  if (!Array.isArray(results)) return 'the ACK-arm answer carries no `results` array'
  if (results.length !== ops.length) return `the ACK-arm answer carried ${results.length} entries for ${ops.length} ops`
  for (let i = 0; i < ops.length; i++) {
    const entry = results[i] as Record<string, unknown> | null | undefined
    const op = ops[i]
    if (entry == null || typeof entry !== 'object') return `entry ${i} is not an object`
    if (entry.op !== op.op) return `entry ${i} acknowledges kind ${JSON.stringify(entry.op)} for op kind ${JSON.stringify(op.op)}`
    const identity = entry.node ?? entry.edge ?? entry.nodeId
    if (identity !== undefined && identity !== op.node && identity !== op.edge && identity !== op.nodeId) {
      return `entry ${i} carries an identity that is not the op's own (op kind ${JSON.stringify(op.op)})`
    }
    if (opts.requireOpIdentity) {
      switch (op.op) {
        case 'putNode':
          if (entry.node !== op.node) return `entry ${i} does not carry the applied node record (a kind-only answer is not a store-shaped echo)`
          break
        case 'putEdge':
          if (entry.edge !== op.edge) return `entry ${i} does not carry the applied edge record (a kind-only answer is not a store-shaped echo)`
          break
        case 'removeNode':
        case 'removeEdge':
          if (typeof entry.removed !== 'boolean') return `entry ${i} does not carry the removal outcome for ${JSON.stringify(op.op)}`
          break
        case 'setProps':
        case 'setSubtree':
        case 'setType':
          if (entry.nodeId !== op.nodeId) return `entry ${i} does not carry the op's own nodeId for ${JSON.stringify(op.op)}`
          break
        default:
          return `entry ${i} names an op kind the store never acknowledges (${JSON.stringify(op.op)})`
      }
    }
  }
  return null
}

function makeHarness(opts: { controlledQuery?: boolean } = {}): Harness {
  const mount = mountEl()
  const operatorMount = mountEl()
  const registry = createPaneRegistry()
  const nodes = [
    makeNode(`${DOC_A}-head`, 'h1', 'Doc A'),
    makeNode(`${DOC_A}-body`, 'p', 'body A'),
    makeNode(`${DOC_B}-head`, 'h1', 'Doc B'),
    makeNode(`${DOC_B}-body`, 'p', 'body B'),
  ]
  const store = createSnapshotStore(nodes, [
    makeEdge('ea-h', 'doc-head', `${DOC_A}-head`, DOC_A, [DOC_A]),
    makeEdge('ea-n', 'next-section', `${DOC_A}-head`, `${DOC_A}-body`, [DOC_A]),
    makeEdge('ea-e', 'doc-end', `${DOC_A}-body`, DOC_A, [DOC_A]),
    makeEdge('eb-h', 'doc-head', `${DOC_B}-head`, DOC_B, [DOC_B]),
    makeEdge('eb-n', 'next-section', `${DOC_B}-head`, `${DOC_B}-body`, [DOC_B]),
    makeEdge('eb-e', 'doc-end', `${DOC_B}-body`, DOC_B, [DOC_B]),
  ])
  interface Pending {
    q: string
    resolve: (v: unknown) => void
    reject: (e: unknown) => void
  }
  const pendings: Pending[] = []
  let issued = 0
  let batchCallCount = 0
  let batchAckCount = 0
  const batchAckMismatches: string[] = []
  const batchEchoMismatches: string[] = []
  const batchBehaviour = { ok: true }
  const queryImpl = (q: string): Promise<unknown> => {
    if (opts.controlledQuery !== true) return Promise.resolve(queryResult(q))
    issued += 1
    return new Promise<unknown>((resolve, reject) => {
      pendings.push({ q, resolve, reject })
    })
  }
  const batch = vi.fn(async (ops: BatchOpLike[]) => {
    batchCallCount += 1
    const sent: BatchOpLike[] = Array.isArray(ops) ? ops : []
    // the store's DISCRIMINATED failure arm (`rag-store.ts` `applyBatch`): an op
    // list it cannot apply fails as a WHOLE (`{ ok: false, error, failedIndex }`)
    // — never a partial success with a junk entry.
    const badIndex = sent.findIndex((op) => op == null || typeof op.op !== 'string' || !BATCH_OP_KINDS.has(op.op))
    if (badIndex >= 0) return { ok: false, error: `rag applyBatch: invalid op at index ${badIndex}`, failedIndex: badIndex }
    if (!batchBehaviour.ok) {
      // the DRAWN non-acknowledgement direction (§3.3 item 6: `ok` alone is never
      // success) — a silent partial write, as production would report it.
      return { ok: true }
    }
    const answer = { ok: true, results: sent.map(storeBatchResult) }
    // fixture fidelity, TWO readings (both recorded, then read by the rows'
    // non-vacuity guards):
    //   (a) the PRODUCTION reading (`acknowledgesOp`): one entry per op, in order,
    //       the entry's kind is the op's, and any identity it carries is the op's
    //       own — a future contract change that makes the harness's answer
    //       unacknowledged trips this;
    //   (b) the STRICT ECHO reading: every entry carries the op's OWN identity,
    //       i.e. the fixture answers exactly like `applyBatchOp` does and can never
    //       silently weaken back to a kind-only `{ op: op.op }` answer (which the
    //       current contract still tolerates as "an absent identity carries no
    //       contrary claim" — so reading (a) ALONE would not have teeth).
    const mismatch = batchAnswerAcknowledges(answer, sent, { requireOpIdentity: false })
    if (mismatch === null) batchAckCount += 1
    else batchAckMismatches.push(mismatch)
    const echoMismatch = batchAnswerAcknowledges(answer, sent, { requireOpIdentity: true })
    if (echoMismatch !== null) batchEchoMismatches.push(echoMismatch)
    return answer
  })
  const bridge = {
    security: { get: async () => ({ token: null, enabled: ['read', 'dispatch', 'rag'] }) },
    edit: { onRagStoreChanged: () => () => {}, commitRich: async () => ({ ok: true, nodeId: 'x' }), batch },
    rag: {
      query: vi.fn(queryImpl),
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
        ({ enabledPanes: [], panesInitialized: true, defaultDocumentId: null, topK: 5, representationMode: 'html' }) as unknown as OperatorSettings,
      set: async (p: Record<string, unknown>) => p as unknown as OperatorSettings,
      onChanged: () => () => {},
    },
  }
  const backRefs = new Map<string, string[]>([['t1', [`${DOC_A}-body`]], ['t2', [`${DOC_B}-body`]]])
  let host: SidebarPanes
  const editController = createEditController({
    backRefs,
    commit: async () => ({ ok: true, nodeId: 'x' }),
    onRebuild: (k) => void host.reDerive(k),
  })
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
    registry,
    editController,
    backRefs,
    nodeIds: new Set(nodes.map((n) => n.id)),
    issued: () => issued,
    pending: () => pendings.length,
    settleAll: async (outcome) => {
      for (const p of pendings.splice(0, pendings.length)) {
        if (outcome === 'resolve') p.resolve(queryResult(p.q))
        else p.reject(new Error('query down'))
      }
      await flush()
    },
    batchBehaviour,
    batchCalls: () => batchCallCount,
    batchAcks: () => batchAckCount,
    batchAckMismatches: () => batchAckMismatches.slice(),
    batchEchoMismatches: () => batchEchoMismatches.slice(),
  }
}
function queryResult(query: string): unknown {
  return { query, ranked: [], results: [], context: [], markdown: '', lineMap: { ranges: [] }, k: 5 }
}
async function boot(h: Harness): Promise<Harness> {
  await h.host.boot(h.runtime)
  return h
}
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

// ---- §5.2 pinned readers (declared members only) --------------------------
function reader<T>(host: SidebarPanes, name: string): () => T {
  const fn = (host as unknown as Record<string, unknown>)[name]
  if (typeof fn !== 'function') throw new TypeError(`SidebarPanes.${name}() does not exist (§5.2 — RED)`)
  return () => (fn as () => T).call(host)
}
function activeTabId(host: SidebarPanes): string | null {
  return reader<string | null>(host, 'getActiveTabId')()
}
function activeKind(host: SidebarPanes): string | null {
  return reader<string | null>(host, 'getActiveTargetKind')()
}
function activeDocId(host: SidebarPanes): string | null {
  return reader<string | null>(host, 'getActiveDocumentId')()
}
function mountedIds(host: SidebarPanes): readonly string[] {
  const got: unknown = reader<readonly string[]>(host, 'getMountedDocumentIds')()
  // NON-VACUITY GUARD (supersedes the bare read for the P-SM-1 clause-(2) predicate): the predicate
  // and its own error message call `.some`/`.join` on this value, so a build that declares the member
  // but returns a non-array (or `undefined`) must be REPORTED as an incoherent read, never crash as a
  // TypeError and never be read as "the predicate drew nothing".
  if (!Array.isArray(got) || got.some((v) => typeof v !== 'string')) {
    throw new TypeError(
      `SidebarPanes.getMountedDocumentIds() must return a string[] (§A.3.1 clause (c) — non-vacuity: the clause must DRAW a value); got ${JSON.stringify(got)}`,
    )
  }
  return got as readonly string[]
}
/** ⟨SUPERVISOR ADJUDICATION — clause (2) `mountedDocumentIds`, STATE-BASED⟩ the six admissible
 *  states of clause (c)'s disjunction, each computed from the SCHEDULE (the drawn `start`/seam and the
 *  tracked open-set flag), plus the host's own pre-tab reader — NEVER from `mounted` (the graded value),
 *  so no value can satisfy the assertion by naming the state it is graded in. */
type MountedStateKind =
  | 'PRE' // pre-tab carve-out (no tab state handed): `[getPreTabDocumentId()]`
  | 'S' // one document tab active, no open set: `[activeDocumentId]`
  | 'O' // open set LIVE, NO active TAB at all: the open set (a pane-additive flip mounts no tab)
  | 'OH' // open set LIVE, a NON-DOCUMENT tab active: the document tabs are not the active target ⇒ `[]`
  | 'OA' // open set LIVE, one document tab active: a non-empty subset of the open set (§A.4.3 set)
  | 'E' // !isPreTabState(), no document tab, no open set: `[]` (clause (d) strict arm)
  | 'N' // pre-tab, no pre-tab document known (empty-store boot, clause (g)): `[]`
/** ⟨§A.3.1 clause (c)⟩ the `mountedDocumentIds` admissibility predicate, STATE-BASED. Clause (c) admits
 *  a STATE-DEPENDENT value — `[stageOwner(s).id]`, the open set at the multi seam, or `[]` — so a
 *  single-value expectation outside the states §A.3.1 pins one for is OVER-STRENGTH. `sched` carries the
 *  state read from the SCHEDULE; `preTabDoc` is the host's `getPreTabDocumentId()` reading (the
 *  carve-out's own documented value, §A.3.1 C1); `activeTabId` is the host's declared reader (§5.2),
 *  consulted ONLY to tell "no tab at all" from "a non-document tab is the active target".
 *
 *  STATE → ADMISSIBLE VALUE (the map; the message on every violation names the state it was graded in):
 *    • PRE (`sched.preTab` and `isPreTabState()` and a known pre-tab document) → EXACTLY
 *      `[preTabDoc]` (§A.3.1 clause (c) pins one value there; the row already pins it at `start:boot`).
 *      `[]` is a violation here (the carve-out owns the stage).
 *    • S (`documentTabActive`, open set NOT live) → EXACTLY `[activeDocumentId]`; the read must be
 *      non-empty AND contain the active document — a stale id, a missing active document, or an
 *      undefined/empty read is a violation.
 *    • O (open set LIVE, NO active tab at all — `getActiveTabId() === null`) → EXACTLY the open set
 *      (§A.3.1 H-3: the open set's body is required present there, and a pane-additive flip mounts NO
 *      tab, so the open set persists across `reDerive`/`refresh`/`rerenderAppGraph`). `[]` is a
 *      violation: it would mean the mount dropped the open set in a state that does not touch the tabs.
 *    • OH (open set LIVE, a NON-DOCUMENT tab active — `mountTab(search|graph|template|landing)` does not
 *      collapse the open set, but a non-document target IS the active one) → `[]` ONLY: §6 P-SM-1's
 *      pinned direction (i) — "a `reDerive('content')` under a non-document active tab must not add a
 *      document body". A non-empty set here is the violation this arm exists for.
 *    • OA (open set LIVE, one document tab active) → a NON-EMPTY SUBSET of the open set that must
 *      CONTAIN `activeDocumentId` (the multi seam and the state it leaves live; §A.4.3: the set is the
 *      contract, the DOM attach order is not).
 *    • E (`!isPreTabState()`, no document tab active, empty open set) → `[]` ONLY (clause (d)'s strict
 *      arm). A non-empty set here is `mountTab(null)`/`mountTabs`-without-an-active-entry/a no-tab
 *      `rerenderAppGraph()` leaving a stale mount — §A.1.2's stale-root destruction.
 *    • N (pre-tab, no pre-tab document: the empty-store/landing boot, clause (g)) → `[]`.
 *  Every arm is preceded by the FOREIGN check: an id that is neither the active document, nor the
 *  pre-tab document, nor a member of the LIVE open set is a stale/foreign document id, rejected in every
 *  state. Returns the violation, or `null`. */
function mountedClauseViolation(
  mounted: readonly string[],
  activeDocumentId: string | null,
  documentTabActive: boolean,
  openSet: ReadonlySet<string>,
  activeTabId: string | null,
  sched: { preTab: boolean; openSetLive: boolean; preTabDocumentId: string | null },
): string | null {
  // NON-VACUITY GUARD (the predicate is TOTAL over its input, so it can never be satisfied by a read
  // that carries no value): an `undefined`/non-array read is a MISSING mount — never an empty set that a
  // state might admit. In-situ `mountedIds` already REPORTS such a read before this point; this guard
  // keeps the predicate DISCRIMINATING when it is exercised on its own (§A.3.1 clause (c) is a
  // predicate, not a comparison).
  if (!Array.isArray(mounted) || mounted.some((d) => typeof d !== 'string')) {
    return `mountedDocumentIds/§A.3.1(c): the read is NOT a string[] (${JSON.stringify(mounted)}) — a missing/undefined read is a MISSING mount, never an admitted empty set`
  }
  const foreign = mounted.filter(
    (d) => d !== activeDocumentId && d !== sched.preTabDocumentId && !(sched.openSetLive && openSet.has(d)),
  )
  if (foreign.length > 0) {
    return `mountedDocumentIds/§A.3.1(c): [${foreign.join(',')}] is NEITHER the active document (${activeDocumentId ?? 'null'}) NOR the pre-tab document (${sched.preTabDocumentId ?? 'null'}) NOR in the ${sched.openSetLive ? 'LIVE' : 'empty'} open set {${[...openSet].join(',')}} — a stale/foreign document id`
  }
  const state: MountedStateKind = sched.preTab
    ? sched.preTabDocumentId !== null
      ? 'PRE'
      : 'N'
    : documentTabActive
      ? sched.openSetLive
        ? 'OA'
        : 'S'
      : sched.openSetLive
        ? activeTabId === null
          ? 'O'
          : 'OH'
        : 'E'
  const setEq = (want: readonly string[]): boolean => {
    const got = [...mounted].sort()
    const w = [...want].sort()
    return got.length === w.length && got.join(',') === w.join(',')
  }
  switch (state) {
    case 'PRE': {
      const want = [sched.preTabDocumentId as string]
      if (!setEq(want)) {
        return `mountedDocumentIds/§A.3.1(c) [state PRE — pre-tab carve-out]: expected EXACTLY [${want.join(',')}] (the pre-tab document owns the stage; the empty set is NOT admissible here)`
      }
      return null
    }
    case 'N':
      if (mounted.length !== 0) return `mountedDocumentIds/§A.3.1(c)+(g) [state N — empty-store pre-tab boot]: expected []`
      return null
    case 'S': {
      const want = [activeDocumentId as string]
      if (mounted.length === 0 || activeDocumentId === null || !mounted.includes(activeDocumentId)) {
        return `mountedDocumentIds/§A.3.1(c) [state S — one document tab active]: expected EXACTLY [${want.join(',')}] (the read must be a non-empty string[] CONTAINING the active document; an undefined/empty read is a MISSING active document)`
      }
      if (!setEq(want)) {
        return `mountedDocumentIds/§A.3.1(c) [state S — one document tab active]: expected EXACTLY [${want.join(',')}] (no second document may remain mounted while a single tab owns the stage)`
      }
      return null
    }
    case 'O': {
      const want = [...openSet]
      if (mounted.length === 0 || !setEq(want)) {
        return `mountedDocumentIds/§A.3.1(c) [state O — open set LIVE, NO active tab]: expected the OPEN SET {${want.join(',')}} (a pane-additive flip mounts NO tab and reDerive/refresh/rerenderAppGraph mount none either, so the open set persists — the empty set is NOT admissible here; §A.1.3, H-3)`
      }
      return null
    }
    case 'OH': {
      if (mounted.length !== 0) {
        return `mountedDocumentIds/§A.3.1(c) [state OH — open set LIVE, a NON-DOCUMENT tab (${activeTabId}) active]: the empty set is the only admissible value (§6 P-SM-1 direction (i): a re-derive under a non-document active tab must not leave a document mount)`
      }
      return null
    }
    case 'OA': {
      if (mounted.length === 0 || activeDocumentId === null || !mounted.includes(activeDocumentId)) {
        return `mountedDocumentIds/§A.3.1(c) [state OA — open set LIVE, document tab ${activeDocumentId ?? 'null'} active]: expected a NON-EMPTY SUBSET of the open set {${[...openSet].join(',')}} that CONTAINS the active document (an undefined/empty read is a MISSING active document)`
      }
      return null
    }
    case 'E':
      if (mounted.length !== 0) {
        return `mountedDocumentIds/§A.3.1(c)+(d) [state E — !isPreTabState(), no document tab, EMPTY open set]: a NON-EMPTY set [${mounted.join(',')}] (the clause-(d) strict arm: the empty set is the only admissible value there)`
      }
      return null
  }
}
/** ⟨SUPERVISOR ADJUDICATION — the `bodies` clause (clause (4)), STATE-BASED⟩ the SAME seven states
 *  clause (2) grades, derived from the SCHEDULE (`exp.openSetLive` — the drawn seam's own open-set
 *  flag, `true` at the `mountTabs` seam and at every step drawn while the open set is still open,
 *  `false` the moment a `mountTab(...)` collapses it) plus the HOST's OWN declaration
 *  (`isPreTabState()` — MONOTONIC: `false` only once any `mountTab`/`mountTabs` has handed tab state).
 *  The kind is a pure function of that state — never of the graded body read. */
type BodyStateKind =
  | 'PRE' // pre-tab carve-out with a known pre-tab document: EXACTLY [getPreTabDocumentId()]
  | 'N' // pre-tab but no pre-tab document (empty-store boot, clause (g)): []
  | 'S' // one document tab active, open set NOT live: EXACTLY [activeDocumentId]
  | 'OA' // open set LIVE, a document tab active: the OPEN SET as a SET (§A.1.3/§A.4.3)
  | 'O' // open set LIVE, NO active tab at all: the OPEN SET as a SET (§A.3.1 H-3)
  | 'OH' // open set LIVE, a NON-DOCUMENT tab active: [] (§6 P-SM-1 direction (i))
  | 'E' // !isPreTabState(), no document tab, open set NOT live: [] ONLY (clause (d))
function bodyStateKind(
  documentTabActive: boolean,
  activeTabId: string | null,
  sched: { preTab: boolean; openSetLive: boolean; preTabDocumentId: string | null },
): BodyStateKind {
  if (sched.preTab) return sched.preTabDocumentId !== null ? 'PRE' : 'N'
  if (documentTabActive) return sched.openSetLive ? 'OA' : 'S'
  if (!sched.openSetLive) return 'E'
  return activeTabId === null ? 'O' : 'OH'
}
/** ⟨SUPERVISOR ADJUDICATION — the `bodies` clause, STATE-BASED⟩ §A.3.1 clause (b)'s value is
 *  STATE-DEPENDENT exactly as clause (c)'s is (`[stageOwner(s).id]` when `kind ≠ 'none'`, the open
 *  set's coexistence at the 9b seam, `0` otherwise), so the body clause is a PREDICATE over the state
 *  — never a single-value expectation, and never satisfied by the value it grades. `bodies` is the
 *  MEASURED body-root census; the state comes from `bodyStateKind`'s inputs.
 *
 *  STATE → ADMISSIBLE BODY SET (the map; every message names the state it graded in):
 *    • PRE (`isPreTabState()` — the HOST's own declaration — with a known pre-tab document): EXACTLY
 *      `[getPreTabDocumentId()]`. §A.3.1 clauses (a)/(b)/(f): the pre-tab arm OWNS the stage, so the
 *      carve-out's document body is REQUIRED — `[]` is a violation (the arm clause (4) previously
 *      mis-graded at every step drawn AFTER `start:boot`: the pre-tab state is MONOTONIC, so a
 *      re-author/reconcile seam drawn before ANY `mountTab`/`mountTabs` is STILL the pre-tab state),
 *      and so is ANY other document's body (the `§5.1 I2 clause 3` stale-root defect).
 *    • N (pre-tab, NO pre-tab document — the empty-store/landing boot, clause (g)): `[]` ONLY.
 *    • S (one DOCUMENT tab active, open set NOT live): EXACTLY `[activeDocumentId]` — a MISSING
 *      active body, an extra body outside the open set, or a foreign/stale id is a violation
 *      (§6 P-SM-1 direction (iii): the `mountTab` that collapses the open set returns to ONE body).
 *    • OA (open set LIVE, a DOCUMENT tab active — the `mountTabs` seam and the re-author/reconcile
 *      seams it leaves live): the OPEN SET as a SET (§A.1.3 coexistence; §A.4.3 D3: the DOM attach
 *      order of coexisting bodies is NOT contract). An EXTRA body outside the open set fails.
 *    • O (open set LIVE, NO active tab at all — `mountTabs(openSet)` with no active entry, and every
 *      non-`mountTab` seam drawn there): EXACTLY the open set as a SET (§A.3.1 H-3: the open set's
 *      bodies are REQUIRED present; `[]` or a partial set is the counterexample this arm exists for).
 *    • OH (open set LIVE, a NON-DOCUMENT tab active): `[]` ONLY (§6 P-SM-1 direction (i): a re-derive
 *      under a non-document active tab must not leave a document body).
 *    • E (`!isPreTabState()`, no document tab, open set NOT live — `mountTab(null)`, a non-document
 *      tab, a no-tab step after tab state was handed): `[]` ONLY (§A.3.1 clause (d)'s strict arm +
 *      §5.1 I2 clause 3). A non-empty read here is a stale/foreign body root.
 *  The FOREIGN check precedes every arm: an id that is neither the active document, nor the pre-tab
 *  document, nor a member of the LIVE open set is rejected in EVERY state. Returns the violation, or
 *  `null`. */
function bodyClauseViolation(
  bodies: readonly string[],
  activeDocumentId: string | null,
  documentTabActive: boolean,
  openSet: ReadonlySet<string>,
  activeTabId: string | null,
  sched: { preTab: boolean; openSetLive: boolean; preTabDocumentId: string | null },
): string | null {
  // NON-VACUITY GUARD (the predicate is TOTAL over its input, so a state can never be satisfied by a
  // read that carries no value): an `undefined`/non-array read is a MISSING body census — never the
  // empty set some states admit — and is REPORTED as an incoherent read, never read as "nothing was
  // mounted". In-situ `bodyDocIds` derives a `string[]` from the DOM, so this guard is what keeps the
  // clause DISCRIMINATING when it is exercised on its own (§A.3.1 clause (b) is a predicate).
  if (!Array.isArray(bodies) || bodies.some((d) => typeof d !== 'string')) {
    return `bodies/§A.3.1(b): the read is NOT a string[] (${JSON.stringify(bodies)}) — a missing/undefined read is a MISSING body census, never an admitted empty set`
  }
  const foreign = bodies.filter(
    (d) => d !== activeDocumentId && d !== sched.preTabDocumentId && !(sched.openSetLive && openSet.has(d)),
  )
  if (foreign.length > 0) {
    return `bodies/§A.3.1(b): [${foreign.join(',')}] is NEITHER the active document (${activeDocumentId ?? 'null'}) NOR the pre-tab document (${sched.preTabDocumentId ?? 'null'}) NOR in the ${sched.openSetLive ? 'LIVE' : 'empty'} open set {${[...openSet].join(',')}} — a stale/foreign document body`
  }
  const state = bodyStateKind(documentTabActive, activeTabId, sched)
  const setEq = (want: readonly string[]): boolean => {
    const got = [...bodies].sort()
    const w = [...want].sort()
    return got.length === w.length && got.join(',') === w.join(',')
  }
  switch (state) {
    case 'PRE': {
      const want = [sched.preTabDocumentId as string]
      if (!setEq(want)) {
        return `bodies/§A.3.1(b) [state PRE — the pre-tab carve-out, §A.3.1 (a)/(b)]: expected EXACTLY [${want.join(',')}] (the pre-tab document OWNS the stage until the first tab state is handed, so the empty set is NOT admissible here, and no other document's body is)`
      }
      return null
    }
    case 'N':
      if (bodies.length !== 0) return `bodies/§A.3.1(b)+(g) [state N — pre-tab, NO pre-tab document (empty-store boot)]: expected []`
      return null
    case 'S': {
      const want = [activeDocumentId as string]
      if (bodies.length === 0 || activeDocumentId === null || !bodies.includes(activeDocumentId)) {
        return `bodies/§A.3.1(b) [state S — one document tab active]: expected EXACTLY [${want.join(',')}] (the read must be a NON-EMPTY string[] CONTAINING the active document; an undefined/empty read is a MISSING active document body)`
      }
      if (!setEq(want)) {
        return `bodies/§A.3.1(b) [state S — one document tab active, open set collapsed]: expected EXACTLY [${want.join(',')}] — no SECOND document body may remain mounted while one tab owns the stage (§6 P-SM-1 direction (iii))`
      }
      return null
    }
    case 'OA':
    case 'O': {
      // NON-VACUITY GUARD (row defect, never a pass): a LIVE open set MUST declare its member ids —
      // comparing against an empty `want` would make the arm pass VACUOUSLY. Reported as a thrown
      // error, exactly like the pre-adjudication guard.
      if (openSet.size === 0) {
        throw new TypeError(
          `bodies/§A.1.3: the OPEN-SET body clause may never be asserted over an EMPTY open set (openSet=${JSON.stringify([...openSet])}) — the row defect would compare {} with {} and pass vacuously`,
        )
      }
      const want = [...openSet]
      if (bodies.length === 0) {
        return `bodies/§A.1.3/§A.3.1(b) [state ${state} — the open set is LIVE]: the body read is EMPTY — NOT ONE of the open set's document body roots materialized (a MISSING body) expected {${want.join(',')}}`
      }
      if (!setEq(want)) {
        return `bodies/§A.1.3/§A.3.1(b) [state ${state} — the open set is LIVE${state === 'O' ? ' with NO active entry (H-3)' : ', a document tab active'}]: the open set's bodies coexist EXACTLY as a SET (§A.1.3 coexistence + §A.4.3 D3 — the DOM ORDER is NOT contract; an EXTRA body outside the open set fails here) expected {${want.join(',')}} got {${[...bodies].sort().join(',')}}`
      }
      return null
    }
    case 'OH':
      if (bodies.length !== 0) {
        return `bodies/§A.3.1(b)+(d) [state OH — open set LIVE, a NON-DOCUMENT tab (${activeTabId}) active]: a NON-EMPTY body read [${bodies.join(',')}] — §6 P-SM-1 direction (i): a re-derive under a non-document active tab must not leave a document body`
      }
      return null
    case 'E':
      if (bodies.length !== 0) {
        return `bodies/§A.3.1(b)+(d)/§5.1 I2 clause 3 [state E — !isPreTabState(), no document tab, open set NOT live]: a NON-EMPTY body read [${bodies.join(',')}] — the strict arm admits NO document body root (a stale/foreign body is the defect this arm grades)`
      }
      return null
  }
}
// ---- ⟨§A.3.1 RULING C1 + §A.3.2 RULING C2 (2026-09-22/23)⟩ the ADDED members the two rulings pin
// ---- (§A.3.4 item 3: the member NAMES are the contract; a build that sources the same facts under
// ---- other names is a further amendment, never a silent rename). Same declared-member convention:
// ---- an absent member reports "does not exist", never a private-field peek.
function preTabState(host: SidebarPanes): boolean {
  return reader<boolean>(host, 'isPreTabState')()
}
function preTabDocumentId(host: SidebarPanes): string | null {
  return reader<string | null>(host, 'getPreTabDocumentId')()
}
/** `SidebarPanes.isDocumentLive(documentId)` — the SEPARATE document-liveness carrier. `backRefs`
 *  keeps its documented `Map<ragNodeId, nodeId[]>` invariant, so NO document id keys it: the caret's
 *  document check is this carrier's, and the oracle below reads it (never `backRefs.has(...)`). */
function documentLive(host: SidebarPanes, documentId: string): boolean {
  const fn = (host as unknown as { isDocumentLive?: (id: string) => boolean }).isDocumentLive
  if (typeof fn !== 'function') {
    throw new TypeError('SidebarPanes.isDocumentLive() does not exist (⟨§A.3.2 C2⟩ U-STAGE-ACTIVE-TAB — RED)')
  }
  return fn.call(host, documentId)
}
function droppedCount(host: SidebarPanes): number {
  return reader<number>(host, 'getStageMountDropped')()
}
/** `P-SM-2`: the per-tab failure record, read through the host's DECLARED reader
 *  (TS-private; the `TAB-1` class's intended consumer), never a private-field
 *  peek — the `U-EDIT-1 (C9)` suite's recorded provenance technique. */
function failureOf(host: SidebarPanes, subject: string): unknown {
  const fn = (host as unknown as { pageEditSurfaceFailure?: (s: string) => unknown }).pageEditSurfaceFailure
  if (typeof fn !== 'function') return undefined
  return fn.call(host, subject)
}

// ---- DOM readers ----------------------------------------------------------
type ShimLike = { innerHTML: string; querySelectorAll(sel: string): Array<{ getAttribute(k: string): string | null }> }
function stageEl(h: Harness): ShimLike {
  return h.mount as unknown as ShimLike
}
function stageHtml(h: Harness): string {
  return stageEl(h).innerHTML
}
/** §A.1.1 `I2-R` — the surface census by BOTH discriminators, which must agree. */
function censusOf(h: Harness): { authored: number; marked: number; markerIds: Array<string | null>; agrees: boolean; line: string } {
  const authoredRoots = stageEl(h).querySelectorAll(`[id='${PAGE_EDIT_SURFACE_ID}']`)
  const markedRoots = stageEl(h).querySelectorAll(`[${DATA_EDIT_SURFACE}]`)
  const markerIds = markedRoots.map((el) => el.getAttribute(DATA_EDIT_SURFACE))
  const authoredMarkerIds = authoredRoots.map((el) => el.getAttribute(DATA_EDIT_SURFACE))
  const authored = authoredRoots.length
  const marked = markedRoots.length
  const agrees =
    authored === marked && authoredMarkerIds.length === markerIds.length && authoredMarkerIds.every((v, i) => v != null && v === markerIds[i])
  return { authored, marked, markerIds, agrees, line: `#${PAGE_EDIT_SURFACE_ID}=${authored} [${DATA_EDIT_SURFACE}]=${marked} values=[${markerIds.join(',')}] agrees=${agrees}` }
}
function documentRootCensus(h: Harness): number {
  return stageEl(h).querySelectorAll('[data-rag-node-id]').length
}
/** §A.1.3 — the body-root census keyed BY DOCUMENT (never by the first
 *  `-`-delimited token, which collapses doc-a/doc-b into one key). */
function bodyDocIds(h: Harness): string[] {
  const roots = stageEl(h).querySelectorAll('[data-rag-node-id]').map((el) => String(el.getAttribute('data-rag-node-id')))
  const out: string[] = []
  for (const r of roots) {
    const key = [DOC_A, DOC_B].find((d) => r === d || r.startsWith(`${d}-`)) ?? `?${r}`
    if (!out.includes(key)) out.push(key)
  }
  return out
}
function stageSearchBody(h: Harness): boolean {
  return stageHtml(h).includes('stage-search-tab') || stageHtml(h).includes('search-tab-input')
}
/** §5.1's `stageTargetKind`, derived from the RENDERED stage body. */
function stageTargetKind(h: Harness): string {
  if (censusOf(h).authored > 0 || documentRootCensus(h) > 0) return 'document'
  if (stageSearchBody(h)) return 'search'
  if (stageHtml(h).includes('stage-landing')) return 'landing'
  if (stageHtml(h).includes('data-stage="placeholder"')) return 'placeholder'
  if (stageHtml(h).includes('data-stage="empty"') || stageHtml(h).trim() === '') return 'empty'
  return 'unknown'
}

// ---- the page seam (§11.8 item 1) -----------------------------------------
function sidebarApi(): Record<string, (...args: unknown[]) => unknown> {
  const w = (globalThis as unknown as { window?: { provident?: { sidebar?: unknown } } }).window
  const sidebar = w?.provident?.sidebar
  if (sidebar == null) throw new Error('window.provident.sidebar not installed (the page seam must be installed at boot)')
  return sidebar as Record<string, (...args: unknown[]) => unknown>
}
function pageInput(): void {
  const seam = sidebarApi().pageSurfaceInput
  if (typeof seam !== 'function') throw new Error('sidebar.pageSurfaceInput is not installed (§11.8 item 1)')
  ;(seam as () => void)()
}
async function pageBlur(html: unknown): Promise<void> {
  const seam = sidebarApi().pageSurfaceBlur
  if (typeof seam !== 'function') throw new Error('sidebar.pageSurfaceBlur is not installed (§11.8 item 1)')
  ;(seam as (h: unknown) => void)(html)
  await flush()
}
function paneVisibilityToggle(paneId: string): void {
  const seam = sidebarApi().paneVisibilityToggle
  if (typeof seam !== 'function') throw new Error('sidebar.paneVisibilityToggle is not installed (the pane-additive reconcile seam)')
  ;(seam as (id: string) => void)(paneId)
}
const PAGE_CARET = { kind: 'rich' as const, ragId: PAGE_EDIT_SURFACE_ID, anchor: { path: [0], offset: 0 }, focus: { path: [0], offset: 0 } }

// ===========================================================================
// P-IM-1 — `strat:mount-generation-dominance` (66 attempts, §6's 66 allocation)
// ===========================================================================
type Im1Step = {
  label: string
  entry: TabEntry | null
  deduped: boolean
  isSearch: boolean
  docId: string | null
}
describe('§6 `P-IM-1` — stage-mount dominance (V1): the LAST mount attempt owns the stage, the drop counter equals the SUPERSEDED settlements', () => {
  it('P-IM-1 [strat:mount-generation-dominance] [BROKEN at HEAD: a de-duped identical re-mount issues ONE query, supersedes the pending attempt, and the stage keeps NO body of the last attempt]', async () => {
    const noDedupeCovered = { counted: 0 }
    const rejectedCovered = { counted: 0 }
    const interleavedCovered = { counted: 0 }
    const countDiscriminated = { counted: 0 }
    const rep = await runProperty('P-IM-1', 'strat:mount-generation-dominance', PBT_BUDGET['P-IM-1'], async (_i, rng) => {
      const h = await boot(makeHarness({ controlledQuery: true }))

      // --- the generator: a schedule of 1–6 mount calls with REPEAT entries and
      // --- the {resolve, reject} outcome alphabet (§6's strategy).
      const n = int(rng, 1, 6)
      const steps: Im1Step[] = []
      let mountedKey: string | null = null
      const searchPool: TabEntry[] = []
      let lastDoc: TabEntry | null = null
      for (let s = 0; s < n; s++) {
        const draw = pick(rng, ['search-new', 'search-repeat', 'doc', 'doc-repeat', 'parked', 'null'] as const)
        if (draw === 'search-new' || (draw === 'search-repeat' && searchPool.length === 0)) {
          const e = searchTab(`s${searchPool.length + 1}`, `alpha-${searchPool.length + 1}`)
          searchPool.push(e)
          const key = JSON.stringify(e)
          steps.push({ label: `mountTab(search ${e.id})`, entry: e, deduped: key === mountedKey, isSearch: true, docId: null })
          mountedKey = key
        } else if (draw === 'search-repeat') {
          const e = pick(rng, searchPool)
          const key = JSON.stringify(e)
          const deduped = key === mountedKey
          if (deduped) noDedupeCovered.counted += 1
          steps.push({ label: `mountTab(REPEAT search ${e.id})`, entry: e, deduped, isSearch: true, docId: null })
          mountedKey = key
        } else if (draw === 'doc' || (draw === 'doc-repeat' && lastDoc == null)) {
          const e = docTab(pick(rng, ['t1', 't2']), pick(rng, [DOC_A, DOC_B]))
          lastDoc = e
          const key = JSON.stringify(e)
          steps.push({ label: `mountTab(${e.id}/${e.target.kind === 'document' ? e.target.documentId : ''})`, entry: e, deduped: key === mountedKey, isSearch: false, docId: (e.target as { documentId: string }).documentId })
          mountedKey = key
        } else if (draw === 'doc-repeat') {
          const e = lastDoc
          const key = JSON.stringify(e)
          const deduped = key === mountedKey
          if (deduped) noDedupeCovered.counted += 1
          steps.push({ label: `mountTab(REPEAT ${e.id})`, entry: e, deduped, isSearch: false, docId: (e.target as { documentId: string }).documentId })
          mountedKey = key
        } else if (draw === 'parked') {
          const e = pick(rng, [graphTab('g1'), templateTab('tpl1'), landingTab('l1')])
          const key = JSON.stringify(e)
          steps.push({ label: `mountTab(parked ${e.id})`, entry: e, deduped: key === mountedKey, isSearch: false, docId: null })
          mountedKey = key
        } else {
          steps.push({ label: 'mountTab(null)', entry: null, deduped: false, isSearch: false, docId: null })
          mountedKey = null // §5.3.1: a null mount clears the de-dupe key
        }
      }

      // --- the settlement schedule: settle the pending queries after a seeded
      // --- PREFIX of the schedule (the interleaving), then the rest at the end.
      const cut = int(rng, 0, n)
      const issueSteps: number[] = []
      for (let s = 0; s < n; s++) if (steps[s].isSearch && !steps[s].deduped) issueSteps.push(s)
      if (issueSteps.length > 1 && cut > 0) interleavedCovered.counted += 1

      // model: each issued query is SUPERSEDED iff a later step happens after the
      // step count at which it settles.
      const settleAt = new Map<number, number>() // step index ⇒ the number of steps executed when it settled
      let pendingIssued = 0
      for (let s = 0; s < n; s++) {
        const step = steps[s]
        h.host.mountTab(step.entry)
        if (step.isSearch && !step.deduped) pendingIssued += 1
        if (s + 1 === cut) {
          // settle everything pending after this step, in a seeded order, with a
          // per-query outcome from the {resolve, reject} alphabet
          const order = shuffle(rng, Array.from({ length: pendingIssued }, (_, k) => k))
          for (const _k of order) {
            const outcome = pick(rng, ['resolve', 'reject'] as const)
            if (outcome === 'reject') rejectedCovered.counted += 1
            await h.settleAll(outcome)
          }
          const issuedSoFar: number[] = []
          for (let t = 0; t <= s; t++) if (steps[t].isSearch && !steps[t].deduped) issuedSoFar.push(t)
          for (const t of issuedSoFar) if (!settleAt.has(t)) settleAt.set(t, s + 1)
          pendingIssued = 0
        }
      }
      // settle the remainder (the newest attempts included)
      {
        const remaining: number[] = []
        for (let t = 0; t < n; t++) if (steps[t].isSearch && !steps[t].deduped && !settleAt.has(t)) remaining.push(t)
        const order = shuffle(rng, remaining)
        for (const _t of order) {
          const outcome = pick(rng, ['resolve', 'reject'] as const)
          if (outcome === 'reject') rejectedCovered.counted += 1
          await h.settleAll(outcome)
        }
        for (const t of remaining) settleAt.set(t, n)
      }

      // --- the model: a query settles after `settleAt` steps executed. It is
      // --- SUPERSEDED iff at least ONE mount attempt happened AFTER its own
      // --- (§5.3.1: the discard is decided at the SETTLE point — a settlement
      // --- that lands while its own attempt is still the newest APPLIES, and a
      // --- later step does not retroactively count it as a drop).
      const issuedModel = issueSteps.length
      const superseded = issueSteps.filter((t) => (settleAt.get(t) ?? n) > t + 1).length
      // the over-strength correction (§6's count identity is `drops ===
      // superseded`, NOT `drops === settlements`): a surviving settlement is not a
      // drop, so the two counts differ whenever a query settles while its own
      // attempt is still the newest.
      if (issuedModel > 0 && superseded < issuedModel) countDiscriminated.counted += 1
      const last = steps[n - 1]
      const drops = droppedCount(h.host)
      const census = censusOf(h)
      const seen = `schedule=[${steps.map((s) => s.label).join(' → ')}] cut=${cut} issued=${h.issued()} modelIssued=${issuedModel} superseded=${superseded} drops=${drops} stage=${stageTargetKind(h)} census(${census.line}) bodies=[${bodyDocIds(h).join(',')}]`

      // (a) §5.3.1 consequence 3 — the de-dupe is NOT a re-mount: an identical
      // repeat issues NO second query (the pin that makes `drops === settlements`
      // the wrong count; the surviving settlement is the LAST attempt's).
      if (h.issued() !== issuedModel) {
        return `issued-count: a de-duped identical re-mount must issue ONE query (${seen})`
      }

      // (b) THE COUNT IDENTITY (§5.3.1 consequence 2): one discard ⇒ one counted
      // drop — `drops === superseded`, NEVER `drops === settlements`.
      if (drops !== superseded) {
        return `drop-count: drops must equal the SUPERSEDED settlements (${seen})`
      }

      // (c) THE DOMINANCE CLAUSE (§6 P-IM-1): after EVERY promise settles the stage
      // body is the body of the LAST mountTab attempt — including a LAST attempt
      // that was de-duped (it is still the newest attempt, and §5.3.1 stamps a
      // generation at the ENTRY of every attempt).
      if (last.isSearch) {
        if (!stageSearchBody(h)) return `dominance: the LAST attempt is a search mount ⇒ its body must be applied (${seen})`
        if (documentRootCensus(h) !== 0) return `dominance: a search body must carry no document body root (${seen})`
        if (census.authored !== 0) return `dominance/§A.1.1: a search body authorises ZERO surfaces (${seen})`
      } else if (last.docId != null) {
        if (!bodyDocIds(h).includes(last.docId)) return `dominance: the LAST attempt's document body must be in the stage (${seen})`
        if (stageSearchBody(h)) return `dominance: a document body must not carry the search body (${seen})`
        if (census.markerIds.join(',') !== last.docId) return `dominance/§A.1.1: the surface must be the last attempt's document (${seen})`
      } else if (last.entry == null) {
        if (documentRootCensus(h) !== 0) return `dominance: mountTab(null) ⇒ no document body root (${seen})`
        if (stageSearchBody(h)) return `dominance: mountTab(null) ⇒ no search body (${seen})`
        if (census.authored !== 0) return `dominance/§A.1.1: mountTab(null) ⇒ ZERO surfaces (${seen})`
      } else {
        // a parked kind: its placeholder (never a document body / a surface)
        if (documentRootCensus(h) !== 0 && !bodyDocIds(h).includes('?')) {
          // a parked body carries no `data-rag-node-id` root at all
          return `dominance: a parked body must carry no document body root (${seen})`
        }
        if (census.authored !== 0) return `dominance/§A.1.1: a parked body authorises ZERO surfaces (${seen})`
      }
      return null
    })
    report(rep)
    // non-vacuity: the generator MUST have drawn the discriminating cases
    expect(noDedupeCovered.counted, 'P-IM-1 generator: a de-duped identical re-mount must be drawn (the count-identity pin)').toBeGreaterThan(0)
    expect(rejectedCovered.counted, 'P-IM-1 generator: the reject outcome must be drawn (§6 strategy: the {resolve, reject} alphabet)').toBeGreaterThan(0)
    expect(interleavedCovered.counted, 'P-IM-1 generator: an interleaved settlement (a query settling before a later mount) must be drawn').toBeGreaterThan(0)
    expect(
      countDiscriminated.counted,
      'P-IM-1 generator: a schedule where a SURVIVING settlement makes `drops !== settlements` must be drawn (the count identity is `drops === superseded`)',
    ).toBeGreaterThan(0)
  })
})

// ===========================================================================
// P-IM-2 — `strat:surface-census-by-active-kind` (60 attempts)
// ===========================================================================
function payloadNode(id: string, doc: string, text: string): unknown {
  return { type: 'p', content: text, props: { 'data-rag-node-id': id, 'data-doc': doc }, placement: { targetPlacement: ['main'] } }
}
function buildPayload(variant: string): unknown {
  const docA = [payloadNode(`${DOC_A}-head`, DOC_A, 'Doc A'), payloadNode(`${DOC_A}-body`, DOC_A, 'body A')]
  const docB = [payloadNode(`${DOC_B}-head`, DOC_B, 'Doc B')]
  const parked = [{ type: 'div', content: 'placeholder', props: { id: 'stage-placeholder-graph', 'data-stage': 'placeholder' }, placement: { targetPlacement: ['main'] } }]
  const landing = [{ type: 'div', content: 'landing', props: { id: 'stage-landing', 'data-stage': 'landing' }, placement: { targetPlacement: ['main'] } }]
  const search = [{ type: 'div', content: 'results', props: { id: 'stage-search-tab' }, placement: { targetPlacement: ['main'] } }]
  const content =
    variant === 'mixed' ? [{ content: docA }, { content: docB }]
      : variant === 'doc-b' ? [{ content: docB }]
        : variant === 'parked' ? [{ content: parked }]
          : variant === 'landing' ? [{ content: landing }]
            : variant === 'search' ? [{ content: search }]
              : [{ content: docA }]
  return { template: DEFAULT_CONTENT_WINDOW_TEMPLATE, content, clientConfig: { runInstantiation: true, runRendering: true } }
}
/** Every `data-edit-surface` marker + every body root inside the surface's OWN
 *  subtree, over the whole assembled envelope. The walk descends BOTH the
 *  `children` edge AND the `content` edge (a payload's nodes hang off `content`;
 *  a children-only walk under-counts and reports a vacuous `[]`). */
function envelopeCensus(env: unknown): { markers: string[]; surfaceRoots: string[] } {
  const markers: string[] = []
  const surfaceRoots: string[] = []
  const collectRoots = (nd: unknown, out: string[]): void => {
    walkNodes(nd, (node) => {
      const v = node.props?.['data-rag-node-id']
      if (typeof v === 'string') out.push(v)
    })
  }
  const seen = new Set<unknown>()
  walkNodes(env, (node) => {
    const m = node.props?.[DATA_EDIT_SURFACE]
    if (typeof m === 'string' && !seen.has(node)) {
      seen.add(node)
      markers.push(m)
      const out: string[] = []
      if (Array.isArray(node.children)) for (const c of node.children) collectRoots(c, out)
      // the surface's own payload/children edges (a single-node payload object too)
      if (!Array.isArray((node as { content?: unknown }).content)) collectRoots((node as { content?: unknown }).content, out)
      surfaceRoots.push(...out)
    }
  })
  return { markers, surfaceRoots }
}
/** A total walk over the envelope's node edges: `children` (arrays), `content`
 *  (arrays or a single node) and the payload wrappers holding either. */
function walkNodes(nd: unknown, onNode: (node: { props?: Record<string, unknown>; children?: unknown; content?: unknown }) => void): void {
  if (nd == null) return
  if (Array.isArray(nd)) {
    for (const c of nd) walkNodes(c, onNode)
    return
  }
  if (typeof nd !== 'object') return
  const node = nd as { props?: Record<string, unknown>; children?: unknown; content?: unknown }
  onNode(node)
  if (Array.isArray(node.children)) for (const c of node.children) walkNodes(c, onNode)
  if (Array.isArray(node.content)) for (const c of node.content) walkNodes(c, onNode)
  else if (node.content != null && typeof node.content === 'object') walkNodes(node.content, onNode)
}

describe('§6 `P-IM-2` — the surface is authored from the ACTIVE DOCUMENT, totally (the envelope leg + the live census by active kind)', () => {
  it('P-IM-2 [strat:surface-census-by-active-kind] [BROKEN at HEAD: a MIXED-document payload puts a FOREIGN document\'s body root inside the surface authored for the active document]', async () => {
    const mixedCovered = { counted: 0 }
    const kindsCovered = new Set<string>()
    const rep = await runProperty('P-IM-2', 'strat:surface-census-by-active-kind', PBT_BUDGET['P-IM-2'], async (_i, rng) => {
      // §6's `k` union is EXACTLY the five members; the boot/no-tab seam (which
      // violates the same census) is owned by `P-SM-1`'s seam schedule and by the
      // unit's H-3 contract-hole row, and is deliberately not drawn here so this
      // row's `k` set stays the register's.
      const kind = pick(rng, ['document', 'search', 'graph', 'template', 'other'] as const)
      kindsCovered.add(kind)
      const documentId = pick(rng, [DOC_A, DOC_B])
      // generator constraint 1 (header note 1): a `document` kind is paired only
      // with a payload that carries document body roots.
      const variant =
        kind === 'document'
          ? pick(rng, ['doc-a', 'doc-b', 'mixed'] as const)
          : pick(rng, ['doc-a', 'doc-b', 'mixed', 'parked', 'landing', 'search', 'empty'] as const)
      if (variant === 'mixed') mixedCovered.counted += 1

      // ---- leg A — the ENVELOPE layer (§6: "the one row assertable at the
      // envelope layer"): `documentId` is the ACTIVE DOCUMENT or undefined.
      const registry = createPaneRegistry()
      const assembled = assembleAppGraphEnvelope({
        traversalEnvelope: buildPayload(variant) as never,
        registry,
        ctx: { enabledPanes: [], docHeads: [], currentDocumentId: null, currentNodeId: null } as never,
        documentId: kind === 'document' ? documentId : undefined,
      })
      const env = envelopeCensus(assembled.envelope)
      const expectSurfaces = kind === 'document' ? 1 : 0
      const seenEnv = `kind=${kind} variant=${variant} documentId=${kind === 'document' ? documentId : 'undefined'} envelopeMarkers=[${env.markers.join(',')}] surfaceRoots=[${env.surfaceRoots.join(',')}]`
      if (env.markers.length !== expectSurfaces) {
        return `envelope-census: exactly ${expectSurfaces} surface(s) iff a document is focused (${seenEnv})`
      }
      if (expectSurfaces === 1) {
        if (env.markers[0] !== documentId) return `envelope-identity: the surface's marker must be the ACTIVE document (${seenEnv})`
        // §5.3.3 sub-rule 1 / FS-2's envelope twin: the surface may not adopt a
        // FOREIGN document's body root (the MIXED payload case).
        const foreign = env.surfaceRoots.filter((r) => !(r === documentId || r.startsWith(`${documentId}-`)))
        if (foreign.length > 0) {
          return `foreign-body-root: the surface adopted another document's root(s) [${foreign.join(',')}] while focused on ${documentId} (${seenEnv})`
        }
      }

      // ---- leg B — the HOST: the live census keyed by the ACTIVE TAB.
      const h = await boot(makeHarness())
      if (kind === 'document') h.host.mountTab(docTab('t1', documentId))
      else if (kind === 'search') {
        h.host.mountTab(searchTab('s1', 'alpha'))
        await flush()
      } else if (kind === 'graph') h.host.mountTab(graphTab('g1'))
      else if (kind === 'template') h.host.mountTab(templateTab('tpl1'))
      else if (kind === 'other') h.host.mountTab(landingTab('l1'))

      const tabId = activeTabId(h.host)
      const liveKind = activeKind(h.host)
      const liveDoc = activeDocId(h.host)
      const documentTabActive = tabId !== null && liveKind === 'document'
      const census = censusOf(h)
      const seenHost = `kind=${kind} tab=${tabId} activeKind=${liveKind} activeDoc=${liveDoc} census(${census.line}) bodies=[${bodyDocIds(h).join(',')}]`
      if (!census.agrees) return `discriminators: the authored id and the marker must agree (${seenHost})`
      if (census.authored !== (documentTabActive ? 1 : 0)) {
        return `live-census/§A.1.1 I2-R: census === 1 iff a DOCUMENT TAB is active, else 0 (${seenHost})`
      }
      if (documentTabActive && census.markerIds.join(',') !== liveDoc) {
        return `live-identity: the surface's marker must be the ACTIVE document id (${seenHost})`
      }
      if (!documentTabActive && documentRootCensus(h) !== 0) {
        return `live-bodies/§5.1 I2 clause 3: no document body root off a document tab (${seenHost})`
      }
      return null
    })
    report(rep)
    expect(mixedCovered.counted, 'P-IM-2 generator: the MIXED-document envelope must be drawn (the audit\'s owed case)').toBeGreaterThan(0)
    for (const k of ['document', 'search', 'graph', 'template', 'other']) {
      expect(kindsCovered.has(k), `P-IM-2 generator: the kind "${k}" must be drawn (§6: every member of the union)`).toBe(true)
    }
  })
})

// ===========================================================================
// P-IM-3 — `strat:subject-is-tab-id` (60 attempts)
// ===========================================================================
describe('§6 `P-IM-3` — ownership-subject totality through the PUBLIC page seam (never a private-method cast)', () => {
  it('P-IM-3 [strat:subject-is-tab-id] — for every reachable tab set the dirty subject is getActiveTabId(), else PAGE_EDIT_SURFACE_ID: never a document id, never empty', async () => {
    const noTabCovered = { counted: 0 }
    const dirtyCovered = { counted: 0 }
    const rep = await runProperty('P-IM-3', 'strat:subject-is-tab-id', PBT_BUDGET['P-IM-3'], async (_i, rng) => {
      const h = await boot(makeHarness())
      // generator constraint 2 (header note 2): tab ids are drawn from a pool
      // DISJOINT from the document ids, so "never a document id" is satisfiable.
      const tabEntries = [
        docTab('t1', DOC_A),
        docTab('t2', DOC_B),
        searchTab('s1', 'alpha'),
        graphTab('g1'),
        templateTab('tpl1'),
        landingTab('l1'),
      ]
      const size = int(rng, 0, 2)
      const set = shuffle(rng, tabEntries).slice(0, size)
      const ids = ['t1', 't2', 's1', 'g1', 'tpl1', 'l1']
      for (const e of set) h.host.mountTab(e)
      await flush()
      const nullMount = pick(rng, [true, false])
      if (nullMount || set.length === 0) {
        h.host.mountTab(null)
        noTabCovered.counted += 1
      }

      // THE PUBLIC SEAM: which candidate key became dirty? (the subject is the
      // page seam's key, observed through `markDirty` — no private reader.)
      const candidates = [PAGE_EDIT_SURFACE_ID, ...ids, DOC_A, DOC_B]
      for (const k of candidates) h.editController.clearDirty(k)
      const before = candidates.filter((k) => h.editController.isDirty(k))
      pageInput()
      const after = candidates.filter((k) => h.editController.isDirty(k))
      const delta = after.filter((k) => !before.includes(k))
      for (const k of candidates) h.editController.clearDirty(k)
      const tabId = activeTabId(h.host)
      const expected = tabId ?? PAGE_EDIT_SURFACE_ID
      const seen = `set=[${set.map((e) => e.id).join(',')}] nullMount=${nullMount || set.length === 0} activeTabId=${tabId} delta=[${delta.join(',')}] expected=${expected}`
      if (delta.length !== 1) return `subject-not-observed: exactly ONE key must become dirty (${seen})`
      dirtyCovered.counted += 1
      const subject = delta[0]
      if (typeof subject !== 'string' || subject.length === 0) return `subject-totality: the subject is a NON-EMPTY string (${seen})`
      if (subject === DOC_A || subject === DOC_B) return `subject-is-document-id/FS-4: the subject must never be a document id (${seen})`
      if (subject !== expected) return `subject-identity/§5.1 I1 clause 1: subject === getActiveTabId() ?? PAGE_EDIT_SURFACE_ID (${seen})`
      // the blur seam is total too (never a throw); it is a no-op unless the
      // subject is dirty, so drive it from a clean state.
      try {
        await pageBlur('')
      } catch (e) {
        return `blur-totality: pageSurfaceBlur must never throw (${seen}) — ${(e as Error).message}`
      }
      return null
    })
    report(rep)
    expect(noTabCovered.counted, 'P-IM-3 generator: the NO-TAB state must be drawn (§5.4 state 19 + the §5.2 fallback)').toBeGreaterThan(0)
    expect(dirtyCovered.counted, 'P-IM-3 generator: the public seam must have marked a subject (non-vacuity)').toBeGreaterThan(0)
  })
})

// ===========================================================================
// P-IM-4 — `strat:page-subject-document-total` (62 attempts)
// ===========================================================================
describe('§6 `P-IM-4` — `pageSubjectDocument` is total and stale-proof (the host-wired path + every hook-return class)', () => {
  it('P-IM-4 [strat:page-subject-document-total] — the host hook answers activeDocumentId iff subject === activeTabId on a document tab, the controller is total over {string|null|\'\'|number|object} answers, and a caret is never restored against a foreign document', async () => {
    const junkCovered = { counted: 0 }
    const hostWiredCovered = { counted: 0 }
    const rep = await runProperty('P-IM-4', 'strat:page-subject-document-total', PBT_BUDGET['P-IM-4'], async (_i, rng) => {
      // ---- leg 1 — the HOST-WIRED hook (the shipped seam, §5.3.2 "Host side").
      const h = await boot(makeHarness())
      const kind = pick(rng, ['document', 'search', 'graph'] as const)
      if (kind === 'document') h.host.mountTab(docTab('t1', DOC_A))
      else if (kind === 'search') h.host.mountTab(searchTab('s1', 'alpha'))
      else h.host.mountTab(graphTab('g1'))
      await flush()
      const tabId = activeTabId(h.host)
      const docId = activeDocId(h.host)
      const caretKind = pick(rng, ['page', 'node'] as const)
      const subject = pick(rng, [tabId ?? '', 't1', 't2', DOC_A, DOC_B, '', ' ', '__proto__', 'hasOwnProperty', 'ghost-tab'])
      const caret = { ...PAGE_CARET, ragId: caretKind === 'page' ? PAGE_EDIT_SURFACE_ID : 'per-node-root' }
      // ⟨§A.3.2 RULING C2⟩ the liveness conjunct is the SEPARATE carrier `isDocumentLive(docId)`
      // (a document id is never a `backRefs` key — the seed is deleted).
      const expectedRestore =
        subject === tabId && tabId !== null && kind === 'document' && docId != null && documentLive(h.host, docId) && caretKind === 'page'
      h.editController.saveCaret(subject, caret as never)
      let out: unknown
      try {
        out = h.editController.restoreCaret(subject)
      } catch (e) {
        return `host-wired totality: restoreCaret must never throw — ${(e as Error).message}`
      }
      const got = out !== undefined
      const seen1 = `kind=${kind} tab=${tabId} doc=${docId} subject=${JSON.stringify(subject)} caretKind=${caretKind} restored=${got} expected=${expectedRestore}`
      if (got !== expectedRestore) {
        return `host-wired rule/§5.3.2: restored iff (subject === activeTabId ∧ the active target is a document ∧ its document is live ∧ the caret is page-scoped) (${seen1})`
      }
      if (subject !== tabId && got) return `stale-proof: a NON-active subject must never resolve to a document (${seen1})`
      if (tabId !== null && kind === 'document') hostWiredCovered.counted += 1

      // ---- leg 2 — the CONTROLLER-LEVEL totality over the {string|null|''|number
      // |object} answer classes (a foreign/older controller's hook). ⟨§A.3.2 RULING C2⟩: both legs
      // are expressed through the SEPARATE carrier `isDocumentLive` (injected here), never through
      // `backRefs.has(answer)` — `backRefs` may not carry a document id at all.
      const answer = pick(rng, [docId ?? DOC_A, null, '', 42, {}, ['x'], undefined, 'ghost-doc'] as unknown[])
      const answerIsLive = typeof answer === 'string' && answer !== '' && documentLive(h.host, answer)
      if (!answerIsLive) junkCovered.counted += 1
      const controller = createEditController({
        backRefs: h.backRefs,
        commit: async () => ({ ok: true, nodeId: 'x' }),
        onRebuild: vi.fn(),
        pageSubjectDocument: () => answer as string | null,
        isDocumentLive: (documentId: string) => documentLive(h.host, documentId),
      } as never)
      controller.saveCaret(subject, caret as never)
      let out2: unknown
      try {
        out2 = controller.restoreCaret(subject)
      } catch (e) {
        return `controller totality/P-IM-4: restoreCaret must never throw — ${(e as Error).message}`
      }
      const expected2 = answerIsLive && caretKind === 'page'
      const seen2 = `answer=${JSON.stringify(answer)} subject=${JSON.stringify(subject)} caretKind=${caretKind} restored=${out2 !== undefined} expected=${expected2}`
      if ((out2 !== undefined) !== expected2) {
        return `controller rule/§5.3.2: a non-string/empty/absent answer is NO live document (cleared), a live string answer with a page caret restores (${seen2})`
      }

      // ---- leg 3 — §A.1.4's consultation set: once per read WITH a saved caret,
      // in read order; a caret-less read NEVER consults.
      const calls: string[] = []
      const consulted = createEditController({
        backRefs: h.backRefs,
        commit: async () => ({ ok: true, nodeId: 'x' }),
        onRebuild: vi.fn(),
        pageSubjectDocument: (s: string) => {
          calls.push(s)
          return null
        },
      } as never)
      if (consulted.restoreCaret('caret-less-subject') !== undefined) return 'A.1.4 clause 1: a caret-less read returns undefined'
      if (calls.length !== 0) return `A.1.4 clause 1: a caret-less read must NOT consult the hook (calls=[${calls.join(',')}])`
      const subjects = shuffle(rng, ['t1', 't2', DOC_A, 'ghost-tab']).slice(0, 2)
      for (const s of subjects) consulted.saveCaret(s, caret as never)
      for (const s of subjects) if (consulted.restoreCaret(s) !== undefined) return `A.1.4: the hook's null answer must clear the caret (subject=${s})`
      if (calls.join(',') !== subjects.join(',')) {
        return `A.1.4: the consultation set is exactly the saved-caret reads, once per read, in read order (calls=[${calls.join(',')}] reads=[${subjects.join(',')}])`
      }
      return null
    })
    report(rep)
    expect(junkCovered.counted, 'P-IM-4 generator: a non-string/null/empty/foreign hook answer must be drawn (§6 strategy)').toBeGreaterThan(0)
    expect(hostWiredCovered.counted, 'P-IM-4 generator: the host-wired path on a document tab must be drawn').toBeGreaterThan(0)
  })
})

// ===========================================================================
// P-SM-1 — `strat:stage-seam-schedule-single-active` (66 attempts)
// ===========================================================================
/** ⟨SUPERVISOR ADJUDICATION — the `bodies` clause, STATE-BASED⟩ `openSetLive` is the step's STATE:
 *  the OPEN SET is open (two document tabs mounted, and NO `mountTab(...)` since — a `mountTab`
 *  collapses the set to one, which §A.3.1 clause (b)/(c) pin to a single body). The generator sets it
 *  from the SCHEDULE alone, never from the measured value, so no assertion can be satisfied by the
 *  value it grades; `checkStep`'s clause (4) reads it (with the host's `isPreTabState()`) to pick the
 *  admissible body SET:
 *    • OPEN SET (`openSetLive`): `mountTabs(openSet)`, `start:openset`, and every non-`mountTab` seam
 *      drawn while the set is still open — `reDerive('content'|'operator'|'template')`, `refresh()`,
 *      `rerenderAppGraph()` (the 9b pins §3.3/§3.9 show both bodies surviving) and the pane-additive
 *      reconcile — admit EXACTLY the open set, as a SET.
 *    • PRE-TAB (the host's `isPreTabState()`, whether the step IS the `start:boot` step or a
 *      re-author/reconcile seam drawn before any tab state was handed) admits EXACTLY
 *      `[getPreTabDocumentId()]`; every other state admits `[activeDocumentId]` (state `S`) or `[]`
 *      (states `E`/`N`/`OH`). */
type StepExpectation = { label: string; multi: boolean; openIds: readonly string[]; preTab?: boolean; predicate?: boolean; openSetLive?: boolean }
/** ⟨SUPERVISOR ADJUDICATION — clause (2) `mountedDocumentIds`, STATE-BASED⟩ the P-SM-1 SEAMS that
 *  re-author / reconcile the stage WITHOUT mounting a tab. Clause (c)'s value is STATE-DEPENDENT there,
 *  so clause (2) is the state predicate (`mountedClauseViolation`) and NOT a single-value expectation.
 *  These five are the drawn seams that mount no tab; the sixth predicate case is not a seam at all but a
 *  STATE (`openSetLive` — the pane-additive reconcile and the re-author seams drawn while the 9b open set
 *  is still open), which `checkStep` derives from the schedule. The steps that KEEP a single-value
 *  expectation are the ones where §A.3.1 pins one:
 *    • every `mountTab(doc-a|doc-b|search|graph|template|landing|null)` — a tab was just mounted:
 *      `[activeDocumentId]` for a document tab (state `S`), `[]` for a non-document/null tab (state `E`).
 *    • `mountTabs(openSet)` and `start:openset` — clause (c)'s multi arm: the open set (state `OA`).
 *    • `start:boot` — the ⟨§A.3.1 C1⟩ PRE-TAB carve-out, whose clause (c) value is
 *      `[getPreTabDocumentId(s)]` (state `PRE`, read through `preTab: true`). */
const PREDICATE_SEAMS: ReadonlySet<string> = new Set([
  "reDerive('content')",
  "reDerive('operator')",
  "reDerive('template')",
  'refresh()',
  'rerenderAppGraph()',
])
/** The per-step check: the settled-seam equality with an EXPLICIT
 *  `mountedDocumentIds` expectation (§6 P-SM-1 + §A.1.1's TOTAL census).
 *  ⟨§A.3.1 RULING C1⟩ `preTab: true` marks the ONE state where the strict active-tab predicate does
 *  not bind: the BOOT draw, before any `mountTab`/`mountTabs` — there `stageOwner(s)` is
 *  `('pre-tab', getPreTabDocumentId(s))`, so the census/bodies/`mountedDocumentIds` read that
 *  document. Every OTHER start and EVERY step keeps the strict clauses (in particular
 *  `mountTabs(openSet)` with no active entry stays `0`).
 *
 *  ⟨SUPERVISOR ADJUDICATION — §A.3.1 clause (c), STATE-BASED⟩ `openIds` is the step's ADMISSIBLE OPEN
 *  SET, and clause (2) is applied as ONE state predicate (`mountedClauseViolation`), whose state is read
 *  from the SCHEDULE — never from the graded value:
 *    • `preTab: true` (`start:boot`) — the PRE-TAB carve-out: EXACTLY `[getPreTabDocumentId()]`.
 *    • `openSetLive: true` — the OPEN-SET state (two document tabs open): `mountTabs(openSet)`, its
 *      `start:openset`, and EVERY step drawn while it is still live (the re-author/reconcile seams and
 *      the pane-additive reconcile — none of which mounts a tab, so the open set survives them). There
 *      the admitted value is the open set (state `O`, when no document tab is active — §A.3.1 H-3) or a
 *      non-empty SUBSET of it containing the active document (state `OA`, when one is).
 *    • `predicate: true` (a re-author/reconcile seam that mounts NO tab) — the same predicate, the open
 *      set those steps may legitimately leave mounted.
 *    • EVERY other step — the clause's single-value states: state `S` (`[activeDocumentId]` for the
 *      `mountTab(...)` step that left one document tab active) or state `E` (`[]` — clause (d)'s strict
 *      arm, for a non-document/`null` tab and a no-tab start).
 *  The predicate stays DISCRIMINATING in every state: a foreign/stale document id, a non-empty set in a
 *  state that admits only `[]` (state `E`), an EMPTY/undeclared read where the state admits a non-empty
 *  value (states `S`/`O`/`OA`), and a set missing the active document are each a returned counterexample.
 *
 *  ⟨SUPERVISOR ADJUDICATION — the `bodies` clause (clause (4) below)⟩ its strength is the step's
 *  STATE too, read from the same schedule flag (`exp.openSetLive`) plus the host's `isPreTabState()`
 *  — see `bodyClauseViolation`. Clause (2) above and the SURFACE census (clause (3)) keep their own
 *  strengths and are NOT relaxed by it. */
function checkStep(h: Harness, exp: StepExpectation, gradedBodyStates?: Set<string>): string | null {
  const tabId = activeTabId(h.host)
  const kind = activeKind(h.host)
  const docId = activeDocId(h.host)
  const documentTabActive = tabId !== null && kind === 'document'
  const census = censusOf(h)
  const bodies = bodyDocIds(h)
  const preTab = exp.preTab === true
  const preTabDoc = preTab ? preTabDocumentId(h.host) : null
  // ⟨SUPERVISOR ADJUDICATION — the `bodies` clause, STATE-BASED⟩ the clause-(4) STATE, read from the
  // SCHEDULE + the HOST's OWN declaration (`isPreTabState()`, MONOTONIC) and NEVER from the graded
  // body read: `exp.openSetLive` is the drawn seam's own open-set flag (`true` at `mountTabs(openSet)`
  // and at every non-`mountTab` seam drawn while the open set is still open, `false` once a
  // `mountTab(...)` collapses it), and `isPreTabState()` is the host's pre-tab declaration — so a step
  // drawn BEFORE any tab state was handed is the PRE-TAB state even when it is a re-author/reconcile
  // seam (`start:boot` → `reDerive(...)`), exactly as §A.3.1 clauses (a)/(b) require.
  const hostPreTabState = preTabState(h.host)
  const hostPreTabDoc = hostPreTabState ? preTabDocumentId(h.host) : null
  const bodyOpenSet = new Set<string>(exp.openSetLive === true ? exp.openIds : [])
  const bodySchedule = {
    // the tab-document arm takes precedence (the §A.3.1 `stageOwner` disjunction order); pre-tab and
    // a document tab are in any case mutually exclusive by `isPreTabState()`'s monotonicity.
    preTab: hostPreTabState && !documentTabActive,
    openSetLive: exp.openSetLive === true && bodyOpenSet.size > 0,
    preTabDocumentId: hostPreTabState ? hostPreTabDoc : null,
  }
  const bodyState = bodyStateKind(documentTabActive, tabId, bodySchedule)
  // ⟨adjudication⟩ NON-VACUITY at the ROW level: the caller records the state clause (4) actually
  // GRADED and asserts each of §A.3.1's four state classes was graded at least once — a row that never
  // reaches the PRE-TAB state (or the open set, or the strict empty state) cannot claim to grade it.
  gradedBodyStates?.add(bodyState)
  // ⟨§A.3.1 clause (a)/(g)⟩ the pre-tab owner: the pre-tab document, or `null` at a true
  // empty-store/landing boot (where the census is `0` and `('none', null)` holds).
  const owner = documentTabActive ? docId : preTab ? preTabDoc : null
  const seen = `step="${exp.label}" tab=${tabId} kind=${kind} doc=${docId} mounted=[${mountedIds(h.host).join(',')}] census(${census.line}) bodies=[${bodies.join(',')}] stage=${stageTargetKind(h)} multi=${exp.multi} preTab=${preTab} preTabDoc=${preTabDoc} hostPreTab=${hostPreTabState} hostPreTabDoc=${hostPreTabDoc} bodyState=${bodyState} openSetLive=${exp.openSetLive === true} openSet={${[...bodyOpenSet].join(',')}}`
  // (1) the identity triple is ONE identity
  if (tabId === null && (kind !== null || docId !== null)) {
    return `identity-triple: no active tab ⇒ activeTargetKind AND activeDocumentId are null (never a stale mirror) (${seen})`
  }
  if (kind === 'document' && docId == null) return `identity-triple: a document target carries its documentId (${seen})`
  if (kind !== 'document' && kind !== null && docId !== null) return `identity-triple: a non-document target ⇒ activeDocumentId null (${seen})`
  // (1b) ⟨§A.3.1⟩ the pre-tab state is the state it claims to be (the identity triple above is
  // already asserted null there — no document tab owns a page in the pre-tab state).
  if (preTab && !hostPreTabState) {
    return `pre-tab/§A.3.1: the drawn BOOT state must BE the pre-tab state (no tab state handed) (${seen})`
  }
  // (2) `mountedDocumentIds` — ⟨SUPERVISOR ADJUDICATION, STATE-BASED⟩ §A.3.1 clause (c)'s value is
  // STATE-DEPENDENT, so clause (2) is the state predicate (`mountedClauseViolation`) in EVERY state
  // where §A.3.1 does not pin one value, and EXACT only where it does:
  //   • PRE (`start:boot`, `preTab: true`): EXACTLY `[getPreTabDocumentId()]` — the carve-out value.
  //   • S (a `mountTab(...)` step that left ONE document tab active, open set collapsed): EXACTLY
  //     `[activeDocumentId]` — must be non-empty and must CONTAIN the active document.
  //   • E (`mountTab(null)`, a non-document tab, a no-tab start, and any no-tab step with NO open set):
  //     `[]` ONLY (clause (d)'s strict arm).
  //   • O (open set LIVE, NO active document tab — a pane-additive flip mounts no tab): the OPEN SET
  //     (§A.3.1 H-3: the open set's body is required present there). `[]` is a violation, so the
  //     `mounted=[] expected []` and `mounted=[doc-a|doc-b] expected [doc-a]` arms are gone.
  //   • OA (open set LIVE, one document tab active — the multi seam and the re-author/reconcile seams
  //     it leaves live): a NON-EMPTY SUBSET of the open set containing the active document.
  // THE STATE COMES FROM THE SCHEDULE (`exp.preTab`/`exp.openSetLive` and the host's `isPreTabState()`),
  // and `activeDocumentId`/`documentTabActive` are read from the host's OWN declared readers, as §A.3.1
  // clause (c)'s wording ("`[stageOwner(s).id]`") requires — never from `mounted`, the graded value.
  // The non-vacuity guard lives in `mountedIds` (a non-array/`undefined` read is REPORTED as an
  // incoherent read, never a pass).
  const mounted = mountedIds(h.host)
  const openSetAdmissible = new Set<string>(exp.openIds)
  // the LIVE open set is the schedule's open-set state intersected with the ids the step declares
  // admissible — `openIds` is widened to `[DOC_A, DOC_B]` for the predicate/multi/open-set steps and is
  // empty elsewhere, so the intersection is exactly "the open set the step may legitimately leave".
  const openSetLiveForClause2 = exp.openSetLive === true || exp.predicate === true || exp.multi
  const liveOpenSet = new Set<string>(openSetLiveForClause2 ? [...openSetAdmissible] : [])
  const scheduleState = {
    preTab: exp.preTab === true && preTabState(h.host),
    openSetLive: openSetLiveForClause2 && liveOpenSet.size > 0,
    preTabDocumentId: exp.preTab === true ? preTabDoc : null,
  }
  // ⟨adjudication⟩ the PREDICATE arm covers every state clause (c) admits more than one value for:
  // the re-author/reconcile seams that mount NO tab, and EVERY step drawn while the open set is LIVE
  // (a pane-additive flip mounts no tab, so the open set survives it — the measured
  // `mounted=[doc-a,doc-b] tab=null` reading).
  const predicateArm = exp.predicate === true || scheduleState.openSetLive
  if (predicateArm) {
    const violation = mountedClauseViolation(mounted, docId, documentTabActive, liveOpenSet, tabId, scheduleState)
    if (violation !== null) return `${violation} (${seen})`
  } else if (exp.multi) {
    // the `mountTabs` seam: clause (c)'s multi arm pins the OPEN SET itself (as a SET — §A.4.3: the
    // DOM attach ORDER is not contract; `mountedDocumentIds`' OWN order is, src/renderer/sidebar-panes.ts:1150).
    const got = [...mounted].sort()
    const want = [...exp.openIds].sort()
    if (got.join(',') !== want.join(',')) {
      return `mountedDocumentIds: expected the open set {${want.join(',')}} (${seen})`
    }
  } else if (owner !== null) {
    if (mounted.join(',') !== owner) return `mountedDocumentIds: expected [${owner}] (${seen})`
  } else if (mounted.length !== 0) {
    return `mountedDocumentIds: expected [] (${seen})`
  }
  // (3) the census is TOTAL (§A.1.1 I2-R) by BOTH discriminators.
  if (!census.agrees) return `discriminators: the authored id and the marker must agree (${seen})`
  if (census.authored !== (owner !== null ? 1 : 0)) {
    return `census/§A.1.1+§A.3.1: 1 iff a DOCUMENT TAB is active, else 1 iff the ⟨§A.3.1⟩ PRE-TAB carve-out owns the stage with a known document, else 0 (${seen})`
  }
  if (owner !== null && census.markerIds.join(',') !== owner) return `census-identity: the marker IS the stage owner's document id (${seen})`
  // (4) the BODY clause (§6 P-SM-1 + §A.1.3's coexistence carve-out + ⟨SUPERVISOR ADJUDICATION — the
  // `bodies` clause, STATE-BASED⟩) — `bodyClauseViolation`, the STATE predicate over §A.3.1 clause
  // (b)'s disjunction, exactly as clause (2) is the state predicate over clause (c)'s. The state is
  // read from the SCHEDULE (`exp.openSetLive` — the drawn seam's own open-set flag: `true` at
  // `mountTabs(openSet)`/`start:openset` and at every non-`mountTab` seam drawn while the set is still
  // open, `false` once a `mountTab(...)` collapses it) and from the HOST's OWN `isPreTabState()`
  // (MONOTONIC — a step drawn before ANY tab state was handed is the PRE-TAB state even when it is a
  // re-author/reconcile seam), NEVER from `bodies` (the graded value), so no read can satisfy the
  // clause by naming the state it is graded in. The seven states and their admissible values are
  // documented on `bodyClauseViolation`; the two the previous single-value form mis-graded are:
  //   • PRE — a step after `start:boot` (the host has handed no tab state) REQUIRES the pre-tab
  //     document's body (§A.3.1 clauses (a)/(b)); demanding `[]` there was the over-strength the
  //     measured counterexample `tab=null doc=null bodies=[doc-a]` exposed.
  //   • O — the open set LIVE with NO active entry REQUIRES the open set's bodies as a SET (§A.3.1
  //     H-3 + §A.1.3; §A.4.3 D3: the DOM order of coexisting bodies is NOT contract).
  // The SURFACE census (clause (3) above) keeps its own strength and is NOT relaxed here.
  const bodyViolation = bodyClauseViolation(bodies, docId, documentTabActive, bodyOpenSet, tabId, bodySchedule)
  if (bodyViolation !== null) return `${bodyViolation} (${seen})`
  return null
}

describe('§6 `P-SM-1` — single-active is preserved by every stage seam, with `mountedDocumentIds` and the census explicit at every step', () => {
  it('P-SM-1 [strat:stage-seam-schedule-single-active] [RED: clauses (2) `mountedDocumentIds` and (4) `bodies` are STATE predicates (§A.3.1 (b)/(c)/(d) — the state read from the SCHEDULE + the host\'s `isPreTabState()`, never from the graded value). Clause (4) is now STATE-BASED: the PRE-TAB state (a step drawn before ANY tab state was handed — `start:boot` and every re-author/reconcile seam after it, where the host stays pre-tab) admits EXACTLY `[getPreTabDocumentId()]` (§A.3.1 (a)/(b)); the LIVE open set admits its members as a SET (§A.1.3 + §A.4.3 D3 — the DOM order is NOT contract); the single-document state admits EXACTLY `[activeDocumentId]`; and only the true `kind === \'none\' && !isPreTabState()` state admits `[]`. Residual reds at HEAD: (a) PRODUCTION — a pane-additive reconcile (a pane flip) EMPTIES the stage (`census 0` / `bodies []` while a document tab owns it, and `mountTabs(openSet)` after such a flip), and the subsequent de-duped `mountTab(sameEntry)` cannot restore it (§A.1.1 I2-R / §A.3.1 (a)/(b)/(d)); (b) TEST-side over-strength in clauses (2)/(3) — out of this pass\'s scope and NOT relaxed here: they grade a `predicate` seam as the open set LIVE even where the schedule opened none, and the PRE-TAB state as owner-less.]', async () => {
    const seamCovered = new Set<string>()
    // ⟨adjudication⟩ NON-VACUITY (the row level): every body-clause state §A.3.1 pins must have been
    // GRADED at least once — recorded by `checkStep` from the same schedule derivation the clause uses.
    const bodyStatesGraded = new Set<string>()
    const rep = await runProperty('P-SM-1', 'strat:stage-seam-schedule-single-active', PBT_BUDGET['P-SM-1'], async (_i, rng) => {
      const h = await boot(makeHarness())
      const openSet = [docTab('t1', DOC_A), docTab('t2', DOC_B)]
      // the STARTING state is drawn — including the `boot` seam (§A.1.1 lists it,
      // and it is the pre-`mountTab` state the production renderer really has).
      const start = pick(rng, ['boot', 'doc-a', 'doc-b', 'search', 'landing', 'openset'] as const)
      if (start === 'doc-a') h.host.mountTab(docTab('t1', DOC_A))
      else if (start === 'doc-b') h.host.mountTab(docTab('t2', DOC_B))
      else if (start === 'search') {
        h.host.mountTab(searchTab('s1', 'alpha'))
        await flush()
      } else if (start === 'landing') h.host.mountTab(landingTab('l1'))
      else if (start === 'openset') {
        h.host.mountTab(docTab('t1', DOC_A))
        h.host.mountTabs(openSet)
      }
      const startExpect: StepExpectation =
        start === 'openset'
          ? { label: `start:${start}`, multi: true, openIds: [DOC_A, DOC_B], openSetLive: true }
          : start === 'boot'
            ? // ⟨§A.3.1 RULING C1⟩ the BOOT draw is the PRE-TAB CARVE-OUT: `stageOwner(s)` is
              // `('pre-tab', getPreTabDocumentId(s))` — census 1 with that marker, that document's
              // body, `mountedDocumentIds` that document, and the identity triple still all-null.
              // The strict clause binds from the FIRST `mountTab`/`mountTabs` onward. CLAUSE (2) STAYS
              // EXACT here (§A.3.1 clause (c) pins `[preTabDocumentId]`, and `owner` is that document).
              { label: `start:${start}`, multi: false, openIds: [], preTab: true, openSetLive: false }
            : { label: `start:${start}`, multi: false, openIds: [], openSetLive: false }
      const startCe = checkStep(h, startExpect, bodyStatesGraded)
      if (startCe) return startCe
      // ⟨SUPERVISOR ADJUDICATION — the `bodies` clause⟩ the OPEN-SET state is tracked from the
      // SCHEDULE (never from the measured value): `start:openset` has just opened both document tabs,
      // one active. It stays open across the re-author/reconcile seams and is COLLAPSED by any
      // `mountTab(...)` (§A.3.1 clause (c): a single mount pins `[activeDocumentId]`).
      let openSetLive = start === 'openset'

      const n = int(rng, 1, 8)
      for (let s = 0; s < n; s++) {
        const seam = pick(rng, [
          'mountTab(doc-a)',
          'mountTab(doc-b)',
          'mountTab(search)',
          'mountTab(graph)',
          'mountTab(template)',
          'mountTab(landing)',
          'mountTab(null)',
          "reDerive('content')",
          "reDerive('operator')",
          "reDerive('template')",
          'refresh()',
          'rerenderAppGraph()',
          'mountTabs(openSet)',
          'pane-additive reconcile',
        ] as const)
        seamCovered.add(seam)
        let multi = false
        if (seam === 'mountTab(doc-a)') h.host.mountTab(docTab('t1', DOC_A))
        else if (seam === 'mountTab(doc-b)') h.host.mountTab(docTab('t2', DOC_B))
        else if (seam === 'mountTab(search)') {
          h.host.mountTab(searchTab('s1', 'alpha'))
          await flush()
        } else if (seam === 'mountTab(graph)') h.host.mountTab(graphTab('g1'))
        else if (seam === 'mountTab(template)') h.host.mountTab(templateTab('tpl1'))
        else if (seam === 'mountTab(landing)') h.host.mountTab(landingTab('l1'))
        else if (seam === 'mountTab(null)') h.host.mountTab(null)
        else if (seam === "reDerive('content')") await h.host.reDerive('content')
        else if (seam === "reDerive('operator')") await h.host.reDerive('operator')
        else if (seam === "reDerive('template')") await h.host.reDerive('template')
        else if (seam === 'refresh()') await h.host.refresh()
        else if (seam === 'rerenderAppGraph()') h.host.rerenderAppGraph()
        else if (seam === 'mountTabs(openSet)') {
          h.host.mountTabs(openSet)
          multi = true
        } else {
          // a PANE-ADDITIVE reconcile (§A.1.1's seam list): a real pane-visibility
          // flip through the public bridge seam, which routes through the
          // dirty-edit guard into the additive content reconcile.
          const def = h.registry.list().find((d) => d.scope !== 'operator') ?? h.registry.list()[0]
          if (def == null) throw new Error('P-SM-1 generator: no registered app-graph pane — the drawn pane-additive seam is UNREACHABLE')
          const before = h.registry.isEnabled(def.id)
          paneVisibilityToggle(def.id)
          if (h.registry.isEnabled(def.id) === before) return `pane-additive: the drawn toggle did not flip "${def.id}" (a SILENT step — non-vacuity)`
          await flush()
        }
        // ⟨SUPERVISOR ADJUDICATION — the `bodies` clause⟩ update the OPEN-SET state from the SEAM,
        // never from the measured value: `mountTabs(openSet)` opens BOTH document tabs (one active —
        // and it is also the step that sets `multi`), while a `mountTab(...)` mounts ONE tab and
        // therefore collapses the open set. Every re-author/reconcile seam (and the pane-additive
        // reconcile) mounts no tab, so the state is unchanged by them.
        if (multi) openSetLive = true
        else if (seam.startsWith('mountTab(')) openSetLive = false
        // ⟨adjudication — which steps are PREDICATE-based in clause (2)⟩ clause (2) is the STATE
        // predicate wherever §A.3.1 clause (c) does not pin one value: the four seams that
        // re-author/reconcile the stage WITHOUT mounting a tab (`predicate`), AND every step drawn while
        // the open set is LIVE (`openSetLive`) — a pane-additive flip mounts NO tab, so the open set
        // survives it and the state admits the OPEN SET, not `[activeDocumentId]`. `openIds` carries the
        // LIVE open set those steps may legitimately leave mounted (§A.3.1 clause (c) + H-3); it is
        // widened to the open set for exactly the `multi`/open-set/predicate steps above and stays `[]`
        // for the single-value states, so no state can read an open set it does not have.
        // ⟨adjudication — the STATE clause (4) reads⟩ `openSetLive` is that state, and it alone
        // decides the body clause's strength: EXACTLY the open set (as a SET) while the open set is
        // open — the `mountTabs` seam, and the re-author/reconcile/pane-additive seams drawn in that
        // state — and the state-based single values (`[getPreTabDocumentId()]` while the HOST is still
        // pre-tab, `[activeDocumentId]` in state `S`, `[]` in states `E`/`N`/`OH`) everywhere else.
        // `openIds` is widened to the open set for those steps; clause (4) reads it through the STATE,
        // never through the measured value, so a state that declares no open set can never be graded
        // against one.
        const ce = checkStep(h, {
          label: seam,
          multi,
          openIds: multi || openSetLive || PREDICATE_SEAMS.has(seam) ? [DOC_A, DOC_B] : [],
          predicate: PREDICATE_SEAMS.has(seam),
          openSetLive,
        }, bodyStatesGraded)
        if (ce) return ce
      }
      return null
    })
    // ⟨adjudication⟩ the row-level NON-VACUITY guard, asserted BEFORE the row verdict so it can never
    // be masked by it: the four state classes of §A.3.1 clause (b) — PRE-TAB, the LIVE open set, the
    // single-document state and the strict empty state (`kind === 'none'` with `!isPreTabState()`) —
    // must each have been GRADED, or the clause's coverage claim is vacuous.
    for (const state of ['PRE', 'OA', 'S', 'E']) {
      expect(
        bodyStatesGraded.has(state),
        `P-SM-1 non-vacuity/§A.3.1(b): the body clause must be GRADED in state ${state} at least once (graded states: ${[...bodyStatesGraded].sort().join(',') || '<none>'})`,
      ).toBe(true)
    }
    report(rep)
    for (const seam of ['rerenderAppGraph()', 'mountTabs(openSet)', 'pane-additive reconcile', "reDerive('content')", 'refresh()']) {
      expect(seamCovered.has(seam), `P-SM-1 generator: the seam "${seam}" must be drawn (§6 strategy: the spec's seam alphabet)`).toBe(true)
    }
  })
})

// ===========================================================================
// P-SM-2 — `strat:two-tab-page-state-isolation` (46 attempts)
// ===========================================================================
function pageHtmlFor(documentId: string, bodyText: string): string {
  return (
    `<div id="page-edit-surface" data-edit-surface="${documentId}" contenteditable="true">` +
    `<h1 data-rag-node-id="${documentId}-head">Doc ${documentId === DOC_A ? 'A' : 'B'}</h1>` +
    `<p data-rag-node-id="${documentId}-body">${bodyText}</p>` +
    `</div>`
  )
}

describe('§6 `P-SM-2` — cross-tab isolation of page state (two tabs, same document and cross-kind, success AND failure outcomes)', () => {
  it('P-SM-2 [strat:two-tab-page-state-isolation] — `isDirty`/`pageCommitFailure`/`anyDirty` evolve per TAB across a generated input/commit interleaving', async () => {
    const sameDocCovered = { counted: 0 }
    const crossKindCovered = { counted: 0 }
    const failureCovered = { counted: 0 }
    const successCovered = { counted: 0 }
    // NON-VACUITY (the fixture guard): the success direction must have been drawn
    // at least once THROUGH the batch seam on an answer the contract acknowledges —
    // see the trailing assertion, and the in-row `fixture-fidelity` check.
    const ackSuccessCovered = { counted: 0 }
    const noOpSuccessCovered = { counted: 0 }
    const rep = await runProperty('P-SM-2', 'strat:two-tab-page-state-isolation', PBT_BUDGET['P-SM-2'], async (_i, rng) => {
      const h = await boot(makeHarness())
      const shape = pick(rng, ['same-doc', 'diff-docs', 'cross-kind'] as const)
      const t1 = docTab('t1', DOC_A)
      const t2 = shape === 'same-doc' ? docTab('t2', DOC_A) : shape === 'diff-docs' ? docTab('t2', DOC_B) : searchTab('s1', 'alpha')
      if (shape === 'same-doc') sameDocCovered.counted += 1
      if (shape === 'cross-kind') crossKindCovered.counted += 1
      const tabs = [t1, t2]
      // the subject the page seam uses is the ACTIVE TAB ID (§5.3.2), so a
      // cross-kind pair's second subject is the SEARCH tab's id.
      const k1 = t1.id
      const k2 = t2.id
      const state = (k: string): { dirty: boolean; failure: boolean } => ({
        dirty: h.editController.isDirty(k),
        failure: failureOf(h.host, k) !== undefined,
      })

      const events = int(rng, 1, 5)
      for (let e = 0; e < events; e++) {
        const tab = pick(rng, tabs)
        const event = pick(rng, ['input', 'commit', 'commit', 'input'] as const)
        h.host.mountTab(tab)
        await flush()
        const subject = (activeTabId(h.host) ?? PAGE_EDIT_SURFACE_ID) as string
        const otherKey = subject === k1 ? k2 : k1
        const otherBefore = state(otherKey)

        if (event === 'input') {
          pageInput()
        } else if (h.editController.isDirty(subject)) {
          // A COMMIT with a real op list (the page's body text differs from the
          // store), under a drawn batch outcome. The retained doc-nav selection is
          // kept in step so the row exercises the per-tab KEYING rather than the
          // C9 `commitPageEdit` scope defect (cross-referenced, not pinned).
          const docId = activeDocId(h.host) ?? DOC_A
          h.host.setCurrentDocumentId(docId)
          const ok = pick(rng, [true, false])
          h.batchBehaviour.ok = ok
          const callsBefore = h.batchCalls()
          const acksBefore = h.batchAcks()
          await pageBlur(pageHtmlFor(docId, `edited-${e}`))
          const after = state(subject)
          // FIXTURE FIDELITY (non-vacuity, IN-ROW): the ACK arm's answer must be one
          // the contract reads as an acknowledgement of the ops actually SENT — a
          // kind-only echo (no per-op identity) is a silent partial write that would
          // send every batch success into the failure arm and leave this row's
          // success clause satisfied by the §7 no-op path alone (vacuous).
          const mismatches = h.batchAckMismatches()
          const echoMismatches = h.batchEchoMismatches()
          if (mismatches.length > 0 || echoMismatches.length > 0) {
            const why = mismatches.length > 0 ? mismatches[mismatches.length - 1] : `STRICT ECHO: ${echoMismatches[echoMismatches.length - 1]}`
            return `fixture-fidelity/§3.3 item 6 (FS19): the harness's batch answer did not acknowledge the ops sent as the STORE does — ${why} (subject=${subject} batchCalls=${h.batchCalls()})`
          }
          const batched = h.batchCalls() > callsBefore
          const acknowledged = h.batchAcks() > acksBefore
          // §3.5 items 1/2 — the pinned outcome SHAPES: a success is CLEAN with no
          // record; a failure KEEPS the dirty flag and records. Anything else (a
          // clean tab carrying a record, a dirty tab with none) is a violation.
          if (after.dirty && !after.failure) {
            return `commit-outcome/§3.5 items 1/2: a commit that leaves the tab DIRTY must record a failure (subject=${subject} ok=${ok} batchCalls=${h.batchCalls()})`
          }
          if (!after.dirty && after.failure) {
            return `commit-outcome/§3.5 item 6: a committed tab must not carry a failure record (subject=${subject} ok=${ok})`
          }
          if (after.dirty) failureCovered.counted += 1
          else {
            successCovered.counted += 1
            // the STRONG direction: a success that came back through the BATCH seam
            // on an answer the contract acknowledges (never the no-op path alone)
            if (batched && acknowledged) ackSuccessCovered.counted += 1
            else noOpSuccessCovered.counted += 1
          }
        }

        // THE ISOLATION CLAUSE (§5.1 I1 clause 2 / §6 P-SM-2's discriminator):
        // a mutation under ONE tab never changes the OTHER tab's two values.
        const seen = `event=${event} tab=${tab.id} subject=${subject} shape=${shape} state=[${k1}:${JSON.stringify(state(k1))},${k2}:${JSON.stringify(state(k2))}] anyDirty=${h.editController.anyDirty()}`
        const otherAfter = state(otherKey)
        if (otherAfter.dirty !== otherBefore.dirty || otherAfter.failure !== otherBefore.failure) {
          return `cross-tab-independence/§5.1 I1 clause 2: a mutation under ${subject} changed ${otherKey}'s page state (${seen})`
        }
        // `anyDirty()` is true iff SOME tab is dirty (§6 P-SM-2)
        if (h.editController.anyDirty() !== (state(k1).dirty || state(k2).dirty)) {
          return `anyDirty/§6 P-SM-2: true iff SOME tab is dirty (${seen})`
        }
        // and a document id is never a page subject (§5.1 I1 clause 1 / FS-4)
        if (failureOf(h.host, DOC_A) !== undefined || failureOf(h.host, DOC_B) !== undefined) {
          return `failure-key/FS-4: a document id is never a failure key (${seen})`
        }
        if (h.editController.isDirty(DOC_A) || h.editController.isDirty(DOC_B)) {
          return `dirty-key/FS-4: a document id is never a dirty key (${seen})`
        }
      }

      // the CARET keys are independent: each is restored for its own live document
      // (read WITHOUT the clearing direction, so the read is non-destructive)
      h.editController.saveCaret(k1, PAGE_CARET as never)
      h.host.mountTab(docTab(k1, DOC_A))
      h.editController.saveCaret(k1, PAGE_CARET as never)
      if (h.editController.restoreCaret(k1) === undefined) {
        return 'caret-isolation: a page caret saved under the ACTIVE tab id with a live document is restorable (§5.1 I1 clause 3)'
      }
      h.host.mountTab(docTab('t2', DOC_A))
      h.editController.saveCaret('t2', PAGE_CARET as never)
      if (h.editController.restoreCaret('t2') === undefined) {
        return 'caret-isolation: the SECOND tab\'s caret is its own (§6 P-SM-2)'
      }
      h.host.mountTab(docTab(k1, DOC_A))
      if (h.editController.restoreCaret(k1) === undefined) {
        return 'caret-isolation: reading t2\'s caret must not clear t1\'s (§6 P-SM-2)'
      }
      return null
    })
    report(rep)
    // the fixture's own reading (printed with the row, like every other row's
    // output): the acknowledged-through-the-batch successes vs the §7 no-op path.
    // eslint-disable-next-line no-console
    console.log(
      `[PBT] P-SM-2 fixture — batch-answered successes (acknowledged): ${ackSuccessCovered.counted} | no-op-path successes: ${noOpSuccessCovered.counted} | failures: ${failureCovered.counted}`,
    )
    expect(sameDocCovered.counted, 'P-SM-2 generator: a two-tab pair on the SAME document must be drawn (§6 discriminator)').toBeGreaterThan(0)
    expect(crossKindCovered.counted, 'P-SM-2 generator: a cross-kind pair (a search tab + a document tab) must be drawn').toBeGreaterThan(0)
    expect(failureCovered.counted, 'P-SM-2 generator: a FAILURE outcome must be drawn (§6: success AND failure)').toBeGreaterThan(0)
    expect(successCovered.counted, 'P-SM-2 generator: an ACKNOWLEDGED success outcome must be drawn (§6: success AND failure)').toBeGreaterThan(0)
    // THE FIXTURE GUARD (non-vacuity): the success clause above must NOT be
    // satisfiable by the §7 no-op path alone — at least one drawn success has to
    // have come back through `bridge.edit.batch` on an answer the C9 contract
    // reads as an acknowledgement (one agreeing entry per op, §3.3 item 6 /
    // `FS19`). If a future contract change makes the harness's echo answer
    // unacknowledged (as the kind-only `{ op: op.op }` shape was), this row goes
    // RED here instead of passing vacuously.
    expect(
      ackSuccessCovered.counted,
      `P-SM-2 fixture: an acknowledged BATCH success must be drawn (ack-batch=${ackSuccessCovered.counted}, no-op-path=${noOpSuccessCovered.counted}, total-successes=${successCovered.counted}) — a kind-only/identity-less harness answer is not an acknowledgement and routes every batch success into the failure arm`,
    ).toBeGreaterThan(0)
  })
})

// ===========================================================================
// P-TP-2 — `strat:caret-lifecycle-total` (40 attempts)
// ===========================================================================
describe('§6 `P-TP-2` — caret lifecycle totality across a re-derive (the surface-presence half is HOST-OWNED, asserted host-side)', () => {
  it('P-TP-2 [strat:caret-lifecycle-total] — `restoreCaret` is total over (hook presence, hook answer class, subject class, live/dead document, caret kind); the host re-derive never targets a missing surface', async () => {
    const hookAbsentCovered = { counted: 0 }
    const nonDocCovered = { counted: 0 }
    const docSubjectCovered = { counted: 0 }
    // ⟨§A.3.2 RULING C2⟩ non-vacuity for the carrier move: the DEAD-document direction (a drawn
    // `liveDoc` the carrier does NOT report live) must be exercised with the hook supplied, or the
    // liveness clause could pass by never drawing a dead document.
    const deadDocCovered = { counted: 0 }
    const rep = await runProperty('P-TP-2', 'strat:caret-lifecycle-total', PBT_BUDGET['P-TP-2'], async (_i, rng) => {
      // ---- the CONTROLLER-level proposition (§6 P-TP-2 with the "surface
      // present" conjunct DROPPED — the controller has no DOM view): a caret is
      // returned iff the hook resolves a LIVE document (the subject's document)
      // and the saved caret is page-scoped; every other combination is
      // `undefined`, clears the stale entry, and never throws.
      const liveDoc = pick(rng, [DOC_A, DOC_B, 'doc-gone'])
      const hookMode = pick(rng, ['supplied', 'supplied', 'absent'] as const)
      if (hookMode === 'absent') hookAbsentCovered.counted += 1
      const subjectClass = pick(rng, ['active-tab', 'other-tab', 'document-id', 'junk'] as const)
      const subject =
        subjectClass === 'active-tab' ? 't1' : subjectClass === 'other-tab' ? 't2' : subjectClass === 'document-id' ? liveDoc : pick(rng, ['', ' ', '__proto__', 'ghost-tab'])
      if (subjectClass === 'document-id') docSubjectCovered.counted += 1
      const caretKind = pick(rng, ['page', 'node'] as const)
      const caret = { ...PAGE_CARET, ragId: caretKind === 'page' ? PAGE_EDIT_SURFACE_ID : 'per-node-root' }
      // ⟨§A.3.2 RULING C2⟩ NO document id keys `backRefs`; the liveness source is the SEPARATE
      // carrier the harness supplies (`isDocumentLive`) — `'doc-gone'` is NOT live, so the
      // dead-document direction has teeth without a document id ever becoming a `backRefs` key.
      const backRefs = new Map<string, string[]>([['t1', ['x']]])
      const liveDocumentIds = new Set<string>([DOC_A, DOC_B])
      if (hookMode === 'supplied' && !liveDocumentIds.has(liveDoc)) deadDocCovered.counted += 1
      const opts: Record<string, unknown> = { backRefs, commit: async () => ({ ok: true, nodeId: 'x' }), onRebuild: vi.fn() }
      if (hookMode === 'supplied') {
        opts.pageSubjectDocument = (s: string) => (s === 't1' ? liveDoc : null)
        opts.isDocumentLive = (documentId: string) => liveDocumentIds.has(documentId)
      }
      const controller = createEditController(opts as never)
      controller.saveCaret(subject, caret as never)
      let out: unknown
      try {
        out = controller.restoreCaret(subject)
      } catch (e) {
        return `totality: restoreCaret must never throw — ${(e as Error).message}`
      }
      // the pinned semantics: hook absent ⇒ legacy `backRefs.has(subject)` (byte-for-byte
      // unchanged); hook supplied ⇒ the answer must be a non-empty document the CARRIER reports
      // live; then the FS2 page-scope check.
      const live =
        hookMode === 'absent'
          ? backRefs.has(subject)
          : subject === 't1' && liveDocumentIds.has(liveDoc)
      const expected = live && caretKind === 'page'
      const seen = `hookMode=${hookMode} subjectClass=${subjectClass} subject=${JSON.stringify(subject)} liveDoc=${liveDoc} caretKind=${caretKind} restored=${out !== undefined} expected=${expected}`
      if ((out !== undefined) !== expected) return `caret-rule/§5.3.2: ${seen}`
      // a refused caret is CLEARED, not hidden (a second read is still undefined)
      if (!expected) {
        const second = controller.restoreCaret(subject)
        if (second !== undefined) return `clear-on-refuse: the stale entry must be DELETED (${seen})`
      }

      // ---- the NON-DOCUMENT active tab + a CONTENT re-derive (§6 P-TP-2's 5-field
      // space): the caret saved under the search tab's subject is never restored
      // (its document is null) and the re-derive must not throw.
      const h = await boot(makeHarness())
      h.host.mountTab(docTab('t1', DOC_A))
      h.host.mountTab(searchTab('s1', 'alpha'))
      await flush()
      nonDocCovered.counted += 1
      h.editController.saveCaret('s1', PAGE_CARET as never)
      await h.host.reDerive('content')
      const out2 = h.editController.restoreCaret('s1')
      const census = censusOf(h)
      if (out2 !== undefined) return `non-document tab: the caret's document is null ⇒ cleared after the content re-derive (census ${census.line})`
      if (census.authored !== 0) return `non-document tab: no surface exists to restore into (census ${census.line})`
      if (stageSearchBody(h) !== true) return `non-document tab: the search body survives the content re-derive (§5.3.3 sub-rule 1)`

      // ---- the HOST-OWNED half (the "surface present" conjunct, §5.3.5 rule 3):
      // with the surface ABSENT the host attempts no restore (a caret saved under
      // the fallback subject survives the re-derive untouched rather than being
      // consumed) — asserted host-side, where the DOM is visible.
      h.editController.saveCaret(PAGE_EDIT_SURFACE_ID, PAGE_CARET as never)
      await h.host.reDerive('content')
      if (censusOf(h).authored !== 0) return 'host-owned half: the non-document re-derive must not author a surface'
      return null
    })
    report(rep)
    expect(hookAbsentCovered.counted, 'P-TP-2 generator: the hook-ABSENT (legacy) direction must be drawn (§5.3.2)').toBeGreaterThan(0)
    expect(nonDocCovered.counted, 'P-TP-2 generator: the non-document active tab + a content re-derive must be drawn').toBeGreaterThan(0)
    expect(docSubjectCovered.counted, 'P-TP-2 generator: `subject === a document id` must be drawn (§6 strategy)').toBeGreaterThan(0)
    expect(
      deadDocCovered.counted,
      'P-TP-2 generator (⟨§A.3.2 C2⟩): a DEAD document (not reported live by the carrier) must be drawn with the hook supplied, or the liveness clause is vacuous',
    ).toBeGreaterThan(0)
  })
})
