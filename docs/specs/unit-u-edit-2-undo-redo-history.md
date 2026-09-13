# Unit U-EDIT-2 — Undo / Redo + Interactive History Sub-Pane (C16) — Spec

**Status:** DRAFT 2026-09-12. **Document-only — no code; no tests.** Gate: the
UI-overhaul umbrella gate (PROCEED-WITH-AMENDMENTS, A1). **Depends on
U-STATE-1** (the `Supervisor` + journal stack must persist across a content
change — `runtime.ts` used to construct a new `Supervisor` per `loadEnvelope`;
SG1 landed, so this is unblocked). Resolved: Q14 **repeated `undo`**; `replay` is
**not** a control. Open items in `docs/specs/wave-2-open-decisions.md`
(W2-Q14/Q15). **Chrome-independent — does not need U-SHELL-1.**

**TestWriter RED is the NEXT step (RCA-1):** author
`tests/unit-u-edit-2-undo-redo-history.test.ts` from this spec ALONE and RUN it
red before any Implementer pass.

---

## 1. What the proposal asks

An **undo/redo tool with a history sub-pane** (C16). The engine journal exists
(`provident.journal` `undo`/`redo`/`replay`, `Runtime.journal()`
`runtime.ts:804`) but has **no UI**; edits rely on browser-native behavior.
Deliver editor-toolbar **Undo**/**Redo** controls **plus an interactive history
sub-pane**, app-graph (MCP-visible), driven through the same
`provident.journal` application seam. **Clicking a history entry undoes the
journal back to that point** (multi-step undo, implemented as repeated `undo`).
`replay` is not a separate control.

## 2. Contract (pinned)

### 2.1 Undo / Redo controls (app-graph)

- Two editor-toolbar controls (G1, beside the C8 toggle): **Undo** and **Redo**,
  each a provident node with an `on:click` handler so `provident.dispatch`
  reaches it.
- A click invokes the **same application seam** as the MCP
  `provident.journal` tool (`Runtime.journal('undo'|'redo')`) — one operation,
  two entry paths (MCP/UI equivalence). After the op, the app graph re-renders
  (the Runtime already re-renders + drains pass-2 in `journal()`).
- **Disabled state:** Undo is disabled when the undo stack is empty; Redo when
  the redo stack is empty (reflects `stackTopKind`/`redoTopKind`; §2.3).

### 2.2 Interactive history sub-pane (app-graph)

- A history sub-pane lists the journal entries in order, app-graph + MCP-visible.
- **Click-to-undo-to-point:** clicking entry *k* undoes the journal back to that
  point via N successive `undo` calls (user-confirmed "repeat undo is fine"),
  where N = (current position − target position), then re-renders. It must be
  **idempotent-safe** and stop at the base boundary (never throw).
- `replay` is **not** offered. A future "seek" is out of scope (only if the
  engine exposes a journal seek — not assumed).

### 2.3 Journal introspection (RESOLVED — C16 consumes the RAG **project journal**, 2026-09-12)

`provident-ssr@0.5.0` adds the sanitized engine reader
`Supervisor.journalEntries(opts?): JournalView` (`ENG-JOURNAL-ENTRY-READ-API`
**RESOLVED upstream**; `docs/decisions.md` `DECIDED: JOURNAL-READ-VIA-PACKAGE`).
**USER RULING (2026-09-12): C16 consumes the RAG store's PROJECT journal**, which
is the existing `DECIDED: PROJECT-JOURNAL` decision (*"undo/redo lives in the RAG
store's own project journal, not the engine Supervisor journal"*).
**Rationale:** the project journal is **easier to isolate from UI-structure
changes** — the engine journal dies on a rebuild / re-derive (a re-traversal
mints a fresh graph), while the project journal records invertible entries and
survives.

- **Source:** `RagStore.journal(): JournalEntry[]` (`src/main/rag-store.ts:262`;
  entry kinds `content` / `structural` / `batch`, each carrying `at`), read in
  the renderer via a host read seam (§2.5). No engine journal.
- **U-JR1 is separate:** the engine `journalEntries()` reader backs only the host
  MCP `provident.get_journal` tool (engine-journal introspection), NOT C16.
- **Rejected:** the engine journal as C16's source (wiped by a re-derive);
  probing via repeated undo/redo (destructive/ambiguous).

**U-EDIT-2 is unblocked** on both the read surface and the consumption choice.
Prerequisite before red: the project-journal read seam (§2.5 / IPC).

### 2.4 Persistence + content change

- C16's source is the **project journal**, which **is persisted** by the RAG
  store (`docs/decisions.md` `DECIDED: PROJECT-JOURNAL`); the history therefore
  survives restart and **must survive a RAG content change / UI re-derive**
  (U-STATE-1) — the project journal is not wiped by a re-derive.
- Undo/redo route through the project-journal ops (`RagStore.undo()`/`redo()`),
  not the engine `Supervisor`; the per-entry label/position derives from
  `JournalEntry.kind` + the journal `at`/cursor.

## 3. States (TestWriter red set — valid paths)

1. Boot with an empty journal → Undo/Redo disabled; the history list empty.
2. Dispatch an edit → the history list gains an entry; Undo enabled.
3. Click Undo → the edit is reverted; the graph re-renders; Redo enabled.
4. Click Redo → the edit re-applies.
5. Click history entry *k* → the journal undoes to that point (N repeated
   `undo`); the list/position reflects it.
6. Undo past the base boundary → safe stop; no throw; Undo disabled at the base.
7. A RAG content change keeps the journal stack (history survives).
8. The controls are app-graph nodes: `list_targets` includes them;
   `provident.dispatch` on Undo equals the MCP `provident.journal` seam.
9. `replay` is not exposed as a control.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | Undo on an empty stack | no-op; never throws |
| F2 | Redo on an empty redo stack | no-op; never throws |
| F3 | click-to-undo target ≥ current position | no-op / no forward seek (no implicit redo) |
| F4 | a journal op swaps node objects (base-restore) | the render baseline + id index rebuild (Runtime J3); MCP targets stay valid |
| F5 | an edit while an undo is in flight | queued; no interleaved double-undo |
| F6 | a history entry label missing (introspection gap) | renders the op kind/index; never throws |
| F7 | a content change mid-history-walk | the walk aborts safely at the new stack state |
| F8 | a stale history node clicked after a base-restore | no-op on an unknown target |

## 5. Census

- App-graph: Undo/Redo controls + handlers, the history sub-pane list + entry
  handlers (provident-authored); host: the history-log/introspection adapter
  (W2-Q14). Reuse of `Runtime.journal()`; **no** new MCP tool; 0 new
  dependencies (unless W2-Q14 (a) forces an upstream handoff).

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C16, §4 G1 (PG1), §5.7 SG1/SG8, §7 Q14,
  §8.1 (U-EDIT-2 depends on U-STATE-1).
- `docs/specs/unit-u-state-1b-host-application.md`,
  `unit-u-state-1c-persistent-scaffolding.md`, `unit-u-edit-1-markdown-html-toggle.md`.
- Decisions: `UI-CONFIG-CARRIER` (not used for the journal — process-local).
- Build: `src/renderer/runtime.ts` (`journal`, `settleGate`),
  `src/renderer/sidebar-panes.ts` (editor toolbar/render), `src/renderer/pane-graph.ts`.

## 7. Delimitation

This unit adds the undo/redo controls + the history sub-pane. It does NOT change
the engine journal semantics, does NOT add a `replay` control, and does NOT
serialize the journal. Journal-entry introspection is provided by
**`provident-ssr@0.5.0`**'s `Supervisor.journalEntries()` (see §2.3); the host
`provident.get_journal` tool is a thin read over it. Never patch the package.

## 8. Open items

W2-Q14 (journal introspection — **RESOLVED: `provident-ssr@0.5.0`; C16 consumes the RAG project journal**), W2-Q15
(entry labelling/condense semantics). **U-EDIT-2 is unblocked**; the prerequisite
before red is the project-journal read seam (§2.3/§2.5).
