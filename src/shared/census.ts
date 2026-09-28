/**
 * Pure per-member arithmetic over caller-supplied values only: the caller's
 * enumeration, the caller's census, the caller's two lookups and the caller's
 * decision predicate, handed straight to the predecessor's two calls.
 *
 * The whole surface is three exported names: the one value export
 * `computeTrackVars` plus the type declarations `ZoneId` and `TrackVars`. Every
 * string this module returns is either the predecessor's own output for caller
 * data, or the degenerate empty string that stands for a member the caller
 * declined to display. The module holds no built-in token, no default, no
 * environment read, no module-level state and no write into anything it was
 * handed. Its ONLY import is the predecessor.
 */

import { isEmpty, trackFor } from './zones.js'

/** An identifier, AS THE CALLER'S ENUMERATION YIELDED IT: never normalized,
 *  stringified, trimmed or validated — carried verbatim to `isEmpty`'s second
 *  parameter and to the caller's own two lookups. */
export type ZoneId = string | number

/** The returned record: a NULL-PROTOTYPE plain record whose own enumerable
 *  string keys are EXACTLY the enumerated set, in first-seen order, and whose
 *  values are the exact strings `trackFor` produced. A member that cannot
 *  become an own key (a `Symbol`) is the single exception and is dropped; every
 *  other member appears under its own key image. */
export type TrackVars = Record<string, string>

/** The members the caller's enumeration yields, in enumeration order, or `null`
 *  where the argument yields no members at all: a sequence (a `Map`, whose KEYS
 *  are the members, a `Set`, an array, or any object or function carrying a
 *  CALLABLE `Symbol.iterator`) contributes its iteration values; any other
 *  non-null object contributes its own enumerable string keys; every other
 *  input — a primitive, `null`, `undefined`, or a function with no callable
 *  iterator — yields nothing. TOTAL: never a throw. */
function memberSequence(value: unknown): Iterable<unknown> | null {
  if (value === null || value === undefined) return null
  const kind = typeof value
  if (kind !== 'object' && kind !== 'function') return null
  let iterate: unknown
  try {
    iterate = (value as { [Symbol.iterator]?: unknown })[Symbol.iterator]
  } catch {
    return null
  }
  if (typeof iterate === 'function') {
    if (value instanceof Map) return (value as Map<unknown, unknown>).keys()
    return value as Iterable<unknown>
  }
  if (kind !== 'object') return null
  try {
    return Object.keys(value)
  } catch {
    return null
  }
}

/** What ONE of the caller's two lookups yields for one member: a callable is
 *  called (with the census as its second argument where the lookup takes one),
 *  a record is read by OWN property, and EVERY unusable form — a miss, a
 *  non-callable non-record, a throwing callable, a throwing own accessor —
 *  degrades to `undefined`, which is handed straight to `trackFor`. TOTAL:
 *  never a throw. */
function lookupValue(lookup: unknown, member: unknown, census: unknown, withCensus: boolean): unknown {
  if (typeof lookup === 'function') {
    try {
      if (withCensus) return (lookup as (id: unknown, totals: unknown) => unknown)(member, census)
      return (lookup as (id: unknown) => unknown)(member)
    } catch {
      return undefined
    }
  }
  if (lookup === null || typeof lookup !== 'object') return undefined
  try {
    if (Array.isArray(lookup) || lookup instanceof Map || lookup instanceof Set) return undefined
    if (!Object.hasOwn(lookup, member as PropertyKey)) return undefined
    return (lookup as Record<PropertyKey, unknown>)[member as PropertyKey]
  } catch {
    return undefined
  }
}

/** For every member of the caller's enumeration, ask the caller's decision
 *  predicate whether to display it; where the answer is truthy, ask the
 *  caller's two lookups for its size and its spec and ask `isEmpty`/`trackFor`
 *  for the string — and return a record whose own enumerable string keys are
 *  EXACTLY the enumerated set, in first-seen order.
 *
 *  A member the predicate declines keeps its key and carries exactly `''`; an
 *  absent, non-callable or throwing predicate is the no-decision case and
 *  yields the empty record, never a default. Every value is the predecessor's
 *  own output: the census is handed to `isEmpty` verbatim and is never read
 *  here, and every unusable lookup form degrades to `undefined` and lands on
 *  the predecessor's own limbs.
 *
 *  TOTAL: one record for EVERY input, never a throw, nothing mutated, nothing
 *  cached. There is no refusal domain — every outcome is a value. */
export function computeTrackVars(
  zones: unknown,
  census: unknown,
  sizes: unknown,
  revealed: unknown,
  specOf: unknown,
): TrackVars {
  const out: Record<string, string> = Object.create(null)
  if (typeof revealed !== 'function') return out as TrackVars
  const members = memberSequence(zones)
  if (members === null) return out as TrackVars
  try {
    for (const member of members) {
      // `§2.3` item 1 (iv) — the member that cannot become an own key AT ALL is
      // dropped BEFORE the gate and therefore costs nothing.
      if (typeof member === 'symbol') continue
      let decision: unknown
      try {
        decision = (revealed as (id: unknown) => unknown)(member)
      } catch {
        return Object.create(null) as TrackVars
      }
      // The member's own token and the caller's two lookups are computed FIRST, so
      // a gate-passing member pays its clause-ordered delegate calls whatever its
      // own coercion does with the key write below.
      const token = !decision
        ? ''
        : trackFor(
            lookupValue(specOf, member, census, false),
            lookupValue(sizes, member, census, true),
            isEmpty(census, member),
          )
      // The key write ALONE is guarded, PER MEMBER: a member whose own
      // property-key coercion cannot produce an own key contributes no key and
      // ENDS NOTHING — the members after it are still enumerated and still keyed.
      try {
        out[member as string] = token
      } catch {
        // The member is the drop class: no key, no value of its own, no reason.
      }
    }
  } catch {
    // The SEQUENCE answered with a throw: the members reached so far stand.
  }
  return out as TrackVars
}
