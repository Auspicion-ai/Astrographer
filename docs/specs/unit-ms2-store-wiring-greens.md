# Unit MS2 — Store-Instance Wiring + the `store` Selector: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date: 2026-09-05.**
- **Unit:** U-MS2 — the store-instance wiring (`src/main/main.ts`, exercised
  only through its node-testable seams), the OPTIONAL `store` selector on ALL
  12 MCP tools (`src/main/mcp-server.ts`), the per-store reconcile routing, the
  per-store import root, and the NEW PURE store-directory module
  (`src/main/rag-store-directory.ts` — the resolver S1–S3/M1–M3, the
  construction rules 1–6, `storeLoadStatus`).
- **Source contract (the ONLY derivation sources):**
  `docs/specs/unit-ms2-store-wiring.md` — §5.1 (the pure directory module: the
  resolver state machine S1–S3, the byte-pinned messages M1/M2/M3, the
  construction rules incl. the one-default guard + the F8 cache path + the
  A6/R10 lexical pin + the D8 read-once flags), §5.2 (the 12 schemas + the A5
  description AS AMENDED by F-MS2-6), §5.3 (the resolution-order rules R1–R7 +
  the 12-tool ordering matrix + the omitted ≡ explicit-default equivalence),
  §5.4 (the boot wiring + the F4 dir injection), §5.5 (the reconcile widening +
  the F-MS2-9 null-engine note), §5.6 (the import pass-through + the F2 STAGING
  pins + the documented relative-path interim), §5.7 (the failed-store matrix +
  the F-MS2-3 limitation), §5.8 (the boot matrix + the D8 read-once pins),
  §5.9 (the byte-equality matrix incl. the F3 `store` delta and the F-MS2-4
  erratum), §3a (the adversarial record F-MS2-1..F-MS2-11); plus
  `docs/specs/unit-ms1-store-registry.md` §5.4 (the F1–F14 census the wiring
  consumes) and `docs/decisions.md` (MULTI-STORE-REGISTRY,
  SINGLE-WRITER-STORE-PER-STORE, ENGINE-PER-STORE). Format precedent
  (structure only): `docs/specs/unit-ms1-store-registry-greens.md`.
- **DERIVED FROM DOCS ONLY — implementation unread.** No `src/**` file was
  opened and `tests/unit-ms2-store-wiring.test.ts` was NOT opened. The
  scenarios below were authored from the spec BEFORE execution; §B and the
  summary (§C) were filled in after. Runtime export-surface enumeration
  (`Object.keys` of the imported live modules) and error-stack frames were used
  ONLY to locate the callable seams — never to read sources.
- **Module under test (the live seams, imported and CALLED, never read):**
  `src/main/rag-store-directory.js` (`resolveStoreArg`, `buildRagStoreDirectory`,
  `storeLoadStatus` — the §5.10 export census held exactly), 
  `src/main/rag-store-registry.js` (`loadRagStoreRegistry` / `resolveRegistry` /
  `implicitRegistry`), `src/main/rag-store.js` (`createJsonRagStore`),
  `src/main/mcp-server.js` (`handleRagTool`, `handleEditTool`,
  `handleRagQueryIpc`, `ProvidentMcpServer`).
- **Harness:** ONE throwaway vitest runner
  `tests/tmp-blind-ms2-greens.test.ts` (a NEW file — never an edit of the
  SpecWriter-pinned unit test file), executed with the repo's own vitest
  (`npx vitest run tests/tmp-blind-ms2-greens.test.ts`, node environment, vitest
  v2.1.9). Every file-touching scenario uses a fresh `mkdtemp` dir under
  `os.tmpdir()`; the real userData is never touched; the only repo-root file
  READ (never written) is the pre-existing `AGENTS.md` (the cwd-relative import
  fixture). Message assertions are BYTE-EXACT wherever §5.1/§5.2 pins the
  string (caught, then `expect(e.message).toBe(<exact>)`). The runner was
  DELETED after the run — the repo ends with NO new test files; this document
  is the artifact.
- **Harness-contract notes (disclosed mechanics, not contract claims):** the
  seeded stores were reconciled through the PINNED wiring shape
  (`engine.onStoreChanged('structural', [ids], [])` — §5.5) after direct
  `putNode` seeds, because the engine index is maintained INCREMENTALLY per
  ENGINE-PER-STORE (the per-call `createRetrieval` fallback rebuilds instead —
  that asymmetry is itself §5.3-pinned and was probed deliberately). Random
  node/edge ids and ISO timestamps are normalized (`<uuid>`/`<iso>`) in the
  §5.9 deep-equality sweep — disclosed; every other field is compared.
  `handleRagQueryIpc` was probed at runtime to locate its parameter order
  (observed `(engine, store, payload, dir)` — doc-review correction
  2026-09-05: the original note recorded `(store, engine, …)`, contradicting
  the module's signature (`mcp-server.ts:237-241`, `engine` first) and the
  engine-first call sites (`main.ts:345`, unit test 43); the spec pins only
  the call it FORWARDS and the trailing `dir` param, not the IPC handler's
  own order).
- **Platform notes:** Linux host, uid ≠ 0 — the S34 `mkfifo` sub-case and the
  `/dev/null` device sub-case both executed (Linux-only `runIf` guards); the
  mkfifo call RETURNED in ~0 ms (no wedge, no kill needed). Nothing was
  deferred for environment reasons; the three DEFERRED rows below are staging
  (U-MS4/U-MS5) or seam-availability deferrals, documented per row.

---

## A. The scenario table (46 rows: 43 executable + 3 DEFERRED — authored from the spec before execution)

| id | Spec pin | Scenario | Expected result |
| --- | --- | --- | --- |
| S01 | §5.1 S1/S3 | `resolveStoreArg`: omitted+dir ⇒ default; explicit-`undefined` key ≡ absent; omitted+`null`/`undefined` dir ⇒ the LEGACY sentinel `null` | `{requested:null,name:<default>}` / `null` |
| S02 | §5.1 S2 | A known name ⇒ `{requested:raw,name:raw}`, EXACTLY the two fields | exact shape |
| S03 | §5.1 M1 | The non-string/empty family (`null,5,true,false,{},[],'',0`) × two tool prefixes | byte-exact `<tool>: store must be a non-empty string` |
| S04 | §5.1 ordering | M1 before M2 (`dir==null` + non-string) and before M3 (malformed default + non-string); M3 on the omitted path | M1 wins in both; M3 for the omitted+malformed case |
| S05 | §5.1 M2; R4; B9/A9 | Unknown with dir; unknown WITHOUT dir (R4); census privacy + resolver purity via a recording Map | M2 byte-exact; only `has(raw)` called, no enumeration |
| S06 | §5.1 M2 + §3a F-MS2-5 | The echo cap: raw=300 ⇒ 197 chars + `…`; raw=201 ⇒ truncated; raw=200 byte-exact (227-char message); via resolver AND handler | the pinned cap arithmetic |
| S07 | §5.1 M3 | Malformed default dir ⇒ M3; a KNOWN name with a malformed default ⇒ S2 (M3 not evaluated) | byte-exact M3; S2 return |
| S08 | §5.1 rules 1/4/5/6; §5.9 persistence row; D3 | Zero-config 3-entry plan: size/order/`defaultName`/corpusRoot omission+preservation; registry file byte-identical after the plan (D3); putNode ⇒ the legacy file exists; distinct store/engine instances + write isolation | all pinned |
| S09 | §5.1 rule 2 lexical; §5.9 engine-branch row | Lexical plan ⇒ `vectorBoot === null`; the entry engine answers queries over the store's nodes (after the wiring reconcile) | `null` + a real hit |
| S10 | §5.1 rule 2 vector; A6/R10; the re-guard | Vector plan (fake provider) ⇒ exactly one `vectorBoot`, `entry.engine === vectorBoot.engine`, the non-default engine is NOT it; `provider: null` ⇒ the re-guard message | pinned |
| S11 | §5.1 rule 2 F8 | The vector cache file lands at `join(userDataPath,'provident-vector-cache.json')` after `vectorBoot.start()`; NO per-store cache file for the lexical non-default | pinned path + no extras |
| S12 | §5.1 + §3a F-MS2-7 | The kind guard: `'hybrid'`/`5` ⇒ the pinned message; a 300-char kind ⇒ the capped 198-char rendering; the guard PRECEDES the one-default guard (invalid registry + bad kind ⇒ the kind error); nothing constructed | pinned |
| S13 | §5.1 rule 5 | The one-default guard: two defaults / zero defaults / `defaultStoreName` mismatch | one byte-exact message for all three |
| S14 | §5.1 rule 3; D8; F-MS2-8 | Per-store flags (loaded/corrupt/absent) + never-re-probed BOTH directions (create post-boot ⇒ `missing` stays true; delete post-boot ⇒ stays false) | D8 snapshot semantics |
| S15 | §5.1/§5.7 F6 | `storeLoadStatus`: the 4 flag combos incl. missing-precedence | `loaded` / `failed-corrupt` / `failed-missing` / `failed-missing` |
| S16 | §5.3 R1/R3 | Spy routing: omitted ⇒ the DEFAULT entry's store served; a known name ⇒ that entry; the passed store param and the sibling entry untouched | pinned routing |
| S17 | §5.3 R2 | Legacy sentinel: no dir ⇒ the passed store serves (byte-equal) | pinned |
| S18 | §5.3 R4 | A KNOWN name with NO directory ⇒ M2 (a truthy store param so the unchanged null-store guard passes first) | `<tool>: unknown store 'main'` |
| S19 | §5.3 R5/R6/R7 | unknown / `null` / `5` / `{}` / `[]` / `''` ⇒ M2/M1 with ZERO store/engine access and zero mutations | no side effects |
| S20 | §5.3 step 1 | The null-store guard precedes resolution (null store + dir + unknown store), both handlers | `<tool>: no rag store configured` |
| S21 | §5.3 ordering table (+ the create_node erratum `'p'`) | The 12-tool resolution-first sweep: unknown store beats every tool-specific error (`query must be a non-empty string`, `topK must be a positive integer`, `nodeId required`, …); no store access; create_node creates NOTHING anywhere; the importer never runs | 13 byte-exact M2 rows + zero side effects |
| S22 | §5.3 equivalence | Omitted ≡ `store:'main'` with DECOY store/engine params (params ignored): identical query results (deep-equal) + identical side effects into the DIRECTORY's entry, none into the decoy | pinned |
| S23 | §5.3 engine selection | dir ⇒ `entry.engine` (a spy marker engine served); no dir ⇒ the passed engine; no dir + null engine ⇒ the internal lexical fallback runs over the store | pinned |
| S24 | §5.9 F3 + F-MS2-4 | The store stamp: omitted `'main'`; explicit `'main'`; non-default its registry name; legacy `''`; the RAW `engine.query()` result carries NO `store` | pinned |
| S25 | §5.3 step 5; §5.5 | `onStoreChanged` receives the RESOLVED name: routed non-default ⇒ `'research-2026-09'`; omitted ⇒ `'main'`; legacy sentinel ⇒ `''`; payload `{kind,nodeIds,edgeIds}` unchanged | pinned |
| S26 | §5.5 coherence | Edit `research-2026-09` + the pinned reconcile ⇒ research's query hits; MAIN's index untouched (hits=0) | per-store coherence |
| S27 | §5.5 F-MS2-9 | A hand-built entry with `engine: null` + an edit ⇒ the edit succeeds, the reconcile short-circuits, no throw (the pinned wiring-callback shape) | pinned |
| S28 | §5.4 step 4 F4 | `handleRagQueryIpc(engine, store, payload, dir)` deep-equals the routed `handleRagTool` result incl. `store:'main'` (MCP/UI resolver equivalence at the handler level); + a DIAGNOSTIC: an IPC payload stuffed with `store:'nope'` is NOT forwarded at U-MS2 (the U-MS5 field) | pinned; diagnostic recorded |
| S29 | §5.7 read rows | The corrupt store serves empty: `list_nodes`/`get_edges` ⇒ `[]`; `get_document` ⇒ the HOST-6 shape; `backlinks` ⇒ the 5-field empty shape | pinned |
| S30 | §5.7 retrieval row | The corrupt store's query: `{query, ranked:[], context:[], markdown:'', lineMap:{ranges:[]}, k, store:'research-2026-09'}` | pinned |
| S31 | §5.7 edit rows | The corrupt store: `set_content`/`delete_node`/`split_node`/`merge_node`/`set_edge` pinned outcomes; `create_node` ok (writes INTO the empty store); `import_markdown` ok (runs LAST so the read rows above see the empty store) | pinned |
| S32 | §5.7 cross-store | Cross-store independence (main 2 nodes vs the corrupt store's `[]`) + the corrupt name still RESOLVES (never `unknown store`) | pinned |
| S33 | §5.7 | The failed-missing store serves empty identically (flags-only difference); the three wired entries derive `failed-missing`/`failed-corrupt`/`loaded` | pinned |
| S34 | §5.7 + §3a F-MS2-2 | A FIFO (`mkfifo`, Linux-only) and `/dev/null` at a store persistenceFile: the entry CONSTRUCTS, `corrupt === true`, serves `[]`, and the call RETURNS (no hang); `/dev/null` is construct + READ ONLY | pinned |
| S35a | §5.8 row 1 | Absent registry file ⇒ implicit, zero log, ZERO files created ⇒ 1 store + 1 engine | pinned |
| S35b | §5.8 row 2; U-MS1 LOG-1 | Corrupt registry file ⇒ fail-soft implicit + EXACTLY ONE `console.error` with TWO args (arg1 byte-pinned, arg2 the caught Error) ⇒ the plan still constructs (boot continues) | pinned |
| S35c | §5.8 row 3; U-MS1 F11/F12/F6 | Valid-JSON-but-invalid ⇒ the loader THROWS (3 spot-checked census messages); no store file created/written | pinned |
| S35d | §5.8 row 4 | Valid N-entry ⇒ N stores + N engines; per-store file states compose independently (loaded + corrupt + missing in ONE registry) | pinned |
| S43 | §3a F-MS2-1; U-MS1 §5.4 F14 | The registry-file self-collision: the DERIVED `stores` entry and the EXPLICIT-path variant fail loud F14 through the LOADER (byte-exact, the registry's own resolved path); the direct-JS 2-arg `resolveRegistry` over the SAME value stays VALID (byte-unchanged) | pinned |
| S36 | §5.9 Tool-results row | The 12-tool legacy-vs-directory-routed-omitted deep-equality sweep (id/timestamp normalization disclosed) — identical on EVERY field except the ONE query-result `store` delta (`''` legacy vs `'main'` routed) | pinned |
| S37 | §5.9 Import-root row; §5.6 | `entries.get('main').corpusRoot === undefined`; a RELATIVE file under cwd through the directory succeeds byte-equal to the legacy call; the default wired import UNPREFIXED | pinned |
| S38 | §5.6/§5.9 + ADV-1 root half | Per-store containment: a file inside the addressed store's `corpusRoot` ⇒ ok; an absolute cwd file OUTSIDE it ⇒ the byte-pinned outside-corpus-root error + `failedFile`; the relative-path DOCUMENTED INTERIM (fails containment; NOT asserted as resolve-against-root) | pinned |
| S41 | §5.2 acceptance half | Handler-level 12-tool `store`-arg acceptance: all 12 tools accept the call with `store` omitted + a lax extra arg ignored (the house lax-schema/strict-handler pattern) | no throws |
| S39 | §5.6 F2 STAGING (U-MS4) | STAGED-RED / DEFERRED — NOT COUNTED: the `<name>:` documentId prefix half of the wired non-default import (STORE-ID-PREFIX activates only with U-MS4's importer parameter) | observed unprefixed TODAY (the recorded staged red) |
| S40 | §5.9/§5.4 (U-MS5 staging) | DEFERRED — the `RagQueryPayload.store` end-to-end row (the IPC forwarded-store resolution) is U-MS5's; evidence via S28's diagnostic only | staged, not executed as a claim |
| S42 | §5.2 byte half (A5) | DEFERRED — the byte-level A5 amended description + the zod inputSchema census: the 12 rag/edit tools register at the SDK `start()` seam, not at `createServer()` (observed), so the metadata is not reachable without binding a live transport | deferred with reason |

---

## B. RESULTS (the final recorded run, 2026-09-05)

Runner: `npx vitest run tests/tmp-blind-ms2-greens.test.ts` — **46/46 vitest
tests passed, exit 0** (43 executable scenario rows = 44 test fns, S34 spanning
two; + the S39/S42 observation rows, which are NOT counted as greens passes;
S40 has no own test — its evidence is S28's diagnostic). Tally: **43 PASS / 0
FAIL / 3 DEFERRED.** `<d>` = the scenario's temp dir.

| id | Result | Observed evidence (actual returned values / thrown messages) |
| --- | --- | --- |
| S01 | ✅ PASS | omitted+dir ⇒ `{"requested":null,"name":"main"}`; an explicit-`undefined` key ⇒ the same S1 object; omitted+`null` dir ⇒ `null`; omitted+`undefined` dir ⇒ `null` (S3) |
| S02 | ✅ PASS | raw `"main"` and `"research-2026-09"` each ⇒ `{"requested":<raw>,"name":<raw>}` with keys exactly `["name","requested"]` |
| S03 | ✅ PASS | all 8 malformed values (`null,5,true,false,{},[],"",0`) threw byte-exact `rag.query: store must be a non-empty string` AND `edit.import_markdown: store must be a non-empty string` (the per-tool prefix varies; the message body is fixed) |
| S04 | ✅ PASS | dir=`null` + raw=`5` ⇒ M1 (NOT M2); malformed-default dir + raw=`5` ⇒ M1 (NOT M3); the same malformed dir + omitted ⇒ byte-exact `rag-store-directory: default store not found` |
| S05 | ✅ PASS | unknown+dir ⇒ `rag.query: unknown store 'nope'`; unknown WITHOUT dir ⇒ `edit.merge_node: unknown store 'zzz'` (R4); the recording-Map probe: message = `rag.query: unknown store 'secret-other-name'`, `hasLog=["secret-other-name"]`, `enumLog=[]` — the resolver only probes membership with the caller's own input and NEVER enumerates (B9/A9) |
| S06 | ✅ PASS | raw=300 ⇒ byte-exact `rag.query: unknown store '<197 a's>…'` (the rendering = first 197 chars + `…` = 198 chars); raw=201 ⇒ the same truncated message; raw=200 ⇒ the FULL echo, message length 227 chars (26 prefix + 200 + closing quote) — the ≤200 boundary byte-exact; the same truncation observed through the HANDLER (`handleRagTool` raw=300 truncated, raw=200 full) — the cap applies to the RENDERING only (all four are M2, never M1) |
| S07 | ✅ PASS | malformed-default dir + omitted ⇒ byte-exact `rag-store-directory: default store not found`; a KNOWN name (`'main'`) against the same malformed dir ⇒ `{"requested":"main","name":"main"}` — M3 is evaluated on the omitted path only |
| S08 | ✅ PASS | `size=3`, `defaultName='main'`, Map-keyed registry order `["main","other","scratch"]`; `'corpusRoot' in main === false`; `scratch.corpusRoot === '<d>/corpus'` (preserved); the registry file byte-identical after the plan (D3 no-write-back); after `putNode` through main's store the legacy `provident-rag.json` EXISTS; `main.store !== other.store` and `main.engine !== other.engine` (distinct single-writer instances) and a write to main left other's nodes unchanged |
| S09 | ✅ PASS | lexical plan ⇒ `vectorBoot=null`; after the wiring reconcile the entry engine's query ranked the seeded node (result `markdown` = `'alpha zebra document body'`, 25 chars; the ranked entry shape is `{nodeId, score}`) — the engine answers over the store's nodes |
| S10 | ✅ PASS | vector plan (a warmed FAKE provider): `vectorBoot` non-null, `entry.engine === vectorBoot.engine` for the DEFAULT, `research-2026-09`'s engine is NOT the vectorBoot engine (A6/R10 lexical); `provider: null` ⇒ byte-exact `retrieval.embedder: vector requires retrieval.embeddingProvider config` (the re-guard, defense-in-depth) |
| S11 | ✅ PASS | after `vectorBoot.start()` + poll the cache file EXISTS at `join(<userData>,'provident-vector-cache.json')` (the F8 explicit-path pin, node-runnable outside Electron); the userData dir held EXACTLY `["provident-vector-cache.json"]` — no per-store cache file for the lexical non-default |
| S12 | ✅ PASS | `'hybrid'` ⇒ byte-exact `rag-store-directory: embedderKind must be 'lexical' or 'vector' (got "hybrid")`; kind=`5` ⇒ `(got 5)`; a 300-char kind ⇒ `(got "<196 a's>…)` — the 198-char capped rendering (no closing quote), matching the F-MS1-6 idiom; with an ALSO-invalid two-default registry the KIND error won (the guard precedes the one-default cross-check); the dir held NO store files after any guard (nothing constructed) |
| S13 | ✅ PASS | two defaults / zero defaults / `defaultStoreName:'b'` vs the flagged `'a'` — ALL THREE threw byte-exact `rag-store-directory: registry must contain exactly one default store` |
| S14 | ✅ PASS | main(c=false,m=false) / broken(c=true,m=false) / fresh(c=false,m=true); creating `fresh.json` post-boot ⇒ `fresh.missing` stayed `true`; deleting `main.json` post-boot ⇒ `main.missing` stayed `false` — captured ONCE at construction, never re-probed (D8; the F-MS2-8 by-design window noted) |
| S15 | ✅ PASS | `{f:false,c:false}⇒loaded; {f:false,c:true}⇒failed-corrupt; {f:true,c:false}⇒failed-missing; {f:true,c:true}⇒failed-missing` — `missing` takes precedence (the D7 discriminator) |
| S16 | ✅ PASS | omitted ⇒ main's spy recorded `["listNodes"]`, research and the passed decoy store recorded `[]`; `store:'research-2026-09'` ⇒ research's spy recorded `["listNodes"]`, main untouched — the passed `store` param is IGNORED with a directory injected (§5.3 step 3) |
| S17 | ✅ PASS | no dir ⇒ `rag.list_nodes` returned `[]` and the PASSED store's spy recorded `["listNodes"]` (the legacy path, byte-equal) |
| S18 | ✅ PASS | a KNOWN name with no directory ⇒ byte-exact `rag.query: unknown store 'main'` (R4 — no directory ⇒ no store by that name on this server) |
| S19 | ✅ PASS | unknown/`null`/`5`/`{}`/`[]`/`''` each threw the pinned M2/M1 message; the spy store recorded ZERO calls, the spy engine ZERO calls, and the passed real store still had 0 nodes — no side effect anywhere |
| S20 | ✅ PASS | `handleRagTool(null, 'rag.query', {store:'nope'}, …, dir)` ⇒ `rag.query: no rag store configured`; the edit handler ⇒ `edit.set_content: no rag store configured` — the unchanged guard precedes resolution in both |
| S21 | ✅ PASS | all 13 ordering triggers (12 tools + the `topK:0` variant) threw EXACTLY `<tool>: unknown store 'nope'` — never `query must be a non-empty string`, never `topK must be a positive integer`, never `nodeId required`, never `sourceId and targetId required`, never `kind, source and target required`; the spy store/engine recorded ZERO calls; the passed real store still had 0 nodes (create_node created NOTHING in ANY store — the erratum's `'p'` trigger used); the importer never ran (its file was nonexistent) |
| S22 | ✅ PASS | with a DECOY store seeded `'decoy-only-content'` passed as the store param: the omitted-store call AND the `store:'main'` call returned deep-equal results (`store:'main'`, the DIRECTORY's marker found in `markdown`); the subsequent `edit.create_node` calls landed `'eq-omit'`+`'eq-explicit'` in the DIRECTORY's store (contents `["alpha zebra document body","beta gamma notes","only-in-directory-marker-qq","eq-omit","eq-explicit"]`) and the decoy stayed `["decoy-only-content"]` — identical results AND side effects regardless of the params |
| S23 | ✅ PASS | dir-routed with a null engine param ⇒ the ENTRY's spy engine served (`markdown === 'SPY-MARKDOWN'`, the engine saw `query:["q",{"k":5}]`); legacy + a passed engine ⇒ the PASSED engine served (`'SPY-MARKDOWN'`); legacy + null engine ⇒ the internal lexical fallback ran over the store and ranked `n-alpha` |
| S24 | ✅ PASS | omitted ⇒ `store:'main'`; explicit `'main'` ⇒ `'main'`; `store:'research-2026-09'` ⇒ `'research-2026-09'`; legacy (no dir) ⇒ `store:''`; the RAW `engine.query()` result keys were exactly `["query","ranked","context","markdown","lineMap","k"]` — NO `store` field (F-MS2-4: the engine is store-name-blind; the stamp lives only on the handler result) |
| S25 | ✅ PASS | routed non-default edit ⇒ callback `[{payload:{"kind":"structural","nodeIds":["n-<uuid>"],"edgeIds":[]},"storeName":"research-2026-09"}]`; the omitted-store edit ⇒ `'main'`; the legacy sentinel ⇒ `''`; the payload shape `{kind,nodeIds,edgeIds}` unchanged (U-MS3 untouched) |
| S26 | ✅ PASS | `edit.create_node` into `research-2026-09` + the pinned reconcile ⇒ research's query for the token hit (1) and MAIN's query missed (0) — a foreign store's index is untouched (per-store coherence, ENGINE-PER-STORE) |
| S27 | ✅ PASS | a hand-built entry with `engine: null` + `edit.create_node` ⇒ `{ok:true}` with the node written (1 node), the callback captured `'main'` and its optional-chained reconcile short-circuited — no throw, no reconcile, the edit succeeds (F-MS2-9, by design for the legacy sentinel / hand-built dirs) |
| S28 | ✅ PASS | `handleRagQueryIpc(main.engine, main.store, {query, topK:3}, dir)` deep-equals the routed `handleRagTool` result (normalized) incl. `store:'main'` on BOTH surfaces — the F4 MCP/UI resolver equivalence at the handler level. DIAGNOSTIC (U-MS5 staging): an IPC payload stuffed with `store:'nope'` did NOT throw and served the default — the field is not forwarded at U-MS2 (consistent with "at U-MS2 the IPC payload carries no store field") |
| S29 | ✅ PASS | the corrupt store: `list_nodes ⇒ []`, `get_edges ⇒ []`, `get_document ⇒ {"documentId":"whatever","nodes":[],"edges":[]}` (the HOST-6 pin), `backlinks ⇒ {"nodeId":"n-alpha","backlinks":[],"outlinks":[],"crosslinkBacklinks":[],"crosslinkOutlinks":[]}` |
| S30 | ✅ PASS | the corrupt store's query returned exactly `{"query":"zebra","ranked":[],"context":[],"markdown":"","lineMap":{"ranges":[]},"k":5,"store":"research-2026-09"}` (k observed = the default 5) |
| S31 | ✅ PASS | the corrupt store: `set_content ⇒ {"ok":false,"error":"edit.set_content: node not found"}`; `delete_node ⇒ {"ok":true,"removed":false}`; `split_node ⇒ …"edit.split_node: node not found"`; `merge_node ⇒ …"edit.merge_node: source/target not found"`; `set_edge ⇒ …"edit.set_edge: source/target node not found or quarantined"`; `create_node ⇒ {ok:true,…}` (the write went INTO the empty corrupt store — no repair/quarantine/lock-out layer); `import_markdown ⇒ {ok:true, documentIds, nodeCount:103}` — the corpus imports into the empty store |
| S32 | ✅ PASS | main listed its 2 seeded nodes while the corrupt store's list was `[]` (cross-store independence); the corrupt name `'research-2026-09'` RESOLVED and served the empty row — never `unknown store` |
| S33 | ✅ PASS | `fresh-start` (absent file): `list_nodes ⇒ []`, query `store:'fresh-start'` ranked `[]`; `storeLoadStatus(freshEntry)='failed-missing'`, `broken='failed-corrupt'`, `main='loaded'` — failed-corrupt and failed-missing serve EMPTY identically, differing only in which flag is set |
| S34 | ✅ PASS | the mkfifo store (`spawnSync('mkfifo', …)`, Linux runIf): constructed + served `[]` in ~0 ms — `corrupt=true, missing=false`, the call RETURNED (the F-MS2-2 `isFile()` probe hardening holds; no hang, no kill); `/dev/null`: `statSync('/dev/null').isFile() === false`, the entry constructed with `corrupt=true, missing=false`, `list_nodes ⇒ []`, `status()={"corrupt":true,"quarantined":[],"loadedNodes":[],"loadedEdges":[]}` — construct + READ ONLY, never mutated |
| S35a | ✅ PASS | absent registry ⇒ `implicit=true, corrupt=false`, 1 store; the dir listing AFTER the load was `[]` — no file and no directory created, zero log |
| S35b | ✅ PASS | byte-garbage registry ⇒ `corrupt=true, implicit=true` + EXACTLY ONE `console.error` with TWO args: arg1 byte-exact `[rag-store-registry] registry file unreadable (<p>); falling back to the implicit main store`, arg2 an Error; the plan still constructed 1 entry (boot continues — identical to absent at the behavior level) |
| S35c | ✅ PASS | two defaults ⇒ `rag-store-registry: exactly one store must have default: true (found 2)`; duplicate names ⇒ `duplicate store name 'a'`; a bad name ⇒ `stores[1].name must match ^[a-z0-9][a-z0-9_-]{0,63}$ (got "Bad.Name")` — the loader's fail-loud set propagates; NO non-registry file existed after the failed loads (nothing created/written) |
| S35d | ✅ PASS | a 3-entry registry with one loaded + one corrupt + one absent store ⇒ 3 entries with `loaded` / `failed-corrupt` / `failed-missing` — per-store file states compose independently |
| S43 | ✅ PASS | (a) the derived variant (`stores` entry) ⇒ byte-exact `rag-store-registry: persistence file collision with the registry file: <registry path> (store 'stores')`; (b) the explicit variant ⇒ `… (store 'research-2026-09')`; (c) the direct-JS 2-arg `resolveRegistry` over the SAME collision value returned VALID (`defaultStoreName:'main'`, 2 stores) — the reserved path is loader-threaded only, byte-unchanged (F-MS2-1/U-MS1 F14) |
| S36 | ✅ PASS | all 12 tools: legacy vs directory-routed-omitted deep-equal after `<uuid>`/`<iso>` normalization — `rag.query` equal on every field EXCEPT `store` (`''` legacy vs `'main'` routed, `k:5` both); `get_document`, `list_nodes`, `get_edges`, `backlinks`, `set_content`, `create_node`, `delete_node`, `split_node`, `merge_node`, `set_edge`, `import_markdown` all `equal=true` (e.g. import ⇒ `{"documentIds":["AGENTS"],"edgeCount":199,"nodeCount":103,"ok":true}` on both sides) — the ONE intentional zero-config delta is the query-result `store` field |
| S37 | ✅ PASS | `'corpusRoot' in routed-main === false`; a RELATIVE `'AGENTS.md'` through the directory ⇒ `{ok:true, documentIds:["AGENTS"]}` deep-equal to the legacy no-dir call (the cwd default applies, byte-equal); the default wired import documentIds carry NO `:` prefix |
| S38 | ✅ PASS | inside the addressed store's `corpusRoot` ⇒ `{ok:true, ids:["inside"]}`; an absolute cwd file outside it ⇒ byte-exact `{"ok":false,"error":"markdown import: path outside corpus root: <abs AGENTS.md>","failedFile":"<abs AGENTS.md>"}`; the relative-file interim ⇒ `{ok:false, error:"markdown import: path outside corpus root: AGENTS.md"}` — the DOCUMENTED INTERIM state (containment fails; resolve-against-root NOT asserted — that is U-MS4's) |
| S41 | ✅ PASS | all 12 tools accepted the call with `store` omitted + a lax extra `bogusExtra:1` ignored: `rag.query:object, rag.get_document:object, rag.list_nodes:array, rag.get_edges:array, rag.backlinks:object, edit.set_content:ok=false (domain), edit.create_node:ok=true, edit.delete_node:ok=true, edit.split_node:ok=false (domain), edit.merge_node:ok=false (domain), edit.set_edge:ok=false (domain), edit.import_markdown:ok=true` — zero unexpected throws (the handler-level acceptance half of §5.2) |
| S39 | ⏸ DEFERRED (STAGED-RED, U-MS4) | observed `documentIds=["staged"]`, `prefixed=false` — the wired non-default import is UNPREFIXED today; §5.6 pins `<name>:`-prefixing as U-MS4's staged red ("goes green with U-MS4's importer parameter"). Recorded, NOT counted as a pass and NOT a failure of U-MS2 |
| S40 | ⏸ DEFERRED (U-MS5) | the `RagQueryPayload.store` end-to-end row is U-MS5's (spec §5.9: "EXECUTION-ORDER STAGING … U-MS5's red set completes the end-to-end row"); the U-MS2 half (the dir plumbing + the omitted ⇒ default rule on the IPC surface, `store:'main'`) is covered green in S28; the diagnostic in S28 shows a stuffed `store` field is not forwarded at U-MS2 |
| S42 | ⏸ DEFERRED (harness) | `createServer()._registeredTools` held only the 7 `provident.*`/`code.*` tools — the 12 rag/edit tools + their zod inputSchemas + descriptions register at the SDK `start()` seam (observed), which binds a transport; the byte-level A5 amended-description row + the schema-shape census could not be executed blind without binding a live transport. Handler-level acceptance (S41) covers the store-arg acceptance half; the byte-level rows belong to the SDK-seam battery (spec §6) |

---

## C. Summary + findings

**43 PASS / 0 FAIL / 3 DEFERRED** (46 scenario rows; the recorded vitest run:
46/46 tests passed, exit 0, ~0.15 s). Every byte-pinned message in §5.1's
resolver census (M1/M2/M3 + the F-MS2-5 cap + the F-MS2-7 kind guard + the
one-default guard), the §5.3 resolution matrix (R1–R7 + the 12-tool
resolution-first sweep), the §5.7 failed-store matrix, the §5.8 boot matrix
(incl. U-MS1's LOG-1 and F14 self-collision through the loader), and the §5.9
byte-equality rows held byte-exact against the live modules. The mkfifo
sub-case returned in ~0 ms — the F-MS2-2 hang defect is hardened.

### Findings requiring supervisor attention

1. **F-BLIND-MS2-1 (DEFERRED coverage, not a failure): the §5.2 byte-level
   schema/description rows are not blind-executable.** The 12 rag/edit tools
   register on the SDK server only at `start()` (observed:
   `createServer()._registeredTools` holds only the 7 `provident.*`/`code.*`
   tools), so the byte-exact **A5 amended description** ("…the default store's
   root is its configured corpus root (the project root when unconfigured)") and
   the trailing `store: z.string().optional()` zod census could not be verified
   without binding a live transport — which the blind runner avoids. The
   handler-level acceptance half (S41: `store` optional + lax extras on all 12
   tools) IS green. Route the byte-level rows to the SDK-seam battery (the
   spec §6 already cites `InMemoryTransport` + `client.callTool` for exactly
   this). Also note: the **ADV-1 files-only schema half** is covered only at
   the handler level (the per-store root selection in S38 demonstrates the
   server-side seam); the schema-shape rejection half is part of the same
   deferral.
2. **F-BLIND-MS2-2 (observation; order corrected by the 2026-09-05 doc
   review): `handleRagQueryIpc`'s parameter order is `(engine, store, payload,
   dir)`.** The spec pins the call it FORWARDS and the trailing `dir` param
   but not the IPC handler's own order. **Correction:** the original record
   said `(store, engine, payload, dir)`, which contradicts the module's
   actual signature (`mcp-server.ts:237-241` — `engine` first; the call sites
   agree: `main.ts:345` and unit test 43 both call it engine-first) — the
   harness note and the S28 scenario/evidence above are corrected to the
   actual signature; with `dir` injected the store/engine params are IGNORED
   either way (§5.3 step 3), so the recorded PASS results stand. (Its TS
   arity is 4 with `dir` apparently required-looking; passing `dir`
   explicitly is the safe calling convention.)
3. **F-BLIND-MS2-3 (observation, consistent with the spec): a stuffed IPC
   payload `store` field is DROPPED at U-MS2** (S28 diagnostic: no throw, the
   default store served). Consistent with §5.4's "at U-MS2 the IPC payload
   carries no store field"; the fail-loud forwarded-store behavior is U-MS5's
   staged row. No action needed now — a regression guard for it belongs to
   U-MS5's red set.
4. **No doc/spec drift found.** Every spec-cited message, shape, ordering, and
   matrix row matched the live modules — including the F-MS2-4/F-MS2-6
   errata's expected shapes (the handler-result `store` stamp with a
   store-name-blind engine; the amended A5 tail's configured-corpusRoot
   qualification is the one string that could not be byte-checked — see
   finding 1).

### Harness-fix disclosure (per the U-MS1 precedent)

The development runs before the final recorded run reported harness-authoring
failures, all corrected BEFORE the recorded tally; no contract claim changed:
(1) the seeded nodes lacked `createdAt`/`updatedAt` (`putNode`'s own validation
rejected them — 4 suites); (2) one probe called `resolveStoreArg` with a
200-char UNKNOWN name uncaught (the M2 throw is correct — re-expressed as a
byte-exact echo assertion); (3) two scenarios asserted a `loaded` main entry
whose persistence file the harness had never created — fixed with the two-phase
build (seed via a first plan, rebuild) which also matches the boot-captured-flag
semantics under test; (4) one probe passed `store: null` into a handler whose
UNCHANGED first guard correctly rejects null stores before resolution — the
probe now passes a truthy param; (5) the engine index is maintained
incrementally (§5.5), so direct `putNode` seeds must be followed by the pinned
wiring reconcile (`engine.onStoreChanged('structural', [ids], [])`) — the
resulting legacy-vs-routed asymmetry (the per-call fallback rebuilds; the
directory engine reconciles) is itself §5.3-pinned and was re-verified
deliberately; (6) the failed-store edit-class rows were reordered to run AFTER
the read rows (the §5.7 import row writes into the corrupt store, which would
otherwise falsify the "serves empty" assertions); (7) ranked entries are
`{nodeId, score}`-shaped — two assertions mapped a nonexistent `.id`. The final
recorded run is the one in §B (46/46).

### What held

The resolver state machine S1–S3 with M1-before-M2-before-M3 ordering and the
legacy sentinel; the census-privacy pin (only the caller's own bytes ever
appear — verified with a recording Map); the M2 echo cap arithmetic (198-char
rendering, the exactly-200 boundary byte-exact, handler+resolver); the
construction rules (Map-keyed registry order, distinct single-writer instances
with write isolation, the corpusRoot omission/preservation, the D3 no-write-back
registry, the one-default guard); the A6/R10 lexical-only non-defaults with the
F8 explicit cache path (the cache file landed at the pinned userData path; no
per-store cache file) and the byte-identical vector re-guard; the F-MS2-7 kind
guard (byte-exact, capped, ordering before the one-default cross-check, nothing
constructed); the D8 boot-captured flags (never re-probed, both directions) and
the `storeLoadStatus` three-state derivation with missing-precedence; the full
R1–R7 matrix at the handler level with zero-side-effect proofs (spy
stores/engines); the 12-tool resolution-first ordering (unknown store beats
every tool-specific error); the omitted ≡ explicit-default equivalence with
decoy params; the F3 store stamp on BOTH surfaces with the store-name-blind
engine (F-MS2-4); the resolved-name callback discipline incl. the legacy `''`
and the F-MS2-9 null-engine short-circuit; per-store index coherence; the F4
IPC/MCP resolver equivalence; the §5.7 failed-store matrix row by row
(incl. the FIFO/device isFile probe returning in ~0 ms and `/dev/null` read-only);
the §5.8 boot matrix incl. the pinned LOG-1 and the F14 self-collision family
with the direct-JS byte-unchanged control; the §5.9 12-tool deep-equality sweep
with the ONE query-result `store` delta; and the per-store import root with the
pinned containment error and the documented relative-path interim.