// A minimal DOM shim (the upstream adapters.test.ts pattern) sufficient for
// DomAdapter + our Runtime (which reads mount.innerHTML). We do NOT need real
// layout — only the element tree + attribute/text bookkeeping DomAdapter uses.
//
// ============================================================================
// U-SHELL-N7 adversarial additions (2026-09) — the DOM-level regression set
// (tests/unit-u-shell-shell-wiring-adversarial.test.ts) drives the shell
// pointer wiring (`installShellPointers` in src/renderer/renderer.ts) under
// node, so it gains the subset of the DOM surface that wiring reads:
//
//   ShimElement:
//     - `querySelectorAll(sel)` / `querySelector(sel)` — a DOCUMENTED CONCRETE
//       SUB-SET selector engine (section "CSS SUBSET" below). Supports:
//       comma-groups (`'a, b'`), descendant chains (`'.layout [data-zone]'`),
//       tag/class/attr-presence/attr-equals compounds (`'.gutter[data-zone]'`,
//       `'.pane-frame[data-pane-id]'`, `'[data-zone]', 'button,input,a,…'`).
//       NOT a general engine (no `:not`, combinators beyond space, `>`/`+`,
//       `*`, attribute-operators beyond `=`, pseudo-selectors). Anything outside
//       the subset returns `[]`/`null` — never throws.
//     - `closest(sel)` — walk this element + ancestors, first matching a
//       supported compound/selector; `null` when none (HOST-1 delegated
//       routing + HOST-3 interactive-control ancestor climb).
//     - `getBoundingClientRect()` — returns the element's configured `_rect`
//       (default all-zero) so the wiring's rect math is driven in tests. A test
//       sets geometry via `el.setRect({left,top,right,bottom})` (a live-rect
//       stand-in; HOST-4 re-render re-mounts just re-set the rects).
//     - `setPointerCapture(pid)` / `releasePointerCapture(pid)` — fail-soft
//       no-ops that RECORD the call (`captureCalls` / last `capturePointerId`),
//       so HOST-2 can assert capture is requested exactly once per gesture
//       (the real engine's capture behavior is NOT simulated — only the
//       registration is observed — see NOT-TESTABLE notes in the adversarial
//       test).
//     - `dispatchPointer(type, props)` — fires a synthetic pointer event:
//       builds `{ type, target, currentTarget, pointerId, clientX, clientY,
//       ...props }`, invokes the element's OWN stored listeners for `type`
//       (in registration order), then bubbles up `parent` ancestors then the
//       document's delegated listeners. This lets a test drive
//       pointerdown→pointermove→pointerup through listeners the wiring stored
//       on shim elements / the shim document.
//
//   document (fresh per `installShim()`):
//     - `readyState: 'loading'` — so importing src/renderer/renderer.ts (whose
//       bottom guard schedules `main()` only when readyState !== 'loading')
//       registers a never-fired DOMContentLoaded listener instead of booting the
//       whole app under node.
//     - `body` (a ShimElement mount root) — author shell chrome under it; the
//       document-level query methods scan `body`.
//     - `querySelector` / `querySelectorAll` (scan `body`), `addEventListener` /
//       `removeEventListener` (DELEGATED listeners — the HOST-1 fix attaches the
//       wiring here once).
//     - `dispatchPointer(type, target, props)` — the exported entry-point that
//       routes a synthetic pointer event to the target + bubbles to document.
//
// Marked NOT-TESTABLE at the test site (not simulated here):
//     - real pointer capture semantics / pointer-event coalescing (F5) — only
//       the `setPointerCapture(pointerId)` CALL is observable; an engine without
//       capture degrades the gesture but the wiring still routes through the
//       element's own listeners.
//     - `getBoundingClientRect` LAYOUT (the real CSS grid/track collapse) — only
//       the values a test configures via `setRect` are observed.
//     - event target resolution for a pointer on a nested child: the dispatch
//       helper uses the explicit `target` a test passes, mirroring the real
//       `e.target` of the deepest hit node.
// ============================================================================

export class ShimElement {
  tagName: string
  children: ShimElement[] = []
  attrs: Record<string, string> = {}
  dataset: Record<string, string> = {}
  style: { cssText: string } = { cssText: '' }
  listeners: Record<string, Array<(e: unknown) => void>> = {}
  textContent = ''
  className = ''
  id = ''
  value = ''
  parent: ShimElement | null = null
  removed = false

  /** U-SHELL-N7 — the configured rect for `getBoundingClientRect()` (default:
   *  all-zero). Tests set it via `setRect` to drive the wiring's rect math. */
  _rect: { left: number; top: number; right: number; bottom: number } = { left: 0, top: 0, right: 0, bottom: 0 }

  /** U-SHELL-N7 — records `setPointerCapture` calls (a fail-soft no-op). */
  captureCalls = 0
  capturePointerId: number | null = null
  releaseCalls = 0

  constructor(tag: string) {
    this.tagName = tag.toUpperCase()
  }

  /** Serialize this element's CHILDREN to an HTML string — the `mount.innerHTML`
   *  surface our Runtime exposes to MCP. Real-DOM semantics: `innerHTML` is the
   *  inner content only (children's own serialization, tags included), so an
   *  empty mount serializes to `''` — mirroring `HTMLElement.innerHTML`. */
  get innerHTML(): string {
    return (this.textContent ?? '') + this.children.map((c) => c.outerHTML).join('')
  }

  /** Serialize this element AND descendants (its open tag, attributes, inner
   *  HTML, close tag) — the `outerHTML` used by a parent's innerHTML. */
  get outerHTML(): string {
    const attrs: string[] = []
    for (const [k, v] of Object.entries(this.attrs)) attrs.push(`${k}="${v}"`)
    if (this.id) attrs.push(`id="${this.id}"`)
    if (this.className) attrs.push(`class="${this.className}"`)
    if (this.style.cssText) attrs.push(`style="${this.style.cssText}"`)
    const open = `<${this.tagName.toLowerCase()}${attrs.length ? ' ' + attrs.join(' ') : ''}>`
    const body = (this.textContent ?? '') + this.children.map((c) => c.outerHTML).join('')
    const voidTags = new Set(['input', 'br', 'img', 'hr', 'meta', 'link', 'source', 'track', 'wbr'])
    if (voidTags.has(this.tagName.toLowerCase())) return open
    return open + body + `</${this.tagName.toLowerCase()}>`
  }

  appendChild(c: ShimElement): ShimElement {
    const i = this.children.indexOf(c)
    if (i !== -1) this.children.splice(i, 1)
    this.children.push(c)
    c.parent = this
    return c
  }

  setAttribute(k: string, v: unknown): void {
    if (k === 'id') {
      // In a real DOM, the `id` attribute and `el.id` are the SAME slot —
      // the last write wins (props.id auto-mint writes first, css.id later).
      this.id = String(v)
      delete this.attrs['id']
      return
    }
    this.attrs[k] = String(v)
  }

  getAttribute(k: string): string | null {
    if (k === 'id') return this.id || null
    if (k === 'class') return this.className || null
    return this.attrs[k] ?? null
  }

  removeAttribute(k: string): void {
    if (k === 'id') {
      this.id = ''
      return
    }
    delete this.attrs[k]
  }

  addEventListener(evt: string, fn: (e: unknown) => void): void {
    ;(this.listeners[evt] ??= []).push(fn)
  }

  removeEventListener(evt: string, fn: (e: unknown) => void): void {
    const arr = this.listeners[evt]
    if (arr) {
      const i = arr.indexOf(fn)
      if (i !== -1) arr.splice(i, 1)
    }
  }

  remove(): void {
    if (this.parent) {
      const i = this.parent.children.indexOf(this)
      if (i !== -1) this.parent.children.splice(i, 1)
      this.parent = null
    }
    this.removed = true
  }

  // ==========================================================================
  // U-SHELL-N7 — the DOM surface the shell pointer wiring reads (documented
  // concrete CSS SUBSET only).
  // ==========================================================================

  /** Configure the rect `getBoundingClientRect()` returns (a live-rect
   *  stand-in — HOST-4 a re-render re-mount just re-sets these). */
  setRect(rect: { left?: number; top?: number; right?: number; bottom?: number } | null): this {
    this._rect = {
      left: typeof rect?.left === 'number' && Number.isFinite(rect.left) ? rect.left : 0,
      top: typeof rect?.top === 'number' && Number.isFinite(rect.top) ? rect.top : 0,
      right: typeof rect?.right === 'number' && Number.isFinite(rect.right) ? rect.right : 0,
      bottom: typeof rect?.bottom === 'number' && Number.isFinite(rect.bottom) ? rect.bottom : 0,
    }
    return this
  }

  getBoundingClientRect(): { left: number; top: number; right: number; bottom: number } {
    return { ...this._rect }
  }

  /** Fail-soft capture no-ops — recorded so a test can assert capture is
   *  requested per gesture (F5: a capture-less engine still degrades without
   *  throwing; only the CALL is observable here). */
  setPointerCapture(pointerId: number): void {
    this.captureCalls += 1
    this.capturePointerId = pointerId
  }

  releasePointerCapture(_pointerId: number): void {
    this.releaseCalls += 1
  }

  /** First match of `sel` in document order among this element's descendants
   *  (excludes self). `null` when none. CSS-SUBSET only. */
  querySelector(sel: string): ShimElement | null {
    return this.querySelectorAll(sel)[0] ?? null
  }

  /** Match `sel` amongst this element's descendants (excludes self) in document
   *  order. CSS-SUBSET only — unsupported selectors yield `[]` (never throw). */
  querySelectorAll(sel: string): ShimElement[] {
    if (!CSS_SUBSET.isSupported(sel)) return []
    const out: ShimElement[] = []
    this.walk((el) => {
      if (el === this) return
      if (CSS_SUBSET.matches(el, sel)) out.push(el)
    })
    return out
  }

  /** Walk `sel` up from THIS element (inclusive) and return the first matching
   *  ancestor (the element itself first), `null` when none. CSS-SUBSET only. */
  closest(sel: string): ShimElement | null {
    if (!CSS_SUBSET.isSupported(sel)) return null
    let node: ShimElement | null = this
    while (node) {
      if (CSS_SUBSET.matches(node, sel)) return node
      node = node.parent
    }
    return null
  }

  /** Fire a synthetic pointer event through THIS element's own stored
   *  listeners, then bubble to ancestors then to the document's delegated
   *  listeners. Returns the created event (for a caller wanting `target`). */
  dispatchPointer(type: string, props?: Record<string, unknown>): { type: string; target: ShimElement; currentTarget: ShimElement } & Record<string, unknown> {
    return shimDispatchPointer(type, this, props)
  }

  private walk(visit: (el: ShimElement) => void): void {
    visit(this)
    for (const c of this.children) c.walk(visit)
  }
}

// ============================================================================
// CSS-SUBSET — the documented concrete selector engine. Supports:
//   - comma-separated groups:            'a, b'            (any-group match)
//   - descendant chain (space):          '.layout [data-zone]'
//   - compound terms (order-insensitive):
//       tag          'div'
//       .class       '.gutter'
//       [attr]       '[data-zone]'
//       [attr='v']   "[data-zone='left']"  (single or double quotes)
//   - tag + class + attr combinations:   '.gutter[data-zone][data-axis]'
//
// NOT supported (returns non-match / [] / null, never throws):
//   '>' / '+' combinators, ':pseudo', ':has', '~', '*', '#'-id, attribute
//   operators other than `=`, regex. Document it — do not extend the subset
//   without a concrete wiring need.
// ============================================================================
interface Compound {
  tag: string | null
  classes: string[]
  attrs: Array<[string, string | null]>
}

function isSupportedSelector(sel: string): boolean {
  if (typeof sel !== 'string' || sel.trim() === '') return false
  // reject obviously-unsupported tokens anywhere in the selector
  if (/[>*~+#]/.test(sel)) return false
  if (/:[\w-]+/.test(sel)) return false
  // each attribute uses the `=`-equals operator (`[name]` bare or `[name='v']`).
  // Any OTHER operator (`~=`, `|=`, `^=`, `$=`, `*=`) is a non-match (never a
  // throw) — the char immediately before an `=` must be the attr-name, not an op.
  for (const m of sel.match(/\[[^\]]*\]/g) ?? []) {
    const inner = m.slice(1, -1).trim()
    const eq = inner.indexOf('=')
    if (eq === -1) continue // bare `[name]`
    const pre = inner.slice(0, eq).trim()
    const lastChar = pre[pre.length - 1]
    if (lastChar && '~|^$*'.includes(lastChar)) return false // unsupported op
    if (!pre) return false // `[=v]` malformed
    const val = inner.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
    if (val === '') return false
  }
  return true
}

function parseCompound(term: string): Compound {
  const compound: Compound = { tag: null, classes: [], attrs: [] }
  let idx = 0
  while (idx < term.length) {
    const ch = term[idx]
    if (ch === '.') {
      let j = idx + 1
      while (j < term.length && term[j] !== '.' && term[j] !== '[') j++
      const cls = term.slice(idx + 1, j)
      if (cls) compound.classes.push(cls)
      idx = j
    } else if (ch === '[') {
      const end = term.indexOf(']', idx)
      const inner = term.slice(idx + 1, end < 0 ? term.length : end).trim()
      const eq = inner.indexOf('=')
      if (eq === -1) {
        compound.attrs.push([inner, null])
      } else {
        const name = inner.slice(0, eq).trim()
        const val = inner.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '')
        compound.attrs.push([name, val])
      }
      idx = end < 0 ? term.length : end + 1
    } else {
      let j = idx
      while (j < term.length && term[j] !== '.' && term[j] !== '[') j++
      const tag = term.slice(idx, j).toLowerCase()
      if (tag && tag !== '*') compound.tag = tag
      idx = j
    }
  }
  return compound
}

function attrOf(el: ShimElement, name: string): string | null {
  if (name === 'id') return el.id || null
  if (name === 'class') return el.className || null
  return el.getAttribute(name)
}

function matchesCompound(el: ShimElement, comp: Compound): boolean {
  if (comp.tag && el.tagName.toLowerCase() !== comp.tag) return false
  for (const cls of comp.classes) {
    if (!el.className.split(/\s+/).includes(cls)) return false
  }
  for (const [name, want] of comp.attrs) {
    const got = attrOf(el, name)
    if (want === null) {
      if (got == null) return false
    } else if (got !== want) {
      return false
    }
  }
  return true
}

/** Match `sel` against one element. Supports comma-groups + descendant chains. */
function matchesSel(el: ShimElement, sel: string): boolean {
  if (!isSupportedSelector(sel)) return false
  for (const group of sel.split(',')) {
    const trim = group.trim()
    if (!trim) continue
    const terms = trim.split(/\s+/).filter(Boolean)
    if (terms.length === 0) continue
    if (!matchesCompound(el, parseCompound(terms[terms.length - 1]))) continue
    // verify the ancestor chain
    let ok = true
    let cur: ShimElement | null = el.parent
    for (let ti = terms.length - 2; ti >= 0; ti--) {
      while (cur && !matchesCompound(cur, parseCompound(terms[ti]))) cur = cur.parent
      if (cur == null) {
        ok = false
        break
      }
      cur = cur.parent
    }
    if (ok) return true
  }
  return false
}

const CSS_SUBSET = {
  isSupported: isSupportedSelector,
  matches: matchesSel,
}

// ============================================================================
// The synthetic pointer dispatch — drives pointerdown→move→up through stored
// listeners (target's own, then ancestors, then the document's delegated set).
// ============================================================================
function fireListeners(elem: { listeners?: Record<string, Array<(e: unknown) => void>> } | null, type: string, event: unknown): void {
  if (!elem) return
  const arr = elem.listeners?.[type]
  if (!arr) return
  for (const fn of [...arr]) {
    try {
      fn(event)
    } catch {
      // a throwing listener must never break a gesture stream (F5 fail-soft)
    }
  }
}

export function shimDispatchPointer(
  type: string,
  target: ShimElement,
  props?: Record<string, unknown>,
): { type: string; target: ShimElement; currentTarget: ShimElement } & Record<string, unknown> {
  const event = {
    type,
    target,
    currentTarget: target,
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    ...props,
  }
  // target's OWN listeners (the pre-HOST-1 direct-attachment shape, if any)
  fireListeners(target, type, event)
  // bubble up ancestors (the post-HOST-1 delegated routing shape)
  let node = target.parent
  while (node) {
    fireListeners(node, type, event)
    node = node.parent
  }
  // the document's delegated listeners (the HOST-1 fix attaches HERE once)
  const doc = (globalThis as Record<string, unknown>).document as { listeners?: Record<string, Array<(e: unknown) => void>> } | undefined
  fireListeners(doc ?? null, type, event)
  return event
}

const byId = new Map<string, ShimElement>()

function buildDocument(): {
  createElement(tag: string): ShimElement
  getElementById(id: string): ShimElement
  head: { appendChild(): void; children: ShimElement[] }
  body: ShimElement
  readyState: string
  querySelector(sel: string): ShimElement | null
  querySelectorAll(sel: string): ShimElement[]
  addEventListener(evt: string, fn: (e: unknown) => void): void
  removeEventListener(evt: string, fn: (e: unknown) => void): void
  listeners: Record<string, Array<(e: unknown) => void>>
  dispatchPointer(type: string, target: ShimElement, props?: Record<string, unknown>): unknown
} {
  const listeners: Record<string, Array<(e: unknown) => void>> = {}
  const body = new ShimElement('body')
  return {
    createElement: (tag: string) => new ShimElement(tag),
    getElementById: (id: string): ShimElement => {
      if (!byId.has(id)) byId.set(id, new ShimElement('div'))
      return byId.get(id)!
    },
    head: { appendChild: () => undefined, children: [] as ShimElement[] },
    body,
    readyState: 'loading',
    querySelector: (sel: string): ShimElement | null => body.querySelector(sel) ?? null,
    querySelectorAll: (sel: string): ShimElement[] => body.querySelectorAll(sel),
    addEventListener: (evt: string, fn: (e: unknown) => void) => {
      ;(listeners[evt] ??= []).push(fn)
    },
    removeEventListener: (evt: string, fn: (e: unknown) => void) => {
      const arr = listeners[evt]
      if (arr) {
        const i = arr.indexOf(fn)
        if (i !== -1) arr.splice(i, 1)
      }
    },
    listeners,
    dispatchPointer: (type: string, target: ShimElement, props?: Record<string, unknown>): unknown =>
      shimDispatchPointer(type, target, props),
  }
}

export const shimDocument = buildDocument()

export function installShim(): void {
  byId.clear()
  const doc = buildDocument()
  ;(globalThis as Record<string, unknown>).document = doc
  Object.assign(shimDocument, doc)
  // keep the exported singleton in sync so callers using `shimDocument` directly
  // see the SAME fresh tree as `globalThis.document`.
  ;(shimDocument as unknown as { body: ShimElement }).body = doc.body
  ;(shimDocument as unknown as { listeners: Record<string, Array<(e: unknown) => void>> }).listeners = doc.listeners
  ;(shimDocument as unknown as { querySelector: (s: string) => ShimElement | null }).querySelector = doc.querySelector
  ;(shimDocument as unknown as { querySelectorAll: (s: string) => ShimElement[] }).querySelectorAll = doc.querySelectorAll
  ;(shimDocument as unknown as { addEventListener: (e: string, f: (x: unknown) => void) => void }).addEventListener = doc.addEventListener
  ;(shimDocument as unknown as { removeEventListener: (e: string, f: (x: unknown) => void) => void }).removeEventListener = doc.removeEventListener
  ;(shimDocument as unknown as { dispatchPointer: (t: string, tg: ShimElement, p?: Record<string, unknown>) => unknown }).dispatchPointer = doc.dispatchPointer
  ;(shimDocument as unknown as { readyState: string }).readyState = 'loading'
}

export function mountEl(): ShimElement {
  return new ShimElement('div')
}
