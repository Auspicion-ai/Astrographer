# Astrographer — module isolation

Procedure for the isolation rule at and below L3 (D-7). Ceiling: 40 lines.

## 1. What a module agent gets

Exactly one module: `docs/L3/<module>/`, that module's source subtree, `tests/unit/<module>/` (or the
module's declared test paths), and the L2 interface document for that module. Nothing else. Folders
are the unit of isolation — sibling modules are siblings, not parents of each other. A module agent
that needs another module's surface reads the **L2 interface** and never that module's code or docs
(D-7).

## 2. Why it is a control, not hygiene

A sibling's exemplars and single-decision rules cannot leak into a module's design if the module never
sees them (D-7). Isolation also bounds each agent's context, which is the documentation-size problem
applied to context rather than to files (D-7).

## 3. The declarations

`strata/modules.json` carries one entry per module with `name`, `paths` (the subtrees it owns) and
`endpoints` (the surface count the §4 cap is derived from). Two modules never claim one path — the
lint fails that (D-7). L1 files the map as its first act of a unit, and no design is admitted before
it (D-7, `platform.md` §4).

## 4. Cross-module needs and the harness cap

If the L2 interface is insufficient for the work, the module agent has found an L2 defect: that is an
adjudication request, counted as a failure and routed to L2 (D-4). The forbidden route is reading a
sibling's code and inferring the contract from it (D-7).

A module's harness is capped at `50 + 10×N`, where `N` is the endpoint count that module declares;
`strata-lint` counts N and never the author (D-7, `platform.md` §4). Exceeding the cap means the
surface is too large — shrink the surface, never the harness.

## 5. Enforcement, stated plainly

Isolation is **prompt-and-lint enforced, not sandbox-enforced**: every written path is checked against
the module's declared subtree, and reads outside it are not prevented (D-7, `platform.md` §2). The
harness's own gate is never built inside this corpus: no layer judges its own design (D-6).
