// src/shared/layout-projection.ts — U-PROJ, the PROJECTION half of `SCH-8`
// (`docs/specs/projection.md`). This module is the whole unit: a PURE
// projection and a TOTAL applier, and nothing else.
//
//   project(values, specOf)            PURE.    Reads its two arguments only,
//                                      writes nothing, never throws.
//   applyProjection(projection, sink)  IMPURE.  The injected write sink is the
//                                      ONLY environment reading; every key gets
//                                      a write-or-skip decision, never a throw,
//                                      never a partial write for a key reported
//                                      as applied. `applyVarsToRoot` is the
//                                      source-name alias of this function.
//
// The mechanism declares nothing and owns nothing: no root, no store, no cache,
// no registry, no module state, no observer, no DOM read. Every property name,
// unit token and formatting choice is CALLER DATA (§2.2) — there is no built-in
// name, unit or token literal anywhere below.
//
// The returned `applied` records (and the duplicate-detection set) are built on
// `Object.create(null)`, so EVERY caller-supplied name is an OWN key, including
// `'__proto__'` and the other prototype-shaped names (§2.5); every lookup over
// caller data is an own-property lookup, never a prototype-chain read. A
// `Projection` is a reusable VALUE, not a session: nothing is consumed, no
// per-projection state exists, and a re-entrant sink is never guarded (§0A).

/** The caller's value set: an opaque key -> the caller's raw value. */
export type VarValues = Readonly<Record<string, unknown>>

/** The caller's spec for ONE property. Every field is caller-supplied data;
 *  `name` and `unit` are REQUIRED (a spec without either is malformed — `F-1`)
 *  and `unit: ''` is VALID and means "no unit". */
export interface VarSpec {
  /** The full property name, verbatim — any string; no spelling rule exists. */
  readonly name: string
  /** The caller's unit token, appended verbatim; `''` means "no unit". */
  readonly unit: string
  /** `'unit'` (the default) emits `${value}${unit}`; `'number'` emits the bare
   *  number. Both are caller-visible options, never hidden policy. */
  readonly format?: 'unit' | 'number'
}

/** Every reason a key can be skipped — the closed, eight-member vocabulary
 *  (`§2.1`; `'accessor-threw'` was added by the 2026-09-27 ruling, `§0A`
 *  note 2). A skip is RECORDED here, never signalled by a throw. */
export type ProjectionSkipReason =
  | 'missing-value' // the spec's key is absent from `values`
  | 'not-a-number' // present, and read, but not a finite number
  | 'accessor-threw' // the value's accessor threw while it was being read
  | 'negative' // finite, a number, but below zero
  | 'malformed-spec' // the spec entry is not a usable VarSpec
  | 'duplicate-name' // two specs produce the same `name`
  | 'sink-unusable' // (applier only) the injected sink cannot be written to
  | 'write-refused' // (applier only) the write threw for this key

export interface ProjectionSkip {
  readonly name: string
  readonly reason: ProjectionSkipReason
}

export interface Projection {
  /** EXACTLY the writes to perform: name -> the formatted string, in caller
   *  spec order. Every value is a STRING, so no rejection can reach this
   *  record. BUILT ON Object.create(null) — it has NO prototype, for ANY
   *  caller-supplied name; test membership with `Object.hasOwn` (or
   *  `Object.prototype.hasOwnProperty.call`) — `applied.hasOwnProperty` does
   *  NOT exist on it. A copying consumer needs a prototype-free target. */
  readonly applied: Readonly<Record<string, string>>
  /** EXACTLY the keys that must NOT be written, each with its reason. An ARRAY
   *  of records: `name` is a value, never an object key. */
  readonly skipped: readonly ProjectionSkip[]
}

/** The ONE write surface the applier uses. Duck-typed — a caller-supplied
 *  object, never the shim's element type. */
export interface VarWriteSink {
  readonly style: {
    setProperty(name: string, value: string): void
  }
}

export interface ApplyResult {
  /** EXACTLY what was written, name -> value, in write order: a key appears
   *  here iff the write was performed for it. The write LOG, not the intent;
   *  prototype-free like `Projection.applied`. */
  readonly applied: Readonly<Record<string, string>>
  /** EXACTLY what was not written, each with its reason. */
  readonly skipped: readonly ProjectionSkip[]
  /** `true` iff nothing was skipped. */
  readonly ok: boolean
}

// ---------------------------------------------------------------------------
// Internal helpers. No state, no imports, no environment reading: every one of
// them is a pure function of its arguments.
// ---------------------------------------------------------------------------

type ParsedSpec = {
  readonly name: string
  readonly unit: string
  readonly format: 'unit' | 'number'
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return value !== null && (typeof value === 'object' || typeof value === 'function')
}

/** The `values` POSITION's own restriction (§2.4 item 3 clause (iii)): a callable
 *  is a NON-RECORD `values` — it holds no own keys for this contract's purposes,
 *  so the language's own incidental members are never read as caller data. The
 *  other object-like positions stay duck-typed. */
function isCallable(value: unknown): boolean {
  return typeof value === 'function'
}

/** Own-property membership over caller data — never a prototype-chain read, so
 *  an inherited member is never mistaken for the caller's own data. */
function owns(record: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key)
}

function ownKeys(record: object): string[] {
  try {
    return Object.keys(record)
  } catch {
    return []
  }
}

/** The name an unusable entry declares, when it declares a usable one: a
 *  malformed entry has no reason to be given a name it never carried. */
function declaredName(entry: unknown): string {
  if (!isObjectLike(entry)) return ''
  try {
    const name = entry['name']
    return typeof name === 'string' ? name : ''
  } catch {
    return ''
  }
}

/** A usable spec entry, or `null` where the entry is malformed (`F-1`): a
 *  missing or non-string `name`/`unit`, or an unknown `format` value. Nothing
 *  is defaulted — a missing `unit` is malformed, never `''`. */
function parseSpec(entry: unknown): ParsedSpec | null {
  if (!isObjectLike(entry)) return null
  try {
    const name = entry['name']
    const unit = entry['unit']
    if (typeof name !== 'string' || typeof unit !== 'string') return null
    const format = entry['format']
    if (format === undefined) return { name, unit, format: 'unit' }
    if (format === 'unit' || format === 'number') return { name, unit, format }
    return null
  } catch {
    return null
  }
}

/** The module's ONLY number formatting: the JS number -> string conversion,
 *  plus the caller's own unit token. No token of the module's is ever added. */
function formatValue(spec: ParsedSpec, value: number): string {
  const text = String(value)
  return spec.format === 'number' ? text : text + spec.unit
}

type ReadOutcome =
  | { readonly kind: 'missing' }
  | { readonly kind: 'threw' }
  | { readonly kind: 'read'; readonly value: unknown }

/** The ONE read of a key's value, with own-property semantics. The own-property
 *  question and the read sit inside the SAME totality boundary: an accessor that
 *  throws, or a `values` whose own-property question itself throws (a revoked
 *  Proxy), is caught HERE, per key — one bad key never ends a projection, and the
 *  throw is never propagated (`I-7`, `§2.4` item 2). The key is still read
 *  THROUGH its accessor, exactly once, so a successful read is the caller's own
 *  value (`F-4B`, `P-PJ-IM-3`). */
function readValue(values: unknown, key: string): ReadOutcome {
  if (!isObjectLike(values) || isCallable(values)) return { kind: 'missing' }
  try {
    if (!owns(values, key)) return { kind: 'missing' }
    return { kind: 'read', value: values[key] }
  } catch {
    return { kind: 'threw' }
  }
}

/** THE PURE HALF: total over every input, pure, and never throwing. */
export function project(values: unknown, specOf: unknown): Projection {
  const applied: Record<string, string> = Object.create(null) as Record<string, string>
  const skipped: ProjectionSkip[] = []
  // The duplicate-detection set: prototype-free, so a name that collides with an
  // inherited member (`'constructor'`, `'toString'`, ...) is neither misdiagnosed
  // as already seen nor as a duplicate.
  const seen: Record<string, boolean> = Object.create(null) as Record<string, boolean>
  if (!isObjectLike(specOf)) return { applied, skipped }
  for (const key of ownKeys(specOf)) {
    let entry: unknown
    let entryThrew = false
    try {
      entry = specOf[key]
    } catch {
      entryThrew = true
    }
    const spec = entryThrew ? null : parseSpec(entry)
    // The fixed precedence: malformed-spec, then duplicate-name, then the value
    // decision. A malformed entry has no usable name and claims none.
    if (spec === null) {
      skipped.push({ name: entryThrew ? '' : declaredName(entry), reason: 'malformed-spec' })
      continue
    }
    if (owns(seen, spec.name)) {
      skipped.push({ name: spec.name, reason: 'duplicate-name' })
      continue
    }
    // First-wins means the first DECISION wins: the first occurrence of a name
    // claims it and records its OWN reason, whatever that reason turns out to be.
    seen[spec.name] = true
    const outcome = readValue(values, key)
    if (outcome.kind === 'missing') {
      skipped.push({ name: spec.name, reason: 'missing-value' })
      continue
    }
    if (outcome.kind === 'threw') {
      skipped.push({ name: spec.name, reason: 'accessor-threw' })
      continue
    }
    const value = outcome.value
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      skipped.push({ name: spec.name, reason: 'not-a-number' })
      continue
    }
    if (value < 0) {
      skipped.push({ name: spec.name, reason: 'negative' })
      continue
    }
    applied[spec.name] = formatValue(spec, value)
  }
  return { applied, skipped }
}

/** ONE key at a time, the same rules as `project` — for a caller that has a
 *  single value and no spec map. `written === null` is the ONLY "not written"
 *  observable and is equivalent to `skip !== null`; `written === ''` would be a
 *  legitimate written value and is never produced when a skip occurred. */
export function projectVar(
  spec: unknown,
  value: unknown,
): { readonly written: string | null; readonly skip: ProjectionSkip | null } {
  const parsed = parseSpec(spec)
  if (parsed === null) {
    return { written: null, skip: { name: declaredName(spec), reason: 'malformed-spec' } }
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return { written: null, skip: { name: parsed.name, reason: 'not-a-number' } }
  }
  if (value < 0) {
    return { written: null, skip: { name: parsed.name, reason: 'negative' } }
  }
  return { written: formatValue(parsed, value), skip: null }
}

type PlannedWrite = { readonly name: string; readonly text: string | null }

/** The one re-formatting the applier performs: a real `setProperty` must never
 *  receive a non-string, so a PRIMITIVE is coerced with `String()` and a
 *  non-primitive is refused. Nothing is written into the caller's projection. */
function asText(value: unknown): string | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'object' || typeof value === 'function') return null
  try {
    return String(value)
  } catch {
    return null
  }
}

/** The intended writes of a projection, in the projection's own key order. */
function plannedWrites(applied: unknown): PlannedWrite[] {
  const out: PlannedWrite[] = []
  if (!isObjectLike(applied)) return out
  for (const name of ownKeys(applied)) {
    let value: unknown
    try {
      value = applied[name]
    } catch {
      out.push({ name, text: null })
      continue
    }
    out.push({ name, text: asText(value) })
  }
  return out
}

function isDeclaredReason(value: unknown): value is ProjectionSkipReason {
  switch (value) {
    case 'missing-value':
    case 'not-a-number':
    case 'accessor-threw':
    case 'negative':
    case 'malformed-spec':
    case 'duplicate-name':
    case 'sink-unusable':
    case 'write-refused':
      return true
    default:
      return false
  }
}

/** The caller's own skip entries that carry a decidable reason: a malformed
 *  list, or an entry with no usable name/reason, is DROPPED rather than given
 *  an invented ninth reason. */
function readableSkips(list: unknown): ProjectionSkip[] {
  const out: ProjectionSkip[] = []
  if (!Array.isArray(list)) return out
  for (const entry of list) {
    if (!isObjectLike(entry)) continue
    let name: unknown
    let reason: unknown
    try {
      name = entry['name']
      reason = entry['reason']
    } catch {
      continue
    }
    if (typeof name !== 'string' || !isDeclaredReason(reason)) continue
    out.push({ name, reason })
  }
  return out
}

/** The sink's ONE usable method, or `null` where the sink is unusable. Nothing
 *  but the callability of `style.setProperty` is read from it: the applier is
 *  blind to the sink's prior state and never probes with a write. */
function resolveSetter(sink: unknown): ((name: string, text: string) => void) | null {
  if (!isObjectLike(sink)) return null
  let style: unknown
  try {
    style = sink['style']
  } catch {
    return null
  }
  if (!isObjectLike(style)) return null
  let method: unknown
  try {
    method = style['setProperty']
  } catch {
    return null
  }
  if (typeof method !== 'function') return null
  const write = method as (name: string, value: string) => void
  return (name: string, text: string): void => {
    write.call(style, name, text)
  }
}

/** THE IMPURE HALF: total — one decision per key, never a throw, never a
 *  partial write for a key reported as applied. The projection is read-only
 *  INPUT and is REUSABLE: nothing is cached into it and it is never consumed. */
export function applyProjection(projection: unknown, sink: unknown): ApplyResult {
  const applied: Record<string, string> = Object.create(null) as Record<string, string>
  const skipped: ProjectionSkip[] = []
  // A malformed PROJECTION decides NOTHING: it is an input record, and a
  // non-record holds no keys. (A malformed SINK decides EVERY key, below.)
  if (!isObjectLike(projection)) return { applied, skipped, ok: true }
  // The two FIELD reads are inside the same totality boundary: a field that
  // cannot be read at all (a throwing accessor, a revoked Proxy) is treated as
  // ABSENT — no planned writes, no carried entries — so this call decides
  // nothing and throws nothing (`§2.3` item 4's asymmetry, `M-11`'s shape).
  let appliedField: unknown
  try {
    appliedField = projection['applied']
  } catch {
    appliedField = undefined
  }
  let skippedField: unknown
  try {
    skippedField = projection['skipped']
  } catch {
    skippedField = undefined
  }
  const writes = plannedWrites(appliedField)
  const carried = readableSkips(skippedField)
  const setter = resolveSetter(sink)
  // An unusable sink is a TOTAL skip: no write is attempted, and one reason
  // member applies to every key of the projection.
  if (setter === null) {
    for (const write of writes) skipped.push({ name: write.name, reason: 'sink-unusable' })
    for (const entry of carried) skipped.push({ name: entry.name, reason: 'sink-unusable' })
    return { applied, skipped, ok: skipped.length === 0 }
  }
  for (const write of writes) {
    if (write.text === null) {
      skipped.push({ name: write.name, reason: 'write-refused' })
      continue
    }
    try {
      setter(write.name, write.text)
    } catch {
      // A refused write does not end the run: the caller sees exactly which
      // keys did not land, and the key never reaches the write log.
      skipped.push({ name: write.name, reason: 'write-refused' })
      continue
    }
    applied[write.name] = write.text
  }
  // The projection's own skips propagate unchanged — this call decides them too.
  for (const entry of carried) skipped.push(entry)
  return { applied, skipped, ok: skipped.length === 0 }
}

/** The source-name alias of `applyProjection` — the SAME function object, not a
 *  second implementation. */
export const applyVarsToRoot = applyProjection
