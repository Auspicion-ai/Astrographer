// tests/unit/shell-chrome/display-wire-lockstep.test.ts — unit `B-2` `display-wire`'s LOCKSTEP ROWS, authored
// BEFORE any byte of the change set moves (RCA-1). Every assertion below is READ off
// `docs/L1/unit-b-2-display-wire.md` §5 and the section the arm names.
//
// THE ARMS THIS FILE CARRIES, and the section each one reads:
//   `(d)` §5(d) / §4's two channel constants — **BOTH live in `src/main/store-channels.ts`** (`DISPLAY_READ` =
//         `provident:display:read`, `DISPLAY_CHANGED` = `provident:display:changed`) and **`src/shared/types.ts` is NOT
//         TOUCHED**. Each literal is spelled ONCE under `src/**`, over COMMENT-STRIPPED code (a docblock that quotes a
//         literal is prose, not a second channel), in its declaring module and nowhere else; `main.ts` and `preload.ts`
//         reference the NAMES; `src/renderer/**` reaches neither module and spells neither literal. Plus §4's own
//         consequence: `store-channels.ts`'s export-name census sentence amends **2 → 4** in the same edit (a claim
//         about its own export set may not be left stale) — **and `B-10` §5 RE-STATES that census 4 → 5 in the same
//         edit that adds `DISPLAY_WRITE`**, so this arm is re-grained to FIVE names (the same claim, one more name: each
//         literal spelled once, in its declaring module and nowhere else) — and `src/shared/types.ts` GAINS NOTHING —
//         carried as its own limb, because three flat rows pin that file's md5 (`pd-vendor-manifest` `P-SM-1(d)`,
//         `pd-vendor-set` `P-SM-2`, `pd-ui-1-theme-register`), so the exclusion is a MEASUREMENT and not an omission.
//   `(e)` §5(e) / §4's bridge member, **RE-GRAINED TO UNIT `B-10`'s SUCCESSOR CLAIM** (`docs/L1/unit-b-10-stage-display-state.md`
//         §5) — `ProvidentBridge`'s top-level member set is `PRE_LANDING_MEMBERS` **plus exactly `display`**; the `display`
//         member's declared set is exactly `{read, onChanged, write}`; **exactly ONE sender member, and it is `write`**
//         (`B-2` §4's *"There is NO … sender member"* was the claim this row made WHILE the write route belonged to a later
//         unit; §5 hands it over, so the claim becomes *one sender and it is `write`* rather than "no sender"); `write`'s ONE-LINE
//         signature is the preload's structural twin (`payload: { tabId: string; entry: unknown }` → `Promise<unknown>`); the
//         member indent matches; `onChanged` answers its unsubscribe; and **`read`'s return type is the preload's own
//         STRUCTURAL TWIN, `Promise<Record<string, unknown> | null>`** (§4's amendment), never an import from the renderer or from
//         `src/main/record-engine/`. **Positive control: the SAME oracle driven over a forged interface — one forged GOOD block it
//         must pass, and three forged offenders it must NAME.**
//   `(f)` §5(f) / §2's last paragraph — the census of `createProfileStore(` CALL sites under `src/**/*.ts` is exactly
//         `['src/main/main.ts']` and the call is BOUND. **Positive control: the same oracle over forged sources — a
//         second call site and an unbound call site are both answered by name.**
//   `(h)` §5(h) / §4's renderer site — `installDisplayCrossing` is TOTAL over every absent bridge (no throw, the
//         declared `subscribed: false` reason, `fill()` never called where no read route exists) and ONE-SHOT over a
//         good one (`fill()` exactly once, ONE registration, ONE re-read per push, the withdrawal releases the ONE
//         listener).
//   `§2` §2's order and site — the queue is built BEFORE the store, the entries before the store too, and the arm
//         lives INSIDE the existing `ipcMain.on(IPC_READY, …)` body (the body that already calls `backend.markReady()`),
//         plus `§5(b1)`'s source-shape half: the push `send` carries NO second argument. **And §2's construction adopts
//         BOTH declaration lists** — `listeners: [...displayDelivery.entries]` AND
//         `constraints: [...displayConstraintDeclarations(() => displayStoreHolder.current)]` — with the holder
//         `const displayStoreHolder: { current: StoreInstance | null } = { current: null }` DECLARED before the call and
//         BOUND after it answers. §2's act (5) states why, and this file quotes the reason rather than re-deriving it:
//         without `display-must-stand` no creation repair runs, the family never stands, and every leaf write is refused
//         for want of a parent. Finally §2's PINNED NAMES (`createDeliveryQueue` with its `DeliveryQueue` members, and
//         the five instances `displayQueue`/`pushDisplayChanged`/`displayDelivery`/`displayStore`/`displayStoreHolder`)
//         are asserted BY NAME, because §5(c) drives the shipped body through them.
//
// **COLOURS DECLARED AT THIS HEAD, so a surprise is a FINDING and not a licence to edit a row:** every arm here is RED
// except `(f)`'s forged-source controls and the `(h)` totality halves that read a LANDED client —
// `src/renderer/display-client.ts` already answers its four absent arms (`B-1` landed it), so a totality arm is
// green-on-arrival by contract and the RED there is `installDisplayCrossing`'s absence alone. A control is
// GREEN-ON-ARRIVAL by design (a control that is red proves nothing about the oracle) EXCEPT `(e)`'s forged-interface
// controls, whose forgery base is the SHIPPED `ProvidentBridge` block and therefore needs `display` to have landed: at a
// head without it they red by name on the base miss (`e·control-base`), which is a reading of the shipped block and not a
// broken oracle.
//
// **WHAT IS DELIBERATELY NOT HERE:** nothing is driven through a real store (arms `(a)`/`(b)`/`(c)`) — that is
// `tests/integration/record-engine/{display-crossing,pre-window-hold}.test.ts`; the build's external is
// `tests/integration/record-engine/build-external.test.ts`; the `deps-adopt` limb `E` re-graining is that file's own.
// Nothing here paints: `B-3` owns the channel that paints and `B-10` the capture sites, so **no row in this file mounts,
// paints, writes a DOM node or touches `state-slice`** (D-8, `RR-F1`).
//
// **REACHABILITY RULE:** `src/main/preload.ts` imports `electron` at module scope and is NOT loadable in the node realm,
// and `src/main/main.ts` runs `app.whenReady()` — so **this file never imports `src/main/main.ts` at all** and reads
// `preload.ts`'s bytes with `node:fs`. Modules whose MEMBERS this unit adds are reached through a namespace probe
// (`readExport`/`readFn`) or a `try`-wrapped dynamic `import()`, so a missing export, member, constant or marker region
// is a NAMED PROBLEM inside the row that needs it — never an ESM link error that kills the file, and never a skip.
//
// **NO `vi.mock`, no network, no Electron spawn, no `git`, and no write outside a `mkdtempSync` directory.**
//
// THE `read` TYPE AMBIGUITY `B-2`'s FIRST pass REPORTED IS NOW RESOLVED BY §4's AMENDMENT, and the row is re-grained to
// it rather than left on the lowest common denominator: the preload's `read` answers its OWN STRUCTURAL TWIN,
// `Promise<Record<string, unknown> | null>` — never an import from the renderer or from `src/main/record-engine/` (the
// `SecurityWriteReceipt` precedent, and `ASM-B2-1`'s reason). The row now pins that spelling, and its control proves a
// `Promise<DisplayReading | null>` forgery REDS, so the pin discriminates instead of tolerating both readings.
//
// LAYER (D-10, RCA-12): `[T]`/ENVELOPE. Text oracles over this repo's own `src/**` bytes, plus the REAL landed modules
// (`store-channels`, `display-client`, `renderer`) driven in the node realm. No paint, no DOM subject, no assembled app.
import { describe, expect, it } from 'vitest'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// A LANDED module (`B-1`), namespace-imported so a member this unit adds answers `undefined` instead of failing the link.
import * as storeChannelsModule from '../../../src/main/store-channels.js'
// A LANDED module (`B-1`): the client whose four absent arms `(h)` reads, and the oracle's own baseline instrument.
import * as displayClientModule from '../../../src/renderer/display-client.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..')
const SRC = join(ROOT, 'src')
const MAIN_PATH = join(SRC, 'main', 'main.ts')
const PRELOAD_PATH = join(SRC, 'main', 'preload.ts')
const STORE_CHANNELS_PATH = join(SRC, 'main', 'store-channels.ts')
const TYPES_PATH = join(SRC, 'shared', 'types.ts')

// ─── THE CONTRACT'S OWN PINS (§4/§5) — spelled here because this file is not `src/**`: carrying a pinned literal in a
// ─── row is the READING of the contract, never a second channel.
/** §4: the read is a REQUEST (`invoke`/`handle`) and its constant is `store-channels.ts`'s — BOTH constants live there
 *  once §4's amendment lands, and `src/shared/types.ts` is NOT TOUCHED (its md5-pinned rows are the reason, measured by
 *  the `d·types` limb). */
const READ_CHANNEL = { name: 'DISPLAY_READ', literal: 'provident:display:read', declaringModule: 'src/main/store-channels.ts' } as const
/** §4: the push is a SIGNAL (`send`/`on`) and its constant is `store-channels.ts`'s — the F-8 single source. */
const PUSH_CHANNEL = { name: 'DISPLAY_CHANGED', literal: 'provident:display:changed', declaringModule: 'src/main/store-channels.ts' } as const
/** **RE-GRAINED BY UNIT `B-10` `stage-display-state` §5** (`docs/L1/unit-b-10-stage-display-state.md`, taken under §9 `O-1`): the
 *  write is a REQUEST of its own and its constant lives in the SAME declaring module — one job per mechanism, and the literal is
 *  spelled exactly once. The claim is the SAME claim for one more name (each literal spelled once, in its declaring module and
 *  nowhere else), never a widened one. */
const WRITE_CHANNEL = { name: 'DISPLAY_WRITE', literal: 'provident:display:write', declaringModule: 'src/main/store-channels.ts' } as const
const CHANNEL_SPELLINGS = [READ_CHANNEL, PUSH_CHANNEL, WRITE_CHANNEL] as const
/** §4's export-name census sentence, amended **2 → 4** in the same edit, and **RE-STATED 4 → 5 by `B-10` §5** in the same edit
 *  that adds `DISPLAY_WRITE`: the landed pair, then both of `B-2`'s channel constants, then `B-10`'s one sender. The set is
 *  compared as a SET (order-insensitive), so a reordering is not a finding. */
const STORE_CHANNELS_LANDED = ['STORE_FILE_GET', 'STORE_FILE_PUT'] as const
const STORE_CHANNELS_CENSUS = [...STORE_CHANNELS_LANDED, READ_CHANNEL.name, PUSH_CHANNEL.name, WRITE_CHANNEL.name] as const
/** §4's exclusion, carried as a READING: `src/shared/types.ts` gains NOTHING. Its current digest is not re-spelled here
 *  — it is read off the table `tests/pd-ui-1-theme-register.test.ts` already pins, so a later pass that re-states that
 *  row moves this limb with it instead of leaving a stale literal behind. */
const PD_UI_THEME_REGISTER = join('tests', 'pd-ui-1-theme-register.test.ts')
const TYPES_CARRIER_ROW = /file:\s*'src\/shared\/types\.ts',\s*md5:\s*'([0-9a-f]{32})'/

/** §2/§5(c): the queue's PINNED NAMES (the foundation's, adopted not re-invented). §5(c) drives the shipped body through
 *  them, so the region that carries the queue must declare BOTH — an absent region or a missing factory name FAILS. */
const QUEUE_INTERFACE = 'DeliveryQueue'
const QUEUE_FACTORY = 'createDeliveryQueue'
const QUEUE_MEMBERS = ['arm', 'deliver', 'held'] as const
/** §2's five PINNED INSTANCES, in the order the act list names them. */
const PINNED_INSTANCES = ['pushDisplayChanged', 'displayQueue', 'displayDelivery', 'displayStoreHolder', 'displayStore'] as const
/** §2 act (4): the holder's declaration, spelled as §2 spells it — the `StoreInstance | null` annotation IS the claim
 *  (the holder the constraint bodies read, bound only after the call answers), so the annotation is pinned by NAME and not
 *  merely "some type". `readonly`/newlines are tolerated: §2 pins the declaration, not one line's formatting. */
const HOLDER_DECLARATION =
  /(?:const|let)\s+displayStoreHolder\s*:\s*\{\s*(?:readonly\s+)?current\s*:\s*StoreInstance\s*\|\s*null\s*;?\s*\}\s*=\s*\{\s*current\s*:\s*null\s*\}/
/** §2 act (6): the holder is BOUND only AFTER the construction answers. */
const HOLDER_BINDING = /\bdisplayStoreHolder\.current\s*=/

/** §5(e): **`ProvidentBridge`'s 18 landed top-level members, in the interface's own order.** This list IS the landed
 *  baseline — it is the one figure a row may not derive from the preload, because the preload is the subject the row is
 *  counting. **The counts are DERIVED from it** (`PRE_LANDING_MEMBERS.length`, and `+ 1` for the `display` member): a
 *  spelled `18` or `19` would be a figure that goes stale silently, while a derived one reds the moment this list and
 *  the interface disagree. */
const PRE_LANDING_MEMBERS = [
  'ready',
  'bootSettled',
  'onRequest',
  'sendReply',
  'notify',
  'pushPaneCatalog',
  'onPaneVisibility',
  'onSettingsOpen',
  'security',
  'module',
  'edit',
  'rag',
  'template',
  'operatorSettings',
  'gnosis',
  'sidebar',
  'installSidebar',
  'store',
] as const
/** **§5(e), RE-GRAINED TO `B-10` §5's SUCCESSOR CLAIM**: the `display` member's declared set is EXACTLY these three —
 *  `B-2`'s `{read, onChanged}` PLUS the ONE sender §5 hands this unit — and the set is NEVER widened to "at least". */
const DISPLAY_MEMBERS = ['onChanged', 'read', 'write'] as const
/** **THE SENDER IS `write` AND NOTHING ELSE** (`B-10` §5: *"no `put`/`commit` alias, no second sender"*). `write` left this
 *  list in the same edit that made it lawful; a second spelling of the sender is the fault `FORBIDDEN_SENDERS` still names. */
const FORBIDDEN_SENDERS = ['commit', 'put', 'sender', 'send', 'set', 'writeOnce'] as const
/** **THE ONE SENDER, BY NAME** — `B-10` §5 pins this member and forbids a second. The census below reads it as a COUNT, so a
 *  lawful `write` beside a forged alias reds on "exactly one sender", not only on the alias list. */
const THE_SENDER = 'write' as const
/** §5's pinned `write` declaration, normalised the same way as the other two signatures: ONE LINE, the preload's own twin. */
const WRITE_SIGNATURE = 'write(payload: { tabId: string; entry: unknown }): Promise<unknown>'
/** §4: `ProvidentBridge`'s members are TWO-SPACE top-level; the `display` member's own are FOUR-space. */
const TOP_LEVEL_INDENT = 2
const NESTED_INDENT = 4
/** §5(e)'s pinned `onChanged` signature, normalised (whitespace collapsed, trailing `;` dropped). */
const ONCHANGED_SIGNATURE = 'onChanged(handler: () => void): () => void'
/** §4's amended `read` signature: the preload's OWN STRUCTURAL TWIN, normalised the same way. Spelled as a PIN, not as a
 *  pattern with an escape hatch — a `Promise<DisplayReading | null>` forgery REDS (see the control row). */
const READ_SIGNATURE = 'read(): Promise<Record<string, unknown> | null>'

/** §2/§5(c): **both markers are part of this contract's change set**; an absent region FAILS the arm that needs it. */
const PRE_WINDOW_OPEN = '// ⟦B-2-PRE-WINDOW⟧'
const PRE_WINDOW_CLOSE = '// ⟦/B-2-PRE-WINDOW⟧'

// ─── harness ────────────────────────────────────────────────────────────────────────────────────────────────────────

type AnyFn = (...args: unknown[]) => unknown

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

/** A NAMED reachability probe: an absent member answers `undefined`, never a link error. */
function readExport(mod: unknown, name: string): unknown {
  if (mod === null || (typeof mod !== 'object' && typeof mod !== 'function')) return undefined
  try {
    return (mod as Record<string, unknown>)[name]
  } catch {
    return undefined
  }
}

function readFn(mod: unknown, name: string): AnyFn | null {
  const value = readExport(mod, name)
  return typeof value === 'function' ? (value as AnyFn) : null
}

/** THE COLLECTOR: a sub-limb returns the problem TEXT when its reading is not clean and `null` when it is; a throw
 *  before the reading completes is itself a named problem, so a limb never dies silently. One aggregate assertion per
 *  `it` — `expect(problems, …).toEqual([])`. */
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

/** **COMMENTS STRIPPED, WITH AN ORIGIN MAP.** `origin[i]` is the index in `text` of `code[i]`, so a claim read off the
 *  code can be compared with a claim read off the RAW bytes (the two pre-window markers live in comments, so they exist
 *  only in raw space while every call site exists only in code space). Line comments keep their newline; a block
 *  comment's interior newlines go with it, which is what keeps the following line's INDENT intact for the census. */
function stripComments(text: string): { code: string; origin: number[] } {
  const code: string[] = []
  const origin: number[] = []
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
      code.push(char)
      origin.push(i)
      i += 1
      while (i < text.length) {
        const inner = text[i] as string
        code.push(inner)
        origin.push(i)
        if (inner === '\\') {
          const escaped = text[i + 1]
          if (escaped !== undefined) {
            code.push(escaped)
            origin.push(i + 1)
          }
          i += 2
          continue
        }
        i += 1
        if (inner === quote) break
      }
      continue
    }
    code.push(char)
    origin.push(i)
    i += 1
  }
  return { code: code.join(''), origin }
}

const codeOnly = (text: string): string => stripComments(text).code

/** How many times `needle` occurs in `haystack` — an occurrence count, never a `includes`. */
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

/** The inner text of the balanced `{ … }` whose `{` is at `openAt`, or `null` when it never closes. */
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

/** The ARGUMENTS of the call whose `(` is at `openAt`, split at top-level commas (nested calls and objects stay whole). */
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

/** Walk `src/**` for `.ts` files, deepest-last, and answer them in a STABLE order (sorted repo-relative paths). */
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

/** The top-level member names of an interface body: the names declared at EXACTLY `indent` spaces, in the body's order. */
function memberNames(body: string, indent: number): string[] {
  const names: string[] = []
  const pattern = new RegExp(`^ {${indent}}([A-Za-z_$][A-Za-z0-9_$]*)\\s*[(:?]`, 'gm')
  for (const match of body.matchAll(pattern)) names.push(match[1] as string)
  return names
}

/** The RAW text of one member's declaration line (before the first `:`/`(` of its signature), trimmed — used for the
 *  signature and indent readings. */
function memberLine(body: string, name: string): string | null {
  const pattern = new RegExp(`^ *${name}\\s*[(:?].*$`, 'm')
  const match = pattern.exec(body)
  return match === null ? null : match[0]
}

const normaliseSignature = (line: string): string => line.replace(/\s+/g, ' ').trim().replace(/;$/, '')

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(d)` — EACH CHANNEL NAME IS SPELLED ONCE (§5(d), §4's two constants)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('display-wire · arm (d) — the two channel constants, each spelled ONCE (§5(d), §4)', () => {
  it('(d) · EACH LITERAL OCCURS EXACTLY ONCE IN COMMENT-STRIPPED `src/**` CODE, IN `src/main/store-channels.ts` AND NOWHERE ELSE (§5(d), §4)', () => {
    const problems: string[] = []
    const sources = walkSources(SRC)
    expect(
      sources.length,
      'the `src/**` walk found source files, or an empty walk answers "spelled once, nowhere else" for free',
    ).toBeGreaterThan(0)
    const texts = new Map<string, string>(sources.map((file) => [file, readPath(file)]))

    for (const channel of CHANNEL_SPELLINGS) {
      attempt(problems, `d·${channel.name}`, () => {
        const msgs: string[] = []
        const hits: Array<{ file: string; count: number }> = []
        for (const [file, raw] of texts) {
          // CODE ONLY: a docblock that QUOTES a channel literal is prose, not a second channel (the `menu-opener` `d4`
          // precedent — §5(d) is about spelling, and a comment spells nothing the runtime can reach).
          const count = occurrences(codeOnly(raw), channel.literal)
          if (count > 0) hits.push({ file: relPath(file), count })
        }
        const total = hits.reduce((sum, hit) => sum + hit.count, 0)
        if (total === 0) {
          msgs.push(
            `the literal ${show(channel.literal)} occurs in NO \`src/**\` file — §4 requires \`export const ${channel.name} = '${channel.literal}'\` in \`${channel.declaringModule}\`, so this constant has no subject at all`,
          )
          return msgs.join('; ')
        }
        if (total !== 1) {
          msgs.push(
            `the literal ${show(channel.literal)} is spelled ${total} time(s) across ${hits.map((h) => `${h.file} (${h.count})`).join(', ')} — §5(d) pins EXACTLY ONE occurrence, in its declaring module alone (a second spelling is a second channel)`,
          )
        }
        if (hits.length === 1 && hits[0]!.file !== channel.declaringModule) {
          msgs.push(
            `the literal ${show(channel.literal)} lives in ${hits[0]!.file}; §4 declares \`${channel.name}\` in \`${channel.declaringModule}\` (both constants live in the F-8 single source now, and \`src/shared/types.ts\` is NOT touched)`,
          )
        }
        const declaration = new RegExp(`export const ${channel.name}\\b`)
        const declaringFile = texts.get(join(ROOT, channel.declaringModule))
        if (declaringFile === undefined) {
          msgs.push(`\`${channel.declaringModule}\` could not be read — the constant's declared site has no substrate`)
        } else if (!declaration.test(codeOnly(declaringFile))) {
          msgs.push(`\`${channel.declaringModule}\` carries no \`export const ${channel.name}\` — §4 pins the constant by that NAME at that site`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    // AND THE NAME→VALUE IDENTITY, read at RUNTIME off the landed module: each constant IS its literal, which is what
    // "one spelling" buys a consumer that imports the NAME (a re-spelled local would answer a different string here).
    // BOTH constants are read from the SAME module, because §4's amendment moved both into `store-channels.ts`.
    for (const channel of CHANNEL_SPELLINGS) {
      attempt(problems, `d·identity·${channel.name}`, () => {
        const answer = readExport(storeChannelsModule, channel.name)
        if (typeof answer !== 'string') {
          return `\`${channel.declaringModule}\` exports no \`${channel.name}\` string (read ${show(answer)}) — §4's constant has no runtime value`
        }
        return answer === channel.literal
          ? null
          : `\`${channel.name}\` answers ${show(answer)} while §4 pins ${show(channel.literal)}`
      })
    }

    expect(
      problems,
      '§5(d) — each channel name is spelled ONCE (docs/L1/unit-b-2-display-wire.md §5(d), §4)',
    ).toEqual([])
  })

  it('(d) · THE CENSUS IS EXACT AND THE CONSUMERS USE THE NAMES — `store-channels` exports its two landed names plus the THREE channel constants (RE-STATED 4 → 5 by `B-10` §5), `main.ts`/`preload.ts` reference the NAMES, `src/renderer/**` reaches neither module, and `src/shared/types.ts` gains NOTHING (§5(d), §4)', () => {
    const problems: string[] = []

    attempt(problems, 'd·export-set', () => {
      const raw = readPath(STORE_CHANNELS_PATH)
      const declared = [...codeOnly(raw).matchAll(/^export const ([A-Za-z_$][A-Za-z0-9_$]*)/gm)].map((m) => m[1] as string)
      const expected = [...STORE_CHANNELS_CENSUS]
      const msgs: string[] = []
      if (declared.length === 0) {
        msgs.push('`src/main/store-channels.ts` declares no `export const` at all — the export-set census has no subject')
        return msgs.join('; ')
      }
      const missing = expected.filter((name) => !declared.includes(name))
      const spurious = declared.filter((name) => !expected.includes(name))
      if (missing.length > 0) {
        msgs.push(
          `the module does not export [${missing.join(', ')}] — §4 amends its export-name census sentence 2 → 4 (a claim about its own export set may not be left stale) and \`B-10\` §5 RE-STATES it 4 → 5 in the same edit that adds \`${WRITE_CHANNEL.name}\`, so the set is exactly [${expected.join(', ')}]`,
        )
      }
      if (spurious.length > 0) {
        msgs.push(
          `the module exports [${spurious.join(', ')}], which §4's amended census does not admit — the set is EXACTLY [${expected.join(', ')}]`,
        )
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    attempt(problems, 'd·consumers', () => {
      const msgs: string[] = []
      for (const [label, path] of [
        ['`src/main/main.ts`', MAIN_PATH],
        ['`src/main/preload.ts`', PRELOAD_PATH],
      ] as const) {
        const code = codeOnly(readPath(path))
        for (const channel of CHANNEL_SPELLINGS) {
          if (occurrences(code, channel.name) === 0) {
            msgs.push(
              `${label} never references the NAME \`${channel.name}\` — §4 has both constants IMPORTED by \`main.ts\` and \`preload.ts\` and re-spelled by neither`,
            )
          }
        }
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    attempt(problems, 'd·renderer-purity', () => {
      const msgs: string[] = []
      const rendererFiles = walkSources(join(SRC, 'renderer'))
      expect(rendererFiles.length, 'the renderer walk found files, or the purity arm is vacuous').toBeGreaterThan(0)
      for (const file of rendererFiles) {
        const code = codeOnly(readPath(file))
        if (/store-channels/.test(code)) {
          msgs.push(
            `${relPath(file)} references \`store-channels\` — §4's F-8 rule has \`src/renderer/**\` reach the channel through the bridge MEMBER, never through the constants module`,
          )
        }
        for (const channel of CHANNEL_SPELLINGS) {
          if (occurrences(code, channel.literal) > 0) {
            msgs.push(
              `${relPath(file)} spells ${show(channel.literal)} — §5(d) pins the literal to its declaring module; the renderer reads the bridge member and never a channel name`,
            )
          }
        }
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // ── §4's OWN CONSEQUENCE, MEASURED: the module's docblock census sentence ("CENSUS: 2 names") is amended in the SAME
    // ── edit — a claim about its own export set may not be left stale, and the way to read that is to compare the
    // ── sentence's figure with the set it describes. Read as a FIGURE, not a re-spelling: `CENSUS: <n> name(s)`.
    attempt(problems, 'd·docblock-census', () => {
      const raw = readPath(STORE_CHANNELS_PATH)
      const declared = [...codeOnly(raw).matchAll(/^export const ([A-Za-z_$][A-Za-z0-9_$]*)/gm)].length
      // The docblock WRAPS ("CENSUS: 2\n// names"), so the prose is flattened before the sentence is read — a wrapped
      // sentence is the same claim, and reading it line-by-line would red a correct module for its line length.
      const prose = raw.replace(/^\s*\/\/\s?/gm, ' ').replace(/\s+/g, ' ')
      const sentence = /CENSUS:\s*(\d+)\s+names?/i.exec(prose)
      if (sentence === null) {
        return `\`src/main/store-channels.ts\` carries no \`CENSUS: <n> name(s)\` sentence in its docblock — §4 quotes that sentence and requires it amended to FOUR in the same edit as the constants, so the module's own claim about its export set must still be readable`
      }
      const figure = Number(sentence[1])
      return figure === declared
        ? null
        : `the docblock states \`CENSUS: ${figure} names\` while the module declares ${declared} \`export const\`s — §4 amends that sentence 2 → 4 in the SAME edit (the landed pair plus \`${READ_CHANNEL.name}\` and \`${PUSH_CHANNEL.name}\`), and a stale figure is the claim §4 forbids leaving behind`
    })

    // ── §4's EXCLUSION, MEASURED (§5(d) reads it here): `src/shared/types.ts` GAINS NOTHING. A limb, not an omission:
    // ── three flat rows pin that file's md5, so a display constant admitted there would buy a digest re-statement this
    // ── unit's write scope does not hold. The digest below is READ OFF the pd table, never re-spelled, so a pass that
    // ── legitimately re-states that row moves this limb with it.
    attempt(problems, 'd·types', () => {
      const typesCode = codeOnly(readPath(TYPES_PATH))
      const msgs: string[] = []
      for (const channel of CHANNEL_SPELLINGS) {
        if (occurrences(typesCode, channel.literal) > 0) {
          msgs.push(
            `\`src/shared/types.ts\` spells ${show(channel.literal)} — §4 REFUSED that home (the three md5-pinned rows: \`pd-vendor-manifest\` \`P-SM-1(d)\`, \`pd-vendor-set\` \`P-SM-2\`, \`pd-ui-1-theme-register\`) and declares \`${channel.name}\` in \`${channel.declaringModule}\``,
          )
        }
        if (new RegExp(`\\b${channel.name}\\b`).test(typesCode)) {
          msgs.push(
            `\`src/shared/types.ts\` names \`${channel.name}\` — §4: shared/types.ts is NOT TOUCHED by this unit, so neither the constant nor a re-export of it may appear there`,
          )
        }
      }
      const carrierTable = readPath(join(ROOT, PD_UI_THEME_REGISTER))
      const pinned = TYPES_CARRIER_ROW.exec(carrierTable)
      if (pinned === null) {
        msgs.push(
          `the carrier table in \`${PD_UI_THEME_REGISTER}\` no longer carries a \`{ file: 'src/shared/types.ts', md5: '…' }\` row — the "types.ts gains nothing" limb has no pinned digest to measure against`,
        )
      } else {
        const measured = createHash('md5').update(readFileSync(TYPES_PATH)).digest('hex')
        if (measured !== pinned[1]) {
          msgs.push(
            `\`src/shared/types.ts\` hashes to ${show(measured)} while \`${PD_UI_THEME_REGISTER}\` pins ${show(pinned[1])} — §4: the file is NOT TOUCHED, and a byte move here reds three flat rows this unit's write scope does not hold`,
          )
        }
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§5(d)/§4 — the exact channel census, the two consumers, the renderer’s purity, and types.ts’ exclusion (docs/L1/unit-b-2-display-wire.md §4/§5(d))',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(e)` — THE BRIDGE CENSUS IS EXACT (§5(e), §4's `display` member)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** THE ORACLE. Driven over the SHIPPED interface block by the census row and over a FORGED block by the control row —
 *  one function, two subjects, which is what makes the control a control and not a second implementation. It answers
 *  the list of problems it found (empty ⇒ clean), and it never throws on a malformed block: a block it cannot read is
 *  itself a named problem. */
function bridgeCensusProblems(body: string): string[] {
  const problems: string[] = []
  const members = memberNames(body, TOP_LEVEL_INDENT)
  if (members.length === 0) {
    problems.push('the `ProvidentBridge` block declares no two-space top-level member — the census has no subject')
    return problems
  }
  // ── (1) the landed baseline is still whole, and still in its own order: the 18 names are a SUBSEQUENCE of the
  // ── members read, so `display` may be inserted anywhere and a reordered or deleted landed member reds.
  const landedInOrder = members.filter((name) => (PRE_LANDING_MEMBERS as readonly string[]).includes(name))
  const missing = PRE_LANDING_MEMBERS.filter((name) => !members.includes(name))
  if (missing.length > 0) {
    problems.push(
      `the interface lost [${missing.join(', ')}] — §5(e) derives this unit's set as the ${PRE_LANDING_MEMBERS.length} landed names PLUS exactly \`display\`, so no landed member may move`,
    )
  }
  if (landedInOrder.join(',') !== [...PRE_LANDING_MEMBERS].join(',')) {
    problems.push(
      `the landed members read [${landedInOrder.join(', ')}] but landed in [${[...PRE_LANDING_MEMBERS].join(', ')}] — §5(e)'s census is over the interface's own order, and a re-ordering is a second edit nobody asked for`,
    )
  }
  // ── (2) exactly ONE new member, and it is `display`.
  const additions = members.filter((name) => !(PRE_LANDING_MEMBERS as readonly string[]).includes(name))
  if (!additions.includes('display')) {
    problems.push(
      `the interface declares NO \`display\` member (additions read ${show(additions)}) — §4/§5(e) pin ONE new top-level key, \`display\`, whose members are exactly {${DISPLAY_MEMBERS.join(', ')}}`,
    )
  }
  const spurious = additions.filter((name) => name !== 'display')
  if (spurious.length > 0) {
    problems.push(
      `the interface gained [${spurious.join(', ')}] beyond \`display\` — §5(e) pins the set as the ${PRE_LANDING_MEMBERS.length} landed names plus EXACTLY one, so the count is ${PRE_LANDING_MEMBERS.length + 1} and nothing else`,
    )
  }
  if (members.length !== PRE_LANDING_MEMBERS.length + 1) {
    problems.push(
      `the interface answers ${members.length} top-level member(s); §5(e) derives ${PRE_LANDING_MEMBERS.length} + 1 = ${PRE_LANDING_MEMBERS.length + 1} from the landed baseline`,
    )
  }
  // ── (3) the `display` member's own block: indent, set, signature, and NO sender.
  const displayLine = new RegExp(`^( {${TOP_LEVEL_INDENT}})display\\s*:`, 'm').exec(body)
  if (displayLine === null) {
    // A `display` member with no readable declaration line is itself a problem — and it must not be a SILENT PASS over
    // the block that follows it (which is how the `commit` control was first swallowed).
    if (members.includes('display')) {
      problems.push(
        `\`display\` is a top-level member but its declaration line does not read as a ${TOP_LEVEL_INDENT}-space \`display: { … }\` — §4/§5 pin an OBJECT body whose members are exactly {${DISPLAY_MEMBERS.join(', ')}}`,
      )
    }
  }
  if (displayLine !== null) {
    const colon = body.indexOf(':', displayLine.index + displayLine[0].length - 1)
    const open = colon < 0 ? -1 : body.indexOf('{', colon)
    const inner = open < 0 ? null : bracedBlock(body, open)
    if (inner === null) {
      problems.push(
        `the \`display\` member carries no balanced object body — §4/\`B-10\` §5 pin an OBJECT with exactly [${[...DISPLAY_MEMBERS].join(', ')}], not a function or an alias`,
      )
    } else {
      const declared = memberNames(inner, NESTED_INDENT)
      const expected = [...DISPLAY_MEMBERS].sort()
      const read = [...declared].sort()
      if (read.join(',') !== expected.join(',')) {
        problems.push(
          `the \`display\` member declares [${declared.join(', ')}] — §4/§5(e) pin EXACTLY [${[...DISPLAY_MEMBERS].join(', ')}], so a missing or extra member is a different crossing`,
        )
      }
      const aliases = declared.filter((name) => (FORBIDDEN_SENDERS as readonly string[]).includes(name))
      if (aliases.length > 0) {
        problems.push(
          `the \`display\` member declares sender ALIAS(es) [${aliases.join(', ')}] — \`B-10\` §5 hands this crossing exactly ONE sender member, \`${THE_SENDER}\`, and adds no \`put\`/\`commit\` alias and no second sender (one mechanism, one job: the write route is a REQUEST, and this key is a subscriber on one side, a read and a sender on the other)`,
        )
      }
      // **THE SUCCESSOR CLAIM, READ AS A COUNT**: exactly ONE sender member, and it is `write`. `B-2`'s row said "no sender";
      // §5 hands this unit the sender, so the row says "exactly one, and it is `write`" — a set that gained a second writer
      // anywhere reds here even when every name in it is spelled lawfully.
      const senders = declared.filter((name) => (DISPLAY_MEMBERS as readonly string[]).includes(name) && name !== 'read' && name !== 'onChanged')
      if (senders.length !== 1 || senders[0] !== THE_SENDER) {
        problems.push(
          `the \`display\` member carries [${senders.join(', ') || 'no'}] sender member(s) where \`B-10\` §5 pins EXACTLY ONE and it is \`${THE_SENDER}\` — the successor of \`B-2\`'s "There is NO sender member" row, and a row that drifted back to zero senders would leave the capture with no write route at all`,
        )
      }
      // AND THE SENDER'S OWN SIGNATURE: ONE line, the preload's structural twin (never an import, `ASM-B2-1` unchanged).
      const writeLine = memberLine(inner, THE_SENDER)
      if (writeLine !== null) {
        const normalisedWrite = normaliseSignature(writeLine)
        if (normalisedWrite !== WRITE_SIGNATURE) {
          problems.push(
            `\`${THE_SENDER}\` reads ${show(normalisedWrite)}; \`B-10\` §5 pins ${show(WRITE_SIGNATURE)} — declared on ONE LINE as the preload's own STRUCTURAL TWIN of the record's \`DisplayWriteAnswer\` (\`ASM-B2-1\`'s rule, unchanged: a \`Record<string, unknown>\`-shaped answer, never an import)`,
          )
        }
      }
      const line = memberLine(body, 'display')
      if (line !== null && !new RegExp(`^ {${TOP_LEVEL_INDENT}}display\\s*:`).test(line)) {
        problems.push(
          `\`display\` is declared as ${show(line.trim())} — §4 pins a ${TOP_LEVEL_INDENT}-space TOP-LEVEL \`ProvidentBridge\` key, the \`store\`/\`security\` indent`,
        )
      }
      const onChangeLine = memberLine(inner, 'onChanged')
      if (onChangeLine === null) {
        problems.push('the `display` member declares no `onChanged` — §4 pins the subscriber as `onChanged(handler)`, never a sender')
      } else {
        if (!new RegExp(`^ {${NESTED_INDENT}}onChanged`).test(onChangeLine)) {
          problems.push(
            `\`onChanged\` is declared at ${show(onChangeLine.length - onChangeLine.trimStart().length)} space(s); §5(e) pins the ${NESTED_INDENT}-space NESTED indent`,
          )
        }
        const normalised = normaliseSignature(onChangeLine)
        if (normalised !== ONCHANGED_SIGNATURE) {
          problems.push(
            `\`onChanged\` reads ${show(normalised)}; §5(e) pins the return type ${show(ONCHANGED_SIGNATURE)} — an UNSUBSCRIBE, never \`void\``,
          )
        }
      }
      const readLine = memberLine(inner, 'read')
      if (readLine === null) {
        problems.push(`the \`display\` member declares no \`read\` — §4 pins \`${READ_CHANNEL.name}\` behind it`)
      } else {
        const normalised = normaliseSignature(readLine)
        // §4's AMENDMENT pins the return type as the preload's OWN STRUCTURAL TWIN — `Promise<Record<string, unknown> |
        // null>` — and refuses both an import from the renderer and one from `src/main/record-engine/`. A pin, not a
        // haystack: the control row forges a `Promise<DisplayReading | null>` member and this same reading must red it.
        if (normalised !== READ_SIGNATURE) {
          problems.push(
            `\`read\` reads ${show(normalised)}; §4 pins ${show(READ_SIGNATURE)} — the preload's own STRUCTURAL TWIN of the record's reading (never an import from the renderer or from \`src/main/record-engine/\`, the \`SecurityWriteReceipt\` precedent), with ZERO parameters`,
          )
        }
      }
    }
  }
  return problems
}

/** The SHIPPED nested object literal under `const bridge: ProvidentBridge = {` — the census's second half, so an
 *  interface that is not implemented cannot pass as a bridge. `null` when the const does not resolve. */
function bridgeImplementationBody(raw: string): string | null {
  const code = codeOnly(raw)
  const at = code.indexOf('const bridge: ProvidentBridge = ')
  if (at < 0) return null
  const open = code.indexOf('{', at)
  return open < 0 ? null : bracedBlock(code, open)
}

/** **§5(e)'s CONTROL BASE: the shipped block with THIS unit's own `display` member DELETED**, so a forgery is built over
 *  the LANDED baseline (the 18 names) and the member it adds really is the ONLY addition. Without this base the control's
 *  subject is 18 landed + the shipped `display` + the forged `display` = 20 members, and the census reds on the COUNT
 *  rather than on the forged offender — i.e. the control measures the shipped file instead of its own forgery, so a
 *  forgery that adds nothing still "reds" and the control proves nothing. `null` when the block carries no readable
 *  one-line `display: { … }` member to remove (the control then has no base, and says so by name). */
function blockWithoutMember(body: string, name: string): string | null {
  const decl = new RegExp(`^ {${TOP_LEVEL_INDENT}}${name}\\s*:`, 'm').exec(body)
  if (decl === null) return null
  const colon = decl.index + decl[0].length - 1
  const open = body.indexOf('{', colon)
  const inner = open < 0 ? null : bracedBlock(body, open)
  // an OBJECT body only (`display: { … }`): a bare `display(): void` line would end at its own newline instead.
  if (inner === null || body.slice(colon + 1, open).trim().length > 0) return null
  const end = open + inner.length + 2 // just past the member's own closing `}`
  return `${body.slice(0, decl.index)}${body.slice(end)}`
}

describe('display-wire · arm (e) — the bridge census is EXACT (§5(e), §4)', () => {
  it('(e) · `ProvidentBridge` = its LANDED member list PLUS exactly `display`, whose own set is exactly {read, onChanged, write} with EXACTLY ONE sender and it is `write` (§5(e), re-grained to `B-10` §5)', () => {
    const problems: string[] = []
    const raw = readPath(PRELOAD_PATH)
    const code = codeOnly(raw)

    attempt(problems, 'e·site', () => {
      const at = code.indexOf('export interface ProvidentBridge {')
      if (at < 0) {
        return '`src/main/preload.ts` declares no `export interface ProvidentBridge {` — §4/§5(e)\'s member has no site to be counted on'
      }
      const open = code.indexOf('{', at)
      const inner = open < 0 ? null : bracedBlock(code, open)
      if (inner === null) return 'the `ProvidentBridge` interface block never closes — the text oracle cannot read its members'
      const found = bridgeCensusProblems(inner)
      return found.length > 0 ? found.join('; ') : null
    })

    attempt(problems, 'e·implementation', () => {
      const impl = bridgeImplementationBody(raw)
      if (impl === null) {
        return 'no `const bridge: ProvidentBridge = { … }` object literal resolves in `src/main/preload.ts` — the declared member has no implementation to be exposed through `contextBridge`'
      }
      const keys = memberNames(impl, TOP_LEVEL_INDENT)
      if (!keys.includes('display')) {
        return `the exposed bridge literal carries [${keys.join(', ')}] and no \`display\` KEY — §4's member must be real on \`window.provident\`, not declared only in the interface`
      }
      return null
    })

    // ── §4's AMENDMENT, SECOND HALF: the twin is the preload's OWN, so the preload imports NO display shape from either
    // ── realm it must not reach. Read as specifiers, so the reading names what was imported instead of guessing at a type.
    attempt(problems, 'e·no-foreign-type', () => {
      const msgs: string[] = []
      const specifiers = [...code.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g)].map((match) => match[1] as string)
      for (const specifier of specifiers) {
        if (/\/renderer(\/|$)/.test(specifier) || /^\.\.\/renderer/.test(specifier)) {
          msgs.push(
            `\`src/main/preload.ts\` imports ${show(specifier)} — §4 refuses a preload→renderer type import (it inverts the realm boundary); the preload declares its own STRUCTURAL TWIN of the reading instead`,
          )
        }
        if (/record-engine/.test(specifier)) {
          msgs.push(
            `\`src/main/preload.ts\` imports ${show(specifier)} — §4 refuses an import from \`src/main/record-engine/\` too; \`ASM-B2-1\` takes the structural twin precisely so no second authority on the entry shape is admitted`,
          )
        }
      }
      if (/\bDisplayReading\b/.test(code)) {
        msgs.push(
          '`src/main/preload.ts` names `DisplayReading` — that is the renderer realm’s type; §4 pins the preload’s `read` to its own `Promise<Record<string, unknown> | null>`',
        )
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§5(e) — the bridge census (docs/L1/unit-b-2-display-wire.md §5(e), §4; the counts are DERIVED from the landed list, never spelled)',
    ).toEqual([])
  })

  it('(e) · POSITIVE CONTROL — the SAME oracle passes a forged GOOD interface and NAMES each forged offender, so a green is not a vacuous oracle (§5(e))', () => {
    const problems: string[] = []
    const raw = readPath(PRELOAD_PATH)
    const code = codeOnly(raw)
    const at = code.indexOf('export interface ProvidentBridge {')
    const open = at < 0 ? -1 : code.indexOf('{', at)
    const shipped = open < 0 ? null : bracedBlock(code, open)

    expect(
      shipped,
      'the shipped `ProvidentBridge` block must resolve before a forged block can be derived from it — the control has no base',
    ).not.toBeNull()

    /** **THE FORGERY'S BASE IS THE LANDED BLOCK, NOT THE SHIPPED ONE.** Once `display` has landed the shipped preload
     *  CARRIES it, so forging on top of it would answer 20 top-level members and red on the COUNT before any forged
     *  offender was ever reached. The base removes that member, and the limb below MEASURES that removal, so the control's
     *  subject is the 18-name baseline and its claim is exactly "an extra top-level member reds the census"; at a head
     *  where the member has NOT landed there is nothing to remove and `e·control-base` names that miss. */
    const base = shipped === null ? '' : (blockWithoutMember(shipped, 'display') ?? '')

    attempt(problems, 'e·control-base', () => {
      if (shipped === null) {
        return 'CONTROL FAILED: the shipped `ProvidentBridge` block never resolved, so no LANDED baseline could be forged over'
      }
      if (base.length === 0) {
        return `CONTROL FAILED: the shipped block carries no readable ${TOP_LEVEL_INDENT}-space \`display: { … }\` member to remove, so the control cannot forge over the ${PRE_LANDING_MEMBERS.length}-name LANDED baseline`
      }
      const names = memberNames(base, TOP_LEVEL_INDENT)
      if (names.includes('display')) {
        return 'CONTROL FAILED: the control base still declares `display` — the forgery would carry it twice, which is the wrong subject again'
      }
      if (names.length !== PRE_LANDING_MEMBERS.length) {
        return `CONTROL FAILED: the control base answers ${names.length} top-level member(s) once \`display\` is removed, while §5(e)'s LANDED baseline is ${PRE_LANDING_MEMBERS.length} — the forgery would be built over a subject that is not the baseline`
      }
      return null
    })

    /** The forged `display` member, spelled at the contract's own indent and with the contract's own TWIN in `read`'s
     *  return position. It is INSERTED into the LANDED base so the control runs the oracle over this repo's real member
     *  list with one synthetic addition. */
    const forgedDisplay = [
      '',
      `${' '.repeat(TOP_LEVEL_INDENT)}display: {`,
      `${' '.repeat(NESTED_INDENT)}read(): Promise<Record<string, unknown> | null>`,
      `${' '.repeat(NESTED_INDENT)}onChanged(handler: () => void): () => void`,
      // RE-GRAINED: the forged GOOD block carries `B-10` §5's ONE sender, or the control would red a correct implementation.
      `${' '.repeat(NESTED_INDENT)}${WRITE_SIGNATURE}`,
      `${' '.repeat(TOP_LEVEL_INDENT)}}`,
    ].join('\n')
    const forgedGood = `${base}\n${forgedDisplay}\n`

    attempt(problems, 'e·control-good', () => {
      const found = bridgeCensusProblems(forgedGood)
      return found.length === 0
        ? null
        : `CONTROL FAILED: a forged interface carrying the ${PRE_LANDING_MEMBERS.length} landed names plus a WELL-FORMED \`display\` member (the declared TWIN return type) was still reported as [${found.join('; ')}] — the oracle cannot pass any input, so the shipped red is not a reading of the shipped block`
    })

    // THE RE-GRAINED ARM'S OWN FALSIFIER: a forged `read` that answers the RENDERER's type instead of the preload's twin
    // must be NAMED. Without it the tightened pin would be indistinguishable from the loose pattern it replaced.
    attempt(problems, 'e·control-read-not-twin', () => {
      const forged = `${base}\n${[
        '',
        `${' '.repeat(TOP_LEVEL_INDENT)}display: {`,
        `${' '.repeat(NESTED_INDENT)}read(): Promise<DisplayReading | null>`,
        `${' '.repeat(NESTED_INDENT)}onChanged(handler: () => void): () => void`,
        `${' '.repeat(NESTED_INDENT)}${WRITE_SIGNATURE}`,
        `${' '.repeat(TOP_LEVEL_INDENT)}}`,
      ].join('\n')}\n`
      const found = bridgeCensusProblems(forged)
      if (found.length === 0) {
        return 'CONTROL FAILED: a forged `read(): Promise<DisplayReading | null>` (the RENDERER’s type, not the preload’s twin) passed the census silently — §4’s amended return-type arm does not discriminate'
      }
      return /\bread\b/.test(found.join(' ')) && /Record<string, unknown>/.test(found.join(' '))
        ? null
        : `CONTROL FAILED: the census reported [${found.join('; ')}] without naming \`read\` and the pinned twin`
    })

    attempt(problems, 'e·control-extra-member', () => {
      const forged = `${forgedGood}\n${' '.repeat(TOP_LEVEL_INDENT)}displayExtra(): void\n`
      const found = bridgeCensusProblems(forged)
      if (found.length === 0) {
        return 'CONTROL FAILED: a forged EXTRA top-level member (`displayExtra`) passed the census silently — the count arm does not discriminate, so a spurious 20th member would ship green'
      }
      return /displayExtra/.test(found.join(' '))
        ? null
        : `CONTROL FAILED: the census reported [${found.join('; ')}] without NAMEING the forged member \`displayExtra\``
    })

    attempt(problems, 'e·control-sender', () => {
      const forged = `${base}\n${[
        '',
        `${' '.repeat(TOP_LEVEL_INDENT)}display: {`,
        `${' '.repeat(NESTED_INDENT)}read(): Promise<Record<string, unknown> | null>`,
        `${' '.repeat(NESTED_INDENT)}onChanged(handler: () => void): () => void`,
        // THE LAWFUL SENDER, so the forgery's OWN offender is the alias and not a missing `write`.
        `${' '.repeat(NESTED_INDENT)}${WRITE_SIGNATURE}`,
        `${' '.repeat(NESTED_INDENT)}commit(entry: unknown): void`,
        `${' '.repeat(TOP_LEVEL_INDENT)}}`,
      ].join('\n')}\n`
      const found = bridgeCensusProblems(forged)
      if (found.length === 0) {
        return 'CONTROL FAILED: a forged `display.commit` SECOND SENDER passed the census silently — `B-10` §5 pins exactly ONE sender member and it is `write`, so this oracle must name the alias'
      }
      return /\bcommit\b/.test(found.join(' ')) ? null : `CONTROL FAILED: the census reported [${found.join('; ')}] without naming the forged second sender \`commit\``
    })

    expect(
      problems,
      '§5(e) — the mandatory POSITIVE CONTROL over a forged interface (docs/L1/unit-b-2-display-wire.md §5(e))',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(f)` — A SECOND CONSTRUCTION REDS (§5(f), §2's last paragraph)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface ConstructionSite {
  readonly file: string
  readonly line: number
  readonly bound: boolean
}

/** THE ORACLE: every `createProfileStore(` **CALL** site in a source map, with whether its answer is BOUND. A
 *  DECLARATION (`function createProfileStore(`) is not a call site and is excluded by name — otherwise the seam's own
 *  `export function createProfileStore` would count as a construction. Driven over the walked tree by the census row
 *  and over FORGED sources by the control row (one function, two subjects). */
function constructionSites(sources: ReadonlyMap<string, string>): ConstructionSite[] {
  const sites: ConstructionSite[] = []
  const needle = 'createProfileStore('
  for (const [file, raw] of sources) {
    const { code, origin } = stripComments(raw)
    let at = code.indexOf(needle)
    while (at >= 0) {
      const prefix = code.slice(Math.max(0, at - 40), at)
      const isDeclaration = /(?:function|class|interface|type)\s+$/.test(prefix)
      const isImport = /import\s*\{[^}]*$/.test(prefix)
      if (!isDeclaration && !isImport) {
        const lineStart = code.lastIndexOf('\n', at) + 1
        const sameLinePrefix = code.slice(lineStart, at).trimEnd()
        sites.push({
          // **REPO-RELATIVE, ALWAYS** — `walkSources` answers ABSOLUTE paths while §5(f) pins the site as the repo-relative
          // `src/main/main.ts`, so the census reports the PIN's own spelling (the `relPath` idiom the sibling rows use) and
          // the row's comparison is against the contract rather than against the machine's mount point. A forged source map
          // already keyed repo-relative is left exactly as written, so the control rows keep their own subjects.
          file: isAbsolute(file) ? relPath(file) : file,
          line: (raw.slice(0, origin[at] ?? 0).match(/\n/g) ?? []).length + 1,
          // BOUND: the answer is assigned (`const holder = createProfileStore(…)`), never discarded in an expression
          // statement — §5(f) pins "the call is BOUND (its answer assigned, never discarded in an expression statement)".
          bound: /=$/.test(sameLinePrefix) || /=\s*await\s*$/.test(sameLinePrefix),
        })
      }
      at = code.indexOf(needle, at + needle.length)
    }
  }
  return sites
}

describe('display-wire · arm (f) — a SECOND construction REDS (§5(f), §2)', () => {
  it('(f) · THE ONE CONSTRUCTION — §2 requires exactly ONE bound `createProfileStore(` call site under `src/**`, in `src/main/main.ts`', () => {
    const problems: string[] = []
    const sources = walkSources(SRC)
    expect(sources.length, 'the `src/**` walk found files, or an empty census answers "exactly one site" for free').toBeGreaterThan(0)
    const texts = new Map<string, string>(sources.map((file) => [file, readPath(file)]))
    const sites = constructionSites(texts)
    const files = [...new Set(sites.map((site) => site.file))].sort()

    if (sites.length === 0) {
      problems.push(
        '(f) · the ONE construction — §2 requires exactly one bound `createProfileStore(` call site under src/**, and the census found NONE: the boot constructs no store, so the display family has no instance to cross through',
      )
    } else if (files.length !== 1 || files[0] !== 'src/main/main.ts') {
      problems.push(
        `(f) · the ONE construction — §2 requires exactly one bound \`createProfileStore(\` call site under src/** and it is \`src/main/main.ts\`; the census answered [${files.join(', ')}] at line(s) [${sites.map((s) => `${s.file}:${s.line}`).join(', ')}] — a second site is the TWO-INSTANCE CLOBBER (\`STOREROOM-TWO-INSTANCES-CLOBBER-ONE-FILE\`, the foundation's \`D-80\`)`,
      )
    }
    const unbound = sites.filter((site) => !site.bound)
    if (unbound.length > 0) {
      problems.push(
        `(f) · the ONE construction — §2 requires the call's answer to be BOUND (the handle is KEPT in \`main()\`'s scope so the record can be built over it); ${unbound.map((s) => `${s.file}:${s.line}`).join(', ')} discards it in an expression statement, which is the D-80 class in its quietest form`,
      )
    }

    expect(
      problems,
      '§5(f) — the census of `createProfileStore(` CALL sites (docs/L1/unit-b-2-display-wire.md §5(f), §2)',
    ).toEqual([])
  })

  it('(f) · POSITIVE CONTROL — the SAME census answers a forged SECOND site and a forged UNBOUND site by name, so its green is not vacuous (§5(f))', () => {
    const problems: string[] = []

    attempt(problems, 'f·control-good', () => {
      const forged = new Map<string, string>([['src/main/main.ts', 'const displayStore = createProfileStore({ filePath, listeners: [] })\n']])
      const sites = constructionSites(forged)
      if (sites.length !== 1) return `CONTROL FAILED: one bound call site in one file read ${sites.length} site(s)`
      if (!sites[0]!.bound) return 'CONTROL FAILED: a plainly assigned call (`const x = createProfileStore(…)`) read as UNBOUND'
      return null
    })

    attempt(problems, 'f·control-second-site', () => {
      const forged = new Map<string, string>([
        ['src/main/main.ts', 'const displayStore = createProfileStore({ filePath })\n'],
        ['src/main/second-boot.ts', 'export function boot(){ const again = createProfileStore({ filePath }) }\n'],
      ])
      const files = [...new Set(constructionSites(forged).map((site) => site.file))].sort()
      if (files.length === 1) {
        return 'CONTROL FAILED: a forged SECOND call site in `src/main/second-boot.ts` was not counted — a clobbering second construction would ship green'
      }
      return files.includes('src/main/second-boot.ts')
        ? null
        : `CONTROL FAILED: the census answered [${files.join(', ')}] without NAMEING the forged second site`
    })

    attempt(problems, 'f·control-unbound', () => {
      const forged = new Map<string, string>([['src/main/main.ts', 'createProfileStore({ filePath })\n']])
      const sites = constructionSites(forged)
      if (sites.length !== 1) return `CONTROL FAILED: the unbound forged call read ${sites.length} site(s)`
      return sites[0]!.bound
        ? 'CONTROL FAILED: an UNBOUND call site (expression statement, handle discarded) read as BOUND — the discarded-handle arm is dead'
        : null
    })

    expect(
      problems,
      '§5(f) — the mandatory POSITIVE CONTROL over forged sources (docs/L1/unit-b-2-display-wire.md §5(f))',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `§2` — THE BOOT'S SHAPE: order, site, and the payload-free push (§2 items 1/2/4/7, §5(b1))
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('display-wire · §2 — the boot’s order and site, read off `src/main/main.ts`’s OWN bytes', () => {
  it('§2 · THE QUEUE AND THE ENTRIES ARE BUILT BEFORE THE STORE — the markered region and `createDisplayDelivery(` both precede the ONE `createProfileStore(` call site (§2 acts 1-5)', () => {
    const problems: string[] = []
    const raw = readPath(MAIN_PATH)
    const { code, origin } = stripComments(raw)
    const rawOf = (index: number): number => origin[index] ?? Number.NaN

    attempt(problems, '§2·markers', () => {
      const openAt = raw.indexOf(PRE_WINDOW_OPEN)
      const closeAt = raw.indexOf(PRE_WINDOW_CLOSE)
      const msgs: string[] = []
      if (openAt < 0) msgs.push(`the opening marker \`${PRE_WINDOW_OPEN}\` is ABSENT from \`src/main/main.ts\` — §5(c) makes both markers part of this contract's change set`)
      if (closeAt < 0) msgs.push(`the closing marker \`${PRE_WINDOW_CLOSE}\` is ABSENT from \`src/main/main.ts\` — an unclosed region is not a region`)
      if (openAt >= 0 && closeAt >= 0) {
        if (closeAt <= openAt) msgs.push('the markers are inverted or empty — the region between them is what arm (c) extracts and drives')
        else if (raw.slice(openAt + PRE_WINDOW_OPEN.length, closeAt).trim().length === 0) {
          msgs.push('the region between the markers is EMPTY — §2 item 1 builds the delivery queue there, and an empty region is not a queue')
        }
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    attempt(problems, '§2·order', () => {
      const closeAt = raw.indexOf(PRE_WINDOW_CLOSE)
      const storeAt = code.indexOf('createProfileStore(')
      const deliveryAt = code.indexOf('createDisplayDelivery(')
      if (closeAt < 0) return 'the closing pre-window marker is absent — the order claim has no anchor'
      if (storeAt < 0) {
        return '§2 act (5) requires ONE `createProfileStore({ filePath, listeners: [...displayDelivery.entries], constraints: [...] })` in `src/main/main.ts`, and the call is ABSENT — nothing is built before it because it does not exist'
      }
      const msgs: string[] = []
      if (rawOf(storeAt) < closeAt) {
        msgs.push(
          `the ONE construction (raw offset ${rawOf(storeAt)}) precedes the pre-window region's closing marker (raw offset ${closeAt}) — §2 item 1 builds the push loop and the queue BEFORE the store, because the creation's own repair delivers before any window exists`,
        )
      }
      if (deliveryAt < 0) {
        msgs.push(
          '§2 item 2 requires the entries to be built BEFORE the store (`createDisplayDelivery(…)`, whose `.entries` the construction adopts), and the call is ABSENT from `src/main/main.ts`',
        )
      } else if (deliveryAt > storeAt) {
        msgs.push(
          `\`createDisplayDelivery(\` (raw offset ${rawOf(deliveryAt)}) comes AFTER the ONE construction (raw offset ${rawOf(storeAt)}) — §2 item 2: \`createProfileStore\` reads its \`entries\` INSIDE the construction, so a delivery built after it hands the store nothing`,
        )
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§2 acts 1-5 — the queue before the store, the entries before the store (docs/L1/unit-b-2-display-wire.md §2)',
    ).toEqual([])
  })

  it('§2 · THE ONE CONSTRUCTION ADOPTS BOTH DECLARATION LISTS — the delivery’s `entries` as `listeners` AND the family’s `constraints` over the holder, or no creation repair runs and every leaf write is refused (§2 acts (4)-(5))', () => {
    const problems: string[] = []
    const raw = readPath(MAIN_PATH)
    const code = codeOnly(raw)

    attempt(problems, '§2·construction-args', () => {
      const storeAt = code.indexOf('createProfileStore(')
      if (storeAt < 0) {
        return '§2 act (5) requires ONE `createProfileStore({ filePath, listeners: [...displayDelivery.entries], constraints: [...displayConstraintDeclarations(…)] })` in `src/main/main.ts` and the call is ABSENT — the boot constructs no store at all'
      }
      // THE CALL'S OWN ARGUMENTS, read as a balanced call so "the construction passes X" means X is inside THIS call and
      // not merely present somewhere in the file (a `listeners:` key on some other call would satisfy a substring probe).
      const args = callArguments(code, storeAt + 'createProfileStore'.length)
      if (args === null || args.length === 0) {
        return 'the ONE `createProfileStore(` call’s argument list does not balance — the construction’s adopted declaration lists cannot be read'
      }
      const construction = args.join(', ')
      const msgs: string[] = []
      // (1) THE LISTENERS HALF: the entries the delivery built, adopted by name.
      if (!/listeners\s*:/.test(construction)) {
        msgs.push('the construction passes no `listeners` key — §2 item 5 adopts the delivery\'s `entries`, which is what makes a write\'s delivery reach the push loop')
      }
      if (!/displayDelivery\s*\.\s*entries\b/.test(construction)) {
        msgs.push(
          'the construction does not adopt `displayDelivery.entries` — §2 items 3/5 build the entries BEFORE the store precisely because `createProfileStore` reads them INSIDE the call, so `listeners: [...displayDelivery.entries]` is the pinned spelling',
        )
      }
      // (2) THE CONSTRAINTS HALF — and §2's act (5) states WHY, in the contract's own words: without `display-must-stand`
      // no creation repair runs, the family never stands, a leaf write has no parent to land under (B-1 §2's `D-85`: a
      // nested write does not create its parent) and every `commitTab` is refused. The unit's own app-layer gate `G8(ii)`
      // reads `<tmp>/provident-profile.json` for the placeholder THAT repair mints.
      if (!/constraints\s*:/.test(construction)) {
        msgs.push(
          'the construction passes no `constraints` key — §2 item 5 adopts BOTH lists, and without `display-must-stand` no creation repair runs: the family never stands, every leaf write is refused for want of a parent, and `G8(ii)`\'s placeholder never reaches `provident-profile.json`',
        )
      }
      if (!/displayConstraintDeclarations\s*\(/.test(construction)) {
        msgs.push(
          'the construction never calls `displayConstraintDeclarations(` — §2 item 5\'s constraints half is that family\'s own declarations, and a `constraints:` key over anything else is a different constraint set',
        )
      }
      if (!/displayConstraintDeclarations\s*\(\s*\(\s*\)\s*=>\s*displayStoreHolder\s*\.\s*current\b/.test(construction)) {
        msgs.push(
          'the constraint declarations are not handed the holder thunk `() => displayStoreHolder.current` — §2 items 4/5 read the holder through a thunk precisely so an unwrapped body can act at the registration instant and a wrapped one abstains; without the thunk the constraint bodies have no handle to reach',
        )
      }
      // (3) THE FILE PATH: spelled at this ONE site, under `app.getPath('userData')` (§2's own `filePath` bullet).
      if (!/filePath\s*:/.test(construction)) {
        msgs.push('the construction passes no `filePath` — §2 pins `join(app.getPath(\'userData\'), \'provident-profile.json\')` at this ONE site, and without it the store\'s register stays at `mem` and nothing reconstructs across a restart (`ASM-B-3`)')
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // ── §2 act (4): THE HOLDER'S DECLARATION, spelled as §2 spells it, DECLARED BEFORE the construction and BOUND AFTER
    // ── it answers. The order is the claim: a holder bound before the call would be `null` at the registration instant
    // ── for a body that should see nothing, and a holder bound nowhere would leave every constraint reading `null`.
    attempt(problems, '§2·holder', () => {
      const msgs: string[] = []
      const declaration = HOLDER_DECLARATION.exec(code)
      const storeAt = code.indexOf('createProfileStore(')
      if (declaration === null) {
        msgs.push(
          'no `const displayStoreHolder: { current: StoreInstance | null } = { current: null }` resolves — §2 act (4) pins that holder BY NAME (the holder the constraint bodies read) and binds it only after the call answers',
        )
      } else if (storeAt >= 0 && declaration.index > storeAt) {
        msgs.push(
          `the holder is DECLARED at code offset ${declaration.index}, after the construction at ${storeAt} — §2 act (4) declares it BEFORE the call, because the constraints half closes over it at construction time`,
        )
      }
      const binding = HOLDER_BINDING.exec(code)
      if (binding === null) {
        msgs.push(
          'nothing assigns `displayStoreHolder.current = …` — §2 act (6) binds the holder AFTER the construction answers, or every constraint body reads `null` forever',
        )
      } else if (storeAt >= 0 && binding.index < storeAt) {
        msgs.push(
          `the holder is BOUND at code offset ${binding.index}, before the construction at ${storeAt} — §2 acts (4)/(6) bind it only after the call answers, which is what makes a wrapped body abstain at the registration instant`,
        )
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§2 acts (4)-(5) — the ONE construction’s BOTH declaration lists and the holder (docs/L1/unit-b-2-display-wire.md §2; act (5) states why the constraints half is not optional)',
    ).toEqual([])
  })

  it('§2 · THE PINNED NAMES ARE DECLARED — `createDeliveryQueue`, `displayQueue`, `pushDisplayChanged`, `displayDelivery`, `displayStoreHolder` and `displayStore` BY NAME, because §5(c) drives the shipped body through them (§2, §5(c))', () => {
    const problems: string[] = []
    const raw = readPath(MAIN_PATH)
    const code = codeOnly(raw)

    attempt(problems, '§2·pinned-factory', () => {
      const msgs: string[] = []
      // The NAME is pinned, not the declaration KIND (§2 names the factory and its signature, never whether it is a
      // `function` or a `const` arrow): either spelling satisfies the pin, a different name does not.
      const declaration = new RegExp(
        `(?:^|\\n)\\s*(?:(?:export\\s+)?(?:async\\s+)?function\\s+${QUEUE_FACTORY}\\b|(?:export\\s+)?const\\s+${QUEUE_FACTORY}\\b)`,
        'm',
      ).test(code)
      if (!declaration) {
        msgs.push(
          `\`src/main/main.ts\` declares no \`${QUEUE_FACTORY}\` — §2 names the factory (the foundation's own name, adopted not re-invented) and §5(c) resolves BOTH the \`${QUEUE_INTERFACE}\` interface and \`${QUEUE_FACTORY}\` out of the markered region`,
        )
      }
      if (!new RegExp(`=\\s*${QUEUE_FACTORY}\\s*\\(`).test(code)) {
        msgs.push(`no \`= ${QUEUE_FACTORY}(…)\` call site resolves — §2 act (2) builds the queue, and §5(c) drives the shipped body, so the factory must be CALLED and not merely declared`)
      }
      if (!new RegExp(`(?:const|let)\\s+displayQueue\\b`).test(code)) {
        msgs.push('no `const displayQueue` — §2 pins the queue INSTANCE by that name (the sink `deliver` is called on it and `arm()` is bound through it)')
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    for (const name of PINNED_INSTANCES) {
      attempt(problems, `§2·${name}`, () => {
        const declared = new RegExp(`(?:const|let|function)\\s+${name}\\b`).test(code)
        if (!declared) {
          return `§2 pins the instance \`${name}\` by name and \`src/main/main.ts\` does not declare it (a \`const\`, \`let\` or \`function\` of that name) — §5(c) and §5(e)'s controls resolve the boot's own vocabulary, so a rename makes the shipped body unreadable to this unit's rows`
        }
        if (occurrences(code, name) < 2) {
          return `§2 pins \`${name}\` and \`src/main/main.ts\` declares it but never USES it — a declared-and-unreferenced instance is the handle §2 says must be kept, not parked`
        }
        return null
      })
    }

    // AND THE DELIVERY'S `createDisplayDelivery(` CALL IS BOUND TO `displayDelivery` (§2 act 3), so the entries the
    // construction adopts and the sink the queue's `deliver` receives are the SAME object.
    attempt(problems, '§2·delivery-binding', () => {
      return new RegExp(`(?:const|let)\\s+displayDelivery\\b[^=]*=\\s*createDisplayDelivery\\s*\\(`).test(code)
        ? null
        : 'no `const displayDelivery = createDisplayDelivery(…)` — §2 act (3) pins that binding: the sink is the QUEUE’s `deliver`, and the construction adopts the SAME delivery’s `entries`'
    })

    expect(
      problems,
      '§2/§5(c) — the boot’s PINNED NAMES (docs/L1/unit-b-2-display-wire.md §2’s PINNED NAMES sentence, §5(c))',
    ).toEqual([])
  })

  it('§2 · THE ARM LIVES INSIDE THE EXISTING `ipcMain.on(IPC_READY, …)` BODY — one registration, one `arm()` call, and the landed `backend.markReady()` still inside it (§2 item 7)', () => {
    const problems: string[] = []
    const raw = readPath(MAIN_PATH)
    const { code } = stripComments(raw)

    attempt(problems, '§2·ready-body', () => {
      const msgs: string[] = []
      if (occurrences(code, 'ipcMain.on(IPC_READY') !== 1) {
        msgs.push(
          `\`ipcMain.on(IPC_READY\` occurs ${occurrences(code, 'ipcMain.on(IPC_READY')} time(s) in \`src/main/main.ts\` — §2 item 7 puts the arm INSIDE the EXISTING body, so a second registration is a second arrival route`,
        )
      }
      const at = code.indexOf('ipcMain.on(IPC_READY')
      if (at < 0) {
        msgs.push('`ipcMain.on(IPC_READY` is ABSENT from `src/main/main.ts` — the arm has no existing body to live inside')
        return msgs.join('; ')
      }
      const open = code.indexOf('{', code.indexOf('(', at))
      const body = open < 0 ? null : bracedBlock(code, open)
      if (body === null) {
        msgs.push('the `ipcMain.on(IPC_READY, …)` handler body never closes — the text oracle cannot read what it contains')
        return msgs.join('; ')
      }
      if (!body.includes('backend.markReady()')) {
        msgs.push(
          'the `IPC_READY` body no longer calls `backend.markReady()` — §2 item 7 adds the arm to the EXISTING body, so the landed readiness act must still be there',
        )
      }
      if (!/\barm\s*\(/.test(body)) {
        msgs.push(
          'the `IPC_READY` body carries no `arm(` call — §2 item 7 flushes the pre-window queue there, because the readiness signal is what arms main\'s queue and the renderer subscribes ABOVE `bridge.ready()`',
        )
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    attempt(problems, '§2·one-arm-call', () => {
      // **THE NEEDLE IS THE CROSSING'S OWN FLUSH — `displayQueue.arm(` — NOT the bare `arm(`.** `src/main/main.ts` already
      // carries a PRE-EXISTING, unrelated O-0 recorder arm (`o0MainRecorder.arm(['snapshot.clone'])`) that §2 item 7 says
      // nothing about and this unit must NOT remove, so a bare `arm(` census reds a correct tree on a call it never
      // governed. The receiver also keeps the queue factory's own `arm(): void {` definition (which sits inside the
      // pre-window region) out of the count for free, so the region bookkeeping a bare needle needed is not carried here.
      // BOTH of the arm's real claims are kept: exactly ONE such call, INSIDE the landed `IPC_READY` body, AFTER
      // `backend.markReady()`.
      const ARM_CALL = 'displayQueue.arm('
      const calls = occurrences(code, ARM_CALL)
      if (calls === 0) {
        return `no \`${ARM_CALL}\` call site resolves in \`src/main/main.ts\` — §2 item 7 arms the crossing's queue at the realm's readiness, and the pre-window flush has no caller`
      }
      if (calls !== 1) {
        return `\`${ARM_CALL}\` is called ${calls} time(s) in \`src/main/main.ts\` — §2 item 7 registers ONE flush of the crossing's queue, inside the existing \`ipcMain.on(IPC_READY, …)\` body; a second call site is a second arrival route or a second flush for one readiness`
      }
      const at = code.indexOf(ARM_CALL)
      const readyAt = code.indexOf('ipcMain.on(IPC_READY')
      if (readyAt < 0) return '`ipcMain.on(IPC_READY` is absent — the ONE flush has no body to be inside'
      const bodyOpen = code.indexOf('{', code.indexOf('(', readyAt))
      const body = bodyOpen < 0 ? null : bracedBlock(code, bodyOpen)
      if (body === null) return 'the `IPC_READY` handler body never closes — the call site\'s home cannot be read'
      const bodyEnd = bodyOpen + body.length + 1
      if (!(at > bodyOpen && at < bodyEnd)) {
        return `the ONE \`${ARM_CALL}\` call site (code offset ${at}) falls OUTSIDE the \`ipcMain.on(IPC_READY, …)\` body (offsets ${bodyOpen}…${bodyEnd}) — §2 item 7 adds the arm INSIDE the existing body, because the renderer subscribes above \`bridge.ready()\` and this handler is what flushes the queue`
      }
      // AND IT IS AFTER THE LANDED READINESS ACT. §2 item 7's reason is ORDER, not mere membership: the push's consumer
      // answers with a `display.read()` invoke that main dispatches only once the backend is ready, so a flush issued
      // before `markReady()` would hand the realm a signal whose read is not yet armed.
      const armInBody = at - (bodyOpen + 1)
      const readyInBody = body.indexOf('backend.markReady()')
      if (readyInBody < 0) {
        return 'the `IPC_READY` body no longer calls `backend.markReady()` — §2 item 7 pins the arm AFTER the landed readiness act, so the ordering claim has no first term (the `§2·ready-body` limb reds this independently)'
      }
      return armInBody > readyInBody
        ? null
        : `the \`${ARM_CALL}\` call (body offset ${armInBody}) PRECEDES \`backend.markReady()\` (body offset ${readyInBody}) — §2 item 7 pins the flush AFTER it: the push's consumer answers with a \`display.read()\` invoke, which main dispatches only once the backend is ready, so an arm issued before the readiness act hands the realm a signal whose read has not been armed`
    })

    expect(
      problems,
      '§2 item 7 — the arm inside the EXISTING `ipcMain.on(IPC_READY, …)` body (docs/L1/unit-b-2-display-wire.md §2)',
    ).toEqual([])
  })

  it('§5(b1) · THE PUSH SENDS NO VALUE — every `send(` whose first argument is the NAME `DISPLAY_CHANGED` carries EXACTLY ONE argument (§5(b1), §4)', () => {
    const problems: string[] = []
    const raw = readPath(MAIN_PATH)
    const code = codeOnly(raw)

    attempt(problems, 'b1·send-arity', () => {
      const sends: Array<{ at: number; args: string[]; text: string }> = []
      const pattern = /\.send\s*\(/g
      for (const match of code.matchAll(pattern)) {
        const openAt = (match.index ?? 0) + match[0].length - 1
        const args = callArguments(code, openAt)
        if (args === null) continue
        const first = normaliseSignature(args[0] ?? '')
        if (first !== PUSH_CHANNEL.name && first !== `'${PUSH_CHANNEL.literal}'` && first !== `"${PUSH_CHANNEL.literal}"`) continue
        // read the call's own source text for the message, so the row quotes WHAT IT FOUND
        const closeAt = code.indexOf(')', openAt)
        sends.push({ at: openAt, args, text: code.slice(Math.max(0, openAt - 40), closeAt >= 0 ? closeAt + 1 : openAt).trim() })
      }
      if (sends.length === 0) {
        return `\`src/main/main.ts\` carries NO \`.send(\` whose first argument is \`${PUSH_CHANNEL.name}\` — §4's push (\`win.webContents.send(DISPLAY_CHANGED)\`) does not exist, so the renderer is never told the family moved`
      }
      const msgs: string[] = []
      for (const send of sends) {
        if (send.args.length !== 1) {
          msgs.push(
            `a \`send(\` carrying \`${PUSH_CHANNEL.name}\` passes ${send.args.length} argument(s) [${send.args.join(' | ')}] — §5(b1) pins the ARITY, not a comment: the push carries NOTHING (${show(send.text)})`,
          )
        }
      }
      const exact = /webContents\.send\(\s*DISPLAY_CHANGED\s*\)/
      if (!exact.test(code)) {
        msgs.push(
          `no \`win.webContents.send(${PUSH_CHANNEL.name})\` site resolves — §5(b1) pins that exact form (the crossing's own window fan-out); found [${sends.map((s) => show(s.text)).join(', ')}]`,
        )
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§5(b1) — the push carries no second argument (docs/L1/unit-b-2-display-wire.md §5(b1); D-24, forking.md §2.5)',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(h)` — THE RENDERER INSTALL IS TOTAL AND ONE-SHOT (§5(h), §4's renderer site)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** One settled microtask turn — `fill()` is a promise and the client's listener re-reads inside one. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

interface FakeBridge {
  readonly bridge: Record<string, unknown>
  readonly reads: () => number
  readonly registrations: () => number
  readonly live: () => number
  deliver(): void
}

/** THE BRIDGE DOUBLE: a plain object with an event registry of its OWN delivery route, so "the withdrawal released
 *  the ONE listener" is read through the bridge (a non-forwarding withdrawal leaves the handler registered and the
 *  next delivery fires it). Never a mock framework — `vi.mock` is not used anywhere in this file. */
function fakeBridge(reading: unknown, opts: { registrationThrows?: boolean } = {}): FakeBridge {
  const listeners: Array<(...args: unknown[]) => void> = []
  let reads = 0
  let registrations = 0
  const bridge: Record<string, unknown> = {
    display: {
      read(): Promise<unknown> {
        reads += 1
        return Promise.resolve(reading)
      },
      onChanged(handler: () => void): () => void {
        registrations += 1
        if (opts.registrationThrows === true) throw new Error('forged: the registration route throws')
        listeners.push(handler as (...args: unknown[]) => void)
        return (): void => {
          const at = listeners.indexOf(handler as (...args: unknown[]) => void)
          if (at >= 0) listeners.splice(at, 1)
        }
      },
    },
  }
  return {
    bridge,
    reads: () => reads,
    registrations: () => registrations,
    live: () => listeners.length,
    deliver(): void {
      for (const listener of [...listeners]) listener()
    },
  }
}

describe('display-wire · arm (h) — the install is TOTAL and ONE-SHOT (§5(h), §4)', () => {
  it('(h) · TOTAL OVER EVERY ABSENT BRIDGE — no throw, the DECLARED `subscribed: false` reason, a total `release`, and `fill()` never called where no read route exists (§5(h))', async () => {
    const problems: string[] = []
    let rendererModule: unknown = null
    try {
      // The renderer is loaded HERE, with no shim document in being, so its boot guard sees no `document` (and a shim
      // document's `loading` readyState would register a never-fired DOMContentLoaded listener instead of booting).
      rendererModule = (await import('../../../src/renderer/renderer.js')) as unknown
    } catch (thrown) {
      problems.push(`(h) · \`src/renderer/renderer.js\` did not load in the node realm: ${msgOf(thrown)}`)
    }
    const install = readFn(rendererModule, 'installDisplayCrossing')
    if (install === null) {
      problems.push(
        '(h) · `installDisplayCrossing` does not resolve as a function export on `src/renderer/renderer.js` — §4 pins `installDisplayCrossing(bridge: DisplayBridge | null | undefined): DisplayCrossing`, so no arm below has a seam to drive',
      )
    }

    /** **A HOSTILE BRIDGE WHOSE `display` GETTER THROWS** — the `B1-ADV-05(c)` class one level up, MEASURED as a real fault at
     *  the landing (`B2-ADV2-02`: an unguarded `bridge?.display` made the install THROW, falsifying this function's own
     *  totality sentence). A getter is not a guard, so an accessor that throws must read as the ABSENT member — the client's
     *  own `no-port`. This arm exists so the totality claim is measured at the edge rather than only inside the types. */
    const throwingMemberBridge = (): Record<string, unknown> => {
      const hostile: Record<string, unknown> = {}
      Object.defineProperty(hostile, 'display', {
        enumerable: true,
        configurable: true,
        get(): never {
          throw new Error('forged: the `display` member getter throws')
        },
      })
      return hostile
    }

    /** Each absent shape, with the reason the client's own four words give it (B-1 §3: the four absent arms are FOUR
     *  words, never one). */
    const absentShapes: Array<{ label: string; bridge: unknown; reason: string }> = [
      { label: 'a `null` bridge', bridge: null, reason: 'no-port' },
      { label: 'an `undefined` bridge', bridge: undefined, reason: 'no-port' },
      { label: 'a bridge with NO `display` member', bridge: {}, reason: 'no-port' },
      { label: 'a `display` member that is not an object', bridge: { display: 'not-a-port' }, reason: 'no-port' },
      { label: 'a `display` GETTER that throws', bridge: throwingMemberBridge(), reason: 'no-port' },
      { label: 'a `read` that is not a function', bridge: { display: { read: 'not-a-function', onChanged: () => () => {} } }, reason: 'no-read-route' },
      { label: 'an `onChanged` that THROWS on registration', bridge: fakeBridge({ tabA: { documentId: 'doc' } }, { registrationThrows: true }).bridge, reason: 'register-threw' },
    ]

    for (const shape of absentShapes) {
      if (install === null) break
      attempt(problems, `h·${shape.reason}`, () => {
        let crossing: unknown
        try {
          crossing = install(shape.bridge)
        } catch (thrown) {
          return `${shape.label} made \`installDisplayCrossing\` THROW (${msgOf(thrown)}) — §5(h) pins TOTALITY: no absent bridge, malformed member or throwing registration may throw`
        }
        const subscription = (crossing as { subscription?: unknown } | null)?.subscription
        if (subscription === null || typeof subscription !== 'object') {
          return `${shape.label} answered no \`subscription\` — §4 pins \`DisplayCrossing = { client, subscription }\``
        }
        const answer = subscription as { subscribed?: unknown; reason?: unknown; release?: unknown }
        const msgs: string[] = []
        if (answer.subscribed !== false) {
          msgs.push(`${shape.label} answered \`subscribed: ${show(answer.subscribed)}\`; §5(h) pins the declared \`subscribed: false\` with its own word`)
        }
        if (answer.reason !== shape.reason) {
          msgs.push(
            `${shape.label} answered reason ${show(answer.reason)}; the client's fourth word for this fault is ${show(shape.reason)} — the four absent arms are FOUR words and folding them leaves a caller unable to tell one wiring fault from another (B-1 §3)`,
          )
        }
        if (typeof answer.release !== 'function') {
          msgs.push(`${shape.label} answered no callable \`release\` — §5(h): a withdrawal must be total on EVERY arm, so a caller never guards before withdrawing`)
        } else {
          try {
            ;(answer.release as AnyFn)()
          } catch (thrown) {
            msgs.push(`${shape.label}: the total \`release\` THREW (${msgOf(thrown)}) — §5(h) pins a total withdrawal`)
          }
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })
    }

    // ── `fill()` NEVER CALLED WHERE NO READ ROUTE EXISTS. Measured, not asserted in prose: the port's `read` member is
    // ── an ACCESSOR that counts how many times the route is looked for, and the baseline is the count the LANDED client's
    // ── own `subscribe` makes on an identical port. A `fill()` reads the route too, so the install must not exceed the
    // ── baseline. (A spelled figure would be wrong the day the client looks once instead of twice.)
    if (install !== null) {
      attempt(problems, 'h·no-fill-without-read-route', () => {
        const portedNoRead = (): { display: Record<string, unknown>; accesses: () => number; register: () => number } => {
          let accesses = 0
          let registrations = 0
          const display: Record<string, unknown> = {}
          Object.defineProperty(display, 'read', {
            enumerable: true,
            configurable: true,
            get(): undefined {
              accesses += 1
              return undefined
            },
          })
          display.onChanged = (): (() => void) => {
            registrations += 1
            return (): void => undefined
          }
          return { display, accesses: () => accesses, register: () => registrations }
        }
        const baseline = portedNoRead()
        const createClient = readFn(displayClientModule, 'createDisplayClient')
        if (createClient === null) {
          return '`createDisplayClient` does not resolve on the LANDED `src/renderer/display-client.js`, so the baseline for the no-read-route arm cannot be taken'
        }
        try {
          const client = createClient(baseline.display) as { subscribe: (handler: () => void) => unknown }
          client.subscribe(() => undefined)
        } catch (thrown) {
          return `the baseline client threw on a port with no read route (${msgOf(thrown)}) — the instrument has no reference reading`
        }
        const reference = baseline.accesses()
        const subject = portedNoRead()
        try {
          install({ display: subject.display })
        } catch (thrown) {
          return `a bridge whose \`display\` carries only \`onChanged\` made the install THROW (${msgOf(thrown)}) — §5(h) pins totality over a missing read route`
        }
        if (subject.accesses() > reference) {
          return `the install looked the \`read\` route up ${subject.accesses()} time(s) where the client's own \`subscribe\` looks it up ${reference} — §5(h) pins that \`fill()\` is NEVER called where no read route exists (the extra lookup is a read the boot made against a route that is not there)`
        }
        if (subject.register() !== 0) {
          return `the install registered ${subject.register()} listener(s) on a port whose read route is ABSENT — the client's own order (\`no-port\`, then \`no-read-route\`, then \`no-changed-route\`) never reaches the change route without a read route, so a registration here is a subscription that promises a re-read it could never perform (B-1 §3)`
        }
        // **THE INSTRUMENT'S OWN CONTROL**: a FORGED installer that DOES call `fill()` must be caught by the same
        // measurement, or the arm above is a rule that cannot fail.
        const forgedSubject = portedNoRead()
        const forgedClient = createClient(forgedSubject.display) as { subscribe: (handler: () => void) => unknown; fill: () => Promise<unknown> }
        forgedClient.subscribe(() => undefined)
        void forgedClient.fill()
        if (forgedSubject.accesses() <= reference) {
          return `CONTROL FAILED: a forged installer that calls \`fill()\` was NOT caught (${forgedSubject.accesses()} lookup(s) against the ${reference}-lookup baseline) — the "fill is never called" arm is dead`
        }
        return null
      })
    }

    expect(
      problems,
      '§5(h) — totality over every absent bridge (docs/L1/unit-b-2-display-wire.md §5(h), §4)',
    ).toEqual([])
  })

  it('(h) · ONE-SHOT OVER A GOOD BRIDGE — `fill()` exactly ONCE, ONE registration, ONE re-read per push, and the withdrawal releases the ONE listener (§5(h), §4)', async () => {
    const problems: string[] = []
    let rendererModule: unknown = null
    try {
      rendererModule = (await import('../../../src/renderer/renderer.js')) as unknown
    } catch (thrown) {
      problems.push(`(h) · \`src/renderer/renderer.js\` did not load in the node realm: ${msgOf(thrown)}`)
    }
    const install = readFn(rendererModule, 'installDisplayCrossing')
    if (install === null) {
      problems.push(
        '(h) · `installDisplayCrossing` does not resolve as a function export on `src/renderer/renderer.js` — §4 pins it, and the one-shot arms have no seam to drive',
      )
    } else {
      const reading = { 'tab-a': { documentId: 'doc-a' } }
      const double = fakeBridge(reading)
      let crossing: unknown = null
      attempt(problems, 'h·install', () => {
        try {
          crossing = install(double.bridge)
        } catch (thrown) {
          return `the install THREW over a well-formed bridge (${msgOf(thrown)}) — §5(h) pins totality on this arm too`
        }
        const shape = crossing as { client?: unknown; subscription?: unknown } | null
        const msgs: string[] = []
        if (shape === null || typeof shape !== 'object') msgs.push('the install answered no `DisplayCrossing` object')
        else {
          if (shape.client === null || typeof shape.client !== 'object') msgs.push('the crossing carries no `client` — §4 pins `DisplayCrossing = { client, subscription }`')
          if (shape.subscription === null || typeof shape.subscription !== 'object') msgs.push('the crossing carries no `subscription` — §4 pins both halves')
          else if ((shape.subscription as { subscribed?: unknown }).subscribed !== true) {
            msgs.push(`the good-bridge subscription answered \`subscribed: ${show((shape.subscription as { subscribed?: unknown }).subscribed)}\`; §5(h)/§4 pin a LIVE subscription over a good bridge`)
          }
        }
        if (double.registrations() !== 1) {
          msgs.push(`the install registered ${double.registrations()} listener(s) — §4 subscribes FIRST and EXACTLY once (a second registration is a second arrival route for one push)`)
        }
        return msgs.length > 0 ? msgs.join('; ') : null
      })

      await settle()

      attempt(problems, 'h·fill-once', () => {
        return double.reads() === 1
          ? null
          : `the boot made ${double.reads()} read(s) through the bridge — §4/§5(h) pin ONE stated boot read (\`fill()\` ONCE, after the subscription; a read before it loses every change that lands between them)`
      })

      const beforePush = double.reads()
      double.deliver()
      await settle()
      if (double.reads() !== beforePush + 1) {
        problems.push(
          `one push answered ${double.reads() - beforePush} re-read(s); §5(h) pins EXACTLY ONE — the push carries nothing, so the listener's only correct answer is one fresh read`,
        )
      }

      attempt(problems, 'h·withdrawal', () => {
        const subscription = (crossing as { subscription?: { release?: unknown } } | null)?.subscription
        if (typeof subscription?.release !== 'function') {
          return 'the good-bridge subscription carries no callable `release` — §5(h) pins that the withdrawal releases the ONE listener'
        }
        ;(subscription.release as AnyFn)()
        return double.live() === 0
          ? null
          : `the bridge still holds ${double.live()} listener(s) after \`release()\` — the withdrawal must release the ONE registration it made`
      })

      // AND NOTHING LISTENS AFTER THE WITHDRAWAL: the registry is empty, so this delivery reaches no handler and must
      // cause no read. A read here is a listener the withdrawal left behind.
      const beforeSilent = double.reads()
      double.deliver()
      await settle()
      attempt(problems, 'h·silent-after-release', () => {
        return double.reads() === beforeSilent
          ? null
          : `a delivery AFTER \`release()\` caused ${double.reads() - beforeSilent} re-read(s) — §5(h) pins that the withdrawal releases the ONE listener, so a withdrawn crossing hears nothing`
      })
    }

    expect(
      problems,
      '§5(h) — the install’s one-shot discipline and its withdrawal (docs/L1/unit-b-2-display-wire.md §5(h), §4)',
    ).toEqual([])
  })
})
