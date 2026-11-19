// tests/integration/gnosis-changes/mirror-adversarial.test.ts — unit `B-4a` `engine-store-mirror`'s ADVERSARIAL rows (`A1`–`A3`):
// the three WRONG DESIGNS the contract's `G5` names, each DRIVEN so its failure is a MEASURED reading rather than an argument.
//
//   `A1` a mirror that DOUBLE-APPLIES      (no equal-projection shortcut: every descriptor rewrites the triple)
//   `A2` a mirror that REORDERS against the re-read (the sink broadcasts the descriptor, then settles)
//   `A3` a mirror that WRITES WHEN THE ENGINE REFUSED (the seam fired before the answer was validated)
//
// WHY A ROW PER WRONG DESIGN, AND WHY EACH ONE DRIVES BOTH SIDES (RCA-3, `G5`): a green row set proves nothing about the design
// it did NOT contain — so each row below measures the WRONG design's own observable (a journal that grows, a doc-heads read that
// answers `[]` at the broadcast instant, a projection landed from a refused answer) AND the shipped design's observable on the
// same fixture. The delta is the row's subject; if the shipped code ever acquired the wrong design's behaviour, the shipped half
// of the delta moves and the row reds.
//
// SOURCE: `docs/L1/unit-b-4a-engine-store-mirror.md` §5 (the invariants), §6 (`M2`, `E2`, `G1` and the mutants each names), §7
// (`G5` — "a mirror that double-applies, one that reorders against a re-read, one that writes when the engine REFUSED — each
// driven red first"); `docs/L2/gnosis-changes/engine-mirror.md` §8; `docs/L3/gnosis-changes/engine-mirror.md` §3/§4/§5.
//
// LAYER (D-10 / RCA-12): ENVELOPE — real modules over a real store on a `/tmp` path, an injected `fetch` double on the CRUD seam
// and an injected `SseClient` double on the feed seam. No socket, no engine, no port, no Electron; the live arm is PARKED
// (contract §8) and no row here claims an engine event.
import { describe, it, expect } from 'vitest'

import { createEngineCrudRagStore } from '../../../src/main/engine-crud-rag-store.js'
import { ConflictError } from '../../../src/main/engine-rag-store.js'
import { handleRagDocHeadsIpc } from '../../../src/main/mcp-server.js'
import type { BatchOp, RagStore } from '../../../src/main/rag-store.js'
import type { RagDocHeadsPayload, RagStoreChangedPayload } from '../../../src/shared/types.js'
import {
  announceAt,
  BASE_URL,
  changeFrame,
  constructMirror,
  crudEnvelope,
  crudErrorPayload,
  crudResultPayload,
  crudTransport,
  documentWire,
  emptyRead,
  jsonResponse,
  loadChangesModule,
  loadMirrorModule,
  localDocOps,
  newRagStore,
  settled,
  shown,
  SseFrameDouble,
  storeCounts,
  structuralDescriptor,
  type CrudCall,
  type MirrorHandle,
  type MirrorReadAnswer,
} from './harness.js'

type CrudOptions = Parameters<typeof createEngineCrudRagStore>[0]

interface CrudProxy {
  createDocument(args: { caller: string; wikiId: string; body: { title: string; tags: string[] | null; author: string | null } }): Promise<{ documentId: string }>
  updateDocument(args: {
    caller: string
    documentId: string
    body: { baseRevision: number; graph: { nodes: unknown[]; edges: unknown[] }; title: string | null; tags: string[] | null }
  }): Promise<{ documentId: string }>
}

const upsert = (documentId: string, title: string) => ({ kind: 'upsert' as const, document: { documentId, title } })

function rowFor(heads: RagDocHeadsPayload, documentId: string): RagDocHeadsPayload['documents'][number] | undefined {
  return heads.documents.find((row) => row.documentId === documentId)
}

describe('B-4a §7 `G5` `A1` — a mirror that DOUBLE-APPLIES (no equal-projection shortcut)', () => {
  it('A1 — the wrong design grows the journal on the second identical apply; the SHIPPED planner grows nothing', async () => {
    // THE WRONG DESIGN, DRIVEN WITH THE SHIPPED PROJECTION'S OWN RECORDS: project once (real `accepted`), then replay the store's
    // own records through `applyBatch` again — which is exactly what a planner without the equal-projection shortcut does. The
    // doc-heads answer is the SAME in both designs (one row: the ids are deterministic), so the JOURNAL is the only reading that
    // separates them — and it is the reading `M2` pins.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => emptyRead() }, problems)
    if (mirror !== null) {
      const journal0 = store.journal().length
      await mirror.accepted(upsert('doc-a', 'Double'))
      const journal1 = store.journal().length
      if (journal1 - journal0 !== 1) {
        problems.push(`A1 CONTROL: the FIRST apply wrote ${journal1 - journal0} journal entr(ies) — the projection is one batch, so the double-apply below has a subject only if this reads 1`)
      }
      // THE WRONG DESIGN: the same records, written again, with no shortcut in between.
      const replay = [
        ...store.listNodes().map((node) => ({ op: 'putNode' as const, node })),
        ...store.listEdges().map((edge) => ({ op: 'putEdge' as const, edge })),
      ]
      const replayed = await store.applyBatch(replay)
      const journal2 = store.journal().length
      if (replayed.ok !== true) {
        problems.push(`A1: the replay batch FAILED (${shown(replayed)}) — the wrong design could not be driven`)
      }
      if (journal2 - journal1 !== 1) {
        problems.push(`A1: the DOUBLE-APPLY wrote ${journal2 - journal1} journal entr(ies) (${journal1} → ${journal2}) — the wrong design always writes, which is why the journal is the observable that separates it from the shipped one`)
      }
      const headsAfterReplay = handleRagDocHeadsIpc(store)
      if (headsAfterReplay.documents.length !== 1) {
        problems.push(`A1: the doc-heads read answered ${shown(headsAfterReplay.documents)} after the double-apply — BOTH designs answer ONE row (deterministic ids), which is exactly why a doc-heads-only row cannot see this defect`)
      }
      // THE SHIPPED DESIGN on the same rig: the equal projection writes NOTHING.
      await mirror.accepted(upsert('doc-a', 'Double'))
      const journal3 = store.journal().length
      if (journal3 !== journal2) {
        problems.push(`A1: the SHIPPED mirror grew the journal from ${journal2} to ${journal3} on an EQUAL projection — that IS the double-apply defect (§4's shortcut is what defeats it)`)
      }
      const status = mirror.status()
      if (status?.projected !== 1 || status?.unchanged !== 1) {
        problems.push(`A1: \`status()\` reads projected ${String(status?.projected)} / unchanged ${String(status?.unchanged)} — the shipped design reads 1 / 1 and the wrong one would read 2 / 0`)
      }
      problems.push(`A1 READING: journal ${journal0} → ${journal1} (first apply) → ${journal2} (wrong design's replay: +${journal2 - journal1}) → ${journal3} (shipped re-apply: +${journal3 - journal2}); doc-heads rows: 1 in both designs; counts ${shown(storeCounts(store))}`)
    }
    // The READING above is a fact, not a problem — it is reported only when something else already failed.
    expect(problems.filter((problem) => !problem.startsWith('A1 READING:')), `A1:\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4a §7 `G5` `A2` — a mirror that REORDERS against the re-read (broadcast before the projection lands)', () => {
  it('A2 — the wrong order leaks a descriptor whose doc-heads answer is `[]`; the SHIPPED order answers the document at the same instant', async () => {
    // THE WRONG DESIGN IS THE SHIPPED ONE WITH TWO LINES SWAPPED — the exact `B6-F1` regression `E2`/`C1(c)` exist for. Both limbs
    // below drive the REAL feed and the REAL mirror through the REAL `SseFrameDouble`; the only difference is whether the sink
    // awaits `settle` BEFORE it broadcasts (and reads the doc-heads at that instant).
    const problems: string[] = []
    const changes = await loadChangesModule()
    problems.push(...changes.problems)
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    if (changes.createEngineChangesFeed !== null && mod.createEngineMirror !== null) {
      const drive = async (order: 'wrong' | 'shipped'): Promise<{ atBroadcast: RagDocHeadsPayload | null; walks: number }> => {
        const { store } = newRagStore()
        let readAnswer: MirrorReadAnswer = emptyRead()
        const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => readAnswer }, problems) as MirrorHandle
        const double = new SseFrameDouble()
        let atBroadcast: RagDocHeadsPayload | null = null
        const sink = (descriptor: RagStoreChangedPayload): void => {
          void (async () => {
            if (order === 'shipped') {
              await mirror.settle(descriptor)
              atBroadcast = handleRagDocHeadsIpc(store)
              return
            }
            // THE WRONG DESIGN: the descriptor is announced FIRST, and the projection lands afterwards.
            atBroadcast = handleRagDocHeadsIpc(store)
            await mirror.settle(descriptor)
          })()
        }
        const feed = changes.createEngineChangesFeed!({
          baseUrl: BASE_URL,
          sse: double,
          reconcile: () => mirror.reconcile(),
          onChange: sink,
        }) as { connect(): Promise<void>; close(): void }
        await feed.connect()
        announceAt(double, '1')
        await settled()
        await settled()
        readAnswer = { documents: [{ documentId: 'doc-x', title: 'Engine Doc' }], complete: true }
        double.frame('change', changeFrame({ kind: 'create_document', cursor: '2', nodeIds: [] }))
        await settled()
        await settled()
        await settled()
        feed.close()
        return { atBroadcast, walks: mirror.status().walks }
      }
      const wrong = await drive('wrong')
      const shipped = await drive('shipped')
      const wrongRow = wrong.atBroadcast === null ? undefined : rowFor(wrong.atBroadcast, 'doc-x')
      const shippedRow = shipped.atBroadcast === null ? undefined : rowFor(shipped.atBroadcast, 'doc-x')
      if (wrong.atBroadcast === null) {
        problems.push('A2: the WRONG limb never ran the sink — the wrong design could not be driven')
      } else if (wrongRow !== undefined) {
        problems.push(`A2: the WRONG order answered ${shown(wrongRow)} at the broadcast instant — it must answer NOTHING until the projection has landed, or the wrong design is indistinguishable and this row proves nothing`)
      }
      if (shipped.atBroadcast === null) {
        problems.push('A2: the SHIPPED limb never ran the sink — the correct design has no reading')
      } else if (shippedRow === undefined || shippedRow.title !== 'Engine Doc') {
        problems.push(`A2: the SHIPPED order answered ${shown(shipped.atBroadcast.documents)} at the broadcast instant — §4: the projection lands BEFORE the descriptor is broadcast (\`B6-F1\`'s closure)`)
      }
      if (wrong.walks < 1 || shipped.walks < 1) {
        problems.push(`A2: walks read ${String(wrong.walks)} (wrong) / ${String(shipped.walks)} (shipped) — both limbs must have walked, or the doc-heads reading above is vacuous`)
      }
      problems.push(`A2 READING: at the broadcast instant — wrong design ${shown(wrong.atBroadcast?.documents ?? null)}, shipped design ${shown(shipped.atBroadcast?.documents ?? null)}; walks ${wrong.walks} / ${shipped.walks}`)
    }
    expect(problems.filter((problem) => !problem.startsWith('A2 READING:')), `A2:\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4a §7 `G5` `A3` — a mirror that WRITES WHEN THE ENGINE REFUSED', () => {
  it('A3 — a refused answer mirrors NOTHING through the shipped proxy; the same write offered to the mirror lands a projection', async () => {
    // THE WRONG DESIGN is a seam that fires BEFORE `decodeCrudResponse` (or on any answer at all): it would project the very write
    // the engine refused. The row measures both halves: the shipped proxy's refused call leaves the store EMPTY, and the mirror,
    // handed that same write directly, LANDS IT — so the seam's POSITION is the only thing standing between the two readings.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => emptyRead() }, problems)
    const calls: CrudCall[] = []
    const transport = crudTransport((method, url) => {
      if (method === 'POST' && url.includes('/documents/d1/update')) {
        return jsonResponse(crudEnvelope(crudErrorPayload('updateDocument', 'conflict', 'stale revision')))
      }
      return undefined
    }, calls)
    if (mirror !== null) {
      let proxy: CrudProxy | null = null
      try {
        proxy = createEngineCrudRagStore({
          baseUrl: BASE_URL,
          fetch: transport,
          onAccepted: (write: unknown) => mirror.accepted(write as Parameters<MirrorHandle['accepted']>[0]),
        } as unknown as CrudOptions) as unknown as CrudProxy
      } catch (err) {
        problems.push(`A3: the CRUD proxy's construction threw (${err instanceof Error ? err.message : String(err)})`)
      }
      if (proxy !== null) {
        const before = storeCounts(store)
        try {
          await expect(
            proxy.updateDocument({
              caller: 'operator',
              documentId: 'd1',
              body: { baseRevision: 0, graph: { nodes: [], edges: [] }, title: 'Refused Title', tags: null },
            }),
          ).rejects.toBeInstanceOf(ConflictError)
        } catch (err) {
          problems.push(`A3: the refused call did not reject with a \`ConflictError\` (${err instanceof Error ? err.message.split('\n')[0] : String(err)}) — \`decodeCrudResponse\` must throw BEFORE the seam`)
        }
        const afterRefusal = storeCounts(store)
        if (shown(before) !== shown(afterRefusal)) {
          problems.push(`A3: the SHIPPED design moved the store counts from ${shown(before)} to ${shown(afterRefusal)} on a REFUSED answer — the wrong design writes here`)
        }
        const status = mirror.status()
        if (status?.accepted !== 0) {
          problems.push(`A3: \`status().accepted\` read ${String(status?.accepted)} after a refused answer — the seam never fired, which is the shipped behaviour`)
        }
        if (handleRagDocHeadsIpc(store).documents.length !== 0) {
          problems.push(`A3: the doc-heads read answered a row after a REFUSED write — nothing may be mirrored from a refusal`)
        }
        // THE WRONG DESIGN, DRIVEN: the same write, offered to the mirror as if the seam had fired before validation.
        await mirror.accepted(upsert('d1', 'Refused Title'))
        const wrongRows = handleRagDocHeadsIpc(store)
        if (wrongRows.documents.length !== 1) {
          problems.push(`A3: the wrong design's projection did NOT land (${shown(wrongRows.documents)}) — the two readings would then be identical and this row could not separate them`)
        }
        if (calls.length !== 1) {
          problems.push(`A3: the transport saw ${calls.length} CRUD call(s) — the refusal is answered on the one request`)
        }
        problems.push(`A3 READING: shipped refusal ⇒ doc-heads ${shown(before)} and counts ${shown(afterRefusal)}; the same write handed to the mirror ⇒ doc-heads ${shown(wrongRows.documents)}`)
      }
    }
    expect(problems.filter((problem) => !problem.startsWith('A3 READING:')), `A3:\n${problems.join('\n')}`).toEqual([])
  })
})

// ===========================================================================
// `H1`–`H8` — THE ADVERSARIAL PASS'S HOST FINDINGS, EACH WITH ITS REGRESSION ROW (RCA-3). Every one of these was MEASURED in the
// shipped code at the landing (the readings are quoted in `docs/L2/gnosis-changes/engine-mirror.md` §8 and the L3 page §6), fixed in
// the same pass, and is red-able: each row drives the exact input that used to produce the defect, and the defect's own reading is
// named in the row so a later reader can re-derive it.
// ===========================================================================
describe('B-4a `H1`–`H8` — the adversarial findings, each pinned by the input that produced it', () => {
  it('H1 (B4A-F1) — a limb-(b) walk must NOT strip the tags limb (a) projected, and the walk must then read `unchanged`', async () => {
    // MEASURED AT THE LANDING: `afterAccepted tags ['guide']` → `afterWalk tags []`, journal 2 — every tagged projection lost its tags
    // on the first descriptor, because `main.ts`'s list read carries no tags (`ASM-B4A-5`).
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    let readAnswer: MirrorReadAnswer = emptyRead()
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => readAnswer }, problems)
    if (mirror !== null) {
      await mirror.accepted({ kind: 'upsert', document: { documentId: 'd1', title: 'Getting Started', tags: ['guide'] } })
      const tagged = rowFor(handleRagDocHeadsIpc(store), 'd1')
      if (tagged === undefined || shown(tagged.tags) !== shown(['guide'])) {
        problems.push(`H1 CONTROL: after the limb-(a) write the doc-heads row reads ${shown(tagged)} — the tags the walk must preserve are not there`)
      }
      const journalBefore = store.journal().length
      readAnswer = { documents: [{ documentId: 'd1', title: 'Getting Started' }], complete: true }
      await mirror.settle(structuralDescriptor())
      const after = rowFor(handleRagDocHeadsIpc(store), 'd1')
      if (after === undefined || shown(after.tags) !== shown(['guide'])) {
        problems.push(`H1: the walk's projection reads ${shown(after)} — a limb that carries NO tags must not clear the ones limb (a) projected`)
      }
      if (store.journal().length !== journalBefore) {
        problems.push(`H1: the walk wrote ${store.journal().length - journalBefore} journal entr(ies) — the projection is EQUAL, so the walk must read \`unchanged\``)
      }
      if (mirror.status().unchanged < 1) problems.push(`H1: \`status().unchanged\` read ${String(mirror.status().unchanged)} — the walk's projection is the equal one`)
    }
    expect(problems, `H1:\n${problems.join('\n')}`).toEqual([])
  })

  it('H2 (B4A-F2) — tags are compared AFTER the store\'s own normalization, so an untrimmed/duplicate array cannot defeat the shortcut', async () => {
    // MEASURED AT THE LANDING: the same `['guide ','guide']` three times ⇒ `journal 1 → 2 → 3`, `projected 3 / unchanged 0`: the mirror
    // compared a RAW engine array against the store's normalized record (`rag-store.ts:419-421`), so the equal-projectionshortcut
    // never held for a document with a padded or repeated tag.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => emptyRead() }, problems)
    if (mirror !== null) {
      await mirror.accepted({ kind: 'upsert', document: { documentId: 'd1', title: 'T', tags: ['guide ', 'guide', '  '] } })
      const journal1 = store.journal().length
      await mirror.accepted({ kind: 'upsert', document: { documentId: 'd1', title: 'T', tags: ['guide ', 'guide', '  '] } })
      await mirror.accepted({ kind: 'upsert', document: { documentId: 'd1', title: 'T', tags: ['guide'] } })
      if (store.journal().length !== journal1) {
        problems.push(`H2: the journal grew ${store.journal().length - journal1} entr(ies) across two shipments of the SAME normalized tags — [guide ,guide,  ] and [guide] are one projection`)
      }
      const status = mirror.status()
      if (status.projected !== 1 || status.unchanged !== 2) {
        problems.push(`H2: \`status()\` reads projected ${String(status.projected)} / unchanged ${String(status.unchanged)} — normalized-equal tags are 1 projection and 2 unchanged`)
      }
      const row = rowFor(handleRagDocHeadsIpc(store), 'd1')
      if (row === undefined || shown(row.tags) !== shown(['guide'])) {
        problems.push(`H2: the doc-heads row reads ${shown(row)} — a whitespace-only tag is dropped and the duplicate is deduped`)
      }
    }
    expect(problems, `H2:\n${problems.join('\n')}`).toEqual([])
  })

  it('H3 (B4A-F3) — a list that CLAIMS completeness but is not a list (or drops an entry) licenses NO delete', async () => {
    // MEASURED AT THE LANDING: `documents:[{…ok},{documentId:'doc-other'}]` with `complete:true` ⇒ `removed 1, failed 0`, and
    // `{documents:null, complete:true}` ⇒ every projection deleted. A malformed entry became a SHORTER but authoritative list.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    let readAnswer: MirrorReadAnswer = emptyRead()
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => readAnswer }, problems)
    if (mirror !== null) {
      await mirror.accepted(upsert('doc-keep', 'Keep'))
      await mirror.accepted(upsert('doc-other', 'Other'))
      if (handleRagDocHeadsIpc(store).documents.length !== 2) problems.push('H3 CONTROL: the two projections did not land — the survival clause has nothing to save')
      const failedBefore = mirror.status().failed
      readAnswer = {
        documents: [{ documentId: 'doc-keep', title: 'Keep' }, { documentId: 'doc-other' } as unknown as { documentId: string; title: string }],
        complete: true,
      }
      await mirror.settle(structuralDescriptor())
      const afterMalformed = handleRagDocHeadsIpc(store)
      if (afterMalformed.documents.length !== 2) {
        problems.push(`H3: a COMPLETE-flagged list with one unreadable entry left ${afterMalformed.documents.length} doc-heads row(s) — the unreadable document was deleted on absence`)
      }
      if (mirror.status().failed !== failedBefore + 1) problems.push(`H3: \`status().failed\` read ${String(mirror.status().failed)} (was ${String(failedBefore)}) — a malformed list is a TYPED failure`)
      readAnswer = { documents: null as unknown as MirrorReadAnswer['documents'], complete: true }
      await mirror.settle(structuralDescriptor())
      const afterNull = handleRagDocHeadsIpc(store)
      if (afterNull.documents.length !== 2) {
        problems.push(`H3: \`{documents:null, complete:true}\` left ${afterNull.documents.length} row(s) — a non-list cannot be an empty-but-authoritative list`)
      }
      if (mirror.status().removed !== 0) {
        problems.push(`H3: \`status().removed\` read ${String(mirror.status().removed)} — NOTHING may be removed on a list that is not a readable, complete list`)
      }
    }
    expect(problems, `H3:\n${problems.join('\n')}`).toEqual([])
  })

  it('H4 (B4A-F4) — the DERIVED head id is not a licence to write: a colliding root (projection\'s or LOCAL) is refused, not clobbered', async () => {
    // MEASURED AT THE LANDING: with the list `['X:engine-head','X']` the second projection OVERWROTE the first one's marked root with
    // an `h1` (`nodes ['X:engine-head','X:engine-head:engine-head','X']`, `projections 1`), and a LOCAL document at `X:engine-head` was
    // rewritten in place (`refused 0`). `headIdFor` is not injective over opaque engine ids.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => emptyRead() }, problems)
    if (mirror !== null) {
      // (a) TWO ENGINE DOCUMENTS whose ids collide in the derived namespace, in the order that used to corrupt.
      const read = async (): Promise<MirrorReadAnswer> => ({
        documents: [
          { documentId: 'X:engine-head', title: 'First' },
          { documentId: 'X', title: 'Second' },
        ],
        complete: true,
      })
      const mirror2 = constructMirror(mod.createEngineMirror, { store: () => store, read }, problems)
      if (mirror2 !== null) {
        await mirror2.reconcile()
        const root = store.getNode('X:engine-head')
        if (root === undefined || root.props?.['data-engine-mirror'] !== true || root.type !== 'div') {
          problems.push(`H4(a): the first document's ROOT reads ${shown(root)} — document \`X\`'s derived head id IS that root, so projecting \`X\` must be REFUSED, never a write over it`)
        }
        if (mirror2.status().refused < 1) problems.push(`H4(a): \`status().refused\` read ${String(mirror2.status().refused)} — the collision is refused and COUNTED`)
        const rows = handleRagDocHeadsIpc(store)
        if (rows.documents.length !== 1) problems.push(`H4(a): the doc-heads read answered ${shown(rows.documents)} — one projectable document, the other refused`)
      }
      // (b) A LOCAL document sitting exactly at another document's derived head id.
      const { store: localStore } = newRagStore()
      await localStore.applyBatch([
        { op: 'putNode', node: { id: 'X:engine-head', type: 'div', content: '', ownedNodeIds: [], createdAt: '1970-01-01T00:00:00.000Z', updatedAt: '1970-01-01T00:00:00.000Z' } },
      ])
      const mirror3 = constructMirror(mod.createEngineMirror, { store: () => localStore, read: async () => emptyRead() }, problems)
      if (mirror3 !== null) {
        await mirror3.accepted(upsert('X', 'ENGINE TITLE'))
        const local = localStore.getNode('X:engine-head')
        if (local === undefined || local.type !== 'div' || local.content !== '' || local.props?.['data-doc-head'] === true) {
          problems.push(`H4(b): the LOCAL root reads ${shown(local)} — a projection may never rewrite a record it does not own, even when the derived id names it`)
        }
        if (mirror3.status().refused !== 1) problems.push(`H4(b): \`status().refused\` read ${String(mirror3.status().refused)} — the local collision is refused and counted`)
      }
    }
    expect(problems, `H4:\n${problems.join('\n')}`).toEqual([])
  })

  it('H5 (B4A-F5) — `reconcile()` names NOTHING when the walk could not complete (it projected nothing)', async () => {
    // MEASURED AT THE LANDING: a truncated read answered `nodeIds:['doc-p1','doc-p2']` with `projected 0` — the re-read's answer and the
    // projection DISAGREED, which is the one thing contract §5 limb (i) says cannot happen.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const read = async (): Promise<MirrorReadAnswer> => ({ documents: [{ documentId: 'doc-p1', title: 'P1' }], complete: false })
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read }, problems)
    if (mirror !== null) {
      const answer = await mirror.reconcile()
      if (shown(answer.nodeIds) !== shown([])) {
        problems.push(`H5: \`reconcile()\` answered nodeIds ${shown(answer.nodeIds)} from a TRUNCATED read — \`status().projected\` reads ${String(mirror.status().projected)}, so the answer names ids it never projected`)
      }
      if (mirror.status().failed < 1) problems.push('H5: the truncated read was not counted `failed`')
      if (handleRagDocHeadsIpc(store).documents.length !== 0) problems.push('H5: a truncated read projected a document')
    }
    expect(problems, `H5:\n${problems.join('\n')}`).toEqual([])
  })

  it('H6 (B4A-F6) — a throwing write job is CONTAINED: `accepted` resolves, `failed` moves, nothing hangs', async () => {
    // MEASURED AT THE LANDING: a store whose record made the planner throw left `accepted` PENDING FOR EVER with `failed 0` — and the
    // CRUD seam AWAITS `accepted`, so the engine's accepted write would never answer.
    const problems: string[] = []
    const store = {
      getNode: () => undefined,
      getEdge: () => {
        throw new Error('store record is unreadable')
      },
      listNodes: () => [],
      applyBatch: async () => ({ ok: true, results: [] }),
    } as unknown as RagStore
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => emptyRead() }, problems)
    if (mirror !== null) {
      const raced = await Promise.race([
        mirror.accepted(upsert('doc-a', 'A')).then(() => 'resolved' as const).catch(() => 'rejected' as const),
        new Promise<'pending'>((resolve) => setTimeout(() => resolve('pending'), 250)),
      ])
      if (raced !== 'resolved') {
        problems.push(`H6: \`accepted\` came back \`${raced}\` — a job's fault must be contained, counted and RESOLVED (the CRUD seam awaits it)`)
      }
      if (mirror.status().failed < 1) problems.push(`H6: \`status().failed\` read ${String(mirror.status().failed)} — the fault is COUNTED`)
      if (typeof mirror.status().lastFailure !== 'string' || mirror.status().lastFailure === '') {
        problems.push(`H6: \`status().lastFailure\` read ${shown(mirror.status().lastFailure)} — a typed string naming the fault`)
      }
    }
    expect(problems, `H6:\n${problems.join('\n')}`).toEqual([])
  })

  it('H7 (B4A-F7) — `status()` is side-effect free: a store thunk that throws counts NOTHING', async () => {
    // MEASURED AT THE LANDING: three `status()` calls against a throwing thunk read `failed 1, 2, 3` — the diagnostic surface was
    // rewriting the state it reports, so a reader's own reading changed the reading.
    const problems: string[] = []
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(
      mod.createEngineMirror,
      {
        store: () => {
          throw new Error('store thunk boom')
        },
        read: async () => emptyRead(),
      },
      problems,
    )
    if (mirror !== null) {
      const readings: string[] = []
      for (let i = 0; i < 3; i += 1) {
        try {
          readings.push(shown(mirror.status()))
        } catch (err) {
          problems.push(`H7: \`status()\` THREW on call ${i + 1} (${err instanceof Error ? err.message : String(err)}) — it must be total`)
        }
      }
      const last = mirror.status()
      if (last.failed !== 0) problems.push(`H7: \`status().failed\` read ${String(last.failed)} after three status calls — \`status()\` is a COPY, and a diagnostic read must not increment a counter`)
      if (last.lastFailure !== null) problems.push(`H7: \`status().lastFailure\` read ${shown(last.lastFailure)} — a status call must not record a failure`)
      if (last.projections !== 0) problems.push(`H7: \`status().projections\` read ${String(last.projections)} — an unreadable store holds no projections`)
    }
    expect(problems, `H7:\n${problems.join('\n')}`).toEqual([])
  })

  it('H8 (B4A-F8) — one unvalidated engine field does not kill the triple: an unparseable stamp falls back, a blank tag is dropped', async () => {
    // MEASURED AT THE LANDING: `updatedAt:'yesterday'` and `tags:['']` each FAILED the whole batch at the store's own validation, so the
    // document could never be mirrored at all (`lastFailure 'apply: rag applyBatch: createdAt required/invalid at index 0'`).
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => emptyRead() }, problems)
    if (mirror !== null) {
      await mirror.accepted({ kind: 'upsert', document: { documentId: 'doc-a', title: 'T', tags: ['', '   ', 'ok'], updatedAt: 'yesterday' } })
      const rows = handleRagDocHeadsIpc(store)
      if (rows.documents.length !== 1) {
        problems.push(`H8: the doc-heads read answered ${shown(rows.documents)} — an unparseable \`updatedAt\` and a blank tag must not prevent the projection (lastFailure ${shown(mirror.status().lastFailure)})`)
      }
      if (mirror.status().projected !== 1) problems.push(`H8: \`status().projected\` read ${String(mirror.status().projected)} (lastFailure ${shown(mirror.status().lastFailure)})`)
      const row = rowFor(rows, 'doc-a')
      if (row === undefined || shown(row.tags) !== shown(['ok'])) problems.push(`H8: the doc-heads row reads ${shown(row)} — the blank tags are dropped, the real one survives`)
      const journal = store.journal().length
      await mirror.accepted({ kind: 'upsert', document: { documentId: 'doc-a', title: 'T', tags: ['ok'], updatedAt: 'still not a date' } })
      if (store.journal().length !== journal) problems.push('H8: the stamp fallback is not stable — a second shipment with another unparseable stamp wrote again')
    }
    expect(problems, `H8:\n${problems.join('\n')}`).toEqual([])
  })
})

// ===========================================================================
// `D1`–`D4` — THE DOCUMENTATION REVIEW'S COVERAGE FINDINGS (RCA-6). Each row pins a state the L2 page's failure table stated
// while NO row measured it: the delete-on-absence path from a COMPLETE walk (the limb-(b) removal arm), a limb-(a) write arriving
// while a walk is in flight (the race the FIFO queue exists for), a store that is ABSENT or refuses the batch, and a MALFORMED
// engine body reaching the CRUD seam. A claim with no row is a finding; these four close it.
// ===========================================================================
describe('B-4a `D1`–`D4` — the states the failure table claims, each pinned to a row', () => {
  it('D1 — a COMPLETE walk REMOVES a marked projection the list no longer names (the only delete-on-absence path)', async () => {
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    let readAnswer: MirrorReadAnswer = {
      documents: [
        { documentId: 'doc-a', title: 'A' },
        { documentId: 'doc-b', title: 'B' },
      ],
      complete: true,
    }
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => readAnswer }, problems)
    if (mirror !== null) {
      await mirror.settle(structuralDescriptor())
      if (handleRagDocHeadsIpc(store).documents.length !== 2) problems.push('D1 CONTROL: the two projections did not land — the removal has no subject')
      // THE ENGINE'S LIST MOVED: `doc-b` is gone, and the walk says so COMPLETELY.
      readAnswer = { documents: [{ documentId: 'doc-a', title: 'A' }], complete: true }
      await mirror.settle(structuralDescriptor())
      const rows = handleRagDocHeadsIpc(store)
      if (rows.documents.length !== 1 || rows.documents[0]?.documentId !== 'doc-a') {
        problems.push(`D1: the doc-heads read answered ${shown(rows.documents)} — a document absent from a COMPLETE list is removed (§5(ii))`)
      }
      if (store.getNode('doc-b') !== undefined || store.getNode('doc-b:engine-head') !== undefined) {
        problems.push('D1: the removed document\'s root or head survives — the removal is the whole triple')
      }
      const status = mirror.status()
      if (status.removed !== 1) problems.push(`D1: \`status().removed\` read ${String(status.removed)} — one batch deleted one projection`)
      if (status.projections !== 1) problems.push(`D1: \`status().projections\` read ${String(status.projections)} — one marked root remains`)
    }
    expect(problems, `D1:\n${problems.join('\n')}`).toEqual([])
  })

  it('D2 — a limb-(a) write offered WHILE a walk is in flight is not deleted by that walk\'s own absence rule', async () => {
    // THE RACE THE QUEUE EXISTS FOR: a walk whose list was read BEFORE the write landed cannot see it, so an unserialized write
    // would be removed by the walk's own "marked root absent from the list" step. The FIFO job makes the walk finish first.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    let readCalls = 0
    const read = async (): Promise<MirrorReadAnswer> => {
      readCalls += 1
      if (readCalls === 1) await gate
      return { documents: [], complete: true } // an EMPTY COMPLETE list: it licenses deleting every marked root it does not name
    }
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read }, problems)
    if (mirror !== null) {
      const walking = mirror.settle(structuralDescriptor())
      const writing = mirror.accepted(upsert('doc-new', 'Landed')) // queued BEHIND the in-flight walk
      await settled()
      release()
      await Promise.all([walking, writing])
      await settled()
      const rows = handleRagDocHeadsIpc(store)
      if (rows.documents.length !== 1 || rows.documents[0]?.documentId !== 'doc-new') {
        problems.push(`D2: the doc-heads read answered ${shown(rows.documents)} — the accepted write must SURVIVE a walk that could not see it`)
      }
      const status = mirror.status()
      if (status.removed !== 0) problems.push(`D2: \`status().removed\` read ${String(status.removed)} — the walk must not delete the write it did not read`)
      if (status.projected !== 1) problems.push(`D2: \`status().projected\` read ${String(status.projected)} — the write lands ONE projection`)
    }
    expect(problems, `D2:\n${problems.join('\n')}`).toEqual([])
  })

  it('D3 — an ABSENT store and a REFUSED batch are both contained: the promise resolves and `failed` moves', async () => {
    const problems: string[] = []
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    // (i) NO STORE AT ALL.
    const absent = constructMirror(mod.createEngineMirror, { store: () => null, read: async () => emptyRead() }, problems)
    if (absent !== null) {
      await absent.accepted(upsert('doc-a', 'A'))
      if (absent.status().failed !== 1) problems.push(`D3(i): \`status().failed\` read ${String(absent.status().failed)} on an ABSENT store — the fault is counted`)
      if (typeof absent.status().lastFailure !== 'string' || absent.status().lastFailure === '') {
        problems.push(`D3(i): \`status().lastFailure\` read ${shown(absent.status().lastFailure)} — a typed string`)
      }
      if (absent.status().projected !== 0) problems.push(`D3(i): \`status().projected\` read ${String(absent.status().projected)} with no store`)
    }
    // (ii) A STORE WHOSE OWN WRITER REFUSES THE BATCH (`{ok:false}` — the store's documented domain-failure shape).
    const refusing = {
      getNode: () => undefined,
      getEdge: () => undefined,
      listNodes: () => [],
      applyBatch: async () => ({ ok: false, error: 'rag applyBatch: test refusal', failedIndex: 0 }),
    } as unknown as RagStore
    const refused = constructMirror(mod.createEngineMirror, { store: () => refusing, read: async () => emptyRead() }, problems)
    if (refused !== null) {
      await refused.accepted(upsert('doc-a', 'A'))
      const status = refused.status()
      if (status.projected !== 0) problems.push(`D3(ii): \`status().projected\` read ${String(status.projected)} on a REFUSED batch — a refusal projects nothing`)
      if (status.failed !== 1) problems.push(`D3(ii): \`status().failed\` read ${String(status.failed)} — the store's \`{ok:false}\` is a CONTAINED failure`)
      if (typeof status.lastFailure !== 'string' || !status.lastFailure.includes('apply:')) {
        problems.push(`D3(ii): \`status().lastFailure\` read ${shown(status.lastFailure)} — it names the apply fault`)
      }
    }
    expect(problems, `D3:\n${problems.join('\n')}`).toEqual([])
  })

  it('D4 — a MALFORMED engine body never reaches the seam (the decode throws first)', async () => {
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => emptyRead() }, problems)
    const calls: CrudCall[] = []
    // `{method}` with NEITHER `result` NOR `error` — `decodeCrudResponse` refuses it (`exactly one of result/error`).
    const transport = crudTransport((method, url) => {
      if (method === 'POST' && url.endsWith('/documents')) {
        return jsonResponse(crudEnvelope({ method: 'createDocument' }))
      }
      return undefined
    }, calls)
    if (mirror !== null) {
      let proxy: CrudProxy | null = null
      try {
        proxy = createEngineCrudRagStore({
          baseUrl: BASE_URL,
          fetch: transport,
          onAccepted: (write: unknown) => mirror.accepted(write as Parameters<MirrorHandle['accepted']>[0]),
        } as unknown as CrudOptions) as unknown as CrudProxy
      } catch (err) {
        problems.push(`D4: the CRUD proxy's construction threw (${err instanceof Error ? err.message : String(err)})`)
      }
      if (proxy !== null) {
        const before = storeCounts(store)
        let rejected = false
        try {
          await proxy.createDocument({ caller: 'operator', wikiId: 'w1', body: { title: 'T', tags: null, author: null } })
        } catch {
          rejected = true
        }
        if (!rejected) problems.push('D4: a MALFORMED body did not reject — `decodeCrudResponse` must refuse it before the seam')
        if (mirror.status().accepted !== 0) problems.push(`D4: \`status().accepted\` read ${String(mirror.status().accepted)} — a malformed answer never reaches the seam`)
        if (shown(before) !== shown(storeCounts(store))) problems.push(`D4: the store counts moved from ${shown(before)} to ${shown(storeCounts(store))} on a MALFORMED answer`)
      }
    }
    expect(problems, `D4:\n${problems.join('\n')}`).toEqual([])
  })
})

// ===========================================================================
// `F11` (`B4A-F11`) — THE DESCRIPTOR MAY NOT NAME A DOCUMENT THE WALK DID NOT LAND, REACHED THROUGH THE STORE-REFUSAL ARM.
//
// THE EXAMINER'S MEASURED READING (the L1 examination of the landed `B-4a`, LOW): with a store whose `applyBatch` REFUSES
// (quarantine / teardown / a refused batch), `mirror.reconcile()` answered `nodeIds ['doc-p1','doc-p2']` while the SAME walk read
// `projected 0 / failed 2`, and `handleRagDocHeadsIpc` read `[]`. A descriptor naming documents the projection did not land IS
// `B4A-F5`'s lie — and `H5` does NOT pin this arm: `H5` covers only the TRUNCATED-walk arm, where `complete:false` alone forces the
// empty answer. Here `complete` is TRUE and the projections were REFUSED, so the `complete` flag cannot see it: the walk reads
// its own `apply()` verdicts back and must answer the LANDED ids, not the LISTED ones.
//
// WHAT THIS ROW ASSERTS (the required behaviour): `reconcile()`'s descriptor names ONLY the documents the walk actually PROJECTED
// or already HELD EQUAL — never an id whose projection was refused or failed. The invariant that stands unchanged: a
// truncated/partial list still writes nothing and names nothing (`ASM-L2-M2`, and `H5` keeps that arm).
//
// THE MUTANT THAT WOULD RED IT: "a `runWalk` that answers the LISTED ids instead of the LANDED ones" — i.e. today's
// `return { ids, complete: true }` after a `for` loop whose `apply()` refusals it never reads back.
//
// THE FOUR LIMBS, and why (d) comes FIRST: (a) a PARTIAL refusal (the sharpest reading — one document lands, one is refused), (b)
// the examiner's exact fixture (EVERY batch refused), (c) a REFUSED COLLISION (the record at the id is a LOCAL document, so the
// mirror may not name it as projected), and (d) the CONTROL that makes (a)–(c) non-vacuous: the same two-document read over a
// plain real store whose batch is ACCEPTED, where both ids must be named in the list's order.
// ===========================================================================

/** The refusal is INJECTED at the STORE's one writer; every READ stays the real store's (so the doc-heads read is a real read). */
function storeRefusing(store: RagStore, refuse: (ops: BatchOp[]) => boolean): RagStore {
  return new Proxy(store, {
    get(target, prop) {
      if (prop === 'applyBatch') {
        return async (ops: BatchOp[]) =>
          refuse(ops) ? { ok: false as const, error: 'rag applyBatch: refused by the F11 row', failedIndex: 0 } : target.applyBatch(ops)
      }
      const value = Reflect.get(target, prop, target) as unknown
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(target) : value
    },
  }) as RagStore
}

/** The engine-origin descriptor's FOUR keys, sorted — the shape `reconcile()` must still answer (§2, `ASM-B4A-2`). */
const F11_FOUR_KEYS = 'edgeIds,kind,nodeIds,store'

/** The four-key/engine-origin shape every `reconcile()` answer in this row must carry, reported with the limb's own label. */
function descriptorShape(label: string, answer: RagStoreChangedPayload): string[] {
  const problems: string[] = []
  const keys = Object.keys(answer).sort().join(',')
  if (keys !== F11_FOUR_KEYS) {
    problems.push(`${label}: the descriptor's keys read \`${keys}\` — \`reconcile()\` answers the FOUR-key engine-origin descriptor (\`${F11_FOUR_KEYS}\`)`)
  }
  if (answer.kind !== 'structural') problems.push(`${label}: \`kind\` reads ${shown(answer.kind)} — the walk's descriptor is \`structural\``)
  if (answer.store !== 'gnosis:engine') problems.push(`${label}: \`store\` reads ${shown(answer.store)} — the walk's descriptor carries the engine origin \`gnosis:engine\``)
  if (shown(answer.edgeIds) !== shown([])) problems.push(`${label}: \`edgeIds\` reads ${shown(answer.edgeIds)} — a document-list walk names no edges`)
  return problems
}

describe('B-4a `F11` (B4A-F11) — `reconcile()` names only what the walk PROJECTED, reached through the STORE-REFUSAL arm', () => {
  it('F11 — a REFUSED batch is not a landed projection: the descriptor names only what landed (CONTROL: nothing refused ⇒ both named)', async () => {
    const problems: string[] = []
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    // THE ONE READ all four limbs share: TWO documents, and the list CLAIMS to be complete (`complete: true`), which is what makes
    // limb (b) the arm `H5` cannot see — the flag is honest about the READ and silent about the PROJECTION.
    const readTwo = async (): Promise<MirrorReadAnswer> => ({
      documents: [
        { documentId: 'doc-r1', title: 'R1' },
        { documentId: 'doc-r2', title: 'R2' },
      ],
      complete: true,
    })

    // ---- (d) THE CONTROL, FIRST: the same read over a plain REAL store whose batch is ACCEPTED ------------------------------
    // Without this limb a row that asserted "the descriptor names nothing" would pass for a mirror that never walks at all.
    const control = newRagStore()
    const controlMirror = constructMirror(mod.createEngineMirror, { store: () => control.store, read: readTwo }, problems)
    if (controlMirror !== null) {
      const answer = await controlMirror.reconcile()
      const status = controlMirror.status()
      const heads = handleRagDocHeadsIpc(control.store)
      problems.push(...descriptorShape('F11 CONTROL', answer))
      if (shown(answer.nodeIds) !== shown(['doc-r1', 'doc-r2'])) {
        problems.push(
          `F11 CONTROL: \`reconcile()\` answered nodeIds ${shown(answer.nodeIds)} over an ACCEPTED store while the walk read ` +
            `projected ${String(status.projected)} / failed ${String(status.failed)} — nothing was refused, so BOTH listed ids must be named, in the list's order`,
        )
      }
      if (status.projected !== 2) {
        problems.push(`F11 CONTROL: \`status().projected\` read ${String(status.projected)} (lastFailure ${shown(status.lastFailure)}) — the accepted store lands both projections, so the refusal limbs below have a subject`)
      }
      if (status.failed !== 0) {
        problems.push(`F11 CONTROL: \`status().failed\` read ${String(status.failed)} over an ACCEPTED store (lastFailure ${shown(status.lastFailure)}) — no fault may be counted where none occurred`)
      }
      if (heads.documents.length !== 2 || rowFor(heads, 'doc-r1')?.title !== 'R1' || rowFor(heads, 'doc-r2')?.title !== 'R2') {
        problems.push(`F11 CONTROL: the doc-heads read answered ${shown(heads.documents)} — the accepted walk projects BOTH documents (R1 / R2), which is what the refused limbs then withhold`)
      }
    }

    // ---- (a) THE PARTIAL REFUSAL, the sharpest reading: only the batch naming `doc-r2` is refused -------------------------
    const partial = newRagStore()
    const partialStore = storeRefusing(partial.store, (ops) => ops.some((op) => op.op === 'putNode' && op.node.id === 'doc-r2'))
    const partialMirror = constructMirror(mod.createEngineMirror, { store: () => partialStore, read: readTwo }, problems)
    if (partialMirror !== null) {
      const answer = await partialMirror.reconcile()
      const status = partialMirror.status()
      // The doc-heads read is taken on the REAL store object, never the proxy: the reading is what the pane would see.
      const heads = handleRagDocHeadsIpc(partial.store)
      problems.push(...descriptorShape('F11(a)', answer))
      if (shown(answer.nodeIds) !== shown(['doc-r1'])) {
        problems.push(
          `F11(a): \`reconcile()\` answered nodeIds ${shown(answer.nodeIds)} while the walk read projected ${String(status.projected)} / failed ` +
            `${String(status.failed)} — the descriptor names a document the walk did not land (\`B4A-F5\`'s rule, reached through the ` +
            `STORE-REFUSAL arm which \`H5\` does not pin)`,
        )
      }
      if (status.projected !== 1) {
        problems.push(`F11(a): \`status().projected\` read ${String(status.projected)} — one batch was accepted, so exactly ONE projection landed (lastFailure ${shown(status.lastFailure)})`)
      }
      if (status.failed !== 1) {
        problems.push(`F11(a): \`status().failed\` read ${String(status.failed)} — the refused batch is ONE contained, counted failure (lastFailure ${shown(status.lastFailure)})`)
      }
      if (heads.documents.length !== 1 || heads.documents[0]?.documentId !== 'doc-r1' || heads.documents[0]?.title !== 'R1') {
        problems.push(`F11(a): the doc-heads read answered ${shown(heads.documents)} — only \`doc-r1\` / 'R1' landed, so the descriptor's one named id is the only row the pane can find`)
      }
      if (rowFor(heads, 'doc-r2') !== undefined) {
        problems.push(`F11(a): the doc-heads read answered a row for \`doc-r2\` (${shown(rowFor(heads, 'doc-r2'))}) — its batch was REFUSED, so nothing of it may be visible OR named`)
      }
    }

    // ---- (b) THE TOTAL REFUSAL — the examiner's exact fixture: EVERY batch refused --------------------------------------
    const total = newRagStore()
    const totalBefore = storeCounts(total.store)
    const totalStore = storeRefusing(total.store, () => true)
    const totalMirror = constructMirror(mod.createEngineMirror, { store: () => totalStore, read: readTwo }, problems)
    if (totalMirror !== null) {
      const answer = await totalMirror.reconcile()
      const status = totalMirror.status()
      problems.push(...descriptorShape('F11(b)', answer))
      if (shown(answer.nodeIds) !== shown([])) {
        problems.push(
          `F11(b): \`reconcile()\` answered nodeIds ${shown(answer.nodeIds)} with EVERY batch refused — the walk read projected ${String(status.projected)} / ` +
            `failed ${String(status.failed)}, so the examiner's reading (\`nodeIds ['doc-p1','doc-p2']\` against \`projected 0 / failed 2\`) is reproduced`,
        )
      }
      if (status.projected !== 0) {
        problems.push(`F11(b): \`status().projected\` read ${String(status.projected)} — no batch was accepted`)
      }
      if (status.failed !== 2) {
        problems.push(`F11(b): \`status().failed\` read ${String(status.failed)} — the two refused batches are two contained failures (lastFailure ${shown(status.lastFailure)})`)
      }
      if (typeof status.lastFailure !== 'string' || !status.lastFailure.includes('apply:')) {
        problems.push(`F11(b): \`status().lastFailure\` read ${shown(status.lastFailure)} — a refused batch is named by its \`apply:\` fault, never thrown`)
      }
      if (handleRagDocHeadsIpc(total.store).documents.length !== 0) {
        problems.push(`F11(b): the doc-heads read answered ${shown(handleRagDocHeadsIpc(total.store).documents)} — a refused batch writes NOTHING the pane can read`)
      }
      if (shown(storeCounts(total.store)) !== shown(totalBefore)) {
        problems.push(`F11(b): the store counts moved from ${shown(totalBefore)} to ${shown(storeCounts(total.store))} across a walk whose every batch was refused — a refusal is a contained no-write`)
      }
    }

    // ---- (c) A REFUSED (collision) ID IS NOT NAMED EITHER: the record at `doc-c` is a LOCAL document ----------------------
    const local = newRagStore()
    const seeded = await local.store.applyBatch(localDocOps('doc-c', 'LOCAL TITLE'))
    if (seeded.ok !== true) {
      problems.push(`F11(c) CONTROL: the LOCAL document at \`doc-c\` did not land (${shown(seeded)}) — the collision has no subject`)
    }
    const readLocalCollision = async (): Promise<MirrorReadAnswer> => ({
      documents: [{ documentId: 'doc-c', title: 'ENGINE TITLE' }],
      complete: true,
    })
    const collisionMirror = constructMirror(mod.createEngineMirror, { store: () => local.store, read: readLocalCollision }, problems)
    if (collisionMirror !== null) {
      const answer = await collisionMirror.reconcile()
      const status = collisionMirror.status()
      const heads = handleRagDocHeadsIpc(local.store)
      problems.push(...descriptorShape('F11(c)', answer))
      if (shown(answer.nodeIds) !== shown([])) {
        problems.push(
          `F11(c): \`reconcile()\` answered nodeIds ${shown(answer.nodeIds)} while the walk read projected ${String(status.projected)} / refused ` +
            `${String(status.refused)} — the mirror does not own \`doc-c\`, so it may not name it as projected`,
        )
      }
      if (status.refused !== 1) {
        problems.push(`F11(c): \`status().refused\` read ${String(status.refused)} — a LOCAL document holding the engine id is REFUSED and counted, never clobbered (§5's last clause)`)
      }
      if (status.projected !== 0) {
        problems.push(`F11(c): \`status().projected\` read ${String(status.projected)} — a refused collision projects nothing`)
      }
      const row = rowFor(heads, 'doc-c')
      if (row === undefined || row.title !== 'LOCAL TITLE') {
        problems.push(`F11(c): the doc-heads read answered ${shown(row)} — the LOCAL document must still answer its own title ('LOCAL TITLE'), never the engine's`)
      }
    }

    expect(problems, `F11:\n${problems.join('\n')}`).toEqual([])
  })
})
