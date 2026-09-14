# Blind-test Greens — Unit U-JR1: Read-only MCP tool `provident.get_journal` (engine-journal introspection, thin renderer-routed read)

- **Blind-test writer run:** fresh agent, **DOCUMENTATION ONLY** —
  `docs/specs/unit-ujr1-get-journal.md` (§3 states, §4 fail-states F1–F6, §5.7
  property register P-IM-1/2/3, P-SM-1, P-TP-1). NO implementation read while
  authoring expected outcomes (`src/main/mcp-server.ts`, `src/main/security.ts`,
  `src/renderer/renderer.ts`, `src/renderer/runtime.ts`, `src/shared/types.ts`).
  Scenarios are derived from the docs alone; a PASS is a genuine blind verification.
- **Document-only source of the EXPECTED outcomes:** `unit-ujr1-get-journal.md`
  §2.1/§2.2/§2.3, §3.1–§3.7, §4 F1–F6, §5.1–§5.7.
- **Run file:** `tests/blind-unit-ujr1-get-journal-greens.test.ts` (vitest).
- **Source under test (LIVE modules):** `src/renderer/runtime.js`
  (`Runtime.prototype.journalEntries` → `this.supervisor.journalEntries(opts)`)
  over a real `Supervisor` (provident-ssr@0.5.0), `src/renderer/renderer.ts` (the
  `case 'journalEntries'` RPC routing + `MUTATING_METHODS` negative), `src/main/security.js`
  (`groupForTool`/`TOOL_GROUPS`/`SecurityGate`), `src/main/mcp-server.ts`
  (`ProvidentMcpServer.ALL_TOOLS` + group-gated registration + the SDK tool's
  `backend.invoke('journalEntries', args)`), `src/shared/types.ts` (`RpcMethod`).
- **Runner invocation:** `npx vitest run tests/blind-unit-ujr1-get-journal-greens.test.ts`
  from the Astrographer repo root. **24 test blocks, `Duration 473ms`, all green.**

## Legend

- **PASS** — behavior matches the spec contract (verified by running the live module this pass).
- **FAIL** — doc/spec drift OR an un-hardened regression (never a pass).
- **NOT-TESTED** — the scenario's precondition could not be driven on the live small demo graph.

The engine behaves exactly per the spec's engine-faithful §2.1/§5.2 window
semantics: the default `journalEntries` window is the RECENT TAIL back from
`cursor + REDO_PEEK(50)` — after one edit on a previously-empty journal the
applied op's row IS visible (`[{index:0,…}]`), NOT `[]`; the 5-entry/`limit:3`
counterexample head-trims (`fromIndex = 2`, `truncated: true`).

---

## §3 valid-path states (derived from spec §3.1–§3.7)

### S1. §3.1 — empty journal shape
Probe: a fresh `Runtime` (dom-shim + `demoEnvelope`, not bootstrapped, no edits);
`runtime.journalEntries()`.
Expected: `entries: []`, `undoDepth: 0`, `redoDepth: 0`, `basePresent: false`,
`undoBaseBoundary: false`, `fromIndex: 0`, `totalEntries: 0`, `truncated: false`;
both top-kind keys omitted, `maxJournalLength` omitted; never throws.
**Result: PASS**

### S2. §3.2 — after an applied edit (position accessors + default window)
Probe: `runtime.bootstrap()` then one `state-slice` on the counter node; `journalEntries()`
(default window, no `afterIndex`).
Expected: `undoDepth` increments (1), `undoTopKind` appears (`'state-slice'`), redo stack
empty so `redoTopKind` omitted; the default window shows the just-applied op on the
previously-empty journal — `entries: [{index:0, kind, status}]`, `fromIndex: 0`,
`truncated: false`. `afterIndex: 0` also shows the row.
**Result: PASS**

### S3a. §3.3 — absolute `afterIndex` start override (clamped `[0,total]`)
Probe: 5 seeded edits; `journalEntries({afterIndex: 2, limit: 2})` and `{afterIndex: 100}`
and `{afterIndex: -5}`.
Expected: `afterIndex:2 → fromIndex 2`, entries indices `[2,3]`, `entries.length 2`,
`totalEntries 5`; `afterIndex:100 → fromIndex 5` (clamped to total), `entries: []`;
`afterIndex:-5 → fromIndex 0`.
**Result: PASS**

### S3b. §3.3 — `limit` clamp `[1,1000]` bounds `entries.length`
Probe: 5 seeded edits; `journalEntries({afterIndex:0, limit:0})` and `{afterIndex:0, limit:999999}`.
Expected: `limit:0 → entries.length ≤ 1` (clamped up to 1); `limit:999999 → entries.length
=== totalEntries (5)`, never exceeding 1000.
**Result: PASS**

### S4a. §3.4 — large journal, default `limit:500` → head-trim
Probe: 501 seeded edits (the default `limit:500`); `journalEntries()`.
Expected: `totalEntries: 501`, `entries.length: 500`, `totalEntries > entries.length`,
`fromIndex > 0`, `truncated: true`.
**Result: PASS**

### S4b. §3.4 — a SMALL `limit` on a SHORT journal head-trims exactly as loudly (no "journal must be large" precondition)
Probe: 5 seeded edits; `journalEntries({limit: 3})` (the §2.1/§5.2 canonical counterexample).
Expected: `fromIndex: 2`, entries indices `[2,3,4]`, `totalEntries: 5`, `truncated: true`.
**Result: PASS**

### S5. §3.5 — condensed base present
Probe: `Runtime` with `maxJournalLength: 3`; 40 seeded edits (pre-base journal cost > base
snapshot so the size guard does NOT abort); drain the deferred-condense microtask; `journalEntries()`.
Expected: `basePresent: true`; a `base` entry is visible in the window —
`{index:0, kind:'base', status:'base'}`; at the floor `undoDepth: 0` and `undoBaseBoundary: true`.
**Result: PASS**

### S6a. §3.6 — read-only: journal state identical across calls
Probe: 3 seeded edits; `journalEntries()` before and after 5 further `journalEntries()` calls.
Expected: `undoDepth`/`redoDepth`/`basePresent` and the `entries` snapshot are IDENTICAL across
calls (no drain, no mutation).
**Result: PASS**

### S6b. §3.6 — renderer RPC routing is read-only: a `journalEntries` RPC emits ZERO `app-graph-changed` (dispatch positive control = ONE)
Probe: a real renderer `Runtime` + a notify-observing bridge; the `MUTATING_METHODS` set is
derived from the LIVE `src/renderer/renderer.ts` literal (never hard-coded); a `dispatch` RPC
(positive control) then a `journalEntries` RPC through the renderer route→reply→notify seam.
Expected: `dispatch` emits exactly ONE `app-graph-changed`; `journalEntries` routes to
`runtime.journalEntries(req.payload)`, replies `ok`, emits ZERO `app-graph-changed`, and returns
the real engine rows (`entries[0] === {index:0, kind:'state-slice', status:'applied'}`).
`'journalEntries'` is NOT in the live `MUTATING_METHODS` set.
**Result: PASS**

### S7a. §3.7 — group gate: the `read` group is default-ON
Probe: `groupForTool('provident.get_journal')`; `defaultSecurityConfig().enabled`;
`toolAllowed('provident.get_journal', ['read','dispatch'])`; a default `SecurityGate`.
Expected: `groupForTool === 'read'`; default enabled `['read','dispatch']`; the tool is allowed.
**Result: PASS**

### S7b. §3.7 — group gate: the tool is UNAVAILABLE when `read` is disabled
Probe: a `SecurityGate().apply({ disable: ['read'] })`; and
`new ProvidentMcpServer({ gate: SecurityGate().apply({disable:['read']}) })`.
Expected: gate `toolAllowed('provident.get_journal') === false`; the MCP `allowedToolNames()`
DOES NOT include `provident.get_journal` when `read` is off, and DOES when on.
**Result: PASS**

---

## §4 fail-states (derived from spec §4 F1–F6)

### F1. §4 F1 — empty journal never throws
Probe: a fresh Runtime `journalEntries()` and a post-`load` empty Runtime `journalEntries()`.
Expected: the §3.1 empty shape in both; never throws.
**Result: PASS**

### F2. §4 F2 — malformed/negative/huge opts clamp-ignore-never-throw; no drain
Probe: `journalEntries()` with `{afterIndex:-5, limit:-3}`, `{afterIndex:100000, limit:999999}`,
`{afterIndex:0, limit:0}`, `{limit:'big'}`, `{afterIndex:1.5, limit:2}`, `{}` on a 5-edit journal.
Expected: NONE throws; `afterIndex` clamped `[0,total]` (negative → 0, over-total → total);
`limit` clamped `[1,1000]` (0 → 1, huge → bounded); the journal is NOT drained/mutated
(`undoDepth` unchanged).
**Result: PASS**

### F3. §4 F3 — the `base` condense marker surfaces as `{kind:'base'}` + `basePresent: true`
Probe: the S5 condensed Runtime; `journalEntries()`.
Expected: `basePresent: true` and the visible window carries a `{kind:'base'}` entry;
the consumer distinguishes it via `kind`/`basePresent`.
**Result: PASS**

### F4. §4 F4 — synchronous snapshot at call time (no flush/interleave)
Probe: after an applied `state-slice`, `journalEntries()` is read synchronously.
Expected: returns a plain (non-thenable) `JournalView` object immediately — not a Promise, not
pending — reflecting the just-applied op (`undoDepth: 1`, `entries[0]` the applied row); no
flush/interleave.
**Result: PASS**

### F5. §4 F5 — JSON-safety (no Node refs / snapshot / internal id serialized)
Probe: `JSON.stringify(journalEntries())` then `JSON.parse`; inspect every `entries` row's key set.
Expected: round-trips losslessly (`JSON.parse(JSON.stringify(v))` deep-equals `v`); every row
carries EXACTLY `{index,kind,status}` (no extra keys); the serialized JSON contains no
`snapshot`/`dirtied`/`node`/`nodeId`/`id`/`op` payload keys.
**Result: PASS**

### F6. §4 F6 — extra/unknown tool args ignored; never throws
Probe: `journalEntries({afterIndex:0, limit:3, foo:'bar', bogus:123, token:'x', tls:{}, extra:[1,2]})`
vs `journalEntries({afterIndex:0, limit:3})` on a 4-edit journal.
Expected: identical window (`entries`/`fromIndex`/`totalEntries`); never throws.
**Result: PASS**

---

## §5.7 property register (the 5 invariant rows; derived from the register)

### PB1. P-IM-1 — `journalEntries` is a deterministic pure projection
Probe: 3 seeded edits; two `journalEntries()` calls in immediate succession.
Expected: two deep-equal `JournalView`s — equal `entries`, `fromIndex`, `totalEntries`,
`truncated`, `undoDepth`, `redoDepth`, `basePresent`, `undoBaseBoundary` and identical key-set
presence.
**Result: PASS**

### PB2. P-IM-2 — window semantics (absolute start / recent-tail formula / head-trim threshold)
Probe: 5 seeded edits; for `limit ∈ {1,3,6,500,1000}` with `afterIndex` omitted, assert
`fromIndex === max(0, min(totalEntries, cursorIndex+50) − limit)` (cursorIndex =
`undoDepth + (basePresent?1:0)`) and `fromIndex > 0 ⟺ min(totalEntries, cursorIndex+50) > limit`;
for `afterIndex ∈ {0,2,5,100,-1}` assert `fromIndex === clamp(afterIndex,0,totalEntries)` and
`entries.length ≤ limit`; `entries.length ≤ limit` always; the 5-entry/`limit:3` counterexample
(`fromIndex 2`, `truncated true`); a genuinely empty journal → `entries === []`.
**Result: PASS**

### PB3. P-IM-3 — read-only: identical state, no `MUTATING_METHODS`/`app-graph-changed`
Probe: 3 seeded edits; 10 `journalEntries()` calls; `undoDepth`/`redoDepth`/`basePresent` +
`entries` captured before/after; the live renderer `MUTATING_METHODS` literal checked.
Expected: post-call state identical to pre-call; `'journalEntries'` is NOT in `MUTATING_METHODS`
(with the S6b dynamic notify probe: a `journalEntries` RPC emits zero `app-graph-changed`).
**Result: PASS**

### PB4. P-SM-1 — faithful position accessors
Probe: empty journal; 1 edit; `journal('undo')`; `journal('redo')`; and the condensed-base Runtime.
Expected: `undoTopKind` present ⟺ `undoDepth > 0`; `redoTopKind` present ⟺ `redoDepth > 0`
(after undo the redo key appears and the undo key is omitted, and vice versa after redo);
`basePresent === true` ⟺ a `base`-kind entry exists in the window that includes it;
`undoBaseBoundary === true` only at the floor (undo stack truncated at the condensed base).
**Result: PASS**

### PB5. P-TP-1 — the seam routing is total + non-mutating
Probe: `groupForTool('provident.get_journal')`; `ProvidentMcpServer.ALL_TOOLS`; the LIVE renderer
source (`case 'journalEntries'` → `runtime.journalEntries` and `'journalEntries'` ∉ `MUTATING_METHODS`);
the LIVE mcp-server source (`backend.invoke('journalEntries', args)` and the
`inputSchema: { afterIndex: z.number().optional(), limit: z.number().optional() }`); the LIVE
shared/types source (`RpcMethod` gains `'journalEntries'`); the MCP tool registered under the
default (read) gate.
Expected: `groupForTool === 'read'`; `ALL_TOOLS` contains `'provident.get_journal'` (census 59);
the renderer `case` routes to `runtime.journalEntries(req.payload)` and is NOT in
`MUTATING_METHODS`; the SDK tool handler invokes `backend.invoke('journalEntries', args)`;
`RpcMethod` includes `'journalEntries'`; the tool registers under the default read group.
**Result: PASS**

---

## Summary

- §3 states: **11** (S1, S2, S3a, S3b, S4a, S4b, S5, S6a, S6b, S7a, S7b).
- §4 fail-states: **6** (F1–F6).
- §5.7 register: **5** (PB1–PB5).
- **Total scenarios: 22 — 24 vitest `it` blocks (PB2 + PB2b, PB5 + PB5b/census).**

### Tally

| Result | Count | Scenarios |
| --- | --- | --- |
| **PASS** | **22** | S1–S7 (11), F1–F6 (6), PB1–PB5 (5) |
| **FAIL** | **0** | — |
| **NOT-TESTED** | **0** | — |

### Notes on test construction (spec-fidelity)

- **Engine-verified by probe:** the §3.1/§3.2 empty-and-after-one-edit shapes were first probed
  directly against the live `Runtime`/`Supervisor`; the results confirm the spec's engine-faithful
  §2.1/§5.2 reading (the just-applied op IS visible in the default window; the 5-entry/`limit:3`
  counterexample head-trims: `fromIndex 2`, `truncated true`).
- **§3.5 condense reached live (NOT-TESTED not needed):** a `maxJournalLength: 3` Runtime with 40
  seeded edits drives a real condense (the engine log shows it normally aborts on the tiny demo
  graph via `condense-skipped-size`; 40 edits make the pre-base journal cost exceed the base
  snapshot so it fires), yielding `basePresent: true` + a visible `{index:0, kind:'base', status:'base'}`.
- **Renderer seam (module-private) verified behaviorally + by source-pin (house convention):**
  `renderer.ts` exports nothing, so the `case 'journalEntries'` routing + `MUTATING_METHODS`
  negative contract are proved dynamically (S6b drives a real Runtime through the renderer's
  route→reply→notify seam and asserts ZERO `app-graph-changed` for a `journalEntries` RPC, with a
  `dispatch` positive control emitting ONE) and statically (PB5 source-pins `case 'journalEntries':`
  → `runtime.journalEntries(req.payload)` and `'journalEntries'` ∉ the live `MUTATING_METHODS`
  literal, the same way sibling greens pin the module-private renderer negative contract).
- **MCP SDK handler (inline in `registerTools`) verified by source-pin:** the 
  `backend.invoke('journalEntries', args)` call, the `inputSchema { afterIndex, limit }`, and the
  group-gated registration are behaviorally observable at the `groupForTool` /
  `allowedToolNames()` / `applyGatePatch` boundary (S7) and statically pinned for the inline
  handler body (PB5).
- **F2 non-number probe (`limit:'big'`) is held within the spec's "never throws" pin; it did not
  throw on the live engine.** Non-finite (NaN/Infinity) inputs are the SDK `z.number()` layer's
  contract per AF-1 (JSON-RPC cannot carry them; unknown/extra keys are stripped, F6), so they are
  not probed at the host seam.
- **Census:** `ProvidentMcpServer.ALL_TOOLS` = **59**, includes `provident.get_journal` (the
  sibling/h2 "census 59" claim, §5.8 1 ALL_TOOLS row).
