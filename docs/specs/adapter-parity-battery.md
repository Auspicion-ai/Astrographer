# Spec/Plan — Adapter Parity Battery: DomAdapter (in-browser) vs SSRFragmentAdapter (SSR shim)

Status: **SPEC** (delegation gate for the adapter-parity unit). This is a
probe battery (not a feature unit) whose purpose is to surface GENUINE gaps
between the two rendering adapters of `provident-ssr` and the two DOM
environments (real DOM vs the DOM shim) using the MCP endpoints as the drive
path, then to split every finding into the house verdicts:

- a **contract pin** (a documented, intended divergence — asserted as intended,
  never "fixed");
- a **host-side finding** (this repo's `src/`) — fixed here + regression-tested;
- an **engine defect** (`node_modules/provident-ssr/` or
  `../Preempt-Providence/`) — catalogued in `docs/defects.md` + written to
  `docs/HANDOFF.md`, NEVER patched (AGENTS.md item 7).

## 1. Goal

An end-to-end probe battery, driven ONLY through the MCP surface
(`provident.get_rendered_html` returns BOTH `renderedHtml` (the live DOM
mount `innerHTML`) AND `ssrHtml` (the SSR fragment) from the SAME
`renderProducingProcess` op stream — `src/renderer/runtime.ts` `renderedHtmlResult`/
`dispatch`/`load`/`op`/`code.*`), that compares the two adapter surfaces
across the seams where the adapters are implemented differently, and reports
each divergence into the three verdicts above.

The two adapters consume the IDENTICAL op stream (`renderProducingProcess`
emits once, `diffMinimal` diffs, `applyOps` drives both `DomAdapter` and
`SSRFragmentAdapter`). They materialize it differently — that materialization
surface is the probe target.

### 1.1 Hosts used (reuse, do not rebuild)

* **Primary**: `src/main/battery-host.ts` — a real `Runtime` under the DOM
  shim (`src/shared/dom-shim.ts`), all tool groups pre-enabled, spawned over
  stdio. The `Runtime` `render` drives BOTH adapters from one op stream
  (`runtime.ts:175-181`).
* **Real-DOM leg**: the existing `scripts/electron-divergence.mjs` Electron
  run — used to confirm the shim's serialization does not mask a parity gap
  on the seams that differ by environment (form-value slots, attribute
  escaping, live listener binding).
* **Tests**: the existing `tests/e2e-battery.test.mjs` runner pattern +
  `tests/runtime-battery.test.ts` (unit-level Runtime with both views).

## 2. The probe categories (the divergence surface)

Each category maps to a distinct code seam in `node_modules/provident-ssr/dist/core/adapters.js`
+ `render-helpers.js`:

| # | Category | DOM materialization | SSR materialization | Verdict class (expected) |
| --- | --- | --- | --- | --- |
| P1 | **Structural shape** (types/classes/nesting/text) | `mount.innerHTML` tree | `ssr.toString()` fragment tree | parity = **GREEN** (the PAR-5 pin) |
| P2 | **Handler rendering** | bound via `addEventListener` (`adapters.js:138-180`) — INVISIBLE to `innerHTML` | literal `on<event>` attribute (`adapters.js:361-366`) | **expected divergence** (contract pin) |
| P3 | **Styles / cssDef** | a `<style id="preempt-dynamic-styles">` into `document.head` — ABSENT from the mount `innerHTML` (`adapters.js:251-268`) | a `<style id="preempt-dynamic-styles">` PREFIX in `toString()` (`adapters.js:401-418`) | **expected divergence** (strip/normalize before compare) |
| P4 | **Form `value` slots** | `input.value` is a DOM PROPERTY (dropped from `innerHTML`) AND `INPUT` is a VOID tag (`adapters.js:318-319`) | void tag = no close; no value attr emitted | **expected divergence** (both agree to drop) |
| P5 | **Attribute escaping** | real DOM escapes (`escapeAttr`, `adapters.js:292-304`) | SSR escapes the same helper | **shim does NOT escape** (`dom-shim.ts:77-88`) — real-vs-shim divergence, not DOM-vs-SSR |
| P6 | **Removal / destroy persistence (SUSPECTED engine defect)** | `removeEl` purges the wire + `el.remove()` (`adapters.js:213-229`) | `removeEl` does `fragments.delete(wireKey)` ONLY (`adapters.js:397-400`) — the fragment is NEVER detached from its parent's `children` array NOR rematerialized, so a removed element may SURVIVE in `ssr.toString()` while the DOM drops it | **if confirmed → engine defect → HANDOFF** |
| P7 | **data-node-id presence parity** | `data:node-id` on every emitted element | same `data:node-id` (opt-in `renderOptions`) | exact = **host** (already 0.1.x-pinned) |
| P8 | **Stale-SSR across a graph reload** | DOM re-renders fresh from the new graph | `resetRenderState` recreates the SSRFragmentAdapter (`runtime.ts:701-707`) so the SSR re-emits — must NOT collapse to empty | exact = **host** (the R13 regression net) |
| P9 | **Fork-arm / path-state wire identity** | composite `wireKey(wire, forkKey)` keys | same composite keys | exact = **host** |

## 3. Battery scenario catalogue

Each scenario runs the same 6-step loop as `docs/specs/e2e-test-battery.md §5`
(load → drive → assert parity across BOTH views → export → validate →
teardown → root-only proof), with the parity assertions driven through
`provident.get_rendered_html` + `list_targets`/`node_state`. Assertions key on
authored ids (R7) + non-empty dispatch.

| # | Envelope / drive | Probe | Parity assert (DOM `renderedHtml` vs SSR `ssrHtml`) |
| --- | --- | --- | --- |
| S1 | the demo envelope (`demoEnvelope`) — load A2 | static render | P1 exact (sampled node type/class/content), P7 data-node-id set equal, P4 no `value` on the input in either |
| S2 | the demo envelope → dispatch `inc` ×2 | post-dispatch re-render | P1 counter `>2<` in BOTH views; P7 set equal |
| S3 | the demo envelope → dispatch `echo` (input arg) | handler-arg → content | P1 echo text equal in BOTH; P2 handler attr present in SSR ONLY (pin) |
| S4 | a `cssDef`-bearing envelope | styles | P3: DOM `#preempt-dynamic-styles` absent from `innerHTML`; SSR has the style prefix (pin); strip each + compare the rest |
| S5 | an envelope with an `on:<event>` handler + a `destroy`-driving handler (a S9-style toast) | remove/re-destroy path | P6 — the core suspected probe: destroy the node, re-render, assert the element is GONE from the DOM `innerHTML` AND (verify) absent from `ssrHtml` |
| S6 | `code.load` the same envelope twice (R13 regression) | reload | P8 SSR NOT collapsed to empty after the 2nd load |
| S7 | a path/fork envelope (the `cycle` d12 variant, small depth) | fork-arm identity | P1 exact on sampled fork arms; P9 wires stable |

### 3.1 The drive/assert loop (precise)

For each scenario:
1. `provident.load { kind:'envelope', envelope }` → census + both views.
2. Drive (`provident.dispatch`/`op`) as the scenario table above.
3. `provident.get_rendered_html {}` → `{renderedHtml, ssrHtml, census}`.
4. Assert parity per the table — normalize styles (S4) and strip the shim's
   escape difference (P5) where the comparison is DOM-vs-SSR, and treat the
   real-vs-shim difference as the R13 leg.
5. `provident.export { format:'legacy' }` + `provident.validate` round-trip.
6. `provident.teardown` → `census.inTree === 1`, `get_rendered_html` root-only.

## 4. Finding triage (the three verdicts)

When a probe fails, the finding is triaged by WHERE the divergence lives:

| Verdict | Condition | Action |
| --- | --- | --- |
| **Contract pin** | The divergence is in the category's intended semantics (P2 handler, P4 form value, the SSR `<style>` prefix) | Document as an expected divergence; assert the intent (e.g. SSR carries the attr, DOM carries the listener); no code change |
| **Host-side defect** | The divergence lives in this repo's `src/` (e.g. `runtime.ts` render loop, `dom-shim.ts` serialization, the MCP wrapper) | Fix here + regression-test (TDD red → green) |
| **Engine defect** | The divergence lives in `node_modules/provident-ssr/` or `../Preempt-Providence/` (e.g. the suspected P5/P6 removal retention) | Record in `docs/defects.md` (symptom/repro/root-cause/proposed fix) + `docs/HANDOFF.md`; NEVER patch the package |

## 5. Deliverables / process

1. **This spec** — `docs/specs/adapter-parity-battery.md`.
2. **The green-scenario blind set** — `docs/specs/adapter-parity-greens.md`
   (run by an agent who has NOT read the implementation, per AGENTS.md item
   10/10b).
3. **The battery** — a new `tests/adapter-parity-battery.test.mjs` (spawns the
   battery host over stdio + SDK client, one long-lived process, teardown-only
   reset per C4) + any unit-level tests in `tests/runtime-battery.test.ts` +
   the fixtures.
4. **Trackers** updated in the same pass (defects.md / HANDOFF.md if an engine
   defect surfaces; decisions.md / next-steps.md).

## 5. Process gates (RCA-1..6)

This is ONE unit: a delegation spec → TestWriter red (the tests written FIRST
against the MCP contract + this spec, run → red) → Implementer green (least
code, host-side fixes only if a host finding surfaced) → adversarial (read-only;
engine findings → defects.md/HANDOFF, host findings fixed here) → blind greens →
documentation review (record `archive/reviews/<date>-adapter-parity-doc-review.md` — the archive is gitignored; the record is provenance only, findings land in the active trackers).
Run `npm test` + `npm run typecheck` + `npm run build` + the battery before the
unit is reported done.

## 6. Risks

- The full 4095-element d12 fragment is ~180MB over stdio — the parity
  assertions use the `hash64`/`treeSig` digest + sampled elements (the house
  pattern), never the raw string.
- The DOM shim does not escape attributes (P5) — a DOM-vs-SSR compare must
  strip that difference or run the parity on the real-DOM leg
  (`scripts/electron-divergence.mjs`).
- Minted ids differ across hosts (the shim boots root-only; real app boots the
  demo) — the parity asserts normalize `node-N` → `node#` (the R13 precedent).
