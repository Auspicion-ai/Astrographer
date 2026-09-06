# Spec — Unit MS1: The Multi-Store RAG Registry (Pure Module)

- **Status:** SPEC (the multi-document-store Phase-1 slice, Unit U-MS1 of 5 —
  the FIRST unit in the pinned execution order U-MS1 → U-MS2 → U-MS4 → U-MS3 →
  U-MS5). Gate reference: `docs/feature-requests/multi-document-store-config.md`
  (USER-APPROVED 2026-09-05) → `docs/specs/multi-document-store-config-review.md`
  §2 (decisions D1–D12), §3 (the unit decomposition table — the U-MS1 row),
  §4 (the zero-config byte-equality table, binding per A4), §8 (amendments
  A1–A10; A7 binds this unit), §5 R4 (the corruption-split red tests). Decision
  rows: `docs/decisions.md` **MULTI-STORE-REGISTRY**, **SINGLE-WRITER-STORE-PER-STORE**,
  **ENGINE-PER-STORE**, **STORE-QUALIFIED-BROADCAST**, **STORE-ID-PREFIX**,
  **IMPORT-ROOT-PER-STORE**, **VECTOR-TOPOLOGY-PER-STORE**,
  **UI-SELECTOR-DEFERRED** (all landed 2026-09-05).
- **Scope:** ONE NEW PURE module `src/main/rag-store-registry.ts` (no Electron
  imports — the Electron wiring passes the userData path; module-store idiom,
  sibling of `src/main/security-store.ts` / `src/main/operator-settings-store.ts`):
  the `RagStoreConfig`/loaded-registry types; the load + sanitize/validate
  functions (all D2 rules); the implicit-entry synthesis (MIGRATION-LEGACY-PATH);
  the persistence-path derivation rules including the name-`main` legacy
  carve-out; the invalid-registry fail-loud error set (byte-pinned messages);
  the Phase-1 embedder-shape rejection message; the corrupt-file fail-soft
  path + its pinned log line; and the derived-path collision detection (two
  stores resolving to one persistence file over derived ∪ explicit). This unit
  does NOT wire `main.ts` (U-MS2), does NOT own the UI presentation-view IPC
  type (`RagStoreListingPayload` in `src/shared/types.ts` is U-MS5's), does NOT
  touch the RAG stores or engines, and adds NOTHING to `src/shared/types.ts`.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/rag-store-registry.ts`
  from §5.5/§5.6 (plus the §5.7 byte-equality acceptance rows) before any
  implementation, into the SpecWriter-pinned test file
  `tests/unit-ms1-store-registry.test.ts` (§6).

---

## 1. What the proposal asks

The multi-store proposal (`docs/feature-requests/multi-document-store-config.md`)
needs an operator-authored, server-side registry of N independent RAG corpora.
For U-MS1, the reviewed Phase-1 slice (review §2 D2/D3/D8, §3 U-MS1 row) asks for:

1. **A NEW registry file** `provident-rag-stores.json` in Electron userData
   (D2) — a server-side, operator-owned JSON file, NOT an `OperatorSettings`
   field (D2 explicitly REJECTS that home: that store's corrupt→defaults
   fallback, `operator-settings-store.ts:53-63`, would silently drop the
   registry and orphan data files). Shape
   `{ version: 1, stores: RagStoreConfig[] }` with
   `RagStoreConfig = { name, default?, persistenceFile?, corpusRoot?, embedder? }`.
2. **A PURE module** `src/main/rag-store-registry.ts` owning the load +
   sanitize/validate of that file — no Electron imports (the wiring passes the
   userData path, exactly how `main.ts:93-95` and `main.ts:132-134` hand
   `join(app.getPath('userData'), …)` paths to the sibling stores) — so the
   whole D2 validation surface is node-testable without Electron.
3. **The full D2 validation rule set:** unique non-empty names per the charset
   `/^[a-z0-9][a-z0-9_-]{0,63}$/`; exactly one `default: true`; no two stores
   resolving to the same persistence file (over derived ∪ explicit); absolute
   `corpusRoot`/`persistenceFile` when present; and `embedder` REJECTED in
   Phase 1 with the fail-loud message "per-store embedder config is not
   supported yet" (silent-ignore is the classic config trap — D2's own
   rationale).
4. **The boot split (D2):** a corrupt/unreadable registry file ⇒ fail-soft
   (the implicit main entry + a pinned log line); a valid-JSON-but-invalid
   registry ⇒ fail-LOUD abort before the window (the precedent is the vector
   config-missing abort, `main.ts:156-158`) — "a silently-ignored registry
   would run with different stores than the operator believes".
5. **MIGRATION-LEGACY-PATH (D3):** an ABSENT registry file ⇒ the registry is
   the implicit entry `{ name: 'main', default: true }` whose persistence file
   is the legacy `provident-rag.json` (`main.ts:118-120`) — SYNTHESIZED AT
   BOOT, NEVER written back to disk (zero-config stays byte-equal: no new file
   on disk). The name-`main` derivation rule carries over to an EXPLICIT entry
   named `main` without `persistenceFile`, so the zero-friction first registry
   write `[{name:'main',default:true},{name:'research-2026-09',…}]` preserves
   all existing data (D3).
6. **Derived paths (D2/D3):** an omitted `persistenceFile` derives
   `provident-rag-<name>.json` (except name `main` → the legacy
   `provident-rag.json`); an omitted `corpusRoot` means `process.cwd()` AT
   IMPORT TIME (`markdown-import.ts:66`) — the registry module NEVER fills cwd
   in.
7. **Registry mutation is BOOT-TIME-ONLY (D8):** the module exposes no
   mutation/reload API; the loaded registry is a plain stateless snapshot.

## 2. Feasibility verdict

**Feasible — grounded entirely in existing host primitives; no engine gap.**

- **The module-store idiom is established** and this module is its sibling:
  `{ path }` options + load-on-boot discipline (`security-store.ts:58-71`,
  `module-store.ts:93-123`), the `path required` guard idiom
  (`template-store.ts:74-76`), atomic temp+rename writes where writes exist
  (`template-store.ts:101-111`, `module-store.ts:130-142`), and the
  `[security-store] persist failed (${opts.path}):` log wording
  (`security-store.ts:82`) that this module's one log line mirrors. U-MS1
  needs NO write path at all (D3/D8) — see §3 gap 2.
- **The fail-LOUD precedent exists:** the vector config-missing abort throws
  inside `main()` before the window (`main.ts:156-158`); the invalid-registry
  abort propagates the same way (the wiring itself is U-MS2).
- **The zero-config anchors are verified:** the legacy store path
  `join(app.getPath('userData'), 'provident-rag.json')` (`main.ts:119`) and
  the import corpus-root default `resolve(params.corpusRoot ?? process.cwd())`
  (`markdown-import.ts:66`) — the implicit entry reproduces both byte-equal
  without touching either file.
- **The pure-validation surface is self-contained:** regex charset test,
  `path.isAbsolute`/`join`/`dirname`/`resolve`, `JSON.parse` — all node
  builtins; the module imports no Electron, no store, no engine.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The NEW pure registry module (load + validate + resolve + synthesize) | Project-specific (composes `node:fs`/`node:path` in the established module-store idiom) | Low cost; the entire multi-store config surface becomes node-testable before any Electron wiring exists. |
| The fail-LOUD-on-invalid boot split is a deliberate divergence from the sibling idiom (`operator-settings-store.ts:53-63` silently falls back to defaults; `security-store.ts:58-71` likewise) | Project-specific (D2's explicit split + the REJECTED note) | An operator typo in the registry aborts boot instead of silently running different stores. That is the intended cost: the alternative is silently-orphaned data files (D2). |
| NO persist path — a second deliberate divergence (every sibling store writes through; this module never writes) | Project-specific (D3 "never written back", D8 boot-time-only) | Zero cost; the no-write property is structural (the module does not import a write primitive — §5.1), not merely conventional. |
| Unknown-key tolerance (top-level and per-entry keys other than the pinned fields are ignored) | Project-specific (D2 pins ONLY the enumerated rules; no other key carries a Phase-2 meaning) | A typo'd key (e.g. `persistantFile`) is silently ignored — but a typo'd `default` still fails the exactly-one-default rule and a typo'd `persistenceFile` still derives a visible file (U-MS5's listing surfaces it). The adversarial pass may propose a stricter unknown-key rejection; NOT pinned here (see §3a). |
| `default` present-but-not-boolean is rejected (a spec-level tightening of "exactly one `default: true`") | Project-specific | Zero cost; closes the truthiness trap (`default: 'yes'` silently counting as non-default would leave a registry with zero real defaults reported as "no defaults" — fail-loud either way, but the entry-shape message is more precise). |
| `registryDir` absoluteness is a documented precondition, not validated | Project-specific (matches the sibling stores, which never validate `opts.path` absoluteness either) | The wiring contract (U-MS2) passes `join(app.getPath('userData'), 'provident-rag-stores.json')` — absolute by construction. |

No engine gap. The module is entirely host-side, pure, and node-testable.

### 3a. Adversarial findings (registered 2026-09-05 — the U-MS1 adversarial pass + the Architect's ruled fix batch)

The RCA-3 read-only adversarial pass on the U-MS1 green returned 15 findings
(F-MS1-1..F-MS1-15). The Architect ruled: **FIXED-WITH-REGRESSION** for
F-MS1-1..7a (the fix batch below — each landed with a red-first regression
test, tests 47–63 of `tests/unit-ms1-store-registry.test.ts`),
**DOC-REVIEW** for F-MS1-8/F-MS1-10 (the spec-only amendments applied in the
same pass), **RECORDED-NO-CHANGE** for F-MS1-11..13/15, **NOTED** for
F-MS1-14, **RESOLVED-BY-RECONCILIATION** for F-MS1-9 (the tracker finding —
transcribed + reconciled by the 2026-09-05 doc-review pass; see the F-MS1-9
row and §5.9's reconciliation note). Red-first record (RCA-1): tests 47–63 were written and run RED
against the PRE-FIX module BEFORE any fix — 10 failed (47, 50, 51, 52, 54,
55, 56, 58, 60, 61), 6 passed as regression guards pinning behavior the
module already had correct (48, 49, 53, 57, 59, 62), and test 63 (the FIFO
case) HUNG the pre-fix module inside `readFileSync` — the F-MS1-5 defect
itself (the worker cannot be interrupted; the run was killed at the wall
clock). After the fix batch: 63/63 green.

| id | sev | problem (one line) | concrete input | ruling + fix shape as ruled |
| --- | --- | --- | --- | --- |
| F-MS1-1 | MEDIUM | A BOM-prefixed VALID registry fails soft to the implicit main entry instead of loading. | file bytes `\uFEFF{"version":1,"stores":[{"name":"main","default":true}]}` ⇒ LOG-1 + implicit/corrupt (wrong: should load normally) | **FIXED-WITH-REGRESSION** — strip exactly ONE leading U+FEFF after the read, before `JSON.parse`; a BOM inside the JSON is still a SyntaxError ⇒ fail-soft (§5.3.3 step 4; new row FS31; tests 47–49). |
| F-MS1-2 | MEDIUM | Pass D's lexical collision key misses case-insensitive filesystems — case-differing paths are ONE file on darwin/win32 but resolve VALID. | `resolveRegistry({version:1,stores:[{name:'a',default:true,persistenceFile:'<d>/F.json'},{name:'b',persistenceFile:'<d>/f.json'}]}, <d>)` ⇒ no F13 | **FIXED-WITH-REGRESSION** — the collision key becomes platform-conditional via the internal const `CASE_INSENSITIVE_FS_PLATFORMS` (`['darwin','win32']`): the resolved path CASEFOLDED (`.toLowerCase()`) there, lexical elsewhere; the F13 message still prints the ORIGINAL resolved path. Symlink identity remains invisible; realpath identity is NOT added in Phase 1 (documented limitation, §5.3.2 Pass D; tests 50–53). |
| F-MS1-3 | LOW | `jsonOf` is PARTIAL — a throwing `JSON.stringify` (BigInt/cyclic/throwing-`toJSON`) surfaces an unpinned TypeError and breaks the byte-pinned census. | `resolveRegistry({version:1n,stores:[]}, <d>)` ⇒ TypeError, not the pinned F2 | **FIXED-WITH-REGRESSION** — `jsonOf` made TOTAL: `try { JSON.stringify(v) } catch { return String(v) }` (the pinned `undefined` special case kept); BigInt/cyclic inputs now yield the pinned F-message with a String()-ified value (§5.4; tests 54–55). |
| F-MS1-4 | LOW | The exported `RAG_STORE_NAME_PATTERN` is mutable — a tampered export would redirect validation. | a module consumer running `RAG_STORE_NAME_PATTERN.test = () => true` (or any own-property shadow) would wave every name through | **FIXED-WITH-REGRESSION** — `Object.freeze` the export AND validate against an INTERNAL frozen copy (the export stays for consumers; validation never reads the export) (§5.3/§5.8; tests 56–57). |
| F-MS1-5 | LOW | A FIFO/device at the registry path hangs boot inside `readFileSync`. | `mkfifo provident-rag-stores.json` then `loadRagStoreRegistry({path})` ⇒ `readFileSync` blocks forever (no writer) | **FIXED-WITH-REGRESSION** — probe `statSync(path).isFile()` BEFORE `readFileSync`; a non-regular file ⇒ the fail-soft path (implicit main entry + LOG-1), matching the corrupt-file discipline; a probe failure (stat race) ⇒ fail-soft as pinned (§5.3.3; new row FS32; tests 62–63 — the FIFO test HANGS the pre-fix module). |
| F-MS1-6 | LOW | `jsonOf` echoes unbounded values into the pinned messages. | a 300-char store name ⇒ a 302-char `<json>` embedded in F6 | **FIXED-WITH-REGRESSION** — cap the RENDERING at 200 chars (first 197 + `…` = exactly 198 chars); the cap never touches validation; the byte-pinned 65-char F6 case (67 chars) stays byte-intact (§5.4 `<json>` definition; tests 58–59). |
| F-MS1-7a | LOW | NUL-byte paths pass F8/F9 and defer to a deferred fs error at store-open. | `persistenceFile: '<d>/a\u0000b.json'` / `corpusRoot: '<d>/c\u0000d'` resolve VALID | **FIXED-WITH-REGRESSION (partial)** — F8/F9 ALSO reject any string containing `\u0000` (same message shapes). Lone surrogates + >PATH_MAX paths NOT rejected — documented limitation (the failure defers to the first fs operation at store-open; spec-gap note, no code change) (§5.3.2; FS13/FS14 example lists extended; tests 60–61). |
| F-MS1-8 | LOW | Census drift: §5.3/§5.8 say ONE internal helper; the module has TWO (`jsonOf` is undocumented). | the module source defines `jsonOf` + `derivePersistenceFile` against §5.8 "Non-exported internals: 1" | **DOC-REVIEW** — §5.3/§5.8 amended to TWO internal helpers (`jsonOf`, `derivePersistenceFile` — `jsonOf` is the §5.4 `<json>` renderer) + the internal `CASE_INSENSITIVE_FS_PLATFORMS` const row. |
| F-MS1-9 | INFO (tracker) | The four decision rows this unit pins (spec §5.9: REGISTRY-BOOT-SPLIT, REGISTRY-DERIVED-PATHS, REGISTRY-NO-WRITE, REGISTRY-CWD-TRANSPARENCY) were absent from `docs/decisions.md` at adversarial time. | spec §5.9's "added when the unit lands" four-row list vs `docs/decisions.md` (no REGISTRY-* rows existed at adversarial time) | **RESOLVED-BY-RECONCILIATION** — the 2026-09-05 doc review amends §5.9 to record the four pins WITHIN the landed **MULTI-STORE-REGISTRY** decision row (named as its sub-pins, with an explicit reconciliation sentence); four separate `docs/decisions.md` rows were NOT landed, avoiding duplication. |
| F-MS1-10 | INFO | `resolveRegistry` is only consistent-read-safe for JSON-shaped inputs; a getter/Proxy input can present different values per pass (worst case `undefined` ⇒ derived `provident-rag-undefined.json`). | a Proxy presenting a different `version` value per property read (JSON.parse output is safe; the direct-JS path IS a supported contract — test 16) | **DOC** — the §5.3 JSON-shaped-input note (the F-MS1-10 amendment) pins "inputs must be JSON-parse-shaped" (getters/Proxies may present different values per pass and are OUT of contract). The note LANDED in §5.3 — verified by the 2026-09-05 doc review. |
| F-MS1-11 | INFO | Absence-classification edges behave consistently and stay deliberate. | a file deleted between the `existsSync` probe and the read logs as corrupt (TOCTOU, benign, fail-soft); an ancestor-is-a-file path (ENOTDIR) and a symlink loop both read as ABSENT (implicit, silent) — unreachable under the userData wiring | **RECORDED-NO-CHANGE** (per the Architect ruling). |
| F-MS1-12 | INFO | LOG-1 hygiene: arg2 can carry ~26 chars of registry-file content (V8 SyntaxError snippets — spec-sanctioned, arg2 NOT byte-pinned); arg1 embeds `opts.path` verbatim (wiring-controlled by U-MS2, not registry-controlled). | a corrupt registry file whose V8 SyntaxError snippet quotes ~26 chars of file content into LOG-1's unpinned second argument; arg1 carries `opts.path` verbatim | **RECORDED-NO-CHANGE** (per the Architect ruling). |
| F-MS1-13 | INFO | Duplicate JSON keys are last-wins (JSON.parse semantics). | `{"version":2,"version":1,"stores":[…]}` loads as version 1; a duplicated `name` uses the last — spec-silent standard behavior | **RECORDED-NO-CHANGE** (per the Architect ruling). |
| F-MS1-14 | INFO | 10,000-store registry performance: all passes are O(n) (the anchored regex tests are stateless; one Set, one filter, one Map; no O(n²) collision scan); 10k stores resolve in low tens of ms (derived from structure; unmeasured — no shell in the adversarial session). | a 10,000-entry valid registry (charset-unique names, exactly one default) through `resolveRegistry` | **NOTED** (per the Architect ruling — no DoS). |
| F-MS1-15 | INFO | Hard-won invariants recorded so they are not re-litigated: (a) trailing-newline name smuggling does NOT work (JS `$` does not match before a trailing `\n`); (b) no prototype pollution (JSON `__proto__` lands as an own data property; the module never spreads/assigns parsed objects); (c) the charset-valid name `'constructor'` cannot hit a prototype lookup inside this module (Set/Map only) — DOWNSTREAM PIN: U-MS2's directory must stay Map-keyed by name, never a plain object; (d) frozen inputs are safe (the module writes only to its own locals); (e) Unicode homoglyph/NFKC/case-fold name collisions are dead-ends (ASCII-only charset); (f) `version:1e0` parses to 1 and passes (the pinned F2 carve-out). | the six probes: a `name` ending in a trailing `\n` (the regex `$`); a parsed registry carrying `__proto__`; `name:'constructor'`; a frozen parsed input; homoglyph/NFKC/case-fold name pairs; `{version:1e0,…}` | **RECORDED** (per the Architect ruling) — the (c) downstream pin verified 2026-09-05 against `docs/specs/unit-ms2-store-wiring.md` §5.1: the directory is pinned `entries: ReadonlyMap<string, RagStoreEntry>` (Map-keyed by name, never a plain object) — CONFIRMED, no U-MS2 amendment needed. |

Note (2026-09-05, the documentation-review pass — the transcription COMPLETED):
the pending rows for F-MS1-9 and F-MS1-11..F-MS1-15 are now transcribed
VERBATIM from the adversarial report (supplied by the supervisor at doc-review
time; the implementer's pending-transcription placeholders replaced in place —
NOTHING was invented). F-MS1-10's already-transcribed row was amended to the
report's census (severity LOW → INFO — the report's tally is 2 MEDIUM / 6 LOW /
7 INFO) with the report's full problem/worst-case content. Every §3a row now
carries id, severity, problem, concrete input, ruling, disposition.

### 3b. Proposal-review findings (the amendments this unit folds in)

- **A4 (binding):** the review's §4 zero-config byte-equality itemization is
  binding acceptance criteria. The rows this unit owns are pinned in §5.7
  (the implicit-entry synthesis + the no-write-back pin).
- **A7:** registry validation pins the name charset, exactly one default, the
  persistence-file collision over derived ∪ explicit, absolute
  `corpusRoot`/`persistenceFile`, the Phase-1 embedder rejection, and the
  corrupt-vs-invalid boot split (R4) — all enumerated in §5.3.2/§5.6.
- **R4:** two specific red tests — byte-garbage file ⇒ implicit main entry +
  pinned log; well-formed JSON failing validation ⇒ boot abort (§5.6 FS1/FS5).
- **STORE-ID-PREFIX support (D4/A1):** the name charset excludes `:` — this
  module's validation is what guarantees no registry name can collide with the
  `<name>:` id-prefix namespace U-MS4 mints (§5.6 FS17 pins it).
- **VECTOR-TOPOLOGY-PER-STORE (D6(e), Phase-2-effective):** the Phase-2
  embedder shape (`Omit<EmbeddingProviderConfig,'apiKey'> & { apiKeyEnv?:
  string }`, base `embeddings.ts:36-47`) is pinned for Phase 2; Phase 1
  rejects ANY `embedder` value (F10) — the rejection message disappears only
  when Phase 2 lands its own spec.
- **A9/A10 context (cited, not owned):** no store-census MCP tool and
  unknown-store errors echoing only the caller's input are U-MS2's contract
  (`docs/specs/unit-ms2-store-wiring.md`); the registry module exposes no MCP
  surface at all.

## 4. Design decisions pinned by this spec

- **REGISTRY-BOOT-SPLIT (new):** exactly three load outcomes exist —
  **absent file** ⇒ implicit synthesis, no log; **corrupt/unreadable file**
  ⇒ implicit synthesis + the pinned `console.error` (fail-soft); **present
  but invalid** ⇒ the byte-pinned `Error` propagates out of the loader (the
  fail-loud abort-before-window). Nothing else is reachable.
- **REGISTRY-DERIVED-PATHS (new):** `derivePersistenceFile(name, registryDir)`
  = `join(registryDir, 'provident-rag.json')` when `name === 'main'`, else
  `join(registryDir, 'provident-rag-' + name + '.json')`. The `main` carve-out
  keys on the NAME ONLY (not on the default flag, not on implicitness) —
  MIGRATION-LEGACY-PATH (D3).
- **REGISTRY-NO-WRITE (new):** the module performs ZERO disk writes — no
  persist, no mkdir, no temp+rename; the implicit entry is never written back
  (D3); registry mutation is boot-time-only and the module exposes no mutation
  API (D8). Structural enforcement: the module's import set contains no write
  primitive (§5.1).
- **REGISTRY-CWD-TRANSPARENCY (new):** an omitted `corpusRoot` stays omitted
  on the resolved store — the module NEVER resolves it to `process.cwd()`;
  the importer's cwd default (`markdown-import.ts:66`) applies at import time.
  This is what keeps the zero-config import root byte-equal (review §4 row
  "Import root").
- **Consumed decision rows (implemented by this unit):**
  **MULTI-STORE-REGISTRY** (the file, the shape, the boot split, the legacy
  path, boot-time-only mutation — `docs/decisions.md` row MULTI-STORE-REGISTRY,
  sourced from review §2 D2/D3/D8). Consumed with U-MS-sibling ownership:
  **SINGLE-WRITER-STORE-PER-STORE** + **ENGINE-PER-STORE** (U-MS2 — this unit
  touches no store/engine), **STORE-ID-PREFIX** (U-MS4 — this unit supplies
  the colon-free charset), **STORE-QUALIFIED-BROADCAST** (U-MS3),
  **IMPORT-ROOT-PER-STORE** (U-MS2/U-MS4 — this unit preserves `corpusRoot`
  verbatim), **VECTOR-TOPOLOGY-PER-STORE** (Phase-2-effective; Phase 1's
  contribution is the embedder rejection + the A6 lexical-only pin, cited),
  **UI-SELECTOR-DEFERRED** (U-MS5 — `RagStoreListingPayload` is U-MS5's type;
  this module exports no presentation type).

## 5. The exhaustive contract

### 5.1 The module (`src/main/rag-store-registry.ts`)

- ONE new file. PURE — no Electron imports (`electron` must NOT appear), no
  store/engine imports (`rag-store.ts`/`retrieval.ts` are not imported), no
  IPC, no MCP. Node-testable under the existing vitest suite.
- **The pinned import set** (the no-write enforcement is structural):
  `import { existsSync, readFileSync, statSync } from 'node:fs'` and
  `import { dirname, isAbsolute, join, resolve } from 'node:path'`. NO write
  primitive (`writeFileSync`/`renameSync`/`mkdirSync`/`appendFileSync`) and NO
  rm/unlink primitive may be imported. The only disk operations in the whole
  module are ONE `existsSync` probe + ONE `statSync(opts.path)` isFile probe
  (F-MS1-5 — READ-only; it guards the read against FIFO/device paths,
  §5.3.3 step 4) + at most ONE `readFileSync(opts.path, 'utf8')` per
  `loadRagStoreRegistry` call.
- The module header comment cites this spec (`docs/specs/unit-ms1-store-registry.md`
  §5), the review (§2 D2/D3/D8), and the decision rows (§4).
- The module holds NO state between calls: both pure functions are pure, and
  `loadRagStoreRegistry` constructs a fresh result per call (no memoization,
  no cache — two calls with the same file state return deep-equal results).

### 5.2 Exported types (exact TS shapes)

```ts
// src/main/rag-store-registry.ts

/** The registry name charset (D2). Lowercase alnum + `-`/`_`, 1–64 chars,
 *  must START alnum. Filesystem-safe: no dots ⇒ no traversal; no colon ⇒ a
 *  registry name can never collide with U-MS4's `<name>:` id-prefix
 *  namespace (STORE-ID-PREFIX). */
export const RAG_STORE_NAME_PATTERN: RegExp = /^[a-z0-9][a-z0-9_-]{0,63}$/

/** One operator-authored store entry, EXACTLY as authored in
 *  provident-rag-stores.json — no derived values. */
export interface RagStoreConfig {
  /** Required, non-empty, must match RAG_STORE_NAME_PATTERN. */
  name: string
  /** Optional. When present it must be exactly `true` or `false`. */
  default?: boolean
  /** Optional. When present: a string and `path.isAbsolute` — the store's
   *  persistence file, verbatim. */
  persistenceFile?: string
  /** Optional. When present: a string and `path.isAbsolute` — the store's
   *  import containment root, verbatim. */
  corpusRoot?: string
  /** Phase 2 only (VECTOR-TOPOLOGY-PER-STORE (e)); the Phase-2 shape is
   *  `Omit<EmbeddingProviderConfig,'apiKey'> & { apiKeyEnv?: string }`
   *  (embeddings.ts:36-47 as the base). In Phase 1 ANY present value —
   *  including `null` — fails validation (D2, fail-loud). */
  embedder?: unknown
}

/** The on-disk registry file shape (provident-rag-stores.json). */
export interface RagStoreRegistryFile {
  version: 1
  stores: RagStoreConfig[]
}

/** One RESOLVED store — the registry module's output, consumed by the U-MS2
 *  wiring. Derived values are materialized; explicit values are preserved
 *  verbatim. */
export interface ResolvedRagStore {
  name: string
  /** Materialized (the config's optional flag becomes a definite boolean). */
  default: boolean
  /** The explicit `persistenceFile` when present (the EXACT operator string,
   *  no normalization), else the derived default (§5.3.2 resolution). */
  persistenceFile: string
  /** The explicit `corpusRoot` when present; the property is OMITTED
   *  otherwise (`'corpusRoot' in store === false`; reading it yields
   *  `undefined` either way). NEVER filled with `process.cwd()` — the
   *  importer's cwd default applies at import time (markdown-import.ts:66). */
  corpusRoot?: string
}

/** The pure validate+resolve output. `version` and `embedder` are validated
 *  and DROPPED (never re-exposed). */
export interface ResolvedRagStoreRegistry {
  /** The resolved stores in registry array order (no reordering). */
  stores: ResolvedRagStore[]
  /** The ONE `default === true` store's name. */
  defaultStoreName: string
}

export interface RagStoreRegistryOptions {
  /** The registry file path. In the wiring (U-MS2):
   *  `join(app.getPath('userData'), 'provident-rag-stores.json')` — the file
   *  name is pinned; the directory must be userData so the implicit entry's
   *  derived legacy path is byte-equal to `main.ts:119`. Derived store files
   *  resolve against `dirname(path)`. No `~`/env expansion — verbatim. */
  path: string
}

/** The loader result: the resolved registry + how it was obtained. */
export interface LoadedRagStoreRegistry extends ResolvedRagStoreRegistry {
  /** The `opts.path` the load read (verbatim). */
  path: string
  /** True when the entry was SYNTHESIZED (MIGRATION-LEGACY-PATH) because the
   *  file was absent OR corrupt. Invariants: `corrupt ⇒ implicit`; and
   *  `implicit ⇒ stores.length === 1 && stores[0].name === 'main' &&
   *  stores[0].default === true` with the legacy persistence path. */
  implicit: boolean
  /** True ONLY for the fail-soft corrupt/unreadable-file path (the pinned
   *  log was emitted). Never true together with a file-derived registry. */
  corrupt: boolean
}
```

### 5.3 Exported functions (exact signatures)

```ts
/** MIGRATION-LEGACY-PATH (D3) — the synthesized zero-config registry: exactly
 *  one entry `{ name: 'main', default: true }` whose persistenceFile is the
 *  LEGACY `provident-rag.json` in `registryDir` and whose corpusRoot is
 *  omitted. NEVER written back to disk. PURE (no fs). */
export function implicitRegistry(registryDir: string): ResolvedRagStoreRegistry

/** PURE validate + resolve of an ALREADY-PARSED registry value — ALL the D2
 *  rules, in the pinned pass order (§5.3.2). Throws the byte-pinned fail-loud
 *  error on the FIRST failing rule (§5.4). Never touches the filesystem. */
export function resolveRegistry(parsed: unknown, registryDir: string): ResolvedRagStoreRegistry

/** Load the registry from disk — the boot-time entry point (D8). Absent file
 *  ⇒ implicit synthesis (NO log, NO file created). Corrupt/unreadable file
 *  ⇒ fail-soft implicit synthesis + the pinned console.error (§5.4). Present
 *  but invalid ⇒ the resolveRegistry Error PROPAGATES (fail-loud abort
 *  before the window; wiring = U-MS2, precedent main.ts:156-158). */
export function loadRagStoreRegistry(opts: RagStoreRegistryOptions): LoadedRagStoreRegistry
```

The module has exactly these 3 exported functions, 6 exported types
(`RagStoreConfig`, `RagStoreRegistryFile`, `ResolvedRagStore`,
`ResolvedRagStoreRegistry`, `RagStoreRegistryOptions`, `LoadedRagStoreRegistry`),
and 1 exported const. TWO internal helpers are NOT exported (F-MS1-8):
`jsonOf(value: unknown): string` — the §5.4 `<json>` renderer — and
`derivePersistenceFile(name: string, registryDir: string): string` (§5.3.2);
plus ONE internal const, `CASE_INSENSITIVE_FS_PLATFORMS` (§5.3.2 Pass D,
F-MS1-2).
There is NO mutation API, NO `set`, NO persist, NO reload, NO store-census
surface — the absence is part of the contract (D8; the export census in §5.8
pins it).

**F-MS1-10 (JSON-shaped inputs):** all inputs to the exported functions must
be JSON-parse-shaped — inputs carrying getters or Proxies may present
DIFFERENT values per pass and are OUT of contract.

#### 5.3.1 `implicitRegistry(registryDir: string): ResolvedRagStoreRegistry`

- **Guard:** `registryDir` not a non-empty string ⇒ throws
  `Error('rag-store-registry: registryDir required')`.
- **Returns exactly** (no `corpusRoot` key on the store):

```ts
{
  stores: [{ name: 'main', default: true,
             persistenceFile: join(registryDir, 'provident-rag.json') }],
  defaultStoreName: 'main',
}
```

- The legacy path is the DERIVATION output for name `main` (the same rule an
  explicit `main` entry uses — one carve-out, one implementation).

#### 5.3.2 `resolveRegistry(parsed: unknown, registryDir: string): ResolvedRagStoreRegistry`

**Guard:** `registryDir` not a non-empty string ⇒ throws
`Error('rag-store-registry: registryDir required')`.

**Field-presence rule (pinned, uniform):** a config field is PRESENT iff its
value is not `undefined` (JSON text cannot express `undefined`, so file-loaded
configs never hit the boundary; the direct-JS pure-call path treats an explicit
`undefined` exactly like absence).

**Pass order (pinned — the FIRST failing rule determines the thrown message;
later rules are not evaluated once one fails):**

- **Pass A — per-entry shape/field checks**, scanning `stores` in array order;
  within one entry, fields in this order:
  1. **entry object:** the entry must be a non-null, non-array object ⇒ else
     **F4**.
  2. **name string:** `typeof entry.name === 'string' && entry.name !== ''`
     ⇒ else **F5**.
  3. **name charset:** `RAG_STORE_NAME_PATTERN.test(entry.name)` ⇒ else
     **F6**. (Rejects uppercase, dots, colons, leading `-`/`_`, and anything
     beyond 64 chars — the 64-char name IS valid, the 65-char name is not.)
  4. **default boolean (when present):** `entry.default === true ||
     entry.default === false` ⇒ else **F7**.
  5. **persistenceFile absolute (when present):** `typeof === 'string' &&
     isAbsolute(entry.persistenceFile)` ⇒ else **F8**. (A relative path, an
     empty string, and a non-string all fail here.)
  6. **corpusRoot absolute (when present):** `typeof === 'string' &&
     isAbsolute(entry.corpusRoot)` ⇒ else **F9**.
  7. **embedder rejected (Phase 1):** `entry.embedder !== undefined` ⇒ **F10**
     — byte-pinned `per-store embedder config is not supported yet`, NO
     prefix, NO index, NO name (the D2 verbatim message). `embedder: null`
     is PRESENT and rejected.
  Unknown keys at BOTH levels are ignored (documented tolerance, §3) —
  `embedder` is the ONE pinned exception.
  **F-MS1-7a (NUL bytes):** the F8/F9 checks ALSO reject any string
  containing a NUL byte (`\u0000`) — same message shapes — a fail-loud
  authoring error, not a deferred fs error. **Documented limitation:** lone
  surrogates and >PATH_MAX paths are NOT rejected — the failure defers to the
  first fs operation at store-open (spec-gap note; no Phase-1 code change).
- **Pass B — duplicate names:** scanning in array order, the first name seen
  twice ⇒ **F11** (the repeated name is reported).
- **Pass C — exactly one default:** `stores.filter(s => s.default ===
  true).length === 1` ⇒ else **F12** (0 ⇒ `found 0`; N≥2 ⇒ `found N`).
  An empty `stores` array fails here (`found 0`).
- **Pass D — persistence collision:** scan in array order keeping
  `Map<resolve(persistenceFile), firstName>`; the first entry whose
  `resolve(...)` equals a previously seen one ⇒ **F13** (the EARLIER store's
  name first, then the current one; the path printed is
  `path.resolve(currentEntry.persistenceFile)`). The comparison is over
  `path.resolve(...)`-normalized values, so `dir/./f.json` collides with
  `dir/f.json`. The rule operates over derived ∪ explicit (D2) — the
  reachable manifestations are explicit-vs-explicit and explicit-vs-derived
  (either array order); two name-unique stores that BOTH omit
  `persistenceFile` can never collide (distinct names ⇒ distinct derived
  filenames, and `main` derives `provident-rag.json` which no other name can
  derive) — that impossibility is a pinned derivation property, not a
  fail-state.
  **F-MS1-2 (platform-conditional key):** the collision KEY is
  platform-conditional — `path.resolve(p)` on other platforms; on the
  platforms in the internal const `CASE_INSENSITIVE_FS_PLATFORMS`
  (`['darwin', 'win32']`) the key is the resolved path CASEFOLDED
  (`.toLowerCase()`), so case-differing paths collide there. The F13 message
  still prints the ORIGINAL resolved path (never the casefolded key).
  **F-MS2-1 (the registry-file self-collision seed, 2026-09-05):** Pass D's
  seed set ALSO includes the LOADED registry file's own resolved path —
  `loadRagStoreRegistry` threads its own `opts.path` into `resolveRegistry` as
  an OPTIONAL internal `reservedPath` parameter (the direct-JS 2-arg form
  threads NOTHING — byte-unchanged), whose `path.resolve`-normalized +
  platform-conditionally-casefolded key is seeded alongside the entries. The
  FIRST entry (derived or explicit) whose collision key equals the seeded one
  fails loud with **F14** (§5.4): a store file resolving onto the registry
  file itself would be written over it by the store's own persist, destroying
  `provident-rag-stores.json` and failing the NEXT boot loud (locked out). The
  F14 check precedes the F13 store-store comparison for that entry, and no
  entry is ever added to the collision map under the reserved key. The
  implicit-entry synthesis (H1) never reaches Pass D and is unaffected.
  **Documented limitation (F-MS1-2):** identity remains purely LEXICAL —
  symlink identity is invisible and realpath identity is NOT added in Phase 1
  (two paths naming one file through different links do not collide here; the
  failure defers to the first fs operation at store-open).

**Resolution (after all passes pass):** for each entry, in array order —

- `default = entry.default === true`.
- `persistenceFile = entry.persistenceFile` (verbatim) when present, else
  `derivePersistenceFile(entry.name, registryDir)` where
  `derivePersistenceFile(name, registryDir)` =
  `join(registryDir, 'provident-rag.json')` when `name === 'main'`, else
  `join(registryDir, 'provident-rag-' + name + '.json')`. The carve-out keys
  on the NAME ONLY — an explicit non-default `main` still derives the legacy
  path (§5.5 H5).
- `corpusRoot` = the explicit value (verbatim) when present; the property is
  OMITTED when absent.
- `version` and `embedder` are dropped (never re-exposed).
- `defaultStoreName` = the `default === true` entry's `name`.
- The returned object is freshly constructed per call.

#### 5.3.3 `loadRagStoreRegistry(opts: RagStoreRegistryOptions): LoadedRagStoreRegistry`

1. **Guard:** `opts` null/not-an-object, or `opts.path` not a non-empty string
   ⇒ throws `Error('rag-store-registry: path required')` (the
   `template-store.ts:74-76` idiom).
2. `const registryDir = dirname(opts.path)`.
3. **Absent file:** `!existsSync(opts.path)` ⇒ return
   `{ ...implicitRegistry(registryDir), path: opts.path, implicit: true,
   corrupt: false }`. NO log. NO file or directory is created. (A dangling
   symlink behaves as absent — `existsSync` is the probe.)
4. **Corrupt/unreadable file:** read+parse inside ONE try/catch —
   `JSON.parse(readFileSync(opts.path, 'utf8'))`; ANY throw from the probe,
   the read or the parse (byte garbage, an empty file, trailing garbage after
   the JSON, a DIRECTORY path — EISDIR, a permission-denied file) ⇒ emit the
   pinned log (§5.4 LOG-1: first argument byte-pinned with `opts.path`
   interpolated, the caught error passed as `console.error`'s second
   argument) and return `{ ...implicitRegistry(registryDir), path: opts.path,
   implicit: true, corrupt: true }` — fail-soft, boot continues.
   **F-MS1-5 (the isFile probe):** BEFORE the read, the loader probes
   `statSync(opts.path)` — a NON-REGULAR file (`!isFile()`: a FIFO, a device)
   ⇒ the fail-soft path + LOG-1, matching the corrupt-file discipline (the
   probe throws into the ONE catch, keeping the module's single log call
   site; a FIFO must never reach `readFileSync`, which would block forever).
   A stat race (the probe itself throws, e.g. a raced deletion) ⇒ fail-soft
   as pinned.
   **F-MS1-1 (the BOM strip):** after the read and before `JSON.parse`,
   exactly ONE leading U+FEFF is stripped from the file content, so a
   BOM-prefixed VALID registry loads normally (FS31: no log, `implicit:
   false`); a BOM that survives the strip (a second leading BOM, a BOM
   inside/at the JSON) is still a SyntaxError ⇒ fail-soft as pinned.
5. **Present but invalid:** the parsed value is handed to
   `resolveRegistry(parsed, registryDir)`; its Error PROPAGATES out of
   `loadRagStoreRegistry` (fail-loud — the U-MS2 wiring calls this in
   `main()`, so the message aborts boot before the window, the
   `main.ts:156-158` precedent). The loader adds NO context and does NOT
   re-wrap the message.
6. **Present and valid:** return
   `{ ...resolved, path: opts.path, implicit: false, corrupt: false }`.

The loader is stateless: repeated calls with the same file state return
deep-equal results (the corrupt path's log side effect aside). A caller
mutating a returned registry cannot affect any other call's result.

### 5.4 The byte-pinned error set + the log-line census

**Thrown Errors (fail-loud; each message is byte-pinned — a test asserts the
exact string).** `<json>` = `JSON.stringify(<value>)` (so strings render
double-quoted; `undefined` renders `undefined`). **F-MS1-3:** the rendering
is TOTAL — a throwing `JSON.stringify` (BigInt, cyclic structure, a throwing
`toJSON`) renders `String(<value>)` instead of surfacing an unpinned
TypeError. **BigInt rendering (F-BLIND-MS1-1 reconciliation):** the
`String(<value>)` fallback renders a BigInt as its decimal digits WITHOUT the
`n` suffix (ECMAScript `String(1n)` === `'1'` — BigInt::ToString,
<https://tc39.es/ecma262/#sec-numeric-types-tostring>; the `n` exists only in
BigInt literal source syntax), so a BigInt `version` throws F2 with
`(got 1)`. **F-MS1-6:** the rendering is CAPPED — a rendering longer than 200
chars renders as its first 197 chars + `…` (exactly 198 chars); the cap
applies to the RENDERING only, never to validation (the pinned 65-char F6
case — 67 rendered chars — stays byte-intact). `<i>` = the 0-based index in
`stores`; `<n>` = the decimal count.

| # | Trigger | Exact `Error` message |
| --- | --- | --- |
| G-load | `loadRagStoreRegistry` with null/opts-not-object or a non-string/empty `path` | `rag-store-registry: path required` |
| G-dir | `implicitRegistry`/`resolveRegistry` with a non-string/empty `registryDir` | `rag-store-registry: registryDir required` |
| F1 | parsed value is not a non-null non-array object (`null`, `[]`, `5`, `"x"`, `true`) | `rag-store-registry: registry must be an object` |
| F2 | `version` missing or `!== 1` (`{}` ⇒ `got undefined`; `2` ⇒ `got 2`; `"1"` ⇒ `got "1"`; `true` ⇒ `got true`); a JSON `1.0` parses to `1` and PASSES | `rag-store-registry: unsupported registry version (got <json>)` |
| F3 | `stores` missing or not an array (`{version:1}`; `stores: {}`) | `rag-store-registry: stores must be an array` |
| F4 | entry `i` is null / non-object / an array | `rag-store-registry: stores[<i>] must be an object` |
| F5 | entry `i`'s `name` missing, non-string, or `''` | `rag-store-registry: stores[<i>].name must be a non-empty string (got <json>)` |
| F6 | entry `i`'s `name` fails `/^[a-z0-9][a-z0-9_-]{0,63}$/` (uppercase, dot, colon, leading `-`/`_`, >64 chars) | `rag-store-registry: stores[<i>].name must match ^[a-z0-9][a-z0-9_-]{0,63}$ (got <json>)` |
| F7 | entry `i`'s `default` present but not `true`/`false` (`'yes'`, `1`, `null`) | `rag-store-registry: stores[<i>].default must be a boolean (got <json>)` |
| F8 | entry `i`'s `persistenceFile` present but non-string, `''`, relative, or containing a NUL byte (`\u0000`) — F-MS1-7a | `rag-store-registry: stores[<i>].persistenceFile must be an absolute path (got <json>)` |
| F9 | entry `i`'s `corpusRoot` present but non-string, `''`, relative, or containing a NUL byte (`\u0000`) — F-MS1-7a | `rag-store-registry: stores[<i>].corpusRoot must be an absolute path (got <json>)` |
| F10 | entry `i`'s `embedder` present (ANY value, including `null`) — the D2 verbatim pin, NO prefix, NO index, NO name | `per-store embedder config is not supported yet` |
| F11 | two entries share a name (first duplicate in array order reported) | `rag-store-registry: duplicate store name '<name>'` |
| F12 | the count of `default === true` entries is not exactly 1 (`stores: []` ⇒ `found 0`; two defaults ⇒ `found 2`) | `rag-store-registry: exactly one store must have default: true (found <n>)` |
| F13 | two stores resolve to one persistence file (derived ∪ explicit, `path.resolve`-normalized) | `rag-store-registry: persistence file collision: <resolvedPath> (stores '<earlier>', '<current>')` |
| F14 | **(F-MS2-1, the U-MS2 adversarial batch — 2026-09-05; added WITHOUT renumbering F1–F13):** `loadRagStoreRegistry` only — an entry (derived OR explicit) whose persistence path resolves onto the LOADED registry file's own path. Pass D's collision set is seeded with `path.resolve(opts.path)` (threaded by the loader as the OPTIONAL internal `reservedPath` param of `resolveRegistry`; the direct-JS 2-arg form seeds NOTHING and is byte-unchanged; the implicit-entry synthesis never reaches Pass D and is unaffected) | `rag-store-registry: persistence file collision with the registry file: <resolvedPath> (store '<name>')` — `<resolvedPath>` is the REGISTRY file's resolve-normalized path (original case, never the casefolded key); `<name>` is the colliding entry's name. F14 fires BEFORE the F13 store-store comparison for that entry (the registry file is not a store, so the F13 two-name shape cannot render it), and no entry is ever ADDED to the collision map under the reserved key |

**Log-line census (the module's ENTIRE log output):**

- **Exactly ONE `console.error` call site** in the module — the corrupt/
  unreadable fail-soft path (§5.3.3 step 4). Byte-pinned first argument:
  `[rag-store-registry] registry file unreadable (<opts.path>); falling back to the implicit main store`
  (the wording mirrors the `[security-store] persist failed (${opts.path}):`
  idiom, `security-store.ts:82`). The caught error is the SECOND
  `console.error` argument; its text is NOT byte-pinned.
- **ZERO other log lines:** no `console.log`, no `console.info`, no
  `console.warn`, and no second `console.error` site anywhere in the module.
- **The ABSENT-file path emits ZERO log lines** (byte-equal zero-config boot
  output — the implicit synthesis is silent).

### 5.5 Happy-path states (TestWriter red set — valid paths)

`<d>` below is the registry directory (an absolute temp dir in tests);
`<d>/provident-rag-stores.json` is the registry path passed as
`{ path }`.

1. **H1 — the implicit zero-config state (MIGRATION-LEGACY-PATH):** no
   registry file present ⇒
   `{ stores: [{ name: 'main', default: true, persistenceFile: '<d>/provident-rag.json' }], defaultStoreName: 'main', path: '<d>/provident-rag-stores.json', implicit: true, corrupt: false }`;
   the store has NO `corpusRoot` key; `console.error` NOT called; NO new file
   appears in `<d>` (dir listing unchanged — the no-write-back pin, §5.7 B2).
   The persistence path is byte-equal to today's `main.ts:119`.
2. **H2 — one explicit store:** `{"version":1,"stores":[{"name":
   "research-2026-09","default":true}]}` ⇒ resolved persistenceFile
   `<d>/provident-rag-research-2026-09.json` (derived), `defaultStoreName:
   'research-2026-09'`, `implicit: false`, `corrupt: false`, stores in
   registry order.
3. **H3 — the D3 first-registry-write scenario:** `[{name:'main',default:true},
   {name:'research-2026-09'}]` ⇒ `main` resolves to the LEGACY
   `<d>/provident-rag.json` (the carve-out — NOT `provident-rag-main.json`),
   `research-2026-09` derives `<d>/provident-rag-research-2026-09.json`;
   `defaultStoreName: 'main'`. Existing data is preserved on the first
   registry write (D3).
4. **H4 — explicit `main` WITH persistenceFile:** the explicit value is
   honored verbatim (no carve-out applied to an explicit path).
5. **H5 — the carve-out keys on the NAME only:** `[{name:'main',default:false},
   {name:'other',default:true}]` is VALID (no reserved-name default rule) and
   `main` STILL derives the legacy `<d>/provident-rag.json`.
6. **H6 — explicit corpusRoot + persistenceFile preserved verbatim:**
   `{name:'scratch',default:true,corpusRoot:'<d>/corpus',persistenceFile:'<d>/scratch.json'}`
   ⇒ both fields returned EXACTLY as written (no normalization); `implicit:
   false`, `corrupt: false`.
7. **H7 — explicit `default: false` materialized:** a non-flagged store and
   one with explicit `default: false` behave identically (`default ===
   false` on the resolved store).
8. **H8 — N stores, one default, all distinct derived paths:** e.g. 5
   entries with distinct charset names, exactly one flagged ⇒ 5 resolved
   stores in registry order; `defaultStoreName` = the flagged one.
9. **H9 — name boundaries:** a 64-char name (1 + 63) is VALID; `-`/`_`/digits
   after the first alnum char are valid (`a-_9`, `research-2026-09`).
10. **H10 — unknown-key tolerance:** `{version:1, stores:[{name:'a',
    default:true, custom:'x'}], note:'ignored'}` ⇒ VALID (unknown keys at
    both levels ignored); the unknown keys are NOT re-exposed on the resolved
    store.
11. **H11 — `version: 1.0` (JSON number):** parses to `1` ⇒ VALID (`=== 1`).
12. **H12 — pure equivalence:** `resolveRegistry(JSON.parse(fileText), <d>)`
    returns a result deep-equal (on `stores`/`defaultStoreName`) to
    `loadRagStoreRegistry({ path })`'s for the same file — the loader adds
    only `path`/`implicit`/`corrupt`.
13. **H13 — statelessness:** two `loadRagStoreRegistry` calls in sequence
    return deep-equal results; mutating the first result's `stores` array
    does not affect the second.
14. **H14 — the corrupt-path result is usable:** the fail-soft result (FS1)
    is deep-equal to the absent-file result on `stores`/`defaultStoreName`
    — only `corrupt` differs (`true`) and the pinned log fired.

### 5.6 Fail-states (TestWriter red set — documented fail-states)

Outcomes: **fail-soft** = the implicit registry + `corrupt: true` + the pinned
log (§5.4 LOG-1), boot continues; **fail-loud** = the byte-pinned `Error`
propagates out of `loadRagStoreRegistry` (boot aborts before the window —
`main.ts:156-158` precedent).

| # | Trigger | Outcome | Exact result |
| --- | --- | --- | --- |
| FS1 | registry file contains byte garbage (`'{not json'`) | fail-soft | implicit registry + `corrupt: true` + LOG-1 (arg1 byte-pinned with the path, arg2 = the caught SyntaxError) |
| FS2 | registry file is EMPTY (`''`) — `JSON.parse('')` throws | fail-soft | identical to FS1 |
| FS3 | registry path is a DIRECTORY — `existsSync` true (the read would throw EISDIR) | fail-soft | identical to FS1 (NOT fail-loud) — F-MS1-5 mechanism note: the isFile probe trips a directory BEFORE the read (`statSync(dir).isFile() === false` ⇒ the probe throw into the ONE catch), so EISDIR from `readFileSync` is no longer the mechanism; outcome unchanged |
| FS4 | registry file unreadable (permission-denied) | fail-soft | identical to FS1 — F-MS1-5 mechanism note: the probe fires BEFORE the read (a denied PARENT dir ⇒ the probe itself throws EACCES; a denied FILE passes the probe and `readFileSync` throws EACCES) — either throw lands in the ONE catch ⇒ LOG-1; outcome unchanged |
| FS5 | valid JSON, top-level non-object: `null` / `[]` / `5` / `"x"` / `true` | fail-loud | F1 |
| FS6 | `{}` — version missing | fail-loud | F2 with `(got undefined)` |
| FS7 | `{"version":2,…}` / `{"version":"1",…}` / `{"version":true,…}` | fail-loud | F2 with `(got 2)` / `(got "1")` / `(got true)` |
| FS8 | `{"version":1}` — `stores` missing; or `stores: {}` | fail-loud | F3 |
| FS9 | `stores: [null]` or `stores: [[]]` | fail-loud | F4 at the entry's index |
| FS10 | entry `name` missing (`{default:true}`) / `''` / non-string (`5`) | fail-loud | F5 with `(got undefined)` / `(got "")` / `(got 5)` |
| FS11 | entry `name` charset violations: `'Main'` (uppercase), `'a.b'` (dot), `'a:b'` (colon — the STORE-ID-PREFIX exclusion), `'-a'` (leading `-`), a 65-char name | fail-loud | F6 with the JSON-quoted name |
| FS12 | entry `default` non-boolean: `'yes'` / `1` / `null` | fail-loud | F7 with `(got "yes")` / `(got 1)` / `(got null)` |
| FS13 | entry `persistenceFile` relative (`'rel.json'`), empty (`''`), non-string (`5`), or containing a NUL byte (`'<d>/a\u0000b.json'` — F-MS1-7a) | fail-loud | F8 with the offending value JSON-quoted |
| FS14 | entry `corpusRoot` relative (`'rel/dir'`), empty, non-string, or containing a NUL byte (`'<d>/c\u0000d'` — F-MS1-7a) | fail-loud | F9 |
| FS15 | entry `embedder` present: `{}` / a full provider shape / `null` | fail-loud | F10 — EXACTLY `per-store embedder config is not supported yet` (no prefix, no index, no name) |
| FS16 | duplicate names: `[{name:'a'},{name:'a'}]` | fail-loud | F11 `duplicate store name 'a'` |
| FS17 | `stores: []` (zero stores) | fail-loud | F12 `(found 0)` |
| FS18 | no entry flagged: `[{name:'a'},{name:'b'}]` | fail-loud | F12 `(found 0)` |
| FS19 | two defaults: `[{name:'a',default:true},{name:'b',default:true}]` | fail-loud | F12 `(found 2)` |
| FS20 | explicit-vs-explicit collision: `[{name:'a',default:true,persistenceFile:'<d>/f.json'},{name:'b',persistenceFile:'<d>/f.json'}]` | fail-loud | F13 `persistence file collision: <d>/f.json (stores 'a', 'b')` |
| FS21 | derived-vs-explicit collision: `[{name:'a',default:true},{name:'b',persistenceFile:'<d>/provident-rag-a.json'}]` | fail-loud | F13 (earlier `'a'`, current `'b'`) |
| FS22 | explicit-vs-derived collision (reverse order): `[{name:'a',default:true,persistenceFile:'<d>/provident-rag-b.json'},{name:'b'}]` | fail-loud | F13 (earlier `'a'`, current `'b'`) |
| FS23 | normalized-path collision: `[{name:'a',default:true,persistenceFile:'<d>/f.json'},{name:'b',persistenceFile:'<d>/./f.json'}]` | fail-loud | F13 (the comparison is `path.resolve`-normalized) |
| FS24 | legacy-path collision: `[{name:'main',default:true},{name:'x',persistenceFile:'<d>/provident-rag.json'}]` | fail-loud | F13 (earlier `'main'`, current `'x'`) |
| FS25 | precedence within one entry: `{name:'', embedder:{}}` | fail-loud | F5 (Pass A field order: name before embedder) |
| FS26 | precedence pass-A-then-B: `[{name:'a'},{name:'a',embedder:{}}]` | fail-loud | F10 (ALL Pass A checks precede Pass B) |
| FS27 | precedence B-then-C: a duplicate-name registry with zero defaults | fail-loud | F11 (Pass B precedes Pass C) |
| FS28 | precedence C-then-D: a zero-default registry that also collides | fail-loud | F12 (Pass C precedes Pass D) |
| FS29 | `loadRagStoreRegistry(null)` / `{}` / `{path: 5}` / `{path: ''}` | throw (caller error) | G-load |
| FS30 | `resolveRegistry(parsed, '')` / `(parsed, undefined)` (and the same for `implicitRegistry`) | throw (caller error) | G-dir |
| FS31 | registry file begins with U+FEFF: BOM + a VALID registry ⇒ NORMAL load (ZERO log, `implicit: false`, `corrupt: false`); BOM + byte garbage (or a SECOND leading BOM — a BOM at the JSON is still a SyntaxError) | normal / fail-soft | the resolved registry / implicit registry + `corrupt: true` + LOG-1 (F-MS1-1: ONE leading U+FEFF stripped, §5.3.3 step 4) |
| FS32 | the registry path is a NON-REGULAR file — a FIFO (`mkfifo`, Linux-only test) or a device (`/dev/null`): `statSync().isFile()` false | fail-soft | identical to FS1 (F-MS1-5: the isFile probe fires BEFORE `readFileSync` — a FIFO would block it forever; a stat race ⇒ fail-soft as pinned) |

**Derived impossibility (pin as a derivation property, NOT a red test):** two
name-unique stores that BOTH omit `persistenceFile` can never collide —
distinct names derive distinct `provident-rag-<name>.json` files, and only
name `main` derives `provident-rag.json` (F11/F6 make the preconditions
unreachable). The collision rule's reachable manifestations are FS20–FS24.

**Amendment (2026-09-05, the U-MS1 green pass — an Architect ruling):** the
original FS20–FS24 example registries omitted the `default` flag, which made
F13 unreachable under the pinned C-before-D order (FS28: a zero-default
registry that also collides ⇒ F12) — a spec self-contradiction the Implementer
correctly stopped on (the SPEC-CONFLICT escape). The five example rows now
carry exactly one `default: true` (F13's reachability precondition); the
pinned pass order (§5.3.2: guard → A → B → C → D) and FS28's precedence pins
are UNCHANGED, and the implementation required NO change. Tests 29–32 were
re-transcribed to the amended rows in the same pass (the red evidence: 46
authored tests failed at suite load on the missing module; 42/46 green on the
pinned implementation before the amendment; the four F13 rows were the defect,
not the code).

### 5.7 The §4 byte-equality acceptance rows (binding per A4)

The review's §4 table rows this unit OWNS (the wiring-level rows — engine
construction, vector cache, tool results, broadcasts — are U-MS2/MS3/MS5
acceptance criteria and are cited, not restated):

| Review §4 row | U-MS1 acceptance criterion |
| --- | --- |
| "Store persistence file: `provident-rag.json` — same file, same content discipline" (`main.ts:118-120`) | **B1:** with NO `provident-rag-stores.json` present, the implicit entry resolves `persistenceFile` to exactly `join(registryDir, 'provident-rag.json')` — byte-equal to `main.ts:119` when the wiring passes the userData registry path (H1). An explicit entry named `main` without `persistenceFile` derives the SAME path (H3/H5 — D3). |
| "Import root: `resolve(corpusRoot, file)` with `corpusRoot = cwd` ⇒ byte-identical" (`markdown-import.ts:66,84`) | **B4:** a store without `corpusRoot` resolves with the property OMITTED, so the importer's `process.cwd()` default applies AT IMPORT TIME — the registry module never fills cwd in (H1/H6). |

**Plus the no-write-back pin (D3, binding):**

- **B2:** with the registry file ABSENT, `loadRagStoreRegistry` creates NO
  file and NO directory — the directory listing is unchanged after the call
  (the implicit entry is synthesized, never written back). Structurally
  enforced: the module imports no write primitive (§5.1).
- **B3:** with the registry file ABSENT, the module emits ZERO log lines
  (zero-config boot output stays byte-equal).
- **B5:** the corrupt/unreadable path (FS1–FS4) likewise writes NOTHING —
  fail-soft means "log + synthesize in memory", never "rewrite the registry".

### 5.8 Census / numeric claims

- **New pure module:** 1 — `src/main/rag-store-registry.ts` (no Electron, no
  write primitive; node-testable).
- **Exported functions:** 3 (`implicitRegistry`, `resolveRegistry`,
  `loadRagStoreRegistry`).
- **Exported types:** 6 (`RagStoreConfig`, `RagStoreRegistryFile`,
  `ResolvedRagStore`, `ResolvedRagStoreRegistry`, `RagStoreRegistryOptions`,
  `LoadedRagStoreRegistry`).
- **Exported consts:** 1 (`RAG_STORE_NAME_PATTERN`, source
  `^[a-z0-9][a-z0-9_-]{0,63}$` — the F6 message embeds exactly this source;
  Object.frozen per F-MS1-4, and validation reads an INTERNAL frozen copy,
  never the export).
- **Non-exported internals (F-MS1-8):** 2 (`jsonOf` — the §5.4 `<json>`
  renderer — and `derivePersistenceFile`) + 1 internal const
  (`CASE_INSENSITIVE_FS_PLATFORMS`, F-MS1-2).
- **Distinct fail-loud messages:** 14 (F1–F13 + F14, the F-MS2-1 row — added
  WITHOUT renumbering F1–F13) + 2 guard throws (G-load,
  G-dir) = 16 pinned `Error` strings.
- **`console.error` sites:** 1 (the corrupt fail-soft path). Other log sites:
  0.
- **Disk writes:** 0 — no persist, no mkdir, no temp file, in every path
  including the fail-soft one.
- **Disk reads per `loadRagStoreRegistry` call:** 1 `existsSync` probe + 1
  `statSync` isFile probe (F-MS1-5) + at most 1 `readFileSync`.
- **`RagStoreConfig` fields:** 5 (`name` + 4 optional); `ResolvedRagStore`
  fields: 3 required + 1 optional (`corpusRoot`); `version`/`embedder` are
  validated and dropped.
- **Files this unit creates/edits:** 2 — the module + its test file. NOTHING
  else: `main.ts` untouched (U-MS2), `src/shared/types.ts` untouched
  (`RagStoreListingPayload` is U-MS5's), no store/engine file touched, no new
  MCP tool, no new IPC channel.
- **Estimated new tests:** 22–28 (review §6 U-MS1 row), all in ONE file —
  **LANDED: 63** (`tests/unit-ms1-store-registry.test.ts` tests 01–63: 01–46
  at the green pass, 47–63 from the §3a adversarial fix batch; 63/63 green).

### 5.9 Cross-references

- **Gate:** `docs/specs/multi-document-store-config-review.md` §2 D2 (the
  registry file, shape, validation, boot split), D3 (MIGRATION-LEGACY-PATH +
  the main carve-out + the never-written-back pin), D8 (boot-time-only
  mutation); §3 (the unit table — U-MS1 row); §4 (the byte-equality table +
  A4); §5 R4 (the corruption-split red tests); §8 A7 (the validation pins),
  A1/STORE-ID-PREFIX context, A6 (lexical-only, U-MS2's), A9 (no census tool,
  U-MS2's).
- **Decisions:** `docs/decisions.md` rows **MULTI-STORE-REGISTRY**,
  **SINGLE-WRITER-STORE-PER-STORE**, **ENGINE-PER-STORE**,
  **STORE-QUALIFIED-BROADCAST**, **STORE-ID-PREFIX**,
  **IMPORT-ROOT-PER-STORE**, **VECTOR-TOPOLOGY-PER-STORE**,
  **UI-SELECTOR-DEFERRED** (all 2026-09-05). **Reconciliation (2026-09-05,
  the doc-review pass):** the four §4 design decisions —
  **REGISTRY-BOOT-SPLIT**, **REGISTRY-DERIVED-PATHS**, **REGISTRY-NO-WRITE**,
  **REGISTRY-CWD-TRANSPARENCY** — are recorded WITHIN the landed
  **MULTI-STORE-REGISTRY** decision row as its named sub-pins (the boot
  split, the derived paths + the name-`main` carve-out, the zero-write /
  never-written-back property, and the omitted-`corpusRoot`
  cwd-transparency rule), NOT as four separate `docs/decisions.md` rows —
  the earlier "added when the unit lands" wording is superseded by this
  explicit reconciliation; no separate rows were created (avoiding
  duplication of the landed row, which carries the four sub-pin names
  verbatim — see `docs/decisions.md` MULTI-STORE-REGISTRY).
- **Sibling units (cite-only — their contracts are NOT restated here):**
  U-MS2 `docs/specs/unit-ms2-store-wiring.md` (the wiring passes
  `join(app.getPath('userData'), 'provident-rag-stores.json')`; the optional
  `store` argument on all 12 MCP tools, omitted ⇒ default store, resolved
  FIRST, fail-loud error echoing only the caller's input; no store-census MCP
  tool; per-store engines, non-default stores lexical-only per A6); U-MS3
  `docs/specs/unit-ms3-store-qualified-broadcast.md`; U-MS4
  `docs/specs/unit-ms4-id-prefixing.md` (the `<name>:` prefix — safe because
  this module's charset excludes `:`); U-MS5 `docs/specs/unit-ms5-settings-listing.md`
  (the `RagStoreListingPayload` presentation type in `src/shared/types.ts` —
  NOT this module's export).
- **Idiom sources (read, cited):** `src/main/security-store.ts:58-71` (the
  load-on-boot + corrupt→default idiom — the fail-soft HALF of the split that
  D2 adopts for corrupt files only), `security-store.ts:82` (the persist-
  failure log wording this module's log line mirrors),
  `src/main/operator-settings-store.ts:53-63` (the corrupt→DEFAULT_SETTINGS
  silent fallback deliberately NOT copied — D2's REJECTED rationale),
  `src/main/module-store.ts:93-123` (the load discipline + corrupt flag),
  `module-store.ts:130-142` and `src/main/template-store.ts:101-111` (atomic
  temp+rename — the write half this module does NOT need: zero writes),
  `template-store.ts:74-76` (the `path required` guard idiom), the
  module-store pattern spec `docs/specs/unit-a-rag-store.md` §5.7.
- **Behavior anchors:** `src/main/main.ts:118-120` (the legacy
  `provident-rag.json` the implicit entry must reproduce),
  `main.ts:156-158` (the fail-loud abort-before-window precedent),
  `src/main/markdown-import.ts:66` (the `process.cwd()` corpus-root default
  the omitted-`corpusRoot` transparency preserves),
  `markdown-import.ts:84` (the `resolve(file)` site U-MS2 re-points per A5 —
  cited only), `src/main/embeddings.ts:36-47` (the `EmbeddingProviderConfig`
  base of the Phase-2 embedder shape, D6(e)).
- **Test file (SpecWriter-pinned):** `tests/unit-ms1-store-registry.test.ts`.

## 6. Unit → file → test-file mapping

| Unit | File | Test file | Notes |
| --- | --- | --- | --- |
| **U-MS1** (this spec) | NEW `src/main/rag-store-registry.ts` (PURE — no Electron, no writes) | `tests/unit-ms1-store-registry.test.ts` (name SpecWriter-pinned) | node-testable; red set from §5.5 (H1–H14) + §5.6 (FS1–FS32) + the §5.7 byte-equality rows (B1–B5); est. 22–28 tests (review §6) — LANDED: 63 tests (`tests/unit-ms1-store-registry.test.ts`), 63/63 green. |

- **Out of this unit's mapping (owned by siblings, cited only):** `main.ts` +
  `mcp-server.ts` wiring (U-MS2), `markdown-import.ts` id-prefixing (U-MS4),
  `shared/types.ts`/`preload.ts`/`sidebar-panes.ts` broadcast qualification
  (U-MS3), the settings listing + `RagStoreListingPayload` (U-MS5).
- **Per RCA-2/RCA-5:** U-MS1 runs its own TestWriter-red → Implementer-green →
  adversarial (§3a) → blind-greens → doc-review cycle BEFORE U-MS2 starts; the
  trio (`npm test` / `npm run typecheck` / `npm run build`) runs after the
  green.