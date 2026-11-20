// tests/unit/shell-chrome/display-write-route.test.ts — unit `B-10` `stage-display-state`'s SENDER rows `(S6)`, authored BEFORE
// any byte of the change set moves (RCA-1). Every claim below is READ off `docs/L1/unit-b-10-stage-display-state.md` §5 and §7
// `(S6)`, with the landed `B-2` crossing as the thing this unit EXTENDS (never re-cuts).
//
// THE ROWS THIS FILE CARRIES (§7 `(S6)`, one arm each):
//   `(S6·channels)` §5 — `src/main/store-channels.ts` exports **exactly the five names** (`STORE_FILE_GET`, `STORE_FILE_PUT`,
//          `DISPLAY_READ`, `DISPLAY_CHANGED`, `DISPLAY_WRITE`) — read at RUNTIME off the landed module AND as a source census —
//          and the literal `provident:display:write` occurs **exactly once** under `src/**` over COMMENT-STRIPPED code, in its
//          declaring module and nowhere else (a docblock quoting it is prose).
//   `(S6·bridge)` §5 — the preload's `display` member's declared set is **exactly `{read, onChanged, write}`**, `write`'s
//          signature is declared **on ONE line** as the preload's structural twin (`Promise<unknown>`, never an import), and there
//          is no `put`/`commit` alias and **no second sender**.
//   `(S6·handle)` §5 — **exactly ONE `ipcMain.handle(DISPLAY_WRITE` site** in `src/main/main.ts`, bound (not `handleOnce`, not
//          `on`), answering `commitTab`'s OWN answer shape and the DECLARED `null` on a degraded boot (`displayRecord === null`).
//   `(S6·client)` §5 — the client's `write(tabId, entry)` answers **pass through untouched** (the record's own answer, byte for
//          byte), a write **never touches the held reading**, the fifth absent-arm word `no-write-route` is **declared and total**
//          (never a throw), and a good port gets **ONE transport call per write**.
//   `(S6·controls)` §7 `(S6)`'s mandatory positive controls — the SAME census oracle reds a forged sixth export name and a forged
//          SECOND spelling of the literal; the SAME handle oracle reds a forged second handle site; the SAME one-call-per-write
//          oracle reds a forged double sender; and the SAME held-unmoved oracle reds a **MUTANT CLIENT whose `write` DOES update its
//          held reading** (an optimistic local write), stays silent on that mutant's honest twin, and reds a `null` PRE-IMAGE.
//          **No row here can pass by matching nothing.**
//
// **THE `(S6·client)` ROW'S CONTROL VARIABLE — A DEFECT THIS FILE CARRIED ITSELF, REPAIRED BY MEASUREMENT (2026-11-19).** The row
// snapshotted the held shape ONE MICROTASK BEFORE its own un-awaited boot read (`void client.fill()`) landed: `fill()` assigns `held`
// inside a `.then`, so the snapshot read `null`; the row's own `await client.write(…)` continuation then asserted AFTER that `.then`
// had run, and the shape had moved from `null` to the port's boot reading — the row PRINTED its own pre-image (`null`) and attributed
// the BOOT's movement to the WRITE. No lawful `Promise`-returning `write` can pass that, and the only `src/**` change that would
// (assigning in `fill()` synchronously) re-cuts `B-1`'s landed *"only a settled READING changes the shape"*. **The repair is the
// control variable, never the claim:** the boot read is AWAITED before the snapshot, the pre-image is ASSERTED to be the write-clean
// standing reading (never `null`), and the write's comparison is IDENTITY AND BYTES (`heldAfter === heldBefore` plus `JSON.stringify`
// equality) both after the write and after a `displayOf` read — the absent-route arm measured the same way. What moved is the subject.
//
// **THE TWO PROSE AMBIGUITIES THIS FILE RESOLVES BY READING, NOT BY WIDENING** — both are reported to L0 rather than invented:
//   · §5 pins the bridge `write`'s parameter shape (`{ tabId: string; entry: unknown }`) and its `Promise<unknown>` answer; the
//     row pins THAT spelling on ONE line, which is what "declared on ONE line as the preload's structural twin" says. The
//     preload's `read` twin (`Promise<Record<string, unknown> | null>`) is `B-2` §4's and is untouched here.
//   · §5 says the degraded boot answers `null` "(`displayRecord === null`)" — the row reads the handle arm's own argument text for
//     a `displayRecord` guard and a `null` answer, and names both halves in the failure message rather than accepting either alone.
//
// **COLOURS DECLARED AT THIS HEAD:** every `(S6)` arm is RED, and for ONE named reason — §5's write crossing has no byte at this
// head: `DISPLAY_WRITE` is not in `store-channels.ts`, the bridge's `display` member has exactly `{read, onChanged}`, there is no
// `ipcMain.handle(DISPLAY_WRITE` arm and the client states no `write` member. **GREEN ON ARRIVAL BY DESIGN:** `(S6·controls)`,
// the forged-subject controls (a control that is red proves nothing about the oracle), plus the `(S6·channels)`/`(S6·handle)`
// limbs that read `B-2`'s LANDED constants (`DISPLAY_READ`, `DISPLAY_CHANGED`) — those are green before the change and are
// carried so a half-edit (one constant moved, the other forgotten) cannot pass.
//
// **REACHABILITY:** `src/main/preload.ts` and `src/main/main.ts` import `electron` / run `app.whenReady()`, so neither is ever
// imported here — their bytes are read with `node:fs` and their members located by BALANCED-BLOCK walks. `store-channels.ts` and
// `display-client.ts` are LANDED, pure and imported as NAMESPACES, so a member this unit adds answers `undefined` inside the row
// that needs it instead of killing the file at link time. No `vi.mock`, no network, no Electron spawn, no filesystem write.
//
// LAYER (`D-10`, `RCA-12`): `[T]`/ENVELOPE — text oracles over this repo's own `src/**` bytes plus two LANDED modules driven in the
// node realm. No paint, no DOM subject, no assembled app.
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// LANDED modules: `B-1`'s client (§5's write route lives on it) and `B-2`'s channel module (§5 moves its census 4 → 5).
import * as storeChannelsModule from '../../../src/main/store-channels.js'
import * as displayClientModule from '../../../src/renderer/display-client.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..')
const SRC = join(ROOT, 'src')
const MAIN_PATH = join(SRC, 'main', 'main.ts')
const PRELOAD_PATH = join(SRC, 'main', 'preload.ts')
const STORE_CHANNELS_PATH = join(SRC, 'main', 'store-channels.ts')

/** §5: `DISPLAY_WRITE = 'provident:display:write'` in `src/main/store-channels.ts` — its OWN constant, one job (a REQUEST). */
const WRITE_CHANNEL = { name: 'DISPLAY_WRITE', literal: 'provident:display:write', declaringModule: 'src/main/store-channels.ts' } as const
/** §5: the export census sentence moves **4 → 5 names in the same edit** (`Y-3`'s clause). */
const STORE_CHANNELS_CENSUS = ['DISPLAY_CHANGED', 'DISPLAY_READ', 'DISPLAY_WRITE', 'STORE_FILE_GET', 'STORE_FILE_PUT'] as const
/** §5: **the bridge member gains exactly ONE member** — `{read, onChanged, write}` and NOTHING else. */
const DISPLAY_MEMBERS = ['onChanged', 'read', 'write'] as const
/** §5: no `put`/`commit` alias and no second sender. `write` is the ONE sender (§5/§7 `(S6)`), so it is named, not forbidden. */
const FORBIDDEN_ALIASES = ['put', 'commit', 'sender', 'send', 'set', 'invoke'] as const
/** §5's pinned `write` signature, normalised (whitespace collapsed, trailing `;` dropped): ONE line, the preload's own twin. */
const WRITE_SIGNATURE = 'write(payload: { tabId: string; entry: unknown }): Promise<unknown>'
/** §5's pinned `write` parameter member names — the payload is the ADDRESS plus the whole entry. */
const WRITE_PAYLOAD_MEMBERS = ['entry', 'tabId'] as const
/** §5: the fifth absent-arm word. */
const NO_WRITE_ROUTE = 'no-write-route'
/** **THE PORT'S OWN BOOT READING — THE STANDING, WRITE-CLEAN SHAPE §5's CLAIM IS MEASURED AGAINST.** The row asserts its pre-image
 *  IS this reading and never `null`: *"a write never touches the client's held reading"* is only falsifiable while the client
 *  actually HOLDS one, so a `null` pre-image makes the claim unfalsifiable rather than proved. */
const BOOT_READING = { 'tab-a': { documentId: 'doc-held' } } as const
/** **THE RECORD'S OWN ANSWER, FORGED DISTINCTLY** — unlike anything this client would construct, so "passed through untouched"
 *  reads as an identity and not as a shape guess. */
const FORGED_ANSWER = {
  ok: false,
  reason: 'forged-refusal-token',
  message: 'the record’s own words, unchanged',
  address: ['display', 'tab-a'],
} as const
/** THE ADDRESS the write names, and THE WHOLE ENTRY it sends (address + caret — §3's payload shape, one whole entry). */
const WRITE_TAB = 'tab-a'
const WRITE_ENTRY = {
  documentId: 'doc-a',
  caret: { kind: 'rich', anchor: { path: [0], offset: 1 }, focus: { path: [0], offset: 1 }, focused: true },
} as const
/** The identity arm's text, spelled ONCE because the shipped row and its mutant control compare the SAME computed reading. */
const IDENTITY_ARM = 'identity moved: heldAfter !== heldBefore'
const TOP_LEVEL_INDENT = 2
const NESTED_INDENT = 4

// ─── harness ────────────────────────────────────────────────────────────────────────────────────────────────────────

type AnyFn = (...args: unknown[]) => unknown
type AnyRecord = Record<string, unknown>

const readPath = (path: string): string => readFileSync(path, 'utf8')

function show(value: unknown): string {
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function msgOf(thrown: unknown): string {
  return thrown instanceof Error ? thrown.message : String(thrown)
}

function readExport(mod: unknown, name: string): unknown {
  if (mod === null || (typeof mod !== 'object' && typeof mod !== 'function')) return undefined
  try {
    return (mod as AnyRecord)[name]
  } catch {
    return undefined
  }
}

function readFn(mod: unknown, name: string): AnyFn | null {
  const value = readExport(mod, name)
  return typeof value === 'function' ? (value as AnyFn) : null
}

function attempt(problems: string[], tag: string, run: () => string | null): void {
  let reading: string | null
  try {
    reading = run()
  } catch (thrown) {
    problems.push(`${tag} · the reading THREW before it completed: ${msgOf(thrown)}`)
    return
  }
  if (reading !== null) problems.push(`${tag} · ${reading}`)
}

/** **COMMENTS STRIPPED, ONE LEFT-TO-RIGHT SCAN, AND THE SCAN IS THE POINT** — a docblock that QUOTES a literal or a member name
 *  is prose and not a second spelling. Two regex passes are NOT enough: `src/main/store-channels.ts`'s own header spells
 *  `` `src/renderer/**` `` inside a LINE comment, and a naive `/* … *\/` pass would open a "block" there and swallow the real
 *  `export const` lines that follow. A `//` comment is consumed before its interior is ever examined, and a quoted string is
 *  carried verbatim, so the reading is of CODE. */
function stripComments(text: string): string {
  const out: string[] = []
  let i = 0
  while (i < text.length) {
    const char = text[i] as string
    if (char === '/' && text[i + 1] === '/') {
      const newline = text.indexOf('\n', i)
      i = newline < 0 ? text.length : newline
      continue
    }
    if (char === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2)
      i = close < 0 ? text.length : close + 2
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      const quote = char
      out.push(char)
      i += 1
      while (i < text.length) {
        const inner = text[i] as string
        out.push(inner)
        if (inner === '\\') {
          const escaped = text[i + 1]
          if (escaped !== undefined) out.push(escaped)
          i += 2
          continue
        }
        i += 1
        if (inner === quote) break
      }
      continue
    }
    out.push(char)
    i += 1
  }
  return out.join('')
}

const codeOnly = (text: string): string => stripComments(text)

/** How many times `needle` occurs — an occurrence COUNT, never an `includes`. */
function occurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0
  let count = 0
  let at = haystack.indexOf(needle)
  while (at >= 0) {
    count += 1
    at = haystack.indexOf(needle, at + needle.length)
  }
  return count
}

/** The inner text of the balanced `{ … }` whose `{` is at `openAt`. */
function bracedBlock(text: string, openAt: number): string | null {
  if (text[openAt] !== '{') return null
  let depth = 0
  for (let i = openAt; i < text.length; i += 1) {
    const char = text[i]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return text.slice(openAt + 1, i)
    }
  }
  return null
}

/** The ARGUMENTS of the call whose `(` is at `openAt`, split at top-level commas. */
function callArguments(text: string, openAt: number): string[] | null {
  if (text[openAt] !== '(') return null
  const args: string[] = []
  let depth = 0
  let current = ''
  for (let i = openAt; i < text.length; i += 1) {
    const char = text[i] as string
    if (char === '(' || char === '{' || char === '[') depth += 1
    else if (char === ')' || char === '}' || char === ']') {
      depth -= 1
      if (depth === 0) {
        if (current.trim().length > 0) args.push(current.trim())
        return args
      }
    } else if (char === ',' && depth === 1) {
      args.push(current.trim())
      current = ''
      continue
    }
    if (i === openAt) continue
    current += char
  }
  return null
}

function walkSources(dir: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) found.push(...walkSources(path))
    else if (entry.name.endsWith('.ts')) found.push(path)
  }
  return found
}

const relPath = (file: string): string => relative(ROOT, file).split('\\').join('/')

/** The top-level member names of an interface/object body at EXACTLY `indent` spaces, in the body's order. */
function memberNames(body: string, indent: number): string[] {
  const names: string[] = []
  for (const match of body.matchAll(new RegExp(`^ {${indent}}([A-Za-z_$][A-Za-z0-9_$]*)\\s*[(:?]`, 'gm'))) names.push(match[1] as string)
  return names
}

const normaliseSignature = (line: string): string => line.replace(/\s+/g, ' ').trim().replace(/;$/, '')

// ─── THE ORACLES (one function, two subjects each — the shipped bytes, and a forgery) ────────────────────────────────

/** **ORACLE 1 — the store-channels export census**, over any source text: the `export const` names it declares. */
function exportCensusOf(source: string): string[] {
  return [...codeOnly(source).matchAll(/^export const ([A-Za-z_$][A-Za-z0-9_$]*)/gm)].map((match) => match[1] as string)
}

/** **ORACLE 2 — a literal's spellings across a source map**: the files it occurs in (comment-stripped), with counts. */
function literalSpellings(sources: ReadonlyMap<string, string>, literal: string): Array<{ file: string; count: number }> {
  const hits: Array<{ file: string; count: number }> = []
  for (const [file, raw] of sources) {
    const count = occurrences(codeOnly(raw), literal)
    if (count > 0) hits.push({ file: file.includes('/') || file.includes('\\') ? relPath(file) : file, count })
  }
  return hits
}

/** **ORACLE 3 — the `ipcMain.handle(<NAME>` sites** in a source text: every balanced call whose first argument is the NAME. */
function handleSites(source: string, channelName: string): Array<{ args: string[]; text: string }> {
  const code = codeOnly(source)
  const sites: Array<{ args: string[]; text: string }> = []
  const pattern = /ipcMain\.(handle|handleOnce|on|once)\s*\(/g
  for (const match of code.matchAll(pattern)) {
    const openAt = (match.index ?? 0) + match[0].length - 1
    const args = callArguments(code, openAt)
    if (args === null) continue
    if (normaliseSignature(args[0] ?? '') !== channelName) continue
    sites.push({ args, text: code.slice(match.index ?? 0, (match.index ?? 0) + match[0].length).trim() })
  }
  return sites
}

/** **ORACLE 4 — §5/§7 (S6): a good port gets ONE transport call per write.** It takes the counter and the act separately, so the
 *  SHIPPED row drives it over the client's own transport and the CONTROL drives it over a forged double-sender: one function, two
 *  subjects, which is what makes the control a control. */
function oneCallPerWrite(countOf: () => number, send: () => void): string | null {
  const before = countOf()
  send()
  const calls = countOf() - before
  return calls === 1
    ? null
    : `one write produced ${calls} transport call(s) — §5/§7 (S6): a good port gets ONE call per write (a second send is a second authority for what the record says, and it would deliver two pushes for one capture)`
}

/** A HAND COPY of a shape — the mutant control's pre-image must be the shipped boot reading's OWN BYTES under a NEW IDENTITY, so
 *  its identity arm is a real reading rather than a tautology bought by re-using the shipped object. */
const handCopy = (value: unknown): unknown => JSON.parse(JSON.stringify(value)) as unknown

/** **ORACLE 5's COMPARISON ARM — the held reading is the SAME OBJECT with the SAME BYTES, and BOTH halves are computed.** An
 *  identity-only comparison would pass a client that swapped in a byte-identical replacement; a bytes-only comparison would pass a
 *  client that re-used the object and mutated a member it holds. `B-3`'s `m4` lesson applies to this arm as much as to its mutant:
 *  every answer here is a READING off the two shapes, never a sentence about them. */
function unmovedSince(held: () => unknown, before: unknown): string | null {
  const after = held()
  const msgs: string[] = []
  if (after !== before) msgs.push(IDENTITY_ARM)
  const beforeBytes = show(before)
  const afterBytes = show(after)
  if (afterBytes !== beforeBytes) msgs.push(`bytes moved: ${beforeBytes} → ${afterBytes}`)
  return msgs.length > 0 ? msgs.join('; ') : null
}

/** **ORACLE 5 — §5/§7 `(S6)`: A WRITE NEVER TOUCHES THE CLIENT'S HELD READING.** It takes the held accessor and the act SEPARATELY,
 *  so the SHIPPED row drives it over the real landed client's own `write` and the CONTROL drives it over a client whose `write` DOES
 *  update its held reading — one function, two subjects, which is what makes the control a control.
 *
 *  **THE PRE-IMAGE IS A THIRD SUBJECT, and its check is the repair this row needed.** `fill()` assigns `held` INSIDE a `.then`, so a
 *  snapshot taken one microtask before the boot read lands reads `null` — and the write's own `await` then reports the BOOT's
 *  movement as the write's. The row therefore AWAITS the boot read and asserts a LIVE pre-image; this oracle refuses to grade a
 *  `null` one, because "nothing moved" over nothing is not §5's claim. */
async function heldUnmovedAcrossWrite(held: () => unknown, act: () => Promise<unknown>): Promise<string | null> {
  const before = held()
  if (before === null || before === undefined) {
    return `the pre-image is ${show(before)} — §5's claim is measured over the STANDING reading, so the held shape must be LIVE before the write: "unmoved" over nothing is unfalsifiable (the boot read is the control variable and must be SETTLED first)`
  }
  await act()
  return unmovedSince(held, before)
}

/** §5: **the client's `write` answers pass through untouched.** Driven over the REAL landed client with a port whose transport
 *  answers a distinctive answer, so "untouched" is an identity reading and not a shape guess.
 *
 *  **THE BOOT READ IS STARTED HERE AND SETTLED BY THE ROW, NEVER BY A `void`** — this helper's own landed defect, named: a
 *  `void client.fill()` snapshot at one microtask left `held` `null` at the snapshot and assigned by the time the row's
 *  `await client.write(…)` continuation asserted, so the row reported the BOOT's movement as the write's. The promise is
 *  HANDED BACK so the row's snapshot is the first reading AFTER the boot, which is the only arrangement in which the write is the
 *  one thing that could move the shape. */
function writeRoute(
  problems: string[],
  label: string,
): { client: AnyRecord; portCalls: () => number; held: () => unknown; boot: Promise<unknown> } | null {
  const createClient = readFn(displayClientModule, 'createDisplayClient')
  if (createClient === null) {
    problems.push(`${label} · \`createDisplayClient\` does not resolve on the LANDED \`src/renderer/display-client.js\` — §5's write route has no client`)
    return null
  }
  let portCalls = 0
  const port: AnyRecord = {
    read: () => handCopy(BOOT_READING),
    onChanged: () => (): void => undefined,
    write: (tabId: unknown, entry: unknown) => {
      portCalls += 1
      void tabId
      void entry
      return Promise.resolve(FORGED_ANSWER)
    },
  }
  const client = createClient(port) as AnyRecord
  const fill = readFn(client, 'fill')
  if (fill === null) {
    problems.push(`${label} · the LANDED client states no \`fill()\` — the boot read that puts a standing shape in the client's hands has no subject, so §5's "a write touches no held reading" would be measured over \`null\``)
    return null
  }
  let boot: Promise<unknown>
  try {
    boot = Promise.resolve(fill.call(client) as unknown)
  } catch (thrown) {
    problems.push(`${label} · \`fill()\` THREW before the boot read started: ${msgOf(thrown)} — §5's pre-image cannot be a standing reading`)
    return null
  }
  return { client, portCalls: () => portCalls, held: () => (client.reading as AnyFn)(), boot }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S6)` — THE CHANNELS, THE BRIDGE, THE ONE HANDLE, THE CLIENT (§5, §7 (S6))
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('display-write-route · arm (S6) — the write crossing is ONE constant, ONE member, ONE handle (§5)', () => {
  it('(S6·channels) · `store-channels.ts` EXPORTS EXACTLY THE FIVE NAMES AND THE LITERAL IS SPELLED EXACTLY ONCE UNDER COMMENT-STRIPPED `src/**` (§5)', () => {
    const problems: string[] = []
    const sources = walkSources(SRC)
    expect(sources.length, 'the `src/**` walk found source files, or an empty walk answers "spelled once, nowhere else" for free').toBeGreaterThan(0)

    // ── THE RUNTIME CENSUS FIRST: the module is LANDED and pure, so the export set is read off the object and not off a regex.
    attempt(problems, '(S6·channels)·runtime-census', () => {
      const exported = Object.keys(storeChannelsModule).sort()
      const expected = [...STORE_CHANNELS_CENSUS].sort()
      if (exported.length === 0) return '`src/main/store-channels.ts` exports NOTHING at runtime — the census has no subject'
      const missing = expected.filter((name) => !exported.includes(name))
      const spurious = exported.filter((name) => !(expected as readonly string[]).includes(name))
      const msgs: string[] = []
      if (missing.length > 0) {
        msgs.push(`the module does not export [${missing.join(', ')}] — §5 adds \`${WRITE_CHANNEL.name}\` and amends the module's own export census sentence 4 → 5 in the SAME edit, so the set is exactly [${expected.join(', ')}]`)
      }
      if (spurious.length > 0) {
        msgs.push(`the module exports [${spurious.join(', ')}], which §5's amended census does not admit — the set is EXACTLY the five names`)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    attempt(problems, '(S6·channels)·source-census', () => {
      const declared = exportCensusOf(readPath(STORE_CHANNELS_PATH)).sort()
      const expected = [...STORE_CHANNELS_CENSUS].sort()
      if (declared.length === 0) return '`src/main/store-channels.ts` declares no `export const` at all'
      return declared.join(',') === expected.join(',') ? null : `the module's source declares [${declared.join(', ')}] where §5's amended census is [${expected.join(', ')}]`
    })

    // ── AND THE NAME→VALUE IDENTITY: the constant IS its literal, which is what "one spelling" buys a consumer that imports the
    // ── NAME (a re-spelled local would answer a different string).
    attempt(problems, '(S6·channels)·identity', () => {
      const answer = readExport(storeChannelsModule, WRITE_CHANNEL.name)
      if (typeof answer !== 'string') return `\`${WRITE_CHANNEL.declaringModule}\` exports no \`${WRITE_CHANNEL.name}\` string (read ${show(answer)}) — §5's constant has no runtime value`
      return answer === WRITE_CHANNEL.literal ? null : `\`${WRITE_CHANNEL.name}\` answers ${show(answer)} while §5 pins ${show(WRITE_CHANNEL.literal)}`
    })

    // ── THE LITERAL, SPELLED ONCE, over COMMENT-STRIPPED code (a docblock quoting it is prose, not a second channel).
    attempt(problems, '(S6·channels)·literal', () => {
      const hits = literalSpellings(new Map(sources.map((file) => [file, readPath(file)])), WRITE_CHANNEL.literal)
      const total = hits.reduce((sum, hit) => sum + hit.count, 0)
      if (total === 0) {
        return `the literal ${show(WRITE_CHANNEL.literal)} occurs in NO \`src/**\` file — §5 requires \`export const ${WRITE_CHANNEL.name} = '${WRITE_CHANNEL.literal}'\` in \`${WRITE_CHANNEL.declaringModule}\`, so this constant has no subject at all`
      }
      const msgs: string[] = []
      if (total !== 1) {
        msgs.push(`the literal ${show(WRITE_CHANNEL.literal)} is spelled ${total} time(s) across ${hits.map((hit) => `${hit.file} (${hit.count})`).join(', ')} — §5 pins EXACTLY ONE occurrence, in its declaring module alone (the F-8 single source: a literal anywhere else is a second channel)`)
      } else if (hits[0]!.file !== WRITE_CHANNEL.declaringModule) {
        msgs.push(`the literal ${show(WRITE_CHANNEL.literal)} lives in ${hits[0]!.file}; §5 declares \`${WRITE_CHANNEL.name}\` in \`${WRITE_CHANNEL.declaringModule}\``)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§5 — `DISPLAY_WRITE` and the 4 → 5 census, each literal spelled once (docs/L1/unit-b-10-stage-display-state.md §5)',
    ).toEqual([])
  })

  it('(S6·bridge) · THE PRELOAD’S `display` MEMBER IS EXACTLY `{read, onChanged, write}` — `write` declared on ONE line as the structural twin, and NO `put`/`commit` alias and no second sender (§5)', () => {
    const problems: string[] = []
    const code = codeOnly(readPath(PRELOAD_PATH))

    attempt(problems, '(S6·bridge)·declared-set', () => {
      const at = code.indexOf('export interface ProvidentBridge {')
      if (at < 0) return '`src/main/preload.ts` declares no `export interface ProvidentBridge {` — §5\'s member has no declared site'
      const open = code.indexOf('{', at)
      const block = open < 0 ? null : bracedBlock(code, open)
      if (block === null) return 'the `ProvidentBridge` block never closes — the member census cannot be read'
      const displayLine = new RegExp(`^ {${TOP_LEVEL_INDENT}}display\\s*:`, 'm').exec(block)
      if (displayLine === null) return `the interface declares no ${TOP_LEVEL_INDENT}-space TOP-LEVEL \`display\` key — §5 pins ONE object member carrying the crossing`
      const colon = block.indexOf(':', displayLine.index + displayLine[0].length - 1)
      const memberOpen = colon < 0 ? -1 : block.indexOf('{', colon)
      const inner = memberOpen < 0 ? null : bracedBlock(block, memberOpen)
      if (inner === null) return 'the `display` member carries no balanced object body — §5 pins an OBJECT with exactly three members'
      const declared = memberNames(inner, NESTED_INDENT)
      const expected = [...DISPLAY_MEMBERS].sort()
      const msgs: string[] = []
      if ([...declared].sort().join(',') !== expected.join(',')) {
        msgs.push(
          `the \`display\` member declares [${declared.join(', ')}] — §5 pins EXACTLY [${[...DISPLAY_MEMBERS].join(', ')}]: ONE new member (\`write\`), no \`put\`/\`commit\` alias and no second sender`,
        )
      }
      const aliases = declared.filter((name) => (FORBIDDEN_ALIASES as readonly string[]).includes(name))
      if (aliases.length > 0) {
        msgs.push(`the \`display\` member declares alias(es) [${aliases.join(', ')}] — §5's sender is \`write\` and NOTHING else (the write route is one job)`)
      }
      // AND `write` IS THE ONE SENDER: the census above must contain it, or the bridge has no sender at all.
      if (!declared.includes('write')) {
        msgs.push('the `display` member declares NO `write` — §5: the bridge member gains exactly ONE member, and it is the sender the record\'s write route needs')
      }
      const writers = declared.filter((name) => (DISPLAY_MEMBERS as readonly string[]).includes(name) && name !== 'read' && name !== 'onChanged')
      if (writers.length !== 1) {
        msgs.push(`the \`display\` member carries ${writers.length} sender member(s) [${writers.join(', ')}] — §5/§7 (S6): exactly ONE sender member, and it is \`write\``)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    attempt(problems, '(S6·bridge)·write-line', () => {
      const at = code.indexOf('export interface ProvidentBridge {')
      const open = at < 0 ? -1 : code.indexOf('{', at)
      const block = open < 0 ? null : bracedBlock(code, open)
      if (block === null) return 'the `ProvidentBridge` block never closes — the `write` signature cannot be read'
      const displayLine = new RegExp(`^ {${TOP_LEVEL_INDENT}}display\\s*:`, 'm').exec(block)
      if (displayLine === null) return 'no two-space `display` key resolves — the `write` signature has no host block'
      const colon = block.indexOf(':', displayLine.index + displayLine[0].length - 1)
      const memberOpen = colon < 0 ? -1 : block.indexOf('{', colon)
      const inner = memberOpen < 0 ? null : bracedBlock(block, memberOpen)
      if (inner === null) return 'the `display` member carries no object body — §5\'s `write` has no declaration'
      const lines = [...inner.matchAll(new RegExp(`^ {${NESTED_INDENT}}write\\b.*$`, 'gm'))].map((match) => match[0])
      if (lines.length === 0) return `the \`display\` member declares no \`write\` at the ${NESTED_INDENT}-space nested indent — §5 gains exactly this ONE member`
      if (lines.length > 1) return `\`write\` is declared ${lines.length} times inside the \`display\` member — §5 pins ONE member with one signature`
      const normalised = normaliseSignature(lines[0] as string)
      const msgs: string[] = []
      if (normalised !== WRITE_SIGNATURE) {
        msgs.push(
          `\`write\` reads ${show(normalised)}; §5 pins ${show(WRITE_SIGNATURE)} — declared on ONE LINE as the preload's own STRUCTURAL TWIN (a \`Record<string, unknown>\`-shaped answer, never an import, \`ASM-B2-1\`'s rule unchanged)`,
        )
      }
      for (const member of WRITE_PAYLOAD_MEMBERS) {
        if (!new RegExp(`\\b${member}\\b`).test(normalised)) msgs.push(`the pinned signature names no \`${member}\` — §5's payload is \`{ tabId, entry }\``)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // AND THE IMPLEMENTATION IS REAL ON `window.provident`, and it invokes the channel by NAME (§5's F-8 rule: never re-spelled).
    attempt(problems, '(S6·bridge)·implementation', () => {
      const bridgeAt = code.indexOf('const bridge: ProvidentBridge = ')
      if (bridgeAt < 0) return 'no `const bridge: ProvidentBridge = { … }` literal resolves in `src/main/preload.ts` — the declared member has no implementation'
      const open = code.indexOf('{', bridgeAt)
      const bridge = open < 0 ? null : bracedBlock(code, open)
      if (bridge === null) return 'the exposed bridge literal never closes'
      const displayLine = new RegExp(`^ {${TOP_LEVEL_INDENT}}display\\s*:`, 'm').exec(bridge)
      if (displayLine === null) return 'the exposed bridge literal carries no `display` KEY'
      const memberOpen = bridge.indexOf('{', displayLine.index + displayLine[0].length - 1)
      const inner = memberOpen < 0 ? null : bracedBlock(bridge, memberOpen)
      if (inner === null) return 'the `display` implementation carries no object body'
      if (!new RegExp(`^ {${NESTED_INDENT}}write\\b`, 'm').test(inner)) return 'the `display` IMPLEMENTATION declares no `write` member — the interface would promise a sender `window.provident` does not carry'
      const msgs: string[] = []
      if (!/\binvoke\s*\(\s*DISPLAY_WRITE\b/.test(inner)) msgs.push(`the implementation never \`invoke(\`s the NAME \`${WRITE_CHANNEL.name}\` — §5: the bridge member is a REQUEST (\`invoke\`/\`handle\`) over the F-8 constant, never a re-spelled literal`)
      if (inner.includes(WRITE_CHANNEL.literal)) msgs.push(`the implementation spells the literal ${show(WRITE_CHANNEL.literal)} — §5 pins the name, imported from \`store-channels.ts\``)
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(problems, '§5 — the bridge member is exactly `{read, onChanged, write}` (docs/L1/unit-b-10-stage-display-state.md §5)').toEqual([])
  })

  it('(S6·handle) · EXACTLY ONE BOUND `ipcMain.handle(DISPLAY_WRITE` SITE IN `main.ts`, ANSWERING `commitTab`’S OWN SHAPE AND `null` ON A DEGRADED BOOT (§5)', () => {
    const problems: string[] = []
    const raw = readPath(MAIN_PATH)
    const code = codeOnly(raw)

    const sites = handleSites(raw, WRITE_CHANNEL.name)
    if (sites.length === 0) {
      problems.push(
        `(S6·handle) · no \`ipcMain.handle(${WRITE_CHANNEL.name}\` site resolves in \`src/main/main.ts\` — §5 gains ONE arm beside the existing \`ipcMain.handle(DISPLAY_READ, …)\`, and without it the renderer's \`write\` invokes a channel main never answers`,
      )
    } else {
      if (sites.length !== 1) {
        problems.push(
          `(S6·handle) · ${WRITE_CHANNEL.name} is handled at ${sites.length} site(s) [${sites.map((site) => site.text).join(', ')}] — §5 gains ONE arm: a second \`handle\` for one channel THROWS at registration and would be a second write route`,
        )
      }
      attempt(problems, '(S6·handle)·bound', () => {
        const site = sites[0]!
        const msgs: string[] = []
        if (site.text !== `ipcMain.${'handle'}(`) {
          // the site's own leading text is quoted, so a `handleOnce`/`on` registration is NAMED rather than silently accepted
          if (!/^ipcMain\.handle\($/.test(site.text)) msgs.push(`the ONE site registers with \`${site.text}\` — §5 pins \`ipcMain.handle(\`, the REQUEST route (a \`handleOnce\`/on\` registration is a different mechanism)`)
        }
        if (site.args.length < 2) msgs.push('the `handle(` call passes no handler argument — the arm is registered and answers nothing')
        const handler = site.args.slice(1).join(', ')
        if (!/\bcommitTab\s*\(/.test(handler)) {
          msgs.push(
            'the handle arm never calls `commitTab(` — §5: the arm answers `displayRecord.commitTab(tabId, entry)` and the RECORD\'s own shape and entry arms do the judging (a forged payload is refused by `commitTab`, never repaired here)',
          )
        }
        if (!/\bdisplayRecord\b/.test(handler)) {
          msgs.push('the handle arm never names `displayRecord` — §5 builds it over the ONE construction\'s handle and reads its own degraded-boot `null`')
        }
        if (!/\bnull\b/.test(handler)) {
          msgs.push('the handle arm carries no `null` answer — §5: a degraded boot (`displayRecord === null`) answers `null`, the DECLARED absence, and never a throw')
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    // AND IT IS THE ONLY `ipcMain` REGISTRATION FOR THAT CHANNEL: an `ipcMain.on(DISPLAY_WRITE` beside it would be a second route.
    attempt(problems, '(S6·handle)·no-second-route', () => {
      const msgs: string[] = []
      const onSites = occurrences(code, `ipcMain.on(${WRITE_CHANNEL.name}`)
      const onceSites = occurrences(code, `ipcMain.once(${WRITE_CHANNEL.name}`)
      if (onSites > 0) msgs.push(`\`ipcMain.on(${WRITE_CHANNEL.name}\` is registered ${onSites} time(s) — §5's write is a REQUEST; a \`send\`-side registration for the same channel is a second mechanism`)
      if (onceSites > 0) msgs.push(`\`ipcMain.once(${WRITE_CHANNEL.name}\` is registered ${onceSites} time(s) — §5 pins ONE \`handle\` site`)
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(problems, '§5 — exactly ONE `ipcMain.handle(DISPLAY_WRITE` arm (docs/L1/unit-b-10-stage-display-state.md §5)').toEqual([])
  })

  it('(S6·client) · THE CLIENT’S `write` PASSES THE RECORD’S OWN ANSWER THROUGH UNTOUCHED, TOUCHES NO HELD READING, IS TOTAL WITH THE FIFTH WORD `no-write-route`, AND GETS ONE TRANSPORT CALL PER WRITE (§5)', async () => {
    const problems: string[] = []
    const route = writeRoute(problems, '(S6·client)')

    if (route !== null) {
      const write = readFn(route.client, 'write')
      attempt(problems, '(S6·client)·member', () =>
        typeof write === 'function'
          ? null
          : '§5 gains the client’s `write(tabId, entry)` over the port’s optional `write?` member, and the LANDED client states no such function — the capture has no route to the record',
      )
      if (typeof write === 'function') {
        // ── THE CONTROL VARIABLE, SETTLED **BEFORE** THE SNAPSHOT. §5's claim is "a write moves no held reading", so the write must be
        // ── the ONLY thing that could move it: the boot read is AWAITED here (`fill()` assigns `held` inside a `.then`; an un-awaited
        // ── `void client.fill()` puts the snapshot one microtask BEFORE the shape exists, and the write's own `await` then reports the
        // ── BOOT's movement as the write's — the `null` pre-image this row used to print is the proof of that, not of a fault in `src`).
        await route.boot
        const heldBefore = route.held()

        attempt(problems, '(S6·client)·pre-image', () => {
          if (heldBefore === null || heldBefore === undefined) {
            return `the pre-image is ${show(heldBefore)} with the boot read AWAITED — §5's claim needs a LIVE standing shape to leave alone, so the row cannot grade a write against nothing (the boot read is the control variable)`
          }
          const bytes = show(heldBefore)
          return bytes === show(BOOT_READING)
            ? null
            : `the pre-image reads ${bytes} where the port's own boot read answers ${show(BOOT_READING)} — the row measures the write against the WRITE-CLEAN standing reading it was handed`
        })

        let answer: unknown
        const heldUnmoved = await heldUnmovedAcrossWrite(route.held, async () => {
          answer = await (write as AnyFn)(WRITE_TAB, WRITE_ENTRY)
        })

        attempt(problems, '(S6·client)·pass-through', () =>
          show(answer) === show(FORGED_ANSWER)
            ? null
            : `the client answered ${show(answer)} where the port's transport answered the record's own \`DisplayWriteAnswer\` unchanged — §5: the answer is the record's OWN, passed through untouched (the bridge's twin is \`Promise<unknown>\` precisely because nothing here judges it)`,
        )

        attempt(problems, '(S6·client)·held-unmoved', () => heldUnmoved)

        // AND A `displayOf` READ OFF THE HELD SHAPE MOVES NOTHING EITHER: the held reading is the SAME OBJECT with the SAME BYTES, so
        // a write cannot have swapped it for a byte-identical replacement behind an accessor that answers the same words.
        attempt(problems, '(S6·client)·held-unmoved·after-displayOf', () => {
          const displayOf = readFn(route.client, 'displayOf')
          if (displayOf === null) return 'the LANDED client states no `displayOf`, so the held reading cannot be read off the shape after a write'
          const seen = displayOf.call(route.client, WRITE_TAB)
          const movement = unmovedSince(route.held, heldBefore)
          return movement === null ? null : `${movement} (measured after \`displayOf(${show(WRITE_TAB)})\` answered ${show(seen)})`
        })

        attempt(problems, '(S6·client)·one-call', () =>
          oneCallPerWrite(route.portCalls, () => void (write as AnyFn)(WRITE_TAB, { documentId: 'doc-a' })),
        )
      }

      // ── THE FIFTH ABSENT-ARM WORD: `no-write-route`, DECLARED AND TOTAL, never a throw — AND THE HELD READING IS UNTOUCHED ON
      // ── THAT ARM TOO (the same comparison arm, over the same live pre-image: the absent route must move nothing either).
      await (async (): Promise<void> => {
        const tag = '(S6·client)·no-write-route'
        try {
        const createClient = readFn(displayClientModule, 'createDisplayClient') as AnyFn
        const bare = createClient({ read: () => ({ 'tab-a': { documentId: 'doc-a' } }), onChanged: () => (): void => undefined }) as AnyRecord
        const bareWrite = readFn(bare, 'write')
        if (typeof bareWrite !== 'function') {
          problems.push(`${tag} · the client states no \`write\` at all, so the fifth absent arm has no subject`)
          return
        }
        // THE BOOT READ SETTLED FIRST, exactly as in the good-port arm: the absent route is graded against a LIVE shape.
        const bareFill = readFn(bare, 'fill')
        if (bareFill === null) {
          problems.push(`${tag} · the client states no \`fill()\`, so the absent arm's pre-image cannot be a standing reading`)
          return
        }
        await (bareFill.call(bare) as Promise<unknown>)
        const bareHeld = (): unknown => (bare.reading as AnyFn)()
        const bareBefore = bareHeld()
        let answer: unknown
        try {
          answer = (bareWrite as AnyFn)(WRITE_TAB, { documentId: 'doc-a' })
        } catch (thrown) {
          problems.push(`${tag} · a PORT WITH NO WRITE ROUTE made \`client.write\` THROW (${msgOf(thrown)}) — §5: the fifth absent-arm word is DECLARED and TOTAL, never a throw (the four landed words keep their meanings)`)
          return
        }
        const settled = answer !== null && typeof answer === 'object' && typeof (answer as AnyRecord)['then'] === 'function' ? await (answer as Promise<unknown>) : answer
        const reason = (settled as AnyRecord | null)?.['reason']
        if (reason !== NO_WRITE_ROUTE) {
          problems.push(
            `${tag} · the absent arm answered ${show(settled)} — §5 pins the fifth word \`${NO_WRITE_ROUTE}\`: a client that folded it into another absence leaves a caller unable to tell a wiring fault from a refusal`,
          )
        }
        const movement = unmovedSince(bareHeld, bareBefore)
        if (movement !== null) {
          problems.push(`${tag} · the absent arm moved the held reading: ${movement} — §5's own words on this arm are "the entry is unchanged and the held reading is untouched", so the fifth word is a refusal that leaves the shape alone`)
        }
        } catch (thrown) {
          problems.push(`${tag} · the reading THREW before it completed: ${msgOf(thrown)}`)
        }
      })()
    }

    expect(problems, '§5 — the client’s write route and its fifth absent-arm word (docs/L1/unit-b-10-stage-display-state.md §5)').toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(S6·controls)` — THE MANDATORY POSITIVE CONTROLS (§7 (S6))
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('display-write-route · arm (S6·controls) — every census above reds its own forgery (§7 (S6))', () => {
  it('(S6·controls) · A FORGED SIXTH EXPORT NAME, A FORGED SECOND SPELLING OF THE LITERAL, A FORGED SECOND `handle` SITE AND A FORGED DOUBLE SENDER ARE EACH ANSWERED BY NAME (§7 (S6))', () => {
    const problems: string[] = []

    attempt(problems, '(S6·controls)·export-set', () => {
      const forged = `${readPath(STORE_CHANNELS_PATH)}\nexport const DISPLAY_COMMIT = 'provident:display:commit'\n`
      const declared = exportCensusOf(forged)
      const expected = [...STORE_CHANNELS_CENSUS]
      const spurious = declared.filter((name) => !(expected as readonly string[]).includes(name))
      if (spurious.length === 0) {
        return 'CONTROL FAILED: a forged SIXTH `export const` in the channels module was not reported — §5\'s census (exactly five names) does not discriminate, so a stray constant would ship green'
      }
      return spurious.includes('DISPLAY_COMMIT') ? null : `CONTROL FAILED: the census answered [${spurious.join(', ')}] without naming the forged constant`
    })

    attempt(problems, '(S6·controls)·second-spelling', () => {
      // A SELF-CONTAINED forgery: the declaring site AND a second spelling, so this control reads its own subject rather than the
      // shipped file's landing state (a control that reds because a contract byte has not arrived is not a control).
      const forged = new Map<string, string>([
        ['src/main/store-channels.ts', `export const DISPLAY_WRITE = 'provident:display:write'\n`],
        ['src/main/second-writer.ts', `const writeRoute = 'provident:display:write'\n`],
      ])
      const hits = literalSpellings(forged, WRITE_CHANNEL.literal)
      const total = hits.reduce((sum, hit) => sum + hit.count, 0)
      if (total < 2) return 'CONTROL FAILED: a forged SECOND spelling of `provident:display:write` was not counted — the "spelled once" arm would accept a second channel'
      return hits.some((hit) => hit.file === 'src/main/second-writer.ts')
        ? null
        : `CONTROL FAILED: the census reported [${hits.map((hit) => hit.file).join(', ')}] without naming the forged second site`
    })

    attempt(problems, '(S6·controls)·second-handle', () => {
      const forged = `
ipcMain.handle(DISPLAY_WRITE, (_event, payload) => null)
ipcMain.handle(DISPLAY_WRITE, (_event, payload) => null)
`
      const sites = handleSites(forged, WRITE_CHANNEL.name)
      if (sites.length !== 2) return `CONTROL FAILED: two forged \`ipcMain.handle(${WRITE_CHANNEL.name}\` sites read ${sites.length} site(s) — the "exactly one handle" arm cannot see a duplicate`
      // AND THE COMMENT-STRIPPED READING IS REAL: a docblock quoting the site is prose.
      const commented = `// ipcMain.handle(DISPLAY_WRITE, (_event, payload) => null)\nconst nothing = 1\n`
      const fromComment = handleSites(commented, WRITE_CHANNEL.name)
      return fromComment.length === 0
        ? null
        : 'CONTROL FAILED: an `ipcMain.handle(DISPLAY_WRITE` inside a LINE COMMENT was counted as a site — a docblock that quotes the arm is prose'
    })

    attempt(problems, '(S6·controls)·double-sender', () => {
      // **THE FORGED DOUBLE SENDER, DRIVEN THROUGH THE SAME ORACLE THE SHIPPED ROW USES**: one write, two transport calls — the
      // exact fault "one call per write" exists to catch, and one the client's own member cannot exhibit while §5 is unlanded.
      let calls = 0
      const transport = (): void => {
        calls += 1
      }
      const reported = oneCallPerWrite(
        () => calls,
        () => {
          transport()
          transport()
        },
      )
      if (reported === null) {
        return 'CONTROL FAILED: a forged double sender (two transport calls for one write) PASSED the oracle — the one-call-per-write arm cannot discriminate, so a double delivery would ship green'
      }
      return /transport call/.test(reported) ? null : `CONTROL FAILED: the oracle reported [${reported}] without naming the transport calls`
    })

    expect(problems, '§7 (S6) — the positive controls (docs/L1/unit-b-10-stage-display-state.md §7 (S6))').toEqual([])
  })

  it('(S6·controls)·held-unmoved · A MUTANT CLIENT WHOSE `write` DOES UPDATE ITS HELD READING REDS THE SAME ORACLE, AN HONEST TWIN STAYS GREEN, AND AN UNSETTLED BOOT READ REDS THE PRE-IMAGE ARM (§7 (S6), §5)', async () => {
    const problems: string[] = []

    // **WHY THE MUTANT IS BUILT BY HAND AND NOT THROUGH `createDisplayClient` (said, not hidden).** `held` is a CLOSURE-PRIVATE
    // binding of the landed factory: the port it is handed has `read`/`onChanged`/`write` and NO route into `held`, so no port can make
    // the shipped client write one — which is exactly what makes the shipped client lawful, and exactly why the only way this oracle
    // can SEE a write through the held shape is a client that writes it. So both subjects below are hand-built over a HAND COPY of
    // the shipped boot reading (`BOOT_READING`'s own bytes, a NEW object), and they differ in ONE member: the mutant's `write`.
    let honestHeld: unknown = handCopy(BOOT_READING)
    let mutantHeld: unknown = handCopy(BOOT_READING)

    /** A client whose `write` touches NOTHING it holds — the honest twin, so the control proves the oracle is not merely always-red. */
    const honest = {
      held: (): unknown => honestHeld,
      write: (): Promise<unknown> => Promise.resolve({ ok: true }),
    }

    /** **THE MUTANT — the exact fault §5 forbids: an OPTIMISTIC LOCAL WRITE.** Its `write` merges the sent entry into the shape it holds
     *  and answers `{ok: true}`: the held reading now claims what the caller wanted, before any store delivery, any push and any
     *  re-read. It REPLACES the held object (a merge that rebuilds, as a copy law would), so BOTH comparison arms have a subject. */
    const mutant = {
      held: (): unknown => mutantHeld,
      write: (tabId: string, entry: unknown): Promise<unknown> => {
        mutantHeld = { ...(mutantHeld as AnyRecord), [tabId]: handCopy(entry) }
        return Promise.resolve({ ok: true })
      },
    }

    // ── 1. THE ORACLE'S ANSWER ON A LAWFUL CLIENT MUST BE `null`, or its answer on the shipped row means nothing.
    const honestReading = await heldUnmovedAcrossWrite(honest.held, () => honest.write())
    if (honestReading !== null) {
      problems.push(
        `CONTROL FAILED: a client whose \`write\` touches nothing it holds was REPORTED as ${show(honestReading)} — the oracle reds a lawful client, so its silence about the shipped row is not a reading`,
      )
    }

    // ── 2. THE ORACLE MUST ANSWER ON THE MUTANT, AND ITS ANSWER MUST BE THE MOVEMENT IT MEASURED — both arms, printed as values.
    const mutantReading = await heldUnmovedAcrossWrite(mutant.held, () => mutant.write(WRITE_TAB, WRITE_ENTRY))
    const expectedMutantReading = [
      IDENTITY_ARM,
      `bytes moved: ${show(handCopy(BOOT_READING))} → ${show({ [WRITE_TAB]: handCopy(WRITE_ENTRY) })}`,
    ].join('; ')
    if (mutantReading === null) {
      problems.push(
        'CONTROL FAILED: a client whose `write` REPLACES its held shape with the entry it just sent PASSED the oracle — §5\'s "a write never touches the held reading" does not discriminate, so an optimistic local write would ship green',
      )
    } else if (mutantReading !== expectedMutantReading) {
      problems.push(
        `CONTROL FAILED: the oracle answered ${show(mutantReading)} where the mutant's own two shapes read ${show(expectedMutantReading)} — the arms are not the reading this control computes`,
      )
    }

    // ── 3. AND THE REPAIR'S OWN CONTROL VARIABLE IS LOAD-BEARING: the pre-image the defective row printed (`null`, its boot read one
    // ── microtask behind the snapshot) must RED the oracle by name. A comparison whose pre-image can be `null` reports the BOOT's
    // ── movement as the write's, so this arm is the guard against the row drifting back to that shape.
    const unsettledReading = await heldUnmovedAcrossWrite(() => null, () => Promise.resolve(undefined))
    if (unsettledReading === null) {
      problems.push(
        'CONTROL FAILED: a `null` pre-image (an UNSETTLED boot read — the defective row\'s own snapshot) PASSED the oracle, so "unmoved" is graded over nothing',
      )
    } else if (!/pre-image/.test(unsettledReading)) {
      problems.push(`CONTROL FAILED: the \`null\` pre-image was reported as ${show(unsettledReading)} without naming the pre-image`)
    }

    expect(
      problems,
      `§7 (S6) — the held-unmoved oracle reds its mutant (mutant reading: ${show(mutantReading)}) (docs/L1/unit-b-10-stage-display-state.md §7 (S6))`,
    ).toEqual([])
  })
})
