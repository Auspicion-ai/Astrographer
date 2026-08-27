# Green Scenarios — Runtime Host Capabilities (Unit A)

Status: **GREEN-SCENARIO SET** — to be attempted during the blind-test loop
(upstream AGENTS.md item 10 / subagents.md: an agent who has NOT read the
implementation validates the DOCUMENTATION against the RUNNING code). Each
scenario below is a behavior `docs/specs/runtime-host.md` (+ the H1..H6
adversarial fixes) claims; the blind-test agent runs it against the live module
and confirms it PASSES. A blind-test failure is a doc bug OR an un-hardened
regression — never a pass.

The module under test: `src/renderer/runtime.ts` (the `Runtime` class, built
and exercised under the DOM shim `src/shared/dom-shim.ts`). The unit tests
`tests/runtime-host.test.ts` + `tests/runtime-battery.test.ts` encode the same
states; the blind-test runs these as the regression net for the A-adversarial
fixes H1..H6.

Setup for every scenario: `installShim()` once, then
`new Runtime({ mount: mountEl(), envelope: demoEnvelope() })`; call
`runtime.bootstrap()` before asserting a render. `demoEnvelope()` from
`src/shared/demo-envelope.ts`.

## R1 — loadEnvelope (A2) & the render

1. `runtime.loadEnvelope(demoEnvelope())` returns a `Census` with `inTree > 1`
   and `registered >= inTree` (equality holds when there are no minted/destroyed
   nodes — the demo has none; the `>=` relation is the version-stable general
   claim, REQ-GAP-11 discipline).
2. After the load, `runtime.renderedHtmlResult().renderedHtml` contains the
   `counter` authored id (the demo root's counter node rendered).
3. `runtime.renderedHtmlResult().ssrHtml` also contains `counter` — DOM and SSR
   emit the same graph (PAR-5 parity).
4. `loadEnvelope` returns a FRESH census each call; calling it twice replaces
   the graph (a second load's census reflects only the new envelope).

## R2 — loadEnvelope userData lifecycle (R8)

**D4 (2026-08-23):** `userEnvelope` is NOT a pinned fixture in this repo — it
must be reconstructed from `runtime-host.md` §3.1's R8 prose: an envelope whose
root has a child node carrying the authored `cssId` `'ud-read'` + a
`handlers: [{ event:'click', body: <reads translate userData> }]`, rendered
via the A2 envelope path. The blind writer must author this node (no fixture
is shipped); the R8 contract is that the handler renders the translate-scoped
`supervisor.userData.username` (or `ANON` when absent).

5. `loadEnvelope(userEnvelope, { userData: { username: 'alice' } })` then
   `await runtime.dispatch({ target: {kind:'cssId',cssId:'ud-read'},
   event:'click' })` → the rendered HTML contains `alice`.
6. `loadEnvelope(userEnvelope)` (NO userData) after the alice load → the
   dispatch renders `ANON`, NOT `alice` — the anon-after-alice trap is closed
   (the translate-scoped userData is cleared on a no-userData load).

## R3 — loadDoc (A1, snapshot-parity)

7. `loadDoc(serializeSlice(t.root, t.nodes, {adapter:'dom',persistence:false}))`
   (where `t = translateLegacy(demoEnvelope())`) → returns a `Census` with
   `inTree > 1`.
8. The doc load renders — `renderedHtmlResult().renderedHtml` contains `counter`.

## R4 — applyCommand / op

9. `applyCommand({ kind:'state-slice', node:<counterNodeId>, mutation:
   [{targetProp:'content', mode:'replace', value:'42'}] })` → `{ status:
   'applied' }` and the render shows `>42<`.
10. `applyCommand({ kind:'state-slice', node: counterNodeId, mutation:
    [{targetProp:'placement', mode:'replace', value:1}] })` → `{ status:
    'rejected' }` (a hard-blocked placement projection), NEVER throws.
11. **H3** — `applyCommand({ kind:'clone-instance', node:'does-not-exist',
    source:'x', slot:'y' })` → `{ status: 'rejected' }`, never throws (an
    unresolvable string `node`).
12. **H4/F1** — `applyCommand({ kind:'clone-instance', node: 5, source:'x',
    slot:'y' })` (a NON-string node) → `{ status: 'rejected' }`, never throws
    (a raw number must not reach `source.clone`).
13. **H4/F10** — `applyCommand(null)` and `runtime.op(undefined)` → both
    `{ status: 'rejected' }`, never throw (a non-object command).
14. **F2** — `applyCommand({ kind:'bogus-kind' })` → `{ status: 'rejected' }`
    (an unknown op kind is rejected, not a throw).
15. `op({ kind:'state-slice', node: counterNodeId, mutation:[{targetProp:'content',
    mode:'replace', value:'9'}] })` returns `{ status:'applied', renderedHtml,
    ssrHtml, warnings }` — the `op` (MCP `provident.op`) shape carries the two
    render views + a `warnings` array (R10). (The op-kind vocabulary is
    `state-slice`/`layer-apply`/`destroy`/etc. — `state` is NOT a valid kind.)

## R4 — export / validate

16. `exportLegacy()` returns an object with `template`, `content`, and
    `clientConfig` (a `LegacyInitialData`).
17. `validateExport('legacy', exportLegacy())` → `{ valid:true,
    censusMatch:true }`.
18. `validateExport('legacy', { template: null, content:'garbage',
    clientConfig:null })` → `{ valid:false }`, never throws.
19. **H6** — `validateExport('bogus', {a:1})` → `{ valid:false }`, never throws
    (a non-`'legacy'|'serialized'` kind is invalid, not a serialized parse).
20. `validateExport` validates against a THROWAWAY graph — the LIVE graph's
    `census` is unchanged by the call.

## R5 — teardown (C3/C4)

21. `teardown()` → `Census` with `inTree === 1` (root only); the mount is
    **EMPTY** (`mount.innerHTML === ''` — the root element is NOT re-emitted
    after the teardown re-render; D11, corrected 2026-08-23). The child
    content is gone and the root is not re-serialized.
22. `teardown()` is idempotent — a second call returns `inTree === 1` and the
    mount stays root-only.
23. After teardown, a destroyed node's `cssId` does NOT resolve:
    `runtime.nodeState({ kind:'cssId', cssId:'counter' })` throws
    `/unresolved target/` (H2 — no resolvable ghost tree).
24. After teardown, `listTargets().nodes` contains NO authored child ids
    (`counter`/`inc`/`dec`/`echo-input`/`echo-out`) — only in-tree, not-destroyed
    nodes are addressable (H2).

## R6 — id-index resolution (A5)

25. `runtime.nodeState({ kind:'cssId', cssId:'counter' })` → `nodeId` equals the
    counter node's `nodeId` (resolved via the index, not an `allNodes()` scan).
26. A destroyed node's id does not resolve via the index (covered by R5 #24).
27. `listTargets().nodes` includes only in-tree, not-destroyed nodes with their
    authored `cssId`/`propsId`/`type`/`state`/`inTree`/`handlers` — the
    auto-minted ROOT node has NO authored `cssId` (only `nodeId` + the other
    fields); authored child nodes carry their `cssId`/`propsId`.

## R6 — placement-routed loads path-enumerate (H1)

28. `loadEnvelope(placementEnvelope(4))` (the path-fork shape with a
    content-role anchor) → `Census.inTree === 7` (2·4−1 nodes) and the rendered
    `data-node-id` element count is well above 3 (the path-enumeration pass
    produced many path-state elements — NOT the wrong ~3 the default bootstrap
    would emit).

## R7 — code-CRUD (mcp-endpoint.md §4)

29. `codeGet('template.root.children[1].children[2]')` → a defined `value`.
30. `codeGet('')` → `{ path:'', value: <the whole envelope> }`.
31. `codeSet('template.root.hooks', ['theme','user'])` → `{ ok:true,
    wrote:['theme','user'] }` and `codeGet('template.root.hooks').value` equals
    it.
32. `codeCreate('template.root.hooks', 'accent')` (when hooks = `['theme']`) →
    `{ ok:true, appendedAt:1 }` and the array is `['theme','accent']`.
33. `codeCreate('template.root', {...})` (a non-array path) → throws
    `/not an array/`.
34. `codeDelete('template.root.hooks', 1)` → `{ ok:true, removed:'accent' }`
    and the array is `['theme','user']`.
35. **H5/F8** — `codeDelete('template.root.hooks', 99)` → throws
    `/out of range/` (a silent `ok:true/removed:undefined` is the defect); a
    negative index (`-1`) likewise throws; the array is untouched by either.
36. `codeValidate()` on a valid envelope → `{ valid:true, warnings:[...] }`.
37. `codeValidate({ template:null, content:'garbage' })` → `{ valid:false }`,
    never throws.
38. `codeLoad()` after a `codeSet`/`codeCreate` → re-derives the live graph:
    `census.inTree > 1` and the rendered HTML contains `counter`.

## R8 — code-CRUD guards (A1 doc-load has no envelope)

39. After `load({kind:'doc', doc})`, `codeSet('template.root.hooks', [])` throws
    `/no envelope/` (an A1 doc load carries no legacy envelope).

## How the blind-test uses this

- The blind-test agent reads ONLY `docs/specs/runtime-host.md` (+ this file's
  claims) and runs each numbered scenario against the `Runtime` module,
  asserting PASS.
- A scenario that FAILS is a defect OR a doc/spec drift — record it
  (AGENTS.md item 10), never edit code.
- The green set is the regression net for H1..H6 (the Unit-A adversarial
  fixes): H1→28, H2→22–24, H3→11, H4→12–13, H5→35, H6→19.
