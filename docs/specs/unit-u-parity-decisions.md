# Unit U-PARITY-DECISIONS — PG12 (module-tool runner) + PG13 (assistant suggestions) — Spec

**Status:** DRAFT 2026-09-11. **Document-only — no code.** These are the two
remaining parity **decisions** (not gaps). Gate: UI-overhaul umbrella gate. Open
items: `docs/specs/wave-1-open-decisions.md` W1-Q14/Q15.

---

## 1. PG12 — the `module:<name>.<tool>` runner

**Question:** the module manager (`G7`, operator modal) lists/installs modules but
cannot invoke a module's registered dynamic tools. Should it?

**Proposed (W1-Q14 default (a)):** an **operator-only runner** in the modal module
manager — a control that calls `module:<name>.<tool>` through the SAME
application seam (the module router). **Never MCP-exposed** (module tools already
gate on `module` + `code`; the runner is an operator convenience, not a new
surface).

**Contract if approved:**
- The runner lists a module's registered tools (from the router) + an args input.
- Invocation routes through the existing two-gate `invokeTool` (module + code).
- Operator scope; not MCP-visible; no new tool.

**States:** list tools; invoke with args; a gate-off module → fail-closed; a
bad-args call → the tool's error.

## 2. PG13 — assistant suggestions

**Question:** the overhaul names an "assistant suggestions" utility pane (C4) but
there is **no MCP tool and no suggestion source**.

**RESOLVED (W1-Q15) — parity required.** A pane alone is **not acceptable**: the
assistant-suggestions surface must have a matching **MCP tool**, and both must
share the same application seam/source. Since **no suggestion source exists**,
the feature is **blocked on defining one**:

- If a source is defined (host store or service), build the pane + the matching
  MCP tool + the shared seam **together**.
- Until then, **park** the assistant-suggestions pane (do NOT ship it UI-only).
- This supersedes the earlier UI-first carve-out default.

**Parked state:** record in `docs/pending.md` with the revisit condition "a
suggestion source exists (host-side or service)"; the pane + tool land together.

**States (if/when unblocked):** renders suggestions; empty state; the MCP tool
returns the same list; both share the source.

---

## 3. Fail-states

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | PG12 a module tool with a missing body | the router error surfaces |
| F2 | PG12/PG13 operator scope only | never MCP-visible |
| F3 | PG13 no source | placeholder state, no crash |

## 4. Census

- PG12: a runner control + handler in the modal. PG13: a pane + a host source.
  0 new dependencies; no new MCP tool.

## 5. Cross-references

- `docs/specs/ui-overhaul.md` §4 G7/G9, §5.1 PG12/PG13, §6.
- `docs/specs/module-import-proposal.md`, `src/renderer/extensions.ts`.
- `docs/specs/wave-1-open-decisions.md` W1-Q14/Q15.

## 6. Delimitation

Two decisions + (if approved) their minimal operator/app-graph surfaces. No
engine change.
