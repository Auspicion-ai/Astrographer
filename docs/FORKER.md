# FORKER — Orientation for Follow-On Projects

> **Read this first.** Provident-Electron is a **base foundation build** that
> follow-on projects fork and build on top of. This doc gives you the orientation
> a fork agent needs WITHOUT reaching into the current project's `archive/`
> directory or the adjacent `../Preempt-Providence/` folder — neither ships in a
> fork.

## 1. What ships in a fork, what does not

| Ships in the fork | Does NOT ship |
| --- | --- |
| `src/` (all TS source) | `archive/` — **gitignored** (`.gitignore:88`); holds only historical review records + retired proposal/review gates |
| `tests/` (all vitest suites + fixtures) | `../Preempt-Providence/` — the ADJACENT upstream package source folder (not a dependency) |
| `docs/` — **this is your contract source of truth** | `node_modules/provident-ssr/` source (a published npm package; install it) |
| `dist/` after `npm run build` | — |

**The active `docs/` tree IS the source of truth.** `docs/specs/mcp-endpoint.md`
is the MCP contract. `docs/decisions.md` is the decision record. `docs/defects.md`
is the active defect list. `docs/pending.md` + `docs/next-steps.md` are the
trackers. Everything landed is documented there; the archived gates in
`archive/` are historical rationale only.

## 2. The dependency map (what to install / where upstream specs live)

- **`provident-ssr`** — the only runtime dependency, published on npm. `npm i
  provident-ssr@^0.2.1`. It is fully self-contained (ESM). Its bundled type defs
  (`node_modules/provident-ssr/dist/**/*.d.ts`) + the SDK docs are the engine
  surface.
- **`@modelcontextprotocol/sdk`** — the MCP server SDK.
- **The upstream project** (`github.com/LittleKingsguard/Preempt-Providence`) —
  the `provident-ssr` source + its `docs/specs/`. Several active docs reference
  upstream spec names that do NOT ship locally. They are recoverable from the
  upstream GitHub repo / the published package:
  - `ssr-synthetic-event.md` (Phase A/B dispatch contract)
  - `undo-redo-report.md` (the journal `UndoRedoReport` surface, 0.2.1)
  - `multi-graph-isolation-spec.md` (the SecurePanels `createIsolatedScope` model)
  - `handoffs-review-2.md` (battery + `new Function` trust-gate provenance)
  - `next-feature-batch-0.2.0.md` (0.2 feature roadmap)
  - `pending.md` (Phase C row — the MCP/Electron endpoint this repo implements)

> **Rule:** this repo NEVER edits the package or the upstream folder. Defects go
> to `docs/defects.md` → `docs/HANDOFF.md` (outgoing issue records), never patched
> here. Follow-on projects should keep this: the engine is a dependency, not a
> thing to vendor-patch.

## 3. The MCP surface (what an agent drives)

The repo's purpose is **full synthetic-event access + rendered-HTML visibility
for MCP endpoints** (agentic use + debugging). The MCP tools (gated by tool
groups, all in `docs/specs/mcp-endpoint.md` §3):

| Tool | Group | Purpose |
| --- | --- | --- |
| `provident.dispatch` | dispatch | drive a synthetic event on a node |
| `provident.get_rendered_html` | read | rendered DOM + SSR fragment + census |
| `provident.get_markdown` | read | simplified text-only output |
| `provident.list_targets` | read | addressable node vocabulary |
| `provident.get_node_state` | read | a node's resolved states |
| `provident.load` / `op` / `export` / `validate` / `teardown` | graph (OFF) | envelope/doc/commands load, managed-channel ops, export, validate, teardown |
| `provident.journal` | graph (OFF) | undo/redo/replay (journal reversibility) |
| `provident.code.*` | code (OFF) | envelope authoring (get/set/create/delete/validate/load/loadBatch) |
| `module.install` / `module.update` / `module.list` | module+code (OFF) | the extension system (see `docs/specs/module-feature-list.md`) |

**Tool groups OFF by default:** `graph`, `code`, `module` — a human enables them
via the manual-UI Settings pane (main process owns the gate; an agent can never
self-grant).

## 4. Reshape digest — the "why" behind the current shapes (recoverable without the archive)

The following reshape sets are the decision rationale that was archived. The
outcomes are in the active docs; the definitions are reproduced here so a fork
agent extending the surface knows why the shapes were chosen.

### J1-J8 — the journal endpoint (`provident.journal`)
- **J1 (was blocking, RESOLVED by upstream 0.2.1)** — the derivability gap:
  `undo()/redo()/replay()` returned `void` + private stacks. 0.2.1 gives an
  `UndoRedoReport` (`{status, scheduledDirtied, stackTopKind?, redoTopKind?,
  baseBoundary}`) + read-only stack accessors.
- **J2 (superseded)** — originally a narrowed `{status, renderedHtml, ssrHtml,
  warnings}` return; superseded by the full report surface.
- **J3** — whole-graph rebuild on base-restore (the host must rebuild
  `nodes`/`rootNode`/id-index, not focused-slice).
- **J4** — honest framing: undo reverses only EXACT subset (state-slice/attach/
  rows-mint); destroy is a pinned no-op; 6 op kinds documented no-ops; dispatch
  NEVER undoable; stacks emptied by any re-derive.
- **J5** — single `provident.journal { action: 'undo'|'redo'|'replay' }` tool.
- **J6** — five-seam registration (`security.ts` TOOL_GROUPS + mcp-server
  ALL_TOOLS + types RpcMethod + renderer switch + MUTATING_METHODS).
- **J7** — no `requestId` (intrinsically non-idempotent).
- **J8** — app-Runtime-only (never the isolated SecurePanels graph).

### R1-R5 — the MCP resources (`mcp://provident/app`, `/node/{id}`, `/targets`)
- **R1** — resources are `read`-group members (register only when group allowed;
  never always-registered).
- **R2** — capture + live re-gate the resource handles.
- **R3** — wire into both transport builds (stdio + per-POST HTTP).
- **R4** — node-template read hardening + isolation (validate in-tree id, never
  read the SecurePanels graph).
- **R5** — always-fresh snapshots, per-resource mimeType, template-over-enumerated.

### N1-N7 — the live-change notification
- **N1** — typed notification (`resource-updated` / `resource-list-changed` /
  `tool-list-changed`) with correct triggers.
- **N2** — stdio-only push (HTTP no-op), enforced not just documented.
- **N3** — app-Runtime-only source; SecurePanels never emits (isolation guard).
- **N4** — new `provident:notify` renderer→main IPC channel.
- **N5** — gated + opt-in (manual-UI), default OFF.
- **N6** — coalescing: one notify per tool invocation's write-side.
- **N7** — low-level `sendResourceUpdated` + per-client `resources/subscribe` gate.

### B1-B8 — `code.loadBatch`
- **B1** — single-tool `code.loadBatch(ops[])` form (reject the write-buffer).
- **B2** — all-or-nothing clone-then-validate-then-commit.
- **B3** — ordered-with-dependencies (apply to the evolving clone).
- **B4** — pinned discriminated batch-op schema.
- **B5** — `LoadResult` + per-op status return.
- **B6** — the six-site `code`-group registration checklist.
- **B7** — no-envelope case throws the same error as other `code.*` writes.
- **B8** — honest framing (N-1 round-trips, NOT re-derive cost) + test matrix.

### R1-R16 — the E2E battery (Units B/C/D)
R1 version-pin + tracker reconcile; R2 corrected A1 recipe; R3 snapshot-parity
scope; R4 the fork-stress census arithmetic (`inTree = 2^d − 1 + 2(d−1)` = 4117
at d12); R5 C4-vs-d12 depth amendment; R6 the `hasPendingWork()` settle-gate in
teardown; R7 battery assertion hygiene (key on css.id, never `node-N`);
R8 userData lifecycle; R9 pass-2 drain ownership; R10 warning surfacing;
R11 cycle-variant A3 scoping; R12 stress-expand body provenance; R13 DOM-shim
fidelity; R14 live-prod privacy guard rail; R15 `hook-kind-mismatch` containment
list; R16 C3 wording.

## 5. The archival-loop convention (was only in gitignored `archive/README.md`)

`archive/` is **gitignored and does not ship**. It is a write-only dump for
retired review records; nothing there is a source of truth. The convention:

1. After every change, merge new info into the **core docs** (`mcp-endpoint.md`,
   `defects.md`, `decisions.md`, `pending.md`, `next-steps.md`).
2. Move obsolete docs / stale test data / findings / review records to
   `archive/<topic>/<date>-<name>.md` (gitignored).
3. Repoint/remove every reference to an archived file.

**For fork agents:** never cite `archive/` (it won't be there). Cite the active
trackers. If you see a `*greens.md` doc referencing a review's location, it's
provenance only — the contract is in `docs/specs/`.

## 6. The process (brief)

- **TDD always**: a new method/tool is red → green → adversarial → greens →
  doc-review. See `docs/skills/process-guardrails.md` for the full gates.
- **Defect-handoff**: a `provident-ssr` defect → `docs/defects.md` +
  `docs/HANDOFF.md` (issue to the upstream), never patched here.
- **Three-agent gate**: a contract change goes through validity → critique →
  change-analysis before code (records in `docs/specs/`).
- **Trio to verify**: `npm test` (vitest) + `npm run typecheck` + `npm run build`.

## 7. Where to start

1. `docs/specs/mcp-endpoint.md` — the MCP contract (the core).
2. `docs/specs/module-feature-list.md` — the extension system (the newest,
   self-contained).
3. `docs/decisions.md` — the decision record.
4. `src/` — the implementation (main = MCP + gate + store; renderer = Runtime +
   router + panes; shared = types).
5. `tests/` — the suites; `module-*.test.ts` show the module system's TDD.
