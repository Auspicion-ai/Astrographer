// tests/unit/record-engine/display-client.test.ts — unit `B-1` `record-engine-seam`'s renderer half: THE CLIENT THAT HOLDS THE
// SHAPE (`src/renderer/display-client.ts`, §3's third bullet, §4 site 6).
//
// **IT IS RED ON ARRIVAL AND THAT IS THE RED-FIRST EVIDENCE** (RCA-1): `createDisplayClient` does not exist at this head, so the
// import fails and the run reds with it. No line here moves to make the tree compile.
//
// **WHAT THE CLIENT IS, IN §3's OWN WORDS**: it "holds the shape, answers **synchronously** (`reading()`, `displayOf(tabId)`),
// **`fill()`** is the one stated boot read, and **`subscribe(handler)` registers on the port's arity-0 change route and RE-READS
// INSIDE THE LISTENER** … every absent arm — no port, no member, no route, a throwing registration — is a declared
// `subscribed: false` and never a throw". The discipline it ports is `view-client.ts:670-708`'s, one realm up: the PUSH CARRIES
// NO VALUE AND NO ADDRESS, the re-read's answer REPLACES the shape, and a consumer that keeps its own copy of a value is a cache
// the design forbids.
//
// **THE SUBSCRIPTION SHAPE IS PINNED AND NOTHING BELOW TOLERATES A VARIANT** (§3): `{subscribed: boolean; reason: string | null;
// release: () => void}` — the foundation's `ViewSubscription` — and the four absent arms are FOUR WORDS and never one:
// `no-port` · `no-read-route` · `no-changed-route` · `register-threw`, each `subscribed: false` with THAT exact `reason` and a
// `release` that is callable and total. The rows below assert the words themselves rather than a "some string" reading, so a
// client that folded two faults into one word, or renamed one, reds here — the spellings are the contract's and this file is
// quoting them, not minting them. **PRECEDENCE IS NOT ASSERTED**: no row here drives a port missing BOTH routes, because which
// fault wins when two stand at once is a question §3 does not answer (§9's open point, recorded in this unit's report).
//
// **THE PORT'S OWN MEMBER NAMES ARE THE ONE THING §3 DOES NOT SPELL, AND THIS PARAGRAPH IS THE ROW'S DISCLOSURE.** The client is
// handed "the port"; `forking.md` §3.4 says a delivery source mints its own half and the renderer's is the client's `subscribe`
// + `fill`, and the shape this fork already has is the renderer member's own — `member.read` is the read route and
// `member.onChanged` is the arity-0 change route (`../Provident-Electron/src/renderer/view-client.ts:515-518`, `:676-679`). So
// this row drives a port of exactly that shape, and the row's subject is the DISCIPLINE and not the spelling: the port's `read`
// answers the record's OWN answer (`record.read()`), passed through untouched, because the bridge half that serialises it is
// `B-2`'s and no part of it is this unit's.
//
// **AND WHY THE PORT WRAPS A REAL STORE AND A REAL RECORD RATHER THAN A HAND-WRITTEN FIXTURE**: the client's reading has a shape
// §3 does not spell either, so a fabricated payload would make this row a second authority for it. Driving `record.read()`
// through the port makes every assertion below a reading of VALUES THE TEST WROTE THROUGH THE RECORD — the document stamp it
// committed, the tab id it wrote to — and never of a shape this file invented.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT that `fill()` writes nothing — `delivery.test.ts` and
// `display-record.test.ts` own the cadence and the standing bytes; NOT the delivery's fan-out order, its sink or its arity
// (`delivery.test.ts` `(a)`/`(c)` owns those, and the CLIENT never sees an address at all); NOT the entry admission, which is
// `display-admission.test.ts`'s; NOT the family object, which is `family-object.test.ts`'s `FH-3`; and NOT the bridge member's
// own name, channel or pre-window hold — that is `B-2`'s (`docs/L1/unit-b-1-record-engine-seam.md` §1 scope ruling 1).
//
// LAYER: `[T]`/envelope. The client returns a READING and never a node (§7's `RR-F1`), so nothing here paints and nothing here is
// app-green.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { createDisplayClient } from '../../../src/renderer/display-client.js'
import { createDisplayDelivery } from '../../../src/main/record-engine/delivery.js'
import { createDisplayRecord } from '../../../src/main/record-engine/record.js'
import { DISPLAY_ADDRESS, DISPLAY_TIER } from '../../../src/main/record-engine/display-family.js'
import { createProfileStore } from '../../../src/main/storeroom.js'

/** One value's byte spelling — the reading "the subscriber received the RE-READ" is taken as a substring of a document stamp
 *  this row wrote, and a stamp is a value, not a shape the module exports. */
const jsonOf = (value: unknown): string => JSON.stringify(value)

/** One microtask-boundary turn, so this row is indifferent to whether the client's `fill()` answers a promise or a value: a
 *  sync client has already pushed by the time the timer fires, and an async one has been drained by it. */
const tick = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0)
  })

/** THE PORT THIS ROW DRIVES, TYPED BY THE FACTORY'S OWN PARAMETER so the row is not a second spelling of the port's type. */
type DisplayPort = Parameters<typeof createDisplayClient>[0]
const portOf = (value: unknown): DisplayPort => value as DisplayPort

/** The tab and the two document stamps this row writes: the OLD one is served by the first `fill()`, the NEW one by the
 *  delivery's re-read. Both are this file's own fixtures. */
const A_TAB = 'tab-a'
const OLD_DOCUMENT = 'doc-before'
const NEW_DOCUMENT = 'doc-after'

let tempDir = ''
let filePath = ''
let record: ReturnType<typeof createDisplayRecord>

beforeAll(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'record-engine-display-client-'))
  filePath = join(tempDir, 'profile.store')
  const delivery = createDisplayDelivery(() => undefined)
  const store = createProfileStore({
    filePath,
    listeners: [...delivery.entries],
    constraints: [],
  })
  record = createDisplayRecord({ store, delivery })
  // THE FAMILY IS SEEDED BY HAND: this row's subject is the CLIENT, and leaning on the creation repair would make it red for
  // the `(d)` row's fault. The tier is the family's own exported constant.
  store.write([...DISPLAY_ADDRESS], DISPLAY_TIER, {})
  const first = record.commitTab(A_TAB, { documentId: OLD_DOCUMENT, view: { offset: 0, section: 'sec-0' } })
  expect(first, 'the row’s own seed write lands, or every reading below is about nothing').toMatchObject({ ok: true })
})

afterAll(() => {
  if (tempDir !== '') rmSync(tempDir, { recursive: true, force: true })
})

/** A port over the record's own read, with a counting read route and a recorded change route — the two halves §3 says the client
 *  registers against, and the counter is what makes "a re-read happened INSIDE the listener" a reading rather than a claim. */
interface CountingPort {
  readonly port: { read: () => unknown; onChanged: (handler: () => void) => unknown }
  readonly reads: () => number
  readonly handlers: () => readonly (() => void)[]
}

function countingPort(): CountingPort {
  let reads = 0
  const handlers: (() => void)[] = []
  return {
    port: {
      read: () => {
        reads += 1
        return record.read()
      },
      onChanged: (handler: () => void) => {
        handlers.push(handler)
        return () => undefined
      },
    },
    reads: () => reads,
    handlers: () => [...handlers],
  }
}

describe('record-engine · the display client — a synchronous shape, ONE stated read, an arity-0 change route that RE-READS, and four absent arms that never throw', () => {
  it('CL-1 · `fill()` IS THE ONE STATED READ — the shape is empty before it, and each call is exactly ONE read of the port', async () => {
    const counting = countingPort()
    const client = createDisplayClient(portOf(counting.port))
    // BEFORE THE ONE STATED READ THE CLIENT HOLDS NO ENTRY — the same `null` an absent member answers, so this is one reading and
    // not a special case.
    expect(client.displayOf(A_TAB), 'nothing has been read, so no entry is held for the tab — the accessor answers `null`, not a throw').toBeNull()
    expect(counting.reads(), 'and holding nothing costs no read: the client does not read at construction').toBe(0)

    await client.fill()
    expect(counting.reads(), '`fill()` is the ONE stated read: it reads the port exactly once and no more').toBe(1)
    expect(client.reading(), 'and it leaves the shape filled, so `reading()` answers rather than `null`').not.toBeNull()
    expect(
      jsonOf(client.displayOf(A_TAB)),
      'the entry the record holds for the tab is the entry the client holds — the document stamp this row committed',
    ).toContain(OLD_DOCUMENT)

    await client.fill()
    expect(counting.reads(), 'a second `fill()` is a second read — the boot read is stated, not once-only').toBe(2)
  })

  it('CL-2 · THE READS ARE SYNCHRONOUS AND COME OFF THE SHAPE — `reading()` and `displayOf()` never touch the port', async () => {
    const counting = countingPort()
    const client = createDisplayClient(portOf(counting.port))
    await client.fill()
    const readsAfterFill = counting.reads()
    const first = client.displayOf(A_TAB)
    const second = client.displayOf(A_TAB)
    const readingFirst = client.reading()
    const readingSecond = client.reading()
    expect(counting.reads(), 'two accessor calls and two shape reads cost the port NOTHING: the shape is held, not re-fetched').toBe(readsAfterFill)
    expect(jsonOf(second), 'the second call answers the same entry as the first — the held shape does not change under a reader').toBe(jsonOf(first))
    expect(jsonOf(readingSecond), 'and the reading is held too, so two calls answer one reading').toBe(jsonOf(readingFirst))
    expect(client.displayOf('no-such-tab'), 'an absent tab is a LAWFUL absence and answers `null` — never a placeholder entry and never a throw').toBeNull()
  })

  it('CL-3 · `subscribe` REGISTERS ON THE PORT’S ARITY-0 CHANGE ROUTE AND RE-READS INSIDE THE LISTENER', async () => {
    const counting = countingPort()
    const client = createDisplayClient(portOf(counting.port))
    await client.fill()
    const received: unknown[] = []
    const subscription = client.subscribe((reading) => {
      received.push(reading)
    })
    expect(subscription.subscribed, 'the port carries a change route, so the subscription is DECLARED as subscribed').toBe(true)
    expect(
      subscription.reason,
      'a SUBSCRIBED arm carries NO reason (§3 pins `reason: string | null`): the null arm is the subscribed one, and a word here would make the two arms indistinguishable',
    ).toBeNull()
    expect(typeof subscription.release, 'and a withdrawal is answered in every arm, so a caller never guards before releasing').toBe('function')
    expect(counting.handlers().length, 'the client registered exactly ONE handler on the port’s change route').toBe(1)
    const registered = counting.handlers()[0]
    expect(
      registered.length,
      'the handler the client hands the port takes NO ARGUMENTS: the push carries no value and no address, so a handler reading a first argument would read `undefined` (§7’s D-26 item 1, one register down)',
    ).toBe(0)

    // THE STORE MOVES BETWEEN THE `fill()` AND THE PUSH, so "the reading the subscriber receives is the RE-READ's" is measurable:
    // a client that handed back its held shape would answer the OLD stamp.
    const rewritten = record.commitTab(A_TAB, { documentId: NEW_DOCUMENT, view: { offset: 0, section: 'sec-0' } })
    expect(rewritten, 'the row’s own second commit lands, so the re-read has a new answer to bring back').toMatchObject({ ok: true })
    const readsBeforePush = counting.reads()
    registered()
    await tick()
    expect(counting.reads(), 'the listener RE-READS: one delivery is one read of the port, fired from inside the change handler').toBe(readsBeforePush + 1)
    expect(received.length, 'and the subscriber is handed exactly one reading for one delivery').toBe(1)
    expect(
      jsonOf(received[0]),
      'the subscriber receives the RE-READ’s reading and never the shape the client was holding before the push — the new stamp, not the old',
    ).toContain(NEW_DOCUMENT)
    expect(jsonOf(received[0]), 'and the replaced stamp is GONE from what the subscriber was handed: the shape was REPLACED, not merged').not.toContain(
      OLD_DOCUMENT,
    )
    expect(jsonOf(client.reading()), 'the client’s held shape is the re-read’s answer as well, so the state and the event cannot disagree').toContain(
      NEW_DOCUMENT,
    )

    // THE WITHDRAWAL IS IDEMPOTENT AND RUNS NO STORE VERB: it registers nothing further and a second call is not an error.
    subscription.release()
    expect(() => subscription.release(), 'a second release is lawful — the withdrawal is idempotent by declaration').not.toThrow()
    expect(counting.handlers().length, 'and releasing withdraws nothing the port was never asked to hold for anyone else').toBe(1)
  })

  it('CL-4 · ABSENT — NO PORT: `subscribed: false`, `reason` is exactly `no-port`, and no accessor throws', async () => {
    const client = createDisplayClient(portOf(null))
    const subscription = client.subscribe(() => undefined)
    expect(subscription.subscribed, 'a client with no port is a DECLARED absence and never a throw').toBe(false)
    expect(subscription.reason, 'the ABSENT arm’s own word (§3 pins the four: `no-port` · `no-read-route` · `no-changed-route` · `register-threw`)').toBe(
      'no-port',
    )
    expect(() => subscription.release(), 'the withdrawal exists in the absent arm and does nothing').not.toThrow()
    // `fill()` MAY ANSWER A VALUE OR A PROMISE AND THIS ROW IS INDIFFERENT TO WHICH (§3 states the read, not its arity); what it is
    // not indifferent to is a THROW, so the two outcomes are read as outcomes rather than as a return type.
    const fillOutcome = await Promise.resolve()
      .then(() => client.fill())
      .then(
        () => 'answered',
        () => 'threw',
      )
    expect(fillOutcome, '`fill()` with no port ANSWERS rather than throwing — the absent arm is total').toBe('answered')
    expect(() => client.reading(), 'and the shape accessors stay total: nothing to read is a reading, not an error').not.toThrow()
    expect(client.displayOf(A_TAB), 'with no port and no shape there is no entry, which is the `null` arm and not a placeholder').toBeNull()
  })

  it('CL-5 · ABSENT — A PORT WITH NO READ ROUTE: `subscribed: false` with its own word `no-read-route`, and the withdrawal is total', () => {
    // THE MEMBER EXISTS AND ITS CHANGE ROUTE IS REAL: what is missing is the route the listener’s RE-READ would take, and §3 makes
    // that a different absence from a missing port and from a missing change route. A subscription that registered here would
    // promise a re-read it could never perform — which is why the word is the READ route’s and not the change route’s.
    const client = createDisplayClient(
      portOf({
        onChanged: () => () => undefined,
      }),
    )
    const subscription = client.subscribe(() => undefined)
    expect(subscription.subscribed, 'a member with no readable route is a DECLARED absence, never a throw').toBe(false)
    expect(subscription.reason, 'and the word is the READ route’s own — `no-read-route`, never `no-changed-route`').toBe('no-read-route')
    expect(() => subscription.release(), 'the withdrawal exists in this arm too and runs no store verb').not.toThrow()
    expect(() => subscription.release(), 'and a second release is still lawful: the absent arm’s release is total').not.toThrow()
  })

  it('CL-6 · ABSENT — A PORT WITH NO CHANGE ROUTE: `subscribed: false` with its own word `no-changed-route`', () => {
    // The port reads, and the client can still fill from it — what is missing is the ROUTE the subscription registers on, which is a
    // different absence from having no port at all and from having no read route.
    const counting = countingPort()
    const withoutRoute = { read: counting.port.read }
    const client = createDisplayClient(portOf(withoutRoute))
    const subscription = client.subscribe(() => undefined)
    expect(subscription.subscribed, 'no change route on the member is a declared absence, never a throw').toBe(false)
    expect(subscription.reason, 'and the word is the change route’s own — never `no-port` and never `no-read-route`').toBe('no-changed-route')
    expect(() => subscription.release(), 'the withdrawal is present in this arm too').not.toThrow()
  })

  it('CL-7 · ABSENT — A REGISTRATION THAT THROWS: `subscribed: false` with its own word `register-threw`, and the throw does not escape', () => {
    const counting = countingPort()
    const throwing = {
      read: counting.port.read,
      onChanged: () => {
        throw new Error('the bridge refused the registration')
      },
    }
    const client = createDisplayClient(portOf(throwing))
    let subscription: ReturnType<typeof client.subscribe> | null = null
    expect(() => {
      subscription = client.subscribe(() => undefined)
    }, 'a registration that threw is CONTAINED: the client answers an absence instead of propagating the port’s throw').not.toThrow()
    expect(subscription, 'and it answered an absence rather than nothing').not.toBeNull()
    expect(subscription?.subscribed, 'a registration that threw is not a subscription').toBe(false)
    expect(subscription?.reason, 'and the word is the registration’s own fault — `register-threw`').toBe('register-threw')
    expect(() => subscription?.release(), 'releasing an arm that never registered does nothing and throws nothing').not.toThrow()
  })

  it('CL-8 · THE FOUR ABSENT ARMS ARE FOUR DISTINCT WORDS — `no-port` · `no-read-route` · `no-changed-route` · `register-threw`, each `subscribed: false` with its own `reason` and a total `release`', () => {
    // §3 names the four absent arms separately and pins ONE WORD PER FAULT, and a client that folded them into one word would make
    // the caller unable to tell a wiring fault from a refusal. **THE WORDS ARE THE CONTRACT'S**: this row asserts the whole set, so
    // it reds both on a folded pair and on a renamed arm — the per-arm rows above assert each word where the fault is caused, and
    // this one asserts that the four together are exactly four.
    const counting = countingPort()
    const arms = [
      { fault: 'no port', subscription: createDisplayClient(portOf(null)).subscribe(() => undefined) },
      {
        fault: 'no read route',
        subscription: createDisplayClient(
          portOf({
            onChanged: () => () => undefined,
          }),
        ).subscribe(() => undefined),
      },
      {
        fault: 'no change route',
        subscription: createDisplayClient(portOf({ read: counting.port.read })).subscribe(() => undefined),
      },
      {
        fault: 'a registration that throws',
        subscription: createDisplayClient(
          portOf({
            read: counting.port.read,
            onChanged: () => {
              throw new Error('the bridge refused the registration')
            },
          }),
        ).subscribe(() => undefined),
      },
    ]
    arms.forEach((arm) => {
      expect(arm.subscription.subscribed, `every absent arm is \`subscribed: false\`, and this one is the ${arm.fault} arm`).toBe(false)
      expect(typeof arm.subscription.release, `and every absent arm answers a withdrawal: the ${arm.fault} arm`).toBe('function')
      expect(() => arm.subscription.release(), `and it is TOTAL — releasing the ${arm.fault} arm throws nothing`).not.toThrow()
    })
    const reasons = arms.map((arm) => arm.subscription.reason)
    expect(reasons.every((reason): reason is string => typeof reason === 'string'), `every absent arm STATES its reason: read ${jsonOf(reasons)}`).toBe(true)
    const distinct = [...new Set(reasons)]
    expect(distinct.length, `four faults must not answer fewer than four words: read ${jsonOf(reasons)}`).toBe(4)
    expect(
      distinct.sort(),
      'and the four words are the CONTRACT’s, one per fault, with no second spelling in the set',
    ).toEqual(['no-changed-route', 'no-port', 'no-read-route', 'register-threw'])
  })
})
