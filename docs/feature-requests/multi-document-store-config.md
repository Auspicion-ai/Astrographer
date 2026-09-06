# Feature Request — Astrographer: Configurable Multiple Document Stores for the RAG Engine

- **Status:** FEATURE REQUEST (for the Astrographer host project). Noted
  2026-09-05 by the Agent Harness `bulk-research` integration pass.
  **PROPOSAL GATE COMPLETE 2026-09-05: PROCEED-WITH-AMENDMENTS** — validity
  VALID-WITH-AMENDMENTS → critique UNSOUND-as-written (the literal five-ask
  package is rejected as written) → architecture PROCEED (Alternative B,
  Phase-1 slice, decisions D1–D12) → change-analysis PROCEED-WITH-AMENDMENTS
  (binding amendments A1–A10). Full record:
  `docs/specs/multi-document-store-config-review.md`. **USER GO-AHEAD GIVEN
  (2026-09-05): the Phase-1 slice is APPROVED** (5 units U-MS1 registry →
  U-MS2 wiring → U-MS4 id-prefixing → U-MS3 broadcast qualifier → U-MS5
  settings listing; execution order U-MS1 → U-MS2 → U-MS4 → U-MS3 → U-MS5);
  per-store embedders, cross-store fan-out, hot-apply, active-store UI,
  per-store RBAC, the root allowlist, and scratch-promotion are DEFERRED to
  Phase 2 (`docs/pending.md`). The eight decision rows are LANDED in
  `docs/decisions.md`.
- **Origin:** the Agent Harness **bulk-research workflow** (a reusable,
  level-gated research process) ingests each dependency level's research
  reports into Astrographer's RAG engine as persistent documentation —
  level gate: *docs + RAG before the next level's research proceeds*. The
  2026-09-05 live integration verification found the engine healthy and
  reachable (`127.0.0.1:3787`, MCP handshake OK, `rag.query` returning ranked
  results, `edit` group enabled) but **single-store**: run corpora would mix
  with the host project's own knowledge base in one store/index.

## What the feature asks

Config options to set up **multiple named document stores**, e.g. an
operator-settings shape (illustrative):

```jsonc
{
  "ragStores": [
    { "name": "main",              "default": true, "root": "<project root>" },
    { "name": "research-2026-09",  "root": "<per-store corpus dir>",
      "embedder": { "…provider-agnostic Unit F config…" } }
  ]
}
```

1. **Store registry in operator settings.** Per store: `name`, persistence
   file, corpus root (for `edit.import_markdown`), optional per-store
   embedder/provider config (the Unit F `EmbeddingProviderConfig` shape —
   PROVIDER-AGNOSTIC), and a `default: true` flag. Stores are configured
   server-side ONLY — never agent-supplied — preserving the current security
   posture.
2. **Store selector on MCP tools.** An optional `store` argument on the
   `rag.*` and `edit.*` tools, validated against the registry (unknown or
   malformed store ⇒ fail-loud error, consistent with the house fail-loud
   validation pattern). Omitted ⇒ default store, so **zero config = today's
   behavior** (100% backward compatible).
3. **Per-store persistence + index.** N `createJsonRagStore` instances (the
   existing module-store pattern), separate JSON files, separate lexical and
   vector indexes; boot loads all configured stores fail-disabled **per
   store** — a corrupt/missing one must not take the others down.
4. **Store-scoped retrieval.** `rag.query` scoped by `store`; an OPTIONAL
   cross-store `stores: "all"` mode (fan-out + score-merged ranking) if cheap.
5. **Minimal UI surface.** A settings section listing stores + the UI's active
   store; optionally a store qualifier on result node ids so cross-store
   results stay disambiguated.

## Motivation

- **Dogfooding (the direct driver):** each bulk-research run ingests into its
  own store (`research-<run-id>`), keeping the main knowledge base clean, and
  level-gated research can query only the run's corpus — or run + main.
- **Same mechanism, other uses:** per-project doc sets, per-client knowledge
  bases, staging vs. production corpora, import dry-runs into a scratch store
  before promoting.
- **Removes a staging wart:** today `edit.import_markdown`'s corpus root is
  fixed server-side to the project root, so an external process must STAGE
  its reports INTO the project root before import. A per-store root makes the
  import root a configuration value instead of a layout constraint.

## Constraints

- **SINGLE-WRITER-STORE compatibility** (`docs/decisions.md`, 2026-08-26):
  that decision pins "the RAG store is the lock point; the main process owns
  all writes; MCP and UI both route through it". Multi-store must preserve
  **per-store** single-writer semantics (each store keeps its own
  queue/mutex); the decision's letter ("THE store") becomes per-store rather
  than global — record the refinement in the decision log rather than
  silently breaking it.
- **Security groups unchanged:** `rag`/`edit` groups still gate the tools
  (default-off, persisted via the security store); the `store` argument adds
  no new capability — it selects which already-authorized store to address.
- **Fail-loud store validation:** store names unique + non-empty; exactly one
  `default`; roots absolute + inside an allowlisted base if desired; unknown
  `store` argument rejected with a clear error.
- **ONE-WAY SNAPSHOT semantics** of `edit.import_markdown` unchanged, per
  store.
- **No agent-supplied paths:** store selection is by NAME only; the corpus
  root stays server-side config (the containment seam must not become
  defeatable by a caller).

## Reference

- Integration verification: Agent Harness
  `docs/specs/bulk-research-live-pending-battery.md` §7/§8 (2026-09-05
  probes: server up, `edit` group enabled, `rag.query` ranked results, no
  dedicated `ingest` subcommand — the equivalent `run edit.*` path was used).
- Unit A store (`src/main/rag-store.ts`), Unit F embeddings
  (`docs/specs/unit-f-embeddings.md`), decisions SINGLE-WRITER-STORE +
  PROVIDER-AGNOSTIC + RAG-EDIT-MCP-GROUPS (`docs/decisions.md`).
- Consumer: Agent Harness `bulk-research` unit
  (`docs/specs/bulk-research.md` §5.10 — the fail-soft ingest contract).