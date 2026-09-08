# Unit H2 — The Runtime Controller (`rag-store-runtime.ts`): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-08.
- **Unit:** U-H2a — `src/main/rag-store-runtime.ts` (the registry hot-apply
  RUNTIME CONTROLLER: owns the mutable live `RagStoreDirectory`, the runtime
  accessors, and the single `hotApply(mutation)` orchestration seam).
- **U-H2 b** (the `main.ts`/`mcp-server.ts` closure rewiring, §5.8–§5.9) is a
  SEPARATE later cycle — **EXCLUDED from this artifact** by the §6 split
  decision (RCA-5). This artifact covers ONLY U-H2a.
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

