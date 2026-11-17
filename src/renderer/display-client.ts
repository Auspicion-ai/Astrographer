// src/renderer/display-client.ts — THE RENDERER HALF: the client that HOLDS THE SHAPE (`docs/L1/unit-b-1-record-engine-seam.md`
// §3's fourth/fifth bullets, §4 site 6). Ported by hand from the foundation's `ViewSubscription`/`subscribe` discipline
// (`../Provident-Electron/src/renderer/view-client.ts:670-708`, `:214` at our pin `b312d83`), one realm up.
//
// **WHAT THIS FILE IS NOT, SAID FIRST BECAUSE IT IS THE ONE THING THAT COULD GO WRONG**: it holds NO address space, NO persistence,
// NO constraint and NO journal, it reaches no store and no main-process MODULE AT RUN TIME, and it returns a READING and never a
// node: it paints nothing, so a `state-slice` consumer that mounts the answer is a later unit's act and this client cannot
// mount-destroy a node it never authored.
//
// **ONE VALUE IMPORT, AND IT IS THE DISCLOSED DIVERGENCE** (`docs/L2/record-engine/interface.md` §6, `F-R4`): `displayOf` judges an
// entry with the SAME parse the record, the read and the constraint use (`displayEntryIn`, §2's *"ONE parse"*), because a second
// spelling of "an entry" here would be a second authority for the family's shape — the fault `D-43` names. `display-shape.js` is
// PURE (`import`-free, no store, no main-process byte), so nothing travels with it, but the contract's §3 says the renderer half
// takes the payload *"by `import type`"* and this is therefore a divergence rather than a reading of it. The fix is a `src/shared/`
// carrier owned by the unit that holds `src/shared/**` (`B-2`), and until then one parse is worth more than one bundling nicety.
//
// **THE PORT IS STRUCTURAL AND LOCAL.** The realm supplies it: `{ read(): Promise<DisplayReading | null> | DisplayReading | null;
// onChanged(handler: () => void): unknown }` — the member names and the arity the foundation's own client drives, so the bridge
// member a later unit supplies needs no re-cut of this row. Both members are declared OPTIONAL here, and that is not a looseness:
// the four absent arms below are exactly the four ways a port can be missing something, so the type has to admit them. **AND EVERY
// READ OF THOSE MEMBERS IS INSIDE A `try`** (`B1-ADV-05(c)`, measured: a port built with a getter that throws made `subscribe`
// THROW where the contract says the answer is a declared `subscribed: false`): a getter is not a guard, so an accessor that throws is
// an ABSENT ROUTE and never an exception.
//
// **THE DISCIPLINE, AND IT IS ONE SENTENCE WITH FOUR CONSEQUENCES** (`view-client.ts:670-708`'s whole point): THE PUSH CARRIES NO
// VALUE AND NO ADDRESS, SO THE ONLY CORRECT ANSWER TO IT IS A FRESH READ — and the re-read's answer REPLACES the shape, never merges
// into it. So:
//   1. `reading()` and `displayOf(tabId)` are SYNCHRONOUS and come off the held shape; they cost the port NOTHING, because a
//      consumer that re-read on every accessor call is a cache the design forbids in the other direction;
//   2. `fill()` is THE ONE STATED BOOT READ: one call, one read of the port, and each call is a read (it is stated, not once-only);
//   3. `subscribe(handler)` registers an ARITY-ZERO handler on the port's change route whose body RE-READS and hands the caller the
//      reading the re-read answered — the store's own movement between the fill and the push is therefore visible, and the caller
//      cannot be handed the shape the client was holding before it;
//   4. every absent arm — no port, no read route, no change route, a registration that threw — is a DECLARED `subscribed: false`
//      with its OWN word and a total `release`, and never a throw. The four words are the contract's, one per fault, because a
//      client that folded them would leave a caller unable to tell a wiring fault from a refusal.
//
// **AND TWO RULES ABOUT WHAT MAY CHANGE THE SHAPE** (`B1-ADV-04`, both MEASURED as faults):
//   · **A FAILURE IS NOT AN ABSENCE.** `fill()` used to fold every failure into the absent reading and overwrite unconditionally, so
//     a REJECTED re-read ERASED the shape and `displayOf` answered `null` for a tab the client had just read. Only a READING changes
//     what is held; no route, a throw, a rejection and a value that is no plain record all leave the standing shape INTACT. The client
//     cannot tell "the family is gone" from "the read failed", so it prefers the shape it has — clearing is not an arm of this object,
//     and a consumer that wants a clean slate builds a new client.
//   · **AND THE LATEST-STARTED FILL WINS.** The sequence is MONOTONIC: each `fill()` takes a number, and its answer lands only while
//     it is still the newest call. Two overlapping fills therefore end on the one that STARTED last, not on the one that happened to
//     resolve last — which was the other measured way an older answer could win.

import { displayEntryIn, type DisplayEntry, type DisplayFamilyValue } from '../main/record-engine/display-shape.js'

/** **THE SHAPE THE CLIENT HOLDS: one entry per tab id, keyed by the ADDRESS SEGMENT** — the record's own reading, passed through
 *  untouched. The bridge half that serialises it is a later unit's, so this type is an alias and not a second authority. */
export type DisplayReading = DisplayFamilyValue

/** **THE PORT'S TWO MEMBERS, EACH OPTIONAL BECAUSE EACH ABSENCE IS A DECLARED ARM** — `read` is the route the listener's re-read
 *  takes, and `onChanged` is the arity-zero change route the subscription registers on. Nothing else is asked of it. */
export interface DisplayPortMember {
  readonly read?: () => Promise<DisplayReading | null> | DisplayReading | null
  readonly onChanged?: (handler: () => void) => unknown
}

/** A client with no port at all is the `no-port` arm and not an error, so `null` is in this type's domain. */
export type DisplayPort = DisplayPortMember | null

/** **THE SUBSCRIPTION'S ANSWER, AND THE TWO ARMS ARE ONE SHAPE**: `reason` is `null` exactly when `subscribed` is `true`, and a
 *  `release` is answered on EVERY arm — so a caller never guards before withdrawing. */
export interface DisplaySubscription {
  readonly subscribed: boolean
  readonly reason: string | null
  readonly release: () => void
}

/** The client a consumer holds. Every member is total: nothing here throws, at any port and at any argument. */
export interface DisplayClient {
  /** **THE ONE STATED BOOT READ.** One call reads the port exactly once. **It answers the reading that STANDS AFTER THE CALL**: a
   *  successful read replaces the shape and is answered; a failed or absent one leaves the shape intact and the standing reading is
   *  answered instead. A second call is a second read. */
  fill(): Promise<DisplayReading | null>
  /** The held shape, or `null` before the first successful `fill()` — synchronous, and never a read of the port. */
  reading(): DisplayReading | null
  /** One tab's entry off the held shape, or `null` — OWN members only, judged by the family's own parse. */
  displayOf(tabId: string): DisplayEntry | null
  /** Register on the port's arity-zero change route; the body re-reads, replaces the shape and hands the caller that reading. */
  subscribe(handler: (reading: DisplayReading | null) => void): DisplaySubscription
}

/** A withdrawal that withdraws nothing — the absent arms' `release`, total by construction. */
const noop = (): void => undefined

/** **A READING OR NOTHING — never a coerced value.** The port's answer is the record's own reading; anything that is not a plain
 *  record is the FAILED arm rather than a shape this client would have to invent, and `null` here means "no reading arrived", which
 *  leaves the standing shape alone (see the header's first rule). */
const asReading = (held: unknown): DisplayReading | null =>
  held !== null && typeof held === 'object' && !Array.isArray(held) ? (held as DisplayReading) : null

/** **THE CLIENT OVER THE REALM'S PORT** — see the header for the whole discipline. It holds ONE value (`held`), one counter for the
 *  fill sequence, and no cache of anything else: no address, no delivery, no store. */
export function createDisplayClient(port: DisplayPort): DisplayClient {
  const member: DisplayPortMember | null = port !== null && typeof port === 'object' ? port : null
  let held: DisplayReading | null = null
  /** **THE MONOTONIC SEQUENCE**: incremented at the START of every `fill()`, and an answer lands only while its own number is still the
   *  highest. That is what makes the LATEST-STARTED fill the winner instead of the latest-resolved one. */
  let started = 0

  /** The port's read route, or `null` — the ONE place the member is looked for, so `fill` and `subscribe` cannot disagree about
   *  whether a read route exists (which is what makes `no-read-route` the word for a port that HAS a change route and no read). **THE
   *  MEMBER READ IS CONTAINED**: a throwing accessor is a missing route. */
  const readRoute = (): ((...args: never[]) => unknown) | null => {
    if (member === null) return null
    try {
      const route = member.read
      return typeof route === 'function' ? (route as (...args: never[]) => unknown) : null
    } catch {
      return null
    }
  }

  /** The port's change route, or `null` — contained for the same reason as `readRoute`. */
  const changedRoute = (): ((handler: () => void) => unknown) | null => {
    if (member === null) return null
    try {
      const route = member.onChanged
      return typeof route === 'function' ? (route as (handler: () => void) => unknown) : null
    } catch {
      return null
    }
  }

  /** ONE read of the port, contained and normalized. A read that throws, rejects or answers a non-reading is the FAILED arm and
   *  answers `null`; the call itself is made SYNCHRONOUSLY here, so a counting port sees the read at the instant it was asked for. */
  const readOnce = (): Promise<DisplayReading | null> => {
    const route = readRoute()
    if (route === null) return Promise.resolve(null)
    let answer: unknown
    try {
      answer = route.call(member)
    } catch {
      return Promise.resolve(null)
    }
    return Promise.resolve(answer).then(asReading, () => null)
  }

  const fill = (): Promise<DisplayReading | null> => {
    started += 1
    const mine = started
    return readOnce().then((next) => {
      // **ONLY A READING CHANGES THE SHAPE, AND ONLY WHILE THIS CALL IS STILL THE NEWEST** — the two rules of the header, in one
      // guard. A merge would keep the stale member the store no longer states, and an overwrite by a superseded call would let an
      // older answer win.
      if (next !== null && mine === started) held = next
      return held
    })
  }

  const displayOf = (tabId: string): DisplayEntry | null => {
    if (held === null) return null
    if (typeof tabId !== 'string' || tabId.length === 0) return null
    // **OWN MEMBERS ONLY**: the family's key space is its own, and a plain record's inherited members are NOTHING's entry. Without
    // this arm `displayOf('__proto__')` answered `Object.prototype` and `displayOf('constructor')` answered a function — an entry
    // that was never stated, handed to a caller that would have mounted it (`B1-ADV-05(b)`).
    if (!Object.hasOwn(held, tabId)) return null
    // AND THE ENTRY IS JUDGED BY THE FAMILY'S OWN PARSE, because the port is structural and this client trusts no answer it was
    // handed: a member that is no plain record, or whose `documentId` is not a non-empty string, is the `null` arm.
    const admitted = displayEntryIn((held as Record<string, unknown>)[tabId])
    return admitted.ok ? admitted.entry : null
  }

  const subscribe = (handler: (reading: DisplayReading | null) => void): DisplaySubscription => {
    // THE FOUR ABSENT ARMS, IN THE ORDER THE FAULTS ARE REACHED: no port at all, then the route the listener's re-read would take,
    // then the route the subscription registers on. A port missing BOTH routes is the READ route's arm, because a subscription that
    // registered there would promise a re-read it could never perform.
    if (member === null) return { subscribed: false, reason: 'no-port', release: noop }
    if (readRoute() === null) return { subscribed: false, reason: 'no-read-route', release: noop }
    const route = changedRoute()
    if (route === null) return { subscribed: false, reason: 'no-changed-route', release: noop }
    let withdrawn: unknown
    try {
      withdrawn = route.call(member, () => {
        // **THE LISTENER'S WHOLE BODY: ONE RE-READ, ONE REPLACEMENT, ONE CALL TO THE CALLER — and it WRITES NOTHING.** The push
        // carried no value and no address, so the reading handed on is the re-read's (or, after a failed one, the standing reading);
        // a caller's own throw stops at the caller.
        void fill().then((next) => {
          try {
            handler(next)
          } catch {
            /* the caller's handler, the caller's error */
          }
        })
      })
    } catch {
      return { subscribed: false, reason: 'register-threw', release: noop }
    }
    const bridgeWithdrawal = typeof withdrawn === 'function' ? (withdrawn as () => void) : noop
    let live = true
    return {
      subscribed: true,
      reason: null,
      release: () => {
        if (!live) return
        live = false
        try {
          bridgeWithdrawal.call(member)
        } catch {
          /* a withdrawal that threw has still withdrawn nothing further; it never escapes here */
        }
      },
    }
  }

  return { fill, reading: (): DisplayReading | null => held, displayOf, subscribe }
}
