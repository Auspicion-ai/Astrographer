// tests/unit-ms4-id-prefixing-adversarial.test.ts — Unit U-MS4: the RCA-3
// adversarial-pass regression file (docs/specs/unit-ms4-id-prefixing.md §3a).
//
// RED-FIRST (RCA-1) — written and run against the PRE-FIX module BEFORE any
// fix lands. The Architect's ruled fix batch is F-MS4-1/2/3/4/6; the R-series
// tests below pin each ruling:
//
//   F-MS4-1  INV-6 erratum — the seam-minted edge ids for a default doc vs a
//            non-default store's same-named doc are DISTINCT (the §5.5
//            example's claimed coincidence is impossible: the non-default
//            documentId is colon-prefixed, every default documentId is
//            colon-free). Guard — green on arrival (pins the corrected
//            non-coincidence).
//   F-MS4-2  the SC-validated context SNAPSHOT — the A1 gate + the prefix
//            mint must read the SNAPSHOTTED `isDefault`/`name`/
//            `reservedNames`, never re-read the context by property access
//            (a getter/Proxy can desync between the SC battery and the
//            gate/mint). RED: the pre-fix module's mint re-reads `isDefault`
//            (an unprefixed mint leaks past a prefix-mode SC battery) and its
//            A1 gate re-reads `reservedNames` (a desynced list waves the
//            collision through).
//   F-MS4-3  the malformed-corpusRoot guard — a non-string `params.corpusRoot`
//            currently throws an UNCAUGHT TypeError at
//            `resolve(params.corpusRoot ?? process.cwd())`, contradicting the
//            module's NEVER-throws-for-a-domain-failure pin. RED today.
//   F-MS4-4  the NUL-byte probe — a NUL-bearing file path fails closed with
//            the EXISTING `cannot read file` message (today only by accident
//            of the host's statSync validation). Guard — green on arrival.
//   F-MS4-6  the A1 boundary family — the four sanitize-onto basenames
//            REJECT, the surviving-trailing-dot basename IMPORTS. Guard —
//            green on arrival (the predicate operates on the SANITIZED base).
//
// Conventions follow tests/unit-ms4-id-prefixing.test.ts (vitest node
// environment, `.js` import suffix for the main-process ESM modules, mkdtemp
// temp dirs, byte-exact message assertions, malformed values cast through
// unknown). NO registry module, NO Electron, NO U-MS2 wiring.
import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import {
  importMarkdownCorpus,
  type ImportMarkdownParams,
  type ImportMarkdownResult,
  type ImportStoreContext,
} from '../src/main/markdown-import.js'
import type { EditOpContext } from '../src/main/edit-ops.js'
import { createJsonRagStore, type RagStore } from '../src/main/rag-store.js'

// ---------------------------------------------------------------------------
// Helpers (house style).
// ---------------------------------------------------------------------------

async function withDirAsync<T>(run: (dir: string) => Promise<T>): Promise<T> {
  const dir = mkdtempSync(join(tmpdir(), 'provident-ms4-adv-'))
  try {
    return await run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** A transient mkdtemp dir INSIDE process.cwd() — for the importer's pinned
 *  `process.cwd()` default (F-MS4-3's null/undefined probe). */
async function withCwdDir<T>(run: (relFile: string, absFile: string) => Promise<T>): Promise<T> {
  const abs = mkdtempSync(join(process.cwd(), 'provident-ms4-adv-cwd-'))
  const rel = relative(process.cwd(), abs)
  try {
    return await run(join(rel, 'note.md'), join(abs, 'note.md'))
  } finally {
    rmSync(abs, { recursive: true, force: true })
  }
}

function writeMd(dir: string, name: string, content: string): string {
  const p = join(dir, name)
  writeFileSync(p, content, 'utf8')
  return p
}

function makeCtx(store: RagStore): EditOpContext {
  return { store }
}

function freshStore(dir: string, name: string): RagStore {
  return createJsonRagStore({ path: join(dir, `rag-${name}.json`) })
}

/** The off-type casting seam (house style): the corpusRoot guard is a RUNTIME
 *  defensive rule for deliberately off-type values — cast through unknown. */
function corpusRoot(value: unknown): ImportMarkdownParams['corpusRoot'] {
  return value as ImportMarkdownParams['corpusRoot']
}

/** The malformed store-context casting seam (house style). */
function storeCtx(value: unknown): ImportStoreContext {
  return value as ImportStoreContext
}

function expectOk(r: ImportMarkdownResult): Extract<ImportMarkdownResult, { ok: true }> {
  expect(r.ok, `expected ok, got failure: ${!r.ok ? r.error : ''}`).toBe(true)
  if (!r.ok) throw new Error('expected ok, got failure: ' + r.error)
  return r
}

function expectFail(r: ImportMarkdownResult): Extract<ImportMarkdownResult, { ok: false }> {
  expect(r.ok, 'expected failure, got ok').toBe(false)
  if (r.ok) throw new Error('expected failure, got ok')
  return r
}

// ---------------------------------------------------------------------------
// Fixtures.
// ---------------------------------------------------------------------------

const DEFAULT_NAME = 'main'
const OTHER_NAME = 'research-2026-09' // a valid U-MS1 charset name

/** The small census document ('# Note\n\nBody note.'): root + 1 section + 1
 *  paragraph; edges e-<doc>-1..5. */
const SMALL_MD = '# Note\n\nBody note.\n'

// ---------------------------------------------------------------------------
// F-MS4-2 — the hostile-context factories. A getter/Proxy context presents a
// DIFFERENT value per property read; the SC battery, the A1 gate and the mint
// each read the live context by property access in the PRE-FIX module, so the
// desync can steer the mint or wave an A1 collision through. The factories
// count reads of the hostile property and script the per-read value.
// ---------------------------------------------------------------------------

/** `isDefault` reads 1..readsFalse ⇒ false, then true forever. `name`/
 *  `reservedNames` are plain stable data properties ('S' / ['other-store']). */
function flippingIsDefaultCtx(readsFalse: number): ImportStoreContext {
  let reads = 0
  const target = { name: 'S', reservedNames: ['other-store'] }
  return new Proxy(target, {
    get(t, prop, receiver) {
      if (prop === 'isDefault') {
        reads++
        return reads <= readsFalse ? false : true
      }
      return Reflect.get(t, prop, receiver)
    },
  }) as unknown as ImportStoreContext
}

/** `reservedNames` reads 1..4 ⇒ a valid non-colliding list (the SC battery's
 *  reads — SC4/SC5 each read twice), read 5 ⇒ the COLLIDING list, reads 6+ ⇒
 *  an empty list. `isDefault`/`name` are plain stable data properties. */
function desyncingReservedNamesCtx(): ImportStoreContext {
  let reservedReads = 0
  const SC_LIST = ['placeholder-store']
  const SNAPSHOT_LIST = [OTHER_NAME]
  const AFTER_LIST: string[] = []
  const target = { name: DEFAULT_NAME, isDefault: true }
  return new Proxy(target, {
    get(t, prop, receiver) {
      if (prop === 'reservedNames') {
        reservedReads++
        if (reservedReads <= 4) return SC_LIST
        if (reservedReads === 5) return SNAPSHOT_LIST
        return AFTER_LIST
      }
      return Reflect.get(t, prop, receiver)
    },
  }) as unknown as ImportStoreContext
}

// ===========================================================================
// F-MS4-3 — the malformed corpusRoot guard (§5.2 step 3)
// ===========================================================================
describe('F-MS4-3 — a non-string params.corpusRoot ⇒ the byte-pinned fail-state, NEVER a thrown TypeError (§5.2 step 3)', () => {
  it('R5. the four non-string corpusRoot values (42 / false / {} / \'\') ⇒ `markdown import: corpusRoot must be a string (got <json>)`, NO failedFile, NO file I/O; the F-MS1-6 cap idiom holds for a >200-char rendering. RED pre-fix: an uncaught TypeError (ERR_INVALID_ARG_TYPE) at resolve().', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const store = freshStore(dir, 'a')
      // (a) The four pinned values ⇒ the byte-pinned message. `''` is pinned
      // as a CALLER ERROR too (the nullish coalescing keeps ''; consistency
      // chosen — an empty root is never a valid corpus root).
      const cases: [unknown, string][] = [
        [42, 'markdown import: corpusRoot must be a string (got 42)'],
        [false, 'markdown import: corpusRoot must be a string (got false)'],
        [{}, 'markdown import: corpusRoot must be a string (got {})'],
        ['', 'markdown import: corpusRoot must be a string (got "")'],
      ]
      for (const [badRoot, message] of cases) {
        const r = await importMarkdownCorpus(makeCtx(store), { files: [note], corpusRoot: corpusRoot(badRoot) })
        expect(r.ok).toBe(false)
        if (r.ok) throw new Error('expected failure, got ok')
        expect(r.error).toBe(message)
        expect(r.failedFile).toBeUndefined()
      }
      // NO file I/O: the guard precedes the resolve — the source file is
      // untouched and the store is unchanged.
      expect(readFileSync(note, 'utf8')).toBe(SMALL_MD)
      expect(store.listNodes()).toEqual([])
      expect(store.journal()).toHaveLength(0)
      // (b) The F-MS1-6 idiom: the rendering is CAPPED — a >200-char JSON
      // rendering renders as its first 197 chars + '…' (exactly 198 chars).
      const longArray: unknown = Array.from({ length: 30 }, () => 'x'.repeat(10))
      const rLong = await importMarkdownCorpus(makeCtx(store), { files: [note], corpusRoot: corpusRoot(longArray) })
      expect(rLong.ok).toBe(false)
      if (rLong.ok) throw new Error('expected failure, got ok')
      const prefix = 'markdown import: corpusRoot must be a string (got '
      expect(rLong.error.startsWith(prefix)).toBe(true)
      expect(rLong.error.endsWith(')')).toBe(true)
      const rendered = rLong.error.slice(prefix.length, -1)
      expect(rendered).toHaveLength(198)
      expect(rendered.endsWith('…')).toBe(true)
    })
  })

  it('R6. the guard precedence: the FILES guard precedes it and the SC battery precedes it; corpusRoot null/undefined keep the legacy cwd default (the nullish coalescing UNCHANGED)', async () => {
    // (a) The files guard (:63-65) precedes the corpusRoot guard (§5.2 step 1
    // before step 3).
    await withDirAsync(async (dir) => {
      const store = freshStore(dir, 'b')
      const r1 = await importMarkdownCorpus(makeCtx(store), { files: [], corpusRoot: corpusRoot(42) })
      expectFail(r1)
      expect(r1.error).toBe('markdown import: files must be a non-empty array')
      expect(r1.failedFile).toBeUndefined()
      // (b) The SC battery precedes the corpusRoot guard (§5.2 step 2 before
      // step 3 — an invalid context never reaches the root resolution).
      const r2 = await importMarkdownCorpus(
        makeCtx(store),
        { files: ['x.md'], corpusRoot: corpusRoot(42) },
        storeCtx('main'),
      )
      expectFail(r2)
      expect(r2.error).toBe('markdown import: invalid store context')
      expect(r2.failedFile).toBeUndefined()
      expect(store.listNodes()).toEqual([])
    })
    // (c) `corpusRoot: null` is NOT a caller error — the nullish coalescing
    // keeps null ⇒ the process.cwd() default (the legacy cwd rule).
    await withCwdDir(async (relFile, absNote) => {
      writeFileSync(absNote, SMALL_MD, 'utf8')
      await withDirAsync(async (dir) => {
        const store = freshStore(dir, 'c')
        const r = expectOk(
          await importMarkdownCorpus(makeCtx(store), { files: [relFile], corpusRoot: corpusRoot(null) }),
        )
        // U-D3 sanctioned re-pin: a nested cwd file is path-qualified.
        const id = relFile.replace(/\.md$/, '').split(/[\\/]/).join('/')
        expect(r.documentIds).toEqual([id])
        expect(store.getNode(`${id}:p:1`)!.content).toBe('Body note.')
      })
    })
  })
})

// ===========================================================================
// F-MS4-2 — the SC-validated context snapshot (the A1 gate + the mint read
// the snapshot, never the live context)
// ===========================================================================
describe('F-MS4-2 — a getter/Proxy context cannot desync the A1 gate or the mint from the SC battery (§3a F-MS4-2)', () => {
  it('R2. a Proxy whose isDefault getter flips AFTER the SC battery ⇒ the SNAPSHOT governs the mint (documentId `S:note`). RED pre-fix: the mint re-reads isDefault (now true) and mints UNPREFIXED `note` past a prefix-mode SC battery', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const store = freshStore(dir, 'c')
      // SC read 1 ⇒ false (prefix mode: SC2/SC3 validate `name`); snapshot
      // read 2 ⇒ false; the pre-fix mint read 3 ⇒ true (unprefixed mint).
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [note], corpusRoot: dir },
        flippingIsDefaultCtx(2),
      )
      expectOk(r)
      expect(r.documentIds).toEqual(['S:note'])
      expect(store.getNode('S:note')).toBeDefined()
      expect(store.getNode('S:note:section:1')).toBeDefined()
      // The unprefixed id must NOT exist — the desync must not leak a
      // default-store-shaped documentId out of a prefix-mode import.
      expect(store.getNode('note')).toBeUndefined()
    })
  })

  it('R3. a Proxy whose reservedNames getter desyncs between the SC battery and the A1 gate ⇒ the SNAPSHOT list governs the gate (the collision REJECTS). RED pre-fix: the gate re-reads the (now empty) live list and waves the collision through', async () => {
    await withDirAsync(async (dir) => {
      const research = writeMd(dir, 'research-2026-09.md', '# Research\n\nBody.\n')
      const store = freshStore(dir, 'd')
      // SC reads 1–4 ⇒ the valid non-colliding list; snapshot read 5 ⇒ the
      // colliding list; the pre-fix gate reads 5–6 live (read 6 ⇒ []).
      const r = await importMarkdownCorpus(
        makeCtx(store),
        { files: [research], corpusRoot: dir },
        desyncingReservedNamesCtx(),
      )
      expect(r.ok).toBe(false)
      if (r.ok) throw new Error('expected failure, got ok')
      expect(r.error).toBe(`markdown import: documentId collides with a registered store name: ${OTHER_NAME}`)
      expect(r.failedFile).toBe(research)
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
      expect(store.journal()).toHaveLength(0)
    })
  })

  it('R4. determinism — the SAME flipping-isDefault scenario run twice with fresh proxies ⇒ byte-equal results and byte-equal store content (the snapshot is one fixed read; the outcome cannot depend on downstream read counts)', async () => {
    await withDirAsync(async (dir) => {
      const note = writeMd(dir, 'note.md', SMALL_MD)
      const storeA = freshStore(dir, 'e')
      const storeB = freshStore(dir, 'f')
      const r1 = await importMarkdownCorpus(makeCtx(storeA), { files: [note], corpusRoot: dir }, flippingIsDefaultCtx(2))
      const r2 = await importMarkdownCorpus(makeCtx(storeB), { files: [note], corpusRoot: dir }, flippingIsDefaultCtx(2))
      expect(r1).toEqual(r2)
      expect(JSON.stringify(storeA.listNodes())).toBe(JSON.stringify(storeB.listNodes()))
      expect(JSON.stringify(storeA.listEdges())).toBe(JSON.stringify(storeB.listEdges()))
    })
  })
})

// ===========================================================================
// F-MS4-1 — INV-6 (corrected): cross-store EDGE ids are DISTINCT at the seam
// ===========================================================================
describe('F-MS4-1/INV-6 — the seam-minted edge ids for a default doc vs a non-default store\'s same-named doc are DISTINCT (§5.5 erratum)', () => {
  it('R1. default doc `research-2026-09-readme-3` mints e-research-2026-09-readme-3-N; store `research-2026-09` doc `readme-3` mints e-research-2026-09:readme-3-N — the sets are DISJOINT (the colon inside the prefixed documentId makes the coincidence unreachable)', async () => {
    await withDirAsync(async (dir) => {
      const corpus = join(dir, 'corpus')
      mkdirSync(corpus)
      const defaultFile = writeMd(corpus, 'research-2026-09-readme-3.md', SMALL_MD)
      const sFile = writeMd(corpus, 'readme-3.md', SMALL_MD)
      const storeDefault = freshStore(dir, 'e')
      const storeS = freshStore(dir, 'f')
      const rDefault = expectOk(
        await importMarkdownCorpus(makeCtx(storeDefault), { files: [defaultFile], corpusRoot: corpus }),
      )
      const rS = expectOk(
        await importMarkdownCorpus(
          makeCtx(storeS),
          { files: [sFile], corpusRoot: corpus },
          { name: OTHER_NAME, isDefault: false },
        ),
      )
      expect(rDefault.documentIds).toEqual(['research-2026-09-readme-3'])
      expect(rS.documentIds).toEqual([`${OTHER_NAME}:readme-3`])
      const defaultEdges = storeDefault.listEdges().map((e) => e.id).sort()
      const sEdges = storeS.listEdges().map((e) => e.id).sort()
      expect(defaultEdges).toEqual([1, 2, 3, 4, 5].map((n) => `e-research-2026-09-readme-3-${n}`))
      expect(sEdges).toEqual([1, 2, 3, 4, 5].map((n) => `e-${OTHER_NAME}:readme-3-${n}`))
      // THE pin (the corrected INV-6): NO default edge id equals ANY
      // non-default edge id.
      for (const d of defaultEdges) expect(sEdges).not.toContain(d)
      for (const s of sEdges) expect(defaultEdges).not.toContain(s)
      // And the full minted id sets are disjoint too (INV-2 rides along).
      const defaultIds = new Set(storeDefault.listNodes().map((n) => n.id))
      for (const n of storeS.listNodes()) expect(defaultIds.has(n.id)).toBe(false)
    })
  })
})

// ===========================================================================
// F-MS4-4 — the NUL-byte probe fails closed with the EXISTING message
// ===========================================================================
describe('F-MS4-4 — a NUL-bearing file path fails CLOSED with the existing `cannot read file` message (no new string)', () => {
  it('R7. `note\\u0000.md` ⇒ `markdown import: cannot read file: note\\u0000.md`, failedFile, no batch/no ids/nothing persisted; a NUL path OUTSIDE the root keeps the outside-corpus-root error (containment precedes the probe)', async () => {
    await withDirAsync(async (dir) => {
      const store = freshStore(dir, 'g')
      const r = await importMarkdownCorpus(makeCtx(store), { files: ['note\u0000.md'], corpusRoot: dir })
      expect(r.ok).toBe(false)
      if (r.ok) throw new Error('expected failure, got ok')
      expect(r.error).toBe('markdown import: cannot read file: note\u0000.md')
      expect(r.failedFile).toBe('note\u0000.md')
      expect(store.listNodes()).toEqual([])
      expect(store.listEdges()).toEqual([])
      expect(store.journal()).toHaveLength(0)
      // A NUL path OUTSIDE the root: the logical containment check still
      // fires FIRST (byte-identical to today).
      const r2 = await importMarkdownCorpus(makeCtx(store), { files: ['../note\u0000.md'], corpusRoot: dir })
      expect(r2.ok).toBe(false)
      if (r2.ok) throw new Error('expected failure, got ok')
      expect(r2.error).toBe('markdown import: path outside corpus root: ../note\u0000.md')
      expect(r2.failedFile).toBe('../note\u0000.md')
    })
  })
})

// ===========================================================================
// F-MS4-6 — the A1 boundary family: basenames that SANITIZE ONTO a reserved
// name are REJECTED; a surviving trailing dot is NOT a collision
// ===========================================================================
describe('F-MS4-6 — the A1 boundary family: the exact-equality predicate operates on the SANITIZED base (§5.4)', () => {
  it('R8. the four sanitize-onto basenames (trailing-dash strip / space→dash→strip / colon→dash / case-insensitive extension strip) each REJECT with the byte-pinned A1 message', async () => {
    await withDirAsync(async (dir) => {
      const store = freshStore(dir, 'h')
      // All four sanitize onto `research-2026-09` ⇒ A1 fires. One file per
      // call (a multi-file run would abort at the first collision and mask
      // the others).
      const names = [
        'research-2026-09-.md', // trailing-dash strip
        'research-2026-09 .md', // space→dash→strip
        'research:2026:09.md', // colon→dash (the sanitizer's charset rule)
        'research-2026-09.MD', // case-insensitive extension strip
      ]
      const files = names.map((n) => writeMd(dir, n, `# ${n}\n\nBody.\n`))
      for (const f of files) {
        const r = await importMarkdownCorpus(
          makeCtx(store),
          { files: [f], corpusRoot: dir },
          { name: DEFAULT_NAME, isDefault: true, reservedNames: [OTHER_NAME] },
        )
        expect(r.ok).toBe(false)
        if (r.ok) throw new Error('expected failure, got ok')
        expect(r.error).toBe(`markdown import: documentId collides with a registered store name: ${OTHER_NAME}`)
        expect(r.failedFile).toBe(f)
      }
      expect(store.listNodes()).toEqual([])
      expect(store.journal()).toHaveLength(0)
    })
  })

  it('R9. `research-2026-09..md` (the trailing dot SURVIVES the sanitizer\'s dash-only trim) ⇒ IMPORT with documentId `research-2026-09.` — NOT an A1 collision', async () => {
    await withDirAsync(async (dir) => {
      const f = writeMd(dir, 'research-2026-09..md', '# Dotted\n\nBody.\n')
      const store = freshStore(dir, 'i')
      const r = expectOk(
        await importMarkdownCorpus(
          makeCtx(store),
          { files: [f], corpusRoot: dir },
          { name: DEFAULT_NAME, isDefault: true, reservedNames: [OTHER_NAME] },
        ),
      )
      expect(r.documentIds).toEqual(['research-2026-09.'])
      expect(store.getNode('research-2026-09.')).toBeDefined()
    })
  })
})