# UI Overhaul — Spec (GATED; Wave 0 implementation in progress)

**Status:** **GATED 2026-09-11** — the three-agent umbrella proposal gate
(`docs/specs/ui-overhaul-review.md`) returned **PROCEED-WITH-AMENDMENTS**
(umbrella-only: it approves the contract + ordering; every unit still needs its
own spec + TestWriter red set, amendment A1). **Wave 0 status:** U-STATE-1
(content-only repopulation) is **COMPLETE** (`docs/specs/unit-u-state-1a..1c`,
`src/renderer/content-reconcile.ts`); the C9 carrier is decided
(`UI-CONFIG-CARRIER`); the C15 document-directory slice is **COMPLETE**
(U-D1…U-D7). This file remains the container/contract: §1 constraints C1–C20,
§2 the shell-vs-provident boundary, §3 layout/re-render/UI-config/C15, §4 the
parity census, §5 gaps, §7 decisions, §8 the dependency-ordered units.

Authoring rules this draft does NOT relax (AGENTS.md + `docs/pending.md`):
all non-shell UI MUST be provident-authored (envelope nodes / handler bodies /
hooks / component bindings) and driven through the producing graph. A UI
element rendered outside the framework is a review finding. The Electron
shell's own chrome (window frame, native menu bar, preload bridge, MCP server)
is the sole exception.

---

## 1. Top-level constraints (confirmed by the user, 2026-09-11)

| # | Constraint | Current state | Draft reading |
| --- | --- | --- | --- |
| **C1** | Light/dark mode toggle that defaults to OS theme | `index.html` follows OS via `:root { color-scheme: light dark }` + `@media (prefers-color-scheme: dark)`; **no manual toggle, no persistence** | A tri-state appearance setting (`system` \| `light` \| `dark`) defaulting to `system`; applying `system` resolves the OS preference live; an explicit choice persists and overrides. Applied as CSS custom-property tokens on the shell root; pane content reads tokens. |
| **C2** | Largest central pane reserved for the focused document/graph/etc, follows its own formatting constraints, ignoring sidebar/menu rules | `#app` is the content card; traversal content renders into the `main` zone; no formatting isolation from the shell/pane CSS | A dedicated central **content stage** zone whose content CSS is scoped (a content-scope root) so document typography/spacing is independent of sidebar/menu chrome. The stage is the largest grid cell and holds the focused document **or** graph **or** other focus target. |
| **C3** | Settings hidden by default; appear in a modal when clicking a toggle at the bottom of the left sidebar | Settings is always-rendered at the bottom as the operator `settings` pane (`registerPanes`), mounted in `#operator-panes` | A **modal layer** (shell frame/scrim) hosting the operator isolated-scope panels. Hidden by default; a fixed toggle at the bottom of the left sidebar opens it. The modal is an **isolation-system mount** — content is authored in an isolated `createIsolatedScope()` graph, so it is MCP-invisible by construction. The modal hosts **only operator-only panels** (security, operator settings, registry manage, modules, gnosis status, appearance/UI-config); **MCP-exposed app-graph panes never enter the modal**. |
| **C4** | Utility panes (wiki document list, cross-link info, search tools, assistant suggestions, etc.) have handles to drag and rearrange within the sidebar or relocate between sidebars/header/footer | Panes are assembled into one fixed `[sidebar]` zone in registration order; no handles, no reorder, no relocation | A **pane layout model** (§3): each pane carries a drag handle (pane header); panes can be reordered within a zone and relocated across `left`/`right`/`header`/`footer` zones. Placement is user preference that overrides the registry default. Pane *content* stays provident-authored; the handle/frame is shell chrome. |
| **C5** | Panes are collapsible | None | Each pane (and each pane zone) has a collapse toggle; collapsed state persists. Collapsed = header/handle only. |
| **C6** | Clickables (e.g. document names in the wiki list) highlight on mouseover to indicate clickable status | Ad-hoc; no consistent affordance | A shared hover affordance authored on clickable provident nodes (a `css.classes` token, e.g. `is-clickable`), highlighted by token-driven CSS. Applies to doc-nav items, wiki items, result rows, and every node carrying a click/select handler. |
| **C7** | Side widths can be adjusted by drag | Fixed grid (`1fr 1fr`) | Resizable gutters between the zone columns/rows; widths/heights persist. Shell chrome. |
| **C8** | Document editing has markdown/html toggle | `editingMode` operator setting selects `'textarea'` (plain text) vs `'contenteditable'` (rich). No user toggle in the document editor; the setting is buried in the operator pane | An editor-toolbar toggle in the **central stage** (app-graph, MCP-visible) switching the editing representation: **Markdown** (source textarea) ↔ **HTML** (rich `contenteditable`). Drives the existing `editingMode` seam + re-derive. See §7 Q4 for the exact semantics to pin. |
| **C9** | UI settings and configuration are part of the **serialized state** | Settings/config persist as separate per-store JSON files (`operator-settings-store.ts`, `template-store.ts`, `security-store.ts`, the RAG registry, engine-config); no UI-layout/appearance state exists | Theme, pane layout (zone/order/collapse/size), pane enablement, and the editing representation become one serialized UI-config state that round-trips, is inspectable/diffable, and survives restart. Credentials stay out (§3.2). |
| **C10** | A RAG-store change **repopulates content**; it does not rebuild the page — **HARD SPEC REQUIREMENT (in scope)** | `reDerive()` → `refresh()` → `loadAppGraph()` → `runtime.loadEnvelope()` → `tearDownGraph()` (destroys every node) + a full fresh `render()`; git shows no landing | Content-only repopulation via placement/structural ops; template + zones + graph-resident UI state persist; node identity stable. **Wave-0 keystone (U-STATE-1).** See §3.1. |
| **C11** | An emptied `left`/`right`/`header`/`footer` zone **hides**; it reveals as a snap target only when a dragged pane comes near it | No zones/zones invisible in the layout model; single fixed `[sidebar]` | Zero-pane zones auto-hide (derived, not a stored flag) so the stage reclaims the space; a drag within a snap threshold of a hidden zone reveals a provisional drop target; leaving the threshold (or an illegal/aborted drop) re-hides it. See §3. |
| **C12** | A **minimize button** on a container collapses the whole zone to a **tab-list of its contained panes** (vertically-oriented tabs for sidebars, horizontal for header/footer) | No zones; panes stacked with no container controls | Container minimize is a distinct persisted state (not C5 per-pane collapse, not C11 empty-hide). The tab-list is provident-authored; each tab is a clickable provident node that expands the zone and selects that pane. See §3. |
| **C13** | A **View menu** exposes a **pane-visibility selection dropdown** listing every registered pane with a visibility toggle | No application menu (`Menu` absent); `OperatorSettings.enabledPanes` exists but is only displayed, never applied at runtime | The native View application menu (shell carve-out) gains a data-driven **Panes** dropdown built from the `PaneRegistry`, grouped by scope; toggling writes `enabledPanes` in the serialized UI-config state (C9) and re-derives the zones. Operator-only (no MCP tool); hiding an app-graph pane removes it from `get_rendered_html`/`list_targets`. See §3. |
| **C14** | **Shell-chrome tabs in the outer-shell top-bar** (browser-style) for different main-focus documents / other content | Single-document stage; one focus target at a time; no top-bar | The window's top-bar is a browser-style horizontal tab strip (shell chrome); each tab holds a **main-focus target** (RAG document \| graph \| gnosis doc \| other). The active tab's provident body renders in the central stage (C2). Affordances: active highlight, close, reorder-within-strip, new-tab, overflow. Open tabs + active tab + order serialize (C9). Enables multi-document simultaneous render — the CROSS-DOCUMENT-SHARED duplicate case (`docs/pending.md` "Document tabs"). See §3. |
| **C15** | Documents gain a **directory/category structure** | **NONE** — local `documentId` is a flat sanitized basename (`markdown-import.ts:249`; `/`→`-` at `:73`); no `path`/`category`/`tag` on the local RAG document; only `doc-flow` linear edges + `doc-child` *intra*-document nesting. The external Gnosis engine has `wikiId` + `tags: string[]` | Add a primary corpus-relative **path** (single-parent directory tree, preserved at import) + optional multi-valued **tags**, on document metadata. Drives a doc-nav **tree**, category-filtered listing/retrieval, and Gnosis wiki/tag mapping. **Data-model change — its own proposal gate + units** (see §3.3). |
| **C16** | An **undo / redo** tool with a **history sub-pane** in the UI | The engine journal exists (`provident.journal` `undo`/`redo`/`replay`) but has **no UI**; edits rely on browser-native behavior | Editor-toolbar **Undo**/**Redo** controls **plus a history sub-pane** listing the journal entries, app-graph, driven through the same `provident.journal` application seam. **Clicking a history entry undoes the journal back to that point** (multi-step undo). `replay` is not a separate control. **Active — not parked with G6** (see §4/G1). |
| **C17** | An **Import** item in the **File menu** that opens a file browser; select **a single `.md` file** *or* **a directory**, importing **all `.md` files in that directory** | No File menu, no dialog (`showOpenDialog` absent); import only via the MCP `edit.import_markdown` (files list) | Native **File → Import…** opens an Electron `showOpenDialog` (`openFile` + `openDirectory`, `.md` filter). A directory expands to its `.md` files (recursive depth is a gate decision); the resolved list routes to the SAME `importMarkdownCorpus` application handler as `edit.import_markdown`. The corpusRoot stays server-fixed (Unit MS4/ADV-1). See §4/G2 + §5.1 PG2. |
| **C18** | An **advanced-search dropdown sub-pane** in the search tools | `search` pane exposes query + topK only | A disclosure/dropdown sub-pane in the `search` pane exposing the full `rag.query` arg surface (`mode`, `maxHops`, `expand`, `maxParentContext`, `filters`, `stores:'all'`). Closes the G4 PARTIAL. See §4/G4. |
| **C19** | **Hovering a link** shows the linked node section (or a document summary/opening for a document link) **above the link text**; it vanishes **0.5 s after the pointer leaves the link or the popup** | `docs/pending.md` SPECULATIVE "Crosslink hover-preview pane" — not implemented | A transient hover-preview popup anchored above the link, authored in the **app-graph** (MCP-visible) and opened by a provident `on:mouseover`/`on:mouseout` handler; a shell timing mechanic dismisses it 0.5 s after the pointer leaves. See §4/G3. |
| **C20** | **Shared subtrees are visualized** — a background-color change on any CROSS-DOCUMENT-SHARED subtree + a collapsible description box listing the sharing articles; a shared-node commit **warns** and offers **fork** (this document only) or **mutate all owners** | Sharing is modelled but invisible; no multi-document render, no shared-edit UI | Provident-authored (app-graph, MCP-visible): a token-driven background class on shared subtrees + a provident description box (`on:click` toggle) listing owners from the reverse map. Commit-time **warn + choose** (Option C, OB1). See §7.2. |

---

## 2. The shell-vs-provident boundary (applies to every constraint)

The overhaul introduces a large amount of new *chrome* (zones, gutters, drag
handles, collapse toggles, a modal frame, theme tokens). The boundary is pinned
now so the gate reviews the right surface:

| Layer | Owner | May be hand-written DOM? |
| --- | --- | --- |
| Window frame, native menu bar, preload bridge, MCP server, IPC handlers | Electron shell | yes (existing carve-out) |
| Layout grid, zones, gutters, drag handles, collapse toggles, modal frame/scrim, theme token application | Shell chrome | yes — but MUST only *place/format* provident-authored content; it may not author pane body content |
| Pane bodies, toolbar controls, clickable rows, settings/security forms, editor surfaces | provident graph | **no** — authored as envelope nodes + handler bodies; app-graph panes are MCP-visible, operator panes are intentionally isolated |

**Rule:** no constraint in §1 may be implemented by writing pane-body markup in
the shell. Interactive controls inside a pane (including the C8 toggle and C3's
open/close of a provident settings form) are provident nodes with handlers. The
shell may own open/close of the modal *frame* and the layout mechanics.

**Parity corollary:** an app-graph pane is MCP-visible by construction
(`PANE-PROVIDENT-AUTHORING` / `APP-GRAPH-PANES-MCP-VISIBLE`). Operator
settings/security panes remain MCP-invisible by design
(`OPERATOR-ISOLATED-GRAPHSCOPE`) — see §5 carve-outs.

### 2.1 Chrome expressibility audit (which chrome can be provident nodes/handlers)

Basis verified against `provident-ssr@0.4.0` + the upstream specs:

- **`on:*` binds arbitrary DOM event names** — the DOM adapter does
  `el.addEventListener(evtName, handler)` with replace/detach semantics
  (`adapters.md` §3.2, R7); `Supervisor.dispatchEvent` /
  `dispatchAndReport(target, event, …)` fires the same bodies by **name**
  (`handlers.md` §3). This is exactly what the MCP `provident.dispatch` event
  string reaches (`ssr-synthetic-event.md`).
- **Handlers mutate style/class/state** — `state-slice` `targetProp` union is
  `'type' | 'content' | 'handlers' | 'props.*' | 'css.*' | 'hooks.*'`
  (`api.md` §1); `css:classes`/`css:style`/`css:cssDef` are writable, so a
  click handler can toggle collapse/theme/modal classes and restyle live.
- **Placement + structural move are graph-native** — `targetPlacement`,
  the `container` role, the `placement-attach` op, and `move`/`attach`/`detach`
  (`ops.md`, `api.md` §1) express zone membership and reorder.
- **cssDef ships stylesheet rules** — `:hover`/`:active`/transitions are rule
  strings emitted via the `styles` op (`adapters.md` §3.3); a node can ship
  its own hover rule.
- **Limits** — no declarative "class = f(state)" binding (must be handler-,
  hook-, or `derived-state`-driven); the journal is process-local/never
  serialized (restart-durability is host-side, C9); continuous pointer streams
  and browser-native behaviors (pointer capture, drag image/`dataTransfer`,
  focus trap/inert, native `<dialog>`, `:root` custom-property application) are
  not graph state.

**The governing question is not "can it be Provident?" but "is it shell
chrome?"** Per AGENTS.md, everything that is *not* shell chrome **must** be
Provident-authored. The tables below sort the overhaul's elements accordingly.

#### A. Provident means — required (non-shell UI, MCP-visible where app-graph)

| Element | Provident mechanism |
| --- | --- |
| Zone model / placement (`left`/`right`/`header`/`footer`/`stage`) | `targetPlacement` + `container` role + `placement-attach` |
| Central content stage + its formatting scope | placement + scoped `css.cssDef` rules |
| **App-graph pane bodies (MCP-exposed)** — doc-nav, crosslink/backlink, search (`rag.query` full arg surface + `rag-stream` + audit), node/edge/graph inspector, gnosis **query/wikis/documents**, template editor, code/graph console (`provident.code.*`/`graph.*`/`dispatch`), assistant suggestions | envelope nodes + handler defs (+ hooks for values); placed in the zones, **never the settings modal** |
| **Operator-only panels (modal-confined, isolated scope)** — security, operator settings (topK / editing mode / default document / appearance / UI-config), RAG registry manage, module manager, gnosis **status** | envelope nodes + handler defs authored in an isolated `createIsolatedScope()` graph mounted **only** inside the settings modal (C3); MCP-invisible by construction |
| Pane collapse toggle | `on:click` → `css.classes` toggle / hook value |
| Container minimize button + tab strip (C12) | `on:click` on the minimize button → `minimized` state; the tab nodes + expand/select handlers are provident |
| Modal open/close control | `on:click` handler → state-slice / hook |
| Theme toggle control | `on:click` → serialized UI-config state (operator scope) |
| Markdown/HTML editor toggle | `on:click` → `editingMode` state + re-derive |
| Clickable hover affordance | authored `is-clickable` class + `cssDef` `:hover` rule |
| UI-config **values** (theme choice, pane sizes, collapse flags, editing mode) | `hooks.<name>` / `state-slice` writes to targeted nodes; model serialized (C9) |
| Pane reorder / relocate **model** | `state-slice` layout model + `move`/`placement-attach` |

#### B. Hybrid — Provident model + an unavoidable external mechanic

| Element | Provident half | External half |
| --- | --- | --- |
| Pane frame + drag handle | the frame/handle node + `on:dragstart/dragover/drop` | pointer/`dataTransfer`/drag-image plumbing |
| Pane reorder/relocate gesture | the layout model mutation | the continuous drag stream |
| Empty-zone auto-hide + proximity reveal (C11) | the zone's visibility class (`is-empty`/`is-revealed`) via state/hook | proximity detection (pointer vs zone bounds, snap threshold) during the drag |
| Container minimize — track collapse + orientation (C12) | the `minimized` state + the tab-strip subtree | grid-track collapse + orientation styling of the container |
| View-menu pane-visibility dropdown (C13) | the serialized `enabledPanes` model + the pane re-render | the native application menu + the pane-catalog IPC |
| Main-focus tab bar (C14) | each tab's provident content + the open-tabs model (C9) | the tab strip / close / switch (shell chrome) |
| Modal frame + scrim | the overlay node + state-driven `css.classes` | focus trap / `inert` / top-layer / Escape |
| Content mount | the provident roots (`pane-<id>`, content payloads) | `DomAdapter` mount ownership into shell containers |
| Serialized persistence | the serialized state/model (C9) | `fs` read/write (atomic temp+rename) |

#### C. External HTML/chrome — allowed shell carve-out

| Element | Why external |
| --- | --- |
| Outer window/grid **geometry** (CSS grid on the shell body) | layout styling of the shell itself. **NOTE (OB2/Reading 2):** the *grid geometry* is shell; the **zone containers/placement** are provident (§2.1 Table A) — not shell |
| Resizable gutters (drag) | continuous pointer capture + `getBoundingClientRect`; must not journal per pixel |
| Theme **token application** (`:root` custom properties) | must reach the window root incl. operator scope + shell chrome |
| Window frame / native menu / accelerators | Electron shell |
| OS file dialogs / clipboard / native context menu | OS/browser API — includes the C17 `showOpenDialog` import browse |
| Native File menu → **Import…** (C17) | Electron shell menu; the item opens the dialog, the import runs the shared `importMarkdownCorpus` handler |
| Native gesture primitives (pointer capture, `dataTransfer`/drag image, focus trap, top-layer, Pointer Lock) | browser API, not graph state |
| OS-theme listener (`matchMedia('prefers-color-scheme')`) | OS API — feeds the serialized/provident theme value |

**Reading:** the control *surface* is almost entirely Provident (Table A) —
which is the point, since app-graph panes are MCP-visible and dispatchable.
External chrome is confined to the thin, browser-native mechanics in Tables B
and C: gestures, native accessibility, root-level styling, and OS integration.
The hybrid rule: the **model is always Provident/serialized; only the mechanic
is external** — external code commits one managed write (hook / state-slice /
structural op) at gesture end, never a per-frame stream.

**Isolation boundary (C3):** the two Table-A rows are of two kinds. The
**app-graph** row is MCP-exposed by construction and lives in the zones;
the **operator-only** row is confined to the settings modal, which is itself
an **isolation-system mount** — its content is authored in an isolated
`createIsolatedScope()` graph, so the MCP endpoints that read the app Runtime
can never see or dispatch it. MCP-exposed tools are therefore **never** part of
the modal; the modal only ever hosts operator-only panels.

### 2.2 Hooks: the targeted external-write surface (and what was parked)

The **original** hooks proposal was exactly the thing described: a name-keyed map
letting outside code reach components deep in the graph and push updates to
targeted locations (`hooks-map-review.md` §1). The three-agent gate **PARKED
that name-index kernel** (raw-Node exposure, registry lifetime, staleness,
naming) and **AMENDED it to the value-provider slot that shipped** (§7). So the
accurate statement is *not* "hooks can't do external targeted updates" — the
implemented hooks **are** a targeted managed-write surface. What was parked is
the *name-addressed* and *structural* part of the original vision.

What the implemented hooks **can** do:

- External code that holds a node reference can push a value into that node's
  provider slot through the managed channel:
  `clientAPI.apply(nodeId, [{ targetProp: 'hooks.<name>', mode: 'replace', value }])`.
  The value **cascades source→target** to the node's consumers via the E2E-3
  walk, as ONE replace-in-place `hook-<name>` layer (repeat writes never grow
  the layer stack).
- The target address is `(node ref, same-node provider name)`, declared by the
  `hooks` field. The shipped `demo/hooks-scenarios.js` (theme switcher / session
  panel / live counter) **is** external SPA logic controlling subgraph contents
  this way.

Why "external SPA logic controls the UI subgraph through hooks" still breaks
down as a general mechanism:

1. **Names → nodes.** The global name→node index is de-scoped/parked (§7.4);
   the parked `ctx.tree.getHook`/`getRef` one-hop lookup (§5) did not ship. So
   external code must **already hold the node id/wire** — there is no "push to a
   named location" without the ref.
2. **Values → structure.** A hook write changes a *provider value*, not the
   node tree. Adding/removing/reordering/replacing nodes or elements needs
   `state-slice` (`content`/`props`/`css`/`handlers`), structural ops
   (`attach`/`detach`/`move`/`destroy`), or `layer-apply` — **not hooks**.
   "Subgraph contents" in the structural sense is outside hooks' scope.
3. **Observation/events.** Hooks do not subscribe to DOM events. The external
   logic must detect the gesture and perform the write: the graph does not
   "respond to" external events through hooks — the external code drives.
4. **Scope.** Node-local within ONE `GraphScope`; no cross-scope (app graph ↔
   operator scope ↔ shell chrome).
5. **Array/batch minting.** Parked (amendment C, `hooks-array-injection-review.md`).
6. **Ref stability.** The managed channel is process-local, and the CURRENT
   full-rebuild re-derive invalidates any node ref external code holds (C10/§3.1
   must land for held refs to survive a RAG change).

So the correct surface map for graph-external SPA logic:

| Need | Correct surface |
| --- | --- |
| external code pushes a value/state to a node it holds | `ClientAPI.apply` / `Supervisor.apply` — a `state-slice` (`hooks.<name>` for provider values, `css.*`/`props.*`/`content` for direct fields) or a structural op |
| external event should fire a node's handlers | `Supervisor.dispatchEvent` / `dispatchAndReport(target, event, …)` (awaits `flush`, returns `{results, dirtied}`, opt-in `requestId` dedup) — the same entry the MCP `provident.dispatch` uses |
| external DOM listener → graph | `DomAdapter.onEvent(wire, event)` page seam |
| external child/row injection (structure) | the legacy-handler bridge `{children}` → ONE `layer-apply` (OO-7) |
| install handler bodies pre-mount | `Node.addLayer` (un-journaled; **PRE-MOUNT ONLY**) |
| react inside the pipeline | phase handlers `before-compile`/`after-compile`/`after-render` (engine pipeline only) |

For the overhaul specifically: **hooks are the sanctioned targeted-update path
for UI-config *values*** — theme, pane sizes, collapse flags, editing mode —
written by the external control (drag/resize/toggle) and consumed by the
provident nodes that render them. Structural layout changes (which pane lives
in which zone, order) use `state-slice` on the layout model / structural ops,
not hooks. That is not a limitation of hooks per se; it is the value/structure
boundary.

Caveats for the overhaul:

- **Scope:** hooks are node-local within ONE `GraphScope`. The app Runtime and
  the operator settings scope are separate scopes, and the shell chrome is
  outside both — a hook write cannot theme the shell or the operator panes.
- **Durability:** the hook layer lives in the process-local, non-serialized
  journal, so restart-durability still needs the host store. Whether it
  survives a *live* RAG change is not an engine property — it depends on the
  repopulation strategy, which the overhaul requires to be content-only (see
  §3.1). Under the CURRENT full-page rebuild it is discarded; under the
  required content repopulation it survives.
- **Array/batch injection is NOT implemented:** the hooks→placement
  array-injection contract is PARK→AMENDED, not landed
  (`hooks-array-injection-review.md`). External lists (search results,
  suggestions) ride placement/`layer-apply` today.
- **Not a general store:** a hook only takes effect where a same-node provider
  binding consumes it; for non-provider state prefer `css.*`/`props.*`
  state-slice writes.

**Net effect on §2.1:** hooks do not change the 8/3/3 tally — they are a write
path, not gesture capture. But they do mean external SPA controls
(drag/resize/toggle) can drive graph-resident UI-config **values** to targeted
nodes without the shell owning the value; only the gesture mechanics and the
global/native chrome (theme-token application, grid geometry, continuous
pointer streams) stay shell. Structural layout changes remain managed writes
(`state-slice`/structural ops), not hooks.

---

## 3. Pane layout model (enables C4, C5, C7)

Draft shape (names are placeholders for the gate):

```
PaneLayoutEntry {
  id:        string          // the pane registry id
  zone:      'left' | 'right' | 'header' | 'footer'
  order:     number          // position within the zone
  collapsed: boolean
}

LayoutState {
  zones:   { left:   { size: number; minimized: boolean },
             right:  { size: number; minimized: boolean },
             header: { size: number; minimized: boolean },
             footer: { size: number; minimized: boolean } }
  panes:   PaneLayoutEntry[]
  version: number
}
```

Rules:

- **Source of truth:** the pane *existence* remains the host `PaneRegistry`
  (decisions `PANE-REGISTRY`). The layout overlay adds *placement/collapse/size*
  preferences on top; it never invents panes.
- **Default placement:** each `PaneDefinition` gains an optional
  `defaultZone` (today everything is `[sidebar]`); the layout entry overrides it.
- **Zones:** the grid gains `left`, `right`, `header`, `footer` and the central
  `stage`. The current single `[sidebar]` maps to `left`. A shell
  **`top-bar`** (C14 browser-style tabs) sits above the pane zones and is **not**
  a pane zone.
- **Persistence:** layout + appearance are part of the **serialized state**
  (C9 / §3.2) — see §7 Q6. The shell applies the geometry, but the layout
  *model* is serialized data, not ad-hoc shell state.
- **Pane framing:** each pane renders as a mounted shell frame containing the
  provident-authored pane subtree (the existing `pane-<id>` root). The frame
  supplies the handle + collapse toggle; the body is untouched provident content.
- **Relocation legality:** a pane's draggable zone set derives from its scope
  (an operator pane cannot move into the app-graph sidebar and remain
  MCP-invisible — see §5).
- **Empty-zone auto-hide + proximity reveal (C11):**
  - A zone with **zero panes** hides (its grid track collapses; the stage
    reclaims the space). Emptiness is **derived** from the pane layout — never a
    stored `hidden` flag, so it cannot go stale.
  - While a pane is being dragged, if the pointer (or the dragged pane's edge)
    comes within a **snap threshold** of a hidden zone's edge/region, that zone
    **reveals** as a provisional drop target (visible, at least a minimum drop
    area + insertion indicator). Crossing the threshold away, or ending the
    drag without a legal drop, re-hides it.
  - **Scope legality gates the reveal:** a zone that would be an illegal target
    for the dragged pane's scope (per the relocation rule) does not reveal and
    does not accept the drop.
  - The zone's **last size is retained** in the model and restored when it next
    becomes non-empty (or reset to a pinned minimum — decide at the gate).
  - **Graph/parity:** the zone container keeps a **stable node identity** and a
    state-derived visibility class (`is-empty`/`is-revealed` → `cssDef`
    `display:none`/revealed), so drop-target wiring survives and
    `get_rendered_html` reflects the hidden/revealed state. An empty hidden zone
    has no panes to expose — nothing loses MCP visibility.
  - **Mechanics split (C11 is hybrid, §2.1 Table B):** the visibility class is
    provident (state → `css.classes`/hook); the drag **proximity detection**
    (pointer coords vs zone bounds, and the threshold) is the external half and
    writes one transient managed value per threshold-crossing — never a
    per-frame stream.
- **Container minimize → tab-list (C12):** each zone container carries a
  minimize button; minimizing collapses the whole zone to a **tab strip** of the
  contained panes instead of the stacked pane bodies.
  - **Distinct from C5/C11.** Three independent states per zone:
    **expanded** (normal stack) / **minimized** (tab strip, still has panes,
    persisted) / **empty-hidden** (zero panes, derived, C11); plus **per-pane
    collapse** (C5) as the inner level. A minimized zone is non-empty, so C11
    does not apply; a C11-hidden zone has nothing to minimize.
  - **Orientation is derived from the zone edge:** `left`/`right` →
    vertically-oriented tabs; `header`/`footer` → horizontal tabs. The tab
    labels read along the strip's axis.
  - **Tab behavior:** each tab represents one contained pane; clicking a tab
    **expands the zone and selects that pane**. The tab strip is a provident
    subtree; each tab is a provident node with an `on:click` handler
    (MCP-dispatchable), so an agent can expand/select a pane through the same
    surface (or drive the underlying managed write).
  - **Persistence:** `minimized` is a **stored** per-zone field in the layout
    model (C9), unlike emptiness; the retained `size` restores on expand.
  - **Drag interaction:** a minimized zone still presents its tab strip as a
    drop target and can be revealed/expanded by a nearby drag (C11 proximity);
    scope legality gates acceptance as usual.
  - **Graph/parity:** the zone node keeps stable identity and renders either the
    pane stack or the tab strip from the `minimized` state — both provident;
    `get_rendered_html` reflects the minimized tab-list.
  - **Mechanics split (C12 is hybrid, §2.1 Table B):** the tab strip, minimize
    button, and expand/select handlers are provident; the grid-track collapse
    and orientation styling of the container are shell/`cssDef`.
- **View-menu pane visibility (C13):** the native **View** application menu
  exposes a **Panes** dropdown listing every pane from the `PaneRegistry`,
  grouped by scope (`app-graph` vs operator). Each item is a visibility toggle
  reflecting the serialized `enabledPanes` (C9).
  - **Data-driven from the registry:** the menu is built from the pane catalog,
    never a hard-coded list, so a newly registered pane appears without a
    main-process change (the renderer supplies the catalog to main over IPC, or
    the catalog is shared).
  - **One model:** toggling writes `enabledPanes` in the serialized UI-config
    state (C9), applies `PaneRegistry.enable/disable`, and re-derives the zones.
  - **Cascades into C11:** hiding the last pane in a zone empties it → the zone
    auto-hides (and reveals on drag proximity, C11).
  - **Operator-only:** the visibility control is a manual-UI surface (sibling of
    the settings toggle, C3), not an MCP capability. `enabledPanes` is already
    an operator setting and is **not** group-gated; no MCP tool toggles pane
    visibility. Hiding an app-graph pane removes it from `get_rendered_html` /
    `list_targets` — a deliberate human action.
  - **Native menu is the shell carve-out:** the View menu is the **native**
    application menu (AGENTS.md exception for the native menu bar), not in-app
    hand-written HTML; the pane bodies it toggles remain provident.
  - **Mechanics split (C13 is hybrid, §2.1 Table B):** the `enabledPanes` model
    and the pane re-render are provident/serialized; the native menu item + the
    catalog IPC are shell.
- **Main-focus tabs (C14) — outer-shell top-bar, browser-style:** the window's
  **top-bar** is a browser-style horizontal tab strip (shell chrome), above the
  header pane zone and the body row.
  - **Target model:** each tab holds a typed **focus descriptor** —
    `document:<id>` | `graph:<view>` | `gnosis-doc:<id>` | other content — and
    the **active** tab's content renders in the central stage (C2) under its
    formatting scope.
  - **Browser-tab affordances:** horizontal strip; active-tab highlight; close
    button per tab; **drag-to-reorder within the strip** (distinct from pane
    relocate C4); a new-tab control; overflow/scroll for many tabs.
  - **Shell bar, provident bodies:** the strip is shell chrome (per the
    directive); each tab's body is provident-authored, so stage content stays
    MCP-visible.
  - **Layout ordering:** `top-bar (tabs)` → `header` pane zone (C11-hidden when
    empty) → main row (`left` | stage | `right`) → `footer` pane zone. The
    top-bar is a **shell region, not a pane zone** — it never participates in
    pane drag/relocate or the C11/C12 zone states.
  - **Parity note (clarified §4):** the shell strip need **not** be
    `provident.dispatch`-able. Parity holds if tab/focus selection is backed by
    shared application code (the same main-process focus/document-selection
    operation an MCP side would call). Whether an MCP focus-selection tool
    *exists* is a coverage question, not a parity defect; record the intended
    choice (default: focus selection is operator-only, no tool).
  - **Persistence:** the open-tab set + active tab + tab order serialize in the
    UI-config state (C9).
  - **Multi-document semantics:** with multiple document tabs rendered
    simultaneously, the CROSS-DOCUMENT-SHARED duplicate case goes live
    (`docs/pending.md` "Document tabs" row) — pin the shared-node edit
    semantics (update-all vs fork-on-save).

### 3.1 Re-render is content repopulation, NOT a page rebuild

**Requirement (user directive, 2026-09-11; CONFIRMED as a hard spec requirement
2026-09-11):** a RAG-store change must update the content that changed, not tear
down and rebuild the page. This is **in scope for the spec — not a
post-spec goal** — and is the **Wave-0 keystone unit (U-STATE-1, §8.1)** that
the lifecycle/state units depend on. The current host does the set of things
below; all must be replaced.

**Current behavior (verified in the tree — the directive is NOT yet
implemented):**

- `reDerive()` (`src/renderer/sidebar-panes.ts:782`) fetches the full snapshot +
  doc-heads, rebuilds the traversal envelope, and routes through `refresh()`
  → `loadAppGraph()` (`:587`) → `runtime.loadEnvelope()` (`src/renderer/runtime.ts:325`).
- `loadEnvelope()` calls `tearDownGraph()` (`runtime.ts:759`), which runs a
  `destroy` op on **every** in-tree non-root node (plus unplaced ghosts), then
  `resetRenderState()` + a full fresh `render()`.
- `mountOperator()` (`sidebar-panes.ts:624`) re-creates the isolated
  `GraphScope` + `replaceChildren()` on **every** `refresh()` (`:632/635`).
- Git/branch/stash history shows **no** commit implementing content-only
  repopulation. (The landed `drain-then-teardown` work is the registry/store
  hot-apply slice — a *different* layer: swapping store instances, not the
  renderer graph.)

**Required contract (what U-STATE-1 must implement):**

- A RAG change replaces only the **changed content roots**; the template + the
  zone producers (the `main` content zone, the `sidebar` container) **persist**
  across the change.
- The operator scope is **not** remounted per change.
- **Node identity (`css.id`) stays stable** across a RAG change: MCP
  `provident.dispatch` targets and rendered-HTML diffs remain valid, and
  graph-resident layout/hook/theme state survives.
- Use the surgical primitives, not teardown: `placement-attach` / `detach`
  (swap content-role roots in a zone), `destroy` (remove only the replaced
  roots), `state-slice` (`content`/`props`/`css`/`handlers`, in place), and
  `layer-apply` (mint children under an existing node — the `{children}` bridge
  model).
- **Zone lifecycle is explicit:** first content (empty→non-empty), replacement,
  removal (non-empty→empty, per C11), and no-op (unchanged) are all defined
  transitions.

**The teardown rule (2026-09-11, user ruling):** `tearDownGraph` is
**clear-to-root** — it destroys every in-tree non-root node, and the UI
(shell/root, `zone:*` containers, content roots, pane roots) **is** part of the
app graph. It is therefore a **full-reset primitive only** — permitted for boot
(before the app graph is first materialized), the MCP `provident.teardown` tool,
and `loadDoc` (loading a wholly different serialized document). It **must never
run on the RAG content-change path.** A content change uses targeted
live-graph ops.

**The translate+attach mechanism (2026-09-11, user ruling):**
`translateLegacy` **is still required** — data arrives as legacy envelopes
(from Gnosis / the UI import / an MCP tool), so a changed subtree must be
translated into nodes before it can join the graph. The correct sequence is:

1. translate the incoming content with `translateLegacy(..., { hub: <the LIVE app-graph hub> })` so the new nodes are admitted into the **live** graph/hub (not a side graph);
2. `placement-attach` the translated content root to the **live** `zone:<name>` container **by node ref** (`{ kind: 'placement-attach', node, container, names: [<zone>] }`) — which is why a persistent app-graph hub is required (it is **U-STATE-1c**'s "engine scaffolding persists" concern, and the prerequisite for this attach);
3. `destroy` only the removed roots; `detach` on replacement; `state-slice` for in-place edits.

The Runtime must therefore own **one** persistent app-graph `LinkConfigNameHub`
(created once and threaded through every app-graph `translateLegacy`); the
per-`loadEnvelope` anonymous hub is the AF1 root cause.

This is a **host implementation change on the renderer side**, not an engine
requirement — the engine already exposes every primitive above (verified
against `provident-ssr@0.4.0`). It is nonetheless the prerequisite for the
graph-resident-state claims in C9 (serialized UI-config), C11 (empty-zone
detection), C12 (minimized zone), C14 (tab state), and C16 (undo/redo across a
change).

| Primitive | Use |
| --- | --- |
| `placement-attach` / `detach` | attach the new content roots to a zone / detach the old ones (content roots are placement-routed `content`-role nodes) |
| `destroy` | remove only the replaced content roots |
| `state-slice` (`content` / `props` / `css` / `handlers`) | mutate existing nodes in place |
| `layer-apply` | mint children under an existing node (external row/content injection; the `{children}` bridge) |

**Scope (why it is its own unit, not a chrome unit):** zone lifecycle,
empty-store handling, `backRefs` recompute, and caret/selection preservation all
change; the existing `{children}` / placement path is the model for the content
swap.

**Consequences:**

- The §2.2 durability caveat is **conditional**: graph-resident state survives
  live RAG changes once repopulation is content-only; only **restart**
  durability still needs the C9 host store.
- Because it is a hard prerequisite, U-STATE-1 lands **before** the units that
  depend on it (§8.1); the spec reports the overhaul incomplete if node identity
  or graph-resident state is lost on a RAG change.

### 3.2 UI settings + configuration live in the serialized state (C9)

**Directive (user, 2026-09-11):** include UI settings and configuration in the
**serialized state** — do not scatter them across shell-only stores. This
resolves §7 Q6 (was "separate shell store") in favor of a serialized UI-config
state.

Scope — the UI settings/config to serialize:

- **Appearance:** the tri-state theme (`system` \| `light` \| `dark`).
- **Layout:** per-pane zone (`left`/`right`/`header`/`footer`), order,
  collapsed flag, and zone sizes; pane enablement.
- **Editing:** the editing representation (markdown ↔ html), replacing the
  buried `editingMode` setting.

Carrier — the gate must pin ONE (the open sub-question):

| Candidate | Round-trip home | Consequence |
| --- | --- | --- |
| (a) Extend `OperatorSettings` (`operator-settings-store.ts`) | the existing JSON settings file | simplest; stays operator-scoped + not MCP-visible by construction |
| (b) The engine `SerializedRenderDoc` (`serializeSlice`/`loadState`) | the graph serialization | UI config becomes graph data, inspectable via `provident.export`; MCP-visible unless scope-pinned |
| (c) A new dedicated `UIState` serialized document | its own JSON file + loader | clean separation; one more store/loader |

Draft recommendation: **(a) extended `OperatorSettings` as the serialized
UI-config state**, authored into the graph (per §2/§3) and projected through the
existing operator-settings IPC. It reuses the proven `sanitize`/default/
fail-soft behavior, keeps UI config operator-scoped (consistent with
`OPERATOR-ISOLATED-GRAPHSCOPE`), and avoids inventing a fourth persistent
store. Whichever carrier lands, the *model* is serialized data (C9), not shell
state.

Pinned rules:

- **Versioned shape.** The serialized UI-config carries a `version`; unknown or
  missing fields fall back to defaults, and a corrupt state never crashes boot
  (mirror `operator-settings-store.ts` `sanitize`).
- **Credentials are NEVER serialized here.** The security token, engine
  `auth.token`/TLS material, and any API keys stay in their dedicated
  non-exported stores; the UI-config state must never be MCP-exportable while
  carrying a secret (`GNOSIS-SECURITY-CARVE-OUT`).
- **Graph-resident vs operator-scoped is a gate decision.** If the UI-config
  state is authored into the app graph, it becomes MCP-visible; if it stays in
  the operator scope, it is operator-only. Pin this explicitly (default: keep
  the existing operator carve-out — UI-config is a manual-UI surface).
- **Interaction with C10/§3.1:** once RAG changes repopulate content only, the
  serialized UI-config state need not be re-derived or re-persisted on every
  store change — it survives in the graph and flushes on explicit change.

### 3.3 Document directory/category structure (C15)

> **Drafted separately (2026-09-11; GATED — PROCEED-WITH-AMENDMENTS):** the
> implementation spec is `docs/specs/document-directory-category.md` (GATED; see
> `docs/specs/document-directory-category-review.md`). That file + its review are
> authoritative for the model/contract; this section is the summary + the
> UI-overhaul boundary (the doc-nav tree consumer, G2).

**Finding (verified 2026-09-11): the local document model is flat.**
`documentId` is the sanitized file **basename** (`markdown-import.ts:249`);
`sanitizeDocumentId` maps every non-`[a-zA-Z0-9._-]` char to `-` (`:73`), so the
corpus-relative directory is discarded. There is no `path`/`category`/`tag` on a
local `RagNode`/document; the only structures are `doc-flow` linear edges,
`doc-child` *intra*-document nesting, the multi-store registry names, and — on
the **external** Gnosis engine — `wikiId` + `tags: string[]`.

Draft model (for the gate):

- **Primary path — single-parent directory tree.** Each document carries a
  corpus-relative `documentPath: string[]` (**directory segments only**;
  `[]` at root) + a `name` (the basename, the final `documentId` segment),
  preserved at import (the `corpusRoot` stays the containment base;
  `resolve(corpusRoot,file)` is unchanged). **Gate outcome 2026-09-11 (this
  bullet is SUPERSEDED):** `documentId` is **path-qualified**
  (`[...documentPath, basename].join('/')`, `/`-joined) — the earlier
  "`documentId` stays **flat** (id stability); the path is metadata" reading is
  reversed by `docs/specs/document-directory-category-review.md` §4 Q1, because
  flat ids cannot satisfy the repeated-basename requirement. The id-stability
  ripple (minting census, `<name>:` prefix, collision rules) is acknowledged and
  handled by must-fix M1/M4/M6/M15. The authoritative model/contract is
  `docs/specs/document-directory-category.md` (GATED).
- **Tags — multi-valued.** Optional `tags: string[]` mirroring Gnosis; enables
  cross-cutting categories that are not a tree.
- **Storage home.** **Gate outcome 2026-09-11:** additive optional **root-node
  fields** (`RagNode.documentPath`/`tags`), mirroring the `children` precedent,
  not a separate document-metadata record and not `props`. See
  `docs/specs/document-directory-category-review.md` §4 Q2.
- **Import.** `importMarkdownCorpus` retains the corpus-relative directory in
  `path`; the one-way-snapshot semantics are unchanged.
- **Gnosis mapping.** Decide whether a local directory maps to a Gnosis `wiki`
  (e.g. one wiki per top segment) or stays local metadata alongside Gnosis
  `tags`.
- **Traversal + retrieval.** The doc-heads listing gains `path`/`tags`;
  category-scoped loading and category-filtered `rag.query` become possible.
- **MCP surface.** A read-only document/classification listing exposing
  `path`/`tags` (+ category-filtered listing) — distinct from the store census
  (document metadata, not store names). Decide.
- **UI consumer.** `doc-nav` becomes a **tree** (folders + tag filters) in the
  app-graph (MCP-visible), with grouped rendering (G2).
- **Security/parity.** Category/tag mutations ride the existing `edit.*` /
  document-CRUD surfaces, group-gated; no new credential/CSP surface.
- **Migration.** Existing docs have no path → default to a root category (or
  derive from basename); additive + no re-hash, per the `children` precedent.

**Scope note:** this is a data-model feature far larger than the shell chrome
work; it must pass its **own** proposal gate and land as its own slice (import →
store format → traversal → MCP surface → doc-nav tree), **dependent on — not
part of —** the shell units. The UI overhaul's G2 doc-nav tree consumes it.

---

## 4. MCP/UI parity — pane grouping (the requested grouping)

**Parity definition (clarified 2026-09-11):** `MCP-UI-EQUIVALENCE` does **not**
require the MCP tool to activate the UI handler or dispatch a synthetic event.
The requirement is that both surfaces **run in the same process and interface
with the same application code** — the MCP tool and the UI path must invoke the
same underlying function / module / state store in the Electron **main**
process. Sharing the application code **is** the parity; a shared entry path
(handler activation, `provident.dispatch`) is one optional route, not the
criterion.

Consequences for this spec:

- The renderer is a trusted surface: a UI handler reaching main over IPC and an
  MCP tool calling the same main-process function are parity-equivalent even
  though their entry paths differ (e.g. `edit.set_content` and the textarea
  blur both reach the same `setContent`/`applyBatch`).
- A **shell-chrome** affordance (the C14 tab strip, a drag handle) does **not**
  need to be `provident.dispatch`-able for parity. It needs its operation backed
  by shared application code that the MCP side also uses *where an MCP
  counterpart exists*. If no counterpart exists, there is nothing to be at
  parity with — that is a coverage question, not a parity defect.
- Parity is judged at the **application seam**, not the DOM: "does the same
  main-process code perform the operation?" — not "can the agent click the same
  node?".

The overhaul completes the *coverage* direction: the pane catalog below is
organized so every MCP tool group has a named UI home. Status vocabulary:
**EXISTS** (pane landed), **PARTIAL** (pane landed but the tool's full arg
surface is not reachable), **GAP** (no UI home yet), **CARVE-OUT**
(intentionally UI-only or MCP-invisible).

### G1 — Document (focus + editing) → central stage + editor toolbar

| Pane / control | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Central document stage | app-graph | `provident.get_rendered_html`, `provident.get_markdown` (view); `provident.list_targets`, `provident.get_node_state` (inspect) | EXISTS (read), PARTIAL (inspect) |
| Main-focus tabs (C14) | shell bar + app-graph bodies | (selects the focused target among `document:`/`graph:`/`gnosis-doc:`/other) | GAP |
| Editor toolbar / inline editor | app-graph | `edit.set_content`, `edit.create_node`, `edit.delete_node`, `edit.split_node`, `edit.merge_node`, `edit.set_edge` | **EXISTS (indirect)** — see note |
| Markdown/HTML editing toggle (**C8**) | app-graph | (drives `editingMode`; no MCP tool — see §6) | GAP |
| Paste/rich commit surfaces | app-graph | (existing U5/U4 bridge) | EXISTS |
| **Undo / Redo / History** (C16) | app-graph | `provident.journal` (`undo`/`redo`) | **NEW (user directive 2026-09-11)** — editor-toolbar undo/redo **plus a history sub-pane**; **clicking a history entry undoes the journal back to that point**; **not** parked with G6 |

> **Journal history (2026-09-11):** the history sub-pane lists the journal
> entries and is **interactive** — clicking an entry undoes the journal **back to
> that point** (a multi-step undo implemented as repeated `undo` calls, or a
> journal seek if the engine supports it — Q14). Undo/Redo buttons remain for
> single-step moves. `replay` is not a separate control. PG1 is active again.

> **Edit-tool coverage (user clarification 2026-09-11):** the `edit.*` structural
> ops are **indirectly represented** by the **contenteditable** editing surface,
> which **saves on blur**. Typing/formatting/creating/deleting content inside the
> contenteditable decomposes (Unit U2 `decomposeRichHtml`) and commits via
> `edit.set_content`/`setRichText`/paste on blur — so the user edits the document
> directly rather than invoking tool-shaped controls. The MCP tools are the
> programmatic form of the same application-seam operations (parity holds by the
> §4 definition). **There is no separate structural-edit toolbar in v1**; the
> §5.4 PARTIAL rows for the five `edit.*` ops are therefore **reclassified
> EXISTS-by-editor**, not gaps. Verify split/merge/edge are reachable through the
> editor (or accept them as agent-only until a UI need surfaces).

### G2 — Navigation

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Document navigator (`doc-nav`) | app-graph | `rag.get_document` (select), doc-heads listing | PARTIAL — doc-nav `li` nodes are not dispatchable (parked row; §5) |
| Wiki/document list (`gnosis-documents`, `gnosis-wikis`) | app-graph | `gnosis.document.list`, `gnosis.wiki.list`/`get` | EXISTS |
| Import (markdown corpus) | app-graph | `edit.import_markdown` | **NEW (C17)** — **File → Import…** (native File menu, shell) → `showOpenDialog` (single `.md` file *or* a directory → all `.md` in it) → import IPC → the same `importMarkdownCorpus` handler (files-only; corpusRoot server-fixed). An in-pane import control (G2) may coexist |

### G3 — Graph (nodes, edges, links)

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Links/backlinks (`crosslinks`) | app-graph | `rag.backlinks` (crosslinks + back-refs) | EXISTS |
| **Link hover-preview** (C19) | app-graph | `rag.get_document` (linked doc opening/summary); the linked node's subtree | **NEW (user directive 2026-09-11)** — popup above the link on `mouseover`; dismiss 0.5 s after leaving the link or popup |
| **Shared-subtree background + owners box** (C20) | app-graph | `rag.backlinks` (the reverse map: which documents own the node) | **NEW (user directive 2026-09-11)** — background-color on shared subtrees + a collapsible description box listing the sharing articles |
| Node census | app-graph | `rag.list_nodes` | **PARKED — post-MVP knowledge-graph tools** |
| Edge inspector | app-graph | `rag.get_edges`, `rag.get_document` | **PARKED — post-MVP knowledge-graph tools** |
| Graph-neighborhood / path view | app-graph | `rag.get_document` (scoped subgraph) | **PARKED — post-MVP knowledge-graph tools** |

> **PARKED (2026-09-11, user directive):** `rag.list_nodes` and `rag.get_edges`
> (and the node/edge/graph-neighborhood inspector surfaces in G3) are deferred
> until the **post-MVP knowledge-graphing tools** land. This parallels the
> deferred Gnosis knowledge-graph surface (§4.11 Table C, 18 methods): the
> inspector UI should be designed alongside the graph tools it fronts, not
> hard-coded ahead of them. `rag.backlinks` (landed) stays. See
> `docs/pending.md`.

### G4 — Retrieval / search tools

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Search pane (`search`) | app-graph | `rag.query` | PARTIAL — UI exposes query + topK only; **C18** adds the advanced dropdown sub-pane closing the rest |
| Advanced search dropdown (**C18**) | app-graph | `rag.query` (`mode`/`maxHops`/`expand`/`maxParentContext`/`filters`/`stores:'all'`) | **NEW (user directive 2026-09-11)** |
| Result detail / citations | app-graph | `rag.query` result fields (`citations`/`trace`/`blockedBy`/`results`) | PARTIAL |
| Streamed results | app-graph | `rag-stream` | **PARKED — deep implementation** |
| Query audit panel | app-graph | `get_query_audit_log` | **PARKED — audit** (parked row `docs/pending.md`) |

### G5 — Gnosis engine

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Engine status (`gnosis-status`) | operator (**modal-confined**) | `gnosis.status` | EXISTS — modal-confined (MCP-invisible); the `gnosis.status` MCP tool is separate |
| Engine query (`gnosis-query`) | app-graph | `gnosis.query` | EXISTS |
| Streamed engine results | app-graph | `gnosis.stream` | **PARKED — deep implementation** |
| Gnosis documents editor | app-graph | `gnosis.document.get/list/create/update/delete/publish/unpublish/archive` | EXISTS (live-pending scenarios parked) |
| Gnosis wikis | app-graph | `gnosis.wiki.get/list/create` | EXISTS |

### G6 — Template + graph/code console

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Template editor (`template-editor`) | app-graph | `code.template.get/validate/set/create/delete/reset` | EXISTS |
| Envelope/code console | app-graph | `provident.code.get/validate/set/create/delete/load/loadBatch` | **PARKED — plugin handling** |
| Graph console | app-graph | `provident.load`, `provident.op`, `provident.teardown` | **PARKED — plugin handling** |
| Export / Validate | app-graph | `provident.export`, `provident.validate` | **PARKED — app integrations** |
| Dispatch/observe console | app-graph | `provident.dispatch` (+ `provident.list_targets`/`get_node_state` inspect) | **PARKED — plugin handling** |

> **Undo/Redo/History is NOT here** — `provident.journal` has its own active UI
> home in **G1** (editor toolbar undo/redo + an interactive history sub-pane;
> click-to-undo-to-point) per the 2026-09-11 directive.
>
> **Export/Validate PARKED (2026-09-11, user directive):** `provident.export` and
> `provident.validate` are deferred until **integrations with other apps** are
> built (their purpose is interop/round-trip with external apps); revisit when
> an integration feature lands. See `docs/pending.md`.

> **PARKED (2026-09-11, user directive):** the `provident.code.*` cluster and the
> G6 code/graph/dispatch/inspect consoles are **deferred until plugin handling
> is added** — do not hard-code a console now. The module/extension system
> (`docs/specs/module-import-proposal.md`, `src/renderer/extensions.ts`,
> `module:*` tools) is the candidate mechanism for contributing these surfaces.
> Revisit condition: plugin handling lands. See `docs/pending.md`.

### G7 — Modules

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Module manager (`module-pane`, SecurePanels) | operator (**modal-confined**) | `module.install/update/list/enable/disable` | EXISTS but **modal-confined CARVE-OUT** — operator scope, not MCP-visible (matches security) |

### G8 — Security & operator settings (intentional MCP-invisible)

| Pane | Scope | Mirrors | Status |
| --- | --- | --- | --- |
| Security (`settings-pane`, SecurePanels) | operator (**modal-confined**) | security `get`/`set` IPC | EXISTS — CARVE-OUT (credentials never MCP) |
| RAG store registry manage | operator (**modal-confined**) | `IPC_RAG_STORE_MANAGE` | EXISTS — CARVE-OUT |
| RAG store listing | operator (**modal-confined**) | `IPC_RAG_STORE_LISTING` | EXISTS — CARVE-OUT |
| Operator settings (topK, editingMode, default doc) | operator (**modal-confined**) | operator-settings IPC | EXISTS — CARVE-OUT |
| Appearance / UI-config (theme, editing mode, default doc) | operator (**modal-confined**) | serialized UI-config state (C9) | GAP — CARVE-OUT |
| Pane layout controls (zone/size/minimize/drag) | zone chrome (not the modal) | layout model (C9) | GAP |

### G9 — Assistant suggestions (**C4-named, currently absent**)

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Assistant suggestions | app-graph (draft) | **none yet** | GAP — no MCP tool exists; see §6 |

### G10 — Layout / appearance chrome

Central stage, zone gutters, pane handles, collapse/minimize controls, modal
frame, theme tokens — **shell chrome** (§2), no MCP counterpart. The *settings
controls* that operate appearance/UI-config (theme, editing mode, defaults) are
provident operator-pane content **inside the modal**; the per-zone layout
controls (drag/size/minimize) are zone chrome, not modal content.

> **Modal boundary (C3):** the settings modal is an isolation-system mount and
> hosts **only operator-only panels** (Table A row 2, G7, G8). MCP-exposed
> app-graph panes (Table A row 1, G1–G6, G9) are **never** placed in the modal —
> they live in the zones so `provident.dispatch` / `get_rendered_html` /
> `list_targets` can reach them.

### 4.11 Full parity census — every Astrographer MCP tool + every Gnosis document-flow endpoint

**Purpose (user directive 2026-09-11):** confirm each tool/endpoint has a UI
equivalent, assign one, or justify absence. Verdicts: **EXISTS** / **PARTIAL** /
**GAP** (assign a home → a `U-PARITY` unit) / **CARVE-OUT** (intentionally
operator-only or credential/internal) / **DEFERRED** (not wired, not
document-flow). Sources: `ProvidentMcpServer.ALL_TOOLS` (`mcp-server.ts:1679`),
`ENGINE_CRUD_ENDPOINTS` (`engine-crud-rag-store.ts:207`), `ENGINE_ENDPOINTS`
(`engine-rag-store.ts:77`).

#### A. Astrographer MCP tools (55 static + dynamic `module:<name>.<tool>`)

| Tool | UI home (§4) | Verdict |
| --- | --- | --- |
| `provident.dispatch` | G6 dispatch/observe console | GAP (PARKED — plugin handling) |
| `provident.get_rendered_html` | G1 central stage (view) | EXISTS |
| `provident.get_markdown` | G1 central stage (markdown representation) | EXISTS |
| `provident.list_targets` | G6 inspect / target list | GAP (PARKED — plugin handling) |
| `provident.get_node_state` | G3 node inspector | GAP (PARKED — post-MVP knowledge-graph tools) |
| `provident.code.get` | G6 envelope/code console | GAP (PARKED — plugin handling) |
| `provident.code.validate` | G6 code console | GAP (PARKED — plugin handling) |
| `provident.load` | G6 graph console | GAP (PARKED — plugin handling) |
| `provident.op` | G6 graph console | GAP (PARKED — plugin handling) |
| `provident.export` | — | **PARKED — app integrations** |
| `provident.validate` | — | **PARKED — app integrations** |
| `provident.teardown` | — | **CARVE-OUT** — destructive diagnostic; operator/agent-only, no human UI |
| `provident.journal` (`undo`/`redo`/`replay`) | G1 editor toolbar undo/redo + interactive history sub-pane | **ACTIVE — C16 (undo/redo + click-to-undo-to-point)** |
| `provident.code.set` | G6 code console | GAP (PARKED — plugin handling) |
| `provident.code.create` | G6 code console | GAP (PARKED — plugin handling) |
| `provident.code.delete` | G6 code console | GAP (PARKED — plugin handling) |
| `provident.code.load` | G6 code console | GAP (PARKED — plugin handling) |
| `provident.code.loadBatch` | G6 code console | GAP (PARKED — plugin handling) |
| `module.install` | G7 module manager (modal, operator) | **CARVE-OUT** (operator-isolated) |
| `module.update` | G7 module manager | **CARVE-OUT** |
| `module.list` | G7 module manager | **CARVE-OUT** |
| `module:<name>.<tool>` (dynamic) | G7 module manager lists them; a module-tool runner is a G7 decision | GAP or CARVE-OUT (decide) |
| `rag.query` | G4 search pane | PARTIAL (arg surface) |
| `rag.get_document` | G2 doc-nav / G3 graph view | PARTIAL |
| `rag.list_nodes` | G3 node census | GAP (PARKED — post-MVP knowledge-graph tools) |
| `rag.get_edges` | G3 edge inspector | GAP (PARKED — post-MVP knowledge-graph tools) |
| `rag.backlinks` | G3 crosslinks/backlinks pane | EXISTS |
| `rag-stream` | G4 streamed results | **PARKED — deep implementation** |
| `get_query_audit_log` | G4 audit panel | **PARKED — audit** (`docs/pending.md`) |
| `edit.set_content` | G1 inline editor | EXISTS/PARTIAL |
| `edit.create_node` | G1 editor (insert) | PARTIAL |
| `edit.delete_node` | G1 editor (delete) | PARTIAL |
| `edit.split_node` | G1 editor (split) | PARTIAL |
| `edit.merge_node` | G1 editor (merge) | PARTIAL |
| `edit.set_edge` | G1 editor / G3 graph editor | PARTIAL |
| `edit.import_markdown` | G2 import control | GAP |
| `code.template.get` | G6 template-editor pane | EXISTS |
| `code.template.validate` | G6 template-editor (validation feedback) | PARTIAL |
| `code.template.set` | G6 template-editor (auto-commit) | EXISTS |
| `code.template.create` | G6 template-editor (add zone) | EXISTS |
| `code.template.delete` | G6 template-editor (remove zone) | EXISTS |
| `code.template.reset` | G6 template-editor (reset) | EXISTS |
| `gnosis.query` | G5 gnosis-query pane | EXISTS |
| `gnosis.stream` | G5 streamed results | **PARKED — deep implementation** |
| `gnosis.status` | G5 gnosis-status pane (modal, operator) | EXISTS |
| `gnosis.document.get` | G5 gnosis-documents | EXISTS |
| `gnosis.document.list` | G5 gnosis-documents | EXISTS |
| `gnosis.wiki.get` | G5 gnosis-wikis | EXISTS |
| `gnosis.wiki.list` | G5 gnosis-wikis | EXISTS |
| `gnosis.document.create` | G5 gnosis-documents | EXISTS (live-pending) |
| `gnosis.document.update` | G5 gnosis-documents | EXISTS (2026-09-11) — **HOLLOW, see §5.7a HC1** (placeholder empty graph) → treat as PARTIAL |
| `gnosis.document.delete` | G5 gnosis-documents | EXISTS |
| `gnosis.document.publish` | G5 gnosis-documents | EXISTS |
| `gnosis.document.unpublish` | G5 gnosis-documents | EXISTS |
| `gnosis.document.archive` | G5 gnosis-documents | EXISTS |
| `gnosis.wiki.create` | G5 gnosis-wikis | EXISTS |

MCP **resources** (`mcp://provident/app`, `/targets`, `/node/{nodeId}`;
`mcp-server.ts:1791`) are read-only resource mirrors of `get_rendered_html` /
`list_targets` / `get_node_state` — served by the G1/G3/G6 read surfaces; no
separate UI.

> **PARKED (2026-09-11, user directive):** the `provident.code.*` tools in this
> table (7) and the G6 code/graph/dispatch/inspect home are **deferred until
> plugin handling is added**; `provident.export`/`provident.validate` are parked
> until **app integrations**; `provident.journal` is **ACTIVE in G1 (C16 —
> undo/redo + history sub-pane)**. The
> GAP verdicts below stand, but their UI resolution is parked or assigned as
> marked. Remaining active `U-PARITY` gaps: G2 import, G4 audit, G1
> undo/redo. (Streams parked — deep implementation.)

#### B. Gnosis wire endpoints used for the document flow (14) → UI home

| Endpoint / method | UI home (§4) | Verdict |
| --- | --- | --- |
| `POST /documents` (`createDocument`) | G5 gnosis-documents | EXISTS |
| `GET /documents/:id` (`getDocument`) | G5 gnosis-documents | EXISTS |
| `POST /documents/:id/update` (`updateDocument`) | G5 gnosis-documents | EXISTS |
| `DELETE /documents/:id` (`deleteDocument`) | G5 gnosis-documents | EXISTS |
| `POST /documents/:id/publish` | G5 gnosis-documents | EXISTS |
| `POST /documents/:id/unpublish` | G5 gnosis-documents | EXISTS |
| `POST /documents/:id/archive` | G5 gnosis-documents | EXISTS |
| `GET /documents` (`listDocuments`) | G5 gnosis-documents | EXISTS |
| `POST /wikis` (`createWiki`) | G5 gnosis-wikis | EXISTS |
| `GET /wikis/:id` (`getWiki`) | G5 gnosis-wikis | EXISTS |
| `GET /wikis` (`listWikis`) | G5 gnosis-wikis | EXISTS |
| `POST /rag/query` (`ragQuery`) | G5 gnosis-query | EXISTS |
| `GET /rag/stream` (SSE `ragStream`) | G5 streamed results | **PARKED — deep implementation** (mirrors `gnosis.stream`) |
| `GET /engine/status` (`engineStatus`) | G5 gnosis-status (modal) | EXISTS |

#### C. Deferred Gnosis endpoints — justified absence

The full Gnosis `RagStore` surface beyond the document-flow MVP is **deferred
and not wired** (`GNOSIS-CRUD-MVP-SCOPE` + `unblock-gnosis-remaining-endpoints.md`
§4.2–§4.5): knowledge graph (18 methods), fact/citation (6), consistency (4),
and the remaining RAG/agent-memory methods (the retrieval trio is the only
shipped part). **No UI home is required until each is proxied**; when wired, each
follows the same G5 pattern (MCP tool + app-graph/operator pane). Recorded here
so the census is exhaustive and the absence is intentional.

**Summary.** Tools (56 rows = 55 static + the dynamic module form): **21
EXISTS**, **9 PARTIAL**, **21 GAP**, **4 CARVE-OUT** (`module.install`/
`module.update`/`module.list`/`provident.teardown`), **1 decide**
(`module:<name>.<tool>`). Of the 21 GAPs: **15 PARKED — plugin handling**
(the `provident.code.*` cluster + graph/dispatch/inspect), **2 PARKED — app
integrations** (`provident.export`/`validate`), **3 PARKED — post-MVP
knowledge-graph tools** (`rag.list_nodes`/`rag.get_edges`/`provident.get_node_state`),
**3 PARKED — deep implementation** (`rag-stream`, `gnosis.stream`, the SSE
`GET /rag/stream`), **1 PARKED — audit** (`get_query_audit_log`), and the
remaining **ACTIVE** set (`provident.journal`→C16 **history sub-pane, active**,
`edit.import_markdown`→G2/C17 **COVERED by browse**). Gnosis
document-flow endpoints: **13 EXISTS**, **1 GAP** (SSE stream — parked, deep
implementation). The only justifications for absence are the operator-isolated
carve-outs (`module.*`, `provident.teardown`) and the deferred Gnosis surface
(Table C).

---

## 5. Parity gaps and carve-outs (what the gate must adjudicate)

1. **Doc-nav not dispatchable** — `docs/pending.md` row: the `doc-nav` `li`
   targets carry no handler, so an agent cannot select a document via
   `provident.dispatch`. Under the clarified parity definition (§4) this is
   **not itself a parity breach** — the question is (a) whether document
   *selection* reaches the same main-process application operation on both
   surfaces (coverage), and (b) whether the dispatch affordance is wanted for
   ergonomics. Decide: add a select handler and/or ensure selection shares the
   application seam; if no MCP selection operation exists, that is a coverage
   gap, not a parity defect.
2. **Search filters unreachable in UI** — G4: the UI must expose the `rag.query`
   argument surface (`mode`/`maxHops`/`expand`/filters/`stores`) or the gate must
   record an explicit display-only asymmetry (sibling of
   `RAG-QUERY-STORE-DISPLAY-ASYMMETRY`).
3. **Audit panel** — G4: **PARKED (2026-09-11, user directive)** — deferred
   until a real GUI audit use case surfaces; the MCP `get_query_audit_log` tool
   + the `rag-query` audit threading remain. See `docs/pending.md`.
4. **Code/graph/dispatch consoles** — G6: **RESOLVED/PARKED (2026-09-11)** —
   deferred until plugin handling; `provident.export`/`validate` parked until
   app integrations. Not part of this overhaul's active scope.
5. **Assistant suggestions** — G9: the only named utility pane with no MCP
   counterpart. Decide UI-first (carve-out) vs adding an MCP tool (§6). **A new
   UI surface with no MCP tool is a coverage addition, not a parity defect**
   (§4 definition) — but if suggestions are generated/shared application-side it
   should ride the same application seam as any future MCP tool.
6. **Operator-only panels are confined to the settings modal** — G7/G8
   (security, operator settings, registry manage, modules, gnosis status,
   appearance) live **only** in the modal, which is an isolation-system mount
   (`OPERATOR-ISOLATED-GRAPHSCOPE`); MCP-exposed app-graph panes never enter the
   modal. The overhaul must not "fix" the operator invisibility. Credentials
   stay out of every MCP `inputSchema` (`GNOSIS-SECURITY-CARVE-OUT`).
7. **Relocation vs scope** — a relocated pane must keep its scope's
   visibility (operator panes stay out of the MCP-visible app graph). The
   layout model must encode this (§3).
8. **Theme is shell state, not a graph concern** — do not surface theme as a
   pane-body mutation; it is token application at the shell root. The control
   lives in the operator settings (modal) content.
9. **Markdown import has no UI home** — G2: `edit.import_markdown` is an MCP
   tool with **no UI/IPC surface**; a human cannot import a corpus today. Add an
   Import control (doc-nav/tree pane) + an import IPC + a bridge method routing
   to the same `importMarkdownCorpus` handler (files-only; the corpusRoot stays
   server-fixed, per Unit MS4/ADV-1). Genuine coverage gap, not a
   dispatch/parity defect (§4 definition).

### 5.1 Remaining active parity gaps (post-parking census, 2026-09-11)

After the parks, this is the **active** gap set the overhaul must close. Each is
a coverage addition judged at the application seam (§4), not a
`provident.dispatch` requirement.

| # | Gap | Tool(s) | Home | Notes / ambiguity |
| --- | --- | --- | --- | --- |
| PG1 | Journal history sub-pane | `provident.journal` (`undo`/`redo`) | G1 (C16) | **ACTIVE (2026-09-11)** — undo/redo buttons + interactive history; click-to-undo-to-point (Q14) |
| PG2 | Markdown import | `edit.import_markdown` | G2 + File menu (C17) | **COVERED (2026-09-11)** — handled by the browse import tool (C17) |
| PG3 | Node census has no UI | `rag.list_nodes` | G3 | **PARKED — post-MVP knowledge-graph tools** |
| PG4 | Edge inspector has no UI | `rag.get_edges` (+ `rag.get_document`) | G3 | **PARKED — post-MVP knowledge-graph tools** |
| PG5 | Streamed local results have no UI | `rag-stream` | G4 | **PARKED — deep implementation** (degenerate `[result, done]`; no true incremental delivery) |
| PG6 | Query-audit panel missing | `get_query_audit_log` | G4 | **PARKED — audit** (2026-09-11) |
| PG7 | Gnosis streamed results have no UI | `gnosis.stream` | G5 | **PARKED — deep implementation** |
| PG8 | `gnosis.stream`'s SSE endpoint | `GET /rag/stream` | G5 | **PARKED — deep implementation** (same as PG7) |
| PG9 | Dispatch/observe console | `provident.dispatch` | G6 | **PARKED — plugin handling** |
| PG10 | Code/graph/inspect consoles | `provident.code.*` (7) + `provident.load`/`op` + `list_targets`/`get_node_state` | G6 | **PARKED — plugin handling** |
| PG11 | Export/validate | `provident.export`/`validate` | — | **PARKED — app integrations** |
| PG12 | `module:<name>.<tool>` runner | dynamic module tools | G7 | **DECIDE** — the module manager lists modules but does not invoke their tools; operator-only runner? Q15 |
| PG13 | Assistant suggestions | none yet | G9 | **DECIDE** — UI-first carve-out vs a future MCP tool (item 5) |
| PG14 | Doc-nav not dispatchable | (no MCP selection tool) | G2 | **NOT a parity defect** (§4) — coverage/ergonomics only; add a select handler if wanted |

**Active (unparked) gaps: none (PG1/PG2 closed — see below; PG6 parked).** PARKED:
PG9–PG11 (plugin handling / app integrations), PG3–PG4 (post-MVP knowledge-graph
tools), PG5/PG7/PG8 (streams — deep implementation), **PG6 (audit)**.

> **PG2 CLOSED (2026-09-11, user directive):** `edit.import_markdown` is
> **handled by the browse import tool** (C17/U-IMPORT-1) — PG2 is **COVERED**.
>
> **PG1 ACTIVE (2026-09-11, superseding the earlier "closed by undo/redo"):**
> the history sub-pane is **in scope** — clicking a history entry undoes back to
> that point (C16/U-EDIT-2).
>
> **AUDIT PARKED (2026-09-11, user directive):** the query-audit panel (PG6,
> `get_query_audit_log`) is deferred until a real GUI audit use case surfaces;
> the MCP tool + the `rag-query` audit threading remain. See `docs/pending.md`.

> **STREAMS PARKED (2026-09-11, user directive):** the streaming surfaces
> (`rag-stream`, `gnosis.stream`, and the SSE `GET /rag/stream` behind them,
> PG5/PG7/PG8) are **deferred for a later deep implementation** — the
> stream-shaped contract needs a real incremental-delivery design before a UI
> is meaningful (today both are degenerate collect-then-emit). See
> `docs/pending.md`.

### 5.2 Structural parity observations

- **PARTIAL coverage is now the dominant remaining gap.** After the parks, the
  only ACTIVE true GAPs are PG1/PG2/PG5–PG8 (undo, import, streams, audit) —
  everything else active is PARTIAL: an *existing* pane/control exposes only a
  subset of the MCP arg or result surface. PARTIAL is not enumerated tool-by-tool
  yet; §5.4 does it. Closing PARTIAL is generally cheaper than new panes and
  improves parity more, so it should lead the `U-PARITY` wave.
- **The `filters` extension (C15/U-D6) will widen the G4 asymmetry** unless the
  search UI is updated in the same wave: adding `documentPathPrefix`/`tags` to
  `rag.query` without UI controls deepens the existing PARTIAL.
- **Read tools cluster:** `get_node_state` + `list_targets` are PARKED with G6
  while `rag.list_nodes`/`rag.get_edges` are PARKED with the knowledge-graph
  tools. All four are read inspectors that should land in **one** inspector
  surface when their parks lift — three separate parks share one future home.
- **Streams** (`rag-stream`, `gnosis.stream`) are a pair; **PARKED — deep
  implementation** (both are degenerate collect-then-emit today; a shared
  incremental-delivery design precedes any UI).
- **No MCP selection tools exist** (document/node focus, tab switch) — so
  doc-nav/tab "dispatchability" has nothing to be at parity *with*. If an agent
  should be able to focus a document, that is a **new MCP tool** (a coverage
  decision, §6), not a UI-dispatch fix.

### 5.4 PARTIAL coverage census (per-tool, active)

Each row is a tool whose UI home EXISTS but does not yet reach the full MCP
surface. These are the highest-value remaining parity work.

| Tool | Existing UI | Missing from the UI | Fix shape |
| --- | --- | --- | --- |
| `rag.query` | `search` pane (query + topK) | `mode`/`maxHops`/`expand`/`maxParentContext`/`filters`/`stores:'all'` + result fields `citations`/`trace`/`blockedBy` | **C18 advanced dropdown + a result-detail renderer (G4)** |
| `rag.get_document` | doc-nav select (single doc); C19 hover-preview reads a linked doc's opening | scoped-subgraph options; use as the G3 graph view | Extend doc-nav/graph view (G2/G3; G3 parked) |
| `code.template.validate` | template editor (validates on set) | explicit validate-only feedback | validate button (G6, landed pane) |

**Reclassified (NOT PARTIAL): the five `edit.*` structural ops.** Per the
2026-09-11 clarification, `edit.set_content`/`create_node`/`delete_node`/
`split_node`/`merge_node`/`set_edge` are **indirectly represented** by the
**contenteditable editor (save-on-blur)**: direct document editing decomposes and
commits via the same application-seam operations. No structural-edit toolbar is
planned for v1; verify split/merge/edge reachability through the editor, else
accept them as agent-only.

**So the active PARTIAL set is now 3** (`rag.query`, `rag.get_document`,
`code.template.validate`), down from the previously-stated 9.

### 5.5 Remaining-gap verdict summary

| Bucket | Count | Status |
| --- | --- | --- |
| ACTIVE GAPs | 2 (**PG1 history sub-pane**, **C18 advanced search**) | `U-EDIT-2` / `U-PARITY` G4 |
| ACTIVE new features | 1 (**C19** link hover-preview) | `U-PARITY` G3-active |
| ACTIVE PARTIALs | 3 (`rag.query`→C18, `rag.get_document`, `code.template.validate`, + `gnosis.document.update` HC1) | `U-PARITY` |
| COVERED (no longer gaps) | 1 (PG2 import → browse C17) | done via C17 |
| RECLASSIFIED | 5 (`edit.*` structural ops → EXISTS-by-editor, §5.4) | no work planned v1 |
| DECIDE | 2 (PG12, PG13) | gate rulings Q15 / §6 |
| NOT-A-DEFECT | 1 (PG14) | ergonomics only |
| PARKED — plugin handling | PG9, PG10 (+ G6 consoles) | revisit: plugin handling |
| PARKED — app integrations | PG11 (export/validate) | revisit: app integrations |
| PARKED — post-MVP knowledge-graph | PG3, PG4 (+ `get_node_state`/`list_targets`) | revisit: knowledge-graph tools |
| PARKED — deep implementation | PG5, PG7, PG8 (streams) | revisit: incremental-delivery design |
| PARKED — audit | PG6 (`get_query_audit_log`) | revisit: a GUI audit use case |

**Conclusion:** after the parks and the editor reclassification, the remaining
parity work is **2 active gaps (PG1 history sub-pane, C18 advanced search) + 1
active new feature (C19) + the PARTIALs + 2 decisions**. There are **no
unaddressed tool GAPs** — every earlier gap is now addressed (history sub-pane,
import), reclassified (edit ops), or parked (consoles, export/validate,
knowledge-graph inspectors, streams, audit).

**Recommended `U-PARITY` order:** (1) **U-EDIT-2 G1 undo/redo + history
sub-pane** (PG1/C16; click-to-undo-to-point); (2) **C18 G4 advanced search +
result detail** (closes the `rag.query` PARTIAL, absorbs the C15 `filters`);
(3) **C19 G3 link hover-preview**; (4) `code.template.validate`,
`rag.get_document`, and `gnosis.document.update` (HC1) PARTIAL closures; (5) the
PG12/PG13 decisions.

### 5.6 Recommendation on the in-scope active set

Fold **PG1–PG2 + PG5–PG8 + PG12/PG13 decisions** into `U-PARITY-1..n`, grouped
by pane: one G4 retrieval unit (PG5/PG6 + the PARTIAL filter surface), one G5
stream unit (PG7/PG8), G1 (PG1/C16), G2 (PG2 is U-IMPORT-1/C17 + the doc-nav
select), and a G9 decision. Keep **PG3–PG4 (post-MVP knowledge-graph tools)**,
**PG9–PG11 (plugin handling / app integrations)** parked. This avoids
one-unit-per-tool fragmentation (RCA-2 applies to *independently spec'd seams*,
not to read-only list panes sharing a render path).

### 5.7 Remaining GAPS that are not tool/endpoint parity

> **§5.7a first — a correctness caveat on the census.** The §4.11 census graded
> by whether a pane *exists and calls the tool*, which can overstate coverage
> when the pane calls the tool with placeholder arguments. See §5.7a for the
> verified "hollow coverage" findings. Read §4.11 EXISTS verdicts with §5.7a.

#### 5.7a Hollow-coverage findings (audited 2026-09-11)

Triggered by the C10 miscommunication (a directive read as a landed change), the
conversation was re-audited for the same error class: **claims asserted from a
name/id rather than from verified behavior.** One concrete instance was found.

| # | Finding | Evidence | Impact |
| --- | --- | --- | --- |
| HC1 | **`gnosis.document.update` is hollow** — the G5 pane's Update button calls the tool with a **placeholder empty graph** `{ nodes: [], edges: [] }`, so it can only bump/blank a document, not edit its content | `src/renderer/gnosis-crud-panes.ts:132-139` (`GNOSIS_DOCUMENTS_UPDATE_BODY`) | The §4.11 verdict for `gnosis.document.update` is **EXISTS-but-HOLLOW** → really **PARTIAL**. The real graph-editing UI is the G1 contenteditable/editor work, not this button |
| HC2 | `gnosis.document.create` creates a document with a **title only** (no graph body) | `:123-131` | acceptable for a create; the body is filled by a later `update` (which is HC1) — note the dependency |

Everything else audited was verified against behavior, not just names:
`gnosis.wiki.create`/`wi.get`/`wi.list`, `gnosis.document.get`/`list`/`delete`/
`publish`/`unpublish`/`archive` all pass real args (`:93-181`); the
`gnosis-query`/`gnosis-status` panes call the real bridge
(`gnosis-panes.ts:62-64`); `rag.backlinks` is really called
(`sidebar-panes.ts:655`); `edit.set_content`/paste really commit; the absence
claims (`showOpenDialog` 0, `Menu` 0, `querySelector` 0, no modal/tabs, no
`enabledPanes` application) all re-verified.

**Correction:** §4.11's `gnosis.document.update` row reads EXISTS; it should be
read as **PARTIAL (hollow — HC1)**. The G5 pane is otherwise real.

The tool census (§4.11) is exhaustive for **MCP-tool ↔ UI coverage**. These
remaining gaps are not "does a tool have a pane" but **structural/contract**
gaps the overhaul must still close. Listed so the overhaul is not reported
complete while any is open.

| # | Gap | Evidence | Owner |
| --- | --- | --- | --- |
| SG1 | **Content-only repopulation — DONE (2026-09-11)** (C10 — hard spec requirement). Was: a RAG change tore down + rebuilt the whole graph, destroying node identity and graph-resident UI state. Now: `applyContentChange` reconciles content + panes in place; a content re-derive calls `loadEnvelope` **0 times**. | §3.1; **U-STATE-1a/b/c complete** (`docs/specs/unit-u-state-1a..1c`) | done |
| SG2 | **C9 serialized UI-config state does not exist** — theme/layout/pane visibility/editing mode are not serialized; `enabledPanes` is display-only | §3.2/§4.13; `operator-settings-store.ts` | U-SHELL-1/2/8 |
| SG3 | **No application menu at all** — no `Menu` in `main.ts`; therefore no View menu (C13), no File menu (C17) | §4/G10; grep `Menu` absent | U-SHELL-8, U-IMPORT-1 |
| SG4 | **No modal / isolation mount** — settings render at page bottom; the modal isolation boundary (C3) is proposed, not built | §4/G8; `#operator-panes` | U-SHELL-7 |
| SG5 | **No zones / layout model** — single fixed `[sidebar]`; no left/right/header/footer/stage/top-bar | §3 | U-SHELL-1 |
| SG6 | **No appearance system** — OS-only theme, no manual tri-state, no tokens | §4/G10; `index.html` `@media` | U-SHELL-2 |
| SG7 | **Doc-nav not dispatchable** (PG14) — `li` nodes carry no handler | `docs/pending.md` | U-PARITY (G2) — coverage/ergonomics |
| SG8 | **`mountOperator` remounts every refresh** — fixed: `mountOperator` is idempotent (scope+adapter created once) and the operator pane is decoupled from content refreshes (§3.1, §4). | `docs/specs/unit-u-state-1c-persistent-scaffolding.md` | done |
| SG9 | **The `U-PARITY`/tabular gaps are unscheduled** — §5.1 PG1–PG8 + §5.4 PARTIALs have no per-unit specs yet | §8 (draft units only) | gate proposes unit specs |
| SG10 | **Operator scope navigation/un-dispatchability of app-graph panes** — doc-nav/gnosis selects are DOM-click only; no focus MCP tools | §5.2 last bullet | decision (§6) |

**Note:** SG1 was the keystone — it has now LANDED (U-STATE-1a/b/c), so
C9/C11/C12/C16's "graph-resident state survives" claims are unblocked. The C16
journal stack is a concrete instance: the `Supervisor` now persists across a
content change.

---

## 6. Candidate new MCP tools implied by parity (for the gate)

Only where UI-first would otherwise create an asymmetry:

- **Assistant suggestions** (G9) — a tool exposing the suggestion source (if
  generated server-side) so an agent can read/submit suggestions; otherwise
  declare it a UI-only carve-out.
- **Pane layout / appearance read** — likely **NOT** a tool: shell state, and
  the operator carve-out holds. Listed to force an explicit ruling.
- **Markdown/HTML editing toggle** — **NOT** a new tool: it selects an existing
  edit representation; the underlying edits remain `edit.*` / `IPC_EDIT_*`. Pin
  this so no redundant tool is invented.
- **Pane visibility** (C13) — **NOT** a new tool: it is the operator
  `enabledPanes` UI-config surface (human-only), like the settings toggles. An
  agent must not be able to blind the MCP-visible app graph by toggling a pane
  off; pin this so no `provident.toggle_pane`-style tool is invented.

Any new tool must carry a `ToolGroup` row (`security.ts`), an `ALL_TOOLS` row,
the `security-store.ts` `VALID_GROUPS` lockstep update, and the five-seam-gate
reconciliation (`docs/decisions.md`).

---

## 7. Open decisions for the Architect (gate inputs)

| Q | Question | Draft default |
| --- | --- | --- |
| **Q1** | Does `system` re-resolve live? | Yes — track `prefers-color-scheme` via `matchMedia`; persistence is resolved by C9/§3.2 (serialized UI-config state) |
| **Q2** | Settings modal: shell frame + provident operator body, or a fully provident modal? | Shell frame/scrim + existing operator isolated scope body (C3) |
| **Q3** | Drag semantics: HTML5 drag-and-drop on shell handles vs a pointer-based reorder; within-zone only or cross-zone in v1? | Pointer-based on shell handles; within-zone reorder + cross-zone relocate, scope-constrained |
| **Q4** | Markdown/html toggle semantics: does **Markdown** mean editing source and **HTML** mean WYSIWYG (mapping to `editingMode` textarea/contenteditable), or does it toggle the *view/export* representation? | Map Markdown↔`textarea`, HTML↔`contenteditable`; the toggle is an editor control; no export change |
| **Q5** | Central-stage formatting isolation: CSS-scope root vs shadow DOM vs a stylesheet namespace? | A content-scope root token/class boundary (no shadow DOM initially) |
| **Q6** | Layout/appearance store: **RESOLVED by C9/§3.2** — UI settings+config are part of the serialized state (carrier choice a/b/c to be pinned) | Extend `OperatorSettings` as the serialized UI-config state (recommended) |
| **Q7** | Which §5 gaps are in scope for this overhaul vs deferred? | G1–G4 + C1–C8 in scope; G6 consoles as a follow-on unit |
| **Q8** | Hover affordance token name / coverage set | `is-clickable` on every node with a click/select handler; token-driven CSS |
| **Q9** | Does relocation permit moving app-graph panes into header/footer, or only left/right sidebar? | All four zones for app-graph panes; operator panes stay in the operator layer |
| **Q10** | View menu (C13): native application menu vs a provident in-app menu; and how does the pane catalog reach main? | Native View menu (shell carve-out), catalog pushed from the renderer over IPC; no in-app HTML menu |
| **Q11** | Is pane visibility (C13) operator-only, or may the settings modal also host it? | Operator-only; it lives in the View menu, not the modal (the modal hosts operator *panels*) |
| **Q12** | Main-focus tabs (C14): which target kinds are tabbable; is the strip shell-only or app-graph (MCP-dispatchable); and the multi-document CROSS-DOCUMENT-SHARED shared-node semantics? | Tabbable: document/graph/gnosis-doc; shell strip per the directive (accept the dispatch caveat); pick update-all vs fork-on-save for shared nodes |
| **Q13** | Document directory/category (C15): flat vs path-qualified `documentId`; metadata record vs category-node tree; single path vs multi-tag; Gnosis wiki mapping; MCP read surface; migration | **RESOLVED by the C15 gate (2026-09-11, `docs/specs/document-directory-category-review.md`): path-qualified `documentId` + directory-only `documentPath` (supersedes this row's earlier flat default); root-node additive `documentPath`/`tags` (not a metadata record); derived tree; local-only Gnosis v1; single-store `rag.list_documents`; additive migration via read-surface backfill.** Its own gate + slice; `document-directory-category.md` is GATED; G2 consumes it |
| **Q14** | `provident.journal` UI (C16/PG1): **(2026-09-11)** undo/redo buttons **+ an interactive history sub-pane**; clicking an entry undoes the journal **back to that point** | **RESOLVED (2026-09-11): repeated `undo`** — undo/redo + history list; click-to-undo-to-point implemented as N successive `undo` calls (user-confirmed "repeat undo is fine"). `replay` is not a separate control || **Q15** | `module:<name>.<tool>` invocation (PG12): can the module manager run a module tool, and is that operator-only? | Operator-only runner in the modal module manager; never MCP-exposed (module tools already gate on `module`+`code`) |
| **Q16** | PG5/PG7 streams: render incrementally, or collect-then-render? | Collect-then-render v1 (both parsers already return a full list); incremental only if local retrieval becomes streamed |
| **Q17** | Import directory scope (C17): recursive or top-level only; hidden dirs; `.markdown` too; symlinks; cap on file count | Top-level `.md` (+ `.markdown`) only, non-recursive v1 unless nesting is wanted; skip dot-dirs; no symlink follow; a sane file-count cap with a fail-loud message |
| **Q18** | Import menu placement: also an in-pane Import control in G2, or File-menu only? | Both — File menu is the primary; the G2 doc-nav pane may also expose an Import control (same handler) |
| **Q19** | Structural-edit toolbar (G1): which of `create_node`/`delete_node`/`split_node`/`merge_node`/`set_edge` get UI controls in v1? | **RESOLVED (2026-09-11): none — the `edit.*` ops are indirectly represented by the contenteditable editor (save-on-blur).** No toolbar in v1; verify split/merge/edge reachability through the editor |
| **Q20** | PARTIAL priority: close PARTIAL coverage before or alongside the active GAPs? | PARTIAL first (cheaper, larger volume) per §5.5 order |
| **Q21** | C19 hover-preview: what does it show, and the exact dismissal rule? | Above the link: the linked **node section** or, for a document link, a **summary/opening**; dismiss 0.5 s after the pointer leaves the link **or** the popup; a re-hover within the window cancels dismissal |
| **Q22** | C19 hover-preview scope/timing: `moz`-style delay before show; popup itself hoverable; app-graph vs operator | Show on `mouseover` (small show delay optional); popup is hoverable (pointer can enter it); app-graph (MCP-visible); timing is a shell mechanic, content is provident |
| **Q23** | C18 advanced-search: which fields in the dropdown sub-pane; `stores:'all'` visible? | All `rag.query` fields incl. `filters` + `stores:'all'`; absorb the C15 `documentPathPrefix`/`tags` when they land |
| **Q24** | **C9 carrier (prerequisite gate, §8.1):** where does the serialized UI-config state live — extend `OperatorSettings`, extend `SerializedRenderDoc`, or a new `UIState` doc? | Extend `OperatorSettings` (one versioned shape: theme + layout + tabs + `enabledPanes`); pin BEFORE U-SHELL-1, so layout/theme/visibility/tabs all persist through one store. This is the Wave-0 decision (Q6 is now this question) |

### 7.1 Open-question review (2026-09-11)

A review of all Q1–Q24 (this spec), U-STATE-1 §6 (A1–A10), and umbrella §6
(K/A items). **RESOLVED** = the conversation already decided it; **CLOSE-BY-
DEFAULT** = the draft default is safe to adopt; **OPEN-BLOCKS** = must be
answered before its dependent unit.

**RESOLVED (no action):**

| Q | Resolution | Source |
| --- | --- | --- |
| Q6 / Q24 | **RESOLVED** — `UI-CONFIG-CARRIER` decision: extend `OperatorSettings` | decision row 2026-09-11 |
| Q13 | **RESOLVED** — C15 gate (path-qualified `documentId`, additive root fields, derived tree, local-only Gnosis v1) | `document-directory-category-review.md` |
| Q14 | **RESOLVED** — undo/redo + history sub-pane; click-to-undo-to-point via repeated `undo` | user 2026-09-11 |
| Q19 | **RESOLVED** — no structural-edit toolbar; `edit.*` covered by the contenteditable/save-on-blur editor | user 2026-09-11 |
| Q20 | **RESOLVED** — PARTIAL first, per §5.5 order | this spec |

**CLOSE-BY-DEFAULT (adopt the draft; note but do not block):**

| Q | Default to adopt |
| --- | --- |
| Q1 | Yes — `system` tracks `matchMedia('prefers-color-scheme')` live |
| Q2 | Shell frame/scrim + the operator isolated-scope body (C3) |
| Q3 | Pointer-based shell handles; within-zone reorder + scope-constrained cross-zone relocate |
| Q4 | Markdown↔`textarea`, HTML↔`contenteditable`; editor control only, no export change |
| Q5 | Content-scope token/class boundary (no shadow DOM v1) |
| Q7 | In scope: C1–C19; G6 consoles parked (plugin handling); streams parked (deep impl) |
| Q8 | `is-clickable` on every click/select handler node |
| Q9 | All four zones for app-graph panes; operator panes stay operator-layer |
| Q10 | Native View menu; catalog pushed from renderer over IPC |
| Q11 | Pane visibility operator-only, in the View menu |
| Q15 | Operator-only module-tool runner in the modal module manager |
| Q16 | Collect-then-render (streams parked anyway) |
| Q17 | Top-level `.md`+`.markdown`, non-recursive v1, skip dot-dirs, no symlinks, file-count cap |
| Q18 | File menu primary + optional in-pane G2 Import control (same handler) |
| Q21/Q22 | Hover-preview above the link, 0.5 s dismissal, hoverable, app-graph |
| Q23 | All `rag.query` fields + `stores:'all'`; absorb C15 filters |

**OPEN-BLOCKS (must be answered before the dependent unit starts):**

| # | Question | Blocks | Why it blocks | Proposed answer |
| --- | --- | --- | --- | --- |
| **OB1** | **Tabs CROSS-DOCUMENT-SHARED semantics** (Q12 / umbrella K5/A6) | U-SHELL-9 (C14) | Multi-tab render makes shared-node duplicates live; without a rule, editing a shared node is undefined | **RESOLVED (2026-09-11, user): Option C — warn on commit, then let the user choose fork (this document only) or mutate all owners.** Plus a **shared-subtree visualization** (C20): a background-color change on shared subtrees + a collapsible description box listing the sharing articles. See §7.2. |
| **OB2** | **Layout graph-vs-shell split** (umbrella K3/A5/A11) | U-SHELL-1 (zones/layout) | Which layout facts are graph nodes vs shell attributes determines persistence + MCP visibility | **RESOLVED (2026-09-11, user): Reading 2.** Zones + pane roots + layout state are provident/graph (MCP-visible); the serialized `LayoutState` (C9) is the source of truth the graph mirrors; the shell owns only grid geometry/gutters/drag mechanics/tokens. See §7.3. |
| **OB3** | **U-STATE-1 diff mechanism** (U-STATE-1 §6 Q1–Q3) | U-STATE-1a | The reconciler design is the unit's core | **Payload-driven primary, full-subgraph fallback; new pure reconciler module; whole-document-root replace v1** (simpler; per-subtree later if profiling demands) |
| **OB4** | **U-STATE-1 SSR re-emit** (U-STATE-1 §6 Q4) | U-STATE-1b | PAR-5 must hold | **Full SSR re-emit from the reconciled graph; DOM stays surgical** |
| **OB5** | **U-STATE-1 scope** (U-STATE-1 §6 Q5 / A10) | U-STATE-1 units | Prevents scope creep | **Mechanism-only** — no chrome/zones/tabs (but see OB2: zone nodes are graph, so the reconciler must preserve them) |
| **OB6** | **Umbrella scope** (umbrella §6 Q2) | delegation | Determines whether one gate or per-track gates | **Umbrella-only**: this gate approves contract+ordering; per-unit specs still required (A1) |
| **OB7** | **Parity wave timing** (umbrella §6 Q5) | U-PARITY | Affects wave scheduling | **Parallel (Wave 1)** — parity is chrome-independent; front-loads coverage wins |
| **OB8** | **Umbrella verdict** (umbrella §6 Q1) | all units | The gate's output | **PROCEED-WITH-AMENDMENTS** (proposed in the draft) |

### 7.2 OB1 resolved — shared-node editing: warn + choose (C20)

**Ruling (2026-09-11, user): Option C.** On a commit that targets a
**CROSS-DOCUMENT-SHARED** node (a node owned by >1 document), the editor
**warns** and offers the choice:
- **Fork** — create a copy owned only by the editing document; other documents
  keep the original (the copy-on-write path: `edit.create_node` +
  `edit.set_edge`; the edited document's edges re-point to the fork).
- **Mutate both (all owners)** — apply the edit to the single shared node; every
  owning document re-derives and shows the change (`edit.set_content` on the one
  node).

Detection uses the reverse map (`backRefs: Map<ragNodeId, nodeId[]>` —
`SUBTREE-OWNERSHIP`) surfaced via `rag.backlinks`/the `edit.*` seam.

**Shared-subtree visualization (C20):**
- **Background-color change** on any subtree that is shared by >1 document,
  rendered as a provident node `css.classes`/hook (a token-driven background),
  app-graph → MCP-visible and `get_rendered_html`-reflecting.
- **Collapsible description box** listing the sharing articles (the owning
  documents' titles/ids), authored as a provident subtree with an `on:click`
  toggle; the list is derived from the reverse map.
- Both are **properties of the materialization**, not stored on the RAG node;
  the *sharing fact* is the authoritative edge/ownership data.

**Interactions:** OB1 couples to **U-STATE-1** identity — a fork changes the
edited node's identity in that document while other owners keep the original id,
so the reconciler must handle a post-commit identity change (a replace, not a
content update). The C20 background/box are counted in the parity census as
view-only aids with no MCP counterpart (the sharing fact is readable via
`rag.backlinks`).

### 7.3 OB2 resolved — layout split: Reading 2

**Ruling (2026-09-11, user): Reading 2, stated precisely.**

| Layer | Owner | MCP-visible |
| --- | --- | --- |
| Zone container nodes, pane roots, content roots | **Provident graph** (`targetPlacement` + container role + `pane-<id>`) | **yes** |
| Layout **state** — collapsed / minimized / visible / order / sizes | **Serialized `LayoutState`** (C9, `OperatorSettings`) is the source of truth; **mirrored** into the graph as node `css.classes`/hooks for the state-derived visibility rendering | state mirror **yes**; serialized store no |
| CSS grid geometry, gutters, drag/pointer mechanics, focus/inert, root theme tokens | **Shell chrome** | no |

**Correction this requires:** §2/§2.1 Table C's "outer window/grid geometry"
line must read **geometry only** — zone *containers/placement* are Provident
(already listed so in §2.1 Table A). The spec previously carried both readings;
Reading 2 is now authoritative.

**Consequence for U-STATE-1 (OB5):** the reconciler must **preserve zone
container nodes** across a RAG change, not only document content roots — so
"mechanism-only" scope still includes zone-node preservation.

### 7.4 Open findings from the review

**Findings from the review:**

- **No contradictions remain** among the open questions; the in-conversation
  corrections (C10-hard, C16 history, PG1/PG2) were folded in and the Q-set is
  consistent.
- **All eight OPEN-BLOCKS have a low-risk proposed answer** — none requires new
  discovery; they are rulings the Architect can confirm in one pass.
- **Q12/OB1 is the only one with a real behavioural fork** (fork-on-save vs
  update-all); the rest are mechanical defaults.
- **Q7 contradicts the older §7 text** ("C1–C8 in scope; G6 as follow-on") —
  superseded by the full C1–C19 scope; close by default at C1–C19.
- Two Q rows in this table were **malformed during drafting** (Q14/Q15 ran
  together on one line; fixed here).

**Recommendation:** confirm OB1–OB8 in a single Architect pass; all other Q's
close by default. OB1 (fork-on-save) and OB2 (layout split) are the two worth a
deliberate decision.

---

## 8. Proposed unit decomposition (draft; RCA-2 — one red→green→adversarial→greens→doc-review cycle per unit)

### 8.1 Prerequisite / dependency analysis (implementation order)

The listed order is **not** a dependency order — it was a catalogue order. The
real graph, grounded in the current wiring:

**Root prerequisites (must land before dependents):**

| Unit | Prereq for | Verified coupling |
| --- | --- | --- |
| **U-STATE-1** content-only repopulation | **all lifecycle-dependent units** (C9, C11, C12, C14, C16, C13, C18, C19) | `loadAppGraph`→`runtime.loadEnvelope`→`tearDownGraph` (`runtime.ts:325/759`) destroys every node on each RAG change; `mountOperator` re-creates the isolated scope + `replaceChildren` on every `refresh` (`sidebar-panes.ts:632/635`); `renderOperator` compiles a fresh root (`:1751`). **The journal is also destroyed:** `loadEnvelope` constructs a NEW `Supervisor` each call (`runtime.ts:339`), so `runtime.journal()`'s undo/redo stack (`:602`) is wiped on every re-derive — **U-EDIT-2 (C16) depends on U-STATE-1**, not independent. |
| **U-MENU-1** application menus | **U-IMPORT-1, U-SHELL-8** | no `Menu`/`setApplicationMenu`/`showOpenDialog` exists in `main.ts` at all |
| **U-SHELL-1** layout model + zones | **U-SHELL-3/4/5/7/9, C11/C12** | panes currently assemble into one fixed `SIDEBAR_ZONE` (`pane-graph.ts:17/37`); no zones exist |
| **U-SHELL-2** appearance/tokens (C9 state) | U-SHELL-1 size/reveal styling; C3 modal theming | `index.html` is `@media`-only; no tokens/`:root` override |
| **C9 serialized UI-config state** | layout persistence (C4/C7/C12), pane visibility (C13), tabs (C14), theme (C1) | today only `OperatorSettings.enabledPanes` exists (display-only); no layout/tabs/theme store |

**Dependency DAG (authoritative order):**

```
U-STATE-1 (keystone, independent)
   │
   ├── U-SHELL-1 (zones/layout model)
   │      ├── U-SHELL-3 (collapse)      ── needs a frame/zone
   │      ├── U-SHELL-4 (drag/relocate + C11) ── needs zones + U-STATE-1 (ref stability during drag/drop)
   │      ├── U-SHELL-5 (gutters)        ── needs zones
   │      ├── U-SHELL-9 (tabs)           ── needs the top-bar region + U-STATE-1 (tab content identity)
   │      └── U-SHELL-7 (modal)          ── needs the isolation mount + a top-bar/sidebar toggle host (C3)
   ├── U-SHELL-2 (tokens/theme)          ── independent; feeds U-SHELL-1 styling
   └── U-EDIT-2 (C16 undo/redo+history)  ── needs U-STATE-1: loadEnvelope rebuilds the Supervisor → the journal stack is wiped per re-derive

U-MENU-1 (independent)
   ├── U-IMPORT-1 (C17)                  ── + U-STATE-1 (import repopulates content-only)
   └── U-SHELL-8 (C13 pane visibility)   ── + U-SHELL-1 (zones) + C9 (enabledPanes serialized)

C9 (serialized UI-config)               ── gate item; underpins U-SHELL-1/2/8/9 persistence
U-EDIT-1, U-SHELL-6                     ── independent (consume existing editingMode / CSS)
U-PARITY (C18, C19, PARTIALs, decisions)── independent of chrome; C18 must co-land with C15 filters
```

**Independent (can run any time, no prereq):** U-EDIT-1 (C8), U-SHELL-6 (C6 hover
— pure CSS/class), U-MENU-1, U-SHELL-2 (C1), U-PARITY (C18/C19/PARTIALs).
**NOT independent (corrected):** U-EDIT-2 (C16) — it depends on U-STATE-1,
because the undo/redo **journal stack is destroyed on every re-derive** (a new
`Supervisor` per `loadEnvelope`, `runtime.ts:339`; `runtime.journal()` reads that
supervisor's stack, `:602`).

**Critical recomposition findings vs the catalogue order:**

1. **U-STATE-1 is a genuine root**, not just "first among equals". Every unit
   whose claim is "state survives a RAG change" (C9/C11/C12/C14/C16/C19 ref
   stability) is unprovable until it lands. Build it first, alone.
2. **U-MENU-1 should be split out and ordered before U-IMPORT-1/U-SHELL-8.** The
   current catalogue implies menus exist; they do not. U-MENU-1 is small
   (native menu shell) and unblocks two units.
3. **U-SHELL-7 (modal) depends on the C3 isolation mount, which depends on the
   existing `mountOperator` isolation scope surviving U-STATE-1** (today it is
   re-created per refresh). So U-SHELL-7 is not independent of U-STATE-1.
4. **C9 is a shared contract, not a unit.** Layout (U-SHELL-1), theme
   (U-SHELL-2), visibility (U-SHELL-8), and tabs (U-SHELL-9) all persist
   through it. It should be **pinned as a decision first** (carrier: extend
   `OperatorSettings` vs `SerializedRenderDoc` vs a new `UIState` doc — §3.2),
   then each unit adds its slice. Do not let each unit invent its own store.
5. **C14 tabs depend on the top-bar region** (a shell layout change), so they
   belong after U-SHELL-1, not beside U-SHELL-8.
6. **U-PARITY is independent of all chrome** — C18/C19/PARTIAL closures touch
   pane content, not layout — so parity work can proceed in parallel with the
   shell if two tracks are wanted. Only C18 must co-land with the C15 `filters`
   (U-D6) to avoid widening the asymmetry.
7. **C15 (doc-directory) is an external prerequisite of the G2 doc-nav tree**
   and of C18's `filters` UI — its gate is already complete (GATED), so it can
   start now in parallel with U-STATE-1 (different code: store/import vs
   renderer).
8. **U-EDIT-2 (C16) is NOT independent (corrected).** The undo/redo journal
   stack lives on the `Supervisor`; `loadEnvelope` constructs a new one each
   re-derive (`runtime.ts:339`), so a RAG change **wipes the undo history**.
   U-EDIT-2 therefore depends on U-STATE-1 — otherwise the history sub-pane
   empties on every store change. This also means C16's history list length is
   only meaningful once repopulation preserves the supervisor.

**Recommended execution waves:**

- **Wave 0 (parallel):** `U-STATE-1` (keystone) ∥ `C9 carrier decision` ∥ the
  C15 slice `U-D1…U-D7` (independent data-model track).
- **Wave 1:** `U-MENU-1`; `U-SHELL-2`; `U-EDIT-1`; `U-SHELL-6`; `U-PARITY`
  (C18/C19/PARTIALs — chrome-independent; C18 co-lands with C15 filters).
- **Wave 2:** `U-SHELL-1` (zones/layout on the C9 carrier) → then
  `U-SHELL-3/4/5/8/9` (each after U-SHELL-1); `U-EDIT-2` (C16, after
  U-STATE-1).
- **Wave 3:** `U-IMPORT-1` (needs U-MENU-1 + U-STATE-1); `U-SHELL-7` (needs
  U-STATE-1 + the mount).

`U-PARITY` is chrome-independent, so it can run in Wave 1 **or** any later wave
in parallel; it is placed in Wave 1 above to front-load the cheap coverage wins.

### 8.2 Unit catalogue

> **Keystone LANDED (2026-09-11):** **U-STATE-1 — content-only repopulation
> (SG1/SG8, §3.1)** is COMPLETE (1a/1b/1c/1d); the units below that depend on it
> may now proceed.
> **Wave order (§8.1) supersedes this list's numbering.**

1. **U-STATE-1 — content-only repopulation** (SG1/SG8) — **DONE (2026-09-11)**; specs `docs/specs/unit-u-state-1a..1c`.
2. **U-SHELL-1 — layout model + zones + persistence** (C4/C5/C7/C12 mechanics; the C9-serialized layout state; SG5).
3. **U-SHELL-2 — appearance tokens + tri-state theme** (C1; SG6).
4. **U-SHELL-3 — collapsible panes** (C5).
5. **U-SHELL-4 — drag/reorder/relocate** (C4, scope-constrained; C11 empty-zone auto-hide + proximity reveal).
6. **U-SHELL-5 — resizable gutters** (C7).
7. **U-SHELL-6 — hover affordance** (C6).
8. **U-SHELL-7 — settings modal** (C3; SG4; needs the isolation mount).
9. **U-EDIT-1 — markdown/html editing toggle** (C8; consumes existing `editingMode`).
10. **U-EDIT-2 — undo/redo + history sub-pane** (C16; editor-toolbar undo/redo **plus an interactive history list**; clicking an entry undoes the journal back to that point).
11. **U-MENU-1 — application menus** (the File menu + View menu shell surface; prerequisite of U-IMPORT-1 + U-SHELL-8; SG3).
12. **U-IMPORT-1 — File → Import…** (C17; needs U-MENU-1; `showOpenDialog` openFile/openDirectory `.md` filter + directory→`.md` expansion + import IPC → the shared `importMarkdownCorpus` handler).
13. **U-SHELL-8 — View-menu pane visibility** (C13; needs U-MENU-1; registry-driven `enabledPanes`, applies at runtime — the setting exists but is currently display-only).
14. **U-SHELL-9 — main-focus tabs** (C14; outer-shell top-bar tab strip + focus-descriptor model + serialized open/active/order tabs).
15. **U-PARITY-1..n — parity pane completion** — ACTIVE set only: **G4 C18 advanced-search dropdown + result detail** (the `rag.query` PARTIAL), **G3 C19 link hover-preview**, `code.template.validate` + `rag.get_document` PARTIAL closures, G9 assistant-suggestions decision (PG13), G7 module-tool decision (PG12), G2 doc-nav select (PG14/SG7). **(G6 consoles PARKED — plugin handling; `provident.export`/`validate` PARKED — app integrations; PG3/PG4 G3 inspectors PARKED — post-MVP knowledge-graph tools; PG5/PG7/PG8 streams PARKED — deep implementation; PG6 audit PARKED; PG1 journal COVERED by U-EDIT-2; PG2 import COVERED by U-IMPORT-1; the `edit.*` structural ops are EXISTS-by-editor, no unit.)** Group per §5.6; split per independently-spec'd seam per RCA-2.

**Coverage:** every ACTIVE PG (§5.1), PARTIAL (§5.4), and structural gap (§5.7
SG1–SG10) maps to a unit above. SG3 (no menus) is a prerequisite of U-MENU-1 →
U-IMPORT-1 + U-SHELL-8; SG4 of U-SHELL-7; SG1/SG8 of everything
lifecycle-dependent.

**Separate slice — C15 (document directory/category).** Not a shell unit: it is a
data-model change (`path`/`tags` + store-format + import + traversal + MCP read
surface) requiring its **own** proposal gate and its own red→green→adversarial→
greens→doc-review units. The UI overhaul's G2 doc-nav tree is a **consumer** of
that slice and should land after it.

Each unit is delegated separately; no unit shares a red→green run with a sibling
(AGENTS.md item 2/RCA-2).

---

## 9. Cross-references

- `docs/decisions.md`: `PANE-REGISTRY`, `PANE-PROVIDENT-AUTHORING`,
  `APP-GRAPH-PANES-MCP-VISIBLE`, `OPERATOR-ISOLATED-GRAPHSCOPE`,
  `TEMPLATE-PANE`, `UI-MOUNT-*`, `MCP-UI-EQUIVALENCE`,
  `RAG-QUERY-STORE-DISPLAY-ASYMMETRY`, `GNOSIS-SECURITY-CARVE-OUT`.
- `docs/pending.md` SPECULATIVE: click-drag moveable pane layout; crosslink
  hover-preview pane; GUI audit panel; doc-nav select not dispatchable;
  **document tabs (C14)** — now in scope.
- `docs/specs/unit-h-sidebar-panes.md`, `unit-k-sidebar-panes-host.md`,
  `unit-i-template.md`, `unit-x-rag-provenance-traversal.md`,
  `unit-gn-mcp-ui-wiring.md`, `unit-a2-document-crud-wiring.md`.
- `docs/specs/astrographer-review.md` §8.2 (the BINDING MCP/UI equivalence).
- C15 (document directory/category) surfaces: `src/main/markdown-import.ts`
  (`sanitizeDocumentId` basename derivation, the corpusRoot/containment seam),
  `src/main/markdown-parse.ts` (doc-flow edges), `src/main/doc-flow.ts`
  (validation rules incl. `doc-child`), `src/main/rag-store.ts` / `shared/types.ts`
  (`RagNode`), `src/main/engine-crud-rag-store.ts` (Gnosis `wikiId`/`tags`), and
  the additive-change precedent `CHILDREN-ADDITIVE-STORE-FORMAT`
  (`docs/decisions.md`).
- Persistence/serialization surfaces relevant to C9/§3.2: `src/main/operator-settings-store.ts`
  (`OperatorSettings` + `sanitize` fail-soft), `src/main/template-store.ts`,
  `src/main/security-store.ts` (credentials — excluded from the serialized
  UI-config state), `decisions.md` `TEMPLATE-STORE` / `MULTI-STORE-REGISTRY`;
  the engine `SerializedRenderDoc` (`serializeSlice`/`loadState`, candidate b).
