# Unit I — Template Customization: Green-Scenario Artifact (Blind-Test)

- **Author:** Blind-test writer (derived from `docs/specs/unit-i-template.md`
  ONLY — no implementation reading of the scenario content).
- **Source contract:** `docs/specs/unit-i-template.md` §5.1–§5.11 (the
  `ContentWindowTemplate` shape + `DEFAULT_CONTENT_WINDOW_TEMPLATE`, the
  `createTemplateStore` store + `validateTemplate` zone-consistency invariant,
  the `code.template.*` CRUD surface + `handleTemplateTool` shared handler, the
  template-editor pane + IPC surface + preload `template` bridge, the
  whole-graph re-derive, the traversal `TraversalInput.template` amendment,
  §5.8 happy paths, §5.9 fail-states, §5.10 census) + §3a (the post-green
  adversarial findings I3–I5, host-fixed + regression-tested).
- **Modules under test:** `src/main/template-store.ts` +
  `src/main/template-shape.ts` (`createTemplateStore`,
  `DEFAULT_CONTENT_WINDOW_TEMPLATE`, `validateTemplate`), `src/main/mcp-server.ts`
  (`handleTemplateTool` + the six `code.template.*` tools in ALL_TOOLS +
  `registerTools` main-handled branch), `src/main/traversal.ts` (the
  `TraversalInput.template` amendment + the zone-producer defense-in-depth),
  `src/main/security.ts` (the `code` group + the six `code.template.*`
  TOOL_GROUPS + `defaultSecurityConfig`), `src/main/preload.ts` (the `template`
  bridge), `src/renderer/template-pane.ts` (`createTemplateEditorPane` +
  `TEMPLATE_PANE_ID`), and the IPC constants in `src/shared/types.ts`.
- **Harness:** a temporary vitest file in `tests/` (removed after the run),
  executed with `npx vitest run`. The pure store + validation + shared handler
  + traversal amendment + pane authoring are exercised directly. The traversal
  envelope fixtures come from `buildTraversal` over a minimal read-only
  `RagStore` adapter (`listNodes`/`listEdges`), the same adapter pattern the
  traversal uses. The `code.template.*` MCP tools are exercised via
  `handleTemplateTool` (the shared main-process handler both the MCP tools and
  the UI IPC call — the §8.2 equivalence seam). The preload `template` bridge
  and the renderer switch are Electron/renderer surfaces (see test-authoring
  notes).
- **Run:** 45 scenarios — 45 pass, 0 fail. No spec-vs-impl drift observed.

Each scenario lists: name, setup, operations, expected outcome (from the spec).

---

## A. §5.8 Happy-path states (16 node-tested)

Fixture helpers: `N(id, content)` = a `RagNode`
`{ id, type, content, ownedNodeIds: [], createdAt, updatedAt }`;
`E(id, kind, source, target, extra)` = a `RagEdge`
`{ id, kind, source, target, createdAt, updatedAt, ...extra }`. A traversal
envelope is built via `buildTraversal` over a one-document `doc-head` store
(`validDoc()`: head → s1 → s2 → end, all scoped to `doc`). `customMain()` = a
well-formed custom template with a `main` container producer; `customAside()` =
`main` + an extra `aside` producer; `missingMain()` = only an `aside` producer
(drops `main`).

### H1. Default template read (§5.8 1)
- **Setup:** a fresh `createTemplateStore({ path, targetedZones: ['main'] })`
  with no persisted file.
- **Ops:** `get()`; `status()`.
- **Expected:** `get()` returns `DEFAULT_CONTENT_WINDOW_TEMPLATE` (one `main`
  zone); `status()` = `{ source: 'default' }`.

### H2. `validateTemplate` happy (§5.8 2)
- **Ops:** `validateTemplate(customMain(), ['main'])`.
- **Expected:** `{ ok: true }`.

### H3. `validateTemplate` extra zone (§5.8 3)
- **Ops:** `validateTemplate(customAside(), ['main'])`.
- **Expected:** `{ ok: true }` (extra zones are allowed).

### H4. `set` happy (§5.8 4)
- **Ops:** `set(customMain())`; then `status()`; then `get()`.
- **Expected:** persists; `status()` = `{ source: 'custom' }`; returns the
  stored template; a subsequent `get()` returns it.

### H5. `reset` happy (§5.8 5)
- **Setup:** a store after a custom `set`.
- **Ops:** `reset()`; then `status()`.
- **Expected:** restores `DEFAULT_CONTENT_WINDOW_TEMPLATE`; `status()` =
  `{ source: 'default' }`.

### H6. `create` of a NEW zone (§5.8 6)
- **Setup:** a store with the default template.
- **Ops:** `handleTemplateTool(store, 'code.template.create', { zone: 'aside' })`.
- **Expected:** adds the `zone:aside` container producer, persists, returns the
  updated template (source `custom`). **Complement:** `create('main')` (an
  already-present zone) is a FAIL-state (§5.9 8).

### H7. `delete` of a NON-targeted zone (§5.8 7)
- **Setup:** a store whose template has a `main` + `aside` producer.
- **Ops:** `handleTemplateTool(store, 'code.template.delete', { zone: 'aside' })`.
- **Expected:** removes the `aside` producer, persists, returns the updated
  template. **Complement:** `delete('main')` where `main` ∈ `targetedZones` is a
  FAIL-state (§5.9 5).

### H8. `code.template.get` happy (§5.8 8)
- **Ops:** (a) `groupForTool('code.template.get')`; (b)
  `toolAllowed('code.template.get', ['code'])`; (c)
  `toolAllowed('code.template.get', ['read','dispatch'])`.
- **Expected:** (a) `'code'`; (b) `true`; (c) `false` (the `code` group is
  default-off — not in `defaultSecurityConfig()`).

### H9. MCP/UI equivalence (get) (§5.8 9)
- **Ops:** `handleTemplateTool(store, 'code.template.get', {})` (the MCP path)
  and the same handler with the SAME store (the UI IPC path).
- **Expected:** both return the same `{ source, template }` from the SAME
  template store.

### H10. MCP/UI equivalence (mutate + re-derive) (§5.8 10)
- **Ops:** `handleTemplateTool(store, 'code.template.set', { template: customMain() }, onChanged)`
  with an `onChanged` spy; then the same via the IPC-equivalent handler call.
- **Expected:** each writes the same template store, invokes `onChanged` with
  `{ source: 'custom', template }` (the `template-changed` broadcast payload),
  and the store reflects the same template through both surfaces.

### H11. Traversal with a custom template (§5.8 11)
- **Setup:** a one-document store; `customMain()`.
- **Ops:** `buildTraversal({ store, documentIds: ['doc'], zoneName: 'main', template: customMain() })`.
- **Expected:** the envelope's `template` is `customMain()` (with the `zoneName`
  producer present); the content roots render in the `main` zone
  (`targetPlacement: ['main']`).

### H12. Traversal defense-in-depth (§5.8 12)
- **Setup:** a one-document store; `missingMain()` (LACKS the `main` producer).
- **Ops:** `buildTraversal({ store, documentIds: ['doc'], zoneName: 'main', template: missingMain() })`.
- **Expected:** the traversal ADDS the `main` producer to the template root's
  children (the subtree is NOT left unplaced; the content renders).

### H13. Template-editor pane authored (Unit H) (§5.8 13)
- **Ops:** `createTemplateEditorPane()`; inspect the returned `PaneDefinition`;
  wrap its `render(ctx)` output via `paneSubtreeRoot`.
- **Expected:** the pane has `id: 'template-editor'`, `scope: 'app-graph'`,
  `title: 'Template'`; `render(ctx)` returns a content root; `paneSubtreeRoot`
  wraps it with `props.id = 'pane-template-editor'` + `targetPlacement:
  ['sidebar']`.

### H14. Template-editor pane MCP-visible (equivalence, structural) (§5.8 14)
- **Setup:** a `TemplatePaneContext` with the default template + `targetedZones:
  ['main']`.
- **Ops:** `createTemplateEditorPane().render(ctx)`; inspect the returned
  content root.
- **Expected:** the root is a `section` with a `data-template-root-id` row, one
  `li` per zone producer carrying `data-template-zone` (+ `data-targeted: 'true'`
  for a targeted zone), a `template-zone-input` input, and the four handlers
  `template-zone-add`/`template-zone-remove`/`template-reset`/`template-save`.
  The pane is `scope: 'app-graph'` → authored into the pane-inclusive app-graph
  envelope → MCP-visible by construction (the full Runtime load is a
  renderer-surface behavior; the assembly guarantee is its node-testable
  precondition).

### H15. Re-derive via IPC (renderer-surface) (§5.8 15)
- **Behavior (renderer-surface):** `bridge.template.set(...)` → the pane +
  content-window re-render with the new template; the app-graph panes stay
  MCP-visible. The node-testable precondition is the shared handler + the
  `template-changed` broadcast payload (H10) + the traversal amendment (H11/H12)
  — the renderer re-derive wiring is a browser-entry host concern (see
  test-authoring note).

### H16. Dirty-edit guard (renderer-surface) (§5.8 16)
- **Behavior (renderer-surface):** a `template-changed` broadcast while a
  template-editor control is dirty QUEUES the re-derive until the control is
  clean (Unit D §5.2). The guard is a renderer-surface host concern (see
  test-authoring note).

---

## B. §5.9 Fail-states (14 node-tested)

### F1. `createTemplateStore` null/undefined opts or empty path (§5.9 1)
- **Ops:** `createTemplateStore(null)`, `createTemplateStore(undefined)`,
  `createTemplateStore({ path: '' })`.
- **Expected:** each throws `Error('template store: path required')`.

### F2. Corrupt/missing template file boot (§5.9 2)
- **Setup:** a file that fails `JSON.parse`; a file that is not an object; a
  file with a non-`1` `version`; a file whose `template` fails the §5.6 shape
  check.
- **Ops:** `createTemplateStore({ path })` for each.
- **Expected:** each boots to `DEFAULT_CONTENT_WINDOW_TEMPLATE`, `status().source
  = 'default'`, NEVER throws.

### F3. `set` with an `invalid-shape` template (§5.9 3)
- **Ops:** `set(null)`, `set('nope')`, `set({})`, `set({ root: {} })`,
  `set({ root: { type: 'div' } })`.
- **Expected:** each throws `Error('template set: invalid-shape — <detail>')`;
  the store is unchanged.

### F4. `set` with a `missing-zone` template (§5.9 4)
- **Ops:** `set(missingMain())` (drops the targeted `main` zone).
- **Expected:** throws
  `Error('template set: missing-zone — missing container for zone "main"')`;
  the store is unchanged. (The ZONE-CONSISTENCY-INVARIANT save-time layer.)

### F5. `delete` of a TARGETED zone (§5.9 5)
- **Ops:** `handleTemplateTool(store, 'code.template.delete', { zone: 'main' })`.
- **Expected:** throws
  `Error('template delete: cannot remove targeted zone "main"')`; the store is
  unchanged.

### F6. `delete` of an UNKNOWN zone (§5.9 6)
- **Ops:** `handleTemplateTool(store, 'code.template.delete', { zone: 'nope' })`.
- **Expected:** throws `Error('template delete: no zone "nope"')`; the store is
  unchanged.

### F7. `create` with an empty/non-string `zone` (§5.9 7)
- **Ops:** `handleTemplateTool(store, 'code.template.create', { zone: '' })` and
  `{ zone: 42 }`.
- **Expected:** each throws `Error('template create: zone required')`.

### F8. `create` of an ALREADY-PRESENT zone (§5.9 8)
- **Ops:** `handleTemplateTool(store, 'code.template.create', { zone: 'main' })`
  (a `main` producer already exists).
- **Expected:** throws
  `Error('template create: zone "main" already present')`; the store is
  unchanged (no duplicate producer).

### F9. `validateTemplate` with a null/undefined `zones` (§5.9 9)
- **Ops:** `validateTemplate(customMain(), null)` and `(customMain(), undefined)`.
- **Expected:** each throws `Error('validateTemplate: zones required')`.

### F10. A `code.template.*` tool with `code` disabled (§5.9 10)
- **Ops:** `toolAllowed('code.template.set', ['read','dispatch'])` (the
  `defaultSecurityConfig()` set).
- **Expected:** `false` — the five-seam gate's default-off state (the `code`
  group is NOT in `defaultSecurityConfig()`).

### F11. A `code.template.*` tool with a null template store (§5.9 11)
- **Ops:** `handleTemplateTool(null, 'code.template.get', {})`.
- **Expected:** throws
  `Error('code.template.get: no template store configured')`.

### F12. A `code.template.*` method that reaches the renderer switch (§5.9 12)
- **Behavior (renderer-surface):** the `code.template.*` tools are main-handled
  and NEVER reach the renderer switch (intercepted in `mcp-server.ts`); the
  switch needs NO new cases, and a `code.template.*` method that somehow reaches
  it hits the `default` branch → `unknown method` (fail-closed). The
  main-handled interception is node-testable via the `registerTools`
  `name.startsWith('code.template.')` branch (see test-authoring note).

### F13. A mutating `code.template.*` tool with a malformed payload (§5.9 13)
- **Ops:** `handleTemplateTool(store, 'code.template.set', {})` (no `template`);
  `handleTemplateTool(store, 'code.template.create', {})` (no `zone`).
- **Expected:** each throws the documented per-tool error (`template set:
  invalid-shape — ...` / `template create: zone required`); the store is
  unchanged.

### F14. `get` on a store that has never been customized (§5.9 14)
- **Ops:** `handleTemplateTool(store, 'code.template.get', {})` on a fresh store.
- **Expected:** `{ source: 'default', template: DEFAULT_CONTENT_WINDOW_TEMPLATE }`
  (not a fail — the baseline).

---

## C. §5.10 Census / numeric claims (12 node-tested)

### C1. `ContentWindowTemplate` fields — 1
- **Expected:** exactly `root`.

### C2. Default template zones — exactly 1 (`main`)
- **Expected:** `DEFAULT_CONTENT_WINDOW_TEMPLATE.root` is
  `{ type: 'div', props: { id: 'wiki-root' }, children: [zone:main producer] }`;
  exactly one container producer (`main`).

### C3. `targetedZones` default — `['main']`
- **Expected:** a store created without `targetedZones` exposes
  `targetedZones === ['main']`.

### C4. Template-store methods — 4 + 1 readonly property
- **Expected:** `get`, `set`, `reset`, `status` are functions; `targetedZones`
  is a readonly property.

### C5. `TemplateVerdict` fail reasons — 2 + 1 happy path
- **Expected:** `invalid-shape`, `missing-zone`, and `{ ok: true }`.

### C6. `code.template.*` tools — 6; read-only 2; mutating 4
- **Expected:** `get`, `validate`, `set`, `create`, `delete`, `reset`; read-only
  `get`/`validate`; mutating `set`/`create`/`delete`/`reset`.

### C7. Five-seam additions — TOOL_GROUPS +6, ALL_TOOLS +6, RpcMethod +6, switch +0, MUTATING_METHODS +0
- **Expected:** the six `code.template.*` names map to `code` in TOOL_GROUPS; the
  six names are in ALL_TOOLS; the six names are in the `RpcMethod` union; the
  renderer switch has NO `code.template.*` cases (negative contract); the
  mutating `code.template.*` tools are NOT in the renderer's `MUTATING_METHODS`
  (negative contract).

### C8. Group / default state — `code`, default-OFF
- **Expected:** `defaultSecurityConfig()` = `{ token: null, enabled: ['read',
  'dispatch'] }` (the `code` group is NOT enabled by default).

### C9. IPC channels — 7
- **Expected:** `IPC_TEMPLATE_GET`/`VALIDATE`/`SET`/`CREATE`/`DELETE`/`RESET`
  (6 renderer→main) + `IPC_TEMPLATE_CHANGED` (1 main→renderer broadcast).

### C10. Template-editor pane — exactly 1
- **Expected:** `TEMPLATE_PANE_ID === 'template-editor'`; the pane is
  `scope: 'app-graph'`, `title: 'Template'`, authored via `paneSubtreeRoot`
  (`props.id = 'pane-template-editor'`, `targetPlacement: ['sidebar']`).

### C11. `TemplatePaneContext` fields — 2 beyond `PaneContext`
- **Expected:** `template`, `targetedZones`.

### C12. Pane handlers — 4; zone-consistency layers — 2
- **Expected:** the pane's four handlers `template-zone-add`/`template-zone-remove`/
  `template-reset`/`template-save` all call the template IPC bridge; the
  zone-consistency invariant is enforced at 2 layers (save-time validation +
  traversal defense-in-depth).

---

## D. §3a Adversarial findings (host, fixed + regression-tested) — 3 node-tested

### D1 (I3). `bridge.template.validate` wraps the template like `set` does
- **Setup:** a store with the default template.
- **Ops:** `handleTemplateTool(store, 'code.template.validate', { template: customMain() })`
  (the payload shape the preload bridge now sends — `{ template: tpl }`).
- **Expected:** returns `{ ok: true }` — NOT `invalid-shape`. (The preload
  `validate` sends `{ template: tpl }` so `args.template` is defined; sending the
  raw `tpl` made `args.template` undefined → `invalid-shape`.)

### D2 (I4). `get()` returns a deep copy (never the internal record)
- **Setup:** a store with a custom template.
- **Ops:** `const t = store.get(); t.root.props.id = 'mutated';` then `store.get()`.
- **Expected:** the store's internal template is unchanged (the returned template
  is a deep copy — a caller cannot mutate the store through `get()`, bypassing
  the zone-consistency validation).

### D3 (I5). `targetedZones` accessor returns a copy
- **Setup:** a store with `targetedZones: ['main']`.
- **Ops:** `store.targetedZones.push('x')`; then `store.targetedZones`.
- **Expected:** the accessor returns a copy — the pushed `'x'` does NOT change
  which zones `set`/`delete`/`validate` enforce (the accessor returns
  `[...targetedZones]`).

---

## E. Run record

| # | Scenario | Result |
| --- | --- | --- |
| H1 | Default template read | ✅ PASS |
| H2 | `validateTemplate` happy | ✅ PASS |
| H3 | `validateTemplate` extra zone | ✅ PASS |
| H4 | `set` happy | ✅ PASS |
| H5 | `reset` happy | ✅ PASS |
| H6 | `create` of a NEW zone | ✅ PASS |
| H7 | `delete` of a NON-targeted zone | ✅ PASS |
| H8 | `code.template.get` happy (group gate) | ✅ PASS |
| H9 | MCP/UI equivalence (get) | ✅ PASS |
| H10 | MCP/UI equivalence (mutate + re-derive) | ✅ PASS |
| H11 | Traversal with a custom template | ✅ PASS |
| H12 | Traversal defense-in-depth | ✅ PASS |
| H13 | Template-editor pane authored (Unit H) | ✅ PASS |
| H14 | Template-editor pane MCP-visible (structural) | ✅ PASS |
| H15 | Re-derive via IPC (renderer-surface) | ✅ PASS |
| H16 | Dirty-edit guard (renderer-surface) | ✅ PASS |
| F1 | `createTemplateStore` null/undefined opts or empty path | ✅ PASS |
| F2 | Corrupt/missing template file boot | ✅ PASS |
| F3 | `set` with an `invalid-shape` template | ✅ PASS |
| F4 | `set` with a `missing-zone` template | ✅ PASS |
| F5 | `delete` of a TARGETED zone | ✅ PASS |
| F6 | `delete` of an UNKNOWN zone | ✅ PASS |
| F7 | `create` with an empty/non-string `zone` | ✅ PASS |
| F8 | `create` of an ALREADY-PRESENT zone | ✅ PASS |
| F9 | `validateTemplate` with a null/undefined `zones` | ✅ PASS |
| F10 | A `code.template.*` tool with `code` disabled | ✅ PASS |
| F11 | A `code.template.*` tool with a null template store | ✅ PASS |
| F12 | A `code.template.*` method reaching the renderer switch | ✅ PASS |
| F13 | A mutating tool with a malformed payload | ✅ PASS |
| F14 | `get` on a never-customized store | ✅ PASS |
| C1 | `ContentWindowTemplate` fields (1) | ✅ PASS |
| C2 | Default template zones (1) | ✅ PASS |
| C3 | `targetedZones` default (`['main']`) | ✅ PASS |
| C4 | Template-store methods (4 + 1 readonly) | ✅ PASS |
| C5 | `TemplateVerdict` fail reasons (2 + 1) | ✅ PASS |
| C6 | `code.template.*` tools (6; 2 read-only; 4 mutating) | ✅ PASS |
| C7 | Five-seam additions (+6/+6/+6/+0/+0) | ✅ PASS |
| C8 | Group / default state (`code`, default-OFF) | ✅ PASS |
| C9 | IPC channels (7) | ✅ PASS |
| C10 | Template-editor pane (1) | ✅ PASS |
| C11 | `TemplatePaneContext` fields (2 beyond) | ✅ PASS |
| C12 | Pane handlers (4) + zone-consistency layers (2) | ✅ PASS |
| D1 | (I3) `bridge.template.validate` wraps the template | ✅ PASS |
| D2 | (I4) `get()` returns a deep copy | ✅ PASS |
| D3 | (I5) `targetedZones` accessor returns a copy | ✅ PASS |

**Run summary:** 45 scenarios — 45 pass, 0 fail.

### Findings (spec-vs-impl drift)

- **None observed.** Every scenario derived from
  `docs/specs/unit-i-template.md` §5.1–§5.11 + §3a passed against the live
  modules. The `ContentWindowTemplate` shape + `DEFAULT_CONTENT_WINDOW_TEMPLATE`
  (§5.1), the `createTemplateStore` store + its fail-disabled boot + atomic
  persistence + `get`/`set`/`reset`/`status`/`targetedZones` (§5.2), the
  `validateTemplate` zone-consistency invariant (§5.6), the `code.template.*`
  CRUD surface + `handleTemplateTool` shared handler + the five-seam gate
  (§5.3), the traversal `TraversalInput.template` amendment + the
  zone-producer defense-in-depth (§5.7), the template-editor pane authoring
  (§5.4), all 16 happy paths (§5.8), all 14 fail-states (§5.9), every census
  claim (§5.10), and the §3a adversarial hardening (I3–I5) match the spec. No
  spec-vs-impl drift was observed.

### Test-authoring notes (not drifts)

- **H15/H16 and §5.9 12 (renderer-surface re-derive + dirty-edit guard + switch
  negative).** The full app-Runtime re-render after a `template-changed`
  broadcast, the dirty-edit guard that queues a re-derive while a control is
  dirty, and the renderer `handleRequest` switch's `unknown method` fallback are
  browser-entry renderer constructs, not node-testable in the pure modules. The
  node-testable guarantees that make them hold are asserted directly: (a) the
  shared `handleTemplateTool` writes the store and invokes `onTemplateChanged`
  with the `{ source, template }` payload (H10) — the exact payload the
  `IPC_TEMPLATE_CHANGED` broadcast carries; (b) the `registerTools`
  `name.startsWith('code.template.')` branch intercepts the tools in MAIN before
  the renderer `backend.invoke` fallthrough (F12), so a `code.template.*` method
  never reaches the renderer switch; (c) the traversal amendment produces the
  re-derived envelope (H11/H12). The equivalence of the rendered output through
  the MCP surface vs the UI is the renderer Runtime's contract, verified by code
  review / the e2e battery per the Unit G convention.
- **H9/H10 (MCP/UI equivalence).** The preload `template` bridge
  (`bridge.template.*`) is an Electron surface (imports `ipcRenderer`), not
  node-testable. Both the MCP `code.template.*` tools and the UI IPC handlers
  call the SAME `handleTemplateTool` with the SAME template store (§5.3/§5.4) —
  the shared handler is the equivalence seam, exercised directly here. The
  preload bridge's payload-wrapping (I3) is verified by code review of the
  `validate`/`set`/`create`/`delete` IPC payloads.
- **§3a I1/I2 (deferred to the UI mount).** The spec's §3a lists I1 (the
  `template-changed` re-derive not wired in the renderer) and I2 (the
  template-editor pane not registered/wired into the app-graph) as deferred to
  the `SidebarPanes` renderer host (Unit H §3a), landing with the UI mount —
  consistent with the spec's §3a. They are not node-testable in the pure
  modules and are not part of this greens set.
