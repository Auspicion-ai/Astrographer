# Unit U-H5 — The Teardown Primitives: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-08.
- **Derived from DOCUMENTATION ONLY** — `docs/specs/unit-h5-teardown.md` §4
  (the pinned design decisions + the §7 Architect ruling: TEARDOWN-ASYNC,
  STORE-TEARDOWN-REVOKES-MUTATION-ONLY / read-safe, SNAPSHOT-STORE-TEARDOWN-NOOP,
  ENGINE-TEARDOWN-STOP-SERVING, DRAIN-SEAM-INFLIGHT, BOOT-CONTROLLER-TEARDOWN-
  CANCELS-BUILD, TEARDOWN-NO-WIRE-UP), §5.2 (the exact TS additions — the three
  `teardown(): Promise<void>` + `RetrievalEngine.inFlight(): number` + the
  OPTIONAL `Embedder.teardown?()`), §5.4 (behavior per factory), §5.5 (the
  the byte-pinned message census), §5.6 (the happy paths H1–H12; this blind-greens
  scenario set covers H1–H11 — the §5.6 **H12** genuine-cancel regression was added
  after this run and is covered separately, see the H12 note), §5.7 (the
  fail-states F1–F9), §5.8 (the negative pins D6/D8/A-P2-8/D3), §5.10 (the
  census). Supporting interface shapes (to build fixtures) read from the
  `src/main` type declarations only — `rag-store.ts` (`RagStore`
  declaration/`createJsonRagStore`/`RagStoreOptions`), `adjacency.ts`
  (the `createSnapshotStore` surface), `retrieval.ts` (`Embedder`/
  `RetrievalEngine`/`createRetrieval` declarations), `vector-boot.ts`
  (`VectorBootController`/`createVectorBootController`/`VectorBootOptions`),
  `vector-cache.ts` (`VectorCache`/`createVectorCache`).
- **NOT read:** the `teardown()`/`inFlight()` IMPLEMENTATION bodies in
  `src/main/rag-store.ts`/`adjacency.ts`/`retrieval.ts`/`vector-boot.ts`, and
  the SpecWriter-pinned `tests/unit-h5-teardown.test.ts`. The scenarios are
  driven from the spec text + the public factory signatures; the RUN record
  (§Run) was filled in AFTER the scenarios were authored. `src/` was not
  modified by this pass; the runner is a throwaway file deleted afterward.
- **Modules under test (the live seam):** the public factories
  `createJsonRagStore` (`rag-store.js`), `createSnapshotStore`
  (`adjacency.js`), `createRetrieval` (`retrieval.js`),
  `createVectorBootController` (`vector-boot.js`), `createVectorCache`
  (`vector-cache.js`) — imported and CALLED only; the teardown/inFlight member
  implementations were not opened. The consumer modules
  (`rag-store-runtime.ts`, `main.ts`, `mcp-server.ts`) are read ONLY for the
  §Negative-pins grep-level absence scans.
- **Harness:** ONE throwaway vitest runner
  `tests/__h5blinds__/unit-h5-teardown-blind-greens-run.test.ts` (a NEW file,
  node environment) executed with the repo's vitest
  (`npx vitest run tests/__h5blinds__/unit-h5-teardown-blind-greens-run.test.ts`).
  Every store uses a fresh `mkdtemp` dir under `os.tmpdir()`; the real
  userData is never touched. Byte-pinned message assertions are exact against
  §5.5. The runner is DELETED after the run — this document is the artifact.
- **Legend:** PASS = behavior matches the spec; FAIL = doc/spec drift OR an
  un-hardened regression (never a pass); DEFERRED = the precondition cannot be
  constructed blindly (with the reason).

---

## Fixture helpers (spec-shaped doubles, not implementation-derived)

- `node(id, content, updatedAt)` = a `RagNode` `{ id, type: 'p', content,
  ownedNodeIds: [], createdAt: T0, updatedAt }` (ISO-8601; `T0/T1/T2` strictly
  ordered).
- `edge(id, kind, source, target)` = a `RagEdge` `{ id, kind, source, target,
  createdAt: T0, updatedAt: T0 }`.
- **engine store** for `createRetrieval` = `createSnapshotStore([node…], [])`
  (read-only, disk-free — the engine only reads; its torn-down read-safe
  behavior is tested on the JSON store in the store scenarios).
- **embedder double** = `{ score: async (q, nodes) => nodes.map(n =>
  ({ nodeId: n.id, score: q === n.content ? 1 : 0 })), place: async () =>
  ({ ok: false, reason: 'no-match' }) }`. Variants carry a spy `teardown?`
  (H8) and a `hold` deferred `score` (H7/F8).
- **provider double** (for `createVectorBootController`) = an
  `EmbeddingProvider`-shaped object `{ kind: 'test', model: 'test-m', baseUrl:
  'http://127.0.0.1:11434', dimension: 8, embed }` where `embed(text)` returns
  a deterministic 8-vector; a `gated` flag makes the next `embed` await a
  resolvable deferred (the in-flight-build precondition, H11).
- **the boot store** = `createJsonRagStore({ path: <d>/boot.json })` with
  non-empty nodes (`putNode` + `await`) so the background build can promote.

---

## A. §5.6 Happy paths H1–H11 (+ the §5.6 H12 regression note)

> **H12 regression note (for the proofreader/doc-review reconciliation):** this
> blind-greens run was authored when the spec's happy-path list was **H1–H11**.
> The landed spec §5.6 now also carries **H12 — boot teardown GENUINELY CANCELS
> an ALREADY-EMBEDDED in-flight build (H5-1)** (≥1 embed + `cache.set` have run
> when teardown fires): teardown aborts the build and AWAITS its real settlement,
> `phase()` stays `'pending'` (no promotion-time `flush`/`setEmbedder` outlives
> teardown), the cache FILE stays byte-identical, and `start()` rejects `vector
> boot: torn down`. H12's regression coverage lives in the SpecWriter-pinned
> `tests/unit-h5-teardown.test.ts` (the §5.6 H12 `it()` — the genuine-cancel case
> where the pre-fix free-running build rewrote the cache file; RED pre-fix, GREEN
> after). This greens artifact does NOT duplicate H12 — it reconciled the §5.6
> tally (H1–H12) against the landed unit's scenario set (H1–H11).

### H1. Store teardown = resolving, idempotent NO-OP, read-safe, file byte-identical (§5.6 H1, §4 read-safe, D3)
- **Setup:** `<d>` fresh; `store = createJsonRagStore({ path: <d>/a.json })`;
  `n1 = await store.putNode(node('n1','alpha',T0))`; snapshot the file bytes.
- **Action:** `r1 = await store.teardown()`; `r2 = await store.teardown()`;
  resolve the READ set — `getNode('n1')`, `listNodes()`, `getEdge`,
  `listEdges()`, `status()`, `journal()`, `undoDepth()`, `redoDepth()`,
  `edgesFrom`, `edgesTo`, `edgesByKind`, `edgesForDocument`,
  `docHeadForDocument`; re-read the file bytes.
- **Expected PASS:** `r1 === undefined` and `r2 === undefined` (resolve with
  `undefined`); the second teardown resolves immediately (idempotent
  NO-OP); every READ method still resolves (`getNode('n1')` returns the node,
  `listNodes()` length 1, `status()` is a `RagStoreStatus` object, `journal()`
  is an array, etc.); the persistence file is BYTE-IDENTICAL before/after.

### H2. Store teardown DRAINS a pending write (§5.6 H2, §4 TEARDOWN-ASYNC)
- **Setup:** fresh store; `node('n1','alpha',T0)` persisted.
- **Action:** fire `p = store.putNode(node('n2','beta',T1))` WITHOUT awaiting;
  `await store.teardown()`; then await `p`; read the on-disk file.
- **Expected PASS:** `teardown()` resolves ONLY after the queued write settles
  (`p` is already settled by the time teardown returns — awaiting `p` after
  teardown does not block); the record `n2` is persisted on disk (the file
  content contains `"n2"` and `beta`); `teardown()` still resolves `undefined`.

### H3. Torn-down store reads work; mutations fail loud (§5.6 H3, §5.7 F1–F3)
- **Setup:** store with a persisted node; `await store.teardown()`.
- **Action:** `getNode` (returns the node); then exercise the mutation set
  (F1–F3).
- **Expected PASS:** `getNode('n1')` still returns the node; the file is
  intact; the mutations (see F1/F2/F3) all throw `rag store: torn down`.

### H4. Snapshot-store teardown = the reference NO-OP (§5.6 H4, §4 SNAPSHOT-STORE-TEARDOWN-NOOP, F9)
- **Setup:** `s = createSnapshotStore([node('n1','alpha',T0)], [])`.
- **Action:** `r1 = await s.teardown()`; `r2 = await s.teardown()`;
  `getNode('n1')`, `listNodes()`; `putNode` BEFORE and AFTER teardown.
- **Expected PASS:** `r1`/`r2` resolve `undefined` (idempotent NO-OP); reads
  still work; `putNode` throws the EXISTING `createSnapshotStore: read-only`
  BOTH pre- and post-teardown — NEVER the torn-down message (the adapter has
  no lifecycle queue).

### H5. Engine teardown = resolving, idempotent NO-OP; `inFlight()` 0 on a fresh engine (§5.6 H5)
- **Setup:** `eng = createRetrieval(createSnapshotStore([…],[]), embedder)`.
- **Action:** `inFlight()` on the fresh engine; `r1 = await eng.teardown()`;
  `r2 = await eng.teardown()`.
- **Expected PASS:** fresh engine `inFlight() === 0`; `r1 === undefined` and
  `r2 === undefined` (idempotent NO-OP).

### H6. Torn-down engine service fails loud (§5.6 H6, §5.7 F4–F6)
- **Setup:** engine as H5; `await eng.teardown()`.
- **Action:** `query()`, `onStoreChanged()`, `setEmbedder()`.
- **Expected PASS:** each THROWS `retrieval engine: torn down` (F4/F5/F6).

### H7. Engine `inFlight()` counts unsettled queries (§5.6 H7, §4 DRAIN-SEAM-INFLIGHT)
- **Setup:** engine over a snapshot store (one node `n1` `alpha`); an
  embedder whose `score` AWAITS a test deferred before resolving
  `[{ nodeId: 'n1', score: 1 }]`; the deferred exposes `held`/`release`.
- **Action:** `q = eng.query('alpha')` (in flight; NOT awaited);
  assert `inFlight() === 1`; `release()`; `r = await q`; assert
  `inFlight() === 0`. THEN a REJECTING variant: `q2 = eng.query('gamma')`
  where `score` rejects after the same gate; while pending
  `inFlight() === 1`; `release()`; expect `q2` rejects; assert
  `inFlight() === 0`.
- **Expected PASS:** pending query counts `inFlight() === 1`; after settle
  (resolve OR reject) `inFlight() === 0`; the rejected query also decrements
  (1→0).

### H8. Engine teardown forwards the OPTIONAL embedder hook (§5.6 H8, §5.4 ENGINE-TEARDOWN-STOP-SERVING)
- **Setup:** (a) an embedder carrying a spy `teardown?` (records calls);
  `engA = createRetrieval(snapStore, spyEmbedder)`; (b) a plain embedder
  WITHOUT the hook; `engB = createRetrieval(snapStore, plainEmbedder)`.
- **Action:** `await engA.teardown()`; `await engB.teardown()`.
- **Expected PASS:** the spy hook is called EXACTLY ONCE on `engA.teardown()`;
  the hook-less embedder is a no-op (no throw) on `engB.teardown()`.

### H9. Boot-controller teardown (never started) (§5.6 H9)
- **Setup:** `boot = createVectorBootController(bootStore, provider)` — NOT
  started; capture `boot.engine`.
- **Action:** `r = await boot.teardown()`; `phase()`; `boot.engine.query('x')`;
  `p = boot.start()`.
- **Expected PASS:** `r === undefined`; `phase() === 'pending'` (never promoted
  — nothing was started); the shared engine is torn down
  (`boot.engine.query` throws `retrieval engine: torn down`); the post-teardown
  `start()` REJECTS `vector boot: torn down` (F7).

### H10. Boot-controller teardown (promoted) (§5.6 H10)
- **Setup:** `boot = createVectorBootController(bootStore, provider)`; `await
  boot.start()` (promoted — `phase() === 'promoted'`); capture `report.embedded`.
- **Action:** `r = await boot.teardown()`; `boot.engine.query('alpha')`.
- **Expected PASS:** `r === undefined`; the PROMOTED engine is torn down
  (`query` throws `retrieval engine: torn down`).

### H11. Boot-controller teardown CANCELS an in-flight build; cache file byte-identical (§5.6 H11, §4 BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD, D3)
- **Setup (part 1 — the cancel):** provider `gated` (the first embed awaits a
  deferred, keeping the build pending); `boot = createVectorBootController(
  bootStore, provider)`; `p = boot.start()` (in-flight; held).
- **Action:** `await boot.teardown()`; then check `p`'s settlement.
- **Expected PASS:** `teardown()` resolves — and ONLY after the outstanding
  `p` settles; `p` settles REJECTED with `Error('vector boot: torn down')`
  (the `start()` caller's `.catch` fires). `teardown()` itself does NOT throw/
  reject (NO-FAIL).
- **Setup (part 2 — the D3 cache file):** a fresh `<d>`; `cacheOut =
  createVectorCache({ path: <d>/vec-cache.json })`; seed the cache file
  (`cacheOut.set({ kind:'test', model:'test-m', dimension:8, contentHash:
  sha256('alpha') }, <8-vector>)` + `await cacheOut.flush()`); capture the file
  bytes; a fresh gated provider; `boot2 = createVectorBootController(bootStore,
  provider2, { cache: cacheOut })`; `p2 = boot2.start()` (held); `await
  boot2.teardown()`.
- **Expected PASS:** the vector-cache FILE is BYTE-IDENTICAL before/after the
  mid-build teardown — never deleted, never flushed (D3, §7 Q2).

---

## B. §5.7 Fail-states F1–F9 (§5.5 byte-pinned messages)

`<d>` = an absolute temp dir. Fail-loud = the pinned `Error`.

### F1. `putNode`/`removeNode`/`putEdge`/`removeEdge`/`applyBatch` on a torn-down store (§5.7 F1)
- **Action:** `store.teardown()`; then each mutator.
- **Expected PASS:** each throws `rag store: torn down`; the persistence file is
  UNTOUCHED (byte-identical).

### F2. `undo()`/`redo()` on a torn-down store (§5.7 F2)
- **Action:** `store.teardown()`; `undo()`; `redo()`.
- **Expected PASS:** each throws `rag store: torn down`.

### F3. `store.enqueue(fn)` (new work) on a torn-down store (§5.7 F3)
- **Action:** `store.teardown()`; `let ran = []; store.enqueue(() => { ran.push(1) })`.
- **Expected PASS:** THROWS `rag store: torn down` and DOES NOT enqueue (`ran`
  stays empty — the fn never runs).

### F4. `query()` on a torn-down engine (§5.7 F4) — see H6.
### F5. `onStoreChanged()` on a torn-down engine (§5.7 F5) — see H6.
### F6. `setEmbedder()` on a torn-down engine (§5.7 F6) — see H6.
- **Expected PASS:** each `retrieval engine: torn down` (covered by H6).

### F7. `start()` after a boot-controller teardown (§5.7 F7, §5.4)
- **Setup:** `boot` torn down (never-started H9 and a mid-build H11 variant).
- **Action:** `boot.start()`.
- **Expected PASS:** REJECTS `vector boot: torn down`. (Distinct from a
  NOT-torn controller whose second `start()` returns the existing
  `vector boot: start already called` promise.)

### F8. An in-flight query entered BEFORE teardown is NOT cancelled (§5.7 F8)
- **Setup:** engine with a HOLDING embedder `A` (`score` awaits a deferred,
  will resolve `[{ nodeId: 'n1', score: 7 }]`); `q = eng.query('alpha')`
  (in-flight, NOT awaited); assert `eng.inFlight() === 1`.
- **Action:** `await eng.teardown()` while `q` is in flight; then `release()`;
  `r = await q`; then a NEW `eng.query('alpha')`.
- **Expected PASS:** `teardown()` does NOT cancel the in-flight query and
  resolves `undefined`; `r` completes on the OLD embedder
  (`r.ranked[0].score === 7` — the pre-teardown query settles coherently on the
  embedder that served it); `q`'s settle decrements `inFlight()` back to 0;
  ONLY a NEW query throws `retrieval engine: torn down`.

### F9. Snapshot-store mutation pre/post teardown (§5.7 F9)
- **Action:** `s = createSnapshotStore([…],[])`; `putNode` BEFORE teardown
  throws `createSnapshotStore: read-only`; `await s.teardown()`; `putNode`
  again.
- **Expected PASS:** BOTH throw `createSnapshotStore: read-only` — NEVER
  `rag store: torn down` (the adapter has no teardown lifecycle).

---

## C. §5.8 Negative pins (grep/static — A-P2-8 / D3 / D6 / D8)

### AP28-RUNTIME. `rag-store-runtime.ts` defines no teardown + makes no teardown call (§5.8 A-P2-8; U-H2 N1/N2 stay green)
- **Action:** read `src/main/rag-store-runtime.ts` source; assert NO
  `/\b(teardown|close|destroy)\s*\(/` match (no teardown/close/destroy
  primitive DEFINED or CALLED); scan `src/main/main.ts` + `src/main/mcp-server.ts`
  for ZERO `runtime.teardown(`/`.destroy(`/`.teardown(` calls.
- **Expected PASS:** no teardown primitive definition/call in the runtime
  module and no teardown call in `main.ts`/`mcp-server.ts` (the seam exists for
  U-H4/U-H6/U-H7 but the runtime does NOT call it — A-P2-8).

### D3-NODELETE. No FILESYSTEM-delete primitive in the U-H5-touched files (§5.8 D3)
- **Action:** scan the four U-H5-touched sources (`rag-store.ts`,
  `adjacency.ts`, `retrieval.ts`, `vector-boot.ts`) for filesystem-delete
  primitives: `unlink`, `unlinkSync`, `rm`, `rmSync`, `rmdir`, `rmdirSync`
  (as fs/delete calls, not the business `removeNode`/`removeEdge`/`remove`
  members).
- **Expected PASS:** NONE of the filesystem-delete primitives appear in the
  U-H5-touched files (a teardown never deletes the persistence file, the
  journal, or the vector-cache file — D3).

### D6-NOTOOL. No MCP/IPC surface added (§5.8 D6)
- **Action:** scan the four U-H5-touched files for the registry-hot-apply tool
  / IPC channel identifiers (`ALL_TOOLS`, `RpcMethod`, `MUTATING_METHODS`,
  `ipcMain`, `webContents.send`) as ADDITIONS.
- **Expected PASS:** the U-H5-touched files carry no MCP tool / IPC channel /
  RpcMethod declarations (D6 — teardown is a node-level primitive, not a tool).

---

## Run record

| id | Scenario | Result |
| --- | --- | --- |
| H1 | Store teardown NO-OP, idempotent, read-safe, file byte-identical | ✅ PASS |
| H2 | Store teardown drains a pending write (the write settles BEFORE teardown resolves; persisted) | ✅ PASS |
| H3 + F1/F2/F3 | Torn-down store reads work; all 7 mutators + `enqueue` fail loud `rag store: torn down`; file untouched | ✅ PASS |
| H4 + F9 | Snapshot-store teardown = reference NO-OP; read-only before+after | ✅ PASS |
| H5 | Engine teardown NO-OP; `inFlight()` 0 fresh | ✅ PASS |
| H6 + F4/F5/F6 | Torn-down engine `query`/`onStoreChanged`/`setEmbedder` fail loud `retrieval engine: torn down` | ✅ PASS |
| H7 | Engine `inFlight()` 0→1→0 across a resolve AND a reject | ✅ PASS |
| H8 | Engine teardown forwards the optional embedder hook exactly once; hookless no-op | ✅ PASS |
| H9 + F7 | Boot teardown (never started) → resolves, `phase()` pending, engine torn down, post-teardown `start()` rejects `vector boot: torn down` | ✅ PASS |
| H10 | Boot teardown (promoted) → resolves; promoted engine torn down | ✅ PASS |
| H11 | Boot teardown CANCELS in-flight build (outstanding `start()` rejects `vector boot: torn down`, teardown resolves after it); cache FILE byte-identical mid-build | ✅ PASS |
| F8 | In-flight query before teardown NOT cancelled — completes on the OLD embedder; only NEW queries throw | ✅ PASS |
| AP28-RUNTIME | `rag-store-runtime.ts` defines/calls no teardown; `main.ts`/`mcp-server.ts` no teardown call | ✅ PASS |
| D3-NODELETE | no filesystem-delete primitive (`unlink`/`rmSync`/`fs.rm`/`rmdir`) in the four U-H5-touched files | ✅ PASS |
| D6-NOTOOL | no MCP tool / IPC / RpcMethod surface in the four U-H5-touched files | ✅ PASS |

**Run summary:**

- **Run:** `npx vitest run tests/__h5blinds__/unit-h5-teardown-blind-greens-run.test.ts`
  (the repo's vitest, node env) — **15 test cases, 15 passed.** Each test may
  consolidate several spec rows (H3+F1/F2/F3, H4+F9, H6+F4/F5/F6, H9+F7), so the
  consolidated scenario rows above are **17 PASS / 0 FAIL / 0 DEFERRED.**
- **PASS: 17. FAIL: 0. DEFERRED: 0.** No spec/code drift and no un-hardened
  regression observed against `docs/specs/unit-h5-teardown.md` §4/§5.2/§5.4/§5.5/
  §5.6/§5.7/§5.8 on this host. Every byte-pinned message reproduced byte-exact:
  `rag store: torn down`, `retrieval engine: torn down`, `vector boot: torn down`,
  and the UNCHANGED `createSnapshotStore: read-only` (never the torn-down message).
- **Three genuine harness iterations (documented, not behavior):** (1) the
  engine `query`/`onStoreChanged` and the snapshot `putNode` fail-loud via a
  SYNCHRONOUS throw (not a rejected promise) — the spec pins only the message,
  so the runner's fail-loud helper was made THROW-STYLE-AGNOSTIC (sync throw OR
  rejection both count); (2) the drain-ordering assert (H2) was re-expressed as
  an ordering check (write-settled before teardown-resolved) instead of a
  `Promise.race` with an immediately-resolved participant; (3) the gated-embed
  provider uses a per-provider `fired` flag (not a shared module flag). No runner
  change altered what a scenario asserts — only HOW a pinned expectation is checked.

## Spec ambiguities / drift surfaced (for the proofreader/doc-review gate)

- **None.** Every scenario derived from §4 (the five pinned design decisions +
  the §7 Architect ruling), §5.2–§5.4 (the three `teardown(): Promise<void>` +
  `inFlight(): number` + the optional `Embedder.teardown?`), §5.5 (the byte
  census), §5.6 H1–H11 (plus the §5.6 H12 regression covered in the landed unit
  test — see the H12 note in §A), §5.7 F1–F9, and §5.8 (A-P2-8 / D3 / D6) reproduced from
  the live modules with the byte-pinned messages.
- **Documented observations (not drift):** (a) the engine's post-teardown
  `query`/`onStoreChanged` and the snapshot store's `putNode` fail-loud via a
  SYNCHRONOUS throw rather than a rejected promise — the spec §5.5/§5.7 pins
  only "throw the pinned message" (no throw-STYLE pin), so both are compliant;
  (b) the boot `start()` after a mid-build teardown additionally logs the
  pre-existing W1 `vector boot: pending (born-lexical)` milestone (the teardown
  adds no new `console.*` line — §5.10 census unchanged; the W1 log belongs to
  controller construction).
- **DEFERRED-count:** zero. The one precondition that a greens writer might
  expect to be non-constructible blindly (the mid-build cancel race) WAS
  constructible from the documented surface: §5.4 step 3's "deferred that
  `start()` wraps the real `build()` in and that `teardown()` rejects" pins a
  deterministic, gated-embed construction (H11), so no DEFERRED row is needed.

## What a live-app session should later exercise (the §6 live gate is PARKED per user instruction)

The U-H5 §6 live-scenario gate is **PARKED** (per the user instruction — a
live app session is not available; the task explicitly asks not to launch the
app). The teardown primitives are node-testable in this battery (no live app
needed). When a live-app session does run, it should exercise a REAL
operator-triggered remove/rename end-to-end (via the NOT-YET-WIRED U-H4/U-H6
callers): a live `RagStoreDirectory` remove that drains (`inFlight()===0`)
then tears down a live store/engine/boot, and the default-reassignment (U-H7)
handoff — the live-pending battery the §6 note names
(`tests/unit-h5-teardown-live-pending-battery.md`) is NOT authored now.

