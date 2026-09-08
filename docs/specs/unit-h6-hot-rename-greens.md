# Unit U-H6 — Hot-Rename (the drain-then-teardown rename): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-08.
- **Derived from DOCUMENTATION ONLY** — `docs/specs/unit-h6-hot-rename.md` §4
  (the pinned design decisions + the §7 Architect ruling: RENAME-ORCHESTRATION-HOME
  Q1 to the REUSED `rag-store-remove.ts` `drainAndReleaseEntry` + an additive async
  `hotRename` with the N1/A-P2-8 grep pin STAYING GREEN; HOT-RENAME-METHOD Q2/Q3
  two-path co-existence + `HotRenameResult`; D4-PRECONDITION-INHERITANCE Q2
  (INHERIT `R-rename-ids-present` from `hotApply`); DRAIN-ORDER store-then-engine;
  UNREGISTER-EVERYWHERE; DEFAULT-RENAME-IMPOSSIBLE (W-rename-default); NO-OP-ON-ABSENT
  (write-level W-rename-unknown-from / W-rename-target-exists); D3-ORPHAN-STRAND;
  D6/D5/A-P2-5 scope boundary; Q4 UNBOUNDED drain), §5.1 (`hotRename(from, to):
  Promise<HotRenameResult>` + `HotRenameResult = { loaded, delta, drained:0 }`),
  §5.2 (the reused `rag-store-remove.ts` `drainAndReleaseEntry`/`RemovedEntry`/
  `RemovedEntryReleaseResult` — VERBATIM REUSE, NOT RE-AUTHORED), §5.3 (the six-step
  `hotRename` ordering + the top-method arg guard + the CAPTURE-orphan-before-write +
  the EARLY-RETURN-on-write-throw + the defensive absent-entry skip), §5.4 (the drain
  gate `inFlight()===0`, F-H4-1 re-entry, store-then-engine, D3 strand, NO-FAIL),
  §5.5 (the propagated W-rename-* / R-rename-ids-present / loader-F-set / native-fs
  error set; the LOCALLY-THROWN from/to arg guards reusing the W-rename-arg template;
  **0** new message templates), §5.6 (happy paths H1–H6), §5.7 (fail-states F1–F7 +
  F7h/F8h hang-awareness), §5.8 (the negative pins D6/D8/A-P2-5/A-P2-8/D3/D4/D5 + the
  N1/N2 stays-green), §5.10 (the census), §7 (the four CONFIRMED rulings). Consumed/
  landed contracts read for fixture shapes: the U-H5 `teardown()`/`inFlight()` member
  signatures (`src/main/rag-store.ts`, `src/main/retrieval.ts`), the
  `RagStoreEntry`/`buildRagStoreDirectory` surface (`rag-store-directory.ts`), the
  `loadRagStoreRegistry`/`LoadedRagStoreRegistry`/`ResolvedRagStore` surface
  (`rag-store-registry.ts`), the `createJsonRagStore`/`RagStore` surface
  (`rag-store.ts`), the `createRetrieval`/`RetrievalEngine`/`setEmbedder` surface
  (`retrieval.ts`), the reused `drainAndReleaseEntry` helper (`rag-store-remove.ts`),
  and the write module's W-rename-* messages + `renameRegistryStore` arg-guard
  (`rag-store-registry-write.ts`). The `rag-store-runtime.ts` source was read ONLY to
  confirm the exported `RagStoreRuntimeController` interface + the `hotRename` method
  signature (the §5.1 surface) and for the §5.8 N1/A-P2-8 grep scans — the
  `hotRename` BODY and the reused-helper semantics were CONSTRUCTED + CALLED, NOT
  read.
- **NOT read:** the `hotRename` implementation body, the reused
  `drainAndReleaseEntry` implementation body (imported + CALLED only via the public
  `RemovedEntry` interface), and the SpecWriter-pinned `tests/unit-h6-hot-rename.test.ts`.
  The RENAME behavior is derived from the spec text + §4/§7 + the public factory
  signatures. The RUN record (§Run) was filled in AFTER the scenarios were authored.
  `src/` and the landed test suite were not modified by this pass.
- **Modules under test (the live seam):** `createRagStoreRuntimeController`
  (`rag-store-runtime.js`) — the `hotRename(from, to)` controller method imported and
  CALLED only; `drainAndReleaseEntry` (`rag-store-remove.js`) imported and CALLED only
  (direct scenario DRAIN-1); the consumed fixture factories
  `createJsonRagStore`/`loadRagStoreRegistry`/`buildRagStoreDirectory` used for a real
  2-or-3-store boot.
- **Harness:** ONE throwaway vitest runner
  `tests/__h6blinds__/unit-h6-hot-rename-blind-greens-run.test.ts` (a NEW file, node
  environment) executed with the repo's vitest
  (`npx vitest run tests/__h6blinds__/unit-h6-hot-rename-blind-greens-run.test.ts`).
  Every boot uses a fresh `mkdtemp` dir under `os.tmpdir()` and a real
  `loadRagStoreRegistry`+`buildRagStoreDirectory` 2-or-3-store boot (`main` default +
  `research-2026-09` non-default, optionally `research-2026-10`), each on a derived
  persistence file; the real userData is never touched. Byte-pinned message assertions
  are exact against §5.5/§5.7/§5.6. The runner is DELETED after the run — this
  document is the artifact.
- **Legend:** PASS = behavior matches the spec; FAIL = doc/spec drift OR an
  un-hardened regression (never a pass); DEFERRED = the precondition cannot be
  constructed blindly (with the reason).

---

## Boot fixture (real 2-or-3-store boot, per the U-H2/U-H4 fixture convention)

`<d>` = a fresh `mkdtemp`; `<path>` = `<d>/provident-rag-stores.json` written as

```json
{ "version": 1, "stores": [ { "name": "main", "default": true }, { "name": "research-2026-09" } ] }
```

(the 3-store variant adds `{ "name": "research-2026-10" }`).

1. `registry = loadRagStoreRegistry({ path: <path> })` (implicit:false, corrupt:false).
2. `plan = buildRagStoreDirectory(registry, { userDataPath: <d>, embedderKind: 'lexical',
   provider: null })` (`vectorBoot` null under lexical).
3. `defaultEntry = plan.directory.entries.get(plan.defaultName)`.
4. `controller = createRagStoreRuntimeController({ registry, directory: plan.directory,
   defaultEntry, vectorBoot: plan.vectorBoot, registryPath: <path>, userDataPath: <d>,
   embedderKind: 'lexical', provider: null })`.
5. Seed the `research-2026-09` entry store: `await
   entries.get('research-2026-09').store.putNode(node('n1','alpha'))` (a NON-`<from>:`
   id — so the old file exists for the strand byte-compare AND the D4 inspect passes).
   For the F5 ids-present case, seed instead with `node('research-2026-09:doc1','alpha')`.

The captured pre-rename `RagStoreEntry` (`.store`, `.engine`, `.name`) is the orphan the
drain tears down. `RagNode` helper:
`node(id, content) = { id, type:'p', content, ownedNodeIds:[], createdAt:T0, updatedAt }`,
`T0 = '2026-01-01T00:00:00.000Z'`.

The old `from` persistence file is the derived `provident-rag-research-2026-09.json`
under `<d>` (registry-derived, since the config omits `persistenceFile`), the new `to`
file is `provident-rag-research-2026-10.json` (or the chosen `to` name) — §5.3/§2.4.

---

## A. §5.6 Happy paths H1–H6

### H1. Rename a present IDLE CLEAN non-default → rebuilt new entry + drained old + old file stranded + default untouched (D7/D3/D4)
- **Setup:** 2-store boot; seed `research-2026-09` with non-prefixed `n1`; snapshot the
  `research-2026-09` persistence bytes; capture `getDefaultStore()` and the pre-rename
  `research` entry.
- **Action:** `res = await controller.hotRename('research-2026-09', 'research-2026-10')`.
- **Expected PASS:** `res.drained === 0`; `res.delta` deep-equals
  `{ added:[], removed:[], renamed:[{ from:'research-2026-09', to:'research-2026-10' }] }`;
  `res.loaded.implicit === false` && `res.loaded.corrupt === false`;
  `getDirectory().entries.get('research-2026-09') === undefined`;
  `getDirectory().entries.get('research-2026-10')` is a FRESH entry (its `.name` is
  `research-2026-10`, `.store` !== the old store object, `.engine` !== the old engine)
  rebuilt on the NEW derived file `provident-rag-research-2026-10.json`;
  `currentStores()` names include `research-2026-10` and NOT `research-2026-09`;
  `statusOf('research-2026-09')` THROWS `rag-store-runtime: unknown store
  'research-2026-09'` (R-status-unknown); the OLD `provident-rag-research-2026-09.json`
  is BYTE-IDENTICAL before/after (D3 strand — never deleted/touched);
  `getDefaultStore()` is the SAME object identity (default untouched).

### H2. The old renamed engine + store are GENUINELY TORN DOWN; the new `to` engine is LIVE
- **Setup:** 2-store boot; seed `research-2026-09` with `n1`; capture the pre-rename
  `research.store` + `.engine` + the old file bytes; snapshot the new `to` entry file
  absent.
- **Action:** after the H1 `hotRename('research-2026-09','research-2026-10')`, exercise
  the captured OLD store/engine and the NEW `to` entry engine.
- **Expected PASS:** `oldEngine.query('alpha')` fails loud `` retrieval engine: torn down ``;
  `oldStore.putNode(node('x','y'))` fails loud `` rag store: torn down ``;
  `oldStore.getNode('n1')` still RETURNS the node (read-safe teardown); a FRESH
  `createJsonRagStore({ path: <old from file> })` `listNodes()` still serves `n1`
  (stranded + intact); the old file byte-identical; the NEW
  `directory.entries.get('research-2026-10').engine.query('alpha')` RESOLVES (the new
  `to` entry is LIVE — a post-rename `query()` does NOT throw `torn down`).

### H3. Rename with an in-flight query on the OLD engine DRAINS first (A-P2-2/D7)
- **Setup:** 2-store boot; seed `n1`; capture the pre-rename `research.engine`; swap a
  HOLDING embedder into that engine (`engine.setEmbedder(holding)` where `score` awaits
  a test deferred and then resolves `[{ nodeId:'n1', score:1 }]`); fire
  `q = engine.query('alpha')` NOT-awaited; assert `engine.inFlight() === 1`.
- **Action:** `rh = controller.hotRename('research-2026-09','research-2026-10')` (not
  awaited); tick the loop; while held assert `engine.inFlight() === 1` and `rh` NOT
  settled; `hold()` (release the deferred).
- **Expected PASS:** the drain gate blocks — the old engine is NOT torn down while
  `inFlight() === 1` (its `inFlight()` stays ≥1 and `rh` stays pending); after release
  the gated query SETTLES on the OLD embedder (`qres.ranked[0].nodeId === 'n1'`,
  `score === 1`), `engine.inFlight()` returns to 0, `rh` resolves `{ drained: 0 }`, a NEW
  `query('gamma')` on the old engine throws `` retrieval engine: torn down ``; the old
  `from` file byte-identical throughout. The old renamed engine is NEVER torn down
  mid-query.

### H4. 3-store registry — rename one, the survivor + default survive (H4 multi-store)
- **Setup:** 3-store boot (`main` + `research-2026-09` + `research-2026-10`); seed
  `research-2026-09` with `n1`; capture the default object.
- **Action:** `hotRename('research-2026-09', 'research-2026-11')`.
- **Expected PASS:** `delta.renamed === [{ from:'research-2026-09', to:'research-2026-11' }]`;
  the `research-2026-09` entry is gone from `getDirectory().entries` (unregistered +
  drained/teardown) and `research-2026-11` is present; `research-2026-10` REMAINS in
  entries + `currentStores()` (rebuilt fresh per the U-H2 coarse path — its object
  identity MAY change, the documented survivor-rebuild churn §5.11); `currentStores()`
  names are `['main','research-2026-11','research-2026-10']` (set-membership: include
  `main`, `research-2026-11`, `research-2026-10`; NOT `research-2026-09`); the default
  object is untouched.

### H5. The write is re-readable (D2)
- **Setup:** 2-store boot; seed `n1`; `hotRename('research-2026-09','research-2026-10')`.
- **Action:** `reread = loadRagStoreRegistry({ path: <path> })`.
- **Expected PASS:** `reread.stores` includes `research-2026-10` (on the new derived
  file) and NOT `research-2026-09`; `reread.implicit === false` &&
  `reread.corrupt === false` — persisted == live (D2).

### H6. A torn-down old store/engine `teardown()` is a safe NO-OP (primitive-level idempotency)
- **Setup:** 2-store boot; seed `n1`; `hotRename('research-2026-09','research-2026-10')`;
  capture the pre-rename store+engine.
- **Action:** call `store.teardown()` and `engine.teardown()` AGAIN on the OLD `from`
  pair (twice each).
- **Expected PASS:** all four resolve `undefined` immediately — the RENAME is idempotent
  at the drain/teardown layer (even though the WRITE is not: W-rename-unknown-from on a
  repeat `from`, §5.7 F2).

---

## B. §5.7 Fail-states F1–F7 (F7h/F8h/F8 hang/defer)

`live-untouched` = `getDirectory().entries` still has the `from` entry (+ no `to` entry)
deep-equal to before + the registry file byte-identical + NO drain/teardown ran (the old
store/engine still serve — `engine.query`/`store.putNode` resolve); `disk-untouched` =
the registry + the old `from` store persistence files byte-identical. Fail-loud = the
pinned message.

### F1. bad `from` (`null`/`5`/`''`) → W-rename-arg `from required`; live+disk untouched; NO teardown
- **Action:** `controller.hotRename(null,'b')` / `(5,'b')` / `('','b')`.
- **Expected PASS:** each rejects `` rag-store-registry-write: from required `` (the §7
  Q3 top-of-method arg guard reuses the LANDED W-rename-arg `from|to required` template —
  0 new templates); live-untouched; NO teardown (the old `n1`-seeded store/engine still
  serve).

### F1b. bad `to` (`a`, null/`5`/`''`) → W-rename-arg `to required`; live+disk untouched; NO teardown
- **Action:** `controller.hotRename('a', null)` / `('a', 5)` / `('a','')`.
- **Expected PASS:** each rejects `` rag-store-registry-write: to required `` (LOCALLY-
  THROWN, byte-equal to W-rename-arg); live-untouched; NO teardown.

### F2. unknown `from` (and a repeat `from` after a successful rename) → W-rename-unknown-from; live-untouched; NO teardown
- **Setup:** 2-store boot; seed `n1`.
- **Action:** `controller.hotRename('nope','b')`, then a successful
  `hotRename('research-2026-09','research-2026-10')`, then
  `controller.hotRename('research-2026-09','research-2026-11')` again.
- **Expected PASS:** the first rejects `` rag-store-registry-write: cannot rename unknown
  store 'nope' `` (PROPAGATES); live-untouched + NO teardown (rename is NOT a silent
  no-op at the write level); the repeat rename of the now-renamed-away `research-2026-09`
  rejects `` rag-store-registry-write: cannot rename unknown store 'research-2026-09' ``
  (the drain/teardown is primitive-level idempotent, the write is not).

### F3. `to` already present → W-rename-target-exists; live+disk untouched; NO teardown
- **Setup:** 3-store boot (`main` + `research-2026-09` + `research-2026-10`); seed
  `research-2026-09` with `n1`.
- **Action:** `controller.hotRename('research-2026-09','research-2026-10')` (the `to`
  already exists).
- **Expected PASS:** rejects `` rag-store-registry-write: store 'research-2026-09' cannot
  be renamed to 'research-2026-10': 'research-2026-10' already exists `` (PROPAGATES);
  live-untouched (`research-2026-09` still an entry, `research-2026-10` unchanged); NO
  teardown.

### F4. the DEFAULT store → W-rename-default (D5 → U-H7); live+disk untouched; NO teardown
- **Setup:** 2-store boot (default `main` untouched / not seeded with `main:` ids); capture
  the `main` store + engine + the registry bytes.
- **Action:** `controller.hotRename('main','x')`.
- **Expected PASS:** rejects `` rag-store-registry-write: the default store cannot be
  renamed (default reassignment is a separate unit) `` (PROPAGATES; the D4 inspect is
  SKIPPED for a default rename — HOST-2 — so W-rename-default fires); live-untouched (no
  `x` entry, `main` still present); the registry file byte-identical; NO teardown (the
  default store/engine still serve).

### F5. a CURRENT `from` with persisted `<from>:`-prefixed ids → R-rename-ids-present (inherited D4); disk NOT written; NO teardown
- **Setup:** 2-store boot; seed `research-2026-09` with the PREFIXED id
  `research-2026-09:doc1`; snapshot the registry + the from-file bytes.
- **Action:** `controller.hotRename('research-2026-09','z')`.
- **Expected PASS:** rejects `` rag-store-runtime: cannot rename store 'research-2026-09'
  — it has persisted 'research-2026-09:'-prefixed ids `` (**R-rename-ids-present**,
  INHERITED from `hotApply` — the swap never ran); DISK NOT WRITTEN (the registry + from
  files byte-identical); live-untouched (`research-2026-09` still an entry, NO `z` entry);
  NO drain/teardown (the old store/engine still serve — no id rewrite, D4/A-P2-5).

### F6. a persist native fs failure → the native fs Error PROPAGATES; live-untouched; NO teardown
- **Setup:** 2-store boot; seed `n1`; snapshots; `chmod` `<d>` to `0o500` (non-writable).
- **Action:** `controller.hotRename('research-2026-09','research-2026-10')`, then `chmod`
  back `0o700`.
- **Expected PASS:** rejects with the NATIVE fs Error (code `EACCES`, message contains
  `EACCES` — propagated unchanged, NOT a wrapped R-*/W-* message); live-untouched
  (`research-2026-09` still an entry); the registry + old from files byte-identical; NO
  teardown (`engine.query`/`store.putNode` still serve — the swap never ran).

### F7. DEFAULT-DRIFT throw path (F15/F16 — an EXTERNAL mid-run registry default edit): the old-`from` orphan is STILL drained/teardown before the byte-pinned rethrow (the F-H4-2 mirror)
- **Setup:** 2-store boot; seed `n1`; capture the pre-rename `research.store/.engine` +
  the old from-file bytes + the registry bytes; then EXTERNALLY rewrite the registry
  file so the `main` entry gains an explicit `persistenceFile` that differs from the
  boot-captured derived default file (the F16 default-drift key) — e.g.
  `"persistenceFile": "<d>/drifted-provident-rag.json"` — so the reloaded default's
  persistenceFile no longer equals the boot-captured default.
- **Action:** `try { await controller.hotRename('research-2026-09','research-2026-11') } catch (e) { err = e }`
- **Expected PASS:** `err` is the byte-pinned **R-default-mismatch2**
  `` rag-store-runtime: default entry drifted from the loaded registry `` (or
  `R-default-changed` per §5.7 — the drift throw) AND the OLD `research-2026-09`
  orphan is STILL drained+teardown: `oldEngine.query('alpha')` fails loud `` retrieval
  engine: torn down ``, `oldStore.putNode(...)` fails loud `` rag store: torn down ``,
  the OLD `provident-rag-research-2026-09.json` strands byte-identical; the `to`
  (`research-2026-11`) entry is LIVE from the drift sync (`directory.entries.has('research-2026-11')`)
  and `research-2026-09` is NOT in the live map (F-H4-2 — NO orphan leak of the
  renamed-away engine).
- **Note:** if the drift key proves not blind-constructible (a genuinely-fragile external
  default edit), this row is recorded DEFERRED with the reason — see §Run.

### F7h. the old `from` store's `teardown()` HANGS on a never-settling queued promise (F-H5-3) — **DEFERRED**
- **Reason:** the §7 Q4 Architect ruling confirms the drain is **UNBOUNDED**
  (correctness-first; no timeout, 0 new messages). The only observable outcome of a
  never-settling store queue is an indefinite hang of `hotRename`, which a bounded greens
  battery cannot ASSERT without either a NEW (forbidden) timeout message or leaking a
  permanently-pending promise. Not blind-constructible as a PASS/FAIL from the documented
  surface (the never-settling enqueued promise would need to be injected into the
  U-H5-internal single-writer queue). H3 behaviorally covers the drain-gate guarantee (the
  drain never proceeds while `inFlight() > 0`; the old file stays byte-identical).
  Recorded as pre-existing U-H5 awareness (F-H5-3), NOT a U-H6 regression.

### F8h. the drain awaits a NEVER-settling in-flight query on the OLD engine — **DEFERRED**
- **Reason:** same UNBOUNDED (§7 Q4) outcome — a never-settling query hangs `hotRename`
  (A-P2-2 correctness), which cannot be asserted as an observable PASS in a bounded
  battery (no timeout message; F-H5-3 documented awareness). H3 covers the SETTLING
  in-flight case: the teardown is gated behind `inFlight()===0` and the old engine is
  never torn down mid-query.

### F8. the defensive `orphan === undefined` after a SUCCESSFUL write — **DEFERRED**
- **Reason:** §5.3 step 4 + §5.7 F8 mark this "not a documented fail-state; a defensive
  D2-invariant bug guard, never asserted as reachable behavior." A blind construction
  would require a persisted-and-live divergence that the D2 invariant + the U-H2 write
  path make unreachable by contract. Not blind-constructible from the documented surface.

---

## C. §5.2/§5.4 direct — the REUSED `drainAndReleaseEntry`

### DRAIN-1. The reused remove-module helper drains + tears down an old-`from` pair (RemovedEntry → drained 0, store+engine torn down, file stranded)
- **Setup:** 2-store boot; seed `n1`; capture the `research-2026-09` store + engine;
  snapshot the file bytes.
- **Action:** `res = await drainAndReleaseEntry({ store: fromEntry.store, engine: fromEntry.engine })`.
- **Expected PASS:** `res.drained === 0`; `fromEntry.engine.inFlight() === 0`;
  `fromEntry.engine.query('alpha')` fails loud `` retrieval engine: torn down ``;
  `fromEntry.store.putNode(...)` fails loud `` rag store: torn down ``; the persistence
  file byte-identical (D3). (Composes exactly the DRAIN-ORDER §5.4 pins: await
  `inFlight()===0` → `store.teardown()` → F-H4-1 re-entry → `engine.teardown()` →
  `{drained:0}`.)

---

## D. §5.8 Negative pins (grep/static — A-P2-8 / D3 / D6 / D5 / A-P2-5)

### N1. `rag-store-runtime.ts` has NO `teardown(` literal + no lowercase delete primitive (§5.8 A-P2-8/N1 + N2)
- **Action:** read the runtime source; assert NO `\b(teardown|close|destroy)\s*\(` and NO
  `\b(unlink|rm|rmdir|remove|truncate)\s*\(`.
- **Expected PASS:** both regexes have no match — the N1/A-P2-8 grep pin STAYS GREEN with
  ZERO re-pin (Q1 option-b: `hotRename` references only `drainAndReleaseEntry(`, whose
  identifier contains no lowercase `teardown`), and the runtime makes no lowercase delete
  call. The §5.8 HARD REQUIREMENT (no literal `teardown(` — a bare prose "teardown"
  without the paren is permitted) holds. (Confirmed independently by the §5.5 "0 teardown
  call sites in the runtime" census.)

### N2. `rag-store-remove.ts` carries the D3 no-delete + D6 no-MCP/no-IPC negative pins (§5.8)
- **Action:** read the remove-module source; assert NO filesystem-delete USAGE (no delete
  primitive `(unlink|rm|rmdir|truncate|remove)(` call, no `fs.(rm|unlink|rmdir|truncate)`
  call, no `.unlink(`/`.rm(`/… member call) and NO MCP/IPC surface
  (`ALL_TOOLS`/`RpcMethod`/`MUTATING_METHODS`/`ipcMain`/`webContents.send`/`IPC_[A-Z_]+`).
- **Expected PASS:** no delete-primitive usage (D3 — the D3 strand is ALSO verified
  behaviorally in H1/H2/DRAIN-1: the file is byte-identical); no MCP/IPC surface
  (D6/A-P2-5). The module MAY mention the delete primitives in its D3 header prose; it
  must not USE them.

### N3. `hotRename` + a failed `hotRename` emit ZERO `console.*` lines (the 0-log census, §5.10)
- **Action:** spy `console.log/error/warn/info` across a successful
  `hotRename('research-2026-09','research-2026-10')` and a fail-loud
  `hotRename('nope','b')`.
- **Expected PASS:** ZERO console output on both paths (failures are thrown, never
  logged).

---

## §Run — results (filled in after execution)

| id | Scenario | Result |
| --- | --- | --- |
| H1 | Rename idle CLEAN non-default: drained 0, delta.renamed, unregister-everywhere, default object identity, file stranded | ✅ PASS |
| H2 | Old renamed engine + store torn down (query/putNode fail loud; getNode resolves; stranded file reloads with nodes); new `to` engine LIVE | ✅ PASS |
| H3 | In-flight query DRAINS first — never torn down mid-query; drained 0; query settles on the old embedder | ✅ PASS |
| H4 | 3-store registry — only the from renamed/drained; survivor + default survive | ✅ PASS |
| H5 | Fresh `loadRagStoreRegistry` shows the `to` present on the new file, `from` gone; implicit/corrupt false (D2) | ✅ PASS |
| H6 | Second store/engine `teardown()` on the OLD pair resolves immediately (primitive-level idempotency) | ✅ PASS |
| F1 | `null`/`5`/`''` `from` → W-rename-arg `from required`; live+disk untouched; no teardown | ✅ PASS |
| F1b | `null`/`5`/`''` `to` → W-rename-arg `to required`; live-untouched; no teardown | ✅ PASS |
| F2 | unknown + repeat (already-renamed-away) `from` → W-rename-unknown-from; live-untouched; no teardown | ✅ PASS |
| F3 | `to` already present → W-rename-target-exists; live+disk untouched; no teardown | ✅ PASS |
| F4 | the DEFAULT → W-rename-default; live+disk untouched; no teardown | ✅ PASS |
| F5 | current `from` with `<from>:`-prefixed ids → R-rename-ids-present (inherited); disk NOT written; no teardown | ✅ PASS |
| F6 | native EACCES on persist propagates; live-untouched; no teardown | ✅ PASS |
| F7 | default-drift throw: the byte-pinned drift error + the old-`from` orphan STILL drained/teardown (F-H4-2) | ✅ PASS |
| F7h | never-settling store queue hangs `hotRename` (UNBOUNDED) | ⏸️ DEFERRED |
| F8h | never-settling in-flight query hangs the drain (UNBOUNDED) | ⏸️ DEFERRED |
| F8 | defensive orphan-undefined after a successful write (unreachable by contract) | ⏸️ DEFERRED |
| DRAIN-1 | the REUSED `drainAndReleaseEntry(RemovedEntry)` → drained 0, store+engine torn down, file stranded | ✅ PASS |
| N1 | runtime: no `teardown(` / `\b(teardown|close|destroy)\s*\(` literal; no lowercase delete primitive | ✅ PASS |
| N2 | remove module: no delete-primitive usage (D3); no MCP/IPC surface (D6) | ✅ PASS |
| N3 | zero `console.*` across successful + failed `hotRename` | ✅ PASS |

**Run:** `npx vitest run tests/__h6blinds__/unit-h6-hot-rename-blind-greens-run.test.ts`
(the repo's vitest, node env) — **18 tests, 18 passed.** The runner was DELETED after
the run; this document is the artifact.

**Tally: PASS 18 / FAIL 0 / DEFERRED 3.** No spec/code drift and no un-hardened regression
observed against `docs/specs/unit-h6-hot-rename.md` §4/§5.1/§5.3/§5.4/§5.6/§5.7/§5.8 on this
host. Every byte-pinned message reproduced byte-exact:
`rag-store-registry-write: from required`, `rag-store-registry-write: to required`,
`rag-store-registry-write: cannot rename unknown store '<from>'`,
`rag-store-registry-write: store '<from>' cannot be renamed to '<to>': '<to>' already exists`,
`rag-store-registry-write: the default store cannot be renamed (default reassignment is a separate unit)`,
`rag-store-runtime: cannot rename store '<from>' — it has persisted '<from>:'-prefixed ids`,
`rag-store-runtime: unknown store '<from>'`, `rag-store-runtime: default entry drifted from the loaded registry`,
`retrieval engine: torn down`, `rag store: torn down`, and the propagated native
`EACCES` fs Error. The three DEFERRED rows (F7h/F8h/F8) are the documented
UNBOUNDED/unreachable states, not fabricated PASS. The `hotRename` behavioral surface
(H1–H6, F1–F6, F7, DRAIN-1) all reproduce from the LIVE modules exactly as the spec pins
(§5.6/§5.7/§5.4), the F-H4-2 default-drift drain is confirmed constructible + green, and
the U-H2 `hotApply({kind:'rename'})` write/reject set + the reused `drainAndReleaseEntry`
are confirmed co-existing unchanged behind the new async `hotRename`.

### Run-iteration note (transparency — no self-verification of behavior)
- The only runner iterations were **greens-scenario construct corrections, not module
  defects**: the U-H5 teardown surfaces throw **synchronously** — a torn-down
  engine's `query()` and a torn-down store's `putNode` fail loud by THROWING
  (retrieval.ts:668 / rag-store.ts:735 `enqueue` guard), not by rejecting (the runner's
  initial `.rejects` assertion is the wrong throw-mode for those; `store.putNode` IS an
  async function, so its `enqueue` guard throw surfaces as a REJECTION while
  `engine.query` is a plain method that throws synchronously). The engines/stores are
  genuinely torn down (the pinned messages fire); only the assertion wrapper was
  corrected. No behavioral scenario changed.
- **F7 was fully constructible**: an EXTERNAL mid-run rewrite of the registry file that
  adds a differing explicit `persistenceFile` to the `main` entry reproduces the F16
  default-drift key (the reloaded default's persistenceFile ≠ the boot-captured
  default), triggering `R-default-mismatch2` AND (per the F-H4-2 mirror) the drained
  old-`from` orphan. It was NOT deferred.

### RCA-3 / doc-review reconciliation note (for the proofreader gate)
The landed `tests/unit-h6-hot-rename.test.ts` (NOT read by this pass) carries the
adversarial regressions **F-H4-1** (drain-gate TOCTOU re-entry inside the REUSED
`drainAndReleaseEntry`) and **F-H4-2** (default-drift throw path — the dropped `from`
orphan STILL drained). The F-H4-2 regression pins the same drift-path drain this
battery's F7 verifies from the documented surface; F-H4-1 is inherited from the reused
helper (its re-entered `inFlight()===0` gate is behaviorally covered by H3 — the drain
never proceeds while `inFlight()>0`).

## Spec ambiguities / drift surfaced (for the proofreader/doc-review gate)

- **None in the behavioral contract.** Every §5.6 H1–H6, §5.7 F1–F6/F7, §5.4, and §5.8
  pin reproduced from the live modules. The runner iterations above were greens-runner
  throw-mode corrections (the U-H5 teardown surfaces throw synchronously — the pinned
  message, matching §5.6 H2's "fails loud"), not spec/code drift.
- **One readability note (not a defect):** the U-H5 teardown surfaces fail loud
  SYNCHRONOUSLY — a torn-down engine's `query()` (`retrieval.ts:668`) and a torn-down
  store's mutation guards (`rag-store.ts:735`) THROW, while `store.putNode` (an `async`
  function) surfaces that throw as a REJECTION. The exact throw-mode is not spelled out
  in §5.6/§5.7 ("fails loud"), so a future greens writer should assert `engine.query(...)`
  with a synchronous `toThrow` wrapper and `store.putNode(...)` with `.rejects`. **The
  doc-review pass added the one-line cross-reference to the SPEC: `unit-h6-hot-rename.md`
  §5.6 now carries a "Sync-vs-async fail-loud note" pinning the throw-mode and repointing
  to the U-H5 spec (§5) + `retrieval.ts:668`/`rag-store.ts:735`, so a future blind-test
  writer does not re-derive it.** (Behavior is exactly as pinned.)
- **Adversarial reconciliation (RCA-3, registered in the spec §3a):** the U-H6 adversarial
  pass found NO host defects and NO package/upstream (provident-ssr) findings; three
  INFOs recorded — **INFO-H6-1** (`from === to` → W-rename-target-exists; an untested
  edge, consistent with the write-level no-op guard), **INFO-H6-2** (whitespace-only
  names pass the guards and route through the write module — spec-conformant
  module-wide, DO NOT CHANGE), **INFO-H6-3** (survivor-rebuild orphan churn on a
  multi-store rename — pre-existing U-H2 behavior, out of U-H6's single-pair scope). None
  affects this battery's 18 PASS / 0 FAIL / 3 DEFERRED tally (H1–H6 / F1–F6 / F7 /
  DRAIN-1 / N1–N3 PASS; F7h/F8h UNBOUNDED-hang + F8 defensive skip DEFERRED).
- **F7 constructibility is deterministic and documented here** so a future gate does not
  need to re-derive the F16 drift key: an external rewrite adding a differing explicit
  `persistenceFile` to the `main` entry reproduces `R-default-mismatch2` + the F-H4-2
  drain.
- **§5.7 F3's example uses `'a'` as a not-present `from`** even though the write module
  checks W-rename-unknown-from BEFORE W-rename-target-exists — a target-exists rejection
  requires a PRESENT `from`. The F3 scenario here boots a 3-store registry and renames
  `research-2026-09` → the existing `research-2026-10` so the target-exists branch is
  reached. (Illustrative-example only; the pinned template is reproduced byte-exact.)
- **The §5.7 table column label reads "F8"** for the defensive absent-entry skip and the
  runner/spec use §5.3 step 4 / §5.7 F8 consistently; no numbering conflict beyond the
  F7h/F8h hang rows being separate awareness IDs.

## What a live-app session should later exercise (the §6 live gate is PARKED per user instruction)

The §6 live-scenario gate is **PARKED** (per the user instruction — do NOT launch the app;
a live app session is unavailable). The drain-then-teardown rename is fully node-testable
in this battery (no live app needed). When a live-app session does run, it should exercise
the **U-H8** operator path end-to-end (the operator-UI confirmation dialog →
`controller.hotRename(from, to)` on a real live store/engine), i.e. a real
operator-triggered rename that drains then tears down a live old-`from` store/engine. Per
§6, `tests/unit-h6-hot-rename-live-pending-battery.md` (the live-pending battery) is NOT
authored now (PARKED).
