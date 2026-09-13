# Unit U-JR1 — Read-Only MCP Tool `provident.get_journal` (Engine-Journal Introspection) — Spec

**Status:** DRAFT 2026-09-12 (re-authored after `provident-ssr@0.5.0`).
**Document-only — no code; no tests.** Gate: `DECIDED: JOURNAL-READ-VIA-PACKAGE`
(`docs/decisions.md`). **Depends on** `Supervisor.journalEntries(opts?):
JournalView` shipped by `provident-ssr@0.5.0` (the engine sanitizes the payload,
so this unit is a **thin renderer-routed read** — no host sanitization, no
mirror). This tool is the **engine-journal** read companion to the mutating
`provident.journal`; it is **NOT** C16's source (C16 consumes the RAG **project
journal** — `DECIDED: C16-CONSUMES-PROJECT-JOURNAL`, `unit-u-edit-2-*`).

**TestWriter RED is the NEXT step (RCA-1):** author
`tests/unit-ujr1-get-journal.test.ts` from this spec ALONE and RUN it red before
any Implementer pass.

---

## 1. What the proposal asks

Add a **read-only** MCP tool `provident.get_journal` that returns the engine's
sanitized journal snapshot + position accessors. The engine surface already
exists (`provident-ssr@0.5.0`); the unit only wires the host seams (mirroring the
`provident.get_node_state` read precedent). No mutation, no side effects, no
`app-graph-changed` push.

## 2. Contract (pinned)

### 2.1 The engine surface (consumed, not re-implemented)

```ts
// node_modules/provident-ssr/dist/core/supervisor.d.ts
interface JournalEntryView { index: number; kind: string; status: string }
interface JournalViewOptions { afterIndex?: number; limit?: number }  // limit clamped [1,1000]
interface JournalView {
  entries: JournalEntryView[]
  fromIndex: number
  totalEntries: number
  truncated: boolean
  undoDepth: number
  redoDepth: number
  basePresent: boolean
  undoBaseBoundary: boolean
  undoTopKind?: string      // omitted when the undo stack is empty
  redoTopKind?: string      // omitted when the redo stack is empty
  maxJournalLength?: number // omitted when undefined
}
Supervisor.journalEntries(opts?: JournalViewOptions): JournalView
```

- **No host sanitization:** the engine's `JournalView` is already JSON-safe
  (never live `Node` refs, snapshot payloads, or the internal entry id).
- **Position semantics:** `undoDepth` is the cursor; `basePresent` marks a
  condense marker anywhere; `undoBaseBoundary` marks the floor.

### 2.2 Tool + seam set (mirrors `provident.get_node_state`)

| # | File | Change |
| --- | --- | --- |
| 1 | `src/main/security.ts` | `TOOL_GROUPS` gains `'provident.get_journal': 'read'` (beside `'provident.get_node_state'`). |
| 2 | `src/main/mcp-server.ts` | `ALL_TOOLS` gains `'provident.get_journal'` (near `'provident.get_node_state'`). |
| 3 | `src/main/mcp-server.ts` | Register the SDK tool (mirror the `get_node_state` block): `inputSchema: { afterIndex: z.number().optional(), limit: z.number().optional() }`; `const value = await backend.invoke('journalEntries', args)`; `return text(value)`. |
| 4 | `src/shared/types.ts` | `RpcMethod` gains `'journalEntries'` (near `'journal'`). Optionally re-export/mirror `JournalView` for typing. |
| 5 | `src/renderer/renderer.ts` | Add `case 'journalEntries': value = runtime.journalEntries(req.payload); break`. **NOT** added to `MUTATING_METHODS` — read-only, so no `app-graph-changed` notify. |
| 6 | `src/renderer/runtime.ts` | Add `journalEntries(opts?: JournalViewOptions): JournalView` → `return this.supervisor.journalEntries(opts)`. Never `await`s, never `render()`/`settleGate()`, never drains pass-2, never flushes. |

Not in the seam set: no `MUTATING_METHODS` entry, no `app-graph-changed`
broadcast, no MCP resource, no new dependency, no engine change, no host
sanitization.

### 2.3 Security / scope

- Group **`read`** (default-ON; beside `get_node_state`). Payload is
  `{index,kind,status}` + O(1) depth accessors — no content, node refs, snapshot,
  or census. No mutation/side effects; absent from `MUTATING_METHODS`.

## 3. States (TestWriter red set — valid paths)

1. Empty journal → `entries: []`, `undoDepth: 0`, `redoDepth: 0`,
   `basePresent: false`, `undoBaseBoundary: false`, `fromIndex: 0`,
   `totalEntries: 0`, `truncated: false`; both top-kind keys omitted.
2. After an applied edit → `entries` gains `{index,kind,status}`, `undoDepth`
   increments; Undo enabled.
3. `afterIndex`/`limit` honored (engine-clamped) → `fromIndex`/`totalEntries`
   reflect the window.
4. A large journal → `truncated: true` + `totalEntries > entries.length`.
5. A condensed base present → `basePresent: true`; a `base` entry appears in
   `entries`.
6. Read-only → no `app-graph-changed` emit, no re-render, no graph mutation.
7. Group gate → the tool is unavailable when the `read` group is disabled.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | empty journal | the §3.1 empty shape; never throws |
| F2 | malformed opts (`afterIndex`/`limit` non-number, negative, huge) | engine clamps/ignores; never throws; no drain/mutate |
| F3 | `base` condense marker | surfaced as `{kind:'base'}` + `basePresent: true`; consumer distinguishes via `kind`/`undoBaseBoundary` |
| F4 | read while a mutating tool is in flight | synchronous snapshot at call time; no flush/interleave |
| F5 | JSON-safety | no `Node` refs / snapshot / internal id serialized (engine guarantees) |
| F6 | unknown/extra tool args | ignored; never throws |

## 5. Census

- 1 `RpcMethod` (`journalEntries`), 1 `TOOL_GROUPS` row, 1 `ALL_TOOLS` row, 1 SDK
  registration, 1 renderer case, 1 runtime method. 0 new dependencies; no
  `provident-ssr` change.

## 6. Cross-references

- `docs/decisions.md` `DECIDED: JOURNAL-READ-VIA-PACKAGE`,
  `DECIDED: C16-CONSUMES-PROJECT-JOURNAL`, `DECIDED: PROJECT-JOURNAL`.
- `docs/defects.md` `ENG-JOURNAL-ENTRY-READ-API` (RESOLVED in 0.5.0),
  `docs/HANDOFF.md`.
- Engine: `node_modules/provident-ssr/dist/core/supervisor.d.ts:51-87,159`.
- Precedent: `provident.get_node_state` (`mcp-server.ts:2156-2174`),
  `provident.get_rendered_html`, `provident.journal`.

## 7. Delimitation

This unit adds one read-only MCP tool + its seams. It does **NOT** implement the
C16 history sub-pane (U-EDIT-2, which reads the RAG **project journal**), does
**not** change journal semantics, does **not** add a mutation/seek, does **not**
serialize the journal, and does **not** patch `node_modules/provident-ssr/` or
`../Preempt-Providence/`.

## 8. Open items

**None.** Depends only on the shipped `provident-ssr@0.5.0` surface.
