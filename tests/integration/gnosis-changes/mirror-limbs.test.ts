// tests/integration/gnosis-changes/mirror-limbs.test.ts — unit `B-4a` `engine-store-mirror`'s TWO LIMBS and its four guards,
// driven through the REAL modules and the harness's injected doubles: `E1` (limb (a), the accepted write), `E2` (limb (b), the
// descriptor at the instant of the broadcast), `G1` (the engine REFUSED), `G2` (a failed/truncated walk), `G3` (coalescing) and
// `G4` (a descriptor that walks nothing). Authored BEFORE any byte of `src/main/engine-mirror.ts` exists (RCA-1).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4a-engine-store-mirror.md` §2 (the route), §4 (the two triggers and their ORDER),
// §5 (the invariants), §6 (the red set `E1`/`E2`/`G1`–`G4`) — via `docs/L2/gnosis-changes/engine-mirror.md` §3 (the state
// machine, verbatim), §5 (the THREE wiring sites), §6 (the failure table) and `docs/L3/gnosis-changes/engine-mirror.md` §4
// (the ONE serialization point and the coalescing state).
//
// THE ORDER IS THE WHOLE OF THE INVARIANT (`B6-F1`'s closure, contract §4): limb (a)'s projection lands BEFORE the engine's
// answer reaches the caller — so `E1` reads the doc-heads IMMEDIATELY after `await proxy.createDocument(...)`; limb (b)'s
// projection lands BEFORE the descriptor is broadcast — so `E2` reads the doc-heads INSIDE the sink, at the broadcast instant,
// exactly as `src/main/main.ts` will (`settle` then `broadcast`, in the SAME expression).
//
// NO SOCKET, NO ENGINE, NO PORT — and the ONE fetch-shaped thing here is named so it cannot be mistaken for one: the doubles are
// INJECTED through the two seams the shipped modules already expose (`EngineCrudRagStoreOptions.fetch`,
// `EngineChangesFeedOptions.sse`), the harness's `crudTransport()` TYPES a `typeof fetch` double whose responder answers a real
// `new Response(...)`, and this file never calls a fetch of its own (`C3` scans exactly that). The live arm is PARKED
// (contract §8) and no row here claims an engine event.
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS — real modules over a real store on a `/tmp` path. What these rows can NEVER say: that the
// engine accepted a wire envelope, that a frame arrived on a wire, or anything about the assembled app.
import { describe, it, expect } from 'vitest'

import { createEngineCrudRagStore } from '../../../src/main/engine-crud-rag-store.js'
import { ConflictError } from '../../../src/main/engine-rag-store.js'
import { handleRagDocHeadsIpc } from '../../../src/main/mcp-server.js'
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
  markedRoots,
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

/** The CRUD proxy's options, as the factory declares them TODAY — the seam's cast target (§5 site 2). */
type CrudOptions = Parameters<typeof createEngineCrudRagStore>[0]

/** The CRUD proxy as the row drives it (the two members this file calls). */
interface CrudProxy {
  createDocument(args: { caller: string; wikiId: string; body: { title: string; tags: string[] | null; author: string | null } }): Promise<{ documentId: string }>
  updateDocument(args: {
    caller: string
    documentId: string
    body: { baseRevision: number; graph: { nodes: unknown[]; edges: unknown[] }; title: string | null; tags: string[] | null }
  }): Promise<{ documentId: string }>
}

const upsert = (documentId: string, title: string, tags?: string[]) => ({
  kind: 'upsert' as const,
  document: tags === undefined ? { documentId, title } : { documentId, title, tags },
})

/** The one doc-heads row for `documentId`, or a readable absence — so a problem names what it read, never `[object Object]`. */
function docHeadRow(heads: RagDocHeadsPayload, documentId: string): RagDocHeadsPayload['documents'][number] | undefined {
  return heads.documents.find((row) => row.documentId === documentId)
}

/** The full expected row shape, compared member by member (an extra key would be invisible to a `title`-only check). */
function rowProblems(prefix: string, heads: RagDocHeadsPayload, expected: RagDocHeadsPayload['documents']): string[] {
  const problems: string[] = []
  if (heads.documents.length !== expected.length) {
    problems.push(`${prefix}: \`handleRagDocHeadsIpc(store)\` answered ${heads.documents.length} row(s) ${shown(heads.documents)} — expected ${expected.length}`)
    return problems
  }
  for (let i = 0; i < expected.length; i += 1) {
    const got = heads.documents[i]!
    const want = expected[i]!
    if (got.documentId !== want.documentId || got.title !== want.title || shown(got.path) !== shown(want.path) || shown(got.tags) !== shown(want.tags)) {
      problems.push(`${prefix}: doc-heads row ${i} reads ${shown(got)} — expected ${shown(want)}`)
    }
  }
  return problems
}

describe('B-4a §6 `E1` — END TO END, limb (a): the engine\'s ACCEPTED write is visible to the doc-heads read', () => {
  it('E1 — `createDocument` through the REAL CRUD proxy lands the projection BEFORE its own answer, and the doc-heads answers the NEW document', async () => {
    // MUTATION THAT WOULD RED IT (`docs/L1/…-engine-store-mirror.md` §6, `E1`): delete the ONE `onAccepted` call in `crudCall`.
    // Then the proxy still answers the Document, the store stays empty, and the pane keeps saying `unchanged` — `B6-F1` itself.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => emptyRead() }, problems)
    const calls: CrudCall[] = []
    const transport = crudTransport((method, url) => {
      if (method === 'POST' && url.endsWith('/documents')) {
        return jsonResponse(crudEnvelope(crudResultPayload('createDocument', documentWire())))
      }
      return undefined
    }, calls)
    let proxy: CrudProxy | null = null
    if (mirror !== null) {
      try {
        proxy = createEngineCrudRagStore({
          baseUrl: BASE_URL,
          fetch: transport,
          // THE SEAM (§5 site 2) — cast deliberately: the member does not exist at the red head, so what reds below is
          // "NOTHING IS MIRRORED", never a type error about the option.
          onAccepted: (write: unknown) => mirror.accepted(write as Parameters<MirrorHandle['accepted']>[0]),
        } as unknown as CrudOptions) as unknown as CrudProxy
      } catch (err) {
        problems.push(`E1: the CRUD proxy's construction threw (${err instanceof Error ? err.message : String(err)}) — §5 site 2 adds ONE member and no other byte`)
      }
    }
    if (proxy !== null) {
      const before = handleRagDocHeadsIpc(store)
      if (before.documents.length !== 0) {
        problems.push(`E1 CONTROL: BEFORE the write the doc-heads read answered ${shown(before.documents)} — the store this row hands the proxy starts EMPTY, so any row below is the write's`)
      }
      try {
        const answered = await proxy.createDocument({ caller: 'operator', wikiId: 'w1', body: { title: 'Getting Started', tags: ['guide'], author: null } })
        if (shown(answered?.documentId) !== shown('d1')) {
          problems.push(`E1: \`createDocument\` answered ${shown(answered)} — the double ACCEPTED the envelope, so the proxy's own answer is the decoded Document`)
        }
        // THE ORDER (contract §4, limb (a)) — read IMMEDIATELY after the awaited call, with nothing in between.
        const after = handleRagDocHeadsIpc(store)
        problems.push(...rowProblems('E1', after, [{ documentId: 'd1', title: 'Getting Started', path: [], tags: ['guide'] }]))
        const status = mirror?.status()
        if (status?.accepted !== 1) problems.push(`E1: \`status().accepted\` read ${String(status?.accepted)} — ONE write was offered by the CRUD seam`)
        if (status?.projected !== 1) problems.push(`E1: \`status().projected\` read ${String(status?.projected)} — the accepted write landed ONE batch of the doc-head triple`)
        const counts = storeCounts(store)
        if (counts.nodes !== 2 || counts.edges !== 1) {
          problems.push(`E1: the store holds ${counts.nodes} node(s) / ${counts.edges} edge(s) — the projection is EXACTLY a root + a head + ONE doc-head edge (2/1)`)
        }
        if (calls.length !== 1) problems.push(`E1: the transport saw ${calls.length} CRUD call(s) ${shown(calls.map((c) => `${c.method} ${c.url}`))} — one create, after the READY gate the transport answers itself`)
      } catch (err) {
        problems.push(`E1: driving threw (${err instanceof Error ? err.message : String(err)}) — the double ACCEPTED the write, so nothing in this row may reject`)
      }
    }
    expect(problems, `E1:\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4a §6 `E2` — END TO END, limb (b): the doc-heads answers the engine\'s document AT THE INSTANT OF THE BROADCAST', () => {
  it('E2 — a document the fork NEVER wrote: a REAL `change` frame through the `SseClient` double → `settle` → the sink → the doc-heads', async () => {
    // MUTATION THAT WOULD RED IT (§6, `E2`): delete the mirror from the sink — i.e. broadcast the descriptor directly. Then the
    // sink's `heads` reading below is `[]` while the descriptor is already in the renderer's hands, which is `B6-F1` verbatim.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const changes = await loadChangesModule()
    problems.push(...changes.problems)
    let readAnswer: MirrorReadAnswer = emptyRead()
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => readAnswer }, problems)
    const double = new SseFrameDouble()
    const broadcasts: RagStoreChangedPayload[] = []
    const readings: Array<{ descriptor: RagStoreChangedPayload; heads: RagDocHeadsPayload }> = []
    if (mirror !== null && changes.createEngineChangesFeed !== null) {
      // THE SINK, EXACTLY AS `main.ts` WILL WIRE IT (§5 site 3): mirror FIRST, then the descriptor, then the pane's own read —
      // the doc-heads are read AT THE BROADCAST INSTANT, so a projection that lands late is visible here and nowhere else.
      const sink = (descriptor: RagStoreChangedPayload): void => {
        void (async () => {
          try {
            await mirror.settle(descriptor)
          } catch (err) {
            problems.push(`E2: \`settle\` REJECTED (${err instanceof Error ? err.message : String(err)}) — §3: it never rejects, so the caller's broadcast cannot be skipped`)
          }
          broadcasts.push(descriptor)
          readings.push({ descriptor, heads: handleRagDocHeadsIpc(store) })
        })()
      }
      try {
        const feed = changes.createEngineChangesFeed({
          baseUrl: BASE_URL,
          sse: double,
          reconcile: () => mirror.reconcile(),
          onChange: sink,
        }) as { connect(): Promise<void>; close(): void }
        await feed.connect()
        // THE ANCHOR (`ASM-B4-5`): the engine frames the announcement FIRST on every connection, and NOTHING is applied without it.
        announceAt(double, '1')
        await settled()
        await settled()
        const afterAnnounce = handleRagDocHeadsIpc(store)
        if (afterAnnounce.documents.length !== 0) {
          problems.push(`E2 CONTROL: after the announcement the doc-heads read answered ${shown(afterAnnounce.documents)} — the read still answers NOTHING at this point, so the row below is the frame's`)
        }
        // THE ENGINE'S STORE MOVED, and the fork never wrote it: the list read now names a document the store has never seen.
        readAnswer = { documents: [{ documentId: 'doc-e', title: 'Engine Doc' }], complete: true }
        double.frame('change', changeFrame({ kind: 'create_document', cursor: '2', nodeIds: [] }))
        await settled()
        await settled()
        const last = readings[readings.length - 1]
        if (last === undefined) {
          problems.push('E2: the sink never ran — no descriptor reached it at all')
        } else {
          const atInstant = docHeadRow(last.heads, 'doc-e')
          if (atInstant === undefined) {
            problems.push(`E2: AT THE BROADCAST INSTANT the sink's doc-heads read answered ${shown(last.heads.documents)} — the descriptor was announced BEFORE its projection landed (the defect this unit closes)`)
          } else if (atInstant.title !== 'Engine Doc') {
            problems.push(`E2: at the broadcast instant the row reads ${shown(atInstant)} — the ENGINE's title, projected from the list read`)
          }
        }
        const now = handleRagDocHeadsIpc(store)
        if (docHeadRow(now, 'doc-e') === undefined) {
          problems.push(`E2: AFTER the frame the doc-heads read answered ${shown(now.documents)} — the engine-originated document is not in the store the pane reads`)
        }
        const status = mirror.status()
        if (typeof status?.walks !== 'number' || status.walks < 2) {
          problems.push(`E2: \`status().walks\` read ${String(status?.walks)} — the announcement's re-read is ONE walk and the frame's demand is another, so at least 2 walked`)
        }
        feed.close()
      } catch (err) {
        problems.push(`E2: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    // THE SINK ORDER IS PART OF THE READING (§4: "serialized, so broadcast order stays frame order") — recorded on failure only.
    if (problems.length > 0) {
      problems.push(
        `E2 SINK ORDER: ${broadcasts.length} descriptor(s) reached the sink, nodeIds ${shown(broadcasts.map((d) => d.nodeIds))}, ` +
          `stores ${shown(broadcasts.map((d) => d.store))}, readings ${readings.length}`,
      )
    }
    expect(problems, `E2:\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4a §6 `G1`–`G2` — the two refusals: the engine\'s, and the walk\'s', () => {
  it('G1 — the engine REFUSED the write: `ConflictError`, NOTHING mirrored, the store and the doc-heads byte-identical', async () => {
    // MUTATION THAT WOULD RED IT: a seam that fires BEFORE `decodeCrudResponse` (a refused answer would then be mirrored), or one
    // that fires for a method the engine did not accept.
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
        problems.push(`G1: the CRUD proxy's construction threw (${err instanceof Error ? err.message : String(err)})`)
      }
      if (proxy !== null) {
        const before = { counts: storeCounts(store), heads: shown(handleRagDocHeadsIpc(store)) }
        try {
          await expect(
            proxy.updateDocument({
              caller: 'operator',
              documentId: 'd1',
              body: { baseRevision: 0, graph: { nodes: [], edges: [] }, title: 'x', tags: null },
            }),
          ).rejects.toBeInstanceOf(ConflictError)
        } catch (err) {
          problems.push(`G1: the refused call did not reject with a \`ConflictError\` (${err instanceof Error ? err.message.split('\n')[0] : String(err)}) — \`decodeCrudResponse\` throws BEFORE the seam`)
        }
        const status = mirror.status()
        if (status?.accepted !== 0) problems.push(`G1: \`status().accepted\` read ${String(status?.accepted)} — a REFUSED answer never reaches the seam`)
        if (status?.projected !== 0) problems.push(`G1: \`status().projected\` read ${String(status?.projected)} — a refused write mirrors NOTHING`)
        const after = { counts: storeCounts(store), heads: shown(handleRagDocHeadsIpc(store)) }
        if (shown(before.counts) !== shown(after.counts)) problems.push(`G1: the store counts moved from ${shown(before.counts)} to ${shown(after.counts)} on a REFUSED write — not one node, edge or journal entry`)
        if (before.heads !== after.heads) problems.push(`G1: the doc-heads answer moved from ${before.heads} to ${after.heads} on a REFUSED write`)
        if (calls.length !== 1) problems.push(`G1: the transport saw ${calls.length} CRUD call(s) — the refusal is answered on the one request`)
      }
    }
    expect(problems, `G1:\n${problems.join('\n')}`).toEqual([])
  })

  it('G1(b) — an answer about ANOTHER method never reaches the seam: the proxy relays it, the mirror is not offered it', async () => {
    // ADDED AT THE LANDING (documentation review, RCA-6): the shipped seam guards `crudResult.method === method`, and a guard with
    // no row is a claim, not a measurement — the L3 page carried it upward as an unrowed boundary and this row discharges that.
    // MUTATION THAT WOULD RED IT: a seam that fires on any decoded `{method, result}` (the engine may lawfully answer a different
    // method — `decodeCrudResponse` validates the ANSWER's own method, it does not require the request's), so a lying or confused
    // engine answer would be projected as if it were the write the caller asked for.
    const problems: string[] = []
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => emptyRead() }, problems)
    const calls: CrudCall[] = []
    // The request is an `updateDocument`; the double answers a `createDocument` payload for a DIFFERENT document.
    const transport = crudTransport((method, url) => {
      if (method === 'POST' && url.includes('/documents/d1/update')) {
        return jsonResponse(crudEnvelope(crudResultPayload('createDocument', documentWire({ document_id: 'd9', title: 'Somebody Else' }))))
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
        problems.push(`G1(b): the CRUD proxy's construction threw (${err instanceof Error ? err.message : String(err)})`)
      }
      if (proxy !== null) {
        const before = storeCounts(store)
        try {
          const answered = await proxy.updateDocument({
            caller: 'operator',
            documentId: 'd1',
            body: { baseRevision: 0, graph: { nodes: [], edges: [] }, title: 'Kept', tags: null },
          })
          if (shown(answered?.documentId) !== shown('d9')) {
            problems.push(`G1(b): \`updateDocument\` answered ${shown(answered)} — the proxy RELAYS the engine's answer (it does not invent a refusal), so this limb's subject is the decoded Document`)
          }
        } catch (err) {
          problems.push(`G1(b): the call rejected (${err instanceof Error ? err.message.split('\n')[0] : String(err)}) — a well-formed answer must relay, whatever its method`)
        }
        const status = mirror.status()
        if (status?.accepted !== 0) {
          problems.push(`G1(b): \`status().accepted\` read ${String(status?.accepted)} — the answer names \`createDocument\` while the caller asked for \`updateDocument\`, so it is not this write and the seam must not fire`)
        }
        if (status?.projected !== 0) problems.push(`G1(b): \`status().projected\` read ${String(status?.projected)} — nothing may be projected from an answer about another method`)
        if (shown(before) !== shown(storeCounts(store))) {
          problems.push(`G1(b): the store counts moved from ${shown(before)} to ${shown(storeCounts(store))} on an answer about another method`)
        }
        if (handleRagDocHeadsIpc(store).documents.length !== 0) {
          problems.push('G1(b): the doc-heads read answered a row — a mismatched answer must mirror nothing')
        }
        if (calls.length !== 1) problems.push(`G1(b): the transport saw ${calls.length} CRUD call(s) — one request, one answer`)
      }
    }
    expect(problems, `G1(b):\n${problems.join('\n')}`).toEqual([])
  })

  it('G2 — a failed or truncated walk changes NOTHING: no projection, and NO INVENTED DELETE', async () => {
    // MUTATION THAT WOULD RED IT: a walk that treats a partial list as authoritative (iii) would project 2 of 3; one that
    // deletes on absence from a truncated page (ii) would remove `doc-a`; one that re-throws (i) would reject the broadcast.
    // §5(ii) + `ASM-L2-M2`: a rejected read, `complete: false`, or an over-bound list writes NOTHING AT ALL, uniformly.
    const problems: string[] = []

    // (i) THE READ REJECTS — the walk's fault is counted, never re-thrown.
    {
      const { store } = newRagStore()
      const mod = await loadMirrorModule()
      problems.push(...mod.problems)
      const mirror = constructMirror(
        mod.createEngineMirror,
        {
          store: () => store,
          read: async (): Promise<MirrorReadAnswer> => {
            throw new Error('engine unreachable')
          },
        },
        problems,
      )
      if (mirror !== null) {
        const before = storeCounts(store)
        try {
          await mirror.settle(structuralDescriptor())
        } catch (err) {
          problems.push(`G2(i): \`settle\` REJECTED (${err instanceof Error ? err.message : String(err)}) — a walk fault never becomes a rejection of a broadcast`)
        }
        const status = mirror.status()
        if (status?.failed !== 1) problems.push(`G2(i): \`status().failed\` read ${String(status?.failed)} after a REJECTED read — the fault is COUNTED`)
        if (typeof status?.lastFailure !== 'string' || status.lastFailure === '') {
          problems.push(`G2(i): \`status().lastFailure\` read ${shown(status?.lastFailure)} — §2: a typed STRING naming the failure, never a thrown object`)
        }
        if (shown(before) !== shown(storeCounts(store))) problems.push(`G2(i): the store counts moved from ${shown(before)} to ${shown(storeCounts(store))} on a failed walk — NOTHING is written`)
      }
    }

    // (ii) A TRUNCATED LIST — and the projection that a delete-on-absence would have destroyed must SURVIVE.
    {
      let readAnswer: MirrorReadAnswer = emptyRead()
      const { store } = newRagStore()
      const mod = await loadMirrorModule()
      problems.push(...mod.problems)
      const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read: async () => readAnswer }, problems)
      if (mirror !== null) {
        try {
          await mirror.accepted(upsert('doc-a', 'Survivor'))
          if (handleRagDocHeadsIpc(store).documents.length !== 1) {
            problems.push('G2(ii) CONTROL: the projection did not land before the truncated walk — the survival clause has nothing to save')
          }
          const failedBefore = mirror.status()?.failed ?? -1
          readAnswer = { documents: [], complete: false }
          await mirror.settle(structuralDescriptor())
          const heads = handleRagDocHeadsIpc(store)
          if (heads.documents.length !== 1) {
            problems.push(`G2(ii): the doc-heads read answered ${shown(heads.documents)} after a TRUNCATED walk — an empty partial list must never license a delete (§5(ii), \`F-4\`)`)
          }
          const marked = markedRoots(store)
          if (shown(marked) !== shown(['doc-a'])) problems.push(`G2(ii): the MARKED roots read ${shown(marked)} — 'doc-a' survives a truncated walk`)
          const status = mirror.status()
          if (status?.failed !== failedBefore + 1) problems.push(`G2(ii): \`status().failed\` read ${String(status?.failed)} (was ${String(failedBefore)}) — a truncated list is a TYPED failure, not a silent success`)
        } catch (err) {
          problems.push(`G2(ii): driving threw (${err instanceof Error ? err.message : String(err)})`)
        }
      }
    }

    // (iii) MORE IDS THAN `maxPerWalk` — the same uniform rule: no projection at all, not even the ones it saw.
    {
      const read = async (): Promise<MirrorReadAnswer> => ({
        documents: [
          { documentId: 'doc-a', title: 'A' },
          { documentId: 'doc-b', title: 'B' },
          { documentId: 'doc-c', title: 'C' },
        ],
        complete: true,
      })
      const { store } = newRagStore()
      const mod = await loadMirrorModule()
      problems.push(...mod.problems)
      const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read, maxPerWalk: 2 }, problems)
      if (mirror !== null) {
        const before = storeCounts(store)
        try {
          await mirror.settle(structuralDescriptor())
          const status = mirror.status()
          if (status?.projected !== 0) problems.push(`G2(iii): \`status().projected\` read ${String(status?.projected)} with 3 ids read under \`maxPerWalk: 2\` — an over-bound walk writes NOTHING AT ALL`)
          const marked = markedRoots(store)
          if (marked.length !== 0) problems.push(`G2(iii): the MARKED roots read ${shown(marked)} — not even the ids it saw are projected`)
          if (handleRagDocHeadsIpc(store).documents.length !== 0) problems.push('G2(iii): the doc-heads read answered a row after an over-bound walk')
          if (typeof status?.failed !== 'number' || status.failed < 1) problems.push(`G2(iii): \`status().failed\` read ${String(status?.failed)} — the bound is a TYPED failure`)
          if (shown(before) !== shown(storeCounts(store))) problems.push(`G2(iii): the store counts moved from ${shown(before)} to ${shown(storeCounts(store))}`)
        } catch (err) {
          problems.push(`G2(iii): driving threw (${err instanceof Error ? err.message : String(err)})`)
        }
      }
    }

    expect(problems, `G2:\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4a §6 `G3`–`G4` — the coalescing walk, and the descriptors that walk NOTHING', () => {
  it('G3 — three structural descriptors during ONE slow walk run the walk TWICE (in flight + ONE trailing) and complete the projection', async () => {
    // MUTATION THAT WOULD RED IT: a timer/debounce (there is none — `ASM-B4A-4`), or a walk per descriptor (three), or a
    // coalescing that DROPS the trailing demand (one walk, and the callers resolve before a walk covers them).
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
      return { documents: [{ documentId: 'doc-a', title: 'Coalesced' }], complete: true }
    }
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read }, problems)
    if (mirror !== null) {
      try {
        const first = mirror.settle(structuralDescriptor({ nodeIds: ['n1'] }))
        // Let the drain reach the walk and SUSPEND it on the gate, so the next two descriptors really arrive MID-WALK.
        await settled()
        const second = mirror.settle(structuralDescriptor({ nodeIds: ['n2'] }))
        const third = mirror.settle(structuralDescriptor({ nodeIds: ['n3'] }))
        release()
        await Promise.all([first, second, third])
        // THE READER'S TICK (`settled()`, test-only): every `settle` promise has resolved, so this only guarantees the trailing
        // walk's own microtasks have drained before the state is read — it adds no leniency to any clause below.
        await settled()
        const status = mirror.status()
        if (status?.walks !== 2) {
          problems.push(`G3: \`status().walks\` read ${String(status?.walks)} (read() was called ${readCalls} time(s)) — three structural descriptors during ONE slow walk are exactly TWO walks: the one in flight and ONE trailing demand`)
        }
        if (status?.projected !== 1) {
          problems.push(`G3: \`status().projected\` read ${String(status?.projected)} — the trailing walk re-reads the SAME document, so the equal projection is \`unchanged\` and exactly ONE batch landed`)
        }
        const heads = handleRagDocHeadsIpc(store)
        if (heads.documents.length !== 1) problems.push(`G3: the doc-heads read answered ${shown(heads.documents)} — the projection is COMPLETE: one document, one row`)
        else if (heads.documents[0]?.title !== 'Coalesced') problems.push(`G3: the doc-heads row reads ${shown(heads.documents[0])} — the title the read answered`)
      } catch (err) {
        problems.push(`G3: driving threw (${err instanceof Error ? err.message : String(err)}) — a coalesced \`settle\` still resolves`)
      }
    }
    expect(problems, `G3:\n${problems.join('\n')}`).toEqual([])
  })

  it('G4 — a `content` descriptor, a foreign origin and a shape-less descriptor walk NOTHING (`walks 0`, `unresolved 3`)', async () => {
    // MUTATION THAT WOULD RED IT: a settle that walks on ANY descriptor (a `content` change is not this module's subject, and a
    // foreign store's descriptor is a LOCAL store's — walking on either would read the engine for a store that never asked).
    const problems: string[] = []
    let readCalls = 0
    const read = async (): Promise<MirrorReadAnswer> => {
      readCalls += 1
      return emptyRead()
    }
    const { store } = newRagStore()
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)
    const mirror = constructMirror(mod.createEngineMirror, { store: () => store, read }, problems)
    if (mirror !== null) {
      const before = storeCounts(store)
      try {
        await mirror.settle({ kind: 'content', nodeIds: ['n1'], edgeIds: [], store: 'gnosis:engine' })
        await mirror.settle({ kind: 'structural', nodeIds: ['x'], edgeIds: [], store: 'default' })
        await mirror.settle({} as unknown as RagStoreChangedPayload)
      } catch (err) {
        problems.push(`G4: a no-op descriptor REJECTED (${err instanceof Error ? err.message : String(err)}) — §3: \`settle\` never rejects`)
      }
      const status = mirror.status()
      if (status?.walks !== 0) problems.push(`G4: \`status().walks\` read ${String(status?.walks)} (read() ran ${readCalls} time(s)) — NONE of the three descriptors demands a walk`)
      if (status?.unresolved !== 3) problems.push(`G4: \`status().unresolved\` read ${String(status?.unresolved)} — every descriptor that resolves to no walk is counted, all three of them`)
      if (shown(before) !== shown(storeCounts(store))) problems.push(`G4: the store counts moved from ${shown(before)} to ${shown(storeCounts(store))} on three no-walk descriptors`)
    }
    expect(problems, `G4:\n${problems.join('\n')}`).toEqual([])
  })
})
