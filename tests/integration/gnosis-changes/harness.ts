// tests/integration/gnosis-changes/harness.ts — the SHARED, NON-COLLECTED harness for unit `B-4` `engine-changes`'s rows
// (`docs/L1/unit-b-4-engine-changes.md` §2, `docs/L2/gnosis-changes/engine-changes.md` §2/§7). Vitest collects
// `tests/**/*.test.ts` only, so this module is IMPORTED, never run as a suite of its own; the UNIT rows import it too, and
// that is deliberate — one double, one frame builder, one comment-stripper, so the two suites cannot drift apart.
//
// THE DOUBLE IS THE `EngineRagStoreOptions.sse` SEAM AND NOTHING ELSE (`src/main/engine-rag-store.ts:299`): `SseClient` is
// the fork's ONE injectable stream interface (`:194-203`), the consumer takes it through `opts.sse` (contract §2), and NO row
// in either suite opens a socket, spawns an engine, or reads a port. **There is no network in this file and none in its
// callers** — the live arm is PARKED (`docs/L2/gnosis-changes/engine-changes.md` §6) and no row here claims an engine event.
//
// FRAMES GO THROUGH THE REAL PARSER: `frame()`/`raw()` build `event: …\ndata: …\n\n` and hand it to `parseSseFrame`
// (`src/main/engine-rag-store.ts:719-746`) before calling the consumer's `onEvent`, so a row that drives a frame drives the
// same `(event, data)` pair the shipped `createSseClient` produces (`:818-823`) rather than a shape invented here.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { parseSseFrame } from '../../../src/main/engine-rag-store.js'
import type { SseClient } from '../../../src/main/engine-rag-store.js'
import type { RagStoreChangedPayload } from '../../../src/shared/types.js'

/** The repo root, derived from THIS file's own URL — never an absolute literal. */
export const ROOT = fileURLToPath(new URL('../../../', import.meta.url))

/** A repo-relative text read. A missing substrate THROWS (ENOENT), so a row reports it instead of skipping. */
export const readText = (relativePath: string): string => readFileSync(`${ROOT}${relativePath}`, 'utf8')

/** A value as a failure message prints it (never a raw `[object Object]`). */
export const shown = (value: unknown): string => {
  if (value === undefined) return '(absent)'
  try {
    const json = JSON.stringify(value)
    return json === undefined ? String(value) : json
  } catch {
    return String(value)
  }
}

/**
 * Comments stripped, strings left alone: the source-clause reader every `c6`/`c7`/`c9`/`c11` limb uses. The `[^:]` guard is
 * load-bearing — without it `'http://…'` inside a string loses its tail and the very needle `c6` looks for disappears.
 */
export function stripComments(text: string): string {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('//'))
    .map((line) => line.replace(/(^|[^:])\/\/.*$/, '$1'))
    .join('\n')
}

/** Count non-overlapping occurrences of a needle in a text. */
export function occurrences(text: string, needle: string): number {
  if (needle === '') return 0
  return text.split(needle).length - 1
}

// ---------------------------------------------------------------------------
// THE `SseClient` DOUBLE — the ONLY stream this unit's rows ever open.
// ---------------------------------------------------------------------------

export interface SseHandlers {
  onEvent: (event: string, data: string) => void
  onError: (err: unknown) => void
  onClose: () => void
}

export interface SseSubscription {
  readonly url: string
  readonly handlers: SseHandlers
  closed: boolean
}

/**
 * A RECORDING `SseClient`. Every `subscribe` is kept (with its URL and its handlers) so a row can read `calls`, assert that a
 * refusal happened BEFORE any subscription, or emit into a RETIRED connection on purpose. `throwOnSubscribe` drives the
 * synchronous-throw arm (`c8`) — one shot, then disarmed.
 */
export class SseFrameDouble implements SseClient {
  readonly subscriptions: SseSubscription[] = []
  throwOnSubscribe: unknown = undefined

  subscribe(url: string, handlers: SseHandlers): { close(): void } {
    const subscription: SseSubscription = { url, handlers, closed: false }
    this.subscriptions.push(subscription)
    if (this.throwOnSubscribe !== undefined) {
      const err = this.throwOnSubscribe
      this.throwOnSubscribe = undefined
      throw err
    }
    return {
      close: () => {
        subscription.closed = true
      },
    }
  }

  get calls(): number {
    return this.subscriptions.length
  }

  get urls(): string[] {
    return this.subscriptions.map((s) => s.url)
  }

  get open(): SseSubscription[] {
    return this.subscriptions.filter((s) => !s.closed)
  }

  at(index: number): SseSubscription | undefined {
    return this.subscriptions[index]
  }

  get last(): SseSubscription | undefined {
    return this.subscriptions[this.subscriptions.length - 1]
  }

  /** Emit one REAL frame (`event:` + one `data:` line + the terminal blank line), parsed by `parseSseFrame` first. */
  frame(event: string, body: unknown, index = this.subscriptions.length - 1): void {
    const parsed = parseSseFrame(`event: ${event}\ndata: ${JSON.stringify(body)}\n\n`)
    this.subscriptions[index]?.handlers.onEvent(parsed.event, parsed.data)
  }

  /** Emit a frame whose DATA LINE is the caller's own text (malformed JSON, a wrong label, a hostile body). */
  raw(event: string, data: string, index = this.subscriptions.length - 1): void {
    const parsed = parseSseFrame(`event: ${event}\ndata: ${data}\n\n`)
    this.subscriptions[index]?.handlers.onEvent(parsed.event, parsed.data)
  }

  fail(err: unknown, index = this.subscriptions.length - 1): void {
    this.subscriptions[index]?.handlers.onError(err)
  }

  end(index = this.subscriptions.length - 1): void {
    this.subscriptions[index]?.handlers.onClose()
  }
}

// ---------------------------------------------------------------------------
// The module loader — REACHABILITY, NOT FATALITY.
// ---------------------------------------------------------------------------

export type FeedFactory = (opts: unknown) => unknown
export type FrameMapper = (body: unknown) => unknown

export interface ChangesModule {
  createEngineChangesFeed: FeedFactory | null
  changeFrameToPayload: FrameMapper | null
  problems: string[]
}

/**
 * `src/main/engine-changes.ts` is this unit's NEW file, so at the red head it does not resolve. A missing module or a missing
 * member becomes a NAMED problem inside the calling row's aggregate assertion — never an ESM link error, never a `skip`,
 * never a raw `TypeError` (the `tests/integration/shell-chrome/pane-links.test.ts` reachability rule).
 */
export async function loadChangesModule(): Promise<ChangesModule> {
  const file = 'src/main/engine-changes.ts'
  let mod: Record<string, unknown> | null = null
  let why = 'no reason captured'
  try {
    mod = (await import('../../../src/main/engine-changes.js')) as Record<string, unknown>
  } catch (err) {
    why = err instanceof Error ? (err.message.split('\n')[0] ?? err.message) : String(err)
  }
  if (mod === null) {
    return {
      createEngineChangesFeed: null,
      changeFrameToPayload: null,
      problems: [
        `\`${file}\` does not resolve as a module at this head (${why}) — §2's NEW file is the change set's own subject, so ` +
          `every reading below it has a NAMED absence rather than a silent zero`,
      ],
    }
  }
  const problems: string[] = []
  const factory = mod['createEngineChangesFeed']
  if (typeof factory !== 'function') {
    problems.push(`\`${file}\` exports no callable \`createEngineChangesFeed\` (found ${shown(factory)}) — §2's feed factory`)
  }
  const mapper = mod['changeFrameToPayload']
  if (typeof mapper !== 'function') {
    problems.push(`\`${file}\` exports no callable \`changeFrameToPayload\` (found ${shown(mapper)}) — §2's PURE mapping`)
  }
  return {
    createEngineChangesFeed: typeof factory === 'function' ? (factory as FeedFactory) : null,
    changeFrameToPayload: typeof mapper === 'function' ? (mapper as FrameMapper) : null,
    problems,
  }
}

// ---------------------------------------------------------------------------
// The frame vocabulary the ENGINE actually sends (`READ` `../Gnosis/src/bin/gnosis_server.rs:936-950`, `:983-986`).
// ---------------------------------------------------------------------------

/** A six-term edge identity — the engine's canonical JSON-array string, `READ` `u4-cursor-paged-reads.md:542-548`. */
export const EDGE_ID = '["doc-a","n1","doc-b","n2","Link",null]'

/** The exact seven-key `change` body (`gnosis_server.rs:937-945`). `over` changes ONE reading, never the shape. */
export function changeFrame(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    type: 'change',
    cursor: '1',
    wikiId: 'w1',
    kind: 'create_document',
    nodeIds: [],
    edgeIds: [],
    timestamp: '2026-11-18T00:00:00Z',
    ...over,
  }
}

/** The cursor-first position announcement (`gnosis_server.rs:983-986`). */
export function cursorFrame(cursor: string): Record<string, unknown> {
  return { type: 'cursor', cursor }
}

/** The sink recorder — the descriptor stream in ORDER, which is what `c5`'s re-read row reads. */
export interface RecordingSink {
  readonly calls: RagStoreChangedPayload[]
  readonly sink: (descriptor: RagStoreChangedPayload) => void
  /** The descriptors whose `nodeIds` include this id (so the reconcile answer and a change frame cannot be confused). */
  named(nodeId: string): RagStoreChangedPayload[]
}

export function recordingSink(): RecordingSink {
  const calls: RagStoreChangedPayload[] = []
  return {
    calls,
    sink: (descriptor: RagStoreChangedPayload) => {
      calls.push(descriptor)
    },
    named: (nodeId: string) => calls.filter((d) => Array.isArray(d.nodeIds) && d.nodeIds.includes(nodeId)),
  }
}

/** The re-read's answer — a DESCRIPTOR with a `reconciled` marker, so its place in the sink's order is readable. */
export function reconciledPayload(): RagStoreChangedPayload {
  return { kind: 'structural', nodeIds: ['reconciled'], edgeIds: [], store: 'gnosis:engine' }
}

/**
 * LET THE CONNECTION SETTLE: one macrotask, so every pending microtask (the announcement's `reconcile()` and the drain of the
 * frames it held) has run before a row reads the sink or the census.
 *
 * WHY THIS EXISTS AND WHY IT IS A TEST-ONLY SEAM: under `ASM-B4-5` the re-read is started BY the announcement and its answer
 * must reach the sink BEFORE any `change` frame of that connection is applied — so frames that arrive while the answer is in
 * flight are HELD, and a row that drove them and read its counters in the same tick would read the hold rather than the
 * judgement. `src/` ships no timer and no queue (`c7(b)`'s source clause still reads 0); this is the READER's tick, nothing
 * more. A row that omits it is not wrong about the module — it is wrong about WHEN the module answers.
 */
export function settled(): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0)
  })
}

/** The announcement, driven as ONE real `cursor` frame — the ONLY thing that starts a connection's re-read (`ASM-B4-5`). */
export function announceAt(double: SseFrameDouble, cursor: string, index = double.subscriptions.length - 1): void {
  double.frame('cursor', cursorFrame(cursor), index)
}

/** The loopback base url every row uses; `c6` is the ONLY row that varies it. */
export const BASE_URL = 'http://127.0.0.1:8080'
