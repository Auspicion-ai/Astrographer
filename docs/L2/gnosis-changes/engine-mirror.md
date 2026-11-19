# L2 — `gnosis-changes` / `B-4a` `engine-store-mirror`: the module's I/O surface, the two triggers and their ORDER

**Layer:** L2 · **Date:** `2026-11-19` · **Ceiling:** 150 lines · **Module:** `gnosis-changes` (the map's paths unchanged; the unit adds `src/main/engine-mirror.ts`) · **Contract:** `docs/L1/unit-b-4a-engine-store-mirror.md` (§2 route · §3 surface · §4 order · §5 invariants · §6 rows · §8 park · §9 `O-1`/`O-2`).
**Status:** `LANDED`, envelope-green on **12 files / 85 rows**; **both limbs' live arm PARKED** (contract §8). `LANDED` = a fact a revert cannot erase (a row, this page); `DESIGN` = a claim about the change set's own bytes. **Layer declaration (D-10, RCA-12):** every reading here is **envelope** — real modules over a real store on a `/tmp` path, harness rows over `src/**`, source clauses over TEXT. **No engine event is claimed; no row opens a socket (§`C3`).**
**Census convention (one, shared with the L3 page):** an "export" is an `export` **declaration**, types included — `engine-mirror.ts` has **SEVEN** (`grep -c '^export '` = 7: five interfaces + one type alias + `createEngineMirror`); `engine-changes.ts` keeps its **six**; `engine-crud-rag-store.ts` gains **ZERO** declarations (one OPTIONAL member on an existing interface).

## 1. The paths, and which take part

| Path | Takes part? | Why |
|---|---|---|
| `src/main/engine-mirror.ts` | **yes — NEW (25,262 B)** | the projection, the two triggers, the ONE serialization point (§2–§4) |
| `src/main/engine-crud-rag-store.ts` | **yes — +47/−0** | `EngineCrudRagStoreOptions.onAccepted` + `acceptedWriteFor` + ONE awaited call in `crudCall` (§5 site 2) |
| `src/main/main.ts` | **yes — +82/−19** | the wiring only, THREE sites (§5) |
| `src/main/engine-changes.ts` · `engine-rag-store.ts` · `rag-store.ts` · `src/shared/types.ts` · `preload.ts` · `package.json` | **no — a MEASURED NEGATIVE (§9 `R-5`)** | `B-4`'s watermark/hold/fail-closed settle, `ENGINE_ORIGIN_STORE`, `applyBatch` and every channel are consumed as-is |
| `src/main/mcp-server.ts` | **no — ZERO byte** | `handleRagDocHeadsIpc` is the READER this unit exists to satisfy; it already exports the computation |

## 2. The I/O surface, exactly (§3)

```ts
// src/main/engine-mirror.ts — ONE runtime export; SEVEN export declarations
export interface EngineMirrorDocument { documentId: string; title: string; tags?: string[]; updatedAt?: string }
export type EngineMirrorWrite = { kind: 'upsert'; document: EngineMirrorDocument } | { kind: 'remove'; documentId: string }
export interface EngineMirrorRead { documents: EngineMirrorDocument[]; complete: boolean }   // `complete` = the walk read the whole list
export interface EngineMirrorOptions {
  store: () => RagStore | null            // a THUNK: the shell's hot default-store swap must be honoured
  read: () => Promise<EngineMirrorRead>   // the engine document-LIST read; main.ts owns the bounded paged walk (`F-4`)
  origin?: string                         // defaults to ENGINE_ORIGIN_STORE ('gnosis:engine')
  maxPerWalk?: number                     // how many listed ids ONE walk may project (default 2000; main.ts states 10000)
}
export interface EngineMirrorStatus {     // a COPY per call; a CLOSED key set (§`S1`)
  projections: number; accepted: number; projected: number; unchanged: number; removed: number
  refused: number; unresolved: number; failed: number; walks: number; lastFailure: string | null
}
export interface EngineMirror {
  accepted(write: EngineMirrorWrite): Promise<void>
  settle(descriptor: RagStoreChangedPayload): Promise<void>
  reconcile(): Promise<RagStoreChangedPayload>
  status(): EngineMirrorStatus
}
export function createEngineMirror(opts: EngineMirrorOptions): EngineMirror
```

- **The counters are CLOSED and each has ONE meaning:** `accepted` = writes offered by the CRUD seam; `projected` = one `applyBatch` landed a projection; `unchanged` = an equal projection or a remove of an absent one (**no batch**); `removed` = one batch deleted a projection; `refused` = a record the mirror does not own holds the id (**nothing written**); `unresolved` = a descriptor that resolved to **no walk**; `failed` = a contained fault; `walks` = walks started; `projections` = the MARKED roots the store holds **now** (read from the store, so a restart cannot make it lie); `lastFailure` = a typed STRING or `null`.
- **No new vocabulary:** the descriptor is `RagStoreChangedPayload`, the store is `RagStore`, and the module imports **no** Electron, DOM, fs, socket, clock or timer.

## 3. The two triggers, and the ORDER is the whole of the invariant (§4)

```
accepted(write)  [limb (a) — the CRUD seam, AWAITED before the proxy resolves; its fault is CONTAINED]
  accepted++ ; a FIFO JOB on the ONE queue (L3 §4), so a write can never land inside a walk's project/remove phase:
     root := store.getNode(documentId)
       upsert ─▶ root exists AND unmarked ─────────────────────▶ refused++ , NOTHING WRITTEN (a LOCAL doc is never clobbered)
                 a record at the DERIVED head id that our own `doc-head` edge does not name ─▶ refused++   (adversarial `F4`)
                 else plan(root|head|edge) ─ equal ─▶ unchanged++ (NO batch)
                                          └─ differs ─▶ ONE applyBatch([putNode root, putNode head, putEdge]) ─▶ projected++
       remove ─▶ root absent ─▶ unchanged++ (NO batch) ; unmarked ─▶ refused++ ; marked ─▶ ONE batch ─▶ removed++
  ANY fault ⇒ failed++ + lastFailure ; the promise RESOLVES (the engine already accepted the write)

settle(descriptor) [limb (b) — THE ORDERING POINT; EVERY descriptor is FIFO-serialized so sink order stays frame order]
     not a four-key engine-origin `structural` descriptor ─▶ unresolved++ ; a NO-OP demand (still ordered) ; NO walk
     a four-key engine-origin `structural` descriptor (WHATEVER it names — `nodeIds` are GRAPH ids, `ASM-B4A-2`) ─▶ a WALK DEMAND
  the promise RESOLVES only after the walk that STARTED AFTER this demand finished ⇒ the caller's broadcast cannot precede it

  walks++ ; listing := await read()
     ├─ read() rejects · `documents` not an array · an unreadable entry · `complete !== true` · over `maxPerWalk`
     │    └─ failed++ + typed lastFailure ; NOTHING WRITTEN (no projection, NO invented delete — §5(ii), `ASM-L2-M2`)
     └─ complete ─▶ project each listed document ; then remove every MARKED root NOT listed (the ONLY delete-on-absence path)
  reconcile() ─▶ the SAME queue ─▶ the walk's own ids when it completed, `[]` when it did not ─▶ the four-key descriptor

status() ─▶ a COPY of §2's closed set, side-effect free (a diagnostic read never increments a counter)
```

- **Why limb (a) is AWAITED:** a caller holding the engine's answer must already be able to re-read the doc-heads. **Why the sink must await `settle`:** `B6-F1` is exactly a pane that re-reads *before* the mirror wrote.
- **Containment is both ways:** a sink fault never becomes a rejection of the engine's accepted answer, and a walk fault never becomes a rejection of a broadcast.

## 4. The local doc-head contract, the marker, and the equal-projection shortcut

- **The doc-head triple** (`READ` `markdown-parse.ts`'s `data-doc-head` + `handleRagDocHeadsIpc`): a **document ROOT** `{id: <engine documentId>, type: 'div', content: '', ownedNodeIds: [headId]}`; a **head** `{id: headId, type: 'h1', content: title, props: {'data-doc-head': true}}`; **ONE** `doc-head` edge `{source: headId, target: documentId, documentIds: [documentId]}`. The doc-heads read answers the edge's **target** as `documentId` and the **source node's `content`** as `title`, which is why this triple is what makes an engine write visible.
- **Deterministic ids:** `headId = '<documentId>:engine-head'`, `edgeId = 'doc-head:<documentId>'` — derived, never random (§`M2`).
- **The MARKER:** the root carries `props['data-engine-mirror'] === true`. The mirror **only ever updates or removes a record it owns** — a marked root, or a head node its own `doc-head` edge names. A **local** document holding a colliding id is `refused` (counted), never clobbered, **including through the derived head ids** (adversarial `B4A-F4`: the derived namespace is not injective over opaque engine ids).
- **Equal projection ⇒ NOTHING is written** — the comparison ignores timestamps and compares only what the projection SETS, and it compares tags **after the store's own normalization** (`B4A-F2`). That is how "double-apply" is defeated measurably (§`M2`: `projected 1 / unchanged 1`, journal length and node/edge counts unchanged) and why a repeated descriptor cannot become a journal flood.
- **Tags:** limb (a) is authoritative — `[]` clears them; **limb (b) carries none and must not strip them** (`B4A-F1`). A blank tag is dropped and an unparseable stamp falls back to the fixed epoch, so one bad engine field cannot kill the triple (`B4A-F8`).

## 5. The wiring — THREE sites in `src/main/main.ts`, and each site is part of the claim

1. **The mirror, INERT at construction** (`:851-884`), after `createRagStoreRuntimeController(` (`:810`) and **before** the CRUD proxy it feeds (`:897`). `opts`: `origin: ENGINE_ORIGIN_STORE`; `store: () => runtime.getDefaultStore()`; **`maxPerWalk: RECONCILE_PAGE_SIZE * RECONCILE_MAX_PAGES`** — the two bounds must AGREE (`B4A-F9`, the constants at `:313-314`); `read:` the **bounded paged walk** (`:858-883`: `listWikis` then every page of `listDocuments`), answering `{documents, complete}` where `complete` is false iff any wiki hit the page bound.
2. **The CRUD proxy** (`:897-900`) gains `onAccepted: (write) => engineMirror.accepted(write)` (`:899`) — ONE member, no other byte: `crudCall` calls it **once**, after `decodeCrudResponse` returned, only when the decoded `method` equals the requested one (`G1(b)`), for the SIX mutating document methods.
3. **The sink** (`:944-957`) becomes `settle` then **broadcast** in the SAME expression: `onChange: (d) => { void (async () => { await engineMirror.settle(d); try { backend.broadcast(IPC_RAG_STORE_CHANGED, d) } catch {} })() }` — `settle` at `:949`, the broadcast at `:951`; the feed's `reconcile` becomes `() => engineMirror.reconcile()`. The `void` marks the float (`onChange` is `(d) => void`; `engine-changes.ts` takes ZERO byte), `settle` never rejects, and a throwing broadcast stays the sink's.
- **No second publisher:** the mirror broadcasts nothing and emits no descriptor; `IPC_RAG_STORE_CHANGED` keeps its one engine emitter, no channel constant, no `preload.ts` byte, no `types.ts` widening.

## 6. Failure and boundary states (every row of this table names the row that MEASURES it)

| State | Behaviour | Row |
|---|---|---|
| the engine **refused** (`EngineWireError`, `ConflictError`) | `decodeCrudResponse` throws **before** the seam: `accepted 0`, store byte-identical, doc-heads unchanged | `G1` |
| the engine answered a **malformed** body (`{method}` with neither `result` nor `error`) | the decode refuses it before the seam: the call rejects, `accepted 0`, nothing written | `D4` |
| a decoded `method` ≠ the requested one | the seam does not fire; the proxy still relays the answer | `G1(b)` |
| a local/unowned record holds the id — the root **or** the derived head | `refused`, NOTHING written, the record untouched | `M5`, `H4` |
| a retitle · a re-applied identical document · the same tags in another order/spacing | the first projects; every later one is `unchanged` with NO batch | `M2`, `M3`, `H2` |
| a `remove` for an absent projection | `unchanged`, NO batch | `M4` |
| `read()` rejects · `documents` not an array · an unreadable entry · `complete:false` · over `maxPerWalk` | `failed` + typed `lastFailure`; **NOTHING written**: no projection, **no invented delete** | `G2`, `H3`, `H5` |
| limb (b) after a limb-(a) write | the tags limb (a) projected SURVIVE and the walk reads `unchanged` | `H1` |
| a completed, fully-read list | marked roots absent from it are REMOVED — the only delete-on-absence path (§5(ii)) | `D1` |
| a write offer while a walk is in flight | the FIFO job means the walk cannot delete the write it did not see | `D2` |
| a `content` descriptor · a foreign `store` · a shape-less descriptor | `unresolved`, `walks` unchanged | `G4` |
| three structural descriptors during ONE slow walk | the walk runs **TWICE** (in flight + trailing); every caller resolves after its own covering walk | `G3` |
| a throwing write job · a throwing store thunk in `status()` | contained: the promise resolves, `failed` moves; `status()` counts nothing | `H6`, `H7` |
| the store absent, or the store's `applyBatch` → `{ok:false}` | `failed` + typed `lastFailure`; no throw out of `accepted`/`settle`/`reconcile` | `D3` |

## 7. The rows

| Row | Subject | File | Status |
|---|---|---|---|
| `E1` | end to end limb (a): an engine-shaped write → the accepted seam → the local store → `handleRagDocHeadsIpc` answering the NEW document | `integration/mirror-limbs` | green |
| `E2` | end to end limb (b): a document the fork never wrote → a REAL `change` frame → `settle` → the sink → doc-heads answering it **at the broadcast instant** | idem | green |
| `M1`·`M2`·`M3`·`M4`·`M5`·`M6`·`S1` | the triple's shape · idempotency · the engine authoritative on a retitle · remove + remove-absent · the local-collision refusal · the walk's descriptor · `status()` | `unit/engine-mirror` | green |
| `G1`·`G1(b)`·`G2`·`G3`·`G4` | the refused answer writes nothing · an answer about another method never reaches the seam · a failed/truncated walk changes nothing · coalescing (`walks 2`) · `content`/foreign/shape-less walk nothing | `integration/mirror-limbs` | green |
| `A1`·`A2`·`A3` | the three WRONG designs driven (`G5`): double-apply · reorder against the re-read · write-on-refusal — each with the shipped reading beside it | `integration/mirror-adversarial` | green |
| `H1`…`H8` | the adversarial findings' regressions: tags across limbs · normalized tags · a non-list/`malformed` list · the derived-id collision · truncated `reconcile` · a throwing job · `status()` side effects · an unparseable stamp/blank tag | idem | green |
| `D1`·`D2`·`D3`·`D4` | the doc-review's coverage findings (RCA-6): delete-on-absence from a COMPLETE walk · a write offered mid-walk survives it · an absent store / a refused batch · a malformed engine body never reaches the seam | idem | green |
| `C1`·`C2`·`C3` | the wiring census · `INV-E` with ONE ISOLATING MUTANT PER CONJUNCT · the park's clause (no socket/spawn/port in this unit's rows) | `integration/mirror-wiring` | green |
| `c9(c)`·`c9(h)` | **RE-GRAINED, never deleted** (`O-2`): `c9(c)` reads a SECOND window around `createEngineMirror(` for `listWikis(`/`listDocuments(`/the origin/the two bounds; `c9(h)` needles `read: async` instead of `reconcile: async` and keeps BOTH of its mutants (unpaged, unbounded) driven false first. Every subject kept | `integration/wiring-census` | green |

## 8. Adversarial findings (`B4A-F…`) — every one a HOST defect, FIXED here with its regression row

| id | Sev | The reading, as measured | Disposition |
|---|---|---|---|
| `B4A-F1` | MED | a limb-(b) walk stripped the tags limb (a) projected (`tags ['guide'] → []`, journal 1→2) | FIXED — a limb that carries no tags keeps the stored ones; `H1` |
| `B4A-F2` | MED | `['guide ','guide']` three times ⇒ `journal 1→2→3`, `projected 3 / unchanged 0` (raw tags compared against the store's normalized record) | FIXED — tags normalized before comparing/writing; `H2` |
| `B4A-F3` | MED | a list claiming `complete:true` but carrying one unreadable entry (or `documents:null`) deleted projections (`removed 1, failed 0`) | FIXED — a non-list / a dropped entry is a TYPED failure and writes NOTHING; `H3` |
| `B4A-F4` | MED | derived head ids are not injective: `['X:engine-head','X']` overwrote the first document's marked ROOT with an `h1`, and a LOCAL document at `X:engine-head` was rewritten (`refused 0`) | FIXED — a record at the derived head id must be proven OURS by our own `doc-head` edge, else `refused`; `H4` |
| `B4A-F5` | LOW | `reconcile()` answered `nodeIds:['doc-p1','doc-p2']` from a truncated read that projected nothing | FIXED — a walk that did not complete names NOTHING; `H5` |
| `B4A-F6` | LOW | a throwing write job escaped the drain: `accepted` PENDING FOR EVER, `failed 0` (and the CRUD seam awaits it) | FIXED — the job's fault is caught, counted, and the promise resolves; `H6` |
| `B4A-F7` | LOW | three `status()` calls against a throwing store thunk read `failed 1, 2, 3` — a diagnostic read rewrote the state it reports | FIXED — `status()` reads through a non-failing thunk; `H7` |
| `B4A-F8` | LOW | `updatedAt:'yesterday'` or `tags:['']` failed the WHOLE batch, so the document could never be mirrored | FIXED — an unparseable stamp falls back to the epoch, a blank tag is dropped; `H8` |
| `B4A-F9` | LOW | `maxPerWalk` (2000) was 5× tighter than the walk's own bound (10 000), so an engine with >2000 documents had NO mirror at all | FIXED — `main.ts` states `maxPerWalk: RECONCILE_PAGE_SIZE * RECONCILE_MAX_PAGES`; the two bounds are one number |
| `B4A-F10` | LOW | **the contract's `E2` mutant claim is FALSIFIED as a reading:** deleting the mirror limb from `main.ts`'s sink reds `C1` and **not** `E2` (E2 drives its own sink, and `main.ts` is never importable). The wiring's coverage is the mutant-first source clause `C1(c)` | RECORDED, not fixed: `E2` is a module-level end-to-end row and does not claim the wiring; `C1(c)`'s clause is the sink's coverage and reds on the mutant. Named for `L1` as a contract-wording correction |

**Census of this unit's findings: TEN (`B4A-F1`…`B4A-F10`) — NINE host findings FIXED here, each with its regression row, and ONE coverage/wording finding recorded with its disposition. No package (`provident-ssr`/`provident-storeroom`/`../Gnosis`) defect was found, so nothing is catalogued for `docs/defects.md` and no `../Gnosis` byte was touched.**

## 9. The readings (each with its runner)

- **`R-1` the RED SET, RUN and printed before any `src/` byte (TestWriter):** `Test Files 4 failed | 7 passed (11)` · `Tests 18 failed | 51 passed (69)`. The 18: `M1`–`M6`, `S1` (7, `unit/engine-mirror`) · `E1`, `E2`, `G1`, `G2`, `G3`, `G4` (6, `integration/mirror-limbs`) · `C1`, `C2`, `C3` (3, `integration/mirror-wiring`) · `c9(c)`, `c9(h)` (2, the re-grain). Every module row's problem named the CAUSE (`engine-mirror.ts` does not resolve: `Cannot find module …engine-mirror.js`), and `git status --porcelain -- src` printed **NOTHING** at that run — the pass's own `src/` bytes were absent. Six row corrections were disclosed by the TestWriter (a nested-backtick parse error, a nonexistent `mod.logs`, a double construction, two rows that flagged their own forbidden vocabulary, a no-op push, one reader's tick); none weakened a clause.
- **`R-2` the greens:** `npx vitest run tests/unit/gnosis-changes tests/integration/gnosis-changes` ⇒ **`Test Files 12 passed (12)` · `Tests 85 passed (85)`** (85 = 53 of `B-4`'s + 16 red-set rows + `G1(b)` + `A1`–`A3` + `H1`–`H8` + `D1`–`D4`). `npm test` ⇒ **`Test Files 2 failed | 191 passed (193)` · `Tests 4 failed | 3581 passed | 22 skipped (3607)`**, and **all four are class (a)** — the standing real-ollama gate (`ollama embed: HTTP 404`, thrown at `src/main/embeddings.ts:237`/`:267` and propagated out of `score`'s `queryEmbedFn` call at `:840`; the `embeddinggemma` model is absent); class (b)/(c)/(d) = **0**. `typecheck` exit **0**, zero diagnostics. `build` exit **0**, five bundles (`main.cjs` 2.4mb · `preload.cjs` 21.8kb · `standalone.mjs` 1.3mb · `battery-host.mjs` 1.7mb · `renderer.js` 1.2mb). `drift` **`CLEAN`** — 15 checks / 0 differences, `revisionChecked`, `PIN` arm EQUAL to `49d3137dbf81b6e535e62a30d9e494d80e9589b3`.
- **`R-3` the two ISOLATING MUTANTS (measured, then restored byte-identically by md5; the grain at that measurement was the then-shipped 81 rows — the `D`-rows of the doc-review pass came after, so `R-2`'s 85 is the same battery one grain later):** **(i)** the ONE `onAccepted` call in `crudCall` disabled ⇒ **`Tests 1 failed | 80 passed`**, the only red **`E1`** (`handleRagDocHeadsIpc` answered 0 rows, expected 1) — `E2` and every `c`/`C` row GREEN. **(ii)** the sink's `await engineMirror.settle(descriptor)` replaced by `void engineMirror.status()` ⇒ **`Tests 1 failed | 80 passed`**, the only red **`C1`** (`C1(c)`: the sink mutant could not be built), `E1` GREEN and `E2` GREEN — the reading behind `B4A-F10`. Restore: both md5s `OK`, `git status --porcelain -- src` byte-equal, battery green again.
- **`R-4` the end-to-end readings:** `E1` — before the write `handleRagDocHeadsIpc` answers `{documents: []}`; after `await proxy.createDocument(...)` it answers `[{documentId:'d1', title:'Getting Started', path: [], tags: ['guide']}]` with `accepted 1 / projected 1` and the store at 2 nodes / 1 edge (root `d1` + head `d1:engine-head` + edge `doc-head:d1`). `E2` — at the announcement the doc-heads reads `[]`; a REAL `change` frame (`kind:'create_document'`, `cursor:'2'`) through the `SseFrameDouble` ⇒ the sink's reading AT THE BROADCAST INSTANT names `doc-e` / `'Engine Doc'`, `walks 3`, and the sink order is the frame order.
- **`R-5` the change set, with the MEASURED zero-byte set:** `engine-mirror.ts` **25,262 B** (new) · `engine-crud-rag-store.ts` **32,435 B** (`+47/−0`) · `main.ts` **89,659 B** (`+82/−19`) · the row files + the extended harness + the re-grained census (`mirror-limbs` 32,103 · `mirror-adversarial` 42,292 · `mirror-wiring` 21,111 · `unit/engine-mirror` 25,455 · `harness` 25,922 · `wiring-census` 21,291) · the two layer pages 150 / 149 lines. **ZERO byte** in `engine-changes.ts` (32,099) · `engine-rag-store.ts` (37,559) · `rag-store.ts` (72,368) · `shared/types.ts` (39,972) · `preload.ts` (43,558) · `package.json` (2,753) — measured as absent from `git status --porcelain`, not from a size — and `git status --porcelain -- vendor package.json strata` plus `git -C ../Gnosis status --porcelain` both print **nothing**.
- **`O-1`** the map's `N` restatement is `L0`'s; the chain prints the export-declaration count (§header: **SEVEN** = 1 runtime + 6 types). **`O-2`** the `c9(c)`/`c9(h)` re-grain is PAID (§7's last row, over the walk's function in `main.ts`'s mirror block); no row of `wiring-census.test.ts` was deleted, and no other row of that file counted anything this wiring moved.
- **`ASM-L2-M1`** `settle` FIFO-serializes EVERY descriptor, not only the triggers, so a no-op cannot overtake a walk and the sink's order stays frame order. **Rejected:** serializing only the triggers (a `content` broadcast could land before an in-flight structural one).
- **`ASM-L2-M2`** a truncated, unreadable or over-bound list writes NOTHING (not even the upserts it saw) — one uniform rule. **Rejected:** projecting the partial list while suppressing deletes (untestable as one reading; "the list IS this" true by halves). **`ASM-L2-M3`** the mirror keeps no bookkeeping: `projections` and every equality decision come from the STORE. **Rejected:** an internal id `Set` — a second source of truth for a fact the store persists.
