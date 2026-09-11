# Unit shell-integration — Live-Scenario Pending Battery (handoff, with the engine-side verified live)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-10.**
- **Source contract:** `docs/specs/unit-shell-integration.md` (§5.1 the shared
  `engine-transport` module surface; §5.2 the fetch-based SSE client; §5.3 the
  bind/auth/TLS policy record; §5.5 the e2e transport test / live-battery
  revisit; §5.8/§5.9 happy/fail states). **Greens set:** `unit-shell-integration-greens.md`
  — 41 scenarios (18 G + 14 F + 8 PB + 1 gated E1).
- **Greens battery (blind, docs-only, already PASS against the LIVE MODULE):**
  all 40 non-gated scenarios PASS at the module level (deterministic mock
  transport); **E1 is the one gated scenario** (`GNOSIS_ENGINE_TEST=1` + a live
  `gnosis-server` on loopback). This battery is the revisit handoff for E1 and
  the transport-surface live probes.
- **Status:** **PARTIAL-LIVE — the engine-side live surface was verified live
  this iteration; the APP-side surface (the running Astrographer Electron app +
  its MCP/UI tools + the app's Chromium-runtime GET-with-body adjudication) is
  still PARKED.** Pattern precedent: `unit-a1-crud-routing-proxy-live-pending-battery.md`,
  `unit-gn-mcp-ui-wiring-live-pending-battery.md`, `unit-a2-document-crud-wiring-live-pending-battery.md`
  (the same surface-absence park shape).

---

## 1. What was verified LIVE this iteration (the engine-side surface)

I **brought the `gnosis-server` binary up live** on loopback and drove the real
shell proxy modules (the spec-pinned `.ts` sources, bundled to `.js` with the
Astrographer repo's esbuild) against it **without an injected fetch** — i.e. the
genuine real transport. The engine-side live surface is confirmed **correct and
consistent with the spec/greens**; these scenarios no longer park:

### 1.1 The revisit-condition engine probes (all met live)

| Probe | Live result | Verdict |
| --- | --- | --- |
| `gnosis-server` binds loopback-only to `127.0.0.1:<port>` | bound to `127.0.0.1:18080` (configurable port; bind fixed to loopback) | **verified** |
| `GET /engine/status` → a `HealthReport` JSON | `{schemaVersion:1, idFormat:"opaque-string-v1", state:"Ready", version:"0.1.0", subsystems:{...6 flags}, lastError:null}` | **verified** |
| `POST /rag/query` | returns a V-5-style `RagResult` envelope (or a §11-mapped error) | **verified** |
| `GET /rag/stream` (SSE) | live `event: result` → `event: done` frames over a REAL stream | **verified** |
| The 11 document-CRUD endpoints | `POST /wikis`, `GET /wikis`, `POST /documents`, `GET /documents/:id`, `POST /documents/:id/update`, `DELETE /documents/:id`, `POST /documents/:id/publish|unpublish|archive`, `GET /documents` all respond with the frozen envelope shapes | **verified** |

### 1.2 The E1 / transport-surface scenarios that PASS live (through the REAL proxy, no injected fetch)

Re-run the driver: `.a2-staging/live-driver3.ts` (→ `live-driver3.cjs`) for the
SSE + EngineUnavailable-split probes; the POST-path CRUD assertions are in
`live-driver4.ts`/`live-driver.cjs` (the engine was restarted with
`GNOSIS_SERVER_OLLAMA_URL` wired so it reaches **Ready**, giving a real SSE
stream rather than an `error` frame).

| Scenario | Live observation | Result |
| --- | --- | --- |
| **E1** document-CRUD live round-trips over a real transport (the **Write/mutating** half) | `createWiki`→`Wiki`, `createDocument`→`Document`(Draft, rev0), `updateDocument`→rev1, `publishDocument`→Published, `unpublishDocument`→Draft, `archiveDocument`→Archived, `deleteDocument`→void. All through the real `createEngineCrudRagStore` proxy (no injected fetch → `globalThis.fetch`). | **PASS (live)** |
| **E1** real connection-refused proxy surfaces the typed `EngineUnavailable` | `createEngineCrudRagStore({ baseUrl:'http://127.0.0.1:65530' }).createWiki(...)` → throws `EngineUnavailable`, `httpStatus:503`, `cause:'connection-refused'`. | **PASS (live)** |
| **G11/G14** the SSE `ragStream` over a **live** stream (a real `createEngineRagStore` proxy, no injected fetch) | `ragStream('hello',{mode:'flat',topK:3})` iterated to two chunks: `{type:'result',...}` then `{type:'done'}`; clean end, no error, no reconnect. | **PASS (live)** |

These confirm the **retrieval-trio + SSE + the document-CRUD mutating surface**
and the **`EngineUnavailable`/`EngineError` split over a real transport** behave
as the spec §5.5 and the greens E1 pin — the engine side is NOT a defect.

---

## 2. Why the battery still parks (the live-surface assessment, verified live 2026-09-10)

The shell-integration unit's **e2e/transport scenarios require BOTH the Gnosis
engine AND the Astrographer Electron app running**. This iteration:

- **The engine IS available and was verified live** (I built/executed the
  prebuilt `target/debug/gnosis-server`; it is the P2 server, loopback-bound,
  serving the 14 REST/SSE endpoints + `/engine/status`).
- **The Astrographer Electron app is NOT running** — `ps aux | grep -iE
  'astrographer|electron'` shows only unrelated Flatpak crashpad handlers
  (Discord / OpenCode). There is **no running app**, hence **no live MCP/UI
  surface** (`gnosis`/`gnosis-edit` groups cannot be enabled in-app, and the
  app's `tools/call` / GUI panes cannot be driven).

**Conclusion:** the engine-side scenarios above (1.2) were verified live, but
the **app-MCP/UI + the app-runtime adjudication scenarios are parked** — a
**surface-absence park on the app side**, not a module regression. Per the
live-runner contract these parked scenarios are recorded here, not in the
failure list.

### 2.1 The decisive live finding this iteration (a real-transport nuance the mock couldn't catch)

**The document-CRUD **read** methods use a GET-with-a-body (the envelope-in-body
transport, `GET /documents`, `GET /documents/:id`, `GET /wikis`, `GET /wikis/:id`),
and that request is built with **`globalThis.fetch`** (the shared
`createEngineFetch` returns `globalThis.fetch` with no `tls`). Under **Node's
undici `globalThis.fetch`** (what my driver used, since no Electron app was
running), **a GET with a body is rejected: `TypeError: Request with GET/HEAD
method cannot have body`** — so `listWikis`/`getDocument`/`listDocuments`/
`getWiki` failed **at the transport layer** under Node, even though the engine
itself serves those endpoints correctly (verified by raw envelope-in-body POST-to-GET
probes that the engine answers correctly).

This does **NOT** indicate an engine or proxy defect — the engine answers the
GET-with-body correctly, and the **Electron/Chromium `fetch` (the app's actual
runtime) permits GET-with-body**. It is a **transport-RUNTIME divergence that can
only be adjudicated by the running app** (Electron), which is not available this
iteration. The deterministic greens couldn't surface this because the unit tests
run against an **injectable mock `fetch`** that happily accepts GET-with-body;
the real runtime is what differs. This is a **candidate finding / confirm-in-app
item**, NOT a live failure of the engine or the proxy logic.

---

## 3. The revisit condition (re-stated for the later run)

The park ends when **all** of the following hold:

1. The **`gnosis-server` binary** is running on loopback (`127.0.0.1:<port>`),
   serving the **14 REST/SSE endpoints** (the retrieval trio + health + the 11
   document-CRUD paths) **and `GET /engine/status`** — ideally in **`state:Ready`**
   (to exercise a REAL SSE stream, wire an embedding provider: launch with
   `GNOSIS_SERVER_OLLAMA_URL=<local Ollama>`; without it the engine reports
   `Unavailable` and `rag/query`/`rag_stream` return `EngineUnavailable`).
2. The **Astrographer Electron app is running** with the **`gnosis` and
   `gnosis-edit` groups enabled** in the shell's security settings (so both the
   read-only and mutating `gnosis.*` tools register + the GUI document/wiki panes
   render).
3. The **shell's `auth.tls` / `auth.token`** are configured for the TLS / SSE-auth
   live checks (the `createEngineFetch(auth)` TLS path and the SSE Bearer-header
   check need non-null shell auth/tls — GUI-only).

The live check that ends the park: `curl http://127.0.0.1:<port>/engine/status`
returns a `HealthReport` JSON **AND** `POST /rag/query` returns a V-5-style
envelope **AND** the document-CRUD endpoints respond **AND** the running app
exposes the `gnosis`/`gnosis-edit` MCP/UI surface.

---

## 4. The parked scenarios (for the LATER iteration, once the app runs + the GET-body runtime is adjudicated)

### 4.1 Class R1 — the document-CRUD **read** round-trips over the app's real (Electron) transport

| Greens / spec | Live probe | Expected | How to verify |
| --- | --- | --- | --- |
| **E1** | `listWikis` through the real proxy (no injected fetch) against the live engine | `Wiki[]` (a typed result) — **must not** throw the Node GET-with-body `TypeError` (Electron permits GET-with-body) | Drive `tools/call` `gnosis.wiki.list`, or the real proxy under the Electron fetch; assert a typed `Wiki[]` |
| **E1** | `getDocument` round-trip | the typed `Document` (id/state/title match the created doc) | `gnosis.document.get` after a `create` |
| **E1** | `listDocuments` round-trip | a typed `DocumentList` (`items`, `total`, `page`, `pageSize`) | `gnosis.document.list` |
| **E1** | `getWiki` round-trip | the typed `Wiki` | `gnosis.wiki.get` |

### 4.2 Class R2 — the SSE-auth / TLS live checks (need shell auth/tls configured)

| Greens / spec | Live probe | Expected | How to verify |
| --- | --- | --- | --- |
| **G11** (live) | With `auth.token` set on the app's `createSseClient`, observe the `ragStream` request | the stream request carries `Authorization: Bearer <token>` on a GET (NO `content-type`); the token never appears in the URL | Observe the live request headers at the server (or a capture proxy); assert the Bearer-on-header + no-URL-token policy |
| **P-TP-1 / §5.1 (live)** | With `auth.tls` (`{ca,cert,key}`) set, the app uses the undici-dispatcher wrapper | the fetch passes a `dispatcher` with `connect` carrying exactly the present `ca/cert/key` | Live with an https engine + custom CA/cert/key; assert the TLS handshake succeeds via the dispatcher (GUI-only) |

### 4.3 Class R3 — the app MCP/UI parity surface (the D4 surface at the shell)

| Greens / spec | Live probe | Expected |
| --- | --- | --- |
| **E1 (app surface)** | `tools/call` on the 11 `gnosis.document.*`/`gnosis.wiki.*` tools through the running app (groups `gnosis` + `gnosis-edit` enabled) | each resolves to its typed result as §5.5 / the A2 battery lists |
| **§5.3 / G17 (app-visible)** | the GUI-only carve-out is enforced at the MCP boundary | no `gnosis.*` MCP tool `inputSchema` accepts a `token`/`tls`/`ca`/`cert`/`key`/`apiKey` credential arg |
| **§5.3 policy record** | the running app honors loopback-only bind, Bearer-on-header auth, TLS-via-dispatcher | consistent with the module surface; see the A2 battery's security/group rows |

### 4.4 Class R4 — the real-transport fail-state re-verification (belt-and-suspenders)

| Spec fail-state | Live probe | Expected |
| --- | --- | --- |
| **G8/F-split (engine-not-spawned)** | a proxy against a non-spawned loopback address (e.g. `127.0.0.1:9` / an unrouted port with `ENOTFOUND`) | `EngineUnavailable` `cause:'engine-not-spawned'` |
| **F4 (§5.9)** | `fetchWithTimeout` on a request that never settles | `EngineUnavailable` `cause:'connection-refused'`, `'request timed out after <ms>ms'`; never a raw `AbortError` |
| **F7** | an SSE connection that returns non-2xx | `onError(new Error('sse: non-2xx response'))` |
| **F8** | a malformed SSE frame over a live stream | `onError(err)` (the `parseSseFrame` reject) |
| **F11/P-SM-2** | a live SSE connection dropped before `done` | the proxy's `ragStream` iterable throws `EngineUnavailable` (503, `cause:'connection-refused'`); never a silent reconnect |

---

## 5. Parked- / verified-scenario census

- **Total greens scenario rows:** 41 (18 G + 14 F + 8 PB + 1 gated E1) — the 40
  non-gated rows PASS at the module level (deterministic mock transport), per the
  greens doc.
- **Verified LIVE this iteration (engine-side, real transport, no injected fetch):**
  the SSE `ragStream` over a live stream (G11/G14 premise + the P-SM-2 stream
  path), the connection-refused `EngineUnavailable` (503, `cause:'connection-refused'`)
  split (E1), and the document-CRUD **mutating** round-trips (E1) —
  `createWiki`/`createDocument`/`updateDocument`/`publishDocument`/
  `unpublishDocument`/`archiveDocument`/`deleteDocument`. **(The engine-side
  portion of E1 is effectively verified live.)**
- **Parked for the LATER run (require the running Astrographer app + the
  GET-with-body Electron-runtime adjudication):** the document-CRUD **read**
  round-trips over the app's Electron fetch (listWikis/getDocument/
  listDocuments/getWiki — **E1 read half**), the SSE-auth + TLS live checks (the
  Bearer-on-stream + the undici-dispatcher TLS), and the app MCP/UI parity surface
  (the 11 `gnosis.*` tools + the GUI panes + the GUI-only carve-out).
- **Run live this iteration:** the engine-side transport probes above (1.2) —
  all PASS. **Not run live (parked):** the app-surface rows (4.1–4.4).
- **Not a failure:** the engine is **live and verified**; the park is a **running-app
  + app-runtime surface absence** — the Astrographer Electron app is not up this
  iteration, so its MCP/UI tools + its Chromium-fetch GET-with-body adjudication
  and its auth/tls/group configuration cannot be exercised.

---

## 6. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** the running `gnosis-server`
   (loopback, READY) **+ the running Astrographer app with `gnosis`/`gnosis-edit`
   enabled + `auth.tls`/`auth.token` configured**. Re-run the §3 live-check first;
   if the app is still not up, the battery re-parks unchanged.
2. **The GET-with-body read-round-trip is the priority open item.** The engine
   serves `GET /documents|/wikis|/<:id>` correctly (Raw-envelope probes answer
   correctly), and Node's undici fetch rejects a GET-body, so the **only** way to
   verify the read round-trips end-to-end is through the **running Electron app**
   (Chromium fetch). Confirm-in-app that `gnosis.wiki.list`/`get`/`document.list`/`get`
   resolve to typed results; if they STILL throw the GET-with-body `TypeError`
   under Electron, that is a genuine host regression to report (never a pass).
3. **Start the engine in READY for a real SSE stream:** launch
   `target/debug/gnosis-server --port <loopback-port>` **with**
   `GNOSIS_SERVER_OLLAMA_URL=<local Ollama>` (`is_available()` gate) so the engine
   reaches `state:Ready` and `rag/stream` emits real `result→done` frames. Without
   a provider the engine stays `Unavailable` and only emits the `engine_unavailable`
   error frame (itself a valid `EngineUnavailable` live observation).
4. **Driver artifacts left in sandbox for the LATER run:** `.a2-staging/live-driver3.ts`
   (SSE live-stream + connection-refused split, through the real proxy) and
   `.a2-staging/live-driver4.ts` (the document-CRUD POST-path round-trips). Rebuild
   with the Astrographer repo's `node_modules/.bin/esbuild --bundle --platform=node
   --format=cjs` and run with `node`. They are handoff scaffolding, NOT spec-scope.
5. **Constraints to honor (recorded):**
   - **Loopback bind:** the engine MUST bind to `127.0.0.1` (LOOPBACK-AUTH-TLS);
     the proxies throw at construction on a non-loopback `baseUrl`
     (`Error('engine rag store: baseUrl must be loopback')` /
     `'engine crud rag store: baseUrl must be loopback'`).
   - **GUI-only auth/TLS carve-out:** engine credentials/TLS (`auth.token`, the TLS
     `ca`/`cert`/`key`) are GUI-only at the shell, blocked from MCP access; `baseUrl`
     is NOT a credential. The SSE Bearer + the TLS-dispatcher checks are app-side.
   - **`gnosis`/`gnosis-edit` groups:** the mutating document/wiki tools register
     ONLY with `gnosis-edit` enabled (default-off); the read-only tools with
     `gnosis`. Enable both in-app before driving the tools.
   - **Envelope-in-body transport:** the request envelope is the JSON **request
     body** for ALL methods (POST/GET/DELETE), including the GET read methods —
     the read half is what requires the Chromium/Electron fetch.
   - **SSE no-reconnect (H10):** a premature close before `done` is terminal →
     `EngineUnavailable`, never a silent reconnect.
6. **MCP/UI parity:** once the app runs, drive the SAME scenarios through
   `tools/call` on the 11 `gnosis.*` tools + the GUI document/wiki panes for full
   D4 parity (the A2 battery §3.7 covers the pane-level asserts).
7. **A live result that CONTRADICTS the greens or the spec is a finding** (a real
   regression or doc drift) — never a pass. In particular: if the app-side read
   round-trips reproduce the GET-with-body `TypeError` under Electron, report it.
   Byte-pinned messages apply (the `assertLoopback` messages, the `EngineUnavailable`
   `cause`/`httpStatus`, the `sse: non-2xx response` string, `request timed out
   after <ms>ms`).
8. **Doc-staleness:** before running, reconcile this battery against the actual
   repo/build state (spec section numbers, the live tool list — new `gnosis.*` tools
   may have landed) and the trackers (`docs/next-steps.md`, `docs/pending.md`).

---
