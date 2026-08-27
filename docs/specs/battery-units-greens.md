# Green Scenarios — Unit B (cycle variant), Unit C (battery + code-CRUD), Unit D (battery host)

Status: **GREEN-SCENARIO SET** — to be attempted during the blind-test loop.
Each scenario below is a behavior `docs/specs/e2e-test-battery.md` §3/§5.1.x/
§5.4/§6 (the Units B/C/D landings) claims; the blind-test agent runs it against
the live module/host and confirms it PASSES. A blind-test failure is a doc bug
OR an un-hardened regression — never a pass.

Modules under test:
- Unit B — `src/shared/path-fork-cycle.ts` (`pathForkCycleLegacyData`,
  `cycleMethodFor`, `CYCLE_METHODS`, `linkDefForLevel`, `levelCss`).
- Unit C — `src/renderer/runtime.ts` (the MCP battery surface: `load`/`op`/
  `export`/`validate`/`teardownResult` + `codeGet`/`codeSet`/`codeCreate`/
  `codeDelete`/`codeValidate`/`codeLoad`).
- Unit D — `src/main/battery-host.ts` (the headless Runtime-backed MCP server,
  all tool groups pre-enabled) + `tests/e2e-battery.test.mjs` (the 93-check
  runner over stdio).

## B1 — the cycle-variant envelope (Unit B, §5.1.x)

1. `CYCLE_METHODS` → `['placement','values','link']` (the static trio WITHOUT
   `handler`).
2. `cycleMethodFor(k)` cycles per layer: `1→placement, 2→values, 3→link,
   4→placement, 5→values, 6→link`.
3. `pathForkCycleLegacyData(12)`: `template.root.children.length === 2`
   (level-1 prototypes) and `content[0].content.length === 20` (layers 2..11);
   2·12−1 = 23 prototypes/nodes and 2^12−1 = 4095 path-state elements.
4. Every level carries the two-sided placement: level-1 has
   `placementName:'zone-1'` (no `targetPlacement`); level k≥2 has
   `placementName:'zone-<k>'` + `targetPlacement:['zone-<k-1>']`.
5. Layer 2 (values) prototypes carry `component: {reference:'values-2.a',
   value:'value-A-2'}` (and `.b` → `'value-B-2'`).
6. Layer 3 (link) prototypes carry `component: {reference:'link-3', value:<a
   def with type:'div', children:[{content:'link-3.a'},{content:'link-3.b'}]>}`.
7. Layer 1 (placement) prototypes carry NO `component` field.
8. The envelope has ZERO handlers and ZERO clones (a `JSON.stringify(env)` does
   not contain `handler` or `clone` — the data-only pin).
9. `translateLegacy(pathForkCycleLegacyData(12))` → 23 nodes, no warnings.

## C1 — the MCP battery surface load paths (Unit C, §3)

10. `runtime.load({kind:'envelope', envelope: demoEnvelope()})` →
    `{ census.inTree > 1, renderedHtml contains 'counter', ssrHtml contains
    'counter', warnings is an array }` (R10).
11. `runtime.load({kind:'doc', doc})` (a serialized demo doc) → `census.inTree > 1`.
12. `runtime.load({kind:'commands', commands:[{kind:'state-slice', node:
    <counterNodeId>, mutation:[{targetProp:'content', mode:'replace',
    value:'7'}]}]})` → the rendered HTML contains `>7<`.
13. `runtime.load({kind:'bogus'})` → THROWS `/unknown load kind/`.
14. **R4/F4** — `runtime.load({kind:'commands', commands:{a:1}})` (a non-array
    `commands`) → throws `/not iterable/` (never a silent per-key apply).

## B3 — op / export / validate / teardown (Unit C)

15. `runtime.op({kind:'state-slice', node:<counterNodeId>, mutation:[{...,
    value:'9'}]})` → `{status:'applied', renderedHtml, ssrHtml, warnings}` with
    `renderedHtml` containing `>9<`.
16. `runtime.export('legacy')` → `{export, census}` where `export.template` is
    defined and `census.inTree > 1`.
17. `runtime.validate('legacy', runtime.export('legacy').export)` →
    `{valid:true, censusMatch:true}`. **R3 note (2026-08-23):** `treeSigMatch`
    is a best-effort structural-parity field that is legitimately `false` for a
    seam/def-bearing export round-trip (the throwaway re-translate emits only
    the root — children re-enter as unplaced content payloads, per R3 "ONLY
    structural parity for def/seam-bearing exports; serialize→loadState is
    snapshot-only"). `treeSigMatch` is a signal, not a contract: a parity-able
    export reports it; a seam-bearing one reports it `false` WITHOUT invalidating
    `valid`/`censusMatch`. The green assert is therefore `{valid:true,
    censusMatch:true}` + `treeSigMatch` is a boolean (report the honest value).
18. `runtime.teardownResult()` → `{census:{inTree:1}, renderedHtml}` where the
    rendered HTML no longer contains `counter` but DOES contain the root id.
19. `runtime.load({kind:'envelope', envelope: pathForkCycleLegacyData(12)})`
    → `census.inTree === 23` AND `census.registered === 23` (the cycle variant's
    static census — a fresh supervisor, all 23 nodes registered, none
    destroyed/minted; equality holds for the no-mint static family).

## B4 — SSR survives a graph reload (R13 stale-adapter regression)

20. A root-only boot renders `ssrHtml` containing `preempt-root`; after
    `runtime.load({kind:'envelope', envelope: demoEnvelope()})` the `ssrHtml`
    contains `counter` and has length > 0; a SECOND `load` of the demo again
    yields a non-empty `ssrHtml` containing `counter` (the SSRFragmentAdapter
    is recreated each load — no stale-adapter collapse).

## C1 — code-CRUD (Unit C, §4)

21. `codeGet('template.root.children[1].children[2]')` → a defined `value`.
22. `codeGet('')` → `{path:'', value: <the whole envelope>}`.
23. `codeSet('template.root.hooks', ['theme','user'])` → `{ok:true,
    wrote:['theme','user']}`; `codeGet('template.root.hooks').value` reflects it.
24. `codeCreate('template.root.hooks', 'accent')` (hooks=`['theme']`) →
    `{ok:true, appendedAt:1}`; array → `['theme','accent']`.
25. `codeCreate('template.root', {})` (non-array path) → throws `/not an array/`.
26. `codeDelete('template.root.hooks', 1)` (hooks=`['theme','accent','user']`) →
    `{ok:true, removed:'accent'}`; array → `['theme','user']`.
27. **H5/F8** — `codeDelete('template.root.hooks', 99)` and
    `codeDelete('template.root.hooks', -1)` → THROW `/out of range/`; the array
    is untouched.
28. `codeValidate()` on a valid envelope → `{valid:true, warnings:[...]}`.
29. `codeValidate({template:null, content:'garbage'})` → `{valid:false}`,
    never throws.
30. `codeLoad()` after a `codeSet`/`codeCreate` → re-derives the graph:
    `census.inTree > 1`, `renderedHtml` contains `counter`.
31. After a `code.set`/`codeCreate`, `code.load` re-derives the graph and its
    `renderedHtml` + `ssrHtml` are BOTH non-empty and re-emit the graph (the
    edited envelope re-materializes the whole view in both DOM and SSR —
    `renderedHtml` and `ssrHtml` each contain `counter`).
32. `codeSet('template.root.hooks', [])` after a `{kind:'doc'}` load → THROWS
    `/no envelope/` (an A1 doc load carries no legacy envelope).

## D1 — the battery host + runner (Unit D, §6)

33. `tests/e2e-battery.test.mjs` spawns `dist/main/battery-host.mjs` (stdio) and
    connects the SDK client once; `listTools()` includes the 4 read/dispatch
    tools + all 5 graph tools (`load`/`op`/`export`/`validate`/`teardown`) + all
    6 code tools (`code.get/set/create/delete/validate/load`) — the battery host
    pre-enables every group (`SecurityGate` with
    `enabled:['read','dispatch','graph','code']`).
34. Each of the 4 fork-stress d12 variants (placement/values/link/cycle) loads
    via `provident.load {kind:'envelope'}` → `census.inTree === 23` and
    `registered >= 23` (the version-stable claim — equality holds for the
    no-mint static family, but `>=` is the assertion shape the runner uses to
    tolerate registry-sweep timing); `get_rendered_html` renders `data-node-id`
    elements.
35. The landings scenario (userData-conditional) shows `ANON` on the anon load
    and `LOGOUT` on the logged-in load (R8 userData switch).
36. The handler scenario (counter inc): a `provident.dispatch` on the `inc`
    cssId returns non-empty `results` + non-empty `dirtied` (R7 hygiene) and
    re-renders.
37. The code-CRUD scenario: `code.set`/`code.create`/`code.validate`/`code.load`
    over MCP succeed in sequence; `code.load` re-derives the graph
    (`census.inTree > 1`).
38. After EVERY scenario, `provident.teardown` returns `census.inTree === 1` and
    `get_rendered_html` shows a root-only mount (no `counter`) — the C3/C4
    root-only restore between scenarios.
39. The full battery reports `0 failures` (93 checks).

## How the blind-test uses this

- The blind-test agent reads ONLY `docs/specs/e2e-test-battery.md` §3/§5/§6
  (+ this file's claims) and runs each scenario against the modules/host,
  asserting PASS.
- A scenario that FAILS is a defect OR a doc/spec drift — record it, never edit.
- The green set is the regression net for Units B/C/D + the H4/H5/H6 + H7..H13
  adversarial fixes (H4→B3/F4→13, H5→C1/27, H6→runtime-host greens, H7..H13 →
  `runtime-host.md §3b` + `tests/runtime-battery.test.ts` adversarial block).
