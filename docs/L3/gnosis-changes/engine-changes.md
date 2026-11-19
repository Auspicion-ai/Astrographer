# L3 — `gnosis-changes` / `B-4` `engine-changes`: the module design behind the I/O surface

**Layer:** L3 · **Date:** `2026-11-18`, **re-issued after the L1 adjudication of `F-5` (the re-read is anchored to the ANNOUNCEMENT) and `F-2` (`connect()` follows the window)**, and **re-issued again on the independent gates' return — `F-11` the watermark is PER CONNECTION, `F-12` the descriptor's `store` is the ORIGIN, `F-13` the FRAME decides before the TOKEN** · **Ceiling:** 150 lines (D-2's design class) · **Designs against:** `docs/L2/gnosis-changes/engine-changes.md` §2 (exact surface), §3 (seams), §4 (mapping / state machine / wiring), §5 (failure states), §8 (`F-1`…`F-13`) · **Contract:** `docs/L1/unit-b-4-engine-changes.md` §2–§2.5, §4 hop 1, §5, §8 `ASM-B4-5`.
**Layer declaration (D-10, RCA-12):** all of this is **envelope** — the module is pure (no Electron, no DOM, no fs, no socket, no timer), its rows drive it through an injected `SseClient` double, and **no engine event is claimed** (L2 §6's park).
**Census convention (one, shared with L2):** an "export" is an `export` **declaration** in the file, types included — so `engine-transport.ts` gained **3** (of the file's ten declarations today), `engine-changes.ts` has **6** (4 interfaces + 2 functions) and `pane-events.ts` still has **5**.

## 1. Structure

| File | Bytes | Shape |
|---|---|---|
| `src/main/engine-changes.ts` | NEW | (a) the kind table (ONE `ReadonlyMap` from two frozen lists, **2 + 18 = 20**) plus the FRAME limb; (b) the frame discipline + the ORIGIN-pinned descriptor check; (c) the consumer with the ANCHOR and a PER-CONNECTION watermark; (d) four exported types |
| `src/main/engine-transport.ts` | +3 export declarations | `EngineStreamHandlers` · `EngineStreamOptions` · `subscribeEngineStream` — assertLoopback → `<base><path>` → `createSseClient` → `transportError` |
| `src/main/engine-rag-store.ts` | +3 bytes | `ENGINE_ENDPOINTS.changes` · `ENGINE_ORIGIN_STORE` · `export type { RagStoreChangedPayload }` |
| `src/renderer/pane-events.ts` | +3 members, 1 mark kind | `register(id, handler, mark)` grows a second mark kind; the additions are twins of `subscribeRecord`/`deliver`/`recordPanes` |
| `src/main/main.ts` | +4 wiring sites | construction · `reconcile` (a BOUNDED PAGE WALK) · the sink · `connect()` AFTER the window + `close()` |

**One table, one mapper, one consumer — and no second vocabulary.** `changeFrameToPayload` and the consumer's unknown-kind counter read the SAME map, so a token cannot be known to one and unknown to the other; and the re-read's answer is checked against the SAME four-key shape the mapper emits — `store` included (`F-9`, `F-12`).

## 2. Signatures (the whole runtime surface)

```ts
// engine-changes.ts — TWO runtime exports (six export declarations; the map's `N` counts these, L2 §9 `O-1` states both readings)
export function createEngineChangesFeed(opts: EngineChangesFeedOptions): EngineChangesFeed
export function changeFrameToPayload(body: unknown): RagStoreChangedPayload      // PURE; throws the typed refusal
// internal, deliberately NOT exported (an export set is a contract surface, not a debugging aid): ChangeFrameRefusal · KIND_TABLE ·
// FRAME_KEYS (seven) · CURSOR_FRAME_KEYS (two) · DESCRIPTOR_KEYS (four) · CURSOR_TOKEN = /^(0|[1-9][0-9]*)$/ · CURSOR_MAX = 2^64−1 · isCursorToken ·
// isFrameBody · hasExactKeys · isDescriptor · isStringArray · mapChangeKind · isKnownKind · advance · judge · reconcileFor · applyFrame ·
// settle · asUnavailable · HeldFrame · Connection (whose `watermark` IS §2.3)
// engine-transport.ts — the ONE seam, three export declarations
export function subscribeEngineStream(opts: { baseUrl: string; path: string; auth?: { token?: string }; sse?: SseClient;
  handlers: { onEvent(e: string, d: string): void; onError(err: unknown): void; onClose(): void } }): { close(): void }
// pane-events.ts — the addition on the ONE registry: `subscribeChange(paneId, handler): () => void` ; `publishChange(): FireReport[]` ; `changePanes(): string[]`
```

## 3. Pseudocode — the frame discipline

```ts
function changeFrameToPayload(body) {                       // PURE; throws the typed refusal, never a coercion
  if (!isFrameBody(body)) throw refusal('not-an-object')     // a JSON array and null both land here
  if (!hasExactKeys(body, FRAME_KEYS)) throw refusal('key-set')      // missing OR additive, both refused (u4 :505-510)
  if (body.type !== 'change') throw refusal('type')          // the label/data agreement, in the body's own terms
  if (!isCursorToken(body.cursor)) throw refusal('cursor')   // NOT Number(...): a coercion accepts '1.0', ' 7', '0x10', 401 digits
  if (!(body.wikiId === null || typeof body.wikiId === 'string')) throw refusal('wikiId')   // nullable by contract (:940)
  if (typeof body.kind !== 'string' || body.kind === '') throw refusal('kind')
  if (!isStringArray(body.nodeIds) || !isStringArray(body.edgeIds)) throw refusal('ids')
  if (typeof body.timestamp !== 'string' || body.timestamp === '') throw refusal('timestamp')
  return { kind: mapChangeKind(body.kind, body.edgeIds), nodeIds: body.nodeIds, edgeIds: body.edgeIds, store: ENGINE_ORIGIN_STORE }
}   // the four keys IN THE CONTRACT'S ORDER; `nodeIds`/`edgeIds` are the SAME array INSTANCES (verbatim, no parse, no copy)
// `F-13` — THE FRAME DECIDES FIRST, THE TOKEN SECOND: `edgeIds.length > 0 ⇒ 'structural'`, else the closed table (unknown ⇒ structural).
// The renderer's own fallback is the same condition (`src/renderer/content-reconcile.ts:374-375`, `:566`), so kind and reconciler cannot
// disagree — and `update_document`/`re_sync_embed` are `structural` because they MOVE graph shape (`../Gnosis/src/store/mod.rs:3604-3634`, `:5733-5830`).
```

**Guardrail:** the key ORDER is a choice, not an accident — a reader diffing the descriptor against `RagStoreChangedPayload` (`src/shared/types.ts:415-421`) sees the same shape, and `c2` asserts the exact key list rather than a set. `isDescriptor` is the SAME discipline applied to the re-read's answer: exactly four keys, `kind` in the two words, both id arrays, and — `F-12` — **`store === ENGINE_ORIGIN_STORE`**, not "any non-empty string" (the renderer reads every other non-empty name as a LOCAL store, `src/renderer/sidebar-panes.ts:3185-3189`).

## 4. Pseudocode — the consumer, and THE ANCHOR is its shape

```ts
function createEngineChangesFeed(opts) {
  // construction INERT and total on a well-formed opts (the createEngineRagStore boundary, engine-rag-store.ts:860-866)
  let failure: EngineUnavailable | null = null ; let connected = false ; let generation = 0 ; let live: Connection | null = null
  const c = { seen:0, cursor:0, change:0, refused:0, applied:0, dropped:0, unknownKind:0, connects:0 }
  // A Connection carries the ANCHOR's own state: head (null until it announces), gateOpen (its answer is in the sink), held, and `watermark` — §2.3's de-dup position, which lives HERE, never on the feed (`F-11`).
  const emit  = (d) => { try { opts.onChange(d) } catch {} }       // a sink's throw is the sink's (fire's containment)
  const advance = (conn, tok) => { const n = BigInt(tok) ; if (conn.watermark === null || n > conn.watermark) conn.watermark = n }
  const judge = (conn, descriptor, at) => {                         // §2.3 — the ONE path to onChange for a change frame
    if (conn.watermark !== null && at <= conn.watermark) { c.dropped++ ; return }   // lawful ONLY because ITS re-read covers it
    conn.watermark = at ; c.applied++ ; emit(descriptor)
  }
  const reconcileFor = async (conn) => {                            // RUNS ONLY FROM THE ANNOUNCEMENT (`ASM-B4-5`)
    let answer                                                        // read at an instant STRICTLY AFTER the engine's head read
    try { answer = await opts.reconcile() } catch (err) {
      if (live === conn && !conn.ended) settle(conn, asUnavailable(err,'re-read failed')) ; return }   // fail-CLOSED
    if (live !== conn || conn.ended) return                         // closed/superseded while the read was in flight
    if (!isDescriptor(answer)) { settle(conn, …'re-read answered no ORIGIN-pinned change descriptor') ; return }   // F-3 + F-9 + F-12
    emit(answer)                                                    // ORDERED BEFORE any applied frame of this connection
    conn.gateOpen = true                                            // THE GATE
    const held = conn.held ; conn.held = []
    for (const frame of held) { if (live !== conn || conn.ended) return ; judge(conn, frame.descriptor, frame.cursor) }  // F-10
  }
  function applyFrame(conn, event, data) {
    if (conn.generation !== generation || live !== conn) return     // a RETIRED connection's frame is never applied (F-1c)
    c.seen++
    if (event !== 'cursor' && event !== 'change') { c.refused++ ; return }
    let body; try { body = JSON.parse(data) } catch { c.refused++ ; return }
    if (!isFrameBody(body) || body.type !== event) { c.refused++ ; return }
    if (event === 'cursor') {                                       // A POSITION — and the ONLY start of the re-read
      if (!hasExactKeys(body, CURSOR_FRAME_KEYS) || !isCursorToken(body.cursor)) { c.refused++ ; return }   // F-6
      c.cursor++ ; advance(conn, body.cursor)
      if (conn.head === null) { conn.head = BigInt(body.cursor) ; void reconcileFor(conn) }   // ONCE per connect
      return                                                        // EMITS NOTHING
    }
    let descriptor; try { descriptor = changeFrameToPayload(body) } catch { c.refused++ ; return }
    c.change++ ; if (!isKnownKind(body.kind)) c.unknownKind++
    const at = BigInt(body.cursor)
    if (!conn.gateOpen) { conn.held.push({ descriptor, cursor: at }) ; return }   // NOTHING APPLIED UNTIL THE ANSWER LANDS
    judge(conn, descriptor, at)
  }
  async function connect() {
    if (live !== null) return                                       // DECLARED no-op: one socket, always (ASM-L2-2)
    c.connects++ ; failure = null ; const mine = ++generation
    const conn = { generation: mine, ended: false, handle: null, head: null, watermark: null, gateOpen: false, held: [],
                   close: () => { try { conn.handle?.close() } catch {} } }
    live = conn                                                     // SUBSCRIBE FIRST; the re-read is NOT started here
    try {
      const handle = subscribeEngineStream({ baseUrl, path: ENGINE_ENDPOINTS.changes, auth, sse, handlers: {
        onEvent: (e, d) => applyFrame(conn, e, d),
        onError: (err) => settle(conn, asUnavailable(err, 'change feed fault')),
        onClose: () => settle(conn, new EngineUnavailable('connection-refused', 'change feed closed')),   // never `done`
      }})
      conn.handle = handle ; if (conn.ended) handle.close()          // a client that settled INSIDE subscribe (F-7)
    } catch (err) { live = null ; connected = false ; failure = asUnavailable(err, 'subscribe refused') ; return }
    connected = !conn.ended && failure === null
  }
  // ONE ending path — and a retired connection's own terminal callback is its own (F-10), so it cannot settle the FEED.
  const settle = (conn, why) => { if (conn.ended) return ; conn.ended = true ; conn.held = [] ; conn.close()
                                  if (live !== conn) return   // ← the line that stops a late onClose/onError
                                  live = null ; connected = false ; failure = why }
  const close = () => { generation++ ; const cur = live ; live = null ; connected = false ; if (cur !== null) { cur.ended = true ; cur.held = [] ; cur.close() } }
  const status = () => ({ connected, announced: live !== null && live.head !== null, failure,
                          cursor: live?.watermark?.toString() ?? null, position: live?.watermark == null ? null : Number(live.watermark) })
  return Object.freeze({ connect, close, status, census })          // frozen, like the channel (pane-events.ts:219); the LIVE watermark, no other (F-11)
}
```

- **The order is the ruling, so it is the code's shape:** `subscribe` (nothing applied) → announcement (head + `reconcileFor`) → answer in the sink → gate opens → §2.3 judges. A commit `≤ head` is inside a re-read that STARTED after the head was read; a commit `> head` is framed live by the tail (`gnosis_server.rs:1005-1032`). **No gap, no double-apply, no second read.** The no-announcement arm is a CONSEQUENCE, not a special case: with `conn.head === null` the gate never opens, so nothing is judged and `status()` says `announced: false` (`c1(b)`). And **the one hold is not a queue** (carried upward as L2 §9 `O-4`): `conn.held` exists because limb 3 forbids applying a frame before the answer lands while the engine frames the announcement and the retained window in ONE body — one-shot, in arrival order, drained once, discarded on fault/close, with **no timer, no re-arm, no retry**. **And the watermark cannot live on the feed (`F-11`, measured):** `change_cursor()` is `epoch().to_string()` (`../Gnosis/src/store/mod.rs:2400-2413`, `"0"` on a fresh store), so the announcement of a connection opened after an engine restart is LOWER than the retired connection's last frame — a feed-lifetime watermark then drops every frame of the restarted engine for ever, the reconnect succeeds, the re-read is emitted, and the live path is silently dead. Per connection the drop is still licensed by THAT connection's re-read, the only coverage claim §2.3 ever makes; `c4(f)` drives the restart and a control that an at-current-head frame is still dropped.

## 5. Pseudocode — the seam, the wiring's ORDER, and the renderer addition

```ts
export function subscribeEngineStream(opts) {          // engine-transport.ts — the ONE stream opener; a refusal never subscribes
  assertLoopback(opts.baseUrl, 'engine stream')        // BEFORE anything else, so a refusal here never subscribes (c6, `:57-67`)
  const sse = opts.sse ?? createSseClient(opts.auth)   // the ONE stream opener (engine-rag-store.ts:777); normalisation is the proxy's (:868)
  const url = `${opts.baseUrl.replace(/\/+$/, '')}${opts.path}`
  try { return sse.subscribe(url, { onEvent, onError: (e) => handlers.onError(transportError(e)), onClose }) } catch (err) {
    throw transportError(err) }                        // a synchronous throw out of a client is a TRANSPORT fault (:74-96)
}
// main.ts — site (4), and ITS POSITION IS THE FIX (`F-2`): after the window EXISTS and its content has LOADED, and NOT awaited.
const win = new BrowserWindow({ … }) ; backend.attachWindow(win) ; await win.loadFile(rendererHtml) ; void engineChangesFeed.connect()
//   the connect above is NOT awaited: an absent engine must never hold the boot, and `connect()` never rejects.
```
**Guardrail: `publishChange` must not become a second dispatch.** It is `deliver()`'s twin and reaches a handler only through `fire(id)`; the SAME-ID row (a plain subscriber on a change-interested id IS fired) is the observable no second dispatch can satisfy. `deliver()`'s body is unedited and no new module EXPORT is added, so the five-name census still reads five.

## 6. Guardrails (what a later unit must not break)

1. **The descriptor is FOUR keys, forever, and `nodeIds`/`edgeIds` are carried BY REFERENCE**; `kind` comes from the TWO-LIMB rule — the FRAME (`edgeIds` non-empty ⇒ `structural`) before the TOKEN (`content` only for `update_fact`/`update_community_summary`) — and the RE-READ's answer is held to the same four keys **with `store === ENGINE_ORIGIN_STORE`** (`F-12`) or it is a typed failure; the unknown-kind arm stays a FEATURE (dropping loses a real change, throwing tears a live subscription, `u4-cursor-paged-reads.md:521-524`).
2. **The re-read starts from the ANNOUNCEMENT, its answer precedes every applied frame of its connection, its WALK IS PAGED and page-bounded, and its failure CLOSES the subscription it opened** — a re-read anchored to `connect()` leaks exactly the commits between its own read and the engine's head read (`F-5`, `c5(c)`), and a one-page re-read claims a guarantee it did not earn (`F-4`, `c9(h)`). **And the watermark is the CONNECTION's** (`F-11`): re-established by each announcement, monotonic only within one connection, never carried across a `close()`/`connect()`, so the drop it licenses is its own re-read's coverage and nothing else. **`close()` retires by GENERATION *and* by the connection's own `ended` flag**, so neither an in-flight `connect()`/re-read nor a late `onError`/`onClose` from a retired socket can act on — or settle — a live feed (`F-10`). **And `'gnosis:engine'` cannot match `RAG_STORE_NAME_PATTERN`**, which keeps `B-5`'s fail-closed guard (`sidebar-panes.ts:3185-3189`) from treating an engine change as a local store change; **nothing throws across this module's boundary** except the factory's three argument refusals and the PURE mapper's typed refusal, so `connect()` never rejects.

## 7. The command that must go green
`npm_config_cache=/tmp/npm-cache-astrographer npx vitest run tests/unit/gnosis-changes tests/integration/gnosis-changes` → **8 files / 53 rows, all green** (the numbers are L2 §9 `R-5`): `change-frame-map` (`c2`, `c3(a)`, `c3(c)`, the refusals) · `cursor-dedup` (`c4(a)`…`c4(f)`, every limb through an ANNOUNCED connection, the last one across a reconnect) · `consumer-frames` (`c1(a)`, `c1(b)`, `c2(stream)`, `c3(b)`) · `reconnect-reread` (`c5(a)`, `c5(b)`/`c5(c)` — DESIGN MODELS, `c5(d)`: the real module through the interleaving) · `transport-and-failure` (`c6`/`c7`/`c8`) · `wiring-census` (`c9(a)`…`c9(h)`) · `pane-change-arm` (`c10`, `c11` with one isolating mutant per conjunct) · `adversarial` (`a1`…`a12`, `a7` carrying the wrong-ORIGIN limbs, `a8` driving its self-release) — each with **its `problems` array EMPTY**, since every row collects its readings into ONE `expect(problems, …)` so a partial pass cannot print. Beyond it: `npm test`, `npm run typecheck`, `npm run build`, and `npm run drift` (`CLEAN`, pin arm `49d3137dbf81b6e535e62a30d9e494d80e9589b3`).
