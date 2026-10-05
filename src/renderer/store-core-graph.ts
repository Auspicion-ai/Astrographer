// src/renderer/store-core-graph.ts — `U-STORE-CORE`'s successor: the AMENDED
// four-tier store on a node-anchor-link graph (`§2.1` item 1, `§1` item 1).
//
// THE GRAPH IS THE SOURCE OF TRUTH. The tier token is a FILTER and a node's own
// `flag` is the ONLY residency carrier (`§2.3` item 1, `§2.1`'s named-invariant
// block). The register is the graph's TOP-LEVEL PROJECTION and nothing below a
// root (`§2.4`'s ruling block). The two caches are invalidated by rule and
// rebuilt AT THE INVALIDATION SITE, never on the read path (`§2.6` item 4).

import { storeGraphReferences, type StoreGraphDeclarationInput } from './store-graph-references.js'

/* ───────────────────────────── THE CLOSED DOMAINS ───────────────────────────── */

export type GraphTierToken = 'temp' | 'mem' | 'file' | 'secure'

export type GraphNodeFlag = 'temp' | 'mem' | 'file'

export type GraphRefusalReason =
  | 'undeclared-name' | 'malformed-name' | 'secure-refused' | 'reserved-name'
  | 'malformed-pattern' | 'cap-exceeded' | 'ambiguous-path' | 'reserved-namespace'
  | 'duplicate-path-tier' | 'no-such-anchor' | 'severed-link' | 'rebuild-failed' | 'tier-filter-miss'
  | 'serialize-failed' | 'validate-failed' | 'durability-inversion'

export type GraphResolveStep =
  | 'A-PARSE' | 'B-SECURE-GATE' | 'C-TOP' | 'D-ANCHOR' | 'E-LINK' | 'F-CACHE' | 'G-RESOLVE-LEAF' | 'H-FLAG'

export interface GraphResolveDiagnostic {
  readonly reason: GraphRefusalReason
  readonly step: GraphResolveStep
  readonly segment: string | null
  readonly owner: GraphNodeRef | null
}

/* ───────────────────────────── THE GRAPH ───────────────────────────── */

export type GraphNodeRef = string

export interface GraphNode {
  readonly ref: GraphNodeRef
  readonly flag: GraphNodeFlag
  readonly localName: string
  readonly anchors: readonly GraphAnchor[]
  readonly parentLink: GraphLink | null
}

export interface GraphAnchor {
  readonly owner: GraphNodeRef
  readonly key: string
  readonly link: GraphLink | null
}

export interface GraphLink {
  readonly from: GraphNodeRef
  readonly to: GraphNodeRef | null
  readonly cache: GraphLinkCacheEntry
  readonly constraint: string | null
}

export interface GraphTierHandle {
  readonly tier: GraphTierToken
  get(name: string): GraphTierGetResult
  has(name: string): boolean
  set(name: string, value: unknown, opts?: GraphWriteOptions): GraphWriteReceipt
  clear(name: string): GraphWriteReceipt
}

export interface GraphTierGetResult {
  readonly found: boolean
  readonly value: unknown
  readonly name: string
}

/* ───────────────────────────── THE REGISTER AND THE TWO CACHES ───────────────────────────── */

export interface GraphRegisterRow {
  readonly name: string
  readonly nodeRef: GraphNodeRef | null
  readonly constraintId: string | null
  readonly reserved: boolean
  readonly derived: boolean
}

export interface GraphRegister {
  readonly rows: readonly GraphRegisterRow[]
}

export interface GraphRegisterCacheEntry {
  readonly name: string
  readonly matchedRef: GraphNodeRef
  readonly matchedTier: GraphNodeFlag
}

export interface GraphLinkCacheEntry {
  readonly name: string
  readonly matchedRef: GraphNodeRef
  readonly matchedTier: GraphNodeFlag
}

/* ───────────────────────────── THE CONSTRAINT SURFACE ───────────────────────────── */

/**
 * THE CONSTRAINT MEMBER — RE-DERIVED 2026-10-03 (`CONSTRAINTS-ARE-PASSED-FUNCTIONS`,
 * `docs/decisions.md`'s ACTIVE row, cited by row name; the unit's frozen-surface artifact
 * field 2, `AMENDMENT CONSTRAINT-RE-DERIVE-1`).
 *
 * THE SUPERSEDED SEVEN-MEMBER DATA-ROW FORM, KEPT VISIBLE BESIDE (`RCA-8(d)`
 * ANNOTATE-BESIDE — never deleted; every member of the as-filed form is a member of the
 * SUPERSEDED model, OUTSIDE the operative surface):
 *
 *     interface GraphConstraint {
 *       readonly id: string
 *       readonly kind: 'count-exactly-one' | 'unique-path-tier'
 *       readonly matchedSet: string
 *       readonly evaluatedOn: readonly ('set' | 'commit' | 'remove')[]
 *       readonly repair: 'next-surviving-by-order' | 'none'
 *       readonly onRepeat: 'edit' | 'refuse'
 *       readonly refusalReason: GraphRefusalReason | null
 *     }
 *
 * THE OPERATIVE MEMBER IS THE FUNCTION-CARRIER. `constraint` is a PASSED FUNCTION the
 * write machinery calls with `(changed, current, next, feedback?)` — the changed data,
 * the current (pre-write) state and the landed post-state `next` — expecting a boolean
 * and optionally an error message / refusal reason delivered back through `feedback`.
 * `repair` is an optional PASSED FUNCTION called on a violation, taking corrective
 * action to the data IN THE SAME COMMITTED WRITE and outputting a success boolean plus
 * an optional error message. CONSTRAINTS ARE CODE FEATURES, NOT DATA: no install path,
 * no runtime table mutation. `matchedSet` is a caller-supplied name the write machinery
 * resolves to the data checked (the operation's own top-level name); `evaluatedOn`
 * `⊆ {'set','commit','remove'}` is UNCHANGED. `unique-path/tier` is a GLOBAL BEHAVIORAL
 * STATE of the graph — NOT a constraint: its `{onRepeat}`/`{onDuplicate}` pair routing
 * stays in the write machinery (`'duplicate-path-tier'` and the invariant clauses),
 * never a caller row. `count-exactly-one` is the WORKED EXAMPLE of the general-purpose
 * system — its three-arm repair (de-activate surplus active entries; re-activate the
 * most-recently-active from the entries' own local data; open the landing page on an
 * empty set) is the CALLER-SUPPLIED passed repair function, never a store-owned
 * `'next-surviving-by-order'` token repair.
 */
export interface GraphConstraint {
  readonly id: string
  readonly matchedSet: string
  readonly evaluatedOn: readonly ('set' | 'commit' | 'remove')[]
  readonly constraint: (
    changed: unknown,
    current: unknown,
    next: unknown,
    feedback?: { reason?: string; message?: string },
  ) => boolean
  readonly repair?: (nextState: unknown, feedback?: { reason?: string; message?: string }) => boolean
}

/* ───────────────────────────── THE READ AND THE WALK ───────────────────────────── */

export interface GraphReadHit {
  readonly found: true
  readonly value: unknown
  readonly tier: GraphNodeFlag
  readonly flag: GraphNodeFlag
  readonly cache: GraphTierHandle
  readonly name: string
}

export interface GraphReadMiss {
  readonly found: false
  readonly value: undefined
  readonly tier: null
  readonly cache: null
  readonly name: string
}

export type GraphResolveResult = GraphReadHit | GraphReadMiss

export interface GraphWriteReceipt {
  readonly status: 'committed' | 'refused'
  readonly reason?: GraphRefusalReason
  readonly diagnostic?: GraphResolveDiagnostic
  readonly name: string
  readonly cleared: readonly string[]
  readonly repaired: readonly string[]
  readonly rows: readonly GraphAffectedRow[]
  readonly crossings: number
  readonly events: number
}

export interface GraphAffectedRow {
  readonly name: string
  readonly flag: GraphNodeFlag
  readonly nodeRef: GraphNodeRef
}

export interface GraphWriteOptions {
  readonly onRepeat?: 'edit' | 'refuse'
  readonly onDuplicate?: 'edit' | 'refuse'
}

/* ───────────────────────────── THE EVENT SURFACE ───────────────────────────── */

export interface GraphEvent {
  readonly name: string
  readonly flag: GraphNodeFlag
  readonly value: unknown
  readonly cleared: readonly string[]
  readonly cause: 'set' | 'commit' | 'clear' | 'sweep' | 'remove' | 'repair' | 'descendant' | 'severed'
  readonly origin?: string
  readonly subtree?: true
}

export interface GraphSubscription {
  readonly name: string
  readonly subtree: boolean
  unsubscribe(): boolean
}

/* ───────────────────────────── THE SEAMS, THE FACTORY, THE STORE ───────────────────────────── */

export interface GraphCrossing {
  put(row: { readonly name: string; readonly value: unknown }): { readonly status: 'committed' | 'refused' }
}

export interface GraphLoadError extends Error {
  readonly reason: GraphRefusalReason
}

export interface GraphStore {
  resolve(name: string): GraphResolveResult
  set(name: string, value: unknown, opts?: GraphWriteOptions): GraphWriteReceipt
  commit(name: string, value: unknown, opts?: GraphWriteOptions): GraphWriteReceipt
  remove(name: string): GraphWriteReceipt
  clear(name: string): GraphWriteReceipt
  sweep(name: string): GraphWriteReceipt
  export(name: string): GraphResolveResult | GraphRefusalReason
  sever(from: string, anchorKey: string): GraphWriteReceipt
  subscribe(name: string, listener: (event: GraphEvent) => void, opts?: { subtree?: boolean }): GraphSubscription
  readonly tiers: Readonly<Record<GraphNodeFlag, GraphTierHandle>>
  readonly register: GraphRegister
  readonly constraints: readonly GraphConstraint[]
  /** THE BOOT-HYDRATION SEAM (frozen-surface field 2, the `HYDRATE-1` amendment —
   *  PRODUCTION-PRESENT, never a test-seam key): mints the file-tier nodes the handed-off
   *  record names, fires the event surface BY DESIGN (the boot-load events ARE the
   *  consumer-notification channel), never crosses, never evaluates the constraint table,
   *  skips malformed rows (never a throw), returns void. */
  hydrate(rows: readonly { readonly name: string; readonly value: unknown }[]): void
  reset?(): void
  seed?(rows: readonly { readonly name: string; readonly value: unknown }[]): void
  parentLinkCountOf?(nodeRef: GraphNodeRef): number
  cacheEntryFor?(name: string): GraphRegisterCacheEntry | null
  nodeFor?(nodeRef: GraphNodeRef): GraphNode | null
  anchorFor?(owner: GraphNodeRef, key: string): GraphAnchor | null
  linkFor?(owner: GraphNodeRef, key: string): GraphLink | null
  failNextCacheRebuild?(): void
}

/* ───────────────────────────── THE MODULE'S OWN TOKENS ───────────────────────────── */

const TIER_TOKENS: readonly GraphTierToken[] = ['temp', 'mem', 'file', 'secure']
const NODE_FLAGS: readonly GraphNodeFlag[] = ['temp', 'mem', 'file']
const STEP_IDS: readonly GraphResolveStep[] = [
  'A-PARSE', 'B-SECURE-GATE', 'C-TOP', 'D-ANCHOR', 'E-LINK', 'F-CACHE', 'G-RESOLVE-LEAF', 'H-FLAG',
]
const EVENT_CAUSES: readonly GraphEvent['cause'][] = [
  'set', 'commit', 'clear', 'sweep', 'remove', 'repair', 'descendant', 'severed',
]
const DURABILITY_RANK: Readonly<Record<string, number>> = { file: 3, mem: 2, temp: 1 }
const REGISTER_ROOT_CAP_MEM = 1024
const REGISTER_ROOT_CAP_TEMP = 4096
const AMPLIFIER_SUBSCRIPTION_CAP = 64
const SEAM_KEYS: readonly string[] = [
  'reset', 'seed', 'parentLinkCountOf', 'cacheEntryFor',
  'nodeFor', 'anchorFor', 'linkFor', 'failNextCacheRebuild',
]

interface ParsedName {
  readonly token: GraphTierToken | null
  readonly segments: readonly string[]
}

interface DeclaredSpelling {
  readonly name: string
  readonly reserved: boolean
}

interface RootDeclaration {
  readonly root: string
  /** EVERY spelling the caller declared for this root (`§2.4` item 8's annotation: a
   *  declaration NAMES a root name and contributes no row). `reserved` is a property of the
   *  SPELLING, not of the root (`§2.4` item 1(d), `F-20`: the refusal is BY NAME). */
  readonly names: readonly DeclaredSpelling[]
}

interface ValueEntry {
  readonly name: string
  readonly ref: GraphNodeRef
  value: unknown
  active: boolean
}

interface SubscriberRecord {
  readonly name: string
  readonly subtree: boolean
  readonly listener: (event: GraphEvent) => void
  live: boolean
}

interface PathWalk {
  readonly rootName: string
  readonly token: GraphTierToken
  readonly tail: readonly string[]
  readonly node: GraphNode | null
  readonly deepest: GraphNode | null
  readonly severed: boolean
  readonly firstMissing: string | null
  readonly stale: boolean
}

interface ReceiptState {
  diagnostic?: GraphResolveDiagnostic
  cleared: string[]
  repaired: string[]
  rows: GraphAffectedRow[]
  crossings: number
  events: number
}

interface AffectedRef {
  readonly name: string
  readonly flag: GraphNodeFlag
  readonly ref: GraphNodeRef
}

interface WriteName {
  readonly name: string
  readonly token: GraphNodeFlag
  readonly segments: readonly string[]
  readonly rootName: string
  readonly tail: readonly string[]
}

/* ───────────────────────────── SMALL HELPERS ───────────────────────────── */

function isTierToken(value: unknown): value is GraphTierToken {
  return typeof value === 'string' && (TIER_TOKENS as readonly string[]).includes(value)
}

function isFlagToken(value: unknown): value is GraphNodeFlag {
  return typeof value === 'string' && (NODE_FLAGS as readonly string[]).includes(value)
}

function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseName(raw: unknown): ParsedName {
  if (typeof raw !== 'string' || raw.length === 0) return { token: null, segments: [] }
  const segments = raw.split('.')
  for (const segment of segments) if (segment.length === 0) return { token: null, segments: [] }
  return { token: isTierToken(segments[0]) ? segments[0] : null, segments }
}

function miss(name: string): GraphReadMiss {
  return { found: false, value: undefined, tier: null, cache: null, name }
}

/** ⟶ AMENDED 2026-10-03 (`UNIT-ADV-1`, G4-F5, ANNOTATE-BESIDE): THE EXPORT NEVER ALIASES A
   *  LIVE STORED OBJECT, PINNED — a FRESH deep copy at EVERY depth, with NO depth bound above
   *  which the live object is returned. The copy is CYCLE-SAFE (a `seen` map preserves the
   *  structure and terminates on a self/mutual reference) and PROTOTYPE-SAFE (G4-F6: outputs
   *  are built with `Object.create(null)`, so a caller-owned hostile key rides as DATA, never
   *  as the copy's prototype). Mutating the copy at ANY depth never mutates the store. */
  function snapshotValue(value: unknown): unknown {
    const seen = new Map<unknown, unknown>()
    const copy = (candidate: unknown): unknown => {
      if (candidate === null || typeof candidate !== 'object') return candidate
      const already = seen.get(candidate)
      if (already !== undefined) return already
      if (Array.isArray(candidate)) {
        const out: unknown[] = []
        seen.set(candidate, out)
        for (const item of candidate) out.push(copy(item))
        return out
      }
      const out: Record<string, unknown> = Object.create(null)
      seen.set(candidate, out)
      for (const key of Object.keys(candidate as Record<string, unknown>)) {
        out[key] = copy((candidate as Record<string, unknown>)[key])
      }
      return out
    }
    return copy(value)
  }

function serializationFailureOf(value: unknown): 'serialize-failed' | 'validate-failed' | null {
  const seen = new Set<unknown>()
  const inspect = (candidate: unknown): 'serialize-failed' | 'validate-failed' | null => {
    if (candidate === undefined || candidate === null) return null
    const kind = typeof candidate
    if (kind === 'string' || kind === 'boolean') return null
    if (kind === 'number') return Number.isFinite(candidate as number) ? null : 'serialize-failed'
    if (kind === 'bigint' || kind === 'function' || kind === 'symbol') return 'serialize-failed'
    if (seen.has(candidate)) return 'serialize-failed'
    seen.add(candidate)
    try {
      if (Array.isArray(candidate)) {
        for (const item of candidate) {
          const failure = inspect(item)
          if (failure !== null) return failure
        }
        return null
      }
      for (const key of Object.keys(candidate as Record<string, unknown>)) {
        const failure = inspect((candidate as Record<string, unknown>)[key])
        if (failure !== null) return failure
      }
    } catch {
      return 'validate-failed'
    } finally {
      seen.delete(candidate)
    }
    return null
  }
  return inspect(value)
}

/* ───────────────────────────── THE FACTORY AND THE ERROR ───────────────────────────── */

export function createGraphStoreError(message: string, reason: GraphRefusalReason): GraphLoadError {
  const error = new Error(message) as Error & { reason: GraphRefusalReason }
  error.name = 'GraphLoadError'
  error.reason = reason
  return error as GraphLoadError
}

export function createGraphStore(options: {
  readonly declarations?: StoreGraphDeclarationInput
  readonly constraints?: readonly GraphConstraint[]
  readonly crossing?: GraphCrossing | null
  readonly reservedNamespaces?: readonly string[]
  readonly enableTestSeam?: boolean
} = {}): GraphStore {
  const nodes = new Map<GraphNodeRef, GraphNode>()
  const declared = new Map<string, RootDeclaration>()
  const rootHolders = new Map<string, GraphNode[]>()
  const registerEntries = new Map<string, GraphRegisterCacheEntry>()
  const staleEntries = new Set<string>()
  const values: ValueEntry[] = []
  const severLog = new Map<string, readonly string[]>()
  const handles = new Map<GraphNodeFlag, GraphTierHandle>()
  let subscriptions: SubscriberRecord[] = []
  let refCounter = 0
  let injectArmed = false
  const seamEnabled = options.enableTestSeam === true
  const crossing: GraphCrossing | null = options.crossing ?? null

  const declaredInput = options.declarations === undefined ? { rows: [] } : options.declarations
  const declaredRows: readonly unknown[] = isRecordObject(declaredInput) && Array.isArray((declaredInput as StoreGraphDeclarationInput).rows)
    ? (declaredInput as StoreGraphDeclarationInput).rows
    : []
  const reservedNames: readonly unknown[] = Array.isArray(options.reservedNamespaces) ? options.reservedNamespaces : []
  // THE CALLER-SUPPLIED CONSTRAINT MEMBERS, HELD BY IDENTITY (`§2.7` items 1/2, RE-DERIVED
  // 2026-10-03: CONSTRAINTS-ARE-PASSED-FUNCTIONS) — CODE FEATURES, never runtime-mutable
  // data: no install path, no table mutation; the store's `constraints` view carries the
  // very same array. The factory is TOTAL and never refuses construction over the
  // members' contents — a non-array option is simply the empty set.
  const constraints: readonly GraphConstraint[] = Array.isArray(options.constraints) ? options.constraints : []

  /* ── THE DECLARED-ROW INPUT AND ITS CLOSED REFUSAL SET (`§2.4` item 5) ── */

  function loadDeclarations(): void {
    const seen = new Set<string>()
    for (const raw of declaredRows) {
      if (!isRecordObject(raw)) throw createGraphStoreError('a declared row is a record', 'malformed-name')
      const name = (raw as { readonly name?: unknown }).name
      if (typeof name !== 'string' || name.length === 0) {
        throw createGraphStoreError('a declared row carries no name, a non-string or an empty name', 'malformed-name')
      }
      const segments = name.split('.')
      for (const segment of segments) {
        if (segment.length === 0) throw createGraphStoreError('a declared name carries an empty segment', 'malformed-name')
      }
      if (segments[0] === 'secure') {
        throw createGraphStoreError('a declared name carries the secure first segment', 'secure-refused')
      }
      const qualified = isTierToken(segments[0]) && segments.length >= 2
      const root = qualified ? (segments[1] as string) : (segments[0] as string)
      if (root.includes('*') || root.includes('?')) {
        throw createGraphStoreError('a malformed or ambiguous top-level pattern', 'malformed-pattern')
      }
      for (const reserved of reservedNames) {
        if (typeof reserved === 'string' && reserved === root) {
          throw createGraphStoreError('a declared name collides with a reserved namespace key', 'reserved-namespace')
        }
      }
      if (seen.has(name)) throw createGraphStoreError('a top-level name declared twice', 'undeclared-name')
      seen.add(name)
      const prior = declared.get(root)
      const spelling: DeclaredSpelling = { name, reserved: (raw as { readonly reserved?: unknown }).reserved === true }
      declared.set(root, {
        root,
        names: prior === undefined ? [spelling] : [...prior.names, spelling],
      })
    }
  }

  /* ── THE REGISTER (`§2.4`) ── */

  /** THE ROOT HOLDERS of a top-level name: a holder is a node with NO PARENT LINK — a
   *  top-level node of a descendant tree (`§2.4`'s ruling block). A node that has been
   *  re-parented under another root is NOT a holder, whatever the registry last saw. */
  function holdersOf(rootName: string): GraphNode[] {
    const held = rootHolders.get(rootName)
    if (held === undefined) return []
    return held.filter((holder) => holder.parentLink === null)
  }

  /** THE LIVE HOLDERS: the held roots whose node still exists in the graph. */
  function liveHolders(rootName: string): GraphNode[] {
    return rootHolders.get(rootName)?.filter((holder) => holder.parentLink === null && nodes.get(holder.ref) !== undefined) ?? []
  }

  /** THE LOWEST-DURABILITY MATCH (`§2.6` item 1): the holder the FILTER selects, or the
   *  most durable one where no tier token was asked for. */
  function holderOf(rootName: string, token: GraphTierToken | null): GraphNode | null {
    const held = liveHolders(rootName)
    if (held.length === 0) return null
    const sorted = [...held].sort((a, b) => (DURABILITY_RANK[b.flag] ?? 0) - (DURABILITY_RANK[a.flag] ?? 0))
    if (token !== null && token !== 'secure') {
      for (const node of sorted) if (node.flag === token) return node
      return null
    }
    return sorted[0] as GraphNode
  }

  function holders(): GraphNode[] {
    const out: GraphNode[] = []
    for (const rootName of rootHolders.keys()) for (const holder of liveHolders(rootName)) out.push(holder)
    return out
  }

  function setHolder(rootName: string, node: GraphNode): void {
    const held = holdersOf(rootName)
    const next: GraphNode[] = []
    for (const existing of held) if (existing.ref !== node.ref) next.push(existing)
    next.push(node)
    rootHolders.set(rootName, next)
  }

  function dropHolder(rootName: string, ref: GraphNodeRef): void {
    const held = holdersOf(rootName)
    rootHolders.set(rootName, held.filter((node) => node.ref !== ref))
  }

  function registerRows(): GraphRegisterRow[] {
    const rows: GraphRegisterRow[] = []
    for (const declaration of declared.values()) {
      const holder = holderOf(declaration.root, null)
      if (holder === null) continue
      rows.push({ name: declaration.root, nodeRef: holder.ref, constraintId: null, reserved: declaration.names.some((spelling) => spelling.reserved), derived: true })
    }
    return rows
  }

  function entryIsLive(entry: GraphRegisterCacheEntry): boolean {
    const matched = nodes.get(entry.matchedRef)
    if (matched === undefined) return false
    if (matched.flag !== entry.matchedTier) return false
    for (const holder of liveHolders(entry.name)) if (holder.ref === entry.matchedRef) return true
    return false
  }

  function rebuildEntriesAtInvalidation(name: string): void {
    const node = holderOf(name, null)
    if (node === null) {
      registerEntries.delete(name)
      staleEntries.delete(name)
      return
    }
    const entry: GraphRegisterCacheEntry = { name, matchedRef: node.ref, matchedTier: node.flag }
    if (injectArmed) {
      injectArmed = false
      staleEntries.add(name)
      if (!registerEntries.has(name)) registerEntries.set(name, entry)
      return
    }
    registerEntries.set(name, entry)
    staleEntries.delete(name)
  }

  /* ── GRAPH PRIMITIVES ── */

  function mintRef(): GraphNodeRef {
    refCounter += 1
    return `graph-node-${refCounter}`
  }

  function linkEntry(name: string, matchedRef: GraphNodeRef, matchedTier: GraphNodeFlag): GraphLinkCacheEntry {
    return { name, matchedRef, matchedTier }
  }

  function anchorOf(ownerRef: GraphNodeRef, key: string): GraphAnchor | null {
    const owner = nodes.get(ownerRef)
    if (owner === undefined) return null
    for (const anchor of owner.anchors) if (anchor.key === key) return anchor
    return null
  }

  function withAnchor(ownerRef: GraphNodeRef, key: string, link: GraphLink): void {
    const owner = nodes.get(ownerRef)
    if (owner === undefined) return
    const kept: GraphAnchor[] = []
    for (const anchor of owner.anchors) if (anchor.key !== key) kept.push(anchor)
    nodes.set(ownerRef, {
      ref: owner.ref,
      flag: owner.flag,
      localName: owner.localName,
      anchors: [...kept, { owner: ownerRef, key, link }],
      parentLink: owner.parentLink,
    })
  }

  function valueOf(ref: GraphNodeRef): unknown {
    for (const entry of values) if (entry.ref === ref) return entry.value
    return undefined
  }

  /** WHETHER the reference carries a VALUE ENTRY OF ITS OWN (field 2's `clear` row +
   *  `value` row; `§2.5` item 4(iii)'s subject — the DECLARED-BUT-UNWRITTEN PARENT WITH A
   *  WRITTEN CHILD). The walk's presence check reads THIS, never the value's substance
   *  (`§2.2 P-6`/`P-9`: any JavaScript value including `undefined` is in-domain): a node that
   *  exists only structurally (cleared, or minted as a path's intermediate) has NO entry and
   *  answers the DECLARED MISS, while a WRITTEN leaf holding `undefined` as its own value HAS
   *  an entry and answers the HIT — the discrimination is ENTRY-PRESENCE, never value. */
  function hasValueEntry(ref: GraphNodeRef): boolean {
    for (const entry of values) if (entry.ref === ref) return true
    return false
  }

  function setValue(ref: GraphNodeRef, name: string, value: unknown): void {
    for (const entry of values) {
      if (entry.ref === ref) {
        entry.value = value
        return
      }
    }
    values.push({ name, ref, value, active: false })
  }

  function dropValue(ref: GraphNodeRef): void {
    for (let i = values.length - 1; i >= 0; i -= 1) if (values[i]?.ref === ref) values.splice(i, 1)
  }

  function descendantsOf(node: GraphNode): GraphNode[] {
    const out: GraphNode[] = []
    for (const anchor of node.anchors) {
      if (anchor.link === null || anchor.link.to === null) continue
      const child = nodes.get(anchor.link.to)
      if (child !== undefined) out.push(child)
    }
    return out
  }

  /** REMOVE ONE REFERENCE FROM THE GRAPH (`§2.8` item 2's clear, `§2.8` item 4's downward
   *  removal): the reference is SEVERED from its parent and its own value is dropped. The
   *  node's DESCENDANTS are NOT torn down, because another tier's branch may hold them and
   *  the tiers COMPOSE (`§2.3` item 5) — the graph is the source of truth, and a copy of a
   *  descendant is a node of its own. */
  function detach(ref: GraphNodeRef): void {
    const node = nodes.get(ref)
    if (node === undefined) return
    dropValue(ref)
    if (node.parentLink === null) {
      for (const rootName of rootHolders.keys()) dropHolder(rootName, ref)
      return
    }
    const parent = nodes.get(node.parentLink.from)
    if (parent !== undefined) {
      const kept: GraphAnchor[] = []
      for (const anchor of parent.anchors) {
        if (anchor.link === null || anchor.link.to !== ref) kept.push(anchor)
      }
      nodes.set(parent.ref, {
        ref: parent.ref,
        flag: parent.flag,
        localName: parent.localName,
        anchors: kept,
        parentLink: parent.parentLink,
      })
    }
  }

  function dropSubtree(ref: GraphNodeRef): void {
    const node = nodes.get(ref)
    nodes.delete(ref)
    dropValue(ref)
    if (node === undefined) return
    for (const anchor of node.anchors) {
      if (anchor.link !== null && anchor.link.to !== null) dropSubtree(anchor.link.to)
    }
  }

  function subtreeOf(ref: GraphNodeRef): GraphNode[] {
    const node = nodes.get(ref)
    if (node === undefined) return []
    const out: GraphNode[] = [node]
    for (const anchor of node.anchors) {
      if (anchor.link !== null && anchor.link.to !== null) out.push(...subtreeOf(anchor.link.to))
    }
    return out
  }

  /** THE HIGHEST NODE of a node's own ancestor chain whose flag is BELOW `requested`: the
   *  subtree a commit to a higher tier must RE-TIER for the request to be legal. A node may
   *  never be MORE durable than the node that reaches it (`§2.1`'s named-invariant block), so
   *  a CHILD ABOVE ITS PARENT is refused only when NO such ancestor exists. */
  function climbToBound(node: GraphNode, requested: GraphNodeFlag): GraphNode {
    void requested
    let current = node
    // NO DEPTH BOUND IS OWED (`§2.3` item 4, `§2.11` item 3): the graph is a TREE BY
    // CONSTRUCTION — every node has EXACTLY ONE parent link and no operation creates a
    // second, so a cycle is UNCONSTRUCTIBLE and the climb terminates (D-6).
    for (;;) {
      if (isRootRef(current.ref)) break
      const parent = parentOf(current)
      if (parent === null) break
      current = parent
    }
    return current
  }

  function isRootRef(ref: GraphNodeRef): boolean {
    for (const rootName of rootHolders.keys()) {
      for (const holder of liveHolders(rootName)) if (holder.ref === ref) return true
    }
    return false
  }

  function parentOf(node: GraphNode): GraphNode | null {
    if (node.parentLink === null) return null
    return nodes.get(node.parentLink.from) ?? null
  }

  /** THE PARENT OF A PATH, read from the CALLER'S OWN SEGMENTS: the node the path's own
   *  deepest node actually hangs from. A node whose own `parentLink` reaches a reference the
   *  graph no longer holds is answered by the caller's preceding segments instead. */
  function parentPathOf(rootName: string, tail: readonly string[], ref: GraphNodeRef): GraphNode | null {
    if (tail.length <= 1) return null
    const walked = anchorWalk(rootName, [rootName, ...tail.slice(0, tail.length - 1)], null, false)
    if (walked.deepest === null) return null
    if (walked.deepest.ref === ref) return null
    return walked.deepest
  }

  /* ── THE ROOT-PATH READING (`§2.3` item 1) ── */

  /** THE ROOT-PATH READING: whether the caller's spelling NAMES its root by the TIER-TOKEN
   *  POSITION (`§2.3` item 1 — the first segment is the token, the NEXT segment is the
   *  registered TOP-LEVEL NAME), the ROOT NAME itself, and the TAIL the walk descends from
   *  the root's own local name.
   *
   *  ⟶ AMENDED 2026-10-03 (`UNIT-ADV-1`, G4-F2, ANNOTATE-BESIDE): **THE TOP IS THE SEGMENT
   *  AT INDEX 1, BY POSITION — PINNED.** The parse reads `rootParts[1]` — never *"the first
   *  declared segment anywhere in the tail"*. **THE SILENT RE-SPELL IS FORBIDDEN**: a
   *  declared segment DEEPER in the tail never re-points the parse — the caller's own
   *  spelling alone determines the top (`§2.3` item 1, `§2.2 P-7`, the F2 clause). A
   *  tier-qualified name with NO second segment reads the token itself (the walk's own
   *  `'malformed-name'` arm handles a bare tier token). */
  function rootParts(segments: readonly string[]): { qualified: boolean; rootName: string; tail: readonly string[]; token: GraphTierToken | null } {
    const first = segments[0] ?? ''
    if (isTierToken(first) && first !== 'secure') {
      // THE TOP IS THE SEGMENT AFTER THE TIER, BY POSITION (`§2.3` item 1: the first segment
      // is the token — a FILTER — and the NEXT segment is the registered top-level name).
      const tail = segments.slice(1)
      const top = tail.length > 0 ? (tail[0] as string) : first
      return { qualified: true, rootName: top, tail: tail.length > 0 ? tail : [first], token: first }
    }
    return { qualified: false, rootName: first, tail: segments.slice(0, 1), token: null }
  }

  /** THE WALK. `autoMint` is the WRITE side's descendant builder (`§2.8` item 3): with it
   *  the walk MINTS the missing child at each gap; without it the walk MINTS NOTHING
   *  (`§2.6` item 4, `R-5`). The FIRST segment of the tail is the ROOT'S OWN LOCAL NAME,
   *  and a tier token is a FILTER applied to the resolved node — never a segment. */
  function anchorWalk(rootName: string, tail: readonly string[], token: GraphTierToken | null, autoMint: boolean, value?: unknown, pin: GraphNodeRef | null = null): { deepest: GraphNode | null; node: GraphNode | null; target: GraphNode | null; severed: boolean; firstMissing: string | null; tierOnly: boolean } {
    if (pin !== null) {
      const pinned = nodes.get(pin)
      if (pinned === undefined) return { deepest: null, node: null, target: null, severed: false, firstMissing: tail[tail.length - 1] ?? null, tierOnly: false }
      const pinnedWalk = walkFrom(rootName, pinned, tail, autoMint, value)
      return { ...pinnedWalk, node: pinnedWalk.node, target: pinnedWalk.node, tierOnly: false }
    }
    const held = liveHolders(rootName)
    const wanted = token === null ? null : (DURABILITY_RANK[token] ?? 0)
    // THE TIER-HOLDERS THE REQUESTED FLAG COULD ANSWER FROM, most durable first: the walk is
    // tried on each of them and the FIRST that RESOLVES TO A NODE CARRYING THE REQUESTED FLAG
    // wins. Where none does, the most durable holder's own reading is reported, so the walk's
    // arms (`D-ANCHOR` · `E-LINK` · the DECLARED MISS) are decided by a real traversal.
    const sorted = [...held].sort((a, b) => (DURABILITY_RANK[b.flag] ?? 0) - (DURABILITY_RANK[a.flag] ?? 0))
    if (autoMint) {
      // THE MINTING WALK DESCENDS THE REQUESTED TIER'S OWN HOLDER (`§2.8` item 3): a mint NEVER
      // borrows another tier's branch, which is what keeps the tiers COMPOSING (`§2.3` item 5).
      let exact: GraphNode | null = null
      for (const candidate of sorted) {
        if (token !== null && candidate.flag === token) { exact = candidate; break }
      }
      const start = exact ?? sorted[0]
      if (start === undefined) return { deepest: null, node: null, target: null, severed: false, firstMissing: tail[tail.length - 1] ?? null, tierOnly: false }
      const mintedWalk = walkFrom(rootName, start, tail, true, value)
      return { ...mintedWalk, target: mintedWalk.node, tierOnly: false }
    }
    const eligible = sorted.filter((candidate) => wanted === null || (DURABILITY_RANK[candidate.flag] ?? 0) >= wanted)
    const candidates = eligible.length > 0 ? eligible : sorted
    let first: { deepest: GraphNode | null; node: GraphNode | null; severed: boolean; firstMissing: string | null } | null = null
    let matchedName = false
    for (let index = 0; index < candidates.length; index += 1) {
      const attempt = walkFrom(rootName, candidates[index] as GraphNode, tail, false, value)
      if (first === null) first = attempt
      if (token === null || attempt.node === null) return { ...attempt, target: attempt.node, tierOnly: false }
      if (attempt.node.flag === token) return { ...attempt, target: attempt.node, tierOnly: false }
      matchedName = true
    }
    if (first === null) return { deepest: null, node: null, target: null, severed: false, firstMissing: tail[tail.length - 1] ?? null, tierOnly: false }
    return { ...first, target: null, tierOnly: matchedName }
  }

  function walkFrom(rootName: string, start: GraphNode, tail: readonly string[], autoMint: boolean, value: unknown): { deepest: GraphNode | null; node: GraphNode | null; severed: boolean; firstMissing: string | null } {
    let current: GraphNode = start
    // THE FIRST TAIL SEGMENT IS THE ROOT'S OWN LOCAL NAME (`§2.3` item 2): the walk has
    // ALREADY reached the root, so a first segment equal to it is CONSUMED, and the descent
    // begins at the SECOND one.
    for (let index = tail[0] === start.localName ? 1 : 0; index < tail.length; index += 1) {
      const segment = tail[index] as string
      const last = index === tail.length - 1
      const anchor = anchorOf(current.ref, segment)
      if (anchor !== null && anchor.link !== null && anchor.link.to !== null) {
        const child = nodes.get(anchor.link.to)
        if (child !== undefined) {
          current = child
          if (last) return { deepest: current, node: current, severed: false, firstMissing: null }
          continue
        }
      }
      if (anchor !== null && anchor.link !== null && anchor.link.to === null) {
        return { deepest: current, node: null, severed: true, firstMissing: segment }
      }
      if (!autoMint) return { deepest: current, node: null, severed: false, firstMissing: segment }
      current = makeChild(current, segment, start.flag, rootName, value, last)
      if (last) return { deepest: current, node: current, severed: false, firstMissing: null }
    }
    if (autoMint) setValue(current.ref, current.localName, value)
    return { deepest: current, node: current, severed: false, firstMissing: null }
  }

  function makeChild(parent: GraphNode, segment: string, flag: GraphNodeFlag, rootName: string, value: unknown, written: boolean): GraphNode {
    const ref = mintRef()
    const link: GraphLink = { from: parent.ref, to: ref, cache: linkEntry(rootName, ref, flag), constraint: null }
    const child: GraphNode = { ref, flag, localName: segment, anchors: [], parentLink: link }
    nodes.set(ref, child)
    withAnchor(parent.ref, segment, link)
    // THE LEAF'S ENTRY IS WRITTEN WHEN THE SEGMENT IS THE LEAF, NEVER WHEN IT IS AN
    // INTERMEDIATE (`§2.3` item 2: the caller's own LAST segment is the path's leaf; an
    // intermediate node is a STRUCTURAL PARENT with no value entry of its own). `written` is
    // the MINT WALK's own segment fact, so the entry is created WITHOUT consulting the value's
    // substance (`§2.2 P-6`/`P-9`) — a leaf whose committed value is `undefined` still HAS an
    // entry and answers the HIT (M5's discrimination), while a structural parent carries none
    // and answers the DECLARED MISS (M4).
    if (written) setValue(ref, segment, value)
    return child
  }

  function resolvePath(raw: unknown): PathWalk | null {
    const parsed = parseName(raw)
    if (parsed.segments.length === 0) return null
    const { rootName, tail } = rootParts(parsed.segments)
    // G4-F2 (AMENDED 2026-10-03 — UNIT-ADV-1): the C-TOP gate — a state-(iii) index-1
    // segment (neither declared nor registered) never walks; a REGISTERED root (state (i))
    // walks by the ordinary rules.
    if (!declared.has(rootName) && liveHolders(rootName).length === 0) return null
    const token: GraphTierToken | null = parsed.token
    const walked = anchorWalk(rootName, tail, token, false)
    let stale = false
    if (walked.node !== null) {
      const entry = registerEntries.get(rootName)
      stale = entry !== undefined && staleEntries.has(rootName) && !entryIsLive(entry)
    }
    return { rootName, token: token ?? 'temp', tail, node: walked.node, deepest: walked.deepest, severed: walked.severed, firstMissing: walked.firstMissing, stale }
  }

  function deepestExisting(raw: unknown): GraphNode | null {
    const parsed = parseName(raw)
    if (parsed.segments.length === 0) return null
    const { rootName, tail } = rootParts(parsed.segments)
    return anchorWalk(rootName, tail, parsed.token, false).deepest
  }

  /* ── THE WALK'S ANSWER (`§2.3` item 6, `§2.5`) ── */

  function refusalOf(reason: GraphRefusalReason, step: GraphResolveStep, segment: string | null, owner: GraphNodeRef | null, name: string): Record<string, unknown> {
    // THE READ-SIDE REFUSAL RECORD (an INLINE, unnamed shape — D-2) carries the refusal
    // token AND its diagnostic, with the diagnostic's step/segment/owner also readable at
    // the record's own top level (the artifact's field-5 observables name them beside the
    // diagnostic, and the red set reads them there).
    return {
      status: 'refused',
      reason,
      step,
      segment,
      owner,
      diagnostic: { reason, step, segment, owner },
      name,
    }
  }

  interface WalkOutcome {
    readonly answer: GraphResolveResult | Record<string, unknown>
    readonly leaf: GraphNode | null
    readonly rootName: string
    readonly tail: readonly string[]
    readonly token: GraphTierToken | null
  }

  function walkName(raw: unknown): WalkOutcome {
    const parsed = parseName(raw)
    if (parsed.segments.length === 0) {
      return { answer: refusalOf('malformed-name', 'A-PARSE', null, null, typeof raw === 'string' ? raw : ''), leaf: null, rootName: '', tail: [], token: null }
    }
    if (parsed.segments[0] === 'secure') {
      return { answer: refusalOf('secure-refused', 'B-SECURE-GATE', null, null, raw as string), leaf: null, rootName: '', tail: [], token: null }
    }
    const name = raw as string
    const tiered = isTierToken(parsed.segments[0]) && parsed.segments[0] !== 'secure'
    if (tiered && parsed.segments.length < 2) {
      // A TIER TOKEN ALONE is a filter with no top (`§2.3` item 1) — malformed. A TIER-FREE
      // single segment is a LEGAL resolve (`resolve('p')` on a tier-free spelling is legal —
      // the read has a filter order and the write has none, `§3.2 F-16/F-17`).
      return { answer: refusalOf('malformed-name', 'A-PARSE', null, null, name), leaf: null, rootName: '', tail: [], token: null }
    }
    const { rootName, tail } = rootParts(parsed.segments)
    // ⟶ AMENDED 2026-10-03 (`UNIT-ADV-1`, G4-F2): the READ-SIDE C-TOP GATE — a name whose
    // index-1 segment (the TOP, by position) is in F-2 state (iii) — NOT A ROOT NAME AT
    // ALL, neither declared nor REGISTERED — answers the DECLARED `'undeclared-name'`
    // refusal at C-TOP BEFORE any traversal: no anchor, link, cache or leaf walk happens
    // for it, and a declared segment deeper in the tail never re-points the read (the
    // silent re-spell is FORBIDDEN). A REGISTERED root (state (i), declared or not) walks
    // by the ordinary rules — the gate is `undeclared AND unregistered`.
    if (!declared.has(rootName) && liveHolders(rootName).length === 0) {
      if (tiered) {
        return { answer: refusalOf('undeclared-name', 'C-TOP', parsed.segments[1] as string, null, name), leaf: null, rootName: '', tail: [], token: null }
      }
      return { answer: refusalOf('malformed-name', 'A-PARSE', null, null, name), leaf: null, rootName: '', tail: [], token: null }
    }
    if (holdersOf(rootName).length === 0) return { answer: miss(name), leaf: null, rootName, tail, token: parsed.token }
    const walked = anchorWalk(rootName, tail, parsed.token, false)
    if (walked.deepest === null) return { answer: miss(name), leaf: null, rootName, tail, token: parsed.token }
    const segment = walked.firstMissing ?? (tail[tail.length - 1] as string)
    if (walked.severed) {
      return { answer: refusalOf('severed-link', 'E-LINK', segment, walked.deepest.ref, name), leaf: null, rootName, tail, token: parsed.token }
    }
    if (walked.node === null) {
      if (tail.length === 1 && tail[0] === rootName) return { answer: miss(name), leaf: null, rootName, tail, token: parsed.token }
      return { answer: refusalOf('no-such-anchor', 'D-ANCHOR', segment, walked.deepest.ref, name), leaf: null, rootName, tail, token: parsed.token }
    }
    const leaf = walked.node
    // THE VALUE-PRESENCE CHECK — the DECLARED-but-unwritten-parent arm (field 2's `clear` row
    // + MISS arm: the miss's subject is the "DECLARED-BUT-UNWRITTEN PARENT WITH A WRITTEN
    // CHILD" — a node that exists STRUCTURALLY but holds NO value entry of its own). It sits
    // BEFORE `H-FLAG` because the fixed precedence answers "the resolved leaf's miss → the
    // filter miss → the answer" (`§2.5` item 2). The check reads ENTRY PRESENCE, never the
    // value's contents — a WRITTEN leaf holding `undefined` as its own value HAS an entry and
    // stays a HIT (M5's discrimination; field 2's `value` row: the store never interprets it).
    if (!hasValueEntry(leaf.ref)) {
      return { answer: miss(name), leaf: null, rootName, tail, token: parsed.token }
    }
    if (parsed.token !== null && parsed.token !== 'secure' && leaf.flag !== parsed.token) {
      // `H-FLAG` runs AFTER `G-RESOLVE-LEAF`: a filter miss on a RESOLVABLE leaf is its OWN
      // diagnostic, NEVER `'no-such-anchor'` — and it NAMES the node's OWN flag AND the flag
      // the filter asked for (`§2.3` items 6(iv)/7, field 5 token #13, `R-6`).
      const record = refusalOf('tier-filter-miss', 'H-FLAG', segment, leaf.ref, name)
      return { answer: { ...record, flag: leaf.flag, requested: parsed.token }, leaf: null, rootName, tail, token: parsed.token }
    }
    const entry = registerEntries.get(rootName)
    if (entry !== undefined && staleEntries.has(rootName) && !entryIsLive(entry)) {
      return { answer: refusalOf('rebuild-failed', 'F-CACHE', segment, leaf.ref, name), leaf: null, rootName, tail, token: parsed.token }
    }
    return {
      answer: { found: true, value: valueOf(leaf.ref), tier: leaf.flag, flag: leaf.flag, cache: tierHandleFor(leaf.flag), name },
      leaf,
      rootName,
      tail,
      token: parsed.token,
    }
  }

  function resolveRead(raw: unknown): GraphResolveResult | Record<string, unknown> {
    // THE READ'S SURVIVING CASE SET IS THREE AND NO FOURTH — HIT · QUALIFIED · MISS (`§2.5`
    // item 4's annotation): the merged/composite arm is WITHDRAWN (D-1/D-3), so the walk's own
    // answer IS the read's answer — never a composition, never a provenance list, never a
    // second holder (`§3.2 F-8`'s re-derived form).
    return walkName(raw).answer
  }

  /* ── THE EVENT SURFACE (`§2.10`) ── */

  function deliver(subscriber: SubscriberRecord, event: GraphEvent): void {
    try {
      subscriber.listener(event)
    } catch {
      // A listener that THROWS does not propagate to the mutator's caller (`§2.10` item 4).
    }
  }

  function emit(name: string, flag: GraphNodeFlag, value: unknown, cleared: readonly string[], cause: GraphEvent['cause'], origin?: string): number {
    if (!(EVENT_CAUSES as readonly string[]).includes(cause)) return 0
    const exact: SubscriberRecord[] = []
    const ancestors: SubscriberRecord[] = []
    for (const subscriber of subscriptions) {
      if (!subscriber.live) continue
      if (subscriber.name === name) exact.push(subscriber)
      else if (subscriber.subtree && origin !== undefined && origin.startsWith(`${subscriber.name}.`)) ancestors.push(subscriber)
    }
    for (const subscriber of exact) deliver(subscriber, { name, flag, value, cleared, cause })
    // THE DESCENDANT ARM's DELIVERY gate (`§2.10` item 2's `'descendant'` row): an ancestor
    // fires ONLY for `{subtree:true}` subscribers — an ancestor with no opt-in subscriber
    // receives nothing (the ancestor event is created and delivered only on a match).
    for (const ancestor of ancestors) {
      deliver(ancestor, { name: ancestor.name, flag, value: undefined, cleared: [], cause: 'descendant', origin: origin as string, subtree: true })
    }
    // ⟶ AMENDED 2026-10-03 (`UNIT-ADV-1`, G4-F3): THE RECEIPT'S `events` IS A FUNCTION OF
    // THE AFFECTED REFERENCES, NOT OF THE LISTENERS, PINNED. An event is EMITTED FOR an
    // affected reference and DELIVERED to whoever is subscribed; the absent-subscriber case
    // never deletes the event from the count — one affected reference answers `events: 1`
    // whether or not ANY subscriber exists, and a second subscriber changes the deliveries,
    // never the count (`§2.10` item 5; `§3.3 I-16`'s one-event-per-affected-reference rule).
    return 1
  }

  /* ── THE RECEIPT AND ITS REFUSAL SHAPES ── */

  function receiptFor(name: unknown, state: ReceiptState, status: 'committed' | 'refused', reason?: GraphRefusalReason): GraphWriteReceipt {
    const out: Record<string, unknown> = {
      status,
      name: typeof name === 'string' ? name : '',
      cleared: state.cleared,
      repaired: state.repaired,
      rows: state.rows,
      crossings: state.crossings,
      events: state.events,
    }
    if (reason !== undefined) out['reason'] = reason
    if (state.diagnostic !== undefined) out['diagnostic'] = state.diagnostic
    return out as unknown as GraphWriteReceipt
  }

  function refuse(name: unknown, reason: GraphRefusalReason, step: GraphResolveStep, segment: string | null, owner: GraphNodeRef | null): GraphWriteReceipt {
    return receiptFor(name, {
      cleared: [],
      repaired: [],
      rows: [],
      crossings: 0,
      events: 0,
      diagnostic: { reason, step, segment, owner },
    }, 'refused', reason)
  }

  /* ── THE CROSSING SEAM (`§2.8` items 5(5)/7/8, `§2.5`) — D-4 ── */

  /** PUSH THE STABLE-JSON TRANSLATION OF THE GRAPH through the declared, stubbed seam — the
   *  ONE committed write of the whole regenerated set (`crossings: 1`). The unit asserts
   *  NOTHING about the channel's order, idempotency or failure recovery (`§2.8` item 8): a
   *  throwing recorder never propagates to the mutator's caller, and a refused status is not
   *  this unit's fail-state. */
  function crossingPut(name: string): void {
    if (crossing === null) return
    try {
      crossing.put({ name, value: stableGraphTranslation() })
    } catch {
      // the seam is stubbed and out of this unit's authority — nothing to report
    }
  }

  /** THE STABLE-JSON TRANSLATION (`§2.8` item 9): an object whose own enumerable keys are
   *  emitted in SORTED order (rule (a)); `undefined`-valued members are OMITTED (rule (c)):
   *  the translation keys the graph's own held references (`<flag>.<path>`) by their values.
   *  Two translations of the same settled graph are BYTE-IDENTICAL whatever order the nodes
   *  were created in (rule (f)) — the walk keys are the references' own deterministic
   *  spellings, never a minted ref. */
  function stableGraphTranslation(): string {
    const entries: [string, unknown][] = []
    const seen = new Set<string>()
    const visit = (node: GraphNode, path: string): void => {
      const reference = `${node.flag}.${path}`
      if (!seen.has(reference)) {
        seen.add(reference)
        const value = valueOf(node.ref)
        if (value !== undefined) entries.push([reference, stableJsonValue(value, new Set<unknown>(), 0)])
      }
      for (const anchor of node.anchors) {
        if (anchor.link === null || anchor.link.to === null) continue
        const child = nodes.get(anchor.link.to)
        if (child === undefined) continue
        visit(child, `${path}.${anchor.key}`)
      }
    }
    for (const rootName of rootHolders.keys()) {
      for (const holder of liveHolders(rootName)) visit(holder, holder.localName)
    }
    entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    // G4-F6 (AMENDED 2026-10-03 — UNIT-ADV-1): the translation's keys are the references'
    // OWN caller-owned spellings — the dictionary is PROTOTYPE-SAFE (`Object.create(null)`),
    // never a plain object whose key set inherits `Object.prototype`.
    const out: Record<string, unknown> = Object.create(null)
    for (const entry of entries) out[entry[0]] = entry[1]
    return JSON.stringify(out)
  }

  /** A NEVER-THROWING, DETERMINISTIC RENDER of an opaque value (rules (b)–(e)): primitives by
   *  value with `-0`/`NaN` distinguished by `Object.is`; an object's own keys in SORTED order;
   *  `undefined`-valued members omitted; a cyclic or otherwise unrepresentable structure is
   *  rendered as a string rather than thrown — the translation itself must never fail. */
  function stableJsonValue(value: unknown, seen: Set<unknown>, depth: number): unknown {
    if (value === null) return null
    const kind = typeof value
    if (kind === 'string' || kind === 'boolean') return value
    if (kind === 'number') {
      if (Object.is(value, -0)) return '-0'
      if (Number.isNaN(value)) return 'NaN'
      return Number.isFinite(value as number) ? value : String(value)
    }
    if (kind === 'undefined') return undefined
    if (kind === 'bigint' || kind === 'symbol' || kind === 'function') return String(value)
    if (depth > 8 || seen.has(value)) return '<circular>'
    seen.add(value)
    if (Array.isArray(value)) {
      const out = value.map((item) => stableJsonValue(item, seen, depth + 1))
      seen.delete(value)
      return out
    }
    const out: Record<string, unknown> = Object.create(null)
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const rendered = stableJsonValue((value as Record<string, unknown>)[key], seen, depth + 1)
      if (rendered !== undefined) out[key] = rendered
    }
    seen.delete(value)
    return out
  }

  /* ── THE CONSTRAINT MACHINERY (`§2.7` — RE-DERIVED 2026-10-03:
     CONSTRAINTS-ARE-PASSED-FUNCTIONS) ── */

  interface ConstraintSlot {
    readonly member: GraphConstraint
    readonly isSelf: boolean
    readonly current: unknown
  }

  interface ConstraintOutcome {
    readonly refused: boolean
    /** Present exactly when `refused`: the member's own feedback reason — the
     *  refusal-via-feedback record's `reason` — or `'validate-failed'` where the member
     *  answered false without one (field 5 token #15's token). */
    readonly reason?: GraphRefusalReason
    readonly repairedNames: readonly string[]
    readonly repairEvents: readonly GraphEvent[]
  }

  /** THE MATCHED ROOT at the pair's own tier: the tier-holder whose anchor leaves are the
   *  data the member's matched set reads. Where the pair's tier holds no node, the most
   *  durable holder answers (the read side's own filter order, `§2.3` item 1). The holder
   *  is RE-RESOLVED BY REF against the live `nodes` map: an anchor write REPLACES the
   *  node's object (`§2.2 P-2` — anchors are immutable), and the constraint's record must
   *  read the CURRENT object, never the holder registry's older one. */
  function rootNodeAt(token: GraphNodeFlag, rootName: string): GraphNode | null {
    const holder = holderOf(rootName, token) ?? holderOf(rootName, null)
    if (holder === null) return null
    return nodes.get(holder.ref) ?? holder
  }

  /** THE MATCHED SET'S DATA RECORD — a LIVE record keyed by the leaf's OWN name, holding
   *  the leaf's stored value BY REFERENCE, built from the matched root's anchor leaves (the
   *  worked example's per-leaf record). A severed or absent anchor target contributes no
   *  entry, so a removed leaf (or an emptied set) is OBSERVABLE on the post-state. A
   *  mutation made through the record's values lands on the nodes' stored values (the same
   *  references). */
  function leafRecordFor(root: GraphNode | null): Record<string, unknown> {
    // ⟶ AMENDED 2026-10-03 (`UNIT-ADV-1`, G4-F6): THE CONSTRAINT EVALUATION'S DATA RECORD
    // IS PROTOTYPE-SAFE, PINNED — built on `Object.create(null)`, never a plain object whose
    // key set inherits `Object.prototype`. A leaf named `'__proto__'`/`'constructor'`/
    // `'toString'` (any hostile caller-owned name) rides as an OWN keyed-readable entry —
    // never OMITTED (the entry exists and is readable) and never POISONING (the caller's
    // data never becomes the record's prototype, no key behaves as a prototype key).
    const record: Record<string, unknown> = Object.create(null)
    if (root !== null) {
      for (const anchor of root.anchors) {
        if (anchor.link === null || anchor.link.to === null) continue
        const child = nodes.get(anchor.link.to)
        if (child !== undefined) record[anchor.key] = valueOf(child.ref)
      }
    }
    return record
  }

  function leafNodeAt(root: GraphNode | null, key: string): GraphNode | null {
    if (root === null) return null
    const anchor = anchorOf(root.ref, key)
    if (anchor === null || anchor.link === null || anchor.link.to === null) return null
    return nodes.get(anchor.link.to) ?? null
  }

  /** THE NODE THE CALLER'S OWN PATH LANDS ON in the LIVE (post-write) graph — the written
   *  leaf whose landing value is the `changed` argument of the constraint call. */
  function nodeAtPath(parsed: WriteName): GraphNode | null {
    return anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], parsed.token, false).node
  }

  /** THE APPLICABLE MEMBERS of the operation, captured BEFORE the mutation so the CURRENT
   *  state is the PRE-WRITE state (`§2.7` items 1/2, RE-DERIVED 2026-10-03): a member
   *  applies when its own `evaluatedOn` declares the operation and its `matchedSet` names
   *  the operation's own TOP-LEVEL name. Each member evaluates INDEPENDENTLY on its own
   *  matched root's data. A member that is not a FUNCTION-CARRIER (a superseded data-row
   *  leftover) carries no code to call and is inert — it never evaluates, never refrains
   *  and never repairs. */
  function captureConstraintSlots(op: 'set' | 'commit' | 'remove', parsed: WriteName): ConstraintSlot[] {
    const slots: ConstraintSlot[] = []
    for (const member of constraints) {
      if (member === null || typeof member !== 'object') continue
      if (!Array.isArray(member.evaluatedOn) || !member.evaluatedOn.includes(op)) continue
      if (typeof member.matchedSet !== 'string' || member.matchedSet !== parsed.rootName) continue
      if (typeof member.constraint !== 'function') continue
      const isSelf = parsed.tail.length === 1
      let current: unknown
      if (isSelf) {
        const root = holderOf(parsed.rootName, parsed.token)
        current = root !== null ? valueOf(root.ref) : undefined
      } else {
        current = leafRecordFor(rootNodeAt(parsed.token, parsed.rootName))
      }
      slots.push({ member, isSelf, current })
    }
    return slots
  }

  /** THE POST-STATE EVALUATION (`§2.7` items 2/3, RE-DERIVED 2026-10-03): the mutation has
   *  LANDED — `constraint(changed, current, next, feedback)` is called with ≥3 positional
   *  arguments; `changed` is the written data, `current` the captured pre-write state and
   *  `next` the landed post-state (the matched root's live record, or the reference's own
   *  value for a self write). `true` lets the write stand. `false` with a repair function
   *  calls the repair on the post-state; its corrective action lands IN THE SAME COMMITTED
   *  WRITE — a NEW record entry becomes a REAL leaf node under the matched root — each
   *  repaired reference fires its OWN `cause:'repair'` event beside the caller's own write
   *  event and is NAMED in the receipt's `repaired[]`. `false` with NO repair is
   *  REFUSAL-VIA-FEEDBACK: the member's own feedback reason answers in a returned record,
   *  every receipt member empty, the store byte-unchanged — NEVER a throw. */
  function evaluateConstraints(op: 'set' | 'commit' | 'remove', parsed: WriteName, slots: readonly ConstraintSlot[]): ConstraintOutcome {
    const repairedNames: string[] = []
    const repairEvents: GraphEvent[] = []
    for (const slot of slots) {
      const member = slot.member
      const feedback: { reason?: string; message?: string } = {}
      let changed: unknown
      let next: unknown
      if (slot.isSelf) {
        const root = holderOf(parsed.rootName, parsed.token)
        changed = root !== null ? valueOf(root.ref) : undefined
        next = changed
      } else {
        const written = nodeAtPath(parsed)
        changed = written !== null ? valueOf(written.ref) : undefined
        next = leafRecordFor(rootNodeAt(parsed.token, parsed.rootName))
      }
      if (member.constraint(changed, slot.current, next, feedback) === true) continue
      if (typeof member.repair !== 'function') {
        return {
          refused: true,
          reason: (typeof feedback.reason === 'string' ? feedback.reason : 'validate-failed') as GraphRefusalReason,
          repairedNames: [],
          repairEvents: [],
        }
      }
      if (slot.isSelf) {
        // THE REPAIR ACTED ON THE CHANGED REFERENCE'S OWN DATA: the repaired reference IS
        // the write's own spelling, carrying the corrected value.
        member.repair(next, feedback)
        const root = holderOf(parsed.rootName, parsed.token)
        repairedNames.push(parsed.name)
        repairEvents.push({ name: parsed.name, flag: parsed.token, value: root !== null ? valueOf(root.ref) : next, cleared: [], cause: 'repair' })
      } else {
        // THE RECORD THE REPAIR ACTED ON: entries the corrective action CHANGED or ADDED
        // are the repaired references (distinct from the caller's own); a NEW entry becomes
        // a real leaf node under the matched root — the "open the landing page" arm.
        const pre = deepCopyOf(next)
        member.repair(next, feedback)
        const root = rootNodeAt(parsed.token, parsed.rootName)
        for (const key of Object.keys(next as Record<string, unknown>)) {
          const refName = `${parsed.token}.${parsed.rootName}.${key}`
          const landed = (next as Record<string, unknown>)[key]
          if (!Object.prototype.hasOwnProperty.call(pre as Record<string, unknown>, key)) {
            if (root !== null) {
              mintRecordLeaf(root, parsed.token, key, landed)
              repairedNames.push(refName)
              repairEvents.push({ name: refName, flag: parsed.token, value: landed, cleared: [], cause: 'repair' })
            }
          } else if (!deepEqualOf((pre as Record<string, unknown>)[key], landed)) {
            const leaf = leafNodeAt(root, key)
            if (leaf !== null) {
              setValue(leaf.ref, leaf.localName, landed)
              repairedNames.push(refName)
              repairEvents.push({ name: refName, flag: parsed.token, value: landed, cleared: [], cause: 'repair' })
            }
          }
        }
      }
    }
    return { refused: false, repairedNames, repairEvents }
  }

  /** THE REPAIR'S DIFF BASE — a CYCLESAFE, UNBOUNDED recursive copy of the record the repair
   *  is about to act on, so a change the repair makes at ANY depth is detected and lands on
   *  the graph's own nodes. ⟶ AMENDED 2026-10-03 (`UNIT-ADV-1`, G4-F6): the copy's outputs
   *  are PROTOTYPE-SAFE (`Object.create(null)`) — every caller-owned key (a hostile
   *  `'__proto__'`/`'constructor'`/`'toString'` name included) rides as an OWN data key,
   *  never as the object's prototype. */
  function deepCopyOf(value: unknown): unknown {
    const seen = new Map<unknown, unknown>()
    const copy = (candidate: unknown): unknown => {
      if (candidate === null || typeof candidate !== 'object') return candidate
      const already = seen.get(candidate)
      if (already !== undefined) return already
      if (Array.isArray(candidate)) {
        const out: unknown[] = []
        seen.set(candidate, out)
        for (const item of candidate) out.push(copy(item))
        return out
      }
      const out: Record<string, unknown> = Object.create(null)
      seen.set(candidate, out)
      for (const key of Object.keys(candidate as Record<string, unknown>)) {
        out[key] = copy((candidate as Record<string, unknown>)[key])
      }
      return out
    }
    return copy(value)
  }

  function deepEqualOf(a: unknown, b: unknown): boolean {
    if (a === b) return true
    if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false
    if (Array.isArray(a) !== Array.isArray(b)) return false
    const ka = Object.keys(a as Record<string, unknown>)
    const kb = Object.keys(b as Record<string, unknown>)
    if (ka.length !== kb.length) return false
    for (const key of ka) {
      if (!Object.prototype.hasOwnProperty.call(b as Record<string, unknown>, key)) return false
      if (!deepEqualOf((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) return false
    }
    return true
  }

  /** A RECORD ENTRY THE REPAIR ADDS becomes a REAL LEAF under the matched root — its own
   *  anchor, link and value entry — so the corrective action is present IN THE GRAPH
   *  (the worked example's "open the landing page on an empty set" arm). */
  function mintRecordLeaf(root: GraphNode, token: GraphNodeFlag, key: string, value: unknown): GraphNode {
    return makeChild(root, key, token, root.localName, value, true)
  }

  /** THE WRITE JOURNAL (`§2.7` item 3's refusal posture): the constraint functions evaluate
   *  on the LANDED post-state, so a repairless violation must roll the write back — the
   *  journal snapshots the graph's own collections (nodes, value entries, root holders,
   *  declarations) plus the ref counter, and reverting restores them BYTE-EXACTLY. Taken
   *  ONLY where this write has applicable constraint slots: the ordinary no-constraint
   *  path is untouched. */
  interface WriteJournal {
    readonly nodes: Map<GraphNodeRef, GraphNode>
    readonly values: readonly ValueEntry[]
    readonly rootHolders: Map<string, readonly GraphNode[]>
    readonly declared: Map<string, RootDeclaration>
    readonly refCounter: number
  }

  function journalBefore(): WriteJournal {
    return {
      nodes: new Map(nodes),
      values: values.map((entry) => ({ ...entry })),
      rootHolders: new Map([...rootHolders.entries()].map(([name, held]) => [name, [...held]])),
      declared: new Map(declared),
      refCounter,
    }
  }

  function revertTo(journal: WriteJournal): void {
    nodes.clear()
    for (const [ref, node] of journal.nodes) nodes.set(ref, node)
    values.length = 0
    for (const entry of journal.values) values.push({ ...entry })
    rootHolders.clear()
    for (const [name, held] of journal.rootHolders) rootHolders.set(name, [...held])
    declared.clear()
    for (const [name, declaration] of journal.declared) declared.set(name, declaration)
    refCounter = journal.refCounter
  }

  /** THE REFUSAL-VIA-FEEDBACK RECORD (`§2.7` item 3, RE-DERIVED 2026-10-03): `false` with
   *  NO repair answers a RETURNED RECORD carrying the member's own feedback reason, with
   *  every receipt member EMPTY and the store BYTE-UNCHANGED — never a throw (field 2.6's
   *  receipt; field 5: "a reason is a RETURNED RECORD member; it is NEVER a throw"). */
  function refusalOfFeedback(name: string, reason: GraphRefusalReason): GraphWriteReceipt {
    return receiptFor(name, { cleared: [], repaired: [], rows: [], crossings: 0, events: 0 }, 'refused', reason)
  }

  /* ── THE WRITE SURFACE (`§2.8`) ── */

  function routingOf(opts: unknown): { onRepeat: 'edit' | 'refuse' } | GraphWriteReceipt {
    if (opts !== undefined && opts !== null && !isRecordObject(opts)) return refuse('', 'malformed-name', 'A-PARSE', null, null)
    const record = isRecordObject(opts) ? (opts as GraphWriteOptions) : {}
    const explicit = record.onRepeat ?? record.onDuplicate
    if (explicit !== undefined && explicit !== 'edit' && explicit !== 'refuse') return refuse('', 'malformed-name', 'A-PARSE', null, null)
    return { onRepeat: explicit ?? 'edit' }
  }

  function parseWrite(raw: unknown): WriteName | GraphWriteReceipt {
    const parsed = parseName(raw)
    if (parsed.segments.length === 0) return refuse(raw, 'malformed-name', 'A-PARSE', null, null)
    if (parsed.segments[0] === 'secure') return refuse(raw, 'secure-refused', 'B-SECURE-GATE', null, null)
    if (!isTierToken(parsed.segments[0])) return refuse(raw, 'malformed-name', 'A-PARSE', null, null)
    // THE DECLARATION INPUT IS THE ONLY AUTHORITY OVER WHICH NAMES ARE ROOTS (`§2.4` item 8,
    // `§2.2 P-7`): parseWrite mints NO root declaration, because a REFUSED write must leave
    // the declaration set BYTE-IDENTICAL (CR-1/M2 — a later resolve of a name a refused write
    // touched answers `'undeclared-name'` at `C-TOP`, never a cold-name MISS). The mint's own
    // declaration lives in the MINT paths, where the commit actually LANDS (`§2.8` item 3).
    const parts = rootParts(parsed.segments)
    const token: GraphNodeFlag = parsed.segments[0] === 'mem' ? 'mem' : parsed.segments[0] === 'file' ? 'file' : 'temp'
    return { name: raw as string, token, segments: parsed.segments, rootName: parts.rootName, tail: parts.tail }
  }

  /** F-2's three states (`§2.4` item 4's annotation): (i) a REGISTERED ROOT — resolves and
   *  may be written; (ii) a COLD ROOT NAME — declared but rowless, the ONE state a mint may
   *  create (the declared-but-cold root's row); (iii) NOT A ROOT NAME AT ALL — neither
   *  declared nor registered — `'undeclared-name'` on every surface. In this build every
   *  registered root is also declared (a landed mint records its declaration at the mint
   *  site, never at parse), so states (i)/(ii) collapse to `declared.has` — the registered
   *  arm is carried for the three-state model's exactness. */
  function rootIsKnown(rootName: string): boolean {
    return declared.has(rootName) || liveHolders(rootName).length > 0
  }

  /** THE WRITE-SIDE C-TOP GATE (G4-F1, AMENDED 2026-10-03 — UNIT-ADV-1): refuses the write
   *  whose TOP — the segment after the tier on a tier-qualified write (`file.<top>…` ·
   *  `mem.<top>…` · `temp.<top>…`) — is in F-2 state (iii): NOT A ROOT NAME AT ALL (neither
   *  declared nor registered). A CHAIN write (something beyond the top) under a state-(iii)
   *  top is refused `'undeclared-name'` BEFORE any mint/transaction — the write-side mint
   *  NEVER mints an undeclared or dotted root — and every refusal leaves the store
   *  UNCHANGED. The gate is about the TOP, not the depth: a deep-dotted write whose top IS
   *  declared (state (ii)) or registered (state (i)) passes and mints the legal cold root /
   *  chain; and THE ROOT-LEVEL MINT under a state-(iii) top stays legal — the one operation
   *  that lifts a top into the registered state (`§2.4` item 7(a); `§2.8` item 1; F-2's
   *  three states; the F1 clause's own positive control). */
  function ctopWriteRefusal(parsed: WriteName, raw: unknown): GraphWriteReceipt | null {
    if (parsed.tail.length > 1 && !rootIsKnown(parsed.rootName)) {
      const top = parsed.segments[1] ?? parsed.rootName
      return refuse(raw, 'undeclared-name', 'C-TOP', top, null)
    }
    return null
  }

  function rootCapReached(token: GraphNodeFlag): boolean {
    if (token !== 'mem' && token !== 'temp') return false
    let count = 0
    for (const rootName of rootHolders.keys()) {
      for (const holder of liveHolders(rootName)) if (holder.flag === token) count += 1
    }
    return count >= (token === 'mem' ? REGISTER_ROOT_CAP_MEM : REGISTER_ROOT_CAP_TEMP)
  }

  function writeRowsFor(node: GraphNode, path: string, out: GraphAffectedRow[]): void {
    out.push({ name: path, flag: node.flag, nodeRef: node.ref })
    for (const anchor of node.anchors) {
      if (anchor.link === null || anchor.link.to === null) continue
      const child = nodes.get(anchor.link.to)
      if (child === undefined) continue
      writeRowsFor(child, `${path}.${anchor.key}`, out)
    }
  }

  function serializationFailure(ref: GraphNodeRef): 'serialize-failed' | 'validate-failed' | null {
    for (const node of subtreeOf(ref)) {
      const failure = serializationFailureOf(valueOf(node.ref))
      if (failure !== null) return failure
    }
    return null
  }

  function replicate(old: GraphNode, flag: GraphNodeFlag, path: string, affected: AffectedRef[]): GraphNode {
    const ref = mintRef()
    nodes.set(ref, { ref, flag, localName: old.localName, anchors: [], parentLink: null })
    affected.push({ name: path, flag, ref })
    const carried = valueOf(old.ref)
    // THE COPIED ENTRY IS PRESENCE-PRESERVED, NEVER VALUE-GATED (M5's discrimination): a node
    // whose OWN entry holds `undefined` is still a WRITTEN leaf and keeps its entry through the
    // re-tier — the ENTRY is the fact the walk's presence check reads, never the value.
    if (hasValueEntry(old.ref)) setValue(ref, old.localName, carried)
    for (const anchor of old.anchors) {
      if (anchor.link === null || anchor.link.to === null) continue
      const child = nodes.get(anchor.link.to)
      if (child === undefined) continue
      const childRebuilt = replicate(child, flag, `${path}.${anchor.key}`, affected)
      withAnchor(ref, anchor.key, { from: ref, to: childRebuilt.ref, cache: linkEntry(old.localName, childRebuilt.ref, flag), constraint: null })
    }
    return nodes.get(ref) as GraphNode
  }

  function editNode(raw: unknown, parsed: WriteName, node: GraphNode, value: unknown, cause: GraphEvent['cause']): GraphWriteReceipt {
    const prior = valueOf(node.ref)
    const state: ReceiptState = { cleared: [], repaired: [], rows: [{ name: parsed.name, flag: node.flag, nodeRef: node.ref }], crossings: 0, events: 0 }
    // ⟶ AMENDED 2026-10-03 (`UNIT-ADV-1`, G4-F7): "EQUAL VALUE" IS THE PINNED `===`, PINNED —
    // the fire/no-fire decision uses the LANDED `===` on the stored value, NEVER `Object.is`.
    // `NaN === NaN` is `false`, so a SECOND write of the same NaN value is NOT equal-value —
    // it FIRES its event exactly as `===` says; `-0 === 0` is `true`, so a write of `0` after
    // `-0` IS equal-value and fires NOTHING (`§2.10`'s `'set'` arm row; `M-8`'s equal-value
    // row re-pinned at this operator; the F7 clause). An equal-value `set` has no post-state
    // of its own, so the constraint functions are not re-evaluated over it.
    if (cause !== 'set' || prior !== value) {
      const op = cause === 'set' ? 'set' : 'commit'
      // THE APPLICABLE MEMBERS ARE CAPTURED BEFORE THE MUTATION (their `current` state is
      // the PRE-WRITE state); the journal lets a repairless violation roll the write back.
      const slots = captureConstraintSlots(op, parsed)
      const journal = slots.length > 0 ? journalBefore() : null
      setValue(node.ref, node.localName, value)
      const outcome = evaluateConstraints(op, parsed, slots)
      if (outcome.refused) {
        if (journal !== null) revertTo(journal)
        return refusalOfFeedback(parsed.name, outcome.reason ?? 'validate-failed')
      }
      state.events += emit(parsed.name, node.flag, value, [], cause, parsed.name)
      // A REPAIR EMITS ITS OWN `cause:'repair'` EVENT BESIDE the caller's own write event
      // and names the repaired reference(s) in `repaired[]` (field 4.3's `'repair'` arm).
      for (const repairEvent of outcome.repairEvents) {
        state.events += emit(repairEvent.name, repairEvent.flag, repairEvent.value, repairEvent.cleared, 'repair')
      }
      state.repaired.push(...outcome.repairedNames)
    }
    rebuildEntriesAtInvalidation(parsed.rootName)
    return receiptFor(raw, state, 'committed')
  }

  function regenerationReceipt(raw: unknown, parsed: WriteName, value: unknown, staleTarget: GraphNode): GraphWriteReceipt {
    const requested = parsed.token
    // THE LIVE NODE BENEATH THE REFERENCE: an operation between the walk and the transaction
    // rebuilds a node by REPLACING its object (`§2.2` `P-2`: anchors are immutable), so the
    // transaction reads the graph's CURRENT object rather than the walk's own reading.
    const target = nodes.get(staleTarget.ref) ?? staleTarget
    if (target.parentLink !== null) {
      const parent = nodes.get(target.parentLink.from)
      if (parent !== undefined && isRootRef(parent.ref) === false && (DURABILITY_RANK[requested] ?? 0) > (DURABILITY_RANK[parent.flag] ?? 0)) {
        // THE REGENERATION'S NEW ROOT TIER ARM (field 5 #16, `§2.8` item 5): the re-tiered
        // subtree's own PARENT is a non-root node less durable than the request, so the new
        // root would be MORE durable than the node reaching it — REFUSED, store unchanged.
        return refuse(raw, 'durability-inversion', 'G-RESOLVE-LEAF', parsed.tail[parsed.tail.length - 1] ?? null, parent.ref)
      }
    }
    // THE ONE DECLARED NON-REPRESENTABILITY RULE IS THE FILE TIER'S (`§2.8` item 6(b); field
    // 2's `value` row: "One declared non-representability rule exists at the `file` tier
    // only" — token #14, step (3) of the transaction's five: the STABLE-JSON translation of
    // the built set). A mem/temp write NEVER refuses a size, a magnitude or a shape (`§2.2
    // P-6`/`P-9`) — a cyclic or BigInt value stores fine below the file tier, which is what
    // makes F5's cyclic-export drive driveable.
    if (requested === 'file') {
      const failure = serializationFailureOf(value)
      if (failure !== null) return refuse(raw, failure, 'G-RESOLVE-LEAF', null, target.ref)
    }
    // THE APPLICABLE MEMBERS ARE CAPTURED BEFORE THE MUTATION (their `current` is the
    // PRE-WRITE state); the journal lets a repairless violation roll the write back.
    const slots = captureConstraintSlots('commit', parsed)
    const journal = slots.length > 0 ? journalBefore() : null
    // THE DOOMED LOWER-DURABILITY COPIES ARE READ FIRST — BEFORE the regenerated branch moves:
    // the clears happen only AFTER the higher tier durably accepted the value (`§2.8` item 2),
    // and the regenerated branch itself must never be mistaken for a copy to clear (S5: the
    // receipt's `cleared[]` is the AUDIT list naming each cleared reference).
    const doomed: { path: string; ref: GraphNodeRef }[] = []
    for (const holder of rootHolders.get(parsed.rootName) ?? []) {
      if (nodes.get(holder.ref) === undefined) continue
      if ((DURABILITY_RANK[holder.flag] ?? 0) >= (DURABILITY_RANK[requested] ?? 0)) continue
      const lower = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], holder.flag, true, undefined, holder.ref)
      if (lower.node === null) continue
      doomed.push({ path: `${holder.flag}.${parsed.tail.join('.')}`, ref: lower.node?.ref ?? holder.ref })
    }
    const affected: AffectedRef[] = []
    const rebuilt = replicate(target, requested, target.localName, affected)
    const parentLink = target.parentLink
    const targetName = target.localName
    detach(target.ref)
    if (parentLink !== null) {
      const parent = nodes.get(parentLink.from)
      if (parent !== undefined) {
        withAnchor(parent.ref, targetName, {
          from: parent.ref,
          to: rebuilt.ref,
          cache: linkEntry(parsed.rootName, rebuilt.ref, rebuilt.flag),
          constraint: null,
        })
      }
    } else if (target.parentLink === null) {
      setHolder(targetName, rebuilt)
    }
    // THE COMMITTED VALUE LANDS ON THE CALLER'S OWN PATH LEAF of the regenerated branch: the
    // caller's name is the path, and the path's own node is the leaf (`§2.3` item 2) — never
    // on the re-tiered subtree's root (M3: a 66-segment chain regenerated fully answers HIT
    // at its deepest reference with the committed value).
    const leafNode = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], requested, false).node ?? rebuilt
    setValue(leafNode.ref, leafNode.localName, value)
    const cleared: string[] = []
    for (const entry of doomed) {
      if (entry.ref === leafNode.ref) continue
      detach(entry.ref)
      if (!cleared.includes(entry.path)) cleared.push(entry.path)
    }
    // THE CONSTRAINT FUNCTIONS EVALUATE ON THE LANDED POST-STATE (the mutation above is the
    // write); a repairless violation is REFUSAL-VIA-FEEDBACK with the journal rolled back —
    // the store is BYTE-UNCHANGED, the answer a returned record, never a throw.
    const outcome = evaluateConstraints('commit', parsed, slots)
    if (outcome.refused) {
      if (journal !== null) revertTo(journal)
      return refusalOfFeedback(parsed.name, outcome.reason ?? 'validate-failed')
    }
    // THE CROSSING SEAM (`§2.8` items 5(5)/7/8, D-4): a `file`-tier write pushes the
    // STABLE-JSON TRANSLATION OF THE GRAPH through the declared seam — ONE committed write
    // for the whole regenerated set, `crossings: 1` real, never a synthesised integer
    // (X1/X2). The put rides the POST-state graph, so two regenerations of the same settled
    // graph are byte-identical (field 2.5 rule (f)).
    if (requested === 'file') crossingPut(parsed.name)
    const state: ReceiptState = {
      cleared: [...new Set(cleared)],
      repaired: [],
      rows: affected.map((row) => ({ name: row.name, flag: row.flag, nodeRef: row.ref })),
      crossings: requested === 'file' ? 1 : 0,
      events: 0,
    }
    for (const row of affected) state.events += emit(row.name, row.flag, value, state.cleared, 'commit', row.name)
    // EACH LOWER-DURABILITY BRANCH'S OWN COPY of the same logical path is CLEARED, and each
    // cleared reference fires its OWN `cause:'clear'` on ITS OWN path (`§2.8` item 2,
    // `§2.10` item 2).
    for (const path of state.cleared) state.events += emit(path, requested, undefined, [], 'clear', path)
    for (const repairEvent of outcome.repairEvents) {
      state.events += emit(repairEvent.name, repairEvent.flag, repairEvent.value, repairEvent.cleared, 'repair')
    }
    state.repaired.push(...outcome.repairedNames)
    rebuildEntriesAtInvalidation(parsed.rootName)
    return receiptFor(raw, state, 'committed')
  }

  /** WHETHER the caller's own path is ACTUALLY held at a LOWER-DURABILITY tier — the
   *  regeneration transaction's trigger (`§2.8` item 3: "on a path held at a LOWER tier it
   *  performs the REGENERATION TRANSACTION at the requested tier"). A path whose leaf is
   *  missing at the lower tier is not held there (U1: a mint, with its own durability gate). */
  function heldAtLowerTier(parsed: WriteName, requested: GraphNodeFlag): boolean {
    for (const holder of rootHolders.get(parsed.rootName) ?? []) {
      if (nodes.get(holder.ref) === undefined) continue
      if ((DURABILITY_RANK[holder.flag] ?? 0) >= (DURABILITY_RANK[requested] ?? 0)) continue
      const lower = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], holder.flag, true, undefined, holder.ref)
      if (lower.node !== null) return true
    }
    return false
  }

  /** THE LOWER-DURABILITY COPIES of the SAME LOGICAL PATH: a commit to a HIGHER tier clears
   *  each of them, NEVER a higher tier and NEVER recursively (`§2.8` item 2, `C-2`). */
  function clearLowerCopies(parsed: WriteName, requested: GraphNodeFlag, state: ReceiptState): void {
    // THE READ OF EVERY LOWER BRANCH COMES FIRST, THEN THE DELETION: a branch dropped on the
    // way would leave a later branch's own copies unreachable (`§2.8` item 2, `C-2`).
    const doomed: { path: string; ref: GraphNodeRef }[] = []
    for (const holder of rootHolders.get(parsed.rootName) ?? []) {
      if (nodes.get(holder.ref) === undefined) continue
      if ((DURABILITY_RANK[holder.flag] ?? 0) >= (DURABILITY_RANK[requested] ?? 0)) continue
      const lower = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], holder.flag, true, undefined, holder.ref)
      doomed.push({ path: `${holder.flag}.${parsed.tail.join('.')}`, ref: lower.node?.ref ?? holder.ref })
    }
    for (const target of doomed) {
      detach(target.ref)
      if (!state.cleared.includes(target.path)) state.cleared.push(target.path)
    }
    for (const path of state.cleared) state.events += emit(path, requested, undefined, [], 'clear', path)
  }

  /** THE FIRST NODE of the caller's own path whose flag is NOT the requested one — the
   *  SUBTREE a commit to a higher tier RE-TIERS (`§2.8` item 5). Where every node of the path
   *  already carries the requested flag, or the path does not reach one, nothing is located. */
  function locateWriteTarget(rootName: string, tail: readonly string[], requested: GraphNodeFlag): GraphNode | null {
    let current: GraphNode | null = null
    let currentRank = -1
    for (const holder of holdersOf(rootName)) {
      const walk = walkFrom(rootName, holder, [rootName, ...tail.slice(1)], false, undefined)
      if (walk.deepest === null) continue
      const rank = DURABILITY_RANK[walk.deepest.flag] ?? 0
      if (rank <= currentRank) continue
      currentRank = rank
      current = walk.deepest
    }
    if (current === null) return null
    if (current.flag === requested) return null
    // THE SUBTREE IS THE HIGHEST NODE of the caller's own path that must be RE-TIERED for the
    // request to be legal (`§2.8` item 5): climbing while the current node's own PARENT is
    // less durable than the request leaves a subtree whose parent link can carry the new tier
    // — and where none can, the climb stops at the branch's ROOT, where the invariant is
    // VACUOUS (`§2.1`'s named-invariant block). The node AND EVERY DESCENDANT re-tiers, so the
    // caller's own leaf lands at the requested tier with them.
    let subtree = current
    for (;;) {
      const parent = parentOf(subtree) ?? parentPathOf(rootName, tail, subtree.ref)
      if (parent === null) break
      if (isRootRef(parent.ref)) { subtree = parent; break }
      subtree = parent
    }
    return subtree
  }

  /** THE MINT of a ROOT HOLDER at the requested tier (`§2.8` item 3), with the rest of the
   *  caller's own path built beneath it. A HOLDER AT ANOTHER TIER IS NEVER DISTURBED: the
   *  tiers COMPOSE (`§2.3` item 5) and only a commit to a HIGHER tier clears a LOWER copy.
   *  THE MINTED HOLDER IS A ROOT, so the monotonic-persistence invariant is VACUOUS over it
   *  (`§2.1`'s named-invariant block) — the invariant constrains a PARENT LINK, not a
   *  sibling tier's holder. */
  function mintNewHolder(parsed: WriteName, requested: GraphNodeFlag, value: unknown, bound: { rank: number; node: GraphNode | null }): GraphWriteReceipt {
    if (bound.node !== null && (DURABILITY_RANK[requested] ?? 0) > bound.rank) {
      return refuse(parsed.name, 'durability-inversion', 'G-RESOLVE-LEAF', parsed.tail[parsed.tail.length - 1] ?? null, bound.node.ref)
    }
    // THE APPLICABLE MEMBERS ARE CAPTURED BEFORE THE MUTATION (their `current` is the
    // PRE-WRITE state — for a FRESH root, the data record is empty); the journal lets a
    // repairless violation roll the write back byte-exactly, declaration mint included.
    const slots = captureConstraintSlots('commit', parsed)
    const journal = slots.length > 0 ? journalBefore() : null
    // THE COMMIT LANDS, AND A LANDED COMMIT'S MINTED HOLDER IS A ROOT: the commit registers
    // the root's top-level row (`§2.8` item 3). THIS declaration mint lives HERE — inside the
    // mint — and NOT in parseWrite: a REFUSED write never adds a root declaration (CR-1/M2 —
    // the declaration input is the ONLY authority over which names are roots, and a refused
    // write must leave the declaration set byte-identical).
    if (!declared.has(parsed.rootName)) {
      declared.set(parsed.rootName, { root: parsed.rootName, names: [{ name: parsed.name, reserved: false }] })
    }
    const ref = mintRef()
    const fresh: GraphNode = { ref, flag: requested, localName: parsed.rootName, anchors: [], parentLink: null }
    nodes.set(ref, fresh)
    setHolder(parsed.rootName, fresh)
    setValue(ref, parsed.rootName, value)
    const walkTail = [parsed.rootName, ...parsed.tail.slice(1)]
    const holderWalk = anchorWalk(parsed.rootName, walkTail, requested, true, value)
    const reached = holderWalk.node ?? fresh
    // A FRESH HOLDER IS A SIBLING, NOT A RAISE (see the note above this function).
    const raised = false
    const state: ReceiptState = { cleared: [], repaired: [], rows: [], crossings: requested === 'file' ? 1 : 0, events: 0 }
    writeRowsFor(reached, parsed.name, state.rows)
    // THE CONSTRAINT FUNCTIONS EVALUATE ON THE LANDED POST-STATE (the mint above IS the
    // write); a repairless violation is REFUSAL-VIA-FEEDBACK with the journal rolled back —
    // the store is BYTE-UNCHANGED, the answer a returned record, never a throw.
    const outcome = evaluateConstraints('commit', parsed, slots)
    if (outcome.refused) {
      if (journal !== null) revertTo(journal)
      return refusalOfFeedback(parsed.name, outcome.reason ?? 'validate-failed')
    }
    state.events += emit(parsed.name, requested, value, [], 'commit', parsed.name)
    for (const repairEvent of outcome.repairEvents) {
      state.events += emit(repairEvent.name, repairEvent.flag, repairEvent.value, repairEvent.cleared, 'repair')
    }
    state.repaired.push(...outcome.repairedNames)
    if (raised) clearLowerCopies(parsed, requested, state)
    // THE CROSSING SEAM for a `file`-tier MINT (the whole set is ONE committed write — the
    // receipt's `crossings: 1` rides the real put, never a synthesised integer; D-4).
    if (requested === 'file') {
      crossingPut(parsed.name)
      state.crossings = 1
    }
    rebuildEntriesAtInvalidation(parsed.rootName)
    return receiptFor(parsed.name, state, 'committed')
  }

  /** THE DEEPEST NODE OF ANOTHER TIER'S BRANCH: the parent a mint beneath it would answer to
   *  (`§2.1`'s named-invariant block reads `durability(child) <= durability(parent)` from the
   *  node's own `parentLink` — never from a name and never from a tier token). */
  /** THE BOUND an existing sibling branch puts on a mint at `requested`: the HIGHEST
   *  durability among the parents the caller's own parent path reaches in the OTHER tiers'
   *  branches (`§2.1`'s named-invariant block reads `durability(child) <= durability(parent)`
   *  from the graph's own parent link). A branch whose parent path reaches NOTHING — or
   *  reaches only a ROOT, where the invariant is VACUOUS — bounds nothing. */
  function mintBound(parsed: WriteName, requested: GraphNodeFlag): { rank: number; node: GraphNode | null } {
    const parentTail = [parsed.rootName, ...parsed.tail.slice(1, parsed.tail.length - 1)]
    let best: GraphNode | null = null
    let bestRank = -1
    for (const holder of holdersOf(parsed.rootName)) {
      if (holder.flag === requested) continue
      const reached = anchorWalk(parsed.rootName, parentTail, holder.flag, false, undefined, holder.ref).node
      if (reached === null) continue
      if (reached.localName === parsed.tail[0]) continue
      const rank = DURABILITY_RANK[reached.flag] ?? 0
      if (rank > bestRank) {
        bestRank = rank
        best = reached
      }
    }
    return { rank: bestRank, node: best }
  }

  function commitOp(raw: unknown, value: unknown, opts: unknown): GraphWriteReceipt {
    const parsed = parseWrite(raw)
    if (!('token' in parsed)) return parsed as GraphWriteReceipt
    const routing = routingOf(opts)
    if (!('onRepeat' in routing)) return routing as GraphWriteReceipt
    // G4-F1 (AMENDED 2026-10-03 — UNIT-ADV-1): THE WRITE-SIDE C-TOP GATE — a commit whose
    // TOP is state (iii) is REFUSED `'undeclared-name'` BEFORE any mint/transaction; every
    // refusal leaves the store UNCHANGED (a seed row drives through this same gate — the
    // seed's pinned refusal sentence is the write surface's own). The root-level mint under
    // a state-(iii) top stays legal (the one operation that lifts a top into state (i)).
    const f1 = ctopWriteRefusal(parsed, raw)
    if (f1 !== null) return f1
    const requested = parsed.token
    const tierHolder = holderOf(parsed.rootName, requested)
    if (tierHolder === null) {
      // NO HOLDER AT THE PAIR'S OWN TIER: the commit MINTS one (`§2.8` item 3), building the
      // rest of the caller's own path beneath it, and NEVER touches another tier's holder.
      if (rootCapReached(requested)) {
        return refuse(raw, 'cap-exceeded', 'G-RESOLVE-LEAF', parsed.tail[parsed.tail.length - 1] ?? null, null)
      }
      // WHERE THE CALLER'S OWN PATH IS HELD AT A LOWER TIER BY ANOTHER BRANCH'S ROOT, the
      // commit RE-TIERS that whole subtree in ONE committed write (`§2.8` item 5): a ROOT
      // carries no parent link, so the monotonic-persistence invariant is VACUOUS over it
      // (`§2.1`'s named-invariant block). THE REGENERATION RUNS ONLY WHERE THE CALLER'S OWN
      // PATH IS ACTUALLY HELD at the lower tier (the path's leaf is a real node): a path whose
      // leaf is MISSING below the located node is a MINT, not a re-tier (U1 — a `file`-tier
      // child under a `mem` parent is REFUSED, never silently re-tiered).
      const leafWalk = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], null, false)
      const located = locateWriteTarget(parsed.rootName, parsed.tail, requested)
      const heldAtAnotherTier = located !== null && (DURABILITY_RANK[requested] ?? 0) > (DURABILITY_RANK[located.flag] ?? 0)
      if (heldAtAnotherTier && leafWalk.node !== null) {
        // THE FILE TIER ONLY declares a non-representability arm (token #14, step (3) of the
        // transaction's five — the STABLE-JSON translation of the built set): a mem/temp
        // regeneration never refuses a shape (`§2.2 P-6`/`P-9`; field 2's `value` row).
        if (requested === 'file') {
          const failureAtRoot = serializationFailureOf(value)
          if (failureAtRoot !== null) return refuse(raw, failureAtRoot, 'G-RESOLVE-LEAF', null, located.ref)
        }
        return regenerationReceipt(raw, parsed, value, located)
      }
      if (requested === 'file') {
        const failure = serializationFailureOf(value)
        if (failure !== null) return refuse(raw, failure, 'G-RESOLVE-LEAF', null, null)
      }
      // THE MINT'S DURABILITY GATE (field 5 #16; `§2.4` item 7(h)): a mint whose requested tier
      // is MORE DURABLE than the deepest existing node of the caller's own path — the parent
      // the minted child would hang from, read from the graph, never from a name or a tier
      // token — is a DECLARED REFUSAL, never a silent re-tier, and the store is left COMPLETELY
      // UNCHANGED (U1).
      const deepest = leafWalk.deepest
      if (deepest !== null && (DURABILITY_RANK[requested] ?? 0) > (DURABILITY_RANK[deepest.flag] ?? 0)) {
        return refuse(raw, 'durability-inversion', 'G-RESOLVE-LEAF', leafWalk.firstMissing ?? parsed.tail[parsed.tail.length - 1] ?? null, deepest.ref)
      }
      return mintNewHolder(parsed, requested, value, mintBound(parsed, requested))
    }
    const walkTail = [parsed.rootName, ...parsed.tail.slice(1)]
    const walked = anchorWalk(parsed.rootName, walkTail, null, false)
    if (walked.severed) {
      return refuse(raw, 'severed-link', 'E-LINK', walked.firstMissing ?? parsed.name, walked.deepest?.ref ?? null)
    }
    const target = walked.target
    const lastSegment = parsed.tail[parsed.tail.length - 1] as string
    if (target !== null && routing.onRepeat === 'refuse' && target.flag === requested) {
      return refuse(raw, 'duplicate-path-tier', 'G-RESOLVE-LEAF', lastSegment, target.ref)
    }
    if (target !== null && target.flag !== requested) {
      // THE TRANSACTION RE-TIERS FROM THE HIGHEST NODE OF THE PATH THAT MUST BE RE-TIERED for
      // the requested tier to be legal (`§2.8` item 5): a CHILD may never be MORE durable than
      // the node that reaches it (`§2.1`'s named-invariant block), so where the target's own
      // PARENT is less durable than the request the SUBTREE is the parent's, not the target's.
      return regenerationReceipt(raw, parsed, value, target)
    }
    if (target !== null && target.flag === requested && heldAtLowerTier(parsed, requested)) {
      // THE PAIR HOLDS, BUT THE PATH IS ALSO HELD AT A LOWER TIER: `commit` performs the
      // REGENERATION TRANSACTION at the requested tier (`§2.8` item 3) — ONE committed write
      // that re-tiers the held branch and clears every lower copy, pushing the `file`-tier
      // translation through the crossing seam (X2: the re-created lower copy is cleared and
      // the settled graph's translation is byte-identical).
      return regenerationReceipt(raw, parsed, value, target)
    }
    if (target !== null) return editNode(raw, parsed, target, value, 'commit')
    // NO NODE HOLDS THE PAIR. The commit descends through the CALLER'S OWN PATH to locate the
    // FIRST node whose flag is not the requested one: that node is the SUBTREE the transaction
    // RE-TIERS (`§2.8` item 5), and where none is found the missing child is MINTED below the
    // deepest node the walk reached.
    const located = locateWriteTarget(parsed.rootName, parsed.tail, requested)
    if (located !== null) return regenerationReceipt(raw, parsed, value, located)
    const deepest = walked.deepest
    if (deepest === null) return refuse(raw, 'undeclared-name', 'C-TOP', parsed.rootName, null)
    if ((DURABILITY_RANK[requested] ?? 0) > (DURABILITY_RANK[deepest.flag] ?? 0)) {
      return refuse(raw, 'durability-inversion', 'G-RESOLVE-LEAF', walked.firstMissing ?? lastSegment, deepest.ref)
    }
    // FILE-TIER-ONLY serialization refusal (`§2.8` item 6(b); field 2's `value` row) — a
    // mem/temp mint never refuses a shape.
    if (requested === 'file') {
      const failure = serializationFailureOf(value)
      if (failure !== null) return refuse(raw, failure, 'G-RESOLVE-LEAF', null, deepest.ref)
    }
    // THE APPLICABLE MEMBERS ARE CAPTURED BEFORE THE MUTATION (their `current` is the
    // PRE-WRITE state); the journal lets a repairless violation roll the write back.
    const slots = captureConstraintSlots('commit', parsed)
    const journal = slots.length > 0 ? journalBefore() : null
    const childWalk = anchorWalk(parsed.rootName, walkTail, requested, true, value)
    const minted = childWalk.node
    if (minted === null) return refuse(raw, 'undeclared-name', 'C-TOP', parsed.rootName, null)
    const raised = true
    const state: ReceiptState = { cleared: [], repaired: [], rows: [], crossings: requested === 'file' ? 1 : 0, events: 0 }
    writeRowsFor(minted, parsed.name, state.rows)
    // THE CONSTRAINT FUNCTIONS EVALUATE ON THE LANDED POST-STATE (the mint above IS the
    // write); a repairless violation is REFUSAL-VIA-FEEDBACK with the journal rolled back —
    // the store is BYTE-UNCHANGED, the answer a returned record, never a throw.
    const outcome = evaluateConstraints('commit', parsed, slots)
    if (outcome.refused) {
      if (journal !== null) revertTo(journal)
      return refusalOfFeedback(parsed.name, outcome.reason ?? 'validate-failed')
    }
    state.events += emit(parsed.name, requested, value, [], 'commit', parsed.name)
    for (const repairEvent of outcome.repairEvents) {
      state.events += emit(repairEvent.name, repairEvent.flag, repairEvent.value, repairEvent.cleared, 'repair')
    }
    state.repaired.push(...outcome.repairedNames)
    if (raised) clearLowerCopies(parsed, requested, state)
    rebuildEntriesAtInvalidation(parsed.rootName)
    return receiptFor(raw, state, 'committed')
  }

  function setOrMint(raw: unknown, value: unknown, opts: unknown): GraphWriteReceipt {
    const parsed = parseWrite(raw)
    if (!('token' in parsed)) return parsed as GraphWriteReceipt
    const routing = routingOf(opts)
    if (!('onRepeat' in routing)) return routing as GraphWriteReceipt
    // G4-F1 (AMENDED 2026-10-03 — UNIT-ADV-1): the WRITE-SIDE C-TOP GATE — a set whose TOP
    // is state (iii) is REFUSED `'undeclared-name'` BEFORE any walk; the write-side mint
    // never mints an undeclared or dotted root, store unchanged.
    const f1 = ctopWriteRefusal(parsed, raw)
    if (f1 !== null) return f1
    const walked = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], parsed.token, false)
    if (walked.severed) {
      return refuse(raw, 'severed-link', 'E-LINK', walked.firstMissing ?? parsed.name, walked.deepest?.ref ?? null)
    }
    const target = walked.node
    if (target === null) {
      return refuse(raw, 'undeclared-name', 'G-RESOLVE-LEAF', walked.firstMissing ?? parsed.tail[parsed.tail.length - 1] ?? null, walked.deepest?.ref ?? null)
    }
    if (target.flag !== parsed.token) {
      return refuse(raw, 'undeclared-name', 'G-RESOLVE-LEAF', parsed.tail[parsed.tail.length - 1] ?? null, target.ref)
    }
    return editNode(raw, parsed, target, value, 'set')
  }

  function removeOp(raw: unknown): GraphWriteReceipt {
    const parsed = parseWrite(raw)
    if (!('token' in parsed)) return parsed as GraphWriteReceipt
    // THE REFUSAL IS BY NAME, NEVER BY VALUE (`§2.4` item 7(f), `F-20`): the name that
    // carries a `reserved:true` declaration is read BEFORE the walk, so the same graph
    // fact is refused whatever the node's own value is.
    for (const row of declared.values()) {
      for (const spelling of row.names) {
        if (spelling.reserved && spelling.name === parsed.name) return refuse(raw, 'reserved-name', 'C-TOP', null, null)
      }
    }
    const walked = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], parsed.token, false)
    if (walked.severed) {
      return refuse(raw, 'severed-link', 'E-LINK', walked.firstMissing ?? parsed.name, walked.deepest?.ref ?? null)
    }
    const target = walked.node
    if (target === null) {
      return refuse(raw, 'undeclared-name', 'G-RESOLVE-LEAF', walked.firstMissing ?? parsed.tail[parsed.tail.length - 1] ?? null, walked.deepest?.ref ?? null)
    }
    // THE APPLICABLE MEMBERS ARE CAPTURED BEFORE THE MUTATION (their `current` is the
    // PRE-WRITE state — a removed leaf's own data is still present in the matched record);
    // the journal lets a repairless violation roll the remove back byte-exactly.
    const slots = captureConstraintSlots('remove', parsed)
    const journal = slots.length > 0 ? journalBefore() : null
    // `remove` CLEARS DOWNWARD (`§2.8` item 4): the NAMED tier AND EVERY LESS-PERSISTENT COPY of
    // the same logical path, never a higher tier — each copy is SEVERED from its own parent and
    // its own value dropped, and the parent's anchor slot is dropped with it.
    const cleared: string[] = []
    const lowerCleared: string[] = []
    for (const holder of holdersOf(parsed.rootName)) {
      if ((DURABILITY_RANK[holder.flag] ?? 0) > (DURABILITY_RANK[parsed.token] ?? 0)) continue
      const candidate = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], holder.flag, false, undefined, holder.ref)
      if (candidate.node === null) continue
      cleared.push(`${holder.flag}.${parsed.tail.join('.')}`)
      if ((DURABILITY_RANK[holder.flag] ?? 0) < (DURABILITY_RANK[parsed.token] ?? 0)) {
        lowerCleared.push(`${holder.flag}.${parsed.tail.join('.')}`)
      }
      detach(candidate.node.ref)
    }
    const state: ReceiptState = { cleared: [...new Set(cleared)], repaired: [], rows: [], crossings: 0, events: 0 }
    // THE CONSTRAINT FUNCTIONS EVALUATE ON THE LANDED POST-STATE (the removal above IS the
    // write — the removed leaf is OBSERVABLE as absent from the matched record); a repairless
    // violation is REFUSAL-VIA-FEEDBACK with the journal rolled back — the store is
    // BYTE-UNCHANGED, the answer a returned record, never a throw.
    const outcome = evaluateConstraints('remove', parsed, slots)
    if (outcome.refused) {
      if (journal !== null) revertTo(journal)
      return refusalOfFeedback(parsed.name, outcome.reason ?? 'validate-failed')
    }
    // A CLEARED LOWER REFERENCE fires its OWN `cause:'clear'` on its OWN path; the NAMED
    // reference itself is removed by the `'remove'` event — the arm that carries the audit
    // list in `cleared[]` and is distinguishable from a commit-with-clears by its cause token
    // and by `value: undefined` (field 4.3's `'remove'` row).
    for (const path of [...new Set(lowerCleared)]) state.events += emit(path, parsed.token, undefined, [], 'clear', path)
    state.events += emit(parsed.name, parsed.token, undefined, state.cleared, 'remove', parsed.name)
    for (const repairEvent of outcome.repairEvents) {
      state.events += emit(repairEvent.name, repairEvent.flag, repairEvent.value, repairEvent.cleared, 'repair')
    }
    state.repaired.push(...outcome.repairedNames)
    rebuildEntriesAtInvalidation(parsed.rootName)
    return receiptFor(raw, state, 'committed')
  }

  function clearOp(raw: unknown): GraphWriteReceipt {
    const parsed = parseWrite(raw)
    if (!('token' in parsed)) return parsed as GraphWriteReceipt
    const walked = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], parsed.token, false)
    if (walked.severed) {
      return refuse(raw, 'severed-link', 'E-LINK', walked.firstMissing ?? parsed.name, walked.deepest?.ref ?? null)
    }
    const target = walked.node
    if (target === null) {
      return refuse(raw, 'undeclared-name', 'G-RESOLVE-LEAF', walked.firstMissing ?? parsed.tail[parsed.tail.length - 1] ?? null, walked.deepest?.ref ?? null)
    }
    dropValue(target.ref)
    const state: ReceiptState = { cleared: [parsed.name], repaired: [], rows: [], crossings: 0, events: 0 }
    state.events += emit(parsed.name, target.flag, undefined, [], 'clear', parsed.name)
    rebuildEntriesAtInvalidation(parsed.rootName)
    return receiptFor(raw, state, 'committed')
  }

  function sweepOp(raw: unknown): GraphWriteReceipt {
    const parsed = parseWrite(raw)
    if (!('token' in parsed)) return parsed as GraphWriteReceipt
    const walked = anchorWalk(parsed.rootName, [parsed.rootName, ...parsed.tail.slice(1)], parsed.token, false)
    if (walked.severed) {
      return refuse(raw, 'severed-link', 'E-LINK', walked.firstMissing ?? parsed.name, walked.deepest?.ref ?? null)
    }
    const target = walked.node
    if (target === null) {
      return refuse(raw, 'undeclared-name', 'G-RESOLVE-LEAF', walked.firstMissing ?? parsed.tail[parsed.tail.length - 1] ?? null, walked.deepest?.ref ?? null)
    }
    // ⟶ AMENDED 2026-10-03 (`UNIT-ADV-1`, G4-F4): THE SWEEP'S RECEIPT/EVENT SET MATCHES ITS
    // POST-STATE, PINNED (per-swept-reference truthfulness). `cleared[]` AND the `'sweep'`
    // events name EXACTLY the references the sweep ACTUALLY clears: every name listed has its
    // value entry REALLY dropped HERE, so each swept reference answers MISS after the sweep —
    // one `'sweep'` event per cleared reference, `events === cleared.length`, never one
    // list-carrying event (`§2.8` item 4, `§2.10` item 2's `'sweep'` arm). A reference that
    // still answers a value after the sweep was NEVER swept — it is neither named nor fired
    // (the F4 clause; `§3.3 I-16` read as one event per ACTUALLY-affected reference).
    const swept: { path: string; ref: GraphNodeRef }[] = []
    const collectSwept = (node: GraphNode, logical: string): void => {
      swept.push({ path: `${parsed.token}.${logical}`, ref: node.ref })
      for (const anchor of node.anchors) {
        if (anchor.link === null || anchor.link.to === null) continue
        const child = nodes.get(anchor.link.to)
        if (child === undefined) continue
        collectSwept(child, `${logical}.${anchor.key}`)
      }
    }
    collectSwept(target, parsed.tail.join('.'))
    for (const { ref } of swept) dropValue(ref)
    const state: ReceiptState = { cleared: swept.map((entry) => entry.path), repaired: [], rows: [], crossings: 0, events: 0 }
    for (const entry of swept) state.events += emit(entry.path, parsed.token, undefined, [], 'sweep', entry.path)
    rebuildEntriesAtInvalidation(parsed.rootName)
    return receiptFor(raw, state, 'committed')
  }

  function severOp(raw: unknown, anchorKey: unknown): GraphWriteReceipt {
    const parsed = parseWrite(raw)
    if (!('token' in parsed)) return parsed as GraphWriteReceipt
    if (typeof anchorKey !== 'string' || anchorKey.length === 0) return refuse(raw, 'malformed-name', 'A-PARSE', null, null)
    const ownerWalk = anchorWalk(parsed.rootName, parsed.tail, null, false)
    const owner = ownerWalk.node ?? ownerWalk.deepest
    if (owner === null) return refuse(raw, 'undeclared-name', 'C-TOP', parsed.rootName, null)
    const anchor = anchorOf(owner.ref, anchorKey)
    if (anchor === null) return refuse(raw, 'no-such-anchor', 'D-ANCHOR', anchorKey, owner.ref)
    const logKey = `${owner.ref}::${anchorKey}`
    if (anchor.link === null || anchor.link.to === null) {
      const previous = severLog.get(logKey) ?? []
      return receiptFor(raw, { cleared: [...previous], repaired: [], rows: [], crossings: 0, events: 0 }, 'committed')
    }
    const target = nodes.get(anchor.link.to)
    const ownerName = parsed.tail[0] as string
    const released: string[] = []
    if (target !== undefined) {
      for (const held of referenceNamesOf(ownerName, anchorKey, target.ref)) {
        released.push(`${parsed.token}.${held}`)
      }
    }
    dropSubtree(anchor.link.to)
    severLog.set(logKey, released)
    withAnchor(owner.ref, anchorKey, {
      from: owner.ref,
      to: null,
      cache: linkEntry(parsed.rootName, anchor.link.cache.matchedRef, anchor.link.cache.matchedTier),
      constraint: null,
    })
    const state: ReceiptState = { cleared: released, repaired: [], rows: [], crossings: 0, events: 0 }
    for (const reference of released) {
      const held: GraphNodeFlag = target === undefined ? 'file' : target.flag
      state.events += emit(reference, held, undefined, released, 'severed')
    }
    for (const subscriber of subscriptions) if (released.includes(subscriber.name)) subscriber.live = false
    rebuildEntriesAtInvalidation(parsed.rootName)
    return receiptFor(raw, state, 'committed')
  }

  /** THE RELEASED REFERENCES (`§2.10` item 3): EVERY reference the severed node OR ANY
   *  REFERENCE IT HELD answers for, in the caller's own spelling. */
  function referenceNamesOf(rootLocal: string, anchorKey: string, targetRef: GraphNodeRef): string[] {
    const out: string[] = []
    const walk = (ref: GraphNodeRef, path: string): void => {
      const node = nodes.get(ref)
      if (node === undefined) return
      out.push(path)
      for (const anchor of node.anchors) {
        if (anchor.link === null || anchor.link.to === null) continue
        walk(anchor.link.to, `${path}.${anchor.key}`)
      }
    }
    walk(targetRef, `${rootLocal}.${anchorKey}`)
    return out
  }

  /* ── THE EXPORT (`§2.9`) ── */

  function exportOf(raw: unknown): GraphResolveResult | GraphRefusalReason {
    const answer = resolveRead(raw)
    const record = answer as Record<string, unknown>
    if (record['status'] === 'refused') return record['reason'] as GraphRefusalReason
    const read = answer as GraphResolveResult
    if (read.found === false) return miss(read.name)
    // THE HIT ARM — a fresh object per call, cache never granted (field 2.9); the merged arm
    // is WITHDRAWN (D-1), so a hit is exactly the hit (three cases and no fourth).
    return { found: true, value: snapshotValue(read.value), tier: read.tier, flag: read.tier, cache: undefined, name: read.name } as unknown as GraphReadHit
  }

  /* ── THE TIER-LOCAL SURFACE (`§2.1`'s `GraphTierHandle`) ── */

  function tierHandleFor(flag: GraphNodeFlag): GraphTierHandle {
    const existing = handles.get(flag)
    if (existing !== undefined) return existing
    const handle: GraphTierHandle = {
      tier: flag,
      get(name: unknown): GraphTierGetResult {
        const answer = resolveRead(name) as Record<string, unknown>
        if (answer['status'] === 'refused') return { found: false, value: undefined, name: typeof name === 'string' ? name : '' }
        const read = answer as unknown as GraphResolveResult
        if (read.found === false) return { found: false, value: undefined, name: read.name }
        return { found: true, value: read.value, name: read.name }
      },
      has(name: unknown): boolean {
        const walk = resolvePath(name)
        return walk !== null && walk.node !== null && walk.node.flag === flag
      },
      set(name: unknown, value: unknown, opts?: GraphWriteOptions): GraphWriteReceipt {
        return setOrMint(name, value, opts)
      },
      clear(name: unknown): GraphWriteReceipt {
        return clearOp(name)
      },
    }
    handles.set(flag, handle)
    return handle
  }

  /* ── THE BOOT-HYDRATION SEAM (`HYDRATE-1`, frozen-surface field 2; docs/decisions.md's
     ACTIVE row 'THE BOOT HYDRATION MINT'S EVENTS ARE INTENTIONAL') ── */

  /** `store.hydrate(rows)` — the G2 boot wiring feeds it the Y-1 hand-off's record at boot.
   *  For each `{ name, value }` row it MINTS the file-tier node CHAIN the name implies and
   *  places the value at the leaf — the same node/mint machinery the file-tier mint uses
   *  (setHolder / mintRef / withAnchor + the per-link cache), WITHOUT the crossing
   *  invocation (clause (2): the record came FROM main — a boot write-back is a redundant
   *  round-trip), WITHOUT the constraint capture (the FIRST constraint evaluation stays
   *  reserved for U-STORE-FOCUS's boot step) and WITHOUT the lower-tier regeneration
   *  clears — and FIRES the store's EVENT SURFACE: the boot-load events ARE the
   *  consumer-notification channel, the mint is NOT silent, one event per minted reference
   *  (clauses (1)/(7), I-16, §2.10 item 5). The events ride the EXISTING envelope —
   *  HYDRATE-1 records the cause token as a gap never filled, so the mint's own event takes
   *  the existing minting-write 'commit' arm's shape (no ninth arm is invented). It is NOT
   *  set/commit/remove, registers/releases NO subscription, and the register/ref-count
   *  change ONLY by the top-level rows the record's names mint (the register's own
   *  top-level-projection rule — the same declaration mint the landed file-tier mint
   *  performs); no lower-tier regeneration clears ever run. Refusal posture: SKIP — a
   *  non-array argument, a non-record row, a non-string name, a non-`file.*` spelling is
   *  skipped (mints nothing, fires nothing, never a throw — field 5's closed throw list is
   *  UNCHANGED); the return is void — readiness is DELIVERED by the event surface, never
   *  by a return value (clauses (4)/(8)). */
  function hydrateRows(rows: unknown): void {
    if (!Array.isArray(rows)) return
    const touchedRoots = new Set<string>()
    for (const row of rows) {
      if (row === null || typeof row !== 'object' || Array.isArray(row)) continue
      const candidate = row as { readonly name?: unknown; readonly value?: unknown }
      if (typeof candidate.name !== 'string') continue
      const parsed = parseWrite(candidate.name)
      // A refusal receipt (malformed / secure-refused) and a tier-free or tier-only
      // spelling are SKIPPED — hydrate mints `file.*` references only (clause (4); the
      // seat's 2-segment minimum: a tier and a non-empty top are both required).
      if (!('token' in parsed)) continue
      if (parsed.token !== 'file' || parsed.segments.length < 2) continue
      // THE MINT: the file-tier node chain, value placed at the leaf.
      let root = holderOf(parsed.rootName, 'file')
      if (root === null) {
        const ref = mintRef()
        root = { ref, flag: 'file', localName: parsed.rootName, anchors: [], parentLink: null }
        nodes.set(ref, root)
        setHolder(parsed.rootName, root)
        // THE MINTED TOP'S DECLARATION: the top-level rows the record's names imply enter
        // the register under the register's own top-level-projection rule (`§2.4` item 3's
        // annotation — the rule any mint states): a REFUSED row never gets here, so the
        // declaration-mint-inside-the-mint discipline holds exactly as on the write side.
        if (!declared.has(parsed.rootName)) {
          declared.set(parsed.rootName, { root: parsed.rootName, names: [{ name: candidate.name, reserved: false }] })
        }
      }
      let current: GraphNode = root
      let acc = `file.${parsed.rootName}`
      // THE FIRST TAIL SEGMENT IS THE ROOT'S OWN LOCAL NAME (`§2.3` item 2) — the descent
      // begins at the SECOND one, exactly as the walk's `walkFrom` consumes it.
      for (let index = 1; index < parsed.tail.length; index += 1) {
        const segment = parsed.tail[index] as string
        acc = `${acc}.${segment}`
        const anchor = anchorOf(current.ref, segment)
        let target: GraphNode | null = anchor !== null && anchor.link !== null && anchor.link.to !== null ? (nodes.get(anchor.link.to) ?? null) : null
        if (target === null) {
          const ref = mintRef()
          const link: GraphLink = { from: current.ref, to: ref, cache: linkEntry(parsed.rootName, ref, 'file'), constraint: null }
          const child: GraphNode = { ref, flag: 'file', localName: segment, anchors: [], parentLink: link }
          nodes.set(ref, child)
          // RE-PARENTING DELETES AND RE-MINTS — a live anchor's own members never mutate
          // (field 2.6): the anchor replacement is the immutable-anchor form of the seat's
          // `cur.anchors.set(seg, ...)`.
          withAnchor(current.ref, segment, link)
          target = child
        }
        current = target
      }
      setValue(current.ref, current.localName, candidate.value)
      // THE FIRE: one event per minted reference, the existing envelope — delivered to the
      // exact subscribers on the minted reference and (through the 'descendant' arm) to the
      // {subtree:true} ancestors whose prefix matched — the fire is BY DESIGN, never silent.
      emit(candidate.name, 'file', candidate.value, [], 'commit', candidate.name)
      touchedRoots.add(parsed.rootName)
    }
    // THE CACHE REBUILD AT THE INVALIDATION SITE (never on the read path, `§2.6` item 4):
    // one rebuild per top the record minted — the seat's single invalidation pass, in the
    // checkout's per-name form.
    for (const rootName of touchedRoots) rebuildEntriesAtInvalidation(rootName)
  }

  /* ── CONSTRUCTION ── */

  loadDeclarations()

  const store: Record<string, unknown> = {
    resolve(name: unknown): unknown {
      return resolveRead(name)
    },
    set(name: unknown, value: unknown, opts?: GraphWriteOptions): GraphWriteReceipt {
      return setOrMint(name, value, opts)
    },
    commit(name: unknown, value: unknown, opts?: GraphWriteOptions): GraphWriteReceipt {
      return commitOp(name, value, opts)
    },
    remove(name: unknown): GraphWriteReceipt {
      return removeOp(name)
    },
    clear(name: unknown): GraphWriteReceipt {
      return clearOp(name)
    },
    sweep(name: unknown): GraphWriteReceipt {
      return sweepOp(name)
    },
    export(name: unknown): unknown {
      return exportOf(name)
    },
    sever(from: unknown, anchorKey: unknown): GraphWriteReceipt {
      return severOp(from, anchorKey)
    },
    subscribe(name: unknown, listener: unknown, opts?: { subtree?: boolean }): unknown {
      if (typeof name === 'string' && name.split('.')[0] === 'secure') return refuse(name, 'secure-refused', 'B-SECURE-GATE', null, null)
      if (typeof name !== 'string' || name.length === 0) return refuse(name, 'malformed-name', 'A-PARSE', null, null)
      if (typeof listener !== 'function') return refuse(name, 'malformed-name', 'A-PARSE', null, null)
      const subtree = isRecordObject(opts) && (opts as { subtree?: unknown }).subtree === true
      if (subtree) {
        let amplifiers = 0
        for (const subscriber of subscriptions) if (subscriber.subtree) amplifiers += 1
        if (amplifiers >= AMPLIFIER_SUBSCRIPTION_CAP) return refuse(name, 'cap-exceeded', 'G-RESOLVE-LEAF', null, null)
      }
      const record: SubscriberRecord = { name, subtree, listener: listener as (event: GraphEvent) => void, live: true }
      subscriptions.push(record)
      return {
        name,
        subtree,
        unsubscribe(): boolean {
          if (!record.live) return false
          record.live = false
          subscriptions = subscriptions.filter((candidate) => candidate !== record)
          return true
        },
      }
    },
    tiers: Object.freeze({
      temp: tierHandleFor('temp'),
      mem: tierHandleFor('mem'),
      file: tierHandleFor('file'),
    }),
    get register(): GraphRegister {
      return { rows: registerRows() }
    },
    // THE READ-ONLY VIEW OF THE CALLER-SUPPLIED MEMBERS, BY IDENTITY (RE-DERIVED 2026-10-03:
    // the members are code features — the very array the caller supplied, never a copy, never
    // mutated here, no install path).
    constraints,
    // THE BOOT-HYDRATION SEAM (`HYDRATE-1`, frozen-surface field 2 — PRODUCTION-PRESENT,
    // NEVER a test-seam key: the G2 boot wiring calls it after the Y-1 hand-off; the census's
    // eight test-seam keys stay absent from production constructions, hydrate is not one of
    // them). It mints the file-tier nodes the handed-off record names, FIRES the store's
    // event surface BY DESIGN (the boot-load events ARE the consumer-notification channel —
    // readiness is delivered by the events, never by a return value), NEVER crosses, NEVER
    // evaluates the constraint table, skips malformed rows and returns void.
    hydrate(rows: readonly { readonly name: string; readonly value: unknown }[]): void {
      hydrateRows(rows)
    },
  }

  if (seamEnabled) {
    store['reset'] = (): void => {
      nodes.clear()
      rootHolders.clear()
      registerEntries.clear()
      staleEntries.clear()
      values.length = 0
      subscriptions = []
    }
    store['seed'] = (rows: readonly { readonly name: string; readonly value: unknown }[]): void => {
      if (!Array.isArray(rows)) return
      for (const row of rows) {
        if (!isRecordObject(row)) continue
        commitOp((row as { readonly name?: unknown }).name, (row as { readonly value?: unknown }).value, undefined)
      }
    }
    store['parentLinkCountOf'] = (nodeRef: GraphNodeRef): number => {
      let count = 0
      for (const node of nodes.values()) {
        if (node.parentLink !== null && node.parentLink.to === nodeRef) count += 1
      }
      return count
    }
    store['cacheEntryFor'] = (name: string): GraphRegisterCacheEntry | null => {
      if (typeof name !== 'string') return null
      const entry = registerEntries.get(name)
      if (entry === undefined) return null
      return { name: entry.name, matchedRef: entry.matchedRef, matchedTier: entry.matchedTier }
    }
    store['nodeFor'] = (nodeRef: GraphNodeRef): GraphNode | null => {
      const node = nodes.get(nodeRef)
      return node === undefined ? null : node
    }
    store['anchorFor'] = (owner: GraphNodeRef, key: string): GraphAnchor | null => anchorOf(owner, key)
    store['linkFor'] = (owner: GraphNodeRef, key: string): GraphLink | null => {
      const anchor = anchorOf(owner, key)
      return anchor === null ? null : anchor.link
    }
    store['failNextCacheRebuild'] = (): void => {
      injectArmed = true
    }
  }

  void storeGraphReferences
  void STEP_IDS
  void SEAM_KEYS
  void isFlagToken

  return store as unknown as GraphStore
}
