// tests/integration/gnosis-changes/pane-change-arm.test.ts — unit `B-4` `engine-changes`'s RENDERER-CHANNEL rows: the CHANGE arm
// on `B-3`'s ONE registry (`c10`) and `INV-E` read structurally (`c11`). Authored BEFORE the addition exists (RCA-1).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4-engine-changes.md` §4 and §5 —
//   §4   "The module today is ONE registry with TWO declarations and ONE dispatch … This unit adds a THIRD declaration on the SAME
//          registry — `subscribeChange(paneId, handler)` (i.e. `subscribe` + a change-interest mark) and `publishChange():
//          FireReport[]` (one pass over the change-interested panes, dispatched THROUGH `fire`, never a second dispatch) plus
//          `changePanes(): string[]` (a COPY). **The push stays payload-free**."
//         "The change-interest census is EMPTY at this head, and it is a DECLARATION … no pane declares engine-change interest until
//          `B-6` and `B-8`."
//   `c10` "`publishChange()` fires ONLY the panes that declared change interest, ONCE EACH, through `fire` (the SAME handler
//          instance invoked, identity not count); a pane registered by plain `subscribe` is UNTOUCHED by it; an empty census
//          answers `[]` (not a throw); the release is total and idempotent; `changePanes()` answers a COPY; and the frozen value is
//          frozen. Control: `subscribeChange` moves the census, so the empty arm is not a vacuous one."
//   `c11` "A SOURCE clause grades `pane-events.ts` for 0 occurrences of the three re-assembly entries (`loadAppGraph`,
//          `mountOperator`, `refresh(`) AND for containing no host/runtime reference, with a mutant that adds a `refresh()` call
//          driven to `false` first — so the clause can fail."
//
// THE "THROUGH `fire`" LIMB IS PROVEN STRUCTURALLY, NOT BY INTENTION: a handler registered with plain `subscribe` on an id that
// ALSO holds a change-interested registration IS called by `publishChange()` (because `publishChange` fires the PANE through the
// one registry), while a pane that holds ONLY plain subscriptions is never reached. A second dispatch, however faithful, cannot
// produce both readings at once — and the plain-handler call is exactly the observable that names the mechanism.
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS and PURE — no DOM, no host, no runtime, no Electron. `c11` is a TEXT reading with comments
// stripped, plus a MUTANT driven to `false` first. The assembled-app repaint is `B-6`/`B-8`'s limb and NO pane adopts this arm at
// this head; nothing here claims a pane repaints.
//
// NON-VACUITY: the empty-census limb is floored by the control that MOVES the census, the "untouched" limb by the same-id limb,
// and the source clause by its mutant.
import { describe, it, expect } from 'vitest'

import { createPaneEvents } from '../../../src/renderer/pane-events.js'
import type { FireReport } from '../../../src/renderer/pane-events.js'
import { occurrences, readText, shown, stripComments } from './harness.js'

const PANE_EVENTS_FILE = 'src/renderer/pane-events.ts'

/** The ADDITION's surface, read off the shipped value — a missing member is a NAMED problem, never a `TypeError`. */
interface ChangeArm {
  subscribeChange?: (paneId: string, handler: (report: FireReport) => void) => () => void
  publishChange?: () => FireReport[]
  changePanes?: () => string[]
}

const changeArmOf = (channel: unknown): ChangeArm => (channel ?? {}) as ChangeArm

describe('B-4 §5 `c10` — the CHANGE arm: one registry, one dispatch', () => {
  it('c10(a) — the shipped change-interest census is EMPTY and the channel is FROZEN', () => {
    // MUTATION THAT WOULD RED IT: a shipped non-empty census (a pane adopting the arm ahead of B-6/B-8), or an unfrozen value a
    // caller could re-author.
    const problems: string[] = []
    const channel = createPaneEvents()
    const arm = changeArmOf(channel)
    if (typeof arm.changePanes !== 'function') {
      problems.push(`c10(a): \`changePanes\` is ${shown(arm.changePanes)} — §4 adds the census to the ONE registry`)
    } else if (JSON.stringify(arm.changePanes()) !== '[]') {
      problems.push(`c10(a): the shipped change-interest census reads ${shown(arm.changePanes())} — §4: EMPTY at this head, and that is a DECLARATION`)
    }
    if (!Object.isFrozen(channel)) problems.push('c10(a): the channel is NOT frozen — `pane-events.ts:181` freezes it and the addition must not change that')
    if (typeof arm.publishChange !== 'function') problems.push(`c10(a): \`publishChange\` is ${shown(arm.publishChange)} — §4 adds the dispatch`)
    if (typeof arm.subscribeChange !== 'function') problems.push(`c10(a): \`subscribeChange\` is ${shown(arm.subscribeChange)} — §4 adds the declaration`)
    expect(problems, `c10(a):\n${problems.join('\n')}`).toEqual([])
  })

  it('c10(b) — `subscribeChange` MOVES the census (so the empty arm is not vacuous) and `changePanes()` is a COPY', () => {
    // MUTATION THAT WOULD RED IT: a census that answers the internal array (a caller could then author who is published), or a
    // declaration that never joins the census (the arm could then never fire).
    const problems: string[] = []
    const channel = createPaneEvents()
    const arm = changeArmOf(channel)
    if (typeof arm.subscribeChange !== 'function' || typeof arm.changePanes !== 'function') {
      problems.push('c10(b): the change arm is absent, so its census cannot be driven')
    } else {
      const release = arm.subscribeChange('doc-nav', () => undefined)
      if (JSON.stringify(arm.changePanes()) !== JSON.stringify(['doc-nav'])) {
        problems.push(`c10(b): after one \`subscribeChange('doc-nav', …)\` the census reads ${shown(arm.changePanes())} — exactly ['doc-nav'] is required`)
      }
      const first = arm.changePanes()
      first.push('smuggled')
      if (JSON.stringify(arm.changePanes()) !== JSON.stringify(['doc-nav'])) {
        problems.push(`c10(b): mutating the census answer moved the channel (it now reads ${shown(arm.changePanes())}) — §4 requires a COPY`)
      }
      if (typeof release === 'function') release()
      if (typeof release === 'function' && JSON.stringify(arm.changePanes()) !== '[]') {
        problems.push(`c10(b): the release left the census at ${shown(arm.changePanes())} — the release is TOTAL`)
      }
    }
    expect(problems, `c10(b):\n${problems.join('\n')}`).toEqual([])
  })

  it('c10(c) — `publishChange()` fires ONLY the change-interested panes, once each, through `fire` (the same handler instance)', () => {
    // MUTATION THAT WOULD RED IT: a second dispatch that calls only the marked handlers on the id (the same-id plain handler below
    // would NOT be called), or one that fires every pane in `panes()` (the plain-only pane below WOULD be called).
    const problems: string[] = []
    const channel = createPaneEvents()
    const arm = changeArmOf(channel)
    if (typeof arm.subscribeChange !== 'function' || typeof arm.publishChange !== 'function') {
      problems.push('c10(c): the change arm is absent, so its dispatch cannot be driven')
    } else {
      const seen: string[] = []
      const changeHandler = (report: FireReport): void => {
        seen.push(`change:${report.paneId}`)
      }
      const plainOnSameId = (report: FireReport): void => {
        seen.push(`plain-same-id:${report.paneId}`)
      }
      const plainElsewhere = (report: FireReport): void => {
        seen.push(`plain-elsewhere:${report.paneId}`)
      }
      arm.subscribeChange('doc-nav', changeHandler)
      channel.subscribe('doc-nav', plainOnSameId)
      channel.subscribe('search', plainElsewhere)
      const reports = arm.publishChange()
      if (seen.filter((s) => s === 'change:doc-nav').length !== 1) {
        problems.push(`c10(c): the change handler ran ${seen.filter((s) => s === 'change:doc-nav').length} time(s) — §5 c10 requires ONCE EACH`)
      }
      // THE MECHANISM: `publishChange` reaches the pane THROUGH `fire`, so the plain registration on the SAME id is fired too.
      if (seen.filter((s) => s === 'plain-same-id:doc-nav').length !== 1) {
        problems.push(
          'c10(c): a plain `subscribe` on the SAME id was NOT fired by `publishChange()` — §4 requires the dispatch to go THROUGH ' +
            '`fire`; a second dispatch that calls only the marked handlers produces exactly this reading',
        )
      }
      if (seen.some((s) => s.startsWith('plain-elsewhere'))) {
        problems.push(`c10(c): a pane with ONLY plain subscriptions was fired (${shown(seen)}) — §5 c10: "a pane registered by plain subscribe is UNTOUCHED"`)
      }
      if (!Array.isArray(reports) || reports.length !== 1) {
        problems.push(`c10(c): \`publishChange()\` answered ${shown(reports)} — one report per change-INTERESTED pane (1 here)`)
      } else if (reports[0]?.paneId !== 'doc-nav' || reports[0]?.fired !== true) {
        problems.push(`c10(c): the report reads ${shown(reports[0])} — the change-interested pane's own FireReport is required`)
      }
    }
    expect(problems, `c10(c):\n${problems.join('\n')}`).toEqual([])
  })

  it('c10(d) — the release is TOTAL and IDEMPOTENT, and `publishChange()` with no declarations answers `[]` (never a throw)', () => {
    // MUTATION THAT WOULD RED IT: a release that throws on a second call or on an unknown id, a `publishChange` that throws on an
    // empty census, or one that answers `undefined`.
    const problems: string[] = []
    const channel = createPaneEvents()
    const arm = changeArmOf(channel)
    if (typeof arm.publishChange === 'function') {
      let empty: unknown
      try {
        empty = arm.publishChange()
      } catch (err) {
        problems.push(`c10(d): \`publishChange()\` THREW on an empty census (${err instanceof Error ? err.message : String(err)}) — §5 c10 requires []`)
      }
      if (empty !== undefined && JSON.stringify(empty) !== '[]') {
        problems.push(`c10(d): \`publishChange()\` on an empty census answered ${shown(empty)} — §5 c10 requires []`)
      }
    } else {
      problems.push('c10(d): `publishChange` is absent')
    }
    if (typeof arm.subscribeChange === 'function' && typeof arm.changePanes === 'function') {
      const release = arm.subscribeChange('settings', () => undefined)
      try {
        release()
        release()
      } catch (err) {
        problems.push(`c10(d): a second release THREW (${err instanceof Error ? err.message : String(err)}) — the release is total and idempotent`)
      }
      if (JSON.stringify(arm.changePanes()) !== '[]') problems.push(`c10(d): two releases left the census at ${shown(arm.changePanes())} — twice is once`)
    }
    expect(problems, `c10(d):\n${problems.join('\n')}`).toEqual([])
  })

  it('c10(e) — a HOSTILE change handler starves no other (the `fire` containment), and an unaddressable id joins nothing', () => {
    // MUTATION THAT WOULD RED IT: a dispatch with its own loop and no per-call `try`/`catch` (the `pane-events.ts:123-129` rule that
    // `publishChange` must inherit by going through `fire`).
    const problems: string[] = []
    const channel = createPaneEvents()
    const arm = changeArmOf(channel)
    if (typeof arm.subscribeChange !== 'function' || typeof arm.publishChange !== 'function') {
      problems.push('c10(e): the change arm is absent')
    } else {
      let healthy = 0
      arm.subscribeChange('doc-nav', () => {
        throw new Error('hostile handler')
      })
      arm.subscribeChange('search', () => {
        healthy += 1
      })
      try {
        const reports = arm.publishChange()
        if (healthy !== 1) problems.push(`c10(e): the healthy change handler ran ${healthy} time(s) — one thrower must starve nobody`)
        if (!Array.isArray(reports) || reports.length !== 2) problems.push(`c10(e): \`publishChange()\` answered ${shown(reports)} — two interested panes are owed two reports`)
      } catch (err) {
        problems.push(`c10(e): \`publishChange()\` THREW across a hostile handler (${err instanceof Error ? err.message : String(err)}) — the containment is ` + '`fire`\'s own')
      }
      const before = typeof arm.changePanes === 'function' ? arm.changePanes().length : 0
      arm.subscribeChange('', () => undefined)
      arm.subscribeChange(null as unknown as string, () => undefined)
      const after = typeof arm.changePanes === 'function' ? arm.changePanes().length : 0
      if (after !== before) problems.push(`c10(e): an unaddressable id entered the census (${before} → ${after}) — §2's ` + '`addressable` rule refuses it at both entries')
    }
    expect(problems, `c10(e):\n${problems.join('\n')}`).toEqual([])
  })

  it('c10(f) — `B-3`\'s two landed arms are INTACT: `recordPanes()` stays `[]`, `deliver()` still reaches its record pane through `fire`, `fire` is unchanged', () => {
    // MUTATION THAT WOULD RED IT: a change arm that shares the RECORD mark's set (a `subscribeChange` would then make the pane a
    // record reader, and `deliver()` would fire it), or a `deliver()` body that stops reaching `fire`.
    const problems: string[] = []
    const channel = createPaneEvents()
    const arm = changeArmOf(channel)
    if (JSON.stringify(channel.recordPanes()) !== '[]') {
      problems.push(`c10(f): \`recordPanes()\` reads ${shown(channel.recordPanes())} — the shipped record census is EMPTY (B-3's declaration)`)
    }
    let recordHits = 0
    channel.subscribeRecord('template-editor', () => {
      recordHits += 1
    })
    const delivered = channel.deliver()
    if (recordHits !== 1) problems.push(`c10(f): \`deliver()\` reached the record pane ${recordHits} time(s) — B-3's record arm is byte-identical`)
    if (!Array.isArray(delivered) || delivered.length !== 1) problems.push(`c10(f): \`deliver()\` answered ${shown(delivered)} — one report per record-interested pane`)
    // THE SEPARATION: a CHANGE declaration must NOT make a pane a record reader.
    if (typeof arm.subscribeChange === 'function') {
      let changeHits = 0
      arm.subscribeChange('doc-nav', () => {
        changeHits += 1
      })
      if (JSON.stringify(channel.recordPanes()) !== JSON.stringify(['template-editor'])) {
        problems.push(`c10(f): after \`subscribeChange\` the RECORD census reads ${shown(channel.recordPanes())} — the two marks are different marks`)
      }
      const second = channel.deliver()
      if (changeHits !== 0) problems.push(`c10(f): \`deliver()\` fired a CHANGE-interested pane (${changeHits} hit(s)) — the arms must not converge`)
      if (second.some((r) => r.paneId === 'doc-nav')) problems.push('c10(f): the record arm emitted a report for a change-only pane')
    }
    const fireReport = channel.fire('nobody')
    if (fireReport?.fired !== false || fireReport?.reason !== 'no-listener') {
      problems.push(`c10(f): \`fire('nobody')\` answered ${shown(fireReport)} — B-3's declared no-op must be byte-identical`)
    }
    expect(problems, `c10(f):\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4 §5 `c11` — `INV-E` read STRUCTURALLY: the channel module can re-assemble nothing', () => {
  it('c11 — 0 `loadAppGraph`, 0 `mountOperator`, 0 `refresh(` and no host/runtime reference in `pane-events.ts`, with the clause driven FALSE by a mutant first', () => {
    // MUTATION THAT WOULD RED IT: any of the three re-assembly entries appearing in the module (a handler that answers an engine
    // change by rebuilding), or a host/runtime reference at all. The mutant below proves the clause CAN fail.
    const clause = (text: string): boolean => {
      const code = stripComments(text)
      return (
        occurrences(code, 'loadAppGraph') === 0 &&
        occurrences(code, 'mountOperator') === 0 &&
        occurrences(code, 'refresh(') === 0 &&
        occurrences(code, 'host.') === 0 &&
        occurrences(code, 'runtime.') === 0 &&
        occurrences(code, 'require(') === 0 &&
        occurrences(code, "from 'electron'") === 0
      )
    }
    const problems: string[] = []
    let real = ''
    try {
      real = readText(PANE_EVENTS_FILE)
    } catch (err) {
      problems.push(`c11: \`${PANE_EVENTS_FILE}\` could not be read (${err instanceof Error ? err.message : String(err)})`)
    }
    if (real !== '') {
      // ONE MUTANT PER CONJUNCT, because a mutant that carries two needles cannot isolate either: `host.refresh()` alone would not
      // distinguish the `host.` clause from the `refresh(` clause (the independent gates measured exactly that gap), so the bare
      // `refresh()` mutant below is what gives the third conjunct its own teeth, and `runtime.` / `require(` / `from 'electron'`
      // each get their own spelling too — every conjunct must be able to turn the clause FALSE on its own.
      const mutants = [
        `${real}\nconst smuggled = () => host.refresh()\n`, // both needles: the historical mutant, kept
        `${real}\nconst smuggled = () => refresh()\n`, // ISOLATES `refresh(` — no `host.`, no other needle
        `${real}\nconst smuggled = () => loadAppGraph()\n`,
        `${real}\nconst smuggled = () => mountOperator()\n`,
        `${real}\nconst smuggled = () => runtime.mount()\n`, // ISOLATES `runtime.`
        `${real}\nconst smuggled = require('electron')\n`, // ISOLATES `require(`
        `${real}\nimport { ipcMain } from 'electron'\n`, // ISOLATES `from 'electron'`
      ]
      for (const mutant of mutants) {
        if (clause(mutant)) {
          problems.push(`c11: the clause answered TRUE for a mutant that re-assembles (\`${mutant.slice(real.length).trim()}\`) — the clause cannot fail`)
        }
      }
      if (!clause(real)) {
        problems.push(`c11: \`${PANE_EVENTS_FILE}\` carries a re-assembly entry or a host/runtime reference — §4: "INV-E applies and is STRUCTURAL here, not measured-by-intent"`)
      }
    }
    expect(problems, `c11:\n${problems.join('\n')}`).toEqual([])
  })
})
