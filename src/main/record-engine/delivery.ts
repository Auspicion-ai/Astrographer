// src/main/record-engine/delivery.ts — THE `display` FAMILY'S DELIVERY: the entries a construction adopts, and the fan-out a
// subscriber takes (`docs/L1/unit-b-1-record-engine-seam.md` §3's second bullet, §4 site 4). Ported by hand from the foundation's
// `ViewDelivery`/`ViewDeliveryEntry`/`createViewDelivery` (`../Provident-Electron/src/main/view-record/index.ts:1522-1595` at our
// pin `b312d83`).
//
// **THE DELIVERY IS BUILT BEFORE THE STORE, AND THAT ORDER IS THE POINT**: a creation delivery must have a destination from the
// instant a repair writes, so `entries` is what the caller hands the one construction (`cfg.listeners`) and `subscribe` is the
// fan-out a later consumer takes.
//
// **THE ENTRY'S BODY IS ONE ACT AND TWO GUARANTEES, AND EACH IS A RULE RATHER THAN A STYLE:**
//   1. **IT WRITES NOTHING.** A listener body's write opens a commit of its own inside the one that fired it, so a body that wrote
//      would make one event two commits and could refuse the act that fired it.
//   2. **IT CONTAINS ITS OWN THROW.** At a registration instant an uncontained throw refuses the act at the store's rank-21
//      `ListenerBodyThrew`, which at the creation means the construction refuses and the app takes its fatal arm — so the throw
//      stops HERE, at the body, and a sink's failure stays the sink's.
//
// **THE ORDER INSIDE THE BODY IS THE FAN-OUT FIRST, THEN THE SINK, AND THE TWO CANNOT DISAGREE**: a standing subscriber hears the
// delivery first and the caller's own sink is called after it, on every delivery — so a subscriber's calls and a sink's calls are
// two readings of ONE event and never two code paths through different code. **AND A THROWING SUBSCRIBER STARVES NO SIBLING**: it
// is contained at the fan-out, one handler at a time, because the family moved and the delivery happened.
//
// **THE ADDRESS THE SINK IS HANDED IS THE TRIGGERING ADDRESS AND USUALLY A LEAF** — a write at `['display', <tabId>]` delivers
// `['display', <tabId>]`, never the registered root (measured on the installed release, and the one arm the delivery's own row
// measures) — so a consumer routes on a PREFIX of what it is handed and never on equality with the root literal. **IT CARRIES NO
// VALUE AND NO READING**, and a SUBSCRIBER is handed NOTHING AT ALL and is called at ARITY ZERO: the push is a signal, and every
// consumer's only correct answer to it is its own re-read.
//
// **AND THE HANDLES ARE MINTED HERE AND NEVER WITHDRAWN**: the entry the construction adopts is the instance's for the instance's
// life, so no second subscriber can be starved by a shared spelling — while the ordinal prefix keeps a handle from ever equalling a
// constraint `id`, which is the one cross-kind rule the store leaves to its callers.

import { DISPLAY_ADDRESS } from './display-family.js'

/**
 * **THE ONE ADDRESS THIS DELIVERY CARRIES, AND IT IS DELIBERATELY NOT DERIVED FROM THE FAMILY TUPLE.** `DISPLAY_FAMILIES` is the
 * object's list and this array is the delivery's; if the delivery read the tuple, the entries↔roots row would compare the tuple with
 * itself and prove nothing. **This is the list `D-137`'s rule bites** — *"a root the array omits is a write the renderer never
 * hears"* — so a family added to this module must add its address HERE, in the SAME EDIT as its spec, and the two rows red on a
 * half-edit rather than on a sympathetically green pair.
 */
const DISPLAY_DECLARED_ADDRESSES: readonly (readonly string[])[] = [DISPLAY_ADDRESS]

/** **ONE ADOPTED LISTENER ENTRY — THREE OWN MEMBERS WITH THE THIRD REQUIRED.** A two-member element is refused `AddressMalformed` by
 *  the store BEFORE any filesystem act (measured), so this is not a shape a caller may thin: `address` is ONE address, `handle` the
 *  string minted below for it, and `listener` the function the adopted handle fires with the triggering address as its one
 *  argument. **It carries NO VALUE and never a reading.** */
export interface DisplayDeliveryEntry {
  readonly address: readonly string[]
  readonly handle: string
  readonly listener: (address: readonly string[]) => void
}

/** **THE FAMILY'S DELIVERY — TWO HALVES OF ONE THING, BUILT BEFORE THE STORE EXISTS.** `entries` is what the caller's one
 *  construction adopts; `subscribe` is the fan-out a later consumer takes and runs no store verb, because the one registration per
 *  address is the construction's. */
export interface DisplayDelivery {
  readonly entries: readonly DisplayDeliveryEntry[]
  subscribe(handler: () => void): () => void
}

/** The handle counter — a MINTED ordinal, never a derivation: `register` REPLACES the function under a handle and a withdrawal
 *  takes the handle WHOLE, so a re-used spelling would starve a second subscriber. The fixed `record-engine:` prefix is what makes
 *  a handle unable to equal any constraint `id`. */
let issuance = 0

/** One handle: the module's prefix, the ordinal, and the address the handle is bound at. */
const handleFor = (address: readonly string[]): string => {
  issuance += 1
  return 'record-engine:' + String(issuance) + '@' + address.join('/')
}

/**
 * **THE DELIVERY THE CALLER BUILDS BEFORE THE STORE AND HANDS TO IT.** `sink` is the caller's TOTAL, UNINTERPRETED destination: it
 * is handed the ADDRESS the delivery carried — no reading, no family, no formatted value — and the only correct answer to it is the
 * consumer's own re-read.
 *
 * The fan-out walks a COPY of the handler list (`[...handler]`), so a handler that withdraws itself or registers another during a
 * delivery cannot change the set the current event is served to, and each call is contained on its own so one thrower loses only its
 * own call. The sink is called AFTER that walk and is NOT contained here: the entry body's own arm is what contains it, one frame up,
 * which is the guarantee the construction depends on.
 *
 * **A NESTED DELIVERY IS COALESCED, NEVER RECURSED** (`B1-ADV-08`, MEASURED: a subscriber that writes re-entered the fan-out once per
 * write and the chain was UNBOUNDED — 380 levels produced a `RangeError` inside the fan-out, the delivery was truncated, and the
 * outer write still answered `{ok: true}` because the entry body contains its own throw, so the failure was invisible to its caller).
 * The push is a SIGNAL and a signal's only correct answer is a re-read (`D-82`), so a delivery that arrives while a fan-out is in
 * flight does not recurse into it: it sets a pending flag, and the OUTER fan-out runs ONE more pass after its sink, addressed at the
 * delivery that asked. Any further nesting during that second pass is dropped, and that is correct rather than lossy — the consumer's
 * re-read reads the store's CURRENT state, so a third push inside the same coalesced window carries no fact the first two did not.
 * **The bound is therefore two passes for any amount of re-entrancy, and the count is what this module's battery measures.**
 */
export function createDisplayDelivery(sink: (address: readonly string[]) => void): DisplayDelivery {
  // THE FAN-OUT'S OWN LIST: one entry per subscriber, appended and dropped locally, and never a store act.
  const handlers: (() => void)[] = []
  // THE COALESCING STATE: whether a fan-out is in flight, whether a delivery arrived during it, and WHICH address the last of those
  // deliveries named — the second pass is addressed at the delivery that asked, not at the one that happened to fire first.
  let inFlight = false
  let pending = false
  let pendingAddress: readonly string[] | null = null
  /** ONE PASS: the fan-out first, then the sink — the order that makes a subscriber's calls and a sink's calls two readings of one
   *  event rather than two code paths. */
  const pass = (address: readonly string[]): void => {
    for (const handler of [...handlers]) {
      try {
        // ARITY ZERO, AND THAT IS THE CONTRACT: the push carries no value and no address, so a handler that reads a first
        // argument would be reading `undefined`.
        handler()
      } catch {
        // THE CALLER'S THROW STOPS AT THE FAN-OUT: the family moved and the delivery happened, and a subscriber's own failure is
        // the subscriber's.
      }
    }
    sink(address)
  }
  const notify = (address: readonly string[]): void => {
    if (inFlight) {
      // COALESCED, NOT RECURSED: the pass in flight will run ONE more after its sink.
      pending = true
      pendingAddress = address
      return
    }
    inFlight = true
    try {
      pass(address)
      if (pending) {
        const addressOwed = pendingAddress ?? address
        pending = false
        pendingAddress = null
        pass(addressOwed)
      }
    } finally {
      // THE WINDOW CLOSES HERE, and any nesting that asked during the second pass is dropped with it (see the note above: its fact is
      // the re-read's, and the re-read has not happened yet at this depth).
      inFlight = false
      pending = false
      pendingAddress = null
    }
  }

  const entries: DisplayDeliveryEntry[] = DISPLAY_DECLARED_ADDRESSES.map((address) => ({
    address,
    handle: handleFor(address),
    listener: (delivered: readonly string[]): void => {
      try {
        notify(delivered)
      } catch {
        // THE ENTRY CONTAINS ITS OWN THROW: an uncontained one would refuse the act that fired it at the store's rank 21.
      }
    },
  }))
  return {
    entries,
    subscribe(handler: () => void): () => void {
      // ONE ENTRY APPENDED TO ONE LIST AND ONE REMOVAL RETURNED: the withdrawal is LOCAL, IDEMPOTENT and runs no store verb — the
      // registration the construction adopted is not this subscription's to withdraw.
      handlers.push(handler)
      let live = true
      return () => {
        if (!live) return
        live = false
        const at = handlers.indexOf(handler)
        if (at >= 0) handlers.splice(at, 1)
      }
    },
  }
}
