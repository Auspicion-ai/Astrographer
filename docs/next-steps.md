# Astrographer — Work Queue

Maintained by the document-archival loop (AGENTS.md item 6). Open work on
top; finished items move to the tracker rows they produced. This queue is
this project's local next-steps (the foundation's queue lives in the adjacent
`../Provident-Electron/docs/next-steps.md`).

Astrographer is a **hybrid human-readable local wiki (Obsidian-like) with a
graph-based RAG**, built on a fork of the Provident-Electron foundation. The
proposal gate is complete (PROCEED-WITH-AMENDMENTS — see
`docs/specs/astrographer-review.md`). The first milestone is a smaller slice:
Units A/B/C (persistence → document model + doc-flow → rendering spine).

## OPEN

### First milestone — Units B/C (Unit A done)

- **Unit B — document model + doc-flow.** RAG node/edge types; doc-flow edges
  (doc-head / next-section / doc-end) authoritative in the store, **scoped by
  `documentId`** so a node can be in MULTIPLE documents' flows
  (CROSS-DOCUMENT-SHARED); the **`doc-child` edge** for hierarchical nesting (a
  nested semantic unit — e.g. a paragraph-length `li` inside a `ul` — is its own
  RAG object, a doc-child of the containing RAG object); traversal-time edge
  validation (cycle/missing-node/missing-head, incl. doc-child nesting cycles)
  with family-pre-order fallback; the doc-head marker prop; the subtree-boundary
  convention; **plus the `rag` (read-only, default-off) + `edit` (mutating,
  default-off) MCP group decisions** through the five-seam gate.
- **Unit C — rendering spine.** Main-process traversal producing TWO outputs —
  the `LegacyInitialData` envelope AND the back-reference `Map<ragNodeId,
  nodeId[]>` — envelope shipped to the renderer for `translateLegacy` →
  `renderProducingProcess`. Each RAG object's subtree emitted as a
  `ContentPayload.content[]` root with `placement.targetPlacement`, attached
  into a root-visible zone. **Hard precondition:** the traversal must also emit a
  `container`-role producer (`placementName`) for every targeted zone, or the
  subtree stays `unplaced` and won't render. Multi-parent duplicate coherence;
  the coarse line→node map; MCP/UI equivalence verified on the spine.

### Later units (noted, not in this slice)

- **Unit D — editable text.** Commit-on-blur write-back to the RAG store →
  re-traversal (NOT a zone-targeted state-slice — FS-10 blocks it); dirty-edit
  guard; caret/focus preservation keyed by RAG node id. **Pending UX (see
  `docs/pending.md`):** when editing a CROSS-DOCUMENT-SHARED node, notify the
  user it is shared across N documents and, on save, prompt whether to change
  all owners or preserve some on a clone of the original.
- **Unit E — RAG index + retrieval.** Lexical-first BM25/tf-idf behind an
  interface-swappable `Embedder`; graph traversal for context assembly;
  deterministic and testable.
- **Unit F — embeddings.** Vector embeddings behind the `Embedder` interface
  (deferred; local-first, no network egress).
- **Unit G — crosslink/backlink.** Custom crosslink `LinkConfig` (open name
  union) + host-side backlink enumeration.
- **Unit H — sidebar panes.** Host-side pane registry; app-graph panes
  MCP-visible; operator-only panes (settings) in an isolated `GraphScope`.
- **Unit I — template customization.** Envelope CRUD via a provident-rendered
  template-editor pane.
- **Unit J — MCP/security hardening.** Completion pass for the `rag`/`edit`
  groups and the equivalence surface.

## DONE

- **Unit A — RAG store (persistence) (2026-08-26).** `createJsonRagStore`
  implemented in `src/main/rag-store.ts` behind the `RagStore` interface:
  node/edge CRUD, single-writer write queue, persisted invertible project
  journal (`maxJournalLength` cap, default 1000), fail-disabled boot,
  hash-verified source + quarantine, per-kind `order`/`documentIds`
  enforcement, `createdAt` preservation, self-referential-edge /
  prototype-pollution / empty-string / duplicate rejection. TestWriter red →
  Implementer green in `tests/rag-store.test.ts` (§5.8/§5.9, 11 happy-path +
  11 fail-state); adversarial pass in `tests/rag-store-adversarial.test.ts`
  (host findings fixed + regression-tested); blind-greens in
  `docs/specs/unit-a-rag-store-greens.md` (27 scenarios, all pass);
  documentation review in `archive/reviews/2026-08-26-unit-a-doc-review.md`
  (spec + greens + trackers reconciled against the build); trio green (test +
  typecheck + build).
- **Proposal gate (2026-08-26).** Three-agent gate (validity ∥ critique →
  architecture → change-analysis) on the top-level deliverable, then a re-run
  gate on the refined two-graph model, then a focused validity check on the
  subtree-ownership refinement. Verdict: **PROCEED-WITH-AMENDMENTS**. Recorded
  in `docs/specs/astrographer-review.md` (§1-§11). User approved the adjusted
  first-slice scope (Units A/B/C) with the subtree-ownership model and the
  markdown-export-only decision.
- **Spec gate (2026-08-26).** The first-slice contracts are written and
  verified in the compile-horizon-review format:
  `docs/specs/unit-a-rag-store.md` (505 lines), `docs/specs/unit-b-document-model.md`
  (313 lines), `docs/specs/unit-c-rendering-spine.md` (381 lines). Each is
  exhaustive enough for a TestWriter to derive every state and fail-state from
  §5.8/§5.9. **Unit C pinned a reconciliation key:** the back-reference map is
  built by the main-process traversal running `translateLegacy`, but the
  renderer re-translates and re-mints node ids — resolved by a stable authored
  root id (`props.id = 'rag-<ragNodeId>'`) as the reconciliation key between
  the main-process map and the renderer's translated tree. No engine gap opened
  by this slice (ENG-GAP-1 remains the sole non-blocking handoff item).
