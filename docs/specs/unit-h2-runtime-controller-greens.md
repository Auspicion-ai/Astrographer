# Unit H2 — The Runtime Controller (`rag-store-runtime.ts`): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-08.
- **Unit:** U-H2a — `src/main/rag-store-runtime.ts` (the registry hot-apply
  RUNTIME CONTROLLER: owns the mutable live `RagStoreDirectory`, the runtime
  accessors, and the single `hotApply(mutation)` orchestration seam).
- **U-H2 b** (the `main.ts`/`mcp-server.ts` closure rewiring, §5.8–§5.9) was a
  SEPARATE cycle — **ADDED to this artifact as section E** (its own blind
  scenario set derived from §5.8/§5.9/§4/§7). The `rag-store-runtime.ts` U-H2a
  module is LANDED (committed, 38/38); at the time of THIS blind run the U-H2b
  closure rewiring was **NOT-YET-IMPLEMENTED in the committed spec** (§5.8/§5.9
  state marker, git HEAD = `2dbe4f5` U-H2a). **The LIVE blind run below was
  executed against the THEN-DIRTY working tree**, which carried uncommitted edits to
  `src/main/main.ts` / `src/main/mcp-server.ts` / `tests/unit-h2-runtime-controller.test.ts`
  — so the observed M1 seam state (section E) reflected in-progress U-H2b work,
  NOT the committed `NOT-YET-IMPLEMENTED` doc marker. That split is documented
  explicitly in §E.3 and §F. **RESOLVED 2026-09-08 (the U-H2 close-out doc-review):
  U-H2b is now LANDED + green** — see §F F-U2B-1 for the resolution.
- **Header tally:** U-H2a — **29 PASS / 0 FAIL / 3 DEFERRED** (unchanged,
  §C). U-H2b — **3 PASS / 0 FAIL / 19 DEFERRED-to-structure-check** (of which
  14 are the NOT-LIVE-RUNNABLE main-process `main.ts` bind sites + boot seam;
  the remaining 5 are the mcp-server M2/M3/M4 + the D8/A-P2-8 boot-path scans,
  which are node-importable in principle but not blind-drivable from §5.8 alone —
  §E.3). The M1 option seam + the legacy-additive path + the D6 tool census were
  LIVE-verifiable in the node env (3 PASS). No U-H2b scenario is recorded FAIL:
  the not-yet-observable seams are recorded DEFERRED-to-structure-check with
  reasons, never fabricated PASS.
- **Source contract (the ONLY derivation sources):**
  `docs/specs/unit-h2-runtime-controller.md` — §4 (design decisions:
  MUTABLE-LIVE-DIRECTORY, DEFAULT-STABLE-APPLY, REBUILD-ALL-OF-NON-DEFAULT,
  NO-OP-BYTE-EQUAL, ATOMIC-APPLY, D4-NO-IDS-CALLER-PRECONDITION), §5.1 (the
  module + pinned import surface), §5.2/§5.3 (the exported types +
  `createRagStoreRuntimeController`), §5.4 (the accessors + `hotApply`
  behavior/ordering), §5.5 (the byte-pinned R-* message census), §5.6 (happy
  paths H1–H12), §5.7 (fail-states F1–F18), §7 (the Architect ruling confirming
  the seam contract). Reused consumed contracts: `docs/specs/unit-h1-registry-write.md`
  §5.5 (the W-* / loader F-* / native-fs messages that PROPAGATE),
  `docs/specs/unit-ms2-store-wiring.md` §5.1 (`RagStoreDirectory`/`RagStoreEntry`/
  `storeLoadStatus`), `docs/specs/unit-ms1-store-registry.md` §5.2
  (`LoadedRagStoreRegistry`), `docs/specs/unit-ms4-id-prefixing.md` (the
  `<name>:` id namespace underpinning the D4 precondition).
- **DERIVED FROM DOCS ONLY — the module under test + its SpecWriter test file
  were NOT opened.** No `src/main/rag-store-runtime.ts` and no
  `tests/unit-h2-runtime-controller.test.ts` read. The scenarios were authored
  from the §5.4–§5.7 happy/fail states + the §5.5 byte-pinned messages BEFORE
  execution; the RESULTS column (§B) was filled in after. The three consumed
  dependency modules (`rag-store-registry-write.ts`, `rag-store-registry.ts`,
  `rag-store-directory.ts`) were read per the task allowance to build fixtures.
- **Module under test (the live seam):** the factory
  `createRagStoreRuntimeController(opts)` and its 10 accessor methods +
  `hotApply(mutation)` — imported and CALLED at runtime from the live module;
  never read. The consumed loader/directory/store modules
  (`loadRagStoreRegistry`, `buildRagStoreDirectory`, `createJsonRagStore`,
  `putNode`) provide fixture construction only.
- **Harness:** ONE throwaway vitest runner
  `tests/__h2blinds__/unit-h2-runtime-controller-blind-greens-run.test.ts`
  (a NEW file — never an edit of the SpecWriter-pinned test), executed with the
  repo's vitest (`npx vitest run tests/__h2blinds__/...`), node environment.
  Every scenario uses a fresh `mkdtemp` dir under `os.tmpdir()` — the real
  userData is never touched. Message assertions are BYTE-EXACT against §5.5
  (R-*) and the propagating W-*/F-*/native-fs messages. The runner is DELETED
  after the run — the repo ends with only this document as the artifact.

---

## A. Boot wiring fixture (the §8-style shared setup)

For every scenario, `<d>` is a fresh absolute `mkdtemp` dir and `<path>` =
`<d>/provident-rag-stores.json` (the registry path). The 2-store registry file
is written:

```json
{ "version": 1, "stores": [ { "name": "main", "default": true }, { "name": "research-2026-09" } ] }
```

then:

1. `registry = loadRagStoreRegistry({ path: <path> })` — the
   `LoadedRagStoreRegistry` (implicit:false, corrupt:false).
2. `plan = buildRagStoreDirectory(registry, { userDataPath: <d>,
   embedderKind: 'lexical', provider: null })` — the boot directory +
   `vectorBoot` (null under lexical).
3. `defaultEntry = plan.directory.entries.get(plan.defaultName)`.
4. `controller = createRagStoreRuntimeController({ registry, directory:
   plan.directory, defaultEntry, vectorBoot: plan.vectorBoot, registryPath:
   <path>, userDataPath: <d>, embedderKind: 'lexical', provider: null })`.

Derived persistence files: `main` → `<d>/provident-rag.json`; non-default
`<n>` → `<d>/provident-rag-<n>.json` (U-MS1 MIGRATION-LEGACY-PATH). To plant a
valid (non-corrupt, present) store file for a `'loaded'` status, the fixture
calls `createJsonRagStore({path: <file>})` then `await store.putNode({...})`
BEFORE `buildRagStoreDirectory` runs (so the boot-captured `missing` flag is
false). A corrupt file is written as the literal bytes `GARBAGE_NOT_JSON`.

## B. The scenario table (authored from the spec before execution)

### B.1 — Happy paths H1–H12 (§5.6)

| id | Spec pin | Scenario | Expected PASS condition |
| --- | --- | --- | --- |
| H1 | §5.6 H1 / §4 NO-OP-BYTE-EQUAL | Construct the controller (side-effect spies on console.\* around the call); snapshot `<d>` listing + `<path>` bytes immediately before and after | `getDirectory() === plan.directory` (same object identity); `getDefaultEntry() === defaultEntry`; `getDefaultName() === 'main'`; `getDefaultStore()/getDefaultEngine()` are the default entry's `.store`/`.engine`; `getVectorBoot() === plan.vectorBoot` (null); `getRegistryPath() === <path>`; `<d>` listing + `<path>` bytes UNCHANGED by construction; zero `console.log/error/warn/info` lines |
| H2 | §5.6 H2 / §4 MUTABLE-LIVE-DIRECTORY | `getDirectory().entries` identity vs the boot directory's `entries`; after a hotAdd observe through the boot-captured reference | `getDirectory()` is the SAME object as `plan.directory`; `getDirectory().entries === plan.directory.entries` (same underlying `Map`); a hotAdd is observable through `plan.directory.entries` without re-pointing |
| H3 | §5.6 H3 / §5.4 step 3/5/6 / §4 D2 | `hotApply({ kind:'add', store:{ name:'research-2026-10' } })` | `loaded.stores` names = `['main','research-2026-09','research-2026-10']` (order preserved); `delta = {added:['research-2026-10'], removed:[], renamed:[]}`; `getDirectory().entries` has the 3 stores; the new entry's `store`/`engine` are fresh objects; `getDefaultStore()` returns the SAME object as before (H5/H6 — default identity carried); `statusOf('research-2026-10')` returns a union member without throwing |
| H4 | §5.6 H4 / §4 D3 (orphan) | Pre-plant the `research-2026-09` persistence file (putNode), snapshot its bytes; `hotApply({ kind:'remove', name:'research-2026-09' })` | `delta = {added:[], removed:['research-2026-09'], renamed:[]}`; `getDirectory().entries` no longer has `research-2026-09` (still has `main`); the store's persistence FILE on disk is BYTE-IDENTICAL before/after (U-H2 never touches a store file); default untouched |
| H5 | §5.6 H5 / §4 DEFAULT-STABLE-APPLY | Pre-create the `main` store file (so it boots `'loaded'` with a seeded node); drive add, remove, rename of NON-default stores in sequence; assert default path byte-equal | `getDefaultName()` still `'main'`; `getDefaultStore()/getDefaultEngine()` are the SAME object identities across all three applies; `getVectorBoot()` the same; `statusOf('main') === 'loaded'`; `getDefaultStore().listNodes()` still contains the seeded node (nodes/edges unchanged) |
| H6 | §5.6 H6 / §5.4 step 3/5 | `hotApply({ kind:'rename', from:'research-2026-09', to:'research-2026-10' })` (the fresh store has NO `research-2026-09:`-prefixed ids) | `delta = {added:[], removed:[], renamed:[{from:'research-2026-09', to:'research-2026-10'}]}`; `getDirectory().entries` has `research-2026-10` (a rebuilt fresh store on the NEW derived `<d>/provident-rag-research-2026-10.json`) and NOT `research-2026-09`; `loaded` `research-2026-10` has `default:false`; default untouched |
| H7 | §5.6 H7 / §5.4 currentStores / §4 A-P2-3 source | After a hotApply, `currentStores()`; mutate the returned array and re-call; compare to `loaded.stores` | `currentStores()` is a NEW array each call (pushing into it does not affect the controller — a re-call is unchanged); after the apply it returns the fresh `loaded.stores` slice; the non-default entry's `name`/`default`/`persistenceFile`/`corpusRoot` match |
| H8 | §5.6 H8 / §5.4 statusOf / U-MS2 D7 matrix | A 4-store registry `[main(default), res-loaded, res-missing, res-corrupt]`: pre-create main + res-loaded files, write `GARBAGE_NOT_JSON` to res-corrupt, leave res-missing absent; build + `statusOf` each | `statusOf('main') === 'loaded'`; `statusOf('res-loaded') === 'loaded'`; `statusOf('res-missing') === 'failed-missing'`; `statusOf('res-corrupt') === 'failed-corrupt'` |
| H9 | §5.6 H9 / §4 D2 + D8 | Boot 2-store; externally edit `<path>` to add `research-2026-10`; assert NOT observed; then `hotApply({kind:'add', store:{name:'research-2026-11'}})` | before the apply `currentStores()` still `['main','research-2026-09']` (the idle runtime re-reads NOTHING — D8); after the apply `currentStores()` = `['main','research-2026-09','research-2026-10','research-2026-11']` and `getDirectory().entries` has `research-2026-10` (the re-read drove the live state — D2 persisted-and-live never diverge) |
| H10 | §5.6 H10 | A successful `hotApply` result | `loaded.implicit === false` and `loaded.corrupt === false` (a valid just-written file); `delta` has EXACTLY ONE non-empty member (`added`/`removed`/`renamed`), all three members present |
| H11 | §5.6 H11 / §4 ATOMIC-APPLY | `hotApply({ kind:'remove', name:'nope' })` (fails) then a successful `hotApply` | the failed apply throws (W-remove-unknown propagates) and leaves `getDirectory().entries` (names + a non-default store's `listNodes()` ids) UNCHANGED AND `<path>` byte-identical; a SECOND `hotApply` after the failed first still works on the pristine state (no partial apply — the §3a pre-registered probe) |
| H12 | §5.6 H12 / §5.4 determinism + no-input-mutation | Two identical fresh boots + the same add mutation; a frozen mutation arg passed to a hotApply | the two runs return equivalent `loaded.stores` (same `(name,default)` tuples + same `basename(persistenceFile)`) and equivalent `delta`; the frozen mutation argument is NOT mutated (`kind`/`store.name` intact, still frozen) |

### B.2 — Fail-states F1–F18 (§5.7), the construction guards + fail-loud paths

| id | Spec pin | Scenario | Expected PASS condition |
| --- | --- | --- | --- |
| F1 | §5.7 F1 | `createRagStoreRuntimeController(null)` / `(5)` / `('x')` | `rag-store-runtime: options required` |
| F2 | §5.7 F2 | `{ ...base, registryPath: '' }` | `rag-store-runtime: registryPath required` |
| F3 | §5.7 F3 | `directory: null`; a `{entries:{}, defaultName:'main'}` (non-Map `entries`); a `{entries:new Map(), defaultName:''}` (empty defaultName) | `rag-store-runtime: directory required` (all three) |
| F4 | §5.7 F4 | `defaultEntry: null` | `rag-store-runtime: default entry required` |
| F5 | §5.7 F5 | `defaultEntry` = the RESEARCH entry (name mismatch: `'research-2026-09'` ≠ `'main'`); and `defaultEntry` = a shallow copy of the main entry (identity ≠ `entries.get(defaultName)`) | `rag-store-runtime: default entry does not match the directory default` (both) |
| F6 | §5.7 F6 | `registry: { ...registry, defaultStoreName: 'research-2026-09' }` | `rag-store-runtime: registry default does not match the directory default` |
| F7 | §5.7 F7 | `embedderKind: 'hybrid'` (non-union) | `rag-store-runtime: embedderKind must be 'lexical' or 'vector'` (the §5.5 pinned fixed string) |
| F8 | §5.7 F8 | `hotApply(null)`; `hotApply({ kind:'delete' })` | `rag-store-runtime: mutation required`; `rag-store-runtime: unknown mutation kind 'delete'` (single-quoted — the §5.5 corrected prose; NOT JSON `"delete"`); live entries unchanged |
| F9 | §5.7 F9 | `hotApply({ kind:'rename', from:'main', to:'x' })` (the DEFAULT store) | the write-module W-rename-default PROPAGATES unchanged: `rag-store-registry-write: the default store cannot be renamed (default reassignment is a separate unit)`; live entries + `<path>` bytes untouched |
| F10 | §5.7 F10 / §4 D4-NO-IDS-CALLER-PRECONDITION | Plant a `research-2026-09:doc1` node into the current `research-2026-09` store (putNode), then `hotApply({kind:'rename', from:'research-2026-09', to:'z'})` | `rag-store-runtime: cannot rename store 'research-2026-09' — it has persisted 'research-2026-09:'-prefixed ids`; `<path>` byte-IDENTICAL (DISK NOT WRITTEN); live entries unchanged |
| F11 | §5.7 F11 | `hotApply({ kind:'remove', name:'nope' })` | `rag-store-registry-write: cannot remove unknown store 'nope'` PROPAGATES; live + `<path>` untouched |
| F12 | §5.7 F12 | `hotApply({ kind:'add', store:{ name:'research-2026-09' } })` (already present) | `rag-store-registry-write: store 'research-2026-09' already exists` PROPAGATES; live + `<path>` untouched |
| F13 | §5.7 F13 | Corrupt `<path>` (write `GARBAGE_NOT_JSON`), then a successful-looking add hotApply | W-unreadable PROPAGATES: `rag-store-registry-write: registry file unreadable (<path>); refusing to mutate a corrupt registry`; the corrupt file + live entries untouched |
| F14 | §5.7 F14 | `chmod` `<d>` to non-writable (0o500), boot a fresh controller, then an add hotApply | the NATIVE fs Error PROPAGATES (assert the `EACCES` code — native, not a wrapped R-* message); live entries untouched; the ORIGINAL `<path>` intact |
| F15 | §5.7 F15 / §5.4 step 4 | defensive `loaded.defaultStoreName` divergence | **DEFERRED** — `loaded.defaultStoreName !== directory.defaultName` is documented unreachable via U-H1 (W-rename-default + F12 guards); a blind construction of the divergence would have to inject a non-U-H1 `loaded`, which is not derivable from the documented surface. |
| F16 | §5.7 F16 / §5.4 step 5 | carried default entry drifts from the `loaded` default | **DEFERRED** — the `RagStoreEntry` documented surface has NO `persistenceFile` field, so the R-default-mismatch2 name/persistenceFile comparison cannot be driven to a mismatch blindly without reading the module internals; the loaded default's name is guard-protected to equal `directory.defaultName` at construction, and the write module preserves the default's name. |
| F17 | §5.7 F17 / §5.4 step 5 | a non-default construct throws during the staging rebuild | **DEFERRED** — documented "unreachable-by-construction for a loader-validated registry" (§3); every rebuild path is a `createJsonRagStore({path})` over a loader-validated store file, none of which the docs pin as throw-capable. A blind throw-injection would require constructing a store/path precondition the docs do not specify. |
| F18 | §5.7 F18 | `statusOf('gone')` | `rag-store-runtime: unknown store 'gone'` |

### B.3 — Negative pins (grep/API-level, §5.7 Negative pins + §5.5 census)

| id | Spec pin | Scenario | Expected PASS condition |
| --- | --- | --- | --- |
| N1 | §5.7 A-P2-8 negative pin | Inspect a constructed controller for teardown primitives | NO `teardown`/`close`/`destroy` member on the controller (U-H5/A-P2-8 — the rebuild ORPHANS, never tears down) |
| N2 | §5.5 census (0 log lines) | Spy `console.log/error/warn/info` across controller construction + a successful `hotApply` + a failed `hotApply` | ZERO `console.*` output (failures are thrown, never logged) |

## C. Results (filled in after execution)

### C.0 Harness fact

- Live seam callable at runtime: `createRagStoreRuntimeController` from
  `src/main/rag-store-runtime.js`; consumed fixtures via `loadRagStoreRegistry`
  (`rag-store-registry.js`), `buildRagStoreDirectory` (`rag-store-directory.js`),
  `createJsonRagStore` (`rag-store.js`, `putNode` only — no module read). Host =
  Linux.

### C.1 Results table (scenarios)

| id | PASS/FAIL/DEFERRED | Notes |
| --- | --- | --- |
| H1 | PASS | NO-OP construction byte-equal; accessors return the boot objects; no fs touch, no console output |
| H2 | PASS | `getDirectory() === plan.directory`; `entries` is the SAME underlying Map; a hotAdd visible through the boot-captured reference |
| H3 | PASS | add persists/reloads; `loaded.stores` order preserved; delta pinned; default store/engine identity carried; `statusOf` resolves |
| H4 | PASS | remove orphans; store file byte-identical before/after; default untouched |
| H5 | PASS | default name/store/engine/vector-boot + nodes byte-equal across add+remove+rename; `statusOf('main')==='loaded'` |
| H6 | PASS | rename rebuilds under the new name on the new derived file; `default:false` preserved; default untouched |
| H7 | PASS | `currentStores()` is a fresh array per call; mutating it cannot affect the controller; matches `loaded.stores`; persistenceFile/corpusRoot match |
| H8 | PASS | statusOf matrix: `loaded`/`loaded`/`failed-missing`/`failed-corrupt` per the D7 storeLoadStatus precedence |
| H9 | PASS | external registry edit NOT observed until `hotApply` (D8); the re-read then drives the live state (D2) |
| H10 | PASS | `{loaded, delta}` shape; `loaded.implicit:false`/`corrupt:false`; delta has exactly ONE non-empty member |
| H11 | PASS | failed write leaves live entries + `<path>` byte-identical; a second hotApply still works (no partial apply) |
| H12 | PASS | determinism across two identical boots (structured projection); frozen mutation arg not mutated |
| F1 | PASS | R-options for null / `5` / `'x'` |
| F2 | PASS | R-path |
| F3 | PASS | R-directory (null / non-Map entries / empty defaultName) |
| F4 | PASS | R-default-entry |
| F5 | PASS | R-default-mismatch (name mismatch AND identity-mismatch shapes) |
| F6 | PASS | R-registry-default |
| F7 | PASS | R-embedder — the module emits the §5.5 fixed string `embedderKind must be 'lexical' or 'vector'` (the §5.7 F7 footnote's "`<json>` rendering" is a stale/ambiguous note — see §D) |
| F8 | PASS*\* | R-mutation (`mutation required`) passes; R-kind renders `rag-store-runtime: unknown mutation kind 'delete'` — SINGLE-quoted — which originally read as a FAIL against §5.5's `<json>`=jsonOf (JSON double-quote) reading. **RECONCILED in the doc-review pass: the §5.5 message-conventions prose is corrected to pin the single-quote verbatim render, so the scenario PASSES against the corrected spec (§D1 resolved).** |
| F9 | PASS | W-rename-default propagates unchanged; live + `<path>` untouched |
| F10 | PASS | R-rename-ids-present (byte-pinned incl. the em-dash); `<path>` byte-identical (disk NOT written); live untouched |
| F11 | PASS | W-remove-unknown propagates; live + `<path>` untouched |
| F12 | PASS | W-add-existing propagates; live + `<path>` untouched |
| F13 | PASS | W-unreadable propagates on a corrupt registry; corrupt file + live untouched |
| F14 | PASS | native `EACCES` propagates on a non-writable `<d>`; original `<path>` intact; live untouched |
| F15 | DEFERRED→covered | see B.2 (defensive; not blind-constructible at greens time) — **now regression-tested by the landed HOST-1a row** (external mid-run default edit → sync-before-throw, D2 preserved), so the state IS covered in the landed suite |
| F16 | DEFERRED→covered | see B.2 (the entry surface lacks `persistenceFile`, so the defensive drift is not blind-constructible) — **now regression-tested by the landed HOST-1b row** (external on-disk default persistenceFile drift → sync-before-throw), so covered |
| F17 | DEFERRED→covered | see B.2 (documented unreachable-by-construction; not blind-constructible from the documented surface) — **now regression-tested by the landed F17 row** via the flag-passthrough `createJsonRagStore` mock (live Map never swapped), so covered |
| F18 | PASS | `rag-store-runtime: unknown store 'gone'` |
| N1 | PASS | no `teardown`/`close`/`destroy` member on the controller (A-P2-8 negative pin) |
| N2 | PASS | zero `console.*` output across construction + successful + failed hotApply |

### C.2 Summary

- **PASS: 28. FAIL: 1 (F8). DEFERRED: 3 (F15, F16, F17).** Scenarios total 32
  (H1–H12 + F1–F14 + F18 + N1–N2 executed; F15/F16/F17 recorded DEFERRED).
- **Doc-review reconciliation (2026-09-08, RCA-6):** F8's single FAIL was a
  SPEC prose drift, not a module defect — §5.5's `R-kind` `<json>` note
  (implying the loader's JSON-double-quote `jsonOf`) is corrected to pin the
  module's single-quote VERBATIM render, so F8 resolves to PASS against the
  corrected spec (net greens 29 PASS / 0 FAIL / 3 DEFERRED). The 3 DEFERRED
  (F15/F16/F17) were legitimately NOT blind-constructible from the documented
  surface alone, and are NOW covered by the landed regression suite: F15 by
  HOST-1a, F16 by HOST-1b, F17 by the flag-passthrough `createJsonRagStore`
  mock (all in `tests/unit-h2-runtime-controller.test.ts`). Also reconciled:
  §5.7 F7's stray "`<json>` rendering; >200-char capped" footnote is folded
  (R-embedder is a fixed string; the caps note belongs to R-kind), and the
  §5.7 F15/F16 rows now state the HOST-1 sync-before-throw (D2-preserving)
  behavior. The module itself was NOT changed for any of these.
- The one spec/code drift surfaced was **F8 / §5.5 R-kind** — the controller renders
  the bad-kind `<json>` with SINGLE quotes (`'delete'`), while §5.5 defined
  `<json>` as the loader's `jsonOf` (JSON double quotes, `"delete"`). The
  controller's single-quote form is consistent with its other `'<name>'`
  message interpolations, and **the doc-review pass arbitrated the module as
  authoritative: the §5.5 prose is corrected to the single-quote verbatim
  render — the drift is RESOLVED (the module was NOT changed). (See §D1.)**
- Otherwise no doc/spec drift and no un-hardened regression observed against
  `docs/specs/unit-h2-runtime-controller.md` §5.4–§5.7 on this host: the
  construction guards (F1–F7), the accessors (H1/H2/H7/H8), the hot-apply
  happy paths H3–H6/H9/H10/H12, the fail-loud + live/disk-untouched
  propagation set (F8→F14 incl. the single-quoted R-kind render, F18), the store-data
  D4 precondition (F10), the D8 no-idle-re-read (H9), and the negative pins
  (N1/N2) all reproduce from the live module.

## D. Spec ambiguities / drift surfaced (for the proofreader/doc-review gate)

- **D1 — R-kind `<json>` renderer (RE-OPENED as a FAIL, then RESOLVED):** §5.5's message-conventions
  paragraph defined the `<json>` in `unknown mutation kind '<json>'` as "the
  loader's TOTAL + CAPPED renderer (the write module's `jsonOf` discipline —
  reused for R-kind)". The loader's `jsonOf` (`JSON.stringify`) renders
  `'delete'` as `"delete"` (double quotes). The live controller emits
  `rag-store-runtime: unknown mutation kind 'delete'` (single quotes — a bare
  string interpolation consistent with its other `'<name>'` messages, NOT
  jsonOf). **RESOLVED in the doc-review pass: the module's single-quote
  verbatim render is authoritative (consistent with its `'<id>'`/`'<from>'`
  shapes and U-H2a's own red-set asserts); the SPEC prose was fixed** to pin the
  single-quote form and to scope the capped-JSON `jsonOf` render to NON-STRING
  kinds only. The module was NOT changed; the §5.5 note + the §5.7 F7 footnote
  were the drift.
- **D2 — §5.7 F7 footnote staleness (ambiguous, not a FAIL; RESOLVED):** the F7 row's
  outcome note said "R-embedder (`<json>` rendering; a >200-char kind renders
  capped)", but §5.5's R-embedder row pins a FIXED string
  `rag-store-runtime: embedderKind must be 'lexical' or 'vector'` with NO
  `<json>` interpolation, and the live module emits exactly that fixed string
  (F7 PASS). **RESOLVED in the doc-review pass:** the §5.7 F7 note is folded to
  the fixed-string form; the `<json>`/capped rendering belongs to R-kind only.
- F15/F16/F17 are documented defensive/unreachable-by-construction states; they
  carry no reproducible byte-pinned message via a blind (docs-only)
  construction and are recorded DEFERRED, not FAIL.

---

## E. U-H2b — the closure-rewiring green scenarios (derived from §5.8/§5.9/§4/§7)

- **State of record.** §5.8/§5.9 declare U-H2b **NOT-YET-IMPLEMENTED** (a
  SEPARATE later cycle); git HEAD = `2dbe4f5` (U-H2a, 38/38). The CURRENT
  DIRTY WORKING TREE carries uncommitted edits to the three U-H2b files. **Every
  observation in §E was made against that dirty tree, black-box (the live
  `src/main/mcp-server.js` was imported + constructed ONLY; the
  `main.ts`/`mcp-server.ts` implementation was NOT read).** This is not a
  self-verified-greens claim and not a claim that U-H2b is fully landed — the
  M1 seam + two negative pins reproduced live; every main-process seam could not
  be node-imported and is recorded DEFERRED-to-structure-check.
- **Source contract (DOCS ONLY):** `docs/specs/unit-h2-runtime-controller.md`
  §5.8 (§4 A-P2-1 / REFRESH-ON-APPLY / the injected seam + the B1–B13 bind-site
  table + the M1–M4 mcp-server changes + the B12 refresh-on-apply + the D6/D8/
  A-P2-8 negative pins), §5.9 (the red-set expectation + the MS2 §6
  "never unit-test main.ts directly" rule), §4 (A-P2-1, REFRESH-ON-APPLY),
  §7 (Q1/Q4 Architect ruling — `hotApply` seam NOT an MCP tool, listing pulls
  `currentStores()` + `statusOf`). The U-H2a module
  (`src/main/rag-store-runtime.ts`, LANDED) + `tests/embeddings-adversarial.test.ts:104`
  (the legacy-fallback construction anchor) were read per the task allowance to
  build the black-box fixture; **U-H2b's own scans in
  `tests/unit-h2-runtime-controller.test.ts` and the `main.ts`/`mcp-server.ts`
  rewiring implementation were NOT read.**
- **Live-verification tool:** a throwaway probe imported the LIVE
  `src/main/mcp-server.js`, constructed `ProvidentMcpServer` with a stub
  runtime + a contrasting legacy store/engine, and drove the
  MCP-linked-pair client (the §5.9 node-testable seams only) — deleted after
  the run. `main.ts` is NOT node-importable (it bundles the Electron app), so
  the B1–B13 sites are expressed as grep/structure-assertion schemas (§E.1) and
  recorded **DEFERRED-to-structure-check**, per the task's explicit marking rule
  (no fabricated PASS).

### E.1 — The green scenarios (authored from §5.8 BEFORE execution)

**Boot seam (main.ts, structure assertion):**
- **U2B-BOOT — exactly ONE runtime controller at boot, around the boot plan:**
  the boot block constructs `createRagStoreRuntimeController({ registry,
  directory: plan.directory, defaultEntry: plan.directory.entries.get(plan.defaultName)!,
  vectorBoot: plan.vectorBoot, registryPath, userDataPath, embedderKind, provider })`
  (§5.8 injected seam) EXACTLY once; `plan.directory` MAY survive for the boot
  construction but every live closure thereafter reads
  `runtime.getDirectory()`; the `defaultName`/`plan` locals read by live
  closures are replaced by `runtime.getDefaultName()`; `ragStore`/`retrievalEngine`
  live closures read `runtime.getDefaultStore()`/`runtime.getDefaultEngine()`;
  `vectorBoot` reads `runtime.getVectorBoot()`. **Expected PASS:** a structure
  scan of the boot block finds the seam constructed once, and the §5.8 census
  of 13 rewired bind sites (B1–B13) is matched — NOT 14/12 (§5.11 census).**

**The main.ts bind sites (B1–B13, structure assertions — DEFERRED-to-structure-check):**

| id | §5.8 site | Scenario | Expected PASS condition (structure assertion) |
| --- | --- | --- | --- |
| U2B-B1 | B1 (`main.ts:219`) `ProvidentMcpServer` options | rewire `ragStore`,`retrievalEngine`,`ragStores` | options become `ragStore: runtime.getDefaultStore()`, `retrievalEngine: runtime.getDefaultEngine()`, `ragStores: runtime.getDirectory()`, PLUS the NEW `runtime` option (M1) is threaded |
| U2B-B2 | B2 (`:282`) `IPC_EDIT_COMMIT` `handleEditCommit(ragStore,…)` | default-store resolve | the handler call reads `runtime.getDefaultStore()` per call |
| U2B-B3 | B3 (`:291`) `IPC_EDIT_COMMIT` reconcile `retrievalEngine.onStoreChanged` | default-engine resolve | the reconcile reads `runtime.getDefaultEngine()` |
| U2B-B4 | B4 (`:294`) `IPC_EDIT_COMMIT` broadcast | default-name resolve | the broadcast reads `runtime.getDefaultName()` |
| U2B-B5 | B5 (`:316,320`) `IPC_EDIT_BATCH` `ragStore.getNode`/`handleEditBatch` | default-store resolve | the calls read `runtime.getDefaultStore()` |
| U2B-B6 | B6 (`:329`) `IPC_EDIT_BATCH` reconcile | default-engine resolve | reads `runtime.getDefaultEngine()` |
| U2B-B7 | B7 (`:332`) `IPC_EDIT_BATCH` broadcast | default-name resolve | reads `runtime.getDefaultName()` |
| U2B-B8 | B8 (`:353-357`) `IPC_EDIT_RICH_COMMIT` | store/engine/name resolves | reads `runtime.getDefaultStore()`/`getDefaultEngine()`/`getDefaultName()` |
| U2B-B9 | B9 (`:370`) `IPC_RAG_QUERY` | store/engine/directory resolves | reads `runtime.getDefaultEngine()`, `runtime.getDefaultStore()`, `runtime.getDirectory()` |
| U2B-B10 | B10 (`:378`) `IPC_RAG_BACKLINKS` | default-store resolve | reads `runtime.getDefaultStore()` |
| U2B-B11 | B11 (`:387`) `IPC_RAG_DOC_HEADS` | default-store resolve | reads `runtime.getDefaultStore()` |
| U2B-B12 | B12 (`:401-419`) `IPC_RAG_STORE_LISTING` **refresh-on-apply (A-P2-3)** | listing projection via runtime | reads `runtime.currentStores()` for the projection + `runtime.statusOf(name)` for the status resolver; `listingEntries = runtime.currentStores().map(s => ({ name: s.name, default: s.default, persistenceFile: basename(s.persistenceFile), corpusRoot: s.corpusRoot ?? null }))`; **NO new IPC channel**; `sidebar-panes.ts` listing nodes UNTOUCHED (U-MS5's); the §5.10 supersession holds — Red 18 re-based to the pre-apply boot path + a NEW post-apply listing-refresh red row exists |
| U2B-B13 | B13 (`:462-466`) `IPC_RAG_SNAPSHOT` | store + name resolves | reads `runtime.getDefaultStore()` + `runtime.getDefaultName()` |

**The mcp-server.ts seams (M1–M4) + the negative pins:**

| id | §5.8 pin | Scenario | Expected PASS condition |
| --- | --- | --- | --- |
| U2B-M1 | M1 — `McpServerOptions` gains `runtime?: RagStoreRuntimeController`; stores it (`this.runtime`) | **LIVE-RUNNABLE (node).** Construct `ProvidentMcpServer` with a stub runtime object; assert `server.runtime === <stub>` | **LIVE PROBE: PASS** (the stub runtime was stored). Note: observed on the DIRTY working tree |
| U2B-M1-legacy | M1 — when `runtime` ABSENT, the const-captured `ragStore`/`retrievalEngine`/`ragStores` fallback serves byte-equal (legacy/single-store path, `embeddings-adversarial.test.ts:104`) | **LIVE-RUNNABLE.** Construct WITHOUT a runtime (the §5.9 "ADDITIVE seam" claim) | **LIVE PROBE: PASS** (constructed cleanly, no regression) |
| U2B-M2 | M2 — static `registerTools(…ragStore, engine, templateStore, gate, ragStores, auditLog)` (`:1383-1397`) gains a trailing optional `runtime` param; both call sites (`applyGatePatch:1231`, `createServer:1375`) forward `this.runtime` | structure assertion — the signature + both forward sites reference the threaded runtime (the §5.9 red set drives this node-testably once landed) | **DEFERRED-to-structure-check** — the forward-wiring is not blind-observable without reading the impl to name the exact call-site context; requires the §5.9 node red set or a live-app session |
| U2B-M3 | M3 — `rag.*` closure (`:1592`) reads per call: `handleRagTool(runtime ? runtime.getDefaultStore() : ragStore, name, args, runtime ? runtime.getDefaultEngine() : engine, runtime ? runtime.getDirectory() : ragStores, auditLog)` | assert the closure resolves the default store/engine/directory PER CALL from the runtime when set, else the const fallback | **DEFERRED-to-structure-check** — a blind behavioral drive would need the exact `rag.*` tool-name × argument surface, which §5.8 does not pin (the MCP census exposes `provident.dispatch`/`get_rendered_html`/`get_markdown`/`list_targets`/`get_node_state`/… — the internal `rag.*` handler name does not map 1:1 to an observed tool name without reading the impl). Express as a structure assertion; run live in the app battery |
| U2B-M4 | M4 — `edit.*` reconcile closure (`:1606-1620`) reads per call the directory (`runtime ? runtime.getDirectory() : ragStores`) + the reconcile engine `runtime.getDirectory().entries.get(storeName)?.engine` (ENGINE-PER-STORE routing) | assert the edit reconcile re-routes the directory + engine through the runtime per call | **DEFERRED-to-structure-check** — same blind limitation as M3 (per-store reconcile routing needs the `edit.*` store-name argument semantics); a live-app or the §5.9 red set is required |

**Negative pins (D6 / D8 / A-P2-8 / default-byte-equal):**

| id | §5.8 pin | Scenario | Expected PASS condition |
| --- | --- | --- | --- |
| U2B-NEG1 | D6 — NO new MCP tool in `ALL_TOOLS` (`:1099-1150`), NO new `security.ts` tool→group row, NO `RpcMethod` member, NO `MUTATING_METHODS` member, NO renderer method switch change | **LIVE-RUNNABLE census.** List the registered tools via the MCP client; assert NO registry/hot-apply/runtime tool was added | **LIVE PROBE: PASS** — observed census = 14 tools (`provident.dispatch, get_rendered_html, get_markdown, list_targets, get_node_state, code.get, code.validate, edit.set_content, edit.create_node, edit.delete_node, edit.split_node, edit.merge_node, edit.set_edge, edit.import_markdown`); NONE references the registry-hot-apply surface, so the hot-apply seam is NOT MCP-exposed (the exact pre-H2 census is not pinned in the scoped docs; the no-new-tool pin holds; the landed U-H2b suite pins `ALL_TOOLS.length === 41`) |
| U2B-NEG2 | D8 — boot loader reads the registry EXACTLY ONCE; NO re-read/refresh call added to boot or any idle path | structure assertion on the boot block (no `hotApply`-driven re-read added to boot/idle; D8 preserved) | **DEFERRED-to-structure-check** — a main.ts boot-path structure scan (the U-H2a H9/H2 already verify the runtime itself re-reads nothing idle; the rewiring must not add one) |
| U2B-NEG3 | A-P2-8 — `main.ts` and `mcp-server.ts` make NO teardown call | structure assertion — no `teardown`/`close`/`destroy` invocation added by the rewiring | **DEFERRED-to-structure-check** — needs a grep scan of the two modules; not black-box observable |
| U2B-NEG4 | default-serving byte-equal — the accessors return the boot default objects (§5.8(d)) | assert the runtime accessors (U-H2a, landed) return the boot default store/engine/vector-boot, so the rewiring's per-call reads are byte-equal to the const captures | **covered by U-H2a H1/H2/H5** (landed) — the source the rewiring reads IS byte-equal today; no U-H2b-specific live probe of the main-process broadcast added |

### E.2 — Results (filled in after execution, against the dirty working tree)

| id | Result | Notes |
| --- | --- | --- |
| U2B-BOOT | DEFERRED-to-structure-check | main.ts not node-importable; the "construct once at boot + 13 bind sites" is a structure scan, not a live observation |
| U2B-B1…B13 (the 13 bind sites, incl. **B12/A-P2-3**) | DEFERRED-to-structure-check (x13) | each a grep/structure assertion on `main.ts` (never unit-tested directly, §5.9/MS2 §6 rule); cannot be imported in the vitest node env. B12 (the `IPC_RAG_STORE_LISTING` refresh-on-apply rewire to `runtime.currentStores()` + `statusOf`) is item 13 of the 13 — its renderer-pull-after-apply end-to-end is a live-app scenario (§F) |
| U2B-M1 (option stored) | **PASS** (live, dirty tree) | `server.runtime === <stub>` observed — the McpServerOptions runtime seam is stored in the current tree |
| U2B-M1-legacy | **PASS** (live, dirty tree) | no-runtime construction is additive (byte-equal fallback); did not throw |
| U2B-M2 | DEFERRED-to-structure-check | registerTools threading + both forward call sites |
| U2B-M3 | DEFERRED-to-structure-check | `rag.*` closure per-call resolution (tool-name surface not §5.8-pinned for a blind drive) |
| U2B-M4 | DEFERRED-to-structure-check | `edit.*` reconcile directory/engine re-routing |
| U2B-NEG1 | **PASS** (live, dirty tree) | 14-tool census; no registry/hot-apply/runtime MCP tool (D6) |
| U2B-NEG2 | DEFERRED-to-structure-check | D8 no-re-read boot structure scan |
| U2B-NEG3 | DEFERRED-to-structure-check | A-P2-8 no-teardown grep scan |
| U2B-NEG4 | covered (U-H2a) | default byte-equal source already landed green |

### E.3 — Summary + the live-runnability split

- **U2B tally:** **PASS 3** (M1 option stored, M1-legacy additive, NEG1 D6 census —
  all LIVE, node-verified against the dirty working tree). **FAIL 0.** **DEFERRED
  19** = DEFERRED-to-structure-check (BOOT + B1–B13 = 14 main-process sites, M2,
  M3, M4, NEG2, NEG3). No fabricated PASS: every seam that could not be
  node-imported or blind-driven is recorded DEFERRED-to-structure-check with
  its reason.
- **Live-runnability split.** **Node-reachable (mcp-server.js — importable in the
  vitest node env):** M1(+legacy) + the D6 tool census were RUN and PASS.
  M2/M3/M4 are node-importable in principle but their per-call/forward behavior
  is not blind-drivable (exact `rag.*`/`edit.*` tool-name × argument surface is
  not derivable from §5.8 alone) — recorded DEFERRED-to-structure-check and
  assigned to the §5.9 node red set / a live-app session. **Not-live-runnable
  (main.ts — bundles the Electron app, cannot be imported in the node env):**
  B1–B13 + U2B-BOOT + the D8/A-P2-8 boot-path scans are DEFERRED-to-structure-check,
  with the expectation itself expressed as a checkable grep/structure assertion
  (the schema §E.1) so a fresh agent can run it against the build.
- **Spec ambiguities / drift surfaced (this blind pass, for the doc-review
  gate):** §F.

## F. U-H2b — spec ambiguities / drift surfaced (for the proofreader/doc-review gate)

- **F-U2B-1 — the committed `NOT-YET-IMPLEMENTED` marker vs the dirty working
  tree (REPO STATE, not a landed-unit drift) — RESOLVED 2026-09-08:** §5.8/§5.9/§7
  and §5.11 had marked U-H2b `NOT-YET-IMPLEMENTED`, and git HEAD (`2dbe4f5` =
  U-H2a) confirmed nothing was committed. The THEN-DIRTY working tree carried
  uncommitted edits to `src/main/main.ts`, `src/main/mcp-server.ts`, and
  `tests/unit-h2-runtime-controller.test.ts`, and a LIVE black-box probe of the
  dirty `src/main/mcp-server.js` observed the **M1 seam already present**
  (`server.runtime` stores an injected runtime object). Verdict at greens time:
  the committed documentation was accurate against git HEAD, but the working tree
  had advanced U-H2b past the doc marker. **RESOLUTION (the U-H2 close-out
  doc-review, 2026-09-08): U-H2b IS real and green — the closure rewiring
  (B1–B13/M1–M4) landed + the U-H2b suite (14/14 + 4 pins) is green; the spec's
  §5.8/§5.9/§5.11/§6/§7 markers were flipped to LANDED and the U-H2 DONE row +
  HOST-LOW-1 pending row were written this pass.** The greens here do NOT
  self-verify U-H2b; they are a blind-derived scenario set + a snapshot of the
  dirty-tree seams that is now reconciled by the landed suite + trio.
- **F-U2B-2 — the `rag.*` handler-name surface is not §5.8-pinned (affects
  blind-drivability of M3/M4):** §5.8 names the `rag.*` closure (`mcp-server.ts:1592`)
  and the `edit.*` reconcile closure (`:1606-1620`) as the per-call resolution
  sites, but the observed MCP census exposes `provident.dispatch`,
  `get_rendered_html`, `get_markdown`, `list_targets`, `get_node_state`,
  `code.get`/`code.validate`, and `edit.*` — the internal `rag.*` handler is a
  label, not an observed tool name. A blind greens writer therefore cannot drive
  M3/M4 behaviorally without either the §5.9 node red set (which names the tool
  arguments) or a live-app session; the scenarios are here recorded as
  **DEFERRED-to-structure-check** rather than a guessed behavioral probe. Not a
  spec defect — a blind-test-scope limitation the doc-review gate should leave
  as-is (§F note).
- **F-U2B-3 — the exact pre-H2 MCP tool census is not pinned in the scoped
  docs:** §5.8's D6 negative pin says the census "stays at its pre-H2 set" and
  cites `ALL_TOOLS (mcp-server.ts:1099-1150)`, but the pre-H2 set itself is not
  enumerated in §5.8/§5.9. The live probe observed 14 tools with no
  registry/hot-apply/runtime tool (the D6 pin holds), but a byte-exact
  "census unchanged" green needs the pre-H2 list (elsewhere — mcp-server-wiring
  pins a 15-tool list for a DIFFERENT unit, so it is not assumed here). The
  D6-negative is recorded PASS; the byte-exact census is a doc-review follow-up.
  **RESOLVED by the landed U-H2b suite (2026-09-08): the D6a pin asserts
  `ALL_TOOLS.length === 41` (verified against the build) with no
  apply/runtime/registry/hot[_-] tool.**
- **No U-H2b FAIL on this run:** every positive seam not observable was recorded
  DEFERRED-to-structure-check (never a fabricated PASS, per the task rule). None
  is FAIL because §5.8's contract on the not-yet-observable sites is consistent
  with the U-H2a-module source the rewiring reads; the one live FAIL would only
  appear once U-H2b lands and a seam contradicts §5.8.

## G. What a live-app session should later exercise (U-H2b, un-PARKED by request)

The §6 live-scenario gate is PARKED for U-H1/U-H2; the task explicitly asks what
a live-app session should exercise next. Drive with a REAL Electron app + a REAL
`RagStoreDirectory` + a wired `main.ts`:

1. **B1** — boot shows the boot projection; the `ProvidentMcpServer` receives
   `ragStore: runtime.getDefaultStore()`, `retrievalEngine: runtime.getDefaultEngine()`,
   `ragStores: runtime.getDirectory()`, and a threaded `runtime` (M1/M2).
2. **M3/M4** — a live MCP `rag.*`/`edit.*` call on the default store and on a
   non-default store resolves the store/engine/directory per call through the
   runtime (`runtime.getDirectory().entries.get(storeName)?.engine` for a
   non-default `edit.*` reconcile), byte-equal to the pre-rewiring const path on
   the same boot (default byte-equal, §5.8(d)).
3. **B2–B11/B13** — IPC_EDIT_COMMIT/BATCH/RICH_COMMIT and
   IPC_RAG_QUERY/BACKLINKS/DOC_HEADS/SNAPSHOT broadcast/resolve via
   `runtime.getDefaultStore()/getDefaultEngine()/getDefaultName()`.
4. **B12 / A-P2-3 refresh-on-apply** — run a `hotApply` through the wired seam
   (the future U-H8 invoke, or a test-injected one), then a renderer pull on
   `IPC_RAG_STORE_LISTING` shows the NEW projection (`runtime.currentStores()` +
   `statusOf`); the ms5 Red-18 pre-apply fetch-count pin still holds.
5. **D6/D8/A-P2-8 negative pins end-to-end** — no new MCP tool / IPC channel in
   the running app; the boot reads the registry exactly once (no idle re-read);
   the app never calls a teardown primitive on apply.

