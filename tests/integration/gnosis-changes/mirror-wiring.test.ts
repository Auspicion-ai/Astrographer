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

import { handleRagDocHeadsIpc } from '../../../src/main/mcp-server.js'
import type { RagStore } from '../../../src/main/rag-store.js'
import {
  constructMirror,
  loadMirrorModule,
  markedRoots,
  newRagStore,
  occurrences,
  readTextOrProblem,
  shown,
  storeCounts,
  stripComments,
} from './harness.js'

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

// ===========================================================================
// `F12` LIMB D — THE WIRING'S OWN CONTROL FLOW, EXECUTED (`B4A-F12`'s coverage gap, closed).
//
// WHY A FOURTH LIMB EXISTS AT ALL: limbs A–C read the wiring's SPELLING. Limb C's cap clause is TWO INDEPENDENT NEEDLES in one
// 2400-character window, so it says "the needle is there and the token is there", never that they are WIRED TOGETHER. The
// adversarial pass measured TWO single-token mutants of `main.ts`'s `read:` closure that leave the whole 87-row battery green:
//   (a) `if (!closed || capped) complete = false` → `if (!closed) complete = false`. A walk that STOPPED AT the bound then
//       reports itself COMPLETE, so the module names the truncated list and its delete-on-absence phase REMOVES the documents
//       the walk dropped (`markedRoots` falls while the engine still lists them) — §5(ii)'s "a partial list may never license a
//       delete" re-opened by one token.
//   (b) `documents.length >= MIRROR_MAX_PER_WALK` → `… - 1`. An engine of EXACTLY `bound` documents then reads
//       `documents bound-1, complete false`, which the module answers `nodeIds []`, `projected 0`, `failed 1` — the exact
//       silent nothing `B4A-F12` exists to close, restored by one token.
// NO ROW EXECUTED THAT CLOSURE, because `main.ts` is never importable (it calls `app.whenReady()` at module scope). So this limb
// LIFTS THE CLOSURE OUT OF THE REAL TEXT AND RUNS IT: the `read: async` needle, the arrow's matching brace by a counter loop
// (nested `for`/`if` braces make `indexOf('}')` useless), exactly TWO type annotations erased, and `new Function` over the SAME
// four names the wiring closes over. The THREE numbers come from the TEXT — `RECONCILE_PAGE_SIZE`, `RECONCILE_MAX_PAGES` and
// their product (the text's own `MIRROR_MAX_PER_WALK`, which `F12(C)` already asserts is the one stated product) — never from a
// literal here, so a shift in either number moves the readings with it. The CRUD surface is a plain OBJECT because the closure
// only ever calls `listWikis({})` then `listDocuments({wikiId, body:{state,tag,page,pageSize}})`: no socket, no engine, no port,
// no `fetch` (`C3` scans this file for that vocabulary, so none of it is spelled anywhere below). Every step's absence is a NAMED
// reading, never a silent pass and never an unhandled throw — and the whole limb is a FUNCTION OF THE TEXT, so the row runs it
// over both mutants FIRST and over the REAL text LAST (the one whose verdict is asserted).
// ===========================================================================

/** One arrow-function body lifted out of a source text: from `start` to the brace that CLOSES it, or `null` when unbalanced. */
function arrowBodyAt(code: string, start: number, arrowAt: number): { text: string; absent: string } {
  const openAt = arrowAt < 0 ? -1 : code.indexOf('{', arrowAt)
  if (openAt < 0) return { text: '', absent: 'the `{` opening the arrow body' }
  let depth = 0
  for (let index = openAt; index < code.length; index += 1) {
    const char = code[index]
    // A literal that carried a brace must not move the counter — `stripComments` leaves strings alone, so they are skipped.
    if (char === "'" || char === '"' || char === '`') {
      let scan = index + 1
      while (scan < code.length && code[scan] !== char) scan += code[scan] === '\\' ? 2 : 1
      index = scan
      continue
    }
    if (char === '{') {
      depth += 1
    } else if (char === '}') {
      depth -= 1
      if (depth === 0) return { text: code.slice(start, index + 1), absent: '' }
    }
  }
  return { text: '', absent: 'a matching `}` (the braces are UNBALANCED)' }
}

/**
 * `F12(D)` — run the wiring's OWN `read:` closure, extracted from `text`, against fixtures whose totals straddle the bound.
 * `verdict` is true IFF every step succeeded AND every fixture read what the closure owes the module; `readings` is the
 * diagnostic payload (each failure is prefixed `✗`, so the caller can name exactly what was absent or what disagreed).
 */
const limbD = async (text: string): Promise<{ verdict: boolean; readings: string[] }> => {
  const readings: string[] = []
  let failures = 0
  const fail = (message: string): void => {
    failures += 1
    readings.push(`✗ ${message}`)
  }

  // ---- STEP 1 — THE CLOSURE, EXTRACTED FROM THE REAL TEXT ------------------------------------------------------------
  const code = stripComments(text)
  const READ_NEEDLE = 'read: async'
  const needleAt = code.indexOf(READ_NEEDLE)
  if (needleAt < 0) {
    fail(`\`${READ_NEEDLE}\` is ABSENT from the stripped text — the wiring's closure has no subject to execute`)
    return { verdict: false, readings }
  }
  const start = needleAt + 'read: '.length
  const arrowAt = code.indexOf('=>', start)
  if (arrowAt < 0) {
    fail('the `=>` of the `read:` arrow is ABSENT — the needle leads to no function')
    return { verdict: false, readings }
  }
  const body = arrowBodyAt(code, start, arrowAt)
  if (body.text === '') {
    fail(`${body.absent} after the \`read: async\` arrow — the closure cannot be cut out of the text`)
    return { verdict: false, readings }
  }
  const READ_ANNOTATION = '(): Promise<EngineMirrorRead>'
  const DOCS_ANNOTATION = ': EngineMirrorDocument[]'
  const absentAnnotations = [READ_ANNOTATION, DOCS_ANNOTATION].filter((annotation) => !body.text.includes(annotation))
  if (absentAnnotations.length > 0) {
    fail(
      `the extracted closure does not carry ${absentAnnotations.map((annotation) => `\`${annotation}\``).join(' and ')} — the ` +
        'type-erase step erases exactly TWO annotations, so one that is absent leaves the text un-runnable',
    )
    return { verdict: false, readings }
  }
  const erased = body.text.split(READ_ANNOTATION).join('()').split(DOCS_ANNOTATION).join('')

  // ---- STEP 2 — THE THREE NUMBERS, READ FROM THE SAME TEXT (never hardcoded here) -------------------------------------
  const pageSizeMatch = /const\s+RECONCILE_PAGE_SIZE\s*=\s*(\d+)/.exec(code)
  const maxPagesMatch = /const\s+RECONCILE_MAX_PAGES\s*=\s*(\d+)/.exec(code)
  if (pageSizeMatch === null || maxPagesMatch === null) {
    const missing = [pageSizeMatch === null ? '`const RECONCILE_PAGE_SIZE = <number>`' : '', maxPagesMatch === null ? '`const RECONCILE_MAX_PAGES = <number>`' : '']
    fail(`${missing.filter((entry) => entry !== '').join(' and ')} could not be parsed out of the text — the walk's page size and page bound are its own numbers, not this file's`)
    return { verdict: false, readings }
  }
  const pageSize = Number(pageSizeMatch[1])
  const maxPages = Number(maxPagesMatch[1])
  const bound = pageSize * maxPages
  if (!Number.isFinite(bound) || bound <= 0) {
    fail(`the parsed numbers read pageSize ${String(pageSize)} × maxPages ${String(maxPages)} = bound ${String(bound)} — a walk bound that is not a positive number bounds nothing`)
    return { verdict: false, readings }
  }

  // ---- STEP 3 — THE CALLABLE, BUILT OVER THE SAME FOUR NAMES THE WIRING CLOSES OVER ------------------------------------
  type ClosureFactory = (crud: unknown, pageSizeArg: number, maxPagesArg: number, maxPerWalk: number) => unknown
  let factory: ClosureFactory | null = null
  try {
    factory = new Function('engineCrudRagStore', 'RECONCILE_PAGE_SIZE', 'RECONCILE_MAX_PAGES', 'MIRROR_MAX_PER_WALK', `return (${erased})`) as unknown as ClosureFactory
  } catch (err) {
    fail(`the factory \`new Function(...)\` THREW (${err instanceof Error ? err.message : String(err)}) over the type-erased closure — the extracted text is not a JS expression`)
    return { verdict: false, readings }
  }
  if (typeof factory !== 'function') {
    fail(`the factory answered ${shown(factory)} — the extracted text did not evaluate to a callable`)
    return { verdict: false, readings }
  }

  /** The `engineCrudRagStore` stand-in: wiki `i` lists `w<i>-d0000`… up to `perWiki[i]`, PAGED, and counts its own page reads. */
  const fakeEngine = (perWiki: number[]): { crud: unknown; pagesFetched: () => number } => {
    let pages = 0
    const idsPerWiki = perWiki.map((count, wiki) =>
      Array.from({ length: count }, (_unused, index) => `w${String(wiki)}-d${String(index).padStart(4, '0')}`),
    )
    return {
      pagesFetched: () => pages,
      crud: {
        listWikis: async (_args: unknown) => perWiki.map((_count, index) => ({ wikiId: `w${String(index)}`, name: `wiki ${String(index)}` })),
        listDocuments: async (args: { wikiId: string; body: { page: number; pageSize: number } }) => {
          pages += 1
          const wiki = Number(args.wikiId.slice(1))
          const total = perWiki[wiki] ?? 0
          const begin = (args.body.page - 1) * args.body.pageSize
          const items = (idsPerWiki[wiki] ?? []).slice(begin, begin + args.body.pageSize).map((documentId) => ({
            documentId,
            wikiId: args.wikiId,
            title: documentId,
            state: 'Draft',
            revision: 0,
            updatedAt: '2026-11-18T00:00:00Z',
          }))
          return { items, total, page: args.body.page, pageSize: args.body.pageSize }
        },
      },
    }
  }

  // ---- STEP 4 — THE FIVE FIXTURES, AND THE THREE ASSERTIONS THAT ARE THE LIMB ------------------------------------------
  const half = Math.floor(bound / 2)
  const fixtures: Array<{ label: string; perWiki: number[]; expectedDocuments: number; expectedComplete: boolean }> = [
    { label: `[bound] — EXACTLY at the bound over ONE wiki`, perWiki: [bound], expectedDocuments: bound, expectedComplete: true },
    { label: `[bound + 1] — one OVER the bound over ONE wiki`, perWiki: [bound + 1], expectedDocuments: bound, expectedComplete: false },
    { label: `[floor(bound/2), bound - floor(bound/2) + 1] — one OVER the bound over TWO wikis`, perWiki: [half, bound - half + 1], expectedDocuments: bound, expectedComplete: false },
    { label: `[0] — an EMPTY engine`, perWiki: [0], expectedDocuments: 0, expectedComplete: true },
    { label: `[floor(bound/2) - 1, floor(bound/2) - 1] — just UNDER the bound over TWO wikis`, perWiki: [half - 1, half - 1], expectedDocuments: bound - 2, expectedComplete: true },
  ]
  // THE STOP BOUND: the cap can only fire once `bound` documents have been accumulated (each page contributes at most
  // `pageSize`), so a walk that stops AT the bound cannot have fetched more than `ceil(bound / pageSize)` pages — plus the ONE
  // page whose item tripped the cap. A bounded comparison, not an exact count: the fixtures' own shapes differ.
  const stopBound = Math.ceil(bound / pageSize) + 1
  for (const fixture of fixtures) {
    const engine = fakeEngine(fixture.perWiki)
    const listedCount = fixture.perWiki.reduce((sum, count) => sum + count, 0)
    const neededPages = fixture.perWiki.reduce((sum, count) => sum + Math.max(1, Math.ceil(count / pageSize)), 0)
    let answer: unknown
    try {
      answer = await (factory(engine.crud, pageSize, maxPages, bound) as () => Promise<unknown>)()
    } catch (err) {
      fail(`${fixture.label}: the EXECUTED closure THREW (${err instanceof Error ? err.message : String(err)}) — the read is total, so a throw is a fault the module would type \`failed\``)
      continue
    }
    const record = (answer ?? {}) as { documents?: unknown; complete?: unknown }
    if (!Array.isArray(record.documents)) {
      fail(`${fixture.label}: the closure answered documents ${shown(record.documents)} — the read's shape is an ARRAY of documents`)
      continue
    }
    const documents = record.documents as unknown[]
    const complete = record.complete
    const pagesFetched = engine.pagesFetched()
    const dropped = listedCount - documents.length
    const reading =
      `documents.length ${String(documents.length)} (bound ${String(bound)}), complete ${shown(complete)}, thrown away ` +
      `${String(dropped)} of ${String(listedCount)} listed, pages fetched ${String(pagesFetched)} (engine needs ${String(neededPages)}, stop bound ${String(stopBound)})`
    const shortfalls: string[] = []
    // (1) THE CEILING: the closure can never hand the module a list the module is bound to reject WHOLE.
    if (documents.length > bound) {
      shortfalls.push(`documents.length ${String(documents.length)} EXCEEDS the bound ${String(bound)} — that list would be refused entire, which is the silent nothing this unit exists to close`)
    }
    // (2) THE COUPLING: `complete` is true IFF the closure dropped NOTHING (the assertion mutant (a) breaks).
    if (complete !== (listedCount === documents.length)) {
      shortfalls.push(
        `THE COUPLING BROKE: complete ${shown(complete)} while ${String(dropped)} of ${String(listedCount)} listed document(s) were ` +
          'dropped/withheld — `complete` is true IFF the walk dropped NOTHING, or a partial list licenses a delete (§5(ii))',
      )
    }
    // (3) THE FIXTURE'S OWN READING: the bound is a MAXIMUM and it must not fire early, nor one late (the assertion mutant (b) breaks).
    if (documents.length !== fixture.expectedDocuments) {
      shortfalls.push(`documents.length ${String(documents.length)} where this fixture owes ${String(fixture.expectedDocuments)} — the accumulation cap is off (it fired early, late, or not at all)`)
    }
    if (complete !== fixture.expectedComplete) {
      shortfalls.push(`complete ${shown(complete)} where this fixture owes ${String(fixture.expectedComplete)} — the walk's own claim about itself is wrong`)
    }
    // (4) THE WALK STOPS: no page beyond the bound is fetched, and no page the engine could not have is read.
    if (pagesFetched > neededPages) {
      shortfalls.push(`pages fetched ${String(pagesFetched)} > the ${String(neededPages)} page(s) the engine's own totals need — the walk read past the list`)
    }
    if (pagesFetched > stopBound) {
      shortfalls.push(`pages fetched ${String(pagesFetched)} > the stop bound ${String(stopBound)} (ceil(bound/pageSize) + 1) — the walk did NOT stop AT the bound`)
    }
    if (shortfalls.length === 0) readings.push(`${fixture.label} → ${reading}`)
    else fail(`${fixture.label} → ${reading} — ${shortfalls.join('; ')}`)
  }
  readings.push(`numbers read from the text: pageSize ${String(pageSize)}, maxPages ${String(maxPages)}, bound ${String(bound)}`)
  return { verdict: failures === 0, readings }
}

// ===========================================================================
// `F12` (`B4A-F12`) — THE WIRING'S ACCUMULATION AND THE MODULE'S BOUND ARE ONE BOUND.
//
// THE MEASURED DISAGREEMENT (read at `main.ts`'s `read:` closure against `engine-mirror.ts`'s `runWalk`): the closure accumulates
// documents across ALL wikis — up to `RECONCILE_PAGE_SIZE × RECONCILE_MAX_PAGES` (200 × 50 = 10 000) PER WIKI — while the module
// rejects a list whose SUMMED length exceeds `maxPerWalk` (also 10 000). So an engine with more than 10 000 documents spread over
// TWO OR MORE wikis mirrors NOTHING: the walk is typed `failed`, contained, and SILENT at the wiring (`B4A-F9`'s class one
// threshold down, and this time nothing reads it). A list the wiring can hand over that the module is bound to refuse is an
// over-read with no reader.
//
// THE SHAPE CHOSEN IS (a), AND IT IS PINNED AS (a): the WIRING stops accumulating AT the module's bound and reports
// `complete: false`, so no over-bound list is ever handed over and the uniform "a partial list writes nothing, and names
// nothing" rule (§5(ii), `ASM-L2-M2`) applies HONESTLY — the module's own bound stays as the backstop. BOTH SIDES READ ONE NAMED
// CONSTANT, `MIRROR_MAX_PER_WALK`, defined ONCE in `main.ts` as `RECONCILE_PAGE_SIZE * RECONCILE_MAX_PAGES`, consumed by the
// mirror's `maxPerWalk:` option AND by the accumulation cap in the `read:` closure. SHAPE (b) — leaving the wiring uncapped and
// only restating the module's bound — is NOT chosen: it leaves the silent nothing exactly in place.
//
// THE TWO MUTANTS THE CLAUSE MUST BE SHOWN FALSE FOR (this file's MUTANT-FIRST idiom, `c9(g)`/`c9(h)`'s): (1) the accumulation
// cap replaced by `Number.POSITIVE_INFINITY` (the cap removed — the wiring accumulates across every wiki again), and (2)
// `maxPerWalk: MIRROR_MAX_PER_WALK` replaced by `maxPerWalk: 2000` (the `B4A-F9` regression one threshold down). A mutant that
// cannot be built from the real text is a PROBLEM naming the absent needle, never a silent pass.
//
// LAYER (D-10 / RCA-12): limbs A and B are ENVELOPE (real modules over a real store on a `/tmp` path, and a type-only fake
// store); limbs C and D are source TEXT. No socket, no engine, no port, no Electron — and this comment names none of the
// vocabulary `C3` scans this file for.
//
// LIMB D IS A FOURTH LIMB, AND IT EXISTS BECAUSE A–C ARE SPELLING CLAUSES: its banner (above `limbD`) states the measured
// coverage gap and the two mutants it is built to be FALSE for. Short form: limb C's cap clause is two INDEPENDENT NEEDLES in
// one 2400-character window, so it never says the two are WIRED TOGETHER, and the two single-token mutants it misses —
// `if (!closed || capped) complete = false` → `if (!closed) complete = false`, and `>= MIRROR_MAX_PER_WALK` →
// `>= MIRROR_MAX_PER_WALK - 1` — both leave the battery green. Limb D therefore EXTRACTS `main.ts`'s `read:` closure from this
// text, type-erases it, and RUNS it against fixtures whose totals straddle the bound.
// ===========================================================================
describe('B-4a `F12` (B4A-F12) — the wiring\'s accumulation and the module\'s bound are ONE bound', () => {
  it('F12 — over the bound reads a NAMED state, AT the bound projects, and the wiring states ONE bound in ONE place with its reason', async () => {
    const problems: string[] = []
    const mod = await loadMirrorModule()
    problems.push(...mod.problems)

    /** `RECONCILE_PAGE_SIZE × RECONCILE_MAX_PAGES` = 200 × 50 (`src/main/main.ts:313-314`) — the ONE bound both sides must read. */
    const BOUND = 200 * 50
    const engineDocs = (prefix: string, count: number): Array<{ documentId: string; title: string }> =>
      Array.from({ length: count }, (_unused, index) => {
        const name = `${prefix}-${String(index).padStart(4, '0')}`
        return { documentId: name, title: name }
      })

    // ---- LIMB A — OVER the bound, spread over TWO wikis: a NAMED state, never a silent nothing ------------------------------
    // 5 000 titles `w1-…` then 5 001 titles `w2-…` = 10 001 documents: each wiki's own walk is INSIDE the per-wiki page bound, and
    // only their SUM crosses it. That is exactly the wiring's shape, so this limb is the one the module's backstop must name.
    const over = newRagStore()
    const overBefore = storeCounts(over.store)
    const overDocuments = [...engineDocs('w1-doc', 5000), ...engineDocs('w2-doc', 5001)]
    const overMirror = constructMirror(
      mod.createEngineMirror,
      {
        store: () => over.store,
        // The number the wiring states: `RECONCILE_PAGE_SIZE * RECONCILE_MAX_PAGES` (200 × 50, `main.ts:313-314`).
        maxPerWalk: BOUND,
        read: async () => ({ documents: overDocuments, complete: true }),
      },
      problems,
    )
    if (overMirror !== null) {
      const answer = await overMirror.reconcile()
      const status = overMirror.status()
      const keys = Object.keys(answer).sort().join(',')
      if (keys !== 'edgeIds,kind,nodeIds,store') {
        problems.push(`F12(A): the descriptor's keys read \`${keys}\` over an over-bound list — \`reconcile()\` still answers the FOUR-key engine-origin descriptor`)
      }
      if (answer.kind !== 'structural' || answer.store !== 'gnosis:engine') {
        problems.push(`F12(A): the descriptor reads \`kind\` ${shown(answer.kind)} / \`store\` ${shown(answer.store)} — a walk that could not complete answers the engine-origin \`structural\` descriptor`)
      }
      if (shown(answer.nodeIds) !== shown([])) {
        problems.push(
          `F12(A): \`reconcile()\` answered nodeIds ${shown(answer.nodeIds.slice(0, 3))}… (${String(answer.nodeIds.length)} id(s)) over an ` +
            `${String(overDocuments.length)}-document list read against maxPerWalk ${String(BOUND)} — an over-bound walk projects NOTHING, so it may name NOTHING`,
        )
      }
      if (status.walks !== 1) {
        problems.push(`F12(A): \`status().walks\` read ${String(status.walks)} — one \`reconcile()\` is one walk`)
      }
      if (status.projected !== 0) {
        problems.push(`F12(A): \`status().projected\` read ${String(status.projected)} — an over-bound list projects nothing at all (not even the entries it saw)`)
      }
      if (status.failed !== 1) {
        problems.push(`F12(A): \`status().failed\` read ${String(status.failed)} — an over-bound list is ONE contained, typed failure (lastFailure ${shown(status.lastFailure)})`)
      }
      if (
        typeof status.lastFailure !== 'string' ||
        !status.lastFailure.includes('over-bound') ||
        !status.lastFailure.includes('10001') ||
        !status.lastFailure.includes('10000')
      ) {
        problems.push(
          `F12(A): \`status().lastFailure\` read ${shown(status.lastFailure)} — the fault must be NAMED: it carries 'over-bound', the ` +
            `count read ('${String(overDocuments.length)}') and the bound ('${String(BOUND)}'), so the wiring's disagreement with the ` +
            `module is a reading and not a silence`,
        )
      }
      if (shown(markedRoots(over.store)) !== shown([])) {
        problems.push(`F12(A): the store holds marked roots ${shown(markedRoots(over.store))} after an over-bound walk — nothing may be projected`)
      }
      if (handleRagDocHeadsIpc(over.store).documents.length !== 0) {
        problems.push(`F12(A): the doc-heads read answered ${String(handleRagDocHeadsIpc(over.store).documents.length)} row(s) after an over-bound walk — nothing landed`)
      }
      if (shown(storeCounts(over.store)) !== shown(overBefore)) {
        problems.push(`F12(A): the store counts moved from ${shown(overBefore)} to ${shown(storeCounts(over.store))} across an over-bound walk — a partial list writes NOTHING (§5(ii))`)
      }
    }

    // ---- LIMB B — AT the bound (the boundary CONTROL): 10 000 documents project, so the bound is a MAXIMUM and not off by one --
    // A cheap FAKE store, typed `as unknown as RagStore` (the `D3`/`H6` idiom), so 10 000 projections cost no persistence: the
    // reading is about the BOUND, not about the store's writer.
    const fakeStore = {
      getNode: () => undefined,
      getEdge: () => undefined,
      listNodes: () => [],
      applyBatch: async () => ({ ok: true, results: [] }),
    } as unknown as RagStore
    const atDocuments = engineDocs('doc', BOUND)
    const atMirror = constructMirror(
      mod.createEngineMirror,
      { store: () => fakeStore, maxPerWalk: BOUND, read: async () => ({ documents: atDocuments, complete: true }) },
      problems,
    )
    if (atMirror !== null) {
      const answer = await atMirror.reconcile()
      const status = atMirror.status()
      const first = answer.nodeIds[0]
      const last = answer.nodeIds[answer.nodeIds.length - 1]
      const expectedFirst = atDocuments[0]?.documentId
      const expectedLast = atDocuments[atDocuments.length - 1]?.documentId
      if (answer.nodeIds.length !== BOUND) {
        problems.push(
          `F12(B): \`reconcile()\` named ${String(answer.nodeIds.length)} id(s) for EXACTLY ${String(BOUND)} listed documents (lastFailure ` +
            `${shown(status.lastFailure)}) — the bound is a MAXIMUM: \`>\` fails at ${String(BOUND + 1)}, \`===\` projects at ${String(BOUND)}`,
        )
      }
      if (first !== expectedFirst || last !== expectedLast) {
        problems.push(`F12(B): the named ids ran ${shown(first)} … ${shown(last)}, expected ${shown(expectedFirst)} … ${shown(expectedLast)} — the walk names the listed ids in the list's order`)
      }
      if (status.projected !== BOUND) {
        problems.push(`F12(B): \`status().projected\` read ${String(status.projected)} for ${String(BOUND)} listed documents (lastFailure ${shown(status.lastFailure)}) — an off-by-one bound (\`>=\` at the module) would red exactly here`)
      }
      if (status.failed !== 0) {
        problems.push(`F12(B): \`status().failed\` read ${String(status.failed)} AT the bound (lastFailure ${shown(status.lastFailure)}) — the bound is lawful at \`===\``)
      }
    }

    // ---- LIMB C — THE WIRING TEXT: one bound, one place, and the stated reason ---------------------------------------------
    const mainText = readTextOrProblem(MAIN_FILE, problems)
    if (mainText !== '') {
      const parts = (text: string): { onePlace: boolean; option: boolean; cap: boolean; reason: boolean } => {
        const stripped = stripComments(text)
        const mirrorWindow = windowAround(stripped, 'createEngineMirror(', 0, 2400).text
        const rawMirrorWindow = windowAround(text, 'createEngineMirror(', 0, 2400).text
        const readWindow = windowAround(stripped, 'read: async', 0, 2400).text
        return {
          // (1) the product is stated in EXACTLY ONE place — `MIRROR_MAX_PER_WALK`'s definition — so the two sides cannot drift.
          onePlace: occurrences(stripped, 'RECONCILE_PAGE_SIZE * RECONCILE_MAX_PAGES') === 1,
          // (2) the mirror's option CONSUMES that one name instead of respelling a number.
          option: mirrorWindow.includes('maxPerWalk: MIRROR_MAX_PER_WALK'),
          // (3) the accumulation STOPS AT the bound and the walk reports itself PARTIAL (`complete = false`), so no over-bound list
          //     is ever handed over and the module's bound stays a backstop rather than the first reader of the disagreement.
          cap: /documents\.length\s*>=\s*MIRROR_MAX_PER_WALK/.test(readWindow) && readWindow.includes('complete = false'),
          // (4) the REASON is stated in prose at the wiring site — in a COMMENT, which is why this conjunct reads the RAW window.
          reason: rawMirrorWindow.includes('B4A-F12'),
        }
      }
      const clause = (text: string): boolean => {
        const reading = parts(text)
        return reading.onePlace && reading.option && reading.cap && reading.reason
      }
      const reading = parts(mainText)
      const missing: string[] = []
      if (!reading.onePlace) {
        const count = occurrences(stripComments(mainText), 'RECONCILE_PAGE_SIZE * RECONCILE_MAX_PAGES')
        missing.push(
          `\`RECONCILE_PAGE_SIZE * RECONCILE_MAX_PAGES\` stated exactly ONCE (read ${String(count)}) — one named \`MIRROR_MAX_PER_WALK\`, so the module's \`maxPerWalk:\` and the wiring's cap cannot drift apart`,
        )
      }
      if (!reading.option) missing.push('`maxPerWalk: MIRROR_MAX_PER_WALK` inside the `createEngineMirror(` window — the module consumes the ONE named bound')
      if (!reading.cap) {
        missing.push(
          '`documents.length >= MIRROR_MAX_PER_WALK` together with `complete = false` inside the `read: async` window — the accumulation stops AT the bound and the walk reports itself PARTIAL',
        )
      }
      if (!reading.reason) {
        missing.push(
          '`B4A-F12` in the (UNSTRIPPED) `createEngineMirror(` window — the wiring site states the REASON in prose, which the doc review ' +
            'reconciles against the pages; the window is the 2400 characters AFTER the needle, so the prose belongs beside `maxPerWalk:` or ' +
            'inside the `read:` closure (a banner above the call is outside it)',
        )
      }
      if (missing.length > 0) {
        problems.push(`F12(C): the one-bound clause is FALSE over \`${MAIN_FILE}\`; absent: ${missing.join(' | ')}`)
      }

      // THE MUTANT FIRST — each one is a reading of its own, reported even when the clause is already false above.
      const verdicts: string[] = []
      const noCap = mainText.replace(/documents\.length >= MIRROR_MAX_PER_WALK/g, 'documents.length >= Number.POSITIVE_INFINITY')
      if (noCap === mainText) {
        problems.push(
          `F12(C): the CAP-REMOVED mutant could not be built — \`documents.length >= MIRROR_MAX_PER_WALK\` is absent from \`${MAIN_FILE}\`, so ` +
            `that needle has no falsifiable subject (never a silent pass)`,
        )
        verdicts.push('cap removed → NOT BUILDABLE (needle absent)')
      } else {
        const verdict = clause(noCap)
        verdicts.push(`cap removed → ${verdict ? 'TRUE (the clause cannot fail)' : 'false'}`)
        if (verdict) {
          problems.push('F12(C): the clause answered TRUE with the accumulation cap replaced by `Number.POSITIVE_INFINITY` — the wiring would accumulate across every wiki again and hand the module a list it is bound to refuse, silently')
        }
      }
      const tightBound = mainText.replace('maxPerWalk: MIRROR_MAX_PER_WALK', 'maxPerWalk: 2000')
      if (tightBound === mainText) {
        problems.push(
          `F12(C): the TIGHT-BOUND mutant could not be built — \`maxPerWalk: MIRROR_MAX_PER_WALK\` is absent from \`${MAIN_FILE}\`, so the ` +
            `\`B4A-F9\` regression one threshold down has no needle (never a silent pass)`,
        )
        verdicts.push('bound stated as 2000 → NOT BUILDABLE (needle absent)')
      } else {
        const verdict = clause(tightBound)
        verdicts.push(`bound stated as 2000 → ${verdict ? 'TRUE (the clause cannot fail)' : 'false'}`)
        if (verdict) {
          problems.push('F12(C): the clause answered TRUE with `maxPerWalk: 2000` — that is the `B4A-F9` regression one threshold down: the bound and the walk would disagree again, invisibly')
        }
      }
      if (problems.length > 0) problems.push(`F12 MUTANT VERDICTS: ${verdicts.join(' · ')}`)

      // ---- LIMB D — THE WIRING'S OWN CONTROL FLOW, EXECUTED: the closure LIFTED OUT OF THE TEXT AND RUN --------------------
      // LIMBS A–C READ THE SPELLING; THIS ONE RUNS THE ARITHMETIC. `limbD` (banner above it, module scope) is a FUNCTION OF THE
      // TEXT, so both single-token mutants the adversarial pass measured GREEN are run FIRST and the REAL text LAST — the verdict
      // this row asserts is the real one.
      const mutantVerdictsD: string[] = []

      // MUTANT (a) — THE CAPPED STATE NO LONGER REPORTS ITSELF PARTIAL: a walk that stops AT the bound then claims `complete`.
      const PARTIAL_NEEDLE = 'if (!closed || capped) complete = false'
      const partialUnreported = mainText.replace(PARTIAL_NEEDLE, 'if (!closed) complete = false')
      const partialBuilt = partialUnreported !== mainText
      if (!partialBuilt) {
        problems.push(
          `F12(D): the UNREPORTED-PARTIAL mutant (a) could not be built — \`${PARTIAL_NEEDLE}\` is absent from \`${MAIN_FILE}\`, so the ` +
            'coupling between the cap and the walk\'s own claim has no falsifiable subject (never a silent pass)',
        )
        mutantVerdictsD.push('capped state not reported (a) → NOT BUILDABLE (needle absent)')
      } else {
        const verdict = await limbD(partialUnreported)
        mutantVerdictsD.push(`capped state not reported (a) → ${verdict.verdict ? 'TRUE (the limb cannot fail)' : 'false'}`)
        if (verdict.verdict) {
          problems.push(
            `F12(D): the limb answered TRUE with \`${PARTIAL_NEEDLE}\` reduced to \`if (!closed) complete = false\` — a walk that ` +
              'STOPPED AT the bound would then report itself COMPLETE, the module would name the truncated list and its ' +
              `delete-on-absence phase would REMOVE the documents the walk dropped (§5(ii): a partial list may never license a delete). Readings: ${verdict.readings.join(' · ')}`,
          )
        }
      }

      // MUTANT (b) — OFF BY ONE: the cap fires one document EARLY, so an engine of EXACTLY `bound` documents reads `bound - 1`
      // and the module answers `nodeIds []`, `projected 0`, `failed 1` — the silent nothing this unit exists to close.
      const CAP_NEEDLE = 'documents.length >= MIRROR_MAX_PER_WALK'
      const offByOne = mainText.replace(CAP_NEEDLE, 'documents.length >= MIRROR_MAX_PER_WALK - 1')
      const capBuilt = offByOne !== mainText
      if (!capBuilt) {
        problems.push(
          `F12(D): the OFF-BY-ONE mutant (b) could not be built — \`${CAP_NEEDLE}\` is absent from \`${MAIN_FILE}\`, so the accumulation ` +
            'cap has no falsifiable subject (never a silent pass)',
        )
        mutantVerdictsD.push('cap one document early (b) → NOT BUILDABLE (needle absent)')
      } else if (partialBuilt && offByOne === partialUnreported) {
        problems.push('F12(D): the OFF-BY-ONE mutant (b) is INDISTINGUISHABLE from mutant (a) — both replacements landed on the same text, so neither is isolated (never a silent pass)')
        mutantVerdictsD.push('cap one document early (b) → NOT ISOLATED')
      } else {
        const verdict = await limbD(offByOne)
        mutantVerdictsD.push(`cap one document early (b) → ${verdict.verdict ? 'TRUE (the limb cannot fail)' : 'false'}`)
        if (verdict.verdict) {
          problems.push(
            'F12(D): the limb answered TRUE with the accumulation cap lowered by ONE (`MIRROR_MAX_PER_WALK - 1`) — an engine of ' +
              'EXACTLY the bound would then read one document short and report itself PARTIAL, which the module answers with an ' +
              `EMPTY descriptor: the silent nothing, restored by one token. Readings: ${verdict.readings.join(' · ')}`,
          )
        }
      }

      // THE REAL TEXT LAST — its verdict is the one this row asserts, and every failed step is a NAMED problem (never a silence).
      const realLimbD = await limbD(mainText)
      if (!realLimbD.verdict) {
        for (const entry of realLimbD.readings) {
          if (entry.startsWith('✗ ')) problems.push(`F12(D): ${entry.slice('✗ '.length)}`)
        }
      }
      if (problems.length > 0) {
        // EVERY READING IS KEPT, so a partial pass cannot hide one: the five fixtures' own numbers, then both mutant verdicts.
        problems.push(`F12(D) READINGS (REAL text, run LAST): ${realLimbD.readings.join(' · ')}`)
        problems.push(`F12(D) MUTANT VERDICTS: ${mutantVerdictsD.join(' · ')}`)
      }
    }

    expect(problems, `F12:\n${problems.join('\n')}`).toEqual([])
  })
})
