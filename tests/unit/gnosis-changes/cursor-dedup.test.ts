// tests/unit/gnosis-changes/cursor-dedup.test.ts — unit `B-4` `engine-changes`'s PURE rows for CURSOR DE-DUP (`c4`), driven
// through the exported factory with the injected `SseClient` double. Authored BEFORE any byte of `src/main/engine-changes.ts`
// exists (RCA-1: the red set runs first and is REPORTED before implementation).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4-engine-changes.md` §2.3 —
//   "The consumer holds `lastCursor`. A `change` frame whose cursor is AT OR BELOW `lastCursor` is DROPPED and counted — not
//    re-applied, not re-emitted, not an error (a reconnect replays the window). **The comparison is NUMERIC over the decimal
//    token, never lexicographic** (`'10'` is above `'9'`; a string compare would drop every cursor after the first
//    `single-digit < multi-digit` boundary — a row drives exactly that pair). A cursor that is NOT the canonical decimal is a
//    frame refusal, not a silent coercion; a cursor that moves BACKWARDS below `lastCursor` is a drop, and `lastCursor` never
//    moves backwards."
//   and §5's `c4`: "Two frames with the SAME cursor deliver ONCE and the second is counted as dropped; a frame BELOW
//    `lastCursor` after a reconnect is dropped; and the pair `'9'` → `'10'` DELIVERS TWICE — the row that fails a
//    lexicographic compare. Control: the same harness with `'9'` then `'9'` again reads one delivery."
//
// EVERY LIMB IS DRIVEN THROUGH A CONNECTION THAT ANNOUNCED (`ASM-B4-5`, the landing's `F-5` ruling): a `change` frame on a
// connection with no announcement is HELD, never judged — so each row drives the `cursor` announcement first, awaits the
// re-read's answer (`settled()`), and only then drives the frames it is measuring. The READINGS are unchanged; the DRIVE is not.
//
// ONE LIMB BEYOND THE CONTRACT'S WORDING, AND IT ASSERTS NOTHING NEW: `c4(d)` drives the pair
// `'9007199254740992'` → `'9007199254740993'`. A `Number(...)` comparison loses both to the same double and would DROP the
// second frame; §2.3's "NUMERIC, never lexicographic" is not satisfied by a comparison that is neither, so the limb is the
// same rule at a wider magnitude (`u64` is the engine's cursor type, `../Gnosis/src/store/mod.rs:1084`).
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS and PURE — no Electron, no DOM, no fs, no socket; the stream is `SseFrameDouble`.
//
// NON-VACUITY: every "delivers once" limb sits beside a "delivers twice" limb on the SAME harness, and `c4(e)` is the plain
// control; `census()` is read for every limb, so a feed that answered no census has a named problem rather than a zero.
import { describe, it, expect } from 'vitest'

import {
  announceAt,
  SseFrameDouble,
  changeFrame,
  loadChangesModule,
  reconciledPayload,
  recordingSink,
  settled,
  BASE_URL,
} from '../../integration/gnosis-changes/harness.js'

/** The feed handle's surface (§2 of the L2 page) — typed here so a name the module never shipped reads as a named problem. */
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
}

/**
 * Build one feed over the double, drive `body`, and collect readings. A throw anywhere (a missing member, a rejected
 * `connect()`) is a NAMED problem in the row's aggregate — never a raw `TypeError`, never a skip.
 */
async function drive(
  label: string,
  body: (rig: Rig) => void | Promise<void>,
): Promise<string[]> {
  const mod = await loadChangesModule()
  const problems = [...mod.problems]
  if (mod.createEngineChangesFeed === null) return problems
  const double = new SseFrameDouble()
  const sink = recordingSink()
  let feed: Feed
  try {
    feed = mod.createEngineChangesFeed({
      baseUrl: BASE_URL,
      sse: double,
      reconcile: async () => reconciledPayload(),
      onChange: sink.sink,
    }) as Feed
  } catch (err) {
    problems.push(`${label}: \`createEngineChangesFeed\` threw at construction (${err instanceof Error ? err.message : String(err)}) — §2: construction is INERT and total on a well-formed opts`)
    return problems
  }
  try {
    await body({ feed, double, sink })
  } catch (err) {
    problems.push(`${label}: driving the feed threw (${err instanceof Error ? err.message : String(err)}) — §2.5: ` + '`connect()` never rejects and a frame never tears the stream')
  }
  return problems
}

/** An increase of one cursor token, delivered as a REAL `change` frame carrying one node id. */
function frameAt(double: SseFrameDouble, cursor: string, nodeId = 'n1'): void {
  double.frame('change', changeFrame({ cursor, nodeIds: [nodeId] }))
}

describe('B-4 §5 `c4` — de-dup by cursor, and the comparison is NUMERIC', () => {
  it('c4(a) — the SAME cursor twice delivers ONCE and the second is counted as DROPPED', async () => {
    // MUTATION THAT WOULD RED IT: a consumer that emits before it compares, or one that never counts the drop.
    const problems = await drive('c4(a)', async ({ feed, double, sink }) => {
      await feed.connect()
      announceAt(double, '6')
      await settled()
      frameAt(double, '7', 'n1')
      frameAt(double, '7', 'n2')
      const delivered = [...sink.named('n1'), ...sink.named('n2')]
      if (delivered.length !== 1) {
        problems.push(`c4(a): two frames sharing cursor '7' delivered ${delivered.length} descriptor(s) — §2.3 delivers once`)
      }
      const census = feed.census()
      if (census?.dropped !== 1) problems.push(`c4(a): \`census().dropped\` read ${census?.dropped} — §2.3 counts the drop`)
      if (census?.applied !== 1) problems.push(`c4(a): \`census().applied\` read ${census?.applied} — exactly one frame was applied`)
    })
    expect(problems, `c4(a):\n${problems.join('\n')}`).toEqual([])
  })

  it('c4(b) — `\'9\'` then `\'10\'` DELIVERS TWICE (the row a lexicographic compare fails), and the position reads 10', async () => {
    // MUTATION THAT WOULD RED IT: `String(a) <= String(b)` — `'10' <= '9'` is true, so the second frame would be dropped.
    const mod = await loadChangesModule()
    const problems = [...mod.problems]
    if (mod.createEngineChangesFeed !== null) {
      const double = new SseFrameDouble()
      const sink = recordingSink()
      const feed = mod.createEngineChangesFeed({
        baseUrl: BASE_URL,
        sse: double,
        reconcile: async () => reconciledPayload(),
        onChange: sink.sink,
      }) as Feed
      try {
        await feed.connect()
        announceAt(double, '8')
        await settled()
        frameAt(double, '9', 'n1')
        frameAt(double, '10', 'n2')
      } catch (err) {
        problems.push(`c4(b): driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
      const delivered = [...sink.named('n1'), ...sink.named('n2')]
      if (delivered.length !== 2) {
        problems.push(
          `c4(b): '9' then '10' delivered ${delivered.length} descriptor(s) — §2.3's comparison is NUMERIC; a lexicographic ` +
            "compare drops every cursor past the first single-digit/multi-digit boundary",
        )
      }
      const status = feed.status()
      if (status?.position !== 10) problems.push(`c4(b): \`status().position\` read ${String(status?.position)} — the accepted position is 10, numerically`)
      if (status?.cursor !== '10') problems.push(`c4(b): \`status().cursor\` read ${String(status?.cursor)} — the token reads '10'`)
      if (feed.census()?.dropped !== 0) problems.push(`c4(b): \`dropped\` read ${feed.census()?.dropped} — nothing was a replay`)
    }
    expect(problems, `c4(b):\n${problems.join('\n')}`).toEqual([])
  })

  it('c4(c) — a cursor BELOW `lastCursor` is DROPPED and the position never moves backwards', async () => {
    // MUTATION THAT WOULD RED IT: `lastCursor = cursor` unconditionally (the position would regress) or a compare that only
    // refuses EQUALITY (a backwards frame would be re-emitted).
    const mod = await loadChangesModule()
    const problems = [...mod.problems]
    if (mod.createEngineChangesFeed !== null) {
      const double = new SseFrameDouble()
      const sink = recordingSink()
      const feed = mod.createEngineChangesFeed({
        baseUrl: BASE_URL,
        sse: double,
        reconcile: async () => reconciledPayload(),
        onChange: sink.sink,
      }) as Feed
      try {
        await feed.connect()
        announceAt(double, '9')
        await settled()
        frameAt(double, '10', 'n1')
        frameAt(double, '9', 'n2')
      } catch (err) {
        problems.push(`c4(c): driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
      if (sink.named('n2').length !== 0) problems.push('c4(c): a frame at cursor 9 AFTER 10 was emitted — §2.3 drops anything at or below the position')
      if (sink.named('n1').length !== 1) problems.push('c4(c): the frame at cursor 10 was not emitted exactly once')
      if (feed.census()?.dropped !== 1) problems.push(`c4(c): \`dropped\` read ${feed.census()?.dropped} — the backwards frame is counted`)
      const status = feed.status()
      if (status?.position !== 10) problems.push(`c4(c): \`status().position\` read ${String(status?.position)} after a backwards frame — §2.3: \`lastCursor\` never moves backwards`)
    }
    expect(problems, `c4(c):\n${problems.join('\n')}`).toEqual([])
  })

  it('c4(d) — a pair of cursors ABOVE 2^53 still compares NUMERICALLY (the precision limb of §2.3\'s rule)', async () => {
    // MUTATION THAT WOULD RED IT: `Number(body.cursor) <= lastCursor` — both tokens round to the same double, so the second
    // (strictly greater) frame would be dropped. The engine's cursor is a `u64` (../Gnosis/src/store/mod.rs:1084).
    const mod = await loadChangesModule()
    const problems = [...mod.problems]
    if (mod.createEngineChangesFeed !== null) {
      const double = new SseFrameDouble()
      const sink = recordingSink()
      const feed = mod.createEngineChangesFeed({
        baseUrl: BASE_URL,
        sse: double,
        reconcile: async () => reconciledPayload(),
        onChange: sink.sink,
      }) as Feed
      try {
        await feed.connect()
        announceAt(double, '9007199254740991')
        await settled()
        frameAt(double, '9007199254740992', 'n1')
        frameAt(double, '9007199254740993', 'n2')
      } catch (err) {
        problems.push(`c4(d): driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
      if (sink.named('n2').length !== 1) {
        problems.push(
          'c4(d): the second frame of a >2^53 pair was not emitted — a `Number(...)` compare collapses 9007199254740992 and ' +
            '9007199254740993 to one double, so the comparison is not numeric (§2.3)',
        )
      }
      if (feed.census()?.dropped !== 0) problems.push(`c4(d): \`dropped\` read ${feed.census()?.dropped} — neither frame is a replay`)
    }
    expect(problems, `c4(d):\n${problems.join('\n')}`).toEqual([])
  })

  it('c4(e) CONTROL — two DIFFERENT increasing cursors deliver TWICE on the same harness', async () => {
    // The floor under every "once" limb above: this harness CAN count two deliveries.
    const problems = await drive('c4(e)', async ({ feed, double, sink }) => {
      await feed.connect()
      announceAt(double, '0')
      await settled()
      frameAt(double, '1', 'n1')
      frameAt(double, '2', 'n2')
      const delivered = [...sink.named('n1'), ...sink.named('n2')]
      if (delivered.length !== 2) problems.push(`c4(e) CONTROL: two increasing cursors delivered ${delivered.length} descriptor(s) — the harness must be able to count two`)
    })
    expect(problems, `c4(e) CONTROL:\n${problems.join('\n')}`).toEqual([])
  })
})
