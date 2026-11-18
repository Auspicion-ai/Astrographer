// tests/integration/record-engine/client-holding-alias.test.ts — unit `B-3` `pane-update-channel` §5's ALIAS PIN, authored
// BEFORE any byte of the `copyReading` fix (RCA-1: the red set runs first and is REPORTED before implementation).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-3-pane-update-channel.md` §5 (`fill()` lands a COPY through the ONE new private
// helper: a new plain record over the source's OWN keys, each value copied by a bounded structural copy — plain records by own
// enumerable keys, arrays `slice`d, primitives passed through, depth-capped at 8, a non-plain object carried as-is rather than
// refused — TOTAL, and it never changes what is HELD: a malformed entry is still held and `displayOf` still judges it) and §6
// `r8` (`r8a`…`r8d`). The INFO it pins is `B2-ADV2-04` (`docs/L2/record-engine/crossing.md` §5): the client's held reading
// ALIASES the port's answer, so a caller can mutate what the client "holds" — and, one level up, a caller can mutate the
// authority the record arm's decisions are made from.
//
// THE FOUR SUB-ARMS, ONE `it`, ONE AGGREGATE `expect(problems, …)`:
//   `r8a` — MUTATING THE PORT'S ANSWER AFTER `fill()` CHANGES NOTHING THE CLIENT ANSWERS. A key `'tab-b'` added, an entry's
//           `documentId` rewritten and the nested `caret.anchor.path` pushed ⇒ `reading()`/`displayOf()` still answer the
//           ORIGINAL values.
//   `r8b` — THE OTHER DIRECTION: MUTATING THE HELD READING CHANGES NOTHING THE PORT ANSWERS. The held record gains a tab, an
//           entry is rewritten and the nested path is pushed ⇒ a SECOND `fill()` (a fresh read of the SAME port answer) still
//           answers the ORIGINAL bytes.
//   `r8c` — THE IDENTITY CONTROLS that make a same-object "copy" fail: `reading() !== answer`, `reading()[tab] !== answer[tab]`,
//           and the nested caret path is a DIFFERENT array (so a shallow copy that re-used the nested record fails too).
//   `r8d` — THE COPY IS NOT A RE-READ AND REFUSES NOTHING: the port's `read` is called exactly ONCE per `fill()`, a malformed
//           entry stays HELD (the reading carries it) while `displayOf` still answers `null` for it, and `fill()` never throws.
//
// WHAT THE PORT IS, AND WHY IT IS A FIXTURE: the port is STRUCTURAL and LOCAL (`src/renderer/display-client.ts`: `{ read,
// onChanged }`), so this row hands the client a plain object whose `read` answers the family's own SHAPE — nested records and a
// `caret.anchor.path` ARRAY, `src/main/record-engine/display-shape.ts`'s `DisplayEntry`/`DisplayCaret`/`DisplayView`,
// `READ` — and controls every mutation to the microtask. No store is constructed here and none is needed: the fault is the
// client's aliasing of an answer it was handed, and a real store would only add a second reason for the same reading.
//
// LAYER (MANDATORY, D-10 / `RCA-12`): every sub-arm here is ENVELOPE-class and PURE-adjacent — the REAL exported
// `createDisplayClient` and a structural port; no DOM, no runtime, no store, no Electron. What this layer can NEVER read,
// named so nobody quotes it: the CONSEQUENCE of the alias in a painted app (a caret restored at a position a caller rewrote in
// the renderer's own held reading) — that is `G8`'s live leg alone (`docs/L1/unit-b-3-pane-update-channel.md` §8), and no limb
// here asserts a rendered geometry, a computed style or a pointer (there is none to assert).
//
// NON-VACUITY (mandatory, stated per sub-arm in its own comment): every negative assertion carries a POSITIVE CONTROL beside it
// — the port's answer is shown to carry the mutation (so "the client did not change" is a reading of the copy and not of a
// mutation that never happened), the client is shown to answer the ORIGINAL entry NON-NULL (so `displayOf`'s answer is not a
// refusal), and `r8d`'s "exactly one read" is paired with a SECOND `fill()` counting a SECOND read (so the counter can move).
// Each sub-arm names WHICH MUTATION WOULD RED IT.
//
// REACHABILITY RULE (this file always COLLECTS and RUNS): `createDisplayClient` is LANDED, so it is imported statically; the
// copy that §5 ADDS is PRIVATE and has NO export (`record-engine`'s `N` stays 7), so this row NEVER reaches for a helper — it
// drives the PUBLIC `fill()`/`reading()`/`displayOf()` seams and reads what they answer. A missing export would be a NAMED
// problem, never a link error; here the module exists.
//
// WHAT THIS ROW DELIBERATELY DOES NOT DO: no network, no electron, no spawn, no `git`, no `vi.mock`, no temp files; it writes
// nothing and reads only the modules it imports. It does not re-assert what `client-holding.test.ts` already owns (failures vs
// absences, the four absent WORDS, the monotonic fill sequence, own-members-only access) — those rows stay as they are and this
// file is ADDITIVE beside them.
import { describe, it, expect } from 'vitest'

import { createDisplayClient } from '../../../src/renderer/display-client.js'

/** The port type, taken from the factory's own parameter so this file is not a second spelling of it. */
type DisplayPort = Parameters<typeof createDisplayClient>[0]
const portOf = (value: unknown): DisplayPort => value as DisplayPort

const fingerprint = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

const shown = (value: unknown): string => (value === undefined ? '(absent)' : fingerprint(value))

const TAB_A = 'tab-a'
const TAB_B = 'tab-b'

/** The family's own shape, nested exactly as `display-shape.ts` states it: an entry with a `rich` caret whose two edges carry a
 *  `path` ARRAY, plus a `view`. The nested array is the alias's sharpest carrier — a shallow copy shares it. */
interface Entry {
  documentId: string
  caret?: { kind: 'rich'; anchor: { path: number[]; offset: number }; focus: { path: number[]; offset: number }; focused: boolean }
  view?: { offset: number; section: string }
}

const originalEntry = (documentId: string): Entry => ({
  documentId,
  caret: {
    kind: 'rich',
    anchor: { path: [1, 2], offset: 3 },
    focus: { path: [4], offset: 0 },
    focused: true,
  },
  view: { offset: 10, section: 'section-one' },
})

interface Fixture {
  answer: Record<string, Entry>
  reads: () => number
  client: ReturnType<typeof createDisplayClient>
}

/** A counting port whose `read` answers the SAME live object every time — which is exactly what a bridge reader does, and what
 *  makes an alias observable. */
function fixture(initial: Record<string, Entry>): Fixture {
  const answer = initial
  let reads = 0
  const client = createDisplayClient(
    portOf({
      read: () => {
        reads += 1
        return answer
      },
      onChanged: () => () => undefined,
    }),
  )
  return { answer, reads: () => reads, client }
}

describe('client-holding-alias — the `B-2` INFO `B2-ADV2-04`: the held reading is a COPY, in both directions', () => {
  it('r8 — `fill()` lands a COPY: the port’s answer cannot rewrite what the client holds, the held reading cannot rewrite the port’s answer, and the copy is neither a re-read nor a refusal', async () => {
    // §6 `r8` (`r8a`…`r8d`), §5's copyReading law. LAYER: envelope-class — the REAL `createDisplayClient` over a structural
    // port; no DOM, no store, no runtime.
    // NON-VACUITY: each direction asserts the MUTATION LANDED where it was aimed (the port's answer really carries `'tab-b'`,
    // the rewritten `documentId` and the pushed path; the held reading really carries its own mutations) before asserting the
    // other side did not move; `displayOf`'s answers are paired with a non-null control on the UNMUTATED entry; and the read
    // counter is paired with a second `fill()`.
    // MUTATION THAT WOULD RED IT: `fill()` assigning the port's own object (`held = next`, the shipped fault) reds `r8a` and
    // `r8b`; a SHALLOW copy (`{...next}` only) reds `r8c`'s nested-path arm and `r8a`'s `caret.anchor.path` arm; a copy that
    // re-reads the port reds `r8d`'s "exactly one read"; a copy that DROPS or refuses a member reds `r8d`'s "the malformed entry
    // stays held"; a copy that refuses the whole reading reds `r8a`'s non-null control.
    const problems: string[] = []

    // ═══ r8a — MUTATE THE PORT'S ANSWER AFTER `fill()` ═══════════════════════════════════════════
    {
      const f = fixture({ [TAB_A]: originalEntry('doc-a') })
      const filled = (await f.client.fill()) as Record<string, unknown> | null
      if (filled === null) {
        problems.push(
          '(r8a) the boot read answered `null` over a port that answers a lawful record — with no reading held, every "the client ' +
            'did not change" below would be satisfied by a client that holds nothing at all',
        )
      }
      if (f.reads() !== 1) {
        problems.push(`(r8a) the port's \`read\` was called ${f.reads()} time(s) for one \`fill()\`, not exactly 1`)
      }
      // THE MUTATIONS, aimed where the finding says they land: a new tab id, a rewritten stamp, a pushed nested path.
      f.answer[TAB_B] = originalEntry('doc-b')
      f.answer[TAB_A]!.documentId = 'doc-rewritten'
      f.answer[TAB_A]!.caret!.anchor.path.push(99)
      // THE POSITIVE CONTROL: the port's own answer carries all three (so the mutations really happened where they were aimed).
      const portNow = fingerprint(f.answer)
      if (!portNow.includes(TAB_B) || !portNow.includes('doc-rewritten') || !portNow.includes('99')) {
        problems.push(`(r8a) the harness's own mutation did not land on the port's answer (${portNow}) — the arm has no subject`)
      }

      const held = f.client.reading() as Record<string, unknown> | null
      if (held === null) {
        problems.push('(r8a) `reading()` answered `null` after a successful `fill()` — the shape must stand')
      } else {
        if (Object.hasOwn(held, TAB_B)) {
          problems.push(
            `(r8a) the client's held reading carries a \`${TAB_B}\` key it was never read with — a caller who mutates the PORT'S ` +
              `ANSWER has authored what "the client holds" (the \`B2-ADV2-04\` alias §5 closes)`,
          )
        }
        const heldEntry = held[TAB_A] as Entry | undefined
        if (heldEntry === undefined) {
          problems.push(`(r8a) the held reading ${shown(held)} lost \`${TAB_A}\` when the port's answer was mutated — the copy must be total`)
        } else {
          if (heldEntry.documentId !== 'doc-a') {
            problems.push(
              `(r8a) the held entry's \`documentId\` reads ${shown(heldEntry.documentId)} after the port's answer was rewritten to ` +
                `\`doc-rewritten\` — §5: \`fill()\` lands a COPY, so the original bytes stand`,
            )
          }
          const heldPath = heldEntry.caret?.anchor?.path
          if (!Array.isArray(heldPath) || fingerprint(heldPath) !== fingerprint([1, 2])) {
            problems.push(
              `(r8a) the held entry's NESTED \`caret.anchor.path\` reads ${shown(heldPath)} after the port's answer was pushed with ` +
                `\`99\` — a copy that shares the nested array is not a copy (§5's bounded structural copy slices arrays)`,
            )
          }
        }
      }
      // THE ACCESSOR AGREES WITH THE SHAPE, AND IT IS NOT A REFUSAL.
      const entry = f.client.displayOf(TAB_A)
      if (entry === null) {
        problems.push(
          `(r8a) \`displayOf('${TAB_A}')\` answered \`null\` — the held entry is lawful, so this must be the admitted entry and not ` +
            `a refusal (a client that answered \`null\` everywhere would pass every "did not change" arm for the wrong reason)`,
        )
      } else {
        if ((entry as Entry).documentId !== 'doc-a') {
          problems.push(`(r8a) \`displayOf('${TAB_A}')\` answers the stamp ${shown((entry as Entry).documentId)}, not the original \`doc-a\``)
        }
        const entryPath = (entry as Entry).caret?.anchor?.path
        if (!Array.isArray(entryPath) || fingerprint(entryPath) !== fingerprint([1, 2])) {
          problems.push(`(r8a) \`displayOf('${TAB_A}')\` answers the caret path ${shown(entryPath)}, not the original [1, 2]`)
        }
      }
      if (f.client.displayOf(TAB_B) !== null) {
        problems.push(`(r8a) \`displayOf('${TAB_B}')\` answered an entry — the tab was only ever in the PORT'S answer, never in the client's reading`)
      }
    }

    // ═══ r8b — MUTATE THE HELD READING, THEN READ THE PORT AGAIN ═════════════════════════════════
    {
      const f = fixture({ [TAB_A]: originalEntry('doc-a') })
      const portBytesBefore = fingerprint(f.answer)
      await f.client.fill()
      const held = f.client.reading() as Record<string, unknown> | null
      if (held === null) {
        problems.push('(r8b) `reading()` answered `null` after a successful `fill()` — the reverse direction has no subject')
      } else {
        // THE MUTATIONS, aimed at what the client HOLDS.
        held[TAB_B] = originalEntry('doc-held')
        const heldEntry = held[TAB_A] as Entry
        if (heldEntry === undefined) {
          problems.push(`(r8b) the held reading ${shown(held)} carries no \`${TAB_A}\` — the reverse arm has no entry to mutate`)
        } else {
          heldEntry.documentId = 'doc-held'
          heldEntry.caret!.anchor.path.push(77)
        }
        // THE POSITIVE CONTROL: the held reading really carries them.
        const heldNow = fingerprint(held)
        if (!heldNow.includes(TAB_B) || !heldNow.includes('doc-held') || !heldNow.includes('77')) {
          problems.push(`(r8b) the harness's own mutation of the HELD reading did not land (${heldNow}) — the arm has no subject`)
        }

        const second = (await f.client.fill()) as Record<string, unknown> | null
        if (second === null) {
          problems.push('(r8b) the second `fill()` answered `null` — the port answers the same record as the first read')
        } else {
          if (Object.hasOwn(second, TAB_B)) {
            problems.push(
              `(r8b) a SECOND read of the port answers a \`${TAB_B}\` key — mutating the HELD reading wrote through to the port's ` +
                `answer, which is the same alias from the other side (§5/\`B2-ADV2-04\`)`,
            )
          }
          const secondEntry = second[TAB_A] as Entry | undefined
          if (secondEntry === undefined) {
            problems.push(`(r8b) the second read ${shown(second)} carries no \`${TAB_A}\``)
          } else {
            if (secondEntry.documentId !== 'doc-a') {
              problems.push(
                `(r8b) a SECOND read of the port answers \`documentId\` = ${shown(secondEntry.documentId)}, not the original ` +
                  `\`doc-a\` — the client's held reading is not the port's object`,
              )
            }
            const secondPath = secondEntry.caret?.anchor?.path
            if (!Array.isArray(secondPath) || fingerprint(secondPath) !== fingerprint([1, 2])) {
              problems.push(
                `(r8b) a SECOND read of the port answers the caret path ${shown(secondPath)}, not [1, 2] — the held copy's nested ` +
                  `array is the port's array`,
              )
            }
          }
        }
        // THE FLOOR: the port's own answer is still the bytes it always was.
        if (fingerprint(f.answer) !== portBytesBefore) {
          problems.push(
            `(r8b) the port's own answer reads ${fingerprint(f.answer)} after the held reading was mutated, not ${portBytesBefore} — ` +
              `a caller that mutates what the client "holds" has rewritten the realm's answer`,
          )
        }
      }
    }

    // ═══ r8c — THE IDENTITY CONTROLS ══════════════════════════════════════════════════════════════
    {
      const f = fixture({ [TAB_A]: originalEntry('doc-a') })
      await f.client.fill()
      const held = f.client.reading() as Record<string, unknown> | null
      if (held === null) {
        problems.push('(r8c) `reading()` answered `null` after a successful `fill()` — the identity controls have no subject')
      } else {
        if (held === (f.answer as unknown)) {
          problems.push(
            '(r8c) `reading()` IS the port\'s answer object (`===`) — §5: `fill()` lands a COPY, so this identity must be false and ' +
              'every "did not change" arm above is satisfied only by a client that never held the answer',
          )
        }
        const heldEntry = held[TAB_A]
        const answerEntry = f.answer[TAB_A]
        if (heldEntry === (answerEntry as unknown)) {
          problems.push(
            `(r8c) \`reading()['${TAB_A}']\` IS the port answer's own entry object — a copy of the outer record that shares its ` +
              `entries is a shallow copy, and §5 copies a member at a time`,
          )
        }
        const heldPath = (heldEntry as Entry | undefined)?.caret?.anchor?.path
        const answerPath = answerEntry?.caret?.anchor?.path
        if (Array.isArray(heldPath) && Array.isArray(answerPath) && heldPath === answerPath) {
          problems.push(
            '(r8c) the NESTED `caret.anchor.path` array is the SAME array on both sides — the structural copy §5 adds SLICES arrays, ' +
              'so a nested array cannot be shared (this is the arm a `{...next}` shallow copy fails)',
          )
        }
        if (!Array.isArray(heldPath) || !Array.isArray(answerPath)) {
          problems.push(
            `(r8c) one of the two caret paths is not an array (held ${shown(heldPath)}, answer ${shown(answerPath)}) — the nested ` +
              `carrier this row grades is absent, so the identity controls would be vacuous`,
          )
        } else if (fingerprint(heldPath) !== fingerprint(answerPath)) {
          problems.push(`(r8c) the two caret paths hold different VALUES (${shown(heldPath)} vs ${shown(answerPath)}) before any mutation — the control is not a control`)
        }
        const heldView = (heldEntry as Entry | undefined)?.view
        if (heldView !== undefined && heldView === answerEntry?.view) {
          problems.push('(r8c) the nested `view` record is the SAME object on both sides — every stated member is copied, not only the caret')
        }
        // THE POSITIVE CONTROL: the copy is a record of the SAME VALUE (a copy, never a re-derivation).
        if (fingerprint(held) !== fingerprint(f.answer)) {
          problems.push(
            `(r8c) the held reading ${shown(held)} is not EQUAL IN VALUE to the port's answer ${fingerprint(f.answer)} — the copy ` +
              `changes the object identity, never the bytes`,
          )
        }
      }
    }

    // ═══ r8d — THE COPY IS NOT A RE-READ, AND IT REFUSES NOTHING ═════════════════════════════════
    {
      const f = fixture({ [TAB_A]: originalEntry('doc-a') })
      await f.client.fill()
      if (f.reads() !== 1) {
        problems.push(
          `(r8d) the port's \`read\` was called ${f.reads()} time(s) for ONE \`fill()\` — the copy is taken from the answer already ` +
            `read, so a copy that re-read the port is a second read per fill (and a second authority for the shape)`,
        )
      }
      // the counter's own control: a SECOND fill is a SECOND read (stated, not once-only).
      await f.client.fill()
      if (f.reads() !== 2) {
        problems.push(`(r8d) a SECOND \`fill()\` left the read count at ${f.reads()}, not 2 — the counter cannot move, so the "exactly one" arm above is vacuous`)
      }

      // AND IT REFUSES NOTHING: a MALFORMED entry stays HELD, and `displayOf` still answers `null` for it (the family's parse
      // judges it AT THE ACCESSOR, never at the copy).
      const malformed = fixture({
        [TAB_A]: originalEntry('doc-a'),
        'tab-bad': { documentId: 7 } as unknown as Entry,
      })
      const read = (await malformed.client.fill()) as Record<string, unknown> | null
      if (read === null) {
        problems.push('(r8d) a reading carrying ONE malformed entry was REFUSED whole — §5: the copy is TOTAL and `displayOf` is where the family parses')
      } else {
        if (!Object.hasOwn(read, 'tab-bad')) {
          problems.push(
            `(r8d) the malformed entry \`tab-bad\` is NOT in the held reading (${shown(read)}) — §5: "a malformed entry is still held ` +
            `(the family's parse judges it at \`displayOf\`)"`,
          )
        }
        const bad = malformed.client.displayOf('tab-bad')
        if (bad !== null) {
          problems.push(`(r8d) \`displayOf('tab-bad')\` answered ${shown(bad)}, not \`null\` — \`documentId: 7\` is outside the family's domain`)
        }
        const good = malformed.client.displayOf(TAB_A)
        if (good === null) {
          problems.push(`(r8d) \`displayOf('${TAB_A}')\` answered \`null\` beside the malformed entry — the parse is per ENTRY, never per reading`)
        }
        // the held malformed member is carried VERBATIM (the copy neither repaired nor dropped it)
        if (fingerprint(read['tab-bad']) !== fingerprint({ documentId: 7 })) {
          problems.push(`(r8d) the held malformed entry reads ${shown(read['tab-bad'])}, not the bytes the port answered — the copy never coerces`)
        }
      }
      let fillThrew = ''
      try {
        await malformed.client.fill()
      } catch (error) {
        fillThrew = String(error)
      }
      if (fillThrew !== '') {
        problems.push(`(r8d) \`fill()\` over a reading with a malformed entry THREW (${fillThrew}) — the copy is TOTAL and \`fill()\` never throws`)
      }
    }

    expect(
      problems,
      `limb r8 — the alias pin (§6 r8; §5's \`copyReading\`; the \`B2-ADV2-04\` INFO). ${problems.length} problem(s). §5 exists because ` +
        `"the record arm's decision is made off \`client.reading()\`", so an ALIASED held reading is a caller-writable authority over ` +
        `what the client holds: \`fill()\` must land a COPY, total (a malformed entry is still held, \`displayOf\` still answers ` +
        `\`null\`), that never re-reads the port, in BOTH directions. ` +
        `envelope-class — the REAL \`createDisplayClient\` over a structural port; no DOM, no store, no runtime, and no rendered ` +
        `caret, geometry, computed style or pointer (G8-only)`,
    ).toEqual([])
  })
})
