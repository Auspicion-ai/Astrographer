# Unit `C9 U-EDIT-1` (whole-page editing) — GREEN-SCENARIO ARTIFACT (blind test writer)

- **Author:** blind-test writer (RCA-4 / `AGENTS.md` item 10a) — **documentation-derived, independently
  authored**. No line of `src/**` was read, and none of the unit's own suites
  (`tests/page-diff.test.ts`, `tests/edit-adversarial.test.ts`,
  `tests/unit-u-edit-1-property-register.test.ts`, `tests/page-commit-tab-ownership.test.ts`) was read.
  This artifact is **not** a self-verified greens set: the scenarios and their expectations were authored
  by an agent that did not implement the unit.
- **Source contract (read in full, incl. §11.7 / §11.8 / §11.9):**
  `docs/specs/unit-u-edit-1-whole-page-editing.md`. Supporting contract reads (documentation only):
  `docs/decisions.md` (`DECIDED: WHOLE-PAGE-EDITING`, `EDITING-MODE-SETTING`, `FORM-CONTROL-EDITING`,
  `RICH-TEXT-EDITING-GATE`, `RICH-TEXT-EDIT-OPS`, `BATCH-ATOMICITY-API`, `PROJECT-JOURNAL`,
  `EDIT-OP-CENSUS`, `RAG-SNAPSHOT-PRESERVED`), `package.json`, and the installed package declarations
  `node_modules/provident-editable/dist/*.d.ts`.
- **Layer (RCA-12 declaration):** this artifact verifies the **PURE / ENVELOPE + STORE** half and the
  **host-side state machine** half only (spec §10 rows 1 and the envelope part of row 2). It is
  **ENVELOPE/STORE-green, not APP-green**; every `ASSEMBLED/RENDERER` (painted) and `APP-GREEN` claim of
  §8.3 is listed below as **NOT-TESTABLE** (live battery `U-EDIT-1-LIVE`, still UN-RUN and OWED per
  §11.8 item 5 / §11.9 item 6).
- **Harness (provenance; `archive/` is gitignored — `archive/README.md`):**
  `archive/blind-runs/2026-09-23-unit-u-edit-1-greens-harness.mjs` (41 scenarios) plus the fs
  instrumentation wrapper `archive/blind-runs/2026-09-23-unit-u-edit-1-fs-probe.mjs`.
- **Exact command (from the repo root):**
  `npx esbuild archive/blind-runs/2026-09-23-unit-u-edit-1-greens-harness.mjs --bundle --platform=node --format=esm --external:electron --alias:node:fs=./archive/blind-runs/2026-09-23-unit-u-edit-1-fs-probe.mjs --outfile=/tmp/u-edit-1-greens.mjs && node /tmp/u-edit-1-greens.mjs`
  (the `--alias:node:fs` wrapper counts the store's persist writes so scenario `C3`/`C4`/`C7` can assert
  the persist census without reading `src/**`).
- **Run (2026-09-23, twice, identical output, exit code 0):** **41 scenarios — 41 PASS, 0 FAIL,
  0 skipped.** No spec-vs-implementation drift was found on the reachable contract surfaces.
- **Harness-binding note (discipline).** The scenarios call the **production modules by their real paths**
  (`src/main/page-diff.ts`, `src/main/rag-store.ts`, `src/main/edit-ops.ts`,
  `src/renderer/sidebar-panes.ts`, `src/renderer/pane-graph.ts`, `src/renderer/edit-controller.ts`,
  `src/renderer/tab-state.ts`, `src/main/operator-settings-store.ts`). Since their **input shapes** are
  pinned in prose (not as signatures), the constructor/argument shapes were bound by **runtime probing of
  the exported symbols only** (`decodePage`/`buildPageOps`/`handleEditBatch`/`SidebarPanes`/`buildTraversal`
  arities and their refusal messages) — **no source text was read**. Every **expectation** below is taken
  from the spec clause named in its row. Probed shapes, recorded so the binding is auditable:
  `createJsonRagStore({ path })`; a node is `{id,type,content,ownedNodeIds,createdAt,updatedAt,props?,children?}`
  with **ISO-string** timestamps; an edge is `{id,kind,source,target,order?(doc-child only),documentIds?,createdAt,updatedAt}`;
  RAG-owned props are carried on the page as the `data-rag-props='{json}'` attribute (plain element
  attributes are **not** RAG props); a `SidebarPanes` instance is constructed with one context object and
  the page seam is driven through `pageEditSurfaceInput()` / `pageEditSurfaceBlur(html)` / the
  `bridge.edit.batch(ops)` seam; the per-tab record is read with `pageEditSurfaceFailure(tabId)` /
  `pageEditSurfaceCommitState(tabId)`; a tab's page state is keyed by `activeTabId`.

Each scenario below is written as **setup → action → documented expected outcome**, with its derived spec
section and the measured result.

---

## A. The adapter contract — decode (`src/main/page-diff.ts`, §3.1/§3.2)

| id | Spec | setup → action → expected outcome (documented) | Result |
| --- | --- | --- | --- |
| A1 | §3.1 (`decodePage` → `PageDecodeResult`, `PageBlock` field set); §3.2 step 1 | a surface root (`id=page-edit-surface`, `data-edit-surface=doc-x1`) holding the doc-head `h1` + two `p` blocks, each carrying `data-rag-node-id` → `decodePage(html)` → `{ok:true, documentId:'doc-x1', blocks:[3]}` in document order, each block's **exactly** `{ragId, elementType, content, children, text, props}`, `ragId` taken from `data-rag-node-id`, `elementType` = the tag, `text` = the package plain text | ✅ PASS — 3 blocks, closed field set, ragIds = the document's node ids |
| A2 | §3.1 totality row (typed `Error` for a malformed **input shape** → the adapter's guard); FS7; §7 `P-TP-1` ("never a throw of a native `TypeError`") | `decodePage(null / 42 / undefined / {} / [])` → each call returns `{ok:false, kind:'decompose-failed', message:<non-empty>}` and **never throws** | ✅ PASS — 5 inputs → `decompose-failed`, no throw |
| A3 | §3.1 `text`-run semantics ("flattened into the owning block's `content`… a projection that reads the raw package `content` would emit a spurious op on every block with inline children, `FS9`"); §3.2 `children` row | page `a<strong>b</strong>c` → decode → `content === 'ac'` (the run text **around** the child), `children === [{type:'strong', content:'b'}]`, `text === 'abc'`; then a store node carrying the **same** inline children → `buildPageOps` → **`ops === []`** (an unchanged inline-children block yields no op) | ✅ PASS — `content="ac"`, `text="abc"`, 1 `strong` child; 0 ops on the equal block |
| A4 | §3.2 recorded capability gap (`table`/`thead`/`tr`/`td`/`th` are not `ProvidentNodeType` members — "the adapter must **refuse** … rather than retype, remove or flatten a stored `td`/`th`/`tr`/`table` node"); §3.1 mapping table's last row; FS7 | a `<table>` block on the page → `decodePage` → `{ok:false, kind:'decompose-failed'}` naming the capability gap; then `buildPageOps(refusal, snapshot, docId)` → **the same typed refusal**, never a silent empty op list, never a throw | ✅ PASS — refusal: "…a `<table>` block cannot be expressed by the adopted decomposer (recorded capability gap…)" |
| A5 | §3.2 ("a block-level element with **no** `data-rag-node-id` — including a `textarea` element … is a **surface artifact** … folded into its **parent block's** `content`"); §5.1 | page `p[data-rag-node-id]` containing a `<textarea id="textarea-…">` → `decodePage` → **one** block, `elementType:'p'`, `content` = the parent text **plus** the artifact's text, and **no** `textarea`-typed block | ✅ PASS — 1 block, `content="hithere"` |

## B. The adapter contract — `buildPageOps` (the closed change-kind → op mapping, §3.1/§3.2/§3.3 item 8)

| id | Spec | setup → action → expected outcome (documented) | Result |
| --- | --- | --- | --- |
| B1 | §3.2 minimal-op rule ("no block whose compared fields are all equal appears at all"); §7 `P-TP-2` | page textually identical to the store → `buildPageOps` → `{ok:true, ops:[]}` | ✅ PASS — `ops === []` |
| B2 | §3.2 minimal-op rule / `FS9` ("a one-character edit in one paragraph of a 200-block document yields an op list that names **one** node id") | 40-block document, one character changed in block 20 → 1 op, naming only `doc-x1:p:20` | ✅ PASS — exactly 1 op naming `doc-x1:p:20` |
| B3 | §3.1 mapping row 1 (`update[i].type` → one `setType`); §2.4 item 4 (`setType` never delete+create); `FS6` | doc-head rendered as `<h2>` where the store holds `h1` → exactly one `{op:'setType', nodeId:'doc-x1:h1:1', type:'h2'}`, and **no** `removeNode` / fresh-`putNode` for that node | ✅ PASS — exactly one `setType` |
| B4 | §3.1 mapping row 3 (`update[i].props` → the **changed RAG-owned keys only** — "the package's FULL object is diffed against the store node's props"); §3.2 `props` row | store `p1` props `{lang:'en', keep:'yes'}`, page `data-rag-props='{"lang":"fr","keep":"yes"}'` → exactly one `setProps` whose `props` is `{lang:'fr'}` (**not** the full object) | ✅ PASS — `{lang:"fr"}` only |
| B5 | §3.2 "Explicitly NOT diffed" (`contenteditable`, `data-edit-surface`, `data-node-id`, the head's `data-doc-head`, `style`, class lists) — "the **ADAPTER's own filter**"; `FS8` | page differs from the store **only** by runtime props (`contenteditable`/`class`/`style`/`data-edit-surface`/`data-node-id`/`data-doc-head`) → `ops === []` | ✅ PASS — runtime-prop-only change ⇒ 0 ops |
| B6 | §2.2 item 3 / §3.1 props row (`setProps` MERGES, so `data-doc-head` survives); `FS3` | store head props `{'data-doc-head':'1'}`, page head adds RAG-owned `{lang:'fr'}` → one delta-only `setProps`; the op is then applied through the store → the node's props still contain `data-doc-head` **and** gain `lang` | ✅ PASS — delta-only op; marker preserved by the merge |
| B7 | §3.1 new-block row + §3.3 item 8 (id-minted `putNode` + the **`doc-child`** `putEdge` from the containing section, carrying `order` + `documentIds:[documentId]`; minting scheme `${documentId}:${type}:${n}` with `n` above every existing `n`); `FS13` | page gains `<p>Brand new paragraph</p>` (no `data-rag-node-id`) → `ops = [putNode, putEdge]`; minted id `doc-x1:p:3` (n > 2), no collision, edge `kind:'doc-child'`, `source` = the containing section `doc-x1:h1:1`, `documentIds` contains the document id, `order` present | ✅ PASS — `doc-x1:p:3` + `doc-child` edge from `doc-x1:h1:1` (order 3) |
| B8 | §3.1 `remove` row + §3.3 item 8 (`removeEdge` + `removeNode`, "**only** when the block is genuinely gone from the page"); `FS14` | `p:2` removed from the page entirely → exactly `removeEdge` + `removeNode` for `doc-x1:p:2`; the blocks still on the page and the head are **not** named | ✅ PASS — `removeEdge` + `removeNode` for `doc-x1:p:2` only |
| B9 | §3.1 adapter purity/determinism ("the same `(decoded, snapshot)` draw yields the same op list"); `P-TP-1` | the same page+store draw twice → deep-equal op lists | ✅ PASS — 3 ops, deep-equal on the second run |
| B10 | §3.2 non-diffed list ("a node outside the rendered document") + `FS14` — driven through the **in-contract** commit seam | a two-document store (the host's snapshot payload is the store's node/edge view) + a page for `doc-x1` → the commit payload names **only** the page's own node, and after applying it the other document's node is byte-for-byte unchanged in the store | ✅ PASS — 1 op; the foreign document untouched (see Observation (b)) |
| B11 | §3.4 step 4 ("Main validates the payload (`handleEditBatch` returns a domain result for a non-array `ops`)") | `handleEditBatch(store, {ops: 'nope' / 42 / null / {}})` → each returns a **domain result** (`{ok:false}`), never a throw, and the store is unchanged | ✅ PASS — 4 malformed payloads → `{ok:false}` |

## C. The commit — ONE `applyBatch`, journal, persist, rollback (§3.3/§3.5)

| id | Spec | setup → action → expected outcome (documented) | Result |
| --- | --- | --- | --- |
| C1 | §3.3 items 1/2 ("**One commit = one `store.applyBatch(ops)` call.** Not a loop, not `store.enqueue`, not per-node `putNode` calls"); `FS10` | a spy store around a real temp store + `handleEditBatch(store, {ops:[putNode edited]})` → **exactly one** `applyBatch` call (no `enqueue`), `{ok:true}`, and the committed content is in the store | ✅ PASS — store method calls: `["applyBatch"]` |
| C2 | §3.3 items 3/4 (one invertible `batch` journal entry; **COARSE** undo); `FS11` | a two-op batch (both blocks edited) → journal delta **1**, kind `batch`; one `undo()` restores the whole commit; `redo()` re-applies it | ✅ PASS — delta 1 (kind `batch`); one undo/redo restores/re-applies both blocks |
| C3 | §3.3 item 5 (`applyBatchSync` performs **exactly one** `persist()` on success) | instrumented fs (`writeFileSync`/`renameSync` counted) around one successful batch → the single atomic persist pair, and no second persistence path | ✅ PASS — `["writeFileSync","renameSync"]` |
| C4 | §3.3 item 6 (`BatchResult` is discriminated, checked, and `applyBatch` **never throws** for a domain failure); §3.5 item 1 (rolled back, journal not polluted, nothing persists); `FS12` | a batch containing a malformed `putNode` → `{ok:false, error, failedIndex}` (integer), **no throw**; nodes and edges deep-equal to the pre-batch state, journal delta 0, **zero** persist writes, store file still holds the prior content | ✅ PASS — `{"ok":false,"error":"rag applyBatch: id required/invalid at index 0","failedIndex":0}` |
| C5 | §3.3 item 7 ("the store **MUST** accept the rich-text ops inside a batch") — the unit's recorded RED obligation | `setType` / `setProps` / `setSubtree` each as a single-op batch → all `{ok:true}`; `setType` moves the type, `setProps` merges, `setSubtree` replaces the inline children | ✅ PASS — all three accepted and applied |
| C6 | §2.4 item 4 + `DECIDED: RICH-TEXT-EDIT-OPS` (`setType` preserves `id`/`createdAt`/`children`/`props`/`ownedNodeIds`; only `type` moves); `FS6` | a props+children-carrying node, then a `setType` batch → every preserved field deep-equals its pre-commit value, `type` is the new one | ✅ PASS — all five fields preserved; only `type` moved |
| C7 | §11.8 item 4 / §7 `P-TP-2` ("an empty op list ⇒ journal delta 0, persist delta 0") | `applyBatch([])` → `{ok:true}`, journal delta 0, persist delta 0 | ✅ PASS — `{ok:true}`, 0/0 |

## D. The per-tab page state, keyed by the ACTIVE TAB (`§3.5`/`§3.6`/`§11.8` item 3)

| id | Spec | setup → action → expected outcome (documented) | Result |
| --- | --- | --- | --- |
| D1 | §11.8 item 1 (`pageSurfaceInput` "marks the **PAGE** dirty (one dirty page per tab)") + §3.5 item 3 (states are per tab, exactly one at a time) | a host with two tabs, `tab-1` active → the page subject **is** the active tab id; `pageEditSurfaceInput()` → only `tab-1` becomes dirty | ✅ PASS — subject `tab-1`; the inactive tab stays clean |
| D2 | §3.5 item 5 (success: the store holds the committed values, the tab becomes `clean`, the warning clears) + §11.8 items 1/3 ("one `IPC_EDIT_BATCH` payload, never a per-node write"; a successful commit **deletes** the map entry) | `pageSurfaceInput()` then `pageSurfaceBlur(surface html)` with an accepting batch seam → **exactly one** batch payload (an array of ops), the dirty flag cleared, `pageEditSurfaceFailure(tab)` `undefined`, the failure map empty | ✅ PASS — 1 payload (1 op); dirty cleared; entry deleted |
| D3 | §3.5 items 1/2/3/5/7 (`store-rejected` carries the `BatchResult`'s `error`/`failedIndex` **verbatim**; the text/dirty are kept; states are per tab; **no automatic retry**); `FS16`/`FS18` | the batch seam returns `{ok:false, error:'engine said no', failedIndex:2}` → the tab's typed record is `{kind:'store-rejected', message, failedIndex:2}`, the dirty flag is **kept**, the per-tab state reads `{subject,dirty:true,failure}`, and the seam was called **exactly once** (never auto-reissued) | ✅ PASS — `{"kind":"store-rejected","message":"engine said no","failedIndex":2}` |
| D4 | §3.6 / `FS19` ("A commit that reports success without an acknowledged write is the worst outcome in this unit") | the host is given **no** batch seam at all → the commit returns a **typed** failure `{kind:'engine-unavailable', engineCause:<one of the four pinned members>}`, the tab stays dirty (never reported clean) | ✅ PASS — `engineCause:"unavailable-state"` |
| D5 | §3.5 item 3 ("States are **per tab**, **exactly one at a time**") | failure on `tab-1`, then activate `tab-2` and commit successfully → `tab-1` keeps its record **and** its dirty flag; `tab-2` is clean with no record | ✅ PASS — independent per-tab states |
| D5b | §3.5 item 3 (the tab is the page subject, not the document) | **two tabs on the SAME document** (`doc-x1`): both fail, then `tab-2` commits successfully → `tab-2` clears, `tab-1` keeps both its record and its dirty flag | ✅ PASS — same-document tabs are independent |
| D6 | §3.5 item 6 (host-side state, per tab) — "close drops only the closed tab's state" | records on `tab-1` and `tab-2`, then `prunePageState(['tab-1'])` (tab-2 closed) → `tab-2`'s record **and** its dirty flag are dropped; `tab-1`'s record and dirty flag survive | ✅ PASS — `prunePageState(["tab-1"])` drops tab-2 only |
| D7 | §3.5 item 6 / §11.8 item 3 ("the carrier is a **host-side `Map<tabId, failure>`** … **never the DOM** (no class, no attribute, no `innerHTML`)"); `FS17` | `globalThis.document` replaced by a recording proxy for the whole input+blur failure path → the record is retrievable from `pageCommitFailure` keyed by the tab id, and **zero** DOM calls/attribute writes occurred | ✅ PASS — record in `Map<tabId,failure>`; 0 DOM calls |

## E. The user-visible failure warning (§3.5 items 4/6, §11.8 item 3, §7 `P-SM-2`)

| id | Spec | setup → action → expected outcome (documented) | Result |
| --- | --- | --- | --- |
| E1 | §3.5 item 4 (the warning surfaces in the `TAB-1` warning class **plus** typed stage detail; the class is shared and the reason distinguishable) + §11.8 item 3 | `pageCommitWarningContent({kind:'store-rejected', message:'engine said no', failedIndex:2})` → an **authored provident node** (not a DOM write) with `props.id = page-commit-warning`, `data-warning-class:'commit-failed'`, `data-failure-kind:'store-rejected'`, and a message child carrying the typed kind + message; the same for `engine-unavailable` | ✅ PASS — id/class/kind + typed detail authored |
| E2 | §3.5 item 6 ("the dirty/`commit-failed` state lives in **host-side state keyed by tab id** … **never** in a rendered element"; "Any re-derive path must preserve it **by construction**") + §7 `P-SM-2`'s amended **discriminating witness** | construct `commit-failed` on `tab-1`, leave `tab-2` **uncommitted** (dirty, no failure) and the page subject `clean`-equivalent elsewhere; drive each re-derive path (`reDerive`, `onRagStoreChanged`, `applyContentChange`) → the **full failure record** deep-equals the constructed one after every path, `tab-2` stays uncommitted and record-free, and the **control** (a successful commit on `tab-1`) deletes the entry and clears the dirty flag | ✅ PASS — record + witnesses stable across the paths; success control clears (see the note on the two stub-wiring throws) |

## F. The representation mode (§2.3/§2.5, §11.8 item 2, §5 item 5)

| id | Spec | setup → action → expected outcome (documented) | Result |
| --- | --- | --- | --- |
| F1 | §2.5 / §11.8 item 2 (`RepresentationMode = 'html' \| 'markdown'`, coerced with an **`'html'` default**; "a patch **without** the field leaves the stored representation unchanged"; the removed `editingMode` field is gone) | fresh operator-settings store → `get()` → `representationMode:'html'` and **no** `editingMode` key; `set({representationMode:'markdown'})` then `set({topK:11})` → still `'markdown'`; `set({representationMode:'textarea'})` → coerced to `'html'` | ✅ PASS — default `'html'`; unrelated patch preserves; invalid coerces |
| F2 | §5 item 5 / `FS20` ("a stored `editingMode` from a previous session must be **ignored, not trusted**") | a persisted settings file containing `{editingMode:'textarea'}` → `get()` → `representationMode:'html'`, no `editingMode` key (the field was read, since `topK` from the same file loaded); a file with **both** keys → the successor `'markdown'` is honoured while the legacy key is dropped | ✅ PASS — legacy-only ⇒ `html`; legacy + successor ⇒ `markdown` |
| F3 | §2.3 switch row + §2.5 (the mode is a **representation** of one control, "not an editing control"; reusing the removed token is the drift `ST-6` closes) | `representationModeLabel('html'/'markdown')` → `HTML`/`Markdown`; `editorToolbarContent('html'/'markdown')` → `data-mode` `html`/`markdown`, the label follows the mode, a representation toggle is authored, and **no** `textarea`/`contenteditable` token appears anywhere in either toolbar payload | ✅ PASS — `data-mode` html/markdown; labels; toggle `data-target-mode:"markdown"`; no removed token |

## G. The §11.9 package adoption (the decomposer/diff is the PACKAGE)

| id | Spec | setup → action → expected outcome (documented) | Result |
| --- | --- | --- | --- |
| G1 | §3.1 verification table + §11.9 item 1 (installed **0.2.0**, ESM, `parse5`-only, 3 runtime exports + 5 types; the XOR rule; "does **not** throw for malformed HTML" but **does** throw for a malformed **input shape**; the two documented diff limitations "inherited and recorded, not worked around") | read `node_modules/provident-editable/package.json` + the three runtime exports → version `0.2.0`, `type:'module'`, deps `parse5` only; `htmlToTree('<p>hi<strong>b</strong></p>')` → wrapper root + `p` with `content:''` **and** two children (the per-node XOR rule), `providentPlainText === 'hib'`; malformed HTML returns a tree (no throw); `htmlToTree(42)` throws a typed `Error`; identical trees → empty diff; same-type+same-content reorder → not detected; distinct-node reorder → reported | ✅ PASS — all readings hold |
| G2 | §3.1 ("The adapter is the **only** module that imports the package; every other consumer … goes through it") + the §6.2 in-house-path rule | esbuild **metafile module-graph** analysis of both production entries (`src/renderer/renderer.ts`, `src/main/main.ts`) → the only `src/**` module importing `provident-editable` is `src/main/page-diff.ts`; the adapter imports the package and **not** `rich-decompose`; the commit seam (`src/renderer/sidebar-panes.ts`) imports the adapter | ✅ PASS — package importer set = `{src/main/page-diff.ts}` (method: build graph, no source text read) |
| G3 | §3.1 `text`-run semantics ("`text` … is **not** a `RagNodeType` member and must never be minted as a RAG node") | decode a page whose paragraph contains a package `text` run + an inline child → exactly one block, `elementType ∈ RagNodeType`, **no** `text`-typed block | ✅ PASS — 1 block, no text-run block |

## H. The authored surface seams (node-assertable part of §2.1, §11.8 item 1, §5 item 6)

| id | Spec | setup → action → expected outcome (documented) | Result |
| --- | --- | --- | --- |
| H1 | §2.1 authoring row + §11.8 item 1 (exactly **two** handler defs — `page-edit-surface-input` (event `input`) / `page-edit-surface-blur` (event `blur`) — **PINNED**, with their bodies routing to `pageSurfaceInput()` / `pageSurfaceBlur(html?)`) + §3.4 step 2 | read the authored constants → `props.id = 'page-edit-surface'`, marker `data-edit-surface`; exactly two name-referenced defs with those names/events; each body is **function-STRING data**; evaluate and invoke the bodies with a fake `window.provident.sidebar` + a fake surface element → the input def calls `pageSurfaceInput()`, the blur def calls `pageSurfaceBlur(<surface html>)` | ✅ PASS — input → `pageSurfaceInput()`; blur → `pageSurfaceBlur(surface html)` |
| H2 | §5 item 6 / §11.8 item 1 surviving-seam census ("the **surviving** content seams are exactly **two** handler defs and exactly **two** bridge methods … the **retired** set is exactly **six** per-node handler defs … and exactly **six** per-node bridge methods"; a registration of a retired name is a review finding); `FS21` | the authored page defs + both toolbar payloads → none of the six retired def names (`rag-textarea-input`, `rag-textarea-blur`, `rag-editor-input`, `rag-editor-blur`, `rag-editor-compositionstart`, `rag-editor-compositionend`) nor any of the six retired bridge names is present | ✅ PASS — 6 retired defs + 6 retired bridge names absent |

---

## FAILURES

**None.** 41/41 scenarios passed against the live modules. No spec clause was contradicted on any
reachable, in-contract surface; no expectation was softened to obtain a pass (three harness-fixture errors
found during authoring — a wrong block count in `A1`, a page that did not actually carry the edited tag in
`B3`, and a mis-shaped `doc-y1` edge fixture in `B10` — were corrected in the **fixture**, never in the
expectation; the observations below are the residue of that investigation and are reported, not hidden).

## Observations recorded (NOT fail-states, not counted in the totals)

1. **[hardening] Document scoping comes from the container edges' `documentIds`, not from the node id.**
   `buildPageOps` handed the **whole store's** node/edge snapshot for a two-document store correctly names
   only the page's own node (`false` for the foreign document) — so the in-contract path is clean
   (asserted in `B10`). But with a `doc-child` edge whose `documentIds` names the **page's** document while
   its target belongs to **another** document, the adapter emits
   `[{"op":"removeNode","id":"doc-y1:p:1"}]` — i.e. a whole-page commit would delete a foreign block
   (`§3.2`'s non-diffed list vs `§3.3` item 8's edge-scoped model; the `FS14` "transiently unmounted block"
   class). Recorded as a **hardening observation** for the adversarial pass / item-10d doc review, not as a
   FAIL: the store state is inconsistent, the spec pins no behaviour for an inconsistently-scoped edge, and
   the in-contract host path is clean.
2. **`src/main/rich-decompose.ts` is still in the renderer bundle graph** (imported by
   `src/renderer/sidebar-panes.ts`) while the **page** decode/diff goes through the adapter + package
   (`G2`). This is **not** a spec fail-state: §5 does not list the module for archival, §12 keeps it as the
   superseded rebuild input, and §3.1 pins only that the *page* decode/diff is the adapter + package.
   Recorded so the item-10d review can reconcile §4.1's supersession (in-house clause) against a module
   that still has a live importer.
3. **`E2`'s re-derive coverage.** Three re-derive paths were driven; `onRagStoreChanged` entered the host
   path, while `reDerive` and `applyContentChange` threw on **harness stub wiring** (the host's re-derive
   needs a full mount/registry/runtime assembly) *after* being entered. The asserted property — the
   per-tab record and the two witness tabs are unchanged by every path — held in all three cases; the
   *assembled* re-derive remains the live battery's clause (§8.3 item 3).

## NOT-TESTABLE (honest, with the reason — no faked passes)

| # | Spec clause that cannot be exercised in node | Reason (why it is `NOT-TESTABLE`, not a pass) |
| --- | --- | --- |
| N1 | §2.1 cardinality + `FS1` + `FS2`: **exactly ONE `contenteditable` root in the stage** per open document, the head/body sibling structure, the authored surface inside the **assembled app graph** (`assembleAppGraphEnvelope` result) with its `data-edit-surface`/`contenteditable` props | the surface is carried into the graph by the host's stage-authoring seam (`applyEditorToolbar`/`loadAppGraph`) over a fully assembled mount; `pageEditSurfaceRoot`'s input shape is not pinned in this spec and the assembly needs the renderer's registry/mount/ctx. Verified only at the seam level here (`H1`); the census belongs to the **live battery** (§8.3 items 1/2/5) and to the assembly/reconciliation tests (RCA-11/RCA-12) — NOT app-green from this run |
| N2 | §2.2 item 4: the **caret crosses the head↔body boundary** by arrow key without re-mounting | no layout and no real selection exist in node (the dom-shim is layout-less/CSS-less, RCA-12) — it is the spec's own MANDATORY live assertion, §8.3 item 2 |
| N3 | §2.3: markdown mode renders **plaintext + monospace with no HTML formatting** and the surface stays `contenteditable` | a **painted** property (`D-visual`, `DECIDED: D-GP-UFA-2` forbids a proxy PASS) — live battery §8.3 item 4 |
| N4 | §5.1/§8.3 item 6: the **rendered** zero-`<textarea>` census in the stage region, in both modes; and the traversal-envelope "no `type:'textarea'` child is authored" row | the rendered census needs the renderer (live §8.3 item 6). The **envelope-level** half could not be constructed blind: `buildTraversal` requires `{store, documentIds, zoneName}` plus a scoped-walk entry shape that this unit's spec does not pin, and every construction tried returned an **empty** `envelope.content` — a zero-census over an empty envelope would prove nothing, so it is recorded NOT-TESTABLE rather than claimed (the fence suite §6.5 is the authority for that row) |
| N5 | §3.5 item 4 + §8.3 item 3: the warning is **painted** and survives a re-derive in the assembled app (a visible symbol/stage warning with geometry) | the carrier and the authored node are asserted here (`D3`/`D4`/`D7`/`E1`/`E2`); the **painted** half is live-only (§8.3 item 3) |
| N6 | §3.1 last mapping row: **an unmappable package change kind** is refused into the `FS5`/`ST-5` warning class | no public way to inject a synthetic package change kind without reading `src/**`; the two constructible refusal arms are covered instead (`A2` malformed input, `A4` table capability gap), both returning the typed `decompose-failed` arm |
| N7 | §3.4 step 7/§3.5 item 8/§9.3: the **async engine write** hop (`EngineCrudRagStore`, `engine-unavailable` mid-session, the engine batch route OWED to `U-AUTHORITY-SWITCH`) | the engine hop needs the assembled app / an engine; the typed absence outcome is asserted at the seam (`D4`); the engine route itself is the spec's recorded OWED item (§3.4 step 8, §11 item 1) |
| N8 | §8.3 item 7 (`DECIDED: WHOLE-PAGE-EDITING`'s owed live row `U-EDIT-1-LIVE`): a real typed edit commits **1-1** to the store and reads back through `rag.get_document` **and** the rendered DOM | APP-level round trip; the node-level equivalents are `B10`/`C1` (payload → store). The live row is **UN-RUN** and OWED (§11.8 item 5, §11 item 8) |
| N9 | §8.3 item 4/§2.5: the **mode-change broadcast** path (`operator-settings-changed` with the store's result as the authoritative payload → fresh re-derive, never `refresh()`) | the host's broadcast handling needs the assembled renderer/bridge wiring; the persisted-field half is asserted (`F1`/`F2`) |

## What this artifact does **not** claim

- It is **not** app-green and it is **not** the unit's DONE evidence by itself: per §10 and §11.8 item 5
  the node trio is **ENVELOPE/STORE-green**, and `U-EDIT-1-LIVE` (§8.3) remains UN-RUN and OWED.
- It is **not** a substitute for the §7 property register (the 7 rows `P-IM-1..3`/`P-SM-1..2`/`P-TP-1..2`
  with seed `0xED170001`, `63 × 6 + 22 = 400` attempts, held/broken reporting) — that register is the
  unit's own suite plus its read-only PBT audit; this artifact exercises the same propositions only
  **pointwise** (e.g. `P-TP-2` in `B1`/`C7`, `P-IM-2` in `C2`, the minimal-op rule in `B2`, the
  `commit-failed` construction in `D3`/`D4`/`E2`).
- The harness lives in the gitignored `archive/blind-runs/` (provenance only). If the process requires a
  committed, re-runnable harness, it should be promoted into `tests/**` under the unit's own red/green
  cycle — this artifact deliberately did not add a file to `tests/`.
