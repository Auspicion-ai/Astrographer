// tests/integration/gnosis-changes/adversarial.test.ts — the ADVERSARIAL battery for unit `B-4` `engine-changes` (RCA-3, gate `G5`):
// the hostile INPUTS and host FAULTS the contract's rows `c1`…`c11` do not enumerate, each written AFTER the green and kept as a
// REGRESSION (the `AGENTS.md` rule: a host finding is fixed here and regression-tested beside its fix).
//
// WHAT THESE ROWS GRADE, AND BY WHAT AUTHORITY: `docs/L2/gnosis-changes/engine-changes.md` §5's table (the failure and boundary
// states) and §8 `F-1` (the four host defects this unit's own adversarial pass found and repaired). They assert the DECLARED
// behaviour of those lines, not a new contract clause — where a row's subject is a deliberate RELAXATION it says so in its own
// docblock, so no reader mistakes a tolerant arm for an omission.
//
// THE FOUR `F-1` LIMBS, one `it` each:
//   `a1` a `change` frame's cursor that is NOT the canonical decimal is a REFUSAL, never a coercion (the `Number(...)` shape);
//   `a2` a THROWING sink is CONTAINED — `createSseClient` would otherwise catch it and re-fire it as `onError`
//        (`src/main/engine-rag-store.ts:818-823`), turning one host fault into a dead subscription;
//   `a3` a frame delivered from a RETIRED connection (after `close()` / a reconnect) is never applied;
//   `a4` a second `connect()` WITHOUT `close()` opens NO second socket and runs NO second re-read (`ASM-L2-2`).
// And the remaining boundary states: `a5` the cursor frame's EXTRA-key tolerance (a declared relaxation, said so), `a6` a
// hostile `data` line (unparseable JSON, a bare array, a bare `null`, a body with no `kind`), `a7` a re-read that answers a
// non-descriptor (RE-GRAINED to `ASM-B4-5`: the subscription now EXISTS when the re-read fails, and fail-closed means it is
// CLOSED, not that it never opened), `a8` a hostile `pane-events` handler that releases another mid-dispatch.
//
// THE ANCHOR (`ASM-B4-5`) IS IN EVERY ROW THAT DRIVES A `change` FRAME: the announcement is driven first and `settled()` is
// awaited, because nothing is applied until the connection's own announcement has started and its re-read has answered.
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS — the consumer over the injected double, the channel over nothing at all. No socket, no
// engine, no Electron, no app. **No engine event is claimed** (`docs/L2/gnosis-changes/engine-changes.md` §6's park).
import { describe, it, expect } from 'vitest'

import { createPaneEvents } from '../../../src/renderer/pane-events.js'
import {
  announceAt,
  BASE_URL,
  changeFrame,
  cursorFrame,
  loadChangesModule,
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
    problems.push(`construction threw (${err instanceof Error ? err.message : String(err)})`)
    return { feed: null, double, sink, problems }
  }
}

describe('B-4 adversarial — hostile frames, host faults, and the lifecycle boundaries', () => {
  it('a1 — a NON-canonical decimal cursor is a REFUSAL (no coercion): "007", "1.0", " 7", "0x10", "-1", "1e3" are all refused', async () => {
    // F-1(a), repaired: a `Number(body.cursor)` compare silently accepts '1.0' and ' 7'. The refusal is measured by the census
    // (every arm lands in `frames.refused`), and a following WELL-FORMED frame still applies — the stream is never torn down.
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        announceAt(double, '7')
        await settled()
        const hostile = ['007', '1.0', ' 7', '0x10', '-1', '1e3', '7\n', '+7']
        let cursorIndex = 0
        for (const cursor of hostile) {
          double.frame('change', changeFrame({ cursor, nodeIds: [`bad-${cursorIndex++}`] }))
        }
        const refused = feed.census()?.frames?.refused ?? 0
        if (refused !== hostile.length) {
          problems.push(`a1: ${hostile.length} non-canonical cursors produced ${refused} refusal(s) — each is a typed refusal (§2.3)`)
        }
        const fabricated = hostile.flatMap((_, index) => sink.named(`bad-${index}`))
        if (fabricated.length !== 0) problems.push(`a1: a refused cursor FABRICATED ${fabricated.length} descriptor(s)`)
        double.frame('change', changeFrame({ cursor: '8', nodeIds: ['good'] }))
        if (sink.named('good').length !== 1) problems.push('a1: the stream did not survive the refusals — a well-formed frame after them must apply')
      } catch (err) {
        problems.push(`a1: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `a1:\n${problems.join('\n')}`).toEqual([])
  })

  it('a2 — a THROWING sink is CONTAINED: the stream survives, the position advances, and the NEXT frame still applies', async () => {
    // F-1(b), repaired. Without the containment `createSseClient`'s own `try`/`catch` (`engine-rag-store.ts:818-823`) converts the
    // sink's throw into `onError`, and this feed would settle a typed failure it never had.
    const { feed, double, problems } = await rig({
      onChange: () => {
        throw new Error('sink blew up')
      },
    })
    if (feed !== null) {
      try {
        // the RE-READ's answer goes through the same sink, so this call already exercises the containment (`ASM-B4-5`: the
        // answer lands only once the announcement has started the read)
        await feed.connect()
        announceAt(double, '3')
        await settled()
      } catch (err) {
        problems.push(`a2: \`connect()\` rejected when the sink threw (${err instanceof Error ? err.message : String(err)})`)
      }
      try {
        double.frame('change', changeFrame({ cursor: '4', nodeIds: ['n1'] }))
        double.frame('change', changeFrame({ cursor: '5', nodeIds: ['n2'] }))
      } catch (err) {
        problems.push(`a2: the frame dispatch threw across the sink (${err instanceof Error ? err.message : String(err)})`)
      }
      const census = feed.census()
      if (census?.applied !== 2) problems.push(`a2: \`applied\` read ${String(census?.applied)} — a throwing sink does not un-apply a frame`)
      if (feed.status()?.position !== 5) problems.push(`a2: \`position\` read ${String(feed.status()?.position)} — the position advances regardless of the sink`)
      if (feed.status()?.failure !== null && feed.status()?.failure !== undefined) {
        problems.push(`a2: the sink's throw settled a typed FAILURE (${String(feed.status()?.failure)}) — one subscriber's fault is its own`)
      }
      if (feed.status()?.connected !== true) problems.push('a2: a throwing sink closed the connection')
    }
    expect(problems, `a2:\n${problems.join('\n')}`).toEqual([])
  })

  it('a3 — a frame from a RETIRED connection is IGNORED (the tail cannot outlive its socket)', async () => {
    // F-1(c), repaired: the generation gate. The first subscription's handlers are driven AFTER `close()` and AFTER the second
    // connect, and nothing may reach the sink or the position.
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        feed.close()
        await feed.connect()
        // THE ANCHOR: the LIVE connection must announce before anything can be judged against it (`ASM-B4-5`).
        announceAt(double, '0', 1)
        await settled()
        const before = feed.census()?.frames?.seen ?? 0
        // EMIT INTO THE FIRST (retired) SUBSCRIPTION ON PURPOSE.
        double.frame('change', changeFrame({ cursor: '99', nodeIds: ['ghost'] }), 0)
        if (sink.named('ghost').length !== 0) problems.push('a3: a RETIRED connection\'s frame reached the sink — the generation gate is the whole defence')
        if ((feed.census()?.frames?.seen ?? 0) !== before) problems.push('a3: a retired connection\'s frame was COUNTED — it is not seen at all')
        // The live connection still works.
        double.frame('change', changeFrame({ cursor: '1', nodeIds: ['live'] }), 1)
        if (sink.named('live').length !== 1) problems.push('a3: the LIVE connection stopped applying frames')
      } catch (err) {
        problems.push(`a3: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `a3:\n${problems.join('\n')}`).toEqual([])
  })

  it('a4 — a second `connect()` without `close()` opens NO second socket and runs NO second re-read (ASM-L2-2)', async () => {
    // The declared no-op. A design that closed-and-reopened inside `connect()` would read 2 subscriptions and 2 re-reads here and
    // would make `c5`'s "one reconcile per connect" ambiguous.
    let reconciles = 0
    const { feed, double, problems } = await rig({
      reconcile: async () => {
        reconciles += 1
        return { kind: 'structural' as const, nodeIds: [`reconciled-${reconciles}`], edgeIds: [], store: 'gnosis:engine' }
      },
    })
    if (feed !== null) {
      try {
        await feed.connect()
        // `ASM-B4-5`: the ONE re-read this row counts is the one the FIRST connection's announcement starts. The two repeat
        // connects below must not add a second (they are declared no-ops) and the socket must not be re-opened.
        announceAt(double, '0')
        await settled()
        await feed.connect()
        await feed.connect()
      } catch (err) {
        problems.push(`a4: a repeat \`connect()\` rejected (${err instanceof Error ? err.message : String(err)})`)
      }
      if (double.calls !== 1) problems.push(`a4: the double's \`subscribe\` read ${double.calls} call(s) after three connects — ONE live socket, always`)
      if (reconciles !== 1) problems.push(`a4: \`reconcile\` read ${reconciles} after three connects — the no-op re-reads nothing`)
      if (feed.census()?.connects !== 1) problems.push(`a4: \`census().connects\` read ${String(feed.census()?.connects)} — a declared no-op is not a connect`)
      if (double.at(0)?.closed === true) problems.push('a4: the repeat connect CLOSED the standing socket')
    }
    expect(problems, `a4:\n${problems.join('\n')}`).toEqual([])
  })

  it('a5 — a `cursor` frame carrying an EXTRA key is REFUSED (the position family is as exact as the change family)', async () => {
    // §2.1 admits no more a missing/extra key on the POSITION frame than on the change frame, so an additive key is a typed
    // refusal here too — and the row also proves the refusal is not a teardown: a well-formed announcement after it still moves
    // the position. (The first version of this module TOLERATED the extra key; the adversarial pass caught the relaxation and it
    // was removed — a declared relaxation is not this unit's to grant.)
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        double.frame('cursor', { ...cursorFrame('12'), schemaVersion: 1, extra: null })
        if (feed.census()?.frames?.refused !== 1) {
          problems.push(`a5: a cursor announcement with an extra key read ${String(feed.census()?.frames?.refused)} refusal(s) — exactly one is required`)
        }
        if (feed.census()?.frames?.cursor !== 0) problems.push('a5: the malformed announcement was COUNTED as a cursor frame')
        if (feed.status()?.position !== null) problems.push(`a5: the malformed announcement moved the position to ${String(feed.status()?.position)}`)
        // THE CONTROL: the well-formed announcement is not refused, and it is the frame that STARTS the re-read (`ASM-B4-5`).
        double.frame('cursor', cursorFrame('12'))
        await settled()
        if (feed.status()?.position !== 12) problems.push(`a5: the well-formed announcement read position ${String(feed.status()?.position)} — 12 is required`)
        if (feed.census()?.frames?.cursor !== 1) problems.push(`a5: \`frames.cursor\` read ${String(feed.census()?.frames?.cursor)} after one good announcement`)
        const emitted = sink.calls.filter((d) => !d.nodeIds.includes('reconciled'))
        if (emitted.length !== 0) problems.push(`a5: the position family emitted ${emitted.length} descriptor(s) — it emits NOTHING`)
      } catch (err) {
        problems.push(`a5: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `a5:\n${problems.join('\n')}`).toEqual([])
  })

  it('a6 — hostile `data` lines are REFUSED and the stream stands: unparseable JSON, a bare array, `null`, a body without `kind`', async () => {
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        // THE ANCHOR: the connection announces first (`a6` then measures only what a REFUSAL means, not what a silence means).
        announceAt(double, '6')
        await settled()
        const hostile: Array<[string, string]> = [
          ['change', '{"oops'],
          ['change', '[{"type":"change"}]'],
          ['change', 'null'],
          ['change', '"change"'],
          ['change', '{"type":"change","cursor":"3","wikiId":null,"nodeIds":[],"edgeIds":[],"timestamp":"t"}'],
          ['change', '{"type":"cursor","cursor":"4"}'],
          ['result', '{"type":"result","cursor":"5"}'],
          ['error', '{"type":"error","code":"engine_error","message":"boom"}'],
        ]
        for (const [event, data] of hostile) double.raw(event, data)
        const refused = feed.census()?.frames?.refused ?? 0
        if (refused !== hostile.length) {
          problems.push(`a6: ${hostile.length} hostile frame(s) produced ${refused} refusal(s) — every one is a typed refusal (§2.1)`)
        }
        const fabricated = sink.calls.filter((d) => !d.nodeIds.includes('reconciled'))
        if (fabricated.length !== 0) problems.push(`a6: ${fabricated.length} descriptor(s) were FABRICATED from hostile frames`)
        double.frame('change', changeFrame({ cursor: '7', nodeIds: ['after'] }))
        if (sink.named('after').length !== 1) problems.push('a6: the stream did not survive the hostile frames')
        if (feed.status()?.connected !== true) problems.push('a6: a refused frame closed the connection — §2.1: a refusal is NEVER a teardown')
      } catch (err) {
        problems.push(`a6: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `a6:\n${problems.join('\n')}`).toEqual([])
  })

  it('a7 — a re-read that answers a NON-descriptor or a WRONG-ORIGIN `store` is a typed failure and the subscription is CLOSED (fail-closed, in that order)', async () => {
    // RE-GRAINED BY `ASM-B4-5`, AND THE RE-GRAIN IS THE MEASUREMENT: the feed now SUBSCRIBES first (the anchor), so
    // "no subscription opened" is no longer the fail-closed shape — "the subscription it opened is torn down, and nothing was
    // emitted" is. A design that left the socket standing after a failed re-read would be applying frames of a connection it
    // could not reconcile, which is the gap claim `ASM-B-4` refuses in terms. AND IT GAINED THE WRONG-SHAPED-OBJECT LIMB
    // (`F-9`, the post-ruling pass): `{}`, `{kind:'structural'}` with no id arrays, and a four-key body whose `kind` is wrong are
    // as much "no descriptor" as `undefined` is — emitting one would put an unshaped payload on the broadcast AND open §2.3's
    // "covered by the re-read" gate on an answer that covered nothing.
    // AND (`F-12`, THIS PASS) THE `store` LIMB IS AN ORIGIN LIMB: `ASM-B4-1` pins the engine-origin label, and the renderer's
    // foreign-store guard (`src/renderer/sidebar-panes.ts:3185-3189`) reads any OTHER non-empty string as a LOCAL store name.
    // Measured before this pass: an answer carrying `store: 'default'` was emitted, opened the gate, and reached
    // `IPC_RAG_STORE_CHANGED` as a local store change. `''` was already refused; the two registry-shaped names below were not.
    const problems: string[] = []
    const answers: unknown[] = [
      undefined,
      null,
      'descriptor',
      42,
      [],
      {},
      { kind: 'structural' },
      { kind: 'structural', nodeIds: [], edgeIds: [] },
      { kind: 'structural', nodeIds: [], edgeIds: [], store: '' },
      // F-12 — a WRONG ORIGIN: the default store's registry name (what the renderer would accept as LOCAL) …
      { kind: 'structural', nodeIds: [], edgeIds: [], store: 'default' },
      // … and a registry-LEGAL name that is still not the origin (`RAG_STORE_NAME_PATTERN` matches it).
      { kind: 'structural', nodeIds: [], edgeIds: [], store: 'gnosis-engine' },
      { kind: 'moved', nodeIds: [], edgeIds: [], store: 'gnosis:engine' },
      { kind: 'structural', nodeIds: 'n1', edgeIds: [], store: 'gnosis:engine' },
      { kind: 'structural', nodeIds: [], edgeIds: [], store: 'gnosis:engine', extra: 1 },
    ]
    for (const answer of answers) {
      const shown = ((): string => {
        try {
          return JSON.stringify(answer) ?? String(answer)
        } catch {
          return String(answer)
        }
      })()
      const { feed, double, sink, problems: rigProblems } = await rig({ reconcile: async () => answer })
      problems.push(...rigProblems)
      if (feed === null) continue
      try {
        await feed.connect()
      } catch (err) {
        problems.push(`a7: \`connect()\` rejected for a re-read answering ${shown} (${err instanceof Error ? err.message : String(err)})`)
      }
      if (double.calls !== 1) {
        problems.push(`a7: the double's \`subscribe\` read ${double.calls} call(s) — the socket opens BEFORE the re-read (ASM-B4-5), so exactly one is required`)
      }
      // The announcement starts the read that answers the non-descriptor.
      double.frame('cursor', cursorFrame('1'))
      await settled()
      if (double.at(0)?.closed !== true) {
        problems.push(`a7: a re-read answering ${shown} left the subscription OPEN — fail-closed closes it`)
      }
      const failure = feed.status()?.failure
      if (failure === null || failure === undefined) problems.push(`a7: a re-read answering ${shown} left no typed failure on \`status()\``)
      if (sink.calls.length !== 0) problems.push(`a7: a re-read answering ${shown} emitted ${sink.calls.length} descriptor(s) — a non-descriptor is never broadcast`)
      if (feed.status()?.connected !== false) problems.push('a7: the feed still reads `connected: true` after a fail-closed re-read')
    }
    expect(problems, `a7:\n${problems.join('\n')}`).toEqual([])
  })

  it('a8 — `pane-events`: releasing ANOTHER mid-dispatch starves nobody (the snapshot), and a SELF-release finishes the pass it stands in', () => {
    // The `pane-registry.ts:93-104` precedent, inherited by `publishChange` through `fire`. `B-3` proved it for the direct arm; this
    // row re-proves it on the CHANGE arm, because a second dispatch would not inherit it.
    // THE TITLE NAMES TWO LIMBS AND BOTH BELOW ARE DRIVEN: releases-ANOTHER (the snapshot) and SELF-release (the handler that
    // withdraws itself during the very pass it is in). The earlier draft titled the row "a self-release finishes the pass" while
    // driving only the other-release limb — a title outrunning its body, measured by the independent gates and fixed here.
    const problems: string[] = []
    const channel = createPaneEvents()
    const order: string[] = []
    // THE RELEASER IS REGISTERED FIRST, so the handler it withdraws has NOT yet run when the pass begins — which is exactly the
    // state the SNAPSHOT exists for (a registration after the releaser would have run before the release and proved nothing).
    let releaseB: () => void = () => undefined
    channel.subscribeChange('doc-nav', () => {
      order.push('a')
      releaseB()
    })
    releaseB = channel.subscribeChange('doc-nav', () => {
      order.push('b')
    })
    const reports = channel.publishChange()
    if (order.length !== 2) problems.push(`a8: the pass read ${JSON.stringify(order)} — the SNAPSHOT must not be shortened mid-dispatch`)
    if (order[1] !== 'b') problems.push(`a8: the released handler did not stand at the instant the pass began (order ${JSON.stringify(order)})`)
    if (!Array.isArray(reports) || reports.length !== 1) problems.push(`a8: \`publishChange()\` answered ${JSON.stringify(reports)} — one report per interested PANE`)
    // AND THE RELEASE TOOK EFFECT FOR THE NEXT PASS: the surviving handler runs again, the withdrawn one does not, and the new one
    // runs once. (`order` is shared by both passes — the withdrawn handler's spelling appears exactly ONCE in it.)
    const order2: string[] = []
    channel.subscribeChange('doc-nav', () => order2.push('c'))
    channel.publishChange()
    if (order.filter((entry) => entry === 'b').length !== 1) {
      problems.push(`a8: the withdrawn handler ran ${order.filter((entry) => entry === 'b').length} time(s) across two passes — a release takes effect for the NEXT pass`)
    }
    if (order.length !== 3) problems.push(`a8: the two passes read ${JSON.stringify(order)} — 'a' must run once per pass and 'b' once in total`)
    if (JSON.stringify(order2) !== JSON.stringify(['c'])) problems.push(`a8: the pane's newly declared handler read ${JSON.stringify(order2)} — once per pass`)

    // THE SELF-RELEASE LIMB — the limb the title always claimed. A handler that calls ITS OWN release from inside the dispatch
    // must not shorten the pass it stands in (the snapshot again), must not recurse, and must be absent from the NEXT pass.
    const selfChannel = createPaneEvents()
    const selfOrder: string[] = []
    let selfRuns = 0
    let releaseSelf: () => void = () => undefined
    releaseSelf = selfChannel.subscribeChange('doc-nav', () => {
      selfRuns += 1
      selfOrder.push('self')
      releaseSelf()
    })
    selfChannel.subscribeChange('doc-nav', () => selfOrder.push('peer'))
    const selfReports = selfChannel.publishChange()
    if (JSON.stringify(selfOrder) !== JSON.stringify(['self', 'peer'])) {
      problems.push(`a8: a SELF-release during the dispatch read ${JSON.stringify(selfOrder)} — the pass must finish ('self' then 'peer'), the snapshot being taken before any handler ran`)
    }
    if (selfRuns !== 1) problems.push(`a8: the self-releasing handler ran ${selfRuns} time(s) in one pass — a release must not re-enter or starve its own pass`)
    if (!Array.isArray(selfReports) || selfReports.length !== 1) problems.push(`a8: the self-release pass answered ${JSON.stringify(selfReports)} — one report per interested pane`)
    selfChannel.publishChange()
    if (JSON.stringify(selfOrder) !== JSON.stringify(['self', 'peer', 'peer'])) {
      problems.push(`a8: after the self-release the next pass read ${JSON.stringify(selfOrder)} — the released handler is gone and its peer still fires`)
    }
    expect(problems, `a8:\n${problems.join('\n')}`).toEqual([])
  })

  it('a9 — a SYNCHRONOUSLY-settling client leaves NO open handle behind (the seam may settle inside `subscribe`)', async () => {
    // The injected seam is allowed to fire `onError`/`onClose` synchronously, which retires the connection BEFORE `subscribe`
    // returns its handle. The handle must then be closed at assignment, or nothing could ever reach it again.
    const problems: string[] = []
    const mod = await loadChangesModule()
    problems.push(...mod.problems)
    if (mod.createEngineChangesFeed !== null) {
      for (const arm of ['onError', 'onClose'] as const) {
        const double = new SseFrameDouble()
        const sink = recordingSink()
        const feed = mod.createEngineChangesFeed({
          baseUrl: BASE_URL,
          sse: {
            subscribe(url, handlers) {
              const handle = double.subscribe(url, handlers)
              if (arm === 'onError') handlers.onError(Object.assign(new Error('boom'), { code: 'ECONNRESET' }))
              else handlers.onClose()
              return handle
            },
          },
          reconcile: async () => ({ kind: 'structural' as const, nodeIds: ['reconciled'], edgeIds: [], store: 'gnosis:engine' }),
          onChange: sink.sink,
        }) as Feed
        try {
          await feed.connect()
        } catch (err) {
          problems.push(`a9(${arm}): \`connect()\` rejected (${err instanceof Error ? err.message : String(err)})`)
        }
        if (feed.status()?.connected !== false) problems.push(`a9(${arm}): a synchronously-settled connection left \`connected\` true`)
        if (double.at(0)?.closed !== true) {
          problems.push(`a9(${arm}): the handle \`subscribe\` returned was NEVER closed — a socket that no path can reach again`)
        }
        feed.close()
        if (double.at(0)?.closed !== true) problems.push(`a9(${arm}): \`close()\` after the fault did not close the handle`)
      }
    }
    expect(problems, `a9:\n${problems.join('\n')}`).toEqual([])
  })

  it('a10 — a cursor outside the engine\'s own u64 range is REFUSED (no `Infinity` on the status surface)', async () => {
    // A 401-digit decimal satisfies "digits only" and would round to `Infinity` in `status().position`. The engine's cursor is a
    // `u64` (`../Gnosis/src/store/mod.rs:1084`), so a token past `18446744073709551615` is not one it could have printed.
    const { feed, double, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        double.frame('cursor', cursorFrame('1' + '0'.repeat(400)))
        if (feed.census()?.frames?.refused !== 1) problems.push(`a10: a 401-digit cursor read ${String(feed.census()?.frames?.refused)} refusal(s) — exactly one`)
        if (feed.status()?.position !== null) problems.push(`a10: \`status().position\` read ${String(feed.status()?.position)} for a 401-digit cursor — refused tokens must not move it`)
        // THE CONTROL: the u64 MAX itself is a lawful cursor.
        double.frame('cursor', cursorFrame('18446744073709551615'))
        if (feed.census()?.frames?.cursor !== 1) problems.push('a10: the u64 maximum was refused — it is the widest lawful cursor')
        if (!Number.isFinite(feed.status()?.position as number)) {
          problems.push(`a10: \`status().position\` read ${String(feed.status()?.position)} for the u64 maximum — a finite (if lossy) rendering is required`)
        }
      } catch (err) {
        problems.push(`a10: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `a10:\n${problems.join('\n')}`).toEqual([])
  })

  it('a11 — THE ENGINE\'S REAL CONNECT ORDER under the ANCHOR: the eager window is dropped BECAUSE the re-read covers it, and the head/tail boundary is where an above-head frame applies', async () => {
    // THIS ROW MEASURES A CONSEQUENCE, AND SINCE THE `F-5` RULING IT MEASURES THE ANCHORED ONE. The engine's cursor-first frame
    // announces the HEAD (`gnosis_server.rs:977` reads `store.change_cursor()`, i.e. `epoch()`, `:983-986`) and frames the
    // retained window `(floor, head]` in the SAME body (`:992-995`) — every window frame is at or BELOW the announced position,
    // so §2.3 drops it. That drop is LAWFUL only because the announcement STARTS the re-read (`ASM-B4-5`: the head is read
    // before the re-read runs, so everything `≤` the head is inside its answer), and this row reads the ORDER that makes it
    // lawful: the answer reaches the sink BEFORE the window frames are judged, and nothing of the window reaches the sink. A
    // commit above the head — framed by the live tail, `:1005-1032` — is where application happens, exactly once.
    const { feed, double, sink, problems } = await rig()
    if (feed !== null) {
      try {
        await feed.connect()
        // THE ENGINE'S ONE BODY: the announcement, then the retained window, with no room between them for a reading.
        announceAt(double, '100')
        double.frame('change', changeFrame({ cursor: '99', nodeIds: ['window-99'] }))
        double.frame('change', changeFrame({ cursor: '100', nodeIds: ['window-100'] }))
        // NOTHING IS APPLIED AND NOTHING IS EMITTED YET: the answer has not landed, so the window's frames cannot have been
        // counted as applied and no descriptor of theirs can have reached the sink. (The row does NOT also require
        // `dropped === 0` here: the ruling forbids APPLYING or EMITTING before the answer, not judging, and a design that drops
        // a window frame the instant the head it is measured against is known satisfies `ASM-B4-5` — this row must not outlaw it.)
        if (feed.census()?.applied !== 0) problems.push(`a11: ${String(feed.census()?.applied)} window frame(s) were APPLIED before the re-read answered — nothing is applied until the coverage is proven`)
        if (sink.named('window-99').length + sink.named('window-100').length !== 0) problems.push('a11: a window frame reached the sink before the re-read answered')
        await settled()
        const census = feed.census()
        if (sink.calls.filter((d) => d.nodeIds.includes('reconciled')).length !== 1) {
          problems.push('a11: the re-read\'s answer never reached the sink — then the drop below would be a loss, not a duplicate')
        }
        if (census?.applied !== 0) problems.push(`a11: ${String(census?.applied)} window frame(s) were applied — §2.3 drops every frame at or below the announced head`)
        if (census?.dropped !== 2) problems.push(`a11: \`dropped\` read ${String(census?.dropped)} for a two-frame window at/below the head — exactly two are required`)
        if (sink.named('window-99').length + sink.named('window-100').length !== 0) problems.push('a11: a replayed window frame reached the sink — it is a duplicate of the re-read, never a second delivery')
        // AND THE BOUNDARY: what the tail frames ABOVE the head is applied exactly once, and moves the position.
        double.frame('change', changeFrame({ cursor: '101', nodeIds: ['beyond'] }))
        if (sink.named('beyond').length !== 1) problems.push('a11: a frame BEYOND the announced head was not applied — the drop is bounded above, never unbounded')
        if (feed.status()?.position !== 101) problems.push(`a11: \`status().position\` read ${String(feed.status()?.position)} — the above-head frame advances it to 101`)
      } catch (err) {
        problems.push(`a11: driving threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `a11:\n${problems.join('\n')}`).toEqual([])
  })

  it('a12 — a RETIRED connection can neither settle a LIVE successor nor apply a held frame mid-drain (`F-10`, this pass)', async () => {
    // THIS PASS'S OWN HOST FINDING, REPAIRED AND REGRESSED HERE (RCA-3). `close()` retires a connection by bumping the generation
    // and clearing `live`; the injected `sse` seam promises callbacks, NOT their silence after `close()`. So two things must hold:
    //   (i) a late `onError`/`onClose` from the retired socket may not write the FEED's `connected`/`failure` — otherwise a
    //       healthy successor reports `connected: false` and a typed failure naming a close that belonged to a dead socket;
    //   (ii) a sink that retires the feed from INSIDE the answer's drain must stop the drain, because a retired connection's
    //       frames are never applied — the same gate `applyFrame` puts in front of a live frame.
    const problems: string[] = []
    const mod = await loadChangesModule()
    problems.push(...mod.problems)
    if (mod.createEngineChangesFeed !== null) {
      // (i) THE LATE TERMINAL CALLBACK.
      const double = new SseFrameDouble()
      const sink = recordingSink()
      const feed = mod.createEngineChangesFeed({
        baseUrl: BASE_URL,
        sse: double,
        reconcile: async () => ({ kind: 'structural' as const, nodeIds: ['reconciled'], edgeIds: [], store: 'gnosis:engine' }),
        onChange: sink.sink,
      }) as Feed
      try {
        await feed.connect()
        feed.close()
        await feed.connect()
        announceAt(double, '0', 1)
        await settled()
        // The RETIRED socket's terminal callbacks, fired on purpose.
        double.end(0)
        double.fail(new Error('late fault from a socket nobody holds'), 0)
        const afterLate = feed.status()
        if (afterLate?.connected !== true) {
          problems.push('a12: a RETIRED connection\'s terminal callback settled the LIVE feed (`connected` read false) — one sink/socket fault is its own')
        }
        if (afterLate?.failure !== null && afterLate?.failure !== undefined) {
          problems.push(`a12: a RETIRED connection's callback wrote a typed failure onto the live feed (${String(afterLate.failure)})`)
        }
        double.frame('change', changeFrame({ cursor: '1', nodeIds: ['still-live'] }), 1)
        if (sink.named('still-live').length !== 1) problems.push('a12: the live connection stopped applying frames after a retired socket\'s callback')
      } catch (err) {
        problems.push(`a12: driving the late-callback arm threw (${err instanceof Error ? err.message : String(err)})`)
      }

      // (ii) THE MID-DRAIN RETIRE, WITH ITS OWN CONTROL: the SAME three held frames are drained twice — once with the sink retiring
      // the feed on the first one, once with no retire. Without the liveness re-check inside the drain, the retired arm applies
      // all three and this row reds; with it, the retire stops the drain at exactly the frame that triggered it.
      const drainWith = async (retireOn: string | null): Promise<string[]> => {
        const double2 = new SseFrameDouble()
        const order: string[] = []
        const feed2 = mod.createEngineChangesFeed({
          baseUrl: BASE_URL,
          sse: double2,
          reconcile: async () => ({ kind: 'structural' as const, nodeIds: ['reconciled'], edgeIds: [], store: 'gnosis:engine' }),
          onChange: (descriptor: { nodeIds: string[] }) => {
            const name = descriptor.nodeIds[0] ?? '(none)'
            order.push(name)
            if (retireOn !== null && name === retireOn) feed2.close()
          },
        }) as Feed
        await feed2.connect()
        announceAt(double2, '5')
        double2.frame('change', changeFrame({ cursor: '6', nodeIds: ['held-1'] }))
        double2.frame('change', changeFrame({ cursor: '7', nodeIds: ['held-2'] }))
        double2.frame('change', changeFrame({ cursor: '8', nodeIds: ['held-3'] }))
        await settled()
        return order
      }
      try {
        const controlled = await drainWith(null)
        if (JSON.stringify(controlled) !== JSON.stringify(['reconciled', 'held-1', 'held-2', 'held-3'])) {
          problems.push(`a12: the undisrupted drain read ${JSON.stringify(controlled)} — the three held frames must reach the sink in arrival order, so the retired arm below is not vacuous`)
        }
        const retired = await drainWith('held-1')
        if (JSON.stringify(retired) !== JSON.stringify(['reconciled', 'held-1'])) {
          problems.push('a12: a close() from INSIDE the drain still applied the frames behind it (order ' + JSON.stringify(retired) + ') — a retired connection applies NOTHING, and the drain needs the same liveness gate as a live frame')
        }
      } catch (err) {
        problems.push(`a12: driving the mid-drain arm threw (${err instanceof Error ? err.message : String(err)})`)
      }
    }
    expect(problems, `a12:\n${problems.join('\n')}`).toEqual([])
  })
})
