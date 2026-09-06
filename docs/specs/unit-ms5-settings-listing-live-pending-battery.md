# Unit MS5 — Read-only settings-pane store listing + the `RagQueryPayload.store` passthrough: LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date:** 2026-09-05.
- **Source contract:** `docs/specs/unit-ms5-settings-listing.md` — §5.1 (the
  three shared types + the `RagQueryPayload.store?: string` additive field),
  §5.2 (the shared `handleRagStoreListingIpc` verbatim projection + the
  exactly-three pinned throws + the empty → `{ stores: [] }` + the
  skip-malformed discipline + the status-supply rule), §5.3 (the
  `bridge.rag.stores()` + the 3-arg `query(q, topK?, store?)` widening), §5.4
  (the `ipcMain.handle` wiring + the `listingEntries` projection + the
  F-MS5-2 defensive fourth throw), §5.5 (the settings-pane listing section +
  the `lastStoreListing` boot cache + the no-refetch), §5.6 (the
  `RagQueryPayload.store?` IPC passthrough + the explicit-`undefined` ≡ absent
  semantics + the RAG-QUERY-STORE-DISPLAY-ASYMMETRY), §5.7 (the BE-1..BE-8
  zero-config byte-equality rows), §5.8/§5.9 (the happy/fail red set), §3a
  (F-MS5-1..F-MS5-5).
- **Greens battery (blind-test, already run against the live MODULES):**
  `docs/specs/unit-ms5-settings-listing-greens.md` — 34 scenario rows
  (**25 PASS / 0 FAIL / 9 DOCUMENTED-or-RELEGATED**; the recorded run: 25/25
  vitest tests, exit 0). All 25 executable rows drive the node-testable seams
  of the live modules — they are already green against the modules and need no
  live re-run.
- **Status:** **PARKED — this unit's observable surface is the OPERATOR UI,
  not any MCP endpoint.** Pattern precedent: `docs/specs/unit-ms2-store-wiring-live-pending-battery.md`
  and `docs/specs/unit-ms1-store-registry-live-pending-battery.md` (both the
  same surface-absence park shape). This battery is the handoff for a LATER,
  **UI-interactive** iteration of the live-scenario runner.

---

## 1. Why this battery is parked (the live-surface assessment, verified live 2026-09-05)

The app IS running and its MCP server IS reachable (pid 555313,
`npm exec electron . --no-sandbox --disable-dev-shm-usage --mcp-transport=http
--retrieval-embedder=lexical`, started **2026-09-05 19:02:48**; `initialize` +
`tools/list` both succeeded over streamable HTTP at `http://127.0.0.1:3787/mcp`;
serverInfo `provident-electron` v0.1.0, protocolVersion 2025-03-26). **And —
unlike the U-MS2 battery — U-MS5 is LANDED and the app serves the multi-store
build:** every one of the 12 rag/edit tools carries the `store` argument in its
live inputSchema (U-MS2's selector is live). The park is therefore NOT a
restart/gap park; it is a **by-design surface-observability park**:

### 1.1 The `operator-rag-stores` settings-pane section is NOT MCP-visible (the decisive probe)

`provident.get_rendered_html` and `provident.list_targets` read ONLY the APP
Runtime graph. The U-MS5 listing section lives inside `settingsContent()`,
which renders via `mountOperator()` → `buildOperatorEnvelope` →
`createIsolatedScope()` — a SEPARATE GraphScope (own Supervisor + own
DomAdapter) that NEVER enters the app-graph envelope (OPERATOR-ISOLATED-
GRAPHSCOPE; the pre-existing negative pinned in `tests/sidebar-panes.test.ts:730-743`).

**Live verification (2026-09-05):** `get_rendered_html` on the running app
returns the document/pane graph (`pane-doc-nav`, `pane-crosslinks`,
`pane-search`, `pane-template-editor`, `pane-search-input`, …) with **ZERO
`operator-*` nodes** — no `operator-rag-stores`, no `operator-rag-store-main`,
no `operator-editing-mode`, no `operator-enabled-panes`, … (grep across the
full rendered-HTML payload: 0 hits for `operator-`). This is the same
isolation that hides the PRE-EXISTING operator settings controls
(`operator-editing-mode`, U1's pane) from the app Runtime — so it is not a
U-MS5 regression but the documented standing isolation guarantee. No MCP
endpoint (not `provident.get_rendered_html`, `get_markdown`, `list_targets`,
`get_node_state`, nor `provident.dispatch` targeting its nodes) can reach it.

### 1.2 No store-census MCP tool exists live (the §5.9 fail-9 negative, confirmed)

Live `tools/list` (39 tools) contains **NO store-enumerating tool** — no
`rag.list_stores`, no `rag_stores`, no `rag-store-listing` surface. The census
is operator-UI-only (B9/A9); this unit's negative pin (§5.9 fail-state 9,
"never MCP-enumerable") HOLDS against the live app. (This is the one U-MS5
claim genuinely live-verifiable by an agent — already confirmed above.)

### 1.3 `bridge.rag.stores()` + the `RagQueryPayload.store` forward are IPC/preload surfaces, NOT MCP tools

These are renderer↔main IPC channels (`provident:rag-store-listing`) and the
preload bridge method — not MCP tool surfaces. An MCP agent cannot invoke them
from the tools/list surface. (The `store` argument on the live MCP `rag.query`
tool is U-MS2's SELECTOR surface, not this unit's IPC passthrough — the
passthrough is the renderer's `bridge.rag.query(q, k, store)` → `IPC_RAG_QUERY`
forward, renderer-side.) Only the shared handler seam (`handleRagQueryIpc`)
behind the passthrough is node-testable — already green in the blind battery
(D1–D4).

### 1.4 The node-verified projection/handler is internal (already green at module level)

`handleRagStoreListingIpc`, `storeLoadStatus`, the `IPC_RAG_STORE_LISTING`
projection, and the wiring resolver are module/node seams exercised by the
blind-test battery's 25/25 executable rows — green, not a live-app surface.
They are already PASS; nothing to park there.

**Conclusion:** the U-MS5 observable surface is the OPERATOR'S OWN UI (the
settings window's rendered `operator-rag-stores` section), visible to the human
operator, NOT to any MCP endpoint. Per the live-runner contract these
surfaces are **parked** (not failures) for a UI-interactive session. The 9
DOCUMENTED-or-RELEGATED greens rows (G1–G5, R1–R4) are recorded in this
battery (§4).

---

## 2. The live surfaces (operator-visible) that WILL exercise the U-MS5 behavior

| Live surface | U-MS5 behavior it exposes | How to drive it live |
| --- | --- | --- |
| The app's **settings pane** (the Electron shell's settings window, operator-isolated) | The `operator-rag-stores` section: the `h3` "RAG stores" + one entry div per configured store (`operator-rag-store-<name>`) with `data-store`/`data-default`/`data-status` + the pinned content string; OR the `(stores unavailable)` / `(no stores)` placeholder | Open the settings pane on the running instance and observe the listing section (human operator / UI-interactive session) |
| The zero-config listing (no `provident-rag-stores.json`) | The BE-1/BE-1a single-`main` row: `data-store='main'`, `data-default='true'`, content `main — default: yes — persistence: provident-rag.json — corpus: (project root) — status: loaded` (or `failed-missing` on a real first run) | Observe the settings pane on the live zero-config instance (the current running app) |
| A configured multi-store registry in an ISOLATED userData | The N-entry listing: one row per store, each with `data-store`, `data-default`, `data-status`, and the `persistence: <basename>` / `corpus: <root | (project root)>` / `status: <s>` content | Plant `provident-rag-stores.json` in a scratch `$HOME` userData, restart, open the settings pane (§3.2) |
| The `boot()` fetch + `lastStoreListing` boot cache + no-refetch (R4; §5.5) | The listing appears on the FIRST operator render (boot fetch before `mountOperator`); a `rag-store-changed` re-derive re-renders the CACHED listing (fetch count stays 1); a mid-run registry edit is NOT reflected until restart (D8) | Observe the settings pane after boot, after a re-derive, and after a mid-run registry-file edit + no restart |
| The `ipcMain.handle(IPC_RAG_STORE_LISTING, …)` registration (R3; §5.4) | Observes only in EFFECT: the settings pane successfully shows the listing (the invoke resolved) — never a rejected/error placeholder in an uncompromised run | Presence of the populated `operator-rag-stores` section at first render |
| The preload `bridge.rag.stores()` + the 3-arg `query(q, topK?, store?)` widening (R1/R2; §5.3) | Observable only via the renderer context or its downstream effect; the byte-equal omitted-store semantics are already node-covered (greens D3/BE-4) | In a UI-interactive session, evaluate from the renderer devtools / preload context: `bridge.rag.stores()` resolves the `RagStoreListingPayload`; `bridge.rag.query(q,k)` builds `{query, topK}` with NO `store` key |
| `submitQuery` passes NO store + the display-only asymmetry (G5; §5.6) | The search pane's own query path calls `bridge.rag.query(value, topK)` with exactly TWO args — never a store | UI-interactive: observe the search pane's query IPC payload (no `store` key); a non-default result, if ever rendered, is display-only (no navigation) |

**Prerequisite for the later run (MANDATORY, identical to the U-MS2/U-MS1
batteries):** an ISOLATED test userData — on Linux `app.getPath('appData')`
follows `$HOME`, so `HOME=$(mktemp -d) npm start > boot.log 2>&1` boots against
a scratch `$HOME/.config/provident-electron/`. The REAL userData
(`/home/ryanr/.config/provident-electron/`, holding the real legacy
`provident-rag.json`) must NEVER be modified by a battery. The current running
instance is zero-config over the operator's real userData and is fine to
observe read-only via the settings pane, but its store listing will show only
the single implicit `main` entry (§3.1).

---

## 3. The concrete live probes to run once a UI-interactive session is available

The "expected" column re-expresses the greens/spec expectation as a
settings-pane-visible observable. A live result that CONTRADICTS the greens or
the spec is a finding (a regression or a doc/spec drift) — never a pass.

### 3.1 Zero-config (the current running instance, read-only)

| Step | Expected (settings-pane visible) |
| --- | --- |
| Open the app's settings pane on the running zero-config instance | The `operator-rag-stores` section appears (appended as the LAST child of the settings `section`, below the pre-existing `operator-editing-mode` toggle / `operator-topk` / `operator-default-document` rows — BE-5) |
| The listing container | `id='operator-rag-stores'`, first child `h3` "RAG stores", then exactly ONE entry div |
| The single entry div | `id='operator-rag-store-main'`, `data-store='main'`, `data-default='true'`, content exactly `main — default: yes — persistence: provident-rag.json — corpus: (project root) — status: loaded` — or `... status: failed-missing` on a true first run (BE-1 / BE-1a) |
| (UI-interactive only) re-derive (a `rag-store-changed` broadcast) then reopen the pane | The listing is re-rendered from the CACHE — still the single `main` div; the bridge `stores()` call count did not grow (greens/R4 no-refetch) |

### 3.2 Multi-store (N-entry case) — isolated userData + restart

| Step | Expected (settings-pane visible) |
| --- | --- |
| Plant `$T/.config/provident-electron/provident-rag-stores.json` (e.g. `{"version":1,"stores":[{"name":"main","default":true},{"name":"research-2026-09","corpusRoot":"$T/corpus"}]}`) and boot with `HOME=$T` | Boot succeeds (the multi-store registry is live — U-MS1 landed) |
| Open the settings pane | `operator-rag-stores` lists **one entry div per configured store**, in registry order: `operator-rag-store-main` (`data-store='main'`, `data-default='true'`) and `operator-rag-store-research-2026-09` (`data-store='research-2026-09'`, `data-default='false'`, `data-status` = its actual D7 state — `loaded` with a present store file / `failed-missing` if its persistence file is absent) |
| The `data-status` attributes (after seeding/mutating the stores) | `loaded` / `failed-corrupt` / `failed-missing` per store, matching U-MS2's D7 derivation (E1/E2) |
| The `persistence: <basename>` / `corpus: <root | (project root)>` content segments | `provident-rag.json` for `main`; `provident-rag-research-2026-09.json` for the derived second store (U-MS1's F7 basename projection); the configured `corpusRoot` verbatim for `research-2026-09` |
| Negative: no switcher, no handlers | NO listing node carries `handlers`; no settings-pane control changes the active store (UI-SELECTOR-DEFERRED; §5.9 fail-8) |

### 3.3 Permanently NOT live-exercisable (module-internal / by-design)

These stay module-internal and are already green at the module level (blinds
25/25); NOT re-attempted live:

- **A1–A11, B1–B3, C1–C2, E1–E2, F1–F2, W1** — `handleRagStoreListingIpc`'s
  projection/coercion/throws/purity, the F-MS5-2 guard, `storeLoadStatus`, the
  no-write/BE-6, and the grounded zero-config projection: pure module seams,
  green. (A1/E2's `'loaded'` status is only reproducible at the handler/status
  seams, not from a live settings pane — the pane shows one status per store.)
- **D1–D4** — the `RagQueryPayload.store` IPC passthrough + the
  explicit-`undefined` ≡ absent semantics + the MCP/IPC mechanical symmetry:
  node seam (green); the renderer's bridge forwarding is preload-side.
- **BE-2/BE-6/BE-7** — the payload shape, the write-nothing, and the census:
  module + grep-level, already green/documented (G3 holds BE-7's census
  against the live 39-tool list — confirmed here).
- **F-MS5-5 negative pins** — confirmed live: no store-census MCP tool in the
  39-tool list (§1.2).

---

## 4. Parked-scenario census

- **Total greens scenario rows:** 34 (`docs/specs/unit-ms5-settings-listing-greens.md`,
  **25 PASS / 0 FAIL / 9 DOCUMENTED-or-RELEGATED**).
- **Already green at the live MODULES (no live re-run needed): A1–A11, B1–B3,
  C1–C2, D1–D4, E1–E2, F1–F2, W1** = 25 rows (the 25/25 vitest PASS; not MCP
  surfaces, module seams).
- **Parked for a UI-interactive live run (the operator-visible surface):**
  the settings-pane listing render + boot fetch + boot cache + no-refetch +
  the live N-entry case = **R4** (the §5.5 section), plus the operator-visible
  halves of **R3** (`ipcMain.handle` in effect) and **G5** (the renderer
  `submitQuery` display-only asymmetry). These are the rows a UI-interactive
  session can actually observe.
- **Parked as renderer/IPC not agent-reachable (recorded, not re-attempted
  live):** **R1** (`bridge.rag.stores()` — preload IPC) and **R2** (the 3-arg
  `query` widening — preload byte-equal covered node-side by D3), plus the
  renderer-seam notes **G1** (F-MS5-3 boot-await note), **G2** (F-MS5-4
  uncompromised-renderer note), **G3** (F-MS5-5 negative census — CONFIRMED
  live in §1.2), **G4** (F-MS5-1 PROCESS note).
- **Run live this iteration: 0 scenarios exercised via the live MCP** (the one
  genuinely agent-verifiable claim — the §5.9 fail-9 "no store-census MCP
  tool" — was verified live in §1.2 and holds).
- **Not a failure:** the app is UP, serving the multi-store build, and U-MS5 is
  LANDED. The park is purely that the unit's observable surface (the operator
  settings-pane store listing + the IPC/preload bridges) is by design NOT MCP-
  visible — an agent session cannot open or read the operator-isolated pane.
  The 9 DOCUMENTED-or-RELEGATED greens rows stay documented in the battery or
  as noted; none is a failure.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** a **UI-interactive session** with
   access to the running app's settings window. The zero-config single-`main`
   row is visible on the CURRENT running instance (no restart). The N-entry case
   additionally needs **a configured multi-store registry in an ISOLATED
   userData + a restart** (`HOME=$(mktemp -d) npm start`, registry plant BEFORE
   boot). The app must NOT be started/restarted by an agent for the read-only
   zero-config observation.
2. **UI-interactive verification shape:** open the settings pane (the Electron
   shell's settings window) on the running instance and read the
   `operator-rag-stores` section from the rendered DOM — the operator scope's
   DomAdapter. This is the human-operator surface; it is NOT reachable via
   `provident.get_rendered_html`/`get_markdown`/`list_targets`/`dispatch`
   (§1.1). Confirm the isolation negative first (MCP `get_rendered_html` still
   shows ZERO `operator-*` nodes) before/after the pane observation.
3. **Prerequisites:** NEVER the real `/home/ryanr/.config/provident-electron/`.
   The current running instance is zero-config over the operator's real userData
   → observe read-only only. For any mutating/multi-store probe, boot into an
   isolated `$HOME` userData with the registry fixture planted before boot.
4. **Same-pass pairing note:** U-MS5 shares the operator settings window and the
   `storeLoadStatus`/directory derivation with U-MS2/U-MS1. If a later iteration
   revisits those batteries' surviving MCP surfaces on the restarted app, the
   operator-visible store-listing status values (§3.2 `data-status`) are the
   UI complement to U-MS2's Class F serving matrix — coordinate the two.
5. **A live result that CONTRADICTS the greens or spec §5.1–§5.7 is a finding**
   (a real regression or a doc/spec drift) — never a pass. Report it to the
   supervisor. Byte-pinned expectations: the entry content strings (§5.5), the
   `data-store`/`data-default`/`data-status` attributes, the single-`main`
   zero-config row (BE-1/BE-1a).
6. **Do NOT add an MCP store-census tool** to make the listing agent-visible —
   the spec (§5.9 fail-9, B9/A9) FORBIDS it; the census is operator-UI-only.
7. **Doc-staleness:** before running, reconcile this battery against the actual
   repo/build state (spec section numbers, byte-pinned strings, the live tool
   list) and the trackers (`docs/next-steps.md`, `docs/pending.md`,
   `docs/decisions.md`). The U-MS5 build is landed in source and (per the live
   `store` on all 12 tools) the running app serves the multi-store build.
