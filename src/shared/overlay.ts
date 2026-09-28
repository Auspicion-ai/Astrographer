export type OverlayState = 'closed' | 'open' | 'held' | 'closing'

export interface OverlayTransition {
  readonly state: OverlayState
  readonly changed: boolean
}

export interface OverlayInertWrite {
  readonly name: string | null
  readonly value: 'true' | false
  readonly removal: boolean
  readonly target: unknown
}

const CLOSED: OverlayState = 'closed'
const OPEN: OverlayState = 'open'
const HELD: OverlayState = 'held'
const CLOSING: OverlayState = 'closing'
const VERB_OPEN = 'open'
const VERB_CLOSE = 'close'
const VERB_TOGGLE = 'toggle'
const VERB_ESCAPE = 'escape'
const SET_VALUE = 'true'

function isStateBody(value: unknown): value is OverlayState {
  return value === CLOSED || value === OPEN || value === HELD || value === CLOSING
}

function nextStateOf(state: OverlayState, verb: unknown): OverlayState {
  if (verb === VERB_OPEN) return state === HELD ? HELD : OPEN
  if (verb === VERB_CLOSE) return CLOSED
  if (verb === VERB_TOGGLE) {
    if (state === CLOSED || state === CLOSING) return OPEN
    if (state === OPEN) return CLOSED
    return state
  }
  if (verb === VERB_ESCAPE) return CLOSED
  return state
}

export function overlayTransition(state: unknown, verb: unknown, callback?: unknown): OverlayTransition {
  const previous = isStateBody(state) ? state : CLOSED
  const next = isStateBody(state) ? nextStateOf(previous, verb) : previous
  if (verb === VERB_ESCAPE) {
    try {
      ;(callback as () => void)()
    } catch {
      /* the callback's own degenerate shape is ABSORBED: nothing escapes this call */
    }
  }
  return { state: next, changed: next !== previous }
}

function echoName(attributeName: unknown): string | null {
  return typeof attributeName === 'string' && attributeName !== '' ? attributeName : null
}

export function overlayInertDeclaration(target: unknown, attributeName: unknown, inert: unknown): OverlayInertWrite {
  const name = echoName(attributeName)
  if (inert === true) return { name, value: SET_VALUE, removal: false, target }
  return { name, value: false, removal: true, target }
}
