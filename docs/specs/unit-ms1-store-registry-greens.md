# Unit MS1 — The Multi-Store RAG Registry: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4 item 10a). **Date: 2026-09-05.**
- **Unit:** U-MS1 — `src/main/rag-store-registry.ts`, the PURE multi-store
  registry module (the boot split, the D2 validation surface, the
  MIGRATION-LEGACY-PATH synthesis, the derived-path rules with the name-`main`
  carve-out, the byte-pinned fail-loud census F1–F13 + G-load/G-dir + LOG-1,
  and the derived-path collision detection). **Census note (updated 2026-09-05
  by the U-MS2 doc review):** the module's fail-loud census is now F1–F14 —
  F14 (the registry-file self-collision) was added to U-MS1's module by the
  U-MS2 adversarial batch (F-MS2-1, spec §3a) WITHOUT renumbering F1–F13; the
  F14 scenarios are covered by U-MS2's greens (S43) + tests 58/59, so this
  artifact's scenario census is unchanged.
- **Source contract (the ONLY derivation sources):**
  `docs/specs/unit-ms1-store-registry.md` — §5.1 (the pinned import set), §5.2
  (the exported types), §5.3/§5.3.1/§5.3.2/§5.3.3 (the three functions + the
  pinned pass order), §5.4 (the byte-pinned message census F1–F13 + the
  guards + the LOG-1 census — now F1–F14 post-F-MS2-1, see the §-Unit census
  note above), §5.5 (H1–H14), §5.6 (FS1–FS32 + the FS31/FS32
  rows + the amendment note), §5.7 (B1–B5), §5.8 (the census claims), §3a
  (the adversarial findings F-MS1-1..F-MS1-10 and their ruled fix shapes);
  plus `docs/decisions.md` **MULTI-STORE-REGISTRY** (the file, the shape, the
  boot split, the legacy path, boot-time-only mutation). Format precedent
  (structure only): `docs/specs/unit-f-w4-cache-greens.md`.
- **DERIVED FROM DOCS ONLY — implementation unread.** No `src/**` file was
  opened (the module is known to this battery only as the exported seam
  below), and `tests/unit-ms1-store-registry.test.ts` was NOT opened. The
  scenarios below were authored from the spec BEFORE any scenario was
  executed; the RESULTS section (§B) and the summary (§C) were filled in
  after.
- **Module under test (the live seam):** the three exported functions
  `implicitRegistry(registryDir)`, `resolveRegistry(parsed, registryDir)`,
  `loadRagStoreRegistry({ path })` + the exported const
  `RAG_STORE_NAME_PATTERN` — imported and CALLED at runtime from the live
  module; never read.
- **Harness:** ONE throwaway vitest runner `tests/tmp-blind-ms1-greens.test.ts`
  (a NEW file — never an edit of the SpecWriter-pinned unit test file),
  executed with the repo's own vitest (`npx vitest run
  tests/tmp-blind-ms1-greens.test.ts`, node environment). Every file-touching
  scenario uses a fresh `mkdtemp` dir under `os.tmpdir()` — the real userData
  is never touched. The log census is observed by spying
  `console.error`/`log`/`warn`/`info` per scenario; the message assertions are
  BYTE-EXACT wherever §5.4 pins the string (the `<json>` renderings are
  constructed with `JSON.stringify` per the pinned definition). The runner was
  DELETED after the run — the repo ends with NO new test files; this document
  is the artifact.
- **Platform notes:** this host is Linux (uid ≠ 0), so the FS32 FIFO sub-case
  (`mkfifo`) and the FS4 permission-denied sub-case (`chmod 0o000`) were both
  executable; the §3a F-MS1-2 darwin casefold was exercised through a
  `process.platform` STUB (`Object.defineProperty(process, 'platform', {
  value: 'darwin' })`, restored in a `finally`) — a user-level platform stub,
  not a source read. NO scenario needed Electron — the module is pure, so
  nothing was DEFERRED for environment reasons.

---

## A. The scenario table (35 executable scenarios — authored from the spec before execution)

| id | Spec pin | Scenario | Expected result |
| --- | --- | --- | --- |
| S01 | §5.5 H1; §5.7 B1/B2/B3; §5.3.1 | ABSENT registry file ⇒ `loadRagStoreRegistry` (loader) AND the direct `implicitRegistry(dir)`; a MISSING registry dir too | Exactly `{ stores: [{ name:'main', default:true, persistenceFile: '<d>/provident-rag.json' }], defaultStoreName:'main', path, implicit:true, corrupt:false }`; NO `corpusRoot` key; ZERO log lines; NO file and NO directory created (listing unchanged; the missing dir still missing) |
| S02 | §5.6 FS1; §5.4 LOG-1 | Byte-garbage file (`'{not json'`) | Fail-soft: implicit + `corrupt:true`; EXACTLY ONE `console.error` with TWO arguments — arg1 byte-pinned `[rag-store-registry] registry file unreadable (<path>); falling back to the implicit main store`, arg2 = the caught SyntaxError (text not pinned) |
| S03 | §5.6 FS2/FS3/FS4 | The unreadable family: an EMPTY file / a DIRECTORY at the path / a permission-denied file (chmod 000) | Each ⇒ the SAME fail-soft as FS1: implicit + `corrupt:true` + exactly one LOG-1 (arg1 pinned with that path, arg2 an Error) |
| S04 | §5.6 FS32; §3a F-MS1-5 | NON-REGULAR files at the path: a FIFO (`mkfifo`, no writer) and the `/dev/null` device | Fail-soft + LOG-1, and the call RETURNS (a `readFileSync` on the writer-less FIFO would block forever — the F-MS1-5 defect); `/dev/null` ⇒ registryDir `/dev`, legacy path `/dev/provident-rag.json`, arg1 pinned with `/dev/null` |
| S05 | §5.5 H14 | The corrupt-path result vs the ABSENT-file result over the SAME registry dir | Deep-equal on `stores` + `defaultStoreName`; only `corrupt` differs (`false` → `true`); the log fired only for the corrupt call |
| S06 | §5.5 H2 | One explicit store `research-2026-09` (default) | Derived `<d>/provident-rag-research-2026-09.json`; `defaultStoreName:'research-2026-09'`; `implicit:false`, `corrupt:false`; NO log; no `corpusRoot` key |
| S07 | §5.5 H3/H5; §5.3.2 | The D3 first-registry-write (`main` + `research-2026-09`); a NON-default `main` (`main`+`other`); the derived-impossibility property | `main` derives the LEGACY `<d>/provident-rag.json` (NOT `provident-rag-main.json`) in BOTH — the carve-out keys on the NAME ONLY; `other` derives `provident-rag-other.json`; two both-derived stores never collide; non-default `main` is VALID |
| S08 | §5.5 H4/H6; §5.2 verbatim pin | Explicit `persistenceFile` (deliberately non-normalized `<d>/./dotseg/../x.json`) on a `main` entry; explicit `corpusRoot` + `persistenceFile` on `scratch` | Both explicit values returned BYTE-VERBATIM (no normalization, no carve-out on an explicit path); `corpusRoot` present on the resolved store |
| S09 | §5.5 H7/H8 | `default:false` materialization + 5 stores (one flagged) | The unflagged and the explicit-`false` stores BOTH resolve `default === false`; 5 stores in REGISTRY order (no reordering); all 5 derived paths distinct; `defaultStoreName` = the flagged one |
| S10 | §5.5 H9; §5.2 | Name boundaries: a 64-char name (1+63), `a-_9`, `research-2026-09` | ALL valid (the 64-char name IS valid); derived paths embed the names; `RAG_STORE_NAME_PATTERN` accepts them |
| S11 | §5.5 H10/H11 | Unknown keys at BOTH levels (`custom`, `note`, a typo'd `persistantFile`); `version: 1.0` in JSON text | VALID — unknown keys ignored and NOT re-exposed on the resolved store; `1.0` parses to `1` and PASSES |
| S12 | §5.5 H12 | Pure equivalence: `resolveRegistry(JSON.parse(text), d)` vs the loader for the same file | Deep-equal on `stores` + `defaultStoreName`; the loader adds ONLY `path`/`implicit`/`corrupt` |
| S13 | §5.5 H13; §5.1 | Statelessness: two loads; a mutated first result; a FROZEN input | Repeated calls deep-equal; the mutation does not leak into the next call; the frozen `parsed` resolves WITHOUT throw (no input mutation) |
| S14 | §5.3.2 field-presence; §5.7 B4; §5.2 | An explicit `undefined` `persistenceFile`/`corpusRoot` (direct-JS path); the omitted-`corpusRoot` shape; the `version` drop | `undefined` ≡ ABSENCE (⇒ derived path); `corpusRoot` OMITTED (never filled with `process.cwd()`); no `embedder`/`version` key re-exposed |
| S15 | §5.6 FS5; §5.4 F1 | Top-level non-object: `null` / `[]` / `5` / `"x"` / `true` | Fail-loud F1, byte-pinned `rag-store-registry: registry must be an object` (all five) |
| S16 | §5.6 FS6/FS7; §5.4 F2 | `version` missing / `2` / `"1"` / `true` / `null` | Fail-loud F2 with `(got undefined)` / `(got 2)` / `(got "1")` / `(got true)` / `(got null)` |
| S17 | §5.6 FS8/FS9; §5.4 F3/F4 | `stores` missing / `{}` / a string; entries `null` / `[]` / `'x'` / a non-object at index 1 | Fail-loud F3 `stores must be an array`; F4 `stores[<i>] must be an object` at the entry's index |
| S18 | §5.6 FS10; §5.4 F5 | `name` missing / `''` / non-string (`5`) | Fail-loud F5 with `(got undefined)` / `(got "")` / `(got 5)` |
| S19 | §5.6 FS11; §5.4 F6; §3a F-MS1-6 | Charset violations: `Main`, `a.b`, `a:b`, `-a`, `_a`, a 65-char name; PLUS a 300-char name | Fail-loud F6 byte-pinned WITH the exact pattern source `^[a-z0-9][a-z0-9_-]{0,63}$`; the 65-char case (67 rendered chars) stays byte-INTACT (uncapped); the 300-char case renders its first 197 chars + `…` = EXACTLY 198 chars (the cap never touches validation) |
| S20 | §5.6 FS12; §5.4 F7 | `default` present-but-not-boolean: `'yes'` / `1` / `null` | Fail-loud F7 with `(got "yes")` / `(got 1)` / `(got null)` |
| S21 | §5.6 FS13/FS14; §3a F-MS1-7a | `persistenceFile` relative / `''` / non-string / NUL-byte; `corpusRoot` same four | Fail-loud F8/F9 with the offending value JSON-quoted; the NUL-byte strings (`\u0000` in the got-clause) are fail-LOUD authoring errors, not deferred fs errors |
| S22 | §5.6 FS15; §5.4 F10 | `embedder` present: `{}` / `null` / a full provider shape | Fail-loud F10 EXACTLY `per-store embedder config is not supported yet` — no prefix, no index, no name (the D2 verbatim pin) |
| S23 | §5.6 FS16; §5.4 F11 | Duplicate names (2 entries; 3 entries) | Fail-loud F11 `duplicate store name 'a'` (the first name seen twice in array order) |
| S24 | §5.6 FS17/FS18/FS19; §5.4 F12 | `stores: []` / no entry flagged / two defaults | Fail-loud F12 `(found 0)` / `(found 0)` / `(found 2)` |
| S25 | §5.6 FS20 (amended row); §5.4 F13 | Explicit-vs-explicit collision (the amended rows carry exactly one `default: true`) | Fail-loud F13 byte-pinned `persistence file collision: <d>/f.json (stores 'a', 'b')` |
| S26 | §5.6 FS21/FS22 | Derived-vs-explicit collisions in BOTH array orders | Fail-loud F13 with the EARLIER store's name first, then the current one (`'a', 'b'` in both orders), printing the CURRENT entry's resolved path |
| S27 | §5.6 FS23/FS24 | The `path.resolve`-normalized collision (`<d>/./f.json` vs `<d>/f.json`); the legacy-path collision (`main` derived vs an explicit legacy path) | Fail-loud F13 in both (resolve-normalization makes them ONE file; `stores 'main', 'x'` for FS24) |
| S28 | §5.3.2 Pass D; §3a F-MS1-2 | The platform-conditional collision KEY: case-differing explicit paths (`F.json` vs `f.json`) under a darwin platform STUB, with the linux host as the lexical control | linux ⇒ NO collision (both resolved verbatim); darwin ⇒ F13 with the ORIGINAL (non-casefolded) resolved path printed, `stores 'a', 'b'` |
| S29 | §5.6 FS25/FS26 | Precedence within Pass A: `{name:'', embedder:{}}`; Pass A before Pass B: `[{name:'a'},{name:'a',embedder:{}}]` | F5 wins over F10 (name before embedder); F10 wins over F11 (ALL Pass A checks precede the duplicate-name pass) |
| S30 | §5.6 FS27/FS28 | Precedence B-before-C (a duplicate-name registry with zero defaults); C-before-D (a zero-default registry that also collides) | F11 wins over F12; F12 `(found 0)` wins over F13 |
| S31 | §5.6 FS29/FS30; §5.4 G-load/G-dir | The caller-error guards: `loadRagStoreRegistry(null/undefined/'x'/5/[]/{}/​{path:5}/{path:''}/{path:null})`; `resolveRegistry(parsed, ''/undefined/null/5)` and the same for `implicitRegistry` | G-load `rag-store-registry: path required` (all nine); G-dir `rag-store-registry: registryDir required` (all four, both functions) |
| S32 | §5.6 FS31; §3a F-MS1-1 | The BOM strip: BOM + a VALID registry; BOM + byte garbage; a SECOND leading BOM; BOM + a valid-JSON-but-INVALID registry | (a) NORMAL load — zero log, `implicit:false`, `corrupt:false`; (b)+(c) fail-soft + LOG-1 (ONE U+FEFF stripped; a surviving BOM is still a SyntaxError); (d) the strip applies and the fail-loud F2 `(got 2)` propagates |
| S33 | §3a F-MS1-4; §5.8 | The exported pattern: frozen? source exact? tamper-proof? | `Object.isFrozen(RAG_STORE_NAME_PATTERN) === true`; `source === '^[a-z0-9][a-z0-9_-]{0,63}$'`; a tamper attempt (`pattern.test = () => true`) THROWS on the frozen export (strict mode) and validation STILL rejects `BAD` with F6 and accepts `a` |
| S34 | §3a F-MS1-3; §5.4 `<json>` | `jsonOf` totality: a cyclic `version`, a throwing-`toJSON` `version`, a cyclic non-array `stores`; a BigInt `version` (the pinned fallback `String(1n)` = `'1'` — decimal digits, NO `n` suffix); a BigInt `name` | The cyclic/throwing-toJSON cases render `String(<value>)` = `[object Object]` (NO unpinned TypeError, no `boom`); a cyclic non-array `stores` still throws the PINNED plain F3; the BigInt cases render the pinned `String()` fallback — `(got 1)` / `(got 2)` (ECMAScript `String(1n)` === `'1'`; corrected from the originally-authored `(got 1n)`/`(got 2n)` in the F-BLIND-MS1-1 reconciliation) |
| S35 | §5.7 B5; §5.6 note | The no-write-back pin with a PRESENT file: bytes before/after a VALID load; bytes before/after a CORRUPT load | BOTH loads leave the file BYTE-IDENTICAL (`Buffer.equals`); the dir listing is unchanged (no temp file, no extra file) |

---

## B. RESULTS (per scenario — the final recorded run, 2026-09-05)

Runner: `npx vitest run tests/tmp-blind-ms1-greens.test.ts` (the repo's vitest
v2.1.9, node environment). Final tally as recorded: **34 PASS / 1 FAIL / 0
DEFERRED** — after the F-BLIND-MS1-1 reconciliation (2026-09-05 proofreader
pass: the BigInt expectation misread ECMAScript `String(1n)` semantics — see
§C): **35 PASS / 0 FAIL / 0 DEFERRED**.
`<d>` below is the scenario's temp dir; `<p>` = `<d>/provident-rag-stores.json`.

| id | Result | Observed evidence (actual returned values / thrown messages) |
| --- | --- | --- |
| S01 | ✅ PASS | The loader returned exactly `{ stores: [{ name:'main', default:true, persistenceFile:'<d>/provident-rag.json' }], defaultStoreName:'main', path:'<p>', implicit:true, corrupt:false }`; `'corpusRoot' in stores[0] === false`; ZERO captured log lines; `readdirSync(d)` unchanged; neither `provident-rag.json` nor `<p>` exists after the call; the direct `implicitRegistry(d)` returned the same two-field shape (no `corpusRoot` key); the MISSING-dir variant resolved implicit/corrupt-false with `persistenceFile:'<d>/no-such-dir/provident-rag.json'` and `<d>/no-such-dir` still did not exist afterwards |
| S02 | ✅ PASS | `implicit:true, corrupt:true`, `defaultStoreName:'main'`, legacy persistence path; EXACTLY ONE `console.error` with `args.length === 2`; arg1 === the pinned `[rag-store-registry] registry file unreadable (<p>); falling back to the implicit main store`; arg2 `instanceof Error` with `name === 'SyntaxError'` |
| S03 | ✅ PASS | FS2 (empty file), FS3 (a directory at `<p>`), FS4 (chmod 0o000, EACCES): EACH returned `implicit:true, corrupt:true` with the legacy path, and (after a per-sub-case log reset) EXACTLY ONE `console.error` whose arg1 was the pinned line with THAT path interpolated and whose arg2 was an Error |
| S04 | ✅ PASS | The FIFO (`mkfifo`, no writer): the call RETURNED in milliseconds (the whole 35-test battery ran in 23 ms — a blocking `readFileSync` would have hung the runner), `implicit:true, corrupt:true` + exactly one LOG-1 (arg1 pinned with `<p>`); `/dev/null`: `statSync('/dev/null').isFile() === false`, the load returned `implicit:true, corrupt:true, path:'/dev/null'`, `persistenceFile:'/dev/provident-rag.json'`, and the second captured `console.error` arg1 was the pinned line with `/dev/null` interpolated |
| S05 | ✅ PASS | Over ONE registry dir (absent first, then byte garbage at the same path): `stores` deep-equal, `defaultStoreName` equal (`'main'`), `corrupt` false→true, `implicit:true` both, `path` equal, and EXACTLY ONE error log (the corrupt call only) |
| S06 | ✅ PASS | `stores` === `[{ name:'research-2026-09', default:true, persistenceFile:'<d>/provident-rag-research-2026-09.json' }]`; `defaultStoreName:'research-2026-09'`; `implicit:false, corrupt:false, path:<p>`; no `corpusRoot` key; zero logs |
| S07 | ✅ PASS | H3: `main` ⇒ `<d>/provident-rag.json` (NOT `provident-rag-main.json`), `research-2026-09` ⇒ `<d>/provident-rag-research-2026-09.json`, `defaultStoreName:'main'`, `implicit:false`; H5: `[{'main',default:false},{'other',default:true}]` is VALID with `main` STILL deriving `<d>/provident-rag.json`, `defaultStoreName:'other'`, and the two derived paths distinct (the derived-impossibility property) |
| S08 | ✅ PASS | The explicit `<d>/./dotseg/../explicit-main.json` was returned BYTE-VERBATIM on a `main` entry (no normalization, no carve-out); `scratch`'s explicit `persistenceFile` and `corpusRoot` (`<d>/./corpus`) were both returned exactly as written with `'corpusRoot' in store === true` |
| S09 | ✅ PASS | `names === ['alpha','beta-1','gamma_2','delta','epsilon']` (registry order); `alpha.default === false` AND `beta-1.default === false` (H7); `delta.default === true`; `defaultStoreName === 'delta'`; the 5 persistence paths were exactly the five distinct `provident-rag-<name>.json` derivations |
| S10 | ✅ PASS | The 64-char name (`'a'+'b'.repeat(63)`) resolved VALID with `persistenceFile: '<d>/provident-rag-a<62×b>.json'`; `a-_9` and `research-2026-09` valid; `RAG_STORE_NAME_PATTERN.test` accepted all three |
| S11 | ✅ PASS | Unknown keys (`custom`, `note`, `persistantFile`) ignored: the registry loaded VALID and `'custom' in stores[0] === false`; `{"version":1.0,...}` loaded VALID (`defaultStoreName:'b'`, derived path) — `1.0` parses to `1` and passes |
| S12 | ✅ PASS | `resolveRegistry(JSON.parse(text), d)` returned `stores` deep-equal to the loader's and the same `defaultStoreName`; the loader's extra fields were exactly `path`/`implicit:false`/`corrupt:false` |
| S13 | ✅ PASS | Two loads `toEqual` each other; after mutating result 1 (`stores[0].name = 'mutated'` + a push), the third call returned a fresh 1-store `main` result `toEqual` the unmutated second; the frozen `parsed` (object + `stores` + entry all `Object.freeze`d) resolved WITHOUT throw to `defaultStoreName:'a'` |
| S14 | ✅ PASS | `persistenceFile: undefined` ⇒ treated as ABSENT (derived `<d>/provident-rag-a.json`); `'corpusRoot' in store === false` with `store.corpusRoot === undefined` (never `process.cwd()`); no `embedder` key; `'version' in result === false` |
| S15 | ✅ PASS | All five triggers (`null`, `[]`, `5`, `"x"`, `true`) threw `Error` with message EXACTLY `rag-store-registry: registry must be an object` |
| S16 | ✅ PASS | `{}` ⇒ `...unsupported registry version (got undefined)`; `{version:2,...}` ⇒ `(got 2)`; `{version:"1",...}` ⇒ `(got "1")`; `{version:true,...}` ⇒ `(got true)`; `{version:null,...}` ⇒ `(got null)` — all byte-exact |
| S17 | ✅ PASS | `{version:1}` / `stores:{}` / `stores:'nope'` ⇒ `rag-store-registry: stores must be an array`; `[null]` / `[[]]` / `['x']` ⇒ `rag-store-registry: stores[0] must be an object`; a non-object at index 1 ⇒ `rag-store-registry: stores[1] must be an object` |
| S18 | ✅ PASS | `{default:true}` ⇒ `...stores[0].name must be a non-empty string (got undefined)`; `{name:''}` ⇒ `(got "")`; `{name:5}` ⇒ `(got 5)` — byte-exact |
| S19 | ✅ PASS | `Main` / `a.b` / `a:b` / `-a` / `_a` each threw EXACTLY `rag-store-registry: stores[0].name must match ^[a-z0-9][a-z0-9_-]{0,63}$ (got "<name>")` (the pattern source embedded verbatim — the `a:b` STORE-ID-PREFIX exclusion included); the 65-char name threw the FULL 67-rendered-char got-clause (uncapped); the 300-char name threw `...(got "` + 196 a's + `…)` — the 302-char rendering capped to its first 197 chars + `…` = EXACTLY 198 chars, matching the spec arithmetic, and validation still fired (the cap never touches validation) |
| S20 | ✅ PASS | `default:'yes'` ⇒ `...stores[0].default must be a boolean (got "yes")`; `default:1` ⇒ `(got 1)`; `default:null` ⇒ `(got null)` — byte-exact |
| S21 | ✅ PASS | F8 for `rel.json` / `''` / `5` / `<d>/a\u0000b.json` and F9 for `rel/dir` / `''` / `5` / `<d>/c\u0000d` — each with the offending value JSON-quoted in the got-clause (the NUL byte rendering as the `\u0000` escape, per the pinned `JSON.stringify` definition); the NUL cases are fail-LOUD (F-MS1-7a), not deferred fs errors |
| S22 | ✅ PASS | `embedder:{}` / `embedder:null` / a full provider shape EACH threw the EXACT 47-char message `per-store embedder config is not supported yet` — no prefix, no index, no name |
| S23 | ✅ PASS | `[{name:'a',default:true},{name:'a'}]` ⇒ `rag-store-registry: duplicate store name 'a'`; `[{name:'b',default:true},{name:'a'},{name:'a'}]` ⇒ the same `'a'` (the first name seen twice in array order) |
| S24 | ✅ PASS | `stores:[]` ⇒ `...exactly one store must have default: true (found 0)`; two unflagged entries ⇒ `(found 0)`; two defaults ⇒ `(found 2)` — byte-exact |
| S25 | ✅ PASS | The amended row (exactly one `default: true`) threw EXACTLY `rag-store-registry: persistence file collision: <d>/f.json (stores 'a', 'b')` |
| S26 | ✅ PASS | FS21 (earlier DERIVED vs later explicit) ⇒ `...collision: <d>/provident-rag-a.json (stores 'a', 'b')`; FS22 (earlier EXPLICIT vs later derived, reverse order) ⇒ `...collision: <d>/provident-rag-b.json (stores 'a', 'b')` — the earlier store's name first in both |
| S27 | ✅ PASS | FS23: `<d>/./f.json` collided with `<d>/f.json` (resolve-normalized) ⇒ `...collision: <d>/f.json (stores 'a', 'b')`; FS24: the `main`-derived legacy path vs an explicit legacy path ⇒ `...collision: <d>/provident-rag.json (stores 'main', 'x')` |
| S28 | ✅ PASS | linux control: NO throw — both stores resolved verbatim (`.../F.json`, `.../f.json`); with `process.platform` STUBBED to `darwin`: the same registry threw EXACTLY `rag-store-registry: persistence file collision: <d>/f.json (stores 'a', 'b')` — the collision fired on the casefolded KEY while the message printed the ORIGINAL (non-casefolded) resolved path, exactly as §5.3.2 Pass D pins; the platform property was restored in `finally` |
| S29 | ✅ PASS | FS25: `{name:'', embedder:{}}` threw the F5 message `(got "")` — name before embedder; FS26: `[{name:'a'},{name:'a',embedder:{}}]` threw EXACTLY `per-store embedder config is not supported yet` — ALL Pass A checks precede Pass B |
| S30 | ✅ PASS | FS27: `[{name:'a'},{name:'a'}]` threw `duplicate store name 'a'` (F11 before the F12 found-0); FS28: a zero-default registry whose `b`/`c` entries collide threw `...(found 0)` — Pass C precedes Pass D |
| S31 | ✅ PASS | All nine caller errors (`null`, `undefined`, `'x'`, `5`, `[]`, `{}`, `{path:5}`, `{path:''}`, `{path:null}`) threw EXACTLY `rag-store-registry: path required`; `resolveRegistry` and `implicitRegistry` with `''`/`undefined`/`null`/`5` each threw EXACTLY `rag-store-registry: registryDir required` |
| S32 | ✅ PASS | (a) BOM + valid ⇒ a NORMAL load: `implicit:false, corrupt:false`, the legacy persistence path, ZERO logs; (b) BOM + `{not json` ⇒ fail-soft + exactly one LOG-1; (c) `\uFEFF\uFEFF` + valid ⇒ fail-soft + exactly one LOG-1 (ONE leading BOM stripped; the surviving BOM is still a SyntaxError); (d) BOM + `{"version":2,...}` ⇒ the fail-loud F2 `(got 2)` propagated (the strip applies before parse, validation still aborts) |
| S33 | ✅ PASS | `Object.isFrozen(RAG_STORE_NAME_PATTERN) === true`; `RAG_STORE_NAME_PATTERN.source === '^[a-z0-9][a-z0-9_-]{0,63}$'`; the tamper attempt `pattern.test = () => true` THREW on the frozen export (strict-mode assignment) — tamperOutcome `'threw'`; validation STILL threw the exact F6 for `BAD` and still accepted `a` |
| S34 | ✅ PASS (reconciled — F-BLIND-MS1-1) | THREE of the five sub-cases conform: the cyclic `version` threw `rag-store-registry: unsupported registry version (got [object Object])` and the throwing-`toJSON` `version` threw the SAME pinned fallback (the `'boom'` TypeError did NOT surface — totality holds); a cyclic non-array `stores` still threw the PINNED plain `rag-store-registry: stores must be an array`. The BigInt sub-cases OBSERVED `...(got 1)` — originally scored as a deviation from an expected `(got 1n)`, but ECMAScript `String(1n)` === `'1'` (BigInt::ToString renders the decimal digits WITHOUT the `n` suffix), so the module's render IS the pinned `String(<value>)` fallback and CONFORMS; the expectation was the drift. Reconciled 2026-09-05; the landed unit test 54 (`tests/unit-ms1-store-registry.test.ts`) pins exactly `f2('1')` for `{version: 1n}` |
| S35 | ✅ PASS | After the VALID load the file bytes were `Buffer.equals`-identical to the snapshot and the dir listing unchanged; after the CORRUPT load (`{not json`) the corrupt file's bytes were likewise byte-identical and its dir listing unchanged — zero writes in both paths (B5; B2's absent-file half held in S01) |

---

## C. Summary + findings

**35 PASS / 0 FAIL / 0 DEFERRED after the F-BLIND-MS1-1 reconciliation**
(35 executable scenarios; nothing needed Electron — the module is pure, so
no scenario was deferred for environment reasons; the FS32 FIFO, the FS32
`/dev/null` and the FS4 chmod-000 sub-cases all executed on this Linux host).
The run as recorded was **34 PASS / 1 FAIL / 0 DEFERRED**; the one FAIL
(F-BLIND-MS1-1) was reconciled on 2026-09-05 — the module's BigInt render
`(got 1)` IS the pinned `String(<value>)` fallback (`String(1n)` === `'1'`
per ECMAScript BigInt::ToString,
<https://tc39.es/ecma262/#sec-numeric-types-tostring>), so the recorded
expectation `(got 1n)` was the drift, not the module. Not a silent flip: the
reconciliation evidence is below.

### F-BLIND-MS1-1 (recorded FAIL → RECONCILED PASS on 2026-09-05 — the drift was in the greens expectation, not the module)

- **What the spec pins:** §5.4 defines `<json>` = `JSON.stringify(<value>)`
  and pins the F-MS1-3 totality fallback as `String(<value>)` for the three
  throwing-`JSON.stringify` classes (BigInt, cyclic, throwing-`toJSON`);
  §3a F-MS1-3's ruled fix shape says "BigInt/cyclic inputs now yield the
  pinned F-message with a **String()-ified** value". For a BigInt `version`
  that is `String(1n)` — which per ECMAScript BigInt::ToString
  (<https://tc39.es/ecma262/#sec-numeric-types-tostring>; `BigInt::toString(10)`
  returns the decimal digits, and the `n` exists only in BigInt literal SOURCE
  syntax, never in a runtime string conversion) === `'1'`, so the pinned F2
  message is `rag-store-registry: unsupported registry version (got 1)`. The
  originally-authored expectation `(got 1n)` misread this; §5.4 now carries an
  explicit clarifying sentence (the proofreader's reconciliation amendment).
- **What the live module renders:** `...(got 1)` — the BigInt rendered as its
  decimal digits, WITHOUT the `n` suffix — which is EXACTLY the pinned
  `String(<value>)` fallback: the module's `jsonOf` catch arm is literally
  `String(value)` (`src/main/rag-store-registry.ts`, the F-MS1-3 fallback), so
  its BigInt render IS `String(1n)` === `'1'`. The F5 got-clause for a BigInt
  `name` behaves identically (`{name: 2n}` ⇒ observed `(got 2)` =
  `String(2n)` — diagnostic probe run against the same live module): also
  CONFORMANT. (The one-liner `node -e "console.log(String(1n))"` prints `1`;
  this audit pass could not execute it — no shell — but the semantics are
  pinned by ECMAScript §sec-numeric-types-tostring and corroborated by the
  module's own landed regression test 54, which asserts exactly `f2('1')`.)
- **Characterization (black-box):** a `123456789012345678901234567890n`
  version renders the FULL decimal digits (not an exponential `Number()`
  form), so the BigInt path is a ToString-without-suffix rendering (the
  `${value}` shape), not a `Number()` conversion; cyclic structures and
  throwing-`toJSON` values DO render the pinned `String()` fallback
  (`[object Object]`), and NO unpinned TypeError surfaces anywhere — the
  F-MS1-3 totality defect itself is fixed; the drift is confined to the
  BigInt rendering. Validation is UNAFFECTED (`1n` still fails F2 fail-loud;
  the message is still the pinned F2 shape apart from the got-clause digits).
- **Severity / routing (resolved):** LOW (adversarial-hardening message
  cosmetics on an out-of-JSON-contract input class — a BigInt cannot appear in
  a parsed registry file), but the message census is BYTE-PINNED and
  §5.4/§3a are explicit about the fallback, so the finding was recorded as a
  FAIL, not reinterpreted. **Resolution (2026-09-05 proofreader/doc-review
  pass): RECONCILED AS CONFORMANT — no code change.** The module's rendering
  already IS `String(<value>)` (ECMAScript `String(1n)` === `'1'`); the greens
  expectation `(got 1n)` was the sole drift. Spec §5.4 gained the one-sentence
  BigInt clarification; the landed unit tests 54–55
  (`tests/unit-ms1-store-registry.test.ts`) pin the reconciled rendering.
- **Out-of-contract context (NOT a scenario, NOT asserted):** a diagnostic
  probe also observed that a `Symbol` or a function `version` renders
  `(got undefined)` — consistent with the F-MS1-10 JSON-parse-shaped-inputs
  precondition (symbols/functions cannot come from `JSON.parse`), so nothing
  here claims them.

### Harness-fix disclosure (per the W4 precedent)

The battery's FIRST recorded run reported 5 failures; FOUR were
harness-authoring mechanics, not contract claims, and were corrected before
the final recorded run above: (1)/(2) the S03/S32 sub-cases asserted a
CUMULATIVE error-log count across a scenario's sub-cases instead of
resetting per sub-case; (3) S05 compared the corrupt-path result against an
absent-file result from a DIFFERENT temp dir, which made H14's deep-equality
unsatisfiable by construction (the derived persistence path embeds the
registry dir); (4) S19's expected capped rendering carried an extra closing
quote — the live module's cap arithmetic (`"` + 196 name chars + `…` = 198
chars, no closing quote) matches §5.4 exactly. The FIFTH failure was
F-BLIND-MS1-1, which did NOT stand after the 2026-09-05 reconciliation — the
module's render IS the pinned `String(<value>)` fallback (ECMAScript
`String(1n)` === `'1'`); the expectation `(got 1n)` was the drift (see §C).
No contract claim was changed between the two runs; the final recorded tally
is the one in §B (34/1 as run, 35/0 after reconciliation).

### What held (zero findings after the F-BLIND-MS1-1 reconciliation)

Every other documented pin held byte-exact against the live module: the
three boot outcomes (S01 absent/silent/no-write; S02–S04 the fail-soft family
with the pinned 2-argument LOG-1 incl. the FIFO and `/dev/null` isFile probe
— the F-MS1-5 hang defect is hardened; S06–S08 the file-derived registries
with the legacy `main` carve-out and verbatim explicit paths); the FULL
byte-pinned census F1–F13 + G-load/G-dir (S15–S27, S31 — the F1–F13 range as
this battery ran it; the module's census is now F1–F14 with F14 added by the
U-MS2-cycle F-MS2-1 batch, verified there) incl. the F6 pattern
source, the F10 verbatim D2 message, and the F13 earlier/current name order;
the 198-char render cap with the 65-char case byte-intact (S19); the NUL-byte
rejections (S21); the pass precedence chain A→B→C→D (S29/S30); the
platform-conditional collision key via the darwin stub with the original path
printed (S28); the BOM strip family incl. the surviving-BOM SyntaxError and
the fail-loud BOM+invalid case (S32); the frozen tamper-proof export (S33);
the jsonOf totality fallback incl. the BigInt decimal-digit render and the
198-char cap arithmetic (S19/S34 — S34 reconciled, see F-BLIND-MS1-1); the
no-write-back byte-equality rows B1–B5 (S01/S14/S35); and the
statelessness/purity pins incl. the frozen-input no-throw (S12/S13).