# UNIT `U-EDIT-1` (`C9`) — WHOLE-PAGE EDITING: the single editable stage, the diff-commit, and the textarea removal — Spec

**Status:** **DRAFT — the contract for this unit; no code is delegated until this file exists.**
This is the **`C9 U-EDIT-1`** unit of the rebuild program: the carrier of the recorded requirement
`DECIDED: WHOLE-PAGE-EDITING` (the ACTIVE `REQUIREMENT, not yet implemented` row in
`docs/decisions.md`), implementing the design-extension ids **`ST-1`** (the non-live-markdown half),
**`ST-3`**, **`ST-4`**, **`ST-5`**, **`ST-6`**, plus the parts of **`ST-2`** the decision already
covers. The delegation gate (`AGENTS.md` item 9) is satisfied by this file **plus** a TestWriter red
set that has been RUN and REPORTED (RCA-1, §8.2). The program phase is
`docs/specs/design-extensions-review.md` **§13.1 P3** (the extension units); the per-unit gate
obligations are **§13.3**; the unit's own decomposition row is **§3.3 C item `C9`**; the read-model
re-scope is **§12.8**; the write-path reversal the unit must restate is **§12.7(a)**.

**Layer (RCA-12, mandatory declaration):** **STORE/MAIN-PROCESS (pure, node-assertable)** *for the
diff, the op builder and the batch/commit envelope*, **plus ASSEMBLED/RENDERER** *for the single
editable surface, the heading↔body caret movement, the markdown-mode rendering and the tab warning*,
**plus ENGINE-DEPENDENT** *for the async write hop*. **Nothing in this unit is APP-GREEN from a
node-suite green** (§10): the node suite sees the pure diff/commit model and the envelope authoring,
never the assembled contenteditable stage, never the painted DOM, never the engine hop.

**The pinned requirement this unit implements (verbatim, `docs/decisions.md`):**

> *"the ENTIRE document should be editable as a SINGLE editing block … a document must be editable
> as ONE surface — the present per-paragraph/table-cell `contenteditable` (and per-node textarea)
> hosts break normal editing (a selection cannot span paragraph boundaries; the doc title and table
> cells are not editable at all). Markdown mode must be the markdown DATA as plain text (not a
> form-control editor)."*

**§5.x PBT property register — 7 rows** (the register table is §7), classes `P-IM` ×3 / `P-SM` ×2 /
`P-TP` ×2, a pinned deterministic seed, a **≤100-attempts-per-row / ≤400-total** budget with
**stop-after-5** reporting, and per-row `held`/`broken` verdicts produced by a **read-only** PBT
audit that did not author the rows (RCA-3 / `AGENTS.md` item 10).

**Provenance / inputs.** The reviewed proposal and its verdict:
`docs/feature-requests/design-extensions-2026-09-21.md` (§1 the stage block verbatim; §2.4 the
`ST-*` itemization; §2.3 `PN-*` where they touch the stage; §2.5 `TAB-1`/`TAB-2`) and the gate
landing record `docs/specs/design-extensions-review.md` (**§3.3 C** the unit decomposition — item
`C9`; **§3.5 E** the `C9` verification row; **§3.6 F.2 item 4** the `decomposeRichHtml` naming
condition; **§11.5** the read-model ruling; **§12.4** the dirty states; **§12.5** the failure UX;
**§12.7(a)** the commit-path reversal; **§12.8** the re-scope; **§13.1 P3**/**§13.3** the program).
The standing test disposition: `docs/specs/test-pruning-disposition-2026-09-21.md` (§3.3.1 the
editing block; §9.4 the rebuild map — **17 files owned by `C9`**; §9.5 the coverage delta; §9.7 the
citation debt). The cache/commit envelope this spec must not contradict:
`docs/specs/unit-reads-pivot-tab-cache.md` (§3 the sync-read contract; §5 eviction; §6.3 the commit
sequence; §7 the register convention). Format conventions: `docs/specs/requirement-catalog.md` §5
(the FS register) and §3.4 rule 7 (the citation discipline), `docs/specs/unit-reads-pivot-tab-cache.md`
§7 (the typed §5.x register shape), `docs/specs/unit-n-batch-atomicity.md` §5 (the batch contract),
`docs/specs/unit-import-batch-persist.md` §2a/§2b (the one-`applyBatch`-one-persist precedent).

**Every citation in this file is `path` + symbol / row id / `§section`. No line number appears
anywhere in this file** — this spec obeys the citation rule it enforces (`docs/specs/requirement-catalog.md`
§3.4 rule 7).

**The requirement row ids this unit closes** (read as pointers, never as status —
`docs/requirement-catalog.md` §C.3): `PRUNE-300` (the one-editable-block requirement), `PRUNE-310`
(markdown mode = the markdown data as plain text, no form controls, no HTML affordances),
`PRUNE-311` (no `<textarea>` editors are materialized; no duplicate textarea ids), `PRUNE-314` (the
invertible project journal), `PRUNE-601` (find-in-page — **not** this unit; cited because its
`Ctrl+F` decision is `C11`'s, §9), `PRUNE-613`..`PRUNE-617` (`ST-2` element-type · `ST-3` heading ·
`ST-4` diff · `ST-5` warning · `ST-6` textarea removal). The defect rows this unit closes or moves:
`docs/defects.md` `WHOLE-PAGE-EDITING-REQUIREMENT`, `EDIT-MODE-TEXTAREA-UI`, `DOC-TITLE-NOT-EDITABLE`,
`TABLE-CELLS-NOT-EDITABLE`, `DOC-HEAD-CONTAINS-FIRST-PARAGRAPH`.

**What this unit does NOT do (stated once, binding throughout).**

1. **It does not implement live markdown formatting.** `ST-1`'s live-markdown-formatting half is
   **PARKED** (`docs/specs/design-extensions-review.md` §3.3 C item `C14`), and this spec's markdown
   mode is **plaintext inside the same rich surface, in monospace, with no HTML formatting** (§2.3).
2. **It does not write `TAB-1` / `TAB-2`.** `TAB-1`'s warning **symbol** and `TAB-2`'s merge
   **predicate** are `C10 U-TAB-MERGE`'s, which is **strictly after** this unit (§3.3 C item `C10`;
   §12.7(a)). This unit supplies the **`commit-failed` state and its user-visible warning** that
   `TAB-1` binds to; it pins **no** tab-strip affordance and **no** conflict predicate (§4.5).
3. **It changes no `RagStore` member signature.** The `BatchOp` union stays **closed at 7 members**
   (`DECIDED: BATCH-ATOMICITY-API`; `src/main/rag-store.ts` `type BatchOp`); `setDocMeta` and
   `setRichText` stay **outside** it (`DECIDED: DOC-DIRECTORY-CATEGORY-GATE` Q5,
   `DECIDED: EDIT-OP-CENSUS`). The edit-op census **stays 11** (`src/main/edit-ops.ts`).
4. **It does not re-open the O-9/O-10 gates, the frozen O-5 queue, the fence suites, or the oracle
   pair** (§9).
5. **It does not touch the operator corpus** — no re-import, no re-seed, no live derive
   (`O0_OPERATOR_DOCUMENTS = 226`, `scripts/live-drive.mjs`).
6. **It does not touch `docs/skills/designing-pages.md`** — that file **does not exist** in this tree
   (verified by glob over `docs/skills/**`: the only member is `docs/skills/process-guardrails.md`),
   so the skill update, its test-use-case coverage matrix and its demo-page index are **structurally
   impossible** in this pass. This is recorded as **OWED** (§11), exactly as
   `docs/specs/design-extensions-review.md` §15 recorded it, and it is **not** a silent skip.

---

## 1. What this unit asks

Turn the per-node editing model into **one page-local editing model**:

1. **one `contenteditable` element in the stage** (not one per RAG node), spanning the document from
   its **doc-head/title element** through the last body block, so a selection spans paragraph
   boundaries and table cells are editable (§2.1/§2.2);
2. **the doc-head visually divided from the body**, with the caret able to cross the boundary by
   arrow key, and the title committed to the doc-head node's `content` on blur (§2.2);
3. **an element-type pane** whose apply write is **`setType`-class** — never delete + recreate (§2.4);
4. **a diff-on-blur commit**: the page's content is decomposed with the **ADOPTED package
   `provident-editable@0.2.0`** (`htmlToTree` for the decode) and diffed against the store by the
   **adapter** `src/main/page-diff.ts` (`diffTrees` over the package tree, mapped onto the closed
   `{type, content, children, props}` field set and the `BatchOp` op set), and only the changed
   sub-elements are written (§3). **AMENDED 2026-09-21 (§11 amendment `11.9` item 1): the in-house
   `decomposeRichHtml` premise is superseded by this adoption — see §3.1, which names the package and
   pins the adapter contract.**
5. **the commit is ONE `applyBatch`** — one invertible `batch` project-journal entry, one persist
   (§3.3);
6. **an async engine write** with a **failure model that leaves the store unchanged and surfaces a
   user-visible warning** that survives a re-derive (§3.4/§3.5; the §12.7(a) reversal, restated);
7. **markdown mode = plaintext in the same surface, monospace, no HTML formatting** (§2.3);
8. **the removal of textarea editing everywhere** — no rendered `<textarea>` editor, no per-node
   editing handler defs, no `editingMode` control swap (§5/§6).

**Why the unit exists at all, in one line.** The one thing the current model cannot do is the thing
the requirement asks for: a selection across two RAG nodes is impossible **by construction** when
each node is its own editing root, and a diff-commit is impossible when there is no single surface to
diff — so the single surface is the precondition of the commit, and the commit is the precondition of
the atomicity contract (§3.3).

---

## 2. THE EDITING MODEL (pinned)

### 2.1 The single editable surface (`ST-1`)

**Pinned: the stage carries EXACTLY ONE `contenteditable` root per rendered document.**

| Aspect | Pin |
| --- | --- |
| **Cardinality** | `1` `contenteditable` element in the stage's document region per open document tab. **Zero** `[contenteditable]` hosts on individual RAG subtree roots. |
| **Authoring** | The surface is **provident-authored at the APP-GRAPH / STAGE-ASSEMBLY layer** — a provident node built by the pure app-graph builder **`src/renderer/pane-graph.ts` `assembleAppGraphEnvelope`** (the builder the renderer assembles the stage from: it is exported with `AppGraphAssemblyInput`/`AppGraphAssemblyResult` and hosts the `zone:<name>` containers), carried into the assembly by the host's stage-authoring seam **`src/renderer/sidebar-panes.ts` `applyEditorToolbar`** (`loadAppGraph`) — the same seam that already authors the stage's `editor-toolbar`/`pane-history` roots into the assembled app graph. It carries `props.id = 'page-edit-surface'`, `props['data-edit-surface'] = <documentId>`, `props.contenteditable = true` and its **name-referenced handler defs** (**PINNED — §11 amendment `11.8`:** the handler defs `page-edit-surface-input` (event `input`) and `page-edit-surface-blur` (event `blur`), whose bodies route to the host's own page seam methods **`pageSurfaceInput()` / `pageSurfaceBlur(html?)`** on the `SidebarApi` surface; the retired per-node seam names are enumerated in §5 item 6, and §11 amendment `11.8` item 1 states the same set), and is placed in the traversal's `zoneName` (`'main'`) as a provident content root. **It is NOT a node of the traversal envelope** — the traversal envelope keeps its one-payload-per-section shape (§11 amendment **11.7**; `DECIDED: PLACEMENT-ONLY-PAYLOAD-ROOT`). No hand-written DOM, no `document.createElement`, no direct `innerHTML` write by host code. |
| **Subtree** | The surface's subtree **is the assembled document body as the stage renders it**: the doc-head/title element first, then the body blocks the stage renders (sections, their blocks, table cells and the rich blocks' inline children), in document order. Stated explicitly: the traversal still authors **six** payload roots for this document and their inner shape is unchanged — the app-graph assembly is what collects them under the one surface root, so `content[0].content[0]` in the **traversal** envelope remains the `rag-head` `h1`. |
| **Invariant** | Exactly **ONE** such surface exists per **focused** document/tab. On a simultaneous multi-document mount (U-SHELL-9b) only the focused document's assembled body is surfaced; every other mounted document root stays a plain payload root. |
| **Scope** | The surface's subtree **is** the document's rendered body: the doc-head/title element first, then the section headings and their blocks (including table cells), in document order. A body element outside the surface is `FS1`. **In app-graph/stage terms:** a document-body block that the assembled app-graph envelope does not place inside the surface root (or that the render materializes as a sibling of it in the stage's zone) is `FS1`. **No envelope-payload assertion may be used to detect it:** the detection surface is the **app-graph render** (the assembled envelope the renderer loads, `assembleAppGraphEnvelope`'s result) **plus the DOM**; the traversal envelope deliberately authors no payload per block, so a traversal-level census cannot see this fail-state in either direction (`FS1`'s restatement, §2.1/§8.1). |
| **Stable authored id** | The surface root carries a stable authored `props.id` and a stable `data-*` marker (pinned here: `props.id = 'page-edit-surface'`, `props['data-edit-surface'] = <documentId>`), so the DOM census and the MCP `get_rendered_html` surface can name it without ambiguity. |
| **Per-node hosts are GONE** | The per-root splice (`props.contenteditable = true` on a rich-eligible root) and its per-root handler attach are **removed** (§5 item 1). |
| **The caret is page-scoped** | `src/renderer/edit-controller.ts` `type CaretState` is re-scoped to the page: the `kind: 'rich'` arm addresses the surface root with a path-based anchor/focus edge (`RichCaretEdge`), and there is **no** `kind: 'textarea'` arm. A caret addressed to a per-node root is `FS2`. |

**`ST-2`'s covered half (the element-type apply target).** The element-type pane's target is **the
element containing the caret or the selected text** — for the whole-page surface that is the **RAG
block the caret/selection resolves to** (§2.4). The pane's own UI is `C8 U-STAGE-TYPE`'s
(`docs/specs/design-extensions-review.md` §3.3 C item `C8`); this unit pins only the **apply
contract** and the **write primitive**, so that `C8` and `C9` cannot disagree about what the pane
writes.

### 2.2 The doc-head/title element (`ST-3`)

**Pinned:**

1. **Visually divided — defined, because the term is otherwise undefined**
   (`docs/specs/design-extensions-review.md` §3.6 F.2 item 5 names `ST-3`'s "visually divided" as a
   term a spec must pin). The doc-head element and the body's first block are **distinct sibling
   elements of the surface root, with distinct authored ids**, and the head carries a
   **separator treatment owned by CSS** (a bottom border/rule or an equivalent painted divider on the
   head element), never a spacer element and never a JS-authored margin. **The node separation is
   the load-bearing half** (it is what makes the caret able to cross); the painted rule is the
   `D-visual` half asserted live (§8.3).
2. **The doc-head's content IS the document title.** The title is the doc-head RAG node's `content`
   (`src/main/traversal.ts` `buildSubtree` keeps the subtree root's text; the traversal derives
   `props['data-doc-head']` from `store.docHeadForDocument(documentId) === ragId`). A title edit is
   therefore a **`content` write on the doc-head node** (§3.2), committed **on blur** of the surface
   whose caret is inside the head element.
3. **The `data-doc-head` marker is PRESERVED.** Because the marker is **derived by the traversal**
   from `docHeadForDocument`, the commit must never carry a wholesale props object that would drop
   it: any props write uses the **merge** semantics of `setProps` (`decided: RICH-TEXT-EDIT-OPS` —
   "`setProps` MERGES … the existing props including the `data-doc-head` marker are preserved — the
   `setProps` edit op the user chose, Option A"), which exists for exactly this reason. A commit that
   strips `data-doc-head` is `FS3`.
4. **The caret crosses the boundary by arrow key (a LIVE-only property).** `ArrowDown` from the last
   caret position of the head element lands on the first position of the body's first block;
   `ArrowUp` from the first position of that block returns to the head. **Pinned: this movement
   never re-mounts, never tears down and never re-renders the surface** — the head and the body are
   siblings inside one editable root, so the movement is the browser's native caret movement within
   one editing host, which is precisely what `ST-1`'s single surface buys. The assertion is
   **structurally unassertable in node** (no layout, no selection: RCA-12) and is therefore a
   **MANDATORY live assertion** (§8.3 item 2).
5. **The head is not re-parented into a section.** `docs/defects.md` `DOC-HEAD-CONTAINS-FIRST-PARAGRAPH`
   records today's invalid nesting (a section's `doc-child` block rendered *inside* the heading
   element). The surface pins the head as a **sibling** of the body blocks, so the defect's own owed
   live row ("for a doc starting `# Title` + paragraph, the first paragraph is a SIBLING of the
   `h1`") is carried by this unit's live battery (§8.3 item 5).

### 2.3 Markdown mode (`ST-1` non-live half / `ST-6` / `PRUNE-310`)

**Pinned — markdown mode is a MODE of the same surface, never a second control:**

| Aspect | Pin |
| --- | --- |
| **The surface is the same element** | Markdown mode does **not** replace the surface, does **not** drop `contenteditable`, and does **not** create a second editing host. It is the same single `contenteditable` root with its **representation** switched. |
| **The content is plaintext** | The surface's subtree is the document's **markdown data as plain text**: one text run (plus the block boundaries the caret needs), **no HTML formatting output at all** — no inline `strong`/`em`/`a`/`img` elements, no headings rendered at heading scale, no table markup. The rendered text of a markdown-mode body matches the markdown source's text content. |
| **Monospace** | The mode is rendered in a **monospace font family**, owned by CSS, asserted as a **painted** computed family live (§8.3 item 4) — never computed-style-only without a painted box (`DECIDED: D-GP-UFA-2`). |
| **Live markdown formatting is LATER** | No token highlighting, no live re-formatting, no preview pane, no markdown-to-HTML round trip in the surface. This is the **parked** half (`§3.3 C` item `C14`) and it must not be scheduled by implementation drift. |
| **The switch is a mode, not an editing control** | The toolbar's mode control reflects `html` \| `markdown` and flips the mode. The **removed** `editingMode: 'textarea' \| 'contenteditable'` field and its `settingsContent` button-toggle (§5 item 3) are **not** the carrier; the successor representation control is pinned in §2.5, where its field name is pinned as **`representationMode: 'html' | 'markdown'`** (§11 amendment `11.8`). |
| **No form controls** | No `<textarea>`, no `<input>`, no form-control affordance anywhere in the stage region — in either mode. |

### 2.4 The element-type apply contract (`ST-2` covered half)

**Pinned:**

1. **The closed type set is `RagNodeType`** as it stands — **23 members**
   (`src/main/rag-store.ts` `type RagNodeType`: `h1`..`h6`, `p`, `ul`, `ol`, `li`, `blockquote`,
   `pre`, `code`, `strong`, `em`, `a`, `img`, `div`, `table`, `thead`, `tr`, `td`, `th`). A pane
   offering a type outside this union is `FS4`. The census **23** is a reading of that union and must
   be recounted from it, never copied (`docs/specs/design-extensions-review.md` §14.3's census rule).
2. **Every offered type is applicable to the caret's element.** The old per-node eligibility gate
   `src/renderer/rich-eligibility.ts` `isRichEditableRoot` (true iff `type ∈ EDITABLE_TYPES` (9
   members) **and** `!ownsDocChildren`) is **not** the apply gate any more: it gated *which roots may
   host an editor*, and there is only one editor. The apply gate is instead the **RAG-block
   resolution** of the caret/selection (item 3), so a `td`/`th`/`li`/`pre`/table element is
   applicable — which is what closes `docs/defects.md` `TABLE-CELLS-NOT-EDITABLE` and
   `DOC-TITLE-NOT-EDITABLE`.
3. **Target resolution (pinned, TOTAL):** the caret's DOM position is resolved to the **nearest
   enclosing surface-level block element that carries a RAG id** (`data-rag-node-id`). A
   **non-empty selection** resolves to the **set** of surface-level blocks it intersects. If the
   caret is in a text run that belongs to the head element, the target is the doc-head node. If no
   block resolves (a caret in the surface's own inter-block whitespace), the apply is a **no-op
   returning `{ ok: true, applied: [] }`** — never a write to an arbitrary node (`FS5`).
4. **The write primitive is `setType`-class and NEVER delete + recreate.**
   `src/main/edit-ops.ts` `setType(ctx, { nodeId, type })` changes **only** `type` — "id/content/
   children/props/ownedNodeIds preserved; only `type` changes" (`DECIDED: RICH-TEXT-EDIT-OPS`). The
   apply therefore **must** be expressed as a batch op `{ op: 'setType', nodeId, type }`. An
   implementation that removes and re-adds the node (destroying its id, its `createdAt`, its edges
   or its inline children) is `FS6`.
5. **A multi-block apply is ONE `applyBatch`** with one `setType` op per resolved block — the same
   atomicity rule as the commit (§3.3), so a partially applied multi-block type change is impossible.
6. **The resulting type is reflected by a re-derive, not by DOM surgery.** The apply routes
   `rag-store-changed` → re-traversal (§4.4); the host never mutates the rendered element's tag.

### 2.5 What replaces the removed mode control (pinned)

The `editingMode` `OperatorSettings` field, its `settingsContent` button-toggle and its
`operator-settings-changed` broadcast path are **removed** (§5 item 3). **Pinned successor:** the
representation mode is carried by the **`OperatorSettings` carrier** (the existing persisted operator
state, `DECIDED: UI-CONFIG-CARRIER`) as the **new field `representationMode`** with the two-member union **`'html' | 'markdown'`**
(**PINNED — §11 amendment `11.8`:** `RepresentationMode = 'html' | 'markdown'`,
`representationMode?: RepresentationMode` on both `OperatorSettings` and `OperatorSettingsPatch`,
coerced by `src/main/operator-settings-store.ts` `coerceRepresentationMode` with an `'html'` default,
and a patch without the field leaves the stored representation unchanged), **not** by reusing the
removed token. Rationale recorded so a later pass
does not re-derive it: the removed union's members named **editing controls** (`textarea` vs
`contenteditable`); the successor names **representations** of one control. Reusing the old name
would keep a live token whose meaning the supersession voids — the exact drift class `ST-6` exists to
close. The **surviving clause** of `EDITING-MODE-SETTING` that MUST be kept is its **mode-change
broadcast contract**: a mode change writes the operator store → main broadcasts
`operator-settings-changed` with **the store's result as the authoritative payload** → the host uses
the **payload** directly (never a re-fetch) → a **fresh re-derive** (`requestRebuild` → `reDerive`,
never `refresh()` over a cached spliced envelope) (§4.2).

---

## 3. THE COMMIT CONTRACT (`ST-4` / `ST-5`)

### 3.1 The decomposer — `provident-editable@0.2.0`, ADOPTED and VERIFIED (the adapter)

**Pinned: the decode is the package's `htmlToTree`, the diff is the package's `diffTrees`, and the
mapping onto C9's op set is the ADAPTER `src/main/page-diff.ts`.** **AMENDED 2026-09-21 (§11 amendment
`11.9` item 1): `provident-editable@0.2.0` is ADOPTED as the production decomposer and SUPERSEDES the
in-house-build premise of this section as drafted** (`DECIDED: RICH-TEXT-EDITING-GATE`'s in-house
clause is thereby superseded — §4.1's new row). This spec is now the **carrier of the mapping
contract**: the package supplies the tree and the structural diff; **it supplies no RAG op set, no
`BatchOp`, no `applyBatch` and no journal semantics** — those remain this unit's, unchanged.

**The verification, stated as a verification (read from the installed package, never assumed; no
invented API).**

| What | Verified reading (the file read) |
| --- | --- |
| Installed version | `node_modules/provident-editable/package.json` — `"version": "0.2.0"`, `"type": "module"`, `"main"/"types"` → `./dist/index.js` / `./dist/index.d.ts`, `"sideEffects": false`, `engines.node >= 16` |
| Declared deps | `dependencies`: **`parse5 ^7.1.2` only**. `peerDependencies`: **`provident-ssr >= 0.4.0 <1.0.0`** (`optional: true`) — satisfied by the installed **`provident-ssr` 0.5.1** (`node_modules/provident-ssr/package.json`) |
| No DOM | the package declares **no** DOM/browser dependency and **no** `jsdom`; its parser is `parse5` (`dist/parse.d.ts` `parseHtml`), so the decode is **node-safe** (`htmlToTree`'s own doc: "Pure, deterministic, no DOM, no network") |
| Exports (6 names) | `dist/index.d.ts`: **`htmlToTree`**, **`diffTrees`**, **`providentPlainText`** + the **5 types** `ProvidentNode`, `ProvidentTree`, `StructuralDiff`, `ProvidentNodeType`, `ConvertOptions`. `dist/index.js` exports exactly those **three** runtime bindings |
| Signatures | `htmlToTree(html: string, opts?: ConvertOptions): ProvidentTree` (`ConvertOptions.idPrefix?: string`, default `'n'`); `diffTrees(prev: ProvidentTree, next: ProvidentTree): StructuralDiff`; `providentPlainText(node: ProvidentNode): string` |
| **Its OWN shape** | `ProvidentTree = { root: ProvidentNode }`; `ProvidentNode = { id; type: ProvidentNodeType; content; props?; children? }` with the **PER-NODE XOR rule** (a node with `children` carries `content: ''`); `ProvidentNodeType` is a **19-member** union (`h1`..`h6`, `p`, `ul`, `ol`, `li`, `blockquote`, `pre`, `code`, `strong`, `em`, `a`, `img`, `div`, **`text`**). `StructuralDiff` = `{ nodeChanges: { add: ProvidentNode[]; remove: ProvidentNode[]; update: NodeUpdate[] }, edgeChanges: { add: EdgeChange[]; remove: EdgeChange[] } }`, with `NodeUpdate = { prevId; nextId; type?; content?; props? }` and `EdgeChange = { parentId; childId }` |
| **NOT C9's shape** | the package's tree/diff is **not** `{ content, children }` + `RagNodeType` and **not** the `BatchOp` set: `NodeUpdate.props` carries the **FULL new props object** (never a delta), `add`/`remove` carry **whole subtrees** (subtree-granular), and the package populates **no `ownedNodeIds`**, **no `RagNodeChild`**, **no `documentPath`/`tags`** — those are the consumer's |
| **`text` runs** | `text` is the package's own content-only leaf type (no children, no props) used for the runs **between** inline children; it is **not** a `RagNodeType` member and must never be minted as a RAG node |
| Totality (read from the dist, not assumed) | `htmlToTree`/`diffTrees` are pure and **do not throw for malformed HTML** (their own docs: "The conversion returns a tree, never throws"; the comparison "NEVER throws"), **but both DO throw a typed `Error` for a non-object / malformed INPUT SHAPE** (`htmlToTree: html must be a string`, `opts must be an object`, `opts.idPrefix must be a string`; `diffTrees: prev/next must be a ProvidentTree`, plus a malformed node field at any depth) → the adapter's guard, below |

**SUPERSEDED (2026-09-22 — §11 amendment `11.10` item 1): this table's reading of what the decode
CARRIES is superseded in one respect — the package's converter is ATTRIBUTE-BLIND, so the decoded tree
cannot carry `data-rag-node-id`/`data-rag-props` and cannot carry the RAG identity the clauses below
assume.** The table's own shape/version/export/throw readings are **not** affected.

**The adapter contract (`src/main/page-diff.ts`) — PINNED.** The adapter is the **only** module that
imports the package; every other consumer (the commit seam, the tests) goes through it. Its pinned
surface, two entry points:

1. **`decodePage(html: string): PageDecodeResult`** — `html` is the surface's HTML; the decode is
   `htmlToTree(html)` followed by the C9 **field-set projection** below. Returns the discriminated
   `{ ok: true; blocks: PageBlock[]; documentId: string } | { ok: false; kind: 'decompose-failed'; message: string }`.
   `PageBlock = { ragId; elementType; content; children; text; props }` — `ragId` from the block
   element's `data-rag-node-id`, `elementType` = the block's tag **intersected with `RagNodeType`**,
   `content`/`children` from the projection, `props` = the block's **RAG-owned** props only, `text` =
   `providentPlainText` of the block's package node (used for the `FS14` "did the user empty it?"
   read and for the live battery's text compare — **never** for a compared field, `FS8`).
   **SUPERSEDED (2026-09-22 — §11 amendment `11.10` item 1): this item's "`htmlToTree(html)` … the
   decode is" sentence and its `PageBlock` projection clause are RESTATED — the page's RAG identity
   (`ragId`) and RAG-owned props are read from the RAW PAGE SOURCE, never from the decoded tree (the
   package drops every attribute except an `img`'s `src`/`alt` and an `a`'s `href`), and the decode is
   PER SURFACE-LEVEL BLOCK ELEMENT (the package decodes each block's own fragment), not one call over
   the whole surface HTML. The returned shape, the refusal arm, and the `text` field's role are
   unchanged.**
2. **`buildPageOps(decoded: PageDecodeResult, snapshot: PageDiffSnapshot, documentId: string): PageOpsResult`** —
   `PageDiffSnapshot` is the document's **read-only node/edge view** taken from the store's own
   snapshot seam (`DECIDED: RAG-SNAPSHOT-PRESERVED`; the adapter adds **no** `RagStore` member and no
   store method); the adapter builds the **package-side** `next` tree from the decoded page and the
   `prev` tree from that snapshot, calls **`diffTrees(prev, next)`**, and maps the result onto the
   closed `BatchOp` op set. Returns `{ ok: true; ops: BatchOp[] } | { ok: false; kind: 'decompose-failed'; message: string }`. **Pure**: no I/O, no clock (the commit's single timestamp is passed in by the caller), and deterministic — the same `(decoded, snapshot)` draw yields the same op list (`P-TP-1`).

**The change-kind → op mapping (CLOSED; an unmapped kind is a fail-state, never a silent drop):**

| Package change | Adapter mapping (the op) |
| --- | --- |
| `nodeChanges.update[i].type` | `{ op: 'setType', nodeId: prevId, type }` — **one** op; id/`createdAt`/`children`/`props`/`ownedNodeIds` untouched (`FS6`) |
| `nodeChanges.update[i].content` | `{ op: 'putNode', node }` carrying the **projected `content`** (the store's node with `content` replaced) |
| `nodeChanges.update[i].props` | `{ op: 'setProps', nodeId: prevId, props: <the RAG-owned DELTA only> }` — the package's FULL object is diffed against the store node's props by the adapter, and only the changed RAG-owned keys are sent, because `setProps` **MERGES** (§3.2's `props` row; `data-doc-head` therefore survives, `FS3`) |
| a run/children difference inside a block (`text` runs + inline children reorder) | `{ op: 'setSubtree', nodeId: prevId, children }` **or** the same node's single `putNode` carrying `content` **and** `children` — **exactly ONE** op for that node (the minimal-op rule, §3.2) |
| `nodeChanges.add[j]` (no structural match) | a **new block**: **id-minted `putNode`** + the **`doc-child` `putEdge`**, per §3.3 item 8 (subtree-granular in the package, flattened to the **surface-level** blocks the user actually created; a package `add` for a wrapper the mode needs is **not** minted) |
| `nodeChanges.remove[j]` | `{ op: 'removeEdge', id }` for its now-absent containment edge + `{ op: 'removeNode', id }`, **only** when the block is genuinely gone from the page (`FS14`: a transiently unmounted block is **not** a deletion) |
| `edgeChanges.add` / `edgeChanges.remove` | the containment edge write/removal **only** — a package edge between two non-RAG nodes is adapter-internal and maps to **no** op (an edge op for a non-RAG node id is `FS9`'s churn class) |
| **any other / unrecognized kind, or a package throw** | **REFUSED**, not dropped: the adapter returns `{ ok: false; kind: 'decompose-failed' }` → the **`FS5`/`ST-5` warning class** as the ruling names it — the §3.5 typed `CommitFailure` `kind: 'decompose-failed'`, carried by the `ST-5` warning obligation (this is the class, **not** the type-pane `FS5` fail-state) — with the store untouched (`FS7`). **A silent partial write is the fail-state this row exists to forbid.** |

**New blocks** — a typed paragraph with **no** node (the ruling's case) is exactly a package
`nodeChanges.add` whose element carries **no** `data-rag-node-id`: the adapter mints the id, emits
`putNode` + the `doc-child` `putEdge` from the containing section, and never invents an update against
a node that does not exist (§3.3 item 8's id scheme and edge shape are **unchanged** by this
amendment).

**The table consequence on the page path (ADDED 2026-09-22 — §11 amendment `11.10` item 3).** The
package's `BLOCK_TAGS` carries **no `table`/`thead`/`tr`/`td`/`th`** and its converter **flattens a
table silently** (the table, its rows and its cells are not block elements to the converter — their
text is folded into a paragraph/run), so a stored table node's structure is **inexpressible** on the
page path. **Consequence for the op mapping:** a `table`/`thead`/`tr` block **is REFUSED** (the
`decompose-failed` class of this section's last mapping row) and **cannot round-trip** — no op may
retype, remove or flatten a stored table structure on the strength of a decode that cannot see it
(`FS14`'s data-loss class). The adapter's own tag sets state this split (the container tags
`table`/`thead`/`tr` refuse; `td`/`th` are decoded as standalone cell LEAVES, so a cell's text can be
read but its row/table containment is never reconstructed). **Cross-referenced:** the capability gap is
the ESCALATED handoff row **`PROVIDENT-EDITABLE-NO-TABLE-ELEMENTS`** (`docs/defects.md` — an
UPSTREAM/dependency gap, **never patched here**, `AGENTS.md` item 7), which §11 item **9** records; the
verification anchors are §11 amendment `11.10` item 3.

**Props differences** — **the adversarial pass's finding, closed here:** the last population could not
express a `props` difference at all, so the mapping row had no oracle. The adapter's `props` mapping is
now the **only** writer of `setProps` on the commit path, and it is exercised by a **prop-difference
draw** in `P-IM-1` (§7) whose population includes a RAG-owned prop change **and** a runtime-prop change
(which must produce **no** op — the discriminating control).

**Structural changes (split / merge) — how they are detected.** The package reports a split as an
**`update`** on the original node (its `content` shortens) plus an **`add`** of the new sibling, and a
merge as an **`update`** on the surviving node (its `content` grows) plus a **`remove`** of the absorbed
node; there is no dedicated split/merge kind, and the adapter **must not synthesize one** (a bespoke
kind is `FS8`'s "field outside the closed set" class). Two documented package limitations are
**inherited and recorded, not worked around**: (i) a **pure reorder of two same-type + same-content
siblings is NOT detected** (the diff is empty — a documented limitation of the package's tier-(a)
matching), and (ii) a **re-parent/reorder of distinct nodes is reported as `remove` + `add`**, which the
adapter must read as such rather than as a delete+create of the same node (`FS14`'s guard). Both are
pinned here so an implementer does not "fix" the package from this repo (`AGENTS.md` item 7: the package
is **never** patched; a capability gap is a `docs/defects.md` + `docs/HANDOFF.md` item).

**Deliberately NOT diffed (unchanged in substance; restated against the package shape).** The
renderer-minted **runtime props** — `contenteditable`, `data-edit-surface`, `data-node-id`, and the
head's **`data-doc-head` as a written prop** — plus `style`, class lists, the surface root's own
authored props, anything about the representation mode, a node outside the rendered document, and a node
whose only difference is `updatedAt`. Because the package's `update.props` carries a **FULL** object,
this exclusion is **the adapter's own filter**, not the package's: a difference that survives the filter
is `FS8`.

**`text`-run semantics (pinned).** The package's `text` leaves carry the runs **between** inline
children and the text of a leaf block. The projection **flattens them into the owning block's `content`**
(C9's own field), in document order, so a `text` run never becomes a node, never becomes a
`RagNodeChild`, and never becomes an op id. For a block **with** inline children the package's node
content is `''` (the XOR rule) while C9's `content` is the run text around the children — the adapter
must project the run text (via `providentPlainText`, then the C9 inline split) so an unchanged block
compares **equal** and yields **no** op; a projection that reads the raw package `content` would emit a
spurious op on every block that has inline children (`FS9`).

**The stale comment, repointed.** `src/main/paste-sanitize.ts`'s comment above `sanitizePastedHtml`'s
return ("ready to feed to the `provident-editable@0.1.0` converter") is repointed in this unit's landing
pass to the **adopted entry point** `provident-editable@0.2.0` `htmlToTree` / the adapter
(`AGENTS.md` item 6c). The catalog row `PRUNE-615`'s `statement` cell is still **cited, never edited
here** — but it now names a package that **exists**, so the row's amendment is a **correction of
version**, not a phantom removal (recorded as owed, §11 amendment `11.9` item 4).

**The toolchain this adoption required (recorded, `11.9` item 3).** `package.json` now pins
**`provident-editable: ^0.2.0`**, **`@types/node: ^24`**, **`vite: ^8.3.0`** (vitest 5's peer, previously
missing from the lock) and **`provident-ssr: ^0.5.1`**; **`--legacy-peer-deps` is retired** — the
dependency graph installs without it. The build/trio obligations (§8.2 item 4) are unchanged.

### 3.2 The diff granularity (`ST-4`)

**Pinned: the diff is per RAG block, over a CLOSED field set, with a defined minimal-op rule.**

**Decoding the surface (step 1).** The surface's subtree is decoded by the adapter's `decodePage`
(§3.1) — `provident-editable@0.2.0`'s `htmlToTree` plus the C9 projection — into an ordered list of
`PageBlock` records: `{ ragId, elementType, content, children, text, props }`, where `ragId` comes from
the block element's `data-rag-node-id`, `elementType` from the element's tag (intersected with
`RagNodeType`), `props` from the block's RAG-owned props, `text` from `providentPlainText`, and
`(content, children)` from the projection (§3.1's `text`-run semantics — the package's own `content` is
**not** used raw, because a block with inline children carries `content: ''` in the package's shape).
**A block whose `data-rag-node-id` matches no RAG node in the document is a **new block** (step 4
below). A block-level element with **no** `data-rag-node-id` — including a `textarea` element, now
that no textarea child is authored (§5.1) — is a **surface artifact** (a wrapper the mode's rendering
needs) and contributes to its **parent block's** `content` — it is never minted as a RAG node. **A
block-level element the package's own tag set cannot express (`table`, `thead`, `tr`, `td`, `th` —
none of which is a `ProvidentNodeType` member; the package's block set is
`h1`..`h6`/`p`/`ul`/`ol`/`li`/`blockquote`/`pre`/`div`) is a RECORDED capability gap**: the adapter must
**refuse** (the `decompose-failed` warning class, §3.1's mapping table's last row) rather than retype,
remove or flatten a stored `td`/`th`/`tr`/`table` node on the strength of a decode that cannot see it
(`FS14`'s data-loss class). **AMENDED IN PLACE (2026-09-22 — §11 amendment `11.10` items 1 and 3): the
three sentences above are SUPERSEDED where they read block identity off the tree — the adapter reads
`data-rag-node-id`/`data-rag-props` from the RAW page source and decodes each block's own fragment
(the package is attribute-blind), so "a block-level element with no `data-rag-node-id`" is decided by
the SOURCE scan, not by the decode; and this paragraph's table clause now names the exact split — the
package's `BLOCK_TAGS` carries no table tag at all (it flattens a table), the adapter's container set
refuses `table`/`thead`/`tr`, and a stored table structure therefore cannot round-trip (§3.1's table
consequence note; the escalated defect row `PROVIDENT-EDITABLE-NO-TABLE-ELEMENTS`). The paragraph's
rule — REFUSE, never retype/remove/flatten — is NOT weakened.**

**The compared fields — the CLOSED set (`FS8` if the set is widened silently):**

| Field | Source on the page | Store counterpart | What a difference writes |
| --- | --- | --- | --- |
| `type` | the block element's tag, via the adapter's `PageBlock.elementType` (intersected with `RagNodeType`) | `RagNode.type` | `{ op: 'setType', nodeId, type }` |
| `content` | the adapter's `PageBlock.content` (the C9 projection of the package tree, §3.1) | `RagNode.content` | `{ op: 'putNode', node }` with the new `content` |
| `children` | the adapter's `PageBlock.children` (the inline set the projection derives) | `RagNode.children` (optional) | `{ op: 'putNode', node }` with the new `children` (the op-level equivalent of `setSubtree`'s replace semantics) |
| `props` | only the block's **RAG-owned** props (the adapter's `PageBlock.props`) — **never** the package's FULL `update.props` and **never** DOM/runtime props | `RagNode.props` | `{ op: 'setProps', nodeId, props }` — the adapter sends only the **changed RAG-owned keys**, so the store's **MERGE** preserves `data-doc-head` and every unnamed key |
| `documentPath` / `tags` | **not compared** | `RagNode.documentPath`/`tags` | nothing — a document-metadata edit is `edit.set_doc_meta`'s (`DECIDED: DOC-DIRECTORY-CATEGORY-GATE` Q5), OUTSIDE the closed `BatchOp` union and outside this unit |

**Explicitly NOT diffed** (each is a review finding if it appears in the op list) — **and, because the
package's `update.props` carries the FULL new props object, this exclusion is the ADAPTER's own filter
(§3.1), never the package's**: runtime props minted by the renderer (`contenteditable`,
`data-edit-surface`, `data-node-id`, and the head's `data-doc-head` **as a written prop**), `style`,
class lists, anything about the `editingMode`/representation mode; the surface root's own authored
props; a node outside the rendered document; a node whose only difference is `updatedAt`; and the
package's own bookkeeping ids (a `ProvidentNode.id` is a **reconciliation key**, never a RAG id — an op
naming a package id is `FS9`).

**The minimal-op rule (pinned, and the subject of a register row).** For every block whose compared
fields differ, the op list carries **exactly one** write for that node (the single op that expresses
the difference), and **no block whose compared fields are all equal appears at all**. The op list is
therefore a function of the **diff**, not of the number of rendered blocks: a one-character edit in
one paragraph of a 200-block document yields an op list that names **one** node id (`FS9` if an
unrelated node id appears).

### 3.3 The commit is ONE `applyBatch` (atomicity, journal, persist)

**Pinned, and this is the load-bearing clause of the unit:**

1. **One commit = one `store.applyBatch(ops)` call.** Not a loop, not `store.enqueue`, not per-node
   `putNode` calls. The precedent is `docs/specs/unit-import-batch-persist.md` §2a ("ONE
   `await store.applyBatch(ops)`", result checked) and its §2b invariant (**exactly one persist per
   batch**, `FS1` there): a per-op loop inside the commit is this unit's `FS10`. **The `ops` array is
   the adapter's output (§3.1) — the package supplies the tree and the diff, never the ops; the
   one-`applyBatch` clause here and the journal clause below are unchanged by the 2026-09-21 adoption
   (§11 amendment `11.9` item 1).**
2. **The channel is the existing `IPC_EDIT_BATCH`** (`src/shared/types.ts` `IPC_EDIT_BATCH` /
   `EditBatchPayload { ops: BatchOp[] }`) → `src/main/edit-ops.ts` `handleEditBatch(store, payload)`
   → `store.applyBatch(payload.ops)` → `src/main/rag-store.ts` `applyBatchSync`. **This unit adds no
   IPC channel** for the commit. No optimistic renderer-side write, no cache write (the read model's
   §6.3 step 1: "the cache is NOT modified").
3. **One invertible journal entry.** A successful batch lands as a **single `batch` journal entry**
   whose `inverse` ops are the reverse-ordered inverse of the forward ops
   (`src/main/rag-store.ts` `type JournalEntry`, the `batch` arm; `DECIDED: PROJECT-JOURNAL`;
   `DECIDED: BATCH-ATOMICITY-API`; `C16-CONSUMES-PROJECT-JOURNAL`). After one commit:
   `journal()` has gained **exactly one** entry of kind `batch`, and `undo()` restores the whole
   commit as a unit. **A commit that lands as N entries — or as a `content`/`structural` entry — is
   `FS11`.**
4. **Coarse-vs-fine undo is an EXPLICIT decision, not implied:** the pin is **COARSE** — one commit,
   one undo step, regardless of how many blocks changed. Rationale: the user's edit gesture is
   "leave the page", so the unit of user intent is the blur, and a fine-grained undo would make a
   single visual edit take N undos. `DECIDED: PROJECT-JOURNAL`'s invertibility requirement is
   satisfied at the commit's granularity, and **no finer granularity may be introduced** without a
   supersession of this clause.
5. **One persist, and the store's own invariant is inherited.** `applyBatchSync` performs exactly one
   `persist()` on success and zero on failure/empty (the `unit-import-batch-persist` §1.2 census
   reads: 7 `persist()` call sites; `applyBatch` → 1; failed batch → 0). The commit must not add a
   second persistence path.
6. **The result is CHECKED, never assumed.** `BatchResult` is discriminated
   (`{ ok: true; results } | { ok: false; error; failedIndex }`) and **`applyBatch` never throws for
   a domain failure** (`docs/specs/unit-import-batch-persist.md` §3's throw patterns; this unit
   inherits them verbatim). A commit path that ignores `ok` is `FS12`.
7. **The store MUST accept the rich-text ops inside a batch — and does not today.** **VERIFIED
   against the code:** `src/main/rag-store.ts` `applyBatchOp` currently returns
   `{ ok: false, error: 'rag applyBatch: op not supported: …' }` for the `setProps` / `setSubtree` /
   `setType` cases; `applyBatchOpInternal` (the four primitives) is what is applied.
   `DECIDED: BATCH-ATOMICITY-API` pins the union as closed at 7 members with the three rich-text ops
   in it, so the **contract is already the union's**, and this unit's implementation debt is to make
   `applyBatchOp` apply them. **Consequence for the red set:** this is a genuine RED obligation
   (today a whole-page commit containing a type change or a props merge returns `{ ok:false }`), and
   it is the reason the type pane's apply contract (§2.4) and the commit (§3.3) share one primitive.
8. **A NEW block has no node to diff against — the structural representation is PINNED:**
   - A paragraph/block the user **created** by typing in the surface matches no `data-rag-node-id`.
     It arrives as a package `nodeChanges.add` (§3.1) and is committed as **`{ op: 'putNode', node }`**
     with a **host-minted id** (minted by the **adapter**, never the package's own reconciliation id),
     followed by
     **`{ op: 'putEdge', edge }`** of kind **`doc-child`** from the **containing section node** to the
     new node, carrying `order` (its position among that section's `doc-child` children) and
     `documentIds: [documentId]`; `createdAt`/`updatedAt` are the commit's single timestamp, and
     `ownedNodeIds` is `[]`.
   - **Why `doc-child` from the containing section (and not `parent-child`):** the scoped walk
     materializes nested blocks as `doc-child` children at their `order` position and scopes them to
     the document via `documentIds` (`src/main/traversal.ts` `computeDocumentSubgraph` + `buildSubtree`;
     `DECIDED: SCOPED-WALK` / `DECIDED: DOC-CHILD`), whereas a single-parent, non-section,
     non-doc-child node is **never** materialized as its own root (`buildSubtree`'s documented
     finding 4). The alternative — the `parent-child` edge `src/main/edit-ops.ts` `createNode` mints
     when a `parentId` is given — does **not** carry `documentIds` and would build an unreachable
     node. Both facts are recorded so the choice is not re-derived.
   - **The minted id follows the parser's own scheme** — `${documentId}:${type}:${n}`
     (`src/main/markdown-parse.ts` `nextId`) — with `n` chosen **greater than every `n` already
     present for that `(documentId, type)` in the store**, so a later markdown import cannot collide
     with a hand-created block. A commit that reuses an existing id is `FS13`.
   - **A deleted block** (a block whose RAG node existed before the blur and no longer appears on the
     page) is expressed as `{ op: 'removeEdge', id }` for its now-absent containment edge, plus
     `{ op: 'removeNode', id }` for the node. Cascade behaviour is the store's (`removeNode` cascades
     the node's edges and journals both in the batch inverse). **A `removeNode` for a node the user
     did not empty is `FS14`** — the diff must not read a transiently unmounted block as a deletion.

### 3.4 The async engine-write sequence (`§12.7(a)`'s reversal, restated here)

`docs/specs/astrographer-scope-realignment-review.md` §3.3's WRITE PATH row excluded
`src/main/edit-ops.ts` / `doc-flow.ts` / `rich-decompose.ts` / `paste-sanitize.ts` **by name** with the
reason *"commit-on-blur editing cannot be async-chunked behind an engine hop"*. That exclusion is
**REVERSED** by the `GN-1` ruling (`docs/specs/design-extensions-review.md` §11.1) and recorded as a
reversal at **§12.7(a)**, which names **this unit** as the one that must restate the commit contract.
**This section is that restatement.** The sequence, in order:

| Step | What happens | Source of the pin |
| --- | --- | --- |
| 1 | The user edits the single surface. The rendered document is the **only** copy of the edit; the **store and the cache are NOT modified** (no optimistic apply). The tab's state becomes `uncommitted`. | §3.3 item 1; `docs/specs/unit-reads-pivot-tab-cache.md` §6.3 step 1 |
| 2 | **Blur** — the pinned `page-edit-surface-blur` handler def, whose body reads the surface's current text and calls the host seam **`pageSurfaceBlur(html)`** (§2.1; §11 amendment `11.8`) — or an explicit commit action, triggers the commit: the surface is decoded (`decodePage`), diffed (`diffTrees` through the adapter, §3.1) and the op list is built (`buildPageOps`). The op list is a **pure function** of (decoded page, store snapshot) — no I/O. | this spec §3.1/§3.2 |
| 3 | The op list is sent as **one** `IPC_EDIT_BATCH` payload. The tab moves to a **committing** (in-flight) state. | §3.3 items 1/2 |
| 4 | Main validates the payload (`handleEditBatch` returns a domain result for a non-array `ops`) and calls **one** `applyBatch`. On `{ ok: true }`, main derives and broadcasts `rag-store-changed` (`RagStoreChangedPayload`, `store`-qualified) **exactly once**, and the index reconcile runs. | `src/main/edit-ops.ts` `handleEditBatch`; `src/shared/types.ts` `IPC_RAG_STORE_CHANGED`; `docs/specs/unit-import-batch-persist.md` §2d (IPC-EDIT-BATCH: one batch entry, one persist, one broadcast) |
| 5 | **Success:** the store holds the committed values; the journal gained one `batch` entry; the tab becomes `clean`; the warning (if any) clears; the pending re-derive renders the committed content, which is textually equal to what the user typed. | §3.3 items 3/6; `docs/specs/design-extensions-review.md` §12.4 |
| 6 | **Failure:** see §3.5. | §3.5 |
| 7 | **The engine hop.** Under the `GN-1` ruling the authority is the engine, so the commit is an **engine write** (`src/main/engine-crud-rag-store.ts` `EngineCrudRagStore` — the document-CRUD interface; `updateDocument`, `POST /documents/:id/update`, carrying `baseRevision`). **The commit is still ONE async write whose failure leaves the pre-commit state intact** — a **chunked** commit (several engine calls that can fail between chunks) loses the user's text between chunks and is `FS15`. | `docs/specs/design-extensions-review.md` §11.1 / §12.7(a); `docs/specs/unit-reads-pivot-tab-cache.md` §6.3 |
| 8 | **The engine BATCH route is OWED (escalation, §11).** `EngineCrudRagStore` is an **11-method document-CRUD interface and is not a `RagStore`**, and it exposes **no batch call**; the ruling's write path therefore cannot yet carry this unit's `applyBatch` in one engine call. **Pinned interim:** the commit remains **one `applyBatch` against the store addressed by the store selector** (the P2 temporary authority, `docs/specs/design-extensions-review.md` §13.2 S1/§14.5 — *the contract says engine-authoritative while the code still writes locally; the gap is RECORDED, never hidden*), and the **engine-side batch route is a named prerequisite of the cutover**, filed for `U-AUTHORITY-SWITCH` (O-8). **No unit may implement an async commit before this restatement lands** (§12.7(a)); it has now landed, and the engine route is the follow-up. | `docs/specs/design-extensions-review.md` §11.1 item 1, §13.1 P2, §13.2 S1, §14.5 |

### 3.5 The failure model (`ST-5`)

**Pinned: a failed commit leaves the store unchanged and raises a user-visible warning.**

1. **Store unchanged — verified by the batch contract, not by hope.** On `{ ok: false }` the store is
   **rolled back to the pre-batch snapshot**, the journal is **not** polluted, and **nothing
   persists** (`src/main/rag-store.ts` `applyBatchSync`'s snapshot/restore; `DECIDED:
   BATCH-ATOMICITY-API`; `docs/specs/unit-import-batch-persist.md` §2b/its `P-IM-2` row: a failed
   batch performs ZERO persists and leaves the store file byte-identical). The commit's own
   obligation is therefore: **read `ok`, and on `false` change nothing else** — no local mutation, no
   journal write, no cache write, no revision bump (`docs/specs/unit-reads-pivot-tab-cache.md` §6.3
   step 5; its `P-SM-1` row).
2. **The user's text is NOT discarded.** The failed commit leaves the page's text in place, in an
   editable state, so the user can retry. Discarding the text on a failed commit is `FS16`.
3. **The tab enters `commit-failed`** — the third state of the pinned dirty machine
   (`docs/specs/design-extensions-review.md` §12.4: `clean` / `uncommitted` / `commit-failed` /
   `closing-dirty`; `TAB-1`'s warning symbol is bound to `commit-failed`). States are **per tab**,
   **exactly one at a time**.
4. **The warning is USER-VISIBLE and is the `TAB-1` class.** `docs/specs/design-extensions-review.md`
   §12.5 item 1 pins the class: the warning surfaces **in the tab** (the `TAB-1` warning-symbol class)
   **plus** whatever typed detail the stage shows; the **class is shared** with a tab-open load
   failure and **the reason is distinguishable**. **This unit supplies the commit-failure reason and
   the state; `C10 U-TAB-MERGE` supplies the tab-strip affordance** (§3.3 C item `C10`). Pinned
   interface between the two: this unit sets a **named, per-tab `commit-failed` state carrying a
   typed failure record**, and `C10` binds its rendered symbol to that state — **neither unit invents
   a second warning affordance** (the extension is recorded here so `TAB-1`'s owner does not
   re-invent one; the same device `docs/specs/unit-reads-pivot-tab-cache.md` §4.4 uses for the load
   failure).
5. **The typed failure record (pinned shape):**
   `CommitFailure { kind: 'not-authorized' | 'not-resident' | 'engine-unavailable' | 'store-rejected' | 'decompose-failed'; message: string; failedIndex?: number; engineCause?: 'connection-refused' | 'engine-not-spawned' | 'not-ready' | 'unavailable-state' }`.
   `store-rejected` carries the `BatchResult`'s `error`/`failedIndex` verbatim; `decompose-failed`
   carries the `{ ok: false }` arm's `error`; `engine-unavailable` carries the cause of
   `EngineUnavailable` (`src/main/engine-rag-store.ts`, whose `cause` discriminates exactly those
   four); `not-resident`/`not-authorized` are the refusal outcomes of §3.6. **The warning's exact
   wording and affordance (toast vs inline vs modal) is NOT pinned here** — the ruling leaves that to
   the implementing unit as a spec obligation (`docs/specs/design-extensions-review.md` §11.3 "what
   it does NOT decide" item 3), and this spec satisfies it by pinning the **state, the typed record
   and the enumerated silent outcomes it must not become** (§8.1 `FS17`), not a string.
6. **The warning SURVIVES A RE-DERIVE — the mechanism is pinned, and it is not the DOM.**
   `docs/specs/design-extensions-review.md` §12.5 item 4 states the obligation explicitly ("a tab
   state stored only in transient DOM does not satisfy this"). Pinned here: the dirty/`commit-failed`
   state lives in **host-side state keyed by tab id** — the same `EditController` dirty machinery the
   host already threads through `src/renderer/sidebar-panes.ts` and the tab descriptor's own store
   (§5 item 4) — and **never** in a rendered element's class/attribute/innerHTML. **ADOPTED (the landed carrier, pinned in §11 amendment `11.8`): the `commit-failed` record is a host-side `Map<tabId, failure>` in the `SidebarPanes` host** (`src/renderer/sidebar-panes.ts`, keyed by the same page subject the dirty machinery is keyed by), and **never** the DOM. **Why it is host state — the two obligations this spec already imposes, now pinned to that carrier:** (i) the warning must **survive a re-derive** — no re-derive path reads or writes that map, so it survives by construction; (ii) it must **not be a diffed content change** — being host state it can never enter §3.2's closed compared-field set, so it can never be read back as a page edit (`FS8`) and can never be lost to a content reconcile (`FS17`). Any re-derive path
   (`reDerive`, `content-reconcile`'s `reconcileContentRoots`/`reconcileDocumentRoots`, a template or
   operator re-derive) must therefore preserve it by construction. A warning that disappears when the
   envelope is rebuilt is `FS17`; a warning that **only** exists as a DOM class is `FS17` too.
7. **No automatic retry.** A retry is an **explicit user action**; a failed commit is never
   auto-reissued (`docs/specs/unit-reads-pivot-tab-cache.md` §4.4 rule 3 pins the same rule for the
   load failure, and its `FS12` is the fail-state). An auto-retry loop is `FS18`.
8. **Engine absence mid-session is a defined, typed outcome.** Per `docs/specs/design-extensions-review.md`
   §12.2 case (d) and §12.5 item 3, a resident document whose engine went absent mid-session raises
   the **typed** unavailable failure (`EngineUnavailable`, `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`
   retaining the *"never silent"* obligation), and the commit surfaces it as
   `kind: 'engine-unavailable'` — **never** a silent success and **never** a silent empty stage. The
   **boot-wide vs per-wiki** refusal framing is **not** this unit's (it is `U-AUTHORITY-SWITCH`'s,
   `§11.3` item 1); this unit pins the commit's behaviour under whichever framing lands, and it
   contributes **no document surface** when no engine is found.

### 3.6 The store-unavailable commit (no silent success)

**Pinned:** when the commit cannot be attempted at all — the document is **not resident**
(`CacheMiss`'s class, `docs/specs/unit-reads-pivot-tab-cache.md` §3.3), the store is torn down, or the
engine is absent — the commit returns the **typed** failure, leaves the store untouched, and sets the
same `commit-failed` state — the **same host-side per-tab carrier §3.5 item 6 pins** (a `Map<tabId, failure>` in the `SidebarPanes` host, §11 amendment `11.8`), never a DOM class or attribute. **A commit that reports success without an acknowledged write is the
worst outcome in this unit** (`FS19`) — it is the "clean with an unchanged entry" case the read model
forbids (`docs/specs/unit-reads-pivot-tab-cache.md` §7 `P-SM-3`).

---

### 3a. Adversarial findings (RCA-3 — HOST: fixed here + regression-tested)

**Why this section exists (the process violation it closes).** `AGENTS.md`'s RCA-3 guard and this file's §8.2
item 5 require the unit's read-only adversarial pass to be **recorded here**, at §3a/§3b, with every **host**
finding fixed in this repo and regression-tested. `C9 U-EDIT-1`'s RCA-3 pass ran **twice** — an **ORIGINAL**
pass whose five MUST-FIX items (`M1`..`M5`) were remanded, and a **SECOND** pass whose four residuals
(`N1`..`N4`) were remanded after the first fix batch — and until this section the file carried **no §3a/§3b at
all** while §8.2 item 5 promised them. **That absence is the recorded process violation this section closes:**
the findings, their fix status, the measured non-findings and the open residual are now pinned so no later
pass re-derives them.

**The verification convention for §3a/§3b (the §11.10 anchor rule, applied here).** This file cites `path` +
symbol / row id / `§section`, and its head matter pins that no line number appears in it
(`docs/specs/requirement-catalog.md` §3.4 rule 7). §11.10 already records the stated exception: an
**adversarial / landed-verification anchor** is a **tree reading taken at the stated pass** — the **path +
SYMBOL is the citation**, and the line number is recorded **only** because the finding pins a drift between a
document and one specific tree state (any edit of the named files shifts it). **Every anchor below was read in
the tree at this pass (2026-09-22);** anything this pass could not verify is marked **UNVERIFIED**, never
asserted.

#### The ORIGINAL pass — the five MUST-FIX findings and their resolution

| # | Finding (as filed) | Disposition + evidence (read at this pass) |
| --- | --- | --- |
| **`M1`** | **Foreign / unowned-node writes unguarded** — a page could name a node of another document and have it written. | **FIXED.** Three guards, all in `src/main/page-diff.ts`: the **surface-root marker read** (`PAGE_EDIT_SURFACE_ROOT_ID` 107; the root-authoritative marker loop 365–378 — a marker anywhere else can only fill in when the root authored none, never override it), the **marker-disagreement refusal** (`buildPageOps` 882–890: a page naming another document is refused with **no** op list), and the **foreign-node refusal** (`foreignNodeIds` 674–698, with its ownership-guard comment 715–716, and the per-block refusal inside `buildOps` 727–734). Regression rows: `archive/tests/2026-10-04-page-diff.test.ts` — `F1` a block whose `ragId` belongs to ANOTHER document is REFUSED (331), `F1` a page whose `data-edit-surface` DISAGREES with the committing document is REFUSED (364), `F1 (control)` (388). |
| **`M2`** | **The commit must be ONE `applyBatch`, with the `BatchResult` READ** (not a per-op loop, not an unchecked `ok`). | **FIXED.** The store side is one call returning one `BatchOpResult` per op (`src/main/rag-store.ts` `BatchResult` 195–197/212–217; `applyBatchSync` 1375–1453; the per-op application `applyBatchOp` 1244, emitting its result at 1258/1262/1267/1279); the host sends **exactly one** payload and reads it — `src/renderer/sidebar-panes.ts` `commitPageEdit` 3679–3690 (`bridge.edit.batch` once, `await`ed) and 3706–3714 (`isAcknowledgedBatch` / `storeRejectedFailure`). Regression rows: `archive/tests/2026-10-04-page-commit-failure-visibility.test.ts` `T1`/`T2` 499/514 (an unchanged page ⇒ **ZERO** `edit.batch` calls; one compared-field change ⇒ exactly **ONE** call) and `archive/tests/2026-10-04-page-diff.test.ts` §3.3 item 1 (857 — one `applyBatch` call, never a per-op loop). |
| **`M3`** | **A simultaneous type + content edit silently DROPPED the text** — the type branch `continue`d before the content write. | **FIXED.** `src/main/page-diff.ts` `buildOps` 835–847: a type difference emits the block's `putNode` when `contentDiffers` (705–707) **and then** the `setType` — **both** ops in the one op list, `putNode` first (so the content write and the retype cannot race). Regression row: `archive/tests/2026-10-04-page-diff.test.ts` 552 (`a block whose TYPE and CONTENT BOTH change commits BOTH (the text is never dropped)`). **The §3.2 minimal-op rule is NOT weakened** — its subject is one op per DIFFERENT FIELD SET, as §11.10 item 4(c) pins. |
| **`M4`** | **The `U-EDIT-1-LIVE` battery** — the RCA-11 MANDATORY pre-DONE live gate (§8.3 items 1–8). | **IN PROGRESS / OWED — never "done".** The battery's rows and blocks now EXIST in `scripts/live-drive.mjs` (`U-EDIT-1-LIVE-1`..`-8` in the extended-row table 2882–2893; the block implementations from 4984, with the `u_edit_1_live_*` handlers), but **no run result is recorded anywhere in this tree**, so the unit still has **no live measurement**. **Status: OWED** (§8.3; §11 items **7**/**8** — the O-0 oracle-identity re-run is likewise still owed), and per RCA-11/RCA-12 the unit is **not pre-DONE** while this holds (§11 item 8's "the blocks do not exist" clause is superseded in place by §11.11 item 2). |
| **`M5`** | **The failure warning was not VISIBLE at failure time** — the record existed, but the operator saw nothing until some unrelated later re-assembly. | **FIXED.** `src/renderer/sidebar-panes.ts` `recordPageFailure` 3624–3627 writes the host-side record **and immediately re-authors the graph** through `reauthorPageCommitWarning` 3568–3575 — the **content-reconcile** path, where document roots are COMPARED rather than rebuilt, so the user's DOM text (their only copy) is never discarded (`FS16`); the warning is authored as provident data by `src/renderer/pane-graph.ts` `PAGE_COMMIT_WARNING_ID` 1467 / `pageCommitWarningContent` 1472–1490. A later **SUCCESS** clears it: `clearPageState` 3609–3614 deletes the map entry and re-authors the graph. Regression rows: `archive/tests/2026-10-04-page-commit-failure-visibility.test.ts` `W1` 423 (authored at failure, no later re-assembly required) and `W3` 476 (cleared on a later success). **⟨ANNOTATED 2026-09-22 (item-10d documentation review) — this row's `FIXED` is CONDITIONALLY TRUE, not an unqualified FIXED; the original reading is kept above.⟩** The reconcile-path authoring holds **only if `applyContentReconcile` can actually ATTACH the `page-commit-warning` root**, and on the tree this review read it could not: **`Runtime.extractContentRoots` admitted FIVE id classes** (`src/renderer/runtime.ts`, admission test read at this pass — `rag-*`, `pane-*`, `EDITOR_TOOLBAR_ID`, `PAGE_EDIT_SURFACE_ID`, `LANDING_ROOT_ID`) and **omitted `PAGE_COMMIT_WARNING_ID`**, while `destroyRoot` and the pure reconciler (`src/renderer/content-reconcile.ts` `asContentRoot` / `isPaneLikeRoot`) DO admit it; `nextById` is built from the extractor, so the `added` warning root was refused on the added/replaced arms of `applyContentReconcileBody` with **`applyContentReconcile: added root missing from next: page-commit-warning`** and `attachRoot` was never called. **Node evidence (REPORTED at the last reading — NOT re-run by this review, whose wall is read/search + doc writes only):** `W1` 423 / `W2` 448 / `W3` 476 are **RED** for exactly this reason (each row asserts the warning is present in the **rendered** graph — `warningPresent` reads `Runtime.renderedHtmlResult().renderedHtml`, helper 273–275). **Live evidence (the row's live half, from `docs/specs/live-battery-2026-09-22-page-commit-and-stage.md` §3.2/§4.2):** `U-EDIT-1-LIVE-3` **PASSES** — a failed commit's warning is `painted=true` with geometry and still present after a real re-derive — **but that reading is taken from the DOM and does not attribute the observed root to the RECONCILE path** (a full `loadAppGraph`/`applyEditorToolbar` assembly also authors the warning root), so it does **not** by itself establish this row's reconcile-only claim; recorded here as a **limitation of the live oracle**, never as a pass of `W1`/`W2`/`W3`. **FIX IN FLIGHT — OBSERVED LANDING DURING THIS REVIEW:** `extractContentRoots` now admits `PAGE_COMMIT_WARNING_ID` with the omission and the refusal recorded in its own doc comment (`src/renderer/runtime.ts`, closing re-read of this pass), and the same correction is annotated at `docs/specs/unit-stage-active-tab-display.md` §A.1.2 (whose `destroyRoot` contract owns the parity clause). **With that landed, the reconcile path can attach the root and this row may return to an unconditional `FIXED` — the node rows are OWED a re-run by the owning unit; this review records the state, it does not flip the row.** **Anchor drift (symbols are the citation; `src/renderer/sidebar-panes.ts` was EDITED concurrently during this review, 3 921 → 4 016 lines across the review's own reads, so the numbers in the text above — `3624–3627`, `3568–3575`, `3609–3614` — and `pane-graph.ts` `1467`/`1472–1490` are pre-edit pins):** `pageEditSurfaceHandlerSubject` (`this.activeTabId ?? PAGE_EDIT_SURFACE_ID`), `recordPageFailure`, `reauthorPageCommitWarning`, `clearPageState`, and `src/renderer/pane-graph.ts` `PAGE_COMMIT_WARNING_ID` (`:1500`)/`pageCommitWarningContent` (`:1505-1527`) are the current addresses. |

#### The SECOND pass — the four residuals and their fixes

| # | Residual (as filed) | Disposition + evidence (read at this pass) |
| --- | --- | --- |
| **`N1`** | **The commit scope was `_currentDocumentId`, which a doc-nav `selectDocument` moves independently of the mounted tab** — a blur could therefore write into, or refuse against, a document the user was not editing. | **FIXED.** The scope is now the stage/surface scope seam `stageDocumentScope()` (`src/renderer/sidebar-panes.ts` 3517–3520: the ACTIVE TAB's document, with the retained doc-nav focus only when NO tab is mounted), read by `commitPageEdit` at 3649 — with the reason recorded in the seam's own comment (3646–3648). Regression rows: `archive/tests/2026-10-04-page-commit-scope-ack-race.test.ts` `N1a` 367 (with doc-1 mounted and active, a doc-nav selection of doc-3 must not re-scope or refuse the doc-1 commit) and `N1b` 403 (the no-tab legacy fallback — the discriminating control). |
| **`N2`** | **`documentBlocks`' scoping made deletions NEVER commit on the production import shape**: the importer authors `doc-child` edges WITHOUT `documentIds`, so a `documentIds`-only filter read an imported document as block-less, no removal was ever emitted, and the deleted block reappeared after the re-derive. | **FIXED.** The membership rule now mirrors the traversal's own derivation: `src/main/page-diff.ts` `documentBlocks` 545–590 derives the document's members the way `src/main/traversal.ts` `computeDocumentSubgraph` does — the document root plus the endpoints of the edges this snapshot SCOPES to the document, **then the transitive `doc-child` closure from those nodes** (569–586), with an unscoped `doc-child` edge whose SOURCE is outside the closure excluded (so a global edge never makes another document's blocks deletable). Regression rows on the PRODUCTION shape: `archive/tests/2026-10-04-page-diff-production-commit.test.ts` `SP1` 148 (`removeEdge` + `removeNode` through `handleEditBatch`), `SP2` 188 (the re-derive no longer renders the block), `SP3` 209 (the `FS14` guard), `SP4` 225 (the minted new block + its `doc-child` edge), with `SC0` 246 (the test-local scoped-edge shape — the discriminating control) and `SC1`. |
| **`N3`** | **`isAcknowledgedBatch` accepted `>=` with NO per-entry validation** — an over-long or junk `results` array read as an acknowledged write (the `FS19` silent-success class). | **FIXED.** `src/renderer/sidebar-panes.ts` `isAcknowledgedBatch` 481–487 now requires a boolean `ok: true`, a `results` array whose length **equals** the op count (`results.length !== ops.length` is a refusal), and **every** entry agreeing with its op through `acknowledgesOp` 448–486 — the op's own `op` kind, and any identity the entry carries (`acknowledgedRecordId` 437–439: `node.id` / `edge.id`) must be the acknowledged op's own. Regression rows: `archive/tests/2026-10-04-page-commit-scope-ack-race.test.ts` `N3` 425 (over-long junk, over-long plausible, and an entry acknowledging ANOTHER op are typed failures that KEEP the dirty flag) with its control 462; `archive/tests/2026-10-04-page-commit-failure-visibility.test.ts` `C1` 282 and `C2` 311. |
| **`N4`** | **No generation guard on the async page commit** — a close (or a tab-id REUSE) during a flight could resolve into a re-minted subject: a failure could attach a `commit-failed` warning to a fresh tab, and a success could clear a fresh tab's dirty flag (so its text never commits). | **FIXED.** A per-subject sequence discards every resolution arriving after a drain: `src/renderer/sidebar-panes.ts` `pageSubjectSeq` 796 (with its guard class documented 785–795), `pageSubjectStamp` 3593–3595, the drain `invalidatePageSubject` 3600–3602 (called by the close/prune paths 3550/3583), the stamp taken **before** the write plus the `superseded()` predicate 3653–3654, and the post-`await` discards at 3692 (the throw arm) and 3705 (the resolution arm). Regression rows: `archive/tests/2026-10-04-page-commit-scope-ack-race.test.ts` `N4a` 479 (a FAILING flight + a close must not attach a failure to the drained/reused subject), `N4b` 514 (a SUCCEEDING flight must not clear a fresh tab's dirty flag), `N4c` 541 (a plain SWITCH is the control — the other tab's state is untouched). |

#### Measured NON-FINDINGS (recorded so they are not re-derived)

1. **The REMOVAL half of the foreign-write vector is NOT REPRODUCIBLE.** The pass hypothesised that the
   deletion scan could name another document's blocks; it does not. `src/main/page-diff.ts` `documentBlocks`
   (545–590) returns an edge as a block of THIS document only when the edge is scoped to the committing
   document **or** its source is inside the document's transitive `doc-child` closure (586), so another
   document's blocks are never returned and never removed. The regression/control row is
   `archive/tests/2026-10-04-page-diff.test.ts` 388–413 (`F1 (control)` — **no** removal names another document's blocks, with
   the discriminating own-block removal asserted live in the same row, 410–412).
2. **The raw-source scan's comment/script blindness — a HOST RESIDUAL, status OPEN (NOT fixed); its
   reproduction is UNVERIFIED.** The adapter reads block identity off the RAW page source (§11.10 item 1), and
   its scanner has **no comment/script/style skip**: `scanPageElements` (`src/main/page-diff.ts` 224–244)
   matches every `<tag …>` start tag with a bare regex, and `findElementEnd` (201–220) walks the same raw text
   for the matching close tag. A read of `src/main/page-diff.ts` at this pass finds **no** comment (`<!--`),
   `script`, `style` or CDATA handling anywhere — the only `comment`/`style` matches in the module are the
   non-diffed-runtime-prop comment (43) and the `style` key of `RUNTIME_PROP_KEYS` (95). **Consequence, stated
   as narrowly as the reading supports:** a start tag appearing inside an HTML comment or inside a
   `<script>`/`<style>` text body is scanned like a real element, and `decodePage` (383–395) then treats it as
   a surface artifact, a minted NEW block, or — for a tag outside the closed block/`RagNodeType` set — a
   **whole-page refusal**. **Status: OPEN (host, unfixed at this pass).** **UNVERIFIED:** whether the
   production surface's HTML can carry such a fragment at all (paste-sanitization path, authored content) —
   this pass measured no reproduction, and the residual is recorded with that limitation rather than as an
   asserted exploit.

### 3b. Adversarial findings (PACKAGE — recorded, never patched)

**Cross-reference only — no package finding is patched here, or anywhere in this repo** (`AGENTS.md` item 7: a
package defect is **catalogued + handed off**). The pass surfaced **three `provident-editable@0.2.0` rows**,
each re-verified against the installed `dist/**` before filing: `docs/defects.md`
**`PROVIDENT-EDITABLE-ATTRS-DROPPED`**, **`PROVIDENT-EDITABLE-TABLE-FLATTENED`** (the runtime half of the
already-filed type-union row) and **`PROVIDENT-EDITABLE-DEPTH-CAP-SILENT-DROP`**; the matching handoff rows
are `docs/HANDOFF.md`'s OPEN handoff items.

| Row (`docs/defects.md`) | The gap | This unit's consumer-side handling (the ONLY permitted form — workaround/refusal, never a patch) |
| --- | --- | --- |
| `PROVIDENT-EDITABLE-ATTRS-DROPPED` | `htmlToTree` keeps **no** attribute except an `img`'s `src`/`alt` and an `a`'s `href`, so the package's tree can never carry `data-rag-node-id` / `data-rag-props` / `data-edit-surface`. | The adapter reads them off the **raw source**: `src/main/page-diff.ts` `ATTR_RAG_PROPS` 99, `parseAttrs` 187–196, `scanPageElements` 224–244, and the marker reads 365–378 (recorded as a WORKAROUND; §11.10 item 1 records the same fact and owes the upstream row). |
| `PROVIDENT-EDITABLE-TABLE-FLATTENED` | `BLOCK_TAGS` carries no table family and the converter silently **FLATTENS** an unknown element — no throw, no warning, no dropped-content report. | The adapter **REFUSES**: `UNEXPRESSIBLE_BLOCK_TAGS` (`table`/`thead`/`tr`) 79 + the refusal in `decodePage` 387–392, the `decompose-failed` class of §3.1's last mapping row. |
| `PROVIDENT-EDITABLE-DEPTH-CAP-SILENT-DROP` | The converter's private `MAX_DEPTH` drops content past the cap with no report, and the constant is not importable. | The adapter mirrors the boundary it cannot import (`PACKAGE_MAX_DEPTH = 512` 253; `maxNestingDepth` 260–276) and **REFUSES** an over-deep block fragment (414–419). **The boundary relation between the two measures is UNVERIFIED and OWED** — §11.10 item 2, and §11.11's `SN-4`. |

**The recorded CONSEQUENCE (cross-referenced, never softened).** A document that contains a table **cannot
commit any edit** through the whole-page surface: one inexpressible block refuses the **whole** page decode
(387–392), so no op list exists and the commit is a typed `decompose-failed` failure with the store untouched.
`docs/HANDOFF.md`'s `PROVIDENT-EDITABLE-NO-TABLE-ELEMENTS` handoff row states exactly this — *"the whole-page
editing surface cannot commit an edit to any document that contains a table"* — and the type-union half is
`docs/defects.md` `PROVIDENT-EDITABLE-NO-TABLE-ELEMENTS`. **It is a user-visible capability hole in a
dependency: ESCALATED, never patched here** (§11 item 9). The split's other half: `td`/`th` are decoded as
standalone cell **LEAVES** (`PAGE_BLOCK_TAGS` 74, `NEW_BLOCK_TAGS` 87), so a cell's text can be read but its
row/table containment is never reconstructed.

---

## 4. SUPERSESSIONS THIS UNIT LANDS

### 4.1 Which `DECIDED:` rows this unit supersedes

**Written in THIS unit's landing pass — never before.** The gate record is explicit twice over
(`docs/specs/design-extensions-review.md` §3.3 C item `C9`: *"lands the `SUPERSEDED` rows against
`EDITING-MODE-SETTING` + `FORM-CONTROL-EDITING` in the landing pass"*; §6.2: *"the `SUPERSEDED` rows
for `EDITING-MODE-SETTING` / `FORM-CONTROL-EDITING` are written at C9's landing, not before —
writing them earlier would supersede a live model with an unimplemented one"*).

| Target row (`docs/decisions.md` §ACTIVE) | Form | The clause at issue | Surviving clause(s) |
| --- | --- | --- | --- |
| **`DECIDED: EDITING-MODE-SETTING`** | **SUPERSEDED** | the **editing-control swap** — that `editingMode: 'textarea' \| 'contenteditable'` selects the per-node control (a rich-eligible root splices to `contenteditable`; ineligible roots render as plain text), and that a mode change re-derives to swap controls | **The mode-broadcast contract SURVIVES and is kept** (§2.5): a mode/operator change writes the operator store → main broadcasts `operator-settings-changed` with the store's result as the **authoritative payload** → the host uses the **payload directly** (no re-fetch; no async race with the sync `requestRebuild`) → **fresh re-derive**, never `refresh()` over a cached spliced envelope. Also surviving: **commit-on-blur**, **the dirty-edit guard**, **RAG-authoritative re-traversal**, and **all-UI-via-provident authoring**. The `settingsContent` button-toggle and the `?? 'contenteditable'` fallback do **not** survive (the field is gone). **Also surviving (§11 amendment `11.8`), the successor carrier of the same persisted slot:** the representation-mode field **`representationMode: 'html' | 'markdown'`** (§2.5) — it reuses the removed field's `OperatorSettings` slot while naming **representations** of one control, never editing controls. |
| **`DECIDED: FORM-CONTROL-EDITING`** | **SUPERSEDED** | the **form-control model** — that editing "is a form control (textarea/input) committed on blur, writing back to the source RAG object"; and its `NOT contenteditable` clause (which `DECIDED: RICH-TEXT-EDITING-GATE` had already relaxed) | **commit-on-blur SURVIVES**; **the write-back is to the RAG store, then a re-traversal** SURVIVES (`DECIDED: CONTENT-EDIT-RE-TRAVERSAL` is the successor carrier and stays ACTIVE); **the dirty-edit guard queues rather than executes a rebuild** SURVIVES; the caret-is-host-side-state-keyed-by-RAG-node-id clause is **re-scoped** (the caret is now page-scoped, §2.1). |
| **`DECIDED: WHOLE-PAGE-EDITING`** | **status moves from `REQUIREMENT, not yet implemented` to IMPLEMENTED-BY-THIS-UNIT** — the row **stays ACTIVE** | its own text already declares the supersession *"once implemented"* and owes *"a spec re-derivation + a live row (whole-page edit commits 1-1)"* | The row's **RAG-store-authoritative** clause is read through its successor `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` (the `GN-1` ruling moved the authority engine-side while the host keeps the temporary authority until P2, §3.4 step 8). The **live row it owes is recorded as this unit's live battery** (§8.3) with its identifier pinned as **`U-EDIT-1-LIVE`** and its §5.U disposition stated (§8.3 item 6). |
| **`DECIDED: RICH-TEXT-EDITING-GATE`** (**ADDED 2026-09-21 — §11 amendment `11.9` item 1**) | **SUPERSEDED at this unit's landing** — **only its in-house-build clause** | that the rich-text decompose/diff is an **in-house** build (`src/main/rich-decompose.ts` `decomposeRichHtml`), and its recorded fact *"the `provident-editable@0.1.0` import plan was replaced by the in-house build"* | **Every other clause of the row SURVIVES and stays binding:** the 9-member rich-editability/eligible-type gate's supersession path, the `setProps` **MERGE** semantics that preserve `data-doc-head`, the **`setType` never delete+create** rule, the `children` field's inline model, and the census rows it pins (§2.2 item 3, §2.4 item 4, §3.2's props row all still cite it). The supersession is by the **package adoption**: `provident-editable@0.2.0`'s `htmlToTree`/`diffTrees` are the production decomposer/diff, with the **mapping contract carried by §3.1 of THIS spec** (the adapter `src/main/page-diff.ts`) — so no clause of the row is left without a successor. This row writes **no** `SUPERSEDED` mark on any other row. |
| **the textarea half of `DECIDED: EDITING-MODE-SETTING`** | covered by the supersession above | — | — |

### 4.2 The `SUPERSEDED` rows are written AT LANDING, and only then

**Rule (binding):** the two `SUPERSEDED` rows land **in this unit's own landing pass** — the same
pass that archives the code (§5) and the tests (§6) — and **not** in the pass that authored this
spec. **A THIRD row was added to that set by the owner ruling of 2026-09-21 and lands in the same
pass, under the same rule: `DECIDED: RICH-TEXT-EDITING-GATE`'s in-house-build clause**
(§4.1's added row; §11 amendment `11.9` item 1). The set is therefore **three** rows at landing, and
the sentence above is read with that addition — recorded here rather than left for a later pass to
re-tally silently. A pass that writes them earlier contradicts `docs/specs/design-extensions-review.md` §6.2 and
§9.2 (a supersession is *"reversible in form, not in effect"*). Each row carries, in its own text:
the date, the gate-record pointer (`§11.1`/`§12.7(a)` do **not** apply here — the pointer is
`§3.3 C item C9` + `§6.2`), the **surviving clauses enumerated** (the table above), and the statement
that the row is **retained for provenance**.

### 4.3 The rows this unit must NOT write

**Pinned non-writes:** any `SUPERSEDED`/amendment to `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD`,
`DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE`, `DECIDED: ASTROGRAPHER-SCOPE-REALIGNMENT`,
`DECIDED: BATCH-ATOMICITY-API`, `DECIDED: PROJECT-JOURNAL`, `DECIDED: C16-CONSUMES-PROJECT-JOURNAL`,
`DECIDED: CONTENT-EDIT-RE-TRAVERSAL`, `DECIDED: DERIVED-DOC-FLOW`, `DECIDED: RAG-SNAPSHOT-PRESERVED`,
`DECIDED: SCOPED-LOAD`/`SCOPED-WALK`/`SINGLE-DOCUMENT-SUBGRAPH` — all of these stay **ACTIVE and
binding**; this unit *implements* them. The read model's **sync-read** clauses
(`docs/specs/unit-reads-pivot-tab-cache.md` §3) are untouched: the commit's async half is the **write**
hop, and **nothing async may appear between a caller and a resident read** (that spec's §3.3 rule 6).
Also a non-write: the catalog (`docs/requirement-catalog.md`). It is **cited, never edited**
(`docs/specs/design-extensions-review.md` §15.1's target list belongs to the catalog's own pass).

### 4.4 The re-traversal the commit triggers (kept, not re-invented)

The commit's success path re-traverses via the existing `rag-store-changed` route: main broadcasts
**once** per successful batch (`store`-qualified), the renderer host drops a foreign-store payload
(`DECIDED: STORE-QUALIFIED-BROADCAST`), and the host re-derives (`reconcileContentRoots` /
`reconcileDocumentRoots` keep the identity of unchanged roots; `PLACEMENT-ONLY-PAYLOAD-ROOT` is
unchanged). **This unit adds no new change-notification mechanism** and does not touch
`docs/specs/mcp-endpoint.md`. `DECIDED: CONTENT-EDIT-RE-TRAVERSAL`'s pin — *"the renderer re-traverses
on ANY RAG-store change … re-traversal is the ONLY content-edit coherence mechanism"* — is the
contract the commit satisfies, and it is the reason **no DOM surgery** appears anywhere in §2/§3.

### 4.5 The `TAB-1`/`TAB-2` boundary (so two units do not run over one surface)

**Pinned:** this unit defines **the `commit-failed` state and its typed failure record** and the
**user-visible warning obligation**; it defines **no** tab-strip element, **no** warning-symbol
affordance, **no** dirty-tab merge predicate, and **no** eviction deferral policy. `TAB-1`'s symbol
and `TAB-2`'s predicate are `C10 U-TAB-MERGE`'s, **strictly after** this unit (`§3.3 C` item `C10`;
`docs/specs/test-pruning-disposition-2026-09-21.md` §6.2 (a)). The **shared vocabulary** is the dirty
machine of `docs/specs/design-extensions-review.md` §12.4; this unit is the **producer** of
`uncommitted`/`commit-failed`, and it consumes the **read model's** §5.1 dirty rules for one purpose
only: **a dirty page is never evicted, invalidated or replaced** (its text is the only copy).

---

## 5. THE CODE TO ARCHIVE

**The rule this section exists to make executable:** *"Archive code that doesn't align with tests"* —
i.e. **the dead-once-this-lands surface is archived, and a module with a live importer is NEVER
archived before that importer lands** (`AGENTS.md` item 6; `DECIDED: REBUILD-ARCHIVE-POLICY`'s
archive-not-adapt rule applied to `src/**`, with the same ordering discipline).

**Destination convention (pinned):** source archives land at **`archive/src/<date>-<name>.ts`**
(the `archive/<topic>/<date>-<name>.<ext>` convention of `AGENTS.md` item 6, with a **`src/`** topic).
`archive/README.md`'s topic table gains the **`src/`** row in the same pass that creates the first
file (its own rule: *"a topic dir is created only by an executed archive"*). An archived source file
is **moved, never edited**, and is a **rebuild input** — never a source of the new contract. **REALIZED in this unit's landing pass (§11 amendment `11.8`):** two moves landed, each **importer-free at the move** — `archive/src/2026-09-21-sidebar-panes-apply-editing-mode.ts` (item 1) and `archive/src/2026-09-21-rich-eligibility.ts` (item 4). **The two files' coverage, recorded so this section and `archive/src/` agree:** item 1's artifact additionally carries items **2**/**6**/**7**'s dead text (its own numbered sections name the spec items — `RAG_EDITOR_HANDLER_DEFS`, the four `RAG_EDITOR_*_BODY`s, `restoreRichCaret`, the per-node bridge surface, the `kind: 'textarea'` caret arm), so **no** `<date>-sidebar-panes-rag-editor-handlers.ts` and **no** `<date>-textarea-editing-bridge.ts` file exists; item **3** is the fence exception (**NOT ARCHIVED**, §5.1); and item **5**'s artifact **was NOT executed** — the removed `coerceEditingMode`/`editingModeLabel` helpers are **not** in `archive/src/` and survive only as prose comments in the successor code (`src/renderer/pane-graph.ts`, `src/main/operator-settings-store.ts`), **recorded as OWED** (§11 amendment `11.8` item 6). **Every other item's destination stays conditional** on its own archive-condition cell.

**Per item: the path, its consumers that must change FIRST, and the archive condition.**

| # | Dead-once-this-lands surface | Archive destination | Consumers that must land FIRST | Archive condition |
| --- | --- | --- | --- | --- |
| **1** | **The per-node contenteditable splice** — `src/renderer/sidebar-panes.ts`'s `applyEditingMode` (the private method that filters `textarea` children, computes `ownsDocChildren`, sets `props.contenteditable = true` and attaches `RAG_EDITOR_HANDLER_DEFS` to every rich-eligible root) | `archive/src/2026-09-21-sidebar-panes-apply-editing-mode.ts` — **MOVED at this pass, importer-free at the move** (§11 amendment `11.8`; **the method's own text**, extracted as a recorded artifact — the module itself is 3 670 lines and is **not** archived) | the **app-graph/stage-assembly** authoring of the single surface (§2.1 — the `assembleAppGraphEnvelope` builder + the host's `applyEditorToolbar`/`loadAppGraph` seam) must be in place, **and** the host's re-derive paths (`reDerive`, the per-document assembly loop, the content-reconcile re-derive) must author the surface through that successor instead | **A module with a live importer is never archived.** `sidebar-panes.ts` keeps live importers throughout (`src/renderer/renderer.ts`, the host tests), so the **whole module is NOT archived**; only the dead method text is. |
| **2** | **The 4 per-node rich handler defs and their bodies** — `src/renderer/sidebar-panes.ts` `RAG_EDITOR_HANDLER_DEFS` (`rag-editor-input` / `-blur` / `-compositionstart` / `-compositionend`) + `RAG_EDITOR_INPUT_BODY` / `_BLUR_BODY` / `_COMPOSITIONSTART_BODY` / `_COMPOSITIONEND_BODY` + `restoreRichCaret` + the `saveCaret(nodeId, { kind: 'rich' … })` path | `archive/src/<date>-sidebar-panes-rag-editor-handlers.ts` | the page surface's own handler defs must be registered **and** the caret machinery re-scoped to the page (§2.1) | Registered handler defs are reachable by name from the app graph; removing them while the **app-graph assembly** still authors them breaks the graph (`provident.dispatch` would resolve a name with no def). **Order: the app-graph/stage authoring changes first** (the successor authoring is the surface node of §2.1, authored through `assembleAppGraphEnvelope`/the host's `applyEditorToolbar` seam). |
| **3** | **The per-node textarea editing overlay — the WHOLE textarea path** — `src/main/traversal.ts` `buildSubtree`'s authored child `{ type: 'textarea', props: { id: \`textarea-<ragId>\`, … }, handlers: [{ name: 'rag-textarea-input' }, { name: 'rag-textarea-blur' }] }`, its `hidden`/`readOnly` tombstone form, and every remaining consumer of a `type: 'textarea'` child (the decode/diff skip rows, the `textarea-<ragId>` id-namespace class, the child-list expectations built on it) | `archive/src/<date>-traversal-textarea-overlay.ts` — the **authored-child text** extracted from the still-live `src/main/traversal.ts` (the module itself keeps live importers and is **NOT** archived) | the **package decode + adapter** path (§3.1/§3.2) must be the only content read-back, and the fence row below must be re-planned **first** (§5.1) | **MOVED in this unit's landing pass — the tombstone exception is RETIRED (§11 amendment `11.9` item 2).** The adapter creates the element **unconditionally**, so `hidden` never made it non-rendered; the child must therefore stop being authored **entirely**, and the fence row is re-planned. |
| **4** | **`isRichEditableRoot`'s per-node gate** — `src/renderer/rich-eligibility.ts` (`isRichEditableRoot` + the closed `EDITABLE_TYPES` set) | `archive/src/2026-09-21-rich-eligibility.ts` — **MOVED at this pass, importer-free at the move** (§11 amendment `11.8`; **the whole module**) | `applyEditingMode` (item 1) is the module's **only** `src/` consumer; it must be deleted first, and the `EDITABLE_TYPES` census (9 members) must be superseded by the pane's closed set (§2.4) | The module's **only** importer is `src/renderer/sidebar-panes.ts`; once item 1 lands there is **zero** `src/` importer, so the whole module is archivable **in the same pass** (and its archived copy is the rebuild input, not a pin). |
| **5** | **The editing-mode setting path** — `OperatorSettings.editingMode` (`src/shared/types.ts` `type EditingMode` + the field + its patch field), `src/main/operator-settings-store.ts`'s `coerceEditingMode`/`sanitize`/`set` handling of it, `src/renderer/pane-graph.ts`'s `editingModeLabel`, and the `settingsContent` button-toggle + its `sidebar.operatorSet({ editingMode })` bridge in `src/renderer/sidebar-panes.ts` | `archive/src/<date>-editing-mode-setting.ts` (the removed coercion + label helpers, as one artifact) | the successor representation-mode field (§2.5) must land **with** the removal in one diff (a boot that reads a removed field must not be reachable), and every test harness literal must move (§6.3) | The field is **persisted operator state** (`DECIDED: UI-CONFIG-CARRIER`): a stored `editingMode` from a previous session must be **ignored, not trusted** — the sanitizer drops it and the successor field defaults. A boot that restores `'textarea'` behaviour from the stale key is `FS20`. |
| **6** | **The per-node textarea handler defs + the per-node edit IPC bridge surface** — `rag-textarea-input` / `rag-textarea-blur` defs and the `SidebarApi.textareaInput` / `textareaBlur` surface in `src/renderer/sidebar-panes.ts`, plus the per-node `IPC_EDIT_COMMIT` (`{ nodeId, content }`) **renderer** caller | `archive/src/<date>-textarea-editing-bridge.ts` | the page commit path (§3) must be the only content write-back, and the host must stop registering the textarea handler names | `IPC_EDIT_COMMIT` **itself is not removed** — it is the MCP/UI-equivalent single-node content write (`src/shared/types.ts` `EditCommitPayload`) and `src/main/edit-ops.ts` `handleEditCommit` stays the MCP `edit.set_content` counterpart; **only the renderer's per-node textarea caller dies** (a main-side handler without a UI caller is legal; a UI caller with no handler is not). **The surviving-seam census (pinned here and restated in §11 amendment `11.8`, so §2.1 and this item agree on the exact set):** the retired per-node seam set is exactly **six handler defs** — `rag-textarea-input`/`rag-textarea-blur` (this item) + `rag-editor-input`/`rag-editor-blur`/`rag-editor-compositionstart`/`rag-editor-compositionend` (item 2) — and exactly **six `SidebarApi` bridge methods** — `textareaInput`/`textareaBlur` (this item) + `editorInput`/`editorBlur`/`editorCompositionStart`/`editorCompositionEnd` (item 2's rich-editor seam class; `src/main/preload.ts`'s `SidebarApi` comment names the same six as retired). The **surviving** page seams are exactly **two handler defs** (`page-edit-surface-input`/`page-edit-surface-blur`) and exactly **two bridge methods** (`pageSurfaceInput`/`pageSurfaceBlur`); a pass that leaves any retired name registered, or that re-exposes a per-node editing seam under a new name, is a review finding. |
| **7** | **The per-node caret model** — `src/renderer/edit-controller.ts` `type CaretState`'s `kind: 'textarea'` arm | folded into item 2's artifact (the same type's re-scope is a supersession, not a move) | the page caret type (§2.1) must land with the re-scope | `src/renderer/edit-controller.ts` **the module is NOT archived**: its `EditController` interface is **kept whole** (§6.4 item 1) — it is the surviving dirty-edit guard used by **both** the content path and the template editor, and `src/renderer/sidebar-panes.ts` is a live importer. |

### 5.1 The textarea authoring, the RE-PLANNED fence row, and the DROPPED tombstone

**The conflict, stated exactly — and its RESOLUTION (2026-09-21).** `ST-6`/`PRUNE-311` require that
textarea editing be **removed** ("no `<textarea>` editors are materialized, and no duplicate textarea
ids exist"). **`tests/traversal.test.ts` — one of the two FENCE suites — asserted the authored child
list `[undefined, 'textarea-ul', 'rag-li1', …]` for a `ul` subtree root**, i.e. it pinned the presence
of the traversal-authored `textarea-<ragId>` child, and the fence's standing pin was that it **"must
stay green UNCHANGED"** and **"may not be re-derived"** (`docs/specs/design-extensions-review.md`
§3.1/§3.2 B.4, §14.2; the fence exemption is EXEMPT BY NAME), with both files on the archived-test
pass's **absolute-exclusion** list (`docs/specs/test-pruning-disposition-2026-09-21.md` §9.3a).

**The escalation this section previously carried is RESOLVED by an owner ruling (2026-09-21; §11
amendment `11.9` item 2). The interim tombstone is DROPPED, and that one fence row is RE-PLANNED.**
The tombstone never satisfied its own purpose: **the adapter creates the `<textarea>` element
unconditionally**, so `{ hidden: true, readOnly: true }` never made the child non-rendered, and the
"inert" artifact was a rendered form control in the stage — the exact outcome `ST-6` forbids. The
resolution is therefore the removal, not the disguise:

- **`src/main/traversal.ts` `buildSubtree` stops authoring the `type: 'textarea'` child ENTIRELY** — no
  `textarea-<ragId>` id, no `hidden`/`readOnly` props, no `data-rag-node-id` mirror, **no authoring
  slot at all** (the id-namespace class `textarea-` therefore retires with it, §6.3 row 19);
- **the one fence row it existed to satisfy is RE-PLANNED under this explicit ruling** — the fence was
  **exempt BY NAME**, and the owner has authorized **re-planning that row**. The authorization is
  scoped: **`tests/traversal.test.ts` is the ONLY fence file this unit may edit, and the child-list row
  is the ONLY row it may edit there** (§6.5's fence paragraph). `tests/import-render-no-duplicates.test.ts`
  is **NOT** licensed for any change;
- **the per-node editing capability** (`value` binding, `rag-textarea-*` handlers, read-only-by-backref
  logic) is **gone**;
- **no `textarea`-typed child is excluded from the decode or the diff any more**: the adapter's
  compared-field set (§3.2) has nothing to skip, because the child is never authored. A `textarea`
  element appearing on the page is now a **surface artifact** folded into its parent block's `content`
  exactly like any other non-RAG element (§3.2).

*Why the drop and not the tombstone:* the tombstone's whole justification was that the fence could not
be edited. That premise is gone (the row is re-planned), and the artifact it produced defeated `ST-6`'s
user-visible outcome — a zero-count `<textarea>` census in the rendered DOM (§8.3 item 6), which is now
**TRUE** rather than asserted-around. `FS21` below is restated accordingly: it no longer names a
tombstone at all.

---

## 6. TEST DISPOSITION AND THE RED-SET PLAN

### 6.1 The class census (readings with their method — recount, never copy)

**Method (so item 10d can recount mechanically):** (a) the current `tests/**` file set from a glob of
`tests/**/*.test.ts`; (b) the **rebuild** set from the rebuild map's `C9` row
(`docs/specs/test-pruning-disposition-2026-09-21.md` §9.4); (c) the **rewrite** set by two probes over
the current tree — (i) `editingMode` occurring in a **strict-typed** `OperatorSettings` literal or
type annotation (the field is removed, §5 item 5), and (ii) a pin on the removed textarea surface
(`textarea-` / `type: 'textarea'` / `rag-textarea-*` / `sidebarApi().textareaInput|textareaBlur`) or
on the removed mode labels (`editorToolbarContent('textarea'…)`, `data-mode=contenteditable|textarea`,
`/editingMode:(contenteditable|textarea)/`).

| Disposition | Count | What it means |
| --- | ---: | --- |
| **REBUILD** | **17** | suites this unit re-derives **from this spec** (§6.2). They are **already archived** and are the rebuild's **input**, never its source. |
| **REWRITE** | **26** | current `tests/**` files (of the 180 in-tree) that pin the superseded surface or construct the removed field. **§6.3's per-file table is the work list and has 26 rows of distinct files**; each is **re-derived from this spec**, never adapted from its old assertions. |
| **KEEP** | **137** | current files untouched by this unit's diff. They **must stay green unchanged** — the register (§7) and the trio (§8.2 item 4) are their assertion. |
| **DELETE** | **0** | **Nothing is hard-deleted.** Retiring a suite is an **archive move** (`DECIDED: REBUILD-ARCHIVE-POLICY`: archived, not adapted; and the archive copy is the durable rebuild input). The 41 already-retired files were **moved, never deleted** (`docs/specs/test-pruning-disposition-2026-09-21.md` §9.3). |

**The class total is complete: 17 + 26 + 137 = 180** = the current `tests/**` file count (the reading
of `docs/specs/design-extensions-review.md` §14.3's census, recounted at this pass by the glob of
§6.1). **No file is in two classes.**

**Where the `REWRITE` count comes from — two probes, and §6.3's table is the work list** (the rule of
`docs/specs/test-pruning-disposition-2026-09-21.md` §9.2: *"the per-file list wins"*).
**Probe (i) — the removed `editingMode` token, strict-typed or not** (the field is removed, §5 item 5,
so every carrier is a rewrite candidate; a **strict-typed** carrier additionally fails `npm run
typecheck`): **21 files, all present in §6.3's table** — `unit-u-shell-9b-h3-doc-namespace`,
`unit-live8-toolbar-undo-refresh`, `unit-v3-doc-heads-docnav-adversarial`,
`unit-u-shell-9a-main-focus-tabs`, `unit-wave-1-bridge-wiring`, `unit-u-shell-3-collapsible-panes`,
`unit-v3-doc-heads-docnav`, `unit-u-parity-c18-advanced-search`, `unit-h8-operator-editor`,
`unit-u-parity-docnav`, `blind-unit-v3-doc-heads-docnav-greens`, `unit-live4-empty-store-landing`,
`unit-u-shell-1-w2n1-layout-boot-writethrough`, `unit-live4-adversarial-fix`,
`unit-u-shell-9b-cross-document-shared`, `unit-u-shell-9b-h2-c20-materialization`,
`unit-ms5-settings-listing`, `unit-u-shell-9b-w2n15-rederive-scope`,
`unit-u-shell-9b-h1-optionc-interception`, `unit-u-parity-c19-hover-preview`,
`unit-u-shell-9b-blind-greens` — **20 of these are strict-typed**;
`unit-live11-bridge-seams` carries the token under a `Record<string, unknown>` type and is therefore
counted here too (21 carriers total; 20 strict).
**Probe (ii) — a pin on the removed textarea surface or on the removed mode labels**
(`type: 'textarea'` / `textarea-<ragId>` / `rag-textarea-*` / `sidebarApi().textareaInput|textareaBlur` /
`editorToolbarContent('textarea'…)` / `data-mode=contenteditable|textarea`): **6 files** —
`unit-live11-bridge-seams`, `unit-r-traversal-inline-children`, `sidebar-panes-host`,
`unit-u-state-1a-content-reconcile`, `unit-u-state-1a-content-reconcile-adversarial`, and
`unit-u-shell-9b-blind-greens` — of which the last two are **also** probe (i) members.
**21 ∪ 6 = 26 distinct files**, all present in §6.3's table — which **is the work list and the
authority**; a disagreement is resolved there, never silently.

**Explicitly NOT in the probe sets, and why (so the boundary is not re-derived):**
`tests/traversal.test.ts` is the **fence** (§5.1) and stays unchanged; a file that merely **imports or
constructs** `createEditController` (`≈35` files: `unit-u-state-1b-host-application`,
`unit-u-state-1c-persistent-scaffolding`, `unit-u-shell-5-resizable-gutters`, `unit-u-shell-4-drag-relocate`,
`unit-u-shell-6-hover-affordance`, and the remaining harnesses whose only editing reference is the
controller's construction) is **not** in the set, because §6.4 item 1 keeps the controller's member
set and signatures whole — **and that is the single largest deliberate non-break in this unit**; the
same holds for `template`, whose only editing references are prose comments plus the shared guard.

### 6.2 The 17 suites this unit REBUILDS (the rebuild map's `C9` row, verbatim)

`docs/specs/test-pruning-disposition-2026-09-21.md` §9.4, `C9 U-EDIT-1` row, all **17** archived under
`archive/tests/2026-09-21-<name>.test.ts`:

`unit-l-textarea-editing-ui` · `contenteditable-editor-host` · `contenteditable-caret` ·
`editing-mode-broadcast-host` · `operator-settings-editing-mode` · `rich-splice` · `rich-eligibility` ·
`unit-u-edit-1-markdown-html-toggle` · `unit-u5-set-rich-text` · `unit-m1-inline-offset-model` ·
`unit-o-edit-ops` · `unit-p-ipc-edit-batch` · `unit-n-batch-atomicity` · `unit-u-edit-2-undo-redo-history` ·
`edit-controller` · `edit-ops` · `edit-adversarial`.

**The derivation rule (binding, and it is the general rule of §9.4):** each rebuilt suite is derived
from **`docs/specs/design-extensions-review.md`** (§13.1/§13.3 the program and the one-unit-one-cycle
rule; §14.2 the re-derivation discipline) **+ this spec + the affected `docs/decisions.md` rows** —
**never** from the archived file's assertions.

**The test-local reference decode/diff is DELETED (2026-09-21 amendment, `11.9` item 1).** The rebuilt
diff suites had carried a **test-local** reference implementation of the decode and the diff (the
oracle in `archive/tests/2026-10-04-page-diff.test.ts`, which imported the in-house `src/main/rich-decompose.ts` and
documented the decode/diff itself). **That is deleted**: the package is the path, so a suite that
asserts the diff re-derives **through the adapter (`src/main/page-diff.ts`) + the package**
(`htmlToTree`/`diffTrees`) — the adapter is the module under test, and the package is the oracle for
the structural half. **A suite that re-imports `src/main/rich-decompose.ts` or reconstructs the decode
in the test file is a review finding** (it would pin a superseded premise and drift from §3.1). The
archived file is consulted only as an input to
**what the old pin covered**; its assertions are **never copied back**. **Two subjects the archived
`edit-controller`/`edit-ops`/`edit-adversarial` suites covered are deliberately NOT rebuilt here** and
must be stated as gaps, not silently dropped:

- the **per-node `markDirty`/`commit`/deleted-node refusal** behaviour is superseded (the surviving
  guard's contract is §6.4 item 1 and is re-derived from **that** clause, not from the archived file);
- the **`edit-adversarial` battery's `rag-store-changed`-through-the-per-node-ops** cases retire with
  the model they belong to; their surviving half (the broadcast on a **batch** success, exactly once)
  is re-derived from §3.4 step 4 and `docs/specs/unit-import-batch-persist.md` §2d.

### 6.3 The 26 suites this unit REWRITES (and the pinned shape of each rewrite)

**Pinned rewrite shape — one of four, and the choice is the whole content of the rewrite (never a
relaxation to keep a suite green):**

- **R-A — drop the removed control token.** Remove the `editingMode` key from the harness's
  `OperatorSettings` literal; if the suite **asserted** the mode, it now asserts the **successor**
  representation mode (`'html' | 'markdown'`) and the **single-surface** invariants (`FS1`/`FS2`).
- **R-B — repoint a mode/control assertion to the successor.** `editorToolbarContent`'s mode literal,
  `data-mode`'s `contenteditable|textarea`, and `editingModeLabel`'s `Markdown|HTML` mapping are
  repointed to the **representation** mode (§2.3/§2.5). **The old label semantics are NOT preserved
  under a new name** (that would keep a live token the supersession voids).
- **R-C — drop the removed textarea API.** A suite calling `sidebarApi().textareaInput/textareaBlur`
  (or asserting `type: 'textarea'` children, `rag-textarea-*` defs, `textarea-<ragId>` ids) is
  re-derived to drive **the page surface's** own handler names and to assert the **single surface**
  plus the **zero-rendered-textarea** invariant (§5.1's resolution is now **no textarea child is
  authored at all**, so the assertion is on **absence** — an authored `type: 'textarea'` child is
  `FS21`, not an "inert" artifact to be tolerated).
- **R-D — keep the subject, change the harness only.** A suite whose **subject is unaffected** (a pane
  layout test, a doc-nav test, a settings-listing test) keeps its assertions **verbatim** and changes
  only the construction literal/token that the removal breaks. **This is the ONLY rewrite shape that
  may leave an assertion untouched** — and it may do so only where the assertion's subject is not the
  editing surface.

| # | File | Shape | The clause it is re-derived from |
| --- | --- | --- | --- |
| 1 | `unit-u-shell-9b-h3-doc-namespace` | R-C | §5.1 (no textarea child is authored at all; the id-namespace rule for `textarea-` ids is superseded by the single surface's own id) |
| 2 | `unit-live8-toolbar-undo-refresh` | R-B | §2.3/§2.5 (the toolbar's mode control + `editorToolbarContent`'s argument) |
| 3 | `unit-live11-bridge-seams` | R-A/R-D | §6.4 item 1 (the surviving dirty-edit guard's behaviour is unchanged; only the literal moves) |
| 4 | `unit-v3-doc-heads-docnav-adversarial` | R-A/R-D | same |
| 5 | `unit-u-shell-9a-main-focus-tabs` | R-A/R-D | same |
| 6 | `unit-wave-1-bridge-wiring` | R-A/R-D | same |
| 7 | `unit-u-shell-3-collapsible-panes` | R-A/R-D | same — **and the O-9 pin set is NOT touched** (§9) |
| 8 | `unit-v3-doc-heads-docnav` | R-A/R-D | same |
| 9 | `unit-u-parity-c18-advanced-search` | R-A/R-D | same |
| 10 | `unit-h8-operator-editor` | R-A/R-D | same (the operator/manage surface stays **host-owned and untouched**, `docs/specs/test-pruning-disposition-2026-09-21.md` §3.3.3) |
| 11 | `unit-u-parity-docnav` | R-A/R-D | same |
| 12 | `blind-unit-v3-doc-heads-docnav-greens` | R-A/R-D | same — a **blind battery**; its rewrite is a re-run, not a re-authoring of its oracle (`docs/specs/test-pruning-disposition-2026-09-21.md` §3.4's blind-battery note) |
| 13 | `unit-live4-empty-store-landing` | R-A/R-D | same |
| 14 | `unit-u-shell-1-w2n1-layout-boot-writethrough` | R-A/R-D | same |
| 15 | `unit-live4-adversarial-fix` | R-A/R-D | same |
| 16 | `unit-u-shell-9b-cross-document-shared` | R-C | §5.1 + the dirty rules of `docs/specs/design-extensions-review.md` §12.4 (a dirty page is never replaced) |
| 17 | `unit-u-shell-9b-h2-c20-materialization` | R-C | §2.1 (the C20 owners box no longer affects **rich-eligibility** — there is no per-node gate; the "is this root editable" assertion is replaced by the single-surface cardinality assertion) |
| 18 | `unit-ms5-settings-listing` | R-A/R-D | same |
| 19 | `unit-u-shell-9b-w2n15-rederive-scope` | R-C | §2.1 + §3.4 step 4 (the id census the suite filters over the `rag` / `textarea` / `inline` id classes loses the `textarea` class) |
| 20 | `unit-u-shell-9b-h1-optionc-interception` | R-C | §5.1 + §3.3 (every per-node textarea edit becomes a page commit) |
| 21 | `unit-u-parity-c19-hover-preview` | R-A/R-D | same (hover preview is untouched by the mode field) |
| 22 | `unit-u-shell-9b-blind-greens` | R-C | §5.1 + §3.3 (the largest rewrite: every `textareaInput/Blur` edit becomes a page edit + commit) |
| 23 | `unit-r-traversal-inline-children` | R-C | §5.1's removal + `DECIDED: RICH-TEXT-EDITING-GATE` item (the inline-children ordering pin survives as `[inline children, doc-children]` — the `textarea` child **no longer exists at that position**, per the re-planned fence row) |
| 24 | `sidebar-panes-host` | R-C/R-D | §5.1 + §6.4 item 1 (the `textareaBlur`-is-a-function assertion is replaced by the page-commit seam's own assertion) |
| 25 | `unit-u-state-1a-content-reconcile` | R-D | §3.5 item 6 (the warning/state carrier is host-side; a content reconcile preserves it) |
| 26 | `unit-u-state-1a-content-reconcile-adversarial` | R-D | same |

**The work list is rows 1–26 — `26 distinct file names`, one file per row.** **`createEditController`-only
harnesses are deliberately KEEP**, per §6.4 item 1: `unit-u-state-1b-host-application`,
`unit-u-state-1c-persistent-scaffolding`, `unit-u-shell-5-resizable-gutters`, `unit-u-shell-4-drag-relocate`,
`unit-u-shell-6-hover-affordance`, `template`, and the remaining controller harnesses. *(The first
draft of this table carried a larger number reached by repeating two names and by including
`createEditController`-only files; the reconciliation is recorded here instead of hidden, and
**item 10d must recount from this table**, which is the work list —
`docs/specs/test-pruning-disposition-2026-09-21.md` §9.2's rule. **§6.1's class counts carry the same
figure: REWRITE 26 / KEEP 137 / REBUILD 17 / DELETE 0** (17 + 26 + 137 = 180).)*

### 6.4 What the rewrite MUST NOT become (the pinned non-regressions)

1. **The `EditController` interface stays whole.** `src/renderer/edit-controller.ts`'s
   `EditController` (`markDirty`/`clearDirty`/`isDirty`/`anyDirty`/`isEditable`/`commit`/`requestRebuild`/
   `hasQueuedRebuild`/`saveCaret`/`restoreCaret`/`clearCaret`) **keeps its member set and signatures**,
   because **35 files under `tests/**` construct it** as the harness's dirty-edit guard and several
   assert its queued-rebuild behaviour **as their subject** (`sidebar-panes-host`, `unit-u-shell-3-collapsible-panes`,
   `unit-live11-bridge-seams`). **What changes is the argument's MEANING, not the members:** the
   content path passes the **tab id** (one page dirty per tab), and the caret is page-scoped (§2.1).
   **Consequence pinned:** a rewrite that reshapes the controller's members reddens 35 files for no
   contract reason — a review finding. The deleted-node-refusal branch (`commit` returning
   `{ ok: false, reason: 'deleted-node' }` for a dangling back-reference) is **retained** as the
   deleted-document guard (the same branch, a page-scoped subject).
2. **No rewrite may relax an assertion to make a suite green.** The four shapes in §6.3 are the only
   permitted changes; a `skip`/`todo`/loosened matcher is a review finding (`DECIDED:
   REBUILD-ARCHIVE-POLICY` clause 1: archived, not adapted).
3. **The fence suites are not in the rewrite set** (`tests/traversal.test.ts`,
   `tests/import-render-no-duplicates.test.ts`): they stay **green** and are **never** cited as this
   unit's green (`docs/specs/design-extensions-review.md` §14.2) — **with the single authorized
   exception of `tests/traversal.test.ts`'s child-list row, which is RE-PLANNED under the 2026-09-21
   ruling (§5.1; §6.5; §11 amendment `11.9` item 2). The exception is one row in one file and licenses
   nothing else.**

### 6.5 The RED-SET plan (RCA-1: tests FIRST, red RUN and REPORTED)

**Four obligations, each RED today (the red set must contain all four), plus the fence as a GREEN
control.**

1. **The single surface (red: today N independent `[contenteditable]` hosts per document — the live
   census in `docs/defects.md` `WHOLE-PAGE-EDITING-REQUIREMENT` records `{P:10}` hosts and 0 editable
   headings).** New suites assert: EXACTLY ONE `[contenteditable]` root in the stage region per open
   document tab; the surface's authored id/marker; the head element as a sibling of the body's first
   block; no `contenteditable` prop on any RAG subtree root.
2. **The diff + the one-batch commit (red: no adapter module exists — nothing imports the ADOPTED
   package yet, the decode/diff is test-local (`archive/tests/2026-10-04-page-diff.test.ts`); and `src/main/rag-store.ts`
   `applyBatchOp` returns `op not supported` for `setProps`/`setSubtree`/`setType`, so a whole-page
   commit containing a type change cannot succeed today).** New suites assert §3.2's closed field set,
   the minimal-op rule, the new-block/new-node representation, the **adapter's change-kind→op mapping
   and its refusal of an unmappable kind into the `FS5`/`ST-5` warning class** (§3.1), the
   one-`applyBatch` call, the single
   `batch` journal entry, the one persist, and the rollback on `{ ok: false }`.
3. **The state machine + the warning (red: no `commit-failed` state, no typed failure record, no
   warning).** New suites assert the four-state machine, the typed `CommitFailure`, the store
   unchanged on failure, the text preserved, and the warning's **survival across a re-derive** (the
   re-derive is driven in the test; the state must be unchanged after it).
4. **The textarea removal + the successor mode (red: textarea editing is live — `EDIT-MODE-TEXTAREA-UI`
   is OPEN; the mode control swaps controls).** New suites assert: **no `type: 'textarea'` child is
   authored anywhere** (and no `textarea-<ragId>` id, no `rag-textarea-*` handler name — §5.1), the
   rendered-DOM-count assertion is **zero `<textarea>`** in the stage region in both modes, markdown
   mode is plaintext with **no** inline formatting elements, and the removed `editingMode` field is
   **absent** from `OperatorSettings` while the successor mode is present and persists through the
   `DECIDED: UI-CONFIG-CARRIER` operator state.

**The rows the 2026-09-21 amendment (surface's layer) re-derives (§11 amendment `11.7`).** The
surface is authored at the app-graph/stage-assembly layer (§2.1), so every **envelope-shape** row
that reads the **traversal envelope** for the surface is re-derived against the **app-graph render**:

- `archive/tests/2026-10-04-single-editable-surface.test.ts` — the **surface-shape rows** (`surfaceRoots` /
  `envelopeNodes` over a `buildTraversal` result, including the `state S5` authoring row and the
  `FS1` unsurfaced-block row, and the `within`-the-surface subtree rows) are **re-derived** to
  read the **`assembleAppGraphEnvelope` result** (the assembled app graph: registry + ctx + the
  traversal envelope), not the traversal envelope;
- the **per-node-host rows** in the following rewritten suites are re-derived to assert the
  single-surface cardinality on that same app-graph render: `unit-u-shell-9b-h1-optionc-interception`,
  `unit-u-shell-9b-h2-c20-materialization`, `unit-u-shell-9b-blind-greens`,
  `unit-r-traversal-inline-children`.

**The fence suites: one is NOT re-derived, one row IS (the authorized re-plan).** `tests/traversal.test.ts`'s
**child-list assertion** (`[undefined, 'textarea-ul', 'rag-li1', …]`) is the row the owner has
**authorized re-planning** (§5.1; §11 amendment `11.9` item 2) — and it is the **ONLY** fence change
this unit may make: **that file and that row, nothing else**, so the fence's other pins and the whole of
`tests/import-render-no-duplicates.test.ts` stay untouched. The **recorded re-plan shape** (pinned):
the row asserts the authored child list **without the `textarea-<ragId>` entry** — `[undefined, 'rag-li1', …]`
for the `ul` subtree root — because the traversal authors **no** textarea child at all; the row's
*subject* (the child ordering at that position) is unchanged, only the removed artifact leaves the list.
A pass that instead **rewrites the fence's other assertions, edits the other fence file, or re-derives a
different row** is a review finding. `tests/import-render-no-duplicates.test.ts` **stays untouched** and
remains a pure control.

**The fence as a control.** `tests/import-render-no-duplicates.test.ts` **and every
non-child-list row of `tests/traversal.test.ts`** must appear in the red run as **GREEN controls**;
writing either suite into the red set as a failure — outside the one authorized child-list row — is a
review finding (`docs/specs/unit-import-batch-persist.md` §5.2's control discipline for the same
fence).

**The recorded report shape** (RCA-1): the unit's DONE row carries
**"TestWriter red: N failing (…)"** verbatim, then **"Implementer green: N pass"**, with the layer
(§10) and the contract regime (§9.3).

---

## 7. §5.x TYPED PROPERTY REGISTER (7 rows; P-IM / P-SM / P-TP)

**Shared machinery (pinned once, binding on every row):**

- **Seed:** deterministic, pinned **`0xED170001`** (a fixed literal in the harness; never
  `Date.now()`, never a random default, never an environment read).
- **Budget:** **≤100 attempts per row, ≤400 total**, allocated as **63 × 6 + 22 = 400** — six rows
  carry **63** attempts and row **`P-SM-1`** carries **22** (its draws are *outcome* draws over a
  small, fully enumerated failure set rather than shape draws, and every one of its failure modes is
  enumerated in §3.5/§8.1 rather than generated).
- **Stop-after-5:** each row reports at most **5 distinct held-or-broken cases**; a `broken` row
  reports the counterexample, the shrink, and the failing generator class.
- **Reporting:** each row lands **`held`** or **`broken`** with its attempt count; the audit is
  **read-only** and performed by an agent that did not author the rows (RCA-3 / item 10d).
- **Control-draw reporting (REQUIRED):** every row carries an explicit **control draw** whose
  expected outcome is the *opposite* of the row's verdict, and the row is only `held` if the control
  **discriminates** (the `docs/specs/unit-import-batch-persist.md` `P-IM-1` pattern: "the failing
  controls are … (proves the counter discriminates)").
- **Class meaning (this unit's usage):** `P-IM` = an invariant of the diff/commit data model;
  `P-SM` = a safety property over the commit's state transition; `P-TP` = a totality/determinism
  property.
- **The generator must never be weakened to make a row pass**, and each row names its **negative
  generator** (the draw that must FAIL the row).

| # | Class | Invariant | Strategy | Oracle (what a draw asserts) |
| --- | --- | --- | --- | --- |
| **`P-IM-1`** | IM | **The op list is a function of the diff, and it names only changed nodes.** For ANY (page, store) draw, for every node id in the op list there is a compared field (§3.2 — `type`, `content`, `children` **or `props`**) whose value differs; and for every block whose compared fields are all equal, **no** op names it. **AMENDED PROPOSITION (§11 amendment `11.9` item 5 — the adversarial pass found the population could not express a `props` difference AT ALL): the population MUST contain at least one PROPS-ONLY change** (a RAG-owned prop added / changed / removed on exactly one block, page text unchanged), so the `setProps` mapping (§3.1) has an oracle; and it MUST contain at least one **runtime-prop-only** change, which is the discriminating control. | `strat:diff-minimality` — draw a store of N blocks (N ∈ {1, 2, 7, 40}) and a page derived from it by mutating a random subset S of blocks over the closed field set (empty S allowed), **stratified so that each of the four compared fields is exercised at least once per run, with the props arm drawn in BOTH its RAG-owned and its runtime-only form** | every op's node id ∈ S (or is a minted new-block id, or is the containment edge of one); **zero** op ids name an unchanged block; **a props-only change on a block yields exactly one `setProps` op naming that block** (the amended arm — a props difference with no op is the row's `broken` finding); a **runtime-prop-only** change yields **no** op (`FS8`); `S = ∅ ⇒ ops = []` (the **control**: a draw with S = ∅ must produce an empty list, proving the row is not vacuous) | pure |
| **`P-IM-2`** | IM | **One commit = one `batch` journal entry, and the entry is invertible to the pre-commit state.** **AMENDED PROPOSITION (§11 amendment `11.8`, remedy (a) — the population is restricted to NON-EMPTY mutation subsets):** for ANY draw **whose mutation subset is `S ≠ ∅`**, after a successful commit `journal()` gained exactly one entry of kind `batch`, and applying its `inverse` (in order) restores the store's nodes/edges **deep-equal** to the pre-commit snapshot. The `S = ∅` draw is **outside this row's population** — it is this row's **control**, and it is `P-TP-2`'s proposition (an empty op list ⇒ journal delta 0, persist delta 0, state `clean`), so the two rows no longer state contradictory oracles. **The invariant itself is NOT weakened:** on its (non-empty) population the row is exactly as strong as before; only an out-of-population draw is excluded, and the exclusion is recorded here, never silently relaxed. | `strat:commit-journal-invertibility` — draw a **non-empty** mutation subset `S ≠ ∅` over the §3.2 field set (including a new block and a removed block), commit it against a real temp store, snapshot before/after, then undo | journal delta == 1 and its kind == `batch` for `S ≠ ∅`; `undo()`-equivalent inverse application yields a store deep-equal to the snapshot; the **control** is a commit whose op list is empty (`S = ∅` — journal delta must be **0**: the `P-TP-2` proposition, not a violation of this row) | store (real temp fs) |
| **`P-IM-3`** | IM | **The type apply never delete+recreates.** For ANY type change draw, the target node's `id`, `createdAt`, `children`, `props` and `ownedNodeIds` are unchanged and **only** `type` moves; no `removeNode` op for the target appears in the op list. | `strat:settype-preservation` — draw a node (every `RagNodeType` member × a props/children-carrying variant) and a target type ≠ its current one (including a `td`→`th` change and a type change on a node with inline children) | post-commit node: `id`/`createdAt`/`children`/`props`/`ownedNodeIds` deep-equal the pre-commit values; `type` == the drawn target; **no** `removeNode` or fresh-id `putNode` for that node; the **negative generator** is a delete+recreate implementation, which MUST fail the row | store (real temp fs) |
| **`P-SM-1`** | SM | **A failed commit is atomic and loud.** For ANY failing outcome, the store is deep-equal to its pre-commit state, **zero** persists occurred, the journal is unchanged, the tab is `commit-failed` with a typed `CommitFailure`, and the page's text is preserved. **AMENDED PROPOSITION (§11 amendment `11.9` item 5 — the adversarial pass found this row never CONSTRUCTED a `commit-failed` state and never DREW three of the five pinned failure kinds): the population is the FULL enumerated `CommitFailure.kind` set — ALL FIVE kinds** — `not-authorized`, `not-resident`, `engine-unavailable`, `store-rejected`, `decompose-failed` — **each constructed and observed at least once**, with `store-rejected` drawn over **≥2 distinct `failedIndex` values** (including a non-zero index) and `engine-unavailable` drawn over **≥2 of its four `engineCause` members**; **a run that does not construct the `commit-failed` state for every one of the five kinds has not exercised the row** (the previous form's vacuity). | `strat:commit-failure-atomicity` — draw the failure **kind** (all five, enumerated, never sampled away) × the `failedIndex` (for `store-rejected`) × the `engineCause` (for `engine-unavailable`) × a page/store pair; each draw reads the store file's bytes before and after, and re-reads the host-side `Map<tabId, failure>` after the commit | bytes before == bytes after; `persist` count == 0; journal delta == 0; **state == `commit-failed` in EVERY draw** (a draw that ends `clean` is the row's `broken` finding); `failure.kind` **equals** the drawn class and the record is present in the host-side map; the text is still on the page; the **control** is the SAME page/store with the **success** draw, which MUST change the bytes; the **negative generator** is a commit that persists (or that clears the state) on failure, which MUST fail the row | store (real temp fs) + pure |
| **`P-SM-2`** | SM | **The warning survives every re-derive.** For ANY commit-failed state and ANY re-derive path (a store-change-driven re-derive, a content reconcile, an operator/template re-derive), the tab's state is still `commit-failed` with the same `CommitFailure`, **and** the page's text is unchanged. **AMENDED PROPOSITION (§11 amendment `11.9` item 5 — the adversarial pass found this row was a TAUTOLOGY with a CONSTANT control: the state was never made distinguishable from the default, so "unchanged" could not fail and the "successful commit ⇒ `clean`" control read the same constant): the row now carries a DISCRIMINATING WITNESS** — the assertion is over the **full failure-record equality** (`kind` + `message` + `failedIndex`/`engineCause` where present) of the **constructed** `commit-failed` state, **against a tab that is concurrently `clean` and a tab that is concurrently `uncommitted`**, so an oracle that returns a constant fails the row. | `strat:warning-rederive-survival` — draw the failure **kind** (all five, §`P-SM-1`) × each re-derive path (including one that replaces the envelope wholesale), plus the two concurrent witness tabs (`clean`, `uncommitted`) in the SAME draw; re-read the state after every path | state after the re-derive == the constructed state, **and the full failure record deep-equals the constructed record**; the `clean` witness tab is still `clean` and the `uncommitted` witness is still `uncommitted` (**the discriminating control**: an oracle that returns the constructed state unconditionally reads the wrong value for the two witnesses and MUST fail the row); the rendered text still carries the user's marker; the **control** is a *successful* commit on the same tab, after which the state must be `clean` **and the map entry must be DELETED** | pure + assembled (envelope-level) |
| **`P-TP-1`** | TP | **The decode + diff are TOTAL and DETERMINISTIC.** For ANY input — a malformed page HTML, an empty page, a page with a block whose `data-rag-node-id` is unknown, a page with duplicated ids, a page containing a `<textarea>`, a store missing the doc-head, a store with a quarantined node — the pipeline terminates with either a valid op list or a typed failure, **never** a throw of a native `TypeError`, and the **same** (page, store) draw yields the **same** op list on a second run. | `strat:decode-total-deterministic` — draw the malformed-shape matrix over the page HTML and the store state; run each draw twice | every draw returns a discriminated result (op list or `CommitFailure`); `expect(() => …).not.toThrow()` holds; run-1 ops deep-equal run-2 ops; the **negative generator** is a nested-10 000-deep element tree, which must not exhaust the stack (the decomposer is iterative — ADR-4; the depth draw is the **boundary** and is capped by the row's budget; **the decomposer reached through the adapter is the PACKAGE**, whose own read guard is the pinned `MAX_DEPTH = 512` in `provident-editable`'s converter — so the draw must terminate through the adapter's typed failure arm, never a stack exhaustion) | pure |
| **`P-TP-2`** | TP | **Idempotence: a commit of an unchanged page is a no-op.** Committing twice with no edit between leaves the store deep-equal after the second commit, with **zero** additional journal entries and **zero** additional persists; and a no-op commit never sets `commit-failed`. | `strat:empty-diff-idempotent` — draw a page, commit, then re-decode the committed store and commit again (the second op list must be empty); plus a draw that perturbs only *uncompared* DOM detail (whitespace between blocks, a class list, a runtime prop) | second commit: op list `[]`, journal delta 0, persist delta 0, state `clean`; the **control** is a commit with one compared-field change, which MUST produce a non-empty op list | store (real temp fs) |

**Class tally:** IM ×3 (`P-IM-1`..3), SM ×2 (`P-SM-1`..2), TP ×2 (`P-TP-1`..2) = **7 rows ≤ 8** ✔.
**Budget tally:** 63 × 6 + 22 = **400 attempts total**, every row ≤ 100 ✔, stop-after-5 ✔,
control-draw reporting ✔.

**Register adjudication (§11 amendment `11.8` — `P-IM-2` vs `P-TP-2`).** `P-IM-2`'s population is
restricted to the **non-empty** mutation subset (`S ≠ ∅`), stated in the row's own proposition. The
remedy taken is **(a) — restrict**, not **(b) split**, so the row count stays **7**, the seed stays
**`0xED170001`**, the stop-after-5 rule is unchanged, and **the budget does NOT re-tally**:
`63 × 6 + 22 = 400`, with `P-IM-2` keeping its **63** attempts (the restriction removes an
out-of-population draw, never a row, and no attempt is moved between rows). `P-TP-2` is **unchanged**
and is the authority for the `S = ∅` draw.

**Register amendments for the three rows the adversarial pass found VACUOUS (§11 amendment `11.9`
item 5).** The pass recorded three vacuity findings — **`P-SM-1` never constructed a `commit-failed`
state and never drew three of the five pinned failure kinds; `P-SM-2` was a tautology whose `clean`
control read a constant; `P-IM-1`'s population could not express a `props` difference at all** — and
the three propositions/populations above are amended so each is **falsifiable**. **The row count stays
7; the seed stays `0xED170001`; the per-row ceiling stays ≤100; the total is unchanged at
`63 × 6 + 22 = 400`.** The **allocation is re-tallied WITHIN `P-SM-1`'s 22 attempts** (an internal
re-allocation: 4 draws per failure kind × 5 kinds = 20, plus 2 controls), so **no row gains or loses
attempts and no other row's budget moves** — this is a recorded re-tally of the *allocation*, **not** of
the total; `P-SM-2` keeps **63** and `P-IM-1` keeps **63**. Each amended row's **negative generator** is
stated inside the row, and each row is `held` only if its control **discriminates**.

**Rows considered and REJECTED (recorded so a later pass does not re-add them):**

- *"markdown mode renders monospace and no html formatting"* as a register row — **rejected**: it is a
  **painted/rendered** property with **no node oracle** (the dom-shim is layout-less/CSS-less,
  RCA-12). It lives in the **live battery** (§8.3 item 4) as a `D-visual` assertion with a painted
  oracle (`DECIDED: D-GP-UFA-2`; `proxyPASS:true` is invalid).
- *"the caret crosses the boundary without a re-mount"* as a register row — **rejected**: a selection
  is structurally unassertable in node; it is the live battery's §8.3 item 2.
- *"no textarea exists anywhere"* as a **register** row — **rejected as a PBT row** because the check
  is a **census over a fixed artifact set** (envelope + rendered DOM), not a generated property; it is
  pinned as `FS21`, asserted by §6.5 item 4 and the live battery's §8.3 item 7.
- *"a commit writes only changed sub-elements"* — **KEPT** as `P-IM-1` (it is the diff's own invariant
  and has a clean generated oracle; its population was amended on 2026-09-21 to draw a **props**
  difference — §11 amendment `11.9` item 5).

---

## 8. FAIL-STATES, PROCESS, LIVE BATTERY

### 8.1 Fail-states (each is loud: it names the node / the key / the rule it violates)

| # | Fail-state | Observable + the exact rule violated |
| --- | --- | --- |
| **`FS1`** | **More than one `contenteditable` root, or a body element outside the single surface** | the `[contenteditable]` census in the stage region and the un-surfaced block id are printed; **§2.1**. **Restated in app-graph/stage terms:** the census is taken over the **assembled app-graph render** (the `assembleAppGraphEnvelope` result the renderer loads) **and the DOM** — the surface root must be the ONLY `contenteditable` authoring point in that assembled graph and must contain every document-body block the stage renders. **The traversal envelope is NOT an assertion surface for `FS1`** (it authors one payload root per section and no surface, so an envelope-level check neither proves nor disproves this fail-state — §2.1/§11 amendment **11.7**). |
| **`FS2`** | **A caret addressed to a per-node root** (a `CaretState` whose target is not the page surface) | the node id and the caret's target are printed; **§2.1** (the caret is page-scoped) |
| **`FS3`** | **A commit stripped `data-doc-head`** (a wholesale props write instead of a merge) | the node id before/after and the missing marker are printed; **§2.2 item 3** (`setProps` MERGES) |
| **`FS4`** | **The element-type pane offered a type outside `RagNodeType`**, or applied a type the store rejects | the offered type and the closed union are printed; **§2.4 item 1** |
| **`FS5`** | **An element-type apply with no resolvable target wrote to an arbitrary node** (instead of the pinned no-op) | the caret path, the resolved id and the written id are printed; **§2.4 item 3** |
| **`FS6`** | **A type change implemented as delete + recreate** (id/`createdAt`/children/edges lost) | the old id, the new id and the lost fields are printed; **§2.4 item 4** (`setType` never delete+create) |
| **`FS7`** | **A malformed page input produced a partial write** (a typed failure was treated as an empty edit) | the failure arm's error/message and the op list are printed; **§3.1** (the adapter's typed failure — a package throw or an unmappable change kind ⇒ the `FS5`/`ST-5` warning class, **never** a partial write; §11 amendment `11.9` item 1) |
| **`FS8`** | **A compared field outside §3.2's closed set** (a runtime prop / `updatedAt` / a representation-mode difference entered the diff) | the field name and the op are printed; **§3.2** |
| **`FS9`** | **An unrelated node appeared in the op list** (churn on nodes the user did not touch) | the untouched node id, its op and the diff that excluded it are printed; **§3.2's minimal-op rule** |
| **`FS10`** | **The commit was not one `applyBatch`** (a per-op loop, `store.enqueue`, or per-node `putNode` calls) | the observed call count and the store method names are printed; **§3.3 item 1** |
| **`FS11`** | **A commit landed as ≠ 1 journal entry, or as a non-`batch` kind** | the journal delta and the kinds are printed; **§3.3 item 3** |
| **`FS12`** | **The commit ignored the `BatchResult`** (proceeded on `{ ok: false }`) | the result and the post-commit store diff are printed; **§3.3 item 6** |
| **`FS13`** | **A new block reused an existing node id** (a collision minted by the commit) | the reused id and the pre-existing node's `createdAt` are printed; **§3.3 item 8** |
| **`FS14`** | **A `removeNode` for a node the user did not empty** (a transiently unmounted block read as a deletion) | the node id, its text and the diff are printed; **§3.3 item 8** |
| **`FS15`** | **A chunked commit** (more than one engine/store write that can fail between chunks, losing the user's text) | the chunk boundaries and the text observed between them are printed; **§3.4 step 7** |
| **`FS16`** | **A failed commit discarded the user's text** | the failure record and the vanished text are printed; **§3.5 item 2** |
| **`FS17`** | **The warning was absent after a re-derive, or existed only as a DOM class/attribute** | the tab id, the re-derive path and the observed carrier are printed; **§3.5 item 6** |
| **`FS18`** | **A failed commit was auto-retried** (a retry loop with no user action) | the tab id and the retry count are printed; **§3.5 item 7** |
| **`FS19`** | **A commit reported success without an acknowledged write** (a silent success; the worst outcome in this unit) | the reported outcome and the store's actual state are printed; **§3.6** |
| **`FS20`** | **A stale persisted `editingMode` restored the removed behaviour** (a boot read the removed key and rendered a textarea/legacy control) | the stored key, its value and the rendered control are printed; **§5 item 5** |
| **`FS21`** | **A rendered `<textarea>` in the stage region, or ANY authored `type: 'textarea'` child / `textarea-<ragId>` id / `rag-textarea-*` handler name anywhere in the authored envelope or the DOM** | the element's id, its parent, its handler names and the authoring site are printed; **§5.1** (the whole textarea path is removed: **no** textarea child is authored at all, and the rendered census is zero — the tombstone exception is retired, §11 amendment `11.9` item 2) |
| **`FS22`** | **A markdown-mode surface rendered HTML formatting** (an inline `strong`/`em`/`a`/`img` element, a heading at heading scale, table markup, or a form control in the stage) | the element, its computed family/style and the mode are printed; **§2.3** |
| **`FS23`** | **A dirty page was evicted, invalidated or replaced** (the user's only copy of the text was discarded by the cache's rules) | the tab id, its dirty state and the offending event are printed; **§4.5** / `docs/specs/unit-reads-pivot-tab-cache.md` §5.1's dirty-entry rule |
| **`FS24`** | **A commit reached a non-resident document without the typed `CacheMiss`-class refusal** (a silent whole-store read on the commit path) | the key, the path and the outcome are printed; **§3.6** / `docs/specs/unit-reads-pivot-tab-cache.md` §3.3 |

### 8.2 The unit's process (binding; RCA-1/RCA-2/RCA-3/RCA-6/RCA-11/RCA-12)

1. **This spec** — the contract. **No code before a TestWriter red set.** ✔ (this file)
2. **TestWriter RED, RUN and REPORTED** (`AGENTS.md` item 3 / RCA-1). The red set is derived from
   §2–§7 **of this file** (the four obligations of §6.5) + this file's **24 fail-states as named
   assertions** (`FS1`…`FS24`) + the §7 register rows. The report is recorded verbatim in the unit's
   DONE row. The fence suites (§6.4 item 3) appear as **green controls**.
3. **Implementer GREEN** — the least code that makes the recorded red set pass, **on its own cycle**
   (RCA-2: this unit's cycle never shares an inline run with `C10 U-TAB-MERGE`, `C8 U-STAGE-TYPE`,
   `U-READS-PIVOT` or any P2 unit).
4. **The trio** (`AGENTS.md` item 4): `npm test`, `npm run typecheck`, `npm run build` — reported as
   this unit's green, with the re-derived suite list and the resulting **coverage reading**
   (files / passed / skipped / failed) recorded. `docs/specs/unit-import-batch-persist.md` §5.1's
   **15 000 ms suite budget** and its depth-10 000 tenant (`tests/unit-v5-migration-contract.test.ts`
   Pin 4 / `tests/unit-u2-rich-decompose.test.ts`'s `DEEP_ROWS`) are **protected** — this unit adds
   **no** new deep-totality row (`docs/specs/test-pruning-disposition-2026-09-21.md` §5.3 names
   exactly this hazard for the `C9`/`C10` units). `P-TP-1`'s depth draw is capped by its own budget.
5. **READ-ONLY adversarial pass** (RCA-3), hunting at minimum: a second editable host; a body element
   outside the surface; a caret restored onto a per-node root; a props write that strips
   `data-doc-head`; a delete+recreate type change; an unrelated node in the op list; a per-op loop or
   a second persist; a journal delta ≠ 1; an ignored `BatchResult`; a new-block id collision; a
   transient unmount read as a deletion; a chunked engine write; a discarded text; a DOM-only warning;
   an auto-retry; a silent success; a stale persisted mode; **any authored `type: 'textarea'` child,
   `textarea-<ragId>` id or `rag-textarea-*` name (the tombstone path is dropped — §5.1, §11 amendment
   `11.9` item 2)**; a rendered `<textarea>`; an HTML-formatted markdown mode; a dirty page replaced by the cache; a silent
   non-resident commit; **an adapter that silently drops an unmappable package change kind or a
   package throw instead of raising the `FS5`/`ST-5` warning class; a `props` difference that produces
   no op; a block with inline children producing a spurious op (the raw-package-`content` projection
   error); a stored `td`/`th`/`tr`/`table` node retyped or removed on the strength of a decode that
   cannot see it**; **and the register's negative generators.** Findings are recorded in this
   file's §3a/§3b (appended) and **every host-side finding is fixed here + regression-tested**; a
   `provident-ssr` package finding is a **handoff** item (`docs/defects.md` + `docs/HANDOFF.md`,
   `AGENTS.md` item 7) and is **never** patched — **and a finding in the ADOPTED
   `provident-editable@0.2.0` is the same handoff class, never a patch here** (§11 item 9). **Its PBT-audit half reports each §7 row
   `held`/`broken` with its attempt count and its control draw (stop-after-5).**
6. **RCA-4 blind greens** by an agent that did not implement: a `-greens.md` artifact derived from
   **this spec only** (no implementation read).
7. **item-10d documentation review** (RCA-6), recorded at
   **`archive/reviews/<date>-unit-u-edit-1-doc-review.md`**: it reconciles every symbol, signature,
   return shape, throw pattern and census claim here against the actual build (notably the
   `decomposeRichHtml` result shape — **superseded: the doc review now reconciles the ADAPTER
   (`src/main/page-diff.ts`) + the package signatures (§3.1)** — the `BatchOp` union, the
   **23-member `RagNodeType`** census, the
   `EditorController` interface, the **17/26/137/0** test-disposition counts and their stated probes),
   reconciles the active trackers (including the `SUPERSEDED` rows of §4.1 having landed **with** the
   code), reconciles cross-references and section numbers, **repoints the stale citations this unit
   owns** (§9.4), and **fixes stale entries in the same pass**.
8. **The DONE row** states the unit, the date, **the layer** (RCA-12), the **contract regime**
   (§9.3), the **recorded red set**, the **adversarial findings' location**, the **doc-review record
   path**, and the **live-battery result** (§8.3).

### 8.3 The live battery mandate (RCA-11 — MANDATORY, decided explicitly)

**This unit CHANGES RENDERED BEHAVIOUR** (the stage's editing surface, the caret's movement, the
mode's rendering, the warning's visibility), so per RCA-11 the live battery is **MANDATORY — not
parked and not recommended**. Parking is legal only for a **structurally non-exercisable** surface
with the recorded reason; **there is no such surface here**: the stage, the tab surface and the
document DOM are all reachable through `scripts/live-drive.mjs`'s MCP + CDP path on a usable display.

**The blocks MUST be authored, and that is an OWED item — not a side effect (§11 amendment `11.9`
item 6).** Every assertion below must be **added to `scripts/live-drive.mjs`** as its own block(s)
(the battery's identifier is **`U-EDIT-1-LIVE`**, per item 8). **The consequence, stated explicitly:**
`scripts/live-drive.mjs` is **half of the O-0 oracle-hash pair** (`docs/specs/requirement-catalog.md`
§2.2 fact 3; `docs/specs/design-extensions-review.md` §6.2/§7.2), so **adding blocks invalidates the
recorded oracle identity and owes an O-0 re-run per RCA-11** — the pair's before/after hash re-read must
be re-recorded by a pass that **actually runs it**. That obligation is recorded as an **owed item**
(§11 amendment `11.9` item 6): it is **not** this spec's measurement, **not** an incidental edit inside
this unit's diff, and **not** a reason to defer the battery. `src/shared/o0-report.ts` — the other half
of the pair — **must not be touched at all** by this unit (the oracle-identity paragraph below).

**What the live battery asserts (in `scripts/live-drive.mjs`'s existing block discipline):**

1. **Whole-page selection spans paragraphs.** A real hit-tested gesture selects from a position in
   one paragraph to a position in the next; the observed `Selection` has **one** range whose
   `startContainer` and `endContainer` are **different block elements** inside the **same**
   `contenteditable` root. *This is the discriminator the node suite cannot see (RCA-12) and the
   defect `WHOLE-PAGE-EDITING-REQUIREMENT` names.*
2. **Heading → body caret movement with the arrow keys.** With the caret at the end of the doc-head
   element, an `ArrowDown` key event lands the caret inside the body's first block; `ArrowUp`
   returns it inside the head; **the surface element's identity is unchanged across both movements**
   (same `data-node-id`/marker; no re-mount), asserted by comparing the surface element's identity
   token and its bounding box before/after (a re-mount would change either).
3. **The failure warning is user-visible AND survives a re-derive.** Force a commit failure with the
   harness's typed failure injection (`docs/specs/unit-reads-pivot-tab-cache.md` §8.3 item 5's
   mechanism); assert the **painted** warning surface for the tab (the `TAB-1` class — the symbol is
   `C10`'s to render, so the assertion is on the **state's user-visible carrier**, whichever of the
   two lands: the tab's symbol **or** the stage's typed warning; §3.5 item 4), the store read-back is
   **unchanged**, then drive a re-derive and assert the warning is **still** present. The assertion
   is **painted geometry/DOM presence**, never computed-style alone (`DECIDED: D-GP-UFA-2`).
4. **Markdown mode is plaintext + monospace.** After a real click on the representation control:
   the stage's **painted** computed font family is a monospace family; the body's rendered text
   carries **no** inline formatting elements (a census of `strong`/`em`/`a`/`img` inside the surface
   is 0) and no heading is painted at heading scale; the surface is **still** `contenteditable`.
5. **The doc-head/body split.** For a document starting `# Title` + a paragraph: the first paragraph
   element is a **sibling** of the head element (not a descendant), and its painted `font-size` is
   body-scale — the owed live row of `docs/defects.md` `DOC-HEAD-CONTAINS-FIRST-PARAGRAPH`.
6. **No `<textarea>` exists in the rendered DOM.** A census over the **rendered** document
   (`document.querySelectorAll('textarea').length === 0` across the stage region, in **both** modes,
   after switching modes and after a re-derive) — the user-visible content of `ST-6`/`PRUNE-311`.
   **THIS OUTCOME IS NOW TRUE (§11 amendment `11.9` item 2):** the traversal authors **no**
   `textarea` child at all (§5.1), so the census reads zero **honestly** rather than being asserted
   around an authored artifact. The envelope-level assertion (no `type: 'textarea'` child authored,
   §6.5 item 4) and this rendered census are **different layers, and both must pass** — neither may
   be used to excuse the other.
7. **Whole-page edit commits 1-1 to the store.** The owed live row of `DECIDED: WHOLE-PAGE-EDITING`:
   a real typed edit in one paragraph, blurred, read back through `rag.get_document` **and** through
   the rendered DOM — the two agree, and an unrelated paragraph's stored bytes are unchanged. This is
   the row whose identifier this unit pins as **`U-EDIT-1-LIVE`**.

**The §5.U matrix disposition (pinned).** The matrix is **FULL at 8** and `MATRIX_ROWS` must not
change (`docs/specs/gnosis-offload-review.md` §7 A-6; `docs/specs/design-extensions-review.md` §7.4,
§10.2 item 16). Therefore: this unit's live assertions **re-pin existing rows** — the stage assertions
re-pin **U-1**'s stage row, the mode-control assertion re-pins the existing `UF-STAGE-6` block, the
settings assertion re-pins `UF-SETTINGS-5`, the edit-commit assertion re-pins the existing
`UF-STAGE-3` block — and the **new** assertions that have no row (**`U-EDIT-1-LIVE`**'s selection-span
and heading↔body halves, and the zero-textarea census) enter as **extended (non-matrix) rows** in the
report's extended-row table (`DECIDED: D-GP-UFA-4`'s separate same-shape table). **This unit claims
no §5.U matrix slot.**

**The oracle-identity change (pinned, and it is not incidental).** New live blocks change
`scripts/live-drive.mjs`, one of the **two** files of the oracle-identity pair
(`docs/specs/requirement-catalog.md` §2.2 fact 3; `docs/specs/design-extensions-review.md` §6.2/§7.2).
The block addition **must be recorded as an oracle-identity change with its own live re-run** — never
as an incidental edit inside this unit's diff. **The other file of the pair (`src/shared/o0-report.ts`)
must not be touched at all by this unit**, and the before/after hash re-read is reported in the DONE
row. **This spec performs no hash computation and makes no live claim** (§10 item 4).

### 8.4 Blast radius — what must stay green, and what may not be re-derived

**Pinned red-set obligations** (RCA-1's recorded set must contain all four — §6.5).

**What this unit may NOT re-derive (named).** The two **fence** suites
(`tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts`); the **O-0 harness**
(`tests/unit-o-0-*.test.ts`, `tests/unit-o0-m1-m3-*.test.ts`) and the oracle pair; the
**migration-contract** suites (`tests/unit-v5-migration-contract.test.ts`,
`tests/unit-import-batch-persist-contract.test.ts`) including their pinned censuses and the depth-10 000
budget tenant; the **§5.U matrix** (`MATRIX_ROWS` unchanged); `docs/specs/mcp-endpoint.md`;
`scripts/live-drive.mjs`'s `BLOCKS`/`MATRIX_ROWS` **literals** except this unit's own new block
(recorded as an oracle-identity change); and the **137 KEEP** files' assertions, which are their own
pin (the count is §6.1's class census, **recounted, never copied**; the pre-existing
§8.2/§8.4/§13 disagreement is **closed** by §11 amendment `11.9` item 7).

**The blast-radius reading (a READING with its method — recount, never copy).** Files under
`tests/**` that import or reference a module this unit touches (`src/renderer/edit-controller.ts`,
`src/renderer/rich-eligibility.ts`, `src/renderer/sidebar-panes.ts`, `src/main/traversal.ts`,
`src/main/rag-store.ts`, `src/main/edit-ops.ts`, `src/shared/types.ts`'s operator-settings surface):
**≈35** construct `EditController`; **21** carry the strict-typed `editingMode` literal; **8** pin a
textarea-authored artifact or a removed mode label. The figures are **approximations and must be
recounted** by the item-10d review with the probes stated in §6.1 — and §6.3's per-file table, not
the figures, is the work list.

---

## 9. SEQUENCING, GATES, AND CITATION DUTY

### 9.1 It lands BEFORE `TAB-1`/`TAB-2`

**Pinned:** `C10 U-TAB-MERGE` (`TAB-1`, `TAB-2`) is **STRICTLY AFTER** this unit
(`docs/specs/design-extensions-review.md` §3.3 C item `C10`: *"STRICTLY AFTER C9. `TAB-2`'s conflict
predicate is SPEC-FIRST; no code until the predicate is pinned"*; §13.1 P3's second hard rule;
`docs/specs/test-pruning-disposition-2026-09-21.md` §6.2 (a): *"no `TAB-*` test retires before C9's
green"*). **The reason is structural, not stylistic:** `TAB-2`'s conflict predicate is **defined over
this unit's diff** (`docs/specs/design-extensions-review.md` §12.4: *"`TAB-2`'s conflict predicate is
defined OVER `ST-4`'s diff"*), so a `TAB-*` implementation landing first would pin a predicate over a
diff that does not exist yet.

### 9.2 It must not re-open the O-9/O-10 gates, and must not enter the frozen O-5 queue

**Pinned:** the frozen, already-gated queue `O-0 → O-5 → O-9(+O-3) → O-10 → O-1 → O-2`
(`docs/specs/design-extensions-review.md` §6.2) is **NOT re-opened**; this unit **does not touch a
pin O-9/O-10 owns** (it writes no shell/zone/pane pin —
`docs/specs/design-extensions-review.md` §3.3 C item `C9`'s collision-discipline cell: *"Writes no
shell pin O-9/O-10 owns"*). Specifically it does **not** re-derive
`archive/tests/2026-10-04-unit-u-shell-3-collapsible-panes.test.ts`'s collapse pins, `archive/tests/2026-10-04-renderer-empty-zone-track.test.ts`'s
`is-empty`→`0px` pins, or any `props-layout-state`/`PANE-DRAG-*`/`PANE-SLOT-INSTABILITY-*` surface;
the two suite files this unit rewrites that `touch` that neighbourhood (`unit-u-shell-3-collapsible-panes`,
`unit-u-shell-5-resizable-gutters`' sibling group) are changed **only** for the removed harness token
(shape **R-A/R-D**), never for a pane/layout assertion. **It is not a member of the O-5 chain and adds
no row to it.**

### 9.3 The contract regime this unit declares (S2)

**Pinned declaration:** this unit runs over **the RECORDED TEMPORARY-AUTHORITY regime** —
`docs/specs/design-extensions-review.md` §13.2 **S1**/§14.5: *the contract says engine-authoritative
while the code still writes locally; the gap is RECORDED, never hidden; the sunset condition is
`U-AUTHORITY-SWITCH` (O-8)'s landing*. Concretely: the commit is authored against **one async write
hop** and applied through the **store addressed by the store selector**, with the **engine batch
route OWED** (§3.4 step 8). **The DONE row must state this regime**, and **no pass may describe the
cutover as already done**. A unit that cannot declare **one** regime cannot be delegated (S2); this
unit declares one.

### 9.4 The citation duty at landing (the ≈200 stale doc citations)

**Pinned:** this unit's landing pass **repoints every stale doc citation that belongs to it** — the
citations of the **17 retired suites it rebuilds** and of the surface it removes. The debt is recorded
in `docs/specs/test-pruning-disposition-2026-09-21.md` §9.7 (≈200 file-citations across ~40 unit
specs + `docs/decisions.md`/`docs/defects.md` rows), with each batch owned by the unit that rebuilds
the suite. `AGENTS.md` item 6c forbids leaving a citation pointing at a moved file, **and the
interim obligation is already carried** by `docs/next-steps.md` + `docs/pending.md` so a later pass
does not read a stale spec citation as a live pin. Named in this unit's set, at minimum:

- the citations of the 17 archived suites (§6.2) wherever they appear in `docs/**`;
- `docs/decisions.md` `DECIDED: EDITING-MODE-SETTING`'s own "pinned by" pointers, which the
  supersession (§4.1) replaces;
- `docs/defects.md` `EDIT-MODE-TEXTAREA-UI`'s proposed-fix cell, which names
  `docs/specs/unit-l1-editing-mode-setting.md` — **a path that does not exist**
  (`docs/defects.md` `CATALOG-CITES-NONEXISTENT-UNIT-SPEC`, OPEN) — repointed to this spec;
- `src/main/paste-sanitize.ts`'s `provident-editable` comment (§3.1) — **now a repoint to the ADOPTED
  entry point (`htmlToTree`) and the adapter, not to `rich-decompose`** (§11 amendment `11.9` item 1).

**Not this unit's duty:** the catalog's own phantom-package row (`PRUNE-615`'s `statement` cell) and
the other catalog cells — the catalog is **cited, never edited** (`docs/specs/design-extensions-review.md`
§15.1).

---

## 10. LAYER + HONESTY (which verification covers which layer)

| Layer | What is verified there | What is NOT | How |
| --- | --- | --- | --- |
| **PURE / ENVELOPE (node, `npm test`)** | the decode + diff (§3.2) **through the adapter + the package** (§3.1), the minimal-op rule, the new-block/edge representation, the op-list shape, the one-`applyBatch` contract and its journal/persist consequences, the `CommitFailure` shapes, the state machine's transitions, the warning's **survival across a re-derive driven at the envelope level**, the **absence** of any authored `textarea` child (the tombstone is dropped, §5.1), the removed/successor mode field, and all **7** §7 register rows | anything rendered; any selection; any painted style; any engine hop | the new `tests/unit-u-edit-1-*.test.ts` suites + `-adversarial` + `-pbt-generators`; plus the **26 rewrites** (§6.3) |
| **ASSEMBLED / RENDERER** | the single surface's **app-graph authoring** (the `assembleAppGraphEnvelope` result: the one `page-edit-surface` root, its `data-edit-surface`/`contenteditable` props and its body subtree) and its authored id/marker; the head/body sibling structure; the host's re-derive paths authoring the surface through the app-graph/stage seam instead of `applyEditingMode`; the mode control's payload path. **The traversal envelope is asserted only for its OWN shape** (one payload per section) — never as the carrier of the surface (§2.1, §11 amendment `11.7`) | the actual paint and the caret (the dom-shim is layout-less/CSS-less and has no real selection — RCA-12) | the node assembly tests **plus** the live battery (§8.3 items 1/2/4/5/6) |
| **ENGINE-DEPENDENT** | the commit's one-hop async write, the typed engine-absent failure, and the store-unchanged-on-failure property against an injected failure | the engine's own correctness (that is the Gnosis repo's; **no patch here** — `AGENTS.md` item 7) | injected-failure node tests + the live battery (§8.3 item 3) |
| **APP-GREEN** | **nothing in this spec.** | — | RCA-12: a node-suite green is **ENVELOPE-green, not APP-GREEN**. No part of this unit is app-green until the live path is exercised (§8.3) **and** the item-10d review has run. |

**Honesty bounds recorded here so a later pass cannot over-claim:**

1. **This spec performs no shell work and no live run.** Every live figure in §8.3 is an **owed
   assertion**, not a measurement; the oracle before/after hash re-read and the live run are owed to
   the unit's shell-bearing pass. **RESTATED after the unit's landing (§11 amendment `11.8` item 5):** the
   landed unit's green is an **envelope/store-green** — a node-suite green over the pure diff/commit
   model and the provident-envelope authoring, never the assembled app (RCA-12). **`U-EDIT-1-LIVE` is
   still UN-RUN and OWED**: the caret's crossing of the heading/body boundary (§8.3 item 2), the
   painted monospace/HTML-free markdown mode (§8.3 item 4), the painted divider (§8.3 item 5), the
   failure warning's painted survival across a re-derive (§8.3 item 3), the zero-`<textarea>` rendered
   census (§8.3 item 6) and the commit-1-1 row (§8.3 item 7) have **no live measurement** in this pass.
2. **Every count in this file is a READING with its stated method** (§6.1's probes, §8.4's import
   scan, the `RagNodeType` union read, the two fence files' names) and **must be recounted, never
   copied** — the count-drift class has already cost this repo two fix cycles
   (`docs/specs/design-extensions-review.md` §14.3, §5.2 R15).
3. **This spec does not implement the engine batch route**, does not add the `revision`/marker field,
   and does not move the cutover (§3.4 step 8; `docs/specs/unit-reads-pivot-tab-cache.md` §9's
   honesty bounds bind here too).
4. **The escalated conflicts are stated, not resolved by this file** (§11): the fence/`ST-6`
   conflict (pinned interim + escalation), the `BatchOp`/`applyBatchOp` gap (a red obligation, not a
   new union member), and the absence of an engine batch route.

---

## 11. ESCALATIONS AND OWED ITEMS (recorded, never hidden)

| # | Item | Status | Owner |
| --- | --- | --- | --- |
| **1** | **The engine batch route does not exist.** `src/main/engine-crud-rag-store.ts` `EngineCrudRagStore` is an 11-method document-CRUD interface with **no batch call** and is **not** a `RagStore`; under `GN-1` the commit must eventually be one engine write. The store-level `applyBatch` is the pinned interim (§3.4 step 8). | **ESCALATED** — an engine-request/handoff shape for `U-AUTHORITY-SWITCH` (O-8); **no patch to the Gnosis repo** (`AGENTS.md` item 7) | P1 handoff rows (`docs/HANDOFF.md`) + `U-AUTHORITY-SWITCH`'s spec |
| **2** | **The fence/`ST-6` conflict — RESOLVED 2026-09-21 (§11 amendment `11.9` item 2).** The conflict was real: `tests/traversal.test.ts` pinned the authored `textarea-ul` child while `ST-6`/`PRUNE-311` require textarea editing to be removed, and the fence "must stay green UNCHANGED" / "may not be re-derived". **The owner has authorized RE-PLANNING that one fence row**, and the resolution is the **REMOVAL** of the `textarea` child (the interim "inert tombstone" of the earlier form of §5.1 is **DROPPED** — the adapter creates the element unconditionally, so it never was non-rendered). **Scope of the authorization: `tests/traversal.test.ts`'s child-list row ONLY**; the other fence file and every other fence row stay untouched. The former gate question ("if the supervisor prefers a fence edit…") is **answered**: the fence edit is the ruling, and it is one row in one file. | **RESOLVED — recorded, with the re-plan shape pinned in §6.5** | the owner (ruling) + this unit's landing pass |
| **3** | **`applyBatchOp` rejects `setProps`/`setSubtree`/`setType`** while `DECIDED: BATCH-ATOMICITY-API` pins them in the closed union. This is a genuine **RED obligation** of this unit (§3.3 item 7), **not** a new union member and **not** a reason to split the commit. | **RED-BY-DESIGN** — recorded so the red set's cause is not mis-read as a missing contract | this unit's Implementer |
| **4** | **`docs/skills/designing-pages.md` does not exist** (verified by glob: `docs/skills/**` holds only `process-guardrails.md`), so the page-design skill, its test-use-case coverage matrix and its demo-page index cannot be updated. The design consequences this unit pins (§2.1–§2.5, §3.5 item 6, §8.3) must be carried into that skill **when it is authored**. | **OWED — recorded, not skipped** | the pass that authors the skill |
| **5** | **The catalog's phantom-package row and this unit's catalog census.** `PRUNE-615`'s `statement` cell still reads "the provident-editable import tools"; `PRUNE-311`/`PRUNE-617` census rows for the textarea removal; and any new-row/count duty. The catalog is **cited, never edited** from a unit spec. | **OWED** to the catalog's own amendment pass (`docs/specs/design-extensions-review.md` §15.1) | the catalog amendment pass |
| **6** | **`TAB-1`'s rendered symbol** is `C10`'s; this unit supplies the state and the typed record and pins the shared class (§3.5 item 4). If `C10` slips, the state exists with a stage-level warning only — **recorded so the two units do not each invent an affordance** | recorded interface | `C10 U-TAB-MERGE` |
| **7** | **The O-0 oracle-identity re-run owed by the live blocks (ADDED 2026-09-21 — §11 amendment `11.9` item 6).** `U-EDIT-1-LIVE`'s blocks must be added to `scripts/live-drive.mjs`, one half of the oracle-hash pair; **the block addition invalidates the recorded oracle identity and owes an O-0 re-run per RCA-11**, with the before/after hash re-read recorded. | **OWED — named, not a side effect** | the unit's shell-bearing live pass (`U-EDIT-1-LIVE`) + the O-0 harness's owner |
| **8** | **`U-EDIT-1-LIVE` is UN-RUN (RCA-11) — IN PROGRESS / OWED.** **[SUPERSEDED IN PLACE 2026-09-22 — §11.11 item 2: the clause "the battery's blocks do not exist in `scripts/live-drive.mjs` yet" is NO LONGER TRUE — the `U-EDIT-1-LIVE-1`..`-8` rows and their blocks EXIST in the driver (the row table 2882–2893; the block implementations from 4984), so the authoring half of this row is DONE and the RUN half is not.]** So: the blocks now exist, but **no live run result exists** for §8.3 items 1–8, and **no live measurement exists**; the unit is **not pre-DONE** while this holds. | **OWED — MANDATORY pre-DONE gate (authoring done, RUN owed)** | this unit's shell-bearing live pass |
| **9** | **The package's table-element capability gap (ADDED 2026-09-21 — §11 amendment `11.9` item 1).** `provident-editable@0.2.0`'s closed `ProvidentNodeType` has **no `table`/`thead`/`tr`/`td`/`th`** member, so a stored table node's structure is not expressible in the package's tree and the adapter must **refuse** rather than flatten (§3.2). This is a **capability/requirement gap in a dependency** — a `docs/defects.md` + `docs/HANDOFF.md` item, **never** a patch here (`AGENTS.md` item 7). | **ESCALATED (handoff)** | `docs/defects.md` + `docs/HANDOFF.md` (the package's own repo) |

---

### 11.7 AMENDMENT (2026-09-21 — the surface's layer) — the payload-shape escalation is RESOLVED: option (a)

**The ruling (product owner, 2026-09-21): the single editable surface is authored at the
APP-GRAPH / STAGE-ASSEMBLY layer, NOT as a traversal-envelope payload node.** Option **(a)** — the
app-graph authoring — is the resolution; the alternative (author the surface in `buildTraversal`)
is rejected.

**Why the payload placement was never available (the contradiction, and the evidence).** The
implementer's **four-placement proof** (the pass's recorded objection to the earlier wording) showed
that a surface authored in the traversal admits **no valid placement**: (i) as a **new payload root**
it becomes a **seventh** root for a document that must keep **six** (the fence pins one payload root
per section, `content[0].content[0]` = the `rag-head` h1); (ii) as the payload root's own **child**
it becomes a second payload-root-level node and breaks the same census; (iii) wrapping the section
root changes `content[0]` and therefore the fence's own read; and (iv) wrapping the section roots
**inside** the traversal authors a nested, unanchored container — the exact shape
`DECIDED: PLACEMENT-ONLY-PAYLOAD-ROOT` forbids, which is what produced the duplicate render
(`LIVE-UF6`) that the placement-path contract depends on. All four placements therefore either move
a fence-pinned node or violate the placement-path/duplicate-render contract. **The provident-authoring
rule still binds** (`AGENTS.md`: non-shell UI is provident-authored envelope nodes/handlers, never
hand-written DOM) — so the only remaining place for the surface is a **provident node authored in the
app graph**: the stage/graph assembly the renderer already builds.

**Pinned (amends §2.1's authoring row).** The surface is authored by the pure app-graph builder
`src/renderer/pane-graph.ts` `assembleAppGraphEnvelope`, carried into the assembly by the host's
stage-authoring seam `src/renderer/sidebar-panes.ts` `applyEditorToolbar` (`loadAppGraph`) — the seam
that already authors the stage's `editor-toolbar`/`pane-history` roots; `data-edit-surface` carries the
**focused document id** (`SidebarPanes._currentDocumentId`, the same source §2.7/U-SHELL-9b scopes the
multi-document mount by). It carries `props.id = 'page-edit-surface'`,
`props['data-edit-surface'] = <documentId>`, `props.contenteditable = true` and its name-referenced
handler defs. `data-edit-surface` is a **runtime marker** in the same class as `data-doc-head`/
`data-node-id`: excluded from the diff (§3.2) and from the reconcile shape projection. Its **subtree is
the assembled body of the focused document** — the doc-head node + the body blocks as the stage renders
them (head first, then the sections/blocks including table cells and inline children). **The traversal
envelope keeps its one-payload-per-section shape, unchanged: six payload roots for this document, and
`content[0].content[0]` in the traversal envelope remains the `rag-head` h1.** The surface is **not a
traversal-envelope node**, and the traversal authors no payload for it. **Invariant: exactly ONE surface
per focused document/tab** (§2.1); on a simultaneous multi-document mount only the focused document's
assembled body is surfaced.

**Test disposition.** The **fence suite `tests/traversal.test.ts` is EXEMPT BY NAME and stays
untouched** (and `tests/import-render-no-duplicates.test.ts` likewise). The **envelope-shape
assertions in the rebuilt suites are re-derived against the app-graph/stage render**: the
surface-shape rows of `archive/tests/2026-10-04-single-editable-surface.test.ts` (its `buildTraversal`-reading
`surfaceRoots`/`envelopeNodes` assertions, including `state S5` and the `FS1` row) read the
`assembleAppGraphEnvelope` result instead, and the **per-node-host rows** of
`unit-u-shell-9b-h1-optionc-interception`, `unit-u-shell-9b-h2-c20-materialization`,
`unit-u-shell-9b-blind-greens` and `unit-r-traversal-inline-children` are re-derived the same way
(§6.5's re-derivation list).

**The cost (recorded, not hidden).** (1) The surface becomes a **pane-like, document-unscoped
app-graph root**, so a focused document's reconcile buckets change shape from six `rag-` document
roots to one `page-edit-surface` root — the `page-edit-surface` **pane-like** classification in
`src/renderer/content-reconcile.ts` `asContentRoot`/`isPaneLikeRoot` (beside `EDITOR_TOOLBAR_ID` and
`LANDING_ROOT_ID`) is owed and must not be discovered late. (2) `assembleAppGraphEnvelope` is **PURE and takes no
`documentId` today**, so the builder gains that input (or the host threads the document id through the
`applyEditorToolbar` seam) — an input-shape change of a function with **three** host call sites in
`sidebar-panes.ts` (`loadAppGraph`, `applyContentChange`, `applyDocumentSet` — recounted by the
grep, never copied) plus the assembly suites. (3) `applyEditingMode` retires as the authoring path (§5 item 1), and every
re-derive path must author the surface through the app-graph seam or the surface vanishes on a
re-derive. (4) The node-level `FS1` check moves to the **app-graph render + DOM** (§2.1/§8.1), so a
node test written against the traversal envelope cannot see it.

**One clause that cannot be expressed at the envelope layer (recorded, with its reason).** For the
document payload roots that reach the main zone through the **engine's placement path**
(`placement: { targetPlacement: [zoneName] }` resolved by the engine, `DECIDED: PLACEMENT-ONLY-PAYLOAD-ROOT`),
the assembly cannot see the final zone tree: it sees only `content` payloads + `template.root.children`.
A pure builder can author the surface root and place it in the same zone, but it **cannot assert**
that the engine's placement-path enumeration renders nothing else at that zone level (that is engine
territory; a node suite cannot read it either). The **only expressible form is therefore the
`applyEditorToolbar`-class authoring seam plus a DOM/render assertion**: the node-level obligation is
the assembled envelope (one surface root, its props, its subtree), and the placement-level obligation
is asserted **live** in the §8.3 battery. This is why no clause of this amendment is pinned as an
engine-placement-path assertion.

**Register/fail-state/supersession invariants: unchanged.** §7's register table, the `FS1`..`FS24`
numbering, the §4.1 supersession set and the §5.1 textarea-tombstone resolution all stand — the
tombstone's resolution **for the `textarea-<ragId>` child is NOT changed by this amendment**; it
remains the implementer's obligation, and its escalation (§11 item **2**) stands as recorded.
(**§11 amendment `11.8` below amends only §7's `P-IM-2` proposition and the names it pins; the
`FS1`..`FS24` numbering, the §4.1 supersession **set** and the §5.1 tombstone resolution are unchanged
by it too.**) **BOTH of the last two sentences are SUPERSEDED IN PART by §11 amendment `11.9` item 2:
the tombstone resolution is **REPLACED** (the child is no longer authored at all, §5.1) and §11 item 2's
escalation is **RESOLVED**; §4.1's supersession **set** gains **one** row (item 1's
`DECIDED: RICH-TEXT-EDITING-GATE`), and the `FS1`..`FS24` numbering still holds.**

---

### 11.8 AMENDMENT (2026-09-21 — adopted names + the register adjudication)

**Why this amendment exists.** The `C9 U-EDIT-1` implementation landed (commit `15cbc6c`) against this
spec, and **four items had to be decided during the landing because this file left them unpinned or
unsatisfiable as written**: the page-commit **seam names** (§2.1 pinned "name-referenced handler defs"
without naming them), the successor **representation-mode field's name** (§2.5 pinned the shape and the
union, not the name), the **`commit-failed` carrier** (§3.5 item 6 pinned "host-side state keyed by tab
id", not the concrete carrier), and one **register row** (`P-IM-2`) whose population contradicted
`P-TP-2`. Items 1–3 **pin an adopted name**; item 4 **adjudicates a row without weakening it**; items
5–6 **record** the landed verification layer and the executed archive. Nothing else changes: the
`FS1`..`FS24` numbering, §6.1's class census and §7's row count are untouched.

1. **The page-commit seam names (adopted) — serving §2.1's Authoring row, §3.4 step 2, and §3.5
   items 1/3/6.** The pinned seam is: the handler defs **`page-edit-surface-input`** (event `input`)
   and **`page-edit-surface-blur`** (event `blur`), authored as the surface root's name-referenced
   defs (`src/renderer/pane-graph.ts` `PAGE_EDIT_SURFACE_HANDLER_DEFS` with the
   `PAGE_EDIT_SURFACE_INPUT_HANDLER`/`PAGE_EDIT_SURFACE_BLUR_HANDLER` names and their inline bodies),
   whose bodies route to the host's own bridge methods **`pageSurfaceInput()`** and
   **`pageSurfaceBlur(html?)`** on the `SidebarApi` surface (`src/main/preload.ts`;
   `src/renderer/sidebar-panes.ts`'s page-edit seam). `pageSurfaceInput` marks the **PAGE** dirty (one
   dirty page per tab, §3.5 item 3); `pageSurfaceBlur` performs the §3.4 commit — **one
   `IPC_EDIT_BATCH` payload**, never a per-node write (§3.3 items 1/2).
   **The surviving-seam census rule (binding; §5 item 6 now states the same set).** The **surviving**
   content seams are exactly **two handler defs** and exactly **two bridge methods** — the page pair
   above — while the **retired** set is exactly **six per-node handler defs**
   (`rag-textarea-input`, `rag-textarea-blur`, `rag-editor-input`, `rag-editor-blur`,
   `rag-editor-compositionstart`, `rag-editor-compositionend`; §5 items 2/6) and exactly **six per-node
   bridge methods** (`textareaInput`, `textareaBlur`, `editorInput`, `editorBlur`,
   `editorCompositionStart`, `editorCompositionEnd`), plus the per-node gate module
   `src/renderer/rich-eligibility.ts` (§5 item 4, archived). A registration of a retired name, or a
   per-node editing seam re-exposed under a new name, is a review finding — the two clauses may never
   disagree on this set.

2. **The successor representation-mode field (adopted) — serving §2.3's switch row, §2.5, and §4.1's
   surviving-clause list.** The successor is **`representationMode: 'html' | 'markdown'`**
   (`src/shared/types.ts` `type RepresentationMode = 'html' | 'markdown'`, `OperatorSettings.representationMode?`,
   `OperatorSettingsPatch.representationMode?`), coerced by `src/main/operator-settings-store.ts`
   `coerceRepresentationMode` with an **`'html'` default**; a patch **without** the field leaves the
   stored representation unchanged, and a **persisted legacy `editingMode` key is IGNORED, never
   trusted** (§5 item 5 → `FS20`). The toolbar reads it through
   `src/renderer/pane-graph.ts` `editorToolbarContent(representationMode, …)`, and the superseded
   `editingModeLabel`'s successor is `representationModeLabel` (§6.3 rewrite shape **R-B** — the old
   label semantics are **not** preserved under the new name).

3. **The `commit-failed` carrier (adopted) — serving §3.5 items 3/6 and §3.6.** The carrier is a
   **host-side `Map<tabId, failure>` in the `SidebarPanes` host** (`src/renderer/sidebar-panes.ts`),
   keyed by the same page subject the dirty machinery is keyed by, and written **only** by the
   page-commit seam — **never the DOM** (no class, no attribute, no `innerHTML`). **Why it is host
   state, not a rendered element:** (i) the warning must **survive a re-derive** — no re-derive path
   (`reDerive`, `reconcileContentRoots`, `reconcileDocumentRoots`, a template or operator re-derive)
   reads or writes that map, so it survives **by construction**; (ii) it must **not be a diffed content
   change** — as host state it can never enter §3.2's **closed compared-field set**, so it can never be
   read back as a page edit (`FS8`) and can never be lost to a content reconcile (`FS17`). A successful
   commit **deletes** the entry and a failed one **sets** it while the dirty flag is **kept** (§3.5
   items 1/2); the record is the state `C10 U-TAB-MERGE` binds its `TAB-1` symbol to (§3.5 item 4), with
   **no second affordance** invented.

4. **The register adjudication (`P-IM-2` vs `P-TP-2`) — remedy (a): the population is restricted.**
   **The contradiction, exactly as the landing found it.** `P-IM-2`'s draw could produce an **empty**
   mutation subset (`S = ∅`), yet the row's oracle required `journal delta === 1`; `applyBatch([])`
   returns `{ ok: true }` with a delta of **0**, which is precisely what `P-TP-2` pins as correct
   (`S = ∅ ⇒` empty op list, journal delta 0, persist delta 0, state `clean`). The implementation
   therefore reported **`P-IM-2` BROKEN test-side**
   (`tests/unit-u-edit-1-property-register.test.ts`'s `P-IM-2` row — its draw loop measured against its
   own empty-op-list control). **The row's population was wrong, not the journal and not the store:**
   no store defect exists here, and **no fail-state and no new row are added**.
   **The chosen remedy: (a) — restrict `P-IM-2`'s population to NON-EMPTY mutation subsets**, and state
   the restriction in the row's own proposition (§7; the row also records that the `S = ∅` draw is its
   **control** and is `P-TP-2`'s proposition). Remedy **(b) — splitting the row — is rejected**: a split
   would re-tally the register for no contract gain, because the empty case is already fully pinned by
   `P-TP-2` and already drawn by `P-IM-1`'s `S = ∅ ⇒ ops = []` control.
   **The amended proposition text** (now in §7, verbatim): *"**One commit = one `batch` journal entry,
   and the entry is invertible to the pre-commit state.** **AMENDED PROPOSITION (§11 amendment `11.8`,
   remedy (a) — the population is restricted to NON-EMPTY mutation subsets):** for ANY draw **whose
   mutation subset is `S ≠ ∅`**, after a successful commit `journal()` gained exactly one entry of kind
   `batch`, and applying its `inverse` (in order) restores the store's nodes/edges **deep-equal** to the
   pre-commit snapshot. The `S = ∅` draw is **outside this row's population** — it is this row's
   **control**, and it is `P-TP-2`'s proposition (an empty op list ⇒ journal delta 0, persist delta 0,
   state `clean`), so the two rows no longer state contradictory oracles."*
   **The invariant itself is NOT weakened** (`AGENTS.md`: an amended invariant is **recorded, never
   silently relaxed**): on its (non-empty) population the row is exactly as strong as before, only an
   out-of-population draw is excluded, the exclusion is recorded here **and in the row itself**, and
   the row's negative generator is unchanged. `P-TP-2` is **unchanged** and remains the authority for
   the `S = ∅` draw.
   **Budget: NO re-tally.** The remedy removes an out-of-population **draw**, not a row and not an
   attempt: the count stays **7 rows**, the seed stays **`0xED170001`**, the per-row ceiling stays
   **≤100**, and the total stays **`63 × 6 + 22 = 400`** — with `P-IM-2` keeping its **63** attempts.
   **Red-set consequence:** a TestWriter re-deriving §7 from this file filters `P-IM-2`'s draws to
   `S ≠ ∅` and keeps the empty-op-list draw as that row's **control**; a draw that still demands
   `journal delta === 1` over an `S = ∅` case is the row's own defect re-introduced — a row reported
   `broken` for it is **not** a store finding.

5. **Layer honesty restatement (recorded — RCA-12).** The landed unit's green is a **node-green**, i.e.
   an **ENVELOPE/STORE-green**: it covers the pure decode/diff/commit model, the provident-envelope
   authoring and the host-side state — **never the assembled app**. **`U-EDIT-1-LIVE` (§8.3) is still
   UN-RUN and OWED**, with **no live measurement** in the landing pass for any of its assertions: the
   caret crossing the heading↔body boundary without a re-mount (§8.3 item 2), the painted
   monospace/HTML-free markdown mode (§8.3 item 4), the painted divider (§8.3 item 5), the failure
   warning's **painted** survival across a re-derive (§8.3 item 3), the zero-`<textarea>` **rendered**
   census (§8.3 item 6), and the commit-1-1 store round-trip (§8.3 item 7). **No pass may read the node
   trio as this unit's app-green**, and per RCA-11/RCA-12 the unit is not pre-DONE while
   `U-EDIT-1-LIVE` is un-run.

6. **Archive record (recorded — so §5 and the actual archive agree).** The landing executed **two**
   `src/` archive moves, each **importer-free at the move**:
   `archive/src/2026-09-21-sidebar-panes-apply-editing-mode.ts` (§5 item 1 — the `applyEditingMode`
   method's own text, extracted from the still-live `src/renderer/sidebar-panes.ts`) and
   `archive/src/2026-09-21-rich-eligibility.ts` (§5 item 4 — the whole `rich-eligibility.ts` module,
   whose only `src/` importer was the retired splice). §5's destination cells and its
   destination-convention paragraph now name both realized paths, `archive/README.md`'s `src/` topic row
   (created by the same pass) cites §5 of this file, and **every other §5 item remains conditional** on
   its own archive-condition cell — a module with a live importer is still never archived.
   **The realized coverage of the other §5 items (recorded, so §5's plan and `archive/src/` agree):**
   item **2**'s handler defs/bodies + `restoreRichCaret`, item **6**'s per-node bridge surface, and
   item **7**'s `kind: 'textarea'` caret text are **folded into item 1's SINGLE artifact**
   (`archive/src/2026-09-21-sidebar-panes-apply-editing-mode.ts`, whose own numbered sections cite §5
   items 2/6/7) — the separate `archive/src/<date>-sidebar-panes-rag-editor-handlers.ts` and
   `<date>-textarea-editing-bridge.ts` files **do not exist**; item **3** is the fence exception and is
   **NOT archived** (§5.1); and **item 5's artifact `archive/src/<date>-editing-mode-setting.ts` was NOT
   executed** — the removed `coerceEditingMode`/`editingModeLabel` helpers survive only as prose
   comments in the successor code (`src/renderer/pane-graph.ts`,
   `src/main/operator-settings-store.ts`), which is **recorded as OWED** to the unit's next pass
   (`DECIDED: REBUILD-ARCHIVE-POLICY`: the archived copy is the durable rebuild input, so a removed
   helper with **no** archived copy is a recorded gap, never a discard).

**Invariants this amendment does NOT change.** The `FS1`..`FS24` numbering and text (§8.1), §6.1's
class census (`17 + 26 + 137 = 180`) — cited as §6.1 states it, with a **RECORDED pre-existing
disagreement this amendment does NOT re-tally** (the item-10d review must adjudicate it): §8.2 item 7
reads `17/32/131/0`, §8.4 reads `136 KEEP`, and §13 item 6 reads `REWRITE 27 · KEEP 136` — the four
figures all sum to 180 yet do not agree on the classes — **SUPERSEDED IN PART by §11 amendment `11.9`
item 7, which closes the disagreement to §6.1's `17/26/137/0` in all three places** (the item-10d review
now **recounts** §6.1's figures rather than adjudicating four variants); §6.3's per-file table remains
the work list and the authority — §6.2's 17-suite rebuild list, §7's row count / seed / budget, the
§4.1 supersession **set** (item 2 adds to that row's *surviving-clause* list — it writes **no** new
supersession), the §5.1 textarea-**tombstone** resolution and its escalation (§11 item 2) — **that
resolution is RETIRED by §11 amendment `11.9` item 2: the tombstone is dropped and the fence row is
re-planned** — and §11's
escalation table all stand as recorded. This amendment **pins names and adjudicates one row**; it
authors no new contract surface and no new fail-state.

---

### 11.9 AMENDMENT (2026-09-21 — the decomposer adoption, the tombstone drop, the fence re-plan)

**Why this amendment exists.** Three **owner rulings of 2026-09-21** supersede premises this file pinned
before the package existed and before the fence exemption could be re-planned. It **re-derives** the
affected clauses: §3.1/§3.2/§3.3 (the decomposer + the diff contract, now the package + the adapter),
§4.1 (one added supersession row), §5/§5.1 (the tombstone drop and the fence re-plan), §6 (the deleted
test-local reference decode/diff, the fence row, the tombstone rows), §7 (three vacuous register rows
amended), §8.2/§8.3/§8.4 (the live battery's owed blocks, the counts), §11 (the new owed items),
§12/§13 (the new symbols/facts). **The rulings, recorded:**

1. **`provident-editable@0.2.0` is ADOPTED as the production decomposer — it SUPERSEDES the
   `DECIDED: RICH-TEXT-EDITING-GATE` in-house build.** The package is **installed** (`dependencies:
   provident-editable ^0.2.0`; peer `provident-ssr >=0.4.0 <1.0.0` satisfied by the installed 0.5.1;
   **ESM**, **no DOM**, `parse5` only). Its exports are **`htmlToTree`**, **`diffTrees`** and
   **`providentPlainText`** (plus **5 types**). **`diffTrees` returns ITS OWN `ProvidentTree`/
   `StructuralDiff` shape** — a **19-member** `ProvidentNodeType` (**including `text` runs**) with
   `{nodeChanges:{add,remove,update}, edgeChanges:{add,remove}}` — and **it is NOT C9's
   `{content, children}`/`RagNodeType` shape**, and it supplies **no `BatchOp`, no `applyBatch` and no
   journal semantics**. **Consequences re-derived into the contract:** §3.1 now names the exact entry
   points (`htmlToTree` for the decode, `diffTrees` for the diff) and **pins the ADAPTER**
   (**`src/main/page-diff.ts`**: `decodePage`/`buildPageOps` + `PageBlock`/`PageDecodeResult`/
   `PageOpsResult`/`PageDiffSnapshot`) — the ONLY module that imports the package — mapping the package
   onto C9's **closed field set `{type, content, children, props}`** and the op set
   (`putNode`/`setProps`/`setSubtree`/`setType`/`putEdge`, with `removeNode`/`removeEdge` for
   deletions); **which package change kind maps to which op** (the mapping table in §3.1); **how a NEW
   block** (a typed paragraph with no node) becomes an **id-minted `putNode` + the `doc-child`
   `putEdge`**; **how a PROPS difference is represented** (the adapter diffs the package's FULL
   `update.props` against the store's RAG-owned props and sends **only the changed keys** into the
   MERGING `setProps` — **the adversarial pass found the last population could not express a `props`
   difference at all**, so the mapping had no oracle; §7's `P-IM-1` population is amended to draw one);
   **how a STRUCTURAL change (split/merge) is detected** (the package reports it as an `update` + an
   `add` / an `update` + a `remove` — no dedicated kind, and the adapter must not synthesize one); **what
   is deliberately NOT diffed** (the renderer-minted runtime props — `contenteditable`,
   `data-edit-surface`, `data-node-id`, `data-doc-head` as a written prop — plus `style`/classes, the
   surface root's props, the mode, out-of-document nodes, `updatedAt`-only differences, and the
   package's own reconciliation ids); and the **`text`-run semantics** (the package's `text` leaves are
   flattened into the owning block's `content` — the raw package `content` must not be compared, or
   every block with inline children emits a spurious op, `FS9`). **The adapter's failure modes are
   pinned: a package throw or an unmappable change kind ⇒ the `FS5`/`ST-5` warning class, never a silent
   partial write** — and the package's throw surface is **recorded, not assumed** (§3.1's table: it does
   **not** throw for malformed HTML, but it **does** throw a typed `Error` for a malformed **input
   shape**). **The one-`applyBatch`-per-commit clause and the journal clause are UNCHANGED** (§3.3
   items 1/3 — the package supplies the tree and the diff, never the ops). The **stale
   `src/main/paste-sanitize.ts` comment** is repointed to the adopted entry point; §9.4's citation duty
   and §4.1's new supersession row carry the rest.
2. **The textarea tombstone is DROPPED.** `src/main/traversal.ts` `buildSubtree` must **stop authoring
   the `type: 'textarea'` child entirely** — the adapter creates the element **unconditionally**, so
   `hidden` never made it non-rendered — and the one **fence** row it existed to satisfy
   (`tests/traversal.test.ts`'s child-list assertion `[undefined, 'textarea-ul', 'rag-li1', …]`) is
   **RE-PLANNED under this explicit ruling** (the fence was **exempt by name**; the owner has authorized
   **re-planning that row**). **Consequences re-derived:** §5.1 is rewritten (the resolution is the
   REMOVAL, not the disguise; the tombstone, its `hidden`/`readOnly` props and its decode/diff
   exclusions are all gone), §5's dead-code list now covers **the whole textarea path** (item 3's
   destination is `archive/src/<date>-traversal-textarea-overlay.ts` — the authored-child text extracted
   from the still-live `src/main/traversal.ts`), §6.3/§6.4/§6.5 record the **fence re-plan**
   (one file, one row, nothing else) and the **"no textarea is authored at all"** tombstone-row flip,
   and **the `ST-6` outcome** (no `<textarea>` in the rendered DOM, **both modes**) **becomes TRUE**, so
   **§8.3's census reads zero honestly** instead of being asserted around an authored artifact.
   **`FS21`** is restated (an authored `type: 'textarea'` child is now itself the fail-state).
3. **The toolchain fix is recorded.** `package.json` now pins **`@types/node ^24`**, **`vite ^8.3.0`**
   (vitest 5's peer, **previously missing from the lock**), and **`provident-ssr ^0.5.1`**;
   **`--legacy-peer-deps` is retired** — the dependency graph installs without it (§3.1's toolchain
   paragraph). The trio obligations (§8.2 item 4) and the protected 15 000 ms suite budget are
   unchanged.

**The consequences recorded as OWED (named, never left as side effects).**

4. **The catalog row `PRUNE-615`.** Its `statement` cell named the **phantom** package
   (`provident-editable` "does not exist"); it now names a package that **exists at 0.2.0**, so its
   amendment is a **version/statement correction**, not a phantom removal. The catalog is still
   **cited, never edited from this spec** (`docs/requirement-catalog.md` §C.0) — owed to the catalog's
   own amendment pass (§11 items 4/5 unchanged in form).
5. **The three vacuous register rows are amended so each is falsifiable** (§7's amended
   propositions + the re-tally paragraph): **`P-SM-1`** must **construct** the `commit-failed` state and
   draw **all five** `CommitFailure.kind`s (the last population never constructed the state and never
   drew three of the five kinds); **`P-SM-2`** must carry a **discriminating witness** (a `clean` and an
   `uncommitted` tab in the same draw) against a **constructed** record (the last form was a tautology
   with a constant control); **`P-IM-1`** must draw a **`props`-only** change (RAG-owned) **and** a
   runtime-prop-only control (the last population could not express a props difference at all). **The
   seed stays `0xED170001`, the row count stays 7, the total stays `63 × 6 + 22 = 400`**, and the
   allocation is re-tallied **within `P-SM-1`'s own 22** (4 × 5 kinds + 2 controls) — a recorded
   re-tally of the allocation, not of the total.
6. **`U-EDIT-1-LIVE` MUST gain its blocks in `scripts/live-drive.mjs`, and that owes an O-0 re-run.**
   `scripts/live-drive.mjs` is **half of the O-0 oracle-hash pair**, so adding blocks **invalidates the
   recorded oracle identity** and owes an **O-0 re-run per RCA-11**, with the before/after hash re-read
   reported by the pass that runs it. This is an **owed item** (recorded in §8.3 and in §11's new rows
   7/8), **not** a side effect of an edit and **not** a deferral of the battery;
   `src/shared/o0-report.ts` stays untouched.
7. **The test-disposition count disagreement is closed** (§6.1's `17/26/137/0` now reads the same in
   §8.2 item 7, §8.4 and §13 item 6 — §6.1 remains the reading and §6.3's per-file table the work list);
   it is a **correction of three stale restatements to the existing census**, not a re-count of the
   tree, and §8.2 item 7's doc-review duty is **recounting**, never copying.

**What this amendment does NOT change.** The `FS1`..`FS24` numbering (only `FS21` is **restated** in
place, §8.1), §6.1's class census figures, §7's row count / seed / total budget, §4.1's **other** rows,
the one-`applyBatch`/journal/persist clauses (§3.3 items 1–3/5/6), the `CommitFailure` shape (§3.5
item 5), the host-side `Map<tabId, failure>` carrier (§3.5 item 6, §3.6), and the §9 sequencing gates
all stand as recorded. Exactly **two** contract surfaces change: the **decomposer + the diff's
provenance** (§3.1/§3.2/§3.3 item 8) and the **textarea authoring** (§5 item 3/§5.1). Exactly **one**
supersession row is added (§4.1's `DECIDED: RICH-TEXT-EDITING-GATE` row), and **no new fail-state is
authored**.

---

## 12. CROSS-REFERENCES (path + symbol / row id / `§section` — never a line number)

| Artifact | What is cited from it |
| --- | --- |
| `docs/decisions.md` `DECIDED: WHOLE-PAGE-EDITING` | the requirement this unit implements; its owed "spec re-derivation + a live row"; its "SUPERSEDES … once implemented" clause |
| `docs/decisions.md` `DECIDED: EDITING-MODE-SETTING` | the superseded control-swap model; the **surviving** mode-broadcast contract (§2.5, §4.1) |
| `docs/decisions.md` `DECIDED: FORM-CONTROL-EDITING` | the superseded form-control model and its surviving commit-on-blur/re-traversal/dirty-guard clauses |
| `docs/decisions.md` `DECIDED: RICH-TEXT-EDITING-GATE` | the **superseded** in-house `decomposeRichHtml` clause (its surviving clauses: `setProps` MERGES (`data-doc-head`); `setType` never delete+create; the `children` field; the census 6→9) — §4.1's added row; §11 amendment `11.9` item 1 |
| `docs/decisions.md` `DECIDED: RICH-TEXT-EDIT-OPS` / `DECIDED: EDIT-OP-CENSUS` | the 9→10→11 op census; the three rich-text ops; `setDocMeta` outside the closed union |
| `docs/decisions.md` `DECIDED: BATCH-ATOMICITY-API` | the closed 7-member `BatchOp` union; one batch = one invertible `batch` entry; one persist; rollback; never-throws |
| `docs/decisions.md` `DECIDED: PROJECT-JOURNAL` / `DECIDED: C16-CONSUMES-PROJECT-JOURNAL` | invertible journal entries; the project journal (not the engine journal) is the undo/redo carrier; `JournalEntry` kinds |
| `docs/decisions.md` `DECIDED: CONTENT-EDIT-RE-TRAVERSAL` | the write-back + re-traverse coherence rule the commit satisfies (§4.4) |
| `docs/decisions.md` `DECIDED: DERIVED-DOC-FLOW` | doc-flow edges authoritative; the `data-doc-head` marker; the traversal's validation/fallback (§2.2/§3.2) |
| `docs/decisions.md` `DECIDED: ENGINE-AUTHORITATIVE-DOCUMENT-CRUD` | the engine's document-CRUD authority; the temporary-authority + sunset regime (§3.4 step 8, §9.3) |
| `docs/decisions.md` `DECIDED: ENGINE-ABSENT-REFUSES-WITHOUT-AN-ENGINE` | the engine-absence refusal and the **retained** typed/never-silent obligation (§3.5 item 8) |
| `docs/decisions.md` `DECIDED: SCOPED-LOAD` / `SCOPED-WALK` / `SINGLE-DOCUMENT-SUBGRAPH` / `DOC-CHILD` / `PLACEMENT-ONLY-PAYLOAD-ROOT` | the scoped walk, the doc-child nesting, the single-subgraph derivation and the placement rule the new-block representation satisfies (§3.3 item 8) |
| `docs/decisions.md` `DECIDED: STORE-QUALIFIED-BROADCAST` / `RAG-SNAPSHOT-PRESERVED` | the foreign-store drop; the snapshot seam preserved (§4.4) |
| `docs/decisions.md` `DECIDED: UI-CONFIG-CARRIER` | the persisted operator state the successor representation mode rides (§2.5, §5 item 5) |
| `docs/decisions.md` `DECIDED: REBUILD-ARCHIVE-POLICY` | archived-not-adapted; the archive is the rebuild's input; the coverage hole is recorded (§5, §6) |
| `docs/decisions.md` `DECIDED: D-GP-UFA-2` / `-3` / `-4` | no proxy PASS; painted oracle for `D-visual`; the report's row schema + the extended-row table (§8.3) |
| `docs/specs/design-extensions-review.md` | §3.3 C item `C9` (the unit + its conditions), §3.5 E (`C9`'s verification row), §3.6 F.2 item 4 (`decomposeRichHtml`), §6.2/§7.2 (the oracle pair), §7.4 (the matrix), §11.5/§12 (the read model), §12.4 (the dirty states), §12.5 (the failure UX), §12.7(a) (the reversal to restate), §12.8 (the re-scope), §13.1 P3/§13.3 (the program), §14.2 (the fence), §14.3 (the census rule), §14.5 (the temporary authority) |
| `docs/specs/unit-reads-pivot-tab-cache.md` | §3 (the sync-read contract — untouched), §5 (eviction/lifetime, the dirty-entry pin), §6.2 (the engine-absent surface), §6.3 (the commit sequence the cache expects), §7 (the register convention), §9 (its honesty bounds) |
| `docs/specs/unit-n-batch-atomicity.md` | the batch contract (`BatchOp`, `BatchResult`, the journal/rollback/persist rules) |
| `docs/specs/unit-import-batch-persist.md` | §1.1/§1.2 (the one-`applyBatch` path + the persist census), §2a/§2b (the invariant), §2d (IPC-EDIT-BATCH), §3 (states/fail-states/throw patterns), §5.1 (the trio budget), §5.2 (the control discipline), §7.1 (the census) |
| `docs/specs/unit-o-edit-ops.md` | the three rich-text ops' semantics (`setProps` MERGE, `setSubtree` replace, `setType` never delete+create) |
| `docs/specs/unit-l-textarea-editing-ui.md` | the **retired** textarea model (cited as the rebuild's input, never as the contract) |
| `docs/specs/test-pruning-disposition-2026-09-21.md` | §3.3.1 (the editing block), §3.4 (the KEEP groups), §5.3 (the 15 000 ms budget hazard), §6.1/§6.2 (the order of operations), §9.3/§9.3a (the moves and the absolute exclusions), §9.4 (the rebuild map), §9.5 (the coverage delta), §9.7 (the citation debt) |
| `docs/specs/requirement-catalog.md` | §3.4 rule 7 (the citation discipline), §5 (the FS register convention), §2.2 fact 3 (the oracle pair), §C.0/§C.4 (cite-never-edit) |
| `docs/specs/gnosis-offload-review.md` §7 A-5/A-6 | the parked `revision` field; the §5.U matrix cap (re-pin/extended row only) |
| `docs/requirement-catalog.md` | `PRUNE-300`, `PRUNE-310`, `PRUNE-311`, `PRUNE-314`, `PRUNE-601`, `PRUNE-613`..`PRUNE-617` (cited as pointers, never as status) |
| `docs/defects.md` | `WHOLE-PAGE-EDITING-REQUIREMENT`, `EDIT-MODE-TEXTAREA-UI`, `DOC-TITLE-NOT-EDITABLE`, `TABLE-CELLS-NOT-EDITABLE`, `DOC-HEAD-CONTAINS-FIRST-PARAGRAPH`, `CATALOG-CITES-NONEXISTENT-UNIT-SPEC` |
| `src/main/rich-decompose.ts` `decomposeRichHtml` / `DecomposeRichResult` | the **superseded** in-house decomposer (§3.1) — cited as the rebuild input of the archived suites, **never** as this unit's contract; the package + adapter replace it (2026-09-21, §11 amendment `11.9` item 1) |
| `node_modules/provident-editable/package.json` / `dist/index.d.ts` (`htmlToTree` / `diffTrees` / `providentPlainText` / `ProvidentNode` / `ProvidentTree` / `StructuralDiff` / `ProvidentNodeType` / `ConvertOptions`) / `dist/types.d.ts` / `dist/html-to-tree.d.ts` / `dist/diff.d.ts` / `dist/plain-text.d.ts` | the **ADOPTED decomposer**: version **0.2.0**, `type: module`, `parse5`-only, peer `provident-ssr >=0.4.0 <1.0.0`; the three runtime exports and the five types; the exact signatures, the 19-member `ProvidentNodeType` (with `text`), the `{root}` tree shape, the `StructuralDiff`/`NodeUpdate`/`EdgeChange` shapes, the XOR rule, the no-throw-for-malformed-HTML + throws-for-malformed-INPUT-SHAPE facts, and the two documented diff limitations (reorder of same-type+same-content siblings undetected; re-parent/reorder = `remove`+`add`) — all read from the installed dist (§3.1) |
| `node_modules/provident-ssr/package.json` | the **installed 0.5.1** that satisfies the adopted package's peer range (§3.1) |
| `package.json` (`dependencies` / `devDependencies`) | the adopted toolchain: `provident-editable ^0.2.0`, `provident-ssr ^0.5.1`, `@types/node ^24`, `vite ^8.3.0` (vitest 5's peer), `vitest ^5.0.1`; `--legacy-peer-deps` **retired** (§3.1; §11 amendment `11.9` item 3) |
| `src/main/page-diff.ts` `decodePage` / `buildPageOps` / `PageBlock` / `PageDecodeResult` / `PageOpsResult` / `PageDiffSnapshot` | the **ADAPTER** this unit pins: the ONLY importer of `provident-editable`; the decode (`htmlToTree` + the C9 field projection), the op builder (`diffTrees` + the change-kind→op mapping), the closed change-kind set, the refusal of an unmappable kind into the `FS5`/`ST-5` warning class, and the `text`-run/props projection rules (§3.1, §3.2) |
| `src/main/traversal.ts` `buildTraversal` / `buildSubtree` / `computeDocumentSubgraph` / `DocumentSubgraph` | the traversal authoring, the doc-child nesting, the `data-doc-head` derivation, and the **removed** textarea authoring (no `type: 'textarea'` child is authored at all — §5 item 3, §5.1; §11 amendment `11.9` item 2) |
| `src/main/rag-store.ts` `BatchOp` / `BatchResult` / `BatchOpResult` / `JournalEntry` / `applyBatch` / `applyBatchOp` / `RagNode` / `RagNodeType` / `RagEdge` / `RagNodeChild` / `docHeadForDocument` | the op unions, the journal kinds, the batch primitives, the node/edge/child shapes, the 23-member type census (§2.4, §3.2, §3.3) |
| `src/main/edit-ops.ts` `setType` / `setProps` / `setSubtree` / `createNode` / `handleEditBatch` / `handleEditCommit` / `EditOpContext` | the apply primitives, the batch handler, the single-node content write (kept for the MCP counterpart), the id-minting precedent (§2.4, §3.3, §5 item 6) |
| `src/main/markdown-parse.ts` `parseMarkdown` / `ParsedMarkdown` / `nextId` | the id scheme the new-block minting follows (§3.3 item 8) |
| `src/renderer/edit-controller.ts` `EditController` / `createEditController` / `CaretState` / `RichCaretEdge` | the surviving dirty-edit guard (whole interface kept) and the caret type's re-scope (§2.1, §6.4 item 1) |
| `src/renderer/rich-eligibility.ts` `isRichEditableRoot` / `EDITABLE_TYPES` | the retired per-node gate (archived, §5 item 4) |
| `src/renderer/sidebar-panes.ts` `applyEditingMode` / `RAG_EDITOR_HANDLER_DEFS` / `restoreRichCaret` / `applyEditorToolbar` / `textareaInput` / `textareaBlur` / `pageSurfaceInput` / `pageSurfaceBlur` / `pageEditSurfaceInput` / `pageEditSurfaceBlur` / the `commit-failed` `Map<tabId, failure>` | the retired splice/handlers (archived, §5 items 1/2/6), the surviving toolbar authoring (§2.3), the **adopted page-commit seam and its host-side `commit-failed` carrier** (§11 amendment `11.8` items 1/3) |
| `src/renderer/pane-graph.ts` `assembleAppGraphEnvelope` / `AppGraphAssemblyInput` / `AppGraphAssemblyResult` / `AppGraphAssemblyResult.envelope` / `zoneContainerChildren` / `paneSubtreeRoot` | the **app-graph/stage assembly** that authors the single editable surface (§2.1, §11 amendment `11.7`): the builder the renderer assembles the stage from, its pure result (`envelope`), the `zone:<name>` containers and the pane frames |
| `src/renderer/pane-graph.ts` `PAGE_EDIT_SURFACE_ID` / `DATA_EDIT_SURFACE` / `PAGE_EDIT_SURFACE_HANDLER_DEFS` / `PAGE_EDIT_SURFACE_INPUT_HANDLER` / `PAGE_EDIT_SURFACE_BLUR_HANDLER` / `PAGE_EDIT_SURFACE_INPUT_BODY` / `PAGE_EDIT_SURFACE_BLUR_BODY` | the surface root's stable authored id/marker and the **adopted page-commit seam defs and their bodies** (§2.1; §11 amendment `11.8` item 1) |
| `src/renderer/sidebar-panes.ts` `loadAppGraph` / `applyEditorToolbar` / `applyContentChange` / `applyDocumentSet` / `_currentDocumentId` / `applyEditingMode` | the host's stage-assembly seams: the successor surface authoring (§2.1, §11 amendment `11.7`), the retired per-node splice/`editingMode` authoring (§5 item 1), and the focused-document source of `data-edit-surface` |
| `src/renderer/content-reconcile.ts` `reconcileContentRoots` / `reconcileDocumentRoots` / `asContentRoot` / `isPaneLikeRoot` | the re-derive identity the warning-state survival rides (§3.5 item 6) and the pane-like classification the surface root owes (§11 amendment `11.7`, the cost) |
| `src/renderer/tab-state.ts` `TabState` / `TabEntry` / `TabTarget` / `closeTab` / `openTab` | the tab descriptor the per-tab dirty state is keyed by (§3.5 items 3/6) |
| `src/main/operator-settings-store.ts` `sanitize` / `coerceRepresentationMode` / `coerceEditingMode` (removed) / `set` / `get` | the persisted operator state path — the removed `editingMode` field and the **adopted successor `representationMode`** (§2.5, §5 item 5; §11 amendment `11.8` item 2) |
| `src/shared/types.ts` `IPC_EDIT_BATCH` / `EditBatchPayload` / `IPC_EDIT_COMMIT` / `EditCommitPayload` / `IPC_RAG_STORE_CHANGED` / `RagStoreChangedPayload` / `EditingMode` (removed) / `RepresentationMode` (adopted successor) / `OperatorSettings` | the commit channel, the kept single-node channel, the broadcast, the removed type/field and its **adopted successor** (§2.5, §3.3, §3.4; §11 amendment `11.8` item 2) |
| `src/renderer/pane-graph.ts` `editorToolbarContent` / `EDITOR_TOOLBAR_ID` / `representationModeLabel` (the successor of the removed `editingModeLabel`) | the toolbar authoring + the adopted representation-mode label (repointed, §2.3, §6.3 shape R-B; §11 amendment `11.8` item 2) |
| `tests/traversal.test.ts` + `tests/import-render-no-duplicates.test.ts` | the two FENCE suites — green, never re-derived, **except** `traversal.test.ts`'s child-list row, **RE-PLANNED by the 2026-09-21 ruling** (§5.1, §6.5, §11 amendment `11.9` item 2); the other file and every other row are pure controls |
| `archive/tests/2026-10-04-page-diff.test.ts` | the rebuilt diff suite: its **test-local reference decode/diff is DELETED** — it re-derives through the adapter (`src/main/page-diff.ts`) + the package (§6.2; §11 amendment `11.9` item 1) |
| `archive/tests/2026-10-04-single-editable-surface.test.ts` | the rebuilt suite whose **surface-shape rows** are re-derived against the app-graph/stage render (§2.1, §6.5, §11 amendment `11.7`) — its `buildTraversal`-reading rows no longer assert the surface |
| `archive/tests/2026-10-04-unit-u-shell-9b-h1-optionc-interception.test.ts` / `unit-u-shell-9b-h2-c20-materialization` / `unit-u-shell-9b-blind-greens` / `unit-r-traversal-inline-children` | the rewritten suites whose **per-node-host rows** are re-derived against the same app-graph/stage render (§6.3/§6.5, §11 amendment `11.7`) |
| `scripts/live-drive.mjs` `BLOCKS` / `MATRIX_ROWS` / `ufRealClick` / the O-0 harness | the live battery's home and its oracle-identity consequence (§8.3) |
| `src/shared/o0-report.ts` | the other half of the oracle pair — **not touched by this unit** (§8.3) |

---

## 13. REPORT TO THE SUPERVISOR (what this spec's landing pass must be able to say)

1. **Written:** `docs/specs/unit-u-edit-1-whole-page-editing.md` (this file) — the `C9 U-EDIT-1`
   contract for `WHOLE-PAGE-EDITING` + `ST-1`/`ST-3`/`ST-4`/`ST-5`/`ST-6` (+ the covered half of `ST-2`).
2. **The editing model:** ONE `contenteditable` surface per document, **authored at the
   app-graph/stage-assembly layer** (`assembleAppGraphEnvelope` + the host `applyEditorToolbar` seam —
   it is **not** a traversal-envelope payload node; §2.1, §11 amendment `11.7`); the doc-head/body split with
   arrow-key caret crossing and the title as the doc-head node's `content` (committed on blur, with
   `data-doc-head` preserved by `setProps`'s MERGE); markdown mode = plaintext in the same surface,
   monospace, no HTML formatting, live markdown formatting **parked**; the element-type pane applies
   `setType`-class writes over the closed 23-member `RagNodeType` set, never delete+create.
3. **The commit contract:** the decomposer is **`provident-editable@0.2.0`**, **ADOPTED as the
   production decomposer** (`htmlToTree` for the decode, `diffTrees` for the diff) with
   **`src/main/page-diff.ts` as the pinned ADAPTER** — the only module that imports the package, mapping
   its own `ProvidentTree`/`StructuralDiff` shape (19-member type union incl. `text` runs — **not**
   C9's `{content, children}`/`RagNodeType`, and **no** `BatchOp`/`applyBatch`/journal) onto the
   **closed field set `{type, content, children, props}`** and the op set
   (`putNode`/`setProps`/`setSubtree`/`setType`/`putEdge` + `removeNode`/`removeEdge`), with the
   change-kind→op table, the **new-block** `putNode` + `doc-child` `putEdge`, the **props** mapping
   (changed RAG-owned keys into a MERGING `setProps`), the **split/merge** detection (package
   `update`+`add` / `update`+`remove`), the explicit **non-diffed** runtime props
   (`contenteditable`, `data-edit-surface`, `data-node-id`, `data-doc-head`), the **`text`-run**
   flattening, and the adapter's **failure modes** (a package throw / an unmappable kind ⇒ the
   **`FS5`/`ST-5` warning class**, never a silent partial write); a new block is
   a `putNode` + a `doc-child` `putEdge` with a host-minted, collision-free `${documentId}:${type}:${n}`
   id; the commit is **ONE `applyBatch` = one invertible `batch` journal entry = one persist** (`COARSE`
   undo, an explicit decision — **unchanged by the adoption**); the write sequence is the §12.7(a)
   reversal restated with the engine batch route **OWED**; a failed commit leaves the store unchanged
   (bytes equal, 0 persists) and sets the per-tab `commit-failed` state with a typed `CommitFailure`
   surfaced through the `TAB-1` class, and **the warning survives a re-derive because it is host-side
   state, never DOM**. **The in-house `decomposeRichHtml` premise (and `DECIDED:
   RICH-TEXT-EDITING-GATE`'s in-house clause) is SUPERSEDED — §11 amendment `11.9` item 1.**
4. **Supersessions:** `DECIDED: EDITING-MODE-SETTING` and `DECIDED: FORM-CONTROL-EDITING` →
   **SUPERSEDED at THIS unit's landing** (not before), each enumerating its **surviving clauses** (the
   mode-broadcast contract; commit-on-blur; the re-traversal; the dirty-edit guard); `DECIDED:
   WHOLE-PAGE-EDITING` moves from `not yet implemented` to implemented-by-this-unit with its owed
   live row recorded as `U-EDIT-1-LIVE`.
5. **The archive code:** `applyEditingMode`; the 4 `rag-editor-*` defs + their bodies + `restoreRichCaret`;
   `isRichEditableRoot` + `EDITABLE_TYPES` (whole module, one importer); the `editingMode` setting path
   (`EditingMode`, the `OperatorSettings` field, `coerceEditingMode`, `editingModeLabel`, the
   `settingsContent` toggle); the `rag-textarea-*` defs + the `textareaInput`/`textareaBlur` API and
   the renderer's per-node `IPC_EDIT_COMMIT` caller; the `kind: 'textarea'` caret arm — each with its
   `archive/src/<date>-<name>.ts` destination, its consumers-that-must-change-first, and the rule that
   a module with a live importer is never archived first. **`EditController` and
   `src/renderer/edit-controller.ts` are NOT archived** (35 live harness importers; the interface is
   kept whole).
6. **Test disposition:** **REBUILD 17** (the archived suites of the `C9` rebuild-map row, re-derived
   from this spec, never from their old assertions) · **REWRITE 26** (§6.3's per-file table, which is
   the work list and the authority, under the four pinned rewrite shapes R-A…R-D — never a
   relaxation) · **KEEP 137** · **DELETE 0** (retirement is an archive move, never a hard delete) —
   summed against the current 180-file tree with the two probes stated in §6.1, and with the
   deliberate non-break named there (the `≈35` `createEditController` harness files are **not**
   rewritten). **The four figures are §6.1's census, now stated identically in §8.2 item 7 / §8.4 /
   §13 (§11 amendment `11.9` item 7), and the diff suites re-derive through the adapter + the package
   (the test-local reference decode/diff is deleted, §6.2).**
7. **The register:** 7 rows (`P-IM-1`..3, `P-SM-1`..2, `P-TP-1`..2), seed `0xED170001`, budget
   `63 × 6 + 22 = 400`, stop-after-5, `held`/`broken` per row, **control-draw reporting mandatory**.
   **Adjudicated at the landing (§11 amendment `11.8` item 4):** `P-IM-2`'s population is restricted to
   **non-empty** mutation subsets (remedy (a), against `P-TP-2`'s `S = ∅ ⇒ 0`); the row count, the seed
   and the budget are **unchanged** (`63 × 6 + 22 = 400`).
8. **The escalations:** the **fence/`ST-6` conflict — RESOLVED 2026-09-21** (the tombstone is dropped
   and `tests/traversal.test.ts`'s child-list row is re-planned, §11 item 2/§11.9 item 2);
   the **engine batch route** (OWED to `U-AUTHORITY-SWITCH`); the **`applyBatchOp` rich-op gap** (a
   red obligation, not a new union member); the **missing `docs/skills/designing-pages.md`** (owed);
   the **catalog's phantom-package row** (owed to the catalog pass, now a **version correction**);
   the **O-0 oracle-identity re-run** the live blocks owe (§11 items 7/8); and the **package's
   table-element capability gap** (§11 item 9 — a handoff item, never a patch here).
9. **Sequencing:** before `TAB-1`/`TAB-2`; not re-opening O-9/O-10 or the O-5 chain; not touching the
   O-0 oracle pair (`src/shared/o0-report.ts`) — except `scripts/live-drive.mjs`'s own new block,
   recorded as an **oracle-identity change with its own live re-run**; the fence suites unchanged; and
   the citation duty (§9.4) discharged for this unit's ≈200-citation share.
10. **Layer:** PURE + ASSEMBLED/RENDERER + ENGINE-DEPENDENT; **nothing app-green**, with the **MANDATORY
    live battery** (§8.3) as the pre-DONE gate.
11. **The 2026-09-21 amendment (`11.7`) — the surface's layer:** the single editable surface is a
    **provident node of the app graph/stage assembly** (built by `assembleAppGraphEnvelope`, authored
    through the host's `applyEditorToolbar` seam), **not** a traversal-envelope payload node; the
    implementer's four-placement proof is the recorded contradiction and the fence suite
    `tests/traversal.test.ts` stays untouched (**read with §11 amendment `11.9` item 2: the fence's
    **child-list row alone** is RE-PLANNED by the 2026-09-21 ruling; §11.7's "untouched" statement
    otherwise stands**), with the envelope-shape rows of
    `archive/tests/2026-10-04-single-editable-surface.test.ts` and the per-node-host rows of
    `unit-u-shell-9b-h1-optionc-interception` / `unit-u-shell-9b-h2-c20-materialization` /
    `unit-u-shell-9b-blind-greens` / `unit-r-traversal-inline-children` re-derived against the
    app-graph/stage render.
13. **The 2026-09-21 amendment (`11.9`) — the decomposer adoption, the tombstone drop, the fence
    re-plan:** the decomposer is **`provident-editable@0.2.0`** (`htmlToTree`/`diffTrees`, verified from
    the installed dist) with the **adapter `src/main/page-diff.ts`** pinned as the mapping contract,
    and `DECIDED: RICH-TEXT-EDITING-GATE`'s in-house clause **SUPERSEDED at landing** (§4.1's added
    row); the **textarea tombstone DROPPED** — no `textarea` child is authored at all, **the
    `tests/traversal.test.ts` child-list row is RE-PLANNED as the single authorized fence change**, and
    §8.3's zero-`<textarea>` census reads zero **honestly**; the test-local reference decode/diff
    **deleted** (the diff suites re-derive through the adapter + the package); the three vacuous
    register rows (`P-SM-1`, `P-SM-2`, `P-IM-1`) **amended to be falsifiable** (seed and the
    `63 × 6 + 22 = 400` total unchanged, the re-tally internal to `P-SM-1`); the toolchain
    (`@types/node ^24`, `vite ^8.3.0`, `provident-ssr ^0.5.1`, `--legacy-peer-deps` retired) recorded;
    and **two owed items named**: `U-EDIT-1-LIVE`'s blocks **must be added to `scripts/live-drive.mjs`
    and therefore owe an O-0 re-run** (RCA-11 — the oracle identity is invalidated by the addition),
    and the package's **table-element capability gap** is a handoff item (`AGENTS.md` item 7).
14. **The 2026-09-21 amendment (`11.8`) — adopted names + the register adjudication:** the page-commit
    seam is pinned as **`page-edit-surface-input`/`page-edit-surface-blur`** (handler defs) →
    **`pageSurfaceInput`/`pageSurfaceBlur`** (bridge methods), with the **surviving-seam census rule**
    (§5 item 6 states the same set: **six** retired per-node defs + **six** retired per-node bridge
    methods; **two + two** surviving); the successor mode field as
    **`representationMode: 'html' | 'markdown'`** (§2.3/§2.5/§4.1); the `commit-failed` carrier as a
    **host-side `Map<tabId, failure>` in the `SidebarPanes` host** — host state precisely so the warning
    survives a re-derive and is **never a diffed content change**; **`P-IM-2`** adjudicated by remedy
    **(a)** — its population restricted to **non-empty** mutation subsets, the invariant **not weakened**
    (recorded, never silently relaxed), **no re-tally** (7 rows, seed `0xED170001`,
    `63 × 6 + 22 = 400`); plus the **layer honesty restatement** (the landed green is
    envelope/store-green; **`U-EDIT-1-LIVE` is un-run and owed**) and the **archive record** (two
    `archive/src/2026-09-21-*.ts` moves, importer-free at the move) — so §5 and the actual archive
    agree.

---

### 11.10 AMENDMENT (2026-09-22 — the adapter's decode source, the depth guard, and the table split: the drifted clauses of §3.1/§3.2, corrected against the landed adapter)

**Why this amendment exists.** The unit's adapter **landed** (`src/main/page-diff.ts`, the module §3.1
pins), and reading it against the ADOPTED package's dist shows **three facts §3.1/§3.2 recorded
otherwise**, plus **four behaviours the landed adapter depends on that a reader would otherwise have to
re-derive from the code**. This amendment **corrects the drifted clauses in place** (each supersession is
marked at the clause, above, and cross-referenced here) and **records the landed facts with their
verification anchors**. It authors **no new contract surface and no new fail-state**: the
`FS1`..`FS24` numbering is untouched, §7's register (7 rows / seed `0xED170001` /
`63 × 6 + 22 = 400`) is untouched, §6.1's census is untouched, §4.1's supersession **set** is
untouched, and the §3.3 one-`applyBatch`/journal/persist clauses are untouched.

**The verification convention for this section (so the file's own citation rule is not broken).** The
head matter above pins that this file cites `path` + symbol / row id / `§section` and that **no line
number appears in it** (`docs/specs/requirement-catalog.md` §3.4 rule 7). This amendment's claims are
**verification anchors — a tree reading taken at the stated date, not citations to be followed**: the
**path + SYMBOL is the citation**, and a line number is recorded **only** because the amendment exists
to pin a drift between a document and a specific tree state (any edit of those files shifts it). Every
anchor below was read in the tree at this pass: `src/main/page-diff.ts` (the landed adapter),
`node_modules/provident-editable/dist/html-to-tree.js` (the ADOPTED converter),
`node_modules/provident-editable/dist/parse.js`, `src/renderer/sidebar-panes.ts` (the landed commit
seam), `src/main/rag-store.ts` (`BatchResult`) and `src/main/edit-ops.ts` (`handleEditBatch`'s
`EditBatchPayload` validation).

| Anchor | Symbol (the citation) | Line (the anchor) |
| --- | --- | --- |
| `node_modules/provident-editable/dist/html-to-tree.js` | `MAX_DEPTH` (the recursion cap) + its doc-comment | 9, 3–8 |
| `node_modules/provident-editable/dist/html-to-tree.js` | `BLOCK_TAGS` (the converter's closed block tag set) | 11–14 |
| `node_modules/provident-editable/dist/html-to-tree.js` | `buildChildren`'s `if (d > MAX_DEPTH) return` (the silent subtree drop) | 329–330 |
| `node_modules/provident-editable/dist/html-to-tree.js` | `buildBlock`'s `if (depth > MAX_DEPTH)` cap-depth node | 439–442 |
| `node_modules/provident-editable/dist/html-to-tree.js` | `extractPreText` / `buildInline` depth guards | 463, 487–488 |
| `node_modules/provident-editable/dist/html-to-tree.js` | `isPlainLeaf`'s `if (depth >= MAX_DEPTH)` early return | 432–433 |
| `node_modules/provident-editable/dist/html-to-tree.js` | `getAttr` — the ONLY attribute reader | 55–61 |
| `node_modules/provident-editable/dist/html-to-tree.js` | `buildInline` `img` arm (`getAttr(node,'src')`/`'alt'`) | 492–493 |
| `node_modules/provident-editable/dist/html-to-tree.js` | `buildInline` `a` arm (`getAttr(node,'href')`) | 529–533 |
| `node_modules/provident-editable/dist/html-to-tree.js` | the unknown-element flatten rule (`buildChildren` / `buildTopLevel`) | 391–395, 558–574 |
| `node_modules/provident-editable/dist/parse.js` | `parseHtml` (`parseFragment`) — no attribute projection | 7–9 |
| `src/main/page-diff.ts` | `PACKAGE_MAX_DEPTH` (the adapter's mirror of the package cap) | 253 |
| `src/main/page-diff.ts` | `maxNestingDepth` + the decode's depth refusal | 260–276, 414–419 |
| `src/main/page-diff.ts` | `decodePage`'s surface-root marker read (the `PAGE_EDIT_SURFACE_ROOT_ID` branch) | 107, 365–378 |
| `src/main/page-diff.ts` | `UNEXPRESSIBLE_BLOCK_TAGS` / `PAGE_BLOCK_TAGS` / `NEW_BLOCK_TAGS` | 79, 74, 87 |
| `src/main/page-diff.ts` | `scanPageElements` / `parseAttrs` (the raw-source read) + the per-block fragment decode | 224–244, 187–196, 413–431 |
| `src/main/page-diff.ts` | `buildPageOps`'s marker-agreement refusal; `foreignNodeIds` + the build refusal | 844–854; 638–662, 689–698 |
| `src/main/page-diff.ts` | the type+content branch (BOTH ops: `putNode` then `setType`) | 799–811 |
| `src/renderer/sidebar-panes.ts` | `isAcknowledgedBatch` / `storeRejectedFailure` | 434–439, 446–460 — **[SUPERSEDED ANCHORS 2026-09-22 — §11.11 item 1: `acknowledgedRecordId` 437–439, `acknowledgesOp` 448–486, `isAcknowledgedBatch` 481–487, `storeRejectedFailure` 494–508]** |
| `src/main/rag-store.ts` / `src/main/edit-ops.ts` | `BatchResult`'s one-result-per-op arm; the `ops must be an array` payload guard | 195, 217; 445, 1377 |

1. **The decode's source: the adapter reads RAG identity/props from the RAW PAGE SOURCE; the decoded
   tree CANNOT carry them (the package is attribute-blind).** Read from the installed dist: the
   converter's **only** attribute reader is `getAttr` (`dist/html-to-tree.js` 55–61), called in exactly
   **three** places — the `img` arm (`src`/`alt`, 492–493) and the `a` arm (`href`, 529–533). Every
   other element yields a node with **no `props` at all**, and `parseHtml` projects no attribute map
   either (`dist/parse.js` 7–9). **Therefore `data-rag-node-id`/`data-rag-props`/`data-edit-surface`
   are DROPPED by `htmlToTree`, and the decoded tree cannot carry block identity or RAG-owned props.**
   **Landed adapter (the restatement §3.1 now needs):** `decodePage` scans the page's **raw HTML** for
   every element start tag with its attributes (`scanPageElements`/`parseAttrs`, `src/main/page-diff.ts`
   224–244 / 187–196), reads `data-rag-node-id`, `data-rag-props` and the surface marker off the
   **source**, and then decodes **each block element's own fragment** through `htmlToTree` (413–431), so
   a surface artifact between two blocks cannot shift a block's projection. The per-node ids the
   adapter mints for the package-side trees (`next-<i>`/`prev-<i>` and the `-r`/`-c` run/child ids) are
   the adapter's **own reconciliation keys**, never RAG ids (§3.2's non-diffed bullet already states
   this). **Clauses marked superseded in place:** §3.1's table note, §3.1 item 1, and §3.2's decode
   step-1 paragraph. **Upstream defect row (OWED, named here so it is not lost):** the attribute drop is
   a **package limitation** — a converter that cannot carry its consumer's own authored identity — and
   belongs in `docs/defects.md` + `docs/HANDOFF.md` as an UPSTREAM/dependency row of the same class as
   the table gap (`AGENTS.md` item 7: catalogue + handoff, **never** a patch here). **It is NOT filed at
   this pass** (a SpecDoc pass writes no tracker, and this pass's scope is this file only): the **row is
   OWED**. **Not a workaround:** the adapter must not re-encode the identity into a tag the converter
   happens to keep.
2. **The converter's depth cap silently DROPS content past `MAX_DEPTH` — so the adapter refuses an
   over-deep page instead of reading a truncated tree.** Read from the dist: `MAX_DEPTH = 512`
   (`dist/html-to-tree.js` 9) and the cap is **not** an error path — `buildChildren` returns early
   (`if (d > MAX_DEPTH) return`, 329–330), `buildBlock` returns a content-less cap-depth node
   (`if (depth > MAX_DEPTH) return { id: '', type: tag, content: '', build: '' }`, 439–442),
   `extractPreText`/`buildInline` return empty for a too-deep element (463, 487–488), and `isPlainLeaf`
   refuses to fold a cap-depth block's text into an ancestor (`if (depth >= MAX_DEPTH) return false`,
   432–433). The converter's own doc-comment states it as intended ("Content at/below this depth is
   truncated/dropped deterministically", 3–8). **Landed adapter:** `PACKAGE_MAX_DEPTH = 512`
   (`src/main/page-diff.ts` 253) and `decodePage` REFUSES the page when a block fragment's maximum
   element-nesting depth exceeds it (`maxNestingDepth` 260–276; the refusal 414–419 — the
   `decompose-failed` class, store untouched, `FS7`), **never** reading the truncated tree the package
   would have produced. **RECORDED LIMITATION + OWED VERIFICATION (pinned so no later pass reads the
   guard as exact):** the adapter's guard and the package cap are **different measures** — the package's
   `MAX_DEPTH` is a **per-node recursion depth** inside its own parsed tree, while the adapter's
   `maxNestingDepth` is a **raw-markup element-nesting count** over the block's **own fragment** (every
   non-void, non-self-closing start tag opens a level; no tag-closure validation, no account of parse5's
   implicit elements). The **boundary between the two is UNVERIFIED**: this pass established neither
   (a) whether a page the adapter ACCEPTS can still be truncated by the package, nor (b) whether the
   adapter REFUSES a page the package would decode faithfully (the guard is conservative in the
   raw-markup direction). **Owed:** a boundary draw — the `P-TP-1` deep-totality row's territory, which
   already pins that the draw must terminate through the adapter's **typed failure arm, never a stack
   exhaustion** — must establish the relation, and §3.1's depth sentence must then be corrected to what
   it finds. **Not a fail-state:** the refusal is the pinned behaviour; what is unverified is the exact
   **boundary**, not the contract.
3. **`BLOCK_TAGS` carries no `table`/`thead`/`tr`/`td`/`th`, and the converter flattens a table
   silently — a stored table node is structurally inexpressible on the page path.** Read from the dist:
   `BLOCK_TAGS` = `h1`..`h6`, `p`, `ul`, `ol`, `li`, `blockquote`, `pre`, `div`
   (`dist/html-to-tree.js` 11–14) — **no table-family member** — and there is **no table-specific
   handling anywhere in the converter** (`table` reaches the unknown-element rule: "skip it, keep its
   text (flatten into the run)", 391–395 / 558–574). **The consequence for the op mapping is now stated
   in §3.1** (a table block **is refused** — the `decompose-failed` class — and **cannot round-trip**):
   a `setType` to `table`/`thead`/`tr` cannot be honoured, a stored table structure cannot be
   re-decoded, and **no op may retype, remove or flatten it** (`FS14`'s data-loss class). **The landed
   split (pinned so a test cannot over-claim "every table tag refuses"):** the adapter's
   `UNEXPRESSIBLE_BLOCK_TAGS` = `table`/`thead`/`tr` (refused, `src/main/page-diff.ts` 79) while
   `PAGE_BLOCK_TAGS` = the package set **+ `code` + `td`/`th`** (74) and `NEW_BLOCK_TAGS` includes
   `td`/`th` (87) — so a **cell** element is decoded as a standalone **leaf block**, never as a table
   structure (its row/table containment is not reconstructed). **Cross-reference:** the ESCALATED
   handoff row **`PROVIDENT-EDITABLE-NO-TABLE-ELEMENTS`** (`docs/defects.md` — UPSTREAM/dependency,
   never patched here) and §11 item **9**.
4. **Landed behaviours this spec now depends on (recorded, with their evidence) — and where a clause
   already says the same.**
   - **(a) The decode takes the SURFACE ROOT's `data-edit-surface`, not the first marker anywhere:**
     `decodePage` assigns the page's document id only from the element whose `id` is the pinned
     `page-edit-surface` root (`PAGE_EDIT_SURFACE_ROOT_ID`, `src/main/page-diff.ts` 107; the read
     365–378); a marker found anywhere else is a **fallback only when the root authored none** and can
     never override the root's id. **UNPINNED by §3.1/§3.2 — pinned here.**
   - **(b) `buildPageOps` refuses a marker that disagrees with the committing document** (844–854) and
     **refuses any block the snapshot scopes to another document** (`foreignNodeIds` 638–662; the build
     refusal 689–698) — so a **foreign/unowned node is never written**. §3.6 already pins that an
     un-attemptable commit leaves the store untouched and `FS19`/`FS7` cover the silent-success and
     partial-write classes, but this **ownership refusal is STRICTER than §3.1's wording** (which said
     only that an **out-of-document difference is not diffed**, §3.2's non-diffed bullet): a foreign
     page is refused **with no op list at all**, not merely skipped.
   - **(c) A type + content change on ONE block emits BOTH ops** — the landed branch emits the node's
     `putNode` (which preserves the store node's `type`, so the write and the retype cannot race) **and
     then** the `setType` (799–811), where §3.1's mapping table listed the two rows separately and §3.2's
     minimal-op rule ("exactly one write for that node") could be read as demanding a **single** op.
     **The minimal-op rule is NOT weakened:** its subject is one op per **DIFFERENT FIELD SET**, and a
     simultaneous type+content edit is two fields — a **type-ONLY** edit still emits **one** `setType`
     and touches nothing else (`FS6`), and both ops land inside the **one** `applyBatch` (§3.3 items
     1/2, so the atomicity pin is untouched).
   - **(d) Success requires an ACKNOWLEDGED one-result-per-op `BatchResult`:** `isAcknowledgedBatch`
     requires a boolean `ok: true` **and** a `results` array at least as long as the op count **[SUPERSEDED IN PLACE 2026-09-22 — §11.11 item 1: this reading and the anchors below record the reader as it stood at §11.10, not the LANDED contract, which is STRICTER: EXACTLY one agreeing `BatchOpResult` per op with per-entry agreement; landed anchors `src/renderer/sidebar-panes.ts` `isAcknowledgedBatch` 481–487, `acknowledgesOp` 448–486, `acknowledgedRecordId` 437–439, `storeRejectedFailure` 494–508]**
     (`src/renderer/sidebar-panes.ts` 434–439 **[SUPERSEDED ANCHOR 2026-09-22 — §11.11 item 1: the landed `isAcknowledgedBatch` is 481–487, `acknowledgesOp` 448–486, `acknowledgedRecordId` 437–439]**; `src/main/rag-store.ts` pins the success arm as "one
     `BatchOpResult` per op, in order"), and a **partial or absent acknowledgement is a typed
     failure — `kind: 'store-rejected'`, carrying the record's own message and NO fabricated
     `failedIndex`** (`storeRejectedFailure` 446–460 **[SUPERSEDED ANCHOR 2026-09-22 — §11.11 item 1: `storeRejectedFailure` is now 494–508]**, covering `undefined`/`null`/`{}`/`{ ok: 'yes' }`
     and `{ ok: true }` with no `results`). §3.6's closing sentence already pins the class ("a commit
     that reports success without an acknowledged write is the worst outcome in this unit", `FS19`):
     **the one-result-per-op acknowledgement is what "acknowledged" MEANS at the carrier**, recorded
     here so the TestWriter derives the partial-acknowledgement case from `FS19` rather than
     re-deriving the threshold from the code. (`src/main/edit-ops.ts` `handleEditBatch` pins the
     mirror-image payload guard: a non-array `ops` is a domain failure with `failedIndex: 0`.)

**What this amendment does NOT change.** The `FS1`..`FS24` numbering and text (§8.1) — **no fail-state
is added, restated or renumbered**; §7's register rows / seed / budget; §6.1's class census and §6.3's
per-file work list; §4.1's supersession **set**; §3.3 items 1–6 (one `applyBatch`, the single `batch`
journal entry, one persist, the checked result) and item 8 (the new-block id/edge shape); §3.4's write
sequence and its OWED engine route; §3.5's `CommitFailure` shape and the host-side
`Map<tabId, failure>` carrier; and §9's sequencing gates. **Exactly three clause groups change** —
§3.1's decode source and depth sentence, §3.2's decode step-1 paragraph and its table clause, and the
landed behaviours of item 4 above — and **every one is marked at the clause, not only here.**

---

### 11.11 AMENDMENT (2026-09-22 — the OUTSTANDING adversarial record for `C9 U-EDIT-1`, and the acknowledgement correction)

**Why this amendment exists.** The unit's RCA-3 adversarial pass ran **twice** — an **ORIGINAL** pass with a
five-item MUST-FIX set and a **SECOND** pass with four residuals — and **neither its findings nor their fix
status had been recorded in this file**, while §8.2 item 5 promises them at §3a/§3b. **That is the process
violation this amendment closes.** It (1) corrects the one landed behaviour that is **STRICTER** than
§11.10 item 4(d) recorded, (2) fixes the live battery's status, (3) adds the **§3a/§3b** adversarial sections
above §4, and (4) records the register's residual gaps as **SPEC-NOTES** so a later pass does not re-derive
them. It authors **no new contract surface and no new fail-state**: the `FS1`..`FS24` numbering and text,
§7's register rows / seed / budget, §6.1's class census, §6.3's per-file work list, §4.1's supersession
**set**, §3.3's one-`applyBatch` / journal / persist clauses, §3.4's write sequence and its OWED engine
route, and §3.5/§3.6's carriers are all **unchanged**. The verification convention is §3a's (the §11.10
anchor rule): **path + SYMBOL is the citation**, a line number is a tree reading taken at this pass.

1. **The §11.10 item 4(d) correction — the landed acknowledgement reader is STRICTER than recorded.**
   §11.10 item 4(d) recorded the reader as requiring *"a boolean `ok: true` **and** a `results` array **at
   least as long as the op count**"*; **that is SUPERSEDED IN PLACE** (marked at the clause above, with both
   of its now-stale anchors). **The landed contract is: exactly ONE agreeing `BatchOpResult` per op.** Read
   in the tree at this pass:
   - `src/renderer/sidebar-panes.ts` `isAcknowledgedBatch` **481–487** — a boolean `ok: true`, a `results`
     array whose length **equals** the op count (`results.length !== ops.length` ⇒ refusal, so an OVER-LONG
     array is no longer success), and `ops.every((op, index) => acknowledgesOp(results[index], op))` (486);
   - `acknowledgesOp` **448–486** — **per-entry agreement**: the entry's `op` kind must equal the op's own
     (`r.op !== op.op` ⇒ false, 451), and every identity the entry carries must be that of the op it
     acknowledges — `acknowledgedRecordId` **437–439** reads `node.id` / `edge.id`, and an absent identity
     "carries no contrary claim" (452–455);
   - `storeRejectedFailure` **494–508** — the failing path's typed `store-rejected`, carrying the
     `BatchResult`'s `error`/`failedIndex` **verbatim** and fabricating neither (a `{ ok: true }` with no
     acknowledged write for every op gets the message at 500, **no** `failedIndex`).
   **The store-side shape this reads against** (`src/main/rag-store.ts`): `BatchResult` pins the success arm
   as *"one `BatchOpResult` per op, in order"* (195–197, 212–217) and `applyBatchOp` **1244** emits exactly
   one result per applied op (1258 / 1262 / 1267 / 1279 — `BatchOpResult` itself 198–207). **Derived
   fail-state class (unchanged, not new):** a partial, over-long, junk or mis-acknowledging `results` array
   is `FS19`'s silent-success class — it KEEPS the dirty flag and records the typed failure (regression rows
   `archive/tests/2026-10-04-page-commit-failure-visibility.test.ts` `C1` 282 / `C2` 311, and
   `archive/tests/2026-10-04-page-commit-scope-ack-race.test.ts` `N3` 425 with its control 462).

2. **`U-EDIT-1-LIVE` status: IN PROGRESS / OWED — never "done".** The battery's **authoring** obligation
   (§8.3, §11.9 item 6) is **satisfied**: the driver carries the `U-EDIT-1-LIVE-1`..`-8` extended rows
   (`scripts/live-drive.mjs` 2882–2893) and their block implementations (from 4984, the `u_edit_1_live_*`
   handlers, including the table-refusal row and the caret round-trip row). **The RUN obligation is NOT
   satisfied:** no run result is recorded in this tree, so **no live measurement exists** for §8.3 items
   1–8 and the unit is **not pre-DONE** (RCA-11/RCA-12). **Consequences recorded:** (a) §11 item **8**'s
   *"the battery's blocks do not exist in `scripts/live-drive.mjs` yet"* clause is **SUPERSEDED IN PLACE**
   (the row now reads *authoring done, RUN owed*); (b) §11 item **7**'s **O-0 oracle-identity re-run** stays
   **OWED** — the driver is half of the oracle-hash pair, so the block addition invalidated the recorded
   identity and the before/after hash re-read is still owed to the pass that actually runs it; (c) this
   amendment makes **no live claim** and performed no hash computation.

3. **The §3a/§3b adversarial record — ADDED (§8.2 item 5 is now satisfied, not merely promised).** §11.11
   adds, immediately above §4: **§3a** (the ten HOST findings — the ORIGINAL pass's `M1`..`M5` MUST-FIX set
   with each resolution and regression row, and the SECOND pass's `N1`..`N4` residuals with each fix and
   regression row; plus the **measured NON-FINDINGS** and the one **open host residual**), and **§3b** (the
   PACKAGE findings, cross-referenced, never patched). **What that record fixes, in one line each:** `M1`
   foreign/unowned-node writes are now refused (the surface-root marker read + the marker-disagreement
   refusal + the foreign-node refusal, all in `src/main/page-diff.ts`); `M2` the commit is ONE `applyBatch`
   whose `BatchResult` is read; `M3` a simultaneous type+content edit emits BOTH ops; `M4` is recorded
   IN PROGRESS/OWED (item 2 above); `M5` the warning is authored at failure time through the content
   reconcile and cleared on a later success; `N1` the commit scope is `stageDocumentScope()`; `N2` the
   deletion scan's membership mirrors `computeDocumentSubgraph`; `N3` the acknowledgement is one agreeing
   result per op; `N4` a per-subject sequence discards post-`await` resolutions after a drain. **No
   fail-state is added, restated or renumbered** by §3a/§3b: each finding is mapped to an EXISTING class
   (`FS1`..`FS24`) and each fix is pinned by an existing regression row.

4. **SPEC-NOTES — the register's residual gaps (recorded, with status).** These are **records, not
   relaxations**: no register row, budget or proposition is weakened, and each note names what a later pass
   must still do.
   - **`SN-1` — the props arm's PRODUCTION REACHABILITY is unestablished.** `data-rag-props` has **no
     production authoring**: a `grep` over `src/**` for the attribute finds **only the adapter's own reader**
     (`src/main/page-diff.ts` `ATTR_RAG_PROPS` 99, its projection note 130, the raw-source comment 170) and
     **no writer** — nothing in `src/**` authors the marker onto a rendered page. The consequence is exact:
     §3.1's `setProps` mapping row and §7 `P-IM-1`'s amended **props arm** are exercised only by
     harness-authored pages, so a RAG-owned-prop difference cannot arise on a production surface as the code
     stands. **Status: SPEC-NOTE — reachability UNVERIFIED in production** (the arm is contract-pinned and
     test-exercised; its production path is not). Not a fail-state, and **not** a reason to drop the arm.
   - **`SN-2` — `P-TP-1`'s duplicate-`ragId` semantics are UNPINNED in §7's proposition.** The row's draw
     matrix contains *"a page with duplicated ids"* but pins **only** totality/determinism for it; the spec
     states no semantics for a page that renders the same `ragId` twice (a double write of one block, or a
     typed refusal). The **test side has been repaired**: `tests/unit-u-edit-1-property-register.test.ts`
     asserts the draw is non-vacuous (1249) and that the op list carries **at most ONE** write per duplicated
     `ragId` (1243–1258, counterexample 1255). **Status: SPEC-NOTE — repaired test-side only; §7's `P-TP-1`
     proposition and draw still do not state the rule**, so the TestWriter must read it from the regression
     row, not from §7 (owed to the next §7 amendment; no budget or row change is implied).
   - **`SN-3` — `P-TP-1`'s "quarantined node" member was MISLABELLED; the real mechanism is the store's
     boot hash-mismatch quarantine.** §7's row reads *"a store with a quarantined node"*, but the earlier
     member did not construct a genuine quarantine. **The real mechanism** is the store's own: a record whose
     stored SHA-256 hash no longer verifies is marked `quarantined` at boot and excluded from the active set
     (`src/main/rag-store.ts` 701–702 / 715–716, and the edge cascade 718–724; surfaced through
     `status().quarantined`, 1464–1473). The **test side has been repaired**: the row now draws a
     **tampered-record-hash** store and asserts the quarantine set is real (1173–1190), that no op names the
     quarantined id, and that the quarantine set survives the draw (1259–1274). **Status: SPEC-NOTE —
     repaired test-side; §7's wording is unchanged and still names the mechanism only as "a store with a
     quarantined node"** (the mechanism is now pinned HERE so it is not re-derived).
   - **`SN-4` — the DEPTH-BOUNDARY verification is still OWED and UNVERIFIED.** §11.10 item 2 records that
     the adapter's `maxNestingDepth` (a raw-markup element-nesting count over a block's own fragment,
     `src/main/page-diff.ts` 260–276) and the package's `MAX_DEPTH` (a per-node recursion depth,
     `PACKAGE_MAX_DEPTH = 512` mirrored at 253, the refusal at 414–419) are **different measures**, and that
     **neither** (a) whether an adapter-ACCEPTED page can still be truncated by the package, **nor** (b)
     whether the adapter REFUSES a page the package would decode faithfully, has been established. **Status
     unchanged at this pass — OWED (UNVERIFIED).** Read in the tree: the page suites carry **no** row over
     either measure (a `grep` of `tests/**` for `maxNestingDepth` / `PACKAGE_MAX_DEPTH` / `nests beyond` /
     `depth guard` returns **no match**), so the boundary draw is still owed to `P-TP-1`'s deep-totality
     territory (§7's row pins only that the draw must terminate through the adapter's **typed failure arm,
     never a stack exhaustion**).
   - **`SN-5` — MIS-ATTRIBUTED adversarial rows, with the production equivalents named.** The adversarial
     rows in `tests/edit-adversarial.test.ts` are **mislabelled in their subject**: the FS10/FS11/FS12/FS15/
     FS19/FS24 rows drive **`store.applyBatch` DIRECTLY** (232, 272, 278, 315, 347, and the
     `FS10/FS11/FS12/FS15` block 419–471 incl. 431, the `FS19` row 544, the `FS24` row 551), and the
     FS16/FS18/FS17 rows drive **`EditController.commit`** (590, 606, 624) — a seam whose **only** callers
     are tests: `src/renderer/edit-controller.ts`'s `commit` (171) has **no production caller** (a `grep` of
     `src/**` finds no `editController.commit(`; `src/renderer/renderer.ts` 947 only **injects** the delegate
     the controller would call). **The production equivalents that DO exist** (they are the rows those
     subjects must be read through): `archive/tests/2026-10-04-page-commit-failure-visibility.test.ts` — `C1` 282 / `C2` 311
     (an unacknowledged or partial batch is NOT success: `FS19`), `C5` 334 (the acknowledged-success
     control), `C3` 357 (absent/malformed, no fabricated `failedIndex`), `C4` 395 (the engine cause class),
     `W1` 423 / `W2` 448 / `W3` 476 (`FS17`: authored at failure, survives a real re-derive, cleared on
     success), `T1`/`T2` 499/514 (**ZERO** `edit.batch` calls for an unchanged page; exactly **ONE** for one
     change — `FS10`/`FS15`), `S1` 522 / `S2` 576 (`FS24`'s `not-resident` through the seam) / `S3` 592
     (`not-authorized` has no commit seam in this build — asserted as the recorded gap);
     `archive/tests/2026-10-04-page-commit-tab-ownership.test.ts` — `T1` 391 … `T7` 579 (the per-tab subject, the `FS16`/`FS17`
     production rows `T6` 546 / `T7` 579, the close row `T5` 486); `archive/tests/2026-10-04-page-diff.test.ts` — the `F1` rows
     331/364/388 (the foreign/ownership refusals), the type+content row 552 (`M3`/`FS19`'s silent-drop
     class), §3.3 item 1 857 (one `applyBatch`), and the refusal's ZERO journal-delta row 794–810.
     **`FS18`'s production equivalent** is the single-attempt assertion at
     `archive/tests/2026-10-04-page-commit-failure-visibility.test.ts` 548 (*"the rejected batch was attempted exactly once
     (§3.5 item 7: no auto-retry)"*). **One residual gap, stated so it is not read as covered:** **`FS11`'s
     forward claim — a SUCCESSFUL page commit lands exactly ONE `batch` journal entry — has NO
     production-path row**: a `grep` of `tests/page-*.test.ts` for `journal` matches only
     `archive/tests/2026-10-04-page-diff.test.ts`'s ZERO-delta refusal rows (794–810), so the one-entry forward assertion exists
     only in the directly-driven row (`tests/edit-adversarial.test.ts` 431 — which itself asserts the
     REJECTED case). **Status: SPEC-NOTE — the production half of `FS11` is owed a row** (no contract change).

5. **Owed edits OUTSIDE this file (recorded so they are not lost; this pass writes this file only).**
   (a) `docs/defects.md`'s `PAGE-STATE-NOT-TAB-OWNED` and `STAGE-FOREIGN-DOC-RE-DERIVE` rows still describe
   `pageEditSurfaceHandlerSubject()` as returning `this._currentDocumentId` at `:3138-3140`; the landed seam
   returns the **ACTIVE TAB id** (`src/renderer/sidebar-panes.ts` 3477–3484, with the reason in its comment)
   — the rows' citations are **stale** and are owed a repoint/re-read by the tracker's own pass.
   (b) `docs/defects.md`'s `MOUNT-TABS-CONTRADICTS-SINGLE-ACTIVE` cites
   `archive/tests/2026-10-04-page-commit-tab-ownership.test.ts:326/335/355` as driving `mountTabs`; that file's own header
   records the harness fiction as **REMOVED** in the second remand (the T5 close row now drives
   `TabStrip.close`), so the citation is stale. (c) The two package rows' cross-refs (`PROVIDENT-EDITABLE-*`)
   and the O-0 oracle re-run remain the trackers' own work (items 2/7 above). **None of these is a contract
   change in this file.**

**What this amendment does NOT change.** The `FS1`..`FS24` numbering and text (§8.1) — no fail-state is
added, restated or renumbered; §7's register rows / seed `0xED170001` / budget `63 × 6 + 22 = 400`; §6.1's
class census (`17/26/137/0`) and §6.3's per-file work list; §4.1's supersession **set**; §3.3 items 1–8;
§3.4's write sequence and its OWED engine route; §3.5's `CommitFailure` shape and the host-side
`Map<tabId, failure>` carrier; §3.6; and §9's sequencing gates. **Exactly two things change:** the
**acknowledgement reader's recorded contract** (item 1, marked at §11.10 item 4(d) and at its anchor table)
and the **live battery's status** (item 2, marked at §11 item 8), plus the **addition** of §3a/§3b and the
SPEC-NOTES above.