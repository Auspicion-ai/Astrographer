// tests/integration/gnosis-changes/transport-and-failure.test.ts — unit `B-4` `engine-changes`'s TRANSPORT and FAILURE rows
// (`c6`, `c7`, `c8`). Authored BEFORE the change set's bytes exist (RCA-1).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4-engine-changes.md` §3, §2.5 and §5 —
//   `c6`  "A NON-loopback baseUrl is refused BEFORE any subscription (`assertLoopback`, `src/main/engine-transport.ts:57-67`) — the
//          double's `subscribe` is never called; the subscribe goes through the transport seam's export; and a SOURCE clause
//          grades that `engine-changes.ts` contains NO `fetch(`, no `createSseClient`, no `http://` and no `assertLoopback`
//          (the one spelling lives in the transport), with a mutant (an inlined `fetch`) driven to `false` first."
//   `c7`  "A non-2xx answer (the real client's own `sse: non-2xx response`, `src/main/engine-rag-store.ts:796-799`), a premature
//          close and a transport fault each settle `status()` at `EngineUnavailable` with its `cause`; ZERO descriptors are
//          fabricated; and a SOURCE clause grades no `setTimeout`/`setInterval`/`retry` in the module (D-82 clause 4) with a
//          mutant driven false first."
//   `c8`  "a connect against a refused socket answers the typed error on `status()` and NOTHING is thrown out of the caller's
//          `connect()` — the boot-completion limb — while `c1`'s control proves the same feed still applies frames when the
//          engine answers."
//
// THE TYPED CLASS IS THE FORK'S OWN: `EngineUnavailable` (`src/main/engine-rag-store.ts:111-123`) with its `cause` member — a
// bare `EngineWireError` (`:100-109`) is NOT the typed unavailability §2.5 requires, and a raw `Error` is neither.
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS. No socket, no engine, no Electron. **The live arm is PARKED** (`docs/L2/…/engine-changes.md`
// §6): the engine at this head refuses the fork's client with `sse: non-2xx response` — which is exactly the fault `c7`'s first
// limb answers, measured HERE against the fork's own object and never against a live one.
//
// NON-VACUITY: every failure limb is floored by `c8(d)`'s healthy control on the SAME harness, and each source clause is driven
// through a MUTANT that must read `false` before the real text is allowed to read `true`.
import { describe, it, expect } from 'vitest'

import { EngineUnavailable } from '../../../src/main/engine-rag-store.js'
import * as transport from '../../../src/main/engine-transport.js'
import {
  announceAt,
  BASE_URL,
  changeFrame,
  cursorFrame,
  loadChangesModule,
  occurrences,
  readText,
  recordingSink,
  settled,
  SseFrameDouble,
  stripComments,
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

const CHANGES_FILE = 'src/main/engine-changes.ts'

interface Rig {
  feed: Feed | null
  double: SseFrameDouble
  sink: ReturnType<typeof recordingSink>
  problems: string[]
}

async function rig(over: Record<string, unknown> = {}): Promise<Rig> {
  const mod = await loadChangesModule()
  const problems = [...mod.problems]
  const double = new SseFrameDouble()
  const sink = recordingSink()
  if (mod.createEngineChangesFeed === null) return { feed: null, double, sink, problems }
  try {
    const feed = mod.createEngineChangesFeed({
      baseUrl: BASE_URL,
      sse: double,
      reconcile: async () => ({ kind: 'structural' as const, nodeIds: ['reconciled'], edgeIds: [], store: 'gnosis:engine' }),
      onChange: sink.sink,
      ...over,
    }) as Feed
    return { feed, double, sink, problems }
  } catch (err) {
    problems.push(`construction threw (${err instanceof Error ? err.message : String(err)}) — §2: construction is INERT and total`)
    return { feed: null, double, sink, problems }
  }
}

const typedFailure = (value: unknown): EngineUnavailable | null => (value instanceof EngineUnavailable ? value : null)

describe('B-4 §5 `c6` — the transport is the fork\'s ONE stream opener', () => {
  it('c6(a) — a NON-loopback baseUrl is refused BEFORE any subscription: the double\'s `subscribe` is never called', async () => {
    // MUTATION THAT WOULD RED IT: a consumer that builds its own URL (no `assertLoopback`), or a seam that subscribes first and
    // validates after.
    const { feed, double, problems } = await rig({ baseUrl: 'http://10.1.2.3:8080' })
    if (feed !== null) {
      try {
        await feed.connect()
      } catch (err) {
        problems.push(`c6(a): \`connect()\` THREW on a non-loopback baseUrl (${err instanceof Error ? err.message : String(err)}) — §2.5: it never rejects`)
      }
      if (double.calls !== 0) {
        problems.push(`c6(a): the double's \`subscribe\` read ${double.calls} call(s) for a non-loopback baseUrl — \`assertLoopback\` runs BEFORE the subscription (engine-transport.ts:57-67)`)
      }
      const failure = typedFailure(feed.status()?.failure)
      if (failure === null) problems.push(`c6(a): \`status().failure\` read ${String(feed.status()?.failure)} — a non-loopback refusal is a typed EngineUnavailable`)
      if (feed.census()?.connects !== 1) problems.push(`c6(a): \`connects\` read ${String(feed.census()?.connects)} — the connect WAS issued, it just never subscribed`)
    }
    expect(problems, `c6(a):\n${problems.join('\n')}`).toEqual([])
  })

  it('c6(b) — the subscribe URL is the ENGINE ENDPOINT beside the base, normalised exactly as the proxy normalises it', async () => {
    // MUTATION THAT WOULD RED IT: a path spelled in the consumer, a hard-coded '/changes', or a doubled slash from an
    // un-normalised base ('http://127.0.0.1:8080' + '/' + '/changes').
    const problems: string[] = []
    if (typeof (transport as Record<string, unknown>)['subscribeEngineStream'] !== 'function') {
      problems.push('c6(b): `engine-transport.ts` exports no callable `subscribeEngineStream` — §3 adds EXACTLY ONE export, the subscription seam')
    }
    for (const base of [BASE_URL, `${BASE_URL}/`]) {
      const { feed, double, problems: rigProblems } = await rig({ baseUrl: base })
      problems.push(...rigProblems)
      if (feed !== null) {
        try {
          await feed.connect()
        } catch (err) {
          problems.push(`c6(b): \`connect()\` threw for baseUrl ${base} (${err instanceof Error ? err.message : String(err)})`)
        }
        const url = double.urls[0]
        if (url !== `${BASE_URL}/changes`) {
          problems.push(`c6(b): the subscription URL read ${String(url)} for baseUrl ${base} — \`ENGINE_ENDPOINTS.changes\` beside the normalised base is '${BASE_URL}/changes'`)
        }
      }
    }
    expect(problems, `c6(b):\n${problems.join('\n')}`).toEqual([])
  })

  it('c6(c) SOURCE — `engine-changes.ts` carries no `fetch(`, no `createSseClient`, no `http://`, no `assertLoopback`, and the clause is driven FALSE by a mutant first', () => {
    // THE CLAUSE, as a function of the text, so it can be falsified: mutate the text and it MUST answer false.
    const clause = (text: string): boolean => {
      const code = stripComments(text)
      return (
        occurrences(code, 'fetch(') === 0 &&
        occurrences(code, 'createSseClient') === 0 &&
        occurrences(code, 'http://') === 0 &&
        occurrences(code, 'https://') === 0 &&
        occurrences(code, 'assertLoopback') === 0
      )
    }
    const problems: string[] = []
    let real = ''
    try {
      real = readText(CHANGES_FILE)
    } catch (err) {
      problems.push(`c6(c): \`${CHANGES_FILE}\` could not be read (${err instanceof Error ? err.message : String(err)}) — §3's NEW file is the clause's subject`)
    }
    if (real !== '') {
      // THE MUTANT FIRST: one inlined transport spelling must take the clause to FALSE, or the clause has no teeth.
      const mutant = `${real}\nconst smuggled = fetch('http://example.invalid/changes')\n`
      if (clause(mutant)) {
        problems.push('c6(c): the clause answered TRUE for a text with an inlined `fetch(\'http://…\')` — the clause cannot fail and proves nothing')
      }
      const mutantSeam = `${real}\nconst smug = createSseClient()\n`
      if (clause(mutantSeam)) problems.push('c6(c): the clause answered TRUE for a text that opens its own `createSseClient()` — the ONE opener is the transport seam\'s')
      if (!clause(real)) {
        problems.push(`c6(c): \`${CHANGES_FILE}\` carries a second transport spelling (fetch( / createSseClient / http:// / assertLoopback) — §3 puts the ONE spelling in \`engine-transport.ts\``)
      }
    }
    expect(problems, `c6(c):\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4 §5 `c7` — a dropped connection is a TYPED UNAVAILABILITY, never a silent stall', () => {
  const FAULTS: Array<{ name: string; drive: (double: SseFrameDouble) => void; cause?: string; message?: RegExp }> = [
    {
      name: 'a non-2xx answer (`sse: non-2xx response`)',
      drive: (double) => double.fail(new Error('sse: non-2xx response')),
      message: /non-2xx/,
    },
    { name: 'a premature close (the feed never sends `done`)', drive: (double) => double.end(), message: /closed|close/i },
    {
      name: 'a transport fault (ECONNRESET)',
      drive: (double) => double.fail(Object.assign(new Error('socket hang up'), { code: 'ECONNRESET' })),
      cause: 'unavailable-state',
    },
    {
      name: 'a refused socket (ECONNREFUSED)',
      drive: (double) => double.fail(Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:8080'), { code: 'ECONNREFUSED' })),
      cause: 'connection-refused',
    },
  ]

  it('c7(a) — each fault settles `status()` at the typed `EngineUnavailable`, fabricates NOTHING, and leaves no connection', async () => {
    // MUTATION THAT WOULD RED IT: a consumer that swallows the fault (a silent stall), reports it as a message string, or keeps
    // `connected: true` after the stream is gone.
    const problems: string[] = []
    for (const fault of FAULTS) {
      const { feed, double, sink, problems: rigProblems } = await rig()
      problems.push(...rigProblems)
      if (feed === null) continue
      try {
        await feed.connect()
        const before = sink.calls.length
        fault.drive(double)
        const failure = typedFailure(feed.status()?.failure)
        if (failure === null) {
          problems.push(`c7(a): after ${fault.name} \`status().failure\` read ${String(feed.status()?.failure)} — §2.5 requires the typed EngineUnavailable`)
        } else {
          if (fault.cause !== undefined && failure.cause !== fault.cause) {
            problems.push(`c7(a): ${fault.name} settled the cause at \`${String(failure.cause)}\` — \`transportError\` maps it to '${fault.cause}' (engine-transport.ts:74-96)`)
          }
          if (fault.message !== undefined && !fault.message.test(failure.message)) {
            problems.push(`c7(a): ${fault.name} settled the message at ${JSON.stringify(failure.message)} — the refusal's own words must survive`)
          }
        }
        if (feed.status()?.connected !== false) problems.push(`c7(a): ${fault.name} left \`status().connected\` true — the stream is gone`)
        if (sink.calls.length !== before) {
          problems.push(`c7(a): ${fault.name} emitted ${sink.calls.length - before} descriptor(s) — a fault fabricates NOTHING`)
        }
      } catch (err) {
        problems.push(`c7(a): driving ${fault.name} threw (${err instanceof Error ? err.message : String(err)}) — \`connect()\` never rejects`)
      }
    }
    expect(problems, `c7(a):\n${problems.join('\n')}`).toEqual([])
  })

  it('c7(b) SOURCE — NO timer, NO poll, NO retry, NO backoff, NO auto-reconnect in the module (mutant driven false first)', () => {
    // MUTATION THAT WOULD RED IT: a `setTimeout(...connect...)` auto-reconnect, a backoff loop, a poll — D-82 clause 4's
    // discipline, which §2.5 keeps.
    const clause = (text: string): boolean => {
      const code = stripComments(text)
      return (
        occurrences(code, 'setTimeout(') === 0 &&
        occurrences(code, 'setInterval(') === 0 &&
        occurrences(code, 'setImmediate(') === 0 &&
        occurrences(code, 'backoff') === 0 &&
        occurrences(code, 'retry(') === 0 &&
        occurrences(code, 'reconnect(') === 0
      )
    }
    const problems: string[] = []
    let real = ''
    try {
      real = readText(CHANGES_FILE)
    } catch (err) {
      problems.push(`c7(b): \`${CHANGES_FILE}\` could not be read (${err instanceof Error ? err.message : String(err)})`)
    }
    if (real !== '') {
      const mutant = `${real}\nsetTimeout(() => { void self.reconnect() }, 1000)\n`
      if (clause(mutant)) problems.push('c7(b): the clause answered TRUE for a text that schedules an auto-reconnect — the clause cannot fail')
      if (!clause(real)) {
        problems.push(`c7(b): \`${CHANGES_FILE}\` ships a timer/poll/retry/backoff — §2.5 ships NONE (a drop is typed and terminal until the caller connects again)`)
      }
    }
    expect(problems, `c7(b):\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4 §5 `c8` — engine-absent is TYPED and LOUD, and nothing escapes `connect()`', () => {
  it('c8(a) — a refused socket (synchronous throw out of `subscribe`) settles the typed error and does NOT throw out of `connect()`', async () => {
    // MUTATION THAT WOULD RED IT: a `connect()` that awaits the seam without containing it (the throw becomes an unhandled
    // rejection at boot, and `main.ts`'s `void feed.connect()` would surface it as a boot fault).
    const { feed, double, problems } = await rig()
    if (feed !== null) {
      double.throwOnSubscribe = Object.assign(new Error('connect ECONNREFUSED 127.0.0.1:8080'), { code: 'ECONNREFUSED' })
      try {
        await feed.connect()
      } catch (err) {
        problems.push(`c8(a): \`connect()\` REJECTED (${err instanceof Error ? err.message : String(err)}) — the boot does not await it; a rejection is a boot fault`)
      }
      const failure = typedFailure(feed.status()?.failure)
      if (failure === null) problems.push(`c8(a): \`status().failure\` read ${String(feed.status()?.failure)} — a refused socket is a typed unavailability`)
      else if (failure.cause !== 'connection-refused') {
        problems.push(`c8(a): the cause read \`${String(failure.cause)}\` — an ECONNREFUSED is 'connection-refused' (engine-transport.ts:83-85)`)
      }
      if (feed.status()?.connected !== false) problems.push('c8(a): a refused socket left `connected` true')
    }
    expect(problems, `c8(a):\n${problems.join('\n')}`).toEqual([])
  })

  it('c8(b) — a THROWING or REJECTING `reconcile` is a typed failure and the subscription is CLOSED (fail-closed)', async () => {
    // MUTATION THAT WOULD RED IT: a consumer that leaves the socket standing — it would then treat the frames of a connection
    // it could not reconcile as deltas it cannot have measured (`ASM-B-4`), which is the gap claim the contract refuses in
    // terms. RE-GRAINED BY `ASM-B4-5`: the socket opens BEFORE the re-read (that is the anchor), so fail-closed is measured as
    // "the subscription it opened is CLOSED", not as "no subscription was opened".
    const problems: string[] = []
    for (const reconcile of [
      () => {
        throw new Error('re-read blew up')
      },
      async () => {
        throw new Error('re-read rejected')
      },
    ]) {
      const { feed, double, sink, problems: rigProblems } = await rig({ reconcile })
      problems.push(...rigProblems)
      if (feed === null) continue
      try {
        await feed.connect()
      } catch (err) {
        problems.push(`c8(b): \`connect()\` rejected when the re-read failed (${err instanceof Error ? err.message : String(err)})`)
      }
      if (double.calls !== 1) {
        problems.push(`c8(b): the double's \`subscribe\` read ${double.calls} call(s) — ASM-B4-5 subscribes FIRST, so exactly one socket opens before the re-read runs`)
      }
      // The announcement is what starts the failing read.
      double.frame('cursor', cursorFrame('1'))
      await settled()
      if (double.at(0)?.closed !== true) {
        problems.push('c8(b): a failed re-read left the subscription OPEN — fail-closed tears down the socket it cannot reconcile')
      }
      if (typedFailure(feed.status()?.failure) === null) {
        problems.push(`c8(b): \`status().failure\` read ${String(feed.status()?.failure)} — a failed re-read is a typed unavailability`)
      }
      if (feed.status()?.connected !== false) problems.push('c8(b): a failed re-read left `status().connected` true')
      // AND NOTHING IS APPLIED: the connection is retired, so a frame above its announced head reaches nobody.
      double.frame('change', changeFrame({ cursor: '2', nodeIds: ['after-failure'] }))
      if (sink.named('after-failure').length !== 0) problems.push('c8(b): a frame was applied on a connection whose re-read failed — the socket is retired, not repaired')
    }
    expect(problems, `c8(b):\n${problems.join('\n')}`).toEqual([])
  })

  it('c8(c) CONTROL — the SAME feed applies frames when the engine answers (so `c8`\'s failures are not the only outcome)', async () => {
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        announceAt(double, '0')
        await settled()
        double.frame('change', changeFrame({ cursor: '1', nodeIds: ['n1'] }))
      } catch (err) {
        problems.push(`c8(c): driving the healthy connection threw (${err instanceof Error ? err.message : String(err)})`)
      }
      if (sink.named('n1').length !== 1) problems.push('c8(c) CONTROL: a healthy connection emitted no descriptor — the failure rows above would then be vacuous')
      if (feed.status()?.failure !== null && feed.status()?.failure !== undefined) {
        problems.push(`c8(c) CONTROL: \`status().failure\` read ${String(feed.status()?.failure)} on a healthy connection`)
      }
      if (feed.status()?.connected !== true) problems.push('c8(c) CONTROL: a live connection did not read `connected: true`')
    }
    expect(problems, `c8(c) CONTROL:\n${problems.join('\n')}`).toEqual([])
  })
})
