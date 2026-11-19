// tests/unit/gnosis-changes/change-frame-map.test.ts — unit `B-4` `engine-changes`'s PURE rows: the mapping (`c2`), the kind
// table (`c3`'s 20-token limb), and the frame refusals (§2.1/§2.2). Authored BEFORE any byte of `src/main/engine-changes.ts`
// exists (RCA-1: the red set runs first and is REPORTED before implementation).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4-engine-changes.md` —
//   §2.1  the two frame families. `event: cursor` is a POSITION (`{"type":"cursor","cursor":"<decimal>"}`, `README` the
//         engine's own cursor-first frame); `event: change` is the exact SEVEN-key body; ANYTHING ELSE — a `result|done|error`
//         label, a label/data-type mismatch, malformed JSON, a missing/extra key, a wrong type, a non-decimal cursor — is a
//         TYPED FRAME REFUSAL: never a fabricated descriptor, never a stream teardown (`../Gnosis/docs/specs/u4-cursor-paged-reads.md:521-524`).
//   §2.2  the mapping. EXACTLY four keys `{kind, nodeIds, edgeIds, store}`; `nodeIds`/`edgeIds` carried VERBATIM (identity, no
//         copy, no parse, no re-encode — the `edgeIds` elements are the engine's six-term JSON strings); `kind` from the closed
//         table (`content` = `update_document`/`update_fact`/`update_community_summary`/`re_sync_embed`, the other SIXTEEN =
//         `structural`, an UNKNOWN token = `structural` and is never dropped or thrown); `store` = the pinned engine-origin
//         label `'gnosis:engine'` (`ASM-B4-1`); `cursor`/`wikiId`/`timestamp`/`type` DO NOT cross the wire.
//   §5    `c2`, `c3` (the table limb; the unknown-kind COUNTER is the consumer's and its row lives in
//         `tests/integration/gnosis-changes/consumer-frames.test.ts` as `c3(b)`).
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS and PURE — the module under test imports no Electron, no DOM, no fs, no socket, and
// these rows inject nothing at all: they call the exported mapper with a plain body. What this layer can NEVER say, named so
// nobody quotes it: that a frame ARRIVED (no stream exists here), what the consumer counted, or anything about an engine.
//
// NON-VACUITY: every refusal carries a POSITIVE CONTROL on the same builder (the same body with the one reading restored
// MAPS), so the refusal rows cannot pass by refusing everything; and the table row's control re-reads the four `content`
// tokens through the same call, so a mapper that answered `structural` for everything would red.
//
// WHAT THIS FILE DELIBERATELY DOES NOT DO: no network, no Electron, no spawn, no git, no `vi.mock`; it writes nothing.
import { describe, it, expect } from 'vitest'

import { changeFrame, EDGE_ID, loadChangesModule, shown } from '../../integration/gnosis-changes/harness.js'

/** The exact four keys, in the contract's own order (§2.2). */
const DESCRIPTOR_KEYS = ['kind', 'nodeIds', 'edgeIds', 'store']

/** §2.2 — the closed table, spelled token by token so a mis-signed token cannot hide inside a folded list. */
const CONTENT_TOKENS = ['update_document', 'update_fact', 'update_community_summary', 're_sync_embed'] as const
const STRUCTURAL_TOKENS = [
  'create_document',
  'delete_document',
  'publish_document',
  'unpublish_document',
  'archive_document',
  'create_wiki',
  'add_triple',
  'declare_community',
  'set_reference_state',
  'resolve_entities',
  'merge_facts',
  'create_fact',
  'propose_candidate_fact',
  're_derive_community',
  'propagate_fact_staleness',
  'propagate_archived_target',
] as const

describe('B-4 §5 `c2` — a `change` frame maps to the FORK\'s descriptor, EXACTLY four keys, arrays VERBATIM', () => {
  it('c2 — `{kind, nodeIds, edgeIds, store}` and nothing else, with the engine six-term edge string carried untouched', async () => {
    // MUTATION THAT WOULD RED IT: a fifth key (`cursor`/`wikiId`/`timestamp`/`type` leaking through), a copied or re-encoded
    // `edgeIds` (a `JSON.parse` of the six-term string — the second identity encoding §2.2 forbids), a `store` that is not the
    // pinned engine-origin label, or a `kind` read from anything but §2.2's table.
    const mod = await loadChangesModule()
    const problems = [...mod.problems]
    if (mod.changeFrameToPayload !== null) {
      const body = changeFrame({
        cursor: '9',
        wikiId: 'w1',
        kind: 'create_document',
        nodeIds: ['n1'],
        edgeIds: [EDGE_ID],
      })
      const mapped = mod.changeFrameToPayload(body) as Record<string, unknown> | undefined
      if (mapped === undefined || mapped === null || typeof mapped !== 'object') {
        problems.push(`c2: \`changeFrameToPayload\` answered ${shown(mapped)} for a well-formed frame — §2.2 requires the four-key descriptor`)
      } else {
        if (mapped['kind'] !== 'structural') {
          problems.push(`c2: \`kind\` read ${shown(mapped['kind'])} for the token \`create_document\` — §2.2 puts the sixteen non-content tokens at \`structural\``)
        }
        if (mapped['nodeIds'] !== (body as Record<string, unknown>)['nodeIds']) {
          problems.push('c2: `nodeIds` is NOT the frame\'s own array (identity) — §2.2 carries it VERBATIM, so a copy is a second authority for the same ids')
        }
        if (mapped['edgeIds'] !== (body as Record<string, unknown>)['edgeIds']) {
          problems.push('c2: `edgeIds` is NOT the frame\'s own array (identity) — §2.2 carries the engine\'s six-term strings UNCHANGED')
        }
        const edgeIds = mapped['edgeIds']
        if (!Array.isArray(edgeIds) || edgeIds[0] !== EDGE_ID) {
          problems.push(`c2: the six-term edge identity read ${shown(edgeIds)} — the engine's string must survive untouched (§2.2; u4 :542-548)`)
        }
        if (mapped['store'] !== 'gnosis:engine') {
          problems.push(`c2: \`store\` read ${shown(mapped['store'])} — §2.2/ASM-B4-1 pin the engine-origin label \`'gnosis:engine'\``)
        }
        const keys = Object.keys(mapped)
        if (JSON.stringify(keys) !== JSON.stringify(DESCRIPTOR_KEYS)) {
          problems.push(
            `c2: \`Object.keys(descriptor)\` read ${shown(keys)} — §2.2 requires EXACTLY ${shown(DESCRIPTOR_KEYS)}; ` +
              '`cursor`/`wikiId`/`timestamp`/`type` do NOT cross the wire',
          )
        }
        // POSITIVE CONTROL: the four `content` tokens read `content` through the SAME call, so a mapper that answered
        // `structural` for everything cannot pass this row.
        for (const token of CONTENT_TOKENS) {
          const control = mod.changeFrameToPayload(changeFrame({ kind: token })) as Record<string, unknown> | undefined
          if (control?.['kind'] !== 'content') {
            problems.push(`c2 CONTROL: the \`content\` token \`${token}\` read ${shown(control?.['kind'])} — §2.2's table is not all-\`structural\``)
          }
        }
      }
    }
    expect(problems, `c2 — a change frame maps to the fork's four-key descriptor:\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4 §5 `c3` (a) — THE KIND TABLE: all twenty tokens, one by one', () => {
  it('c3(a) — the 4 `content` tokens and the 16 `structural` tokens each map to §2.2\'s word', async () => {
    // MUTATION THAT WOULD RED IT: swapping one token between the columns (e.g. `re_sync_embed` → structural, or `delete_document`
    // → content), or a mapper that folds the table into a prefix/regex guess.
    const mod = await loadChangesModule()
    const problems = [...mod.problems]
    if (mod.changeFrameToPayload !== null) {
      for (const token of CONTENT_TOKENS) {
        const mapped = mod.changeFrameToPayload(changeFrame({ kind: token })) as Record<string, unknown> | undefined
        if (mapped?.['kind'] !== 'content') {
          problems.push(`c3(a): \`${token}\` read ${shown(mapped?.['kind'])} — §2.2 puts it at \`content\``)
        }
      }
      for (const token of STRUCTURAL_TOKENS) {
        const mapped = mod.changeFrameToPayload(changeFrame({ kind: token })) as Record<string, unknown> | undefined
        if (mapped?.['kind'] !== 'structural') {
          problems.push(`c3(a): \`${token}\` read ${shown(mapped?.['kind'])} — §2.2 puts it at \`structural\``)
        }
      }
      problems.push(
        ...(CONTENT_TOKENS.length + STRUCTURAL_TOKENS.length === 20
          ? []
          : [`c3(a): the table read ${CONTENT_TOKENS.length + STRUCTURAL_TOKENS.length} tokens — the engine's closed set is TWENTY (u4 :512-517)`]),
      )
    }
    expect(problems, `c3(a) — the kind table:\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4 §2.1/§2.2 — a frame that violates the discipline is a TYPED REFUSAL, never a descriptor', () => {
  it('refusals — arrays, nulls, missing/extra keys, wrong types, a non-canonical decimal cursor, a label/type mismatch: ALL refused', async () => {
    // MUTATION THAT WOULD RED IT: a mapper that coerces (`Number(body.cursor)`, `String(body.kind)`), ignores an extra key,
    // tolerates a missing one, or answers a descriptor for `null`/an array. Each arm below is ONE reading of the frame, and each
    // is paired with the VALID BODY it was derived from — so the row cannot pass by refusing everything.
    const mod = await loadChangesModule()
    const problems = [...mod.problems]
    if (mod.changeFrameToPayload !== null) {
      const valid = changeFrame({ cursor: '9', nodeIds: ['n1'], edgeIds: [EDGE_ID] })
      // POSITIVE CONTROL first: the unmodified body MUST map, or every refusal below is vacuous.
      let controlOk = false
      try {
        controlOk = (mod.changeFrameToPayload(valid) as Record<string, unknown> | undefined)?.['store'] === 'gnosis:engine'
      } catch {
        controlOk = false
      }
      if (!controlOk) {
        problems.push('refusals CONTROL: the well-formed body was itself refused — every refusal arm below would then be vacuous')
      }

      const missingKey: Record<string, unknown> = { ...valid }
      delete missingKey['timestamp']
      const arms: Array<{ name: string; body: unknown }> = [
        { name: 'a JSON ARRAY body', body: [valid] },
        { name: 'a NULL body', body: null },
        { name: 'a STRING body', body: 'change' },
        { name: 'a NUMBER body', body: 7 },
        { name: 'a body MISSING `timestamp` (the key is absent, not `undefined`)', body: missingKey },
        { name: 'a body with an EXTRA key (`seq`)', body: { ...valid, seq: 4 } },
        { name: '`nodeIds` as a STRING', body: { ...valid, nodeIds: 'n1' } },
        { name: '`nodeIds` holding a NUMBER', body: { ...valid, nodeIds: [1] } },
        { name: '`edgeIds` as NULL', body: { ...valid, edgeIds: null } },
        { name: '`kind` as a NUMBER', body: { ...valid, kind: 42 } },
        { name: '`kind` as the EMPTY string', body: { ...valid, kind: '' } },
        { name: '`cursor` with leading zeros ("007")', body: { ...valid, cursor: '007' } },
        { name: '`cursor` as a FLOAT ("1.0")', body: { ...valid, cursor: '1.0' } },
        { name: '`cursor` with surrounding space (" 7")', body: { ...valid, cursor: ' 7' } },
        { name: '`cursor` in HEX ("0x10")', body: { ...valid, cursor: '0x10' } },
        { name: '`cursor` as a NUMBER', body: { ...valid, cursor: 9 } },
        { name: '`cursor` NEGATIVE ("-1")', body: { ...valid, cursor: '-1' } },
        { name: '`wikiId` as a NUMBER', body: { ...valid, wikiId: 42 } },
        { name: '`timestamp` as NULL', body: { ...valid, timestamp: null } },
        { name: '`type` claiming the CURSOR family', body: { ...valid, type: 'cursor' } },
      ]
      for (const arm of arms) {
        let answered: unknown
        let threw = false
        try {
          answered = mod.changeFrameToPayload(arm.body)
        } catch {
          threw = true
        }
        if (!threw) {
          problems.push(`refusals: ${arm.name} was ACCEPTED and answered ${shown(answered)} — §2.1/§2.2 make it a typed refusal`)
        }
      }
      // The `wikiId: null` arm is the OTHER direction: nullable IS lawful (`gnosis_server.rs:940`) and must map.
      let nullableOk = false
      try {
        nullableOk = (mod.changeFrameToPayload({ ...valid, wikiId: null }) as Record<string, unknown> | undefined)?.['store'] === 'gnosis:engine'
      } catch {
        nullableOk = false
      }
      if (!nullableOk) {
        problems.push('refusals CONTROL(b): `wikiId: null` was refused — the engine renders a non-wiki-scoped entry as `null` (gnosis_server.rs:940)')
      }
    }
    expect(problems, `the frame refusals:\n${problems.join('\n')}`).toEqual([])
  })
})
