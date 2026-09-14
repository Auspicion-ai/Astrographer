// tests/unit-u-shell-7-settings-modal.test.ts — Unit U-SHELL-7 (C3): the
// settings modal shell. TestWriter RED set written from
// docs/specs/unit-u-shell-7-settings-modal.md. Two halves are MANDATORY:
//
//   (a) the PURE node-testable ModalController (§2.1/§3a/§5.7) — the NEW module
//       src/renderer/modal-state.ts `createModalController`; and
//   (b) the WIRING + source-pin (§2.3/§2.6/§2.8/§3b/§4) — `installSettingsModal`
//       driven LIVE under the dom-shim + the static §2.8 source-pin.
//
// RED inventory (expected):
//   - PRIMARY RED (suite/method-does-not-exist): src/renderer/modal-state.ts does
//     NOT exist yet, so `import('../src/renderer/modal-state.js')` rejects and
//     every §3a/§5.7/§3b test fails with "…not implemented (U-SHELL-7 RED)".
//   - §2.8 source-pin: modal-state.ts is absent (empty source) AND renderer.ts
//     has no `installSettingsModal(` caller → every registration/mirror/call
//     assertion is RED.
//   - GREEN-on-arrival: none expected — the whole surface is NEW.
//
// Deterministic PBT seed 0x55E11E77 (the "SHELL" family), ≤40 attempts/row,
// 6 rows × 40 = 240 ≤ 400 total, stop-after-5, mulberry32.
//
// Constraints honoured: ONE test file only; `src/` is NEVER touched; the
// sibling pure+source-pin / adversarial shell-wiring files are untouched.
// Vitest default `describe`/`it`/`expect`.
import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { installShim, shimDocument, ShimElement } from '../src/shared/dom-shim.js'

// ===========================================================================
// §5.7 — the deterministic PBT harness (mulberry32, pinned seed, ≤100/row,
// ≤400 total, stop-after-5). 6 rows × 40 = 240 ≤ 400.
// ===========================================================================
const PBT_SEED = 0x55e11e77 // this unit's pinned seed (the "SHELL" family)
const PBT_ATTEMPTS = 40 // 6 × 40 = 240 ≤ 400 total
const PBT_STOP_AFTER = 5

function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}
function deepEq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}
function runProperty(
  rowId: string,
  strategyId: string,
  check: (i: number, rng: () => number) => string | null,
): { row: string; strategyId: string; held: boolean; counterexamples: string[]; attempts: number } {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  for (let i = 0; i < PBT_ATTEMPTS; i++) {
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  return { row: rowId, strategyId, held: counterexamples.length === 0, counterexamples, attempts: PBT_ATTEMPTS }
}

// ===========================================================================
// The modal-state surface — dynamic-module loader + requireExport so a MISSING
// module/member fails each spec test INDIVIDUALLY with a descriptive RED
// message instead of crashing the file (the unit-u-shell-shell-wiring
// `loadGutter`/`requireHelper` convention).
// ===========================================================================
interface ModalController {
  open(): void
  close(): void
  toggle(): void
  isOpen(): boolean
}
interface ModalControllerOptions {
  initialOpen?: unknown
  onOpen?: unknown
  onClose?: unknown
  onToggle?: unknown
}
interface ModalStateModule {
  createModalController?: (options?: unknown) => ModalController
  installSettingsModal?: (...args: unknown[]) => void
}

async function loadModalState(): Promise<ModalStateModule> {
  try {
    return (await import('../src/renderer/modal-state.js')) as unknown as ModalStateModule
  } catch (e) {
    throw new Error('src/renderer/modal-state.ts not implemented (U-SHELL-7 RED)', {
      cause: e,
    })
  }
}
function requireExport<T>(mod: ModalStateModule, name: 'createModalController' | 'installSettingsModal'): T {
  const fn = mod[name]
  if (typeof fn !== 'function') {
    throw new Error(
      `U-SHELL-7 RED [${name}]: the §2.1/§2.6 export "${name}" is not implemented on src/renderer/modal-state.ts`,
    )
  }
  return fn as unknown as T
}

/** A fresh controller with counting callbacks. Returns the controller + counters
 *  + an ordered callback log. */
function harness(initialOpen?: boolean) {
  const counts = { onOpen: 0, onClose: 0, onToggle: 0 }
  const log: string[] = []
  const cb = (name: keyof typeof counts) => (): void => {
    counts[name]++
    log.push(name)
  }
  const options = {
    initialOpen,
    onOpen: cb('onOpen'),
    onClose: cb('onClose'),
    onToggle: cb('onToggle'),
  }
  void options
  return { counts, log, callbacks: { onOpen: cb('onOpen'), onClose: cb('onClose'), onToggle: cb('onToggle') } }
}

// ===========================================================================
// §5.7 the PBT register (6 rows — deterministic mulberry32, pinned seed).
// ALL RED (the modal-state module does not exist yet).
// ===========================================================================
describe('U-SHELL-7 §5.7 the PBT register (deterministic mulberry32, pinned seed)', () => {
  it('P-IM-1 [strat:modal-options-total] `createModalController` is TOTAL over its option domain', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const rep = runProperty('P-IM-1', 'strat:modal-options-total', (_i, rng) => {
      const opt = pick(rng, [
        undefined,
        null,
        42,
        'x',
        {},
        { initialOpen: 'yes' },
        { initialOpen: 1 },
        { initialOpen: null },
        { initialOpen: {} },
        { initialOpen: true },
        { initialOpen: false },
        { onOpen: 42 },
        { onOpen: {}, onClose: null, onToggle: 'x' },
        { initialOpen: 'x', onOpen: () => {} },
      ])
      let c: ModalController
      try {
        c = create(opt)
      } catch (e) {
        return `createModalController threw on ${JSON.stringify(opt)}: ${(e as Error).message}`
      }
      if (typeof c.isOpen() !== 'boolean') return `isOpen() not a boolean for ${JSON.stringify(opt)}`
      const nonBoolInitial: unknown =
        opt != null && typeof opt === 'object' && 'initialOpen' in opt && (opt as { initialOpen: unknown }).initialOpen
      const initial = nonBoolInitial === true
      if (c.isOpen() !== initial) return `initial isOpen()=${c.isOpen()} expected ${initial} for ${JSON.stringify(opt)}`
      for (const m of ['open', 'close', 'toggle'] as const) {
        try {
          ;(c as unknown as Record<string, () => void>)[m]()
        } catch (e) {
          return `${m}() threw on ${JSON.stringify(opt)}: ${(e as Error).message}`
        }
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-SM-1 [strat:modal-state-flip] the open/close state is a 2-valued FLIP model, deterministic + idempotent', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const rep = runProperty('P-SM-1', 'strat:modal-state-flip', (_i, rng) => {
      const initialOpen = pick(rng, [false, true])
      const c = create({ initialOpen })
      let S = initialOpen
      const seq = Array.from({ length: int(rng, 0, 12) }, () => pick(rng, ['open', 'close'] as const))
      for (const op of seq) {
        if (op === 'open') S = true
        else S = false
        ;(c as unknown as Record<string, () => void>)[op]()
        if (c.isOpen() !== S) return `seq drift: op=${op} isOpen=${c.isOpen()} model=${S}`
      }
      // construction yields initialOpen === true else false
      if (c.isOpen() !== (initialOpen || seq.slice(-1)[0] === 'open') && S !== c.isOpen()) return 'model mismatch'
      // determinism — equal sequences yield equal traces
      const c2 = create({ initialOpen })
      const seq2 = [...seq]
      for (const op of seq2) (c2 as unknown as Record<string, () => void>)[op]()
      if (c.isOpen() !== c2.isOpen()) return 'equal sequences gave unequal isOpen'
      // idempotent open-on-open / close-on-closed
      const fresh = create()
      if (fresh.isOpen() !== false) return 'fresh controller must start closed'
      ;(fresh as ModalController).open()
      const open1 = fresh.isOpen()
      ;(fresh as ModalController).open()
      if (fresh.isOpen() !== open1) return 'open() on open changed isOpen'
      const freshC = create()
      ;(freshC as ModalController).close()
      const closed1 = freshC.isOpen()
      ;(freshC as ModalController).close()
      if (freshC.isOpen() !== closed1) return 'close() on closed changed isOpen'
      // open();close();open();trace equals open();open();close();open()
      const a = create()
      ;(a as ModalController).open(); (a as ModalController).close(); (a as ModalController).open()
      const b = create()
      ;(b as ModalController).open(); (b as ModalController).open(); (b as ModalController).close(); (b as ModalController).open()
      if (a.isOpen() !== b.isOpen()) return 'isOpen traces diverged across deep-equal-but-idempotent sequences'
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-SM-2 [strat:modal-callback-order] transition callbacks fire EXACTLY on real transitions, deterministic order', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const rep = runProperty('P-SM-2', 'strat:modal-callback-order', (_i, rng) => {
      const h = harness()
      const c = create({
        initialOpen: false,
        onOpen: h.callbacks.onOpen,
        onClose: h.callbacks.onClose,
        onToggle: h.callbacks.onToggle,
      })
      // construction fires none
      if (h.log.length !== 0) return `construction fired callbacks: ${h.log.join(',')}`
      let S = false
      let mOpen = 0
      let mClose = 0
      let mToggle = 0
      const seq = Array.from({ length: int(rng, 0, 14) }, () => pick(rng, ['open', 'close', 'toggle'] as const))
      for (const op of seq) {
        if (op === 'open') { if (!S) mOpen++; S = true; (c as ModalController).open() }
        else if (op === 'close') { if (S) mClose++; S = false; (c as ModalController).close() }
        else { if (S) { mClose++ } else { mOpen++ }; mToggle++; S = !S; (c as ModalController).toggle() }
        if (h.counts.onOpen !== mOpen) return `onOpen=${h.counts.onOpen} model=${mOpen} after ${op}`
        if (h.counts.onClose !== mClose) return `onClose=${h.counts.onClose} model=${mClose} after ${op}`
        if (h.counts.onToggle !== mToggle) return `onToggle=${h.counts.onToggle} model=${mToggle} after ${op}`
      }
      if (c.isOpen() !== S) return 'state drift'
      // ordering — every onToggle in the synchronous log is immediately preceded
      // by the onOpen/onClose of the SAME flip (onOpen/onClose before onToggle).
      for (let i = 0; i < h.log.length; i++) {
        if (h.log[i] === 'onToggle' && i > 0 && h.log[i - 1] !== 'onOpen' && h.log[i - 1] !== 'onClose') {
          return `onToggle not preceded by onOpen/onClose: ${h.log.join(',')}`
        }
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-TP-1 [strat:modal-toggle-involution] `toggle()` is exactly the invert transform (an involution)', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const rep = runProperty('P-TP-1', 'strat:modal-toggle-involution', (_i, rng) => {
      const start = pick(rng, [false, true])
      const h = harness()
      const c = create({ initialOpen: start, onOpen: h.callbacks.onOpen, onClose: h.callbacks.onClose, onToggle: h.callbacks.onToggle })
      const s0 = c.isOpen()
      if (s0 !== start) return `construction isOpen=${s0} expected ${start}`
      ;(c as ModalController).toggle()
      if (c.isOpen() !== !start) return `toggle() after ${start} → ${c.isOpen()} (must flip)`
      if (h.counts.onToggle !== 1) return `toggle() must fire onToggle once (got ${h.counts.onToggle})`
      const flipOne = h.log.filter((x) => x !== 'onToggle').length
      if (flipOne !== 1) return `a toggle() must fire exactly one of {onOpen,onClose}: ${h.log.join(',')}`
      ;(c as ModalController).toggle()
      if (c.isOpen() !== start) return `toggle();toggle() must return to ${start}, got ${c.isOpen()}`
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-TP-2 [strat:modal-isopen-deterministic] `isOpen()` is deterministic + the single observable state carrier', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const rep = runProperty('P-TP-2', 'strat:modal-isopen-deterministic', (_i, rng) => {
      const options = { initialOpen: pick(rng, [false, true]) }
      const seq = Array.from({ length: int(rng, 0, 12) }, () => pick(rng, ['open', 'close', 'toggle'] as const))
      const a = create(options)
      const b = create({ ...options })
      for (const op of seq) {
        ;(a as unknown as Record<string, () => void>)[op]()
        ;(b as unknown as Record<string, () => void>)[op]()
        if (a.isOpen() !== b.isOpen()) return `identical sequences diverged at ${op}: ${a.isOpen()} vs ${b.isOpen()}`
      }
      // free of side effects — 100 reads with no interleaved transition are stable
      const v = a.isOpen()
      for (let k = 0; k < 100; k++) {
        if (a.isOpen() !== v) return 'isOpen() read drifted without a transition'
      }
      return null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })

  it('P-TP-3 [strat:modal-class-mirror] the controller isOpen() maps 1:1 to the frame class mirror (test-built mirror wrapper)', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const rep = runProperty('P-TP-3', 'strat:modal-class-mirror', (_i, rng) => {
      const start = pick(rng, [false, true])
      const c = create({ initialOpen: start })
      const frame = new ShimElement('div')
      frame.className = `settings-modal ${c.isOpen() ? 'is-open' : 'is-closed'}`
      let writes = 0
      const mirror = (op: 'open' | 'close' | 'toggle') => {
        ;(c as unknown as Record<string, () => void>)[op]()
        const target = c.isOpen() ? 'is-open' : 'is-closed'
        const next = `settings-modal ${target}`
        if (next !== frame.className) {
          frame.className = next
          writes++
        }
      }
      // after ANY transition the frame has EXACTLY one state class == isOpen()
      const check = (ctx: string) => {
        const tokens = frame.className.split(/\s+/)
        const hasOpen = tokens.includes('is-open')
        const hasClosed = tokens.includes('is-closed')
        if (hasOpen === hasClosed) return `${ctx}: frame has ${hasClosed ? 'BOTH' : 'NEITHER'} state class: "${frame.className}"`
        if (hasOpen !== c.isOpen()) return `${ctx}: isOpen=${c.isOpen()} but class "${frame.className}" disagrees`
        return null
      }
      const seq = Array.from({ length: int(rng, 0, 12) }, () => pick(rng, ['open', 'close', 'toggle'] as const))
      for (const op of seq) {
        const before = writes
        mirror(op)
        const bad = check(`after ${op}`)
        if (bad) return bad
        // an idempotent open-on-open / close-on-closed produces NO class write
        if (op === 'open' || op === 'toggle') continue
        // 'close' here can be a no-op only if already closed; verified above via class
      }
      // explicit idempotent no-churn: open-on-open / close-on-closed add 0 writes
      const m1 = create({ initialOpen: true })
      const f1 = new ShimElement('div')
      f1.className = 'settings-modal is-open'
      const w1 = { n: 0 }
      const mir1 = (op: 'open' | 'close' | 'toggle') => {
        ;(m1 as unknown as Record<string, () => void>)[op]()
        const next = `settings-modal ${m1.isOpen() ? 'is-open' : 'is-closed'}`
        if (next !== f1.className) { f1.className = next; w1.n++ }
      }
      mir1('open') // no-op on open
      if (w1.n !== 0) return 'open() on open produced a class write (churn)'
      const m2 = create({ initialOpen: false })
      const f2 = new ShimElement('div')
      f2.className = 'settings-modal is-closed'
      const w2 = { n: 0 }
      const mir2 = (op: 'open' | 'close' | 'toggle') => {
        ;(m2 as unknown as Record<string, () => void>)[op]()
        const next = `settings-modal ${m2.isOpen() ? 'is-open' : 'is-closed'}`
        if (next !== f2.className) { f2.className = next; w2.n++ }
      }
      mir2('close') // no-op on closed
      if (w2.n !== 0) return 'close() on closed produced a class write (churn)'
      void writes
      return (check('final')) ?? null
    })
    expect(rep.held, `${rep.row} ${rep.strategyId}: ${rep.counterexamples.join(' | ')}`).toBe(true)
  })
})

// helper — a simple integer for the PBT rows above.
function int(rng: () => number, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}

// ===========================================================================
// §3a the pure ModalController states (node-testable, plain values).
// ===========================================================================
describe('U-SHELL-7 §3a the pure ModalController (node-testable)', () => {
  it('state 1 — initial-open: isOpen true at construction, NO callback, close() → false + onClose fired once', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const h = harness()
    const c = create({ initialOpen: true, onOpen: h.callbacks.onOpen, onClose: h.callbacks.onClose, onToggle: h.callbacks.onToggle })
    expect(c.isOpen()).toBe(true)
    expect(h.counts).toEqual({ onOpen: 0, onClose: 0, onToggle: 0 })
    ;(c as ModalController).close()
    expect(c.isOpen()).toBe(false)
    expect(h.counts.onClose).toBe(1)
    expect(h.counts.onOpen).toBe(0)
    expect(h.counts.onToggle).toBe(0)
  })

  it('state 2 — initial-closed + no-arg default: isOpen false, NO callback fired', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const h = harness()
    const c1 = create({ initialOpen: false, onOpen: h.callbacks.onOpen, onClose: h.callbacks.onClose, onToggle: h.callbacks.onToggle })
    expect(c1.isOpen()).toBe(false)
    expect(h.counts).toEqual({ onOpen: 0, onClose: 0, onToggle: 0 })
    const c2 = create()
    expect(c2.isOpen()).toBe(false)
  })

  it('state 3 — toggle closed→open: isOpen flips true; onOpen + onToggle fire (that order)', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const h = harness()
    const c = create({ initialOpen: false, onOpen: h.callbacks.onOpen, onClose: h.callbacks.onClose, onToggle: h.callbacks.onToggle })
    ;(c as ModalController).toggle()
    expect(c.isOpen()).toBe(true)
    expect(h.log).toEqual(['onOpen', 'onToggle'])
  })

  it('state 4 — toggle open→closed: isOpen flips false; onClose + onToggle fire (that order)', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const h = harness()
    const c = create({ initialOpen: true, onOpen: h.callbacks.onOpen, onClose: h.callbacks.onClose, onToggle: h.callbacks.onToggle })
    ;(c as ModalController).toggle()
    expect(c.isOpen()).toBe(false)
    expect(h.log).toEqual(['onClose', 'onToggle'])
  })

  it('state 5 — open() when already open is a NO-OP (state + onOpen unchanged, no onToggle)', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const h = harness()
    const c = create({ initialOpen: true, onOpen: h.callbacks.onOpen, onClose: h.callbacks.onClose, onToggle: h.callbacks.onToggle })
    ;(c as ModalController).open()
    expect(c.isOpen()).toBe(true)
    expect(h.counts.onOpen).toBe(0)
    expect(h.counts.onToggle).toBe(0)
  })

  it('state 6 — close() when already closed is a NO-OP (state + onClose unchanged)', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const h = harness()
    const c = create({ initialOpen: false, onOpen: h.callbacks.onOpen, onClose: h.callbacks.onClose, onToggle: h.callbacks.onToggle })
    ;(c as ModalController).close()
    expect(c.isOpen()).toBe(false)
    expect(h.counts.onClose).toBe(0)
  })
})

// ===========================================================================
// §4 pure fail-states (F1, F2) — the ModalController's TOTAL / fail-soft.
// ===========================================================================
describe('U-SHELL-7 §4 pure fail-states (ModalController)', () => {
  it('F1 — malformed options are TOTAL: no throw, working controller, non-boolean initialOpen→false, non-function callbacks→no-ops', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const cases: unknown[] = [
      undefined, null, 42, 'x',
      {},
      { initialOpen: 'yes' },
      { initialOpen: 1 },
      { initialOpen: null },
      { initialOpen: {} },
      { initialOpen: [], },
      { onOpen: 42 },
      { onOpen: 'x', onClose: null, onToggle: {} },
      { initialOpen: 0, onOpen: undefined, onClose: false },
    ]
    for (const opt of cases) {
      let c: ModalController
      expect(() => { c = create(opt) }, `createModalController(${JSON.stringify(opt)}) must not throw`).not.toThrow()
      c = create(opt)
      expect(typeof c.isOpen()).toBe('boolean')
      const init = opt != null && typeof opt === 'object' && 'initialOpen' in opt
        ? (opt as { initialOpen: unknown }).initialOpen
        : undefined
      expect(c.isOpen()).toBe(init === true) // strict-equality boolean, non-boolean coerces to false
      expect(() => c.open()).not.toThrow()
      expect(() => c.close()).not.toThrow()
      expect(() => c.toggle()).not.toThrow()
    }
  })

  it('F2 — a throwing onOpen/onClose/onToggle does NOT propagate (fail-soft; the transition still completes)', async () => {
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const boom = () => { throw new Error('boom') }
    const c = create({ initialOpen: false, onOpen: boom, onClose: boom, onToggle: boom })
    expect(() => c.toggle()).not.toThrow()
    expect(c.isOpen()).toBe(true) // closed→open transition completed
    expect(() => c.toggle()).not.toThrow()
    expect(c.isOpen()).toBe(false) // open→closed transition completed
    expect(() => c.open()).not.toThrow()
    expect(() => c.close()).not.toThrow()
  })
})

// ===========================================================================
// §3b the wiring — the LIVE installSettingsModal driven under the dom-shim.
// ===========================================================================
describe('U-SHELL-7 §3b the wiring under the dom-shim (drive installSettingsModal)', () => {
  beforeEach(() => {
    installShim() // a FRESH document tree per test
  })

  /** Author the four modal/toggle/body/scrim elements + the two operator mounts
   *  under a fresh shim `document.body`. The mounts begin mounted under a
   *  `layout` node (the EXISTING placement) so the re-parent moves them. All
   *  element ids resolve via `getElementById` (the shim caches by id), so the
   *  LIVE wiring resolves the SAME instances the test authors. */
  function authorModal(): {
    frame: ShimElement
    toggle: ShimElement
    scrim: ShimElement
    modalBody: ShimElement
    panes: ShimElement
    opPanes: ShimElement
  } {
    const doc = globalThis.document as unknown as {
      body: ShimElement
      getElementById(id: string): ShimElement
    }
    const body = doc.body
    const layout = new ShimElement('div')
    const panes = doc.getElementById('panes')
    const opPanes = doc.getElementById('operator-panes')
    body.appendChild(layout)
    layout.appendChild(panes)
    layout.appendChild(opPanes)
    const frame = doc.getElementById('settings-modal')
    frame.className = 'settings-modal'
    const scrim = doc.getElementById('settings-modal-scrim')
    const modalBody = doc.getElementById('settings-modal-body')
    const toggle = doc.getElementById('settings-toggle')
    frame.appendChild(scrim)
    frame.appendChild(modalBody) // frame wraps scrim + body as children (§8 Q4)
    body.appendChild(frame)
    body.appendChild(toggle)
    return { frame, toggle, scrim, modalBody, panes, opPanes }
  }

  async function install() {
    const mod = await loadModalState()
    const installSettingsModal = requireExport<(h?: unknown, p?: unknown, m?: unknown) => void>(mod, 'installSettingsModal')
    // a SidebarPanes-host stub + SecurePanels stub + the mounts object (§2.6).
    return (host: unknown, panels: unknown, mounts: unknown): void => installSettingsModal(host, panels, mounts)
  }

  function tokens(el: ShimElement): string[] {
    return el.className.split(/\s+/).filter(Boolean)
  }

  it('state 8 — hidden by default: `.is-closed` present, `.is-open` absent after install (§2.3 token XOR)', async () => {
    const { frame } = authorModal()
    const installSettingsModal = await install()
    installSettingsModal({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    const t = tokens(frame)
    expect(t).toContain('is-closed')
    expect(t).not.toContain('is-open')
    expect(t.some((x) => x === 'is-open') !== t.some((x) => x === 'is-closed')).toBe(true) // XOR
  })

  it('state 9 — toggle opens: a synthetic click on #settings-toggle flips the frame to `.is-open`', async () => {
    const { frame, toggle } = authorModal()
    const installSettingsModal = await install()
    installSettingsModal({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    toggle.dispatchPointer('click')
    const t = tokens(frame)
    expect(t).toContain('is-open')
    expect(t).not.toContain('is-closed')
    // and a second toggle click closes again (the toggle flips both ways §2.4)
    toggle.dispatchPointer('click')
    expect(tokens(frame)).toContain('is-closed')
    expect(tokens(frame)).not.toContain('is-open')
  })

  it('state 10 — Escape closes: a document keydown Escape while open flips the frame to `.is-closed`', async () => {
    const { frame, toggle } = authorModal()
    const installSettingsModal = await install()
    installSettingsModal({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    toggle.dispatchPointer('click') // open
    expect(tokens(frame)).toContain('is-open')
    shimDocument.dispatchPointer('keydown', frame, { key: 'Escape' })
    expect(tokens(frame)).toContain('is-closed')
    expect(tokens(frame)).not.toContain('is-open')
  })

  it('state 11 — scrim-click closes; a MODAL CONTENT click does NOT close (scrim zone only)', async () => {
    const { frame, toggle, scrim, modalBody } = authorModal()
    const installSettingsModal = await install()
    installSettingsModal({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    // open via the toggle
    toggle.dispatchPointer('click')
    expect(tokens(frame)).toContain('is-open')
    // a content click on #settings-modal-body must NOT close
    modalBody.dispatchPointer('click')
    expect(tokens(frame)).toContain('is-open')
    expect(tokens(frame)).not.toContain('is-closed')
    // the dedicated scrim click closes
    scrim.dispatchPointer('click')
    expect(tokens(frame)).toContain('is-closed')
    expect(tokens(frame)).not.toContain('is-open')
  })

  it('state 12 — the re-parent: modal body children contain BOTH #panes and #operator-panes after install', async () => {
    const { modalBody, panes, opPanes } = authorModal()
    // pre-install the mounts are under the layout (not the modal body)
    expect(modalBody.children).not.toContain(panes)
    expect(modalBody.children).not.toContain(opPanes)
    const installSettingsModal = await install()
    installSettingsModal({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    expect(modalBody.children).toContain(panes)
    expect(modalBody.children).toContain(opPanes)
    expect(panes.parent).toBe(modalBody)
    expect(opPanes.parent).toBe(modalBody)
    // the modal children are EXACTLY the two operator mounts (§2.5 HARD INVARIANT)
    expect(modalBody.children.length).toBe(2)
  })

  it('state 13 — exactly ONE frame class write per transition (open/close), none on idempotent no-ops', async () => {
    const { frame, toggle, scrim } = authorModal()
    const installSettingsModal = await install()
    installSettingsModal({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    const writeDelta = (action: () => void): number => {
      const before = frame.className
      action()
      return frame.className !== before ? 1 : 0
    }
    // each real transition writes EXACTLY once
    expect(writeDelta(() => toggle.dispatchPointer('click'))).toBe(1) // open
    expect(writeDelta(() => toggle.dispatchPointer('click'))).toBe(1) // close
    expect(writeDelta(() => toggle.dispatchPointer('click'))).toBe(1) // open
    // idempotent no-ops write nothing
    shimDocument.dispatchPointer('keydown', frame, { key: 'Escape' }) // close (real)
    expect(writeDelta(() => shimDocument.dispatchPointer('keydown', frame, { key: 'Escape' }))).toBe(0) // Escape while closed = no-op
    expect(writeDelta(() => scrim.dispatchPointer('click'))).toBe(0) // scrim while closed = no-op
  })

  it('state 14 — the mirror reflects the initial hidden state at install (default false → is-closed)', async () => {
    const auth = authorModal()
    const installSettingsModal = await install()
    installSettingsModal({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    expect(tokens(auth.frame)).toContain('is-closed')
    expect(tokens(auth.frame)).not.toContain('is-open')
  })
})

// ===========================================================================
// §4 wiring fail-states (F3–F12) — the dom-shim-driven edge cases.
// ===========================================================================
describe('U-SHELL-7 §4 wiring fail-states (dom-shim)', () => {
  beforeEach(() => {
    installShim() // a FRESH document tree per test
  })

  function authorModal(): {
    frame: ShimElement
    toggle: ShimElement
    scrim: ShimElement
    modalBody: ShimElement
    panes: ShimElement
    opPanes: ShimElement
  } {
    const doc = globalThis.document as unknown as { body: ShimElement; getElementById(id: string): ShimElement }
    const body = doc.body
    const layout = new ShimElement('div')
    const panes = doc.getElementById('panes')
    const opPanes = doc.getElementById('operator-panes')
    body.appendChild(layout)
    layout.appendChild(panes)
    layout.appendChild(opPanes)
    const frame = doc.getElementById('settings-modal')
    frame.className = 'settings-modal'
    const scrim = doc.getElementById('settings-modal-scrim')
    const modalBody = doc.getElementById('settings-modal-body')
    const toggle = doc.getElementById('settings-toggle')
    frame.appendChild(scrim)
    frame.appendChild(modalBody)
    body.appendChild(frame)
    body.appendChild(toggle)
    return { frame, toggle, scrim, modalBody, panes, opPanes }
  }

  async function loadInstall(): Promise<(h?: unknown, p?: unknown, m?: unknown) => void> {
    const mod = await loadModalState()
    const fn = requireExport<(h?: unknown, p?: unknown, m?: unknown) => void>(mod, 'installSettingsModal')
    return fn
  }

  const TOGGLE = 'settings-toggle'
  const SCRIM = 'settings-modal-scrim'
  const BODY = 'settings-modal-body'

  it('F3 — Escape while the modal is closed is an idempotent no-op (no class write, no close)', async () => {
    const { frame } = authorModal()
    const install = await loadInstall()
    install({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    const before = frame.className
    shimDocument.dispatchPointer('keydown', frame, { key: 'Escape' })
    expect(frame.className).toBe(before) // no class churn
    expect(tokens(frame)).toContain('is-closed')
  })

  it('F4 — scrim-click while the modal is closed is an idempotent no-op (no class write)', async () => {
    const { frame, scrim } = authorModal()
    const install = await loadInstall()
    install({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    const before = frame.className
    scrim.dispatchPointer('click')
    expect(frame.className).toBe(before)
    expect(tokens(frame)).toContain('is-closed')
  })

  it('F5 — a DOUBLE-install on the same document is a NO-OP (exactly ONE toggle/escape/scrim listener + ONE re-parent)', async () => {
    const { toggle, scrim, modalBody, panes, opPanes } = authorModal()
    const install = await loadInstall()
    const mounts = { panes: 'panes', operatorPanes: 'operator-panes' }
    install({}, null, mounts)
    install({}, null, mounts)
    expect((toggle as unknown as { listeners: Record<string, unknown[]> }).listeners['click']?.length ?? 0).toBe(1)
    expect((scrim as unknown as { listeners: Record<string, unknown[]> }).listeners['click']?.length ?? 0).toBe(1)
    const docListeners = (shimDocument as unknown as { listeners: Record<string, unknown[]> }).listeners
    expect(docListeners['keydown']?.length ?? 0).toBe(1)
    // re-parent not duplicated
    const panesCount = modalBody.children.filter((c) => c === panes).length
    const opCount = modalBody.children.filter((c) => c === opPanes).length
    expect(panesCount).toBe(1)
    expect(opCount).toBe(1)
    expect(modalBody.children.length).toBe(2)
  })

  it('F6 — absent modal frame/toggle/host/mounts: install is FAIL-SOFT (no throw, boot preserved)', async () => {
    // an EMPTY document body (nothing authored) — the wiring must no-op without
    // throwing (F11-style). The loader itself also fails soft (the module is not
    // implemented yet → a descriptive RED).
    const fn = await loadInstall()
    expect(() => fn({}, null, {})).not.toThrow()
  })

  it('F7 — no DOM (typeof document === "undefined") → the pure controller still works, the wiring no-ops, never throws', async () => {
    // pure controller is DOM-independent — construct one BEFORE removing the DOM.
    const mod = await loadModalState()
    const create = requireExport<(o?: unknown) => ModalController>(mod, 'createModalController')
    const c = create()
    expect(typeof c.isOpen()).toBe('boolean')
    expect(() => create({ initialOpen: true }).open()).not.toThrow()
    // the wiring no-ops under no-DOM.
    const doc = (globalThis as Record<string, unknown>).document
    delete (globalThis as Record<string, unknown>).document
    try {
      const install = await loadInstall()
      expect(() => install({}, null, {})).not.toThrow()
    } finally {
      ;(globalThis as Record<string, unknown>).document = doc
    }
    expect(c.isOpen()).toBe(false)
  })

  it('F8 — a document keydown with a NON-Escape key is ignored (never closes, never throws)', async () => {
    const { frame, toggle } = authorModal()
    const install = await loadInstall()
    install({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    // open it first, then send non-Escape keys — must stay open
    toggle.dispatchPointer('click')
    expect(tokens(frame)).toContain('is-open')
    const keys = ['Enter', 'KeyE', ' ', 'Scape', '', 'Escape ', 'KeyEscape']
    for (const k of keys) {
      expect(() => shimDocument.dispatchPointer('keydown', frame, { key: k })).not.toThrow()
      expect(tokens(frame), `non-Escape key "${k}" must NOT close the modal`).toContain('is-open')
    }
  })

  it('F10 — the re-parent while the modal is closed keeps the isolated mounts (ancestry-only, no destroy)', async () => {
    const { panes, opPanes, modalBody } = authorModal()
    const install = await loadInstall()
    // modal is closed (hidden) — re-parent still hosts the mounts under the body
    install({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    expect(modalBody.children).toContain(panes)
    expect(modalBody.children).toContain(opPanes)
    expect(panes.parent).toBe(modalBody)
    expect(opPanes.parent).toBe(modalBody)
  })

  it('F11 — a click on the fixed toggle before the modal frame exists never throws', async () => {
    // author ONLY the toggle (no frame/scrim/body) → the wiring guards absent frame.
    const doc = globalThis.document as unknown as { body: ShimElement; getElementById(id: string): ShimElement }
    const toggle = doc.getElementById('settings-toggle')
    doc.body.appendChild(toggle)
    const install = await loadInstall()
    expect(() => install({}, null, {})).not.toThrow()
    expect(() => toggle.dispatchPointer('click')).not.toThrow()
  })

  it('F12 — a content-click bubbling through the modal body is NOT a scrim-click (never closes)', async () => {
    const { frame, toggle, modalBody } = authorModal()
    const install = await loadInstall()
    install({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    toggle.dispatchPointer('click') // open
    expect(tokens(frame)).toContain('is-open')
    // a click on a nested content child bubbles through #settings-modal-body
    const child = new ShimElement('div')
    modalBody.appendChild(child)
    child.dispatchPointer('click')
    expect(tokens(frame)).toContain('is-open')
    expect(tokens(frame)).not.toContain('is-closed')
  })
})

// token helper shared by both wiring describes.
function tokens(el: ShimElement): string[] {
  return el.className.split(/\s+/).filter(Boolean)
}

// ===========================================================================
// §2.8 — the source-pinned registration / mirror / re-parent surface. The real
// DOM events that can be node-driven are driven in §3b/§4 above; THIS layer
// statically asserts installSettingsModal registers the pinned surface by
// literal call (the unit-u-shell-shell-wiring §2.8 house convention). ALL RED —
// modal-state.ts does not exist yet and renderer.ts has no installSettingsModal
// caller.
// ===========================================================================
describe('U-SHELL-7 §2.8 the source-pinned registration surface', () => {
  let modalSrc: string
  let rendererSrc: string
  beforeAll(() => {
    try {
      modalSrc = readFileSync(join(process.cwd(), 'src/renderer/modal-state.ts'), 'utf8')
    } catch {
      modalSrc = '' // the module is not implemented yet → every assertion RED
    }
    rendererSrc = readFileSync(join(process.cwd(), 'src/renderer/renderer.ts'), 'utf8')
  })

  it('constructs the controller via createModalController(...) with initialOpen: false (default hidden)', () => {
    expect(modalSrc, 'installSettingsModal must build its controller via createModalController(…)').toContain('createModalController(')
    expect(modalSrc, 'the wiring must pass initialOpen: false so the modal is hidden by default').toMatch(/initialOpen\s*:\s*false/)
  })

  it('registers EXACTLY the toggle affordance as ONE addEventListener("click", …) on #settings-toggle → toggle()', () => {
    expect(modalSrc, 'the toggle element id census (#settings-toggle) must be queried').toContain('settings-toggle')
    expect(modalSrc, 'the toggle must register a click listener (addEventListener("click", …))').toContain("addEventListener('click'")
    expect(modalSrc, 'the toggle click must call controller.toggle() (toggle( …))').toContain('.toggle(')
  })

  it('registers ONE document-level keydown routing Escape → controller.close()', () => {
    expect(modalSrc, 'the wiring must register a DOCUMENT-level keydown listener').toMatch(/addEventListener\('keydown'/)
    expect(modalSrc, 'the keydown must route e.key === "Escape"').toContain('Escape')
    expect(modalSrc, 'the Escape branch must call controller.close() (close())').toContain('close()')
  })

  it('registers ONE DIRECT click listener on the dedicated scrim #settings-modal-scrim → close() (not document-delegated)', () => {
    expect(modalSrc, 'the dedicated scrim element id census (#settings-modal-scrim) must be queried').toContain('settings-modal-scrim')
    expect(modalSrc, 'the scrim must carry a DIRECT click listener (addEventListener("click", …))').toContain("addEventListener('click'")
    expect(modalSrc, 'the scrim click must call controller.close() (close())').toContain('close()')
  })

  it('mirrors isOpen() onto the frame classes via an isOpen() READ after each controller call (XOR class set, never an independent DOM flip)', () => {
    expect(modalSrc, 'the wiring must READ isOpen() after each controller call (§2.3)').toContain('isOpen()')
    expect(modalSrc, 'the frame must carry the is-open class token').toContain('is-open')
    expect(modalSrc, 'the frame must carry the is-closed class token (XOR partner)').toContain('is-closed')
    expect(modalSrc, 'the modal frame element id census (#settings-modal) must be queried').toContain('settings-modal')
  })

  it("re-parents the EXISTING #panes + #operator-panes mounts into #settings-modal-body (re-mount only)", () => {
    expect(modalSrc, 'the modal body container id census (#settings-modal-body) must be queried').toContain('settings-modal-body')
    expect(modalSrc, 'the SecurePanels mount id (#panes) must be re-parented into the body').toContain("getElementById('panes')")
    expect(modalSrc, 'the operator mount id (#operator-panes) must be re-parented into the body').toContain("getElementById('operator-panes')")
    expect(modalSrc, 'the mounts must move under the modal body (appendChild / children)').toMatch(/appendChild|panes.*settings-modal-body|modal-body/i)
  })

  it('calls installSettingsModal from renderer.ts main() AFTER the host construction (a §2.6 caller)', () => {
    expect(rendererSrc, 'main() must CALL installSettingsModal(…) after installShellPointers (§2.6 placement)').toContain('installSettingsModal(')
  })
})

// ===========================================================================
// Adversarial regressions SH7-ADV1..3 (the fixed `settle`/`apply` internals +
// the ADV1 CSS fix in src/renderer/index.html). Each pins a finding that was
// JUST FIXED in the implementation and MUST PASS against the fixed code.
// ===========================================================================
describe('U-SHELL-7 adversarial regressions SH7-ADV1..3 (fixed internals pin)', () => {
  beforeEach(() => {
    installShim() // a FRESH document tree per test
  })

  /** Author the shell chrome + operator mounts under a fresh shim body (the
   *  §3b authorModal setup, duplicated here so this describe is self-contained). */
  function authorModal(): { frame: ShimElement; toggle: ShimElement; scrim: ShimElement; modalBody: ShimElement } {
    const doc = globalThis.document as unknown as {
      body: ShimElement
      getElementById(id: string): ShimElement
    }
    const body = doc.body
    const layout = new ShimElement('div')
    const panes = doc.getElementById('panes')
    const opPanes = doc.getElementById('operator-panes')
    body.appendChild(layout)
    layout.appendChild(panes)
    layout.appendChild(opPanes)
    const frame = doc.getElementById('settings-modal')
    frame.className = 'settings-modal'
    const scrim = doc.getElementById('settings-modal-scrim')
    const modalBody = doc.getElementById('settings-modal-body')
    const toggle = doc.getElementById('settings-toggle')
    frame.appendChild(scrim)
    frame.appendChild(modalBody)
    body.appendChild(frame)
    body.appendChild(toggle)
    return { frame, toggle, scrim, modalBody }
  }

  function install(): Promise<(h?: unknown, p?: unknown, m?: unknown) => void> {
    return loadModalState().then((mod) =>
      requireExport<(h?: unknown, p?: unknown, m?: unknown) => void>(mod, 'installSettingsModal'),
    )
  }

  it('SH7-ADV2 — an idempotent Escape/scrim-click on an ALREADY-CLOSED modal performs NO class write (settle no-op guard)', async () => {
    const { frame, toggle, scrim } = authorModal()
    // Instrument the frame className with a counting setter (getter/setter
    // accessor on the SHIM instance, forwarding to a backing field) so ANY
    // write by the wiring is counted deterministically.
    let writes = 0
    let backing = frame.className
    Object.defineProperty(frame, 'className', {
      configurable: true,
      get() {
        return backing
      },
      set(v: string) {
        writes++
        backing = v
      },
    })
    const installSettingsModal = await install()
    installSettingsModal({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    // initial hidden mirror = exactly ONE class write at install
    expect(writes).toBe(1)
    expect(frame.className).toContain('is-closed')
    // toggle open — toggle() always flips → +1 write
    toggle.dispatchPointer('click')
    expect(writes).toBe(2)
    expect(frame.className).toContain('is-open')
    // toggle close — a real transition → +1 write
    toggle.dispatchPointer('click')
    expect(writes).toBe(3)
    expect(frame.className).toContain('is-closed')
    const afterRealTransitions = writes
    // Escape while ALREADY-CLOSED: isOpen() did not flip → the settle guard
    // performs ZERO class writes (pins ADV2 — before the fix this wrote every time).
    shimDocument.dispatchPointer('keydown', frame, { key: 'Escape' })
    expect(writes, 'Escape on an already-closed modal must NOT write the class').toBe(afterRealTransitions)
    // scrim click while ALREADY-CLOSED: same no-op guard → ZERO class writes.
    scrim.dispatchPointer('click')
    expect(writes, 'scrim click on an already-closed modal must NOT write the class').toBe(afterRealTransitions)
    // the class value is still correct after the no-op churn (no corruption).
    expect(frame.className).toContain('is-closed')
    expect(frame.className).not.toContain('is-open')
  })

  it('SH7-ADV3 — a sibling class on #settings-modal survives transitions (apply preserves non is-* classes)', async () => {
    const { frame, toggle } = authorModal()
    frame.className = 'settings-modal custom-token is-closed'
    const installSettingsModal = await install()
    installSettingsModal({}, null, { panes: 'panes', operatorPanes: 'operator-panes' })
    // the sibling token survives the install mirror (pins ADV3: apply only swaps
    // the is-open/is-closed pair, it never replaces the whole className).
    expect(tokens(frame)).toContain('custom-token')
    // toggle open — sibling + is-open present, XOR holds (exactly one state class)
    toggle.dispatchPointer('click')
    expect(tokens(frame)).toContain('custom-token')
    expect(tokens(frame)).toContain('is-open')
    expect(tokens(frame)).not.toContain('is-closed')
    // toggle close — sibling survives again, XOR holds
    toggle.dispatchPointer('click')
    expect(tokens(frame)).toContain('custom-token')
    expect(tokens(frame)).toContain('is-closed')
    expect(tokens(frame)).not.toContain('is-open')
    // AND an extra open/close cycle keeps the token (the mirror never decays it)
    toggle.dispatchPointer('click')
    toggle.dispatchPointer('click')
    expect(tokens(frame)).toContain('custom-token')
    expect(tokens(frame)).toContain('is-closed')
  })

  it('SH7-ADV1 — source-pin the scrim `pointer-events: auto` fix in src/renderer/index.html', () => {
    // browser-only CSS fix (the dom-shim has NO hit-testing) → pinned statically.
    const html = readFileSync(join(process.cwd(), 'src/renderer/index.html'), 'utf8')
    expect(html, 'index.html must contain the dedicated scrim element/rule #settings-modal-scrim').toContain('settings-modal-scrim')
    const scrimCss = html.slice(html.indexOf('#settings-modal-scrim'))
    expect(scrimCss, '#settings-modal-scrim must reset pointer-events to auto (ADV1)').toMatch(/pointer-events\s*:\s*auto/)
    // and the `#settings-modal-scrim` id appears as a block (not just the markup div)
    expect(html.indexOf('#settings-modal-scrim {') >= 0, 'the scrim rule selector with a CSS block brace').toBe(true)
  })
})


