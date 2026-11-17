// tests/integration/record-engine/client-holding.test.ts — the renderer half's own fix-round rows (`B1-ADV-04`, `B1-ADV-05(b)`,
// `B1-ADV-05(c)`): what the client does with a reading it could not get, with two readings that arrive out of order, with a
// reading whose entries are not entries, and with a port whose members THROW when they are read.
//
// **THE THREE FINDINGS THIS FILE CLOSES, EACH WITH ITS MEASUREMENT**:
//   · `B1-ADV-04` (MATERIAL) — **THE CLIENT EMPTIED THE SHAPE AND LET THE OLDER ANSWER WIN.** `fill()` folded every failure into the
//     absent reading and overwrote unconditionally, so a REJECTED re-read ERASED the held shape (`displayOf` answered `null` for a
//     tab the client had just read) and two overlapping fills ended on whichever resolved LAST rather than on whichever STARTED
//     last. A failure is not an absence, and the sequence is monotonic now: the latest-started fill is the one that lands.
//   · `B1-ADV-05(b)` (LOW) — **`displayOf` READ THE PROTOTYPE CHAIN.** `held[tabId]` answered `Object.prototype` for `'__proto__'`
//     and a function for `'constructor'` on an EMPTY shape. It reads own members only (`Object.hasOwn`) and hands an entry out only
//     through the SAME parse that admits one everywhere else.
//   · `B1-ADV-05(c)` (LOW) — **A THROWING PORT ACCESSOR ESCAPED.** `member.read` / `member.onChanged` were read outside any `try`,
//     so a port built with a getter that throws made `subscribe` throw where the contract says the answer is a declared
//     `subscribed: false`. Every read of the port's own members is inside a `try` now.
//
// **NO STORE IS CONSTRUCTED HERE, AND THAT IS DELIBERATE**: every arm below is about the CLIENT's discipline over an answer it was
// handed, so the port is a fixture whose answers this file controls to the microtask. `display-client.test.ts` (L3's) is the file
// that drives a port over a REAL record; the two files are not each other's evidence.
//
// WHAT THIS ROW MUST NOT ASSERT, EACH WITH THE ROW THAT OWNS THE FACT: NOT one stated read per `fill()` call, the synchronous
// accessors, the arity-0 registration or the four absent WORDS (`display-client.test.ts` `CL-1`–`CL-8`); NOT the record, the
// delivery or a store verb (`entry-domain.test.ts`, `delivery.test.ts`); NOT the entry parse's member list
// (`display-admission.test.ts`). **AND IT DOES NOT ASSERT THE FOUR WORDS' PRECEDENCE**, which `CL-8`'s header discloses as an open
// point of §3's.
//
// LAYER: `[T]`/envelope. Nothing here paints and nothing here is app-green.
import { describe, expect, it } from 'vitest'

import { createDisplayClient } from '../../../src/renderer/display-client.js'

/** One value's spelling, for comparisons between two readings of the SAME kind. */
const jsonOf = (value: unknown): string => JSON.stringify(value)

/** One microtask-and-timer turn: this file is indifferent to whether an arm's `fill()` answers a promise or a value. */
const tick = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0)
  })

/** THE PORT TYPE, taken from the factory's own parameter so this file is not a second spelling of it. */
type DisplayPort = Parameters<typeof createDisplayClient>[0]
const portOf = (value: unknown): DisplayPort => value as DisplayPort

/** The tabs and stamps below are this file's own fixtures; the record's are the same members §2 names. */
const A_TAB = 'tab-a'
const ANOTHER_TAB = 'tab-b'
const OLD_DOCUMENT = 'doc-old'
const NEW_DOCUMENT = 'doc-new'
const A_LAWFUL_ENTRY = { documentId: OLD_DOCUMENT }
const ANOTHER_LAWFUL_ENTRY = { documentId: NEW_DOCUMENT }

/** One deferred answer the row resolves when it decides to: this is how "two fills resolve out of order" is made a reading
 *  rather than a race the runner happens to schedule a certain way. */
interface Deferred {
  readonly promise: Promise<unknown>
  readonly settle: (value: unknown) => void
  readonly reject: (reason: unknown) => void
}

function deferred(): Deferred {
  let settle: (value: unknown) => void = () => undefined
  let reject: (reason: unknown) => void = () => undefined
  const promise = new Promise<unknown>((resolve, rejectAnswer) => {
    settle = resolve
    reject = rejectAnswer
  })
  return { promise, settle, reject }
}

describe('record-engine · B1-ADV-04 — a failure is NOT an absence, and the latest-STARTED fill wins', () => {
  it('(client·rejected) · A REJECTED RE-READ LEAVES THE PREVIOUS READING STANDING — the shape is not emptied by a failure', async () => {
    let answer: unknown = { [A_TAB]: A_LAWFUL_ENTRY }
    const client = createDisplayClient(
      portOf({
        read: () => answer,
        onChanged: () => () => undefined,
      }),
    )
    await client.fill()
    expect(client.displayOf(A_TAB), 'the first fill holds the entry the port answered').toEqual(A_LAWFUL_ENTRY)

    // THE FAILURE: every subsequent read REJECTS. A rejection is not a statement about the family — it is the absence of an answer —
    // so the held shape must survive it.
    answer = Promise.reject(new Error('the bridge refused this read'))
    await client.fill()
    expect(
      client.displayOf(A_TAB),
      'a REJECTED re-read must leave the standing entry in place: a failure is not an absence, and emptying the shape here is the ' +
        `finding (held: ${jsonOf(client.reading())})`,
    ).toEqual(A_LAWFUL_ENTRY)
    expect(client.reading(), 'and the whole reading survives it, not only the one tab').toEqual({ [A_TAB]: A_LAWFUL_ENTRY })
  })

  it('(client·threw) · A READ THAT THROWS SYNCHRONOUSLY IS THE SAME ABSENCE — `displayOf` is unchanged across a failed fill', async () => {
    let mode: 'answer' | 'throw' = 'answer'
    const client = createDisplayClient(
      portOf({
        read: () => {
          if (mode === 'throw') throw new Error('the port threw before answering')
          return { [A_TAB]: A_LAWFUL_ENTRY }
        },
        onChanged: () => () => undefined,
      }),
    )
    await client.fill()
    mode = 'throw'
    const outcome = await Promise.resolve()
      .then(() => client.fill())
      .then(
        () => 'answered',
        () => 'threw',
      )
    expect(outcome, 'a throwing read is CONTAINED: `fill()` answers, it does not propagate the port’s throw').toBe('answered')
    expect(client.displayOf(A_TAB), 'and the held entry is untouched by the failed fill').toEqual(A_LAWFUL_ENTRY)
    expect(client.reading(), 'with the reading as a whole unchanged').toEqual({ [A_TAB]: A_LAWFUL_ENTRY })
  })

  it('(client·order) · TWO FILLS RESOLVING OUT OF ORDER END ON THE NEWEST — the OLDER answer must not overwrite the newer one', async () => {
    const first = deferred()
    const second = deferred()
    let call = 0
    const client = createDisplayClient(
      portOf({
        read: () => {
          call += 1
          return call === 1 ? first.promise : second.promise
        },
        onChanged: () => () => undefined,
      }),
    )

    const firstFill = client.fill()
    const secondFill = client.fill()
    // **THE OUT-OF-ORDER RESOLUTION, DRIVEN BY THE ROW AND NOT BY THE SCHEDULER**: the SECOND-STARTED read answers first, and then the
    // first-started one answers — which is exactly the ordering the finding measured as ending on the older answer.
    second.settle({ [A_TAB]: ANOTHER_LAWFUL_ENTRY })
    await secondFill
    first.settle({ [A_TAB]: { documentId: 'doc-stale' } })
    await firstFill
    await tick()

    expect(
      jsonOf(client.reading()),
      'the LATEST-STARTED fill is the winner: the shape must carry the newer reading, and the late-arriving older one must not ' +
        `overwrite it (held: ${jsonOf(client.reading())})`,
    ).toContain(NEW_DOCUMENT)
    expect(jsonOf(client.reading()), 'and the stale reading is nowhere in what the client holds').not.toContain('doc-stale')
    expect(client.displayOf(A_TAB), 'the accessor agrees with the shape').toEqual(ANOTHER_LAWFUL_ENTRY)
  })
})

describe('record-engine · B1-ADV-05(b) — `displayOf` reads OWN members only and hands out only what the SAME PARSE admits', () => {
  it('(client·own-members) · AN ABSENT TAB ANSWERS `null`, NEVER `Object.prototype` — `__proto__`, `constructor`, `prototype`, `toString`', () => {
    const client = createDisplayClient(
      portOf({
        read: () => ({ [A_TAB]: A_LAWFUL_ENTRY }),
        onChanged: () => () => undefined,
      }),
    )
    return client.fill().then(() => {
      // **THE MEASURED FAULT**: on a plain-record reading, `held['__proto__']` IS `Object.prototype` and `held['constructor']` IS a
      // function — so the accessor answered a non-entry for a tab that was never stated, and a consumer would have mounted it.
      ;['__proto__', 'constructor', 'prototype', 'toString', 'hasOwnProperty'].forEach((name) => {
        expect(
          client.displayOf(name),
          `\`displayOf('${name}')\` must answer \`null\`: the name is not an OWN member of the reading, so no tab states it`,
        ).toBeNull()
      })
      expect(client.displayOf(A_TAB), 'while the tab the reading really states answers its entry').toEqual(A_LAWFUL_ENTRY)
      expect(client.displayOf(ANOTHER_TAB), 'and a tab nobody stated answers `null`, which is the lawful absence').toBeNull()
    })
  })

  it('(client·parse) · AN OWN MEMBER THAT IS NO ENTRY ANSWERS `null` — the entry is judged by the SAME parse the family uses', () => {
    const client = createDisplayClient(
      portOf({
        read: () => ({
          [A_TAB]: { documentId: 7 },
          [ANOTHER_TAB]: 'not an entry at all',
          'tab-c': { documentId: NEW_DOCUMENT },
        }),
        onChanged: () => () => undefined,
      }),
    )
    return client.fill().then(() => {
      // A port is STRUCTURAL and this client does not trust it: an answer that is a plain record is a reading, and each MEMBER is an
      // entry only if the family's own parse says so. `{documentId: 7}` is a member out of domain; a string is no record at all.
      expect(client.displayOf(A_TAB), 'an entry whose `documentId` is not a non-empty string is REFUSED by the same parse').toBeNull()
      expect(client.displayOf(ANOTHER_TAB), 'and a member that is no plain record is refused too').toBeNull()
      expect(client.displayOf('tab-c'), 'while a lawful entry is handed out unchanged').toEqual({ documentId: NEW_DOCUMENT })
    })
  })
})

describe('record-engine · B1-ADV-05(c) — the port’s members are read inside a `try`: a throwing accessor is an ABSENT ARM', () => {
  it('(client·accessor·read) · A `read` GETTER THAT THROWS ANSWERS `no-read-route` AND NEVER THROWS', async () => {
    const port = {
      get read(): () => unknown {
        throw new Error('the bridge refused to hand out its read route')
      },
      onChanged: () => () => undefined,
    }
    const client = createDisplayClient(portOf(port))
    expect(() => client.subscribe(() => undefined), 'reading the port’s `read` member must be CONTAINED: a getter is not a guard').not.toThrow()
    const subscription = client.subscribe(() => undefined)
    expect(subscription.subscribed, 'and the answer is the declared absence').toBe(false)
    expect(subscription.reason, 'with the READ route’s own word — the route that threw is the one that is missing').toBe('no-read-route')
    const outcome = await Promise.resolve()
      .then(() => client.fill())
      .then(
        () => 'answered',
        () => 'threw',
      )
    expect(outcome, 'and `fill()` answers as well: the absent arm is total').toBe('answered')
    expect(client.reading(), 'with no reading held, since none was ever read').toBeNull()
  })

  it('(client·accessor·changed) · AN `onChanged` GETTER THAT THROWS ANSWERS `no-changed-route` AND NEVER THROWS', () => {
    const port = {
      read: () => ({ [A_TAB]: A_LAWFUL_ENTRY }),
      get onChanged(): (handler: () => void) => unknown {
        throw new Error('the bridge refused to hand out its change route')
      },
    }
    const client = createDisplayClient(portOf(port))
    let subscription: ReturnType<typeof client.subscribe> | null = null
    expect(() => {
      subscription = client.subscribe(() => undefined)
    }, 'reading the port’s `onChanged` member must be CONTAINED as well').not.toThrow()
    expect(subscription?.subscribed, 'a change route that cannot even be read is not a subscription').toBe(false)
    expect(subscription?.reason, 'and the word is the change route’s own').toBe('no-changed-route')
    expect(() => subscription?.release(), 'with a total withdrawal, as every absent arm has').not.toThrow()
  })
})
