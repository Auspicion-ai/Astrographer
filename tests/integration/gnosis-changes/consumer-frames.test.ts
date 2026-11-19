// tests/integration/gnosis-changes/consumer-frames.test.ts — unit `B-4` `engine-changes`'s CONSUMER rows driven over REAL frames
// through the injected `SseClient` double: `c1` (the cursor frame is a POSITION), `c2`'s stream limb, and `c3(b)`'s
// unknown-kind limb. Authored BEFORE any byte of `src/main/engine-changes.ts` exists (RCA-1).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4-engine-changes.md` §5, as amended by measurement (`ASM-B4-5`) —
//   `c1`  "`event: cursor` + `{"type":"cursor","cursor":"7"}` from a real `SseClient` double → ZERO descriptors emitted, the
//         head/watermark reads `7`, `census().frames.cursor === 1`; a FIRST `change` frame at `8` AFTER it is applied once (the
//         control that the position frame did not swallow the stream); and the announcement is what STARTS the re-read — a
//         connection with NO announcement applies NOTHING (a `change` frame on such a connection is not applied, `status()`
//         names the absence)."
//   `c2`  the four-key descriptor (the authoritative PURE limb is `tests/unit/gnosis-changes/change-frame-map.test.ts`; this
//         limb reads the same four keys THROUGH the stream, so the mapping is proven to be the one the consumer uses).
//   `c3(b)` "a 21st, unknown token (`'reindex_everything'`) maps to `structural`, EMITS (never drops), and MOVES the
//         unknown-kind counter. Control: the same harness over a known token reads `0` unknown."
//
// THE ANCHOR SHOWS IN EVERY ROW OF THIS FILE: the announcement is driven FIRST and `settled()` is awaited before any reading,
// because under `ASM-B4-5` a connection applies nothing until its own announcement's re-read answer has reached the sink.
//
// THE FRAMES ARE REAL: `SseFrameDouble.frame()` builds `event: …\ndata: …\n\n` and parses it with the shipped `parseSseFrame`
// before handing `(event, data)` to the consumer — the same pair the shipped `createSseClient` produces
// (`src/main/engine-rag-store.ts:804-809`). The double is INJECTED (`EngineRagStoreOptions.sse`, `:285`); no socket is opened.
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS. These rows read the consumer's own sink and census. They can NEVER say a frame was
// sent by an engine, that the engine's route answered, or anything about the assembled app — the live arm is PARKED
// (`docs/L2/gnosis-changes/engine-changes.md` §6) and no row here claims an engine event.
//
// NON-VACUITY: `c1`'s zero is floored by its own control frame at `8`; `c1(b)`'s zero is floored by the SAME held frame being
// applied once the announcement arrives; `c3(b)`'s `unknownKind === 1` is floored by the twenty-token control reading `0`.
import { describe, it, expect } from 'vitest'

import {
  announceAt,
  BASE_URL,
  changeFrame,
  cursorFrame,
  EDGE_ID,
  loadChangesModule,
  reconciledPayload,
  recordingSink,
  settled,
  SseFrameDouble,
} from './harness.js'

interface Feed {
  connect(): Promise<void>
  close(): void
  status(): { connected: boolean; announced: boolean; cursor: string | null; position: number | null; failure: unknown }
  census(): {
    frames: { seen: number; cursor: number; change: number; refused: number }
    applied: number
    dropped: number
    unknownKind: number
    connects: number
  }
}

interface Rig {
  feed: Feed
  double: SseFrameDouble
  sink: ReturnType<typeof recordingSink>
  problems: string[]
}

/** Build one feed over a fresh double; a construction throw is a NAMED problem, never a raw failure. */
async function rig(): Promise<Rig> {
  const mod = await loadChangesModule()
  const problems = [...mod.problems]
  const double = new SseFrameDouble()
  const sink = recordingSink()
  if (mod.createEngineChangesFeed === null) {
    return { feed: null as unknown as Feed, double, sink, problems }
  }
  try {
    const feed = mod.createEngineChangesFeed({
      baseUrl: BASE_URL,
      sse: double,
      reconcile: async () => reconciledPayload(),
      onChange: sink.sink,
    }) as Feed
    return { feed, double, sink, problems }
  } catch (err) {
    problems.push(`construction threw (${err instanceof Error ? err.message : String(err)}) — §2: construction is INERT and total`)
    return { feed: null as unknown as Feed, double, sink, problems }
  }
}

const CONTENT_TOKENS = ['update_document', 'update_fact', 'update_community_summary', 're_sync_embed'] as const
const STRUCTURAL_TOKENS = [
  'create_document',
  'delete_document',
  'publish_document',
  'unpublish_document',
  'archive_document',
  'create_wiki',
  'add_triple',
  'declare_community',
  'set_reference_state',
  'resolve_entities',
  'merge_facts',
  'create_fact',
  'propose_candidate_fact',
  're_derive_community',
  'propagate_fact_staleness',
  'propagate_archived_target',
] as const

describe('B-4 §5 `c1` — the CURSOR frame is a POSITION, not a change, and it is what STARTS the re-read', () => {
  it('c1(a) — a `cursor` frame emits NOTHING, records the head 7, counts one cursor frame, and starts the re-read; a `change` at 8 is then applied once', async () => {
    // MUTATION THAT WOULD RED IT: a consumer that treats every frame as a change (`onChange` fired for the position
    // announcement), one that ignores the announcement (no head, nothing judged), or one that tears the stream after it.
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        double.frame('cursor', cursorFrame('7'))
        const afterCursor = feed.census()
        if (afterCursor?.frames?.cursor !== 1) {
          problems.push(`c1(a): \`census().frames.cursor\` read ${String(afterCursor?.frames?.cursor)} — §2.1 counts the position announcement`)
        }
        if (afterCursor?.frames?.change !== 0) {
          problems.push(`c1(a): \`census().frames.change\` read ${String(afterCursor?.frames?.change)} — a cursor frame is NOT a change`)
        }
        const status = feed.status()
        if (status?.announced !== true) problems.push('c1(a): `status().announced` read false after the announcement — §2.1 records the head from it')
        if (status?.position !== 7) problems.push(`c1(a): \`status().position\` read ${String(status?.position)} — the announcement sets the position to 7`)
        if (status?.cursor !== '7') problems.push(`c1(a): \`status().cursor\` read ${String(status?.cursor)} — the position's token reads '7'`)
        if (sink.calls.length !== 0) {
          problems.push(`c1(a): the announcement emitted ${sink.calls.length} descriptor(s) — §2.1: it is a POSITION and emits NOTHING`)
        }
        // THE CONTROL: the position frame did not swallow the stream — a frame ABOVE the head is applied exactly once.
        double.frame('change', changeFrame({ cursor: '8', nodeIds: ['n1'] }))
        await settled()
        if (sink.named('n1').length !== 1) {
          problems.push(`c1(a) CONTROL: the first change frame at cursor 8 was emitted ${sink.named('n1').length} time(s) — exactly one is required`)
        }
        if (feed.census()?.applied !== 1) problems.push(`c1(a) CONTROL: \`census().applied\` read ${String(feed.census()?.applied)} — exactly one frame was applied`)
      } catch (err) {
        problems.push(`c1(a): driving threw (${err instanceof Error ? err.message : String(err)}) — §2.5: \`connect()\` never rejects`)
      }
    }
    expect(problems, `c1(a):\n${problems.join('\n')}`).toEqual([])
  })

  it('c1(b) — a connection with NO announcement applies NOTHING, and `status()` NAMES the absence', async () => {
    // THE ROW THAT KEEPS §2.4's ANCHOR HONEST (`ASM-B4-5`). The engine frames the announcement FIRST, every connection
    // (`gnosis_server.rs:983-986`), and nothing can be framed without it — so a connection that never announces is a
    // connection whose frames have no head to be judged against, and `census().applied` stays 0 with no timer and no timeout.
    // MUTATION THAT WOULD RED IT: a consumer that starts the re-read from `connect()` and applies frames as they arrive
    // (`applied` would read 1 here, and `announced` would be a decoration rather than the gate).
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        double.frame('change', changeFrame({ cursor: '3', nodeIds: ['not-yet-judged'] }))
        await settled()
        const census = feed.census()
        if (census?.applied !== 0) {
          problems.push(`c1(b): \`applied\` read ${String(census?.applied)} on a connection that never announced — nothing can be framed without the announcement`)
        }
        if (sink.named('not-yet-judged').length !== 0) problems.push('c1(b): a `change` frame reached the sink on a connection with no announcement')
        if (census?.frames?.change !== 1) problems.push(`c1(b): \`frames.change\` read ${String(census?.frames?.change)} — the frame is SEEN and typed, it is just not applicable`)
        const status = feed.status()
        if (status?.announced !== false) problems.push(`c1(b): \`status().announced\` read ${String(status?.announced)} — the no-announcement state must be NAMED, not inferred`)
        if (status?.connected !== true) problems.push('c1(b): `status().connected` read false — the socket stands; it is the ANNOUNCEMENT that is absent')
        if (status?.cursor !== null || status?.position !== null) {
          problems.push(`c1(b): the position read ${String(status?.cursor)}/${String(status?.position)} with no announcement — there is no head to record`)
        }
        if (status?.failure !== null && status?.failure !== undefined) {
          problems.push('c1(b): an absent announcement settled a typed FAILURE — §2.4 names the absence, it does not time out')
        }
        // THE CONTROL, and it is the SAME held frame: the announcement arrives, the re-read answers, and the frame it was
        // holding is judged against the head it now has (3 is above 2, so it applies exactly once).
        double.frame('cursor', cursorFrame('2'))
        await settled()
        if (sink.named('not-yet-judged').length !== 1) {
          problems.push(`c1(b) CONTROL: after the announcement the held frame was emitted ${sink.named('not-yet-judged').length} time(s) — exactly one is required`)
        }
        if (feed.status()?.announced !== true) problems.push('c1(b) CONTROL: `status().announced` still reads false after a well-formed announcement')
      } catch (err) {
        problems.push(`c1(b): driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `c1(b):\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4 §5 `c2` — the descriptor the CONSUMER emits is the fork\'s four-key shape', () => {
  it('c2(stream) — a full `change` frame reaches the sink as exactly `{kind, nodeIds, edgeIds, store}`', async () => {
    // MUTATION THAT WOULD RED IT: a consumer that forwards the frame body, or that names a `store` other than the pinned
    // engine-origin label (`ASM-B4-1`).
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        // THE ANCHOR: the announcement is driven first (the engine always frames it first, `:983-986`), so the frame at 9 is
        // above the head 8 and is applied rather than held.
        announceAt(double, '8')
        await settled()
        double.frame(
          'change',
          changeFrame({ cursor: '9', wikiId: 'w1', kind: 'create_document', nodeIds: ['n1'], edgeIds: [EDGE_ID] }),
        )
      } catch (err) {
        problems.push(`c2(stream): driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
      const delivered = sink.named('n1')
      if (delivered.length !== 1) {
        problems.push(`c2(stream): the frame reached the sink ${delivered.length} time(s) — exactly one descriptor is required`)
      } else {
        const descriptor = delivered[0]!
        const keys = Object.keys(descriptor)
        if (JSON.stringify(keys) !== JSON.stringify(['kind', 'nodeIds', 'edgeIds', 'store'])) {
          problems.push(`c2(stream): the sink received the keys ${JSON.stringify(keys)} — §2.2 requires EXACTLY the four`)
        }
        if (descriptor.kind !== 'structural') problems.push(`c2(stream): \`kind\` read ${String(descriptor.kind)} for \`create_document\``)
        if (descriptor.edgeIds[0] !== EDGE_ID) problems.push(`c2(stream): the six-term edge identity read ${String(descriptor.edgeIds[0])}`)
        if (descriptor.store !== 'gnosis:engine') problems.push(`c2(stream): \`store\` read ${String(descriptor.store)} — ASM-B4-1 pins 'gnosis:engine'`)
      }
    }
    expect(problems, `c2(stream):\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4 §5 `c3` (b) — an UNKNOWN kind is `structural`, EMITTED, and COUNTED', () => {
  it('c3(b) — the twenty known tokens read 0 unknown (control), and a 21st token emits and moves the counter', async () => {
    // MUTATION THAT WOULD RED IT: a consumer that drops an unknown-kind frame (a lost real change), throws on it (a torn
    // subscription on a vocabulary the engine may extend), or counts every frame as unknown.
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      const tokens: Array<{ token: string; expected: 'content' | 'structural' }> = [
        ...CONTENT_TOKENS.map((token) => ({ token, expected: 'content' as const })),
        ...STRUCTURAL_TOKENS.map((token) => ({ token, expected: 'structural' as const })),
      ]
      try {
        await feed.connect()
        // THE ANCHOR: announcement first (head 99), so the twenty-one frames below are ABOVE the head and are judged on
        // arrival rather than held (`ASM-B4-5`).
        announceAt(double, '99')
        await settled()
        let cursor = 100
        for (const { token } of tokens) {
          double.frame('change', changeFrame({ cursor: String(cursor++), kind: token, nodeIds: [`node-of-${token}`] }))
        }
        // CONTROL: the twenty-token sweep reads zero unknown kinds.
        if (feed.census()?.unknownKind !== 0) {
          problems.push(
            `c3(b) CONTROL: \`unknownKind\` read ${String(feed.census()?.unknownKind)} after the twenty KNOWN tokens — the counter ` +
              'must not fire on the closed set',
          )
        }
        for (const { token, expected } of tokens) {
          const delivered = sink.named(`node-of-${token}`)
          if (delivered.length !== 1) {
            problems.push(`c3(b): the token \`${token}\` delivered ${delivered.length} descriptor(s) — every known token emits exactly once`)
          } else if (delivered[0]!.kind !== expected) {
            problems.push(`c3(b): \`${token}\` reached the sink as \`${String(delivered[0]!.kind)}\` — §2.2 says \`${expected}\``)
          }
        }
        // THE 21st TOKEN.
        double.frame('change', changeFrame({ cursor: String(cursor++), kind: 'reindex_everything', nodeIds: ['node-of-unknown'] }))
        const unknown = sink.named('node-of-unknown')
        if (unknown.length !== 1) {
          problems.push('c3(b): the unknown token `reindex_everything` was NOT emitted — u4 :521-524 requires the consumer to tolerate it, never to drop the frame')
        } else if (unknown[0]!.kind !== 'structural') {
          problems.push(`c3(b): the unknown token read \`${String(unknown[0]!.kind)}\` — ASM-B4-2 maps every unknown token to \`structural\``)
        }
        if (feed.census()?.unknownKind !== 1) {
          problems.push(`c3(b): \`unknownKind\` read ${String(feed.census()?.unknownKind)} after one unknown token — §2.2 counts it`)
        }
      } catch (err) {
        problems.push(`c3(b): driving threw (${err instanceof Error ? err.message : String(err)}) — an unknown token must never tear the stream`)
      }
    }
    expect(problems, `c3(b):\n${problems.join('\n')}`).toEqual([])
  })
})
