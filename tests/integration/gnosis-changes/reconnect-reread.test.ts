// tests/integration/gnosis-changes/reconnect-reread.test.ts — unit `B-4` `engine-changes`'s RECONNECT-BY-RE-READ row (`c5`,
// `ASM-B-4`), RE-GRAINED to the L1 adjudication of this landing's `F-5`: **the re-read is anchored to the CONNECTION'S
// ANNOUNCEMENT, never to `connect()`** (`ASM-B4-5`; contract §2.1/§2.4/§5 `c5`).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4-engine-changes.md` §2.4 and §5 `c5`, both as amended —
//   §2.4  "the engine reads the head (`:977`) and frames the announcement WITH the retained window in one body
//          (`:983-996`), so a re-read that ran BEFORE the subscription is blind to exactly the commits that landed between
//          its read and that head read … **The order is therefore, per connect:** `subscribe` → the announcement records the
//          head and starts `reconcile()` → **no `change` frame is applied until the reconcile's answer has been delivered to
//          the sink** → then §2.3 judges frames against that head: at or below ⇒ dropped *because the re-read covers it*;
//          above ⇒ applied, exactly once."
//   `c5`  "`reconcile` is called exactly ONCE per connect (`2` after two connects) and it starts only after that connection's
//          announcement … its answer reaches the sink before any `change` frame of that connection is applied (order asserted,
//          not just count); a replayed frame at/below the announced head is dropped and counted (nothing applied twice)
//          because the re-read covers it; and a frame above the head is applied once. Two negative limbs: a design that skips
//          `reconcile()` on the second connect reads `1` and MUST fail, and a design that re-reads BEFORE subscribing leaves
//          the landing's measured gap and MUST fail a row that drives exactly that interleaving."
//
// THE THREE LIMBS, AND WHAT EACH PROVES:
//   `c5(a)` the ORDER, on the real module: subscribe → (announcement) → reconcile → answer → judged frames, with the
//           sink's SEQUENCE as the evidence and the per-connect count read after two connects;
//   `c5(b)` and `c5(c)` are DESIGN-MODEL ROWS, NOT IMPLEMENTATION EVIDENCE — a disclosure, because a green that cannot red is not a
//           green: `c5(b)` runs a hand-written counter and `c5(c)` a hand-written engine model, and NEITHER LOADS `src/`. They are
//           kept because they carry the argument (the mutants `c5(a)`/`c5(d)` would otherwise have no falsifiability floor), and
//           both titles now say what they are. The contract discloses `c11`'s red-run green the same way (`c11` is a
//           zero-occurrence clause), so this is the same disclosure for the same reason;
//   `c5(b)` MUTANT — a design that skips the second connect's re-read reads `1`, so `c5(a)`'s `2` has teeth;
//   `c5(c)` MUTANT — the PRE-SUBSCRIBE design (the landed `F-5` shape) modelled beside the anchored design through ONE
//           interleaving: a commit lands after the re-read's read and before the engine's head read. The anchored shape covers
//           it (the re-read started after the head read; the tail frames it live); the pre-subscribe shape leaves it in the
//           gap — `≤ head` (so §2.3 drops the window frame) and absent from the answer. The coverage assertion `c5(a)`/`c5(d)`
//           passes is exactly the assertion that mutant fails;
//   `c5(d)` the SAME interleaving against the REAL module: the double frames the announcement and the retained window in ONE
//           body (`gnosis_server.rs:983-996`), a commit lands during the re-read, and the live tail then frames it — every
//           commit surfaces, the window is dropped BECAUSE the answer covers it, and the above-head frame applies once.
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS — the consumer over the injected double, plus two hand-written DESIGN MODELS inside
// `c5(c)` that assert nothing about our code (they are the falsifiability floor, not a reading of it). No socket, no engine, no
// app. The engine's refusal of the fork's own client (`docs/defects.md:35`) is why a live reading is PARKED and is not a claim.
import { describe, it, expect } from 'vitest'

import { parseSseFrame } from '../../../src/main/engine-rag-store.js'
import type { SseClient } from '../../../src/main/engine-rag-store.js'
import { announceAt, BASE_URL, changeFrame, loadChangesModule, recordingSink, settled, SseFrameDouble } from './harness.js'
import type { RagStoreChangedPayload } from '../../../src/shared/types.js'

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

/**
 * THE ENGINE, AS A MODEL — and only as much of it as the two rulings rest on (`READ` `../Gnosis/src/bin/gnosis_server.rs`):
 * `headRead()` is `store.change_cursor()` at `:977`, `snapshot()` is the state a re-read observes, `window()` is the retained
 * window framed into the SAME body as the announcement (`:992-995`), and `commit()` is an append that may land between any two
 * of them. Nothing here claims an engine event: this is the ORDER the contract's `F-5`/`ASM-B4-5` were adjudicated over.
 */
interface EngineModel {
  commit(seq: number): void
  headRead(): number
  snapshot(): number[]
  window(): number[]
}

function engineModel(initial: number[] = []): EngineModel {
  const entries = [...initial]
  return {
    commit: (seq: number) => {
      entries.push(seq)
    },
    headRead: () => (entries.length === 0 ? 0 : entries[entries.length - 1]!),
    snapshot: () => [...entries],
    window: () => [...entries],
  }
}

describe('B-4 §5 `c5` — a reconnect is a RE-READ, and the re-read is ANCHORED TO THE ANNOUNCEMENT', () => {
  it('c5(a) — one `reconcile` per connect, started BY the announcement, its answer ORDERED before any applied frame, the window dropped BECAUSE the re-read covers it', async () => {
    // MUTATIONS THAT WOULD RED IT: a design that re-reads only on the FIRST connect (`c5(b)`), one that re-reads BEFORE it
    // subscribes (`c5(c)`), one that starts the re-read from `connect()` (the count below would read 1 before any
    // announcement), or one that applies the retained window instead of trusting the re-read for it.
    const mod = await loadChangesModule()
    const problems = [...mod.problems]
    if (mod.createEngineChangesFeed !== null) {
      const double = new SseFrameDouble()
      const sink = recordingSink()
      // THE INTERLEAVING, AS ONE READING: the reconcile's START and every sink delivery, in the order they happened.
      const order: string[] = []
      let reconciles = 0
      const feed = mod.createEngineChangesFeed({
        baseUrl: BASE_URL,
        sse: double,
        reconcile: async (): Promise<RagStoreChangedPayload> => {
          reconciles += 1
          order.push(`reconcile-${reconciles}-start`)
          return { kind: 'structural', nodeIds: [`reconciled-${reconciles}`], edgeIds: [], store: 'gnosis:engine' }
        },
        // The sink records BOTH kinds of delivery in ONE order, which is what `c5`'s ordering limb reads.
        onChange: (descriptor: RagStoreChangedPayload) => {
          order.push(descriptor.nodeIds[0] ?? '(none)')
          sink.sink(descriptor)
        },
      }) as Feed

      try {
        await feed.connect()
        if (double.calls !== 1) problems.push(`c5(a): the double's \`subscribe\` read ${double.calls} call(s) after one connect — the socket opens BEFORE the re-read`)
        if (reconciles !== 0) problems.push(`c5(a): \`reconcile\` read ${reconciles} before the connection announced — ASM-B4-5 anchors it to the ANNOUNCEMENT, never to connect()`)
        if (feed.status()?.announced !== false) problems.push('c5(a): `status().announced` read true with no announcement driven')

        // THE ANNOUNCEMENT, then the retained window `(floor, head]` exactly as the engine frames it (`:983-996`).
        announceAt(double, '5')
        double.frame('change', changeFrame({ cursor: '4', nodeIds: ['window-4'] }))
        double.frame('change', changeFrame({ cursor: '5', nodeIds: ['window-5'] }))
        // NOTHING IS APPLIED BEFORE THE ANSWER LANDS — the whole point of the anchor.
        if (sink.calls.length !== 0) problems.push(`c5(a): ${sink.calls.length} descriptor(s) reached the sink before the re-read answered — nothing is applied until the answer is delivered`)
        if (feed.census()?.applied !== 0) problems.push(`c5(a): \`applied\` read ${String(feed.census()?.applied)} before the answer landed`)
        await settled()
        if (reconciles !== 1) problems.push(`c5(a): after the announcement \`reconcile\` read ${reconciles} — the ANNOUNCEMENT is what starts it`)
        const afterFirst = feed.census()
        if (afterFirst?.applied !== 0) problems.push(`c5(a): ${String(afterFirst?.applied)} window frame(s) were applied — the head announcement sets the watermark and the re-read covers them`)
        if (afterFirst?.dropped !== 2) problems.push(`c5(a): \`dropped\` read ${String(afterFirst?.dropped)} for a two-frame window at/below the head — both are dropped AND counted`)
        if (sink.named('window-4').length + sink.named('window-5').length !== 0) problems.push('c5(a): a retained-window frame reached the sink — the re-read is the coverage, the window is the duplicate')

        // A commit framed by the LIVE TAIL, above the head: applied exactly once.
        double.frame('change', changeFrame({ cursor: '6', nodeIds: ['live-6'] }))
        if (sink.named('live-6').length !== 1) problems.push(`c5(a): a frame ABOVE the head was emitted ${sink.named('live-6').length} time(s) — exactly one is required`)

        // RECONNECT: close, connect, and the SAME reading again — the second connect re-reads only from ITS announcement.
        feed.close()
        if (double.at(0)?.closed !== true) problems.push('c5(a): `close()` left the first subscription OPEN — §2: `close()` is total and tears the socket')
        await feed.connect()
        if (double.calls !== 2) problems.push(`c5(a): the double's \`subscribe\` read ${double.calls} call(s) after two connects — one connection per connect, no second socket`)
        if (reconciles !== 1) problems.push(`c5(a): \`reconcile\` read ${reconciles} right after the SECOND connect — a connect does not re-read on its own; its ANNOUNCEMENT does`)
        // THE SECOND HEAD IS THIS CONNECTION'S OWN, AND THAT IS THE `F-11` CORRECTION: the first connection applied 6 live, so the
        // engine's head at the reconnect is 6, and the retained window `(floor, 6]` is {5, 6}. Drawing the head at 5 instead would
        // make `6` an ABOVE-HEAD frame — which §2.4 applies exactly once, by the same rule as `live-7` — so the old fixture only
        // read "dropped" under a FEED-LIFETIME watermark. The row's subject (the replayed window is dropped BECAUSE the answer
        // covers it) is unchanged; the head is now the one the engine would send.
        announceAt(double, '6')
        double.frame('change', changeFrame({ cursor: '5', nodeIds: ['window-5-replay'] }))
        double.frame('change', changeFrame({ cursor: '6', nodeIds: ['window-6-replay'] }))
        if (reconciles !== 2) problems.push(`c5(a): after the second announcement \`reconcile\` read ${reconciles} — exactly ONE per connect (2)`)
        await settled()
        if (sink.named('window-5-replay').length + sink.named('window-6-replay').length !== 0) problems.push('c5(a): a replayed window frame reached the sink after the reconnect')
        if (feed.census()?.dropped !== 4) problems.push(`c5(a): \`dropped\` read ${String(feed.census()?.dropped)} after two windows — four frames are at/below their connection's head`)
        double.frame('change', changeFrame({ cursor: '7', nodeIds: ['live-7'] }))
        if (sink.named('live-7').length !== 1) problems.push(`c5(a): a frame above the SECOND head was emitted ${sink.named('live-7').length} time(s) — exactly one is required`)
        if (feed.census()?.connects !== 2) problems.push(`c5(a): \`census().connects\` read ${String(feed.census()?.connects)} — two connects were issued`)
        if (feed.status()?.position !== 7) problems.push(`c5(a): \`status().position\` read ${String(feed.status()?.position)} — 7 is the last accepted position`)
      } catch (err) {
        problems.push(`c5(a): driving threw (${err instanceof Error ? err.message : String(err)}) — §2.5: \`connect()\` never rejects`)
      }

      // THE ORDER, as ONE reading: the re-read starts from the announcement, its answer lands, and only THEN do judged frames
      // reach the sink — twice over, once per connect. A pre-subscribe or a connect()-started design reads a different list.
      const expected = ['reconcile-1-start', 'reconciled-1', 'live-6', 'reconcile-2-start', 'reconciled-2', 'live-7']
      if (JSON.stringify(order) !== JSON.stringify(expected)) {
        problems.push(`c5(a): the sink's order read ${JSON.stringify(order)} — ASM-B4-5 requires ${JSON.stringify(expected)}`)
      }
    }
    expect(problems, `c5(a):\n${problems.join('\n')}`).toEqual([])
  })

  it('c5(b) DESIGN MODEL (not implementation evidence — loads no `src/`) — a design that re-reads only on the FIRST connect reads `1`, so the `2` above has teeth', async () => {
    // The mutant is deliberately WRONG; it exists to prove the reading is falsifiable (the `B-3` `r7` mutant discipline).
    // DESIGN MODEL, DISCLOSED: nothing here imports `src/main/engine-changes.ts`, so this row can never red on the module's byte —
    // it is the falsifiability floor under `c5(a)`'s `2`, and the title says so.
    const double = new SseFrameDouble()
    let reconciles = 0
    let connectedOnce = false
    const mutantConnect = (): void => {
      if (!connectedOnce) {
        reconciles += 1
        connectedOnce = true
      }
      double.subscribe(`${BASE_URL}/changes`, { onEvent: () => undefined, onError: () => undefined, onClose: () => undefined })
    }
    mutantConnect()
    mutantConnect()
    expect(reconciles, 'the mutant must read 1 — a `reconcile` count that cannot distinguish the two designs would make c5 vacuous').toBe(1)
    expect(double.calls, 'the mutant still opens one connection per connect, so the ONLY divergence is the missing re-read').toBe(2)
  })

  it('c5(c) DESIGN MODEL (not implementation evidence — loads no `src/`) — a design that re-reads BEFORE subscribing leaves the landing\'s `F-5` window: the commit is ≤ the head AND absent from the answer', async () => {
    // THE INTERLEAVING, AND IT IS ONE: a commit lands AFTER the re-read's read and BEFORE the engine's head read. Both designs
    // below see the same engine, the same commit and the same journal; they differ ONLY in whether the head was read before
    // or after the re-read. `covered` = the commit surfaced by the re-read's answer; `applied` = the commit surfaced by a
    // frame. The row's assertion (`gap` empty) is what `c5(a)` and `c5(d)` measure on the real module.
    // DESIGN MODEL, DISCLOSED (R4): this row is TWO HAND-WRITTEN MODELS and no module byte — it would read identically against an
    // empty `src/`. `c5(d)` is its implementation reading, and the pair is what makes that reading non-vacuous.
    interface Outcome {
      covered: number[]
      applied: number[]
      droppedWindow: number[]
    }
    /** One connect of one design over one engine; `preSubscribe` IS the landed `F-5` shape. */
    const runDesign = (preSubscribe: boolean): Outcome => {
      const engine = engineModel([1, 2, 3])
      const outcome: Outcome = { covered: [], applied: [], droppedWindow: [] }
      let committed = false
      // The re-read: it takes its snapshot, and the commit lands DURING the read (after the snapshot, before it answers) —
      // which is exactly the window `F-5` measured.
      const reread = (): number[] => {
        const snapshot = engine.snapshot()
        if (!committed) {
          committed = true
          engine.commit(4)
        }
        return snapshot
      }
      // `subscribe` frames the announcement and the retained window in ONE body, exactly as the engine does.
      const subscribe = preSubscribe
        ? null
        : () => ({ head: engine.headRead(), window: engine.window() })
      let head: number
      let window: number[]
      let answer: number[]
      if (subscribe === null) {
        answer = reread()
        const framed = { head: engine.headRead(), window: engine.window() }
        head = framed.head
        window = framed.window
      } else {
        const framed = subscribe()
        head = framed.head
        window = framed.window
        answer = reread()
      }
      outcome.covered = answer
      // §2.3 judges every framed entry against the connection's head; the live tail then frames whatever landed above it and
      // was not already in the eager window — one frame per commit, never two.
      const tail = engine.snapshot().filter((seq) => seq > head && !window.includes(seq))
      outcome.applied = [...window.filter((seq) => seq > head), ...tail]
      outcome.droppedWindow = window.filter((seq) => seq <= head)
      return outcome
    }

    const mutant = runDesign(true)
    const anchored = runDesign(false)
    const gapOf = (outcome: Outcome): number[] =>
      [1, 2, 3, 4].filter((seq) => !outcome.covered.includes(seq) && !outcome.applied.includes(seq))

    expect(gapOf(mutant), 'the PRE-SUBSCRIBE mutant must leak the commit — if it covered 4, this row could not distinguish the designs').toEqual([4])
    expect(mutant.droppedWindow, 'the mutant drops the window against a head read AFTER its re-read, so the commit is `≤ head` and the window frame is dropped').toEqual([1, 2, 3, 4])
    expect(gapOf(anchored), 'the ANCHORED shape must cover every commit — `≤ head` through the re-read and `> head` through the tail').toEqual([])
    expect(anchored.covered, 'the anchored re-read started after the head read, so its answer is the coverage for 1..3').toEqual([1, 2, 3])
    expect(anchored.applied, 'the commit above the head is framed by the live tail and applied exactly once').toEqual([4])
  })

  it('c5(d) — the REAL module through that interleaving: the eager window is dropped BECAUSE the re-read covers it, and the tail applies the above-head commit', async () => {
    // THE ENGINE'S OWN BODY, DRIVEN AS THE ENGINE WRITES IT: read the head, frame the announcement AND the retained window in
    // ONE body (`gnosis_server.rs:983-996`), then keep the connection open for the tail (`:1005-1032`). The double's
    // `subscribe` plays the handler; the tail is driven below, AFTER the answer has landed.
    const mod = await loadChangesModule()
    const problems = [...mod.problems]
    if (mod.createEngineChangesFeed !== null) {
      const engine = engineModel([1, 2, 3])
      const sink = recordingSink()
      // TWO NAMESPACES, so the answer and the frames cannot be confused: `covered-<seq>` is the RE-READ's answer and
      // `frame-<seq>` is a frame that reached the sink. (The first draft named both `seq-<n>` and this row's own coverage limb
      // then read the answer as if it were a window frame — measured at this landing and fixed here, not in the module.)
      const framesApplied: number[] = []
      let handlers: { onEvent: (event: string, data: string) => void } | null = null
      let committed = false
      let answer: number[] = []
      const client: SseClient = {
        subscribe(_url, h) {
          handlers = h
          // `:977` the head; `:992-995` the retained window — BOTH inside the one body the announcement opens.
          const head = engine.headRead()
          const window = engine.window()
          const emit = (event: string, body: unknown): void => {
            const parsed = parseSseFrame(`event: ${event}\ndata: ${JSON.stringify(body)}\n\n`)
            h.onEvent(parsed.event, parsed.data)
          }
          emit('cursor', { type: 'cursor', cursor: String(head) })
          for (const seq of window) emit('change', changeFrame({ cursor: String(seq), nodeIds: [`frame-${seq}`] }))
          return { close: () => undefined }
        },
      }
      const feed = mod.createEngineChangesFeed({
        baseUrl: BASE_URL,
        sse: client,
        // THE RE-READ: it starts from the ANNOUNCEMENT, so it reads at an instant STRICTLY AFTER the engine's head read — and
        // the commit below lands DURING it, after its snapshot. That is the interleaving `F-5` leaked and this row forbids.
        reconcile: async (): Promise<RagStoreChangedPayload> => {
          answer = engine.snapshot()
          if (!committed) {
            committed = true
            engine.commit(4)
          }
          return { kind: 'structural', nodeIds: answer.map((seq) => `covered-${seq}`), edgeIds: [], store: 'gnosis:engine' }
        },
        onChange: (descriptor: RagStoreChangedPayload) => {
          sink.sink(descriptor)
          for (const nodeId of descriptor.nodeIds) {
            const frame = /^frame-([0-9]+)$/.exec(nodeId)
            if (frame !== null) framesApplied.push(Number(frame[1]))
          }
        },
      }) as Feed

      try {
        await feed.connect()
        await settled()
        if (committed !== true) problems.push('c5(d): the re-read never ran — the announcement did not start it (the interleaving has no subject)')
        if (JSON.stringify(answer) !== JSON.stringify([1, 2, 3])) {
          problems.push(`c5(d): the re-read's snapshot read ${JSON.stringify(answer)} — it must have STARTED before the commit landed`)
        }
        // THE TAIL: the commit that landed during the re-read is framed above the head, and applies exactly once. The frame goes
        // through the SAME shipped parser the harness uses, so the consumer sees the pair `createSseClient` would hand it.
        const tail = parseSseFrame(`event: change\ndata: ${JSON.stringify(changeFrame({ cursor: '4', nodeIds: ['frame-4'] }))}\n\n`)
        handlers?.onEvent(tail.event, tail.data)
        const census = feed.census()
        if (census?.applied !== 1) problems.push(`c5(d): \`applied\` read ${String(census?.applied)} — only the above-head commit is applied`)
        if (census?.dropped !== 3) problems.push(`c5(d): \`dropped\` read ${String(census?.dropped)} — the three-frame eager window is dropped BECAUSE the answer covers it`)
        if (sink.named('frame-4').length !== 1) problems.push(`c5(d): the above-head commit surfaced ${sink.named('frame-4').length} time(s) — exactly one`)
        if (sink.named('frame-1').length + sink.named('frame-2').length + sink.named('frame-3').length !== 0) {
          problems.push('c5(d): a window frame reached the sink — the re-read is the coverage, the window is the duplicate')
        }
        // THE COVERAGE ASSERTION — the same one `c5(c)`'s pre-subscribe mutant fails.
        const gap = [1, 2, 3, 4].filter((seq) => !answer.includes(seq) && !framesApplied.includes(seq))
        if (gap.length !== 0) problems.push(`c5(d): commits ${JSON.stringify(gap)} surfaced NOWHERE — a commit at or below the head that is absent from a re-read which started after that head read is the silent gap ASM-B-4 forbids`)
      } catch (err) {
        problems.push(`c5(d): driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `c5(d):\n${problems.join('\n')}`).toEqual([])
  })
})
