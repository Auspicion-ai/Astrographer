// src/renderer/pane-events.ts — Unit `B-3` `pane-update-channel`: THE CHANNEL (`docs/L1/unit-b-3-pane-update-channel.md`
// §2, `docs/L2/shell-chrome/pane-update-channel.md` §2). `D-24`'s event-driven pane update has TWO arms and ONE registry:
//
//   · the DIRECT arm  — a component that learnt something FIRES the owning pane (`fire(paneId)`);
//   · the RECORD arm   — `B-1`'s delivery → `B-2`'s payload-free push → the display client's re-read → `deliver()`, which
//     fires every pane that DECLARED record interest through the SAME `fire`.
//
// **ONE registry, TWO declarations, ONE dispatch — the arms cannot diverge BY CONSTRUCTION.** `subscribeRecord(id, h)` IS
// `subscribe(id, h)` PLUS a record-interest mark, so the handler lives in the ONE map and `deliver()` reaches it only through
// `fire()`. A second dispatch — even an identical one — would be a second authority for one event, and the moment either copy
// learnt a rule the other did not, the two arms would answer differently for the same instance. `r7`'s source clause grades
// that sentence over this file's own TEXT (comments stripped) and proves it falsifiable with two mutants.
//
// **TOTALITY, AND EVERY ABSENT ARM IS A DECLARED ANSWER** (`src/renderer/pane-registry.ts:93-104` is the precedent — its
// SNAPSHOT iteration and its per-callback `try`/`catch`, NOT its `requireKnown` throw):
//   · `fire` iterates a SNAPSHOT of the id's handlers, each call inside its own `try`/`catch`; ONE throwing subscriber starves
//     nobody, a handler may withdraw itself mid-dispatch and the pass still finishes, and `fire` itself NEVER throws;
//   · an id no pane declared interest in — including every degenerate id a caller can hand a JS function (`null`, `undefined`,
//     a number, `NaN`, a boolean, an array, an object, a function, a symbol, the empty string) — answers the DECLARED
//     `{fired:false, handlers:0, reason:'no-listener'}`. A non-string/empty id is never ADDRESSABLE, so it can neither enter a
//     census nor be fired;
//   · the release a subscription answers is TOTAL and IDEMPOTENT: twice is once, an unknown id is a no-op, and a release never
//     throws;
//   · both censuses answer COPIES, so a caller cannot author who reads the record.
//
// **`deliver()` CARRIES NOTHING AND ADDRESSES NOTHING** (`B-2`'s push is payload-free), so this module holds **NO**
// address→pane table (`CRG-1`'s shape, one realm up): a pane DECLARES its interest and its handler re-reads whatever it needs.
// The shipped record-interest census is EMPTY and that is a DECLARATION, not an accident — no pane renders display state today;
// `B-10` authors the FIRST reader (`O-4`).
//
// **AND IT IS TIMERLESS** (`D-82` clause 4's discipline): no timer, no poll, no retry, no queue, no deferred work. A fire is a
// synchronous pass over the handlers that stand at that instant, and `deliver()` is a synchronous pass over the declared set.
//
// PURE: no Electron, no DOM, no store, no runtime, no I/O — the unit's `r3`/`r4`/`r7`/`r9` rows drive it with nothing else.

/** The RECORD arm's report and the DIRECT arm's answer, ONE shape (`§2`): `reason` is the closed pair `'fired'` |
 *  `'no-listener'`, and `handlers` counts the handlers that STOOD when the fire began (a handler that withdrew itself during
 *  the pass is counted — it was standing). */
export interface FireReport {
  readonly paneId: string
  readonly fired: boolean
  readonly handlers: number
  readonly reason: 'fired' | 'no-listener'
}

/** **THE PAINT'S CLOSED VOCABULARY** (`§3`, `docs/L2/shell-chrome/pane-update-channel.md` §2/§5) — seven words and no eighth:
 *  `painted` (one root replaced), `unchanged` (a shape-equal re-render applied nothing) and the five absences, each with its OWN
 *  word because a caller must be able to tell one wiring fault from another. `operator-scope` is the arm that keeps `B-9`'s
 *  surface out of this unit rather than silently re-mounting it. */
export type PaneUpdateReason =
  | 'painted'
  | 'unchanged'
  | 'not-a-pane'
  | 'not-enabled'
  | 'operator-scope'
  | 'not-mounted'
  | 'no-runtime'

/** What ONE pane update answered: the id it was asked about, whether a root was applied, the declared word, and the content
 *  roots it applied (`['pane-<id>']` on a paint, `[]` on every other arm). */
export interface PaneUpdateVerdict {
  readonly paneId: string
  readonly painted: boolean
  readonly reason: PaneUpdateReason
  readonly applied: string[]
}

/** The channel a host holds and a family unit subscribes to (`B-5`…`B-10` inherit exactly this surface, the map's §5). */
export interface PaneEvents {
  /** The DIRECT arm's listener. Answers a TOTAL, IDEMPOTENT release. */
  subscribe(paneId: string, handler: (report: FireReport) => void): () => void
  /** The DIRECT arm's entry: one synchronous pass over the handlers standing on `paneId`. Never throws. */
  fire(paneId: string): FireReport
  /** `subscribe` PLUS a record-interest mark — the RECORD arm's listener, in the SAME registry. */
  subscribeRecord(paneId: string, handler: (report: FireReport) => void): () => void
  /** The RECORD arm's entry: fires every record-interested pane THROUGH `fire`, answering their reports in census order. */
  deliver(): FireReport[]
  /** The live pane census (a COPY, in declaration order). */
  panes(): string[]
  /** The record-interested census (a COPY). EMPTY at this head by declaration (`§2`). */
  recordPanes(): string[]
}

/** A handler as the registry holds it. */
type PaneHandler = (report: FireReport) => void

/** **ONE REGISTRATION, ONE TOKEN** (`B3-F7`, measured): the interest mark is keyed by the REGISTRATION, never by the function
 *  instance. Two registrations of the SAME function (a component that subscribes its paint twice, or a `subscribe` beside a
 *  `subscribeRecord`) are two marks, so releasing one cannot withdraw the other from `deliver()` — which a function-keyed set
 *  cannot express (`Set<PaneHandler>` holds ONE entry for two identical instances) and which the first design got wrong: it
 *  starved a live record listener on release, precisely the silent loss the census exists to prevent. */
interface PaneRegistration {
  readonly handler: PaneHandler
}

/** An id this channel can ADDRESS: a non-empty string. Everything else is a declared no-op at both entries — never a coercion
 *  into a keyspace (a `String(input)` would let `null` and `'null'` collide) and never a throw. */
const addressable = (paneId: unknown): paneId is string => typeof paneId === 'string' && paneId.length > 0

/** A report value — ONE spelling of the shape, so the two arms cannot answer different keys. */
const reportOf = (paneId: string, fired: boolean, handlers: number): FireReport => ({
  paneId,
  fired,
  handlers,
  reason: fired ? 'fired' : 'no-listener',
})

/** **THE CHANNEL.** Two closed collections and six members, nothing else: `handlers` is the ONE registry keyed by pane id, and
 *  `interest` marks WHICH REGISTRATIONS declared record interest. The returned object is FROZEN (`B3-F13`): "one channel, one
 *  registry" is a fact of the value, not only a convention a caller may overwrite. */
export function createPaneEvents(): PaneEvents {
  const handlers = new Map<string, PaneRegistration[]>()
  const interest = new Map<string, Set<PaneRegistration>>()

  const fire = (paneId: string): FireReport => {
    const echo = typeof paneId === 'string' ? paneId : ''
    if (!addressable(echo)) return reportOf(echo, false, 0)
    const standing = handlers.get(echo)
    if (standing === undefined || standing.length === 0) return reportOf(echo, false, 0)
    // THE SNAPSHOT (`§2`, the `pane-registry.ts:93-104` precedent): a handler that withdraws itself — or another — during the
    // pass cannot shorten it, so "the second one still ran" is a property of the registry and not of a lucky registration order.
    const snapshot = [...standing]
    for (const registration of snapshot) {
      try {
        registration.handler(reportOf(echo, true, snapshot.length))
      } catch {
        // ONE subscriber's fault is its own: `fire` never throws and never starves the rest.
      }
    }
    return reportOf(echo, true, snapshot.length)
  }

  /** ONE registration path for BOTH declarations — the reason the arms cannot diverge is that there is only one place a
   *  handler is held, and `record` decides only whether an interest mark joins it. */
  const register = (paneId: string, handler: PaneHandler, record: boolean): (() => void) => {
    if (!addressable(paneId) || typeof handler !== 'function') return () => undefined
    const registration: PaneRegistration = { handler }
    const standing = handlers.get(paneId)
    if (standing === undefined) handlers.set(paneId, [registration])
    else standing.push(registration)
    if (record) {
      const marked = interest.get(paneId)
      if (marked === undefined) interest.set(paneId, new Set([registration]))
      else marked.add(registration)
    }
    let live = true
    return () => {
      if (!live) return
      live = false
      const now = handlers.get(paneId)
      if (now !== undefined) {
        const at = now.indexOf(registration)
        if (at >= 0) now.splice(at, 1)
        if (now.length === 0) handlers.delete(paneId)
      }
      // THE MARK IS WITHDRAWN BY TOKEN: exactly this registration's, never another registration of the same function.
      const marked = interest.get(paneId)
      if (marked !== undefined) {
        marked.delete(registration)
        if (marked.size === 0) interest.delete(paneId)
      }
    }
  }

  const subscribe = (paneId: string, handler: PaneHandler): (() => void) => register(paneId, handler, false)

  const subscribeRecord = (paneId: string, handler: PaneHandler): (() => void) => register(paneId, handler, true)

  const deliver = (): FireReport[] => {
    const reports: FireReport[] = []
    for (const paneId of [...interest.keys()]) {
      reports.push(fire(paneId))
    }
    return reports
  }

  const panes = (): string[] => [...handlers.keys()]

  const recordPanes = (): string[] => [...interest.keys()]

  return Object.freeze({ subscribe, fire, subscribeRecord, deliver, panes, recordPanes })
}
