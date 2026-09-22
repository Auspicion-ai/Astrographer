# Document Directory / Category Structure — Implementation Spec (GATED)

**Status:** GATED 2026-09-11 — **PROCEED-WITH-AMENDMENTS**, see
`docs/specs/document-directory-category-review.md`. **U-D1…U-D7 ALL LANDED
(2026-09-11/12) — the slice is COMPLETE.** The U-D8 doc-nav tree UI is the
consumer, carved out to ui-overhaul G2 (ratified 2026-09-11); no other unit
remains in this slice. **Document-only — no code.**
The three-agent proposal gate (AGENTS.md item 8: validity → critique →
change-analysis) has run; the review is authoritative for the resolved
decisions (Q1–Q9), the must-fix amendments (M1–M16), and the corrected unit
decomposition (U-D1…U-D8). §3 below pins the *proposed* contract (read it with
the review's amendments); §6 the draft unit decomposition (superseded by the
review §5); §7 the decisions (now RESOLVED).

It is separated from the UI overhaul (`docs/specs/ui-overhaul.md` C15/§3.3):
that spec's doc-nav **tree** is a *consumer* of this slice and lands after it.
C15 in the UI spec now points here.

---

## 1. Finding — the local document model is flat

Verified against the build (2026-09-11):

- `documentId` is the **sanitized basename** of the imported file
  (`src/main/markdown-import.ts:316`); `sanitizeDocumentId` maps every
  non-`[a-zA-Z0-9._-]` character to `-` (`:69-76`), so the corpus-relative
  directory is **discarded**.
- `RagNode` (`src/main/rag-store.ts:100-117`) has no `path`/`category`/`tag`;
  the stored hash source is the fixed order
  `id, type, content, nodeKind, children, props, ownedNodeIds, createdAt, updatedAt`
  (`:364-371`).
- The only structures today: `doc-flow` linear edges (`doc-head`/`next-section`/
  `doc-end`), `doc-child` *intra*-document nesting (`RagEdgeKind`, `:123-129`
  and `doc-flow.ts`), the multi-store registry names, and — on the **external**
  Gnosis engine — `wikiId` + `tags: string[]`
  (`src/main/engine-crud-rag-store.ts:84,91,108-150`).
- Net consequence: two files `a/readme.md` and `b/readme.md` both mint
  `documentId = 'readme'` and the second is **rejected as a duplicate**
  (`markdown-import.ts:348-350`). Nested corpora with repeated basenames cannot
  be imported, and no UI/tool can group documents.
- **No local create-document tool.** The local surface has no `create_document`:
  documents are minted only by `edit.import_markdown` (corpus import).

> **Line-ref note (post-U-D1, 2026-09-11):** the `RagNode`/`nodeSource` line refs
> above are the PRE-U-D1 build state (a correct finding at gate time). After Unit
> U-D1 landed the fields, `RagNode` is `:100-126` and `nodeSource` is `:373-383`
> (11-field order incl. `documentPath`/`tags`).
  `edit.create_node` + `edit.set_edge` can hand-assemble a root + doc-flow
  edges, but there is no atomic "new document" op. (The **external** Gnosis
  engine does have `gnosis.document.create` + `gnosis.wiki.create`.)
- **No directory concept or create tool anywhere.** No `create_directory`/
  folder tool on any surface; `mkdirSync` appears only in host persistence
  (settings/template/security/registry/rag-store/engine-config/module-store),
  never exposed as a tool. The only existing grouping is the Gnosis `wiki`.

---

## 2. What the proposal asks

A **directory/category structure for documents**:

1. A primary **corpus-relative path** (single-parent directory tree) preserved
   at import and shown as a tree.
2. Optional multi-valued **tags** for cross-cutting categories.
3. A way to list/query by category, and to navigate the hierarchy.

---

## 3. Proposed contract (draft)

### 3.1 Model — additive first-class fields on the document root node

The **document root node** (`RagNode.id === documentId`) is the document
identity (the `doc-head` edge target, `markdown-parse.ts:602`). Extend `RagNode`
with two **OPTIONAL, ADDITIVE** fields (the `nodeKind`/`children` precedent):

```ts
export interface RagNode {
  // ...existing...
  /** C15 — the corpus-relative directory segments of a DOCUMENT ROOT node.
   *  OPTIONAL/ADDITIVE: absent = a root-level document (the v1 default).
   *  Meaningful only on a document root (id === documentId); ignored elsewhere. */
  documentPath?: string[]
  /** C15 — multi-valued categories on a DOCUMENT ROOT node. OPTIONAL/ADDITIVE:
   *  absent = untagged (the v1 default). */
  tags?: string[]
}
```

- **Hash-neutral for existing records.** `nodeSource` (`rag-store.ts:364-371`)
  gains `documentPath`/`tags`; `JSON.stringify` omits `undefined`, so a node
  without them hashes **byte-identically** to today (the `CHILDREN-ADDITIVE-
  STORE-FORMAT` precedent, `docs/decisions.md`). No re-hash, no migration of the
  hash.
- **Validation** (per-record shape): `documentPath` an array of non-empty
  strings; `tags` an array of non-empty strings, deduped. A malformed shape on
  load is handled like the existing field guards (skip/quarantine per the
  current policy) and documented as a fail-state.
- **Rejected alternative:** a separate store-file `documents: DocumentMeta[]`
  section. Cleaner separation, but adds a second persisted section + its own
  hash/migration; the root-node fields reuse the existing additive machinery.
  Recorded for the gate.

### 3.2 Id scheme — path-qualified `documentId` (flat string, `/`-joined)

Keep `documentId` a **single flat string**, but make it the corpus-relative
path, not just the basename:

- Each **directory** segment is `sanitizeSegment(segment)` (no extension
  stripping); the basename is `sanitizeDocumentId(basename)` (it strips
  `.md`/`.markdown`); the sanitized segments are joined with `/` (M4 / U-D3).
- **Flat corpora are byte-equal:** a file at the corpus root yields the empty
   directory path ⇒ `documentId === basename` (today's value). A nested file
   `a/readme.md` ⇒ `documentId = 'a/readme'` (directory-only
   `documentPath = ['a']`; the basename is the final `documentId` segment, not a
   member of `documentPath`). Pinned by M1.
- **Collisions resolved:** `a/readme` and `b/readme` are distinct.
- **Segment sanitization (gate M4 — do NOT relax `sanitizeDocumentId`).** Add a
  separate `sanitizeSegment` for directory segments (no `.md` extension-stripping)
  and keep basename sanitization separate; sanitize per segment, then join with
  `/`. Normalize `path.sep`→`/`.
- **Namespace preserved:** the non-default-store `<name>:` prefix is unchanged
  (`<name>:a/readme`); `:` remains the store separator (replaced with `-` in
  segments). The A1 collision check (`documentId === store name`,
  `markdown-import.ts:332`) still compares the whole string.
- **Addressing:** `/` is valid in DOM `id` attributes and `getElementById`; the
  `rag-<id>` render convention is unaffected. Rule (M14): never interpolate a
  `documentId` into a raw CSS selector; `CSS.escape` only if a raw selector is
  ever added.

### 3.3 Import

`importMarkdownCorpus` (`markdown-import.ts`):

- Derive `documentPath` = the segments of `dirname(file)` relative to
  `corpusRoot`, each sanitized.
- Mint `documentId` per §3.2; set `documentPath` on the document root node.
- **Containment unchanged:** absolute-file resolution + `isWithin(real,
  corpusRootReal)` (`:234-242`) are untouched; a directory cannot escape the
  root.
- **`<name>:` collision and duplicate checks** run on the final `/`-joined id
  (message echoes the final id), unchanged in shape.
- **Tags at import:** out of scope for the first slice unless markdown
  front-matter parsing is added (a separate decision, §7 Q4). Tags are settable
  via the edit surface (§3.5).
- **Flat-corpus byte-equality is a binding acceptance criterion** (the A4
  precedent): an existing flat corpus re-imports to byte-identical ids/nodes.

### 3.4 Listing, traversal, grouping

- `RagDocHeadsPayload.documents` (`shared/types.ts:532-535`) gains
  `path: string[]` and `tags: string[]` (document root fields; `[]` when absent).
- The category **tree is DERIVED** by prefix-grouping `documentPath` in a pure
  helper (no new node/edge kinds; no category-node tree — that alternative is
  recorded, §7 Q2).
- `computeDocumentSubgraph`/`buildTraversal` scoping (`traversal.ts`) is
  unchanged; a **category-scoped** load is a selection over the doc-heads tree
  (load all documents whose `documentPath` has a given prefix) — an additive
  caller, not a traversal change.

### 3.5 MCP surface

- **Read:** a read-only `rag.list_documents` tool returning the doc-heads with
  `path`/`tags` (or extend the existing listing). This is document metadata, not
  a store census — the `UI-SELECTOR-DEFERRED` "no store-census tool" rationale
  (`docs/decisions.md`) does **not** apply.
- **Filter:** extend `rag.query` `filters` with `documentPathPrefix?: string[]`
  and `tags?: string[]` (additive; `filters` is already optional).
- **Write (gate M9):** a first-class `edit.set_doc_meta` edit op writes `tags`
  only, **outside** the closed-7 `BatchOp` union (`BATCH-ATOMICITY-API`); path is
  **import-minted and immutable in v1**. `setProps` cannot write top-level tags
  (it merges `node.props`). Group-gated under `edit` (`gnosis-edit` deferred with
  Q6). The metadata delta must be journal-invertible (M2).
- **Gnosis mapping (gate Q6):** **local-only v1** — a Gnosis `wiki` is a flat
  single-parent bucket with a single-string tag filter, so a local tree cannot
  round-trip. Parked for a later slice (`docs/pending.md`).

### 3.6 Security

No new credential/CSP surface. Category/tag writes are authorized by the
existing `edit` group (`security.ts`); reads by `rag`. Category names are
document metadata, not secrets or store names.

### 3.7 Migration

- Existing documents have no `documentPath`/`tags`: derived as root-level
  (directory-only `documentPath = []`, display the basename alone) / untagged.
  **Additive — no re-hash, no rewrite.**
- Optional backfill: derive `documentPath` from the flat `documentId` (single
  segment) **at the READ surface only** (the doc-heads listing / `rag.list_documents`);
  never in the store's public node copy, so a later `putNode({...node})` edit
  cannot persist it (M13).
- A store with no `documentPath`/`tags` anywhere loads and verifies exactly as
  today (the binding acceptance criterion).

### 3.8 Creation ops — OPEN (not in the gated unit set)

**Question (Architect, 2026-09-11): are there existing tools to create a new
document / directory?** Answer: **no local ones.**

- **Documents:** the local surface mints documents **only** via
  `edit.import_markdown` (corpus import). There is no `create_document`.
  `edit.create_node` + `edit.set_edge` can hand-assemble a root + doc-flow
  edges, but not atomically. The **external** Gnosis engine has
  `gnosis.document.create` + `gnosis.wiki.create` (`gnosis`/`gnosis-edit`
  groups).
- **Directories:** no create-directory tool on any surface.
- The ratified gate decomposition **U-D1…U-D8** does not add either: U-D5 is
  read-only (`rag.list_documents`); U-D7 writes `tags` on an existing document
  (`edit.set_doc_meta`).

**Why it matters:** the UI-overhaul doc-nav **tree** (G2) needs *new document*
/ *new folder* affordances, and a **derived** directory model (M10/F8 — empty
branches dropped) cannot represent an **empty** directory at all.

**Options (needs an Architect ruling + likely a U-D9 unit and a gate addendum):**

1. **`edit.create_document`** — mints the root node (id = new `documentId`) +
   `doc-head`/`next-section`/`doc-end` + `documentPath`/`tags`, as ONE atomic
   `applyBatch` entry (the `edit.import_markdown` precedent). Mirrors
   `gnosis.document.create`. Group: `edit`.
2. **Directory creation is implicit** — creating a document at a path creates
   the branch. **Empty directories:** either disallow (derived-only, simplest)
   or add an explicit directory record/entity (reopens M1/M10 and the "no
   separate persisted section" decision Q2).
3. **Gnosis-backed stores** route creation through `gnosis.document.create`
   (Q6 mapping stays local-only v1 otherwise).

**Status:** OPEN — not part of U-D1…U-D8; record the ruling, then add the unit
spec + TestWriter red set before implementation (AGENTS.md item 9).

---

## 4. Fail-states / edge cases to pin

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | `documentPath`/`tags` malformed (non-array / non-string members / empty strings) | per-record guard: skip/quarantine per the existing policy; a load never throws on it |
| F2 | duplicate `/`-joined `documentId` | rejected with the existing byte-pinned duplicate message, on the final id |
| F3 | a segment sanitizing to `''` (e.g. a filename of only punctuation) | rejected (empty-segment) with a byte-pinned message |
| F4 | `..` / absolute path escaping the corpus root | containment check unchanged → rejected |
| F5 | two stores importing the same relative path | distinct via the `<name>:` prefix (unchanged) |
| F6 | a documentId that equals a registered store name | A1 collision check on the final id (unchanged) |
| F7 | tag list with duplicates / mixed case | case-sensitive, trimmed, deduped; `[]`→omitted (gate Q7) |
| F8 | a category with zero documents | not rendered (derived tree drops empty branches) |
| F9 | flat corpus re-import | byte-identical to today (binding) |
| F10 | old store (no fields) load + verify | byte-identical hashes (binding) |

**Additional fail-states to pin (gate M10):** aliasing (two distinct raw paths
sanitizing to the same segment) as an explicit fail-state, not a silent merge;
Unicode NFC/NFD + case-insensitive corpora; a non-ASCII directory sanitizing to
`''`; malformed/duplicate tags; off-root metadata writes (reject or document
ignored); a path segment that is also a document; leaf label + sibling sort.
See `document-directory-category-review.md` §3 M10.

---

## 5. Risks / blast radius

- **Store hash + format:** `nodeSource` change — mitigated by the `undefined`
  omission (additive). Requires a hash round-trip test (old record verifies).
- **Id minting census:** `sanitizeDocumentId` + the full minting/indexing census
  (`markdown-parse.ts:444,448,558,565,576,596,602-606,609`;
  `markdown-import.ts:316,332,345,348` — M6) and the `<name>:` namespace — a
  `/`-bearing id flows through addressing/CSS. Do **not** relax
  `sanitizeDocumentId`; add a separate `sanitizeSegment` (M4).
- **Addressing:** `rag-<id>` selectors and `getElementById` must handle `/`
  (escape rule pinned).
- **MCP surface:** new tool + `filters` fields touch `ALL_TOOLS`/`TOOL_GROUPS`
  and the five-seam-gate reconciliation.
- **UI coupling:** the doc-nav becomes a tree (UI-overhaul G2 consumes this);
  ship the data model first.

---

## 6. Proposed unit decomposition (SUPERSEDED — see review §5)

> **Gate outcome (2026-09-11):** this D1–D6 decomposition is superseded by the
> corrected **U-D1…U-D8** in `document-directory-category-review.md` §5 (D1 split
> model/journal, D4 split listing/filters, migration folded into acceptance rows,
> the UI unit moved to ui-overhaul G2). Kept for provenance.

1. **D1 — model + store additive fields.** `RagNode.documentPath`/`tags`,
   `nodeSource` (additive), shape validation, hash round-trip (F1/F10),
   malformed guards.
2. **D2 — import path retention + id scheme.** `sanitizeDocumentId` `/`-
   preservation + per-segment sanitize, segment join, `documentPath` set at
   import, collision/duplicate/containment (F2–F6, F9).
3. **D3 — doc-heads listing + category tree.** `RagDocHeadsPayload` fields +
   the pure prefix-grouping tree helper + category-scoped selection (F7/F8).
4. **D4 — MCP read surface.** `rag.list_documents` (+ `rag.query` `filters`
   extension) with the group rows + gate reconciliation.
5. **D5 — tag mutation.** the `setDocMeta`/`setProps` write path (tags only;
   path immutable in v1), group-gated.
6. **D6 — doc-nav tree UI** (or fold into the UI-overhaul G2 unit) — consumes
   D1–D3; lands last.

Each unit is delegated separately; no unit shares a red→green run (AGENTS.md
item 2/RCA-2).

---

## 7. Decisions (RESOLVED by the gate — see review §4)

| Q | Question | RESOLVED |
| --- | --- | --- |
| **Q1** | Flat vs path-qualified `documentId` | **Path-qualified**, `/`-joined; `documentPath` = directory segments only; flat corpora byte-equal. **Explicitly supersedes the `ui-overhaul.md` §3.3/Q13 draft flat-id default** (review §4 Q1). |
| **Q2** | Root-node fields vs a separate `DocumentMeta` section vs a category-node tree | Root-node additive fields; tree derived; no persisted `documents:` section. |
| **Q3** | Single primary path vs multi-category | Single `documentPath` + multi-valued `tags`. |
| **Q4** | Tags from markdown front-matter at import? | Out of scope v1. |
| **Q5** | Tag mutation op: new `setDocMeta` vs `setProps` on the root | First-class `edit.set_doc_meta` **outside** the closed `BatchOp` union (M9); `setProps` cannot write top-level tags. |
| **Q6** | Gnosis mapping: directory → `wiki`, or local-only | **Local-only v1** (a wiki is a flat single-parent bucket; no round-trip). |
| **Q7** | Tag case-sensitivity / normalization | Case-sensitive, trimmed, deduped; `[]`→omitted. |
| **Q8** | Path mutability | Immutable in v1, enforced at the op boundary. |
| **Q9** | Selector escaping for `/`-bearing ids | No action today: no `querySelector` in `src/`, `getElementById` is Map-backed. Rule: never interpolate a `documentId` into a raw selector (M14). |

---

## 8. Cross-references

- **`docs/specs/document-directory-category-review.md`** — the three-agent gate
  outcome (PROCEED-WITH-AMENDMENTS): authoritative for M1–M16, the resolved
  Q1–Q9, and the corrected U-D1…U-D8 decomposition.
- `docs/specs/ui-overhaul.md` C15/§3.3 (the consumer: doc-nav tree, category UI;
  §3.3/Q13's flat-id default is superseded by review §4 Q1).
- `docs/decisions.md`: `RAG-AUTHORITATIVE`, `CHILDREN-ADDITIVE-STORE-FORMAT`,
  `CHILDREN-HASH-SOURCE`, `BATCH-ATOMICITY-API`, `UI-SELECTOR-DEFERRED`,
  `GNOSIS-CRUD-SURFACE-CONFIRMED`.
- `docs/specs/unit-m-children-field.md` (the additive-store-format precedent),
  `unit-t-markdown-import.md` (the import seam), `unit-ms4-id-prefixing.md`
  (the minting census + `<name>:` namespace), `unit-v1-store-adjacency.md`,
  `unit-v3-doc-heads-docnav.md` (the doc-heads listing).
- Engine: `src/main/rag-store.ts` (`RagNode`, `nodeSource`),
  `src/main/markdown-import.ts` (`sanitizeDocumentId`, the mint seams),
  `src/main/markdown-parse.ts`, `src/main/doc-flow.ts`,
  `src/main/traversal.ts` (`computeDocumentSubgraph`),
  `src/main/engine-crud-rag-store.ts` (Gnosis `wikiId`/`tags`),
  `src/shared/types.ts` (`RagDocHeadsPayload`).
