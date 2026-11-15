# Astrographer — measured platform constraints

Reference facts the layers design within. Not design: what the deployment and this checkout
actually do, measured 2026-11-15 in this seat, and **replaced** when a measurement changes, never
annotated (D-2). Ceiling: 60 lines.

## 1. Delegation

- The strata preset lives in the deployment (`~/.dsh/.agent-presets/strata/agent.cordis.yml`), not
  in this tree; the project carries the artifacts, the deployment carries the role walls. A role row
  is a `dsh-tool-subagent` entry with `toolName: role_*`, `maxDepth: 4` (five layers need four
  recursions) and an explicit `toolFilter.allow` list (D-1).
- Children inherit this workspace and the delegation-scoped sandbox mode. Layer returns arrive as
  text: the `subagent` tool exposes no structured return, so every return carries the envelope of
  `envelope.md` and is validated after the fact (D-2).
- The lint and the state machine ship with the workflow checkout, not with this project:
  `../Agent Harness/strata/lint/strata-lint.mjs` and `../Agent Harness/strata/state/strata-state.mjs`
  (D-2).

## 2. File walls

- The sandbox enforces whole-workspace modes only (read-only / workspace-write /
  danger-full-access); it cannot restrict writes to a subdirectory. Layer quarantine is therefore
  tool wall plus diff-scope lint, and must never be described as sandbox-enforced (D-7).

## 3. This checkout

- Node `v24.20.0`. Consumed packages — `provident-ssr ^0.5.2`, `provident-storeroom ^1.11.0`, `provident-editable ^0.2.0`,
  `@modelcontextprotocol/sdk ^1.30.0`, `undici ^6.28.1` — and devDependencies — Electron `^44.4.3`,
  esbuild `^0.28.2`, TypeScript `^5.5.0`, vite `^8.3.0`, vitest `^5.0.1`, `@types/node ^24.13.6`
  (`package.json`'s `dependencies` and `devDependencies` blocks).
- **Seventeen script keys** (`package.json`'s `scripts` block): the verification legs are `test`,
  `typecheck`, `build`, `battery`, `divergence`, `conformance` and `drift`; `mcp` is the CLI leg; the
  seven `start*` keys and `clean` launch or reset the app and are no leg. Every leg's reading is
  `brief.md` §6's and is never restated here (D-10).
- The repository is the sole workspace: this repo's `src/`, `tests/`, `scripts/`, `docs/` and
  `strata/`. The consumed packages are read-only for every layer (D-9). The adjacent foundation
  checkout `../Provident-Electron` is read-only for every layer, and is reached through the drift
  leg and the import units that move the pin (D-11).

## 4. The harness cap, the lint and the state shape

- A module's harness is capped at `50 + 10×N` with `N` the endpoint count its `modules.json` row
  declares — MCP tools, routes, or a package's exported surface functions it calls. L1 declares the
  surface; it never declares its own cap (D-7).
- `strata-lint` enforces ceilings per class (brief 150, procedure 60 or less, reference 60, tracker
  40, register row 40), citation resolution, exemplar quarantine, statement-level provenance, state
  and envelope shape, and module diff scope. It exits non-zero and the layer fails with it (D-2).
- `modules.json`'s shape is `{"modules":[{"name":"store","paths":["src/main","tests/unit/store"],
  "endpoints":7}]}`; a missing file is reported as INFO and leaves diff scope unchecked (D-7).
- Unit state (`.strata/units/<unit>.json`): `unit`, `layer`, `stage`, `artifacts`, `assumptions`
  (`{id, text, alternative, status}`), `streaks`, `rebuildEligible`, `lastFailure`, `updated`.
  `rebuildEligible` is the script's answer at `streaks ≥ 3`, and `updated` is when the state last
  changed, not the work (D-2).

## 5. The layer write scopes at this head

- `docs/L1/`, `docs/L2/<module>/`, `docs/L3/<module>/` and `tests/{e2e,integration/<module>,unit/<module>}`
  now exist where units have claimed them (`docs/L1/` holds the program's map and its landed units' contracts — `V-1` and `E-1` at this head; `tests/integration/{foundation-vendor,shell-chrome}/` hold the battery rows). The existing flat `tests/` tree is claimed by L1's map and migrates per module at claim time, never wholesale ahead of it (`ASM-1`, `ASM-3`).
