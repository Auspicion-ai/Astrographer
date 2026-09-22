# UI Overhaul — Proposal-Gate Review (three-agent gate)

- **Proposal:** overhaul the Astrographer shell/UI per `docs/specs/ui-overhaul.md`
  — constraints C1–C19 (tri-state theme; a formatting-isolated central stage;
  a settings modal that is an isolation mount; drag/reorder/relocate utility
  panes across zones; collapsible + minimizable containers; hover affordance;
  resizable gutters; markdown/html editing toggle; serialized UI-config;
  content-only repopulation; a View-menu pane-visibility dropdown; browser-style
  top-bar tabs; document directory/category; undo/redo/history; File-menu import;
  advanced-search dropdown; link hover-preview).
- **Reviewer:** change-analysis agent (step 3 of the proposal gate, AGENTS.md
  item 8), grounded by an independent validity review (step 1) and critique
  review (step 2).
- **Inputs:** `docs/specs/ui-overhaul.md` (the draft contract); the build
  (`src/renderer/*`, `src/main/main.ts`, `src/main/preload.ts`,
  `src/shared/types.ts`); `docs/decisions.md` (`PANE-REGISTRY`,
  `PANE-PROVIDENT-AUTHORING`, `APP-GRAPH-PANES-MCP-VISIBLE`,
  `OPERATOR-ISOLATED-GRAPHSCOPE`, `MCP-UI-EQUIVALENCE`, `UI-CONFIG-CARRIER`,
  `U-STATE-1-CONTENT-REPOPULATION-GATE`, `DOC-DIRECTORY-CATEGORY-GATE`); the
  `provident-ssr@0.4.0` specs (`handlers.md`, `api.md`, `adapters.md`,
  `hooks-map-review.md`); AGENTS.md items 2/6/8/9/10.
- **Status:** **PROCEED-WITH-AMENDMENTS (GATED 2026-09-11, ratified by the
  Architect's "proceed").** A5/A6 resolved (Reading 2; Option C + C20); OB3–OB8
  closed by default. Umbrella approval covers contract + ordering only; every
  unit still needs its own spec + TestWriter red set (A1).

---

## 1. What the proposal asks

A full shell overhaul: a zoned layout (stage + left/right/header/footer +
top-bar), serialized UI config, provident-authored panes with shell mechanics,
a settings modal isolated from the app graph, parity completion, and a set of
new controls. `docs/specs/ui-overhaul.md` is the contract draft (§1 C1–C19, §2
shell-vs-provident boundary, §3 layout/re-render/UI-config/C15, §4 parity
census, §5 gaps, §7 Q1–Q24, §8 dependency-ordered units).

---

## 2. Validity (step 1) — DRAFT

**FEASIBLE, but LARGE.** Every constraint has a verified mechanism in
`provident-ssr@0.4.0` + the Electron shell; nothing requires an engine change.

- **Provident-authored control surfaces** — `on:*` binds arbitrary DOM events
  (`adapters.md` §3.2); `state-slice` writes `props.*`/`css.*`/`handlers`/
  `hooks.<name>` (`api.md` §1); placement/`placement-attach` + `move` express
  zones (`ops.md`); cssDef ships `:hover` rules (`adapters.md` §3.3). The §2.1
  audit resolved 8 provident / 3 hybrid / 3 shell of 14 elements.
- **Hooks are a value-write surface, not an event bridge** (§2.2) — correct; the
  original name-index kernel was parked and amended (`hooks-map-review.md` §7).
- **Shell carve-outs** — native menu, dialogs, pointer gestures, root tokens,
  `matchMedia` are legitimately outside the graph.
- **Parity is judged at the application seam** (§4, clarified) — not
  `provident.dispatch` reach; this is consistent with `MCP-UI-EQUIVALENCE`.
- **Content-only repopulation** is feasible (its own gate, U-STATE-1).

Validity findings (to fold into §3 amendments):

- **V1** — the draft is internally consistent after the C10/C16/PG1/PG2
  corrections, but several row-level statuses were stale during drafting; a
  **reconciliation pass over §4.11 + §5 must precede implementation**.
- **V2** — the modal-isolation claim (C3) depends on **U-STATE-1** (the
  operator scope must stop being re-created); the draft now states this, but the
  dependency must be explicit in the unit ordering (it is, §8.1 finding 3).
- **V3** — C9 carrier is decided (`UI-CONFIG-CARRIER`) and consistent with the
  operator carve-out; no new credential surface.
- **V4** — the View menu (C13) and File menu (C17) require a menu module that
  does not exist; the draft inserted `U-MENU-1`. Valid.

---

## 3. Critique (step 2) — DRAFT

- **K1 — Scope creep.** The overhaul now bundles C1–C19, i.e. shell chrome +
  a data-model consumer (C15) + a major renderer rearchitecture (C10/U-STATE-1)
  + parity completion. **Risk:** a single gate cannot meaningfully review all of
  it. **Mitigation (proposed):** treat this gate as the **umbrella** approval,
  and require each unit to carry its own per-unit spec + TestWriter red set
  (already required by AGENTS.md item 9 / RCA-2). Pin that no unit starts
  off a stale row.
- **K2 — The parity census overstates coverage.** §5.7a found `gnosis.document.
  update` is hollow (placeholder empty graph). Other EXISTS verdicts were
  behavior-checked but the census remains a snapshot. **Mitigation:** re-derive
  the census immediately before the parity wave; never trust a pane id alone.
- **K3 — The shell-vs-provident boundary is under-specified for layout.** The
  draft says zones/gutters/handles are shell chrome, but §3's `LayoutState`
  model is serialized (C9) and partly state-resident (C11/C12). **Mitigation:**
  pin which layout facts are graph nodes vs shell attributes (amendment A11).
- **K4 — Content-only repopulation (U-STATE-1) is a prerequisite but still
  ungated.** The umbrella cannot approve chrome that assumes it. **Mitigation:**
  order U-STATE-1 first (done, §8.1) and do not mark dependent units done until
  it lands.
- **K5 — Top-bar tabs (C14) create multi-document render**, which activates the
  CROSS-DOCUMENT-SHARED duplicate semantics (`docs/pending.md` "Document tabs").
  The draft flags it (Q12) but does not resolve it. **Mitigation:** pin
  update-all vs fork-on-save before the tabs unit.
- **K6 — Import (C17) touches the filesystem.** CorpusRoot stays server-fixed
  (good), but the directory selection + expansion needs the same containment
  discipline as `importMarkdownCorpus` (`markdown-import.ts:234-242`).
  **Mitigation:** the import IPC must pass a file list produced under the
  containment root; never accept an arbitrary path from the renderer.
- **K7 — Serialized UI-config could leak secrets** if a layout/pane field ever
  carries one. **Mitigation:** the `UI-CONFIG-CARRIER` row already excludes
  credentials; add a regression test asserting no credential key is serialized.
- **K8 — Accessibility of new chrome** (menus, tabs, collapse/minimize, modal)
  is not addressed. **Mitigation:** pin keyboard semantics (`on:keydown`) or
  native menu roles; add to the per-unit specs.
- **K9 — Parity vs shell-dispatch tension.** C14 tabs and C13 menu are shell
  chrome, so they are not `provident.dispatch` targets. Under the clarified §4
  definition this is acceptable; pin that the *operations* share application
  code where an MCP counterpart exists.

---

## 4. Change-analysis (step 3) — DRAFT verdict

**Proposed verdict: PROCEED-WITH-AMENDMENTS**, conditional on:

- **A1** — the umbrella gate approves **only** the contract + ordering; every
  unit still needs its own spec + red set (AGENTS.md item 9). No unit may be
  implemented from a stale row.
- **A2** — **U-STATE-1 gates the lifecycle-dependent units.** C3/C9/C11/C12/
  C14/C16/C19 do not land before it.
- **A3** — **C9 carrier = `OperatorSettings`** (decided; `UI-CONFIG-CARRIER`).
  Each unit adds its slice; no per-unit stores. Credentials never serialized.
- **A4** — **Parity census re-derivation** immediately before the parity wave;
  §4.11 + §5 reconciled (V1), including the HC1 hollow finding.
- **A5** — **Shell-vs-provident layout split pinned** (K3): **RESOLVED
  2026-09-11 (Reading 2, ui-overhaul §7.3)** — zone containers/pane roots/
  content roots are provident graph (MCP-visible); the serialized `LayoutState`
  (C9) is the source of truth the graph mirrors; the shell owns only grid
  geometry/gutters/drag/tokens.
- **A6** — **Multi-document shared-node semantics pinned** (K5) before tabs:
  **RESOLVED 2026-09-11 (ui-overhaul §7.2, OB1)** — Option C: commit-time
  **warn + choose fork / mutate all**, plus the C20 shared-subtree background +
  owners box.
- **A7** — **Import containment** (K6): file list only; server-fixed root.
- **A8** — **Accessibility** (K8): pin per-unit.
- **A9** — **No new MCP tool for shell state** (`provident.toggle_pane` etc.) —
  pin in §6 (already drafted).
- **A10** — **Menu module** (`U-MENU-1`) precedes C13/C17.

---

## 5. Unit decomposition (draft; RCA-2 — per-unit cycles)

Already in `ui-overhaul.md` §8 (U-STATE-1 keystone; U-SHELL-1..9; U-EDIT-1/2;
U-MENU-1; U-IMPORT-1; U-PARITY-1..n). This gate does not re-decompose; it pins
the ordering (A2/A10) and the per-unit-spec requirement (A1).

---

## 6. Open items for the Architect (final call)

**CLOSED (2026-09-11 — Architect "proceed"):**

1. **Verdict:** **PROCEED-WITH-AMENDMENTS** (confirmed).
2. **Umbrella scope:** **umbrella-only** — this gate approves the contract +
   ordering; every unit still needs its own spec + red set (A1).
3. **Tabs shared-node semantics (K5/A6):** **RESOLVED — Option C** (warn + choose
   fork / mutate all) + **C20** visualization (`ui-overhaul` §7.2).
4. **Layout split (K3/A5/A11):** **RESOLVED — Reading 2** zone nodes are
   provident graph; serialized `LayoutState` mirrored; shell = geometry
   (`ui-overhaul` §7.3).
5. **Parity timing:** **parallel (Wave 1)** — chrome-independent.

---

## Bottom line

**PROCEED-WITH-AMENDMENTS (GATED 2026-09-11).** The overhaul is feasible and the
contract coherent after the in-conversation corrections. The gate's operative
outputs: (a) per-unit specs are mandatory (A1); (b) U-STATE-1 gates the
lifecycle-dependent units (A2); (c) the census is re-derived before the parity
wave (A4); (d) the layout split is Reading 2 (A5/§7.3); (e) shared-node editing
is Option C + C20 (A6/§7.2); (f) import containment, a11y, and the no-shell-MCP-
tool rules hold (A7–A9); (g) `U-MENU-1` precedes C13/C17 (A10). No code until
each unit has its own spec + red set.
