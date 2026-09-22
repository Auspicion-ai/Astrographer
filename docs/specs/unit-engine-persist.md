# Spec — Unit `U-ENGINE-PERSIST`: the engine-persistence client contract, the four-state readiness gate, and the upstream durability handoff

- **Status:** SPEC — **authored 2026-09-21 (SpecDoc pass)**, from the reviewed proposal
  `docs/specs/design-extensions-review.md` (`## 10. VERDICT + CONDITIONS + THE USER QUESTIONS`, verdict
  `PROCEED-WITH-AMENDMENTS`, **UNBLOCKED** by `## 11. USER RULINGS (2026-09-21)`) and the user's
  go-ahead for the approved program `## 13. THE APPROVED PROGRAM (P0–P4)`, phase **P2**, first unit.
  This file is the unit contract; **it lands before any unit code**, and it is the input to the
  TestWriter's red set (§11).
- **Unit id:** `U-ENGINE-PERSIST` (the program's P2 row, `## 13. THE APPROVED PROGRAM`, §13.3's
  `P2 U-ENGINE-PERSIST` gate-obligation row). File path `docs/specs/unit-engine-persist.md` is the
  `unit-<name>.md` convention; the unit's own name is `U-ENGINE-PERSIST`.
- **This is LARGELY A HANDOFF UNIT.** The unit's object — a **durable corpus in the engine** — is
  **owned by the sibling Gnosis repo** and is **NOT authorable here**. What is authorable, and what
  this spec pins, is (a) the **app-side client contract + failure UX** (the shape the app's client
  must have so that the cutover can run on top of an engine that persists), and (b) the **exact
  upstream handoff** the unit depends on. §2 splits the two sets with a counted partition; §3 gives
  each owed item the AGENTS.md item-7 field set (symptom / reproduction-evidence / proposed fix shape
  / handoff target).
- **Layer (RCA-12, mandatory declaration): MIXED, and the split is stated here so no reader can
  blur it.**
  - **App-side client seam (code-bearing): MAIN-PROCESS / PURE-MODULE layer.** The readiness
    classifier, the four-state gate, the typed failure classes, the configuration resolution and the
    retry-budget rule are **node-testable against an INJECTED transport** — the existing
    `fetch`/`sse` injection seams of `EngineRagStoreOptions` / `EngineCrudRagStoreOptions`. A green
    there is a **MODULE-GREEN (main-process, pure)** reading.
  - **Nothing in this unit is APP-GREEN, ENVELOPE-GREEN, STORE-GREEN, LIVE-GREEN or ENGINE-GREEN.**
    In particular: **no green in this unit, at any layer, can prove that the engine persists
    anything** — see §10's live-battery mandate for the exact wording the DONE row must use.
  - **Upstream-owed half:** **DOC-LAYER for this repo** — handoff rows only (§13). Editing the Gnosis
    repo is forbidden (§2.4).
- **Contract regime (sequencing rule S2, `## 13. THE APPROVED PROGRAM` §13.2):** this unit is spec'd
  against the **engine-authoritative DESTINATION** while the code **still writes locally** — the
  **TEMPORARY AUTHORITY + SUNSET** gap (§14.5 of the gate record). The unit's DONE row **must state
  that gap and the sunset condition** (the gap closes when `U-AUTHORITY-SWITCH` lands and the
  authority-switch row records the cutover) — **never** describe the cutover as already done.
- **TestWriter contract:** every method/API signature, return shape, throw pattern, valid state and
  fail-state below is derivable from this spec **ALONE** (§4–§9). The TestWriter writes the red set
  for the app-side seam from §8/§9 + the §7 register **before any implementation** (RCA-1), and must
  use an **injected fake engine** — never a live engine (§10).
- **Page-design note (repo divergence, verified).** `docs/skills/designing-pages.md` **does not exist
  in this tree** (only `docs/skills/process-guardrails.md` does; the gate record's own §15 records
  the same absence by glob). There is therefore **no test-use-case coverage matrix and no demo-page
  index to update**, and **no such update is made or attempted** by this pass. The UI consequences
  §4c/§11 depend on (the operator-visible readiness state, the refusal surfacing) are pinned **here**
  and must be carried into that skill **when it is authored** — owed, recorded, not silently skipped.

---

## 1. What the unit asks, and what the user ruled

**The user's ruling this unit exists to serve** (`## 11. USER RULINGS (2026-09-21)`, §11.1, verbatim):
*"Supersede now — engine owns document CRUD."* Its recorded consequence is explicit and gated:
**"Without `U-ENGINE-PERSIST` + `U-CORPUS-MIGRATION`, the operator corpus is lost at the next
restart"** (§11.1, "Consequences"; `## 14. CONSEQUENCE TABLE + RE-PLANNED FENCES` §14.1 row **C-1**),
and the fence is §13 P2: **nothing cuts over until those units land.**

**So this unit's object is not "write engine code".** It is:

1. **Name and pin the app-side client contract** the cutover will run on: which calls the app makes,
   the request/response shapes, the revision/consistency semantics, the retry/idempotency rules, the
   typed failure classes, the health/liveness probe, the configuration surface, the store↔wiki
   mapping, and the operator-visible state (§4).
2. **Pin the app-side degradation contract** for the **four engine states** — unreachable at boot,
   unreachable mid-session, **present-but-not-persistent** (the engine's state today), and
   present-and-healthy — with the ruling's refusal pinned as a **typed refusal, never a silent local
   write** (§5).
3. **Pin the readiness gate**: what the app checks to decide the engine is usable, the poll/backoff
   policy, and what the launcher does and does not do (§6). **The app must not spawn processes** —
   this is the `GN-3` ruling (§11.2: *"The launcher (`scripts/start-app.sh`) owns the spawn."*) and the
   gate record's §3.2 B.3 clause 2 (a shell-side spawn is a **new exec/argv security seam and its own
   gated proposal**).
4. **File the upstream handoff** this unit depends on, in the AGENTS.md item-7 shape, with the exact
   `docs/HANDOFF.md` rows owed (§3, §13).

**Explicitly NOT this unit:** the engine's durable store itself; the authority switch / offline
dual-path (`U-AUTHORITY-SWITCH`); the operator-corpus migration (`U-CORPUS-MIGRATION`); the read-model
pivot (`U-READS-PIVOT`); any change to `src/**` outside the app-side client seam; **any edit to the
Gnosis repo** (§2.4).

---

## 2. The split — APP-SIDE vs UPSTREAM-OWED (the counted partition)

### 2.1 APP-SIDE deliverables (this repo; **9** items)

| # | Deliverable | Where pinned | Shape |
| --- | --- | --- | --- |
| **A1** | The **readiness classifier** — a total, pure function from a `/engine/status` `HealthReport` (+ the transport outcome) to ONE of four `EngineReadiness` states | §4.1, §6.2 | `classifyEngineReadiness(...)` — pure, total over the four states |
| **A2** | The **probe surface** — the single call the app makes to decide "is the engine usable", with its shape, its timeouts and its bounded retry | §4.1, §6.3 | `readiness()` / `waitForUsable()` |
| **A3** | The **typed failure classes** for refusal — `EngineNotPersistent` (NEW), the extended `EngineUnavailable` cause set, and the client-side error→cause mapping table | §4.2 | `EngineUnavailable`, `EngineNotPersistent`, `EngineReadinessRefused` |
| **A4** | The **four-state degradation contract** — the exact client behaviour per state, incl. the **refusal** (not-persistent ⇒ typed refusal, never a silent local write) | §5 | per-state behaviour table + the refusal invariants |
| **A5** | The **retry / idempotency rules** the gate must satisfy, incl. what may NOT be retried | §5.4, §6.4 | the retry-policy table + the no-auto-retry-on-ambiguous-commit rule |
| **A6** | The **configuration surface** — engine baseUrl resolution (config seam → env → default), the config-file shape and its coercion rule, loopback-only enforcement, timeouts | §4.4 | `resolveEngineBaseUrl` priority + `EngineConfig`/`EngineConfigStore` |
| **A7** | The **store ↔ wiki mapping** decision surface (which store maps to which engine wiki, and what is a store-qualified result) | §4.5 | the mapping rule + the unresolved-parts list |
| **A8** | The **operator-visible state** — how the four states reach a human, and that it must be typed and never silent | §4.6 | the state vocabulary + the visibility rule |
| **A9** | The **launcher contract** (`scripts/start-app.sh`) — detect-or-launch, health-poll, report, exit codes; **the app spawns nothing** | §6.5 | the launcher clause set + the exit-code table |

### 2.2 UPSTREAM-OWED items (the Gnosis repo; **8** items)

Each item is owed per AGENTS.md item 7 and is detailed in §3 with its symptom, its
reproduction/evidence, its proposed fix shape and its handoff target.

| # | Owed item | Owning upstream track | §  |
| --- | --- | --- | --- |
| **O-1** | The **durable store** (format, atomic commit, crash recovery, revision semantics across a restore) | the durability design unit (GR-7 / O-7 / `PRUNE-838`) | §3.1 |
| **O-2** | The **write/commit contract** with an explicit per-write revision/cursor result | GR-7 + GR-4/`GNOSIS-CHANGE-CURSOR` | §3.2 |
| **O-3** | The **persistence self-report** on the health surface (without it every probe is permanently not-persistent) | the health-report owner (§9 of the wire contract) | §3.3 |
| **O-4** | The **bulk ingest route with progress + cancel + cap** | GR-6 / O-7 | §3.4 |
| **O-5** | The **markdown parse + doc-flow validation** on the engine | GR-6 item 1 / O-7 | §3.5 |
| **O-6** | The **store-change notification route** (the coherence trigger) | GR-5 / `PRUNE-805` / O-8 | §3.6 |
| **O-7** | The **bulk projection read + the revision-vs-cursor adjudication** | GR-4 / `PRUNE-804` + `GNOSIS-CHANGE-CURSOR` | §3.7 |
| **O-8** | The **machine-caller authority contract** (documented, with its denial code) | GR-9 | §3.8 |

**Counted split: APP-SIDE 9 · UPSTREAM-OWED 8 · total 17.** The split is **disjoint and closed for
this unit**: an item is app-side iff it is authorable in this repo without touching the engine; an
owed item is not authorable here **at all**. Adding a ninth owed item is a spec amendment, not an
implementation liberty.

### 2.3 The boundary rule (what the app may and may not claim)

- The app may **observe** the engine (health, readiness, commit results) and **refuse**.
- The app may **not** implement durability, a commit log, a migration, or a local fallback that
  pretends to be engine persistence. **A local write performed because the engine could not be
  verified persistent is the exact defect this unit exists to prevent.** This is also the
  `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT` **identity clause being REVERSED** by the §11.3 ruling
  ("works IDENTICALLY" is no longer true — with no engine, **no wiki opens**); the **typed-failure
  obligation is retained** (§11.3, "Consequences": a refusal is a **loud, typed, user-visible**
  state — never a silent degrade).
- The app may **not** spawn a process (§6.5; the `GN-3` ruling, §11.2).

### 2.4 The never-patch rule (AGENTS.md item 7, restated because it governs this whole unit)

The engine is a **sibling project** (`../Gnosis`) — **the app repo MUST NOT patch it.** Every item in
§2.2/§3 is a **handoff**: catalogued per item 7, indexed in `docs/HANDOFF.md` (§13), and filed against
the Gnosis repo's own tracker. The `docs/HANDOFF.md` head and its O-7/O-8 pointer rows state the same
rule in terms ("**Do NOT patch the Gnosis repo from this project.**", and the "Do NOT patch
`node_modules/provident-ssr/` or `../Provident-Electron/`" sibling rule). A pass that edits
`../Gnosis/**` is a **process violation**, not a fix.

---

## 3. UPSTREAM-OWED items — the AGENTS.md item-7 rows (each: symptom · evidence · fix shape · target)

> **Evidence discipline.** The "Reproduction / evidence" cells cite **in-repo or sibling-repo
> symbols, route names, decision rows and section titles** — never a line number (the citation
> discipline this repo's catalog pins; `docs/specs/requirement-catalog.md` §3.4 rule 7). Where the
> evidence is a **reported** live reading, it is labelled a reading and not re-derived here (this pass
> has no shell).

### 3.1 O-1 — the durable store itself

- **Symptom.** The engine server's store is **in-memory**; nothing is written to disk, so an
  engine-owned corpus does not survive a restart.
- **Reproduction / evidence.** GR-7's row
  (`docs/feature-requests/gnosis-engine-feature-requests.md`, `## GR-7 — Server-side persistence for
  the engine store`): the server constructs `Store::new()` with only `--port` in the CLI and no
  persistence implementation; the **sibling** tracker confirms both the fact and the direction —
  `../Gnosis/docs/pending.md` (the `GR-7` row: *"The engine store is confirmed in-memory …"*, with the
  correction that there is **no persistence abstraction in the crate at all**) and
  `../Gnosis/docs/decisions.md` `ENGINE-DURABLE-CORPUS-DIRECTION` (**DIRECTION ONLY / NOT ACTIVE**;
  the user's 2026-09-16 answer in `../Gnosis/docs/pending.md`: **"Yes — schedule a durability design
  unit"**). The app-side pointer rows are `docs/HANDOFF.md`'s **O-7 pointer row** (quoting the parked
  `docs/pending.md` §"PARKED DESTINATION — the engine track" O-7 constraints cell: *"the engine has NO
  markdown parser, NO bulk route, NO progress contract, and NO persistence"*) and the gate record's
  `## 14. CONSEQUENCE TABLE` row **C-1**.
- **Proposed fix shape (engine-owned).** A durable store for the server (path/config via env or CLI)
  with load-at-boot, **atomic commit** (a failed write leaves the previous revision intact — no torn
  store) and documented **crash recovery**; the design unit's scope is the one the user approved
  (format / atomic commit / crash recovery / store-scope revision semantics).
- **Handoff target.** The Gnosis repo's tracker — the **durability design unit** the user scheduled in
  direction; the GR-7 request is its filed form. Also indexed in `docs/HANDOFF.md` (§13 row H1).

### 3.2 O-2 — the write/commit contract

- **Symptom.** Even once a store is durable, the app has no contract that says **what a committed
  write returns** (which revision/cursor the write produced), nor what a **failed** write leaves
  behind. Without it the client cannot make a write idempotent or report a durable commit to the
  operator or the agent.
- **Reproduction / evidence.** No commit-result shape exists on the document-CRUD wire (the client's
  typed results are `Document`/`DocumentList`/`Wiki` only — `src/main/engine-crud-rag-store.ts`
  `CrudResult`; the frozen wire is `../Gnosis/docs/specs/p1a-document-crud-wire.md`). The one
  wire-visible change token is the **change cursor**
  (`../Gnosis/docs/specs/engine-wire-contract.md` §4.6, pinned by `../Gnosis/docs/decisions.md`
  `GNOSIS-CHANGE-CURSOR`), and it is explicitly **process-lifetime monotonic**: cursors may repeat
  across restarts until a durable store exists, and a consumer **MUST NOT persist it across a restart**
  and compare it to the next process's cursor. The per-document `revision` remains the concurrency
  token (optimistic concurrency; `ConflictError` = 409).
- **Proposed fix shape (engine-owned).** A documented commit contract: the result of a committed write
  carries the assigned per-document `revision` and the commit's change token; a rejected commit
  carries a structured error and leaves the prior revision intact; and the contract states what the
  token **means across a restore** (this question is exactly GR-7's *"what a revision means across a
  restore"*, which the durability design unit owns).
- **Handoff target.** The Gnosis repo's tracker — the durability design unit (GR-7) for the
  restore-semantics half; `GNOSIS-CHANGE-CURSOR`'s owner for the cursor half. `docs/HANDOFF.md` §13
  row H1 carries it.

### 3.3 O-3 — the persistence self-report on the health surface

- **Symptom.** `/engine/status` reports `state` + six subsystem booleans and **says nothing about
  durability**. An `in-memory` engine and a durable one are **indistinguishable** to the app: the
  current engine reports `state: Ready` with `subsystems.store: true` while persisting nothing. Any
  gate the app builds on the existing report would **certify** an engine that loses the corpus.
- **Reproduction / evidence.** The app-side decoder is total over exactly six subsystem keys and no
  durability key (`src/main/engine-rag-store.ts` `decodeHealthReport`, whose `subsystems` loop is
  `store | graph | lexical | vector | embedding | reranker`); the wire contract's `HealthReport`
  (`../Gnosis/docs/specs/engine-wire-contract.md` `## 9. status.rs — health`) declares the same
  closed set; and the `state: Ready` + no-persistence combination is the live condition GR-7 records.
- **Proposed fix shape (engine-owned).** A **durability self-report** on the health payload — a
  top-level `durability` field with a closed value set the app can branch on, e.g.
  `'durable' | 'in-memory'` (and, if a store can be present-but-disabled, `'disabled'`), reported
  truthfully: an in-memory store must NOT report durable. **Additive** to the report (the app's
  decoder tolerates unknown keys — it reads the keys it knows and rejects none), so no existing
  consumer breaks.
- **Handoff target.** The Gnosis repo's tracker — the health-report owner (the wire contract's
  `status.rs` section) with the durability design unit as the co-owner (the report must reflect the
  store the design lands). `docs/HANDOFF.md` §13 row H2 carries it.
- **Why this item is load-bearing for THIS unit.** Without it, the app-side classifier (§4.1) has
  **no input** that can ever yield `healthy`, so the app can never open a wiki under the refusal
  contract — the unit would be spec-pinned but permanently unschedulable. **This is the
  single smallest upstream item that unblocks the app-side half.**

### 3.4 O-4 — bulk ingest with progress, cancellation and a cap

- **Symptom.** The engine has **no bulk/batch-atomic ingest route, no progress contract and no
  cancel**, so a corpus cannot be handed over as one atomic unit with observable progress.
- **Reproduction / evidence.** GR-6 (`## GR-6 — Bulk markdown ingestion with progress, cancellation
  and a cap`): no import/ingest route exists in the route list enumerated in GR-4; the shell's own
  semantics live in `src/main/markdown-import.ts` (`applyBatch`, `MAX_IMPORT_FILES = 512`) with the
  broadcast shape `ImportResultPayload` (`src/shared/types.ts`, `IPC_IMPORT_RESULT`) — **all
  shell-side**, with no engine equivalent (`docs/HANDOFF.md` O-7 pointer row;
  `docs/pending.md` §"PARKED DESTINATION — the engine track" O-7 cell).
- **Proposed fix shape (engine-owned).** `POST /import` accepting `{files:[paths]}` (server-fixed
  corpus root) or `{markdown:[{documentId, text}]}`, with the engine owning **parse + doc-flow
  validate + apply**; the whole corpus commits as **one journal entry or nothing**; a **cap** with a
  structured fail-loud result (`{ok:false, reason:"cap-exceeded", cap:N}`); **progress + cancellation**
  (chunked commits or an SSE progress stream) where **cancellation leaves no partial commit**; and a
  **document path/segment model** carried on ingest.
- **Handoff target.** The Gnosis repo's tracker — GR-6 (the parked destination). `docs/HANDOFF.md` O-7
  pointer row + §13 row H3.

### 3.5 O-5 — the markdown parse and the doc-flow validation on the engine

- **Symptom.** Markdown parsing and doc-flow validation exist **only in the shell**
  (`src/main/markdown-import.ts`, `src/main/doc-flow.ts`), so O-4's "the engine owns the PARSE + VALIDATE +
  APPLY" has no implementation.
- **Reproduction / evidence.** GR-6 item 1 ("with the engine owning the PARSE + doc-flow VALIDATE +
  APPLY"); `docs/HANDOFF.md` O-7 pointer row ("NO markdown parser"); the shell-side only surfaces
  named in §3.4.
- **Proposed fix shape (engine-owned).** The engine gains a markdown parser and a doc-flow validator
  whose accepted/rejected vocabulary is documented, reusing (and, where they disagree, **reconciling
  against**) the shell's pinned semantics — the shell's chunking/table/`RagNodeType` and doc-flow edge
  rules are the reference, not a thing to be guessed (`docs/specs/unit-t-markdown-import.md`,
  `docs/specs/module-feature-list.md`).
- **Handoff target.** The Gnosis repo's tracker — GR-6 (with O-4). `docs/HANDOFF.md` §13 row H3.

### 3.6 O-6 — the store-change notification route

- **Symptom.** With an engine-owned store the app has **no trigger** to re-traverse, so its rendered
  envelope goes stale with no contract.
- **Reproduction / evidence.** GR-5 (`## GR-5 — A store-change notification / subscription route`);
  the parked row `docs/pending.md` §"PARKED DESTINATION — the engine track" **O-8**; the
  `docs/HANDOFF.md` **O-8 pointer row**; the gate record's `## 12. THE READ MODEL` §12.7(e) (`DN-1`
  stays PARKED with its **GR-5** reason) and the catalog's §C.4 ledger row `PRUNE-805` (the ledger
  reading: **"an opaque change cursor rather than a revision"**).
- **Proposed fix shape (engine-owned).** Either a poll route or an SSE/WebSocket feed streaming
  `{kind, nodeIds, edgeIds, revision|cursor}` frames, **plus a documented staleness contract** (what a
  consumer may assume between a write and its notification) and a monotonic token per frame, with the
  cursor semantics of `../Gnosis/docs/specs/engine-wire-contract.md` §4.7 respected (cursor-first
  frame on every connection; frames may be lost; not a durable log).
- **Handoff target.** The Gnosis repo's tracker — GR-5. `docs/HANDOFF.md` O-8 pointer row + §13 row H2.

### 3.7 O-7 — the bulk projection read and the revision-vs-cursor adjudication

- **Symptom.** The app's derivation needs the whole store's nodes/edges/adjacency in one read, and the
  engine exposes **no bulk read**; the two sides also disagree about the coherence token (the app's
  seam was specced with a `revision` field, the engine refuses a revisioned projection and offers a
  process-lifetime cursor).
- **Reproduction / evidence.** GR-4 (`## GR-4 — A bulk read (projection) route for nodes + edges +
  adjacency`) — the shell's `buildTraversal` consumes `listNodes()`/`listEdges()` synchronously and the
  proxy implements only the retrieval trio + health; the **refusal** is `../Gnosis/docs/decisions.md`
  `GNOSIS-CHANGE-CURSOR` and `../Gnosis/docs/specs/engine-wire-contract.md` §4.6 ("**Refused
  alternatives:** `GET /snapshot?revision=…` and a `stale_revision` error are **REFUSED**"); the app's
  owed field is recorded by the gate record `## 14. CONSEQUENCE TABLE + RE-PLANNED FENCES` §14.4
  (`RagSnapshotPayload` carries `{store, nodes, edges}` today — **`revision` is OWED**) and by the
  catalog §C.4 row `PRUNE-804` (the inbound review "reframes the read as paginated cursor-tagged pages
  and refuses the revisioned-projection framing").
- **Proposed fix shape (engine-owned).** Settle the token question **once**: either a bulk projection
  route whose coherence token is the engine's real cursor (with the app-side cache requirement
  restated in cursor terms), or a documented position on why a revision is required, resolved with the
  consumer. Paginated cursor-tagged pages with a resume token are an acceptable shape if the resume
  behaviour of a not-comparable cursor is pinned (the engine's own contract already requires that).
- **Handoff target.** The Gnosis repo's tracker — GR-4 + the `GNOSIS-CHANGE-CURSOR` owner. The app's
  own re-scoping of the read model is **`U-READS-PIVOT`** (`## 13. THE APPROVED PROGRAM` §13.3), which
  owns the cursor-vs-revision reading; **this unit does not resolve it**, it records it as an open
  question (§4.3 item 4).

### 3.8 O-8 — the machine-caller authority contract

- **Symptom.** The app's document-CRUD path through the engine is refused with *"caller has no edit
  authority"*, and there is no **documented** contract for what a machine caller must present to be
  allowed to mutate — so a bulk ingest or an engine write cannot be provisioned from documentation.
- **Reproduction / evidence.** GR-9 (`## GR-9 — Mutating-surface authorization for a machine caller`),
  which also records that the engine re-scoped RBAC enforcement to the **shell** (the server decodes
  `caller` and threads it), so the request is for the **documented contract + structured denial code**,
  not for new enforcement; app-side, the mapping lives in `src/main/authority-store.ts` /
  `loadAuthorityMapping` (`src/main/main.ts`) with the caller threaded by
  `handleGnosisTool` (`src/main/mcp-server.ts`).
- **Proposed fix shape (engine-owned).** A documented caller/authority model per mutating route, what a
  service/machine caller presents, and a structured denial code — **documentation of the existing
  shape**, not new enforcement.
- **Handoff target.** The Gnosis repo's tracker — GR-9. **Informational for this unit** (it is a
  prerequisite for any engine write path, not for the app-side client seam); `docs/HANDOFF.md` §13 row
  H3 carries it as a dependency note, not as H1/H2's blocker.

---

## 4. The pinned app-side contract

### 4.1 The readiness classifier and the probe surface

**New exports (app-side, in the engine client seam — `src/main/engine-rag-store.ts` and/or a sibling
`src/main/engine-readiness.ts`; the module split is the Implementer's liberty, the NAMES and SHAPES
are pinned here).**

```ts
/** The four engine states the app distinguishes. CLOSED union, total. */
export type EngineReadiness =
  | 'healthy'        // reachable, state 'Ready', durability declared durable
  | 'not-ready'      // reachable, state 'Starting' | 'Degraded'
  | 'not-persistent' // reachable, state 'Ready', durability NOT declared durable
  | 'unreachable'    // no HTTP answer within the probe timeout

/** Why a durability-bearing state was reached (closed union; deterministic). */
export type EnginePersistenceCause =
  | 'durability-absent'    // the report carries no durability field  (THE CURRENT ENGINE)
  | 'durability-in-memory' // the report declares a non-durable store
  | 'durability-disabled'  // the report declares durability disabled

/** The probe result. Never throws for any of the four states. */
export interface EngineReadinessReport {
  readiness: EngineReadiness
  /** The HealthReport when one was decoded; null when unreachable or malformed. */
  report: HealthReport | null
  /** Present iff readiness === 'not-persistent'. */
  persistenceCause?: EnginePersistenceCause
  /** Present iff the engine answered but its answer was not a well-formed report. */
  malformedDetail?: string
}

/** The pure classifier — the ONLY place the four-state decision is made. TOTAL.
 *  The CALLER feeds it the transport outcome: a non-2xx response (the existing
 *  getEngineStatus throw path) is fed as 'transport-error' with a null report,
 *  so it classifies deterministically (not-ready) rather than unreachable. */
export function classifyEngineReadiness(input: {
  outcome: 'responded' | 'transport-error' | 'malformed-report'
  report?: HealthReport | null
}): EngineReadinessReport
```

**Probe methods (added to the `EngineRagStore` surface; the CRUD proxy gains the same two, delegating
to the same classifier):**

```ts
  /** ONE probe. Bounded by probeTimeoutMs. NEVER throws for a not-healthy state —
   *  it RETURNS the classified state. Throws only for an invalid construction. */
  readiness(opts?: { probeTimeoutMs?: number }): Promise<EngineReadinessReport>
  /** Poll `readiness()` until 'healthy' or the budget is exhausted.
   *  Resolves with the healthy report.
   *  REJECTS with EngineUnavailable | EngineNotPersistent (see §4.2 / §9). */
  waitForUsable(opts?: {
    pollIntervalMs?: number
    maxAttempts?: number
    signal?: AbortSignal
  }): Promise<EngineReadinessReport>
```

**The classification rule (pinned, ordered, total — first match wins):**

| # | Input | `readiness` | Notes |
| --- | --- | --- | --- |
| 1 | the fetch rejected (connection refused / timeout / TLS / DNS) | `unreachable` | `report: null`; the transport cause is preserved on the eventual throw (§4.2) |
| 1b | the response was a non-2xx status (the existing `getEngineStatus` shape: the transport path, **never** the classifier's decoder) | `not-ready` | `report: null`, `malformedDetail` set — the probe **does not invent** an HTTP-status reading of its own; the transport's own error/cause is preserved on the throw (§4.2) |
| 2 | the response was not a well-formed `HealthReport` (non-JSON body, wrong types, unknown `schemaVersion`/`idFormat`, the `lastError`-vs-state faithfulness rules violated) | `not-ready` | `report: null`, `malformedDetail` set — **a malformed report is NEVER `healthy` and NEVER `not-persistent`'s cause** |
| 3 | `report.state === 'Unavailable'` | `not-ready` | an engine that answers `Unavailable` is not absent — it is not ready for use |
| 4 | `report.state === 'Starting'` or `'Degraded'` | `not-ready` | `Degraded` is faithful (a non-null `lastError`); it is a gate, never an error to observe |
| 5 | `report.state === 'Ready'` and the durability signal is **absent** | `not-persistent` | `persistenceCause: 'durability-absent'` — **this is the engine's state today** |
| 6 | `report.state === 'Ready'` and the durability signal is `'in-memory'` | `not-persistent` | `persistenceCause: 'durability-in-memory'` |
| 7 | `report.state === 'Ready'` and the durability signal is `'disabled'` | `not-persistent` | `persistenceCause: 'durability-disabled'` |
| 8 | `report.state === 'Ready'` and the durability signal is `'durable'` | `healthy` | the only path to `healthy` |

**The durability signal (the pinned reading of the report — see O-3 for the upstream half):** the
report's **top-level `durability` field**, when present and a string. The reading is **fail-closed**:
**any value other than the exact string `'durable'` — including an unknown string, a non-string, or an
absent field — classifies as `not-persistent`.** A decoder that cannot parse the field must **not**
throw; it must classify. `HealthReport` gains an **optional** `durability?: string` field for the
typed shape; the decoder's existing unknown-key tolerance is the compatibility guarantee (it reads the
keys it knows and rejects none), so an engine that never adds the field stays decodable.

**Pinned non-behaviours.** `classifyEngineReadiness` performs **no I/O**, is **deterministic for a
given input**, **total** over its closed union (there is no fifth state and no default-to-healthy
branch), and **never throws**.

### 4.2 The typed failure classes (the refusal vocabulary)

**Reused (unchanged, from `src/main/engine-rag-store.ts`):** `EngineWireError`, `EngineUnavailable`
(503, causes `'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state'`),
`EngineError` (502), `TraceUnavailable` (502), `ConflictError` (409), `wireCodeToError`,
`ENGINE_HTTP_STATUS` (21 rows — **unchanged, not extended**).

**NEW — `EngineNotPersistent`** (a **client-side** class; it is **NOT** a wire code and must **not**
appear in `ENGINE_HTTP_STATUS` or `EngineErrorCode`):

```ts
export class EngineNotPersistent extends Error {
  constructor(
    readonly readiness: 'not-persistent',
    readonly cause: EnginePersistenceCause,
    message: string,
  ) { super(message); this.name = 'EngineNotPersistent' }
}
```

**NEW — the client-side error→readiness mapping (a total function; the refusal surface must be
decidable without string-matching a message):**

| Source | Produces | Refusal class |
| --- | --- | --- |
| `classifyEngineReadiness` → `not-persistent` | `EngineNotPersistent` | **the ruled refusal** |
| the probe's transport failure, **preserved verbatim from `transportError`/`fetchWithTimeout`** (`'connection-refused'` for a rejection or a timeout; `'engine-not-spawned'` for `ENOTFOUND`; `EngineWireError('engine_unavailable', 503)` for any other transport failure) | the same class the transport produced | refusal — **the probe's `unreachable` classification does NOT override the transport's own cause** |
| `classifyEngineReadiness` → `not-ready` for `'Starting'`/`'Degraded'` | `EngineUnavailable` (`'not-ready'`) | refusal |
| `classifyEngineReadiness` → `not-ready` for `'Unavailable'` | `EngineUnavailable` (`'unavailable-state'`) | refusal |
| a decoded wire `engine_unavailable` code | `EngineUnavailable` (`'unavailable-state'`) | refusal |
| any other wire code | `wireCodeToError` (unchanged, 21-row total) | fail-state, **not** a readiness refusal |

**Pinned discipline.** `EngineNotPersistent` **extends `Error`, not `EngineWireError`** — the wire
status map is a frozen 21-row contract and a client-side refusal must not appear to be an engine
status. A caller that catches `EngineWireError` therefore does **not** catch the persistence refusal:
**the refusal is deliberately its own class so no existing generic handler can swallow it into a
502/503** (§11's hostile-path obligation). A catch-all `Error` handler still sees it — which is why
§4.6 requires the state to be surfaced, not merely thrown.

### 4.3 Revision / consistency semantics (the app-side rules)

1. **The token the app compares is the engine's, never the app's.** The app may cache the last token
   it observed **in memory, for the process lifetime only**. It **must not** persist a token, and
   **must not** compare a token across a restart (`../Gnosis/docs/specs/engine-wire-contract.md` §4.6:
   a cursor may repeat after a restart; it is not point-in-time and not a validation token).
2. **Per-document `revision` is the optimistic-concurrency token** (`updateDocument`'s
   `baseRevision`). A `ConflictError` (409) is **never** auto-retried (§5.4).
3. **A committed write is only "committed" when the engine says so.** The app must not report a write
   as durable from a local echo, a cache, or a timeout — an unresolved write surfaces as an error
   (§5.5).
4. **OPEN QUESTION, recorded not resolved:** the cursor-vs-revision difference
   (`## 14. CONSEQUENCE TABLE` §14.4 pins it as "a recorded open question for `U-READS-PIVOT`'s spec,
   **not** a silent assumption"). This unit **reads** the engine's token as a cursor, pins the client
   side of that reading (item 1), and **assigns the adjudication to `U-READS-PIVOT` / O-7**. The app
   must therefore never *require* a revisioned projection in this unit's code.
5. **The app's own local store keeps its existing single-writer semantics** until the cutover
   (sequencing rule S1 — TEMPORARY AUTHORITY). This unit does **not** widen the local write path; it
   only pins when the engine write path must **refuse**.

### 4.4 The configuration surface

- **Resolution priority (unchanged, pinned):** (1) the **config seam** — the operator-owned
  `engineBaseUrl` in the engine config file (when set it wins), (2) the env var
  `PROVIDENT_ENGINE_BASE_URL`, (3) the documented default `http://127.0.0.1:8080`. The resolved value
  is enforced **loopback-only** at construction (a non-loopback baseUrl throws).
- **The config file:** `EngineConfig { engineBaseUrl: string | null }`, persisted to userData
  (`provident-engine-config.json`) through `createEngineConfigStore`. The **coercion rule** is pinned:
  only a non-empty (post-trim) string survives; anything else — `null`, `undefined`, a number, junk, a
  whitespace string — coerces to `null` = unset. A **missing or corrupt** file falls back to the
  default and **never throws** (a config read must not crash the app). A **write failure is
  non-fatal** and never crashes the app.
- **The engine's port is engine-side config**, not the app's: the app knows only the baseUrl. In the
  launcher path the port arrives as `GNOSIS_SERVER_PORT` (§6.5) and the baseUrl is exported by the
  launcher; the app's config seam still wins over the export (by design, `DECIDED:
  GNOSIS-LAUNCHER-TOGGLE`).
- **Timeouts (pinned defaults):** `requestTimeoutMs` 10 000; `readyPollIntervalMs` 500;
  `readyPollMaxAttempts` 60; **NEW** `probeTimeoutMs` 1 000 (per single probe); **NEW**
  `preflightTimeoutMs` 2 000 (the total budget a write-path pre-flight may spend). A probe that
  exceeds its timeout is `unreachable`, never `not-ready` and never `healthy`.
- **Credentials:** the auth/TLS seam (`auth.token`, `auth.tls.{ca,cert,key}`) is **unchanged** and
  **not** a config-file value here. `DECIDED: UI-CONFIG-CARRIER`'s rule that credentials are never
  serialized in operator settings stands; `engineBaseUrl` is config, **not** a credential.

### 4.5 The store ↔ wiki mapping

- **The mapping is a named decision surface, not an implementation detail.** The multi-store registry
  maps onto per-store engine wikis — the gate record's §3.1 pins that "mapping the registry onto engine
  wikis is O-8/O-7 work", and the existing wire has flat wikis (`createWiki`/`listWikis`; a wiki is a
  single-parent bucket) with a **single-string tag filter** — so a local directory tree cannot
  round-trip (`docs/pending.md` §DEFERRED, "Gnosis mapping for document directories (directory →
  `wiki`)").
- **Pinned for this unit:** (a) a store-qualified result is always carried with its store name (the
  registry's resolved name, the `RagSnapshotPayload.store` precedent), (b) **the mapping table is
  owned by `U-AUTHORITY-SWITCH`** (O-8) and by the deferred directory→wiki row, and (c) **this unit
  adds no mapping rule and no second mapping**. The app-side client must not invent a wiki per store:
  it sends the `wikiId` its caller supplies.
- **Pinned for the migration half:** the corpus to migrate is **226 documents / 6 102 nodes / 9 266
  edges** (`## 14. CONSEQUENCE TABLE` §14.1 C-1; `## 13. THE APPROVED PROGRAM` §13.3's
  `P2 U-CORPUS-MIGRATION` row) and the operator corpus must **not** be re-seeded
  (`O0_OPERATOR_DOCUMENTS = 226`). The migration unit is `U-CORPUS-MIGRATION`; this unit only records
  the number and the prohibition.

### 4.6 The operator-visible state

- **The four states are visible to a human** and are **typed** — the ruling retains the
  typed-failure obligation even though it reverses the identity clause (§11.3, "Consequences";
  `## 12. THE READ MODEL` §12.5 item 3, which names the `EngineUnavailable` class as the vocabulary
  and enumerates the forbidden outcomes: "an empty stage that looks like a document with no content; a
  `null` snapshot rendering the empty-state guard's '(no documents)'; a swallowed rejection; a spinner
  that never resolves").
- **The exposure surface (pinned, minimal):** the readiness classification is reachable through the
  **existing** operator surfaces — the `gnosis.status` read path (a read-only tool in the `gnosis`
  group, default-off) and the engine status pane's data path — carrying the **state name plus the
  persistence cause** when `not-persistent`. **No new MCP tool, no new tool group, no new capability
  token** is created by this unit (the gate record forbids creating a new capability/vocabulary token
  silently).
- **The UI carrier** for the warning is the `TAB-1` warning-symbol class as extended by the read
  model (engine-absent at tab-open) — that carrier is the owning UI unit's spec item, not this unit's;
  this unit pins only **what** must be visible and **that** it must be typed and non-silent.

---

## 5. The app-side degradation contract (the four states, and what each one DOES)

**The refusal is the rule (`## 11. USER RULINGS` §11.3, verbatim):** *"Refuse to open a wiki without
an engine. The app warns and does not open a wiki when no Gnosis instance can be found."* The
consequence is stated there in terms and is not softened here: **a user without the engine binary can
open NO wiki** (§11.3; `## 14. CONSEQUENCE TABLE` §14.1 row **C-8**).

| State | Detection | App behaviour | MUST NOT do |
| --- | --- | --- | --- |
| **S1 — UNREACHABLE AT BOOT** | `readiness()` → `unreachable` before a wiki/tab open | **Refuse to open the wiki.** Warn (typed). Keep the probe's bounded retry available to the operator. Local document surfaces are not opened. | read the local store as if the wiki were open; open an empty wiki; write anything locally; spawn an engine |
| **S2 — UNREACHABLE MID-SESSION** | `readiness()` → `unreachable` on a call after a healthy start | The already-rendered surface stays as rendered; **every engine-dependent call fails typed** (`EngineUnavailable`, `'connection-refused'`). The failure is **surfaced** (the tab/stage warning class), never silent. Re-entry requires a fresh probe. | silently re-read the local store; fall back to a local commit; retry a **mutating** call automatically (only `EngineUnavailable` on the two creates, within budget — §5.4); keep rendering stale data as if fresh without signaling |
| **S3 — PRESENT-BUT-NOT-PERSISTENT** (the engine's state today) | `readiness()` → `not-persistent` (durability absent / in-memory / disabled) | **REFUSAL with a typed reason: `EngineNotPersistent`.** Refuse the engine **write**. The engine **read** paths may be attempted but must be reported as non-durable-backed; the operator sees the reason. | **write locally as a fallback** (THE cardinal rule); treat `state: Ready` as sufficient; retry to "make it persistent"; swallow the refusal into a generic error; report the state as healthy in any surface |
| **S4 — PRESENT-AND-HEALTHY** | `readiness()` → `healthy` (state `Ready` **and** durability `'durable'`) | Engine calls proceed: reads, and (once the cutover units land) writes. The gate is re-evaluated **per call** — a healthy verdict is never cached across calls beyond the single call's pre-flight. | cache `healthy` for the process lifetime; treat one healthy probe as a durable guarantee for later writes |

### 5.1 The four pinned invariants of the refusal

1. **An unreachable engine never yields a silent success.** Every engine-dependent call either
   resolves with real data or throws/rejects typed. There is no "empty result" path standing in for
   an error.
2. **A not-persistent engine is refused, not written to.** The refusal happens **before** any local
   mutation, so the corpus is never written on the strength of an unverified engine.
3. **A refusal is never downgraded into a local operation.** The local write path
   (`IPC_EDIT_COMMIT` / `IPC_EDIT_BATCH` / `IPC_EDIT_RICH_COMMIT` → the local store) is **not** a
   fallback for an engine refusal in this unit. The refusal's remedy is a healthy engine, not a local
   write.
4. **The gate is total over the four states.** Every input classifies into exactly one state, and
   every state has a pinned behaviour — there is no fifth state and no unimplemented branch.

### 5.2 Where the refusal is enforced (the exact seam set)

- **On every engine call**: the readiness pre-flight precedes the call (§6.3).
- **On the MCP document-CRUD tool path** (`gnosis.document.*` / `gnosis.wiki.*` →
  `handleGnosisTool` → `engineCrudRagStore`): the mutating tools are the surface an agent uses; a
  refusal must reach the caller **typed** (§4.2) and the tool must not have mutated anything.
- **On the engine read path** (`gnosis.query` / `gnosis.status`): a `not-persistent` engine may serve
  reads, but the readiness classification travels with the answer's provenance (the operator/agent
  must be able to tell).
- **NOT on the app's local editing path in this unit** (S1: the local write path keeps its existing
  behaviour until `U-AUTHORITY-SWITCH`). **This unit does not move the local write path**; moving it
  is the cutover units' work, and doing it here would run two units over one contract regime
  (§13.2 S2).

### 5.3 The write path's pre-flight (the ordered check)

For any **mutating** engine call, in this order, and **no local write at any step**:

1. `readiness()` with `preflightTimeoutMs`.
2. `unreachable` → throw `EngineUnavailable('connection-refused')`. **Stop.**
3. `not-ready` → throw `EngineUnavailable('not-ready' | 'unavailable-state')`. **Stop.**
4. `not-persistent` → throw `EngineNotPersistent(readiness, cause)`. **Stop.** *(This is the step the
   engine's current state hits.)*
5. `healthy` → proceed with the call.

### 5.4 Retry / idempotency rules (what may and may not be retried)

| Operation | Retryable? | On what | Rule |
| --- | --- | --- | --- |
| `createDocument` (engine CRUD) | **YES — bounded, opt-in** (existing `retry.maxRetries`, default **0 = off**) | `EngineUnavailable` **only** | each attempt re-issues a **fresh** pre-flight + the **same** request envelope; a `requestId` (the existing idempotency seam) dedups a duplicate create |
| `createWiki` (engine CRUD) | **YES — bounded, opt-in** | `EngineUnavailable` **only** | as above |
| every other mutating call (`updateDocument`, `deleteDocument`, `publish*`, `unpublish*`,
`archive*`) | **NO** | — | never auto-retried: the request is not idempotent without an engine-side commit contract (O-2) |
| any call after a `ConflictError` (409) | **NO** | — | a conflict is a semantic outcome, not a transport failure |
| any call refused by `EngineNotPersistent` | **NO** | — | retrying cannot make an in-memory store durable; the remedy is an operator action |
| any read call | **NO** (no automatic retry) | — | a failed read is surfaced; the operator/agent decides |

**The ambiguous-commit rule (pinned).** A mutating call that **may have committed** but whose result
was lost (timeout / mid-flight transport drop) is **NEVER auto-retried** — the client cannot know
whether the write landed, and the engine's commit contract (O-2) is what would answer it. Such a call
surfaces typed; the operator re-checks via a read (observing the token per §4.3) before any manual
retry. **This rule is why the bounded retry is limited to `create*` and to the pre-commit failure
class.**

### 5.5 What the app must never do (the forbidden-outcome list, assertable as absences)

1. Write to the local store because the engine was unreachable or not persistent.
2. Return an empty/success-shaped result for a failed engine call.
3. Report a write as committed without the engine's answer.
4. Persist a change token across a restart and compare it.
5. Spawn, respawn or supervise an engine process from `src/**`.
6. Auto-retry a mutating call other than the §5.4 rows.
7. Cache a `healthy` verdict beyond the call it was taken for.

---

## 6. The readiness gate (what the app checks, the poll policy, and the launcher)

### 6.1 Why the gate cannot be "state == Ready"

`state: Ready` is **necessary and not sufficient**. The engine reports `Ready` while persisting
nothing (§3.3), which is precisely the condition the §14.1 C-1 consequence names. A gate built on
`state == Ready` alone would **certify** the corpus-loss condition. Hence: **the gate is
`Ready` AND a declared-durable store.**

### 6.2 The gate's inputs (the complete list)

1. **The health endpoint** — `GET /engine/status` returning the versioned `HealthReport`
   (schemaVersion / idFormat / state / version / subsystems / lastError), decoded by the existing
   total decoder, with the `durability` reading of §4.1 (**the O-3 upstream item**).
2. **The transport outcome** — whether the endpoint answered at all within `probeTimeoutMs`.
3. **The write probe — NOT used by this unit** (pinned so it is not invented later). A real
   write-then-read-round-trip probe is the only *proof* of durability, but it is **excluded here**
   because: (a) it requires an engine-side idempotent scratch-wiki/delete route the wire does not
   have; (b) it mutates the corpus's store; (c) it needs the authority contract (O-8 / GR-9); and
   (d) a probe failure would be indistinguishable from an operator-visible data defect. **A
   self-report + a typed refusal is the pinned design; a write probe is a future proposal, never a
   silent addition.**

### 6.3 The poll / backoff policy

- **One probe** = one `GET /engine/status`, bounded by `probeTimeoutMs` (1 000 ms default); its
  outcome is classified by §4.1's table. A probe **never** throws for a non-healthy state.
- **`waitForUsable`** polls with a **fixed interval** `pollIntervalMs` (default 500 ms) for at most
  `maxAttempts` (default 60) → a total budget of **30 s**, matching the existing `waitForReady`
  budget. **No exponential backoff is introduced** (a fixed interval is deterministic and testable;
  the launcher's own poll is 40 × 250 ms ≈ 10 s, §6.5).
- **Termination (pinned):**
  - the **first** `healthy` probe resolves immediately;
  - `waitForUsable` may keep polling through `unreachable` and `not-ready` (both are transient);
  - a `not-persistent` probe **terminates immediately** with `EngineNotPersistent` — polling cannot
    change a store's durability, so continuing would only delay a refusal;
  - budget exhaustion rejects: `unreachable` for the whole budget → `EngineUnavailable`
    (`'connection-refused'`); `not-ready` for the whole budget → `EngineUnavailable`
    (`'not-ready'`);
  - an aborted `signal` rejects with `EngineUnavailable` (`'not-ready'`, message naming the abort) —
    the abort is not a success.
- **Per call, not per process:** the pre-flight (§5.3) runs **per engine call**; `waitForUsable` is
  the **boot/open**-time entry point, never a cached process-wide verdict.
- **Bounded:** total probes for one `waitForUsable` call ≤ `maxAttempts`; the client holds **no**
  background/probe timer and performs **no** unrequested I/O at construction (the existing factories
  do no network I/O at construction, and that stays true).

### 6.4 The gate's failure UX (what the operator sees)

| Gate outcome | Operator-visible | Agent-visible (MCP) | Logged |
| --- | --- | --- | --- |
| `healthy` | nothing (healthy is silent, and only healthy is) | the real result | no |
| `unreachable` (boot) | the typed refusal + the engine baseUrl it probed | the tool's typed error | **yes** — one line naming the baseUrl and the cause |
| `unreachable` (mid-session) | the warning class on the affected tab/stage + the typed reason | the typed error | yes |
| `not-ready` | the typed reason (state name + `lastError` when Degraded) | the typed error | yes |
| `not-persistent` | the typed reason **plus the persistence cause** (absent / in-memory / disabled) and a statement that **the wiki is not opened** | `EngineNotPersistent` | **yes** — the loudest line of the four |

### 6.5 The launcher contract (`scripts/start-app.sh`) — the `GN-3` ruling

**The app must not spawn processes.** The `GN-3` ruling (§11.2, verbatim: *"The launcher
(`scripts/start-app.sh`) owns the spawn."*) is CONFIRMED, and the gate record's §3.2 B.3 clause 2 adds:
a shell-side spawn is a **new exec/argv security seam and its own gated proposal**. Pinned as a rule
for this unit: **`src/**` gains no exec surface** — the only `node:child_process` use in `src/`
(the ollama reachability probe in `src/main/embeddings.ts`) stays the only one.

**The launcher must, in this order:**

1. **DETECT** an already-running engine on the configured loopback baseUrl by probing
   `/engine/status`. A detection that answers is a **candidate**, not yet a verdict (§6.5 item 4).
2. **LAUNCH** only if no engine is detected: `"$GNOSIS_SERVER_BIN" --port "$GNOSIS_SERVER_PORT"`
   (default binary `$ROOT/../Gnosis/target/debug/gnosis-server`, default port 8080 = the app's default
   baseUrl target), then export `PROVIDENT_ENGINE_BASE_URL=http://127.0.0.1:$GNOSIS_SERVER_PORT` (the
   app's config seam still wins over this export — by design) plus the provider env
   (`GNOSIS_SERVER_OLLAMA_URL` / `GNOSIS_SERVER_OLLAMA_MODEL`) only where the caller left them unset.
   **At most one spawn attempt per invocation**, and no respawn after a death.
3. **HEALTH-POLL** until `/engine/status` answers (the existing shape: 40 attempts × 250 ms ≈ 10 s).
   **Every poll must probe the process the launcher itself started** (or the detected pre-existing
   engine); a poll answered by a **foreign** server is a **fail-loud** condition, not readiness —
   this is the `DEMO-ENGINE-START-GAP` class and the catalog's `PRUNE-362` row ("the launcher fails
   loud when the engine process it spawned died instead of reporting readiness from a foreign
   server").
4. **VERIFY DURABILITY** and **REPORT**: read the `durability` signal (§4.1) and print the readiness
   verdict (`healthy` / `not-persistent` / `not-ready`). **The default is
   `--require-durable=auto`: enforce it ONLY when the status payload carries a `durability` field.**
   An engine that declares `in-memory`/`disabled` → the launcher **reports it loudly and exits 2**
   (or, if the operator passed `--require-durable=off`, prints a loud warning and continues). An
   engine that carries **no** `durability` field (today's engine, until O-3 lands) → a **loud
   warning** (`durability unreported — the corpus is not durable`) and **continue**, because (a)
   failing there would refuse every wiki in the tree's current state, which is the boot-wide half the
   ruling explicitly leaves to `U-AUTHORITY-SWITCH` (§11.3, "What it does NOT decide", item 1), and
   (b) the app-side write path refuses on the same input anyway (§5). `--require-durable=on` is
   available for an operator who wants the hard gate now.
5. **EXIT CODES (pinned):** `0` — electron exited 0 with a verified-healthy or reported engine;
   **2** — a launcher-detected precondition failed (binary missing/not executable; no engine detected
   and no binary; the health poll timed out; a spawned engine declared non-durable under
   `--require-durable=on`, or under `auto` when the field is present); **any other value** — electron's
   own exit status, propagated. The spawned engine is killed after the app exits and the exit status
   is propagated.

**The launcher's own fail-loud rules (pinned):** the script must never report READY from a foreign
server; must never leave a spawned engine running after exit; must print the exact reason on the
failure path; and must change **no** JS/source contract (`DECIDED: GNOSIS-LAUNCHER-TOGGLE`).

---

## 7. §5.x Property register (PBT) — the client's invariants

**This is a code-bearing app-side unit, so the register is mandatory.** Rows are typed **P-IM**
(input-model), **P-SM** (state-model) or **P-TP** (transform) — NEVER F-rows, NEVER §8/§9 ids. **8
rows** (≤8 cap, no padding, no reserved-variant rows). Each row: the invariant, the generator/strategy
that exercises it, and its budget. The register is invariant-bearing (the gate's totality, the
refusal's non-fallback, the retry's idempotence, the classifier's determinism, the config's
fail-softness).

| Property-id | Class | Invariant | Strategy-id | Observable-as-property |
| --- | --- | --- | --- | --- |
| `P-IM-1` | IM | **The four-state gate is TOTAL and the precedence is ordered.** For **any** probe input over the three input kinds (a transport failure; a malformed report; a decoded `HealthReport` over the four `state` values × the four durability readings **{absent, `'in-memory'`, `'disabled'`, `'durable'`}** × the optional `lastError`), `classifyEngineReadiness` returns exactly ONE of the four `readiness` states, never throws, and follows §4.1's row order exactly (a transport failure is always `unreachable`; a malformed report is always `not-ready` and never `healthy`; `Unavailable`/`Starting`/`Degraded` are always `not-ready`; `Ready` + non-`'durable'` is always `not-persistent`; only `Ready` + `'durable'` is `healthy`). | `strat:readiness-classify-total` | ∀ input: exactly one `readiness` in the closed union; the returned state equals the §4.1 table's first-match row; no input yields a fifth state; `classifyEngineReadiness` never throws. |
| `P-IM-2` | IM | **Classification is deterministic and the persistence cause is a pure function of the report.** Re-running the classifier on the same input yields a deep-equal `EngineReadinessReport`; the `persistenceCause` is present **iff** `readiness === 'not-persistent'`, and equals the pinned cause for each of the three non-durable readings (absent → `'durability-absent'`; `'in-memory'` → `'durability-in-memory'`; `'disabled'` → `'durability-disabled'`); an **unknown** durability string, a non-string, and an absent field ALL classify `'durability-absent'` (fail-closed). | `strat:readiness-determinism` | ∀ input: `classify(input)` deep-equals `classify(input)`; `persistenceCause !== undefined ⇔ readiness === 'not-persistent'`; ∀ durability value ∉ {`'durable'`}: `readiness === 'not-persistent'`; an unknown/non-string/absent value yields `'durability-absent'`. |
| `P-IM-3` | IM | **The engine baseUrl resolution is a total, priority-ordered, loopback-safe function.** For **any** combination of (config-seam value ∈ {unset, whitespace-only, a loopback URL, a non-loopback URL}) × (env value ∈ {unset, empty, loopback, non-loopback}), the resolver returns the config value when the seam holds a non-empty post-trim string, else the env value when non-empty, else the documented default; and the factory REJECTS a resolved non-loopback baseUrl at construction. Config-file coercion is pinned: only a non-empty post-trim string survives; `null`/`undefined`/number/junk/whitespace → `null`; a missing/empty/corrupt file → the default, **never a throw**. | `strat:baseurl-resolution` | ∀ (seam, env): the resolved value equals the first non-empty source in priority order; a non-loopback resolved value throws at construction; ∀ junk coercion input: `engineBaseUrl === null`; ∀ corrupt file content: `get()` returns the default and the factory does not throw. |
| `P-SM-1` | SM | **No silent success, and never a local fallback.** For **any** engine-dependent call (each of the two proxies' methods) in **any** non-`healthy` state, the outcome is a rejection with a typed `Error` — never a fulfilled promise carrying an empty/success-shaped value — AND the client performs **no** local mutation: the app's local write surfaces (`IPC_EDIT_COMMIT`, `IPC_EDIT_BATCH`, `IPC_EDIT_RICH_COMMIT`) are never invoked, and no local store method is called, on any non-`healthy` path. | `strat:refusal-no-silent-success` | ∀ (method, non-healthy state): the call rejects with an `EngineUnavailable` \| `EngineNotPersistent` instance; the injected fake transport observes zero local-write calls; the resolved value is never a success shape. |
| `P-SM-2` | SM | **The gate is re-evaluated per call and the poll is bounded.** A call's pre-flight always issues a **fresh** probe, and no probe verdict is reused across two calls; `waitForUsable` performs at most `maxAttempts` probes over a whole call (counting the terminating probe), never continues past a `not-persistent` probe, resolves at the first `healthy` probe, and rejects with `EngineUnavailable` when the budget is exhausted. | `strat:gate-per-call-bounded` | ∀ (call sequence, scripted probe outcomes): the probe count per call equals 1 + (calls actually needed), ≤ `maxAttempts`; a second call issues a new probe; on a `not-persistent` outcome the probe count equals the count at that probe (no further probes); budget exhaustion rejects `EngineUnavailable`. |
| `P-SM-3` | SM | **Retry is bounded, class-restricted and idempotent.** `createDocument`/`createWiki` retry ONLY on `EngineUnavailable`, at most `maxRetries` **retries** (so at most `maxRetries + 1` attempts), each with a fresh pre-flight and a byte-identical request envelope; `maxRetries ≤ 0` performs exactly one attempt; every other method and every `ConflictError`/`EngineNotPersistent`/`EngineError`/`TraceUnavailable` outcome yields exactly **one** attempt; and an ambiguous-commit failure is never retried. | `strat:retry-bounded-idempotent` | ∀ (retry config, scripted outcomes): attempt count ≤ `maxRetries + 1` for the two creates; exactly 1 for every other case; every attempt after the first re-sends an equal encoded envelope (and carries the same `requestId`); zero attempts occur for a non-`EngineUnavailable` first failure. |
| `P-TP-1` | TP | **The refusal is typed, class-distinct and never downgraded.** Every non-`healthy` outcome of §5.3's ordered pre-flight maps to the pinned class: `unreachable` → **the class the transport produced, preserved verbatim** (an `EngineUnavailable` with cause `'connection-refused'` for a rejection/timeout, cause `'engine-not-spawned'` for `ENOTFOUND`, else `EngineWireError('engine_unavailable', 503)`) — never a raw `Error`, never a success; `not-ready` with `Unavailable` → `EngineUnavailable` (`'unavailable-state'`); `not-ready` otherwise → `EngineUnavailable` (`'not-ready'`); `not-persistent` → `EngineNotPersistent` (carrying its `cause`); and `EngineNotPersistent` is **not** an `EngineWireError` (so no `EngineWireError`-only handler swallows it) while remaining an `Error`. | `strat:refusal-class-map` | ∀ readiness state: the thrown class and its `cause` equal the pinned mapping; `instanceof EngineWireError` is `false` for `EngineNotPersistent` and `true` for every `unreachable`/`not-ready` outcome; both are `instanceof Error`; no refusal is returned as a value. |
| `P-TP-2` | TP | **The readiness report is a stable, round-trippable value.** For any `EngineReadinessReport` the classifier produces, structured-clone/JSON round-tripping preserves every field (`readiness`, `report`, `persistenceCause`, `malformedDetail`) — i.e. the report carries no functions, no class instances and no `undefined`-valued required field — and `report` is either `null` or a complete `HealthReport`. | `strat:readiness-report-stable` | ∀ report: `clone(report)` deep-equals `report`; `report.report === null || (its six subsystems + state + version + lastError are all present)`; no required field is `undefined`. |

**Class tally:** IM ×3, SM ×3, TP ×2 = **8 rows ≤ 8** ✔.

**Budget + determinism (the PBT gate's parameters):** deterministic pinned seed **`0xE9E9E9E9`** (the
unit's mnemonic), **≤100 generated cases per register row**, **≤400 total** across the unit's whole
property layer, **stop-after-5** (report at most 5 distinct held/broken counterexamples per row), and
each row recorded as **held** or **broken** together with its `Strategy-id`. The generators are
**fake-transport scripts** — an injected `fetch`/`sse` returning scripted responses — never a live
engine and never a real network call (§10).

**Reserved-variant discipline.** The four `EngineReadiness` states and the three
`EnginePersistenceCause` values are **closed**; the register adds **no** reserved fail-variant rows.
Generator restriction: **well-formed inputs only** for the classifier's invariants — a malformed
report is an **input class** of `P-IM-1`/`P-IM-2` (it must classify, not throw), never a generator
that violates the closed unions.

**The PBT audit (RCA-3, read-only, per row):** the adversarial reviewer reads this register against
the executed artifacts and audits per-row over-strength reasoning, generator coverage, prose
counterexamples and negative-generator requests. **Reviewers never run generators.**

---

## 8. Valid / happy-path states (the TestWriter red set)

1. **Factory happy:** `createEngineRagStore({ baseUrl, fetch: fake })` /
   `createEngineCrudRagStore({ baseUrl, fetch: fake })` return a proxy; **no network I/O at
   construction**.
2. **`healthy` classification:** a `HealthReport` with `state: 'Ready'`, a full six-key `subsystems`
   object, `lastError: null` and `durability: 'durable'` → `readiness: 'healthy'`,
   `persistenceCause: undefined`, `report` deep-equal to the decoded report.
3. **`not-persistent` classification — the engine's state today:** `state: 'Ready'` with **no**
   `durability` key → `readiness: 'not-persistent'`, `persistenceCause: 'durability-absent'`.
4. **`not-persistent` classification — declared in-memory / disabled:** `durability: 'in-memory'` →
   `'durability-in-memory'`; `durability: 'disabled'` → `'durability-disabled'`.
5. **`not-ready` classification:** `state: 'Starting'`; `state: 'Degraded'` with a non-null
   `lastError`; `state: 'Unavailable'` → all `not-ready` (the first two distinguishable by the
   report).
6. **`unreachable` classification:** the injected fetch rejects (`ECONNREFUSED`-shaped) →
   `readiness: 'unreachable'`, `report: null`.
7. **`malformed-report` classification:** a non-JSON body / a wrong-typed field / an unknown
   `schemaVersion` / an unknown `idFormat` → `readiness: 'not-ready'`, `report: null`,
   `malformedDetail` non-empty; a **non-2xx** response (the `getEngineStatus` throw path, fed as
   `'transport-error'`) likewise classifies `'not-ready'` rather than `'unreachable'`.
8. **`waitForUsable` happy:** scripted probes `unreachable, unreachable, not-ready, healthy` →
   resolves with the healthy report; probe count **4**.
9. **`waitForUsable` terminal refusal:** a `not-persistent` probe terminates immediately with
   `EngineNotPersistent` (probe count = the count at that probe; no further probes).
10. **`readiness()` non-throwing:** every one of the five outcomes of §4.1 returns a report — the
    method never throws for a non-healthy state.
11. **Write pre-flight happy:** a `healthy` pre-flight → the mutating call proceeds and the fake
    transport observes exactly the pinned request envelope.
12. **Retry happy (bounded):** `createDocument` with `retry.maxRetries: 2` and scripted outcomes
    `EngineUnavailable, EngineUnavailable, success` → resolves; **3** attempts; each attempt carries a
    fresh pre-flight and an equal envelope.
13. **Loopback happy:** `http://127.0.0.1:8080` and a loopback-resolving `localhost` baseUrl are
    accepted; a trailing-slash baseUrl is normalized.
14. **Config happy:** the seam value wins over the env var, which wins over the default
    `http://127.0.0.1:8080`; a persisted `engineBaseUrl` round-trips through
    `createEngineConfigStore`.
15. **Launcher happy (script-level, in a shell-bearing pass):** with a fake/real engine on the pinned
    port, the health poll succeeds, the verdict is printed, and the spawned engine is killed on exit
    with electron's status propagated.
16. **Operator visibility happy:** a `not-persistent` classification is reachable through the
    `gnosis.status` read path with its state + cause (no new tool, no new group).

---

## 9. Fail-states (FS ids) — the documented fail-states

Each fail-state names the **observable** and the **rule it violates**. Every FS is a **test row**, not
a prose note.

| # | Fail-state | Observable + rule |
| --- | --- | --- |
| **FS-1** | **The app opens a wiki with a `not-persistent` engine** | the opened wiki is named; **§5 S3 — the refusal is mandated** |
| **FS-2** | **A local write is performed because the engine was unreachable or not persistent** | the local write surface invoked + the payload are named; **§5.1 rule 2 / §5.5 item 1 — the cardinal violation** |
| **FS-3** | **A failed engine call resolves with an empty/success-shaped value** | the call and the value are named; **§5.1 rule 1 / §5.5 item 2** |
| **FS-4** | **A refusal is downgraded into a generic `EngineError` (502) / `EngineUnavailable` (503) instead of `EngineNotPersistent`** | the thrown class + cause are named; **§4.2 — the persistence refusal is its own class; §5.3 step 4** |
| **FS-5** | **`EngineNotPersistent` is added to `ENGINE_HTTP_STATUS`, `EngineErrorCode`, or the wire code set** | the added code row is named; **§4.2 — the 21-row map is frozen; the refusal is client-side** |
| **FS-6** | **`state: Ready` with no durability signal classifies `healthy`** | the input + the produced state are named; **§4.1 rows 5–8 — only `'durable'` is healthy; fail-closed** |
| **FS-7** | **A malformed report classifies `healthy` or `not-persistent`** | the input + the produced state are named; **§4.1 rule 2 — malformed is `not-ready`** |
| **FS-8** | **The classifier throws, returns a fifth state, or defaults to healthy** | the input and the throw/return are named; **§4.1 — total, deterministic, never throws** |
| **FS-9** | **A probe verdict is cached across calls (a stale `healthy`)** | the two calls and the reused verdict are named; **§5.3 / §6.3 "per call, not per process"** |
| **FS-10** | **`waitForUsable` polls past a `not-persistent` probe** | the probe sequence is named; **§6.3 — terminal refusal; polling cannot change durability** |
| **FS-11** | **`waitForUsable` exceeds its probe budget or polls unbounded** | the probe count and the budget are named; **§6.3 / §7 `P-SM-2` — bounded** |
| **FS-12** | **An aborted `waitForUsable` resolves as a success** | the abort + the resolution are named; **§6.3 — an abort rejects** |
| **FS-13** | **A mutating call other than the two `create*` methods is auto-retried, or any call is retried on a non-`EngineUnavailable` outcome** | the method + the retried outcome are named; **§5.4** |
| **FS-14** | **Retries exceed the configured budget, or an attempt re-encodes a different envelope** | the attempt count / the differing envelope is named; **§5.4 / §7 `P-SM-3`** |
| **FS-15** | **An ambiguous-commit failure (a possibly-committed write with a lost result) is auto-retried** | the call + the retry are named; **§5.4 the ambiguous-commit rule** |
| **FS-16** | **The engine baseUrl resolution ignores the pinned priority, or accepts a non-loopback address** | the resolved value + its source are named; **§4.4** |
| **FS-17** | **A corrupt/absent engine-config file throws, or a config write failure crashes the app** | the file + the throw are named; **§4.4 — fail-soft, never throws** |
| **FS-18** | **`src/**` gains a process-spawn / exec surface (spawning, respawning or supervising an engine)** | the added call site is named; **§6.5 + the `GN-3` ruling (§11.2); gate record §3.2 B.3 clause 2** |
| **FS-19** | **The launcher reports READY from a foreign server, or leaks a spawned engine after exit** | the launcher's report/leak is named; **§6.5 items 2–3; the `DEMO-ENGINE-START-GAP` / `PRUNE-362` class** |
| **FS-20** | **The launcher exits 0 on a hard precondition failure (binary missing, health-poll timeout, declared non-durable under `--require-durable=on`)** | the exit code + the condition are named; **§6.5 item 5's exit-code table** |
| **FS-21** | **An engine write is performed without a pre-flight, or the pre-flight's ordered steps are reordered/skipped** | the call + the skipped step are named; **§5.3** |
| **FS-22** | **A change token is persisted and compared across a restart** | the persisted token + the comparison are named; **§4.3 item 1 (the engine's §4.6 cursor discipline)** |
| **FS-23** | **A refused state is reported as healthy (or the operator-visible state is silent) on any surface** | the surface + the reported state are named; **§4.6 / §6.4 — typed and non-silent; §12.5's forbidden outcomes** |
| **FS-24** | **This unit edits `../Gnosis/**`, or files an engine gap as a code change instead of a handoff** | the edited path / the missing handoff row is named; **§2.4 + AGENTS.md item 7 — never patch the engine** |
| **FS-25** | **The app-side half claims durability from a green run** | the claim + its evidence are named; **§10 — no test at any layer in this repo can prove engine durability** |

**Not a fail-state (legal, and must not be flagged):** a `not-persistent` engine serving **reads** with
its provenance attached (§5.2); a bounded `create*` retry that exhausts and rejects (§5.4); a
`Degraded` report observed (observing is not an error — gating on it is the pinned behaviour); the
launcher emitting the `durability unreported` warning and continuing under the `auto` default (§6.5
item 4); the app's **local** write path still operating under the TEMPORARY AUTHORITY rule (§5.2,
S1) — that is the recorded gap, not a violation, until the cutover.

---

## 10. The unit process, the live-battery mandate, and the layer declaration

### 10.1 The process (AGENTS.md items 3/4/9/10; RCA-1/2/3/4/6/11/12)

1. **Spec first** — this file (landed before any code; the delegation gate, item 9).
2. **TestWriter red, REPORTED (RCA-1)** — the red set is written from §4–§9 + §7 **before any
   implementation**, and the red run is recorded in the unit's DONE row (e.g. "*TestWriter red: N
   failing (method does not exist)*").
3. **Implementer green** — least code; the app-side seam only.
4. **The trio** (item 4): `npm test`, `npm run typecheck`, `npm run build`.
5. **RCA-3 adversarial pass** (read-only, mandatory per unit): edge cases / unauthorized access /
   malformed inputs against the refusal surface; findings recorded in this spec's **§10.4** and each
   host finding fixed here + regression-tested.
6. **RCA-4 blind greens** by a non-author, from this spec + the `-greens.md` set **only**.
7. **Item-10d documentation review** (RCA-6, mandatory after the greens), record at
   `archive/reviews/<date>-unit-engine-persist-doc-review.md`, reconciling this spec's names,
   signatures, return shapes, throw patterns, census claims, cross-references and section numbers
   against the actual build — stale entries fixed **in the same pass**.
8. **One unit = one cycle** (RCA-2): this unit shares no inline run with `U-AUTHORITY-SWITCH`,
   `U-CORPUS-MIGRATION` or `U-READS-PIVOT`.
9. **The DONE row** states the **layer** (§10.3), the **recorded red set**, and the **contract regime**
   (§13.2 S2 + §14.5's temporary-authority gap).

### 10.2 The live-battery mandate (RCA-11) — and its honest limit

- The program classifies `P2 U-ENGINE-PERSIST` as **"engine-side (handoff) + any host-side client
  seam"** with **"live battery MANDATORY for the round-trip; the durability direction (`PRUNE-838`) is
  the upstream owner's"** (`## 13. THE APPROVED PROGRAM` §13.3). RCA-11 adds: **parking language may
  not be used for an exercisable surface**; only a **structurally non-exercisable** surface parks, with
  the recorded reason.
- **What IS exercisable and MUST be driven:** the **app-side** readiness/refusal behaviour against a
  real engine process on loopback — every one of the four states, including the **`not-persistent`**
  state the current engine actually produces, driven through the running app / the MCP surface
  (`scripts/live-drive.mjs` on a usable display), plus a **round-trip** attempt (write → restart the
  engine → read) that is expected to **FAIL TODAY** and is recorded as a failure of the **engine's**
  durability, never as a pass.
- **What cannot be exercised, and why the battery must say so:** the **durability** half is upstream
  and does not exist. The round-trip's `restart → same revision back` leg is **structurally
  non-exercisable** (the route/format/contract do not exist — O-1/O-2), so that leg parks **with that
  recorded reason** — never "no live session".
- **THE MANDATORY WORDING (pinned; the DONE row must carry it, one form or another, verbatim in
  substance):** *"A live green in this unit cannot prove engine durability. It can only prove the
  client's behaviour against a real (or faked) engine — that the four-state gate classified correctly,
  that the refusal was typed, and that no local write happened. The engine's durability is upstream-
  owed (§3.1–§3.2) and is unverified by anything in this repo."* A DONE row that claims durability, or
  that reports the green as "engine persistence verified", is **FS-25**.

### 10.3 The layer declaration (RCA-12, mandatory)

| Verification | The layer it covers | What it canNOT show |
| --- | --- | --- |
| the node suite + the §7 property layer (injected fake transport) | **MODULE-GREEN — main-process, pure** | nothing about the engine, nothing about the assembled app |
| the blind greens (from this spec only) | documentation ⇔ module behaviour | same as above |
| the live battery (§10.2) | **APP/LIVE-GREEN for the client's behaviour** against a real engine process | **engine durability** (upstream-owed) |
| the launcher checks (script-level) | **LAUNCHER-GREEN** (detect/launch/poll/report/exit) | the engine's own correctness |
| the handoff rows (§13) | **DOC-LAYER** (this repo) | anything at runtime |

**Never report "the engine persists" or "the app works" from a node green.** The app-side half is
MODULE-GREEN + LIVE-GREEN(client) at best; the durability half has **no** green available here.

### 10.4 Adversarial findings (RCA-3) — the register, to be filled by the adversarial pass

*(Section present and reserved: the mandatory post-green read-only adversarial pass records its
findings here — each as an id, the observed behaviour, the ruling (`FIXED HERE` for a host finding /
`HANDOFF` for an engine finding) and the regression test that pins it. A DONE row citing no
adversarial pass is a review finding.)*

### 10.5 Package/engine findings register (recorded, never patched)

*(Section present and reserved: any engine finding the adversarial pass raises is recorded here in the
§3 item-7 shape and handed off (§13) — **never** patched. The same rule the sibling specs' §3b applies
to `provident-ssr`.)*

---

## 11. Test plan (the red set the TestWriter will write)

- **The classifier (§8 rows 2–7, §9 FS-6..FS-8):** the four-state table verbatim, incl. the
  fail-closed durability reading and the malformed-report rule.
- **The probe surface (§8 rows 8–10, FS-9..FS-12):** `readiness()` for all five outcomes;
  `waitForUsable`'s happy walk, its terminal `not-persistent` refusal, its budget exhaustion and its
  abort.
- **The refusal contract (§8 row 11 + §5, FS-1..FS-4, FS-21):** the ordered pre-flight; the typed
  class per state; **zero local writes** on every non-healthy path (the §7 `P-SM-1` observable — the
  cardinal test of this unit).
- **Retry/idempotency (§8 row 12, FS-13..FS-15):** the bounded create retry, the non-retryable matrix,
  and the ambiguous-commit rule.
- **Configuration (§8 rows 13–14, FS-16..FS-17):** the priority order, the loopback enforcement, the
  coercion rule and the corrupt-file fail-soft.
- **The four-state degradation contract (§5, §8 row 16, FS-23):** each state's behaviour table row,
  incl. the `not-persistent` read-provenance rule.
- **The §7 PBT register:** 8 rows, seed `0xE9E9E9E9`, ≤100/row, ≤400 total, stop-after-5, each row
  recorded held/broken.
- **The launcher (§6.5, §8 row 15, FS-18..FS-20):** script-level assertions in a shell-bearing pass —
  detect-or-launch, the foreign-server fail-loud, the durability verdict, the exit-code table; plus the
  **host-side** assertion that no `src/**` exec surface was added.
- **The handoff rows (§13):** the presence + shape of the owed `docs/HANDOFF.md` rows (a doc-layer row
  check, not a runtime test).

---

## 12. Census / numeric claims

- **The split:** **APP-SIDE 9** deliverables (§2.1) · **UPSTREAM-OWED 8** items (§2.2) · **17** total.
- **The four-state gate:** **4** `EngineReadiness` values (`healthy`, `not-ready`, `not-persistent`,
  `unreachable`) — a closed union · **3** `EnginePersistenceCause` values
  (`durability-absent`, `durability-in-memory`, `durability-disabled`) · **1** path to `healthy`
  (`state: Ready` **and** `durability: 'durable'`).
- **The classification table:** **9** ordered rows / cases in §4.1 (incl. the non-2xx/`1b` row).
- **The typed failure classes:** **5** reused (`EngineWireError`, `EngineUnavailable`, `EngineError`,
  `TraceUnavailable`, `ConflictError`) + **1** new (`EngineNotPersistent`) = **6**.
- **`EngineUnavailable` causes:** **4** (`connection-refused`, `engine-not-spawned`, `not-ready`,
  `unavailable-state`).
- **The frozen wire-status map:** **21** rows (`ENGINE_HTTP_STATUS`) — **unchanged by this unit**, and
  **not extended** (FS-5).
- **The CRUD proxy surface:** **11** methods; **7** mutating, **4** read-only; **2** retryable
  (`createDocument`, `createWiki`).
- **The retrieval proxy surface:** **5** members (`ragQuery`, `ragStream`, `getEngineStatus`, `health`,
  `waitForReady`) + **2** new (`readiness`, `waitForUsable`) = **7**.
- **The poll policy:** `probeTimeoutMs` **1 000** · `readyPollIntervalMs`/`pollIntervalMs` **500** ·
  `readyPollMaxAttempts`/`maxAttempts` **60** → a **30 s** total budget; `preflightTimeoutMs`
  **2 000**; the launcher's poll is **40 × 250 ms ≈ 10 s**.
- **The launcher exit codes:** **0** / **2** (launcher precondition failure) / **other** = electron's
  propagated status.
- **The §7 register:** **8 rows** (IM ×3, SM ×3, TP ×2), seed `0xE9E9E9E9`, ≤100 attempts/row, ≤400
  total, stop-after-5.
- **Fail-states:** **25** FS ids (§9) — plus the pinned non-fail-state list.
- **The corpus figures this unit records (readings, not re-derived):** **226** documents / **6 102**
  nodes / **9 266** edges (`## 14. CONSEQUENCE TABLE` §14.1 C-1; §13.3's `U-CORPUS-MIGRATION` row),
  with `O0_OPERATOR_DOCUMENTS = 226` not to be re-seeded.
- **The suite reading this spec does NOT re-derive:** **221** files / **4 988** passed / **58**
  skipped / **0** failed (a reading at a named pass — `## 14. CONSEQUENCE TABLE` §14.3; this pass ran
  no shell).
- **Handoff rows owed:** **3** sections in `docs/HANDOFF.md` (H1/H2/H3) covering **8** owed items
  (§13).

---

## 13. The handoff artifact — the exact `docs/HANDOFF.md` rows this unit owes

**Rule (AGENTS.md item 7 + the gate record):** every engine item is a **handoff row, never a code
change**; the app repo **never patches the engine** (§2.4). Each owed row carries the item-7 fields —
**symptom · reproduction/evidence · proposed fix shape · handoff target** — and is filed as a request
indexed from `docs/HANDOFF.md`, following the **GR-1..GR-9 precedent** (a request doc indexed from
HANDOFF, **never** a package patch).

| Row | Title (as owed) | Covers | Fields to carry |
| --- | --- | --- | --- |
| **H1** | **`ENGINE-PERSISTENCE (O-7) — the durable store, its write/commit contract, and the durability direction`** | **O-1** (§3.1) + **O-2** (§3.2) | symptom (in-memory store; no commit-result contract); evidence (`../Gnosis/docs/pending.md` GR-7 row + `ENGINE-DURABLE-CORPUS-DIRECTION`; the app's O-7 pointer row; gate record §14.1 C-1); fix shape (durable store + atomic commit + crash recovery + a commit contract carrying the revision/token and stating its meaning across a restore); target (the Gnosis repo tracker — the durability design unit; GR-7's filed form); blocker (the user's direction is recorded but the unit is **NOT authorized to start**; the `SINGLE-WRITER-STORE`/O-8 amendment + a scheduled consumer unit are its stated gates); **do not patch** |
| **H2** | **`ENGINE-HEALTH/COHERENCE (O-7 leg) — the durability self-report and the store-change notification route`** | **O-3** (§3.3) + **O-6** (§3.6) | symptom (a `Ready` engine and a durable engine are indistinguishable; no change trigger ⇒ the app's envelope goes stale with no contract); evidence (the six-key subsystem set in the app's `decodeHealthReport` + the wire contract's health section; GR-5; `PRUNE-805`; §12.7(e)'s `DN-1` park); fix shape (an additive top-level `durability` field with a closed truth-telling value set; a poll or SSE change feed with a documented staleness contract and a monotonic token honouring the cursor discipline); target (the Gnosis repo tracker — the health-report owner + GR-5); priority note (**O-3 is the smallest item that unblocks the app-side half**); **do not patch** |
| **H3** | **`ENGINE-INGEST/READ/AUTHORITY (O-7 leg) — bulk ingest with progress + cap, engine-side markdown parse + doc-flow validate, the bulk projection read with the revision-vs-cursor adjudication, and the machine-caller authority contract`** | **O-4** (§3.4) + **O-5** (§3.5) + **O-7** (§3.7) + **O-8** (§3.8) | symptom (no ingest route/parse/validate/progress/cap; no bulk read; an unresolved token disagreement; no documented caller contract); evidence (GR-6, GR-4, GR-9; `PRUNE-804`; `GNOSIS-CHANGE-CURSOR`; the shell-side only `markdown-import.ts`/`doc-flow.ts`/`import-batch-persist` surfaces; the app's O-7/O-8 pointer rows); fix shape (per §3.4/§3.5/§3.7/§3.8); target (the Gnosis repo tracker — GR-6/GR-4/GR-9 + the cursor owner); **do not patch** |

**Also owed (the same pass, not a HANDOFF row):** `docs/feature-requests/gnosis-engine-feature-requests.md`
already carries GR-4..GR-9 — the H1..H3 rows **point at it**, they do not restate it. The `GR`
inventory stays the single indexed set the gate record's P1 row names ("the **GR inventory**
(GR-1…GR-9 as a single indexed set)"), and **O-3 (the durability self-report) is the one item with
no existing GR id** — the H2 row is therefore also its **GR-10 candidate**, filed as a documentation
request, and the ledger/`docs/defects.md` bookkeeping for it is owed by the landing pass.

**No `docs/defects.md` row is owed by this spec pass** — a gap against the **engine** is a handoff
(§2.4), and the app-side items here are unbuilt-by-design, not defects.

---

## 14. Cross-references (no line numbers — `path` + symbol / row id / `§section` only)

- **The gate record / the rulings:** `docs/specs/design-extensions-review.md` — `## 10. VERDICT +
  CONDITIONS + THE USER QUESTIONS` (§10.1 the verdict, §10.3 the four questions with their ANSWERED
  pointers, §10.4 the must-NOT-do list); **`## 11. USER RULINGS (2026-09-21)`** (§11.1 `GN-1`, §11.2
  `GN-3`/the launcher, §11.3 `GN-4`/the refusal, §11.4 `GN-2`, §11.5 the read model);
  `## 12. THE READ MODEL (tab-scoped cache)` (§12.5 failure UX + the forbidden outcomes, §12.6 what
  "persists" means, §12.7 the forced consequences incl. the REVERSED async-commit exclusion, §12.8 the
  re-scoped units); **`## 13. THE APPROVED PROGRAM (P0–P4)`** (§13.1 the phases incl. **P2**, §13.2
  the sequencing rules S1–S5, §13.3 the per-unit gate obligations incl. the `P2 U-ENGINE-PERSIST`
  row); **`## 14. CONSEQUENCE TABLE + RE-PLANNED FENCES`** (§14.1 C-1/C-8, §14.2 the fences, §14.3 the
  test-surface census, §14.4 the transport verification, §14.5 the temporary-authority rule);
  `## 15. STATUS`; `## 16. REPORT TO THE SUPERVISOR`. **Also:** `§3.2 B — the precedence architecture
  for GN-1…GN-4` (B.3 clause 2 — WHO SPAWNS) and `§3.3 C — the unit decomposition` (C12 `DN-1` parked
  on GR-5).
- **The upstream handoff:** `docs/HANDOFF.md` (head — the **"Do NOT patch the Gnosis repo from this
  project"** rule + the `provident-ssr`/`../Provident-Electron` sibling rule; the **O-7 pointer row**;
  the **O-8 pointer row**; the **§8 bookkeeping items 1+2 closed** note; the **GR-1..GR-9 handover
  document** paragraph) · `docs/feature-requests/gnosis-engine-feature-requests.md` — `## GR-4`
  (the bulk projection route), `## GR-5` (the notification route), `## GR-6` (bulk markdown
  ingestion), `## GR-7` (server-side persistence), `## GR-9` (the machine-caller authority contract),
  `## Appendix A` (how they were found) and `## Appendix B` (what the consumer will do).
- **The parked track + triggers:** `docs/pending.md` — **§"PARKED DESTINATION — the engine track
  (ARCH-GNOSIS-OFFLOAD O-6/O-7/O-8, 2026-09-16)"** (the O-6/O-7/O-8 rows, the **track trigger (a)(b)(c)**
  incl. "A CANDIDATE IS NOT A FIRED TRIGGER", the O-8 prerequisite clause and the sync-read park);
  the §DEFERRED row "Gnosis mapping for document directories (directory → `wiki`)"; the §PARKED row
  "Stored document-flow edges as a separate engine mechanism".
- **The sibling repo's record (read, never edited):** `../Gnosis/docs/pending.md` (the **GR-7** row —
  in-memory store, the "no persistence abstraction in the crate at all" correction, the user's
  **"Yes — schedule a durability design unit"** answer, the trigger set) · `../Gnosis/docs/decisions.md`
  (`ENGINE-DURABLE-CORPUS-DIRECTION` — DIRECTION ONLY / NOT ACTIVE; `GNOSIS-CHANGE-CURSOR` — the one
  wire-visible cursor, process-lifetime monotonic, and the REFUSED `GET /snapshot?revision=…` /
  `stale_revision`) · `../Gnosis/docs/specs/engine-wire-contract.md` (§4.6 the change cursor, §4.7 the
  `GET /changes` feed + its staleness/reconnect contract, `## 9. status.rs — health`, §11 the HTTP-status
  map, §12 golden vectors, §13 valid/fail states) · `../Gnosis/docs/specs/p1a-document-crud-wire.md`
  (the frozen document-CRUD shapes, §4.1.4 optimistic concurrency, §9 golden vectors V-10..V-12).
- **The app-side client contract this spec extends:** `docs/specs/unit-gn-engine-integration.md`
  (the retrieval trio + health proxy: §5.1 the factory + surface, §5.3 decode-then-validate, §5.4 the
  §11 map + `EngineWireError`, §5.6 READY observation + D2 engine-absent, §5.7 the register format) ·
  `docs/specs/unit-a1-crud-routing-proxy.md` (the 11-method CRUD proxy: §5.1 the factory + surface,
  §5.6 the READY gate + D2, §5.7 the register, §5.10's P4 retry/idempotency resolution) ·
  `docs/specs/unit-a2-document-crud-wiring.md` (the D4 wiring + the RBAC caller threading).
- **The app-side implementation the contract attaches to:** `src/main/engine-rag-store.ts`
  (`createEngineRagStore`, `EngineRagStore`, `EngineRagStoreOptions`, `HealthReport`,
  `decodeHealthReport`, `EngineUnavailable`, `EngineWireError`, `ENGINE_HTTP_STATUS`,
  `ENGINE_ENDPOINTS`, `waitForReady`) · `src/main/engine-crud-rag-store.ts`
  (`createEngineCrudRagStore`, `EngineCrudRagStore`, `EngineCrudRagStoreOptions`, `CrudResult`,
  `ENGINE_CRUD_ENDPOINTS`, the `retry` option) · `src/main/engine-transport.ts` (`assertLoopback`,
  `fetchWithTimeout`, `createEngineFetch`, `createCrudFetch`, `transportError`) ·
  `src/main/engine-config.ts` (`EngineConfig`, `EngineConfigStore`, `createEngineConfigStore`,
  `setEngineConfigBaseUrl`, `getEngineConfigBaseUrl`) · `src/main/main.ts` (`resolveEngineBaseUrl`,
  the boot-time construction of both proxies, `loadAuthorityMapping`, the local write handlers
  `IPC_EDIT_COMMIT`/`IPC_EDIT_BATCH`/`IPC_EDIT_RICH_COMMIT`) · `src/main/mcp-server.ts`
  (`handleGnosisTool`, the `gnosis.*` tool table, `gnosis.status`) · `src/shared/types.ts`
  (`RagSnapshotPayload`, `ImportResultPayload`, `IPC_IMPORT_RESULT`) ·
  `src/main/vector-boot.ts`/`src/main/vector-cache.ts` (the app's own persistence disciplines — the
  cold-load + write-through + prune precedence this unit reads but does not change: the vector cache is
  a **host-owned** store and stays host-owned, `## 11` §11.1 item 4).
- **The launcher:** `scripts/start-app.sh` (`--mode=gnosis`, `GNOSIS_SERVER_BIN`,
  `GNOSIS_SERVER_PORT`, `GNOSIS_SERVER_OLLAMA_URL`, `GNOSIS_SERVER_OLLAMA_MODEL`, the
  `PROVIDENT_ENGINE_BASE_URL` export, the health-poll loop, the kill-on-exit block) ·
  `DECIDED: GNOSIS-LAUNCHER-TOGGLE` (`docs/decisions.md`) · the defect class
  `DEMO-ENGINE-START-GAP` (`docs/defects.md`) + catalog `PRUNE-362`; and the launcher's durability
  default is amended by the gate record's §13 P1 launcher item ("the launcher's exact default …
  and the health-poll timeout/retry policy are the amendment row's own text").
- **The reversed / amended rows this unit reads:** `DECIDED: ENGINE-ABSENT-DEGRADED-CONTRACT`
  (REVERSED by §11.3) · `DECIDED: RAG-AUTHORITATIVE`, `DECIDED: SINGLE-WRITER-STORE`,
  `DECIDED: SINGLE-WRITER-STORE-PER-STORE` (SUPERSEDED by §11.1) · `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`
  (AMENDED) · the contract source of record `docs/specs/astrographer-scope-realignment-review.md`
  §3.3 (the WRITE PATH row — REVERSED) and §3.4 (superseded in substance by §11.3) · the catalog §C.4
  rows `PRUNE-829` (+ its §C.3 twin `PRUNE-361`), `PRUNE-805`, `PRUNE-804`, `PRUNE-838`.
- **The unit-spec conventions this file follows:** `docs/specs/requirement-catalog.md` (the contract
  shape: §3.x pinned contract, §4 the unit process, §5 FS ids, §6 the landing pass, §7 cross-refs,
  §8 census, §9 under-specified points) · `docs/specs/unit-o0-m1-m3-measurement-shape.md` (§5 register
  + §6 S/FS shape) · `docs/specs/user-flow-audit.md` (a zero-row matrix is an explicit recorded
  exemption, never a silent default — **not** applicable here: this unit carries a code seam and
  therefore owes the full 8-row register).
- **The missing skill file (recorded):** `docs/skills/designing-pages.md` — **absent from this tree**
  (only `docs/skills/process-guardrails.md` exists; the gate record's §15 records the same glob
  result). No test-use-case coverage matrix and no demo-page index exist to update.

---

## 15. Under-specified points this spec had to pin (the choice, and why)

1. **The durability signal's SHAPE and its failure direction.** The upstream item (O-3) does not exist,
   so the app must decide what "no signal" means. **Pinned: fail-closed — anything but the exact string
   `'durable'` is `not-persistent`, and an absent field is `durability-absent`.** *Why:* the alternative
   (absent ⇒ assume durable) is the corpus-loss condition in a different costume, and it is exactly the
   inference the §14.1 C-1 consequence warns against. The cost is explicit: **every probe is
   `not-persistent` until O-3 lands**, which is why O-3 is named the unit's smallest unblocker (§3.3).
2. **A write probe: REJECTED, and pinned as rejected (§6.2 item 3).** *Why:* it needs an absent
   engine-side scratch/delete route, it mutates the corpus, it needs O-8/GR-9, and it is
   indistinguishable from a data defect on failure. Stating the rejection prevents a silent addition.
3. **`EngineNotPersistent` is a NEW class extending `Error`, not `EngineWireError`.** *Why:* the 21-row
   wire-status map is frozen (an added "code" would be a wire contract change the app cannot make), and
   extending `EngineWireError` would let an existing generic handler swallow the refusal into a 502/503
   (FS-4). The cost: callers must catch `Error`, not `EngineWireError`, to see it — pinned as an
   obligation in §4.2/§4.6, not left to discovery.
4. **`waitForUsable` terminates on `not-persistent` instead of continuing to poll.** *Why:* polling
   cannot change durability, and a refusal that waits 30 s before refusing is a worse failure UX. The
   counter-argument (an operator might land O-1 mid-poll) is rejected: an engine swap mid-poll is a
   process restart, which invalidates the poll anyway (the token discipline, §4.3 item 1).
5. **The pre-existing `waitForReady` is NOT redefined.** *Why:* it has landed consumers and a landed
   spec (Unit GN §5.6 / Unit A1 §5.6); this unit adds `readiness`/`waitForUsable` beside it. A future
   unit may collapse them once nothing depends on the old one.
6. **The gate is `Ready` AND declared-durable; `Degraded` is a refusal, not an observation.** *Why:*
   the landed specs already gate CRUD/query calls on `state == Ready` and treat observing `Degraded` as
   legal (Unit A1 §5.6). This unit does not change that; it **adds** the durability conjunct, which is
   the whole point.
7. **`--require-durable=auto` is the launcher's default, not `on`,** and the boot-wide refusal is
   **left to `U-AUTHORITY-SWITCH`.** *Why:* the ruling explicitly does **not** decide whether the
   refusal is boot-wide or per-wiki/tab-open (§11.3, "What it does NOT decide", item 1); a launcher
   default of `on` would decide it by accident, and it would refuse every wiki in the tree's current
   state. The chosen default keeps the **report** mandatory and the **decision** deferred — never
   silent.
8. **The refusal is enforced at the engine-call seams, NOT by disabling the app's local write path.**
   *Why:* the local path's authority ends at `U-AUTHORITY-SWITCH` (S1); disabling it here would run two
   units over one contract regime (S2) and would strand the operator with **no** write path at all.
   The consequence is stated plainly rather than hidden: until the cutover, the local path is the
   TEMPORARY AUTHORITY and the engine path refuses (§14.5's recorded gap).
9. **The operator-visible state rides EXISTING surfaces (no new tool/group/capability token).** *Why:*
   the gate record forbids creating a new capability or vocabulary token silently, and the §5.U matrix
   is full at 8; a new surface would need both.
10. **The §4.5 store↔wiki mapping is deliberately NOT pinned here.** *Why:* the gate record assigns it
    to O-8/O-7 (`U-AUTHORITY-SWITCH`) and the directory→wiki row; pinning a mapping now would create a
    second mapping authority before the first exists. What is pinned is only the invariant the client
    needs: the store name travels with the data, and the client invents no wiki.
11. **The suite/test counts in §12 are READINGS, not claims.** *Why:* this pass ran no shell
    (the gate record's §14.3 census rule) and the numbers move per pass; a spec that "confirmed" them
    would be the staleness RCA-6 exists to catch.
12. **The live battery's split (drivable vs structurally non-exercisable) is stated in the spec, not
    decided later.** *Why:* RCA-11's failure mode is parking-by-default; naming the exercisable half
    here makes the park legible and the failure mode impossible to launder.

---

## 16. What this spec does NOT do (constraints honored)

- It writes **ONE file** — this spec. It does **not** author implementation, tests or the property
  layer (the TestWriter does, from §4–§9); it does **not** touch `src/**`, `tests/**`, `scripts/**` or
  any tracker.
- It does **not** patch, edit or generate code in **`../Gnosis`** (§2.4) — every engine item is a
  handoff row (§13).
- It does **not** write the tracker rows the unit's landing pass owes (the `docs/HANDOFF.md` H1..H3
  rows, the `docs/pending.md`/`docs/decisions.md`/`docs/defects.md`/`docs/next-steps.md` rows, the
  `U-ENGINE-PERSIST` DONE row) — they are **owed** and recorded in §13 (owed to that pass, not
  discharged here).
- It does **not** supersede, reverse or amend any decision row; the rows named in §14 are the **gate
  record's** rulings, cited, and their supersession/amendment rows remain the P1 landing pass's work.
- It does **not** resolve the cursor-vs-revision question (§4.3 item 4 — `U-READS-PIVOT`/O-7 owns it),
  the store↔wiki mapping (§4.5 — `U-AUTHORITY-SWITCH`), or the boot-wide-vs-per-wiki refusal question
  (§11.3 — `U-AUTHORITY-SWITCH`).
- It does **not** claim any green: **not app-green, not envelope-green, not store-green, not
  live-green, and above all not engine-green.** No test this unit can run proves that the engine
  persists anything (§10.2).
- It does **not** create a new MCP tool, tool group, capability token or §5.U matrix row (§4.6).
- It does **not** add an exec/spawn surface to `src/**`, and it restates the rule that doing so is a
  new gated proposal (§6.5; §11.2).
