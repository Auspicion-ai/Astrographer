// src/renderer/tab-strip.ts — Unit U-SHELL-9a: the shell-owned top-bar tab
// strip controller (docs/specs/unit-u-shell-9a-main-focus-tabs.md §2.2/§2.3).
// The strip is SHELL CHROME (not a pane zone — W2-Q12): it owns the active
// highlight, close, drag-reorder-within-strip, new-tab, and horizontal scroll
// (the `overflow-x` rule in index.html). Every tab/focus selection routes
// through the SHARED pure seam in `tab-state.ts` — the SAME application code the
// MCP `provident.focus` tool reaches (the W2-Q12 parity surface). Only the
// active tab's body is materialized (§2.3 single-active render); inactive tabs
// are descriptors on the `TabState`.
import {
  activeTab,
  closeTab,
  coerceTabState,
  coerceTabTarget,
  defaultTabState,
  ensureFirstTab,
  focusTarget,
  nextQueryId,
  openTab,
  reorderTab,
  setSearchParams,
  type TabEntry,
  type TabSearchParams,
  type TabState,
  type TabTarget,
} from './tab-state.js'

/** §2.4 — the default-resolution context (mirrors `TabDefaultContext`). */
export interface TabStripContext {
  hasStore: boolean
  lastFocusedDocumentId?: string | null
  documents: Array<{ documentId: string; title: string }>
}

/** §2.7 — the `provident.focus` payload (target OR tabId, plus `newTab`). */
export interface TabFocusPayload {
  target?: TabTarget
  tabId?: string
  newTab?: boolean
}

export interface TabStripOptions {
  /** The shell strip mount (the top-bar element in index.html). */
  mount: HTMLElement | null
  /** Read the current default-resolution context (the focused store). */
  getContext?: () => TabStripContext
  /** Persist the tab set (the C9 carrier write — `OperatorSettings.tabs`). */
  persist?: (tabs: TabState) => void
  /** Notify the shell when the active tab (the mounted body) changes. */
  onActiveChange?: (entry: TabEntry | null) => void
}

const EMPTY_CONTEXT: TabStripContext = { hasStore: false, documents: [] }

/** The shell tab-strip controller. DOM-touching but fail-soft: an absent mount
 *  still holds valid `TabState` (node/test environments never throw). */
export class TabStrip {
  private readonly mount: HTMLElement | null
  private readonly getContext: () => TabStripContext
  private readonly persist: ((tabs: TabState) => void) | null
  private readonly onActiveChange: ((entry: TabEntry | null) => void) | null
  private state: TabState = defaultTabState()
  private dragId: string | null = null

  constructor(opts: TabStripOptions) {
    this.mount = opts.mount
    this.getContext = opts.getContext ?? (() => EMPTY_CONTEXT)
    this.persist = opts.persist ?? null
    this.onActiveChange = opts.onActiveChange ?? null
  }

  /** The current tab set (a copy so a caller cannot mutate the controller). */
  getState(): TabState {
    return {
      version: this.state.version,
      open: this.state.open.map((e) => ({ ...e })),
      activeId: this.state.activeId,
      order: [...this.state.order],
    }
  }

  /** The active tab's descriptor (the single mounted body — §2.3). */
  active(): TabEntry | null {
    return activeTab(this.state)
  }

  /** Load a persisted tab set (fail-soft coercion — F1/F6). */
  load(raw: unknown): TabState {
    this.commit(coerceTabState(raw))
    return this.getState()
  }

  /** Materialize the first-tab default when empty (F3/F4). */
  ensure(ctx: TabStripContext = this.getContext()): TabState {
    this.commit(ensureFirstTab(this.state, ctx))
    return this.getState()
  }

  /** §2.7 — the shared focus-selection seam. `provident.focus` find-or-opens a
   *  target (or activates a `tabId`), returning the resulting `TabState`. A
   *  malformed/empty target (HOST-6) or an unknown `tabId` on a non-empty set
   *  (HOST-8) is a no-op; only an empty set falls back to the first-tab default. */
  focus(payload: TabFocusPayload | null | undefined): TabState {
    const p = payload ?? {}
    if (typeof p.tabId === 'string' && p.tabId !== '') {
      const existing = this.state.open.find((e) => e.id === p.tabId)
      if (existing) {
        this.commit({ ...this.state, activeId: existing.id })
        return this.getState()
      }
      // HOST-8 — a GHOST tabId must not materialize a default tab while tabs
      // exist. The empty-set case keeps the first-tab default (F3).
      if (this.state.open.length > 0) return this.getState()
      this.commit(ensureFirstTab(this.state, this.getContext()))
      return this.getState()
    }
    if (p.target !== undefined) {
      // HOST-6 — TOTAL target coercion: a malformed/empty target is dropped
      // (no phantom tab); it never falls through to the default.
      const target = coerceTabTarget(p.target)
      if (target === null) return this.getState()
      this.commit(focusTarget(this.state, target, { newTab: p.newTab === true }))
      return this.getState()
    }
    this.commit(ensureFirstTab(this.state, this.getContext()))
    return this.getState()
  }

  /** Open a new tab. Only the first tab may open targetless; a later targetless
   *  new-tab requires an explicit target and is otherwise a NO-OP (§2.4,
   *  HOST-3 — never a synthesized `documents[0]`/targetless tab). */
  newTab(target?: TabTarget | null): TabState {
    if (target) {
      this.commit(openTab(this.state, target))
    } else if (this.state.open.length === 0) {
      this.commit(openTab(this.state, null, this.getContext()))
    }
    // HOST-3 — a non-first `+` with no target is a no-op (the caller must
    // supply an explicit target).
    return this.getState()
  }

  /** Activate an existing tab by id. */
  activate(id: string): TabState {
    const existing = this.state.open.find((e) => e.id === id)
    if (existing) this.commit({ ...this.state, activeId: existing.id })
    return this.getState()
  }

  /** Close a tab; when the set empties, re-default the first tab (§2.4/F4). */
  close(id: string): TabState {
    const closed = closeTab(this.state, id)
    this.commit(closed.open.length === 0 ? ensureFirstTab(closed, this.getContext()) : closed)
    return this.getState()
  }

  /** Drag-reorder within the strip (never a pane relocation — §2.2). */
  reorder(id: string, toIndex: number): TabState {
    this.commit(reorderTab(this.state, id, toIndex))
    return this.getState()
  }

  /** §2.6 — the search pane-first expand-to-tab control: open the current query
   *  as a NEW search tab (the tab owns the params). HOST-7 — the `queryId` is
   *  allocated collision-free (never re-uses a closed tab's id). */
  expandSearchTab(query: string): TabState {
    const queryId = nextQueryId(this.state)
    const opened = openTab(this.state, { kind: 'search', queryId })
    const id = opened.activeId
    if (id !== null) this.commit(setSearchParams(opened, id, { query: String(query ?? '') }))
    else this.commit(opened)
    return this.getState()
  }

  /** §2.6/HOST-4 — a search-result click opens the document in a NEW `document`
   *  tab (the search tab stays; duplicates allowed). */
  openDocumentTab(documentId: string): TabState {
    if (typeof documentId !== 'string' || documentId === '') return this.getState()
    this.commit(focusTarget(this.state, { kind: 'document', documentId }, { newTab: true }))
    return this.getState()
  }

  /** §2.6/HOST-5 — an in-tab query edit REUSES that same search tab (re-runs in
   *  place). A non-search/unknown tab is a no-op. */
  editSearchQuery(tabId: string, params: TabSearchParams): TabState {
    const entry = this.state.open.find((e) => e.id === tabId)
    if (!entry || entry.target.kind !== 'search') return this.getState()
    this.commit(setSearchParams(this.state, tabId, params))
    return this.getState()
  }

  private commit(next: TabState): void {
    this.state = next
    this.render()
    try {
      this.persist?.(this.getState())
    } catch {
      // a persistence failure must never break the strip
    }
    try {
      this.onActiveChange?.(this.active())
    } catch {
      // an observer failure must never break the strip
    }
  }

  /** Render the strip descriptors (active highlight/close/reorder/new). */
  private render(): void {
    const mount = this.mount
    if (!mount) return
    try {
      mount.textContent = ''
      for (const id of this.state.order) {
        const entry = this.state.open.find((e) => e.id === id)
        if (!entry) continue
        const tab = document.createElement('button')
        tab.className = entry.id === this.state.activeId ? 'tab is-active' : 'tab'
        tab.dataset.tabId = entry.id
        tab.dataset.targetKind = entry.target.kind
        tab.draggable = true
        tab.textContent = entry.title
        tab.addEventListener('click', () => this.activate(entry.id))
        tab.addEventListener('dragstart', () => {
          this.dragId = entry.id
        })
        tab.addEventListener('dragover', (ev) => {
          ev.preventDefault()
        })
        tab.addEventListener('drop', () => {
          if (this.dragId) {
            const toIndex = this.state.order.indexOf(entry.id)
            this.reorder(this.dragId, toIndex)
            this.dragId = null
          }
        })
        const close = document.createElement('span')
        close.className = 'tab-close'
        close.textContent = '\u00d7'
        close.dataset.tabCloseId = entry.id
        close.addEventListener('click', (ev) => {
          ev.stopPropagation()
          this.close(entry.id)
        })
        tab.appendChild(close)
        mount.appendChild(tab)
      }
      const add = document.createElement('button')
      add.className = 'tab-new'
      add.dataset.tabNew = 'true'
      add.textContent = '+'
      add.addEventListener('click', () => this.newTab())
      mount.appendChild(add)
    } catch {
      // a render failure (e.g. a non-DOM mount) must never break the controller
    }
  }
}
