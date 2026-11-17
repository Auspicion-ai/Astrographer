// src/main/record-engine/record.ts — THE RECORD OVER THE CALLER'S INSTANCE: one read, one per-tab read, and the ONE write route
// the pinned cadence calls (`docs/L1/unit-b-1-record-engine-seam.md` §2's cadence paragraph, §3's third bullet, §4 site 5).
//
// **IT CONSTRUCTS NO STORE, OPENS NO FILE AND OWNS NO INSTANCE.** The store is handed in, the delivery is the one the caller built
// before it, and the module's own exports take an instance rather than mint one — which is a rule and not a taste: a surface that
// can build a store is a surface one caller away from a second one, and the census row on the one seam is what makes that
// checkable rather than promised.
//
// **A READ WRITES NOTHING.** Both reads below answer from the instance and reach no verb that lands a version: an absent family is
// the DECLARED absence and answers `null` rather than minting a placeholder (the creation's repair is what makes a family stand,
// and a read that re-derived it would be a second writer), and a family that STANDS while naming a member the parse cannot state is
// answered as the DECLARED ABSENCE too — never as a partial reading. **THAT IS `D-105`'S ARM AND THE READ'S ONLY FORM OF IT**
// (`B1-ADV-03`): the fault is *"the read drops a member while the source still says `'record'`"*, so the read has exactly three
// options and two of them are closed — it may not repair (it writes nothing) and it may not drop (that is the fault), so it answers
// the absence. The CONSTRAINT is what makes that reachable only by an outside writer: an undeclared member name is refused at every
// write depth and the whole entry is held to the crossing's boundary, so nothing this module writes can put the read in that state.
//
// **THE WRITE ROUTE IS SHAPE ARM → MEMBER ARM → THEN ONE LEAF WRITE**, on the family's own tier, at `['display', <tabId>]` — the
// key being the ADDRESS SEGMENT and never a stored `tabId`. It is ONE whole-entry write: the pinned cadence is one write per EVENT
// (`DISPLAY_WRITE_EVENTS`), never per keystroke and never per member, and a per-member writer would land partial entries the parse
// could refuse mid-way.
//
// **BOTH ANSWERS ARE ONE SHAPE AND IT IS THE PARSE'S**: `{ok: true}` or `{ok: false, reason, message, address}` — `ok` on the
// refusal arm is `false`, the word for the token is `reason` and never a second name for it, and the address is the LEAF the write
// would have landed at, never the family root, so a refusal NAMES WHERE THE ACT WOULD HAVE GONE. Every arm is answered BEFORE ANY
// STORE VERB, which is what makes "a refusal delivers nothing" a property rather than an observation.
//
// **AND A STORE'S OWN REFUSAL IS NOT ONE OF THESE ARMS.** The family's TWO tokens name the family's two domains (`malformed-display`
// for a payload's shape, `malformed-display-entry` for a member's or a value's), and a store refusal — an absent parent, a tier the
// register cannot reach — crosses as the store's own thrown `{status, message, log, address}` with the address it refused. This
// module mints no third token for it: a caller that must tell the two apart reads the `ok` member (a family answer is a record) or
// catches (a store refusal is a throw), and the contract fixes exactly that split.


import type { StoreInstance } from '../storeroom.js'
import { DISPLAY_ADDRESS, DISPLAY_TIER } from './display-family.js'
import type { DisplayDelivery } from './delivery.js'
import {
  DISPLAY_MALFORMED_REASON,
  DISPLAY_SHAPE_MESSAGE,
  displayEntryIn,
  isPlainRecord,
  isPrototypeKey,
  type DisplayEntry,
  type DisplayFamilyValue,
} from './display-shape.js'

/**
 * **THE WRITE CADENCE, PINNED — AND IT IS THE RULING'S OWN COST** (D-23's *"wasteful of performance due to the storeroom update
 * frequency"*): one WHOLE-ENTRY write per EVENT, and the three events are these three words in this order. The write VERB below is
 * this module's; the three CAPTURE SITES are a later unit's, whose red row counts the writes against this set.
 */
export const DISPLAY_WRITE_EVENTS = ['tab-switch', 'commit-on-blur', 'scroll-settle'] as const

/** One of the pinned events. */
export type DisplayWriteEvent = (typeof DISPLAY_WRITE_EVENTS)[number]

/** What the record is built over: the caller's instance, and the delivery the caller built before it. **The record takes NO
 *  registration from the delivery** — the one registration per address is the construction's (`cfg.listeners`), and the record
 *  reads the other half of it or hands it on; a record that subscribed would be a second registration for one event. */
export interface DisplayRecordOptions {
  readonly store: StoreInstance
  readonly delivery: DisplayDelivery
}

/** **THE WRITE ROUTE'S ONE ANSWER SHAPE.** The credited arm is `{ok: true}`; the refusal arm carries the parse's `reason`, the
 *  family's sentence, and the LEAF the write would have landed at (`null` only where no address is nameable at all — a tab id that
 *  is not a string cannot be spelled as a segment, so there is no leaf to name). */
export type DisplayWriteAnswer =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: string; readonly message: string; readonly address: readonly string[] | null }

/** The record over the caller's instance. Nothing here constructs a store, opens a file or registers a listener. */
export interface DisplayRecord {
  /** The family's whole value, or `null` where it does not stand — a declared absence, never a fabricated placeholder. */
  read(): DisplayFamilyValue | null
  /** One tab's entry, or `null` where the tab has none or the value there is not one this family can state. */
  readTab(tabId: string): DisplayEntry | null
  /** One whole-entry write at one tab's leaf. ONE call per event; the answer names the leaf on every refusal. */
  commitTab(tabId: string, entry: unknown): DisplayWriteAnswer
}

/** The leaf a tab id lands at — the address a refusal names, and the address the one write goes to. */
const leafOf = (tabId: string): readonly string[] => [...DISPLAY_ADDRESS, tabId]

/** **THE RECORD OVER THE CALLER-BUILT INSTANCE.** The caller keeps the handle; this object reads and writes through it and holds no
 *  state of its own, which is why two records over one store see each other's writes and why the delivery's options member carries
 *  no registration. */
export function createDisplayRecord(options: DisplayRecordOptions): DisplayRecord {
  const standing: StoreInstance = options.store

  const reading = (): DisplayFamilyValue | null => {
    let held: unknown
    try {
      held = standing.read([...DISPLAY_ADDRESS])
    } catch {
      // AN ABSENT FAMILY IS A DECLARED ABSENCE, and the store answers it by THROWING: a read writes nothing, so nothing here
      // creates the family — the creation's repair is what does that.
      return null
    }
    if (!isPlainRecord(held)) return null
    const family: Record<string, DisplayEntry> = {}
    for (const [tabId, value] of Object.entries(held)) {
      // **`D-105`'S FAULT IS THE SILENT DROP, SO THERE IS NO DROP HERE** (`B1-ADV-03`, and it is the arm a read has left). A family
      // that STANDS while naming one member this module cannot state is a family the read cannot state WHOLE — an older image's
      // bytes, a second process, a store built without this pair — and the only arms a read has are: repair it (it writes nothing, so
      // no), answer it partially (that is precisely the fault: a member dropped while the source still says `'record'`), or answer
      // the DECLARED ABSENCE. It answers the declared absence, and `(invariant·heal)` in this module's battery measures that a statable
      // ROOT write heals it. A member named a prototype key is in the same class: it is the READING's key space and no tab states it.
      if (tabId.length === 0 || isPrototypeKey(tabId)) return null
      const admitted = displayEntryIn(value)
      if (!admitted.ok) return null
      family[tabId] = admitted.entry
    }
    // A FRESH PLAIN RECORD, so what a consumer holds neither aliases the store's own release nor a sibling read's answer.
    return family
  }

  const readingTab = (tabId: string): DisplayEntry | null => {
    if (typeof tabId !== 'string' || tabId.length === 0) return null
    let held: unknown
    try {
      held = standing.read(leafOf(tabId))
    } catch {
      return null
    }
    const admitted = displayEntryIn(held)
    return admitted.ok ? admitted.entry : null
  }

  const commitTab = (tabId: string, entry: unknown): DisplayWriteAnswer => {
    // ── THE ID'S SHAPE ARM, BEFORE THE PAYLOAD AND BEFORE ANY STORE VERB: an id that is not a non-empty string is a PAYLOAD's
    // ── shape fault, and the address it could not name is `null` because the leaf's second segment would be the id itself.
    if (typeof tabId !== 'string' || tabId.length === 0) {
      return { ok: false, reason: DISPLAY_MALFORMED_REASON, message: DISPLAY_SHAPE_MESSAGE, address: null }
    }
    // ── **AND A TAB ID THAT IS A PROTOTYPE KEY IS THE SAME ARM, FOR THE SAME REASON** (`B1-ADV-05(a)`, MEASURED: it used to commit,
    // ── then VANISH from `read()` and become the READING'S PROTOTYPE while `readTab` still answered). The family keys one member per
    // ── tab id, so an id whose name the OBJECT MODEL owns rather than the member space is a fault in the shape of the value being
    // ── built, not in a member's domain — hence this token and not the entry one. The leaf IS nameable here, so the answer names it.
    if (isPrototypeKey(tabId)) {
      return { ok: false, reason: DISPLAY_MALFORMED_REASON, message: DISPLAY_SHAPE_MESSAGE, address: leafOf(tabId) }
    }
    // ── THE MEMBER ARM, THE SAME PARSE THE READ AND THE CONSTRAINT USE: the refusal carries the parse's own `reason` and sentence,
    // ── and the LEAF this write would have landed at.
    const admitted = displayEntryIn(entry)
    if (!admitted.ok) {
      return { ok: false, reason: admitted.reason, message: admitted.message, address: leafOf(tabId) }
    }
    // ── AND THEN ONE WHOLE-ENTRY WRITE at the leaf, on the family's own tier. A store refusal crosses AS ITSELF (see the header).
    standing.write(leafOf(tabId) as string[], DISPLAY_TIER, admitted.entry)
    return { ok: true }
  }

  return { read: reading, readTab: readingTab, commitTab }
}
