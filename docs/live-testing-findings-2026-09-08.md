# Live-Testing Findings — Provident-Electron / Astrographer (2026-09-08)

**Agent deliverable:** a live-session run of the batteries in `docs/live-testing.md`
against the **running app** (Electron + HTTP MCP server), executed **without any
source-code changes**. This document is prepared **for the developer agent**: it
records what passed, what diverges from the documented expectations (findings),
and what could not be exercised from this session (parked).

> **Reconciliation note (2026-09-08):** the findings below have been reconciled
> into the active trackers and the doc/battery fixes LANDED in the same pass —
> F2/F3/F4 → `docs/defects.md` **HOST-LIVE-ZOD-SEAM** (FIXED: spec §5.1 M1 + §5.3
> R6/R7, U-MS2 battery §3.3 S19/S21, V2 battery §3.3 C4 amended); F5 →
> `docs/defects.md` **HOST-LIVE-UX-SETUP** (FIXED: the Unit X battery rewritten to
> park the graph-mode provenance as not-live-exercisable — markdown import does
> NOT mint `nodeKind`); F1 → a prerequisite note added to `docs/live-testing.md`
> §2. F6/F7 need no action. See `docs/next-steps.md` OPEN.

---

## 1. Session setup (how to reproduce)

- Isolated store so no real operator data is touched:
  `HOME=$(mktemp -d)` → the userData used was `/tmp/tmp.aWMmuXEfWN/.config/provident-electron/`.
- Launch: `scripts/start-app.sh --mode=lexical` (lexical embedder). MCP HTTP on
  `http://127.0.0.1:3787/mcp`. Electron runs `--no-sandbox --disable-dev-shm-usage`
  (this host's SUID helper + `/dev/shm` constraints).
- **Tool groups:** a fresh isolated boot enables only `read` + `dispatch`
  (default security config) → the live MCP surface is just **7 tools**. The
  operator activated `graph`/`code`/`module`/`rag`/`edit` in the settings pane;
  the persisted `provident-security.json` now carries all 7 groups, so the live
  surface is **41 tools** (full `rag.*`, `edit.*`, `module.*`, `code.template.*`,
  `provident.*`, `code.*`, `get_query_audit_log`).
- A multi-store registry was planted at `provident-rag-stores.json`
  (`main` default + `research-2026-09` corpusRoot + `corrupt-store` corruption
  fixture + FIFO fixture) to exercise the store-aware units.

Drive surface: `node scripts/mcp-cli.mjs --target http --port 3787 <cmd>` and
raw `POST /mcp` `tools/call` for byte-exact error text.

---

## 2. Verified PASS (by unit)

### U-MS1 / U-MS2 — registry + store wiring (boot matrix, live)
- **Absent registry** ⇒ silent implicit `main`, boot continues, no store file
  created until first write. ✅
- **Corrupt (byte-garbage) registry** ⇒ fail-soft: exactly one log line
  `[rag-store-registry] registry file unreadable (<path>); falling back to the implicit main store <SyntaxError>`,
  boot continues, MCP serves. ✅ (the FIFO-registry sub-case also did **not** hang)
- **Invalid registry (`version:2`)** ⇒ fail-**loud** abort before the window:
  `[provident-main] fatal: Error: rag-store-registry: unsupported registry version (got 2)`,
  exit code 1, MCP port never listens. ✅
- 12 rag/edit tools all carry an **optional `store`** property (schema census, S41). ✅
- `edit.import_markdown` description is the **amended A5 string byte-exact** (S42). ✅
- Unknown store ⇒ `rag.query: unknown store 'nope'` (echoes only the caller input); same
  `<tool>: unknown store 'nope'` for every tool once its required args are present (M2). ✅
- Empty-string store ⇒ `rag.query: store must be a non-empty string` (M1). ✅
- Oversized-store echo cap byte-exact (S06): 200-char ⇒ 227-char message (full echo);
  201-char ⇒ 225-char message (197 chars + `…`). ✅
- Omitted `store` on query routes to default and result carries `store: "main"` (F3 stamp). ✅
- Failed-store matrix (Class F): `corrupt-store`, `missing-store`, FIFO-store each
  **resolve as known names** and serve empty (`rag.list_nodes` ⇒ `[]`) — no `unknown store`. ✅
- Per-store coherence (M2/S26): seed + query against `research-2026-09` returns only that
  store's data; default store untouched. ✅
- D3 persistence carve-out: `main` → **legacy `provident-rag.json`**;
  `research-2026-09` → `provident-rag-research-2026-09.json`;
  registry file **byte-unchanged** (no-write-back). ✅

### U-MS3 — store-qualified broadcast (live)
- **Foreign-store edit** (`research-2026-09`) ⇒ the default `main` pane's rendered HTML
  is **byte-identical** (host drop guard closes the foreign-store leak). ✅
- **Local edit** (default store) ⇒ the pane **re-derives** (rendered HTML changes). ✅

### U-MS4 — store-id prefixing (live import)
- Importing `rocket.md` into `research-2026-09` returns
  `documentIds: ["research-2026-09:rocket"]`, and node ids are fully prefixed
  (`research-2026-09:rocket`, `research-2026-09:rocket:section:1`, …), including
  **edge ids with the colon inside** (`e-research-2026-09:rocket-1`). ✅
- Default store import stays unprefixed (`README`). ✅
- Stores stay disjoint (no cross-store prefixes). ✅

### U-V1 / U-V2 — get_document / scoped traversal (live)
- Ghost/unknown `documentId` ⇒ `{documentId, nodes: [], edges: []}` (no throw). ✅
- Real doc ⇒ `{documentId, nodes, edges}` with `nodeKind` on nodes and
  `props: { data-doc-head: true }` on the H1. ✅
- Doc-nav pane live: lists imported `README` with the doc-head-derived title. ✅
- Traversal renders the document into `zone:main` (renderer re-derive working). ✅

### U-X — provenance / rag.query / audit (live, runnable subset)
- Empty + whitespace query ⇒ `rag.query: query must be a non-empty string`. ✅
- Flat trace shape `{mode:'flat', engine:'local', topK, source:'local'}`; result rows
  `{documentId, nodeId, score, snippet, source:'local'}`. ✅
- `get_query_audit_log` ⇒ `{ entries: [...] }` newest-first, each
  `{query, filters, mode, resultCount, timestamp, requester:'mcp'}`. ✅
- `rag-stream` degenerate shapes: `[{type:'result', result}, …]` and
  `[{type:'error', error:'rag.query: query must be a non-empty string'}]`. ✅

### U-MS5 — settings listing
- Confirmed live: **no store-census MCP tool** exists (spec §5.9 fail-9 "never
  MCP-enumerable" holds). ✅

---

## 3. FINDINGS (divergences / things for the developer to reconcile)

**F1 — The live MCP surface is small until tool groups are enabled.**
A fresh isolated boot exposes only **7 tools**; the documented ~39–41-tool surface
requires enabling `graph`/`code`/`module`/`rag`/`edit` in the operator settings
(persisted). This is the *expected* default (`read`+`dispatch`), not a bug, but any
battery/test that assumes the full surface must ensure groups are on, and **the
live-testing.md / battery docs that describe a 39-tool surface as "the live surface"**
should note it is conditional on the gate config.

**F2 — Non-string `store` values are rejected at the SDK seam, not the handler (S19).**
The U-MS2 battery §3.3/S19 expects `rag.query: store must be a non-empty string` for
`store = null / 5 / true / {} / []`. Live, those shapes are rejected *before* the
handler by the zod input-schema validation:
`MCP error -32602: … Invalid input: expected string, received null|number|… at store`.
Only the empty string `''` (a valid zod string) reaches the handler and yields the
documented M1 message. The battery/spec text overstates what is handler-observable.

**F3 — Unknown-store (M2) fires only when a tool's zod-required args are present (S21).**
With an unknown `store`, the tools whose required args are **present-but-invalid**
correctly return M2 (`edit.create_node: unknown store 'nope'`, etc.). But when a
required arg is **missing** (e.g. `create_node {store:'nope'}` without `type`/`content`,
`split_node {store:'nope'}` without `nodeId`), the SDK zod seam returns `-32602`
before the handler's store-resolution runs. The battery's "M2 every time" statement
only holds for calls that pass the zod schema. (Same root cause as F2: the SDK
input-schema layer runs before handler validation.)

**F4 — `rag.get_document {}` missing-documentId message (V2).**
The V2 battery expects `Error('rag.get_document: documentId required')`. Live,
`rag.get_document {}` yields the SDK `-32602 … expected string, received undefined at
documentId`. Only `''` reaches the handler. Doc-vs-behavior drift (same seam).

**F5 — `edit.create_node` cannot produce RAG node kinds; Unit X's setup is not runnable as written.**
`edit.create_node {type:'fact'|'content'|'reference'}` is rejected with
`edit.create_node: invalid type` — the tool is a **structural** op (div/p/h1/etc.).
The Unit X live-pending battery seeds its provenance graph with
`edit.create_node {type:'fact'}` and expects `rag putNode: nodeKind required/invalid`,
but:
  - that setup is not buildable via the live tool, and
  - the recorded error string for a bad kind does not match the live
    `edit.create_node: invalid type`.
Consequence: the **graph-mode provenance probes** (S9–S13, reference→fact traversal,
`HopLimitExceeded`/`CycleDetected`) and the nodeKind-classified setup could **not be
exercised** as documented. RAG node kinds (`nodeKind`) are populated via **markdown
import** (imported nodes carry `nodeKind`). The developer should decide whether
`create_node` should accept RAG kinds (facts/references for provenance graphs), or
update the U-X battery to a buildable setup (e.g. import-based seeding).

**F6 — Operator-UI surfaces are not MCP-verifiable (U-MS5 listing + U-H8 manage).**
Confirmed: no `operator-*` nodes are reachable via `get_rendered_html`/`list_targets`
(the operator settings + store-manage scopes are isolated). These rows can only be
observed in the Electron window (operator manual interaction) and are **parked** here.

**F7 — Boot-log noise (cosmetic).**
`zygote_host_impl: Failed to adjust OOM score … Permission denied` and
`gl_surface_presentation_helper: GetVSyncParametersIfAvailable() failed` are
non-fatal cosmetic noise on this sandbox-less, no-/dev/shm host. Not a defect.

---

## 4. Parked / not run from this session (handoff to a future live/UI session)

- **U-H1..U-H8 (registry hot-apply + operator-UI manage) + U-F3 (`stores:"all"` fan-out):**
  the operator manage surface renders in the isolated operator scope and is **not
  agent/MCP-drivable**; the U-H8 end-to-end UI flow must be exercised manually in the
  Electron window. Not run here.
- **U-MS5 settings-pane store listing rows:** operator-window-only (F6).
- **U-X graph-mode provenance (S9–S13)** and nodeKind-classified setup: blocked by F5
  (setup not buildable as documented); runnable MCP subset already passes (§2).
- **U-V1 adjacency** deep scenarios requiring crafted fixtures / quarantine-on-reload
  and **U-V2/V3** multi-document traversal/dedup/cycle cases: the single-document
  surface is live (§2) but the fuller fixtures were not assembled in this session.
- **Vector mode (W1–W5):** lexical-only session; requires a running ollama with
  `embeddinggemma` and was previously live-verified (2026-09-05), not re-run here.

---

## 5. Recommendation summary for the developer agent

1. **Reconcile F2/F3/F4:** decide whether the SDK zod input schemas should keep
   pre-empting the handler's documented M1/M2/documentId messages (and update the
   battery/spec text), or whether non-string `store`/missing `documentId` should reach
   the handler. Whichever is chosen, the battery expectations should match live behavior.
2. **Resolve F5 (U-X setup):** either allow `edit.create_node` to mint RAG kinds so a
   fact/reference provenance graph can be built over MCP, or rewrite the U-X live
   battery's setup around markdown-import (which does mint `nodeKind`) and re-record
   the expected error strings.
3. **Document F1** as a prerequisite note in `docs/live-testing.md` (full tool surface
   requires groups enabled).
4. **U-H8 / U-MS5 / operator-UI rows** need a human-in-the-window session; the agent
   surface is exhausted here.

All verification was performed against the **isolated** userData; the operator's real
store (`/home/ryanr/.config/provident-electron/`) was never touched.
