# Astrographer — Live User / E2E Test-Suite Plan (UI Overhaul + Gnosis)

**Status:** PLAN (2026-09-14). **Purpose:** spec a live, running-app e2e/user-test
suite that exercises the landed UI-overhaul features + the Gnosis integrations on
the REAL Electron app — the surface that the node test suites cannot reach. It
grounds every expectation in a subset of the archived UI-overhaul doc reviews
(`archive/reviews/2026-09-12-u-shell-{1,3,4,5,8,9a}-doc-review.md`,
`2026-09-13-unit-{9b-h1,h2,h3,9b-hardening,u-edit-2}-doc-review.md`,
`2026-09-14-unit-u-shell-{7,shell-wiring,u-import-1-import-surface}-doc-review.md`)
and the unit specs/greens they record. This is a **plan + expectations contract**,
not yet an automated runner.

## 0. How the suite runs

- **Driver (the automated runner — closes the "no harness" gap):**
  `scripts/live-drive.mjs` launches the app with a disposable HOME, connects BOTH
  surfaces (MCP via the SDK `StreamableHTTPClientTransport` + CDP via WebSocket),
  **enables the MCP tool groups** (default-off on a fresh boot — see GAP-2), seeds
  a deterministic corpus, and runs a named §6 block or all of them, printing
  PASS/FAIL and exiting non-zero on FAIL. The launcher gains `--cdp-port=<n>`
  (`--remote-debugging-port`) to expose the CDP surface.
- **Isolation:** the app boots the operator's real userData RAG store; every run
  MUST use a disposable env: `scripts/start-app.sh --mode=…` under a disposable
  `HOME=$(mktemp -d)` (never the real store). The driver does this automatically.
- **Modes:** `--mode=lexical` (default, no external model) · `--mode=vector`
  (needs an embedding/LLM service — §1) · `--mode=gnosis` (spawns the built
  `gnosis-server` binary + points the shell at it — §1). The Gnosis toggle is
  orthogonal to the local embedder.
- **MCP transport:** HTTP on `127.0.0.1:3787` (`--port=N`), group-gated tools.
- **Group enablement (REQUIRED precondition):** a fresh isolated boot exposes only
  the 7 `read`+`dispatch` tools. `rag.list_documents`/`rag.query`/
  `edit.import_markdown`/`gnosis.*` need the `rag`/`edit`/`gnosis`(+`gnosis-edit`)
  groups. The driver enables them via the **renderer security bridge** (`CDP
  Runtime.evaluate` → `window.provident.security.set({groups:[…]})`) — these are
  operator-only (not MCP-exposed), so the harness must drive them through the
  renderer DOM, never an MCP call.
- **Two drive surfaces (both required — they see disjoint things):**
  1. **MCP** (`tools/call`, `get_rendered_html`, `get_markdown`, `list_targets`,
     `dispatch`, `provident.*`) — the **app graph** only; it cannot see the shell
     chrome or the isolated operator panes.
  2. **Rendered-DOM via CDP** (`--cdp-port`) — drives the **shell chrome**
     (`#settings-toggle`, `.gutter`, tab strip, `.pane-frame`) via
     `Runtime.evaluate` + `Input.dispatchMouseEvent` (clicks + pointer-drag
     gestures for the C4/C7/C5 tests) and reaches the **isolated operator panes**
     (MCP-invisible by construction) + the security bridge. A native OS dialog
     (U-IMPORT-1) cannot be driven by CDP — §6.11 injects a fixed selection.
- **Seed corpus (deterministic fixture):** `scripts/live-drive.mjs --seed=<dir>`
  mints a fixed two-document corpus (`alpha.md`, `beta.md` — "Settings modal
  (C3)…", "Pane collapse (C5)… crosslinks to alpha") and imports it via
  `edit.import_markdown`, so §5/§6 expectations are byte-stable across runs. If
  `--seed` is omitted the driver creates the fixture under the disposable HOME.

## 1. Missing configs / outside components the live app needs

| Component | Needed for | Status | What the suite must provide |
| --- | --- | --- | --- |
| **Embedding/LLM service (ollama or cloud)** — `PROVIDENT_EMBEDDING_PROVIDER=ollama` + `PROVIDENT_EMBEDDING_BASE_URL=http://localhost:11434` + `PROVIDENT_EMBEDDING_MODEL=embeddinggemma` (or openai/cohere + `PROVIDENT_EMBEDDING_API_KEY`) | RAG **vector-mode enrichment** (`--mode=vector`): nodes are embedded → vector retrieval. **This is the LLM-for-RAG gap** — the app never starts it; the operator must run it. | **MISSING unless the operator runs ollama / supplies a cloud key.** Lexical mode needs none. | A live ollama (or cloud embed key) reachable at the configured base URL. Live tests needing vector retrieval run only when it is up. |
| **`gnosis-server` binary crate (P2)** — `GNOSIS_SERVER_BIN=$ROOT/../Gnosis/target/debug/gnosis-server` | The Gnosis integration (`--mode=gnosis`): the shell proxies document/wiki CRUD + retrieval to this server. | **BUILT + present** (the sibling `../Gnosis/target/debug/gnosis-server` exists; `--mode=gnosis` spawns it, waits for `/engine/status` Ready (~10s), and kills it on exit). **NOT a gap — the integration is done** (proxies/MCP/GUI landed + partially live-verified). | None from Astrographer. The live surface additionally needs a RUNNING engine backend + the `gnosis`/`gnosis-edit` groups enabled — the next row + §0/§6. |
| **Live Gnosis engine backend + its embedding model** — `GNOSIS_SERVER_OLLAMA_URL` (default `http://localhost:11434`) + `GNOSIS_SERVER_OLLAMA_MODEL` (default `nomic-embed-text`) | The `gnosis-server` reaches `state:Ready` and emits a real SSE `ragStream` (the server reads these at ITS start). | **The binary is built; the RUNNING backend is the real dependency.** Without a reachable ollama/embed model, `gnosis.*` happy-path live tests are gated. | Run an ollama with `nomic-embed-text` reachable at `GNOSIS_SERVER_OLLAMA_URL`; then `curl http://127.0.0.1:$PORT/engine/status` → `HealthReport Ready`. Without the backend, assert the D2-fallback (`EngineUnavailable`) — live-verifiable now. |
| **`PROVIDENT_ENGINE_BASE_URL` / `provident-engine-config.json`** | Pins the engine base URL; auto-set to `http://127.0.0.1:$GNOSIS_SERVER_PORT` in `--mode=gnosis` (config-seam wins if an operator override is persisted). | Present (launcher/config seam). | Verify the seam points at the live server. |
| **Electron host setup** — SUID `chrome-sandbox` (`sudo chown root:root node_modules/electron/dist/chrome-sandbox && sudo chmod 4755 …`) + writable `/dev/shm` (or `--disable-dev-shm-usage`) | The app window boots at all. | Present as env/host setup (launcher defaults to `--no-sandbox` + `--disable-dev-shm-usage`). | Run on a host where these hold (the launcher defaults are the sanctioned path). |

**Net missing-for-the-full-surface:** (a) an **external embedding/LLM service** (ollama, or a cloud embed key) for **vector** RAG enrichment; (b) a **RUNNING Gnosis engine backend** (ollama + `nomic-embed-text`) so the built `gnosis-server` reaches `state:Ready`, plus the `gnosis`/`gnosis-edit` **tool-group enablement** for the MCP/GUI surface. The **`gnosis-server` binary itself is BUILT** — it is NOT a gap. Lexical-mode + the shell/UI surface need no outside component.

## 2. Suite structure

- **Block per added feature** (§6): precondition (seeded store) → action (MCP call
  and/or CDP click/gesture) → **expected observable** (DOM state / MCP result).
- **Dual assertion:** where a surface has both a node test and a live form, the live
  test uses the node-tested expectation as its oracle (the doc reviews pin the
  node-level behavior; the live test confirms it on the real DOM/MCP).
- **Grouping:** one block per unit (U-SHELL-1/3/4/5/8/9a/9b/EDIT-2/7/N7/U-IMPORT-1)
  + one **Gnosis** block (gated on §1). Tracked in `docs/next-steps.md` as the
  un-parking of the corresponding `-live-pending-battery.md` files.

## 3. What a set of queries should surface (expectations)

For a seeded corpus + the app graph, the following MCP/provident observations are
expected (per the doc reviews):

| Query / call | Expected surfaced surface |
| --- | --- |
| `rag.list_documents` | the doc-heads list (each `{documentId,title,path,tags}`), single-store default |
| `rag.query "<seed term>"` | the relevant RAG objects + their coarse line map (lexical; vector if embedder up) |
| `get_rendered_html <doc>` | the document's rendered provident envelope (the stage + the pane roots it references) |
| `get_markdown <doc>` | the document's markdown representation |
| `provident.list_targets` | every MCP-dispatchable node/target (the app-graph panes + content) |
| `provident.focus <tabTarget>` | the tab strip activates/opens that main-focus target (C14) |
| `provident.journal` | the undo/redo history (C16) |
| `provident.dispatch <target> <event>` | a synthetic event routed to that node (the agentic surface) |
| `gnosis.wiki.list`/`document.list` (gnosis mode) | the engine's wiki/doc summary surfaces (D4 parity with the GUI panes) |

The **UI parity corollary** (from `ui-overhaul.md` §4): every one of these has a UI
home, and a live test asserts the MCP result ↔ the pane that renders it agree.

## 4. RAG-graph link edges (the data-model / parity edges to verify live)

Astrographer is a graph-RAG; the suite asserts the following semantic edges are
**both** present in the graph AND reflected in the UI (the user's
`'document list' → 'is a' → 'UI pane'` example):

| Edge | Meaning (RAG / parity) |
| --- | --- |
| `document` → `is a` → `doc-nav` pane | a document renders a `doc-nav` entry + the central stage target |
| `document list` → `is a` → `operator-rag-stores` listing + `rag.list_documents` | the store census has a UI + a tool home |
| `edit.import_markdown` → `is a` → `File → Import…` | the MCP import tool and the native menu route to the SAME `importMarkdownCorpus` (MCP-UI equivalence, C17) |
| `provident.focus` → `is a` → `#tab-strip` | the MCP focus tool drives the UI tab strip (C14) |
| `pane` → `lives in` → `zone:left`\|`right`\|`header`\|`footer` | every pane is placed in a zone container (U-SHELL-1) |
| `gutter` → `separates` → `zone:left·stage`, `stage·right`, `header·main`, `main·footer` | the C7 resize gutters between tracks |
| `provident.journal` → `is a` → `Undo/Redo` toolbar + `pane-history` | the C16 history surface reads the project journal |
| `security`/`operator settings`/`registry manage`/`module`/`gnosis-status` panes → `is a` → `#settings-modal` | the C3 modal hosts the operator-only panes; MCP-invisible |
| `gnosis.*` tools → `is a` → `gnosis-status`/`query`/`wikis`/`documents` panes | the D4 GUI-pane ↔ MCP parity (Gnosis) |

## 5. Per-pane content for a given open document (expectations)

With a document `D` open (active tab / focused target), the suite asserts each
pane's content:

| Pane / element | Expected content when `D` is open |
| --- | --- |
| central stage (`#app`) | `D`'s rendered content (the active focus target's body) |
| `doc-nav` (zone `left`) | the document tree with `D` active/highlighted; a doc list (`rag.list_documents` parity) |
| `crosslinks` (zone `right`) | `D`'s backlinks / crosslinks (`get_node_state`/backlinks parity) |
| `search` (zone `right`/top) | the query box; a search result open is `provident.focus`-drivable |
| `template-editor` (zone) | the active template envelope |
| `tab-strip` (top bar) | `D` + other open targets; `D` is the active tab |
| `Undo/Redo` toolbar + `pane-history` | a list of the journal entries incl. any post-`D`-open edits (C16) |
| `#settings-modal` (operator panes) | the operator-only panes **only when the modal is open**; MCP-invisible by construction |
| `gnosis-status`/`query`/`wikis`/`documents` (Gnosis) | the engine status/query/doc surfaces for `D`'s wiki when Gnosis is up |

## 6. One live test per added feature (the required examples)

1. **U-SHELL-1 (layout + zones):** seed 2 docs → `get_rendered_html`/CDP shows
   `doc-nav` in `zone:left` and `crosslinks` in `zone:right`; the `.layout` grid
   tracks reflect a persisted `LayoutState` (`left 220/right 220/header 48/footer 48`).
2. **U-SHELL-3 (collapse):** CDP click `pane-collapse-doc-nav` → the pane root gains
   `.is-collapsed` and its body unmounts (header-only).
3. **U-SHELL-4 (drag/relocate + C11 + C12):** CDP pointerdown-drag a `pane-*` frame
   toward an empty zone → the zone shows `.is-revealed`; on drop the pane relocates
   (a zone-legal target) / self-drop is a no-op.
4. **U-SHELL-5 (gutters, C7):** CDP drag `.gutter[data-zone='left']` → the track
   resizes with ONE commit at `pointerup`, clamped to `[160,640]`.
5. **U-SHELL-8 (View-menu pane visibility, C13):** the native View → Panes menu toggles
   `doc-nav` on/off → the pane appears/disappears (persisted via `enabledPanes`).
6. **U-SHELL-9a (tabs, C14):** `provident.focus {target:"<D1>"}` → the tab strip
   opens/activates `D1` and `D1` renders in the stage; the persisted active tab survives.
7. **U-SHELL-9b (C20 + Option-C):** edit a node shared across ≥2 documents → the
   `#settings-modal`-hosted owners box shows the owner count; on commit the
   confirmation strip offers fork / mutate-all (the atomic `edit.batch`).
8. **U-EDIT-2 (undo/redo, C16):** make an edit → `provident.journal` lists it; the
   Undo toolbar + `pane-history` reflect it; `undo` reverts the content in place.
9. **U-SHELL-7 (settings modal, C3):** CDP click `#settings-toggle` → `#settings-modal`
   flips `.is-closed`→`.is-open`; the operator panes render inside; a `get_rendered_html`
   of the app graph does NOT include them (MCP-invisible).
10. **U-SHELL-N7 (shell pointer-wiring, C7/C4 live):** the C7 gutter drag (4) and the
    C4 pane drag (3) actually fire on the live DOM — the wiring's delegated
    `pointerdown`/`closest` reaches authored chrome (`startGutter`/`startPaneDrag`).
11. **U-IMPORT-1 (File → Import…, C17):** the native File → Import… (or Import folder… on
    win/linux) opens the dialog; **inject a fixed selection** (CDP can't drive the OS
    dialog) → the `.md` file(s) import via `importMarkdownCorpus` → a new document
    appears in `doc-nav` + `rag.list_documents`, and `IPC_IMPORT_RESULT` fires exactly once.
12. **Gnosis (D4 parity + the D2-fallback):**
    - **D2-fallback (runs now, no backend):** with `--mode=gnosis` but no reachable
      engine backend (ollama down / no `nomic-embed-text`), the `gnosis.*` MCP tools
      + the `gnosis-query`/`documents`/`wikis`/`status` panes surface the documented
      `EngineUnavailable` (503/`cause`), NOT a crash — live-verifiable today.
    - **Happy-path (gated on a RUNNING backend):** with the engine `Ready`,
      `gnosis.wiki.list`/`document.list` resolve to the typed summaries and the D4
      GUI panes render them (MCP ↔ pane parity).

**Battery reconciliation (GAP-3):** each §6 block is the un-parking of a NAMED
subset of the already-authored, scenario-filled `-live-pending-battery.md`
(`unit-u-shell-{7,shell-wiring,u-import-1-import-surface}-live-pending-battery.md`
for items 1/9/10/11 + `unit-u-shell-{1,3,4,5,8,9a,9b}-…`-greens for the rest;
`unit-ujr1-get-journal-*` + the Gnosis `unit-gn-*`/`unit-a1-*/a2-*` batteries for
item 12 + the journal/Gnosis surfaces). `scripts/live-drive.mjs` implements the
blocks; each PASS moves the corresponding battery scenario to CLOSED.

Each is written out fully in the corresponding un-parked
`-live-pending-battery.md` (the parked scenarios above are the source); this plan is
the contract for what "PASS" means (the expected observable column).

## 7. Accept / gate

- Modes without their missing component (§1 vector/Gnosis) run the non-gated subset
  (lexical + shell/UI) and report the gated ones **PARKED**, never FAIL — gate 6.
- A live contradiction of a node-tested expectation (any block above) is a **finding**
  (doc/spec drift or a regression), never a pass.
- This plan + each un-parked battery feed `docs/next-steps.md`; each PASS moves the
  battery to CLOSED.
