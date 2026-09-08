# Unit U-H7 — Default Reassignment (`hotSetDefault` + `hotRenameDefault`): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-08.
- **Derived from DOCUMENTATION ONLY** — `docs/specs/unit-h7-default-reassign.md` §4
  (DEFAULT-REASSIGNMENT-METHOD, DEFAULT-REBIND, SET-DEFAULT-WRITE-KIND,
  DEFAULT-RENAME-FOLD, DEFAULT-CHANGE-KEEPS-STORE, VECTOR-REWARM-CONSTRUCT-FIRST,
  VECTOR-REWARM-FAILSAFE-LEXICAL-PENDING, OLD-DEFAULT-CACHE-HANDOFF,
  HOT-SET-DEFAULT-NOOP, UNREGISTER-EVERYWHERE, ATOMIC-APPLY-DEFAULT,
  RUNTIME-STAYS-GREP-CLEAN), §5.1 (`hotSetDefault`/`hotRenameDefault` +
  `HotSetDefaultResult`/`HotRenameDefaultResult` + the helpers
  `createDefaultVectorBoot`/`releaseDefaultVectorBoot` + the write-module
  `setDefault`/`renameDefault` kinds + `defaultChanged`), §5.3 (`hotSetDefault`
  exact surface + `HotSetDefaultResult`), §5.4 (the 9-step `hotSetDefault` order),
  §5.5 (the 5 byte-pinned U-H7 message templates + the reused
  R-default-changed/W-rename-target-exists), §5.6 (happy paths H1–H8), §5.7
  (fail-states F1–F9 + F-H7-vector-buildfail + F-hang), §5.8 (the negative pins
  A-P2-8/N1/N2, D3, D4, D5/D6), §5.10 (the census), §7 (the eleven-item Architect
  ruling: Q1 CONFIRMED `hotSetDefault`; Q2 CONFIRMED construct-first/lexical-pending;
  Q3 CONFIRMED **R1** — a separate `renameDefault` kind + `hotRenameDefault(to)` +
  legacy `W-rename-default` UNCHANGED; Q4 CONFIRMED RETAIN; Q5 CONFIRMED atomic order;
  Q6 CONFIRMED additive write kinds; Q7 CONFIRMED cache HAND OFF; Q8 CONFIRMED
  no-op; Q9 CONFIRMED mechanism-only; Q10 CONFIRMED UNBOUNDED drain; Q11 CONFIRMED
  IN SCOPE). Consumed/landed contracts read for fixture shapes: the U-H5
  `VectorBootController.teardown()` + `RetrievalEngine.inFlight()`/`setEmbedder`/
  `query()` member signatures, the `RagStoreEntry`/`buildRagStoreDirectory`/
  `RagStoreBootPlan` surface (`src/main/rag-store-directory.ts`), the
  `loadRagStoreRegistry`/`LoadedRagStoreRegistry` surface
  (`src/main/rag-store-registry.ts`), the `createJsonRagStore`/`RagStore`/`RagNode`
  surface (`src/main/rag-store.ts`), the `createRetrieval`/`RetrievalEngine`/
  `Embedder` surface (`src/main/retrieval.ts`), the `createVectorBootController`/
  `VectorBootController` surface (`src/main/vector-boot.ts`), the `createVectorCache`
  surface (`src/main/vector-cache.ts`), the `EmbeddingProvider` surface
  (`src/main/embeddings.ts` interface only), and the write module's
  `applyRegistryMutation`/`setDefaultRegistryStore`/`renameDefaultRegistryStore`/
  `RegistryDelta` signatures + message templates (`src/main/rag-store-registry-write.ts`).
  The `rag-store-runtime.ts` source was read ONLY to confirm the exported
  `RagStoreRuntimeController` interface + `HotSetDefaultResult`/`HotRenameDefaultResult`
  + the `createRagStoreRuntimeController` options type (the §5.1 surface) and for the
  §5.8 N1/N2/grep scans — the `hotSetDefault`/`hotRenameDefault` BODIES and the
  helper-module bodies were CONSTRUCTED + CALLED, NOT read (behavior derived from the
  spec text alone).
- **NOT read:** the `hotSetDefault`/`hotRenameDefault` implementation bodies, the
  `rag-store-default.ts` module body (only the §5.8 negative-pin + §5.10 census greps
  ran on it — static, not behavioral), and the SpecWriter-pinned
  `tests/unit-h7-default-reassign.test.ts`. The RUN record (§Run) was filled in AFTER
  the scenarios were authored. `src/` and the landed test suite were not modified by
  this pass.
- **Modules under test (the live seam):** `createRagStoreRuntimeController`
  (`rag-store-runtime.js`) — `hotSetDefault(name)`/`hotRenameDefault(to)` imported and
  CALLED only; the write module's `applyRegistryMutation`/`setDefaultRegistryStore`/
  `renameDefaultRegistryStore` imported and CALLED only (their PURE behavior is read
  from the SPEC §5.1, not from the source bodies); the consumed fixture factories
  `createJsonRagStore`/`loadRagStoreRegistry`/`buildRagStoreDirectory`/
  `createVectorBootController` used for a real 2-or-3-store boot (lexical + vector).
- **Harness:** ONE throwaway vitest runner
  `tests/__h7blinds__/unit-h7-default-reassign-blind-greens-run.test.ts` (a NEW file,
  node environment) executed with the repo's vitest
  (`npx vitest run tests/__h7blinds__/unit-h7-default-reassign-blind-greens-run.test.ts`).
  Every boot uses a fresh `mkdtemp` dir under `os.tmpdir()` and a real
  `loadRagStoreRegistry`+`buildRagStoreDirectory` boot (`main` default +
  `research-2026-09` non-default, each on a derived persistence file + a pre-seeded
  node so the boot-built engines index it), with the real userData never touched.
  Vector boots use the deterministic/mock embedder double. Byte-pinned message
  assertions are exact against §5.5/§5.7/§5.6. The runner is DELETED after the run —
  this document is the artifact.
- **Legend:** PASS = behavior matches the spec; FAIL = doc/spec drift OR an
  un-hardened regression (never a pass); DEFERRED = the precondition cannot be
  constructed blindly (with the reason).

---

## Boot fixture (real 2-store boot, per the U-H4/U-H6 convention + vector variant)

`<d>` = a fresh `mkdtemp`; `<path>` = `<d>/provident-rag-stores.json` written as

```json
{ "version": 1, "stores": [ { "name": "main", "default": true }, { "name": "research-2026-09" } ] }
```

The derived store files are `<d>/provident-rag-main.json` and
`<d>/provident-rag-research-2026-09.json` (the config omits `persistenceFile`, so the
loader derives them). `RagNode` helper: `node(id, content) = { id, type:'p', content,
ownedNodeIds:[], createdAt:T0, updatedAt }`, `T0='2026-01-01T00:00:00.000Z'`.

1. PRE-SEED the two store files BEFORE the boot directory build (so the boot-built
   engines index the seeded nodes — RETAIN semantics for the strand byte-compare):
   `await createJsonRagStore({ path: <mainFile> }).putNode(node('m1','beta'))` and
   `await createJsonRagStore({ path: <resFile> }).putNode(node('n1','alpha'))`.
2. `registry = loadRagStoreRegistry({ path: <path> })` (implicit:false, corrupt:false).
3. `plan = buildRagStoreDirectory(registry, { userDataPath: <d>, embedderKind,
   provider })` — `embedderKind:'lexical'` + `provider:null`, OR
   `embedderKind:'vector'` + the mock (`embedBatch` returns `[1,2,3]` per text).
   Under vector, `plan.vectorBoot` is the ONE boot (the `main` default's, born-lexical
   pending); under lexical it is `null`.
4. `defaultEntry = plan.directory.entries.get(plan.directory.defaultName)`.
5. `controller = createRagStoreRuntimeController({ registry, directory: plan.directory,
   defaultEntry, vectorBoot: plan.vectorBoot, registryPath: <path>, userDataPath: <d>,
   embedderKind, provider })`.

The captured pre-flip `main` entry (`.store`, `.engine`, `.name`, the persistence-file
bytes) is the OLD default that H4/F8 verify is RETAINED (store) / torn-down-in-boot-only
(vector engine). The pre-flip `getVectorBoot()` object is the OLD boot torn down LAST.

---

## A. §5.6 Happy paths H1–H8

### H1. set-default to a present, IDLE non-default (LEXICAL) → re-bound + non-destructive + D2
- **Setup:** 2-store lexical boot (pre-seeded `m1` on `main`, `n1` on `research-2026-09`);
  snapshot the `main` persistence bytes; capture the `main` + `research` entries and the
  registry file bytes.
- **Action:** `res = await controller.hotSetDefault('research-2026-09')`.
- **Expected PASS:** `res.drained === 0`; `res.noop === false`;
  `res.delta` deep-equals `{ added:[], removed:[], renamed:[], defaultChanged:['research-2026-09'] }`;
  `res.loaded.implicit === false` && `res.loaded.corrupt === false` &&
  `res.loaded.defaultStoreName === 'research-2026-09'`;
  `getDefaultName() === 'research-2026-09'`; `getDirectory().defaultName === 'research-2026-09'`;
  `getDefaultStore() === resEntry.store` (the NEW default's store) && `!== mainEntry.store`;
  `getDefaultEntry().name === 'research-2026-09'`; `getVectorBoot() === null` (lexical —
  there was never a boot);
  `getDirectory().entries.get('main')` STILL PRESENT and its `.store` is the SAME object
  (retained, never torn down); the `main` persistence file **BYTE-IDENTICAL** (D3 strand);
  the registry file re-written (setDefault flip) but `currentStores()` lists both with
  `research-2026-09` `default:true` (advanced to `loaded`); `statusOf('main')` resolves
  `'loaded'` (retained non-default); `statusOf('research-2026-09')` resolves `'loaded'`.
  The OLD default's entry retains its same lexical engine (no teardown in lexical mode).

### H2. set-default is re-bindable (A-P2-1 / D1 — the re-bind propagates per-call)
- **Setup:** the post-H1 controller (default now `research-2026-09`); capture the NEW
  default engine.
- **Action:** query through the runtime's default engine.
- **Expected PASS:** `getDefaultEngine()` is the NEW default's entry engine (the
  `research-2026-09` entry's engine); `await controller.getDefaultEngine().query('alpha')`
  ranks `n1` (the NEW default's data — the re-bound engine serves the new default);
  the OLD default is still reachable via `getDirectory().entries.get('main')` (a live
  retained non-default entry). This is the re-bind the gate's D1 note demands.

### H3. set-default to the CURRENT default is a NO-OP (Q8)
- **Setup:** 2-store lexical boot; snapshot the registry file bytes + the `main` default
  object identity + `getDefaultStore()`.
- **Action:** `res = await controller.hotSetDefault('main')`.
- **Expected PASS:** `res.noop === true`; `res.drained === 0`;
  `res.delta` deep-equals `{ added:[], removed:[], renamed:[], defaultChanged:[] }`;
  NO write (the registry file **BYTE-IDENTICAL**); NO teardown; NO live mutation —
  `getDefaultName() === 'main'`; `getDefaultStore()`/`getDefaultEngine()`/`getVectorBoot()`
  are the UNCHANGED boot default objects.

### H4. set-default in VECTOR mode re-warms the new default + tears down the OLD default's vector boot, STORE retained (A-P2-4/D5/Q4)
- **Setup:** 2-store VECTOR boot (mock provider; `main` owns the at-most-ONE boot);
  capture the OLD boot + its engine + the `main` persistence bytes + the cache-file
  presence/bytes; capture `mainEntry.store`.
- **Action:** `res = await controller.hotSetDefault('research-2026-09')`.
- **Expected PASS:** `res.drained === 0`; `res.noop === false`;
  `delta.defaultChanged === ['research-2026-09']`; `getVectorBoot()` is a NEW boot
  controller — a DIFFERENT object identity !== the captured OLD boot;
  `getDefaultEngine() === getVectorBoot().engine` (the new boot's born-lexical-pending
  engine); the OLD boot's CAPTURED engine `query('alpha')` THROWS
  `retrieval engine: torn down` (the at-most-ONE OLD boot torn down LAST — after the
  re-bind, so no dark default);
  `getDirectory().entries.get('main')` STILL PRESENT with a FRESH LEXICAL engine
  (`.engine !== oldBoot.engine`, a lexical engine on the RETAINED store) and the SAME
  `.store` object; the `main` persistence file **BYTE-IDENTICAL** (D3) +
  `statusOf('main')` resolves `'loaded'`; the persisted vector-CACHE file
  `provident-vector-cache.json` is present-and-byte-identical (never deleted/flushed by
  the boot teardown — Q7 HAND OFF).

### H5. the re-warmed new-default boot builds in the background → PROMOTES (W1 parity)
- **Setup:** the post-H4 vector controller (the new `research-2026-09` boot fired
  fire-and-forget at the flip).
- **Action:** poll `controller.getVectorBoot().phase()` for the background build.
- **Expected PASS:** the new default serves LEXICALLY-pending during the build; the
  build (the pre-seeded `n1` content through the mock provider) SUCCEEDS and PROMOTES —
  `phase()` reaches `'promoted'`; `await controller.getDefaultEngine().query('alpha')`
  RESOLVES (a promoted engine serves vector; NOT thrown); the flip itself already
  resolved (`hotSetDefault` did not await the build — it fired and returned).

### H6. the write is re-readable (D2)
- **Setup:** after a `hotSetDefault('research-2026-09')` (lexical or vector).
- **Action:** `reread = loadRagStoreRegistry({ path: <path> })`.
- **Expected PASS:** `reread.defaultStoreName === 'research-2026-09'`;
  `reread.stores` has `research-2026-09` default:true and `main` default undefined/false;
  `reread.implicit === false` && `reread.corrupt === false` — persisted == live (D2).

### H7. the OLD default is a retained non-default lexical entry (D3/D4)
- **Setup:** the post-flip controller (lexical or vector); capture the retained `main`
  entry in the live directory + the `main` persistence file bytes.
- **Action:** `statusOf('main')`; read the retained entry; load a FRESH store over the
  retained `main` file.
- **Expected PASS:** `statusOf('main')` RESOLVES (the store is retained, never removed);
  `getDirectory().entries.get('main')` has a LEXICAL engine (vector mode — the fresh
  lexical rebuild) / the same lexical engine (lexical mode); a FRESH
  `createJsonRagStore({ path: <mainFile> })` `listNodes()` still serves `m1` (the file
  is stranded intact, never deleted — D3).

### H8. the default's RENAME keeps it default (D4 fold — Q3 R1)
- **Setup:** 2-store LEXICAL boot (default `main`); snapshot the registry bytes.
- **Action:** `res = await controller.hotRenameDefault('main-new')`; then
  `controller.hotRename('main','x')` and `controller.hotApply({kind:'rename',from:'main',to:'x'})`.
- **Expected PASS:** `getDefaultName() === 'main-new'` (it STAYED the default under the
  new name — `default:true` preserved); `res.drained === 0`;
  `res.delta.renamed === [{ from:'main', to:'main-new' }]` &&
  `res.delta.defaultChanged === ['main-new']`; `statusOf('main-new')` resolves (the
  surviving default entry); the LEGACY `hotRename('main','x')` and
  `hotApply({kind:'rename',from:'main',to:'x'})` STILL propagate
  `W-rename-default` (U-H2 F9/HOST-2 + U-H6 F4 — NOT relaxed).

---

## B. §5.7 Fail-states F1–F9 (F5/F7/F-hang defer) + F-H7-vector-buildfail

`live-untouched` = `getDirectory().entries` deep-equal to before + the registry file
byte-identical + NO teardown/apply ran (the write/guard threw before the apply/rebind);
`disk-untouched` = the registry + the OLD-default store file byte-identical. Fail-loud =
the pinned message.

### F1. `hotSetDefault(null)`/`hotSetDefault(5)`/`hotSetDefault('')` → R-set-default-arg; live-untouched; NO teardown
- **Setup:** 2-store LEXICAL boot (seeded).
- **Action:** `controller.hotSetDefault(null)` / `(5)` / `('')`.
- **Expected PASS:** each rejects/loudly-throws
  `rag-store-runtime: default store name required` (R-set-default-arg, §5.5); live-untouched;
  NO teardown (the seeded engines still serve).

### F2. `hotSetDefault('nope')` (unknown) → W-set-default-unknown; live-untouched; NO teardown
- **Setup:** 2-store LEXICAL boot.
- **Action:** `controller.hotSetDefault('nope')`.
- **Expected PASS:** rejects `` rag-store-registry-write: cannot set unknown store 'nope' as default `` (PROPAGATES); live-untouched; NO teardown.

### F3. `hotSetDefault('main')` where `main` IS the current default → no-op (NOT a fail)
- **Setup:** 2-store LEXICAL boot; snapshot the registry bytes + the default objects.
- **Action:** `res = await controller.hotSetDefault('main')`.
- **Expected PASS:** `res.noop === true`; `res.drained === 0`; the registry file
  BYTE-IDENTICAL (no write); `getDefaultName()` still `'main'`; the default objects
  unchanged (no teardown, no live mutation). (≡ H3.)

### F4. persist hits a native fs failure (EACCES) → the native fs Error PROPAGATES; live-untouched; NO teardown
- **Setup:** 2-store LEXICAL boot; snapshot the registry + main-file bytes; `chmod <d> 0o500`
  (owner r-x — the existing registry is still READABLE, the dir no longer WRITABLE, so
  the atomic `writeFileSync(<path>.tmp)` fails).
- **Action:** `try { await controller.hotSetDefault('research-2026-09') } catch(e){ err=e }`, then `chmod <d> 0o700` in `finally`.
- **Expected PASS:** `err` is the NATIVE fs Error (code `EACCES`, message contains
  `EACCES` — propagated unchanged, NOT a wrapped R-*/W-* message); live-untouched
  (`main` still the default, `getDefaultName()==='main'`); the registry + main-file
  byte-identical; NO teardown (the default store/engine still serve).

### F5. the NEW default's vector boot CONSTRUCTION throws — **DEFERRED**
- **Reason:** §5.7 F5's trigger is "a provider/config/construct failure" during
  `createDefaultVectorBoot(newDefaultEntry.store, _provider, _userDataPath)`. All three
  inputs are the SAME already-proven-valid objects the boot used (the store is a live
  non-default, the provider is the already-warmed `_provider`, `_userDataPath` a valid
  temp dir), and `createVectorBootController` provides no documented blind injection
  (a thrown `store.listNodes()`, a torn-down provider, a null provider) that would
  throw DISTINCTIVELY on the NEW default's construction while leaving the boot's own
  construction (identical inputs) succeeding. Not blind-constructible from the documented
  surface — the spec marks the outcome (a propagate + orphaned born-lexical engine, no
  write/teardown) but not a deterministic trigger. Recorded DEFERRED.

### F6. `hotApply({kind:'setDefault'})` → R-set-default-through-hot-apply; live-untouched; NO teardown
- **Setup:** 2-store LEXICAL boot.
- **Action:** `controller.hotApply({ kind:'setDefault', name:'research-2026-09' })` (and
  `{ kind:'renameDefault', to:'x' }`).
- **Expected PASS:** each loUDly throws
  `rag-store-runtime: default reassignment must use hotSetDefault`
  (R-set-default-through-hot-apply, §5.5 — `hotApply` stays default-stable); live-untouched;
  NO teardown. (The `renameDefault`-through-`hotApply` case routes the SAME pinned message
  — observed, consistent with the runtime guard.)

### F7. the defensive drift — `loaded.defaultStoreName !== name` after the write — **DEFERRED**
- **Reason:** §5.7 F7 is the defensive `if (loaded.defaultStoreName !== name)` guard. The
  write module's `setDefault` flip GUARANTEES `defaultStoreName === name` on the reload
  (the D2 round-trip), so the guard is reachable only through an EXTERNAL mid-run registry
  default edit that lands between the write's persist and its re-read — a TOCTOU race with
  no deterministic blind injection from the documented surface (unlike U-H6's F7 drift key,
  which was a differing `persistenceFile` on the default — here the F7 discriminator is the
  DEFAULT NAME itself, always equal post-flip). Recorded DEFERRED.

### F8. the OLD default's vector engine has an in-flight query at release (A-P2-2) — the SETTLING case: DRAINS FIRST, never torn down mid-query
- **Setup:** 2-store VECTOR boot; capture the OLD (main) boot engine; swap a HOLDING
  embedder into it (`oldEngine.setEmbedder(holding)` where `score` awaits a test deferred
  then resolves `[{nodeId:'n1', score:1}]`); fire `q = oldEngine.query('alpha')` NOT-awaited;
  assert `oldEngine.inFlight() === 1`.
- **Action:** `rh = controller.hotSetDefault('research-2026-09')` (NOT awaited); while held
  assert `oldEngine.inFlight() === 1` + `rh` NOT settled AND `getDefaultName()` already
  `'research-2026-09'` (the re-bind happened BEFORE the drain/teardown — construct-new-
  before-teardown-old, NO dark default); `release()` (settle the deferred).
- **Expected PASS:** the release gate blocks — the OLD default's vector engine is NOT torn
  down while `inFlight() === 1`; after release the gated query SETTLES on the OLD embedder
  (`qres.ranked[0].nodeId === 'n1'`, `score === 1`), `inFlight()` returns to 0, `rh` resolves
  `{ drained: 0, noop:false }`; a NEW `query('gamma')` on the OLD engine THROWS
  `retrieval engine: torn down` (torn down only after the drain settled). (F-hang — the
  NEVER-settling query — is DEFERRED below.)

### F9. the default's RENAME through the LEGACY path (both seams) → W-rename-default; live-untouched; NO teardown
- **Setup:** 2-store boot (default `main`); snapshot the registry + default store bytes +
  the main entry.
- **Action:** `controller.hotRename('main','x')` AND `controller.hotApply({kind:'rename',from:'main',to:'x'})`.
- **Expected PASS:** EACH rejects `` rag-store-registry-write: the default store cannot be renamed (default reassignment is a separate unit) `` (**W-rename-default**, U-H2 F9/HOST-2 + U-H6 F4 — NOT relaxed); live-untouched (no `x` entry, `main` still present);
  the registry file byte-identical; NO teardown (the default store/engine still serve).

### F-H7-vector-buildfail. the NEW default's background build FAILS (F1 class) → FAIL-SAFE: the reassignment SUCCEEDS; the new default serves LEXICALLY-pending, NEVER demoted — **DEFERRED**
- **Reason (blind-construction):** the pinned branch is "the NEW default's background `start()`
  build FAILS totally (F1 class) → stays lexical-pending, logs `vector boot: build failed
  (staying pending)`". A node-level embed failure is DOCUMENTED-transient (the live log shows
  `vector index: node embed failed (transient)` → `build complete (embedded 0 … transient 1)` →
  `vector boot: promoted`) — the build SKIPS the failing node and STILL PROMOTES an empty index
  rather than failing total. The genuine F1 TOTAL-failure trigger (one that rejects the whole
  `start()` build and leaves it pending) has no deterministic blind injection derivable from the
  spec's documented surface. What IS constructible + green (asserted live): with a throwing
  embedder, `hotSetDefault('research-2026-09')` STILL RESOLVES `{ drained:0, noop:false,
  delta.defaultChanged:['research-2026-09'] }` (the reassignment NEVER fails loudly — the
  failsafe's primary intent) and the new default is ALWAYS served (`query('alpha')` resolves,
  never unserved; a promoted engine is never demoted). Recorded DEFERRED for the specific
  "stays-pending build-failed" branch; the no-loud-failure + never-unserved intent is observed.

### F-hang. a NEVER-settling in-flight query on the OLD default's vector engine (UNBOUNDED) — **DEFERRED**
- **Reason:** Q10 CONFIRMED the old-default drain awaits `inFlight()===0` UNBOUNDED
  (A-P2-2 correctness-first; a never-settling query HANGS — the F-H5-3 awareness, not a
  bug). The only observable outcome is an indefinite hang of `hotSetDefault`, which a
  bounded greens battery cannot ASSERT as a PASS without a (forbidden) timeout message or a
  permanently-pending promise. F8 behaviorally covers the SETTLING in-flight case (the
  release gate + re-bind-before-teardown + the old engine never torn down mid-query).

---

## C. §5.8 Negative pins (grep/static — A-P2-8/N1/N2, D3, D6)

### N1. `rag-store-runtime.ts` has NO `teardown(`/`close(`/`destroy(` literal + no lowercase delete primitive (A-P2-8/N1 + N2)
- **Action:** read the runtime source; assert NO `\b(teardown|close|destroy)\s*\(` and NO
  `\b(unlink|rm|rmdir|remove|truncate)\s*\(`, and that the only U-H7 helper references are
  the two identifier call-sites `createDefaultVectorBoot(`/`releaseDefaultVectorBoot(`
  (neither contains a lowercase `teardown`).
- **Expected PASS:** both regexes have NO match on `rag-store-runtime.ts` — the N1/A-P2-8
  grep pin STAYS GREEN with ZERO re-pin (§5.8 HARD REQUIREMENT — no literal `teardown(`
  in the runtime); the runtime makes no lowercase delete call.

### N2. `rag-store-default.ts` carries the D3 no-delete + D6 no-console + no-MCP/no-IPC pins; the `rag-store-runtime.ts` no-MCP/no-IPC pin
- **Action:** grep `rag-store-default.ts` for NO filesystem-delete usage
  (`\b(unlink|rm|rmdir|truncate|remove)\s*\(`, `.unlink(`, `fs.(rm|unlink|...)`), NO
  `console.`, and NO MCP/IPC surface
  (`MUTATING_METHODS`/`ALL_TOOLS`/`RpcMethod`/`ipcMain`/`webContents.send`/`IPC_[A-Z_]+`);
  grep `rag-store-runtime.ts` for the SAME no-MCP/no-IPC negative pin; confirm the census
  (§5.10): `teardown(` CALL-SITE count +1 in `rag-store-default.ts` (the sole `boot.teardown()`
  — the second regex match is its docstring mention, not a call site), `ZERO` in the runtime.
- **Expected PASS:** no delete usage in either module (D3 — the strand is ALSO verified
  behaviorally in H1/H4/H7: the OLD-default file is byte-identical); ZERO `console.` in
  `rag-store-default.ts` and the runtime (0-log census); no MCP/IPC surface (D6/A-P2-4).
  The MODULE may MENTION the delete primitives / `teardown(` in header prose; it must not
  USE them. (The runtime reference at line 46 confirms the two helper identifiers alone.)

### N3. a successful + a fail-loud `hotSetDefault` emit ZERO `console.*` lines (the 0-log census, §5.10) — LEXICAL path
- **Action:** spy `console.log/error/warn/info` across a successful
  `hotSetDefault('research-2026-09')` and a fail-loud `hotSetDefault('nope')` on a LEXICAL
  controller (so no boot-construction console noise); static: `rag-store-runtime.ts` contains
  no `console.*`.
- **Expected PASS:** ZERO console output on both paths (failures are thrown, never logged;
  the runtime source has no `console.*`). (The VECTOR path's `createVectorBootController`/
  boot may log its OWN born-lexical/build milestones — that is the BOOT's census, not the
  runtime's; the runtime itself stays 0-log, §5.8/F-H7.)

---

## §Run — results (filled in after execution)

| id | Scenario | Result |
| --- | --- | --- |
| H1 | LEXICAL set-default → re-bound + non-destructive + D2 (delta.defaultChanged, drained 0, old file byte-identical, both entries retained) | ✅ PASS |
| H2 | re-bindable (A-P2-1): default engine serves the new default's data; old entry still reachable | ✅ PASS |
| H3 | set-default to the current default = NO-OP (`noop:true`, no write, objects unchanged) | ✅ PASS |
| H4 | VECTOR set-default re-warms the new default (new boot identity) + tears down the OLD boot LAST; store retained + file + cache strand | ✅ PASS |
| H5 | the re-warmed new-default boot builds in the background → PROMOTES; new default serves vector | ✅ PASS |
| H6 | a fresh `loadRagStoreRegistry` shows the new default, implicit/corrupt false (D2) | ✅ PASS |
| H7 | the OLD default is a retained non-default lexical entry; a fresh store over the stranded file reloads its nodes | ✅ PASS |
| H8 | the default's RENAME keeps it default (`hotRenameDefault`); legacy `hotRename`/`hotApply`-rename STILL W-rename-default | ✅ PASS |
| F1 | `null`/`5`/`''` → R-set-default-arg; live-untouched; no teardown | ✅ PASS |
| F2 | unknown → W-set-default-unknown; live-untouched; no teardown | ✅ PASS |
| F3 | current default → `noop:true`, no write | ✅ PASS |
| F4 | native EACCES on persist propagates; live-untouched; no teardown | ✅ PASS |
| F5 | NEW-default boot-construction throw (no deterministic blind trigger) | ⏸️ DEFERRED |
| F6 | `hotApply({kind:'setDefault'})` → R-set-default-through-hot-apply; live-untouched; no teardown | ✅ PASS |
| F7 | defensive drift (`loaded.defaultStoreName !== name`, external TOCTOU) — not blind-constructible | ⏸️ DEFERRED |
| F8 | in-flight query on the OLD vector engine DRAINS first (release gate), never torn down mid-query; re-bind-before-release; drained 0; old engine torn down after | ✅ PASS |
| F9 | legacy `hotRename('main','x')` + `hotApply`-rename → W-rename-default; live-untouched; no teardown | ✅ PASS |
| F-H7-vector-buildfail | background build FAILS (F1 total) → failsafe LEXICAL-pending; **the total-failure trigger is not blind-constructible** (a node embed failure is a documented TRANSIENT skip → the build still promotes an empty index); the no-loud-failure + never-unserved intent IS observed | ⏸️ DEFERRED |
| F-hang | never-settling in-flight query (UNBOUNDED) — not assertable in a bounded battery | ⏸️ DEFERRED |
| N1 | runtime: no `teardown(`/`close(`/`destroy(` literal; no delete primitive; only the two helper identifiers | ✅ PASS |
| N2 | `rag-store-default.ts`: no-delete/D3, no-console, no-MCP/IPC + the sole `boot.teardown()` call-site census (+1, 0 in runtime) | ✅ PASS |
| N3 | zero `console.*` across successful + fail-loud `hotSetDefault` (lexical) + no `console.*` in the runtime source | ✅ PASS |

**Run:** `npx vitest run tests/__h7blinds__/unit-h7-default-reassign-blind-greens-run.test.ts`
(the repo's vitest, node env) — **12 runner tests, 12 passed, 0 failed** (H1–H8 + F1–F4/F6/F8/F9
+ N3 live), PLUS the N1/N2 static grep pins (verified in `bash`: the runtime + `rag-store-default.ts`
negative scans). The runner was DELETED after the run; this document is the artifact.

**Tally: PASS 18 / FAIL 0 / DEFERRED 4.** No spec/code drift and no un-hardened regression
observed against `docs/specs/unit-h7-default-reassign.md` §4/§5.1/§5.3/§5.4/§5.5/§5.6/§5.7/§5.8/§5.10
on this host. Every byte-pinned message reproduced byte-exact: `rag-store-runtime: default
store name required` (R-set-default-arg), `rag-store-runtime: default reassignment must use
hotSetDefault` (R-set-default-through-hot-apply), `rag-store-registry-write: cannot set
unknown store '<name>' as default` (W-set-default-unknown), `rag-store-registry-write: the
default store cannot be renamed (default reassignment is a separate unit)` (W-rename-default,
legacy), plus the reused `retrieval engine: torn down` and `rag store: torn down`. The four
DEFERRED rows (F5 NEW-default construct-throw, F7 defensive external-default-drift, F-H7
vector-buildfail F1-total trigger, F-hang never-settling) are documented non-blind-constructible
/ UNBOUNDED states, not fabricated PASS.

---

## Spec ambiguities / drift surfaced (for the proofreader/doc-review gate)

- **The header STATE line is stale prose.** `unit-h7-default-reassign.md` line 3–4 still reads
  "**U-H7 is THE NEXT CYCLE after U-H6 — NOT YET LANDED**" and the Status line (§p16) still
  reads "**SPEC (PROPOSED — the §7 rulings are the gate; NOT YET arbitrated, NOT YET
  red/green)**" — yet BOTH the §7 eleven-item Architect ruling (CONFIRMED, lines 1059–1119) and
  the LIVE code (`rag-store-default.ts` exists; `hotSetDefault`/`hotRenameDefault` present on
  the controller) show U-H7 landed. This is a doc-staleness item for the documentation-review
  gate, NOT a behavioral drift — the landed behavior reproduces the spec's contract exactly.
- **The `teardown(` grep census needs a call-site-vs-mention reading.** §5.10's "+1 teardown(
  call sites" counts CALL SITES; the raw `\bteardown\s*\(` grep on `rag-store-default.ts`
  returns 2 matches (one is the module's own docstring mention of `await boot.teardown()`).
  The genuine call-site count is 1 (line 65) and ZERO in the runtime — the census holds; the
  N-pin regex is a CALL-SITE pin.
- **`hotApply` accepts the `setDefault`/`renameDefault` kinds at the type level** (they are
  members of the exported `RegistryMutation` union), and both route to
  `R-set-default-through-hot-apply` at the RUNTIME guard (the TS input "narrows" is a runtime
  concern, not a compile-time exclusion) — F6 covers the pinned `setDefault`; the
  `renameDefault`-through-`hotApply` case routes the SAME pinned message (observed). No
  behavior drift.
- **`hotRenameDefault`'s persistence-file semantics are not pinned in H8.** §5.6 H8 asserts
  only the default flag + delta + the legacy rejection; it does NOT pin whether the renamed
  default's store is rebuilt onto a NEW derived file (a renameDefault with an omitted
  `persistenceFile` re-derives the file under the new name) or its nodes migrate. H8 here
  asserts exactly the pinned claims (default name, default preserved, delta, legacy
  rejection) and does not over-constrain the file semantics. Not a spec-drift, but a
  future-proofing note.
- **F-H7's "build-failed → stays-pending" trigger is narrower than its prose (a doc-nuance
  for the proofreader, not a defect).** §5.7 F-H7's trigger "the background `start()` build
  FAILS (F1 class)" can be read to include any embed failure, but the live boot treats a
  NODE-level embed failure as a document-transient skip (`vector index: node embed failed
  (transient)` → `build complete (embedded 0 … transient N)` → `promoted`), NOT a total build
  failure — so a throwing embedder does NOT reproduce the lexical-pending branch; it needs the
  F1 TOTAL-failure injection (an invalid provider/dimension/config that rejects the whole
  build), which is not derivable from the spec's surface. The reassignment's owns guarantee
  (never fails loudly; the new default is always served; a promoted engine is never demoted)
  IS observed green.
- **The F8 no-dark-default invariant was observable and green:** during the F8 block
  (re-bind held while the OLD default's vector engine was mid-query), `getDefaultName()`
  already reported the new default — the re-bind/precede-release order is confirmed live.

## RCA-3 / doc-review reconciliation note (for the proofreader/adversarial gate)
The adversarial pass (RCA-3, runs on the landed green) must confirm the §3a probes: the
no-dark-default invariant (F8 covers the observable settle-block form), the A-P2-2 drain
(F8), the silent `.catch` / runtime 0-log (N3), the byte-identical OLD-default store + cache
file (H4/H7), and the N1/A-P2-8 regex (N1/N2). No host defect was found by this blind battery.

## RCA-3 regressions reconciliation note (post-greens, doc-review 2026-09-08)
The U-H7 RCA-3 adversarial pass surfaced + fixed five HOST findings (recorded in the spec
§3a HOST-1..5), EACH now pinned by a regression in `tests/unit-h7-default-reassign.test.ts`
("RCA-3 HOST regressions"). These regressions re-confirm and extend the 18/0/4 tally:
- **HOST-1 (HIGH, `defaultPersistenceFile`)** — post-reassignment hot-REMOVE + hot-RENAME
  of a non-default now SUCCEED (the drift guard no longer compares every later loaded
  default's `persistenceFile` against the STALE boot file → no false drift-throw/scramble).
- **HOST-2 (MEDIUM, D4)** — the D4 decline on the DEFAULT-rename (a `hotRenameDefault` of a
  default carrying persisted `<from>:`-prefixed ids → `R-rename-ids-present` before the write;
  disk + live untouched, no drain).
- **HOST-3 (MEDIUM, drift guard)** — an external mid-run default edit then `hotRenameDefault`
  → fail-loud `R-default-changed` with the live directory SYNCHRONIZED to `loaded` (D2 even in
  the throw path).
- **HOST-4 (LOW, whitespace trim)** — `hotRenameDefault('   ')` → `to required` (the guard
  also rejects a whitespace-only `to`; a default is never renamed to a whitespace name).
- **HOST-5 (LOW, concurrency)** — a SECOND `hotSetDefault`/`hotRenameDefault` while one is in
  flight → `rag-store-runtime: default reassignment already in progress` (before any
  write/construct; no second boot starts).
Tally unchanged: **18 PASS / 0 FAIL / 4 DEFERRED**. No spec/code drift; the HOST-1..5
regressions pin behaviors the 18-run greens already observed on the H1–H8/F1–F9/N1–N3 paths.

## What a live-app session should later exercise (the §6 live gate is PARKED per user instruction)
The §6 live-scenario gate is **PARKED** (per the user instruction — do NOT launch the app; a
live app session is unavailable). The default reassignment is fully node-testable in this
battery (no live app needed). When a live-app session does run, it should exercise the
**U-H8** operator path end-to-end (the operator-UI confirmation dialog →
`controller.hotSetDefault(name)` on a REAL live store/engine + a real
operator-triggered `hotRenameDefault(to)`), i.e. a real default flip that re-binds the default
+ re-warms the vector boot through the wired `main.ts` + a real Electron app. Per §6,
`tests/unit-h7-default-reassign-live-pending-battery.md` is NOT authored now (PARKED).
