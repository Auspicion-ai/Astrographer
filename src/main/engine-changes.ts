// src/main/engine-changes.ts — Unit `B-4` `engine-changes`: THE FORK'S CONSUMER OF THE ENGINE'S CHANGE FEED (`GET /changes`).
// Contract: `docs/L1/unit-b-4-engine-changes.md` §2 (this file), §2.1 the two frame families, §2.2 the mapping, §2.3 cursor
// de-dup, §2.4 reconnect-by-re-read (`ASM-B-4`), §2.5 no retry; the module design is `docs/L3/gnosis-changes/engine-changes.md`
// and the I/O surface is `docs/L2/gnosis-changes/engine-changes.md` §2.
//
// THE ENGINE'S OWN SHAPE, READ AT THE ADJACENT CHECKOUT AND NOT ASSUMED (`../Gnosis`, never written):
//   · the route is `/changes` (`src/bin/gnosis_server.rs:1056`); the handler sends a CURSOR-FIRST frame then one `change` frame
//     per committed journal entry with the connection held open (`:970-1040`, cursor frame `:983-986`, `change_frame` `:936-950`);
//   · `cursor` is `entry.seq.to_string()` — a DECIMAL STRING over a `u64` (`:939`); `wikiId` is NULLABLE (`:940`); `nodeIds` are
//     the entry's node-id strings (`:942`); `edgeIds` are the SIX-TERM canonical JSON-array strings (`:943`, encoding pinned at
//     `../Gnosis/docs/specs/u4-cursor-paged-reads.md:542-548`); `timestamp` is an ISO-8601 string (`../Gnosis/src/store/mod.rs:1094-1095`);
//   · `kind` is the entry's own `op` literal (`../Gnosis/src/store/mod.rs:1085-1091`) from a CLOSED TWENTY-token set
//     (`u4-cursor-paged-reads.md:512-517`), and a consumer MUST tolerate an unknown token — never drop the frame, never fail the
//     stream (`:521-524`);
//   · there is NO keep-alive, NO `done` and NO coalescing in the 100 ms poll loop (`:930`, `:1005-1032`), the media type is
//     `text/event-stream` exactly (`:1035-1039`), and **the feed has no request-side cursor** (`:972-976`, verbatim) — which is
//     why a reconnect is a RE-READ here and never a delta claim (§2.4).
//   · **AND THE RE-READ IS ANCHORED TO THE ANNOUNCEMENT (`ASM-B4-5`, §2.4):** `:977` reads the head, `:983-996` frames that head
//     WITH the retained window `(floor, head]` in ONE body, and `:1005-1032` frames every later commit. So a re-read that ran
//     BEFORE the subscription would be blind to exactly the commits that land between its own read and `:977` — they are `<=`
//     the head (and §2.3 drops their window frame) and absent from the re-read's answer: a silent gap. The order here is
//     therefore per connect: `subscribe` FIRST → the announcement records the head AND STARTS `reconcile()` → no `change` frame
//     is applied until that answer has reached the sink → then §2.3 judges every frame against that head.
//
// THE FORK'S VOCABULARY IS FIXED AND THIS FILE DOES NOT WIDEN IT: `RagStoreChangedPayload` is `{kind:'content'|'structural',
// nodeIds: string[], edgeIds: string[], store: string}` (`src/shared/types.ts:415-421`), re-exported beside the engine surface
// (`src/main/engine-rag-store.ts`, the `src/main/preload.ts:33-36` pattern). The mapping FITS that four-member shape; a fifth key
// is a contract breach, and out of this unit's write scope by construction (`src/shared/types.ts` is FORBIDDEN to it).
//
// AND §2.2 IS TWO LIMBS IN ONE ORDER (`F-13`, the L1 contract's own amendment): the FRAME decides FIRST — a non-empty `edgeIds` is
// `structural` whatever the token, which is the same condition the fork's reconciler takes its FULL path on
// (`src/renderer/content-reconcile.ts:374-375`, `:566`) — and the TOKEN decides the remainder (`content` only for `update_fact`
// and `update_community_summary`; everything else, and every UNKNOWN token, `structural`).
//
// AND THE WATERMARK IS PER CONNECTION (`F-11`): `change_cursor()` is `epoch().to_string()` (`../Gnosis/src/store/mod.rs:2400-2413`)
// and reads `"0"` on a fresh store, so a reconnect after an engine restart ANNOUNCES LOWER than the retired connection. The
// watermark therefore lives on the connection (§2.3) and is re-established by each announcement; only within one connection is it
// monotonic, and only a connection's own head licenses §2.3's "the re-read covers it" drop.
//
// AND IT IS PURE OF THE HOST: no Electron, no DOM, no filesystem, no `fetch`, no URL, no header, no loopback rule, NO TIMER. The
// socket is `engine-transport.ts`'s `subscribeEngineStream`, the stream client is the fork's ONE SSE opener reached through that
// seam, and a drop is a TYPED, TERMINAL answer (§2.5 — `D-82` clause 4's discipline): no poll, no retry, no backoff, no
// auto-reconnect, no second connection.
import type { SseClient } from './engine-rag-store.js'
import {
  ENGINE_ENDPOINTS,
  ENGINE_ORIGIN_STORE,
  EngineUnavailable,
  type RagStoreChangedPayload,
} from './engine-rag-store.js'
import { subscribeEngineStream } from './engine-transport.js'

// ---------------------------------------------------------------------------
// §2.2 — THE KIND TABLE (one table, one mapper; a token cannot be known to one caller and unknown to the other).
// ---------------------------------------------------------------------------

/** THE TWO TOKENS THAT CLAIM `content` (`F-13`, the L1 contract's amended §2.2): only the appended ops that rewrite node TEXT and
 *  move no graph shape. `update_document` REPLACES the document's graph and can write `link`/`embed`/`crosslink` edges
 *  (`../Gnosis/src/store/mod.rs:3604-3634`) and `re_sync_embed` flips an embed edge's `state` (`:5733-5830`), so both are
 *  `structural` — the old criterion ("rewrites node TEXT and moves no graph shape") is FALSE for them. */
const CONTENT_KINDS: readonly string[] = Object.freeze(['update_fact', 'update_community_summary'])

/** The other EIGHTEEN tokens of the engine's closed set (`u4-cursor-paged-reads.md:512-517`): the graph moved. */
const STRUCTURAL_KINDS: readonly string[] = Object.freeze([
  'update_document',
  're_sync_embed',
  'create_document',
  'delete_document',
  'publish_document',
  'unpublish_document',
  'archive_document',
  'create_wiki',
  'add_triple',
  'declare_community',
  'set_reference_state',
  'resolve_entities',
  'merge_facts',
  'create_fact',
  'propose_candidate_fact',
  're_derive_community',
  'propagate_fact_staleness',
  'propagate_archived_target',
])

const KIND_TABLE: ReadonlyMap<string, 'content' | 'structural'> = new Map<string, 'content' | 'structural'>([
  ...CONTENT_KINDS.map((token) => [token, 'content'] as [string, 'content']),
  ...STRUCTURAL_KINDS.map((token) => [token, 'structural'] as [string, 'structural']),
])

/** The frame's EXACT seven-key set (`u4-cursor-paged-reads.md:505-510`: "a frame carries these and only these keys — no additive
 *  key, no missing key"). */
const FRAME_KEYS: readonly string[] = Object.freeze(['type', 'cursor', 'wikiId', 'kind', 'nodeIds', 'edgeIds', 'timestamp'])

/** The cursor-first announcement's EXACT key set (`gnosis_server.rs:983-986`). §2.1 admits no more a missing/extra key on the
 *  position family than on the change family, so an additive key here is a refusal too (it is measured by an adversarial row —
 *  a parser that tolerated one would be the ONE place this module accepted a shape the engine never sends). */
const CURSOR_FRAME_KEYS: readonly string[] = Object.freeze(['type', 'cursor'])

/** The canonical decimal (`u64` rendered by `to_string`, `gnosis_server.rs:939`): no leading zeros, no sign, no fraction. */
const CURSOR_TOKEN: RegExp = /^(0|[1-9][0-9]*)$/

/** The engine's cursor type is a `u64` (`../Gnosis/src/store/mod.rs:1084`), so a decimal that does not FIT one is not a cursor it
 *  could have printed — and accepting it would put `Infinity` on `status().position` for a 400-digit frame. */
const CURSOR_MAX: bigint = 18446744073709551615n

/** A `change` frame that violates the discipline. NEVER a descriptor, NEVER a stream teardown (§2.1) — the frame is counted as a
 *  refusal by the consumer and the subscription stands. */
class ChangeFrameRefusal extends Error {
  constructor(
    readonly reason: string,
    message: string,
  ) {
    super(`change frame refused (${reason}): ${message}`)
    this.name = 'ChangeFrameRefusal'
  }
}

const isFrameBody = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** The canonical decimal AND inside the engine's own `u64` range. A 401-digit token is refused rather than coerced to `Infinity`
 *  on the status surface (measured by `tests/integration/gnosis-changes/adversarial.test.ts` `a10`). */
function isCursorToken(value: unknown): value is string {
  if (typeof value !== 'string' || !CURSOR_TOKEN.test(value)) return false
  return BigInt(value) <= CURSOR_MAX
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((element) => typeof element === 'string')

/** The exact key set, BOTH directions: an additive key and a missing key are the same refusal. */
const hasExactKeys = (body: Record<string, unknown>, keys: readonly string[]): boolean => {
  const present = Object.keys(body)
  return present.length === keys.length && keys.every((key) => Object.prototype.hasOwnProperty.call(body, key))
}

/** The FORK'S descriptor, exactly (`src/shared/types.ts:415-421`): four keys, both id arrays, the PINNED origin label. A re-read's
 *  answer is checked against THIS and not merely against "an object" — `{}` or `{kind:'structural'}` is no more a descriptor than
 *  `undefined` is, and emitting one would put an unshaped payload on `IPC_RAG_STORE_CHANGED` while opening the gate on a
 *  coverage claim that covered nothing (this unit's adversarial finding `F-9`, measured). **`store` is pinned to the ORIGIN and is
 *  not "any non-empty string" (`F-12`, measured):** the renderer's foreign-store guard reads every OTHER non-empty name as a LOCAL
 *  store (`READ` `src/renderer/sidebar-panes.ts:3185-3189`), so `'default'` or a registry-legal `'gnosis-engine'` would re-derive
 *  the local graph on an engine event — exactly what `ASM-B4-1` exists to prevent. */
const DESCRIPTOR_KEYS: readonly string[] = Object.freeze(['kind', 'nodeIds', 'edgeIds', 'store'])

const isDescriptor = (value: unknown): value is RagStoreChangedPayload =>
  isFrameBody(value) &&
  hasExactKeys(value, DESCRIPTOR_KEYS) &&
  (value['kind'] === 'content' || value['kind'] === 'structural') &&
  isStringArray(value['nodeIds']) &&
  isStringArray(value['edgeIds']) &&
  value['store'] === ENGINE_ORIGIN_STORE

/** The closed table, TOTAL over every string: an UNKNOWN token is `structural` (`ASM-B4-2`) — never dropped, never thrown.
 *
 *  §2.2's TWO LIMBS, AND THEIR ORDER IS THE RULE (`F-13`): **the FRAME decides first** — a `change` frame whose `edgeIds` array is
 *  NON-EMPTY maps to `structural` whatever its token, because the graph moved and the fork's reconciler takes its FULL path on
 *  exactly that condition (`READ` `src/renderer/content-reconcile.ts:374-375`, `:566`) — and **then the TOKEN decides the
 *  remainder**. A kind that disagrees with the renderer's own fallback would make it walk a stale graph. */
const mapChangeKind = (token: string, edgeIds: readonly string[]): 'content' | 'structural' =>
  edgeIds.length > 0 ? 'structural' : (KIND_TABLE.get(token) ?? 'structural')

const isKnownKind = (token: unknown): boolean => typeof token === 'string' && KIND_TABLE.has(token)

/**
 * §2.2 — THE MAPPING, and it is this unit's decision. PURE: no I/O, no clock, no state.
 *
 * Returns the fork's descriptor with EXACTLY four keys, `nodeIds`/`edgeIds` carried VERBATIM (the SAME array instances — the
 * engine's six-term edge strings are not parsed, re-encoded or copied into a second identity), `kind` from the closed table, and
 * `store` the pinned engine-origin label. Throws the module's own typed refusal for any frame that violates §2.1/§2.2.
 */
export function changeFrameToPayload(body: unknown): RagStoreChangedPayload {
  if (!isFrameBody(body)) {
    throw new ChangeFrameRefusal('not-an-object', 'a frame body is a JSON object, never an array, null or a primitive')
  }
  if (!hasExactKeys(body, FRAME_KEYS)) {
    throw new ChangeFrameRefusal(
      'key-set',
      `the body carries [${Object.keys(body).join(', ')}] — the frame's set is exactly [${FRAME_KEYS.join(', ')}]`,
    )
  }
  if (body.type !== 'change') {
    throw new ChangeFrameRefusal('type', `the body's \`type\` read ${JSON.stringify(body.type)} — a change frame is \`"change"\``)
  }
  if (!isCursorToken(body.cursor)) {
    throw new ChangeFrameRefusal(
      'cursor',
      `the cursor read ${JSON.stringify(body.cursor)} — the engine's cursor is a canonical decimal string (a u64 rendered by ` +
        '`to_string`), never a coercion',
    )
  }
  if (!(body.wikiId === null || typeof body.wikiId === 'string')) {
    throw new ChangeFrameRefusal('wikiId', `\`wikiId\` read ${JSON.stringify(body.wikiId)} — it is a string or \`null\``)
  }
  if (typeof body.kind !== 'string' || body.kind === '') {
    throw new ChangeFrameRefusal('kind', `\`kind\` read ${JSON.stringify(body.kind)} — it is the entry's own non-empty op literal`)
  }
  if (!isStringArray(body.nodeIds)) {
    throw new ChangeFrameRefusal('nodeIds', '`nodeIds` is an array of strings, possibly empty')
  }
  if (!isStringArray(body.edgeIds)) {
    throw new ChangeFrameRefusal('edgeIds', '`edgeIds` is an array of strings, possibly empty (the six-term identities)')
  }
  if (typeof body.timestamp !== 'string' || body.timestamp === '') {
    throw new ChangeFrameRefusal('timestamp', '`timestamp` is the committed entry\'s ISO-8601 string')
  }
  return {
    kind: mapChangeKind(body.kind, body.edgeIds),
    nodeIds: body.nodeIds,
    edgeIds: body.edgeIds,
    store: ENGINE_ORIGIN_STORE,
  }
}

// ---------------------------------------------------------------------------
// §2 — THE CONSUMER.
// ---------------------------------------------------------------------------

/** What a caller hands the feed. `reconcile` and `onChange` are REQUIRED: the feed holds no CRUD surface of its own
 *  (`ASM-B4-3`) and no vocabulary of its own beyond §2.2's mapping. */
export interface EngineChangesFeedOptions {
  /** The engine's base url — the CALLER's (loopback is asserted by the transport seam, not here). */
  baseUrl: string
  /** The bearer token, passed through to the seam. */
  auth?: { token?: string }
  /** The injectable stream client — THE TEST SEAM, the same injection `createEngineRagStore` takes (`engine-rag-store.ts:299`). */
  sse?: SseClient
  /** §2.4 — the re-read, called on EVERY connect and delivered to the sink BEFORE that connection's first change frame. */
  reconcile: () => RagStoreChangedPayload | Promise<RagStoreChangedPayload>
  /** §2.2 — the sink. ONE call per applied change frame, plus ONE for the re-read's answer. Its fault is its own. */
  onChange: (descriptor: RagStoreChangedPayload) => void
}

/** The feed's position and its last typed failure — a COPY on every call (a caller cannot author the feed's state). */
export interface EngineChangesStatus {
  readonly connected: boolean
  /** `§2.1`/`ASM-B4-5` — whether the LIVE connection has ANNOUNCED its head, i.e. whether its frames can be judged at all.
   *  `false` with `connected: true` is the measured no-announcement state: the engine frames the announcement first on every
   *  connection (`gnosis_server.rs:983-986`) and NOTHING can be framed without it, so the absence is NAMED here — there is no
   *  timer, no timeout and no default head (a default would be a watermark the engine never sent). */
  readonly announced: boolean
  /** The accepted position of the LIVE connection as the engine spelled it (a canonical decimal token), or `null` while it has
   *  announced nothing — the watermark is the connection's, so a retired connection's position is not reported (`F-11`). */
  readonly cursor: string | null
  /** The SAME position numerically. The de-dup compares exactly (BigInt internally); this member is the reader's rendering. */
  readonly position: number | null
  /** ALWAYS the typed class with its `cause` (`engine-rag-store.ts:111-123`) — never a bare wire error, never a raw `Error`. */
  readonly failure: EngineUnavailable | null
}

/** What the feed has seen — a COPY on every call. `frames` is a CLOSED PARTITION: every frame the stream hands over is counted in
 *  exactly ONE of `cursor` | `change` | `refused`, and `seen` is counted first so a partition bug cannot hide a frame. */
export interface EngineChangesCensus {
  readonly frames: {
    readonly seen: number
    readonly cursor: number
    readonly change: number
    readonly refused: number
  }
  /** Descriptors emitted to the sink (the re-read's answer is NOT counted here — it is not a frame). */
  readonly applied: number
  /** `change` frames dropped by §2.3 (at or below the CURRENT connection's watermark — never a feed-lifetime one, `F-11`). */
  readonly dropped: number
  /** `change` frames whose token was NOT in the closed twenty (`ASM-B4-2`). */
  readonly unknownKind: number
  /** `connect()` calls that got past the one-socket guard (so a declared no-op is not counted). */
  readonly connects: number
}

/** The feed handle: four members, all total. */
export interface EngineChangesFeed {
  /** Opens the ONE connection. The connection's ANNOUNCEMENT starts the re-read (§2.4); nothing is applied before its answer.
   *  NEVER rejects (§5 `c8`). */
  connect(): Promise<void>
  /** Tears the standing connection (total, idempotent) and retires any in-flight connect or re-read. */
  close(): void
  status(): EngineChangesStatus
  census(): EngineChangesCensus
}

/** The normaliser every fault passes through: the seam has already run `transportError` (`engine-transport.ts:74-96`), so a
 *  typed wire error arrives here as `EngineUnavailable` or as a sibling; anything else becomes the typed unavailability §2.5
 *  requires, carrying the original words. */
function asUnavailable(err: unknown, what: string): EngineUnavailable {
  if (err instanceof EngineUnavailable) return err
  const message = err instanceof Error ? err.message : String(err)
  return new EngineUnavailable('unavailable-state', `${what}: ${message}`)
}

/** A `change` frame its connection framed BEFORE its own re-read answered (`ASM-B4-5` limb 3), with the cursor already parsed
 *  so no re-parse (and no re-validation) can happen at drain time. */
interface HeldFrame {
  readonly descriptor: RagStoreChangedPayload
  readonly cursor: bigint
}

/** A connection's identity and its ANCHOR state. `close()` retires it, so a tail frame (or an in-flight re-read) can never act
 *  on a dead socket. */
interface Connection {
  readonly generation: number
  ended: boolean
  handle: { close(): void } | null
  close(): void
  /** §2.1 — the head this connection's announcement recorded; `null` until it announces (and nothing is judged until then). */
  head: bigint | null
  /** §2.3 — THIS connection's de-dup watermark, and the ONLY watermark authority. It is NOT monotonic for the life of the feed:
   *  the engine's `change_cursor()` is `epoch().to_string()` (`../Gnosis/src/store/mod.rs:2400-2413`) and reads `"0"` on a fresh
   *  store, so a reconnect after an engine restart announces a head BELOW the retired connection's — and a feed-lifetime watermark
   *  would drop every frame of the restarted engine for ever, killing the live path the moment a reconnect succeeds (`F-11`,
   *  measured). The re-read covers everything `<=` ITS OWN connection's head, which is what makes the drop lawful again. */
  watermark: bigint | null
  /** §2.4 — the answer of THIS connection's re-read has reached the sink, so §2.3 may judge its frames. */
  gateOpen: boolean
  /** The `change` frames framed while the gate stood shut, in arrival order — the only place a frame waits, and it never waits
   *  for a timer: it is drained ONCE, when the answer lands, or discarded with the connection. */
  held: HeldFrame[]
}

/**
 * THE FEED. Construction is INERT — no network I/O, no timer, no subscription (the `createEngineRagStore` discipline,
 * `engine-rag-store.ts:860-866`), so `src/main/main.ts` may build it at boot beside the two engine proxies.
 */
export function createEngineChangesFeed(opts: EngineChangesFeedOptions): EngineChangesFeed {
  if (opts == null || typeof opts !== 'object') {
    throw new Error('engine changes feed: opts required')
  }
  if (typeof opts.baseUrl !== 'string' || opts.baseUrl === '') {
    throw new Error('engine changes feed: baseUrl required')
  }
  if (typeof opts.reconcile !== 'function') {
    throw new Error('engine changes feed: reconcile required')
  }
  if (typeof opts.onChange !== 'function') {
    throw new Error('engine changes feed: onChange required')
  }

  /**
   * The position, EXACTLY: a `BigInt` comparison is numeric for every `u64` the engine can print, where a `Number` compare
   * collapses 9007199254740992 and 9007199254740993 onto one double. It lives on the CONNECTION (§2.3), never on the feed.
   */
  let failure: EngineUnavailable | null = null
  let connected = false
  let generation = 0
  let live: Connection | null = null
  const counters = { seen: 0, cursor: 0, change: 0, refused: 0, applied: 0, dropped: 0, unknownKind: 0, connects: 0 }

  /** The sink call, CONTAINED: a sink's throw is the sink's, and `createSseClient` would otherwise catch it and re-fire it as
   *  `onError` (`engine-rag-store.ts:818-823`), turning one host fault into a dead subscription. */
  const emit = (descriptor: RagStoreChangedPayload): void => {
    try {
      opts.onChange(descriptor)
    } catch {
      /* one sink's fault is its own (the `fire` containment discipline, `pane-events.ts:145-151`) */
    }
  }

  /** §2.3 — a POSITION only ever advances the CURRENT connection's watermark: an announcement records its connection's head (§2.1)
   *  and a later announcement on the SAME connection moves it forward, never back. Across connections it is RE-ESTABLISHED from
   *  that connection's own announcement — which is the whole of `F-11`'s fix. */
  const advance = (connection: Connection, token: string): void => {
    const at = BigInt(token)
    if (connection.watermark === null || at > connection.watermark) connection.watermark = at
  }

  /** §2.3 — ONE judgement, over a frame whose cursor is already parsed. The ONLY path to `onChange` for a `change` frame, so a
   *  held frame and a live frame are judged by the same rule and neither can be applied twice. */
  const judge = (connection: Connection, descriptor: RagStoreChangedPayload, at: bigint): void => {
    if (connection.watermark !== null && at <= connection.watermark) {
      // §2.3 — a reconnect replays the retained window `(floor, head]`; a replayed frame is DROPPED and counted, and the drop is
      // lawful because THIS connection's re-read (which STARTED after its head was read) covers everything at or below that head.
      counters.dropped += 1
      return
    }
    connection.watermark = at
    counters.applied += 1
    emit(descriptor)
  }

  /** §2.4/`ASM-B4-5` — THE ANCHOR. This runs ONLY from the announcement, i.e. only after the engine read the head
   *  (`gnosis_server.rs:977`) and framed it with the retained window (`:983-996`). The answer is therefore read at an instant
   *  STRICTLY LATER than that head read: every commit at or below the head is inside it, and every commit above the head is
   *  framed live by the tail (`:1005-1032`). No timer, no queue, no second read — and no frame is applied until it lands. */
  const reconcileFor = async (connection: Connection): Promise<void> => {
    let answer: unknown
    try {
      answer = await opts.reconcile()
    } catch (err) {
      // FAIL-CLOSED (`ASM-L2-3`): a connection whose re-read failed must not keep framing — its frames would be deltas it cannot
      // have measured. The socket is torn down with the failure, and nothing held is ever applied.
      if (live !== connection || connection.ended) return
      settle(connection, asUnavailable(err, 're-read failed'))
      return
    }
    if (live !== connection || connection.ended) return // closed (or superseded) while the read was in flight
    if (!isDescriptor(answer)) {
      // A host fault, contained: a re-read that answers no descriptor — `undefined`, `null`, an array, a primitive, OR a
      // wrong-shaped object (`F-9`) — is a typed failure, never an `undefined`/malformed payload on the broadcast.
      settle(connection, new EngineUnavailable('unavailable-state', 're-read answered no change descriptor'))
      return
    }
    emit(answer)
    // THE GATE: from here on §2.3 judges this connection's frames. What arrived while the answer was in flight is drained in
    // ARRIVAL ORDER, once, and dropped-or-applied by the same rule as any live frame — including the SAME liveness gate, so a
    // sink that retires the feed from inside this very drain stops it (`F-10`: a retired connection applies nothing).
    connection.gateOpen = true
    const held = connection.held
    connection.held = []
    for (const frame of held) {
      if (live !== connection || connection.ended) return
      judge(connection, frame.descriptor, frame.cursor)
    }
  }

  /** §2.1/§2.3 — ONE frame. Every branch is a declared answer, and a refusal NEVER tears the stream. */
  const applyFrame = (connection: Connection, event: string, data: string): void => {
    if (connection.generation !== generation || live !== connection) return // a RETIRED connection's frame is never applied
    counters.seen += 1
    if (event !== 'cursor' && event !== 'change') {
      counters.refused += 1
      return
    }
    let body: unknown
    try {
      body = JSON.parse(data)
    } catch {
      counters.refused += 1
      return
    }
    if (!isFrameBody(body) || body.type !== event) {
      // the label/data agreement (`gnosis_server.rs:966-969`: the `event:` label equals the data's `type`)
      counters.refused += 1
      return
    }
    if (event === 'cursor') {
      // A POSITION, NOT A CHANGE: it emits NOTHING (§2.1). Its own shape is as exact as a change frame's.
      if (!hasExactKeys(body, CURSOR_FRAME_KEYS) || !isCursorToken(body.cursor)) {
        counters.refused += 1
        return
      }
      counters.cursor += 1
      advance(connection, body.cursor)
      if (connection.head === null) {
        // THE HEAD, and the ONLY start of this connection's re-read (`ASM-B4-5`). A later announcement on the same connection
        // only moves the watermark — `reconcile` reads exactly ONCE per connect (§5 `c5`).
        connection.head = BigInt(body.cursor)
        void reconcileFor(connection)
      }
      return
    }
    let descriptor: RagStoreChangedPayload
    try {
      descriptor = changeFrameToPayload(body)
    } catch {
      counters.refused += 1
      return
    }
    counters.change += 1
    if (!isKnownKind(body.kind)) counters.unknownKind += 1
    const at = BigInt(body.cursor as string)
    if (!connection.gateOpen) {
      // NOTHING IS APPLIED UNTIL THE RE-READ'S ANSWER HAS REACHED THE SINK (§2.4 limb 3). Without an announcement there is no
      // head to judge against, so the frame waits here rather than being guessed at.
      connection.held.push({ descriptor, cursor: at })
      return
    }
    judge(connection, descriptor, at)
  }

  /** ONE ending path for a fault and for a close. The feed ships no retry (§2.5): the caller may connect again, and §2.4 is what
   *  makes that safe. Whatever the connection was holding is DISCARDED with it — a retired connection applies nothing — and a
   *  connection that is NOT the live one cannot settle the feed: a late `onError`/`onClose` from a socket this module already
   *  retired must never report a healthy successor as failed (`F-10`, measured; the injected `sse` seam's contract promises the
   *  callbacks, not their silence after `close()`). */
  const settle = (connection: Connection, why: EngineUnavailable): void => {
    if (connection.ended) return
    connection.ended = true
    connection.held = []
    connection.close()
    if (live !== connection) return
    live = null
    connected = false
    failure = why
  }

  const connect = async (): Promise<void> => {
    // ONE LIVE SUBSCRIPTION, ALWAYS (`ASM-L2-2`): a connect while one stands is a DECLARED no-op — no second socket, no second
    // re-read, and the connect count stays a fact about connections rather than about calls.
    if (live !== null) return
    counters.connects += 1
    failure = null
    const mine = ++generation
    const connection: Connection = {
      generation: mine,
      ended: false,
      handle: null,
      head: null,
      watermark: null,
      gateOpen: false,
      held: [],
      close: () => {
        try {
          connection.handle?.close()
        } catch {
          /* a client that throws on teardown is already gone */
        }
      },
    }
    // `ASM-B4-5` — SUBSCRIBE FIRST, and apply nothing yet. The re-read is NOT started here: it is started by THIS connection's
    // announcement (see `applyFrame`), because the engine reads the head before it frames that announcement — and a re-read
    // that starts before the head read is blind to exactly the commits `ASM-B-4` forbids losing.
    live = connection
    try {
      const handle = subscribeEngineStream({
        baseUrl: opts.baseUrl,
        path: ENGINE_ENDPOINTS.changes,
        ...(opts.auth === undefined ? {} : { auth: opts.auth }),
        ...(opts.sse === undefined ? {} : { sse: opts.sse }),
        handlers: {
          onEvent: (event, data) => applyFrame(connection, event, data),
          onError: (err) => settle(connection, asUnavailable(err, 'change feed fault')),
          // The feed never sends `done` (`gnosis_server.rs:957-963`), so ANY close is premature.
          onClose: () => settle(connection, new EngineUnavailable('connection-refused', 'change feed closed')),
        },
      })
      connection.handle = handle
      // A client that settles SYNCHRONOUSLY inside `subscribe` (the injected seam allows it) has already retired this connection
      // while `handle` was still null: bind it, then close it at once, or the socket would outlive every path that could reach it.
      if (connection.ended) {
        try {
          handle.close()
        } catch {
          /* already gone */
        }
      }
    } catch (err) {
      live = null
      connected = false
      failure = asUnavailable(err, 'subscribe refused')
      return
    }
    connected = !connection.ended && failure === null
  }

  const close = (): void => {
    generation += 1 // retires the standing connection AND any in-flight connect or re-read
    const current = live
    live = null
    connected = false
    if (current !== null) {
      // `ended` is the connection's OWN terminal flag, and `close()` is one of the two paths that ends it (`settle` is the
      // other). Without it a late callback from this socket would reach `settle` and settle the FEED (`F-10`).
      current.ended = true
      current.held = []
      current.close()
    }
  }

  const status = (): EngineChangesStatus => ({
    connected,
    announced: live !== null && live.head !== null,
    // The position is the LIVE connection's watermark, and there is no other: a retired connection's position is not this feed's
    // to report (the reconnect re-establishes it from its own announcement — `F-11`).
    cursor: live === null || live.watermark === null ? null : live.watermark.toString(),
    position: live === null || live.watermark === null ? null : Number(live.watermark),
    failure,
  })

  const census = (): EngineChangesCensus => ({
    frames: { seen: counters.seen, cursor: counters.cursor, change: counters.change, refused: counters.refused },
    applied: counters.applied,
    dropped: counters.dropped,
    unknownKind: counters.unknownKind,
    connects: counters.connects,
  })

  return Object.freeze({ connect, close, status, census })
}
