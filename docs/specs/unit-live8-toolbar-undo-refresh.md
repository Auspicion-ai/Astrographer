# Unit U-LIVE8 — Toolbar Undo/Redo Content-Re-derive Refresh (LIVE-8 undo-inert) — Fix-Spec

**Status: LANDED — GREEN + LIVE-CONFIRMED (2026-09-15).** This unit fixed the
code defect **LIVE-8 UNDO-INERT** (`docs/defects.md` line 22) on the **content
re-derive path**: the editor-toolbar Undo/Redo `disabled` state authored fresh on
a content-only re-derive was NEVER materialized into the live graph, so after an
edit bumps `undoDepth` 0→1 the Undo button STAYED disabled and a click did
nothing. **Layer (RCA-12): envelope-green vs app-green.** The pure authoring
helper `editorToolbarContent` (dom-shim/node green) authors the correct
`disabled:undoDepth<=0` into the fresh envelope; the ASSEMBLED reconcile
(`applyContentReconcile`) dropped the toolbar root because it is neither `rag-` nor
`pane-`, so the refreshed prop never reached the rendered DOM. FIXED + the live
battery (§7) is GREEN — **LIVE-8 FIXED + LIVE-CONFIRMED 2026-09-15** (`toolbar_undo`).

**Owning spec:** `docs/specs/unit-u-edit-2-undo-redo-history.md` (§2.1 disabled
state, §2.5 project-journal seam); this fix adds the "disabled state refreshed on
the content re-derive path" invariant there in the same pass.

**Feasibility verdict: PROCEED** — the fix is a **scoped reconcile-allocation
change**: treat the pinned `editor-toolbar` content root as a pane-like reconcile
candidate so its freshly-authored `disabled`/`data-mode` state is re-materialized
on a content-only re-derive. It touches **no** provident-ssr package, no journal
semantics, no host undo/redo seam, no model.

---

## 1. Status / context

- **Unit:** U-LIVE8. **Defect:** LIVE-8 UNDO-INERT (high, HOST) — in the live
  app, after editing a node the editor-toolbar Undo button **stays disabled**, so
  clicking it does nothing and the content cannot be reverted through the control.
- **Root cause (authoritative probe, verified against the tree below):**
  1. The Undo/Redo buttons are authored `props: { id, …, disabled: undoDepth <= 0 }`
     (`src/renderer/pane-graph.ts` `EDITOR_TOOLBAR_UNDO_ID`/`REDO` :1272-1273,
     buttons :1337 / :1344), each carrying an `on:click` body that calls
     `window.provident.sidebar.historyUndo()`/`historyRedo()`
     (`EDITOR_TOOLBAR_UNDO_BODY` :1285-1289 / `REDO_BODY` :1291-1296).
  2. The **host seam is complete**: `historyUndo()`/`historyRedo()` (`sidebar-
     panes.ts:2603-2610`) → `applyJournalOp` (:2615-2626) → `bridge.rag.journalOp`
     → on `ok` `fetchJournal()` (:2624) + `requestRebuild('operator')` (:2625).
     `src/main/preload.ts:452` exposes `bridge.rag.journalOp`; the
     `window.provident.sidebar` delegate reaches it (`sidebar-panes.ts:2749-2751`).
  3. **The concrete gap:** after an EDIT, `onRagStoreChanged`
     (`sidebar-panes.ts:2044-2075`) → `requestRebuild('content')` (:2074) →
     `reDerive('content')` → `applyContentChange` (:1478-1536), which authors the
     toolbar FRESH into the next envelope — `applyEditorToolbar(env, …)`
     (:1501, helper :2550-2568, authored from `this.lastJournal` :2552) — but then
     `Runtime.applyContentReconcile` (`runtime.ts:455-549`) only destroys/attaches
     roots whose cssId passes `destroyRoot`'s gate — `rag-`/`pane-` only
     (:467-488, `extractContentRoots` :108-126, `asContentRoot`
     `content-reconcile.ts:87-106`). The `editor-toolbar` root is **neither**
     (:1289 `EDITOR_TOOLBAR_ID = 'editor-toolbar'`), so it never enters
     `nextById`/`contentRoots` → a kept-identity root whose props changed
     (`disabled:false` after the undoDepth bump) is **never re-emitted** into the
     live graph. **Net:** after an edit bumps `undoDepth` 0→1 the Undo button STAYS
     disabled in the rendered DOM → a click does nothing → **LIVE-8**.
- **Why the node suite is blind (RCA-12):** `editorToolbarContent` is envelope-
  green (assertable in the dom-shim), and the existing `applyContentReconcile`/
  `reconcileDocumentRoots` tests exercise `rag-`/`pane-` roots only — neither
  catches that the `editor-toolbar` root's freshly-authored state is dropped on the
  CONTENT path. The gap is app-green and must be pinned both at the host reconcile
  (§6 (a)) and in the live battery (§7).

### 1.1 Fix shape (what the implementer ships — scoped reconcile allocation)

Three gate broadenings, ALL keyed on the single pinned constant
`EDITOR_TOOLBAR_ID = 'editor-toolbar'` (`pane-graph.ts:1264`). This makes the
toolbar a first-class **pane-like** content root so the proven pane reconcile
(always shape-compared → `replaced` on a prop change → destroy+attach through
`attachRoot`) re-materializes its fresh `disabled`/`data-mode` state:

1. **`extractContentRoots`** (`src/renderer/runtime.ts:108-126`): accept the
   `editor-toolbar` cssId in addition to the `rag-`/`pane-` prefixes, so the fresh
   toolbar root enters `nextById` (`applyContentReconcile` :461-465) AND
   `this.contentRoots` (:551) → the `previous` list of the NEXT reconcile.
2. **`asContentRoot`** (`src/renderer/content-reconcile.ts:87-106`): return a
   pane-like `{ cssId: 'editor-toolbar', ragNodeId: 'editor-toolbar' }` for the
   pinned id, so `reconcileDocumentRoots` (:380+) parses the toolbar as a
   document-`''` pane-like root. Because the toolbar is NOT `rag-`-prefixed, the
   existing `isPane = !cssId.startsWith(RAG_PREFIX)` (:453) already makes it
   **always shape-compared** (:564 `useShape`), so a `disabled` flip
   (`shapeOf` change) lands it in `replaced` (:566) — the toolbar is a
   `replaced` candidate with no other reconcile-logic change.
3. **`destroyRoot` gate** (`src/renderer/runtime.ts:467-488`): admit the pinned
   `editor-toolbar` cssId (`isRoot` check), so the `replaced` branch (:526-535)
   actually destroys the stale toolbar + `attachRoot` (:490-511) attaches the fresh
   one. **Keep the AF2 security gate for everything else:** arbitrary/malicious
   non-content ids are STILL rejected — only the pinned `editor-toolbar` joins the
   allow-list.

The `pane-history` toolbar-sibling (`HISTORY_PANE_ID = 'pane-history'`,
`pane-graph.ts:1279`) is **already** a `pane-` root and reconciles today; no change
needed there.

**Why NOT the alternatives (cleanest surface / clear testability):**
- **Broaden the `rag-`/`pane-` gate to "any content root" (Option 1-as-proposed
  unrestricted):** larger + risky — it opens `destroyRoot` to arbitrary ids,
  weakening the AF2 hostile-bucket guard and the whole-root-v1 isolation. The
  scoped allow-list above keeps the security gate intact while granting ONLY the
  toolbar the pane-like treatment it needs. **Recommended.**
- **Host re-mount in `applyContentChange` (Option 2):** needs destroy+attach of the
  old toolbar inside the host AFTER the reconcile — duplicating the reconcile's own
  `destroyRoot`/`attachRoot` seams in `sidebar-panes.ts`, a second authoring path
  that can drift from the assemble/reconcile path. Larger/more bespoke surface with
  no added coverage beyond the shared seams.
- **Route an operator `refresh()` after a content re-derive (Option 3):** forces a
  FULL `loadAppGraph` reload on every content edit just to refresh the toolbar —
  defeating U-STATE-1b's whole no-teardown design (node identity preserved across a
  content change). Smallest diff but a semantic regression; rejected.

---

## 2. Behavior contract (pinned invariants)

**§2.1 — the toolbar-refresh invariant (the LIVE-8 fix).** After a **committed
edit** that journals a content entry (a `content`/`structural`/`batch` entry; the
`RagStore` project-journal `undoDepth → 1`), the LIVE
`#editor-toolbar-undo`(=`editor-toolbar-undo` button, `data-role='history-undo'`)
is **NOT disabled** (`disabled === false`). The **content re-derive** path
(`onRagStoreChanged` → `requestRebuild('content')` → `reDerive('content')` →
`applyContentChange`, which authors the toolbar fresh from `this.lastJournal` via
`applyEditorToolbar`) **repopulates the toolbar root's undoDepth-derived `disabled`
state into the live graph** — the `editor-toolbar` root participates in the content
reconcile and its fresh `disabled:undoDepth<=0` (false when `undoDepth>0`) is
materialized. **Redo is symmetric:** a committed undo (revert) bumps `redoDepth → 1`
and the content path re-materializes `#editor-toolbar-redo` as NOT disabled.

**§2.2 — the revert-on-click invariant (unchanged, re-pinned).** A click (DOM or
`provident.dispatch`) on the now-enabled
`#editor-toolbar-undo` → `EDITOR_TOOLBAR_UNDO_BODY`
(`window.provident.sidebar.historyUndo()`, guard `typeof … === 'function'`) →
`SidebarPanes.historyUndo()` → `applyJournalOp('undo')` → `bridge.rag.journalOp`
→ main `RagStore.undo()` reverts the content → on `ok` `fetchJournal()` +
`requestRebuild('operator')`, so the reverted content re-renders and the graph
reflects the fresh stack. Redo symmetric through `historyRedo`/`RagStore.redo()`.

**§2.3 — the no-teardown / no-reload invariant (preservation).** The toolbar
refresh rides the EXISTING CONTENT reconcile (no `loadAppGraph`/teardown, node
identity + graph-resident state preserved) — NOT a full operator reload per content
edit (U-STATE-1b design retained). The `editor-toolbar` root is added as a pane-like
reconcile candidate (always shape-compared), so on a `disabled` flip it lands in
`replaced` and is destroyed+attached through the SAME seams the panes already use.

**§2.4 — the AF2 security-gate invariant.** Only the pinned `editor-toolbar`
cssId joins the reconcile allow-list. A malformed/hostile bucket id (a random
non-`rag-`/`pane-` id, `__proto__`, a template/zone node, an empty/too-short id)
is STILL rejected by `destroyRoot`/`asContentRoot`/`extractContentRoots` — never
destroyed, never attached.

---

## 3. States (TestWriter valid paths)

1. Boot with an **empty journal** (`undoDepth 0`) → `#editor-toolbar-undo`
   (`data-role='history-undo'`) is `disabled === true` (Undo at the base).
2. Dispatch a **committed content edit** that journals one entry (`undoDepth 0→1`),
   then trigger the **content re-derive** (`reDerive('content')`) →
   `applyContentChange` authors the toolbar from the refreshed `lastJournal` →
   the LIVE emitted `#editor-toolbar-undo` is `disabled === false` (the LIVE-8 fix).
3. Click (or `provident.dispatch`) the enabled Undo → `historyUndo` →
   `journalOp('undo')` → content **reverts** → `redoDepth 1` →
   `#editor-toolbar-redo` becomes `disabled === false` (Redo symmetric).
4. Click Redo → the edit **re-applies**; `undoDepth` back to 1 →
   `#editor-toolbar-undo` `disabled === false`.
5. Undo past the base boundary (a `redo` back to the floor) → `Undo` re-disables at
   `undoDepth 0`; safe stop, never a throw (F1/F2 from the owning spec preserved).
6. A **content change then an edit** keeps the toolbar state correct across both
   re-derives (no stale `disabled` carries over).
7. A **structural** content change (same re-derive path) similarly re-materializes
   the toolbar state.
8. `provident.dispatch` on the Undo handler reaches the SAME `historyUndo` seam as
   the DOM click (MCP/UI equivalence, owning spec §2.1 preserved).

### 3a. Adversarial findings (RCA-3, host — fixed here + regression-tested 2026-09-14)

**AD-2026-09-14-1 (Finding 1 — MED, borderline HIGH; hostile-fix batch, host):**
the toolbar root was NOT classified `replaced`/`kept` on a content reconcile — it
landed in **BOTH `added` AND `removed`** every time, working only by loop-order
accident (`removed` runs before `added` in `Runtime.applyContentReconcile`), so it
was **destroyed+reattached on EVERY content reconcile** — violating P-TP-1/P-TP-2
("kept when unchanged", "destroyed only on replaced") and §2.3 node-identity/no-stall.
- **Mechanism:** in `src/renderer/content-reconcile.ts::reconcileDocumentRoots` the
  PREVIOUS-root routing checked `cd.cssId.startsWith(PANE_PREFIX)` (~:423), so the
  non-`pane-`-prefixed `editor-toolbar` fell to `prevByDoc`; the NEXT pass routes it
  as a pane (`!root.cssId.startsWith(RAG_PREFIX)` → `paneNextByCssId`, ~:460); so
  `prev` was EMPTY for it → `added`, and the removed pass (`isPane` via `startsWith
  (PANE_PREFIX)`, ~:586) also failed to find it in next → `removed`.
- **Fix (host, scoped — no provident-ssr change):** route the pinned `editor-toolbar`
  as a pane in the PREVIOUS pass TOO so previous+next AGREE: change the previous
  routing condition to
  `cd.cssId.startsWith(PANE_PREFIX) || cd.cssId === EDITOR_TOOLBAR_ID`, and the removed
  pass's `isPane` computation to the same disjunction. The toolbar is now always
  shape-compared ⇒ `kept` when unchanged, `replaced` only on a `disabled`/`data-mode`
  flip → a single LIVE root, no per-reconcile teardown.
- **Regression:** `(Finding 1/b) an UNCHANGED toolbar … lands in kept` and
  `(Finding 1/b) a disabled flip … lands in a SINGLE replaced entry` in
  `tests/unit-live8-toolbar-undo-refresh.test.ts` (RED pre-fix: the unchanged toolbar
  was `[]`-kept and the flip was not a single `replaced`; GREEN after).

**AD-2026-09-14-2 (Finding 2 — MED, regression/guard):** add guards/proving that
(a) EXACTLY ONE live `editor-toolbar` root persists across N successive content
reconciles (no phantom/secondary stacked toolbar, which would silently re-freeze
Undo), and (b) an unrelated content change with an UNCHANGED toolbar lands it in
`kept` (no destroy/attach) while a `disabled` flip lands it in `replaced` (single
live root).
- **Fix (host, test-only):** added `(Finding 2/a) EXACTLY ONE live editor-toolbar
  root across N successive content reconciles` (host `reDerive('content')` loop:
  boot → no-bumps → edit → undo → more no-bumps; asserts `listTargets()` LIVE toolbar
  count is always 1), plus the two `(Finding 1/b)` pure-`reconcileDocumentRoots`
  classification tests above. All GREEN after the Finding 1 fix.

## 4. Census

- **Renderer runtime:** +1 `editor-toolbar` branch in `extractContentRoots`
  (`src/renderer/runtime.ts:108-126`) +1 in `destroyRoot`'s `isRoot` gate
  (:467-488). No new deps, no new files.
- **Renderer content-reconcile:** +1 `editor-toolbar` branch in `asContentRoot`
  (`src/renderer/content-reconcile.ts:87-106`).
- **Reuse:** the existing pane-style always-shape-compared `replaced` reconcile
  (:561-568), the shared `destroyRoot`/`attachRoot` seams, `applyEditorToolbar`
  (`sidebar-panes.ts:2550-2568`), `fetchJournal` (:2588-2596).
- **Unchanged:** `pane-history`, the journal seam, the undo/redo host methods, the
  toolbar handler bodies, `rag-store.ts`.

---

## 5. Typed Property register (PBT)

Register convention (imported): rows typed **P-IM** (input-model), **P-SM**
(state-model), or **P-TP** (transform) — NEVER F-rows, ≤8 rows. Budget:
≤100-attempts-per-row / ≤400-total / stop-after-5.

| Row | T | Pinned invariant | Strategy key |
| --- | --- | --- | --- |
| `P-IM-1` | IM | **`editorToolbarContent` authors the toolbar `disabled` from the projected depths.** The Undo button carries `disabled: undoDepth <= 0` and Redo `disabled: redoDepth <= 0` (`pane-graph.ts:1337/:1344`), derived from the `journal` arg (`undoDepth`/`redoDepth` at :1327-1328); a null/absent journal coerces depths to `0` (Undo/Redo disabled at base). The toolbar root id is the pinned `editor-toolbar` (:1264) and its button ids `editor-toolbar-undo`/`editor-toolbar-redo` (:1272-1273). | `strat:toolbar-authored-disabled` | ∀ generated `(journal)`: `editorToolbarContent(mode, zone, journal)` returns a `div#editor-toolbar` whose `editor-toolbar-undo` child carries `disabled === (journal.undoDepth <= 0)` and `editor-toolbar-redo` child `disabled === (journal.redoDepth <= 0)`; `journal == null` ⇒ both `disabled === true`. |
| `P-IM-2` | IM | **The `editor-toolbar` root is a content-root reconcile candidate.** `extractContentRoots` (runtime), `asContentRoot` (content-reconcile), and `destroyRoot`'s gate (runtime) all admit the pinned `editor-toolbar` cssId as a pane-like root; `asContentRoot` returns `{ cssId, ragNodeId: cssId }`. Only this id is admitted — an arbitrary/non-content id (non-`rag-`/`pane-`/not-`editor-toolbar`, empty, or a template/zone id) is still rejected. | `strat:toolbar-reconcile-candidate` | ∀ pinned `editor-toolbar`: `extractContentRoots(env)` includes the root when its props.id === `'editor-toolbar'`; `asContentRoot({props:{id:'editor-toolbar'}}) === { cssId:'editor-toolbar', ragNodeId:'editor-toolbar' }`; `destroyRoot('editor-toolbar')` resolves to a destroyable root. ∀ generated hostile id (`__proto__`, `pane-`-too-short, `rag`/`rag-`, a random `foo-bar`, `template`): `asContentRoot`/`extractContentRoots` return null / omit it, and `destroyRoot` returns false (never destroys/attaches it). |
| `P-SM-1` | SM | **After a journaled content edit + `reDerive('content')`, the live toolbar Undo is enabled.** Empty journal boot (`undoDepth 0`, Undo disabled) → commit an edit that journals one entry → trigger `reDerive('content')` (→ `applyContentChange` → `applyEditorToolbar` from the refreshed `lastJournal` → content reconcile re-materializes the toolbar) → the emitted `#editor-toolbar-undo` root carries `disabled === false`. | `strat:undo-enabled-after-edit` | ∀ generated single content entry that bumps `undoDepth` 0→1 and a subsequent `applyContentChange` over a fresh envelope: the toolbar root emitted after the reconcile has `disabled === false` on `#editor-toolbar-undo`; prior to the edit (empty journal) it was `disabled === true`. |
| `P-SM-2` | SM | **Redo symmetric.** After an `undo` that reverts the entry (`redoDepth 0→1`) followed by the re-derive, the live `#editor-toolbar-redo` carries `disabled === false`; clicking Redo re-applies and flips `#editor-toolbar-undo` back to enabled. | `strat:redo-enabled-after-undo` | ∀ entry reverted via a journal `undo` (`redoDepth 1`) and the resulting re-derive: the emitted `#editor-toolbar-redo` has `disabled === false`; after a subsequent `redo` re-apply the emitted `#editor-toolbar-undo` has `disabled === false`. |
| `P-SM-3` | SM | **A click on the enabled Undo reverts the content.** `#editor-toolbar-undo` click body → `window.provident.sidebar.historyUndo()` (function-guarded) → `applyJournalOp('undo')` → `bridge.rag.journalOp` → on `ok` `fetchJournal()` + `requestRebuild('operator')`; the content reverts to the pre-edit value. Never throws; an absent/older bridge is a no-op. | `strat:click-undo-reverts` | ∀ one-entry journal (undoDepth 1, Undo enabled): invoke the Undo click body → the delegate calls `historyUndo()` once; with a stubbed `journalOp.resolve({ok:true})` the content store reflects the reverted value and `requestRebuild('operator')` fires; with `journalOp.resolve({ok:false})` or an absent `bridge.rag.journalOp` NO rebuild fires and NO throw escapes. |
| `P-TP-1` | TP | **The toolbar root is always shape-compared so a `disabled` flip lands in `replaced`.** Because `editor-toolbar` is not `rag-`-prefixed, `reconcileDocumentRoots` treats it as pane-like (`isPane`, document `''`) and `useShape` is true for it (content-reconcile.ts:564); a `disabled` prop change flips `shapeChanged` → `replaced` (:566) → the `applyContentReconcile` replaced branch (:526-535) `destroyRoot`+`attachRoot`s it. | `strat:toolbar-replaced-on-flip` | ∀ reconcile where the previous toolbar root `{disabled:true}` and the next authored root `{disabled:false}` (undoDepth bump) are both present: `reconcileDocumentRoots` reports `editor-toolbar` in `replaced` (not `kept`), and after `applyContentReconcile` the live graph contains EXACTLY ONE `editor-toolbar` root carrying the fresh `disabled:false` (no duplicate, no stall). |
| `P-TP-2` | TP | **The content reconcile destroys+attaches the stale toolbar root.** On `replaced`, `applyContentReconcile` destroys the old `editor-toolbar` node (via the broadened gate) and attaches the fresh one through `attachRoot` (:490-511), pruning the destroyed subtree from `this.nodes` (:486). | `strat:toolbar-replaced-seam` | ∀ `editor-toolbar` in `replaced`: after `applyContentReconcile`, the old toolbar node is destroyed (not present in the live node set) and a fresh toolbar node is attached; `this.nodes` does not retain the destroyed subtree (AF5 prune). |

**Class tally:** IM ×2, SM ×3, TP ×2 = **7 rows ≤ 8** ✔.

---

## 6. TestWriter red-set contract (derive every test from this)

The red set uses the repo's existing harnesses; each is **RED today / GREEN after the fix**.

**(a) Host reconcile red (the LIVE-8 core).** In the renderer host harness
(dom-shim; boot host with an **empty journal** → `undoDepth 0` → the boot
`#editor-toolbar-undo` is `disabled === true`), **commit a content edit that
journals one entry**, then trigger `reDerive('content')` (the `applyContentChange`
path), and assert the emitted toolbar root's `#editor-toolbar-undo` is
`disabled === false`. **Today the fresh `disabled:false` is dropped (the
`editor-toolbar` root is not a reconcile candidate) so it STAYS `true` → RED.**
Mirror for `#editor-toolbar-redo` after an undo.

**(b) historyUndo/historyRedo round-trip regression.** `historyUndo()` on an
enabled Undo → `applyJournalOp('undo')` → revert → the re-derive flips
`#editor-toolbar-undo` to `disabled === true` (at base) AND `#editor-toolbar-redo`
to `disabled === false`; a subsequent `historyRedo()` re-enables Undo and re-disables
Redo. (Operator-path reload already re-authors; this pins the round-trip stays
correct end-to-end.) **Today the undo ROUND-TRIP (operator path) may appear green in
isolation; the regression here pins the flipped states on BOTH paths after the fix.**

**(c) Content-then-edit path.** A first content change (no journal bump) followed by
an edit (journal bump) keeps the toolbar `disabled` correct across BOTH successive
content re-derives — no stale `disabled` from the earlier empty-journal boot carries
into the later re-derive. **Today the second re-derive still holds the stale
`disabled:true` → RED.**

**(d) AF2 hostile-bucket regression.** After the fix, a reconcile payload carrying a
non-`rag-`/`pane-` hostile root id (e.g. `__proto__`, a random id) is STILL not
destroyed/attached — only the pinned `editor-toolbar` joins the allow-list. (Should
be green both before AND after; guards the security gate from the widening.)

---

## 7. Mandatory live battery (RCA-11/RCA-12 — a UI-overhaul unit is not pre-DONE while its live battery is parked)

Run against the assembled app on a usable display via `scripts/live-drive.mjs`:

- **A new `toolbar_undo` block (to be added to `scripts/live-drive.mjs`):**
  1. Seed corpus (the existing `seedCorpus`), then resolve a document/rag node via
     `rag.list_documents` (the seeded `alpha.md`'s node id, e.g. `.live-corpus/...`)
     and commit an edit through the MCP `edit.*` tool — `edit.set_content`
     (`src/main/mcp-server.ts:2315`, journals a content entry → broadcasts
     `rag-store-changed` → the host re-derives `content`).
  2. **Assert the LIVE-8 fix / red:** `cdp.evaluate` on `#editor-toolbar-undo`
     (the `data-role='history-undo'` button) — `el.disabled` must be **`false`**
     after the edit. **Today it stays `true` → this is the LIVE-8 red** (the freshly
     authored `disabled:false` never reaches the assembled DOM).
  3. `cdp.click('#editor-toolbar-undo')` (or the redo pair) — a REAL DOM
     click→handler→`window.provident.sidebar.historyUndo`→`journalOp('undo')` round-
     trip (the shared **RCA-12 assembly layer**: the same seam a node-greened
     `provident.dispatch` exercises).
  4. Assert **the content reverts** (the edited string is gone from the stage body /
     document DOM) AND `#editor-toolbar-undo` `disabled === true` again at base
     (or the redo button now enabled) — the journal stack reflects the revert.
  **Today step 2 FAILS live** (the button is disabled → the click would be a no-op);
  it MUST pass after this fix.

**Park note:** the `toolbar_undo` block is fully reachable via the CDP click surface
+ the `edit.set_content` MCP tool + the seeded corpus — it is **NOT park-eligible**
(RCA-11). Park ONLY a structurally non-exercisable surface (an OS-owned native
dialog), which this block is not.

---

## 8. Cross-references

- `docs/defects.md` **LIVE-8 UNDO-INERT** (line 22).
- `docs/specs/unit-u-edit-2-undo-redo-history.md` — the owning spec: §2.1
  (Undo/Redo controls + disabled state from `undoDepth`/`redoDepth`), §2.5 (the
  project-journal host seam — `historyUndo`/`historyRedo` → `bridge.rag.journalOp`),
  §4 F1/F2 (empty-stack no-op), §5 Census. THIS unit adds the content-re-derive
  disabled-refresh invariant to §2.1.
- `docs/specs/unit-u-state-1b-host-application.md` — the content-reconcile
  (`applyContentReconcile` / `reconcileDocumentRoots`) design this fix extends.
- `docs/specs/rca-live-bugs-green-pipeline.md` (RCA-11/RCA-12 — right-layer +
  live-battery gates).
- Build: `src/renderer/runtime.ts` (`applyContentReconcile` :455-549,
  `destroyRoot` :467-488, `attachRoot` :490-511, `extractContentRoots` :108-126);
  `src/renderer/content-reconcile.ts` (`asContentRoot` :87-106,
  `reconcileDocumentRoots` :380+, pane shape-compare / `replaced` :561-568);
  `src/renderer/sidebar-panes.ts` (`applyContentChange` :1478-1536,
  `applyEditorToolbar` :2550-2568, `onRagStoreChanged` :2044-2075,
  `historyUndo`/`historyRedo` :2603-2610, `applyJournalOp` :2615-2626);
  `src/renderer/pane-graph.ts` (`EDITOR_TOOLBAR_ID` :1264, undo/redo buttons :1337 /
  :1344, handler bodies :1285-1296); `src/main/preload.ts` (`journalOp` :452);
  `src/main/rag-store.ts` (`undoDepth`/`redoDepth` :1395-1396).

## 9. Delimitation

Scoped reconcile allocation for the pinned `editor-toolbar` root ONLY. It does
**not** change the journal semantics, the undo/redo host methods, the toolbar
handler bodies, `RagStore`, `pane-history`, or any model/layout. The AF2
hostile-bucket gate is preserved (only the pinned id joins the allow-list). It does
**not** patch `provident-ssr` (AGENTS.md). No new dependencies.
