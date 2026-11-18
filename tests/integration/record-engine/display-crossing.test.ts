// tests/integration/record-engine/display-crossing.test.ts — unit `B-2` `display-wire`'s CROSSING rows, authored
// BEFORE any byte of the change set moves (RCA-1). Every assertion is read off
// `docs/L1/unit-b-2-display-wire.md` §5 `(a)`, `(b)` and `(c)`'s civil half.
//
// THE ARMS THIS FILE CARRIES:
//   `(a)` §5(a) — **A WRITE CROSSES AND THE RENDERER HEARS EXACTLY ONE PUSH.** A real store on a `/tmp` `filePath`, the
//         delivery, ONE construction adopting `[...delivery.entries]`, the record over that handle, and a port whose
//         `read` is the record's and whose `onChanged` registers on the queue-backed subscriber: `commitTab('tab-a', …)`
//         ⇒ **exactly one** push observed and the client's re-read answers `tab-a`'s entry; two writes in separate turns
//         ⇒ two pushes (never coalesced across turns).
//   `(b)` §5(b) — **THE PUSH CARRIES NOTHING, and a pushed value cannot become the shape.** (b1) the push is
//         `win.webContents.send(DISPLAY_CHANGED)` with NO second argument — ARITY, not a comment, read off
//         `src/main/main.ts`'s own bytes; (b2) the preload's listener is called with ZERO arguments and hands its
//         handler nothing (a byte reading, because `src/main/preload.ts` imports `electron` and is not loadable in the
//         node realm — the `menu-opener` limb `E` precedent), and its `read` INVOKES `DISPLAY_READ` by NAME (both channel
//         constants live in `src/main/store-channels.ts` per §4's amendment); (b3) **THE FALSIFIER THAT MUST RED**: a
//         forged bridge whose `onChanged` invokes the handler WITH A VALUE — the client's reading must equal the PORT'S
//         read, never the pushed value; (b4) the renderer's own handler receives the RE-READ's reading.
//   `(c)` §5(c) civil half — two entries written PRE-WINDOW are BOTH read after the flush. (The markered queue region and
//         the reload arm live in `pre-window-hold.test.ts`; this file's half is the store-side reading.)
//
// **COLOURS DECLARED AT THIS HEAD:** `(a)`, `(b3)`, `(b4)` and `(c)`'s civil half are GREEN-ON-ARRIVAL and that is
// correct per the contract — they drive `B-1`'s LANDED module (`createDisplayDelivery`, `createDisplayRecord`,
// `createDisplayClient`), which already works; what `B-2` owns is the WIRING, so the RED of this unit is in the
// source-shape arms and in the pre-window/boot rows. `(b1)` and `(b2)` are RED: the push loop and the bridge member do
// not exist at this head.
//
// **HARD RULES OBSERVED:** this file NEVER imports `src/main/main.ts` (it runs `app.whenReady()` at module scope) — its
// bytes are read with `node:fs`; `src/main/preload.ts` bytes likewise. **NO `vi.mock`** — the bridge and port doubles are
// plain objects handed to the REAL exported seams. No network, no Electron spawn, no DOM. Every real store goes on a
// `mkdtempSync(join(tmpdir(), …))` path and is removed in `afterAll`.
//
// LAYER (D-10, RCA-12): `[T]`/ENVELOPE under the layout-less shim — this proves the CROSSING (main-side delivery → port →
// client), never a paint. `B-3` owns the channel that paints; nothing here mounts, renders or writes a DOM node.
import { afterAll, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// Namespace imports: this unit WIRES `B-1`'s module, so a member this unit adds or renames is a NAMED problem inside the
// row that needs it — never an ESM link error that kills the file.
import * as recordEngineModule from '../../../src/main/record-engine/index.js'
import * as storeroomModule from '../../../src/main/storeroom.js'
import * as displayClientModule from '../../../src/renderer/display-client.js'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..', '..', '..')
const MAIN_PATH = join(ROOT, 'src', 'main', 'main.ts')
const PRELOAD_PATH = join(ROOT, 'src', 'main', 'preload.ts')

/** §4's pinned push constant, spelled here because this file is not `src/**`: the row is the READING of the contract. */
const PUSH_CHANNEL_NAME = 'DISPLAY_CHANGED'
const PUSH_CHANNEL_LITERAL = 'provident:display:changed'
/** §4's pinned read constant, for the preload arm's name check — `DISPLAY_READ`, declared in `src/main/store-channels.ts`
 *  beside the push (BOTH constants live there once §4's amendment lands; `src/shared/types.ts` is NOT touched). */
const READ_CHANNEL_NAME = 'DISPLAY_READ'

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

/** A NAMED reachability probe: an absent export answers `undefined`, never a link error. */
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

/** THE COLLECTOR: a sub-limb returns the problem TEXT when its reading is not clean and `null` when it is; a throw
 *  before the reading completes is itself a named problem. One aggregate assertion per `it`. */
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

/** Comments stripped, so a docblock that DESCRIBES the push rule cannot trip a payload needle. */
function codeOnly(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (match, lead: string) => `${lead}`)
}

/** The inner text of the balanced `{ … }` whose `{` is at `openAt`, or `null`. */
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

/** The text of ONE member of an object-literal block: from its declaration to the next declaration at the same indent
 *  (or the block's end). Used so "the read route invokes `DISPLAY_READ`" is read inside the READER's own body and not
 *  anywhere in the file — a subject located by its own site, never by "the last `invoke(` in `preload.ts`". */
function memberSlice(block: string, name: string, indent: number): string | null {
  const at = new RegExp(`^ {${indent}}${name}\\s*[(:]`, 'm').exec(block)
  if (at === null) return null
  const rest = block.slice(at.index)
  const next = /\n {4}[A-Za-z_$][A-Za-z0-9_$]*\s*[(:]/.exec(rest.slice(1))
  return next === null ? rest : rest.slice(0, next.index + 1)
}

/** One settled turn: `fill()` is a promise and the client's listener re-reads inside one. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0))

const tempDirs: string[] = []

/** A real store's `filePath` — a fresh `mkdtempSync` per construction, removed in `afterAll`. */
function newProfilePath(label: string): string {
  const dir = mkdtempSync(join(tmpdir(), `b2-display-crossing-${label}-`))
  tempDirs.push(dir)
  return join(dir, 'provident-profile.json')
}

afterAll(() => {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true })
})

// ─── the chain: store → delivery → record → port → client ───────────────────────────────────────────────────────────

/** The ONE construction's arguments, as §2 pins them: the entries are built BEFORE the store because
 *  `createProfileStore` reads its `listeners` array inside the call. */
interface Chain {
  readonly record: AnyRecord
  readonly delivery: AnyRecord
  readonly store: AnyRecord
  /** Every address the delivery's sink was handed, in order — the "push" this file counts. */
  readonly sentAddresses: string[][]
  readonly sends: () => number
  /** The leaf a tab id lands at, derived from the module's own `DISPLAY_ADDRESS`. */
  readonly leafOf: (tabId: string) => string[]
}

/** Build the crossing, or push a NAMED problem and answer `null`. Nothing here is a mock: a real store on a real
 *  `/tmp` path, the registered delivery entry the construction adopts, the record over that handle.
 *
 *  **THE CONSTRUCTION ADOPTS BOTH DECLARATION LISTS, AND §2's ACT (5) NOW SPELLS BOTH** (`B-1` §2: a nested write does
 *  not create its parent, so `display-must-stand`'s repair is what makes `['display', <tabId>]` landable at all — and it
 *  is what `G8(ii)` reads in `<tmp>/provident-profile.json`). The amended contract's construction is `{ filePath,
 *  listeners: [...displayDelivery.entries], constraints: [...displayConstraintDeclarations(() => displayStoreHolder
 *  .current)] }`, with the holder declared `{ current: null }` before the call and BOUND after it answers. A construction
 *  built to a `{ filePath, listeners }` spelling alone would stand no family, refuse every leaf write and write no
 *  placeholder — so the chain below is the one §2 pins, in §2's own order. */
function buildChain(problems: string[], label: string): Chain | null {
  const createProfileStore = readFn(storeroomModule, 'createProfileStore')
  const createDisplayDelivery = readFn(recordEngineModule, 'createDisplayDelivery')
  const createDisplayRecord = readFn(recordEngineModule, 'createDisplayRecord')
  const displayConstraintDeclarations = readFn(recordEngineModule, 'displayConstraintDeclarations')
  const address = readExport(recordEngineModule, 'DISPLAY_ADDRESS')

  if (createProfileStore === null) {
    problems.push(`${label} · \`createProfileStore\` does not resolve on the seam \`src/main/storeroom.ts\` — the ONE construction has no subject`)
    return null
  }
  if (createDisplayDelivery === null || createDisplayRecord === null) {
    problems.push(
      `${label} · \`createDisplayDelivery\`/\`createDisplayRecord\` do not both resolve on \`src/main/record-engine/index.js\` — §2 item 2's entries and §2 item 5's record are \`B-1\`'s barrel exports and the crossing has no halves without them`,
    )
    return null
  }
  if (displayConstraintDeclarations === null) {
    problems.push(
      `${label} · \`displayConstraintDeclarations\` does not resolve on the barrel — without \`display-must-stand\` the family is never minted, so no leaf write can land and this row's whole chain is unbuildable`,
    )
    return null
  }
  if (!Array.isArray(address) || address.length === 0) {
    problems.push(`${label} · \`DISPLAY_ADDRESS\` does not resolve as a non-empty tuple on the barrel — the leaf this file names cannot be derived`)
    return null
  }
  const sentAddresses: string[][] = []
  let sends = 0
  try {
    // §2 item 2 — THE ENTRIES BEFORE THE STORE, and the sink is the push: one address in, nothing else.
    const delivery = createDisplayDelivery((delivered: readonly string[]) => {
      sentAddresses.push([...delivered])
      sends += 1
    }) as AnyRecord
    const entries = delivery.entries
    if (!Array.isArray(entries) || entries.length === 0) {
      problems.push(`${label} · the delivery carries no \`entries\` — §2 item 3 has nothing for the construction to adopt`)
      return null
    }
    // §2 item 3 — THE ONE CONSTRUCTION, over a real `/tmp` path, adopting the entries AND the family's declarations. The
    // handle is bound AFTER the construction answers (B-1's own order: a registration-instant body reaches for no handle).
    let holder: unknown = null
    const store = createProfileStore({
      filePath: newProfilePath(label),
      listeners: [...(entries as unknown[])],
      constraints: [...(displayConstraintDeclarations(() => holder) as unknown[])],
    }) as AnyRecord
    holder = store
    // §2 item 5 — the record over that handle.
    const record = createDisplayRecord({ store, delivery }) as AnyRecord
    return {
      record,
      delivery,
      store,
      sentAddresses,
      sends: () => sends,
      leafOf: (tabId: string) => [...(address as string[]), tabId],
    }
  } catch (thrown) {
    // A construction the native addon cannot serve is a STOP, reported — never worked around.
    problems.push(`${label} · the ONE construction THREW (${msgOf(thrown)}) — a construction that cannot load the addon or refuses its config is a STOP, reported rather than worked around`)
    return null
  }
}

/** The realm's port as §4 wires it: `read` is the RECORD's, `onChanged` registers on the queue-backed subscriber (here
 *  the delivery's own fan-out, which is the same arity-zero route the queue sits behind). */
function portOver(chain: Chain): AnyRecord {
  return {
    read: () => (chain.record.read as AnyFn).call(chain.record),
    onChanged: (handler: () => void) => (chain.delivery.subscribe as AnyFn).call(chain.delivery, handler),
  }
}

/** The entry shape the family admits: `documentId` and nothing else (D-23's payload, no member more). */
const entryFor = (documentId: string): AnyRecord => ({ documentId })

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(a)` — A WRITE CROSSES AND THE RENDERER HEARS EXACTLY ONE PUSH (§5(a))
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('display-crossing · arm (a) — one write, one push, one re-read (§5(a))', () => {
  it('(a) · A WRITE CROSSES: `commitTab` delivers EXACTLY ONE push and the client’s re-read answers the entry it wrote (§5(a))', async () => {
    const problems: string[] = []
    const chain = buildChain(problems, '(a)·one-write')

    if (chain !== null) {
      const createDisplayClient = readFn(displayClientModule, 'createDisplayClient')
      if (createDisplayClient === null) {
        problems.push('(a) · `createDisplayClient` does not resolve on the LANDED `src/renderer/display-client.js` — the renderer half of the crossing does not exist')
      } else {
        // THE CREATION'S OWN DELIVERY IS NOT THIS ROW'S PUSH: the construction's repair fires before any realm stands, so
        // the baseline is taken AFTER the store exists (B-1's `(d)`), and only the write's push is counted here.
        const client = createDisplayClient(portOver(chain)) as AnyRecord
        const heard: unknown[] = []
        const subscription = (client.subscribe as AnyFn)((reading: unknown) => {
          heard.push(reading)
        }) as AnyRecord
        if (subscription.subscribed !== true) {
          problems.push(`(a) · the client did not subscribe over a real port (reason ${show(subscription.reason)}) — the crossing’s renderer half is dead and the push count below measures nothing`)
        }
        const filled = (await (client.fill as AnyFn)()) as unknown
        if (filled === null) {
          problems.push(
            'the boot read answered `null` over a constructed family — the creation\'s placeholder is what makes the root stand, and a `null` reading means the boot read saw no family at all',
          )
        }
        const pushesBefore = chain.sends()

        const answer = (chain.record.commitTab as AnyFn)('tab-a', entryFor('doc-a')) as AnyRecord
        if (answer.ok !== true) {
          problems.push(`(a) · \`commitTab('tab-a', …)\` answered ${show(answer)} — §3's write route answers \`{ok: true}\` on a lawful entry, and a refusal here means the crossing wrote nothing to hear`)
        }
        await settle()

        const pushes = chain.sends() - pushesBefore
        if (pushes !== 1) {
          problems.push(
            `(a) · ONE WRITE PRODUCED ${pushes} PUSH(ES) — §5(a) pins EXACTLY ONE: the delivery fires once per write, the sink is the push, and the renderer's only correct answer to it is one re-read`,
          )
        }
        if (heard.length !== 1) {
          problems.push(`(a) · the renderer's handler heard ${heard.length} push(es) for one write — §5(a) pins exactly ONE arrival for one write`)
        }
        // AND THE RE-READ ANSWERS THE WRITE: the handler's reading and the client's held reading both carry `tab-a`.
        const held = (client.reading as AnyFn)() as AnyRecord | null
        const leafRead = (chain.record.readTab as AnyFn)('tab-a') as unknown
        if (held === null || (held as AnyRecord)['tab-a'] === undefined) {
          problems.push(`(a) · the client’s held reading is ${show(held)} after the push — the listener re-reads and REPLACES the shape, so \`tab-a\` must be in it`)
        } else if (show((held as AnyRecord)['tab-a']) !== show(leafRead)) {
          problems.push(
            `(a) · the client holds ${show((held as AnyRecord)['tab-a'])} for \`tab-a\` while the record's own read answers ${show(leafRead)} — the two readings of one event must be the same value`,
          )
        }
        const heardLast = heard.length > 0 ? heard[heard.length - 1] : null
        if (heardLast !== null && (heardLast as AnyRecord)['tab-a'] === undefined) {
          problems.push(`(a) · the renderer's handler was handed ${show(heardLast)}, which carries no \`tab-a\` — §5(a)/(b4): the handler receives the RE-READ's reading`)
        }
      }
    }

    expect(
      problems,
      '§5(a) — one write crosses as exactly one push (docs/L1/unit-b-2-display-wire.md §5(a))',
    ).toEqual([])
  })

  it('(a) · TWO WRITES IN SEPARATE TURNS ARE TWO PUSHES — never coalesced across turns (§5(a))', async () => {
    const problems: string[] = []
    const chain = buildChain(problems, '(a)·two-writes')
    if (chain !== null) {
      const createDisplayClient = readFn(displayClientModule, 'createDisplayClient')
      if (createDisplayClient === null) {
        problems.push('(a) · `createDisplayClient` does not resolve on the LANDED `src/renderer/display-client.js`')
      } else {
        const client = createDisplayClient(portOver(chain)) as AnyRecord
        const heard: unknown[] = []
        ;(client.subscribe as AnyFn)((reading: unknown) => {
          heard.push(reading)
        })
        await (client.fill as AnyFn)()
        const before = chain.sends()

        ;(chain.record.commitTab as AnyFn)('tab-a', entryFor('doc-a'))
        await settle()
        const afterFirst = chain.sends()
        ;(chain.record.commitTab as AnyFn)('tab-b', entryFor('doc-b'))
        await settle()
        const afterSecond = chain.sends()

        if (afterFirst - before !== 1) {
          problems.push(`(a) · the FIRST write produced ${afterFirst - before} push(es); §5(a) pins ONE per write`)
        }
        if (afterSecond - afterFirst !== 1) {
          problems.push(
            `(a) · the SECOND write produced ${afterSecond - afterFirst} push(es) — §5(a): two writes in separate turns are TWO pushes; a coalescing that folded them would leave the second tab's entry unread until the next change`,
          )
        }
        if (heard.length !== 2) {
          problems.push(`(a) · the renderer heard ${heard.length} push(es) for two writes — §5(a) pins two`)
        }
        const held = (client.reading as AnyFn)() as AnyRecord | null
        for (const tabId of ['tab-a', 'tab-b']) {
          if (held === null || (held as AnyRecord)[tabId] === undefined) {
            problems.push(`(a) · the client’s held reading ${show(held)} does not carry \`${tabId}\` — the last re-read must replace the shape with BOTH entries`)
          }
        }
      }
    }

    expect(
      problems,
      '§5(a) — two writes, two pushes (docs/L1/unit-b-2-display-wire.md §5(a))',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(b)` — THE PUSH CARRIES NOTHING (§5(b) b1…b4)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('display-crossing · arm (b) — the push carries nothing (b1…b4) (§5(b))', () => {
  it('(b1) · THE PUSH IS ARITY ONE — `win.webContents.send(DISPLAY_CHANGED)` with NO second argument, read off `main.ts`’s own bytes (§5(b1))', () => {
    const problems: string[] = []
    const code = codeOnly(readPath(MAIN_PATH))

    attempt(problems, 'b1', () => {
      const sends: Array<{ args: string[]; text: string }> = []
      for (const match of code.matchAll(/\.send\s*\(/g)) {
        const openAt = (match.index ?? 0) + match[0].length - 1
        // walk the balanced call and split its top-level arguments
        let depth = 0
        let current = ''
        const args: string[] = []
        let closeAt = -1
        for (let i = openAt; i < code.length; i += 1) {
          const char = code[i] as string
          if (char === '(' || char === '{' || char === '[') depth += 1
          else if (char === ')' || char === '}' || char === ']') {
            depth -= 1
            if (depth === 0) {
              if (current.trim().length > 0) args.push(current.trim())
              closeAt = i
              break
            }
          } else if (char === ',' && depth === 1) {
            args.push(current.trim())
            current = ''
            continue
          }
          if (i !== openAt) current += char
        }
        if (closeAt < 0) continue
        const first = (args[0] ?? '').replace(/\s+/g, ' ').trim()
        if (first !== PUSH_CHANNEL_NAME && first !== `'${PUSH_CHANNEL_LITERAL}'` && first !== `"${PUSH_CHANNEL_LITERAL}"`) continue
        sends.push({ args, text: code.slice(Math.max(0, openAt - 60), closeAt + 1).replace(/\s+/g, ' ').trim() })
      }
      if (sends.length === 0) {
        return `\`src/main/main.ts\` carries NO \`.send(\` whose first argument is \`${PUSH_CHANNEL_NAME}\` — §4's push does not exist, so the crossing's main half has no signal to send`
      }
      const msgs: string[] = []
      for (const send of sends) {
        if (send.args.length !== 1) {
          msgs.push(
            `a \`send(\` passes ${send.args.length} argument(s) [${send.args.join(' | ')}] — §5(b1) pins ARITY ONE: the push carries no value and no address, so a second argument is a payload the renderer would have to ignore (${show(send.text)})`,
          )
        }
      }
      if (!/webContents\.send\(\s*DISPLAY_CHANGED\s*\)/.test(code)) {
        msgs.push(`no \`win.webContents.send(${PUSH_CHANNEL_NAME})\` site resolves — §5(b1) pins that exact form`)
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    expect(
      problems,
      '§5(b1) — the push’s arity, read off the shipped bytes (docs/L1/unit-b-2-display-wire.md §5(b1))',
    ).toEqual([])
  })

  it('(b2) · THE PRELOAD’S LISTENER HANDS ITS HANDLER NOTHING — called at ARITY ZERO, and the withdrawal removes the SAME listener (§5(b2))', () => {
    const problems: string[] = []
    const code = codeOnly(readPath(PRELOAD_PATH))

    attempt(problems, 'b2·site', () => {
      const at = code.indexOf('export interface ProvidentBridge {')
      if (at < 0) return '`src/main/preload.ts` declares no `export interface ProvidentBridge {` — the `display` member has no declared site'
      const open = code.indexOf('{', at)
      const block = open < 0 ? null : bracedBlock(code, open)
      if (block === null) return 'the `ProvidentBridge` block never closes — the member census cannot be read'
      if (!new RegExp(`^ {2}display\\s*:`, 'm').test(block)) {
        return 'the interface declares no two-space TOP-LEVEL `display` key — §4 pins ONE top-level key with exactly `{read, onChanged}` and §5(b2) reads the subscriber inside it'
      }
      if (!new RegExp(`\\b${READ_CHANNEL_NAME}\\b`).test(code)) {
        return `\`src/main/preload.ts\` never references the NAME \`${READ_CHANNEL_NAME}\` — §4 has \`read\` invoke that channel by name`
      }
      if (!new RegExp(`\\b${PUSH_CHANNEL_NAME}\\b`).test(code)) {
        return `\`src/main/preload.ts\` never references the NAME \`${PUSH_CHANNEL_NAME}\` — §4 has \`onChanged\` register on that channel by name`
      }
      return null
    })

    attempt(problems, 'b2·listener', () => {
      // THE IMPLEMENTATION, located by the OBJECT PATH and never by "the last `onChanged(` in the file": the bridge
      // literal's `display` member is the subject, so a sibling sub-namespace's `onChanged` can never be read as this one.
      const bridgeAt = code.indexOf('const bridge: ProvidentBridge = ')
      if (bridgeAt < 0) return 'no `const bridge: ProvidentBridge = { … }` literal resolves in `src/main/preload.ts` — the subscriber has no implementation'
      const bridgeOpen = code.indexOf('{', bridgeAt)
      const exposed = bridgeOpen < 0 ? null : bracedBlock(code, bridgeOpen)
      if (exposed === null) return 'the exposed bridge literal never closes — the `display` member cannot be located'
      const displayAt = new RegExp(`^ {2}display\\s*:`, 'm').exec(exposed)
      if (displayAt === null) {
        return 'the exposed bridge literal carries no two-space `display:` KEY — §4 pins the member on `window.provident`, and §5(b2) reads the subscriber inside it'
      }
      const displayOpen = exposed.indexOf('{', displayAt.index + displayAt[0].length - 1)
      const displayBlock = displayOpen < 0 ? null : bracedBlock(exposed, displayOpen)
      if (displayBlock === null) return 'the `display` member carries no object body — §4 pins `{ read, onChanged }`, and the listener has no site'
      const onChangeAt = displayBlock.search(/onChanged\s*\(/)
      if (onChangeAt < 0) return 'the `display` member declares no `onChanged` — §4 pins the subscriber, and this arm has no listener to read'
      const bodyOpen = displayBlock.indexOf('{', onChangeAt)
      const body = bodyOpen < 0 ? null : bracedBlock(displayBlock, bodyOpen)
      if (body === null) {
        return 'the `onChanged` body does not read as a balanced block — §4 pins ONE `ipcRenderer.on(DISPLAY_CHANGED, listener)` whose listener calls the handler at arity zero'
      }
      const msgs: string[] = []
      if (!/handler\s*\(\s*\)/.test(body)) {
        msgs.push(
          'the listener never calls `handler()` with NO argument — §5(b2): the push carries nothing, so the handler is called at ARITY ZERO and a rest-parameter handler must receive `[]`',
        )
      }
      for (const needle of ['payload', 'change', '.data', 'event.']) {
        if (body.includes(needle)) {
          msgs.push(`the listener reads a payload-ish member (\`${needle}\` appears in its body) — §5(b2) pins a listener that hands its handler NOTHING`)
        }
      }
      const on = /ipcRenderer\.on\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/.exec(body)
      const off = /removeListener\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/.exec(body)
      if (on === null) msgs.push(`the body carries no \`ipcRenderer.on(<channel>, <listener>)\` call — §4 pins EXACTLY ONE, on \`${PUSH_CHANNEL_NAME}\``)
      if (off === null) msgs.push('the body carries no `ipcRenderer.removeListener(<channel>, <listener>)` call — §4 pins the returned withdrawal')
      if (on !== null && off !== null) {
        if (String(on[1]).trim() !== PUSH_CHANNEL_NAME || String(off[1]).trim() !== PUSH_CHANNEL_NAME) {
          msgs.push(
            `the subscription/detach channels read ${show(String(on[1]).trim())} / ${show(String(off[1]).trim())}; both must be \`${PUSH_CHANNEL_NAME}\``,
          )
        }
        if (String(on[2]).trim() !== String(off[2]).trim()) {
          msgs.push(
            `\`removeListener\` removes ${show(String(off[2]).trim())} while \`on\` registered ${show(String(on[2]).trim())} — the SAME listener must be removed`,
          )
        }
      }
      return msgs.length > 0 ? msgs.join('; ') : null
    })

    // ── §4: **`read` INVOKES `DISPLAY_READ`** — and the reading is the READ member's own body, so an `invoke` belonging
    // ── to another sub-namespace cannot stand in for this one. The read answers the record's own reading or the DECLARED
    // ── `null`, and nothing throws (`record.ts:92-117`); the constant is a NAME here, never re-spelled (§5(d)).
    attempt(problems, 'b2·read-invoke', () => {
      const bridgeAt = code.indexOf('const bridge: ProvidentBridge = ')
      if (bridgeAt < 0) return 'no `const bridge: ProvidentBridge = { … }` literal resolves in `src/main/preload.ts` — the read member has no implementation'
      const bridgeOpen = code.indexOf('{', bridgeAt)
      const exposed = bridgeOpen < 0 ? null : bracedBlock(code, bridgeOpen)
      if (exposed === null) return 'the exposed bridge literal never closes — the `display` member cannot be located'
      const displayAt = new RegExp(`^ {2}display\\s*:`, 'm').exec(exposed)
      if (displayAt === null) return 'the exposed bridge literal carries no two-space `display:` KEY — §4 pins the member on `window.provident`'
      const displayOpen = exposed.indexOf('{', displayAt.index + displayAt[0].length - 1)
      const displayBlock = displayOpen < 0 ? null : bracedBlock(exposed, displayOpen)
      if (displayBlock === null) return 'the `display` member carries no object body — §4 pins exactly `{ read, onChanged }`'
      const readBody = memberSlice(displayBlock, 'read', 4)
      if (readBody === null) return 'the `display` member declares no `read` at the pinned four-space indent — §4 pins `DISPLAY_READ` behind it'
      if (!new RegExp(`\\binvoke\\s*\\(\\s*${READ_CHANNEL_NAME}\\b`).test(readBody)) {
        return `the \`read\` member never \`invoke(\`s the NAME \`${READ_CHANNEL_NAME}\` (its body reads ${show(readBody.replace(/\s+/g, ' ').trim().slice(0, 160))}) — §4: \`read\` invokes that channel and answers the record's own reading or the DECLARED \`null\``
      }
      // AND IT DOES NOT SPELL THE LITERAL: the name is imported from `store-channels.ts`, never re-typed (§5(d)).
      if (readBody.includes(PUSH_CHANNEL_LITERAL)) {
        return `the \`read\` member spells the push literal ${show(PUSH_CHANNEL_LITERAL)} — a read is not a signal, and §5(d) pins each literal to its one declaring site`
      }
      return null
    })

    expect(
      problems,
      '§5(b2)/§4 — the preload listener’s arity and the read route’s own invocation (docs/L1/unit-b-2-display-wire.md §5(b2), §4; a byte reading, because `preload.ts` imports `electron`)',
    ).toEqual([])
  })

  it('(b3) · THE FALSIFIER — a value pushed ACROSS THE BRIDGE cannot become the shape: the client’s reading equals the PORT’S read (§5(b3))', async () => {
    const problems: string[] = []
    const chain = buildChain(problems, '(b3)·forged-value')
    if (chain !== null) {
      const createDisplayClient = readFn(displayClientModule, 'createDisplayClient')
      if (createDisplayClient === null) {
        problems.push('(b3) · `createDisplayClient` does not resolve on the LANDED `src/renderer/display-client.js`')
      } else {
        ;(chain.record.commitTab as AnyFn)('tab-a', entryFor('doc-a'))
        // THE FORGED BRIDGE: `onChanged` hands its handler A VALUE — the one thing a real push never does.
        const registered: Array<(...args: unknown[]) => void> = []
        const forgedPort = {
          read: () => (chain.record.read as AnyFn).call(chain.record),
          onChanged: (handler: (...args: unknown[]) => void) => {
            registered.push(handler)
            return () => undefined
          },
        }
        const forged = { 'forged-tab': { documentId: 'forged-doc' } }
        const client = createDisplayClient(forgedPort) as AnyRecord
        const heard: unknown[] = []
        const subscription = (client.subscribe as AnyFn)((reading: unknown) => {
          heard.push(reading)
        }) as AnyRecord
        if (subscription.subscribed !== true) {
          problems.push(`(b3) · the client refused a port with both routes (reason ${show(subscription.reason)}) — the falsifier has no subject`)
        }
        await (client.fill as AnyFn)()
        if (registered.length !== 1) {
          problems.push(`(b3) · the port registered ${registered.length} listener(s); §5(h) pins ONE registration per subscription`)
        }
        for (const listener of registered) listener(forged, 'a-second-forged-value')
        await settle()

        const reading = (client.reading as AnyFn)() as AnyRecord | null
        const portReading = (chain.record.read as AnyFn).call(chain.record) as AnyRecord | null
        if (reading === null) {
          problems.push('(b3) · the client’s held reading is `null` after a value-carrying push — a pushed value neither becomes nor erases the shape')
        } else {
          if (show(reading) !== show(portReading)) {
            problems.push(
              `(b3) · the client holds ${show(reading)} while the port's own read answers ${show(portReading)} — §5(b3): a value pushed across the bridge must change NOTHING; the reading is the RE-READ's, never the pushed value`,
            )
          }
          if (reading['forged-tab'] !== undefined) {
            problems.push(
              `(b3) · the forged pushed value BECAME THE SHAPE (\`forged-tab\` is in the held reading) — this is \`RR-B2-1\`, the one live reading of D-23's payload this unit could create`,
            )
          }
        }
        const heardLast = heard.length > 0 ? heard[heard.length - 1] : null
        if (heard.length > 0 && show(heardLast) !== show(portReading)) {
          problems.push(`(b3) · the renderer's handler was handed ${show(heardLast)} — it must be handed the RE-READ's reading ${show(portReading)}, not the pushed value`)
        }
      }
    }

    expect(
      problems,
      '§5(b3) — the falsifier that must red if a value ever crosses (docs/L1/unit-b-2-display-wire.md §5(b3), RR-B2-1)',
    ).toEqual([])
  })

  it('(b4) · THE RENDERER’S OWN HANDLER RECEIVES THE RE-READ’S READING — the shape the store states AFTER the push, not the one before it (§5(b4))', async () => {
    const problems: string[] = []
    const chain = buildChain(problems, '(b4)·reread')
    if (chain !== null) {
      const createDisplayClient = readFn(displayClientModule, 'createDisplayClient')
      if (createDisplayClient === null) {
        problems.push('(b4) · `createDisplayClient` does not resolve on the LANDED `src/renderer/display-client.js`')
      } else {
        const client = createDisplayClient(portOver(chain)) as AnyRecord
        const received: unknown[] = []
        ;(client.subscribe as AnyFn)((reading: unknown) => {
          received.push(reading)
        })
        const before = (await (client.fill as AnyFn)()) as AnyRecord | null
        if (before !== null && before['tab-a'] !== undefined) {
          problems.push('(b4) · the client held `tab-a` BEFORE any write — the pre-push reading is not empty, so "the handler got the re-read" would be unmeasurable')
        }
        ;(chain.record.commitTab as AnyFn)('tab-a', entryFor('doc-a'))
        await settle()

        if (received.length !== 1) {
          problems.push(`(b4) · the handler was called ${received.length} time(s) for one write — §5(b4) pins one arrival per write`)
        } else {
          const handed = received[0] as AnyRecord | null
          const standing = (chain.record.read as AnyFn).call(chain.record) as AnyRecord | null
          if (handed === null || handed['tab-a'] === undefined) {
            problems.push(`(b4) · the handler was handed ${show(handed)} — §5(b4): the handler receives the RE-READ's reading, so the entry the write landed must be in it`)
          }
          if (show(handed) !== show(standing)) {
            problems.push(`(b4) · the handler was handed ${show(handed)} while the family stands at ${show(standing)} — the handler's reading is the RE-READ's`)
          }
        }
      }
    }

    expect(
      problems,
      '§5(b4) — the handler receives the re-read’s reading (docs/L1/unit-b-2-display-wire.md §5(b4))',
    ).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
// ARM `(c)` — THE CIVIL HALF: two entries written PRE-WINDOW, both read AFTER the flush (§5(c))
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

describe('display-crossing · arm (c) civil half — two pre-window writes are both read after the flush (§5(c))', () => {
  it('(c) · TWO ENTRIES WRITTEN PRE-WINDOW ARE BOTH READ AFTER THE FLUSH — the client’s first read answers both, in write order (§5(c))', async () => {
    const problems: string[] = []
    const chain = buildChain(problems, '(c)·civil')
    if (chain !== null) {
      // PRE-WINDOW: no realm stands yet. Both writes land and their pushes are the creation's evidence, not a arrival.
      const firstAnswer = (chain.record.commitTab as AnyFn)('tab-a', entryFor('doc-a')) as AnyRecord
      const secondAnswer = (chain.record.commitTab as AnyFn)('tab-b', entryFor('doc-b')) as AnyRecord
      if (firstAnswer.ok !== true || secondAnswer.ok !== true) {
        problems.push(`(c) · a pre-window write was REFUSED (${show(firstAnswer)} / ${show(secondAnswer)}) — §5(c) writes two entries before the realm stands`)
      }
      const leaves: string[][] = [chain.leafOf('tab-a'), chain.leafOf('tab-b')]
      const delivered = chain.sentAddresses.map((address) => JSON.stringify(address))
      const inOrder = leaves.map((leaf) => JSON.stringify(leaf)).filter((leaf) => delivered.includes(leaf))
      if (inOrder.length !== leaves.length) {
        problems.push(
          `(c) · the delivery carried [${chain.sentAddresses.map((a) => show(a)).join(', ')}] and §5(c)'s two pre-window leaves [${leaves.map((a) => show(a)).join(', ')}] are not all in it — a pre-window write whose delivery never fired is a fact the flush cannot save`,
        )
      }

      // THE FLUSH: a realm arrives, subscribes and reads ONCE. That single read must answer BOTH entries.
      const createDisplayClient = readFn(displayClientModule, 'createDisplayClient')
      if (createDisplayClient === null) {
        problems.push('(c) · `createDisplayClient` does not resolve on the LANDED `src/renderer/display-client.js`')
      } else {
        const client = createDisplayClient(portOver(chain)) as AnyRecord
        const subscription = (client.subscribe as AnyFn)(() => undefined) as AnyRecord
        if (subscription.subscribed !== true) {
          problems.push(`(c) · the post-flush subscription was refused (reason ${show(subscription.reason)})`)
        }
        const read = (await (client.fill as AnyFn)()) as AnyRecord | null
        if (read === null) {
          problems.push('(c) · the post-flush read answered `null` — the two entries written pre-window are unreadable')
        } else {
          for (const tabId of ['tab-a', 'tab-b']) {
            if (read[tabId] === undefined) {
              problems.push(`(c) · the post-flush read ${show(read)} does not carry \`${tabId}\` — both entries written pre-window must be read after the flush`)
            }
          }
          const order = Object.keys(read)
          const wanted = ['tab-a', 'tab-b'].filter((tabId) => order.includes(tabId))
          const observed = order.filter((key) => wanted.includes(key))
          if (observed.join(',') !== wanted.join(',')) {
            problems.push(`(c) · the read answers its entries in [${observed.join(', ')}] while they were written [${wanted.join(', ')}] — the family is an insertion-ordered record and the reading keeps the write order`)
          }
        }
      }
    }

    expect(
      problems,
      '§5(c) civil half — two pre-window writes, both read after the flush (docs/L1/unit-b-2-display-wire.md §5(c))',
    ).toEqual([])
  })
})
