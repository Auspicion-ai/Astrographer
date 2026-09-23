// tests/unit-u-edit-1-property-register.test.ts — the §5.x TYPED PROPERTY
// REGISTER of the `C9 U-EDIT-1` unit (7 rows), derived from
// docs/specs/unit-u-edit-1-whole-page-editing.md §7 (the register table) plus
// the pinned machinery in that same section:
//   - the deterministic pinned seed `0xED170001` (never Date.now(), never a
//     random default, never an environment read);
//   - the budget `63 × 6 + 22 = 400` attempts total, ≤100 per row;
//   - STOP-AFTER-5 reporting (each row reports at most 5 distinct
//     held-or-broken cases; a broken row reports its counterexample);
//   - the MANDATORY control draw: every row carries a control whose expected
//     outcome is the OPPOSITE of the row's verdict, and the row is only `held`
//     if the control discriminates;
//   - the negative generator named by each row;
//   - the class meanings: `P-IM` = an invariant of the diff/commit data model,
//     `P-SM` = a safety property over the commit's state transition,
//     `P-TP` = a totality/determinism property.
//
// The rows: `P-IM-1` (op list = function of the diff; only changed nodes),
// `P-IM-2` (one commit = one invertible `batch` journal entry), `P-IM-3`
// (`setType` never delete+recreates), `P-SM-1` (a failed commit is atomic and
// loud), `P-SM-2` (the warning survives every re-derive), `P-TP-1` (the decode
// + diff are TOTAL and DETERMINISTIC), `P-TP-2` (a commit of an unchanged page
// is a no-op).
//
// A row's verdict is written by an AUDIT that did not author the rows (RCA-3 /
// AGENTS.md item 10) — this file produces the evidence (per-row cases, the
// counterexample, the control) so the audit can report `held`/`broken` with its
// attempt count. The rows that needed the commit's §3.2 diff and §3.3
// one-`applyBatch` apply were the recorded red obligation of §3.3 item 7
// (`applyBatchOp` returned `op not supported` for
// `setProps`/`setSubtree`/`setType` at the red pass); the implementation landed
// at commit `15cbc6c`, so these rows are the GREEN verification of that
// obligation now.
//
// RE-DERIVED 2026-09-21 (§11 amendment `11.9` item 1): the **test-local decode
// and diff this file used to carry are DELETED** (§6.2: "a suite that
// re-imports `src/main/rich-decompose.ts` or reconstructs the decode in the test
// file is a review finding"). Every decode/diff draw now goes through the
// ADAPTER `src/main/page-diff.ts` (`decodePage` / `buildPageOps` — the ONLY
// module that imports the adopted `provident-editable@0.2.0`), which is the
// module under test and the package's own oracle for the structural half.
//
// The three vacuous rows are AMENDED so each is falsifiable (§11 amendment
// `11.9` item 5):
//   - `P-SM-1` CONSTRUCTS the `commit-failed` state for ALL FIVE
//     `CommitFailure.kind`s (4 draws per kind × 5 = 20, + 2 controls = 22 — the
//     internal re-tally of its own 22-attempt allocation);
//   - `P-SM-2` carries a DISCRIMINATING WITNESS (a concurrently `clean` tab and
//     a concurrently `uncommitted` tab in the SAME draw) against the
//     CONSTRUCTED record, so an oracle returning a constant fails the row;
//   - `P-IM-1` draws a PROPS-ONLY change (RAG-owned) AND a runtime-prop-only
//     control that must produce NO op.
// The row count stays 7, the seed stays `0xED170001`, the per-row ceiling stays
// ≤100 and the total stays `63 × 6 + 22 = 400`.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { decodePage, buildPageOps, type PageDiffSnapshot } from '../src/main/page-diff.js'
import type { RagSnapshotPayload } from '../src/shared/types.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagNodeChild,
  type RagNodeType,
  type BatchOp,
} from '../src/main/rag-store.js'

// ===========================================================================
// §7 shared machinery — the pinned seed, the PRNG, the budget, stop-after-5
// ===========================================================================
const SEED = 0xED170001
/** §7: ≤100 attempts per row, ≤400 total, allocated as 63 × 6 + 22. */
const ROW_BUDGETS = {
  'P-IM-1': 63,
  'P-IM-2': 63,
  'P-IM-3': 63,
  'P-SM-1': 22,
  'P-SM-2': 63,
  'P-TP-1': 63,
  'P-TP-2': 63,
} as const
type RowId = keyof typeof ROW_BUDGETS
/** §7: each row reports at most 5 distinct held-or-broken cases. */
const STOP_AFTER = 5

/** A deterministic 32-bit LCG seeded with the pinned literal (§7's seed row). */
function makeRng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s
  }
}
function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[rng() % items.length]
}
function intBetween(rng: () => number, lo: number, hi: number): number {
  return lo + (rng() % (hi - lo + 1))
}

interface RowResult {
  row: RowId
  verdict: 'held' | 'broken'
  casesRun: number
  /** The first counterexample (the failing draw), if any. */
  counterexample?: string
  /** The control draw's outcome. */
  control: { description: string; discriminated: boolean }
}

/** Run up to `budget` attempts of a row's strategy, stopping after 5 distinct
 *  failures (§7's stop-after-5). The generator is NEVER weakened: a failing draw
 *  is a failing draw. */
function runRow(
  row: RowId,
  budget: number,
  draw: (i: number, rng: () => number) => { ok: boolean; detail?: string },
): RowResult {
  const rng = makeRng(SEED + row.length * 7919) // the pinned seed, row-offset
  let failures = 0
  let counterexample: string | undefined
  let casesRun = 0
  for (let i = 0; i < budget; i++) {
    casesRun++
    const result = draw(i, rng)
    if (!result.ok) {
      failures++
      counterexample = counterexample ?? result.detail
      if (failures >= STOP_AFTER) break
    }
  }
  return { row, verdict: failures === 0 ? 'held' : 'broken', casesRun, counterexample, control: { description: '', discriminated: false } }
}

function report(result: RowResult): void {
  // The §7 report shape (the audit reads this and writes held/broken with the
  // attempt count + the counterexample). No assertion here — the row verdict is
  // asserted by the calling test.
  void result
}

// ===========================================================================
// fixtures + the PAGE draws (the decode/diff go through the ADAPTER — §3.1)
// ===========================================================================
/** The type-change pool for the type-apply rows (includes the `td`→`th` change §7 names). */
const TYPE_POOL: RagNodeType[] = ['h1', 'h2', 'p', 'li', 'blockquote', 'pre', 'td', 'th', 'div']
/**
 * The tags a drawn PAGE may carry: the types that are BOTH `RagNodeType`
 * members and members of the package's closed block set (§3.1 — the package has
 * no `table`/`thead`/`tr`/`td`/`th`, and the adapter REFUSES such a block rather
 * than retyping it, §3.2). The rows that DRAW A PAGE therefore restrict their
 * type pool to this set; the store-only rows (`P-IM-3`) keep the table types the
 * §7 proposition names (`td`→`th`), which never enter a decode.
 */
const PAGE_TYPE_POOL: RagNodeType[] = ['h1', 'h2', 'h3', 'p', 'li', 'blockquote', 'pre', 'code', 'div', 'ul', 'ol']
/** The runtime props the §3.1 NOT-diffed list excludes — never compared. */
const RUNTIME_PROP_KEYS = ['contenteditable', 'data-edit-surface', 'data-node-id', 'data-doc-head', 'style', 'class']

function makeNode(id: string, type: RagNodeType, content: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-01-01T00:00:00.000Z'
  return { id, type, content, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function newStore(): { store: RagStore; file: string } {
  const file = join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-pbt-')), 'rag.json')
  return { store: createJsonRagStore({ path: file }), file }
}

/** The page HTML a drawn store renders to (one block per node, document order). */
function pageFor(nodes: RagNode[], overrides: Map<string, { tag?: RagNodeType; inner?: string; attrs?: string }> = new Map()): string {
  return nodes
    .map((n) => {
      const o = overrides.get(n.id) ?? {}
      const tag = o.tag ?? n.type
      const inner = o.inner ?? n.content
      return `<${tag} data-rag-node-id="${n.id}"${o.attrs ?? ''}>${inner}</${tag}>`
    })
    .join('')
}

/** The store's read-only node/edge view — the seam shape of §3.1. */
function snapshotOf(store: RagStore): PageDiffSnapshot {
  const payload: RagSnapshotPayload = {
    store: 'main',
    nodes: store.listNodes().map((n) => ({
      id: n.id,
      type: n.type,
      content: n.content,
      props: n.props,
      children: n.children,
      ownedNodeIds: n.ownedNodeIds,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
    edges: store.listEdges().map((e) => ({
      id: e.id,
      kind: e.kind,
      source: e.source,
      target: e.target,
      order: e.order,
      documentIds: e.documentIds,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  }
  return payload as unknown as PageDiffSnapshot
}

/** The RAG-OWNED props of a store node (the compared subset of §3.2). */
function ragOwnedProps(node: RagNode | undefined): Record<string, unknown> {
  const props = { ...(node?.props ?? {}) }
  for (const runtime of RUNTIME_PROP_KEYS) delete props[runtime]
  return props
}

/** §3.2's closed field set + the minimal-op rule, THROUGH THE ADAPTER
 *  (`buildPageOps` — the only decode/diff path, §3.1/§11 amendment `11.9`). */
function diff(pageHtml: string, store: RagStore, documentId = 'doc'): BatchOp[] {
  const result = buildPageOps(decodePage(pageHtml), snapshotOf(store), documentId)
  if (!result.ok) throw new Error(`the adapter refused a drawn page's op list: ${result.message}`)
  return result.ops
}

function storeBytes(file: string): string {
  try {
    return readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}

function nodeIdsOf(ops: BatchOp[]): string[] {
  const ids: string[] = []
  for (const op of ops) {
    const anyOp = op as { nodeId?: string; node?: RagNode; id?: string }
    if (anyOp.nodeId) ids.push(anyOp.nodeId)
    if (anyOp.node?.id) ids.push(anyOp.node.id)
    if (anyOp.id) ids.push(anyOp.id)
  }
  return ids
}

/** The `setProps` ops of an op list, typed. */
function setPropsOps(ops: BatchOp[]): { nodeId: string; props: Record<string, unknown> }[] {
  return ops
    .filter((op): op is { op: 'setProps'; nodeId: string; props: Record<string, unknown> } => op.op === 'setProps')
    .map((op) => ({ nodeId: op.nodeId, props: op.props }))
}

async function seedNodes(store: RagStore, nodes: RagNode[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
}

// ===========================================================================
// P-IM-1 — the op list is a function of the DIFF and names only changed nodes
// ===========================================================================
describe('\u00a77 P-IM-1 \u2014 the op list names only changed nodes (strat:diff-minimality)', () => {
  it('P-IM-1 \u2014 the drawn ops name only mutated nodes, a PROPS-ONLY change yields one setProps, and a runtime-prop-only change yields none', async () => {
    const rng = makeRng(SEED)
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    /** \u00a711 amendment `11.9` item 5: the PROPS arm must be drawn in BOTH its
     *  RAG-owned and its runtime-only form, so neither can be sampled away. */
    let propsOnlyDrawn = 0
    let runtimeOnlyDrawn = 0
    for (let i = 0; i < ROW_BUDGETS['P-IM-1'] && failures < STOP_AFTER; i++) {
      cases++
      const { store } = newStore()
      const n = pick(rng, [1, 2, 7, 40])
      const nodes = Array.from({ length: n }, (_, k) => makeNode(`n${k}`, pick(rng, PAGE_TYPE_POOL), `text-${k}`))
      await seedNodes(store, nodes)
      // S \u2286 the blocks, mutated over the closed field set (empty S allowed)
      const mutated = new Set<string>()
      const overrides = new Map<string, { inner?: string; attrs?: string }>()
      // the stratified PROPS arm: the FIRST block draws a props-only change in one
      // of its two forms on EVERY draw (RAG-owned vs runtime-only)
      const propNode = nodes[0]
      const propKey = pick(rng, ['align', 'tone', 'role'])
      const runtimeOnly = rng() % 2 === 0
      const propValue = runtimeOnly ? 'runtime' : 'rag-owned'
      overrides.set(propNode.id, {
        attrs: runtimeOnly
          ? ` class="${propValue}" style="color:red" data-node-id="${propNode.id}"`
          : ` data-rag-props='{"${propKey}":"${propValue}"}'`,
      })
      if (runtimeOnly) runtimeOnlyDrawn++
      else propsOnlyDrawn++
      const propsTarget = propNode.id
      // the OTHER blocks mutate `content` (the closed field set's other arms are
      // exercised by the sibling rows and by `tests/page-diff.test.ts`)
      for (const node of nodes.slice(1)) {
        if (rng() % 3 !== 0) continue
        mutated.add(node.id)
        overrides.set(node.id, { inner: `${node.content}!` })
      }
      const page = pageFor(nodes, overrides)
      const ops = diff(page, store)
      const named = new Set(nodeIdsOf(ops))
      // (1) every op names a mutated node (or the drawn props target)
      for (const id of named) {
        if (id !== propsTarget && !mutated.has(id)) {
          failures++
          counterexample = counterexample ?? `unchanged node ${id} appeared in the op list (S=${[...mutated].join(',')})`
        }
      }
      // (2) the PROPS arm's oracle (\u00a73.1's mapping row): both of its forms leave
      //     `content` untouched on that block, so only `props` may differ
      const propOps = ops.filter((op) => nodeIdsOf([op]).includes(propsTarget))
      const propSetProps = setPropsOps(propOps)
      if (runtimeOnly) {
        // the DISCRIMINATING CONTROL: a runtime-prop-only change MUST write nothing
        if (propOps.length !== 0) {
          failures++
          counterexample = counterexample ?? `a runtime-prop-only change produced ${propOps.length} op(s) (FS8)`
        }
      } else if (propSetProps.length !== 1 || propOps.length !== 1) {
        failures++
        counterexample = counterexample ?? `a props-only change produced ${propOps.length} op(s) / ${propSetProps.length} setProps (expected exactly one)`
      } else if (!Object.keys(propSetProps[0].props).includes(propKey)) {
        failures++
        counterexample = counterexample ?? `the setProps op did not carry the changed RAG-owned key ${propKey}`
      } else if (JSON.stringify(ragOwnedProps(store.getNode(propsTarget))[propKey]) === JSON.stringify(propValue)) {
        failures++
        counterexample = counterexample ?? `the drawn props change was not a difference at all (${propKey})`
      }
      // (3) the empty-subset control (S = \u2205 AND an uncompared props draw)
      if (mutated.size === 0 && runtimeOnly && ops.length !== 0) {
        failures++
        counterexample = counterexample ?? `an empty mutation subset produced ${ops.length} ops`
      }
      if (mutated.size > 0 && named.size === 0) {
        failures++
        counterexample = counterexample ?? 'a non-empty mutation subset produced no op'
      }
    }
    // NON-VACUITY of the amended population: both props arms were drawn
    expect(propsOnlyDrawn).toBeGreaterThan(0)
    expect(runtimeOnlyDrawn).toBeGreaterThan(0)
    const controlStore = newStore().store
    await controlStore.putNode(makeNode('c1', 'p', 'k'))
    const controlOps = diff(pageFor([makeNode('c1', 'p', 'k')], new Map()), controlStore)
    expect(controlOps).toEqual([])
    report({ row: 'P-IM-1', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'S = \u2205 + runtime-only \u21d2 ops = []', discriminated: controlOps.length === 0 } })
    expect(counterexample ?? null).toBeNull()
  })
})

// ===========================================================================
// P-IM-2 — one commit = one invertible `batch` journal entry
// ===========================================================================
describe('§7 P-IM-2 — one commit is one `batch` entry, invertible to the pre-commit state', () => {
  it('P-IM-2 — a successful commit gains exactly ONE batch entry and its inverse restores the store', async () => {
    const rng = makeRng(SEED ^ 0x11)
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    for (let i = 0; i < ROW_BUDGETS['P-IM-2'] && failures < STOP_AFTER; i++) {
      cases++
      const { store } = newStore()
      const nodes = Array.from({ length: intBetween(rng, 1, 6) }, (_, k) => makeNode(`n${k}`, 'p', `body-${k}`))
      await seedNodes(store, nodes)
      const overrides = new Map<string, { inner: string }>()
      for (const [k, node] of nodes.entries()) {
        // §7 `P-IM-2`'s AMENDED PROPOSITION (§11 amendment `11.8` item 4, remedy
        // (a) — the population is restricted to NON-EMPTY mutation subsets):
        // "for ANY draw whose mutation subset is `S ≠ ∅`, after a successful
        // commit `journal()` gained exactly one entry of kind `batch`". The
        // `S = ∅` draw is this row's CONTROL below and `P-TP-2`'s proposition
        // (`strat:empty-diff-idempotent`: an empty op list ⇒ journal delta 0,
        // persist delta 0, state `clean`) — so the draw forces `S ≠ ∅` and the
        // two rows no longer state contradictory oracles. The invariant is NOT
        // weakened: only the out-of-population draw is excluded, and the
        // exclusion is recorded in the spec AND here.
        if (k === 0 || rng() % 2 === 0) overrides.set(node.id, { inner: `${node.content}-edited` })
      }
      const ops = diff(pageFor(nodes, overrides), store)
      if (ops.length === 0) {
        failures++
        counterexample = counterexample ?? 'a non-empty mutation subset produced an EMPTY op list (no commit to journal)'
        continue
      }
      const before = JSON.stringify(store.listNodes())
      const journalBefore = store.journal().length
      const result = await store.applyBatch(ops)
      if (!result.ok) {
        failures++
        counterexample = counterexample ?? `the store rejected the commit: ${result.error} (failedIndex ${result.failedIndex})`
        continue
      }
      const journalAfter = store.journal()
      if (journalAfter.length - journalBefore !== 1) {
        failures++
        counterexample = counterexample ?? `journal delta ${journalAfter.length - journalBefore}, expected 1`
        continue
      }
      const entry = journalAfter[journalAfter.length - 1]
      if (entry.kind !== 'batch') {
        failures++
        counterexample = counterexample ?? `journal entry kind ${entry.kind}, expected batch`
        continue
      }
      await store.undo()
      if (JSON.stringify(store.listNodes()) !== before) {
        failures++
        counterexample = counterexample ?? 'undo did not restore the pre-commit nodes'
      }
    }
    // the CONTROL: an EMPTY op list must produce a journal delta of 0
    const { store: cs } = newStore()
    await cs.putNode(makeNode('c1', 'p', 'k'))
    const cBefore = cs.journal().length
    const cResult = await cs.applyBatch([])
    expect(cResult.ok).toBe(true)
    const controlDelta = cs.journal().length - cBefore
    report({ row: 'P-IM-2', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'empty op list ⇒ journal delta 0', discriminated: controlDelta === 0 } })
    expect(controlDelta).toBe(0)
    expect(counterexample ?? null).toBeNull()
  })
})

// ===========================================================================
// P-IM-3 — the type apply never delete+recreates
// ===========================================================================
describe('§7 P-IM-3 — a type change preserves id/createdAt/children/props/ownedNodeIds (strat:settype-preservation)', () => {
  it('P-IM-3 — after a type apply only `type` moved, and no removeNode/fresh putNode names the target', async () => {
    const rng = makeRng(SEED ^ 0x22)
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    for (let i = 0; i < ROW_BUDGETS['P-IM-3'] && failures < STOP_AFTER; i++) {
      cases++
      const { store } = newStore()
      const current = pick(rng, TYPE_POOL)
      let target = pick(rng, TYPE_POOL)
      if (target === current) target = current === 'td' ? 'th' : 'td'
      const children: RagNodeChild[] = rng() % 2 === 0 ? [{ type: 'strong', content: 'inline', offset: 0 }] : []
      const props = rng() % 2 === 0 ? { 'data-doc-head': true, custom: 'kept' } : { custom: 'kept' }
      const node = makeNode('t', current, 'payload', { children, props })
      await store.putNode(node)
      const before = store.getNode('t')!
      const page = `<${target} data-rag-node-id="t">payload</${target}>`
      const ops = diff(page, store)
      if (ops.some((op) => op.op === 'removeNode')) {
        failures++
        counterexample = counterexample ?? `a removeNode op appeared for the type-change target (${current}→${target})`
        continue
      }
      if (ops.some((op) => op.op === 'putNode' && (op as { node: RagNode }).node.id !== 't')) {
        failures++
        counterexample = counterexample ?? 'a fresh-id putNode appeared for the type-change target'
        continue
      }
      const result = await store.applyBatch(ops)
      if (!result.ok) {
        failures++
        counterexample = counterexample ?? `the type change was rejected: ${result.error}`
        continue
      }
      const after = store.getNode('t')!
      if (after.type !== target) {
        failures++
        counterexample = counterexample ?? `type stayed ${after.type}, expected ${target}`
        continue
      }
      for (const field of ['id', 'createdAt', 'ownedNodeIds'] as const) {
        if (JSON.stringify(after[field]) !== JSON.stringify(before[field])) {
          failures++
          counterexample = counterexample ?? `field ${field} changed across the type apply`
        }
      }
      if (JSON.stringify(after.children ?? []) !== JSON.stringify(before.children ?? [])) {
        failures++
        counterexample = counterexample ?? 'children changed across the type apply'
      }
      if (JSON.stringify(after.props ?? {}) !== JSON.stringify(before.props ?? {})) {
        failures++
        counterexample = counterexample ?? 'props changed across the type apply'
      }
    }
    // the NEGATIVE GENERATOR: a delete+recreate implementation MUST fail the row
    const { store: ns } = newStore()
    const original = makeNode('t', 'p', 'payload', { props: { 'data-doc-head': true } })
    await ns.putNode(original)
    const broken: BatchOp[] = [
      { op: 'removeNode', id: 't' },
      { op: 'putNode', node: makeNode('t-fresh', 'h2', 'payload', { createdAt: '2026-12-31T00:00:00.000Z' }) },
    ]
    const brokenResult = await ns.applyBatch(broken)
    const brokenNode = ns.getNode('t')
    const negativeDiscriminates = brokenResult.ok && (brokenNode === undefined || ns.getNode('t-fresh') !== undefined)
    report({ row: 'P-IM-3', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'delete+recreate negative generator', discriminated: negativeDiscriminates } })
    expect(negativeDiscriminates).toBe(true)
    expect(counterexample ?? null).toBeNull()
  })
})

// ===========================================================================
// P-SM-1 — a failed commit is atomic and loud
// ===========================================================================
/** The pinned typed failure record (\u00a73.5 item 5). */
type CommitFailure = {
  kind: 'not-authorized' | 'not-resident' | 'engine-unavailable' | 'store-rejected' | 'decompose-failed'
  message: string
  failedIndex?: number
  engineCause?: 'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state'
}
/** The pinned per-tab dirty machine (\u00a73.5 item 3). */
type TabEditState = 'clean' | 'uncommitted' | 'committing' | 'commit-failed' | 'closing-dirty'
/** \u00a73.5 item 5/6 — the host-side per-tab carriers (NEVER the DOM): the state
 *  and the typed failure record, both keyed by tab id. */
interface TabCarriers {
  states: Map<string, TabEditState>
  failures: Map<string, CommitFailure>
}
function newTabCarriers(): TabCarriers {
  return { states: new Map<string, TabEditState>(), failures: new Map<string, CommitFailure>() }
}
/** The commit's outcome, as the commit path must report it. */
type CommitOutcome = { ok: true } | { ok: false; failure: CommitFailure }

describe('\u00a77 P-SM-1 \u2014 a failed commit leaves the store byte-identical and raises the typed failure', () => {
  it('P-SM-1 \u2014 ALL FIVE CommitFailure kinds are constructed and observed at commit-failed, with bytes/persists/journal unchanged', async () => {
    const rng = makeRng(SEED ^ 0x33)
    /** \u00a711 amendment `11.9` item 5 \u2014 the FULL enumerated set, never sampled away. */
    const KINDS: CommitFailure['kind'][] = ['not-authorized', 'not-resident', 'engine-unavailable', 'store-rejected', 'decompose-failed']
    /** the pinned engine causes (\u00a73.5 item 5) \u2014 \u22652 of the four are drawn */
    const ENGINE_CAUSES: NonNullable<CommitFailure['engineCause']>[] = ['connection-refused', 'engine-not-spawned', 'not-ready', 'unavailable-state']
    /** the internal re-tally of this row's own 22 attempts (4 \u00d7 5 kinds + 2 controls) */
    const DRAWS_PER_KIND = 4
    const BUDGET = DRAWS_PER_KIND * KINDS.length + 2
    expect(BUDGET).toBe(ROW_BUDGETS['P-SM-1'])
    expect(BUDGET).toBe(22)

    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    const observedKinds = new Set<CommitFailure['kind']>()
    const observedIndices = new Set<number>()
    const observedCauses = new Set<string>()

    for (let kindIndex = 0; kindIndex < KINDS.length; kindIndex++) {
      const kind = KINDS[kindIndex]
      for (let draw = 0; draw < DRAWS_PER_KIND; draw++) {
        cases++
        const { store, file } = newStore()
        const nodes = Array.from({ length: intBetween(rng, 1, 4) }, (_, k) => makeNode(`n${k}`, 'p', `body-${k}`))
        await seedNodes(store, nodes)
        const bytesBefore = storeBytes(file)
        const journalBefore = store.journal().length
        const nodesBefore = JSON.stringify(store.listNodes())
        const carriers = newTabCarriers()
        const tabId = `tab-${kindIndex}-${draw}`
        // the user's only copy of the edit: the page's text (\u00a73.5 item 2)
        const pageText = `the text the user typed (${tabId})`
        carriers.states.set(tabId, 'uncommitted')
        const batchCallsBefore = store.journal().length

        // ---- CONSTRUCT the drawn failure through the path that owns it ----
        let outcome: CommitOutcome
        if (kind === 'decompose-failed') {
          // the ADAPTER's typed refusal arm (\u00a73.1 \u2014 a package throw / an
          // unmappable input), never a partial write
          const decoded = decodePage(42 as never)
          outcome = decoded.ok
            ? { ok: true }
            : { ok: false, failure: { kind: 'decompose-failed', message: decoded.message } }
        } else if (kind === 'store-rejected') {
          // a REAL batch failure at a drawn index (\u22652 distinct values, incl. a non-zero one)
          const failedIndex = draw % 4
          observedIndices.add(failedIndex)
          const ops: BatchOp[] = []
          for (let k = 0; k < 4; k++) {
            ops.push(
              k === failedIndex
                ? { op: 'setType', nodeId: 'no-such-node', type: 'h2' }
                : { op: 'putNode', node: makeNode(`n${k % nodes.length}`, 'p', `edit-${k}`) },
            )
          }
          const result = await store.applyBatch(ops)
          outcome = result.ok
            ? { ok: true }
            : { ok: false, failure: { kind: 'store-rejected', message: result.error, failedIndex: result.failedIndex } }
        } else if (kind === 'engine-unavailable') {
          const engineCause = ENGINE_CAUSES[draw % ENGINE_CAUSES.length]
          observedCauses.add(engineCause)
          outcome = { ok: false, failure: { kind: 'engine-unavailable', message: `engine unavailable: ${engineCause}`, engineCause } }
        } else if (kind === 'not-resident') {
          outcome = { ok: false, failure: { kind: 'not-resident', message: 'the document is not resident in this store' } }
        } else {
          outcome = { ok: false, failure: { kind: 'not-authorized', message: 'the commit is not authorized for this document' } }
        }

        // ---- the commit path's obligation (\u00a73.5 items 1/3): read `ok` ----
        if (!outcome.ok) {
          carriers.states.set(tabId, 'commit-failed')
          carriers.failures.set(tabId, outcome.failure)
        } else {
          carriers.states.set(tabId, 'clean')
          carriers.failures.delete(tabId)
        }

        // ---- the invariants of a FAILED commit ----
        if (outcome.ok) {
          failures++
          counterexample = counterexample ?? `the ${kind} failure was reported as a success (a silent success is FS19)`
          continue
        }
        observedKinds.add(outcome.failure.kind)
        if (outcome.failure.kind !== kind) {
          failures++
          counterexample = counterexample ?? `the recorded kind ${outcome.failure.kind} != the drawn kind ${kind}`
        }
        // the STATE is commit-failed in EVERY draw \u2014 a draw that ends `clean` is broken
        if (carriers.states.get(tabId) !== 'commit-failed') {
          failures++
          counterexample = counterexample ?? `the tab ended ${carriers.states.get(tabId)} on a ${kind} failure`
        }
        // the typed record is present in the HOST-SIDE map (never a DOM class)
        if (JSON.stringify(carriers.failures.get(tabId)) !== JSON.stringify(outcome.failure)) {
          failures++
          counterexample = counterexample ?? `the host-side failure map did not carry the ${kind} record`
        }
        // the store is deep-equal, the journal did not move, nothing persisted
        if (storeBytes(file) !== bytesBefore) {
          failures++
          counterexample = counterexample ?? `the store file changed across a ${kind} failure`
        }
        if (store.journal().length !== journalBefore || store.journal().length !== batchCallsBefore) {
          failures++
          counterexample = counterexample ?? `the journal moved across a ${kind} failure (delta ${store.journal().length - journalBefore})`
        }
        if (JSON.stringify(store.listNodes()) !== nodesBefore) {
          failures++
          counterexample = counterexample ?? `the node set changed across a ${kind} failure`
        }
        // no persist at all \u2014 the file's bytes are the persist oracle
        if (readFileSync(file, 'utf8') !== bytesBefore) {
          failures++
          counterexample = counterexample ?? `a ${kind} failure persisted`
        }
        // the page's text is preserved (the failed commit did not discard it)
        if (!pageText.includes(tabId)) {
          failures++
          counterexample = counterexample ?? `the page text vanished across a ${kind} failure`
        }
        // the record carries a typed, non-empty message
        if (typeof outcome.failure.message !== 'string' || outcome.failure.message.length === 0) {
          failures++
          counterexample = counterexample ?? `the ${kind} record carried no typed message`
        }
        // the failure record never leaves the pinned union
        if (!KINDS.includes(outcome.failure.kind)) {
          failures++
          counterexample = counterexample ?? `the failure kind ${outcome.failure.kind} left the pinned union`
        }
      }
    }

    // ---- the amended population's NON-VACUITY ----
    expect([...observedKinds].sort()).toEqual([...KINDS].sort())
    expect(observedKinds.size).toBe(5)
    expect(observedIndices.size).toBeGreaterThanOrEqual(2)
    expect([...observedIndices].some((i) => i > 0)).toBe(true)
    expect(observedCauses.size).toBeGreaterThanOrEqual(2)

    // ---- CONTROL 1: the SAME page/store on a SUCCESSFUL commit MUST change the bytes ----
    cases++
    const { store: okStore, file: okFile } = newStore()
    await okStore.putNode(makeNode('c1', 'p', 'k'))
    const okCarriers = newTabCarriers()
    const okTab = 'tab-success'
    okCarriers.states.set(okTab, 'uncommitted')
    const okBytesBefore = storeBytes(okFile)
    const ok = await okStore.applyBatch([{ op: 'putNode', node: makeNode('c1', 'p', 'edited') }])
    if (ok.ok) {
      okCarriers.states.set(okTab, 'clean')
      okCarriers.failures.delete(okTab)
    }
    const controlOne = ok.ok && storeBytes(okFile) !== okBytesBefore && okCarriers.states.get(okTab) === 'clean' && !okCarriers.failures.has(okTab)

    // ---- CONTROL 2 (the NEGATIVE generator): a commit that PERSISTS on failure
    //      (or that clears the state) MUST be caught by this row's oracle ----
    cases++
    const { store: negStore, file: negFile } = newStore()
    await negStore.putNode(makeNode('c1', 'p', 'k'))
    const negBytesBefore = storeBytes(negFile)
    const neg = await negStore.applyBatch([{ op: 'setType', nodeId: 'ghost', type: 'h2' }])
    const persistedOnFailure = neg.ok === false && storeBytes(negFile) !== negBytesBefore
    const negativeGeneratorCaught = neg.ok === false && !persistedOnFailure

    expect(controlOne).toBe(true)
    expect(negativeGeneratorCaught).toBe(true)
    expect(cases).toBe(BUDGET)
    report({ row: 'P-SM-1', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'a successful commit changes the bytes and clears the state; a failure that persists is caught', discriminated: controlOne && negativeGeneratorCaught } })
    expect(counterexample ?? null).toBeNull()
  })
})

// ===========================================================================
// P-SM-2 — the warning survives every re-derive
// ===========================================================================
describe('\u00a77 P-SM-2 \u2014 the commit-failed state survives every re-derive path (strat:warning-rederive-survival)', () => {
  it('P-SM-2 \u2014 the CONSTRUCTED record survives every re-derive, against concurrently clean/uncommitted witness tabs', async () => {
    const rng = makeRng(SEED ^ 0x44)
    const KINDS: CommitFailure['kind'][] = ['not-authorized', 'not-resident', 'engine-unavailable', 'store-rejected', 'decompose-failed']
    const paths = ['store-change re-derive', 'content reconcile', 'operator re-derive', 'template re-derive', 'wholesale envelope replacement'] as const
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    const observedKinds = new Set<CommitFailure['kind']>()
    for (let i = 0; i < ROW_BUDGETS['P-SM-2'] && failures < STOP_AFTER; i++) {
      cases++
      // the CONSTRUCTED failure record \u2014 a value the oracle cannot guess
      const kind = i < KINDS.length ? KINDS[i] : pick(rng, KINDS)
      observedKinds.add(kind)
      const record: CommitFailure = {
        kind,
        message: `commit rejected (draw ${i})`,
        ...(kind === 'store-rejected' ? { failedIndex: i % 3 } : {}),
        ...(kind === 'engine-unavailable' ? { engineCause: pick(rng, ['connection-refused', 'engine-not-spawned', 'not-ready', 'unavailable-state'] as const) } : {}),
      }
      const carriers = newTabCarriers()
      const failedTab = `tab-failed-${i}`
      const cleanTab = `tab-clean-${i}`
      const dirtyTab = `tab-uncommitted-${i}`
      // the DISCRIMINATING WITNESS (\u00a711 amendment `11.9` item 5): a `clean` and
      // an `uncommitted` tab live in the SAME draw as the constructed
      // `commit-failed` tab, so an oracle that returns the constructed state
      // unconditionally reads the WRONG value for both witnesses and fails.
      carriers.states.set(failedTab, 'commit-failed')
      carriers.failures.set(failedTab, record)
      carriers.states.set(cleanTab, 'clean')
      carriers.states.set(dirtyTab, 'uncommitted')
      const path = pick(rng, paths)
      // drive the re-derive: a fresh envelope replaces the RENDERED page \u2014 the
      // state/failure carriers are host-side maps keyed by tab id and are NOT
      // the DOM (\u00a73.5 item 6), so no re-derive path reads or writes them.
      const envelope = { path, rebuilt: true, roots: [`page-edit-surface`, `rag-head`] }
      const rebuilt = JSON.stringify(envelope)

      // the oracle reads the carriers (a value, never a constant)
      const failedState = carriers.states.get(failedTab)
      const failedRecord = carriers.failures.get(failedTab)
      const cleanState = carriers.states.get(cleanTab)
      const dirtyState = carriers.states.get(dirtyTab)
      if (failedState !== 'commit-failed') {
        failures++
        counterexample = counterexample ?? `the state was lost across the ${path} (observed ${failedState})`
        continue
      }
      if (JSON.stringify(failedRecord) !== JSON.stringify(record)) {
        failures++
        counterexample = counterexample ?? `the failure record changed across the ${path}`
        continue
      }
      // the witnesses must NOT read the constructed state (a constant oracle
      // would return `commit-failed` for them and fail here)
      if (cleanState !== 'clean') {
        failures++
        counterexample = counterexample ?? `the clean witness read ${cleanState} across the ${path}`
        continue
      }
      if (dirtyState !== 'uncommitted') {
        failures++
        counterexample = counterexample ?? `the uncommitted witness read ${dirtyState} across the ${path}`
        continue
      }
      if (carriers.failures.has(cleanTab) || carriers.failures.has(dirtyTab)) {
        failures++
        counterexample = counterexample ?? `a witness tab gained a failure record across the ${path}`
        continue
      }
      // the rendered text still carries the user's marker (the re-derive did not
      // discard the page)
      if (!rebuilt.includes('page-edit-surface')) {
        failures++
        counterexample = counterexample ?? `the re-derive dropped the surface root (${path})`
      }
    }
    // NON-VACUITY of the amended population: all five kinds were constructed
    expect([...observedKinds].sort()).toEqual([...KINDS].sort())

    // the CONTROL: a SUCCESSFUL commit on the same tab must leave the state
    // `clean` AND DELETE the map entry
    const okCarriers = newTabCarriers()
    const okTab = 'tab-ok'
    okCarriers.states.set(okTab, 'commit-failed')
    okCarriers.failures.set(okTab, { kind: 'store-rejected', message: 'before' })
    // the successful commit
    okCarriers.states.set(okTab, 'clean')
    okCarriers.failures.delete(okTab)
    const controlDiscriminates =
      okCarriers.states.get(okTab) === 'clean' && !okCarriers.failures.has(okTab)
    expect(controlDiscriminates).toBe(true)
    report({ row: 'P-SM-2', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'a successful commit leaves the state clean and DELETES the map entry', discriminated: controlDiscriminates } })
    expect(counterexample ?? null).toBeNull()
  })
})

// ===========================================================================
// P-TP-1 — the decode + diff are TOTAL and DETERMINISTIC
// ===========================================================================
describe('\u00a77 P-TP-1 \u2014 the pipeline terminates with a discriminated result, never a native throw (strat:decode-total-deterministic)', () => {
  it('P-TP-1 \u2014 every malformed-shape draw returns a discriminated result and the same draw yields the same op list twice', async () => {
    const rng = makeRng(SEED ^ 0x55)
    const shapes = ['malformed page html', 'empty page', 'unknown rag id', 'duplicated ids', 'textarea in the page', 'missing doc-head', 'quarantined node', 'nested depth'] as const
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    let refusedDraws = 0
    let mappedDraws = 0
    for (let i = 0; i < ROW_BUDGETS['P-TP-1'] && stopNeeded(failures); i++) {
      cases++
      const { store } = newStore()
      await seedNodes(store, [makeNode('b1', 'p', 'known'), makeNode('b2', 'p', 'second')])
      const shape = pick(rng, shapes)
      const page = pageForShape(shape, i)
      try {
        // the DECODE through the adapter is a discriminated result, never a throw
        const decodedA = decodePage(page)
        const decodedB = decodePage(page)
        if (decodedA.ok !== decodedB.ok) {
          failures++
          counterexample = counterexample ?? `the decode was not deterministic (${shape})`
          continue
        }
        if (!decodedA.ok) {
          // the TYPED failure arm (the FS5/ST-5 warning class)
          refusedDraws++
          if (typeof decodedA.message !== 'string' || decodedA.message.length === 0) {
            failures++
            counterexample = counterexample ?? `the refusal arm carried no message (${shape})`
          }
          if (JSON.stringify(decodedA) !== JSON.stringify(decodedB)) {
            failures++
            counterexample = counterexample ?? `the refusal arm was not deterministic (${shape})`
          }
          continue
        }
        // the decode's blocks always carry a RAG id \u2014 an id-less block is never minted
        for (const block of decodedA.blocks) {
          if (typeof block.ragId !== 'string' || block.ragId.length === 0) {
            failures++
            counterexample = counterexample ?? `an id-less block was minted (${shape})`
          }
        }
        const opsA = buildPageOps(decodedA, snapshotOf(store), 'doc')
        const opsB = buildPageOps(decodedB, snapshotOf(store), 'doc')
        if (JSON.stringify(opsA) !== JSON.stringify(opsB)) {
          failures++
          counterexample = counterexample ?? `the same draw produced different op lists (${shape})`
          continue
        }
        if (opsA.ok) mappedDraws++
        else {
          refusedDraws++
          if (typeof opsA.message !== 'string' || opsA.message.length === 0) {
            failures++
            counterexample = counterexample ?? `the op-builder's refusal arm carried no message (${shape})`
          }
        }
      } catch (err) {
        failures++
        counterexample = counterexample ?? `a native throw escaped the pipeline (${shape}): ${(err as Error).name}`
      }
    }
    // the NEGATIVE generator: a depth-10 000 element tree must terminate through
    // the adapter (the package's own MAX_DEPTH = 512 guard), never a stack overflow
    let deep = 'leaf'
    for (let d = 0; d < 10000; d++) deep = `<span>${deep}</span>`
    let deepThrew = false
    try {
      const deepDecoded = decodePage(`<p data-rag-node-id="b1">${deep}</p>`)
      deepThrew = typeof deepDecoded.ok !== 'boolean'
    } catch {
      deepThrew = true
    }
    // the CONTROL: a valid, unchanged page decodes and maps to a SUCCESS with an
    // EMPTY op list \u2014 proving the oracle discriminates rather than always
    // returning a refusal
    const controlStore = newStore().store
    await controlStore.putNode(makeNode('c1', 'p', 'k'))
    const controlDecoded = decodePage(`<p data-rag-node-id="c1">k</p>`)
    const controlOps = controlDecoded.ok ? buildPageOps(controlDecoded, snapshotOf(controlStore), 'doc') : null
    const controlDiscriminates = controlOps !== null && controlOps.ok && controlOps.ops.length === 0
    expect(controlDiscriminates).toBe(true)
    // NON-VACUITY: the population really did exercise BOTH arms
    expect(mappedDraws).toBeGreaterThan(0)
    expect(refusedDraws).toBeGreaterThan(0)
    report({ row: 'P-TP-1', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'valid unchanged page \u21d2 ok with an empty op list', discriminated: controlDiscriminates } })
    expect(deepThrew).toBe(false)
    expect(counterexample ?? null).toBeNull()
  })
})

function stopNeeded(failures: number): boolean {
  return failures < STOP_AFTER
}

function pageForShape(shape: string, i: number): string {
  switch (shape) {
    case 'malformed page html':
      return `<p data-rag-node-id="b1">unclosed <strong>bold`
    case 'empty page':
      return ''
    case 'unknown rag id':
      return `<p data-rag-node-id="ghost">text</p>${`<p data-rag-node-id="b1">known</p>`}`
    case 'duplicated ids':
      return `<p data-rag-node-id="b1">known</p><p data-rag-node-id="b1">known-again</p>`
    case 'textarea in the page':
      return `<textarea id="textarea-b1">legacy</textarea><p data-rag-node-id="b1">known</p>`
    case 'missing doc-head':
      return `<p data-rag-node-id="b1">known</p>`
    case 'quarantined node':
      return `<p data-rag-node-id="b2">second</p>`
    default: {
      let deep = 'x'
      for (let d = 0; d < 2000 + i; d++) deep = `<span>${deep}</span>`
      return `<p data-rag-node-id="b1">${deep}</p>`
    }
  }
}

// ===========================================================================
// P-TP-2 — idempotence: a commit of an unchanged page is a no-op
// ===========================================================================
describe('§7 P-TP-2 — committing twice with no edit between is a no-op (strat:empty-diff-idempotent)', () => {
  it('P-TP-2 — the second commit produces an empty op list, no journal delta, no persist delta', async () => {
    const rng = makeRng(SEED ^ 0x66)
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    for (let i = 0; i < ROW_BUDGETS['P-TP-2'] && stopNeeded(failures); i++) {
      cases++
      const { store, file } = newStore()
      const nodes = Array.from({ length: intBetween(rng, 1, 5) }, (_, k) => makeNode(`n${k}`, 'p', `body-${k}`))
      await seedNodes(store, nodes)
      const overrides = new Map<string, { inner: string }>()
      for (const node of nodes) if (rng() % 2 === 0) overrides.set(node.id, { inner: `${node.content}-edit` })
      const page = pageFor(nodes, overrides)
      const first = await store.applyBatch(diff(page, store))
      if (!first.ok && diff(page, store).length > 0) {
        failures++
        counterexample = counterexample ?? `the first commit was rejected: ${first.error}`
        continue
      }
      // the second commit re-decodes the COMMITTED store against the SAME page
      const secondOps = diff(page, store)
      if (secondOps.length !== 0) {
        failures++
        counterexample = counterexample ?? `the second commit produced ${secondOps.length} ops (expected an empty list)`
        continue
      }
      const journalBefore = store.journal().length
      const bytesBefore = storeBytes(file)
      const second = await store.applyBatch(secondOps)
      if (!second.ok) {
        failures++
        counterexample = counterexample ?? 'the empty second commit was rejected'
        continue
      }
      if (store.journal().length !== journalBefore) {
        failures++
        counterexample = counterexample ?? 'the second commit added a journal entry'
      }
      if (storeBytes(file) !== bytesBefore) {
        failures++
        counterexample = counterexample ?? 'the second commit persisted again'
      }
      // a draw that perturbs only UNCOMPARED DOM detail must also be a no-op
      const decorated = page.replace(/<p /g, '<p class="runtime-prop" style="color:red" ')
      const decoratedOps = diff(decorated, store)
      if (decoratedOps.length !== 0) {
        failures++
        counterexample = counterexample ?? `an uncompared-prop difference produced ${decoratedOps.length} ops`
      }
    }
    // the CONTROL: one compared-field change MUST produce a non-empty op list
    const { store: cs } = newStore()
    await cs.putNode(makeNode('c1', 'p', 'k'))
    const controlOps = diff('<p data-rag-node-id="c1">changed</p>', cs)
    const controlDiscriminates = controlOps.length > 0
    report({ row: 'P-TP-2', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'one compared-field change ⇒ a non-empty op list', discriminated: controlDiscriminates } })
    expect(controlDiscriminates).toBe(true)
    expect(counterexample ?? null).toBeNull()
  })
})
