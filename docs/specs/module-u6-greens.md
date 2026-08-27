# Blind-test greens — U6: emit-only render-transform wiring (M-r5)

**Status**: BLIND-TEST WRITER artifact (AGENTS.md item 10a) for Unit U6.
Produced from `docs/specs/module-import-proposal.md` §4 (transform seam + §4
read-time re-scope) + `docs/specs/module-feature-list.md` §3/§5. Run by a fresh
agent from the docs only.

## Contract under test (from the docs §4 + feature-list §3)

1. `RuntimeOptions` accepts a `transformRouter` (`CapabilityRouter`).
2. The transform is applied to the rendered fragment at READ time for the MCP
   views: `renderedHtml`, `ssrHtml`, AND `markdown` (parity — all agent-facing
   views are transformed identically).
3. The transform is EMIT-ONLY (string-in/string-out) — it NEVER touches
   Node/Supervisor content; the operator's live DOM is untransformed
   (read-time re-scope).
4. A Runtime WITHOUT a `transformRouter` applies no transform.
5. Transforms compose in registration order.
6. A throwing transform is contained — the ORIGINAL (untransformed) fragment is
   returned, never a crash.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| T1 | Runtime constructed with a router whose transform uppercases the fragment | `renderedHtml` contains the transformed (uppercase) text; the original lowercase is gone |
| T2 | Same router | `ssrHtml` also transformed identically (parity with the DOM view) |
| T3 | Same router | `markdown` also transformed identically (parity across all MCP views) |
| T4 | Router registers an emit-only transform | graph is NOT mutated — `listTargets` Node content is the ORIGINAL lowercase (untransformed) |
| T5 | Runtime constructed WITHOUT a router | fragment is unchanged (original lowercase present, no uppercase) |
| T6 | Two transforms registered in order (A then B) | both markers present; A's marker precedes B's (composition order) |
| T7 | A transform that throws | render does not crash; the ORIGINAL (untransformed) fragment is emitted |

## Execution record (2026-08-26)

**T1-T7: PASS — verified by repo suite (7 tests).** The scenarios map 1:1 onto
`tests/module-transform.test.ts`:

| # | Repo test | Result |
| --- | --- | --- |
| T1 | U6 `1. a Runtime constructed with a transform router reflects the transform in renderedHtml` | PASS |
| T2 | U6 `2. the transform applies to BOTH the DOM view AND the SSR fragment (parity)` | PASS |
| T3 | U6 `7. the transform applies to get_markdown too (parity across all MCP views)` | PASS |
| T4 | U6 `3. the transform is EMIT-ONLY — the graph is NOT mutated (listTargets content unchanged)` | PASS |
| T5 | U6 `4. a Runtime WITHOUT a transform router applies no transform (fragment unchanged)` | PASS |
| T6 | U6 `5. two transforms compose in registration order in the rendered output` | PASS |
| T7 | U6 `6. a throwing transform does NOT crash the render — the original fragment is emitted` | PASS |

The repo suite is authoritative (the same convention as the U5 greens doc).
Trio green 2026-08-26: 632 tests / 2 skipped, typecheck clean, build clean.
