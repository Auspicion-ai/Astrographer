# Unit U-SHELL-9b — Cross-Document Shared (C20 + Option C) — Spec

**Status:** DRAFT 2026-09-12. **Document-only — no code; no tests.** Gate: the
UI-overhaul umbrella gate (PROCEED-WITH-AMENDMENTS, A1). **Depends on
U-SHELL-9a** (the tab strip + `TabState` + the focus-descriptor model) and
**U-STATE-1e** (the N-root multi-document reconcile + per-root identity
replace, W2-Q17=(a)). This is the **9b** half of the
`unit-u-shell-9-main-focus-tabs.md` split (§9.4, RCA-2): the C14 **simultaneous
multi-document render** (ALL open tabs mounted) + **C20** (token-driven
shared-subtree background class + a collapsible owners box that extends to the
side of the owned subtree) + the **Option-C** commit warn/fork modal
(deep-copy subtree; >2 owners → checklist of sharing documents to migrate at
save; one atomic `applyBatch`; ownership bookkeeping; other owners unchanged).
Resolutions honoured: **W2-Q13** (owners from the `rag.backlinks` reverse map;
app-graph box; provident confirmation strip) and the umbrella **OB1** ruling
(§7.2). See `docs/specs/wave-2-open-decisions.md`.

**BLOCKED — NOT the TestWriter-next step.** This unit is **BLOCKED on
U-STATE-1e** (`docs/specs/unit-u-state-1e-nroot-reconcile.md`): the simultaneous
render and the per-root fork-identity replace require the N-root reconciler
(W2-Q17=(a): "Extend the reconciler to N document roots + identity replace … no
single-active-only shortcut"). **A TestWriter red set must NOT be authored for
9b until U-STATE-1e is green** (RCA-1/RCA-2: 9b is its own red→green→
adversarial→greens cycle after 9a and 1d land). This spec exists so the contract
is pinned; it is not delegable yet.

---

## 1. What the proposal asks

With multiple document tabs **rendered simultaneously**, the
**CROSS-DOCUMENT-SHARED** duplicate case goes live: a RAG node shared by >1
document is materialized as duplicate subtrees in each document (the
`SUBTREE-OWNERSHIP` / `CROSS-DOCUMENT-SHARED` model). U-SHELL-9b makes those
duplicates:
1. **visible** — C20: a token-driven background-color class on shared subtrees +
   a collapsible owners box listing the sharing articles; and
2. **editable without silent cross-document surprise** — **Option C**: a
   commit targeting a shared node **warns** and offers **fork** (this document
   only) or **mutate all owners**.

## 2. Contract (pinned)

### 2.1 Simultaneous multi-document render (C14)

- **All open tabs are mounted** (the C14 simultaneous render) — the 9a
  single-active policy is superseded here. Each open `document` tab's body is
  materialized in the central stage; inactive tab bodies persist.
- Simultaneous render is what makes the N duplicate subtrees coexist in one
  graph (`CROSS-DOCUMENT-SHARED`), which is the prerequisite for the live C20
  visualization and the Option-C shared-edit case.
- A RAG content change repopulates all mounted document roots in place through
  the **U-STATE-1e** N-root reconcile (no `loadEnvelope`/teardown).

### 2.2 CROSS-DOCUMENT-SHARED — Option C + C20 (OB1/§7.2) — reserved verbatim

- On a commit targeting a **CROSS-DOCUMENT-SHARED** node (owned by >1
  document), the editor **warns** and offers:
  - **Fork** — `edit.create_node` + `edit.set_edge`; copy owned only by the
    editing document; other owners keep the original; the edited document's
    edges re-point to the fork.
  - **Mutate all owners** — `edit.set_content` on the one shared node; every
    owner re-derives.
- Detection uses the reverse map (`backRefs`; `SUBTREE-OWNERSHIP`) surfaced via
  `rag.backlinks` / the `edit.*` seam.
- **C20 visualization (app-graph, MCP-visible):** a token-driven
  **background-color** class on shared subtrees + a collapsible **owners box**
  (provident subtree, `on:click` toggle) listing the sharing articles from the
  reverse map. The owners box is **collapsible** and **extends to the side of the
  owned subtree** (a side panel attached to the shared subtree, not a fixed
  pane). Both are **properties of the materialization**, not stored on the
  RAG node; the sharing fact is the authoritative ownership data.
- **Identity interaction:** a fork changes the edited node's identity in that
  document (a reconciler **replace**, not a content update); other owners keep
  the original id (U-STATE-1 must handle the identity change).
- **W2-Q13 (RESOLVED):** owners come from the `rag.backlinks` reverse map; the
  owners box is an **app-graph** subtree; the confirmation is a **provident
  confirmation strip** (fork vs mutate-all). C20's live behavior is **gated on
  Q17(a)'s N-root follow-on** (U-STATE-1e).

### 2.3 Option-C fork semantics (§9.3, RESOLVED 2026-09-12) — reserved verbatim

- **Trigger:** a content commit targeting a node owned by >1 document
  (reverse map via `rag.backlinks` / `SUBTREE-OWNERSHIP`).
- **Deep-copy the owned subtree** when forking (`SUBTREE-OWNERSHIP`).
- **>2 owners:** the fork **modal presents a checklist of the sharing documents**
  to choose which **migrate to the new fork**, at **save/commit** time. With
  exactly 2 owners, the editing document forks and the other keeps the original.
- **Fork (ONE atomic `applyBatch` — `DECIDED: BATCH-ATOMICITY-API`, one `batch`
  journal entry, no partial mutation):**
  1. `edit.create_node` — mint X′ as a **deep copy** of X (type/content/props +
     its owned subtree) in the editing document's store.
  2. **Re-point the editing document's edges:** every edge whose endpoint is X
     (or a node in X's owned subtree) **and** whose `documentIds` contains the
     editing document re-points to the corresponding X′ node; a **shared** edge
     drops the editing document from `documentIds` and/or gets a per-document
     edge.
  3. **Ownership bookkeeping:** the editing document is removed from X's owner
     set (X stays owned by the others); X′ is owned by the editing document.
  4. **Re-derive the editing document** (an identity **replace** of its subtree
     root — the U-STATE-1e dependency); the other owners' roots are unchanged.
- **Mutate all owners:** `edit.set_content` on the single shared X; every owner
  re-derives.
- **Fail (F7):** atomic batch → no partial mutation; the warn/modal remains.

### 2.4 Detection + ownership bookkeeping (pinned)

- Detection and the owners list both read the **`rag.backlinks` reverse map**
  (the `backRefs`/`SUBTREE-OWNERSHIP` data), never a stored flag on the RAG node.
- The fork and the mutate-all paths are **normal `edit.*` writes** through the
  single-writer store; the C20 background/box are **render-time materialization
  properties** derived from the reverse map, so they update on the next
  re-derive.
- The fork's `applyBatch` is **one transaction** (`BATCH-ATOMICITY-API`): a
  failure leaves the pre-fork state intact (F7); no partial ownership rewrite.

### 2.5 Pinned implementation details (post-TestWriter, 2026-09-12)

1. **New module `src/renderer/cross-document-shared.ts`** with:
   `detectSharedCommit`, `planFork`, `planMutateAll`, `SHARED_SUBTREE_CLASS`,
   `ownersBoxContent`, `applySharedSubtreeDecoration`.
2. **Owner carrier:** the reverse map `Record<ragNodeId, documentIds[]>`
   (`rag.backlinks` / `backRefs`, `SUBTREE-OWNERSHIP`).
3. **C20 class token:** the exported `SHARED_SUBTREE_CLASS` constant.
4. **Ownership encoding:** the **edge `documentIds`** field
   (`CROSS-DOCUMENT-SHARED`) — a fork removes the editing doc from the shared
   edge and/or mints a per-doc edge.
5. **F10b (no owner selected):** accept **no fork ops** OR an empty `forkOwners`
   + an unchanged store.
6. **Mount seam:** `SidebarPanes.mountTabs(entries)` (symmetric to the landed
   `mountTab`) — mounts all open document bodies simultaneously.
7. **F8 block shape:** `detectSharedCommit` → non-null with `blocked: true` +
   a `reason` when the reverse map is unavailable.

### 2.6 Adversarial findings (2026-09-12) — UNIT NOT COMPLETE

The post-green adversarial pass ran. The pure module + mount seam + 29 tests
landed, but the app integration is **absent**; 9b is **NOT functionally
complete**.

| # | Sev | Finding | Status |
| --- | --- | --- | --- |
| **H1** | HIGH | **Option-C commit warn + fork/mutate-all is unreachable** — `cross-document-shared.ts` has **zero `src/` importers**; the commit paths (`textareaBlur`/`editorBlurCommit`) write directly with no `detectSharedCommit` intercept, no confirmation strip, no fork/mutate apply. §3 states 1/5/6/7/8 + §5 unmet. | **OPEN** — needs a host commit seam + provident fork/mutate-all strip + the >2-owner checklist + `planFork→applyBatch`/`planMutateAll` apply. |
| **H2** | HIGH | **C20 never materialized** — `applySharedSubtreeDecoration`/`ownersBoxContent` have no `src/` callers; `applyDocumentSet` never decorates. §3 states 2/4 + §5 unmet. | **OPEN** — decorate at assembly from the reverse map; register `toggleOwnersBox`. |
| **H3** | HIGH | **W2-N12 unresolved** — shared `rag-X` in two docs renders **two `id="rag-X"`** elements (invalid DOM; ambiguous dispatch) and `materializedDocumentRoots()` mis-attributes doc-b's roots to doc-a. `Runtime.applyContentReconcile` ignores `ScopedRoot.documentId` (cssId last-wins; `destroyRoot`/`attachRoot` global); `applyDocumentSet` appends sibling content into `perDoc[0].envelope`. | **OPEN** — the per-document id-namespace/mount (W2-N12) must land before 9b is done. |
| **H4** | MED | `planFork({subtree:[null]})` throws (`cross-document-shared.ts:233`). | **OPEN (fix next)** |
| **H5** | LOW | `ownersFor` doesn't dedupe (`['A','A','B']` → shared/checklist wrong). | **OPEN** |
| **H6** | LOW | `planFork` can emit invalid plans (`root ∉ subtree`; all-owner migration leaves X ownerless). | **OPEN** |
| **H7** | LOW | owners-box toggle calls an uninstalled `window.provident.sidebar.toggleOwnersBox`. | **OPEN** |

**Confirmed-safe:** `detectSharedCommit` F8 blocked shape; no prototype
pollution; `planMutateAll` same-id `putNode`; `rag-store.applyBatch` atomicity
(F7 — snapshot/rollback, one batch entry); fork leaves other owners unchanged +
per-doc edge `documentIds`; `mountTabs` dedupes + mounts all distinct documents
(no `loadEnvelope`). **No new package findings** (the duplicate-id behavior is
host-side authoring + runtime last-wins).

**Verdict:** a UI/interception + per-document-namespace follow-up is REQUIRED.
Do NOT mark 9b GREEN until H1/H2/H3 are fixed + regression-tested.

## 3. States (TestWriter red set — valid paths)

1. A commit on a shared node → the Option-C warn + fork/mutate-all choice; a
   fork re-points the editing document's edges and leaves other owners.
2. A shared subtree renders the C20 background + the owners box lists the
   owners from the reverse map (the box is collapsible and attaches to the side
   of the owned subtree).
3. Two document tabs are mounted simultaneously; both render; editing one does
   not unmount the other.
4. A shared node in two mounted docs → its duplicate subtrees both carry the C20
   background; the owners box lists both documents.
5. **Fork with exactly 2 owners** → the editing document's edges re-point to X′;
   X remains owned by the other document (which is unchanged).
6. **Fork with >2 owners** → the modal checklist lists the sharing documents;
   the chosen documents migrate to X′ at save/commit; the rest keep X.
7. **Mutate all owners** → `edit.set_content` on X; every owning document's
   mounted root re-derives to show the change.
8. **Fork identity interaction** → the editing document's root is replaced
   (U-STATE-1e per-root identity replace); the other owners' roots are unchanged.
9. A RAG content change on a shared node keeps all mounted tabs open and
   repopulates the shared subtrees in place.

*(Original U-SHELL-9 states 1–6 + 9 — the tab-strip/default/persistence states —
are **U-SHELL-9a** states, not this unit's red set.)*

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F7 | a fork failure mid-commit | no partial mutation; the warn remains (ONE atomic `applyBatch`) |
| F8 | a shared node whose reverse map is unavailable | warn degrades to mutate-only or blocks; pinned: block + message (no silent mutate) |
| F9b | an owner document not open in a tab | the fork/ownership bookkeeping still applies to the store; the C20 owners box lists it from the reverse map |
| F10b | >2 owners and the checklist selects none | no migration; the fork is a no-op or is cancelled — pinned at implementation against the modal contract |

*(Original U-SHELL-9 F1–F6 + F9 — the tab-model fail-states — are
**U-SHELL-9a** fail-states.)*

## 5. Census

- Provident: all open tab bodies mounted in the stage; the C20 shared-subtree
  class + owners box + handlers (app-graph, MCP-visible); the Option-C warn
  dialog / confirmation strip (app-graph).
- Store: the Option-C fork/mutate-all writes through the existing `edit.*` ops
  and ONE atomic `applyBatch` (`BATCH-ATOMICITY-API`).
- 0 new dependencies; no `provident-ssr` change expected.
- *(The strip controller + `TabState` serialize + `provident.focus` are
  **U-SHELL-9a** census items; the N-root reconciler is **U-STATE-1e**.)*

## 6. Cross-references

- Split source: `docs/specs/unit-u-shell-9-main-focus-tabs.md` (SPLIT pointer).
- `docs/specs/unit-u-shell-9a-main-focus-tabs.md` (the tab strip + focus tool
  dependency).
- `docs/specs/unit-u-state-1e-nroot-reconcile.md` (the N-root + per-root
  identity-replace dependency — **BLOCKING**).
- `docs/specs/ui-overhaul.md` C14, C20, §3 (main-focus tabs), §4 G3
  (shared-subtree background + owners box), §7.2 (OB1: warn + choose).
- `docs/specs/wave-2-open-decisions.md` W2-Q13, W2-Q17 (§B), §E.5 (W2-Q11).
- Decisions: `CROSS-DOCUMENT-SHARED`, `SUBTREE-OWNERSHIP`,
  `BATCH-ATOMICITY-API`, `MCP-UI-EQUIVALENCE`, `MCP-FOCUS-TOOL`.
- Build: `src/renderer/sidebar-panes.ts`, `src/renderer/pane-graph.ts`,
  `src/renderer/content-reconcile.ts` (via U-STATE-1e),
  `src/renderer/edit-controller.ts`, `src/main/edit-ops.ts` (the fork's
  `applyBatch`).

## 7. Delimitation

This unit builds the **simultaneous multi-document render** + **C20** + the
**Option-C** shared-node behavior. It does NOT build the tab strip, the tab
model, the serialized tab state, the first-tab/default rules, the `search`
pane-first behavior, or `provident.focus` — those are **U-SHELL-9a**. It does
NOT extend the reconciler to N roots — that is **U-STATE-1e** (a hard
dependency). It does not build the pane zones (U-SHELL-1), pane drag
(U-SHELL-4), or the parked `graph:`/template views.

## 8. Open items

1. **BLOCKED on U-STATE-1e** (W2-Q17=(a)): no red set, no delegation until the
   N-root reconcile + per-root identity replace is green.
2. **Root-identity disambiguation across simultaneous documents** (found in the
   source; see the U-STATE-1e spec): `buildTraversal` authors a subtree root's
   css.id as `rag-<ragId>` **without a document scope** (`traversal.ts`), so the
   same shared RAG node materialized in two simultaneously-rendered documents
   would produce two content roots with the **same authored css.id**. The N-root
   reconciler + the mounted-stage id namespace must disambiguate per document
   before C20's live behavior ships; U-STATE-1e pins the reconciler half.
3. **F10b modal no-selection behavior** (pinned at implementation against the
   modal contract).
