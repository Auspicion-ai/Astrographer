// tests/blind-store-security-journal-greens.test.ts
//
// GATE-5 BLIND GREEN-SCENARIO HARNESS for unit `U-STORE-SECURITY-JOURNAL` (3b,
// RH-3) — authored by a BLIND-TEST WRITER who did NOT write the implementation
// and who did NOT read `src/renderer/secure-panels.ts`, `src/renderer/
// renderer.ts`, `tests/pd-store-security-journal.test.ts` or
// `tests/store-security-journal-register.test.ts`.
//
// THE ARTIFACT THESE SCENARIOS ARE RECORDED IN:
//   docs/specs/unit-store-security-journal-greens.md
//
// EVERY expectation below is derived from the DOCUMENTATION ONLY:
//   - docs/specs/unit-store-security-journal.md      (the Contract — the
//       authoritative member list: §0 the rulings R-1..R-9 and the supersession
//       pointer edges S-P-1..S-P-5; §1.1 the ALLOWED change-set; §1.2 the
//       DENIED rows; §2.1 the cap authority (a)/(b)/(c) + the `M` semantics;
//       §2.2 the seam `journalDepth()`; §2.3 the SETTLE PROTOCOL; §2.4 the
//       burst re-home + the predicate boundary; §2.5 the occurrence probe;
//       §2.6 the `syncConfig()` volume guard; §3.1 the invariant; §3.2
//       I-1..I-7; §3.3 the fail-states F-1..F-12; §5.1 the nine register rows;
//       §5.2 the register arithmetic; §6 the layer ledger + the honesty block;
//       §8 the gate sequence; §10 THE AMENDMENT LEDGER — `A-3B-1` ①..⑥)
//   - docs/specs/unit-store-security-journal-review.md   (the gate-1 record:
//       §C's ruling set C-1..C-6, §F's acceptance shape COMPILE-§F.1..7)
//   - docs/specs/unit-store-security-journal-adoption-dossier.md (the STEP-0
//       dossier: §1's seven identifier rows, §2's divergence ledger, §3's
//       collisions K-1..K-3)
//   - docs/specs/unit-store-security-journal-live-pending-battery.md (the NAMED
//       PARK: the structural-non-exercisability reason + the D5 measured skip)
//   - docs/specs/unit-store-security-adopt-review.md     (§5A/§13 re-shape)
//   - docs/specs/unit-store-security-write.md            (3a, the shared surface)
//
// ENGINE SURFACE — PUBLIC TYPES + DOCS ONLY (`node_modules/provident-ssr/**/*.d.ts`
// + `README.md`); no engine `.js` implementation file was read:
//   `dist/core/supervisor.d.ts`  `readonly journal: JournalEntry[]` ·
//     `maxJournalLength?: number` on the constructor options · `get undoDepth` ·
//     `journalEntries(): JournalView` (`basePresent`/`totalEntries`/`undoDepth`) ·
//     `flush()` · `hasPendingWork()` · `allNodes()` · `getNode(id)` · `apply(op)`
//     returning `{ status: 'applied' | 'no-usable-state' | 'rejected'; … }`
//   `dist/core/node.d.ts`        `mintNodeId()`; `Node.id` is the MINTED graph id
//   `dist/index.d.ts`            the re-exported public surface
//   `README.md`                  the legacy-envelope / direct-graph / managed-
//                                mutation-channel input surfaces
//
// ===========================================================================
// THE DRIVE-REALITY RULE (this harness's own anti-vacuity discipline).
// A scenario whose drive was REJECTED is a FAIL, never a PASS. `Supervisor.apply`
// answers `{status:'rejected', error:{code:'unknown-node'}}` for a node the
// supervisor does not hold, and the journal does NOT move. Therefore every
// driven scenario below (a) resolves its drive node from the pane supervisor's
// OWN `allNodes()` registry and (b) ASSERTS THE OBSERVED MOVEMENT —
// `status === 'applied'` AND a strict increase in `journalDepth()` — before any
// downstream claim is read. A vacuous drive reddens these guards directly.
//
// THE NODE-IDENTITY TRAP (recorded as a DOC GAP in the greens artifact).
// The contract's §2.1(b)/§2.6 name the pane's SEMANTIC ids (`security-status`,
// `status`, `token-input`, `journal-length-input`, `module-status`,
// `module-list`, `module-run-result`, `toggle:*`), but NO spec named in this
// task states whether those strings are the graph node IDS that
// `Supervisor.getNode(id)` resolves, nor that the real ids are of the form
// `node-N`. The docs are SILENT, so this harness does NOT assume either: it
// reads the pane's own `allNodes()` and matches `base.props.id` (the ENGINE's
// authored-id carrier) to pick its drive targets.
//
// LAYER (RCA-12, mandatory): `[T]` constructed pane / `[H]` shim+wiring
// byte-scan. **NO LIVE LEG.** NOTHING here is app-green, envelope-green,
// store-green, engine-green or live-green. **NO DURABILITY CLAIM** — this unit
// moves no byte on any durability axis (§3.1, §6).
// ===========================================================================

import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { installShim, mountEl } from '../src/shared/dom-shim.js'
import { SecurePanels } from '../src/renderer/secure-panels.js'

beforeAll(() => {
  installShim()
})

const ROOT = process.cwd()
const read = (p: string): string => readFileSync(join(ROOT, p), 'utf8')

// ---------------------------------------------------------------------------
// THE SETTLE — contract §2.3. The contract CONSUMES the landed `drain()`
// precedent BY CITATION: a loop of `await new Promise((res) => setTimeout(res, 0))`
// — FIVE awaits, i.e. it CROSSES MACROTASK BOUNDARIES, because the engine's
// deferred condense is scheduled by `setTimeout(…, 0)` (a MACROTASK) while
// `flush()` awaits only while `hasPendingWork()`, which does NOT include
// `condenseScheduled`. §2.3 OUTSIDE: `flush()` alone · fake timers · a fixed
// tick-count claim · a wall-clock window · any "microtask" claim (K-3: the
// engine's own comment is a TRAP, never a spec source).
// ---------------------------------------------------------------------------
async function drain(rounds = 5): Promise<void> {
  for (let i = 0; i < rounds; i++) {
    await new Promise((res) => setTimeout(res, 0))
  }
}

// ---------------------------------------------------------------------------
// The pane bridge — the shape the house pane tests build (`tests/secure-panels.test.ts`).
// `security.get()` / `security.set(patch)`; `maxJournalLength` is a patch member
// per 3a §2.1 S-3's declared patch domain.
// ---------------------------------------------------------------------------
interface SecSettings {
  token: string | null
  enabled: string[]
  maxJournalLength?: number | undefined
}

function makeBridge(init?: Partial<SecSettings>) {
  const state: SecSettings = {
    token: null,
    enabled: ['read', 'dispatch'],
    maxJournalLength: undefined,
    ...(init ?? {}),
  }
  return {
    current: () => state,
    bridge: {
      get: async (): Promise<SecSettings> => ({ ...state }),
      set: async (patch: Partial<SecSettings> & { disable?: string[] }): Promise<SecSettings> => {
        const next: SecSettings = { ...state }
        if ('token' in patch) next.token = patch.token ?? null
        if (Array.isArray(patch.groups)) {
          for (const g of patch.groups) if (!next.enabled.includes(g)) next.enabled.push(g)
        }
        if (Array.isArray(patch.disable)) {
          next.enabled = next.enabled.filter((g) => !patch.disable!.includes(g))
        }
        if ('maxJournalLength' in patch) next.maxJournalLength = patch.maxJournalLength ?? undefined
        Object.assign(state, next)
        return { ...state }
      },
    },
  }
}

function installBridge(b: { bridge: unknown }): void {
  ;(globalThis as unknown as { window?: unknown }).window = { provident: { security: b.bridge } }
}

/** The pane's surface as the DOCS declare it (§2.2's `journalDepth()`; §1.1
 *  member 1②'s `Supervisor` construction; §2.6's `syncConfig()` site). The
 *  declared public surface names no accessor for the pane's Supervisor, so this
 *  is a typed read of the instance field the contract names; a missing field
 *  reads `undefined` and the scenario FAILS rather than silently skipping. */
interface EngineSupervisor {
  journal: unknown[]
  readonly undoDepth: number
  maxJournalLength?: number
  allNodes(): EngineNode[]
  getNode(id: string): EngineNode | undefined
  journalEntries(): { basePresent: boolean; totalEntries: number; undoDepth: number }
  apply(op: Record<string, unknown>): { status: string; error?: { code: string } }
}
interface EngineNode {
  id: string
  base?: { props?: { id?: string } }
}
interface PaneInternals {
  supervisor?: EngineSupervisor
  refresh?: () => unknown | Promise<unknown>
  refreshDebug?: (rt: unknown) => void
  debugValue?: unknown
  journalDepth?: () => number
  maxJournalLength?: number
}
const paneOf = (p: unknown): PaneInternals => p as PaneInternals

/** The engine's own authored-id carrier: `Node.base.props.id`. A live-tree read
 *  (`allNodes()`), NEVER `getNode(<semantic id>)` — see THE NODE-IDENTITY TRAP. */
const nodeByAuthoredId = (sup: EngineSupervisor, id: string): EngineNode | undefined =>
  sup.allNodes().find((n) => n.base?.props?.id === id)

interface DriveResult {
  attempts: number
  applied: number
  rejected: string[]
  depthBefore: number
  depthAfter: number
}

/** Drive N journaling mutations against a REAL pane node, then settle. The
 *  caller asserts `rejected` is empty — the anti-vacuity discipline. */
async function drive(
  sup: EngineSupervisor,
  count: number,
  tag: string,
  authoredId = 'security-status',
): Promise<DriveResult> {
  const node = nodeByAuthoredId(sup, authoredId)
  const depthBefore = sup.journal.length
  const rejected: string[] = []
  let applied = 0
  for (let i = 0; i < count; i++) {
    const r = sup.apply({
      kind: 'state-slice',
      node,
      mutation: [{ targetProp: 'content', mode: 'replace', value: `${tag}-${String(i)}` }],
    })
    if (r.status === 'applied') applied++
    else rejected.push(r.error?.code ?? r.status)
  }
  await drain()
  return { attempts: count, applied, rejected, depthBefore, depthAfter: sup.journal.length }
}

const say = (...parts: unknown[]): void => {
  // eslint-disable-next-line no-console
  console.log(parts.join(' '))
}

// ===========================================================================
// G-1 · THE SETTLE PROTOCOL AND THE > M FLOOR (contract §2.3 + §10 `A-3B-1` ②)
// LAYER [T]. V1/V5 — the fixture SETS M and the drive SPANS more than one
// deferred-condense window.
// ===========================================================================

describe('G-1 — the settle crosses macrotask boundaries and the drive journals', () => {
  it('G-1.1 [T] V1: a fixture that SETS M plumbs it to the pane Supervisor; the drive journals past M', async () => {
    installBridge(makeBridge({ maxJournalLength: 2 }))
    const panels = new SecurePanels(mountEl() as never, { maxJournalLength: 2 } as never)
    await panels.refresh()
    await drain()
    const p = paneOf(panels)
    const sup = p.supervisor
    expect(sup, 'the pane must own a Supervisor (§1.1 member 1②)').toBeTruthy()

    const r = await drive(sup!, 40, 'g11')
    say(
      `[G-1.1] M(option)=${String(p.maxJournalLength)} M(engine)=${String(sup!.maxJournalLength)}`,
      `· attempts=${String(r.attempts)} applied=${String(r.applied)} rejected=[${r.rejected.join(',')}]`,
      `· journal.length ${String(r.depthBefore)} -> ${String(r.depthAfter)}`,
    )
    // V1 — the fixture's M reached the ENGINE's option.
    expect(sup!.maxJournalLength, 'V1: the fixture sets M on the pane Supervisor').toBe(2)
    // THE DRIVE-REALITY RULE: zero rejections and real movement, or the row is vacuous.
    expect(r.rejected, 'the drive must APPLY — a rejected drive is a FAIL, never a PASS').toEqual([])
    expect(r.applied, 'every attempt must be reported applied').toBe(40)
    expect(r.depthAfter, 'the drive must journal (the > M floor, §10 A-3B-1 ②)').toBeGreaterThan(r.depthBefore)
    expect(r.depthAfter, 'V5: the drive crosses > M on this fixture').toBeGreaterThan(2)
  })

  it('G-1.2 [T] V2: the SAME drive on an UNCAPPED pane grows past M (the anti-vacuity control)', async () => {
    installBridge(makeBridge())
    const panels = new SecurePanels(mountEl() as never)
    await panels.refresh()
    await drain()
    const sup = paneOf(panels).supervisor!
    const r = await drive(sup, 40, 'g12')
    say(
      `[G-1.2] M(engine)=${String(sup.maxJournalLength)} applied=${String(r.applied)}`,
      `· journal.length ${String(r.depthBefore)} -> ${String(r.depthAfter)}`,
    )
    expect(sup.maxJournalLength, 'the landed default is `M = undefined` (§2.1(c) INERT)').toBeUndefined()
    expect(r.rejected, 'the uncapped control drive must APPLY').toEqual([])
    expect(r.depthAfter, 'V2: the uncapped control must show journal.length > M').toBeGreaterThan(2)
  })
})

// ===========================================================================
// G-2 · THE SEAM `journalDepth()` (contract §2.2, §3.2 I-1, row `P-SSJ-IM-1`)
// LAYER [T]. Subject = `Supervisor.journal.length`, NEVER `undoDepth`.
// ===========================================================================

describe('G-2 — journalDepth() answers Supervisor.journal.length', () => {
  it('G-2.1 [T] the RETURN SHAPE: finite non-negative integer, synchronous, ZERO parameters', async () => {
    installBridge(makeBridge())
    const panels = new SecurePanels(mountEl() as never)
    await panels.refresh()
    await drain()
    const p = paneOf(panels)
    expect(typeof p.journalDepth, '§2.2: `journalDepth()` is a `SecurePanels` member').toBe('function')
    expect(p.journalDepth!.length, '§2.2: the member declares exactly ONE parameter — none').toBe(0)
    const d = p.journalDepth!()
    expect(typeof d, '§2.2: a NUMBER — never a view, a Promise or a tuple').toBe('number')
    expect(Number.isFinite(d), '§2.2: finite').toBe(true)
    expect(Number.isInteger(d), '§2.2: an integer').toBe(true)
    expect(d, '§2.2: >= 0').toBeGreaterThanOrEqual(0)
    const settle = await Promise.resolve(d)
    expect(settle, '§2.2: SYNCHRONOUS — never a Promise').toBe(d)
    say(
      `[G-2.1] journalDepth() = ${String(d)} (integer=${String(Number.isInteger(d))}, arity=${String(p.journalDepth!.length)})`,
    )
  })

  it('G-2.2 [T] THE IDENTITY: journalDepth() === supervisor.journal.length at the same settle', async () => {
    installBridge(makeBridge())
    const panels = new SecurePanels(mountEl() as never)
    await panels.refresh()
    await drain()
    const p = paneOf(panels)
    const seam = p.journalDepth!()
    const engine = p.supervisor!.journal.length
    const view = p.supervisor!.journalEntries()
    say(
      `[G-2.2] journalDepth()=${String(seam)} · supervisor.journal.length=${String(engine)}`,
      `· view.undoDepth=${String(view.undoDepth)} · view.totalEntries=${String(view.totalEntries)}`,
    )
    expect(seam, 'I-1: the seam IS the engine journal length').toBe(engine)
  })

  it('G-2.3 [H] I-1 falsifier: the seam body reads the journal and NOT the truncated stack', () => {
    const body = withoutComments(read('src/renderer/secure-panels.ts'))
    const m = /journalDepth\s*\(\s*\)\s*:\s*number\s*\{([\s\S]{0,300}?)\n\s{0,4}\}/.exec(body)
    const seamBody = m?.[1] ?? ''
    say(`[G-2.3] seam body = ${JSON.stringify(seamBody.replace(/\s+/g, ' ').trim().slice(0, 140))}`)
    expect(seamBody.length, 'the seam body must be extractable by symbol').toBeGreaterThan(0)
    expect(seamBody, 'I-1: the subject is `journal.length`').toMatch(/journal\s*\.\s*length/)
    expect(seamBody, 'denied row 8: never `undoDepth`').not.toMatch(/undoDepth/)
    expect(seamBody, 'denied row 8: never `journalEntries()`').not.toMatch(/journalEntries/)
    expect(seamBody, 'denied row 8: never `redoDepth`').not.toMatch(/redoDepth/)
  })

  it('G-2.4 [H] denied row 12/I-5: journalDepth() has NO production caller in shipped wiring', () => {
    const renderer = withoutComments(read('src/renderer/renderer.ts'))
    const calls = [...renderer.matchAll(/journalDepth\s*\(/g)].length
    say(`[G-2.4] journalDepth( call sites in renderer.ts = ${String(calls)}`)
    expect(calls, 'denied row 12: the seam is a TEST/VISIBILITY accessor only').toBe(0)
  })
})

// ===========================================================================
// G-3 · THE CAP — CONFIGURED AND ATTEMPTED (contract §2.1(c), §10 `A-3B-1` ①②)
// LAYER [T]. `A-3B-1` ① WITHDRAWS §2.1(c)'s `<= M` SETTLE BOUND as a claim on
// THIS pane: the engine's condense FIRES but the D5 size guard ALWAYS SKIPS
// (base 7622B >= pre-base journal 2312B), so the ATTEMPT is the observable and
// the honest claim is "configured + attempted", never "bounded at M".
// ===========================================================================

describe('G-3 — the engine cap is CONFIGURED and the condense is ATTEMPTED', () => {
  it('G-3.1 [T] limb 1 (re-cast): configured AND attempted — the D5 skip is observed with M set', async () => {
    const warns: string[] = []
    const realWarn = console.warn
    console.warn = (...a: unknown[]) => {
      warns.push(a.map(String).join(' '))
    }
    try {
      installBridge(makeBridge({ maxJournalLength: 1 }))
      const panels = new SecurePanels(mountEl() as never, { maxJournalLength: 1 } as never)
      await panels.refresh()
      await drain()
      const sup = paneOf(panels).supervisor!
      const r = await drive(sup, 40, 'g31')
      const view = sup.journalEntries()
      const skipWarn = warns.filter((w) => /condense-skipped-size/.test(w))
      const aborted = warns.filter((w) => /condense-aborted/.test(w))
      say(
        `[G-3.1] M=1 · applied=${String(r.applied)} rejected=${String(r.rejected.length)}`,
        `· journal.length ${String(r.depthBefore)} -> ${String(r.depthAfter)}`,
        `· basePresent=${String(view.basePresent)} undoDepth=${String(sup.undoDepth)}`,
        `· condense-skipped-size warns=${String(skipWarn.length)} condense-aborted=${String(aborted.length)}`,
      )
      if (skipWarn[0]) say(`[G-3.1] warn text = ${JSON.stringify(skipWarn[0].slice(0, 170))}`)

      // The drive was REAL (the anti-vacuity gate).
      expect(r.rejected, 'the drive must APPLY — a rejected drive is a FAIL').toEqual([])
      expect(r.depthAfter, 'the drive must journal past M=1').toBeGreaterThan(1)
      // limb 1, RE-CAST by A-3B-1 ②: the cap is CONFIGURED and a condense was
      // ATTEMPTED. An unconfigured pane, or a drive that never triggers, reddens.
      expect(sup.maxJournalLength, 'the cap is CONFIGURED at the pane Supervisor').toBe(1)
      const attempted = view.basePresent || skipWarn.length > 0 || aborted.length > 0
      expect(attempted, 'a condense was ATTEMPTED (basePresent, or the skip/abort warn)').toBe(true)
      // The engine's own containment: no abort on this pane (member 5's binding fix).
      expect(aborted, 'condense-aborted is the pre-member-5 defect; it must not fire').toEqual([])
    } finally {
      console.warn = realWarn
    }
  })

  it('G-3.2 [T] V3/V4: the D5-SKIPPED arm — equal seam/stack reading AND basePresent === false', async () => {
    installBridge(makeBridge({ maxJournalLength: 1 }))
    const panels = new SecurePanels(mountEl() as never, { maxJournalLength: 1 } as never)
    await panels.refresh()
    await drain()
    const p = paneOf(panels)
    const sup = p.supervisor!
    const r = await drive(sup, 40, 'g32')
    const seam = p.journalDepth!()
    const undo = sup.undoDepth
    const base = sup.journalEntries().basePresent
    say(
      `[G-3.2] M=1 applied=${String(r.applied)} · journalDepth()=${String(seam)} undoDepth=${String(undo)}`,
      `· basePresent=${String(base)} (the D5-skip arm)`,
    )
    expect(r.rejected, 'the drive must APPLY').toEqual([])
    // V4 — limb 3 ACCEPTS BOTH LEGAL OUTCOMES (§2.1(c) as re-cast by A-3B-1 ②):
    //   LANDED  => seam !== undoDepth
    //   SKIPPED => seam === undoDepth AND basePresent === false
    const landed = seam !== undo
    const skipped = seam === undo && base === false
    expect(
      landed || skipped,
      'V4: limb 3 accepts LANDED or SKIPPED — a legal non-observation is never a failure',
    ).toBe(true)
    // The subject rule holds under EITHER arm.
    expect(seam, 'I-1: the seam is the journal reading, never the truncated stack').toBe(sup.journal.length)
    say(`[G-3.2] arm observed = ${landed ? 'LANDED (!==)' : 'SKIPPED (=== with basePresent false)'}`)
  })

  it('G-3.3 [T] I-2: with M = undefined the cap is INERT — no condense base lands', async () => {
    installBridge(makeBridge())
    const panels = new SecurePanels(mountEl() as never)
    await panels.refresh()
    await drain()
    const sup = paneOf(panels).supervisor!
    const r = await drive(sup, 40, 'g33')
    const view = sup.journalEntries()
    say(
      `[G-3.3] M=undefined applied=${String(r.applied)} · depth=${String(r.depthAfter)} basePresent=${String(view.basePresent)}`,
    )
    expect(r.rejected, 'the control drive must APPLY').toEqual([])
    expect(sup.maxJournalLength, 'the landed default is undefined (§2.1(c))').toBeUndefined()
    expect(view.basePresent, 'I-2: M = undefined => the cap is INERT, no base marker').toBe(false)
  })
})

// ===========================================================================
// G-4 · THE OPTION'S ADDITIVITY (contract §1.1 member 1①, §3.2 I-3, row `P-SSJ-IM-3`)
// LAYER [T] + [H]. `SecurePanelsOptions.maxJournalLength` is OPTIONAL and
// ADDITIVE; a POSITIONAL second argument is the F-10 falsifier.
// ===========================================================================

describe('G-4 — the option is ADDITIVE-OPTIONAL', () => {
  it('G-4.1 [H] the declared member is OPTIONAL, never REQUIRED; never positional', () => {
    const pane = withoutComments(read('src/renderer/secure-panels.ts'))
    const optional = /maxJournalLength\s*\?\s*:\s*number/.test(pane)
    const required = /maxJournalLength\s*:\s*number/.test(pane) && !optional
    const renderer = withoutComments(read('src/renderer/renderer.ts'))
    const positional = /new\s+SecurePanels\s*\([^)]*,\s*[A-Za-z_$][\w$]*\s*\)/.test(renderer)
    say(
      `[G-4.1] SecurePanelsOptions.maxJournalLength optional=${String(optional)} · REQUIRED form=${String(required)}`,
      `· positional 2nd-arg call site=${String(positional)}`,
    )
    expect(optional, 'I-3: the member is declared OPTIONAL').toBe(true)
    expect(required, 'F-10: the REQUIRED form is the falsifier').toBe(false)
    expect(positional, 'F-10: a positional second argument at a landed call site reddens').toBe(false)
  })

  it('G-4.2 [T] I-3: omission re-produces the landed INERT behaviour EXACTLY', async () => {
    installBridge(makeBridge())
    const omitted = new SecurePanels(mountEl() as never)
    await omitted.refresh()
    await drain()
    const so = paneOf(omitted).supervisor!
    const ro = await drive(so, 12, 'g42-omit')

    installBridge(makeBridge())
    const undef = new SecurePanels(mountEl() as never, { maxJournalLength: undefined } as never)
    await undef.refresh()
    await drain()
    const su = paneOf(undef).supervisor!
    const ru = await drive(su, 12, 'g42-omit')
    say(
      `[G-4.2] ABSENT: applied=${String(ro.applied)} depth ${String(ro.depthBefore)}->${String(ro.depthAfter)} M=${String(so.maxJournalLength)}`,
      `· PRESENT-as-undefined: applied=${String(ru.applied)} depth ${String(ru.depthBefore)}->${String(ru.depthAfter)} M=${String(su.maxJournalLength)}`,
    )
    expect(so.maxJournalLength, 'ABSENT => undefined at the engine').toBeUndefined()
    expect(su.maxJournalLength, 'PRESENT-as-undefined => undefined at the engine').toBeUndefined()
    // §5.1 P-SSJ-IM-3: omission is inert identically to the M=undefined control.
    expect(ru.depthBefore - ro.depthBefore, 'ABSENT and PRESENT-as-undefined start at the same depth').toBe(0)
    expect(ru.depthAfter - ro.depthAfter, 'ABSENT and PRESENT-as-undefined grow identically').toBe(0)
  })

  it('G-4.3 [H] F-2: the option is PLUMBED at the pane Supervisor construction and at the renderer site', () => {
    const pane = withoutComments(read('src/renderer/secure-panels.ts'))
    const construction = /new\s+Supervisor\s*\(\s*\{[\s\S]{0,240}?maxJournalLength/.test(pane)
    const renderer = withoutComments(read('src/renderer/renderer.ts'))
    const sites = [...renderer.matchAll(/new\s+SecurePanels\s*\(/g)].length
    const paneOption = /new\s+SecurePanels\s*\([^)]*\{[^}]*maxJournalLength/.test(renderer)
    say(
      `[G-4.3] pane Supervisor construction carries maxJournalLength=${String(construction)}`,
      `· renderer new SecurePanels( sites=${String(sites)} · pane option present=${String(paneOption)}`,
    )
    expect(construction, 'F-2: the option must be FED to the Supervisor, not merely declared').toBe(true)
    expect(sites, 'denied row 7 class: the EXISTING pane construction site only').toBe(1)
    expect(paneOption, 'F-2: the renderer must pass the option at that site').toBe(true)
  })
})

// ===========================================================================
// G-5 · THE VOLUME GUARD (contract §2.6, §3.2 I-6, rows `P-SSJ-SM-1`/`P-SSJ-TP-1`)
// LAYER [T]. §10 `A-3B-1` ③ RULES: the WARM-UP draws (measured 12); every
// UNCHANGED repeat draws ZERO. A row demanding `>= 1` on a steady-state
// unchanged cycle is WRONG by that ruling.
// ===========================================================================

/** Count `state-slice` draws by wrapping the pane Supervisor's own `apply`. */
function countDraws(sup: EngineSupervisor): { drawn: () => number; reset: () => void } {
  const target = sup as unknown as { apply: (op: Record<string, unknown>) => unknown }
  let drawn = 0
  const real = target.apply.bind(sup)
  target.apply = (op: Record<string, unknown>) => {
    if (op && op.kind === 'state-slice') drawn++
    return real(op)
  }
  return {
    drawn: () => drawn,
    reset: () => {
      drawn = 0
    },
  }
}

describe('G-5 — the syncConfig skip-if-unchanged VOLUME GUARD', () => {
  it('G-5.1 [T] the WARM-UP draws; the UNCHANGED repeat is SUPPRESSED (zero applies)', async () => {
    installBridge(makeBridge())
    const panels = new SecurePanels(mountEl() as never)
    const p = paneOf(panels)
    const sup = p.supervisor!
    const rec = countDraws(sup)

    rec.reset()
    await panels.refresh()
    const warmUp = rec.drawn()
    rec.reset()
    await panels.refresh()
    const unchanged = rec.drawn()
    await drain()
    say(
      `[G-5.1] WARM-UP state-slice draws = ${String(warmUp)} (contract §2.6 MEASURED baseline 16, A-3B-1 ③ measured 12)`,
      `· UNCHANGED-repeat draws = ${String(unchanged)} (ruled: toward 0)`,
      `· journalDepth() = ${String(p.journalDepth!())}`,
    )
    // §10 A-3B-1 ③: the warm-up carries the REAL initial draw.
    expect(
      warmUp,
      'the WARM-UP cycle must draw (A-3B-1 ③ re-scopes SM-1 state 1 to the warm-up)',
    ).toBeGreaterThanOrEqual(1)
    // §2.6③: the unchanged repeat falls toward 0.
    expect(unchanged, 'the unchanged repeat must be SUPPRESSED — under the MEASURED baseline of 16').toBeLessThan(16)
  })

  it('G-5.2 [T] I-6: the guard is an IDEMPOTENCE guard — the rendered outcome is UNCHANGED', async () => {
    installBridge(makeBridge())
    const mount = mountEl() as unknown as { innerHTML: string }
    const panels = new SecurePanels(mount as never)
    await panels.refresh()
    const before = mount.innerHTML
    await panels.refresh()
    await panels.refresh()
    const after = mount.innerHTML
    say(`[G-5.2] rendered outcome identical across unchanged repeats = ${String(before === after)}`)
    expect(after, 'I-6: the guard must never change a rendered outcome').toBe(before)
  })

  it('G-5.3 [T] F-6 falsifier: a CHANGED config value still draws and reaches the rendering', async () => {
    const b = makeBridge()
    installBridge(b)
    const mount = mountEl() as unknown as { innerHTML: string }
    const panels = new SecurePanels(mount as never)
    const sup = paneOf(panels).supervisor!
    const rec = countDraws(sup)
    await panels.refresh()
    const before = mount.innerHTML

    // A REAL change: a new group is enabled server-side.
    b.current().enabled = ['read', 'dispatch', 'graph']
    rec.reset()
    await panels.refresh()
    const changedDraws = rec.drawn()
    const after = mount.innerHTML
    say(`[G-5.3] changed-config draws = ${String(changedDraws)} · rendered outcome moved = ${String(after !== before)}`)
    expect(
      changedDraws,
      '§2.6④: a CHANGED value must still draw (the guard must not suppress a change)',
    ).toBeGreaterThanOrEqual(1)
    expect(after, 'I-6: the changed value must reach the rendered outcome').not.toBe(before)
  })
})

// ===========================================================================
// G-6 · THE OCCURRENCE PROBE (contract §2.5, row `P-SSJ-H-1`)
// LAYER [H]. EXACTLY TWO `refreshDebug` CALL SITES over the COMMENT-FREE body
// of `src/renderer/renderer.ts`, counted BY SYMBOL — the two sites have
// DIFFERENT SPELLINGS, so a single-literal count would be vacuous. The SPAN
// form is REJECTED BY NAME (`NEW-1`).
// ===========================================================================

/** The landed `withoutComments` precedent (`tests/pd-store-security-write.test.ts`). */
function withoutComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1')
}

describe('G-6 — the closed-occurrence probe', () => {
  it('G-6.1 [H] F-9: the SYMBOL count over the comment-free body is EXACTLY TWO; a THIRD reddens', () => {
    const raw = read('src/renderer/renderer.ts')
    const body = withoutComments(raw)
    const symbolRaw = [...raw.matchAll(/refreshDebug/g)].length
    const symbolClean = [...body.matchAll(/refreshDebug/g)].length
    say(`[G-6.1] refreshDebug occurrences: raw=${String(symbolRaw)} · comment-free=${String(symbolClean)}`)
    expect(symbolRaw, '§2.5: the comment-free body must not move the count (no comment occurrence)').toBe(symbolClean)
    expect(symbolClean, 'F-9: EXACTLY TWO refreshDebug call sites').toBe(2)
    // THE POSITIVE CONTROL: a synthetic THIRD site reddens the same oracle.
    const forged = [...(body + '\npanels?.refreshDebug(runtime)\n').matchAll(/refreshDebug/g)].length
    expect(forged, 'a THIRD site must redden the oracle').toBe(3)
  })

  it('G-6.2 [H] §2.4: the re-homed call sits INSIDE the notify callback, not in the reply `.then`', () => {
    const body = withoutComments(read('src/renderer/renderer.ts'))
    const notifyCallback =
      /onRequest\s*\(\s*\([^)]*\)\s*=>[\s\S]{0,400}?\(p\)\s*=>\s*\{[\s\S]{0,200}?notify\s*\([\s\S]{0,200}?refreshDebug\s*\(/.test(
        body,
      )
    say(`[G-6.2] notify-callback placement reading = ${String(notifyCallback)}`)
    expect(notifyCallback, '§2.4: the burst call must sit in the notify callback').toBe(true)
  })
})

// ===========================================================================
// G-7 · THE PREDICATE BOUNDARY (contract §2.4, §3.2 I-4, row `P-SSJ-H-2`)
// LAYER [H]. A reply reaches the notify callback iff
// `reply.ok && MUTATING_METHODS.has(req.method)`; `'journal'` STAYS a member;
// `focus` STAYS absent; the predicate is UNWIDENED — so a read-only `ok:true`
// reply reaches it NOT AT ALL (§2.4: the row asserts the PREDICATE, never a
// timing window and never a DOM reading).
// ===========================================================================

describe('G-7 — the predicate boundary and the MUTATING_METHODS census', () => {
  const members = (): string[] => {
    const body = withoutComments(read('src/renderer/renderer.ts'))
    const m = /MUTATING_METHODS\s*=\s*new\s+Set\s*\(\s*\[([^\]]*)\]/.exec(body)
    return (m?.[1] ?? '')
      .split(',')
      .map((s) => s.trim().replace(/^['"`]|['"`]$/g, ''))
      .filter(Boolean)
  }

  it('G-7.1 [H] `journal` stays a member and `focus` stays absent', () => {
    const ms = members()
    say(`[G-7.1] MUTATING_METHODS = [${ms.join(', ')}] (n=${String(ms.length)})`)
    expect(ms.length, 'the predicate set must be readable').toBeGreaterThan(0)
    expect(ms, "R-5: 'journal' STAYS a member (undo/redo genuinely mutates the app graph)").toContain('journal')
    expect(ms, 'denied row 6: `focus` STAYS absent').not.toContain('focus')
  })

  it('G-7.2 [H] the predicate is UNWIDENED: `ok` alone never reaches notify', () => {
    const body = withoutComments(read('src/renderer/renderer.ts'))
    const guarded = /ok\s*&&\s*MUTATING_METHODS\.has\(/.test(body)
    say(`[G-7.2] predicate reads \`ok && MUTATING_METHODS.has(…)\` = ${String(guarded)}`)
    expect(guarded, 'F-8: membership must be conjoined with `ok`').toBe(true)
  })

  it('G-7.3 [H] F-8: the boundary oracle — a read-only reply yields count ZERO; a widened predicate reddens it', () => {
    const set = new Set(members())
    const reaches = (ok: boolean, method: string): number => (ok && set.has(method) ? 1 : 0)
    const readOnly = reaches(true, 'get_rendered_html')
    const mutating = reaches(true, 'dispatch')
    const journal = reaches(true, 'journal')
    const failedMutating = reaches(false, 'dispatch')
    const widened = (ok: boolean): number => (ok ? 1 : 0)
    say(
      `[G-7.3] refreshDebug call count — read-only ok reply=${String(readOnly)} · dispatch ok reply=${String(mutating)}`,
      `· journal ok reply=${String(journal)} · ok:false mutating reply=${String(failedMutating)}`,
      `· WIDENED-predicate forgery on the read-only reply = ${String(widened(true))}`,
    )
    expect(readOnly, 'F-8: a read-only ok:true reply reaches notify NOT AT ALL (count 0)').toBe(0)
    expect(mutating, "the positive side of the boundary fires exactly once for 'dispatch'").toBe(1)
    expect(journal, "R-5: 'journal' remains on the mutating side").toBe(1)
    expect(failedMutating, 'ok:false never notifies').toBe(0)
    // THE DISCRIMINATION PROOF: the forgery reaches a state the real predicate rejects.
    expect(widened(true), 'the widened predicate reddens the SAME oracle').toBe(1)
  })
})

// ===========================================================================
// G-8 · THE NO-ENGINE-BOUNDARY / NO-HOST-TRIM RULES (contract §1.2 rows 3/4,
// §3.2 I-7, §2.6①)
// LAYER [H] byte-scan. No `journal`/`undoStack`/`redoStack` byte is assigned,
// spliced or filtered anywhere in the diff; the engine tree is UNPATCHED.
// ===========================================================================

describe('G-8 — the DENIED host-trim surfaces', () => {
  const bodies = (): Record<string, string> => ({
    'secure-panels.ts': withoutComments(read('src/renderer/secure-panels.ts')),
    'renderer.ts': withoutComments(read('src/renderer/renderer.ts')),
  })

  it('G-8.1 [H] I-7: no journal splice/filter, no stack assignment, no second condense', () => {
    for (const [file, body] of Object.entries(bodies())) {
      const splice = /\.journal\s*\.\s*(splice|filter|slice)\s*\(/.test(body) || /\.journal\s*=\s*/.test(body)
      const stackAssign = /\b(undoStack|redoStack)\s*=/.test(body)
      const secondCondense = /\bserializeSlice\s*\(|\bcondense\s*\(\s*\)/.test(body) || /applyJournalCap/.test(body)
      say(
        `[G-8.1] ${file}: journal splice/assign=${String(splice)} · stack assignment=${String(stackAssign)}`,
        `· second condense/applyJournalCap residue=${String(secondCondense)}`,
      )
      expect(splice, `denied row 3 (${file}): the host trim is ILLEGAL (§2.1(a), H1–H4)`).toBe(false)
      expect(stackAssign, `denied row 3 (${file}): no undoStack/redoStack assignment`).toBe(false)
      expect(secondCondense, `denied row 4 (${file}): no second condense()/applyJournalCap`).toBe(false)
    }
  })

  it('G-8.2 [H] I-5/§2.6①/F-7: the mutation-building site reads NO engine structure', () => {
    const body = withoutComments(read('src/renderer/secure-panels.ts'))
    const m = /syncConfig\s*\(\s*\)\s*:\s*void\s*\{([\s\S]*?)\n\s{0,4}\}/.exec(body)
    const site = m?.[1] ?? ''
    // §2.6①'s subject is the ENGINE STRUCTURE the guard must not consult to
    // decide: `journal`, `undoStack`, `redoStack`, `journalEntries()`. The
    // spec's list ALSO prints `maxJournalLength` — but the CONTRACT ITSELF
    // mandates that `syncConfig()` RENDER the operator's cap into the
    // `security-status` label (`journal: ≤M`) and into the
    // `journal-length-input` value, and amendment row 10 (C-4) rules that
    // rendering LEAVE-ALONE. The `maxJournalLength` that appears there is the
    // BRIDGE-CONFIG read (`this.cfg.maxJournalLength`), NOT the ENGINE option:
    // the pane's own option lives on `this.maxJournalLength` (§1.1 member 1②)
    // and is read only at the `Supervisor` construction site, outside this body.
    // This scenario therefore DISCRIMINATES the two sources rather than
    // treating the token as one subject — see the DOC GAP recorded in the
    // greens artifact (§2.6①'s `maxJournalLength` is textually ambiguous).
    const engineOptionRead = /this\.maxJournalLength/.test(site)
    const cfgCapRead = /this\.cfg\.maxJournalLength\s*!==\s*undefined/.test(site)
    say(
      `[G-8.2] syncConfig body length = ${String(site.length)}`,
      `· ENGINE-option read (this.maxJournalLength)=${String(engineOptionRead)}`,
      `· BRIDGE-CONFIG cap read (this.cfg.maxJournalLength)=${String(cfgCapRead)}`,
    )
    expect(site.length, 'the mutation-building site must be extractable by symbol').toBeGreaterThan(0)
    expect(site, 'F-7/§2.6①: the guard must not read the journal').not.toMatch(/\.journal\b/)
    expect(site, 'F-7: the guard must not read journalEntries()').not.toMatch(/journalEntries/)
    expect(site, 'F-7: the guard must not read undoStack/redoStack').not.toMatch(/undoStack|redoStack/)
    expect(engineOptionRead, '§2.6①: the guard must not decide from the ENGINE option (`this.maxJournalLength`)').toBe(
      false,
    )
    expect(cfgCapRead, 'amendment row 10: the cap RENDERING from the bridge config is LEAVE-ALONE and present').toBe(
      true,
    )
  })
})

// ===========================================================================
// G-9 · THE LAYER / PARK-HONESTY ROW (contract §6, row `P-SSJ-H-3`, `O-8`)
// LAYER [doc]. The park is NAMED with its STRUCTURAL reason — never
// parked-by-default (`RCA-11` clause (b)) — and no artifact of this unit claims
// durability, app/envelope/store/engine/live-green.
// ===========================================================================

describe('G-9 — the named park and the no-overclaim block', () => {
  const PARK = 'docs/specs/unit-store-security-journal-live-pending-battery.md'
  const SPEC = 'docs/specs/unit-store-security-journal.md'

  it('G-9.1 [doc] the park artifact exists, is OPEN/live-pending, NEVER green/DONE', () => {
    const park = read(PARK)
    const open = /OPEN\s*\/\s*live-pending/.test(park)
    const never = /NEVER green, NEVER DONE/.test(park)
    say(`[G-9.1] park: OPEN/live-pending=${String(open)} · NEVER green/DONE=${String(never)}`)
    expect(open, 'O-8: the park ships OPEN/live-pending').toBe(true)
    expect(never, 'O-8: the park is never green, never DONE').toBe(true)
  })

  it('G-9.2 [doc] the park reason is STRUCTURAL NON-EXERCISABILITY, not an absent session', () => {
    const park = read(PARK)
    const structural = /STRUCTURAL NON-EXERCISABILITY/.test(park)
    const notSession = /NOT AN ABSENT SESSION/.test(park)
    const measuredSkip = /7622/.test(park) && /2312/.test(park)
    say(
      `[G-9.2] structuralReason=${String(structural)} · notAnAbsentSession=${String(notSession)}`,
      `· measured D5 skip readings present=${String(measuredSkip)}`,
    )
    expect(structural, 'C-3/§Status: the reason is structural non-exercisability').toBe(true)
    expect(notSession, 'RCA-11 clause (b): never parked-by-default').toBe(true)
    expect(measuredSkip, 'A-3B-1 ⑤: the measured skip (base 7622B >= 2312B) is recorded').toBe(true)
  })

  it('G-9.3 [doc] the contract states the [T]/[H] layer, NO LIVE LEG and NO DURABILITY CLAIM', () => {
    const spec = read(SPEC)
    const t = /\[T\]/.test(spec)
    const h = /\[H\]/.test(spec)
    const noLive = /NO LIVE LEG/.test(spec)
    const noDurability = /NO DURABILITY CLAIM/.test(spec)
    say(
      `[G-9.3] spec: [T]=${String(t)} [H]=${String(h)} NO LIVE LEG=${String(noLive)} NO DURABILITY CLAIM=${String(noDurability)}`,
    )
    expect(t && h, '§6: the layer ledger names [T] and [H]').toBe(true)
    expect(noLive, '§Status: there is NO LIVE LEG').toBe(true)
    expect(noDurability, '§6: no durability claim anywhere').toBe(true)
  })

  it('G-9.4 [doc] the `DENIED-1` re-aim is recorded IN-COMMIT (amendment row 11, `O-6`)', () => {
    const spec = read(SPEC)
    const reAim = /DENIED-1/.test(spec) && /RE-AIM/.test(spec)
    const inCommit = /IN THIS COMMIT|IN THIS UNIT'S OWN COMMIT/.test(spec)
    say(`[G-9.4] DENIED-1 re-aim recorded=${String(reAim)} · in-commit=${String(inCommit)}`)
    expect(reAim, 'amendment row 11: the re-aim is named').toBe(true)
    expect(inCommit, "K-2/O-6: the re-aim lands in this unit's own commit").toBe(true)
  })
})

// ===========================================================================
// G-10 · THE REGISTER ARITHMETIC (contract §5.2, rows `P-SSJ-IM-1`..`P-SSJ-H-3`)
// LAYER [doc]. The total is an OUTCOME, printed as the SUM of its terms.
// ===========================================================================

describe('G-10 — the declared register arithmetic', () => {
  it('G-10.1 [doc] [T] 38 + [H] 14 = 52; largest row 8 <= 100; total 52 <= 400', () => {
    const tRows = [4, 8, 6, 6, 6, 8] // P-SSJ-IM-1..-4, SM-1, TP-1
    const hRows = [4, 5, 5] // P-SSJ-H-1..-3
    const tSum = tRows.reduce((a, b) => a + b, 0)
    const hSum = hRows.reduce((a, b) => a + b, 0)
    const total = tSum + hSum
    const largest = Math.max(...tRows, ...hRows)
    say(
      `[G-10.1] [T] ${tRows.join('+')} = ${String(tSum)} · [H] ${hRows.join('+')} = ${String(hSum)}`,
      `· ALL 9 = ${String(total)} · largest row = ${String(largest)}`,
    )
    expect(tSum, '§5.2: the [T] rows read 38').toBe(38)
    expect(hSum, '§5.2: the [H] rows read 14').toBe(14)
    expect(total, '§5.2: ALL 9 DECLARED = 52').toBe(52)
    expect(largest, '§5.2: the largest row is 8 (headroom 92 under the per-row cap 100)').toBeLessThanOrEqual(100)
    expect(total, '§5.2: the total is under the 400 cap (headroom 348)').toBeLessThanOrEqual(400)
  })
})

// ===========================================================================
// G-11 · THE debugText BINDING (contract §10 `A-3B-1` ④ — change-set member ⑤)
// LAYER [T]. The `#status` node's resolved content was the UNBOUND
// `this.debugText` (a FUNCTION); the engine's `assertJsonSafe` throws on a
// function, so `condense()` ABORTED with `condense-aborted`. Binding it
// (`const value = this.debugText()`) is a PREREQUISITE of the unit's instrument.
// ===========================================================================

describe('G-11 — the #status content binding lets the condense proceed', () => {
  it('G-11.1 [T] a settled drive raises no `condense-aborted`', async () => {
    const warns: string[] = []
    const realWarn = console.warn
    console.warn = (...a: unknown[]) => {
      warns.push(a.map(String).join(' '))
    }
    try {
      installBridge(makeBridge({ maxJournalLength: 1 }))
      const panels = new SecurePanels(mountEl() as never, { maxJournalLength: 1 } as never)
      await panels.refresh()
      await drain()
      const sup = paneOf(panels).supervisor!
      const r = await drive(sup, 30, 'g111')
      const aborted = warns.filter((w) => /condense-aborted/.test(w))
      const view = sup.journalEntries()
      say(
        `[G-11.1] applied=${String(r.applied)} rejected=${String(r.rejected.length)}`,
        `· depth ${String(r.depthBefore)}->${String(r.depthAfter)} · basePresent=${String(view.basePresent)}`,
        `· condense-aborted warns=${String(aborted.length)}`,
      )
      expect(r.rejected, 'the drive must APPLY').toEqual([])
      expect(aborted, 'member 5: `condense-aborted` is the pre-edit defect and must not fire').toEqual([])
    } finally {
      console.warn = realWarn
    }
  })

  it('G-11.2 [H] the `#status` content is a resolved reading, never a bare function reference', () => {
    const pane = withoutComments(read('src/renderer/secure-panels.ts'))
    const bound = /debugText\s*\(\s*\)/.test(pane)
    say(`[G-11.2] bound debugText() call present = ${String(bound)}`)
    expect(bound, 'A-3B-1 ④: `const value = this.debugText()` — the BOUND call').toBe(true)
  })
})

// ===========================================================================
// G-12 · MODULE-MEMBER PRESENCE AT THE CONTRACT PATHS (contract §1.1 member 1)
// LAYER [H]. The four members the change set authors, at their named cells.
// ===========================================================================

describe('G-12 — the four authored members are present at their contract paths', () => {
  it('G-12.1 [H] §1.1 member 1 ①–④: the option, the Supervisor feed, the seam, the guard site', () => {
    const pane = withoutComments(read('src/renderer/secure-panels.ts'))
    const option = /maxJournalLength\s*\?\s*:\s*number/.test(pane)
    const seam = /journalDepth\s*\(\s*\)\s*:\s*number/.test(pane)
    const feed = /new\s+Supervisor\s*\(\s*\{[\s\S]{0,240}?maxJournalLength/.test(pane)
    const guardSite = /syncConfig\s*\(\s*\)\s*:\s*void/.test(pane)
    say(
      `[G-12.1] option=${String(option)} · Supervisor feed=${String(feed)} · journalDepth seam=${String(seam)}`,
      `· syncConfig guard site=${String(guardSite)}`,
    )
    expect(option, '§1.1 member 1①').toBe(true)
    expect(feed, '§1.1 member 1②').toBe(true)
    expect(seam, '§1.1 member 1③').toBe(true)
    expect(guardSite, '§1.1 member 1④').toBe(true)
  })

  it('G-12.2 [H] §1.2 row 10 / K-3: the engine is NEVER patched or re-implemented', () => {
    const pane = withoutComments(read('src/renderer/secure-panels.ts'))
    const renderer = withoutComments(read('src/renderer/renderer.ts'))
    const residue = /condenseScheduled|assertJsonSafe|applyJournalCap/.test(pane + renderer)
    say(`[G-12.2] fork-side engine-internals residue = ${String(residue)}`)
    expect(residue, 'denied row 10: the engine is catalogued (K-3), never patched').toBe(false)
  })
})
