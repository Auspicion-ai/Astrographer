# Unit U-LIVE4 — Empty-Store Landing Co-Authored Into the Pane-Inclusive Envelope — Fix-Spec

**Status: LANDED — GREEN + HOST ADVERSARIAL REGRESSIONS (2026-09-14) + LIVE-CONFIRMED (2026-09-15, `--no-seed boot_landing`).** This is a
**code-fix unit** for the defect **LIVE-4** (no landing at empty-store boot,
`docs/defects.md`). **Layer = code gap** (this repo's renderer host wiring — NOT a
`provident-ssr` package defect). RCA classification: **RCA-12** (envelope-vs-app:
the node suite is envelope-green while the assembled boot overwrites the stage
body). Owned by `docs/specs/unit-u-shell-9a-main-focus-tabs.md` (HOST-1 `mountTab`
+ landing + targetless-first-tab default); this fix-spec adds the missing
**empty-store co-authoring invariant** and supersedes the deferred half of that
unit's landing-related §2.10 caveat (see §2.9 / owning-spec cross-ref). Gate: the
TestWriter red set (§6) ran RED on the current tree, then green + the host
adversarial pass (§3a — AD-2026-09-14-1..4, fixed here). `applyStageBody` in
this spec is `src/renderer/sidebar-panes.ts:1125-1133` (the finding's line refs
are accurate; the file attribution for that one helper is sidebar-panes.ts, not the
pane-graph.ts sibling).

---

## 1. Status / context

### 1.1 Defect

**LIVE-4 — no landing at empty-store boot.** Starting the app against a TRUE empty
store (no documents, no seeded corpus) boots the stage with **no landing body**:
the central stage renders an empty `content` zone instead of the landing page
(`#stage-landing` / `data-stage='landing'`). `landingContent(...)` and the
default-tab→landing resolution are green as pure outputs, so the defect is not in
the pure landing authoring — it is in **how the boot assembles the stage**.

### 1.2 Root-cause (authoritative read-only probe — verified against the tree)

The renderer mounts the stage through **two independent, competing loaders**:

1. **Boot traversal.** `SidebarPanes.boot` (`src/renderer/sidebar-panes.ts:1855-1889`)
   at the empty path derives `documentIds = []`, so `renderIds = []` and
   `traversalEnvelope = buildTraversalEnvelope(snapshot, [])`
   (`:1879`) → hits the `documentIds.length === 0` branch (`:2371-2374`) →
   `emptyStoreEnvelope()` (`:2336-2342`) → a bare
   `DEFAULT_CONTENT_WINDOW_TEMPLATE` envelope with `content: []` and **no landing**.
   `loadAppGraph(runtime, traversalEnvelope)` (`:1422-1470`) then runs
   `assembleAppGraphEnvelope` (`pane-graph.ts:329+`), which appends the panes after
   the traversal content (`pane-graph.ts:397`) and `applyEditorToolbar`
   (`sidebar-panes.ts:1460`) adds the toolbar → a **toolbar+panes envelope with an
   empty content zone** (landing never authored into the pane-inclusive envelope).
2. **Tab mount.** Separately, `mountTab(entry)` (`:808-823`) renders the landing
   via `landingContent(...)` for `{kind:'other',id:'landing'}` (`:815-822`,
   `landingContent` defined `pane-graph.ts:1186-1210`), then `applyStageBody(body)`
   (`sidebar-panes.ts:1125-1133`) which runs a **second, full `loadAppGraph`**
   (`:1132`) — clobbering the toolbar+panes graph with a landing-only envelope
   (mutually-exclusive stage-body-or-panes).

**Wiring:** `renderer.ts:700-722` (`getContext`/`onActiveChange` → `host.mountTab`;
`bootTabs` at `:712-722` materialises + mounts the active body) and `:881`
(`host.boot(runtime).then(() => bootTabs())`). Resolution: `tab-state.ts:336-351`
(`resolveDefaultTarget` → `TAB_LANDING` at `:64` = `{kind:'other',id:'landing'}`).

**Why the landing never survives:** the landing is authored ONLY as a transient
stage body via `applyStageBody`, never INTO the pane-inclusive envelope. Any later
content re-derive (`reDerive` `:1950-1983` → `applyContentChange` `:1478-1536`)
reassembles from `emptyStoreEnvelope()` (bare, `content:[]`, no landing) and the
reconcile applies that bare `env` — overwriting the transient landing. The fix
(author the landing INTO the empty-store traversal envelope) makes the landing
part of `lastTraversalEnvelope` (`:1466`/`:1534`), so boot, re-derive, and refresh
all repopulate it from the SAME single graph.

### 1.3 Fix shape (preferred — most surgical)

Make the empty-store traversal **produce the landing body** so `assembleAppGraphEnvelope`
yields **`landing + editor-toolbar + panes` in ONE graph at boot**. Concretely, in
`buildTraversalEnvelope`'s `documentIds.length === 0` branch (`:2371-2374`) / inside
`emptyStoreEnvelope()` (`:2336-2342`), author the landing stage body as a content
payload in the SAME shape `applyStageBody` uses:

```
content: [{
  content: [{ ...landingContent({ documents, stores }), placement: { targetPlacement: [this.zoneName] } }]
}]
```

over the current `template`/`clientConfig`, so:
- `lastTraversalEnvelope` after an empty boot (set in `loadAppGraph` `:1466`) is
  the **LANDING envelope**; a later `refresh()` / operator / template re-derive
  repopulates it (never drops it back to a bare empty `env`);
- `applyContentChange` for a still-empty store keeps the landing (the reconcile's
  `next` envelope carries the landing payload) rather than reconciling to a bare
  `content: []` envelope.

The empty-store `documents`/`stores` values feed `landingContent` from the same
sources `mountTab` uses (`this.lastDocHeads` / `this.lastStoreListing`, `:818-819`);
at a TRUE empty store both are empty → `landingContent` degrades to "Getting
started" + "No documents yet." (pane-graph.ts:1204-1207, and §2.1 below).

---

## 2. Behavior contract (pinned)

### 2.1 Invariant — empty-boot landing co-authorship (THE fix)

**INV-E1.** At **empty-store boot** (no documents, no persisted tab set), the
central stage shows the **landing**, identified by `#stage-landing` /
`data-stage='landing'`, **CO-AUTHORED in the SAME pane-inclusive envelope** as
`#editor-toolbar` and the `.pane-frame[data-pane-id]` panes — NOT a bare/empty
content zone and NOT a landing rendered by a separate competing `loadAppGraph`.

- The landing body is the `landingContent({documents, stores})` shape: a `div`
  with `props { id: 'stage-landing', 'data-stage': 'landing' }` and children `h2`
  (`'Available wikis'` when `stores.length > 0`, else `'Getting started'`) + a
  `ul` of `li[data-store-name]` (stores) or `li[data-document-id]` (documents),
  or a `p 'No documents yet.'` when both are empty (pane-graph.ts:1186-1210).
- The landing payload is carried by the traversal envelope (`content[0]`) the same
  way `applyStageBody` builds it (`{content:[{...landingContent(...),
  placement:{targetPlacement:[this.zoneName]}}]}`, sidebar-panes.ts:1127-1131), so
  `assembleAppGraphEnvelope` yields **one** graph at boot containing the landing
  root AND the toolbar root AND the pane roots together (never mutually-exclusive).
- `emptyStoreEnvelope()` / `buildTraversalEnvelope(snapshot, [])` is therefore
  **NOT bare-empty**: it authors the landing body into `content:[]` (replacing the
  current bare-empty `content: []` line at :2339).

### 2.2 Invariant — landing survives an empty-store content re-derive

**INV-E2.** At a still-empty store, a RAG **content** re-derive
(`rag-store-changed` → `reDerive('content')` → `applyContentChange`, :1950-1981)
does **NOT** replace the landing. `applyContentChange` reassembles from the
empty-store traversal envelope (now landing-authored) and the reconcile's `next`
envelope carries the landing payload, so the mounted `#stage-landing` body is
**repopulated in place** (no teardown, no `loadEnvelope`, panes + toolbar intact).

### 2.3 Invariant — template/operator re-derive + refresh repopulate the landing

**INV-E3.** At a still-empty store, a **template** re-derive
(`template-changed` → reDerive('template')), an **operator-settings** change
(`operatorSettings-changed` → reDerive), or `refresh()` reassembles from
`lastTraversalEnvelope` — which after an empty boot is the LANDING envelope
(`loadAppGraph` `:1466`; `applyContentChange` `:1534`) — so `runtime.loadEnvelope`
renders `#stage-landing` again (with `#editor-toolbar` and the panes). The landing
is NEVER dropped back to a bare empty `content: []` envelope by a repopulate path.

### 2.4 Invariant — TRUE-empty-store tab resolution + current-tab body

**INV-E4.** At a TRUE empty store (no stores registered for the built-in
components, `ctx.hasStore === false`, no documents):
- `SidebarPanes.getTabContext()` resolves to `{ hasStore:false, documents:[] }`;
- `resolveDefaultTarget(ctx)` returns `TAB_LANDING = { kind:'other', id:'landing' }`
  (tab-state.ts:350) — the targetless first-tab default degrades to the landing
  (owning spec U-SHELL-9a §2.4 / F3-F4);
- `mountTab({ target: TAB_LANDING, ... })` renders `#stage-landing` (the §2.1 body);
- the active tab's identity is the `{kind:'other',id:'landing'}` tab.

### 2.5 Scope boundary

This unit covers the **empty-store landing co-authoring invariant** only. It does
not build the single-active → simultaneous multi-document render (U-SHELL-9b), does
not change `resolveDefaultTarget`'s document-resolution order (owning spec keeps
prev-focus → alpha-first → landing), and does not touch the reconciler
(U-STATE-1e) beyond keeping the landing payload in the `next` envelope it already
consumes.

---

## 3. Fail-states / edge cases

| # | Case | Pinned behavior (fail if observed otherwise) |
|---|---|---|
| F-L4-1 | landing absent at empty-store boot | the assembled pane-inclusive envelope MUST contain the `#stage-landing` / `data-stage='landing'` body; a boot that leaves the central stage an empty content zone, or renders only toolbar+panes with no landing, is the LIVE-4 failure |
| F-L4-2 | landing overwritten by an empty-store content re-derive | after `rag-store-changed` → `reDerive('content')` at a still-empty store, `#stage-landing` must remain mounted (repopulated in place); a `next` envelope of bare `content: []` that replaces it is a re-regression |
| F-L4-3 | bare empty envelope from the empty-store traversal | `emptyStoreEnvelope()` / `buildTraversalEnvelope(snapshot, [])` must author the landing body, not produce `template` with `content: []` (the pre-fix :2339 line) |
| F-L4-4 | a re-derive/refresh dropping the landing back to bare-empty | a template/operator re-derive or `refresh()` at empty store must reassemble from the landing `lastTraversalEnvelope` (INV-E3), not a bare empty `env` |
| F-L4-5 | mutually-exclusive stage-body-or-panes | at empty boot the graph must contain the landing root AND `#editor-toolbar` AND `.pane-frame[data-pane-id]` panes together in ONE graph (INV-E1); a second competing `loadAppGraph` that clobbers one with the other is the pre-fix two-loader behaviour |
| F-L4-6 | a non-empty/TAB-LANDING mount must not regress non-landing tabs | the fix touches ONLY the empty-store traversal; a `document` / `search` target `mountTab` must still render its own body (owning-spec HOST-1 regressions stay green) |

*(§3 rows are the U-LIVE4 fail-states; they are NOT F-rows for the property register
— the register uses P-rows only, per the §5 convention.)*

### 3a. Adversarial findings — host (AD-2026-09-14-1..4)

The U-LIVE4 fix landed the empty-boot co-authored landing. The post-fix
adversarial pass (RCA-3, host-side) surfaced four host findings — all fixed HERE
(with regressions in `tests/unit-live4-adversarial-fix.test.ts`), never in the
`provident-ssr` package.

| Ref | Severity | Finding | Host fix | Regression |
|---|---|---|---|---|
| `AD-2026-09-14-1` | HIGH — phantom landing ghost | `emptyStoreEnvelope` authors `#stage-landing` as a first-class content root (`runtime.extractContentRoots` admits `LANDING_ROOT_ID='stage-landing'`), but `content-reconcile.ts` `asContentRoot` (`rag-`/`pane-`/`editor-toolbar` only) could not classify it → on the natural first-import path (empty boot → first doc imported → `reDerive('content')` → non-empty `documentIds` → `applyContentChange`) the landing was in `previous` but invisible to `asContentRoot` → never emitted `removed`, never destroyed → a phantom `#stage-landing` persisted in a now non-empty store and the runtime's tracked roots diverged from the resident graph | (a) a `stage-landing` branch in `asContentRoot` (`content-reconcile.ts`) returning `{ cssId:'stage-landing', ragNodeId:'stage-landing' }`; (b) `LANDING_ROOT_ID` added to the `destroyRoot` `isRoot` gate (`runtime.ts`) so a classified removed/replaced landing is destroyed | boot empty → re-derive with a MUTATED non-empty snapshot → `#stage-landing` root is GONE and only the doc root remains (no phantom, no duplicate) |
| `AD-2026-09-14-2` | MED — vacuous repopulate | on a STILL-empty re-derive the landing was excluded from ALL reconcile buckets (invisible to `asContentRoot`) → never repopulated; if the stores/listing input changed (a store registered → the landing should flip "Getting started"/"No documents yet." → "Available wikis" + `li[data-store-name]`), the mounted body stayed stale | Finding 1's `stage-landing` branch classifies the landing as pane-like always-shape-compared (`isPaneLikeRoot` routes it through the global pane collections in BOTH the previous and the removed pass, so a present-in-both landing is `kept`/`replaced`, never `added`+`removed`); a stores/listing shape change drives a `replaced` | re-derive after the stores/listing input changed → the landing body content updates ("Available wikis" + `li[data-store-name]`) |
| `AD-2026-09-14-3` | LOW — input-source divergence | `emptyStoreEnvelope()` fed `landingContent({ documents: this.lastDocHeads ?? [], ... })` while the emptiness decision derives independently from the snapshot's `doc-head` edges; a stale non-empty `lastDocHeads` with a zero-doc-head snapshot rendered `li[data-document-id]` for non-traversable docs | the landing is fed from the SAME authoritative source used for the emptiness check — `emptyStoreEnvelope(snapshot)` derives `documents` from `deriveDocumentIds(snapshot)` (on the empty path that is `[]`, so stale doc-nav IPC can never list a non-traversable document) | a stale non-empty `lastDocHeads` with a zero-doc-head snapshot → the landing body has no `li[data-document-id]` ("No documents yet.") |
| `AD-2026-09-14-4` | MED/LOW — zone-not-in-layout drops landing | the empty-store path authored `placement:{ targetPlacement:[this.zoneName] }` (default `'main'`) with no validation; a template/layout lacking `this.zoneName` resolved the landing nowhere and dropped the stage empty silently | `ensureTargetZoneTemplate()` (mirroring `buildTraversal`'s ZONE-CONSISTENCY-ENSURE, `src/main/traversal.ts:493-502`) ensures the `zone:<zoneName>` producer exists in the envelope template before `emptyStoreEnvelope` authors `targetPlacement` on the empty path | a custom template WITHOUT a `main` producer → the empty-store envelope adds the `zone:main` producer and the landing still resolves (resident + rendered) |

The four fixes touch `src/renderer/content-reconcile.ts`, `src/renderer/runtime.ts`,
and `src/renderer/sidebar-panes.ts` (host-side only). The U-LIVE8 pinned
`editor-toolbar` routing (`isPaneLikeRoot` includes it unchanged) and the U-LIVE11
bridge-seam behavior are preserved (all landed suites stay green).

---

## 4. Census / cross-references

- **Build surface touched by the fix:** `src/renderer/sidebar-panes.ts`
  (`emptyStoreEnvelope` :2336-2342 / `buildTraversalEnvelope` empty branch
  :2371-2374) — the only code change the preferred fix shape requires.
- **Read-only pins (verify, do not change):** `landingContent`
  (`pane-graph.ts:1186-1210`), `applyStageBody` (`sidebar-panes.ts:1125-1133`),
  `loadAppGraph` (`:1422-1470`, `applyEditorToolbar` :1460, `lastTraversalEnvelope`
  set :1466), `applyContentChange` (`:1478-1536`, `lastTraversalEnvelope` :1534),
  `reDerive` (`:1950-1983`), `assembleAppGraphEnvelope` pane merge
  (`pane-graph.ts:397`), boot wiring (`renderer.ts:712-722`, `:881`),
  `resolveDefaultTarget` (`tab-state.ts:336-351`) + `TAB_LANDING` (`:64`).
- **No new dependency; no `provident-ssr` change; no MCP contract change.**
- Cross-references: owning spec `docs/specs/unit-u-shell-9a-main-focus-tabs.md`
  (§2.3 / §2.4 / HOST-1 / §2.10 landing deferral / §3 / §6); RCA
  `docs/specs/rca-live-bugs-green-pipeline.md` CA-2/CA-4 (LIVE-4 in the
  "assembly/reconciliation" row); handover `docs/HANDOVER-LIVE-BATCH-RCA.md` §2
  (LIVE-4 open item) + §3 (stale battery names — see §7.2).

## 5.7 Property register (PBT)

This is a **CODE-BEARING** fix, so the register is mandatory. Rows are typed
**P-IM** (input-model), **P-SM** (state-model), or **P-TP** (transform) — NEVER
F-rows, NEVER §3 F-L4-n rows (the fail-states already exist as §3 F-L4-1..6). **At
most 8 rows.** The register follows the `docs/specs/unit-u-shell-9a-main-focus-tabs.md`
§5.7 / `docs/specs/unit-shell-integration.md` §5.7 convention (identical row
typings, ≤8-row cap, class-tally line, deterministic seeding/≤100-per-row/≤400-total
budget). The rows are genuinely invariant-bearing: they pin that the empty-store
traversal authors the landing body (total, deterministic), that the boot assembles
landing+toolbar+panes in ONE graph, and that every repopulate path keeps the
landing envelope.

| Ref | Class | Invariant | Strategy | Checkable proposition (∀ pattern) |
|---|---|---|---|---|
| `P-IM-1` | IM | **The empty-store traversal envelope is landing-authored, total + deterministic.** For a TRUE empty store (`documentIds.length === 0`, any snapshot), `buildTraversalEnvelope(snapshot, [])` (equivalently `emptyStoreEnvelope()`) returns a `LegacyInitialData` whose `content[0]` is a `{content:[...], placement:{targetPlacement:[zoneName]}}` payload whose root is the `landingContent` body — NEVER a bare `template` with `content: []`. The call never throws for an empty id-set. | `strat:empty-envelope-landing` | ∀ generated snapshot `s` with zero `doc-head` edges: `buildTraversalEnvelope(s, [])` returns an envelope `e` with `e.content.length === 1` and the root of `e.content[0].content` a `div` with `props.id === 'stage-landing'` and `props['data-stage'] === 'landing'`. |
| `P-IM-2` | IM | **The authored landing payload matches the `mountTab`/`applyStageBody` shape.** The empty-store payload is `{content:[{...landingContent({documents,stores}), placement:{targetPlacement:[this.zoneName]}}]}` (the sidebar-panes.ts:1127-1131 shape), so assembly consumes it exactly as `applyStageBody`'s body is consumed. | `strat:landing-payload-shape` | For a `documents`/`stores` pair (empty → `{hasStore:false, documents:[]}`), the payload root deep-matches `landingContent({documents,stores})` and its `placement.targetPlacement === [this.zoneName]`. |
| `P-SM-1` | SM | **After an empty boot, `lastTraversalEnvelope` is the landing envelope, not a bare empty.** `loadAppGraph` sets `lastTraversalEnvelope = traversalEnvelope` (:1466) on the boot path; the boot traversal is the landing envelope (§2.1), so the stored reload source carries the landing payload. | `strat:last-envelope-landing` | After `SidebarPanes.boot` at empty store, `pane.lastTraversalEnvelope.content` contains the `#stage-landing` root (not `content: []`). |
| `P-SM-2` | SM | **Co-authoring invariant: ONE graph holds landing + toolbar + panes together at boot.** `assembleAppGraphEnvelope` (pane-graph.ts:329, panes appended :397) over the landing traversal envelope yields an envelope whose roots include the landing root, the `#editor-toolbar` root (applyEditorToolbar :1460) and the `.pane-frame[data-pane-id]` pane roots — no bare content zone, no second competing `loadAppGraph`. | `strat:coauthor-one-graph` | The single `loadAppGraph` at empty boot yields a runtime graph containing a node with `props.id === 'stage-landing'`, a node with `props.id === 'editor-toolbar'`, and ≥1 `.pane-frame[data-pane-id]` node, all resident simultaneously. |
| `P-SM-3` | SM | **A still-empty content re-derive keeps the landing body (in-place repopulate).** `applyContentChange` (reassembles from the empty-store landing envelope) reconciles a `next` envelope that carries the landing payload; `#stage-landing` stays mounted, panes + toolbar intact, no teardown. | `strat:rederive-content-keeps-landing` | After a `reDerive('content')` at empty store, the DOM still has `#stage-landing` (with `data-stage='landing'`), `#editor-toolbar`, and the pane frames. |
| `P-TP-1` | TP | **Template/operator re-derive + `refresh()` repopulate the landing from the stored envelope.** A non-content re-derive reloads `lastTraversalEnvelope` (the landing envelope, P-SM-1) via `refresh()` → `loadAppGraph` (:1981 `refresh` branch), so the assembled graph again contains `#stage-landing` — never a bare `content: []` envelope. | `strat:repopulate-landing` | After a `reDerive('template')`-class repopulate at empty store, the freshly-loaded graph contains the `#stage-landing` node with `data-stage='landing'`. |
| `P-TP-2` | TP | **TRUE-empty-store tab resolution is total to the landing tab (INV-E4).** `resolveDefaultTarget({hasStore:false, documents:[]})` returns `TAB_LANDING` (`{kind:'other',id:'landing'}`); `ensureFirstTab` materialises exactly one `{kind:'other',id:'landing'}` entry (the first tab, activeId set to it), and `getTabContext()` at empty store gives `{hasStore:false, documents:[]}`. | `strat:empty-target-landing` | ∀ generated empty `TabDefaultContext` (`hasStore:false`, `documents` empty/absent): `resolveDefaultTarget(ctx)` deep-equals `{kind:'other',id:'landing'}`; `ensureFirstTab(empty, ctx)` yields one open entry whose target is the landing tab, active. |

**Class tally:** IM ×2, SM ×3, TP ×2 = **7 rows ≤ 8** ✔.

The rows above are **NOT over-strength**: they are directly observable from the
pinned surfaces (`buildTraversalEnvelope`/`emptyStoreEnvelope`, `landingContent`,
`loadAppGraph`/`applyContentChange`, `resolveDefaultTarget`/`TAB_LANDING` — §4) and
consolidate INV-E1..E4 / §3 F-L4-1..5 into invariant form without inventing a field,
seam, or new fail-state. They encode the fix shape (§1.3) as the invariant that
the TestWriter + Implementer verify.

---

## 6. TestWriter red-set contract (7 red tests)

The TestWriter must author these seven tests FIRST against the current (unfixed)
tree; **all seven must FAIL red** (the pre-fix code has none of these invariants),
then the Implementer closes them with the §1.3 fix. Each red test names the
observed surface:

1. **Boot-assembly contains the landing body in the SAME envelope.** After
   `SidebarPanes.boot` at a TRUE empty store, the assembled pane-inclusive envelope
   (from `loadAppGraph`'s `assembleAppGraphEnvelope`) contains the `#stage-landing`
   / `data-stage='landing'` content payload in the SAME single envelope as the
   panes + toolbar — NOT a separate `applyStageBody` graph. **[RED today: the boot
   traversal envelope is bare-empty; the landing exists only in the transient second
   `loadAppGraph`.]**
2. **`emptyStoreEnvelope()` / `buildTraversalEnvelope(snapshot, [])` is NOT
   bare-empty.** The empty-store traversal envelopes a landing body into `content`,
   never `template` with `content: []`. **[RED today: `emptyStoreEnvelope()` returns
   `content: []` at sidebar-panes.ts:2339.]**
3. **`lastTraversalEnvelope` after an empty boot is the landing envelope.** Assert
   the stored reload source carries the `#stage-landing` payload. **[RED today:
   `lastTraversalEnvelope` is the bare empty envelope.]**
4. **Survives `reDerive('content')`.** At a still-empty store, a `rag-store-changed`
   → `reDerive('content')` keeps `#stage-landing` mounted (repopulated in place);
   panes + toolbar intact. **[RED today: `applyContentChange` reassembles from the
   bare empty envelope and overwrites the landing.]**
5. **Survives `reDerive('template')` / `refresh()`.** A template-class repopulate at
   empty store reloads the landing envelope from `lastTraversalEnvelope`, re-rendering
   `#stage-landing`. **[RED today: the reload source is the bare empty envelope.]**
6. **Co-existence — landing + panes + toolbar together.** After the empty boot, the
   one loaded graph contains the landing root, `#editor-toolbar`, and the
   `.pane-frame[data-pane-id]` panes simultaneously (INV-E1) — no
   mutually-exclusive stage-body-or-panes. **[RED today: two competing `loadAppGraph`
   calls leave only the last-loaded graph mounted.]**
7. **Tab resolution → `mountTab` renders `#stage-landing`.** At a TRUE empty store,
   `getTabContext()` = `{hasStore:false, documents:[]}`; `resolveDefaultTarget` →
   `TAB_LANDING`; the first/active tab is `{kind:'other',id:'landing'}`; `mountTab`
   on it renders the `#stage-landing` body. [Partial today: the resolution is green;
   the co-authored empty-boot rendering that makes the landing STICK is red — the
   test must assert the landing is present AND stable after the §2.2/§2.3 repopulate
   paths, which today drop it.]

---

## 7. Mandatory live battery

### 7.1 New block — `boot_landing` in `scripts/live-drive.mjs`

The implementer **must** add a `boot_landing` block to the `BLOCKS` table in
`scripts/live-drive.mjs` and run it with **`--no-seed --block=boot_landing`**
(a TRUE empty store). Precondition → action → expected-observable → PASS/FAIL:

1. **Boot**: after launch with `--no-seed`, wait for the MCP + CDP surfaces
   (the harness's existing `waitFor` boot probes), then assert immediately:
   `!!document.getElementById('stage-landing')` AND
   `getAttribute('data-stage') === 'landing'` AND
   `document.querySelectorAll('.pane-frame[data-pane-id]').length >= 1` AND
   `!!document.getElementById('editor-toolbar')` — the landing CO-EXISTS with the
   panes and the toolbar in the same rendered DOM (INV-E1). FAIL if any is missing
   (esp. landing absent → LIVE-4).
2. **Survive a content re-derive**: trigger `rag-store-changed` →
   `reDerive('content')` at the still-empty store (e.g. an empty import broadcast,
   or the closest host/bridge seam the driver can reach), wait, then re-assert
   `#stage-landing` still present with `data-stage='landing'` (INV-E2). FAIL if
   dropped.
3. **Tab re-activation**: drive `provident.focus` (via `mcpTool`) to the
   `{kind:'other',id:'landing'}` target (or the closest focus/TabStrip seam the
   driver can reach), and assert the landing body renders again after re-activation
   (INV-E4). Block is PARKED only if the exact focus seam proves
   structurally non-exercisable from the MCP+CDP surface — with the park reason
   recorded (RCA-11 park rule). Otherwise FAIL on a missing landing.

### 7.2 Stale-doc note (must be fixed in the same unit)

`docs/HANDOVER-LIVE-BATCH-RCA.md:43` (§3, the live-harness description) names
`zones_geometry`, `landing`, and `landing_debug` blocks that **do not exist** in
`scripts/live-drive.mjs` — today only `tab_new_click` probes the landing
(`live-drive.mjs:143-151`). The documentation-review gate (RCA-6) must correct that
line to name the actual blocks (including the new `boot_landing`) in the same pass
as this fix lands. `boot_landing` itself does not exist yet — the block
**must** be added by the Implementer per §7.1.
