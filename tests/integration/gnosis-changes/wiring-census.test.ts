// tests/integration/gnosis-changes/wiring-census.test.ts — unit `B-4` `engine-changes`'s WIRING row (`c9`): ONE construction,
// ONE channel, NO new constant, `close()` on the quit path, and the three `engine-rag-store.ts` bytes. Authored BEFORE the
// wiring exists (RCA-1).
//
// SOURCE OF EVERY ASSERTION: `docs/L1/unit-b-4-engine-changes.md` §4 and §5 `c9` —
//   §4   "the consumer is constructed at boot BESIDE THE TWO ENGINE PROXIES … construction is inert, and `connect()` is called
//          WITHOUT awaiting, so an absent engine can never block the boot … Its `reconcile` is the engine CRUD read; its sink
//          broadcasts the descriptor on the EXISTING channel `IPC_RAG_STORE_CHANGED` … NO NEW CHANNEL CONSTANT, no `preload.ts`
//          byte, no `shared/types.ts` widening; and `app`'s quit path calls `close()`."
//   `c9`  "`main.ts` constructs the consumer ONCE, its sink broadcasts the descriptor on the existing `IPC_RAG_STORE_CHANGED`
//          payload shape, and `close()` is reachable from the quit path; a census row reads `IPC_RAG_STORE_CHANGED`'s name still
//          spelled ONCE as a constant (`src/shared/types.ts:403`) and NO new channel constant." — plus, ⟨ADDED AT THE LANDING
//          (`F-2`, ruled)⟩, "a SOURCE-ORDER row reads that `connect()` follows the window's construction in `main.ts`, so no
//          descriptor is broadcast into no realm" (`c9(g)`).
//   §3   the three `engine-rag-store.ts` bytes: `ENGINE_ENDPOINTS.changes`, the engine-origin label, the descriptor re-export.
//
// LAYER (D-10 / RCA-12): ENVELOPE-CLASS — source TEXT with comments stripped (`main.ts` runs `app.whenReady()` at module scope and
// is NEVER imported by a test, the `display-wire-lockstep` precedent). What this layer can NEVER say: that the boot listened on a
// socket, that a descriptor reached a window, or that the quit path really closed one — the assembled-app limb is PARKED.
//
// NON-VACUITY: every clause is a MEASURED count (exactly one, or a position), never a "contains", and each is paired with the
// absence it forbids — no channel literal in `main.ts`, no second construction site, no awaited `connect()`.
//
// RE-GRAINED BY UNIT `B-4a` (`O-2`), TWO ROWS, NEVER ONE DELETED: `c9(c)` reads the engine document-list walk in a SECOND window
// around `createEngineMirror(` (the walk moved from the feed's `reconcile:` into the mirror's `read:`), and `c9(h)` needles
// `read: async` instead of `reconcile: async`. Every subject of both rows is kept; each row's own comment names what moved.
import { describe, it, expect } from 'vitest'

import { occurrences, readText, stripComments } from './harness.js'

const MAIN_FILE = 'src/main/main.ts'
const ENGINE_STORE_FILE = 'src/main/engine-rag-store.ts'
const TYPES_FILE = 'src/shared/types.ts'

/** A window of code around a needle — how a source clause reads "the call's own body" without a parser. */
function windowAround(code: string, needle: string, before: number, after: number): { text: string; at: number } {
  const at = code.indexOf(needle)
  if (at < 0) return { text: '', at }
  return { text: code.slice(Math.max(0, at - before), at + needle.length + after), at }
}

describe('B-4 §5 `c9` — the wiring: ONE construction, ONE channel, no orphan', () => {
  it('c9(a) — `main.ts` constructs the feed ONCE, beside the CRUD proxy and BEFORE `new BrowserWindow(`', () => {
    // MUTATION THAT WOULD RED IT: a second construction site (a per-window feed), a site placed after the window (a second
    // connection route), or a feed constructed before the CRUD proxy it re-reads through.
    const problems: string[] = []
    const code = stripComments(readText(MAIN_FILE))
    const sites = occurrences(code, 'createEngineChangesFeed(')
    if (sites !== 1) problems.push(`c9(a): \`createEngineChangesFeed(\` occurs ${sites} time(s) in main.ts — §4 and §5 c9 require EXACTLY ONE construction at boot`)
    const feedAt = code.indexOf('createEngineChangesFeed(')
    const crudAt = code.indexOf('createEngineCrudRagStore(')
    const windowAt = code.indexOf('new BrowserWindow(')
    if (feedAt >= 0) {
      if (crudAt < 0) problems.push('c9(a): `createEngineCrudRagStore(` is absent from main.ts — the construction\'s neighbour (§4 "beside the two engine proxies") has no subject')
      else if (feedAt < crudAt) problems.push('c9(a): the feed is constructed BEFORE the CRUD proxy it re-reads through — the `reconcile` closes over a binding that does not exist yet')
      if (windowAt < 0) problems.push('c9(a): `new BrowserWindow(` is absent from main.ts — the "before the window" limb has no upper bound')
      else if (feedAt > windowAt) problems.push('c9(a): the feed is constructed AFTER `new BrowserWindow(` — §4 puts construction at boot, with the two proxies')
    }
    if (occurrences(code, "from './engine-changes.js'") !== 1) {
      problems.push("c9(a): main.ts does not import `./engine-changes.js` exactly once — the wiring has no module to construct")
    }
    expect(problems, `c9(a):\n${problems.join('\n')}`).toEqual([])
  })

  it('c9(b) — `connect()` is called WITHOUT awaiting, so an absent engine cannot block the boot', () => {
    // MUTATION THAT WOULD RED IT: `await feed.connect()` (the boot waits on a socket), or no `connect()` call at all.
    const problems: string[] = []
    const code = stripComments(readText(MAIN_FILE))
    const bind = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*createEngineChangesFeed\(/.exec(code)
    if (bind === null) {
      problems.push('c9(b): no `const <name> = createEngineChangesFeed(` binding resolves in main.ts — there is no handle to connect')
    } else {
      const name = bind[1]!
      const awaited = occurrences(code, `await ${name}.connect(`)
      const voided = occurrences(code, `void ${name}.connect(`)
      const plain = occurrences(code, `${name}.connect(`) - awaited - voided
      if (awaited !== 0) problems.push(`c9(b): \`await ${name}.connect(\` occurs ${awaited} time(s) — §4 calls it WITHOUT awaiting`)
      if (voided !== 1) problems.push(`c9(b): \`void ${name}.connect(\` occurs ${voided} time(s) — exactly ONE fire-and-forget connect is required`)
      if (plain !== 0) problems.push(`c9(b): \`${name}.connect(\` occurs ${plain} time(s) outside a \`void\`/\`await\` — an unmarked call leaves its rejection unowned`)
    }
    expect(problems, `c9(b):\n${problems.join('\n')}`).toEqual([])
  })

  it('c9(c) — the sink broadcasts on the EXISTING channel and the re-read is the engine CRUD read', () => {
    // MUTATION THAT WOULD RED IT: a new channel constant, a sink that logs instead of broadcasting, or a `reconcile` that
    // invents its answer instead of reading the engine (the `ASM-B4-3` refusal).
    //
    // **RE-GRAINED, NEVER DELETED (`O-2`; `docs/L1/unit-b-4a-engine-store-mirror.md` §9 `O-2`,
    // `docs/L2/gnosis-changes/engine-mirror.md` §7's last row):** the WALK MOVED. Under unit `B-4a` the engine document-list
    // walk leaves the feed's `reconcile:` and becomes the MIRROR's `read:` in `main.ts` — the mirror owns it so that its
    // `reconcile()` is walk + project + answer in ONE act (`ASM-B4A-3`), which is the whole of that unit's invariant. So the
    // walk subjects (`listWikis(`, `listDocuments(`, the engine-origin label and the two bounds) are read in a SECOND window
    // around `createEngineMirror(`, and the feed window keeps the subjects it still owns: `onChange`,
    // `IPC_RAG_STORE_CHANGED`, `broadcast(` and `reconcile`. NO SUBJECT OF THIS ROW WAS DROPPED — every one of them is still
    // an exact count or a presence, and the full-file `ENGINE_ORIGIN_STORE` count is still asserted below.
    const problems: string[] = []
    const code = stripComments(readText(MAIN_FILE))
    const site = windowAround(code, 'createEngineChangesFeed(', 0, 2000)
    if (site.text === '') {
      problems.push('c9(c): the construction site is absent, so its sink and its re-read have no window to read')
    } else {
      if (!site.text.includes('onChange')) problems.push('c9(c): the construction window carries no `onChange` — §2 requires the sink')
      if (!site.text.includes('IPC_RAG_STORE_CHANGED')) {
        problems.push('c9(c): the construction window never names `IPC_RAG_STORE_CHANGED` — the sink must broadcast on the EXISTING channel')
      }
      if (!site.text.includes('broadcast(')) problems.push('c9(c): the construction window carries no `broadcast(` — the descriptor reaches no realm')
      if (!site.text.includes('reconcile')) problems.push('c9(c): the construction window carries no `reconcile` — §2.4\'s re-read is REQUIRED')
    }
    // THE SECOND WINDOW (`O-2`) — the walk's NEW home, `main.ts`'s mirror construction (`B-4a` §5 site 1).
    const walk = windowAround(code, 'createEngineMirror(', 0, 2400)
    if (walk.text === '') {
      problems.push('c9(c): the `createEngineMirror(` window is absent from main.ts — the engine document-list walk has no home, so §2.4\'s re-read cannot cover the engine at all')
    } else {
      const wikis = occurrences(walk.text, 'listWikis(')
      if (wikis !== 1) problems.push('c9(c): the MIRROR window reads `listWikis(` ' + wikis + ' time(s) — §5 site 1 gives the walk the FULL engine CRUD read, wikis FIRST')
      const documents = occurrences(walk.text, 'listDocuments(')
      if (documents !== 1) problems.push('c9(c): the MIRROR window reads `listDocuments(` ' + documents + ' time(s) — §5 site 1 gives the walk each wiki\'s documents')
      if (!walk.text.includes('ENGINE_ORIGIN_STORE')) {
        problems.push('c9(c): the walk\'s descriptor does not carry `ENGINE_ORIGIN_STORE` — ASM-B4-1 pins the engine-origin label, not a registry name')
      }
      if (!walk.text.includes('RECONCILE_PAGE_SIZE')) problems.push('c9(c): the MIRROR window carries no `RECONCILE_PAGE_SIZE` — the walk must read EVERY page under the unit\'s own page size')
      if (!walk.text.includes('RECONCILE_MAX_PAGES')) problems.push('c9(c): the MIRROR window carries no `RECONCILE_MAX_PAGES` — without the bound a lying `total` holds the walk open for ever (`F-4`)')
    }
    if (occurrences(code, 'ENGINE_ORIGIN_STORE') === 0) {
      problems.push('c9(c): main.ts never names `ENGINE_ORIGIN_STORE` — the origin label is not wired at all')
    }
    expect(problems, `c9(c):\n${problems.join('\n')}`).toEqual([])
  })

  it('c9(d) — `close()` is reachable from the app\'s QUIT path, so no socket is orphaned', () => {
    // MUTATION THAT WOULD RED IT: a feed with no `close()` call outside `connect()`/tests (the orphan the contract names), or one
    // registered on an event the quit path never emits.
    const problems: string[] = []
    const code = stripComments(readText(MAIN_FILE))
    const bind = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*createEngineChangesFeed\(/.exec(code)
    if (bind === null) {
      problems.push('c9(d): no feed binding resolves in main.ts — `close()` has no subject')
    } else {
      const name = bind[1]!
      const quitAt = code.indexOf("before-quit")
      if (quitAt < 0) {
        problems.push(`c9(d): main.ts registers no \`before-quit\` handler — §4 puts \`${name}.close()\` on the app's quit path`)
      } else {
        const region = code.slice(quitAt, quitAt + 400)
        if (!region.includes(`${name}.close(`)) {
          problems.push(`c9(d): the \`before-quit\` region does not call \`${name}.close(\` — the feed's socket would outlive the app`)
        }
      }
      const closes = occurrences(code, `${name}.close(`)
      if (closes < 1) problems.push(`c9(d): \`${name}.close(\` is never called in main.ts`)
    }
    expect(problems, `c9(d):\n${problems.join('\n')}`).toEqual([])
  })

  it('c9(e) — NO new channel constant: the channel NAME is spelled exactly once in `src/**`, in `shared/types.ts`', () => {
    // MUTATION THAT WOULD RED IT: a `provident:engine-changes` literal in main.ts, a second declaration of the existing name, or a
    // re-spelling in a new module. The `main.ts` literal census is the teeth: the file that would naturally invent one carries none.
    const problems: string[] = []
    const typesCode = stripComments(readText(TYPES_FILE))
    const mainCode = stripComments(readText(MAIN_FILE))
    const channelName = 'provident:rag-store-changed'
    if (occurrences(typesCode, channelName) !== 1) {
      problems.push(`c9(e): the channel literal occurs ${occurrences(typesCode, channelName)} time(s) in \`${TYPES_FILE}\` — it is declared ONCE there (types.ts:403)`)
    }
    if (occurrences(mainCode, 'provident:') !== 0) {
      problems.push(`c9(e): main.ts spells ${occurrences(mainCode, 'provident:')} channel literal(s) — the wiring rides the IMPORTED constant, never a literal`)
    }
    let changesCode = ''
    try {
      changesCode = stripComments(readText('src/main/engine-changes.ts'))
    } catch {
      changesCode = ''
    }
    if (changesCode !== '' && occurrences(changesCode, 'provident:') !== 0) {
      problems.push('c9(e): `engine-changes.ts` spells a channel literal — §2 gives the consumer no IPC vocabulary at all')
    }
    expect(problems, `c9(e):\n${problems.join('\n')}`).toEqual([])
  })

  it('c9(f) — the THREE bytes of `engine-rag-store.ts`: the `changes` route, the engine-origin label, the descriptor re-export', () => {
    // MUTATION THAT WOULD RED IT: the route spelled in the consumer instead (`c6` forbids it), a label that a registry name could
    // mint (`ASM-B4-1`), or a re-spelled descriptor type.
    const problems: string[] = []
    const code = stripComments(readText(ENGINE_STORE_FILE))
    if (occurrences(code, "changes: '/changes'") !== 1) {
      problems.push("c9(f): `ENGINE_ENDPOINTS` does not carry `changes: '/changes'` exactly once — the route belongs with the other pinned engine paths")
    }
    if (occurrences(code, "ENGINE_ORIGIN_STORE = 'gnosis:engine'") !== 1) {
      problems.push("c9(f): `ENGINE_ORIGIN_STORE = 'gnosis:engine'` is not declared here exactly once — ASM-B4-1's label lives beside the surface whose origin it names")
    }
    if (!/export\s+type\s*\{[^}]*RagStoreChangedPayload[^}]*\}\s*(?:from\s*'\.\.\/shared\/types\.js')?/.test(code)) {
      problems.push('c9(f): the descriptor type is not re-exported from `engine-rag-store.ts` — the mapping must name the fork\'s ONE vocabulary (§3)')
    }
    // The label can never be minted by the registry's own name pattern — the reason ASM-B4-1 is safe.
    const pattern = /RAG_STORE_NAME_PATTERN_INTERNAL[^\n]*?\/\^\[a-z0-9\]\[a-z0-9_-\]\{0,63\}\$\//.exec(
      stripComments(readText('src/main/rag-store-registry.ts')),
    )
    if (pattern === null) {
      problems.push('c9(f): `RAG_STORE_NAME_PATTERN` could not be read as `/^[a-z0-9][a-z0-9_-]{0,63}$/` — the "provably not a registry name" claim has no subject')
    } else if (/^[a-z0-9][a-z0-9_-]{0,63}$/.test('gnosis:engine')) {
      problems.push('c9(f): the engine-origin label MATCHES the registry pattern — ASM-B4-1\'s fail-closed separation is broken')
    }
    expect(problems, `c9(f):\n${problems.join('\n')}`).toEqual([])
  })

  it('c9(g) — SOURCE ORDER: `connect()` follows the WINDOW\'s construction, so the first descriptor lands in a realm that exists', () => {
    // ADDED AT THE LANDING (`F-2`, RULED BY `L1`): as first wired, `void feed.connect()` was issued BEFORE `new BrowserWindow`,
    // so the re-read's descriptor AND the connection's frames were broadcast into no realm and DROPPED (`backend.broadcast` is a
    // no-op with no attached window, `READ` `mcp-server.ts:2849-2857`) — a hidden loss with no forcing function behind the early
    // call. The clause is a function of the TEXT so it can be falsified: lift the call back above the window and it MUST read
    // false, which is the mutant driven first below.
    const bind = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*createEngineChangesFeed\(/
    const clause = (text: string): boolean => {
      const code = stripComments(text)
      const name = bind.exec(code)?.[1]
      if (name === undefined) return false
      const windowAt = code.indexOf('new BrowserWindow(')
      const connectAt = code.indexOf(`void ${name}.connect(`)
      if (windowAt < 0 || connectAt < 0) return false
      return connectAt > windowAt
    }
    const problems: string[] = []
    let real = ''
    try {
      real = readText(MAIN_FILE)
    } catch (err) {
      problems.push(`c9(g): \`${MAIN_FILE}\` could not be read (${err instanceof Error ? err.message : String(err)})`)
    }
    if (real !== '') {
      const code = stripComments(real)
      const name = String(bind.exec(code)?.[1] ?? '')
      const call = `void ${name}.connect()`
      // THE MUTANT FIRST — the landed `F-2` shape, rebuilt: the connect call lifted above the window's construction.
      const mutant = code.replace(call, '').replace('const win = new BrowserWindow(', `${call}\n  const win = new BrowserWindow(`)
      if (mutant === code) problems.push('c9(g): the mutant could not be built from this file — the clause has no falsifiable subject')
      else if (clause(mutant)) {
        problems.push('c9(g): the clause answered TRUE with `connect()` lifted above `new BrowserWindow(` — the clause cannot fail and proves nothing')
      }
      if (!clause(real)) {
        problems.push(`c9(g): \`${MAIN_FILE}\` issues \`${call}\` BEFORE \`new BrowserWindow(\` — that descriptor and every frame of that connection are broadcast into no realm (F-2, ruled)`)
      }
      // AND IT IS STILL NOT AWAITED: the post-window site must not turn the boot into a socket wait (§4's amendment keeps this).
      if (occurrences(code, `await ${name}.connect(`) !== 0) {
        problems.push(`c9(g): the post-window site AWAITS \`connect()\` — an absent engine must never hold the boot (the \`waitForReady\` precedent, main.ts:828-829)`)
      }
    }
    expect(problems, `c9(g):\n${problems.join('\n')}`).toEqual([])
  })

  it('c9(h) — the RE-READ\'s walk is PAGED and BOUNDED (the contract\'s "a row pins the walk\'s bound", and `F-4`\'s own claim)', () => {
    // WHY THIS ROW EXISTS: `docs/L1/unit-b-4-engine-changes.md` §2.4 rests the whole anchor on the re-read COVERING everything at
    // or below the announced head — and a re-read that quietly reads one page (or walks for ever on a lying `total`) would make
    // that coverage claim false while §2.3 kept dropping frames "because the re-read covers it" (`F-4`). The clause is a function
    // of the TEXT, and the mutants below are the two ways it can be false: an unpaged single read, and an unbounded loop.
    //
    // **RE-GRAINED, NEVER DELETED (`O-2`; `docs/L1/unit-b-4a-engine-store-mirror.md` §9 `O-2`,
    // `docs/L2/gnosis-changes/engine-mirror.md` §7's last row):** the walk MOVED from the feed's `reconcile:` closure into the
    // MIRROR's `read:` member in `main.ts` (`B-4a` §5 site 1), so the needle is `read: async` instead of `reconcile: async`.
    // ALL SIX clause subjects and BOTH mutants are kept, unchanged: the same page size, the same page bound, the same
    // `page <= RECONCILE_MAX_PAGES` loop, the same `page += 1` step, the same `seen >= listed.total` exit, and the same
    // `pageSize: 300+` mutant. No subject was dropped and no bound was loosened.
    const clause = (text: string): boolean => {
      const code = stripComments(text)
      const site = windowAround(code, 'read: async', 0, 2000).text
      if (site === '') return false
      return (
        site.includes('RECONCILE_PAGE_SIZE') &&
        site.includes('RECONCILE_MAX_PAGES') &&
        /page\s*<=\s*RECONCILE_MAX_PAGES/.test(site) &&
        /page\s*\+=\s*1/.test(site) &&
        /seen\s*>=\s*listed\.total/.test(site) &&
        !/pageSize:\s*[0-9]{3,}/.test(site)
      )
    }
    const problems: string[] = []
    let real = ''
    try {
      real = readText(MAIN_FILE)
    } catch (err) {
      problems.push(`c9(h): \`${MAIN_FILE}\` could not be read (${err instanceof Error ? err.message : String(err)})`)
    }
    if (real !== '') {
      const unpaged = real.replace(/pageSize:\s*RECONCILE_PAGE_SIZE/g, 'pageSize: 1000').replace(/for \(let page = 1; page <= RECONCILE_MAX_PAGES; page \+= 1\) \{/, '{')
      if (unpaged === real) problems.push('c9(h): the mutants could not be built — the clause has no falsifiable subject')
      else if (clause(unpaged)) problems.push('c9(h): the clause answered TRUE for an UNPAGED read (`pageSize: 1000`, no page loop) — the clause cannot fail')
      const unbounded = real.replace(/page <= RECONCILE_MAX_PAGES/, 'page <= Number.POSITIVE_INFINITY')
      if (unbounded !== real && clause(unbounded)) {
        problems.push('c9(h): the clause answered TRUE for an UNBOUNDED walk — a lying `total` would hold the re-read open for ever')
      }
      if (!clause(real)) {
        problems.push(`c9(h): the \`read\` in \`${MAIN_FILE}\` is not a PAGED and BOUNDED walk (\`RECONCILE_PAGE_SIZE\` / \`RECONCILE_MAX_PAGES\` / a \`seen >= total\` exit) — an unpaged re-read cannot carry §2.3's "the re-read covers it"`)
      }
    }
    expect(problems, `c9(h):\n${problems.join('\n')}`).toEqual([])
  })
})
