# Unit MS4 — Store-Id Prefixing at the Import Minting Seam: LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-05**
  (verified live ~23:40–23:50 UTC).
- **Source contract:** `docs/specs/unit-ms4-id-prefixing.md` — §5.1 (the
  `importMarkdownCorpus` optional 3rd parameter `ImportStoreContext` `{ name,
  isDefault, reservedNames? }` + the null-skip legacy shape), §5.2 (the minting
  seam: the pipeline order files → SC1–SC5 → corpusRoot guard → the per-file
  pipeline + the A1 check + the `<name>:` mint + the id-minting census),
  §5.3 (the per-store path resolution `resolve(corpusRoot, file)` + the
  containment/TOCTOU reuse + the R7 no-path-influence pin), §5.4 (the A1
  resolution (a) state matrix A1-S1..S10 + the byte-pinned message + the
  A1-S7 erratum), §5.5 (INV-1..INV-6 + the INV-6 erratum + the F-MS4-7
  containment-limitation note), §5.6 (the A4 binding byte-equality criteria
  1–9), §5.7 (one-shot per store), §5.8 (H1–H13), §5.9 (F1–F14), §3a
  (F-MS4-1..F-MS4-11); plus `unit-ms2-store-wiring.md` §5.6 (the F2 3-arg
  pass-through that activates the prefix in production).
- **Greens battery (blind-test, already run against the live MODULES):**
  `docs/specs/unit-ms4-id-prefixing-greens.md` — 43 scenario rows
  (41 executable E01–E41 + 2 DEFERRED D1/D2): **41 PASS / 0 FAIL / 2
  DEFERRED** (the recorded run: 41/41 vitest tests, exit 0, ~0.35 s).
- **Status:** **PARKED — NOT run against the live application.** Pattern
  precedent: `docs/specs/unit-ms2-store-wiring-live-pending-battery.md` (read
  FIRST — the sibling battery; the same revisit condition). This battery is
  the handoff for a LATER iteration of the live-scenario runner, to be
  executed once the app is (RE)STARTED with the rebuilt `dist/` — the U-MS4
  build is already on disk (§1.2), so the restart is the ONLY gap.

---

## 1. Why this battery is parked (the live-surface assessment, verified live 2026-09-05 ~23:40–23:50 UTC)

The situation differs from the U-MS2 battery's snapshot (~22:50 UTC, ~1 h
earlier): **the app is NOT running at all** — the U-MS2 battery's instance
(pid 295555, started 2026-09-05 10:16:16, `npm exec electron . --no-sandbox`)
is GONE. The park is therefore an **app-down park + a restart gap**, verified
live:

### 1.1 The MCP server is UNREACHABLE — the decisive probe

- `POST http://127.0.0.1:3787/mcp` (`initialize`) and a bare `GET` BOTH fail
  with `curl: (7) Failed to connect to 127.0.0.1 port 3787 … Couldn't connect
  to server` — connection REFUSED, not a protocol error (nothing is bound to
  the port).
- `ss -ltn` shows NO listener on 3787 and no plausible alternate MCP port
  (the listeners present are unrelated: 53/139/445/631/11434/3080 [the dsh
  web GUI]/9092/1716/…).
- `ps aux` shows NO electron/npm/node process for this repo — only unrelated
  processes (the Discord crashpad handler, the dsh runner). No
  `--mcp-port=`/`PROVIDENT_MCP_PORT` alternate instance exists.

Consequence: **even the P0 census probe (`tools/list`) cannot be executed** —
there is no `tools/list` to inspect, so the task's probe step 1 ("if up, call
`tools/list` and inspect `edit.import_markdown`'s inputSchema") is
unreachable at its first step. Nothing live can contradict the greens; the
scenarios are parked, not failed.

### 1.2 The repo HAS landed U-MS4 — the build is already on disk (a restart is the only gap)

- `src/main/markdown-import.ts` (16402 bytes, 2026-09-05 **23:30:32 UTC**
  — `-0500` 18:30) carries the U-MS4 markers: 10 hits across
  `ImportStoreContext` / `invalid store context` / `collides with a
  registered store name` / `corpusRoot must be a string` — the 3-arg seam,
  the SC battery, the A1 rejection, and the F-MS4-3 guard are ALL in source.
- `src/main/mcp-server.ts` (23:18 UTC): the 12-tool `store` surface is
  present, `edit.import_markdown` (`:1196`) carries BOTH the `store:
  z.string().optional()` schema row AND the amended A5 description (the
  F-MS2-6 "addressed RAG store … per store: the addressed store's configured
  corpus root …" tail); the WIRED import call site (`:534-541`) passes the
  U-MS2 §5.6-pinned 3-arg context byte-for-byte —
  `isDefault: entry.name === dir.defaultName`, `reservedNames:
  [...dir.entries.keys()].filter(n => n !== dir.defaultName)` (the A1-S7
  caller note: only the non-default names) — the comment block at `:528-533`
  explicitly marks the F2 pass-through as "live since U-MS4's optional
  `ImportStoreContext` parameter landed". **The U-MS2 test-56 staged red is
  already flipped in source; the prefix is armed at the seam.**
- `tests/unit-ms4-id-prefixing.test.ts` (61278 bytes, 23:16 UTC) +
  `tests/unit-ms4-id-prefixing-adversarial.test.ts` (21970 bytes, 23:30 UTC)
  exist — the red-first record + the R-series regression file (§3a).
- `dist/main/*` was rebuilt 2026-09-05 **23:32:04 UTC** — AFTER both U-MS4
  sources. `grep -c` on `dist/main/main.cjs`: `invalid store context` → **5**,
  `collides with a registered store name` → **1**, `corpusRoot must be a
  string` → **1** — the bundle carries the U-MS4 fail-states.

### 1.3 The running-vs-built delta (the §1.3 analogue of the U-MS2 battery, INVERTED)

The U-MS2 battery's park was "the app IS up but predates the rebuild". Here
the delta is the opposite: **the build predates the (non-)run** — `dist/`
(23:32) is newer than every U-MS4 source edit (23:18/23:30) and the app has
no live process to be stale. Nothing is running, so nothing is stale; the
surface is simply absent. A plain relaunch of the 23:32 build — or `npm
start`, which rebuilds then launches — brings up the ENTIRE multi-store
surface at once (U-MS1 registry + U-MS2 store selector + U-MS4 prefix/A1).

### 1.4 The P0 gates for the later run (the restart-proof probes, in order)

1. **The U-MS2 negative control must FLIP** (its battery §1.4): `tools/call
   rag.query {query:'provident', topK:3, store:'nope', bogusExtra:1}` ⇒ must
   FAIL LOUD with `rag.query: unknown store 'nope'`. If it still succeeds,
   the restart did not take the U-MS2+U-MS4 build ⇒ re-park BOTH batteries.
2. **The U-MS4 census probe:** `tools/list` ⇒ `edit.import_markdown` has
   `store` in `properties` (`type: 'string'`, not required) AND its
   description carries the amended A5 tail byte-exact (§1.2's string). Then
   the prefix P0 (§3 class L1 probe 1) — a non-default import mints a
   `research-2026-09:`-prefixed documentId.

### 1.5 Boot-log observables are not capturable from this session

The registry/boot outcomes (U-MS1's loader matrix, U-MS2's §5.8 boot matrix)
are stdout/stderr + exit observables of the BOOT PROCESS; no instance is
running, none was launched by this session, and launching is out of scope
(the do-not-start constraint). They stay owned by the U-MS1/U-MS2 batteries'
class B/L rows; this battery owns only the MCP-reachable import seam.

**Conclusion:** the U-MS4 surface (the `store` argument's effect on the minted
documentIds, the A1 collision rejection, the per-store import root) is not
live — the app is down. Per the live-runner contract these scenarios are
**parked** (not failures) and recorded here. The greens are already 41/41
against the live modules.

---

## 2. The live surfaces that WILL exercise the U-MS4 behavior (after the restart)

| Live surface | U-MS4 behavior it exposes | How to drive it live |
| --- | --- | --- |
| `tools/call edit.import_markdown {files, store}` | THE wired minting seam: the non-default store's `documentIds` come back `<name>:`-prefixed; the default store's unprefixed; the A1 collision rejection; the per-store containment errors | `tools/call` with `store` omitted / the non-default name; the result JSON (the `ImportMarkdownResult`) carries `documentIds` |
| `tools/call rag.list_nodes {store}` | The minted NODE ids per store: `{id, type, content(80-char preview), ownedNodeIds(count)}` — the prefixed census (`<name>:<doc>`, `<name>:<doc>:section:<n>`, `<name>:<doc>:<type>:<n>`) | Parse the `id` column per store |
| `tools/call rag.get_document {documentId, store}` | The document subtree `{documentId, nodes, edges}` — full node objects (incl. `ownedNodeIds`) + edges | Fetch the prefixed documentId in the addressed store |
| `tools/call rag.get_edges {nodeId?, store}` | The EDGE ids — `e-<name>:<doc>-<n>` (the colon INSIDE the edge id, the INV-6 erratum observable) + the doc-flow edges' `documentIds: ['<name>:<doc>']` | List all edges per store |
| `tools/call edit.set_content / edit.set_edge` | INV-4 (the foreign-id miss) + the F-MS4-11 residue (prefix-shaped `documentIds` plantable in the default store) | Address ids across stores with `store` omitted |
| The registry fixture (`provident-rag-stores.json` in the TEST userData) | Which entries exist, their `corpusRoot`s (the per-store import root), the default flag | Plant BEFORE boot (the U-MS2 battery §2 prereq) |
| The userData persistence files | Per-store isolation on disk: `main` ⇒ legacy `provident-rag.json`, others ⇒ `provident-rag-<name>.json`; a FAILED import persists nothing (the A1/SC no-batch discipline) | Snapshot the dir before/after calls |

**Prerequisites for the later run (MANDATORY — inherited from the U-MS2 battery §2):**

1. An ISOLATED test userData — `HOME=$(mktemp -d) npm start > boot.log 2>&1`
   boots against a scratch `$HOME/.config/provident-electron/` without
   touching the real userData (`/home/ryanr/.config/provident-electron/` —
   the real 62 MB legacy `provident-rag.json`; NEVER plant files there, never
   let a battery write there).
2. The operator restart (the SAME one that unlocks the U-MS1/U-MS2 batteries —
   §6 note 1). The MCP server must be reachable (default port 3787).
3. Registry fixtures planted at
   `$T/.config/provident-electron/provident-rag-stores.json` BEFORE boot, e.g.
   `{"version":1,"stores":[{"name":"main","default":true},{"name":"research-2026-09","corpusRoot":"$T/corpus"}]}`.
4. Corpus fixtures under the TEST store's `corpusRoot` (`$T/corpus/…`) +
   cwd-relative fixtures for the default-store rows (the app's cwd is the
   repo root when booted via `npm start` from the repo — the zero-config
   default root is `process.cwd()`).
5. Mutating `edit.*` probes ONLY against the isolated userData.

**The MCP probe verbs (stateless HTTP — no session handshake required; from
the U-MS2 battery §2):**

```bash
curl -sS -X POST http://127.0.0.1:3787/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
# response is SSE: parse the `data: ` line; tools[] → name/inputSchema/description

curl -sS -X POST http://127.0.0.1:3787/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"edit.import_markdown","arguments":{"files":["readme.md"],"store":"research-2026-09"}}}'
```

A thrown handler error surfaces as the SDK's `tools/call` error; the importer
returns domain failures as `{ ok: false, … }` (never throws) — assert the
byte-pinned message from `error.message` OR from the result's JSON
(`result.content[0].text` / `result.structuredContent`), whichever encoding
the SDK emits; the MESSAGE text is the contract, not the envelope.

---

## 3. The concrete live probes to run once the app is (re)started

The "expected" column re-expresses the greens/spec expectation as a live
observable. A live result that CONTRADICTS the greens or the spec is a finding
(a regression or a doc/spec drift) — never a pass.

### P0 — the restart gates (must pass before any class below)

| Step | Expected after the U-MS2+U-MS4 build is live |
| --- | --- |
| The U-MS2 negative control (`rag.query … store:'nope'`) | FAILS LOUD `rag.query: unknown store 'nope'` — if it still succeeds, re-park. |
| `tools/list` — `edit.import_markdown` | `store` in `properties` + the AMENDED A5 description byte-exact (the U-MS2 battery's S42 rows — run its §3.1 with this battery). |
| The prefix P0 | `edit.import_markdown {files:['readme.md'], store:'research-2026-09'}` ⇒ ok with `documentIds: ['research-2026-09:readme']`. |

### 3.1 Class L1 — the wired prefix mint + the id census (greens E07, E08, E13, E17, E21, E37, E38; H3/H12, A1-S8)

Prereq: the two-store registry (§2 prereq 3) + `$T/corpus/readme.md` (a
headed multi-section doc) + a cwd-relative fixture for the default rows.

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| E37 (THE wired pin) | `edit.import_markdown {files:['readme.md'], store:'research-2026-09'}` vs `{files:['readme.md']}` (default) | Non-default ⇒ `documentIds: ['research-2026-09:readme']` PREFIXED; default ⇒ `documentIds: ['readme']` UNPREFIXED. **U-MS2's S39 staged red goes green live.** |
| E17 | `rag.list_nodes {store:'research-2026-09'}` after the non-default import | Root id `research-2026-09:readme` (type `div`); sections `research-2026-09:readme:section:<n>`; blocks `research-2026-09:readme:<type>:<n>` — every id === `'research-2026-09:'` + the default-store id of the same file (compare against the default store's `rag.list_nodes`). |
| E17 (edges) | `rag.get_edges {store:'research-2026-09'}` | Edge ids `e-research-2026-09:readme-<n>` (the colon INSIDE the id); the doc-flow edges carry `documentIds: ['research-2026-09:readme']`; the default store's edges stay `e-readme-<n}` / `['readme']`. |
| E17 (subtree) | `rag.get_document {documentId:'research-2026-09:readme', store:'research-2026-09'}` | `{documentId:'research-2026-09:readme', nodes:[…], edges:[…]}` — the prefixed id RESOLVES in the addressed store; the root node's `ownedNodeIds` list the prefixed section ids. |
| E13 / H12 / A1-S8 | `edit.import_markdown {files:['research-2026-09.md'], store:'research-2026-09'}` (fixture: `$T/corpus/research-2026-09.md`) | ok; documentId `research-2026-09:research-2026-09` — the A1 check is DEFAULT-ONLY (a non-default store may import a file named like itself). |
| E21 (isolation half) | `rag.list_nodes` for BOTH stores after both imports | Disjoint id sets — main carries NO `research-2026-09:`-prefixed id and vice versa (INV-1/INV-2/INV-5; the CONCURRENT `Promise.all` half stays module-internal — MCP calls are sequential). |
| E07/E15 (A1-S1/S10) | Zero-config variant: a boot with NO registry file, then `edit.import_markdown {files:['research-2026-09.md']}` | IMPORTS unprefixed, documentId `research-2026-09` (byte-equal today — no reservation is knowable without other stores). |
| E08 (A1-S2) | A registry with ONLY the default entry, then the same import | IMPORTS unprefixed (reservedNames = [] ⇒ no A1 consult). |
| E38 (the wired A1 interplay) | The default-store import of `research-2026-09.md` WITH the two-store registry | REJECTED (class L2) — the wiring supplies `reservedNames` = the non-default names only. |

### 3.2 Class L2 — the A1 collision rejection (byte-pinned; greens E09, E10, E11, E14, E16)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| E09 (A1-S3, F6) | `edit.import_markdown {files:['research-2026-09.md']}` (default store, two-store registry) | Byte-pinned `markdown import: documentId collides with a registered store name: research-2026-09` + `failedFile: 'research-2026-09.md'`; NO store mutation (`rag.list_nodes` before/after identical; no `provident-rag.json` write for the failed call). |
| E14 (A1-S9, F7) | Multi-file corpus `[zz-ok.md, b-collide.md, a-collide.md]` (default store) | The WHOLE import rejected; the error names the FIRST colliding file in `files` order (`b-collide`); `failedFile: 'b-collide.md'`; NO partial application — `zz-ok`'s ids are ABSENT from the store afterwards. |
| E16 (the sanitize-onto family) | `files:['research-2026-09-.md']` / `['research-2026-09 .md']` / `['research:2026:09.md']` / `['research-2026-09.MD']` (default store) | ALL FOUR rejected with the SAME message echoing `research-2026-09` (each sanitizes onto the reserved base). |
| E16 (the survivor) | `files:['research-2026-09..md']` | IMPORTS unprefixed, documentId `research-2026-09.` (the trailing dot survives the dash-only trim). |
| E10 (A1-S4/S5, F9) | `files:['research-2026-09-notes.md']` / `['Research.md']` / `['research_2026_09.md']` | ALL IMPORT unprefixed — exact-equality only (substring/case/underscore never collide). |
| E11 (A1-S6) | A registry whose DEFAULT entry is named `kb` (+ one non-default store), `files:['kb.md']` | IMPORTS unprefixed, documentId `kb` — the reserved set excludes the addressed default store's own name (the wiring's filter). Secondary observable: the default entry's persistence file (legacy `provident-rag.json` vs a derived name) — record what is observed; do not assert beyond the U-MS2 spec. |

### 3.3 Class L3 — the foreign-id miss + the set_edge residue (greens E23, E41; INV-4, F-MS4-11)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| E23 (INV-4, the B3 hazard) | After the non-default import: `edit.set_content {nodeId:'research-2026-09:readme:section:1', content:'tampered'}` with `store` OMITTED | `edit.set_content: node not found`; the default store's same-named node (`readme:section:1`, if seeded) content UNCHANGED — never a silent cross-store mutation (the D4 core guarantee, observed live). |
| E41 (F-MS4-11) | `edit.set_edge {kind:'parent-child', source:'<a>', target:'<b>', documentIds:['research-2026-09:doc']}` against the DEFAULT store | ok; `rag.get_edges {store:…}` / `rag.backlinks` shows the stored edge carrying the prefix-SHAPED owner string — the documented NON-import residue (harmless now; U-MS3's resolver must not mis-scope it). |

### 3.4 Class L4 — the per-store import root + containment (greens E25–E29, E32; H5–H8, A5)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| E25 (H5 — the A5 flip) | `edit.import_markdown {files:['readme.md'], store:'research-2026-09'}` with the registry entry's `corpusRoot: $T/corpus` and the APP cwd ≠ `$T/corpus` | ok — the relative file resolved against the STORE root. (On the pre-U-MS4 build the same call would fail containment — the negative control that proves the A5 change flipped.) |
| E26 (H6/H7) | `files:['sub/note.md']` and `files:['$T/corpus/abs.md']` (absolute, within the store root), store `research-2026-09` | Both ok; documentIds `research-2026-09:note` / `research-2026-09:abs`; containment holds against the STORE root. |
| E27 (H8) | Plant a symlink `$T/corpus/link.md` → outside `$T/corpus`; import `['link.md']` | Byte-pinned `markdown import: path outside corpus root: link.md` + `failedFile: 'link.md'` — the realpath/TOCTOU discipline reused UNCHANGED per store root. |
| E28 (F12) | `files:['../outside.md']`, store `research-2026-09` | Byte-pinned `markdown import: path outside corpus root: ../outside.md` + `failedFile: '../outside.md'`. |
| E29 (A4 criterion 7) | The cwd-relative default-store import; then a registry variant whose default entry sets `corpusRoot` to the SAME absolute path as the app's cwd; import the same fixture | Deep-equal `documentIds` (byte-identical when the effective root is cwd). |
| E32 (F-MS4-7, OPTIONAL) | An operator-authored registry entry with `"corpusRoot": "/"` in the TEST userData; import an absolute path outside any real root | ok (containment VACUOUS — the DOCUMENTED LIMITATION; no special-casing). Read-only w.r.t. the filesystem; writes only into the test store. Contrast: the same file against a real root ⇒ the outside error. |

### 3.5 Class L5 — the inherited + prefixed-echo fail-states through MCP (greens E24, E33, E39, E40)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| E39 | `files:['nonexistent.md']`; a DIRECTORY path as file; an absolute path outside the default root | `cannot read file: <path>` (+failedFile) / `cannot read file: <dir>` / `path outside corpus root: <path>` — all byte-equal inherited fail-states. |
| E39 | `files:['a.md','a.markdown']` (default store) | `markdown import: duplicate documentId: a` (NO failedFile). |
| E40 (F11) | The same duplicate pair with `store:'research-2026-09'` | `markdown import: duplicate documentId: research-2026-09:a` — the PREFIXED echo, NO failedFile. |
| E40 (F10) | A heading-less doc (`$T/corpus/note.md`) with `store:'research-2026-09'` | `markdown import: doc-flow validation failed for research-2026-09:note: missing-head` (+failedFile) — the message embeds the FINAL prefixed id. |
| E40 (F14) | A file whose sanitized basename is `''` in store `research-2026-09` | `markdown import: empty documentId for file: <file>` (+failedFile) — fires BEFORE the prefix (never a prefixed-empty id like `research-2026-09:`). |
| E33 (F-MS4-4) | `files:['note\u0000.md']` inside the root; then `['../note\u0000.md']` | `cannot read file: note\u0000.md` (the raw NUL byte in the message; fail-closed, no store mutation) / the OUTSIDE error — containment PRECEDES the NUL probe. |
| E24 (H9) | Re-import the same file into the same non-default store | ok both times; the SAME prefixed ids (upsert — the `rag.list_nodes` id set is unchanged; per-store ONE-WAY-SNAPSHOT). |
| E39 (journal half) | After any FAILED import | No store mutation observable (`rag.list_nodes` identical; no persistence write). The journal-entry count itself is module-internal (not MCP-visible). |

### 3.6 Class L6 — the store-selector interplay (owned by the U-MS2 battery; run as the prereq layer)

The U-MS2 battery's classes M1/M2/M3 (the `store` schema surface, the
resolution routing + the F3 `store` stamp, the fail-loud resolution errors)
are the PREREQUISITE layer under every probe above — e.g. an unknown
`store:'nope'` on `edit.import_markdown` must yield
`edit.import_markdown: unknown store 'nope'` (M2, the resolution-first
ordering) BEFORE any file I/O. Run the U-MS2 battery's §3 in the same
iteration; do not duplicate its rows here.

---

## 4. Permanently NOT live-exercisable (module-internal / schema-intercepted / deferred)

These stay covered by the module-level greens (already 41/41) and are NOT
re-attempted live:

- **E01–E06 (the SC1–SC5 battery, the files→SC→corpusRoot precedence, the
  null-skip legacy shape) and E30/E31 (the corpusRoot guard + the jsonOf
  cap):** the MCP tool schema INTERCEPTS the triggers — `store:
  z.string().optional()` rejects a non-string `store` at the SDK boundary
  (an invalid-arguments error, never the importer's `invalid store
  context`), `files: z.array(z.string().min(1)).min(1)` rejects non-arrays /
  empty arrays / empty-string paths, and `corpusRoot` is NOT a tool argument
  (ADV-1 — the schema stays files-only, which is the R7 pin working as
  designed). The wired context is constructed server-side; a caller can
  never feed a malformed `ImportStoreContext` or corpusRoot through MCP.
- **E12 (A1-S7, the GIVEN-list-contains-own-name reject):** the wiring
  supplies `reservedNames` = ONLY the non-default names (`mcp-server.ts:539`
  filter) — the S7 configuration is unreachable live by construction; the
  module greens (E12 PASS) own it.
- **E18 (the parser documentId-input equivalence):** no caller-supplied
  documentId surface exists through MCP (the parser takes the id from the
  importer's mint).
- **E19's journal/undoDepth halves + E20's byte-level store deep-equality:**
  the journal and in-memory store states are module-internal. E19's id
  census + the persistence-file-appears-on-first-write halves ARE live
  (class L1/L5); E20's result-shape comparison is partially live (minus the
  U-MS2 `store` field delta).
- **E34–E36 (the F-MS4-2 Proxy-snapshot determinism probes):** the context is
  a plain server-side object; no getter/Proxy is caller-reachable.
- **E39's files-array / empty-array / empty-string rows:** schema-intercepted
  (§4 above); its batch-failure row: no doc-derivable trigger
  (F-BLIND-MS4-1 — Unit N/Unit T territory).
- **E21's Promise.all concurrency half:** MCP calls are sequential; only the
  isolation OUTCOME is live-observable (class L1).
- **D1/D2 (F-MS4-5, F-MS4-10):** DEFERRED per the greens (pending verbatim
  transcription; NOTHING invented) — stay deferred, not live-exercisable.

---

## 5. Parked-scenario census

- **Total greens scenario rows:** 43 (41 executable E01–E41 + 2 DEFERRED
  D1/D2 — `docs/specs/unit-ms4-id-prefixing-greens.md`, 41 PASS / 0 FAIL /
  2 DEFERRED).
- **LIVE-observable once the app is (re)started with the U-MS4 build:** E07,
  E08, E09, E10, E11, E13, E14, E15, E16, E17, E22, E23, E24, E25, E26, E27,
  E28, E29, E32, E33, E37, E40, E41 fully; E19, E20, E21, E38, E39 in the
  live halves noted in §3/§4 = **28 scenario ids** across classes
  L1/L2/L3/L4/L5 (+ the L6 prereq layer from the U-MS2 battery).
- **NOT live-exercisable (module-internal / schema-intercepted / deferred):**
  E01, E02, E03, E04, E05, E06, E12, E18, E30, E31, E34, E35, E36 = **13
  scenario ids** + the 2 DEFERRED rows (D1/D2) = **15** (§4).
- **Total parked:** 43 of 43 rows (28 + 15 = 43; split ids counted once —
  the partial-live halves are noted in §3/§4). **Run live this iteration: 0.**
- **Not a failure:** the greens are 41/41 against the live modules; the app
  is simply DOWN (§1.1), and the U-MS4 build is already on disk (§1.2) — the
  restart is the only gap. The park decision is recorded here per the
  live-runner contract.

---

## 6. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition — SAME as the U-MS2 battery):**
   the operator (re)starts the app with the rebuilt `dist/`. The 23:32 UTC
   build on disk ALREADY carries U-MS1 + U-MS2 + U-MS4, so a plain relaunch
   suffices (`npm start` also works — it rebuilds then launches). The live
   check that ends the park: the P0 gates of §1.4 (the unknown-store flip +
   the `edit.import_markdown` `store` schema row + the amended A5
   description + the first prefixed import).
2. **Run ALL THREE batteries in the SAME restart iteration (recommended):**
   U-MS1 (`docs/specs/unit-ms1-store-registry-live-pending-battery.md`), U-MS2
   (`docs/specs/unit-ms2-store-wiring-live-pending-battery.md`), and THIS
   battery. The U-MS1 boot-matrix classes are the prereq of the U-MS2
   classes B1–B3; the U-MS2 classes M1/M2/M3 (the selector + the F3 stamp +
   the resolution errors) are the prereq layer (this battery's L6) under
   every U-MS4 probe; the registry fixtures, the isolated userData, and the
   boot logs are shared. One restart, three batteries, one boot-log capture.
3. **P0 first, then L1's E37 probe:** if the unknown-store control still
   succeeds OR `edit.import_markdown` lacks `store`/the amended description,
   the wiring is not live ⇒ re-park (the U-MS2 battery's §5.2 P0-first rule).
4. **Prerequisites:** an isolated test userData (`HOME=$(mktemp -d) npm
   start > boot.log 2>&1`); NEVER the real
   `/home/ryanr/.config/provident-electron/`; registry + corpus fixtures
   BEFORE boot; mutating `edit.*` probes only against the isolated userData.
   The zero-config/default-root rows assume the app's cwd is the repo root
   (`npm start` from the repo) — the default store's effective corpusRoot is
   `process.cwd()`.
5. **A live result that CONTRADICTS the greens or spec §5.1–§5.9 is a
   finding** (a real regression or a doc/spec drift) — never a pass. Report
   it to the supervisor. Byte-pinned strings: the A1 collision message
   (`markdown import: documentId collides with a registered store name:
   <id>`), the outside/cannot-read messages, the prefixed echoes
   (doc-flow/duplicate), and the amended A5 description.
6. **Doc-staleness before running:** reconcile this battery against the
   actual repo/build state (the live tool list — U-MS3/U-MS5 may have landed
   and changed the broadcast payload shape or added surfaces; the byte-pinned
   strings; spec section numbers) and the trackers (`docs/next-steps.md`,
   `docs/pending.md`). Note U-MS3's consequence visible in source today: the
   import handler's broadcast `nodeIds` become the PREFIXED documentIds
   (`mcp-server.ts:542` — `emit({kind:'structural', nodeIds:
   result.documentIds, edgeIds: []})`); the broadcast channel is not
   tools/call-visible, so it stays U-MS3's surface.
7. **The U-MS2 staged-red bookkeeping:** the greens' finding 1 (E37/E38 —
   "U-MS2's recorded S39 staged red is now green") is already visible in
   SOURCE (§1.2's `:528-533`); the later iteration confirms it LIVE and the
   supervisor reconciles the U-MS2 DONE row/staged-red bookkeeping.