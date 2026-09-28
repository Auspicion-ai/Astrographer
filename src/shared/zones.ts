/**
 * Pure token arithmetic over caller-supplied values only.
 *
 * The whole surface is three exported names: the two value exports `isEmpty`
 * and `trackFor`, plus the type `TrackSpec`. Every string this module emits is
 * an argument it was handed — it holds no built-in token, unit or property
 * name, reads no environment, keeps no module-level state, writes nothing and
 * imports nothing.
 */

/** The caller's spec for ONE track. All three fields are caller-supplied data:
 *  the mechanism has no default for any of them and never interprets them. */
export interface TrackSpec {
  /** The property NAME the emitted token belongs to. Carried, never
   *  interpreted, never validated, never normalized and never used as a lookup
   *  key — the lookup key of `isEmpty` is its own second parameter. */
  readonly trackProp: string
  /** The caller's unit token, appended VERBATIM to the emitted numeric text.
   *  `''` is valid and is the documented bare-number form. */
  readonly unit: string
  /** The exact token to emit for an EMPTY track, byte for byte: never trimmed,
   *  never case-folded, never prefixed or suffixed and never replaced by a
   *  mechanism literal. */
  readonly emptyToken: string
}

/** Is the entry named by the second argument empty, according to the census I
 *  was handed? TOTAL: a boolean for every input, never a throw, reading nothing
 *  but its two arguments and mutating nothing.
 *  TRUE only where the census is a map whose accessor returns exactly the number
 *  `0` for that key, or a record OWNING that string key with an own value of
 *  exactly `0` (so `-0` counts). Every other shape — an array, a `Set`, a
 *  primitive, a function, `null`, an absent key, a non-string key, an
 *  unreadable value — answers `false`. */
export function isEmpty(census: unknown, zoneId: unknown): boolean {
  try {
    if (census === null || census === undefined) return false
    const kind = typeof census
    if (kind !== 'object' && kind !== 'function') return false
    if (census instanceof Map) return census.get(zoneId) === 0
    const read = (census as { get?: unknown }).get
    if (typeof read === 'function') return read.call(census, zoneId) === 0
    if (kind !== 'object') return false
    if (Array.isArray(census) || census instanceof Set) return false
    if (typeof zoneId !== 'string') return false
    if (!Object.prototype.hasOwnProperty.call(census, zoneId)) return false
    return (census as Record<string, unknown>)[zoneId] === 0
  } catch {
    return false
  }
}

/** Render the token for one spec, one size and one injected emptiness flag.
 *  TOTAL: a string for every input, never a throw, reading nothing but its three
 *  arguments and mutating nothing.
 *  A spec that is not a readable record whose three fields are all strings is
 *  the MALFORMED class: the answer is the degenerate empty string `''`,
 *  whatever the flag and the size say — that limb is evaluated FIRST and gates
 *  the others. Otherwise: a truthy flag, or a size that is not a finite
 *  non-negative number, yields `spec.emptyToken` VERBATIM; any other size yields
 *  `String(size) + spec.unit` (no rounding, no truncation, no coercion, no parse).
 *  `-0` is finite and not negative, so it yields the `'0'` numeric text. */
export function trackFor(spec: unknown, size: unknown, empty?: unknown): string {
  try {
    if (spec === null || typeof spec !== 'object') return ''
    const fields = spec as Record<string, unknown>
    const trackProp = fields.trackProp
    const unit = fields.unit
    const emptyToken = fields.emptyToken
    if (typeof trackProp !== 'string' || typeof unit !== 'string' || typeof emptyToken !== 'string') return ''
    if (empty) return emptyToken
    if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) return emptyToken
    return String(size) + unit
  } catch {
    return ''
  }
}
