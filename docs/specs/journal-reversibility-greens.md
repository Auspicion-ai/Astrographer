# Green scenarios — Journal Reversibility Battery (blind-test set)

Status: **GREEN (2026-08-24)** — verified against the installed provident-ssr
**0.1.5** by `npx vitest run tests/journal-reversibility.test.ts` (9 tests
green). This is the blind-test scenario set for
`docs/specs/journal-reversibility-battery.md`: an agent who has NOT read the
implementation drives the scenario sequence from these steps against the
installed engine and records the probe verdicts below.

## Scenario set

### O1 — state-slice (replace) undo/redo — RESOLVED in 0.1.5

Load the envelope (root + `a`/`b`/`slot`), apply `state-slice` replace on `a`
content `A0→A1`. Call `undo()`.

- **RESOLVED: `a.content` reverts to `A0`** — undo() now inverts state-slice
  EXACTLY (the journaled sliceLayers → removeLayer per id). `redo()` re-applies
  → `A1`. (The 0.1.4 behavior — undo was a silent no-op — was
  DEFECT-JOURNAL-UNDO, now fixed.)

### O2 — append-mode replay — RESOLVED

Apply `replaceAll props.tags = ['x']`, then `append 'y'` → `["x","y"]`.
`replay()` ×2 → **IDEMPOTENT** (stays `["x","y"]`).

### O2b — append as the FIRST journaled array mutation — RESOLVED in 0.1.5

Authored `props.tags: []`; `append 'x'` → `["x"]`. `replay()` ×2 →
**IDEMPOTENT** (stays `["x"]`, via the sliceLayers gate). (The 0.1.4 behavior —
grew to `["x","x","x","x"]` — was `DEFECT-JOURNAL-REPLAY-APPEND`, fixed.)

### O3 — replaceAll-mode replay

`replaceAll props:['x']` → `replay()` ×2 → **IDEMPOTENT** (stays `["x"]`).

### O4 — attach undo/redo (exact)

detach `slot`, attach `slot`→`a` (in-tree). `undo()` → re-detached;
`redo()` → re-attached. **REVERSIBLE**.

### O5 — detach undo — DOCUMENTED NO-OP (the G14 per-kind pin)

detach `b` → `unplaced`. `undo()` → stays `unplaced`. **Documented NO-OP**
(the pre-op `{parent, priority}` is not journaled — a parked fact-set, ops.md
§6 per-kind table). Not a defect.

### O7 — clone-instance undo — DOCUMENTED NO-OP (the G14 per-kind pin)

`clone-instance` of `a` → registered +1. `undo()` → the minted copy is
**retained** (registered stays +1). **Documented NO-OP** (retention
slot-stability collision — a user gate), not a defect.

### R11 — destroy undo (the documented pin)

`destroy` `a` → registered drops. `undo()` → registered stays dropped.
**NO-OP as documented** (pending.md REQ-GAP-12 + supervisor.js "destroy is
terminal") — the CONTRACT PIN, not a defect.

### R5 — atomicity

A rejected op (`attach` with an unresolvable `to`) leaves the graph
unchanged — the mutation surface is untouched.

## Findings

- **RESOLVED in 0.1.5**: `DEFECT-JOURNAL-UNDO` (state-slice half — exact undo)
  + `DEFECT-JOURNAL-REPLAY-APPEND` (sliceLayers replay gate).
- **Documented no-op pins (G14 per-kind table, ops.md §6)**: detach / move /
  clone-instance / layer-apply / placement-attach / rows-clear undo.
- **Contract pin**: destroy undo no-op (R11).
- **Host-side defects**: none. All engine-level, handed off (Round 6).

