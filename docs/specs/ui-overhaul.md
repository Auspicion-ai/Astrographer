# UI Overhaul — Spec Draft (document-only; proposal gate pending)

**Status:** DRAFT 2026-09-11. **Document-only — no code, no tests, no tracker
status changes beyond the draft pointer.** This overhaul changes the shell/UI
contract, so per AGENTS.md item 8 it must pass the three-agent proposal gate
(validity → critique → change-analysis) and land as
`docs/specs/ui-overhaul-review.md` **before any code**. This file is the draft
input to that gate: it records the confirmed top-level constraints (§1), the
shell-vs-provident boundary that every constraint must respect (§2), the pane
layout model (§3), and the MCP/UI-parity pane grouping (§4–§6). Open decisions
for the Architect are collected in §7. Proposed unit decomposition in §8.

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
| **C3** | Settings hidden by default; appear in a modal when clicking a toggle at the bottom of the left sidebar | Settings is always-rendered at the bottom as the operator `settings` pane (`registerPanes`), mounted in `#operator-panes` | A **modal layer** (shell chrome) that hosts the operator isolated-scope settings content. Hidden by default; a fixed toggle button at the bottom of the left sidebar opens it. The settings *content* stays provident-authored in the operator scope; the modal frame is shell chrome. |
| **C4** | Utility panes (wiki document list, cross-link info, search tools, assistant suggestions, etc.) have handles to drag and rearrange within the sidebar or relocate between sidebars/header/footer | Panes are assembled into one fixed `[sidebar]` zone in registration order; no handles, no reorder, no relocation | A **pane layout model** (§3): each pane carries a drag handle (pane header); panes can be reordered within a zone and relocated across `left`/`right`/`header`/`footer` zones. Placement is user preference that overrides the registry default. Pane *content* stays provident-authored; the handle/frame is shell chrome. |
| **C5** | Panes are collapsible | None | Each pane (and each pane zone) has a collapse toggle; collapsed state persists. Collapsed = header/handle only. |
| **C6** | Clickables (e.g. document names in the wiki list) highlight on mouseover to indicate clickable status | Ad-hoc; no consistent affordance | A shared hover affordance authored on clickable provident nodes (a `css.classes` token, e.g. `is-clickable`), highlighted by token-driven CSS. Applies to doc-nav items, wiki items, result rows, and every node carrying a click/select handler. |
| **C7** | Side widths can be adjusted by drag | Fixed grid (`1fr 1fr`) | Resizable gutters between the zone columns/rows; widths/heights persist. Shell chrome. |
| **C8** | Document editing has markdown/html toggle | `editingMode` operator setting selects `'textarea'` (plain text) vs `'contenteditable'` (rich). No user toggle in the document editor; the setting is buried in the operator pane | An editor-toolbar toggle in the **central stage** (app-graph, MCP-visible) switching the editing representation: **Markdown** (source textarea) ↔ **HTML** (rich `contenteditable`). Drives the existing `editingMode` seam + re-derive. See §7 Q4 for the exact semantics to pin. |

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
  zones:   { left: { size: number }, right: { size: number },
             header: { size: number }, footer: { size: number } }
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
  `stage`. The current single `[sidebar]` maps to `left`.
- **Persistence:** layout + appearance persist through a NEW operator-scoped
  store (shell-owned, non-credential) — see §7 Q6. Layout is shell state, not a
  pane body, so it is not authored as graph content.
- **Pane framing:** each pane renders as a mounted shell frame containing the
  provident-authored pane subtree (the existing `pane-<id>` root). The frame
  supplies the handle + collapse toggle; the body is untouched provident content.
- **Relocation legality:** a pane's draggable zone set derives from its scope
  (an operator pane cannot move into the app-graph sidebar and remain
  MCP-invisible — see §5).

---

## 4. MCP/UI parity — pane grouping (the requested grouping)

**Parity rule (existing, `MCP-UI-EQUIVALENCE`):** every MCP tool with a UI IPC
counterpart routes through the SAME shared handler. The overhaul completes the
*coverage* direction: the pane catalog below is organized so every MCP tool
group has a named UI home. Status vocabulary: **EXISTS** (pane landed),
**PARTIAL** (pane landed but the tool's full arg surface is not reachable),
**GAP** (no UI home yet), **CARVE-OUT** (intentionally UI-only or
MCP-invisible).

### G1 — Document (focus + editing) → central stage + editor toolbar

| Pane / control | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Central document stage | app-graph | `provident.get_rendered_html`, `provident.get_markdown` (view); `provident.list_targets`, `provident.get_node_state` (inspect) | EXISTS (read), PARTIAL (inspect) |
| Editor toolbar / inline editor | app-graph | `edit.set_content`, `edit.create_node`, `edit.delete_node`, `edit.split_node`, `edit.merge_node`, `edit.set_edge` | PARTIAL |
| Markdown/HTML editing toggle (**C8**) | app-graph | (drives `editingMode`; no MCP tool — see §6) | GAP |
| Paste/rich commit surfaces | app-graph | (existing U5/U4 bridge) | EXISTS |

### G2 — Navigation

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Document navigator (`doc-nav`) | app-graph | `rag.get_document` (select), doc-heads listing | PARTIAL — doc-nav `li` nodes are not dispatchable (parked row; §5) |
| Wiki/document list (`gnosis-documents`, `gnosis-wikis`) | app-graph | `gnosis.document.list`, `gnosis.wiki.list`/`get` | EXISTS |

### G3 — Graph (nodes, edges, links)

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Links/backlinks (`crosslinks`) | app-graph | `rag.backlinks` (crosslinks + back-refs) | EXISTS |
| Node census | app-graph | `rag.list_nodes` | GAP |
| Edge inspector | app-graph | `rag.get_edges`, `rag.get_document` | GAP/PARTIAL |
| Graph-neighborhood / path view | app-graph | `rag.get_document` (scoped subgraph) | GAP |

### G4 — Retrieval / search tools

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Search pane (`search`) | app-graph | `rag.query` | PARTIAL — UI exposes query + topK only; `mode`/`maxHops`/`expand`/`maxParentContext`/`filters`/`stores` not reachable |
| Result detail / citations | app-graph | `rag.query` result fields (`citations`/`trace`/`blockedBy`/`results`) | PARTIAL |
| Streamed results | app-graph | `rag-stream` | GAP |
| Query audit panel (**parked**) | app-graph | `get_query_audit_log` | GAP (parked row `docs/pending.md`) |

### G5 — Gnosis engine

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Engine status (`gnosis-status`) | operator | `gnosis.status` | EXISTS |
| Engine query (`gnosis-query`) | app-graph | `gnosis.query` | EXISTS |
| Streamed engine results | app-graph | `gnosis.stream` | GAP |
| Gnosis documents editor | app-graph | `gnosis.document.get/list/create/update/delete/publish/unpublish/archive` | EXISTS (live-pending scenarios parked) |
| Gnosis wikis | app-graph | `gnosis.wiki.get/list/create` | EXISTS |

### G6 — Template + graph/code console

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Template editor (`template-editor`) | app-graph | `code.template.get/validate/set/create/delete/reset` | EXISTS |
| Envelope/code console | app-graph | `provident.code.get/validate/set/create/delete/load/loadBatch` | GAP |
| Graph console | app-graph | `provident.load/op/export/validate/teardown/journal` | GAP |
| Dispatch/observe console | app-graph | `provident.dispatch` | GAP (read side exists via rendered HTML) |

### G7 — Modules

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Module manager (`module-pane`, SecurePanels) | operator | `module.install/update/list/enable/disable` | EXISTS but **CARVE-OUT** — operator scope, not MCP-visible (matches security) |

### G8 — Security & operator settings (intentional MCP-invisible)

| Pane | Scope | Mirrors | Status |
| --- | --- | --- | --- |
| Security (`settings-pane`, SecurePanels) | operator | security `get`/`set` IPC | EXISTS — CARVE-OUT (credentials never MCP) |
| RAG store registry manage | operator | `IPC_RAG_STORE_MANAGE` | EXISTS — CARVE-OUT |
| RAG store listing | operator | `IPC_RAG_STORE_LISTING` | EXISTS — CARVE-OUT |
| Operator settings (topK, editingMode, default doc) | operator | operator-settings IPC | EXISTS — CARVE-OUT |
| Appearance / pane layout | shell + operator | (new; §3) | GAP — CARVE-OUT (shell state) |

### G9 — Assistant suggestions (**C4-named, currently absent**)

| Pane | Scope | Mirrors MCP tools | Status |
| --- | --- | --- | --- |
| Assistant suggestions | app-graph (draft) | **none yet** | GAP — no MCP tool exists; see §6 |

### G10 — Layout / appearance chrome

Central stage, zone gutters, pane handles, collapse toggles, modal frame, theme
tokens — **shell chrome** (§2), no MCP counterpart. The *settings controls* that
operate them are provident operator-pane content.

---

## 5. Parity gaps and carve-outs (what the gate must adjudicate)

1. **Doc-nav not dispatchable** — `docs/pending.md` row: the `doc-nav` `li`
   targets carry no handler, so an agent cannot select a document via
   `provident.dispatch`. Close as part of G2 (give each item a handler).
2. **Search filters unreachable in UI** — G4: the UI must expose the `rag.query`
   argument surface (`mode`/`maxHops`/`expand`/filters/`stores`) or the gate must
   record an explicit display-only asymmetry (sibling of
   `RAG-QUERY-STORE-DISPLAY-ASYMMETRY`).
3. **Audit panel parked** — G4: the `rag-query-audit` IPC + panel are a named
   parked item; fold into this overhaul or keep parked.
4. **Code/graph/dispatch consoles** — G6: no UI for `provident.code.*`,
   `provident.graph.*`, or `provident.dispatch`. These are the largest parity
   gaps; decide whether the overhaul is the unit that closes them.
5. **Assistant suggestions** — G9: the only named utility pane with no MCP
   counterpart. Decide UI-first (carve-out) vs adding an MCP tool (§6).
6. **Operator/settings/security carve-outs stand** — G7/G8 remain
   MCP-invisible by design (`OPERATOR-ISOLATED-GRAPHSCOPE`); the overhaul must
   not "fix" that. Credentials stay out of every MCP `inputSchema`
   (`GNOSIS-SECURITY-CARVE-OUT`).
7. **Relocation vs scope** — a relocated pane must keep its scope's
   visibility (operator panes stay out of the MCP-visible app graph). The
   layout model must encode this (§3).
8. **Theme is shell state, not a graph concern** — do not surface theme as a
   pane-body mutation; it is token application at the shell root. The control
   lives in the operator settings pane.

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

Any new tool must carry a `ToolGroup` row (`security.ts`), an `ALL_TOOLS` row,
the `security-store.ts` `VALID_GROUPS` lockstep update, and the five-seam-gate
reconciliation (`docs/decisions.md`).

---

## 7. Open decisions for the Architect (gate inputs)

| Q | Question | Draft default |
| --- | --- | --- |
| **Q1** | Appearance persisted where, and does `system` re-resolve live? | NEW shell layout store; `system` tracks `prefers-color-scheme` via `matchMedia` |
| **Q2** | Settings modal: shell frame + provident operator body, or a fully provident modal? | Shell frame/scrim + existing operator isolated scope body (C3) |
| **Q3** | Drag semantics: HTML5 drag-and-drop on shell handles vs a pointer-based reorder; within-zone only or cross-zone in v1? | Pointer-based on shell handles; within-zone reorder + cross-zone relocate, scope-constrained |
| **Q4** | Markdown/html toggle semantics: does **Markdown** mean editing source and **HTML** mean WYSIWYG (mapping to `editingMode` textarea/contenteditable), or does it toggle the *view/export* representation? | Map Markdown↔`textarea`, HTML↔`contenteditable`; the toggle is an editor control; no export change |
| **Q5** | Central-stage formatting isolation: CSS-scope root vs shadow DOM vs a stylesheet namespace? | A content-scope root token/class boundary (no shadow DOM initially) |
| **Q6** | Layout/appearance store: extend `OperatorSettings` or a separate shell-owned persisted file? | Separate shell-owned store (layout is not an operator tool setting) |
| **Q7** | Which §5 gaps are in scope for this overhaul vs deferred? | G1–G4 + C1–C8 in scope; G6 consoles as a follow-on unit |
| **Q8** | Hover affordance token name / coverage set | `is-clickable` on every node with a click/select handler; token-driven CSS |
| **Q9** | Does relocation permit moving app-graph panes into header/footer, or only left/right sidebar? | All four zones for app-graph panes; operator panes stay in the operator layer |

---

## 8. Proposed unit decomposition (draft; RCA-2 — one red→green→adversarial→greens→doc-review cycle per unit)

1. **U-SHELL-1 — layout model + zones + persistence** (C4/C5/C7 mechanics; enable/disable/size/collapse state).
2. **U-SHELL-2 — appearance tokens + tri-state theme** (C1).
3. **U-SHELL-3 — collapsible panes** (C5).
4. **U-SHELL-4 — drag/reorder/relocate** (C4, scope-constrained).
5. **U-SHELL-5 — resizable gutters** (C7).
6. **U-SHELL-6 — hover affordance** (C6).
7. **U-SHELL-7 — settings modal** (C3).
8. **U-EDIT-1 — markdown/html editing toggle** (C8; consumes existing `editingMode`).
9. **U-PARITY-1..n — parity pane completion** (G4 filters/audit, G3 node/edge, G2 dispatchable doc-nav, G6 consoles) — split per pane per RCA-2.

Each unit is delegated separately; no unit shares a red→green run with a sibling
(AGENTS.md item 2/RCA-2).

---

## 9. Cross-references

- `docs/decisions.md`: `PANE-REGISTRY`, `PANE-PROVIDENT-AUTHORING`,
  `APP-GRAPH-PANES-MCP-VISIBLE`, `OPERATOR-ISOLATED-GRAPHSCOPE`,
  `TEMPLATE-PANE`, `UI-MOUNT-*`, `MCP-UI-EQUIVALENCE`,
  `RAG-QUERY-STORE-DISPLAY-ASYMMETRY`, `GNOSIS-SECURITY-CARVE-OUT`.
- `docs/pending.md` SPECULATIVE: click-drag moveable pane layout; crosslink
  hover-preview pane; GUI audit panel; doc-nav select not dispatchable.
- `docs/specs/unit-h-sidebar-panes.md`, `unit-k-sidebar-panes-host.md`,
  `unit-i-template.md`, `unit-x-rag-provenance-traversal.md`,
  `unit-gn-mcp-ui-wiring.md`, `unit-a2-document-crud-wiring.md`.
- `docs/specs/astrographer-review.md` §8.2 (the BINDING MCP/UI equivalence).
