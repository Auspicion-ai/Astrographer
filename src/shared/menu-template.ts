export type PickerFn = (candidates: readonly CatalogEntry[]) => unknown

export interface CatalogEntry {
  readonly id: unknown
  readonly label: unknown
  readonly accelerator: unknown
  readonly role: unknown
  readonly kind: unknown
  readonly submenu: unknown
  readonly enabled: unknown
}

export interface PlatformProjection {
  readonly recognized: boolean
  readonly collapsing: boolean
}

export interface ProjectedItem {
  readonly id: unknown
  readonly label: unknown
  readonly accelerator: unknown
  readonly role: unknown
  readonly kind: unknown
  readonly submenu: unknown
  readonly enabled: unknown
}

export interface MenuTemplate {
  readonly items: readonly ProjectedItem[]
  readonly platform: PlatformProjection
}

export interface TemplateOptions {
  readonly platform: unknown
  readonly picker?: PickerFn | unknown
}

const CARRY_KEYS: readonly string[] = ["id", "label", "accelerator", "role", "kind", "submenu", "enabled"]
const DARWIN = "darwin"
const PICKER_KIND = "picker"

function ownNames(value: object): readonly string[] {
  try {
    return Object.getOwnPropertyNames(value)
  } catch {
    return []
  }
}

function owns(value: object, key: string): boolean {
  try {
    return Object.prototype.hasOwnProperty.call(value, key)
  } catch {
    return false
  }
}

function readOwn(value: object, key: string): { readonly ok: boolean; readonly v: unknown } {
  try {
    if (!Object.prototype.propertyIsEnumerable.call(value, key)) return { ok: false, v: undefined }
    return { ok: true, v: (value as Record<string, unknown>)[key] }
  } catch {
    return { ok: false, v: undefined }
  }
}

/** `§3c` pin 1 INDEX-KEY predicate, read EXACTLY: only a CANONICAL array index
 *  qualifies — an all-digit key whose string form is its own numeric value, so a
 *  leading zero disqualifies it and `4294967295` (one past the largest index) is
 *  not an index either. **THE DIGIT-STRING SHAPE IS THE ROW: an array carrying the
 *  own key `01` — assigned beside a `length` that stays `0` — owns a key that is
 *  neither one of the seven declared names nor an own present index key, so it is
 *  DROPPED.** */
function isIndexKey(key: string): boolean {
  if (key.length === 0 || key.length > 10) return false
  if (key.length > 1 && key.charCodeAt(0) === 48) return false
  for (let i = 0; i < key.length; i += 1) {
    const code = key.charCodeAt(i)
    if (code < 48 || code > 57) return false
  }
  return Number(key) < 4294967295
}

/** THE COMPOSED CARRY RULE (`docs/specs/menulib.md` `§3c`, the three pinned
 *  sub-readings, read beside `§2.3` items 1(b)/(c)/(d) and item 11): a usable
 *  element is a NON-NULL OBJECT — an ARRAY INCLUDED, and a FUNCTION EXCLUDED
 *  (`§2.3` item 1(c): a function is SKIPPED, contributing NO entry and NO throw;
 *  so is every absent, `null` and primitive element) — whose own-key enumeration
 *  (`Object.keys`) and whose read of EVERY owned enumerable member both COMPLETE;
 *  it emits ONE FRESH RECORD whose own enumerable string keys are the own keys OF
 *  the source, filtered to the seven declared names IN DECLARED ORDER plus, on an ARRAY,
 *  its own present CANONICAL index keys (`length` is a non-enumerable own member
 *  and is never carried), each value handed on BY IDENTITY with an object member
 *  CARRIED IN TURN; an EMPTY intersection still emits a KEYLESS record (never a
 *  drop); and the moment either the enumeration or a member read THROWS, the WHOLE
 *  element is SKIPPED with the throw absorbed — never a partial record. */
function ownMembers(source: object): { readonly ok: boolean; readonly names: readonly string[]; readonly values: readonly unknown[] } {
  try {
    const names = Object.keys(source) as readonly string[]
    const values: unknown[] = []
    for (const name of names) values.push((source as Record<string, unknown>)[name])
    return { ok: true, names, values }
  } catch {
    return { ok: false, names: [], values: [] }
  }
}

/** THE CARRY, AND ITS THREE DECLARED ANSWERS — a FRESH RECORD when the element is
 *  carried, `null` when it is NOT CARRYABLE (absent, `null`, a primitive, a
 *  FUNCTION, or an element whose own-key read did not complete: `§2.3` item 1(c)
 *  and item 1(d)), and `undefined` when the element cannot be CARRIED IN TURN
 *  because it is ALREADY ON THE CARRY PATH (`path`) — a CYCLE, whose record would
 *  be unboundedly nested, so no slot is materialized for it and the holding
 *  remaining carried keys OF the holding ARRAY stand as the pin 2 KEYLESS record when
 *  it has none. `path` holds the elements currently being carried, so the recursion is
 *  BOUNDED and a CYCLE is handled without a throw (the `RangeError` measured at `§3d`
 *  `A-1`). */
function carries(element: unknown, path: readonly object[]): CatalogEntry | null | undefined {
  if (element === null || typeof element !== "object") return null
  const source = element as object
  if (path.indexOf(source) >= 0) return undefined
  // `§3c` pin 3 / `§2.3` item 1(d): the carry guard lives INSIDE the absorbed
  // span, so a hostile element — a REVOKED Proxy, whose `IsArray`/own-key reads
  // throw — is SKIPPED WHOLE by the local return below, never by the outer catch
  // of `normalizeCatalog` (which would drop the WHOLE catalog). The absorbed call
  // sits in a `const` initializer because THIS module bans a line-initial
  // `let`/`var` binding anywhere (`R-3`).
  const probe = ((): { readonly ok: boolean; readonly names: readonly string[]; readonly values: readonly unknown[] } | null => {
    try {
      return ownMembers(source)
    } catch {
      return null
    }
  })()
  if (probe === null || !probe.ok) return null
  const values = new Map<string, unknown>()
  for (const key of CARRY_KEYS) {
    if (!owns(source, key)) continue
    const read = readOwn(source, key)
    if (!read.ok) return null
    values.set(key, read.v)
  }
  const record = Object.create(null) as Record<string, unknown>
  for (const key of CARRY_KEYS) {
    if (!values.has(key)) continue
    record[key] = values.get(key)
  }
  // THE INDEX KEYS ARE THE ONES OF AN ARRAY (`§3c` pin 1), and only its own PRESENT
  // CANONICAL indices are carried: `Object.keys` never lists a HOLE and never
  // lists `length`, so a SPARSE array is carried at its present indices only and
  // so the ascending numeric order is the one `Object.keys` already yields.
  if (Array.isArray(source)) {
    // SPREAD, never `path.concat(source)`: `concat` FLATTENS an array argument,
    // so it would push the ELEMENTS of this array onto the path and every MEMBER would
    // read as its own ancestor (the carry path must hold the ARRAYS themselves).
    const inner = [...path, source]
    for (let i = 0; i < probe.names.length; i += 1) {
      const name = probe.names[i] as string
      if (!isIndexKey(name)) continue
      // `§3d` `A-1`: the MEMBER carry is GUARDED, so a hostile MEMBER — or a chain
      // deep enough to spend the stack — skips THE MEMBER (an absent slot) and
      // never the catalog; a MEMBER already on the carry path IS the CYCLE and
      // gets no slot at all.
      const member = ((): CatalogEntry | null | undefined => {
        try {
          return carries(probe.values[i], inner)
        } catch {
          return null
        }
      })()
      if (member === undefined) continue
      record[name] = member
    }
  }
  return record as unknown as CatalogEntry
}

function asRecord(entry: CatalogEntry): Record<string, unknown> {
  return entry as unknown as Record<string, unknown>
}

export function normalizeCatalog(catalog: unknown): readonly CatalogEntry[] {
  try {
    if (!Array.isArray(catalog)) return []
    const out: CatalogEntry[] = []
    for (let i = 0; i < catalog.length; i += 1) {
      const carried = carries(catalog[i], [])
      if (carried === null || carried === undefined) continue
      out.push(carried)
    }
    return out
  } catch {
    return []
  }
}

function platformProjection(value: unknown): PlatformProjection {
  const isString = typeof value === "string" && value === DARWIN
  return { recognized: typeof value === "string", collapsing: isString }
}

function optionsPlatform(options: unknown): unknown {
  if (options === null) return undefined
  if (typeof options !== "object" && typeof options !== "function") return undefined
  const read = readOwn(options as object, "platform")
  return read.ok ? read.v : undefined
}

function optionsPicker(options: unknown): unknown {
  if (options === null) return undefined
  if (typeof options !== "object" && typeof options !== "function") return undefined
  const read = readOwn(options as object, "picker")
  return read.ok ? read.v : undefined
}

type Invocation = { readonly ok: boolean; readonly answer: unknown }

function invoke(picker: unknown, candidates: readonly CatalogEntry[]): Invocation {
  if (typeof picker !== "function") return { ok: false, answer: undefined }
  try {
    return { ok: true, answer: (picker as PickerFn)(candidates) }
  } catch {
    return { ok: false, answer: undefined }
  }
}

function identityItem(entry: CatalogEntry): ProjectedItem {
  const source = asRecord(entry)
  const item = Object.create(null) as Record<string, unknown>
  // `§3c` pin 1 carries the own present index keys of an ARRAY onto the CARRIED
  // ENTRY (the fresh record of the array itself) — never onto a PROJECTED ITEM,
  // whose key set is EXACTLY the declared-order seven-name intersection
  // (`§2.3` item 2, `R-12(a)` and its EXACTLY-THE-SEVEN rule).
  for (const key of CARRY_KEYS) {
    if (!owns(source, key)) continue
    const read = readOwn(source, key)
    if (!read.ok) continue
    item[key] = read.v
  }
  return item as unknown as ProjectedItem
}

function degradedItem(entry: CatalogEntry): ProjectedItem {
  const item = identityItem(entry) as unknown as Record<string, unknown>
  item["enabled"] = false
  return item as unknown as ProjectedItem
}

function pickerRun(entries: readonly CatalogEntry[], from: number): number {
  const rest = entries.slice(from)
  const stop = rest.findIndex((entry) => asRecord(entry)["kind"] !== PICKER_KIND)
  return stop < 0 ? rest.length : stop
}

function carriesPickerKind(entries: readonly CatalogEntry[]): boolean {
  for (const entry of entries) {
    if (asRecord(entry)["kind"] === PICKER_KIND) return true
  }
  return false
}

function collapsedItem(entry: CatalogEntry, rest: readonly CatalogEntry[], degraded: boolean): ProjectedItem {
  const parent = identityItem(entry) as unknown as Record<string, unknown>
  const submenu: ProjectedItem[] = []
  for (const member of rest) submenu.push(identityItem(member))
  if (degraded) parent["enabled"] = false
  parent["submenu"] = submenu
  return parent as unknown as ProjectedItem
}

function project(entries: readonly CatalogEntry[], collapsing: boolean, degraded: boolean): readonly ProjectedItem[] {
  if (!collapsing) {
    const identity: ProjectedItem[] = []
    for (const entry of entries) identity.push(identityItem(entry))
    return identity
  }
  const items: ProjectedItem[] = []
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index] as CatalogEntry
    if (asRecord(entry)["kind"] !== PICKER_KIND) {
      items.push(identityItem(entry))
      continue
    }
    const run = pickerRun(entries, index)
    if (run <= 1) {
      items.push(degraded ? degradedItem(entry) : identityItem(entry))
      continue
    }
    items.push(collapsedItem(entry, entries.slice(index + 1, index + run), degraded))
    index += run - 1
  }
  return items
}

export function buildMenuTemplate(catalog: unknown, options?: unknown): MenuTemplate {
  try {
    const carrier = normalizeCatalog(catalog)
    const platform = platformProjection(optionsPlatform(options))
    if (!carrier.some((entry) => asRecord(entry)["kind"] === PICKER_KIND)) {
      return { items: project(carrier, platform.collapsing, false), platform }
    }
    const invocation = invoke(optionsPicker(options), carrier)
    return {
      items: project(carrier, platform.collapsing, !invocation.ok),
      platform,
    }
  } catch {
    return { items: [], platform: { recognized: false, collapsing: false } }
  }
}

export function selectCatalogItem(catalog: unknown, picker?: unknown): unknown | null {
  try {
    const carrier = normalizeCatalog(catalog)
    const invocation = invoke(picker, carrier)
    if (!invocation.ok) return null
    const answer = invocation.answer
    if (answer === null || answer === undefined) return null
    for (const entry of carrier) {
      const record = asRecord(entry)
      if (!owns(record, "id")) continue
      const read = readOwn(record, "id")
      if (!read.ok) continue
      if (read.v === answer) return answer
    }
    return null
  } catch {
    return null
  }
}
