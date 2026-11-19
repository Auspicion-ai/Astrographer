# L2 — `gnosis-changes` / `B-4` `engine-changes`: the module's I/O surface for the ENGINE'S CHANGE FEED

**Layer:** L2 · **Date:** `2026-11-18`, **amended after the L1 adjudication of this landing's `F-5` and `F-2`** (both ruled AGAINST the landed code, both FIXED — §8) · **Ceiling:** 150 lines · **Module:** `gnosis-changes` (the map's definition reads `N = 12`, cap `170` — §9 `O-1`, settled) · **Contract:** `docs/L1/unit-b-4-engine-changes.md` (§2 the consumer · §2.1 · §2.2 · §2.3 · §2.4 THE ANCHOR · §2.5 · §3 · §4 hop 1 · §5 rows · §7 the park · §8 `ASM-B4-5`).
**Status: `LANDED`, envelope-green on all 51 rows; §6's live arm PARKED.** Two claim classes: **`LANDED`** = a fact a revert cannot erase (a row, this page); **`DESIGN`** = a claim about the change set's own bytes.
**Layer declaration (D-10, RCA-12):** every reading here is **envelope** — harness rows over `src/**` under node, plus source clauses over TEXT. **No engine event is claimed (§6).**

## 1. The module's paths, and which take part

| Path | Takes part? | Why |
|---|---|---|
| `src/main/engine-changes.ts` | **yes — NEW, the map's own path** | §2's four members: the frame discipline, the mapping, the de-dup, the anchored re-read |
| `src/main/engine-transport.ts` | **yes — ONE export: `subscribeEngineStream` (§3.1)** | the fork's ONE stream opener (assertLoopback → `<base><path>` → `createSseClient` → `transportError`) |
| `src/main/engine-rag-store.ts` | **yes — three bytes (§3.2)** | `ENGINE_ENDPOINTS.changes` · `ENGINE_ORIGIN_STORE` · the descriptor type re-export |
| `src/main/main.ts` | **yes — the wiring only, four sites (§4.4)** | construction · `reconcile` · the sink · `connect()` AFTER the window / `close()` |
| `src/renderer/pane-events.ts` | **yes — an ADDITION only (§3.3)** | `subscribeChange` / `publishChange` / `changePanes` on the ONE registry |
| `src/main/engine-config.ts` | **no — ZERO byte, read only** | the baseUrl is the caller's (`resolveEngineBaseUrl`, `READ` `main.ts:299-304`) |
| `src/shared/types.ts` · `preload.ts` · `sidebar-panes.ts` · `renderer.ts` · `package.json` | **no — a MEASURED NEGATIVE (§5 `c9`)** | the descriptor and the channel already exist (`types.ts:403`, `:415-421`); the renderer receipt is `B-6`/`B-8`'s |

## 2. The I/O surface, exactly

```ts
// src/main/engine-changes.ts — TWO runtime exports, and that is the module's whole surface (the map's `N` counts them)
export interface EngineChangesFeedOptions {
  baseUrl: string; auth?: { token?: string }; sse?: SseClient        // `sse` = THE TEST SEAM (`engine-rag-store.ts:285`)
  reconcile: () => RagStoreChangedPayload | Promise<RagStoreChangedPayload>   // §2.4, REQUIRED, INJECTED
  onChange: (descriptor: RagStoreChangedPayload) => void                     // §2.2, REQUIRED, the sink
}
export interface EngineChangesFeed { connect(): Promise<void>; close(): void; status(): EngineChangesStatus; census(): EngineChangesCensus }
export interface EngineChangesStatus   { connected: boolean; announced: boolean; cursor: string | null;
                                         position: number | null; failure: EngineUnavailable | null }
export interface EngineChangesCensus   { frames: { seen: number; cursor: number; change: number; refused: number };
                                         applied: number; dropped: number; unknownKind: number; connects: number }
export function createEngineChangesFeed(opts: EngineChangesFeedOptions): EngineChangesFeed
export function changeFrameToPayload(body: unknown): RagStoreChangedPayload   // PURE; throws the module's own frame refusal
```

- **Four keys, the fork's, unchanged** (`READ` `src/shared/types.ts:415-421`): `{kind, nodeIds, edgeIds, store}`, in that order; `cursor`/`wikiId`/`timestamp`/`type` never cross (`ASM-B4-1`). A re-read's answer is checked against the SAME four keys (`F-9`): `{}`, `{kind:'structural'}`, a fifth key or an empty `store` is "no descriptor", not a payload.
- **`announced` is the module's ONE new status member** and it exists because the contract does: a connection that has not announced has NO head, so its frames cannot be judged (`ASM-B4-5`). `connected: true, announced: false` is a truthful state and is NAMED rather than inferred — there is no timer, no timeout and no default head.
- **`status()`/`census()` build a FRESH object per call**; `status().failure` is ALWAYS the typed `EngineUnavailable` with its `cause` (`engine-rag-store.ts:97-109`), never a bare wire error. `frames` is a closed partition (`seen` counted first; a retired connection's frame is excluded before counting, `F-1(c)`).

## 3. The seams a sibling may read

**3.1 `engine-transport.ts` — the ONE addition.** `subscribeEngineStream({ baseUrl, path, auth?, sse?, handlers })` → `{ close() }`. `assertLoopback(baseUrl, 'engine stream')` runs **before** any subscription (`READ` `:54-64`), so a non-loopback baseUrl is refused and the injected client's `subscribe` is never called (`c6`); the URL is `<base minus trailing '/'>` + `<path>`, the proxy's own normalisation (`READ` `engine-rag-store.ts:854`); it opens via `createSseClient` and translates every fault — including a synchronous throw — through `transportError` (`READ` `:71-93`). The documented cycle is kept and widened by one binding.
**3.2 `engine-rag-store.ts` — three bytes.** (i) `ENGINE_ENDPOINTS` gains `changes: '/changes'`; (ii) `ENGINE_ORIGIN_STORE = 'gnosis:engine'`, **provably not a registry name** — `RAG_STORE_NAME_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/` (`READ` `rag-store-registry.ts:58-60`) refuses a colon, which keeps `B-5`'s fail-closed foreign-store guard (`READ` `sidebar-panes.ts:3185-3189`) from ever treating an engine change as a LOCAL one; (iii) `export type { RagStoreChangedPayload }`. **Nothing else in that file moves.**
**3.3 `pane-events.ts` — an addition on the ONE registry.** `subscribeChange(id, h)` = `subscribe` + a CHANGE-interest mark; `publishChange(): FireReport[]` fires those ids THROUGH the existing `fire`; `changePanes(): string[]` is a copy. One handler map, two mark SETS of the same tokens, so no second dispatch can exist; the export census stays **five**. **The shipped change-interest census is EMPTY and is a DECLARATION**: no pane adopts it until `B-6`/`B-8`, so a reader must not read §4.4 as "an engine change repaints a pane today".

## 4. The mapping, the state machine, the wiring

**4.1 The frame families** (`READ` `../Gnosis/src/bin/gnosis_server.rs:970-1040`; the `event:` label ≡ the data's `type`, `:966-969`):

| `event:` | `data:` (exact key set) | What the consumer does |
|---|---|---|
| `cursor` | `{"type":"cursor","cursor":"<decimal>"}` — cursor-FIRST, every connection (`:983-986`) | **emits NOTHING**: validates a TWO-key set + a canonical decimal inside `u64`, counts `frames.cursor`, advances the position monotonically, **records THIS connection's head and STARTS its re-read** (`ASM-B4-5`). `c1` |
| `change` | `{"type":"change","cursor","wikiId","kind","nodeIds","edgeIds","timestamp"}` — one per committed entry (`:936-950`) | validates the exact seven-key set, maps to the four-key descriptor, and **either HELD (the answer is not in yet) or judged** by §2.3. `c2`, `c3`, `c4` |
| anything else | — | a **typed refusal**: `frames.refused`, no descriptor, **no teardown** (`u4-cursor-paged-reads.md:521-524`) |

*The engine's own discipline, read at that checkout:* `cursor` is `entry.seq.to_string()` (`:939`); `wikiId` nullable (`:940`); `kind` = the entry's `op` literal from the **closed 20-token set** (`u4-cursor-paged-reads.md:512-517`); `edgeIds` the six-term canonical JSON-array strings (`:942-943`); `timestamp` ISO-8601; the 100 ms poll loop has **no keep-alive, no `done`, no coalescing** (`:930`, `:1005-1032`); `text/event-stream` exactly (`:1035-1039`); and **"the feed has no request-side cursor today"** (`:972-976`, verbatim) — which is why §2.4 exists.

**4.2 The kind table** (`c3`): `content` = `update_document` · `update_fact` · `update_community_summary` · `re_sync_embed`; `structural` = the other sixteen. **UNKNOWN → `structural`, emitted, counted** (`ASM-B4-2`): mislabelling a structural change as `content` makes the renderer walk a stale graph, so the wider invalidation is the safe arm.

**4.3 The state machine — every arrow is a row, and the ORDER is the whole of `ASM-B4-5`**

```
connect() ─▶ connects++ ; failure := null ; if a subscription is LIVE: DECLARED NO-OP (one socket, always — ASM-L2-2)
   └─ subscribeEngineStream(...) ─non-loopback│throws─▶ typed failure ; connect() never rejects (c6, c8) ; APPLIES NOTHING YET
   frame(event,data) [only if this connection is LIVE and its generation is current]
        ├─ label ∉ {cursor,change} │ bad JSON │ not an object │ type ≠ label ─▶ refused++ ; the stream STANDS
        ├─ cursor ─▶ exact 2 keys + canonical decimal ≤ u64 ─▶ cursor++ ; position := max(position,n) ; EMITS NOTHING
        │      └─ FIRST announcement on this connection ─▶ head := n ; reconcileFor() STARTS (once per connect)   ◀ THE ANCHOR
        └─ change ─▶ changeFrameToPayload ─refusal─▶ refused++ ; else change++ ; unknownKind += known?0:1
              ├─ the gate is SHUT (this connection's answer has not reached the sink) ─▶ HELD, in arrival order
              └─ the gate is OPEN ─▶ cursor ≤ position ─▶ dropped++ (the re-read covers it) ; else position := cursor ; applied++ ; onChange
reconcileFor() ─throws│rejects│answers no 4-key descriptor─▶ settle: the SUBSCRIPTION IS CLOSED, typed failure (fail-closed)
             └─ answer ─▶ onChange(answer)  ◀ ORDERED BEFORE any applied frame ─ then gate := OPEN ; drain `held` in arrival order,
                            once, through the SAME judge — and STOP if the connection was retired mid-drain (F-10)
close() ─▶ generation++ ; the connection is ENDED (so a late callback cannot settle the feed) ; handle.close() ; total, idempotent
onError │ onClose ─▶ ONE ending, and only for the connection that is STILL LIVE: typed failure, live := null (F-10)
```

**Nothing retries**: no `setTimeout`/`setInterval`, no backoff, no poll, no second connection (contract §2.5, `D-82` clause 4). **The one place a frame waits is the in-flight hold** — `Connection.held`, mandated by limb 3 of the ruling ("no change frame is applied until the answer has been delivered"): it is one-shot, in arrival order, drained the instant the answer lands, discarded on fault/close, and it has **no timer and no re-arm**, so it is not the "queue" the contract's prose forbids (named upward in §9 `O-4`).

**4.4 The wiring — four sites in `src/main/main.ts`.** (1) **construction**, beside the two engine proxies and after the CRUD proxy (`READ` `:830`, `:839-870`), INERT; (2) **`reconcile`** = the FULL engine CRUD read: `listWikis()` then EVERY PAGE of each wiki's `listDocuments` (`READ` `engine-crud-rag-store.ts:772-779`), answered as ONE `structural` descriptor — paginated (`RECONCILE_PAGE_SIZE = 200`) and page-bounded (`RECONCILE_MAX_PAGES = 50`) because the list IS paged (`F-4`; `c9(h)` pins both); (3) **the sink** = `backend.broadcast(IPC_RAG_STORE_CHANGED, descriptor)`, the EXISTING channel (`READ` `types.ts:403`) — no new constant, no `preload.ts`/`types.ts` byte; (4) **`void engineChangesFeed.connect()` AFTER the window and after its content has loaded** (`main.ts:1372-1378`, below `await win.loadFile(...)`), plus **`close()` on `app.once('before-quit')`**.
**`F-2`, RULED AND FIXED — the site is the claim.** As landed, `connect()` was issued BEFORE `new BrowserWindow`, so the announcement, the re-read descriptor and every frame of that connection were broadcast into **no realm** (`backend.broadcast` is a no-op with no attached window, `READ` `mcp-server.ts:2849-2857`) — a hidden loss, and nothing forced the early call. It is now issued **after** the window exists and has loaded, **unawaited** (an absent engine must not hold the boot: the `waitForReady` precedent, `READ` `main.ts:828-829`), and `c9(g)` reads the ORDER as a source clause with a mutant that lifts the call back above `new BrowserWindow(`. **What the move proves and does not:** the realm exists; it does **not** establish that the renderer has registered its listener yet (`SidebarPanes.boot()`'s byte, `B-6`/`B-8`'s receipt), and this page does not claim it.

## 5. Failure and boundary states (all MEASURED ✔)

| State | Behaviour |
|---|---|
| a non-2xx answer (`sse: non-2xx response`, `READ` `engine-rag-store.ts:782-785`), a premature close, a transport fault | `status().failure instanceof EngineUnavailable` with its `cause`; ZERO descriptors fabricated; nothing thrown out of `connect()` ✔ |
| a throwing/rejecting `reconcile`, or one answering **no four-key descriptor** (`F-9`) | typed failure **and the subscription it opened is CLOSED** — fail-closed under the anchor, where the socket exists before the read ✔ (`a7`, `c8(b)`) |
| a connection that never announces | applies **nothing**; `status()` reads `connected: true, announced: false` with no position — NAMED, never timed out ✔ (`c1(b)`) |
| a sink that throws | **contained**; the frame still counts as applied and the position advances ✔ (`F-1(b)`) |
| a repeated or backwards cursor | a DROP, counted; `position` never moves backwards ✔ |
| a frame from a RETIRED connection; a retired socket's late `onError`/`onClose`; a retire mid-drain | ignored before counting; cannot write the live feed's `connected`/`failure`; stops the drain ✔ (`F-10`) |
| `close()` twice, or before any `connect()` | total no-op ✔ |
| `connect()` twice without `close()` | declared no-op: ONE socket, ONE re-read ✔ (`F-1(d)`, `a4`) |

## 6. The live arm — PARKED, with its causes

**`NOT DRIVEN`, by the TWO measured causes of `docs/defects.md:35`** (`GNOSIS-ENGINE-REFUSES-THE-FORK-QUERY-CLIENT`, **OPEN, catalogued, never patched** — D-9): **(1)** the adjacent `../Gnosis` build answers the fork's own `createSseClient` with **`sse: non-2xx response`** on the GET — and this feed is fetched through that SAME client; **(2)** every write that could commit a journal entry to be framed goes through the fork's POST envelope, which the same engine refuses with **`malformed envelope: schemaVersion`** — so nothing this app can do produces a `change` frame. **The probe read `NOT-RUN`: nothing was listening on `127.0.0.1:8080`** (`curl` exit `7`), and no engine was spawned. No engine event is claimed.

## 7. The rows, and the layer each reads at

| Row | Subject | File | Status |
|---|---|---|---|
| `c1` | (a) a `cursor` frame is a POSITION (0 descriptors, head `7`, `frames.cursor === 1`) and STARTS the re-read; a `change` at 8 then applies once — (b) a connection with NO announcement applies NOTHING and `status()` names the absence | `integration/consumer-frames` | green |
| `c2` | EXACTLY four keys, `nodeIds`/`edgeIds` identity-carried, the six-term edge string untouched, `store === 'gnosis:engine'` | `unit/change-frame-map` + `integration/consumer-frames` | green |
| `c3` | all 20 tokens + a 21st unknown → `structural`, emitted, `unknownKind` moves; control reads 0 | idem | green |
| `c4` | numeric de-dup: same cursor once, below-`position` dropped, `'9'→'10'` twice, a >2^53 pair twice — every limb driven through a connection that ANNOUNCED | `unit/cursor-dedup` | green |
| `c5` | (a) one `reconcile` per connect, STARTED by the announcement, the sink's ORDER asserted, window dropped *because the re-read covers it*, above-head applied once — (b) skip-the-second-re-read mutant reads 1 — (c) pre-subscribe mutant leaks the `F-5` commit — (d) the REAL module through that interleaving, coverage complete | `integration/reconnect-reread` | green |
| `c6` | non-loopback refused BEFORE subscribing (0 `subscribe` calls); the URL through the seam; source clause + mutant | `integration/transport-and-failure` | green |
| `c7` | every fault typed `EngineUnavailable`; NO timer/retry/backoff in the module, mutant first | idem | green |
| `c8` | engine-absent typed and loud, nothing out of `connect()`; a failed re-read CLOSES the subscription; a healthy control | idem | green |
| `c9` | (a)-(f) ONE construction, `void connect()`, the sink on the existing channel, `close()` on the quit path, the channel literal once, the three bytes — (g) SOURCE ORDER: `connect()` after `new BrowserWindow`, mutant first — (h) the re-read's walk is PAGED and BOUNDED, two mutants first | `integration/wiring-census` | green |
| `c10` | one registry/one dispatch THROUGH `fire`, empty census `[]`, total release, copies, frozen | `integration/pane-change-arm` | green |
| `c11` | `INV-E` structurally: 0 `loadAppGraph`/0 `mountOperator`/0 `refresh(`/no host in `pane-events.ts`, mutant first | idem | green |
| `a1`…`a12` | the adversarial battery (§8): hostile frames, host faults, the lifecycle boundaries, the engine's real connect order (`a11`), and `F-9`/`F-10` | `integration/adversarial` | green |

## 8. Adversarial findings, and each one's disposition

- **`F-1` (HOST — FIXED, four limbs, each with a regression row):** (a) a non-canonical decimal cursor would have been coerced — now a typed refusal (`a1`); (b) a throwing SINK would have been caught by `createSseClient` and re-fired as `onError` — now contained (`a2`); (c) a retired connection's frame could advance the position — now generation-gated (`a3`); (d) `connect()` twice would have opened a SECOND socket — now a declared no-op (`a4`).
- **`F-2` (RULED BY `L1` — FIXED HERE, was "owed"):** the pre-window connect dropped the descriptor into no realm. `connect()` now sits after the window and its load, unawaited; `c9(g)` pins the order with a mutant. Residual sentence now lives in the contract's §4 hop 1 amendment.
- **`F-3` (HOST — FIXED):** a `reconcile` answering a NON-descriptor was passed straight to the broadcast; it is now a typed failure with the subscription CLOSED (`a7`).
- **`F-4` (HOST — FIXED):** the re-read asked for ONE unpaged `listDocuments` while the engine's CRUD list is PAGED — a partial reconcile claiming a full one. Now a bounded page walk, pinned by `c9(h)`.
- **`F-5` (RULED BY `L1` — FIXED HERE, was "owed"):** the engine reads the head (`:977`) and frames it WITH the retained window (`:983-996`), so a re-read anchored to `connect()` is blind to the commits between its read and that head read — `≤ head` (dropped by §2.3) **and** absent from the answer: a silent gap. The order is now `subscribe` → announcement (head + start) → answer → judge, and `c5(a)`/`c5(d)` measure it, `c5(c)` proves the old shape leaks the commit. Residual sentence now lives in `ASM-B4-5`'s rejected alternative.
- **`F-6` (HOST — FIXED):** a 401-digit decimal satisfied "digits only" and rendered `Infinity` on `status().position`; now refused (`a10`).
- **`F-7` (HOST — FIXED):** a client settling SYNCHRONOUSLY inside `subscribe` left a socket no path could close; closed at assignment (`a9`).
- **`F-8` (DOC — corrected):** §2 now says a retired connection's frame is excluded BEFORE counting.
- **`F-9` (HOST — FIXED this pass, found by the post-ruling adversarial pass):** only `undefined`/`null`/array/primitive answers were fail-closed, so `{}` or `{kind:'structural'}` reached the broadcast AND opened §2.3's "covered by the re-read" gate on an answer that covered nothing. The answer is now checked against the fork's exact four keys (`a7`, six new limbs).
- **`F-10` (HOST — FIXED this pass, same pass):** `close()` did not mark the connection ENDED and `settle` wrote the FEED's `connected`/`failure` without checking liveness, so a late `onError`/`onClose` from a retired socket could report a healthy successor as failed; the held-frame drain also lacked a liveness gate. Both closed, with a control-backed row (`a12`).
- **`O-2` re-grained, not deleted:** no row pins `ENGINE_ENDPOINTS`' exact key set (measured: none exists), so nothing was deleted; `c9(f)` pins the four-key table instead.

## 9. Assumptions (`{id, text, alternative}`) and the readings this pass took

- **`ASM-L2-1`** — `reconcile` returns the DESCRIPTOR the sink receives. **Rejected:** the consumer shaping a listing into one (that would put the CRUD result shape inside this module, against `ASM-B4-3`).
- **`ASM-L2-2`** — one live subscription, always; `connect()` while connected is a DECLARED no-op. **Rejected:** close-and-reopen inside `connect()`.
- **`ASM-L2-3`** — a failed (or non-descriptor) re-read means the subscription does NOT stand. **Rejected:** opening/keeping it and treating frames as deltas (the gap claim `ASM-B4-4` refuses).
- **`ASM-L2-4` (this pass)** — the anchor's per-connection head is the ONLY watermark source; a later announcement on the same connection moves it and starts no second read. **Rejected:** a second `reconcile` per announcement (the count in `c5(a)` would lose its meaning) and a default head at `connect()` (a watermark the engine never sent).
- **`O-4` (carried to `L1`, contract wording)** — `ASM-B4-5` says "no timer, no queue"; limb 3 of the same ruling requires frames that arrive while the answer is in flight to be HELD. The implemented hold is one-shot, ordered, liveness-gated and non-retrying (§4.3), i.e. not the retry "queue" the prose forbids — the prose is the harness's to re-word, not this module's to violate.
- **`R-1` the amended red set (RUN before any `src/` byte of this pass):** `npx vitest run tests/unit/gnosis-changes tests/integration/gnosis-changes` → **5 files red / 8 rows failed / 41 passed (49)**, `git status --porcelain -- src package.json` showing exactly the landed, uncommitted change set (`engine-changes.ts` untracked + four modified) and nothing touched by this pass. The 8: `c1(a)`, `c1(b)`, `c5(a)`, `c5(d)`, `c8(b)`, `c9(g)`, `a7`, `a11`.
- **`R-2` the green readings (final bytes, this pass):** scoped **8 files / 51 rows, all green**; `npm test` **4 failed / 3517 passed / 22 skipped (3543)** — all four class (a) (the real-ollama `embeddinggemma` gates: `ollama embed: HTTP 404`, model absent), class (b)/(c)/(d) **0**; `typecheck` exit `0`; `build` exit `0` (all five bundles emit); `drift` **`CLEAN`** (15 checks, 0 differences) with its `PIN` arm EQUAL to `49d3137dbf81b6e535e62a30d9e494d80e9589b3`. **The scoped rows moved 45 → 51 (+6: `c1` → `c1(a)`/`c1(b)`, `c5` → `c5(a)`…`c5(d)`, plus `c9(g)`, `c9(h)` and `a12`); the full suite moved 3,541 → 3,543 for this pass's last two rows (+2, `c9(h)` and `a12`), and the 3,526 figure this page recorded at the landing is 15 short of 3,541 because committed rows from the `B-5` pane-links landing (`85b0fda`, the last commits-touching commit) are inside today's count and were not inside that record — flagged, not smoothed, and provably NOT this unit's byte (`git status --porcelain -- tests` shows only the two gnosis-changes directories).**
- **`R-4` the mutation readings (this pass, driven red before green, as `c5`'s and the source clauses' discipline requires):** with the three `F-10` guards reverted in `engine-changes.ts`, `adversarial` reds on `a12` with all three limbs (`a RETIRED connection's terminal callback settled the LIVE feed`; `…wrote a typed failure onto the live feed`; `a close() from INSIDE the drain still applied the frames behind it (order ["reconciled","held-1","held-2","held-3"])`), `wiring-census` stays 8/8, and the restore is byte-identical (`sha1 6be55fac…` before and after). The amended rows were also RUN RED against the landed (pre-ruling) module first: 8 failed / 41 passed (49) — `c1(a)`, `c1(b)`, `c5(a)`, `c5(d)`, `c8(b)`, `c9(g)`, `a7`, `a11`.
- **`R-3` the three behaviours:** parse/map — `c2` + the 20-token table + the 21st unknown through the stream; cursor de-dup — `c4(a)` same cursor `applied 1 / dropped 1`, `c4(b)` `'9'→'10'` twice, `c4(d)` `…992→…993` twice, and the drop-because-covered limb in `c5(a)` (`dropped 2` on a two-frame window) and `a11`; reconnect-by-re-read with the anchor — `c5(a)` reads `reconcile` 0 before the announcement, 1 after the first, 2 after the second, with the sink's order `reconcile-1-start, reconciled-1, live-6, reconcile-2-start, reconciled-2, live-7`, and `c5(d)` reads `applied 1 / dropped 3` with coverage `{1,2,3,4}` complete; the no-announcement arm is `c1(b)`.
- **`O-1` the map's `N` — SETTLED AT `L1`, restated against its wording and NOT owed by this page:** `gnosis-changes` reads **`N = 12` under the map's definition** (`docs/L1/foundation-migration-program.md:26`; cap `50 + 10×12 = 170`, unchanged) — the module's two new exports plus the ten named members they reach — and **`8` under the narrower definition** ("the members the two exports reach directly"). Both figures are recorded in the contract's §8 `O-1`; the delta is RECORDED, not averaged away, and `strata/modules.json` is `L0`'s to move with the definition named.
