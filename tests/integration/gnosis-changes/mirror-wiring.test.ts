// tests/integration/gnosis-changes/mirror-wiring.test.ts — unit `B-4a` `engine-store-mirror`'s WIRING rows (`C1`), its `INV-E`
// clause (`C2`) and the park's own clause (`C3`). Authored BEFORE the wiring exists (RCA-1).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4a-engine-store-mirror.md` §3 (the seam), §4 (the order), §5 (`INV-E`), §6 (`C1`,
// `C2`, `C3`) — via `docs/L2/gnosis-changes/engine-mirror.md` §5 (the THREE wiring sites, quoted below), §6 (the failure table)
// and `docs/L3/gnosis-changes/engine-mirror.md` §1 (the file table) / §5 (the guardrails).
//   §5 site 1 "The mirror, INERT at construction, constructed AFTER `createRagStoreRuntimeController(` … and BEFORE the CRUD
//            proxy it feeds. `opts`: `origin: ENGINE_ORIGIN_STORE`, `store: () => runtime.getDefaultStore()`, `read:` the bounded
//            paged walk — `listWikis` then every page of `listDocuments` under `RECONCILE_PAGE_SIZE`/`RECONCILE_MAX_PAGES`."
//   §5 site 2 "The CRUD proxy gains `onAccepted: (write) => engineMirror.accepted(write)` — ONE member, no other byte: `crudCall`
//            calls it ONCE, AFTER `decodeCrudResponse` returned."
//   §5 site 3 "The sink becomes `settle` then broadcast, in the SAME expression."
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS — source TEXT with comments stripped (`main.ts` runs `app.whenReady()` at module scope and
// is NEVER imported by a test, the `display-wire-lockstep` precedent). What this layer can NEVER say: that the boot constructed
// the mirror, that a settle preceded a real broadcast, or that the quit path ran — the assembled-app limb is PARKED (contract §8).
//
// NON-VACUITY, AND THE SELF-REFERENCE RULE THIS FILE OBEYS: every clause is a FUNCTION OF THE TEXT, so `C1(b)`/`C1(c)`/`C1(f)`/
// `C2`/`C3` each build a MUTANT from the real text and assert the clause answers FALSE for it and TRUE for the real file —
// the `c9(g)`/`c9(h)` idiom. Because `C2`/`C3` SCAN THIS VERY FILE for their own forbidden vocabulary, that vocabulary is built
// by CONCATENATION (`'node:' + 'net'`) and never spelled; a clause that spells the token it forbids would flag itself, and one
// that exempted itself would prove a dead branch. For the same reason the loopback port is never spelled here: the rows ride
// `BASE_URL` from the harness, which owns the unit's ONE `:8080` literal (`C3` reads that as exactly 1).
import { describe, it, expect } from 'vitest'

import { occurrences, readTextOrProblem, stripComments } from './harness.js'

const MAIN_FILE = 'src/main/main.ts'
const CRUD_FILE = 'src/main/engine-crud-rag-store.ts'
const MIRROR_FILE = 'src/main/engine-mirror.ts'
const CHANGES_FILE = 'src/main/engine-changes.ts'
const RAG_STORE_FILE = 'src/main/rag-store.ts'
const PRELOAD_FILE = 'src/main/preload.ts'
const TYPES_FILE = 'src/shared/types.ts'
const PACKAGE_FILE = 'package.json'
const HARNESS_FILE = 'tests/integration/gnosis-changes/harness.ts'
const ROW_FILES = [
  'tests/unit/gnosis-changes/engine-mirror.test.ts',
  'tests/integration/gnosis-changes/mirror-limbs.test.ts',
  'tests/integration/gnosis-changes/mirror-wiring.test.ts',
  'tests/integration/gnosis-changes/mirror-adversarial.test.ts',
  'tests/integration/gnosis-changes/wiring-census.test.ts',
] as const

/** A window of code around a needle — how a source clause reads "the call's own body" without a parser (`c9(c)`'s helper). */
function windowAround(code: string, needle: string, before: number, after: number): { text: string; at: number } {
  const at = code.indexOf(needle)
  if (at < 0) return { text: '', at }
  return { text: code.slice(Math.max(0, at - before), at + needle.length + after), at }
}

describe('B-4a §6 `C1` — the wiring census: ONE construction, the RIGHT order, the seam INSIDE the proxy, ZERO byte elsewhere', () => {
  it('C1 — one `createEngineMirror(`, constructed after the runtime and before the proxy it feeds, `settle` before `broadcast(`, the seam inside `createEngineCrudRagStore(`, and a MEASURED zero-byte set', () => {
    // MUTATIONS THAT WOULD RED IT, one per limb: a second construction site (a), the mirror placed after the CRUD proxy — the
    // `onAccepted` then closes over a binding that does not exist yet (b), a sink that broadcasts BEFORE the projection lands —
    // `B6-F1` re-introduced verbatim (c), a seam fired from `main.ts` instead of `crudCall` (d), a `preload.ts`/`types.ts`/
    // `rag-store.ts`/`engine-changes.ts`/`package.json` byte (e), a seam BEFORE `decodeCrudResponse` — a REFUSED answer would be
    // mirrored (f).
    const problems: string[] = []
    const mainText = readTextOrProblem(MAIN_FILE, problems)

    // ---- (a) ONE construction, ONE import ------------------------------------------------------------------------------
    const main = mainText === '' ? '' : stripComments(mainText)
    if (main !== '') {
      const sites = occurrences(main, 'createEngineMirror(')
      if (sites !== 1) {
        problems.push(`C1(a): \`createEngineMirror(\` occurs ${sites} time(s) in \`${MAIN_FILE}\` — §5 site 1 constructs the mirror ONCE at boot`)
      }
      const imports = occurrences(main, "from './engine-mirror.js'")
      if (imports !== 1) {
        problems.push(`C1(a): \`from './engine-mirror.js'\` occurs ${imports} time(s) in \`${MAIN_FILE}\` — the wiring has no module to construct`)
      }

      // ---- (b) SOURCE ORDER: runtime THUNK → mirror → the CRUD proxy it feeds -----------------------------------------
      const orderClause = (text: string): boolean => {
        const code = stripComments(text)
        const runtimeAt = code.indexOf('createRagStoreRuntimeController(')
        const mirrorAt = code.indexOf('createEngineMirror(')
        const crudAt = code.indexOf('createEngineCrudRagStore(')
        if (runtimeAt < 0 || mirrorAt < 0 || crudAt < 0) return false
        return mirrorAt > runtimeAt && mirrorAt < crudAt
      }
      // THE MUTANT FIRST: a mirror hoisted above the runtime controller has no `store` thunk to close over.
      const hoisted = `const __order_mutant = createEngineMirror({})\n${mainText}`
      if (orderClause(hoisted)) {
        problems.push('C1(b): the clause answered TRUE for a mirror hoisted ABOVE `createRagStoreRuntimeController(` — the clause cannot fail and proves nothing')
      }
      if (!orderClause(mainText)) {
        const runtimeAt = main.indexOf('createRagStoreRuntimeController(')
        const mirrorAt = main.indexOf('createEngineMirror(')
        const crudAt = main.indexOf('createEngineCrudRagStore(')
        problems.push(
          `C1(b): SOURCE ORDER is wrong — \`createRagStoreRuntimeController(\` at ${runtimeAt}, \`createEngineMirror(\` at ${mirrorAt}, ` +
            `\`createEngineCrudRagStore(\` at ${crudAt}; §5 site 1 requires runtime → mirror → the proxy it feeds (-1 = absent)`,
        )
      }

      // ---- (c) THE SINK: `settle` BEFORE `broadcast(`, in the SAME expression, and the re-read is the mirror's ----------
      const sinkClause = (text: string): boolean => {
        const code = stripComments(text)
        const site = windowAround(code, 'createEngineChangesFeed(', 0, 2000).text
        if (site === '') return false
        const settleAt = site.indexOf('settle(')
        const broadcastAt = site.indexOf('broadcast(')
        return (
          site.includes('onChange') &&
          site.includes('IPC_RAG_STORE_CHANGED') &&
          settleAt >= 0 &&
          broadcastAt >= 0 &&
          settleAt < broadcastAt &&
          site.includes('engineMirror.reconcile(')
        )
      }
      // THE MUTANT FIRST: a `broadcast(` lifted ABOVE the `await …settle(` is the defect this unit exists to close.
      const earlyBroadcast = mainText.replace(
        'await engineMirror.settle(',
        'backend.broadcast(IPC_RAG_STORE_CHANGED, d)\n            await engineMirror.settle(',
      )
      if (earlyBroadcast === mainText) {
        problems.push('C1(c): the sink mutant could not be built — `await engineMirror.settle(` is absent from the feed window, so the clause has no falsifiable subject (§5 site 3)')
      } else if (sinkClause(earlyBroadcast)) {
        problems.push('C1(c): the clause answered TRUE with `broadcast(` lifted ABOVE `settle(` — the pane would re-read a store the mirror has not written (`B6-F1`)')
      }
      if (!sinkClause(mainText)) {
        const site = windowAround(main, 'createEngineChangesFeed(', 0, 2000).text
        const missing: string[] = []
        if (!site.includes('onChange')) missing.push('`onChange`')
        if (!site.includes('IPC_RAG_STORE_CHANGED')) missing.push('`IPC_RAG_STORE_CHANGED`')
        if (!site.includes('settle(')) missing.push('`settle(`')
        if (!site.includes('broadcast(')) missing.push('`broadcast(`')
        if (!site.includes('engineMirror.reconcile(')) missing.push('`engineMirror.reconcile(`')
        const settleAt = site.indexOf('settle(')
        const broadcastAt = site.indexOf('broadcast(')
        const order = settleAt >= 0 && broadcastAt >= 0 && settleAt > broadcastAt ? ' — AND `broadcast(` precedes `settle(`' : ''
        problems.push(`C1(c): the sink window (2000 chars from \`createEngineChangesFeed(\`) is missing ${missing.length > 0 ? missing.join(', ') : 'nothing by name but the settle-before-broadcast ORDER'}${order} (§5 site 3)`)
      }

      // ---- (d) `onAccepted` EXACTLY ONCE, and INSIDE the CRUD proxy's own construction ---------------------------------
      const acceptedSites = occurrences(main, 'onAccepted')
      if (acceptedSites !== 1) {
        problems.push(`C1(d): \`onAccepted\` occurs ${acceptedSites} time(s) in \`${MAIN_FILE}\` — §5 site 2 adds ONE member to ONE construction`)
      }
      const crudWindow = windowAround(main, 'createEngineCrudRagStore(', 0, 1200).text
      if (!crudWindow.includes('onAccepted')) {
        problems.push('C1(d): the `createEngineCrudRagStore(` window carries no `onAccepted` — the seam is wired somewhere other than the proxy it belongs to')
      }
    }

    // ---- (e) THE ZERO-BYTE SET — a MEASURED negative, not a promise -----------------------------------------------------
    const ZERO_BYTE_TOKENS = ['engineMirror', 'engine-mirror', 'onAccepted'] as const
    for (const file of [CHANGES_FILE, RAG_STORE_FILE, PRELOAD_FILE, TYPES_FILE, PACKAGE_FILE]) {
      const text = readTextOrProblem(file, problems)
      if (text === '') continue
      for (const token of ZERO_BYTE_TOKENS) {
        const count = occurrences(text, token)
        if (count !== 0) {
          problems.push(`C1(e): \`${token}\` occurs ${count} time(s) in \`${file}\` — that file takes ZERO byte from this unit (§1's path table, §4's "no second publisher")`)
        }
      }
    }
    const mirrorText = readTextOrProblem(MIRROR_FILE, problems)
    if (mirrorText !== '' && occurrences(stripComments(mirrorText), 'provident:') !== 0) {
      problems.push(`C1(e): \`${MIRROR_FILE}\` spells ${occurrences(stripComments(mirrorText), 'provident:')} channel literal(s) — the mirror broadcasts NOTHING and emits no descriptor (§4)`)
    }

    // ---- (f) THE SEAM'S SOURCE ORDER: `decodeCrudResponse(` FIRST, `onAccepted` SECOND -------------------------------
    const seamClause = (text: string): boolean => {
      const code = stripComments(text)
      const site = windowAround(code, 'const crudCall', 0, 2500).text
      if (site === '') return false
      const decodeAt = site.indexOf('decodeCrudResponse(')
      const acceptedAt = site.indexOf('onAccepted')
      return decodeAt >= 0 && acceptedAt >= 0 && decodeAt < acceptedAt
    }
    const crudText = readTextOrProblem(CRUD_FILE, problems)
    if (crudText !== '') {
      // THE MUTANT FIRST: a seam fired BEFORE the decode mirrors an answer the engine may have REFUSED.
      const beforeDecode = crudText.replace(
        'const crudCall = async <T>(',
        'const crudCall = async <T>(\n    await opts.onAccepted?.(null as never)',
      )
      if (beforeDecode === crudText) {
        problems.push('C1(f): the seam mutant could not be built — `const crudCall = async <T>(` is absent, so the clause has no falsifiable subject')
      } else if (seamClause(beforeDecode)) {
        problems.push('C1(f): the clause answered TRUE with `onAccepted` fired BEFORE `decodeCrudResponse(` — a REFUSED answer would be mirrored (the `G1` defect)')
      }
      if (!seamClause(crudText)) {
        problems.push(`C1(f): in the \`crudCall\` window of \`${CRUD_FILE}\`, \`decodeCrudResponse(\` does not precede \`onAccepted\` — §5 site 2/§3: the seam fires ONCE and only AFTER the engine ACCEPTED`)
      }
    }

    expect(problems, `C1:\n${problems.join('\n')}`).toEqual([])
  })
})

/** A conjunct whose label is the TOKEN ITSELF, computed at runtime — the source never spells the vocabulary it forbids. */
function conjunct(group: string, token: string): { label: string; token: string } {
  return { label: `${group} \`${token}\``, token }
}

describe('B-4a §6 `C2` — `INV-E` over `src/main/engine-mirror.ts`, with ONE ISOLATING MUTANT PER CONJUNCT', () => {
  it('C2 — the mirror writes the store and NOTHING else: zero writer, host/renderer and scheduling/IO vocabulary, each conjunct driven FALSE by its own mutant', () => {
    // WHY THE MUTANTS: `D-40`'s `m6` lesson — a counter set that reads 0/0/0 because the whole branch is dead is not a proof.
    // Each token below is INSERTED into the real text alone, so the conjunct it isolates is the only thing that moved.
    //
    // THE TOKENS ARE BUILT BY CONCATENATION, deliberately: `C3` scans THIS file for some of these very tokens, so a clause that
    // spelled them would flag its own source and could then only pass by exempting itself — a dead branch.
    const CONJUNCTS: Array<{ label: string; token: string }> = [
      conjunct('the writer vocabulary', 'load' + 'AppGraph'),
      conjunct('the writer vocabulary', 'mount' + 'Operator'),
      conjunct('the writer vocabulary', 'refresh' + '('),
      conjunct('the host vocabulary', 'electr' + 'on'),
      conjunct('the host vocabulary', 'ipc' + 'Main'),
      conjunct('the host vocabulary', 'web' + 'Contents'),
      conjunct('the renderer vocabulary', 'broad' + 'cast('),
      conjunct('the renderer vocabulary', 'pane-' + 'events'),
      conjunct('the scheduling vocabulary', 'set' + 'Timeout'),
      conjunct('the scheduling vocabulary', 'set' + 'Interval'),
      conjunct('the IO vocabulary', 'f' + 'etch('),
      conjunct('the IO vocabulary', 'node:' + 'fs'),
      conjunct('the IO vocabulary', 'node:' + 'net'),
      conjunct('the IO vocabulary', 'node:' + 'http'),
      conjunct('the IO vocabulary', 'child_' + 'process'),
      conjunct('the IO vocabulary', 'Web' + 'Socket'),
    ]
    const tokens = CONJUNCTS.map((c) => c.token)
    const clause = (text: string): boolean => {
      const code = stripComments(text)
      // THE NON-VACUITY FLOOR: an empty or unrelated text is NOT a pass — the module must BE the module first.
      if (!code.includes('export function createEngineMirror(')) return false
      return tokens.every((token) => occurrences(code, token) === 0)
    }
    const problems: string[] = []
    const real = readTextOrProblem(MIRROR_FILE, problems)
    if (real !== '') {
      if (!clause(real)) {
        const hits = CONJUNCTS.filter((c) => occurrences(stripComments(real), c.token) !== 0)
        if (hits.length === 0) {
          problems.push(`C2: \`${MIRROR_FILE}\` does not carry \`export function createEngineMirror(\` — the clause has no subject (INV-E is graded over the module, §5)`)
        } else {
          problems.push(`C2: \`${MIRROR_FILE}\` carries ${hits.map((h) => h.label).join(', ')} — §5: the mirror writes the store and NOTHING else, and holds no host, no clock and no timer`)
        }
      }
      const verdicts: string[] = []
      for (const conjunct of CONJUNCTS) {
        const mutant = `${real}\nconst __INV_E_MUTANT = "${conjunct.token}"\n`
        const verdict = clause(mutant)
        verdicts.push(`${conjunct.label} → ${verdict ? 'TRUE (the clause cannot fail)' : 'false'}`)
        if (verdict) {
          problems.push(`C2: the clause answered TRUE for the text carrying ${conjunct.label} — that conjunct proves nothing`)
        }
      }
      // EVERY MUTANT'S VERDICT IS A READING OF ITS OWN, kept in the row's problems text so a partial pass cannot hide one.
      if (problems.length > 0) problems.push(`C2 MUTANT VERDICTS: ${verdicts.join(' · ')}`)
    }
    expect(problems, `C2:\n${problems.join('\n')}`).toEqual([])
  })
})

describe('B-4a §6 `C3` — the park\'s own clause: no row of this unit opens a socket, spawns an engine or reads a port', () => {
  it('C3 — zero socket/spawn vocabulary in the four row files, the harness and the mirror; zero real fetch calls in the rows; the unit\'s ONE loopback literal is the harness\'s `BASE_URL`', () => {
    // THE NAMED EXCEPTION, STATED SO IT IS NOT MISTAKEN FOR A SOCKET: `harness.ts` TYPES a `typeof fetch` double
    // (`crudTransport()`) whose responder answers a real `new Response(...)`, because the CRUD proxy's ONLY injection seam
    // (`EngineCrudRagStoreOptions.fetch`) is typed `typeof fetch`. The rows never call one; this row asserts BOTH halves — zero
    // calls, and the exception PRESENT (a claimed exception that is not exercised is a comment, not a reading).
    const FORBIDDEN: Array<{ label: string; token: string }> = [
      conjunct('the socket vocabulary', 'node:' + 'net'),
      conjunct('the socket vocabulary', 'node:' + 'http'),
      conjunct('the socket vocabulary', 'node:' + 'https'),
      conjunct('the process vocabulary', 'child_' + 'process'),
      conjunct('the process vocabulary', 'exec' + 'Sync'),
      conjunct('the process vocabulary', 'execFile' + 'Sync'),
      conjunct('the process vocabulary', 'spawn' + '('),
      conjunct('the socket vocabulary', 'Web' + 'Socket'),
      conjunct('the socket vocabulary', 'net.' + 'connect'),
    ]
    const fetchCall = 'fetch' + '('
    const typeofFetch = 'typeof ' + 'fetch'
    const newResponse = 'new ' + 'Response('
    const portLiteral = ':' + '8080'
    const scan = (text: string): string[] => FORBIDDEN.filter((f) => occurrences(stripComments(text), f.token) !== 0).map((f) => f.label)

    const problems: string[] = []
    for (const file of [...ROW_FILES, HARNESS_FILE]) {
      const text = readTextOrProblem(file, problems)
      if (text === '') continue
      const hits = scan(text)
      if (hits.length > 0) {
        problems.push(`C3: \`${file}\` carries ${hits.join(', ')} — no row, helper or harness of this unit opens a socket or spawns a process (the park is §8's, and it is the contract's)`)
      }
      const portCount = occurrences(stripComments(text), portLiteral)
      if (file === HARNESS_FILE) {
        if (portCount !== 1) {
          problems.push(`C3: \`${file}\` spells the loopback port ${portCount} time(s) — the unit keeps ONE literal, in \`BASE_URL\``)
        }
      } else if (portCount !== 0) {
        problems.push(`C3: \`${file}\` spells the loopback port ${portCount} time(s) — every row rides \`BASE_URL\` from the harness, so the unit has ONE literal and not four`)
      }
      if (file !== HARNESS_FILE) {
        const calls = occurrences(stripComments(text), fetchCall)
        if (calls !== 0) {
          problems.push(`C3: \`${file}\` makes ${calls} real fetch call(s) — the doubles are INJECTED through the seams, never dialled`)
        }
      }
    }
    const harnessText = readTextOrProblem(HARNESS_FILE, problems)
    if (harnessText !== '') {
      const harness = stripComments(harnessText)
      if (occurrences(harness, fetchCall) !== 0) {
        problems.push(`C3: \`${HARNESS_FILE}\` makes ${occurrences(harness, fetchCall)} real fetch call(s) — it may only TYPE the double (${typeofFetch}), never dial it`)
      }
      if (!harness.includes(typeofFetch) || !harness.includes(newResponse)) {
        problems.push(`C3: \`${HARNESS_FILE}\` does not carry the named exception (\`${typeofFetch}\` + \`${newResponse}\`) — the CRUD double would then have no lawful way to exist, and this row would be forbidding rather than describing`)
      }
      // THE MUTANT FIRST: the scan must be able to FAIL, or the zeros above are a dead branch.
      const mutant = `${harnessText}\nconst __park_mutant = ${FORBIDDEN.find((f) => f.token === 'spawn' + '(')!.token}\n`
      if (scan(mutant).length === 0) {
        problems.push('C3: the scan answered CLEAN for a text carrying a spawn token — the clause cannot fail and proves nothing')
      }
    }
    const mirrorText = readTextOrProblem(MIRROR_FILE, problems)
    if (mirrorText !== '') {
      const hits = scan(mirrorText)
      if (hits.length > 0) problems.push(`C3: \`${MIRROR_FILE}\` carries ${hits.join(', ')} — the mirror holds no fs, no socket and no process (§5, L3 guardrail 5)`)
    }

    expect(problems, `C3:\n${problems.join('\n')}`).toEqual([])
  })
})
