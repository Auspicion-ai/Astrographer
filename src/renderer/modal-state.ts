// src/renderer/modal-state.ts — Unit U-SHELL-7 (C3): the settings-modal shell.
//
// Two halves, both node-testable via the dom-shim:
//
//   §2.1  `createModalController` — a PURE, TOTAL state machine for the modal
//         open/close/toggle flag. NO DOM dependency; all DOM application is the
//         wiring's job.
//   §2.6  `installSettingsModal` — the shell wiring: resolve the frame / toggle
//         / scrim / body, build the controller (hidden by default), wire the
//         toggle (click → toggle), Escape (keydown → close) and the dedicated
//         scrim (click → close) affordances to it, re-parent the two EXISTING
//         operator mounts (`#panes` + `#operator-panes`) into `#settings-modal-body`,
//         and mirror `isOpen()` onto the frame's class tokens (is-open XOR
//         is-closed). FAIL-SOFT + per-document idempotent (mirrors
//         `installShellPointers`).
//
// The module reads `querySelector`/`getElementById`/`addEventListener`/
// `appendChild`/`className` in a dom-shim-compatible way and never touches the
// mounts' isolated graphs (re-mount only).

// ---------------------------------------------------------------------------
// §2.1 — the pure ModalController (TOTAL over malformed options, fail-soft).
// ---------------------------------------------------------------------------

export interface ModalControllerOptions {
  initialOpen?: boolean // default false
  onOpen?: () => void // fired on a close→open transition
  onClose?: () => void // fired on an open→close transition
  onToggle?: () => void // fired on EVERY successful toggle (a flip)
}

export interface ModalController {
  open(): void
  close(): void
  toggle(): void
  isOpen(): boolean
}

/** Build a pure modal open/close/toggle state machine. TOTAL over malformed
 *  options: a non-boolean `initialOpen` coerces to `false`, non-function
 *  callbacks are no-ops, a throwing callback never propagates. */
export function createModalController(options?: ModalControllerOptions): ModalController {
  // Guard against null / non-object options (TOTAL — never throws).
  const valid = options != null && typeof options === 'object'
  const initialOpen = valid && options.initialOpen === true
  const onOpen: (() => void) | null = valid && typeof options.onOpen === 'function' ? options.onOpen : null
  const onClose: (() => void) | null = valid && typeof options.onClose === 'function' ? options.onClose : null
  const onToggle: (() => void) | null = valid && typeof options.onToggle === 'function' ? options.onToggle : null

  let open = initialOpen

  const safe = (fn: (() => void) | null): void => {
    try {
      fn?.()
    } catch {
      // fail-soft — a throwing callback must not propagate (the transition
      // still completes; the controller never throws).
    }
  }

  return {
    isOpen(): boolean {
      return open
    },
    open(): void {
      if (open) return // idempotent no-op when already open
      open = true
      safe(onOpen) // onOpen then (nothing else — open() never fires onToggle)
    },
    close(): void {
      if (!open) return // idempotent no-op when already closed
      open = false
      safe(onClose)
    },
    toggle(): void {
      // toggle() always flips (never a no-op); fires the relevant onOpen/onClose
      // THEN onToggle, synchronously, in that order.
      if (open) {
        open = false
        safe(onClose)
      } else {
        open = true
        safe(onOpen)
      }
      safe(onToggle)
    },
  }
}

// ---------------------------------------------------------------------------
// §2.6 — the shell wiring. FAIL-SOFT + per-document idempotent.
// ---------------------------------------------------------------------------

/** ADV4-idiom — the document instance `installSettingsModal` is currently wired
 *  onto. Tied to the DOCUMENT so each fresh document/shims install still
 *  registers exactly once, while a redundant second call on the SAME document
 *  is a no-op (no duplicate listeners, no re-parent). */
let settingsModalWiredDoc: unknown = null

/** Wire the settings modal shell chrome to a pure ModalController. Resolves
 *  `#settings-modal` (frame), `#settings-toggle` (toggle), `#settings-modal-scrim`
 *  (dedicated scrim) and `#settings-modal-body` (body); builds a controller with
 *  `{ initialOpen: false }`; registers exactly one toggle click listener →
 *  `controller.toggle()`, one document `keydown` routing `e.key === 'Escape'` →
 *  `controller.close()`, and one DIRECT scrim click listener →
 *  `controller.close()` (a content click on `#settings-modal-body` never closes);
 *  re-parents the existing `#panes` + `#operator-panes` mounts into the modal
 *  body; and mirrors `controller.isOpen()` onto the frame's class tokens
 *  (`is-open` XOR `is-closed`) after each transition (and once at install, so
 *  the modal is hidden by default via `#settings-modal.is-closed { display:none }`).
 *
 * `host`/`panels` are accepted for signature shape only; the mounts resolve by
 *  literal id (`#panes`, `#operator-panes`) and are re-parented only when they
 *  exist. FAIL-SOFT everywhere: absent elements/DOM/host → no-op, never throws,
 *  never breaks boot. */
export function installSettingsModal(host?: unknown, panels?: unknown, mounts?: unknown): void {
  try {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return
    const currentDoc = document as unknown
    // ADV4 — idempotent: a SECOND call on the SAME document is a no-op (the
    // affordance listeners + re-parent register exactly once).
    if (settingsModalWiredDoc === currentDoc) return
    const frame = document.getElementById('settings-modal')
    const toggle = document.getElementById('settings-toggle')
    const scrim = document.getElementById('settings-modal-scrim')
    const body = document.getElementById('settings-modal-body')
    // Fail-soft — absent frame/shell chrome → no-op (F11-style).
    if (frame == null || toggle == null || scrim == null || body == null) return

    // §2.1 — the controller, hidden by default (C3 "settings hidden").
    const controller = createModalController({ initialOpen: false })

    // §2.3 — the class mirror. The wiring reads isOpen() (the SINGLE source of
    // truth) after each controller call and applies the XOR class set. The
    // callbacks are pure notifications — the class write is NOT inside them.
    // ADV3 — `apply` PRESERVES any non-`is-*` classes on the frame (it only
    // swaps the `is-open`/`is-closed` XOR pair); it never wipes a sibling class.
    // ADV2 — `apply` runs ONLY when the open/close state actually CHANGED (an
    // idempotent Escape/scrim no-op performs NO class write — §2.4 F3/F4).
    const apply = (): void => {
      const keep = frame.className.split(/\s+/).filter((c) => c && c !== 'is-open' && c !== 'is-closed')
      keep.push(controller.isOpen() ? 'is-open' : 'is-closed')
      frame.className = keep.join(' ')
    }
    apply() // initial hidden state applied once at install

    // A transition helper: run a controller call and apply the class mirror
    // ONLY if `isOpen()` actually changed (idempotent no-ops → no class write).
    const settle = (act: () => void): void => {
      const before = controller.isOpen()
      try {
        act()
      } catch {
        // fail-soft — a throwing controller never breaks an affordance
      }
      if (controller.isOpen() !== before) apply()
    }

    // EXACTLY ONE toggle click listener → controller.toggle() (§2.4). toggle()
    // always flips, so the mirror always applies.
    toggle.addEventListener('click', () => {
      settle(() => controller.toggle())
    })

    // EXACTLY ONE document keydown routing Escape → controller.close() (§2.4).
    document.addEventListener('keydown', (e) => {
      if ((e as { key?: string }).key === 'Escape') {
        settle(() => controller.close())
      }
      // a non-Escape key is ignored (no close, no throw — §4 F8)
    })

    // EXACTLY ONE DIRECT scrim click listener → controller.close() (§2.4). The
    // scrim zone is the dedicated `#settings-modal-scrim` child ONLY — a content
    // click on `#settings-modal-body` never reaches it (§4 F12).
    scrim.addEventListener('click', () => {
      settle(() => controller.close())
    })

    // §2.5 — re-parent the two EXISTING operator-only mounts into the modal
    // body (re-mount only, never re-built). Modal children are exactly these;
    // `#app` / app-graph panes never enter the modal (§4 F9 HARD INVARIANT).
    const panes = document.getElementById('panes')
    const opPanes = document.getElementById('operator-panes')
    if (panes != null && typeof body.appendChild === 'function') body.appendChild(panes)
    if (opPanes != null && typeof body.appendChild === 'function') body.appendChild(opPanes)

    settingsModalWiredDoc = currentDoc // wired exactly once on THIS document
  } catch {
    // F11/F6 — never break boot on any DOM/wiring failure
  }
}
