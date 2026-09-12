# Blind Greens — Unit U-D4: Doc-Heads Listing + Derived Category Tree

- **Artifact:** `tests/blind-unit-ud4-doc-heads-tree-greens.test.ts`
- **Written by:** blind-test writer (RCA-4), from
  `docs/specs/unit-ud4-doc-heads-tree.md` (+ §3a/§3b) and the harness
  conventions of `tests/unit-ud4-doc-heads-tree.test.ts` ONLY. **No
  implementation source was read** (`src/shared/document-tree.ts`,
  `src/main/mcp-server.ts`, `src/shared/types.ts`, `src/renderer/*`) to decide
  expected behavior; those modules were imported only.
- **Command:** `npx vitest run tests/blind-unit-ud4-doc-heads-tree-greens.test.ts`
- **Result:** **44 tests — 44 PASS / 0 FAIL** (after the F4-followup fix —
  `UD4-B2.3`; originally 43 PASS / 1 FAIL). Start 2026-09-11.

## 1. Scenario results

| Scenario | Spec section | Assertion | Result |
| --- | --- | --- | --- |
| UD4-B1.1 | §5.1 / §5.6-1 | entry exposes exactly `documentId/title/path/tags`; `path`/`tags` arrays | PASS |
| UD4-B1.2 | §5.1 | payload documents element is the widened entry shape | PASS |
| UD4-B2.1 | §5.2 / §5.6-2 | `path`/`tags` from ROOT `e.target`; `title` from head SECTION `e.source` | PASS |
| UD4-B2.2 | §5.6-3 | root with no `documentPath`/`tags` → `[]`/`[]` | PASS |
| UD4-B2.3 | §5.2 (F4) / §3a | non-array root `documentPath`/`tags` → `[]`/`[]` | PASS |
| UD4-B2.4 | §5.6-5 | missing head section source → `title: ''`, path/tags from root | PASS |
| UD4-B2.5 | §5.6-6 | dedupe by target (first head wins) + ascending `documentId` sort | PASS |
| UD4-B3.1 | §5.7-6 / A1 | edge survives but ROOT absent → `[]`/`[]`, no throw | PASS |
| UD4-B3.2 | §5.7-7 / A2 | empty/undefined target edge skipped, no phantom | PASS |
| UD4-B3.3 | §3a F2 | number/object/boolean target skipped, not coerced | PASS |
| UD4-B3.4 | §5.2 | no doc-head edges → `{ documents: [] }` | PASS |
| UD4-B3.5 | §5.2 | null store throws `rag-doc-heads: no rag store configured` | PASS |
| UD4-B4.1 | §5.5 / §5.7-11 (C9,A6) | absent root path → `[]` even for `/`-qualified id | PASS |
| UD4-B4.2 | §5.7-11 | prefixed id `S:area/readme` with absent path → `[]` | PASS |
| UD4-B5.1 | §5.7-12 / A9 | handler invokes no write method (read-only spy) | PASS |
| UD4-B5.2 | §5.2 / A8 | mutating emitted path/tags does not mutate store arrays | PASS |
| UD4-B6.1 | §5.6-7 | two root-level docs → two document leaves, `path: []` | PASS |
| UD4-B6.2 | §5.6-8 | nested doc → folder wrapping leaf | PASS |
| UD4-B6.3 | §5.6-9 | deep doc → folder chain → leaf, no empty branch | PASS |
| UD4-B6.4 | §5.3-3 | shared prefixes share one folder; distinct subfolders distinct | PASS |
| UD4-B6.5 | §5.6-12 | leaf carries tags; non-string title → `''` | PASS |
| UD4-B7.1 | §5.7-1 / F8 / A4 | skipped entry creates no folder; every folder has ≥1 descendant | PASS |
| UD4-B7.2 | §5.7-1 / F8 | all entries skipped → no folders emitted | PASS |
| UD4-B8.1 | §5.6-11 / A5 | segment-also-document: distinct folder+leaf, folder first | PASS |
| UD4-B8.2 | §5.6-10 | root siblings sorted by label, repeatable | PASS |
| UD4-B8.3 | §5.3-6 | equal labels tiebreak by full id | PASS |
| UD4-B8.4 | §5.3-7 | duplicate `documentId` → two leaves, stable input order | PASS |
| UD4-B9.1 | §5.7-2 / A3 | non-array container → `[]`, never throws | PASS |
| UD4-B9.2 | §5.7-3 / A3 | malformed entries (null/primitive/array/bad id) skipped | PASS |
| UD4-B9.3 | §5.7-4 / A3 | non-array path → `[]`; invalid member truncates retaining earlier | PASS |
| UD4-B9.4 | §5.7-5 / A3 | non-array tags → `[]`; non-string members filtered, order kept | PASS |
| UD4-B10.1 | §5.3-6 / F1 | 10 000-segment path builds without `RangeError` | PASS |
| UD4-B11.1 | §5.6-13 | prefix `['a']` matches element-wise (not string-prefix) | PASS |
| UD4-B11.2 | §5.6-14 | empty prefix `[]` = all documents, sorted | PASS |
| UD4-B11.3 | §5.6-15 | sub-prefix matches equal-or-longer paths | PASS |
| UD4-B11.4 | §5.4 | prefix longer than every path → `[]` | PASS |
| UD4-B11.5 | §5.7-10 | no-matching prefix → `[]` | PASS |
| UD4-B11.6 | §5.4 | legacy path `[]` matches only the empty prefix | PASS |
| UD4-B11.7 | §5.4 | output deduped (first occurrence) then sorted ascending | PASS |
| UD4-B11.8 | §5.7-11 (C9) | prefixed legacy id not selected by non-empty prefix (no id split) | PASS |
| UD4-B11.9 | §5.7-9 / A7 | non-array prefix behaves as `[]`; non-array docs → `[]`; no throw | PASS |
| UD4-B11.10 | §5.4 / A7 | malformed entries contribute no id | PASS |
| UD4-B12.1 | §5.8 | `document-tree` exports exactly the 2 spec'd functions | PASS |
| UD4-B12.2 | §5.5 / §5.6-16 | `deriveDocNavDocuments` over widened entries stays flat | PASS |

## 2. Finding (RESOLVED — F4-followup)

### UD4-B2.3 — non-array root `documentPath`/`tags` was spread into characters instead of emitting `[]`

- **Spec authority:** §5.2 handler rule "`[]`, never `undefined` — an absent
  root, an absent field, or a non-array (malformed tampered) field all emit
  `[]`"; §5.2; §3a **F4** ("a target present in `listNodes()` but whose
  `documentPath`/`tags` are non-arrays (tampered shape) emits `[]`/`[]` — no
  throw").
- **Scenario:** a `doc-head` edge to a root node with
  `documentPath: 'oops'` / `tags: 'nope'` (string, not array) via the documented
  `createSnapshotStore(nodes, edges)` fixture.
- **Expected:** emitted entry `path: []`, `tags: []`.
- **Observed (before fix):** `path` = `['o','o','p','s']` — the string is
  iterated/spread into characters; `tags` likewise would be `['n','o','p','e']`.
  No throw.
- **Root cause:** `createSnapshotStore`'s `copyNode` (`src/main/adjacency.ts`)
  copied the fields with `[...n.documentPath]`/`[...n.tags]` WITHOUT an
  `Array.isArray` guard, so a tampered non-array string was spread into its
  characters before `handleRagDocHeadsIpc` (already guarded with
  `Array.isArray(root.documentPath)`) ever saw it. The divergence was in the
  store copy layer, not the handler.
- **Fix:** `copyNode` now spreads only when the field is an array
  (`Array.isArray(n.documentPath) ? { documentPath: [...n.documentPath] } : {}`,
  likewise `tags`), omitting the key when it is not an array so the handler's
  `[]` default applies. Regression pinned in
  `tests/unit-ud4-doc-heads-tree-adversarial.test.ts` (F4-followup).
- **Status:** **RESOLVED** — `UD4-B2.3` now PASSes (44/44). Recorded in
  `docs/specs/unit-ud4-doc-heads-tree.md` §3a **F4**.
- **Reproduction:** `UD4-B2.3` in
  `tests/blind-unit-ud4-doc-heads-tree-greens.test.ts:118-134`.

## 3. Non-blind-constructible scenarios (with reason)

| Spec item | Reason not constructed |
| --- | --- |
| §5.7-6 / F3 **real-store quarantine** (tampered hash → store quarantines the `doc-head` EDGE too → `{ documents: [] }`) | Requires the U-D1 boot re-verify/quarantine path; no documented public constructor seeds a quarantined edge. Only the weaker "edge survives, root absent" case is expressible via `createSnapshotStore` (covered by UD4-B3.1). |
| §5.6-16 first half — `buildContext().docHeads` includes `path`/`tags` | `buildContext` is part of the sidebar-panes host/Electron boot wiring; no pure constructor is documented. The data availability is covered structurally by UD4-B1.1/B1.2, and the renderer reconciliation by UD4-B12.2. |
| §5.7-12 / A9 — "no `fs`/Electron access" in the pure helper | The pure-module boundary cannot be asserted blind without mocking/reading the implementation. The handler half is covered by the read-only spy (UD4-B5.1); the "no traversal change" claim is covered indirectly by the 2-function module census (UD4-B12.1) plus the pure-helper scenarios (no store involved). |

## 4. Confirmation

No implementation file was read to derive or explain any expected behavior.
Only `docs/specs/unit-ud4-doc-heads-tree.md`,
`tests/unit-ud4-doc-heads-tree.test.ts` (harness conventions), and this
artifact's own test file were authored/consulted. The `src/` modules were
imported at runtime only. The blind-test writer left the failing scenario
failing and recorded it above; a separate Implementer pass then fixed the
host defect (`src/main/adjacency.ts` `copyNode` `Array.isArray` guard) without
editing this artifact's test file, and the scenario now PASSes (44/44).
