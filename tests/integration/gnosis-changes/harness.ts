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
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ENGINE_ENDPOINTS, ENGINE_ORIGIN_STORE, parseSseFrame } from '../../../src/main/engine-rag-store.js'
import type { SseClient } from '../../../src/main/engine-rag-store.js'
import { createJsonRagStore } from '../../../src/main/rag-store.js'
import type { BatchOp, RagStore } from '../../../src/main/rag-store.js'
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

// ===========================================================================
// UNIT `B-4a` `engine-store-mirror` — the additions that unit's rows need
// (`docs/L1/unit-b-4a-engine-store-mirror.md` §3/§6, `docs/L2/gnosis-changes/engine-mirror.md` §2/§5/§7).
//
// NOTHING ABOVE THIS LINE MOVED: `B-4`'s rows (`c9`, `c1`, `c2`, `c3`, `c5`, `c6`, `c7`, `c8`, `c11`) keep the doubles, the frame
// builders and the comment stripper they were authored against, so the two units cannot drift apart by sharing a file.
//
// WHAT IS ADDED, AND WHY EACH IS SHARED RATHER THAN PER-FILE:
//   (1) `loadMirrorModule()` / `constructMirror()` — `src/main/engine-mirror.ts` is B-4a's NEW file, so at the red head it does
//       not resolve. A missing module or a missing member is a NAMED problem inside the calling row's aggregate assertion —
//       never an ESM link error, never a `skip`, never a raw `TypeError` (the `loadChangesModule` rule, verbatim).
//   (2) `newRagStore()` / `storeCounts()` / `markedRoots()` / `localDocOps()` — ONE store fixture over a `mkdtempSync` `/tmp`
//       path (the `tests/batch-atomicity.test.ts:55-60` idiom) and the `markdown-parse.ts:557-607` LOCAL document shape, so
//       `M5`'s collision arm and `G2`'s survival arm read the SAME seeding.
//   (3) `crudTransport()` — the `EngineCrudRagStoreOptions.fetch` SEAM (`src/main/engine-crud-rag-store.ts:66`), the ONE
//       network-shaped injection this unit's rows use. It TYPES a `typeof fetch` double and its responder returns a real
//       `new Response(...)`; the rows never call a fetch of their own and never open a socket (§9 `C3`'s named exception).
//   (4) `emptyRead()` / `structuralDescriptor()` — the two descriptor/read literals every limb row would otherwise respell.
// ===========================================================================

/**
 * A repo-relative text read that NEVER throws: a missing substrate becomes a NAMED problem in the calling row's aggregate
 * (`src/main/engine-mirror.ts` does not exist at the red head, and a `C`-row over a missing file must say so, not explode).
 */
export function readTextOrProblem(relativePath: string, problems: string[]): string {
  try {
    return readText(relativePath)
  } catch (err) {
    problems.push(`\`${relativePath}\` could not be read (${err instanceof Error ? err.message : String(err)})`)
    return ''
  }
}

// ---------------------------------------------------------------------------
// (1) THE MIRROR'S SURFACE, DECLARED HERE AND NOT IMPORTED.
//
// §2's four members and its ten-key status are DECLARED in this file rather than imported from `src/main/engine-mirror.ts`,
// for the reason `consumer-frames.test.ts` declares `Feed`: a static `import type` of a module that does not exist yet is an
// ESM link error, i.e. the red would be a broken suite instead of a NAMED absence. A member that drifts from this shape still
// reds, because every row DRIVES the member and reads its answer.
// ---------------------------------------------------------------------------

export interface MirrorDocument {
  documentId: string
  title: string
  tags?: string[]
  updatedAt?: string
}

export type MirrorWrite = { kind: 'upsert'; document: MirrorDocument } | { kind: 'remove'; documentId: string }

export interface MirrorReadAnswer {
  documents: MirrorDocument[]
  complete: boolean
}

/** §2's CLOSED count set — exactly these ten keys, `lastFailure` a typed string or `null`. */
export interface MirrorStatusShape {
  projections: number
  accepted: number
  projected: number
  unchanged: number
  removed: number
  refused: number
  unresolved: number
  failed: number
  walks: number
  lastFailure: string | null
}

export interface MirrorHandle {
  accepted(write: MirrorWrite): Promise<void>
  settle(descriptor: RagStoreChangedPayload): Promise<void>
  reconcile(): Promise<RagStoreChangedPayload>
  status(): MirrorStatusShape
}

export type MirrorFactory = (opts: unknown) => unknown

export interface MirrorModule {
  createEngineMirror: MirrorFactory | null
  problems: string[]
}

/** `src/main/engine-mirror.ts` is B-4a's NEW file — absent at the red head is a NAMED absence, never a skip. */
export async function loadMirrorModule(): Promise<MirrorModule> {
  const file = 'src/main/engine-mirror.ts'
  let mod: Record<string, unknown> | null = null
  let why = 'no reason captured'
  try {
    mod = (await import('../../../src/main/engine-mirror.js')) as Record<string, unknown>
  } catch (err) {
    why = err instanceof Error ? (err.message.split('\n')[0] ?? err.message) : String(err)
  }
  if (mod === null) {
    return {
      createEngineMirror: null,
      problems: [
        `\`${file}\` does not resolve as a module at this head (${why}) — §2's NEW file is the unit's own subject, so every ` +
          `reading below it has a NAMED absence rather than a silent zero`,
      ],
    }
  }
  const factory = mod['createEngineMirror']
  const problems: string[] = []
  if (typeof factory !== 'function') {
    problems.push(`\`${file}\` exports no callable \`createEngineMirror\` (found ${shown(factory)}) — §2's ONE runtime export`)
  }
  return { createEngineMirror: typeof factory === 'function' ? (factory as MirrorFactory) : null, problems }
}

/** The four members §2 declares. A handle that is not one is a NAMED problem, never `undefined.accepted(...)`. */
export const MIRROR_MEMBERS = ['accepted', 'settle', 'reconcile', 'status'] as const

/**
 * Construct the mirror and VALIDATE its four members. Construction is INERT by contract (contract §4's last clause), so a
 * throw here is a fault of the factory, never of the call site — and it is REPORTED, not swallowed.
 */
export function constructMirror(factory: MirrorFactory | null, opts: unknown, problems: string[]): MirrorHandle | null {
  if (factory === null) return null
  let handle: unknown
  try {
    handle = factory(opts)
  } catch (err) {
    problems.push(
      `\`createEngineMirror(opts)\` THREW (${err instanceof Error ? err.message : String(err)}) — §4: construction is INERT and total`,
    )
    return null
  }
  if (handle === null || typeof handle !== 'object') {
    problems.push(`\`createEngineMirror(opts)\` answered ${shown(handle)} — §2 requires the four-member handle`)
    return null
  }
  const members = handle as Record<string, unknown>
  const missing = MIRROR_MEMBERS.filter((name) => typeof members[name] !== 'function')
  if (missing.length > 0) {
    problems.push(`the handle has no callable ${missing.map((n) => `\`${n}\``).join(', ')} — §2 declares exactly four members`)
    return null
  }
  return handle as MirrorHandle
}

// ---------------------------------------------------------------------------
// (2) THE STORE FIXTURE — a real `createJsonRagStore` on a `mkdtempSync` `/tmp` path.
// ---------------------------------------------------------------------------

export interface RagStoreFixture {
  store: RagStore
  dir: string
  file: string
}

/** The `tests/batch-atomicity.test.ts:55-60` idiom, unchanged: a fresh directory per row, the store's own file inside it. */
export function newRagStore(): RagStoreFixture {
  const dir = mkdtempSync(join(tmpdir(), 'provident-b4a-mirror-'))
  const file = join(dir, 'rag.json')
  return { store: createJsonRagStore({ path: file }), dir, file }
}

/** The three counts every "nothing moved" limb reads, in one call so no row can compare two of the three. */
export function storeCounts(store: RagStore): { nodes: number; edges: number; journal: number } {
  return { nodes: store.listNodes().length, edges: store.listEdges().length, journal: store.journal().length }
}

/** The MARKED roots the store holds NOW — §2's `projections`, read from the store and not from bookkeeping (ASM-L2-M3). */
export function markedRoots(store: RagStore): string[] {
  return store
    .listNodes()
    .filter((node) => node.props !== undefined && node.props['data-engine-mirror'] === true)
    .map((node) => node.id)
}

/** The fixed stamp the projection mints when the engine answers no `updatedAt` — clock-free, so equality can hold (`M2`). */
export const EPOCH = '1970-01-01T00:00:00.000Z'

/**
 * A LOCAL document in the `markdown-parse.ts:557-607` shape: a `div` root with NO engine marker, an `h1` head carrying
 * `data-doc-head`, and ONE `doc-head` edge. The ids are deliberately NOT the mirror's derived ones (`<id>:engine-head` /
 * `doc-head:<id>`) so a projection can never masquerade as the local record `M5` seeds.
 */
export function localDocOps(documentId: string, title: string): BatchOp[] {
  const headId = `${documentId}:section:1`
  return [
    {
      op: 'putNode',
      node: { id: documentId, type: 'div', content: '', ownedNodeIds: [headId], createdAt: EPOCH, updatedAt: EPOCH },
    },
    {
      op: 'putNode',
      node: {
        id: headId,
        type: 'h1',
        content: title,
        props: { 'data-doc-head': true },
        ownedNodeIds: [],
        createdAt: EPOCH,
        updatedAt: EPOCH,
      },
    },
    {
      op: 'putEdge',
      edge: {
        id: `${documentId}:local-doc-head`,
        kind: 'doc-head',
        source: headId,
        target: documentId,
        documentIds: [documentId],
        createdAt: EPOCH,
        updatedAt: EPOCH,
      },
    },
  ]
}

// ---------------------------------------------------------------------------
// (3) THE CRUD TRANSPORT DOUBLE — the `EngineCrudRagStoreOptions.fetch` seam (`src/main/engine-crud-rag-store.ts:66`).
//
// THIS FILE'S ONE NETWORK-SHAPED EXCEPTION, NAMED SO IT IS NOT MISTAKEN FOR A SOCKET: `crudTransport()` TYPES a `typeof fetch`
// double and its responder answers a real `new Response(...)`. NO row of this unit ever calls a fetch of its own, opens a
// socket, spawns an engine or reads a port — `C3` scans exactly that, and names this exception.
// ---------------------------------------------------------------------------

/** The READY health report the engine-status gate decodes (`decodeHealthReport`, `src/main/engine-rag-store.ts`). */
export const READY_REPORT: Record<string, unknown> = {
  schemaVersion: 1,
  idFormat: 'opaque-string-v1',
  state: 'Ready',
  version: '0.1.0-harness-double',
  subsystems: { store: true, graph: true, lexical: true, vector: true, embedding: true, reranker: true },
  lastError: null,
}

/** The serde-frozen `Document` the engine answers with, snake_case, exactly the keys `decodeDocument` requires. */
export const DOCUMENT_WIRE: Record<string, unknown> = {
  document_id: 'd1',
  wiki_id: 'w1',
  revision: 0,
  state: 'Draft',
  graph: { nodes: [], edges: [] },
  title: 'Getting Started',
  created_at: '2026-09-09T00:00:00Z',
  updated_at: '2026-09-09T00:00:00Z',
  tags: ['guide'],
  author: 'alice',
}

export function documentWire(over: Record<string, unknown> = {}): Record<string, unknown> {
  return { ...DOCUMENT_WIRE, ...over }
}

/** The full versioned envelope every engine answer rides (`decodeEnvelope`, `src/main/engine-rag-store.ts:332`). */
export function crudEnvelope(payload: unknown): unknown {
  return { schemaVersion: 1, idFormat: 'opaque-string-v1', payload }
}

/** A `{method, result}` CRUD payload (the shape `decodeCrudResponse` reads). */
export function crudResultPayload(method: string, result: unknown): unknown {
  return { method, result }
}

/** A `{method, error}` CRUD payload — the REFUSAL arm (`wireCodeToError`, `engine-rag-store.ts:149-162`). */
export function crudErrorPayload(method: string, code: string, message: string): unknown {
  return { method, error: { code, message } }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

/** One captured CRUD request: the verb, the full URL and the parsed request envelope body. */
export interface CrudCall {
  method: string
  url: string
  body: unknown
}

/** The responder's contract: answer the CRUD call, or `undefined` to fall through to a typed refusal. */
export type CrudResponder = (method: string, url: string, body: unknown) => Response | undefined

/**
 * A `typeof fetch` double over the CRUD seam. It answers the READY gate (`GET /engine/status`) ITSELF — every mutating method
 * issues that gate first (`crudCall`, `engine-crud-rag-store.ts:697-706`) — and hands every OTHER request to the caller's
 * responder, recording it in `calls`. An unanswered route is a typed `unavailable` error payload, never a hang and never a raw
 * throw out of the double.
 */
export function crudTransport(respond: CrudResponder, calls: CrudCall[] = []): typeof fetch {
  const transport = (async (input: any, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : String((input as { url?: string })?.url ?? input)
    const method = String(init?.method ?? 'GET').toUpperCase()
    if (method === 'GET' && url.endsWith(ENGINE_ENDPOINTS.engineStatus)) return jsonResponse(READY_REPORT)
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined
    calls.push({ method, url, body })
    const answer = respond(method, url, body)
    return answer ?? jsonResponse(crudEnvelope(crudErrorPayload('unavailable', 'engine_unavailable', `no double answers ${method} ${url}`)))
  }) as unknown as typeof fetch
  return transport
}

// ---------------------------------------------------------------------------
// (4) THE TWO LITERALS every limb row would otherwise respell.
// ---------------------------------------------------------------------------

/** The empty, COMPLETE read — a walk that saw nothing and knows it saw everything. */
export function emptyRead(): MirrorReadAnswer {
  return { documents: [], complete: true }
}

/** An engine-origin `structural` descriptor — the ONLY shape that demands a walk (§3/§4, `G4`). */
export function structuralDescriptor(over: Record<string, unknown> = {}): RagStoreChangedPayload {
  return { kind: 'structural', nodeIds: ['doc-a'], edgeIds: [], store: ENGINE_ORIGIN_STORE, ...over } as RagStoreChangedPayload
}
