// tests/unit-v5-bridge-capture.test.ts — Unit V5-MIGRATION (DEC-2), TestWriter
// RED set, part 1 of 2: the RUNTIME half of the pins + the register rows whose
// observable is the capture box itself.
//
// Spec source (the ONLY design source): docs/specs/unit-v5-migration.md
//   §2a  the ONE sanctioned electron-mock bridge-capture pattern (C-1..C-7):
//        a box created INSIDE `vi.hoisted` + a factory implementation that
//        STORES the exposed api + `capturedBridge()` reading the box, with NO
//        dependence on `mock.calls[]` history
//   §3.2 Pin 2 — the capture is NON-EMPTY after a `beforeEach`, and the REAL
//        `src/main/preload.ts` ran against the mock (sidebar census > 0 + the
//        named seams the sibling rows depend on; 41 keys measured today)
//   §4   the property register rows P-IM-1 / P-IM-2 / P-SM-1 / P-TP-3 (the
//        capture-box semantics — exercised against a LOCAL harness mirroring
//        §2a; no src-side module is imported that does not exist)
//   §5   S1 (module-eval vs test-execution boundary), S2 (the cleared history
//        DISAGREES with the live box by design), S3 (beforeEach present/absent),
//        S4 (factory ran / did not run), S5 (second exposure = last-write-wins
//        + the count assertion), S6/S7 (hygiene + census), F1/F4/F5
//
// The source-contract pins (Pin 1), the deep-row/config pins (Pin 3), the
// Class-C guard (Pin 4) and P-SM-2/P-TP-1/P-TP-2 live in the sibling file
// tests/unit-v5-migration-contract.test.ts (that file needs no electron mock,
// so the two halves are kept separate — one hoisted mock set per file).
//
// Data states enumerated (spec §5):
//   S1  the preload calls exposeInMainWorld ONCE during MODULE EVALUATION
//       (before the first test body) — asserted by the census row below.
//   S2  the mock record's calls[] is EMPTY while the box holds the live API
//       (the two reads disagree by design; only the box is a legal capture).
//   S3  with a beforeEach hook AND without one — the capture is identical.
//   S4  the factory ran (box populated) — the loud state; a broken hoist would
//       leave it undefined and the row must fail at the ASSERTION, never crash.
//   S5  a SECOND exposure: last-write-wins AND the exposure counter is 2 (a
//       double exposure is a preload defect the harness must surface).
//   S7  the preload census: > 0 sidebar keys + the named seams; 41 is the
//       recorded measurement (a preload grown past 41 is NOT a red row).
//
// RED-FIRST NOTE (honest record): `clearMocks: true` is a NEW vitest-5 default
// (the §1.1 Class-A cause). This file reproduces that semantics EXPLICITLY
// (`vi.clearAllMocks()` + a manual `mockClear()`) instead of relying on the
// default, so the rows stay red/green for the RIGHT reason and do not depend on
// a config override (§2c items 1-4 forbid `clearMocks: false`).
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// §2a — the ONE sanctioned pattern, applied here for real: a hoisted BOX (C-1),
// a factory whose IMPLEMENTATION stores the exposed api (C-2), and
// `capturedBridge()` reading the box (C-3). `mock.calls[]` is NEVER a capture
// target. The preload import below evaluates the REAL `src/main/preload.ts`
// against this mock.
// ---------------------------------------------------------------------------
const invokeMock = vi.hoisted(() => vi.fn())
/** Holds the API object the preload exposed at MODULE EVALUATION. Created
 *  INSIDE vi.hoisted: a module-scope `let` is in the TDZ when the hoisted
 *  factory runs (§2a C-1 / §5 F3). */
const bridgeBox = vi.hoisted(() => ({ current: undefined as Record<string, unknown> | undefined }))
/** The real exposure count, kept INSIDE the implementation (the mock record's
 *  history is exactly what v5 clears — §2a C-2). */
const exposureCount = vi.hoisted(() => ({ n: 0 }))

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn((_name: string, api: Record<string, unknown>) => {
      exposureCount.n += 1
      bridgeBox.current = api
    }),
  },
  ipcRenderer: {
    invoke: invokeMock,
    on: vi.fn(() => vi.fn()),
    removeListener: vi.fn(),
    send: vi.fn(),
  },
}))

// Import AFTER the electron mock is installed (vi.mock is hoisted).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import '../src/main/preload.js'


const ROOT = join(import.meta.dirname, '..')
const PRELOAD_SRC = readFileSync(join(ROOT, 'src', 'main', 'preload.ts'), 'utf8')

/** The `window.provident` bridge captured by contextBridge.exposeInMainWorld
 *  — a pure accessor over the box, with NO call-history dependency (§2a C-3). */
function capturedBridge(): Record<string, unknown> | undefined {
  return bridgeBox.current
}

beforeEach(() => {
  // The file's real hygiene block (§2a C-5). It clears the IPC spy's own
  // history — it NEVER touches the box.
  invokeMock.mockReset()
})

// ===========================================================================
// Pin 2.1 (§3.2) — the capture is NON-EMPTY after a `beforeEach` has run
// ===========================================================================
describe('Pin 2 — the capture survives the beforeEach boundary (the Class-A failure mode)', () => {
  it('RED-TODAY: capturedBridge() is a non-null object AFTER the beforeEach hook (not undefined)', () => {
    const bridge = capturedBridge()
    expect(
      bridge,
      'capturedBridge() is undefined after a beforeEach — the capture cannot depend on mock call history (vitest-5 `clearMocks` erases module-evaluation calls; §2a C-1..C-4)',
    ).toBeDefined()
    expect(typeof bridge).toBe('object')
    expect(bridge).not.toBeNull()
  })

  it('RED-TODAY: the REAL src/main/preload.ts exposed the `provident` bridge exactly ONCE', () => {
    // The count is kept INSIDE the factory implementation, so it survives any
    // mock-history clear (C-2). A second exposure is a PRELOAD defect (§5 S5).
    expect(
      exposureCount.n,
      'the real preload must call contextBridge.exposeInMainWorld exactly once per module evaluation (a second exposure is a preload defect, §5 S5)',
    ).toBe(1)
    expect(invokeMock.mock.calls.length, 'the IPC spy history is cleared at test start by design (S2)').toBe(0)
  })

  it('RED-TODAY: the exposed sidebar surface is NON-EMPTY and carries the named seams', () => {
    const bridge = capturedBridge() as Record<string, unknown> | undefined
    expect(bridge, 'no exposure captured — the mock factory never stored the real preload bridge (§2a C-2)').toBeDefined()
    const sidebar = (bridge as Record<string, unknown>).sidebar as Record<string, unknown> | undefined
    expect(sidebar, 'the captured bridge carries no `sidebar` namespace — the REAL preload did not run').toBeDefined()
    const keys = Object.keys(sidebar!)
    expect(keys.length, 'the sidebar census must be > 0 (the measured surface is 41 keys today; a grown surface is not a red row)').toBeGreaterThan(0)
    for (const seam of ['selectDocument', 'togglePaneCollapse', 'editorBlur']) {
      expect(typeof (sidebar as Record<string, unknown>)[seam], `the named seam sidebar.${seam} must be present on the real bridge`).toBe('function')
    }
    const edit = (bridge as Record<string, unknown>).edit as Record<string, unknown> | undefined
    expect(edit, 'the captured bridge carries no `edit` namespace').toBeDefined()
    expect(typeof (edit as Record<string, unknown>).commitRich, 'the named seam edit.commitRich must be present on the real bridge').toBe('function')
  })

  it('RED-TODAY: the runtime census AGREES with the preload source census (recorded, never hard-coded to 41)', () => {
    const bridge = capturedBridge() as Record<string, unknown> | undefined
    expect(bridge, 'no exposure captured').toBeDefined()
    const runtimeKeys = Object.keys(((bridge as Record<string, unknown>).sidebar ?? {}) as object)
    // The source census is DERIVED from src/main/preload.ts (no constant of our
    // own): the `sidebar: { … }` object literal is sliced out and its immediate
    // 4-space-indented members are counted. 41 at the probe pass; the assertion
    // is an equality between two MEASUREMENTS, not against an invented number.
    const start = PRELOAD_SRC.indexOf('  sidebar: {')
    const end = PRELOAD_SRC.indexOf('  installSidebar(', start)
    expect(start, 'src/main/preload.ts: the `sidebar: {` literal was not found').toBeGreaterThan(-1)
    expect(end, 'src/main/preload.ts: the `installSidebar(` member after `sidebar` was not found').toBeGreaterThan(start)
    const sourceKeys = [...PRELOAD_SRC.slice(start, end).matchAll(/^ {4}([A-Za-z_][A-Za-z0-9_]*)\s*[:(]/gm)].map((m) => m[1])
    expect(sourceKeys.length, 'the source census must be > 0').toBeGreaterThan(0)
    expect(
      runtimeKeys.length,
      `the runtime sidebar census (${runtimeKeys.length}) must equal the source census (${sourceKeys.length}) — recorded: 41 at the probe pass`,
    ).toBe(sourceKeys.length)
    for (const k of sourceKeys) expect(runtimeKeys, `runtime sidebar surface is missing the source key ${k}`).toContain(k)
  })

  it('the capture is identical WITHOUT a beforeEach hook (S3 — the value is not hook-scoped)', () => {
    // Declared in the test body: this row's own value must equal the value read
    // by the hooked rows above (both read the same module-evaluation state).
    const here = capturedBridge()
    expect(here, 'S3: the capture must be identical with or without a beforeEach hook').toBe(bridgeBox.current)
  })
})

// ===========================================================================
// §5 S2 — the cleared history DISAGREES with the live box (by design)
// ===========================================================================
describe('S2 — call history cleared vs box live', () => {
  it('after vi.clearAllMocks() the box still holds the API while .mock.calls is empty', () => {
    const before = capturedBridge()
    vi.clearAllMocks() // the exact v5 `clearMocks` semantics the config default applies per test
    expect(bridgeBox.current, 'S2: the box is module-evaluation state and is NEVER cleared (§2a C-5)').toBe(before)
    expect(invokeMock.mock.calls.length, 'the IPC spy history IS cleared (that is what the Class-A rows assert against)').toBe(0)
    expect(capturedBridge(), 'S2: the two reads disagree by design — only the box is a legal capture target').toBeDefined()
  })
})

// ===========================================================================
// §4 Register rows — P-IM-1 / P-IM-2 / P-SM-1 / P-TP-3 (harness, pure)
// ===========================================================================
const PBT_SEED = 0x5a4d17 // the V5-MIGRATION pinned seed (deterministic)
const PBT_ATTEMPTS = 60 // ≤100/row → 60×6 + 40 (P-TP-1) = 400 ≤ 400 total
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
  return arr[Math.floor(rng() * arr.length)]!
}

/** One register row's report (§4 convention): attempts, held/broken, the
 *  counterexamples (never a throw — §5 "throw patterns"). */
interface RowReport {
  row: string
  strategyId: string
  attempts: number
  held: boolean
  counterexamples: string[]
}

function runPropertyRows(
  row: string,
  strategyId: string,
  modeCount: number,
  check: (i: number, rng: () => number) => string | null,
): RowReport {
  const rng = mulberry32(PBT_SEED)
  const counterexamples: string[] = []
  let attempts = 0
  for (let i = 0; i < PBT_ATTEMPTS; i++) {
    attempts += 1
    const ce = check(i, rng)
    if (ce) {
      counterexamples.push(ce)
      if (counterexamples.length >= PBT_STOP_AFTER) break
    }
  }
  return { row, strategyId, attempts, held: counterexamples.length === 0, counterexamples }
}

/** The §2a sanctioned pattern as a LOCAL harness (no src-side module needed):
 *  a box + a factory whose IMPLEMENTATION stores the exposed api. */
function makeSanctionedHarness(): {
  box: { current: unknown }
  factory: (name: string, api: unknown) => unknown
  capturedBridge: () => unknown
} {
  const box: { current: unknown } = { current: undefined }
  const factory = (_name: string, api: unknown): unknown => {
    box.current = api
    return undefined
  }
  return { box, factory, capturedBridge: () => box.current }
}

const NAMES = ['provident', 'other', '', '\u0000x', 'provident'] as const

function makeApi(rng: () => number): Record<string, unknown> {
  const mode = Math.floor(rng() * 6)
  switch (mode) {
    case 0:
      return {}
    case 1:
      return { a: 1 }
    case 2: {
      const o: Record<string, unknown> = {}
      for (let k = 0; k < 41; k++) o[`k${k}`] = k
      return o
    }
    case 3:
      return { sidebar: { selectDocument: () => {} }, edit: { commitRich: () => {} } }
    case 4:
      return Object.freeze({ frozen: true })
    default:
      return { __proto__: null, protoKey: 1 } as Record<string, unknown>
  }
}

describe('§4 register — capture-box harness rows', () => {
  it('P-IM-1 (strat:v5-capture-pair) — the box holds the ARGUMENT api for every (name, api) draw (identity)', () => {
    const h = makeSanctionedHarness()
    const report = runPropertyRows('P-IM-1', 'strat:v5-capture-pair', 5, (i, rng) => {
      const name = pick(rng, NAMES)
      const api = makeApi(rng)
      const ret = h.factory(name, api)
      if (ret !== undefined) return `draw ${i}: the factory returned ${String(ret)} — the §2a C-2 store returns undefined`
      if (h.box.current === undefined) return `draw ${i}: the box is still undefined after the implementation call (name=${JSON.stringify(name)})`
      if (h.box.current !== api) return `draw ${i}: box.current !== api (identity, not deep-equality) for name=${JSON.stringify(name)} keys=${Object.keys(api).join(',')}`
      if (h.capturedBridge() !== api) return `draw ${i}: capturedBridge() !== api — the accessor must return the box's current value only (§2a C-3)`
      return null
    })
    expect(report.counterexamples, `${report.row} broken: ${report.counterexamples.join(' | ')}`).toEqual([])
    expect(report.held).toBe(true)
  })

  it('P-IM-1b — the SAME box instance is reused across draws: the last write wins (§5 S5)', () => {
    const h = makeSanctionedHarness()
    const a = { first: true }
    const b = { second: true }
    h.factory('provident', a)
    h.factory('provident', b)
    expect(h.capturedBridge(), 'S5: a second exposure must leave the LAST api in the box').toBe(b)
    expect(h.capturedBridge()).not.toBe(a)
  })

  it('P-IM-2 (strat:v5-factory-purity) — the implementation stores to exactly ONE target and never throws', () => {
    const h = makeSanctionedHarness()
    const report = runPropertyRows('P-IM-2', 'strat:v5-factory-purity', 5, (i, rng) => {
      const name = pick(rng, NAMES)
      // The malformed half: a null/undefined api must be stored as-is, never thrown on.
      const api: unknown = i % 7 === 0 ? null : i % 11 === 0 ? undefined : makeApi(rng)
      let writes = 0
      const box = { get current(): unknown { return h.box.current }, set current(v: unknown) { writes += 1; h.box.current = v } }
      const factory = (_n: string, a: unknown): unknown => {
        box.current = a
        return undefined
      }
      try {
        const ret = factory(name, api)
        if (ret !== undefined) return `draw ${i}: a bare-proxy factory returned ${String(ret)} — the §2a C-2 implementation is a store, not a proxy`
        if (writes !== 1) return `draw ${i}: the implementation wrote to the box ${writes} times — exactly ONE target write is pinned (api=${String(api)})`
        if (h.box.current !== api) return `draw ${i}: a malformed api (${String(api)}) was not stored as-is — the factory must never throw at the preload boundary`
        return null
      } catch (e) {
        return `draw ${i}: the factory THREW on api=${String(api)}: ${(e as Error).message} — a throw inside the preload's own call is indistinguishable from a preload defect (§5)`
      }
    })
    expect(report.counterexamples, `${report.row} broken: ${report.counterexamples.join(' | ')}`).toEqual([])
  })

  it('P-SM-1 (strat:v5-clear-survival) — the capture SURVIVES every clear mode (the Class-A class, inverted)', () => {
    const h = makeSanctionedHarness()
    const api = { sidebar: { selectDocument: () => {} } }
    h.factory('provident', api)
    const before = h.capturedBridge()
    const modes = ['mockClear', 'mockReset', 'clearAllMocks', 'restoreAllMocks', 'no-op'] as const
    // The companion NEGATIVE half is MODE-AWARE: the CALL-HISTORY pattern must
    // lose its `calls[0]` read under every clear mode and keep it under a
    // non-clearing mode. Requiring it to lose the record under `no-op` would be
    // a false counterexample.
    const clearsHistory: Record<(typeof modes)[number], boolean> = {
      mockClear: true,
      mockReset: true,
      clearAllMocks: true,
      restoreAllMocks: false,
      'no-op': false,
    }
    const report = runPropertyRows('P-SM-1', 'strat:v5-clear-survival', modes.length, (i, rng) => {
      const mode = pick(rng, modes)
      const spy = vi.fn()
      spy('named', api) // an old-pattern recorder's own record, cleared below
      if (mode === 'mockClear') spy.mockClear()
      else if (mode === 'mockReset') spy.mockReset()
      else if (mode === 'clearAllMocks') vi.clearAllMocks()
      else if (mode === 'restoreAllMocks') vi.restoreAllMocks()
      const after = h.capturedBridge()
      if (after !== before || after !== api) {
        return `draw ${i}: mode=${mode} — capturedBridge() changed identity after the clear (the box is NEVER reset, §2a C-5)`
      }
      const oldRead = (spy.mock.calls[0] as unknown[] | undefined)?.[1]
      if (clearsHistory[mode] && oldRead !== undefined) {
        return `draw ${i}: mode=${mode} — the call-history pattern still reads an api after a CLEARING mode; the row does not discriminate the two patterns (vacuously passing)`
      }
      if (!clearsHistory[mode] && oldRead === undefined) {
        return `draw ${i}: mode=${mode} — the control mode ${mode} unexpectedly erased the record (the mode's expected state is mis-stated)`
      }
      return null
    })
    expect(report.counterexamples, `${report.row} broken: ${report.counterexamples.join(' | ')}`).toEqual([])
    expect(report.attempts).toBe(PBT_ATTEMPTS)
  })

  it('P-SM-1b — the Class-A mechanism: a cleared CALL HISTORY loses calls[0] while the box does not', () => {
    const spy = vi.fn()
    spy('provident', { sidebar: {} })
    expect((spy.mock.calls[0] as unknown[] | undefined)?.[1], 'before the clear the call-history capture works (why the pattern looked legitimate under vitest 2)').toBeDefined()
    vi.clearAllMocks()
    expect(
      (spy.mock.calls[0] as unknown[] | undefined)?.[1],
      'the §1.1 Class-A mechanism: a cleared call history makes the call-history capture undefined',
    ).toBeUndefined()
    // the sanctioned BOX is immune to the same clear, over the same exposure
    const h = makeSanctionedHarness()
    const api = { sidebar: {} }
    h.factory('provident', api)
    vi.clearAllMocks()
    expect(h.capturedBridge(), 'the box capture survives what the call-history capture cannot (§2a C-1..C-3)').toBe(api)
  })

  it('P-TP-3 (strat:v5-capture-transform) — (key count, named-seam presence) is invariant across clear sequences', () => {
    const surfaces: Array<Record<string, unknown>> = [
      Object.fromEntries(Array.from({ length: 41 }, (_, k) => [`k${k}`, k])),
      { only: 1 },
      {},
      { sidebar: { selectDocument: () => {}, togglePaneCollapse: () => {}, editorBlur: () => {} } },
    ]
    const sequences = [
      [] as string[],
      ['mockClear'],
      ['mockClear', 'mockReset'],
      ['clearAllMocks', 'clearAllMocks', 'clearAllMocks'],
    ]
    const h = makeSanctionedHarness()
    const report = runPropertyRows('P-TP-3', 'strat:v5-capture-transform', 4, (i, rng) => {
      const surface = pick(rng, surfaces)
      const seq = pick(rng, sequences)
      h.factory('provident', surface)
      const read = (): string => {
        const api = h.capturedBridge() as Record<string, unknown> | undefined
        if (api === undefined) return 'UNDEFINED'
        const sidebar = (api.sidebar ?? {}) as Record<string, unknown>
        return `${Object.keys(api).length}:${['selectDocument', 'togglePaneCollapse', 'editorBlur'].filter((s) => typeof sidebar[s] === 'function').join('+')}`
      }
      const before = read()
      for (const mode of seq) {
        const spy = vi.fn()
        spy('provident', surface)
        if (mode === 'mockClear') spy.mockClear()
        if (mode === 'mockReset') spy.mockReset()
        if (mode === 'clearAllMocks') vi.clearAllMocks()
      }
      const after = read()
      if (after !== before) return `draw ${i}: clear sequence [${seq.join(',')}] changed the census pair ${before} → ${after}`
      // the boundary is STATED, not silently passed: a 0-key surface yields a 0 census by construction.
      if (before.startsWith('UNDEFINED')) return `draw ${i}: the factory-pattern read collapsed to undefined (the Class-A failure) for sequence [${seq.join(',')}]`
      // the call-history pattern collapses to undefined on the same draw
      const spy = vi.fn()
      spy('provident', surface)
      spy.mockClear()
      if ((spy.mock.calls[0] as unknown[] | undefined)?.[1] !== undefined) {
        return `draw ${i}: the call-history pattern did NOT collapse — the discriminating half is vacuous`
      }
      return null
    })
    expect(report.counterexamples, `${report.row} broken: ${report.counterexamples.join(' | ')}`).toEqual([])
  })

  it('P-TP-3b — the 0-key surface is the STATED boundary (a 0-key synthetic draw is not the real surface)', () => {
    const h = makeSanctionedHarness()
    h.factory('provident', {})
    const api = h.capturedBridge() as Record<string, unknown>
    expect(Object.keys(api).length, 'the row states its own 0-key boundary rather than passing vacuously').toBe(0)
  })
})
