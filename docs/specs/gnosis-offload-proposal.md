# PROPOSAL — ARCH-GNOSIS-OFFLOAD: move heavy document handling off the shell

**Date:** 2026-09-16 · **Kind:** architecture proposal (changes this repo's contract) · **Status:** PROPOSED — **AMENDED 2026-09-16** after the validity + critique reviews; **ARCHITECTURE REVIEW: APPROVED-AS-SPLIT** (Alt C — the snapshot seam; ruling recorded in §3.2). **CHANGE-ANALYSIS VERDICT: PROCEED-WITH-AMENDMENTS** (see `docs/specs/gnosis-offload-review.md`). The three-agent proposal gate is COMPLETE — awaiting the user's go-ahead before the spec gate. · **Owner:** the Astrographer shell · **Source note:** the user's
statement in the batch-6 report — *"preventing the app from locking up under import load, search,
document opening, etc. was one of the incentives behind splitting the document handling off to Gnosis."*

**Binds:** `docs/decisions.md` `SOURCE-SWITCHABLE` (the `RagStore` interface anticipates
`createRemoteRagStore`), `RAG-AUTHORITATIVE`, `SINGLE-WRITER-STORE`; `docs/defects.md`
**`HEAVY-OPS-FREEZE-THE-PAGE`**, **`CANVAS-DIMENSIONS-JS-DRIVEN`**, **`ARCH-GNOSIS-OFFLOAD`**,
**`PANE-TOGGLE-FULL-REASSEMBLY`**, **`PANE-SLOT-INSTABILITY-ON-DISCLOSURE`**;
the gnosis engine rows `HOST-ENGINE-QUERY-POST-NO-ENVELOPE`, `GNOSIS-ENGINE-QUERY-MODE-IGNORED`,
`GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT`; `docs/specs/mcp-endpoint.md`; `docs/specs/ui-overhaul.md`.

---

## 1. Status / what the proposal asks

**The measurement that motivates it** (live, this app, 226-document store, 2026-09-16):

| Interaction | Cost |
| --- | --- |
| Real click on a doc-nav **document row** (open a document) | page unresponsive **~1 011 ms**, `PerformanceObserver` long tasks `[439, 439]` |
| Real click on a doc-nav **folder row** (a pure disclosure) | **505 ms** long task, 39 DOM mutations, to reveal two rows |
| Pane collapse / zone minimize (a class flip) | 2 556 DOM mutations, long tasks `[465, 52]`, 2.5–2.9 s gesture |
| **Idle** window-resize round-trip (the control) | **6 ms** |

**A1 (causal claim, split — the earlier blanket statement was wrong).** There are TWO distinct paths,
and the measurements in the table above come from BOTH:

- **The `'content'` path** (a doc-nav folder disclosure; a doc-nav document-row open): `pane-graph`
  handler → `sidebar-panes` `docNavToggle`/`selectDocument` → `edit-controller` (default kind
  `'content'`) → `Runtime.applyContentChange` → **re-traversal of the scoped store + a FULL graph
  `compilePath` (every node) + a DUAL emit (DOM `render()`, then the SSR mirror) + reconcile**
  (`src/renderer/runtime.ts:254-298`, `:543` — `attachRoot` flips `bootstrapped = false`), then
  `rebuildIdIndex`, `syncZoneMirrors`, `recomputeBackRefs`.
- **The non-content path** (pane collapse / zone minimize / search): the full reload
  `refresh()` → `loadAppGraph` → `Runtime.loadEnvelope` → `tearDownGraph` (destroy + recreate,
  `runtime.ts:422-423,1047-1092`).

**A2 (per-row mechanism + what is measured vs not).**

| Measured row | Path | Dominant pass | Evidence status |
| --- | --- | --- | --- |
| doc-nav **folder** click → 505 ms, 39 mutations | `'content'` | compile + dual emit (NOT DOM: only 39 mutations for a 505 ms task) | measured; the per-pass split is **NOT yet measured** |
| doc-nav **document row** click → ~1 011 ms unresponsive, long tasks `[439, 439]` | `'content'` | as above | measured; the `[439, 439]` split (derive vs render vs layout) is **NOT measured** |
| pane collapse / zone minimize → 2 556 mutations, `[465, 52] ms` | non-content (`loadEnvelope`) | style/layout/paint of a full re-assembly (JS self-time only `translateNodeData` 13 + `renderTree` 8 + `enumPathWalks` 8 ms — `defects.md` row 27) | measured; concludes DOM style/layout/paint dominates |
| **idle** resize → 6 ms | control | — | measured (excludes only the resize path) |

**A14 (unmeasured / unruled-out alternatives, explicitly open):** GPU-off rasterization (every live run
uses `--no-gpu`), the doc-nav list size, the 12 698.7 px grid track, the MCP/IPC snapshot payload, and
the possibility that the observer window simply contains derive+assemble+2×render+layout+paint. The
proposal does NOT claim these are ruled out; §5 O-0 is the discriminating measurement that must run
BEFORE any fix is sequenced.

**The proposal.** Make the **Gnosis engine the owner of heavy document handling** for the shell:

1. **Ingestion** — `edit.import_markdown` / File → Import… route the PARSE + VALIDATE + APPLY work to
   the engine (async, chunked, progress-reporting) instead of doing it in the shell's main process.
2. **Query/search** — `rag.query` traffic goes to the engine's `/rag/query` (with the POST envelope
   fixed and `mode`/`topK` honoured), chunked/streamed so the UI never waits synchronously.
3. **Document open / traversal** — the envelope derivation (the traversal that turns the store into a
   render envelope) moves behind the engine (or behind a worker) so opening a document cannot block
   the UI thread.
4. **The shell keeps** rendering, orchestration, shell chrome, and the operator surfaces — and gains a
   **long-task budget** (no user interaction may produce a > 100 ms main-thread task).
5. **Offline fallback** — the local store remains the fallback (`SOURCE-SWITCHABLE`): with no engine,
   the shell behaves as today (with the scoped-render mitigations of §2).

**Companion (cheap, independent, and arguably a prerequisite):** the *renderer-side* fix for the same
symptom — scoped re-renders (a doc-nav toggle must re-render the pane body only; a document open must
mount the stage payload only; a pane visibility/size change must do no graph work), a virtualized/capped
doc-nav list, chunked/async reconcile with event-loop yields, and CSS-owned layout geometry
(`LAYOUT-IN-CSS`: the stage track becomes `minmax(0, 1fr)`; JS keeps only operator-chosen sizes; **no
resize listener**).

## 2. What does NOT change

- `RAG-AUTHORITATIVE` (the RAG store stays the source of truth) and the provident-authoring rule (UI stays
  in the provident graph; no unit may hand-write DOM — `PANE-PROVIDENT-AUTHORING`).
- The local store path stays supported (offline / no-engine boots).

**A10 — the ACTIVE decisions this proposal would AMEND (declared explicitly, not silently):**
`SINGLE-WRITER-STORE` (its "the **main process** owns all writes" clause moves to the engine when the
engine owns the store) — requires a supersession row; `SOURCE-SWITCHABLE` (its letter assumes a
SYNCHRONOUS `RagStore` read surface — see A4); `RAG-AUTHORITATIVE` + `CONTENT-EDIT-RE-TRAVERSAL` (their
"re-traversed on ANY store change" invariant is what a SCOPED re-render narrows — the replacement
invariant must be stated, and `MULTI-PARENT-DUPLICATE`'s "all duplicates updated" rule preserved);
`UI-CONFIG-CARRIER` (a pane visibility/size change currently persists → broadcasts →
`requestRebuild('operator')`: a scoped render must persist WITHOUT re-deriving). Also bound:
`ENGINE-WIRE-CLIENT` (the engine proxy is a DISTINCT surface that does NOT implement the `RagStore` CRUD
interface), `GNOSIS-SUPPLANTS-DOCUMENT-STORE`, `GNOSIS-CRUD-SURFACE-CONFIRMED`, `GNOSIS-RBAC-EDIT-ENFORCEMENT`,
`ENGINE-TRANSPORT-POLICY`, `BATCH-ATOMICITY-API`, `MCP-UI-EQUIVALENCE`.

## 3. Feasibility verdict

**PARTIALLY READY — the seam exists, the engine's ingestion surface does not.**

*What exists today:* the `RagStore` interface abstraction (`SOURCE-SWITCHABLE`), the engine's wire
envelope + query/stream/CRUD routes (`POST /rag/query`, `GET /rag/stream`, `POST /documents`,
`POST /documents/:id/update|publish|unpublish|archive`, `POST /wikis`), a live engine that reaches
`state: Ready` with `{store, graph, lexical, vector, embedding, reranker}` and a wired ollama embedding
provider, plus the app-side engine CRUD routing (`engine-rag-store.ts`, `engine-crud-rag-store.ts`).

*What does NOT exist (blocking the offload as stated):*
1. **No bulk ingestion route.** The engine's routes are `rag query/stream`, `engine status`, and
   document/wiki CRUD — there is **no markdown-corpus import / directory expansion / batch-ingest
   endpoint**, so proposal item 1 has no engine counterpart today. The nearest fit is
   `POST /documents` + a graph body (nodes+edges) per document, which the shell would have to build
   (i.e. the shell keeps the markdown parse, moving only the APPLY), or the engine gains an import
   route (a Gnosis-repo change).
2. **No streaming/chunked ingestion contract** (progress, cancellation, cap enforcement) on the engine
   side — the shell's U-IMPORT-1 semantics (512-file cap, fail-loud, `IPC_IMPORT_RESULT`) would need an
   engine-side equivalent.
3. **Three open engine defects block a straight swap of the query path**: `POST /rag/query` ignores
   `mode`/`topK` (`GNOSIS-ENGINE-QUERY-MODE-IGNORED`), the shell's engine client posts a BARE body where
   the F2 envelope is required (`HOST-ENGINE-QUERY-POST-NO-ENVELOPE`), and the vector index is never
   built / enrichment routes 404 (`GNOSIS-ENGINE-ENRICHMENT-SURFACE-ABSENT`).
4. **Traversal/envelope derivation has no remote counterpart** at all: the traversal is host code
   (`src/main/traversal.ts`) that reads the store in-process and produces the render envelope. Moving it
   "to Gnosis" is not a seam swap — it is either (a) a new engine capability (the engine returns an
   envelope-shaped payload) or (b) moving the derivation off the UI thread (a Node worker in the shell),
   which is a DIFFERENT and much cheaper change that fixes the user's freeze without the engine.

### 3.1 A3/A4/A6/A7 — the leg rulings (post-review)

| Leg | Ruling | Why |
| --- | --- | --- |
| **Ingest** | **engine-ownable only as a DESTINATION — not today, and not required by the incentive** | the engine has no markdown parse, no doc-flow validation, no bulk/batch-atomic route, no progress/cancel/cap contract and **no durability** (its server builds an in-memory store and persists nothing); the shell's import is ONE atomic `applyBatch` with a single one-shot `IPC_IMPORT_RESULT`; the shell↔engine node-model mapping is pinned "local-only v1". |
| **Query** | **shell-ownable-but-off-thread (it already is); engine-ownable only after the 3 blockers + result-shape parity** | `rag.query` already runs in main; the post-search freeze is the renderer's `loadAppGraph` re-load. Engine results lack `ranked/context/markdown/lineMap/k`. |
| **Traversal / envelope** | **NOT engine-ownable as stated; the WALK could move off-thread, the RENDER cannot** | the `RagStore` read surface is SYNCHRONOUS (22 members) with no engine read route, and `translateLegacy` + `compilePath` + the dual emit must stay on the renderer main thread. So only the derivation WALK is a worker candidate — and its share of the measured cost is **unmeasured** (A2/A14). |

**A4 (the seam is not ready):** `createRemoteRagStore` cannot implement `RagStore` as shaped today — its
reads are synchronous, and the engine exposes no bulk node/edge read. Either the read surface becomes
async (a breaking change across the traversal, the MCP handlers and the 4 746-test pin set) or the
engine must materialize a projection; the proposal does not choose, and that choice is a prerequisite
decision.

**A5/A6 (durability + contract losses, previously unsaid):** engine ingestion would lose the
single-atomic-batch journal entry, the 512-file fail-loud cap and the one-shot result broadcast, and
would raise "who owns the persisted corpus during/after a cutover" — the engine's server persists
NOTHING today. **A7:** re-pointing `rag.query` at the engine also changes what an agent observes at the
MCP surfaces pinned by `docs/specs/mcp-endpoint.md` (`get_rendered_html`/`get_markdown`/`list_targets`/
`get_node_state`, the `rag`/`edit` groups) and `MCP-UI-EQUIVALENCE` — i.e. it changes THIS repo's
contract and needs the full proposal landing (`docs/specs/<proposal>-review.md`), not a shell-only note.
**A12 (change-notification gap):** the engine has no store-change subscription or adjacency-read route,
so an engine-owned writer leaves the renderer's `rag-store-changed` source (and the
`lastTraversalEnvelope` cache) with no staleness contract.

### 3.2 ARCHITECTURE RULING (2026-09-16) — APPROVED-AS-SPLIT, shape = **Alt C (the snapshot seam)**

- **Shape.** The engine may own the *store* (persistence/writes/adjacency/subscription) but **never the
  render path**. The ONLY crossing is `RagSnapshotPayload {nodes, edges, store, revision}` —
  **main → renderer, async, pull** on `bridge.rag.snapshot()`; the renderer never reads the store, the
  engine never sees an envelope. Inverse direction = mutation intents only (`IPC_EDIT_*`, `rag.query`,
  imports). Why this boundary is stable: the engine's missing bulk-read/import/notification routes and
  its non-persistence sit BEHIND the seam; the shell's reconcile/assembly defects sit IN FRONT of it, so
  neither repo's internal drift can break the other. `A12`'s staleness gap is closed by one **additive
  `revision`** field + a renderer-side drop of any snapshot older than the last committed one.
- **Split (the verdict).** **NOW-SPEC:** O-0, O-5, O-3, O-9, O-10, O-1, O-2 + the additive snapshot
  `revision` + the §3.3 invariant/supersession rows. **PARKED DESTINATION (handoff, not shell units):**
  O-6, O-7, O-8 — with O-8's authority-switch contract as that track's PREREQUISITE. **O-4 is
  conditional** on O-0's artifact. **Trigger to schedule the parked track** (external facts, not
  preferences): (a) a multi-user/remote-corpus requirement exists (`pending.md`'s revisit condition);
  (b) the operator corpus exceeds the local store's measured ceiling (a node-count threshold pinned by
  O-0); or (c) O-0 shows the derivation WALK itself (not compile/emit/layout) exceeds the budget — the
  only condition under which an engine-side derive would be the right lever.
- **`RagStore` reads stay SYNCHRONOUS** and the interface must NOT become async: making it async would
  turn a pure, in-process, node-testable derive into a network-shaped async pipeline rippling through
  the traversal, the MCP `rag`/`edit` handlers and the 4 746-test pin set — for a derivation that is
  genuinely local. The *store* can be remote through the snapshot pull without the *interface* going
  async. The async question is parked with that named precondition.
- **Landing order + rollback:** O-0 → O-5 → O-9+O-3 → O-10 → O-1 → O-2 (each a single-diff revert; O-4
  parked). **O-10 lands BEFORE O-1** (slot authority must exist first, or a scoped pass re-sorts a zone
  — the exact defect O-1 would otherwise re-open), and **no unit may land before O-0's staged artifact
  and O-5's budget row exist**.
- **Two additions the spec must carry (new):** (a) the snapshot `revision` + stale-drop rule (closes A12
  with no engine route); (b) a **layout-containment** acceptance row — `contain: layout style paint` on
  the pane/zone frames + a bounded pane body — because the pane-gesture cost is measured as layout/paint
  of a huge page, and containment is the cheapest lever with no JS surface. **Constraint on O-2:** the
  doc-nav bounding must be CSS-level (containment / `content-visibility` / a bounded scroll body) with
  the rows still GRAPH-RESIDENT and dispatchable — graph-level windowing that removes rows would break
  `provident.list_targets`/`get_node_state`/`get_rendered_html` and `PANE-PROVIDENT-AUTHORING`.
- **Guardrails making O-1/O-2/O-9/O-10 safe to land alone:** one re-derive per change batch (the
  existing in-flight/queued coalescing is the only admission point — no unit adds a second path to
  `reconcileDocumentRoots`/`Runtime`); a scoped pass may only narrow the change census, never the
  invariant (`reconcileDocumentRoots` stays the sole classifier); `Runtime` gains exactly ONE new public
  entry point (a scoped emit keyed by an explicit changed-root set, preserving the `prevStates` prune and
  the dual DOM+SSR emit); **single in-flow `#wiki-root` mount promoted from a fix to an INVARIANT**
  (node test + live row on every pass, scoped ones included); per-unit red sets, land-alone, no shared
  cycles (RCA-1/RCA-2).

### 3.3 THE INVARIANT (architecture ruling R2 — verbatim for the spec)

> **`CONTENT-EDIT-RE-TRAVERSAL` (as superseded):** the materialized graph is re-derived from the
> authoritative store on every committed store change, but re-derivation is **ROOT-SCOPED**: for a change
> batch reporting `nodeIds`/`edgeIds` on snapshot revision *r*, every materialized content root whose
> RAG-id set intersects the reported change set is destroyed and re-attached from the revision-*r*
> envelope, and every root whose id set does not intersect it is left **node-identical** (same `Node`
> instances, same ids, same compiled state). Any change whose kind is `structural`, or whose `edgeIds` is
> non-empty, or whose descriptor is absent/malformed, re-derives **every** materialized root. The
> traversal is a pure function of `(snapshot revision, documentIds, zoneName)`.

`MULTI-PARENT-DUPLICATE` is re-expressed in the strictly stronger root-set form: duplicate-per-parent
materialization is a set of roots sharing a `data-rag-node-id`, and the root-scoped rule is defined OVER
THE RAG ID — so a change to a shared id intersects every one of its roots and re-attaches all of them in
the same pass. **Staleness is impossible by construction**, not by a second mechanism. Testable in node:
materialize a multi-parent node as N roots, apply a change carrying only that id, assert (i) all N roots
in `replaced`, (ii) each re-attached root has the new content, (iii) no other root in
`added`/`removed`/`replaced`, (iv) untouched roots keep node identity, (v) an edge-bearing/`structural`
batch falls back to the full set.

**Decision rows superseded/amended by this proposal:** `CONTENT-EDIT-RE-TRAVERSAL` (SUPERSEDED — narrowed
to the root-scoped form), `RAG-AUTHORITATIVE` (AMENDED — the "re-traversed on ANY change" clause is
narrowed; the authority clause stands), `MULTI-PARENT-DUPLICATE` (AMENDED — root-set form),
`UI-CONFIG-CARRIER` (AMENDED — a pane visibility/size write persists and MUST NOT re-derive),
`SINGLE-WRITER-STORE` (AMENDED only in the parked engine track), **NEW: `SNAPSHOT-REVISION-AUTHORITY`**
(the renderer commits only the newest snapshot revision and drops stale ones).

## 4. Gaps + costs / benefits

**Gaps the proposal must close (each one is a unit):** an engine ingestion route + its contract
(progress/cancel/cap); the query-path fixes (envelope + mode/topK); a decision on WHERE the traversal
runs (engine route vs shell worker) — the latter is the pragmatic split, since the freeze is a
main-thread problem; scoped re-renders in the renderer; the long-task budget harness; and CSS-owned
layout geometry.

**Costs:** the engine-side work is a Gnosis-repo change (handoff, not patched here); the shell-side work
is a multi-unit effort (scoped renders touch the reconcile/assembly path, which is currently the source
of the duplicate/slot defects and is the riskiest code in the repo); a migration must keep the offline
local-store path working (dual-path testing); and the existing 4 746-test suite pins the current
in-process behaviour, so many pins will need re-derivation.

**Benefits (A9 — corrected):** the shell becomes a renderer/orchestrator with a bounded UI-thread
budget, and `LAYOUT-IN-CSS` removes a class of geometry bugs. The earlier claim that the scoped-render
work "ALSO fixes `PANE-TOGGLE-FULL-REASSEMBLY` and `PANE-SLOT-INSTABILITY-ON-DISCLOSURE`" was NOT
entailed and is withdrawn: those two have their own recorded fix shapes (a pure CSS class flip for
collapse/minimize; `LayoutState.panes[].order` as the slot authority) and are now their own units
(O-9, O-10).

**Honest counter-consideration (for the reviewers):** the measured freeze is caused by the shell's
FULL re-derivation on every graph change, not by the engine's absence. Scoped re-renders alone may
remove the user-visible lockup at a fraction of the cost — so the reviewers must judge whether the
Gnosis offload is REQUIRED for the incentive, or whether it is an architectural destination that should
be sequenced AFTER the cheap mitigations rather than a prerequisite for them.

## 5. Proposed unit decomposition (A8/A11/A13 — amended: measurement first, layers named, handoffs separated)

| # | Unit | Kind / layer | Acceptance criterion |
| --- | --- | --- | --- |
| **O-0** | **Discriminating measurement FIRST**: a named `scripts/live-drive.mjs` block that stages one freeze (`snapshot()` / derivation / assemble / `decorateShared` / reconcile / `render()` DOM / SSR / post-render layout) on a real folder-row click AND a real document-row click, at the operator corpus size; plus a **GPU-on vs GPU-off control** and a plain-`display:block` ablation of the 12 698.7 px grid track | harness (live) | a recorded per-stage ms breakdown + the verdict "derivation is X ms of the Y ms long task"; no fix is sequenced before this artifact exists |
| **O-1** | Scoped `'content'` render: a doc-nav disclosure / pane visibility / zone minimize must NOT re-derive the app graph; the scoped path stays GRAPH-MEDIATED (`applyContentReconcile`/state-slice — never raw DOM) | shell (renderer), assembled layer | live row: a folder toggle changes no pane slot and re-renders only the doc-nav body; long-task budget met |
| **O-2** | Document open mounts only the stage payload; the doc-nav list virtualized/capped | shell (renderer), assembled layer | live row: doc open < budget; doc-nav scroll stays usable at the operator corpus size |
| **O-3** | `LAYOUT-IN-CSS` residual: drop the JS `--stage-weight` serialization (stage = plain `minmax(0,1fr)`), keep JS custom properties ONLY for operator-chosen sizes, confirm zero resize listeners | shell (CSS/JS) | live row: after a resize the geometry follows with no JS layout write and no layout-state commit (see A15: this is small enough to be folded into O-9) |
| **O-4** | Traversal **WALK** off the UI thread (shell worker) — **ONLY IF O-0 shows the walk is load-bearing**; the render pass stays on-thread | shell (main/worker) | only scheduled if O-0's breakdown says so |
| **O-9** | Pure-CSS collapse/minimize class flip (replaces the re-assembly for that gesture) | shell (CSS) | live row: a pane collapse produces no graph pass and no long task |
| **O-10** | `LayoutState.panes[].order` as the slot authority (a content change can never re-sort a zone) | shell (renderer) | live row: a disclosure does not change any pane's slot index |
| **O-5** | Long-task/liveness harness + the budget row (per-pass, not one aggregate claim) — RCA-12 layer statement; the number is pinned after O-0 | harness (live) | committed artifact + a FAIL row when a user interaction exceeds the pinned budget |
| — | **O-6 query onto the engine · O-7 ingestion onto the engine · O-8 offline/dual-path + authority switch** | **ENGINE-REPO HANDOFF + a later shell track — NOT part of the incentive-driven work.** These are destination work: each needs a Gnosis-repo route/contract (bulk ingest + model mapping + persistence + change-notification/adjacency reads) and they move no measured long task today. O-8's authority-switch contract is a PREREQUISITE if this track is ever scheduled, not a tail unit. | tracked in `docs/HANDOFF.md`, not as shell units |

**A13 — regression watchlist for O-1/O-2/O-9/O-10** (all of these already regressed through the
reconcile/assembly path): `PLACEMENT-ONLY-PAYLOAD-ROOT` + LIVE-UF6 (duplication),
`STALE-MOUNT-PUSHES-CANVAS` (single in-flow `#wiki-root`), LIVE-8's toolbar reconcile allocation,
AD-2026-09-14-1/-2 (pane-like routing), `MULTI-PARENT-DUPLICATE` (all duplicates updated), and the
4 746-test pin set — each unit records its own red set (RCA-1/RCA-2) and lands alone.

**A11 — the invariant replacement (must be stated in the spec):** `CONTENT-EDIT-RE-TRAVERSAL` says
"re-traversed on ANY store change". O-1/O-2 narrow that to "re-traversed on any store change THAT AFFECTS
THE RENDERED SET", with `MULTI-PARENT-DUPLICATE`'s all-duplicates rule preserved — the spec must state
the new invariant and prove duplicate staleness remains impossible.

## 6. Handoff note

Reviews landed: **validity = VALID-WITH-AMENDMENTS**, **critique = NEEDS-REWORK** (both required the
sequencing flip and the causal re-statement now folded in as A1..A15). Next at this gate: the
**architecture review** (informed by both) and the **change-analysis verdict**. The reviewer-pinned
prerequisites before a spec can be written: O-0's staged measurement artifact + the GPU control; the
per-unit layer and acceptance thresholds; the `RagStore` remote-read decision; the supersession rows for
`SINGLE-WRITER-STORE` / the narrowed re-traversal invariant / `UI-CONFIG-CARRIER`; the
`mcp-endpoint.md` delta list; and the import-path decision (chunked `applyBatch` + incremental progress
vs the engine route). Nothing is implemented before the user's go-ahead.
