# Spec — Runtime Host Capabilities (Unit A)

Status: **SPEC** (delegation gate for the battery's Unit A). Source:
`docs/specs/e2e-test-battery.md` §3/§4/§6 + `docs/specs/architecture-review.md`
A2/A5. Extends the existing `Runtime` (`src/renderer/runtime.ts`) with the
load/export/teardown operations the MCP tools + battery host consume. All
operations use ONLY existing `provident-ssr@0.1.3` surfaces.

## 1. Scope

The `Runtime` today: translate → register → compile → render (DOM + SSR), plus
`dispatch`/`renderedHtmlResult`/`listTargets`/`nodeState`. This unit adds the
**battery-mode host capabilities** — the operations the 5 graph MCP tools +
the battery host call. They are pure host code (no package change).

## 2. The surface (exact additions to `Runtime`)

```ts
loadEnvelope(envelope: LegacyInitialData, opts?: { userData?: unknown }): Census
loadDoc(doc: SerializedRenderDoc): Census
load(req: LoadPayload): { census: Census; renderedHtml: string; ssrHtml: string; warnings: unknown[] }
op(cmd: OpCommand | null | undefined): { status: string; dirtied?: string[]; minted?: string[]; renderedHtml: string; ssrHtml: string; warnings: unknown[] }
applyCommand(cmd: OpCommand | null | undefined): { status: string; dirtied?: string[]; minted?: string[] }
exportLegacy(): LegacyInitialData
exportSerialized(): SerializedRenderDoc
validateExport(kind: 'legacy' | 'serialized', export: unknown): { valid: boolean; censusMatch: boolean; warnings: unknown[] }
validate(kind: 'legacy' | 'serialized', export: unknown): { valid: boolean; censusMatch: boolean; treeSigMatch: boolean; warnings: unknown[] }
teardown(): Census
teardownResult(): Promise<{ census: Census; renderedHtml: string; warnings: unknown[] }>
```

**Return-shape map (D5/D6, 2026-08-23):** three surface shapes must not be
conflated —
- `loadEnvelope`/`loadDoc`/`teardown` return a bare `Census`.
- `load`/`teardownResult` return a WRAPPER object (`{census, …}`) — read
  `.census.inTree`, never `.inTree` on the wrapper.
- `validateExport` returns `{valid, censusMatch, warnings}` and does **NOT**
  carry `treeSigMatch`; only the MCP-facing `validate()` wrapper adds
  `treeSigMatch` (R3, a parity signal — a boolean, never a contract).
- `op` returns the apply status **plus** the two render views + `warnings`
  (R10) — even on a `rejected`/`no-usable-state` verdict (assert `.status`,
  not deep-equality on `{status:'rejected'}`).
- The MCP-facing wrappers (Unit C, `docs/specs/e2e-test-battery.md` §3 + `mcp-endpoint.md` §4) ride on top of these: `load(req)` → A2/A1/A3, `op(cmd)` → `applyCommand`, `export(format)` → `exportLegacy`/`exportSerialized`, `validate(kind, exp)` → `validateExport` + a `treeSigMatch` parity compare (the MCP `validate` return adds `treeSigMatch`), `teardownResult()` → `teardown` + the awaited R6 settle-gate (async), and the six `codeGet`/`codeSet`/`codeCreate`/`codeDelete`/`codeValidate`/`codeLoad` envelope-CRUD methods.

**CRUD envelope source (D9, 2026-08-23):** the `code*` surface reads/writes the
Runtime's `envelope` field, which is populated ONLY by a load path
(`loadEnvelope`/`load`/`codeLoad`) — the constructor's `{envelope:}` option
builds the graph but does NOT set the CRUD envelope. `codeSet`/`codeDelete` on
a fresh constructor-booted Runtime throw `no envelope loaded` until a load. The
code-CRUD greens assume a prior load; callers must load first.

`OpCommand` = a managed-channel op payload (`{ kind: 'clone-instance' | 'attach'
| 'detach' | 'move' | 'state-slice' | 'layer-apply' | 'rows-mint' | 'rows-clear'
| 'placement-attach' | 'destroy', ... }`). The op-kind vocabulary is ENGINE-owned
(`supervisor.apply` rejects an unknown kind with `{status:'rejected'}`); the host
forwards and never whitelists the kind itself.

## 3. Behavior (every state / fail-state)

### 3.1 `loadEnvelope(envelope, { userData })` — A2 load
- Replaces the current graph: tears down the existing content (see §3.6), then
  `translateLegacy(envelope)` → register → compile → `recordResolved` → render.
- Sets the translate-scoped `userData` (R8) when provided; a fresh `Supervisor`
  is built on every load, so an absent-`userData` load after a user load carries
  NO stale userData (the anon-after-alice trap is closed by the supervisor
  rebuild, not an explicit clear).
- Returns the post-load census.
- Placement-routed envelopes (a node with a `content`-role anchor) bootstrap via
  `compilePath()` per node (the path-enumeration pass), NOT `rootNode.compile`
  (R-new). Non-placement envelopes use the default bootstrap.
- A malformed envelope (translate throws / `envelope-mismatch`) → throws with
  the translate error; the graph is left in the pre-load (torn-down) state.

### 3.2 `loadDoc(doc)` — A1 load (snapshot/restore)
- `loadState(doc)` → seeds → `new Node(seed, createLinkHub())` (template root
  first, content after) → `reconcileParentTargets(nodes)` → register per node →
  compile → `recordResolved` → render. ONE hub shared with the supervisor.
- Snapshot-parity only (R3): def/seam/rows machinery does NOT survive loadState.
- Returns the post-load census.

### 3.3 `applyCommand(cmd)` — A3 single op
- `supervisor.apply(cmd)` (the managed channel) → `flush()` → drain rule (R9:
  `takePass2States` consumed exactly once, before render) → render.
- Returns the apply result `{ status, dirtied?, minted? }`.
- A rejected op returns `{ status: 'rejected' }` — never throws. Rejection
  sources: an unresolvable string `node` (H3), a non-string/non-Node `node`
  value (H4), a non-object command (H4), or an unknown op `kind` (engine-side).
- **Unknown-kind split (D3, 2026-08-23):** an unknown `kind` WITHOUT a resolvable
  `node` path → `{ status: 'rejected' }` (the host's H4/F10 guard, above). An
  unknown `kind` ON A RESOLVED `node` reaches the engine, which returns
  `{ status: 'no-usable-state' }` — NOT `rejected`. `no-usable-state` is an
  engine verdict, never a throw; both statuses are "did not apply".
- The MCP wrapper `teardownResult()` is ASYNC: it awaits the R6 settle-gate
  before + after `teardown()` so the returned census reflects provable
  quiescence (`hasPendingWork() === false`).

### 3.4 `exportLegacy()` / `exportSerialized()`
- `exportLegacy()` → `reverseTranslate(root, { content: contentNodes })`.
- `exportSerialized()` → `serializeSlice(root, kids, clientConfig)`.
- Both return the current graph's export (no mutation).

### 3.5 `validateExport(kind, export)`
- Re-loads the export into a THROWAWAY graph (a fresh `Supervisor`; never
  the live one) and compares census. The `hub` is used only on the serialized
  branch (`loadState` → `new Node(s, hub)`); the legacy branch uses
  `translateLegacy` (which makes its own hub).
- `censusMatch` = the throwaway graph's `inTree`+`registered` equal the live
  graph's. The MCP `validate` wrapper adds a `treeSigMatch` parity digest.
- Returns `{ valid, censusMatch, warnings }` — never throws on a malformed
  export (returns `valid:false`). A `kind` other than `'legacy'|'serialized'`
  returns `{ valid:false }` (H6 — never a wrong serialized parse).

### 3.6 `teardown()` — restore root-only (C3/C4)
- Destroys every in-tree child of root via `supervisor.apply('destroy')` per
  node (runtime-minted retention), `dropPayload` on content payloads, then
  re-render. A fresh `Supervisor` is built on the next load, so userData (R8)
  does not persist across loads.
- Returns the post-teardown census — `inTree === 1` (root only), mount empty.
- Idempotent: calling teardown on an already-root-only graph is a no-op.
- The R6 settle-gate (`while (hasPendingWork()) await flush()`) is awaited in
  the async `teardownResult()` wrapper (the MCP `provident.teardown` path), so
  the post-teardown state is at provable quiescence.

### 3.7 id-index (A5)
- The Runtime maintains a `Map<cssId, nodeId>` + `Map<propsId, nodeId>` rebuilt
  on every load/teardown (NOT per-call `allNodes().find`).
- `resolveTarget`/`resolveString` use the index first, then fall back to
  `getNode` (nodeId/wire). A destroyed node's id is NOT in the index (the
  tombstone shadow-hazard is avoided).

## 3a. Adversarial findings (2026-08-22) — landed as fixes

An adversarial review of the first Unit-A green landed these host-side fixes
(no engine defect). The green scenarios encode them.

| # | Finding | Fix (documented contract) |
| --- | --- | --- |
| H1 | Placement-routed loads always used `rootNode.compile` → the path-state element set (4095 at d12) was silently dropped (the fragment was the wrong ~3). | `render()`/`loadEnvelope`/`loadDoc` detect placement-routing (a `content`-role anchor) and bootstrap via `compilePath()` per node. |
| H2 | `teardown` left children as resolvable `unplaced` ghosts (only link-dissolved, never destroyed) — a stale ghost tree + index. | `teardown`/the id-index/`resolveTarget`/`listTargets` are all IN-TREE-only: torn-down node ids never resolve (A5). |
| H3 | `applyCommand` clone-instance with an unresolvable string `node` THREW (`source.clone` on the raw string) instead of returning rejected. | `applyCommand` rejects cleanly when a string `node` does not resolve (never throws). |
| H4 (F1/F10) | `applyCommand`/`op` with a NON-string/non-object `node` value (a number/object) or a non-object command (`null`/primitive) THREW (`source.clone` on the raw value / a `cmd.node` read on `null`), violating §3.3 "never throws". | `applyCommand` rejects any non-object command AND any `node` that is not a string or a Node (never throws). |
| H5 (F8) | `codeDelete` with an out-of-range (or negative) index silently returned `{ok:true, removed:undefined}` — a negative index would splice from the end, corrupting the envelope. | `codeDelete` throws `code.delete: '<path>' index <n> out of range` for a non-integer/negative/≥-length index; the array is untouched. |
| H6 (F5) | `validateExport('bogus', export)` silently took the serialized path (`loadState` on a legacy-shaped export) instead of an explicit invalid-kind verdict. | `validateExport` discriminates `'legacy' | 'serialized'` only; a `'bogus'` kind returns `{valid:false}` (never a wrong serialized parse). |

## 3b. Adversarial findings (2026-08-23, H7..H13) — the battery units, landed as fixes

A second adversarial review (read-only sub-agent) over the Unit C battery/code-CRUD
surface found 7 host defects — all fixed + regression-tested in
`tests/runtime-battery.test.ts`. No engine defect (all host-side `src/renderer/runtime.ts`).

| # | Finding | Fix (documented contract) |
| --- | --- | --- |
| H7 | `codeDelete('template.root.hooks[99]')` (a path INDEX, vs the H5 `index`-arg) silently returned `{ok:true, removed:undefined}` — the H5 `/out of range/` guard covered only the `index` argument, not the path form. | `codeDelete` bounds-checks a path-index element exactly like the `index` argument (`/out of range/`); a malformed negative path index (`[-1]`) is rejected by the path grammar. |
| H8 | `codeDelete` had two overlapping splice semantics (path-index vs `index`-arg): deleting a path-selected array ELEMENT that is itself an array would splice INSIDE it, and a provided `index` was silently ignored. | The two forms are now mutually exclusive: a path-index element splices that element (the `index` arg is ignored); a path resolving to an ARRAY + `index` splices the index; a non-array element resolution is rejected. |
| H9 | A malformed path (`children]`, `children[0`, empty segment) was treated as a literal property name → a garbage key was silently written into the envelope. | `assertValidPath` validates the grammar up front (balanced brackets, single well-formed `[i]` suffix, no empty/leading/trailing segments); a malformed path is rejected before any read/write. |
| H10 | `validate('bogus', export)` returned `{valid:true}` for a valid doc — the kind was not gated (H6's spec case only passed because `{a:1}` is an invalid doc). | `validateExport` rejects any kind other than `'legacy' | 'serialized'` with `{valid:false, censusMatch:false}`. |
| H11 | `op({kind:'clone-instance', source:{foo:1}})` THREW a `TypeError` (`source.clone is not a function`) instead of returning rejected — the H4 guard passed plain OBJECTS through, assuming a real `Node`. | `applyCommand` resolves any object `node`/`source` against the registry (`isRegisteredNode`); a plain object → `{status:'rejected'}`. |
| H12 | `op({kind:'state-slice', node})` without `mutation` THREW an unhandled `TypeError` (`for (const m of op.mutation)` over `undefined`). | `applyCommand` rejects a `state-slice`/`layer-apply` whose `mutation` is not an array (`{status:'rejected'}`). |
| H13 | `codeLoad()` after a `codeSet` that invalidated `children` silently loaded a root-only graph (the edit was discarded with zero signal). | `codeLoad` pre-validates the edited envelope (`codeValidate`) and rejects a structurally-invalid edit (`children-shape-invalid`/`payload-shape-obsolete`/etc.) with a clear error; the live graph is NOT silently torn down. |

## 4. Verify (the TestWriter's exact states)

- `loadEnvelope(demoEnvelope())` → census with `inTree > 0`; the mount renders.
- `loadEnvelope` with `userData` then `loadEnvelope` without → the second has no
  stale userData (the anon-after-alice trap is closed).
- `loadEnvelope` of a placement-routed envelope (the path-fork shape) → the
  static-family census (`inTree === 2·depth−1`; at d12 → 23 nodes / 2^depth−1 =
  4095 path-state elements via the digest/sample, not the raw fragment). The
  greens + `tests/runtime-host.test.ts` verify at depth 4 → `inTree === 7` (the
  depth-scaled census).
- `applyCommand({ kind: 'state-slice', ... })` → `{ status: 'applied' }` and the
  render reflects it; a rejected op returns `{ status: 'rejected' }` (no throw).
- `exportLegacy()` → a `LegacyInitialData`; `validateExport('legacy', it)` →
  `{ valid: true, censusMatch: true }`.
- `teardown()` → `inTree === 1`, mount empty; idempotent (second call no-op).
- `resolveTarget('counter')` (a css.id) resolves via the index without an
  `allNodes()` scan (the index is used).
- A destroyed node's id does not resolve via the index.
