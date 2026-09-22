# Unit MS5 — Read-only settings-pane store listing + the `RagQueryPayload.store` passthrough: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-05.
- **Unit:** U-MS5 — the read-only `provident:rag-store-listing` IPC channel
  (the four-part pattern: `IPC_RAG_STORE_LISTING` + the shared
  `handleRagStoreListingIpc` + the `ipcMain.handle` wiring + `bridge.rag.stores()`,
  only the node-testable seams exercised), the `RagStoreLoadStatus` /
  `RagStoreListingEntry` / `RagStoreListingPayload` types, the `RagQueryPayload.store?`
  optional field with the `handleRagQueryIpc` passthrough (F4 end-to-end completion),
  and the host `lastStoreListing` boot-cache / settings-pane section.
- **Source contract (the ONLY derivation sources):**
  `docs/specs/unit-ms5-settings-listing.md` — §5.1 (the three shared types + the
  `RagQueryPayload.store?` additive field), §5.2 (the shared handler's verbatim
  projection, the coercion rules, the EXACTLY-three pinned throws, the empty →
  `{ stores: [] }`, the status-supply `statusOf(e.name)` rule), §5.3 (the
  `bridge.rag.stores()` + the 3-arg `query` widening), §5.4 (the wiring: the
  `listingEntries` projection + the `basename`/`?? null` adapter + the F-MS5-2
  DEFENSIVE FOURTH throw), §5.5 (the settings pane + the `lastStoreListing` cache +
  the no-refetch), §5.6 (the F4 passthrough + the explicit-`undefined` ≡ absent
  semantics + `rag.query: unknown store '<name>'`), §5.7 (the BE-1..BE-8 rows + the
  RAG-QUERY-STORE-DISPLAY-ASYMMETRY), §5.8/§5.9 (the happy/fail red set), §3a
  (F-MS5-1..F-MS5-5); plus `docs/specs/unit-ms2-store-wiring.md` §5.4/§5.9 (the F4
  end-to-end row, COMPLETE via U-MS5; the result-side `store` stamp) and
  `docs/decisions.md` (STORE-LISTING-IPC, STORE-LISTING-PROVIDENT-AUTHORED,
  STORE-LISTING-BOOT-CACHED, STORE-LISTING-STATUS-SHARED,
  RAG-QUERY-STORE-DISPLAY-ASYMMETRY, UI-SELECTOR-DEFERRED).
  Format precedent (structure only): `docs/specs/unit-ms2-store-wiring-greens.md`.
- **DERIVED FROM DOCS ONLY — implementation unread.** No `src/**` file was opened;
  `tests/unit-ms5-settings-listing.test.ts` was NOT opened. The scenarios were
  authored from the spec BEFORE execution; §B and the summary (§C) were filled in
  after. Runtime export-surface enumeration (`Object.keys` of the imported live
  modules) was used ONLY to locate the callable seams — never to read sources.
- **Module under test (the live seams, imported and CALLED, never read):**
  `src/main/mcp-server.js` (`handleRagStoreListingIpc`, `handleRagQueryIpc`,
  `handleRagTool`), `src/main/rag-store-directory.js` (`storeLoadStatus`,
  `buildRagStoreDirectory`), `src/main/rag-store-registry.js`
  (`loadRagStoreRegistry`), `src/shared/types.js` (`IPC_RAG_STORE_LISTING`).
- **Harness:** ONE throwaway vitest runner `tests/tmp-blind-ms5-greens.test.ts` (a
  NEW file — never an edit of the SpecWriter-pinned unit test file), executed with
  the repo's own vitest (`npx vitest run tests/tmp-blind-ms5-greens.test.ts`, node
  environment, vitest v2.1.9). Every file-touching scenario uses a fresh `mkdtemp`
  dir under `os.tmpdir()`; the real userData is never touched. Message assertions
  are BYTE-EXACT wherever §5.2/§5.6 pins the string. The runner was DELETED after
  the run — the repo ends with NO new test files; this document is the artifact.
- **Relegated seams (per the spec — not node-exercisable, or the DOM-shim seam of
  the sibling test):** the preload `bridge.rag.stores()` + the 3-arg `query`
  widening (§5.3) are Electron-bound and NOT node-importable; the `main.ts`
  `ipcMain.handle` wiring (§5.4) and the settings-pane render section (§5.5) are
  RELEGATED (the render is the DOM-shim domain of `tests/unit-ms5-settings-listing.test.ts`,
  which this blind run does NOT read). The node-testable EQUIVALENT of the wired
  per-name resolver is driven through the RESOLVER/HANDLER seam (§3a F-MS5-2 — the
  pinned resolver expression wired as `handleRagStoreListingIpc`'s `statusOf` over a
  real `buildRagStoreDirectory` plan), exactly as the spec's own F-MS5-2 R-tests do.
- **Platform notes:** Linux host; nothing deferred for environment reasons. The
  relegations below are seam-availability (Electron preload/main, DOM-shim render)
  or cross-unit staging (BE-8 is U-MS3's row), documented per row.

---

## A. The scenario table (34 rows: 25 executable PASS + 5 DOCUMENTED-as-noted + 4 RELEGATED — authored from the spec before execution)

| id | Spec pin | Scenario | Expected result |
| --- | --- | --- | --- |
| A1 | §5.2; §5.7 BE-1 | Zero-config single-`main` listing, status `'loaded'`: handler over `[{main, default, provident-rag.json, null}]` + `statusOf⇒'loaded'` | `{stores:[{main,true,'provident-rag.json',null,'loaded'}]}`, entry keys exactly `{name,default,persistenceFile,corpusRoot,status}` |
| A2 | §5.2; §5.7 BE-1a | The SAME single entry but `statusOf⇒'failed-missing'` (true first run) | entry identical except `status:'failed-missing'` |
| A3 | §5.2; §5.7 BE-2 | Listing payload shape | exactly `{ stores: [...] }` (one key), `stores` is an array |
| A4 | §5.2 | Empty array input | `{ stores: [] }`, NO throw |
| A5 | §5.2 coercion | `default` coerces to `e.default === true` | `true→true`, `false→false`, `undefined→false` |
| A6 | §5.2 coercion | `persistenceFile` non-string → `''`; string verbatim | `'x.json'→'x.json'`, `5→''`, `undefined→''` |
| A7 | §5.2 coercion | `corpusRoot` string verbatim; `''`/`null`/`undefined` → `null` | `'/abs/root'`/`null`/`null`/`null` |
| A8 | §5.2; §5.8 happy 1 | Multi-store: input order verbatim, status per `statusOf(name)` | `['z','a']` order, `['failed-corrupt','loaded']` statuses, first entry byte-exact |
| A9 | §5.2 behavior 1 | Order preservation + NO dedupe (duplicate names both rendered) | 2 entries, `['a','b']` persistenceFiles |
| A10 | §5.2 behavior 2 | Purity: two same-input calls deep-equal + no files written | equal payloads; temp dir stays empty |
| A11 | §5.2; §5.9 fail 4 | Malformed entries (null entry, non-string/empty name) SKIPPED | `1` valid entry kept, no throw, no phantom |
| B1 | §5.2 behavior 3; §5.9 fail 1 | `handleRagStoreListingIpc(null, …)` | byte-exact `rag-store-listing: no rag store registry configured` |
| B2 | §5.2 behavior 3; §5.9 fail 2 | non-function `statusOf` | byte-exact `rag-store-listing: statusOf resolver required` |
| B3 | §5.2 behavior 3; §5.9 fail 3 | `statusOf` returns outside the union (`'ok'`, `42`, `undefined`) | byte-exact `rag-store-listing: unknown store status "<v>" for store "a"` |
| C1 | §3a F-MS5-2; §5.4 | The wiring's DEFENSIVE FOURTH throw: a name with NO matching directory entry, drive the pinned resolver through the handler seam | byte-exact `rag-store-listing: no directory entry for store "phantom"` |
| C2 | §3a F-MS5-2 | Coexistence: a PRESENT directory entry resolves (guard does NOT fire) through the seam | union status `st`; handler projects name `main` + status `st` |
| D1 | §5.6; U-MS2 §5.4 F4 | Forward `store:'research-2026-09'` over the dir plumbing resolves identically to the MCP path (`handleRagTool`) | IPC deep-equals `handleRagTool`; `result.store === 'research-2026-09'` |
| D2 | §5.6; U-MS2 §5.4 F4; A9 | An unknown FORWARDED store fails loud on the IPC path | byte-exact `rag.query: unknown store 'nope'` |
| D3 | §5.6 BE-4 | Omitted-store payload ≡ explicit-`undefined`; both ⇒ default store | results deep-equal, `store:'main'`, equal to `handleRagTool` with store omitted |
| D4 | §5.6; MCP-UI-EQUIVALENCE | The OPTIONAL store field is mechanically symmetric (identical args shape on both surfaces) | IPC `store:'research-2026-09'`; IPC deep-equals `handleRagTool` with the same args |
| E1 | §5.1; U-MS2 §5.7 F6 | `storeLoadStatus` returns exactly the union across real directory states (absent / malformed-present) | `'failed-missing'` (absent), `'failed-corrupt'` (malformed `'{}'`), both union members |
| E2 | §5.1 | All three union members pass through; status supply via `statusOf(name)` | `status` verbatim for each of `loaded/failed-corrupt/failed-missing` |
| F1 | §5.7 BE-6 | The listing channel writes NOTHING (no `provident-rag-stores.json` created) | repeated handler invocations leave NO `provident-rag-stores.json` |
| F2 | §5.1 | `IPC_RAG_STORE_LISTING` constant | `'provident:rag-store-listing'` |
| W1 | §5.4; §5.7 BE-1a; U-MS1 | Grounded zero-config wiring projection: absent registry → implicit `main` never written back; pinned `basename`/`?? null` projection; absent legacy file ⇒ `'failed-missing'` | `listingEntries`=`[{main,true,'provident-rag.json',null}]`; payload entry `status:'failed-missing'` |
| G1 | §3a F-MS5-3 | The boot listing fetch is AWAITED INLINE (rejection non-abort; NON-RESOLUTION is by-design) | DOCUMENTED — recorded as noted, not exercised (renderer/boot seam) |
| G2 | §3a F-MS5-4 | The operator-isolated + never-MCP-visible guarantees assume an UNCOMPROMISED renderer | DOCUMENTED — recorded as noted, not exercised |
| G3 | §3a F-MS5-5 / §5.9 fail 9 | Negative pins: channel absent from `RpcMethod`/`TOOL_GROUPS`/`ALL_TOOLS`/`MUTATING_METHODS`; no store-census (B9/A9) | DOCUMENTED — grep-level census held by the unit test's green guards; recorded as noted |
| G4 | §3a F-MS5-1 | The RCA-6 documentation-review gate lands BEFORE the unit's DONE row | DOCUMENTED — PROCESS; recorded as noted |
| G5 | §5.6 | `RAG-QUERY-STORE-DISPLAY-ASYMMETRY`: renderer `submitQuery` passes NO store; non-default results display-only | DOCUMENTED (renderer seam) — the node-testable MECHANICAL-SYMMETRY half is D1/D3/D4 |
| R1 | §5.3 | `bridge.rag.stores()` sends the channel + resolves the payload | RELEGATED — preload is Electron-bound, not node-importable |
| R2 | §5.3 BE-3 | 3-arg `query(q, topK?, store?)` payload widening (byte-equal, no `store` key for 2-arg) | RELEGATED — preload not node-importable; the omitted-store BE-4 semantics are covered node-side by D3 |
| R3 | §5.4 | `ipcMain.handle(IPC_RAG_STORE_LISTING, …)` registration | RELEGATED — main.ts not node-importable (the established discipline; the tested seam is the exported handler) |
| R4 | §5.5 | The settings-pane listing section render + the `lastStoreListing` cache + the boot fetch + the no-refetch | RELEGATED — the DOM-shim render seam of the sibling unit test (spec §6), not read here; the node-testable resolver/handler seam is A/C/E/W1 |

---

## B. RESULTS (the final recorded run, 2026-09-05)

Runner: `npx vitest run tests/tmp-blind-ms5-greens.test.ts` — **25/25 vitest
tests passed, exit 0** (each of the 25 executable scenario rows is one test fn).
Tally: **25 PASS / 0 FAIL / 9 DOCUMENTED-OR-RELEGATED (5 DOCUMENTED-as-noted,
4 RELEGATED).** `<d>` = the scenario's temp dir.

| id | Result | Observed evidence (actual returned values / thrown messages) |
| --- | --- | --- |
| A1 | ✅ PASS | `handleRagStoreListingIpc([{name:'main',default:true,persistenceFile:'provident-rag.json',corpusRoot:null}], ()=>'loaded')` ⇒ `{"stores":[{"name":"main","default":true,"persistenceFile":"provident-rag.json","corpusRoot":null,"status":"loaded"}]}`; entry keys sorted = `["corpusRoot","default","name","persistenceFile","status"]` exactly |
| A2 | ✅ PASS | the same input with `statusOf⇒'failed-missing'` ⇒ the entry `status:'failed-missing'`, every other field identical (name `main`, default `true`, `persistenceFile 'provident-rag.json'`, corpusRoot `null`) |
| A3 | ✅ PASS | result keys exactly `["stores"]`; `stores` is an Array (BE-2's `{ stores: [...] }` shape) |
| A4 | ✅ PASS | `handleRagStoreListingIpc([], ()=>'loaded')` ⇒ `{"stores":[]}` — no throw |
| A5 | ✅ PASS | a 3-name input `default:true|false|undefined` ⇒ `[true,false,false]` — `e.default === true` coercion |
| A6 | ✅ PASS | `persistenceFile` `'x.json'|5|undefined` ⇒ `['x.json','','']` — non-string coerced to `''` |
| A7 | ✅ PASS | `corpusRoot` `'/abs/root'|''|null|undefined` ⇒ `['/abs/root',null,null,null]` |
| A8 | ✅ PASS | input order `['z','a']` preserved in output; statuses `['failed-corrupt','loaded']` per `statusOf(name)`; first entry byte-exact `{name:'z',default:false,persistenceFile:'provident-rag-z.json',corpusRoot:'/r/z',status:'failed-corrupt'}` |
| A9 | ✅ PASS | two `name:'dup'` entries ⇒ 2 output entries in input order, persistenceFiles `['a','b']` — no sort, no dedupe |
| A10 | ✅ PASS | two same-input invocations deep-equal; a fresh temp dir stayed `[]` after a handler call (NO I/O) |
| A11 | ✅ PASS | inputs incl. a `null` entry, `name:5`, `name:''` ⇒ exactly ONE output entry (`name:'ok'`) — no throw, no phantom |
| B1 | ✅ PASS | `handleRagStoreListingIpc(null, fn)` throws byte-exact `rag-store-listing: no rag store registry configured` |
| B2 | ✅ PASS | non-function `statusOf` (undefined) throws byte-exact `rag-store-listing: statusOf resolver required` |
| B3 | ✅ PASS | `statusOf` returning `'ok'`, `42`, `undefined` — each throws byte-exact `rag-store-listing: unknown store status "<v>" for store "a"` (fail-loud, no silent coercion) |
| C1 | ✅ PASS | the pinned resolver (`const e = plan.directory.entries.get(name); if(!e) throw …`) over a real directory MISSING the store named in `listingEntries` ⇒ byte-exact `rag-store-listing: no directory entry for store "phantom"` — the F-MS5-2 defensive FOURTH throw (never a `Cannot read properties of undefined` TypeError) |
| C2 | ✅ PASS | a PRESENT entry (`'main'`) through the SAME resolver ⇒ a union string `st` (`'failed-missing'` with the absent legacy file); `handleRagStoreListingIpc(listingEntries, resolver)` projects `name:'main'`, `status:st` — the guard does not fire for present entries |
| D1 | ✅ PASS | `handleRagQueryIpc(engine, store, {query:'zebra',topK:3,store:'research-2026-09'}, dir)` deep-equals `handleRagTool(store,'rag.query',{query,topK,store},engine,dir)`; `ipc.store === 'research-2026-09'` — the forwarded store resolves IDENTICALLY to the MCP path (F4 end-to-end COMPLETE) |
| D2 | ✅ PASS | a forwarded `store:'nope'` on the IPC path ⇒ byte-exact `rag.query: unknown store 'nope'` (A9 fail-loud on BOTH surfaces) |
| D3 | ✅ PASS | a payload WITHOUT `store` and a payload with `store:undefined` ⇒ deep-equal results, both `store:'main'`; both deep-equal `handleRagTool(…, {query,topK}, …)` (the default resolution) — the explicit-`undefined` ≡ absent semantics (BE-4) |
| D4 | ✅ PASS | with `{query:'beta',topK:2,store:'research-2026-09'}` the IPC result `store:'research-2026-09'` and deep-equals `handleRagTool` with the same args — the OPTIONAL `store` field is mechanically symmetric (identical args shape on both surfaces) |
| E1 | ✅ PASS | real directory over the absent legacy file ⇒ `storeLoadStatus` = `'failed-missing'`; over a malformed present file (`'{}'`) ⇒ `'failed-corrupt'` — both are members of `{loaded,failed-corrupt,failed-missing}`; the `'loaded'` member is handler-pinned (A1/E2) |
| E2 | ✅ PASS | `statusOf` returning each of `loaded`/`failed-corrupt`/`failed-missing` ⇒ the payload entry `status` verbatim — the D7 union passes through unchanged |
| F1 | ✅ PASS | after 3 handler invocations over a fresh dir, `provident-rag-stores.json` was NOT created (BE-6 — the implicit entry stays synthesized, never written back) |
| F2 | ✅ PASS | `IPC_RAG_STORE_LISTING === 'provident:rag-store-listing'` (the pinned `IPC_<NAME>='provident:<kebab-name>'` convention) |
| W1 | ✅ PASS | absent registry ⇒ `rc.stores` = `[{name:'main',default:true,persistenceFile:'<d>/provident-rag.json'}]`, no `corpusRoot` key; the PINNED projection `listingEntries` ⇒ `[{name:'main',default:true,persistenceFile:'provident-rag.json',corpusRoot:null}]`; build over the absent legacy file + the wiring resolver ⇒ exactly `{stores:[{main,true,'provident-rag.json',null,'failed-missing'}]}` (BE-1a grounded) |
| G1 | Ⓝ NOTED | F-MS5-3 documented — the boot fetch is AWAITED INLINE; rejection non-abort covers REJECTION only, not NON-RESOLUTION (boot-await by design). No code change; recorded, not exercised (boot seam). |
| G2 | Ⓝ NOTED | F-MS5-4 documented — the operator-isolated + never-MCP-visible guarantees assume an UNCOMPROMISED renderer; these channels are NOT agent-reachable. No code change (the accepted model). |
| G3 | Ⓝ NOTED | F-MS5-5 / §5.9 fail 9 — the channel is absent from `RpcMethod`/`TOOL_GROUPS`/`ALL_TOOLS`/`MUTATING_METHODS` and NO store-census tool exists (B9/A9) — the grep-level census is pinned by the unit test's green guards (verified-clean per §3a); recorded as noted, not re-derived here. |
| G4 | Ⓝ NOTED | F-MS5-1 PROCESS — the RCA-6 documentation-review gate must land BEFORE the unit's DONE row; recorded. |
| G5 | Ⓝ NOTED | RAG-QUERY-STORE-DISPLAY-ASYMMETRY — the renderer `submitQuery` passes NO store and non-default results are display-only (§5.6); the node-testable MECHANICAL-SYMMETRY half is green (D1/D3/D4). |
| R1 | ⏸ RELEGATED | `bridge.rag.stores()` — preload is Electron-bound (`ipcRenderer.invoke`), NOT node-importable; not exercised here. |
| R2 | ⏸ RELEGATED | the 3-arg `query(q, topK?, store?)` payload widening — preload seam; the omitted-store byte-equal semantics are covered node-side by D3 (BE-4). |
| R3 | ⏸ RELEGATED | the `ipcMain.handle(IPC_RAG_STORE_LISTING, …)` registration — main.ts is NOT node-importable; the tested seam is the exported handler (the doc-heads precedent). |
| R4 | ⏸ RELEGATED | the settings-pane listing render + `lastStoreListing` cache + boot fetch + no-refetch — the DOM-shim render seam of `tests/unit-ms5-settings-listing.test.ts` (spec §6), which this blind run does NOT read. |

---

## C. Summary + findings

### Summary counts

**25 PASS / 0 FAIL / 9 DOCUMENTED-OR-RELEGATED** (5 DOCUMENTED-as-noted G1–G5, 4
RELEGATED R1–R4; 34 scenario rows total). The recorded vitest run: 25/25 tests,
exit 0, ~0.3 s. Every §5.2 pinned coercion rule, the EXACTLY-three handler throws,
the empty → `{ stores: [] }`, the skip-malformed discipline, the no-dedupe/no-sort
order-preserving verbatim projection, the purity/no-I/O, the BE-1/BE-1a/BE-2/BE-4/BE-6
rows, the F-MS5-2 defensive-throw byte-exact guard (+ the present-entry
coexistence), the F4 `RagQueryPayload.store?` end-to-end passthrough (forward +
unknown-store fail-loud + explicit-`undefined` ≡ absent + MCP/IPC mechanical
symmetry), and the `RagStoreLoadStatus` ↔ U-MS2 `storeLoadStatus` member-byte-exact
coordination all held against the live modules.

### Findings requiring supervisor attention

1. **F-BLIND-MS5-1 (relegation, not a failure): the preload, main.ts, and the
   settings-pane render are NOT node-exercisable in this blind run.** Per spec §5.3
   the preload `bridge.rag.stores()` + the 3-arg `query` widening are Electron-bound
   `ipcRenderer.invoke`; per §5.4/§6 the `ipcMain.handle` registration and the
   settings-pane listing section are RELEGATED (the DOM-shim harness belongs to the
   sibling `tests/unit-ms5-settings-listing.test.ts`, which this write MUST NOT read
   to learn from). The node-testable equivalent — the exported `handleRagStoreListingIpc`,
   the `handleRagQueryIpc` forward over the U-MS2 `dir` plumbing, `storeLoadStatus`,
   and the wiring's pinned per-name resolver driven through the RESOLVER/HANDLER seam
   (the exact shape of the F-MS5-2 R-tests, §3a) — is fully exercised and green. The
   render/registration/bridge-return rows (R1–R4) are the DOM-shim+Electron seams held
   by the unit test; no doc claim contradicts the node-core.
2. **F-BLIND-MS5-2 (observation — the `'loaded'` member of the union is not
   independently reproducible from a grounded real-directory build in this runner).**
   A genuinely-loaded store requires a store file that parses without `corrupt`
   (an empty `'{}'` present file yields `failed-corrupt`, not `loaded`). The
   `'loaded'` member is instead pinned at the handler seam (A1/E2) and is the
   documented U-MS2 §5.1/§5.7 `storeLoadStatus` state; the `storeLoadStatus`
   member-byte-exact union claim (E1) is asserted via the absent/malformed real
   states + the handler acceptance of all three. Consistent with the spec; no action
   needed beyond this disclosure.
3. **F-BLIND-MS5-3 (deferred, not a failure): the §5.7 broadcast rows (BE-8) and the
   security-posture census (BE-7) are cross-unit / grep-level.** BE-8 (`store:'main'`
   on broadcast/snapshot) is U-MS3's row, cited-not-restated per §5.7; BE-7 (no new
   group/tool/`RpcMethod`, census stays 12) is the §5.9 fail-9 grep-level census held
   by the unit test's GREEN-guards + the adversarial pass (F-MS5-5 RECORDED-NO-CHANGE).
   Recorded as noted (G3), not re-exercised.
4. **No doc/spec drift found in the node-testable core.** Every §5.2/§5.6 byte-pinned
   message, every coercion rule, the F-MS5-2 guard message, the BE-1/BE-1a/BE-2/BE-4/
   BE-6 rows, and the F4 `store` field forward matched the live modules exactly.

---

### What held

The §5.2 projection exactly as written — one output entry per valid input entry in
input order; `default === true`; non-string `persistenceFile`→`''`; non-string/empty
`corpusRoot`→`null`; status wholly from `statusOf(name)` (never derived, never
defaulted); the empty array → `{ stores: [] }`; the skip-malformed MED-1 discipline
(no phantom, no crash); the EXACTLY-three pinned throws byte-for-byte; purity/no-I/O
(deep-equal repeats, empty temp dir). BE-1/BE-1a (the zero-config single-`main` with
`'loaded'` / with the absent-file `'failed-missing'`) and BE-2 (the exact `{ stores:[…] }`
shape). **F-MS5-2** — the wiring's defensive FOURTH throw `rag-store-listing: no
directory entry for store "<name>"` (byte-exact; a missing directory entry throws a
diagnosable Error, never an unpinned `TypeError`), with the present-entry coexistence
negative. **F4 (end-to-end COMPLETE)** — `RagQueryPayload.store?: string` forwarded
verbatim over the U-MS2 `dir` plumbing: a forwarded real store resolves identically to
the MCP path (deep-equal incl. the `store` stamp), an unknown forwarded store fails
loud byte-exact, and the omitted-store ≡ explicit-`undefined` ≡ default semantics hold
(BE-4). **RagStoreLoadStatus ↔ storeLoadStatus** — the three-member D7 union passes
through the handler unchanged and `storeLoadStatus` returns exactly its members across
real directory states. BE-6 — the channel writes nothing (never creates the registry
file); the `IPC_RAG_STORE_LISTING` constant is byte-pinned. The BE-3/BE-7/BE-8,
preload, main-registration, and settings-pane-render rows are the Electron/DOM-shim
seams of the sibling unit test, recorded as relegated/noted — no contradiction with
the node-testable core.
