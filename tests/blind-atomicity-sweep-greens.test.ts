// tests/blind-atomicity-sweep-greens.test.ts
//
// GATE-5 BLIND GREEN-SCENARIO HARNESS for unit `U-ATOMICITY-SWEEP-CLASS-B` —
// authored by a BLIND-TEST WRITER who did NOT write the implementation and who
// did NOT read `src/main/operator-settings-store.ts`, `src/main/engine-config.ts`,
// `tests/pd-atomicity-sweep-class-b.test.ts` or
// `tests/atomicity-sweep-class-b-register.test.ts`.
//
// THE ARTIFACT THESE SCENARIOS ARE RECORDED IN:
//   docs/specs/unit-atomicity-sweep-class-b-greens.md
//
// SOURCE OF EVERY EXPECTATION (DOCUMENTATION ONLY):
//   - docs/specs/unit-atomicity-sweep-class-b.md   (the CONTRACT, authoritative)
//       §0.1   V-1..V-10 the vocabulary rows
//       §1.1   the SIX members of the ONE atomic commit
//       §1.2   the THIRTEEN DENIED rows
//       §2.1   S-1..S-7 the two carriers' declared surfaces, side by side
//       §2.2   THE EXACT persist() STEP SEQUENCE + the tmp fate + the fd discipline
//       §2.3   the receipt + the reader ruling, PER CARRIER (① minted, ② refused,
//              ③ the closed form, ④ no import)
//       §2.4   m-1..m-11 the fail-state table
//       §2.5   ①/②/③/④/⑤ the read-path distinguishability requirement
//       §2.6   P-1..P-8 the façade legs (P-7/P-8 = "the boot read") + ABSENT => real node:fs
//       §3.1   THE INVARIANT + its falsifier
//       §3.2   I-1..I-12 the rules
//       §2.7   C-2/C-3/C-4 the figures (ONE engine member; SEVEN rows; the derived control)
//       §6     the layer ledger
//       §7     1..12 the honesty/limits block
//   - docs/specs/unit-atomicity-sweep-review.md    (the gate-1 record: §3 the adopted
//       shape + the reader ruling + the swallow ruling; §4 the coupling amendment set;
//       §5 the layer and the RUN live leg; §9 the S1..S12 answer block)
//   - docs/specs/unit-store-security-write.md      (3a — the atomic-shape PRECEDENT
//       this contract mirrors: §2.1 S-4/S-5, §2.4 items 1-3, §2.5, §3.2 I-1..I-5)
//   - docs/defects.md `HOST-PERSISTENCE-ATOMICITY-AND-CONSISTENCY` clause (1)
//
// ===========================================================================
// LAYER (RCA-12, mandatory). Every scenario below is `[T]` constructed store or
// `[H]` byte-scan. **THIS WRITER HAS NO LIVE LEG** — the `[U]` restart
// round-trip is the unit's own gate-6 obligation and it is OWED; nothing here is
// app-green, envelope-green, store-green or live-green. **NO DURABILITY CLAIM IS
// MADE OR READ ANYWHERE**: the atomic five-step is SHAPE-asserted as CALL
// ORDER/COUNT over the injected façade — never a completed `fsync`, never a
// crash-recovery outcome, never a bytes-after-power-loss state (contract §2.2,
// §6, §7 item 1).
//
// THE ANTI-VACUITY DISCIPLINE (this harness's own). Every injection below is
// proved to have FIRED (the recorder's call log shows the injected leg was
// reached) before any downstream claim is read, and every drive asserts its own
// observed movement — a drive whose leg was never called is a FAIL by
// construction, never a silent pass. NO real app, no Electron boot, no `dist/`
// artifact is exercised.
//
// THE HARNESS'S OWN SCOPE DISCIPLINE, DERIVED FROM §2.6 (recorded so a later
// reader can audit it): the facade's EIGHT legs are not all on the same path.
// `P-1`..`P-6` (`mkdirSync`/`writeFileSync`/`openSync`/`fsyncSync`/`closeSync`/
// `renameSync`) are the WRITE path (steps 1-5 + the fd discipline); `P-7`
// (`readFileSync`) and `P-8` (`existsSync`) are declared for "the boot read".
// §2.4 m-10's "each declared leg is INDEPENDENTLY throwable" is therefore driven
// AT THE PATH THAT LEG BELONGS TO — write legs at `set()`, read legs at
// CONSTRUCTION — and each drive asserts its own leg actually fired.
// ===========================================================================

import { describe, it, expect } from 'vitest'
import { createHash } from 'node:crypto'
import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  openSync as nodeOpenSync,
  fsyncSync as nodeFsyncSync,
  closeSync as nodeCloseSync,
  renameSync as nodeRenameSync,
  mkdirSync as nodeMkdirSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { createOperatorSettingsStore } from '../src/main/operator-settings-store.js'
import { createEngineConfigStore } from '../src/main/engine-config.js'

// ---------------------------------------------------------------------------
// The recording façade — EXACTLY the eight legs contract §2.6 declares.
// ---------------------------------------------------------------------------

type Leg =
  | 'mkdirSync'
  | 'writeFileSync'
  | 'openSync'
  | 'fsyncSync'
  | 'closeSync'
  | 'renameSync'
  | 'readFileSync'
  | 'existsSync'

const ALL_LEGS: Leg[] = [
  'mkdirSync',
  'writeFileSync',
  'openSync',
  'fsyncSync',
  'closeSync',
  'renameSync',
  'readFileSync',
  'existsSync',
]
const WRITE_LEGS: Leg[] = ['mkdirSync', 'writeFileSync', 'openSync', 'fsyncSync', 'closeSync', 'renameSync']
const READ_LEGS: Leg[] = ['readFileSync', 'existsSync']

interface Call {
  leg: Leg
  args: unknown[]
}

interface Recorder {
  calls: Call[]
  fired: Set<string>
  /** Inject a throw at the Nth call (0-based) of `leg` SEEN SINCE THE LAST reset(). */
  throwAt(leg: Leg, occurrence: number): void
  clearThrow(): void
  reset(): void
  legCalls(leg: Leg): Call[]
  seq(): Leg[]
  text(): string
}

function makeRecorder(): { io: Record<string, unknown>; rec: Recorder } {
  const calls: Call[] = []
  const thrown = new Map<Leg, Set<number>>()
  const seen = new Map<Leg, number>()
  const fired = new Set<string>()

  const note = (leg: Leg, args: unknown[]): number => {
    calls.push({ leg, args })
    const n = seen.get(leg) ?? 0
    seen.set(leg, n + 1)
    return n
  }
  const guard = (leg: Leg, n: number): void => {
    if (thrown.get(leg)?.has(n)) {
      fired.add(`${leg}#${n}`)
      throw new Error(`INJECTED-FAILURE:${leg}#${n}`)
    }
  }

  const io: Record<string, unknown> = {
    mkdirSync: (path: string, opts?: unknown) => {
      guard('mkdirSync', note('mkdirSync', [path, opts]))
      nodeMkdirSync(path, (opts ?? {}) as never)
    },
    writeFileSync: (path: string, data: string, opts?: unknown) => {
      guard('writeFileSync', note('writeFileSync', [path, data, opts]))
      writeFileSync(path, data, opts as never)
    },
    openSync: (path: string, flags: string) => {
      guard('openSync', note('openSync', [path, flags]))
      return nodeOpenSync(path, flags as never)
    },
    fsyncSync: (fd: number) => {
      guard('fsyncSync', note('fsyncSync', [fd]))
      nodeFsyncSync(fd)
    },
    closeSync: (fd: number) => {
      guard('closeSync', note('closeSync', [fd]))
      nodeCloseSync(fd)
    },
    renameSync: (from: string, to: string) => {
      guard('renameSync', note('renameSync', [from, to]))
      nodeRenameSync(from, to)
    },
    readFileSync: (path: string, encoding?: string) => {
      guard('readFileSync', note('readFileSync', [path, encoding]))
      return readFileSync(path, encoding as never) as unknown as string
    },
    existsSync: (path: string) => {
      guard('existsSync', note('existsSync', [path]))
      return existsSync(path)
    },
  }

  const rec: Recorder = {
    calls,
    fired,
    throwAt(leg, occurrence) {
      const set = thrown.get(leg) ?? new Set<number>()
      set.add(occurrence)
      thrown.set(leg, set)
    },
    clearThrow() {
      thrown.clear()
    },
    reset() {
      calls.length = 0
      seen.clear()
      fired.clear()
    },
    legCalls(leg) {
      return calls.filter((c) => c.leg === leg)
    },
    seq() {
      return calls.map((c) => c.leg)
    },
    text() {
      return calls
        .map((c) => `${c.leg}=[${c.args.map((a) => (typeof a === 'string' ? a : String(a))).join(' | ')}]`)
        .join('\n')
    },
  }

  return { io, rec }
}

// ---------------------------------------------------------------------------
// Fixtures.
// ---------------------------------------------------------------------------

const OPDIR = 'operator'
const ENDIR = 'engine'

function scratch(name: string): string {
  return join(mkdtempSync(join(tmpdir(), `blind-asw-${name}-`)), 'record.json')
}

const buildOp = (path: string, fs?: unknown) =>
  createOperatorSettingsStore(fs === undefined ? { path } : ({ path, fs } as never))
const buildEn = (path: string, fs?: unknown) =>
  createEngineConfigStore(fs === undefined ? { path } : ({ path, fs } as never))

type AnyStore = {
  get(): Record<string, unknown>
  set(patch: never): Record<string, unknown>
  lastWriteReceipt?: () => unknown
  lastReadWasCorrupt?: () => boolean
}

/** A previous record at the live path, written through a PRISTINE façade. */
function seedOp(path: string, patch: Record<string, unknown>): Buffer {
  buildOp(path, makeRecorder().io).set(patch as never)
  return readFileSync(path)
}
function seedEn(path: string, url: string): Buffer {
  buildEn(path, makeRecorder().io).set(url as never)
  return readFileSync(path)
}

const md5 = (p: string) => createHash('md5').update(readFileSync(p)).digest('hex')
const readSrc = (p: string) => readFileSync(join(process.cwd(), p), 'utf8')

// ===========================================================================
// G-1 · [T] THE FIVE-STEP ORDER AND COUNT, OPERATOR CARRIER
//        (contract §2.2; §3.1 THE INVARIANT; §3.2 I-1)
// ===========================================================================
describe('G-1 [T] the atomic five-step ORDER and COUNT on the operator carrier', () => {
  it('a successful set() drives mkdir -> tmp-write -> fsync(tmp) -> rename -> fsync(dir), once each, in order', () => {
    const path = scratch('g1')
    const { io, rec } = makeRecorder()
    const store = buildOp(path, io)

    rec.reset()
    const post = store.set({ topK: 7 } as never)
    // ANTI-VACUITY: the drive MOVED something and the write legs were reached.
    expect(post.topK).toBe(7)
    expect(rec.legCalls('renameSync').length).toBe(1)

    const seq = rec.seq()
    // §2.2: the step order is the contract.
    const iMkdir = seq.indexOf('mkdirSync')
    const iTmpWrite = seq.indexOf('writeFileSync')
    const iFsync1 = seq.indexOf('fsyncSync')
    const iRename = seq.indexOf('renameSync')
    const iFsync2 = seq.indexOf('fsyncSync', iRename)
    expect([iMkdir, iTmpWrite, iFsync1, iRename, iFsync2].every((i) => i >= 0)).toBe(true)
    expect(iMkdir).toBeLessThan(iTmpWrite)
    expect(iTmpWrite).toBeLessThan(iFsync1)
    expect(iFsync1).toBeLessThan(iRename)
    expect(iRename).toBeLessThan(iFsync2)

    // ONCE EACH (§2.2: "ONCE EACH").
    expect(rec.legCalls('writeFileSync').length).toBe(1)
    expect(rec.legCalls('renameSync').length).toBe(1)
    expect(rec.legCalls('fsyncSync').length).toBe(2)

    // Step 2 writes `${opts.path}.tmp` — NEVER the live path (I-1).
    expect(rec.legCalls('writeFileSync')[0].args[0]).toBe(`${path}.tmp`)
    // Step 4 publishes tmp -> the live path.
    expect(rec.legCalls('renameSync')[0].args[0]).toBe(`${path}.tmp`)
    expect(rec.legCalls('renameSync')[0].args[1]).toBe(path)
    // Step 5 fsyncs the PARENT DIRECTORY (the second open's path argument).
    const opened = rec.legCalls('openSync').map((c) => c.args[0] as string)
    expect(opened).toContain(path === `${path}` ? dirname(path) : dirname(path))

    // The live path's bytes ARE the serialized in-memory post-state.
    expect(JSON.parse(readFileSync(path, 'utf8')).topK).toBe(7)
  })
})

// ===========================================================================
// G-2 · [T] THE SAME FIVE STEPS ON THE ENGINE CARRIER
//        (§2.2 "IDENTICAL on both carriers except that only the operator carrier
//         answers a receipt"; §2.7 C-2 the ONE-member payload)
// ===========================================================================
describe('G-2 [T] the atomic five-step ORDER and COUNT on the engine carrier', () => {
  it('a successful set() drives the SAME five steps once each, in the SAME order', () => {
    const path = scratch('g2')
    const { io, rec } = makeRecorder()
    const store = buildEn(path, io)

    rec.reset()
    const post = store.set('http://127.0.0.1:8080' as never)
    expect(post.engineBaseUrl).toBe('http://127.0.0.1:8080')
    expect(rec.legCalls('renameSync').length).toBe(1)

    const seq = rec.seq()
    const iMkdir = seq.indexOf('mkdirSync')
    const iTmpWrite = seq.indexOf('writeFileSync')
    const iFsync1 = seq.indexOf('fsyncSync')
    const iRename = seq.indexOf('renameSync')
    const iFsync2 = seq.indexOf('fsyncSync', iRename)
    expect(iMkdir).toBeLessThan(iTmpWrite)
    expect(iTmpWrite).toBeLessThan(iFsync1)
    expect(iFsync1).toBeLessThan(iRename)
    expect(iRename).toBeLessThan(iFsync2)
    expect(rec.legCalls('writeFileSync').length).toBe(1)
    expect(rec.legCalls('fsyncSync').length).toBe(2)
    expect(rec.legCalls('writeFileSync')[0].args[0]).toBe(`${path}.tmp`)
    expect(rec.legCalls('renameSync')[0].args.slice(0, 2)).toEqual([`${path}.tmp`, path])

    // §2.7 C-2: the engine payload is ONE member — `engineBaseUrl`.
    expect(Object.keys(JSON.parse(readFileSync(path, 'utf8')))).toEqual(['engineBaseUrl'])
  })
})

// ===========================================================================
// G-3 · [T] THE LIVE PATH IS NEVER WRITTEN DIRECTLY
//        (§3.1 falsifier "a direct writeFileSync(opts.path, …)"; §3.2 I-1)
// ===========================================================================
describe('G-3 [T] the live path is never written directly; its only mutation is one renameSync', () => {
  it('both carriers: no write leg names the live path, and exactly one rename publishes it', () => {
    for (const carrier of [OPDIR, ENDIR]) {
      const path = scratch(`g3-${carrier}`)
      const { io, rec } = makeRecorder()
      const store = carrier === OPDIR ? buildOp(path, io) : buildEn(path, io)
      rec.reset()
      if (carrier === OPDIR) store.set({ topK: 3 } as never)
      else store.set('http://x' as never)

      // I-1 falsifier: a writeFileSync/append/truncate naming `opts.path` itself.
      const writesAtLive = rec
        .legCalls('writeFileSync')
        .filter((c) => c.args[0] === path)
      expect(writesAtLive).toEqual([])

      // The ONLY mutation of the live path is `renameSync(tmp, path)`.
      const renamesToLive = rec.legCalls('renameSync').filter((c) => c.args[1] === path)
      expect(renamesToLive.length).toBe(1)
      expect(renamesToLive[0].args[0]).toBe(`${path}.tmp`)
      expect(existsSync(path)).toBe(true)
    }
  })
})

// ===========================================================================
// G-4 · [T] A SUCCESS LEAVES NO `.tmp`
//        (§3.2 I-2(a); §2.2 "a SUCCESSFUL write leaves NO ${path}.tmp")
// ===========================================================================
describe('G-4 [T] a successful write leaves no residual .tmp', () => {
  it('both carriers: the tmp is gone and the directory holds the record alone', () => {
    const opPath = scratch('g4-op')
    buildOp(opPath, makeRecorder().io).set({ topK: 11 } as never)
    expect(existsSync(`${opPath}.tmp`)).toBe(false)
    expect(readdirSync(dirname(opPath)).sort()).toEqual(['record.json'])

    const enPath = scratch('g4-en')
    buildEn(enPath, makeRecorder().io).set('http://y' as never)
    expect(existsSync(`${enPath}.tmp`)).toBe(false)
    expect(readdirSync(dirname(enPath)).sort()).toEqual(['record.json'])
  })
})

// ===========================================================================
// G-5 · [T] A STALE `.tmp` IS OVERWRITTEN AND NEVER PARSED AS THE RECORD
//        (§3.2 I-2(b)/(c); §2.4 m-9; §2.2 the tmp file's fate)
// ===========================================================================
describe('G-5 [T] a stale .tmp carrying valid-looking bytes is never the record', () => {
  it('operator: the tmp alone never answers the boot read, and is overwritten then renamed away', () => {
    const path = scratch('g5-op')
    writeFileSync(`${path}.tmp`, JSON.stringify({ topK: 999, theme: 'stale' }), 'utf8')
    const { io, rec } = makeRecorder()
    const store = buildOp(path, io)

    // I-2(c): the boot read consults the REAL path ONLY. §2.5 ③ fixes the shape:
    // the presence test is `existsSync(path)`; a `readFileSync` may or may not follow
    // (a valid tmp alone is never a reason to read at all) — but EVERY read leg the
    // boot read drives names the REAL path, never `${path}.tmp`.
    expect(store.get().topK).not.toBe(999)
    const readLegs = [
      ...rec.legCalls('existsSync').map((c) => c.args[0]),
      ...rec.legCalls('readFileSync').map((c) => c.args[0]),
    ]
    expect(readLegs.length).toBeGreaterThan(0)
    expect(readLegs.every((p) => p === path)).toBe(true)

    store.set({ topK: 4 } as never)
    expect(JSON.parse(readFileSync(path, 'utf8')).topK).toBe(4)
    // OVERWRITTEN then moved away — the stale bytes are not left anywhere.
    expect(existsSync(`${path}.tmp`)).toBe(false)
  })

  it('engine: same — a valid-looking tmp alone never answers the record', () => {
    const path = scratch('g5-en')
    writeFileSync(`${path}.tmp`, JSON.stringify({ engineBaseUrl: 'http://stale' }), 'utf8')
    const { io, rec } = makeRecorder()
    const store = buildEn(path, io)
    expect(store.get().engineBaseUrl).not.toBe('http://stale')
    const readLegs = [
      ...rec.legCalls('existsSync').map((c) => c.args[0]),
      ...rec.legCalls('readFileSync').map((c) => c.args[0]),
    ]
    expect(readLegs.every((p) => p === path)).toBe(true)
  })
})

// ===========================================================================
// G-6 · [T] THE OPERATOR FAILURE LEGS: PREVIOUS RECORD SURVIVES, STORE USABLE,
//        EXACTLY ONE CLOSED RECEIPT FORM ANSWERS
//        (§2.4 m-1/m-3/m-4/m-5/m-11; §2.2 the per-carrier wrap; §2.3 ③)
// ===========================================================================
describe('G-6 [T] operator carrier — every write-leg failure leaves the previous record intact', () => {
  // The write path's injection points, as occurrences seen since the last reset.
  // §2.2 step order: mkdir(0) -> tmp write(0) -> open tmp(0) -> fsync tmp(0) ->
  // close(0) -> rename(0) -> open dir(1) -> fsync dir(1) -> close(1).
  const FIVE_POINTS: Array<[string, Leg, number]> = [
    ['the mkdir leg (step 1)', 'mkdirSync', 0],
    ['the tmp write (step 2)', 'writeFileSync', 0],
    ['the tmp fsync (step 3)', 'fsyncSync', 0],
    ['the rename (step 4)', 'renameSync', 0],
    ['the directory fsync (step 5)', 'fsyncSync', 1],
  ]

  for (const [label, leg, occ] of FIVE_POINTS) {
    it(`injected failure at ${label}: previous record bytes survive, receipt refused, store remains usable`, () => {
      const path = scratch(`g6-${leg}-${occ}`)
      const { io, rec: r } = makeRecorder()
      const store = buildOp(path, io)
      store.set({ topK: 21 } as never)
      const before = readFileSync(path) // BYTES, not a parse (§2.4 m-1)

      r.reset()
      r.throwAt(leg, occ)
      let threw: unknown = null
      let post: Record<string, unknown> | null = null
      try {
        post = store.set({ topK: 42 } as never)
      } catch (e) {
        threw = e
      }
      // ANTI-VACUITY: the injected leg MUST have fired, or this row is vacuous.
      expect([...r.fired]).toContain(`${leg}#${occ}`)
      // §2.2: "ANY throw at steps 1-5 answers {refused}; never escapes set()" (V-5/I-4).
      expect(threw).toBe(null)

      if (label !== 'the directory fsync (step 5)') {
        // §2.4 m-1/m-3/m-4: the live path stays BYTE-IDENTICAL.
        expect(readFileSync(path).equals(before)).toBe(true)
      } else {
        // §2.4 m-5 — THE DECLARED DISAGREEMENT, asserted rather than smoothed:
        // step 4 already published, so the FILE is the NEW record while the
        // receipt answers `refused` (the leg threw). This is the ONE case where
        // the receipt and the file disagree.
        expect(readFileSync(path).equals(before)).toBe(false)
        expect(JSON.parse(readFileSync(path, 'utf8')).topK).toBe(42)
      }

      // The receipt is EXACTLY one of the two closed forms (§2.3 ③).
      expect(store.lastWriteReceipt?.()).toEqual({ status: 'refused', reason: 'write-failed' })
      // `get()` still answers the IN-MEMORY post-state (§2.4 m-1).
      expect(post?.topK).toBe(42)
      expect(store.get().topK).toBe(42)

      // THE STORE REMAINS USABLE, and the next un-injected write commits.
      r.clearThrow()
      store.set({ topK: 43 } as never)
      expect(store.lastWriteReceipt?.()).toEqual({ status: 'committed' })
      expect(JSON.parse(readFileSync(path, 'utf8')).topK).toBe(43)
    })
  }

  it('m-11: a closeSync that throws never replaces the receipt with an escape', () => {
    const path = scratch('g6-m11')
    const { io, rec: r } = makeRecorder()
    const store = buildOp(path, io)
    r.reset()
    r.throwAt('closeSync', 0)
    let threw: unknown = null
    try {
      store.set({ topK: 16 } as never)
    } catch (e) {
      threw = e
    }
    expect([...r.fired]).toContain('closeSync#0')
    expect(threw).toBe(null)
    // §2.4 m-11: "the receipt is NOT replaced by an escape: the original outcome stands".
    const receipt = store.lastWriteReceipt?.() as { status: string }
    expect(['committed', 'refused']).toContain(receipt.status)
    // And the store is still drivable.
    r.clearThrow()
    expect(() => store.set({ topK: 17 } as never)).not.toThrow()
    expect(store.lastWriteReceipt?.()).toEqual({ status: 'committed' })
  })
})

// ===========================================================================
// G-7 · [T] THE ENGINE FAILURE LEGS: NOTHING THROWN, NOTHING ANSWERED,
//        PREVIOUS RECORD SURVIVES, IN-MEMORY STILL APPLIES
//        (§2.4 m-2/m-3/m-4; §2.2 the engine carrier's own difference)
// ===========================================================================
describe('G-7 [T] engine carrier — every write-leg failure throws nothing and answers nothing', () => {
  const FOUR_POINTS: Array<[string, Leg, number]> = [
    ['the mkdir leg (step 1)', 'mkdirSync', 0],
    ['the tmp write (step 2)', 'writeFileSync', 0],
    ['the tmp fsync (step 3)', 'fsyncSync', 0],
    ['the rename (step 4)', 'renameSync', 0],
  ]

  for (const [label, leg, occ] of FOUR_POINTS) {
    it(`injected failure at ${label}: previous record bytes survive, no throw, no answer`, () => {
      const path = scratch(`g7-${leg}-${occ}`)
      const { io, rec: r } = makeRecorder()
      const store = buildEn(path, io)
      store.set('http://first' as never)
      const before = readFileSync(path)

      r.reset()
      r.throwAt(leg, occ)
      let threw: unknown = null
      let post: Record<string, unknown> | null = null
      try {
        post = store.set('http://second' as never)
      } catch (e) {
        threw = e
      }
      expect([...r.fired]).toContain(`${leg}#${occ}`)
      expect(threw).toBe(null)
      // §2.4 m-2: "the previous file stays byte-identical".
      expect(readFileSync(path).equals(before)).toBe(true)
      // V-5: the in-memory config still applies for the process lifetime.
      expect(post?.engineBaseUrl).toBe('http://second')
      expect(store.get().engineBaseUrl).toBe('http://second')
      // §2.3 ②: NOTHING is answered — no receipt-shaped member exists at all.
      const receiptish = Object.keys(store as unknown as Record<string, unknown>).filter((k) =>
        /receipt|writeFailed|lastWrite|^write$/i.test(k),
      )
      expect(receiptish).toEqual([])
      // The store remains usable.
      r.clearThrow()
      store.set('http://third' as never)
      expect(store.get().engineBaseUrl).toBe('http://third')
      expect(JSON.parse(readFileSync(path, 'utf8')).engineBaseUrl).toBe('http://third')
    })
  }
})

// ===========================================================================
// G-8 · [T] THE RECEIPT: CLOSED TWO FORMS, `null` ONLY BEFORE THE FIRST ATTEMPT,
//        AND A NON-OBJECT PATCH DOES NOT ADVANCE IT
//        (§2.1 S-4; §2.3 ③; §2.4 m-6; §3.2 I-3)
// ===========================================================================
describe('G-8 [T] the operator receipt is a closed two-form union', () => {
  it('null on a cold store, then exactly one of the two closed forms after each performed write', () => {
    const path = scratch('g8')
    const { io, rec: r } = makeRecorder()
    const store = buildOp(path, io)

    // §2.1 S-4: `null` ONLY before the first write attempt (a cold store).
    expect(store.lastWriteReceipt?.()).toBe(null)

    store.set({ topK: 2 } as never)
    expect(store.lastWriteReceipt?.()).toEqual({ status: 'committed' })

    r.reset()
    r.throwAt('renameSync', 0)
    store.set({ topK: 3 } as never)
    expect([...r.fired]).toContain('renameSync#0')

    const refused = store.lastWriteReceipt?.() as Record<string, unknown>
    expect(refused).toEqual({ status: 'refused', reason: 'write-failed' })
    // §2.3 ③: CLOSED at TWO forms and ONE token — never a third status,
    // never an absent `reason` on a refusal, never a re-spelled token.
    expect(['committed', 'refused']).toContain(refused.status)
    expect(Object.keys(refused).sort()).toEqual(['reason', 'status'])
  })

  it('m-6: a non-object/null/undefined patch performs NO write and does NOT advance the receipt', () => {
    const path = scratch('g8b')
    const { io, rec: r } = makeRecorder()
    const store = buildOp(path, io)
    store.set({ topK: 5 } as never)
    const held = store.lastWriteReceipt?.()
    const before = readFileSync(path)

    r.reset()
    expect(store.set(null as never).topK).toBe(5)
    expect(store.set(undefined as never).topK).toBe(5)
    expect(store.set('nope' as never).topK).toBe(5)

    // §3.2 I-3: "no persist() runs".
    expect(r.legCalls('writeFileSync')).toEqual([])
    expect(r.legCalls('renameSync')).toEqual([])
    expect(readFileSync(path).equals(before)).toBe(true)
    // "the receipt is NOT advanced (it still reports the previous write attempt)".
    expect(store.lastWriteReceipt?.()).toEqual(held)
  })
})

// ===========================================================================
// G-9 · [H] THE ENGINE CARRIER MINTS **NO** RECEIPT — REFUSED BY NAME
//        (§2.3 ②; §3.2 I-3; §2.1 S-4 "ABSENT — NOT MINTED")
// ===========================================================================
describe('G-9 [H] the engine carrier mints no receipt member (refused by name)', () => {
  it('the store instance carries no receipt-shaped member, before or after a write', () => {
    const path = scratch('g9')
    const { io, rec: r } = makeRecorder()
    const store = buildEn(path, io)
    const before = Object.keys(store as unknown as Record<string, unknown>).sort()
    store.set('http://z' as never)
    const after = Object.keys(store as unknown as Record<string, unknown>).sort()
    expect(after).toEqual(before)
    expect(after).not.toContain('lastWriteReceipt')
    expect(after.filter((k) => /receipt|writeOutcome/i.test(k))).toEqual([])
    // §2.1 S-3: the write's own resolution is the post-state, never a receipt.
    expect(Object.keys(store.set('http://w' as never)).sort()).toEqual(['engineBaseUrl'])
  })

  it('the engine module SHIPS no receipt member — a mention in a limit comment is not a mint', () => {
    const en = readSrc('src/main/engine-config.ts')
    // §1.1 member 2 ② / §2.1 S-7: NO receipt member and NO receipt type. The scan is
    // SHAPE-SCOPED on the same windowed-negation reading the sibling 3a/3b anti-overclaim
    // rows use: a `lastWriteReceipt` token inside a COMMENT is the contract's own
    // FALSE-FINDER note (*"a `lastWriteReceipt`/`lastWriteOutcome` member … is a FINDING"*),
    // which is a LIMIT sentence — a MINT would be a shape member.
    const codeLines = en
      .split('\n')
      .map((l) => l.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '').replace(/\/\*[\s\S]*?\*\//g, ''))
    const shapeText = codeLines.join('\n')
    expect(shapeText).not.toMatch(/lastWriteReceipt/)
    expect(shapeText).not.toMatch(/EngineConfigWriteReceipt/)
    expect(shapeText).not.toMatch(/WriteReceipt/)
    // The engine carrier's distinguishing signal is PERSISTED, not a receipt (§2.5 ③).
    expect(en).toMatch(/conflict/i)
  })
})

// ===========================================================================
// G-10 · [T] THE READ-PATH DISTINGUISHABILITY
//        (§2.5 ③; §2.4 m-7/m-8; §3.2 I-5)
// ===========================================================================
describe('G-10 [T] an unparsable file is no longer indistinguishable from an absent file', () => {
  it('operator: ABSENT => false; PRESENT-and-unusable => true; both answer the first-run defaults, nothing throws', () => {
    // §2.5 ③ "the absence case is exactly existsSync(path) === false".
    const absent = scratch('g10-absent')
    const a = buildOp(absent, makeRecorder().io)
    expect(a.lastReadWasCorrupt?.()).toBe(false)
    const defaults = a.get()

    // §2.4 m-7: the two unparsable cases — zero-byte and unbalanced-prefix.
    for (const [label, bytes] of [
      ['zero-byte', ''],
      ['unbalanced-prefix', '{"topK": 4, "theme": "da'],
    ] as const) {
      const path = scratch(`g10-${label}`)
      writeFileSync(path, bytes, 'utf8')
      expect(existsSync(path)).toBe(true)
      const store = buildOp(path, makeRecorder().io)
      // §3.2 I-5: get() stays TOTAL and fail-soft — NOTHING throws.
      expect(() => store.get()).not.toThrow()
      expect(store.get()).toEqual(defaults)
      // ...AND the distinguishing signal is SET — the whole point of §2.5.
      expect(store.lastReadWasCorrupt?.()).toBe(true)
    }
  })

  it('a GOOD file reads false — the signal distinguishes unusable from merely-present', () => {
    const path = scratch('g10-good')
    buildOp(path, makeRecorder().io).set({ topK: 9 } as never)
    const reread = buildOp(path, makeRecorder().io)
    expect(reread.get().topK).toBe(9)
    expect(reread.lastReadWasCorrupt?.()).toBe(false)
  })
})

// ===========================================================================
// G-11 · [T] THE ENGINE CARRIER'S CONFLICT-MARKER LIFECYCLE
//        (§2.5 ③ "PERSISTED INTO THE FILE ... readable by main at the next boot";
//         §2.4 m-7 "recorded on the next successful write")
// ===========================================================================
describe('G-11 [T] the engine conflict marker is PERSISTED into the record', () => {
  it('a corrupt boot read is carried into the NEXT SUCCESSFUL WRITE\'s record', () => {
    const path = scratch('g11')
    writeFileSync(path, '{not json at all', 'utf8')
    const store = buildEn(path, makeRecorder().io)
    // m-7: the defaults answer and NOTHING throws.
    expect(() => store.get()).not.toThrow()
    expect(store.get().engineBaseUrl).toBe(null)

    // The conflict is recorded ON THE NEXT SUCCESSFUL WRITE ONLY.
    store.set('http://after-corrupt' as never)
    const raw = readFileSync(path, 'utf8')
    const written = JSON.parse(raw)
    expect(written.engineBaseUrl).toBe('http://after-corrupt')
    // §2.5 ③: "the record this carrier writes carries an explicit conflict marker".
    expect(raw).toMatch(/conflict|corrupt/i)
    const markerKeys = Object.keys(written).filter((k) => k !== 'engineBaseUrl')
    expect(markerKeys.length).toBeGreaterThan(0)
  })

  it('a clean boot writes NO conflict marker — the lifecycle has two ends', () => {
    const path = scratch('g11-clean')
    const store = buildEn(path, makeRecorder().io)
    store.set('http://clean' as never)
    const raw = readFileSync(path, 'utf8')
    expect(JSON.parse(raw).engineBaseUrl).toBe('http://clean')
    expect(raw).not.toMatch(/conflict|corrupt/i)
    expect(Object.keys(JSON.parse(raw))).toEqual(['engineBaseUrl'])
  })

  it('the marker survives a LATER clean set — it is a fact about the READ, not the write', () => {
    const path = scratch('g11-life')
    writeFileSync(path, '}{', 'utf8')
    const store = buildEn(path, makeRecorder().io)
    store.set('http://one' as never)
    expect(readFileSync(path, 'utf8')).toMatch(/conflict|corrupt/i)
    // A second, clean write must not erase the recorded conflict before persisting it.
    store.set('http://two' as never)
    const raw = readFileSync(path, 'utf8')
    expect(JSON.parse(raw).engineBaseUrl).toBe('http://two')
    expect(raw).toMatch(/conflict|corrupt/i)
  })
})

// ===========================================================================
// G-12 · [T] THE FAÇADE IS ADDITIVE-OPTIONAL AND INERT BY DEFAULT
//        (§2.6; §2.4 m-10; §3.2 the falsifier "a REQUIRED fs")
// ===========================================================================
describe('G-12 [T] the injected facade is additive-optional and inert by default', () => {
  it('with `fs` ABSENT both carriers drive the real node:fs legs identically', () => {
    const opPath = scratch('g12-op')
    const op = buildOp(opPath)
    op.set({ topK: 8 } as never)
    expect(JSON.parse(readFileSync(opPath, 'utf8')).topK).toBe(8)
    expect(existsSync(`${opPath}.tmp`)).toBe(false)

    const enPath = scratch('g12-en')
    const en = buildEn(enPath)
    en.set('http://real' as never)
    expect(JSON.parse(readFileSync(enPath, 'utf8')).engineBaseUrl).toBe('http://real')
    expect(existsSync(`${enPath}.tmp`)).toBe(false)
  })

  it('the facade declares EXACTLY the eight §2.6 legs — a missing leg is not a supported seam', () => {
    // §2.6 P-1..P-8: the legs the declarer drives are EXACTLY these eight, and they
    // are split across TWO paths: P-1..P-6 the write path, P-7/P-8 the boot read.
    // The record is SEEDED so the boot read takes the PRESENT branch (§2.5 ③: on an
    // absent file the presence test is the whole read — `readFileSync` is not reached).
    const path = scratch('g12-legs')
    seedOp(path, { topK: 6 })
    const { io, rec } = makeRecorder()
    // The boot read is driven at CONSTRUCTION (its presence test runs before any write).
    const store = buildOp(path, io)
    const bootLegs = new Set(rec.seq())
    for (const leg of READ_LEGS) expect([...bootLegs], `boot read must drive ${leg}`).toContain(leg)

    rec.reset()
    store.set({ topK: 1 } as never)
    const writeLegs = new Set(rec.seq())
    for (const leg of WRITE_LEGS) expect([...writeLegs], `write must drive ${leg}`).toContain(leg)

    // §2.5 ③: on an ABSENT file the presence test alone is the read.
    const absentPath = scratch('g12-legs-absent')
    const absent = makeRecorder()
    buildOp(absentPath, absent.io)
    const absentBoot = new Set(absent.rec.seq())
    expect([...absentBoot]).toContain('existsSync')
    expect([...absentBoot], 'an ABSENT file drives no readFileSync').not.toContain('readFileSync')

    // The two sets TOGETHER are the whole declared façade — nothing is declared unused
    // and nothing is driven that is not declared (§2.6).
    expect([...WRITE_LEGS, ...READ_LEGS].sort()).toEqual([...ALL_LEGS].sort())
    const driven = new Set([...bootLegs, ...writeLegs, ...absentBoot])
    for (const leg of ALL_LEGS) expect([...driven], `leg ${leg} must be driven`).toContain(leg)
    expect(ALL_LEGS.length).toBe(8)
    // The legs the facade exposes are exactly the eight declared.
    expect(Object.keys(io).sort()).toEqual([...ALL_LEGS].sort())
  })

  it('m-10: each WRITE leg is independently throwable and enters the normal failure path', () => {
    for (const leg of WRITE_LEGS) {
      const path = scratch(`g12-w-${leg}`)
      const before = seedOp(path, { topK: 6 })
      const { io, rec: r } = makeRecorder()
      const store = buildOp(path, io)
      r.reset()
      r.throwAt(leg, 0)
      let threw: unknown = null
      try {
        store.set({ topK: 12 } as never)
      } catch (e) {
        threw = e
      }
      expect([...r.fired], `leg ${leg} must actually fire`).toContain(`${leg}#0`)
      expect(threw).toBe(null)
      // "the carrier's normal failure path (receipt / nothing / previous file intact)".
      expect(store.lastWriteReceipt?.()).toEqual({ status: 'refused', reason: 'write-failed' })
      // P-1 (`mkdirSync`, step 1) is the one leg that may run before any byte
      // exists; every other write leg leaves the previous record intact.
      expect(readFileSync(path).equals(before)).toBe(true)
      r.clearThrow()
      store.set({ topK: 13 } as never)
      expect(store.lastWriteReceipt?.()).toEqual({ status: 'committed' })
    }
  })

  it('m-10: each READ leg is independently throwable at the boot read and is not a crash', () => {
    for (const leg of READ_LEGS) {
      const path = scratch(`g12-r-${leg}`)
      seedOp(path, { topK: 6 })
      const { io, rec: r } = makeRecorder()
      r.throwAt(leg, 0)
      let threw: unknown = null
      let store: AnyStore | null = null
      try {
        store = buildOp(path, io) as unknown as AnyStore
      } catch (e) {
        threw = e
      }
      expect([...r.fired], `leg ${leg} must actually fire at the boot read`).toContain(`${leg}#0`)
      // §2.4 m-10: "A partial facade is NOT a supported seam, but it is not a crash".
      expect(threw).toBe(null)
      // I-5: the read stays TOTAL and fail-soft — get() never throws, whatever the leg did.
      expect(() => store!.get()).not.toThrow()
      // §2.5 ③ fixes WHICH branch a throwing read leg takes: the file is PRESENT
      // (`existsSync === true`) and the read could not be used ⇒ THE UNPARSABLE CASE
      // ⇒ the first-run defaults answer AND the distinguishing signal is SET.
      const defaults = buildOp(scratch(`g12-r-defaults-${leg}`), makeRecorder().io).get()
      expect(store!.get()).toEqual(defaults)
      expect(store!.lastReadWasCorrupt?.()).toBe(true)
    }
  })

  it('no production caller injects the facade — the seam is INERT by default (§2.6)', () => {
    const main = readSrc('src/main/main.ts')
    // §2.6 falsifier: "a production caller that injects one".
    expect(main).not.toMatch(/createOperatorSettingsStore\(\s*\{[^}]*\bfs\s*:/)
    expect(main).not.toMatch(/createEngineConfigStore\(\s*\{[^}]*\bfs\s*:/)
  })
})

// ===========================================================================
// G-13 · [T] THE fd DISCIPLINE (§2.2; §2.4 m-11)
// ===========================================================================
describe('G-13 [T] the fd discipline holds on both carriers', () => {
  for (const carrier of [OPDIR, ENDIR]) {
    it(`${carrier}: every descriptor opened is closed on the successful path`, () => {
      const path = scratch(`g13-${carrier}`)
      const { io, rec: r } = makeRecorder()
      const store = carrier === OPDIR ? buildOp(path, io) : buildEn(path, io)
      r.reset()
      if (carrier === OPDIR) store.set({ topK: 15 } as never)
      else store.set('http://fd' as never)
      const opened = r.legCalls('openSync').length
      const closed = r.legCalls('closeSync').length
      // §2.2: two `fsync` legs ⇒ two descriptors per successful write.
      expect(opened).toBe(2)
      expect(closed).toBe(opened)
    })
  }

  it('the fds are closed even when a later leg throws (no leak on the failure path)', () => {
    const path = scratch('g13-fail')
    seedOp(path, { topK: 6 })
    const { io, rec: r } = makeRecorder()
    const store = buildOp(path, io)
    r.reset()
    r.throwAt('fsyncSync', 0)
    store.set({ topK: 30 } as never)
    expect([...r.fired]).toContain('fsyncSync#0')
    const opened = r.legCalls('openSync').length
    const closed = r.legCalls('closeSync').length
    expect(opened).toBeGreaterThan(0)
    expect(closed).toBe(opened)
  })
})

// ===========================================================================
// G-14 · [H] THE DIGEST RE-STATEMENT AND THE PRE-EMPTIVE CONTROL RE-ANCHOR
//        (§1.1 members 4/5; §3.2 I-6/I-7; §2.7 C-3/C-4; V-7/V-8)
// ===========================================================================
describe('G-14 [H] the register re-statement and the derived control stay aimed', () => {
  const REG = 'tests/pd-ui-1-theme-register.test.ts'

  /** The `UNTOUCHED_DIGESTS` literal, sliced at its own declaration (§2.7 C-3/C-4). */
  function digestsBlock(src: string): string {
    const start = src.indexOf('UNTOUCHED_DIGESTS:')
    expect(start).toBeGreaterThan(-1)
    const end = src.indexOf('\n]', start)
    return src.slice(start, end === -1 ? src.length : end)
  }
  /** The table's SEVEN rows in TABLE ORDER, with their `restated` presence. */
  function rows(src: string): Array<{ file: string; text: string; restated: boolean }> {
    const block = digestsBlock(src)
    const out: Array<{ file: string; text: string; restated: boolean }> = []
    for (const m of block.matchAll(/\{\s*file:\s*'([^']+)'([^}]*)\}/g)) {
      out.push({ file: m[1], text: m[0], restated: /\brestated\s*:/.test(m[2]) })
    }
    return out
  }

  it('the operator row is re-stated in-unit, the superseded literal stays visible, the table stays SEVEN rows', () => {
    const src = readSrc(REG)

    // V-7 (§2.7 C-3): the table is a SEVEN-row census, printed with its terms.
    const table = rows(src)
    expect(table.map((r) => r.file)).toEqual([
      'src/shared/types.ts',
      'src/main/operator-settings-store.ts',
      'src/main/preload.ts',
      'src/renderer/sidebar-panes.ts',
      'src/shared/demo-envelope.ts',
      'src/shared/dom-shim.ts',
      'src/shared/path-fork-cycle.ts',
    ])

    // V-8 / I-7: the row is re-stated, THIS unit is named, the superseded value KEPT VISIBLE.
    const row = table.find((r) => r.file === 'src/main/operator-settings-store.ts')!
    expect(row.restated).toBe(true)
    expect(row.text).toContain('U-ATOMICITY-SWEEP-CLASS-B')
    expect(row.text).toContain('11841179e004f22dd758edbe927f1a40')

    // §2.7 C-9 / the measure-then-record order: the recorded md5 equals the REAL digest.
    expect(row.text).toContain(md5('src/main/operator-settings-store.ts'))

    // I-7 falsifier: "a SECOND row moved" — this unit moves ONLY the operator row.
    const restatedByThisUnit = table.filter((r) => r.text.includes('U-ATOMICITY-SWEEP-CLASS-B'))
    expect(restatedByThisUnit.map((r) => r.file)).toEqual(['src/main/operator-settings-store.ts'])
  })

  it('the derivation STAYS DERIVED and the re-anchor note names the path it ACTUALLY resolves to', () => {
    const src = readSrc(REG)
    // I-6 falsifier: "the derivation hand-edited to a literal".
    expect(src).toContain('UNTOUCHED_DIGESTS.find((d) => d.restated === undefined)?.file')

    // Reproduce the contract's derivation EXACTLY (§2.7 C-4): the FIRST un-re-stated
    // row in TABLE ORDER.
    const table = rows(src)
    const unRestated = table.filter((r) => !r.restated).map((r) => r.file)
    expect(unRestated.length).toBeGreaterThan(0)
    const derived = unRestated[0]
    // I-6: the note beside the derivation must NAME the path it resolves to —
    // the silent re-point is the exact failure mode this rule pre-empts.
    const noteAt = src.indexOf('UNRESTATED_CONTROL_PATH')
    expect(noteAt).toBeGreaterThan(-1)
    // The PRE-EMPTIVE re-anchor note sits BESIDE the declaration (§1.1 member 5: it is
    // "the DERIVED UNRESTATED_CONTROL_PATH's COMMENTARY" that gains the note), i.e. the
    // commentary immediately ABOVE the `const UNRESTATED_CONTROL_PATH = …` line.
    const declAt = src.indexOf('const UNRESTATED_CONTROL_PATH')
    expect(declAt).toBeGreaterThan(-1)
    const commentary = src.slice(Math.max(0, declAt - 4000), declAt)
    expect(commentary).toContain(derived)
    // The note NAMES this unit as the act that derived it (§3 I-6's re-anchor requirement).
    expect(commentary).toContain('U-ATOMICITY-SWEEP-CLASS-B')
    // The control is NON-VACUOUS (I-6: "the non-vacuity guard stays GREEN").
    expect(derived.length).toBeGreaterThan(0)
    // The derived subject is a row this unit is NOT licensed to move (§1.1 member 5:
    // only the operator row is re-stated; §2.7 C-4: the derived path after this unit's
    // re-statement is the FIRST UN-RE-STATED row, which cannot be the operator row).
    expect(derived).not.toBe('src/main/operator-settings-store.ts')
  })
})

// ===========================================================================
// G-15 · [H] THE DENIED SURFACE, THE ONE-WRITER CENSUS AND THE DUPLICATE HOME
//        (§1.2 the THIRTEEN denied rows; §3.2 I-8/I-9/I-10/I-11/I-12)
// ===========================================================================
describe('G-15 [H] the denied surface is untouched and the receipt has exactly one home each', () => {
  it('§3.2 I-11: neither carrier imports the 3a types; the operator receipt is declared in its own module only', () => {
    const op = readSrc('src/main/operator-settings-store.ts')
    const en = readSrc('src/main/engine-config.ts')
    const sec = readSrc('src/main/security-store.ts')

    for (const [name, src] of [
      ['operator-settings-store.ts', op],
      ['engine-config.ts', en],
    ] as const) {
      expect(src, `${name} must not import from security-store`).not.toMatch(
        /from\s+['"][^'"]*security-store/,
      )
      expect(src).not.toMatch(/import\s*\{[^}]*SecurityStoreFs[^}]*\}/)
      expect(src).not.toMatch(/import\s*\{[^}]*SecurityWriteReceipt[^}]*\}/)
    }

    // The operator receipt type is SELF-CONTAINED, EXPORTED — and the 3a identifier
    // is NOT re-declared in the operator module (the duplicate-home limb).
    expect(op).toMatch(/export\s+type\s+OperatorSettingsWriteReceipt\s*=/)
    expect(op).not.toMatch(/export\s+type\s+SecurityWriteReceipt\s*=/)
    // And the 3a module is byte-unchanged in its own receipt home.
    expect(sec).toMatch(/export\s+type\s+SecurityWriteReceipt\s*=/)

    // §2.3 ③: the closed form — TWO statuses, ONE reason token, `readonly`.
    expect(op).toMatch(/status:\s*'committed'/)
    expect(op).toMatch(/status:\s*'refused'\)?\s*\|?\s*/)
    expect(op).toMatch(/'write-failed'/)
    // No THIRD status is minted on the operator carrier.
    const statusTokens = [...op.matchAll(/status:\s*'([a-z-]+)'/g)].map((m) => m[1])
    for (const t of statusTokens) expect(['committed', 'refused']).toContain(t)
  })

  it('§3.2 I-10 + §1.2 row 3: exactly ONE construction site per carrier in main.ts, and no second writer', () => {
    const main = readSrc('src/main/main.ts')
    expect((main.match(/createOperatorSettingsStore\(/g) ?? []).length).toBe(1)
    expect((main.match(/createEngineConfigStore\(/g) ?? []).length).toBe(1)
    expect((main.match(/provident-operator-settings\.json/g) ?? []).length).toBe(1)
    expect((main.match(/provident-engine-config\.json/g) ?? []).length).toBe(1)
  })

  it('§3.2 I-8 + §1.1 member ①②⑤: no schemaVersion TOKEN on either carrier\'s file shape', () => {
    // §1.2 row 5 / S4: "a schemaVersion member on EITHER carrier's file".
    // The token must not appear as a SHAPE member; a doc-comment that says
    // "no schemaVersion is minted" is a LIMIT sentence, not a shape (the same
    // windowed-negation reading the sibling 3a/3b anti-overclaim rows use).
    for (const f of ['src/main/operator-settings-store.ts', 'src/main/engine-config.ts']) {
      const src = readSrc(f)
      const shapeSites = [...src.matchAll(/schemaVersion/g)].filter((m) => {
        const line = src.slice(src.lastIndexOf('\n', m.index!) + 1, src.indexOf('\n', m.index!))
        // Strip the line's comment half; a shape member would remain after it.
        const code = line.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '')
        return /\bschemaVersion\b/.test(code)
      })
      expect(shapeSites, `${f} must carry no schemaVersion shape member`).toEqual([])
    }
    // And neither carrier's WRITTEN record carries one.
    const opPath = scratch('g15-op')
    buildOp(opPath, makeRecorder().io).set({ topK: 1 } as never)
    expect(Object.keys(JSON.parse(readFileSync(opPath, 'utf8')))).not.toContain('schemaVersion')
    const enPath = scratch('g15-en')
    buildEn(enPath, makeRecorder().io).set('http://s' as never)
    expect(Object.keys(JSON.parse(readFileSync(enPath, 'utf8')))).not.toContain('schemaVersion')
  })

  it('§3.2 I-9/I-12 + M-12: no page-design artifact is created and no renderer/preload byte is claimed', () => {
    // M-12: `docs/skills/designing-pages.md` does NOT exist and is NOT created here.
    expect(existsSync(join(process.cwd(), 'docs/skills/designing-pages.md'))).toBe(false)
    // §1.2 row 2: the preload's `operatorSettings.*` members are UNCHANGED —
    // no receipt member rides the channel (I-9: the receipt is ADDITIVE on the STORE).
    const preload = readSrc('src/main/preload.ts')
    expect(preload).not.toMatch(/lastWriteReceipt/)
    expect(preload).not.toMatch(/OperatorSettingsWriteReceipt/)
  })
})
