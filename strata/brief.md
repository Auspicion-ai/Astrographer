# Astrographer — strata design brief

- **Layer:** L0 · **Rev:** 1 · **Date:** 2026-11-15 · **Branch:** `post-division-rebuild`
- **Status:** the bootstrap corpus, installed with D-1…D-12; `ASM-1`…`ASM-3` (§8) stand open, and
  only the user closes one (D-1)
- **Scope:** the corpus's installation, the instruments as measured, and the foundation-import
  intake; no module design, no code
- **Ceiling:** 150 lines (class max); at the ceiling split by owner — never append (D-2)

## 0. What this repository is

Astrographer is an Electron app on `provident-ssr` whose renderer **is** the producing process: the
graph is authoritative and the HTML is read off the live DOM, while the main-process MCP server
exposes that graph to agents (59 tools in `ALL_TOOLS`, 3 resources — `src/main/mcp-server.ts`). It is
a **fork** of the foundation `../Provident-Electron`, the prebuild baseline for Electron apps on that
framework: the shell's chrome, the MCP surface and the renderer bridge are inheritance, while the
document store, the panes and the app's own behaviour are this repo's.

Two goals stand, inherited from the project's process document (`AGENTS.md`) and measured, not
re-decided here: it is the **implementation test** of `provident-ssr` and of `provident-editable` — a
finding is recorded, never patched (D-9) — and it is a **prebuild baseline** whose UI/MCP layer is the
foundation's, so a foundation change arrives as an **import** and never as a local rewrite (D-11,
D-12).

It ran under the gate workflow; its corpus still lives in `docs/` (§7). The strata workflow is
installed beside it (D-1) with three record kinds, hard per-class ceilings and provenance-or-silence
(§1).

## 1. Record kinds, and the rule that keeps them small (D-1, D-2)

| Kind | Owner | Write rule | Ceiling |
|---|---|---|---|
| State | scripts only, never prose (`strata-state`) | overwritten at every transition | 40 lines |
| Design | exactly one layer (§3) | replaced on revision; git is the history | 150 lines |
| Decisions | L0 only (`decisions.md`) | append-only, id'd `D-n`, user- or measurement-sourced, never reworded | 40 per row |

Provenance attaches to a statement — a bullet, a table row or a paragraph — and a normative line
carrying no `D-n` or § is a lint failure, not a style opinion (D-2). A superseded artifact is
replaced, never annotated.

## 2. The app as it stands (measured 2026-11-15 in this seat, unless a row names its reading)

| Fact | Value | Cite |
|---|---|---|
| MCP tools | **59** in `ALL_TOOLS`; **3** resources (2 fixed URIs + 1 template) | `src/main/mcp-server.ts` |
| Tool groups (gate) | **9** — `read`, `dispatch`, `graph`, `code`, `module`, `rag`, `edit`, `gnosis`, `gnosis-edit` | `src/main/security.ts` (`VALID_GROUPS`) |
| Transports | stdio, and Streamable HTTP behind `--mcp-transport=http` | `package.json`'s `start:http`, `src/main/main.ts` |
| Consumed packages | `provident-ssr ^0.5.2`, `provident-storeroom ^1.11.0`, `provident-editable ^0.2.0`, `@modelcontextprotocol/sdk ^1.30.0`, `undici ^6.28.1` | `package.json`'s `dependencies` (D-20) |
| Foundation pin | commit `e8dfb57…`, measured 2026-11-15 by unit `V-1`; **15** modules byte-identical at that commit, so the move owed no module byte | `vendor/foundation.lock.json`, `docs/L1/unit-v-1-pin-restate.md` |
| Source files | **92** tracked `src/**/*.ts` — 43 `src/main`, 26 `src/renderer`, 23 `src/shared` | `git ls-files 'src/**/*.ts'` |
| Tests | **144** flat `tests/*.test.ts` + 3 flat `tests/*.test.mjs`, and **3** nested `tests/integration/<module>/*.test.ts` the units added (147 `.test.ts` collected in all); a git pathspec's `*` crosses directories, so the census is taken with `find -maxdepth` | `find tests -maxdepth 1 -name '*.test.ts'`, `find tests -mindepth 2 -name '*.test.ts'` |
| Docs corpus | **254** tracked files, **227** of them under `docs/specs/` (re-measured after the `docs/L1/` unit contracts landed) | `git ls-files 'docs/**'` |
| Archive | **199** tracked files under `archive/` | `git ls-files 'archive/**'` |
| UI authority | every element outside the shell's own chrome is provident data in the graph, never hand-written DOM | `AGENTS.md`'s UI-rendering constraint (D-8) |

## 3. The layers (D-3)

| Layer | Responsibility | Owns (writes) | Exit condition |
|---|---|---|---|
| L0 | user interface: brief, decisions, exit walkthrough, reporting | `strata/` | walkthrough green, then the user accepts |
| L1 | e2e technical design: module map, module interactions, e2e battery | `docs/L1/`, `tests/e2e/`, `strata/modules.json` | e2e battery green, adversarially reviewed |
| L2 | integration design: each module's I/O surface and behaviour | `docs/L2/<module>/`, `tests/integration/<module>/` | integration battery green |
| L3 | module design: structure, signatures, pseudocode, guardrail notes | `docs/L3/<module>/`, `tests/unit/<module>/` | unit battery green |
| L4 | line implementation, one shot | the source files of its module | unit battery green, or fail early |

A lower layer may read upward artifacts and never writes them (D-3). At and below L3 an agent is
provisioned one module and no sibling's docs or code (D-7).

## 4. The loop (D-4)

A layer examines the artifact the layer below produces; feedback travels down as narrowed detail on
the same artifact id, never as a re-derivation. L4 receives pseudocode, signatures, guardrail notes
and the exact command that must go green; it owns no design, so inability to reach green bubbles to
L2. Examiners validate the battery before examining code, diagnose root cause and never supply a
patch (D-6). Repeat failure escalates to a rebuild (`rebuild.md`). A multi-unit deliverable is split
per unit before any unit starts, because a single pass cannot carry one unit's red→green→adversarial→greens
sequence beside a sibling's (§9, D-4).

## 5. Where the loop stands (D-12, D-19, D-20)

FIVE UNITS HAVE LANDED: `V-1` `pin-restate` moved the pin to `e8dfb57…` (measured 2026-11-15) in one
atomic commit with no module byte (D-19); `E-1` `deps-adopt` took the dependencies (`provident-ssr
^0.5.2`, `provident-storeroom ^1.11.0`) because the older engine dropped an authored provider at
render (D-20); `V-2` `conformance-refresh` made the eleven vendored copies the pinned commit's bytes
and restated the lock's `conformance` block as a measured 147-suite disposition set; `U-1a`
`zone-vocabulary` moved the zone vocabulary to the foundation's (`top|bottom|left|right`, `[zone=]`, the
pane `order` member becoming `index`), moved the MCP-visible `zone:` ids with it, and gave `UF-LAYOUT-2`
a literal limb the live leg read `PASS`. The program's design is
`docs/L1/foundation-import-program.md` and its module map `strata/modules.json`.

THE NEXT ACTIONABLE WORK IS `U-1c`: the item-8 gate is discharged (`docs/specs/foundation-import-u1-change-analysis.md`) and both of its
adjudications are ruled (D-22): `U-1b` carries the one-state collapse and `U-1c` the theme carrier. The store-program relation is `pending.md` row 1 and
the `docs/` migration row 2. No unit's stage is restated here: state lives in `strata/.strata/units/*.json`
(D-2).

The constraint every later unit inherits: nothing it builds may be a change to `provident-ssr`,
`provident-editable` or the adjacent foundation tree (D-9), and no unit rewrites the foundation's
surface locally where an import unit would move the pin (D-11).

## 6. Instruments at this head (the trio and build rows are the `9119608` readings; the `drift` and `npm test` rows are post-`V-1` readings and self-date their cells — a row name here never dates a reading)

| Instrument | Reading | What it can see |
|---|---|---|
| `npm test` | at the `V-2` landing: **147 files / 3,245 passed \| 22 skipped / 4 failed** — the four reds are the real-ollama live gates (the `embeddinggemma` model absent), not the change set; the last clean reading was 140 files / 3,105 passed / 0 failed at `9119608` | pure-module and main-process behaviour under the layout-less DOM shim — envelope-green, never app-green (D-10) |
| `npm run typecheck` | exit 0 at the same head | `src/**/*.ts` only |
| `npm run build` | exit 0 at the same head | the bundles exist at all |
| `npm run conformance` | **11 files, 11 failed — 511 failed / 59 passed (570)**, 3 suites collecting zero tests: a class tally and nothing more | the leg cannot see what it is usually assumed to see — its copies' specifiers resolve against a `vendor/Provident-Electron/src/` that does not exist, so the tally proves neither copy fidelity (the register does that) nor behaviour (D-11) |
| `npm run drift` | **CLEAN at this head** — 15 checks / 0 differences, and the `PIN` arm was read and EQUALS the manifest's commit (`revisionChecked === true`); before unit `V-1` it read `FAIL` on the `PIN` arm alone | upstream drift and a moved pin, read apart (D-11) |
| `npm run battery` | e2e battery over the built bundle's entry points | a process green, not a rendered-surface green |
| `npm run divergence` | real-DOM divergence leg | shim-versus-real-DOM identity on a live renderer |
| `node scripts/live-drive.mjs` | the live driver, run by hand on a usable display | the assembled, rendered app — the only leg that sees it (D-10) |

The layer rule every claim inherits: a module row's green under `npm test` is envelope-green, so a
unit's DONE report states which layer each reading covers (D-10).

## 7. The corpus and the docs tree (D-1)

`docs/` stays live and is not moved by this install: `docs/specs/` (227 files) remains the contract
corpus of the existing units, `docs/decisions.md`, `docs/defects.md`, `docs/pending.md`,
`docs/next-steps.md`, `docs/HANDOFF.md` and `docs/HANDOVER.md` remain that corpus's trackers, and
`docs/FORKER.md` remains the fork-orientation document. A unit's layer documents are **new** files
under the layer paths (§3); the two corpora meet at `strata/records/`, which points rather than
copies. Whether `docs/` migrates into the layer paths is a user ruling and stands in `pending.md`
row 2.

## 8. Open assumptions

- `ASM-1` — the existing tree is adopted as the substrate **for now**: `src/{main,renderer,shared}` and
  the flat `tests/*.test.ts` suite stay where they are, and L1's first act is a module map that either
  claims those subtrees as modules or declares new ones; the suite's migration into the layer test
  paths follows the claiming, per module. Rejected alternative: re-laying out `src/` and `tests/` into
  per-module folders before the map exists, which designs the modules from L0.
- `ASM-2` — the foundation's fifteen vendored modules stay byte-copied under `src/shared/` and are
  updated only through import units that move the lock in the same commit (D-11). Rejected
  alternative: re-authoring a vendored module locally instead of importing it, which makes the fork's
  copy a second source of truth.
- `ASM-3` — the existing gates continue to gate: the trio, the legs, and this project's recorded
  process gates (`AGENTS.md` items 3–12: red-before-green per unit, adversarial review per unit,
  blind greens, the per-unit documentation review) apply to every unit strata admits. Rejected
  alternative: replacing the existing suite with layer batteries, which discards the rows the
  project already trusts.

## 9. Non-goals

- Module, interface or class design at L0 (D-1).
- Editing another layer's document, at any layer (D-3).
- Any change to `provident-ssr`, `provident-editable` or `../Preempt-Providence/` (D-9).
- Re-authoring a foundation module in place instead of importing it (D-11).
- Migrating `docs/` into the layer paths without a user ruling (`pending.md` row 2).
