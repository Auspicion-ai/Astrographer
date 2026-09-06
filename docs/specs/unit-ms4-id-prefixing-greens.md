# Unit MS4 — Store-Id Prefixing at the Import Minting Seam: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date: 2026-09-05.**
- **Unit:** U-MS4 — the `importMarkdownCorpus` store-context parameter (the
  OPTIONAL 3rd param `ImportStoreContext`), the SC1–SC5 fail-state battery, the
  `<name>:` prefix mint at the seam, the A1 prefix-namespace rejection
  (resolution (a) + the A1-S7 erratum), the per-store path resolution
  (`resolve(corpusRoot, file)` + the corpusRoot guard), the cross-store
  uniqueness invariants (INV-1..INV-6 incl. the INV-6 erratum), and the F2
  wired-import staging.
- **Source contract (the ONLY derivation sources):**
  `docs/specs/unit-ms4-id-prefixing.md` in full — §5.1 (the signature + the
  `ImportStoreContext` shape + the null-skip legacy shape), §5.2 (the pipeline
  order + the SC battery + the corpusRoot guard + the id-minting census), §5.3
  (the path-resolution rule + the containment/TOCTOU reuse + the R7 pin), §5.4
  (the A1 state matrix S1–S10 + the byte-pinned message + the A1-S7 erratum +
  the F-MS4-11 residue sentence), §5.5 (INV-1..INV-6 + the F-MS4-1 erratum +
  the F-MS4-7 containment-limitation note), §5.6 (the A4 binding byte-equality
  criteria 1–9), §5.7 (one-shot per store), §5.8 (H1–H13), §5.9 (F1–F14), §3a
  (the adversarial record F-MS4-1..F-MS4-11); plus
  `docs/specs/unit-ms2-store-wiring.md` §5.6 (the F2 third-argument
  pass-through + the wired-prefix red-set addition) and `docs/decisions.md`
  (STORE-ID-PREFIX, IMPORT-ROOT-PER-STORE, MULTI-STORE-REGISTRY,
  SINGLE-WRITER-STORE-PER-STORE). Shape context for the runner fixtures came
  from the sibling specs the U-MS4 spec cites: `unit-t-markdown-import.md`
  §5.1 (the `ImportMarkdownParams`/`ImportMarkdownResult` shapes), `unit-d-editing.md`
  §5.1.1 (`EditOpContext` = `{ store }`), `unit-a-rag-store.md` §5.4
  (`createJsonRagStore`/`journal()`), `unit-ms1-store-registry.md` §5.3 (the
  registry loader), `unit-ms2-store-wiring.md` §5.1/§5.4
  (`buildRagStoreDirectory`, `handleEditTool`). Format precedent (structure
  only): `docs/specs/unit-ms2-store-wiring-greens.md`.
- **DERIVED FROM DOCS ONLY — implementation unread.** No `src/**` file was
  opened; `tests/unit-ms4-id-prefixing.test.ts` and
  `tests/unit-ms4-id-prefixing-adversarial.test.ts` were NOT opened. The
  scenarios below were authored from the spec BEFORE execution; §B and §C were
  filled in after. Runtime export-surface enumeration (`Object.keys` of the
  imported live modules), returned-value inspection, and one read-count
  diagnostic (E00b, retired before the final run — see the harness notes) were
  used ONLY to locate the callable seams and calibrate the Proxy probes — never
  to read sources.
- **Module under test (the live seams, imported and CALLED, never read):**
  `src/main/markdown-import.js` (`importMarkdownCorpus` — the 3-arg seam),
  `src/main/markdown-parse.js` (`parseMarkdown` — the census passthrough),
  `src/main/rag-store.js` (`createJsonRagStore` — the store fixture +
  `journal()`/`status()`), `src/main/edit-ops.js` (`setContent`, `createNode`,
  `setEdge` — the INV-4 miss + the F-MS4-11 residue), and — for the F2 staging
  rows only — `src/main/rag-store-registry.js` (`loadRagStoreRegistry`),
  `src/main/rag-store-directory.js` (`buildRagStoreDirectory`),
  `src/main/mcp-server.js` (`handleEditTool` — the wired import path).
- **Harness:** ONE throwaway vitest runner
  `tests/tmp-blind-ms4-greens.test.ts` (a NEW file — never an edit of the
  SpecWriter-pinned unit test files), executed with the repo's own vitest
  (`npx vitest run tests/tmp-blind-ms4-greens.test.ts`, node environment).
  Every file-touching scenario uses a fresh `mkdtemp` dir under `os.tmpdir()`
  (corpus dirs, store dirs, registry dirs are all per-scenario); the real
  userData is never touched; the only repo-root file READ (never written) is
  the pre-existing `AGENTS.md` (the cwd-relative fixture for the corpusRoot
  default rows). Message assertions are BYTE-EXACT wherever §5.2/§5.4/§5.9 pin
  the string. Per-scenario evidence was captured into a temp-dir JSON file and
  the runner was DELETED after the run — the repo ends with NO new test files;
  this document is the artifact.
- **Harness-contract notes (disclosed mechanics, not contract claims):**
  (1) Every successful import-row fixture passes an explicit ABSOLUTE
  `corpusRoot` (the Unit T suite's fixture pattern, `unit-t-markdown-import.md`:
  "the importer tests set it to a temp corpus dir") — a fixture that omitted it
  was CORRECTLY rejected by the cwd-default containment (see the harness-fix
  disclosure below; the module was right, the fixture was wrong).
  (2) The `<iso>`-timestamp normalization is applied ONLY in the E20
  deep-equality store sweep (the two runs' `createdAt`/`updatedAt` differ);
  every other assertion compares raw values.
  (3) The §3a F-MS4-2 Proxy probes (E34–E36) flip ONE context key through a
  `get` trap; the flip threshold was calibrated at runtime to the observed
  per-call read counts (a retired diagnostic measured `name`: 4 reads,
  `isDefault`: 2 reads, `reservedNames`: 3–5 reads per import) so that the
  fixed module never observes the flip while ANY un-hardened extra live read at
  the mint/gate WOULD observe it and flip the outcome — the R2/R3 red-first
  semantics re-expressed blind. (4) `handleEditTool` is called with the
  U-MS2-pinned 5-arg shape `(store, name, args, onStoreChanged, ragStores)`.
- **Platform notes:** Linux host; symlinks (E27) and `/etc`-independent
  absolute paths (E32) executed natively; nothing was deferred for environment
  reasons. The two DEFERRED rows below are the spec's own pending-transcription
  findings (F-MS4-5, F-MS4-10), which the spec forbids inventing.

---

## A. The scenario table (43 rows: 41 executable + 2 DEFERRED — authored from the spec before execution)

| id | Spec pin | Scenario | Expected result |
| --- | --- | --- | --- |
| E01 | §5.2 step 2 SC1; §5.9 F1 | `store` truthy non-object family (`'main'`, `42`, `true`, `[]`, a function) with a valid corpus | byte-pinned `markdown import: invalid store context`, NO `failedFile` |
| E02 | §5.2 steps 1–3 | Precedence: non-array `files` + SC-invalid store ⇒ the files guard wins; SC-invalid store + `corpusRoot: 42` ⇒ SC wins; SC-invalid + nonexistent file + nonexistent root ⇒ SC error (fail-fast, no fs touch) | the pinned order files → SC → corpusRoot |
| E03 | §5.2 SC2/SC3; §5.9 F2/F3; §5.1 the defensive rule | Prefix mode + `name` family (`null`/`''`/`5`/omitted/`'a:b'`) ⇒ invalid; default-mode contrasts (`name:''`, `name:'a:b'` with `isDefault: true`) ⇒ import UNPREFIXED; `isDefault:'yes'` (non-true) ⇒ PREFIXED | mode-gated SC2/SC3 + the `isDefault !== true` defensive rule |
| E04 | §5.2 SC4; §5.9 F4 | `reservedNames` provided non-array (`'research-2026-09'`, `5`, `{}`, `null`, `false`) | invalid store context (fail-loud) |
| E05 | §5.2 SC5; §5.9 F5 | `reservedNames` arrays with a non-string element (`['ok',42]`, `['ok',null]`, `['ok',{}]`) | invalid store context |
| E06 | §5.2 step 2 (the null-skip) + step 3 | `store: null` / `store: undefined` SKIP the SC battery ⇒ legacy unprefixed import; `store: null` + `corpusRoot: 42` ⇒ the corpusRoot guard STILL fires | null-skip is SC-only; the corpusRoot guard is independent |
| E07 | §5.4 A1-S1; §5.9 F8 | Legacy 2-arg call, file `research-2026-09.md` | IMPORTS, documentId `research-2026-09` (byte-equal today) |
| E08 | §5.4 A1-S2; §5.8 H13 | Default context + `reservedNames: []` ⇒ import; default context with the list OMITTED + a file named like its own store (`main.md`) ⇒ import | no A1 consult when no list is given; unprefixed |
| E09 | §5.4 A1-S3; §5.9 F6 | Default context + `reservedNames: ['research-2026-09']` + `research-2026-09.md` | byte-pinned collision error + `failedFile`; 0 nodes/edges, journal `[]`, undoDepth 0, no store file persisted |
| E10 | §5.4 A1-S4/S5; §5.9 F9 | Exact-equality family: `research-2026-09-notes.md` / `Research.md` / `research_2026_09.md` vs reserved `['research-2026-09']` | all IMPORT (substring/case/underscore never collide) |
| E11 | §5.4 A1-S6 | Default store named `kb`, `reservedNames` = the OTHER stores, file `kb.md` | IMPORTS unprefixed (the own name is not in the GIVEN list) |
| E12 | §5.4 A1-S7 (the erratum) | Default context whose GIVEN list CONTAINS its own name (`['main','other']`), file `main.md` | REJECT with the A1 error (`includes(base)` on the list it is GIVEN) |
| E13 | §5.4 A1-S8; §5.8 H12 | Non-default store `research-2026-09` + `research-2026-09.md` | IMPORTS, documentId `research-2026-09:research-2026-09` (the A1 check is default-only) |
| E14 | §5.4 A1-S9; §5.9 F7 | Multi-file corpus with TWO colliding files (`b-collide.md` before `a-collide.md`) + a trailing ok file | WHOLE import rejected; `failedFile` = the FIRST colliding file in `files` order; no partial application |
| E15 | §5.4 A1-S10 | Zero-config (no registry, no context) import of an arbitrary file name | byte-equal today, unprefixed |
| E16 | §3a F-MS4-6 (R8/R9); §5.4 exact-equality | The sanitize-onto boundary family: `research-2026-09-.md`, `research-2026-09 .md`, `research:2026:09.md`, `research-2026-09.MD` (all sanitize onto the reserved base) + the survivor `research-2026-09..md` | four REJECTs echoing `research-2026-09`; the survivor IMPORTS with documentId `research-2026-09.` |
| E17 | §5.2 census table; §5.8 H3; §5.5 INV-2 | Store `S` + a 10-type rich corpus vs the default store's import of the SAME file | every id shape prefixed (`S:readme`, `S:readme:section:<n>`, `S:readme:<type>:<n>` for all 11 block types, `e-S:readme-<n>`, edge `documentIds ['S:readme']`, root `ownedNodeIds`), every node id === `'S:'` + the default id, colon counts 0/2 vs 1/3, result counts = the parse sizes |
| E18 | §5.2 step 4i; §5.6 criterion 9 | `parseMarkdown(md, 'S:readme')` vs `parseMarkdown(md, 'readme')` — the parser takes the documentId as an INPUT | ids differ exactly by the prefix; determinism; the ONLY throw unchanged |
| E19 | §5.8 H1; §5.6 criteria 1–6; §5.7 | The default-store legacy import of the rich file: the full default census + ONE `batch` journal entry + putNode-before-putEdge ordering + undoDepth/persist | byte-equal shapes; 1 batch entry; persisted once |
| E20 | §5.8 H2; §5.6 criterion 8 | The explicit default context `{name:'main', isDefault:true, reservedNames:['other-store']}` vs the legacy call on the same corpus | results DEEP-EQUAL; stores deep-equal (after `<iso>` normalization) |
| E21 | §5.8 H4; §5.5 INV-1/INV-5 | `Promise.all` of two imports of the same `readme.md` into two distinct stores (legacy + `S`) | both ok; `readme` vs `S:readme`; node-id sets DISJOINT; no cross-store edge ownership |
| E22 | §5.5 INV-6 (the F-MS4-1 erratum); §3a R1 | Default doc `research-2026-09-readme-3.md` (+ `readme-3.md`) vs store `research-2026-09` doc `readme-3.md` — the corrected example's edge ids | `e-research-2026-09-readme-3-1` vs `e-research-2026-09:readme-3-1` — DISTINCT; zero cross-store edge-id equality over all pairs |
| E23 | §5.8 H11; §5.5 INV-4 | `setContent(default ctx, 'S:readme:section:1')` after both imports | `edit.set_content: node not found`; the same-named default node UNCHANGED |
| E24 | §5.8 H9; §5.7 | Re-import the same file into the same non-default store | the SAME prefixed ids (upsert), journal = 2 batch entries |
| E25 | §5.8 H5; §5.3 | A relative path against a NON-cwd `corpusRoot` | ok, resolving to `<root>/readme.md` (the A5 behavior change) |
| E26 | §5.8 H6/H7 | Relative subdirectory `sub/note.md` + an absolute path within the store root (non-default store) | both ok; containment holds against the store root |
| E27 | §5.8 H8; §5.3 | A symlink inside a NON-default store root pointing outside | byte-equal `path outside corpus root: link.md` + `failedFile: 'link.md'` |
| E28 | §5.9 F12 | `files: ['../outside.md']` with a non-cwd `corpusRoot` | byte-exact outside error + `failedFile: '../outside.md'` |
| E29 | §5.6 criterion 7; §5.3 | A relative cwd file with an OMITTED `corpusRoot` vs an explicit `corpusRoot: process.cwd()` | deep-equal ok results (byte-identical when the effective root is cwd) |
| E30 | §5.2 step 3; §3a F-MS4-3 (R5/R6) | The corpusRoot guard: `42`/`false`/`{}`/`''` renderings + `null`/`undefined` keep the cwd default + the files-guard precedence | byte-pinned `(got …)` renderings, NO `failedFile`; the cwd default imports |
| E31 | §5.2 step 3 (the cap) | The jsonOf cap: a non-string corpusRoot whose JSON is exactly 200 chars vs 201 chars | the FULL echo at 200; the 198-char rendering (first 197 + `…`) above |
| E32 | §5.5 (the F-MS4-7 note) | `corpusRoot: '/'` + an absolute file outside any real root; the SAME file against a real root | ok under `/` (containment vacuous — the DOCUMENTED LIMITATION); outside error against a real root |
| E33 | §3a F-MS4-4 (R7) | A NUL byte in a file path: inside the root, and outside the root | byte-exact `cannot read file: note\u0000.md` (fail-closed, no batch/ids); the outside path keeps the OUTSIDE error (containment precedes) |
| E34 | §3a F-MS4-2 (R2) | A flipping `isDefault` Proxy (false through the SC/snapshot reads, true after) + a flipping `name` Proxy | the SNAPSHOT governs the mint ⇒ `S:note` (never an unprefixed/renamed id) |
| E35 | §3a F-MS4-2 (R3) | A flipping `reservedNames` Proxy (the colliding list at the SC read, `[]` after) in default mode with `collide.md` | REJECT with the A1 error (the desync does NOT wave the collision through) |
| E36 | §3a F-MS4-2 (R4) | Repeat E34/E35 with fresh equivalent Proxies | identical outcomes across runs (one deterministic point-in-time) |
| E37 | U-MS2 §5.6 (the F2 wired red-set addition); U-MS4 §5.11 | The WIRED import through `handleEditTool` + a 2-store directory: the default entry UNPREFIXED, the non-default entry PREFIXED (a RELATIVE file against each entry's corpusRoot) | `['readme']` vs `['research-2026-09:readme']`; the ids land in the addressed stores (the U-MS2 S39 staged red goes green) |
| E38 | U-MS2 §5.6 (the pinned 3-arg pass-through shape); §5.4 A1-S7's caller note | The §5.6-pinned 3-arg call replicated byte-for-byte over the directory + the wired A1 interplay (a default import of `research-2026-09.md`) | prefixed/unprefixed as pinned; the wired A1 REJECT with the reserved names = the non-default store names |
| E39 | §5.9 F13 | The inherited fail-states on the legacy path: files-array/empty, empty file path, cannot-read (nonexistent + directory), outside-corpus-root (absolute), duplicate documentId, empty documentId, doc-flow | all byte-equal; NO journal pollution |
| E40 | §5.9 F10/F11/F14 | The prefixed echoes: a heading-less doc in store `S`; a duplicate pair in store `S`; an empty-documentId file in store `S` | `for S:note: missing-head` (+failedFile); `duplicate documentId: S:a` (NO failedFile); the empty-documentId error fires BEFORE the prefix |
| E41 | §5.4 (the F-MS4-11 residue sentence) | `setEdge` on the DEFAULT store with caller `documentIds: ['S:doc']` | ok; the stored edge carries the prefix-SHAPED owner string (the documented non-import residue) |
| D1 | §3a F-MS4-5 | RECORDED-NO-CHANGE — the finding body is "(pending verbatim transcription … NOTHING invented)" | DEFERRED — no user-observable scenario is derivable from the docs without inventing the finding |
| D2 | §3a F-MS4-10 | HOST-DEFECT — the finding body is "(pending verbatim transcription …)" | DEFERRED — same reason; the supervisor transcribes it at doc-review time |

---

## B. RESULTS (the final recorded run, 2026-09-05)

Runner: `npx vitest run tests/tmp-blind-ms4-greens.test.ts` — **41/41 vitest
tests passed, exit 0** (~0.35 s). Tally: **41 PASS / 0 FAIL / 2 DEFERRED.**
`<d>` = the scenario's temp dir. (Four diagnostic probes used during the
development loop — the raw-result probe, the per-key read-count calibration,
and two journal/entry dumps — were retired BEFORE this final recorded run and
are disclosed in the harness notes; their observations are folded into the
harness-fix disclosure below.)

| id | Result | Observed evidence (actual returned values / thrown messages) |
| --- | --- | --- |
| E01 | ✅ PASS | all five truthy non-object shapes (`'main'`, `42`, `true`, `[]`, a function) ⇒ byte-exact `{"ok":false,"error":"markdown import: invalid store context"}` with NO `failedFile` |
| E02 | ✅ PASS | non-array `files` + SC-invalid store ⇒ `markdown import: files must be a non-empty array` (the files guard FIRST); valid files + SC-invalid store + `corpusRoot: 42` ⇒ `invalid store context` (SC beats the corpusRoot guard); SC-invalid + a nonexistent file + a nonexistent root ⇒ `invalid store context` (fail-fast — the fs is never touched) |
| E03 | ✅ PASS | prefix-mode `name:null`/`""`/`5`/omitted/`"a:b"` ⇒ all `invalid store context`; the default-mode contrasts: `{name:'', isDefault:true}` ⇒ ok `["readme"]` UNPREFIXED, `{name:'a:b', isDefault:true}` ⇒ ok `["readme"]` UNPREFIXED (the name is unused when default); `{name:'main', isDefault:'yes'}` ⇒ ok `["main:readme"]` PREFIXED — the `isDefault !== true` defensive rule observed |
| E04 | ✅ PASS | `reservedNames` = `'research-2026-09'` / `5` / `{}` / `null` / `false` (all provided, non-array) ⇒ `invalid store context` |
| E05 | ✅ PASS | `['ok',42]` / `['ok',null]` / `['ok',{}]` ⇒ `invalid store context` |
| E06 | ✅ PASS | `store:null` ⇒ ok `["readme"]`; `store:undefined` ⇒ ok `["readme"]` (the SC battery SKIPPED); `store:null` + `corpusRoot:42` ⇒ `markdown import: corpusRoot must be a string (got 42)` — the corpusRoot guard is NOT disabled by the SC skip |
| E07 | ✅ PASS | the legacy 2-arg call ⇒ `{ok:true, documentIds:["research-2026-09"], …}`; the root node `research-2026-09` present (type `div`) — byte-equal today (A1-S1/F8) |
| E08 | ✅ PASS | `{name:'main', isDefault:true, reservedNames:[]}` + `research-2026-09.md` ⇒ ok `["research-2026-09"]`; the omitted-list variant + a file named like its OWN store (`main.md`, name `main`) ⇒ ok `["main"]` — no A1 consult, unprefixed (S2 + H13) |
| E09 | ✅ PASS | byte-exact `{"ok":false,"error":"markdown import: documentId collides with a registered store name: research-2026-09","failedFile":"<d>/research-2026-09.md"}`; store unchanged: 0 nodes, 0 edges, `journal() === []`, `undoDepth() === 0`, NO store file persisted |
| E10 | ✅ PASS | the three variants ⇒ ok with documentIds `["research-2026-09-notes","Research","research_2026_09"]` — exact-equality only (F9/S4/S5) |
| E11 | ✅ PASS | default `kb` + reserved `['research-2026-09']` + `kb.md` ⇒ ok, documentId `kb` UNPREFIXED; the root node id `kb` exists (S6) |
| E12 | ✅ PASS | `{name:'main', isDefault:true, reservedNames:['main','other']}` + `main.md` ⇒ byte-exact `{"ok":false,"error":"markdown import: documentId collides with a registered store name: main","failedFile":"<d>/main.md"}` — the A1-S7 ERRATUM holds: `includes(base)` on the list it is GIVEN, no second-guessing |
| E13 | ✅ PASS | non-default `research-2026-09` + `research-2026-09.md` ⇒ ok, documentId `research-2026-09:research-2026-09` (the A1 check is default-only) |
| E14 | ✅ PASS | `files: [b-collide.md, a-collide.md, zz-ok.md]` ⇒ byte-exact collision error naming `b-collide` with `failedFile: <d>/b-collide.md` (the FIRST colliding file in `files` order); 0 nodes, `journal() === []` — no partial application (S9/F7) |
| E15 | ✅ PASS | zero-config (no context at all) ⇒ ok `["zero-config-note"]` — byte-equal today (S10/A4) |
| E16 | ✅ PASS | the four sanitize-onto files (`research-2026-09-.md`, `research-2026-09 .md`, `research:2026:09.md`, `research-2026-09.MD`) each ⇒ byte-exact `markdown import: documentId collides with a registered store name: research-2026-09` (+failedFile); the survivor `research-2026-09..md` ⇒ ok with documentId `research-2026-09.` (the trailing dot survives the dash-only trim) — R8/R9 pinned |
| E17 | ✅ PASS | store `S` vs the default store, SAME rich file: documentIds `["S:readme"]`; all 21 node ids === `'S:'` + the default ids; root `S:readme` (1 colon) vs `readme` (0), sections/blocks 3 vs 2 colons (INV-2); all 11 block types minted `S:readme:<type>:<n>` (`p,ul,ol,li,blockquote,pre,table,thead,th,tr,td`); edge ids `e-S:readme-<n>` (40) vs `e-readme-<n>` (40); the 3 doc-flow edges carry `documentIds: ['S:readme']`; root `ownedNodeIds: ['S:readme:section:1','S:readme:section:2']`; `nodeCount=21 edgeCount=40` == the direct parse sizes (H3 + the census table as a test) |
| E18 | ✅ PASS | `parseMarkdown(RICH,'S:readme').documentId === 'S:readme'`; the node ids differ from the `readme` parse exactly by the `'S:'` prefix; the edge ids map `e-readme-<n>` ↔ `e-S:readme-<n>`; two calls deep-equal (determinism); the ONLY throw byte-exact `markdown parse: markdown/documentId required` (non-string markdown AND empty documentId) — the parser is untouched (§5.6 criterion 9) |
| E19 | ✅ PASS | `{ok:true, documentIds:["readme"], nodeCount:21, edgeCount:40}`; root `readme` (type `div`) + `readme:section:1/2` + all 11 block types `readme:<type>:<n>`; edges `e-readme-<n>` with the 3 doc-flow edges carrying `documentIds: ['readme']`; root `ownedNodeIds: ['readme:section:1','readme:section:2']`; journal: ONE entry, `kind === 'batch'`, `ops` = 21 `putNode` then 20 `putEdge` — ALL putNode ops precede ALL putEdge ops; `undoDepth()===1`, `redoDepth()===0`; the store file persisted ONCE (§5.6 criteria 1–6) |
| E20 | ✅ PASS | the explicit default context's result deep-equals the legacy result (`{ok:true, documentIds:["readme"], nodeCount:21, edgeCount:40}`) and the two stores are deep-equal after `<iso>` timestamp normalization — the context did not alter the default path's output (§5.6 criterion 8) |
| E21 | ✅ PASS | `Promise.all` two-store import: both ok (`["readme"]` vs `["S:readme"]`); the node-id sets are DISJOINT (21 unprefixed vs 21 `S:`-prefixed); the default store carries NO `S:readme`-owned edge (INV-1/INV-5) |
| E22 | ✅ PASS | default edge ids `[e-readme-3-1..5, e-research-2026-09-readme-3-1..5]` vs store `research-2026-09` edge ids `[e-research-2026-09:readme-3-1..5]` — the ERRATUM example is DISTINCT (`e-research-2026-09-readme-3-1` vs `e-research-2026-09:readme-3-1`) and ZERO equality holds over all 50 cross-store pairs (INV-6 non-coincidence, R1) |
| E23 | ✅ PASS | `setContent(default ctx, 'S:readme:section:1')` ⇒ `{"ok":false,"error":"edit.set_content: node not found"}`; the same-named default node `readme:section:1` content UNCHANGED — never a silent mutation (INV-4/B3) |
| E24 | ✅ PASS | the second import ⇒ the IDENTICAL result `{ok:true, documentIds:["S:readme"], nodeCount:21, edgeCount:40}`; the 21 node ids identical both runs (upsert); the journal holds 2 `batch` entries (H9/§5.7) |
| E25 | ✅ PASS | `corpusRoot: '<d>/e25-root'`, `files: ['readme.md']` ⇒ ok — the relative file resolved against the STORE root (the cwd-relative resolve would have failed containment) — the A5 behavior change (H5) |
| E26 | ✅ PASS | relative `sub/note.md` ⇒ ok `["S:note"]`; absolute `<root>/abs.md` ⇒ ok `["S:abs"]`; both section nodes exist (containment holds against the store root) |
| E27 | ✅ PASS | the symlink `<root>/link.md` → outside ⇒ byte-exact `{"ok":false,"error":"markdown import: path outside corpus root: link.md","failedFile":"link.md"}`; 0 nodes — the realpath/TOCTOU discipline reused UNCHANGED for a non-default store root (H8) |
| E28 | ✅ PASS | `files: ['../outside.md']` with a non-cwd root ⇒ byte-exact `{"ok":false,"error":"markdown import: path outside corpus root: ../outside.md","failedFile":"../outside.md"}` (F12) |
| E29 | ✅ PASS | omitted root ⇒ `{ok:true, documentIds:["AGENTS"], nodeCount:103, edgeCount:199}`; explicit `corpusRoot: process.cwd()` ⇒ DEEP-EQUAL — `abs === resolve(file)` when the effective root is cwd (§5.6 criterion 7) |
| E30 | ✅ PASS | `corpusRoot: 42` ⇒ `(got 42)`; `false` ⇒ `(got false)`; `{}` ⇒ `(got {})`; `''` ⇒ `(got "")` — each byte-exact `markdown import: corpusRoot must be a string (got …)` with NO `failedFile`; `null`/`undefined` ⇒ ok `["AGENTS"]` (the cwd default, NOT a caller error); the files guard beats the corpusRoot guard (R5/R6) |
| E31 | ✅ PASS | a non-string corpusRoot whose JSON rendering is exactly 200 chars ⇒ the FULL echo byte-exact; 201 chars ⇒ the rendering is exactly 198 chars (first 197 + `…`), the message = prefix + 198 + `)` — the jsonOf cap arithmetic (F-MS4-3) |
| E32 | ✅ PASS | `corpusRoot: '/'` + an absolute file outside any real root ⇒ ok `["vacuous"]` — the file was READ (containment VACUOUS, no special-casing); the SAME file against a real root ⇒ `path outside corpus root: <abs>` — the F-MS4-7 DOCUMENTED LIMITATION observed with its contrast |
| E33 | ✅ PASS | `files: ['note\u0000.md']` inside the root ⇒ byte-exact `markdown import: cannot read file: note\u0000.md` (+failedFile, the raw NUL byte in the message) — fail-closed, `journal() === []`, 0 nodes; `files: ['../note\u0000.md']` ⇒ the OUTSIDE error `path outside corpus root: ../note\u0000.md` — containment PRECEDES the NUL probe (F-MS4-4/R7) |
| E34 | ✅ PASS | the `isDefault` flip (false through the SC/snapshot reads, true after the calibrated threshold) ⇒ ok with documentId `S:note` — PREFIXED (the snapshot governs the mint, NOT the live flip); the `name` flip (`'S'`→`'T'`) ⇒ `S:note` — the snapshot name governs (R2) |
| E35 | ✅ PASS | the `reservedNames` flip (`['collide']` through the SC/snapshot reads, `[]` after) + `collide.md` ⇒ byte-exact A1 REJECT with `failedFile` — the desyncing getter does NOT wave the collision through (R3) |
| E36 | ✅ PASS | run1/run2 with fresh equivalent Proxies ⇒ `["S:note"]` and the identical A1 reject message BOTH runs — one deterministic point-in-time (R4) |
| E37 | ✅ PASS | the WIRED import through `handleEditTool` + a 2-store directory (`main` default + `research-2026-09`): the default wired import ⇒ `{ok:true, documentIds:["readme"], nodeCount:3, edgeCount:5}` UNPREFIXED; the wired non-default import ⇒ `{ok:true, documentIds:["research-2026-09:readme"], nodeCount:3, edgeCount:5}` PREFIXED; the prefixed ids landed in `research-2026-09`'s store and NOT in main's — **the U-MS2 S39 staged red goes GREEN** (STORE-ID-PREFIX is activated through the wired 3-arg pass-through) |
| E38 | ✅ PASS | the §5.6-pinned 3-arg shape replicated byte-for-byte (`{name: entry.name, isDefault: entry.name === dir.defaultName, reservedNames: [...dir.entries.keys()].filter(n => n !== dir.defaultName)}`): default ⇒ `["readme"]`, non-default ⇒ `["research-2026-09:readme"]`; the wired A1 interplay: a default import of `research-2026-09.md` ⇒ byte-exact `markdown import: documentId collides with a registered store name: research-2026-09` (+failedFile) — the wiring supplies ONLY the non-default names `["research-2026-09"]` (the S7 caller note) |
| E39 | ✅ PASS | files non-array AND empty ⇒ `files must be a non-empty array`; `files: ['']` ⇒ `empty file path`; a nonexistent file AND a directory ⇒ `cannot read file: <path>` (+failedFile); an absolute outside path ⇒ `path outside corpus root: <path>` (+failedFile); `a.md`+`a.markdown` ⇒ `duplicate documentId: a` (NO failedFile); a basename sanitizing to `''` ⇒ `empty documentId for file: <path>` (+failedFile); a heading-less doc ⇒ `doc-flow validation failed for note: missing-head` (+failedFile); `journal() === []` throughout. NOTE: the batch-failure row (`:156`) has NO doc-derivable markdown-driven trigger — not exercised blind (finding 2) |
| E40 | ✅ PASS | F10: store `S` + a heading-less doc ⇒ byte-exact `markdown import: doc-flow validation failed for S:note: missing-head` (+failedFile); F11: `a.md`+`a.markdown` in store `S` ⇒ `markdown import: duplicate documentId: S:a` (NO failedFile); F14: a `''`-sanitizing file in store `S` ⇒ `empty documentId for file: <path>` — the check fires BEFORE the prefix (never a prefixed-empty id like `S:`) |
| E41 | ✅ PASS | `setEdge(default store, {kind:'parent-child', …, documentIds: ['S:doc']})` ⇒ ok; the stored edge carries the prefix-SHAPED owner string `['S:doc']` — the F-MS4-11 NON-import residue observed exactly as the §5.4 sentence documents it (harmless now; U-MS3's resolver must not mis-scope it) |
| D1 | ⏸ DEFERRED | §3a F-MS4-5 (RECORDED-NO-CHANGE) — the finding body is a "(pending verbatim transcription …)" placeholder; the spec forbids inventing it, so no user-observable scenario is derivable blind |
| D2 | ⏸ DEFERRED | §3a F-MS4-10 (HOST-DEFECT) — same pending-transcription state; a defect in host code OUTSIDE this unit's allowed files, recorded for its owning unit |

---

## C. Summary + findings

**41 PASS / 0 FAIL / 2 DEFERRED** (43 scenario rows; the recorded vitest run:
41/41 tests passed, exit 0, ~0.35 s). Every byte-pinned string in the U-MS4
contract held byte-exact against the live modules: the SC1–SC5
`invalid store context` battery with its exact precedence (files guard → SC
battery → corpusRoot guard) and the null-skip legacy shape; the A1
byte-pinned collision message with `failedFile` and the no-batch/no-journal/
no-persist discipline; the A1-S1..S10 state matrix including the A1-S7 erratum
(a GIVEN list containing the default store's own name ⇒ REJECT) and the
exact-equality family; the sanitize-onto boundary family (four rejections +
the surviving trailing dot); the complete prefixed id census across all four
minting sites (root/sections/blocks/edges) with the edge-id colon
(`e-S:readme-<n>`) and the doc-flow `documentIds`; the default store's
byte-equality (the 2-arg path AND the `isDefault: true` path — §5.6 criteria
1–9, the ONE `batch` journal entry with putNode-before-putEdge ordering); the
cross-store invariants (INV-1/2/4/5 + the INV-6 non-coincidence erratum); the
per-store path resolution (relative-against-root, subdirectory, absolute,
symlink/TOCTOU, the `../` escape, the cwd byte-equality boundary, the
corpusRoot guard with its jsonOf cap); the F-MS4-3/4/6/7/11 §3a behaviors; the
F-MS4-2 Proxy-snapshot determinism probes; and the F2 staging rows — the wired
default import UNPREFIXED and the wired non-default import PREFIXED through
`handleEditTool` (U-MS2's S39 staged red is now green).

### Findings requiring supervisor attention

1. **No doc/spec drift found.** Every spec-cited message, shape, ordering,
   matrix row, and census claim matched the live modules — including the three
   errata the blind runner could falsify: the A1-S7 erratum (a GIVEN list
   containing the default store's own name REJECTS — E12), the INV-6/F-MS4-1
   non-coincidence erratum (the corrected example's two edge ids are DISTINCT;
   zero equality over 50 cross-store pairs — E22), and the F-MS4-3 corpusRoot
   guard (`(got …)` renderings + the 198-char cap — E30/E31). The F2 staging is
   LIVE: a wired non-default import mints `<name>:`-prefixed documentIds
   (E37/E38) — U-MS2's recorded S39 staged red is now green, so the U-MS2
   DONE-row/staged-red bookkeeping can be reconciled.
2. **F-BLIND-MS4-1 (coverage note, not a failure): the §5.9 F13 batch-failure
   row (`markdown-import.ts:156` per the spec's citation) has NO
   doc-derivable markdown-driven trigger.** Unit T pins it as "a parsed node
   that fails the store's write-time validation", but every parser-reachable
   shape passes that validation (unsafe links are demoted, images dropped, raw
   HTML dropped — the grammar cannot mint a `__proto__`/`constructor`/
   `prototype` key through markdown), so the row was not exercised blind. The
   other seven F13 fail-states are all exercised byte-exact (E39). The
   batch-failure rollback itself is Unit N/Unit T suite territory; route any
   fresh blind assertion there.
3. **F-BLIND-MS4-2 (deferred with the spec's own pin): §3a findings F-MS4-5
   and F-MS4-10 are "(pending verbatim transcription … NOTHING invented)"** —
   no concrete input is recorded, so no user-observable scenario is derivable
   blind (D1/D2 above). The supervisor transcribes both at doc-review time;
   F-MS4-10 is a HOST-DEFECT for its owning unit, not for U-MS4.
4. **F-BLIND-MS4-3 (observation, consistent with the spec): the defensive
   `isDefault !== true` prefix rule is observable** — an explicit context
   `{name:'main', isDefault:'yes'}` (a truthy NON-`true` value) takes PREFIX
   mode and mints `main:readme` (E03). This is §5.1's pinned defensive rule
   ("at runtime the defensive rule is `isDefault !== true` ⇒ prefix mode"),
   not a defect; U-MS2's wiring passes a boolean so the production seam is
   unaffected. Recorded so a future agent does not "fix" it into a truthiness
   check — that would break the pinned rule.
5. **Harness-fix disclosure (per the U-MS1/U-MS2 precedent).** The development
   runs before the final recorded run reported harness-authoring failures, all
   corrected BEFORE the recorded tally; no contract claim changed:
   (1) the temp-corpus fixtures initially omitted the explicit ABSOLUTE
   `corpusRoot` the Unit T fixture pattern always sets — the module CORRECTLY
   rejected the /tmp files under the cwd default (`path outside corpus root`);
   the fixtures were fixed, the module was right;
   (2) E19's persist check initially pointed at the corpus dir instead of the
   store's own path — fixed by giving the store a known path;
   (3) E17/E19 initially asserted `documentIds` on EVERY edge — the §5.2 census
   row scopes them to the doc-flow kinds (doc-head/doc-end/next-section) only;
   corrected to the census reading and both rows then held;
   (4) the §3a F-MS4-2 Proxy flip thresholds were calibrated with a retired
   read-count diagnostic (per import: `name` 4 reads, `isDefault` 2,
   `reservedNames` 3–5 depending on mode) — the final thresholds sit AT the
   observed counts so the hardened module never observes the flip while any
   un-hardened extra live read at the mint/gate would observe it and flip the
   outcome (E34/E35/E36 all held);
   (5) the four diagnostic probes were retired before the final recorded run;
   the final run contains exactly the 41 counted scenarios.

### What held

The SC battery byte-exact with the pinned precedence (files → SC → corpusRoot)
and the null-skip legacy shape; the mode-gated SC2/SC3 with the
`isDefault !== true` defensive rule; the fail-loud SC4/SC5 reservation guards;
the A1 predicate (exact-equality on the SANITIZED base, default-store-only,
`includes(base)` on the GIVEN list — the S7 erratum) with the byte-pinned
message, the caller-echo `failedFile`, and the no-batch/no-journal/no-persist
discipline; the sanitize-onto boundary family with the surviving trailing dot;
the full prefixed census (every node id === `'S:'` + the default id, colon
counts 0/2 vs 1/3, `e-S:readme-<n>` edge ids with the embedded colon, doc-flow
`documentIds`, root `ownedNodeIds`, batch-size counts equal to the parse
sizes); the default store's byte-equality on BOTH paths (legacy 2-arg and
explicit `isDefault: true` — deep-equal results AND deep-equal stores); ONE
batch journal entry with putNode-before-putEdge ordering and undoDepth 1; the
cross-store invariants (disjoint node-id sets under `Promise.all`, the
foreign-id miss with no silent mutation, the INV-6 edge-id non-coincidence);
the per-store path resolution (relative-against-root, subdirectory, absolute,
the symlink/TOCTOU rejection, the `../` escape, the omitted-root ≡ explicit-cwd
byte-equality) with the corpusRoot guard's byte-pinned renderings and 198-char
cap; the NUL probe (fail-closed cannot-read, containment preceding); the `/`
containment-vacuity limitation (documented, no special-casing); the
Proxy-snapshot determinism (the mint and the gate both governed by the
snapshot, identical across runs); the F2 staging end-to-end (the wired
default UNPREFIXED, the wired non-default PREFIXED, the wired A1 interplay
supplying only the non-default names); the prefixed-echo fail-states
(doc-flow/duplicate echo the FINAL id; the empty-documentId check precedes the
prefix); and the `edit.set_edge` residue (prefix-shaped `documentIds` plantable
in the default store, exactly as §5.4's sentence documents).