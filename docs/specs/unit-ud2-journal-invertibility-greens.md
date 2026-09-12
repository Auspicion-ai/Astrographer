# Unit U-D2 — Journal Invertibility of Document Metadata (`documentPath` / `tags`): Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (RCA-4) — derived from DOCUMENTATION ONLY. No
  implementation reading of `src/main/rag-store.ts`.
- **Source contract:** `docs/specs/unit-ud2-journal-invertibility.md` §5.6
  (happy-path states 1–15), §5.7 (fail-states 1–6), §3a (adversarial findings
  A1–A11, incl. A9 `[]`-vs-absent).
- **Harness:**
  `tests/blind-unit-ud2-journal-invertibility-greens.test.ts`. The store is
  exercised through the real `createJsonRagStore` factory against temp-file JSON
  stores. Node ids / metadata values (`red`/`green`/`blue`, `doc-N`,
  `guides`/`api`) are independently authored; the TestWriter assertions were not
  copied.
- **Harness-only reference:** `tests/unit-ud2-journal-invertibility.test.ts` was
  consulted ONLY for harness conventions (temp-dir setup, imports, `journal()`
  tail helper, `BatchResult` narrowing). The scenarios below are independently
  authored.
- **Command:**
  `npx vitest run tests/blind-unit-ud2-journal-invertibility-greens.test.ts`
- **Run:** 12 scenarios — 12 pass, 0 fail, 0 skipped. No spec-vs-impl drift.

Each scenario lists: id, the spec section it derives from, the assertion, and
the result.

---

## A. Classification + inversion

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| B1 | §5.6 1, §3a A1 | tags-only delta (`['red']`→`['red','blue']`, content/type/owned unchanged) lands `kind === 'structural'` + `op.op === 'node-update'`; `before.tags` `['red']`, `after.tags` `['red','blue']` | ✅ PASS |
| B2 | §5.6 3 | undo restores `tags` `['red']`; redo re-applies `['red','green']` | ✅ PASS |
| B3 | §5.6 2/4, §3a A1 | documentPath-only delta (`['guides']`→`['guides','api']`) is structural/`node-update` with both paths in the snapshots; undo restores `['guides']`, redo `['guides','api']` | ✅ PASS |
| B4 | §5.6 5, §3a A3 | content+metadata edit (`alpha`/`['red']` → `beta`/`['blue']`) yields EXACTLY ONE structural `node-update` entry and NO `content` entry; undo restores both, redo re-applies both | ✅ PASS |
| B12 | §5.6 1/2, §3a A1 | `documentPath` and `tags` changing TOGETHER yield exactly one structural entry (no `content`), and undo/redo inverts both fields together | ✅ PASS |

## B. Non-metadata paths stay put

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| B5 | §5.6 6, §5.7 6, §3a A10 | a content-only edit (metadata unchanged) stays `kind === 'content'`; the snapshot has NO `tags`/`documentPath` keys; a fresh boot has `corrupt=false` and preserves the metadata | ✅ PASS |
| B7 | §5.6 13, §3a A2/A9 | (`red` update) a metadata no-op — `tags: [' red ','red']` normalizes equal to stored `['red']`, content also changed — stays `kind === 'content'`; (`doc-7b`) a `tags: []` write against a stored absent `tags` stays `kind === 'content'` (no false metadata delta after normalization) | ✅ PASS |

## C. Normalization through the structural snapshot

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| B6 | §5.6 10, §3a A5 | `tags: []` after a stored `['red']` lands structural; `after.tags` is `undefined`; undo restores `['red']`; redo returns `undefined` | ✅ PASS |

## D. Off-root

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| B8 | §5.6 14 | a non-root node (`leaf/deep/node`) with metadata takes the same structural branch and inverts `documentPath` + `tags` | ✅ PASS |

## E. Batch path

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| B9 | §5.6 8, §5.4, §3a A6 | a one-op `applyBatch([{op:'putNode', ...tags}])` lands `kind === 'batch'`; undo restores `['red']`; redo re-applies `['green']` | ✅ PASS |

## F. Boot validators + hash/quarantine

| id | Spec | Assertion | Result |
| --- | --- | --- | --- |
| B10 | §5.6 11, §5.5, §3a A7 | a persisted metadata-bearing structural `node-update` entry survives boot (`corrupt=false`, exactly one accepted structural entry, node metadata intact) and `undo()` on the fresh store restores the prior metadata | ✅ PASS |
| B11 | §5.6 9, §5.7 5, §3a A4 | after a metadata update + `undo()` a fresh boot has `corrupt=false`, the node in `loadedNodes`, NOT in `quarantined`, with `['red']`; after `redo()` the same holds with `['green']` | ✅ PASS |

---

## Run record

**Totals: 12 scenarios — 12 PASS, 0 FAIL, 0 SKIPPED.**

### Scenarios that could NOT be blind-constructed

- **`isRagNode` / `isContentSnapshot` as direct unit calls — NOT blind-constructible.**
  §5.5 states `isRagNode` (accept branch) and `isContentSnapshot` (unchanged). The
  spec names them as internal helpers; neither is a documented export of
  `src/main/rag-store.ts` (the public surface is `createJsonRagStore` + the
  `RagStore` interface). Reading the implementation to confirm their export
  status is prohibited for a blind writer, so they are covered INDIRECTLY via
  observable behavior: the `isRagNode` accept branch by B10 (a persisted
  metadata-bearing structural entry survives boot), and the
  `isContentSnapshot`-unchanged claim by B5 (a content-only entry is accepted at
  boot and carries no metadata keys). The §5.7 fail-states 1/3/4 (malformed
  write rejection, undo desync) are structurally present in the TestWriter red
  set and were not duplicated here; the observable boot-skip of a malformed
  structural entry (§5.7 4) is likewise validator-internal and is covered by the
  TestWriter unit.

### Findings (spec-vs-impl drift)

- **None observed.** All 12 independently authored scenarios passed against the
  live `src/main/rag-store.ts`: a metadata-only delta (tags and/or
  `documentPath`) classifies as structural `node-update` with full snapshots
  carrying the normalized metadata; content+metadata is a single structural
  entry that inverts both; content-only and normalized no-op writes stay
  `content`; `[]` normalizes to `undefined` through the structural snapshot;
  off-root metadata inverts; the batch path inverts via its full prior-node
  inverse; a metadata structural entry survives boot; and undo/redo re-hash so a
  fresh boot has zero quarantines.
- No PACKAGE findings → no `docs/defects.md` / `docs/HANDOFF.md` update.
