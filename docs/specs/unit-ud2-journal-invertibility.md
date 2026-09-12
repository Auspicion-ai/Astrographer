# Spec — Unit U-D2: Journal Invertibility of Document Metadata (`documentPath` / `tags`)

- **Status:** SPEC (the journal-invertibility fix for the document
  directory/category slice — the SECOND unit of the ratified U-D1…U-D7
  decomposition). Gate references: `docs/decisions.md` row
  **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-AMENDMENTS, RATIFIED
  2026-09-11), `docs/specs/document-directory-category-review.md` §3 **M2** (the
  journal-invertibility must-fix) and §5 (the U-D2 row), and the GATED parent
  spec `docs/specs/document-directory-category.md`. The LANDED predecessor is
  **Unit U-D1** (`docs/specs/unit-ud1-document-metadata-fields.md`) — the
  additive `RagNode.documentPath?`/`tags?` fields, the shared
  `normalizeDocumentPath`/`normalizeTags` helpers, the 11-field `nodeSource`,
  and the `isRagNode` accept branch this unit builds on.
- **Scope:** the `putNodeSync` update CLASSIFICATION in
  `src/main/rag-store.ts` — a metadata-only delta (`documentPath` and/or `tags`)
  must take the FULL structural `node-update` journal branch (whose
  `before`/`after` are full `toPublicNode` snapshots that include the normalized
  metadata), NOT the lightweight `content` branch (whose snapshot omits
  `documentPath`/`tags`, silently losing the metadata on undo). This unit also
  PINS, by regression test, the already-correct inversion paths:
  `applyInverse`/`applyForward`'s `node-update` case (via `setNodeFields`), the
  `applyBatch(putNode)` inverse op, and the boot journal validators
  (`isRagNode` accepts the fields; `isContentSnapshot` is unchanged). It adds
  **NO new op, NO new field, NO validation rule, NO new journal entry kind, and
  NO change to the journal snapshot shape** — it reclassifies the journal entry
  for a metadata delta and proves inversion.
- **DELIBERATE EXCLUSIONS (the ratified decomposition splits these out — this
  unit implements NONE of them):**
  - **U-D3 — import path derivation + the `/`-joined id scheme.**
    `sanitizeSegment`, `dirname`/`relative`/`path.sep`, the minting census, and
    the path-qualified `documentId` are U-D3. This unit does not derive, mint,
    or set the fields.
  - **U-D4 — the doc-heads listing + derived tree + read-surface backfill.**
    `RagDocHeadsPayload.path`/`tags`, `handleRagDocHeadsIpc`, and the tree helper
    (M7/M13) are U-D4.
  - **U-D5 — the MCP read tool `rag.list_documents`.** The tool, its group row,
    and its handler are U-D5.
  - **U-D6 — `rag.query`/`rag-stream` document filters.** `RagQueryFilters`, the
    validators, and the zod schemas (M8) are U-D6.
  - **U-D7 — the tag write op `edit.set_doc_meta`.** The op, its group gating,
    its authorization/validation caps, and the root-restriction of writes
    (M9/M11/Q8) are U-D7. This unit changes the EXISTING `putNode`/`applyBatch`
    journal classification only; it does not add a write surface.
  - **U-D8 / ui-overhaul G2 — the doc-nav tree UI.** Moved to ui-overhaul G2
    (ratified 2026-09-11); NOT part of this slice.
- **TestWriter contract:** every journal-entry kind, before/after shape,
  undo/redo state, hash-restore invariant, and fail-state below is derivable
  from this spec ALONE. The TestWriter writes the red set for the amended
  `src/main/rag-store.ts` (the `putNodeSync` classification condition; the
  regression pins on `applyInverse`/`applyForward`/`applyBatchOp`/
  `isContentSnapshot`/`isRagNode`) from §5.6/§5.7 before any implementation.

---

## 1. What the proposal asks

The document directory/category slice mutates a document's metadata — a
`putNode` changing `documentPath` and/or `tags` (later: the U-D7
`edit.set_doc_meta` op routes through this same `putNode` path). The store's
project journal (Unit A §5.6) must make that mutation **invertible**: `undo()`
restores the prior metadata and `redo()` re-applies it, surviving a
persist → boot → undo cycle. **Pre-U-D2 (the bug this unit fixes):** it was NOT
invertible, because of a classification bug in `putNodeSync`:

- `putNodeSync` (`src/main/rag-store.ts`, the update branch) classified an
  update as the **lightweight `content`** journal entry UNLESS the node `type`
  changed or `ownedNodeIds` changed
  (pre-U-D2: `if (typeChanged || ownedChanged)`, the condition at
  `rag-store.ts:1052`).
- The `content` entry's `before`/`after` snapshot carries ONLY
  `content`/`children`/`props` (`rag-store.ts:1056-1057`). It does NOT carry
  `documentPath`/`tags`.
- Therefore a **metadata-only** change records a `content` entry whose
  undo/redo never touches the metadata → a SILENT metadata loss (the M2
  finding).

This unit pins the ratified fix (M2's recommended shape): a metadata delta
takes the **structural `node-update`** branch, whose `before`/`after` are full
`toPublicNode` snapshots — and those snapshots DO include the normalized
`documentPath`/`tags` (U-D1), so undo/redo restores them. The restore path
(`setNodeFields`) already normalizes and re-hashes, so the restored node is
never quarantined. The batch path and the boot validators are already correct
and are pinned by regression.

## 2. Feasibility verdict

**Feasible — a one-condition reclassification in the already-landed
`src/main/rag-store.ts`, with every inversion path already present.** The store
has the exact machinery this needs:

- **`sameStringArray`** (`rag-store.ts:363-368`) already compares
  `string[] | undefined` element-wise, and U-D1 normalizes both fields, so it
  is the exact comparator for a metadata delta (no new helper).
- **`toPublicNode`** (`rag-store.ts:822-824`) already copies
  `documentPath`/`tags` into the public snapshot (U-D1), so
  `toPublicNode(existing)`/`toPublicNode(rec)` in the structural branch already
  carry the metadata.
- **`applyInverse`/`applyForward`'s `node-update` case**
  (`rag-store.ts:939-944` / `:994-999`) already calls
  `setNodeFields(n, op.before/op.after)`, and `setNodeFields`
  (`rag-store.ts:849-861`) already normalizes `documentPath`/`tags` and
  recomputes `n.hash = nodeHash(n)`. So the restore is metadata-correct and
  re-hashed with NO new code.
- **`applyBatchOp(putNode)`** (`rag-store.ts:1201-1217`) already emits the
  inverse `{ op: 'putNode', node: toPublicNode(existing) }` (`:1212`) — the
  full prior node including metadata.
- **`isRagNode`** (`rag-store.ts:531-546`) already accepts
  `documentPath`/`tags` (U-D1), so a persisted metadata-bearing structural
  `node-update` entry survives boot; **`isContentSnapshot`**
  (`rag-store.ts:519-530`) is unchanged because metadata never enters the
  content snapshot under this design.

No `provident-ssr` engine seam is involved, so no `docs/defects.md` /
`docs/HANDOFF.md` item is expected from this unit. The fix is
**project-specific** (the RAG project journal is host-side). The import/id
scheme (U-D3), the MCP/UI surfaces (U-D4…U-D7, G2), and the tag write op
(U-D7) are later units — NOT this one.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The `putNodeSync` metadata-delta classification | Project-specific (the RAG project journal) | One condition (`\|\| documentPathChanged \|\| tagsChanged`); makes a metadata edit invertible — no silent loss (M2). |
| Structural `node-update` full snapshot carries metadata | Project-specific | Free — `toPublicNode` already copies `documentPath`/`tags` (U-D1); the snapshot covers content too, so a content+metadata edit inverts both. |
| Restore normalization + re-hash (`setNodeFields`) | Project-specific | Free — already normalizes + re-hashes (U-D1); undo/redo cannot self-quarantine. |
| `applyBatch(putNode)` metadata inverse | Project-specific | Free — the inverse is already the full prior `toPublicNode(existing)` (`:1212`); pinned by regression. |
| Boot journal validators | Project-specific | Free — `isRagNode` already accepts the fields (U-D1); `isContentSnapshot` is unchanged. |
| `[]`-vs-`undefined` comparator edge | Project-specific | Unreachable — U-D1 normalizes `[]`→`undefined` before storage, so both `sameStringArray` operands are normalized. Pinned in §5.2. |

No engine gap. **No write op, no import change, no listing change, no filter
change, no new field, no new validation, and no journal-snapshot-shape change
lands in U-D2.**

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — a metadata-only delta MUST take the structural `node-update` branch.**
  The adversarial pass must confirm a `putNode` that changes ONLY `tags` (or
  ONLY `documentPath`) records `kind === 'structural'` + `op.op ===
  'node-update'` — never `kind === 'content'` (the M2 bug).
- **A2 — a NON-delta metadata write MUST NOT spuriously take the structural
  branch.** A `putNode` whose metadata is semantically unchanged (including
  `[' a ','a']` normalizing to `['a']` matching stored `['a']`) takes the
  lightweight `content` branch. No journal-kind inflation.
- **A3 — a content+metadata edit inverts BOTH.** The structural full-node
  snapshot restores the prior `content` AND the prior metadata on undo, and
  re-applies both on redo.
- **A4 — undo/redo of a metadata delta RE-HASHES → no quarantine.** After a
  metadata update + undo (or redo), a fresh store booted from the persisted
  file has the node in `status().loadedNodes`, NOT in `status().quarantined`.
- **A5 — `[]` normalization survives the structural snapshot.** A metadata
  update to `tags: []` stores `after.tags === undefined`; undo restores the
  prior tags; redo returns `tags === undefined`.
- **A6 — the batch path inverts metadata.** A one-op `applyBatch([{op:
  'putNode', ...tags...}])` lands a `batch` entry whose inverse op is the full
  prior node; undo restores the metadata.
- **A7 — the metadata-bearing structural entry survives boot.** A persisted
  `node-update` entry whose `before`/`after` carry `documentPath`/`tags` passes
  `isValidJournalEntry` (`isRagNode` accepts the fields); a fresh store's
  `journal()` still contains it and undo works.
- **A8 — validation is not bypassed by the reclassification.** A malformed
  metadata array still throws/rolls back BEFORE classification; a persisted
  structural entry with malformed metadata is still SKIPPED at boot.
- **A9 — the `sameStringArray` `[]`-vs-`undefined` case is unreachable.**
  Because U-D1 normalizes `[]`→`undefined`, no stored node holds `[]`, so the
  comparator cannot report a false "changed" delta. The adversarial pass must
  confirm a `putNode` with `tags: []` against a stored `tags: undefined` takes
  the `content` branch (no metadata delta after normalization).
- **A10 — the `content` snapshot stays metadata-free.** A content-only edit's
  `content` entry still carries only `content`/`children`/`props`; metadata
  never enters it (the design keeps the snapshot shape unchanged).
- **A11 — the pre-existing `nodeKind` default through the structural snapshot.**
  `toPublicNode` (`rag-store.ts:822-824`) emits `nodeKind: n.nodeKind ?? 'content'`,
  and `setNodeFields` (`:852`) assigns it, so undoing a metadata `node-update`
  on a node stored with `nodeKind: undefined` writes the explicit default
  `'content'`. This is pre-existing structural-branch behavior (a type/owned
  update already does it), and it is UNOBSERVABLE through the public API
  (`getNode` returns `nodeKind: n.nodeKind ?? 'content'` either way) and
  self-consistent (the hash is recomputed from the restored record, so no
  quarantine). The adversarial pass must confirm it introduces no observable
  divergence, no quarantine, and no cross-node effect — and must NOT "fix" it
  in U-D2 (it is out of scope).

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in
`docs/defects.md`/`docs/HANDOFF.md`.

**Adversarial pass (RCA-3, 2026-09-11, post-green):**

- **No in-scope HOST defect found.** All A1–A11 predictions confirmed by
  probe-backed checks; classification, inversion, batch interplay, boot
  validators, hash/quarantine, off-root, and normalization all match §5.
- **F1 (INFO, HOST, pre-existing, OUT OF SCOPE):** a `nodeKind`-only edit still
  takes the `content` branch and is not invertible (present since Unit X; U-D2's
  condition is exactly the four metadata/type/owned deltas). U-D2 strictly
  IMPROVES the combined case (metadata+`nodeKind` now inverts `nodeKind` too).
  Tracked in `docs/defects.md` as **HOST-NODEKIND-JOURNAL-INVERTIBILITY**.
- **F2/F3 (INFO, process):** the trackers/§3a were unadvanced at pass time
  (closed by the RCA-6 doc review) and §5.8 line refs were pre-amendment
  (corrected by this doc-review pass). Closed in the doc-review pass.
- **F4 (INFO, coverage):** extra probe-verified edges not in the 23-test suite
  (`[]`↔absent classification; hand-authored `[]`/untrimmed metadata replay
  normalization — already regression-covered by U-D1's F1 adversarial tests;
  combined `documentPath`+`tags`; `props`/`children`+metadata; batch nesting).
  No defect.

**No PACKAGE (`provident-ssr`) finding; no `docs/HANDOFF.md` entry from this
pass.**

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS** for the document directory/category
proposal (`docs/decisions.md` row **DOC-DIRECTORY-CATEGORY-GATE**, 2026-09-11;
`docs/specs/document-directory-category-review.md`). The amendment THIS unit
resolves:

- **M2 — journal invertibility** (§1/§5.1): a `putNode` changing only
  `tags`/`documentPath` currently takes the `content` branch, whose
  before/after snapshots omit the new fields
  (gate-time refs `rag-store.ts:1005-1014`, `:875-885`) — an undo silently loses
  the tag change. Fix: classify a metadata delta as the structural
  `node-update` branch (full-node snapshot). The gate's alternative ("or extend
  the content snapshot + `applyInverse`") is NOT taken: the structural branch
  already covers content too and needs no snapshot-shape change, so it is the
  least-code shape (and leaves `isContentSnapshot` untouched). The review's
  binding acceptance is "tags-only and content+tags undo/redo tests" (§5.6).

## 4. Design decisions pinned by this spec

- **DOC-DIRECTORY-CATEGORY-GATE (consumed, M2):** the metadata-delta journal
  classification is resolved to the structural `node-update` branch (full-node
  snapshot), not a content-snapshot extension. This unit lands that fix.
- **U-D1 metadata fields (consumed):** `documentPath`/`tags` are additive,
  normalized (`[]`→omitted; tags trimmed/case-sensitive/deduped), hash-covered
  (11-field `nodeSource`), and carried by `toPublicNode`/`insertNode`/
  `setNodeFields`; `isRagNode` accepts them. U-D2 relies on those exact
  properties for the snapshot + restore.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the persistent source of
  truth; the journal records the store mutation, and undo/redo restores the
  store record (and its hash).
- **SINGLE-WRITER-STORE (consumed):** the metadata write routes through the
  existing single-writer `putNode`/`applyBatch` queue; U-D2 adds no new write
  method and no locking change.
- **HASH-VERIFIED-SOURCE (consumed, Unit A §5.7):** the SHA-256 hash is
  re-derived from the record's serialized source at write and re-verified at
  boot. The restore path calls `setNodeFields`, which recomputes the hash, so a
  restored metadata node is self-consistent and never quarantined.
- **BATCH-ATOMICITY-API (consumed):** a metadata `putNode` inside `applyBatch`
  already inverts via the full prior-node inverse op; this unit pins it by
  regression and does not change it.

## 5. The exhaustive contract

### 5.1 The amended `putNodeSync` classification

Only ONE code change lands in this unit: the structural-branch condition in
`putNodeSync` gains two metadata-delta disjuncts.

**The amended `putNodeSync` update branch (pinned):**

```ts
// src/main/rag-store.ts — the amended putNodeSync update branch. ONLY the
// classification condition changes: a metadata delta (documentPath/tags) now
// ALSO triggers the FULL structural node-update entry, whose before/after are
// full toPublicNode snapshots (which include the normalized metadata — U-D1).
function putNodeSync(node: RagNode): RagNode {
  const shape = validateNodeShape(node)               // unchanged — validates/normalizes
  if (!shape.ok) throw new Error(`rag putNode: ${shape.field} required/invalid`)
  const existing = nodes.get(shape.node.id)
  if (existing) {
    // update → preserve createdAt, refresh updatedAt
    const updatedAt = refreshTimestamp(existing.updatedAt)
    const base = { ...shape.node, createdAt: existing.createdAt, updatedAt }
    const rec: StoredNode = { ...base, hash: nodeHash(base) }
    nodes.set(rec.id, rec)
    const at = new Date().toISOString()
    const typeChanged = existing.type !== rec.type
    const ownedChanged = !sameStringArray(existing.ownedNodeIds, rec.ownedNodeIds)
    // U-D2 — metadata deltas are structural too. Both operands are normalized
    // (U-D1: `[]`→undefined, tags trimmed/deduped), so sameStringArray is exact.
    const documentPathChanged = !sameStringArray(existing.documentPath, rec.documentPath)
    const tagsChanged = !sameStringArray(existing.tags, rec.tags)
    if (typeChanged || ownedChanged || documentPathChanged || tagsChanged) {
      // full before/after node → undo restores type/ownedNodeIds AND the
      // metadata (documentPath/tags) AND content/children/props
      pushJournal({ kind: 'structural', op: { op: 'node-update', nodeId: rec.id, before: toPublicNode(existing), after: toPublicNode(rec) }, at })
    } else {
      const before = { content: existing.content, children: existing.children !== undefined ? deepCopy(existing.children) : undefined, props: existing.props !== undefined ? deepCopy(existing.props) : undefined }
      const after = { content: rec.content, children: rec.children !== undefined ? deepCopy(rec.children) : undefined, props: rec.props !== undefined ? deepCopy(rec.props) : undefined }
      pushJournal({ kind: 'content', nodeId: rec.id, before, after, at })
    }
  } else {
    // unchanged — new node → structural node-add entry
  }
  persist()
  return toPublicNode(nodes.get(shape.node.id)!)
}
```

**Classification rules (pinned):**

- **The condition is exactly `typeChanged || ownedChanged || documentPathChanged
  || tagsChanged`.** Any ONE of the four forces the structural `node-update`
  branch.
- **`documentPathChanged`/`tagsChanged` use the existing `sameStringArray`**
  (`rag-store.ts:363-368`) over `existing.<field>` vs `rec.<field>`. No new
  comparator, no new helper.
- **A metadata-only delta takes the structural branch** — the entry is
  `{ kind: 'structural', op: { op: 'node-update', nodeId, before:
  toPublicNode(existing), after: toPublicNode(rec) }, at }`. Its
  `before`/`after` are FULL public nodes, so they carry the normalized
  `documentPath`/`tags` (U-D1 `toPublicNode`, `rag-store.ts:822-824`).
- **A content+metadata delta ALSO takes the structural branch** — the full-node
  snapshot covers `content`/`children`/`props` too, so both invert; the
  `content` branch is NOT taken.
- **A content-only delta (no type/owned/metadata delta) KEEPS the lightweight
  `content` branch** — unchanged behavior; its snapshot stays
  `{ content, children?, props? }` (`rag-store.ts:1056-1057`).
- **A type or `ownedNodeIds` delta keeps its existing structural branch** —
  unchanged behavior.
- **`props` deltas are NOT metadata deltas** — `props` is already in the
  `content` snapshot and already inverts; U-D2 does not reclassify them.
- **A metadata no-op (semantically unchanged, after normalization) does NOT
  force the structural branch** — `sameStringArray` returns true, so the
  `content` branch (or a type/owned branch if those changed) is taken.

### 5.2 The journal-shape rules

- **The metadata-bearing entry KIND is `structural` with `op.op ===
  'node-update'`.** It is NOT a `content` entry and NOT a `batch` entry (a
  batch `putNode` is a `batch` entry — §5.4). This is the observable M2 fix.
- **The `node-update` `before`/`after` are full `RagNode` snapshots** produced
  by `toPublicNode` (`rag-store.ts:822-824`), so they include `id`, `type`,
  `nodeKind`, `content`, `children?`, `documentPath?`, `tags?`, `props?`,
  `ownedNodeIds`, `createdAt`, `updatedAt`.
- **The metadata in the snapshots is the NORMALIZED metadata.** `existing` is a
  previously stored (normalized) record and `rec` is built from the
  `validateNodeShape`-normalized node; `toPublicNode` copies both. So
  `after.tags` is trimmed/deduped and `after.documentPath` is `[]`-free.
- **The `content` snapshot shape is UNCHANGED** — `{ content, children?, props? }`
  only. Metadata never enters it under this design; `isContentSnapshot`
  (`rag-store.ts:519-530`) is unchanged.
- **The `JournalEntry` union and the `StructuralJournalOp` union are
  UNCHANGED** — no new entry kind, no new op member.
- **The `[]`-vs-`undefined` comparator case is unreachable.** `sameStringArray`
  treats `undefined` vs `[]` as changed, but U-D1's `normalizeDocumentPath`/
  `normalizeTags` (`rag-store.ts:411-416`) run before storage, so neither
  `existing.<field>` nor `rec.<field>` can hold `[]`. A caller's `tags: []`
  normalizes to `undefined` and compares EQUAL to a stored `undefined` (A9).

### 5.3 The restore path (`applyInverse`/`applyForward`) — NO new code

The `node-update` inversion is already correct and must NOT be changed.

- **`applyInverse`'s `node-update` case** (`rag-store.ts:939-944`) calls
  `setNodeFields(n, op.before)`; **`applyForward`'s** (`rag-store.ts:994-999`)
  calls `setNodeFields(n, op.after)`.
- **`setNodeFields`** (`rag-store.ts:849-861`) sets `n.type`/`content`/
  `nodeKind`/`children`/`props`/`ownedNodeIds`/`createdAt`, then:
  `n.documentPath = normalizeDocumentPath(src.documentPath)` and
  `n.tags = normalizeTags(src.tags)` (`:854-855`), then
  `n.updatedAt = new Date().toISOString()` and `n.hash = nodeHash(n)` (`:859-860`).
- **Consequence:** undo/redo restores the metadata AND recomputes the hash from
  the restored record's own source, so the stored hash matches the record — no
  quarantine on a later boot (A4). The normalization is idempotent (the
  snapshot's metadata is already normalized — §5.2), so restore cannot drift.
- **Desync guard unchanged:** a `node-update` whose `nodeId` is absent returns
  false (`:940-941`), so `undo()`/`redo()` return `null` and do NOT advance the
  cursor (`rag-store.ts:1368`, `:1381`).
- **Pre-existing `nodeKind` default note (NOT changed):** `toPublicNode` emits
  `nodeKind ?? 'content'` and `setNodeFields` assigns it, so a metadata
  `node-update` restore may materialize the explicit `'content'` default on a
  node that stored `nodeKind: undefined`. It is public-API-unobservable and
  self-consistent (hash recomputed) — see A11. U-D2 does NOT change it.

### 5.4 The batch path (`applyBatch(putNode)`) — verified by regression

The batch path is ALREADY metadata-invertible; this unit pins it with a test
and changes no code.

- **`applyBatchOp`'s `putNode` update** (`rag-store.ts:1201-1217`) returns the
  inverse op `{ op: 'putNode', node: toPublicNode(existing) }` (`:1212`) — the
  FULL prior public node, which includes `documentPath`/`tags` (U-D1).
- **Batch undo** applies the inverse via `applyBatchOpInternal`
  (`rag-store.ts:880-914`) → `validateNodeShape` (normalizes) → `insertNode`
  (normalizes + re-hashes). So a batch metadata write inverts AND re-hashes.
- **Batch redo** re-applies the forward `putNode` (`rag-store.ts:1332-1337`)
  and re-validates/normalizes.
- **A one-op metadata batch lands a `batch` entry** (not a `node-update`),
  because `applyBatch` journals one `batch` entry for the whole batch
  (`rag-store.ts:1338`). This is the expected observable difference from the
  `putNode` path and is pinned.

### 5.5 Boot journal validators + the U-D2 boundary

**Boot journal validators (pinned):**

- **`isRagNode`** (`rag-store.ts:531-546`) already ACCEPTS `documentPath`/
  `tags` (U-D1: `:541-542`). So a persisted structural `node-update` entry
  whose `before`/`after` carry valid metadata passes
  `isValidJournalEntry`/`isValidStructuralOp` (`rag-store.ts:619-637`, `:567-570`)
  and survives boot (A7). It validates shape, it does NOT normalize (the replay
  paths normalize — U-D1 §5.3).
- **`isContentSnapshot`** (`rag-store.ts:519-530`) is UNCHANGED — it accepts
  `{ content, children?, props? }` and has no `documentPath`/`tags` branch
  (metadata never enters the content snapshot).
- **A malformed metadata value in a persisted structural entry** (e.g. a
  non-array `tags`) is REJECTED by `isRagNode` → the whole entry is SKIPPED at
  boot (`file.journal.filter(isValidJournalEntry)`, `rag-store.ts:723-725`).

**Explicit U-D2 boundary (pinned):** NO new op (`edit.set_doc_meta` is U-D7);
NO new field (U-D1); NO validation/normalization change (U-D1); NO
`nodeSource` change (U-D1); NO `isContentSnapshot` change; NO new
`JournalEntry`/`StructuralJournalOp` member; NO import/id-scheme change (U-D3);
NO doc-heads listing/tree (U-D4); NO `rag.list_documents` (U-D5); NO query
filters (U-D6); NO doc-nav tree UI (ui-overhaul G2). The ONLY source change is
the `putNodeSync` classification condition.

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Tags-only update → structural `node-update` (the core M2 fix).** Create a
   node with `tags: ['a']`; `putNode` the same node with `tags: ['a','b']`
   (content/type/owned unchanged). The last journal entry has
   `kind === 'structural'` and `op.op === 'node-update'` (NOT `kind ===
   'content'`); `op.before.tags === ['a']`; `op.after.tags === ['a','b']`.
2. **documentPath-only update → structural `node-update`.** Create a node with
   `documentPath: ['x']`; `putNode` with `documentPath: ['x','y']` →
   `kind === 'structural'`, `op.op === 'node-update'`, `before.documentPath ===
   ['x']`, `after.documentPath === ['x','y']`.
3. **Undo/redo of a tags-only update.** Continue state 1: `undo()` →
   `getNode(id)!.tags === ['a']`; `redo()` → `getNode(id)!.tags === ['a','b']`.
4. **Undo/redo of a documentPath-only update.** Continue state 2: `undo()` →
   `getNode(id)!.documentPath === ['x']`; `redo()` →
   `getNode(id)!.documentPath === ['x','y']`.
5. **Content+metadata update inverts BOTH.** Create a node with
   `content: 'one'`, `tags: ['a']`; `putNode` with `content: 'two'`,
   `tags: ['b']` → `kind === 'structural'` + `node-update`; `undo()` restores
   `content === 'one'` AND `tags === ['a']`; `redo()` restores `content ===
   'two'` AND `tags === ['b']`.
6. **Content-only update still takes the `content` branch.** Create a node with
   `content: 'one'`, `tags: ['a']`; `putNode` with `content: 'two'` (same
   `tags`) → the last entry has `kind === 'content'` (metadata unchanged);
   `undo()` restores `content === 'one'` and `tags` remains `['a']`.
7. **Type-only and owned-only updates still take the structural branch
   (regression).** A `putNode` changing only `type` (or only `ownedNodeIds`)
   still records `kind === 'structural'` + `node-update` (unchanged behavior).
8. **`applyBatch(putNode)` metadata inversion (verified by regression).** Create
   a node with `tags: ['a']`; `applyBatch([{ op: 'putNode', node: { ...node,
   tags: ['b'] } }])` → the last entry has `kind === 'batch'`; `undo()` →
   `getNode(id)!.tags === ['a']`; `redo()` → `['b']`.
9. **Restore re-hash / no quarantine.** After a metadata update + `undo()` (and
   separately after `redo()`), persist and boot a fresh store from the file →
   `status().corrupt === false`, `id` in `status().loadedNodes`, `id` NOT in
   `status().quarantined`; `getNode(id)` returns the restored metadata.
10. **`[]` normalization through the structural snapshot.** Create a node with
    `tags: ['a']`; `putNode` with `tags: []` → `kind === 'structural'`,
    `after.tags === undefined`; `undo()` → `tags === ['a']`; `redo()` →
    `tags === undefined`.
11. **The metadata-bearing structural entry survives boot.** After a metadata
    update, boot a fresh store from the file → its `journal()` still includes
    the `node-update` entry (the `isRagNode` accept branch); calling `undo()`
    on the fresh store restores the metadata.
12. **Snapshots carry NORMALIZED metadata.** Create with `tags: ['a']`; update
    with `tags: [' b ', 'a', 'b']` → `op.after.tags === ['b','a']` (trimmed,
    deduped, first-occurrence order) and `op.before.tags === ['a']`.
13. **Metadata no-op does NOT force the structural branch.** Create with
    `tags: ['a']`; `putNode` with `content` changed and `tags: [' a ','a']`
    (normalizes to `['a']`, equal to stored) → the last entry has `kind ===
    'content'` (no metadata delta after normalization).
14. **Off-root metadata inverts identically.** A non-root node carrying
    `documentPath`/`tags` (U-D1 §5.5) takes the same structural branch on a
    metadata delta and inverts (the store has no root notion).
15. **`JournalEntry`/`StructuralJournalOp` unions and the `content` snapshot
    shape are unchanged** — a metadata entry is a plain `structural`
    `node-update`; a content-only entry still carries only
    `content`/`children`/`props`.

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **Malformed metadata write is rejected BEFORE classification.** A `putNode`
   with a non-array `tags` (or a non-string/empty member, or a malformed
   `documentPath`) throws `Error('rag putNode: tags|documentPath
   required/invalid')`; the journal length is UNCHANGED (no entry); the store is
   unchanged. (The reclassification cannot bypass U-D1 validation.)
2. **Malformed metadata in a batch op rolls back.** `applyBatch([{ op:
   'putNode', node: { ...node, tags: 'x' } }])` → `{ ok: false, error: 'rag
   applyBatch: tags required/invalid at index 0', failedIndex: 0 }`; the journal
   is not polluted; the store is rolled back.
3. **Undo desync for a metadata `node-update`.** A persisted structural
   `node-update` entry whose `nodeId` references a node absent from the store
   file (out-of-band removal) → `undo()` returns `null` and does NOT advance the
   cursor (no throw).
4. **Boot-skipped malformed structural entry.** A persisted structural
   `node-update` entry whose `after.tags` is a non-array → `isValidJournalEntry`
   (`isRagNode`) rejects it → the entry is SKIPPED at boot (not present in
   `journal()`).
5. **A tampered metadata field on a PERSISTED node is quarantined.** A store
   file whose node has `tags` changed without a matching hash update → the node
   is in `status().quarantined` (the U-D1 hash-verified-source discipline;
   proves the restore path is not a tamper path). `undo()`/`redo()` themselves
   never produce this state (state 9).
6. **The `content` branch cannot record metadata.** A content-only update's
   entry snapshot has NO `documentPath`/`tags` keys; `isContentSnapshot`
   accepts it unchanged. (Pins that the fix is the classification, not a
   snapshot-shape change.)

### 5.8 Census / numeric claims

- **Source files touched:** 1 — `src/main/rag-store.ts` (the `putNodeSync`
  classification condition ONLY). **No other `src/` file changes.**
- **Methods amended:** 1 — `putNodeSync` (the condition at
  `src/main/rag-store.ts:1052`).
- **New methods / functions / types / fields / runtime sets:** 0.
- **New journal entry kinds:** 0 — the fix reuses the existing `structural`
  entry with the existing `node-update` op.
- **New `JournalEntry` union members:** 0 (3 total: `content`/`structural`/
  `batch`).
- **New `StructuralJournalOp` members:** 0 (8 total).
- **Journal classification for a metadata delta:** `content` (the bug) →
  `structural`/`node-update` (the fix). This is the single observable changed
  behavior.
- **`content` snapshot shape:** UNCHANGED — `{ content, children?, props? }`.
- **`nodeSource` field count:** 11 — UNCHANGED (U-D1).
- **`isContentSnapshot`:** UNCHANGED.
- **`isRagNode`:** UNCHANGED (accepts `documentPath`/`tags` — U-D1).
- **`applyInverse`/`applyForward`/`setNodeFields`:** UNCHANGED.
- **`applyBatch`/`applyBatchOp`/`applyBatchOpInternal`:** UNCHANGED.
- **New tests:** 23 — §5.6 states 1–15 (state 9 realized as 9a/9b) + 1
  integration scenario + §5.7 fail-states 1–6
  (`tests/unit-ud2-journal-invertibility.test.ts`; red 11 failing → green
  23/23).
- **Post-U-D1 line refs (the amendment sites):**
  `sameStringArray` `:363-368`; `normalizeDocumentPath`/`normalizeTags`
  `:411-416`; `isContentSnapshot` `:519-530`; `isRagNode` `:531-546`;
  `toPublicNode` `:822-824`; `insertNode` `:832-836`; `setNodeFields`
  `:849-861`; `applyBatchOpInternal` `:880-914`; `applyInverse` `:918-971`
  (`node-update` `:939-944`); `applyForward` `:973-1026` (`node-update`
  `:994-999`); `putNodeSync` `:1037-1068` (classification `:1047-1059`,
  condition `:1052`); `applyBatchOp(putNode)` `:1201-1217` (inverse `:1212`);
  `applyBatchSync` `:1272-1341` (batch journal `:1338`). (The gate-time review
  §5 U-D2 refs — `putNodeSync` `:1005-1014`, `applyInverse` `:875-885` — are the
  PRE-U-D1 build state.)

### 5.9 Cross-references

- **Gate:** `docs/specs/document-directory-category-review.md` §3 M2 (the
  journal-invertibility must-fix) + §5 (the U-D2 row, the sequencing
  U-D1 → U-D2 → U-D3…) and `docs/decisions.md` row
  **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-AMENDMENTS, RATIFIED
  2026-09-11).
- **Parent (GATED):** `docs/specs/document-directory-category.md` (§3 the
  additive model; §7 the U-D2 journal unit).
- **Predecessor (LANDED):** `docs/specs/unit-ud1-document-metadata-fields.md`
  §5.1 (the `documentPath`/`tags` fields), §5.2 (the 11-field `nodeSource`), §5.3
  (the copy paths + `isRagNode`), §5.4 (validation/normalization the restore
  path reuses), §5.5 (off-root handling), §3a F4 (the INFO finding that
  metadata-only edits are not journal-invertible — the defect this unit fixes).
- **Journal contract:** `docs/specs/unit-a-rag-store.md` §5.6 (the project
  journal — the `content`/`structural` entries and the inversion rules this unit
  satisfies).
- **Precedent:** `docs/specs/unit-m-children-field.md` §5.5 (the `content`
  content-snapshot extension — the alternative shape NOT taken by U-D2),
  §5.6/§5.7 (the happy/fail-state format).
- **Decisions:** `docs/decisions.md` rows **DOC-DIRECTORY-CATEGORY-GATE**,
  **CHILDREN-ADDITIVE-STORE-FORMAT**, **CHILDREN-HASH-SOURCE**,
  **RAG-AUTHORITATIVE**, **SINGLE-WRITER-STORE**, **BATCH-ATOMICITY-API**.
- **Downstream units (NOT this spec):** U-D3 (import path + id scheme), U-D4
  (doc-heads listing/tree), U-D5 (`rag.list_documents`), U-D6 (query filters),
  U-D7 (`edit.set_doc_meta` — the write surface whose metadata writes this
  unit makes invertible), and ui-overhaul G2 (doc-nav tree UI).
- **Host patterns:** `src/main/rag-store.ts` (the `putNodeSync` classification,
  `sameStringArray`, `toPublicNode`, `setNodeFields`, `applyInverse`/
  `applyForward`, `applyBatchOp`, `isContentSnapshot`/`isRagNode` — the
  amendment + regression-pin sites).
