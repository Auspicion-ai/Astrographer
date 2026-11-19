// tests/unit/gnosis-changes/engine-mirror.test.ts — unit `B-4a` `engine-store-mirror`'s MODULE rows: `M1` (the projection's
// shape), `M2` (idempotency), `M3` (the engine stays authoritative), `M4` (remove), `M5` (the local-collision refusal), `M6`
// (the walk) and `S1` (`status()`). Authored BEFORE any byte of `src/main/engine-mirror.ts` exists (RCA-1: the red set runs
// first and is REPORTED before implementation).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4a-engine-store-mirror.md` §3 (the surface), §4 (the two triggers), §5 (the
// invariants), §6 (the red set) — via `docs/L2/gnosis-changes/engine-mirror.md` §2 (the exact signatures and counters), §3
// (the state machine), §4 (the doc-head triple, the marker, the equal-projection shortcut), §6 (the failure table), §7 (the row
// table) and `docs/L3/gnosis-changes/engine-mirror.md` §3/§4 (the planners, the one serialization point).
//
// THE MODULE IS DRIVEN FOR REAL: a real `createEngineMirror(...)` over a real `createJsonRagStore(...)` on a `mkdtempSync`
// `/tmp` path, with `read` a plain INJECTED function (no socket, no engine, no port — `C3` is the clause that pins it, and the
// park's own limb is `docs/L1/…-engine-store-mirror.md` §8). At the red head the module does not resolve, so every reading
// below is a NAMED absence from `loadMirrorModule()` rather than a skip or an unhandled `TypeError`.
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS. These rows read the store's own records, `handleRagDocHeadsIpc(store)` (the exact read
// `B6-F1` names) and the mirror's own counters. What they can NEVER say: that an engine wrote anything, that a descriptor
// arrived on a wire, or anything about the assembled app — the live arm is PARKED (contract §8) and no row here claims it.
//
// NON-VACUITY: every zero is floored by a positive control on the same rig — `M4`'s "no batch" is floored by the batch that
// preceded it, `M5`'s refusal by the LOCAL document still answering ONE doc-heads row, and `M6`'s exact descriptor by the two
// documents it names. `M2`'s "counts unmoved" is only meaningful because the FIRST apply moved them.
import { describe, it, expect } from 'vitest'

import { handleRagDocHeadsIpc } from '../../../src/main/mcp-server.js'
import type { RagStore } from '../../../src/main/rag-store.js'
import {
  constructMirror,
  emptyRead,
  loadMirrorModule,
  localDocOps,
  markedRoots,
  newRagStore,
  shown,
  storeCounts,
  type MirrorHandle,
  type MirrorReadAnswer,
} from '../../integration/gnosis-changes/harness.js'

/** §2's CLOSED count set, spelled once here so `S1` compares a LIST and not a set. */
const STATUS_KEYS = [
  'projections',
  'accepted',
  'projected',
  'unchanged',
  'removed',
  'refused',
  'unresolved',
  'failed',
  'walks',
  'lastFailure',
] as const

interface Rig {
  mirror: MirrorHandle | null
  store: RagStore
  problems: string[]
}

interface RigOverrides {
  read?: () => Promise<MirrorReadAnswer>
  origin?: string
  maxPerWalk?: number
}

/**
 * One fresh real store + one real mirror per row. A missing module is a NAMED problem, and `constructMirror` validates the four
 * members before any row touches them — so a member that does not exist is a problem string, never `undefined.accepted(...)`.
 */
async function rig(over: RigOverrides = {}): Promise<Rig> {
  const { store } = newRagStore()
  const mod = await loadMirrorModule()
  const problems = [...mod.problems]
  const opts: Record<string, unknown> = {
    store: () => store,
    read: over.read ?? (async () => emptyRead()),
  }
  if (over.origin !== undefined) opts.origin = over.origin
  if (over.maxPerWalk !== undefined) opts.maxPerWalk = over.maxPerWalk
  const mirror = constructMirror(mod.createEngineMirror, opts, problems)
  return { mirror, store, problems }
}

const upsert = (documentId: string, title: string) => ({ kind: 'upsert' as const, document: { documentId, title } })

describe('B-4a §6 `M1`–`M4` — the projection, its idempotency, the engine\'s authority, and the removal', () => {
  it('M1 — the projection is EXACTLY the doc-head triple: root + head + ONE `doc-head` edge, deterministic ids, title = the engine\'s', async () => {
    // MUTATION THAT WOULD RED IT: a random head/edge id, a missing marker, a title written on the ROOT instead of the head (the
    // doc-heads read answers the head's `content` as the title, `mcp-server.ts:934`), or a second edge per projection.
    const { mirror, store, problems } = await rig()
    if (mirror !== null) {
      try {
        await mirror.accepted(upsert('doc-a', 'Engine Title'))
      } catch (err) {
        problems.push(`M1: \`accepted\` REJECTED (${err instanceof Error ? err.message : String(err)}) — §3: its fault is CONTAINED, never a rejection`)
      }
      const headId = 'doc-a:engine-head'
      const nodes = store.listNodes()
      const edges = store.listEdges()
      if (nodes.length !== 2) {
        problems.push(`M1: the store holds ${nodes.length} node(s) after one projection — §4's triple is EXACTLY 2 (a \`div\` root + one \`h1\` head); got ${shown(nodes.map((n) => n.id))}`)
      }
      const root = nodes.find((n) => n.id === 'doc-a')
      if (root === undefined) {
        problems.push('M1: no node carries the engine document id `doc-a` — the doc-heads read answers the EDGE TARGET as `documentId`, so the root must carry it')
      } else {
        if (root.type !== 'div') problems.push(`M1: the root's type reads ${shown(root.type)} — the markdown-parse root is a STRUCTURAL div (markdown-parse.ts:558)`)
        if (root.content !== '') problems.push(`M1: the root's content reads ${shown(root.content)} — the TITLE rides the head's content, never the root's`)
        if (root.props?.['data-engine-mirror'] !== true) {
          problems.push(`M1: the root does not carry \`props['data-engine-mirror'] === true\` (props read ${shown(root.props)}) — the MARKER is what licenses every later update/delete (§4, §5 limb 1)`)
        }
        const owned = Array.isArray(root.ownedNodeIds) ? root.ownedNodeIds : []
        if (owned.length !== 1 || owned[0] !== headId) {
          problems.push(`M1: the root's \`ownedNodeIds\` read ${shown(owned)} — the projection owns exactly \`['${headId}']\``)
        }
      }
      const head = nodes.find((n) => n.id === headId)
      if (head === undefined) {
        problems.push(`M1: no node with the DERIVED id \`${headId}\` exists — §4's id is \`<documentId>:engine-head\`, never a random one`)
      } else {
        if (head.type !== 'h1') problems.push(`M1: the head's type reads ${shown(head.type)} — a document head is an \`h1\` (markdown-parse.ts:568)`)
        if (head.content !== 'Engine Title') problems.push(`M1: the head's content reads ${shown(head.content)} — it must be the ENGINE's title`)
        if (head.props?.['data-doc-head'] !== true) problems.push(`M1: the head does not carry \`props['data-doc-head'] === true\` (props read ${shown(head.props)})`)
      }
      if (edges.length !== 1) {
        problems.push(`M1: the store holds ${edges.length} edge(s) after one projection — §4: ONE \`doc-head\` edge, id \`doc-head:doc-a\``)
      } else {
        const edge = edges[0]!
        if (edge.id !== 'doc-head:doc-a') problems.push(`M1: the edge id reads ${shown(edge.id)} — §4's derived id is \`doc-head:<documentId>\``)
        if (edge.kind !== 'doc-head') problems.push(`M1: the edge kind reads ${shown(edge.kind)} — the doc-heads read walks \`edgesByKind('doc-head')\``)
        if (edge.source !== headId) problems.push(`M1: the edge's source reads ${shown(edge.source)} — it must be the HEAD (the title's home)`)
        if (edge.target !== 'doc-a') problems.push(`M1: the edge's target reads ${shown(edge.target)} — it must be the engine document id`)
        if (shown(edge.documentIds) !== shown(['doc-a'])) problems.push(`M1: the edge's \`documentIds\` read ${shown(edge.documentIds)} — the local doc-flow shape is \`[<documentId>]\``)
      }
      const heads = handleRagDocHeadsIpc(store)
      if (heads.documents.length !== 1) {
        problems.push(`M1: \`handleRagDocHeadsIpc(store)\` answered ${heads.documents.length} row(s) — a broken projection answers \`unchanged\` in the pane (the whole defect)`)
      } else {
        const row = heads.documents[0]!
        if (row.documentId !== 'doc-a' || row.title !== 'Engine Title' || shown(row.path) !== shown([]) || shown(row.tags) !== shown([])) {
          problems.push(`M1: the doc-heads row reads ${shown(row)} — expected {documentId:'doc-a', title:'Engine Title', path: [], tags: []} (a limb-(a) write with no tags projects none; \`documentPath\` is NEVER projected)`)
        }
      }
    }
    expect(problems, `M1:\n${problems.join('\n')}`).toEqual([])
  })

  it('M2 — the SAME document applied twice lands ONE projection: `projected 1 / unchanged 1`, no second batch, ONE doc-heads row', async () => {
    // MUTATION THAT WOULD RED IT: a projection that mints a fresh id (or a fresh `updatedAt`) per apply, so the second apply
    // writes again — the journal flood §4's equal-projection shortcut exists to prevent. The COUNTS unmoved clause is only
    // meaningful because the FIRST apply moved them, read below as the positive control.
    const { mirror, store, problems } = await rig()
    if (mirror !== null) {
      try {
        await mirror.accepted(upsert('doc-a', 'Idempotent'))
        const afterFirst = storeCounts(store)
        if (afterFirst.nodes !== 2 || afterFirst.edges !== 1 || afterFirst.journal < 1) {
          problems.push(`M2 CONTROL: after the FIRST apply the counts read ${shown(afterFirst)} — the projection did not land, so "unmoved" below would be vacuous`)
        }
        await mirror.accepted(upsert('doc-a', 'Idempotent'))
        const afterSecond = storeCounts(store)
        if (shown(afterFirst) !== shown(afterSecond)) {
          problems.push(`M2: the counts read ${shown(afterFirst)} before and ${shown(afterSecond)} after the SECOND identical apply — an equal projection writes NOTHING (no batch, no journal entry, no persist)`)
        }
        const status = mirror.status()
        if (status?.accepted !== 2) problems.push(`M2: \`status().accepted\` read ${String(status?.accepted)} — §2: one increment per write offered by the CRUD seam`)
        if (status?.projected !== 1) problems.push(`M2: \`status().projected\` read ${String(status?.projected)} — the SECOND apply must not project again`)
        if (status?.unchanged !== 1) problems.push(`M2: \`status().unchanged\` read ${String(status?.unchanged)} — the second apply is the EQUAL projection, and it is counted`)
        const heads = handleRagDocHeadsIpc(store)
        if (heads.documents.length !== 1) problems.push(`M2: the doc-heads read answered ${heads.documents.length} row(s) after two identical applies — a duplicate head would answer TWO`)
      } catch (err) {
        problems.push(`M2: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `M2:\n${problems.join('\n')}`).toEqual([])
  })

  it('M3 — the ENGINE stays authoritative: a retitle replaces the head\'s content and keeps ONE edge', async () => {
    // MUTATION THAT WOULD RED IT: a projection that treats the local record as the winner (`updatedAt`/content compared instead
    // of overwritten), or one that appends a second head/edge on retitle. §1 ASM-B4A-1: the engine is authoritative for
    // engine-side data; the mirror's content is a PROJECTION of an answer the engine gave.
    const { mirror, store, problems } = await rig()
    if (mirror !== null) {
      try {
        await mirror.accepted(upsert('doc-a', 'First'))
        await mirror.accepted(upsert('doc-a', 'Second'))
        const head = store.getNode('doc-a:engine-head')
        if (head === undefined) problems.push('M3: no head node after the retitle — the first projection did not land')
        else if (head.content !== 'Second') {
          problems.push(`M3: the head's content reads ${shown(head.content)} — the ENGINE's newest title is authoritative, so 'Second' must replace 'First'`)
        }
        const status = mirror.status()
        if (status?.projected !== 2) problems.push(`M3: \`status().projected\` read ${String(status?.projected)} — a retitle DIFFERS from the projection, so it is a second batch`)
        const pending = store.edgesByKind('doc-head')
        if (pending.length !== 1) problems.push(`M3: \`edgesByKind('doc-head')\` read ${pending.length} edge(s) after a retitle — the derived edge id makes the retitle an UPDATE, never a second edge`)
        const heads = handleRagDocHeadsIpc(store)
        if (heads.documents.length !== 1 || heads.documents[0]?.title !== 'Second') {
          problems.push(`M3: the doc-heads read answered ${shown(heads.documents)} — one row, titled 'Second'`)
        }
      } catch (err) {
        problems.push(`M3: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `M3:\n${problems.join('\n')}`).toEqual([])
  })

  it('M4 — `remove` deletes the projection (doc-heads `[]`) and a SECOND remove of the absent projection is `unchanged` with NO batch', async () => {
    // MUTATION THAT WOULD RED IT: a remove that leaves the head node (or the edge) behind, or one that writes a batch for an
    // absent projection — §5's "a missing projection is `unchanged`, never a write" and §3's "absence is not evidence".
    const { mirror, store, problems } = await rig()
    if (mirror !== null) {
      try {
        await mirror.accepted(upsert('doc-a', 'Removable'))
        if (handleRagDocHeadsIpc(store).documents.length !== 1) {
          problems.push('M4 CONTROL: the projection did not land before the remove — the removal has nothing to delete')
        }
        await mirror.accepted({ kind: 'remove', documentId: 'doc-a' })
        const heads = handleRagDocHeadsIpc(store)
        if (heads.documents.length !== 0) problems.push(`M4: the doc-heads read answered ${shown(heads.documents)} after the remove — §4: \`{documents: []}\``)
        const status = mirror.status()
        if (status?.removed !== 1) problems.push(`M4: \`status().removed\` read ${String(status?.removed)} — one batch deleted a projection`)
        const marked = markedRoots(store)
        if (marked.length !== 0) problems.push(`M4: the store still holds ${marked.length} MARKED root(s) ${shown(marked)} — the projection's own records are gone`)
        const journalAfterRemove = store.journal().length
        const unchangedBefore = mirror.status()?.unchanged ?? -1
        await mirror.accepted({ kind: 'remove', documentId: 'doc-a' })
        const status2 = mirror.status()
        if (status2?.unchanged !== unchangedBefore + 1) {
          problems.push(`M4: \`status().unchanged\` read ${String(status2?.unchanged)} after the second remove (was ${String(unchangedBefore)}) — an ABSENT projection is \`unchanged\`, counted once`)
        }
        if (store.journal().length !== journalAfterRemove) {
          problems.push(`M4: the journal grew from ${journalAfterRemove} to ${store.journal().length} on the remove of an ABSENT projection — no batch is due`)
        }
      } catch (err) {
        problems.push(`M4: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `M4:\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4a §6 `M5`–`M6`, `S1` — the collision arm, the walk, and `status()`', () => {
  it('M5 — a LOCAL document holding the id is REFUSED (upsert AND remove): never clobbered, everything unmoved', async () => {
    // MUTATION THAT WOULD RED IT: a planner that compares EQUALITY before the MARKER — an unmarked root would then answer
    // `unchanged` for a collision the contract calls `refused`, and a differing local doc would be overwritten (§5, L3
    // guardrail 1: "the marker is the ONLY thing that licenses an update or a delete").
    const { mirror, store, problems } = await rig()
    if (mirror !== null) {
      const seeded = await store.applyBatch(localDocOps('doc-a', 'LOCAL TITLE'))
      if (seeded.ok !== true) problems.push(`M5: the LOCAL seed batch FAILED (${shown(seeded)}) — the row's subject does not exist`)
      const before = storeCounts(store)
      try {
        await mirror.accepted(upsert('doc-a', 'ENGINE'))
        const status = mirror.status()
        if (status?.refused !== 1) problems.push(`M5: \`status().refused\` read ${String(status?.refused)} after the colliding upsert — a LOCAL (unmarked) root is REFUSED, never clobbered`)
        if (status?.projected !== 0) problems.push(`M5: \`status().projected\` read ${String(status?.projected)} — a refusal writes NOTHING`)
        const root = store.getNode('doc-a')
        const head = store.getNode('doc-a:section:1')
        if (root === undefined) problems.push('M5: the LOCAL root `doc-a` is GONE after the colliding upsert — that is the clobber the refusal exists to prevent')
        else {
          if (root.content !== '') problems.push(`M5: the LOCAL root's content reads ${shown(root.content)} — untouched`)
          if (root.props?.['data-engine-mirror'] === true) problems.push('M5: the LOCAL root acquired the engine MARKER — a refusal stamps nothing')
        }
        if (head === undefined) problems.push('M5: the LOCAL head `doc-a:section:1` is GONE after the colliding upsert')
        else if (head.content !== 'LOCAL TITLE') problems.push(`M5: the LOCAL head's content reads ${shown(head.content)} — the projection must not overwrite a local document's title`)
        const afterUpsert = storeCounts(store)
        if (shown(before) !== shown(afterUpsert)) {
          problems.push(`M5: the store counts moved from ${shown(before)} to ${shown(afterUpsert)} on a REFUSED upsert — nothing is written`)
        }
        await mirror.accepted({ kind: 'remove', documentId: 'doc-a' })
        const status2 = mirror.status()
        if (status2?.refused !== 2) problems.push(`M5: \`status().refused\` read ${String(status2?.refused)} after the colliding REMOVE — an unmarked root is refused there too`)
        const stillThere = handleRagDocHeadsIpc(store)
        if (stillThere.documents.length !== 1 || stillThere.documents[0]?.title !== 'LOCAL TITLE') {
          problems.push(`M5: the doc-heads read answered ${shown(stillThere.documents)} after the refused remove — the LOCAL document must still be there, titled 'LOCAL TITLE'`)
        }
        if (store.getNode('doc-a') === undefined) problems.push('M5: the LOCAL root is gone after the refused REMOVE — a local document is never a projection\'s subject')
        const afterRemove = storeCounts(store)
        if (shown(before) !== shown(afterRemove)) {
          problems.push(`M5: the store counts moved from ${shown(before)} to ${shown(afterRemove)} on a REFUSED remove — nothing is written`)
        }
      } catch (err) {
        problems.push(`M5: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `M5:\n${problems.join('\n')}`).toEqual([])
  })

  it('M6 — `reconcile()` walks, projects every listed document and answers exactly `{kind, nodeIds, edgeIds, store}` naming THOSE ids', async () => {
    // MUTATION THAT WOULD RED IT: a walk that answers a descriptor naming the store's contents (or the previous walk's ids), or
    // one that projects nothing and calls the answer a success — the re-read's answer and the projection are ONE act
    // (contract §5 limb (i)), so an answer naming ids it did not project is a lie the pane would trust.
    const read = async (): Promise<MirrorReadAnswer> => ({
      documents: [
        { documentId: 'doc-a', title: 'A' },
        { documentId: 'doc-b', title: 'B' },
      ],
      complete: true,
    })
    const { mirror, store, problems } = await rig({ read })
    if (mirror !== null) {
      try {
        const answer = await mirror.reconcile()
        if (answer === null || typeof answer !== 'object') {
          problems.push(`M6: \`reconcile()\` answered ${shown(answer)} — §2 requires the four-key engine-origin descriptor`)
        } else {
          const keys = Object.keys(answer).sort()
          if (keys.join(',') !== 'edgeIds,kind,nodeIds,store') {
            problems.push(`M6: the descriptor's KEY LIST reads [${keys.join(', ')}] — the contract's four keys are \`kind\`, \`nodeIds\`, \`edgeIds\`, \`store\` and NOTHING else`)
          }
          if (answer.kind !== 'structural') problems.push(`M6: the descriptor's kind reads ${shown(answer.kind)} — a walk is \`structural\``)
          if (shown(answer.nodeIds) !== shown(['doc-a', 'doc-b'])) {
            problems.push(`M6: the descriptor's nodeIds read ${shown(answer.nodeIds)} — EXACTLY the ids the walk read, in the order it read them`)
          }
          if (shown(answer.edgeIds) !== shown([])) problems.push(`M6: the descriptor's edgeIds read ${shown(answer.edgeIds)} — a document-list walk moves no edge identity`)
          if (answer.store !== 'gnosis:engine') problems.push(`M6: the descriptor's store reads ${shown(answer.store)} — the origin defaults to \`ENGINE_ORIGIN_STORE\` ('gnosis:engine')`)
        }
        const heads = handleRagDocHeadsIpc(store)
        if (heads.documents.length !== 2) {
          problems.push(`M6: the doc-heads read answered ${heads.documents.length} row(s) after the walk — BOTH listed documents are projected`)
        } else if (heads.documents[0]?.documentId !== 'doc-a' || heads.documents[0]?.title !== 'A' || heads.documents[1]?.documentId !== 'doc-b' || heads.documents[1]?.title !== 'B') {
          problems.push(`M6: the doc-heads rows read ${shown(heads.documents)} — both engine documents, sorted by documentId, each titled from the list read`)
        }
        const marked = markedRoots(store)
        if (shown(marked.sort()) !== shown(['doc-a', 'doc-b'])) problems.push(`M6: the MARKED roots read ${shown(marked)} — every document the walk read is projected with the marker`)
        const status = mirror.status()
        if (status?.walks !== 1) problems.push(`M6: \`status().walks\` read ${String(status?.walks)} after ONE \`reconcile()\` — one walk, and no trailing demand was made`)
      } catch (err) {
        problems.push(`M6: driving threw (${err instanceof Error ? err.message : String(err)}) — §3: \`reconcile()\` never rejects`)
      }
    }
    expect(problems, `M6:\n${problems.join('\n')}`).toEqual([])
  })

  it('S1 — `status()` is a COPY of a CLOSED ten-key set, and `projections` is the MARKED roots the store holds NOW', async () => {
    // MUTATION THAT WOULD RED IT: a status that returns the module's own counter object (mutating it moves the module), a
    // widened key set (`census`/`accepted count`/a raw error object), or a `projections` read from bookkeeping instead of the
    // store (L3 guardrail 7: a restart cannot make it lie).
    const { mirror, store, problems } = await rig()
    if (mirror !== null) {
      const status = mirror.status()
      if (status === null || typeof status !== 'object') {
        problems.push(`S1: \`status()\` answered ${shown(status)} — §2 requires a fresh object`)
      } else {
        const keys = Object.keys(status).sort()
        const expected = [...STATUS_KEYS].sort()
        if (keys.join(',') !== expected.join(',')) {
          problems.push(`S1: \`status()\` keys read [${keys.join(', ')}] — the CLOSED set is [${expected.join(', ')}] (a widened set is a new contract; a narrowed one hides a counter)`)
        }
        if (typeof status.projections !== 'number' || status.projections !== 0) {
          problems.push(`S1: \`status().projections\` reads ${shown(status.projections)} on an untouched store — it is counted FROM the store, so an empty store reads 0`)
        }
        if (status.lastFailure !== null) problems.push(`S1: \`status().lastFailure\` reads ${shown(status.lastFailure)} on a clean rig — \`null\` until a typed failure is recorded`)
        // THE COPY: mutating the returned object must not move a second call.
        try {
          ;(status as unknown as Record<string, unknown>)['projections'] = 999
          ;(status as unknown as Record<string, unknown>)['walks'] = 999
        } catch {
          // a frozen copy refuses the write outright — that is a copy too, and not a failure of the clause.
        }
        const second = mirror.status()
        if (second?.projections === 999 || second?.walks === 999) {
          problems.push(`S1: mutating the object \`status()\` returned MOVED the module (a second call read projections=${String(second?.projections)}, walks=${String(second?.walks)}) — §2: a COPY per call`)
        }
      }
      try {
        await mirror.accepted(upsert('doc-a', 'Counted'))
        if (mirror.status()?.projections !== 1) {
          problems.push(`S1: \`status().projections\` reads ${String(mirror.status()?.projections)} after ONE projection — it counts the MARKED roots the store holds now (${shown(markedRoots(store))})`)
        }
      } catch (err) {
        problems.push(`S1: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `S1:\n${problems.join('\n')}`).toEqual([])
  })
})
