# Spec/Plan — Journal Reversibility Stress Battery (undo/redo/replay idempotency)

Status: **SPEC** (delegation gate for the journal-reversibility unit). A
probe battery (not a feature unit) whose purpose is to STRESS the provident
engine's journal (`Supervisor.journal` + `undo()`/`redo()`/`replay()`) and
answer two questions:

1. **Are all journal-op sequences fully reversible?** I.e. does `undo()` return
   the graph to the exact pre-op state for EVERY op kind, and does `redo()`
   reproduce the exact post-op state?
2. **Is replay idempotent?** I.e. re-running the journal (or a segment of it)
   produces the SAME graph state, with no accumulation / drift / duplication.

Every finding is split into the house verdicts:
- a **contract pin** (documented, intended behavior — asserted as-intended);
- a **host-side finding** (this repo's `src/`) — fixed here + regression-tested;
- an **engine defect** (`node_modules/provident-ssr/` or
  `../Preempt-Providence/`) — catalogued in `docs/defects.md` + written to
  `docs/HANDOFF.md`, NEVER patched (AGENTS.md item 7).

## 1. Goal

Drive the engine's journal surface (`Supervisor.apply` → journal, then
`undo`/`redo`/`replay`) across the full op matrix + the mutation modes, and
verify reversibility + idempotency. The battery targets the **engine directly**
(the Runtime/MCP do not expose undo/redo/replay — they are `Supervisor`-level,
`supervisor.d.ts` `undo()`/`redo()`/`replay()`), using the canonical
`translateLegacy` → `registerNode` → `compile` → `recordResolved` bootstrap the
host adopts, so a version bump cannot silently break the journal contract.

## 2. The op matrix (the reversibility surface)

`Supervisor.apply` journals EVERY applied op (`journalIfApplied`, supervisor.js
`journal-${seq}`). `undo()` inverts the top of the undo stack; `redo()`
re-applies it. The journal contract (ops.md §6) claims "named ops are
invertible; undo/redo fall out of the journal" (G14) and replay re-runs
executors (G13).

| # | Op kind | Mutation | The reversibility question |
| --- | --- | --- | --- |
| O1 | `state-slice` (replace) | `content`/`props.x`/`css.x` `replace` | does `undo` revert the value? does `redo` re-apply it? |
| O2 | `state-slice` (append) | `props.x` `append` | is `undo`/`redo`/`replay` idempotent (no array growth)? |
| O3 | `state-slice` (replaceAll) | `props.x` `replaceAll` | idempotent across replay? |
| O4 | `attach` | family attach | `undo` re-detaches (safe); `redo` re-attaches |
| O5 | `detach` | family detach | `undo` re-attaches? (`undo()` handles `attach` via `detachNodeSafe` — does it handle `detach`?) |
| O6 | `move` | re-parent | `undo` restores the prior parent + priority? |
| O7 | `clone-instance` | mint a copy | `undo` destroys the minted copy? (journal `minted` ids) |
| O8 | `layer-apply` | mint a set + anchor layer | `undo` removes the minted set + layer? |
| O9 | `rows-mint` / `rows-clear` | mint/teardown rows | `undo` payload-controlled teardown (the handled case)? |
| O10 | `placement-attach` | placement + container anchors | `undo` reverses the placement + container mint? |
| O11 | `destroy` | terminal | `undo` is a documented NO-OP (destroy is terminal) — the pin |

## 3. Reversibility invariants (the assertions)

For each op kind, the battery asserts (given a clean bootstrapped graph):

- **R1 — undo restores**: after `apply(op)` then `undo()`, the graph's
  structural surface + the mutated node's content/props/css EQUAL the
  pre-op baseline.
- **R2 — redo restores**: after `undo()` then `redo()`, the graph EQUALS the
  post-op state (the re-applied op reproduces the same result).
- **R3 — replay idempotency**: running `replay()` once then a second time
  yields the SAME graph state (no accumulation, no array growth, no mint
  duplication, no drift).
- **R4 — replay-from-scratch parity**: replaying the journal from a FRESH
  graph reproduces the graph the live sequence produced (event-sourcing —
  G13).
- **R5 — atomicity (G7)**: a rejected op (cycle / single-parent / unknown-node)
  leaves the graph in the exact pre-op state (no partial application).

## 4. Known / probed behavior (recorded as the triage seed)

Pre-probe findings (verified against the installed 0.1.4 dist, 2026-08-24):

- **`state-slice` undo is a NO-OP** — `Supervisor.undo()` handles ONLY
  `attach` (via `detachNodeSafe`), `destroy` (documented no-op), and
  `rows-mint` (payload-controlled teardown). A `state-slice` op's undo falls
  through with no reversal — the mutated node keeps its new value
  (probe5.mjs: `A0→A1`, undo → still `A1`). This contradicts ops.md §6/G14
  "named ops are invertible; undo/redo fall out of the journal". **Provisional
  verdict: ENGINE DEFECT (undo is not implemented for state-slice).**
- **`append`-mode `state-slice` replay is NOT idempotent** — `replay()`
  re-runs the journaled op (supervisor.js `replay()` → `apply(op)`), and the
  `append` executor appends again: `["x","y"]` → `["x","y","y"]` →
  `["x","y","y","y","y"]` (probe7.mjs). A replayed `state-slice append`
  duplicates the appended value every replay. **Provisional: ENGINE defect
  (non-idempotent replay for append mode).**
- **`clone-instance` undo is a NO-OP** — the minted copy (`node-4`) is NOT
  destroyed on undo (`registered` stays 4, probe11.mjs). **Provisional:
  ENGINE defect (undo gap).**
- **`detach` undo** — `undo()` handles `attach` but the `detach` case falls
  through; a detached node stays `unplaced` after undo (probe8.mjs: b.state
  `unplaced` post-undo). **Provisional: ENGINE defect (undo gap).**
- **`destroy` undo** — the code comments "destroy is terminal; undo is a no-op
  for destroyed nodes" (`supervisor.js:919-921`) + pending.md REQ-GAP-12. This
  is the **documented contract pin** (R11), not a defect.
- **`rows-mint` undo** — the ONE handled mutation-ish case: the batch record is
  the undo handle (payload-controlled teardown). Expected reversible.

The battery confirms/disproves each provisional verdict empirically; a
confirmed engine defect lands in `defects.md` + `HANDOFF.md` (never patched).

## 5. Battery scenarios (drive the engine directly)

The battery uses the engine bootstrap (translateLegacy → register → compile →
recordResolved) with a small envelope (root + 2-3 children + a slot), and for
each op asserts R1..R5. Structural surface comparison via the house `hash64` /
`treeSig` digest of the rendered element tree (never the raw fragment).

| # | Scenario | Probes |
| --- | --- | --- |
| S1 | `state-slice` replace undo/redo/replay | R1/R2/R3 (O1) |
| S2 | `state-slice` append replay | R3 — idempotency (O2) — the non-idempotent candidate |
| S3 | `state-slice` replaceAll replay | R3 (O3) |
| S4 | `attach` undo/redo | R1/R2 (O4) |
| S5 | `detach` undo/redo | R1/R2 (O5) |
| S6 | `move` undo/redo | R1/R2 (O6) |
| S7 | `clone-instance` undo/redo | R1/R2 + minted cleanup (O7) |
| S8 | `layer-apply` undo/redo | R1/R2 (O8) |
| S9 | `rows-mint` / `rows-clear` undo | R1/R2 (O9 — the handled case) |
| S10 | `destroy` undo | R11 — the documented no-op pin (O11) |
| S11 | atomicity — a rejected op | R5 (G7) |
| S12 | replay from scratch | R4 (event-sourcing) |
| S13 | full undo/redo loop over a mixed sequence | R1/R2/R3 across a multi-op session (attach→detach→state-slice→destroy) |

## 5. Finding triage (the three verdicts)

| Verdict | Condition | Action |
| --- | --- | --- |
| **Contract pin** | The behavior is documented intent (e.g. destroy undo no-op) | Document; assert as-intended; no code change |
| **Host-side defect** | The divergence lives in this repo's `src/` (Runtime rendering/state handling) | Fix here + regression-test (TDD red→green) |
| **Engine defect** | The divergence lives in `node_modules/provident-ssr/` (undo/replay gaps) | Record in `docs/defects.md` + `docs/HANDOFF.md`; NEVER patch the package |

## 6. Deliverables / process

1. **This spec** — `docs/specs/journal-reversibility-battery.md`.
2. **The battery** — `tests/journal-reversibility.test.ts` (vitest, drives the
   engine directly: undo/redo/replay + structural + atomicity), built per the
   house cadence (spec → TestWriter red → Implementer green → adversarial →
   greens → doc-review).
3. **The green-scenario blind set** — `docs/specs/journal-reversibility-greens.md`.
4. **Trackers** updated in the same pass (defects.md / HANDOFF.md if an engine
   defect surfaces; decisions.md / next-steps.md).

## 7. Process gates (RCA-1..6)

This is ONE unit: delegation spec → TestWriter red (tests FIRST against the
engine contract + this spec, run → red) → TestWriter green (least code — for a
PROBE battery this means confirming the probed behavior; host findings fixed
here, engine findings recorded) → adversarial (read-only) → blind greens →
documentation review (record `archive/reviews/<date>-journal-reversibility-doc-review.md` — the archive is gitignored; the record is provenance only, findings land in the active trackers).
Run `npm test` + `npm run typecheck` + `npm run build` before the unit is
reported done.
