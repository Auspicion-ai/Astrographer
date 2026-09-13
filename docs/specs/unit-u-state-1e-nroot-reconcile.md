# Unit U-STATE-1e — N-Root Multi-Document Reconcile — Spec

**Status: GREEN — COMPLETE (2026-09-12).** Implemented + tested. Unit file
`tests/unit-u-state-1e-nroot-reconcile.test.ts` — **28 pass** (0 skip). Blind
artifact `docs/specs/unit-u-state-1e-nroot-reconcile-greens.md` — **24
scenarios — 22 PASS + 2 NOT-TESTED** (the initial blind run was 19 PASS / 3
FAIL / 2 NOT-TESTED; the F2/F5/F8 FAILs were the stale-root-scope drift, fixed
by the Implementer — see §9 + the artifact's FAIL detail/drift note). Trio:
**180 files / 4225 pass + 58 skip**, typecheck 0, build OK. Documentation
review (RCA-6): `archive/reviews/2026-09-12-u-state-1e-doc-review.md`. This
unit is the blocker for U-SHELL-9b
(`docs/specs/unit-u-shell-9b-cross-document-shared.md`) and the prerequisite
for the live C20/Option-C behavior; it is now **unblocked**.

**Cycle record (2026-09-12, RCA-1/RCA-2):** TestWriter red (suite-load — the
`reconcileDocumentRoots` export + the `ScopedRoot` buckets absent) → Implementer
green (the first landing omitted the out-of-scope-previous-root drop, so the
blind run reported F2/F5/F8 FAIL) → adversarial pass (RCA-3, §9): H1/H2/L1
FIXED, L3 RESOLVED (wording), H3 DEFERRED to U-SHELL-9b (**FIXED 2026-09-13** —
9b's per-document id namespace, `unit-u-shell-9b-cross-document-shared.md`
§2.6/§2.7), L2 (the 1a-inherited
circular `content`/`children` RangeError) recorded → the stale-root drop nuance
pinned in §4 F8 → blind re-run reconciled F2/F5/F8 to PASS → the documentation
review (RCA-6) `archive/reviews/2026-09-12-u-state-1e-doc-review.md`.

Gate: `docs/specs/u-state-1-content-repopulation-review.md`
(PROCEED-WITH-AMENDMENTS) + the **W2-Q17=(a)** ruling
(`docs/specs/wave-2-open-decisions.md` §B: "Extend the reconciler to N document
roots + identity replace (a U-STATE-1 follow-on unit) **before** U-SHELL-9; no
single-active-only shortcut."). **Depends on U-STATE-1a/1b/1c** (all landed):
the pure reconciler `src/renderer/content-reconcile.ts`, the host application
`Runtime.applyContentReconcile`/`materializedContentRoots`/`materializedDocumentRoots`
+ the `SidebarPanes.reDerive('content')` path, and the persistent
hub/Supervisor scaffolding.

> **Naming note (collision RESOLVED 2026-09-12).** The original U-STATE-1
> decomposition placed the **regression re-anchoring** (re-anchor the rebuild-path
> tests) in the `1d` slot (`docs/specs/u-state-1-content-repopulation-review.md`
> §5 item 4; `unit-u-state-1a-content-reconcile.md:48`;
> `unit-u-state-1b-host-application.md:127`;
> `unit-u-state-1c-persistent-scaffolding.md:216`). That regression re-anchoring
> **landed inside the 1b cycle** (recorded in `docs/next-steps.md:60`: "1b (host
> application) + 1c (persistent scaffolding) + 1d (test re-anchoring) done") and
> keeps the landed `1d` label. The W2-Q17(a) follow-on was initially drafted
> under that same `1d` slot, colliding with the landed sub-unit. The collision is
> **now resolved: this unit is `U-STATE-1e`**, its spec filename is
> `docs/specs/unit-u-state-1e-nroot-reconcile.md`, and the 9a/9b references are
> repointed. No renumber is pending. See §8.

---

## 1. What the proposal asks

The landed reconciler (U-STATE-1a) and host application (U-STATE-1b) are
**single-current-document**: `SidebarPanes.reDerive` builds a traversal for
`[current]` (or the sorted doc list at boot) and `Runtime.materializedContentRoots()`
returns **one flat `LegacyNodeData[]`** with no document scope. That cannot
serve the C14 simultaneous multi-document render (U-SHELL-9b), and it cannot
express the Option-C fork's **identity change** in one document while other
documents keep the original node.

This unit extends the reconciler and the 1b/1c host application to:

1. **N document roots materialized concurrently** — one content-root group per
   open document tab — surviving a RAG content change with no
   `loadEnvelope`/teardown (C10).
2. **Per-root identity replace** — a fork replaces **only the editing
   document's** subtree root (`rag-X` → `rag-X′` in that document); the other
   owners' roots (`rag-X` in the other documents) are **unchanged**.

The single-root path must not regress: with one document the result is
identical to today's `reconcileContentRoots`.

## 2. Contract (pinned)

### 2.1 Landed surface (U-STATE-1a/1b — verbatim, unchanged)

```ts
// src/renderer/content-reconcile.ts — PURE (no Electron, no DOM)
export type PreviousRoot = LegacyNodeData

export interface ReconcileChange {
  kind: 'content' | 'structural'
  nodeIds: string[]
  edgeIds: string[]
}

export interface MaterializedRoot {
  cssId: string     // e.g. `rag-<ragNodeId>`
  ragNodeId: string // cssId minus the `rag-` prefix
}

export interface ReconcileInput {
  previous: PreviousRoot[]
  next: LegacyInitialData
  change: ReconcileChange | null
}

export interface ReconcileResult {
  added: MaterializedRoot[]
  replaced: MaterializedRoot[]
  removed: MaterializedRoot[]
  kept: MaterializedRoot[]
  usedFallback: boolean
}

export function reconcileContentRoots(input: ReconcileInput): ReconcileResult
```

Runtime surface (U-STATE-1b/1c): `Runtime.materializedContentRoots()` (returns
the flat `contentRoots` copy), `Runtime.applyContentReconcile({ result, next })`,
`Runtime.admitContentNodes(nodes)`. Traversal surface (unchanged):
`buildTraversal({ store, documentIds, zoneName, template? })` already accepts
`documentIds: string[]`, and `computeDocumentSubgraph(store, documentId)` derives
one document's node set.

### 2.2 N-root extension (pinned behavior; additive shape proposed)

**Behavioral pins (from W2-Q17=(a)):**

- **N document roots concurrently.** The reconciler must classify content roots
  against **all open documents**, and the host must materialize one root group
  per open document tab. `buildTraversal` is NOT changed; it is called with the
  full `documentIds` set (the open tabs' document ids) or once per document —
  the reconciler consumes the resulting envelope(s).
- **A root is keyed by `(documentId, cssId)`**, not `cssId` alone. The same
  shared RAG node materialized in two simultaneously-rendered documents is **two
  distinct roots** (the `CROSS-DOCUMENT-SHARED` duplicate subtrees). A
  `cssId`-only key would collapse them (the 1a `prevByCssId`/`nextByCssId`
  first-wins maps) and could not express a per-document identity replace.
- **Per-root identity replace.** When a fork changes the editing document `D`'s
  root from `rag-X` to `rag-X′` (the Option-C `edit.create_node` copy), the
  reconciler emits an identity replace for **D only**; every other document's
  `rag-X` root stays **kept** (unchanged). The replace is the whole-root
  `destroy` + `placement-attach` mechanism (A3), applied per document.
- **Panes** (`pane-<id>`) remain content roots and stay **shape-compared
  always** (the 1b/1a pane-refresh rule); they are not document-scoped.
- **Fallback + ADV-1** are preserved: the payload is unioned in, never
  discarded; a null/malformed/structural/edge-bearing change runs the
  full-subgraph fallback; `usedFallback` is reported.
- **Single-root no-regression.** With one `documentId`, the output equals the
  current `reconcileContentRoots` result (same buckets, same order, same
  `usedFallback`). The existing 1a adversarial/unit tests stay green.

**Ratified additive shape (2026-09-12, Architect):**

```ts
/** A materialized content root scoped to its owning document (one per open
 *  document tab). Document-scoped so two documents sharing a RAG node are
 *  distinct roots. */
export interface DocumentRoot {
  documentId: string
  root: PreviousRoot              // the previously materialized root NODE (LegacyNodeData), scoped
}

export interface NRootReconcileInput {
  /** Every currently materialized content root, in render order, WITH its
   *  document scope (the flat `Runtime.contentRoots` plus a scope). */
  previous: DocumentRoot[]
  /** The newly built traversal envelopes, ONE PER OPEN DOCUMENT (the host calls
   *  `buildTraversal` once per document so each envelope is unambiguously scoped
   *  — `buildTraversal` itself is unchanged). Render order = `documentIds` order. */
  next: { documentId: string; envelope: LegacyInitialData }[]
  /** The `rag-store-changed` payload; null forces the fallback. */
  change: ReconcileChange | null
  /** The document ids materialized concurrently (one per open document tab). */
  documentIds: string[]
}

export interface ScopedRoot extends MaterializedRoot {
  documentId: string             // the owning document (pane roots use '')
}

export interface NRootReconcileResult {
  added: ScopedRoot[]
  replaced: ScopedRoot[]
  removed: ScopedRoot[]
  kept: ScopedRoot[]
  usedFallback: boolean
  /** Per-document identity replaces (a fork changed only the editing
   *  document's root): `from`/`to` are the `rag-<id>` css ids in `documentId`. */
  identityReplaced: { documentId: string; from: MaterializedRoot; to: MaterializedRoot }[]
}

export function reconcileDocumentRoots(input: NRootReconcileInput): NRootReconcileResult
```

- **Identity-replace encoding (RULED):** the explicit `identityReplaced` bucket
  (not `removed` + `added`).
- **Keying (RULED):** roots are keyed by **`(documentId, cssId)`**; the result
  buckets are **`ScopedRoot`** (carry `documentId`) so the same `cssId` in two
  documents is unambiguous. Panes use `documentId: ''` and are keyed by `cssId`
  only (shape-compared always).
- **Cross-document correctness (adversarial H1/H2, RULED):** `added`/`removed`/
  `kept` are computed **per document** (`prevByDoc` vs `nextByDoc`). The
  identity `consumed` **payload suppression is global** (a fork's payload ids
  must not re-mark another document's shared root — §3 state 6), while the
  `identFrom`/`identTo` **bucket filters are document-scoped** (keyed
  `(documentId, cssId)`) so A's identity replace never suppresses B's own
  same-cssId add (H2a) or remove (H2b). A root that moves from A to B is
  `removed` from A **and** `added` to B (never global `kept`). A fork in A
  leaves B's same-cssId root `kept`.
- **Duplicate `documentIds`** are de-duped before the ordered traverse (H1/L1).
- **Single-root no-regression** holds for **non-identity** changes; an identity
  replace deliberately diverges (`identityReplaced` vs `removed`+`added`) — the
  pin is amended to exempt identity (L3).
- **H3 deferred + documented:** the host identity apply ignores `documentId`
  (`Runtime.applyContentReconcile`; `destroyRoot` resolves a cssId globally), so
  a multi-scope same-cssId identity replace would destroy the wrong document's
  node. The per-document **id-namespace/mount** is U-SHELL-9b's (§8 item 2);
  until 9b, a multi-document same-cssId identity replace is unsupported
  (single-active/single-document is the current live path). Recorded as a
  9b-prerequisite. **RESOLVED 2026-09-13 (U-SHELL-9b H3 / W2-N12):** the
  per-document id namespace landed (`unit-u-shell-9b-cross-document-shared.md`
  §2.6/§2.7); scoped cssIds are globally unique, so the Runtime global
  `destroyRoot`/`attachRoot` path is correct as-is.
- `reconcileContentRoots` is kept (the single-root path, unchanged). The 1b host
  application must accept the scoped buckets and apply the per-document replace
  through the landed `attachRoot`/`destroyRoot` seams.

## 3. States (TestWriter red set — valid paths)

1. Two document ids materialized; both roots returned; neither is a pane.
2. A content change editing document A → only A's root group is replaced; B's
   roots are kept; the template/zone nodes persist.
3. A structural change adding document C → C's roots attach; A/B kept.
4. A structural change removing document B → B's roots destroyed; A/C kept.
5. A shared RAG node in documents A and B → it is **two distinct roots**
   (`(A, rag-X)`, `(B, rag-X)`); a change to it replaces both; a change to a
   node only in A leaves B's shared root kept.
6. **Per-root identity replace:** a fork in document A changes A's root
   `rag-X` → `rag-X′`; A's root is replaced in place; **B's `rag-X` is kept
   unchanged**.
7. `usedFallback` semantics preserved: a clean content change reports `false`;
   a structural/edge-bearing/null change reports `true`.
8. Single-root no-regression: with one document, the result is identical to
   `reconcileContentRoots` for the same `previous`/`next`/`change`.
9. Determinism: two runs on identical inputs are deep-equal; bucket order
   follows `next` (removed follows `previous`).
10. The content path still calls `loadEnvelope` **0 times** (C10; the 1b
    re-anchored contenteditable CRITICAL #1 stays green).

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | a `documentId` in `documentIds` absent from `next` | no roots for it; never throws (set difference) |
| F2 | an empty `documentIds` | no-op result; the boot/empty-store path keeps the full load (A7) |
| F3 | a malformed `next` / missing `template.root` | the documented guard throw (the 1a F1 precedent), never a raw TypeError |
| F4 | duplicate `(documentId, cssId)` in `previous` | first wins (the 1a F3 precedent), deterministic |
| F5 | a `rag-` root not scoped to any open document | out of the N-root set; never emitted (no phantom document) |
| F6 | a fork batch fails mid-commit | no partial mutation (the Option-C `applyBatch` atomicity); the reconciler sees no change event |
| F7 | a `pane-` root present among document roots | reconciled separately (shape-compared always), never attributed to a document |
| F8 | a mounted document not in `documentIds` (stale) | **Content/`null` change:** dropped from the result (excluded from ALL buckets); the host detaches it (or holds it per the 9b mount policy). **Structural change that closes the document:** reported as `removed` so the host destroys it (§3 state 4). See §9 (stale-root drop nuance) |

**Stale-root drop nuance (F2/F5/F8):** a previous document root whose non-empty
`documentId` is not in `documentIds` is out of the N-root set. A **content**
(or `null`) change DROPS it (excluded from every bucket — never `removed`); a
**structural** change that closed the document DOES report it as `removed` so
the host destroys it. Panes (`documentId: ''`) are never document-scoped and
keep the prior classification.

## 5. Census

- **Pure module:** `src/renderer/content-reconcile.ts` gains the N-root
  reconciler — landed (2026-09-12): **+1 function** (`reconcileDocumentRoots`)
  **+ `DocumentRoot`/`NRootReconcileInput`/`ScopedRoot`/`NRootReconcileResult`**
  (the additive diff is 275 insertions / 0 deletions). `reconcileContentRoots`
  and its 1 function + 5 types are **unchanged** (the 1a census: 1 function + 5
  types + 0 consts).
- **Host (landed):** `Runtime.materializedDocumentRoots()` (the scoped
  `previous`) + `ApplyReconcileInput.documents` (one envelope per open document)
  + the `identityReplaced` apply loop through the same `destroyRoot`/`attachRoot`
  seams; `SidebarPanes.reDerive('content')` remains single-active until
  U-SHELL-9b mounts N documents.
- **`buildTraversal` unchanged** (`src/main/traversal.ts` not modified).
- 0 new dependencies; no `provident-ssr` change.
- Exact export/test counts are pinned by the TestWriter red set + Implementer,
  per RCA-1. **Landed counts:** unit file **28 pass**; blind artifact **24
  scenarios (22 PASS + 2 NOT-TESTED)**; trio **180 files / 4225 pass + 58
  skip**, typecheck 0, build OK.

## 6. Cross-references

- Gate `docs/specs/u-state-1-content-repopulation-review.md` (A1–A10, ADV-1,
  ADV-3) + decision `U-STATE-1-CONTENT-REPOPULATION-GATE`.
- W2-Q17=(a) `docs/specs/wave-2-open-decisions.md` §B.
- Landed dependencies: `unit-u-state-1a-content-reconcile.md`,
  `unit-u-state-1b-host-application.md`, `unit-u-state-1c-persistent-scaffolding.md`.
- Consumer (blocked on this unit): `unit-u-shell-9b-cross-document-shared.md`.
- Decision/contract: `CROSS-DOCUMENT-SHARED`, `SUBTREE-OWNERSHIP`,
  `BATCH-ATOMICITY-API`.
- Build: `src/renderer/content-reconcile.ts`, `src/renderer/runtime.ts`,
  `src/renderer/sidebar-panes.ts`, `src/main/traversal.ts`
  (`buildTraversal`/`computeDocumentSubgraph`, unchanged).

## 7. Delimitation

This unit lands the **N-root reconcile + per-root identity replace** only. It
does NOT build the tab strip or `TabState` (U-SHELL-9a), the simultaneous
multi-document render mount policy or C20/Option-C (U-SHELL-9b), the pane zones
(U-SHELL-1), or the Option-C modal/checklist UI. It must NOT change
`buildTraversal`; it must NOT regress the single-root `reconcileContentRoots`
path or the 1a/1b/1c tests. It does not touch the RAG store or the `edit.*` ops
(the fork's writes are U-SHELL-9b's).

## 8. Open items

1. **Bucket encoding of a per-root identity replace — RESOLVED (2026-09-12):**
   the explicit `identityReplaced: { documentId, from, to }[]` bucket (see §2.2).
2. **Root-identity disambiguation — RESOLVED (2026-09-12):** the reconciler keys
   by `(documentId, cssId)` and `next` is **one traversal envelope per open
   document** (the host calls `buildTraversal` once per document; `buildTraversal`
   unchanged). The render/mount id-namespace for two simultaneously-rendered
   documents sharing a `rag-<id>` css.id is **U-SHELL-9b's** (may need a shell/
   engine id-scope decision); the reconciler half is pinned here.
3. **Naming — collision RESOLVED (`U-STATE-1e`).** This unit was initially
   drafted under the same `1d` slot as the already-landed regression
   re-anchoring sub-unit. The label is now **`U-STATE-1e`** (see the header
   note); the spec filename and the 9a/9b references are repointed
   (`docs/specs/unit-u-state-1e-nroot-reconcile.md`). The landed regression
   re-anchoring keeps the landed `1d` label. No renumber is pending.

## 9. Adversarial findings (2026-09-12)

Recorded by the RCA-3 adversarial pass AFTER the unit's green (the reconciler
half; the host half is U-SHELL-9b's). All findings are on this repo's host code
(`src/renderer/content-reconcile.ts`) unless the row says otherwise; none is a
`provident-ssr` package defect, so nothing here is handed off
(`docs/defects.md`/`docs/HANDOFF.md` unchanged).

| # | Severity | Finding | Disposition |
| --- | --- | --- | --- |
| H1 | HIGH | A `cssId`-only/global key classified a root that moved A→B (or an A↔B swap) as a global `kept` instead of per-document `removed`+`added`. | **FIXED** — `added`/`removed`/`kept` are computed per document (`prevByDoc` vs `nextByDoc`); a root moving A→B is `removed` from A **and** `added` to B. Blind H1a/H1b PASS. |
| H2 | HIGH | The identity bucket filters were global, so a fork in A suppressed B's own same-`cssId` add (H2a) or remove (H2b). | **FIXED** — the `identFrom`/`identTo` bucket filters are keyed `(documentId, cssId)`; only the `consumed` payload suppression stays global (so A's fork leaves B's shared `rag-X` `kept`, §3 state 6). Blind H2a/H2b PASS. |
| L1 | LOW | Duplicate `documentIds` (`['A','A']`) produced duplicate scoped roots. | **FIXED** — `documentIds` de-duped first-occurrence before the ordered traverse. Blind H1b/L1 PASS. |
| L2 | LOW | `collectRagIds`/`shapeProjection` recurse over `children` with no visited-set/depth cap, so a CIRCULAR (or pathologically deep) `content`/`children` structure throws `RangeError: Maximum call stack size exceeded`. **Inherited from U-STATE-1a** (the same recursion); not reachable from a well-formed traversal envelope. | **RECORDED (not fixed in 1e)** — a hardening follow-up (visited-set/depth guard, mirroring the Unit S `TOK-F1` / Unit U2 `ADR-4` stack-safety discipline) is tracked as **W2-N11** in `docs/specs/wave-2-open-decisions.md` §D. |
| L3 | LOW | The §2.2 single-root no-regression pin claimed the N-root result equals `reconcileContentRoots` for one document, but an identity replace deliberately diverges (`identityReplaced` vs `removed`+`added`). | **RESOLVED (wording)** — the pin is amended to exempt identity: no-regression holds for NON-identity changes; an identity replace diverges into `identityReplaced`. Blind L3a/L3b PASS. |
| H3 | HIGH (host) | `Runtime.applyContentReconcile` ignores `documentId`; `destroyRoot` resolves a `cssId` GLOBALLY, so a multi-scope same-`cssId` identity replace would destroy the wrong document's node. | **DEFERRED to U-SHELL-9b** — the per-document id-namespace/mount is U-SHELL-9b's (§8 item 2); recorded as a 9b-prerequisite (**W2-N12**). **RESOLVED 2026-09-13 (9b H3):** the per-document id namespace makes scoped cssIds globally unique (`unit-u-shell-9b-cross-document-shared.md` §2.6/§2.7). |
