# Unit `U-STAGE-ACTIVE-TAB` — tab ownership + the stage-display invariant (the V1–V6 fix) — Spec

**Status: SPEC — authored 2026-09-22. NO CODE LANDED.** **⟨A.1 — AMENDED 2026-09-22: the §8.2 red
set has since been RUN and REPORTED; the Implementer refused two unsatisfiable rows and re-entered
this file as an amendment (the §7.4 route). See §A.1 for the two adjudications, the `destroyRoot`
contract and the V5 non-finding; the superseded sentences below are marked in place, never
deleted.⟩** This file is the contract
only. Nothing here authorizes a build: the delegation gate (`AGENTS.md` item 9) is satisfied by
**this file plus a TestWriter red set that has been RUN and REPORTED** (RCA-1). Derived from the
read-only audit `archive/reviews/2026-09-22-tab-page-ownership-audit.md` (its §2.2 V1, §2.3 V2,
§2.4 V4, §2.5 V5, §2.6 LIVE-UF9, §3.1 V3, §3.2 V6, §4.1 the node red candidates R1–R7, §4.2 the
live-only table, §5 the priority order) — that audit is the **source of record for every defect
below**; this spec turns it into a contract. No `src/**`, `tests/**`, or tracker file was edited by
this pass (the supervisor owns the tracker rows).

**Layer (RCA-12, mandatory declaration).** `HOST/RENDERER` (the renderer host's mount/derive
ordering and its ownership key) **+ `ENVELOPE`** for exactly one row (the page-edit surface's
authoring input) **+ `ASSEMBLED/RENDERER` for every rendered claim.**
**Nothing in this unit is APP-GREEN from a node-suite green** (`docs/specs/rca-live-bugs-green-pipeline.md`
§3): the dom-shim is layout-less, so the painted stage identity, the real `rag.query` IPC latency
that opens V1's race, and the real broadcast ordering for V2 are **structurally unassertable in
node**. The node red set proves the **host ordering + the ownership key**; only the live battery
proves the **rendered** invariant.

**Contract regime (S2, `docs/specs/design-extensions-review.md` §13.2).** This unit declares the
**local-authoritative / pre-P2 regime** — the same regime the shipped host is in today. It is a
**HOST-side fix inside the existing contract**: it changes no store interface, no wire shape, no
engine call, no MCP tool, and it does **not** pre-empt the P2 `U-READS-PIVOT` gate
(`docs/specs/unit-reads-pivot-tab-cache.md`, phase **P2** — `docs/next-steps.md` §P2 item 4).

**Authority read this pass (specs):** `docs/specs/unit-u-shell-9a-main-focus-tabs.md` (§2.3
single-active render, §2.9 pin 6, §2.10 HOST-1 + the deferral caveat, §4 F4/F5, §5.7 register,
§6), `docs/specs/unit-reads-pivot-tab-cache.md` (§2.2 the composite key, §2.3 the tab-owned
predicate + the residency call-path table, §5.1 the lifetime rules, §5.2 the bound, §7 register,
§8.1 `FS1`–`FS22`, §8.3 the live mandate, §8.4 the fence), `docs/specs/design-extensions-review.md`
(§3.5 E the `C10`/`TAB-1`/`TAB-2` class, §11.3 `GN-4`, §11.5 the read model, §12.2–§12.5,
§13.3 per-unit gate obligations), `docs/specs/ui-overhaul.md` (§1 C14, §3 the C14 pin),
`docs/specs/unit-u-shell-9b-cross-document-shared.md` (§2.1, `BLOCKED on U-STATE-1e`),
`docs/specs/unit-u-edit-1-whole-page-editing.md` (§2.1 the single surface, §3.5 item 6, §8.1
`FS1`/`FS17`), `docs/specs/user-flow-audit.md` (§2 §5.U delta-matrix, §3 §6.1 schema, §4 §6.2
audit), `docs/specs/live-user-flow-scenarios.md` §9, `docs/specs/requirement-catalog.md`
(fact 3 the oracle identity, §3.4 rule 7 the citation discipline), `docs/specs/rca-live-bugs-green-pipeline.md`
§3, `docs/defects.md` row `LIVE-UF9 SEARCH-OPEN-IN-TAB-SHOWS-DOC`.
**Authority read this pass (code):** `src/renderer/sidebar-panes.ts`, `src/renderer/tab-strip.ts`,
`src/renderer/tab-state.ts`, `src/renderer/renderer.ts`, `src/renderer/pane-graph.ts`,
`src/renderer/edit-controller.ts`, `src/renderer/content-reconcile.ts`,
`scripts/live-drive.mjs`, `tests/unit-u-shell-9a-main-focus-tabs.test.ts`.

**Citation discipline (recorded honestly, and it is a deliberate departure).** This repo's specs are
normally cited **symbol-first** (never a line number — `docs/specs/requirement-catalog.md` §3.4 rule
7), and that is the convention for every cross-reference **below**. This spec additionally carries
**readings with a `path:line` proof** for its census claims, because the task for this unit requires
them; each is marked `[reading]` and is **a proof of the state of the tree at `2026-09-22`, not a
stable address** — a doc review must **recount** it against the tree, never copy it. Every
`path symbol` / `path §section` reference below is stable by contrast.

---

## 1. What this unit asks

Two invariants, asked of the shipped shell by the user: **(I1)** that cached per-page state is
**owned by the tab**, and **(I2)** that the central stage **always displays the page owned by the
active tab**. The audit found I1 `VIOLATED` (for the state that exists) and I2 `VIOLATED`, with six
named violations; this unit fixes all six **without** building the P2 tab-scoped cache.

1. **V1 — a stale async search mount overwrites a newer active tab's stage.** `mountTab` for a
   `search` target calls `void this.mountSearchStage(entry)` **unguarded** `[reading]
   src/renderer/sidebar-panes.ts:734-739`, and `mountSearchStage` applies
   `applyStageBody(searchTabContent(...))` **after** `await this.bridge.rag.query(...)` with no
   re-check `[reading] :1026-1048` (the apply is `:1047`). The de-dupe key
   `mountedStageKey = JSON.stringify(entry)` `[reading] :725` only suppresses an **identical**
   entry, so a newer mount is never protected from an older completion. **Measured wrong state:**
   active tab `t2/doc-b`, stage showing `#stage-search-tab` + `#search-tab-input`, `data-edit-surface`
   absent.
2. **V2 — a content re-derive while a non-document tab is active re-materializes a FOREIGN document
   body (and its edit surface).** `onRagStoreChanged` → `requestRebuild('content')` `[reading]
   :2026-2057` (the request at `:2056`) → `renderer.ts` `onRebuild` `[reading] :948` →
   `reDerive('content')` `[reading] :1910` → the `_currentDocumentId`-scoped branch `[reading]
   :1960-1972` (the ids at `:1960-1965`, the envelope at `:1970-1972`) → `applyContentChange`
   `[reading] :1484-1543` (the scope at `:1514`, the reconcile apply at `:1524`), and
   `assembleAppGraphEnvelope` is handed `documentId: this._currentDocumentId` `[reading] :1501`.
   `_currentDocumentId` `[reading] :451` is only ever **set** by `mountDocumentStage`
   `[reading] :1019` and is **never cleared** by a non-document mount `[reading] :736`, `:741`.
   **Measured wrong state:** `search-body=true ALPHA=true surface=doc-a` while the active tab is a
   search tab.
3. **V3 — the page-commit subject is the DOCUMENT id, not the TAB id.** `pageEditSurfaceHandlerSubject()`
   returns `this._currentDocumentId ?? PAGE_EDIT_SURFACE_ID` `[reading] :3138-3140`, and that subject
   is what `markDirty`/`isDirty`/`commit`/`pageCommitFailure.has/set` receive `[reading] :3164-3179`
   plus the re-derive caret restore `[reading] :2006-2007`. Two tabs on one document therefore share
   **one** dirty flag, **one** failure record and **one** caret slot; `restoreCaret` is additionally
   dead because its guard checks the subject against `backRefs` keyed by **ragId**
   `[reading] src/renderer/edit-controller.ts:188-191`. The tree's own doc comments state the
   **opposite** contract (tab-keyed) `[reading] sidebar-panes.ts:636-639`, `:3130-3133`,
   `:3142-3146`, `edit-controller.ts:85-92` — a documentation-drift finding in its own right
   (`AGENTS.md` item 10d).
4. **V4 — the page-edit surface is never authored on a non-document tab**, because
   `surfaceBodyRoots` collects only roots carrying `data-rag-node-id` `[reading]
   src/renderer/pane-graph.ts:1377` and the surface is authored only when that list is non-empty
   `[reading] :422-429`; `applyStageBody` `[reading] sidebar-panes.ts:1052-1060`, `landingContent`
   `[reading] :1239-1269` and the parked placeholder `[reading] :748` author no such root. The
   caret-restore path then targets a missing `#page-edit-surface` `[reading] :2009`.
5. **V5 — `refresh()` reloads the RAW traversal envelope, not `loadAppGraph`'s assembled form.**
   `[reading] :1736-1764` (the reload at `:1757`) — so on a **document** tab the
   `#page-edit-surface`/`#editor-toolbar` authored by `loadAppGraph` (`applyEditorToolbar` at
   `:1462`, `:1508`) silently vanish; on a non-document tab the tab's own body survives only by the
   luck of envelope shape.
   **⟨A.1.5 — WITHDRAWN: V5 is a recorded NON-FINDING; the sentences above are kept as the
   superseded finding. Measured on this tree, `refresh()` reloads through `loadAppGraph`
   (`sidebar-panes.ts:1783-1785`) and `#page-edit-surface` + `#editor-toolbar` survive it. V5 leaves
   the fix order; `refresh()` gets no code change.⟩**
6. **V6 — `mountTabs` mounts ALL document bodies simultaneously**, contradicting 9a §2.3's
   single-active render, and has **no production caller**: `mountTabs` `[reading] :759-774`
   (`mountedStageKey = null` at `:771`, `applyDocumentSet(...)` at `:773`); the audit's `grep` over
   `src/`, `scripts/` and `dist/renderer/renderer.js` found **definition + comments only**. (It **is**
   called by the 9b test suites — see §5.7.)

**Also fixed by this unit (a tracker scope, not a code change):** the `docs/defects.md`
`LIVE-UF9 SEARCH-OPEN-IN-TAB-SHOWS-DOC` row is **STALE as written** — its steady-state symptom no
longer reproduces on this tree (`archive/reviews/2026-09-22-tab-page-ownership-audit.md` §2.6;
`docs/specs/live-user-flow-scenarios.md` §9), and its named suspect `paneTabExpand` is in fact the
unrelated zone **minimize** toggle `[reading] sidebar-panes.ts:2804-2809`. The audit's verdict: the
row is **re-scoped to V1, not closed**. This unit owns the re-scope; the **tracker edit itself is the
supervisor's this pass** (recorded here as `FS-9`, below).

**What this unit is NOT.** It is **not** the P2 `U-READS-PIVOT` tab-scoped read cache: it builds no
cache module, no `TabCacheKey`/`CacheKind`/`residentKeys`, no `MAX_RESIDENT_*` bound, no typed
`CacheMiss`, no tab-open fetch, and no loading/warning tab state (`docs/specs/unit-reads-pivot-tab-cache.md`
§2/§3/§4/§5 are untouched). It is **not** the `U-SHELL-9b` simultaneous multi-document render or
C20/Option-C (9b is **BLOCKED on U-STATE-1e**) — `mountTabs` therefore stays **unreachable from
production** (§5.7). It changes no `RagStore` member, no wire shape, no MCP tool, and no
`OperatorSettings` slice.

---

## 2. Feasibility verdict

**FEASIBLE — entirely within the renderer host, with one envelope-layer row.**

- **V1** is a **generation stamp + an identity re-check after the await** — a handful of lines inside
  `mountTab`/`mountSearchStage`, with the host field the audit names (`activeTabId`) as the identity
  to compare against. No new async surface, no ordering assumption beyond "the last mount attempt
  wins".
- **V2** is a **scope gate on the re-derive**: `reDerive`/`applyContentChange` consult
  `activeTargetKind` instead of `_currentDocumentId` when deciding whether to materialize a document
  root or author a surface. The reconciler (`src/renderer/content-reconcile.ts`) and the assembler
  (`assembleAppGraphEnvelope`) are each self-consistent today; the defect is the **stale
  `documentId` the host hands them**.
- **V3** is a **key-substitution** at four call sites plus one controller guard
  (`edit-controller.ts`'s `restoreCaret` `backRefs` check), with one new **optional**
  `EditControllerOptions` hook so the controller can validate the **page subject's document**
  instead of the subject itself. The `carets` map, the `dirty` set and the host's
  `Map<tabId, failure>` already have the right **shape** (`Map`/`Set` keyed by one string) — only the
  key's **value** changes.
- **V4** is the **envelope** row: the surface is authored from the assembler's input
  (`input.documentId` + `surfaceBodyRoots`), so "no surface on a non-document tab" is decided by the
  host passing `documentId: undefined` — pinnable at the envelope layer, unlike V1/V2.
- **V5** is a **two-line** change in `refresh()` (reload through `loadAppGraph`, and do not reload a
  document traversal while the active target is not a document).
  **⟨A.1.5 — SUPERSEDED: no such change. V5's premise is a recorded NON-FINDING — `refresh()`
  already reloads through `loadAppGraph` (`sidebar-panes.ts:1783-1785`), which authors the toolbar
  (`:1489`) and the surface (the assembler's `documentId`, `:1476`), and both survive.⟩**
- **V6** is a **reachability pin**, not a deletion (deleting it would re-derive three 9b suites and
  pre-empt the blocked 9b wave — see §5.7).

**No blocker, no unbuilt dependency.** `_currentDocumentId` is a `private` field on a class whose
instance type is the unit's own seam, so widening it with `activeTabId`/`activeTargetKind` is
additive and does not touch a `.d.ts`-frozen surface. The one **new** optional
`EditControllerOptions` member is additive and total (absent ⇒ legacy behaviour).

**Risk: LOW-to-MEDIUM.** Low because every change is inside one host module + one controller guard,
and 6 of the 7 register rows are pure/host-assertable in node. Medium because **two of the three
violations (V1, V2) are only provable against the assembled app** (RCA-12): the node red set can pin
the ordering and the key, but a node green must never be reported as app-green — hence the **mandatory
live battery** (§8.3).

---

## 3. Gaps + costs / benefits

**Gaps this unit closes** (each is a live, reproducible wrong rendered state on the shipped shell):

| # | Gap | What it costs the operator |
| --- | --- | --- |
| V1 | stage shows another tab's page after an async mount completes | the document just opened cannot be edited (surface gone) — the exact class `RCA-11` was written for |
| V2 | a broadcast injects a foreign document body + a foreign edit surface into a non-document tab | the operator can commit a document from a tab that does not own it |
| V3 | one dirty flag / failure record / caret per **document**, shared by two tabs | typing in one tab marks the other dirty; a tab is never individually dirty; the page caret never restores |
| V4 | no page-edit surface on a non-document tab | the `U-EDIT-1` §2.1 surface contract is unsatisfied in a state the shell actually reaches |
| V5 | `refresh()` loses the surface/toolbar on a document tab **— ⟨A.1.5: SUPERSEDED, V5 is a recorded NON-FINDING; no cost (the surface/toolbar survive today)⟩** | a gnosis-pane refresh silently removes the editor **— ⟨A.1.5: NOT REPRODUCED⟩** |
| V6 | a public multi-mount seam contradicts 9a §2.3 | none today (no caller) — a latent violation, recorded not raised |

**Gaps this unit leaves open (recorded, never hidden):**

1. **The tab-scoped read cache does not exist** — I1's cache half stays a **spec-level obligation**
   (`docs/specs/unit-reads-pivot-tab-cache.md` §2.3), and this unit's `activeTabId` is **the anchor
   that unit's residency predicate will need** but does **not** satisfy it. A reader must not read
   this unit's green as `U-READS-PIVOT` progress (the audit's §0 verdict is explicit: the spec'd
   predicates `FS4`/`FS14`/`FS15`/`FS17` are **unreachable fail-states in this build**).
2. **The host-global pane-data caches** (`lastSnapshot`/`lastStore`/`lastDocHeads`/`lastCrosslinks`/
   `lastBacklinks`/`lastQueryResult`/`lastOperatorSettings`/`lastStoreListing`/`lastJournal`
   `[reading] sidebar-panes.ts:492-506`) stay **unscoped** — they are pane-data, not per-page/page
   state, and scoping them is `U-READS-PIVOT` §5.2's business (the bound + eviction), not this
   unit's.
3. **The `TAB-1` warning affordance is not built here.** `pageCommitFailure` stays **host-side** and
   unrendered (`docs/specs/unit-u-edit-1-whole-page-editing.md` §3.5 item 6; `docs/defects.md`
   `C9-U-EDIT-1-ADVERSARIAL-MUST-FIX-SET` (M3)). This unit only makes the map's **key** correct.
4. **The `U-SHELL-9b` multi-mount** stays unbuilt and blocked; `mountTabs` stays dead code with a
   reachability pin, not a deletion.

**Costs.** One host module touched in six places + one controller guard + one **optional** options
member; a new node suite (host-order + ownership-key rows + the register's PBT rows); a **live
battery re-run with a driver extension** (§8.3) that changes the **O-0 oracle identity** — a recorded
cost, not a side effect (`docs/specs/requirement-catalog.md` fact 3: a change to
`scripts/live-drive.mjs` invalidates the recorded live provenance and forces a live run → §3b
re-audit → doc review); and a **re-derivation of the `LIVE-UF9` tracker row** (a re-scope).

**Benefits.** I2 becomes a **checkable total predicate** rather than a set of happy paths
(§5.1); I1's live half gains a **tab-keyed** dirty/failure/caret identity, which is the exact shape
`docs/specs/unit-u-edit-1-whole-page-editing.md` §3.5 item 6 and `docs/specs/design-extensions-review.md`
§3.5 E (`C10` `TAB-1`/`TAB-2`) have been asserting in prose while the code returns a document id; and
the two node-invisible races get a **live** oracle (§8.3) instead of a documented caveat.

---

## 4. What this unit does NOT do (constraints honored)

1. **No cache.** No `residentKeys`, `TabCacheKey`, `CacheKind`, `MAX_RESIDENT_ENTRIES`,
   `MAX_RESIDENT_BYTES`, `CacheMiss`, `CacheOverBound`, no `tab-cache.ts`. `U-READS-PIVOT`'s spec
   stays the only address for those (it is `LANDED, no code landed, no red set run`;
   `docs/next-steps.md` §P2 item 4).
2. **No pre-emption of the P2 gate.** No engine/launcher/authority change; no `RagStore` member
   touched; no wire shape; no `OperatorSettings` slice added; no local write path altered.
3. **No 9b behavior.** No simultaneous render, no C20 class, no owners box, no Option-C dialog, no
   N-root behavior change; `mountTabs` is neither deleted nor called from production (§5.7).
4. **No `provident-ssr` change** and no package patch (`AGENTS.md` item 7). No engine-repo change.
5. **No `U-EDIT-1` commit-contract change.** The commit's payload shape, its one-`applyBatch`
   atomicity, its journal entry and its failure semantics are **unchanged**; only the **subject key**
   and the **caret gate** change (§5.4/§5.5).
6. **No renumbering of any other spec.** `docs/specs/unit-u-shell-9a-main-focus-tabs.md` keeps its
   §1–§8 numbering (including §5.7/§5.8) exactly as landed; this file's sections are its own and are
   cited by number below.
7. **No re-pin of the §5.U matrix.** `MATRIX_ROWS` must not change; assertions enter as a **re-pin**
   or an **extended row** (`docs/specs/design-extensions-review.md` §7.4, §13.3;
   `docs/specs/gnosis-offload-review.md` §7 A-6).
8. **No OS-dialog/parking language.** No surface of this unit is structurally non-exercisable
   (§8.3).

---

## 5. The exhaustive contract

### 5.1 The two invariants as TOTAL predicates (over ALL states)

The predicates are stated over the **active tab state** and the **stage state**. They are total:
they quantify over every `TabState`, every mount attempt (including an outstanding async one), every
re-derive kind and every `refresh()`.

**Terminology (pinned once, binding everywhere below).**

| Term | Pin |
| --- | --- |
| **active tab** | `activeTab(this.state)` (`src/renderer/tab-state.ts`), the entry the strip hands to `onActiveChange` `[reading] src/renderer/tab-strip.ts:198-211` (the notify at `:207`) |
| **`activeTabId`** | the active tab's `TabEntry.id`, or `null` when there is no active tab (the boot-precedence and empty-set states, 9a §4 F1/F3) |
| **`activeTarget`** | the active entry's `TabTarget`, or `null` |
| **`activeTargetKind`** | `activeTarget?.kind ?? null` — one of `'document' | 'search' | 'graph' | 'template' | 'other' | null` (9a §2.2's five-member union; `null` only in the F1/F3 states) |
| **`activeDocumentId`** | `activeTarget.kind === 'document' ? activeTarget.documentId : null` — the active tab's document id, **never** a stale field |
| **surface** | the ONE `#page-edit-surface` root (`PAGE_EDIT_SURFACE_ID`, `DATA_EDIT_SURFACE = 'data-edit-surface'`; `src/renderer/pane-graph.ts` §11.7/§11.8 of `docs/specs/unit-u-edit-1-whole-page-editing.md`) |
| **stage target kind** | the kind derived from the **rendered** stage body: `'document'` iff the stage contains a surface or a `data-rag-node-id` document body root; `'search'` iff it contains `#stage-search-tab`/`#search-tab-input`; `'landing'` iff `#stage-landing`; `'placeholder'` iff `[data-stage="placeholder"]`; else `'unknown'` |
| **generation** | the monotonic `stageMountSeq` (below), incremented at the START of every `mountTab` attempt |

**I2 — STAGE-DISPLAY (the total predicate).** For **every** reachable host state `s` and every
instant `t` at which the stage is settled (i.e. no mount attempt is outstanding — see the async
clause):

> **I2** `stageTargetKind(s, t) ≡ activeTargetKind(s, t)`, and when `activeTargetKind(s, t) ===
> 'document'` the surface's `data-edit-surface` value **equals** `activeDocumentId(s, t)`.

Three clauses make this total rather than a happy-path list:

1. **The steady-state clause.** After any synchronous mount, any completed async mount, any
   `reDerive` of any kind, any `refresh()`, any pane/registry re-assemble and any `rerenderAppGraph`,
   the equality holds.
2. **The async clause (V1).** While a mount attempt is outstanding, the **newest** attempt is the
   only one permitted to apply its body: an older attempt that settles later **must not** change the
   stage. So the predicate holds **at every settle point**, not merely once the last promise resolves.
3. **The non-document clause (V4/V2).** When `activeTargetKind(s, t) !== 'document'`, the stage
   contains **no** document body root (no `data-rag-node-id` root of any document) and **no**
   surface. The surface count in the stage region is **1 iff** a document tab is active, else **0**
   (this is the reading pinned in §5.6 item 1).
   **⟨A.1.1 — CONFIRMED and made TOTAL: this sentence is the authoritative census predicate, and it
   holds at EVERY seam — `mountTab`, **`mountTabs`**, `refresh`, a content re-derive, a
   pane-additive reconcile, `rerenderAppGraph` and boot. The 9b multi-mount is NOT exempt (it may
   author at most the ACTIVE document's surface; a stale surface root MUST be destroyed). See §A.1.1
   (predicate `I2-R`) for the exhaustive statement, the both-discriminators rule, and the ruling on
   which test row was wrong.⟩**

   **⟨A.3.1 — SUPERSEDED IN PART: §A.1.1's seam list named **boot** and required `0` surfaces
   there. MEASURED (seven committed rows, §A.3.3) and RULED: the PRE-TAB state is an explicit
   **BOOT CARVE-OUT** — exactly ONE surface, owned by the pre-tab default-context document
   (`getPreTabDocumentId()`), and the census predicate is strict from the moment tab state exists
   (`!isPreTabState()`). `mountTab(null)`, every non-document kind and `mountTabs` with no active
   entry stay strict at `0`. The predicate wording, the readers, and the four re-pinned red rows are
   §A.3.1; NO committed green is re-planned.⟩**

**I1 — TAB-OWNERSHIP (the total predicate, for the state that exists today).** For **every** reachable
host state:

> **I1** Every per-page subject that the host mutates or reads at the page-edit seams — the dirty
> set, the commit-failure record and the caret store — is keyed by the **active tab id**
> (`activeTabId`, falling back to `PAGE_EDIT_SURFACE_ID` **iff** `activeTabId === null`) and by
> **nothing else**; a **document id is never a subject**; and two tabs on the same document never
> share a subject.

Three clauses:

1. **The identity clause (V3).** `pageEditSurfaceHandlerSubject() ∈ { activeTabId,
   PAGE_EDIT_SURFACE_ID }` at every instant; a value that is a document id is `FS-4`.
2. **The isolation clause (V3).** For two distinct tab ids `t1 ≠ t2` on the same `documentId`,
   `isDirty(t1)`, `pageCommitFailure.has(t1)` and `carets.get(t1)` are **independent** of
   `t2`'s: a mutation under `t1` never changes `t2`'s three values (`FS-5`).
3. **The caret-viability clause (V3-caret).** `saveCaret(activeTabId, …)` followed by a re-derive
   restores the caret **iff** the surface exists and the surface's document is live; the guard no
   longer rejects a **tab-keyed** subject for being a non-RAG id (`FS-6`).
   **⟨A.3.2 — "is live" is PINNED to the host's document-liveness carrier (`isDocumentLive(doc)` /
   the optional `EditControllerOptions.isDocumentLive` hook), NEVER to `backRefs.has(doc)`: the
   `backRefs` map keeps its `Map<ragNodeId, nodeId[]>` invariant and no document id is ever its key
   (§A.3.2).⟩**

**Recorded scope limit (must not be read past).** I1 is stated over **the state that exists today**
(the dirty set, the failure map, the caret store, and the persisted `TabState` search params, which
`[reading] src/renderer/tab-state.ts:326-331` already keys by tab ✅). It is **not** stated over
`U-READS-PIVOT`'s cache: that half of I1 remains **`UNVERIFIABLE-IN-NODE` and unbuilt**, and its
predicates stay that spec's (§2.2/§2.3/§5.1). The persisted half of I1 **HOLDS** today and this unit
does not touch it.

### 5.2 The tab-ownership model this unit lands (the host's active-tab state)

**New host state on `SidebarPanes`** (the audit's named seam; exact names are **pinned here** so the
TestWriter can assert them):

```ts
/** The active tab's identity — set in `mountTab` for EVERY target kind and for `entry === null`.
 *  `null` ⇔ no active tab (the F1/F3 states). NEVER a document id. */
private activeTabId: string | null = null
/** The active target's kind, mirrored with `activeTabId` for the non-document gate (§5.3). */
private activeTargetKind: TabTarget['kind'] | null = null
/** The active document tab's document id, or null — the ONLY sanctioned source of the
 *  stage-mount document scope after this unit. */
private activeDocumentId: string | null = null
/** Monotonic mount generation (§5.3, V1). */
private stageMountSeq = 0
```

**Pinned readers (the observable surface the register and the tests use):**

| Member | Signature | Returns | Notes |
| --- | --- | --- | --- |
| `SidebarPanes.getActiveTabId` | `(): string | null` | `activeTabId` | additive; `page-editor-host.test.ts`'s proto check is containment-only (`[reading] tests/page-editor-host.test.ts:213-215`), so an additive member is not a break |
| `SidebarPanes.getActiveTargetKind` | `(): TabTarget['kind'] | null` | `activeTargetKind` | additive |
| `SidebarPanes.getActiveDocumentId` | `(): string | null` | `activeDocumentId` | additive; **`_currentDocumentId`'s retained role is narrowed to the doc-nav/selection path and the persisted default context** (`getTabContext` `[reading] src/renderer/sidebar-panes.ts:704-711`) — it is **no longer** a scope source at any stage/re-derive/surface seam |
| `SidebarPanes.mountTab` | `(entry: TabEntry | null): void` | `void` | **the only** production stage-mount seam; unchanged signature |

**⟨A.3 — the reader table above is EXTENDED, not superseded, by THREE additive members pinned in
§A.3.1/§A.3.2: `isPreTabState(): boolean`, `getPreTabDocumentId(): string | null` (the pre-tab
observer the amended census predicate quantifies over) and `isDocumentLive(documentId: string):
boolean` (the document-liveness carrier). All three are total and side-effect-free; the
§7.2 containment-only proto census stays green.⟩**

**`_currentDocumentId` after this unit (pinned, because the audit's V2/V3 root cause is its misuse).**
`_currentDocumentId` **is retained** (the doc-nav selection state, the `getTabContext` last-focused
fallback, the persisted default). It is **removed from three roles**:
(a) the stage-mount document scope, (b) the re-derive document scope, (c) the page-edit subject.
Every one of those three reads `activeDocumentId` / `activeTabId` instead. A remaining read of
`_currentDocumentId` at (a)/(b)/(c) is `FS-4`/`FS-2`/`FS-3` respectively.

### 5.3 The fix seam, in the audit's order (V1 → V3 → V2 → V5/V4 → V6)

The order is **binding** (the audit's §5 priority; V1 and V3 share the `activeTabId` seam, so V1's
generation guard is written against the field V3 also consumes). Each step lands **inside this unit's
one cycle** (RCA-2: this unit's cycle never shares a run with `U-READS-PIVOT`, `U-TAB-MERGE`,
`U-EDIT-1`, or the 9b wave).

#### 5.3.1 V1 — the mount generation guard (async ordering)

**Pinned shape.** `mountTab` stamps a generation at its **entry**, sets the active identity
**synchronously for every kind** (so the identity is correct even while an async body is pending),
and `mountSearchStage(entry, seq)` re-checks both after the `await`:

```ts
// mountTab(entry)
const seq = ++this.stageMountSeq
this.activeTabId = entry.id
this.activeTargetKind = entry.target.kind
this.activeDocumentId = entry.target.kind === 'document' ? entry.target.documentId : null
// ... the per-kind branch (document | search | other) ...
// mountSearchStage(entry, seq):
//   ... await bridge.rag.query(...) ...
//   if (seq !== this.stageMountSeq) return            // an older attempt: DISCARD (never apply)
//   if (this.activeTabId !== entry.id) return          // the identity moved: DISCARD
//   this.applyStageBody(searchTabContent(entry, { results, error }))
```

**`entry === null`:** `activeTabId = activeTargetKind = activeDocumentId = null`,
`mountedStageKey = null`, `mountedDocumentIds = []`, the stage is cleared (existing behavior
`[reading] src/renderer/sidebar-panes.ts:720-724`), and the generation is **not** incremented (there
is no mount; an outstanding search completion is still discarded because `activeTabId` no longer
matches `entry.id`).

**Pinned consequences (all four are asserted):**

1. A stale completion **never** calls `applyStageBody` (⇒ no `loadAppGraph`, no
   `runtime.loadEnvelope`, no `tearDownGraph` — `[reading] src/renderer/runtime.ts:467-468`).
2. A discarded completion is **silent at the DOM** and **observable at the host**: the host keeps a
   `stageMountDropped: number` counter (read by `getStageMountDropped()`), incremented once per
   discard — so the drop is a **checkable fact**, never an inferred absence
   (mirroring `U-READS-PIVOT` §4.2's recorded-drop discipline).
3. The `JSON.stringify(entry)` de-dupe (`[reading] :725-726`) is **retained unchanged**: an identical
   re-mount is still a no-op. It is **not** the guard.
4. The query is **still issued** for a superseded mount (the request is started before the identity
   can move); this unit does **not** add cancellation — a cancelled request is `U-READS-PIVOT` §4.2's
   generation/stale-drop territory. Recorded so a reader does not expect cancellation here.

**Fail-state:** `FS-1`.

#### 5.3.2 V3 — the ownership key (the page subject is the tab id)

**Pinned shape.**

```ts
private pageEditSurfaceHandlerSubject(): string {
  return this.activeTabId ?? PAGE_EDIT_SURFACE_ID      // NEVER a document id
}
```

`markDirty`/`isDirty`/`commit`/`clearDirty` `[reading] :3164-3179` and the failure map
`[reading] :3151`, `:3160`, `:3175-3177` then operate on the tab id with **no other change** — the
maps' types and the commit path stay as they are. `pageEditSurfaceCommitState(subject)` /
`pageEditSurfaceFailure(subject)` are **unchanged** (they already take the subject as an argument).

**Caret viability (the controller guard).** `restoreCaret(subjectId)`
`[reading] src/renderer/edit-controller.ts:183-199` currently rejects any subject absent from
`backRefs` (a `Map<ragNodeId, nodeId[]>` — `[reading] :188-191`). A tab id is not a ragId, so the
guard must validate the **page subject's document**. Pinned shape — one **optional, additive**
`EditControllerOptions` member:

```ts
interface EditControllerOptions {
  // ... existing: backRefs, commit, onRebuild ...
  /** The surface document a page subject belongs to. The HOST supplies it (the active tab's
   *  document id, or null when the active target is not a document). Used ONLY by
   *  `restoreCaret`'s deleted-document guard, in place of `backRefs.has(subjectId)`. */
  pageSubjectDocument?: (subjectId: string) => string | null
}
```

**Pinned semantics (total):**
**⟨A.3.2 — one ADDITIVE member joins the options (host-supplied, total): `isDocumentLive?: (documentId:
string) => boolean`, with the matching non-enumerable late-bind `setDocumentLiveness?.()`; it owns the
caret's document check so `backRefs`' invariant stays unrelaxed. See §A.3.2.⟩**

- `restoreCaret(subjectId)`: if `carets` has no entry → `undefined`. Else, with
  `doc = pageSubjectDocument?.(subjectId) ?? null`:
  **⟨A.1.4 — the order is PINNED and OBSERVABLE: a caret-less read returns `undefined` WITHOUT
  consulting the hook, so the hook's consultation set is exactly the subjects read WITH a saved caret
  entry, once per call, in read order. A build that consults the hook before the caret check is a
  contract deviation; see §A.1.4 for the two `A3/P-IM-4` rows that were unsatisfiable as written.⟩**
  - `opts.pageSubjectDocument` **absent** ⇒ **legacy** behavior (`backRefs.has(subjectId)`) — a
    harness that does not supply the hook keeps the pre-unit contract;
  - `doc === null` ⇒ the subject has no live surface document ⇒ the saved caret is **cleared** and
    `undefined` is returned (this is the non-document-tab state, `FS-6`'s legal direction);
  - `doc !== null` and `!opts.backRefs.has(doc)` ⇒ the document is gone ⇒ the saved caret is
    **cleared**, `undefined` returned;
    **⟨A.3.2 — SUPERSEDED: this branch's liveness predicate is `!isDocumentLive(doc)` when the
    host supplies the carrier (`opts.isDocumentLive`), and `!opts.backRefs.has(doc)` ONLY as the
    absent-hook legacy fallback. The host no longer seeds a document id into `backRefs`
    (`seedActiveDocumentRef()` is deleted); see §A.3.2 for the pinned order and the readers.⟩**
  - `doc !== null` and `opts.backRefs.has(doc)` ⇒ return the saved caret (subject to the existing
    `FS2` page-scope check: a caret whose `kind === 'rich'` and `ragId !== PAGE_EDIT_SURFACE_ID` is
    still dropped).
- The `dirty` set's membership and the `carets` map's key are **unchanged in type** (`Set<string>` /
  `Map<string, CaretState>`); only the key's value changes (tab id).

**Host side.** `SidebarPanes` passes `pageSubjectDocument: (subject) => subject === this.activeTabId
? this.activeDocumentId : null` (so a **stale** subject can never be validated against the current
document — the clause that makes two tabs on one document independent).

**The three doc-comment bodies that assert this contract** `[reading] :636-639`, `:3130-3133`,
`:3142-3146`, `edit-controller.ts:85-92` become **true** after this step; they are **not** edited
into weaker prose (the drift is closed in the code, not in the comment).

**Fail-states:** `FS-4` (document id as a subject), `FS-5` (cross-tab shared state),
`FS-6` (caret dead / restored against the wrong document).

#### 5.3.3 V2 — the re-derive scope gate (no foreign document on a non-document tab)

**Pinned shape.** The re-derive's document scope is derived from the **active target**, and the
non-document case is an explicit branch:

```ts
// reDerive(kind) — replaces the `_currentDocumentId`-based scope selection
const activeDoc = this.activeTargetKind === 'document' ? this.activeDocumentId : null
const documentIds = multi
  ? [...this.mountedDocumentIds]            // the 9b simultaneous path — UNCHANGED for >= 2
  : activeDoc ? [activeDoc]
  : []                                     // NO document scope: a non-document (or no) active tab
```

and `applyContentChange` is entered **only** when a document scope exists:

- `kind === 'content' && this.appLoaded && (documentIds.length > 0 || multi)` ⇒ the existing
  content-only path (`applyContentChange` for the single case; `applyDocumentSet` for the multi case
  `[reading] :1989`);
- otherwise ⇒ the existing `refresh()` branch `[reading] :1992` — **with V5's fix (§5.3.4)** so that
  branch can no longer re-materialize a document body.

**Pinned sub-rules (each asserted):**

1. **The non-document case materializes NO document root.** With `activeTargetKind !== 'document'`
   and one mounted tab, a `content` re-derive must **not** call `reconcileDocumentRoots` with a
   document scope and must **not** call `runtime.applyContentReconcile` with a `documentId`
   `[reading] :1514`, `:1518-1528`). The active tab's own body **survives** the re-derive
   (repopulated in place or left in place), and **no** other document's body appears.
2. **The surface is NOT authored for a foreign document.** `assembleAppGraphEnvelope` is called with
   `documentId: this.activeDocumentId ?? undefined` `[reading] :1449`, `:1501` — so on a
   non-document tab `documentId` is `undefined` and §5.3.5's no-surface rule follows mechanically.
3. **The document case is unchanged in identity.** With a document tab active, a `content` re-derive
   still materializes **its** root (and only its), still re-authors **its** surface, and still
   preserves node identity (`U-STATE-1b`'s no-teardown contract) — the audit's probe P15
   (`ALPHA=false BETA=true surface=doc-b`) is the pinned control.
4. **The multi case is untouched.** `mountedDocumentIds.length > 1` keeps the 9b scoped-union
   behavior and the W2-N15 scope `[reading] :1959-1972`; this unit adds **no** multi-document
   behavior and re-derives **no** 9b test.
   **⟨A.1.1 — SUPERSEDED IN PART: "untouched" now covers the document-SCOPE UNION only
   (`mountedDocumentIds`, W2-N15). The SURFACE census is total at the multi seam too: the 9b path
   may author at most the ACTIVE document's surface, and any stale surface root MUST be destroyed by
   the reconcile (§A.1.2). The 9b suites' own assertions are still untouched (§7.2).⟩**
5. **The parked kinds are non-document.** `graph`/`template` are **not** documents for every clause
   above (`coerceTabTarget` keeps them distinct; 9a §2.2), so a parked tab is in the non-document
   branch. Recorded because the audit's V2 row names the parked kinds explicitly.

**Fail-states:** `FS-2` (foreign document body on a non-document tab), `FS-3` (foreign surface
authored), `FS-7` (a stale `_currentDocumentId` used as the scope).

#### 5.3.4 V5 — `refresh()` re-assembles (never reloads a raw traversal under a non-document tab)

**⟨A.1.5 — WITHDRAWN AS A FIX: V5 is a recorded NON-FINDING.** The subsection below is kept as the
superseded finding (never deleted) and re-scoped as the `refresh()` seam's **MONITOR** contract:
clause 1 is a measured **green control**, clause 2 is **withdrawn**, `refresh()` receives **no** code
change in this unit, and `FS-8` is a **monitor** fail-state, not a V5 red row.⟩**

**Pinned shape (two clauses — ⟨A.1.5: clause 1 = a PIN (already true); clause 2 = WITHDRAWN⟩):**

```ts
// refresh()
if (this.runtime && this.lastTraversalEnvelope) {
  if (this.activeTargetKind === 'document' || this.activeTargetKind === null) {
    this.loadAppGraph(this.runtime, this.lastTraversalEnvelope)   // re-ASSEMBLE: toolbar + surface authored
  }
  // else: the active tab is NOT a document — reload NOTHING. The stage already holds the active
  // tab's body; a document traversal is never reloaded into a non-document tab's zone.
}
this.mountOperator()
```

**⟨A.1.5 — clause 2 (`activeTargetKind !== 'document'` ⇒ suppress the reload) is WITHDRAWN.** The
measurement — the audit's P5 (`search-body=true ALPHA=false BETA=false`) plus `refresh()`'s reload
through `loadAppGraph` at `sidebar-panes.ts:1783-1785` — shows the non-document direction already
holds, so this unit adds **no** `refresh()` guard and no `activeTargetKind` branch here. §A.1.1's
census still governs the seam: a live regression here is a NEW red row / amendment (sub-rule 3's
discipline), never a silent extra edit.⟩**

**Pinned sub-rules:**

1. **A document tab keeps its surface and toolbar across `refresh()`.** `refresh()` reloads through
   `loadAppGraph`, which authors the toolbar (`applyEditorToolbar` `[reading] :1462`) and the surface
   (via the assembler's `documentId` `[reading] :1449`) — so `#page-edit-surface` and
   `#editor-toolbar` are present after `refresh()`, not lost.
   **⟨A.1.5 — this is a MEASURED GREEN CONTROL, not a change: `refresh()` calls
   `this.loadAppGraph(this.runtime, this.lastTraversalEnvelope)` (`:1783-1785`), `applyEditorToolbar`
   (`:1489`) and the assembler's `documentId` (`:1476`) author both roots into the envelope it then
   loads. §8.2's `R6` is therefore green today and must never be authored as a failing row.⟩**
2. **A non-document tab is not overwritten by `refresh()`.** Its stage body is untouched (the
   audit's P5 measurement — `search-body=true ALPHA=false BETA=false` — is the pinned expectation,
   and the invariant now holds **by rule**, not by envelope-shape luck).
   **⟨A.1.5 — this is a MEASURED GREEN CONTROL: the P5 expectation HOLDS on the unmodified tree, so
   no `refresh()` gate is added here.⟩**
3. **The other `loadAppGraph(this.runtime, this.lastTraversalEnvelope)` call sites stay as they
   are** (`[reading] :813`, `:2945`, `:2978`, `:2992`) — they are pane-visibility / registry /
   reveal-driven re-assembles on the **existing** graph, and each is already reached only with an
   active tab whose body belongs in the stage. **Recorded** so a later pass does not "fix" them
   speculatively; if a live run shows one of them re-materializing a document under a non-document
   tab, that is a **new red row** (an amendment to this spec), never a silent extra edit.
4. **`lastTraversalEnvelope`'s content is not otherwise redefined** — the W2-N15 scoped-union pin
   `[reading] :1966-1972` stands.

**Fail-state:** `FS-8`.
**⟨A.1.5 — MONITOR, not a V5 red row: `FS-8`'s document-tab direction is a green control today
(§5.3.4 sub-rule 1) and its non-document direction is a monitor under §A.1.1's census.⟩**

#### 5.3.5 V4 — the page-edit surface is a DOCUMENT-TAB-ONLY surface

**The decision (pinned, and it is a reading-resolution, not a new capability).**
`docs/specs/unit-u-edit-1-whole-page-editing.md` §2.1 pins *"Exactly **ONE** such surface exists per
**focused** document/tab"*, and §11.7 pins the surface is authored at the **app-graph/stage-assembly**
layer from `input.documentId`. This unit **defines "focused" for the multi-tab shell**:

> **FOCUSED = the stage's rendered body, which is the ACTIVE tab's body (9a §2.3).** When the active
> tab is a `document`, the focused document is `activeDocumentId` and exactly ONE surface is authored
> for it. When the active tab is any other kind, the stage renders a non-document body and the
> focused document set is **empty** ⇒ **ZERO** surfaces. An inactive document tab — including one
> showing the same document as the active tab — is **never** a focused document.

**Pinned consequences:**

1. **The surface census over the stage region is `1` iff `activeTargetKind === 'document'`, else
   `0`** (the I2 non-document clause; asserted in the envelope AND in the DOM).
   **⟨A.1.1 — TOTAL at every seam, `mountTabs` included, with no stale root and no duplicate: this
   is the row the S14 conflict was resolved against. The census counts BOTH discriminators — the
   authored `#page-edit-surface` id and the `data-edit-surface` marker — and they must agree; when
   the count is `1`, the value equals `activeDocumentId`. See §A.1.1.⟩**
   **⟨A.3.1 — SUPERSEDED IN PART, the pre-tab arm: the census is `1` iff `stageOwner(s).kind ∈
   {'tab-document','pre-tab'}` and the marker equals `stageOwner(s).id`; the PRE-TAB state admits
   exactly one surface for the pre-tab default-context document, while every other no-active-tab
   state (including `mountTab(null)` and `mountTabs` with no active entry) stays `0`. The SURFACE
   scope is a predicate DISTINCT from the pinned `stageDocumentScope()` BODY scope. See §A.3.1.⟩**
2. **No surface and no editing binding on a non-document stage body.** `applyStageBody`'s payload and
   the landing/parked bodies keep **no** `data-rag-node-id` root
   `[reading] src/renderer/pane-graph.ts:1377`, `:422-429` — so `surfaceBodyRoots` is empty and no
   surface is authored. This is **deliberate** and now **contract**, not an accident.
3. **The caret restore is gated on the surface existing.** The re-derive's caret step
   `[reading] :2006-2011` uses the **tab subject** (`activeTabId ?? PAGE_EDIT_SURFACE_ID`) and only
   attempts a restore when `document.getElementById(PAGE_EDIT_SURFACE_ID)` resolves; targeting a
   missing surface is **not** attempted (it was a silent no-op — the audit's V4 note).
4. **Recorded amendment (name the change, never a silent re-read).** This is an **explicit narrowing
   reading** of `docs/specs/unit-u-edit-1-whole-page-editing.md` §2.1/§11.7 for the shell's
   single-active-render state. The alternative the audit names — option (b), a second payload
   authoring a surface per focused document independent of the stage body — is **rejected here** as
   the larger change and as the one that would put a surface on a tab that does not own the document
   (the very defect V2 exists to prevent). At landing, the item-10d doc review records this reading
   against `U-EDIT-1` §2.1/§11.7 (a **repoint-style amendment note**, never an edit of that spec's
   text in this pass).
5. **`PAGE_EDIT_SURFACE_ID`/`DATA_EDIT_SURFACE` and the handler defs are unchanged** (no new marker,
   no new ID, no new handler) — the fail-state `FS-3` is "a surface authored while the active target
   is not a document", not "a surface with a new name".

**Fail-state:** `FS-3`; its legal twin is the zero-surface state (`FS-3`'s negative).

#### 5.3.6 V6 — `mountTabs` reachability (the latent single-active contradiction)

**Pinned disposition: (a) — unreachable + pinned, NOT deleted.** Rationale recorded so the choice is
not re-litigated:

- `docs/specs/unit-u-shell-9b-cross-document-shared.md` §2.1 explicitly supersedes 9a §2.3's
  single-active policy **for the 9b wave**, and 9b is **BLOCKED on U-STATE-1e**
  (`docs/specs/unit-u-shell-9b-cross-document-shared.md`'s header). Deleting `mountTabs` here would
  (i) pre-empt that wave's seam and (ii) **re-derive three 9b suites** — `mountTabs` is called by
  `tests/unit-u-shell-9b-w2n15-rederive-scope.test.ts` `[reading] :201` and required by
  `tests/unit-u-shell-9b-cross-document-shared.test.ts` `[reading] :687-690` — which is exactly the
  "silent re-pin" this spec forbids (§7.4).
- **What I2 actually needs** is that no **production** path can mount more than the active tab's body.

**Pinned rules (all four asserted):**

1. **Reachability pin.** `mountTabs` is **not called from any production module** — a static
   reachability census over `src/renderer/**` (excluding comments and its own definition and any
   `*.test.ts`) returns **zero** call sites, and it is **not** reachable from any `window.provident`
   bridge seam, any handler body, `renderer.ts`'s tab wiring (`bootTabs`/`onActiveChange`
   `[reading] src/renderer/renderer.ts:863-880`), or any `SidebarPanes` public method other than
   itself. A production caller is `FS-9`.
2. **Single-active restoration pin.** Calling `mountTabs` and then `mountTab(entry)` restores
   single-active exactly (`mountedDocumentIds === [entry.target.documentId]` for a document entry,
   or `[]` for a non-document entry), the later mount's body alone is in the stage, and the audit's
   P13 measurement (`ALPHA=true BETA=false`) is the pinned expectation.
   **⟨A.1.1 — and the census is NOT deferred to the later `mountTab`: after `mountTabs` ITSELF the
   live surface count must already equal the active-tab predicate (one surface, carrying the active
   document's marker — or none when there is no active document tab). The 9b open set's BODIES may
   coexist at that seam (A.1.3); its SURFACES may not.⟩**
3. **Doc-comment truth pin.** `mountTabs`'s own doc comment states the 9b supersession **and** that
   9b is **PARKED on U-STATE-1e** and the seam is **unreachable from production until
   `U-STATE-1e` lands** — so a reader cannot mistake an unreachable public method for the current
   policy (the audit's "recorded, not raised" disposition, made explicit on the surface itself).
4. **No production behavior change.** This step changes **no** runtime behavior for any existing
   caller; if the TestWriter's reachability census is green on the unmodified tree, that row is a
   **pin** (a green control), not a red row — the red rows of this unit are R1–R6 (audit §4.1) and
   the register's negative generators.

**Fail-state:** `FS-9`.

### 5.4 Happy-path states (the TestWriter's valid-path red set)

Each state is written as `state → pinned outcome`. **The `[reading]` markers are the audit's
probe measurements** (`archive/reviews/2026-09-22-tab-page-ownership-audit.md` §1.3/§2.1), recorded as
the control for the fixed behavior.

1. **doc A → doc B → back to A.** `mountTab(t1/doc-a)`, `mountTab(t2/doc-b)`,
   `mountTab(t1/doc-a)`: the stage body is ALPHA, then BETA, then ALPHA; the surface is
   `doc-a`, `doc-b`, `doc-a`; `activeTabId` is `t1`, `t2`, `t1`. (Audit P1 ✅ — must stay.)
2. **doc tab → search tab (steady state).** `mountTab(searchTab('s1'))`: the stage contains
   `#stage-search-tab` + `#search-tab-input`, contains **no** document body root and **no** surface;
   `activeTargetKind === 'search'`; `activeDocumentId === null`. (Audit P2 ✅ — plus the new
   `activeDocumentId === null` assertion, which is **red** today.)
3. **Open-in-tab from the search pane.** `expandSearchTab('alpha')` → the strip commits → the new
   search tab is active → its OWN body mounts in the same turn; the previous document body is gone;
   `activeTabId` equals the new tab id. (Audit P7 ✅; the seam chain is
   `pane-graph.ts:950-954` → `sidebar-panes.ts:2961-2963` → `tab-strip.ts:172-179` → `commit` →
   `onActiveChange` → `mountTab`.)
4. **Close the ACTIVE tab.** The left neighbour becomes active and displayed; the closed tab's body
   is gone; `activeTabId` is the neighbour. (Audit P6 ✅.) Closing the **last** tab → the first-tab
   default (9a §2.4/§4 F4) with `activeTabId` = the fresh tab's id and non-null
   `activeTargetKind`.
5. **Search-result click → new doc tab.** HOST-4's path mounts the **doc** body in the same turn;
   the search tab stays open; the surface is that document. (Audit P14 ✅.)
6. **Post-commit re-derive with a DOCUMENT tab active.** `reDerive('content')`: ALPHA→BETA
   correctly; the surface re-keys to the active document; `activeDocumentId` unchanged. (Audit P15
   ✅ — the pinned control for V2's fix.)
7. **Close an INACTIVE doc tab.** No closed document leaks into the stage; `mountedDocumentIds` is
   the active document only; a following content re-derive keeps the active document. (Audit P10 ✅.)
8. **V1 guard, the happy path:** a search mount completes while **its own** tab is still active ⇒
   the body **is** applied (`#stage-search-tab` present), `getStageMountDropped()` unchanged. (This
   is the W2-N10 control, §7.4 item 2.)
9. **V1 guard, the discarded path:** search mount pending → `mountTab(docTab('t2','doc-b'))` →
   the query resolves ⇒ the stage still shows BETA, contains **no** `stage-search-tab`/`search-tab-input`,
   the surface is `doc-b`, and `getStageMountDropped()` is `1`. (Audit P3/P14 — inverted today.)
10. **V2 happy path:** search tab active → `reDerive('content')` ⇒ `#stage-search-tab` present,
    **no** `ALPHA`, **no** `data-edit-surface` **anywhere** in the app graph, and the surface census
    over the stage region is `0`. (Audit P4 — inverted today.)
11. **V3 happy path:** `mountTab(t1/doc-a)` → `pageSurfaceInput()` → `isDirty('t1') === true`,
    `isDirty('doc-a') === false`, `getActiveTabId() === 't1'`; the committed subject observed through
    the public seam is `'t1'`. (Audit P8 — inverted today.)
12. **V3 isolation:** then `mountTab(t2/doc-a)` (the SAME document) ⇒ `isDirty('t2') === false`,
    `anyDirty() === true` (t1 still dirty), and t1's text is not t2's committed value; after
    `clearDirty`/a successful commit under t2, t1's state is unchanged.
13. **V3 caret:** with the surface present and the document live, `saveCaret(activeTabId, caret)` then
    `reDerive('content')` ⇒ the caret is restored (`restoreCaret(activeTabId) !== undefined` and the
    surface's selection is re-applied). With the active target **not** a document,
    `restoreCaret(tabId)` returns `undefined` **and does not throw**.
14. **V4 happy path (document):** `mountTab(docTab('t1','doc-a'))` ⇒ exactly one
    `#page-edit-surface` with `data-edit-surface="doc-a"`; `mountTab(searchTab('s1'))` ⇒ **zero**
    surfaces; `mountTab(docTab('t1','doc-a'))` ⇒ one surface again.
15. **V5 happy path:** on a document tab, note `#page-edit-surface` + `#editor-toolbar`, call
    `await host.refresh()` ⇒ **both still present**; on a search tab, `await host.refresh()` ⇒ the
    search body unchanged and no document body added.
    **⟨A.1.5 — this state HOLDS today (a green control, not a red row): V5's premise is a recorded
    NON-FINDING and `refresh()` gets no code change.⟩**
16. **V6 pin:** the reachability census is zero; `mountTabs([a,b])` then `mountTab(t1/doc-a)` ⇒
    single-active.
17. **Empty-store landing (U-LIVE4 control, unchanged):** at a true empty-store boot the stage shows
    `#stage-landing`/`data-stage='landing'` co-authored in the pane-inclusive envelope, and a
    still-empty content re-derive keeps it —
    `docs/specs/unit-u-shell-9a-main-focus-tabs.md` §2.3 (INV-E1..E4) and
    `docs/specs/unit-live4-empty-store-landing.md`. `activeTargetKind` is `'other'` with
    `activeDocumentId === null`; the surface census is `0`. **This unit must not regress it.**
18. **Parked kinds:** `mountTab(graphTab)` / `mountTab(templateTab)` ⇒ the placeholder body
    (`stage-placeholder-graph` / `stage-placeholder-template`), no document body, no surface,
    `activeTargetKind === 'graph' | 'template'` (the W2-N10 controls, §7.4 item 2).
19. **`mountTab(null)`:** `activeTabId === null`, `activeTargetKind === null`,
    `activeDocumentId === null`, `getStageMountDropped()` unchanged, no throw; and a subsequently
    completing search mount is discarded (its `entry.id` no longer matches).
20. **The `pageSubjectDocument` hook's legacy direction:** a controller constructed **without** the
    hook keeps today's behavior (a harness that does not opt in is unaffected) — the additive
    contract.

### 5.5 Fail-states (`FS-1`…`FS-9`) — each LOUD, naming the tab / the key / the rule

Every row is an **observable** (what a test or a live probe prints) plus the **exact rule violated**.
A row whose violation is silent is itself a finding.

| # | Fail-state | The loud observable (prints the tab id / the key / the rule) | Rule |
| --- | --- | --- | --- |
| **`FS-1`** | **A superseded async mount applied its body** (V1 — a stale `mountSearchStage` completion overwrote a newer active tab's stage) | the **old** entry's `id` + `target.kind`, the **current** `activeTabId`/`activeTargetKind`, the generation observed vs. `stageMountSeq`, and the applied body's marker (`stage-search-tab` present while the active tab is a document) — plus `getStageMountDropped()` **not** incremented | **§5.3.1** (the generation + identity re-check after the await; the newest mount is the only applier) |
| **`FS-2`** | **A foreign document body materialized into a non-document tab's stage on a content re-derive** (V2) | the active tab's `id` + `target.kind`, the **foreign** `documentId`, the document root marker found in the stage (`ALPHA`-class content / `data-rag-node-id`), and the re-derive `kind` | **§5.1 I2 non-document clause / §5.3.3 sub-rules 1–2** |
| **`FS-3`** | **The page-edit surface was authored while the active target is NOT a document** (V2/V4 — a foreign editing binding; the surface census is `1` where the rule says `0`) | the `data-edit-surface` document id, the active `activeTabId`/`activeTargetKind`, and the surface census over the stage region | **§5.3.3 sub-rule 2 / §5.3.5 rule 1** (surface ⇔ active document tab) |
| **`FS-4`** | **The page-edit subject is a DOCUMENT id, not the active tab id** (V3) | the observed subject string, whether it equals a known `documentId`, and the current `activeTabId` | **§5.1 I1 identity clause / §5.3.2** (`pageEditSurfaceHandlerSubject() ∈ { activeTabId, PAGE_EDIT_SURFACE_ID }`) |
| **`FS-5`** | **Two tabs on the SAME document share a dirty flag / a failure record / a caret slot** (V3 isolation) | both tab ids, the shared `documentId`, and which of `isDirty`/`pageCommitFailure.has`/`carets.get` returned the same value for both | **§5.1 I1 isolation clause / §5.3.2** |
| **`FS-6`** | **The page caret is dead, or restored against the WRONG document** (V3-caret) | the subject id, `pageSubjectDocument(subject)`, `backRefs.has(thatDocument)`, the returned caret, and (for the wrong-document direction) both document ids | **§5.1 I1 caret-viability clause / §5.3.2's `pageSubjectDocument` semantics** (a tab-keyed subject must be validated through its document) **⟨A.3.2 — the observable's liveness field is `isDocumentLive(thatDocument)`, not `backRefs.has(thatDocument)` (legacy fallback only)⟩** |
| **`FS-7`** | **A STALE `_currentDocumentId` was used as the stage/re-derive scope** (V2/V5 root cause; the doc-scope reads `activeDocumentId`, never the retained selection field) | the `_currentDocumentId` value, the `activeDocumentId` value, and the seam name that read the wrong one (`assembleAppGraphEnvelope`'s `documentId` input / `reconcileDocumentRoots`'s scope / the re-derive's `documentIds`) | **§5.2's `_currentDocumentId` narrowing / §5.3.3 sub-rules 1–2** |
| **`FS-8`** | **`refresh()` lost the surface/toolbar on a document tab, or reloaded a document traversal into a NON-document tab's zone** (V5) | the active `activeTargetKind`, whether `#page-edit-surface` / `#editor-toolbar` survive on a document tab, and (non-document direction) the document marker that appeared after `refresh()` | **§5.3.4 clauses 1–2** **⟨A.1.5 — MONITOR: clause 1 is a green control today, clause 2 is withdrawn; not a V5 red row⟩** |
| **`FS-9`** | **`mountTabs` is reachable from production, or a stage path mounted more than the active tab's body** (V6); **and** the tracker re-scope half: the `LIVE-UF9` row left claiming its stale pre-HOST-1 symptom | the static call-site (module + symbol), the mounted document id set, and the observed stage bodies; for the tracker half, the row id `LIVE-UF9 SEARCH-OPEN-IN-TAB-SHOWS-DOC` and the re-scope it owes to **V1** | **§5.3.6 rules 1–2 / §1's LIVE-UF9 paragraph** (`docs/defects.md` row `LIVE-UF9`, `docs/specs/live-user-flow-scenarios.md` §9) |

**Non-throw / totality guarantees (pinned, so the negative direction is explicit).**

- `mountTab(null)` and `mountTab` with any well-formed `TabEntry` **never throw** and never leave
  the stage empty except in the pin-`null` case.
- A discarded async mount is **not an error**: it is a counted drop (`FS-1`'s direction), never a
  console error, never a rejection.
- `getActiveTabId()` / `getActiveTargetKind()` / `getActiveDocumentId()` / `getStageMountDropped()`
  are total and side-effect-free.
- `restoreCaret` **never throws** and never returns a caret whose document is dead (it clears it).
- `refresh()` **never throws** on a bridge failure (existing behavior: the last-known values are
  kept `[reading] :1739-1753`) and, after this unit, never renders a document body while a
  non-document tab is active.

### 5.6 Census / numeric claims (each with its `file:line` proof)

**Convention.** Counts are **DERIVED readings** taken at `2026-09-22` and must be **recounted, never
copied** by the item-10d review. Each is marked `[reading]` with its proof.

| # | Claim | Value | Proof |
| --- | --- | --- | --- |
| 1 | The violations this unit fixes | **5 live + 1 non-finding**: `V1`, `V2`, `V3`, `V4`, `V6` are fixable defects; **`V5` is a recorded NON-FINDING** (A.1.5) | `archive/reviews/2026-09-22-tab-page-ownership-audit.md` §2.2/§2.3/§2.4/§2.5/§3.1/§3.2 (six headed defect sections) `[reading]`; **⟨A.1.5 — a doc review RECOUNTS this: the tree's `refresh()` contradicts the V5 §2.5 premise, so the count is 5 fixable + 1 withdrawn, not 6 fixable⟩** |
| 2 | Fail-states this spec pins | **9** (`FS-1`..`FS-9`) | §5.5's table — count its rows; **no `FS-n` id appears in §6's register** |
| 3 | Register rows | **8** (`P-IM-1`..`P-IM-4`, `P-SM-1`..`P-SM-2`, `P-TP-1`..`P-TP-2`) | §6's table — ≤ 8 ✔ (the ceiling, not under it) |
| 4 | `RagStore` interface size (unchanged by this unit) | **22 members = 13 sync reads + 9 async** | recounted symbol-by-symbol in `src/main/rag-store.ts` `interface RagStore` by the 2026-09-21 doc review; the figure is **not** re-derived here (this unit touches no `RagStore` member) `[reading]` |
| 5 | Node suites that construct `SidebarPanes` (the blast-radius family) | **32 test files** under `tests/**` | a `SidebarPanes` grep over `tests/**` for the import/construction (`[reading]` the audit's own family scan is narrower: it names 5 suites, audit §4.1) |
| 6 | 9a suites that will fight the fix (audit §4.1) | **1 named file** + **4 sibling 9b files** | `tests/unit-u-shell-9a-main-focus-tabs.test.ts` (`[reading]` 1085 lines; the audit measured **67 passed / 4 skipped**), plus `unit-u-shell-9b-cross-document-shared.test.ts`, `unit-u-shell-9b-h2-c20-materialization.test.ts`, `unit-u-shell-9b-w2n15-rederive-scope.test.ts`, `unit-u-shell-9b-h3-doc-namespace.test.ts` |
| 7 | 9a assertions that reference the affected seams | **HOST-1** (`tests/unit-u-shell-9a-main-focus-tabs.test.ts:835`), **HOST-4/5** (`:879-935`), **W2-N10** (search-mount settle `:996-1029`) | `[reading]`; the disposition of each is §7.4 |
| 8 | `mountTabs` production call sites | **0** | the audit's grep over `src/`, `scripts/`, `dist/renderer/renderer.js` returned definition + comments only (audit §3.2) `[reading]`; its **test** callers are `tests/unit-u-shell-9b-w2n15-rederive-scope.test.ts:201` and `tests/unit-u-shell-9b-cross-document-shared.test.ts:687-690` |
| 9 | Files this unit touches | **4** (`src/renderer/sidebar-panes.ts`, `src/renderer/edit-controller.ts`, **`src/renderer/runtime.ts`** — A.1.2, `scripts/live-drive.mjs`) + **1 new suite** + **1 new driver block** | §8.4; **⟨A.1.2 — the `runtime.ts` row's "0 changes" reading is SUPERSEDED: exactly ONE change (`destroyRoot`'s classifier, §A.1.2) is now in the touched set⟩**; `renderer.ts` needs a change **only if** the identity cannot be sourced inside `mountTab` (§5.2 makes it sourceable there ⇒ **0 changes to `renderer.ts`**, recorded as the expected reading) |
| 10 | Live blocks affected | **1 re-run** (`user9_search_open_in_tab` — it should now PASS in steady state, audit §2.6) + **1 new variant** (the V1 race) + **1 driver extension** (`ufStageSig`) | §8.3; the extension is an **oracle-identity change** (`docs/specs/requirement-catalog.md` fact 3) |
| 11 | §5.U matrix rows available | **0 new** (`MATRIX_ROWS` may not change) | `docs/specs/design-extensions-review.md` §7.4/§13.3; `docs/specs/user-flow-audit.md` §2 (**8 rows, capped**) |
| 12 | `LIVE-UF9`'s recorded suspect | **wrong function named** | the row names `paneTabExpand`; that symbol is the zone **minimize** toggle `[reading] src/renderer/sidebar-panes.ts:2804-2809` |
| 13 | `U-READS-PIVOT` symbol hits in the tree | **0** (`residentKeys`, `TabCacheKey`, `CacheKind`, `MAX_RESIDENT_ENTRIES`, `MAX_RESIDENT_BYTES`, `CacheMiss`, `CacheOverBound`) | audit §0's repo-wide grep (0 matches in `src/`, `tests/`, `dist/renderer/renderer.js`) `[reading]` — the proof that this unit does **not** pre-empt the P2 gate |
| 14 | The 9a `onActiveChange` wiring (the only host notification a tab change produces) | **2 listeners** (`persist`, `onActiveChange`) | `[reading] src/renderer/renderer.ts:852-866`; `SidebarPanes` has **no** tab-id field today (`activeTabId` is this unit's addition — §5.2) |
| 15 | 9b's block state (why V6 is deferred, not raised) | **BLOCKED on `U-STATE-1e`** | `docs/specs/unit-u-shell-9b-cross-document-shared.md`'s header + §2.1 `[reading] :18-25` |

### 5.7 Cross-references (every section named below EXISTS)

**Specs / records (path + §section, the repo's citation convention).**

- `docs/specs/unit-u-shell-9a-main-focus-tabs.md` — §2.2 (the tab model), §2.3 (single-active
  render), §2.9 pin 6 (single-active as the `activeTab()` selection + the stage mount),
  §2.10 (HOST-1; and the **deferral caveat** this unit's V2/V4 fix discharges for the
  non-document case), §3 (states), §4 (F1/F3/F4/F5/F9), §5.7 (register), §5.8 (census), §6
  (cross-references). **Not renumbered by this unit.**
- `docs/specs/unit-reads-pivot-tab-cache.md` — §2.2 (`{store, kind, id}` key), §2.3 (the tab-owned
  predicate + the residency call-path table), §2.4 (in-memory only), §3.3/§3.4 (the miss policy),
  §4.2 (the in-flight generation drop — the discipline §5.3.1 mirrors), §5.1 (lifetime rules),
  §5.2 (the bound), §7 (its register), §8.1 (`FS1`..`FS22`), §8.3 (its live mandate), §8.4 (the
  fence), §9 (layer). **P2 — untouched and not pre-empted.**
- `docs/specs/design-extensions-review.md` — §3.1 A, §3.5 E (the `C10`/`TAB-1`/`TAB-2` class +
  the RCA-12/RCA-11 red-set shape), §3.6 F, §7.4 (the §5.U cap + amendment A-6), §11.3 (`GN-4`),
  §11.5 (the read model), §12.2, §12.3, §12.4, §12.5 (the `TAB-1` warning class), §13.1 (P2),
  §13.2 (S1–S5), §13.3 (per-unit gate obligations).
- `docs/specs/ui-overhaul.md` — §1 C14 (its own cell pins **"Single-document stage; one focus
  target at a time"**), §3 (the long-form C14 pin: the active tab's content renders in the central
  stage), §4 G1, §7 Q12, §8.1.
- `docs/specs/unit-u-shell-9b-cross-document-shared.md` — header (BLOCKED on `U-STATE-1e`), §2.1
  (the simultaneous render that supersedes 9a §2.3 **for 9b**), §2.10 (W2-N15), §4, §5.7, §6, §7.
- `docs/specs/unit-u-edit-1-whole-page-editing.md` — §2.1 (the single surface + its **focused**
  scope), §2.3, §3.3, §3.4, §3.5 item 6 (the host-side failure carrier keyed by the dirty
  machinery's subject; never a DOM class), §8.1 (`FS1`, `FS17`), §11.7 (the surface's layer and the
  `assembleAppGraphEnvelope` authoring), §11.8 (the adopted names: `page-edit-surface-input`/`-blur`,
  `pageSurfaceInput`/`pageSurfaceBlur`, the `Map<tabId, failure>` carrier), §12 (cross-references).
- `docs/specs/user-flow-audit.md` — §1 (the three gate artifacts), §2 (§5.U, **capped at 8**), §3
  (§6.1 schema; `proxyPASS`), §4 (§6.2 the read-only audit), §5, §6.
- `docs/specs/live-user-flow-scenarios.md` — §9 (the `user9_search_open_in_tab` block),
  "Reproduced findings".
- `docs/specs/requirement-catalog.md` — fact 3 (the O-0 oracle identity pair), §3.4 rule 7 (the
  citation discipline), §3.9 rule 6 (DERIVED counts).
- `docs/specs/rca-live-bugs-green-pipeline.md` — §3 (the dom-shim's structural blindness + the
  parked-battery root cause), §4, §5.
- `docs/defects.md` — the row **`LIVE-UF9 SEARCH-OPEN-IN-TAB-SHOWS-DOC`** (OPEN; **stale as
  written** — re-scope owed, not a close), the row **`C9-U-EDIT-1-ADVERSARIAL-MUST-FIX-SET`** (its
  (M2)/(M3) are why the commit path and the unrendered failure map are **out of scope** here).
- `docs/next-steps.md` — §CURRENT WORK (the P0–P4 program), §P2 (item 4 = `U-READS-PIVOT` is
  SPEC-LANDED / no code / no red set; item 3's status set), §HANDOVER STATE (`C9 U-EDIT-1` is
  MID-UNIT and precedes the P2 chain).
- `docs/decisions.md` — `UI-CONFIG-CARRIER`, `MCP-FOCUS-TOOL`, `MCP-UI-EQUIVALENCE`,
  `WHOLE-PAGE-EDITING` (the requirement row), `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`,
  `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`. **This unit lands no new decision row and
  supersedes none** (recorded, so the supervisor's tracker pass knows it owes only the `LIVE-UF9`
  re-scope).
- `docs/specs/wave-2-open-decisions.md` — W2-Q11 (§E.5), W2-Q12, W2-Q13, §D (W2-N10, the
  non-document stage-mount settle), W2-N15.
- `archive/reviews/2026-09-22-tab-page-ownership-audit.md` — §0, §1.3, §2.1–§2.6, §3.1, §3.2,
  §4.1, §4.2, §5 (the defect source of record for this file).

**Code (path + symbol).**

`src/renderer/sidebar-panes.ts` — `SidebarPanes.mountTab`, `SidebarPanes.mountTabs`,
`SidebarPanes.mountSearchStage`, `SidebarPanes.applyStageBody`, `SidebarPanes.mountDocumentStage`,
`SidebarPanes.reDerive`, `SidebarPanes.refresh`, `SidebarPanes.loadAppGraph`,
`SidebarPanes.applyContentChange`, `SidebarPanes.applyDocumentSet`, `SidebarPanes.onRagStoreChanged`,
`SidebarPanes.pageEditSurfaceHandlerSubject`, `SidebarPanes.pageEditSurfaceCommitState`,
`SidebarPanes.pageEditSurfaceFailure`, `SidebarPanes.pageEditSurfaceInput`,
`SidebarPanes.pageEditSurfaceBlur`, `SidebarPanes.getTabContext`,
`SidebarPanes.setCurrentDocumentId`, `SidebarPanes._currentDocumentId`,
`SidebarPanes.mountedStageKey`, `SidebarPanes.mountedDocumentIds`,
`SidebarPanes.pageCommitFailure`, `SidebarPanes.lastTraversalEnvelope`,
`SidebarPanes.reDeriveInFlight`, `SidebarPanes.backRefs`;
`src/renderer/edit-controller.ts` — `createEditController`, `EditController.markDirty`/`isDirty`/
`anyDirty`/`commit`/`saveCaret`/`restoreCaret`/`clearCaret`/`requestRebuild`, `EditControllerOptions`;
`src/renderer/renderer.ts` — the `onActiveChange`/`persist` wiring, `bootTabs`, the
`editController` construction (`onRebuild`), the gnosis `onChanged` → `refresh` callers;
`src/renderer/tab-strip.ts` — `TabStrip.commit`, `TabStrip.active`, `TabStrip.expandSearchTab`,
`TabStrip.openDocumentTab`, `TabStrip.editSearchQuery`, `TabStrip.close`;
`src/renderer/tab-state.ts` — `TabTarget`, `TabEntry`, `TabState`, `activeTab`, `focusTarget`,
`openTab`, `closeTab`, `setSearchParams`, `coerceTabTarget`;
`src/renderer/pane-graph.ts` — `assembleAppGraphEnvelope`, `surfaceBodyRoots`,
`pageEditSurfaceRoot`, `PAGE_EDIT_SURFACE_ID`, `DATA_EDIT_SURFACE`, `SEARCH_TAB_INPUT_ID`,
`SEARCH_EXPAND_TAB_HANDLER`, `SEARCH_EXPAND_TAB_ID`, `SEARCH_RESULT_OPEN_HANDLER`,
`SEARCH_TAB_SUBMIT_HANDLER`, `searchTabContent`, `landingContent`;
`src/renderer/content-reconcile.ts` — `reconcileDocumentRoots`;
`src/renderer/runtime.ts` — `Runtime.loadEnvelope`, `Runtime.tearDownGraph`,
`Runtime.applyContentReconcile` (+ **its inner `destroyRoot` classifier, the ONE change of §A.1.2**),
**`Runtime.extractContentRoots` — the root-set owner the classifier must agree with (§A.1.2)**,
`Runtime.materializedContentRoots`;
`scripts/live-drive.mjs` — `ufStageSig`, `ufRealClick`, `ufKey`, `ufPaneSearch`, `ufTabState`,
`MATRIX_ROWS`, `ROW_EXTENDED`, `BLOCKS`, the `user9_search_open_in_tab` block;
`src/shared/o0-report.ts` — the other half of the oracle-identity pair (not touched).

### 5.8 Delimitation

This unit fixes the six I1/I2 violations inside the renderer host + one envelope-input decision. It
does **not** build the tab-scoped read cache (`U-READS-PIVOT`, P2), the simultaneous multi-document
render / C20 / Option-C (`U-SHELL-9b`, blocked on `U-STATE-1e`), the `TAB-1` rendered warning
(`U-TAB-MERGE`, strictly after `U-EDIT-1`), the whole-page commit contract (`U-EDIT-1`, mid-unit),
any `RagStore` member, any MCP tool, or any persisted-state slice. It does not renumber, re-derive or
silently re-pin any existing spec or green.

---

## 6. §5.x Property register (typed, ≤ 8 rows)

This is a **CODE-BEARING** unit, so the register is mandatory (`docs/specs/design-extensions-review.md`
§13.3; the shape follows `docs/specs/unit-a1-crud-routing-proxy.md` §5.7 and
`docs/specs/unit-u-shell-9a-main-focus-tabs.md` §5.7 — identical row typings and the ≤8-row cap; the
section number here is **§6**, and `§5.x` names this table, so no id in this document collides with
the shell-9a spec's §5.7/§5.8). Rows are typed **`P-IM`** (input-model), **`P-SM`** (state-model) or
**`P-TP`** (transform) — **NEVER** `F-` rows, **NEVER** `§6`/`FS-n` rows (this unit's fail-states are
§5.5's `FS-1`..`FS-9`, which appear in the register **only** as a row's named negative
discriminator, never as a row).

**Shared machinery (pinned once, binding on every row).**

- **Seed:** deterministic, pinned **`0x7A6AC71D`** (the unit's mnemonic "TAGC-AT1D"; a fixed literal
  — never `Date.now()`, never a random default, never an environment read).
- **Budget:** **≤ 100 attempts per row, ≤ 400 total**, allocated **66 × 3 + 70 × 3 + 62 = 400** —
  rows `P-IM-1`, `P-SM-1` and `P-SM-2` carry **66** each (the ordering/cross-tab domains have the
  widest state space), `P-IM-2`, `P-IM-3` and `P-TP-1` carry **70** each, and `P-IM-4` carries
  **62**. *(Recount the allocation before the run; the ≤100-per-row / ≤400-total bounds are the
  binding constraint, not the split.)*
- **Reporting:** each row lands **`held`** or **`broken`** with its attempt count; a `broken` row
  reports the counterexample, the shrink, and the failing generator class. **Stop-after-5:** at most
  **5** distinct held-or-broken cases are reported per row. The audit is **read-only** and performed
  by an agent that did **not** author the rows (RCA-3 / `AGENTS.md` item 10d).
- **Generator discipline:** a generator is **never weakened to make a row pass**, and each row names
  its **negative discriminator** (the case that must FAIL the row) in the row itself.
- **Layer honesty per row:** the `Layer` column states whether the row is node-assertable
  (host/envelope) or **live-only** (RCA-12) — a row is never reported held from the wrong layer.

| # | Class | Layer | The proposition, as a TOTAL statement | Strategy | The discriminator that must FAIL the row (the negative case) |
| --- | --- | --- | --- | --- | --- |
| **`P-IM-1`** | IM | node (host) | **Stage-mount dominance (V1).** For **ANY** mount schedule — a sequence of `mountTab` calls over `{document, search, other}` targets interleaved with **arbitrary async settlement orders** of the `search` mounts' `bridge.rag.query` promises (including a settlement that lands after ≥1 later `mountTab`, and a settlement after `mountTab(null)`) — after **every** promise settles, the stage body in the mount DOM is **the body of the LAST `mountTab` attempt**, and `getStageMountDropped()` equals the number of superseded settlements. **Never throws.**
**⟨A.2.3 — CONFIRMED and CORRECTED IN PLACE: this row's count identity is `drops === superseded`
(“the number of superseded settlements”), which HOLDS; an over-strength `drops === settlements` form
was authored during the red-set pass and is WITHDRAWN — a settlement landing while its OWN attempt is
still the newest is NOT a drop. The row currently FAILS for a different, genuine reason: a de-duped
IDENTICAL re-mount as the LAST attempt supersedes the pending settlement yet applies no body (the
de-dupe guard at `src/renderer/sidebar-panes.ts:953-954` against the generation stamp at `:931`), which
conflicts with §5.3.1 consequence 3 — the contract decision is OWED as a further amendment, see
§A.2.3.⟩** | `strat:mount-generation-dominance` — generate a schedule of 1–6 mount calls with a seeded interleaving of their settlements (the query stub resolves on a controlled deferred) | **The stale-apply case:** a `search` settlement landing after a later `document` mount must leave the **document** body in the DOM and increment the drop counter. Inverting the guard (unconditional `applyStageBody`) must make this row **FAIL** — that inverted build is the row's built-in negative control, asserted green-on-red before the fix. *(Fails today: audit P3/P14.)* |
| **`P-IM-2`** | IM | node (envelope) | **The surface is authored from the ACTIVE DOCUMENT, totally (V4).** For **ANY** active-target kind `k ∈ {document, search, graph, template, other}` and any document set: the assembled app-graph envelope contains **exactly one** `#page-edit-surface` with `data-edit-surface === activeDocumentId` **iff** `k === 'document'`, and contains **zero** surfaces otherwise; for `k === 'document'` the surface's children are exactly the stage's document body roots (the `surfaceBodyRoots` set) and no body root also carries its own zone announcement. | `strat:surface-census-by-active-kind` — generate `(kind, documentId, landing?, parked?)` combinations and assemble | **The foreign-surface case:** with `k !== 'document'` the envelope must contain **no** `data-edit-surface` **and** no `data-rag-node-id` root from the previously active document (audit P4's `surface=doc-a` + `ALPHA=true`). A build that authors a surface (or a document root) on a non-document tab must **FAIL** the row. *(This is the one row assertable at the envelope layer.)* |
| **`P-IM-3`** | IM | node (host) | **Ownership-subject totality (V3).** For **ANY** reachable host state and **ANY** page-edit seam call (`pageSurfaceInput`/`pageSurfaceBlur`, and the internal `markDirty`/`commit`/`isDirty`/`pageCommitFailure` reads), the subject used is `getActiveTabId()` when non-`null`, else `PAGE_EDIT_SURFACE_ID` — **never** a value equal to any `documentId` in the snapshot, and never `null`/`undefined`/empty. | `strat:subject-is-tab-id` — generate tab sets (including 0-element, 1-element, duplicates on one document) with an active selection, then call the public page seam | **The document-id subject:** the case where the observed subject equals a snapshot `documentId` (audit P8: `pageEditSurfaceHandlerSubject=doc-a`) must **FAIL** the row. A build that returns `_currentDocumentId` must fail it by construction. *(Fails today.)* |
| **`P-IM-4`** | IM | node (host) | **`pageSubjectDocument` is total and stale-proof (V3-caret).** For **ANY** subject id (a live tab id, an unknown id, a retired tab id, an empty string, a `__proto__`-class key) and any host state, `pageSubjectDocument(subject)` returns `activeDocumentId` **iff** `subject === activeTabId` **and** the active target is a `document`, else `null`; it **never throws**, never returns a document for a non-active subject, and the controller's `restoreCaret` with it never restores a caret against a foreign document. | `strat:page-subject-document-total` — generate subject ids from `{active tab id} ∪ {other tab ids} ∪ {document ids} ∪ {junk strings}` | **The legacy/foreign direction:** a caret saved under tab `t1` must **not** be restored when `t2` (a different document) is active, and must **not** be validated against `backRefs` by the subject id (audit P11: every `restoreCaret` returns `undefined` today). A build that keeps `backRefs.has(subjectId)` as the guard must **FAIL** this row. |
| **`P-SM-1`** | SM | node (host) | **Single-active is preserved by every stage seam, totally (V2/V5/V6).** For **ANY** sequence drawn from `{mountTab(doc), mountTab(search), mountTab(graph/template), mountTab(null), reDerive('content'|'operator'|'template'), refresh(), rerenderAppGraph()}` applied to **any** starting state: after each step **except `mountTabs`** (where the 9b open set's document BODIES may coexist — bodies only, ⟨A.1.3⟩) the mount DOM contains the body of **at most one** document, `mountedDocumentIds` equals `[activeDocumentId]` (document) or `[]` (non-document/`null`), and **no** document body root of a non-active document is present; and at **EVERY** step including `mountTabs` the live page-edit surface census equals the active-tab predicate (`1` with `data-edit-surface === activeDocumentId` iff a document tab is active, else `0` — ⟨A.1.1⟩). **⟨A.3.1 — the `boot` STARTING state (drawn at `…pbt-generators.test.ts:1138`) is the PRE-TAB carve-out: there the body/`mountedDocumentIds`/census clauses read `stageOwner(s) = ('pre-tab', getPreTabDocumentId(s))` (`1` surface + that document's body), and the strict clause above binds from the FIRST `mountTab`/`mountTabs` onward; every other no-active-tab state stays `0`/`[]`. The row's `BROKEN @7` boot counterexample is therefore re-pinned to the carve-out clause, and its `mountTabs`-with-no-active-entry counterexample STAYS red (§A.3.1).⟩** **⟨A.4.3 — the `mountTabs` multi-seam BODY clause is a **SET**, never an ORDER: §A.1.3 amends the body clause to COEXISTENCE and no clause pins the DOM order of coexisting bodies (the measured `[doc-b,doc-a]` is the reconcile's attach order — §A.4.3). A row (or a `checkStep` branch) that compares the open set's bodies as an ordered list is OVER-STRENGTH and must compare a set. `mountedDocumentIds` stays ORDER-SENSITIVE — the open set's own order is contract (`src/renderer/sidebar-panes.ts:1150`).⟩** | `strat:stage-seam-schedule-single-active` — generate call sequences (length 1–8) over the seam alphabet with a seeded active-tab set | **The multi-mount / refresh-reload directions:** (i) a `reDerive('content')` under a non-document active tab must not add a document body (audit P4); (ii) `refresh()` under a document tab must keep `#page-edit-surface` + `#editor-toolbar` (audit P5: absent) **⟨A.1.5 — superseded: this direction HOLDS on the unmodified tree; it is a PIN, not a red discriminator (A.1.5)⟩**; (iii) `mountTabs([a,b])` followed by `mountTab` must return to one body. Any of the three inverted must **FAIL** the row. |
| **`P-SM-2`** | SM | node (host) | **Cross-tab isolation of page state (V3).** For **ANY** pair of distinct tab ids `t1 ≠ t2` (including **both bound to the same `documentId`**) and **ANY** interleaving of `pageSurfaceInput`/a successful or failed commit under each: `isDirty(t1)` and `isDirty(t2)` evolve **independently**; `pageCommitFailure.has(t1)` and `.has(t2)` are independent; `carets` entries under the two keys are independent; and `anyDirty()` is `true` iff **some** tab is dirty. A successful commit under one tab clears **only** that tab's dirty flag and failure record. | `strat:two-tab-page-state-isolation` — generate tab pairs + an interleaving of input/commit/failure events per tab (success and failure outcomes) | **The shared-key case:** with `t1` and `t2` on the same document, an edit under `t1` must leave `isDirty(t2) === false` and `pageCommitFailure.has(t2) === false` (audit P8: `isDirty(t2)=false` but `isDirty(doc-a)=true`, i.e. the state lives under the document). A build keyed by the document id must **FAIL** the row. |
| **`P-TP-1`** | TP | **live-only** (assembled) | **The PAINTED stage identity equals the active tab's (I2's app-level half).** For **ANY** executed live block sequence over the real app (real hit-tested gestures, real `rag.query` latency, real `IPC_RAG_STORE_CHANGED` ordering): at every settled read, the **painted** `#zone:main` identity derived from `data-edit-surface` / `#stage-search-tab` / `#search-tab-input` / `#stage-landing` equals the active `.tab.is-active[data-tab-id]`'s target kind, and a `#zone:main [data-edit-surface]` value **is** the active document tab's document id (or absent iff the active target is not a document). | `strat:live-stage-identity` — the live blocks of §8.3 (the extended `ufStageSig` + `ufTabState` read as one derived verdict) | **The race window and the broadcast window (live-only, RCA-12):** (i) a REAL click on `#pane-search-expand-tab` followed by a REAL click on a result/doc-nav row **inside** the query round-trip must end with the document tab's stage identity (audit §4.2 row 1); (ii) a real commit-on-blur under a search tab followed by the real broadcast must not add a document body or a surface. A build passing the node rows while failing either live direction must be reported **`broken`**, never `held`. |
| **`P-TP-2`** | TP | node (host) | **Caret lifecycle totality across a re-derive (V3-caret / V4).** For **ANY** `(subject, document-liveness, surface-presence, caret-kind)` combination — a live tab id with a live document and a present surface, a live tab id whose document was deleted, a non-document active tab, a caret whose `ragId !== PAGE_EDIT_SURFACE_ID`, an unknown subject — `restoreCaret(subject)` is **total**: it returns a caret **iff** the subject is the active tab id, its document is live **⟨A.3.2 — "live" = the carrier `isDocumentLive(doc)`; `backRefs` is the absent-carrier legacy fallback ONLY⟩**, the surface is present in the DOM, and the saved caret is page-scoped; in **every** other combination it returns `undefined`, **clears** the stale entry, and **never throws**; and the host's re-derive caret step never targets a missing `#page-edit-surface`. | `strat:caret-lifecycle-total` — generate the 5-field combination space (with `pageSubjectDocument` supplied and absent) | **The dead-guard / wrong-document directions:** the case where a caret is saved under a tab id and **not** restored while its document is live and the surface exists (audit P11) must **FAIL**; and the case where a caret is restored against a **different** document's surface must **FAIL**. A build whose guard is `backRefs.has(subjectId)` fails the first by construction. |

**Class tally:** IM ×4 (`P-IM-1`..`P-IM-4`), SM ×2 (`P-SM-1`, `P-SM-2`), TP ×2 (`P-TP-1`, `P-TP-2`) =
**8 rows ≤ 8** ✔. **No `F-` row, no `§6`/`FS-n` row** ✔ (`FS-1`..`FS-9` appear only as row
discriminators). **Budget tally:** 66 × 3 + 70 × 3 + 62 = **400 total**, every row ≤ 100 ✔,
stop-after-5 ✔.

**Over-strength check (recorded, because a row that cannot be violated is not a property).** Every
row is directly observable from the pinned surfaces of §5.2/§5.3 (`mountTab`,
`getActiveTabId`/`getActiveTargetKind`/`getActiveDocumentId`/`getStageMountDropped`,
`pageSurfaceInput`/`pageSurfaceBlur`, the mount DOM, the assembled envelope, and — for `P-TP-1` —
the live driver's derived stage identity). The **red count today is 6 of 8**: `P-IM-1` (audit
P3/P14), `P-IM-2` (P4/P5), `P-IM-3` (P8), `P-IM-4` (P11), `P-SM-2` (P8) and `P-TP-2` (P11 — the
tab-keyed direction) are **fully red** and are therefore genuine properties, not restatements of
current behavior; **`P-SM-1` is PARTLY red** — the audit's P1/P2/P6/P7/P10/P15 hold (its
single-active steady-state half is green today, so it is a **pin** there) while its (i)
re-derive-on-a-non-document-tab and (ii) `refresh()`-survival discriminators (P4/P5) are red;
**`P-TP-1` is live-only** and cannot be claimed from any node run (RCA-12) — it is red until the
live battery runs. No row is over-strength; no row passes trivially.

---

## 7. Interaction with the pinned greens (what may change, and WHY — never a silent re-pin)

### 7.1 The rule

An existing green is changed **only** where it encodes a behavior this unit's spec **contradicts**,
and **every** such row is listed below by name with the reason and the re-derived assertion.
A green that merely lacks an assertion is **extended**, never edited into a weaker form; a green that
this unit's spec **agrees with** is left **untouched**. Any edit not listed below is a review finding
(`AGENTS.md` item 10d).

### 7.2 Rows that may change (and why)

| Green | Current assertion | Disposition | Why |
| --- | --- | --- | --- |
| `tests/page-editor-host.test.ts:337-344` (§3.5 item 6 / `FS17`) | calls `h.editController.markDirty('tab-1')` **directly** with a tab id and asserts the flag survives a re-derive | **UNCHANGED (extended, not edited)** | It is already **correct**; it simply never drives the host's production key seam (the audit's §4.1 note). The new row that drives `pageSurfaceInput` and asserts a tab id belongs to **this unit's new suite**, not to that file. |
| `tests/unit-u-shell-9a-main-focus-tabs.test.ts` **HOST-1** `[reading] :835-845` | `mountTab(landing)` then `mountTab(docTab('doc-a'))` ⇒ the mount DOM contains `Doc A`, not `stage-landing` | **UNCHANGED** — and **this is a correction to the audit's §4.1 premise**: HOST-1 **does not fight this fix** (it mounts two entries whose `JSON.stringify(entry)` keys differ, and a **synchronous document** mount is unaffected by the generation guard). It is **extended** by a new row in this unit's suite: `mountTab(search)` (slow query) → `mountTab(docTab('doc-b'))` → settle ⇒ the DOM still shows BETA and **no** `stage-search-tab`. | The audit's "greens that will fight the fix" list named HOST-1/HOST-4/HOST-5/W2-N10; on reading the rows, the fight is **absent** — the rows are compatible and merely incomplete. Recorded **with the reason**, so a reader does not expect a re-pin that never happens. |
| **HOST-4** `[reading] :879-912` | a search result `li` carries the open-result handler; `openDocumentTab` opens a NEW document tab | **UNCHANGED** | This unit does not change the strip's focus/close/open semantics or the handler defs. |
| **HOST-5** `[reading] :915-935` | editing the query in a search tab reuses that same tab; the body renders its query + the in-tab submit handler | **UNCHANGED** | In-tab query reuse calls `setSearchParams` → `commit` → `onActiveChange` → `mountTab` with the **same** tab id; the generation guard permits it (newest attempt wins). |
| **W2-N10** `[reading] :996-1033` | `mountTab(searchEntry)` → the query spy sees `('alpha', 5)` once and the DOM contains `stage-search-tab`/`search-tab-input` | **UNCHANGED** | The query is **still issued** (§5.3.1 consequence 4) and the mount is **not** superseded, so its body applies. The guard adds a discard path, not a suppression path. |
| **W2-N10** parked-kind rows `[reading] :1035-1049` | `graph`/`template` mounts render their placeholders | **UNCHANGED** | The `other`/parked branch keeps its body and now also sets `activeTargetKind` (§5.2). |
| `tests/unit-u-shell-9b-*` (the `mountTabs` family: `w2n15-rederive-scope.test.ts` `[reading] :198-228`, `cross-document-shared.test.ts` `[reading] :687-690`) | multi-document mounting + the scoped-union re-derive (W2-N15) | **UNCHANGED** — because **option (a)** was chosen (§5.3.6) | Deleting `mountTabs` would re-derive these suites and pre-empt the blocked 9b wave. The reachability pin is satisfied **without** touching them. **⟨A.1.1/A.1.2 — the 9b suites' ASSERTIONS stay untouched, and their envelope censuses already assert a single `page-edit-surface` (`unit-u-shell-9b-h2-c20-materialization.test.ts:402-416`, `unit-u-shell-9b-h1-optionc-interception.test.ts:399-412`, `unit-u-shell-9b-blind-greens.test.ts:553-567`), i.e. consistent with §A.1.1. The ONE runtime change they can observe is `destroyRoot`'s widening (§A.1.2), which makes a stale surface/warning root actually destroyed: the item-10d doc review RE-RUNS these suites and records the outcome — asserted, never assumed.⟩** |
| `tests/single-editable-surface.test.ts`, `tests/page-scoped-caret.test.ts`, `tests/unit-u-edit-1-property-register.test.ts`, `tests/unit-ms5-*`, `tests/unit-u-state-1a-*`, `tests/edit-controller.test.ts`, `tests/page-diff.test.ts` | the surface / caret / commit families | **UNCHANGED** | The audit (§4.1) verified none of them drives the host's production key seam. Where one **does** construct a controller, the new `pageSubjectDocument` hook is **optional** ⇒ the legacy path is preserved (`P-TP-2`'s "supplied and absent" direction). |
| `tests/sidebar-panes-host.test.ts:310-331` (the 12-method census) | a containment check on 12 proto names | **UNCHANGED** | Containment-only (`expect(proto).toContain(m)`), so the four additive readers of §5.2 do not break it. **If** the implementer instead adds a **public** member whose name a suite asserts **absent**, that is the implementer's finding to report, not a silent test edit. |

### 7.3 Rows that must be treated as RED (they do not exist yet)

R1–R6 of the audit §4.1 (the V1 guard, the V2 scope gate, the V3 subject key, the V3 caret, the V4
surface census, the V5 `refresh` survival) plus the register's negative generators are **new red
assertions** — they are authored **before** the implementation (RCA-1) and their failing set is
**reported verbatim** in the unit's DONE row. R7 (V6) is a **pin** (green control) per §5.3.6 rule 4.
**⟨A.1 — AMENDED: (a) `R6` (the V5 `refresh()` survival) is a GREEN CONTROL, NOT a red row — the
surface/toolbar survive `refresh()` on the unmodified tree (A.1.5); authoring it as a failure is a
review finding. (b) The fix owes ONE MORE red row: `R8` — the reconcile-destroy / census row
(A.1.2): after a seam that re-authors the surface for another/next document, exactly ONE live
`#page-edit-surface` remains, carrying the active document's `data-edit-surface`, and the stale root
is gone (red today: `domSurfaces: 2` — the instrumented measurement at §A.1). (c) The two
adversarial rows `tests/stage-active-tab-display-adversarial.test.ts:317-318` are re-pinned to
A.1.4's consultation set before they are re-run.⟩**

### 7.4 The re-pin prohibition (explicit)

**No existing green may be weakened to accommodate this unit.** Specifically forbidden: editing
HOST-1/HOST-4/HOST-5/W2-N10's assertions, changing `MATRIX_ROWS` or `ROW_EXTENDED` row ids,
re-scoping a 9b row's claim, deleting a `mountTabs` requirement, or relaxing a `page-edit-surface`
census. A unit that cannot keep a listed green green **stops and re-enters this spec as an
amendment** (`AGENTS.md` item 8's discipline for a contract change), never a silent re-pin.

**⟨A.1 — this prohibition STANDS, unweakened, and it is exactly the route this amendment took.** The
Implementer refused to code around two unsatisfiable rows and re-entered the spec instead of
re-pinning; §A.1 amends **this unit's own red/adversarial rows**
(`tests/unit-stage-active-tab-display.test.ts:887`; `tests/stage-active-tab-display-adversarial.test.ts:317-318`;
`tests/stage-active-tab-display-adversarial.test.ts:385`) and **no listed green** of §7.2 — the sole
behavioral change outside the host is `destroyRoot` in `runtime.ts` (§A.1.2), which §8.1 previously
recorded as a "0 changes" reading.⟩**

---

## 8. Blast radius, the red-set plan, and the live-battery mandate

### 8.1 The touched-file census (reading, with its method)

A `SidebarPanes` grep over `tests/**` for the import/construction returned **32 test files**
(§5.6 row 5) — that is the **blast-radius family**, not the re-derivation set. The **re-derivation
set** is exactly the rows of §7.2; everything else in the family must stay green **unchanged**.

| Touched artifact | Kind | Why |
| --- | --- | --- |
| `src/renderer/sidebar-panes.ts` | host | §5.3.1 (generation guard + identity), §5.3.2 (subject key), §5.3.3 (scope gate), **§5.3.4 (`refresh`) — ⟨A.1.5: WITHDRAWN, no `refresh()` change⟩**, §5.3.5 item 3 (caret gate), §5.3.6 rule 3 (doc comment) |
| `src/renderer/edit-controller.ts` | host/pure | §5.3.2's optional `pageSubjectDocument` hook + the `restoreCaret` guard |
| `scripts/live-drive.mjs` | harness | §8.3's `ufStageSig` extension + the V1-race variant block — an **oracle-identity change** |
| `tests/unit-stage-active-tab-display.test.ts` (**new**) | test | the §5.4 states + the §5.5 fail-states + the §6 rows' host half |
| `tests/unit-stage-active-tab-display-adversarial.test.ts` (**new**) | test | the RCA-3 findings' regressions |
| `tests/unit-stage-active-tab-display-pbt-generators.test.ts` (**new**) | test | the §6 register's generators (seed `0x7A6AC71D`) |
| `src/renderer/renderer.ts` | — | **0 changes expected** (§5.2 sources the identity inside `mountTab`; recorded so a change here is a **finding** to justify, not a silent extra edit) |
| `src/renderer/pane-graph.ts`, `src/renderer/tab-state.ts`, `src/renderer/tab-strip.ts`, `src/renderer/content-reconcile.ts` | — | **0 changes** (V4 is decided by the host's `documentId` input; no envelope/reconciler behavior change) |
| `src/renderer/runtime.ts` | runtime | **⟨A.1.2 — SUPERSEDES the former "0 changes" reading of this file: exactly ONE change, `applyContentReconcile`'s `destroyRoot` classifier, which must admit the same root set `extractContentRoots` admits (`page-edit-surface` + `page-commit-warning` + `editor-toolbar` + `stage-landing` + `rag-*`/`pane-*`) so a `replaced`/`removed` classification actually destroys the stale root. Closed whitelist; no reorder of destroy-then-attach; a root still authored by `next` is never destroyed. See §A.1.2.⟩** |
| `src/shared/o0-report.ts` | — | **0 changes** (the other half of the oracle pair; a change there would be a second, unjustified oracle-identity change) |

### 8.2 The red-set plan (RCA-1: tests FIRST, red RUN and REPORTED)

**The red set must contain all six, and the report records the failing set verbatim.**

1. **V1 — the mount generation guard** (`R1`): a controlled slow `bridge.rag.query` stub; `mountTab(search)`
   → `mountTab(docTab('doc-b'))` → settle ⇒ the mount DOM contains the doc-b body and **not**
   `stage-search-tab`/`search-tab-input`; `getStageMountDropped() === 1`. *(Red today: inverted.)*
2. **V2 — the re-derive scope gate** (`R2`): search tab active → `reDerive('content')` ⇒ the DOM
   contains **no** `ALPHA`, and `/data-edit-surface="([^"]*)"/` matches **nothing** (today: `doc-a`).
3. **V3 — the subject key** (`R3`): `mountTab(t1/doc-a)` + `pageSurfaceInput()` + `mountTab(t2/doc-a)`
   ⇒ `isDirty('t2') === false`, the committed subject is a **tab id**, and `isDirty(documentId) ===
   false`. *(Red today: `doc-a`; `isDirty('t1') === false`.)*
4. **V3-caret** (`R4`): save a caret under the active tab id with a live document + a present
   surface ⇒ `restoreCaret(tabId)` returns it. *(Red today: `undefined`.)*
5. **V4 — the surface census** (`R5`): `#page-edit-surface` present iff a document tab is active; the
   non-document direction asserts **absence** (the pinned contract, §5.3.5). *(Red today for the
   document-direction-after-non-document-mount and for the envelope's `documentId` input.)*
6. **V5 — `refresh()` survival** (`R6`) — **⟨A.1.5: a GREEN CONTROL, NOT a red row⟩**: document tab ⇒
   `#page-edit-surface` + `#editor-toolbar` survive `await host.refresh()`; non-document tab ⇒ no
   document body appears. *(Not red today: `refresh()` reloads through `loadAppGraph`
   (`sidebar-panes.ts:1783-1785`) and both roots are re-authored — measured. Authoring this row as a
   failure is a review finding; it is written as a green control.)*
7. **V6 (`R7`) — the reachability pin** (a green control): zero production call sites; `mountTabs`
   then `mountTab` restores single-active.
8. **The §6 register's rows** as property tests (seed `0x7A6AC71D`; the negative discriminators are
   **run** as the rows' controls).
9. **⟨A.1.2 — the reconcile-destroy / census row (`R8`)⟩**: a seam that re-authors the surface for
   another/next document (`mountTabs([A,B])` from a doc-A-active pre-state being the pinned case) ⇒
   exactly ONE live `#page-edit-surface` remains, its `data-edit-surface` equals the active document,
   and the stale root is gone — asserted by BOTH discriminators (the authored id and the marker),
   **not** by `applyContentReconcile`'s `applied` bucket (its destroy return is discarded on the
   `replaced` path). *(Red today: `domSurfaces: 2`, the instrumented measurement at §A.1.)*

**Also in the red set, as green controls (never written as failures):** the §5.4 happy paths that
hold today (audit P1/P2/P6/P7/P10/P15), the U-LIVE4 landing rows (state 17), and the §7.2 rows.
Writing a listed green into the red set as a failure is a review finding.

### 8.3 The live-battery mandate (RCA-11 / RCA-12) — MANDATORY, not parked

**This unit CHANGES RENDERED BEHAVIOR** (which page the stage shows, when; whether a surface exists;
whether `refresh()` preserves it), so the live battery is a **MANDATORY pre-DONE gate**. Per RCA-11,
parking is legal **only** for a structurally non-exercisable surface **with the recorded park reason**
— there is none here: the stage, the tab strip, the editor toolbar and the panes are all reachable
through `scripts/live-drive.mjs`'s MCP + CDP path. **Parked-by-default is the failure mode this gate
closes**, and the audit's §4.2 table is the explicit statement that three of this unit's properties
are live-only.

**Driver (pinned):** `scripts/live-drive.mjs`, on a usable display, against the **runnable app** —
`node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=<name>` (the §6.1 command
form of `docs/specs/user-flow-audit.md` §3) for the scoped blocks, plus one **FULL-battery** run.

**The `ufStageSig` extension (pinned, and it is the audit's §4.2 requirement).** `ufStageSig`
`[reading] scripts/live-drive.mjs:237-239` today returns `{len, hash, docId, landing}` and reads
neither the surface nor the search stage (the audit's `grep` shows **0** hits for both). Extend it to
return, at minimum:

```js
{ len, hash, docId, landing,
  editSurface: <the #zone:main [data-edit-surface] value, or null>,
  searchStage: !!document.getElementById('stage-search-tab'),
  searchInput: !!document.getElementById('search-tab-input'),
  stageKind: <'document' | 'search' | 'landing' | 'placeholder' | 'unknown'>
}
```

and add **one derived verdict** read alongside `ufTabState` `[reading] :157`:
`activeTabKind` vs `stageKind` — a single boolean `stageMatchesActiveTab` plus the two values, so the
live report prints the **concrete** identity pair (never "the block passed" —
`docs/specs/user-flow-audit.md` §3's `evidence` rule). **This is an oracle-identity change**
(`docs/specs/requirement-catalog.md` fact 3): it invalidates the recorded live provenance and forces
another live run → §3b re-audit → item-10d doc review. It must be recorded **as such** in the DONE
row, never as an incidental edit.

**The live blocks (each a REAL gesture with a proven path; `proxyPASS:false`):**

1. **Re-run `user9_search_open_in_tab`** (`[reading] scripts/live-drive.mjs:3488-3515`; row
   `UF-DEFECT-7`, `ROW_EXTENDED` `[reading] :2450`): in steady state it should now **PASS** (audit
   §2.6) — the search view mounts in the new tab's `#zone:main`. **Report it as a PASS only if**
   `stageMatchesActiveTab` is `true` **and** the block's own `searchShown && !docShown` holds.
2. **The V1 race variant (NEW, and it is `P-TP-1`'s discriminator):** real click
   `#pane-search-expand-tab` (`ufRealClick` `[reading] :188`; the control id from
   `src/renderer/pane-graph.ts` `SEARCH_EXPAND_TAB_ID`), then — **inside** the real `rag.query` round
   trip that the search stage awaits — a real click on a search-result row
   (`#pane-search li[data-document-id]`) or a doc-nav row (`ufPaneSearch` `[reading] :263`);
   assert, after settlement: the active `.tab.is-active[data-tab-id]` is the **document** tab,
   `stageMatchesActiveTab === true`, `searchStage === false`, and
   `editSurface ===` that tab's document id.
3. **The V2 broadcast variant (NEW):** with a **search** tab active, drive a real commit-on-blur on a
   document surface from a real document tab first, then activate the search tab and let the real
   `IPC_RAG_STORE_CHANGED` ordering (main→preload→renderer) drive the content re-derive; assert
   `stageMatchesActiveTab === true`, `searchStage === true`, `editSurface === null`, and **no**
   previously active document body in `#zone:main`.
4. **The `refresh()` survival check (V5):** on a document tab, note `[data-edit-surface]` and the
   `#editor-toolbar` presence, trigger a real gnosis-pane refresh (the `onChanged` → `refresh()`
   caller) and re-read; assert both survive. On a search tab, assert the stage is unchanged.
5. **The persisted tab round-trip (the LIVE-5 pattern):** `ufTabState` `[reading] :157` across two
   launches with a shared `--home`; the boot active tab's stage must satisfy `stageMatchesActiveTab`
   (the node suite can only assert `TabState` coercion + the `persist` callback).
6. **The §5.U row discipline:** the live assertions of items 1–5 enter as a **re-pin** of an existing
   row or as **extended (non-matrix) rows** — `MATRIX_ROWS` may **not** change
   (`docs/specs/design-extensions-review.md` §7.4; `docs/specs/user-flow-audit.md` §2 caps the matrix
   at 8). No new matrix slot is claimed.

**The report (mandatory shape):** the §6.1 structured coverage report
(`docs/specs/user-flow-audit.md` §3) with `layer: "assembled-renderer (RCA-12)"`, `realInput: true`
for every PASS, `proxyPASS: false`, the concrete `evidence` values, and the row-set/count
reconciliation — audited read-only under §6.2 (`docs/specs/user-flow-audit.md` §4). **A FAIL here is
the unit's FAIL**, never a parked item.

### 8.4 What this unit may NOT re-derive

- The **fence** — `tests/import-render-no-duplicates.test.ts` + `tests/traversal.test.ts` must stay
  green **unchanged** (`docs/specs/design-extensions-review.md` §14.1 C-3 / §14.2: the fence plan
  lands **WITH `U-READS-PIVOT`**, not here; this unit touches no data-layer module).
- The §7.2 rows; `MATRIX_ROWS`/`ROW_EXTENDED`; `docs/specs/mcp-endpoint.md`; any 9b test; the
  `U-EDIT-1` commit-contract rows (other than the §7.2 entries); the U-LIVE4 landing rows; and
  `src/shared/o0-report.ts`.
- **Any other unit's cycle.** This unit runs its own red → green → trio → RCA-3 adversarial → RCA-4
  blind greens → item-10d doc review (`archive/reviews/<date>-unit-stage-active-tab-doc-review.md`),
  and its DONE row states the **layer** (RCA-12), the **recorded red set** (RCA-1) and the **contract
  regime** (S2: local-authoritative / pre-P2).

### 8.5 The census claims of THIS file (so item 10d can recount them)

| Claim | Kind | Recount method |
| --- | --- | --- |
| `V1`..`V6` = 6 violations | PINNED (quoted) | the audit's six defect sections (`archive/reviews/2026-09-22-tab-page-ownership-audit.md` §2.2/§2.3/§2.4/§2.5/§3.1/§3.2); **⟨A.1.5 — the audit's V5 §2.5 premise does not hold on this tree: 5 live violations + 1 NON-FINDING; see §5.6 row 1⟩** |
| `FS-1`..`FS-9` = 9 fail-states | DERIVED | count §5.5's table rows |
| the register = 8 rows / 66 × 3 + 70 × 3 + 62 = 400 | DERIVED | count §6's row table and sum the budget (**recount the split before running**) |
| the blast-radius family = 32 test files | DERIVED (this pass's reading) | re-run the `SidebarPanes` grep over `tests/**`; **never copy** |
| the touched set = 4 source/harness files + 3 new test files | DERIVED | §8.1's table; **⟨A.1.2 — recounted: `runtime.ts` joins the set (`destroyRoot` only), per §5.6 row 9⟩** |
| `RagStore` = 22 members (13 sync + 9 async) | PINNED (quoted) | `src/main/rag-store.ts` `interface RagStore`; the 2026-09-21 doc review's recount — this unit changes no member |
| `MATRIX_ROWS` may not change; §5.U is full at 8 | PINNED (quoted) | `docs/specs/design-extensions-review.md` §7.4; `docs/specs/user-flow-audit.md` §2 |
| the O-0 oracle identity pair | PINNED (quoted) | `docs/specs/requirement-catalog.md` fact 3 (`src/shared/o0-report.ts` + `scripts/live-drive.mjs`) |

---

## 9. The user-flow-audit trigger assessment (against §7.1 of `docs/specs/user-flow-audit.md`)

**The reference is a defect in the reference, and it is recorded rather than silently repaired.**
`docs/specs/user-flow-audit.md` has **no §7 and no §7.1**: its sections are **§1** (status / what the
proposal asks), **§2** (§5.U — the delta-matrix, capped at 8), **§3** (§6.1 — the coverage-report
schema), **§4** (§6.2 — the read-only audit), **§5** (feasibility verdict) and **§6** (gaps +
costs/benefits). A repo-wide grep for the task's phrase *"mechanical dom-shim-blindness predicate"*
returns **zero** matches across `docs/**`, and the phrase is not in
`docs/specs/rca-live-bugs-green-pipeline.md` either. **The nearest existing rules are**:
`docs/specs/user-flow-audit.md` §1 (**"the harness `gate` persona already requires, for a triggered
UI unit: (A) a capped §5.U delta-matrix … (B) the §6.1 structured … coverage report … (C) the §6.2
read-only audit"**) and `docs/specs/rca-live-bugs-green-pipeline.md` §3 (**the dom-shim is
structurally blind to layout/CSS/window**). **The verdict below is stated against those two, and the
dead reference is recorded as a citation finding for the supervisor's tracker pass** (the
`docs/defects.md` `TEST-CITES-MISSING-SPEC`/`ARCHIVAL-SUCCESSOR-REPOINT-BROKEN` class; item 6c: never
leave a citation pointing at a moved/absent section).

**VERDICT — the mechanical predicate FIRES and the UI-overhaul umbrella TRIGGERS: the mandatory live
battery applies to this unit.** Stated exactly:

1. **The mechanical dom-shim-blindness predicate FIRES.** The predicate is: *does this unit change a
   property the dom-shim cannot see?* Here: **yes, twice.** The V1 race lives in the **real
   `rag.query` IPC latency** (the shim's bridge resolves on a timer the harness controls —
   `docs/specs/rca-live-bugs-green-pipeline.md` §3), and the **painted** stage identity (which element
   actually occupies `#zone:main`, and whether a surface is authored into **that** assembly) is
   layout/CSS-adjacent and unassertable in a layout-less shim. The V2 ordering is likewise
   main→preload→renderer in live and a direct call in node.
2. **The UI-overhaul umbrella TRIGGERS.** This unit changes a **provenanced UI surface**: `C14`
   (main-focus tabs) and `C2` (the central stage) in `docs/specs/ui-overhaul.md` §1/§3, whose own
   pins are *"Single-document stage; one focus target at a time"* and *"the **active** tab's content
   renders in the central stage"*. A change to which page occupies the central stage **is** a
   UI-overhaul-dimension change, and `docs/specs/design-extensions-review.md` §13.3 requires a live
   battery for a code-bearing unit changing an observable app surface.
3. **Consequence (binding):** §8.3 is **MANDATORY and un-parkable** for this unit. The report is the
   §6.1 schema with `layer: "assembled-renderer (RCA-12)"`, `realInput: true`, and `proxyPASS: false`;
   the §6.2 read-only audit gates acceptance; and the DONE row states the layer, the recorded red
   set, and which **live block** carries each rendered claim.
4. **The §5.U row-set is NOT triggered in the additive sense.** The matrix is **full at 8** and
   `MATRIX_ROWS` may not change, so this unit claims **no new row**: its live assertions enter as a
   **re-pin** of an existing row (the `UF-DEFECT-7` / `U-2` neighborhood) or as **extended
   (non-matrix) rows** (`docs/specs/design-extensions-review.md` §7.4; `docs/specs/user-flow-audit.md`
   §2's exemption register — where a **zero-row** claim is an **EXPLICIT recorded exemption, never a
   silent default**). **This unit's exemption is recorded here, not assumed:** zero new matrix rows,
   with the reason being the cap plus the re-pin route.
5. **What is NOT triggered:** the **UI-overhaul umbrella's** own delta-matrix **re-authoring**, the
   fence re-plan (that lands with `U-READS-PIVOT`), the `GN-2` archival loop, and any engine/authority
   gate. No `docs/specs/ui-overhaul.md` row changes. **No page-design doc is owed, and the reason is
   recorded rather than assumed:** the task's page-design target
   (`docs/skills/designing-pages.md`, with its test-use-case coverage matrix + demo-page index)
   **does not exist in this repository** — `docs/skills/**` holds exactly one file,
   `docs/skills/process-guardrails.md` — so there is nothing to update; and, substantively, this unit
   adds **no page-design element** (no new control, token, template, pane or demo page): it removes a
   surface from a state that must not have one, re-keys host state, and gates a re-derive. **If that
   skill file is created later, the coverage/demo rows this unit would owe are: the stage's
   document/search/landing identities and the surface census by active-tab kind** (i.e. the §5.4
   states) — recorded here so a later pass does not have to re-derive the obligation.

---

## 10. Open items

**None blocking.** Four recorded, each with its owner named:

1. **The `LIVE-UF9` re-scope** — owed by the **supervisor's tracker pass** this pass (this file may
   not edit `docs/defects.md`): re-scope the row to **V1** (its stale pre-HOST-1 symptom and its
   wrong suspect `paneTabExpand` are replaced by §2.2's race reproduction), **not** closed as "does
   not reproduce".
2. **The `U-EDIT-1` §2.1/§11.7 reading note** — owed at this unit's **item-10d doc review**: record
   §5.3.5's FOCUSED definition (surface ⇔ active **document** tab; zero surfaces otherwise) against
   `docs/specs/unit-u-edit-1-whole-page-editing.md` §2.1/§11.7. **No edit to that spec in this pass.**
3. **The `docs/specs/user-flow-audit.md` §7.1 citation** — owed as a recorded citation finding
   (§9 above); the fix is the supervisor's/archival pass's, and the correct target is §1/§2/§3/§4 of
   that file.
4. **⟨A.1 — the TestWriter remand and the two amended rows⟩** — owed by the **TestWriter**, before
   the Implementer resumes: re-pin `tests/unit-stage-active-tab-display.test.ts:887` (the census
   predicate + both discriminators + an explicit pre-state; **not** `<= 1`, **not** `=== 2`),
   `tests/stage-active-tab-display-adversarial.test.ts:385` (`<= 1` ⇒ the census) and
   `tests/stage-active-tab-display-adversarial.test.ts:317-318` (the hook consultation set; no
   `'t1'` requirement, save-before-read) per §A.1.1/§A.1.4; and author the new red row `R8`
   (§A.1.2). The **item-10d doc review** then recounts §5.6 rows 1/9 + §8.5 and re-checks the
   9b/C9-adjacent suites per §A.1.2/§7.2.
5. **⟨A.3 — the second TestWriter remand (C1 + C2)⟩** — owed by the **TestWriter** before the
   Implementer resumes: re-pin `tests/unit-stage-active-tab-display-blind-contradictions.test.ts:356`
   / `:383` (S1/S2), `tests/unit-stage-active-tab-display-contract-holes.test.ts:453-476` (H-3's
   PRE-STATE clause only) and `tests/unit-stage-active-tab-display-pbt-generators.test.ts:1134-1154`
   + `checkStep` `:1092-1128` (P-SM-1's `boot` start) to §A.3.1's `stageOwner` predicate; and re-pin
   the caret oracle/liveness rows to §A.3.2's carrier
   (`…pbt-generators.test.ts:1019`, `:1035-1052`, `:1397-1415`; `…display.test.ts:840`;
   `…blind-contradictions.test.ts:463-473`, `:588-608`). **The Implementer then greens them by
   (i) splitting the SURFACE scope from `stageDocumentScope()` (the pre-tab arm) and (ii) deleting
   `seedActiveDocumentRef()` in favour of the liveness carrier** — no committed green of §A.3.3 is
   touched.

---

## A. Amendment log (append-only — never a renumbering)

Amendments to this file are **appended here** and the superseded sentences are **marked in place**
(never silently deleted), so the item-10d doc review and a TestWriter remand can act without
re-deriving. Section numbers of §1–§10 are **stable**; `A.n` ids are never reused.

### A.1 AMENDED 2026-09-22 — the census adjudication (Conflict 1), the `destroyRoot` contract (A.1.2), the caret-hook order (Conflict 2), and the V5 non-finding

**Trigger (and the process point).** The Implementer ran the §8.2 red set and refused to code around
two row-level contradictions, reporting them with instrumented evidence instead. That is exactly the
route §7.4 mandates — *"a unit that cannot keep a listed green green **stops and re-enters this spec
as an amendment**, never a silent re-pin"* — so this section is that amendment, not a waiver. The
user's requirement is the tie-breaker and is restated verbatim: **the stage always displays the page
owned by the active tab, and cached pages are owned by the tab.**

**The shared evidence (`[reading]`, a proof of the state of the tree on `2026-09-22` — recount it,
never copy it).** `mountTabs([docTab('t1', DOC_A), docTab('t2', DOC_B)])` from an identical pre-state
(a doc-A document graph carrying exactly ONE `#page-edit-surface`):

```json
{"domBefore":1,"result":{"replaced":[{"cssId":"page-edit-surface"}]},"domSurfaces":2}
```

The reconcile **did** classify the live page-edit surface as `replaced` — and the stale root stayed
live, because the destroy step **refused it** (A.1.2).

#### A.1.1 Ruling — Conflict 1: the census invariant is authoritative, total, and the 9b path is NOT exempt

**`I2-R` — the total census invariant (the authoritative restatement of §5.1 I2 clause 3 and §5.3.5
rule 1).** For **every** reachable host state `s` and **every** settle point `t`, in **every** seam —
`mountTab`, **`mountTabs`**, `refresh()`, a content re-derive (`applyContentChange` and the multi
`applyDocumentSet`), a pane-additive reconcile, `rerenderAppGraph`, and boot — the number of **live
page-edit surface roots in the stage region equals `1` iff a document tab is active**
(`activeTargetKind === 'document'`), else **`0`**; when it is `1`, that root's `data-edit-surface`
**equals** `activeDocumentId`. **No duplicates. No stale root. No seam is exempt and no pre-unit
behavior is grandfathered.** A live root carrying the authored id `PAGE_EDIT_SURFACE_ID`
(`'page-edit-surface'`) **or** the `DATA_EDIT_SURFACE` marker without the other is the **same**
violation (a leak), so every census row counts **both discriminators** and requires them to agree.

**The 9b carve-out is on BODIES, never on surfaces.** `mountTabs` (the 9b simultaneous multi-mount;
`docs/specs/unit-u-shell-9b-cross-document-shared.md` §2.1) may still materialize the open set's
document **bodies** — so after that seam `documentRootCensus` may exceed `1`, and no clause of this
spec may assert otherwise (A.1.3). It **may not** author more than the **active** document's surface,
and **any surface root that the new assembly no longer authors — or that the reconcile classifies
`replaced`/`removed` — MUST be destroyed by the reconcile**. `mountTabs` sets no active identity (it
takes no active entry), so it may never introduce a surface of its own: what is live after it is
exactly the currently active document tab's surface — or none when `activeTabId === null`.

**Which row was wrong (the ruling on the A4-vs-S14 conflict).**

| Row | Verdict | What it must assert instead |
| --- | --- | --- |
| `tests/unit-stage-active-tab-display.test.ts:887` (S14) | **WRONG — the row asserts the DEFECT as the expectation.** `surfaceIds(h).length === 2` encodes the un-destroyed stale root as correct behavior: exactly the state `I2-R` forbids and exactly what the instrumented measurement printed. It is also the only row in the tree that asserts a two-surface DOM. | **The census predicate**, with the row's pre-state made explicit (prefix the row with `mountTab(docTab('t1', DOC_A))`, as A4 step 1 does, so the active target is a document): `surfaceCensus === (getActiveTargetKind() === 'document' ? 1 : 0)`, and when `1`, `surfaceIds === [getActiveDocumentId()]` (i.e. `[DOC_A]`), with both discriminators agreeing. **Not `<= 1`, not `=== 2`.** The row's 9b half (`DOC_A`+`DOC_B` bodies present; `getMountedDocumentIds()` = the open set) stays, as A.1.1's body carve-out; its post-`mountTab` half (`surfaceIds === [DOC_A]`, `getMountedDocumentIds() === [DOC_A]`) is already right and stands. |
| `tests/stage-active-tab-display-adversarial.test.ts:385` (A4 step 2) | **Right direction, wrong strength.** `<= 1` is not the contract and is trivially satisfied by a zero surface (a build that authors NO surface on a document tab must not pass). | The same predicate as above — the **exact** census plus the identity for the active document at that step (`1` / `[DOC_A]`), never `<= 1`. |

**Also superseded by this ruling, marked in place above** (never deleted): §5.3.3 sub-rule 4's "the
multi case is **untouched**" now covers the **document-scope union** (`mountedDocumentIds`, W2-N15)
**only**, not the surface census; §5.3.6 rule 2's single-active restoration pin is retained but is no
longer the seam's whole obligation; §8.1's / §5.6 row 9's `src/renderer/runtime.ts` "**0 changes**"
reading is **upgraded to exactly one change** (A.1.2). §7.4's re-pin prohibition is intact.

#### A.1.2 Ruling — the pinned `destroyRoot` contract (the root cause, made part of the contract)

**Root cause (`[reading]`).** `Runtime.extractContentRoots` (`src/renderer/runtime.ts:150-165`)
admits **six** id classes: `rag-*` (length `> 4`), `pane-*` (length `> 5`), `EDITOR_TOOLBAR_ID`,
**`PAGE_EDIT_SURFACE_ID`** (`'page-edit-surface'`, `src/renderer/pane-graph.ts:1328`),
**`PAGE_COMMIT_WARNING_ID`** and `LANDING_ROOT_ID`. `Runtime.applyContentReconcile`'s inner
`destroyRoot` classifier (`:563-569`) admits only **four**: `rag-*`, `pane-*`,
`EDITOR_TOOLBAR_ID`, `LANDING_ROOT_ID`. The pure reconciler already treats the two missing classes as
content roots (`src/renderer/content-reconcile.ts` — `asContentRoot` `:116-129`, `isPaneLikeRoot`
`:156-164`), so a `replaced` page-edit surface (or a warning root the new assembly no longer authors)
is computed, handed to the apply step, **refused by the classifier, and left live** — the second
surface.

**⟨CORRECTED 2026-09-22 (item-10d documentation review) — the `extractContentRoots` half of the
"Root cause" paragraph above is FALSE as written; it is marked in place, never deleted.⟩** On the tree
this review read, **`Runtime.extractContentRoots` admits FIVE id classes, not six** —
`src/renderer/runtime.ts:141-166`, the admission test at **`:150-159`**: `rag-*` (length `> 4`),
`pane-*` (length `> 5`), `EDITOR_TOOLBAR_ID`, **`PAGE_EDIT_SURFACE_ID`**, `LANDING_ROOT_ID`.
**`PAGE_COMMIT_WARNING_ID` was NOT among them** (which is why the paragraph's "and
**`PAGE_COMMIT_WARNING_ID`**" clause is struck here), while `destroyRoot` (`:567-574` at that same
reading, after the §A.1.1/§A.2.5 widening) and the pure reconciler
(`src/renderer/content-reconcile.ts` `asContentRoot` `:127`, `isPaneLikeRoot` `:161`) DO admit it —
i.e. the two functions **disagreed**, which is the opposite of clause 1's premise. **The missing class
is exactly why the C9 warning could not attach through the reconcile path:** `nextById` is built from
`extractContentRoots(input.next)` (`runtime.ts:544-548`), so an `added`/`replaced`
`page-commit-warning` root was handed to the apply step and **refused** — the added/replaced arms of
`applyContentReconcileBody` (then `:620-628`) push
`applyContentReconcile: added root missing from next: page-commit-warning` and never call
`attachRoot`. **Consequence recorded for the owner:** `docs/specs/unit-u-edit-1-whole-page-editing.md`
§3a `M5`'s "the warning is re-authored IMMEDIATELY through the content reconcile" was therefore only
**conditionally** true, and the node rows `W1`/`W2`/`W3` (`tests/page-commit-failure-visibility.test.ts`)
are red on that tree — the correction is annotated at §3a `M5` itself, not re-derived here.
**THE PRODUCTION FIX LANDED DURING THIS REVIEW (closing re-read, same pass):**
`extractContentRoots` now admits the class — `src/renderer/runtime.ts:152-176`, with
**`PAGE_COMMIT_WARNING_ID` at `:174`**, and the omission + the refusal recorded verbatim in the
predicate's own doc comment (`:138-151`: *"The warning class was omitted here while the whitelist
admitted it, so the failure path's content reconcile emitted `added: ['page-commit-warning']` and then
REFUSED it …"*); `destroyRoot`'s closed set is at `:583-590` (`PAGE_COMMIT_WARNING_ID` `:589`). **So
the closed six-class parity clause 1 pins is TRUE again as of that re-read** — the narrative above is
retained as the record of the pre-fix reading, and clause 1's "only those **six** id classes" remains
correct for `destroyRoot` (it was clause-adjacent prose, not the contract, that over-counted the
**extractor**). **Reading-state pin (both readings taken by this review, minutes apart — the tree was
under concurrent edit):** **R-A** = the pre-fix tree (`runtime.ts` 1 609 lines; pins `:141-166`,
`:150-159`, `:567-574`, `:544-548`, `:620-628`); **R-B** = the closing re-read (`runtime.ts` 1 625
lines; pins `:152-176`, `:174`, `:583-590`). Every line pin in this block is a **drift pin** — the
path + SYMBOL is the citation (§11.10's anchor rule). **No row, status or test expectation in this
file is changed by this correction.**

**The contract (code-bearing; one change in one file).** `destroyRoot` **MUST** admit exactly the set
`extractContentRoots` admits — `rag-*` (`> 4`), `pane-*` (`> 5`), `EDITOR_TOOLBAR_ID`,
`PAGE_EDIT_SURFACE_ID`, `PAGE_COMMIT_WARNING_ID`, `LANDING_ROOT_ID` — so that a `removed` bucket
entry, the pre-attach half of a `replaced` entry, and an `identityReplaced.from` entry **actually
destroy the stale root** (`runtime.ts:610-613`, `:623-632`, `:636-646`). Three pinned clauses:

1. **Closed whitelist, never a wildcard.** Only those **six** id classes are admitted; an arbitrary
   or hostile bucket css id still returns `false` (the `AF2` discipline at `:556-559` stands) — no
   template/zone node is ever destroyed by a bucket entry.
2. **A root still authored by `next` is never destroyed by the widening.** Order is unchanged:
   `nextById` is built from `extractContentRoots(input.next)` (`:550-553`); `removed` destroys;
   `added` does not; `replaced` destroys **then** attaches (`:623-632`); `kept` destroys nothing. The
   widening must not reorder that, and must not change `applied`/`warnings` reporting beyond the two
   newly-admitted classes.
3. **Consequence for the C9 unit (recorded, not a silent cross-unit change).** The `U-EDIT-1 (C9)`
   warning/surface roots become **destroyable**: an authored `page-commit-warning` that the reconcile
   no longer authors is now genuinely removed (the `M3` "phantom warning" direction of the
   `docs/defects.md` row `C9-U-EDIT-1-ADVERSARIAL-MUST-FIX-SET`), and a stale surface root is
   genuinely replaced. The item-10d doc review **re-runs** the C9-adjacent suites
   (`tests/page-commit-failure-visibility.test.ts`, `tests/single-editable-surface.test.ts`) and the
   9b suites, and records the outcome — asserted, never assumed.

**The red row that proves it — `R8` (see §7.3, §8.2 item 9).** After a seam that re-authors the
surface for another/next document (pinned case: `mountTabs([A,B])` from a doc-A-active pre-state),
**exactly one** live `#page-edit-surface` remains, carrying the active document's `data-edit-surface`;
red today (`domSurfaces: 2`). TestWriter note: `applyContentReconcile`'s `applied` bucket is **not** a
reliable destroyed-root oracle on the `replaced` path (the destroy's return is discarded; only the
re-attach's is pushed — `:629-631`), so the row asserts the **live DOM census by both
discriminators**, not the report.

#### A.1.3 Ruling — the body clause is not total at the `mountTabs` seam (a third, latent contradiction, adjudicated the same way)

§6's `P-SM-1` states "after each step the mount DOM contains the body of **at most one** document",
while `tests/unit-stage-active-tab-display.test.ts:519-527` (S3, a listed green control) asserts
`mountTabs([t1,t2])` shows **both** `Doc A` and `Doc B` ⟨**A.4 — DRIFT PIN, marked in place: at the
§A.4 read that S3 row is `tests/unit-stage-active-tab-display.test.ts:618-629`** (`:620` the
`mountTabs([t1,t2])` call, `:622-623` the two order-insensitive `toContain` assertions); its
**assertion content is unchanged** and the §A.1.3 ruling stands verbatim — only the line pin moved.⟩, and 9b's whole point is that simultaneous
render. As written, `P-SM-1`'s body clause is **unsatisfiable** at that seam — the same class of
contradiction as Conflict 1, so it is adjudicated here. **Amended:** the body clause quantifies over
every seam **except `mountTabs`** (bodies only may coexist there), and the **surface** clause is total
at every seam including `mountTabs` (A.1.1). **⟨A.4.3 — CONFIRMED and PINNED as the seam's WHOLE body obligation: `mountTabs`' multi-seam
body clause is a **SET** (coexistence), never an ORDER. No clause of this spec, of §5.3.6, or of
`docs/specs/unit-u-shell-9b-cross-document-shared.md` pins the DOM order of coexisting document bodies
(the measured order is the reconcile's attach order — §A.4.3). An order-sensitive body assertion at
that seam is OVER-STRENGTH.⟩** In addition, A4's `:380-384` body derivation is
**defective as a reader** (`String(r).split('-')[0]` collapses `doc-a-*` and `doc-b-*` to one token,
so the row passes vacuously): the amended row keys the census by document, not by the first
`-`-delimited token.

#### A.1.4 Ruling — Conflict 2: the caret-hook order is pinned, and both `A3/P-IM-4` rows are unsatisfiable as written

**The pinned order stands (§5.3.2), restated with the observable that makes it testable.**
`restoreCaret(subjectId)`:

1. `saved = carets.get(subjectId)`; **if `saved == null` ⇒ return `undefined` and DO NOT consult
   `pageSubjectDocument`.** A read with no saved caret cannot be changed by the hook's answer, so
   consulting it is a host-state side effect the harness must be able to forbid. **The hook's
   consultation set is therefore exactly the subjects read WITH a saved caret entry, once per call,
   in read order.**
2. Else `doc = opts.pageSubjectDocument?.(subjectId) ?? null`, then §5.3.2's four branches unchanged
   (hook absent ⇒ **legacy** `backRefs.has(subjectId)`; `doc === null` ⇒ clear + `undefined`;
   `!opts.backRefs.has(doc)` ⇒ clear + `undefined`; else the existing `FS2` page-scope check, then
   return `saved`).

**Why both rows are impossible (the evidence).** In
`tests/stage-active-tab-display-adversarial.test.ts`: `HOSTILE_SUBJECTS` (`:281`) contains **no**
`'t1'`, so `if (s === 't1') continue` (`:307`) is **dead code** and **no** `restoreCaret` call in that
row ever receives `'t1'` ⇒ `:318`'s `toContain('t1')` is unsatisfiable by **any** implementation. And
the row's loop reads each subject **before** saving a caret under it (`:308-310`), so the caret-less
early return means the hook is **never** consulted ⇒ `:317`'s `hookCalls.length > 0` contradicts the
pinned order above (it would be satisfiable only by consulting the hook *before* the caret check —
precisely the deviation the pin forbids). Neither row is a code bug: both are **row bugs**.

**What the rows must assert instead.** `:317`/`:318` are re-pinned to the **consultation set**: save
a caret under **each** hostile subject first, then read it back, then assert `restoreCaret(s) ===
undefined` for every hostile `s` (the hook's `null` answer is what discriminates), and assert
`hookCalls` **equals** the hostile-subject list in read order (each consulted exactly once) — **and
does not contain `'t1'`** (the caret-less direction). No row may require a hook call for a subject
that has no saved caret. The hook's positive direction (`subject === activeTabId` ⇒ its document)
stays with the sibling row that already owns it.

#### A.1.5 Ruling — V5 is a recorded NON-FINDING and leaves the fix order

**§1 item 5 / §2 / §5.3.4's premise — "`refresh()` reloads the RAW traversal envelope instead of
`loadAppGraph`'s assembled form" — is WITHDRAWN, recorded as a NON-FINDING.** Measured on this tree:
`SidebarPanes.refresh()` (`src/renderer/sidebar-panes.ts:1763-1791`) reloads through
`this.loadAppGraph(this.runtime, this.lastTraversalEnvelope)` (`[reading] :1783-1785`) — the
re-assemble path, which authors the toolbar (`applyEditorToolbar`, `[reading] :1489`) and the surface
(the assembler's `documentId` input, `[reading] :1476`) and then loads that assembled envelope. So
**`#page-edit-surface` + `#editor-toolbar` survive `refresh()` on a document tab**, and the
non-document direction holds too (the audit's P5 measurement, `search-body=true ALPHA=false
BETA=false`).

**V5 stays in this file as a recorded id and a MONITOR, not as a work item.** It leaves the §5.3 fix
order, `refresh()` receives **no** code change in this unit, `§8.2`'s `R6` is a **green control** (it
is not red today), and `FS-8` is a **monitor** fail-state. If a live run ever shows `refresh()`
re-materializing a body/surface under a non-document tab, that is a **new red row / a further
amendment**, never a silent extra edit (§5.3.4 sub-rule 3, unchanged).

**Recounts this amendment forces (the item-10d review must apply them, never copy them):** §5.6 row 1
— the audit's six named rows are now **5 live violations to fix (`V1`, `V2`, `V3`, `V4`, `V6`) + 1
recorded NON-FINDING (`V5`)**; §5.6 row 9 / §8.5 — the touched set is now **4 source/harness files**
(`sidebar-panes.ts`, `edit-controller.ts`, **`runtime.ts` (A.1.2)**, `live-drive.mjs`) **+ 3 new test
files**.

#### A.1.6 The affected rows and sections, in one place (for the TestWriter remand and the item-10d review)

| Artifact | Owed change | Ruling |
| --- | --- | --- |
| `tests/unit-stage-active-tab-display.test.ts:887` | `=== 2` ⇒ the exact census predicate + both discriminators + an explicit doc-tab pre-state | A.1.1 |
| `tests/stage-active-tab-display-adversarial.test.ts:385` | `<= 1` ⇒ the exact census predicate (both directions) | A.1.1 |
| `tests/stage-active-tab-display-adversarial.test.ts:318` | `toContain('t1')` ⇒ `hookCalls` equals the hostile-subject consultation set (no `'t1'`) | A.1.4 |
| `tests/stage-active-tab-display-adversarial.test.ts:317` | `hookCalls.length > 0` ⇒ the consultation set, with save-before-read | A.1.4 |
| new `R8` row (this unit's suite) | the reconcile-destroy / census row | A.1.2, §7.3, §8.2 item 9 |
| §5.1 I2 clause 3, §5.3.3 sub-rule 4, §5.3.5 rule 1, §5.3.6 rule 2, §6 `P-SM-1`, §7.2 (9b row), §7.3, §7.4, §8.1, §8.2 items 6/9, §8.5, §5.6 rows 1/9, §1 item 5, §2, §3, §5.3.2, §5.3.4, §5.5 `FS-8`, §10 | marked in place; no renumbering | A.1.1–A.1.5 |

### A.2 AMENDED 2026-09-22/23 (`[reading]` — see §A.2.0 for the date's provenance) — the adversarial + verification record: §3a/§3b land, the H-1…H-5 per-finding status, the boot-seam census (three independent derivations), the two PBT failures, the P-IM-1 count-identity correction, the H-4 spec-side gap, and the blind artifact's stale `C7`

**Scope of this pass (recorded, per §A.1's discipline).** This pass wrote **two files only**:
**this file** and **`docs/specs/unit-stage-active-tab-display-greens.md`** — no `src/**`, no `tests/**`,
no tracker (`AGENTS.md` item 6's tracker rows are the supervisor's). It **adds** the two sections
**§3a** and **§3b** that §8.2's `R8` row and §5.3.4 sub-rule 3 already promised (a cross-reference, so
the promise is discharged, never renumbered), and appends this amendment. **Nothing is renumbered and
no superseded sentence is deleted** — every superseded reading is marked **in place** with its
successor.

#### A.2.0 The method of this pass, and what it does NOT claim

**Static re-read only — NO test run by this pass.** The SpecDoc tool wall is read/search + doc writes
(no shell), so **every status below is derived from the tree's state as read** — the source line
ordering, the assertions' contents, and the test files' own recorded run readings — **never from a run
executed by this pass**. Where a status rests on a *test file's own recorded run* (the PBT header, the
blind-contradictions header), that is written as **the recorded reading**, not as a re-run by me.
Consequently: **`FIXED`** below means "the source re-read shows the clause satisfied"; **`OPEN`** means
"the source re-read shows the clause still violated **and** the owning row still asserts the
contract's direction"; **`PARTLY FIXED`** names which half moved. A TestWriter/Implementer run may
supersede any cell — the **owning test file + row** is named in every cell so a re-run can be
reconciled against this table without re-deriving it. **The date is `[reading]`**: the tree's newest
own dated record is `2026-09-22`; this amendment carries **2026-09-22/23** and a doc review must
correct it if the calendar says otherwise.

#### A.2.1 §3a — the host findings and their current dispositions

The **RCA-3 adversarial pass** (read-only) ran on this unit's landed implementation and produced
**H-1/H-1b, H-2, H-3 (+ the boot-seam census), H-4, H-5**; **two independent verification passes** ran
after it (the blind-contradictions re-measure of the artifact's FAILs, and the contract-holes/
PBT red-set re-read) and are the second and third derivations of **H-3**. Their rows live in
**`tests/unit-stage-active-tab-display-contract-holes.test.ts`** (H-1…H-5) and
**`tests/unit-stage-active-tab-display-blind-contradictions.test.ts`** (the boot census + the hook).
Status as read **§A.2.0's method**:

| id | The finding (as the adversarial pass reported it) | Evidence (`file:line` / file+row) | Status at this read | Owning row |
| --- | --- | --- | --- | --- |
| **H-1** | `mountedDocumentIds` was stamped **before** the `key === mountedStageKey` de-dupe early-return, so `mountTab(t1/doc-a)` → `mountTabs([])` → `mountTab(t1/doc-a)` left the identity triple and the mounted set disagreeing while the stage still displayed the pruned tab's page. | The **stamping moved**: `mountedStageKey`/`mountedDocumentIds` are now set **inside** each kind branch **after** the de-dupe guard (`src/renderer/sidebar-panes.ts:953-958`, `:967-969`, `:973-974`) — the guard `:954`. But `mountTabs([])` still sets `mountedDocumentIds = []` (`:1022`) + `mountedStageKey = null` (`:1024`) and **early-returns** (`:1025`), and `prunePageState` clears **only** `activeTabId` (`:3555-3557`), leaving `activeTargetKind`/`activeDocumentId` stamped and the stage body intact. | **PARTLY FIXED** — the stamping-order half (`mountedDocumentIds` no longer set ahead of the guard) is satisfied in the source. The **identity half is OPEN**: at the `mountTabs([])` prune seam the tree still reaches "no tab + non-null kind", `mountedDocumentIds=[]` with `activeDocumentId='doc-a'`, and a live `doc-a` surface, which `P-SM-1`'s settled-seam equality and `I2-R` forbid. | `…contract-holes.test.ts` **H-1** (`:308-365`) / **H-1b** (`:367-386`) — both `[RED]` as read |
| **H-2** | Two different scope predicates owned the two seams — `stageDocumentScope()` returning `_currentDocumentId` whenever `activeTabId === null` vs the re-derive gate's own predicate — so `reDerive` and `refresh()` could scope to **different** documents in one host state. | `stageDocumentScope()` is now the single helper (`:3517-3520`) and **is** used by `loadAppGraph` (`:1725`), `applyContentChange` (`:1768`), `applyDocumentSet` (`:1849`), `reauthorPageCommitWarning` (`:3574`) and `commitPageEdit` (`:3649`). But the re-derive gate still predicates **separately**: `nonDocumentActiveTab = this.activeTargetKind != null && this.activeTargetKind !== 'document'` with `current = this.activeDocumentId ?? this._currentDocumentId` (`:2264-2272`), while `stageDocumentScope()` returns `_currentDocumentId` (not the `??` fallback) in the same `activeTabId === null` state — and `refresh()` consumes `stageDocumentScope()`. | **OPEN** — the two seams still disagree in the "no tab + non-null kind" state (`reDerive` keeps the `doc-a` surface, `refresh()` re-authors it as `_currentDocumentId`), i.e. the `FS-3`/`FS-7` class is unrepaired. The state is reachable today **only** at the test-only `mountTabs` seam (§A.2.1's H-3 note), so the row is a latent-seam row, not a production-path claim. | `…contract-holes.test.ts` **H-2** (`:394-434`) `[RED]`; **H-2b** (`:436-445`) is the document-tab green control |
| **H-3 + the boot-seam census** | Boot and `mountTabs` authored a page-edit surface with **NO active document tab** — a violation of `I2-R` (§A.1.1), which is total at **every** seam and names **boot**. | Boot: `current = this._currentDocumentId ?? documentIds[0]` then `setCurrentDocumentId(current)` (`:2177-2180`) → `loadAppGraph` → assembler input `documentId: this.stageDocumentScope() ?? undefined` (`:1725`) → `stageDocumentScope()` returns `_currentDocumentId` when `activeTabId == null` (`:3518`). `mountTabs`: `applyDocumentSet` falls back to `documentIds[0]` when the active scope is null or not in the open set (`:1849-1851`). | **OPEN** — both arms reproduce, and **three independent derivations agree** (§A.2.2). The fix is owed at `stageDocumentScope()`'s no-tab arm and at `applyDocumentSet`'s `documentIds[0]` fallback; **neither is changed in the tree at this read**. | `…contract-holes.test.ts` **H-3** (`:453-476`) + **H-1b** (`:367-386`) `[RED]`; `…blind-contradictions.test.ts` **ROW 1 / S1+S2** (`:356`, `:383`) `[RED]` — reproduces the artifact **verbatim**; **`P-SM-1`** (`…pbt-generators.test.ts:978`) **BROKEN @7** |
| **H-4** | A closed tab's caret survived, and could be restored against the **re-minted** id's **other** document (`dropClosedPageState` frees only the dirty flag + the failure record). **The unbounded-growth half is a SPEC-SIDE GAP** (§A.2.4). | `dropClosedPageState` (`:3581-3589`) calls `invalidatePageSubject` + `clearDirty` + `pageSubjects.delete` + `pageCommitFailure.delete` — **no `clearCaret`**, and the `carets` map is the controller's (`src/renderer/edit-controller.ts:129`). The id re-mint is real: `nextTabId` keys off `state.open.length + 1` (`src/renderer/tab-state.ts:207-212`), so closing the LAST tab re-mints its id; the re-mount then re-seeds the **new** document (`sidebar-panes.ts:963`, `:3530-3534`), so the stale caret validates as "live" for the wrong document. | **OPEN** — the caret is not dropped at the close seam. | `…contract-holes.test.ts` **H-4** (`:484-512`) `[RED]`; **H-4b** (`:514-523`) is the no-over-eviction green control |
| **H-5** | `seedActiveDocumentRef()` keys a **document id** in `backRefs`, whose documented invariant is `Map<ragNodeId, nodeId[]>` — and `isEditable`/the commit pre-check consult that map. | `seedActiveDocumentRef` still does `if (!this.backRefs.has(id)) this.backRefs.set(id, [])` with `id = this.activeDocumentId` (`:3530-3534`; called at `:963`, `:1826`), while the invariant is documented at `src/renderer/edit-controller.ts:11` (`Map<ragNodeId, nodeId[]>`) and consumed by `isEditable` (`:169`) + the commit pre-check (`:175`). | **OPEN** — a document id is still a `backRefs` key, so it reads as an **editable/committable node**; the map's invariant is neither kept nor explicitly relaxed in the docs (the finding's own either/or). | `…contract-holes.test.ts` **H-5** (`:530-555`) `[RED]` |

**The two PBT failures (same adversarial pass's register half).**

| id | The failure | Evidence | Status at this read |
| --- | --- | --- | --- |
| **`P-IM-1`** | A **REPEAT** `mountTab` as the LAST attempt supersedes the pending settlement, but the de-dupe early-return means **no attempt lands** — the stage keeps the previous body (or none), contradicting the dominance clause. The **count identity** half is correct after the correction (§A.2.3). | `…pbt-generators.test.ts` **P-IM-1** header `:39-43` (**BROKEN @43 attempts**) + the row's own dominance clause `:599-622` (the "a LAST attempt that was de-duped is still the newest attempt" branch) vs the source guard `sidebar-panes.ts:953-954`; consequence 4's "the query is still issued for a superseded mount" is asserted at `:589-591`. | **OPEN** for the dominance clause (a de-duped last attempt applies nothing); the count-identity clause `drops === superseded` HOLDS. **The clause conflict is in THIS FILE** (§A.2.3). |
| **`P-IM-2`** | A **MIXED-document** envelope let the surface authored for the **active** document adopt a **FOREIGN** root (`data-rag-node-id`) — the `FS-2`/`FS-3` class at the envelope layer. | `…pbt-generators.test.ts` **P-IM-2** header `:44-46` (**BROKEN @51 attempts**) + the row's foreign-root leg `:739-745` (the envelope census) and its host legs `:763-772`. | **OPEN** — the envelope's `surfaceBodyRoots` set is not scoped to the active document, so a foreign body root can be adopted inside the active document's surface. |

#### A.2.2 The boot-seam census: **three independent derivations** (recorded so it is never re-derived)

The boot/`mountTabs` no-active-document-tab surface was found **three separate ways**, and a **fourth,
later harness reproduced it independently**:

1. the **RCA-3 adversarial pass** (`…contract-holes.test.ts` **H-3**, and the boot pre-state asserted
   inside **H-1**'s row: `:456-462`);
2. the **PBT `P-SM-1` schedule at step 7** — `strat:stage-seam-schedule-single-active`, whose drawn
   **starting state** includes `'boot'` (`…pbt-generators.test.ts:983-999`) and whose seam schedule
   reaches the boot/open-set state at early steps; the run reports **BROKEN @7 attempts** with the
   boot/open-set counterexamples (`:49-52`);
3. the **blind-greens artifact's `A11`/`A11b` rows**
   (`docs/specs/unit-stage-active-tab-display-greens.md` §A) — **`❌ FAIL`**, and
4. **independently reproduced by a later harness**:
   `tests/unit-stage-active-tab-display-blind-contradictions.test.ts` **ROW 1 / S1 + S2** (`:356`,
   `:383`), whose own recorded run reading is **RED — 2 rows**, reproducing the artifact's values
   **verbatim**: `[page-edit-surface]=1 [data-edit-surface]=1 marker=["doc-a"] agrees=true` with
   `activeTabId=null activeTargetKind=null activeDocumentId=null` — at boot **and** with the persisted
   `defaultDocumentId='doc-b'`.

**Consequence (binding on the record, not a new clause).** `A11`/`A11b` are **CONFIRMED**, never
"stale evidence": the artifact's FAIL rows stand, the boot seam is an `I2-R` seam, and **H-3 is the
open finding that carries them**. The artifact's `A11`/`A11b` rows are annotated as CONFIRMED **in
place** (greens file, this pass) with this derivation list.
**⟨A.3.1 — SUPERSEDED IN PART: "the boot seam is an `I2-R` seam" is now "the boot seam is the
PRE-TAB CARVE-OUT seam of the amended `I2-R`" — its surface is AUTHORED (one, for
`getPreTabDocumentId()`), not forbidden, so the artifact's `A11`/`A11b` FAIL rows are re-pinned to
the carve-out clause (the derivations above remain valid: the seam is real and the pre-tab document
is not the active tab). H-3's PRE-STATE clause is re-pinned with them; H-3's post-`mountTabs` clause
stays red and unchanged. See §A.3.1/§A.3.3.⟩**

#### A.2.3 The `P-IM-1` count-identity correction (over-strength — corrected, and marked in place)

**The recorded correction.** §6's `P-IM-1` stated the drop count as *"`getStageMountDropped()` equals
the number of **superseded settlements**"* — that is the **correct** identity
(`…pbt-generators.test.ts:593-597`: `drops === superseded`). An **over-strength** form — `drops ===
settlements` — was authored during the red-set pass and is now **corrected here**: a settlement that
lands while its **own** attempt is still the newest **is not a drop**, so the two counts differ
whenever a surviving settlement exists (the row asserts that class is **drawn**,
`:630-633`). **Marked in place inside §6's `P-IM-1` row** (the `⟨A.2.3 …⟩` block appended to the row's
proposition cell). The row now fails for a
**different, genuine** reason: the de-duped-last-attempt dominance clause (§A.2.1's `P-IM-1` cell) —
the correction did **not** fix the row, and must not be read as having done so.

**Also recorded (a spec-side conflict this correction exposes, not adjudicated into a clause here).**
The dominance clause and §5.3.1 **consequence 3** ("the `JSON.stringify(entry)` de-dupe is retained
unchanged: an identical re-mount is still a no-op") **cannot both hold** when the de-duped repeat is
the **last** attempt: the guard (`sidebar-panes.ts:953-954`) returns before the body apply, while the
generation stamp at the attempt's **entry** (`:931`) has already superseded the pending settlement.
The resolution is a **contract decision** (drop the de-dupe for search mounts, or exempt a de-duped
last attempt from the dominance clause) and it is **owed as a further amendment**, not invented by
this record.

#### A.2.4 The H-4 **spec-side gap** (no clause permits the fix — recorded, never silently invented)

`dropClosedPageState`'s drop set is the dirty flag + the failure record (`sidebar-panes.ts:3581-3589`;
`docs/specs/unit-u-edit-1-whole-page-editing.md` §3.5 item 3 enumerates exactly those two), and
**§A.1.4 clause 1 pins the opposite direction for carets**: a caret survives until a **read** decides
it. **No clause of this spec mandates a close-time caret eviction** — so H-4's row asserts only the
direction the spec **does** pin (`§6 P-TP-2`'s wrong-document discriminator + §5.1 I1's caret-viability
clause + `FS-6`: *"a caret restored against a different document's surface must FAIL"*,
`…contract-holes.test.ts:77-87`), and the **unbounded-growth half** — one `carets` entry retained per
closed tab that is never read — is recorded **here as a SPEC-SIDE GAP for the supervisor**, with the
fix shape (**a close-time eviction clause, or an explicit relaxation of §A.1.4 clause 1**) named and
**not** authored. It is **not** a host finding with a licensed fix.

#### A.2.5 Non-findings (stated so they are never re-derived)

The adversarial pass, the PBT run and both verification passes found **no** seam that yields:
**(a) TWO page-edit surfaces** on a production path — the two-surface state (`domSurfaces: 2`) is the
**pre-`destroyRoot`-widening** measurement of §A.1 and is **FIXED** on this tree
(`src/renderer/runtime.ts:572-580` now admits `PAGE_EDIT_SURFACE_ID` + `PAGE_COMMIT_WARNING_ID`, so a
`replaced`/`removed` surface root is actually destroyed; a root **still authored by `next`** is never
destroyed — the **negative arm of §3b**, cross-referenced to §A.1.2 clause 2);
**(b) a stale surface root** surviving a reconcile; **(c) a zero-surface DOCUMENT tab** — i.e. no seam
where a document tab is active and the census is `0`. **⟨A.4.2 — the (c) non-finding STANDS and is
NOT reopened by the PBT's residual reading: the reported pane-additive `0`-surface counterexample was
**not reproducible from the HEAD source by any trace this pass could follow** (§A.4.2), so (c) is not
contradicted here; if that reading lands on a HEAD re-run it is a genuine `I2-R` + clause-(b)
violation and `(c)` must then be rewritten in place as `REOPENED` — never silently.⟩** **The earlier `S14 === 2` expectation
(`tests/unit-stage-active-tab-display.test.ts:887`) was the DEFECT, not the contract** (§A.1.1's
ruling stands: *the row asserted the defect as the expectation*), and **any restatement of
`S14 === 2` as a contract is a re-derivation of a refuted finding**. The `P-IM-2` MIXED-envelope case
is **not** one of these non-findings — it **is** a live foreign-root case (§A.2.1).

#### A.2.6 The §3b clauses are HOST-side, and the negative arm is recorded (§A.1.2 cross-reference)

**Recorded as a clause-level fact for the TestWriter.** The two census clauses this unit's register
rests on — **(i)** `I2-R`'s **live page-edit surface census** (`1` iff a document tab is active, else
`0`, with `data-edit-surface === activeDocumentId` when `1`) and **(ii)** the **`destroyRoot`
admission set** that makes a stale surface/warning root actually destroyable — are **HOST-side**
clauses: they are asserted at the **host/envelope** layer (`mountTab`/`mountTabs`/`refresh`/re-derive
/`rerenderAppGraph`/boot and `assembleAppGraphEnvelope`'s `documentId` input / `Runtime.applyContentReconcile`'s
buckets), **never** from the live/painted
layer, and a node green here is **ENVELOPE/HOST-green, never APP-green** (§9; RCA-12). Their
**negative arm** is part of the contract, not an aside: **a root that `next` still authors is NEVER
destroyed** (`runtime.ts:570-571`, `:549-553`, `:621-643` — `kept` destroys nothing, `replaced`
destroys **then** attaches, the whitelist stays closed), i.e. the widening may not turn a
`kept`/still-authored root into a destroy. The full statement, the closed-whitelist clause and the
C9 consequence are **§A.1.2** (clauses 1–3); the artifact's `E2` row is the **measured negative arm**
(greens file §E). **Nothing in this section changes §A.1.2** — it is the promised §3b pointer.

---

## §3a. Adversarial findings (RCA-3 — the HOST findings, with their current dispositions)

**The record is §A.2.1** (this file's amendment log): the findings table (**H-1/H-1b**, **H-2**,
**H-3 + the boot-seam census**, **H-4**, **H-5**, plus the two PBT failures **`P-IM-1`**/**`P-IM-2`**),
each with its **`file:line` evidence**, its **CURRENT status** (`FIXED` / `PARTLY FIXED` / `OPEN`, read
off the tree by the §A.2.0 method) and its **owning test file + row**. This section exists so the
promise made by §8.2's `R8` row and §5.3.4 sub-rule 3 resolves to a **section of this file**; it
carries **no second copy** of the table (a duplicate would drift). Read **§A.2.1** for the findings,
**§A.2.2** for the three independent derivations of the boot-seam census + the independent
reproduction, **§A.2.3** for the `P-IM-1` count-identity correction and the de-dupe/dominance clause
conflict it exposes, **§A.2.4** for the H-4 **spec-side gap**, **§A.2.5** for the **non-findings**
(no two-surface, no stale-root, no zero-surface document tab on a production path — and the
`S14 === 2` expectation is the **defect**, not the contract), and **§A.2.6** for the §3b pointer.

**Layer discipline (mandatory, RCA-12).** Every finding above is **HOST/ENVELOPE-side**: the adversarial
pass, both verification passes and the PBT run all executed at the **host ordering + ownership key +
envelope input** layer (or read the tree for the static clause). **None of them is a live/painted
claim**, and a green in any of them is **never app-green** (§9; `docs/specs/rca-live-bugs-green-pipeline.md`
§3). The `P-TP-1` painted-identity proposition stays **live-only** and is untouched by this record.

---

## §3b. Host-side census/`destroyRoot` clauses + the recorded negative arm

**The two clauses this unit's register rests on are HOST-side clauses** (§A.2.6 states them): `I2-R`'s
live page-edit surface census, and the `destroyRoot` admission set that makes a stale surface/warning
root actually destroyable. Their authority is **§A.1.1** (the total census predicate, both
discriminators, no exempt seam) and **§A.1.2** (the closed-whitelist contract) respectively — both
**host/envelope-assertable**, neither from the live layer.

**The recorded negative arm (part of the contract).** A root that `next` **still authors** is
**NEVER destroyed** by the widening: `nextById` is built from `extractContentRoots(input.next)`
(`src/renderer/runtime.ts:549-553`), `removed` destroys, `added` does not, `replaced` destroys **then**
attaches (`:621-643`), `kept` destroys nothing, and the whitelist stays **closed** — an arbitrary or
hostile bucket css id still returns `false` (`:572-580`, the `AF2` discipline). The **measured**
negative arm is the blind artifact's **`E2`** row: `kept` + `next` authoring the surface ⇒ census stays
`1/1` and the element's node identity is preserved (no destroy+re-attach).

**Cross-reference:** §A.2.6 (the clause-level statement), **§A.1.2** (the authority — clauses 1–3,
including the C9/`U-EDIT-1` consequence and the `applied`-bucket oracle caveat), §A.2.5(a) (why the
two-surface state is **FIXED** on this tree, so no reader re-derives it as open).

---

### A.3 AMENDED/RULED 2026-09-22/23 — C1 the BOOT CARVE-OUT (the two-predicate split), C2 the SEPARATE document-liveness carrier (the `backRefs` invariant is NOT relaxed)

**Scope of this pass (recorded, per §A.1/§A.2's discipline).** This pass wrote **one file** — this
one — and touched **no** `src/**`, `tests/**` or tracker file (the supervisor owns tracker rows;
the TestWriter owns the re-pins of §A.3.3). Nothing is renumbered; every superseded sentence is
marked **in place** with its successor (§5.1 clause 3, §5.1 I1 clause 3, §5.2's reader table,
§5.3.2's pinned semantics, §5.3.5 rule 1, §5.5 `FS-6`, §6 `P-SM-1`/`P-TP-2`, §A.2.2, §10 item 5).

**Method (and what it does NOT claim).** Static re-read of the tree — **no test was run by this
pass** (the SpecDoc tool wall is read/search + doc writes). Every cited row was **read at its
`file:line`** and its assertion text is quoted from that read; every cited code site was **read at
its `file:line`**. A row's **green/red RUN status** is the supervisor's measured claim plus the
suite's own header where it records one — **never re-run here**. Items this pass could not verify
are listed in §A.3.4.

#### A.3.1 RULING C1 — the boot seam is an explicit **BOOT CARVE-OUT**; the pinned greens are CORRECT and are NOT re-planned (option (a) ruled, option (b) rejected)

**Ruled: (a).** No committed green changes. The pre-tab state is a **contract state of its own**
(`'pre-tab'`), and the census predicate is strict from the moment tab state exists.

**The measured conflict, verified at source.** `stageDocumentScope()` with `activeTabId === null`
returns the retained selection `_currentDocumentId` (`src/renderer/sidebar-panes.ts:3611-3614`), and
boot sets it to `_currentDocumentId ?? documentIds[0]` (`:2265-2266`) before `loadAppGraph(runtime,
traversalEnvelope)` (`:2272`), whose assembler input is `documentId: this.stageDocumentScope() ??
undefined` (`:1806`). So a no-tab boot authors **one** `#page-edit-surface` for the alphabetically
first doc-head. **Seven committed rows assert that state** — the six the implementer measured
(`…h2-c20`, `…blind-greens`, `…h1-optionc`, `sidebar-panes-host` §5.8.7 and §5.8.29/M6,
`page-commit-scope-ack-race` N1b) plus **one more found and verified by this pass**
(`unit-u-shell-9b-w2n15-rederive-scope.test.ts:220-229`, the no-tab body scope in the UNSCOPED
direction). Each was read, in full, at:

| # | Committed row (read this pass) | What it asserts at the no-tab boot |
| --- | --- | --- |
| 1 | `tests/unit-u-shell-9b-h2-c20-materialization.test.ts:384-422` (boot `:396`; census `:414-417`; `FOCUSED_DOCUMENT_ID='doc-a'` `:282`) | DOM `contenteditableCensus(h.mount)`: `count === 1`, `ids === ['page-edit-surface']`, `markers === ['doc-a']` — **one surface, at a boot with NO `mountTab`** |
| 2 | `tests/unit-u-shell-9b-blind-greens.test.ts:533-573` (boot `:547`; census `:565-569`; `FOCUSED_DOCUMENT_ID='da'` `:258`) | `count === 1`, `ids === ['page-edit-surface']`, `markers === ['da']` — the same census at a NO-`mountTab` boot |
| 3 | `tests/unit-u-shell-9b-h1-optionc-interception.test.ts:377-416` (boot `:380`; census `:410-413`) | `count === 1`, `ids === ['page-edit-surface']`, `markers === ['doc-a']` — the same census at a NO-`mountTab` boot |
| 4 | `tests/sidebar-panes-host.test.ts:595-606` (§5.8.7) | after `boot`, `buildContext().currentDocumentId === 'astrographer-review'` and the rendered HTML holds the SCOPED current-document body, not the other's — the **boot body scope** pin |
| 5 | `tests/sidebar-panes-host.test.ts:920-939` (§5.8.29/M6) | no-tab re-derive body scope: `setCurrentDocumentId('doc-a')` ⇒ `Doc A` present (`:923-928`); `setCurrentDocumentId(null)` ⇒ still `Doc A` (`:931-938`) |
| 6 | `tests/page-commit-scope-ack-race.test.ts:403-419` (harness reader `:357-361`) | after `mountTab(null)` + `docNavSelect(DOC_3)`: `stageDocumentScope() === DOC_3` — the no-tab **legacy fallback** is pinned at the scope seam itself |
| 7 | `tests/unit-u-shell-9b-w2n15-rederive-scope.test.ts:220-229` | boot (NO `mountTab`) + `reDerive('operator')` ⇒ the UNSCOPED `rag-X` survives and no `rag-doc-a--` scope appears — the no-tab body scope is pinned in BOTH directions |

**Reachability (what this state is, honestly).** It is **production-real but transient**: the shipped
renderer calls `host.boot(runtime).then(() => bootTabs())` (`src/renderer/renderer.ts:1039`), and
`bootTabs` awaits `tabBridge?.get?.()` (`:870-877`) **before** `host.mountTab(tabStrip.active())`
(`:879`). Between the two there is a real frame in which the host is booted, `activeTabId === null`,
and the stage displays the scoped document. The **app-level** exposure of that window is **live-only
and NOT-TESTABLE in node** — `NT-9` (`docs/specs/unit-stage-active-tab-display-greens.md:173`) — and
the in-unit S1 row itself records that limitation (`…blind-contradictions.test.ts:376-377`).

**Reasoning against the user's requirement ("the stage always displays the page owned by the active
tab").** In the pre-tab state **there is no active tab to own a page** — the requirement's subject
does not exist yet, so the carve-out cannot violate it; what the requirement does bind is
**(i)** that the census predicate holds from the first instant tab state exists, and **(ii)** that
the first `mountTab` synchronously re-owns the stage with no grandfathered pre-tab root. Both are
clauses below. The pre-tab document is the host's **retained default-context document**, and the
first-tab default resolves from the SAME context (`resolveDefaultTarget`, `src/renderer/tab-state.ts:336-351`,
fed by `getTabContext()` `:926-933`) — in the persisted/last-focused case they are the SAME document
(the common production case). **It is NOT a clause that they must agree** (measured: with
`defaultDocumentId='doc-b'` persisted, the boot surface carries `doc-a`, the alphabetical first —
the artifact's `A11b`), so no row may assert "the pre-tab surface equals the first tab's document";
the first `mountTab` is what makes them agree.

**THE RULED STATE MACHINE — exact predicate wording (`I2-R`, amended).**

**Pinned observers (additive, total, side-effect-free; §5.2's table is extended by §A.3, not
superseded):**

- `SidebarPanes.isPreTabState(): boolean` — `true` **iff** the host has been handed **no tab state**:
  neither `mountTab` nor `mountTabs` has been called. **Monotonic**: once any tab state is handed it
  is `false` forever.
- `SidebarPanes.getPreTabDocumentId(): string | null` — in the pre-tab state, the document the
  pre-tab stage displays: the boot seam's retained default-context document (`_currentDocumentId`,
  else the alphabetically-first doc-head of the last snapshot); `null` when the state is not pre-tab
  or no document is known (the empty-store/landing boot).
- `SidebarPanes.getStageDocumentScope(): string | null` — the public projection of the pinned
  `stageDocumentScope()` seam (already read reflectively at
  `tests/page-commit-scope-ack-race.test.ts:357-361`); it keeps its pinned BODY-scope semantics.

**The owning document of the stage, for every reachable state `s` and settle point `t`:**

```
stageOwner(s) ≡
  getActiveTabId(s) !== null ∧ getActiveTargetKind(s) === 'document'
        → ('tab-document', getActiveDocumentId(s))
  ¬ that, and isPreTabState(s) ∧ getPreTabDocumentId(s) !== null
        → ('pre-tab', getPreTabDocumentId(s))
  otherwise
        → ('none', null)
```

**Clauses (total; every one asserted):**

- **(a) SURFACE census.** The live `#page-edit-surface` root count in the stage region is `1` iff
  `stageOwner(s).kind ∈ {'tab-document','pre-tab'}`, else `0`; when it is `1`, that root's
  `data-edit-surface` **equals** `stageOwner(s).id`. Both discriminators (the authored
  `page-edit-surface` id and the `data-edit-surface` marker) are counted and must **agree**; no
  duplicate and no stale root (A.1.1/A.1.2 unchanged).
- **(b) BODY census.** After every seam **except `mountTabs`** (A.1.3: bodies may coexist there) the
  stage's document body roots are exactly `[stageOwner(s).id]` when `kind ≠ 'none'`, else `0`.
- **(c) `mountedDocumentIds`.** `[stageOwner(s).id]` when `kind ≠ 'none'` and not multi; the open set
  at the multi seam; `[]` when `kind = 'none'`.
- **(d) The strict TAB-STATE arm (unchanged from A.1.1).** Once `¬isPreTabState(s)` — i.e. after
  **any** `mountTab` (including `mountTab(null)`) or **any** `mountTabs` — the pre-tab arm is
  **unavailable forever**: the census is `1` iff a document tab is active, else `0`. So
  `mountTab(null)`, every non-document kind, and `mountTabs` with **no active entry** are all `0`
  (and the `applied`/reconcile step must **destroy** a stale pre-tab surface root there — A.1.2 —
  while never destroying a root `next` still authors).
- **(e) The two scopes are DISTINCT predicates.** `stageDocumentScope()` keeps its pinned
  **BODY/document** semantics (no tab ⇒ the retained selection: rows 4/5/6/7 above). The **SURFACE**
  is authored from `stageOwner(s)` alone — so a no-tab state that keeps the doc-nav BODY scope
  (`mountTab(null)`, `mountTabs`-with-no-active-entry) authors **no** surface.
- **(f) First mount re-owns.** A `mountTab(entry)` from the pre-tab state synchronously re-owns the
  stage (`stageOwner` = the tab arm) — the pre-tab surface is never grandfathered, and a stale one is
  destroyed.
- **(g) Empty store.** At a true empty-store boot `getPreTabDocumentId()` is `null` ⇒
  `('none', null)` ⇒ census `0` and the U-LIVE4 landing rows are untouched.

**What the FOUR red rows must assert instead (exact):**

| Red row (read at its `file:line`) | Its assertion today | Its NEW assertion |
| --- | --- | --- |
| `tests/unit-stage-active-tab-display-blind-contradictions.test.ts:356-381` (**S1**) | boot, no `mountTab` ⇒ `authored === 0`, `marked === 0`, `markers === []` | keep `agrees === true` and the identity-triple assertions (`activeTabId`/`activeTargetKind`/`activeDocumentId` all `null`); ADD `isPreTabState() === true`; assert `getPreTabDocumentId() === DOC_A` and **`authored === 1`, `marked === 1`, `markers === [getPreTabDocumentId()]`**; ADD the tab-state half: after `mountTab(searchTab('s1'))` ⇒ `isPreTabState() === false`, `authored === 0`, `bodies === []` |
| `…blind-contradictions.test.ts:383-400` (**S2**) | persisted `defaultDocumentId='doc-b'` ⇒ still `authored === 0` | `isPreTabState() === true`; `authored === 1` and `markers === [getPreTabDocumentId()]`; keep the FS-7 teeth by asserting the pre-tab document is the **alphabetical-first** `doc-a` (the `A11b` measurement — the persisted default does NOT move the pre-tab SURFACE); ADD: after `mountTab(docTab('t1', DOC_B))` ⇒ `authored === 1`, `markers === [DOC_B]`, no `doc-a` surface (no stale pre-tab root, clause (f)) |
| `…contract-holes.test.ts:453-476` (**H-3**) | PRE-state: boot ⇒ `bootCensus.authored === 0`; POST: `mountTabs([docTab('t2', DOC_B)])` with no active tab ⇒ `authored === 0`, `markers !== [DOC_B]`, `marked === 0` | **PRE-STATE re-pinned**: `isPreTabState() === true`, `getPreTabDocumentId() === DOC_A`, census `1`/`[DOC_A]` (the carve-out clause). **POST-STATE UNCHANGED and still RED**: `getActiveTabId() === null`, `authored === 0`, `marked === 0`, `markers !== [DOC_B]` (the `documentIds[0]` fallback at `:1849-1851` is the violation) — plus a new clause: the pre-tab surface root is **gone** (destroyed), and the open set's doc-b **body** is still present (A.1.3) |
| `…pbt-generators.test.ts:1134-1154` + `checkStep:1092-1128` (**P-SM-1**) | `start === 'boot'` (drawn at `:1138`) is checked by the strict clauses ⇒ `BROKEN @7` | give the `boot` draw a **pre-tab expectation** (`stageOwner = ('pre-tab', getPreTabDocumentId())`): census `1` with that marker, bodies `[that document]`, `mountedDocumentIds` `[that document]`, identity triple `null` — and do NOT assert `documentRoots === 0` there; every other start and **every** step keeps the strict clause (in particular `mountTabs(openSet)` with no active entry stays `0`) |

**Not re-planned (option (b) explicitly REJECTED).** Every row of the table above stays green
**unchanged**; `§7.4`'s re-pin prohibition is intact and no fence is re-derived. Rejection reason:
rows 1–3 assert the production boot state's rendered surface, rows 4–7 assert the production boot/no-tab
**body** scope, and none of them is the defect class this unit exists to fix (a foreign page or a
foreign surface on a tab that owns another page); re-planning them would blank a real operator-visible
frame and re-derive **seven committed rows across six suites** for a state the requirement does not
speak about. Nothing in `src/renderer/sidebar-panes.ts` is deleted by this ruling — `mountTabs`
keeps its reachability pin, `stageDocumentScope()` keeps its semantics, and the pre-tab arm is an
**added** arm of the surface predicate, not a rewrite of the scope seam.

#### A.3.2 RULING C2 — a SEPARATE document-liveness carrier owns the caret's document check; the `backRefs` invariant is NOT relaxed (no rename, no re-documentation)

**Ruled: the carrier is separate.** `backRefs` stays `Map<ragNodeId, nodeId[]>` — the documented
SOLE authoritative carrier (`src/renderer/edit-controller.ts:9-12`), consumed by `isEditable`
(`:169`) and the commit pre-check (`:175`) — verbatim. Relaxing it (the alternative) was rejected
because it would (i) make a document id read as an editable/committable node (`H-5`'s exact defect),
(ii) require re-documenting a type that another landed spec pins, and (iii) not be total: the commit
pre-check would then accept a document id.

**The ruling (code-bearing; one host file + one controller file):**

1. **The seed is DELETED.** `seedActiveDocumentRef()` (`src/renderer/sidebar-panes.ts:3624-3628`;
   call sites `:993`, `:1327`, `:1907`, `:2002`) is removed — **no document id is ever a `backRefs`
   key**. Verified: the page commit path does **not** use `editController.commit` (it builds ops and
   calls `bridge.edit.batch`, `:3775-3797`), and `isEditable` is not called on the host's production
   paths — so the seed's only consumer was the caret guard.
2. **NEW carrier (host):** `private liveDocumentIds = new Set<string>()`, recomputed wherever the
   snapshot is committed (boot's `deriveDocumentIds(snapshot)` `:2264`; the re-derive's
   `this.lastSnapshot = snapshot` `:2324-2326`), plus the pinned total reader
   **`SidebarPanes.isDocumentLive(documentId: string): boolean`** — `true` iff
   `deriveDocumentIds(lastSnapshot)` contains that id; `false` for `''`, a non-string, junk/`__proto__`
   keys, and before any snapshot. Total, side-effect-free.
3. **NEW optional hook (controller), additive and total** — absent ⇒ **byte-for-byte legacy**:
   `EditControllerOptions.isDocumentLive?: (documentId: string) => boolean`, with the matching
   **non-enumerable** late-bind `EditController.setDocumentLiveness?.(resolve)` (the
   `setPageSubjectDocument` pattern, `edit-controller.ts:257-271`, so the pinned 11-member public
   census in `tests/edit-controller.test.ts` S1 is preserved).
4. **`restoreCaret(subjectId)` — the pinned order** (A.1.4 clause 1 unchanged: a caret-less read
   returns `undefined` **without** consulting any hook):
   1. `saved = carets.get(subjectId)`; `saved == null` ⇒ `return undefined`;
   2. `doc = pageSubjectDocument?.(subjectId) ?? null`;
   3. `doc == null` ⇒ delete the entry, `return undefined`;
   4. **liveness:** `live = opts.isDocumentLive ? opts.isDocumentLive(doc) : opts.backRefs.has(doc)`;
      `!live` ⇒ delete the entry, `return undefined`;
   5. `saved.kind === 'rich' && saved.ragId !== PAGE_EDIT_SURFACE_ID` ⇒ delete the entry,
      `return undefined` (`FS2`);
   6. `return saved`.
   With **no** `pageSubjectDocument` hook the legacy path is unchanged:
   `live = opts.backRefs.has(subjectId)`.
5. **The host supplies both hooks** in its constructor (`sidebar-panes.ts:837-846`):
   `pageSubjectDocument: (s) => s === this.activeTabId ? this.activeDocumentId : null` (unchanged)
   **and** `isDocumentLive: (id) => this.liveDocumentIds.has(id)` (the late-bind twin).

**What the affected rows must assert instead (exact):**

| Row (read at its `file:line`) | Today | NEW |
| --- | --- | --- |
| `tests/unit-stage-active-tab-display-pbt-generators.test.ts:1019` (**`P-IM-4` oracle**) | `expectedRestore = … && h.backRefs.has(docId) && caretKind === 'page'` | `expectedRestore = subject === tabId && tabId !== null && kind === 'document' && docId != null && h.host.isDocumentLive(docId) && caretKind === 'page'` |
| `…pbt-generators.test.ts:1035-1052` (**`P-IM-4` 2nd leg**) | `!h.backRefs.has(String(answer))` / `expected2 = … && h.backRefs.has(answer) && …` on a controller-only harness | inject the sibling carrier (`isDocumentLive`) into the harness and express both legs through it; the **totality/junk-answer** clauses (non-string/`''`/foreign answer ⇒ cleared) are unchanged |
| `…pbt-generators.test.ts:1397-1415` (**`P-TP-2`**) ⟨**A.4 — DRIFT PIN: at the §A.4 read this row is `:1442-1531` and its carrier injection is `:1472-1475`; `:1397-1415` is a sibling P-SM-2 block**⟩ | `backRefs = [[liveDoc,['x']],['t1',['x']]]`; `live = … : subject === 't1' && backRefs.has(liveDoc)` | the harness supplies `isDocumentLive` (and **no** document id in `backRefs`); the expectation keeps its **shape** — `hookMode 'absent'` ⇒ `backRefs.has(subject)` (legacy, unchanged); `'supplied'` ⇒ `subject === 't1' && isDocumentLive(liveDoc)` — **LANDED at this read** |
| `tests/unit-stage-active-tab-display.test.ts:840` (**S12/FS-6**) | `h.backRefs.has(DOC_A) === true` ("the document is live in backRefs") | `h.host.isDocumentLive(DOC_A) === true` **and** `h.backRefs.has(DOC_A) === false` (the seed is gone) — the caret must still be restored after the `reDerive('content')` at `:842-847` |
| `…blind-contradictions.test.ts:463-473` (**`liveBackRefs()`**) | seeds `['t1',[]]`, `['doc-a-body',[]]`, **`[DOC_A,[]]`** | drop the `DOC_A` entry and give `makeController` the carrier (`isDocumentLive`); the consultation-set rows S5–S10 keep their behavior (the `'ghost-doc'` / `null` / `undefined` answers are NOT live either way) |
| `…blind-contradictions.test.ts:588-608` (**S9**, message text) | ``doc !== null but !backRefs.has(doc)`` | the same assertion with `!isDocumentLive(doc)` in the observable string |
| `tests/unit-stage-active-tab-display-contract-holes.test.ts:530-555` (**H-5**) | RED: `keys` contains `DOC_A`; `isEditable(DOC_A)` is `true` | **UNCHANGED and now GREEN** — no document id in `backRefs.keys()`, every key in `nodeIds` (`:543-546`), `isEditable(DOC_A) === false` (`:551-554`) |
| `tests/unit-stage-active-tab-display-contract-holes.test.ts:514-523` (**H-4b**, green control) | same tab + same live document ⇒ `restoreCaret` defined | **UNCHANGED** (the carrier holds `DOC_A` after the mount) — the no-over-eviction control must stay green |
| `…pbt-generators.test.ts:1330-1346` (**`P-SM-2`'s caret clause**) ⟨**A.4 — DRIFT PIN: at the §A.4 read that span is inside `P-SM-2`'s COMMIT block; the caret-isolation clause is `:1394-1411`**⟩ | `restoreCaret(k1)`/`restoreCaret('t2')` defined for each tab's own live document | **UNCHANGED in expected behavior**; only the liveness source moves to `h.host.isDocumentLive(docId)` |
| `tests/unit-stage-active-tab-display.test.ts:869-887` (**the `P-TP-2` in-row-controller row — OMITTED from this table by §A.3.3; added here by §A.4.1, never a renumbering**) | `createEditController({ backRefs: h.backRefs, commit, onRebuild, pageSubjectDocument: (s) => (s === 't1' ? DOC_A : null) })` — the hook is supplied but **NO liveness carrier**, so `:886`'s `restoreCaret('t1')` falls back to `opts.backRefs.has(DOC_A)` (`src/renderer/edit-controller.ts:261-263`) against a `backRefs` map whose only keys are `t1`/`t2`/`s1` (`…test.ts:272-279`): the seed `seedActiveDocumentRef` is DELETED (`src/renderer/sidebar-panes.ts:864` — a comment is the only residue), so **the row cannot pass as written** | **⟨§A.4.1⟩** inject the carrier — `isDocumentLive: (id) => documentLive(h.host, id)` in the in-row `createEditController` options, plus `h.backRefs.has(DOC_A) === false` and `documentLive(h.host, DOC_A) === true`. **`:882`/`:883` (the non-active-subject direction) and the whole legacy/no-hook direction (`…test.ts:1155-1164` S16, `:1166-1177` S16b) stay UNCHANGED** |

**Recorded, NOT conflated:** `H-4` (a closed/re-minted tab id restoring the previous page's caret
against a DIFFERENT document, `…contract-holes.test.ts:484-512`) is **not** fixed by this ruling and
stays red — it needs a close-time caret eviction, which §A.2.4 records as a **spec-side gap** with no
licensing clause. C2 must not be read as H-4's fix.

#### A.3.3 The affected rows, the owning implementation files, and the blast radius (one place, for the TestWriter remand and the item-10d review)

**Owning implementation files (`file:line` read this pass).**
`src/renderer/sidebar-panes.ts` — `stageDocumentScope()` `:3611-3614` (the no-tab arm; SPLIT so the
surface scope stops reading it), `boot` `:2264-2272`, `loadAppGraph`'s assembler input `:1806`,
`mountTab`'s identity stamping `:951-971` + the de-dupe guard `:973-984`, `mountTab(null)` `:964-971`,
`clearStageForNoActiveTab()` `:1020-1024`, `mountTabs` `:1050-1064` + `applyDocumentSet`'s
`documentIds[0]` fallback `:1849-1851`, the re-derive gate `:2343-2363`, the caret step
`:2421-2425`, `seedActiveDocumentRef()` `:3624-3628` (DELETE) with call sites `:993`, `:1327`,
`:1907`, `:2002`, the constructor's hook supply `:837-846`.
`src/renderer/edit-controller.ts` — `EditControllerOptions.backRefs` `:9-12` (UNCHANGED),
`isEditable` `:169`, the commit pre-check `:175`, the hook member `:30` + its late-bind `:257-271`,
`restoreCaret` `:214-252` (the A.3.2 order).
`src/renderer/renderer.ts` — `bootTabs` `:870-880`, `host.boot(runtime).then(() => bootTabs())`
`:1039` (the reachability evidence; **0 changes expected**).

**Blast radius — the committed suites that MUST stay green unchanged:**
C1 (boot): the seven rows of §A.3.1's table — `unit-u-shell-9b-h2-c20-materialization.test.ts:384-422`,
`unit-u-shell-9b-blind-greens.test.ts:533-573`, `unit-u-shell-9b-h1-optionc-interception.test.ts:377-416`,
`sidebar-panes-host.test.ts:595-606`, `sidebar-panes-host.test.ts:920-939`,
`page-commit-scope-ack-race.test.ts:403-419`, `unit-u-shell-9b-w2n15-rederive-scope.test.ts:220-229` —
plus the whole 9b `mountTabs` family (`unit-u-shell-9b-cross-document-shared.test.ts:701-731`,
`unit-u-shell-9b-h3-doc-namespace.test.ts:312-364`, `unit-u-shell-9b-w2n15-rederive-scope.test.ts:198-214`),
the U-LIVE4 landing rows, and `sidebar-panes-host.test.ts:310-331` (containment-only proto census ⇒
the three additive readers are tolerated).
C2 (caret): `unit-stage-active-tab-display-contract-holes.test.ts:514-523` (H-4b),
`unit-stage-active-tab-display-pbt-generators.test.ts:1330-1346` (`P-SM-2`'s caret clause ⟨**A.4 —
DRIFT PIN: at the §A.4 read the caret-isolation clause is `:1394-1411`; `:1330-1346` is the commit
block**⟩),
`page-scoped-caret.test.ts:173-181` (the **no-hook legacy** path: `backRefs` = `[['tab-1',['n1']]]` ⇒
unchanged), `page-scoped-caret.test.ts:196-202`, `page-commit-scope-ack-race.test.ts` (N1a/N1b —
the commit path uses `bridge.edit.batch`, untouched), `single-editable-surface.test.ts`,
`page-commit-failure-visibility.test.ts`, `edit-controller.test.ts` S1 (the 11-member public census ⇒
the new late-bind MUST be non-enumerable), and the C9 `U-EDIT-1` commit rows.

**⟨A.4.1 — INCOMPLETE, marked in place: this C2 blast radius and §A.3.2's affected-rows table both
OMIT `tests/unit-stage-active-tab-display.test.ts:869-887`** (the `P-TP-2` row that builds its **own**
`createEditController` in-row). That row is in **neither** list, and C2's deletion of
`seedActiveDocumentRef()` made its last assertion unsatisfiable (the row supplies
`pageSubjectDocument` but **no** `isDocumentLive`, so step 4 takes the legacy fallback against a
`backRefs` map that can no longer hold a document id). It is a **row-side omission**, not a
production defect — see **§A.4.1** for the exact new form and the blast radius. The row is added to
§A.3.2's table in place (never a renumbering).⟩**

**Cross-unit:** neither ruling changes `MATRIX_ROWS`/`ROW_EXTENDED`, the fence
(`import-render-no-duplicates`/`traversal`), `src/shared/o0-report.ts`, `RagStore`, or any other
spec's numbering.

#### A.3.4 Unverified / not claimed by this pass

1. **No run.** Every green/red status above is a **source read** plus the supervisor's measurement;
   the claim that "dropping the `_currentDocumentId` no-tab scope greens the four census rows but
   breaks the six committed rows" is **corroborated by the code paths** (`:3611-3614` → `:1806`, and
   N1b's assertion on the scope seam) but was **not re-executed** here.
2. **`NT-9`** (the app-level reachability of the no-tab window) is **quoted** from the greens file
   `:173`, not re-measured; the production window is **inferred** from `renderer.ts:1039` +
   `:870-880`'s ordering (a real async gap, not a measured frame count).
3. The two rulings pin **exact member names** (`isPreTabState`, `getPreTabDocumentId`,
   `getStageDocumentScope`, `isDocumentLive`, `setDocumentLiveness`) that **do not exist in the tree
   at this read** — they are the contract the TestWriter pins red and the Implementer lands; if the
   implementer sources the same facts under different names, that is a **further amendment**
   (§7.4), never a silent rename.
4. `P-IM-2`'s MIXED-envelope failure and the `P-IM-1` de-dupe/dominance clause conflict (§A.2.1/
   §A.2.3) are **untouched** by this pass and remain open.
5. The `[reading]` line numbers in §A.3 are a proof of the tree on **2026-09-22/23**, not stable
   addresses — the item-10d review must **recount** them (this file's citation discipline).

#### A.3.5 In-place markings made by this pass (never a renumbering)

§5.1 I2 clause 3 (`⟨A.3.1 — SUPERSEDED IN PART …⟩`, the boot seam), §5.1 I1 clause 3
(`⟨A.3.2 — "is live" is PINNED …⟩`), §5.2's reader table (`⟨A.3 — EXTENDED … three additive
members⟩`), §5.3.2's pinned semantics (`⟨A.3.2 — one ADDITIVE member …⟩` and the branch-3
supersession on `!opts.backRefs.has(doc)`), §5.3.5 rule 1 (the census, pre-tab arm), §5.5 `FS-6`
(the liveness observable), §6 `P-SM-1` (the `boot` starting state) and `P-TP-2` ("live in
`backRefs`" ⇒ the carrier), §A.2.2's consequence ("the boot seam is an `I2-R` seam"), and §10 item 5
(the second TestWriter remand). **§1–§10 keep their numbers; `A.n` ids are not reused.**

---

### A.4 RULED 2026-09-22 — the last two red rows of `U-STAGE-ACTIVE-TAB`: D1 the omitted C2 row (`P-TP-2` in-row controller), D2 the pane-additive zero-surface counterexample, D3 the `mountTabs` body ORDER is NOT contract

**Scope of this pass (recorded, per §A.1/§A.2/§A.3's discipline).** This pass wrote **one file** — this
one. It touched **no** `src/**`, **no** `tests/**` and **no** tracker (the supervisor owns tracker rows;
the TestWriter owns the re-pins ruled here; the Implementer owns a `src/**` edit **only** if §A.4.2's
re-run lands the counterexample). Nothing is renumbered; every superseded/omitted sentence is marked
**in place** with its successor (§A.1.3, §A.2.5(c), §6's `P-SM-1` row, §A.3.2's affected-rows table,
§A.3.3's C2 blast radius).

**Method (and what it does NOT claim).** Static re-read of the tree — **no test was run by this pass**
(the SpecDoc tool wall is read/search + doc writes). Every cited row and code site was **read at its
`file:line`** and quoted from that read; every **green/red RUN status** is the supervisor's measured
claim plus the suite's own header — **never re-run here**. The counterexample in §A.4.2 could **not** be
reproduced from the HEAD source by any trace this pass could follow, and is written as **UNVERIFIED**;
the items this pass could not verify are listed in §A.4.6.

#### A.4.1 RULING D1 — `tests/unit-stage-active-tab-display.test.ts:869-887` is a **ROW bug**: the row must supply the §A.3.2 C2 liveness carrier (production is CORRECT and UNCHANGED)

**The row (read at its `file:line`; the supervisor's citation `:850-887` spans S12 at `:843-867` + this
row at `:869-887`, whose `it` title is `P-TP-2 [RED] — a subject that is NOT the active tab is never
restored, and the stale entry is CLEARED`).** It builds its **own** controller in-row:

```ts
const controller = createEditController({
  backRefs: h.backRefs,
  commit: async () => ({ ok: true, nodeId: 'x' }),
  onRebuild: vi.fn(),
  pageSubjectDocument: (s) => (s === 't1' ? DOC_A : null),
} as never)
```

`:882`/`:883` (a non-active subject `t2` ⇒ `undefined`, then cleared) **pass**. `:885`/`:886` (save a
caret under `'t1'`, expect `restoreCaret('t1')` **defined**) **cannot pass** on this tree.

**Why — verified at source, not inferred.** C2's step 4 is `live = opts.isDocumentLive ?
opts.isDocumentLive(doc) : opts.backRefs.has(doc)` (`src/renderer/edit-controller.ts:249-267`; the
fallback literal at `:261-263`). The row supplies `pageSubjectDocument` but **no** `isDocumentLive`, so
the read is `h.backRefs.has('doc-a')`. `seedActiveDocumentRef()` is **DELETED** — the only residue is a
comment at `src/renderer/sidebar-panes.ts:864` — and the harness's `backRefs` is constructed with the
keys `t1`/`t2`/`s1` only (`tests/unit-stage-active-tab-display.test.ts:272-279`), as is required by the
documented `Map<ragNodeId, nodeId[]>` invariant (`src/renderer/edit-controller.ts:9-12`). So `live` is
`false`, the entry is **deleted**, and `restoreCaret('t1')` returns `undefined`. The row is red **by its
own wiring**, not by any host behavior: nothing in the production path is wrong, and the sibling rows
that were re-pinned for C2 (`…test.ts:843-867` S12, `…test.ts:889-907`, the PBT `P-TP-2` row
`…pbt-generators.test.ts:1442-1531` — the carrier is injected at `:1472-1475`, **not** at the §A.3.2
pin `:1397-1415`, which is drift; see §A.4.6 item 4 — `…blind-contradictions.test.ts:593-608`,
`…contract-holes.test.ts:514-523`)
all inject the carrier — this row was simply **omitted from §A.3.2's table and §A.3.3's blast radius**
(marked in place there).

**RULED: owner = TEST (row only). NO production change; no clause changes; the row's own
expectation direction is CORRECT and is NOT weakened.**

**The exact new form (the row's `createEditController` + the two assertions that give it teeth):**

```ts
      pageSubjectDocument: (s) => (s === 't1' ? DOC_A : null),
      // ⟨§A.3.2 C2 / §A.4.1⟩ the SEPARATE document-liveness carrier. The
      // `seedActiveDocumentRef` seed is DELETED, so NO document id keys
      // `backRefs` and step 4's legacy fallback cannot be true here; the
      // declared-member helper keeps the teeth (absent ⇒ "does not exist" ⇒ RED).
      isDocumentLive: (id) => documentLive(h.host, id),
    } as never)
    …
    expect(h.backRefs.has(DOC_A), '⟨§A.3.2 C2⟩ the deleted seed: no document id keys `backRefs`').toBe(false)
    expect(documentLive(h.host, DOC_A), '⟨§A.3.2 C2⟩ the carrier holds the ACTIVE document').toBe(true)
    controller.saveCaret('t1', caret as never)
    expect(
      controller.restoreCaret('t1'),
      'the ACTIVE tab id with a live document IS restored: step 4 reads the SUPPLIED carrier (§A.3.2 clause 4), never `backRefs.has(doc)`',
    ).toBeDefined()
```

`:882`/`:883` stay **verbatim**; the `[RED]` marker in the `it` title is replaced by
`[⟨§A.3.2 C2⟩ re-pinned — GREEN in the post-landing reading]`.

#### A.4.2 RULING D2 — the pane-additive zero-surface/zero-body counterexample: **option (i) RULED** (a document tab active ⇒ exactly 1 surface + its body is the CONTRACT; option (ii) is REJECTED). The **row's predicate is CORRECT and stays strict**; the reading is **UNVERIFIED on HEAD** and does **not** license a `src/**` edit before a re-run

**Ruled: (i), conditional on reproduction.** A state with `activeTabId='t1'`,
`activeTargetKind='document'`, `activeDocumentId='doc-a'`, `mountedDocumentIds=['doc-a']` and census `0`
/ bodies `[]` is **not** a legitimate state, and **no clause licenses it**:

- `I2-R` (§A.1.1) is **total** and its seam list **names a pane-additive reconcile explicitly**
  (`docs/specs/unit-stage-active-tab-display.md` §5.1 I2 clause 3's `⟨A.1.1⟩` block: *"a content
  re-derive, a **pane-additive reconcile**, `rerenderAppGraph` and boot"*), and requires the census to
  be `1` iff a document tab is active, with `data-edit-surface === activeDocumentId`.
- A.3.1 clause **(a)** (surface) and clause **(b)** (body — *"exactly `[stageOwner(s).id]`"* at every
  seam **except `mountTabs`**) both bind here; §A.2.5**(c)** records this exact state as a
  **NON-FINDING**.
- **Option (ii) is REJECTED, and the task's example mechanism is refuted at source:** there is no such
  thing as a *"pane-driven reconcile that legitimately re-authors no document body"*. An **app-graph**
  pane toggle routes through the SAME content path as a plain `reDerive('content')` —
  `togglePaneVisibility` (`src/renderer/sidebar-panes.ts:3294-3319`) → `editController.requestRebuild('content')`
  (`:3317`) → `reDerive('content')` → `applyContentChange` (`:2492-2497`) — and the document
  body/surface authoring is **independent of any pane's presence** (the assembler's `documentId` input
  is `stageOwnerDocumentScope()` at `:1942`→`:1964`; the pane payloads are merged additively at
  `pane-graph.ts:403-413`). A pane flip cannot excuse a missing page; and a plain `reDerive('content')`
  step in the same generator is **not** a counterexample in the recorded run.

**Why the reading is UNVERIFIED (and why the fix owner is not assigned yet).** Every seam trace this
pass followed **contradicts** the reading: on a `t1`/`doc-a` state, `stageOwnerDocumentScope()`
(`:983-986`) returns `'doc-a'`, `applyContentChange` passes `documentId='doc-a'` to the assembler
(`:1964`), the assembler's authoring gate is `bodyRoots.length > 0` over the merged content
(`pane-graph.ts:423-430`), and `reDerive`'s `documentIds` resolves to `['doc-a']` (`:2451-2461`). The
`P-SM-1` header's own provenance note says the readings were taken **while `src/**` was landing the two
rulings** (`…pbt-generators.test.ts:66-70`: the pre-landing baseline is `01:44`, `src/**` landed
`01:46`–`01:48` *"during this pass"*), so the residual reading's **tree state is not established** by
the file. **Therefore: the counterexample is a RE-RUN item, not a licensed `src/**` edit** — a
production change authored off an unreproduced, mid-landing reading would violate §7.4 (the re-pin/
re-derive prohibition) in the opposite direction.

**RULED row wording — the predicate is UNCHANGED (strict), plus one NON-VACUITY guard.** `checkStep`'s
clauses (1)/(1b)/(2)/(3)/(4) stay exactly as written for this seam: `owner = ('document', 'doc-a')` ⇒
`census.authored === 1`, `census.markerIds.join(',') === 'doc-a'`, `census.agrees === true`,
`mountedDocumentIds === ['doc-a']`, `bodies === ['doc-a']`. The **one** addition (the drawn step may not
be silent — verified: the harness's own `createPaneRegistry()` is empty, and the panes exist only
because `boot` calls `registerPanes()`, `src/renderer/sidebar-panes.ts:1568-1612`):

```ts
          const def = h.registry.list().find((d) => d.scope !== 'operator') ?? h.registry.list()[0]
          if (def == null) throw new Error('P-SM-1 generator: no registered app-graph pane — the drawn pane-additive seam is UNREACHABLE')
          const before = h.registry.isEnabled(def.id)
          paneVisibilityToggle(def.id)
          if (h.registry.isEnabled(def.id) === before) return `pane-additive: the drawn toggle did not flip "${def.id}" (a SILENT step — non-vacuity)`
          await flush()
```

**If (and only if) the re-run reproduces the `0`-surface document-tab state on HEAD, the owner is
PRODUCTION**, and the minimal change is confined to the reconcile's `next` authoring for that seam:
`src/renderer/sidebar-panes.ts:1942` (`surfaceScope`) → `:1964` (the assembler's `documentId` input) must
be shown to be reached with the active document and the assembled `next` must carry the active
document's surface + body — if it already does, the defect is downstream in the destroy/attach arm
(`src/renderer/runtime.ts:632-654`, where the surface root can be destroyed on the `removed`/`replaced`
arm without a successful re-attach) or in the assembler's `bodyRoots.length > 0` gate
(`src/renderer/pane-graph.ts:430`). **Which of those three is at fault is UNVERIFIED by this pass** —
the re-run's own counterexample line (`step="pane-additive reconcile" … census(#page-edit-surface=…)`)
plus the reconcile report is what names it. **No row may be weakened in the meantime.**

#### A.4.3 RULING D3 — the `mountTabs` multi-seam body **ORDER is NOT contract**: the row must assert a **SET** (order-insensitive). Owner = TEST (row only)

**Ruled: the ROW is over-strength; order is NOT contract.** §A.1.3 (marked in place by this pass)
amends the body clause to **coexistence only** — *"the body clause quantifies over every seam except
`mountTabs` (bodies only may coexist there)"* — and no clause of this spec, §5.3.6, or
`docs/specs/unit-u-shell-9b-cross-document-shared.md` pins the DOM order of coexisting bodies (9b's own
rows are order-insensitive: `tests/unit-u-shell-9b-cross-document-shared.test.ts:701-709` and
`:723-731` use `toContain('Doc A')`/`toContain('Doc B')`; `:711-721` and
`tests/unit-u-shell-9b-h3-doc-namespace.test.ts:312-340` use set/containment censuses — all read this
pass). The sibling row that owns the multi seam in **this** unit is order-insensitive too
(`tests/unit-stage-active-tab-display.test.ts:618-629`, S3 — `toContain('Doc A')`/`toContain('Doc B')`
**at this read**; §A.1.3's pin `:519-527` is drift, §A.4.6 item 4; §A.1.3's own green control).

**The mechanism that produces the measured order — named, so it is never re-derived as a defect.** The
DOM order is an **artifact of the reconcile's attach order**, not the open-set order: the multi-path
assembly is built from the **FIRST** document only (`traversalEnvelope: perDoc[0].envelope`,
`src/renderer/sidebar-panes.ts:2055-2056`) while the sibling documents' content is appended afterwards
into the reconcile `next` union (`:2079-2085`); `Runtime.applyContentReconcileBody` then processes the
buckets in the fixed order **`removed` → `added` → `replaced` → `identityReplaced`**
(`src/renderer/runtime.ts:632-667`), so a sibling root that is `added` attaches before the active
document's surface (`replaced` ⇒ destroy-then-attach) — hence `[doc-b,doc-a]` for the drawn
`[doc-a,doc-b]` open set. **No clause orders that, and none should** (ordering the engine's attach
sequence is not this unit's contract).

**The exact new assertion wording (`checkStep` clause (4), multi branch — replaces the ordered
comparison at `…pbt-generators.test.ts:1178-1179`):**

```ts
  if (exp.multi) {
    // §A.1.3 + §A.4.3 — at the 9b seam the open set's bodies COEXIST: a SET, never an
    // ORDER (the measured order is the reconcile's attach order — runtime.ts:632-667,
    // sidebar-panes.ts:2055-2085); no clause pins the DOM order of coexisting bodies.
    const got = [...bodies].sort()
    const want = [...exp.openIds].sort()
    if (got.join(',') !== want.join(',')) {
      return `multi-bodies: the open set's bodies are materialized at the 9b seam as a SET (§A.1.3/§A.4.3 — DOM order is NOT contract) expected {${want.join(',')}} got {${got.join(',')}} (${seen})`
    }
  } else if (owner !== null) {
```

**What stays order-SENSITIVE (deliberately, and this is contract):** `expectedMounted` in clause (2) —
`mountedDocumentIds` equals **the open set in its own order** (`src/renderer/sidebar-panes.ts:1150`
stamps the caller's order verbatim; `getMountedDocumentIds()` returns a copy, `:991-993`). §A.4.3 does
**not** relax that clause, and the recorded run shows it passing at the `start:openset` draw while the
bodies clause failed — i.e. the two clauses must stay asymmetric.

The row's `it` title is re-pinned to:
`P-SM-1 [strat:stage-seam-schedule-single-active] [RED: the residual counterexample is the pane-additive zero-surface document tab (§A.4.2 — production-owed ONLY if it reproduces on HEAD); the open-set body ORDER is no longer a counterexample — it is a SET (§A.4.3)]`.

#### A.4.4 The affected rows, the owners, and the blast radius, in one place (for the TestWriter remand and the item-10d review)

| # | Artifact (`file:row`, read this pass) | The change | Owner | Ruling |
| --- | --- | --- | --- | --- |
| 1 | `tests/unit-stage-active-tab-display.test.ts:869-887` | **ROW**: inject `isDocumentLive` (the carrier) into the in-row controller + the two liveness assertions; `:882`/`:883` unchanged; `[RED]` ⇒ `[re-pinned — GREEN]` | **TEST** (production unchanged) | §A.4.1 |
| 2 | `tests/unit-stage-active-tab-display-pbt-generators.test.ts:1189-1274` (`checkStep` `:1140-1186`, the pane-additive step `:1257-1264`) | **ROW**: predicate **UNCHANGED/strict** (census 1 + marker + `bodies=['doc-a']` at the pane-additive seam) + the non-vacuity guard; a `src/**` edit ONLY if the HEAD re-run reproduces the `0`-surface state | **TEST** now; **PRODUCTION** only on reproduction (§A.4.2, site UNVERIFIED) | §A.4.2 |
| 3 | `tests/unit-stage-active-tab-display-pbt-generators.test.ts:1178-1179` (the multi-bodies branch) | **ROW**: ordered comparison ⇒ **set** comparison (`got.sort()` vs `want.sort()`); clause (2)'s `expectedMounted` stays **order-sensitive** | **TEST** (production unchanged) | §A.4.3 |
| 4 | `src/renderer/sidebar-panes.ts` `:1942`/`:1964` → `runtime.ts:632-654` / `pane-graph.ts:430` | **NO CHANGE** in this pass; the **minimal** production change, if owed, is at the surface-scope/`next`-authoring decision of the pane-additive re-derive (the re-run names which) | **PRODUCTION, conditional** | §A.4.2 |

**Blast radius that MUST stay green unchanged (all read this pass).**
**D1 (row 1):** the no-hook legacy control `tests/unit-stage-active-tab-display.test.ts:1155-1164` (S16 —
`backRefs=[['t1',['doc-a-body']]]` ⇒ `restoreCaret('t1')` defined via `backRefs.has('t1')`) and
`:1166-1177` (S16b — the `'doc-gone'` dead-document direction, green under either liveness source);
S12 (`:843-867`); the third `P-TP-2` row (`:889-907`, the host's own controller); and §A.3.3's C2 set —
`unit-stage-active-tab-display-contract-holes.test.ts:514-523` (H-4b) and `:530-555` (H-5, now GREEN),
`…pbt-generators.test.ts:1394-1411` (`P-SM-2`'s caret-isolation clause **at this read** — the §A.3.2
pin `:1330-1346` is drift onto P-SM-2's commit block; §A.4.6 item 4), `page-scoped-caret.test.ts:173-181` and
`:196-202`, `edit-controller.test.ts` S1 (the **11-member** public census ⇒ the carrier stays
**non-enumerable**, `edit-controller.ts:304-306`).
**D2 (row 2):** the seven boot rows of §A.3.1's table, the 9b `mountTabs` family
(`unit-u-shell-9b-cross-document-shared.test.ts:701-731`, `unit-u-shell-9b-h3-doc-namespace.test.ts:312-364`,
`unit-u-shell-9b-w2n15-rederive-scope.test.ts:198-214`), `tests/unit-stage-active-tab-display.test.ts:618-629`
(S3), and the surface-census suites `single-editable-surface.test.ts` / `page-commit-failure-visibility.test.ts`
— **none may be re-derived** to buy the PBT row a pass.
**D3 (row 3):** P-SM-1's own generator guarantees (`seamCovered` for the five pinned seams,
`…pbt-generators.test.ts:1271-1273`), the `start:openset` `mountedDocumentIds` order clause, and 9b's
order-insensitive rows (`unit-u-shell-9b-cross-document-shared.test.ts:701-731`,
`unit-u-shell-9b-h3-doc-namespace.test.ts:312-340`) — unchanged; the 9b suites call `mountTabs` directly
and never compare body order.
**Cross-unit:** this amendment changes **no** `MATRIX_ROWS`/`ROW_EXTENDED`, **no** fence, **no**
`src/**`, **no** other spec's numbering, and **no** tracker row (the supervisor owns those).

#### A.4.5 In-place markings made by this pass (never a renumbering)

§A.1.3 (the body clause is a **SET**/coexistence — the seam's whole obligation; `⟨A.4.3⟩`), §A.2.5**(c)**
(the zero-surface document-tab non-finding **STANDS**, with the `REOPENED` condition recorded in place;
`⟨A.4.2⟩`), §6's `P-SM-1` row (the multi-seam body clause is a SET; `mountedDocumentIds` stays
order-sensitive; `⟨A.4.3⟩`), §A.3.2's affected-rows table (the **omitted** `…test.ts:869-887` row added;
`⟨A.4.1⟩`), §A.3.3's C2 blast radius (the omission + the row-side ruling named; `⟨A.4.1⟩`).
**§1–§10 keep their numbers; `A.n` ids are not reused.**

#### A.4.6 Unverified / not claimed by this pass

1. **No run.** Every green/red status here is a **source read** plus the recorded run readings quoted
   from the suites' own headers. The §A.4.1 red direction, the §A.4.2 counterexample and the §A.4.3
   measured order were **not re-executed**.
2. **§A.4.2's mechanism and site are UNVERIFIED.** The `0`-surface/`0`-body pane-additive state is
   **not reproducible** from the HEAD source by the traces this pass followed (the surface scope for a
   `t1`/`doc-a` state resolves to `'doc-a'` at `sidebar-panes.ts:983-986`→`:1964`). Which of
   `sidebar-panes.ts:1942/:1964`, `runtime.ts:632-654` or `pane-graph.ts:430` is at fault — **if the
   reading is real at all** — is not established here.
3. **The counterexample's provenance is not established by the file.** `…pbt-generators.test.ts:51-70`
   records readings taken **while** `src/**` landed §A.3's rulings (`01:44` baseline, landing
   `01:46`–`01:48`), so a residual reading may describe a mid-landing tree. It must be re-derived on
   HEAD before any clause or `src/**` change (§7.4).
4. **Drift pins found and corrected in place (the item-10d review owes the full recount).** §A.1.3's
   S3 pin `tests/unit-stage-active-tab-display.test.ts:519-527` is **drift** — at this read S3 is
   `:618-629` (assertion content unchanged; marked in place at §A.1.3). §A.3.2's `P-TP-2` pin
   `…pbt-generators.test.ts:1397-1415` is **drift** — at this read the `P-TP-2` row is
   `:1442-1531` and its `⟨C2⟩` carrier injection is `:1472-1475` (a **sibling** row — the P-SM-2
   caret-isolation block — now occupies `:1397-1415`). §A.3.2's `P-SM-2` caret-clause pin
   `…pbt-generators.test.ts:1330-1346` is **drift** — at this read that span is inside `P-SM-2`'s
   COMMIT block, and the caret-isolation clause is `:1394-1411`. §A.3.1's table cites the `P-SM-1` row as
   `…pbt-generators.test.ts:1134-1154` and `checkStep:1092-1128`; at this read the row is `:1189-1274`
   and `checkStep` is `:1140-1186`. **No clause, status or expectation is changed by these recount
   corrections.**
5. **Blast-radius pins inherited, NOT recounted by this pass.** The D1/D2 suite pins this amendment
   copies from §A.3.2/§A.3.3 (`…contract-holes.test.ts:514-523`/`:530-555`,
   `page-scoped-caret.test.ts:173-181`/`:196-202`, `edit-controller.test.ts` S1, the seven boot rows,
   the 9b family, the U-LIVE4 landing rows) are **inherited `[reading]` drift pins**, not re-read here —
   except the ones §A.4 explicitly recounts (S3 `:618-629`, S16 `:1155-1164`, S16b `:1166-1177`,
   `unit-u-shell-9b-cross-document-shared.test.ts:701-731`,
   `unit-u-shell-9b-h3-doc-namespace.test.ts:312-364`, the PBT `P-TP-2` `:1442-1531`). The obligation
   the pins carry (a named suite/row must stay green) is unaffected by a line shift.
6. **`H-1`/`H-2`/`H-3`/`H-4`/`H-5`, `P-IM-1`, `P-IM-2` and the `P-IM-2` MIXED-envelope case are
   UNTOUCHED** by this pass (their statuses are as §A.2.1/§A.2.3/§A.2.4 read them); §A.4 rules **only**
   the three rows named above.
7. **The two rows of §A.4.1/§A.4.3 were not re-pinned by this pass** (the SpecDoc wall is read/search +
   doc writes; the TestWriter owns the edits). Nothing here is a claim that either row is green today.
