# USER-FLOW AUDIT — spec draft for the harness-design agents

**Date:** 2026-09-15 · **Kind:** process/harness proposal (a hardening of the live-testing gate) ·
**Audience:** the Agent Harness `gate` persona + `role_live_scenario_runner` + the DSH live-tooling
designers · **Status:** PROPOSED (draft for handoff; not yet gated/approved).

This draft is the root-cause analysis + a proposed **spec-census → live-user-flow audit** gate, written
so the harness-design agents can implement it. It generalizes the lesson of the 2026-09-14 live-bug
miss (RCA-11/12) one layer up.

---

## 1. Status / context

A 2026-09-15 user-testing session on the assembled Astrographer app (Electron, `dist/`, DISPLAY :0)
found **eight live-confirmed UI defects**, each of which was present in the original UI-overhaul spec
and each of which the existing live-test pipeline had reported (or would have reported) "green":

- **LIVE-UF1 NEW-TAB-INERT** — the tab-strip New-Tab button is a silent no-op (`.tab` 3→3).
- **LIVE-UF2 PANE-DRAG-INERT** — a real drag from the pane header does not reorder/move a pane.
- **LIVE-UF5 HISTORY-IN-MAIN-CANVAS** — the undo/redo/history segment renders inside `#zone:main`,
  not in its pane.
- **LIVE-UF6 DUPLICATE-EDITABLE-PARAGRAPH** — a section heading's following paragraph
  (`rag-.live-corpus/alpha:p:1`) is materialized twice (nested inside the `<h1 data-doc-head>` AND as a
  sibling `<p>`), both `contenteditable`; edits cascade one way only.
- **LIVE-UF7 ZONE-RESIZE-UNREACHABLE** — the resize seam works (synthetic on-gutter drag resizes
  220→160) but the `.gutter[data-zone]` renders `0×0` at `(0,0)` with `grid-area:auto` — a real user
  cannot grab it, so zones cannot be resized.
- **LIVE-UF8 ZONE-NO-VISIBLE-BOUNDARY** — side zone and main canvas have no visible separator
  (both `background:transparent`, `border:0`, grid `gap:normal`, gutters `0×0`).
- **LIVE-UF9 OPEN-IN-TAB-WRONG-CONTENT** — the search pane's "Open in a tab" creates a new tab but
  the tab renders the open document body, not the search view.
- **LIVE-UF10 COLLAPSED-TEXT-ORIENTATION** — a minimized zone's tabs read left-to-right
  (`writing-mode:horizontal-tb`, `text-orientation:mixed`); the spec requires vertical bottom-to-top.

The same session also authored and ran **thirteen live user-flow scenarios** (`user1..user10`,
`repro_dup_para`, `repro_nbsp`, plus the earlier §2 batch batteries), of which ten FAILed exactly as
the user reported and three PASSed (collapse DOES re-orient tabs vertically; the main view IS editable
and commits; the Search switch does NOT overlay the landing). The three PASSes are behaviors a user's
earlier observation appeared to contradict but which now hold live.

## 2. What the proposal asks

Add a **mandatory pre-DONE live gate** for every UI-OVERHAUL / UI-RENDERING unit:

**(A) A spec-census → live-scenario matrix.** For each unit, enumerate EVERY user-visible flow and
element the unit's spec contract (and the umbrella `ui-overhaul.md`) binds — every interactable
control (click/drag/type/toggle), every rendered/placed element, every layout/rendering constraint —
and require ≥1 live scenario per entry that drives the **real user gesture** and asserts the
**user-visible end state**.

**(B) Run, not park.** All of those scenarios execute against the assembled app on a usable display
(`:0` here) as a pre-DONE gate. A battery may be parked ONLY for a recorded structural reason (an
OS-owned native dialog; a surface the MCP+CDP live surface cannot reach). "No live session available"
is never a valid park reason when a display is present.

**(C) A final full-app boot + key-behavior sweep.** Before a UI unit is reported complete, boot the
app once and assert the key spec'd behaviors end-to-end (the matrix's "smoke" set) — not just the
seam the unit happened to touch.

**(D) Assert the user-visible layer, not probe-attributes.** A live PASS must be a user-visible end
state (a real grab resizes; collapsed text is vertical; open-in-tab shows search; each paragraph
renders once), never a seam/presence/attribute/class/slot proxy.

The harness-design counterpart: the `role_live_scenario_runner` persona + the live-drive tooling gain
a **coverage-report shape** (the matrix, with PASS/FAIL + the assertion each scenario pins), and the
gate preset enforces the matrix as a review input before a UI unit is green.

## 3. Feasibility verdict

**FEASIBLE and necessary.** The live tooling already does this (a display + CDP/MCP + the `--connect`
attach mode; synthetic vs native DOM clicks resolved). The blocker is discipline/tooling, not
capability: a coverage matrix + an assertion contract + run-not-park enforcement. Cost scales with the
number of spec'd behaviors, so the matrix should be produced once per unit at the spec gate and reused
(as a live battery) at the live gate — not improvised after a human reports bugs.

## 4. Gaps + cost–benefit

**Gaps that the audit closes:**
- **Narrow-assertion gap (RCA-12):** prior batteries asserted presence/attributes/classes/slots and
  reported PASS while the user-visible behavior was broken (UF7 seam-works-but-unreachable; UF10
  is-collapsed-but-not-vertical; UF9 seam-dispatches-but-wrong-content; UF6 fixture-covered-but-real-doc-duplicates).
- **Parked-by-default gap (RCA-11):** spec'd behaviors' live scenarios were authored but parked on "no
  live session"; when un-parked, the run covered seams and RAG/modal surfaces, not the flow surface.
- **Completeness gap:** no census asked "every spec'd interactable/visible behavior — scenario?"
  discovered piecemeal from user reports (UF1 new-tab, UF2 real-grab drag, UF5 ancestry, UF8 computed
  separator had zero prior live coverage).
- **Fixture/real-input gap:** node fixtures missed the real document shape (h1 + following paragraph)
  that double-materializes (UF6).

**Costs:**
- Authoring + running the full matrix per UI unit is the dominant cost; mitigated by producing the
  matrix once at the spec gate and by the live-drive harness already being reusable.
- Some assertions are CSS/layout-visual (UF8 boundary, UF10 text-orientation) — the live tooling must
  read `getComputedStyle`/bounding rects, which it already can via CDP evaluate.
- OS-owned surfaces (native file picker, some native menus) remain genuinely unparkable-in-CDP — those
  are the allowed structural parks.

**Benefits:** catches the class that shipped "green" in this session; makes user-visible correctness a
pre-DONE gate; removes the supervisor's fallback (discovering these by hand after a human drives the app).

## 5. Motivating evidence (the eight + the three)

The confirmed catalogue and the scenario blocks live in `docs/defects.md` (LIVE-UF1/2/5/6/7/8/9/10) and
`docs/specs/live-user-flow-scenarios.md`. The three not-reproduced (collapse-orientation, main-editable,
search-no-flicker) are retained there as scenarios-to-keep, not closed. The pre-existing parked battery
set (`docs/specs/*-live-pending-battery.md`) is the backlog the matrix consumes and re-derives.

## 6. Handoff note

For the harness-design agents: implement (A)-(D) as a gate step — a per-unit **user-flow-audit.md**
(spec-census → scenario matrix with the user-visible assertion each scenario pins) produced at the spec
gate and RUN at the live gate; extend `role_live_scenario_runner` to emit a structured coverage report;
and extend the gate persona to require the matrix + a full-app boot sweep before a UI unit is green.
See also `docs/specs/rca-live-bugs-green-pipeline.md` (the prior layer of this failure) and
`docs/specs/ui-overhaul.md` (the spec that binds these behaviors).
