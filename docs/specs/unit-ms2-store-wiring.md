# Spec — Unit MS2: Store-Instance Wiring + the `store` Selector on the MCP Tools

- **Status:** SPEC (the multi-store Phase-1 slice, Unit U-MS2 of 5; execution
  order U-MS1 → **U-MS2** → U-MS4 → U-MS3 → U-MS5). Proposal:
  `docs/feature-requests/multi-document-store-config.md` (multi-store
  Phase-1 slice, USER-APPROVED 2026-09-05). Authoritative gate record:
  `docs/specs/multi-document-store-config-review.md` — §2 (decisions D1–D12),
  §8 (binding amendments A1–A10), §4 (the zero-config byte-equality table),
  §3 (the unit decomposition table). Decision rows landed
  (`docs/decisions.md`, all 2026-09-05): **MULTI-STORE-REGISTRY**,
  **SINGLE-WRITER-STORE-PER-STORE**, **ENGINE-PER-STORE**,
  **STORE-QUALIFIED-BROADCAST** (U-MS3's), **STORE-ID-PREFIX** (U-MS4's),
  **IMPORT-ROOT-PER-STORE**, **VECTOR-TOPOLOGY-PER-STORE**,
  **UI-SELECTOR-DEFERRED**.
- **Scope:** the store-instance wiring in `src/main/main.ts` (the registry
  loads at boot — U-MS1's module; N `createJsonRagStore` instances replace the
  single construction at `main.ts:118-120`; the N-engine map replaces the
  single engine branch at `main.ts:145-173`; the invalid-registry abort wired
  before the window; the per-store status derivation from the store's own
  `status()` corrupt flag, `rag-store.ts:1231-1243`); the OPTIONAL `store`
  argument on ALL 12 MCP tools in `src/main/mcp-server.ts` (resolved FIRST,
  before any tool-specific validation side effect; the per-store reconcile
  routing — today's closures bind ONE engine: `mcp-server.ts:1131`,
  `main.ts:246,283,307`); the per-store import root for `edit.import_markdown`
  (the addressed store's `corpusRoot` passed through the importer's EXISTING
  programmatic param, `markdown-import.ts:23,66`; the tool description
  corrected per A5, `mcp-server.ts:1078`); and the extracted PURE
  store-directory module (the U5-F1 extraction precedent) holding the
  resolution logic + the directory construction so the Electron wiring stays
  thin. This unit does NOT change the broadcast payload shape (U-MS3), the
  import minting/documentId prefixing or the importer's internal
  resolve-against-root (U-MS4), or the UI/IPC surfaces (U-MS5).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/rag-store-directory.ts`
  (NEW — the pure resolver + directory construction) + `src/main/mcp-server.ts`
  (the 12 tool schemas + the resolution/routing) + `src/main/main.ts` (the boot
  wiring, tested via the node-testable seams only — this repo tests shared
  handlers, never `main.ts` directly) from §5.6/§5.7/§5.8/§5.9 and §6 before any
  implementation.

---

## 1. What the unit asks

1. **The store-instance wiring in `main()`** (`src/main/main.ts`): the registry
   (U-MS1's module, `src/main/rag-store-registry.ts` — its exported surface is
   U-MS1's contract) loads ONCE at boot from
   `join(app.getPath('userData'), 'provident-rag-stores.json')`; N stores are
   constructed from it — the single `createJsonRagStore` at `main.ts:118-120`
   is replaced; N retrieval engines are constructed in a per-name map — the
   single engine branch at `main.ts:145-173` is replaced (the default store
   keeps the exact lexical/vector branch; non-default stores are ALWAYS
   lexical in Phase 1 — A6/R10); the invalid-registry fail-LOUD abort is wired
   BEFORE the window; each store's boot status (`status().corrupt`,
   `rag-store.ts:1231-1243`) is derived per store (D7).
2. **The `store` selector on ALL 12 MCP tools** (`src/main/mcp-server.ts`):
   an OPTIONAL `store: string` argument on `rag.query`, `rag.get_document`,
   `rag.list_nodes`, `rag.get_edges`, `rag.backlinks`, `edit.set_content`,
   `edit.create_node`, `edit.delete_node`, `edit.split_node`,
   `edit.merge_node`, `edit.set_edge`, `edit.import_markdown`
   (`security.ts:34-45` — the five-seam gate gains NOTHING: no new tool name,
   no new group, no `RpcMethod` change). Omitted ⇒ the default store.
   RESOLVED FIRST — an unknown `store` fails before ANY tool-specific
   arg-validation side effect (R1). Unknown store ⇒ fail-loud
   `` `<tool>: unknown store '<requested-name>'` `` echoing ONLY the caller's
   input (never enumerating the registry — B9/A9). Non-string/malformed store
   value ⇒ fail-loud type error mirroring the house `topK` pattern
   (`mcp-server.ts:142-149`). No store-census MCP tool (A9).
3. **The per-store reconcile routing:** today the `edit.*` success path and the
   IPC edit paths reconcile ONE bound engine (`mcp-server.ts:1131`,
   `main.ts:246,283,307`); the ADDRESSED store's engine is resolved PER CALL
   (D5 — ENGINE-PER-STORE).
4. **The per-store import root:** `edit.import_markdown` imports into the
   addressed store using that store's `corpusRoot` — passed via the importer's
   EXISTING programmatic `corpusRoot` param (`markdown-import.ts:23,66`; the
   TOOL schema stays `files`-only — ADV-1, `unit-t-markdown-import.md:183`).
   The tool description is corrected (A5, `mcp-server.ts:1078`). **Handoff
   (explicit):** U-MS2 owns PASSING the root per store AND the third-argument
   `ImportStoreContext` pass-through (pinned in §5.6 — the production
   activation of U-MS4's STORE-ID-PREFIX); U-MS4 owns the
   importer's internal `resolve(corpusRoot, file)` change
   (`markdown-import.ts:84`) + the documentId prefixing + the optional third
   parameter — U-MS2 must NOT
   pre-change either.
5. **The extracted pure resolver:** the resolution logic lives in a PURE,
   node-testable module (the U5-F1 extraction precedent —
   `handleRichCommitIpc`, `edit-ops.ts:689-747`) so the Electron wiring stays
   thin (the review §7's context-budget condition). Its module name, exported
   signatures, return shapes, and every fail message are pinned byte-exactly
   in §5.1. U-MS3/U-MS4/U-MS5 must not need its internals — the tool-level
   contract (§5.2/§5.3) is the cross-unit seam; U-MS5 consumes only the
   directory's per-entry presentation view (§5.1).

## 2. Feasibility verdict

**Feasible — grounded in the existing injection seams; no engine/foundation
gap.** The handlers are already injection-seamed exported functions
(`handleRagTool(store, name, args, engine?)` `mcp-server.ts:129-134`;
`handleEditTool(store, name, args, onStoreChanged?)` `mcp-server.ts:365-370`)
with an established node-test seam (direct calls in `tests/rag-edit-gate.test.ts:216`,
SDK-level `InMemoryTransport` + `client.callTool` in
`tests/embeddings-adversarial.test.ts:104-119`). Per-instance stores exist
(`createJsonRagStore` closure-scoped with its own single-writer queue,
`rag-store.ts:632-680`); the engine construction branch is a clean per-store
loop of today's `main.ts:145-173`; the vector boot controller is already
store-scoped (`createVectorBootController(store, provider, opts)`,
`vector-boot.ts:110-114`); the importer's programmatic `corpusRoot` param
survives ADV-1 (`markdown-import.ts:23,66`; `unit-t-markdown-import.md:183`).
The resolver is a pure extraction (no Electron, no `node:*` beyond types).
The failed-store surface is the store's OWN fail-disabled contract
(`rag-store.ts:555-629,632-680`) — U-MS2 only derives the flag and pins the
tool-level matrix.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The pure directory module (`src/main/rag-store-directory.ts`) | Project-specific (a pure extraction — the U5-F1 precedent) | Low cost; the thin-wiring enabler AND the review §7 context-budget condition — without it the TestWriter needs `main.ts` (452 lines) + `mcp-server.ts` (1573 lines) + the registry in one pass. |
| The 12 schema changes + resolution in the handlers | Project-specific (additive zod rows + one resolver call per handler) | Low-medium cost; the resolution-first pin (R1) must be tested per tool (12 ordering tests). |
| The per-store engine map + reconcile routing | Project-specific (a `Map` + the backward-compatible callback widening) | Medium cost; the `(payload, storeName)` callback widening keeps every existing single-arg callback green. |
| The per-store import root | Project-specific (the programmatic param already exists) | Low cost here; the `resolve(corpusRoot, file)` half is U-MS4's — the handoff is pinned in §5.6 so neither unit double-changes `markdown-import.ts:84`. |
| The failed-store surface (D7) | Project-specific (the store's own fail-disabled contract) | Low cost; per-store matrix + the default-corrupt boot-continues regression. |
| The invalid-registry abort wiring | Project-specific (U-MS1 throws; `main()` propagates via the existing fatal path `main.ts:443-448`) | Low cost; ordering is code-review + live-battery pinned (the abort itself is U-MS1's red set). |

No engine gap — entirely host-side (`src/`).

### 3a. Adversarial findings (registered 2026-09-05 — the U-MS2 adversarial pass + the Architect's ruled fix batch)

The RCA-3 read-only adversarial pass on the U-MS2 green returned 11 findings
(F-MS2-1..F-MS2-11). The Architect ruled: **FIXED-WITH-REGRESSION** for
F-MS2-1/F-MS2-2/F-MS2-5/F-MS2-7 (the fix batch below — each landed with a
red-first regression test, tests 58–63 of `tests/unit-ms2-store-wiring.test.ts`),
**SPEC-ERRATUM** for F-MS2-4/F-MS2-6 (the spec-only amendments applied in the
same pass; F-MS2-6 additionally re-pins the code string + test 20 under the
sanctioned amendment), **DOCUMENTED-LIMITATION** for F-MS2-3, and
**RECORDED-NO-CHANGE** for F-MS2-8/F-MS2-9/F-MS2-10, **PROCESS** for F-MS2-11.

Red-first record (RCA-1): the R-series (tests 58–63 + the sanctioned test-20
re-pin) was written and run RED against the PRE-FIX modules BEFORE any fix.
Failing set (finite run): tests **58, 59, 60, 61 RED** (the pre-fix loader
resolved the self-colliding registry; the M2 echo was uncapped; no
embedderKind guard existed) + **test 20 RED** (the sanctioned re-pin — the
code string still carried the old A5 tail). **Test 62 GREEN** (a regression
guard pinning behavior the store already had correct — the /dev/null corrupt
outcome held via `JSON.parse('')`). **Test 63 HUNG the pre-fix module** inside
`createJsonRagStore`'s load (`readFileSync` on a FIFO never returns — the
F-MS2-2 defect itself; the worker cannot be interrupted and the run was killed
at the wall clock: the 40 s deliberate FIFO-only run plus four earlier wedge
runs of 240 s/100 s/90 s/45 s). After the fix batch: the unit file is
**62 pass / 1 fail**, the single failure the UNTOUCHED staged red (test 56 —
U-MS4's), and the U-MS1 suite stays 63/63 green.

| id | sev | problem (one line) | concrete input | ruling + fix shape as ruled |
| --- | --- | --- | --- | --- |
| F-MS2-1 | HIGH | The registry-file self-collision: a store whose derived/explicit persistence path resolves onto the REGISTRY FILE's own path passed U-MS1 validation and silently shadowed it — the first store write destroyed `provident-rag-stores.json` and the NEXT boot failed loud (locked out). | registry file `<d>/provident-rag-stores.json` = `{"version":1,"stores":[{"name":"main","default":true},{"name":"stores"}]}` (the entry `stores` derives `<d>/provident-rag-stores.json` — the registry file itself); the explicit variant `{name:'research-2026-09',persistenceFile:'<registry path>'}`. Pre-fix: resolves VALID; the first store write destroys the registry file; the next boot fail-louds (F3 against the store-shaped file) | **FIXED-WITH-REGRESSION** — Pass D's collision seed set is extended with the LOADER's own resolved registry path (threaded as the OPTIONAL internal `reservedPath` param of `resolveRegistry`; the direct-JS 2-arg form and the implicit-entry synthesis byte-unchanged); ANY entry (derived or explicit) resolving onto it fails loud with the NEW byte-pinned **F14** `rag-store-registry: persistence file collision with the registry file: <resolvedPath> (store '<name>')` (unit-ms1 §5.4 + the §5.3.2 seed sentence). Regression: tests 58 (the derived `stores`-entry case, wiring-level through the loader) + 59 (the explicit-path variant + the direct-JS contract byte-intact + the implicit synthesis unaffected). All U-MS1 pins byte-intact (63/63 green). |
| F-MS2-2 | MEDIUM | A FIFO/device at a STORE persistenceFile hung the boot: `rag-store.ts` `load()` probed only `existsSync`, so `readFileSync` on a FIFO blocked forever (single-threaded boot — the hang/OOM class). | `mkfifo <store persistenceFile>` then `buildRagStoreDirectory` ⇒ pre-fix the construction hangs inside `createJsonRagStore`'s load (the red run killed at the wall clock — see the record above) | **FIXED-WITH-REGRESSION** — an `isFile()` probe in rag-store.ts `load()` alongside its `existsSync` (the F-MS1-5 registry-side precedent): a non-regular file (`statSync().isFile() === false` OR a throwing stat) takes the EXISTING corrupt-class fail-soft outcome (empty + `corrupt: true`, no hang, no OOM); a directory keeps its graceful EISDIR⇒corrupt outcome (outcome-identical — the probe short-circuits it). Regression: test 63 (the mkfifo fixture via `spawnSync('mkfifo', …)`, Linux-only `it.runIf`, asserts the entry constructs, `corrupt === true`, the store serves `[]`, and the call RETURNS) + test 62 (the `/dev/null` device case — expressible without root; construct + read ONLY, never mutated). |
| F-MS2-3 | MEDIUM | The lexical collision detection does NOT detect symlink/hardlink INODE aliasing: two registry entries whose paths alias one file through links do not collide at validation and are last-writer-wins. | two entries whose persistenceFiles are a symlink pair (or hardlink pair) to one file ⇒ `resolveRegistry` VALID (lexical identity only); the aliasing stores clobber each other on write | **DOCUMENTED-LIMITATION** (NO code) — a §5.7 sentence records it: resolve-normalized (+ casefold on darwin/win32) collision detection stays lexical in Phase 1; two entries aliasing one inode are last-writer-wins; accepted as operator discipline (the registry is operator-authored; the realpath/inode-identity hardening is a parked follow-up — a `docs/pending.md` row is being landed by the supervisor). |
| F-MS2-4 | MEDIUM | The F3 TYPE-level location claim is wrong: the spec pinned the required `store` on `RetrievalResult` (`retrieval.ts`), but the field exists ONLY at the shared-handler seam (the ratified ONE-stamp-point ruling) — `RetrievalResult` is store-name-blind. | a raw `engine.query()` result carries NO `store` (the marker-engine double + tests 37/43/54 read `store` off the HANDLER result, never off the engine's); the §5.9 F3 row + the §5.10 census line claimed `RetrievalResult` gains the required field | **SPEC-ERRATUM** (NO code) — §5.9's F3 row + §5.10's census line amended + the erratum note recording the ruling (verbatim, below the §5.9 table): the required `store` lives on the tool RESULT the shared handler returns (`RagQueryResult`, `shared/types.ts`), stamped at the ONE shared seam; `RetrievalResult` gains NO field — the engine is store-name-blind. The existing tests already pinned the ACTUAL behavior (the seam). |
| F-MS2-5 | LOW | The M2 unknown-store echo is unbounded — a long caller input embeds unbounded bytes into the error text (log-flooding/terminal-wedge class). | `resolveStoreArg('rag.query', 'a'.repeat(300), dir)` ⇒ a 326-char message (pre-fix) | **FIXED-WITH-REGRESSION** — the echo is capped at 200 chars (first 197 + `…`, the F-MS1-6 idiom; the ≤200-char case stays byte-exact — all existing tests use short names; the cap applies to the RENDERING only — a long raw is still M2, never M1). Spec §5.1's M2 pin gains the cap sentence. Regression: test 60 (the 300-char unknown store ⇒ the truncated byte-exact message through the resolver AND the handler + the exactly-200 boundary stays byte-exact). |
| F-MS2-6 | LOW | The A5 description inaccuracy: "the default store's root is the project root" is false for a default entry with a CONFIGURED `corpusRoot`. | a registry whose default entry carries `corpusRoot: <abs>` — the tool description still claims the project root | **SPEC-ERRATUM** (the Architect's amendment of the byte-pinned string) — the tail becomes "…the default store's root is its configured corpus root (the project root when unconfigured)" (the rest byte-identical). Updated in the same pass: the code string (`mcp-server.ts`), §5.2's A5 row (old→new amended), and the SANCTIONED re-pin of test 20's description assertion. |
| F-MS2-7 | LOW | `buildRagStoreDirectory` accepted ANY `embedderKind` value — a kind neither `'lexical'` nor `'vector'` (a wiring bug / an any-holed caller) silently took the lexical branch for every store. | `buildRagStoreDirectory(registry, { embedderKind: 'hybrid', provider: null })` ⇒ pre-fix constructs with lexical engines, no throw | **FIXED-WITH-REGRESSION** — a runtime guard BEFORE any construction (it precedes even the rule-5 one-default cross-check): byte-pinned `rag-store-directory: embedderKind must be 'lexical' or 'vector' (got <json>)` (the jsonOf-style TOTAL + CAPPED rendering — the F-MS1-3/F-MS1-6 idiom). Regression: test 61 (the invalid kinds + the ordering pin via an invalid registry + a 300-char kind ⇒ the capped rendering + nothing constructed). |
| F-MS2-8 | INFO | The rule-3 `missing` probe ordering relative to the store open was unpinned: it is captured AFTER the store's own boot load. | another process removes the persistence file between the store's open and the entry's `existsSync` ⇒ `missing: true` for a store that loaded content (never re-probed, D8) | **RECORDED-NO-CHANGE** — a one-line §5.1 note pins the ordering + the by-design cross-process TOCTOU window (single-threaded boot; D8 makes the captured value authoritative for the process lifetime). |
| F-MS2-9 | INFO | A null `engine` slot skipping the reconcile silently was unpinned. | a hand-built directory entry with `engine: null` + an edit ⇒ `entries.get(name)?.engine.onStoreChanged(...)` short-circuits — no reconcile, no throw | **RECORDED-NO-CHANGE** — a one-line §5.5 note pins it (by design for the legacy sentinel; with a WIRED directory the construction always builds engines, §5.1 rule 2). |
| F-MS2-10 | INFO | An extra `store` key in the `rag-query` IPC payload today is silently DROPPED (not leaked unvalidated). | `handleRagQueryIpc` constructs a fresh `{ query, topK }` args object (`mcp-server.ts:243-246`), so a `store` key never reaches `resolveStoreArg`; the default entry serves. Matches the pinned interim state (§5.4 step 4: the payload carries no `store` field until U-MS5; U-MS5's red set completes the end-to-end row — **COMPLETED 2026-09-05, U-MS5**). `RagQueryPayload` has no `store` field (`shared/types.ts:406-409`); `preload.ts:232` sends none. | **RECORDED-NO-CHANGE** (verified clean — no leak, no action). |
| F-MS2-11 | INFO (process) | Tracker/doc state was behind the landed unit at adversarial time. | `next-steps.md` still read "U-MS2's TestWriter red is the NEXT delegation"; spec §3a was the placeholder; no greens file existed. | **PROCESS** — the §3a registration, the DONE row (with the red/green numbers: 57 tests — 56 pass + staged red test 56, plus the two recorded supervisor repairs at tests 08/16), and the greens set land in this cycle. **Disposition: RESOLVED-BY-THIS-CYCLE** (the DONE row lands after this review; the greens + battery + §3a now exist). |

Note (2026-09-05, COMPLETED by the doc-review pass): the F-MS2-10 and F-MS2-11
rows above carry the supervisor's verbatim transcriptions (the same completion
pattern U-MS1 §3a used for F-MS1-9/11–15 — "NOTHING was invented"); the
pending-transcription placeholders were replaced in place.

### 3b. Proposal-review findings

The gate (`docs/specs/multi-document-store-config-review.md`) returned
**PROCEED-WITH-AMENDMENTS**. The amendments/risks THIS unit folds in (each
cross-referenced to its resolving section):

- **A4 (binding):** the §4 byte-equality itemization is carried as this unit's
  acceptance-criteria rows — persistence file, engine-construction branch,
  import root, tool results (§5.9). The ONE intentional zero-config delta is
  SPLIT by ownership: the broadcast/snapshot `store:'main'` fields are U-MS3's;
  the query-RESULT `store` field — on the HANDLER-returned tool result
  (`RagQueryResult`, `shared/types.ts`; `RetrievalResult` gains NO field — the
  F-MS2-4 erratum; the review §4 "Tool results" row) is THIS unit's (§5.9,
  additive).
- **A5 (binding):** the per-store import root + the `mcp-server.ts:1078`
  description correction land HERE; the `resolve(corpusRoot, file)` change is
  U-MS4's (the §5.6 handoff).
- **A6 (binding):** only the default store takes the `embedderKind ===
  'vector'` branch (`main.ts:154-170`); non-default engines are ALWAYS lexical
  in Phase 1 — keeps the §5.12 failure-class-2 sync warm-up abort unreachable
  for non-default stores (§5.4).
- **A7:** the corrupt-vs-invalid boot split (R4) is U-MS1's validation; U-MS2
  wires it (§5.8).
- **A9:** no store-census MCP tool; unknown-store errors echo only the
  caller's input (§5.1/§5.10; adversarial-pinned after green).
- **R1 (CRITICAL):** the resolution-first pin — per-tool resolution tests for
  all 12 (§5.3).
- **R6 (HIGH):** the per-store failed-state matrix; default-corrupt boot
  continues (§5.7).
- **R8 (MEDIUM):** information-disclosure via error text — the error echoes
  only the caller-supplied name (§5.1; the §3a adversarial pass re-probes).
- **R10 (MEDIUM):** non-default engines never participate in the vector boot
  (§5.4).

## 4. The resolved decisions this unit lands

- **MULTI-STORE-REGISTRY (the wiring half):** `main()` loads the registry once
  (U-MS1's loader) and constructs N stores + N engines from it; the implicit
  `{ name: 'main', default: true }` entry maps to the legacy
  `provident-rag.json` (`main.ts:118-120`'s path) — zero-config byte-equal;
  the implicit entry is never written back (D3); registry mutation is
  boot-time-only (D8 — `IPC_OPERATOR_SETTINGS_SET`, `main.ts:361-370`, never
  touches it).
- **SINGLE-WRITER-STORE-PER-STORE:** N `createJsonRagStore` instances, each
  with its own closure single-writer queue (`rag-store.ts:661-680`); every
  `edit.*` call routes through the ADDRESSED store's instance.
- **ENGINE-PER-STORE:** N engines — one per loaded store, created ONCE at boot
  (the Unit E F1 no-per-call-rebuild property holds per store), realized as
  the directory's per-name entries (§5.1); `edit.*` success reconciles the
  ADDRESSED store's engine per call; the UI/IPC paths reconcile the DEFAULT
  store's engine (the renderer edits one store — D9/UI-SELECTOR-DEFERRED).
- **IMPORT-ROOT-PER-STORE (the wiring half):** the addressed store's
  `corpusRoot` flows server-side into the importer's programmatic param; the
  tool schema stays `files`-only (ADV-1); the `store` argument cannot
  influence any path.
- **VECTOR-TOPOLOGY-PER-STORE (the Phase-1 pin):** exactly ONE
  `VectorBootController` exists — the default store's; non-default stores are
  lexical-only in Phase 1 (A6). The per-store cache files / N controllers /
  precedence / non-default warm-up rows are Phase-2-effective (D6) and are NOT
  implemented here.
- **Consumed, not landed here:** STORE-QUALIFIED-BROADCAST (U-MS3 — this unit
  leaves all four emission sites' payload shape untouched),
  STORE-ID-PREFIX (U-MS4), UI-SELECTOR-DEFERRED (U-MS5's listing; the reason
  this unit adds no census/switcher surface).

## 5. The exhaustive contract

### 5.1 The pure store-directory module (`src/main/rag-store-directory.ts`)

NEW module. PURE and node-testable — no Electron import; imports only the
`RagStore`/`RetrievalEngine` types, the store/retrieval/vector-boot/cache
constructors, the `EmbeddingProvider` type, and `existsSync` from `node:fs`
(the boot-captured per-store missing flag, §5.1 rule 3 — the module's ONLY
direct fs call; the store constructors perform their own file I/O); the import
set also carries `join` from `node:path` — the rule-2 F8 explicit cache path.
It hosts
BOTH the resolution
logic (the extracted pure resolver) and the directory construction (so the
`main.ts` wiring stays thin). **U-MS3/U-MS4/U-MS5 must not need its internals**
— they consume the tool-level contract (§5.2/§5.3) and, for U-MS5, the
directory's entry view below.

```ts
// src/main/rag-store-directory.ts (project-specific; PURE, node-testable).

/** The RESOLVED registry view U-MS2 consumes (produced by U-MS1's loader —
 *  docs/specs/unit-ms1-store-registry.md; U-MS1's exported surface is ITS
 *  contract). The TOP-LEVEL view is STRUCTURALLY U-MS1's
 *  `ResolvedRagStoreRegistry` — `stores` + `defaultStoreName` (F5): U-MS1's
 *  loader validates and DROPS `version` (unit-ms1-store-registry.md §5.2), so
 *  the consumed view carries NO `version` field. U-MS2 consumes exactly these
 *  fields and nothing else; if U-MS1's resolved entry type already carries
 *  them, consume it structurally. */
export interface ResolvedRegistryStore {
  name: string                       // charset-validated by U-MS1
  default: boolean                   // exactly one true (U-MS1)
  /** The RESOLVED persistence file (absolute). The implicit entry and an
   *  explicit `main` without persistenceFile derive the legacy
   *  `provident-rag.json` (U-MS1's MIGRATION-LEGACY-PATH). */
  persistenceFile: string
  /** The configured corpus root (absolute when present; undefined otherwise —
   *  then the importer's `process.cwd()` default applies, byte-equal today). */
  corpusRoot?: string
}
export interface ResolvedRegistry {
  stores: ResolvedRegistryStore[]
  /** The ONE `default === true` store's name — U-MS1's resolved
   *  `defaultStoreName` (its validation guarantees exactly one). */
  defaultStoreName: string
}

/** One wired store: the store instance + its engine + its import root + its
 *  boot status. The presentation view U-MS5's settings listing reads
 *  (name/corpusRoot/status — the D7 status via the exported `storeLoadStatus`
 *  accessor below). */
export interface RagStoreEntry {
  name: string
  store: RagStore
  engine: RetrievalEngine
  /** The store's configured corpus root (absolute when configured);
   *  `undefined` ⇒ the importer's `process.cwd()` default
   *  (markdown-import.ts:66) — the zero-config byte-equal case. */
  corpusRoot?: string
  /** The store's own fail-disabled status flag, captured ONCE at boot from
   *  `store.status().corrupt` (rag-store.ts:1231-1243). `corrupt` is a
   *  construction-time const (rag-store.ts:641), so the snapshot cannot
   *  drift from `status().corrupt`. */
  corrupt: boolean
  /** The BOOT-CAPTURED per-store missing flag (F6): `!existsSync(
   *  cfg.persistenceFile)` evaluated ONCE at construction — the registry
   *  entry's persistence-file existence at boot, never re-probed (D8). The
   *  D7 discriminator: `corrupt` alone cannot distinguish `loaded` from
   *  `failed-missing` (both false); `missing` ⇒ `failed-missing`. */
  missing: boolean
}

/** The addressing surface injected into the rag/edit tool handlers. */
export interface RagStoreDirectory {
  entries: ReadonlyMap<string, RagStoreEntry>
  defaultName: string
}

/** The resolution result. `requested` is the RAW caller input — `null` when
 *  the `store` argument was omitted. */
export interface ResolvedStoreRef {
  requested: string | null
  name: string
}

/** The extracted PURE resolver. Throws the byte-pinned fail messages below.
 *  Returns `null` ONLY for the legacy directory-less + omitted-store case
 *  (no resolution performed — the passed store param is used, byte-equal to
 *  today). */
export function resolveStoreArg(
  tool: string,
  raw: unknown,
  dir: RagStoreDirectory | null | undefined,
): ResolvedStoreRef | null

/** The boot construction: N stores + N engines from the resolved registry.
 *  The default store follows today's exact lexical/vector branch
 *  (main.ts:145-173); non-default stores are ALWAYS lexical (A6). */
export interface RagStoreBootPlan {
  directory: RagStoreDirectory
  /** Non-null IFF the DEFAULT store took the vector branch — at most ONE. */
  vectorBoot: VectorBootController | null
  defaultName: string
}
export function buildRagStoreDirectory(
  registry: ResolvedRegistry,
  opts: {
    userDataPath: string
    embedderKind: 'lexical' | 'vector'
    /** The ALREADY-WARMED provider (main.ts:159 ran before this call) —
     *  required iff `embedderKind === 'vector'`, else null. */
    provider: EmbeddingProvider | null
  },
): RagStoreBootPlan
```

**`storeLoadStatus` — the D7 three-state derivation (F6, exported):**

```ts
/** The per-store boot-status derivation — ONE exported PURE accessor; the
 *  exact surface U-MS5's settings listing consumes
 *  (unit-ms5-settings-listing.md §5.4 wires `(name) =>
 *  storeLoadStatus(entries.get(name)!)`). `entry.missing` is the
 *  boot-captured per-store missing flag (§5.1 rule 3 — the registry entry's
 *  persistence-file existence captured at construction); the precedence is
 *  pinned: `missing` ⇒ 'failed-missing' (an absent persistence file = the
 *  first-run empty store — NOT an error state, D7), else `corrupt` ⇒
 *  'failed-corrupt', else 'loaded'. The returned union's members are EXACTLY
 *  U-MS5's shared `RagStoreLoadStatus` (declared in src/shared/types.ts when
 *  U-MS5 lands — the A3/RCA-6 coordination its §5.1 pins); until then this
 *  inline union is the derivation's contract. */
export function storeLoadStatus(
  entry: Pick<RagStoreEntry, 'missing' | 'corrupt'>,
): 'loaded' | 'failed-corrupt' | 'failed-missing'
```

**`resolveStoreArg` — every byte-pinned message (TestWriter: assert with
`toThrowError(new Error(<exact string>))` semantics):**

| # | Condition | Throw (byte-exact) |
| --- | --- | --- |
| M1 | `raw` present and not a non-empty string (`typeof raw !== 'string' \|\| raw === ''` — covers `null`, numbers, booleans, objects, arrays, `''`) | `` `${tool}: store must be a non-empty string` `` — e.g. `rag.query: store must be a non-empty string` |

> **MCP-observability erratum (2026-09-08, live-testing finding F2 — HOST-LIVE-ZOD-SEAM):** the M1 row above is the PURE resolver's contract (total on non-string inputs — reachable via direct `resolveStoreArg`/handler calls in tests). On the LIVE MCP surface, a non-string `store` (`null`/`5`/`true`/`{}`/`[]`) is rejected BEFORE the handler by the SDK zod input-schema seam (`store: z.string().optional()`) with `-32602 … expected string, received … at store` — only the empty string `''` (a valid zod string) reaches the handler and yields M1. This matches the house "schema validates type, handler validates value" topK pattern; the M1 non-string branch is NOT MCP-observable. The U-MS2 battery §3.3 S19 row is amended accordingly.
| M2 | `raw` a non-empty string and (`dir == null` or `!dir.entries.has(raw)`) | `` `${tool}: unknown store '${raw}'` `` — e.g. `rag.query: unknown store 'nope'` — echoes ONLY the caller's input, never the registry census (B9/A9); the raw string is interpolated WITHOUT escaping. **F-MS2-5 (the echo cap):** the `<raw>` ECHO is capped at 200 chars — a raw longer than 200 chars renders as its first 197 chars + `…` (exactly 198 chars; the F-MS1-6 idiom); the ≤200-char case stays byte-exact (all existing tests use short names), and the cap applies to the RENDERING only — a long raw is still M2 (membership), never M1 |
| M3 | `raw` omitted (`undefined`) and `dir != null` and `!dir.entries.has(dir.defaultName)` (a malformed directory — a wiring bug) | `rag-store-directory: default store not found` |

**`resolveStoreArg` — return states:**

| # | Input state | Return |
| --- | --- | --- |
| S1 | `raw === undefined` (key absent or explicitly `undefined`) and `dir != null` | `{ requested: null, name: dir.defaultName }` |
| S2 | `raw` a non-empty string in `dir.entries` | `{ requested: raw, name: raw }` |
| S3 | `raw === undefined` and `dir == null` | `null` — the LEGACY sentinel: no resolution; the handler uses the passed `store` param unchanged (byte-equal today) |

Ordering inside the resolver: M1 (type/emptiness) is checked BEFORE M2
(membership) — a malformed value never leaks membership information. M3 is
checked on the omitted path only.

**`buildRagStoreDirectory` — construction rules (pinned, per registry entry in
registry insertion order):**

1. `const store = createJsonRagStore({ path: cfg.persistenceFile })` — each
   instance carries its OWN single-writer queue (`rag-store.ts:661-680`,
   SINGLE-WRITER-STORE-PER-STORE). `createJsonRagStore` throws
   `Error('rag store: path required')` for an empty path
   (`rag-store.ts:633-635`) — unreachable via a U-MS1-validated registry.
2. **Engine branch:** if `cfg.name` is the registry's default AND
   `opts.embedderKind === 'vector'`:
   - `opts.provider == null` ⇒ throw
     `Error('retrieval.embedder: vector requires retrieval.embeddingProvider config')`
     — byte-identical to the main.ts:157 guard, which stays UNCHANGED and
     fires first in the wired main (this re-guard is defense-in-depth).
   - `const boot = createVectorBootController(store, provider, { embedBatchFn:
     provider.embedBatch, cache: createVectorCache({ path: join(opts.userDataPath, 'provident-vector-cache.json') }) })` — byte-equal to `main.ts:168`'s zero-config default: `vector-cache.ts:114-133` resolves the SAME `join(app.getPath('userData'), 'provident-vector-cache.json')` through the Electron app, so the explicit path gives `opts.userDataPath` its pinned use and makes the vector-plan red test NODE-RUNNABLE in vitest (the NO-ARG form throws `createVectorCache: path required (no Electron app available for the default)` outside Electron — F8);
     `entry.engine = boot.engine`; `plan.vectorBoot = boot`
     (the W1 born-lexical pending controller; `vector-boot.ts:110-114`). AT
     MOST ONE vector boot exists per plan.
   - The vector cache FILE is the same `provident-vector-cache.json` — the explicit `join(opts.userDataPath, 'provident-vector-cache.json')` construction above is byte-equal to the Electron default (F8). Non-default stores create NO cache
     file (they are lexical).
   else: `entry.engine = createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))`
   — byte-equal to `main.ts:172`. **ALL non-default stores take this branch
   EVEN in vector mode** (A6/R10 — no per-store warm-up, no per-store cache,
   the §5.12 class-2 abort unreachable for them).
3. `entry.corrupt = store.status().corrupt` (`rag-store.ts:1231-1243`; the
   flag is a construction-time const, `rag-store.ts:641`) and `entry.missing =
   !existsSync(cfg.persistenceFile)` — the BOOT-CAPTURED per-store missing
   flag, captured ONCE at construction and never re-probed (D8). The two flags
   yield the D7 three-state derivation via the exported `storeLoadStatus`
   accessor (below, F6).
   **F-MS2-8 note (probe ordering):** the `missing` probe runs AFTER the
   store's own boot load (the store opens first; the flag is captured when the
   entry object is built). A file created/removed by ANOTHER process between
   the store's open and the probe is observed per the probe's instant — a
   cross-process TOCTOU window exists BY DESIGN (single-threaded boot; D8's
   never-re-probed rule makes the captured value authoritative for the process
   lifetime).
4. `entry.corpusRoot = cfg.corpusRoot` (as resolved by U-MS1 — absolute when
   configured, `undefined` otherwise).
5. `defaultName` = `registry.defaultStoreName` (F5 — the consumed U-MS1 view's
   resolved default; U-MS1's validation guarantees exactly one
   `default: true`). Defensive cross-check (a wiring bug — U-MS1 never
   produces one): if `registry.stores` does not hold EXACTLY one
   `default === true` entry, or its `name` ≠ `registry.defaultStoreName`, ⇒
   throw `Error('rag-store-directory: registry must contain exactly one default store')`
   (byte-pinned, unchanged).
6. `plan.directory = { entries, defaultName }`; `plan.defaultName =
   defaultName`.

### 5.2 The per-tool `store`-argument schema change (ALL 12 tools)

Every one of the 12 inputSchemas in the `graph` registration array
(`mcp-server.ts:1067-1078`) gains the SAME trailing optional field:
`store: z.string().optional()` — the house `topK` mirror (lax schema + strict
handler validation; `mcp-server.ts:142-149`). The existing fields of each
schema are UNCHANGED. Exact shapes after the change:

| Tool (line today) | inputSchema after U-MS2 |
| --- | --- |
| `rag.query` (`mcp-server.ts:1067`) | `{ query: z.string(), topK: z.number().optional(), store: z.string().optional() }` |
| `rag.get_document` (`:1068`) | `{ documentId: z.string(), store: z.string().optional() }` |
| `rag.list_nodes` (`:1069`) | `{ store: z.string().optional() }` (was `{}`) |
| `rag.get_edges` (`:1070`) | `{ nodeId: z.string().optional(), store: z.string().optional() }` |
| `rag.backlinks` (`:1071`) | `{ nodeId: z.string(), store: z.string().optional() }` |
| `edit.set_content` (`:1072`) | `{ nodeId: z.string(), content: z.string(), store: z.string().optional() }` |
| `edit.create_node` (`:1073`) | `{ type: z.string(), content: z.string(), parentId: z.string().optional(), props: z.record(z.string(), z.unknown()).optional(), store: z.string().optional() }` |
| `edit.delete_node` (`:1074`) | `{ nodeId: z.string(), store: z.string().optional() }` |
| `edit.split_node` (`:1075`) | `{ nodeId: z.string(), at: z.number(), store: z.string().optional() }` |
| `edit.merge_node` (`:1076`) | `{ sourceId: z.string(), targetId: z.string(), store: z.string().optional() }` |
| `edit.set_edge` (`:1077`) | `{ kind: z.string(), source: z.string(), target: z.string(), edgeId: z.string().optional(), order: z.number().optional(), documentIds: z.array(z.string()).optional(), store: z.string().optional() }` |
| `edit.import_markdown` (`:1078`) | `{ files: z.array(z.string().min(1)).min(1), store: z.string().optional() }` — the schema stays `files`-ONLY otherwise (ADV-1; `unit-t-markdown-import.md:183`) |

**Descriptions:** EXACTLY ONE description changes — `edit.import_markdown`
(A5, `mcp-server.ts:1078`):

- Old: `Import a corpus of markdown files into the RAG store as a ONE-WAY SNAPSHOT (parse → validate doc-flow → applyBatch as ONE atomic batch journal entry). Requires edit group. The corpus root is fixed server-side (the project root) — it is NOT an agent-supplied argument.`
- New (pinned byte-exact; **F-MS2-6 amended tail**): `Import a corpus of markdown files into the addressed RAG store as a ONE-WAY SNAPSHOT (parse → validate doc-flow → applyBatch as ONE atomic batch journal entry). Requires edit group. The corpus root is fixed server-side per store: the addressed store's configured corpus root; the default store's root is its configured corpus root (the project root when unconfigured) — it is NOT an agent-supplied argument.`
- **F-MS2-6 amendment (2026-09-05, the §3a adversarial batch):** the originally
  pinned New tail "the default store's root is the project root" was
  factually wrong for a default entry with a CONFIGURED `corpusRoot`; the
  Architect amended the byte-pinned string's tail to "the default store's root
  is its configured corpus root (the project root when unconfigured)" (the
  rest byte-identical). The code string (`mcp-server.ts`) and test 20's
  description assertion (the sanctioned re-pin) carry the amended string.

The other 11 descriptions are byte-unchanged. The five-seam gate is untouched:
`security.ts` `TOOL_GROUPS` gains nothing (`security.ts:34-45` — the 12 names
are already mapped), `RpcMethod` unchanged, `ALL_TOOLS` unchanged, the
renderer switch unchanged, `MUTATING_METHODS` unchanged.

### 5.3 The resolution-order rules (enumerated)

Both shared handlers gain a trailing optional directory param and resolve
FIRST — the resolution call sits between the (unchanged) null-store guard and
the per-tool `switch`:

```ts
// handleRagTool — mcp-server.ts:129-134 today; the signature after U-MS2:
export async function handleRagTool(
  store: RagStore | null,
  name: string,
  args: Record<string, unknown>,
  engine?: RetrievalEngine | null,
  dir?: RagStoreDirectory | null,          // NEW — trailing optional
): Promise<unknown>

// handleEditTool — mcp-server.ts:365-370 today; after U-MS2 the callback is
// widened to (payload, storeName) — backward-compatible: existing single-arg
// callbacks still compile and run:
export async function handleEditTool(
  store: RagStore | null,
  name: string,
  args: Record<string, unknown>,
  onStoreChanged?: (payload: RagStoreChangedPayload, storeName: string) => void,
  dir?: RagStoreDirectory | null,
): Promise<unknown>
```

**The per-call order (pinned, identical in both handlers):**

1. **Null-store configuration guard — UNCHANGED, first:**
   `` if (!store) throw new Error(`${name}: no rag store configured`) ``
   (`mcp-server.ts:135,371` — the unchanged error taxonomy row).
2. **Resolve FIRST:** `const ref = resolveStoreArg(name, args?.store, dir)`.
   The resolver runs BEFORE the `switch` — i.e. before EVERY tool-specific
   validation throw and before ANY store method call / side effect (R1).
3. **The addressed entry:** `const entry = ref === null ? null :
   dir!.entries.get(ref.name)!` (M3 already guaranteed the default exists).
   `const target = entry ? entry.store : store` — with a directory injected,
   the directory is the SINGLE SOURCE OF TRUTH: the passed `store`/`engine`
   params are IGNORED (they exist for the legacy directory-less path and the
   wired server passes the default entry's objects anyway).
4. **Per-tool execution against `target`:** every case body reads
   `target`/`targetEngine` (below) instead of the closed-over single store.
5. **`onStoreChanged` receives the RESOLVED name:** every successful-mutation
   callback invocation becomes `onStoreChanged?.(payload, ref?.name ?? '')`
   (the legacy sentinel passes `''`).

**The resolution state matrix (uniform across ALL 12 tools; `<tool>` is the
tool's own name, so the per-tool messages differ only by prefix):**

| # | `args.store` state | `dir` | Outcome |
| --- | --- | --- | --- |
| R1 | omitted (key absent or `undefined`) | injected | the DEFAULT entry serves the call (`{ requested: null, name: dir.defaultName }`) |
| R2 | omitted | `null`/absent | LEGACY path — the passed `store`/`engine` params are used; byte-equal to today (`resolveStoreArg` returned `null`) |
| R3 | a known name (in `dir.entries`) | injected | that entry's store/engine/corpusRoot serve the call |
| R4 | a known name | `null`/absent | fail-loud M2 — `` `<tool>: unknown store '<raw>'` `` (no directory ⇒ no store by that name exists on this server) |
| R5 | an unknown non-empty string | any | fail-loud M2 — `` `<tool>: unknown store '<raw>'` ``; NO store method ran, NO mutation, NO broadcast |
| R6 | non-string (`null`, number, boolean, object, array) | any | fail-loud M1 — `` `<tool>: store must be a non-empty string` ``; no side effect |
| R7 | empty string `''` | any | fail-loud M1 — same message; no side effect |

> **MCP-observability erratum (2026-09-08, live-testing findings F2/F3 — HOST-LIVE-ZOD-SEAM):** the R6 row (non-string `store` ⇒ M1) is the PURE resolver's contract, but on the LIVE MCP surface a non-string `store` is rejected BEFORE the handler by the SDK zod seam (`store: z.string().optional()`) with `-32602` — only `''` (R7) reaches the handler and yields M1. Likewise, the resolution-first ordering (R5 — an unknown `store` fails M2 before any tool-specific validation) holds ONLY for calls that PASS the zod schema: when a tool's REQUIRED arg is MISSING (e.g. `create_node {store:'nope'}` without `type`/`content`, `split_node {store:'nope'}` without `nodeId`), the SDK zod seam returns `-32602` before the handler's store-resolution runs. The 12-tool ordering matrix below uses present-but-invalid remaining args (which pass zod), so its M2-first assertions remain valid; the battery §3.3 S21 "every time" wording is amended to "every time the call passes the zod schema".

**Per-tool resolution-first ordering tests (12 — one per tool):** for each
tool, a call carrying BOTH an unknown `store` AND that tool's otherwise-invalid
remaining args throws the unknown-store error — NEVER the tool-specific
validation throw — and performs no store access:

| Tool | Otherwise-invalid remaining args (the ordering trigger) | Must NOT throw |
| --- | --- | --- |
| `rag.query` | `{ store: 'nope' }` (query missing ⇒ `''`) | `rag.query: query must be a non-empty string` (`mcp-server.ts:143`); also `{ store:'nope', query:'q', topK: 0 }` ⇒ NOT `rag.query: topK must be a positive integer` (`:146`) |
| `rag.get_document` | `{ store: 'nope' }` | `rag.get_document: documentId required` (`:161`) |
| `rag.list_nodes` | `{ store: 'nope' }` | (no other validation — resolution is the only gate) |
| `rag.get_edges` | `{ store: 'nope' }` | (no other validation) |
| `rag.backlinks` | `{ store: 'nope' }` | `rag.backlinks: nodeId required` (`:180`) |
| `edit.set_content` | `{ store: 'nope' }` | `edit.set_content: nodeId required` (`:381`) |
| `edit.create_node` | `{ store: 'nope', type: 'paragraph', content: 'x' }` | (the op would otherwise run — assert NO node was created in ANY store: the side-effect-freedom probe) |
| `edit.delete_node` | `{ store: 'nope' }` | `edit.delete_node: nodeId required` (`:400`) |
| `edit.split_node` | `{ store: 'nope' }` | `edit.split_node: nodeId required` (`:408`) |
| `edit.merge_node` | `{ store: 'nope' }` | `edit.merge_node: sourceId and targetId required` (`:416`) |
| `edit.set_edge` | `{ store: 'nope' }` | `edit.set_edge: kind, source and target required` (`:425`) |
| `edit.import_markdown` | `{ store: 'nope', files: ['/tmp/x.md'] }` | (the importer must NEVER run — assert no file read, no batch, no broadcast) |

> **Erratum (U-MS2 implementation pass, 2026-09-05):** the `edit.create_node`
> row's illustrative trigger value `'paragraph'` is not a valid `RagNodeType`
> (`edit-ops.ts:44` — the valid equivalent is `'p'`); the red test uses `'p'`
> so that "the op would otherwise run" holds.

**Engine selection (`rag.query`):** with `dir` injected, the engine is
`entry.engine` — NEVER the per-call `createRetrieval` fallback (the F1
no-rebuild property, per store). With `dir == null`, today's
`engine ?? createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))`
fallback at `mcp-server.ts:148` is UNCHANGED.

**Routing of the other `rag.*` reads:** `rag.get_document` runs
`computeDocumentSubgraph(target, documentId)` (the unchanged Unit V2 contract);
`rag.list_nodes`/`rag.get_edges`/`rag.backlinks` read `target`. All return
shapes are UNCHANGED (the tool's own contract).

**The omitted ≡ explicit-default equivalence (pinned):** with `dir` injected,
a call omitting `store` and the same call with `store: dir.defaultName` hit
the SAME entry — identical results, identical side effects, regardless of what
`store`/`engine` params were passed.

### 5.4 The per-store engine-map construction + the boot wiring in `main.ts`

**`buildRagStoreDirectory`** (§5.1 rules) is the node-testable construction
seam. The `main.ts` wiring (thin, pinned ordering):

1. **Registry load — FIRST, at today's single-store position
   (`main.ts:116-120` replaced):** call U-MS1's loader on
   `join(app.getPath('userData'), 'provident-rag-stores.json')`. The loader's
   outcomes (U-MS1's contract): file absent OR corrupt/unreadable ⇒ the
   fail-soft implicit entry `{ name: 'main', default: true }` (persistence
   `provident-rag.json`, no corpusRoot) + U-MS1's pinned log — boot CONTINUES;
   valid-JSON-but-invalid registry ⇒ the loader THROWS (U-MS1's fail-loud
   error set). That throw propagates out of `main()` into the existing fatal
   path (`main.ts:443-448`): `console.error('[provident-main] fatal:', e)` +
   `app.exit(1)` — BEFORE the window (`main.ts:411`), before `mcp.start()`
   (`main.ts:425`), before `vectorBoot.start()` (`main.ts:431-435`), and
   before ANY store file is created or written.
2. **The vector provider config + warm-up — UNCHANGED position and semantics
   (`main.ts:145-159`):** `embedderKind` from args/env (`main.ts:53-62`); the
   null-config check (`main.ts:156-158`, message unchanged) + `await
   warmUpEmbeddingProvider(providerConfig)` (`main.ts:159`) remain
   SYNC-BEFORE-WINDOW for the DEFAULT store's branch only. The registry load
   (step 1) precedes the warm-up, so an invalid registry aborts before the
   embedder probe.
3. **Construct:** `const plan = buildRagStoreDirectory(registry, { userDataPath:
   app.getPath('userData'), embedderKind, provider })` — where `provider` is
   the warmed provider in vector mode, else `null`. The plan yields N stores +
   N engines (§5.1 rule 2: the default store follows today's exact
   `main.ts:145-173` branch; non-default stores ALWAYS lexical).
4. **Default bindings:** `const defaultStore =
   plan.directory.entries.get(plan.defaultName)!.store` and
   `const defaultEngine = ...entry.engine` replace today's `ragStore`/
   `retrievalEngine` locals at EVERY existing binding site — `main.ts:174`
   (the `ProvidentMcpServer` options), `:237` (`handleEditCommit`),
   `:246-249` (reconcile + broadcast), `:270-274` (preBatchNodes +
   `handleEditBatch`), `:282-286` (reconcile + broadcast), `:306-308`
   (`handleRichCommitIpc` deps), `:316-318` (`handleRagQueryIpc`),
   `:324-326` (`handleRagBacklinksIpc`), `:333-335` (`handleRagDocHeadsIpc`),
   `:377-380` (`IPC_RAG_SNAPSHOT`). All IPC surfaces remain DEFAULT-STORE-
   BOUND in Phase 1 (D9/UI-SELECTOR-DEFERRED; the `RagQueryPayload.store`
   FIELD is U-MS5's additive passthrough). **`handleRagQueryIpc` gains the
   SAME directory injection as the MCP path (F4):** the handler gains a
   trailing optional `dir?: RagStoreDirectory | null` param (the §5.3
   directory-injection pattern) and its `handleRagTool` call forwards it —
   `handleRagTool(store, 'rag.query', { query, topK }, engine, dir)`
   (`mcp-server.ts:195-204`; the `main.ts:316-318` wiring passes
   `plan.directory`) — so the resolver behaves IDENTICALLY on both surfaces.
   At U-MS2 the IPC payload carries no `store` field ⇒ the resolver's
   omitted ⇒ default-entry rule (S1) applies unchanged (byte-equal); once
   U-MS5's additive field exists, a forwarded `store` resolves through the
   SAME `resolveStoreArg`, and an unknown forwarded store FAILS LOUD on the
   IPC path too — `` `rag.query: unknown store '<name>'` `` echoing only the
   caller's input (M2/A9). **F4 end-to-end row CLOSED (2026-09-05, U-MS5 — the §5.9 row's EXECUTION-ORDER STAGING is COMPLETE):** the `RagQueryPayload.store?` field landed, `handleRagQueryIpc` now forwards `store: payload?.store` over the `dir` plumbing, and the unknown-forwarded-store fail-loud pin is GREEN on the IPC path (`tests/unit-ms5-settings-listing.test.ts` §5.6 rows).
5. **Server options:** `McpServerOptions` gains `ragStores?: RagStoreDirectory`
   (`mcp-server.ts:579-604`); the server holds it (`this.ragStores`,
   defaulting `null`) and passes it to `registerTools` at BOTH call sites
   (`mcp-server.ts:779,923` — the static signature gains the directory after
   `engine`). `ragStore`/`retrievalEngine` options stay (backward-compatible —
   `tests/embeddings-adversarial.test.ts:104`). Wiring invariant: when
   `ragStores` is set, `ragStore` IS `entries.get(defaultName).store` and
   `retrievalEngine` IS that entry's engine (constructed that way by step 4).
6. **`vectorBoot`** (`main.ts:153,168-170,431-435`): now `plan.vectorBoot` —
   the background `start()` + the failure-logged stay-pending behavior are
   UNCHANGED. At most one controller exists (the default store's — A6).

### 5.5 The per-store reconcile routing

- **MCP `edit.*` path** (`mcp-server.ts:1114-1136`): the rag branch calls
  `handleRagTool(ragStore, name, args, engine, ragStores)`; the edit branch
  calls `handleEditTool(ragStore, name, args, onStoreChanged, ragStores)`
  where the callback is `(payload, storeName) => { ... }` and the reconcile
  resolves the ADDRESSED store's engine PER CALL:
  `void ragStores?.entries.get(storeName)?.engine.onStoreChanged(payload.kind,
  payload.nodeIds, payload.edgeIds)?.catch(...)` — the failure-logging catch
  is UNCHANGED (`mcp-server.ts:1131-1133`), and the broadcast
  `backend.broadcast?.(IPC_RAG_STORE_CHANGED, payload)` is UNCHANGED in shape
  (`mcp-server.ts:1134` — the `store` field is U-MS3's).
  **F-MS2-9 note:** a NULL `engine` slot skips the reconcile silently
  (`reconcileEngine?.onStoreChanged(...)` short-circuits — no reconcile, no
  throw, the edit still succeeds) — BY DESIGN for the legacy sentinel (no
  directory ⇒ the passed `engine` param, which may be null); with a WIRED
  directory the construction ALWAYS builds engines (§5.1 rule 2), so a null
  slot is unreachable in the wired boot and exists only for hand-built /
  half-wired directories.
- **UI/IPC paths** (`main.ts:246,283,307`): reconcile the DEFAULT store's
  engine (`defaultEngine` — step 4 of §5.4); the payloads at `main.ts:249,286,308`
  stay `{ kind, nodeIds, edgeIds }` (U-MS3 qualifies them). The UI commits
  edit the default store only (D9).
- **Per-store index coherence:** a call addressing store X reconciles ONLY
  X's engine — a foreign store's index is untouched (its next query is
  unaffected; each engine maintains its own incremental index per
  ENGINE-PER-STORE).

### 5.6 The per-store import root + the U-MS4 handoff

- `edit.import_markdown` resolves the addressed entry (§5.3) and calls
  `importMarkdownCorpus(ctx, { files, corpusRoot: entry.corpusRoot }, { name:
  entry.name, isDefault: entry.name === dir.defaultName, reservedNames:
  [...dir.entries.keys()].filter((n) => n !== dir.defaultName) })` where
  `ctx = { store: target }` — `EditOpContext` is UNCHANGED
  (`edit-ops.ts:18-23`); `edit-ops.ts` is NOT modified by this unit (the
  review's "context plumbing" estimate is superseded by this smaller seam:
  the root flows via the importer's EXISTING programmatic param,
  `markdown-import.ts:16-24,66`).
- **The THIRD argument — the U-MS4 `ImportStoreContext` pass-through (F2) —
  is pinned HERE, byte-for-byte to U-MS4's pinned shape
  (`unit-ms4-id-prefixing.md` §5.1: `{ name, isDefault, reservedNames? }`),
  because nobody else owns it: STORE-ID-PREFIX never activates in production
  without U-MS2 passing the context at THIS wired call site.** `isDefault` =
  whether the ADDRESSED entry is the default (`entry.name ===
  dir.defaultName`); `reservedNames` carries ONLY the non-default store
  names (U-MS4 §5.4 A1-S7's recommendation to the wiring). Execution-order
  reconciliation (the U-MS2 → U-MS4 order): the third argument compiles only
  once U-MS4's optional `ImportStoreContext` parameter exists — until that
  window the wired call stays the 2-arg
  `importMarkdownCorpus(ctx, { files, corpusRoot: entry.corpusRoot })`
  (byte-equal; U-MS4 §5.1 pins the same interim), and from the U-MS4 window
  onward the wired call passes the third argument EXACTLY as pinned above.
  The LEGACY directory-less path (`dir == null`, resolution state R2) passes
  NO third argument (the 2-arg call — the addressed store IS the default
  store and no name is knowable; byte-equal today).
- `entry.corpusRoot === undefined` (no registry config) ⇒ the importer's
  `resolve(params.corpusRoot ?? process.cwd())` default applies
  (`markdown-import.ts:66`) — the zero-config byte-equal case.
- `entry.corpusRoot` configured (absolute) ⇒ containment runs against THAT
  root with the realpath/TOCTOU discipline UNCHANGED
  (`markdown-import.ts:66-113`). Observable per-store containment TODAY (via
  ABSOLUTE `files`): an absolute file inside cwd but outside the addressed
  store's corpusRoot ⇒ `{ ok: false, error: 'markdown import: path outside
  corpus root: <file>', failedFile: <file> }` (`markdown-import.ts:88-90`).
  The `store` argument cannot influence any path except by selecting the
  server-side root (ADV-1/R7 — adversarial-pinned after green).
- **HANDOFF (explicit, binding):** U-MS2 owns passing the root per store AND
  the third-argument `ImportStoreContext` pass-through (pinned above — the
  production activation of STORE-ID-PREFIX, F2); **U-MS4 owns** (a) the
  importer's internal relative-path re-point
  `markdown-import.ts:84` `resolve(file)` → `resolve(corpusRoot, file)`, (b)
  the `<name>:` documentId prefixing (`markdown-import.ts:120-128`), and (c)
  the optional third `ImportStoreContext` parameter that makes the pinned
  pass-through compile. After
  U-MS2 ALONE, a RELATIVE `files` entry still resolves against
  `process.cwd()` (`markdown-import.ts:84` unchanged) and must independently
  pass `isWithin(abs, corpusRoot)` — for a non-default store whose corpusRoot
  ≠ cwd a relative path generally fails containment; that is the DOCUMENTED
  INTERIM STATE, not a bug, and U-MS2's red set must NOT assert
  resolve-against-root for relative paths (that assertion is U-MS4's). The
  tool schema stays `files`-only (`mcp-server.ts:1078` — ADV-1 preserved).
- **Red-set addition (binding, F2):** U-MS2's red set asserts the WIRED import
  path end-to-end — an `edit.import_markdown` call routed through the
  directory into a NON-default store mints `<name>:`-prefixed documentIds
  (STORE-ID-PREFIX activated through the wired path via the third-argument
  pass-through above), and the default store's wired import stays UNPREFIXED
  (byte-equal — the §5.9 Import-root row). Execution-order note: the
  unprefixed-default half is green at U-MS2's own trio; the prefixed half is
  recorded in U-MS2's red set and goes green with U-MS4's importer parameter
  (the U-MS2 → U-MS4 order — the two units land this seam together; the
  contract + the assertion are owned HERE).
- ONE-WAY-SNAPSHOT holds per store (each store's import is its own one-shot
  batch journal entry — `markdown-import.ts:144-165`).

### 5.7 The failed-store behavior matrix (store state × tool class)

Per-store boot states (D7 — the store's OWN fail-disabled contract,
`rag-store.ts:555-629,632-680,1231-1243`):

| State | File condition | `entry.missing` | `entry.corrupt` | Meaning |
| --- | --- | --- | --- | --- |
| **loaded** | present + valid (`version: 1`, parseable) | `false` | `false` | normal service |
| **failed-corrupt** | present but unparseable / non-object / wrong version (`rag-store.ts:574,577,581`) | `false` | `true` | the store serves EMPTY — exactly today's single-store semantics, PER STORE; boot continues |
| **failed-missing** | absent (first run) | `true` | `false` | an empty store — NOT an error state; boot continues |

The three states are DERIVED by the exported `storeLoadStatus(entry)` accessor
(§5.1 — the exact surface U-MS5's settings listing consumes,
`unit-ms5-settings-listing.md` §5.4): `entry.missing` (the boot-captured
`!existsSync(cfg.persistenceFile)` flag) ⇒ `failed-missing`; else
`entry.corrupt` ⇒ `failed-corrupt`; else `loaded`. `entry.corrupt` ALONE
cannot distinguish `loaded` from `failed-missing` (both `false`) — the
missing flag is the D7 discriminator (F6).

**Tool-class matrix** (the store's own empty-store semantics; every per-tool
domain error is UNCHANGED — the taxonomy is `unknown store` (selector, §5.3) +
`no rag store configured` (null store, unchanged, `mcp-server.ts:135,371`) +
the unchanged per-tool domain errors):

| Tool class (tools) | loaded | failed-corrupt / failed-missing (both serve EMPTY — identical tool behavior; they differ ONLY in which flag is set — `failed-missing`: `missing === true, corrupt === false`; `failed-corrupt`: `missing === false, corrupt === true` (F6)) |
| --- | --- | --- |
| Read-census: `rag.list_nodes`, `rag.get_edges` | normal | `[]` |
| Read-scoped: `rag.get_document`, `rag.backlinks` | normal | `rag.get_document` ⇒ `{ documentId, nodes: [], edges: [] }` (the HOST-6 pin, `unit-v2-scoped-traversal-mcp.md` §5.3); `rag.backlinks` ⇒ `{ nodeId, backlinks: [], outlinks: [], crosslinkBacklinks: [], crosslinkOutlinks: [] }` (`backlinks.ts:105-117`) |
| Retrieval: `rag.query` | normal | `{ query, ranked: [], context: [], markdown: '', lineMap: { ranges: [] }, k, store: <the addressed entry's registry name> }` — the engine was constructed over the empty store (`retrieval.ts:558-567`; `lineMap` is `{ ranges }` — `retrieval.ts:341,489`, `RagQueryResult.lineMap` `shared/types.ts:471`; the additive `store` field per §5.9) |
| Content edit: `edit.set_content` | normal | `{ ok: false, error: 'edit.set_content: node not found' }` (`edit-ops.ts:162`) |
| Structural edits: `edit.create_node` / `edit.delete_node` / `edit.split_node` / `edit.merge_node` / `edit.set_edge` | normal | `create_node` ⇒ `{ ok: true, node }` (writes INTO the empty store — the single-writer queue + journal + persist are the store's own Unit A contract; U-MS2 adds NO repair/quarantine/lock-out layer); `delete_node` ⇒ `{ ok: true, removed: false }` (`edit-ops.ts:216-218`); `split_node` ⇒ `{ ok: false, error: 'edit.split_node: node not found' }` (`edit-ops.ts:230-231`); `merge_node` ⇒ `{ ok: false, error: 'edit.merge_node: source/target not found' }` (`edit-ops.ts:279`); `set_edge` ⇒ `{ ok: false, error: 'edit.set_edge: source/target node not found or quarantined' }` (`edit-ops.ts:370`) |
| Import: `edit.import_markdown` | normal | `{ ok: true, documentIds, nodeCount, edgeCount }` — the corpus imports INTO the empty store; the resulting file rewrite is the store's persist discipline (Unit A) |

**Cross-store independence (pinned):** each store's state affects only its own
entries/tools — a corrupt `research-2026-09` store never changes a `main`
result, and vice versa. The selector still resolves a corrupt store's name
(the name exists in the registry regardless of the file state) — a call
addressing it serves the empty-store row above, never `unknown store`.

**Default-store-corrupt boot (pinned regression):** the window loads and
`mcp.start()` runs (`main.ts:411,425`); every default-store-addressed tool
(incl. all omitted-store calls and ALL UI/IPC surfaces) serves the empty-store
row above. In vector mode the warm-up is unaffected by store corruption (it
probes the PROVIDER, `main.ts:159`, not the store).

**Documented limitation (F-MS2-3, 2026-09-05):** the registry's
persistence-collision detection is purely LEXICAL — resolve-normalized, and
casefolded on darwin/win32 (`unit-ms1-store-registry.md` §5.3.2 Pass D) — and
does NOT detect symlink/hardlink INODE aliasing: two registry entries whose
persistence paths alias one file through links do NOT collide at validation,
and the aliasing stores are LAST-WRITER-WINS on the shared file (each store's
own single-writer queue cannot see the other's writes). Phase 1 accepts this
as operator discipline (the registry file is operator-authored; the
realpath/inode-identity hardening is a parked follow-up, not a Phase-1 gap).

### 5.8 The invalid-registry boot rule + the boot-order state matrix

**The invalid-registry abort (wired before the window):** the U-MS1 loader
runs at the `main.ts:116-120` position (§5.4 step 1). Valid-JSON-but-invalid
registry ⇒ the loader throws (U-MS1's fail-loud error set — cite
`docs/specs/unit-ms1-store-registry.md`; do not restate the messages here) ⇒
`main()`'s catch logs `[provident-main] fatal:` + `app.exit(1)`
(`main.ts:443-448`). NOTHING downstream runs: no `createJsonRagStore`, no
engines, no cache file, no MCP server socket, no `BrowserWindow`, no renderer
load. This matches the existing vector-config-missing abort precedent
(`main.ts:156-158`). Corrupt/unreadable file ⇒ fail-soft (the implicit entry +
U-MS1's pinned log) — boot continues.

**Boot-order state matrix (registry state × per-store file state; the
per-store file states compose independently across stores):**

| Registry file state | Registry view | Boot outcome |
| --- | --- | --- |
| **absent** (no `provident-rag-stores.json`) | the implicit entry `{ name: 'main', default: true }` → legacy `provident-rag.json`, no corpusRoot (U-MS1/D3 — synthesized, never written back) | boot continues; 1 store + 1 engine; the store's own file state applies (missing ⇒ failed-missing; corrupt ⇒ failed-corrupt serves empty; present+valid ⇒ loaded) |
| **corrupt/unreadable** (byte-garbage, invalid JSON) | fail-soft: the SAME implicit entry + U-MS1's pinned log | boot continues — identical to absent at the behavior level |
| **valid JSON, invalid registry** (fails U-MS1 validation: name charset / duplicate names / no or multiple defaults / persistence-file collision / relative roots / `embedder` present) | — | **FAIL-LOUD abort BEFORE the window** (§5.4 step 1); no store file created/written; no engine; no MCP server; exit code 1 |
| **valid** | N entries, exactly one default, unique resolved persistence files, absolute roots | boot continues; N stores + N engines (§5.1); each store's file state independent |

**Registry read-once (D8 wiring pins):** the loader is called exactly once per
boot; `IPC_OPERATOR_SETTINGS_SET` (`main.ts:361-370`) never touches the
registry and no `ragStores` field is added to `OperatorSettings`; a registry
file changed while running is observed only after restart (live-battery/code-
review pin — no code path re-reads it).

### 5.9 Zero-config byte-equality acceptance criteria (this unit's §4 rows)

With **no** `provident-rag-stores.json` present, every row below is byte-equal
to today EXCEPT the ONE intentional delta the review §4 table enumerates,
which is SPLIT by ownership (F3): the `store:'main'` field on
BROADCAST/SNAPSHOT payloads belongs to **U-MS3**; the `store:'main'` field on
the query RESULT shapes — review §4 row "Tool results" (`retrieval.ts:507-519`,
evidence row) — is **THIS UNIT'S**: U-MS2 owns the engine-map construction and
BOTH query surfaces, so it owns the additive result field. U-MS2 adds exactly
ONE additive field — `store: string` — to the query RESULT shapes and NO other
field to any payload or result.

| Row | Today | Zero-config after U-MS2 | Pinned acceptance (red-test formulation) |
| --- | --- | --- | --- |
| **Store persistence file** | `provident-rag.json` (userData) — `main.ts:118-120` | the implicit `main` entry's `persistenceFile` IS `join(userData, 'provident-rag.json')`; no `provident-rag-stores.json` is CREATED (D3) | `buildRagStoreDirectory` over the U-MS1 loader's absent-file output ⇒ `entries.size === 1`, `entries.get('main')` present, `defaultName === 'main'`; after a `putNode` through that entry's store, the legacy file exists and `provident-rag-stores.json` does NOT |
| **Engine-construction branch** | lexical `createRetrieval(ragStore, createLexicalEmbedder(createLexicalIndex(ragStore.listNodes())))` / vector `createVectorBootController(ragStore, provider, { embedBatchFn, cache: createVectorCache() })` — `main.ts:145-173`, cache file `provident-vector-cache.json` (`vector-cache.ts:81`, `main.ts:168`) | the DEFAULT store takes the IDENTICAL branch; `plan.vectorBoot` is `null` in lexical mode and the single controller in vector mode with `entry.engine === vectorBoot.engine` (W1); the cache is constructed `createVectorCache({ path: join(opts.userDataPath, 'provident-vector-cache.json') })` — byte-equal to today's Electron default file (`vector-cache.ts:114-133` resolves the SAME path via `app.getPath('userData')`; the NO-ARG form throws outside Electron — F8, and the explicit path is what makes the vector-plan red test NODE-RUNNABLE in vitest) | lexical plan ⇒ `vectorBoot === null` and the entry's engine answers queries over the store's nodes; vector plan (a warmed FAKE provider) ⇒ exactly one `vectorBoot`, `entry.engine === vectorBoot.engine`, and the non-default entries (if any) are lexical engines with NO cache involvement |
| **Import root** | `resolve(file)` vs the cwd default `process.cwd()` — `markdown-import.ts:66,84` | the implicit entry's `corpusRoot` is `undefined` ⇒ the handler passes `corpusRoot: undefined` ⇒ the importer's `?? process.cwd()` default ⇒ byte-identical resolution (the `resolve(file)` line is U-MS4's) | `entries.get('main').corpusRoot === undefined`; a `edit.import_markdown` call through the directory with a RELATIVE file under cwd succeeds exactly as the pre-U-MS2 legacy call does (the existing no-corpusRoot importer tests stay green) |
| **Tool results** | current shapes (`retrieval.ts:560-567` etc.) | identical semantics + the ONE additive query-RESULT field (F3; **F-MS2-4 erratum** — the required `store` lives on the tool RESULT the shared handler RETURNS — the MCP `rag.query` result / the IPC `RagQueryResult` (`shared/types.ts:466-474`) — stamped at the ONE shared seam (`handleRagTool`, `mcp-server.ts:181`), serving BOTH query surfaces — MCP-UI-EQUIVALENCE). `RetrievalResult` (`retrieval.ts:507-519`) gains NO field BY DESIGN — the engine is store-name-blind and a raw `engine.query()` result carries no `store`. Zero-config queries carry `store: 'main'` (the ONE intentional delta, shared with U-MS3's broadcast/snapshot delta — review §4 rows "Tool results" + "Broadcast payloads"); a non-default-store query carries that store's registry name; the legacy directory-less sentinel (`dir == null`) carries `''` (the §5.3 step-5 legacy discipline). The 11 non-query tools' results are UNCHANGED | for EACH of the 12 tools: the result of the directory-routed call with `store` OMITTED deep-equals the legacy directory-less call's result on EVERY field EXCEPT the enumerated `store` delta on the query result (`'main'` directory-routed vs `''` legacy — same fixtures, same store state); the same equality holds for `store: 'main'` including the handler-result `store === 'main'` (the omitted ≡ explicit-default equivalence, §5.3); a `rag.query` with `store: '<non-default-name>'` returns `store: '<that name>'` on BOTH surfaces (the tool — node-tested at U-MS2; the IPC through `handleRagQueryIpc` — EXECUTION-ORDER STAGING: the `RagQueryPayload.store?` FIELD itself is U-MS5's, so U-MS2 pins the IPC half via the §5.4 step-4 `dir` plumbing with a locally-constructed payload fixture, and U-MS5's red set completes the end-to-end row — **COMPLETED 2026-09-05, U-MS5)** |

> **Erratum (F-MS2-4, the §3a adversarial batch — the Architect's ruling,
> 2026-09-05):** the pinned TYPE-level location claim is superseded: the
> required `store` lives on the tool RESULT the shared handler returns
> (`RagQueryResult`, `shared/types.ts`) and is stamped at the ONE shared seam;
> `RetrievalResult` gains NO field — the engine is store-name-blind; a raw
> `engine.query()` result carries no store. (The F3 field exists ONLY at the
> shared-handler seam — the ratified ONE-stamp-point ruling; the tests already
> pinned the ACTUAL behavior — the `store` stamp is read off the handler
> result, never off the engine's.)

### 5.10 Census / numeric claims

- **Tools gaining the optional `store` argument:** 12 (5 `rag.*` + 7 `edit.*`
  — `security.ts:34-45`; the review §9 census row). New MCP tool names: 0.
  New `RpcMethod` values: 0. `TOOL_GROUPS` changes: 0. Descriptions changed: 1
  (`edit.import_markdown`, §5.2).
- **NEW module:** 1 (`src/main/rag-store-directory.ts`) — exports: 3 functions
  (`resolveStoreArg`, `buildRagStoreDirectory`, `storeLoadStatus`) + 6 interfaces
  (`ResolvedRegistryStore`, `ResolvedRegistry`, `RagStoreEntry`,
  `RagStoreDirectory`, `ResolvedStoreRef`, `RagStoreBootPlan`).
- **Signature changes:** `handleRagTool` +1 trailing optional param;
  `handleEditTool` +1 trailing optional param AND the `onStoreChanged`
  callback widened to `(payload, storeName)` (backward-compatible);
  `handleRagQueryIpc` +1 trailing optional param (`dir` — the F4 directory
  injection, §5.4);
  `McpServerOptions` +1 field (`ragStores`); the static `registerTools`
  signature +1 param (both call sites `mcp-server.ts:779,923` updated).
- **`main.ts` default-store binding sites preserved:** 10 (§5.4 step 4's
  enumerated ranges — re-grepped: the only other `ragStore`/`retrievalEngine`
  references in `main.ts` are the construction/branch lines this unit
  replaces (`:118-120`, `:146-172`) and the `vectorBoot` start
  (`:431-435`, step 6));
  reconcile sites re-pointed to the default engine: 3 (`main.ts:246,283,307`).
- **Additive query-result field (F3; F-MS2-4 erratum):** 1 — `store: string` on
  the shared handler's `rag.query` RESULT (`RagQueryResult`,
  `shared/types.ts:466-474`), stamped at the ONE shared seam (`handleRagTool`)
  serving the MCP tool and the `rag-query` IPC (§5.9 — the review §4 "Tool
  results" row, U-MS2-owned). `RetrievalResult` (`retrieval.ts:507-519`) gains
  NO field — the engine is store-name-blind (the §5.9 erratum note). No other
  payload/result field is added by this unit.
- **Byte-pinned NEW fail messages:** 2 resolver messages (M1, M2) + 3
  defensive messages (M3, the one-default guard, the F-MS2-7 kind guard
  `rag-store-directory: embedderKind must be 'lexical' or 'vector' (got <json>)`)
  — §5.1/§3a. The F-MS2-1 batch additionally added F14 to U-MS1's module (the
  registry-file self-collision — `unit-ms1-store-registry.md` §5.4's census:
  14 fail-loud + 2 guards). Re-pinned unchanged:
  `no rag store configured` (`mcp-server.ts:135,371`), the vector-config
  message (`main.ts:157`).
- **Estimated new tests:** 28–36 (the review §6 row — "the hardest unit").
  **LANDED: 63** (`tests/unit-ms2-store-wiring.test.ts` tests 01–63 — 62 pass /
  1 staged red, the single failure the UNTOUCHED test-56 F2 staging pin,
  U-MS4's; the §3a R-series is tests 58–63 + the sanctioned test-20 re-pin).
- **No store-census MCP tool** (A9/B9): the census is U-MS5's operator UI;
  nothing in this unit may enumerate store names to an agent — the ONLY
  store-name bytes that ever appear in an error are the caller's own input
  (M2).

### 5.11 Cross-references

- **U-MS1:** `docs/specs/unit-ms1-store-registry.md` — the registry module
  this unit consumes (the loader's fail-soft/fail-loud split, the implicit
  entry, MIGRATION-LEGACY-PATH, the validation error set). U-MS2 pins only
  the CONSUMED view (§5.1) — U-MS1's exported surface is its contract.
- **U-MS3:** `docs/specs/unit-ms3-store-qualified-broadcast.md` — the payload
  `store` field, the three structural declarations, the host boot-store
  capture, the re-derive guard. NOT this unit: every emission site keeps the
  `{ kind, nodeIds, edgeIds }` shape here — but the query-RESULT `store`
  field (on the handler-returned `RagQueryResult`, `shared/types.ts`;
  `RetrievalResult` gains NO field — the F-MS2-4 erratum) IS this unit's
  (§5.9, F3).
- **U-MS4:** `docs/specs/unit-ms4-id-prefixing.md` — the import minting seam:
  `resolve(corpusRoot, file)` (`markdown-import.ts:84`) + the `<name>:`
  documentId prefixing + the A1 prefix-namespace hole. The §5.6 handoff is
  binding on both units — the third-argument `ImportStoreContext`
  pass-through is PINNED in §5.6 (this unit's wiring; the parameter itself is
  U-MS4's).
- **U-MS5:** `docs/specs/unit-ms5-settings-listing.md` — the read-only
  settings listing (consumes the directory entry view: `name`, `corpusRoot`,
  and the D7 status via the exported `storeLoadStatus`) + the
  `RagQueryPayload.store` passthrough over the §5.4 directory injection
  (F4). NO store-census MCP tool (A9).
- **Gate:** `docs/specs/multi-document-store-config-review.md` §2 (D2, D3, D4,
  D5, D7, D8, D10, D11), §3 (the unit table — U-MS2 row), §4 (the byte-
  equality table), §8 (A4, A5, A6, A7, A9), §5 (R1, R6, R8, R10), §7 (the
  context-budget condition this unit's extraction satisfies).
- **Decisions:** `docs/decisions.md` rows **MULTI-STORE-REGISTRY**,
  **SINGLE-WRITER-STORE-PER-STORE**, **ENGINE-PER-STORE**,
  **STORE-QUALIFIED-BROADCAST** (consumed), **STORE-ID-PREFIX** (consumed),
  **IMPORT-ROOT-PER-STORE**, **VECTOR-TOPOLOGY-PER-STORE**,
  **UI-SELECTOR-DEFERRED**; refined rows **SINGLE-WRITER-STORE** (line 21),
  **ENGINE-PER-STORE**'s Unit E F1 base (`unit-e-rag-index.md:93-109`).
- **Extraction precedent:** Unit U5 F1 — `handleRichCommitIpc`
  (`edit-ops.ts:689-747`; `unit-u5-set-rich-text.md` §5) — the shared-handler
  extraction that keeps the Electron boundary thin; this unit applies the same
  discipline to the store directory.
- **Host seams cited:** `main.ts:116-120,145-173,153,156-159,168-170,174,237,
  246-249,270-274,282-286,306-308,316-318,324-326,333-335,361-370,377-380,411,
  425,431-435,443-448`; `mcp-server.ts:129-135,142-149,195-204,349-353,365-452,
  579-604,608-644,779,923,931-942,1067-1078,1114-1136,1131,1134`;
  `rag-store.ts:208-213,555-629,632-680,1231-1243`; `edit-ops.ts:18-23,156-167,
  173-209,213-221,227-259,274-286,344-375,413,434,689-747`;
  `markdown-import.ts:16-24,59-66,80-90,120-128,144-165`; `backlinks.ts:105-117`;
  `retrieval.ts:558-567,574-587`; `vector-cache.ts:81,114-133,170-174`;
  `security.ts:34-45`; `vector-boot.ts:110-114`.
- **A8/R11 (doc cost, NOT this spec's edit):** the per-unit doc review
  reconciles `docs/specs/mcp-endpoint.md` §3/§6.2 (the store-arg rows + the
  stale group table) and `docs/specs/astrographer-review.md` §9.2.7 in the
  same pass as the code.

## 6. Unit → file → test-file mapping

| Unit artifact | File(s) | Test file | Notes |
| --- | --- | --- | --- |
| The pure resolver + directory construction | `src/main/rag-store-directory.ts` (NEW) | `tests/unit-ms2-store-wiring.test.ts` | the resolver state matrix (§5.1 S1-S3, M1-M3), the per-state messages byte-exact, the construction rules (§5.1 1-6), the A6 lexical-only pin, the one-default guard |
| The 12 tool schemas + resolution + routing | `src/main/mcp-server.ts` (`handleRagTool`, `handleEditTool`, `registerTools`, `McpServerOptions`) | `tests/unit-ms2-store-wiring.test.ts` | the 12 per-tool resolution/ordering tests (§5.3), the omitted ≡ explicit-default equivalence, the reconcile routing (§5.5), the import-root passing + description + the wired `ImportStoreContext` pass-through with its prefix assertion (§5.6 — F2); the query-result `store` stamp rows (§5.9 — F3); the IPC `dir` injection (§5.4 — F4); `storeLoadStatus` + the D7 three-state derivation (§5.1/§5.7 — F6); SDK-level wiring via `InMemoryTransport` + `client.callTool` (the `tests/embeddings-adversarial.test.ts:104-119` pattern) for schema acceptance + an end-to-end selector call |
| The boot wiring | `src/main/main.ts` (the registry load + plan construction; the 12 default bindings; the 3 reconcile re-points) | `tests/unit-ms2-store-wiring.test.ts` (via the node-testable seams — `buildRagStoreDirectory` + the handlers; `main.ts` itself is never imported by tests) | the boot matrix (§5.8) at the module level; the abort ordering + the read-once rule are code-review/live-battery pinned |
| Red-set size | — | ~28–36 tests | the review §6 estimate; recorded in the `docs/next-steps.md` DONE row per RCA-1 — **LANDED: 63 tests (62 pass / 1 staged red; test 56 is U-MS4's staging pin)** |

**Existing test files that MUST stay green** (the full trio — `npm test` +
`npm run typecheck` + `npm run build` — after the unit lands, per AGENTS.md
item 4); the directly affected set:

- `tests/rag-edit-gate.test.ts` (the five-seam + handler seams —
  `handleEditTool` direct calls must stay compatible with the widened
  callback),
- `tests/mcp-server-wiring.test.ts`, `tests/mcp-server-gate.test.ts`,
  `tests/mcp-security-hardening.test.ts` (the gate/registration audits —
  `ALL_TOOLS` unchanged),
- `tests/edit-ops.test.ts`, `tests/edit-adversarial.test.ts`,
  `tests/unit-o-edit-ops.test.ts`, `tests/unit-n-batch-atomicity.test.ts`,
  `tests/unit-p-ipc-edit-batch.test.ts` (the op layer — untouched by U-MS2),
- `tests/rag-store.test.ts`, `tests/rag-store-adversarial.test.ts`,
  `tests/unit-v1-store-adjacency.test.ts` (the store layer),
- `tests/retrieval.test.ts`, `tests/retrieval-adversarial.test.ts`,
  `tests/vector-boot.test.ts`, `tests/vector-cache.test.ts`,
  `tests/embeddings-adversarial.test.ts` (the engine branch + the SDK seam),
- `tests/unit-t-markdown-import.test.ts` (the importer — including the
  no-corpusRoot cwd-default coverage that IS the import-root byte-equality),
- `tests/traversal.test.ts`, `tests/unit-v2-scoped-traversal-mcp.test.ts`
  (+adversarial) (the `rag.get_document` contract U-MS2 re-points but must
  not change),
- `tests/sidebar-panes-host.test.ts`, `tests/editing-mode-broadcast-host.test.ts`
  (the default-store UI bindings),
- `tests/security.test.ts`, `tests/security-gate.test.ts`,
  `tests/security-store.test.ts` (the gate seams — unchanged).

**Explicitly out of scope for this unit's code (owned elsewhere):** the
broadcast payload `store` field + the snapshot field (U-MS3), the importer's
`resolve(corpusRoot, file)` + documentId prefixing (U-MS4), the settings
listing IPC/preload/pane + the `RagQueryPayload.store` passthrough (U-MS5),
the registry module itself (U-MS1). Any of those appearing in this unit's diff
is a scope violation.