// tests/unit-import-batch-persist-contract.test.ts — TestWriter RED set for unit
// IMPORT-BATCH-PERSIST (docs/specs/unit-import-batch-persist.md).
//
// Spec source (the ONLY design source): docs/specs/unit-import-batch-persist.md
//   §1.1/§1.2  the VERIFIED call path + the persist census (7 persist() sites;
//              the production importer is ALREADY batched — the 5 640 persists of
//              the probe corpus come from the TEST DRIVER's per-op loop)
//   §2a        the driver correction (ONE applyBatch, result.ok checked)
//   §2b        the invariant (NO PER-OP FULL-STORE WRITE INSIDE A BATCH), the named
//              seam (a) `persistDeferred` (recommended) / (b) `runDeferred(`), and
//              the semantics that MUST be preserved (§2b items 1-5)
//   §2c        the 7 forbidden shortcuts (per-op cadence change; timeout edits;
//              row-local timeouts replacing the committed budget; migration-unit
//              edits; weakened/skipped rows; BatchOp/IPC/MCP/interface changes;
//              test-only fix with no store-side pin)
//   §2e/F2/F3  the non-vacuous-census rule, the failing-control draw, and the
//              SET-equality (not whole-file byte) equivalence oracle
//   §3         states S1-S11 + fail-states FS1-FS8
//   §4         the 8-row typed register (P-IM-1/2, P-SM-1/2, P-TP-1..4)
//   §5.1       the pinned budget: exactly 1 persist per corpus import; 3 000 ms
//              per row against the committed testTimeout: 15_000
//
// ---------------------------------------------------------------------------
// REGISTER P-SM-2 SCOPING (TestWriter remand fix (a) — corrected against the
// spec's own §4 literal "derived file set" wording)
// ---------------------------------------------------------------------------
// The spec's §4 `P-SM-2` row says the "no per-op loop as an apply mechanism"
// rule covers "the derived file set (`tests/import-render-no-duplicates.test.ts`
// plus this unit's new contract file)". Applied literally, that rule is
// UNSATISFIABLE and self-contradictory: THIS file is required by its own §2e
// FS8/F2 control draws and by register `P-TP-4` to call the per-op API
// (`perOpApply` — the counter-discrimination control — and P-TP-4's N-bare-calls
// cadence row). The rule is therefore SCOPED TO THE DRIVER FILE ONLY
// (`tests/import-render-no-duplicates.test.ts`) and the control-draw EXEMPTION
// is stated here and demonstrated by the `P-SM-2 scoping pin` below. §4's
// file-set wording is an owed doc amendment (not this role's to edit).
// The import path in THIS file is the batch path (`store.applyBatch(ops)`), so
// the scoping narrows the rule's SUBJECT, not its force.
//
// ---------------------------------------------------------------------------
// P-IM-2's `failedIndex` ORACLE (TestWriter remand fix (b))
// ---------------------------------------------------------------------------
// §4 pins `failedIndex === k`. Three of the four failure modes honour that
// literally (the store returns the failing op's index). The `null-op` draw does
// NOT: `applyBatchOp(null, i)` throws (a TypeError on the null op) BEFORE it can
// name an index, so the batch's `catch` (`src/main/rag-store.ts:1309-1319`, the
// "F1 — an unexpected throw … must still roll back" path) returns
// `failedIndex: -1`. `-1` is therefore pinned for that draw WITH its reason
// (never smoothed to `k`), and the other three modes keep `k`.
//
// ---------------------------------------------------------------------------
// WHY PARTS OF THIS FILE ARE RED TODAY (§1.1, RCA-1: the red run is reported first)
// ---------------------------------------------------------------------------
//   (a) `tests/import-render-no-duplicates.test.ts:52-53` still drives the corpus
//       through the per-op loop (`for (const n of parsed.nodes) await
//       store.putNode(n)` / `… putEdge(e)`), so the driver census pin (P-SM-2)
//       and the driver-source precondition of the two §5.1 budget rows FAIL.
//   (b) `src/main/rag-store.ts` carries NO named deferral seam yet, so the §2b
//       structural pin FAILS (the batch's non-persisting per-op applier is
//       incidental, not enforced).
//   The store-side census rows are expected GREEN on arrival: §1.1 verified that
//   `applyBatchSync` already performs exactly one `persist()` (`:1341`). They are
//   authored anyway because they are what keeps the invariant from regressing
//   (§2b) and what §2e F1 calls the missing half of the fix.
//
// ---------------------------------------------------------------------------
// DATA STATES ENUMERATED (spec §3 S1-S11 — the states exercised below)
// ---------------------------------------------------------------------------
//   S1. Corpus import via ONE applyBatch (the happy path) — real parseMarkdown
//       of `docs/specs/ui-overhaul.md` + all node ops then all edge ops:
//       {ok:true}, results.length === ops.length, 1 persist, file non-empty,
//       journal = ONE `batch` entry, undoDepth() === 1.
//   S2. The same import through the CORRECTED driver (§2a) — pinned by P-SM-2
//       (source contract) + the two §5.1 budget rows.
//   S3. Batch of N = 1 (the boundary: still ONE persist, not two).
//   S4. Empty batch `applyBatch([])`: {ok:true, results:[]}, 0 persists, file
//       bytes untouched.
//   S5. Failed batch (missing endpoint / unsupported setProps / null op /
//       malformed node at k ∈ {0, mid, N-1}): never throws, {ok:false}, 0
//       persists, file byte-identical, in-memory state restored.
//   S6. Persist failure is non-fatal (an unwritable store directory): the batch
//       still returns {ok:true, results} and the in-memory store reflects it.
//   S7. Re-entrancy: `applyBatch` called from INSIDE a queued write (inQueue) —
//       completes, no deadlock, still 1 persist.
//   S8. Serialization: a bare `putNode` racing an in-flight batch — queued AFTER
//       the batch's single persist; both land; the batch's count is still 1.
//   S9. Undo/redo of a batch: undo restores the pre-import state (1 persist),
//       redo re-applies it (1 persist), undoDepth() 1 → 0 → 1.
//   S10. Corpus import at the measured scale (1 895 nodes / 3 745 edges): the
//       S1 oracles + the §5.1 budget.
//   S11. The second corpus file (`docs/specs/user-flow-audit.md`): the same
//       oracles at its own (smaller) size; its census is MEASURED here, never
//       assumed (the §4 census report).
//
// FAIL-STATES PINNED (spec §3 FS1-FS8 + §2e F2/F3):
//   FS1 a per-op full-store write INSIDE the batch → count > 1 → fail, naming the
//       observed count + N.
//   FS2 the batch's single persist is LOST (a deferral flag never cleared) → the
//       file is unchanged after a successful batch → fail; the independent read
//       is the P-TP-3 boot round trip.
//   FS3 a failed batch leaves a visible change → bytes/journal/cursor moved → fail.
//   FS4 the test driver regresses to the per-op loop → P-SM-2 fails naming the file.
//   FS5 `applyBatch` throws for a domain failure → fail (the pinned form is the
//       discriminated result).
//   FS6 the batch stops being ONE journal entry → fail.
//   FS7 a batch op's inverse/redo fidelity breaks → undo does not restore the
//       exact pre-batch set → fail.
//   FS8 the write-count oracle is vacuous (0 counted writes on a writing path) →
//       the CONTROL draw of every census row reads 0 → fail (§2e F2: an empty
//       scan is a FAILURE, never a vacuous pass).
//
// ---------------------------------------------------------------------------
// THE CENSUS INSTRUMENT (spec §4's instrument note, pinned so the oracle is not
// vacuous — F2/FS8): `vi.mock('node:fs')` preserving the real module and wrapping
// `writeFileSync` + `renameSync` with counters that delegate to the real
// implementations. `persist()` writes `${path}.tmp` then renames it onto
// `${path}` — so a rename ONTO THE STORE PATH counts as exactly one persist. The
// mock is hoisted above the `src/main/rag-store.js` import (the store binds
// `writeFileSync`/`renameSync` at module load). EVERY census row carries the
// FS8 control draw (a bare per-op write must count exactly 1) — a 0 reading
// cannot pass. At rename time the instrument also samples the store's journal
// length through a probe, so "the write is the LAST thing to happen" (§4
// P-IM-1) is observable rather than asserted.
// ---------------------------------------------------------------------------
import { describe, it, expect, vi } from 'vitest'
import ts from 'typescript'

const fsCensus = vi.hoisted(() => ({
  writes: [] as string[],
  renames: [] as Array<{ from: string; to: string; journalLen: number | undefined }>,
  probe: null as null | (() => number),
}))

vi.mock('node:fs', async (importOriginal) => {
  const real = await importOriginal<typeof import('node:fs')>()
  return {
    ...real,
    default: real,
    writeFileSync: ((path: unknown, ...rest: unknown[]) => {
      fsCensus.writes.push(String(path))
      return (real.writeFileSync as unknown as (...a: unknown[]) => unknown)(path, ...rest)
    }) as typeof real.writeFileSync,
    renameSync: ((from: unknown, to: unknown) => {
      fsCensus.renames.push({
        from: String(from),
        to: String(to),
        journalLen: fsCensus.probe === null ? undefined : fsCensus.probe(),
      })
      return (real.renameSync as unknown as (...a: unknown[]) => unknown)(from, to)
    }) as typeof real.renameSync,
  }
})

import { mkdtempSync, rmSync, readFileSync, existsSync, statSync, writeFileSync as realWriteFile } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parseMarkdown } from '../src/main/markdown-parse.js'
import {
  createJsonRagStore,
  type RagStore,
  type RagNode,
  type RagEdge,
  type BatchOp,
} from '../src/main/rag-store.js'

const ROOT = join(import.meta.dirname, '..')
const DRIVER_FILE = 'tests/import-render-no-duplicates.test.ts'
const STORE_SRC_FILE = 'src/main/rag-store.ts'

/** The two `SPEC_FILES` of the red rows (`tests/import-render-no-duplicates.test.ts:35-38`). */
const SPEC_FILES = [
  join(ROOT, 'docs', 'specs', 'ui-overhaul.md'),
  join(ROOT, 'docs', 'specs', 'user-flow-audit.md'),
]

// ===========================================================================
// §0.1 — the deterministic PBT harness (mulberry32, pinned seed). NO Math.random().
//        Budget (§4): 60 attempts/row for the seven store rows + 40 for the
//        source-contract row `P-SM-2` → 60×7 + 40 = 460 ≤ 800 at the ceiling
//        (8 × 100); every row ≤ 100; stop-after-5.
// ===========================================================================
const PBT_SEED = 0x69627031 // "ibp-" — this file's pinned seed
const PBT_ATTEMPTS = 60 // §4 — the seven store rows
const PSM2_ATTEMPTS = 40 // §4 — `P-SM-2` (file-level draws, not op-level)
const PBT_STOP_AFTER = 5
const BUDGET_MS = 3_000 // §5.1 — the pinned per-row wall-clock budget
/** The large draw of `P-IM-1`/`P-TP-1` (the measured corpus scale, §3 S10). */
const SCALE_NODES = 1_895
const SCALE_EVERY = 20 // ⇒ 3 scale draws inside a 60-attempt row

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
function int(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}

interface PbtReport {
  row: string
  strategyId: string
  attempts: number
  held: boolean
  counterexamples: string[]
}
/** Run a row's property over the seeded attempts; stop after 5 counterexamples. */
async function runProperty(
  rowId: string,
  strategyId: string,
  check: (i: number, rng: () => number) => string | null | Promise<string | null>,
  attempts: number = PBT_ATTEMPTS,
): Promise<PbtReport> {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  let n = 0
  for (let i = 0; i < attempts; i++) {
    n++
    const ce = await check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  return { row: rowId, strategyId, attempts: n, held: counterexamples.length === 0, counterexamples }
}
/** The per-row report line the TestWriter returns to the supervisor (§4). */
function reportLine(rep: PbtReport): string {
  return `${rep.row} | ${rep.strategyId} | attempts=${rep.attempts} | ${rep.held ? 'held' : `BROKEN x${rep.counterexamples.length}`} | ${rep.counterexamples.slice(0, 3).join(' ;; ')}`
}
function assertHeld(rep: PbtReport): void {
  if (process.env.IMPORT_PERSIST_PBT_REPORT) console.log(`[pbt] ${reportLine(rep)}`)
  expect(rep.held, reportLine(rep)).toBe(true)
}

// ===========================================================================
// §0.2 — fixtures + the census helpers
// ===========================================================================
/** A FIXED timestamp for generated records. `2099` makes the store's
 *  `refreshTimestamp()` deterministic on an UPDATE (`now <= afterMs` ⇒
 *  `afterMs + 1` ms), so the two drivers' `updatedAt` are comparable and the
 *  P-SM-1 set-equality oracle is not a wall-clock coin flip. */
const TS = '2099-01-01T00:00:00.000Z'

function mkNode(id: string, content = `content-${id}`): RagNode {
  return { id, type: 'p', content, ownedNodeIds: [], createdAt: TS, updatedAt: TS }
}
function mkEdge(id: string, source: string, target: string, kind: RagEdge['kind'] = 'next-section'): RagEdge {
  return { id, kind, source, target, createdAt: TS, updatedAt: TS }
}
/** A well-formed corpus-like input: N nodes + edges whose endpoints exist. */
function mkOps(nNodes: number, nEdges: number): { nodes: RagNode[]; edges: RagEdge[]; ops: BatchOp[] } {
  const nodes = Array.from({ length: nNodes }, (_, i) => mkNode(`n${i}`))
  const edges: RagEdge[] = []
  if (nNodes >= 2) {
    for (let i = 0; i < nEdges; i++) {
      const source = nodes[i % nNodes].id
      const target = nodes[(i + 1) % nNodes].id
      edges.push(mkEdge(`e${i}`, source, target, i % 4 === 0 ? 'parent-child' : 'next-section'))
    }
  }
  const ops: BatchOp[] = [
    ...nodes.map((node) => ({ op: 'putNode' as const, node })),
    ...edges.map((edge) => ({ op: 'putEdge' as const, edge })),
  ]
  return { nodes, edges, ops }
}
/** The §2a construction: ALL node ops (parse order) then ALL edge ops. */
function corpusOps(file: string): { documentId: string; nodes: RagNode[]; edges: RagEdge[]; ops: BatchOp[] } {
  const documentId = `docs/specs/${file.split('/').pop()!.replace(/\.md$/, '')}`
  const parsed = parseMarkdown(readFileSync(file, 'utf8'), documentId)
  const ops: BatchOp[] = [
    ...parsed.nodes.map((node) => ({ op: 'putNode' as const, node })),
    ...parsed.edges.map((edge) => ({ op: 'putEdge' as const, edge })),
  ]
  return { documentId, nodes: parsed.nodes as RagNode[], edges: parsed.edges as RagEdge[], ops }
}
/** The PER-OP driver (the mechanism §2a replaces; still the public per-op
 *  contract of §2c item 1 / P-TP-4 — used here only as the CONTROL and as the
 *  comparison arm of P-SM-1). */
async function perOpApply(store: RagStore, ops: BatchOp[]): Promise<void> {
  for (const op of ops) {
    if (op.op === 'putNode') await store.putNode(op.node)
    else if (op.op === 'putEdge') await store.putEdge(op.edge)
    else if (op.op === 'removeNode') await store.removeNode(op.id)
    else if (op.op === 'removeEdge') await store.removeEdge(op.id)
  }
}

interface Census {
  /** renames ONTO the store path — one persist each (§4's instrument note). */
  renames: number
  /** real `writeFileSync` calls on any path (the `${path}.tmp` write) — the
   *  non-vacuity reading of FS8: a "0 persist" claim with 0 writes on a writing
   *  path is a broken instrument, not a property. */
  writes: number
  /** the store's journal length sampled at the moment of each rename */
  journalAtWrite: Array<number | undefined>
}
async function measure<T>(
  storePath: string,
  fn: () => Promise<T> | T,
  probe?: () => number,
): Promise<{ value: T; census: Census }> {
  const r0 = fsCensus.renames.length
  const w0 = fsCensus.writes.length
  fsCensus.probe = probe ?? null
  let value: T
  try {
    value = await fn()
  } finally {
    fsCensus.probe = null
  }
  const mine = fsCensus.renames.slice(r0).filter((r) => r.to === storePath)
  return {
    value,
    census: { renames: mine.length, writes: fsCensus.writes.length - w0, journalAtWrite: mine.map((r) => r.journalLen) },
  }
}

interface StoreCtx {
  dir: string
  file: string
  store: RagStore
}
async function withStore<T>(fn: (ctx: StoreCtx) => Promise<T> | T): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'astrographer-ibp-'))
  try {
    const file = join(dir, 'rag.json')
    return await fn({ dir, file, store: createJsonRagStore({ path: file }) })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
function bytesOf(file: string): string {
  return existsSync(file) ? readFileSync(file).toString('base64') : '<ABSENT>'
}
function nodeSet(store: RagStore): string[] {
  return store
    .listNodes()
    .map((n) => JSON.stringify({ id: n.id, type: n.type, content: n.content, nodeKind: n.nodeKind, children: n.children, documentPath: n.documentPath, tags: n.tags, props: n.props, ownedNodeIds: n.ownedNodeIds, createdAt: n.createdAt, updatedAt: n.updatedAt }))
    .sort()
}
function edgeSet(store: RagStore): string[] {
  return store
    .listEdges()
    .map((e) => JSON.stringify({ id: e.id, kind: e.kind, edgeType: e.edgeType, state: e.state, source: e.source, target: e.target, order: e.order, documentIds: e.documentIds, createdAt: e.createdAt, updatedAt: e.updatedAt }))
    .sort()
}
function stateSets(store: RagStore): { nodes: string[]; edges: string[] } {
  return { nodes: nodeSet(store), edges: edgeSet(store) }
}
function okOrMessage(res: { ok: boolean }, label: string): string | null {
  if (res.ok === true) return null
  const r = res as { error?: string; failedIndex?: number }
  return `${label}: applyBatch returned ok=false — ${String(r.error)} (failedIndex=${String(r.failedIndex)}). §2a: the row must fail loudly rather than run vacuously.`
}
/** Insert a deliberately-bad op at the FIRST / MIDDLE / LAST position and report
 *  its index (the `failedIndex` the contract pins for that draw). */
function withBadOp(good: BatchOp[], bad: BatchOp, where: 'first' | 'mid' | 'last'): { ops: BatchOp[]; k: number } {
  if (where === 'first') return { ops: [bad, ...good], k: 0 }
  if (where === 'last') return { ops: [...good, bad], k: good.length }
  const k = Math.floor(good.length / 2)
  return { ops: [...good.slice(0, k), bad, ...good.slice(k)], k }
}
function rmFileSyncSafe(dir: string): void {
  rmSync(dir, { recursive: true, force: true })
}

/** The source with every COMMENT blanked IN PLACE (length + line structure
 *  preserved), using the PARSER's own comment ranges
 *  (`ts.getLeadingCommentRanges`/`getTrailingCommentRanges`) walked over every
 *  node AND token. The parser is the only reliable form: a regex cannot tell a
 *  comment from code (nor a `//` inside a string literal), and a bare
 *  `ts.createScanner` mis-tracks regex/template literals and silently stops
 *  recognising whole comment runs. (This helper exists because
 *  `tests/unit-v5-migration-contract.test.ts`'s `codeOnly` was a silent no-op:
 *  `ts.isCommentTrivia` is not a public TypeScript API (`undefined`), so its
 *  `?.` guard skipped every blanking step. Fixed here and there.) */
function codeOnly(src: string): string {
  const sf = ts.createSourceFile('scan.ts', src, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
  const ranges: Array<[number, number]> = []
  const collect = (node: ts.Node): void => {
    for (const r of ts.getLeadingCommentRanges(src, node.pos) ?? []) ranges.push([r.pos, r.end])
    for (const r of ts.getTrailingCommentRanges(src, node.end) ?? []) ranges.push([r.pos, r.end])
  }
  const visit = (node: ts.Node): void => {
    collect(node)
    for (const child of node.getChildren(sf)) visit(child)
  }
  visit(sf)
  const out = src.split('')
  for (const [start, end] of ranges) for (let i = start; i < end; i++) if (src[i] !== '\n') out[i] = ' '
  return out.join('')
}

// ===========================================================================
// §1 — the §3 states: the corpus census (S1/S10/S11), the boundaries (S3/S4),
//      the failed-batch oracle (S5), the non-fatal persist (S6), the queue
//      behaviours (S7/S8) and undo/redo (S9).
// ===========================================================================
describe('§3 states — the persist census, the boundaries and the durability oracles', () => {
  for (const file of SPEC_FILES) {
    it(`S1/S10/S11 — ${file.split('/').pop()} imported through ONE applyBatch performs EXACTLY 1 persist (N-independent)`, async () => {
      const { nodes, edges, ops } = corpusOps(file)
      if (process.env.IMPORT_PERSIST_REPORT) {
        console.log(`[census] ${file.split('/').pop()}: ${nodes.length} nodes / ${edges.length} edges / ${ops.length} ops`)
      }
      await withStore(async ({ file: storePath, store }) => {
        const { value: res, census } = await measure(storePath, () => store.applyBatch(ops), () => store.journal().length)
        const label = `${file.split('/').pop()} (N=${ops.length})`
        expect(okOrMessage(res as never, label)).toBeNull()
        if (!res.ok) return
        expect(res.results.length, `${label}: results must carry one entry per op`).toBe(ops.length)
        // §2b — the invariant: exactly ONE full-store write for the whole corpus.
        // FS1: a count > 1 names the per-op full-store write inside the batch.
        expect(
          census.renames,
          `FS1/§2b: the corpus import performed ${census.renames} full-store writes for N=${ops.length} ops — the invariant is EXACTLY 1 (a count > 1 is a per-op persist inside the batch; a count of 0 is FS2, a lost persist)`,
        ).toBe(1)
        // FS8/§2e F2 — non-vacuity: the instrument must have seen the REAL write.
        expect(census.writes, `${label}: 0 writeFileSync calls observed — the census instrument is vacuous (FS8), not the store innocent`).toBeGreaterThan(0)
        // §4 P-IM-1 — "the write is the LAST thing to happen": at rename time the
        // batch's single journal entry has already landed.
        expect(census.journalAtWrite, `${label}: the persist must follow the batch's single journal entry (§2b item 1)`).toEqual([1])
        // §2b item 1 — ONE `batch` journal entry; undoDepth advances by 1.
        expect(store.journal().length, `${label}: FS6 — the batch must land as ONE journal entry`).toBe(1)
        expect(store.journal()[0].kind, `${label}: FS6 — the entry kind must be 'batch'`).toBe('batch')
        expect(store.undoDepth(), `${label}: undoDepth() advances by 1 (not N)`).toBe(1)
        // FS2 — the persist is not lost: the file exists and is non-empty, and an
        // INDEPENDENT read (a fresh store over the same path) sees the corpus.
        expect(existsSync(storePath), `${label}: FS2 — the single persist did not happen (no file)`).toBe(true)
        expect(statSync(storePath).size, `${label}: FS2 — the store file is empty`).toBeGreaterThan(0)
        expect(store.listNodes().length, `${label}: the batch's distinct node ids must be present`).toBe(nodes.length)
        expect(store.listEdges().length, `${label}: the batch's distinct edge ids must be present`).toBe(edges.length)
        // FS8 control draw — the counter discriminates a per-op write from a batch.
        const control = await measure(storePath, () => store.putNode(mkNode('control-1')), () => store.journal().length)
        expect(control.census.renames, `${label}: FS8 control — a bare putNode must count exactly 1 persist (a 0 reading means the instrument is broken)`).toBe(1)
      })
    })
  }

  it('S3 — the boundary: a batch of N = 1 performs exactly 1 persist (it does not become two)', async () => {
    await withStore(async ({ file: storePath, store }) => {
      const { nodes, ops } = mkOps(1, 0)
      const { value: res, census } = await measure(storePath, () => store.applyBatch(ops))
      expect(okOrMessage(res as never, 'S3')).toBeNull()
      expect(census.renames, 'S3: N=1 is still ONE persist').toBe(1)
      expect(census.writes, 'S3: the instrument must observe the real write (FS8)').toBeGreaterThan(0)
      expect(store.listNodes().length).toBe(nodes.length)
      expect(store.journal().length).toBe(1)
      expect(store.undoDepth()).toBe(1)
    })
  })

  it('S4 — an empty batch performs 0 persists and leaves the store file byte-identical', async () => {
    await withStore(async ({ file: storePath, store }) => {
      const seed = await store.applyBatch(mkOps(3, 2).ops)
      expect(okOrMessage(seed as never, 'S4 seed')).toBeNull()
      const before = bytesOf(storePath)
      const { value: res, census } = await measure(storePath, () => store.applyBatch([]))
      expect(res.ok, 'S4: an empty batch is a valid no-op ({ok:true, results:[]})').toBe(true)
      expect(res.ok ? res.results : null, 'S4: no results for an empty batch').toEqual([])
      expect(census.renames, 'S4: 0 persists for an empty batch').toBe(0)
      expect(bytesOf(storePath), 'S4: the file bytes must be untouched').toBe(before)
      expect(store.journal().length, 'S4: the journal is unchanged').toBe(1)
      expect(store.undoDepth()).toBe(1)
    })
  })

  it('S5/FS3/FS5/P-IM-2 — a batch that fails at k performs 0 persists and leaves the file BYTE-IDENTICAL', async () => {
    const modes = ['putEdge-missing-target', 'unsupported-setProps', 'malformed-node', 'null-op'] as const
    for (const mode of modes) {
      for (const where of ['first', 'mid', 'last'] as const) {
        await withStore(async ({ file: storePath, store }) => {
          // a NON-EMPTY store first, so the byte-identity oracle is non-trivial
          const seed = await store.applyBatch(mkOps(4, 3).ops)
          expect(okOrMessage(seed as never, 'S5 seed')).toBeNull()
          const beforeBytes = bytesOf(storePath)
          const beforeState = stateSets(store)
          const beforeJournal = store.journal().length
          const beforeCursor = store.undoDepth()

          const good = mkOps(3, 2).ops
          const badOp: BatchOp =
            mode === 'putEdge-missing-target'
              ? ({ op: 'putEdge', edge: mkEdge('bad-edge', 'n0', 'ghost-node') } as BatchOp)
              : mode === 'unsupported-setProps'
                ? ({ op: 'setProps', nodeId: 'n0', props: {} } as BatchOp)
                : mode === 'malformed-node'
                  ? ({ op: 'putNode', node: { ...mkNode(''), id: '' } } as BatchOp)
                  : (null as unknown as BatchOp)
          const { ops, k: badIdx } = withBadOp(good, badOp, where)

          let threw: string | null = null
          let res: Awaited<ReturnType<RagStore['applyBatch']>> | undefined
          const { value, census } = await measure(storePath, async () => {
            try {
              return await store.applyBatch(ops)
            } catch (e) {
              threw = (e as Error).message
              return undefined
            }
          })
          res = value
          const label = `${mode} at index ${badIdx} (${where})`
          // FS5 — `applyBatch` NEVER throws for a domain failure.
          expect(threw, `${label}: FS5 — applyBatch must return the discriminated result, not throw (threw: ${threw})`).toBeNull()
          expect(res?.ok, `${label}: the batch must fail (ok=false)`).toBe(false)
          // The pinned failure index per mode: the four shape/reference failures
          // carry their op index; the null-op draw reaches the F1 catch path,
          // which reports -1 (`rag-store.ts` `applyBatchSync`'s catch). That
          // divergence from §4's literal "failedIndex === k" is RECORDED here,
          // never smoothed over (see the TestWriter's §4 report note).
          const expectedIndex = mode === 'null-op' ? -1 : badIdx
          expect((res as { failedIndex?: number } | undefined)?.failedIndex, `${label}: failedIndex`).toBe(expectedIndex)
          // FS3/P-IM-2 — ZERO visible persists, byte-identical file.
          expect(census.renames, `${label}: FS3 — a failed batch must perform ZERO persists`).toBe(0)
          expect(bytesOf(storePath), `${label}: FS3 — the store file must be BYTE-IDENTICAL to its pre-batch bytes`).toBe(beforeBytes)
          expect(stateSets(store), `${label}: the batch must roll back to the pre-batch node/edge sets`).toEqual(beforeState)
          expect(store.journal().length, `${label}: the journal must not be polluted`).toBe(beforeJournal)
          expect(store.undoDepth(), `${label}: the cursor must be restored`).toBe(beforeCursor)
        })
      }
    }
  })

  it('S6 — a persist failure is NON-FATAL: the batch still returns {ok:true} and the in-memory store reflects it', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'astrographer-ibp-ro-'))
    try {
      // An unwritable store DIRECTORY: `<dir>/blocked` is a FILE, so persist()'s
      // mkdirSync throws EEXIST and its `catch {}` (`rag-store.ts:805`) swallows
      // it — the documented non-fatal path (§2b item 4), independent of the
      // process's uid (a chmod-based read-only dir is bypassed by root).
      const blocked = join(dir, 'blocked')
      realWriteFile(blocked, 'not-a-directory')
      const storePath = join(blocked, 'rag.json')
      const store = createJsonRagStore({ path: storePath })
      const { nodes, ops } = mkOps(3, 2)
      const { value: res, census } = await measure(storePath, () => store.applyBatch(ops))
      expect(okOrMessage(res as never, 'S6')).toBeNull()
      expect(census.renames, 'S6: no rename can land on an unwritable path').toBe(0)
      expect(store.listNodes().length, 'S6: the in-memory store reflects the batch').toBe(nodes.length)
      expect(store.journal().length, 'S6: the journal still landed').toBe(1)
      expect(store.undoDepth()).toBe(1)
      // The persist was ATTEMPTED and swallowed by `catch {}`: persist()'s own
      // `mkdirSync` guard throws EEXIST first, so zero writes reach the disk —
      // recorded explicitly rather than asserted loosely (§2b item 4).
      expect(census.writes, 'S6: no write may land on an unwritable path (the guard throws before the write)').toBe(0)
    } finally {
      rmFileSyncSafe(dir)
    }
  })

  it('S7 — re-entrancy: an applyBatch from INSIDE a queued write completes (no deadlock) and still persists once', async () => {
    await withStore(async ({ file: storePath, store }) => {
      let inner: Census | null = null
      const outer = await measure(storePath, () =>
        store.enqueue(async () => {
          await store.putNode(mkNode('inside-1'))
          const m = await measure(storePath, () => store.applyBatch(mkOps(5, 4).ops))
          inner = m.census
          return m.value
        }),
      )
      expect(okOrMessage(outer.value as never, 'S7')).toBeNull()
      expect(store.getNode('inside-1'), 'S7: the queued write landed').toBeDefined()
      expect(store.listNodes().length, 'S7: the nested batch landed').toBe(6)
      expect(inner, 'S7: the nested measurement must have run').not.toBeNull()
      expect((inner as unknown as Census).renames, 'S7: the nested batch performed exactly 1 persist').toBe(1)
      expect(outer.census.renames, 'S7: the queued putNode (1) + the nested batch (1) = 2 persists, no more').toBe(2)
    })
  })

  it('S8 — serialization: a bare putNode racing an in-flight batch is queued AFTER the batch’s single persist', async () => {
    await withStore(async ({ file: storePath, store }) => {
      const { nodes, ops } = mkOps(6, 5)
      const { census } = await measure(storePath, async () => {
        const batch = store.applyBatch(ops)
        const plain = store.putNode(mkNode('racing-1'))
        await Promise.all([batch, plain])
      })
      // single-writer: the batch is ONE write unit, and the plain write follows it
      expect(census.renames, 'S8: 2 writes — the batch’s single persist + the queued plain write').toBe(2)
      expect(store.getNode('racing-1'), 'S8: the racing write landed').toBeDefined()
      expect(store.listNodes().length, 'S8: both the batch and the plain write are present').toBe(nodes.length + 1)
      expect(store.journal().filter((e) => e.kind === 'batch').length, 'S8: exactly one batch entry').toBe(1)
    })
  })

  it('S9 — undo/redo of a batch: 1 persist each, undo restores the pre-import state exactly, redo re-applies it', async () => {
    await withStore(async ({ file: storePath, store }) => {
      // the seed uses its OWN id namespace, so the import below is a genuine ADD
      // (overlapping ids would make the batch an UPDATE of the seed's records and
      // the "+N" census below meaningless)
      const seed = await store.applyBatch([
        { op: 'putNode', node: mkNode('s0') },
        { op: 'putNode', node: mkNode('s1') },
        { op: 'putNode', node: mkNode('s2') },
        { op: 'putEdge', edge: mkEdge('se0', 's0', 's1') },
        { op: 'putEdge', edge: mkEdge('se1', 's1', 's2') },
      ] as BatchOp[])
      expect(okOrMessage(seed as never, 'S9 seed')).toBeNull()
      const preImport = stateSets(store)
      const { nodes, edges, ops } = mkOps(12, 10)
      const batch = await measure(storePath, () => store.applyBatch(ops))
      expect(okOrMessage(batch.value as never, 'S9 batch')).toBeNull()
      expect(batch.census.renames, 'S9: the batch persists once').toBe(1)
      const postImport = stateSets(store)
      expect(store.undoDepth(), 'S9: undoDepth advances by 1').toBe(2)

      const undo = await measure(storePath, () => store.undo())
      expect(undo.value, 'S9: undo returns the batch entry').not.toBeNull()
      expect(undo.census.renames, 'S9/FS7: undo persists once (not N)').toBe(1)
      expect(stateSets(store), 'S9/FS7: undo must restore the EXACT pre-import node/edge sets').toEqual(preImport)
      expect(store.listNodes().length).toBe(3)
      expect(store.listEdges().length).toBe(2)
      expect(store.undoDepth()).toBe(1)

      const redo = await measure(storePath, () => store.redo())
      expect(redo.value, 'S9: redo returns the batch entry').not.toBeNull()
      expect(redo.census.renames, 'S9: redo persists once (not N)').toBe(1)
      expect(stateSets(store), 'S9: redo must re-apply the exact post-import sets').toEqual(postImport)
      expect(store.listNodes().length).toBe(nodes.length + 3)
      expect(store.listEdges().length).toBe(edges.length + 2)
      expect(store.undoDepth()).toBe(2)
    })
  })
})

// ===========================================================================
// §2 — §2b's named seam, made STRUCTURAL (§5.2 item 2; FS1's real guard).
//      RED TODAY: the batch's non-persisting per-op applier is incidental.
// ===========================================================================
describe('§2b — the named deferral seam is STRUCTURAL in src/main/rag-store.ts', () => {
  const bodyOf = (src: string, header: string): string => {
    const at = src.indexOf(header)
    if (at < 0) return ''
    // a bounded window: the function's own first ~60 lines (enough for a guard
    // check + the loop that must set it), so a name elsewhere cannot satisfy it
    return src.slice(at, at + 6_000)
  }
  const SRC = codeOnly(readFileSync(join(ROOT, STORE_SRC_FILE), 'utf8'))
  const DEFER_IDENT = /[A-Za-z_$][\w$]*[Dd]efer[\w$]*/

  it('the store carries a named deferral seam (seam (a) `persistDeferred` recommended, or seam (b) `runDeferred(`) consulted by persist() and set around the batch loop', () => {
    const persistBody = bodyOf(SRC, 'function persist(')
    const batchBody = bodyOf(SRC, 'function applyBatchSync(')
    const namedSeam = /\bpersistDeferred\b/.test(SRC) || /\brunDeferred\s*\(/.test(SRC)
    expect(
      persistBody.length > 0 && batchBody.length > 0,
      `§2b: could not locate persist()/applyBatchSync() in ${STORE_SRC_FILE} — the source-contract pin cannot read its subject`,
    ).toBe(true)
    expect(
      namedSeam,
      '§2b/§5.2 item 2: the store must carry a NAMED deferral seam so the DONE row can record it — observed neither `persistDeferred` (seam (a), the spec’s recommended default) nor `runDeferred(` (seam (b)) in src/main/rag-store.ts',
    ).toBe(true)
    expect(
      DEFER_IDENT.test(persistBody),
      '§2b: persist() must consult the deferral guard — a per-op persist() reached INSIDE a batch must be IMPOSSIBLE, not merely absent (FS1). No deferral identifier found in persist()’s body (comments stripped).',
    ).toBe(true)
    expect(
      DEFER_IDENT.test(batchBody),
      '§2b: applyBatchSync() must SET/CLEAR the deferral guard around its op loop — no deferral identifier found in its body (comments stripped).',
    ).toBe(true)
  })
})

// ===========================================================================
// §3 — §5.1's budget: the two `import-render-no-duplicates` rows, 3 000 ms each.
//      The reading is only meaningful for the mechanism the DRIVER uses (§2a),
//      so each budget row carries the driver-source precondition and is RED
//      until the driver correction lands. The per-op arm is NOT re-timed here:
//      it reads ~19 s (the red rows' own reading) and would only burn budget.
//
//      DISCRIMINATING POWER (remand fix (c) — recorded, budget KEPT at 3 000 ms):
//      the budget discriminates on `docs/specs/ui-overhaul.md` ONLY. The
//      `user-flow-audit.md` draw is already fast (its row is ~127 ms per the
//      red-run record; its import measured 3 ms in the probe / 43 ms for
//      ui-overhaul) — so that row is a regression canary, not a budget row. The
//      budget is kept anyway because it is the ONE number §5.1 pins for this
//      corpus and it still fails loudly on the regression it exists for: a return
//      to per-edge persist reads 19 486 ms on ui-overhaul.md (measured) — 6.5×
//      over. Tightening it further would only add flake risk under suite load.
// ===========================================================================
describe('§5.1 — the pinned 3 000 ms per-row wall clock for the two import-render-no-duplicates rows', () => {
  for (const file of SPEC_FILES) {
    it(`${file.split('/').pop()} — the import the row performs stays inside the pinned ${BUDGET_MS} ms budget (committed suite budget: 15 000 ms)`, async () => {
      const driver = readFileSync(join(ROOT, DRIVER_FILE), 'utf8')
      const reasons = checkDriverSource(driver, DRIVER_FILE)
      const { nodes, edges, ops } = corpusOps(file)
      const elapsed = await withStore(async ({ store }) => {
        const start = performance.now()
        const res = await store.applyBatch(ops)
        const ms = performance.now() - start
        expect(okOrMessage(res as { ok: boolean }, '§5.1')).toBeNull()
        return ms
      })
      const name = file.split('/').pop()
      // Remand fix (c): WHICH row the budget discriminates on is recorded, not
      // implied — the budget bites on ui-overhaul.md only (the user-flow-audit
      // draw is already fast: ~127 ms row / 3 ms import), and the budget is KEPT.
      const discriminates = name === 'ui-overhaul.md'
      if (process.env.IMPORT_PERSIST_REPORT) {
        console.log(
          `[budget] ${name}: ${Math.round(elapsed)} ms for ${nodes.length} nodes / ${edges.length} edges — ${discriminates ? 'the row the budget discriminates on' : 'already fast: a regression CANARY only, not the discriminating drawing (the budget bites on ui-overhaul.md)'}`,
        )
      }
      // BOTH halves in ONE message, so a red run names the source cause AND the
      // measured reading (the compound pin: the budget reading is only valid for
      // the mechanism the driver actually uses — §2a).
      const failures: string[] = []
      if (reasons.length > 0) {
        failures.push(`§2a NOT LANDED — ${DRIVER_FILE} still drives the corpus through the per-op loop, so the row cannot be inside the budget: ${reasons.join(' | ')}`)
      }
      if (!(elapsed < BUDGET_MS)) {
        failures.push(`§5.1 BUDGET — the corpus import took ${Math.round(elapsed)} ms (${nodes.length} nodes / ${edges.length} edges / ${ops.length} ops) for a pinned budget of ${BUDGET_MS} ms (committed suite budget: 15 000 ms). A per-op-persistence regression reads ~19 000 ms, not ~3 000 ms (RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT §9)`)
      }
      expect(failures, `${name}: §5.1 pins this row at < ${BUDGET_MS} ms via the §2a mechanism`).toEqual([])
    })
  }
})

// ===========================================================================
// §4 — the 8-row typed register (P-IM-1/2, P-SM-1/2, P-TP-1..4). Seeded draws,
//      60 attempts/row (40 for P-SM-2), stop-after-5, every census row carrying
//      the FS8 control draw.
// ===========================================================================
describe('§4 register — the persist invariant, its controls and its anti-regression companions', () => {
  it('P-IM-1 (strat:batch-size) — a batch of N ops performs exactly ONE full-store write, for every N', async () => {
    const LADDER = [1, 2, 7, 40, 200]
    let controlsRun = 0
    const rep = await runProperty('P-IM-1', 'strat:batch-size', async (i) => {
      const nNodes = i % SCALE_EVERY === 0 ? SCALE_NODES : LADDER[i % LADDER.length]
      const nEdges = nNodes === 1 ? 0 : Math.max(1, Math.floor(nNodes * 1.5))
      const { ops } = mkOps(nNodes, nEdges)
      return await withStore(async ({ file: storePath, store }) => {
        const { value: res, census } = await measure(storePath, () => store.applyBatch(ops), () => store.journal().length)
        if (res.ok !== true) return `N=${ops.length}: ok=false (${String((res as { error?: string }).error)})`
        if (census.renames !== 1) return `N=${ops.length}: persistCount=${census.renames} (the invariant is exactly 1; >1 is FS1, 0 is FS2)`
        if (census.writes < 1) return `N=${ops.length}: 0 writeFileSync calls — a vacuous census (FS8)`
        if (census.journalAtWrite[0] !== 1) return `N=${ops.length}: the rename landed with journal length ${String(census.journalAtWrite[0])} — the write must follow the batch's single journal entry`
        // FS8 control (a): the counter must discriminate — a per-op loop over the
        // SAME ops counts N. Run on the small draws only (the scale draw's per-op
        // arm is the ~19 s path the red rows already record).
        if (nNodes <= 40 && i % 7 === 0) {
          controlsRun++
          const ctrl = await withStore(async ({ file: ctrlPath, store: ctrlStore }) => {
            const m = await measure(ctrlPath, () => perOpApply(ctrlStore, ops))
            return m.census
          })
          if (ctrl.renames !== ops.length) return `control (per-op loop, N=${ops.length}): persistCount=${ctrl.renames} — the instrument does not discriminate (FS8)`
        }
        return null
      })
    })
    assertHeld(rep)
    expect(controlsRun, 'P-IM-1 must carry at least one FS8 control draw (a 0-reading census may never pass)').toBeGreaterThan(0)
  })

  it('P-IM-2 (strat:failed-batch) — a failed batch performs ZERO visible persists, leaves the file byte-identical, and reports the pinned failedIndex', async () => {
    const modes = ['putEdge-missing-target', 'unsupported-setProps', 'malformed-node', 'null-op'] as const
    const rep = await runProperty('P-IM-2', 'strat:failed-batch', async (i, rng) => {
      const nNodes = int(rng, 2, 12)
      const { ops: good } = mkOps(nNodes, Math.max(1, nNodes - 1))
      const where = (['first', 'mid', 'last'] as const)[i % 3]
      const mode = modes[i % modes.length]
      const badOp: BatchOp =
        mode === 'putEdge-missing-target'
          ? ({ op: 'putEdge', edge: mkEdge('bad-edge', 'n0', 'ghost-node') } as BatchOp)
          : mode === 'unsupported-setProps'
            ? ({ op: 'setProps', nodeId: 'n0', props: {} } as BatchOp)
            : mode === 'malformed-node'
              ? ({ op: 'putNode', node: { ...mkNode(''), id: '' } } as BatchOp)
              : (null as unknown as BatchOp)
      const { ops, k } = withBadOp(good, badOp, where)
      return await withStore(async ({ file: storePath, store }) => {
        const seed = await store.applyBatch(mkOps(3, 2).ops)
        if (seed.ok !== true) return `seed failed: ${String((seed as { error?: string }).error)}`
        const beforeBytes = bytesOf(storePath)
        const beforeState = stateSets(store)
        const { value: res, census } = await measure(storePath, () => store.applyBatch(ops))
        if (res.ok !== false) return `mode=${mode} k=${k}: ok=${String(res.ok)} — a malformed batch must fail`
        // §4's literal oracle is `failedIndex === k`, which the three
        // shape/reference modes honour exactly. The `null-op` draw DOES NOT: it
        // throws inside applyBatchOp before an index can be named, so the F1
        // catch (`rag-store.ts:1309-1319`) reports `-1`. Pinned as `-1` WITH that
        // reason rather than smoothed to `k` (remand fix (b)).
        const expectedIndex = mode === 'null-op' ? -1 : k
        const observedIndex = (res as { failedIndex?: number }).failedIndex
        if (observedIndex !== expectedIndex) {
          return `mode=${mode} k=${k}: failedIndex=${String(observedIndex)} — the pinned value is ${expectedIndex}${mode === 'null-op' ? ' (the null-op draw reaches the F1 catch path, which cannot name an index: src/main/rag-store.ts:1319)' : ' (the failing op’s own index)'}`
        }
        if (census.renames !== 0) return `mode=${mode} k=${k}: persistCount=${census.renames} — a failed batch must not persist (FS3)`
        if (bytesOf(storePath) !== beforeBytes) return `mode=${mode} k=${k}: the store file bytes CHANGED across a failed batch (FS3)`
        const after = stateSets(store)
        if (JSON.stringify(after) !== JSON.stringify(beforeState)) return `mode=${mode} k=${k}: the node/edge sets moved — the rollback is not exact (FS3)`
        return null
      })
    })
    assertHeld(rep)
  })

  it('P-SM-1 (strat:driver-equivalence) — the batch driver and the per-op driver produce SET-EQUAL node/edge payloads (scoped per F3; the whole-file byte comparison is a stated NON-goal)', async () => {
    const rep = await runProperty('P-SM-1', 'strat:driver-equivalence', async (i) => {
      const shape = i % 3 // 0 nodes-only, 1 nodes+edges, 2 one node updated twice
      const base = mkOps(6, 5)
      const ops: BatchOp[] =
        shape === 0
          ? base.nodes.map((node) => ({ op: 'putNode' as const, node }))
          : shape === 1
            ? base.ops
            : [
                { op: 'putNode', node: mkNode('u0', 'first-write') },
                { op: 'putNode', node: mkNode('u0', 'second-write') },
              ]
      return await withStore(async ({ store: batchStore }) => {
        const batchRes = await batchStore.applyBatch(ops)
        if (batchRes.ok !== true) return `shape=${shape}: the batch driver failed (${String((batchRes as { error?: string }).error)})`
        return await withStore(async ({ store: perOpStore }) => {
          await perOpApply(perOpStore, ops)
          const batchSets = stateSets(batchStore)
          const perOpSets = stateSets(perOpStore)
          if (JSON.stringify(batchSets) !== JSON.stringify(perOpSets)) {
            const nDiff = batchSets.nodes.find((x, j) => x !== perOpSets.nodes[j])
            const eDiff = batchSets.edges.find((x, j) => x !== perOpSets.edges[j])
            return `shape=${shape}: the drivers diverge — nodes[${String(batchSets.nodes.length)}∤${String(perOpSets.nodes.length)}] ${String(nDiff)} | edges[${String(batchSets.edges.length)}∤${String(perOpSets.edges.length)}] ${String(eDiff)}`
          }
          // the oracle also asserts the PINNED DIFFERENCE, so it cannot pass by
          // comparing the wrong thing: ONE batch entry vs N entries (F3).
          if (batchStore.journal().at(-1)?.kind !== 'batch') return `shape=${shape}: the batch side's last journal entry is not 'batch' (FS6)`
          if (batchStore.journal().length !== 1) return `shape=${shape}: the batch side must land ONE journal entry, saw ${batchStore.journal().length}`
          if (perOpStore.journal().length !== ops.length) return `shape=${shape}: the per-op side must land ${ops.length} entries, saw ${perOpStore.journal().length}`
          return null
        })
      })
    })
    assertHeld(rep)
  })

  it('P-SM-2 (strat:driver-census) — the DRIVER file ONLY (tests/import-render-no-duplicates.test.ts) uses the batch path and carries no per-op loop (source contract; the negative draws must FAIL)', async () => {
    // SCOPING (remand fix (a)): the rule's subject is the DRIVER file alone —
    // `DRIVER_FILE`. The spec §4's literal "derived file set" wording (driver +
    // this contract file) is unsatisfiable: this file MUST call the per-op API in
    // its FS8/F2 control draws (`perOpApply`) and in register `P-TP-4`. The
    // control-draw exemption is stated in this file's header and DEMONSTRATED by
    // the `P-SM-2 scoping pin` below (the same detector, applied to this file,
    // flags those controls — which is precisely why the rule cannot cover it).
    const driver = readFileSync(join(ROOT, DRIVER_FILE), 'utf8')
    const rep = await runProperty(
      'P-SM-2',
      'strat:driver-census',
      (i) => {
        const draw = i % 6
        if (draw === 0) {
          // the REAL file — this is the pin that fails today (§2a not landed)
          const reasons = checkDriverSource(driver, DRIVER_FILE)
          return reasons.length === 0 ? null : `the real driver fails the batch-path checks: ${reasons.join(' | ')}`
        }
        if (draw === 1) {
          // negative: the batch call removed
          const reasons = checkDriverSource(driver.replace(/applyBatch\s*\(/g, 'putNode('), `${DRIVER_FILE} [synthetic: no applyBatch]`)
          return reasons.length > 0 ? null : 'the negative draw (no applyBatch call) was NOT flagged — the check does not discriminate'
        }
        if (draw === 2) {
          // negative: the old per-op loop injected
          const mutated = driver + '\nasync function old(s, parsed) {\n  for (const n of parsed.nodes) await s.store.putNode(n)\n}\n'
          const reasons = checkDriverSource(mutated, `${DRIVER_FILE} [synthetic: injected loop]`)
          return reasons.length > 0 ? null : 'the negative draw (an injected per-op loop) was NOT flagged'
        }
        if (draw === 3) {
          // negative: an EMPTY file — §2e F2: an empty scan is a FAILURE
          const reasons = checkDriverSource('', `${DRIVER_FILE} [synthetic: empty]`)
          return reasons.length > 0 ? null : 'the empty-file draw was NOT flagged — an empty scan may never pass (F2)'
        }
        if (draw === 4) {
          // negative: a file that loops a DIFFERENT store method (no batch path)
          const text = 'async function applyAll(s, parsed) {\n  for (const n of parsed.nodes) await s.removeNode(n.id)\n}\n'
          const reasons = checkDriverSource(text, `${DRIVER_FILE} [synthetic: other loop]`)
          return reasons.length > 0 ? null : 'the different-method draw was NOT flagged (it carries no applyBatch call)'
        }
        // positive: the corrected pattern
        const text = 'async function importFile(store, ops) {\n  const res = await store.applyBatch(ops)\n  return res\n}\n'
        const reasons = checkDriverSource(text, `${DRIVER_FILE} [synthetic: corrected]`)
        return reasons.length === 0 ? null : `the corrected-pattern draw was flagged (false positive): ${reasons.join(' | ')}`
      },
      PSM2_ATTEMPTS,
    )
    assertHeld(rep)
  })

  it('P-SM-2 scoping pin (remand fix (a), re-scoped on the FINAL remand) — the per-op-loop rule covers the DRIVER file only and still has DISCRIMINATING POWER (pinned on a synthetic pre-§2a driver, never on the corrected real one), and this file’s control-draw exemption is REQUIRED (demonstrated, not asserted away)', () => {
    const selfFile = 'tests/unit-import-batch-persist-contract.test.ts'
    const selfSrc = readFileSync(join(ROOT, selfFile), 'utf8')
    // CODE ONLY (commments blanked in place): this pin's own prose must NAME the
    // forbidden construct to report it, so a raw-text scan would flag itself.
    const selfCode = codeOnly(selfSrc)
    // (1) DISCRIMINATING POWER (re-scoped on the FINAL remand): the rule's force
    //     claim is that it FLAGS a per-op-loop driver. The REAL driver no longer
    //     carries one — §2a is LANDED: `importFile` applies the corpus through
    //     ONE `applyBatch(ops)` with its `result.ok` checked
    //     (`tests/import-render-no-duplicates.test.ts:55-74`), so the real file
    //     now reads ZERO reasons. Pinning `> 0` on the real driver would be a
    //     PRE-fix (stale) expectation and would contradict the register's own
    //     `P-SM-2` draw 0 (`:860-863`) and BOTH §5.1 budget rows (`:694-695`),
    //     which require `checkDriverSource(<the real driver>).length === 0`.
    //     Identical arguments ⇒ identical result, so the discriminating-power
    //     claim is pinned against a SYNTHETIC PRE-§2a driver text instead — the
    //     exact draw shape register `P-SM-2` already uses (draws 1-5 above — the
    //     synthetic texts there use the `s.store.` receiver, the form the checker
    //     flags via its `\bs\.store\.` arm, so a fixture is never mistaken for a
    //     real per-op apply mechanism by the site scan in item (3) below), so the
    //     rule is shown to bite on the construct it exists to forbid.
    const preSM2aDriver = [
      'async function importFile(s, parsed) {',
      '  for (const n of parsed.nodes) await s.store.putNode(n)',
      '  for (const e of parsed.edges) await s.store.putEdge(e)',
      '  return { nodeIds: parsed.nodes.map((n) => n.id) }',
      '}',
      '',
    ].join('\n')
    const preReasons = checkDriverSource(preSM2aDriver, `${DRIVER_FILE} [synthetic: pre-§2a per-op loop]`)
    expect(
      preReasons.length,
      `the rule's SUBJECT is ${DRIVER_FILE}, and it must still have DISCRIMINATING POWER after §2a landed: a synthetic PRE-§2a per-op-loop driver must be flagged — ${preReasons.length} reason(s)`,
    ).toBeGreaterThan(0)
    expect(preReasons.join(' | '), 'the flagged reasons must NAME the per-op call inside a loop').toMatch(/store\.(putNode|putEdge)\(\) inside a loop/)

    // (1b) The SAME detector applied to the REAL (now §2a-corrected) driver must
    //      read ZERO — the corrected driver is clean BY BEING CORRECT, not by the
    //      scoping, and this is the identical reading register `P-SM-2` draw 0 and
    //      both §5.1 budget rows require. The scoping narrows the rule's SUBJECT,
    //      never its force: no `> 0` expectation is placed on this file.
    const driverReasons = checkDriverSource(readFileSync(join(ROOT, DRIVER_FILE), 'utf8'), DRIVER_FILE)
    expect(
      driverReasons,
      `§2a is LANDED, so the REAL ${DRIVER_FILE} must read ZERO reasons (the same 0 that register P-SM-2 draw 0 and both §5.1 budget rows require) — a non-empty reading here means the driver regressed to the per-op loop (FS4): ${driverReasons.join(' | ')}`,
    ).toEqual([])

    // (2) The EXEMPTION is not theoretical: the §4 literal "derived file set"
    //     reading (driver + THIS file) is UNSATISFIABLE, because this file's
    //     FS8/F2 control draws and register P-TP-4 MUST call the per-op API.
    const selfReasons = checkDriverSource(selfSrc, `${selfFile} [exemption demonstration]`)
    expect(
      selfReasons.length,
      'the contract file is exempt because its own control draws must call the per-op API — if this reading is EMPTY the exemption has no basis and the scoping has to be re-derived',
    ).toBeGreaterThan(0)
    expect(selfReasons.join(' | '), 'the demonstration must be the SAME construct the driver rule forbids').toMatch(/store\.(putNode|putEdge)\(\) inside a loop/)

    // (3) The exemption must not become a loophole: this file's own IMPORT path
    //     is the batch path, and every per-op-in-a-loop site in this file's code
    //     is a LABELLED control draw (never an apply mechanism).
    expect(
      selfCode,
      'the import path of THIS file must be `store.applyBatch(ops)` — the exemption covers the cadence CONTROLS, never the import mechanism (§2a)',
    ).toMatch(/store\.applyBatch\(\s*ops\s*\)/)
    const lines = selfCode.split('\n')
    const sites: string[] = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!
      if (!/for\s*\(/.test(line) && !/\.forEach\s*\(/.test(line)) continue
      const window = lines.slice(i, i + 4).join('\n')
      // `[^\w$.]` excludes `s.store.putNode(…)` inside a synthetic STRING draw
      const m = /(?:^|[^\w$.])store\.(putNode|putEdge)\s*\(/.exec(window)
      if (!m) continue
      const context = lines.slice(Math.max(0, i - 25), i + 1).join('\n')
      const label = /'P-TP-4'/.test(context)
        ? 'P-TP-4 control draw (strat:per-op-cadence)'
        : /async function perOpApply\(/.test(context)
          ? 'perOpApply control (FS8 counter-discrimination + P-SM-1 comparison arm)'
          : /FS8 control/.test(context)
            ? 'FS8 control draw'
            : 'STRAY — not a labelled control draw'
      sites.push(`:${i + 1} store.${m[1]}() → ${label}`)
    }
    const strays = sites.filter((s) => s.includes('STRAY'))
    expect(
      strays,
      `the control-draw exemption is only legitimate for LABELLED controls; per-op-in-a-loop site(s) outside them: ${strays.join(', ')} — all sites seen: ${sites.join(' | ')}`,
    ).toEqual([])
    // non-vacuity (F2): a 0-site scan means the exemption is asserted over nothing
    expect(sites.length, 'the control draws the exemption rests on must really be present (F2: a 0-site scan is a vacuous exemption)').toBeGreaterThan(0)
    expect(
      sites.some((s) => s.includes('P-TP-4')) && sites.some((s) => s.includes('perOpApply')),
      `both control draws (P-TP-4 and perOpApply) must be flagged by the same detector: ${sites.join(' | ')}`,
    ).toBe(true)
  })

  it('P-TP-1 (strat:order-permutation) — the persist count is INDEPENDENT OF OP ORDER and the final sets are identical', async () => {
    const rep = await runProperty('P-TP-1', 'strat:order-permutation', async (i) => {
      const nNodes = i % SCALE_EVERY === 0 ? 300 : [2, 5, 20, 60][i % 4]
      const nEdges = Math.max(1, nNodes - 1)
      const { nodes, edges } = mkOps(nNodes, nEdges)
      const mode = i % 6
      const edgeOps = edges.map((edge) => ({ op: 'putEdge' as const, edge }))
      const nodeOps = nodes.map((node) => ({ op: 'putNode' as const, node }))
      const interleaved: BatchOp[] = (() => {
        const byId = new Map(nodes.map((n, idx) => [n.id, idx]))
        const out: BatchOp[] = []
        const placed = new Set<string>()
        for (const e of edges) {
          const need = [byId.get(e.source)!, byId.get(e.target)!].sort((a, b) => a - b)
          for (let j = 0; j <= need[1]; j++) {
            if (!placed.has(nodes[j].id)) {
              placed.add(nodes[j].id)
              out.push({ op: 'putNode', node: nodes[j] })
            }
          }
          out.push({ op: 'putEdge', edge: e })
        }
        for (const n of nodes) if (!placed.has(n.id)) out.push({ op: 'putNode', node: n })
        return out
      })()
      const updateOp: BatchOp = { op: 'putNode', node: mkNode('n0', 'updated-at-the-end') }
      const pinned: BatchOp[] = [...nodeOps, ...edgeOps]
      const variants: BatchOp[][] = [
        pinned, // the pinned nodes-then-edges order
        [...[...nodeOps].reverse(), ...edgeOps], // node ops reversed
        [...nodeOps, ...[...edgeOps].reverse()], // edge ops reversed
        [...[...nodeOps].reverse(), ...[...edgeOps].reverse()],
        interleaved,
        [...pinned, updateOp], // the same multiset + an update at the end
      ]
      const ops = variants[mode]
      // the comparison arm carries the SAME op multiset in the pinned order
      const reference = mode === 5 ? [...pinned, updateOp] : pinned
      return await withStore(async ({ file: storePath, store }) => {
        const { value: res, census } = await measure(storePath, () => store.applyBatch(ops))
        if (res.ok !== true) return `order mode=${mode}: ok=false (${String((res as { error?: string }).error)})`
        if (census.renames !== 1) return `order mode=${mode} N=${ops.length}: persistCount=${census.renames} — the count must be order-independent (exactly 1)`
        // the same multiset of ops must yield the same final sets, whatever the order
        return await withStore(async ({ store: ref }) => {
          const refRes = await ref.applyBatch(reference)
          if (refRes.ok !== true) return `reference order failed: ${String((refRes as { error?: string }).error)}`
          const a = stateSets(store)
          const b = stateSets(ref)
          if (JSON.stringify(a) !== JSON.stringify(b)) return `order mode=${mode}: the final sets differ from the pinned-order sets`
          return null
        })
      })
    })
    assertHeld(rep)
  })

  it('P-TP-2 (strat:batch-atomicity) — ONE journal entry, undo restores the pre-batch state exactly, redo re-applies it, each exactly 1 persist', async () => {
    const rep = await runProperty('P-TP-2', 'strat:batch-atomicity', async (i) => {
      const shape = i % 4
      const undoMode = i % 3
      const base = mkOps(5, 4)
      const ops: BatchOp[] =
        shape === 0
          ? [{ op: 'putNode', node: mkNode('single-1') }]
          : shape === 1
            ? [{ op: 'putNode', node: mkNode('a') }, { op: 'putNode', node: mkNode('b') }, { op: 'putEdge', edge: mkEdge('ab', 'a', 'b') }]
            : shape === 2
              ? base.ops
              : [...base.ops, { op: 'removeEdge', id: 'e1' }, { op: 'removeNode', id: 'n4' }]
      return await withStore(async ({ file: storePath, store }) => {
        const seed = await store.applyBatch(mkOps(3, 2).ops)
        if (seed.ok !== true) return `seed failed: ${String((seed as { error?: string }).error)}`
        const preBatch = stateSets(store)
        const depthBefore = store.undoDepth()
        const batch = await measure(storePath, () => store.applyBatch(ops))
        if (batch.value.ok !== true) return `shape=${shape}: ok=false (${String((batch.value as { error?: string }).error)})`
        if (batch.census.renames !== 1) return `shape=${shape}: the batch persisted ${batch.census.renames}×`
        if (store.journal().at(-1)?.kind !== 'batch') return `shape=${shape}: the last journal entry is '${String(store.journal().at(-1)?.kind)}', not 'batch' (FS6)`
        if (store.undoDepth() !== depthBefore + 1) return `shape=${shape}: undoDepth ${depthBefore} → ${store.undoDepth()} (must advance by exactly 1)`
        const postBatch = stateSets(store)
        const undo = await measure(storePath, () => store.undo())
        if (undo.value === null) return `shape=${shape}: undo returned null with a non-empty journal`
        if (undo.census.renames !== 1) return `shape=${shape}: undo persisted ${undo.census.renames}×`
        if (JSON.stringify(stateSets(store)) !== JSON.stringify(preBatch)) {
          const now = stateSets(store)
          const diff = now.nodes.find((x, j) => x !== preBatch.nodes[j]) ?? 'node-count differs'
          return `shape=${shape}: undo did NOT restore the pre-batch set (first difference: ${String(diff)}) (FS7)`
        }
        if (undoMode === 1) {
          const redo = await measure(storePath, () => store.redo())
          if (redo.value === null) return `shape=${shape}: redo returned null`
          if (redo.census.renames !== 1) return `shape=${shape}: redo persisted ${redo.census.renames}×`
          if (JSON.stringify(stateSets(store)) !== JSON.stringify(postBatch)) return `shape=${shape}: redo did not re-apply the batch exactly`
        }
        if (undoMode === 2) {
          // a SECOND undo must unwind the seed batch too (the journal is a stack)
          const second = await measure(storePath, () => store.undo())
          if (second.value === null) return `shape=${shape}: the second undo returned null at depth ${store.undoDepth() + 1}`
          if (second.census.renames !== 1) return `shape=${shape}: the second undo persisted ${second.census.renames}×`
          const empty = { nodes: [] as string[], edges: [] as string[] }
          if (JSON.stringify(stateSets(store)) !== JSON.stringify(empty)) return `shape=${shape}: two undos must unwind the seed too (the store must be empty, saw ${store.listNodes().length} nodes / ${store.listEdges().length} edges)`
        }
        return null
      })
    })
    assertHeld(rep)
  })

  it('P-TP-3 (strat:boot-roundtrip) — the persisted file is a faithful image: a boot over the same path sees the same sets, journal length and undoDepth (the "not a lost persist" oracle, FS2)', async () => {
    const rep = await runProperty('P-TP-3', 'strat:boot-roundtrip', async (i) => {
      const first = mkOps(4, 3)
      const second: BatchOp[] = i % 2 === 0 ? mkOps(6, 5).ops : [...mkOps(2, 1).ops, { op: 'removeNode', id: 'n1' }]
      return await withStore(async ({ file: storePath, store }) => {
        const r1 = await store.applyBatch(first.ops)
        if (r1.ok !== true) return `batch 1 failed: ${String((r1 as { error?: string }).error)}`
        const r2 = await store.applyBatch(second)
        if (r2.ok !== true) return `batch 2 failed: ${String((r2 as { error?: string }).error)}`
        const sets = stateSets(store)
        const depth = store.undoDepth()
        const journalLen = store.journal().length
        await store.teardown()
        const reopened = createJsonRagStore({ path: storePath })
        const status = reopened.status()
        if (status.corrupt) return `the reopened store reports corrupt=true after ${journalLen} journal entries`
        if (status.quarantined.length > 0) return `the reopened store quarantined ${status.quarantined.length} record(s): ${status.quarantined.slice(0, 3).join(', ')}`
        const census = { bootedNodes: status.loadedNodes.length, bootedEdges: status.loadedEdges.length, liveNodes: sets.nodes.length, liveEdges: sets.edges.length }
        if (JSON.stringify(stateSets(reopened)) !== JSON.stringify(sets)) return `the boot round trip diverged: ${JSON.stringify(census)} — the single persist did not capture the whole batch (FS2)`
        if (reopened.undoDepth() !== depth) return `undoDepth ${depth} → ${reopened.undoDepth()} across the boot`
        if (reopened.journal().length !== journalLen) return `journal length ${journalLen} → ${reopened.journal().length} across the boot`
        return null
      })
    })
    assertHeld(rep)
  })

  it('P-TP-4 (strat:per-op-cadence) — the per-op public contract is UNCHANGED: N bare calls perform exactly N writes (the anti-regression companion of §2c item 1)', async () => {
    const rep = await runProperty('P-TP-4', 'strat:per-op-cadence', async (i) => {
      const kind = (['putNode', 'putEdge', 'removeNode', 'removeEdge'] as const)[i % 4]
      // edge ops need two distinct endpoints (a self-referential edge is rejected)
      const n = kind === 'putEdge' || kind === 'removeEdge' ? [2, 5][i % 2] : [1, 2, 5][i % 3]
      return await withStore(async ({ file: storePath, store }) => {
        // seed so removeNode/removeEdge have a real record to remove (the seed's
        // own persists are OUTSIDE the measured window)
        const seedOps: BatchOp[] = [
          ...Array.from({ length: n }, (_, j) => ({ op: 'putNode' as const, node: mkNode(`p${j}`) })),
          ...Array.from({ length: n }, (_, j) => ({ op: 'putEdge' as const, edge: mkEdge(`pe${j}`, `p${j}`, `p${(j + 1) % n}`) })),
        ].filter((op) => op.op === 'putNode' || n >= 2)
        const seed = await store.applyBatch(seedOps)
        if (seed.ok !== true) return `seed failed: ${String((seed as { error?: string }).error)}`
        const { census } = await measure(storePath, async () => {
          for (let j = 0; j < n; j++) {
            if (kind === 'putNode') await store.putNode(mkNode(`q${j}`))
            else if (kind === 'putEdge') await store.putEdge(mkEdge(`qe${j}`, `p${j}`, `p${(j + 1) % n}`))
            else if (kind === 'removeNode') await store.removeNode(`p${j}`)
            else await store.removeEdge(`pe${j}`)
          }
        })
        if (census.renames !== n) return `kind=${kind} N=${n}: persistCount=${census.renames} — the per-op cadence is exactly ONE persist per bare call (§2c item 1 forbids changing it)`
        // the post-batch boundary: a bare call AFTER a batch still adds exactly 1
        if (i % 10 === 0) {
          const post = await measure(storePath, () => store.putNode(mkNode(`post${i}`)))
          if (post.census.renames !== 1) return `kind=${kind}: a bare putNode after a batch persisted ${post.census.renames}× (must be 1)`
        }
        return null
      })
    })
    assertHeld(rep)
  })
})

// ===========================================================================
// §5 — the DRIVER SOURCE CONTRACT (§2a / §4 P-SM-2's checker). Exported as a
//      plain function so the register row and the §5.1 budget rows share ONE
//      detector. SCOPING (remand fix (a), stated in this file's header):
//      the per-op-loop rule is applied to the DRIVER file ONLY
//      (`tests/import-render-no-duplicates.test.ts`). This file's own control
//      draws (FS8/F2 `perOpApply`, register `P-TP-4`) legitimately contain per-op
//      calls, so a literal reading of §4's "derived file set" would make P-SM-2
//      unsatisfiable — the exemption is DEMONSTRATED by the `P-SM-2 scoping pin`.
// ===========================================================================
function checkDriverSource(text: string, label: string): string[] {
  const reasons: string[] = []
  if (text.trim() === '') {
    // §2e F2 / user-flow-audit.md: an EMPTY scan is a FAILURE, never a pass.
    reasons.push(`${label}: EMPTY scan — a driver census over an empty file is a FAILURE, not a vacuous pass (F2)`)
    return reasons
  }
  if (!/applyBatch\s*\(/.test(text)) {
    reasons.push(`${label}: no applyBatch( call — §2a requires the driver to import the corpus through the store's atomic batch path (ONE applyBatch), not the per-op public API`)
  }
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!/for\s*\(/.test(line) && !/\.forEach\s*\(/.test(line)) continue
    const window = lines.slice(i, i + 4).join('\n')
    const m = /(?:^|[^\w$.])store\.(putNode|putEdge)\s*\(/.exec(window) ?? /\bs\.store\.(putNode|putEdge)\s*\(/.exec(window)
    if (m) {
      reasons.push(`${label}:${i + 1}: the per-op loop is present as an apply mechanism — \`${line.trim()}\` calls store.${m[1]}() inside a loop (§2a: replace it with ONE applyBatch(ops) and check result.ok)`)
    }
  }
  return reasons
}
