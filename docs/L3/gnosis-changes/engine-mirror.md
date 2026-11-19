# L3 — `gnosis-changes` / `B-4a` `engine-mirror`: the module design behind the I/O surface

**Layer:** L3 · **Date:** `2026-11-19` · **Ceiling:** 150 lines (D-2's design class) · **Designs against:** `docs/L2/gnosis-changes/engine-mirror.md` §2 (the exact surface), §3 (the two triggers and their ORDER), §4 (the doc-head triple, the marker, the equal-projection shortcut), §5 (the THREE wiring sites), §6 (failure states), §7 (the rows) · **Contract:** `docs/L1/unit-b-4a-engine-store-mirror.md` §2 (the route and its cost), §3 (the surface), §4 (the two triggers and the order), §5 (the invariants), §6 (the red set).
**Layer declaration (D-10, RCA-12):** all of this is **envelope** — a pure module driven over a real `RagStore` on a `/tmp` path; no Electron, no DOM, no fs, no socket, no timer, no clock. **No engine event is claimed; the parked live arm (contract §8) is not exercised and no probe was run.**
**Census convention (one, shared with L2 §header):** an "export" is an `export` **declaration** in the file, types included — `engine-mirror.ts` has **SEVEN** (five interfaces + one type alias + `createEngineMirror`); `engine-crud-rag-store.ts` gains **ZERO** (one OPTIONAL member on an existing interface).

## 1. Structure

| File | Bytes | Shape |
|---|---|---|
| `src/main/engine-mirror.ts` | **NEW, 27,344 B, 7 export declarations** | (a) the projection **planners** — PURE, `EngineMirrorDocument + the store's current records → Verdict` (`projected`/`removed` with `ops`, `unchanged`, `refused`); (b) the **triple**, minted inside the planner (deterministic ids + the marker), exactly the shape `markdown-parse.ts:557-607` makes local, plus `ownsHead` — the `doc-head`-edge proof that a record at the DERIVED head id is ours (`B4A-F4`); (c) the **ONE serialization point** — FIFO demand queue (`walk`/`job`/`noop`) + coalescing walk (§4); (d) the four members; (e) the exported types (§2) |
| `src/main/engine-crud-rag-store.ts` | **+47/−0 (32,435 B, unchanged by the second pass)** | `onAccepted?: (write: EngineMirrorWrite) => void \| Promise<void>` as the options interface's last member (a TYPE-ONLY import of `engine-mirror.ts`, so no runtime dependency); ONE `await opts.onAccepted(acceptedWrite)` inside `crudCall` AFTER `decodeCrudResponse(...)` returned, guarded by `opts.onAccepted !== undefined && crudResult.method === method` and wrapped in `try/catch`; `acceptedWriteFor(crudResult, args)` — PURE, switches on the ANSWER's own `method`: the five document-returning mutators ⇒ `{kind:'upsert', document: result}`, `deleteDocument` ⇒ `{kind:'remove', documentId}` (from `args`), every read and `createWiki` ⇒ `null` |
| `src/main/main.ts` | **+82/−19 at the landing, +30/−8 in the second pass (91,667 B), 3 wiring sites** | (1) the mirror, INERT, `:861-906` — after the `runtime` thunk (`:820-829`) and BEFORE the CRUD proxy it feeds (`:919-922`); `origin: ENGINE_ORIGIN_STORE`, `store:` the hot-swap thunk, `maxPerWalk: MIRROR_MAX_PER_WALK` (ONE named bound, `B4A-F9`/`B4A-F12`, defined at `:324` from the constants at `:313-314`), `read:` the bounded paged walk (`:869-905`) whose accumulation STOPS at that bound and reports `complete: false`; (2) `onAccepted: (write) => engineMirror.accepted(write)` (`:921`); (3) the sink (`:966-979`): `reconcile: () => engineMirror.reconcile()` (`:968`) and `await engineMirror.settle(descriptor)` (`:971`) BEFORE `backend.broadcast(IPC_RAG_STORE_CHANGED, descriptor)` (`:973`), one expression |

**One planner, one builder, one writer, one queue — and no second vocabulary.** The planner decides and never writes; the builder is the only place an id or the marker is minted; `applyBatch` is the only writer (contract §5, `rag-store.ts:279`); the queue is the only serialization. Nothing else in the module holds state.

## 2. Signatures (the whole runtime surface — the DECLARATIONS verbatim from L2 §2; the trailing comments carry this page's `file:line`)

```ts
// src/main/engine-mirror.ts — ONE runtime export; SEVEN export declarations (§header)
export interface EngineMirrorDocument { documentId: string; title: string; tags?: string[]; updatedAt?: string }
export type EngineMirrorWrite = { kind: 'upsert'; document: EngineMirrorDocument } | { kind: 'remove'; documentId: string }
export interface EngineMirrorRead { documents: EngineMirrorDocument[]; complete: boolean }   // `complete` = the walk read the whole list
export interface EngineMirrorOptions {
  store: () => RagStore | null            // a THUNK: the shell's hot default-store swap must be honoured (rag-store-runtime.ts:710)
  read: () => Promise<EngineMirrorRead>   // the engine document-LIST read; main.ts owns the bounded paged walk (F-4)
  origin?: string                         // defaults to ENGINE_ORIGIN_STORE ('gnosis:engine', engine-rag-store.ts:90)
  maxPerWalk?: number                     // how many listed ids ONE walk may project (default 2000)
}
export interface EngineMirrorStatus {     // a COPY per call; a CLOSED key set (L2 §2, row S1)
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
// internal, deliberately NOT exported (an export set is a contract surface, not a debugging aid): MARKER_KEY = 'data-engine-mirror' ·
// DOC_HEAD_PROP = 'data-doc-head' · EPOCH · DEFAULT_MAX_PER_WALK = 2000 · HEAD_SUFFIX = ':engine-head' · DESCRIPTOR_KEYS (four) ·
// headIdFor · edgeIdFor · Verdict · WalkAnswer · Demand/DemandKind · describe · sameStrings · sameProps · normalizeTags · isIsoStamp ·
// isDocument · isProjectionRoot · ownsHead · planUpsert · planRemove · apply · runWalk · currentStore · peekStore · countProjections · isWalkDemand · submit · drain · the queue
```

## 3. Pseudocode — the projection planner and the doc-head triple

```ts
// ONE planner (no separate "builder": a second place that mints an id is a second vocabulary). `Verdict` is a discriminated value:
// {kind:'projected'|'removed', ops} | {kind:'unchanged'} | {kind:'refused'} — the planner DECIDES and never writes.
function planUpsert(store, doc): Verdict
  const root = store.getNode(doc.documentId) ; head = store.getNode(headIdFor(id)) ; edge = store.getEdge(edgeIdFor(id))
  if (root !== undefined && !isProjectionRoot(root)) return { kind: 'refused' }   // ← THE MARKER FIRST (M5), before ANY equality
  if (head !== undefined && !ownsHead(store, id, headId)) return { kind: 'refused' }   // ← the DERIVED id is not a licence (`B4A-F4`)
  if (rootEqual && headEqual && edgeEqual) return { kind: 'unchanged' }           // ← NO batch: journal + node/edge counts unmoved (M2)
  return { kind: 'projected', ops: [ rootDiffers && putNode(root), headDiffers && putNode(head), edgeDiffers && putEdge(edge) ] }
// ORDER IS LOAD-BEARING: `putEdge` fails when either endpoint is absent (rag-store.ts:1287-1289), so the two nodes precede the edge.
function planRemove(store, documentId): Verdict
  const root = store.getNode(documentId)
  if (root === undefined) return { kind: 'unchanged' }                            // M4 — an absent projection: no write
  if (!isProjectionRoot(root)) return { kind: 'refused' }                         // a LOCAL document is never a projection's subject
  const head = store.getNode(headId) && ownsHead(store, documentId, headId)        // …and the head only when the EDGE proves it is ours
  return { kind: 'removed', ops: [ removeNode(documentId), head && removeNode(headId) ] }
// The root's removal CASCADES its doc-head edge (applyBatchOp's `removeNode`, :1264-1280); the head is named because that cascade misses it.
// `ownsHead` = our OWN `doc-head` edge names `headId` as its source: the ONLY proof that a record at the derived id is this projection's.
// THE TRIPLE, as the planner mints it — the only ids the module ever names, and the shape `handleRagDocHeadsIpc` (:910-941) can read:
//   headId = `${id}${HEAD_SUFFIX}`   edgeId = `doc-head:${id}`   stamp = isIsoStamp(doc.updatedAt) ? doc.updatedAt : EPOCH   // CLOCK-FREE
//   root = { id, 'div', content: '', ownedNodeIds: [headId], props: { [MARKER_KEY]: true }, tags?, createdAt/updatedAt: stamp }
//   head = { id: headId, 'h1', content: doc.title, props: { [DOC_HEAD_PROP]: true }, ownedNodeIds: [], …stamp }   // the title's home (:934)
//   edge = { id: edgeId, kind: 'doc-head', source: headId, target: id, documentIds: [id], …stamp }               // markdown-parse.ts:602
// TAGS (`B4A-F1`/`B4A-F2`/`B4A-F8`): a limb that CARRIES tags is authoritative (`[]` clears them); a limb that carries NONE (limb (b))
// KEEPS the stored ones; and either way the array is normalized the store's way (trim, first-occurrence dedupe, drop blanks, `[]`⇒absent)
// BEFORE it is compared — comparing a raw engine array against a normalized record defeats the equal-projection shortcut for ever.
async function apply(store, verdict): Promise<boolean>     // the ONE writer; the discriminated result is READ, never assumed
  'unchanged' ⇒ unchanged++ ; return TRUE                  // it already HOLDS an equal projection, so the walk may NAME it
  'refused'   ⇒ refused++ ;   return FALSE                 // a record the mirror does not own: nothing written, and NOT named
  const r = await store.applyBatch(verdict.ops)             // `B4A-F11`: the answer is what the store now HOLDS
  if (r.ok === false) fail(`apply: ${r.error}`) ; return FALSE   // a CONTAINED failure — counted, named, never a throw, never named
  else if (verdict.kind === 'removed') removed++ ; else projected++ ; return TRUE
```

## 4. Pseudocode — the ONE serialization point and the coalescing state

```ts
function createEngineMirror(opts): EngineMirror {
  // INERT at construction: no read, no walk, no write (contract §4's last clause; the `main.ts:843-847` discipline — a CODE fact: the body captures `opts`, the counters and closures only, and no row drives construction WITHOUT a demand).
  const counts = { accepted:0, projected:0, unchanged:0, removed:0, refused:0, unresolved:0, failed:0, walks:0 } ; let lastFailure = null
  const fail = (why) => { counts.failed++ ; lastFailure = why }
  // EVERY entrance goes through ONE FIFO queue — limb (a)'s writes as JOBS too, so a write can never land INSIDE a walk's
  // project/remove phase and then be deleted by that walk's own "absent from the list" rule.
  const queue: Demand[] = [] ; let running = false          // Demand = { kind: 'walk'|'job'|'noop', resolve, job? }
  const start = () => { if (running) return ; running = true ; void drain() }
  const submit = (kind, job?) => new Promise((resolve) => { queue.push({ kind, resolve, job }) ; start() })
  async function drain(): Promise<void> {                    // ONE loop, and it cannot reject (its body is inside a `finally`)
    try { while (queue.length > 0) {
      const demand = queue.shift() as Demand
      if (demand.kind === 'noop') { demand.resolve(null) ; continue }          // counted no-op: NO walk, still FIFO-ordered (G4)
      if (demand.kind === 'job') { await demand.job?.() ; demand.resolve(null) ; continue }   // limb (a)'s projection
      const walkers = [demand]                              // a WALK demand coalesces the walk demands ALREADY queued …
      while (queue.length > 0 && queue[0].kind === 'walk') walkers.push(queue.shift() as Demand)
      const answer = await runWalk()                         // … and one that arrives DURING this walk is the NEXT iteration:
      for (const walker of walkers) walker.resolve(answer)    //     ONE trailing walk, never a timer (ASM-B4A-4)
    } } finally { running = false }
  }
  async function runWalk(): Promise<WalkAnswer> {            // NEVER throws; every fault is counted AND named
    counts.walks += 1 ; let listing
    try { listing = await opts.read() } catch (err) { fail(`walk: read failed (…)`) ; return { ids: [], complete: false } }
    if (!Array.isArray(listing?.documents)) { fail('walk: the read answered no document list') ; return { ids: [], complete: false } }
    const documents = listing.documents.filter(isDocument)              // `B4A-F3`: a list that is not a list licenses NOTHING
    if (documents.length !== listing.documents.length) { fail('walk: the list carries malformed entry(ies)') ; … }  // …nor a short one
    if (listing.complete !== true) { fail('walk: truncated …') ; return { ids: [], complete: false } } // NOTHING WRITTEN, NOTHING NAMED (G2)
    if (documents.length > maxPerWalk) { fail('walk: over-bound …') ; return { ids: [], complete: false } } // NOTHING WRITTEN (G2)
    if (store === null) { fail('walk: store absent') ; return { ids: [], complete: false } }
    const named = []                                                // `B4A-F11`: the ids the answer may NAME — only what it LANDED
    for (const doc of documents) if (await apply(store, planUpsert(store, doc))) named.push(doc.documentId)
    for (const node of markedRoots(store) NOT listed) await apply(store, planRemove(store, node.id))   // the ONLY delete-on-absence
    return { ids: named, complete: true }        // …so a store-REFUSED batch or a MARKER refusal is never named: the answer and the projection are ONE act
  }
  // THE ORDERING POINT (limb b). Classify FIRST, demand SECOND: an engine-origin `structural` FOUR-KEY descriptor demands a walk
  // WHATEVER it names — its `nodeIds` are the engine's GRAPH node ids, never document ids (ASM-B4A-2) — so an EMPTY `nodeIds` is
  // still a demand (`E2` drives exactly that). A `content` kind, a foreign `store` and a shape-less object are `unresolved` (G4).
  const isWalkDemand = (d) => d !== null && typeof d === 'object' && Object.keys(d).length === 4 && DESCRIPTOR_KEYS.every(…) &&
                              d.store === origin && d.kind === 'structural' && Array.isArray(d.nodeIds) && Array.isArray(d.edgeIds)
  const settle = async (d) => { if (!isWalkDemand(d)) { counts.unresolved++ ; await submit('noop') ; return } ; await submit('walk') }
  const reconcile = async () => { const a = await submit('walk') ; return { kind:'structural', nodeIds: a?.complete ? [...a.ids] : [], edgeIds: [], store: origin } }
  const accepted = async (write) => { counts.accepted++ ; await submit('job', async () => { /* planUpsert | planRemove → apply */ }) }
  const status = () => ({ projections: countProjections(), ...counts, lastFailure })   // a FRESH object; `projections` via `countProjections()`/`peekStore()` — side-effect free (`B4A-F7`)
  return Object.freeze({ accepted, settle, reconcile, status })
}
```

- **No timer, no interval, no re-arm, no retry** (`ASM-B4A-4`): the walk runs when the drain reaches a WALK demand, and a demand that arrives while one is in flight is served by exactly ONE trailing walk ⇒ three structural descriptors during one slow walk read `walks === 2` (`G3`), and every `settle` resolves only after a walk that STARTED AFTER its own demand. **The coalescing is by KIND, not by batch** (the first draft merged the whole queue): a `job` or a `noop` between two walk demands is a boundary the trailing walk must not step over, because a limb-(a) write is ORDERED against the walks around it.
- **Containment is structural, not defensive:** `read()` faults, `applyBatch`'s `{ ok: false }`, a THROWING JOB (`B4A-F6`) and a throw out of `runWalk` are all caught, counted `failed`, recorded in `lastFailure`, and the demand RESOLVES — so `settle` cannot reject, the caller's `broadcast` cannot be skipped, and `accepted` cannot leave the CRUD seam (which AWAITS it) pending for ever. The module holds no host/fs/socket/clock, so no fault can even reach a rejection path from outside. **AND A CONTAINED FAULT IS NEVER NAMED** (`B4A-F11`): `apply`'s `false` is what removes a refused or failed document from the walk's answer, so containment and honesty are the same field.

## 5. Guardrails (what a later unit must not break)

1. **The marker — and the `doc-head`-edge proof at the DERIVED head id — are the ONLY things that license an update or a delete of an existing record.** The marker is checked FIRST in both planners (before equality, before any op), because an equality shortcut on an unmarked root would report `unchanged` for a collision the contract calls `refused` (M5); and a record sitting at `<id>:engine-head` is only ours when our own edge names it, because that namespace is not injective over opaque engine ids (`B4A-F4`, `H4`). **A missing projection is `unchanged`, never a write** (M4) — absence is not evidence that a batch is due.
2. **A walk deletes ONLY on a per-document fact or on absence from a COMPLETE walk** (`D1` measures the positive arm, `H3` the malformed-list arm, `G2` the truncated one), and it NAMES only what it LANDED (`apply`'s boolean, `B4A-F11`, `F11`). A truncated list, a rejected read, an unreadable entry, or one over `maxPerWalk` writes **NOTHING AT ALL** (not even the upserts it saw) — no invented deletes, one uniform rule (contract §5(ii), `ASM-L2-M2`). **That bound is ONE number, stated once** (`main.ts:324`'s `MIRROR_MAX_PER_WALK`, consumed by the module's `maxPerWalk` AND by the wiring's accumulation cap, which stops there and reports `complete: false` — `B4A-F12`, `F12`): the two sides cannot disagree across wikis.
3. **ONE writer, no second journal.** Every mutation is one `applyBatch` (`rag-store.ts:279`: atomic, ONE `batch` journal entry at `:1451`, ONE `persist()` at `:1452`, `{ ok:false }` instead of a throw at `:209-214`). A direct `putNode`/`removeNode`, a second journal, or an unjournaled write is the widening this unit refuses (contract §5's own LOW note on the journaled-write/`undo` cost).
4. **`INV-E` structurally, and total containment:** the module writes the store and nothing else — no `loadAppGraph`, no `mountOperator`, no `refresh(`, no host, no renderer import, no Electron, no fs/socket/clock/timer. It imports the store/descriptor TYPES (`RagStore`, `BatchOp`, `RagNode`, `RagStoreChangedPayload`) plus the ONE value `ENGINE_ORIGIN_STORE`, and nothing else; the clause must also go RED under a deleted conjunct, or it proves a dead branch (`C2`). So a fault cannot become a rejection of the engine's accepted answer: `accepted`/`settle`/`reconcile` never reject, and `status().lastFailure` is a typed STRING, never a thrown object.
5. **The sink's ORDER (`settle` before `broadcast`) is `B6-F1`'s closure** — never move the `broadcast` above the `await`, and never "fix" the float by making `onChange` async (`engine-changes.ts` takes ZERO byte; `IPC_RAG_STORE_CHANGED` keeps its one emitter, contract §4).
6. **`status()` is a copy with a CLOSED key set** — `projections` is counted from the STORE (`countProjections()`: `store.listNodes().filter(isProjectionRoot)`, reached through the non-failing `peekStore()`), never from counters, so a restart cannot make it lie and a diagnostic read cannot rewrite the state it reports (`B4A-F7`); mutating the returned object cannot move the module (S1).

## 6. The command that must go green

`npm_config_cache=/tmp/npm-cache-astrographer npx vitest run tests/unit/gnosis-changes tests/integration/gnosis-changes` — the rows L2 §7 names, each aggregating its readings into ONE `expect(problems, …)` so a partial pass cannot print: `E1`, `E2` (`integration/mirror-limbs`) · `M1`–`M6`, `S1` (`unit/engine-mirror`) · `G1`, `G1(b)`, `G2`–`G4` (`integration/mirror-limbs`) · `A1`–`A3`, `H1`–`H8`, `D1`–`D4`, `F11` (`integration/mirror-adversarial`) · `C1`–`C3`, `F12` (`integration/mirror-wiring`), plus the RE-GRAINED `c9(c)`/`c9(h)` (`O-2`: re-grained, never deleted).
**`R-B4A-L3` — the readings (the runner's, not this page's):** the RED set before any `src/` byte read `Test Files 4 failed | 7 passed (11)` · `Tests 18 failed | 51 passed (69)` with `git status --porcelain -- src` EMPTY, and the second pass's own red read `Tests 2 failed | 18 passed (20)` (`2 failed | 85 passed (87)` scoped, reds `F11`/`F12`); the greens read **`Test Files 12 passed (12)` · `Tests 87 passed (87)`**; `npm test` `4 failed | 3583 passed | 22 skipped (3609)` with all four class (a, real-ollama `HTTP 404`); `typecheck` 0 · `build` 0 (5 bundles) · `drift` `CLEAN`, `PIN` arm EQUAL to `49d3137dbf81b6e535e62a30d9e494d80e9589b3`. Mutants (re-measured at the 87-row grain, both restored by md5): the `onAccepted` seam disabled ⇒ `1 failed | 86 passed`, `E1` alone reds; the sink's `settle` disabled ⇒ `1 failed | 86 passed`, `C1` alone reds.
**`B4A-F10` — the contract's `E2` mutant claim is FALSIFIED as a reading, and recorded rather than smoothed:** deleting the mirror limb from `main.ts`'s sink reds **`C1` only** (`E2` drives its own sink, and `main.ts` is never importable). The sink's coverage is `C1(c)`'s mutant-first source clause. The boundary this page carried upward is now ROWED (`G1(b)`), `H1`–`H8` pin every adversarial finding, and `D1`–`D4` close the four states L2's failure table claimed without a row (RCA-6).
**`B4A-F11`·`B4A-F12` — the L1 examiner's two residues, each ROWED rather than smoothed:** `B4A-F11` (§3/§4's `runWalk`): the walk's answer is now the ids it **LANDED** (or already held equal) — `apply` answers a boolean, so a store-REFUSED batch and a MARKER refusal are never named, and the descriptor and the projection are one act in fact, not by agreement (`F11(a)/(b)/(c)` plus the accepting control; the residual — a refused RETITLE leaves the OLD projection in place, unnamed and counted — is the reading §5(i) actually buys). `B4A-F12` (§1's `main.ts` row): **shape (a)** — `MIRROR_MAX_PER_WALK` is ONE named constant consumed by the module's `maxPerWalk` AND by the accumulation cap, which stops AT it and reports `complete: false`; 10 000 AT the bound projects whole, and ONE MORE is a NAMED state instead of a silent nothing — two labels, not one: a 10 001-list handed to the module reads `over-bound` (limb A, row-asserted), while the capped WIRING's typed failure is the module's `complete !== true` arm — `G2(ii)` pins that such a walk is a TYPED failure which writes nothing, while the `truncated` string itself is a code reading — and both answer an empty descriptor whose distinct state rides `status()` — in-process only, since NOTHING reads it today (measured by grep, not by a row: `engineMirror` is called only as `accepted`/`reconcile`/`settle`). Limb D EXECUTES the wiring's closure (type-erased extraction + a fake CRUD list) and pins `complete` IFF nothing was dropped **by the cap** (honest-`total` fixtures — the lying-`total` arm is `B4A-F13`), plus the cap's off-by-one: both mutants kill it. The walk names per LIST ENTRY — a code fact (`named.push` has no dedupe; the adversarial pass measured a repeated `nodeId`), lawful, and no row drives it. **`B4A-F13` (RECORDED, not fixed — pre-existing, `L1`'s to rule, and the numbers are the adversarial pass's own harness reading with NO persistent row, `F10`'s precedent):** `runWalk`'s reader trusts the engine's `total`, so a lying/decreasing `total` can close a wiki `complete` with ids DROPPED and then delete those projections on absence (§5(ii)); it is `B-4`'s landed `seen >= listed.total` arm and `c9(h)` pins that expression, so this pass names it rather than widening — the cap cannot mask it (a capped walk always reports partial).
