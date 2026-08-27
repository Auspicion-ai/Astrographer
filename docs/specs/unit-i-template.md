# Spec — Unit I: Template Customization (Content-Window Template)

- **Status:** SPEC (later unit I). Gate reference:
  `docs/specs/astrographer-review.md` §4 item 9 / §7 scope item 9 (Template
  customization via `code.*` CRUD exposed through a provident-rendered
  template-editor pane — whole-graph re-derive is acceptable because it is
  infrequent), line 60 (the original request pins a **customizable
  content-window template**), §8.2 (MCP/UI equivalence — a BINDING constraint on
  every unit that touches rendering), §9.2.7 (RAG-EDIT-MCP-GROUPS — the `code`
  group is the envelope-editing surface the template CRUD rides), §9.2.1
  (PROJECT-JOURNAL). Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**,
  **SUBTREE-OWNERSHIP**, **FORM-CONTROL-EDITING**, **PANE-PROVIDENT-AUTHORING**,
  **APP-GRAPH-PANES-MCP-VISIBLE**, **SINGLE-WRITER-STORE**. New decisions pinned
  by this spec (added to `docs/decisions.md` when the unit lands):
  **CONTENT-WINDOW-TEMPLATE** (the content-window template IS the
  `LegacyInitialData.template` shape; the default is the current FIXED
  `wiki-root` + per-zone containers),
  **TEMPLATE-STORE** (a host-side main-process template store persists the
  current `ContentWindowTemplate`, separate from the RAG store),
  **CODE-GROUP-TEMPLATE-CRUD** (the template CRUD is exposed as the
  `code.template.*` tools in the `code` group, main-handled, default-off),
  **TEMPLATE-PANE** (a provident-rendered `scope: 'app-graph'` template-editor
  pane, Unit H authoring),
  **ZONE-CONSISTENCY-INVARIANT** (a customized template MUST NOT drop a
  `container`-role producer for a zone the traversal targets),
  **TEMPLATE-RE-DERIVE** (a template change triggers a whole-graph re-derive,
  reusing the Unit C traversal + Unit H assembly).
- **Scope:** the content-window template (the `LegacyInitialData.template`
  shape that defines the content-window layout for rendering a retrieved
  document — the container zones + the root structure), the host-side template
  store (persistence + the store API), the `code.template.*` CRUD surface
  through the five-seam gate (tool/IPC names, request/response shapes, zod
  schemas, fail-states, group/default state/read-only-vs-mutating), the
  provident-rendered template-editor pane (Unit H authoring), the whole-graph
  re-derive trigger/sequencing after a template change, and the
  **zone-consistency invariant** (the Unit C HARD PRECONDITION — a customized
  template MUST NOT drop a zone container producer a targeted zone needs). This
  unit consumes Unit A (the `RagStore` interface the traversal reads), Unit C
  (`buildTraversal` + the `LegacyInitialData` envelope + the HARD PRECONDITION),
  Unit D (the form-control editing model + the renderer re-traversal path), and
  Unit H (the pane registry + `PaneDefinition` authoring + the pane-inclusive
  app-graph envelope). This unit does NOT implement the RAG store (Unit A), the
  traversal (Unit C), or the pane registry/assembly (Unit H) — it adds the
  template as a new envelope input to the traversal and a new app-graph pane to
  the registry.
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the red set for `src/main/template-store.ts`
  (the store + `validateTemplate` + `ContentWindowTemplate` +
  `DEFAULT_CONTENT_WINDOW_TEMPLATE`), the amended `src/main/traversal.ts`
  (`TraversalInput.template` + the zone-producer defense-in-depth), the
  `code.template.*` tools in `src/main/mcp-server.ts` +
  `src/main/security.ts` + `src/shared/types.ts`, and the template-editor pane
  in `src/renderer/template-pane.ts` from §5.8/§5.9 before any implementation.

---

## 1. What the proposal asks

1. **A customizable content-window template.** The original request pins a
   **customizable content-window template** (review §4 item 9 / line 60). The
   content-window template is the `LegacyInitialData.template` shape that
   defines the content-window layout for rendering a retrieved document (the
   container zones + the root structure). The default is the current FIXED
   `wiki-root` + per-zone containers (the Unit C baseline). A customized
   template REPLACES it.
2. **Template customization via `code.*` CRUD.** The template CRUD (create /
   read / update / delete / validate) is exposed through the `code` group —
   a provident-rendered template-editor pane exposes it in the UI, and the
   `code.template.*` MCP tools expose it to agents (MCP/UI equivalence, §8.2).
3. **Whole-graph re-derive after a change.** After a template change, the whole
   graph re-derives (acceptable because template edits are infrequent — review
   §4 item 9). The re-derive reuses the existing `buildTraversal` (Unit C) +
   the pane-inclusive app-graph assembly (Unit H) + the app Runtime render path
   (Unit C §5.4 / Unit D §5.1.9).
4. **The zone-consistency invariant.** A customized template MUST NOT drop a
   `container`-role producer for a zone the traversal targets (the Unit C HARD
   PRECONDITION — a missing container leaves the content `unplaced`, silently
   not render-eligible). The spec pins the validation that enforces this.

## 2. Feasibility verdict

**Feasible — grounded in the Unit C envelope shape, the Unit H pane-authoring
convention, and the engine's placement model.**

- **The template IS `LegacyInitialData.template`:** the envelope shape is
  `{ template: { root: LegacyNodeData }, content: ContentPayload[], clientConfig }`
  (Unit C §5.2). The `template` field is the content-window template — a plain
  object with a `root` node whose children are the `container`-role producers
  (the zone containers). The current FIXED `wiki-root` template is hardcoded in
  `buildTraversal` (`src/main/traversal.ts`); making it a stored, customizable
  value is pure host-side work (no engine change).
- **The `code.*` CRUD rides the existing `code` group:** the foundation already
  gates envelope-editing tools under the `code` group (`security.ts`
  TOOL_GROUPS: `provident.code.get/set/create/delete/validate/load/loadBatch`),
  and the `rag.*`/`edit.*` main-handled pattern (Unit B §5.3) is the exact
  template for a group of main-handled tools that call a main-process store. The
  template store is a second main-process store (like the RAG store), so the
  `code.template.*` tools are main-handled against it, exactly like `rag.*`/
  `edit.*` against the RAG store.
- **The template-editor pane follows Unit H authoring:** a `PaneDefinition`
  (`scope: 'app-graph'`) whose `render(ctx)` returns a `LegacyNodeData` content
  root, wrapped by `paneSubtreeRoot` (authored id `pane-<id>` +
  `targetPlacement: ['sidebar']`), authored into the pane-inclusive app-graph
  envelope via `assembleAppGraphEnvelope` (Unit H §5.2). Because it is an
  app-graph pane, it is MCP-visible by construction (its handlers are
  dispatchable via `provident.dispatch`; the `code.template.*` tools are the
  agent's parallel path) — satisfying the §8.2 BINDING equivalence.
- **The whole-graph re-derive reuses the existing render path:** the renderer
  already re-traverses on `rag-store-changed` (Unit D §5.1.9). A `template-changed`
  broadcast triggers the SAME re-derive, but `buildTraversal` is passed the
  stored `ContentWindowTemplate` as the envelope's `template` (instead of the
  default). No new render path.

No engine/foundation gap blocks this unit. The template store, the template CRUD,
the template-editor pane, the traversal template-input, and the zone-consistency
validation are all project-specific (compose `translateLegacy`/`renderProducingProcess`/
`assembleAppGraphEnvelope`). ENG-GAP-1 (MarkdownAdapter `data-node-id`, D7) is
SHELVED 2026-08-26 (markdown is export-only; the host-side line→node map covers
it — see `docs/pending.md`).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The content-window template as a stored, customizable value | Project-specific (the template IS `LegacyInitialData.template`; no engine change) | Low cost; the original request's "customizable content-window template". |
| The host-side template store | Project-specific (mirrors the RAG store's `node:fs` persistence) | Low cost; a second main-process store. |
| The `code.template.*` CRUD surface | Project-specific (mirrors the `rag.*`/`edit.*` main-handled pattern, Unit B §5.3) | Low cost; rides the existing `code` group + five-seam gate. |
| The provident-rendered template-editor pane | Project-specific (Unit H `PaneDefinition` authoring) | Low cost; an app-graph pane → MCP-visible by construction. |
| The whole-graph re-derive after a template change | Project-specific (a `template-changed` broadcast reusing the Unit D re-traversal) | Low cost; infrequent (review §4 item 9). |
| The zone-consistency validation | Project-specific (a pure `validateTemplate` over the template + the targeted zones) | Low cost; closes the Unit C HARD PRECONDITION. |

No engine gap. ENG-GAP-1 is SHELVED 2026-08-26 (markdown is export-only;
markdown-parsing-to-storage will use text-match diffing — see
`docs/pending.md`).

### 3a. Adversarial findings

Post-green adversarial pass (RCA-3) 2026-08-28. All findings are HOST (this
repo's `src/`); none are package/upstream findings (no `provident-ssr` defect
was exposed — the Unit I code composes existing engine surfaces). Each host
finding is fixed + regression-tested (6 regression tests in
`tests/template-adversarial.test.ts`). No unauthorized-access finding: the six
`code.template.*` names map to the `code` group (default-off), the renderer
switch has no `code.template.*` cases (fail-closed `unknown method`), and
`MUTATING_METHODS` correctly excludes the mutating `code.template.*` tools.

**MEDIUM:**
- **I3** — the IPC `bridge.template.validate` payload shape broke MCP/UI
  equivalence: `preload.ts` sent the raw `tpl` as the IPC payload, but
  `handleTemplateTool` reads `args.template`, so `args.template` was
  `undefined` → `invalid-shape`, while the MCP `code.template.validate` (zod
  `{ template: z.unknown().optional() }`) passed `{ template: tpl }` and worked.
  Fixed: `validate` now wraps the template like `set` does
  (`ipcRenderer.invoke(IPC_TEMPLATE_VALIDATE, { template: tpl })`).
  Regression-tested.

**LOW:**
- **I4** — `get()` returned a top-level shallow copy that shared the nested
  `root`, so a caller could mutate the store's internal template through
  `get()`, bypassing the zone-consistency validation. Fixed: `get()` returns
  `deepCopy(current)` (the same safe deep-copy discipline used on write).
  Regression-tested.
- **I5** — the `readonly targetedZones` property returned the internal array
  directly, so a caller could `store.targetedZones.push('x')` and change which
  zones `set`/`delete`/`validate` enforce. Fixed: the accessor returns a copy
  (`[...targetedZones]`). Regression-tested.

**Deferred to the UI mount (the `SidebarPanes` renderer host — Unit H §3a):**
- **I1** — the `template-changed` whole-graph re-derive is not wired in the
  renderer: after a mutating template op, main broadcasts `IPC_TEMPLATE_CHANGED`
  but `renderer.ts` has no `bridge.template.onTemplateChanged` subscription, so
  the content-window keeps rendering the old template. The §5.5 re-derive
  (fetch snapshot → `buildTraversal` with the stored template →
  `assembleAppGraphEnvelope` → app Runtime re-render) is a renderer-surface
  host concern that lands with the UI mount (mirroring the `rag-store-changed`
  re-traversal path).
- **I2** — the template-editor pane is authored but never registered/wired into
  the app-graph: `createTemplateEditorPane()` is not registered in a pane
  registry, `assembleAppGraphEnvelope` is not called in the renderer, and the
  pane's four handlers are not bound to the template IPC bridge. The pane
  registration + MCP-visibility + handler binding is the `SidebarPanes` renderer
  host (Unit H §3a deferral), which lands with the UI mount.

## 4. Design decisions pinned by this spec

- **CONTENT-WINDOW-TEMPLATE:** the content-window template IS the
  `LegacyInitialData.template` shape (`{ root: LegacyNodeData }`), the field
  that defines the content-window layout (the root structure + the container
  zones) for rendering a retrieved document. The default
  (`DEFAULT_CONTENT_WINDOW_TEMPLATE`) is the current FIXED `wiki-root` + one
  `main` zone container (the Unit C baseline, `src/main/traversal.ts`). A
  customized template replaces it.
- **TEMPLATE-STORE:** a host-side main-process `createTemplateStore` persists
  the current `ContentWindowTemplate` (a JSON file, `node:fs` atomic temp+rename,
  fail-disabled boot to the default). It is SEPARATE from the RAG store — the
  template is NOT RAG content (it is the envelope's `template`, not a
  document-graph node/edge).
- **CODE-GROUP-TEMPLATE-CRUD:** the template CRUD is exposed as the
  `code.template.*` tools (`get`/`validate`/`set`/`create`/`delete`/`reset`),
  ALL in the `code` group (default-off), main-handled against the template store
  through the five-seam gate (Unit B §5.3 pattern). Editing the template is a
  `code`-group op — consistent with the gate line 60 ("`code.*` CRUD") and with
  the existing `provident.code.*` envelope-editing group.
- **TEMPLATE-PANE:** a provident-rendered `scope: 'app-graph'` template-editor
  pane (`id: 'template-editor'`) follows the Unit H authoring convention. It
  renders the current template structure (the root + the zones) as editable
  provident content and commits edits via the template IPC (the SAME template
  store the `code.template.*` MCP tools reach). Being app-graph, it is
  MCP-visible: an agent reads it via `get_rendered_html`/`get_markdown` and
  dispatches its handlers via `provident.dispatch`, OR drives the
  `code.template.*` tools directly (§8.2 equivalence).
- **ZONE-CONSISTENCY-INVARIANT:** a customized template MUST NOT drop a
  `container`-role producer for a zone the traversal targets (the Unit C HARD
  PRECONDITION — a missing container leaves the content `unplaced`, silently not
  render-eligible). Enforced at TWO layers: (a) save-time validation
  (`validateTemplate` + the store's `set`/`create`/`delete`) REJECTS a template
  missing a targeted zone and forbids deleting a targeted zone; (b) the traversal
  (`buildTraversal`) defense-in-depth ADDS a missing `zoneName` producer (never
  leaves the subtree unplaced), mirroring Unit H's sidebar-producer behavior.
- **TEMPLATE-RE-DERIVE:** a template change (via the MCP `code.template.*` tools
  OR the UI template IPC) writes the template store, then main broadcasts
  `template-changed` → the renderer re-derives the whole graph:
  `buildTraversal` (with the stored template) → `assembleAppGraphEnvelope` →
  the app Runtime re-render. Infrequent, so the whole-graph cost is acceptable
  (review §4 item 9).
- **FORM-CONTROL-EDITING-INTEGRATION (consumed):** the template-editor pane's
  controls are form controls (Unit D). A dirty edit guards the re-derive (queues
  it while a control is dirty). The pane's commits go to the TEMPLATE store (via
  `bridge.template.*`), NOT the RAG `edit.*` path — the template is not RAG
  content (mirroring the settings pane's operator-IPC model, but app-graph
  MCP-visible).
- **SINGLE-WRITER-STORE (consumed):** the template store is main-process; the
  renderer never writes it directly (the template-editor pane commits over IPC).
  The MCP `code.template.*` tools and the UI IPC both route through the same
  main-process store (MCP/UI equivalence, §8.2).

## 5. The exhaustive contract

### 5.1 The content-window template shape + the default

```ts
// src/main/template-store.ts (project-specific; pure, no Electron — importable
// in main and renderer).

/** The content-window template — the `LegacyInitialData.template` shape that
 *  defines the content-window layout for rendering a retrieved document (the
 *  root structure + the container zones). This is the envelope's `template`
 *  field (Unit C §5.2) that `buildTraversal` emits. */
export interface ContentWindowTemplate {
  /** The content-window root node (e.g. the `wiki-root` div). Its DIRECT
   *  children are the zone container producers (each a `container`-role node
   *  carrying `placement.placementName`). */
  root: LegacyNodeData
}

/** The DEFAULT content-window template — the current FIXED `wiki-root` +
 *  per-zone containers (the Unit C baseline, `src/main/traversal.ts`). It
 *  offers ONE zone: `main`. */
export const DEFAULT_CONTENT_WINDOW_TEMPLATE: ContentWindowTemplate = {
  root: {
    type: 'div',
    props: { id: 'wiki-root' },
    children: [
      { type: 'div', props: { id: 'zone:main' }, placement: { placementName: 'main' } },
    ],
  },
}
```

**Shape rules (the `ContentWindowTemplate`):**

1. `root` is a `LegacyNodeData` — it MUST have a `type` and a `props.id`. The
   root's DIRECT children are the zone container producers.
2. A **zone container producer** is a child node of `root` with
   `placement.placementName: <zoneName>` (a `container`-role producer, the Unit C
   HARD PRECONDITION). Its `props.id` is conventionally `zone:<zoneName>` (not
   enforced, but the default uses it).
3. The default offers exactly ONE zone: `main` (`zone:main`).
4. A customized template REPLACES the default — it may change the root `type`/
   `id` and add/remove non-targeted zones, but MUST keep a `container`-role
   producer for every targeted zone (the zone-consistency invariant, §5.6).

### 5.2 The template store (`createTemplateStore`)

A host-side main-process store, SEPARATE from the RAG store. PURE (no Electron)
logic over a `node:fs` JSON file. The renderer never writes it directly (the
template-editor pane commits over IPC; the MCP `code.template.*` tools write via
the main-process handler).

```ts
// src/main/template-store.ts.

export interface TemplateStoreOptions {
  /** The JSON file the template persists to (usually in userData). */
  path: string
  /** The zones the traversal targets — the content-window zones a customized
   *  template MUST keep a `container`-role producer for (the
   *  ZONE-CONSISTENCY-INVARIANT). Default `['main']` (the traversal's
   *  `zoneName`). A customized template may add OTHER zones, but these cannot
   *  be dropped. */
  targetedZones?: string[]
}

export type TemplateSource = 'default' | 'custom'

export interface TemplateStatus {
  /** 'default' (no customization) or 'custom' (a saved custom template). */
  source: TemplateSource
}

export interface TemplateStore {
  /** Read the current content-window template (a DEEP copy — never the
   *  internal record; a caller mutating the returned template cannot mutate
   *  the store, bypassing the zone-consistency validation — the I4 fix). */
  get(): ContentWindowTemplate
  /** Replace the content-window template. VALIDATES it against the store's
   *  targetedZones BEFORE persisting — an invalid template (missing a targeted
   *  zone, or a malformed shape) is REJECTED (throws; the store is unchanged).
   *  On success persists + sets source='custom'. Returns the stored template. */
  set(tpl: ContentWindowTemplate): ContentWindowTemplate
  /** Restore the DEFAULT template (source='default'), persist, return it. */
  reset(): ContentWindowTemplate
  /** The template source. */
  status(): TemplateStatus
  /** The traversal-targeted zones the template MUST keep a `container`-role
   *  producer for (the ZONE-CONSISTENCY-INVARIANT). Read by `set` (validation)
   *  and by the `code.template.validate` tool. */
  readonly targetedZones: string[]
}

export function createTemplateStore(opts: TemplateStoreOptions): TemplateStore
```

**Return-shape / behavior rules:**

- `get()` returns a **deep copy** of the current template (never the internal
  record — a caller mutating the returned template cannot mutate the store,
  bypassing the zone-consistency validation; the I4 adversarial fix).
- `set(tpl)` calls `validateTemplate(tpl, this.targetedZones)` first. On
  `{ ok: false }` it throws (see §5.9); on `{ ok: true }` it persists the
  template to the JSON file and sets `source = 'custom'`, then returns the
  stored template.
- `reset()` restores `DEFAULT_CONTENT_WINDOW_TEMPLATE`, persists, sets
  `source = 'default'`, returns it.
- `status()` returns a fresh `TemplateStatus`.

**Throws:** `createTemplateStore` throws
`Error('template store: path required')` if `opts` is null/undefined or
`opts.path` is not a non-empty string. It does NOT throw on a corrupt/missing
file (fail-disabled boot — see §5.7).

**Persistence (the module-store/RAG-store discipline, §5.7):**

- The template persists to a single JSON file at `opts.path`:
  `{ version: 1, source: TemplateSource, template: ContentWindowTemplate }`.
- **Atomic write:** every mutation writes via temp + rename
  (`${opts.path}.tmp` → `opts.path`), 2-space indent. A crash mid-write never
  leaves a truncated file.
- **Fail-disabled boot:** a missing file boots to `DEFAULT_CONTENT_WINDOW_TEMPLATE`
  with `source: 'default'`. A file that fails `JSON.parse`, is not an object, has
  a non-`1` `version`, or whose `template` fails the §5.6 shape check also boots
  to the default (`source: 'default'`) — **never throws, never hard-fails the
  app**. A malformed saved template never boots a broken graph (it is discarded
  for the default).
- **Hash-verification is NOT applied to the template** (unlike the RAG node/edge
  records, Unit A §5.7): the template is a single small authored object, and a
  corrupt file is caught by fail-disabled boot. This is a documented asymmetry,
  not a defect.

### 5.3 The `code.template.*` CRUD surface + the five-seam gate

The template CRUD is exposed as the `code.template.*` tools, ALL in the `code`
group (default-off), main-handled against the template store. This is the gate's
"`code.*` CRUD" (review §4 item 9 / line 60) realized as a main-handled surface,
mirroring the `rag.*`/`edit.*` main-handled pattern (Unit B §5.3).

**The five-seam gate (which group / default state / read vs mutating):**

- **Group:** the `code` group for ALL six tools. `code` is NOT in
  `defaultSecurityConfig()` (`{ token: null, enabled: ['read', 'dispatch'] }`),
  so the template CRUD is **default-off**. (An agent must have `code` enabled to
  read or edit the template via the tools. The template-editor pane remains
  MCP-visible for READ via the `read`-group `get_rendered_html`/`get_markdown`
  regardless; the `code` group gates the STRUCTURED template CRUD tools.)
- **Read-only vs mutating:** `code.template.get` + `code.template.validate` are
  READ-ONLY (they do not mutate the store). `code.template.set` + `create` +
  `delete` + `reset` are MUTATING (each persists + broadcasts `template-changed`
  → whole-graph re-derive).

**Seam 1 — `src/main/security.ts` TOOL_GROUPS:**

- Add to `TOOL_GROUPS` (all → `'code'`):
  `'code.template.get'`, `'code.template.validate'`, `'code.template.set'`,
  `'code.template.create'`, `'code.template.delete'`, `'code.template.reset'`.
- `groupForTool`/`toolAllowed` work unchanged (exact-name static lookup). A
  `code.template.*` tool is callable only when the `code` group is enabled.
- `defaultSecurityConfig()` stays `{ token: null, enabled: ['read', 'dispatch'] }`
  (the `code` group is NOT enabled by default).
- `VALID_GROUPS` already contains `'code'` (no change).

**Seam 2 — `src/main/mcp-server.ts` ALL_TOOLS + registerTools:**

- Add the six `code.template.*` names to `ALL_TOOLS`.
- `registerTools` handles the `code.template.*` tools **in MAIN** (like
  `module.*`/`rag.*`/`edit.*`), calling the main-process template store — NEVER
  routed to the renderer. The tools depend on the `TemplateStore` (a concrete
  main-process store, injected via the server options like `ragStore`). A tool
  registers ONLY when its group (`code`) is allowed (the existing
  `registeredToolNames` gate).
- **Main-handled branch:** in the `registerTools` handler, add a
  `name.startsWith('code.template.')` branch (before the renderer
  `backend.invoke` fallthrough) that calls `handleTemplateTool(templateStore,
  name, args)` and broadcasts `template-changed` after a successful mutation
  (see §5.5). A missing template store → the handler throws `${name}: no
  template store configured`.
- `ProvidentMcpServerOptions` gains `templateStore?: TemplateStore` (injected
  like `ragStore`).

**Seam 3 — `src/shared/types.ts` RpcMethod:**

- Add to the `RpcMethod` union: `'code.template.get'`, `'code.template.validate'`,
  `'code.template.set'`, `'code.template.create'`, `'code.template.delete'`,
  `'code.template.reset'`. (Main-handled tools still declare their method names
  here for the shared IPC contract, like the `rag.*`/`edit.*` methods.)

**Seam 4 — renderer switch (`src/renderer/renderer.ts` `handleRequest`):**

- **Negative contract:** the `code.template.*` tools are main-handled and NEVER
  reach the renderer switch (intercepted in `mcp-server.ts`). The switch needs
  NO new cases. A `code.template.*` method that somehow reaches the renderer hits
  the `default` branch and throws `unknown method` (fail-closed).

**Seam 5 — `MUTATING_METHODS` (`src/renderer/renderer.ts`):**

- **Negative contract:** the mutating `code.template.*` tools are main-handled
  and do NOT mutate the renderer graph; they are NOT added to the renderer's
  `MUTATING_METHODS` (which drives the app-graph-changed push for the RENDERER
  graph). The template-store mutation is announced by the `template-changed`
  broadcast, not the renderer push. Documented so a future agent does not
  misclassify them.

**Tool schemas (zod, mirroring the `registerTools` pattern):**

| Tool | Group | Input schema (zod) | Return / Effect |
| --- | --- | --- | --- |
| `code.template.get` | `code` (read-only) | `{}` | `{ source: TemplateSource, template: ContentWindowTemplate }` — the current template + source. |
| `code.template.validate` | `code` (read-only) | `{ template: z.unknown().optional() }` | `TemplateVerdict` — validates the proposed `template` against the store's `targetedZones`. No mutation. |
| `code.template.set` | `code` (mutating) | `{ template: z.unknown() }` | Validates + persists the template (source='custom'), broadcasts `template-changed`, returns `{ source: 'custom', template }`. |
| `code.template.create` | `code` (mutating) | `{ zone: z.string(), id: z.string().optional() }` | Adds a `container`-role producer for `zone` to the current template's root children (id defaults `zone:<zone>`), validates the result, persists, broadcasts, returns `{ source, template }`. |
| `code.template.delete` | `code` (mutating) | `{ zone: z.string() }` | Removes the `container`-role producer for `zone` from the current template. A TARGETED zone (`zone` ∈ store.targetedZones) CANNOT be removed (the zone-consistency invariant) → throws. Persists + broadcasts on success. |
| `code.template.reset` | `code` (mutating) | `{}` | Restores the default template, persists, broadcasts, returns `{ source: 'default', template }`. |

**The shared main-process handler (MCP/UI equivalence):**

```ts
// src/main/mcp-server.ts.

export function handleTemplateTool(
  templateStore: TemplateStore | null,
  name: string,
  args: Record<string, unknown>,
  onTemplateChanged?: (payload: TemplateChangedPayload) => void,
): unknown
```

`handleTemplateTool` is the thin validator that calls the template store and, on
a successful MUTATING op (`set`/`create`/`delete`/`reset`), invokes
`onTemplateChanged({ source, template })` (which the caller wires to a
`IPC_TEMPLATE_CHANGED` broadcast). The MCP `code.template.*` tools call it via
the `registerTools` main-handled branch; the UI IPC handlers call it with the
SAME store (mirroring `handleRagQueryIpc`/`handleRagBacklinksIpc`) so the two
surfaces are equivalent (§8.2).

**`create`/`delete` orchestration (pinned):** the `TemplateStore` interface
(§5.2) is only `get`/`set`/`reset`/`status`. The `code.template.create` and
`code.template.delete` tools are ORCHESTRATED in `handleTemplateTool`: read the
current template (`get()`), add/remove the zone's container producer, then call
`store.set(modifiedTemplate)` — which runs `validateTemplate` and REJECTS an
invalid result (a `create` of an already-present zone or a `delete` of a
targeted zone fails via the resulting validation or an explicit pre-check). This
keeps ALL writes on the single validated `set` path.

### 5.4 The template-editor pane + the IPC surface + the renderer's template bridge

**The template-editor pane (`src/renderer/template-pane.ts`, a PURE module — no
Electron):**

```ts
// src/renderer/template-pane.ts (project-specific; pure, no Electron).

/** The template-editor pane's render context: the Unit H PaneContext PLUS the
 *  current content-window template + the traversal-targeted zones. */
export interface TemplatePaneContext extends PaneContext {
  /** The current content-window template (fetched over the template IPC). */
  template: ContentWindowTemplate
  /** The zones the traversal targets (the zones that cannot be dropped — the
   *  ZONE-CONSISTENCY-INVARIANT). Default `['main']`. */
  targetedZones: string[]
}

/** The template-editor pane definition. `scope: 'app-graph'` (MCP-visible).
 *  `render(ctx)` authors the template's structure as editable provident content
 *  (a LegacyNodeData content root). */
export const TEMPLATE_PANE_ID = 'template-editor'

export function createTemplateEditorPane(): PaneDefinition<TemplatePaneContext>
```

**`render(ctx)` output (pinned):** the pane authors a `section`/`ul` subtree
describing the current template:

- One read-only row for the template ROOT: `type` + `props.id`
  (`props['data-template-root-id'] = <root.id>`).
- One row per zone container producer (the template's `root.children` with a
  `placement.placementName`): a `li` carrying
  `props['data-template-zone'] = <zoneName>` + `props['data-targeted'] = 'true'`
  when the zone is in `ctx.targetedZones`. Each zone row has a `template-zone-remove`
  handler (a UI control that is DISABLED for a targeted zone).
- An `input` (`props.id = 'template-zone-input'`) + a `template-zone-add`
  handler (adds the input's value as a zone).
- A `template-reset` handler (restores the default template).
- A `template-save` handler (commits the current edited template).
- Empty template (no zone producers) → the zone list renders `(no zones)`.

**Handlers (pinned — all call the template IPC bridge, NEVER an MCP tool and
NEVER the RAG `edit.*` path):**

- `template-zone-add` → `bridge.template.create(zone)` (the input value).
- `template-zone-remove` → `bridge.template.delete(zone)`; a TARGETED zone's
  remove is disabled (a targeted-zone delete would reject — §5.9.5).
- `template-reset` → `bridge.template.reset()`.
- `template-save` → `bridge.template.set(editedTemplate)`.

The pane's controls are form controls (Unit D): a dirty edit guards the re-derive
(§5.5 step 5). The pane is authored via `paneSubtreeRoot` (§5.2 happy path 13), so
its authored id is `pane-template-editor` and its `targetPlacement` is
`['sidebar']`.

**MCP-visible (pinned):** being `scope: 'app-graph'`, the pane's subtree is
authored into the pane-inclusive app-graph envelope (Unit H §5.2) → the app
Runtime renders it → `get_rendered_html`/`get_markdown` include it, `list_targets`
lists it, and `provident.dispatch` can drive `template-zone-add`/
`template-zone-remove`/`template-reset`/`template-save` (the §8.2 equivalence —
an agent can dispatch the pane's save OR call the `code.template.*` tools; both
reach the same template store + re-derive).

**New IPC channels (`src/shared/types.ts`):**

```ts
export const IPC_TEMPLATE_GET     = 'provident:template:get'
export const IPC_TEMPLATE_VALIDATE = 'provident:template:validate'
export const IPC_TEMPLATE_SET     = 'provident:template:set'
export const IPC_TEMPLATE_CREATE  = 'provident:template:create'
export const IPC_TEMPLATE_DELETE  = 'provident:template:delete'
export const IPC_TEMPLATE_RESET   = 'provident:template:reset'
/** The main→renderer template-change broadcast (the whole-graph re-derive
 *  trigger, §5.5). Payload carries the current template so the renderer
 *  re-derives without a follow-up fetch. */
export const IPC_TEMPLATE_CHANGED = 'provident:template-changed'
export interface TemplateChangedPayload {
  source: TemplateSource
  template: ContentWindowTemplate
}
```

- The renderer→main `code.template.*`-equivalent IPC channels
  (`IPC_TEMPLATE_GET`/`VALIDATE`/`SET`/`CREATE`/`DELETE`/`RESET`) are handled in
  `src/main/main.ts` by delegating to `handleTemplateTool` with the SAME
  template store (MCP/UI equivalence — §8.2 a BINDING constraint). The renderer
  never computes template CRUD itself.
- The IPC handlers map to the same tool names as the MCP tools:
  `IPC_TEMPLATE_GET` → `code.template.get`, `IPC_TEMPLATE_VALIDATE` →
  `code.template.validate`, `IPC_TEMPLATE_SET` → `code.template.set`,
  `IPC_TEMPLATE_CREATE` → `code.template.create`, `IPC_TEMPLATE_DELETE` →
  `code.template.delete`, `IPC_TEMPLATE_RESET` → `code.template.reset`.
- The mutating IPC handlers broadcast `IPC_TEMPLATE_CHANGED` on success (via the
  same `onTemplateChanged` wiring as the MCP tools).
- **The IPC surface is NOT group-gated** (the renderer is a trusted surface that
  calls main directly, like the existing `edit-commit`/`rag-snapshot` IPC). The
  `code` group gates the MCP agent path; the UI template-editor pane is not
  blocked by the tool group (the pane is MCP-visible for READ, and its commit
  handlers drive the IPC directly).

**The preload bridge (`src/main/preload.ts`) — the `template` namespace:**

```ts
export interface ProvidentBridge {
  // ...existing surfaces...
  template: {
    get(): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    validate(tpl: unknown): Promise<TemplateVerdict>
    set(template: unknown): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    create(zone: string, id?: string): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    delete(zone: string): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    reset(): Promise<{ source: TemplateSource; template: ContentWindowTemplate }>
    /** Subscribe to the template-change re-derive trigger. Returns an
     *  unsubscribe function. */
    onTemplateChanged(handler: (payload: TemplateChangedPayload) => void): () => void
  }
}
```

### 5.5 The whole-graph re-derive (trigger + sequencing)

**Sequencing after a template change (pinned):**

1. A MUTATING template op runs: the MCP `code.template.set`/`create`/`delete`/
   `reset` tool OR the UI `bridge.template.set`/`create`/`delete`/`reset` IPC.
   Main calls `handleTemplateTool`, which writes the new template to the
   template store (main-process, single-writer).
2. On success, main broadcasts `IPC_TEMPLATE_CHANGED`
   (`{ source: TemplateSource, template: ContentWindowTemplate }`) to the
   renderer.
3. The renderer's `template-changed` handler re-derives the WHOLE graph:
   - fetches the RAG snapshot (`bridge.rag.snapshot()`) — the renderer has no
     store access (SINGLE-WRITER-STORE);
   - calls `buildTraversal({ store: <snapshot adapter>, documentIds, zoneName,
     template: payload.template })` (Unit C) → the new envelope + back-reference
     map + line map + crosslinks;
   - re-assembles the pane-inclusive app-graph envelope
     (`assembleAppGraphEnvelope`, Unit H §5.2);
   - re-loads it into the app Runtime (`runtime.loadEnvelope`) → re-render.
4. The re-derive REUSES the existing Unit C traversal + Unit H assembly + the
   Unit D §5.1.9 re-traversal path. NO new render path.
5. **Whole-graph cost is acceptable** because template edits are infrequent
   (review §4 item 9 / line 60).

**Re-derive guard (pinned, Unit D form-control integration):** if a
template-editor control is DIRTY (uncommitted), the re-derive is QUEUED (not
executed) until the control is clean — the same dirty-edit guard as Unit D
§5.2. A `template-changed` broadcast while a control is dirty queues the
re-derive behind the commit.

**MCP/UI equivalence (pinned):** the MCP `code.template.*` tool and the UI IPC
for the SAME op reach the SAME template store and trigger the SAME re-derive.
The re-derived graph is identical through both surfaces (§8.2).

### 5.6 The zone-consistency invariant

**The invariant (pinned):** a customized `ContentWindowTemplate` MUST keep a
`container`-role producer (a child of `root` with `placement.placementName`) for
every zone the traversal targets (the Unit C HARD PRECONDITION — a missing
container leaves the content `unplaced`, silently not render-eligible).

**The validation (`validateTemplate`):**

```ts
// src/main/template-store.ts.

export type TemplateVerdict =
  | { ok: true }
  | { ok: false; reason: 'invalid-shape' | 'missing-zone'; detail: string; zones: string[] }

/** Validate a content-window template against the targeted zones. A template
 *  that is malformed (`invalid-shape`) or that drops a container producer for a
 *  targeted zone (`missing-zone`) is INVALID. PURE. */
export function validateTemplate(tpl: unknown, zones: string[]): TemplateVerdict
```

**Validation rules** (`validateTemplate(tpl, zones)`):

1. **`invalid-shape`:** if `tpl` is null/undefined, not an object, or its `root`
   is missing / not an object / lacks a `type` / lacks a `props` object, the
   verdict is `{ ok: false, reason: 'invalid-shape', detail: <what failed>,
   zones }`.
2. **`missing-zone`:** for every zone in `zones`, the template's `root.children`
   MUST include a child with `placement.placementName === zone` (a
   `container`-role producer). If any targeted zone is missing a producer, the
   verdict is `{ ok: false, reason: 'missing-zone', detail: 'missing container
   for zone "<zone>"', zones }`. `root.children` missing/non-array is treated as
   an empty set → `missing-zone` for every zone.
3. **Happy path:** if the shape is valid AND every targeted zone has a
   `container`-role producer, the verdict is `{ ok: true }`.
4. **Throws:** `validateTemplate` with a null/undefined `zones` argument (not an
   array) → throws `Error('validateTemplate: zones required')` (a malformed input
   is a caller error, never a silent pass).

**Enforcement (two layers, pinned):**

- **Layer 1 — save-time (the template store):** `createTemplateStore` is created
  with the store's `targetedZones` (default `['main']`). The store's `set` calls
  `validateTemplate(tpl, targetedZones)` and REJECTS an invalid template (throws
  the verdict). `delete` FORBIDS removing a zone ∈ `targetedZones` (throws). So a
  user/agent cannot SAVE a template that drops a targeted zone.
- **Layer 2 — traversal defense-in-depth:** `buildTraversal` (Unit C) ENSURES the
  `zoneName` producer exists in the (custom or default) template's root — if the
  template lacks it, the traversal ADDS it (never leaves the subtree unplaced),
  mirroring Unit H's `assembleAppGraphEnvelope` sidebar-producer behavior
  (Unit H §5.2 step 4).

### 5.7 Traversal integration (`src/main/traversal.ts` amendment)

`TraversalInput` gains an optional template:

```ts
export interface TraversalInput {
  store: RagStore
  documentIds: string[]
  zoneName: string
  /** Unit I — the content-window template. When provided, the envelope's
   *  `template` is built from it (replacing the default); when absent, the
   *  default `DEFAULT_CONTENT_WINDOW_TEMPLATE` is used. The traversal ENSURES
   *  the `zoneName` container producer exists (adding it if the template lacks
   *  it — the zone-consistency defense-in-depth, §5.6). */
  template?: ContentWindowTemplate
}
```

**`buildTraversal` template behavior (pinned):**

1. The envelope's `template` is the provided `input.template` when present,
   else `DEFAULT_CONTENT_WINDOW_TEMPLATE`.
2. The traversal ENSURES the `zoneName` producer exists: if the (custom) template
   root's DIRECT children already include a child with
   `placement.placementName === zoneName`, it is kept; otherwise the traversal
   ADDS `{ type: 'div', props: { id: `zone:${zoneName}` }, placement: { placementName: zoneName } }`
   to the root's children. It MUST NOT emit a `targetPlacement` naming a zone it
   does not also produce a container for (Unit C §5.2 rule 1) — this is what the
   defense-in-depth guarantees.
3. The content roots (one `ContentPayload` per RAG subtree) still target
   `zoneName` via `targetPlacement: [zoneName]` (unchanged — Unit C §5.2). A
   customized template's OTHER zones (beyond `zoneName`) are for other content
   (e.g. the `sidebar` zone added by the Unit H assembler) and are left as-is.
4. **No change** to the back-reference map construction, the line→node map, the
   doc-child nesting, the multi-parent duplicate, the doc-flow validation +
   fallback, or the crosslink wiring (Unit C §5.1-§5.6 all unchanged).
5. **The existing null-input throw is unchanged** (Unit C §5.1 / §5.8.1).

### 5.8 Happy-path states (TestWriter red set — valid paths)

1. **Default template read:** a fresh `createTemplateStore({ path, targetedZones: ['main'] })`
   with no persisted file → `get()` returns `DEFAULT_CONTENT_WINDOW_TEMPLATE`
   (one `main` zone); `status()` = `{ source: 'default' }`.
2. **`validateTemplate` happy:** a well-formed template with a `main` container
   producer, validated against `['main']` → `{ ok: true }`.
3. **`validateTemplate` extra zone:** a template with the `main` producer PLUS an
   extra `aside` zone, validated against `['main']` → `{ ok: true }` (extra zones
   are allowed).
4. **`set` happy:** `set(aValidCustomTemplate)` → persists, `status()` =
   `{ source: 'custom' }`, returns the stored template; a subsequent `get()`
   returns it.
5. **`reset` happy:** after a custom `set`, `reset()` → restores
   `DEFAULT_CONTENT_WINDOW_TEMPLATE`, `status()` = `{ source: 'default' }`.
6. **`create` of a NEW zone:** `create('aside')` (a non-targeted zone not yet in
   the template) → adds the `zone:aside` container producer, persists, returns
   the updated template. **Complement:** `create('main')` (an already-present
   zone) is a FAIL-state (§5.9.8).
7. **`delete` of a NON-targeted zone:** `delete('aside')` where `aside` is not in
   `targetedZones` → removes the `aside` producer, persists, returns the updated
   template. **Complement:** `delete('main')` where `main` ∈ `targetedZones` is a
   FAIL-state (§5.9).
8. **`code.template.get` happy:** with the `code` group enabled, the tool returns
   `{ source, template }`; with `code` DISABLED it is not registered/callable
   (`toolAllowed` false).
9. **MCP/UI equivalence (get):** `code.template.get` (MCP) and
   `bridge.template.get()` (IPC) return the same `{ source, template }` from the
   SAME template store.
10. **MCP/UI equivalence (mutate + re-derive):** `code.template.set(tpl)` (MCP)
    and `bridge.template.set(tpl)` (IPC) each write the same template store,
    broadcast `template-changed`, and the renderer re-derives the SAME
    pane-inclusive envelope.
11. **Traversal with a custom template:** `buildTraversal({ ..., template:
    customTpl })` → the envelope's `template` is `customTpl` (with the `zoneName`
    producer present); the content roots render in the `zoneName` zone.
12. **Traversal defense-in-depth:** `buildTraversal` with a custom template that
    LACKS the `zoneName` producer → the traversal ADDS the producer (the subtree
    is NOT left unplaced; the content renders).
13. **Template-editor pane authored (Unit H):** the `template-editor` pane
    (`scope: 'app-graph'`) is registered in the pane registry; its `render(ctx)`
    returns a content root; `paneSubtreeRoot` wraps it with
    `props.id = 'pane-template-editor'` + `targetPlacement: ['sidebar']`.
14. **Template-editor pane MCP-visible (equivalence):** after `loadAppGraph`, the
    pane subtree is in the app Runtime → `get_rendered_html`/`get_markdown`
    include it, `list_targets` lists it, `dispatch` can target a pane handler
    (e.g. `template-save`).
15. **Re-derive via IPC:** `bridge.template.set(...)` → the pane + content-window
    re-render with the new template; the app-graph panes stay MCP-visible (their
    `data-*` payloads re-materialize, Unit H §5.5).
16. **Dirty-edit guard:** a `template-changed` broadcast while a template-editor
    control is dirty QUEUES the re-derive until the control is clean (Unit D
    §5.2).

### 5.9 Fail-states (TestWriter red set — documented fail-states)

1. **`createTemplateStore` with null/undefined opts or empty path** → throws
   `Error('template store: path required')`.
2. **Corrupt/missing template file boot:** a file that fails `JSON.parse`, is not
   an object, has a non-`1` version, or whose `template` fails the §5.6 shape
   check → boots to `DEFAULT_CONTENT_WINDOW_TEMPLATE`, `status().source =
   'default'`, NEVER throws.
3. **`set` with an `invalid-shape` template** (null, non-object, no `root`, no
   `root.type`, no `root.props`) → throws
   `Error('template set: invalid-shape — <detail>')`; the store is unchanged.
4. **`set` with a `missing-zone` template** (drops a targeted zone) → throws
   `Error('template set: missing-zone — missing container for zone "<zone>"')`;
   the store is unchanged. (The ZONE-CONSISTENCY-INVARIANT save-time layer.)
5. **`delete` of a TARGETED zone** (zone ∈ store.targetedZones) → throws
   `Error('template delete: cannot remove targeted zone "<zone>"')`; the store is
   unchanged. (The invariant forbids dropping a needed zone.)
6. **`delete` of an UNKNOWN zone** (no producer for `zone` in the template) →
   throws `Error('template delete: no zone "<zone>"')`; the store is unchanged.
7. **`create` with an empty/non-string `zone`** → throws
   `Error('template create: zone required')`.
8. **`create` of an ALREADY-PRESENT zone** (a producer for `zone` already exists)
   → throws `Error('template create: zone "<zone>" already present')`; the store
   is unchanged (no duplicate producer).
9. **`validateTemplate` with a null/undefined `zones`** (not an array) → throws
   `Error('validateTemplate: zones required')`.
10. **A `code.template.*` tool with `code` disabled** → not registered, not
    callable (`toolAllowed` returns false) — the five-seam gate's default-off
    state.
11. **A `code.template.*` tool with a null template store** → throws
    `Error('code.template.<name>: no template store configured')` (mirrors the
    `rag`/`edit` store-null fail-states).
12. **A `code.template.*` method that reaches the renderer switch** → `unknown
    method` throw (fail-closed, the Seam-4 negative contract).
13. **A mutating `code.template.*` tool with a malformed payload** (e.g.
    `code.template.set` with no `template`, `code.template.create` with no
    `zone`) → the handler throws the documented per-tool error (see the schemas
    §5.3); the store is unchanged.
14. **`get` on a store that has never been customized** → `{ source: 'default',
    template: DEFAULT_CONTENT_WINDOW_TEMPLATE }` (not a fail — the baseline).

### 5.10 Census / numeric claims

- **`ContentWindowTemplate` fields:** 1 (`root`).
- **Default template zones:** exactly 1 (`main`); the default root is
  `{ type: 'div', props: { id: 'wiki-root' }, children: [zone:main producer] }`.
- **`targetedZones` default:** `['main']` (the traversal's `zoneName`; the zones a
  customized template MUST keep).
- **Template-store methods:** 4 (`get`, `set`, `reset`, `status`) + 1 readonly
  property (`targetedZones`).
- **`TemplateVerdict` fail reasons:** 2 (`invalid-shape`, `missing-zone`) + 1
  happy path (`{ ok: true }`).
- **`code.template.*` tools:** 6 (`get`, `validate`, `set`, `create`, `delete`,
  `reset`); read-only: 2 (`get`, `validate`); mutating: 4 (`set`, `create`,
  `delete`, `reset`).
- **Five-seam additions:** TOOL_GROUPS + 6 exact names (→ `code`); ALL_TOOLS + 6;
  RpcMethod + 6; renderer switch + 0 (negative contract); MUTATING_METHODS + 0
  (negative contract).
- **Group / default state:** `code`, default-OFF (not in `defaultSecurityConfig`).
- **IPC channels:** 7 — 6 renderer→main (`IPC_TEMPLATE_GET`/`VALIDATE`/`SET`/
  `CREATE`/`DELETE`/`RESET`) + 1 main→renderer broadcast (`IPC_TEMPLATE_CHANGED`).
- **Template-editor pane:** exactly 1 (`id: 'template-editor'`, `scope:
  'app-graph'`, title "Template"), authored via `paneSubtreeRoot`
  (`props.id = 'pane-template-editor'`, `targetPlacement: ['sidebar']`).
- **`TemplatePaneContext` fields:** 2 beyond `PaneContext` (`template`,
  `targetedZones`).
- **Pane handlers:** 4 (`template-zone-add`, `template-zone-remove`,
  `template-reset`, `template-save`), all calling the template IPC bridge.
- **Re-derive outputs:** the SAME `TraversalResult` as Unit C (envelope +
  backRefs + lineMap + crosslinks) + the Unit H pane-inclusive envelope — 1 per
  template change.
- **Zone-consistency layers:** 2 (save-time validation + traversal
  defense-in-depth).

### 5.11 Cross-references

- Unit A: `docs/specs/unit-a-rag-store.md` §5.4 (the `RagStore` interface the
  traversal reads), §5.5 (single-writer queue — the template store mirrors its
  concurrency model), §5.7 (the persistence discipline: atomic temp+rename,
  fail-disabled boot, hash-verified source — the template store mirrors it
  EXCEPT hash-verification, a documented asymmetry).
- Unit B: `docs/specs/unit-b-document-model.md` §5.3 (the five-seam gate — the
  `rag.*`/`edit.*` main-handled pattern the `code.template.*` tools mirror), §5.4
  (the tool-schema + gating-behavior conventions).
- Unit C: `docs/specs/unit-c-rendering-spine.md` §5.1 (`TraversalInput`/`TraversalResult`
  — the traversal gains `input.template`), §5.2 (the envelope shape + the HARD
  PRECONDITION the zone-consistency invariant protects), §5.4 (the render path
  the re-derive reuses), §5.8 fail-state 2 (the "MUST NOT emit a targetPlacement
  without a container" rule the traversal defense-in-depth upholds).
- Unit D: `docs/specs/unit-d-editing.md` §5.1.9 (the `rag-store-changed`
  re-traversal trigger the `template-changed` re-derive parallels), §5.2 (the
  dirty-edit guard that queues a re-derive while a control is dirty), §5.6 (the
  form-control editing model the template-editor pane's controls use).
- Unit H: `docs/specs/unit-h-sidebar-panes.md` §5.1 (the `PaneDefinition` +
  `PaneRegistry` the template-editor pane registers through), §5.2
  (`paneSubtreeRoot`/`assembleAppGraphEnvelope` — the authoring + assembly the
  pane uses; the sidebar-producer addition the traversal defense-in-depth
  mirrors), §5.6 (the app-graph MCP-visibility the template pane inherits), §5.7
  (the pane-inclusive re-traversal the template re-derive reuses).
- Gate: `docs/specs/astrographer-review.md` §4 item 9 / §7 scope item 9 / line 60
  (template customization via `code.*` CRUD through a provident-rendered
  template-editor pane; whole-graph re-derive acceptable), §8.2 (MCP/UI
  equivalence — a BINDING constraint), §9.2.7 (RAG-EDIT-MCP-GROUPS — the `code`
  group is the envelope-editing surface the template CRUD rides).
- Decisions: `docs/decisions.md` rows **RAG-AUTHORITATIVE**, **SUBTREE-OWNERSHIP**,
  **FORM-CONTROL-EDITING**, **PANE-PROVIDENT-AUTHORING**,
  **APP-GRAPH-PANES-MCP-VISIBLE**, **SINGLE-WRITER-STORE**. New rows pinned by
  this spec (added when the unit lands): **CONTENT-WINDOW-TEMPLATE**,
  **TEMPLATE-STORE**, **CODE-GROUP-TEMPLATE-CRUD**, **TEMPLATE-PANE**,
  **ZONE-CONSISTENCY-INVARIANT**, **TEMPLATE-RE-DERIVE**.
- Host seams: `src/main/security.ts` (TOOL_GROUPS/`groupForTool`/`toolAllowed`/
  `defaultSecurityConfig`), `src/main/mcp-server.ts` (ALL_TOOLS/`registerTools`/
  `handleRagTool`/`handleEditTool` — the main-handled pattern), `src/main/main.ts`
  (the IPC handlers + the `backend.broadcast` re-traversal wiring), `src/main/
  preload.ts` (`ProvidentBridge` — the new `template` namespace), `src/shared/
  types.ts` (RpcMethod + the new IPC channels), `src/main/traversal.ts`
  (the `TraversalInput.template` amendment), `src/renderer/pane-registry.ts` +
  `src/renderer/pane-graph.ts` (Unit H — the pane registry + assembly the
  template-editor pane consumes).
- Engine surfaces: `translate.d.ts` (`LegacyInitialData`, `LegacyNodeData`,
  `translateLegacy`), `node.d.ts` (P3 §2.4, `compilePath` — the placement-routed
  bootstrap the template's zones enable), `graph.md` §3 (placement Link = zone
  registry).
- Upstream specs: `translate.md` §2 (contentNodes-owned content roots,
  `targetPlacement` → ordered `content` anchors, F-13), `node.md` §1.2 SI-1,
  §7.1 FS-10, `payload.md` P-4/P-5.
- Pending: `docs/pending.md` (document tabs — the multi-document render a future
  multi-zone template would support; cross-document shared nodes).
