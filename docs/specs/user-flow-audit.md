# USER-FLOW-AUDIT — the §5.U delta-matrix + the §6.1 coverage-report schema (hardened gate spec)

**Date:** 2026-09-15 · **Kind:** process/harness hardening spec (the landed, enforced form of
`docs/specs/user-flow-audit-review.md`, which stays the PROPOSAL) · **Status:** ACTIVE —
it binds the Astrographer UI-overhaul live gate and the `role_live_scenario_runner` /
`role_adversarial_reviewer` duties. · **Provenance:** the 2026-09-15 user-flow-audit pass
(8 live-confirmed defects LIVE-UF1/2/5/6/7/8/9/10) + the read-only §6.2 audit that
**REJECTED** the first coverage report (findings Ad-1..Ad-12).

---

## 1. Status / what this proposal asks

The 2026-09-15 session produced (a) `docs/specs/user-flow-audit-checklist.md` — the
spec-census → live-scenario matrix (~112 rows, every spec-bound user-visible flow with one
proposed live assertion), and (b) the first live run of the widened battery + its coverage
report. The harness `gate` persona already requires, for a triggered UI unit:
**(A)** a capped §5.U delta-matrix as a review input, **(B)** the §6.1 structured
matrix-with-verdict coverage report emitted by `role_live_scenario_runner`, and
**(C)** the §6.2 read-only audit of the report + matrix by `role_adversarial_reviewer`.

This spec supplies the two artifacts that were MISSING on disk when the first §6.2 audit
ran (the audit rejected the report partly because its own mandate was unfindable):

1. **§5.U — the capped delta-matrix** (§2 below): ≤ 8 U-rows, each a NEW/changed
   user-visible behavior this pass binds, with its D-class, its closed-enumeration source,
   its scenario block, and the user-visible end state it pins. A zero-row matrix is an
   EXPLICIT recorded exemption, never a silent default.
2. **§6.1 — the structured coverage-report schema** (§3 below): the machine-readable
   row shape the runner MUST emit, with `proxyPASS:false` as a verifiable field.

## 2. §5.U — the delta-matrix (capped at 8 rows)

**Source enumerations (closed):** `docs/specs/ui-overhaul.md` §1 C1–C20, §3 pane/zone
layout model, §4 G1–G10 grouping, §8 unit list; `docs/specs/user-flow-audit-checklist.md`
§1–§14 (`UF-<SURFACE>-<n>` rows); `docs/defects.md` F-1/F-2/F-3 + LIVE-UF1/2/5/6/7/8/9/10.
**D-classes:** `D-interaction` (a real gesture changes visible content), `D-visual` (a
painted/rendered-box geometry assertion), `D-state` (a persisted/selection state whose
VISIBLE end state is asserted).

| U-row | Delta behavior | D-class | Closed-enumeration source | Scenario block | The user-visible end state it pins |
| --- | --- | --- | --- | --- | --- |
| **U-1** | A real click on a doc-nav document ROW focuses that document (F-1) | D-interaction | checklist §3 UF-PANES-12; defects F-1 | `uf_panes_12` | The stage's `[data-doc-head]`/mounted content switches to the clicked document |
| **U-2** | A real click on a search RESULT row opens the document in a NEW tab (F-1) | D-interaction | checklist §4 UF-TABS-7 / §3 UF-PANES-14; defects F-1 | `uf_tabs_7`, `uf_panes_14` | `.tab` count increases AND the new tab's stage shows that document's body |
| **U-3** | The pane-drag gesture surface is the pane HEADER only — a click in the pane BODY is never hijacked (F-1) | D-interaction | ui-overhaul C4/§3 relocation legality; checklist §3 UF-PANES-4; defects F-1 | `uf_panes_12`, `uf_panes_14` (the body-click half) | The body control's own handler runs (visible effect); a header drag still relocates |
| **U-4** | Empty↔filled pane-set transition leaves exactly ONE `#wiki-root` mount (F-2) | D-visual | ui-overhaul §3 layout model; checklist §2 UF-LAYOUT-10; defects F-2 | `uf_layout_10` + `uf_mount_leak_diag` (`uf_mount_diag` is the standing-count diagnostic that supplies the box heights; the driver's exported `MATRIX_ROWS` names `uf_layout_10` as the row's ONE claiming block, and the extra blocks are credited in the report's `blocks` field) | The page height/geometry does not grow a blank stale-mount region; one mount, stage at its normal y |
| **U-5** | An empty side zone's grid TRACK collapses and the stage reclaims the width (F-3) | D-visual | ui-overhaul C11/§3; checklist §2 UF-LAYOUT-10; defects F-3 | `uf_layout_10` | Painted geometry: the `#wiki-root` track → 0 and the stage's box widens |
| **U-6** | A pane-tab click after zone minimize re-expands the zone (visible) | D-interaction | ui-overhaul C12/§3; checklist §3 UF-PANES-8 | `uf_panes_8` | The zone's panes are painted again and the clicked pane's tab identifies it |
| **U-7** | A history-entry click reverts the content to that journal point | D-state | ui-overhaul C16/G1; checklist §8 UF-HIST-6 | `uf_hist_6` | The stage's rendered content (and the store read-back) lack the later edit's marker |
| **U-8** | Closing the LAST tab yields the default page (never an empty stage) | D-state | ui-overhaul C14/§3; checklist §4 UF-TABS-3 | `uf_tabs_3` | The stage is populated (a mounted default document / landing) with `.tab` count 1 |

**Exemption register.** Rows deliberately NOT added (each with its recorded reason):
`UF-THEME-1..3` (U-SHELL-2 still DRAFT — no implemented behavior to pin);
`UF-IMPORT-1..6` (OS-owned `showOpenDialog` — structurally non-exercisable, RCA-11);
`UF-TABS-10/11` (blocked on U-STATE-1e); `UF-SHELL-2` (OS-owned window-drag geometry).

## 3. §6.1 — the structured coverage-report schema (MANDATORY)

The runner emits `summary.total` == the number of §5.U U-rows it executed (not the number
of blocks), and the reported row set MUST equal the matrix row set. Rows that are not in
§5.U are reported in the extended surfaces table (below), never in the matrix rows.

```json
{
  "unit": "<unit id>", "date": "<YYYY-MM-DD>", "layer": "assembled-renderer (RCA-12)",
  "commands": ["node scripts/live-drive.mjs --connect --port=3787 --cdp-port=9222 --block=<name>"],
  "rows": [
    { "row": "U-1", "block": "uf_panes_12", "verdict": "PASS|FAIL|PARKED",
      "assertion": "<the user-visible end state pinned>",
      "dclass": "D-interaction|D-visual|D-state",
      "realInput": true,
      "evidence": "<the concrete observed measurement proving a REAL gesture drove it — a hit-tested CDP gesture (elementFromPoint resolves to the target) plus the painted/state result>",
      "proxyPASS": false,
      "surface": { "target": "assembled-renderer", "liveSurfacePresent": true } }
  ],
  "summary": { "total": 8, "pass": 0, "fail": 8, "parked": 0 }
}
```

**Field rules (each is a review input):**
- `realInput` — `true` only when the block's evidence is a real gesture whose PATH was
  proven (`elementFromPoint` resolved the target; otherwise the block reports the
  fallback path and MUST NOT claim PASS on the synthetic path alone).
- `proxyPASS` — `false` required for an accepted PASS. A PASS whose only oracle is a
  seam/presence/attribute/class/slot/computed-style-only probe MUST be recorded as
  `verdict:"FAIL"` (or `PARKED` with a structural reason) with `proxyPASS:true` and the
  proxy named in `evidence`. `D-visual` PASSes require a PAINTED/rendered-box oracle.
- `evidence` — the concrete value (a box `w×h`, a grid track in px, a stage-content
  identity, a store read-back), never "the block passed".
- A block that cannot fail is NOT evidence: a diagnostic block (one that returns
  `pass:true` unconditionally) MUST NOT be promoted to a matrix row verdict.
- The extended (non-matrix) results — the legacy `user*`/`repro_*` blocks and the
  checklist rows they cover — are reported in a separate table with the same fields.
- `summary` — `total` is the §5.U row count (`MATRIX_ROWS.length`), NEVER the block
  count, and `pass`/`fail`/`parked` partition the **EXECUTED matrix rows of that run**
  (the driver emits `matrixRowsExecuted` alongside them, so a scoped run whose
  `total` is 8 but which ran only some rows is not misread as 8 verdicts —
  2026-09-15: `total:8, pass:6, fail:1, parked:1, matrixRowsExecuted:8` for the
  U-row battery). `total` == the §5.U row count even when a run scopes a subset of
  blocks (the row-set reconciliation is checked against `MATRIX_ROWS`, not against the
  blocks run) — a scoped run reports only the rows it executed, and the FULL-battery
  run must report all 8. `blocksRun`/`extendedRowsRun`/`diagnostics` are informational
  counters and are NOT part of the §5.U row set.
- A run MAY emit extended rows beyond `ROW_EXTENDED` where a driver block carries a
  checklist id that is not in the `ROW_EXTENDED` table (2026-09-15: `uf_hist_4` →
  `UF-HIST-4` and `uf_layout_2` → `UF-LAYOUT-2`); they are reported in the extended
  table with the same fields, and the driver's own extended count is honest about the
  overflow (`EXTENDED rows (16 of 14 defined)`).

## 4. §6.2 — the read-only audit (the acceptance gate)

`role_adversarial_reviewer` (read-only, `docs/specs/user-flow-audit-review.md` §6 step (c))
audits the coverage report + this matrix for: (1) real-gesture evidence; (2) the
user-visible end state (never a proxy); (3) the schema above + the row-set/count
reconciliation; (4) matrix completeness against the checklist's closed enumerations
(every drivable uncovered row named); (5) verdict credibility per PASS. Findings are
classified `proxyPASS` / `not-a-real-gesture` / `schema` / `completeness` /
`verdict-contested` and flow through the adversarial §3a/§3b channel. **The audit's
verdict gates acceptance:** `reject` means the report is NOT the live-green evidence for
any UI unit.

## 5. Feasibility verdict

**FEASIBLE and enforced.** The live tooling (CDP + MCP + `scripts/live-drive.mjs`) already
drives real gestures and reads painted boxes; the delta is the report shape + the
discipline of routing the runner's own findings into `docs/defects.md` in the same pass.
Cost: authoring the corrected blocks and re-running the battery (per pass), not new
capability.

## 6. Gaps + costs/benefits

**Closes:** the proxy-PASS gap (Ad-3/6/7), the unfalsifiable-block gap (Ad-1/2), the
schema gap (Ad-10), the completeness gap (the ~80 uncovered rows were neither run nor
enumerated), and the tracker gap (new findings unrecorded — Ad-12).
**Cost:** each matrix row needs a corrected, falsifiable block with a proven real-input
path; a full 112-row battery is a multi-pass effort — the §5.U cap (≤8) keeps each pass
bounded while the checklist tracks the full census.
**Benefits:** a machine-checkable live evidence layer, so a UI unit can never be reported
green from an unfalsifiable or proxy assertion — the exact class that shipped the
UI-overhaul "green" while the assembled app was broken (RCA-11/12).
