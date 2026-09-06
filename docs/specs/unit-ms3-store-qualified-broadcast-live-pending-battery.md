# Unit MS3 — Store-Qualified Broadcast + Snapshot `store` + the Host Re-Derive Guard: LIVE-Scenario Pending Battery (handoff)

- **Author:** Live-scenario runner (delegated subagent). **Date: 2026-09-05**
  (verified live ~23:55–24:05 UTC).
- **Source contract:** `docs/specs/unit-ms3-store-qualified-broadcast.md` —
  §5.1 (the ONE collapsed `RagStoreChangedPayload` + the REQUIRED `store` +
  the two compat re-exports), §5.2 (`RagSnapshotPayload.store`), §5.3 (the four
  emission sites + the SEVEN `handleEditTool` construction points + the S3
  legacy `''` sentinel + the two `Omit<…,'store'>` derive helpers), §5.3a (the
  main.ts-side state-expression map — NODE-TESTED vs TYPECHECK-LEVEL vs
  **RELEGATED**), §5.4 (the renderer host `lastStore` capture + the
  foreign-store drop guard + the R3 capture-before-subscribe ordering + the
  W1–W4 race windows), §5.5 (the A4 zero-config byte-equality rows), §5.6 (the
  broadcast-count invariants), §3a-§3b (the adversarial record F-MS3-1..F-MS3-6
  — the F-MS3-1 warn diagnostic is renderer-internal).
- **Greens battery (blind-test, already run against the live MODULES):**
  `docs/specs/unit-ms3-store-qualified-broadcast-greens.md` — 27 scenario rows
  (23 executable S01–S52 + 4 RELEGATED R01–R04): **23 PASS / 0 FAIL / 4
  RELEGATED** (the recorded run: 23/23 vitest tests, exit 0; `npm run
  typecheck` exit 0). The four RELEGATED host states (`sidebar-panes.ts` §5.4)
  were ALREADY routed to this battery by the greens (§B R01–R04) — this
  document is that routing's destination.
- **Status:** **PARKED — NOT run against the live application.** Pattern
  precedent: `docs/specs/unit-ms4-id-prefixing-live-pending-battery.md` and
  `docs/specs/unit-ms2-store-wiring-live-pending-battery.md` (read first — the
  sibling batteries; they share the operator-restart revisit condition). This
  unit's park is NOT an app-down park and NOT a stale-build park: **the app IS
  up**, serving the POST-multi-store build, and the renderer IS loaded — the
  park is a **surface-absence park**: U-MS3's observable surface is the
  RENDERER/UI path, which the MCP agent surface cannot drive cleanly from this
  read-only, non-mutating session against the real userData.

---

## 1. Why this battery is parked (the live-surface assessment, verified live 2026-09-05 ~23:55–24:05 UTC)

### 1.1 The app IS up and serving the post-multi-store build (verified live)

- `POST http://127.0.0.1:3787/mcp` `initialize` **succeeded**: serverInfo
  `provident-electron` v0.1.0, protocolVersion 2025-03-26, tools/resources
  `listChanged` — the MCP endpoint is alive and responsive (the task's probe
  step 1 confirms the app is up).
- `tools/list` returned **39 tools**. Parsing every `inputSchema`, **all 12
  rag/edit tools carry the `store` property** (`type:'string'`, not required):
  `rag.query` `['query','topK','store']`, `rag.get_document`
  `['documentId','store']`, `rag.list_nodes` `['store']`, `rag.get_edges`
  `['nodeId','store']`, `rag.backlinks` `['nodeId','store']`,
  `edit.set_content` `['nodeId','content','store']`, `edit.create_node`
  `['type','content','parentId','props','store']`, `edit.delete_node`
  `['nodeId','store']`, `edit.split_node` `['nodeId','at','store']`,
  `edit.merge_node` `['sourceId','targetId','store']`, `edit.set_edge`
  `['kind','source','target','edgeId','order','documentIds','store']`,
  `edit.import_markdown` `['files','store']`. This is the U-MS2/U-MS4 build
  surface — the multi-store wiring is LIVE, not stale (a plain `initialize` +
  `tools/list` census is the revisit gate that the U-MS1/U-MS2/U-MS4 batteries
  await; it is met here).
- **The renderer is loaded and the app-graph pane IS MCP-visible via
  `provident.get_rendered_html`** (read-only probe, no mutation): the reply's
  `renderedHtml` is ~282 KB, `zone:main` is present, and it carries
  `data-rag-node-id="astrographer-review:…"` nodes (the host-rendered default-
  store RAG content). This **establishes the re-derive observable surface**: a
  store edit drives the renderer host's re-derive, and the re-derived pane's
  HTML is readable through `get_rendered_html`. So the re-derive observable is
  NOT permanently unobservable — it is live-observable **only through the
  renderer's rendered HTML**, i.e. the UI path, not the MCP agent surface that
  would report an edit tool result.

### 1.2 U-MS3's observable surface is overwhelmingly renderer/IPC-side — NOT MCP-probeable

Per the supervisor directive's probe map and the spec §5.3a, U-MS3's surfaces map out as:

| U-MS3 surface | Agent-facing (MCP tool) | Where it lives / how observable |
| --- | --- | --- |
| (a) the broadcast `store` stamp | **NOT** — the `rag-store-changed` payload goes main→renderer over IPC | `src/main/main.ts` sites 1–3 (§5.3a RELEGATED) + `mcp-server.ts` site 4's seven construction points. An MCP caller receives the **edit RESULT**, never the broadcast payload; the payload is delivered to the renderer, not back to the caller. The emitted `store` value is not MCP-observable. |
| (b) the snapshot `store` field | **NOT** — `rag-snapshot` is an IPC main→renderer reply (single producer, `main.ts:377-380`), not an MCP tool | §5.2/§5.7 happy-7 (§5.3a RELEGATED). No `rag.snapshot` MCP tool exists. Its indirect observable is the renderer booting on / re-rendering the default store (`store:'main'` captured into `lastStore`), visible only as the rendered HTML. |
| (c) the host re-derive guard | **NOT** — renderer-internal (`sidebar-panes.ts` §5.4) | `lastStore` capture (boot + re-derive), the foreign-store drop, the malformed/`null` fail-closed drops + the F-MS3-1 `console.warn`, the R3 capture-before-subscribe ordering, the W1–W4 windows, the §5.5 row-5 byte-equal re-derive. All renderer-internal or renderer-console. |
| (d) the ONE genuinely MCP-visible row: S52 — `edit.*` tool RESULTS carry no `store` | **YES** — observable from the `tools/call` result JSON | But exercising it requires a MUTATING MCP `edit.*` against the real 62 MB userData store (§1.4) — forbidden this iteration (sibling-battery discipline). |
| (e) the re-derive observable (the task's noted indirect probe) | indirect — via `provident.get_rendered_html` | Requires a UI/operator edit through the running app driving a re-derive, read back as the rendered HTML updating. This is the UI/DOM path, not the MCP tool-result surface. |

### 1.3 The zero-config runtime makes the foreign-store specifics UNLIVE without a restart

The running app's real userData (`/home/ryanr/.config/provident-electron/`)
has **NO `provident-rag-stores.json`** — it is the **zero-config implicit
registry with ONE store `'main'`** (`provident-rag.json`, 62 MB;
`provident-vector-cache.json`, 128 MB). Consequences for the U-MS3 specifics:

- **The foreign-store drop probe is not runnable.** An MCP `edit.set_content`
  with `store:'research-2026-09'` would fail with `unknown store
  'research-2026-09'` (U-MS2's M2) — no second store is registered to even
  reach the broadcast. Exercising the B5 foreign-store drop live requires a
  multi-store registry in a TEST userData + a boot (a restart, out of scope for
  this run; the do-not-start constraint).
- **The F-MS3-1 warn diagnostic `console.warn` is renderer-console output**, not
  MCP-visible and not capturable from this session (the running instance was
  launched elsewhere; renderer console is private to the app). It is
  permanently internal for any MCP-based battery; it stays covered by the
  repo's host unit tests + the module greens.
- **Zero-config byte-equality (§5.5 row 5):** with a single `'main'` store,
  every broadcast is `'main'` === `lastStore 'main'` ⇒ the guard passes exactly
  as pre-U-MS3, so the drop is UNREACHABLE zero-config — which is precisely why
  the §5.5 row-5 behavior is byte-equal and why it is not separately
  live-exercisable in this zero-config runtime.

### 1.4 A mutating MCP `edit.*` against the real userData is out of bounds

The only fully MCP-visible U-MS3 row (S52 — edit RESULTS carry no `store`) and
the re-derive probe (e) both require a **mutating `edit.*`** against the
RUNNING app, which boots against the real 62 MB `provident-rag.json`. The
sibling batteries' mandatory discipline is: **"mutating `edit.*` probes ONLY
against the isolated userData; the real `provident-rag.json` must never be
written by a battery."** This session is MCP-only + do-not-restart; there is no
isolated userData available without a restart. No mutation was performed.

**Conclusion:** U-MS3's observable surface is the RENDERER/UI path (the app's
rendered HTML via `provident.get_rendered_html` re-deriving on a store edit),
plus renderer-host states that are internally observable only with renderer
console access and/or a multi-store registry. It requires a **UI-interactive
session or an operator-initiated edit on the running app** — not something this
read-only, non-mutating, zero-config MCP-only run provides. Per the live-runner
contract these scenarios are **parked** (not failures) and recorded here. The
greens' 23 module-level scenarios are already 23/23 against the live modules;
the 4 RELEGATED host states were routed here by the greens by construction.

---

## 2. The live surfaces that WILL exercise the U-MS3 behavior (after the revisit condition)

| Live surface | U-MS3 behavior it exposes | How to drive it live |
| --- | --- | --- |
| `provident.get_rendered_html` (`renderedHtml`/`markdown` of the app-graph pane) | THE re-derive observable: a store edit that passes the host guard re-renders the default-store pane; a foreign-store edit that the guard drops does NOT | Read the rendered HTML, capture a signature of the app-graph pane, drive an edit, re-read, diff |
| An operator-initiated **UI** edit (commit-on-blur / batch / rich commit through the app's own UI) | §5.5 row 1 + row 5 — sites 1–3 (R01) broadcast `{…, store:'main'}`; the guard passes; the rendered pane re-derives byte-equal to today | An operator performs a UI edit in the running app's renderer; this runner reads the pane before/after via `get_rendered_html` |
| An MCP `edit.*` call whose store == the host's rendered store (`'main'` zero-config) | The MCP path (site 4) broadcasts `{…, store:'main'}`; the guard passes; the pane re-derives (the §5.5 row-5 byte-equal path) | `tools/call edit.create_node {type:'p', content:'<token>'}` (store omitted ⇒ default `'main'`), then `get_rendered_html` and diff the pane for the `<token>` |
| A MULTI-STORE registry (TEST userData) + an MCP `edit.*` on a NON-default store | **The B5 foreign-store drop (R03):** the foreign-store edit's broadcast is DROPPED host-side ⇒ NO re-derive of the default pane; the F-MS3-1-malformed / null-lastStore branches (renderer console) | Restart against a TEST userData with a 2-store registry (`main` + e.g. `research-2026-09`); edit into the non-default store; the default pane's rendered HTML is byte-identical after the edit |
| Renderer console access (a UI-interactive/manually-supervised session) | The F-MS3-1 warn distinct messages (malformed-store vs null-lastStore) | Drive a malformed/uncaptured broadcast (e.g. a direct bridge call in a dev session); capture the `console.warn` line |
| `rag-snapshot` (main→renderer IPC reply) | §5.2/R02 — the snapshot carries `store:'main'`; the host captures it into `lastStore` | Only observable via the renderer's behavior (it renders the default store, the guard passes); no MCP `rag.snapshot` tool exists |

**Prerequisites for the later run (MANDATORY — inherited from the U-MS2/U-MS4
batteries):**

1. An **operator-initiated edit** on the running app (the revisit condition) OR
   a **UI-interactive session** with renderer console access. The re-derive
   observable requires a real edit to drive the guard.
2. An **ISOLATED test userData** for any MUTATING MCP `edit.*` probe
   (`HOME=$(mktemp -d) npm start > boot.log 2>&1`); NEVER the real
   `/home/ryanr/.config/provident-electron/` (its 62 MB `provident-rag.json`
   and 128 MB `provident-vector-cache.json` must never be written by a
   battery). For the foreign-store cases, plant a registry at
   `$T/.config/provident-electron/provident-rag-stores.json` BEFORE boot.
3. The MCP server reachable (default port 3787) for the edit + `get_rendered_html`
   probes.
4. For S52 (the edit-RESULT-no-store row) against the real running app:
   **do NOT** — it mutates the real store. Use the isolated userData instead.

**The MCP probe verbs (stateless HTTP — no session handshake required):**

```bash
curl -sS -X POST http://127.0.0.1:3787/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"edit.create_node","arguments":{"type":"p","content":"<token>"}}}'
# → the edit RESULT (assert: carries NO "store" key — S52)

curl -sS -X POST http://127.0.0.1:3787/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"provident.get_rendered_html","arguments":{}}}'
# → the rendered app-graph pane (re-derive observable): capture a signature
#   (the `<token>` presence / the data-rag-node-id census), diff before/after the edit.
```

---

## 3. The concrete live probes to run once the revisit condition is met

The "expected" column re-expresses the greens/spec expectation as a live
observable. A live result that CONTRADICTS the greens or the spec is a finding
(a real regression or a doc/spec drift) — never a pass.

### P0 — the renderer/UI-path gates (must fire before any class below)

| Step | Expected after the revisit condition |
| --- | --- |
| `tools/list` — the 12 rag/edit schemas carry `store` | ALL 12 do (re-confirm the multi-store surface is live; a `store` argument accepted ⇒ the build is the post-MS-series bundle) |
| `provident.get_rendered_html` — a `zone:main` pane with `data-rag-node-id` content | The default-store app-graph pane is MCP-visible (the re-derive observable surface exists) — as observed this run (§1.1) |
| An operator-initiated edit in the running app's UI | The pane's rendered HTML changes (the guard PASSES for `'main'` — §5.5 row 5 byte-equal re-derive) |

### 3.1 Class U1 — the zero-config re-derive observability (greens R01, R02, §5.5 row 5, S52)

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| §5.5 row 5 (R03's byte-equal half) | An operator-initiated UI edit (or an MCP `edit.create_node` against an ISOLATED userData default store) on the rendered store `'main'`; read `get_rendered_html` before/after | The app-graph pane re-derives — the default graph re-renders with the mutation visible; the guard passes `'main' === 'main'`, byte-equal to pre-U-MS3 re-derive behavior |
| R02 (§5.2 snapshot `store`) | The rendered pane after boot/re-derive reflects the default store (`lastStore` captured from the snapshot's `store:'main'`) — observable only indirectly as the pane rendering correctly on subsequent `'main'` edits | The pane renders/updates; no separate snapshot payload exists on the MCP surface |
| S52 (edit RESULT no `store`) | `tools/call edit.create_node …` (ISOLATED userData), inspect the result JSON | The result carries NO `store` key (`JSON.stringify` has no `"store"`) — edit RESULTS unchanged; the broadcast payload is not a tool result |
| R01 (sites 1–3, §5.5 row 1) | An operator-initiated UI commit/batch/rich edit | The rendered pane re-derives (the qualified `'main'` broadcast reached the guard) — the UI-path broadcast itself is IPC-internal; only its re-derive consequence is visible |

### 3.2 Class U2 — the foreign-store drop (greens R03's drop half; §5.4 B5, R3, W1–W4) — needs a multi-store registry

Prereq: an ISOLATED userData + a 2-store registry (`main` default +
`research-2026-09`), the app restarted against it.

| Greens | Live probe | Expected (live) |
| --- | --- | --- |
| R03 / §5.4 (the B5 foreign-store drop) | Seed the default pane; capture `get_rendered_html`; `tools/call edit.create_node {…, store:'research-2026-09'}`; re-read | The default pane's rendered HTML is **byte-identical** after the foreign-store edit — the guard DROPPED the broadcast, NO re-derive of the unchanged default graph (B5 closed) |
| R03 / W3 | A foreign-store edit DURING an in-flight default re-derive | The in-flight default re-derive completes; no queued foreign re-derive fires — i.e. no second pane change observable after the edit |
| R03 / W1, W4 (pre-subscription windows) | A foreign-store edit issued before/without a renderer subscription | No rebuild, no pane change (correct by construction — not separately observable from MCP; recorded for completeness) |
| R03 / the malformed + null-lastStore drops + F-MS3-1 | A malformed/uncaptured broadcast delivered to the host (needs renderer console access — a UI-interactive/dev session) | The `console.warn` distinct lines (`[sidebar] rag-store-changed dropped: malformed store (payload had '<raw>')` / `…no captured boot store (lastStore null)`); no re-derive, no throw |

### 3.3 Permanently NOT live-exercisable (internal / type-level / MCP-invisible) — NOT re-attempted

These have NO live MCP/UI surface and stay covered by the module-level greens
(already 23/23) + the repo typecheck leg:

- **S01** — the `IPC_RAG_STORE_CHANGED` channel constant: an IPC constant, no
  MCP/UI surface.
- **S02 / S03** — the REQUIRED-`store` type-level + compat re-export surfaces:
  compile-time, green via `npm run typecheck` (the trio's typecheck leg).
- **S11–S23** — the seven construction points' emitted broadcast payloads + the
  per-call `storeName` callback arg: these are captured ONLY via the
  `onStoreChanged(payload, storeName)` spy inside `handleEditTool`; an MCP/MCP
  caller receives the edit RESULT, never the broadcast payload (the broadcast
  goes to the renderer, not back to the caller). The emitted `store` value is
  MCP-invisible by construction.
- **S31–S33** — the broadcast exactly-once/zero count invariants: broadcast
  telemetry, not returned to a caller; not MCP-observable (their meaning is
  carried by the module greens).
- **S41 / S42** — `deriveBatchBroadcast` / `deriveRichCommitBroadcast` return
  shapes: internal functions, no live surface.
- **S51** — the zero-config broadcast byte-equality row (the exact field set
  `{kind,nodeIds,edgeIds,store}`): internal payload, not MCP-visible.
- **F-MS3-1's warn body** — a renderer `console.warn`; capturable only with
  renderer console access (Class U2's last row), never through MCP.

---

## 4. Parked-scenario census

- **Total greens scenario rows:** 27 (23 executable S01–S52 + 4 RELEGATED
  R01–R04 — `docs/specs/unit-ms3-store-qualified-broadcast-greens.md`; the
  recorded run is 23 PASS / 0 FAIL / 4 RELEGATED).
- **Live-observable once the revisit condition is met (a UI-interactive session
  or an operator-initiated edit, per the supervisor directive):** R01
  (sites 1–3), R02 (snapshot store, indirect), R03 (the host lastStore capture
  + foreign-store drop + malformed/`null` fail-closed drops + the F-MS3-1 warn
  + R3 ordering + W1–W4 + the §5.5 row-5 byte-equal re-derive), R04's
  UI-path-counts half, and S52 (the one MCP-visible row — via an ISOLATED
  userData) = **5 scenario rows** (R01, R02, R03, R04, S52) across classes
  U1/U2.
- **NOT live-exercisable (internal / type-level / MCP-invisible):** S01, S02,
  S03, S11–S23, S31–S33, S41, S42, S51, and the R03-branch internal
  halves/warn = **22 scenario rows** (§3.3). These stay covered by the module
  greens (already 23/23 against the live modules) — the 23 executable rows are
  NOT U-MS3's live failure surface; they are the module-level slice the greens
  already verified.
- **Total parked:** 27 of 27 rows (5 live-observable-later + 22 never-live;
  S52 counted once — noted in both §3.1 and §3.3's boundary). **Run live this
  iteration: 0.**
- **Not a failure:** the app is UP and serving the post-multi-store build
  (§1.1); the greens' 23 module-level scenarios are 23/23; U-MS3's remaining
  surface is the RENDERER/UI path, which requires a UI-interactive or
  operator-edit session with renderer/DOM access (+ renderer console for the
  F-MS3-1 warn) — a structural surface-absence park, not a regression.

---

## 5. Handoff notes for the later iteration

1. **Re-run trigger (the revisit condition):** a **UI-interactive session** OR
   an **operator-initiated edit on the running app** that drives the host
   re-derive (the rendered-HTML observable). The MCP edit path alone reports the
   edit RESULT, not the renderer's re-derive — the re-derive is only observable
   as the app-graph pane's `get_rendered_html` updating after a real edit. The
   foreign-store specifics additionally need a multi-store registry in an
   ISOLATED TEST userData + a restart (a boot, out of scope this run).
2. **P0 first:** re-confirm the 12 tool schemas carry `store` and that
   `get_rendered_html` returns the `zone:main` app-graph pane (both observed
   live this run, §1.1). If either is absent the surface is not the
   post-multi-store build ⇒ re-park.
3. **NEVER mutate the real userData:** all mutating `edit.*` probes run against
   an ISOLATED userData (`HOME=$(mktemp -d) npm start > boot.log 2>&1`); the
   real `/home/ryanr/.config/provident-electron/` (62 MB `provident-rag.json`,
   128 MB `provident-vector-cache.json`) is never written.
4. **A live result that CONTRADICTS the greens or spec §5.1–§5.6 is a
   finding** (a real regression or a doc/spec drift) — never a pass. In
   particular: if a foreign-store MCP edit (multi-store registry) DOES re-derive
   the default pane, the B5 guard has regressed — report it. If an S52 result
   carries a `store` key, that is a regression. Byte-pinned diagnostics (the
   F-MS3-1 warn lines) assert the exact string from spec §5.4.
5. **Same-pass pairing:** this battery's U2 foreign-store class shares its
   multi-store registry + isolated-userData + restart prereqs with the U-MS1
   (boot-matrix L1/L2), U-MS2 (M1/M2/M3 + B1–B3), and U-MS4 (L6 prereq layer)
   batteries. Run them in the SAME restart iteration; the U-MS2 selector/M2
   errors are the prereq layer under every U-MS3 probe.
6. **Doc-staleness before running:** reconcile this battery against the actual
   repo/build state — U-MS5 may have landed (a store listing/renderer surface)
   and changed the observable set; re-read the byte-pinned F-MS3-1 warn strings
   and spec section numbers; reconcile the trackers (`docs/next-steps.md`,
   `docs/pending.md`). The greens' harness notes (the 23 module rows are already
   green) carry over for the module-level boundary.
