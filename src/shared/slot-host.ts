// ---------------------------------------------------------------------------
// U-SLOTHOST · the slot host (docs/specs/slothost.md §2.1).
//
// A per-key container manager for CALLER-CREATED nodes. The caller declares the
// keys once; thereafter it supplies (key -> node) pairs, an injected ordering
// policy, injected attribute/class policies and the injected element factory
// its containers come FROM, and this host places each node in that key's own
// container inside the INJECTED container element.
//
// It authors no content of its own: no text, no label, no class value, no
// attribute, no style, no default node, and no element of its own — every
// container is the value the INJECTED `containerFactory` returned for that key
// (§2.1's container-source clause). It owns exactly the nodes it placed and
// exactly the containers it was given, so a foreign sibling of the injected
// element is never touched. An UNDECLARED key is refused with a typed refusal
// and never silently creates anything. No method throws, for any input shape,
// and a throw from an INJECTED caller function is caught with that function's
// named safe default (§2.1's totality boundary).
//
// The module imports nothing, keeps no module-level mutable state, persists
// nothing, and exposes exactly the seven names §2.1 declares.
// ---------------------------------------------------------------------------

/** An opaque caller key. The host compares it for equality and reports it
 *  back; it NEVER interprets, normalizes, prefixes or enumerates it. */
export type SlotKey = string

/** A caller-supplied attribute write, applied VERBATIM to a caller-created
 *  node. The host neither validates nor defaults either field. */
export interface SlotAttribute {
  readonly name: string
  readonly value: string | number | boolean
}

export interface SlotHostOptions {
  /** The element the per-key containers are created INSIDE. `null`/absent is a
   *  valid, supported configuration (§3.2 `F-6`). */
  readonly container: unknown | null
  /** The DECLARED key set. The host's vocabulary is EXACTLY this list —
   *  nothing may be created for a key outside it (§3.2 `F-1`). */
  readonly keys: readonly SlotKey[]
  /** The caller's ordering policy for the containers, per key. Omitted ⇒ the
   *  supplied `keys` order. */
  readonly orderOf?: (key: SlotKey) => string | number
  /** The caller's class value for a node. Applied VERBATIM. Omitted ⇒ no class
   *  write at all. */
  readonly classNameOf?: (key: SlotKey, node: unknown) => string | null | undefined
  /** The caller's attribute writes for a node. Applied VERBATIM, in order.
   *  Omitted ⇒ no attribute write at all. */
  readonly attributesOf?: (key: SlotKey, node: unknown) => readonly SlotAttribute[] | null | undefined
  /** Notified ONCE per refusal. The host NEVER awaits it and NEVER lets it
   *  change the refusal's outcome (§2.1's injected-callback rule). */
  readonly refuse?: (refusal: SlotHostRefusal) => void
  /** The SOLE container source: the caller's element factory, called once per
   *  declared key that needs a container. The value it returns IS that key's
   *  container, and the accepted shape is "offers `appendChild`" — the same
   *  predicate `isNodeShaped` states below. Absent (or non-callable, or
   *  throwing, or returning an unusable value) ⇒ the EXISTING degradation:
   *  every operation is a valid no-op with a valid state and nothing is
   *  placeable, with no container-state refusal (§2.1's container-source
   *  clause, §3.2 F-12). */
  readonly containerFactory?: (key: SlotKey) => unknown
}

export interface SlotHostRefusal {
  /** The key exactly as supplied: a `SlotKey` when the input was a string, and
   *  the supplied value itself (`42`/`null`/`undefined`/`{}`) when it was not —
   *  with NO coercion, NO `String(...)`, NO trim (§2.1's widened field). */
  readonly key: unknown
  /** The refusal `code` union — FOUR declared members, of which THREE are
   *  emitted by this unit. `'no-container'` is DECLARED-BUT-NOT-EMITTED: the
   *  absent container is a supported no-op and is NOT a refusal (§3.2 `F-6`),
   *  every unusable-container refusal is `'container-not-appendable'` (§3.2
   *  `F-7`), and no third container state exists — so no call emits it (the
   *  negative row `F-11`). */
  readonly code: 'unknown-key' | 'no-container' | 'malformed-node' | 'container-not-appendable'
  /** One sentence, in this unit's own voice. */
  readonly message: string
}

export interface SlotHostResult {
  /** `true` iff nothing was refused. */
  readonly ok: boolean
  /** The declared keys, IN THE PROJECTED CONTAINER ORDER. */
  readonly order: readonly SlotKey[]
  /** Every key that currently holds a host-placed node, in projected order. */
  readonly placed: readonly SlotKey[]
  /** Every node this call REMOVED (the ones the host had placed), by reference. */
  readonly removed: readonly unknown[]
  /** This call's refusals, in encounter order. */
  readonly refused: readonly SlotHostRefusal[]
}

export interface SlotHost {
  /** Declare the node for a key. An UNDECLARED key is refused (never a silent
   *  create). A `null`/malformed node is refused (`malformed-node`). */
  setNode(key: SlotKey, node: unknown | null): SlotHostResult
  /** Remove the node the host placed for a key (unknown key ⇒ refusal). */
  remove(key: SlotKey): SlotHostResult
  /** The projected container order (`orderOf` + supplied `keys`). */
  setOrder(keys: readonly SlotKey[]): SlotHostResult
  /** Place/refresh the current declarations (idempotent). */
  render(): SlotHostResult
  /** The declared keys, in the projected order. Always valid. */
  keys(): readonly SlotKey[]
  /** The container element the host created for a key, or `null` for an
   *  undeclared key. Exposed so the caller can place its OWN content in it. */
  containerFor(key: SlotKey): unknown | null
  /** Relinquish ownership: remove the containers the host created. The
   *  caller's NODES are not destroyed (§2.4 item 5). */
  dispose(): void
}

// ---------------------------------------------------------------------------
// The host's OWN bookkeeping (the six §2.1 exports above are the surface; every
// helper below is private to this module).
// ---------------------------------------------------------------------------

/** One declared key's record: the container this host created for it, the node
 *  the caller handed over, whether the host has actually placed it, and the
 *  placement this key has lost WITHOUT the loss being reported yet. */
type KeyRecord = {
  container: unknown
  node: unknown
  hasNode: boolean
  placed: boolean
  /** The node this host HAD PLACED under this key and has not yet reported: the
   *  `M-9` move RELOCATES an ownership instead of ending it and the move's own
   *  result reports nothing (§3a `A-6`), so the vacated key keeps the fact of
   *  the placement and owes it to the first write that takes that key over
   *  (§2.1's `removed` doc string: *"the ones the host had placed"*). */
  owed: unknown
}

type AnyObject = Record<string, unknown>

function asObject(value: unknown): AnyObject | null {
  if (value === null) return null
  const kind = typeof value
  if (kind !== 'object' && kind !== 'function') return null
  return value as AnyObject
}

/** One container for a key, from the INJECTED element factory — the SOLE
 *  container source (§2.1's container-source clause item 1). `null` is the
 *  named safe default of the fifth injected caller function: absent,
 *  non-callable, throwing or unusable all mean "the key's container is absent",
 *  so every operation stays a valid no-op with a valid state and no refusal is
 *  invented. */
function obtainContainer(value: unknown, key: SlotKey): unknown | null {
  if (typeof value !== 'function') return null
  let made: unknown
  try {
    made = (value as (k: SlotKey) => unknown)(key)
  } catch {
    return null
  }
  return isUsable(made) ? made : null
}

/** Whether a value can serve as the CALLER'S NODE. The caller creates it, so
 *  the only thing this host can honestly require is the one operation that
 *  makes it a node rather than a data value: a value offering `appendChild` —
 *  everything else (`null`, a number, a string, an array, a plain object) is a
 *  malformed node and is refused (`§3.2 F-2`). The host still creates no node
 *  and authors nothing: holding a node is not placing one. */
function isNodeShaped(value: unknown): boolean {
  const object = asObject(value)
  if (object === null) return false
  return typeof object['appendChild'] === 'function'
}

/** The children of an element-shaped value, or `[]` for any other shape. */
function childrenOf(target: unknown): unknown[] {
  const object = asObject(target)
  if (object === null) return []
  const kids = object['children']
  return Array.isArray(kids) ? (kids as unknown[]) : []
}

/** Whether a child is a direct child of a parent, BY REFERENCE. */
function holds(parent: unknown, child: unknown): boolean {
  for (const candidate of childrenOf(parent)) if (candidate === child) return true
  return false
}

/** Whether the injected container is present at all. The contract draws this
 *  line at `null`/`undefined` ONLY: those two are the ABSENT container (the
 *  supported no-op configuration, §3.2 `F-6`), while EVERY other value — `{}`,
 *  `42`, `'div'`, an object whose `appendChild` is not callable — is PRESENT
 *  and merely not-appendable, which is `F-7`'s refusing class (§3.1 `M-14`'s
 *  reconciled cell + §3.2 `F-7`'s per-method table). */
function isPresent(target: unknown): boolean {
  return target !== null && target !== undefined
}

/** Whether a value offers the one operation this host needs to place anything
 *  into it. A present value without it is present-but-unusable (`§3.2 F-7`). */
function isUsable(target: unknown): boolean {
  const object = asObject(target)
  if (object === null) return false
  return typeof object['appendChild'] === 'function'
}

/** Append `child` to `parent`. `false` means the environment refused the write
 *  (a throw, or a factory that is not callable) — never an escaping throw. */
function attach(parent: unknown, child: unknown): boolean {
  const object = asObject(parent)
  if (object === null) return false
  const append = object['appendChild']
  if (typeof append !== 'function') return false
  try {
    ;(append as (c: unknown) => unknown).call(object, child)
    return true
  } catch {
    return false
  }
}

/** Detach a node THIS host placed, idempotently. */
function detach(target: unknown): void {
  const object = asObject(target)
  if (object === null) return
  const remover = object['remove']
  if (typeof remover !== 'function') return
  try {
    ;(remover as () => void).call(object)
  } catch {
    // swallowed: the node's own removal is not this call's outcome
  }
}

/** Whether a value is one of THIS host's own containers. A container is a
 *  value the host was GIVEN, never one it may be handed back as a node: a
 *  container accepted as a node would be attached into itself and the tree
 *  would become cyclic. */
function isOneOfOurContainers(node: unknown, records: Map<SlotKey, KeyRecord>): boolean {
  for (const record of records.values()) {
    if (record.container !== null && record.container === node) return true
  }
  return false
}

export function createSlotHost(options: SlotHostOptions): SlotHost {
  const given = asObject(options)
  const source: SlotHostOptions = (given as SlotHostOptions | null) ?? ({ container: null } as SlotHostOptions)
  const suppliedContainer: unknown = source.container
  const comparator = source.orderOf
  const classPolicy = source.classNameOf
  const attributePolicy = source.attributesOf
  const listener = source.refuse

  // The host's ONLY state: the declared keys in projected order, and one record
  // per declared key. Nothing survives dispose().
  let projection: SlotKey[] = []
  let records = new Map<SlotKey, KeyRecord>()
  // The sequence of this host's own containers as the host last wrote it — the
  // marker that tells a reorder (a real mutation) from an unchanged re-render.
  let written: unknown[] = []

  /** The declared key set: the caller's `keys` list, filtered to the strings
   *  and de-duplicated. Any other shape is the empty declared set (§3.2 F-4). */
  const declaredKeys = (): SlotKey[] => {
    const raw: unknown = source.keys
    if (!Array.isArray(raw)) return []
    const out: SlotKey[] = []
    for (const candidate of raw as unknown[]) {
      if (typeof candidate !== 'string') continue
      if (out.indexOf(candidate) !== -1) continue
      out.push(candidate)
    }
    return out
  }

  /** The projected order for a key list: the injected policy's order when it
   *  supplied one (ties keep the supplied order — no invented tiebreak), else
   *  the supplied order itself. A throw from the injected policy is that
   *  policy's safe default: the supplied `keys` order (§2.1's boundary). */
  const project = (keys: readonly SlotKey[]): SlotKey[] => {
    if (typeof comparator !== 'function') return keys.slice()
    try {
      const scored = keys.map((key, index) => ({ key, index, value: comparator(key) }))
      scored.sort((left, right) => {
        const a = left.value
        const b = right.value
        if (typeof a === 'number' && typeof b === 'number') {
          if (a < b) return -1
          if (a > b) return 1
          return left.index - right.index
        }
        const aText = String(a)
        const bText = String(b)
        if (aText < bText) return -1
        if (aText > bText) return 1
        return left.index - right.index
      })
      return scored.map((row) => row.key)
    } catch {
      return keys.slice()
    }
  }

  /** Create one container per declared key the host has not created yet, and
   *  report the containers the injected element should hold, in child order. */
  const syncContainers = (): unknown[] => {
    const desired: unknown[] = []
    const parentPresent = isPresent(suppliedContainer)
    const parentUsable = isUsable(suppliedContainer)
    for (const key of projection) {
      const record = records.get(key)
      if (record === undefined) continue
      if (record.container === null) {
        if (!parentPresent) continue
        if (!parentUsable) continue
        const created = obtainContainer(source.containerFactory, key)
        if (created === null) continue
        record.container = created
      }
      desired.push(record.container)
    }
    return desired
  }

  /** Project the containers onto the injected element: the host's own
   *  bookkeeping decides what the element should hold, and the element is
   *  written only when the host's own containers are not already the run it
   *  wants. Foreign siblings are never touched and never reordered. */
  const syncOrder = (): void => {
    const desired = syncContainers()
    if (!isUsable(suppliedContainer)) {
      written = []
      return
    }
    const mine = desired.slice()
    for (const key of projection) {
      const record = records.get(key)
      if (record === undefined || record.container === null) continue
      if (mine.indexOf(record.container) === -1) mine.push(record.container)
    }
    const actual = childrenOf(suppliedContainer).filter((child) => mine.indexOf(child) !== -1)
    let unchanged = actual.length === desired.length
    if (unchanged) {
      for (let index = 0; index < desired.length; index += 1) {
        if (actual[index] !== desired[index]) {
          unchanged = false
          break
        }
      }
    }
    if (unchanged) {
      written = desired
      return
    }
    for (const container of desired) detach(container)
    for (const container of desired) attach(suppliedContainer, container)
    written = desired
  }

  /** One refusal, recorded, notified ONCE, and returned in encounter order. A
   *  throw from the caller's listener is swallowed: the refusal is already
   *  recorded and its outcome is unchanged (§2.1's boundary). */
  const refuseWith = (
    key: unknown,
    code: SlotHostRefusal['code'],
    message: string,
    refusals: SlotHostRefusal[],
  ): void => {
    const refusal: SlotHostRefusal = { key, code, message }
    refusals.push(refusal)
    if (typeof listener !== 'function') return
    try {
      listener(refusal)
    } catch {
      // swallowed by contract: the refusal stands
    }
  }

  /** A fresh result for THIS call: fresh arrays every time, so a caller that
   *  mutates one cannot reach the host's state (§3.3 I-9). */
  const result = (removed: readonly unknown[], refused: readonly SlotHostRefusal[]): SlotHostResult => {
    const order = projection.slice()
    const placed: SlotKey[] = []
    for (const key of order) {
      const record = records.get(key)
      if (record !== undefined && record.placed) placed.push(key)
    }
    return {
      ok: refused.length === 0,
      order,
      placed,
      removed: removed.slice(),
      refused: refused.slice(),
    }
  }

  /** The caller's class policy, applied verbatim. `null`/`undefined` (and a
   *  throw, and a malformed value) is NO WRITE for that field (§3.2 F-8). */
  const applyClass = (key: SlotKey, node: unknown): void => {
    if (typeof classPolicy !== 'function') return
    let value: unknown
    try {
      value = classPolicy(key, node)
    } catch {
      return
    }
    if (value === null || value === undefined) return
    if (typeof value !== 'string') return
    const object = asObject(node)
    if (object === null) return
    try {
      object['className'] = value
    } catch {
      // an unwritable node simply keeps no class
    }
  }

  /** The caller's attribute policy, best-effort PER ENTRY (§3.2 F-8): a
   *  malformed entry is skipped without failing the call, a later entry for the
   *  same name wins, and a throw writes nothing at all. */
  const applyAttributes = (key: SlotKey, node: unknown): void => {
    if (typeof attributePolicy !== 'function') return
    let list: unknown
    try {
      list = attributePolicy(key, node)
    } catch {
      return
    }
    if (!Array.isArray(list)) return
    const object = asObject(node)
    if (object === null) return
    const write = object['setAttribute']
    if (typeof write !== 'function') return
    for (const entry of list as unknown[]) {
      const pair = asObject(entry)
      if (pair === null) continue
      const name = pair['name']
      const value = pair['value']
      if (typeof name !== 'string') continue
      const kind = typeof value
      if (kind !== 'string' && kind !== 'number' && kind !== 'boolean') continue
      try {
        ;(write as (n: string, v: unknown) => void).call(object, name, value)
      } catch {
        // swallowed per entry: attribute application is best-effort
      }
    }
  }

  const setNode = (key: SlotKey, node: unknown | null): SlotHostResult => {
    const refusals: SlotHostRefusal[] = []
    const removed: unknown[] = []
    const record = typeof key === 'string' ? records.get(key) : undefined
    if (record === undefined) {
      refuseWith(key, 'unknown-key', 'No container is declared for that key.', refusals)
      return result(removed, refusals)
    }
    if (!isNodeShaped(node)) {
      // A malformed input never removes a valid placement (§3.2 F-2).
      refuseWith(key, 'malformed-node', 'The node is not a node-shaped value.', refusals)
      return result(removed, refusals)
    }
    if (isOneOfOurContainers(node, records)) {
      // A container this host was given is not a node it may be handed: it is
      // refused in the same class, and the container never becomes its own
      // descendant.
      refuseWith(key, 'malformed-node', 'The node is not a node-shaped value.', refusals)
      return result(removed, refusals)
    }
    if (record.hasNode && record.node !== node) {
      // The replacement: the node this host owned for that key goes out.
      detach(record.node)
      removed.push(record.node)
      record.placed = false
    }
    if (record.owed !== null) {
      // The `M-9` move vacated this key WITHOUT reporting the node the host had
      // placed under it (a move ends no ownership, it relocates one — §3a
      // `A-6`), so the write that takes the key over is the call that reports
      // it: the `F-9` reporting path, one step later. A write that re-places
      // that very node relinquishes nothing — it reinstates the placement — so
      // it reports nothing (`removed` never names the node the call PLACES).
      if (record.owed !== node) removed.push(record.owed)
      record.owed = null
    }
    // One node, one key, one container at a time (§2.4 item 6): a node this
    // host had placed under ANOTHER declared key is moved, not duplicated.
    if (!record.hasNode || record.node !== node) {
      for (const [otherKey, other] of records) {
        if (otherKey === key) continue
        if (!other.hasNode || other.node !== node) continue
        detach(other.node)
        // The vacated key keeps the FACT of a placement the host did make —
        // only a placement the host actually made is one it "had placed".
        if (other.placed) other.owed = other.node
        other.hasNode = false
        other.node = null
        other.placed = false
      }
    }
    record.node = node
    record.hasNode = true
    // The containers come FIRST: a container this host was going to create for
    // a declared key exists before the node it is given is placed in it.
    syncContainers()
    if (isPresent(suppliedContainer) && !isUsable(suppliedContainer)) {
      // Present but refused by the environment: ONE refusal per attempted
      // placement, and the host stays in a valid state (§3.2 F-7).
      refuseWith(
        key,
        'container-not-appendable',
        'The injected container is present but refused the write.',
        refusals,
      )
      return result(removed, refusals)
    }
    if (record.container !== null && !holds(record.container, node)) {
      if (!attach(record.container, node)) {
        refuseWith(
          key,
          'container-not-appendable',
          'The injected container is present but refused the write.',
          refusals,
        )
        return result(removed, refusals)
      }
    }
    syncOrder()
    if (record.container !== null && holds(record.container, node)) record.placed = true
    applyClass(key, node)
    applyAttributes(key, node)
    return result(removed, refusals)
  }

  const remove = (key: SlotKey): SlotHostResult => {
    const refusals: SlotHostRefusal[] = []
    const removed: unknown[] = []
    const record = typeof key === 'string' ? records.get(key) : undefined
    if (record === undefined) {
      refuseWith(key, 'unknown-key', 'No container is declared for that key.', refusals)
      return result(removed, refusals)
    }
    if (record.hasNode && isPresent(suppliedContainer) && !isUsable(suppliedContainer)) {
      // The operation relinquishes an ownership the host cannot express in the
      // element: ONE refusal for that key's node (§3.2 F-7's per-method table).
      record.hasNode = false
      record.node = null
      record.placed = false
      refuseWith(
        key,
        'container-not-appendable',
        'The injected container is present but refused the write.',
        refusals,
      )
      return result(removed, refusals)
    }
    if (record.hasNode) {
      // The call that ends the host's ownership of a node is the call that
      // reports it, whether or not the element still held it (§3.2 F-9).
      if (record.placed) detach(record.node)
      removed.push(record.node)
      record.hasNode = false
      record.node = null
      record.placed = false
    }
    return result(removed, refusals)
  }

  const setOrder = (keys: readonly SlotKey[]): SlotHostResult => {
    // A write-free operation: undeclared and duplicate keys are IGNORED, never
    // refused, and no container-state refusal is producible here.
    const requested: readonly unknown[] = Array.isArray(keys) ? (keys as unknown[]) : []
    const next: SlotKey[] = []
    for (const candidate of requested) {
      if (typeof candidate !== 'string') continue
      if (!records.has(candidate)) continue
      if (next.indexOf(candidate) !== -1) continue
      next.push(candidate)
    }
    for (const key of projection) if (next.indexOf(key) === -1) next.push(key)
    for (const key of records.keys()) if (next.indexOf(key) === -1) next.push(key)
    projection = next
    syncOrder()
    return result([], [])
  }

  const render = (): SlotHostResult => {
    const refusals: SlotHostRefusal[] = []
    const removed: unknown[] = []
    for (const key of projection) {
      const record = records.get(key)
      if (record === undefined || !record.hasNode) continue
      if (record.placed) continue
      if (isPresent(suppliedContainer) && !isUsable(suppliedContainer)) {
        // ONE refusal per key the call attempts to place (§3.2 F-7).
        refuseWith(
          key,
          'container-not-appendable',
          'The injected container is present but refused the write.',
          refusals,
        )
        continue
      }
      if (record.container === null) continue
      if (holds(record.container, record.node)) {
        record.placed = true
        continue
      }
      if (attach(record.container, record.node)) {
        record.placed = true
      }
    }
    syncOrder()
    return result(removed, refusals)
  }

  const keys = (): readonly SlotKey[] => projection.slice()

  const containerFor = (key: SlotKey): unknown | null => {
    const record = typeof key === 'string' ? records.get(key) : undefined
    if (record === undefined) return null
    return record.container
  }

  const dispose = (): void => {
    const containers: unknown[] = []
    for (const record of records.values()) {
      if (record.container !== null) containers.push(record.container)
    }
    for (const container of containers) detach(container)
    records = new Map<SlotKey, KeyRecord>()
    projection = []
    written = []
  }

  // The declared keys, projected once at construction time. No container is
  // created here: an operation that writes nothing — and a host that is never
  // driven at all — creates nothing (§3.2 F-1's no-silent-create half).
  const declared = declaredKeys()
  projection = project(declared)
  for (const key of projection) records.set(key, { container: null, node: null, hasNode: false, placed: false, owed: null })

  return { setNode, remove, setOrder, render, keys, containerFor, dispose }
}
