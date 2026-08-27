# Spec/Plan — End-to-End MCP Test Battery

Status: **APPROVED-WITH-RESHAPE** (the three-agent gate review at
`docs/FORKER.md` §4 (R1-R16 digest) — verdict: the shape is sound;
reshapes R1..R16 below are REQUIRED before TestWriter red). **Target package
(R1, updated 2026-08-22):** the battery targets the **published
`provident-ssr@0.1.3`** — the Round-4 landings (REQ-GAP-9..12: `createLinkHub`
+ the seed-hub threading, the self-evicting sweep, the destroy-cascade flag,
the addLayer seam letter) are now **PUBLISHED**, so the battery uses ONLY
published surfaces (no vendored hub, no workarounds). Where behavior still
differs across versions, the battery's assertions are version-stable or the
version split is pinned below.

## 1. Goal

An end-to-end test battery that builds, drives, exports, validates, and tears
down the upstream Preempt-Providence demo scenarios against the
Provident-Electron MCP surface — using **all three build mechanisms** (single
template/content load; single legacy template/content load; series of
single-action commands), with the battery running all scenarios **in sequence
in one process, no external reset**, restoring a clean slate between scenarios
**only via interface-driven teardown** (interface-driven teardown is the ONLY
reset; a Supervisor rebuild would be an external reset — not allowed).

## 2. Constraints (pinned)

- **C1 — Drive path is MCP-only.** The battery talks to the app ONLY through
  the MCP tools (`provident.*`). `expect()`/assertions MAY additionally
  inspect returned values or (where a test needs it) internal code — the
  constraint is on the DRIVE path, not the assertions.
- **C2 — Internal code uses only existing provident interfaces.** The renderer
  host builds/drives/exports/tears down using the published `provident-ssr`
  surface: `translateLegacy`, `loadState`, `Supervisor`, `EventBridge`,
  `DomAdapter`/`SSRFragmentAdapter`, `renderProducingProcess`,
  `Supervisor.dispatchAndReport` + `flush()` + `hasPendingWork()`,
  `reverseTranslate`, `serializeSlice`, `dropPayload`, `Node`,
  `reconcileParentTargets`, `createLinkHub`, the managed channel
  (`ClientAPI.apply` ops). NO package edits — all surfaces are published
  (`provident-ssr@0.1.3`).
- **C3 — Starting page = root-only** (wording per R16): the battery boots
  with a root-only envelope — a bare `template.root` + empty `content` +
  `clientConfig`, zero content nodes. The mount shows one empty root element.
  Each scenario brings content in via MCP and must restore root-only before
  the next.
- **C4 — No external reset.** The battery is one long-lived process; the only
  reset between scenarios is `provident.teardown` (interface-driven).

## 3. MCP contract extension (the gate subject)

The current surface (`provident.dispatch`, `get_rendered_html`,
`list_targets`, `get_node_state`) can READ and DISPATCH but cannot LOAD
content, APPLY ops, EXPORT, TEAR DOWN, or AUTHOR the envelope. The battery
needs the five graph tools + the six code-CRUD tools below (all host-side; no
package change). The code-CRUD surface (`provident.code.*`, spec
`docs/specs/mcp-endpoint.md §4`) is the code-manipulation layer — edit the
envelope (hooks/handler bodies/component bindings) then re-load:

| Tool | Payload | Returns | Internal (existing interfaces) |
| --- | --- | --- | --- |
| `provident.load` | `{ kind: 'envelope', envelope: LegacyInitialData }` (A2) OR `{ kind: 'doc', doc: SerializedRenderDoc }` (A1) OR `{ kind: 'commands', commands: OpCommand[] }` (A3) | `{ census, renderedHtml, ssrHtml, warnings }` | A2: `translateLegacy` (+ userData set) → register → `recordResolved` → render. A1 (**the 4-step recipe, R2**): `loadState(doc)` → `new Node(d, hub)` per seed (template root first, content after) with ONE hub instance shared with the supervisor → `reconcileParentTargets(nodes)` → `registerNode` per node → compile → `recordResolved` → render. A3: `Supervisor.apply(op)` per command → `flush()` → **pass-2 drain rule (R9)** → render. |
| `provident.op` | `{ command: OpCommand }` (the op rides under a `command` key) | apply result `{ status, dirtied?, minted?, renderedHtml, ssrHtml, warnings }` | `Supervisor.apply` + `flush()` + drain rule (R9) + render |
| `provident.export` | `{ format: 'legacy' \| 'serialized' }` | the export + a census snapshot | `reverseTranslate(root)` / `serializeSlice(root, kids, clientConfig)` |
| `provident.validate` | `{ export: <the export>, kind }` | `{ valid, censusMatch, treeSigMatch, warnings }` | re-load the export into a THROWAWAY graph (a fresh supervisor; id-namespaced reseed, R7) → compare census + `treeSig(treeFromOps(...))` vs the pre-export render; ONLY structural parity for def/seam-bearing exports (R3 — serialize→loadState is snapshot-only) |
| `provident.teardown` | `{}` | `{ census, renderedHtml, warnings }` (root-only proof) | destroy/detach every in-tree child of root via `Supervisor.apply('destroy')` per node (runtime-minted retention), `dropPayload` on content payloads + clear userData (R8), `removeLayer` cleanups, then **the settle-gate (R6): `while (hasPendingWork()) await flush()`**, re-render; assert mount = root-only |
| `provident.code.get` | `{ path }` | the envelope subtree/entry at `path` | read the envelope (the code/data source of truth) — no graph touch (mcp-endpoint.md §4) |
| `provident.code.set` | `{ path, value }` | `{ ok, path, wrote }` | set an envelope value (handler body, `hooks` member, `component` binding, `props`/`css`/`content`) |
| `provident.code.create` | `{ path, entry, ... }` | `{ ok, appendedAt }` | append to an envelope ARRAY (e.g. push a handler to `root.handlers`, a `hooks` name) |
| `provident.code.delete` | `{ path, index? }` | `{ ok, removed }` | delete an envelope entry |
| `provident.code.validate` | `{ envelope? }` | `{ valid, warnings, shape }` | schema-validate an envelope WITHOUT building the graph (translate/`loadState`-boundary checks) |
| `provident.code.load` | `{ envelope? }` | `{ census, renderedHtml, ssrHtml, warnings }` | apply an edited envelope to the LIVE graph (A2 `load` — teardown + translate/register/compile/render) |

**userData lifecycle (R8):** the landings/handlers conditional seam reads
translate-scoped `supervisor.userData`; the host SETS it on `load` (A2) and
CLEARS it on `teardown` — not doing so leaks the previous scenario's userData
into the next (the anon-after-alice trap).

**Pass-2 drain rule (R9):** exactly one drain per operation. `provident.op` +
`Supervisor.apply`-driven ops produce pass-2 states the caller takes
(`takePass2States` is the renderer's own drain — consumed once per op, before
render; never from a handler getter). `provident.load`'s A2/A1/bootstrap
path compiles the root directly → `recordResolved` (the bootstrap pattern,
no supervisor-drain at bootstrap). `provident.teardown`'s destroy path
drains per op; the settle-gate (R6) runs before the final render. Every tool
returns `warnings` (R10) so a CSP-eval-block or a handler-body-invalid is
MCP-visible (never a silently dead page).

`OpCommand` (A3 vocabulary, each ONE managed-channel op):
`clone-instance` / `attach` / `detach` / `move` / `state-slice` / `layer-apply`
/ `rows-mint` / `rows-clear` / `placement-attach` / `destroy` (the
`Supervisor.apply` op kinds — all ten are real, verified against
supervisor.ts). The "series of single-action commands" is a command ARRAY
delivered in one `provident.load` call (each op applied singly through the
managed channel) or repeated `provident.op` calls. **No `requestId`s inside
command arrays (R7)** — the dedup LRU is cap-128 and would overflow instantly.

**Renderer Runtime additions** (battery mode, existing interfaces only):
`loadEnvelope`, `loadDoc`, `applyCommand`, `exportLegacy`, `exportSerialized`,
`validateExport`, `teardown`; the Runtime boots with a root-only envelope (C3
rewording, R16 — the demo envelope becomes a load payload, never auto-loaded).

## 4. The three build mechanisms (precise)

| # | Mechanism | MCP form | Internal path |
| --- | --- | --- | --- |
| **A1** single template/content load | `provident.load { kind: 'doc', doc }` — a `SerializedRenderDoc` (the framework's round-trip form) | the 4-step recipe (R2); **snapshot-parity only (R3)** — component/seam/rows machinery does NOT survive loadState (translate-bound) |
| **A2** single legacy template/content load | `provident.load { kind: 'envelope', envelope }` — a `LegacyInitialData` (`{template, content, clientConfig}`) | `translateLegacy(envelope)` → register → compile → `recordResolved` → render; component-bearing docs that need full behavior use this path (R3) |
| **A3** series of single-action commands | `provident.load { kind: 'commands', commands }` / `provident.op` | `Supervisor.apply(op)` per command → `flush()` → drain rule (R9) → render |

A1 is exercised as a first-class load on the SMALL scenarios (the landings as
a serialized doc) AND via the export→validate round-trip for structural
scenarios (R3 caps it at snapshot-parity there). A3 is exercised by the hook
writes (per-write `clientAPI.apply` commands) and the teardowns (per-node
destroy ops) — and by NOTHING in §5.1 (the fork-stress battery is exclusively
the static path-enumeration family, user direction 2026-08-22; the runtime
clone form is out of scope). A2 drives the envelope-native scenarios including
all four fork-stress variants.

## 5. Scenario catalogue (build → drive → assert → export → validate → teardown)

Per scenario the battery runs the same 6-step loop:
**load** (approach) → **drive** (`provident.dispatch` / `provident.op`) →
**assert** (`provident.get_rendered_html` + `list_targets`/`node_state`
returned JSON, `expect` against them — authored ids only (R7), an empty
`results`/`dirtied` = FAILURE, never a green pass (R7)) → **export**
(`provident.export legacy`) → **validate** (`provident.validate` round-trip —
R3 tiers) → **teardown** (`provident.teardown` — R6 settle-gate) → assert
root-only.

### 5.1 fork-stress-d12 — the STATIC family (placement / values / link / cycle)

Source: `demo/path-fork-data.js` (`pathForkLegacyData(method, depth)` +
`buildPathForkSurface(method, depth)`), `demo/fork-stress-fixture.js`. The
**runtime clone form** (`forkStressLegacyData`/`fork-stress.js`) is out of scope
(user direction 2026-08-22: the battery replicates only the 22-prototype
path-enumeration family — the graph holds `root + 2·(depth−1)` = 23 nodes at
d12; the **4095 elements are path-states**, one per (prototype, owner-path)
pair back to root — never 4095 minted clones).

**Census (ALL variants, the static shape):** `inTree = 23`, `cloneOps = 0`,
`elements = pathStates = 2^d − 1 = 4095` (one `compilePath()` pass per node;
placement-path-spec §5.2, path-fork-data.js:80-82). Assert `registered ≥ 23`,
never equality (REQ-GAP-11 discipline). The `inTree === 4117` runtime census is
wrong for these variants (that count belongs to the clone form, not in the
battery).

**Render note (R-new — host capability):** the trio's bootstrap is
`compilePath()` per node (path enumeration), NOT the Runtime's default
`rootNode.compile(nodes)`. The A2/A1 load on placement-routed scenarios must
switch to compilePath-per-node (mirror `buildPathForkSurface`) — `compilePath`
is a public Node method; this is a host extension, not a package gap. The full
4095-element fragment at d12 is ~180MB over stdio — the battery asserts
census + the `hash64` PAR-5 digest (upstream pattern), never reads the whole
fragment.

#### 5.1.x The cycle variant — NEW SPEC (deliverable, not upstream yet)

The upstream static trio has no cycle variant (the runtime form's `handler`
mechanism is clone-recursion, which the static model has no equivalent of).
The battery needs one cycle variant per R3 + R4's coverage. The NEW spec
(`pathForkCycleLegacyData(depth)`, deliverable in this step — upstream or
this-repo-authored):

- **Topology = the path-fork base** (23 nodes, `pathForkLegacyData`-shaped:
  level-1 prototypes are `template.root.children`; layers ≥ 2 are content
  payload roots; every level has `placement: {placementName:<zone-k>, targetPlacement?<zone-(k−1)>}` — the TWO-sided placement contract).
- **The mechanism cycles per layer across the three STATIC-capable methods:**
  `cycle = ['placement', 'values', 'link']`; layer k's prototypes get method
  `cycle[(k−1) % 3]`. `handler` is EXCLUDED (no runtime expansion in the
  static family — a static handler layer expansion is a category error).
  - placement layer: NO component field (the base topology provides the
    enumeration itself).
  - values layer: `proto.component = { reference: 'values-<k>.<slot>', value:
    'value-<SLOT>-<k>' }` (the fork-stress values shape).
  - link layer: `proto.component = { reference: 'link-<k>', value:
    linkDefForLevel(k) }` (the fork-stress link shape).
- Census: identical to the trio (23 nodes, 4095 elements/pass-states).
- Expected render: each path-state element whose layer carries a value shows
  its own `value-<SLOT>-<k>` text; each link-layer element shows the re-typed
  chain content; placement layers show the placement badge only.
- Assert the mixed-mechanism render: sampled layer-1 (placement) element,
  sampled layer-2 (values) element with its own value text, sampled layer-3
  (link) element with the def chain content.
- **Why the cycle variant is data-only (no handlers, no clones) — the pin.**
  The runtime fork-stress family achieves expansion with exactly the shape
  "after-compile handler checks `node.children.length > 0` (family children
  only) and `clone-instance`-mints if not" (fork-stress-data.js
  `stress-expand`). That shape is a PROVEN runtime pattern when guarded (the
  `children.length` idempotency guard + the depth terminator checked BEFORE
  any op): `clone-instance` dirties only the copy, so each clone's inherited
  after-compile fires exactly once and the tree converges layer-by-layer over
  microtask flushes. In the path-fork battery the same shape would (a) mint
  real graph nodes into a static tree (census 4117 not 23 — breaks the
  assertion contract); (b) reintroduce the depth-serial task-based `flush()`
  cascade + the 4094-op journal this family exists to avoid; and (c) any
  mutation touching a `content`-role anchor would force placement
  re-enumeration per flush. **The cycle variant therefore carries its
  mechanism as per-layer DATA (component fields), never as handlers.** A
  runtime fork-stress variant, if ever wanted, is a separate family with the
  two guards + the `hasPendingWork()` settle-gate (R6), per
  fork-stress-data.js:217-259.

| Sub-scenario | Build mechanism | Graph shape | Notes |
| --- | --- | --- | --- |
| placement-only d12 | A2 (`pathForkLegacyData('placement',12)`) | 23 nodes / 4095 elements (static path enumeration) | ONE `compilePath` pass |
| values-only d12 | A2 (`pathForkLegacyData('values',12)`) | same | assert a sampled path-state renders its own scalar |
| link-only d12 | A2 (`pathForkLegacyData('link',12)`) | same | assert the recursive def chain emits |
| cycle variant d12 | A2 (`pathForkCycleLegacyData(12)` — the NEW spec, §5.1.x) | same | assert the mixed-method sampler row |

Export/validate/teardown identical per variant.

### 5.2 landings — placeholder + logged-in as ONE page (user-data-conditional)

Source: the sanitized `demo/handlers-scenarios.js` `userAuthEnvelope(userData,
prefix)` pattern ONLY (the live-prod `placeholderLanding`/​`Logged-inLanding`
envelopes are upstream-gitignored private payloads — provenance footnote
only; they must NEVER be embedded in this repo; R14 adds `live-prod/` to this
repo's `.gitignore`). The presence/absence of `userData` switches the content
seam, payload, and logout control (handlers-scenarios.js S1a/S1b precedent).

Build: **A2** — load ONE landing template twice with different user data:
(a) anon (userData null) → placeholder view (sign-in, no logout); (b) userData
present → logged-in view (session readout + logout). Drive a login/logout
toggle dispatch to switch views in place. Assert: the two loads produce
DIFFERENT rendered HTML (logout button present only when userData present);
the switch flips the view; the userData plumbing (R8) is asserted by
re-loading anon AFTER the logged-in load with no contamination.
Export/validate: legacy path (seam-bearing, R3). Teardown.

### 5.3 hooks-scenarios

> **Implementation status (2026-08-23): LANDED.** The e2e battery
> (`tests/e2e-battery.test.mjs`) now implements the full hooks-scenarios block
> (theme/user/counter hook providers + the four containment verdicts, R15
> `hook-kind-mismatch` included), driven over `provident.dispatch` per the unit
> spec `docs/specs/battery-hooks-unit.md`. The §5.3 section adds **23 checks**
> to the battery (93 → 116, all green). A host defect surfaced + fixed: the
> `get_node_state` resolved states carry circular `anchors` that broke JSON
> serialization — `nodeState` now projects a JSON-safe snapshot
> (`src/renderer/runtime.ts`).

Source: `demo/hooks-scenarios.js` (`hooksScenariosEnvelope` — one envelope:
root carries the `theme`/`user`/`counter` value providers + the authored
`hooks` field; cards are consumers + controls).

Build: **A2** (envelope). Drive: `provident.dispatch` the control buttons →
hook writes through the managed channel (`clientAPI.apply(… 'hooks.<name>' …)`)
— each write is a single-action command (A3 flavor). Assert: the readouts
update in rendered HTML (themeName bake, session readout, counter badge);
`node_state` on the consumers shows the resolved `bindings.*`. Also assert
the containments (`hook-name-unresolved` / `hook-seam-exempt` /
`hook-mode-blocked` / **`hook-kind-mismatch`** — R15) returned in dispatch
results. Export/validate/teardown.

### 5.4 code-CRUD — manipulate the envelope, re-load (the hooks example)

Source: the same `hooksScenariosEnvelope` shape + the code-authoring surface
(`docs/specs/mcp-endpoint.md §4`). This scenario drives the battery host
through the `provident.code.*` CRUD tools on the ENVELOPE (outside the live
graph), then materializes each edit via `code.load` — the "manipulating the
code" capability (e.g. adding functions that manipulate hooks):

1. `code.get { path: 'template.root.hooks' }` → the authored hook names.
2. `code.create { path: 'template.root.hooks', entry: 'accent' }` — add a hook
   name; `code.set` a matching `component` provider binding (or
   `code.create` a `handlers[].body` function-STRING that writes
   `hooks.accent` through the managed channel).
3. `code.validate` — re-translate the edited envelope WITHOUT building the
   graph; assert `valid`, no `handler-body-eval-blocked`/`handler-body-invalid`
   (function-string bodies materialize — CSP `'unsafe-eval'` present).
4. `code.load` — apply the edited envelope; assert the new hook provider +
   handler are live in the graph (`list_targets`/`get_node_state`).
5. `provident.dispatch` the new control → `hooks.accent` write cascades → the
   consumer readout updates in `get_rendered_html`.
6. `code.delete` the added member → `code.load` → assert it is gone (root-only
   teardown + re-derive).

CRUD is staged-on-envelope: edits accumulate until a `code.load` re-derives the
graph (P-C2), so the battery treats each code edit + load as one unit. This
exercises the full CRUD (create/read/update/delete) + the load-apply round-trip.

### 5.5 handler-scenarios

> **Implementation status (2026-08-23): LANDED.** The e2e battery
> (`tests/e2e-battery.test.mjs`) now implements the full anon/alice/main handler
> matrix (S1a, S1b, S2..S10), data-only ported from the upstream
> `demo/handlers-scenarios.js` fixture (`tests/fixtures/handlers-scenarios-data.mjs`),
> driven over `provident.dispatch` per the unit spec
> `docs/specs/battery-handlers-unit.md`. The §5.5 section adds **68 checks** to
> the battery (116 → 184, all green). Three host defects surfaced + fixed: the
> destroyed-node stale-state re-emit (F1), the contained-Error JSON projection
> (F2), and the destroyed-node export leak (F3) — all in `src/renderer/runtime.ts`.

Source: `demo/handlers-scenarios.js` (`handlersScenariosEnvelopes()` = anon /
alice / main — one envelope per mount) + `demo/handlers-scenarios.template.html`.

Build: **A2** — load each envelope in turn (teardown between mounts; S1a anon,
S1b alice, S2..S10 main). Drive: `provident.dispatch` each scenario's handler
event (`click`, `input`, …) with the expected args; read `results` from the
dispatch report. Assert: rendered HTML reflects each handler's effect; the
`userData`-conditional logout only on alice; containment scenarios return the
contained error in `results`. Export/validate/teardown. (userData lifecycle
per R8 is exercise-covered by anon-then-alice-then-anon.)

## 6. The battery runner

- **Host**: `src/main/battery-host.ts` (Node, no Electron display) — a
  `ProvidentMcpServer` whose backend owns a real `Runtime` (from
  `src/renderer/runtime.ts`) running under the DOM shim
  (`tests/helpers/dom-shim.ts`). This is the un-parked **HEADLESS / Node-only
  MCP server mode** (docs/pending.md, 2026-08-22 design review): the runtime
  is identical to the Electron renderer, so the Electron app is the same
  contract against a real DOM. The battery uses the deterministic Node host
  for CI **AND requires ONE Electron-run as the divergence check (R13)**
  before the shim version is trusted (the shim is proven for the 12-element
  counter, not 4095-node trees or def-fill emission quirks). The 0.1.3 publish
  (`createLinkHub`, the self-evicting sweep, the destroy-cascade) means the
  host uses ONLY published surfaces — no vendored hub; an SSR-only
  (`SSRFragmentAdapter`-only, no-DOM) variant rides the same host if wanted.
- **Battery**: `tests/e2e-battery.test.mjs` — spawns the battery host (stdio),
  connects the SDK client ONCE, then runs the scenarios §5.1–§5.5 in order.
  Between scenarios only `provident.teardown` resets (C4); after each teardown
  it asserts `get_rendered_html` = root-only (C3 — `census.inTree === 1` + no
  child content in the mount). The R6 settle-gate (`hasPendingWork() === false`)
  is asserted at the Runtime unit level (`tests/runtime-battery.test.ts`:
  `teardownResult` is async + awaits the settle-gate; the MCP `provident.teardown`
  returns the post-quiescence census). All drive via MCP tools (C1); assertions
  may also check returned values directly.
- **Assertion hygiene (R7):** key on authored ids (css.id/props.id — never
  engine-minted `node-N`); an empty `results`/`dirtied` is a failure; fresh
  requestIds per scenario; no requestIds inside command arrays.
- **Coverage of the three mechanisms (requirement)**: A2 drives §5.1 (all four
  d12 variants — placement / values / link / cycle — the static path-
  enumeration family) + §5.2 + §5.3 + §5.4 + §5.5; A3 drives the hook writes +
  the teardown destroy ops (nothing in §5.1 — the runtime clone family is out
  of scope); A1 drives the export→validate round-trips + one first-class load
  (the landings as a serialized doc — small; R3 caveat respected). The
  code-CRUD surface (`provident.code.*`, §5.4) is driven by every scenario's
  load/export/teardown AND exercised directly by the §5.4 envelope-edit →
  `code.load` round-trip.

## 7. Sequencing / gates

This step's deliverable = **specifications + design plan ONLY** (user
direction 2026-08-22): the revised battery contract (this file) + the new
`pathForkCycleLegacyData` envelope spec (§5.1.x). The TDD implementation is
delegated to LATER agents.

1. **§0 — Rebase pass (THIS review):** R1..R16 applied to this spec +
  trackers reconciled (defects.md/HANDOFF.md Round-4 rows → shipped
  dispositions; decisions.md gains the target-version pin + the battery
  reshape row) — **the gate artifact is `docs/FORKER.md` §4 (R1-R16 digest)
  and this SPEC is now the revised contract.** User go-ahead.
2. **Cycle-variant spec (this step):** `docs/specs/e2e-test-battery.md §5.1.x`
  defines `pathForkCycleLegacyData(depth)` — the NEW static cycle variant
  (data-only; zero handlers/clones) — the deliverable for a mechanism that
  has no upstream static equivalent.
3. **Later agents (delegated):** TestWriter red (battery tests written against
   the MCP contract above + the cycle envelope spec, run against a stub host
   → red) → Implementer green (Runtime additions + battery host + the five
   tools + the cycle envelope builder, least code) → trio (test + typecheck +
   build) + the battery green + **the one Electron-run divergence check (R13)**.
4. Trackers updated in the same pass (decisions.md MCP-BATTERY row,
   pending.md/next-steps.md, defects.md if a gap surfaces during TDD).

## 8. Risks / gaps (REVISED — the Round-4 landings)

The four requirement gaps this plan exposed (REQ-GAP-9..12) were
**answered by the upstream the same day (handoffs-review-2.md, user rulings)
and PUBLISHED in `provident-ssr@0.1.3` on 2026-08-22** (verified in the
installed dist: `createLinkHub`, `evictDestroyedNode`/`destroyedRefs`,
`markCascadeExplicit`). The battery uses ONLY the published surfaces.

- **REQ-GAP-9 → 0.1.3:** `createLinkHub()` + the `node.ts:463` seed-hub
  threading + the corrected 4-step recipe (loadState → Node(d,hub)
  template-first → `reconcileParentTargets` → registerNode per node), the
  caveat (component-bearing docs → `translateLegacy(doc, {hub})`; loadState =
  snapshot/restore-only; rows-mint on reseed throws
  `rows-prototype-unresolved`). **The battery A1 uses the exported
  `createLinkHub()` — no vendored hub.**
- **REQ-GAP-10 → doc-only seam letter** (the addLayer seam is sanctioned for
  PRE-MOUNT prototype setup — the fork-stress pattern; in-tree live injection
  uses the journaled `state-slice handlers` / `layer-apply`; `registerHandlerBody`
  is REJECTED). The battery's pre-mount body injection is exactly the
  sanctioned seam (R12).
- **REQ-GAP-11 → self-evicting sweep** (finalized nodes leave the
  registry/supervisor maps; `destroyedRefs` tombstone keeps `getNode`).
  `reset()`/`prune()`/`unregisterNode` REJECTED (wrong predicate; process-wide
  hazards). Battery rule (R7's "assert inTree/mount state") IS the pinned
  assertion style, not a compromise. **Note for assertions:** on 0.1.3 the
  self-evicting sweep means destroyed nodes evaporate from the registry (the
  `destroyedRefs` tombstone keeps `getNode`); the battery still asserts
  `inTree`/mount only — the version-stable discipline.
- **REQ-GAP-12 → destroy-cascade trigger flag** (an explicit-destroy recurses
  EXPLICIT family children, SKIPPING placements + `'component'`-token
  prototypes + routing `runtimeMinted` children to retention). The
  `clear-children` op is REJECTED. Fork-stress teardown STAYS per-child
  (clones are runtimeMinted; prototypes are skipped) — the cascade handles the
  plain family trees.

Scale/tractability (beyond the gaps):

- **Wall-time at depth (R5, revised for the static-family correction):** all
  four fork-stress variants are STATIC — ONE `compilePath()` enumeration pass
  each (~2.8s at d12 upstream) — so the d12 target is natural per variant; no
  depth-serial flush cascade applies (that lived only in the excluded runtime
  clone family). The residual heavy region is the emit + the huge fragment
  (the digest/sample assertion carries it). No per-variant wall-time budget is
  needed for the enumeration itself; the per-scenario budget is a watchdog.
- **Cross-scenario minted-id hazard (R7):** minted ids are process-global
  sequences; a destroyed/minted node from scenario k may shadow a lookup in
  scenario k+1; the battery's assertions key on authored ids and demand
  non-empty dispatch results to prevent silent `[]` passes.
- **A1 at d12**: multi-MB serialized docs are de-scoped from first-class use
  (A1 first-class = the small landings; d12 A1 is validate-round-trip only).
- **Trio element-assertion shape**: the full d12-rendered fragment is ~180MB
  — the battery asserts the census + the upstream `hash64` digest of the
  PAR-5 shape (path-fork-data.js pattern), never the raw HTML string.
- **Teardown completeness (R6):** the settle-gate (`hasPendingWork() ===
  false`) is provable quiescence, never an assumption; the battery asserts
  `inTree === 1` + empty mount + the gate, catching any retained-but-pending
  graph.
- **`validate` is a THROWAWAY graph + id-namespaced reseed** (never mutate
  the live one; both the supervisor instance AND the module-level registry
  are process-wide — the id-disjointness assertion R7 applies).