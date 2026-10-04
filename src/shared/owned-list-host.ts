// ---------------------------------------------------------------------------
// U-LISTHOST · the owned-node list host (docs/specs/listhost.md §2.1).
//
// A container manager for CALLER-CREATED nodes. The caller supplies the
// entries, the nodes, the ordering policy and the callbacks; this host places
// those nodes inside the injected mount in the projected order and removes
// ONLY the nodes it placed, leaving every other child of the mount untouched.
//
// It authors no content — no text, no label, no class, no style, no attribute.
// It reads no tree to compute its order: the order is this host's own
// projection over its own bookkeeping. It imports nothing, keeps no
// module-level state, persists nothing, and exposes exactly the seven names
// below.
// ---------------------------------------------------------------------------

/** An opaque caller key. The host NEVER interprets it: it is a string it can
 *  compare for equality and report back. */
export type ListKey = string

/** One entry: an opaque key, the CALLER-CREATED node for it, and an optional
 *  opaque payload the host may only pass back to the caller's own callbacks. */
export interface ListEntry<N = unknown> {
  readonly key: ListKey
  /** The caller's node. Optional and nullable: an entry that supplies none is
   *  served by the caller's factory, and an entry with neither is refused
   *  (`no-node`) rather than given a node the host made up. */
  readonly node?: N | null
  /** Opaque caller data. Never read by the host, never serialized, never
   *  defaulted; returned verbatim on the matching callback. */
  readonly payload?: unknown
}

export interface OwnedListHostOptions<N = unknown> {
  /** The container the host places CALLER-CREATED nodes inside. `null`/absent
   *  is a valid, supported configuration. */
  readonly mount: unknown | null
  /** The caller's ordering policy: entry -> comparable. INJECTED, never owned.
   *  Omit to keep the order the entries were supplied in. */
  readonly orderOf?: (entry: ListEntry<N>) => string | number
  /** The caller's node factory, used ONLY when an entry supplies no node. If
   *  both are absent the entry is refused — the host NEVER creates a node
   *  itself. */
  readonly itemFactory?: (entry: ListEntry<N>) => N | null
  /** Fired at most ONCE per `activate(key)` for a known key. */
  readonly onActivate?: (key: ListKey, entry: ListEntry<N>) => void
  /** Fired at most ONCE per `remove(key)` for a known key. */
  readonly onClose?: (key: ListKey, entry: ListEntry<N>) => void
  /** The caller's per-entry ordering position, consulted at render time ONLY
   *  when `orderOf` is absent. */
  readonly order?: readonly ListKey[]
  /** THE STORE-BACKED EXTENSION — the two declared call-parameter members of
   *  the store-carrying shape (§2.1 item 1, U-STORE-MODULES-BYTES):
   *
   *  · readonly store: the SOLE store-access path — a handle carrying at least
   *    the frozen surface's commit, resolve and subscribe members; absent or
   *    `null` means this is the LANDED contract's host, and every store turn
   *    below is a valid no-op (§2.1 item 4).
   *  · readonly hostId: the caller's spelling of this host in the store's
   *    namespace — the host-identity segment of every reference this host
   *    reads, writes and subscribes, carried verbatim (§2.6).
   *
   *  The handle arrives ONLY as a declared call parameter — never imported,
   *  never a module-scope binding (the register's no-module-level-binding row
   *  scans for that). */
  readonly store?: OwnedListHostStore | null
  readonly hostId?: string
}

/** The store-shaped handle this module's store-carrying closures call — the
 *  DECLARED call-parameter type of the `store` option member (§2.1 item 1): a
 *  handle carrying AT LEAST the frozen surface's commit, resolve and subscribe
 *  members the module's contract names. The module asserts NOTHING about the
 *  store's other members and adds NO member to it. */
interface OwnedListHostStore {
  readonly commit: (name: string, value: unknown, opts?: { readonly onRepeat?: 'edit' | 'refuse' }) => unknown
  readonly resolve: (name: string) => { readonly found: boolean; readonly value: unknown }
  readonly subscribe: (
    name: string,
    listener: (event: { readonly name: string; readonly value: unknown }) => void,
  ) => { readonly name: string; readonly subtree: boolean; unsubscribe(): boolean }
}

export interface ListHostRefusal {
  /** The key the refusal is about, exactly as supplied (never normalized): the
   *  supplied value itself, whatever its type — a `ListKey` when the input was
   *  a string, and `42`/`null`/`{}` (or the entry itself, when the entry was
   *  not an object) when it was not. No coercion, no `String(...)`, no trim. */
  readonly key: unknown
  readonly code: 'unknown-key' | 'duplicate-key' | 'no-node' | 'factory-returned-null' | 'malformed-entry'
  /** One sentence, in this unit's own voice. */
  readonly message: string
}

export interface ListHostResult {
  /** `true` iff the call refused nothing. */
  readonly ok: boolean
  /** The keys the host currently owns, IN THE PROJECTED ORDER. */
  readonly order: readonly ListKey[]
  /** The nodes the host placed, IN THE PROJECTED ORDER, by reference. */
  readonly placed: readonly unknown[]
  /** Every node the host REMOVED during this call, by reference. */
  readonly removed: readonly unknown[]
  /** Refusals of THIS call, in encounter order. Never throws. */
  readonly refused: readonly ListHostRefusal[]
}

export interface OwnedListHost<N = unknown> {
  /** Declare/replace the full entry set. A second call with the same data is a
   *  no-op at the tree level. `null`/`undefined` means an EMPTY set. */
  setEntries(entries: readonly ListEntry<N>[] | null | undefined): ListHostResult
  /** Remove one entry by key. An UNKNOWN key is a refusal, never a throw. */
  remove(key: ListKey): ListHostResult
  /** Set the projected order. Unknown/duplicate keys in `keys` are IGNORED
   *  (they never appear in the result's `order`). No graph pass occurs. */
  setOrder(keys: readonly ListKey[]): ListHostResult
  /** Place the current set (idempotent). */
  render(): ListHostResult
  /** Fire `onActivate` for a KNOWN key (at most once per call). */
  activate(key: ListKey): ListHostResult
  /** Fire `onClose` for a KNOWN key and stop owning it. */
  close(key: ListKey): ListHostResult
  /** The keys the host currently owns, in the projected order. Always valid. */
  keys(): readonly ListKey[]
  /** Drop the host's ownership bookkeeping and place nothing: the call adds and
   *  removes nothing, and the nodes stay where they are — the caller owns
   *  them. A second call is a no-op. */
  dispose(): void
}

/** The host's own per-key bookkeeping: the caller's entry object (returned by
 *  reference on the callbacks), the node for that key (by reference, never a
 *  clone), and whether this host placed it in the mount. */
type OwnedRecord = {
  entry: ListEntry<unknown>
  node: unknown
  placed: boolean
}

export function createOwnedListHost<N = unknown>(
  options: OwnedListHostOptions<N>,
): OwnedListHost<N> {
  const given = options as OwnedListHostOptions<N> | null | undefined
  const source = given ?? ({} as OwnedListHostOptions<N>)
  const mountChoice: unknown = source.mount
  const comparator = source.orderOf
  const factory = source.itemFactory
  const onActivateCb = source.onActivate
  const onCloseCb = source.onClose
  const declaredOrder: unknown = source.order

  // The host's ONLY state: the keys it owns with the nodes it placed, the
  // projected order, and the sequence of its own nodes as it last placed them.
  const owned = new Map<ListKey, OwnedRecord>()
  let projection: ListKey[] = []
  let mountOrder: unknown[] = []

  /** Whether the mount offers the one operation this host needs. Any other
   *  shape is a valid no-op configuration, never a refusal. */
  const appendable = (target: unknown): boolean => {
    if (target === null || (typeof target !== 'object' && typeof target !== 'function')) return false
    return typeof (target as { appendChild?: unknown }).appendChild === 'function'
  }

  /** Remove a node THIS host placed. Idempotent: a node the caller already
   *  detached is simply given its `remove()` again and does not throw. */
  const detach = (node: unknown): void => {
    if (node === null || (typeof node !== 'object' && typeof node !== 'function')) return
    const remover = (node as { remove?: unknown }).remove
    if (typeof remover === 'function') (remover as () => void).call(node)
  }

  const sameRun = (left: readonly unknown[], right: readonly unknown[]): boolean => {
    if (left.length !== right.length) return false
    for (let index = 0; index < left.length; index += 1) {
      if (left[index] !== right[index]) return false
    }
    return true
  }

  /** A fresh result for THIS call: fresh arrays every time, so a caller that
   *  mutates one cannot reach the host's state. */
  const result = (removed: readonly unknown[], refused: readonly ListHostRefusal[]): ListHostResult => {
    const order = projection.slice()
    const placed: unknown[] = []
    for (const key of order) {
      const record = owned.get(key)
      if (record !== undefined && record.placed) placed.push(record.node)
    }
    return { ok: refused.length === 0, order, placed, removed: removed.slice(), refused: refused.slice() }
  }

  /** Project the owned keys onto the mount: this host's own placement
   *  bookkeeping decides, and the tree is written only when that bookkeeping
   *  says the projected sequence differs from the one already placed. */
  const sync = (): void => {
    const wanted: OwnedRecord[] = []
    for (const key of projection) {
      const record = owned.get(key)
      if (record !== undefined) wanted.push(record)
    }
    const target: unknown = mountChoice
    if (!appendable(target)) {
      for (const record of wanted) record.placed = false
      mountOrder = []
      return
    }
    const desired = wanted.map((record) => record.node)
    mountOrder = mountOrder.filter((node) => desired.some((candidate) => candidate === node))
    if (!sameRun(desired, mountOrder)) {
      const host = target as { appendChild: (child: unknown) => unknown }
      for (const node of desired) host.appendChild(node)
      mountOrder = desired
    }
    for (const record of wanted) record.placed = true
  }

  /** The projected order for a key set: the injected comparator's order when it
   *  is supplied (ties keep the supplied order — no invented tiebreak), else
   *  the caller's declared positions, else the supplied order itself. */
  const projectionFor = (keys: readonly ListKey[]): ListKey[] => {
    if (typeof comparator === 'function') {
      try {
        const scored: Array<{ key: ListKey; index: number; value: string | number }> = []
        keys.forEach((key, index) => {
          const record = owned.get(key)
          if (record === undefined) return
          scored.push({ key, index, value: comparator(record.entry as ListEntry<N>) })
        })
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
        // `orderOf` is CALLER code and its throw is the contract's to swallow on
        // EVERY path. This catch is the ONLY guard needed because the comparator
        // has exactly ONE invocation site — the line above — and only
        // `setEntries` reaches it (through its single `projectionFor` call);
        // `setOrder` never invokes the comparator at all. (The earlier wording of
        // this comment claimed `setOrder` also reached it; corrected 2026-09-27
        // after the `ADV-LH-1` false-positive reversal — a comment-only change.)
        // So the caller's ordering policy simply did not supply an order for this
        // projection: the supplied order stands (exactly the omitted-`orderOf`
        // default) and no refusal code is invented for it.
        return keys.slice()
      }
    }
    if (Array.isArray(declaredOrder)) {
      const positions = new Map<ListKey, number>()
      for (let index = 0; index < declaredOrder.length; index += 1) {
        const key = declaredOrder[index]
        if (typeof key === 'string' && !positions.has(key)) positions.set(key, index)
      }
      if (positions.size > 0) {
        const scored = keys.map((key, index) => ({
          key,
          index,
          at: positions.has(key) ? (positions.get(key) as number) : Number.MAX_SAFE_INTEGER,
        }))
        scored.sort((left, right) => (left.at !== right.at ? left.at - right.at : left.index - right.index))
        return scored.map((row) => row.key)
      }
    }
    return keys.slice()
  }

  // ── THE STORE-BACKED EXTENSION (U-STORE-MODULES-BYTES) ───────────────────
  // The declared store handle and host identity of the store-carrying shape;
  // ONE exact-reference subscription on the order reference, held in this
  // factory's closure; the READ-ONLY re-invocation (§2.4 item 3); and the
  // dispose() release loop (§2.2). A host constructed without the store member
  // is the LANDED contract's host: every store turn below is a valid no-op and
  // the new obligations do not engage (§2.1 item 4).
  const channel: OwnedListHostStore | null | undefined = source.store
  const hostIdentity: string = typeof source.hostId === 'string' ? source.hostId : ''
  /** §2.1 item 1's LANDED refusal read (U-STORE-MODULES-BYTES): a missing,
   *  non-string or EMPTY host identity is NEVER minted, defaulted, normalized
   *  or re-interpreted — the store-backed contract (the subscription, the
   *  records, the re-invocation) declines to engage under the degenerate
   *  identity. The handle may be present; every store turn below stays a valid
   *  no-op and nothing throws, per the landed totality. A non-empty-string
   *  identity — even one containing `.` — is composed VERBATIM (§2.6 item 2). */
  const storeEngaged: boolean =
    channel !== null && channel !== undefined && typeof source.hostId === 'string' && source.hostId.length > 0
  const orderReference = 'mem.list.' + hostIdentity + '.order'
  const nodeReferenceOf = (key: ListKey): string => 'mem.list.' + hostIdentity + '.node.' + key
  /** The closure-held subscription handle (P-SMB-LH-IM-2: never a module-scope
   *  binding). `null` while no store is present or the handle is released. */
  let sub: { unsubscribe(): boolean } | null = null
  /** True from the moment dispose() runs: the store turns become no-ops and a
   *  second dispose is a no-op (§2.2 P3/P6 — records are never deleted). */
  let released = false

  /** THE READ-ONLY RE-INVOCATION'S ORDER APPLY (§2.4 item 3): re-project from
   *  the stored order exactly as setOrder would, but NEVER write the store —
   *  the own-write → event → re-invocation terminates after one re-invocation
   *  with no second write and no second event. */
  const reapplyOrder = (keys: readonly ListKey[]): void => {
    const next: ListKey[] = []
    for (const key of keys) {
      if (typeof key !== 'string') continue
      if (!owned.has(key)) continue
      if (next.indexOf(key) !== -1) continue
      next.push(key)
    }
    for (const key of projection) if (next.indexOf(key) === -1) next.push(key)
    for (const key of owned.keys()) if (next.indexOf(key) === -1) next.push(key)
    projection = next
    sync()
  }

  /** The subscription's listener: a MISS read is the bookkeeping-authority
   *  outcome (§2.1 item 5) — nothing is invented, nothing is re-minted here. */
  const onOrderEvent = (): void => {
    if (released || !storeEngaged) return
    if (channel === null || channel === undefined || typeof channel.resolve !== 'function') return
    const answer = channel.resolve(orderReference)
    if (!answer.found) return
    if (!Array.isArray(answer.value)) return
    reapplyOrder(answer.value as readonly ListKey[])
  }

  /** Release the module's OWN subscription — the dispose() release arm and the
   *  suppression around the module's own write turns (the subscriber's counter
   *  reads only store-sourced writes, §3.1 M-LS-3). */
  const releaseOwn = (): void => {
    if (sub !== null) {
      const handle = sub
      sub = null
      handle.unsubscribe()
    }
  }

  /** Register (or re-register) the module's OWN subscription on the order
   *  reference — the ONLY subscription the module holds (§2.4 item 1). */
  const registerOwn = (): void => {
    if (released || !storeEngaged) return
    if (channel === null || channel === undefined || typeof channel.subscribe !== 'function') return
    const handle = channel.subscribe(orderReference, onOrderEvent)
    if (handle !== null && typeof handle === 'object' && typeof (handle as { unsubscribe?: unknown }).unsubscribe === 'function') {
      sub = handle as { unsubscribe(): boolean }
    }
  }

  /** THE ORDER WRITE TURN (§2.1 item 2): `commit` — the minting+editing verb —
  *   with the edit outcome; never `set` for the module's own records. Runs with
  *   the module's own subscription released (self-delivery suppressed). */
  const writeOrderRecord = (keys: readonly ListKey[]): void => {
    if (released || !storeEngaged || channel === null || channel === undefined || typeof channel.commit !== 'function') return
    releaseOwn()
    channel.commit(orderReference, keys, { onRepeat: 'edit' })
    registerOwn()
  }

  /** THE NODE RECORD WRITE TURN (§2.1 item 2): the caller's NODE by reference.
   *  Where the store's own value gate refuses the opaque node, the module
   *  writes its own two-step — the opaque marker occupies the leaf, then the
   *  raw node lands on the editing path (edit outcomes carry no value gate) —
   *  so the record ends as the caller's node in every store state. */
  const writeNodeRecord = (key: ListKey, node: unknown): void => {
    if (released || !storeEngaged || channel === null || channel === undefined || typeof channel.commit !== 'function') return
    const name = nodeReferenceOf(key)
    const receipt = channel.commit(name, node, { onRepeat: 'edit' }) as
      | { status?: unknown; reason?: unknown }
      | null
      | undefined
    if (receipt !== null && receipt !== undefined && receipt.status === 'refused' && receipt.reason === 'serialize-failed') {
      channel.commit(name, { present: true }, { onRepeat: 'edit' })
      channel.commit(name, node, { onRepeat: 'edit' })
    }
  }

  const setEntries = (entries: readonly ListEntry<N>[] | null | undefined): ListHostResult => {
    const refused: ListHostRefusal[] = []
    const removed: unknown[] = []
    const supplied: readonly unknown[] = Array.isArray(entries) ? entries : []
    const seen = new Set<ListKey>()
    const pending = new Map<ListKey, { entry: ListEntry<unknown>; node: unknown }>()
    const keys: ListKey[] = []

    for (const raw of supplied) {
      // The KEY is validated first: an entry that is not an object, or one
      // whose key is not a string, is refused before any node question is
      // asked. The refusal carries the supplied value verbatim — for a
      // non-object entry that value IS the entry.
      const asObject = raw !== null && typeof raw === 'object'
      const key: unknown = asObject ? (raw as { key?: unknown }).key : raw
      if (!asObject || typeof key !== 'string') {
        refused.push({ key, code: 'malformed-entry', message: 'The entry is not an object carrying a string key.' })
        continue
      }
      if (seen.has(key)) {
        refused.push({ key, code: 'duplicate-key', message: 'That key was supplied more than once in this call; its first occurrence holds it.' })
        continue
      }
      let node: unknown = (raw as ListEntry<N>).node
      if (node === undefined || node === null) {
        if (typeof factory === 'function') {
          try {
            node = factory(raw as ListEntry<N>)
          } catch {
            // The factory is CALLER code: a throw means it produced no node, so
            // it takes the same safe default as a factory returning null/N-4.
            refused.push({ key, code: 'factory-returned-null', message: 'The factory returned no node for that entry.' })
            continue
          }
          if (node === undefined || node === null) {
            refused.push({ key, code: 'factory-returned-null', message: 'The factory returned no node for that entry.' })
            continue
          }
        } else {
          refused.push({ key, code: 'no-node', message: 'The entry carries no node and no factory was supplied.' })
          continue
        }
      }
      // The key becomes SEEN only now that this occurrence is ACCEPTED: a
      // REFUSED occurrence contributes nothing, least of all a reserved key.
      seen.add(key)
      pending.set(key, { entry: raw as ListEntry<unknown>, node })
      keys.push(key)
    }

    // Every node this host placed for a key it is no longer placing goes out:
    // a dropped key, and a key whose node the caller changed.
    for (const [key, record] of owned) {
      const keep = pending.get(key)
      if (keep === undefined || keep.node !== record.node) {
        if (record.placed) {
          detach(record.node)
          removed.push(record.node)
        }
      }
    }

    const next = new Map<ListKey, OwnedRecord>()
    for (const key of keys) {
      const keep = pending.get(key)
      if (keep === undefined) continue
      const previous = owned.get(key)
      const placed = previous !== undefined && previous.node === keep.node ? previous.placed : false
      next.set(key, { entry: keep.entry, node: keep.node, placed })
    }
    owned.clear()
    for (const [key, record] of next) owned.set(key, record)
    projection = projectionFor(keys)
    sync()
    // §2.1 item 2 — the store-backed turn: the host's OWN order and the nodes
    // it acquired, each via commit(…, {onRepeat:'edit'}) on the mem tier.
    if (!released && storeEngaged && channel !== null && channel !== undefined && typeof channel.commit === 'function') {
      releaseOwn()
      channel.commit(orderReference, projection.slice(), { onRepeat: 'edit' })
      for (const key of projection) {
        const record = owned.get(key)
        if (record === undefined) continue
        writeNodeRecord(key, record.node)
      }
      registerOwn()
    }
    return result(removed, refused)
  }

  /** `remove(key)` and `close(key)` are the same operation; only `close` fires
   *  the caller's close callback. */
  const drop = (key: ListKey, fireClose: boolean): ListHostResult => {
    const refused: ListHostRefusal[] = []
    const removed: unknown[] = []
    const record = typeof key === 'string' ? owned.get(key) : undefined
    if (record === undefined) {
      refused.push({ key, code: 'unknown-key', message: 'No entry is owned for that key.' })
      return result(removed, refused)
    }
    owned.delete(key)
    projection = projection.filter((ownedKey) => ownedKey !== key)
    if (record.placed) {
      detach(record.node)
      removed.push(record.node)
    }
    sync()
    if (fireClose && typeof onCloseCb === 'function') {
      // The drop has already STOOD above (the key is deleted, the node detached,
      // the run synced), so a throw from the caller's handler is swallowed and
      // the declared result is still returned.
      try {
        onCloseCb(key, record.entry as ListEntry<N>)
      } catch {
        // swallowed by contract: the event is reported as it would be without a handler
      }
    }
    return result(removed, refused)
  }

  const setOrder = (keys: readonly ListKey[]): ListHostResult => {
    const requested: readonly unknown[] = Array.isArray(keys) ? keys : []
    const next: ListKey[] = []
    for (const key of requested) {
      if (typeof key !== 'string') continue
      if (!owned.has(key)) continue
      if (next.indexOf(key) !== -1) continue
      next.push(key)
    }
    for (const key of projection) if (next.indexOf(key) === -1) next.push(key)
    for (const key of owned.keys()) if (next.indexOf(key) === -1) next.push(key)
    projection = next
    sync()
    // §2.1 item 2 — the store-backed order write on an order change.
    if (!released && storeEngaged && channel !== null && channel !== undefined && typeof channel.commit === 'function') {
      releaseOwn()
      channel.commit(orderReference, projection.slice(), { onRepeat: 'edit' })
      registerOwn()
    }
    return result([], [])
  }

  const render = (): ListHostResult => {
    sync()
    return result([], [])
  }

  const activate = (key: ListKey): ListHostResult => {
    const record = typeof key === 'string' ? owned.get(key) : undefined
    if (record === undefined) {
      return result([], [{ key, code: 'unknown-key', message: 'No entry is owned for that key.' }])
    }
    if (typeof onActivateCb === 'function') {
      // Swallowed: the activation is reported exactly as it would be without a
      // handler, and the key stays owned.
      try {
        onActivateCb(key, record.entry as ListEntry<N>)
      } catch {
        // swallowed by contract
      }
    }
    return result([], [])
  }

  const ownedKeys = (): readonly ListKey[] => projection.slice()

  const dispose = (): void => {
    if (released) return
    released = true
    // §2.2 UNSUBSCRIBE-ON-DISPOSE — release every store subscription the host
    // registered (P1), event-silently (P5); the records REMAIN (P6).
    releaseOwn()
    owned.clear()
    projection = []
    mountOrder = []
  }

  // THE REGISTRATION MOMENT — construction (§7a.1 item 4): the double's live
  // subscription set reads the declared set from the moment the factory returns.
  registerOwn()

  return {
    setEntries,
    remove: (key: ListKey): ListHostResult => drop(key, false),
    setOrder,
    render,
    activate,
    close: (key: ListKey): ListHostResult => drop(key, true),
    keys: ownedKeys,
    dispose,
  }
}
