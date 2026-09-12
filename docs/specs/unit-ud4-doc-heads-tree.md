# Spec — Unit U-D4: Doc-Heads Listing + Derived Category Tree + Read-Surface Backfill

- **Status:** SPEC (the doc-heads-listing/tree/backfill unit of the document
  directory/category slice — the FOURTH unit of the ratified U-D1…U-D7
  decomposition; execution order U-D1 → U-D2 → U-D3 → **U-D4** → U-D5 ∥ U-D6 →
  U-D7). Gate references: `docs/decisions.md` row
  **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-AMENDMENTS, RATIFIED
  2026-09-11), `docs/specs/document-directory-category-review.md` (M7/M13/M16
  + the U-D4 row in §5; Q2/Q3/Q7), and the GATED parent
  `docs/specs/document-directory-category.md` §3.4/§3.7. Precedent specs:
  `docs/specs/unit-ud1-document-metadata-fields.md` (the LANDED
  `RagNode.documentPath?`/`tags?` fields + `[]`→omitted), and
  `docs/specs/unit-ud3-import-path-id-scheme.md` (the LANDED path-qualified
  `/`-joined `documentId` + root-only `documentPath` set). This unit is the
  review's **U-D4** row: the doc-heads listing + a derived prefix tree + the
  read-surface display backfill.
- **Scope:** four primary source sites (plus the F4-followup
  `src/main/adjacency.ts` `copyNode` array-guard touch):
  1. `src/shared/types.ts` — `RagDocHeadsPayload.documents` gains the
     **REQUIRED** `path: string[]` and `tags: string[]` fields (additive to the
     ENTRY shape; the producer always sets both, `[]` when the root node has
     none).
  2. `src/main/mcp-server.ts` — `handleRagDocHeadsIpc` reads the ROOT node
     (`e.target`) for `documentPath`/`tags` (M7) while keeping `title` from the
     head SECTION node (`e.source`, as today); tolerates a missing/quarantined
     root (emits `path: []`/`tags: []`, never throws); preserves the MED-1
     malformed-edge skip + dedupe-by-target; keeps the deterministic stable sort
     by `documentId`.
  3. **NEW pure module** `src/shared/document-tree.ts` — `buildDocumentTree`
     (prefix-grouping into a folder tree, TOTAL, empty branches dropped) and
     `selectDocumentIdsByPathPrefix` (the category-scoped selection,
     M13/§3.4 — a caller-side filter, NOT a traversal change).
  4. `src/renderer/pane-registry.ts` — `PaneContext.docHeads` widens to
     `RagDocHeadsPayload['documents'] | null` so the display `path`/`tags` are
     available to the ui-overhaul G2 tree; `src/renderer/pane-graph.ts`'s
     `deriveDocNavDocuments` param narrows to the structural
     `{ documentId; title }` shape (it reads only those two) so the existing
     flat doc-nav render and its direct-array tests keep compiling.
- **DELIBERATE EXCLUSIONS (the ratified decomposition splits these out — this
  unit implements NONE of them):**
  - **U-D5 — the MCP read tool `rag.list_documents`.** The tool, its group row,
    its zod schema, its `RpcMethod` declaration, and its handler are U-D5.
  - **U-D6 — `rag.query`/`rag-stream` document filters.** `RagQueryFilters`, the
    `validateFilters`/`validateRagQueryFilters` extension, and the zod schemas
    (M8) are U-D6.
  - **U-D7 — the tag write op `edit.set_doc_meta`.** The op, its group gating,
    its authorization/validation caps, and path immutability are U-D7. U-D4 is
    READ-ONLY.
  - **ui-overhaul G2 — the doc-nav TREE rendering.** The provident-authored
    folder/leaf tree UI, folder toggles, and the MCP-dispatchable tree nodes are
    G2 (ratified 2026-09-11). U-D4 only makes the DATA available (the payload
    `path`/`tags` + the pure tree helper) and keeps the existing renderer
    compiling; it authors NO tree UI.
  - **No store/traversal change.** No `RagNode` field (U-D1 landed it), no
    `nodeSource`/hash change, no journal change (U-D2), no import change (U-D3),
    no `computeDocumentSubgraph`/`buildTraversal` change, no persisted
    `documents:` section, no new node/edge kind.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, normalization rule, happy-path state, and fail-state below is
  derivable from this spec ALONE. The TestWriter writes the red set for
  `src/shared/document-tree.ts` (the NEW pure module), `src/shared/types.ts`
  (the payload entry), `src/main/mcp-server.ts` (`handleRagDocHeadsIpc`), and
  `src/renderer/pane-registry.ts`/`src/renderer/pane-graph.ts` (the context
  reconciliation) from §5.6/§5.7 before any implementation. The tree helper red
  set needs NO Electron and NO store.

---

## 1. What the proposal asks

The document directory/category slice needs the doc-heads LISTING to expose each
document's corpus-relative directory and tags so a consumer can group documents
into a category tree and scope a load by category — WITHOUT creating new RAG
node/edge kinds, a persisted tree, or a traversal change. This unit lands the
read half (Q2/Q3/M7/M13):

1. **The listing carries display metadata.** `RagDocHeadsPayload.documents`
   entries gain `path: string[]` (the document root's `documentPath`) and
   `tags: string[]` (the document root's `tags`). Both are REQUIRED on the entry
   and emitted as `[]` when the root node has none.
2. **The root read (M7).** `handleRagDocHeadsIpc` already reads the head
   SECTION node (`e.source`) for `title`; `documentPath`/`tags` live on the
   document ROOT node (`e.target`), so the handler reads `getNode(e.target)` for
   both. A missing/quarantined root emits `[]`/`[]` and never throws.
3. **A derived prefix tree.** A NEW pure helper `buildDocumentTree` groups the
   `path` arrays into a folder tree (folder label = the sanitized segment; a
   document leaf attached under its `path` folder chain). It is TOTAL (never
   throws on malformed input), drops empty branches (F8), sorts siblings
   deterministically, and renders the segment-also-a-document case as DISTINCT
   leaf + folder nodes sharing a label.
4. **Category-scoped selection.** A NEW pure helper
   `selectDocumentIdsByPathPrefix` returns the `documentId`s whose `path` starts
   with a given `prefix` — an additive caller-side filter (M13/§3.4), NOT a
   traversal change.
5. **Display-only backfill (M13).** The payload `path` = the root node's
   `documentPath ?? []`. It is NEVER derived by splitting a prefixed
   `documentId` (C9) and is NEVER persisted; legacy documents (no
   `documentPath`) display as root-level `[]`.
6. **Renderer reconciliation.** `PaneContext.docHeads` widens to the payload
   entry so the data is available to G2; `deriveDocNavDocuments` keeps its flat
   `{ documentId; title }` return, so the current doc-nav rendering is
   unchanged. Required-field payload literals in existing fixtures are updated
   as a sanctioned ripple (§5.5).

## 2. Feasibility verdict

**Feasible — a contained, read-surface-only change over already-landed state.**

- **The fields are landed.** U-D1 added `RagNode.documentPath?`/`tags?`
  (`rag-store.ts:116,121`), normalized `[]`→omitted, and copied them through
  `toPublicNode` (`:823`) — so a document ROOT node read via `store.getNode`/
  `listNodes` already carries the values. U-D4 only projects them into the
  listing.
- **The root/section split is landed and verified.** The parser mints the
  `doc-head` edge as `{ source: sectionIds[0], target: documentId }`
  (`markdown-parse.ts:602`); the importer sets `documentPath` only on the node
  whose `id === documentId` (`markdown-import.ts:353-359`). So `e.target` is the
  document root carrying `documentPath`/`tags`, and `e.source` is the head
  section carrying `title`. The current handler already reads
  `nodeById.get(e.source)?.content` for `title`; adding a
  `nodeById.get(e.target)` read for the metadata is a local, additive change.
  **RCA-10 check: NO conflict** — the code matches the pinned M7 read exactly.
- **The tree helper is pure data-shaping.** The input is a plain
  `{ documentId; title; path; tags }[]`; the output is a folder/leaf tree. No
  Electron, no `fs`, no store, no DOM, no `provident-ssr` — a pure, total
  function testable in isolation.
- **The renderer already caches the payload.** `sidebar-panes.ts:379` types
  `lastDocHeads` as `RagDocHeadsPayload['documents'] | null` and
  `buildContext()` passes it through, so widening `PaneContext.docHeads` to the
  same type is consistent and requires no new host state.

No `provident-ssr` engine seam is involved, so no `docs/defects.md` /
`docs/HANDOFF.md` item is expected from this unit. The directory/category
feature is **project-specific** (the RAG data model is host-side, per
ENGINE-GAP-HANDOFF). The MCP read tool (U-D5), the query filters (U-D6), the
tag write op (U-D7), and the doc-nav tree UI (G2) are LATER units — NOT this one.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| `RagDocHeadsPayload.documents` `path`/`tags` (required, `[]` default) | Project-specific (the doc-heads IPC payload) | Low cost; the doc-nav/listing can group by directory/tag without the snapshot. Additive to the entry shape. |
| The root read (`e.target`) in `handleRagDocHeadsIpc` (M7) | Project-specific (the listing seam) | Low cost; reads the metadata where it was minted (root) while keeping `title` on the head section. |
| The pure `buildDocumentTree` helper | Project-specific (a pure data transform) | Low cost; a total, side-effect-free tree builder with no new node/edge kind and no persisted tree. |
| The pure `selectDocumentIdsByPathPrefix` filter | Project-specific | Low cost; category-scoped loads as an additive caller-side selection over the doc-heads list (no traversal change). |
| Display-only backfill (`documentPath ?? []`, never id-split) | Project-specific | Low cost; legacy documents display root-level; no migration, no persisted field. |
| `PaneContext.docHeads` widening + fixture updates | Project-specific (a type reconciliation) | Low cost; the sanctioned ripple of adding required payload fields (a bounded, listed fixture set, §5.5). |

No engine gap. The MCP read tool (U-D5), the query filters (U-D6), the
`edit.set_doc_meta` write op (U-D7), and the doc-nav tree UI (G2) are LATER
units — NOT this unit.

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) — **to be run after the unit lands**. The
known edge cases this unit's contract already pins (so the adversarial pass must
NOT regress them); the pass results are recorded at the end of this section:

- **A1 — missing document root (or quarantined edge, see F3).** A `doc-head`
  edge whose target root node is ABSENT from `store.listNodes()` but whose edge
  still survives (never loaded; the `createSnapshotStore` fixture case) MUST emit
  `path: []`, `tags: []` (never throw, never a phantom). NOTE: a root
  quarantined for a tampered hash by U-D1's boot re-verify is a STRONGER case —
  the real store quarantines the associated `doc-head` EDGE as well, so the
  handler never sees the edge and emits `{ documents: [] }` (F3, corrected
  below).
- **A2 — the MED-1 malformed-edge skip is preserved.** A `doc-head` edge with a
  missing/`undefined`/empty `target` is SKIPPED before the root read (never a
  `{ documentId: undefined }` entry, never a crash). Adding the root read must
  not move the `title` read or the target guard.
- **A3 — the tree helper is TOTAL.** `buildDocumentTree(null as never)`,
  a non-array, an array with `null`/primitives/arrays, an entry with a
  missing/empty/non-string `documentId`, a non-array `path`, and a `path`
  containing non-string/empty members all MUST NOT throw and MUST produce a
  deterministic result (skip or truncate per §5.7).
- **A4 — F8 empty branches dropped.** No folder node with `children: []` can be
  emitted. A malformed entry whose `documentId` is skipped MUST NOT leave a
  folder created only for it. The adversarial pass must confirm every emitted
  folder has ≥1 descendant leaf.
- **A5 — segment-also-document.** A document `a` (`path: []`) and a document
  `a/b` (`path: ['a']`) MUST render a LEAF labelled `a` and a FOLDER labelled
  `a` as DISTINCT sibling nodes (sharing a label), with the folder ordered
  before the leaf on a total tie (§5.5). The adversarial pass must confirm both
  survive the sort and are separately addressable.
- **A6 — display-only backfill, no id split (C9).** A document whose root has
  no `documentPath` MUST emit `path: []` — even when its `documentId` contains a
  `/` (e.g. a non-default-store id `S:a/readme`). The handler/tree MUST NOT
  derive `path` by splitting the id. The adversarial pass must confirm a
  prefixed/nested id with an absent root path stays `[]`.
- **A7 — prefix-selection semantics.** `selectDocumentIdsByPathPrefix` with
  `prefix: []` returns ALL documentIds; a strict sub-prefix returns the matching
  subset; a non-matching prefix returns `[]`; a non-array `prefix` behaves as
  `[]` (all); a non-array `docs` returns `[]`. Legacy documents (`path: []`)
  match ONLY the empty prefix. The adversarial pass must confirm each.
- **A8 — deterministic sort + no aliasing.** The handler's `documentId` sort and
  the tree's sibling sort are deterministic and stable; the emitted `path`/`tags`
  arrays are COPIES (mutating an entry cannot mutate the store node). The
  adversarial pass must confirm copy-on-emit and a total, repeatable order.
- **A9 — read-only.** `handleRagDocHeadsIpc`, `buildDocumentTree`, and
  `selectDocumentIdsByPathPrefix` perform NO store write and NO `fs`/Electron
  access (the helper is pure; the handler only reads `edgesByKind`/`listEdges` +
  `listNodes`). The adversarial pass must confirm no `putNode`/`applyBatch`.

Any host finding is fixed here + regression-tested; any `provident-ssr` package
finding → `docs/defects.md`/`docs/HANDOFF.md` (none expected).

**Adversarial pass (RCA-3, 2026-09-11, post-green):**
`tests/unit-ud4-doc-heads-tree-adversarial.test.ts` (RED 3 failed | 1 passed →
GREEN 4/4 for F1/F2; +1 F4-followup regression → final 5/5). Findings:

- **F1 (LOW, HOST — FIXED, regression-tested).** `buildDocumentTree` claimed to
  be TOTAL but `sortChildren` recursed once per path segment; a path of 10 000
  segments threw `RangeError: Maximum call stack size exceeded` during the sort
  (the build walk itself is iterative). Fix: `src/shared/document-tree.ts`'s
  `sortChildren` now uses an EXPLICIT STACK (iterative post-order) — depth-safe,
  bounded by heap not the call stack. Output semantics are unchanged (the
  comparator reads only each node's own label/id). Red: the 10 000-segment case
  threw. Green: the full 10 000-folder chain builds and the folder-first
  tiebreak pin stays `['folder','document']`.
- **F2 (LOW, HOST — FIXED, regression-tested).** `handleRagDocHeadsIpc`'s
  malformed-edge guard was `e.target == null || e.target === ''`, so a
  non-string target (number/object/boolean) passed it and, with ≥2 entries, the
  final `documentId.localeCompare` sort threw
  `TypeError: a.documentId.localeCompare is not a function`. Fix:
  `src/main/mcp-server.ts` now guards with
  `typeof e.target !== 'string' || e.target === ''` (subsumes the prior check,
  same string behavior). Red: number/object targets threw; a boolean target
  leaked into the result. Green: malformed targets are skipped (empty store →
  `{ documents: [] }`) while valid string targets are still listed.
- **F3 (MEDIUM, SPEC FIDELITY — narrative corrected here + §5.7-6).** The A1
  narrative over-claimed: it described a tampered/quarantined root as emitting
  `path: []`/`tags: []`. In a REAL store U-D1's boot re-verify quarantines the
  document root's EDGE (the `doc-head` edge) as well as the node, so the handler
  observes NO edge and the actual outcome is `{ documents: [] }` (not an
  `[]`/`[]` entry). The `[]`/`[]` behavior is the weaker absent-root-but-edge-
  survives case that the `createSnapshotStore` fixture can express. No code
  change — the handler is correct either way; the spec text is corrected.
- **F4 (INFO → LOW, HOST — FIXED, regression-tested; F4-followup).** A `doc-head`
  edge to a target that is present in `listNodes()` but whose
  `documentPath`/`tags` are non-arrays (tampered shape) emits `[]`/`[]` — no
  throw. The original narrative claimed this was already covered by the
  `Array.isArray` guards, but the blind-greens pass (UD4-B2.3) showed
  `createSnapshotStore`'s `copyNode` (`src/main/adjacency.ts`) spread the fields
  with `[...n.documentPath]` WITHOUT a guard, so a string `documentPath: 'oops'`
  became `['o','o','p','s']` and the handler (seeing an array) emitted the
  characters. Fix: `copyNode` now guards both fields with `Array.isArray(...)`
  and omits the key when it is not an array (the handler's own `[]` default then
  applies). Red: blind UD4-B2.3 failed (`path` = `['o','o','p','s']`); Green:
  44/44, with a focused regression in
  `tests/unit-ud4-doc-heads-tree-adversarial.test.ts` (F4-followup). The handler
  itself was already correct — the coercion was in the store copy layer.
- **F5 (INFO).** The `seen` dedupe set stores raw targets; broadening the F2
  guard to reject non-strings means `seen` now only ever holds strings — no
  observable change (dedupe already ran after the guard).
- **F6 (INFO — test-coverage gap).** The existing
  `tests/unit-ud4-doc-heads-tree.test.ts` fail-8 fixture builds two DOCUMENTS
  (not a folder-vs-document pair), so it never exercises the folder-first
  comparator tiebreak; it only pins repeatability. The adversarial F1 pin
  (`docHead('a', path: [] )` + `docHead('a/b', path: ['a'])`) covers the actual
  `['folder','document']` tiebreak. No behavior bug — a fixture note for a
  future hardening pass.

No `provident-ssr` package finding — no `docs/defects.md`/`docs/HANDOFF.md`
item.

### 3b. Proposal-review findings

The proposal-review gate returned **PROCEED-WITH-AMENDMENTS** for the document
directory/category proposal (`docs/decisions.md` row
**DOC-DIRECTORY-CATEGORY-GATE**, 2026-09-11;
`docs/specs/document-directory-category-review.md`). The amendments THIS unit
pins (each cross-referenced to the section that resolves it):

- **M7 — doc-heads root read** (§5.1/§5.2): the head SECTION (`e.source`) keeps
  `title`; the document ROOT (`e.target`, per `markdown-parse.ts:596-602`) is
  read for `path`/`tags`; a missing/quarantined root is tolerated; the sort is
  deterministic. **RCA-10: no code conflict — verified.**
- **M13 — migration semantics / read-surface backfill** (§5.5): backfill
  `documentPath` for display at the read surface ONLY, never persisted; NEVER
  derive by splitting a prefixed `documentId` (C9); no standalone migration
  unit; legacy documents display root-level `[]`.
- **M16 — UI coupling** (§5.5): name `pane-registry.ts:30`
  (`PaneContext.docHeads`) + `pane-graph.ts:159-206` (`deriveDocNavDocuments`/
  `docNavContent`); the tree RENDERING stays in ui-overhaul G2.
- **Q2/Q3/Q7 (consumed):** a DERIVED prefix tree (no new node/edge kinds, no
  persisted `documents:` section); single `documentPath` + multi-valued `tags`;
  tags are case-sensitive/trimmed/deduped (`[]` when absent).
- **F8 (consumed, §5.7):** a category with zero documents is not rendered — the
  derived tree drops empty branches.

## 4. Design decisions pinned by this spec

- **DOC-DIRECTORY-CATEGORY-GATE (consumed):** Q2 derived prefix tree (no new
  node/edge kinds, no persisted section), Q3 single path + multi tags,
  Q7 tags case-sensitive/trimmed/deduped, M7 the doc-heads root read, M13 the
  read-surface-only backfill (never persisted, never id-split), M16 the renderer
  coupling. Only the listing/tree/backfill lands here.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the persistent source of
  truth. The payload `path`/`tags` are PROJECTIONS of the root node's persisted
  fields; the tree is a transient derivation.
- **SINGLE-WRITER-STORE (consumed):** the doc-heads IPC reads the main-process
  store (read-only); the renderer has no store access. U-D4 adds no write.
- **DOC-HEADS-IPC (consumed, Unit V3):** the `rag-doc-heads` IPC + the lighter
  payload are preserved; U-D4 is an ADDITIVE widening of the entry shape (both
  new fields required, `[]` default), not a new IPC.
- **DOC-NAV-DOCHEADS / HOST-DOCHEADS-CACHE (consumed, Unit V3):** the host's
  `lastDocHeads` already holds `RagDocHeadsPayload['documents']`; the doc-nav
  reads it. U-D4 widens the renderer's `PaneContext.docHeads` to the same type
  so G2 can consume `path`/`tags`; the current flat doc-nav render is unchanged.

## 5. The exhaustive contract

### 5.1 The amended `RagDocHeadsPayload` (`src/shared/types.ts`)

`RagDocHeadsPayload.documents` entries gain TWO REQUIRED display fields. The IPC
constant (`IPC_RAG_DOC_HEADS`), the payload name, and the array shape are
UNCHANGED; only the entry shape widens (additive to the wire shape — every
producer sets both).

**The amended payload (pinned):**

```ts
// src/shared/types.ts — the amended RagDocHeadsPayload. Each entry gains the
// REQUIRED display fields `path` and `tags` (U-D4). The producer ALWAYS emits
// both, `[]` when the document root has none.
export const IPC_RAG_DOC_HEADS = 'provident:rag-doc-heads'
export interface RagDocHeadsPayload {
  /** One entry per document, sorted by document root id (lexicographic
   *  ascending, deterministic). Each entry carries the display-only
   *  `path`/`tags` projected from the document ROOT node (`e.target`); `[]`
   *  when the root has none (legacy / root-level / untagged). */
  documents: Array<{
    documentId: string
    title: string
    /** U-D4 (M7/M13) — the document root's corpus-relative DIRECTORY segments
     *  (the root's `documentPath ?? []`). DISPLAY-ONLY: never persisted, never
     *  derived by splitting `documentId` (C9). A legacy document (no
     *  `documentPath`) displays as root-level `[]`. */
    path: string[]
    /** U-D4 (M7/Q7) — the document root's `tags ?? []`. DISPLAY-ONLY. */
    tags: string[]
  }>
}
```

**Payload rules (pinned):**

- **`path` is REQUIRED** on every entry and is `string[]`; `[]` = root-level.
- **`tags` is REQUIRED** on every entry and is `string[]`; `[]` = untagged.
- **`path`/`tags` are DISPLAY VALUES** — the sanitized segments/tags as stored
  on the root node (U-D1 normalization already applied: segments non-empty, tags
  trimmed/case-sensitive/deduped). They are not re-validated here.
- **`[]` is the default** for both when the root node is absent, carries no
  field, or is quarantined (M13). No `undefined` is ever emitted.
- **No other field** is added; no new IPC constant; no new shared type (the
  entry stays inline, as today).

### 5.2 The amended `handleRagDocHeadsIpc` (`src/main/mcp-server.ts`)

The handler keeps its existing behavior (null-store throw; `edgesByKind('doc-head')`
with a `listEdges()` fallback; dedupe by target first-head-wins; MED-1
malformed-edge skip; `title` from the head section `e.source`; empty store →
`{ documents: [] }`) and ADDS the document-ROOT read for `path`/`tags` (M7). The
`documentId` sort is retained and pinned deterministic/stable.

**The amended handler (pinned):**

```ts
// src/main/mcp-server.ts — the amended handleRagDocHeadsIpc. `title` stays on
// the head SECTION node (e.source); `path`/`tags` come from the document ROOT
// node (e.target, M7). A missing/quarantined root → `[]`/`[]`.
export function handleRagDocHeadsIpc(store: RagStore | null): RagDocHeadsPayload {
  if (!store) throw new Error('rag-doc-heads: no rag store configured')
  const edges = typeof store.edgesByKind === 'function'
    ? store.edgesByKind('doc-head')
    : store.listEdges().filter((e) => e.kind === 'doc-head')
  const nodeById = new Map(store.listNodes().map((n) => [n.id, n]))
  const seen = new Set<string>()
  const documents: RagDocHeadsPayload['documents'] = []
  for (const e of edges) {
    if (e.kind !== 'doc-head') continue
    // MED-1 (adversarial, preserved) + F2: a `doc-head` edge whose target is
    // not a non-empty string (missing/undefined/null, empty, or a non-string
    // number/object/boolean) is a MALFORMED edge — SKIP it (never a phantom
    // entry, never a crash, never an unselectable `''` document entry).
    if (typeof e.target !== 'string' || e.target === '') continue
    if (seen.has(e.target)) continue // dedupe by target (first head wins)
    seen.add(e.target)
    // M7 — the document ROOT (e.target) carries documentPath/tags; the head
    // SECTION (e.source) carries the title. A missing/quarantined root → [].
    const root = nodeById.get(e.target)
    documents.push({
      documentId: e.target,
      title: nodeById.get(e.source)?.content ?? '',
      path: root && Array.isArray(root.documentPath) ? [...root.documentPath] : [],
      tags: root && Array.isArray(root.tags) ? [...root.tags] : [],
    })
  }
  // Deterministic stable sort by documentId (localeCompare ascending). V8's
  // sort is stable, so equal ids keep input order.
  documents.sort((a, b) => a.documentId.localeCompare(b.documentId))
  return { documents }
}
```

**Handler rules (pinned):**

- **`title` from the head section** (`e.source`) — UNCHANGED; a missing source
  node → `''`.
- **`path`/`tags` from the document root** (`e.target`) — the root's
  `documentPath`/`tags` when present, else `[]`. The values are COPIED
  (`[...arr]`) so the emitted payload cannot alias the store's arrays (A8).
- **`[]`, never `undefined`** — an absent root, an absent field, or a
  non-array (malformed tampered) field all emit `[]`.
- **Missing/quarantined root never throws** — the root is looked up in
  `listNodes()` (quarantined nodes are excluded) and `?? []`-defaulted (A1).
- **The MED-1 malformed-edge skip is preserved** and runs BEFORE the root read
  (A2).
- **A non-string target (number/object/boolean) is skipped (F2)** — the
  `typeof e.target !== 'string' || e.target === ''` guard runs before the root
  read and the dedupe.
- **Dedupe by target (first head wins)** — UNCHANGED; a corrupted store with
  two `doc-head` edges to the SAME document emits ONE entry.
- **Deterministic stable sort by `documentId`** — `localeCompare` ascending; a
  tie preserves input order (stable).
- **Null store** → throws `Error('rag-doc-heads: no rag store configured')`
  (UNCHANGED).
- **Empty store / no doc-head edges** → `{ documents: [] }` (UNCHANGED).
- **Read-only** — no store write; the only store calls are
  `edgesByKind`/`listEdges`/`listNodes` (A9).
- **RCA-10 check:** the code path (`markdown-parse.ts:602` mints
  `{ source: sectionIds[0], target: documentId }`; `markdown-import.ts:353-359`
  sets `documentPath` on `id === documentId`) matches the M7 pin EXACTLY — no
  conflict.

> **Note (documentation reconciliation, RCA-6):** the Unit V3 spec
> (`docs/specs/unit-v3-doc-heads-docnav.md` §5.1 + §5.8) documents the entry as
> `{ documentId, title }`. U-D4 supersedes that ENTRY shape (both fields now
> required); the V3 spec's census/happy-path text must be reconciled in the same
> pass that lands the code (a doc-review item, not a code conflict).

### 5.3 The new pure module `src/shared/document-tree.ts` — `buildDocumentTree`

A NEW module. It is **PURE** (no Electron, no `fs`, no store, no DOM, no
`provident-ssr`) and **TOTAL** (never throws on malformed input). It reuses the
payload entry type as the single source of truth so the tree shape cannot drift
(RCA-6).

**The types + signature (pinned):**

```ts
// src/shared/document-tree.ts — U-D4. PURE + TOTAL. No Electron/fs/store.
import type { RagDocHeadsPayload } from './types.js'

/** One doc-head entry — the payload's element shape (single source of truth). */
export type DocHead = RagDocHeadsPayload['documents'][number]

/** A derived FOLDER node — a prefix group of document paths. */
export interface DocumentFolderNode {
  kind: 'folder'
  /** The folder's own sanitized segment (its label, NOT the full path). */
  label: string
  /** The folder's full path INCLUDING this segment. */
  path: string[]
  /** Deterministically sorted child folders + document leaves (never empty). */
  children: DocumentTreeNode[]
}

/** A derived DOCUMENT LEAF node. */
export interface DocumentLeafNode {
  kind: 'document'
  /** The document's basename — the last `/`-segment of `documentId`. */
  label: string
  /** The document's corpus-relative directory path (the payload `path`). */
  path: string[]
  /** The document's path-qualified id. */
  documentId: string
  /** The doc-head title (`''` when absent). */
  title: string
  /** The document's tags (`[]` when absent). */
  tags: string[]
}

export type DocumentTreeNode = DocumentFolderNode | DocumentLeafNode

/** Prefix-group `docs` into a deterministic folder/leaf tree. TOTAL. */
export function buildDocumentTree(docs: DocHead[]): DocumentTreeNode[]
```

**The `buildDocumentTree` algorithm (pinned):**

1. **Totality guard:** a non-array `docs` → `[]` (never throws).
2. **Per-entry normalization (deterministic skip/coerce):**
   - `doc == null`, a non-object, or an array → SKIP.
   - `documentId` not a non-empty string → SKIP (no folder is created for a
     skipped entry — F8).
   - `path`: a non-array → `[]`; otherwise iterate and push each member that is
     a non-empty string, **truncating at the first non-string/empty member**
     (never invent a segment). This is the only coercion applied.
   - `title`: a non-string → `''`.
   - `tags`: a non-array → `[]`; otherwise keep only string members
     (elements are otherwise preserved in order).
3. **Prefix-grouping:** walk the normalized `path` from the tree root, finding or
   creating a FOLDER per segment (`label` = the segment, `path` = ancestors +
   segment, `children` = `[]`). Folders are SHARED across documents that share a
   path prefix.
4. **Leaf attach:** create a `DocumentLeafNode` (`label` =
   `documentId.split('/').pop()` — the basename; `path` = the normalized path;
   `documentId`; `title`; `tags`) and attach it under the folder chain.
5. **Empty branches dropped (F8):** by construction every folder is created only
   along a document path that terminates in a leaf (step 2 skips before step 3),
   so NO folder with `children: []` is ever emitted. This is an invariant, not a
   post-pass.
6. **Deterministic sibling sort (iterative, DEPTH-SAFE):** each node's
   `children` is sorted by (a) `label` (`localeCompare`), then (b) the FULL ID —
   a folder's `path.join('/')` vs a leaf's `documentId` (`localeCompare`), then
   (c) the `kind` rank with **folder before document** (a total tiebreak). The
   sort walks the tree with an EXPLICIT STACK (iterative post-order), NOT
   recursion, so it is depth-safe: bounded by heap, never by the call stack (F1
   — a 10 000-segment path builds without `RangeError`). The comparator reads
   only each node's own label/id, so the iterative and recursive forms produce
   the same order. The sort is stable. Return the root's sorted children.
7. **No dedupe:** two entries with the same `documentId` produce two leaves
   (the payload producer is the dedupe site — §5.2); the sort makes their order
   deterministic (stable input order).
8. **segment-also-document:** a leaf labelled `a` (a document `a`, `path: []`)
   and a folder labelled `a` (a document `a/b`, `path: ['a']`) are DISTINCT
   sibling nodes that share a label; step 6 orders the folder first on the tie
   (A5).

**The pinned sibling comparator (reference):**

```ts
function sortKey(n: DocumentTreeNode): string {
  return n.kind === 'folder' ? n.path.join('/') : n.documentId
}
function bySibling(a: DocumentTreeNode, b: DocumentTreeNode): number {
  const byLabel = a.label.localeCompare(b.label)
  if (byLabel !== 0) return byLabel
  const byId = sortKey(a).localeCompare(sortKey(b))
  if (byId !== 0) return byId
  if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1 // folder first
  return 0 // stable
}
```

### 5.4 The new `selectDocumentIdsByPathPrefix` (M13/§3.4)

The category-scoped selection: return the `documentId`s whose `path` STARTS WITH
`prefix` (element-wise). This is an ADDITIVE caller-side filter over the doc-heads
list — it does NOT change `computeDocumentSubgraph`/`buildTraversal` (M13/§3.4).

**The signature + semantics (pinned):**

```ts
// src/shared/document-tree.ts — U-D4. PURE + TOTAL.
/** The documentIds whose `path` starts with `prefix` (element-wise),
 *  deduped + sorted by documentId ascending. `prefix: []` = ALL documents
 *  (the root category). Never throws. */
export function selectDocumentIdsByPathPrefix(docs: DocHead[], prefix: string[]): string[]
```

- **Empty prefix matches all:** `prefix: []` (or a non-array `prefix`, coerced
  to `[]`) matches every document — the root category. This is the
  traversal-scope "all documents" case.
- **Prefix match:** `prefix.length <= path.length` AND
  `prefix[i] === path[i]` for every `i` — i.e. the document's directory path
  begins with the prefix. A longer prefix than the path never matches.
- **Legacy documents:** a document with `path: []` matches ONLY the empty
  prefix (never a non-empty prefix) — the backfill rule (§5.5).
- **Malformed input:** a non-array `docs` → `[]`; per-entry skip/coerce as in
  §5.3 (a skipped entry contributes no id).
- **Output:** the matching `documentId`s, DEDUPED (first occurrence), then
  sorted ascending by `documentId` (`localeCompare`) for determinism.
- **No `documentPath` inference:** selection matches the payload `path` ONLY —
  it never splits `documentId` (C9).

### 5.5 Display-only backfill (M13) + renderer reconciliation

**Backfill rule (pinned):**

- The payload `path` is the ROOT node's `documentPath ?? []`; `tags` is the
  ROOT's `tags ?? []` (§5.2). This is a **read-surface projection only**.
- **NEVER persist** — the handler is read-only; no `documentPath`/`tags` is
  written, backfilled, or normalized into the store by U-D4.
- **NEVER derive by splitting a prefixed `documentId` (C9)** — a document with
  an absent root `documentPath` displays `path: []` (root-level), even when its
  `documentId` is path-qualified (`a/readme`) or `<name>:`-prefixed
  (`S:a/readme`).
- **Legacy documents** (persisted before U-D1/U-D3, no `documentPath`) display
  root-level `[]`/untagged `[]` — no migration unit.

**Renderer reconciliation (pinned):**

```ts
// src/renderer/pane-registry.ts — the widened context field (single source:
// the payload entry type). `snapshot` is retained.
import type { RagSnapshotPayload, RagDocHeadsPayload } from '../shared/types.js'
export interface PaneContext {
  snapshot: RagSnapshotPayload | null
  /** U-D4 — the doc-heads list (now carrying the display `path`/`tags`).
   *  null before the first boot/re-derive (empty-state guard preserved). */
  docHeads: RagDocHeadsPayload['documents'] | null
  // ... currentDocumentId / currentNodeId / backRefs / crosslinks (unchanged) ...
}
```

```ts
// src/renderer/pane-graph.ts — the doc-nav flat list is UNCHANGED. The param
// narrows to the structural { documentId; title } shape it actually reads, so
// both the widened payload entries AND the existing narrow test fixtures are
// accepted; the return stays the flat { documentId; title } list.
export function deriveDocNavDocuments(
  docHeads: ReadonlyArray<{ documentId: string; title: string }> | null,
): Array<{ documentId: string; title: string }>
```

- `deriveDocNavDocuments` reads ONLY `documentId`/`title`; its H1/LOW-2/LOW-3/
  LOW-4 guards and its narrow return are UNCHANGED. It does NOT build the tree.
- `docNavContent(ctx)` is UNCHANGED (it renders the flat `ul`/`li` list). The
  TREE rendering is ui-overhaul G2.
- `sidebar-panes.ts` `lastDocHeads` is already
  `RagDocHeadsPayload['documents'] | null` and `buildContext()` passes it
  through — NO host change is required.
- `src/main/main.ts`'s `ipcMain.handle(IPC_RAG_DOC_HEADS, () =>
  handleRagDocHeadsIpc(runtime.getDefaultStore()))` is UNCHANGED.

**Sanctioned fixture ripple (making `path`/`tags` required).** The following
EXISTING test sites construct payload/context literals with the old
`{ documentId, title }` entry and MUST be updated to add `path: []`/`tags: []`
(or to include the intended display values). This is the sanctioned ripple, not
a behavior change:

- `tests/unit-v3-doc-heads-docnav.test.ts` — the `docHeads:` payload literals at
  the `makeHarness` sites (369, 381, 411, 422, 441, 453, 489); the handler
  result assertions at 297 and 302; the `buildContext().docHeads` assertions at
  373 and 388. The `as PaneContext` casts (330, 336) and direct
  `deriveDocNavDocuments([...])` calls (315) need no change.
- `tests/unit-v3-doc-heads-docnav-adversarial.test.ts` — the payload literal at
  289; the `handleRagDocHeadsIpc` assertions at 199; the `as never` casts (265,
  273) and direct `deriveDocNavDocuments` calls (231-255) need no change.
- `tests/blind-unit-v3-doc-heads-docnav-greens.test.ts` — the payload literals at
  215, 258, 265, 274, 283, 289, 326, 346, 377, 387, 395, 401, 499; the
  `handleRagDocHeadsIpc`/`buildContext` assertions at 206, 211, 261, 270, 390,
  397, 475, 482; the direct `deriveDocNavDocuments` calls (463-482) need no
  change.
- `tests/sidebar-panes-host.test.ts` — the payload literal at 589-594 (add
  `path`/`tags` per document) and at 758.
- `tests/sidebar-panes.test.ts` — the `makeContext` docHeads overrides at
  557-561 and 578-582 (the `Partial<PaneContext>` literal now requires
  `path`/`tags`).
- `tests/sidebar-panes-adversarial.test.ts` — the `makeContext` docHeads
  override at 263-265.

All other payload usages pass `{ documents: [] }`, `null`, or use
`toMatchObject`/`as never` and DO NOT ripple.

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Payload shape:** `RagDocHeadsPayload.documents` entries expose
   `documentId`, `title`, `path`, and `tags`; `path`/`tags` are required
   `string[]`.
2. **Handler root read (M7):** a `doc-head` edge whose ROOT node (`e.target`)
   carries `documentPath: ['a','b']`/`tags: ['x']` → the emitted entry has
   `path: ['a','b']`, `tags: ['x']`; the `title` still comes from the head
   SECTION node (`e.source`).
3. **Handler default `[]`:** a root node with no `documentPath`/`tags` (the v1
   default) → the emitted entry has `path: []`, `tags: []`.
4. **Handler root-level legacy doc:** a root whose `documentPath` normalizes to
   absent (U-D1 `[]`→omitted) → `path: []`.
5. **Handler missing head node:** a `doc-head` edge whose `source` node is
   absent → `title: ''` (UNCHANGED), with `path`/`tags` still read from the root.
6. **Handler dedupe + sort:** two `doc-head` edges to the same target → ONE
   entry (first head wins); entries are sorted ascending by `documentId`
   (localeCompare), deterministically.
7. **Tree flat:** `docs = [{documentId:'a',path:[]},{documentId:'b',path:[]}]`
   → two leaf nodes at the root labelled `a`/`b`, each `path: []`.
8. **Tree nested:** `docs = [{documentId:'a/b', path:['a'], ...}]` → one folder
   `a` (`path: ['a']`) whose `children` is one leaf labelled `b`.
9. **Tree deep:** `docs = [{documentId:'a/b/c', path:['a','b']}]` → folder `a`
   (`path:['a']`) → folder `b` (`path:['a','b']`) → leaf `c`; no empty branch.
10. **Tree sibling sort:** siblings are ordered by `label`, then full id; the
    order is stable and repeatable across calls.
11. **Segment-also-document:** `docs = [{documentId:'a', path:[]},
    {documentId:'a/b', path:['a']}]` → at the root a FOLDER `a` (`path: ['a']`)
    AND a LEAF `a` (`documentId: 'a'`) as DISTINCT nodes; the folder sorts
    first; the folder contains leaf `b`.
12. **Leaf carries tags/title:** a leaf's `tags` equals the payload `tags`; a
    missing/`null` title coerces to `''`.
13. **Prefix selection:** `prefix: ['a']` over paths `['a']`, `['a','b']`,
    `['b']` → the first two `documentId`s, sorted ascending, deduped.
14. **Empty prefix = all:** `prefix: []` → every documentId, sorted.
15. **Prefix sub-path:** `prefix: ['a','b']` matches only a document whose path
    is `['a','b']` or begins with it.
16. **Context carries the data:** `buildContext().docHeads` entries include
    `path`/`tags`; `deriveDocNavDocuments(ctx.docHeads)` still returns the flat
    `{ documentId, title }` list (the flat doc-nav render is unchanged).
17. **Legacy display backfill:** a legacy document (payload `path: []`) renders
    root-level; a path-qualified `documentId` with an absent root
    `documentPath` still shows `path: []` (no id split).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **F8 — empty branch dropped:** `docs = [{documentId:'', path:['x']},
   {documentId:'a/b', path:['a']}]` → no folder `x` is emitted (the skipped
   entry creates no folder); folder `a` contains leaf `b`; NO emitted folder has
   `children: []`.
2. **Malformed `docs` container:** `buildDocumentTree(null as never)` /
   `buildDocumentTree({} as never)` / a string/number → `[]` (never throws).
3. **Malformed entry:** a `null`/primitive/array item, or an item with a
   missing/empty/non-string `documentId` → SKIPPED (no leaf, no folder).
4. **Malformed `path`:** a non-array `path` → treated as `[]`; a `path` with a
   non-string/empty member → truncated at the first invalid member (earlier
   valid segments retained), never throws.
5. **Malformed `tags`:** a non-array `tags` → `[]`; non-string members are
   filtered; never throws.
6. **Missing root (handler, A1/F3):** a `doc-head` edge whose target root is
   absent from `listNodes()` but whose edge survives (never loaded — the
   `createSnapshotStore` fixture) → the entry has `path: []`, `tags: []`; NO
   throw. A root QUARANTINED after a tampered hash is the stronger real-store
   case: the store quarantines the `doc-head` EDGE too, so the handler sees no
   edge and emits `{ documents: [] }` (F3).
7. **Malformed doc-head edge (handler, A2):** a `doc-head` edge with a
   missing/`undefined`/empty `target` → SKIPPED before the root read; no
   phantom entry, no crash (the Unit V3 MED-1 guard preserved).
8. **Deterministic sort tiebreak (A5):** a folder and a document sharing both
   `label` and full id → the folder sorts before the document; the order is
   total and repeatable (no `undefined` comparator path).
9. **Prefix-selection malformed input:** a non-array `prefix` behaves as `[]`
   (all docs); a non-array `docs` → `[]`; never throws.
10. **Prefix no-match:** a non-empty prefix no document's path begins with →
    `[]`.
11. **Legacy path never id-split (C9, A6):** a document with `documentId:
    'S:a/readme'` and an absent root `documentPath` → `path: []` (NOT
    `['S:a']`, NOT `['a']`); a non-empty prefix does NOT select it.
12. **Read-only (A9):** the handler + tree helpers perform no store write and no
    Electron/`fs` access; the only store calls are the read methods.
13. **No aliasing (A8):** mutating an emitted entry's `path`/`tags` (or a
    returned tree's leaf `tags`) does NOT mutate the store node's arrays (the
    handler spreads; the store already deep-copies).

### 5.8 Census / numeric claims

- **`RagDocHeadsPayload.documents` entry fields:** 2 → **4** — `documentId`,
  `title`, plus the NEW `path`, `tags` (both required, `[]` default).
- **New IPC channels:** 0. **New bridge methods:** 0. **New MCP tools:** 0
  (`rag.list_documents` is U-D5). **New edit ops:** 0 (`edit.set_doc_meta` is
  U-D7). **New `RagNode` fields:** 0 (U-D1 landed them). **New store/journal/
  traversal changes:** 0.
- **New pure module:** 1 — `src/shared/document-tree.ts`.
- **New exported functions:** 2 — `buildDocumentTree`,
  `selectDocumentIdsByPathPrefix`.
- **New exported types:** 4 — `DocHead` (the payload-entry alias),
  `DocumentTreeNode`, `DocumentFolderNode`, `DocumentLeafNode`.
- **New runtime sets:** 0.
- **Source files changed:** 6 — `src/shared/types.ts`,
  `src/main/mcp-server.ts`, `src/shared/document-tree.ts` (NEW),
  `src/renderer/pane-registry.ts`, `src/renderer/pane-graph.ts` (the
  `deriveDocNavDocuments` param narrowing), and `src/main/adjacency.ts` (the
  F4-followup `copyNode` array guard). `src/main/main.ts`,
  `src/main/preload.ts`, `src/renderer/sidebar-panes.ts`: 0.
- **Tree node kinds:** 2 — `folder`, `document` (no new RAG node/edge kind).
- **Persisted tree/document section:** 0 (the tree is DERIVED).
- **Sort:** the handler sorts by `documentId` (`localeCompare` ascending,
  stable); the tree sorts siblings by `label`, then full id, then folder-first
  (stable, total).

### 5.9 Cross-references

- **Gate:** `docs/specs/document-directory-category-review.md` (M7/M13/M16 + the
  U-D4 row in §5; Q2/Q3/Q7; F8) and `docs/decisions.md` row
  **DOC-DIRECTORY-CATEGORY-GATE** (PROCEED-WITH-AMENDMENTS, RATIFIED
  2026-09-11).
- **Parent (GATED):** `docs/specs/document-directory-category.md` §3.4 (the
  listing + derived tree + category-scoped selection), §3.7 (read-surface-only
  backfill; no re-hash/rewrite), §4 (F8 + the added fail-states), §5 (the UI
  coupling risk).
- **Precedent / consumed (LANDED):** `docs/specs/unit-ud1-document-metadata-fields.md`
  §5.1 (`documentPath?`/`tags?` + `[]`→omitted), §5.3 (copy paths);
  `docs/specs/unit-ud3-import-path-id-scheme.md` §5.3 (the path-qualified
  `/`-joined `documentId`), §5.4 (the root-only `documentPath` set). The
  root/section split this unit reads: `src/main/markdown-parse.ts:602`.
- **Consumed (LANDED):** `docs/specs/unit-v3-doc-heads-docnav.md` §5.1 (the
  `rag-doc-heads` IPC + payload this unit widens), §5.2 (`PaneContext.docHeads`),
  §5.3 (`deriveDocNavDocuments`/`docNavContent`), §5.4 (the host
  `lastDocHeads` cache); §3a MED-1 (the malformed-edge skip preserved).
- **Decisions:** `docs/decisions.md` rows **DOC-DIRECTORY-CATEGORY-GATE**,
  **RAG-AUTHORITATIVE**, **SINGLE-WRITER-STORE**, **DOC-HEADS-IPC**,
  **DOC-NAV-DOCHEADS**, **HOST-DOCHEADS-CACHE**.
- **Downstream units (NOT this spec):** U-D5 (`rag.list_documents`), U-D6
  (query filters), U-D7 (`edit.set_doc_meta`), and ui-overhaul G2 (the doc-nav
  tree UI — consumes `path`/`tags` + `buildDocumentTree`).
- **Host patterns:** `src/shared/types.ts` (`RagDocHeadsPayload`),
  `src/main/mcp-server.ts:865-896` (`handleRagDocHeadsIpc`),
  `src/renderer/pane-registry.ts:30` (`PaneContext.docHeads`),
  `src/renderer/pane-graph.ts:159-206` (`deriveDocNavDocuments`/`docNavContent`),
  `src/renderer/sidebar-panes.ts:379` (`lastDocHeads`), and the NEW
  `src/shared/document-tree.ts`.

## 6. Test plan (the red set the TestWriter will write)

The TestWriter writes the red set from §5.6/§5.7 BEFORE any implementation. The
red set (recorded in the next-steps DONE row for this unit):

- **`src/shared/document-tree.ts` (NEW, pure):** §5.6 states 7-15 (flat/nested/
  deep, sort, segment-also-document, tags/title, prefix selection incl. empty
  prefix) + §5.7 states 1-5, 8-11 (F8, malformed container/entry/path/tags,
  tiebreak, malformed prefix, no-match, legacy no-id-split) — all without
  Electron/store.
- **`src/main/mcp-server.ts` (`handleRagDocHeadsIpc`):** §5.6 states 1-6 +
  §5.7 states 6-7, 12-13 (root read, `[]` defaults, missing/quarantined root,
  malformed edge, read-only, no aliasing).
- **`src/shared/types.ts`:** the payload census (§5.6 state 1) — the entry
  shape exposes the four required fields.
- **Renderer reconciliation:** §5.6 states 16-17 (`buildContext().docHeads`
  carries `path`/`tags`; `deriveDocNavDocuments` still returns the flat list;
  legacy displays root-level) + the sanctioned fixture updates in §5.5.
- **Post-green gates (per AGENTS.md):** the adversarial pass (§3a) records its
  findings in this spec; the blind-greens writer produces a scenario artifact
  from this spec + `docs/specs/unit-ud4-doc-heads-tree-greens.md` (created with
  the greens); the documentation review reconciles this spec, the trackers, and
  the Unit V3 spec's superseded payload shape.
