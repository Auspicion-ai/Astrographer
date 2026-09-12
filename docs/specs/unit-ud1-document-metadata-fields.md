# Spec — Unit U-D1: Document Metadata Fields (`documentPath` / `tags`) on `RagNode`

- **Status:** SPEC (the store-model foundation for the document
  directory/category slice — the FIRST unit of the ratified U-D1…U-D7
  decomposition). Gate references: `docs/decisions.md` row
  **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-AMENDMENTS, RATIFIED
  2026-09-11), `docs/specs/document-directory-category-review.md` (M1–M16,
  Q1–Q9), and `docs/specs/document-directory-category.md` (the GATED parent
  spec). This unit is the review's **U-D1** row: the additive store model +
  hash coverage + additive load/round-trip. It does NOT implement any other
  slice unit (see the exclusions below).
- **Scope:** the additive `documentPath?: string[]` + `tags?: string[]` fields
  on the `RagNode` interface in `src/main/rag-store.ts`, the `nodeSource`
  hash-source coverage of both fields (fixed field order), the store-format
  additive load (existing records without the fields still load and
  hash-verify byte-identically), the write-time shape validation +
  normalization of both fields, and deep-copy of both fields through every
  internal copy path.
- **DELIBERATE EXCLUSIONS (the ratified decomposition splits these out — this
  unit implements NONE of them):**
  - **U-D2 — the journal content-entry snapshot / undo-redo inversion.** The
    `JournalEntry` `content` before/after snapshot extension, `isContentSnapshot`
    acceptance, `applyInverse`/`applyForward` restore, and the
    `putNodeSync` metadata-delta classification (M2) are U-D2. This unit does
    NOT touch the journal content snapshot. **Caveat:** `isRagNode` (the
    structural-op journal validator) IS updated here, because it is a node
    shape validator (M3) and a structural `node-add`/`node-update` entry
    carrying a node with the new fields must not be skipped at boot.
  - **U-D3 — import path derivation + the `/`-joined id scheme.**
    `sanitizeSegment`, `dirname`/`relative`/`path.sep`, the minting census, and
    the path-qualified `documentId` are U-D3. This unit does NOT derive, mint,
    or set the fields; it only persists what it is given.
  - **U-D4 — the doc-heads listing + derived tree + read-surface backfill.**
    `RagDocHeadsPayload.path`/`tags`, `handleRagDocHeadsIpc`, the pure
    prefix-grouping tree helper, and the display-only backfill (M7/M13) are
    U-D4.
  - **U-D5 — the MCP read tool `rag.list_documents`.** The tool, its group
    row, and its handler are U-D5.
  - **U-D6 — `rag.query`/`rag-stream` document filters.** `RagQueryFilters`
    extension, the validators, and the zod schemas (M8) are U-D6.
  - **U-D7 — the tag write op `edit.set_doc_meta`.** The op, its group gating,
    its authorization/validation caps, and the root-restriction of writes
    (M9/M11/M23) are U-D7. This unit's store validates/hashes the fields on ANY
    node; restricting writes to document roots is the U-D7 write surface's job.
  - **U-D8 / ui-overhaul G2 — the doc-nav tree UI.** Moved to ui-overhaul G2
    (ratified 2026-09-11); NOT part of this slice.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, normalization rule, happy-path state, and fail-state below is
  derivable from this spec ALONE. The TestWriter writes the red set for the
  amended `src/main/rag-store.ts` (the `RagNode` interface + `nodeSource` +
  `validateNodeShape` + `isRagNode` + the internal copy paths) and
  `src/main/adjacency.ts` (`copyNode`) from §5.6/§5.7 before any
  implementation.

---

## 1. What the proposal asks

The document directory/category slice (U-D1…U-D7) needs a place to hold a
document's **corpus-relative directory** and its **cross-cutting categories**,
WITHOUT creating new RAG node/edge kinds or a second persisted store section.
The resolved design pins two NEW optional fields on the **document root**
`RagNode`. This unit lands them as an ADDITIVE, backward-compatible
persistence-layer change:

1. **Two new optional fields on `RagNode`** — `documentPath?: string[]`
   (corpus-relative **directory** segments only; no basename; absent = a
   root-level document, the v1 default) and `tags?: string[]` (multi-valued
   categories; absent = untagged, the v1 default). Both are ADDITIVE —
   existing nodes without them still load and hash-verify.
2. **`nodeSource` includes both fields** in the fixed field order (after
   `children`, before `props`), so the SHA-256 hash covers them. A change to
   either field yields a new hash.
3. **The JSON store format is additive**: existing records without the fields
   load unchanged and hash **byte-identically** to today; a record with the
   fields round-trips (write → persist → boot → read).
4. **`[]`→OMITTED normalization**: an empty `documentPath` or empty `tags`
   normalizes to `undefined` BEFORE hashing/storage, so a stored `[]` never
   diverges from absent. This deliberately differs from the `children`
   precedent, which KEEPS `[]`.
5. **`tags` are trimmed, case-SENSITIVE, and DEDUPED** (first-occurrence order
   preserved). `documentPath` segments must be non-empty strings (no trimming,
   no dedupe).
6. **Write-time shape validation** accepts valid arrays and rejects malformed
   ones (non-array / non-string member / empty member); the same validation
   runs at boot (malformed → SKIPPED). A tampered-but-shape-valid record
   (hash mismatch) is QUARANTINED.
7. **Deep-copy on BOTH write and read** through every internal copy path, so a
   caller cannot mutate the store through a returned record and
   `getNode(...)` → `putNode({...node})` preserves the fields (the M3 data-loss
   guard).
8. **Off-root nodes** — the store validates/hashes the fields on ANY node (it
   has no notion of a document root); they are semantically meaningful only on
   a document root, and the write surface (U-D7) restricts writes to roots.
   Pinned as "stored/hashed but ignored off-root" (M23).

## 2. Feasibility verdict

**Feasible — a purely additive, backward-compatible change to the already-landed
`src/main/rag-store.ts`.** The store already has the exact machinery this needs:

- **The `RagNode` interface** (§5.1) already carries optional `nodeKind?`/
  `children?`/`props?` fields with the same deep-copy + validation discipline.
  `documentPath`/`tags` follow the same pattern (optional, deep-copied on
  write/read).
- **`nodeSource`** (§5.2) already serializes a fixed field order for hash
  reproducibility. Adding the two fields to that order is a one-line change;
  the boot re-verification (`load`) already re-derives the hash from
  `nodeSource`, so a node whose fields changed (or whose stored hash was
  computed without them) is automatically quarantined on mismatch.
- **`validateNodeShape`** (§5.4) already returns `{ ok: false, field }` for
  malformed records and is used at BOTH write time (throw) and boot (skip). Two
  validation branches slot into the same function, and the returned node is
  where normalization + copying already happens (mirroring `ownedNodeIds`
  dedupe).
- **The additive load** is free: both fields are optional, so a record without
  them passes validation unchanged and **hashes byte-identically** (M2 — the
  `CHILDREN-ADDITIVE-STORE-FORMAT` / `CHILDREN-HASH-SOURCE` precedent).

No `provident-ssr` engine seam is involved, so no `docs/defects.md` /
`docs/HANDOFF.md` item is expected from this unit. The directory/category
feature is **project-specific** (the RAG data model is host-side, per
ENGINE-GAP-HANDOFF). The import/id scheme (U-D3), the journal inversion (U-D2),
and the MCP/UI surfaces (U-D4…U-D7, G2) are LATER units — NOT this one.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `documentPath?: string[]` on `RagNode` | Project-specific (the RAG data model) | Low cost; the persistence home for a document's corpus-relative directory (directory segments only; absent = root). |
| `tags?: string[]` on `RagNode` | Project-specific | Low cost; multi-valued cross-cutting categories (absent = untagged). |
| `nodeSource` coverage of both fields (fixed field order) | Project-specific | Low cost; the SHA-256 hash covers both fields (a metadata change → a new hash), byte-identical for records without them. |
| Store-format additive load (existing records without the fields still load) | Project-specific | Low cost; backward compatibility — no migration, no re-hash. |
| `[]`→omitted normalization | Project-specific | Low cost; a stored `[]` cannot diverge from absent. Deliberately different from `children` (which keeps `[]`). |
| `tags` trim + case-sensitive dedupe; `documentPath` non-empty segments | Project-specific | Low cost; deterministic canonical storage. |
| Write-time shape validation (throw) + boot skip/quarantine | Project-specific | Low cost; a malformed array is rejected at write and skipped at boot; a tamper is quarantined. |
| Deep-copy through every copy path (`toPublicNode`/`insertNode`/`setNodeFields`/`validateNodeShape`/`adjacency.copyNode`) | Project-specific | Low cost; no aliasing, and the M3 `getNode`→`putNode` data-loss guard. |

No engine gap. The journal invertibility (U-D2), import path derivation +
`/`-joined id scheme (U-D3), doc-heads listing/tree (U-D4), MCP read tool
(U-D5), query filters (U-D6), the `edit.set_doc_meta` write op (U-D7), and the
doc-nav tree UI (ui-overhaul G2) are LATER units — NOT this unit. **No write
op, no import change, no listing change, no filter change, and no journal
content-snapshot change lands in U-D1.**

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — a node whose `documentPath`/`tags` changed but whose stored hash was
  NOT recomputed is QUARANTINED at boot** (the hash-verified source discipline
  — §5.2/§5.7). The adversarial pass must confirm a tampered field (changed
  without a hash update) lands in `status().quarantined`, exactly like a
  tampered `content`/`children`/`props`.
- **A2 — a malformed `documentPath`/`tags` array is REJECTED at write time
  (throw) and SKIPPED at boot (never loaded)** — the same discipline as every
  other node field (§5.4). The adversarial pass must confirm a persisted node
  with a malformed array does NOT load (distinct from a shape-valid tamper,
  which is quarantined).
- **A3 — the fields are deep-copied on BOTH write and read** (no aliasing; a
  caller cannot mutate the store through a returned record) — the same
  discipline as `children`/`props` (§5.1/§5.3). The adversarial pass must
  confirm mutating a returned node's `documentPath`/`tags` does not change the
  store, and mutating the array passed to `putNode` afterward does not change
  the store either.
- **A4 — `[]` normalizes to `undefined` BEFORE hashing** (§5.4). The adversarial
  pass must confirm `documentPath: []` and an absent `documentPath` produce the
  SAME hash and both read back as absent (and the same for `tags`) — and that
  this does NOT apply to `children` (which keeps `[]`, the precedent).
- **A5 — `tags` dedupe is order-preserving and case-sensitive; `documentPath`
  does NOT dedupe** (§5.4). The adversarial pass must confirm
  `['b',' b ','a','b','A']` stores as `['b','a','A']` and `['a','a']` stores as
  `['a','a']`.
- **A6 — off-root fields are stored/hashed but semantically ignored** (§5.5/
  §5.4). The adversarial pass must confirm a non-root node carrying the fields
  validates, stores, rounds-trips, and is NOT rejected or stripped (the store
  has no root notion; restriction is U-D7's write surface).
- **A7 — the M3 data-loss guard.** The adversarial pass must confirm
  `putNode({ ...getNode(id)! })` preserves `documentPath`/`tags` (no silent
  erasure via a strip-and-rewrite).

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`
(the two DEFERRED pre-existing findings below ARE tracked there as host defects).

**Adversarial pass (RCA-3, 2026-09-11, post-green):**

- **F1 (MEDIUM, HOST — FIXED + regression-tested):** the structural-journal
  REPLAY path (`insertNode`/`setNodeFields` in `src/main/rag-store.ts`) copied
  `documentPath`/`tags` but did NOT NORMALIZE them. A persisted/tampered
  structural `node-add`/`node-update` journal entry carrying
  `documentPath: []` or untrimmed/duplicated `tags` stored (and hashed) the raw
  value, so the next boot's `validateNodeShape` normalized differently and the
  record self-QUARANTINED — violating "a stored `[]` cannot diverge from
  absent" (§5.1/§5.2/§5.4/A4). The `applyBatch` replay path was already safe
  (it re-validates); only the structural path was exposed. FIX: a shared
  `normalizeDocumentPath`/`normalizeTags` helper now backs BOTH
  `validateNodeShape` and the replay paths (`insertNode`/`setNodeFields`), so
  the replay normalizes BEFORE hashing/storing. Regression:
  `tests/unit-ud1-document-metadata-fields-adversarial.test.ts` (4 tests: the
  `node-add`/`node-update` replay each read back normalized, and a fresh boot
  after the persisted replay has ZERO quarantines).

- **F2 (LOW, HOST — pre-existing, DEFERRED):**
  `adjacency.copyNode` (`src/main/adjacency.ts:44-46`) drops `nodeKind` (not a
  U-D1 field — the `rag-store.ts` `toPublicNode` includes it), so a
  `createSnapshotStore` node view diverges from the JSON store for a
  `nodeKind`-bearing record. U-D1 correctly added `documentPath`/`tags` there;
  the pre-existing `nodeKind` omission is out of scope. Tracked in
  `docs/defects.md` as **HOST-SNAPSHOT-COPY-NODEKIND**.
- **F3 (LOW, HOST — pre-existing, DEFERRED):** `isValidChildren`
  (`rag-store.ts:506-518`) applies the dangerous-key guard to a child's `props`
  but not the child ITSELF, whereas `validateNodeShape` F4 does. Impact is
  contained (`insertNode`→`deepCopy` strips dangerous keys, so no pollution
  reaches the store). Pre-existing, not U-D1. Tracked in `docs/defects.md` as
  **HOST-JOURNAL-CHILD-DANGEROUS-KEY**.
- **F4 (INFO — U-D2):** metadata-only edits are not journal-invertible (the
  §5.5 U-D2 exclusion). Verified not an U-D1 regression (undo recomputes the
  hash → no quarantine).
- **F5 (INFO — spec-compliant):** `documentPath: ['  ']` is accepted (segments
  are not trimmed) while `tags: ['  ']` is rejected (trimmed-empty); segment
  sanitization (`/`, `\`, `:`, `.`, `..`) is U-D3's job. No action.

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
returned **PROCEED-WITH-AMENDMENTS** for the document directory/category
proposal (`docs/decisions.md` row **DOC-DIRECTORY-CATEGORY-GATE**,
2026-09-11; `docs/specs/document-directory-category-review.md`). The
amendments THIS unit pins (each cross-referenced to the section that resolves
it):

- **M3 — complete the additive touch-point set** (§5.1–§5.4/§5.3): thread both
  fields through `RagNode`, `nodeSource`, `validateNodeShape`,
  `toPublicNode`, `insertNode`, `setNodeFields`, `isRagNode`, the boot
  load/re-verify, and `adjacency.copyNode`. Without this, `getNode` strips the
  fields and a later `putNode({...node})` edit **erases** them (data loss), and
  a record that HAS them is quarantined at boot.
- **M2 — journal invertibility** is **U-D2, NOT this unit** (§5.5). The
  structural journal validator `isRagNode` is the ONLY journal seam updated
  here, because it is node shape validation.
- **Q2/Q7 — root-node additive fields; `[]`→omitted; tags
  case-sensitive/trimmed/deduped** (§5.1/§5.4).
- **M23 — off-root handling** (§5.5): stored/hashed but ignored off-root.

## 4. Design decisions pinned by this spec

- **DOC-DIRECTORY-CATEGORY-GATE (consumed):** additive optional root-node
  `RagNode.documentPath`/`tags` (mirrors `children`, hash-neutral, `[]`→omitted)
  with a derived prefix tree (no new node/edge kinds, no persisted `documents:`
  section). Q1 path-qualified ids, Q3 single path + multi tags, Q7 tags
  case-sensitive/trimmed/deduped, and the U-D1…U-D7 decomposition are gate
  outcomes; only the store model lands here.
- **CHILDREN-ADDITIVE-STORE-FORMAT (precedent, consumed):** an optional node
  field is ADDITIVE — existing records without it load and hash-verify; no
  migration/re-hash. `documentPath`/`tags` follow it, with the ONE deliberate
  divergence that `[]` normalizes to `undefined` rather than being kept.
- **CHILDREN-HASH-SOURCE (precedent, consumed):** `nodeSource` serializes a
  fixed field order so boot re-verification reproduces the exact source string;
  a tampered field is QUARANTINED. The new fields are inserted immediately
  after `children`, before `props`.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the persistent source of
  truth. `documentPath`/`tags` are persisted on the RAG node; the provident
  graph is a transient render materialization.
- **SINGLE-WRITER-STORE (consumed):** a metadata change is a node write routed
  through the single-writer queue (via `putNode`/`applyBatch`), like any other
  node write. This unit adds no new write method.

## 5. The exhaustive contract

### 5.1 The `documentPath` / `tags` fields

The `RagNode` interface in `src/main/rag-store.ts` gains TWO NEW optional
fields. The `RagNodeType` union is UNCHANGED (no new node type).

**The amended `RagNode` interface (pinned):**

```ts
// src/main/rag-store.ts — the amended RagNode. `documentPath` and `tags` are
// NEW and OPTIONAL (ADDITIVE — existing nodes without them still load and
// hash-verify byte-identically).
export interface RagNode {
  id: string
  type: RagNodeType
  nodeKind?: RagNodeKind
  content: string
  children?: RagNodeChild[]
  /** NEW (U-D1) — the corpus-relative DIRECTORY segments of a DOCUMENT ROOT
   *  node (no basename). OPTIONAL/ADDITIVE: absent = a root-level document
   *  (the v1 default). `[]` is NOT stored — it normalizes to absent (§5.4).
   *  Meaningful only on a document root (id === documentId); the store
   *  validates/hashes it on ANY node but ignores it off-root (§5.5). */
  documentPath?: string[]
  /** NEW (U-D1) — multi-valued categories on a DOCUMENT ROOT node.
   *  OPTIONAL/ADDITIVE: absent = untagged (the v1 default). `[]` is NOT
   *  stored — it normalizes to absent (§5.4). Entries are trimmed,
   *  case-SENSITIVE, and DEDUPED (first-occurrence order) (§5.4). */
  tags?: string[]
  props?: Record<string, unknown>
  ownedNodeIds: string[]
  createdAt: string
  updatedAt: string
}
```

**Field rules (pinned):**

- **`documentPath` is OPTIONAL** on `RagNode`. Absent = a root-level document
  (the v1 default).
- **`documentPath` is an ARRAY of non-empty strings** when present. It holds
  **directory segments only** — the basename is NOT a member (M1). Segments are
  NOT trimmed and are NOT deduped (parity with an ordered path).
- **`tags` is OPTIONAL** on `RagNode`. Absent = untagged (the v1 default).
- **`tags` is an ARRAY of non-empty strings** when present. Entries are
  **trimmed before storage**, **case-SENSITIVE** (`'A'` ≠ `'a'`), and
  **DEDUPED** on the trimmed value with **first-occurrence order preserved**.
- **An empty array (`[]`), for EITHER field, normalizes to `undefined`
  BEFORE hashing/storage** (§5.4) — deliberately different from `children`,
  which keeps `[]` (the Unit M precedent). A stored `[]` therefore cannot
  diverge from absent.
- **Both fields are deep-copied on BOTH write and read** (the same discipline
  as `children`/`props` — §5.3): the store stores a copy and returns a copy, so
  a caller cannot mutate the store through a returned record.
- **Both fields are NEW exported-field members of `RagNode` but introduce NO
  new exported type and NO new runtime set** (they are plain `string[]`) — §5.8.

### 5.2 Hash-source (`nodeSource`/`nodeHash`)

`nodeSource` must include `documentPath` then `tags` in the fixed field order,
so the SHA-256 hash covers both. A change to either field yields a new hash.

**The amended `nodeSource` (pinned):**

```ts
// src/main/rag-store.ts — the amended nodeSource. `documentPath` and `tags`
// are added to the fixed field order (after `children`, before `props`).
// The field order is FIXED so boot re-verification reproduces the exact
// source string.
function nodeSource(n: RagNode): string {
  return JSON.stringify({
    id: n.id, type: n.type, content: n.content,
    nodeKind: n.nodeKind,
    children: n.children,
    documentPath: n.documentPath,
    tags: n.tags,
    props: n.props, ownedNodeIds: n.ownedNodeIds,
    createdAt: n.createdAt, updatedAt: n.updatedAt,
  })
}
function nodeHash(n: RagNode): string { return sha256(nodeSource(n)) }
```

> **RCA-10 conflict note — RESOLVED (Architect, 2026-09-11):** the delegated
> task brief enumerated the amended order WITHOUT `nodeKind`; the drafter
> correctly refused to follow it. The ACTUAL code at
> `src/main/rag-store.ts:373-383` serializes `nodeKind` (between `content` and
> `children`), and the GATED parent spec
> `docs/specs/document-directory-category.md` §1 documents the same:
> `id, type, content, nodeKind, children, props, ownedNodeIds, createdAt,
> updatedAt`. Dropping `nodeKind` would change the hash of every existing
> record that carries it and quarantine it at boot — directly violating this
> unit's hard "hash-neutral for existing records" requirement. The pinned
> order therefore KEEPS `nodeKind` and inserts `documentPath`/`tags` after
> `children`, before `props`. **CONFIRMED**: keep `nodeKind`; the census is
> 9 → 11. (The review M3 was corrected in the same pass.)

**Hash-source rules (pinned):**

- **The fixed order is `id, type, content, nodeKind, children, documentPath,
  tags, props, ownedNodeIds, createdAt, updatedAt`** (11 fields — §5.8). The
  order is pinned so boot re-verification (`load`) reproduces the exact source
  string and re-derives the same hash.
- **A change to `documentPath` or `tags` yields a new hash** — `nodeSource`
  includes both, so a metadata edit (via `putNode`/`applyBatch`) recomputes the
  hash.
- **A node WITHOUT the fields hashes byte-identically to today** —
  `JSON.stringify` omits an `undefined` field, so a record with no
  `documentPath`/`tags` produces the SAME source string as the pre-U-D1 format.
  This is the ADDITIVE guarantee: an existing persisted record re-derives the
  SAME hash at boot and is NOT quarantined.
- **A node whose field was tampered (changed without a hash update) is
  QUARANTINED at boot** — the boot re-verification (`load`) re-derives the hash
  from `nodeSource`; a mismatch marks the record quarantined and excludes it
  from `status().loadedNodes` (A1).
- **`[]` is normalized away before `nodeSource` is ever called** — because
  `putNodeSync`/`applyBatchOp` hash the `validateNodeShape`-returned node
  (§5.4), a stored `documentPath: []`/`tags: []` is impossible; an
  absent field and an originally-`[]` field hash identically (A4).

### 5.3 Store-format additive (load + round-trip + copy paths)

The JSON store format is ADDITIVE: existing records without the fields still
load and hash-verify; a record with the fields round-trips.

**Additive-load rules (pinned):**

- **An existing persisted record WITHOUT the fields loads unchanged.** Both
  fields are optional; `validateNodeShape` accepts a record without them, and
  `nodeSource` re-derives the SAME hash as the pre-U-D1 format. No migration,
  no re-hash, no quarantine of existing records.
- **A record WITH the fields round-trips:** `putNode` stores them
  (normalized + deep-copied) → `persist()` writes them to the file → a fresh
  store boots from the file → `load` re-verifies the hash (which now covers
  both fields) → `getNode` returns them (deep-copied). The arrays survive the
  write → persist → boot → read cycle with a matching hash.
- **A record whose field was tampered (changed without a hash update) is
  QUARANTINED at boot** — the hash-verified source discipline (§5.2/§5.7).

**The internal copy paths (pinned):** every path that copies a node's mutable
fields must copy `documentPath`/`tags` with the same discipline as
`children`/`props` (`[...arr]` — a string-array spread is a full copy). The
M3 touch-point set:

- `validateNodeShape` (the normalize + copy site) — normalizes `[]`→`undefined`,
  trims/dedupes `tags`, and copies both arrays (§5.4).
- `toPublicNode` (the read path) — copies both arrays, preserving `undefined`.
  **U-D3 refinement (RCA-10 C1, authorized 2026-09-11):** `toPublicNode` (and
  `adjacency.copyNode`) now OMIT `documentPath`/`tags` when undefined (a
  conditional spread) so an absent field has no own property —
  absent-means-absent. Hash behavior is UNCHANGED (hashes derive from
  `nodeSource`/the stored record, not the public copy).
- `insertNode` (the undo/redo re-insert path) — **normalizes** (`[]`→
  `undefined`, `tags` trim + dedupe) AND copies both arrays. The replay path
  MUST normalize, not merely copy: a persisted structural entry carrying `[]`/
  untrimmed tags would otherwise store/hash the raw value and self-quarantine
  on the next boot (adversarial F1 — §3a).
- `setNodeFields` (the node-update path) — **normalizes + copies** (same F1
  invariant as `insertNode`).
- `adjacency.copyNode` (`src/main/adjacency.ts:44-46`, the snapshot-store copy
  path) — copies both arrays.
- The boot load/re-verify (`rag-store.ts:686-700`) — rides on
  `validateNodeShape` + `nodeHash`; no separate copy code.

**`isRagNode` (the structural-op journal validator) is updated in this unit**
(per M3) to ACCEPT the fields: a `node-add`/`node-delete`/`node-update` journal
entry carrying a node with valid `documentPath`/`tags` is accepted at boot; a
node with a malformed array is rejected (the entry is skipped). It does NOT
deep-copy (it is a boolean validator); it is the shape gate. The journal
**content-entry snapshot** extension remains U-D2 (§5.5).

**The M3 data-loss guard (pinned):** `getNode(id)` returns the fields;
`putNode({ ...getNode(id)! })` preserves them (validateNodeShape accepts them,
so they are re-stored, not stripped). A test asserts the fields are intact
after the round-trip.

### 5.4 Shape validation + normalization

The store's write-time validation (`validateNodeShape`) must accept valid
`documentPath`/`tags` arrays and reject malformed ones (non-array, non-string
member, empty member). The same validation runs at boot (a malformed array →
the record is SKIPPED, never loaded). Normalization (`[]`→`undefined`,
`tags` trim + dedupe) happens in the returned node, BEFORE hashing/storage.

**The amended `validateNodeShape` branches (pinned):**

```ts
// src/main/rag-store.ts — the amended validateNodeShape. Two branches are
// added; normalization happens in the returned node (like ownedNodeIds dedupe).
function validateNodeShape(input: unknown): NodeShapeResult {
  // ... existing checks (id/type/nodeKind/content/children/props/ownedNodeIds/
  //     createdAt/updatedAt) ...
  if (n.documentPath !== undefined) {
    if (!Array.isArray(n.documentPath)) return { ok: false, field: 'documentPath' }
    for (const s of n.documentPath) {
      if (typeof s !== 'string' || s === '') return { ok: false, field: 'documentPath' }
    }
  }
  if (n.tags !== undefined) {
    if (!Array.isArray(n.tags)) return { ok: false, field: 'tags' }
    for (const t of n.tags) {
      // trimmed-empty is rejected (a whitespace-only tag is not a tag)
      if (typeof t !== 'string' || t.trim() === '') return { ok: false, field: 'tags' }
    }
  }
  // ... existing checks ...
  return {
    ok: true,
    node: {
      // ... existing fields ...
      // `[]`→undefined; tags trimmed + deduped (first-occurrence order).
      documentPath: n.documentPath !== undefined && n.documentPath.length > 0
        ? [...n.documentPath] : undefined,
      tags: n.tags !== undefined && n.tags.length > 0
        ? [...new Set(n.tags.map((t) => t.trim()))] : undefined,
      // ...
    },
  }
}
```

**Validation + normalization rules (pinned):**

- **Both fields are OPTIONAL.** A record without either passes validation
  unchanged (ADDITIVE).
- **Each field must be an ARRAY when present.** A non-array value → the
  matching `{ ok: false, field }` (`'documentPath'` / `'tags'`).
- **Each `documentPath` member must be a non-empty STRING.** A non-string or
  empty-string member → `{ ok: false, field: 'documentPath' }`. Segments are
  NOT trimmed and NOT deduped.
- **Each `tags` member must be a STRING whose `trim()` result is non-empty.**
  A non-string, an empty string, or a whitespace-only string →
  `{ ok: false, field: 'tags' }`.
- **`tags` normalization:** each retained tag is `.trim()`ed, then DEDUPED on
  the trimmed value with first-occurrence order preserved (case-SENSITIVE —
  `'A'` and `'a'` are distinct). Duplicate input is normalized, NOT rejected.
- **`[]` normalization:** an empty `documentPath`/`tags` array is stored as
  `undefined` (omitted) — never as `[]`. This differs deliberately from
  `children`, which KEEPS `[]`.
- **Copy on validate:** the returned node copies both arrays so a caller
  mutating the input array after `putNode` cannot mutate the store.
- **The write-time throw:** `putNode`/`applyBatch(putNode)` with a malformed
  array throws/returns per the existing pattern —
  `Error('rag putNode: documentPath required/invalid')` /
  `Error('rag putNode: tags required/invalid')` (the existing
  `rag putNode: <field> required/invalid` pattern); for `applyBatch`, the
  discriminated `{ ok: false, error: 'rag applyBatch: <field> required/invalid
  at index N' }`. The store is unchanged.
- **The boot skip:** a persisted record with a malformed array fails
  `validateNodeShape` at boot → SKIPPED (never loaded), exactly like any other
  malformed node field (A2). A shape-valid but hash-mismatched record is
  QUARANTINED (A1).
- **`isRagNode` (journal structural-op validator) mirrors the accept branch**
  (not the normalization): it returns true when each field is `undefined` or an
  array of non-empty strings (with the trimmed-empty rule for `tags`).

### 5.5 Off-root handling + the U-D1 boundary

**Off-root handling (M23, pinned):** the store has **no notion of a document
root**. It validates, hashes, stores, and returns `documentPath`/`tags` on ANY
node. They are **semantically meaningful only on a document root**
(`id === documentId`). The write surface (U-D7) is responsible for restricting
writes to document roots; U-D1 neither rejects nor strips off-root fields. A
non-root node carrying them validates, stores, and round-trips unchanged
("stored/hashed but ignored off-root").

**Explicit U-D1 boundary (pinned):** NO journal content-entry snapshot change
(U-D2); NO import/id-scheme change (U-D3); NO doc-heads payload/listing/tree
or read-surface backfill (U-D4); NO `rag.list_documents` tool (U-D5); NO
`rag.query`/`rag-stream` filter extension (U-D6); NO `edit.set_doc_meta` write
op, caps, authorization, or root-restriction (U-D7); NO doc-nav tree UI
(ui-overhaul G2). The only journal seam touched is `isRagNode` (node shape
validation, M3).

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Fields present on `RagNode`:** the interface exposes
   `documentPath?: string[]` and `tags?: string[]`; both are optional.
2. **Create with both fields:** `putNode({ id, type, content, documentPath:
   ['a','b'], tags: ['x','y'], ownedNodeIds, createdAt, updatedAt })` →
   returns the stored node; `getNode(id)` returns both arrays intact;
   `listNodes()` has 1 entry; the file is written atomically.
3. **Create with `documentPath` only:** `putNode({ ..., documentPath: ['a'] })`
   → `getNode` returns `documentPath: ['a']` and `tags` undefined.
4. **Create with `tags` only:** `putNode({ ..., tags: ['x'] })` → `getNode`
   returns `tags: ['x']` and `documentPath` undefined.
5. **Node WITHOUT the fields (v1 default):** `putNode` with neither field →
   stored; `getNode` returns both as `undefined`; the hash matches the
   pre-U-D1 format (no quarantine).
6. **Empty `documentPath` normalizes away:** `putNode` with `documentPath: []`
   → `getNode` returns `documentPath` undefined; the hash equals the
   absent-field hash (byte-identical).
7. **Empty `tags` normalizes away:** `putNode` with `tags: []` → `getNode`
   returns `tags` undefined; the hash equals the absent-field hash.
8. **`tags` trim + dedupe + first-occurrence order + case-sensitivity:**
   `putNode` with `tags: [' b ', 'a', 'b', 'A']` → `getNode` returns
   `tags: ['b', 'a', 'A']` (trimmed, deduped on the trimmed value, `'A'` kept
   distinct from `'a'`, original first-occurrence order preserved).
9. **`documentPath` no dedupe:** `putNode` with `documentPath: ['a','a']` →
   `getNode` returns `documentPath: ['a','a']`.
10. **Hash covers `documentPath`:** the same node with vs. without
    `documentPath: ['a']` yields different `nodeSource`/hashes.
11. **Hash covers `tags`:** the same node with vs. without `tags: ['x']` yields
    different `nodeSource`/hashes.
12. **`nodeSource` fixed field order:** the serialized key order is `id, type,
    content, nodeKind, children, documentPath, tags, props, ownedNodeIds,
    createdAt, updatedAt` (`documentPath`/`tags` after `children`, before
    `props`).
13. **Additive load (existing record without the fields):** a store file
    written before U-D1 boots with `status().corrupt === false`, all nodes
    loaded, none quarantined (the re-derived hash matches the stored hash).
14. **Round-trip with the fields:** store A writes a node with
    `documentPath`/`tags` to path P; a fresh store B boots from P →
    `status().corrupt === false`; `getNode` returns both arrays intact (the
    hash re-verifies).
15. **Deep-copy on read:** mutating a returned node's `documentPath`/`tags`
    (e.g. `push`) does NOT change the store.
16. **Deep-copy on write:** mutating the array passed to `putNode` after the
    call returns does NOT change the store.
17. **M3 data-loss guard:** `getNode(id)` → `putNode({ ...getNode(id)! })` →
    `getNode(id)` still returns the same `documentPath`/`tags` (not stripped).
18. **Off-root node:** a non-root node carrying `documentPath`/`tags` validates,
    stores, and round-trips unchanged (stored/hashed but ignored off-root).
19. **Structural journal node accepted:** a `node-add`/`node-update` journal
    entry carrying a node with valid `documentPath`/`tags` survives boot
    (`isRagNode` accepts it).
20. **`applyBatch(putNode)` with the fields:** a one-op batch carrying a node
    with the fields applies, stores the normalized fields, and persists once.

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **`documentPath` is a non-array** (object, string, number) →
   `putNode` throws `Error('rag putNode: documentPath required/invalid')`; the
   store is unchanged.
2. **A `documentPath` member is a non-string** → `putNode` throws
   `Error('rag putNode: documentPath required/invalid')`; store unchanged.
3. **A `documentPath` member is an empty string** → `putNode` throws
   `Error('rag putNode: documentPath required/invalid')`; store unchanged.
4. **`tags` is a non-array** (object, string, number) → `putNode` throws
   `Error('rag putNode: tags required/invalid')`; store unchanged.
5. **A `tags` member is a non-string** → `putNode` throws
   `Error('rag putNode: tags required/invalid')`; store unchanged.
6. **A `tags` member is an empty or whitespace-only string** → `putNode`
   throws `Error('rag putNode: tags required/invalid')`; store unchanged.
7. **`applyBatch(putNode)` with a malformed array** → returns
   `{ ok: false, error: 'rag applyBatch: documentPath|tags required/invalid at
   index N', failedIndex: N }`; the store is rolled back (never throws).
8. **Persisted record with a malformed `documentPath` at boot** → the record
   is SKIPPED (never loaded); `status().loadedNodes` excludes it.
9. **Persisted record with a malformed `tags` at boot** → the record is
   SKIPPED (never loaded).
10. **Persisted record whose `documentPath` was tampered (changed without a
    hash update) at boot** → the record is QUARANTINED; `status().quarantined`
    includes it; it is NOT in `status().loadedNodes`.
11. **Persisted record whose `tags` was tampered at boot** → QUARANTINED (same
    discipline).
12. **A journal structural entry carrying a node with a malformed
    `documentPath`/`tags` at boot** → the entry is SKIPPED (`isRagNode`
    rejects it).
13. **Byte-equality on an old store (F10 binding acceptance):** a store file
    with records that have no `documentPath`/`tags` re-derives byte-identical
    hashes and loads with zero quarantines.

### 5.8 Census / numeric claims

- **`RagNodeType` union members:** 23 — **UNCHANGED** by this unit
  (`h1`–`h6` 6, `p`/`ul`/`ol`/`li`/`blockquote`/`pre`/`code` 7, `strong`/`em`/
  `a`/`img` 4, `div` 1, `table`/`thead`/`tr`/`td`/`th` 5). `documentPath`/
  `tags` add NO node type.
- **New fields on `RagNode`:** 2 — `documentPath?: string[]`,
  `tags?: string[]` (both optional, additive).
- **New exported types from `src/main/rag-store.ts`:** 0 (both are plain
  `string[]`).
- **New runtime sets:** 0 (no closed union for either field; caps are U-D7,
  not the store model).
- **`nodeSource` field count:** 9 → **11** — current (`id, type, content,
  nodeKind, children, props, ownedNodeIds, createdAt, updatedAt`) plus
  `documentPath`, `tags` inserted after `children`, before `props`. (The
  review/task pin that enumerated 10 fields omitted `nodeKind`; see the §5.2
  RCA-10 note — including `nodeKind` is required for hash-neutrality and the
  count is 11.)
- **Hash:** SHA-256 (`createHash('sha256')`), hex-encoded, always derived from
  the record's serialized source at write time (unchanged — now covers
  `documentPath`/`tags`).
- **Edit-op census:** UNCHANGED — this unit adds NO edit op
  (`edit.set_doc_meta` is U-D7).
- **Journal content-entry snapshot:** UNCHANGED — the `before`/`after` snapshot
  extension is U-D2. The only journal seam updated is the `isRagNode` shape
  validator.
- **`RagNodeChildType` / `RagNodeChild`:** UNCHANGED.

### 5.9 Cross-references

- **Gate:** `docs/specs/document-directory-category-review.md` (the three-agent
  gate outcome: M1–M16, Q1–Q9, the U-D1…U-D8 decomposition) and
  `docs/decisions.md` row **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-
  AMENDMENTS, RATIFIED 2026-09-11).
- **Parent (GATED):** `docs/specs/document-directory-category.md` §3.1 (the
  additive root-node model), §3.7 (migration — additive, no re-hash), §4
  (F1/F7/F10 fail-states), §5 (store hash + format risk).
- **Precedent:** `docs/specs/unit-m-children-field.md` §5.1 (the additive
  optional-field pattern), §5.2 (fixed-order hash source), §5.3 (additive load
  + copy paths), §5.4 (write-time validation branch + boot skip).
- **Decisions:** `docs/decisions.md` rows **CHILDREN-ADDITIVE-STORE-FORMAT**,
  **CHILDREN-HASH-SOURCE**, **RAG-AUTHORITATIVE**, **SINGLE-WRITER-STORE**
  (and **BATCH-ATOMICITY-API** for the `applyBatch` path the fields ride).
- **Downstream units (NOT this spec):** U-D2 (journal invertibility), U-D3
  (import path + id scheme), U-D4 (doc-heads listing/tree), U-D5
  (`rag.list_documents`), U-D6 (query filters), U-D7 (`edit.set_doc_meta`),
  and ui-overhaul G2 (doc-nav tree UI).
- **Host patterns:** `src/main/rag-store.ts` (the `RagNode` interface,
  `nodeSource`/`nodeHash`, `validateNodeShape`, `isRagNode`, `toPublicNode`,
  `insertNode`, `setNodeFields`, the boot load/re-verify — the amendment
  sites), `src/main/adjacency.ts:44-46` (`copyNode` — the snapshot-store copy
  site).
