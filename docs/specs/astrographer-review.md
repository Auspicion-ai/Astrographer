# Astrographer — Change-Analysis Review (compile-horizon-review)

- **Proposal:** Astrographer — a hybrid human-readable local wiki (Obsidian-like) with graph-based RAG, built on a fork of the Provident-Electron foundation.
- **Reviewer:** Change-analysis agent (step 4 of the proposal gate).
- **Inputs:** proposal text; validity (step 1); critique (step 2); architecture review (step 3).
- **Status:** **PROCEED-RESHAPED** (conditional on the reshape below and the user's go-ahead).

---

## 1. What the proposal asks

A local-first wiki app where:
- RAG nodes/edges are stored as Provident subtrees (subtree structure = formatting, text = information), with document-flow metadata (doc-head / next-section / doc-end) encoded as node/edge labels.
- RAG mode: assemble relevant documents, render via the provident-ssr markdown adapter, pass documents + "relevant document lines" to an agent.
- Human-readable UI mode: render to HTML and scroll to the most relevant section (e.g. a link target).
- Fully editable text in the content window, a customizable content-window template, and sidebar panes for navigation, settings, crosslink/backlink visibility.
- Constraint: ALL non-shell UI must be rendered with the provident framework (provident-ssr → graph → DomAdapter/SSRFragmentAdapter/MarkdownAdapter), never hand-written HTML/DOM.

## 2. Feasibility verdict

**Feasible, but NOT as stated.** The three prior reviews converge on this. The foundation supplies the rendering substrate (Link/Anchor graph, `DomAdapter`/`SSRFragmentAdapter`/`MarkdownAdapter`, `renderProducingProcess`, serialize round-trip, MCP surface), but **two core claims have no engine/foundation support**:

1. **RAG retrieval layer** — no index/embeddings/similarity mechanism exists anywhere in the foundation. This is a net-new subsystem.
2. **Editable text** — no contenteditable/caret support; `DomAdapter.text` writes `textContent`, which clobbers a live editor. Graph-is-authoritative is the engine's model.

Additional gaps: no scroll API (host-side needed), no persistence/vault, no generic sidebar-pane system, no backlink query surface, no MCP surface for passing docs to an agent, and `MarkdownAdapter` drops `css:*` (D5) so formatting must be expressed as element types.

The architecture review's central reframe — **the RAG layer is a DERIVED/secondary graph, not the graph the UI mutates** — is the correct resolution and is endorsed below.

## 3. What needs to change — evaluation of the architecture review's reshape

I endorse the architecture review's reshape in full, with the following specific evaluations and two amendments.

### (a) Derived-RAG (not same-graph) — ENDORSE, this is the load-bearing decision
The proposal's "RAG nodes and edges are stored as Provident subtrees" conflates two graphs. The document content graph is the authoritative render substrate; the RAG index must be a **materialized projection** with a defined rebuild trigger (on document save/delete/rename). This resolves the two-graph-coherence and index-invalidation externalities the critique raised. The engine's single-parent family model also makes a same-graph RAG layer structurally impossible for multi-parent nodes — derived graph sidesteps that entirely. **This decision is non-negotiable; without it the proposal is not implementable.**

### (b) Form-control editing (not contenteditable) — ENDORSE
`DomAdapter.text` writes `textContent` and would clobber a live editor; contenteditable-in-provident fights graph-is-authoritative. Form-control editing (textarea/input committed via state-slice content replace on blur) preserves graph-is-authoritative, is caret-safe, and keeps editing a graph/edit-group op rather than a code-group op. **Endorsed.** This is a real UX tradeoff (no rich inline editing) but it is the only option that respects the constraint and the engine model.

### (c) Derived document-flow (not stored edges) — ENDORSE, with a note
Deriving head/next/end from family-tree pre-order traversal and storing only a **doc-head marker prop** is correct. The proposal's "downstream next-section edge" is redundant with family child-anchor priority/order and would re-introduce chain fragility (broken/cyclic chains undefined). The engine's `Role` union is closed, so adding head/next/end roles is impossible; a custom document-flow `LinkConfig` is expressible (open name union) but unnecessary. **Endorsed.** Note: the doc-head marker prop is an engine-adjacent decision (allowed) and must be documented as a convention, not an engine feature.

### (d) Lexical-first retrieval — ENDORSE
BM25/tf-idf first (no network egress pin, deterministic, testable) behind an interface-swappable `Embedder` interface, vector later. This is the pragmatic order and directly answers the critique's "embeddings never specified." **Endorsed.** The "relevant document lines" problem (MarkdownAdapter drops `data-node-id`, D7) must be solved by carrying node mapping through the assembly step — see amendment 2.

### (e) Unit decomposition and build order — ENDORSE, with one amendment
The 10-unit foundation-first order (A persistence → B document model+flow → C rendering+scroll → D editable text → E RAG index+assembly → F embeddings → G crosslink/backlink → H sidebar panes → I template → J MCP+security gating) is sound: it front-loads the substrate every later unit depends on and defers the two riskiest net-new subsystems (RAG, editing) until the render/persistence spine exists. **Endorsed.**

**Amendment 1 — move MCP/security gating earlier.** The critique flagged that the RAG retrieval surface must be placed in the MCP security gate and that text editing must NOT be a code-group op. Security gating should be designed in unit B (document model) and unit D (editing) rather than deferred to unit J, so the read-only `rag` tool group and the graph/edit-group classification are baked in from the start rather than retrofitted. Keep J as the hardening/completion pass, but the gating *decisions* belong to B and D.

**Amendment 2 — node-mapping for "relevant document lines" is a first-class requirement, not a detail.** The proposal's "pass the relevant document lines to the agent" only works if lines carry node identity. Because `MarkdownAdapter` drops `data-node-id` (D7), the assembly step must produce a line→node map (or render with a node-id-preserving adapter) so the agent can cite and the UI can scroll to the exact node. This must be specified in unit E, not left implicit.

## 4. Adaptation — what to preserve, drop, defer

**Preserve as stated:**
- **Markdown-adapter rendering for RAG mode** — correct; the agent receives provident-rendered markdown, consistent with the "all UI via provident" constraint.
- **HTML + scroll for human-readable UI mode** — correct; host-side `scrollIntoView` on an emitted element keyed by `data-node-id`/`css.id` is the right mechanism.
- **Sidebar panes** (nav, crosslink/backlink, settings) — keep, but as a **host-side pane registry** with app-graph panes MCP-visible and operator-only panes (settings) in an isolated `GraphScope`, never MCP-visible.
- **Custom crosslink/backlink `LinkConfig`** (open name union) with source/target/duplex anchors + host-side backlink enumeration — this is the correct home for crosslinks given the closed `Role` union.
- **Template customization via `code.*` CRUD** exposed through a provident-rendered template-editor pane — whole-graph re-derive is acceptable because it is infrequent.

**Drop or defer:**
- **Stored document-flow edges (head/next/end as roles or a custom LinkConfig)** — drop; derive from family order (see 3c).
- **Same-graph RAG** — drop; derived graph (see 3a).
- **contenteditable rich editing** — drop; form-control editing (see 3b).
- **Vector embeddings in v1** — defer behind the `Embedder` interface; lexical first (see 3d).
- **Any network egress for retrieval** — defer/forbid in v1; local-first only.

## 5. Costs and benefits

**Proceeding reshaped:**
- *Benefit:* A genuinely novel, constraint-respecting hybrid (human-readable wiki + graph RAG) that stays within the provident rendering model and requires **no engine change** — only two engine-adjacent decisions (custom crosslink `LinkConfig` name, doc-head marker prop), both allowed.
- *Benefit:* Foundation-first build order de-risks the two net-new subsystems (RAG, editing) behind a working render/persistence spine.
- *Benefit:* Derived-RAG + lexical-first keeps the system local-first, deterministic, and testable.
- *Cost:* Significant net-new host-side work — persistence store, retrieval index, editing, pane registry, MCP gating. This is a large project, not a thin wrapper.
- *Cost:* Form-control editing is a UX downgrade vs. Obsidian's rich inline editing; acceptable given the constraint.
- *Cost:* Two-graph coherence (content graph vs. RAG index) must be maintained by a defined rebuild trigger; a correctness risk if the trigger is incomplete.

**Alternatives:**
- *Reject:* Loses a viable, well-scoped project; the reshape makes it implementable, so rejection is not warranted.
- *Proceed as-is:* Not implementable — the two unsupported core claims (RAG layer, editable text) would fail immediately. Not an option.

## 6. Does a better solution exist?

No better solution exists within the stated constraints. The alternatives are: (a) abandon the provident-rendering constraint and hand-write the UI — rejected by the project's own constraint; (b) use a non-provident wiki engine — rejected by the fork mandate; (c) the reshape itself, which is the minimal change that makes the proposal implementable while preserving its distinctive value. The reshape is not a compromise of the vision; it is the correct architecture for it.

## 7. Final recommendation

**PROCEED-RESHAPED**, contingent on the user's go-ahead. The concrete scope for the spec writer:

1. **Two-graph model:** authoritative document content graph (render substrate) + derived RAG index (materialized projection with a defined rebuild trigger on save/delete/rename).
2. **Document-flow:** derive head/next/end from family-tree pre-order; store only a doc-head marker prop. No new roles, no document-flow `LinkConfig`.
3. **Editing:** form-control (textarea/input → state-slice content replace on blur), a graph/edit-group op, never code-group.
4. **Retrieval:** hybrid lexical-first (BM25/tf-idf) + graph traversal for context assembly; vector behind an interface-swappable `Embedder`, deferred.
5. **Line→node mapping** is a first-class requirement of the assembly step (unit E), because `MarkdownAdapter` drops `data-node-id` (D7).
6. **Rendering:** markdown-adapter for RAG mode; HTML + host-side `scrollIntoView` (keyed by `data-node-id`/`css.id`) for UI mode.
7. **Crosslinks/backlinks:** custom crosslink `LinkConfig` (open name union) + host-side backlink enumeration.
8. **Sidebar panes:** host-side pane registry; app-graph panes MCP-visible; operator-only panes (settings) in isolated `GraphScope`, never MCP-visible.
9. **Template:** `code.*` CRUD via a provident-rendered template-editor pane (whole-graph re-derive, infrequent).
10. **MCP/security gating decisions** designed in units B and D (read-only `rag` tool group default-off; editing as graph/edit-group), with J as the hardening pass.
11. **Persistence:** main-process `node:fs` document store (module-store pattern); RAG index as a derived cache file.
12. **Build order:** A persistence → B document model+flow (+gating decisions) → C rendering+scroll → D editable text (+gating decisions) → E RAG index+assembly (+line→node map) → F embeddings → G crosslink/backlink → H sidebar panes → I template → J MCP+security hardening.

**Verdict path:** `docs/specs/astrographer-review.md`

---

## 8. User clarifications (2026-08-26) — refined two-graph model + equivalence + handoff rule

The user reviewed the reshape and added four clarifications that refine (not overturn) the PROCEED-RESHAPED verdict. These are binding on the spec.

### 8.1 The RAG layer is authoritative; the provident graph is a materialization (direction reversed)

The user clarified the two-graph standard: **the provident graph only exists after compilation by the RAG traversal.** This reverses the direction stated in §3a. The authoritative store is the **RAG layer** (RAG nodes + edges, the persistent knowledge graph). The **provident graph is a transient render materialization** produced by a RAG traversal:

- A RAG traversal compiles the relevant RAG nodes/edges into a provident subtree (the "RAG nodes and edges stored as Provident subtrees" claim, now made concrete).
- Each RAG-provided element is **placeable in the provident renderer** and returned as **payload in the correct sequence** (the traversal emits an ordered element payload that the renderer mounts).
- Each materialized element **remembers its parent source RAG object** (a back-reference) and can **save back after edits** — an edit on a rendered element writes back to the source RAG node.
- **Major structural edits** (e.g. deleting the entire section of a document that corresponded to a RAG node; adding a section that strays from the topic of the section where the caret started) **trigger a rebuild** of the graph so the remaining elements still chain together (re-traversal / re-compile).

This is a cleaner coherence contract than §3a's "content graph authoritative, RAG index a projection": there is no persistent two-graph sync problem because the provident graph is always rebuilt from the RAG store on demand. The engine's graph-is-authoritative pin still holds at the *rendering* layer (HTML is a view of the graph); the RAG store being authoritative over the graph is an application-layer decision, consistent with the engine.

### 8.2 Headless-MCP vs Electron-UI equivalence paradigm (imported from Provident-Electron)

The full **headless-MCP vs Electron-UI equivalence** paradigm from the foundation must be maintained: the same graph, the same rendering, and the same operations must be reachable equivalently through the MCP surface (headless/agentic) and the Electron UI. RAG retrieval, editing, and rendering must all be exposed through both, driving the same authoritative RAG store + materialized graph. This reinforces the `rag` tool group (read-only, default-off) and the edit group from §3.10/Amendment 1, and it means the MCP surface is not an afterthought — it is a first-class, equivalent access path.

### 8.3 Engine-gap handoff rule (RAG is project-specific, not a foundation feature)

If any **core feature is missing from the electron/provident implementation** (an engine/foundation gap that blocks the build), write a **handoff document** to be passed to the provident development agent as a **feature request** — do NOT patch the engine. The RAG layer is **specific to this project**, not a core feature of the foundation, so RAG-specific gaps are this project's own work; only genuine engine/foundation gaps (e.g. a missing renderer capability, a missing adapter surface) become handoff feature requests. This mirrors the foundation's `docs/defects.md` → `docs/HANDOFF.md` pattern, adapted: engine gaps → handoff doc; project-specific gaps → built here.

### 8.4 Net effect on the spec scope

- The two-graph model in §3a is **replaced** by §8.1: RAG store authoritative → RAG traversal → materialized provident graph → render; elements carry source-RAG back-references; edits write back; major structural edits trigger rebuild.
- The MCP/UI equivalence (§8.2) is a **binding constraint** on every unit that touches retrieval/editing/rendering.
- The handoff rule (§8.3) governs how engine gaps are handled: handoff doc, never a patch.
- Editing remains commit-on-blur (user confirmed), but the commit target is the **source RAG object** (via the element's back-reference), not a bare graph node.

---

## 9. Re-run proposal gate on the refined model (2026-08-26) — PROCEED-WITH-AMENDMENTS

The user asked the refined model (§8) be passed back through the proposal gate for a deep validity check. The gate re-ran (validity ∥ critique → architecture → change-analysis). Verdict: **PROCEED-WITH-AMENDMENTS**.

### 9.1 Deep-validity + deep-critique findings (steps 1-2)
- **Feasible, no blocking engine gap.** RAG-authoritative over graph is a legitimate application-layer layering; the engine's graph-is-authoritative pin holds at the graph→HTML boundary. The refined model is a genuine improvement over §3a (it eliminates the two-graph sync problem — the materialized graph is always re-derivable from the RAG store).
- **Must-fix items surfaced:** (1) transient-vs-persistent inconsistency (when is the graph rebuilt?); (2) undo/redo dies on rebuild (per-Supervisor journal); (3) caret/focus has no home between materializations; (4) `data-node-id` is NOT stable across rebuilds (mintNodeId re-mints); (5) back-reference not preserved through serialize/loadState; (6) commit-on-blur is a double-write with a lost-update window; (7) in-progress edit destroyed by rebuild; (8) "strays from the topic" rebuild trigger is fuzzy; (9) full re-materialization per major edit is the A4 whole-graph re-derive; (10) no concurrency model for MCP+UI writes; (11) `rag`/`edit` groups not registered in the five-seam gate; (12) stored doc-flow edges re-introduce chain fragility; (13) multi-parent node vs single-parent invariant; (14) "ordered element payload" risks a hand-rolled render path; (15) retrieval selection unspecified; (16) formatting→element-type mapping unspecified (MarkdownAdapter css-drop); (17) RAG store persistence unspecified; (18) handoff boundary fuzzy.

### 9.2 Architecture resolutions (step 3) — the 12 resolutions
1. **Pure-projection invariant:** the materialized graph is a pure projection of the RAG store, maintained in-place for content edits (RAG-store-commit-first, then state-slice the affected element) and full re-traversal for structural edits. The graph holds no state not derivable from the RAG store. Undo/redo lives in the RAG store's own PROJECT JOURNAL (not the engine Supervisor journal). Caret/focus is host-side state keyed by RAG node id, restored after rebuild. A dirty-edit guard queues (not executes) a rebuild while a control is dirty.
2. **Back-reference carrier:** the host-side `Map<nodeId, ragNodeId>` rebuilt per traversal is the SOLE authoritative carrier (survives all surfaces; never stale across a rebuild). The RAG store is the persistence path, NOT serialize/loadState, so no pollution. A dangling back-reference marks the element read-only; commit-on-blur refuses a write to a deleted node.
3. **Document-flow edges:** the RAG store carries doc-flow edges (doc-head/next-section/doc-end) as authoritative; the traversal maps them to family child-anchor order + a doc-head marker prop; the traversal VALIDATES the edges (cycle/missing-node/missing-head) and falls back to family pre-order on violation.
4. **Render path:** the traversal emits a `LegacyInitialData` envelope → `translateLegacy` → `renderProducingProcess` (CompiledState[]). The "ordered element payload" IS that CompiledState[] — coherent, not hand-rolled.
5. **Rebuild trigger:** purely structural (node add/delete/split/merge, edge add/remove/retarget, doc-flow role change). "Strays from the topic" is DROPPED from the rebuild predicate (deferred to the Embedder).
6. **Concurrency:** single-writer model — the RAG store is the lock point; the main process owns all writes; MCP and UI both route through the main-process store.
7. **MCP gating:** a new read-only `rag` tool group (default-off) + a new mutating `edit` tool group (default-off), each through the full five-seam gate. Editing is never a `code`-group op.
8. **Multi-parent materialization:** duplicate-per-parent (each a distinct provident node sharing the same RAG node id via the back-reference Map), respecting SI-1.
9. **RAG→engine translation:** RAG text → `content`; formatting → element `type` (h1-h6/p/ul/ol/li/blockquote/pre/code/strong/em/a/img); doc-head marker → a `props` field; back-reference → the host-side Map (not the envelope). Formatting that must survive markdown is element types; css only for non-semantic styling.
10. **Retrieval selection:** lexical-first BM25/tf-idf behind an interface-swappable `Embedder`; graph traversal for context assembly; deterministic and testable. Line→node map is a first-class requirement of the assembly step.
11. **Handoff boundary:** a missing capability is an engine gap (handoff) iff it cannot be implemented by composing existing engine primitives in host code; project-specific iff it can. Transient graph, back-reference, RAG→subtree traversal are all project-specific. The ONE handoff item: MarkdownAdapter `data-node-id` preservation (D7), optional and non-blocking.
12. **First-milestone units (smaller slice):** Unit A RAG store (persistence, single-writer queue, project journal); Unit B document model + doc-flow (node/edge types, edge validation, doc-head marker prop, PLUS the rag/edit MCP gating decisions); Unit C rendering spine (traversal → envelope → translateLegacy → renderProducingProcess, back-reference Map, ordered payload, line→node map, MCP/UI equivalence). Later units: D editing, E retrieval, F embeddings, G crosslinks, H panes, I template, J hardening.

### 9.3 Change-analysis verdict (step 4) — PROCEED-WITH-AMENDMENTS
The refined model is a good idea and implementable. Endorsed with four amendments:
- **(a) "Same transaction" sharpened:** RAG-store-commit-first, then re-derive-and-slice the affected element(s); invariant = "the RAG store is always correct; the materialized graph is always re-derivable" (not "always in lockstep").
- **(b) Project journal must record invertible entries for structural ops** (node/edge add/delete/retarget, doc-flow role change), because undoing a structural edit re-traverses. Specified in Unit A.
- **(c) Traversal execution site + back-reference Map home pinned:** the traversal runs in the main process (or a shared pure module), producing TWO outputs — the `LegacyInitialData` envelope AND the back-reference Map — envelope shipped to the renderer for translateLegacy/renderProducingProcess, Map available to both MCP and UI. Blocking for Unit C.
- **(h) Multi-parent duplicate coherence:** the in-place content-edit path must update ALL materialized duplicates of the edited RAG node (state-slice every duplicate), or explicitly accept cross-duplicate staleness until the next structural rebuild. Decided in Unit C.

**"Strays from the topic" re-scoping (user must confirm):** under the refined model, ANY node add is already a structural edit that triggers a rebuild — so the user's underlying concern (the graph re-chains after a stray addition) is preserved. What is deferred is the SEMANTIC PLACEMENT decision (which RAG node/edge the new section attaches to), which is a retrieval/embedding concern owned by the `Embedder`. This is a re-scoping, not a loss.

**First-slice scope (Units A/B/C):** A RAG store (persistence, single-writer queue, project journal with invertible structural entries); B document model + doc-flow (node/edge types, edge validation, doc-head marker prop, rag/edit MCP gating decisions); C rendering spine (main-process traversal → envelope + back-reference Map, translateLegacy → renderProducingProcess, multi-parent duplicate coherence, line→node map, MCP/UI equivalence).

**Handoff:** the one engine gap (MarkdownAdapter `data-node-id`, D7) becomes a handoff doc, non-blocking (the host-side line→node map covers it).

---

## 10. User clarification (2026-08-26) — RAG object OWNS a subtree (many-to-one mapping)

The user clarified what "subtree" means in the RAG↔Provident mapping. This refines resolution 9 (RAG→engine translation) and resolution 2 (back-reference):

> "What is meant by 'sub-tree' is that a payload content node in Provident can link children and not have a parent, relying only placement or component logic to be attached into a root-visible zone. A RAG object (node/edge) should be able to 'own' multiple Provident nodes, as long as they all are bound to a subtree. This resolves issues where the Provident node structure subdivides text into chunks small enough to lose semantic meaning when embedded separately, e.g. 'Paris is: - French - famous - warm' would be four separate and relatively useless embeddings if the provident type:ul and type:li embeddings are attached to separate RAG-level objects, but semantically useful if the ul-node contains the li-nodes on a single RAG object, and their markdown is embedded in one chunk."

### 10.1 The mapping (grounded in the engine model)
- A **RAG object (node/edge) OWNS a SUBTREE of Provident nodes** — the back-reference is **many-to-one** (`Map<ragNodeId, nodeId[]>`: one RAG object → its owned provident node ids), NOT the 1:1 `Map<nodeId, ragNodeId>` of resolution 2.
- The subtree root is a **payload content node** that can link children and have **no parent** — this is the engine's **`contentNodes`-owned content root** (a `template.children` root or `ContentPayload.content[]` root; family-'in-tree' but dropped from compile until attached — translate.md §10.ad/F-13, node.md §1.2). It is attached into a **root-visible zone** via **placement/component logic** (`targetPlacement` → `content` anchors → the per-name placement Link → a `container` zone; or a component binding).
- The RAG object's **text = the markdown of its whole subtree, embedded as ONE chunk** — so a `ul` + its `li` children are one RAG object / one embedding, preserving semantic meaning that would be lost if each `li` were embedded separately.

### 10.2 Effect on the architecture
- **Back-reference (resolution 2 amended):** the host-side map is `Map<ragNodeId, nodeId[]>` (RAG object → its owned provident node ids), rebuilt per traversal. A content edit on any owned node writes back to the owning RAG object. The "relevant document lines" / line→node map maps lines to the owning RAG object (via the subtree), so the agent cites the RAG object, not a leaf node.
- **RAG→engine translation (resolution 9 amended):** a RAG object maps to a **subtree** (a content root + its children), not a single node. The traversal emits each RAG object's subtree as a `contentNodes`-owned content root in the envelope, attached via placement/component into the root-visible zone. Formatting within the subtree is element types (h1-h6/p/ul/ol/li/blockquote/pre/code/strong/em/a/img) so the markdown chunk renders correctly.
- **Embedding/chunking:** the RAG object's chunk = the markdown of its whole subtree (one embedding), preserving semantic grouping.
- **Multi-parent (resolution 8) reconciled:** a RAG object owned by multiple parents is materialized as duplicate subtrees (each a distinct content root sharing the same RAG object id via the map), respecting SI-1.

### 10.3 Focused validity check (2026-08-26) — FEASIBLE, with one hard precondition + one editing constraint
A focused validity check confirmed the subtree-ownership model is feasible and is exactly the engine's supported "content root dropped from compile until attached" pattern (translate.md §2, node.md §7.1/FS-1, P3 §2.4; the fork's `runtime.ts` already implements the placement-routed bootstrap via `isPlacementRouted()` → `compilePath`).

- **Q1 (render eligibility) — YES, with a HARD PRECONDITION.** A content root is family-'in-tree' via the `contentNodes` token but the token TERMINATES the compile walk; it becomes render-eligible only when a real edge supersedes the token (translate.md F-13: "attach adds a placement path to an already-in-tree content root"). The placement path is that edge: a `content`-role anchor (minted from `targetPlacement`) routes the node through the per-name placement Link to a `container` zone, and `compilePath` enumerates path-states to `'rootNode'`. **Envelope shape:** `LegacyInitialData = { template, content: ContentPayload[], clientConfig }`; each RAG subtree root is a `ContentPayload.content[]` item (or `template.children` root) carrying `placement.targetPlacement: string[]`; its children are ordinary `NodeData.children` under that root. **HARD PRECONDITION:** the traversal must ALSO emit a `container`-role producer (`placementName`) for every zone it targets — with no container for the name, the content anchor resolves to nothing and the root stays `unplaced` (silently not render-eligible).
- **Q2 (subtree boundary) — RAG-STORE CONVENTION.** The RAG object must declare its owned provident node ids (carried by the host-side `Map<ragNodeId, nodeId[]>` rebuilt per traversal). The envelope structure alone cannot express the boundary (a content root's children are just family children with no "owned by RAG object X" marker). Project-specific.
- **Q3 (line→node map) — CONSISTENT.** The MarkdownAdapter drops `data-node-id` (D7) and `css:*` (D5), so the markdown output carries no node identity. The line→node map is produced by the assembly step (host-side) and is COARSE: all lines of a subtree's markdown map to the owning RAG object, so the agent cites the RAG object (the whole `ul`+`li` chunk), not a leaf. This is the intended semantic (per-leaf citation is impossible by design).
- **Q4 (engine invariants) — NO BLOCKING CONFLICT, two constraints.** (1) SI-1 single-parent holds: the subtree root has no family parent (contentNodes token) + a peripheral `content` anchor (SI-3: placement roles don't count toward SI-1); its children have the root as family parent. Multi-parent RAG objects → duplicate subtrees (distinct content roots sharing the RAG id via the map). (2) **FS-10:** `state-slice` mutation targeting a placement zone is HARD-BLOCKED (`placement-target-blocked`); placement changes go only through the `placement-attach` op. This constrains the editing model: commit-on-blur must write back to the RAG store → re-traversal, NOT a zone-targeted state-slice.
- **Q5 (gaps):** project-specific = RAG store, traversal (envelope + back-reference map), subtree-boundary convention, container-producer emission, line→node map, retrieval/Embedder, editing write-back, MCP `rag`/`edit` gating. Engine/foundation = the ONE handoff item (MarkdownAdapter `data-node-id` preservation, D7), optional/non-blocking.
- **Conceptual mismatches:** (1) "subtree root can link children and have NO parent" is only true in the family sense — a root with no placement edge is `unplaced` and NOT render-eligible; every RAG subtree root must be placement-attached to render. (2) "RAG object's text = whole-subtree markdown as one chunk" is a HOST-SIDE embedding decision, not an engine property; the engine emits the subtree as separate elements, and only the host's chunking groups them into one embedding. (3) `contentNodes` ownership vs placement are orthogonal (payload.md P-4/P-5: a registered content node persists unplaced) — the RAG store must not assume "owned ⇒ rendered".

---

## 11. User decision (2026-08-26) — markdown is EXPORT-ONLY; agent changes go through direct MCP updates

The user confirmed the markdown ownership loss (D7) is a **known factor** and set the policy:

- **Markdown is an EXPORT-ONLY method.** The `MarkdownAdapter` output is a read/export surface for the agent to *read* documents, NOT an edit surface. The ownership loss (no node identity in markdown) is accepted.
- **Agent-driven changes are encouraged to go through DIRECT MCP UPDATES** (the `edit` tool group / RAG-store mutations), not markdown round-trips. The agent reads via markdown (export) and writes via direct MCP edits to the RAG store.
- **Diffing of markdown vs. generated source to detect changes is a FUTURE SPECULATIVE FEATURE** — recorded in `docs/pending.md` with its revisit condition, not built in the first slice.

---

## 12. User clarification (2026-08-26) — the `doc-child` edge type (nested semantic units)

The user refined the subtree-ownership model (§10) to handle NESTED semantic units:

> "Depending on document layout, a provident node could end up being nested inside of another node while still being large enough for semantic distinctiveness, e.g. a `ul`/`ol` element with paragraph-length `li` elements. Resolving this situation would require a **doc-child edge type**, e.g. `node-1` contains a `ul` element, and four edges connect to/contain `li` elements with `doc-child-<placementName@doc-name>`. Example format is provided for clarity, not as an instruction. There are more explicit/elegant ways to represent doc ownership."

### 12.1 The refinement
- A RAG object can own a subtree (§10), but WITHIN that subtree a nested node (e.g. a paragraph-length `li` inside a `ul`) can itself be a distinct RAG object — a **doc-child** of the containing RAG object.
- This requires a **`doc-child` edge type** in the RAG store, distinct from the linear doc-flow edges (`doc-head` / `next-section` / `doc-end`). The doc-flow edges express the LINEAR document sequence; the `doc-child` edge expresses HIERARCHICAL nesting (a semantic unit nested inside another).
- The user's example format (`doc-child-<placementName@doc-name>`) is illustrative only — the clean representation is a `doc-child` edge `{ type: 'doc-child', parent: <ragNodeId>, child: <ragNodeId>, order: <number> }`: the child RAG object's subtree is nested within the parent RAG object's subtree at the given order/position.

### 12.2 Effect on the architecture
- **RAG edge kinds (Unit A §5.1 / Unit B §5.1):** add `doc-child` to the edge kinds. The first-slice edge kinds become: `parent-child` (family), `doc-head` / `next-section` / `doc-end` (linear flow), `doc-child` (hierarchical nesting).
- **Subtree-boundary convention (§10.2):** a RAG object's `ownedNodeIds` EXCLUDES the nodes owned by its doc-children (those belong to the doc-children). The ownership is hierarchical: a parent RAG object owns its subtree, and within it, doc-child RAG objects own nested subtrees.
- **Traversal (Unit C):** when materializing a parent RAG object's subtree, the traversal must ALSO materialize the doc-child RAG objects' subtrees nested within it at the right position (the engine's family structure — e.g. `ul` → `li` — is the render structure; the RAG doc-child edges express the semantic ownership boundary).
- **Embedding/chunking (§10.1):** a doc-child RAG object's text = the markdown of its OWN subtree, embedded as a SEPARATE chunk (a paragraph-length `li` is its own embedding), while the parent RAG object's text = the markdown of its subtree EXCLUDING the doc-children's subtrees (or including them as references). The exact chunking is a Unit E decision.
- **Validation (Unit B §5.2):** the traversal-time validation must also validate `doc-child` edges (missing-node, nesting cycle).

### 12.3 Open question for the spec update
- How does the `doc-child` `order` position the child's subtree within the parent's subtree relative to the parent's owned nodes and other doc-children? (The cleanest: the child's subtree is inserted at the position of the corresponding engine family child — e.g. the `li` node — within the parent's owned subtree.)

---

## 13. User clarity check (2026-08-26) — cross-document shared nodes

The user asked whether the document-ownership model allows the SAME RAG nodes to appear in MULTIPLE documents at the same time:

> "Function A is called by both Class B and Class C. The document flows detailing the B and C use cases both have edges connecting to the node containing A's spec explaining how they use function A. The node for function A renders in both documents, and if the text of A changes, so do both documents. Extension: Function A creates an object of class D. Both documents connect from node A on an edge containing the same explanation of D's use in function A, to the node containing D's spec."

### 13.1 The answer — YES, via MULTI-PARENT-DUPLICATE, with one doc-flow clarification

The model already supports shared nodes across documents through the **MULTI-PARENT-DUPLICATE** decision (§9.2.8): a shared node (A's spec) has MULTIPLE `parent-child` edges — one from B's use-case node, one from C's use-case node — so it is materialized as **duplicate subtrees** in each document, all sharing the same RAG id via the back-reference map. A text change to A updates all duplicates (the content-edit path state-slices every duplicate, or a re-traversal re-materializes all consistently). This satisfies "if the text of A changes, so do both documents."

**The one clarification needed:** the doc-flow edges must support a node being in MULTIPLE documents' linear flows. The current `next-section` edge is `source → target` (one next per node), which cannot express A's spec having a next-section in B's flow AND a next-section in C's flow. **Resolution: an edge carries a `documentIds: string[]` field (the document root node ids that OWN/USE the edge).** A shared reference/content edge (e.g. the A→D edge carrying the shared explanation of D's use in function A) lists MULTIPLE document owners. A `next-section` edge's TARGET (the next section) differs per document, so those are separate edges each with ONE owner. The traversal, when assembling document B, follows B's `next-section` edges; when assembling document C, follows C's.

### 13.2 The extension (D's spec) — also supported
D's spec is a shared node referenced by both documents. In document B, A's spec (duplicate 1) has a `parent-child` edge to D's spec; in document C, A's spec (duplicate 2) has a `parent-child` edge to D's spec. So D's spec has two `parent-child` edges → materialized as duplicate subtrees in both documents, sharing the RAG id. A text change to D updates both. The "same explanation of D's use in function A" is the edge's content/metadata, shared across both documents.

**Two-edge variant (differing explanations):** if the use case of D DIFFERS between the B and C flows, there are TWO distinct A→D edges — each with its own content (the differing explanation) and each scoped to one document (`documentIds: [B]` and `documentIds: [C]`). The model supports BOTH: one shared A→D edge with `documentIds: [B, C]` (same explanation) OR two distinct A→D edges (differing explanations). The B/C → A → D scenario is an END-TO-END test (Unit C §5.7 scenario 9/10).

### 13.3 Cost note (the tradeoff of MULTI-PARENT-DUPLICATE)
A node referenced by N documents is materialized as N duplicate subtrees. This is the cost of respecting the engine's single-parent family model (SI-1). For a heavily-shared node (e.g. a widely-referenced spec), this is N render copies. The alternative — a single node with multiple parents — is structurally impossible in the engine. The duplicate-per-document model is the only option that respects the engine, and the back-reference map keeps all duplicates coherent (one RAG id → N node-id sets).

### 13.4 Pending feature — shared-node edit UX (recorded in `docs/pending.md`)
When a user/agent edits a section (RAG node) that is incorporated into MORE THAN ONE document (a CROSS-DOCUMENT-SHARED node), NOTIFY them that the node is shared across N documents. When the document would save, PROMPT whether the text should be changed for ALL owners (update all duplicates) or whether SOME should be preserved on a CLONE of the original (fork the node for one document, leaving the others unchanged). This is a SPECULATIVE feature — revisit when the editing path (Unit D) lands and the cross-document shared-node model is implemented.

---

## 14. User clarification (2026-08-26) — structural element types as valid node roots

The user asked to include STRUCTURAL element types (e.g. `div`) as valid RAG node roots, for cases where text is broken up enough to have the semantic-isolation problem (like the list example) but WITHOUT a solid syntactic structure to mark it:

> "S3 Bucket types / General Purpose / Vector / Directory / Table — is an example of a common lazy/shorthand note-taking output of a human writer."

### 14.1 The refinement
- A RAG object's subtree root can be a STRUCTURAL element type (e.g. `div`), not just a semantic element (`h1-h6`/`p`/`ul`/`ol`/`li`/...).
- This groups semantically-related but syntactically-unstructured text lines into ONE RAG object / one semantic chunk, so they embed together (not as N useless separate embeddings). The `div` root's children are the text lines; the whole `div` subtree is one RAG object.
- This is the same subtree-ownership model as `ul`/`ol` — the structural root is just a grouping container.

### 14.2 Effect on the architecture
- **`RagNodeType` (Unit A §5.1):** add `div` (and other structural element types) to the closed union.
- **Document model (Unit B §5.1):** a `div` root is a valid node root for grouping unstructured text lines into one semantic chunk.
- **Traversal (Unit C):** a `div` RAG object is emitted as a `div` content root with its text-line children; the whole subtree is one RAG object / one embedding.

This refines the "relevant document lines" requirement: the line→node map is still produced by the assembly step (so the agent can cite the owning RAG object), but it is a READ aid, not a write-back path. The primary agent write path is direct MCP `edit`-group mutations to the RAG store.
