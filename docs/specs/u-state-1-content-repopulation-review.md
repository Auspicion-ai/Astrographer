# U-STATE-1 — Content-Only Repopulation: Proposal-Gate Review (three-agent gate)

- **Proposal:** replace the renderer's full-page teardown+rebuild on every RAG
  change (`reDerive` → `loadAppGraph` → `runtime.loadEnvelope` →
  `tearDownGraph` + full `render()`) with **content-only repopulation** — only
  changed content roots are replaced; template + zones + node identity +
  graph-resident state persist.
- **Reviewer:** change-analysis agent (step 3 of the proposal gate, AGENTS.md
  item 8), grounded by an independent validity review (step 1) and critique
  review (step 2).
- **Inputs:** `docs/specs/ui-overhaul.md` §3.1 (C10, the confirmed hard
  requirement) + §8.1 (the dependency analysis); the build
  (`src/renderer/runtime.ts`, `src/renderer/sidebar-panes.ts`,
  `src/renderer/pane-graph.ts`, `src/main/traversal.ts`); `docs/decisions.md`
  (`RAG-AUTHORITATIVE`, `CONTENT-EDIT-RE-TRAVERSAL`, `PANE-REGISTRY`,
  `UI-MOUNT-*`); the `provident-ssr@0.4.0` engine specs
  (`ops.md`, `adapters.md`, `placement-path-spec.md`).
- **Status:** **PROCEED-WITH-AMENDMENTS (GATED 2026-09-11, ratified by the
  Architect's "proceed").** All six open items closed by default (§6); the
  amendments A1–A10 are pinned. **No per-unit spec / TestWriter red set until
  the per-unit specs are written** (AGENTS.md item 9).

---

## 1. What the proposal asks

C10 (hard requirement, user-confirmed 2026-09-11): a RAG-store change must
**repopulate the content that changed**, not tear down and rebuild the page.

Current behavior (verified in-tree):

- `reDerive()` (`sidebar-panes.ts:782`) → `refresh()` → `loadAppGraph()`
  (`:587`) → `runtime.loadEnvelope()` (`:618`).
- `loadEnvelope()` (`runtime.ts:325`) calls `tearDownGraph()` (`:759`), which
  `destroy`s every in-tree non-root node, then `resetRenderState()` + a full
  fresh `render()`.
- `mountOperator()` re-creates the operator `GraphScope` + `replaceChildren()`
  every `refresh()` (`:632/635`).
- The `Supervisor` is reconstructed each `loadEnvelope` (`:339`), so the
  journal/undo stack is wiped too (the C16 dependency).

Required outcome: replace only the changed content roots; template + zones
persist; `css.id` identity stable; graph-resident layout/hook/theme/tab state
survives; the operator scope is not remounted.

---

## 2. Feasibility verdict (step 1 — validity, DRAFT)

**FEASIBLE.** The engine already exposes every needed primitive; this is a host
renderer change, not an engine change.

- `placement-attach` / `detach` (`api.md` §1) move content-role roots in/out of
  a zone; content roots are placement-routed (`pane-graph.ts:37`,
  `SIDEBAR_ZONE`).
- `destroy` removes a specific node; `state-slice` mutates in place;
  `layer-apply` mints children under an existing node (the `{children}`
  bridge), per `ops.md` §2.8 OO-7.
- The `main`/`sidebar` container producers can persist across a change.

Open feasibility questions for the critique (step 2):

1. **Identity mapping.** Today a re-derive produces an entirely new
   `LegacyInitialData`; content-only needs a **diff** between the previous and
   new document subgraphs to decide per-root keep/replace/remove. `buildTraversal`
   is pure and returns a fresh envelope — there is no current diff keyed by
   `css.id`. This is the core new mechanism.
2. **Content-root keying.** What is "the same content root" across a change?
   `rag-<documentId>` css.ids are stable (Unit MS4 id scheme; now path-qualified
   by the C15 slice), so document roots are keyable — but nodes within a
   document change (edited subtrees) and need their own diff.
3. **Zones + panes persistence.** App-graph panes are appended content payloads
   (`assembleAppGraphEnvelope`, `pane-graph.ts:86`); do panes stay attached, or
   are they re-attached each change?
4. **Caret/selection + dirty-edit guard.** The current re-derive has an explicit
   caret-restore loop (`sidebar-panes.ts:838-883`) precisely because the rebuild
   destroys elements. Content-only should make this cheaper, but the
   dirty-edit guard (edit controller) must still gate a rebuild that would
   clobber an in-progress edit.
5. **The operator scope.** `mountOperator` re-creates the isolated scope; the
   C3 modal work wants it to persist. Separate but coupled.

---

## 3. Critiques / risks (step 2 — critique)

- **R1 — The diff is the hard part.** A naive "keep all, attach new" leaks
  deleted roots; a naive "replace all" is the current teardown. The diff must be
  computed from the RAG change payload (`RagStoreChangedPayload` nodeIds) or by
  comparing old/new subgraphs. Using the payload is cheaper but assumes every
  change reports affected ids (it does: `{ kind, nodeIds, edgeIds }`).
  **Resolved (A1):** payload-driven primary + full-subgraph fallback.
- **R2 — `buildTraversal` purity vs identity.** `buildTraversal` is pure and
  re-derives the whole envelope. To preserve identity, the host must **reconcile**
  its materialized graph against the new envelope rather than reload it. This
  requires a new host module (a reconciler), not a change to the pure traversal.
  **Resolved (A2):** new `content-reconcile.ts`; traversal unchanged.
- **R3 — SSR/DOM parity.** PAR-5 requires the DOM and SSR fragment to agree.
  `runtime.render()` currently re-emits both from the fresh compile; a partial
  update must still produce a consistent SSR fragment. **Resolved (A9):** full
  SSR re-emit from the reconciled graph; DOM stays surgical.
- **R4 — The empty-store / first-load path.** Empty→content and the initial boot
  must still work; a content-only path must define the first materialization
  (there is no "old" graph to diff). **Resolved (A7):** boot/empty keep the full
  load; content-only applies once a graph is materialized.
- **R5 — `backRefs` recompute.** Currently recomputed from the assembled
  envelope (`recomputeBackRefs`, `:614`) on every load; a partial update must
  update the map incrementally or recompute cheaply without a rebuild.
  **Resolved:** recompute from the reconciled envelope (cheap; no rebuild of the
  DOM), preserving the existing pure helper.
- **R6 — Test surface.** Existing tests assert the rebuild path in places
  (caret-restore, backRefs, the "SCOPED-LOAD (live finding)" regression). A
  content-only path must not break those assertions — they may need to be
  re-anchored to the new mechanism. **Mitigation:** U-STATE-1d re-anchors the
  rebuild-path tests and adds identity/journal-survival tests.

### 3a. Adversarial hunt (RCA-3, read-only)

- **ADV-1 — the payload can under-report.** `RagStoreChangedPayload` carries
  `{kind, nodeIds, edgeIds}`; a change to an *edge* that re-parents a subtree
  may not list every descendant node id. **Mitigation:** treat the fallback
  (full old/new `css.id` comparison) as authoritative whenever a structural/diff
  ambiguity is detected; never trust the payload alone for a delete/reattach.
- **ADV-2 — reconciliation vs the dirty-edit guard.** A content change arriving
  mid-edit must be queued (existing `requestRebuild` dirty guard); a reconciler
  that bypasses the controller would clobber the live edit. **Pin (A8):** the
  reconciler is invoked through the same guard as today.
- **ADV-3 — identity churn from forks (C20/OB1).** A shared-node fork changes
  the edited node's id; the reconciler must handle a post-commit id change as a
  replace, and the `backRefs` map must be updated atomically. **Pin:** the fork
  path commits one `applyBatch`; the reconciler sees the same change event as any
  other.
- **ADV-4 — operator scope drift.** `mountOperator` is called once at boot; any
  later settings-driven re-render must re-render the EXISTING operator graph, not
  re-create the scope (`sidebar-panes.ts` currently `replaceChildren`s it).
  **Pin (A5):** scope created once; subsequent renders reuse it.
- **ADV-5 — journal survival is not free.** The `Supervisor` currently carries
  `maxJournalLength`; keeping it alive across changes means the journal is not
  reset — verify undo/redo across a content change produces a coherent graph
  (the journal ops reference node objects; a reconciled replace must be a
  journaled op so undo re-materializes correctly). **Pin (A6):** content
  replacement rides the managed channel so it is journaled; pin an
  undo-after-change test.

---

## 4. Required amendments / pinned decisions (step 3, DRAFT — to confirm)

| # | Decision | Proposed pin |
| --- | --- | --- |
| **A1** | Change-driven diff source | Use the `rag-store-changed` payload (`{kind, nodeIds, edgeIds}`) as the primary diff key; fall back to a full old/new `css.id` comparison when the payload is unavailable (template change, boot). |
| **A2** | Reconciler home | A NEW pure renderer module (e.g. `src/renderer/content-reconcile.ts`) computing per-root keep/replace/remove from old materialized ids + the new envelope; `SidebarPanes` applies it via managed ops. Keep `buildTraversal` pure/unchanged. |
| **A3** | Identity contract | A content root's identity is its `css.id` (`rag-<documentId>`, path-qualified per C15); a changed-but-same-id root is replaced via `state-slice`/subtree replace, not destroy+attach, where possible. |
| **A4** | Zone/container persistence | The template + `main`/`sidebar` container producers persist for the Runtime lifetime; only content-role roots are added/removed. |
| **A5** | Operator scope | `mountOperator` is called ONCE at boot; subsequent changes re-render its existing graph (no scope re-creation, no `replaceChildren`). |
| **A6** | Journal survival | The `Supervisor` persists across content changes (do not reconstruct it in `loadEnvelope` on the content-only path) so the C16 undo stack survives. |
| **A7** | First-load / empty path | Boot + empty-store keep the existing full load; content-only applies only once a graph is materialized. |
| **A8** | Dirty-edit guard | A content change during an in-progress edit is queued (existing `requestRebuild` dirty guard) and applied when clean, exactly as today. |
| **A9** | SSR consistency | Accept a full SSR-fragment re-emit from the reconciled graph (PAR-5 satisfied); DOM updates stay surgical. Pin which render call produces it. |
| **A10** | Scope | U-STATE-1 lands the repopulation mechanism + identity/journal/operator persistence; it does NOT add zones/tabs/chrome (those consume it in later waves). **AMENDED 2026-09-11 (OB2/Reading 2):** because zone container nodes are provident graph (`ui-overhaul` §7.3), the reconciler MUST also **preserve zone container nodes** across a RAG change — "mechanism-only" still includes zone-node preservation (no zone *creation*, but not destroying existing zones either). |

---

## 5. Proposed unit decomposition (draft; RCA-2)

1. **U-STATE-1a — reconciler** (pure diff: old ids + new envelope → keep/replace/
   remove lists; unit-testable, no Electron).
2. **U-STATE-1b — host application** (`SidebarPanes.refresh/reDerive` applies the
   reconciler via managed ops; zones/panes persist; `loadEnvelope` not called on
   the content path).
3. **U-STATE-1c — lifecycle state** (journal/Supervisor persists; `mountOperator`
   once; `backRefs` incremental; caret path re-anchored).
4. **U-STATE-1d — regression** (re-anchor the rebuild-path tests; add
   content-only tests: identity survives, undo history survives, operator mount
   count == 1).

Each unit is its own red→green→adversarial→blind-greens→doc-review cycle
(AGENTS.md item 9 / RCA-2). U-STATE-1a is delegable after step 3 + a TestWriter
red set (gate 9).

---

## 6. Open items for the Architect (final call)

**CLOSED BY DEFAULT (2026-09-11 — Architect "proceed"):**

1. **Diff source (A1):** **payload-driven primary + full-subgraph fallback.**
   Use `rag-store-changed` `{kind, nodeIds, edgeIds}` as the primary diff key;
   fall back to a full old/new `css.id` comparison for template changes / boot /
   any change without a payload.
2. **Reconciler vs traversal change (A2):** **new pure module**
   (`src/renderer/content-reconcile.ts`); `buildTraversal` stays pure/unchanged.
3. **Subtree replacement granularity (A3):** **whole-document-root replace v1**
   (simpler); per-edited-subtree replacement is a later optimization if
   profiling demands it.
4. **SSR re-emit (A9):** **full SSR re-emit from the reconciled graph** (PAR-5
   holds); the DOM update stays surgical.
5. **Scope confirmation (A10):** **mechanism-only** — plus the 2026-09-11
   amendment that zone container nodes are **preserved** (not created) across a
   change (Reading 2, `ui-overhaul` §7.3).

---

## Bottom line

**PROCEED-WITH-AMENDMENTS (GATED 2026-09-11).** Feasibility positive (the engine
has the primitives); the design is the **reconciler** (payload-primary diff +
full-subgraph fallback, whole-root replace v1) plus **journal/operator
persistence** and **zone-node preservation**. Amendments A1–A10 + adversarial
pins ADV-1..5 are authoritative. The next step is per-unit specs
(`docs/specs/unit-u-state-1a..1d.md`), each with its own TestWriter red set
before implementation (AGENTS.md item 9). No code yet.
