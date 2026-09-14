# Astrographer → Provident Development Agent — Feature-Request Handoff

This is the issue-handoff document (AGENTS.md item 7, adapted): the catalogue
of genuine engine/foundation gaps discovered while building Astrographer (a
hybrid human-readable local wiki + graph RAG on a fork of Provident-Electron).
Each row is a feature-request candidate for the ORIGINAL project
(`provident-ssr` / Provident-Electron). The RAG layer is SPECIFIC to this
project, NOT a core feature of the foundation — RAG-specific gaps are built
here, never handed off. Only genuine engine/foundation gaps become handoff
requests. NEVER patch the engine.

## OPEN handoff items

**NONE** — every engine/foundation gap filed against the upstream project has
been resolved upstream (`provident-ssr` 0.4.0/0.4.1) or made obsolete by the
0.4.x design changes. The former OPEN rows (ENG-INLINE-ORDER,
ENG-BODYRUNS-WIRE-REF-PATHSTATE, ENG-DESTROY-PLACEMENT-ANCHOR-RESIDUE,
ENG-SUPERVISOR-HOOK-ACCUMULATION) now live in the
`## SHELVED / CLOSED` table below; HOST/U1-ENG resolved via upstream
`BOOLEAN-ATTRS` in `provident-ssr@0.5.0` (see `## RESOLVED / CLOSED`).

**HANDOFF update (2026-09-12, Wave-2 Q14 → RESOLVED):** filed **ENG-JOURNAL-ENTRY-READ-API** (journal introspection). **RESOLVED upstream in `provident-ssr@0.5.0` (2026-09-12):** `Supervisor.journalEntries(opts?): JournalView` ships the sanitized, JSON-safe reader (`JournalEntryView {index,kind,status}` + `fromIndex`/`totalEntries`/`truncated`/`undoDepth`/`redoDepth`/`basePresent`/`undoBaseBoundary`/`undoTopKind?`/`redoTopKind?`/`maxJournalLength?`; window `afterIndex?`/`limit?` clamped `[1,1000]`). Upgrade verified (typecheck 0, build OK, 171 files / 3989 pass + 46 skip). The host consumes it via the **re-scoped U-JR1** `provident.get_journal` tool; **U-EDIT-2** is unblocked on the engine read surface (the C16-consumption ruling still applies). See `DECIDED: JOURNAL-READ-VIA-PACKAGE`.

**HANDOFF update (2026-09-11b, provident-ssr 0.4.1):** both candidates below are
**RESOLVED upstream in 0.4.1** — `Supervisor.dispose()` (finalize-hook + node-map
release) and `destroyLinks` detaching `content`/`container` placement anchors
from the shared per-name Link. Astrographer upgraded to `provident-ssr@^0.4.1`
(trio green). The host should call `Supervisor.dispose()` on a discarded
Supervisor and may reuse a persistent hub across destroys.

**HANDOFF update (2026-09-10, Unit A2 landed):** A2 introduced **NO new
engine/foundation gaps** — the A2 adversarial pass found NO defect in the
`provident-ssr` package or the Gnosis wire contract (spec §3b: NONE). The
**OPEN handoff items table is now EMPTY** (all four rows + HOST/U1-ENG
resolved/obsolete; HOST/U1-ENG via upstream `BOOLEAN-ATTRS` in 0.5.0). The
**RBAC caller threading on the local `RagStore`** (the D2 fallback document
store — the mutating methods take no `caller` param) is a **PACKAGE finding in
`docs/defects.md`**, NOT a handoff item — it is unchanged and not part of A2.

**HANDOFF update (2026-09-10, Unit shell-integration landed):** the shell-integration unit
introduced **NO new engine/foundation gaps** — the adversarial pass (RCA-3) found **no
defect in the `provident-ssr` package or the Gnosis wire contract** (spec §3b: NONE). The
**OPEN handoff items table is now EMPTY** (all four rows + HOST/U1-ENG
resolved/obsolete; HOST/U1-ENG via upstream `BOOLEAN-ATTRS` in 0.5.0). The
**GET-with-body finding is a HOST confirm-in-app
item, NOT a handoff item** — the document-CRUD read methods send a GET-with-a-body (the P1a
envelope-in-body wire) that **Node/undici `fetch` rejects but Electron/Chromium `fetch`
permits**; it is a transport-RUNTIME divergence that the app's Chromium `fetch` adjudicates
in-app, and it is recorded as a HOST finding in `docs/defects.md`
(**HOST-GET-WITH-BODY-SSE-CRUD**, confirm-in-app status) + in the pending battery
`docs/specs/unit-shell-integration-live-pending-battery.md` §2.1/§4.1/§6. It is NOT a
feature request to the provident dev agent, so it does not appear here.

## SHELVED / CLOSED

| # | Severity | Feature request | Why it mattered | Proposed shape | Shelved reason |
| --- | --- | --- | --- | --- | --- |
| **ENG-GAP-1** | a-big (shelved) | **MarkdownAdapter node-identity preservation.** The `MarkdownAdapter` drops `data:*` props including the opt-in `data-node-id` (D7), so the agent-facing markdown output carries no element→node identity. | Astrographer's RAG mode renders documents via the markdown adapter and passes "relevant document lines" to the agent. Node identity in the markdown would let the agent cite exact nodes. The host-side line→node map (coarse: whole subtree → one RAG object) covered the need. | A markdown-adapter option to preserve node identity (e.g. an HTML-comment or a node-id-preserving markdown variant), mirroring the `renderOptions.nodeIdAttribute` opt-in on the DOM/SSR adapters. | **Shelved 2026-08-26 (user ruling).** (1) Markdown is EXPORT-ONLY — no flow edits markdown output as input, so node identity in the export has no consumer today. (2) Comment IDs are fragile: an external editor could delete/alter them, corrupting the mapping. (3) The future markdown-parsing-to-storage feature will rely on **text-match diffing** instead of node-identity comments (see `docs/pending.md`). Revisit only if a markdown-as-input flow becomes supported. |
| **ENG-INLINE-ORDER** | a-big (high) | **Text/element interleaving in a node's rendered output.** The framework renders a node as `escapeText(content) + children` (`adapters.js` `contentHtml`) — content text ALWAYS precedes child elements, with NO interleaving. `LegacyNodeData.children` is `LegacyNodeData[]` only (no text nodes) and `content` is a single escaped-text string, so a node cannot render text between child elements. | Astrographer's markdown import (`edit.import_markdown`) renders inline formatting (`**bold**`/`*em*`/`[link]`/`![img]`) as `RagNodeChild[]` child elements, but a formatted span that PRECEDES plain text (e.g. `**Proposal:** Astrographer…`) renders AFTER the content text — the bold label lands after the content ("Astrographer… foundation.Proposal:"). The `RagNodeChild` model (`content` = all plain text, `children` = all formatted spans) cannot represent the interleaving order, and the renderer emits content first then children. | **RESOLVED in provident-ssr 0.4.0 (2026-08-31)** — the upstream `bodyRuns` capability (0.3.0-0.3.2) was superseded by the 0.4.0 bare `text` child + content-XOR-children model: text beside children is a `text` child in `childOrder`, so interleave is deterministic WITHOUT `bodyRuns`. Astrographer upgraded to `provident-ssr@0.4.0` and rewrote `buildSubtree` to the XOR shape (no `content`; interleaved `text` + inline-span children). Verified: `**Proposal:** Astrographer` → `<strong>Proposal:</strong> Astrographer`. See `docs/defects.md` ENG-INLINE-ORDER. | **CLOSED — RESOLVED upstream in `provident-ssr@0.4.0` (2026-08-31):** the bare-`text`-child XOR model (text beside children is a `text` child in `childOrder`) superseded `bodyRuns` (0.3.0–0.3.2); interleave is deterministic WITHOUT `bodyRuns`. Astrographer upgraded to `provident-ssr@0.4.0` and rewrote host `buildSubtree` to the XOR shape (no `content`; interleaved `text` + inline-span children). Verified: `**Proposal:** Astrographer` → `<strong>Proposal:</strong> Astrographer`. See `docs/defects.md` ENG-INLINE-ORDER. |
| **ENG-BODYRUNS-WIRE-REF-PATHSTATE** | a-big (high) | **`bodyRuns` run-child render fails for PLACEMENT-ROUTED (path-state) content roots.** Emitting `bodyRuns` on a placement-routed subtree root DROPS the node's inline children instead of interleaving. **Root cause (corrected 2026-08-31 by the M3 TestWriter — ADAPTER, not the resolver):** `resolveBodyRunsChildWires` (0.3.2) DOES resolve the ref to the child's correct path-key wire (a valid childOrder member), but the ADAPTER's run-child lookup (`adapters.js:121` and SSR `contentHtml`) uses a BARE `wireKey(run.child)` while a placement path-state child is registered under the COMPOSITE key `pathKey\0forkKey` — so the child is not found and the run is dropped. No host-side `bodyRuns` rewrite fixes it (even composite-key refs drop; verified). | Astrographer rendered every RAG subtree root as a placement-routed `LegacyContentPayload` into a zone — so the host re-expression of ENG-INLINE-ORDER (emitting `bodyRuns` in `buildSubtree`) was blocked at the ADAPTER. **MOOT since 0.4.0 (2026-08-31):** the host's `buildSubtree` no longer emits `bodyRuns` (it uses the 0.4.0 `text`-child XOR model), so this adapter defect no longer affects the host. Still an upstream defect for any consumer using `bodyRuns` on placement-routed content. | **Upstream adapters.ts fix required** (for `bodyRuns` consumers): the run-child lookup must resolve a placement path-state child's COMPOSITE key (or the run-child render must be path-state-key aware). See `docs/defects.md` ENG-BODYRUNS-WIRE-REF-PATHSTATE. | **CLOSED — OBSOLETE / SUPERSEDED:** the `bodyRuns` mechanism was discarded upstream in `provident-ssr` 0.4.0 (superseded by the bare-`text`-child + content-XOR-children model); no defect applies to a mechanism that no longer exists, and there is no current consumer. The host's `buildSubtree` uses the 0.4.0 XOR model. See `docs/defects.md` ENG-BODYRUNS-WIRE-REF-PATHSTATE (CLOSED). |
| **ENG-DESTROY-PLACEMENT-ANCHOR-RESIDUE** | low (PACKAGE, latent) | **`destroy` does not dissolve placement/content anchors.** `Node.destroyLinks` (`provident-ssr` `dist/core/node.js:830-841`) removes only `child` anchors; `content`/`container` PLACEMENT anchors survive destroy on a reused hub, so the shared placement Link accumulates a stale anchor per destroyed root. | Astrographer's U-STATE-1b content-only repopulation `destroy`s content roots on a PERSISTENT hub (U-STATE-1c), so the residue accumulates; not observed to re-render a destroyed node, but unvalidated for an incremental `placement-attach` flow. Surfaced by the U-STATE-1c adversarial pass (AF1c-9, 2026-09-11). | `destroy` should dissolve the node's placement/content anchors too, or the hub should prune anchors to destroyed nodes. See `docs/defects.md` ENG-DESTROY-PLACEMENT-ANCHOR-RESIDUE. | **CLOSED — RESOLVED upstream in `provident-ssr@0.4.1` (2026-09-11):** `destroyLinks` now detaches the node's `content`/`container` placement anchors from the shared per-name `Link` (via `removeAnchor`, never `link.destroy()`). Host upgrades to `^0.4.1` and may reuse a persistent hub across destroys. See `docs/defects.md` ENG-DESTROY-PLACEMENT-ANCHOR-RESIDUE. |
| **ENG-SUPERVISOR-HOOK-ACCUMULATION** | medium (PACKAGE) | **No `Supervisor` disposal — finalize hooks accumulate.** Each `new Supervisor` registers a MODULE-LEVEL `onNodeFinalized` hook (`dist/core/registry.js:312-315`, `dist/core/supervisor.js:129-134`) that is never removed, so a discarded Supervisor (and its node map) is retained forever; rebuilding a Supervisor per re-render leaks unboundedly. | Astrographer's U-STATE-1c makes the app-graph Supervisor persistent, but the operator scope rebuilds on demand; the adversarial pass showed each rebuild leaks. | Add `Supervisor.dispose()` (deregister the finalize hook + release the node map), or make the hook registration per-Supervisor/collectible. See `docs/defects.md` ENG-SUPERVISOR-HOOK-ACCUMULATION. | **CLOSED — RESOLVED upstream in `provident-ssr@0.4.1` (2026-09-11):** `Supervisor.dispose()` added — releases the module-level `onNodeFinalized` hook + node maps; idempotent; a disposed Supervisor is inert. Host calls `dispose()` on a discarded Supervisor. See `docs/defects.md` ENG-SUPERVISOR-HOOK-ACCUMULATION. |

## RESOLVED / CLOSED

| # | Severity | Feature request | Why it mattered | Resolution |
| --- | --- | --- | --- | --- |
| **HOST/U1-ENG** | a-big (high) | **Boolean-attribute support in `DomAdapter.setProp`.** `setProp` had NO boolean-attribute special-casing, so `checked: false`/`selected: false`/`disabled: false` routed to the generic branch → `setAttribute(attr, 'false')` left the boolean attribute PRESENT (an unchecked/unselected control was unrenderable via a `false` prop). | Astrographer's U1 Settings control pivoted to a button-toggle to avoid the gap; U-EDIT-2 (C16) authors `disabled: undoDepth <= 0`, which required the fix. | **RESOLVED upstream (`BOOLEAN-ATTRS`, 2026-09-12 — present in `provident-ssr@0.5.0`):** a closed `BOOLEAN_ATTRS` set + `booleanAttrValue`; DOM boolean attrs are presence/absence (OFF **removes** the attribute — never `="false"`) and reflect the DOM property when one exists (`el.checked`/`selected`/`disabled`); SSR omits when OFF. Verified in `node_modules/provident-ssr/dist/core/adapters.js:300-315,515-528` (the code comment names HOST/U1-ENG). See `docs/defects.md`. |
