# Unit `U-STAGE-ACTIVE-TAB` — GREEN-SCENARIO ARTIFACT (blind test writer)

- **Author:** blind-test writer (RCA-4 / `AGENTS.md` item 10a) — **documentation-derived, independently
  authored**. No `src/**` file was read for semantics, and none of the unit's own suites
  (`archive/tests/2026-10-04-unit-stage-active-tab-display.test.ts`, `archive/tests/2026-10-04-stage-active-tab-display-adversarial.test.ts`,
  `archive/tests/2026-10-04-page-commit-tab-ownership.test.ts`) was read before the scenarios below were written and run.
  This artifact is **not** a self-verified greens set: the implementer did not author it.
- **Source contract (read in full, incl. the binding amendment §A.1):**
  `docs/specs/unit-stage-active-tab-display.md` (§1–§10 + §A.1.1–§A.1.6). Supporting (documentation-only)
  reads: `docs/specs/unit-u-shell-9a-main-focus-tabs.md` (§2.2 tab model, §2.3 single-active render,
  §2.9 pin 6, §2.10 HOST-1 + the deferral caveat, §4 F1/F3/F4/F5/F9, §5.7), `docs/decisions.md`
  (`UI-CONFIG-CARRIER (C9)`, `MCP-FOCUS-TOOL`, `MCP-UI-EQUIVALENCE`,
  `ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`'s tab-scoped-cache clause), `docs/defects.md`
  (`STAGE-RACE-ASYNC-MOUNT`, `STAGE-FOREIGN-DOC-RE-DERIVE`, `STAGE-NO-SURFACE-NON-DOC-TAB`,
  `PAGE-STATE-NOT-TAB-OWNED`, `LIVE-UF9 SEARCH-OPEN-IN-TAB-SHOWS-DOC`),
  `docs/specs/live-user-flow-scenarios.md` §9, `docs/specs/unit-u-edit-1-greens.md` D6 (the close-drop
  reading of `prunePageState`), `package.json`.
- **Harness-setup disclosure (discipline).** The `SidebarPanes`/`Runtime`/`bridge` **wiring** (not any
  behavioral expectation) was taken from a sibling unit's harness *setup region* —
  `archive/tests/2026-10-04-unit-live4-empty-store-landing.test.ts` lines 50–130 and
  `archive/tests/2026-10-04-unit-u-shell-9b-w2n15-rederive-scope.test.ts` lines 60–230 — because the constructor shape is
  not prose-pinned. Neither file is this unit's suite, and no assertion was copied or read out of them.
  All other shapes (`SidebarPanes` members, `TabStrip.close(id)`, `applyContentReconcile`'s input,
  the `EditController` member set) were bound by **runtime probing only** (appendix §E).
- **Layer (RCA-12 declaration):** this artifact verifies the **HOST/RENDERER ordering + ownership key**
  and exactly **one ENVELOPE row** (the surface authored iff a document tab is active). It is
  **ENVELOPE/HOST-green, never APP-green**: the dom-shim is layout-less, so the **painted** stage
  identity, the real `rag.query` IPC window and the real `IPC_RAG_STORE_CHANGED` ordering are listed
  below as **NOT-TESTABLE** (NT-1…NT-9) and belong to the mandatory live battery
  (`docs/specs/live-battery-2026-09-22-page-commit-and-stage.md` — **that file does not exist in the
  tree at this run**; see DL-4).
- **Harness (provenance):** `archive/blind-runs/2026-09-22-unit-stage-active-tab-greens-harness.mjs`
  (gitignored `archive/`, per `archive/README.md`). **Exact command (repo root):**
  `npx esbuild archive/blind-runs/2026-09-22-unit-stage-active-tab-greens-harness.mjs --bundle --platform=node --format=esm --external:electron --outfile=/tmp/u-stage-active-tab-greens.mjs && node /tmp/u-stage-active-tab-greens.mjs`
- **Run (2026-09-22, twice, byte-identical output, exit code 0):** **39 node scenarios — 36 PASS,
  3 FAIL, 0 skipped**; **9 documented claims NOT-TESTABLE** (the assembled/painted set). Every scenario
  calls the **production modules by their real paths** (no stubs of the host, the runtime, the tab
  state, the strip or the edit controller).
  **⟨A.2 — AMENDED 2026-09-22/23 (see §A.2 at the end of this file): ONE of the three FAIL rows (`C7`)
  is SUPERSEDED — its premise does not reproduce on the current tree, re-measured by
  `archive/tests/2026-10-04-unit-stage-active-tab-display-blind-contradictions.test.ts` ROW 2 (9/9 GREEN). The original
  reading is KEPT in place (never deleted) as provenance. The `A11`/`A11b` FAILs are **CONFIRMED**.
  Corrected run reading of this artifact's own scenario set: **38 rows: 37 PASS / 1 FAIL** — see §A.2
  for the full accounting; the counts above are the ORIGINAL run's provenance.⟩**

Each row is **setup → action → the DOCUMENTED expected outcome** with the spec clause it derives from,
and the **measured** result.

---

## A. I2 / `I2-R` — the stage-display census at every node-observable seam (§5.1 I2, §A.1.1)

| id | Spec | setup → action → documented expected outcome | Measured |
| --- | --- | --- | --- |
| A1 | §5.3.5 r1, §5.4.1 | `mountTab(doc-a)` → the stage holds the doc-a body; **exactly one** `#page-edit-surface` whose `data-edit-surface === 'doc-a'`; `activeTabId='t1'`, `activeTargetKind='document'`, `activeDocumentId='doc-a'`; both discriminators agree | ✅ PASS — ids=1 markers=1 marker=`doc-a`, tab=t1 kind=document docId=doc-a, body=ALPHA |
| A2 | §5.4.2, §5.3.5 r1 | `mountTab(search)` then settle → `#stage-search-tab`+`#search-tab-input`; **no** document body root, **no** surface (census 0); kind='search'; `activeDocumentId===null` | ✅ PASS — ids=0 markers=0, search body present, ALPHA=false, kind=search docId=null |
| A3 | §5.4.18, §5.3.3 r5 | `mountTab(graph)` / `mountTab(template)` → their placeholders, census 0, `activeTargetKind='graph'\|'template'`, docId null; then `mountTab(doc-a)` → one surface again | ✅ PASS — placeholders present, census 0/0, kind/docId correct, doc-a remount 1/1 |
| A4 | §5.4.19, §5.3.1 (`entry === null`) | `mountTab(null)` → `activeTabId=activeTargetKind=activeDocumentId=null`, stage cleared, census 0 | ✅ PASS — tab=null kind=null docId=null census=0/0 |
| A5 | §5.3.3 r3 (control) | document tab → `reDerive('content')` → still ALPHA, census 1 with marker=doc-a, `activeDocumentId` unchanged, no node teardown | ✅ PASS — 1/1 marker=doc-a, body=ALPHA, docId=doc-a |
| A6 | §5.4.10, §5.3.3 r1–2, **FS-2/FS-3** | search tab active → `reDerive('content')` → **no** `ALPHA`, **no** `data-edit-surface` anywhere, census 0, the search body survives, identity unchanged | ✅ PASS — ALPHA=false, census=0/0, search body intact, kind=search |
| A7 | §A.1.1 + §A.1.2 (`R8`), §5.3.6 r2 | `mountTab(doc-a)` pre-state (1 surface) → `mountTabs([A,B])` → **exactly one** live surface carrying the ACTIVE document's marker (no duplicate, no stale root), both bodies present (the body carve-out), `mountedDocumentIds`=the open set; then `mountTab(doc-a)` → single-active restored | ✅ PASS — census 1/1 marker=`doc-a`, bodies A+B, mountedDocs=[doc-a,doc-b]; then mountedDocs=[doc-a], census 1/1, BETA gone |
| A8 | §5.3.4 r1 (A.1.5 green control, `R6`) | document tab → `await refresh()` → `#page-edit-surface` **and** `#editor-toolbar` survive, census 1/1, body intact | ✅ PASS — 1/1 marker=doc-a, surface+toolbar present, ALPHA present |
| A9 | §5.3.4 r2 (A.1.5 monitor, **FS-8**) | search tab → `await refresh()` → the search body is untouched, **no** document body / surface added, census 0 | ✅ PASS — census 0/0, search body intact, ALPHA=false |
| A10 | §A.1.1 (`rerenderAppGraph` seam) | document tab → `rerenderAppGraph()` → census 1/1 with the active document's marker | ✅ PASS — 1/1 marker=doc-a |
| A11 | §A.1.1 (**the `boot` seam**), §5.1 I2 clause 3 | boot → **census = 1 iff a document tab is active, else 0**; boot is a listed seam | ❌ **FAIL** — state after `host.boot(runtime)` with no `mountTab`: `activeTargetKind=null`, `activeDocumentId=null`, **census=1/1 marker=`doc-a`** (observed: `boot seam: activeTargetKind=null but census=1/1 marker=["doc-a"]`) — **⟨A.2 (this pass): CONFIRMED, NOT STALE — independently reproduced by `archive/tests/2026-10-04-unit-stage-active-tab-display-blind-contradictions.test.ts` ROW 1 / S1 (`:356`), RED, values VERBATIM; the open finding that carries it is the spec's §A.2.1 **H-3**; the row stays a FAIL, the reading is kept as provenance.⟩** |
| A11b | §5.2 (`_currentDocumentId` narrowing), **FS-7** | the boot-time surface must not be sourced from the retained selection field; it must be the active tab's document or absent | ❌ **FAIL** — booted with the persisted `defaultDocumentId='doc-b'` and still `marker=["doc-a"]`, `docId=null`, kind=null: the boot surface is authored with **no owning tab** (the `_currentDocumentId`/default-context class §5.2 removes from this seam) — **⟨A.2 (this pass): CONFIRMED, NOT STALE — independently reproduced by `…blind-contradictions.test.ts` ROW 1 / S2 (`:383`), RED, with the persisted `defaultDocumentId='doc-b'` and the same `["doc-a"]` marker; the boot source is the tree's `current = this._currentDocumentId ?? documentIds[0]` (`src/renderer/sidebar-panes.ts:2177-2180`) → `stageDocumentScope()`'s no-tab arm (`:3517-3520`) → the assembler's `documentId` (`:1725`). The row stays a FAIL.⟩** |
| A12 | §5.4.1 | doc A → doc B → back to A → body ALPHA/BETA/ALPHA, surface doc-a/doc-b/doc-a, `activeTabId` t1/t2/t1 | ✅ PASS — all three legs |
| A13 | §5.4.17, U-LIVE4 (control) | empty store → landing co-authored in the pane-inclusive envelope, census 0, kind='other' with docId null; a still-empty content re-derive keeps it | ✅ PASS — landing present, census 0/0, kind=other docId=null, survives `reDerive('content')` |

**A11/A11b reachability note (recorded, not softened).** The failing state is the one immediately after
the public `boot(runtime)` seam — reachable in the production renderer between boot and the first
`mountTab`, and cleared only by a later mount (`mountTab(null)` clears it — A4). §A.1.1 lists **boot** in
its seam list, so the row is a violation as written; app-level confirmation of that window is NT-9 (live).

## B. The surface is authored ONLY for a document tab (§5.3.5) — both discriminators

| id | Spec | setup → action → documented expected outcome | Measured |
| --- | --- | --- | --- |
| B1 | §5.4.14, §A.1.1 | doc tab → search tab → doc tab again: 1 / 0 / 1 surfaces, markers = doc-a / — / doc-a, and **the id count equals the marker count at every step** | ✅ PASS — 1/1 doc-a → 0/0 → 1/1 doc-a; discriminators agree |
| B2 | §5.4.10 | on a search tab, **zero** occurrences of `[data-edit-surface]` **anywhere** in the app graph | ✅ PASS — 0 occurrences |
| B3 | §A.1.2 clause 1 (the AF2 discipline) | across `mountTab`+`mountTabs`+`refresh`, **no** template/zone node is destroyed (a wildcard classifier would) | ✅ PASS — `zone:main` 1→1, `wiki-root` 2→2, `editor-toolbar` present |

## C. I1 — tab ownership, per-tab state, the close-drop (§5.1 I1, §5.3.2)

| id | Spec | setup → action → documented expected outcome | Measured |
| --- | --- | --- | --- |
| C1 | §5.4.11, **FS-4** | `mountTab(t1/doc-a)` + `pageSurfaceInput()` → subject **is the tab id** (`'t1'`), never a document id; `isDirty('t1')===true`, `isDirty('doc-a')===false` | ✅ PASS — subject=t1, isDirty(t1)=true, isDirty(doc-a)=false, commitState `{"subject":"t1","dirty":true}` |
| C2 | §5.1 I1 identity clause | `mountTab(null)` then a page seam call → subject `=== PAGE_EDIT_SURFACE_ID`; only that subject is marked | ✅ PASS — subject=`page-edit-surface`, isDirty(`page-edit-surface`)=true, isDirty(t1)=false |
| C3 | §5.4.12, **FS-5** | two tabs on the **same** document: an edit under t1 leaves `isDirty(t2)===false`, `anyDirty()===true`, the subject follows the active tab; `clearDirty` under t2 changes nothing for t1 | ✅ PASS — isolation holds (t1 dirty survives the t2 mount; clearDirty(t2) leaves t1 dirty) |
| C4 | §5.1 I1 isolation clause, **FS-5** | per-tab commit-failure records: `failure(t1)` and `failure(t2)` independent; a document id is **not** a key | ✅ PASS — failure(t1)="boom-t1", failure(t2)="boom-t2", failure(doc-a)=undefined |
| C5 | §5.4.7, `unit-u-edit-1-greens.md` D6 | **close-drop:** `prunePageState([t1])` (t1 = the live set, t2 closed) → t2's dirty flag **and** failure record are dropped, t1's survive | ✅ PASS — t2's dirty+record dropped, t1's kept |
| C6 | §A.1.4 step 1 | `saveCaret(t1, page caret)` → `restoreCaret(t1)` returns the page caret; a subject with **no** saved caret (`'ghost-tab'`) returns `undefined` | ✅ PASS — caret returned for t1; `undefined` for ghost-tab |
| C7 | **§A.1.4** (the pinned hook order) + §5.3.2 | (1) a caret-less read returns `undefined` **without** consulting `pageSubjectDocument`; (2) a read **with** a saved caret consults it **once, in read order**; (3) `doc === null` ⇒ the caret is **cleared** and `undefined` returned; (4) `doc` not in `backRefs` ⇒ cleared | ❌ **FAIL** — the hook is **never consulted**: `hookCalls=[]` for the caret-less read *and* for the saved-caret read (expected `['t1']`); with the hook answering `null` the caret was **RESTORED** instead of cleared; with the hook answering `'ghost-doc'` (outside `backRefs`) the caret was **RESTORED** instead of cleared (observed output quoted in §D below) **[ORIGINAL READING — KEPT AS PROVENANCE, NOT DELETED]** — **⟨A.2 (this pass): SUPERSEDED. Re-measured independently 2026-09-22/23 by `archive/tests/2026-10-04-unit-stage-active-tab-display-blind-contradictions.test.ts` ROW 2 (`:499-717`), run reading **9/9 GREEN** (`S5`–`S13`), harness path `archive/tests/2026-10-04-unit-stage-active-tab-display-blind-contradictions.test.ts`; the hook **IS** consulted → S5 measured `calls=['t1','t1']` for two saved-caret reads (exactly once per read, in read order) and `restored === CARET` for a live-document answer; it is **NOT** consulted caret-less → S6 measured `calls=[]`; and the caret **CLEARS** on a `null` answer (S7: `first===second===undefined`, `calls=['t1']`), on a non-string answer (S8: `undefined` ⇒ the `?? null` branch), and on a FOREIGN-document answer (S9: `'ghost-doc'` ⇒ cleared, `undefined`), while the `EditControllerOptions` field and the host's late-bind AGREE (S10) and the host's late-bound resolver is total + stale-proof (S13). Source-verified: the caret is read FIRST and the hook second (`src/renderer/edit-controller.ts:214-238`), the late-bind is non-enumerable (`:264-269`), and the host wires it (`src/renderer/sidebar-panes.ts:824-826`). **This row is therefore NOT a FAIL on this tree; it is a regression PIN** (forcing it red would encode a behavior §A.1.4/§5.3.2 FORBID).⟩** |
| C8 | §5.4.13, **FS-6** | surface present + document live: `saveCaret(activeTabId)` then `reDerive('content')` ⇒ `restoreCaret(activeTabId) !== undefined` and the surface is present with the active document's marker | ✅ PASS — surface 1/1 doc-a; the caret is returned after the re-derive |
| C9 | §5.3.2 last branches, **FS-6** | a caret whose document is **dead** (`backRefs` holds only another doc / is empty) and a caret whose `ragId !== PAGE_EDIT_SURFACE_ID` → each returns `undefined`, never a throw | ✅ PASS — all three directions returned `undefined` |

## D. V1 — the async clause (§5.3.1, **FS-1**)

| id | Spec | setup → action → documented expected outcome | Measured |
| --- | --- | --- | --- |
| D1 | §5.4.9, §5.3.1, **FS-1** | search mount in flight → `mountTab(doc-b)` → the stale settlement resolves ⇒ the stage still shows BETA, **no** search body, surface `doc-b`, and `getStageMountDropped()` **+1** | ✅ PASS — body BETA, no search body, marker=doc-b, dropped 0→1 |
| D2 | §5.4.8 (W2-N10 control) | a search mount settling while **its own** tab is active ⇒ the body **is** applied, dropped unchanged, the query is still issued (no cancellation added) | ✅ PASS — search body applied, dropped=0, one query issued |
| D3 | §5.4.19, `P-IM-1` | search in flight → `mountTab(null)` (dropped **unchanged** at the null mount) → the settlement resolves ⇒ discarded; per `P-IM-1` the counter equals the number of superseded settlements | ✅ PASS — dropped 0 at the null mount, 1 after the settle, no body applied |
| D4 | §5.5 non-throw/totality | `mountTab` over `{null, document, search, graph, template, null}` never throws; `getActiveTabId`/`getActiveTargetKind`/`getActiveDocumentId`/`getStageMountDropped` are total | ✅ PASS — no throw; all four readers returned the pinned values |

## E. §A.1.2 — the `destroyRoot` widening, positive **and** negative arms

| id | Spec | setup → action → documented expected outcome | Measured |
| --- | --- | --- | --- |
| E1 | §A.1.2, §7.3/§8.2 item 9 (`R8`) | a live surface, `applyContentReconcile({next, result})` with `result.removed=[{cssId:'page-edit-surface'}]` ⇒ the stale root is **actually destroyed** (the pre-fix refusal is the root cause) | ✅ PASS — `applied=["page-edit-surface"]`, census 1→0 |
| E2 | §A.1.2 clause 2 (**negative arm**) | a root that `next` **still authors** is **never** destroyed: `result.kept=[{cssId:'page-edit-surface'}]` with `next` authoring it ⇒ census stays 1/1 and the element's identity is preserved | ✅ PASS — census 1/1, node identity `node-4517` unchanged (no destroy+re-attach) |
| E3 | §A.1.2 clause 1 (closed whitelist, never a wildcard) | arbitrary/hostile bucket css ids (`zone:main`, `wiki-root`, `<img src=x onerror=1>`, `page-frame`) ⇒ each **refused** (`applied=[]`), no template/zone root destroyed, the surface survives | ✅ PASS — 4/4 refused (`removed root not found: <id>`), zone/template roots + surface intact |

## F. The re-derive scope gate and the strip → mount seam (§5.3.3, §5.4.3–§5.4.7)

| id | Spec | setup → action → documented expected outcome | Measured |
| --- | --- | --- | --- |
| F1 | §5.3.3, **FS-7** | the re-derive document scope must read the active target: `'doc-a'` on a doc-a tab, **`null`** on a search tab, `'doc-b'` after the switch | ✅ PASS — `'doc-a'` / `null` / `'doc-b'` |
| F2 | §5.4.3, `LIVE-UF9` (steady state) | `expandSearchTab('alpha')` → the strip commits a new tab → `onActiveChange` → `mountTab` → it becomes active with its **own** body; the previous document body is gone after settlement; census 0 | ✅ PASS — active='tab-2' kind=search queryId='search-2', open=2, settled: search body, ALPHA=false, census 0/0 (the strip/`commit`/`onActiveChange` chain is production; the `onActiveChange→mountTab` line is the harness's mirror of `renderer.ts`) |
| F3 | §5.4.4 | close the **active** tab (`strip.close('t1')`) → the left neighbour becomes active and displayed, the closed body is gone, census 1/1 with the neighbour's marker | ✅ PASS — t2/doc-b displayed, BETA only, census 1/1 marker=doc-b, mountedDocs=[doc-b] |
| F4 | §5.4.7 | close an **inactive** doc tab → nothing leaks into the stage, `mountedDocumentIds` = the active document only, a following content re-derive keeps the active document | ✅ PASS — mountedDocs=[doc-a], BETA gone, re-derive keeps doc-a |
| F5 | §5.4.5 (HOST-4 path) | search tab → `openDocumentTab('doc-b')` → the **document** body mounts in the same turn, the search tab stays open, the surface is that document | ✅ PASS — open=2 (s1 kept), census 1/1 marker=doc-b, BETA present |
| G1 | §5.5 (`FS-1`…`FS-9` census) | the FS mapping below is fully covered by the rows above | ✅ PASS — 38 node rows executed against `FS-1`…`FS-9` |

---

## D. **The FAILs, with observed output and the clause each contradicts**

| # | id | Observed (verbatim) | Clause contradicted | Class |
| --- | --- | --- | --- | --- |
| **F1** | A11 + A11b | `boot seam: activeTargetKind=null but census=1/1 marker=["doc-a"]`; with the persisted `defaultDocumentId='doc-b'` the marker is still `["doc-a"]`, `docId=null` | §A.1.1 (`I2-R` is TOTAL at **every** seam, and §A.1.1's seam list names **boot**: "the number of live page-edit surface roots equals 1 **iff a document tab is active**, else 0") + §5.1 I2 clause 3 + §5.2's `_currentDocumentId` narrowing (a boot surface with **no** owning tab is the removed-role class; the fail-state id is `FS-7`) — **⟨A.2 (this pass): CONFIRMED — the reading stands and is independently reproduced (spec §A.2.2), so this row is NOT stale evidence.⟩** | un-hardened seam (node-observable) — **still OPEN as the spec's §A.2.1 `H-3`** |
| **F2** | C7 | `the hook's consultation set is not the saved-caret read set (§A.1.4: once per call, in read order): calls=[] ; pageSubjectDocument answered null … but the caret was RESTORED instead of cleared (§5.3.2 branch 2): {"kind":"rich","ragId":"page-edit-surface",…} ; hook calls for a non-live-document answer: [] ; pageSubjectDocument answered a document outside backRefs ('ghost-doc') but the caret was RESTORED instead of cleared (§5.3.2 branch 3)` **[ORIGINAL READING — KEPT AS PROVENANCE, NOT DELETED]** — **⟨A.2 (this pass): SUPERSEDED by the independent re-measurement of `archive/tests/2026-10-04-unit-stage-active-tab-display-blind-contradictions.test.ts` ROW 2 (9/9 GREEN, 2026-09-22/23): the hook IS consulted once per SAVED-caret read, is NOT consulted caret-less, and CLEARS on `null`/non-string/foreign answers; the values this row reports (`calls=[]`, a `null`/`'ghost-doc'` answer RESTORING the caret) do **NOT reproduce**. The consequence recorded here — "the two `A3/P-IM-4` rows are unsatisfiable on this tree" — is WITHDRAWN as a statement about the **implementation**: those rows were unsatisfiable **as written** (the row defect §A.1.4 adjudicates: `HOSTILE_SUBJECTS` has no `'t1'`, and the read-before-save loop never consults the hook), and the re-pinned form is measured GREEN in `…blind-contradictions.test.ts` S12 (`:642-665`). See §A.2 of this artifact.⟩** | **§A.1.4** (the pinned hook order) + **§5.3.2**'s pinned `pageSubjectDocument` semantics + §5.3.2's `EditControllerOptions` member. **⟨A.2: clause NOT contradicted on this tree — see the SUPERSEDED note; the row-level (not code-level) defect is §A.1.4's own adjudication.⟩** | **stale evidence at HEAD** (was: doc/spec drift between the pinned seam and the shipped controller) |

**Not softened.** Both rows keep the documented expectation; neither expectation was relaxed to pass.
**⟨A.2 CORRECTION (2026-09-22/23, this pass) — read this before the paragraph below, which is the
ORIGINAL run's reading and is kept as provenance.** The **`F2` row is SUPERSEDED, and its `C7`
premise does NOT reproduce**: an independent re-measurement
(`archive/tests/2026-10-04-unit-stage-active-tab-display-blind-contradictions.test.ts` **ROW 2**, `:499-717`, recorded run
reading **9/9 GREEN**, `S5`–`S13`) found the `pageSubjectDocument` hook **IS** consulted — **once per
SAVED-caret read, in read order** (`S5` measured `calls=['t1','t1']` over two surviving reads),
**never for a caregiver-less read** (`S6` measured `calls=[]`), and the caret **CLEARS** on a `null`
answer (`S7`), a non-string answer (`S8`, the `?? null` branch) and a FOREIGN-document answer (`S9`,
`'ghost-doc'`), with the constructor field and the host late-bind **agreeing** (`S10`) and the host's
late-bound resolver total + stale-proof (`S13`). Source corroboration:
`src/renderer/edit-controller.ts:214-238` (caret read FIRST, hook second), `:264-269` (non-enumerable
late-bind), `src/renderer/sidebar-panes.ts:824-826` (the host's wiring). **`F1` (the boot-seam census)
is CONFIRMED, not stale** — independently reproduced by the same harness's **ROW 1 / S1 + S2**
(`:356`, `:383`, RED, values verbatim), and the open finding that carries it is the spec's **§A.2.1
`H-3`**. So this artifact's run reading is **38 rows: 37 PASS / 1 FAIL** after the correction
(the `C7` FAIL is withdrawn as stale evidence **by its own premise**, never by relaxing the
expectation), with the boot census's FAIL standing. **The paragraph below is the ORIGINAL reading:
kept, never deleted.**⟩**

**Not softened (original run, kept).** Both rows keep the documented expectation; neither expectation
was relaxed to pass.
Nothing in this run contradicts the six §5.1/§A.1 invariants **at the seams the node layer can reach**
other than the two rows above: `I2-R` holds at `mountTab`/`mountTabs`/`refresh`/content-re-derive/
`rerenderAppGraph`/the empty-store landing, `I1`'s identity/isolation/caret-viability clauses hold for
the host's subjects, and the `destroyRoot` widening holds on both arms.

## E. **NOT-TESTABLE (documented claims this node layer structurally cannot observe)**

| # | Claim / spec clause | Reason (recorded park, never a fake PASS) |
| --- | --- | --- |
| NT-1 | **P-TP-1** — the **painted** `#zone:main` identity equals the active `.tab.is-active[data-tab-id]`'s kind (§6 `P-TP-1`, §8.3, RCA-12) | the dom-shim is layout-less/CSS-less: "which element actually occupies `#zone:main`" is unassertable in node (§9 item 1) |
| NT-2 | the **V1 race window** — a real click on `#pane-search-expand-tab` then a real result/doc-nav click **inside** the real `rag.query` IPC round trip (§8.3 block 2; audit §4.2 row 1) | the shim's bridge resolves on a harness-controlled deferred; real engine latency is the live window |
| NT-3 | the **V2 broadcast ordering** — main→preload→renderer `IPC_RAG_STORE_CHANGED` driving the content re-derive under a search tab (§8.3 block 3) | in node the broadcast is a direct call; the real ordering is live (docs/specs/rca-live-bugs-green-pipeline.md §3) |
| NT-4 | the `ufStageSig` extension + the `stageMatchesActiveTab` derived verdict (§8.3; an **oracle-identity change**, `requirement-catalog` fact 3) | `scripts/live-drive.mjs` is the live oracle; this run does not touch it |
| NT-5 | the live re-run of `user9_search_open_in_tab` / row `UF-DEFECT-7` (§8.3 block 1) | needs the assembled app + a usable display |
| NT-6 | the persisted tab round-trip across two launches with a shared `--home` (§8.3 block 5) | needs two real app launches |
| NT-7 | the real gnosis-pane refresh gesture (the `onChanged` → `refresh()` caller) (§8.3 block 4) | the node path calls `refresh()` directly (A8/A9); the real gesture is live |
| NT-8 | the host's **failure-record write through the public commit seam** (a failing `EditController.commit` + `pageEditSurfaceBlur` left `pageEditSurfaceFailure(t1)===undefined` while the dirty flag cleared) | harness-binding limit: the node harness cannot tell a missing failure write from a wrong commit plumbing (`U-EDIT-1` §8.1 `FS17` territory). **FS-5's failure half was therefore driven through the host's `recordPageFailure` writer (C4/C5) — provenance recorded, not hidden** |
| NT-9 | the **app-level reachability** of the A11/A11b boot state (does the assembled app expose a booted host with no active tab?) | needs the live boot read; the row is reported as FAIL on the documented seam regardless |

## F. `FS-1`…`FS-9` coverage (node-observable rows)

| fail-state | node row(s) | status |
| --- | --- | --- |
| `FS-1` superseded async mount applied | D1 (+D3 for the post-`null` settlement) | PASS (green control) |
| `FS-2` foreign document body on a non-document tab | A6 | PASS |
| `FS-3` surface authored while the active target is not a document | A2, A6, B1, B2 | PASS |
| `FS-4` subject is a document id | C1, C2 | PASS |
| `FS-5` two tabs share dirty / failure / caret state | C3, C4, C5 | PASS |
| `FS-6` caret dead / restored against the wrong document | C6, C7 (**FAIL**), C8, C9 | **FAIL** (the hook arm) — **⟨A.2: the `C7` arm is WITHDRAWN as stale evidence (its premise does not reproduce; see §A.2 below and the §C row). `FS-6` is now carried by the CONFIRMED directions: C6/C8/C9 PASS, and the hook direction is measured GREEN by `…blind-contradictions.test.ts` ROW 2 / S5–S13. The spec's own `FS-6` direction that IS still open is the close-time wrong-document caret — §A.2.1 **H-4** (`archive/tests/2026-10-04-unit-stage-active-tab-display-contract-holes.test.ts:484-512`), not this artifact's row.⟩** |
| `FS-7` a stale `_currentDocumentId` used as the scope | F1 (PASS), A11/A11b (**FAIL** at boot) | **FAIL** (the boot seam) |
| `FS-8` `refresh()` lost the surface / reloaded a doc into a non-doc tab | A8, A9 | PASS (monitor, A.1.5 green control) |
| `FS-9` `mountTabs` reachable from production | A7 (behaviour) + the static census: `grep -rnoE "[A-Za-z_.]*mountTabs\(" src --include=*.ts` ⇒ **one hit, `src/renderer/sidebar-panes.ts:954` = the definition itself; zero call sites** | PASS |

## G. §6 register rows — coverage by the rows above (not a PBT re-run)

| row | rows that carry its proposition | status |
| --- | --- | --- |
| `P-IM-1` stage-mount dominance (V1) | D1, D2, D3, A12 | PASS (sampled schedules only — the 400-attempt seeded register is the unit's own PBT suite, not this artifact) |
| `P-IM-2` surface census by active kind (`k !== 'document'` ⇒ no surface, no foreign root) | A1–A4, A6, B1, B2, A13 | PASS |
| `P-IM-3` ownership-subject totality (never a `documentId`, never null/empty) | C1, C2 | PASS |
| `P-IM-4` `pageSubjectDocument` total + stale-proof | C6, C8, C9, **C7** | **FAIL** — the hook is not consulted at all (F2 above) **⟨A.2: WITHDRAWN/SUPERSEDED — the hook IS consulted (once per saved-caret read), clears on `null`/non-string/foreign answers, and the host's late-bound resolver is total + stale-proof; measured GREEN 9/9 by `…blind-contradictions.test.ts` ROW 2 (`S5`–`S13`, incl. `S12`'s re-pinned consultation set and `S13`'s host totality). `P-IM-4` **HOLDS** on this tree — the spec-side record is §A.2.1's note that a **truthy non-string** hook answer and a **conflicting field-vs-late-bind** precedence are NOT pinned by §5.3.2/§A.1.4 (recorded in the harness header `:125-129`).⟩** |
| `P-SM-1` single-active preserved by every stage seam (bodies may coexist at `mountTabs` only) | A1–A10, A12, F3, F4 | PASS |
| `P-SM-2` cross-tab isolation of page state | C3, C4, C5 | PASS |
| `P-TP-1` the painted stage identity | — | **NOT-TESTABLE** (NT-1; live-only) |
| `P-TP-2` caret-lifecycle totality across a re-derive | C6, C8, C9 / **C7** | **FAIL** on the hook arm (the dead-guard direction the row's negative discriminator names) — **⟨A.2: WITHDRAWN/SUPERSEDED for the same reason — the dead-guard direction does NOT reproduce (the hook validates the subject's DOCUMENT, `src/renderer/edit-controller.ts:231-238`), and `…blind-contradictions.test.ts` ROW 2 / S11 (`:704`) measures the lifecycle GREEN through the HOST-owned controller across a content re-derive. `P-TP-2`'s **still-open** direction on this tree is the close-time wrong-document caret (§A.2.1 **H-4**), which is that row's discriminator on a DIFFERENT seam, not this artifact's.⟩** |

## H. Documentation-only rows (no runtime surface)

| id | Claim verified | Method | Result |
| --- | --- | --- | --- |
| DL-1 | **`FS-9`'s tracker half** — `LIVE-UF9 SEARCH-OPEN-IN-TAB-SHOWS-DOC` is **re-scoped to V1**, id KEPT, not closed | read of the row: "**RE-SCOPED 2026-09-22** … CROSS-REF: **`STAGE-RACE-ASYNC-MOUNT`** (V1) and **`STAGE-FOREIGN-DOC-RE-DERIVE`** (V2). The id is KEPT and NEVER reused"; status "OPEN (RE-SCOPED 2026-09-22; NOT fixed, NOT closed …)" | ✅ PASS |
| DL-2 | the four unit defect rows exist and are **OPEN** with the audit as source: `STAGE-RACE-ASYNC-MOUNT`, `STAGE-FOREIGN-DOC-RE-DERIVE`, `STAGE-NO-SURFACE-NON-DOC-TAB`, `PAGE-STATE-NOT-TAB-OWNED` | read of `docs/defects.md` rows 39–42 | ✅ PASS |
| DL-3 | the decision rows this unit rides are present and state the pinned models: `UI-CONFIG-CARRIER` (C9, ACTIVE — "open tabs / active tab serialize through `OperatorSettings`"), `MCP-FOCUS-TOOL`, `MCP-UI-EQUIVALENCE`, `ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (the tab-scoped read-cache clause: "Host read cache exists only for currently tab-owned documents and pane data") | read of `docs/decisions.md` | ✅ PASS |
| DL-4 | **citation finding (recorded, not repaired):** the live battery file the unit's §8.3 mandates — `docs/specs/live-battery-2026-09-22-page-commit-and-stage.md` — **does not exist in the tree at this run** (a `docs/specs` listing shows no such file, and no file references that name). NT-1…NT-7 are therefore parked against the live battery by **§8.3 of the unit spec** only | `ls docs/specs` + `grep -rl "page-commit-and-stage" docs` ⇒ no hits | ⚠ recorded finding for the doc review (§9's own citation discipline) |

## Appendix — harness-binding shapes (probed at runtime, recorded so the binding is auditable)

`new SidebarPanes({ mount, operatorMount, registry, bridge, backRefs, editController })` ·
`await host.boot(runtime)` · `mountTab(entry)` / `mountTabs(entries)` / `reDerive(kind)` / `refresh()` /
`rerenderAppGraph()` · `TabEntry = { id, target, title, search? }` ·
`new TabStrip({ mount, onActiveChange })` with `load(state)`/`getState()`/`active()`/`close(id)` (**the id
is required** — `close()` without it is a no-op)/`expandSearchTab(q)`/`openDocumentTab(documentId)` ·
`Runtime.applyContentReconcile({ next, result })` where `result` is the pure reconciler's bucket object
`{removed, added, replaced, kept, warnings}` whose entries are `{cssId}` (a missing `result` throws
`applyContentReconcile: result/next required`; a cssId absent from the live DOM warns
`applyContentReconcile: removed root not found: <id>`) · the host readers
`getActiveTabId`/`getActiveTargetKind`/`getActiveDocumentId`/`getStageMountDropped`/`getMountedDocumentIds`/
`stageDocumentScope`/`pageEditSurfaceHandlerSubject`/`pageEditSurfaceCommitState(subject)`/
`pageEditSurfaceFailure(subject)`/`recordPageFailure(subject, record)`/`prunePageState(liveIds)` ·
`createEditController({ backRefs, commit, onRebuild, pageSubjectDocument? })` with
`saveCaret`/`restoreCaret`/`isDirty`/`clearDirty`/`anyDirty`.
**Not recounted here (another pass's DERIVED readings):** the 32-file `SidebarPanes` blast-radius family,
the §5.6 census rows 4–15, and the 9a/9b suite counts.

---

## §A. Amendment log (append-only — never a renumbering)

Amendments to this artifact are **appended here**; a superseded reading is **marked in place**
(never silently deleted), so its provenance survives for the item-10d doc review.

### A.2 AMENDED 2026-09-22/23 — the `C7`/`F2` correction (`SUPERSEDED IN PLACE`) and the `A11`/`A11b` confirmation

**Scope of this pass.** A SpecDoc record pass wrote **this artifact** and
`docs/specs/unit-stage-active-tab-display.md` (§A.2 there) **only** — no `src/**`, no `tests/**`, no
tracker. It re-measured **nothing** itself (the SpecDoc tool wall is read/search + doc writes, **no
shell**): every value below is cited from the **harness path that measured it**, and the tree was
re-read for the source corroboration. The date is `[reading]` on the tree's newest dated record
(`2026-09-22`); a doc review must correct it if the calendar disagrees.

#### A.2.1 The correction — `C7` (and the matching §D `F2`, §F `FS-6`, §G `P-IM-4` / `P-TP-2` rows) are **SUPERSEDED**

**The superseded claim.** `C7` recorded `❌ FAIL` with the reading *"the hook is **never consulted**:
`hookCalls=[]` … with the hook answering `null` the caret was **RESTORED**"* and the matching
`'ghost-doc'` direction — i.e. that `EditControllerOptions.pageSubjectDocument` is **NEVER** consulted
and that a `null`/`'ghost-doc'` answer restores the caret.

**The re-measurement (independent; not by this pass, and not by the implementer).**

| field | value |
| --- | --- |
| harness path | **`archive/tests/2026-10-04-unit-stage-active-tab-display-blind-contradictions.test.ts`**, `describe('ROW 2 — the \`pageSubjectDocument\` hook per §A.1.4/§5.3.2 (artifact C7 does NOT reproduce at HEAD: 9/9 GREEN)')` (`:499-717`) |
| measured reading | **9 rows, 9 GREEN** (`S5`–`S13`) — the file's own recorded run reading (`:67-74`) |
| measured values | `S5`: a SAVED-caret read consults the hook **exactly once per read, in read order** — `calls=['t1']` then `calls=['t1','t1']` across two surviving reads, with the live-document answer restoring the caret; `S6`: the **caret-less** read returns `undefined` with `calls=[]` (**not consulted**); `S7`: a `null` answer ⇒ **cleared**, `undefined`, and the second read is caret-less (`calls=['t1']`); `S8`: a non-string (`undefined`) answer ⇒ the `?? null` branch, **cleared**; `S9`: a FOREIGN-document answer (`'ghost-doc'`, absent from `backRefs`) ⇒ **cleared**; `S10`: the `EditControllerOptions` field and the host late-bind **AGREE** on the `S7` state; `S12`: §A.1.4's own re-pin — `hookCalls` EQUALS the hostile-subject list in read order and `'t1'` is absent; `S13`: `P-IM-4` at the HOST seam — `activeDocumentId` iff `subject === activeTabId` and the target is a document, else `null`, never a throw |
| source corroboration (this pass's re-read) | `src/renderer/edit-controller.ts:214-238` — the saved caret is read **FIRST**, the hook **second** (the `saved == null ⇒ return undefined` early return is `:221`); `:239-242` clears the stale entry; `:264-269` attaches `setPageSubjectDocument` non-enumerably; `src/renderer/sidebar-panes.ts:824-826` wires the host's resolver (`subject === this.activeTabId ? this.activeDocumentId : null`) |
| date | **2026-09-22/23** (`[reading]`, see the scope note) |

**What was done to this artifact (in place, nothing deleted).** `C7`, the §D `F2` row, the §F `FS-6`
row and the §G `P-IM-4` / `P-TP-2` rows now each carry the **original reading verbatim** marked
`[ORIGINAL READING — KEPT AS PROVENANCE, NOT DELETED]` **plus** an `⟨A.2 … SUPERSEDED⟩` annotation with
the harness path, the measured values and the date. The **expectation was not relaxed** — the row's
documented expectation (§A.1.4's pinned order + §5.3.2's four branches) is **unchanged and now
MEASURED GREEN**; what changed is the **artifact's reading of the tree**, which was stale. `C7` is
therefore a **regression PIN**, never a red row: authoring it as a failure would encode a behavior
§A.1.4/§5.3.2 **forbid**.

**Consequence for the run accounting.** The original reading was `39 node scenarios — 36 PASS / 3 FAIL`.
With `C7` withdrawn, this artifact's scenario set reads **38 rows: 37 PASS / 1 FAIL** (the boot-seam
census remains FAIL). The `39 / 36 / 3 / 9 NOT-TESTABLE` figures are kept in the header as the
**original run's provenance**, annotated in place.

#### A.2.2 The `A11`/`A11b` rows are **CONFIRMED** (independently reproduced — never to be treated as stale)

The two boot-seam `FAIL`s were reproduced **verbatim** by the same independent harness:
**ROW 1 / S1** (`:356`) and **S2** (`:383`), whose own recorded run reading is **RED — 2 rows**:
`[page-edit-surface]=1 [data-edit-surface]=1 marker=["doc-a"] agrees=true` with
`activeTabId=null activeTargetKind=null activeDocumentId=null`, at boot **and** with the persisted
`defaultDocumentId='doc-b'`. The boot source is the tree's `current = this._currentDocumentId ??
documentIds[0]` → `setCurrentDocumentId` → `loadAppGraph` → `documentId: this.stageDocumentScope()`
(`src/renderer/sidebar-panes.ts:2177-2185`, `:1725`, `:3517-3520`). **These rows remain FAIL and are
NOT withdrawn.** The spec now records them as **§A.2.1 `H-3`** with the **three independent
derivations** (the adversarial pass; the `P-SM-1` schedule's drawn `'boot'` starting state —
`archive/tests/2026-10-04-unit-stage-active-tab-display-pbt-generators.test.ts:978-999`, **BROKEN @7 attempts**; the
`A11`/`A11b` rows themselves) **plus** this fourth, independent reproduction (spec §A.2.2).

#### A.2.3 Recorded, not asserted (unverified / not-pinned directions this correction surfaces)

1. **A truthy non-string hook answer** (e.g. `42`) is outside the declared `string | null` member type
   and §5.3.2's `?? null` says nothing about it — **only** the `null`/`undefined` branch is pinned
   (harness note `:125-127`). **Unverified / not pinned.**
2. **A conflicting field-vs-late-bind precedence** (both supplied, different answers) is **not
   specified** by §5.3.2/§A.1.4; `S10` pins only that the two paths **agree** on the `S7` state
   (harness note `:128-129`). **Not pinned.**
3. **`NT-1`…`NT-9` remain NOT-TESTABLE** — unchanged by this pass; the assembled/painted set is still
   live-only (RCA-12), and this artifact claims **no** app-green anywhere (§9).
4. **§H `DL-4` (`docs/specs/live-battery-2026-09-22-page-commit-and-stage.md` absent) still stands** —
   re-checked in this pass's own tree read: **no such file exists** under `docs/specs/**` and no file
   references that name. This artifact may not create it (another unit's live battery).
