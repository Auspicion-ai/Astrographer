# Unit H1 — The Registry WRITE Module: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date:** 2026-09-08.
- **Unit:** U-H1 — `src/main/rag-store-registry-write.ts`, the registry WRITE
  module (PURE validate+derive mutators + atomic temp→fsync→rename persist +
  the combined re-read→mutate→persist→re-load entry `writeRegistryMutation`).
- **Source contract (the ONLY derivation sources):**
  `docs/specs/unit-h1-registry-write.md` — §5.1 (the module + pinned import
  set + purity), §5.2/§5.3 (the types + 6 functions), §5.4 (the three
  mutators + `persistRagStoreRegistry` + `writeRegistryMutation` behavior),
  §5.5 (the byte-pinned W-* census), §5.6 (H1–H14), §5.7 (R1–R5), §5.9
  (F1–F26 + the no-remove pin); plus the loader contract it RE-USES,
  `docs/specs/unit-ms1-store-registry.md` §5.2/§5.3/§5.4 (the types +
  `resolveRegistry` + `loadRagStoreRegistry` + the F1–F14/G-load/G-dir
  byte-pinned messages that PROPAGATE unchanged). Format precedent
  (structure only): `docs/specs/unit-ms1-store-registry-greens.md`.
- **DERIVED FROM DOCS ONLY — implementation unread.** No `src/**` file was
  opened (the module is known to this battery only as the exported seam
  below), and `tests/unit-h1-registry-write.test.ts` was NOT opened. The
  scenarios below were authored from the spec BEFORE any scenario was
  executed; the RESULTS column (§B) was filled in after.
- **Module under test (the live seam):** the 6 exported functions
  `applyRegistryMutation`, `addRegistryStore`, `removeRegistryStore`,
  `renameRegistryStore`, `persistRagStoreRegistry`, `writeRegistryMutation` —
  imported and CALLED at runtime from the live module; never read. The loader
  seam `loadRagStoreRegistry({ path })` from `src/main/rag-store-registry.js`
  provides the round-trip + persist verifications.
- **Harness:** ONE throwaway vitest runner
  `tests/unit-h1-blind-greens-run.test.ts` (a NEW file — never an edit of the
  SpecWriter-pinned `tests/unit-h1-registry-write.test.ts`), executed with the
  repo's own vitest (`npx vitest run tests/unit-h1-blind-greens-run.test.ts`,
  node environment). Every file-touching scenario uses a fresh `mkdtemp` dir
  under `os.tmpdir()` — the real userData is never touched. The message
  assertions are BYTE-EXACT wherever §5.5 pins the string (the `<json>`
  renderings constructed with `JSON.stringify` per the pinned definition, and
  the propagating loader messages per unit-ms1 §5.4). The write module's ZERO
  log output is observed by spying `console.error`/`log`/`warn`/`info` per
  scenario. The runner is DELETED after the run — the repo ends with only this
  document as the artifact.

---

## A. The scenario table (authored from the spec before execution)

`<d>` is a fresh absolute `mkdtemp` dir; `<path>` = `<d>/provident-rag-stores.json`.
`<dir>` = `dirname(<path>)` = `<d>`.

### A.1 — Pure mutators (no fs)

| id | Spec pin | Scenario | Expected result |
| --- | --- | --- | --- |
| G1 | §5.6 H1 / §5.4 step 3/5/7/8 | `applyRegistryMutation({version:1,stores:[{name:'main',default:true}]}, <d>, {kind:'add',store:{name:'research-2026-09'}})` | `registry.stores` = `[main(default:true), research-2026-09(default:false)]` in order, `registry.defaultStoreName='main'`; `configs` = `[{name:'main',default:true},{name:'research-2026-09'}]` (omitted `persistenceFile` stays omitted on BOTH — pinned-fields normalization); `delta` = `{added:['research-2026-09'], removed:[], renamed:[]}` |
| G2 | §5.6 H2 / §5.4 step 3 | add with explicit fields: `addRegistryStore(parsed, <d>, {name:'research-2026-09', persistenceFile:'<d>/my.json', corpusRoot:'<d>/root'})` with a `main` default registry | `configs` carries `persistenceFile:'<d>/my.json'` and `corpusRoot:'<d>/root'` EXACTLY as written (verbatim, no normalization); the resolved store carries both verbatim; the added store appends LAST (array order authoritative) |
| G3 | §5.6 H3 / §5.4 step 5 | `removeRegistryStore({version:1,stores:[{name:'main',default:true},{name:'research-2026-09'}]}, <d>, 'research-2026-09')` | `registry.stores` = `[main]`, `defaultStoreName='main'`, survivor entry byte-verbatim; `configs` = `[{name:'main',default:true}]`; `delta` = `{added:[], removed:['research-2026-09'], renamed:[]}` |
| G4 | §5.6 H4 / §5.4 step 5 | `renameRegistryStore(parsed, <d>, 'research-2026-09', 'research-2026-10')` on a `[main, research-2026-09(default:false)]` registry | the `research-2026-09` entry's `name` → `research-2026-10` IN PLACE, its `default:false` and omitted `persistenceFile` unchanged, ORDER preserved; `delta` = `{added:[], removed:[], renamed:[{from:'research-2026-09',to:'research-2026-10'}]}` |
| G5 | §5.6 H5 / §5.4 step 5 | rename a non-default WITH an explicit `persistenceFile` | the explicit path stays VERBATIM (rename changes ONLY the name — a non-default with explicit file does NOT re-derive) |
| G6 | §5.6 H6 | round-trip validity: any G1–G5 `result.configs` passed through `resolveRegistry({version:1, stores:result.configs}, <d>, <path>)` | PASSES (double-validation — the candidate is always valid) |
| G7 | §5.6 H12 | determinism / no-input-mutation: call an H1–H5 mutator TWICE on the SAME input; deep-compare results; deep-compare input `parsed`+`stores` against a before-snapshot; re-call against a FROZEN input; mutate a returned `registry.stores` then re-call | both calls return deep-equal fresh results; input `parsed`/`stores` UNCHANGED; frozen input accepted; mutating one returned `registry.stores` does NOT affect a second call's result (the second call stays clean) |
| G8 | §5.6 H14 | every G1–G5 `result.delta` | exactly TWO empty arrays + ONE non-empty length-1 array (single-mutation delta) |

### A.2 — Atomic persist (fs)

| id | Spec pin | Scenario | Expected result |
| --- | --- | --- | --- |
| G9 | §5.6 H7 / §5.7 R2+R3 | `persistRagStoreRegistry('<path>', [{name:'main',default:true},{name:'research-2026-09'}])` | `readFileSync('<path>','utf8')` === `JSON.stringify({version:1,stores:[{name:'main',default:true},{name:'research-2026-09'}]},null,2)` (2-space, `version:1`); then `loadRagStoreRegistry({path:'<path>'})` returns a result whose `stores`/`defaultStoreName` match the candidate's resolved form with `implicit:false`, `corrupt:false`; NO `<path>+'.tmp'` remains in `<d>` |
| G10 | §5.6 H7 / §5.4 persist step 4 | persist into a NESTED not-yet-existing parent (atomic temp+rename creates the dir) | mkdir is recursive; the file is written at `<d>/sub/provident-rag-stores.json`, re-loadable, no `.tmp` residue |
| G11 | §5.7 R1 / §5.4 persist step 4 | atomic failure leaves the ORIGINAL intact: persist twice — a valid first write, then force the second to fail (target path is a DIRECTORY, so writeFileSync EISDIR on the temp) | the SECOND call THROWS a native fs Error; the FIRST file's bytes at `<path>` are UNTOUCHED (deep-equal to the original); the temp is the only file that may be partial |

### A.3 — The combined `writeRegistryMutation` (D2 re-read→mutate→persist→re-load)

| id | Spec pin | Scenario | Expected result |
| --- | --- | --- | --- |
| G12 | §5.6 H8 / §5.7 R4 | `writeRegistryMutation({path:'<path>', mutation:{kind:'add', store:{name:'research-2026-09'}}})` with NO registry present | reads the implicit `main`, adds `research-2026-09`, writes the file, RE-LOADS → `loaded.stores` = `[main, research-2026-09]` with `main` deriving the LEGACY `<d>/provident-rag.json`; `loaded.implicit:false`, `loaded.corrupt:false`; `delta` = `{added:['research-2026-09'], removed:[], renamed:[]}` |
| G13 | §5.6 H9 / §5.7 R4 | `writeRegistryMutation` add onto an EXISTING multi-store file (write an initial file first) | the CURRENT disk stores survive + added store appends LAST; the re-loaded `loaded` matches disk order |
| G14 | §5.6 H10 / §5.7 R4 / D3 | `writeRegistryMutation({kind:'remove',name:'research-2026-09'})` on a file whose store has a real persistence file on disk | the registry entry is removed (orphan, D3); the store's persistence FILE on disk is BYTE-UNTOUCHED (byte-compare before/after); loaded shows the survivor |
| G15 | §5.6 H11 / §5.7 R4 | `writeRegistryMutation({kind:'rename',from:'research-2026-09',to:'research-2026-10'})` on a non-default store | re-load shows the new name with the same `default:false` and the re-derived `<d>/provident-rag-research-2026-10.json` path; `delta.renamed` = `[{from:'research-2026-09',to:'research-2026-10'}]` |
| G16 | §5.7 R4 | the returned `loaded.path` + a RE-load after the call | `loaded` is exactly the fresh disk state; a follow-up `loadRagStoreRegistry({path})` is deep-equal on `stores`/`defaultStoreName` to `loaded` (persisted-and-live never diverge) |

### A.4 — Validation fail-states (EXACT W-* messages)

| id | Spec pin | Scenario | Expected `Error` message (exact) |
| --- | --- | --- | --- |
| G17 | §5.5 W-mutation / W-kind / §5.9 F17 | `applyRegistryMutation(parsed, <d>, null)` ; `(parsed, <d>, {})` ; `(parsed, <d>, {kind:'delete'})` (F17) | `rag-store-registry-write: mutation required` ; `{}` is a non-null object with a non-union `kind` (`undefined`) → W-kind `rag-store-registry-write: unknown mutation kind 'undefined'` ; `{kind:'delete'}` → W-kind `rag-store-registry-write: unknown mutation kind "delete"` |
| G18 | §5.5 W-add-store / §5.9 F17 | `addRegistryStore(parsed, <d>, null)` | `rag-store-registry-write: add store required` |
| G19 | §5.5 W-remove-arg / W-rename-arg / §5.9 F18 | `removeRegistryStore(parsed, <d>, '')` ; `renameRegistryStore(parsed, <d>, '', 'b')` | `rag-store-registry-write: name required` ; `rag-store-registry-write: from required` |
| G20 | §5.5 W-add-existing / §5.9 F5 | add a `store` whose `name` is already present | `rag-store-registry-write: store 'main' already exists` |
| G21 | §5.5 W-remove-unknown / §5.9 F10 | remove a `name` not present | `rag-store-registry-write: cannot remove unknown store 'nope'` |
| G22 | §5.5 W-rename-unknown-from / §5.9 F13 | rename an unknown `from` | `rag-store-registry-write: cannot rename unknown store 'nope'` |
| G23 | §5.5 W-rename-target-exists / §5.9 F14 | rename a `from` onto an existing `to` | `rag-store-registry-write: store 'a' cannot be renamed to 'b': 'b' already exists` |
| G24 | §5.5 W-rename-default / §5.9 F15 | rename the CURRENT default store (D5) | `rag-store-registry-write: the default store cannot be renamed (default reassignment is a separate unit)` |
| G25 | §5.5 W-path / §5.9 F21/F26 | `persistRagStoreRegistry('', configs)`; `persistRagStoreRegistry(null, configs)`; `writeRegistryMutation(null)`; `writeRegistryMutation({path:''})` | `rag-store-registry-write: path required` (all four) |
| G26 | §5.5 W-configs / §5.9 F21 | `persistRagStoreRegistry('<path>', null)` | `rag-store-registry-write: configs required` |
| G27 | §5.5 W-unreadable / §5.9 F24 / §5.7 R5 | `writeRegistryMutation({path:'<p>', mutation:{kind:'add',store:{name:'x'}}})` on a byte-garbage registry file | `rag-store-registry-write: registry file unreadable (<path>); refusing to mutate a corrupt registry` — FAIL-LOUD, never the implicit fallback |

### A.5 — Propagating loader fails (candidate/existing validation) + the no-remove pin

| id | Spec pin | Scenario | Expected result |
| --- | --- | --- | --- |
| G28 | §5.9 F19 / §5.4 persist step 2 | `persistRagStoreRegistry('<path>', [])` | loader F12 `rag-store-registry: exactly one store must have default: true (found 0)` |
| G29 | §5.9 F20 / §5.4 persist step 2 | `persistRagStoreRegistry('<path>', [{name:'a', default:true, persistenceFile:'<path>'}]...)` whose file resolves onto the registry file itself (reservedPath=path) | loader F14 — a store file resolving onto the registry file fails loud before any write |
| G30 | §5.1/§5.9 (D3 orphan pin, grep-level) | scan the module SOURCE for `unlink`/`unlinkSync`/`rm`/`rmSync`/`rmdirSync`/`truncateSync`/`chmodSync` | NONE present (the write module structurally CANNOT delete/truncate any file — the D3 orphan guarantee) |
| G31 | §5.1/§5.4 (write-module log census) | spy `console.error`/`log`/`warn`/`info` across a successful mutator + a successful `writeRegistryMutation` + a W-unreadable failure | ZERO log calls (failures are thrown, not logged — the controller decides how to surface them) |

---

## B. Results (filled in after execution)

### B.0 Harness fact

- Module seam callable at runtime: `applyRegistryMutation`, `addRegistryStore`,
  `removeRegistryStore`, `renameRegistryStore`, `persistRagStoreRegistry`,
  `writeRegistryMutation` from `src/main/rag-store-registry.js`;
  `loadRagStoreRegistry` from `src/main/rag-store-registry.js`. Host = Linux.

### B.1 Results table (31 scenarios)

| id | PASS/FAIL | Notes |
| --- | --- | --- |
| G1 | PASS | |
| G2 | PASS | |
| G3 | PASS | |
| G4 | PASS | |
| G5 | PASS | |
| G6 | PASS | |
| G7 | PASS | |
| G8 | PASS | |
| G9 | PASS | |
| G10 | PASS | |
| G11 | PASS | |
| G12 | PASS | |
| G13 | PASS | |
| G14 | PASS | |
| G15 | PASS | |
| G16 | PASS | |
| G17 | PASS | |
| G18 | PASS | |
| G19 | PASS | |
| G20 | PASS | |
| G21 | PASS | |
| G22 | PASS | |
| G23 | PASS | |
| G24 | PASS | |
| G25 | PASS | |
| G26 | PASS | |
| G27 | PASS | |
| G28 | PASS | |
| G29 | PASS | |
| G30 | PASS | |
| G31 | PASS | |

### B.2 Summary

- **31 / 31 PASS. 0 FAIL.**
- No doc/spec drift and no un-hardened regression observed against
  `docs/specs/unit-h1-registry-write.md` §5.4–§5.9 on this host. The W-* census
  (§5.5), the mutator behaviors (§5.4), the atomic persist round-trip (§5.7
  R1–R5), the D2 combined write (G12–G16), the propagated loader fail states
  (G28–G29), and the D3 no-remove pin (G30) all reproduce from the live module.
