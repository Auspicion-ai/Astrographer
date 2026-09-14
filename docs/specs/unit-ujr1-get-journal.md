# Unit U-JR1 — Read-Only MCP Tool `provident.get_journal` (Engine-Journal Introspection) — Spec

**Status:** **LANDED (2026-09-13)** — GREEN/DONE; unit 35/35, blind-greens 22/22,
trio 189 files / 4421 pass + 58 skip; see the Unit U-JR1 DONE row (`docs/next-steps.md`)
+ the doc review `archive/reviews/2026-09-13-unit-ujr1-doc-review.md`.
**Originally DRAFT 2026-09-12** (re-authored after `provident-ssr@0.5.0`);
**re-reconciled 2026-09-12 (SpecDoc PBT-gate pass)** — the spec is corrected to the
engine-faithful journal semantics (the default `journalEntries` window is a
RECENT-TAIL BACKSPAN from `cursor + REDO_PEEK(50)` — see §3.2/§5.2) and gains the mandatory typed §5.7
**Property register (PBT)**.
**Document-only — no code; no tests.** Gate: `DECIDED: JOURNAL-READ-VIA-PACKAGE`
(`docs/decisions.md`). **Depends on** `Supervisor.journalEntries(opts?):
JournalView` shipped by `provident-ssr@0.5.0` (the engine sanitizes the payload,
so this unit is a **thin renderer-routed read** — no host sanitization, no
mirror). This tool is the **engine-journal** read companion to the mutating
`provident.journal`; it is **NOT** C16's source (C16 consumes the RAG **project
journal** — `DECIDED: C16-CONSUMES-PROJECT-JOURNAL`, `unit-u-edit-2-*`).

**TestWriter RED (RCA-1) — EXECUTED (2026-09-13):** the red set (10 seam fails) was
run and reported BEFORE the Implementer pass, then landed green 35/35 in
`tests/unit-ujr1-get-journal.test.ts` (the §3/§4/§5.7 states) + the gate-6
HOST-BATTERY regression. See the Unit U-JR1 DONE row.

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
- **Window semantics (engine-faithful — the corrected reading):** `afterIndex`
  is an **ABSOLUTE start override, clamped to `[0, total]`**. When `afterIndex` is
  OMITTED, the default window spans the **RECENT TAIL back from
  `cursor + REDO_PEEK(50)`** (`cursorIndex = (basePresent ? 1 : 0) + undoStack.length`;
  `fromIndex = max(0, min(total, cursorIndex + 50) − limit)`). This INCLUDES the
  just-applied op — after one edit on a previously-empty journal, the applied
  op's row IS visible (`entries: [{index:0, kind, status}]`) — and the redo-able
  tail (up to 50 past the cursor). `limit` defaults to **500** and is clamped
  `[1, 1000]`. Head-trim (`fromIndex > 0`, `truncated: true`) happens **exactly**
  when `min(total, cursorIndex + 50) > limit`, i.e. when `limit` is smaller than
  the recent-tail backspan `min(total, cursorIndex + 50)` — so it is driven as
  much by a SMALL `limit` on a SHORT journal as by a large journal with the
  default `limit: 500` (e.g. a 5-entry journal, `limit: 3` →
  `fromIndex = max(0, min(5, 5+50) − 3) = 2 > 0`). There is no "journal must be
  ~500+" precondition. To observe older (deeply undoable) rows beyond the recent
  tail you pass `afterIndex: 0` (or an absolute index).

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

> **7th surface (gate-6 HOST fix, 2026-09-13):** the headless battery host
> (`src/main/battery-host.ts`) now also routes `journalEntries` —
> `RuntimeBackend.invoke` gained `case 'journalEntries':
> return this.runtime.journalEntries(p)` (lines 67–68), the class is exported
> (`export class RuntimeBackend implements McpBackend`), and the MCP server
> auto-start is guarded main-only (`isBatteryHostMain()`). This mirrors the
> renderer seam so the headless battery can serve the tool; it is a HOST
> surface, not one of the six core seams above. It is pinned by the unit's
> HOST-BATTERY regression test and closes the live-pending §0.2 finding (the
> battery host advertised the tool but returned `unknown method: journalEntries`).

### 2.3 Security / scope

- Group **`read`** (default-ON; beside `get_node_state`). Payload is
  `{index,kind,status}` + O(1) depth accessors — no content, node refs, snapshot,
  or census. No mutation/side effects; absent from `MUTATING_METHODS`.

## 3. States (TestWriter red set — valid paths)

1. Empty journal → `entries: []`, `undoDepth: 0`, `redoDepth: 0`,
   `basePresent: false`, `undoBaseBoundary: false`, `fromIndex: 0`,
   `totalEntries: 0`, `truncated: false`; both top-kind keys omitted.
2. After an applied edit → **both** the position accessors and the default window
   reflect it: `undoDepth` increments and `undoTopKind` appears (the redo stack
   is empty, so `redoTopKind` is omitted); and the default (no `afterIndex`)
   window shows the applied op's row on a previously-empty journal —
   `entries: [{index:0, kind, status}]`, `fromIndex: 0`, `truncated: false`.
   `afterIndex: 0` also works but is not required to see the applied op on a
   small journal. Head-trim (`fromIndex > 0`, `truncated: true`) happens **exactly**
   when `min(total, cursorIndex + 50) > limit` — caused as much by a SMALL `limit`
   on a short journal as by a large journal with the default `limit: 500`
   (§2.1/§5.2); it is never a "journal must be large" precondition.
3. `afterIndex`/`limit` honored (engine-clamped) → the absolute window start
   (`afterIndex` clamped `[0,total]`) / the `limit` (clamped `[1,1000]`) shape
   `fromIndex`/`entries.length`/`totalEntries`; `truncated` reflects the clamp.
4. A large journal → `truncated: true` + `totalEntries > entries.length`.
5. A condensed base present → `basePresent: true`; a `base` entry appears in
   `entries` when the window includes it.
6. Read-only → no `app-graph-changed` emit, no re-render, no graph mutation; a
   drainable/undoable journal stays at the same state across calls.
7. Group gate → the tool is unavailable when the `read` group is disabled.

## 3a. Adversarial findings (read-only, after green)

> Per the sibling convention (`docs/specs/unit-gn-mcp-ui-wiring.md` §3a/§3b),
> this register is populated by the post-green adversarial pass (RCA-3). Host
> findings are recorded here (fixed here + regression-tested); the package is
> never patched. This is a READ-ONLY audit record — no test/code change is
> implied unless stated (RCA-3 + RCA-6).

- **AF-1 — HOST — LOW — ACCEPTED/recorded, no code change.** `runtime.ts` /
  the renderer pass `opts` verbatim (the thin-read pin, §2.2 row 5–6): a
  non-finite `afterIndex` (NaN) would yield `fromIndex: NaN` → JSON `null`, but
  this is NOT reachable via the MCP tool — the SDK `z.number()` rejects
  non-numbers, JSON-RPC cannot carry NaN/Infinity, and unknown/extra keys are
  stripped (F6). Finiteness is the SDK layer's contract; recorded here to make
  the thin-read intent explicit (no host clamping was added, by design).
- **AF-2 — SPEC — MED — FIXED (this edit).** The old `~550`/`~500` head-trim
  framing was over-strength: the default head-trim is driven by `limit` as much
  as by journal growth. Corrected to the EXACT formula +
  `fromIndex = max(0, min(total, cursorIndex + REDO_PEEK(50)) − limit)` with
  `fromIndex > 0 ⟺ min(total, cursorIndex + 50) > limit`, plus the canonical
  5-entry/`limit:3` counterexample (§5.2/§5.7 P-IM-2). The register can no
  longer be misread to "reject" a correct engine.
- **AF-3 — HOST(tests) — INFO — ACCEPTED/recorded, no code change.** Malformed
  /non-finite `opts` (F2/F6) are pinned at the unit layer only; no PBT negative
  generator exists (per the register's anti-F-rows rule, §5.7). Adequate by
  design — the negative surface is already §4 F2/F6; recorded for completeness.
- **AF-4 — HOST(tests) — MED — FIXED (companion test pass).** A dynamic
  renderer-RPC notify test was added asserting that a `journalEntries` RPC
  through a notify-observing bridge emits ZERO `app-graph-changed` callbacks
  (positive control: a `dispatch` RPC emits one), closing the P-IM-3/P-TP-1
  static-only gap. Pointer note: the companion test landed in
  `tests/unit-ujr1-get-journal.test.ts` (supervisor confirms it).

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | empty journal | the §3.1 empty shape; never throws |
| F2 | malformed opts (`afterIndex`/`limit` non-number, negative, huge) | engine clamps/ignores; never throws; no drain/mutate. `afterIndex` clamped to `[0,total]`; `limit` clamped to `[1,1000]`; an omitted `afterIndex` keeps the default recent-tail window, an omitted `limit` defaults to 500 |
| F3 | `base` condense marker | surfaced as `{kind:'base'}` + `basePresent: true` (visible when the window includes it); consumer distinguishes via `kind`/`undoBaseBoundary` |
| F4 | read while a mutating tool is in flight | synchronous snapshot at call time; no flush/interleave |
| F5 | JSON-safety | no `Node` refs / snapshot / internal id serialized (engine guarantees) |
| F6 | unknown/extra tool args | ignored; never throws |

## 5. The exhaustive contract (reconciled semantics + PBT register)

This is a **code-bearing** unit, so the typed property register is mandatory
(§5.7). The following subsections pin the engine-faithful reading that the
register's propositions are derived from — verified against
`node_modules/provident-ssr/dist/core/supervisor.d.ts` lines 51–87,159.

### 5.1 The engine surface (confirmed facts)

Verified against the `.d.ts`: `JournalViewOptions = { afterIndex?: number;
limit?: number }`; `JournalView = { entries, fromIndex, totalEntries, truncated,
undoDepth, redoDepth, basePresent, undoBaseBoundary, undoTopKind?, redoTopKind?,
maxJournalLength? }`. `undoTopKind`/`redoTopKind` are omitted when the
corresponding stack is empty (`exactOptionalPropertyTypes`); `maxJournalLength` is
omitted when undefined. `journalEntries` is **read-only, non-draining, never
awaits/renders** — a pure projection of the journal + position accessors, and
JSON-safe.

### 5.2 The default recent-tail (REDO_PEEK) window

`afterIndex` is an ABSOLUTE start override clamped to `[0,total]`. When it is
NOT passed, the default window spans the **RECENT TAIL back from
`cursor + REDO_PEEK(50)`**: `cursorIndex = (basePresent ? 1 : 0) + undoStack.length`,
`toIndex = min(total, cursorIndex + REDO_PEEK)`,
`fromIndex = max(0, toIndex − limit)`, `end = min(total, fromIndex + limit)`,
with `limit` defaulting to 500. Consequence: after one applied edit on a
previously-empty journal the applied op IS visible (`entries: [{index:0, kind,
status}]`, `fromIndex: 0`, `truncated: false`) — **NOT `[]`**. The redo-able tail
(up to 50 past the cursor) stays in view (a recently-undone op is not masked).
The EXACT head-trim threshold (the only framing the engine supports) is:
`fromIndex = max(0, min(total, cursorIndex + REDO_PEEK(50)) − limit)`; the
default window head-trims (`fromIndex > 0`, `truncated: true`) exactly when
`min(total, cursorIndex + 50) > limit`. **This is NOT "journal must be large".**
A small `limit` on a SHORT journal head-trims exactly as loudly as a large
journal with the default `limit: 500`. Canonical counterexample (do not misread
the register to reject this engine): a **5-entry** journal, no `afterIndex`,
`limit: 3` → `fromIndex = max(0, min(5, 5+50) − 3) = 2 > 0`, `truncated: true`.
This is the engine-faithful reading verified against `supervisor.js:199-244`; a
prior draft wrongly claimed the applied op's row is absent from the default
window after an edit.

### 5.3 `afterIndex` / `limit` clamps

`afterIndex` clamped to `[0,total]`; `limit` defaults to 500 and is clamped
`[1,1000]`. `fromIndex` reflects the effective window start; `truncated` reflects
a clamping/overrun.

### 5.4 Position accessors + omissible keys

`undoDepth`/`redoDepth` mirror the stacks; each top-kind key is present exactly
when the corresponding stack is non-empty; `basePresent === true` exactly when a
`base` condense marker exists anywhere in the journal; `undoBaseBoundary` is true
only at the floor (the undo stack empties because it was truncated at the
condensed base).

### 5.5 Read-only, non-draining, JSON-safe guarantees

`journalEntries` never mutates, drains, awaits, flushes, or re-renders. A call
leaves `undoDepth`/`redoDepth`/`basePresent` and the whole journal state
IDENTICAL. The payload carries no live `Node` refs, snapshot payloads, or the
internal entry id.

### 5.6 State reconciliation (what the register consolidates)

An earlier draft read the default window as cursor-relative REDO_PEEK AHEAD of
the cursor and wrongly claimed the applied edit's row was absent from the
default window (`entries: []` after an edit, conflating the position accessors —
which DO reflect the edit — with the entries window). That reading was itself
incorrect and has been **CORRECTED BACK** to the engine-faithful recent-tail
reading (§2.1/§5.2): the default window spans the tail back from
`cursor + REDO_PEEK(50)`, so the just-applied op and the redo-able tail are
included. The corrected §3.2 and the register rows here derive the states from
`supervisor.js:199-244`. The register consolidates §3.2 (position accessors +
visible default window), §3.3/§3.4 (§5.2/§5.3 window clamps), §3.6 read-only, and
the §4 fail-states F1 (omissible keys), F2 (clamp/ignore), F3 (base marker) — in
invariant form.

### 5.7 Property register (PBT)

This register follows the **`docs/specs/unit-gn-mcp-ui-wiring.md` §5.7** and
**`docs/specs/unit-shell-integration.md` §5.7** convention (identical row typings,
≤8-row cap, class tally line, and the deterministic seeding/≤100-per-row/≤400
total/stop-after-5 budget — see the siblings' PBT-gate note). Rows are typed
**P-IM** (input-model), **P-SM** (state-model), or **P-TP** (transform) — NEVER
F-rows, NEVER §6/FS-n rows (this unit's fail-states already exist as §4 F1–F6).
The register is genuinely invariant-bearing: `journalEntries` is a deterministic
pure projection; the window semantics are well-defined; the read is provably
side-effect-free; the position accessors mirror the stacks; and the 6-seam
routing is total + non-mutating.

| Ref | Class | Invariant | Strategy | Checkable proposition (∀ pattern) |
|---|---|---|---|---|
| `P-IM-1` | IM | **`journalEntries` is a deterministic pure projection.** The same journal + position state always yields the IDENTICAL `JournalView` (no side effects, no wallclock/global-state dependence); re-calling immediately returns the same shape. | `strat:journal-pure-projection` | ∀ journal+position state `S`: calling `journalEntries()` twice in immediate succession returns two deep-equal `JournalView`s (equal `entries`, `fromIndex`, `totalEntries`, `truncated`, `undoDepth`, `redoDepth`, `basePresent`, `undoBaseBoundary`, top-kind/max-length presence). |
| `P-IM-2` | IM | **Window semantics.** With `afterIndex` set, the window is absolute — the start is `afterIndex` clamped to `[0,total]` and `entries.length ≤ limit`; with NO `afterIndex`, the window is the RECENT TAIL back from `cursorIndex + REDO_PEEK(50)` (`fromIndex = max(0, min(total, cursorIndex+50) − limit)`), so it includes the just-applied op and the redo-able tail. Head-trim (`fromIndex > 0`, `truncated: true`) happens EXACTLY when `min(total, cursorIndex + 50) > limit` — driven by `limit` as much as by journal growth (a small `limit` head-trims a short journal: 5 entries/`limit:3` → `fromIndex = 2`, `truncated: true`). `limit` defaults to 500, clamped `[1,1000]`. | `strat:journal-window` | ∀ generated state: `0 ≤ fromIndex ≤ totalEntries` and `entries.length ≤ limit`; with `afterIndex` set, `fromIndex === clamp(afterIndex, 0, totalEntries)`; with `afterIndex` omitted, `fromIndex === max(0, min(total, cursorIndex+50) − limit)` and `fromIndex > 0 ⟺ min(total, cursorIndex+50) > limit` (head-trim) with `truncated` reflecting it; on a truly empty journal `entries === []`. |
| `P-IM-3` | IM | **Read-only.** Calling `journalEntries` NEVER mutates: `undoDepth`/`redoDepth`/`basePresent` (and the whole journal) are IDENTICAL before and after a call; a drained/undoable journal stays at the same state; no render/flush/interleave/side effect. | `strat:journal-readonly` | ∀ pre-call state `S0`: after one (or many) `journalEntries` call(s), the post-call `undoDepth`/`redoDepth`/`basePresent` and journal snapshot are identical to `S0`; no `MUTATING_METHODS`/`app-graph-changed` notification fires. |
| `P-SM-1` | SM | **Faithful position accessors.** `undoDepth`/`redoDepth` mirror the stacks; each top-kind key is present EXACTLY when the corresponding stack is non-empty; `basePresent === true` exactly when a `base` condense marker exists (and a `base` entry appears in the window that includes it); `undoBaseBoundary` is true only at the floor. | `strat:journal-faithful` | ∀ generated state: `undoTopKind` present ⟺ `undoDepth > 0`; `redoTopKind` present ⟺ `redoDepth > 0`; `basePresent` ⟺ a `base`-kind entry exists in the journal (visible in a window that includes it); `undoBaseBoundary === true` ⟹ the undo stack is empty at the condensed base. |
| `P-TP-1` | TP | **The seam routing is total + non-mutating.** The renderer `case 'journalEntries'` returns `runtime.journalEntries(req.payload)`; `'journalEntries'` is NOT in `MUTATING_METHODS`; the MCP tool `provident.get_journal` resolves to the `read` group via `groupForTool`; its handler calls `backend.invoke('journalEntries', args)`. | `strat:journal-seam-total` | ∀ `journalEntries` payload: renderer dispatch returns `runtime.journalEntries(req.payload)`; `'journalEntries' ∉ MUTATING_METHODS`; `groupForTool('provident.get_journal') === 'read'`; the MCP tool handler invokes `journalEntries` with the supplied args. |

**Class tally:** IM ×3, SM ×1, TP ×1 = **5 rows ≤ 8** ✔.

The rows above are **NOT over-strength**: every proposition is directly
observable from the pinned `.d.ts` surface (supervisor.d.ts lines 51–87,159) or
from the six pinned seams (§2.2) — none reach into engine internals beyond the
documented contract, none invent a `JournalView` field, and none demand a new
seam. They consolidate the §3/§4 rows already pinned here — §3.2 (position
accessors), §3.3/§3.4 (window clamps), §3.6 read-only, and §4 F1 (omissible
keys), F2 (clamp/ignore), F3 (base marker) — into invariant form rather than
adding new fail-state surface. The register does **not** expand the unit beyond
the §2.2 seam set.

> **Gate-6 additive note (2026-09-13):** the battery host is now ALSO
> `journalEntries`-serving — `RuntimeBackend.invoke` routes it (source-pinned by
> the HOST-BATTERY test in `tests/unit-ujr1-get-journal.test.ts`), so
> `P-TP-1`'s "total + non-mutating" routing claim extends to the headless
> battery surface as well. The 5 register rows themselves are unchanged; only
> the routing surface is enlarged. See the §2.2 "7th surface" note.

### 5.8 Census (preserved verbatim)

- 1 `RpcMethod` (`journalEntries`), 1 `TOOL_GROUPS` row, 1 `ALL_TOOLS` row, 1 SDK
  registration, 1 renderer case, 1 runtime method. 0 new dependencies; no
  `provident-ssr` change.
- **7th surface (gate-6, not counted above):** the battery host's
  `RuntimeBackend.invoke` adds 1 `case 'journalEntries'` (a mirrored HOST
  surface; `RuntimeBackend` exported + the server auto-start guarded main-only).
  No new ALL_TOOLS row — it reuses the same `provident.get_journal` tool.

### 5.9 Cross-references

- `docs/decisions.md` `DECIDED: JOURNAL-READ-VIA-PACKAGE`,
  `DECIDED: C16-CONSUMES-PROJECT-JOURNAL`, `DECIDED: PROJECT-JOURNAL`.
- `docs/defects.md` `ENG-JOURNAL-ENTRY-READ-API` (RESOLVED in 0.5.0),
  `docs/HANDOFF.md`.
- Engine: `node_modules/provident-ssr/dist/core/supervisor.d.ts:51-87,159`.
- Precedent: `provident.get_node_state` (`mcp-server.ts:2200-2218`),
  `provident.get_rendered_html`, `provident.journal`.

## 6. Delimitation

This unit adds one read-only MCP tool + its seams. It does **NOT** implement the
C16 history sub-pane (U-EDIT-2, which reads the RAG **project journal**), does
**not** change journal semantics, does **not** add a mutation/seek, does **not**
serialize the journal, and does **not** patch `node_modules/provident-ssr/` or
`../Preempt-Providence/`.

## 7. Open items

**None.** Depends only on the shipped `provident-ssr@0.5.0` surface. (The
unit's live-scenario battery remains PARKED on the running-app surface —
`docs/specs/unit-ujr1-get-journal-live-pending-battery.md`; the §0.2 battery-host
`unknown method` finding is FIXED.)
