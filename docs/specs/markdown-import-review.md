# Proposal Review — Markdown File Import

- **Status:** REVIEWED — **DO-NOT-PROCEED** for the round-trip-diffing framing
  (2026-08-28); **PROCEED-WITH-AMENDMENTS** for the initial-ingestion framing
  (2026-08-28, re-run grounded in the user's concrete use case). The three-agent
  proposal gate was run twice: once on the original round-trip-diffing framing
  (DO-NOT-PROCEED), then re-run on the initial-ingestion framing after the user
  provided a concrete use case (PROCEED-WITH-AMENDMENTS, conditional on the
  user's go-ahead before the spec gate opens).
- **Proposal source:** `docs/pending.md` line 42 (the SPECULATIVE item "Markdown
  parsing to storage via text-match diffing"). The user asked to start the spec
  pass for the markdown file import feature.
- **Gate reference:** `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SUBTREE-OWNERSHIP**, **MARKDOWN-EXPORT-ONLY**; `docs/defects.md` the SHELVED
  **ENG-GAP-1** row; `docs/specs/astrographer-review.md` §11.

---

## 1. What the proposal asks

**Original framing (round-trip diffing):** ingest a markdown file (e.g. an
external editor's export) back into the RAG store via **text-match diffing**
(NOT node-identity comments), matching it against the existing RAG store's
rendered markdown and writing changes back (create/update/delete RAG nodes +
edges).

**Re-run framing (initial ingestion, grounded in the user's concrete use case):**
**Migrating an existing document store to the RAG engine** — e.g. reading the
project's own documentation into the RAG so the agent can query it and use the
consistency-enforcement features. Parse existing markdown documents (NOT yet in
the RAG store) into RAG nodes + edges from scratch. NOT round-trip diffing — a
one-time (or repeatable) import of a document corpus into an empty (or
partially-populated) RAG store.

## 2. The three-agent gate verdicts — original framing (round-trip diffing)

| Review | Verdict | Key findings |
| --- | --- | --- |
| Validity | **VALID-WITH-AMENDMENTS** | Legitimate revisit of MARKDOWN-EXPORT-ONLY, internally consistent with RAG-AUTHORITATIVE + SUBTREE-OWNERSHIP. But "create/update/delete RAG nodes + edges via text-match diffing" is over-broad — text-match diffing is only coherent for TEXT UPDATES to existing RAG objects; create/delete/edges need a markdown→document-model parser that does not exist. |
| Critique | **UNSOUND-as-written** | The central mechanism (text-match diffing) is fundamentally incapable of recovering the RAG store's structure from a lossy flat export, and contradicts MARKDOWN-EXPORT-ONLY, RAG-AUTHORITATIVE, and the "agents edit via direct MCP" policy. The revisit condition ("when a markdown-as-input use case surfaces") is UNMET. |
| Architecture | **UNSOUND-as-written** (for the amended first slice) | The write-back ROUTING is sound (the `edit` group, default-off, five-seam gate + `applyBatch` Unit N, atomic + single-writer queue). But the DIFFING MECHANISM is incoherent: the diff surface is undefined (two divergent markdown renderers), the content↔children boundary is unrecoverable, the coarse line→node map is a READ aid not a write-back path, and no diffing engine exists. |
| Change-analysis | **DO-NOT-PROCEED** | The revisit condition is UNMET and the mechanism is incoherent as written. It contradicts three ACTIVE decisions. Keep SHELVED with a tightened revisit condition. |

## 3. The three-agent gate verdicts — re-run framing (initial ingestion)

| Review | Verdict | Key findings |
| --- | --- | --- |
| Validity | **VALID-WITH-AMENDMENTS** | The initial-ingestion framing is well-formed, internally consistent, and feasible — a distinct, sanctioned flow, NOT a contradiction of MARKDOWN-EXPORT-ONLY (that decision governs the export surface + round-trip edits; initial ingestion creates RAG nodes/edges from a new corpus and routes through the single-writer store + validation + journal). It sidesteps the round-trip blockers. The concrete use case satisfies the first half of the revisit condition. But not buildable as stated (12 findings). |
| Critique | **UNSOUND-as-written** | Directionally right and the use case is real, but the full design is not buildable as written. The load-bearing blocker is the parser gap (the RAG model is not a generic markdown AST — it is a specific document model with SUBTREE-OWNERSHIP chunking, doc-flow edges, doc-child nesting, inline children). The chunking rule, doc-flow edge derivation, and inline-children parse are all undefined. The element mapping is lossy for the very docs being imported (no table/thead/tr/td/th/hr, no inline `code`). The "consistency-enforcement" value is NOT delivered by a naive import. The value proposition is weaker than claimed for the own-docs case (the agent can already read those files; the marginal value is retrieval only). |
| Architecture | **SOUND-WITH-AMENDMENTS** | The initial-ingestion framing is architecturally sound as a mechanism, and a minimal first slice (empty-store, single-document, heading→section ingestion) IS buildable. The parser is a coherent net-new pure module (mirrors `sanitizePastedHtml`); the chunking mismatch is NOT a blocker (the importer creates the store from scratch and defines its own deterministic rule); the document-root/document-id convention is derivable (synthetic root node type `div` + filename-derived `documentId`; doc-head from the first heading, next-section by heading order, doc-end from the last section; must pass `validateDocFlow`); the inline parse reuses the Unit S flattening discipline; the write-back surface (a new `edit.import_markdown` tool, default-off, five-seam gate, routing through `applyBatch` as one atomic batch journal entry) is the right home. **CRITICAL finding: the two-source-of-truth externality** — importing the active `docs/` tree makes the RAG store a derived copy of `docs/*.md`, inverting RAG-AUTHORITATIVE. |
| Change-analysis | **PROCEED-WITH-AMENDMENTS** | Feasible as a minimal first slice; NOT buildable as the full feature as written. The initial-ingestion framing is a distinct sanctioned flow that satisfies the concrete-use-case half of the revisit condition. The amendments below make it buildable. Conditional on the user's go-ahead before the spec gate opens. |

## 4. The amendments (make it PROCEED-WITH-AMENDMENTS)

1. **CRITICAL — pin the two-source-of-truth externality.** Importing the active
   `docs/` tree makes the RAG store a derived copy of `docs/*.md`, inverting
   RAG-AUTHORITATIVE. Pin it as a **one-way snapshot** (the RAG store is a
   point-in-time copy; edits go to the RAG store, never back to the source), OR
   scope the first slice to a **non-`docs/` corpus** (a large external markdown
   corpus the agent cannot otherwise read).
2. **HIGH — pin the markdown→RAG-node parser grammar.** Which markdown
   constructs map to which of the 18 `RagNodeType` members, and which are
   dropped. A net-new pure module (mirrors `sanitizePastedHtml`).
3. **HIGH — pin the importer's own chunking rule.** The importer creates the
   store from scratch, so it defines its own deterministic rule (it need not
   match the default heuristic).
4. **HIGH — pin the document-root/document-id convention.** Synthetic root node
   type `div` + a filename-derived `documentId`; doc-head from the first heading,
   next-section by heading order, doc-end from the last section; must pass
   `validateDocFlow`.
5. **MEDIUM — pin the inline-children parse.** Markdown inline syntax →
   `RagNodeChild[]`, reusing the Unit S flattening discipline (nested inline
   flattened to siblings).
6. **MEDIUM — resolve the table gap.** The first slice degrades tables to a
   lossy representation (the `RagNodeType` union has no table/tr/td/th); adding
   table types is a separate additive store-format change, deferred.
7. **MEDIUM — pin idempotency.** The first slice is one-shot (no re-import);
   defer re-import/idempotency.
8. **MEDIUM — design the security surface.** Markdown-specific sanitization +
   default-off five-seam gating.
9. **LOW — pin `ownedNodeIds` population.**
10. **LOW — record the MARKDOWN-EXPORT-ONLY carve-out** in the decision record
    (initial ingestion is a distinct sanctioned flow).
11. **LOW — run `validateDocFlow` before commit** on the write-back surface.

**Recommended first-slice scope:** empty-store, single-document, heading→section
ingestion, **non-`docs/` corpus**, one-shot (no re-import), tables degraded to a
lossy representation, default-off `edit.import_markdown` tool routed through
`applyBatch` as one atomic batch journal entry.

**ADJUSTED SCOPE (user decision, 2026-08-28):** the user selected three scope
adjustments, broadening the first slice:
1. **Allow the `docs/` corpus** — the RAG store becomes a **one-way snapshot** of
   `docs/*.md` (a point-in-time copy; edits go to the RAG store, never back to
   the source). This pins the two-source-of-truth externality (amendment 1) as a
   one-way snapshot.
2. **Add table support** — add `table`/`thead`/`tr`/`td`/`th` to `RagNodeType`
   as part of this slice (an additive store-format change), instead of degrading
   tables lossily. This resolves the table gap (amendment 6) in-slice.
3. **Multi-document ingestion** — support importing multiple markdown files in
   one import (a corpus), not just a single document.

The adjusted first-slice scope is therefore: **multi-document corpus ingestion
(including the `docs/` tree as a one-way snapshot), heading→section chunking,
table support (additive `RagNodeType` change), one-shot (no re-import),
default-off `edit.import_markdown` tool routed through `applyBatch` as one
atomic batch journal entry.**

## 5. The decision record (what the gate pins)

- **Verdict:** PROCEED-WITH-AMENDMENTS for the initial-ingestion framing
  (conditional on the user's go-ahead). The round-trip-diffing framing remains
  DO-NOT-PROCEED.
- **Key constraints (pinned):**
  - Markdown remains EXPORT-ONLY for round-trip edits (MARKDOWN-EXPORT-ONLY,
    §11). Agent changes go through direct MCP `edit`-group mutations — never
    markdown round-trips.
  - Initial ingestion is a DISTINCT sanctioned flow: it creates RAG nodes/edges
    from a new corpus and routes through the single-writer store + validation +
    journal. It does NOT treat the MarkdownAdapter export as an edit surface.
  - The RAG store is authoritative; the graph is a transient re-derivable
    projection (RAG-AUTHORITATIVE). The two-source-of-truth externality must be
    pinned (one-way snapshot OR a non-`docs/` first corpus).
  - The line→node map is a READ/assembly aid, explicitly NOT a write-back path.
- **Revisit condition (re-pinned):** the concrete-use-case half is MET (the
  user's migration use case). The design half is MET by the amendments above. The
  feature may proceed to the spec gate ONLY with the user's go-ahead.

## 6. Recommended disposition

- **`docs/pending.md` line 42:** update to record the PROCEED-WITH-AMENDMENTS
  verdict for the initial-ingestion framing (the round-trip-diffing framing
  remains shelved). The item moves from SPECULATIVE to a spec candidate once the
  user gives the go-ahead.
- **Spec gate:** on the user's go-ahead, write `docs/specs/unit-*-markdown-import.md`
  for the minimal first slice (empty-store, single-document, heading→section
  ingestion, non-`docs/` corpus, one-shot, default-off `edit.import_markdown`
  tool).

