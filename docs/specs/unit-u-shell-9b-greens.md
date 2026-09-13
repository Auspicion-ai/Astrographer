# Unit U-SHELL-9b — Repair Set (H1–H7) — Blind Greens

**Role:** Blind-test writer (AGENTS.md item 10a / RCA-4). **Date:** 2026-09-13.
**Source of expectations:** `docs/specs/unit-u-shell-9b-cross-document-shared.md`
ONLY — §2.6 (H1–H7), §2.6b/§2.6c (adversarial findings), §2.7 (per-document id
namespace), §2.8 (C20 + owners box), §2.9 (Option-C interception), §3 states 1–9,
§4 F7–F10b, §5 census — plus `docs/specs/wave-2-open-decisions.md` §D
(W2-N12/N13/N14 status).
**Artifact under test:** the U-SHELL-9b H1–H7 repair set (the code that fixed
the §2.6 adversarial findings).
**Probe:** `tests/unit-u-shell-9b-blind-greens.test.ts` (23 scenarios).

**Verdict: 23 scenarios — 23 PASS / 0 FAIL / 0 NOT-TESTED.**
No spec/doc drift and no regression was found in the repair set.

---

## Command

```
npx vitest run tests/unit-u-shell-9b-blind-greens.test.ts
```

Result: `Test Files 1 passed (1) | Tests 23 passed (23)`.

### Authoring notes (not product failures)

The first draft run was **18 pass / 5 fail**. All 5 failures were
**test-authoring wiring** mistakes, not product defects, and were corrected
without weakening any assertion:

- 4 failures: the fixture's document root NODE id did not equal its
  `documentId`, so single-document boot materialized no roots (the traversal
  keys a document body by the id that equals its `documentId` — harness wiring,
  confirmed by an ephemeral probe, not read from the implementation).
- 1 failure (unshared commit) was downstream of the same missing materialization.
- 1 transient `>2 owners` failure came from a fixture rename that left the
  wrong head id in the lookup; corrected.

The owners-box detector was changed from the fixed `OWNERS_BOX_ID` constant to
the box's `data-shared` marker because the box's `rag-`-prefixed authored id is
itself scoped by `scopeDocumentIds` in the multi-document path. This is a
selector choice (the spec does not pin the box id), not a weakened assertion —
see §Observations.

---

## Census

| Bucket | Count | IDs |
| --- | --- | --- |
| PASS | 23 | H3-1, H3-2, H3-3, H3-4, H3-5, H2-1, H2-2, H2-3, H2-4, H2-5, H2-6, H1-1, H1-2, H1-3, H1-4, H1-5, H1-6, H1-7, H1-8, H1-9, H1-10, H1-11, C1 |
| FAIL | 0 | — |
| NOT-TESTED | 0 | — |

---

## H3 / §2.7 — per-document id namespace (W2-N12)

### H3-1 — a shared node reached by two documents materializes as two distinct roots
- **Spec:** §2.7 (scope carrier + `data-rag-node-id` addressing key), §2.6 H3.
- **Input:** boot; `mountTabs([document:da, document:db])`; shared RAG node `shared` reached by both bodies.
- **Expected (spec):** two roots `rag-da--shared` / `rag-db--shared` with distinct authored ids; each addressed by the PLAIN `data-rag-node-id="shared"`; no bare `id="rag-shared"` in the simultaneous render.
- **Observed:** both distinct scoped roots materialize; `data-rag-node-id === 'shared'` on both; rendered HTML has `id="rag-da--shared"` + `id="rag-db--shared"` and NOT `id="rag-shared"`.
- **Verdict: PASS.**

### H3-2 — `materializedDocumentRoots()` attributes each root to its own document
- **Spec:** §2.7 attribution (no `perDoc[0]` contamination).
- **Input:** multi-mount both documents.
- **Expected (spec):** every root reported for `da` is `rag-da--…`; every root for `db` is `rag-db--…`; each includes its own shared root.
- **Observed:** `da` roots all `rag-da--*` (incl. `rag-da--shared`); `db` roots all `rag-db--*` (incl. `rag-db--shared`).
- **Verdict: PASS.**

### H3-3 — a content change to the shared node matches by the PLAIN ragId
- **Spec:** §2.7 (`plainRagId` from `data-rag-node-id`; `reconcileDocumentRoots` keys by `(documentId, cssId)`), §2.2 U-STATE-1e binding.
- **Input:** pure `reconcileDocumentRoots` — previous/next = two scoped roots (`rag-da--shared`, `rag-db--shared`), `change={kind:'content', nodeIds:['shared']}`.
- **Expected (spec):** both document-scoped roots are replaced; each result carries `ragNodeId === 'shared'`.
- **Observed:** `replaced = ['da|rag-da--shared','db|rag-db--shared']`; `ragNodeId === 'shared'` on both.
- **Verdict: PASS.**

### H3-4 — `plainRagId` is separator-robust (§2.6b AF3-1)
- **Spec:** §2.7 + §2.6b (`sanitizeDocumentId` permits `--`).
- **Input:** `{id:'rag-foo--bar--shared','data-rag-node-id':'shared'}`, `{id:'rag-x--y--a--b','data-rag-node-id':'a--b'}`.
- **Expected (spec):** plain id recovered (`'shared'`, `'a--b'`).
- **Observed:** exactly those.
- **Verdict: PASS.**

### H3-5 — a store content change repopulates both mounted scoped roots in place
- **Spec:** §2.1 (no `loadEnvelope`/teardown), §2.7, §3.9.
- **Input:** multi-mount both; `putNode(shared, content:'shared body v2')`; `host.reDerive('content')`.
- **Expected (spec):** both `rag-da--shared` / `rag-db--shared` survive with the plain addressing key and show the new content.
- **Observed:** both roots present, both `data-rag-node-id='shared'`, both serialized graphs contain `shared body v2`.
- **Verdict: PASS.**

---

## H2 / §2.8 — C20 materialization + owners box (W2-N14) + H7

### H2-1 — a shared subtree carries the C20 class + an owners box listing its sharers
- **Spec:** §2.8, §2.2/§2.5 pin 3 (`SHARED_SUBTREE_CLASS`), §3.2/§3.4.
- **Input:** boot with a snapshot whose reverse map is `shared → [da, db]`.
- **Expected (spec):** root `rag-shared` has the C20 class; a side owners box child lists both sharers from the snapshot edges.
- **Observed:** class present; owners box child present and its subtree references `da` and `db`.
- **Verdict: PASS.**

### H2-2 — a non-shared node carries neither the class nor an owners box
- **Spec:** §2.8 (only shared subtrees are decorated).
- **Input:** boot; head root `rag-head-da` (owner set size 1).
- **Expected (spec):** no C20 class, no owners box.
- **Observed:** neither present.
- **Verdict: PASS.**

### H2-3 — in the simultaneous mount BOTH duplicate scoped subtrees are decorated
- **Spec:** §3.4 (both duplicate subtrees carry the C20 background + owners box).
- **Input:** multi-mount both documents.
- **Expected (spec):** `rag-da--shared` and `rag-db--shared` each carry the class + an owners box listing both sharers.
- **Observed:** both decorated; both boxes list `da` + `db`.
- **Verdict: PASS.**

### H2-4 — the owners box is collapsible and `toggleOwnersBox` is registered on `window.provident.sidebar`
- **Spec:** §2.8/H7.
- **Input:** boot; read the box; call `window.provident.sidebar.toggleOwnersBox('shared')`.
- **Expected (spec):** the box defaults expanded; a registered sidebar method flips it to collapsed.
- **Observed:** `data-expanded` `true` → `false`; `typeof sidebar.toggleOwnersBox === 'function'`.
- **Verdict: PASS.**

### H2-5 — `buildOwnersMap(edges)` unions + dedupes each edge's `documentIds` onto its target
- **Spec:** §2.8.
- **Input:** edges targeting `shared` with `['da']` then `['db','da']`; an edge targeting `nested` with `['da']`.
- **Expected (spec):** `{shared:['da','db'], nested:['da']}`.
- **Observed:** exactly.
- **Verdict: PASS.**

### H2-6 — `buildOwnersMap` is total + non-mutating
- **Spec:** §2.8 ("Total on malformed input") + H5 dedup.
- **Input:** a valid edge with duplicated ids; `null`; `'nope'`; `[null,7,{},{target:'shared'}]`.
- **Expected (spec):** dedupes, never throws, does not mutate the input.
- **Observed:** `['da','db']`; no throw; input JSON unchanged.
- **Verdict: PASS.**

---

## H1 / §2.9 — Option-C commit interception (W2-N13)

### H1-1 — F8: an unavailable reverse map blocks the commit (no write) with a notice
- **Spec:** §2.9 (`blocked: true` ⇒ surface reason, NO write), §4 F8, §2.5 pin 7.
- **Input:** boot with the snapshot omitting `edges`; `textareaBlur('shared', …)`.
- **Expected (spec):** no `edit.commit`, no `edit.batch`, a materialized block notice, no confirmation strip.
- **Observed:** commit 0, batch 0, `pane-shared-commit-notice` materialized, strip absent.
- **Verdict: PASS.**

### H1-2 — an unshared commit still writes normally (control)
- **Spec:** §2.9 (`null` ⇒ existing commit path unchanged).
- **Input:** boot; `textareaBlur('head-da', 'edited head')`.
- **Expected (spec):** one `edit.commit`, no batch, no strip.
- **Observed:** commit 1, batch 0, no strip.
- **Verdict: PASS.**

### H1-3 — a commit on a shared node does NOT write; the fork/mutate-all/cancel strip appears
- **Spec:** §2.9, §3.1.
- **Input:** boot; `textareaBlur('shared', 'da edit')`.
- **Expected (spec):** no direct write; a confirmation strip content root with fork / mutate-all / cancel buttons.
- **Observed:** commit 0, batch 0; strip materialized with all three authored button ids.
- **Verdict: PASS.**

### H1-4 — fork applies ONE atomic batch; pending edit kept for the editing doc; other owner intact (§3.5 + AF1-1)
- **Spec:** §2.3/§2.9, §3.5, §2.6c AF1-1, F7 (atomicity).
- **Input:** 2 owners (`da`,`db`); blur `shared` with `'da edit'`; `sharedCommitFork()`.
- **Expected (spec):** exactly one `edit.batch`; original `shared` content unchanged and still owned by `db`; `da`'s edge re-points to a fork carrying the PENDING edit; the owned child is deep-copied; strip cleared.
- **Observed:** 1 batch; `shared` still `'shared body'`; `edge-db-next.target === 'shared'`; `head-da`'s next-section edge targets a new id whose content is `'da edit'`; a second `'nested child'` node exists; no `head-da` edge targets `shared`; strip gone.
- **Verdict: PASS.**

### H1-5 — §3.6: >2 owners render a checklist; fork migrates only the chosen owners
- **Spec:** §2.2/§2.3 (checklist at >2 owners), §3.6.
- **Input:** 3 owners (`da`,`db`,`dc`); blur; assert checklist; `sharedCommitFork(['da','dc'])`.
- **Expected (spec):** checklist lists all three sharing docs; chosen docs migrate to X′; the rest keep X.
- **Observed:** checklist = `['da','db','dc']`; one batch; `db` keeps `shared` and its `shared→nested` edge (documentIds drops `da`/`dc`); `head-da` and `head-dc` both target the same new fork.
- **Verdict: PASS.**

### H1-6 — §3.7: mutate-all applies the single same-id `putNode`
- **Spec:** §2.2/§2.3/§2.9, §3.7.
- **Input:** blur `shared`; `sharedCommitMutateAll('shared body v2')`.
- **Expected (spec):** one batch containing one `putNode` for the SAME id `shared`; no fork node.
- **Observed:** 1 batch / 1 op; `putNode.node.id === 'shared'`, content `'shared body v2'`; store updated; no other node carries the new content; strip cleared.
- **Verdict: PASS.**

### H1-7 — §2.9: cancel writes nothing and clears the strip
- **Spec:** §2.9.
- **Input:** blur; `sharedCommitCancel()`.
- **Expected (spec):** no commit, no batch, store unchanged, strip cleared.
- **Observed:** commit 0, batch 0, `shared` unchanged, strip gone.
- **Verdict: PASS.**

### H1-8 — F10b: an empty >2-owner selection is a no-op
- **Spec:** §4 F10b, §2.5 pin 5.
- **Input:** 3 owners; blur; `sharedCommitFork([])`.
- **Expected (spec):** no migration, no batch, store unchanged.
- **Observed:** batch 0; `shared` unchanged; owner edge set still `['da','db','dc']`; `edge-da-next` still present; strip cleared.
- **Verdict: PASS.**

### H1-9 — F7: a failed atomic batch leaves the store unchanged and the warn available
- **Spec:** §4 F7, §2.4 (one transaction; no partial mutation).
- **Input:** bridge `edit.batch` returns `{ok:false}`; blur; `sharedCommitFork()`.
- **Expected (spec):** no partial mutation; the warn/strip remains.
- **Observed:** 1 batch attempted; `shared` unchanged; no `'da edit'` node created; strip still present.
- **Verdict: PASS.**

### H1-10 — `sharedCommitStripContent` authors the buttons + the default-selected checklist
- **Spec:** §2.9.
- **Input:** a 2-owner warning (fork/mutate-all) and a 3-owner warning (`requireChecklist`).
- **Expected (spec):** distinct fork / mutate-all / cancel buttons; checklist only at >2 owners; the editing document default-selected.
- **Observed:** all three buttons present at 2 owners with NO checklist; 3-owner strip has one toggle per owner and `da` (editing doc) selected by default.
- **Verdict: PASS.**

### H1-11 — `detectSharedCommit` returns null / warn / blocked as pinned
- **Spec:** §2.5 pin 7, §2.9, §4 F8.
- **Input:** unknown node + owner map; shared node + owner map; shared node + `undefined` owners.
- **Expected (spec):** `null`; a warn with `requireChecklist` for >2 owners; a `blocked` warning when the reverse map is unavailable.
- **Observed:** `null`; `{owners:['da','db','dc'], requireChecklist:true}`; `{blocked:true, options:[]}`.
- **Verdict: PASS.**

---

## §5 Census

### C1 — a shared commit + fork in the multi-document mount keeps both roots
- **Spec:** §5 (writes via the existing `edit.*` + ONE atomic `applyBatch`), §2.1 (no teardown of the simultaneous mount).
- **Input:** multi-mount both; blur `shared`; `sharedCommitFork()`.
- **Expected (spec):** one batch; both documents still mounted; the non-editing document keeps its shared root.
- **Observed:** 1 batch; `rag-db--shared` still materialized; `da` still renders a scoped `rag-da--*` root (the fork).
- **Verdict: PASS.**

---

## Observations (for the documentation reviewer)

1. **LOW — `OWNERS_BOX_ID` is not a stable selector in the multi-document path.**
   The owners box's authored id is `rag-shared-owners-box` (starts with `rag-`),
   so `scopeDocumentIds` rewrites it to `rag-<documentId>--shared-owners-box`.
   This does not break the H7 toggle (the handler reads `data-rag-node-id`) and
   the box remains a direct child of its shared root, so **no assertion failed**.
   The spec does not pin the box id, and §2.7 says every `rag-…` authored id is
   scoped; this is recorded as an observation only. The blind test addresses the
   box by its `data-shared` marker rather than the constant.
2. **Fixture requirement (not a defect):** a document's root NODE id must equal
   its `documentId` for the traversal to materialize the body. Recorded so a
   future fixture author is not surprised.
3. No residual W2-N15 (`operator`/`template` re-derive scope) behavior was
   exercised — it is explicitly outside the §2.7/§2.8/§2.9 seams and remains OPEN
   per `wave-2-open-decisions.md` §D.

## Trio (post-run)

| Leg | Command | Result |
| --- | --- | --- |
| Tests | `npm test` | **185 files / 4327 passed + 58 skipped** (baseline 184/4304+58 → +1 file / +23 tests, the blind file) |
| Typecheck | `npm run typecheck` | exit 0 |
| Build | `npm run build` | exit 0 (main cjs + preload cjs + standalone + battery-host + renderer esm) |

No regression in the existing suite.

## Provenance / blindness disclosure

Expectations were derived from the spec. To construct fixtures I read the
**exported type declarations/signatures and constants** of
`src/renderer/cross-document-shared.ts` and `src/renderer/content-reconcile.ts`,
and the existing test-harness wiring. I did **not** read `src/main/preload.ts`,
nor the implementation bodies of `src/renderer/sidebar-panes.ts` (only grepped
method signatures) or `src/renderer/content-reconcile.ts` to derive an expected
value. While reading `cross-document-shared.ts` for its signatures I did see
portions of its implementation; no expected value in this file was copied from
code or from an existing test.
