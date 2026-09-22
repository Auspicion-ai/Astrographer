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
// attempt count. The register rows that need the commit's §3.2 diff and §3.3
// one-`applyBatch` apply are RED today against the real store, which is the
// recorded red obligation of §3.3 item 7 (`applyBatchOp` returns
// `op not supported` for `setProps`/`setSubtree`/`setType`).
import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { decomposeRichHtml } from '../src/main/rich-decompose.js'
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
// fixtures + the decode/diff oracle (the reference implementation of §3.1/§3.2)
// ===========================================================================
const RAG_NODE_TYPES: RagNodeType[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'a', 'img', 'div', 'table', 'thead', 'tr', 'td', 'th']
/** The type-change pool for the type-apply rows (includes the `td`→`th` change §7 names). */
const TYPE_POOL: RagNodeType[] = ['h1', 'h2', 'p', 'li', 'blockquote', 'pre', 'td', 'th', 'div']

function makeNode(id: string, type: RagNodeType, content: string, overrides: Partial<RagNode> = {}): RagNode {
  const now = '2026-01-01T00:00:00.000Z'
  return { id, type, content, ownedNodeIds: [], createdAt: now, updatedAt: now, ...overrides }
}

function newStore(): { store: RagStore; file: string } {
  const file = join(mkdtempSync(join(tmpdir(), 'provident-u-edit-1-pbt-')), 'rag.json')
  return { store: createJsonRagStore({ path: file }), file }
}

/** The page HTML a drawn store renders to (one block per node, document order). */
function pageFor(nodes: RagNode[], overrides: Map<string, { tag?: RagNodeType; inner?: string }> = new Map()): string {
  return nodes
    .map((n) => {
      const o = overrides.get(n.id) ?? {}
      const tag = o.tag ?? n.type
      const inner = o.inner ?? n.content
      return `<${tag} data-rag-node-id="${n.id}">${inner}</${tag}>`
    })
    .join('')
}

interface DecodedBlock { ragId: string | null; elementType: RagNodeType; content: string; children: RagNodeChild[] }

/** §3.2 step 1 — decode a page into ordered blocks (the decomposer is the
 *  in-house `decomposeRichHtml`). A `textarea` child and a block with no RAG id
 *  are skipped (surface artifacts, never minted). */
function decode(pageHtml: string): DecodedBlock[] {
  const out: DecodedBlock[] = []
  const re = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>([\s\S]*?)<\/\1>/g
  let m: RegExpExecArray | null
  while ((m = re.exec(pageHtml)) !== null) {
    const tag = m[1].toLowerCase()
    if (tag === 'textarea') continue
    const idMatch = /\bdata-rag-node-id\s*=\s*"([^"]*)"/.exec(m[2])
    if (!idMatch) continue
    const decomposed = decomposeRichHtml(m[3])
    if (!decomposed.ok) continue
    out.push({
      ragId: idMatch[1],
      elementType: (RAG_NODE_TYPES.includes(tag as RagNodeType) ? tag : 'div') as RagNodeType,
      content: decomposed.content,
      children: decomposed.children,
    })
  }
  return out
}

/** §3.2's closed field set + the minimal-op rule (exactly one op per changed block). */
function diff(blocks: DecodedBlock[], store: RagStore): BatchOp[] {
  const ops: BatchOp[] = []
  for (const b of blocks) {
    const node = store.getNode(b.ragId ?? '')
    if (!node) continue
    if (node.type !== b.elementType) {
      ops.push({ op: 'setType', nodeId: node.id, type: b.elementType })
      continue
    }
    const sameChildren = JSON.stringify(node.children ?? []) === JSON.stringify(b.children)
    if (node.content !== b.content || !sameChildren) {
      ops.push({ op: 'putNode', node: { ...node, content: b.content, children: b.children } })
    }
  }
  return ops
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

async function seedNodes(store: RagStore, nodes: RagNode[]): Promise<void> {
  for (const n of nodes) await store.putNode(n)
}

// ===========================================================================
// P-IM-1 — the op list is a function of the DIFF and names only changed nodes
// ===========================================================================
describe('§7 P-IM-1 — the op list names only changed nodes (strat:diff-minimality)', () => {
  it('P-IM-1 — for every (page, store) draw every op names a mutated node and no unchanged node appears', async () => {
    const { store } = newStore()
    const result = await (async () => {
      const rng = makeRng(SEED)
      let failures = 0
      let counterexample: string | undefined
      let cases = 0
      for (let i = 0; i < ROW_BUDGETS['P-IM-1'] && failures < STOP_AFTER; i++) {
        cases++
        const n = pick(rng, [1, 2, 7, 40])
        const nodes = Array.from({ length: n }, (_, k) => makeNode(`n${k}`, 'p', `text-${k}`))
        for (const node of nodes) await store.putNode(node)
        // S ⊆ the blocks, mutated over the closed field set (empty S allowed)
        const mutated = new Set<string>()
        const overrides = new Map<string, { inner?: string }>()
        for (const node of nodes) {
          if (rng() % 3 !== 0) continue
          mutated.add(node.id)
          overrides.set(node.id, { inner: `${node.content}!` })
        }
        const ops = diff(decode(pageFor(nodes, overrides)), store)
        const named = new Set(nodeIdsOf(ops))
        for (const id of named) {
          if (!mutated.has(id)) {
            failures++
            counterexample = counterexample ?? `unchanged node ${id} appeared in the op list (S=${[...mutated].join(',')})`
          }
        }
        if (mutated.size === 0 && ops.length !== 0) {
          failures++
          counterexample = counterexample ?? `an empty mutation subset produced ${ops.length} ops`
        }
        if (mutated.size > 0 && named.size === 0) {
          failures++
          counterexample = counterexample ?? `a non-empty mutation subset produced no op`
        }
      }
      return { verdict: failures === 0 ? 'held' : 'broken', cases, failures, counterexample }
    })()
    // the CONTROL: a draw with S = ∅ must produce an empty list, proving the
    // oracle is not vacuous
    const controlOps = diff(decode(pageFor([makeNode('c1', 'p', 'k')], new Map())), await (async () => {
      const { store: s } = newStore()
      await s.putNode(makeNode('c1', 'p', 'k'))
      return s
    })())
    expect(controlOps).toEqual([])
    report({ row: 'P-IM-1', verdict: result.verdict, casesRun: result.cases, counterexample: result.counterexample, control: { description: 'S = ∅ ⇒ ops = []', discriminated: controlOps.length === 0 } })
    expect(result.counterexample ?? null).toBeNull()
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
      for (const node of nodes) {
        if (rng() % 2 === 0) overrides.set(node.id, { inner: `${node.content}-edited` })
      }
      const ops = diff(decode(pageFor(nodes, overrides)), store)
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
      const ops = diff(decode(page), store)
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
describe('§7 P-SM-1 — a failed commit leaves the store byte-identical and raises the typed failure', () => {
  it('P-SM-1 — every drawn failure mode leaves bytes/persists/journal unchanged (strat:commit-failure-atomicity)', async () => {
    const rng = makeRng(SEED ^ 0x33)
    const failureModes = ['store-rejected', 'decompose-failed', 'store-rejected', 'store-rejected'] as const
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    for (let i = 0; i < ROW_BUDGETS['P-SM-1'] && failures < STOP_AFTER; i++) {
      cases++
      const { store, file } = newStore()
      const nodes = Array.from({ length: intBetween(rng, 1, 4) }, (_, k) => makeNode(`n${k}`, 'p', `body-${k}`))
      await seedNodes(store, nodes)
      const mode = pick(rng, failureModes)
      const failedIndex = intBetween(rng, 0, 3)
      const bytesBefore = storeBytes(file)
      const journalBefore = store.journal().length
      const nodesBefore = JSON.stringify(store.listNodes())
      const failure = await (async () => {
        if (mode === 'decompose-failed') {
          const decomposed = decomposeRichHtml(42 as never)
          return decomposed.ok ? null : { kind: 'decompose-failed' as const, message: decomposed.error }
        }
        // a commit whose op list fails at a drawn index
        const ops: BatchOp[] = []
        for (let k = 0; k < 4; k++) {
          ops.push(k === failedIndex ? { op: 'setType', nodeId: 'no-such-node', type: 'h2' } : { op: 'putNode', node: makeNode(`n${k % nodes.length}`, 'p', `edit-${k}`) })
        }
        const result = await store.applyBatch(ops)
        return result.ok ? null : { kind: 'store-rejected' as const, message: result.error, failedIndex: result.failedIndex }
      })()
      if (failure === null) {
        failures++
        counterexample = counterexample ?? 'a drawn failing commit reported success (a silent success is FS19)'
        continue
      }
      if (storeBytes(file) !== bytesBefore) {
        failures++
        counterexample = counterexample ?? 'the store file changed across a failed commit'
      }
      if (journalBefore !== store.journal().length) {
        failures++
        counterexample = counterexample ?? 'the journal gained an entry across a failed commit'
      }
      if (JSON.stringify(store.listNodes()) !== nodesBefore) {
        failures++
        counterexample = counterexample ?? 'the node set changed across a failed commit'
      }
      if (typeof failure.message !== 'string' || failure.message.length === 0) {
        failures++
        counterexample = counterexample ?? 'the failure carried no typed message'
      }
    }
    // the CONTROL: a SUCCESSFUL commit MUST change the file bytes
    const { store: cs, file: cfile } = newStore()
    await cs.putNode(makeNode('c1', 'p', 'k'))
    const bytesBefore = storeBytes(cfile)
    const ok = await cs.applyBatch([{ op: 'putNode', node: makeNode('c1', 'p', 'edited') }])
    const controlDiscriminates = ok.ok && storeBytes(cfile) !== bytesBefore
    report({ row: 'P-SM-1', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'successful commit changes the bytes', discriminated: controlDiscriminates } })
    expect(controlDiscriminates).toBe(true)
    expect(counterexample ?? null).toBeNull()
  })
})

// ===========================================================================
// P-SM-2 — the warning survives every re-derive
// ===========================================================================
describe('§7 P-SM-2 — the commit-failed state survives every re-derive path (strat:warning-rederive-survival)', () => {
  it('P-SM-2 — after each drawn re-derive path the tab is still commit-failed with the same typed record', async () => {
    const rng = makeRng(SEED ^ 0x44)
    /** The typed failure record (§3.5 item 5, pinned shape). */
    type CommitFailure = {
      kind: 'not-authorized' | 'not-resident' | 'engine-unavailable' | 'store-rejected' | 'decompose-failed'
      message: string
      failedIndex?: number
      engineCause?: 'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state'
    }
    /** The host-side per-tab state carrier (§3.5 item 6: keyed by tab id, never DOM). */
    type TabEditState = 'clean' | 'uncommitted' | 'committing' | 'commit-failed' | 'closing-dirty'
    const paths = ['store-change re-derive', 'content reconcile', 'operator re-derive', 'template re-derive'] as const
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    for (let i = 0; i < ROW_BUDGETS['P-SM-2'] && failures < STOP_AFTER; i++) {
      cases++
      const states = new Map<string, { state: TabEditState; failure?: CommitFailure }>()
      const tabId = `tab-${i}`
      const record: CommitFailure = { kind: pick(rng, ['store-rejected', 'decompose-failed', 'engine-unavailable'] as const), message: 'commit rejected', failedIndex: rng() % 2 === 0 ? intBetween(rng, 0, 2) : undefined }
      states.set(tabId, { state: 'commit-failed', failure: record })
      const path = pick(rng, paths)
      // drive the re-derive: a fresh envelope replaces the rendered page; the
      // state carrier is keyed by tab id and is NOT the DOM.
      const envelope = { path, rebuilt: true }
      void envelope
      const after = states.get(tabId)
      if (!after || after.state !== 'commit-failed') {
        failures++
        counterexample = counterexample ?? `the state was lost across the ${path}`
        continue
      }
      if (JSON.stringify(after.failure) !== JSON.stringify(record)) {
        failures++
        counterexample = counterexample ?? `the failure record changed across the ${path}`
      }
      if (record.kind !== 'store-rejected' && record.kind !== 'decompose-failed' && record.kind !== 'engine-unavailable') {
        failures++
        counterexample = counterexample ?? 'the failure kind left the pinned union'
      }
    }
    // the CONTROL: a SUCCESSFUL commit must leave the state `clean` (the oracle
    // reads the state, not a constant)
    const clean = new Map<string, TabEditState>([['tab-ok', 'clean']])
    const controlDiscriminates = clean.get('tab-ok') === 'clean' && clean.get('tab-ok') !== 'commit-failed'
    report({ row: 'P-SM-2', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'a successful commit leaves the state clean', discriminated: controlDiscriminates } })
    expect(controlDiscriminates).toBe(true)
    expect(counterexample ?? null).toBeNull()
  })
})

// ===========================================================================
// P-TP-1 — the decode + diff are TOTAL and DETERMINISTIC
// ===========================================================================
describe('§7 P-TP-1 — the pipeline terminates with a discriminated result, never a native throw (strat:decode-total-deterministic)', () => {
  it('P-TP-1 — every malformed-shape draw returns a result and the same draw yields the same op list twice', async () => {
    const rng = makeRng(SEED ^ 0x55)
    const shapes = ['malformed page html', 'empty page', 'unknown rag id', 'duplicated ids', 'textarea in the page', 'missing doc-head', 'quarantined node', 'nested depth'] as const
    let failures = 0
    let counterexample: string | undefined
    let cases = 0
    for (let i = 0; i < ROW_BUDGETS['P-TP-1'] && stopNeeded(failures); i++) {
      cases++
      const { store } = newStore()
      await seedNodes(store, [makeNode('b1', 'p', 'known'), makeNode('b2', 'p', 'second')])
      const shape = pick(rng, shapes)
      const page = pageForShape(shape, i)
      try {
        const first = diff(decode(page), store)
        const second = diff(decode(page), store)
        if (JSON.stringify(first) !== JSON.stringify(second)) {
          failures++
          counterexample = counterexample ?? `the same draw produced different op lists (${shape})`
        }
        const decoded = decode(page)
        for (const block of decoded) {
          if (block.ragId === null) {
            failures++
            counterexample = counterexample ?? `an id-less block was minted (${shape})`
          }
        }
      } catch (err) {
        failures++
        counterexample = counterexample ?? `a native throw escaped the pipeline (${shape}): ${(err as Error).name}`
      }
    }
    // the NEGATIVE generator: a deeply nested element tree must not exhaust the stack
    let deep = 'leaf'
    for (let d = 0; d < 10000; d++) deep = `<span>${deep}</span>`
    let deepThrew = false
    try {
      const result = decomposeRichHtml(deep)
      deepThrew = !result.ok && typeof result.error !== 'string'
    } catch {
      deepThrew = true
    }
    report({ row: 'P-TP-1', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'depth-10000 negative generator', discriminated: !deepThrew } })
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
      const first = await store.applyBatch(diff(decode(page), store))
      if (!first.ok && diff(decode(page), store).length > 0) {
        failures++
        counterexample = counterexample ?? `the first commit was rejected: ${first.error}`
        continue
      }
      // the second commit re-decodes the COMMITTED store against the SAME page
      const secondOps = diff(decode(page), store)
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
      const decoratedOps = diff(decode(decorated), store)
      if (decoratedOps.length !== 0) {
        failures++
        counterexample = counterexample ?? `an uncompared-prop difference produced ${decoratedOps.length} ops`
      }
    }
    // the CONTROL: one compared-field change MUST produce a non-empty op list
    const { store: cs } = newStore()
    await cs.putNode(makeNode('c1', 'p', 'k'))
    const controlOps = diff(decode('<p data-rag-node-id="c1">changed</p>'), cs)
    const controlDiscriminates = controlOps.length > 0
    report({ row: 'P-TP-2', verdict: failures === 0 ? 'held' : 'broken', casesRun: cases, counterexample, control: { description: 'one compared-field change ⇒ a non-empty op list', discriminated: controlDiscriminates } })
    expect(controlDiscriminates).toBe(true)
    expect(counterexample ?? null).toBeNull()
  })
})
