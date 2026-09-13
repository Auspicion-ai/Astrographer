// src/renderer/tab-state.ts — Unit U-SHELL-9a: the serialized `TabState` model
// (docs/specs/unit-u-shell-9a-main-focus-tabs.md §2.2/§2.9 pin 1). The module is
// PURE (no Electron/DOM): the focus-descriptor types (`TabTarget`/`TabEntry`/
// `TabState`) + the total fail-soft coercion + the focus-selection helpers the
// shell strip and the MCP `provident.focus` tool both call (the shared
// application-code focus seam — W2-Q12 parity). Mirrors `layout-state.ts`'s
// `default*`/`coerce*`/`VERSION` convention for the C9 carrier slice.

/** The v1 active kinds are `document` + `search`; `graph`/`template` are
 *  declared but PARKED (F9 placeholder until unparked). */
export type TabTarget =
  | { kind: 'document'; documentId: string }
  | { kind: 'search'; queryId: string }
  | { kind: 'graph'; view: string }
  | { kind: 'template'; templateId: string }
  | { kind: 'other'; id: string }

/** §2.6 — the `rag.query` params a search tab owns once opened (the C18
 *  surface). Results are DERIVED (re-run), never stored. */
export interface TabSearchParams {
  query: string
  topK?: number
  mode?: 'flat' | 'graph'
  maxHops?: number
  expand?: 'none' | 'parent'
  maxParentContext?: number
  filters?: unknown
  stores?: 'all'
}

/** One open tab. `search?` carries the search params (§2.6); inactive tabs are
 *  descriptors with NO materialized body (single-active render, §2.3). */
export interface TabEntry {
  id: string
  target: TabTarget
  title: string
  search?: TabSearchParams
}

/** The serialized tab state (the C9 `OperatorSettings.tabs` slice). `order` is
 *  a permutation of `open[].id`; `activeId` is `null` or a member of `open`
 *  (structural invariants §2.2). */
export interface TabState {
  version: number
  open: TabEntry[]
  activeId: string | null
  order: string[]
}

/** §2.4 — the default-resolution context (the focused store's documents + the
 *  previous session's most-recently-focused document). `hasStore:false` ⇒ the
 *  no-store landing listing of available wikis. */
export interface TabDefaultContext {
  hasStore: boolean
  lastFocusedDocumentId?: string | null
  documents: Array<{ documentId: string; title: string }>
}

/** The current `TabState` schema version. */
export const TAB_STATE_VERSION = 1

/** §2.9 pin 3 — the landing/wikis listing is modeled as an `other` target
 *  (the `TabTarget` union has no `landing` kind). */
export const TAB_LANDING: TabTarget = { kind: 'other', id: 'landing' }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** The kind-specific identity string for a target (the `targetEquals` key). */
function targetIdentity(target: TabTarget): string {
  switch (target.kind) {
    case 'document':
      return target.documentId
    case 'search':
      return target.queryId
    case 'graph':
      return target.view
    case 'template':
      return target.templateId
    case 'other':
      return target.id
  }
}

/** TOTAL target coercion: an unknown/malformed target is dropped (never a
 *  partial/phantom kind). Only known fields survive. PURE. */
function coerceTarget(value: unknown): TabTarget | null {
  if (!isRecord(value)) return null
  switch (value.kind) {
    case 'document':
      return typeof value.documentId === 'string' && value.documentId !== ''
        ? { kind: 'document', documentId: value.documentId }
        : null
    case 'search':
      return typeof value.queryId === 'string' && value.queryId !== ''
        ? { kind: 'search', queryId: value.queryId }
        : null
    case 'graph':
      return typeof value.view === 'string' && value.view !== ''
        ? { kind: 'graph', view: value.view }
        : null
    case 'template':
      return typeof value.templateId === 'string' && value.templateId !== ''
        ? { kind: 'template', templateId: value.templateId }
        : null
    case 'other':
      return typeof value.id === 'string' && value.id !== ''
        ? { kind: 'other', id: value.id }
        : null
    default:
      return null
  }
}

/** HOST-6 — the PUBLIC total target coercion the shell focus seam (and the MCP
 *  `provident.focus` boundary) uses so a malformed/empty target is dropped
 *  rather than materializing a phantom tab. PURE. */
export function coerceTabTarget(value: unknown): TabTarget | null {
  return coerceTarget(value)
}

/** TOTAL search-params coercion — only known fields survive (credentials/unknown
 *  fields are NEVER copied). PURE. */
function coerceSearchParams(value: unknown): TabSearchParams | undefined {
  if (!isRecord(value) || typeof value.query !== 'string') return undefined
  const out: TabSearchParams = { query: value.query }
  if (typeof value.topK === 'number' && Number.isFinite(value.topK)) out.topK = value.topK
  if (value.mode === 'flat' || value.mode === 'graph') out.mode = value.mode
  if (typeof value.maxHops === 'number' && Number.isFinite(value.maxHops)) out.maxHops = value.maxHops
  if (value.expand === 'none' || value.expand === 'parent') out.expand = value.expand
  if (typeof value.maxParentContext === 'number' && Number.isFinite(value.maxParentContext)) {
    out.maxParentContext = value.maxParentContext
  }
  if (value.filters !== undefined) out.filters = value.filters
  if (value.stores === 'all') out.stores = 'all'
  return out
}

/** The pinned empty v1 tab set. A FUNCTION so every caller owns a fresh object. */
export function defaultTabState(): TabState {
  return { version: TAB_STATE_VERSION, open: [], activeId: null, order: [] }
}

/** TOTAL fail-soft coercion for the C9 `tabs` slice (F1/F6/§2.9 pin 9). Junk
 *  input never throws. A malformed/unknown `version` fails soft to the empty
 *  set. Drops dangling/duplicate ids, keeps `order` a permutation of
 *  `open[].id`, and falls back `activeId`. Only known fields survive (deep
 *  sanitize — credentials and unknown fields are NEVER copied). PURE. */
export function coerceTabState(value: unknown): TabState {
  if (!isRecord(value)) return defaultTabState()
  if (value.version !== TAB_STATE_VERSION) return defaultTabState()

  const seen = new Set<string>()
  const open: TabEntry[] = []
  const rawOpen = Array.isArray(value.open) ? value.open : []
  for (const raw of rawOpen) {
    if (!isRecord(raw)) continue
    const id = raw.id
    if (typeof id !== 'string' || id === '' || seen.has(id)) continue
    const target = coerceTarget(raw.target)
    if (target === null) continue
    seen.add(id)
    const entry: TabEntry = { id, target, title: typeof raw.title === 'string' ? raw.title : id }
    const search = coerceSearchParams(raw.search)
    if (search !== undefined) entry.search = search
    open.push(entry)
  }

  const openIds = new Set(open.map((e) => e.id))
  const order: string[] = []
  const seenOrder = new Set<string>()
  const rawOrder = Array.isArray(value.order) ? value.order : []
  for (const oid of rawOrder) {
    if (typeof oid !== 'string' || !openIds.has(oid) || seenOrder.has(oid)) continue
    seenOrder.add(oid)
    order.push(oid)
  }
  for (const e of open) {
    if (!seenOrder.has(e.id)) {
      seenOrder.add(e.id)
      order.push(e.id)
    }
  }

  let activeId: string | null = null
  if (typeof value.activeId === 'string' && openIds.has(value.activeId)) activeId = value.activeId
  else if (order.length > 0) activeId = order[0]

  return { version: TAB_STATE_VERSION, open, activeId, order }
}

/** Structural target equality: same kind AND same kind-specific id (a search
 *  target is never equal to a document target). PURE. */
export function targetEquals(a: TabTarget, b: TabTarget): boolean {
  return a.kind === b.kind && targetIdentity(a) === targetIdentity(b)
}

/** §2.3 — the single active tab's descriptor, or `null` when `activeId` is
 *  null/unmatched (no body mounted). PURE. */
export function activeTab(state: TabState): TabEntry | null {
  if (state.activeId === null) return null
  return state.open.find((e) => e.id === state.activeId) ?? null
}

/** A fresh, collision-free tab id (`tab-<n>`). PURE. */
function nextTabId(state: TabState): string {
  const used = new Set(state.open.map((e) => e.id))
  let n = state.open.length + 1
  while (used.has(`tab-${n}`)) n++
  return `tab-${n}`
}

/** HOST-7 — a collision-free search `queryId` (`search-<n>`), mirroring
 *  `nextTabId`. The old `open.length + 1` formula re-used an id after a tab
 *  close, so two search tabs could share a `queryId`. PURE. */
export function nextQueryId(state: TabState): string {
  const used = new Set(
    state.open
      .filter((e) => e.target.kind === 'search')
      .map((e) => (e.target as { queryId: string }).queryId),
  )
  let n = state.open.length + 1
  while (used.has(`search-${n}`)) n++
  return `search-${n}`
}

/** The default title for a target. PURE. */
function titleFor(target: TabTarget): string {
  switch (target.kind) {
    case 'document':
      return target.documentId
    case 'search':
      return `Search: ${target.queryId}`
    case 'graph':
      return `Graph: ${target.view}`
    case 'template':
      return `Template: ${target.templateId}`
    case 'other':
      return target.id
  }
}

/** Append a new entry + activate it. PURE. */
function appendEntry(state: TabState, entry: TabEntry): TabState {
  return {
    version: TAB_STATE_VERSION,
    open: [...state.open, entry],
    activeId: entry.id,
    order: [...state.order, entry.id],
  }
}

/** Build a new entry (id/title/search overrides honoured). PURE. */
function makeEntry(
  state: TabState,
  target: TabTarget,
  opts?: { title?: string; id?: string; search?: TabSearchParams },
): TabEntry {
  const id =
    opts?.id !== undefined && !state.open.some((e) => e.id === opts.id) ? opts.id : nextTabId(state)
  const entry: TabEntry = { id, target, title: opts?.title ?? titleFor(target) }
  if (opts?.search !== undefined) entry.search = { ...opts.search }
  return entry
}

/** §2.7 — find-or-open: activate an existing tab for the target, else open +
 *  activate a new one. `newTab` forces a duplicate. PURE. */
export function focusTarget(
  state: TabState,
  target: TabTarget,
  opts?: { newTab?: boolean; title?: string; id?: string; search?: TabSearchParams },
): TabState {
  if (opts?.newTab !== true) {
    const existing = state.open.find((e) => targetEquals(e.target, target))
    if (existing) return { ...state, activeId: existing.id }
  }
  return appendEntry(state, makeEntry(state, target, opts))
}

/** Open a tab. Only the FIRST tab may open targetless (a later targetless
 *  new-tab is rejected — §2.4). PURE. */
export function openTab(state: TabState, target: TabTarget | null, ctx?: TabDefaultContext): TabState {
  let t: TabTarget
  if (target === null) {
    if (state.open.length > 0) {
      throw new Error('U-SHELL-9a: only the first tab may open without a target')
    }
    t = resolveDefaultTarget(ctx ?? { hasStore: false, documents: [] }) ?? { ...TAB_LANDING }
  } else {
    t = target
  }
  return appendEntry(state, makeEntry(state, t))
}

/** Close a tab. An unknown id is a no-op. The active tab's closure activates
 *  its LEFT neighbour, else the RIGHT, else `null` (F4). PURE. */
export function closeTab(state: TabState, id: string): TabState {
  const index = state.order.indexOf(id)
  if (index === -1) return state
  const open = state.open.filter((e) => e.id !== id)
  const order = state.order.filter((x) => x !== id)
  let activeId = state.activeId
  if (activeId === id) {
    const left = index > 0 ? state.order[index - 1] : null
    const right = index + 1 < state.order.length ? state.order[index + 1] : null
    activeId = left ?? right ?? null
  }
  return { version: TAB_STATE_VERSION, open, activeId, order }
}

/** Reorder a tab within the strip (drag). `toIndex` is clamped; an unknown id
 *  is a no-op. Never authors a pane/zone relocation. PURE. */
export function reorderTab(state: TabState, id: string, toIndex: number): TabState {
  const from = state.order.indexOf(id)
  if (from === -1) return state
  const order = state.order.slice()
  order.splice(from, 1)
  const clamped = Math.max(0, Math.min(toIndex, order.length))
  order.splice(clamped, 0, id)
  return { ...state, order }
}

/** §2.6 — store the search params on the tab (the tab owns its query state).
 *  An unknown tab id is a no-op. PURE. */
export function setSearchParams(state: TabState, tabId: string, params: TabSearchParams): TabState {
  const index = state.open.findIndex((e) => e.id === tabId)
  if (index === -1) return state
  const open = state.open.map((e, i) => (i === index ? { ...e, search: { ...params } } : e))
  return { ...state, open }
}

/** §2.4/W2-Q11 — resolve the first-tab default: (1) the previous session's
 *  most-recently-focused document, else (2) the alphabetically first document
 *  in the focused store, else (3) the store/landing listing. PURE. */
export function resolveDefaultTarget(ctx: TabDefaultContext): TabTarget | null {
  const documents = Array.isArray(ctx.documents)
    ? ctx.documents.filter((d) => d && typeof d.documentId === 'string' && d.documentId !== '')
    : []
  if (ctx.hasStore) {
    const last = ctx.lastFocusedDocumentId
    if (typeof last === 'string' && last !== '' && documents.some((d) => d.documentId === last)) {
      return { kind: 'document', documentId: last }
    }
    if (documents.length > 0) {
      const first = [...documents].sort((a, b) => (a.documentId < b.documentId ? -1 : a.documentId > b.documentId ? 1 : 0))[0]
      return { kind: 'document', documentId: first.documentId }
    }
  }
  return { ...TAB_LANDING }
}

/** §2.4/F3/F4 — materialize the first-tab default when the set is empty; a
 *  no-op on a non-empty set (never opens a second default tab). PURE. */
export function ensureFirstTab(state: TabState, ctx: TabDefaultContext): TabState {
  if (state.open.length > 0) return state
  const target = resolveDefaultTarget(ctx)
  const entry = makeEntry(state, target ?? { ...TAB_LANDING })
  return { version: TAB_STATE_VERSION, open: [entry], activeId: entry.id, order: [entry.id] }
}
