// src/renderer/hover-preview.ts — Wave-1 Unit U-PARITY-C19: link hover-preview
// (C19 / G3) (docs/specs/unit-u-parity-c19-hover-preview.md §2-§4;
// wave-1-open-decisions W1-Q10 RESOLVED — linked section / doc opening; 0.5 s;
// hoverable). PURE (no Electron) except the shell timing helper, whose timers
// are injectable so the dismissal mechanic is node-testable.
//
// The split pinned by W1-Q10: the POPUP CONTENT is provident app-graph data
// authored here (`hoverPreviewPopup`) and resolved from the existing crosslink
// wiring / snapshot (`resolveHoverPreview`) — NO new MCP tool. The 0.5 s
// post-leave DISMISSAL is a SHELL timing mechanic (`HoverPreviewController`,
// un-journaled) with re-hover cancelling.
import type { LegacyNodeData } from 'provident-ssr'
import { clickableClasses } from './render-shared.js'

/** The C19 post-leave dismissal delay (W1-Q10). */
export const HOVER_PREVIEW_DELAY_MS = 500

/** The document-link opening length: title + the first N lines (W1-Q10). */
export const HOVER_PREVIEW_FIRST_LINES = 3

/** The popup subtree's stable authored id (the MCP-visible popup node). */
export const HOVER_PREVIEW_ID = 'hover-preview'

/** The link-node hover handler names (the provident `on:mouseover` /
 *  `on:mouseout` pair authored on each crosslink). */
export const HOVER_PREVIEW_ENTER_HANDLER = 'hover-preview-enter'
export const HOVER_PREVIEW_LEAVE_HANDLER = 'hover-preview-leave'

/** The popup's own enter/leave handler names — entering the popup within the
 *  dismissal window cancels it (W1-Q10 "hoverable"). */
export const HOVER_PREVIEW_POPUP_ENTER_HANDLER = 'hover-preview-popup-enter'
export const HOVER_PREVIEW_POPUP_LEAVE_HANDLER = 'hover-preview-popup-leave'

// ---- the inline handler bodies (full function-expression strings — the SAME
// form every pane body uses; the app Runtime resolves them, so
// `provident.dispatch` and a DOM mouseover are equivalent). Each reads the
// link's authored `data-hover-target` and routes it to the host seam
// (`window.provident.sidebar.hoverPreview*`) — NEVER an MCP tool.

export const HOVER_PREVIEW_ENTER_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.hoverPreviewEnter !== 'function') return;
  var id = ctx && ctx.node && ctx.node.props && ctx.node.props['data-hover-target'];
  if (id) s.hoverPreviewEnter(String(id));
}`

export const HOVER_PREVIEW_LEAVE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.hoverPreviewLeave !== 'function') return;
  s.hoverPreviewLeave();
}`

export const HOVER_PREVIEW_POPUP_ENTER_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.hoverPreviewPopupEnter !== 'function') return;
  s.hoverPreviewPopupEnter();
}`

export const HOVER_PREVIEW_POPUP_LEAVE_BODY = `function (ctx) {
  var s = window && window.provident && window.provident.sidebar;
  if (!s || typeof s.hoverPreviewPopupLeave !== 'function') return;
  s.hoverPreviewPopupLeave();
}`

// ===========================================================================
// Content resolution (PURE) — the linked node's rendered section, or a
// document link's summary/opening (title + first N lines). No new MCP tool:
// the data comes from the existing snapshot / crosslink wiring.
// ===========================================================================

/** The minimum node shape the resolver reads (a snapshot RAG node). */
export interface HoverPreviewNodeData {
  id: string
  type?: string
  content?: string
}

/** The minimum doc-head shape the resolver reads (a doc-nav document). */
export interface HoverPreviewDocHead {
  documentId: string
  title?: string
}

export interface HoverPreviewData {
  nodes?: ReadonlyArray<HoverPreviewNodeData> | null
  docHeads?: ReadonlyArray<HoverPreviewDocHead> | null
}

/** The resolved popup content. `empty` is the dangling/unknown target state
 *  (state 5 / F1) — the popup author returns `null` for it. */
export interface HoverPreviewContent {
  targetId: string
  kind: 'section' | 'document' | 'empty'
  title: string
  lines: string[]
}

/** Split content into non-empty lines (never returns `['']`). */
function splitLines(content: unknown): string[] {
  if (typeof content !== 'string' || content === '') return []
  return content.split('\n').filter((l) => l.length > 0)
}

/** Resolve a hover target id to its popup content. A doc-head target → a
 *  bounded document opening (`kind: 'document'`, title + first N lines); any
 *  other known node → its section (`kind: 'section'`); an unknown/empty target
 *  → `kind: 'empty'` (never a throw — F1/state 5). PURE + TOTAL. */
export function resolveHoverPreview(
  targetId: string | null | undefined,
  data: HoverPreviewData | null | undefined,
): HoverPreviewContent {
  const id = typeof targetId === 'string' ? targetId : ''
  if (id === '') return { targetId: '', kind: 'empty', title: '', lines: [] }
  const nodes = data != null && Array.isArray(data.nodes) ? data.nodes : []
  const docHeads = data != null && Array.isArray(data.docHeads) ? data.docHeads : []
  const node = nodes.find((n) => n != null && n.id === id)
  const head = docHeads.find((d) => d != null && d.documentId === id)
  if (head) {
    return {
      targetId: id,
      kind: 'document',
      title: typeof head.title === 'string' && head.title !== '' ? head.title : id,
      lines: splitLines(node?.content).slice(0, HOVER_PREVIEW_FIRST_LINES),
    }
  }
  if (node) {
    return { targetId: id, kind: 'section', title: node.id, lines: splitLines(node.content) }
  }
  return { targetId: id, kind: 'empty', title: '', lines: [] }
}

/** Author the popup subtree from a resolved preview. `null` for an empty
 *  preview (a dangling target authors NO popup — F1). The popup carries its
 *  own enter/leave pair (hovering into it cancels the dismissal) + the
 *  `is-clickable` handler-node affordance token. PURE. */
export function hoverPreviewPopup(
  preview: HoverPreviewContent | null | undefined,
  opts?: { position?: 'above' | 'below' },
): LegacyNodeData | null {
  if (preview == null || preview.kind === 'empty') return null
  const position = opts?.position === 'below' ? 'below' : 'above'
  return {
    type: 'div',
    props: {
      id: HOVER_PREVIEW_ID,
      'data-target': preview.targetId,
      'data-kind': preview.kind,
      'data-position': position,
      'data-role': 'hover-preview',
    },
    css: { classes: clickableClasses() },
    handlers: [
      { name: HOVER_PREVIEW_POPUP_ENTER_HANDLER, event: 'mouseover', body: HOVER_PREVIEW_POPUP_ENTER_BODY },
      { name: HOVER_PREVIEW_POPUP_LEAVE_HANDLER, event: 'mouseout', body: HOVER_PREVIEW_POPUP_LEAVE_BODY },
    ],
    children: [
      ...(preview.title !== '' ? [{ type: 'strong', content: preview.title }] : []),
      ...preview.lines.map((line) => ({ type: 'p', content: line })),
    ],
  }
}

/** The viewport-overflow fallback (F3, shell best-effort): place the popup
 *  ABOVE the link unless the room above is smaller than the popup, in which
 *  case flip BELOW. PURE + TOTAL (junk coerces to `above`). */
export function computeHoverPreviewPosition(
  link: { top: number; height: number } | null | undefined,
  _viewport: { width: number; height: number } | null | undefined,
  popupHeight = 120,
): 'above' | 'below' {
  const top = link != null && Number.isFinite(link.top) ? link.top : 0
  const height = Number.isFinite(popupHeight) ? popupHeight : 0
  return top < height ? 'below' : 'above'
}

// ===========================================================================
// The shell timing helper (W1-Q10) — a pure controller with injectable timers.
// The timer is SHELL (un-journaled); the content is provident.
// ===========================================================================

export interface HoverPreviewTimerApi {
  setTimeout(cb: () => void, ms: number): unknown
  clearTimeout(handle: unknown): void
}

const REAL_TIMERS: HoverPreviewTimerApi = {
  setTimeout: (cb, ms) => setTimeout(cb, ms) as unknown,
  clearTimeout: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
}

export interface HoverPreviewControllerOptions {
  delayMs?: number
  timers?: HoverPreviewTimerApi
  /** Notified with the active target id on every visibility change (null when
   *  dismissed). The host uses this to re-render the app graph. */
  onChange?: (activeId: string | null) => void
}

/** The shell dismissal controller: `enter(id)` shows/relocates the popup (one
 *  at a time — F2); `leave()`/`leavePopup()` schedule the 0.5 s dismissal;
 *  `enterPopup()` (or a re-`enter`) within the window cancels it. PURE — the
 *  timers are injectable for node tests. */
export class HoverPreviewController {
  readonly delayMs: number
  private readonly timers: HoverPreviewTimerApi
  private readonly onChange: ((activeId: string | null) => void) | null
  private active: string | null = null
  private pending: unknown = null

  constructor(opts: HoverPreviewControllerOptions = {}) {
    this.delayMs = typeof opts.delayMs === 'number' && opts.delayMs >= 0 ? opts.delayMs : HOVER_PREVIEW_DELAY_MS
    this.timers = opts.timers ?? REAL_TIMERS
    this.onChange = opts.onChange ?? null
  }

  get activeId(): string | null {
    return this.active
  }

  get hasPendingDismissal(): boolean {
    return this.pending != null
  }

  /** Show (or relocate to) the target. Cancels any pending dismissal; a rapid
   *  hover across links leaves exactly ONE active popup (F2). */
  enter(id: string): void {
    if (typeof id !== 'string' || id === '') return
    this.cancelPending()
    this.setActive(id)
  }

  /** Pointer entered the popup — cancel the dismissal within the window. */
  enterPopup(): void {
    this.cancelPending()
  }

  /** Pointer left the link — schedule the 0.5 s dismissal. */
  leave(): void {
    if (this.active == null) return
    this.scheduleDismiss()
  }

  /** Pointer left the popup — schedule the 0.5 s dismissal. */
  leavePopup(): void {
    if (this.active == null) return
    this.scheduleDismiss()
  }

  /** Clear the preview immediately (no timer). */
  cancel(): void {
    this.cancelPending()
    this.setActive(null)
  }

  /** Release the timer + clear the preview on teardown. */
  dispose(): void {
    this.cancelPending()
    this.active = null
    this.onChange?.(null)
  }

  private setActive(id: string | null): void {
    if (this.active === id) return
    this.active = id
    this.onChange?.(id)
  }

  private scheduleDismiss(): void {
    this.cancelPending()
    this.pending = this.timers.setTimeout(() => {
      this.pending = null
      this.setActive(null)
    }, this.delayMs)
  }

  private cancelPending(): void {
    if (this.pending != null) {
      this.timers.clearTimeout(this.pending)
      this.pending = null
    }
  }
}
