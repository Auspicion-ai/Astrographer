# Unit MS2 — Store-Instance Wiring + the `store` Selector: LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-05.**
- **Source contract:** `docs/specs/unit-ms2-store-wiring.md` — §5.1 (the pure
  directory module: the resolver S1–S3/M1–M3 + the F-MS2-5 echo cap + the
  F-MS2-7 kind guard), §5.2 (the 12 schemas + the F-MS2-6-amended A5
  description), §5.3 (R1–R7 + the 12-tool ordering matrix), §5.4 (the boot
  wiring + F4), §5.5 (the reconcile routing), §5.6 (the per-store import
  root), §5.7 (the failed-store matrix), §5.8 (the boot matrix), §5.9 (the
  byte-equality matrix incl. the F3 `store` delta); plus
  `unit-ms1-store-registry.md` §5.4 (the F14 self-collision) and §3a
  (F-MS2-1..F-MS2-11).
- **Greens battery (blind-test, already run against the live MODULES):**
  `docs/specs/unit-ms2-store-wiring-greens.md` — 46 scenario rows
  (43 executable + 3 DEFERRED): **43 PASS / 0 FAIL / 3 DEFERRED**
  (the recorded run: 46/46 vitest tests, exit 0).
- **Status:** **PARKED — NOT run against the live application.** Pattern
  precedent: `docs/specs/unit-ms1-store-registry-live-pending-battery.md`
  (the same surface-absence park shape). This battery is the handoff for a
  LATER iteration of the live-scenario runner, to be executed once the app is
  restarted with the rebuilt `dist/` (the U-MS2 build is already on disk —
  see §1.3).

---

## 1. Why this battery is parked (the live-surface assessment, verified live 2026-09-05 ~22:50 UTC)

Same situation as the U-MS1 battery: **the app IS running and its MCP server IS
reachable** (pid 295555, `npm exec electron . --no-sandbox`, started
**2026-09-05 10:16:16**; `initialize` + `tools/list` both succeeded over
streamable HTTP at `http://127.0.0.1:3787/mcp`; serverInfo
`provident-electron` v0.1.0, protocolVersion 2025-03-26; the transport is
STATELESS — a fresh server per POST, no session id needed, GET/DELETE → 405).
The park is a **surface-absence park**, verified live:

### 1.1 The live MCP surface carries NO `store` argument (the decisive probe)

Live `tools/list` (39 tools) — the 12 rag/edit tools are present and ENABLED,
but **NONE of their inputSchemas has a `store` property** (parsed per tool):

| Tool | live props | `store`? | U-MS2 target (spec §5.2) |
| --- | --- | --- | --- |
| `rag.query` | `["query","topK"]` (req `["query"]`) | **absent** | + `store` optional |
| `rag.get_document` | `["documentId"]` | **absent** | + `store` |
| `rag.list_nodes` | `[]` | **absent** | becomes `{store}` |
| `rag.get_edges` | `["nodeId"]` | **absent** | + `store` |
| `rag.backlinks` | `["nodeId"]` | **absent** | + `store` |
| `edit.set_content` | `["nodeId","content"]` | **absent** | + `store` |
| `edit.create_node` | `["type","content","parentId","props"]` | **absent** | + `store` |
| `edit.delete_node` | `["nodeId"]` | **absent** | + `store` |
| `edit.split_node` | `["nodeId","at"]` | **absent** | + `store` |
| `edit.merge_node` | `["sourceId","targetId"]` | **absent** | + `store` |
| `edit.set_edge` | `["kind","source","target","edgeId","order","documentIds"]` | **absent** | + `store` |
| `edit.import_markdown` | `["files"]` | **absent** | + `store` |

### 1.2 The live A5 description is the OLD (pre-amendment) string

Live `edit.import_markdown.description` (verified byte-read from `tools/list`):

> `Import a corpus of markdown files into the RAG store as a ONE-WAY SNAPSHOT
> (parse → validate doc-flow → applyBatch as ONE atomic batch journal entry).
> Requires edit group. The corpus root is fixed server-side (the project
> root) — it is NOT an agent-supplied argument.`

That is the OLD tail ("the project root"). The U-MS2/F-MS2-6-amended string
("…into the addressed RAG store… per store: the addressed store's configured
corpus root; the default store's root is its configured corpus root (the
project root when unconfigured)…") is NOT live. This also resolves greens
S42's deferral: the byte-level A5 + zod census rows were deferred because the
12 tools register at the SDK `start()` seam — the LIVE `tools/list` is exactly
that seam's observable, so S42 becomes executable on the restarted app.

### 1.3 The repo HAS landed U-MS2 — the process predates it (a restart is the only gap)

- `src/main/rag-store-directory.ts` EXISTS (14258 bytes, 2026-09-05 13:26);
  `src/main/mcp-server.ts` carries 13 `store: z.string().optional()`
  occurrences (the 12 inputSchema rows + the §5.2 comment line naming the
  field — the resolver itself takes the raw `args?.store` value; there is NO
  resolver zod row); `src/main/main.ts` imports
  `loadRagStoreRegistry` (`:18`) + `buildRagStoreDirectory` (`:19`) and wires
  them at `:128` (registry load) → `:176` (`buildRagStoreDirectory`) → `:199`
  (`ragStores: plan.directory` into the server options) — the U-MS1 battery's
  revisit condition is now MET in source.
- `dist/main/*` was rebuilt 2026-09-05 **13:30** and the bundle contains the
  new wiring (`grep -c 'rag-store-directory\|resolveStoreArg'` on
  `dist/main/main.cjs` → 10; the registry loader → 20 hits).
- The RUNNING process started **10:16** — ~3 h BEFORE the rebuild. Electron
  loaded the old `main.cjs` into memory at boot; rebuilding `dist/` does not
  affect it. **The app must be RESTARTED to serve the U-MS2 build** (the
  operator action; this runner does not start/restart the app).

### 1.4 Live negative control (proves the park; recorded so its silence is never mistaken for a pass)

`tools/call rag.query {query:'provident', topK:3, store:'nope', bogusExtra:1}`
against the CURRENT build → **200 OK, normal ranked results served** (the old
build's lax schema ignores both unknown keys). Under the U-MS2 build the SAME
call MUST fail loud with `rag.query: unknown store 'nope'` (M2, §5.1). If that
call still succeeds after the restart, the wiring has not taken effect and this
battery re-parks (the §5.2 P0-first rule).

### 1.5 The F3 `store` stamp is absent live

`tools/call rag.query {query:'provident', topK:2}` → the result's top-level
keys are exactly `query, ranked, context, markdown, lineMap, k` — **no `store`
field**. Under U-MS2 the routed result gains `store: '<resolved name>'`
(F3/F-MS2-4 — the stamp lives on the handler result; greens S24).

### 1.6 Boot-log observables are not capturable from this session

The registry load outcomes (the fail-soft LOG-1 line, the fail-loud F1–F14
aborts, the directory guards) are observables of the BOOT PROCESS
(stdout/stderr + exit behavior). The running instance was launched elsewhere;
its boot output is not capturable, and relaunching is out of scope (the
do-not-start constraint). The MCP port never listening after a failed boot is
the secondary live signal.

**Conclusion:** the U-MS2 surface (the `store` selector, the resolution
errors, the amended description, the boot-time store construction) is not yet
live — the app serves the pre-U-MS2 bundle. Per the live-runner contract these
scenarios are **parked** (not failures) and recorded here.

---

## 2. The live surfaces that WILL exercise the U-MS2 behavior (after the restart)

| Live surface | U-MS2 behavior it exposes | How to drive it live |
| --- | --- | --- |
| `tools/list` inputSchemas + descriptions | The `store: z.string().optional()` row on ALL 12 tools; the amended A5 description (S42's byte rows) | Parse every `inputSchema.properties`/`required` from the live `tools/list` |
| `tools/call` on the 12 tools | R1–R7 resolution, the M1/M2 fail-loud errors, the F3 `store` stamp, per-store routing/coherence, the per-store import root | `tools/call` with `store` omitted / known / unknown / malformed |
| The boot process' stdout/stderr + exit behavior | The §5.8 boot matrix (absent/corrupt/invalid registry), the F14 self-collision abort, the F-MS2-7 guard, the FIFO fail-soft load | `HOME=$(mktemp -d) npm start > boot.log 2>&1` against a scratch userData |
| The userData dir itself | D3 no-write-back (the registry file is never created/modified); derived store files appear only on first write; the F8 vector-cache path | Snapshot the dir + file bytes before/after boot and after calls |
| The per-store persistence files | Which `provident-*.json` files the stores open (first write) — `main` ⇒ legacy `provident-rag.json`, others ⇒ `provident-rag-<name>.json` | Inspect the test userData after seeded edits |
| (U-MS5) the settings-pane store listing | The directory's presentation view (`storeLoadStatus`) | `provident.get_rendered_html` / `get_markdown` once U-MS5 lands |

**Prerequisites for the later run (MANDATORY):**

1. An ISOLATED test userData — on Linux `app.getPath('appData')` follows
   `$HOME`, so `HOME=$(mktemp -d) npm start > boot.log 2>&1` boots against a
   scratch `$HOME/.config/provident-electron/` without touching the real
   userData (`/home/ryanr/.config/provident-electron/` — which holds the real
   62 MB legacy `provident-rag.json` and must NEVER be modified by a battery;
   do not plant files there).
2. The operator restart: `npm start` (rebuilds then launches) or a relaunch of
   the current build; the MCP server must be reachable (default port 3787;
   `--mcp-port=` / `PROVIDENT_MCP_PORT` to avoid clashing with a still-running
   old instance).
3. Registry fixtures are planted at
   `$T/.config/provident-electron/provident-rag-stores.json` (`$T` = the
   mktemp dir) BEFORE boot.

**The MCP probe verbs (stateless HTTP — no session handshake required):**

```bash
curl -sS -X POST http://127.0.0.1:3787/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
# response is SSE: parse the `data: ` line; tools[] → name/inputSchema/description

curl -sS -X POST http://127.0.0.1:3787/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"rag.query","arguments":{"query":"x","store":"research-2026-09"}}}'
```

A thrown handler error surfaces as the SDK's `tools/call` error — assert the
byte-pinned message from `error.message` (JSON-RPC error) or from
`result.content[0].text` (`isError: true` result), whichever encoding the SDK
emits; the MESSAGE text is the contract, not the envelope.

---

## 3. The concrete live probes to run once the app is restarted

The "expected" column re-expresses the greens/spec expectation as a live
observable. A live result that CONTRADICTS the greens or the spec is a finding
(a regression or a doc/spec drift) — never a pass.

### P0 — the negative control must FLIP (proves the restart took the new build)

| Step | Expected after the U-MS2 build is live |
| --- | --- |
| `tools/call rag.query {query:'x', store:'nope'}` | FAILS LOUD with `rag.query: unknown store 'nope'` (M2). The §1.4 success-on-the-old-build must FLIP. If it still succeeds, the wiring is not live ⇒ re-park. |
| `tools/list` — the 12 rag/edit inputSchemas | Every one carries `store` in `properties` (`type: 'string'`, not required). |

### 3.1 Class M1 — the `store` selector schema surface (greens S41, S42)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| S41 | `tools/list` schema census for the 12 tools; per tool a call with `store` OMITTED (+ a lax extra key) | All 12 list the `store` property; the other fields unchanged; every omitted-`store` call behaves per its tool contract (no unexpected throws). |
| S42 (was DEFERRED) | Byte-read `edit.import_markdown`'s description; byte-read the other 11 descriptions | `edit.import_markdown` carries the AMENDED A5 string byte-exact: `Import a corpus of markdown files into the addressed RAG store as a ONE-WAY SNAPSHOT (parse → validate doc-flow → applyBatch as ONE atomic batch journal entry). Requires edit group. The corpus root is fixed server-side per store: the addressed store's configured corpus root; the default store's root is its configured corpus root (the project root when unconfigured) — it is NOT an agent-supplied argument.`; the other 11 descriptions byte-unchanged from today's live values. |

### 3.2 Class M2 — resolution routing + the F3 stamp + the per-store import root (greens S09, S16, S22, S24, S26, S37, S38)

Prereq: a multi-store registry in the TEST userData, e.g.
`{"version":1,"stores":[{"name":"main","default":true},{"name":"research-2026-09","corpusRoot":"$T/corpus"}]}`
(derived persistence paths; `main` must open the LEGACY `provident-rag.json` —
observable on first write). Seed the second store via MCP
(`edit.create_node {type:'p', content:'<token>', store:'research-2026-09'}` —
a MUTATING call, safe only in the isolated userData).

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| S16 (R1) | `rag.query {query:'<token>'}` (omitted `store`) | Served by the DEFAULT entry: the seeded main-store node hits; result `store === 'main'`. |
| S16 (R3) | `rag.query {query:'<token>', store:'research-2026-09'}` | Served by THAT entry: its own data; result `store === 'research-2026-09'` (F3 stamp per call). |
| S22 | The omitted call vs `store:'main'` | Deep-equal results AND side effects; the passed-through params are ignored (the wired server passes the default entry's objects anyway). |
| S24 | The three calls above | The result `store` field: `'main'` (omitted), `'main'` (explicit), `'research-2026-09'` — the F3 stamp; the result keys gain `store` vs today's live `query, ranked, context, markdown, lineMap, k` (§1.5). |
| S26 | `edit.create_node` into `research-2026-09` (+ reconcile) then query BOTH stores | The token hits in `research-2026-09` ONLY — main's index untouched (per-store coherence, ENGINE-PER-STORE). |
| S37 | `edit.import_markdown {files:['<relative under cwd>']}` (omitted store) | ok; the default entry's corpusRoot is `undefined` ⇒ the importer's `process.cwd()` default applies byte-equal; documentIds carry NO `:` prefix (U-MS4 staged). |
| S38 | A file INSIDE the addressed store's `corpusRoot`; then an absolute cwd file OUTSIDE it, `store:'research-2026-09'` | Inside ⇒ ok; outside ⇒ the byte-pinned `{"ok":false,"error":"markdown import: path outside corpus root: <abs>","failedFile":"<abs>"}`. The relative-path interim (containment fails) is DOCUMENTED — not asserted as resolve-against-root (that is U-MS4's). |

### 3.3 Class M3 — the fail-loud resolution errors (greens S03, S05, S06, S19, S21)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| S05 | `rag.query {query:'x', store:'nope'}` | `rag.query: unknown store 'nope'` — echoes ONLY the caller's input (no registry census in the text). |
| S19 | `store` = `null` / `5` / `true` / `{}` / `[]` / `''` (per tool) | **ERRATUM (2026-09-08, live-testing F2 — HOST-LIVE-ZOD-SEAM):** only `''` reaches the handler and yields `rag.query: store must be a non-empty string` (M1). The non-string shapes (`null`/`5`/`true`/`{}`/`[]`) are rejected BEFORE the handler by the SDK zod seam with `-32602 … expected string, received … at store` — M1 for non-string `store` is NOT MCP-observable (it is the pure resolver's contract, reachable only via direct handler calls). Assert `''` ⇒ M1; assert the non-string shapes ⇒ the SDK `-32602` error. |
| S06 | `store: 'a'.repeat(300)` (and 201; and EXACTLY 200) | >200 ⇒ the echo renders as the first 197 chars + `…` (198 chars; message = prefix + 198 + closing quote); EXACTLY 200 ⇒ the FULL echo byte-exact (message 227 chars for `rag.query`). The cap applies to the RENDERING only — all cases are M2, never M1. |
| S21 | For EACH of the 12 tools: a call with an unknown `store` AND that tool's otherwise-invalid remaining args (spec §5.3's trigger table) | **ERRATUM (2026-09-08, live-testing F3 — HOST-LIVE-ZOD-SEAM):** the unknown-store M2 error fires "every time the call PASSES the zod schema" — i.e. when the tool's required args are PRESENT-but-invalid (the spec §5.3 trigger table's present-but-invalid args, which pass zod). When a required arg is MISSING (e.g. `create_node {store:'nope'}` without `type`/`content`, `split_node {store:'nope'}` without `nodeId`), the SDK zod seam returns `-32602` before the handler's store-resolution runs. Mutation-free on the error path: no node created in ANY store, no import run (verify via before/after `rag.list_nodes`). |

### 3.4 Class B1 — the boot matrix through the live boot log (greens S08, S14-serving-half, S35a–S35d, S36)

Boot each fixture with captured output (`HOME=$(mktemp -d) npm start > boot.log 2>&1`), then probe the MCP surface after boot.

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| S35a | NO registry file in the test userData | Boot SUCCEEDS; ZERO `[rag-store-registry]` lines; ONE store (the implicit `main`); omitted-`store` calls serve it; `provident-rag-stores.json` is NEVER created (D3). |
| S35b | Byte-garbage registry (`{not json`) / empty file / a DIRECTORY / a FIFO at the registry path | Boot SUCCEEDS (fail-soft); EXACTLY ONE `console.error` with TWO args: `[rag-store-registry] registry file unreadable (<path>); falling back to the implicit main store` + the caught Error; boot continues on the implicit store. The FIFO sub-case must NOT hang (F-MS1-5). |
| S35c | Valid-JSON-but-invalid registries (U-MS1's F1–F14 census — F14 is §3.5's class B2; see the U-MS1 battery §3.2) | Boot ABORTS before the window with the EXACT byte-pinned loader message on stderr; the MCP port never listens; no store file created. |
| S35d | A valid 3-entry registry with one loaded + one corrupt + one absent persistence file | Boot succeeds; N stores; per-store states compose independently (`loaded` / `failed-corrupt` / `failed-missing` — observable through the Class F serving behavior). |
| S08 | The zero-config + multi-store userData snapshot (bytes before/after boot and after a seeded write) | The registry file byte-identical (D3 no-write-back); `main`'s first write creates the LEGACY `provident-rag.json`; `research-2026-09`'s creates `provident-rag-<name>.json`; distinct per-store instances (write isolation observable across stores). |
| S36 | After the U-MS2 build: the legacy result shapes on omitted-store calls vs the greens' §5.9 sweep | Identical on every field EXCEPT the ONE query-result `store` delta (`''` legacy vs `'main'` routed). |
| S14 (serving half) | A registry entry whose persistence file is ABSENT at boot (`failed-missing`) | The store serves EMPTY identically to the corrupt one (Class F); the never-re-probed snapshot half stays module-internal. |

### 3.5 Class B2 — the F14 self-collision boot abort (greens S43; F-MS2-1 / U-MS1 F14)

| Step | Expected (live) |
| --- | --- |
| Registry fixture (the DERIVED variant): `{"version":1,"stores":[{"name":"main","default":true},{"name":"stores"}]}` — the entry `stores` derives `<d>/provident-rag-stores.json`, the registry file ITSELF | Boot ABORTS before the window with `rag-store-registry: persistence file collision with the registry file: <resolvedPath> (store 'stores')`; the MCP port never listens; no store file created/written. |
| The EXPLICIT variant: `{"version":1,"stores":[{"name":"main","default":true},{"name":"research-2026-09","persistenceFile":"<registry path>"}]}` | Same abort with `(store 'research-2026-09')`. |

### 3.6 Class B3 — the FIFO/device fail-soft boot at a STORE persistenceFile (greens S34; F-MS2-2)

| Step | Expected (live) |
| --- | --- |
| Registry entry with `"persistenceFile": "$T/fifo-store"` where `mkfifo $T/fifo-store` ran first (Linux-only); boot | Boot must NOT hang (the pre-fix defect wedged boot inside the store load); the entry constructs fail-soft (`corrupt: true`); the store serves `[]` (`rag.list_nodes {store:'fifo-store'}` ⇒ `[]`) and the call RETURNS. |
| Registry entry with `"persistenceFile": "/dev/null"` (expressible without root) | Same fail-soft outcome; READ-ONLY probes ONLY (never an `edit.*` against it). |

### 3.7 Class F — the failed-store serving matrix (greens S29–S33)

Prereq: the S35d-style registry (a corrupt store + an absent-file store alongside a loaded default).

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| S29 | Against the corrupt entry (`store:'<corrupt-name>'`): `rag.list_nodes`, `rag.get_edges`, `rag.get_document {documentId:'whatever'}`, `rag.backlinks {nodeId:'n-alpha'}` | `[]` / `[]` / the HOST-6 shape `{"documentId":"whatever","nodes":[],"edges":[]}` / the 5-field empty backlinks shape. |
| S30 | `rag.query {query:'zebra', store:'<corrupt-name>'}` | `{query:'zebra', ranked:[], context:[], markdown:'', lineMap:{ranges:[]}, k:5, store:'<corrupt-name>'}`. |
| S31 | The edit-class rows against the corrupt entry | `set_content`/`delete_node`/`split_node`/`merge_node`/`set_edge` pinned domain outcomes; `create_node` ok (writes INTO the empty store); `import_markdown` ok. Run the read rows FIRST (the §5.7 import row writes into the corrupt store — the greens' ordering lesson). |
| S32 | Cross-store: the loaded default's 2 seeded nodes vs the corrupt entry's `[]`; the corrupt name still RESOLVES | Cross-store independence; never `unknown store` (a failed store is still a KNOWN name — M2 must not fire). |
| S33 | The `failed-missing` entry serves empty identically | Flags-only difference from `failed-corrupt` (the three states derive per entry). |

### 3.8 Class V — the vector branch (secondary; greens S10, S11)

Prereq: `--retrieval-embedder=vector` (or `PROVIDENT_RETRIEVAL_EMBEDDER=vector`) + the `PROVIDENT_EMBEDDING_{PROVIDER,BASE_URL,MODEL}` env set (a warmed provider).

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| S10 | Boot in vector mode with the multi-store registry | Exactly ONE `VectorBootController` (the DEFAULT store's); non-default stores stay LEXICAL (A6/R10) — observable via query behavior + no per-store cache files. A vector selection with NO provider config aborts with the unchanged `retrieval.embedder: vector requires retrieval.embeddingProvider config`. |
| S11 | After the vector boot: the test userData listing | `provident-vector-cache.json` EXISTS at `join(userData,'provident-vector-cache.json')` (the F8 explicit-path pin); NO per-store cache file for the lexical non-defaults. |

### 3.9 Permanently NOT live-exercisable (module-internal / wiring-defense / staging)

These stay module-internal or are unreachable through the wired surfaces; they
are covered by the module-level greens (already PASS) and are NOT re-attempted
live:

- **S01, S02** — the resolver's RETURN shapes (S1/S2 objects): internal to the
  handler; observable only by proxy through the Class M2 behavior.
- **S04, S07** — the M1-before-M2-before-M3 ordering internals + the M3
  malformed-directory throw: M3 is a wiring-bug class (the wired `main.ts`
  always derives `defaultName` from a U-MS1-validated registry).
- **S12** — the F-MS2-7 kind guard: `--retrieval-embedder=` /
  `PROVIDENT_RETRIEVAL_EMBEDDER` accept ONLY `lexical|vector` at parse
  (`main.ts:52-61`), so an invalid kind never reaches the directory guard —
  defense-in-depth, unreachable live.
- **S13** — the one-default guard: defense-in-depth; U-MS1's loader guarantees
  exactly one `default: true` before the directory runs.
- **S15** — the `storeLoadStatus` accessor: consumed by U-MS5's settings
  listing; not MCP-visible until U-MS5 (the three states themselves ARE
  observable through Class F).
- **S17, S18, S20** — the legacy sentinel (S3), the R4 no-directory case, and
  the null-store guard: the wired server ALWAYS injects the directory and
  always boots a store; those branches exist for directory-less callers.
- **S23, S25, S27** — spy-engine selection, the resolved-name callback
  payload, and the null-engine slot: handler internals (observed by proxy via
  S26 coherence; the payload shape is U-MS3's untouched `{kind,nodeIds,edgeIds}`).
- **S28** — the IPC/UI resolver equivalence: the `rag-query` IPC surface is
  UI-driven, not MCP; the forwarded-store field is U-MS5's staged row.
- **S39** — the `<name>:` documentId prefix: STAGED-RED owned by U-MS4
  (observed unprefixed; stays deferred, not a U-MS2 failure).
- **S40** — the `RagQueryPayload.store` end-to-end row: U-MS5's red set.

---

## 4. Parked-scenario census

- **Total greens scenario rows:** 46 (43 executable + 3 DEFERRED —
  `docs/specs/unit-ms2-store-wiring-greens.md`, 43 PASS / 0 FAIL / 3 DEFERRED).
- **Parked for the later live run (live-observable once the app is restarted
  with the U-MS2 build):** S03, S05, S06, S08, S09 (served-hit half), S10
  (cache/controller halves), S11, S14 (serving half), S16, S19, S21, S22, S24,
  S26, S29, S30, S31, S32, S33, S34, S35a, S35b, S35c, S35d, S36, S37, S38,
  S41, S42, S43 = **30 scenario ids** across classes M1/M2/M3/B1/B2/B3/F/V.
- **Parked as NOT live-exercisable (internal / wiring-defense / U-MS4+U-MS5
  staging):** S01, S02, S04, S07, S12, S13, S15, S17, S18, S20, S23, S25, S27,
  S28, S39, S40 = **16 scenario ids** (§3.9).
- **Total parked:** 46 of 46 rows (30 + 16 = 46; split ids counted once —
  S08/S09/S10/S14 live halves noted in §3). **Run live this iteration: 0.**
- **Not a failure:** the app is UP and serving (this is not an app-down park),
  but the running process predates the U-MS2 rebuild — the `store` selector is
  absent from all 12 live tool schemas (§1.1). The surface becomes live with
  the operator restart; the greens themselves are already 43/43 against the
  live modules.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** the app is restarted with the
   rebuilt `dist/` (`npm start` rebuilds + relaunches; a plain relaunch of the
   13:30 build also suffices). The live check that ends the park: `tools/list`
   shows `store` in the `properties` of ALL 12 rag/edit tools AND
   `edit.import_markdown`'s description carries the amended A5 tail. Until
   then the running surface is pre-U-MS2 (§1.1/§1.2).
2. **P0 first:** re-run the §1.4 negative control — it must FLIP to the
   fail-loud M2 error. If it still succeeds, the wiring is not live and the
   battery re-parks.
3. **Prerequisites:** an isolated test userData (`HOME=$(mktemp -d) npm start
   > boot.log 2>&1`); NEVER the real `/home/ryanr/.config/provident-electron/`.
   Registry fixtures BEFORE boot; the MCP server reachable for the selector
   probes; mutating `edit.*` probes only against the isolated userData (the
   real 62 MB `provident-rag.json` must never be written by a battery).
4. **Same-pass pairing:** this battery and the U-MS1 battery
   (`docs/specs/unit-ms1-store-registry-live-pending-battery.md`) become
   executable by the SAME restart — run both in the same later iteration (the
   U-MS1 boot-matrix classes L1/L2 are the §3.4 prereq of this battery's
   classes B1–B3).
5. **A live result that CONTRADICTS the greens or spec §5.1–§5.9 is a finding**
   (a real regression or a doc/spec drift) — never a pass. Report it to the
   supervisor. Byte-pinned messages: assert the exact string (the M2/M1 family
   per §5.1, the F14 line per §3.5, the containment error per §5.6, the
   amended A5 per §5.2).
6. **Doc-staleness:** before running, reconcile this battery against the
   actual repo/build state (spec section numbers, byte-pinned strings, the
   live tool list — new tools may have landed) and the trackers
   (`docs/next-steps.md`, `docs/pending.md`). The greens' harness notes
   (F-BLIND-MS2-2: `handleRagQueryIpc`'s param order `(engine, store,
   payload, dir)` — corrected 2026-09-05 by the doc review to the module's
   actual signature; F-BLIND-MS2-3: a stuffed IPC `store` field
   is dropped at U-MS2) carry over for any IPC-side probing.