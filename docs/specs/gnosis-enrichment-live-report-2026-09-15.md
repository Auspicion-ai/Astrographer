# Gnosis graph / engine-enrichment LIVE battery — report (2026-09-15)

- **Role:** live-scenario runner (RCA-11/12 — the LIVE battery is the pre-DONE gate;
  a node-suite green is ENVELOPE-green, never APP-green).
- **Unit under test:** the **G5 Gnosis** surface (`uf-overhaul` §4 G5 / §4.11, §5.7a)
  — rows **UF-GNOSIS-1..6** + **UF-PARITY-6** (`docs/specs/user-flow-audit-checklist.md`
  §10 / §12), plus the app-side `gnosis.*` MCP tools and the engine-side
  enrichment/retrieval legs.
- **Layer verified (RCA-12):** **assembled-renderer + live engine** (the real running
  Electron app + CDP + the live `gnosis-server` + live ollama), *not* the
  envelope/pure layer.
- **Verdict summary:** **1 PASS, 4 FAIL, 1 PARKED** (UF-PARITY-6 FAIL — 1 of its 4
  sub-rows passes). Two of the FAILs are **live contradictions of the shipped
  `*-greens`/census claims** (host defects); the rest are host/engine contract breaks.

## 0. Live surfaces (attached only — never spawned, never killed)

| Surface | Endpoint | Evidence it was live |
| --- | --- | --- |
| App (gnosis mode) | MCP `http://127.0.0.1:3790/mcp`, CDP `http://127.0.0.1:9225`, DISPLAY `:0` | `provident.list_targets` → 604 registered / 604 in-tree nodes; **60 MCP tools** registered (incl. all 14 `gnosis.*`) |
| Driver | `node scripts/live-drive.mjs --connect --port=3790 --cdp-port=9225 --no-seed --display=0 --block=gnosis_wikis,gnosis_documents,gnosis_query,gnosis_status,gnosis_doc_update,gnosis_crud` | blocks executed 6 |
| Gnosis engine (`gnosis-server`, P2) | `http://127.0.0.1:8080` | `GET /engine/status` → `{"state":"Ready","version":"0.1.0","subsystems":{"store":true,"graph":true,"lexical":true,"vector":true,"embedding":true,"reranker":true},"lastError":null}` |
| Ollama | `http://127.0.0.1:11434` | `embeddinggemma` served a **768-dim** embedding; `gemma4:e4b-it-q8_0` generated `ENRICHMENT-OK` |
| Pre-existing engine state (reused, unchanged) | wiki `wiki-0` "Live Enrichment Probe"; `doc-1` "Enrichment Doc" (Draft, revision 1), graph = nodes `head`/`n1`/`n2`/`end` + edges `DocHead`/`NextSection`×2/`DocEnd` | `listWikis`/`listDocuments`/`getDocument` payloads in §2.7 |

**Harness side-effects (recorded, no source/test/tracker file edited):**
the gnosis APP-GRAPH panes (`gnosis-wikis`/`gnosis-documents`/`gnosis-query`) are
**default-OFF** in the operator pane-visibility set, so the battery enabled them with
**real modal toggle clicks** (`#operator-pane-visibility-gnosis-*`) — that visibility
change is now **persisted in the running app's operator store**. `doc-1` was left at
revision 1 with an identical graph; no engine document was created, mutated or deleted.

## 1. Per-row verdicts

| Row | What was driven | Verdict | Observed (exact values) |
| --- | --- | --- | --- |
| **UF-GNOSIS-1** (gnosis-wikis lists wikis + a click shows one) | 1 real click `#settings-toggle` + real click `#operator-pane-visibility-gnosis-wikis`; real click `#gnosis-wikis-refresh`; REAL hit-tested click on `li[data-wiki-id="wiki-0"]`; [DIAG] `provident.dispatch` on the same `node-61523` | **FAIL** | List **renders** the live engine wiki: `li[data-wiki-id="wiki-0"]` text `"Live Enrichment Probe"`, painted box `[81,340,163,43]`, `nameMatchesEngine=true` (engine `gnosis.wiki.list` → `[{"wikiId":"wiki-0","name":"Live Enrichment Probe"}]`). **But every control is a live no-op:** CONTROL (no click, 3 s) assembly signature stable `true` (sig `{"roots":1,"root":"node-60932","status":"node-61538","wikis":"node-61520","docs":"node-61504"}`); real click `#gnosis-wikis-refresh` path=`cdp` → **reassembled=false**; real click the wiki `<li>` (hit `preempt-node-node-61523`, path `cdp`) → **reassembled=false**, pane text stays `"WikisLive Enrichment Probe"`, `showsWiki=false` (no `"Wiki: Live Enrichment Probe"`). [DIAG] `provident.dispatch` on the same node → `handlers=[{"name":"gnosis-wikis-select","event":"click"}]`, `results=[null]` — **the handler exists and runs; its body's seam is a no-op**. |
| **UF-GNOSIS-2** (gnosis-documents lists a wiki's documents; NOT a permanent `unavailable` deadlock) | real click `#operator-pane-visibility-gnosis-documents`, real click `#gnosis-documents-refresh`, REAL click `li[data-wiki-id="wiki-0"]` in the pane, [DIAG] `provident.dispatch` on the same li, [DIAG] direct `window.provident.gnosis.documents('gnosis.document.list',{wikiId:'wiki-0'})` | **FAIL** | The old deadlock is **NOT reproduced**: `data-gnosis-state` is **not** `unavailable`; the pane paints its wiki selector (`li[data-wiki-id="wiki-0"]` `"Live Enrichment Probe"`, box `[81,409,163,43]`, `clickableItems=1`) plus the empty-doc section `"No documents — select a wiki"`. **But the document list never renders:** real click on the wiki li (hit `preempt-node-node-61507`, path `cdp`) → **reassembled=false**, `li[data-document-id="doc-1"]` **MISSING** (`painted=false`), pane text `"WikisLive Enrichment ProbeDocumentsNo documents — select a wiki"`; the doc-li click path is `missing` (no such element) → `documentViewShown=false`. [DIAG] the direct bridge `window.provident.gnosis.documents('gnosis.document.list',{wikiId:'wiki-0'})` **RESOLVES from the live engine** → `{"items":[{"documentId":"doc-1","wikiId":"wiki-0","title":"Enrichment Doc","state":"Draft","revision":1,...}],"total":1,"page":1,"pageSize":20}` — and the pane **still** does not render it (the engine + IPC path work; the pane's own handler seam is the break). |
| **UF-GNOSIS-3** (gnosis-query submits a real engine query and renders results) | real click `#operator-pane-visibility-gnosis-query`; real click `#gnosis-query-input` + `Input.insertText` `"enrichment graph node"`; real click `#gnosis-query-submit` | **FAIL** | Typed value `"enrichment graph node"`; after the submit the pane reads `data-gnosis-pane=query`, `data-gnosis-query=""`, `traceMode=null`, **renderedResultRows=0**, pane text `"(no engine results)"`. Independent oracle — the *same* query on the **GET** path returns real results: `gnosis.stream` → **4 results**, first `"Enrichment graph node: ollama embeddinggemma vector leg."` @ `1.743411193296898` (`doc-1/n1`), then `doc-1/n2` @ `0.679…`, `doc-1/head` @ `0.157…`, `doc-1/end` @ `0.137…`. The **POST** path returns `malformed envelope: invalid JSON` (finding **F-2**). |
| **UF-GNOSIS-4** (gnosis-status renders in the settings modal, `#gnosis-status-refresh` updates it, ABSENT from app-graph MCP surfaces) | real click `#settings-toggle` (modal open); read `[data-gnosis-pane="status"]`; CONTROL 3 s no-click; REAL hit-tested click `#gnosis-status-refresh` (hit `gnosis-status-refresh`); `provident.get_rendered_html` + `provident.list_targets` | **PASS** | Pane `inModal=true`, `inOperatorPanes=true`, painted box `[60,46,832,280]`, `data-gnosis-state="Ready"`, `data-engine-version="0.1.0"`, subsystems `store/graph/lexical/vector/embedding/reranker = true`, text `"Gnosis engineState: ReadyVersion: 0.1.0…lastError: null"` → `matchesLiveEngineReport(state+version+subsystemCensus)=true`. Refresh: CONTROL stable `true`; the REAL click **re-assembled the app graph** (`root node-62311 → node-63565`, `status node-62917 → node-64171`) = the causal proof the click reached its handler (`refreshStatus()` → live engine read → `onChanged()`/`host.refresh()`), pane `repainted=true`, `state=Ready`. MCP invisibility: `get_rendered_html` (523 349 chars) contains a status-pane marker = **false**; `list_targets` contains `"gnosis-status"` = **false** — while the *app-graph* gnosis panes **are** visible in the same call (`gnosis-wikis`=true, `gnosis-documents`=true, `gnosis-query`=true). *No value delta is observable: the engine's `HealthReport` is invariant while the engine stays Ready.* |
| **UF-GNOSIS-5** (docs-pane Update must not blank content with an empty-graph placeholder — HC1) | real pane enable + expand; real click `#gnosis-documents-refresh`; real click the wiki li; enumerate the pane's rendered controls; `gnosis.document.get doc-1` before/after; MCP empty-graph update probe | **PARKED** (reason: **the Update control does not exist**) | Rendered gnosis-documents controls = `["pane-collapse-gnosis-documents","gnosis-documents-refresh","gnosis-doc-title","gnosis-documents-create"]` — `updateControlsInPane=[]` (W1-Q12 parked the Update control deliberately: the old button submitted a fake `{nodes:[],edges:[]}` graph). There is therefore **no drivable Update gesture**. Verified negatives: `doc-1` graph nodes `4→4` (`graphIntact=true`), node values byte-identical before/after the whole pane drive; and the empty-graph path is unreachable over MCP too — `gnosis.document.update {callerId:'operator',baseRevision:1,graph:{nodes:[],edges:[]}}` → `gnosis.document.update: caller has no edit authority` (denied **before** any engine wire call; engine still at revision 1). |
| **UF-GNOSIS-6** (each CRUD action's UI control is present and performs a real engine wire call) | real pane enables/expands; real clicks `#gnosis-wikis-refresh`, `#gnosis-documents-refresh`, wiki li; rendered-control census + painted-box census; real click `#gnosis-documents-refresh` again for the inertness delta; MCP `gnosis.document.delete` / `gnosis.document.create` with the real schema | **FAIL** | Present + painted: `gnosis-wikis-refresh [94,21]`, `gnosis-wikis-create [81,21]`, `gnosis-documents-refresh [131,21]`, `gnosis-documents-create [117,21]`, `gnosis-wikis` li, `gnosis-documents` wiki li. **Absent from the rendered DOM:** `docsSelectDoc=false`, `docsDelete=false`, `docsPublish=false`, `docsUnpublish=false`, `docsArchive=false`, `docsUpdate=false` — the doc verbs are conditionally rendered only when a document is selected, and **selection is a no-op** (`allPresentExceptUpdate=false`, `allPainted=false`). **No control performed a wire call:** real click the wiki li → `reassembled=false`; real click `#gnosis-documents-refresh` → `reassembled=false`; the only live engine reads come from the host's **boot** path (`gnosis-wikis` li + `gnosis-documents` wiki-selector li both read from the boot `gnosis.wiki.list`). Mutating verbs over the identical MCP handler: `gnosis.document.delete {callerId:'operator'}` → `gnosis.document.delete: caller has no edit authority`; `gnosis.document.create {callerId:'operator'}` → `gnosis.document.create: caller has no edit authority`; `doc-1` survived (`true`) — the mutating half is additionally gated fail-closed because **no caller has edit authority in this instance** (`operator` and every other `callerId` are denied ⇒ `loadAuthorityMapping()` produced an empty mapping, i.e. `PROVIDENT_OPERATOR_CREDENTIAL` is unset/empty on the running app — see §4). |
| **UF-PARITY-6** (§12 G5: status (modal operator) + query/wikis/documents all EXISTS; streams PARKED) | = rows UF-GNOSIS-1..4/6 | **FAIL** | 1 of its 4 asserted sub-surfaces works live (**status only**). The wikis / documents / query panes exist as *rendered* surfaces but their controls are inert (UF-GNOSIS-1/2) or their engine call is broken (UF-GNOSIS-3). The "streams PARKED" carve-out is **stale**: `gnosis.stream` (the engine SSE stream) is **live-WORKING** over MCP (`→ {chunks:[{type:'result',…4 results…},{type:'done'}]}`) — the PARKED claim drifts from the build. |

### 1.1 The app-side `gnosis.*` MCP tool list (REAL names, 14) + arg schemas

Enumerated from the live `tools/list` (all 14 registered, `gnosis` + `gnosis-edit` groups
enabled):

`gnosis.query`, `gnosis.stream`, `gnosis.status`, `gnosis.document.get`,
`gnosis.document.list`, `gnosis.wiki.get`, `gnosis.wiki.list`,
`gnosis.document.create`, `gnosis.document.update`, `gnosis.document.delete`,
`gnosis.document.publish`, `gnosis.document.unpublish`, `gnosis.document.archive`,
`gnosis.wiki.create`.

| Tool | required args | optional args |
| --- | --- | --- |
| `gnosis.query` | `query: string` | `topK:number`, `mode:enum['flat','graph','vector','hybrid']`, `maxHops:number`, `expand:enum['none','parent']`, `maxParentContext:number`, `filters:{nodeKind,edgeType,target{documentId,nodeId},state}` |
| `gnosis.stream` | `query: string` | (same as `gnosis.query`) |
| `gnosis.status` | — | — |
| `gnosis.document.get` / `gnosis.wiki.get` | `documentId` / `wikiId` | — |
| `gnosis.document.list` | `wikiId` | `state:enum['Draft','Published','Archived']`, `tag`, `page`, `pageSize` |
| `gnosis.wiki.list` | — | — |
| `gnosis.document.create` | `callerId, wikiId, title` | `tags[]`, `author`, `requestId` |
| `gnosis.document.update` | `callerId, documentId, baseRevision, graph{nodes[],edges[]}` | `title`, `tags[]` |
| `gnosis.document.delete` / `.publish` / `.unpublish` / `.archive` | `callerId, documentId` | — |
| `gnosis.wiki.create` | `callerId, name` | `requestId` |

**Malformed-arg behaviour (observed verbatim, live):** the MCP SDK's zod seam answers
first with `MCP error -32602: Input validation error: …`; only a type-valid value reaches
the handler (the documented `HOST-LIVE-ZOD-SEAM` erratum, re-confirmed here).

| Call | Observed |
| --- | --- |
| `gnosis.query {}` | `-32602 … Invalid input: expected string, received undefined at query` |
| `gnosis.query {query:5}` | `-32602 … expected string, received number at query` |
| `gnosis.query {query:""}` | handler-level: `gnosis.query: query must be a non-empty string` |
| `gnosis.query {query:'x',mode:'FLAT'}` / `{mode:'bogus'}` | `-32602 … Invalid option: expected one of "flat"\|"graph"\|"vector"\|"hybrid" at mode` |
| `gnosis.query {query:'x',topK:'3'}` | `-32602 … expected number, received string at topK` |
| `gnosis.stream {}` | `-32602 … expected string, received undefined at query` |
| `gnosis.status {junk:1}` | accepted (empty schema, extra keys stripped) → the `HealthReport` |
| `gnosis.document.get {}` | `-32602 … expected string, received undefined at documentId` |
| `gnosis.document.get {documentId:""}` | handler-level: `gnosis.document.get: documentId required` |
| `gnosis.wiki.get {}` | `-32602 … expected string, received undefined at wikiId` |
| `gnosis.document.list {}` | `-32602 … expected string, received undefined at wikiId` |
| `gnosis.document.list {wikiId:'wiki-0',pageSize:'20'}` | `-32602 … expected number, received string at pageSize` |
| `gnosis.document.create {callerId:'operator'}` | `-32602 … expected string, received undefined at wikiId Invalid input: expected string, received undefined at title` |
| `gnosis.document.update {callerId:'operator',documentId:'doc-1'}` | `-32602 … expected number, received undefined at baseRevision Invalid input: expected object, received undefined at graph` |
| unknown tool `gnosis.nope` / `not.a.gnosis.tool` | `-32602: Tool gnosis.nope not found` |

**The `malformed envelope: invalid JSON` finding — attributed precisely (see F-2).**
`gnosis.query` is not an *encoding* bug of the arguments; it is a **request-body shape
mismatch against the engine wire contract**, and the host then **masks** the engine's real
error. Exact chain: `src/main/engine-rag-store.ts` → the `ragQuery` closure of
`createEngineRagStore` (line ~898) builds `body: JSON.stringify({ query, ...opts })`
(**line 920**) — a bare body with **no F2 envelope** — and POSTs it to `/rag/query`.
The live engine's `rag_query_handler` (`../Gnosis/src/bin/gnosis_server.rs:157`) opens with
`Envelope::from_json(&body)`, so a missing `schemaVersion`/`idFormat`/`payload` is a
`DecodeError::InvalidEnvelope` → `decode_error_response` → **HTTP 400 `text/plain` `"request decode failed"` (21 bytes)**.
The host then does `decodeEnvelope(text)` whose `JSON.parse("request decode failed")` throws
`EngineError('malformed envelope: invalid JSON')` (**line 320**) — masking both the 400 and
the engine's own message. **What the engine expects:** the F2 envelope, i.e.
`{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"query":"…"}}` (verified: that
form returns a normal `RagResult`). The host spec that pins the wrong shape is
`docs/specs/unit-gn-engine-integration.md:454` — `ragQuery: '/rag/query', // POST — body { query, ...opts }`.

## 2. Raw evidence

### 2.1 POST `/rag/query` — `mode` is IGNORED (byte-identical across 9 mode spellings)

Body (the envelope form, which the engine accepts):
`{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"query":"enrichment graph node","mode":"<M>","topK":3}}`

```
mode=flat    sha256=da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
mode=Flat    sha256=da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
mode=vector  sha256=da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
mode=Vector  sha256=da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
mode=graph   sha256=da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
mode=Graph   sha256=da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
mode=hybrid  sha256=da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
mode=Hybrid  sha256=da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
mode=bogus   sha256=da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
```
(Even an *invalid* mode is accepted silently — no 400/422.)

### 2.2 POST `/rag/query` — `topK` is IGNORED (same sha for every topK)

```
topK=1  sha256=da99c04c…bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
topK=3  sha256=da99c04c…bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
topK=5  sha256=da99c04c…bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
topK=10 sha256=da99c04c…bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
topK=50 sha256=da99c04c…bb38 bytes=842 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}} n=4
```

Full 842-byte POST response (the reference payload; `mode=flat, topK=3`):
```json
{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"query":"enrichment graph node","results":[{"document_id":"doc-1","node_id":"n1","score":1.743411193296898,"snippet":"Enrichment graph node: ollama embeddinggemma vector leg.","source":"Local","parent":null,"stale":null},{"document_id":"doc-1","node_id":"n2","score":0.6793932884946787,"snippet":"Community summary probe for the graph leg.","source":"Local","parent":null,"stale":null},{"document_id":"doc-1","node_id":"head","score":0.1575293146728665,"snippet":"Enrichment Doc","source":"Local","parent":null,"stale":null},{"document_id":"doc-1","node_id":"end","score":0.13750440179072249,"snippet":"","source":"Local","parent":null,"stale":null}],"engine":"gnosis","citations":[],"trace":{"Flat":{"mode":"Flat","engine":"gnosis","top_k":10,"source":"Local"}},"blocked_by":null}}
```

### 2.3 POST `/rag/query` with the APP's exact body (no envelope) → 400

```
$ curl -i -X POST http://127.0.0.1:8080/rag/query -H 'content-type: application/json' \
    -d '{"query":"enrichment graph node","mode":"flat","topK":3}'
HTTP/1.1 400 Bad Request
content-type: text/plain; charset=utf-8
content-length: 21
date: Wed, 16 Sep 2026 05:08:42 GMT

request decode failed
```

### 2.4 GET `/rag/stream` — `mode` IS honoured (full SSE frames)

```
--- mode=flat
event: result
data: {"type":"result","result":{"query":"enrichment graph node","results":[{"document_id":"doc-1","node_id":"n1","score":1.743411193296898,"snippet":"Enrichment graph node: ollama embeddinggemma vector leg.","source":"Local","parent":null,"stale":null},{"document_id":"doc-1","node_id":"n2","score":0.6793932884946787,"snippet":"Community summary probe for the graph leg.","source":"Local","parent":null,"stale":null},{"document_id":"doc-1","node_id":"head","score":0.1575293146728665,"snippet":"Enrichment Doc","source":"Local","parent":null,"stale":null}],"engine":"gnosis","citations":[],"trace":{"Flat":{"mode":"Flat","engine":"gnosis","top_k":3,"source":"Local"}},"blocked_by":null}}
event: done
data: {"type":"done"}

--- mode=vector
event: error
data: {"type":"error","code":"vector_index_unavailable","message":"vector index is not built"}
event: done
data: {"type":"done"}

--- mode=graph
event: result
data: {"type":"result","result":{"query":"enrichment graph node","results":[],"engine":"gnosis","citations":[],"trace":{"Graph":[]},"blocked_by":null}}
event: done
data: {"type":"done"}

--- mode=hybrid
event: result
data: {"type":"result","result":{"query":"enrichment graph node","results":[{"document_id":"doc-1","node_id":"n1","score":1.743411193296898,"snippet":"Enrichment graph node: ollama embeddinggemma vector leg.","source":"Local","parent":null,"stale":null},{"document_id":"doc-1","node_id":"n2","score":0.6793932884946787,"snippet":"Community summary probe for the graph leg.","source":"Local","parent":null,"stale":null},{"document_id":"doc-1","node_id":"head","score":0.1575293146728665,"snippet":"Enrichment Doc","source":"Local","parent":null,"stale":null}],"engine":"gnosis","citations":[],"trace":{"Hybrid":{"mode":"Hybrid","engine":"gnosis","legs":["graph","vector","lexical"],"top_k":3,"source":"Local"}},"blocked_by":null}}
event: done
data: {"type":"done"}

--- mode=bogus (an UNKNOWN mode silently degrades to Flat)
event: result
data: {"type":"result","result":{"query":"enrichment graph node","results":[…3 results…],"engine":"gnosis","citations":[],"trace":{"Flat":{"mode":"Flat","engine":"gnosis","top_k":3,"source":"Local"}},"blocked_by":null}}
event: done
data: {"type":"done"}
```

### 2.5 GET `/rag/stream` — `topK` IS honoured

```
topK=1  -> n_results=1 top_k=1 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 1, "source": "Local"}}
topK=2  -> n_results=2 top_k=2 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 2, "source": "Local"}}
topK=3  -> n_results=3 top_k=3 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 3, "source": "Local"}}
topK=5  -> n_results=4 top_k=5 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 5, "source": "Local"}}
topK=10 -> n_results=4 top_k=10 trace={"Flat": {"mode": "Flat", "engine": "gnosis", "top_k": 10, "source": "Local"}}
```
(`n_results` is capped by the 4 nodes in `doc-1`; `top_k` echoes the request exactly.)

### 2.6 GET `/rag/stream` `mode=graph` — the Graph trace is EMPTY for every query

```
q='enrichment graph node'  -> trace {"Graph":[]} results []
q='Community summary probe'-> trace {"Graph":[]} results []
q='graph leg'              -> trace {"Graph":[]} results []
q='vector leg'             -> trace {"Graph":[]} results []
q='Enrichment Doc'         -> trace {"Graph":[]} results []
```

### 2.7 ollama + live engine state

```
$ GET /api/tags  (relevant rows)
embeddinggemma:latest  family=gemma3  params=307.58M  embedding_length=768
gemma4:e4b-it-q8_0     family=gemma4  params=8.0B     embedding_length=2560

$ POST /api/embed {"model":"embeddinggemma","input":"Enrichment graph node: ollama embeddinggemma vector leg."}
dims=768 first5=[-0.08073, -0.00589, -0.03651, 0.04385, -0.01105]

$ POST /api/generate {"model":"gemma4:e4b-it-q8_0","prompt":"Reply with exactly: ENRICHMENT-OK","stream":false,"options":{"num_predict":64}}
model=gemma4:e4b-it-q8_0 response='ENRICHMENT-OK' done=True eval_count=6
   (a first call with num_predict=8 returned response='' — the 8-token budget was consumed before any output)

$ GET /engine/status
{"schemaVersion":1,"idFormat":"opaque-string-v1","state":"Ready","version":"0.1.0","subsystems":{"store":true,"graph":true,"lexical":true,"vector":true,"embedding":true,"reranker":true},"lastError":null}

$ POST /wikis  {"method":"listWikis"}
{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"method":"listWikis","result":[{"wiki_id":"wiki-0","name":"Live Enrichment Probe"}]}}

$ POST /documents {"method":"listDocuments","args":{"wikiId":"wiki-0","body":{}}}
{"schemaVersion":1,"idFormat":"opaque-string-v1","payload":{"method":"listDocuments","result":{"items":[{"document_id":"doc-1","wiki_id":"wiki-0","title":"Enrichment Doc","state":"Draft","revision":1,"updated_at":"2026-09-16T04:49:30.626015039Z"}],"total":1,"page":1,"page_size":20}}}

$ GET /documents/doc-1  {"method":"getDocument"}
{…"graph":{"nodes":[{"document_id":"doc-1","node_id":"head","kind":"Content","value":"Enrichment Doc","fact_key":null,"target":null},{"document_id":"doc-1","node_id":"n1","kind":"Content","value":"Enrichment graph node: ollama embeddinggemma vector leg.","fact_key":null,"target":null},{"document_id":"doc-1","node_id":"n2","kind":"Content","value":"Community summary probe for the graph leg.","fact_key":null,"target":null},{"document_id":"doc-1","node_id":"end","kind":"Content","value":"","fact_key":null,"target":null}],
"edges":[{"source":["doc-1","head"],"target":["doc-1","doc-1"],"kind":"DocHead",…},{"source":["doc-1","head"],"target":["doc-1","n1"],"kind":"NextSection",…},{"source":["doc-1","n1"],"target":["doc-1","n2"],"kind":"NextSection",…},{"source":["doc-1","n2"],"target":["doc-1","doc-1"],"kind":"DocEnd",…}]},…"tags":["probe"],"author":"gate"}
```

### 2.8 The graph / traversal / community / enrichment legs have NO engine endpoints

```
POST /graph/nodes              -> HTTP 404
POST /graph/edges              -> HTTP 404
POST /traversal                -> HTTP 404
POST /community                -> HTTP 404
POST /community/context        -> HTTP 404
POST /facts                    -> HTTP 404
POST /consistency              -> HTTP 404
POST /enrichment               -> HTTP 404
POST /documents/doc-1/graph    -> HTTP 404
```
The live `gnosis-server` route table is exactly 14 rows (`GET /engine/status`,
`POST /rag/query`, `GET /rag/stream` SSE + the 11 document/wiki CRUD paths,
`../Gnosis/src/bin/gnosis_server.rs:236-246`). The traversal / community /
enrichment / fact / consistency legs are **not implemented anywhere** (engine or
host) — see §4.

## findings

Each finding is classified **host-app** vs **gnosis-engine** vs **harness**, with
severity and the precise repro.

### F-1 — `GNOSIS-SIDEBAR-SEAM-MISSING` (HOST-APP, **HIGH** — new; live-confirmed)
**Symptom.** Every control in the `gnosis-wikis` and `gnosis-documents` panes is a
**silent no-op** for a real user: Refresh wikis/documents, wiki select, document select,
and (transitively) all six document verbs. A real hit-tested click is delivered to the
control, the compiled handler RUNS, and nothing happens — no engine wire call, no pane
update, no error.
**Repro (live, deterministic).**
1. `node scripts/live-drive.mjs --connect --port=3790 --cdp-port=9225 --no-seed --block=gnosis_wikis,gnosis_documents`
2. Observe: `li[data-wiki-id="wiki-0"]` paints (boot state), then a real click on it →
   app-graph assembly signature unchanged (`reassembled=false`), `"Wiki: …"` never renders.
3. Attribution: `provident.dispatch {target:{kind:'nodeId',nodeId:'node-61523'},event:'click'}`
   → `handlers=[{"name":"gnosis-wikis-select","event":"click"}]`, `results=[null]`, pane
   unchanged; and `window.provident.gnosis.documents('gnosis.document.list',{wikiId:'wiki-0'})`
   resolves from the live engine while the pane still renders `"No documents — select a wiki"`.
**Root cause (precise).** `src/renderer/sidebar-panes.ts` → `SidebarPanes.installSidebarBridge()`
(~line 2806-2882) registers `gnosisStatus` and `gnosisQuery` (delegating to `this.gnosis`)
but **omits `gnosisDocuments` / `gnosisWikis`**. The preload's `SidebarMethods` holder
initializes those two as **no-op defaults** — `src/main/preload.ts:307-308`
(`gnosisDocuments: () => {}`, `gnosisWikis: () => {}`) — and the exposed proxy delegates to
the holder (`src/main/preload.ts:617-618`:
`gnosisDocuments: (tool, args) => sidebarHolder.gnosisDocuments?.(tool, args)`). So the
`window.provident.sidebar.gnosisWikis(...)` / `gnosisDocuments(...)` calls inside **all 11
handler bodies of `src/renderer/gnosis-crud-panes.ts`** (lines 104-168) hit the no-op. The
boot-time list renders only because `GnosisCrudPanes.boot()` → `refreshWikis()` calls the
host method directly via `this.bridge.gnosis.documents(...)` — never through `sidebar`.
`SidebarPanes` also has **no delegate** to `GnosisCrudPanes` (renderer.ts passes
`gnosis: { status, query }` only), so the seam has no path at all.
**Why the gates missed it.** The module greens feed both `wikis` and `documents` straight
to the pure helpers; the pane tests assert *authored* control data; and the
`AD-2026-09-14-2` parity guard is **one-directional** (it verifies every *registered*
holder method exists on the preload proxy, never that every *preload* method is registered)
— so a forgotten seam stays silently inert. This is exactly the RCA-12 layer miss
(envelope-green, app-broken).
**Proposed fix shape (host).** Register `gnosisDocuments`/`gnosisWikis` in
`installSidebarBridge()` delegating to a new `gnosisCrud` delegate (mirroring the existing
`gnosis: {status, query}` delegate wired in `renderer.ts`), **and** extend the parity guard
to the reverse direction (every preload `SidebarMethods` key must be registered by the
holder, else fail loud at boot).

### F-2 — `HOST-ENGINE-QUERY-POST-NO-ENVELOPE` (HOST-APP + spec drift, **HIGH**)
**Symptom.** `gnosis.query` (and therefore the `gnosis-query` pane's Submit) can never
return results; it fails with `malformed envelope: invalid JSON`. Live consequence:
**UF-GNOSIS-3 FAIL** — the pane renders `"(no engine results)"` for a query the engine
answers with 4 results on the GET path.
**Repro.**
1. `curl -s -X POST http://127.0.0.1:8080/rag/query -H 'content-type: application/json' -d '{"query":"enrichment graph node","mode":"flat","topK":3}'`
   → `HTTP 400`, `text/plain`, body `request decode failed` (21 bytes).
2. MCP: `gnosis.query {"query":"enrichment graph node"}` → `malformed envelope: invalid JSON`.
3. Contrast: `gnosis.stream {"query":"enrichment graph node"}` → 4 real results (GET path).
4. Envelope form on POST returns a normal `RagResult` (§2.1) — the engine is fine with the
   envelope; the host just does not send one.
**Attribution.** `src/main/engine-rag-store.ts`, `ragQuery` closure of
`createEngineRagStore` (**line 920**: `body: JSON.stringify({ query, ...opts })` — no
`schemaVersion`/`idFormat`/`payload`). Engine side: `../Gnosis/src/bin/gnosis_server.rs:157`
`let env = match Envelope::from_json(&body)` → `DecodeError::InvalidEnvelope` →
`decode_error_response` → **400 `"request decode failed"`**. Host decoding:
`src/main/engine-rag-store.ts:320` `JSON.parse(json)` → `EngineError('malformed envelope: invalid JSON')`.
**Doc drift in the same finding.** `docs/specs/unit-gn-engine-integration.md:454` pins
`ragQuery: '/rag/query', // POST — body { query, ...opts }` — the F2 wire contract never
froze a request body shape (it froze the response codecs + `Envelope`), so the host spec
invented a body the P2 server rejects. The spec line must be re-derived to the envelope
form (mirroring the P1a CRUD request envelope the CRUD client already sends correctly).
**Proposed fix shape (host).** Send `{schemaVersion:1, idFormat:'opaque-string-v1', payload:{query, ...opts}}`
from `ragQuery`; pin it in `unit-gn-engine-integration.md` §ENGINE_ENDPOINTS; add a
transport-level regression test against a real envelope-validating stub.

### F-3 — `HOST-ENGINE-ERROR-MASKING` (HOST-APP, **MEDIUM**)
**Symptom.** A deterministic engine-side client error (HTTP 400/422 `text/plain
"request decode failed"`) is reported to the agent/user as
`malformed envelope: invalid JSON` — an *envelope-shape* error that hides the real cause;
the HTTP status is never inspected (`res.ok`/`res.status` unused) and the engine's own
message is discarded.
**Repro.** Any `gnosis.query` call (§2.3) — the observed message never mentions the 400 or
`request decode failed`.
**Root cause.** `src/main/engine-rag-store.ts` `decodeEnvelope` (line 318-322) parses the
body without consulting `res.status`/`content-type`; `ragQuery` likewise only reads the
body (`const text = await res.clone().text()`).
**Proposed fix shape.** Check `res.ok` first and surface an `EngineWireError` carrying the
status + a truncated body; keep `malformed envelope` strictly for a 2xx body that is not an
envelope. (Related open row in `docs/defects.md`: none — `HOST-ENGINE-QUERY-MODE-IGNORED`
**does not exist**; per instructions, nothing was created.)

### F-4 — `ENGINE-POST-IGNORES-MODE-TOPK` (GNOSIS-ENGINE, **HIGH** — **CONFIRMED**)
**Confirmed, not refuted.** `POST /rag/query` ignores **every** retrieval option (`mode`,
`topK`, and by the same code path `maxHops`/`expand`/`maxParentContext`/`filters`).
Evidence: 9 mode spellings + 5 `topK` values all return the **same 842 bytes**
(`sha256 da99c04c6948e1f957d93b9bb64858020d57cf89acdb05f69209bc94bc42bb38`), `trace` always
`{"Flat":{"mode":"Flat","engine":"gnosis","top_k":10,"source":"Local"}}`, 4 results. The
`GET /rag/stream` path DOES honour `mode` (`vector` → a real `vector_index_unavailable` SSE
error frame; `graph` → a `Graph` trace; `hybrid` → `Hybrid` legs) **and** `topK`
(`top_k` echo + result-count cap).
**Root cause (exact).** `../Gnosis/src/bin/gnosis_server.rs:168` —
`store.rag_query(&query, &RagQueryOptions::default()).await`, i.e. the handler extracts only
`env.payload.query` (lines 162-167) and passes a **default options struct**
(`RagQueryOptions { top_k: None, mode: None, … }` → engine defaults `top_k=10`, mode `flat`,
`../Gnosis/src/store/mod.rs:4069` `options.top_k.unwrap_or(10)`). The SSE handler by
contrast parses `topK`/`mode` from the query string (lines 191-201).
**Proposed fix shape (engine).** Parse `payload.mode`/`payload.topK` (and the other
`RagQueryOptions` fields) in `rag_query_handler` with the SAME parser the SSE handler uses
(share one `RagQueryOptions` decoder); reject an unknown `mode` with a 400/422 instead of
silently degrading to Flat.

### F-5 — `ENGINE-VECTOR-INDEX-NOT-BUILT + NO-ENRICHMENT-ROUTES` (GNOSIS-ENGINE, **MEDIUM**; the "enrichment legs" scope gap)
**Symptom.** `/engine/status` advertises `vector:true embedding:true` and ollama serves
768-dim `embeddinggemma`, yet `GET /rag/stream?mode=vector` returns the SSE error
`{"code":"vector_index_unavailable","message":"vector index is not built"}` — the vector
leg cannot be exercised at all. The doc's n1 text is literally the vector-leg probe
("Enrichment graph node: ollama embeddinggemma vector leg.") and it is still served by the
**lexical** leg (`source:"Local"`, `trace.Flat`). `mode=graph` returns `trace:{"Graph":[]}`
with 0 results for every query (plausibly legitimate given `doc-1`'s edges are only
`DocHead`/`NextSection`/`DocEnd` — no `Link`/`Embed` edges — but the graph leg therefore
delivers no enrichment either).
**Scope gap (the battery's "graph/enrichment" legs).** There is **no engine endpoint** for
traversal/community/enrichment/facts/consistency (9 probed paths → 404, §2.8); the live route
table is the fixed 14. On the host side these are the deferred A3/A4/A5 units the roadmap
explicitly records as **non-gates** (`docs/specs/unblock-gnosis-remaining-endpoints.md`
§6.3-§6.5, P1b-P1e). So the graph/traversal/community/enrichment legs have **no live surface
to verify** — recorded in §4 as a pending battery, not a behavior FAIL.
**Proposed fix shape (engine).** Wire a vector-index build/`reSyncEmbed` path so the READY
`vector` subsystem is truthful, or report `vector:false` until the index exists (the
`Ready` + `vector:true` claim is currently misleading). Keep the enrichment routes a
follow-on (they need P1b-P1e).

### F-6 — `UF-PARITY-6-STREAMS-PARKED-CLAIM-STALE` (DOC/TRACKER DRIFT, **LOW**)
`docs/specs/user-flow-audit-checklist.md` §12 UF-PARITY-6 records "streams PARKED".
Live, `gnosis.stream` **works**: `{chunks:[{type:'result',result:{…4 results…}},{type:'done'}]}`
(and its `mode=vector` → a real `vector_index_unavailable` error chunk, `mode=graph` → a
Graph trace). Only the *UI* stream surface is absent (no stream pane), which is a different
claim. The row should read "engine stream MCP tool WORKS; no UI stream surface".

### F-7 — harness notes (HARNESS, informational)
1. **Pane-visibility side-effect**: testing UF-GNOSIS-1/2/6 required enabling
   `gnosis-wikis`/`gnosis-documents`/`gnosis-query` in the running operator store (persisted).
   All the other rows (and the F-2/F-4 evidence) are independent of it.
2. **`--connect` re-seeds** `.live-corpus` unless `--no-seed`; the battery used `--no-seed`
   to avoid disturbing the running app's store.
3. **No renderer bridge counter is possible**: `window.provident` is non-writable /
   non-configurable and `window.provident.sidebar` is frozen, so the bridge-invocation
   probe used in an earlier draft cannot work (recorded here instead of being silently
   dropped). The battery therefore uses a **control-sampled app-graph re-assembly
   signature** (root/pane `data-node-id`) as the causal delta of a control click, and only
   ever alongside a painted-box/rendered-content oracle.
4. **No operator-pane value delta is observable** for UF-GNOSIS-4's refresh: the engine's
   `HealthReport` is invariant while the engine stays `Ready`, so the refresh is proven by
   the causal re-assembly delta + the repaint, not by a changing value. A stronger oracle
   needs a second engine state (degrade/stop the engine) — out of scope for an attach-only run.
5. The two new `--block` groups (`gnosis_*`) were appended to `scripts/live-drive.mjs`
   (no source/test/tracker file edited; `node --check` OK). Because the run is scoped
   (`--block=<list>`), the §6.1 matrix row-set reconciliation stays vacuous and the 8 §5.U
   matrix rows are reported as not executed — the gnosis rows are **EXTENDED** rows.

## 4. PARKED rows + the pending battery for a later live iteration

| Row | Park reason | What a later iteration must do |
| --- | --- | --- |
| **UF-GNOSIS-5** | **element-absent by design** — the docs-pane Update control is not authored (W1-Q12 / HC1: the old button submitted a fake empty graph). No drivable gesture exists. | After the real graph-edit surface (the G1 editor ↔ gnosis graph bridge, `docs/pending.md`) lands: focus `doc-1` in the editor, edit a node, real-click the Update control, and assert the engine `doc-1` graph carries the new value with `baseRevision` advanced (and that no empty-graph write occurs). |
| **UF-GNOSIS-6 mutating half** (delete/publish/unpublish/archive/create) | **precondition unmet** — **no caller has edit authority** in this instance (live: `operator` → denied, and every other `callerId` too ⇒ `loadAuthorityMapping()` returned an empty mapping, i.e. `PROVIDENT_OPERATOR_CREDENTIAL` is unset/empty on the running app); `AuthorityStore` maps only `operator`→that env credential (`src/main/main.ts:106-120`), so every mutating verb is denied **fail-closed in main before any engine wire call** (`src/main/mcp-server.ts:613-616`). (The controls are also not rendered — see F-1.) | Boot (or attach to) an app started with `PROVIDENT_OPERATOR_CREDENTIAL=<cred>` **and** with F-1 fixed: then real-click Create wiki → Create document → Publish → Unpublish → Archive → Delete and assert each against the live engine (`listWikis`/`listDocuments`/`getDocument` before/after). |
| **graph / traversal / community / enrichment legs** | **no live surface exists** — the engine route table has no `/graph`, `/traversal`, `/community`, `/enrichment`, `/facts`, `/consistency` paths (all 404, §2.8) and the host wiring (A3/A4/A5) is a deferred non-gate. | After P1b-P1e (Gnosis wire) + A3/A4/A5 (host) land: verify the 18 graph methods, the 6 fact/citation methods and the 4 consistency methods over the live app, plus `mode=graph` traversal results with real `Link`/`Embed` edges, and a vector-leg query with a BUILT index (F-5). |
| **`gnosis.stream` UI surface** | no UI stream pane is authored (MCP-only, by design); nothing to drive. | If a stream pane is ever authored, drive a real submit and assert streamed chunks render; until then only the MCP tool is verifiable (it passes). |

## 5. Cross-references

- Contract/spec: `docs/specs/unblock-gnosis-remaining-endpoints.md` (§4.1 document CRUD,
  §6.2 A2 wiring, §6.3-§6.5 deferred graph/fact/consistency), `docs/specs/unit-gn-mcp-ui-wiring.md`,
  `docs/specs/unit-a2-document-crud-wiring.md`, `docs/specs/unit-gn-engine-integration.md:454`
  (the stale request-body pin), `docs/specs/ui-overhaul.md` §4 G5/§4.11/§5.7a.
- Rows: `docs/specs/user-flow-audit-checklist.md` §10 (UF-GNOSIS-1..6), §12 (UF-PARITY-6).
- Defects: `docs/defects.md` `HOST-GUI-DOCS-PANE-DEADLOCK` (**re-verified as NOT
  reproduced** — the pane renders its wiki selector and never sits in
  `data-gnosis-state="unavailable"`) and `HOST-ENGINE-QUERY-MODE-IGNORED`
  (**absent** — not created, per instructions; its substance is F-4 with source attribution).
- Driver blocks: `scripts/live-drive.mjs` `gnosis_wikis`, `gnosis_documents`,
  `gnosis_query`, `gnosis_status`, `gnosis_doc_update`, `gnosis_crud`
  (+ helpers `gnosisPaneState`, `gnosisEnablePanes`, `gnosisAssembleSig`,
  `gnosisDispatchDiag`, `parkRow`).
