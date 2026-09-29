// src/renderer/modal-state.ts — Unit PD-UI-6 (wave W1 of the post-division rebuild): the
// settings-modal shell, with its state/verb discipline RE-EXPRESSED over the ADOPTED
// overlay state machine.
//
// Two halves, both node-testable via the dom-shim:
//
//   §2.1  `createModalController` — the pure, TOTAL ModalController. Its state/verb
//         discipline is SUPERSEDED by the vendored `overlayTransition`
//         (`src/shared/overlay.ts`, digest-pinned and WRAPPED, never edited): the
//         controller HOLDS the adopted four-member state word, hands in the body it holds
//         as the call's first argument, replaces its word with the returned `state`, and
//         gates its notifications on the record's own `changed` member.
//   §2.6  `installSettingsModal` — the KEPT shell wiring: resolve the frame / toggle /
//         scrim / body by literal id, build the controller (hidden by default), wire the
//         toggle (click → toggle), the document keydown (the LITERAL `e.key === 'Escape'`
//         comparison → the close route) and the dedicated scrim (click → the close route),
//         re-parent the two EXISTING operator mounts (`#panes` + `#operator-panes`) into
//         `#settings-modal-body`, and mirror the controller's state onto the frame's class
//         tokens (is-open XOR is-closed) exactly when the adopted record reports a move.
//         FAIL-SOFT + per-document idempotent (mirrors `installShellPointers`).
//
// The module reads `getElementById`/`addEventListener`/`appendChild`/`className` in a
// dom-shim-compatible way and never touches the mounts' isolated graphs (re-mount only).
//
// The ONE import below is the adoption's consumer edge (§2.1's import census: EXACTLY one
// statement, resolving to `src/shared/overlay.ts`; declared per row in
// `tests/pd-vendor-set.test.ts`'s `DECLARED_CONSUMER_EDGES`).
import { overlayTransition } from '../shared/overlay.js'

/** The ADOPTED state word's four declared bodies (§2.3 item 1). The adapter HOLDS this
 *  word; two of its four bodies are simply not reachable from the fork's own verbs
 *  (§2.3 item 5) — they are adopted VOCABULARY, never emulated and never fabricated. */
type AdoptedStateWord = 'closed' | 'open' | 'held' | 'closing'

/** §2.1 / D-8 — the adapter's OWN verb vocabulary: the four MOVING bodies of the adopted
 *  five-body alphabet. `'unknown'` is deliberately NOT a member: it is the mechanism's
 *  declared NO-MOVE body and a normalization TARGET, never a verb the adapter may choose. */
export type ModalVerb = 'open' | 'close' | 'toggle' | 'escape'

export interface ModalControllerOptions {
  initialOpen?: boolean // default false
  onOpen?: () => void // fired on a close→open transition
  onClose?: () => void // fired on an open→close transition
  onToggle?: () => void // fired on EVERY successful toggle (a flip)
  callback?: unknown // §2.5 clause 3 — handed straight to the adopted mechanism's third
  //                      argument; the wiring supplies none, so the mechanism's own
  //                      declared absent/non-callable arm is what runs on landed routes
}

export interface ModalController {
  open(): void
  close(): void
  toggle(): void
  isOpen(): boolean
}

/** Build a pure modal state machine over the ADOPTED mechanism. TOTAL over malformed
 *  options: a non-boolean `initialOpen` coerces to `false`, non-function notifications are
 *  no-ops, a throwing notification never propagates, and no input shape throws. */
export function createModalController(options?: ModalControllerOptions): ModalController {
  // Guard against null / non-object options (TOTAL — never throws).
  const valid = options != null && typeof options === 'object'
  const initialOpen = valid && options.initialOpen === true
  const onOpen: (() => void) | null = valid && typeof options.onOpen === 'function' ? options.onOpen : null
  const onClose: (() => void) | null = valid && typeof options.onClose === 'function' ? options.onClose : null
  const onToggle: (() => void) | null = valid && typeof options.onToggle === 'function' ? options.onToggle : null
  const callback: unknown = valid ? options.callback : undefined

  // §2.3 item 1 — the adapter's state IS the adopted four-member word, initialized from the
  // normalized `initialOpen` (`true` ⇒ `'open'`, anything else ⇒ `'closed'`). It is never a
  // bare boolean, and every later body it holds came out of a returned record.
  let word: AdoptedStateWord = initialOpen ? 'open' : 'closed'

  const safe = (fn: (() => void) | null): void => {
    try {
      fn?.()
    } catch {
      // fail-soft — a throwing notification must not propagate (the transition still
      // completes; the controller never throws).
    }
  }

  /** §2.4 clauses 1–3 — THE ONE adopted call: hand in the body the adapter HOLDS, replace
   *  the held word with the returned `state`, and answer with the record's OWN `changed`
   *  member, read BY VALUE — never recomputed from `isOpen()`, never inferred from the
   *  verb's identity, and never taken from a pre-call snapshot comparison. */
  const step = (verb: ModalVerb): boolean => {
    const record = overlayTransition(word, verb, callback)
    word = record.state
    return record.changed
  }

  return {
    isOpen(): boolean {
      // §2.3 item 4 — a READ, no call: `'open'` ⇒ true, every other body ⇒ false.
      return word === 'open'
    },
    open(): void {
      // §2.3 item 4 — `open()` binds `'open'`; the notification fires ONLY when the adopted
      // record reports a real move (an idempotent no-op fires nothing).
      if (step('open')) safe(onOpen)
    },
    close(): void {
      // §2.5 clause 1 — the close route binds `'escape'` (BOTH close routes: the Escape
      // affordance and the scrim click). `'close'` is a legal mechanism body the fork
      // simply does not emit, so the callback obligation of the `'escape'` column is met.
      if (step('escape')) safe(onClose)
    },
    toggle(): void {
      // §3.2 item 10 — `toggle()` always moves from both reachable bodies; the direction's
      // notification fires first (when the record reports the move), then `onToggle`.
      const moved = step('toggle')
      if (moved) safe(word === 'open' ? onOpen : onClose)
      safe(onToggle)
    },
  }
}

// ---------------------------------------------------------------------------
// §2.6 — the shell wiring. FAIL-SOFT + per-document idempotent.
// ---------------------------------------------------------------------------

/** ADV4-idiom — the document instance `installSettingsModal` is currently wired onto.
 *  Tied to the DOCUMENT so each fresh document/shim install still registers exactly once,
 *  while a redundant second call on the SAME document is a no-op (no duplicate listeners,
 *  no re-parent). */
let settingsModalWiredDoc: unknown = null

/** Wire the settings modal shell chrome to a pure ModalController. Resolves
 *  `#settings-modal` (frame), `#settings-toggle` (toggle), `#settings-modal-scrim`
 *  (dedicated scrim) and `#settings-modal-body` (body); builds the controller with
 *  `initialOpen: false` (hidden by default); registers exactly one toggle click listener →
 *  `controller.toggle()`, one document `keydown` routing the literal `e.key === 'Escape'`
 *  → the close route, and one DIRECT scrim click listener → the close route (a content
 *  click on `#settings-modal-body` never closes); re-parents the existing `#panes` +
 *  `#operator-panes` mounts into the modal body; and mirrors the controller's state onto
 *  the frame's class tokens (`is-open` XOR `is-closed`) after each transition the adopted
 *  record reports as a real move (and once at install, so the modal is hidden by default
 *  via `#settings-modal.is-closed { display:none }`).
 *
 *  §2.6 — the three parameters are DROPPED from the pinned surface: the mounts resolve by
 *  literal id (`#panes`, `#operator-panes`) and are re-parented only when they exist.
 *  FAIL-SOFT everywhere: absent elements/DOM → no-op, never throws, never breaks boot. */
export function installSettingsModal(): void {
  try {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return
    const currentDoc = document as unknown
    // ADV4 — idempotent: a SECOND call on the SAME document is a no-op (the affordance
    // listeners + re-parent register exactly once).
    if (settingsModalWiredDoc === currentDoc) return
    const frame = document.getElementById('settings-modal')
    const toggle = document.getElementById('settings-toggle')
    const scrim = document.getElementById('settings-modal-scrim')
    const body = document.getElementById('settings-modal-body')
    // Fail-soft — absent frame/shell chrome → no-op (§3.4 item 2).
    if (frame == null || toggle == null || scrim == null || body == null) return

    // §2.4 clause 3 — THE MIRROR'S GUARD IS THE ADOPTED RECORD'S OWN `changed` MEMBER. The
    // controller's move-gated notifications route it out of the adopted call: `onOpen` and
    // `onClose` fire IF AND ONLY IF the record reported `changed === true` (§2.3 item 4), so
    // the ONE class-write path below runs exactly when the adopted observable says the state
    // really moved. The superseded guard (an `isOpen()` snapshot compared before and after
    // the call) is NOT used: it is `§2.4`'s named control, and `changed` is never recomputed
    // from `isOpen()`, never inferred from the verb's identity.
    let changed = false
    const adoptMove = (): void => {
      changed = true
    }

    // §2.2 item 5 — the controller, hidden by default (C3 "settings hidden").
    const controller = createModalController({ initialOpen: false, onOpen: adoptMove, onClose: adoptMove })

    // §2.3 — the class mirror. It reads the controller's state (the SINGLE source of truth)
    // and applies the XOR class set; ADV3 — `apply` PRESERVES any non-`is-*` classes on the
    // frame (it only swaps the `is-open`/`is-closed` pair) and never wipes a sibling class.
    const apply = (): void => {
      const keep = frame.className.split(/\s+/).filter((c) => c && c !== 'is-open' && c !== 'is-closed')
      keep.push(controller.isOpen() ? 'is-open' : 'is-closed')
      frame.className = keep.join(' ')
    }
    apply() // initial hidden state applied once at install

    // A transition helper: run a controller route, then run the class mirror IF AND ONLY IF
    // the adopted record reported `changed` (an idempotent Escape/scrim no-op reports
    // `false`, so it performs NO class write — §2.4 clause 4 / §3.4 item 11).
    const settle = (act: () => void): void => {
      changed = false
      try {
        act()
      } catch {
        // fail-soft — a throwing route never breaks an affordance
      }
      if (changed) apply()
    }

    // EXACTLY ONE toggle click listener → controller.toggle() (§2.2 item 7). toggle()
    // always moves from both reachable bodies, so the mirror always applies.
    toggle.addEventListener('click', () => {
      settle(() => controller.toggle())
    })

    // EXACTLY ONE document keydown routing the LITERAL `e.key === 'Escape'` → the close
    // route (§2.2 item 8). The comparison stays IN THE WIRING: the mechanism owns no key.
    document.addEventListener('keydown', (e) => {
      if ((e as { key?: string }).key === 'Escape') {
        settle(() => controller.close())
      }
      // a non-Escape key is ignored (no close, no throw — §3.4 item 9)
    })

    // EXACTLY ONE DIRECT scrim click listener → the close route (§2.2 item 9). The scrim
    // zone is the dedicated `#settings-modal-scrim` child ONLY — a content click on
    // `#settings-modal-body` never reaches it (§3.4 item 10).
    scrim.addEventListener('click', () => {
      settle(() => controller.close())
    })

    // §2.7 — re-parent the two EXISTING operator-only mounts into the modal body
    // (re-mount only, never re-built). The modal's children are exactly these; `#app` /
    // the app-graph pane frames / `#tab-strip` never enter the modal (§2.7 item 4).
    const panes = document.getElementById('panes')
    const opPanes = document.getElementById('operator-panes')
    if (panes != null && typeof body.appendChild === 'function') body.appendChild(panes)
    if (opPanes != null && typeof body.appendChild === 'function') body.appendChild(opPanes)

    settingsModalWiredDoc = currentDoc // wired exactly once on THIS document
  } catch {
    // never break boot on any DOM/wiring failure (§3.4 items 7/14)
  }
}
