# Astrographer — Live-Testing Summary & Pending Live Batteries

Maintained by the document-archival loop (AGENTS.md item 6). This is the
**consolidated handoff for LIVE testing** — every unit whose live-scenario gate
was **PARKED** (deferred to a live app session) and every `*-live-pending-battery.md`
that exists or is still to be authored. The node-testable suites are already green
(`npm test`); this document is ONLY about the surfaces that need a **running app**
(an Electron window + the HTTP MCP server) to observe end-to-end.

> **Status (2026-09-08):** the registry hot-apply slice (U-H1..U-H8) is COMPLETE
> and the cross-store fan-out slice (U-F1..U-F3) is COMPLETE — but **every one of
> their live-scenario gates is PARKED** (no live app session was available by user
> instruction). The multi-store Phase-1 (U-MS1..U-MS5) and the scoped-load
> (U-V1..U-V3) + provenance (U-X) units have **authored** live-pending batteries.
> This document is the single place to pick up all of them.

---

## 1. How to start the app

Use the launcher `scripts/start-app.sh` (it exists because the common dev launch
`npm run start:http` aborts on this host's misconfigured SUID `chrome-sandbox`).

```bash
# Lexical mode (default; BM25/tf-idf, no model) — the normal case for most batteries:
scripts/start-app.sh --mode=lexical

# Vector mode (embeddings; needs a local ollama with the `embeddinggemma` model):
scripts/start-app.sh --mode=vector

# ISOLATED, disposable environment (NEVER the operator's real persisted store):
HOME=$(mktemp -d) scripts/start-app.sh --mode=lexical
```

The script rebuilds `dist/` first, then starts Electron with the HTTP MCP server
on **`http://127.0.0.1:3787/mcp`** (default) and the retrieval-embedder mode.

### Flags & env (from `scripts/start-app.sh`)
| Flag / env | Effect |
| --- | --- |
| `--mode=lexical\|vector` | retrieval embedder (default lexical) |
| `--sandbox` / `--no-sandbox` | Chromium sandbox (default `--no-sandbox`; fix the SUID helper with `sudo chown root:root node_modules/electron/dist/chrome-sandbox && sudo chmod 4755 …` to use `--sandbox`) |
| `--shm-usage` / `--disable-dev-shm-usage` | `/dev/shm` usage (default `--disable-dev-shm-usage`; this host's `/dev/shm` is not writable) |
| `--port=N` | MCP HTTP port (default 3787) |
| `PROVIDENT_MCP_TRANSPORT` | `http` (default) \| `pipe` |
| `PROVIDENT_MCP_PORT` | MCP port (default 3787) |
| `PROVIDENT_RETRIEVAL_EMBEDDER` | `lexical` \| `vector` (overrides `--mode`) |
| `PROVIDENT_EMBEDDING_PROVIDER` | `ollama` (default) \| `openai` \| `cohere` \| custom |
| `PROVIDENT_EMBEDDING_BASE_URL` / `_MODEL` / `_API_KEY` / `_DIMENSION` / `_TIMEOUT_MS` | vector provider config (local ollama defaults: `http://localhost:11434`, `embeddinggemma`) |

**Vector mode requires a running ollama serving `embeddinggemma`** (e.g.
`ollama run embeddinggemma "test"`). The vector-boot warm-up + the W1–W5
vector machinery were live-verified against real ollama on 2026-09-05.

---

## 2. How to drive the MCP server

`scripts/mcp-cli.mjs` drives every MCP endpoint. Two targets:

```bash
# battery (default): a throwaway deterministic host (dist/main/battery-host.mjs) over stdio
node scripts/mcp-cli.mjs --target battery <command> [args...]

# http: the RUNNING app (the real Electron app) — the LIVE target for these batteries
node scripts/mcp-cli.mjs --target http --port 3787 <command> [args...]
```

Useful commands: `tools` (list registered tools), `html` (`get_rendered_html`),
`targets` (`list_targets`), `dispatch <target> <event> [jsonArgs]`,
`node-state <target>`, `run <steps.json>` (execute an array of `{cmd,args}` steps
against ONE persistent host so a dispatch can see a prior load).

The `rag.*` / `edit.*` tools (the multi-store + hot-apply surfaces) are driven
over the MCP server. **The operator-UI manage surface (U-H8) is NOT MCP-visible**
(see §4) — it must be exercised in the Electron window itself.

---

## 3. The live-pending batteries (authored)

These `*-live-pending-battery.md` files exist and are the handoff for a
**UI-interactive / live-app** iteration of the live-scenario runner:

| Battery | Unit | What it exercises live |
| --- | --- | --- |
| `docs/specs/unit-ms1-store-registry-live-pending-battery.md` | U-MS1 | the store-registry loader + the implicit `main` entry at boot |
| `docs/specs/unit-ms2-store-wiring-live-pending-battery.md` | U-MS2 | the 12 `rag.*`/`edit.*` tools carrying the `store` argument + the failed-store matrix |
| `docs/specs/unit-ms3-store-qualified-broadcast-live-pending-battery.md` | U-MS3 | the `rag-store-changed` broadcast `store` qualifier + the host drop guard |
| `docs/specs/unit-ms4-id-prefixing-live-pending-battery.md` | U-MS4 | the `<name>:` id prefixing at the import minting seam |
| `docs/specs/unit-ms5-settings-listing-live-pending-battery.md` | U-MS5 | the `operator-rag-stores` settings-pane listing (operator UI, NOT MCP-visible) |
| `docs/specs/unit-v1-store-adjacency-live-pending-battery.md` | U-V1 | the store adjacency methods against a real persisted corpus |
| `docs/specs/unit-v2-scoped-traversal-mcp-live-pending-battery.md` | U-V2 | the scoped traversal + `rag.get_document` subgraphs over MCP |
| `docs/specs/unit-v3-doc-heads-docnav-live-pending-battery.md` | U-V3 | the doc-nav pane + the doc-heads listing |
| `docs/specs/unit-x-rag-provenance-traversal-live-pending-battery.md` | U-X | the query-audit log + the multi-hop traversal provenance |

Each battery documents its own park reason + the exact live steps to run.

---

## 4. The parked live-scenario gates (batteries NOT yet authored)

These units' live-scenario gates are **PARKED** and have **no battery file yet**.
A live session should author + run them (the `unit-ms1`-style doc):

### 4.1 The registry hot-apply slice (U-H1..U-H8) — all PARKED
| Unit | Live surface to exercise |
| --- | --- |
| U-H1 | the registry WRITE module's atomic persist + reload against a real registry file |
| U-H2a/b | the runtime controller + the closure rewiring — a hot-apply reflected in every live closure |
| U-H3 | hot-add (delivered-by-U-H2a) — a store added at runtime without a restart |
| U-H4 | `hotRemove` — drain-then-teardown of a live store/engine, the file stranded |
| U-H5 | the teardown primitives on a live store/engine/boot controller |
| U-H6 | `hotRename` — drain-then-teardown of the old renamed store/engine |
| U-H7 | `hotSetDefault`/`hotRenameDefault` — a live default reassignment + vector re-warm |
| **U-H8** | **the operator-UI editor end-to-end** (see §5) |

### 4.2 The cross-store fan-out slice (U-F1..U-F3) — PARKED
| Unit | Live surface to exercise |
| --- | --- |
| U-F1/U-F2 | the pure `mergeStoreResults`/`qualifyStoreResult` (node-testable — already green; live only for the full fan-out) |
| U-F3 | the `stores:"all"` MCP fan-out against a real multi-store registry |

---

## 5. The recommended U-H8 live-pending battery (the operator UI)

U-H8 is the **first unit a live session is genuinely needed to exercise the
operator UI end-to-end**. The operator manage surface is **NOT MCP-visible** —
it renders in the operator isolated scope (`createIsolatedScope()`), so it must
be driven in the **Electron window**, not via `provident.dispatch`.

A `tests/unit-h8-operator-editor-live-pending-battery.md` (the `unit-ms1` style)
SHOULD be authored in a live session to exercise:
1. **Start** the app (lexical) with an isolated `HOME`.
2. Open the operator settings pane → the `#operator-rag-manage` section (add form,
   per-store rows, the confirmation strip).
3. **Add** a store (name-only form) → it appears in the listing immediately.
4. **Remove** a non-default store → the confirmation strip shows a summary →
   Confirm → the store is drained/torn down + its file stranded; Cancel → no-op.
5. **Rename** a non-default store → confirm → the old file stranded, the new entry live.
6. **Set-default** / **rename-default** → confirm → the default re-binds + (vector
   mode) the new default's vector boot re-warms; the app graph re-derives.
7. Verify the **security boundary**: an agent cannot drive any of these via
   `provident.dispatch` (the operator bodies are inline-only, never globally
   handler-registered).

---

## 6. Consolidated live-test checklist (quick reference)

- [ ] Start the app: `scripts/start-app.sh --mode=lexical` (or `--mode=vector` with ollama up).
- [ ] Confirm the MCP server: `node scripts/mcp-cli.mjs --target http --port 3787 tools`.
- [ ] Run the authored batteries (§3): U-MS1..U-MS5, U-V1..U-V3, U-X.
- [ ] Author + run the hot-apply batteries (§4.1): U-H1..U-H8.
- [ ] Author + run the fan-out battery (§4.2): U-F3 `stores:"all"`.
- [ ] Exercise the operator UI end-to-end (§5): U-H8 in the Electron window.
- [ ] Vector mode: verify the W1–W5 vector boot + cache against real ollama.

---

## 7. Notes & caveats

- **Operator UI is NOT MCP-visible** (U-MS5/U-H8): the settings-pane + manage
  sections render in the operator isolated scope; `get_rendered_html`/`list_targets`
  never see `operator-*` nodes. Drive them in the window.
- **Isolated `HOME`** (`HOME=$(mktemp -d)`) avoids touching the operator's real
  persisted store during live testing.
- **Vector mode** needs a running ollama with `embeddinggemma`; the vector-boot
  warm-up is sync-before-window for the default store.
- The node-testable suites are already green (`npm test`, trio 2825 pass / 41 skip);
  these batteries are ONLY for the live/UI surfaces.
