# Spec — Unit T: Markdown File Import (Initial-Ingestion Corpus → RAG Store)

- **Status:** SPEC (the markdown file import feature — the initial-ingestion
  framing, per the PROCEED-WITH-AMENDMENTS gate verdict and the user's ADJUSTED
  SCOPE). Gate reference: `docs/specs/markdown-import-review.md` §4 (the 11
  amendments + the ADJUSTED SCOPE), §5 (the decision record). Decisions:
  `docs/decisions.md` rows **RAG-AUTHORITATIVE**, **SUBTREE-OWNERSHIP**,
  **MARKDOWN-EXPORT-ONLY**, **SINGLE-WRITER-STORE**, **PROJECT-JOURNAL**,
  **DERIVED-DOC-FLOW**, **DOC-CHILD**, **CROSS-DOCUMENT-SHARED**,
  **STRUCTURAL-ROOT**, **MCP-UI-EQUIVALENCE**.
- **Scope:** the markdown file import feature — a DISTINCT sanctioned flow that
  parses a corpus of markdown files (including the project's own `docs/*.md`
  tree) into RAG nodes + edges from scratch, and writes them into the RAG store
  as a ONE-WAY SNAPSHOT through `applyBatch` as ONE atomic batch journal entry.
  This unit pins: the markdown→RAG-node parser grammar (a net-new pure module),
  the importer's own deterministic heading→section chunking rule, the
  document-root/document-id convention, the inline-children parse (reusing the
  Unit S flattening discipline), the additive `table`/`thead`/`tr`/`td`/`th`
  `RagNodeType` change, the one-shot (no re-import) semantics, the
  markdown-specific security surface + default-off five-seam gating, the
  `ownedNodeIds` population, the MARKDOWN-EXPORT-ONLY carve-out, and the
  `validateDocFlow`-before-commit write-back surface. This unit does NOT
  implement round-trip diffing (DO-NOT-PROCEED), does NOT change the traversal
  (Unit C), the retrieval index (Unit E), the edit ops (Unit O), or the
  renderer. It is the import contract the store + the `edit.import_markdown`
  tool build on.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for the new
  `src/main/markdown-parse.ts` (the `parseMarkdown` function + the
  `ParsedMarkdown` type + the parser grammar + the chunking rule + the
  inline-children parse) and the new `src/main/markdown-import.ts` (the
  `importMarkdownCorpus` function + the `ImportMarkdownParams`/
  `ImportMarkdownResult` types + the doc-flow validation + the `applyBatch`
  routing) from §5.6/§5.7 before any implementation. The parser is PURE (no
  Electron, no file I/O), so its red set is node-testable; the importer's red
  set uses a temp-file corpus fixture.

---

## 1. What the proposal asks

The markdown file import feature (initial-ingestion framing) migrates an
existing markdown document store into the RAG engine — e.g. reading the
project's own `docs/*.md` documentation into the RAG so the agent can query it
and use the consistency-enforcement features. It parses existing markdown
documents (NOT yet in the RAG store) into RAG nodes + edges from scratch. It is
NOT round-trip diffing (that framing is DO-NOT-PROCEED) — it is a one-time
import of a document corpus into an empty (or partially-populated) RAG store.

**The ADJUSTED SCOPE (from the gate verdict §4):**

1. **Multi-document corpus ingestion** — import multiple markdown files in one
   import (a corpus), not just a single document.
2. **Allow the `docs/` corpus** — the RAG store becomes a **one-way snapshot**
   of `docs/*.md` (a point-in-time copy; edits go to the RAG store, never back
   to the source). This pins the two-source-of-truth externality (amendment 1)
   as a one-way snapshot.
3. **Table support** — add `table`/`thead`/`tr`/`td`/`th` to `RagNodeType` as
   part of this slice (an additive store-format change), instead of degrading
   tables lossily. This resolves the table gap (amendment 6) in-slice.
4. **Heading→section chunking** — the importer's own deterministic chunking
   rule: markdown headings → RAG section nodes; nested content → doc-children
   or inline children per the rule.
5. **One-shot** (no re-import/idempotency — amendment 7).
6. **Default-off `edit.import_markdown` tool** routed through `applyBatch` as
   one atomic batch journal entry (amendment 8/11).

## 2. Feasibility verdict

**Feasible — grounded in the already-landed modules.** The initial-ingestion
framing is architecturally sound as a mechanism, and the adjusted first slice
is buildable:

- **The parser is a coherent net-new pure module** (mirrors
  `sanitizePastedHtml` in `src/main/paste-sanitize.ts` — Unit S §5.1). It
  operates on a markdown string and produces RAG nodes/edges; it is PURE (no
  Electron, no file I/O), so it is node-testable.
- **The chunking mismatch is NOT a blocker** — the importer creates the store
  from scratch and defines its own deterministic heading→section rule (it need
  not match the default heuristic).
- **The document-root/document-id convention is derivable** — a synthetic root
  node type `div` + a filename-derived `documentId`; doc-head from the first
  heading, next-section by heading order, doc-end from the last section; must
  pass `validateDocFlow` (Unit B §5.2).
- **The inline parse reuses the Unit S flattening discipline** — inline
  markdown (`strong`/`em`/`a`/`img`) → `RagNodeChild[]`, nested inline flattened
  to siblings (Unit S §5.5).
- **The write-back surface is the right home** — a new `edit.import_markdown`
  tool, default-off, five-seam gating, routing through `applyBatch` (Unit N) as
  one atomic batch journal entry, with `validateDocFlow` before commit.
- **The table gap is resolved in-slice** — adding `table`/`thead`/`tr`/`td`/`th`
  to `RagNodeType` is an additive store-format change (the store's
  `RAG_NODE_TYPES` runtime set gains 5 members; existing records without these
  types still load).

No engine/foundation gap blocks this unit. The parser, the chunking rule, the
document-root convention, the inline parse, the security surface, and the
import tool are all **project-specific** (the RAG data model is host-side, per
`docs/decisions.md` ENGINE-GAP-HANDOFF). No handoff item is opened by this
unit. The round-trip-diffing framing remains DO-NOT-PROCEED.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The markdown→RAG-node parser grammar (which constructs map to which `RagNodeType`, which are dropped) | Project-specific (a net-new pure module `src/main/markdown-parse.ts`) | Medium cost; the load-bearing parser gap the gate flagged. |
| The importer's own deterministic heading→section chunking rule | Project-specific | Medium cost; the importer defines its own rule (need not match the default heuristic). |
| The document-root/document-id convention (synthetic `div` root + filename-derived `documentId` + doc-flow edges) | Project-specific | Low cost; must pass `validateDocFlow`. |
| The inline-children parse (markdown inline → `RagNodeChild[]`) | Project-specific (reuses the Unit S flattening discipline) | Low cost; the inline parse reuses the Unit S discipline. |
| The additive `table`/`thead`/`tr`/`td`/`th` `RagNodeType` change | Project-specific (an additive store-format change) | Low cost; resolves the table gap in-slice (no lossy degradation). |
| The one-shot semantics (no re-import/idempotency) | Project-specific | Low cost; a re-import duplicates (documented, not refused). |
| The markdown-specific security surface + default-off five-seam gating | Project-specific (mirrors the Unit S URL-safety + the Unit B gating) | Low cost; reuses the Unit S URL-safety rules + the Unit B five-seam gate. |
| The `ownedNodeIds` population (derived from the chunking rule) | Project-specific | Low cost; the importer derives it from its chunking rule. |
| The `validateDocFlow`-before-commit write-back surface | Project-specific (reuses Unit B §5.2) | Low cost; a doc-flow violation aborts the import (no partial application). |
| The one-way snapshot externality (the RAG store is a point-in-time copy of `docs/*.md`) | Project-specific (pins the two-source-of-truth externality) | Low cost; edits go to the RAG store, never back to the source. |

No engine gap. The round-trip-diffing framing (text-match diffing) is
DO-NOT-PROCEED — this unit is the initial-ingestion framing only.

### 3a. Adversarial findings (known edge cases the contract pins)

Post-green adversarial pass (RCA-3) — to be run after the unit lands. The known
edge cases this unit's contract already pins (so the adversarial pass must NOT
regress them):

- **A1 — the parser is TOTAL (never throws on malformed markdown).** A malformed
  markdown string (unclosed code fence, unbalanced heading, garbage) returns a
  best-effort `ParsedMarkdown` — it NEVER throws. The ONLY throw is a caller
  error (non-string markdown / empty documentId) (§5.1/§5.7).
- **A2 — the parser is PURE (no file I/O, no Electron).** `parseMarkdown` reads
  only its string inputs and returns a value; it never touches the filesystem.
  The importer (not the parser) reads files (§5.1).
- **A3 — a re-import is NOT idempotent (one-shot).** Because the parser's node
  ids are DETERMINISTIC (R1a), a re-import of the same corpus produces the SAME
  node ids and OVERWRITES the existing nodes/edges (upsert) — it does NOT create
  a second set. The importer does NOT detect existing nodes, does NOT dedupe,
  does NOT merge, and does NOT refuse a re-import; a re-import re-applies the
  batch over the same ids (§5.4/§5.7).
- **A4 — the importer NEVER writes back to the source files (one-way
  snapshot).** The source markdown files are read-only inputs; the importer
  performs NO write to them. Edits go to the RAG store only (§5.4).
- **A5 — a doc-flow violation aborts the WHOLE import (no partial
  application).** If ANY document in the corpus fails `validateDocFlow`, the
  import returns `{ ok: false }` and NO node/edge is applied (the batch is not
  submitted) (§5.5/§5.7).
- **A6 — a duplicate `documentId` across the corpus is a fail-state.** Two files
  whose filenames sanitize to the same `documentId` (e.g. `a.md` and `a.markdown`)
  abort the import (§5.4/§5.7).
- **A7 — unsafe URLs are neutralized (the Unit S URL-safety discipline).** A
  link with a `javascript:`/`vbscript:`/`data:` href is DEMOTED to plain text; an
  image with an unsafe `src` is DROPPED. No unsafe URL survives into a child's
  `props` (§5.4/§5.7).
- **A8 — raw HTML is DROPPED, never rendered.** The importer does NOT render raw
  HTML into the RAG store; an HTML block or inline HTML tag is dropped entirely
  (the element AND its content). This is a MARKDOWN-SPECIFIC rule STRICTER than
  the Unit S disallowed-element discipline (Unit S §5.5 unwraps non-disallowed
  elements and preserves their content; the importer drops ALL raw HTML, element
  + content, with no unwrapping) (§5.4/§5.7).
- **A9 — prototype-pollution keys are rejected.** A parsed node/child carrying a
  `__proto__`/`constructor`/`prototype` key fails the store's write-time
  validation (the batch rolls back) (§5.4/§5.7).
- **A10 — the parser is DETERMINISTIC.** The same markdown + documentId ALWAYS
  produces the same `ParsedMarkdown` (no randomness, no time, no environment
  dependence) (§5.1).
- **A11 — the `edit.import_markdown` tool is default-off.** It is callable only
  when the `edit` group is enabled; with only `code`/`read`/`dispatch` enabled it
  is not registered (§5.5).
- **A12 — a table with a malformed row is handled leniently.** A GFM pipe table
  with a malformed row (e.g. a row with fewer cells than the header) is parsed
  best-effort (the cells that exist become `td`/`th` nodes; a fully malformed
  table is dropped) — never a throw (§5.2/§5.7).

The adversarial pass findings (host findings, fixed + regression-tested) are
recorded here. All findings are HOST findings (this repo's `src/`); none are
PACKAGE findings, so none are catalogued in `docs/defects.md`/`docs/HANDOFF.md`.

**Post-green adversarial pass (RCA-3, 2026-08-28) — two focused passes
(security + edge-cases). All findings FIXED + regression-tested:**

| # | Severity | Finding | Fix |
| --- | --- | --- | --- |
| ADV-1 | CRITICAL | `corpusRoot` was exposed as an MCP tool arg, defeating the path-containment seam → an enabled `edit` group could read arbitrary files by setting `corpusRoot` to the target's parent dir. | Removed `corpusRoot` from the tool schema + handler; the containment root is FIXED server-side (the project root). The importer function still accepts `corpusRoot` for programmatic/test use. |
| ADV-2 | MEDIUM | TOCTOU: the importer realpath-checked the file but read the LOGICAL path — a swap to a symlink between check and read could escape containment. | The importer now reads the REALPATH'D path (`readFileSync(real)`), closing the swap window. |
| ADV-3 | LOW/MEDIUM | An UNCLOSED inline raw-HTML element (e.g. `<script>alert(1)` with no close) left its content as plain text — A8 not fully enforced. | The inline handler now drops the content through end-of-input when no close tag is found. Regression test 10a. |
| ADV-4 | LOW | The tool's zod schema did not enforce "non-empty array of non-empty strings". | Schema is now `z.array(z.string().min(1)).min(1)`. |
| ADV-5 | LOW | `isWithin` rejected everything when the root is `/` (`root + sep` = `//`). | The predicate now handles the root-is-`/` case. |
| ADV-6 | HIGH | `String.fromCodePoint` threw a RangeError on a numeric HTML ref with a code point > 0x10FFFF (e.g. `&#xFFFFFFFF;`) — violated TOTAL. | Guarded `code > 0x10ffff` before `fromCodePoint`. Regression test 10b. |
| ADV-7 | HIGH | Stack overflow (RangeError) on a deeply nested blockquote (`> > > … > x`) — violated TOTAL. | Added `MAX_BLOCK_DEPTH`; a blockquote nested beyond the cap is flattened to a paragraph. Regression test 10c. |
| ADV-8 | HIGH | Stack overflow (RangeError) on deeply nested inline (`**…**`/`*…*`/`[a[b](c)](d)`) — violated TOTAL. | Added `MAX_INLINE_DEPTH`; beyond the cap the inner content is treated as plain text. Regression test 10d. |
| ADV-9 | MEDIUM | A re-import of a SHORTENED doc leaves stale nodes/edges orphaned (not a clean snapshot). | Documented as a KNOWN LIMITATION of the one-shot design (§5.4) — not a defect; re-import to update is out of scope (amendment 7). |

### 3b. Proposal-review findings

The proposal-review gate (three-agent: validity → critique → change-analysis)
was run TWICE on the markdown file import proposal
(`docs/specs/markdown-import-review.md`):

| Framing | Verdict |
| --- | --- |
| Round-trip diffing (original) | **DO-NOT-PROCEED** — the diffing mechanism is incoherent (the diff surface is undefined, the content↔children boundary is unrecoverable, no diffing engine exists); it contradicts three ACTIVE decisions. |
| Initial ingestion (re-run, grounded in the user's concrete use case) | **PROCEED-WITH-AMENDMENTS** — feasible as a minimal first slice; NOT buildable as the full feature as written. Conditional on the user's go-ahead. |

The consolidated verdicts for the initial-ingestion framing:

| Review | Verdict |
| --- | --- |
| Validity | VALID-WITH-AMENDMENTS |
| Critique | UNSOUND (as written) |
| Architecture | SOUND-WITH-AMENDMENTS |
| Change-analysis | PROCEED-WITH-AMENDMENTS |

**The 11 amendments (each cross-referenced to the section that resolves it):**

1. **CRITICAL — the two-source-of-truth externality pinned as a ONE-WAY
   SNAPSHOT** (§4/§5.4): the RAG store is a point-in-time copy of the imported
   corpus; edits go to the RAG store, never back to the source.
2. **HIGH — the markdown→RAG-node parser grammar** (§5.2): which markdown
   constructs map to which `RagNodeType` members, and which are dropped. A
   net-new pure module.
3. **HIGH — the importer's own chunking rule** (§5.2): deterministic; need not
   match the default heuristic.
4. **HIGH — the document-root/document-id convention** (§5.2): synthetic root
   node type `div` + a filename-derived `documentId`; doc-head from the first
   heading, next-section by heading order, doc-end from the last section; must
   pass `validateDocFlow`.
5. **MEDIUM — the inline-children parse** (§5.3): markdown inline syntax →
   `RagNodeChild[]`, reusing the Unit S flattening discipline.
6. **MEDIUM — the table gap resolved IN-SLICE** (§5.2/§5.8): add
   `table`/`thead`/`tr`/`td`/`th` to `RagNodeType` (an additive store-format
   change).
7. **MEDIUM — idempotency pinned as ONE-SHOT** (§5.4): no re-import.
8. **MEDIUM — the security surface** (§5.4): markdown-specific sanitization +
   default-off five-seam gating.
9. **LOW — `ownedNodeIds` population** (§5.2): the importer derives it from its
   chunking rule.
10. **LOW — the MARKDOWN-EXPORT-ONLY carve-out** (§4): initial ingestion is a
    distinct sanctioned flow.
11. **LOW — `validateDocFlow` before commit** (§5.5): on the write-back surface.

**The ADJUSTED SCOPE (user decision, 2026-08-28)** broadens the first slice to:
multi-document corpus ingestion (including the `docs/` tree as a one-way
snapshot), heading→section chunking, table support (additive `RagNodeType`
change), one-shot (no re-import), default-off `edit.import_markdown` tool
routed through `applyBatch` as one atomic batch journal entry.

## 4. Design decisions pinned by this spec

- **ONE-WAY-SNAPSHOT (amendment 1):** the RAG store is a point-in-time copy of
  the imported corpus. Edits go to the RAG store, never back to the source. The
  source markdown files are read-only inputs; the importer performs NO write to
  them. A subsequent change to a source file does NOT propagate to the RAG
  store (one-shot, no re-import). This pins the two-source-of-truth externality
  as a one-way snapshot.
- **MARKDOWN-EXPORT-ONLY CARVE-OUT (amendment 10):** markdown remains
  EXPORT-ONLY for round-trip edits (MARKDOWN-EXPORT-ONLY, §11). Initial
  ingestion is a DISTINCT sanctioned flow: it creates RAG nodes/edges from a new
  corpus and routes through the single-writer store + validation + journal. It
  does NOT treat the MarkdownAdapter export as an edit surface. The line→node
  map is a READ/assembly aid, explicitly NOT a write-back path.
- **RAG-AUTHORITATIVE (consumed):** the RAG store is the persistent source of
  truth. The imported nodes/edges are written into the store; the provident
  graph is a transient render materialization (Unit C).
- **SUBTREE-OWNERSHIP (consumed):** a RAG object owns a subtree. The importer
  derives each node's `ownedNodeIds` from its chunking rule (amendment 9); the
  traversal (Unit C) later replaces it with the provident-node-id form.
- **SINGLE-WRITER-STORE (consumed):** the import routes through `applyBatch`
  (Unit N), serialized through the single-writer queue as ONE atomic batch
  journal entry.
- **PROJECT-JOURNAL (consumed):** a successful import lands as ONE `batch`
  journal entry (invertible — undo/redo restores the whole import as a unit).
- **DERIVED-DOC-FLOW (consumed):** the importer constructs the doc-flow edges
  (doc-head/next-section/doc-end) and validates them with `validateDocFlow`
  (Unit B §5.2) before commit.
- **DOC-CHILD (consumed):** nested semantic units (a paragraph-length `li`
  inside a `ul`, a `tr` inside a `table`) are their own RAG objects, doc-children
  of the containing RAG object.
- **CROSS-DOCUMENT-SHARED (consumed):** each imported document's doc-flow edges
  carry `documentIds: [<documentId>]` (one owner per document).
- **STRUCTURAL-ROOT (consumed):** the synthetic document root is a `div` node
  (a structural grouping container).
- **MCP-UI-EQUIVALENCE (consumed, §8.2 BINDING):** the `edit.import_markdown`
  tool is main-handled and routes through the single-writer store, exactly like
  the other `edit.*` tools.

## 5. The exhaustive contract

### 5.1 The parser module + the importer module (signatures + return shapes)

**The parser — a net-new PURE module `src/main/markdown-parse.ts`** (mirrors
`sanitizePastedHtml` in `src/main/paste-sanitize.ts` — Unit S §5.1). It operates
on a markdown string + a `documentId` and produces RAG nodes/edges. It is PURE
(no Electron, no file I/O, no global state), DETERMINISTIC, and TOTAL (never
throws on malformed markdown).

```ts
// src/main/markdown-parse.ts — the PURE markdown→RAG-node parser. No Electron,
// no file I/O — it operates on a markdown string, so it is node-testable.

/** The parsed output of one markdown document: the RAG nodes + edges that
 *  represent it, plus the documentId they belong to. */
export interface ParsedMarkdown {
  /** The documentId (the document root node's id; the doc-flow edges' owner). */
  documentId: string
  /** The RAG nodes: the synthetic document root + the section nodes + the
   *  doc-child block nodes. */
  nodes: RagNode[]
  /** The RAG edges: the doc-flow edges (doc-head/next-section/doc-end) + the
   *  parent-child edges + the doc-child edges. */
  edges: RagEdge[]
}

/** Parse one markdown document into RAG nodes + edges per the parser grammar
 *  (§5.2) + the chunking rule (§5.2) + the inline-children parse (§5.3). PURE,
 *  DETERMINISTIC, TOTAL (never throws on malformed markdown). */
export function parseMarkdown(markdown: string, documentId: string): ParsedMarkdown
```

**Parser API rules (pinned):**

- **PURE:** `parseMarkdown` has NO Electron, NO DOM, NO file I/O, NO global
  state. It operates only on the `markdown` string + the `documentId` string and
  returns a value. It is node-testable in isolation.
- **DETERMINISTIC:** the same `markdown` + `documentId` ALWAYS produces the same
  `ParsedMarkdown` (A10).
- **TOTAL (never throws on malformed markdown):** for ANY string `markdown`
  (empty, garbage, unclosed code fence, well-formed), it returns a best-effort
  `ParsedMarkdown`. The ONLY throw is a caller error: a non-string `markdown` or
  a non-non-empty-string `documentId` → throws
  `Error('markdown parse: markdown/documentId required')` (A1).
- **Return shape:** `{ documentId, nodes, edges }`. `nodes` is a non-empty array
  (at minimum the synthetic document root). `edges` is a non-empty array for any
  document with at least one body block (at minimum the `parent-child`/`doc-child`
  edges for the body blocks); an EMPTY document (no heading, no body block)
  yields `edges: []` (only the root `div` node, zero edges). Every node/edge is a
  valid `RagNode`/`RagEdge` that passes the store's write-time validation (Unit A
  §5.1, amended by Unit M §5.4). **`ParsedMarkdown.documentId` === the input
  `documentId`** (the parser does NOT sanitize or alter it — the caller passes
  the already-sanitized `documentId`).
- **Heading-less document (TOTAL, no throw):** a document with NO heading (no
  ATX/Setext heading) produces the document root + the body blocks as doc-children
  of the root, with `parent-child`/`doc-child` edges but NO doc-flow edges (no
  `doc-head`/`doc-end`/`next-section`). `edges` is non-empty if there is at least
  one body block (it has the `parent-child`/`doc-child` edges); an EMPTY
  heading-less document yields `edges: []`. Such a document FAILS
  `validateDocFlow` (`missing-head`) → the import aborts (fail-state 6). The
  parser does NOT throw on a heading-less or empty document (A1).

**The importer — a net-new module `src/main/markdown-import.ts`** (reads files,
calls the parser, validates doc-flow, applies via `applyBatch`).

```ts
// src/main/markdown-import.ts — the importer. Reads the corpus files, parses
// each via parseMarkdown, validates each document's doc-flow, and applies the
// whole corpus via applyBatch as ONE atomic batch journal entry.

/** The import parameters: the markdown file paths to import (a corpus). */
export interface ImportMarkdownParams {
  /** The markdown file paths to import (a corpus). Each is read from disk. */
  files: string[]
  /** The corpus root — the base directory the path-containment seam CHECKS
   *  paths against. A path that escapes this root is rejected. Optional;
   *  defaults to the project root. The importer tests set it to a temp corpus
   *  dir. NOTE: a RELATIVE `files` path is resolved against the process CWD
   *  (NOT against `corpusRoot`), then containment-checked against `corpusRoot`;
   *  the intended usage is ABSOLUTE paths within `corpusRoot`. */
  corpusRoot?: string
}

/** The import result — a DISCRIMINATED result. `importMarkdownCorpus` NEVER
 *  throws for a domain failure (empty files, unreadable file, duplicate
 *  documentId, doc-flow violation, batch failure); it returns `{ ok: false }`.
 *  On success, `documentIds` lists the imported documents, `nodeCount`/
 *  `edgeCount` are the BATCH SIZE — the number of nodes/edges applied in the
 *  ONE atomic batch (NOT the resulting store totals). */
export type ImportMarkdownResult =
  | { ok: true; documentIds: string[]; nodeCount: number; edgeCount: number }
  | { ok: false; error: string; failedFile?: string }

/** Import a corpus of markdown files into the RAG store as a ONE-WAY SNAPSHOT.
 *  Reads each file, parses it, validates each document's doc-flow, and applies
 *  the whole corpus via applyBatch as ONE atomic batch journal entry. Async. */
export async function importMarkdownCorpus(
  ctx: EditOpContext,
  params: ImportMarkdownParams,
): Promise<ImportMarkdownResult>
```

**Importer API rules (pinned):**

- **`importMarkdownCorpus` is ASYNC** and returns `Promise<ImportMarkdownResult>`.
- **`importMarkdownCorpus` NEVER throws for a domain failure.** Every domain
  failure (empty files, unreadable file, duplicate documentId, doc-flow
  violation, batch failure) returns `{ ok: false, error, failedFile? }`. The
  ONLY throw path is a store-level failure the importer does not catch (none are
  documented in this unit — a `persist()` failure is non-fatal, Unit A §5.7).
- **`failedFile` invariant:** `failedFile` is set IFF a SPECIFIC file caused the
  failure (an unreadable file, an empty `documentId` for a file, a doc-flow
  violation for a file, a path that escapes the corpus root). It is ABSENT for
  corpus-level failures (empty `files`, an empty-string file path, a duplicate
  `documentId` across the corpus, a batch failure).
- **`importMarkdownCorpus` operates on the `RagStore` INTERFACE** (Unit A §5.4,
  via the `EditOpContext` — Unit D §5.1.1), never the concrete JSON store —
  SOURCE-SWITCHABLE.
- **The importer reads the corpus files** via `node:fs` (`readFileSync`). The
  parser does NOT read files (A2).
- **The importer applies the whole corpus via `applyBatch` as ONE atomic batch
  journal entry** (Unit N §5.1/§5.4) — a successful import lands ONE `batch`
  journal entry and persists ONCE; a failed import rolls back (no partial
  application, no journal pollution, no persist). **The batch op ordering is
  pinned: ALL `putNode` ops precede ALL `putEdge` ops** (referential integrity —
  every edge's source/target node exists before the edge is applied).
- **The importer validates each document's doc-flow with `validateDocFlow`
  (Unit B §5.2) BEFORE submitting the batch** (amendment 11) — a violation
  aborts the import (A5).

### 5.2 The parser grammar + the chunking rule

**The markdown→RagNodeType parser grammar (amendment 2 — the closed mapping):**

| Markdown construct | `RagNodeType` | Notes |
| --- | --- | --- |
| ATX heading `#`–`######` | `h1`–`h6` | content = heading text + inline children (§5.3). |
| Setext heading `===` / `---` | `h1` / `h2` | the `===` underline → `h1`, the `---` underline → `h2`. |
| Paragraph | `p` | content = inline text + inline children (§5.3). |
| Unordered list `-`/`*`/`+` | `ul` | each `li` → a doc-child RAG node. |
| Ordered list `1.`/`1)` | `ol` | each `li` → a doc-child RAG node. |
| List item | `li` | a doc-child of the `ul`/`ol` (paragraph-length `li` is its own RAG object — DOC-CHILD). |
| Blockquote `>` | `blockquote` | inner blocks → doc-children. |
| Fenced code block ```` ``` ```` | `pre` | content = the code text; NO children. |
| Indented code block (4-space) | `pre` | content = the code text; NO children. |
| GFM pipe table | `table` | `thead`/`tr`/`td`/`th` → doc-children (§5.2 table rule). |
| Table header row | `thead` | a doc-child of the `table`. |
| Table row | `tr` | a doc-child of the `table`/`thead`. |
| Table cell | `td` | a doc-child of the `tr`. |
| Table header cell | `th` | a doc-child of the `thead`/`tr`. |
| Horizontal rule `---`/`***`/`___` | (DROPPED) | no `hr` in `RagNodeType` — dropped (documented lossy). |
| Inline code `` `code` `` | (FOLDED) | folded into the parent's `content` as plain text (backticks stripped) — `code` is NOT a `RagNodeChildType`. |
| Inline strong `**text**`/`__text__` | `strong` child | a `RagNodeChild` (§5.3). |
| Inline em `*text*`/`_text_` | `em` child | a `RagNodeChild` (§5.3). |
| Inline link `[text](href)` | `a` child | a `RagNodeChild` with `props.href` (§5.3/§5.4). |
| Inline image `![alt](src)` | `img` child | a `RagNodeChild` with `props.src`/`props.alt` (§5.3/§5.4). |
| Raw HTML (block or inline) | (DROPPED) | dropped entirely (the element + its content) — the importer never renders HTML (A8). |
| Footnotes, definition lists, task lists, etc. | (DROPPED) | not in the first slice. |

**The importer's own deterministic heading→section chunking rule (amendment 3):**

- **R1 — Document root:** each imported markdown file produces ONE synthetic
  document-root RAG node: `{ id: <documentId>, type: 'div', content: '',
  ownedNodeIds: [], createdAt, updatedAt }`. The root is a STRUCTURAL grouping
  container (STRUCTURAL-ROOT). Its `content` is empty.
- **R1a — Node id scheme (DETERMINISTIC, preserves A10):** every node id the
  parser produces is DETERMINISTIC — a pure function of the `documentId` + the
  node's position/role. The root id = `documentId`. A section node id =
  `documentId:section:<n>` (n = the 1-based heading order). A doc-child block
  node id = `documentId:<type>:<n>` (n = a 1-based counter within its parent).
  Because the ids are deterministic, a re-import of the same corpus produces the
  SAME node ids and OVERWRITES the existing nodes/edges (upsert) — it does NOT
  create a second set (see A3/§5.4).
- **R2 — documentId convention (amendment 4):** `documentId` = the file's
  basename without the `.md` extension, sanitized to a valid RAG node id
  (non-empty; whitespace and characters invalid in an id are removed or replaced
  with `-`). The `documentId` is the document root node's id AND the `documentIds`
  owner for the doc-flow edges. A filename that sanitizes to an EMPTY string is a
  fail-state (§5.7). Two files in the corpus that sanitize to the SAME
  `documentId` (e.g. `a.md` and `a.markdown`) are a fail-state (A6).
- **R3 — Heading→section:** each markdown heading (ATX or Setext) starts a new
  RAG section node. The section node's `type` = the heading level (`h1`–`h6`),
  `content` = the heading's inline text (with inline children parsed per §5.3).
  The section's body = the markdown blocks between this heading and the next
  heading of level ≤ this heading's level (or EOF). Content before the first
  heading (the preamble) is attached to the document root as doc-children (or,
  if empty, no nodes).
- **R4 — Section body → doc-children:** each top-level block in a section's body
  becomes a RAG node that is a doc-child of the section node, in document order.
  The doc-child `order` = the block's 0-based position within the section's body.
  Block types map to `RagNodeType` per the grammar above.
- **R5 — Nested blocks:** a list (`ul`/`ol`) → a `ul`/`ol` RAG node; each `li` →
  a doc-child RAG node of the list node (DOC-CHILD). A table → a `table` RAG
  node; each `tr` → a doc-child RAG node of the table; each `td` → a doc-child
  RAG node of the `tr`; each `th` → a doc-child RAG node of the `thead` (content =
  the cell's inline text + inline children). A blockquote → a `blockquote` RAG
  node; its inner blocks → doc-children. A fenced/indented code block → a `pre`
  RAG node (content = the code text, NO children).
- **R6 — Inline children:** within a block node's content, inline markdown
  (`strong`/`em`/`a`/`img`) → `RagNodeChild[]` on that node, per §5.3. Inline
  code (backticks) → folded into the parent's `content` as plain text (backticks
  stripped). Links → `a` children; images → `img` children; strong → `strong`;
  em → `em`.
- **R7 — doc-flow edges (amendment 4):** the document root is the target of the
  `doc-head` edge (source = the FIRST section node) and the `doc-end` edge
  (source = the LAST section node). The sections are linked by `next-section`
  edges in heading order (section 1 → section 2 → ... → section N). Each
  doc-flow edge's `documentIds` = `[<documentId>]`. The `doc-head` edge: source =
  first section, target = document root. The `doc-end` edge: source = last
  section, target = document root. The `next-section` edges: source = section i,
  target = section i+1, each with `documentIds: [<documentId>]`. **The FIRST
  section node carries `props['data-doc-head'] = true`** (the document-head
  marker prop the traversal consumes — Unit B §5.1, Unit C §5.2). No other
  section node carries the marker. **`doc-child` edges carry NO `documentIds`**
  (per Unit B §5.2's scoping note, doc-child edges are validated globally, not
  per-document).
- **R8 — parent-child edges:** the document root is the family parent of the
  first section (`parent-child` edge root → section 1). Each section is the
  family parent of its doc-children (`parent-child` edges section → each
  doc-child). Each list node is the family parent of its `li` doc-children. Each
  table is the family parent of its `tr` doc-children. Each `tr` is the family
  parent of its `td`/`th` doc-children. (This gives the family structure the
  traversal maps to family order.)
- **R9 — ownedNodeIds population (amendment 9):** the importer sets each node's
  `ownedNodeIds` to the RAG node ids it owns per the chunking rule (its
  doc-children's ids are EXCLUDED — SUBTREE-OWNERSHIP). This is a derived set
  that the traversal (Unit C) later replaces with the provident-node-id form.
  The document root's `ownedNodeIds` = the section node ids (its family children
  — the sections are `parent-child` children of the root, NOT doc-children, so
  the root owns them per SUBTREE-OWNERSHIP). A section node's `ownedNodeIds` =
  its doc-children's ids EXCLUDED (its body blocks are doc-children, so it owns
  nothing directly).

**Table rule (amendment 6 — the additive `RagNodeType` change):** a GFM pipe
table maps to a `table` RAG node; the header row → a `thead` doc-child; each
body row → a `tr` doc-child; each cell → a `td`/`th` doc-child of the `tr`/
`thead`. A malformed row (fewer cells than the header) is parsed best-effort
(the cells that exist become `td`/`th` nodes); a fully malformed table is
dropped (A12). The `table`/`thead`/`tr`/`td`/`th` types are NEW members of
`RagNodeType` (the union goes from 18 to 23 — §5.8).

### 5.3 The inline-children parse (amendment 5)

The importer parses inline markdown into `RagNodeChild[]`, reusing the Unit S
flattening discipline (Unit S §5.5).

**Inline-parse rules (pinned):**

- **`**text**`/`__text__` → `RagNodeChild { type: 'strong', content: <text>, props: undefined }`.**
- **`*text*`/`_text_` → `RagNodeChild { type: 'em', content: <text>, props: undefined }`.**
- **`[text](href)` → `RagNodeChild { type: 'a', content: <text>, props: { href } }`.**
  The `href` is validated per §5.4 (an unsafe `href` DEMOTES the `a` to plain
  text).
- **`![alt](src)` → `RagNodeChild { type: 'img', content: '', props: { src, alt } }`.**
  The `src` is validated per §5.4 (an unsafe `src` DROPS the `img`).
- **Nested inline is FLATTENED to siblings** (the Unit S §5.5 discipline): a
  nested inline element is hoisted to a sibling of the outer element, preserving
  document order; the outer element's `content` is the concatenation of its
  direct text nodes. Applied recursively.
- **Inline code `` `code` `` is FOLDED into the parent's `content` as plain
  text** (backticks stripped) — `code` is NOT a `RagNodeChildType` (the closed
  union is `strong`/`em`/`a`/`img` — Unit M §5.1).
- **The plain text between inline elements is the node's `content`**, in
  document order.
- **The output is always a valid `RagNodeChild[]`** — every child has a `type` in
  the closed `RagNodeChildType` union, a string `content`, and an object-or-absent
  `props` with NO dangerous key (the Unit M §5.4 validation).

### 5.4 The security surface + the one-way snapshot + the one-shot semantics

**The markdown-specific security surface (amendment 8):**

- **URL safety (inherits the FULL Unit S §5.4 rules, not just the scheme
  list):** a link/image URL is SAFE if it matches `http:`/`https:`, a relative
  URL (no scheme), or (for `img` ONLY) a RASTER `data:image/*` URL
  (`^data:image\/(png|jpeg|jpg|gif|webp|bmp|avif);`). An unsafe URL
  (`javascript:`/`vbscript:`/`data:` non-image/`mailto:`/`ftp:`/`file:`/`blob:`/
  `about:`/any other scheme) is NEVER emitted. An `a` with an unsafe/missing
  `href` is DEMOTED to plain text; an `img` with an unsafe/missing `src` is
  DROPPED (A7). The importer's URL validation MUST apply the Unit S
  `normalizeUrl` step — strip leading C0-control + space characters
  (`[\u0000-\u0020]`) BEFORE the scheme test (so `[x]( javascript:alert(1))` is
  classified as `javascript:` and DEMOTED, not as a relative URL), check the
  scheme CASE-INSENSITIVELY (so `JaVaScRiPt:` is unsafe), and decode HTML
  character references before the scheme test (so `[x](&#106;avascript:...)` is
  unsafe). These are the exact Unit S URL-F1/URL-F3 rules the importer inherits.
- **Raw HTML is DROPPED, never rendered (A8):** an HTML block or inline HTML tag
  is dropped ENTIRELY (the element AND its content). This is a MARKDOWN-SPECIFIC
  rule STRICTER than the Unit S disallowed-element discipline (Unit S §5.5
  unwraps non-disallowed elements and preserves their content; the importer drops
  ALL raw HTML, element + content, with no unwrapping). The importer NEVER emits
  HTML into the RAG store.
- **Prototype-pollution keys are rejected (A9):** a parsed node/child carrying a
  `__proto__`/`constructor`/`prototype` key fails the store's write-time
  validation (the batch rolls back).
- **Default-off five-seam gating (amendment 8):** the `edit.import_markdown`
  tool is registered through the five-seam gate (Unit B §5.3) and is default-off
  (the `edit` group is NOT enabled by `defaultSecurityConfig`). It is callable
  only when the `edit` group is enabled (A11).
- **Path containment (must-fix):** the importer reads each `files` path via
  `readFileSync` with a PATH-CONTAINMENT seam — a path is REJECTED (a domain
  failure, `{ ok: false }`) if it is an absolute path OUTSIDE the configured
  corpus root, a symlink, or a directory. The corpus root is `params.corpusRoot`
  (optional, defaults to the project root). A path that escapes the corpus root
  is never read. **A RELATIVE `files` path is resolved against the process CWD
  (NOT against `corpusRoot`), then containment-checked against `corpusRoot`** —
  so a relative path whose CWD-resolved absolute path falls outside the corpus
  root is rejected (fail-state 3b). The intended usage is ABSOLUTE paths within
  `corpusRoot`. This prevents an enabled `edit` group from reading arbitrary
  files on disk.

**The one-way snapshot (amendment 1):**

- The RAG store is a point-in-time copy of the imported corpus.
- Edits go to the RAG store, never back to the source.
- The source markdown files are read-only inputs; the importer performs NO write
  to them (A4).
- A subsequent change to a source file does NOT propagate to the RAG store
  (one-shot, no re-import).

**The one-shot semantics (amendment 7):**

- The importer is one-shot — it does NOT check for existing nodes/edges, does
  NOT dedupe, does NOT merge, and does NOT refuse a re-import.
- A re-import of the same corpus OVERWRITES the existing nodes/edges (upsert) —
  the parser's node ids are DETERMINISTIC (R1a), so the same ids are re-applied.
  This is a documented behavior (no idempotency — a re-import is not a no-op; it
  re-applies the batch).
- **KNOWN LIMITATION (documented, not a defect):** a re-import of a SHORTENED
  document (e.g. reduced from 5 sections to 3) leaves the now-absent nodes/edges
  (sections 4/5 + their doc-flow/doc-child/parent-child edges) ORPHANED in the
  store — the importer does NOT remove nodes/edges that no longer exist in the
  new parse. This is a consequence of the one-shot (no re-import) design; a
  re-import is NOT a clean snapshot. The sanctioned flow is a one-time import
  into an empty (or partially-populated) store; re-importing to UPDATE an
  existing store is out of scope (amendment 7).

### 5.5 The write-back surface (`edit.import_markdown` + `validateDocFlow` before commit)

**The `edit.import_markdown` tool (amendment 8/11):**

- **Tool name:** `edit.import_markdown`.
- **Input schema (zod):** `{ files: string[] }` — the markdown file paths to
  import (a corpus). `files` must be a non-empty array of non-empty strings.
- **Effect:** reads each file, parses it via `parseMarkdown`, validates each
  document's doc-flow via `validateDocFlow`, and applies the whole corpus via
  `applyBatch` as ONE atomic batch journal entry. A successful import lands ONE
  `batch` journal entry and persists ONCE; a failed import rolls back (no
  partial application, no journal pollution, no persist). **The batch op
  ordering is pinned: ALL `putNode` ops precede ALL `putEdge` ops** (referential
  integrity — every edge's source/target node exists before the edge is applied).
- **Return (JSON):** the `ImportMarkdownResult` — `{ ok: true, documentIds,
  nodeCount, edgeCount }` on success, `{ ok: false, error, failedFile? }` on a
  domain failure. **MCP tool-result envelope (pinned):** the tool returns a
  SUCCESSFUL MCP call whose content block is the JSON-serialized
  `ImportMarkdownResult` — a domain failure is surfaced as `{ ok: false, ... }`
  in the content block, NOT as an MCP tool error (consistent with the other
  `edit.*` tools, which return `{ ok: false }` results rather than throwing).
- **Gating:** the tool is in the `edit` group (default-off). It is main-handled
  (like the other `edit.*` tools — Unit B §5.3), calling the main-process RAG
  store via the `RagStore` INTERFACE. It is NEVER a `code`-group op.
- **The tool is NOT an edit op** — it is a tool that routes through `applyBatch`.
  The edit-op census (9, Unit O) is UNCHANGED.

**`validateDocFlow` before commit (amendment 11):**

- The importer calls `validateDocFlow(nodes, edges, documentId)` (Unit B §5.2)
  for EACH document in the corpus BEFORE submitting the batch.
- A document whose doc-flow is `{ ok: false, reason, detail }` (missing-head,
  missing-node, cycle, missing-end) ABORTS the WHOLE import — the batch is NOT
  submitted, NO node/edge is applied (A5).
- The importer constructs the doc-flow edges per R7 (§5.2) so a well-formed
  document passes `validateDocFlow` (head exists, all nodes exist, acyclic
  `next-section` chain reaching the `doc-end`, acyclic `doc-child` nesting).

### 5.6 Happy-path states (TestWriter red set — valid paths)

1. **Single heading document:** `parseMarkdown('# Title\n', 'title')` → a
   `ParsedMarkdown` with the document root `div` node + one `h1` section node +
   the `doc-head` edge (source = h1, target = root) + the `doc-end` edge (source
   = h1, target = root); `validateDocFlow` on it returns `{ ok: true, order }`.
2. **Multi-heading document (next-section chain):** `# A\n## B\n### C\n` →
   three section nodes (`h1`/`h2`/`h3`) linked by `next-section` edges in heading
   order (A→B→C); the `doc-head` source is the `h1`, the `doc-end` source is the
   `h3`; `validateDocFlow` returns `{ ok: true, order: [h1, h2, h3] }`.
3. **Paragraph body → p doc-child:** `# A\n\nSome text.\n` → the `h1` section
   has one `p` doc-child (order 0) with `content: 'Some text.'`; a `parent-child`
   edge (h1 → p) and a `doc-child` edge (h1 → p, order 0).
4. **List → ul + li doc-children:** `# A\n\n- one\n- two\n` → a `ul` doc-child
   of the `h1`; two `li` doc-children of the `ul` (each its own RAG object —
   DOC-CHILD); `parent-child` edges (ul → li1, ul → li2) and `doc-child` edges
   (ul → li1 order 0, ul → li2 order 1).
5. **Table → table/thead/tr/td/th:** `# A\n\n| h1 | h2 |\n|---|---|\n| a | b |\n`
   → a `table` doc-child of the `h1`; a `thead` doc-child (with `th` cells) + a
   `tr` doc-child (with `td` cells); the `table`/`thead`/`tr`/`td`/`th` types are
   valid `RagNodeType` members.
6. **Inline formatting → inline children:** `# A\n\nSome **bold** and *em*.\n`
   → the `p` node's `content` is `'Some  and .'` and its `children` is
   `[{ type: 'strong', content: 'bold' }, { type: 'em', content: 'em' }]` (the
   inline elements are hoisted to siblings, the plain text is the `content`).
7. **Inline code folded:** `# A\n\nUse `code` here.\n` → the `p` node's `content`
   is `'Use code here.'` (the backticks stripped, the code text folded into the
   `content` as plain text — NO `code` child).
8. **Safe link → a child:** `# A\n\n[link](https://x)\n` → the `p` node's
   `children` is `[{ type: 'a', content: 'link', props: { href: 'https://x' } }]`.
9. **Safe image → img child:** `# A\n\n![alt](https://x/i.png)\n` → the `p`
   node's `children` is `[{ type: 'img', content: '', props: { src:
   'https://x/i.png', alt: 'alt' } }]`.
10. **Setext heading:** `Title\n=====\n` → an `h1` section node with
    `content: 'Title'`.
11. **Blockquote:** `# A\n\n> quoted\n` → a `blockquote` doc-child of the `h1`;
    its inner block → a doc-child of the `blockquote`.
12. **Fenced code block:** `# A\n\n```\ncode\n```\n` → a `pre` doc-child of the
    `h1` with `content: 'code'` and NO children.
13. **Horizontal rule dropped:** `# A\n\n---\n\nText\n` → the `---` produces NO
    node (dropped); the `p` (`Text`) is the only doc-child of the `h1`.
14. **Raw HTML dropped:** `# A\n\n<div>html</div>\n` → the `<div>` produces NO
    node and NO text (dropped entirely — A8).
15. **Empty preamble:** `# A\n\nBody\n` (no content before the first heading) →
    the document root has NO doc-children (the preamble is empty).
16. **Multi-file corpus:** `importMarkdownCorpus(ctx, { files: ['a.md', 'b.md'] })`
    → `{ ok: true, documentIds: ['a', 'b'], nodeCount, edgeCount }`; each
    document has its own `documentId` and its own doc-flow; `validateDocFlow`
    passes for both.
17. **One atomic batch journal entry:** a successful import of a corpus lands
    EXACTLY ONE `batch` journal entry (not N per node/edge); `undoDepth()`
    increases by exactly 1; the file is written atomically.
18. **`validateDocFlow` passes before commit:** a well-formed corpus → the
    importer validates each document's doc-flow and the batch is submitted; the
    import succeeds.
19. **One-way snapshot (no write-back):** after a successful import, the source
    markdown files are UNCHANGED (the importer performed NO write to them); the
    RAG store reflects the imported content.
20. **`ownedNodeIds` derived from the chunking rule:** each imported node's
    `ownedNodeIds` is the RAG node ids it owns per the chunking rule (its
    doc-children's ids EXCLUDED); the document root's `ownedNodeIds` is the
    section node ids (its family children).
21. **Determinism:** `parseMarkdown('# A\n', 'a')` called twice returns the SAME
    `ParsedMarkdown` (deep-equal) both times.
22. **Totality on malformed markdown:** `parseMarkdown('```unclosed', 'a')` (an
    unclosed code fence) → a best-effort `ParsedMarkdown` (never throws).

### 5.7 Fail-states (TestWriter red set — documented fail-states)

1. **`parseMarkdown` with a non-string markdown or an empty documentId** →
   throws `Error('markdown parse: markdown/documentId required')` (a caller
   error — the ONLY parser throw).
2. **`importMarkdownCorpus` with an empty `files` array** →
   `{ ok: false, error: 'markdown import: files must be a non-empty array' }`;
   no node/edge is applied.
3. **`importMarkdownCorpus` with an unreadable file** (a nonexistent path, a
   directory, a permission-denied file) →
   `{ ok: false, error: 'markdown import: cannot read file: <path>', failedFile:
   <path> }`; no node/edge is applied.
3a. **`importMarkdownCorpus` with an empty-string file path** (a `files` entry
   that is `''`) → `{ ok: false, error: 'markdown import: empty file path' }`;
   no node/edge is applied.
3b. **`importMarkdownCorpus` with a path that escapes the corpus root** (an
   absolute path outside the configured corpus root, a symlink, or a directory;
   or a RELATIVE path whose CWD-resolved absolute path falls outside the corpus
   root — relative paths resolve against the process CWD, not `corpusRoot`)
   → `{ ok: false, error: 'markdown import: path outside corpus root: <path>',
   failedFile: <path> }`; no node/edge is applied (path containment).
4. **A duplicate `documentId` across the corpus** (e.g. `a.md` and `a.markdown`)
   → `{ ok: false, error: 'markdown import: duplicate documentId: <id>' }`; no
   node/edge is applied (A6).
5. **A filename that sanitizes to an EMPTY `documentId`** →
   `{ ok: false, error: 'markdown import: empty documentId for file: <path>',
   failedFile: <path> }`; no node/edge is applied.
6. **A document whose doc-flow fails `validateDocFlow`** (e.g. a document with no
   heading → no `doc-head` edge → `missing-head`) →
   `{ ok: false, error: 'markdown import: doc-flow validation failed for
   <documentId>: <reason>', failedFile: <path> }`; the WHOLE import aborts — NO
   node/edge is applied (A5).
7. **An `applyBatch` failure** (e.g. a parsed node that fails the store's
   write-time validation) → `{ ok: false, error: <batch error> }`; the batch
   rolls back — the store is unchanged, the journal is unpolluted, no persist
   (Unit N §5.3).
8. **An unsafe link href** (`[x](javascript:alert(1))`) → the `a` is DEMOTED to
   plain text (no `a` child, no `javascript:` URL in the output) (A7).
9. **An unsafe image src** (`![x](data:text/html,y)`) → the `img` is DROPPED
   (no `img` child) (A7).
10. **Raw HTML dropped** (`<script>alert(1)</script>` in the markdown) → the
    script AND its content are dropped (no text, no child) (A8).
11. **A prototype-pollution key** (a parsed node/child carrying a
    `__proto__`/`constructor`/`prototype` key) → the store's write-time
    validation fails the batch → `{ ok: false, error: <batch error> }`; the
    batch rolls back (A9).
12. **A re-import is NOT idempotent (one-shot):** importing the same corpus
    twice → the second import OVERWRITES the existing nodes/edges (upsert) — the
    parser's node ids are DETERMINISTIC (R1a), so the same ids are re-applied;
    the importer does NOT dedupe, does NOT merge, and does NOT refuse (A3).
13. **The `edit.import_markdown` tool with the `edit` group disabled** → not
    registered, not callable (`toolAllowed` returns false) (A11).
14. **The `edit.import_markdown` tool invoked with only `code` enabled** →
    denied (editing is never a `code`-group op).

### 5.8 Census / numeric claims

- **`RagNodeType` union members:** 18 → **23** (adds `table`, `thead`, `tr`,
  `td`, `th` — an additive store-format change, amendment 6). The 18 existing
  members are UNCHANGED; the 5 new members are added. The store's `RAG_NODE_TYPES`
  runtime set gains the 5 new members. Existing records without these types
  still load (additive).
- **`RagNodeChildType` union members:** 4 — UNCHANGED (`strong`/`em`/`a`/`img`).
  `code` is NOT a child type (inline code is folded into the parent's `content`).
- **New pure module:** 1 — `src/main/markdown-parse.ts` (the `parseMarkdown`
  function + the `ParsedMarkdown` type + the parser grammar + the chunking rule
  + the inline-children parse). PURE — no Electron, no file I/O; node-testable.
- **New importer module:** 1 — `src/main/markdown-import.ts` (the
  `importMarkdownCorpus` function + the `ImportMarkdownParams`/
  `ImportMarkdownResult` types + the doc-flow validation + the `applyBatch`
  routing).
- **New pure function:** 1 — `parseMarkdown(markdown: string, documentId:
  string): ParsedMarkdown`.
- **New import function:** 1 — `importMarkdownCorpus(ctx: EditOpContext, params:
  ImportMarkdownParams): Promise<ImportMarkdownResult>`.
- **New MCP tool:** 1 — `edit.import_markdown` (default-off, `edit` group,
  main-handled). The edit group's tool count grows by 1 (the edit-op census of 9
  ops — Unit O — is UNCHANGED; `import_markdown` is a tool, not an edit op).
- **New result types:** 2 — `ParsedMarkdown`, `ImportMarkdownResult`.
- **Doc-flow edges per document:** exactly 2 + (N−1) — the `doc-head` edge + the
  `doc-end` edge + (N−1) `next-section` edges for N sections. Each carries
  `documentIds: [<documentId>]`.
- **`parent-child` edges per document:** 1 (root → first section) + (one per
  section → its doc-children) + (one per list → its `li` doc-children) + (one
  per table → its `thead`/`tr` doc-children) + (one per `thead` → its `th`
  doc-children) + (one per `tr` → its `td`/`th` doc-children).
- **`doc-child` edges per document:** one per nested block (a section's body
  blocks, a list's `li`s, a table's `thead`/`tr`s, a `thead`'s `th`s, a `tr`'s
  `td`/`th`s, a blockquote's inner blocks), each with an `order`.
- **Journal entries per successful import:** exactly 1 — a `batch` entry (Unit N
  §5.4). A failed import lands 0 journal entries.
- **`persist()` calls per successful import:** exactly 1. A failed import calls
  `persist()` 0 times.
- **`undoDepth()` change after a successful import:** +1 (one `batch` entry);
  `redoDepth()` resets to 0.
- **`undoDepth()`/`redoDepth()` change after a failed import:** 0 (no journal
  entry, no pollution).
- **`validateDocFlow` calls per import:** exactly one per document in the corpus
  (before the batch is submitted).
- **Edit-op census:** 9 — UNCHANGED (this unit adds no edit op; `import_markdown`
  is a tool that routes through `applyBatch`).
- **`BatchOp` union members:** 7 — UNCHANGED (this unit adds no batch op; the
  import builds a batch of `putNode`/`putEdge` ops).

### 5.9 Cross-references

- Gate: `docs/specs/markdown-import-review.md` §4 (the 11 amendments + the
  ADJUSTED SCOPE), §5 (the decision record — the initial-ingestion framing is
  PROCEED-WITH-AMENDMENTS; the round-trip-diffing framing is DO-NOT-PROCEED).
- Unit A: `docs/specs/unit-a-rag-store.md` §5.1 (the `RagNode`/`RagEdge` shapes
  the parser produces + the `RagNodeType` union this unit amends with
  `table`/`thead`/`tr`/`td`/`th`), §5.4 (the `RagStore` interface the importer
  operates on), §5.5 (the single-writer queue the import serializes through),
  §5.6 (the project journal — the `batch` entry the import lands), §5.7 (the
  hash-verified source the import's writes recompute).
- Unit B: `docs/specs/unit-b-document-model.md` §5.1 (the doc-flow edge
  semantics the importer constructs — doc-head/next-section/doc-end/doc-child),
  §5.2 (the `validateDocFlow` the importer runs before commit — amendment 11),
  §5.3 (the five-seam gate the `edit.import_markdown` tool registers through).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.2 (the traversal consumes
  the imported doc-flow edges + the doc-head marker prop), §5.3 (the
  back-reference map — the traversal later replaces the importer's `ownedNodeIds`
  with the provident-node-id form). **NOTE:** this unit's additive
  `table`/`thead`/`tr`/`td`/`th` `RagNodeType` change EXTENDS Unit C §5.2 rule
  5's element-type list (the traversal must render the new table types); the
  traversal itself is NOT changed by this unit (Unit C is a separate concern).
- Unit M: `docs/specs/unit-m-children-field.md` §5.1 (the `RagNodeChild`/
  `RagNodeChildType` types the inline-children parse produces), §5.4 (the
  `children` shape validation the parsed nodes must pass).
- Unit N: `docs/specs/unit-n-batch-atomicity.md` §5.1 (the `applyBatch` the
  import routes through — ONE atomic batch journal entry), §5.4 (the `batch`
  journal entry a successful import lands), §5.3 (the rollback a failed import
  triggers).
- Unit S: `docs/specs/unit-s-paste-sanitization.md` §5.4 (the URL-safety rules
  the import reuses), §5.5 (the flattening discipline the inline-children parse
  reuses), §5.2 (the disallowed-element discipline the raw-HTML drop reuses).
- Unit O: `docs/specs/unit-o-edit-ops.md` §5.9 (the edit-op census 9 — UNCHANGED
  by this unit; `import_markdown` is a tool, not an edit op).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SUBTREE-OWNERSHIP**, **MARKDOWN-EXPORT-ONLY** (the carve-out — initial
  ingestion is a distinct sanctioned flow), **SINGLE-WRITER-STORE**,
  **PROJECT-JOURNAL**, **DERIVED-DOC-FLOW**, **DOC-CHILD**,
  **CROSS-DOCUMENT-SHARED**, **STRUCTURAL-ROOT**, **MCP-UI-EQUIVALENCE**.
- Pending: `docs/pending.md` line 42 (the SPECULATIVE item "Markdown parsing to
  storage via text-match diffing" — the round-trip-diffing framing remains
  SHELVED; the initial-ingestion framing is this unit).
- Host patterns: `src/main/paste-sanitize.ts` (the PURE-module pattern the
  parser mirrors), `src/main/rag-store.ts` (the `RagNode`/`RagEdge` shapes, the
  `RagNodeType` union this unit amends, the `applyBatch` method the import
  routes through), `src/main/edit-ops.ts` (the `EditOpContext` the importer
  operates on), `src/main/mcp-server.ts` (the `edit.*` tool wiring the
  `edit.import_markdown` tool joins).
- **Page design:** this unit is a TOOL-LEVEL change (a new `edit.import_markdown`
  MCP tool + two net-new main-process modules). It does NOT change any page
  design, so no `docs/skills/designing-pages.md` update (and no test-use-case
  coverage-matrix / demo-page-index change) is warranted.
