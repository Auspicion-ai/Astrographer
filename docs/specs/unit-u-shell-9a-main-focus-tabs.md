# Unit U-SHELL-9a — Main-Focus Tab Strip + Focus Tool (C14) — Spec

**Status: GREEN — COMPLETE (2026-09-12).** Implemented + tested. Unit file
`tests/unit-u-shell-9a-main-focus-tabs.test.ts` — **62 pass + 4 skip** (the 4
skips are the live-runtime/MCP-equivalence battery placeholders). Blind artifact
`docs/specs/unit-u-shell-9a-main-focus-tabs-greens.md` — **32 scenarios — 32
PASS** (live-battery caveats in §2.10 + the artifact's "not tested" notes).
Trio: **179 files / 4197 pass + 58 skip**, typecheck 0, build OK. Documentation
review (RCA-6): `archive/reviews/2026-09-12-u-shell-9a-doc-review.md`. Gate: the
UI-overhaul umbrella gate (PROCEED-WITH-AMENDMENTS, A1). **Depends on
U-SHELL-1** (the top-bar region + zones). This is the **9a** half of the
`unit-u-shell-9-main-focus-tabs.md` split (§9.4, RCA-2): the tab strip +
`TabTarget`/`TabEntry`/`TabState` + the additive `OperatorSettings.tabs` (C9) +
**single-active render** (only the active tab's body mounted) + the new-tab /
default rules (W2-Q11) + the `search` pane-first behavior (§9.1) + the **MCP
focus tool `provident.focus`** (§9.2). The simultaneous multi-document render +
**C20** (shared-subtree background + owners box) + **Option-C** commit
warn/fork all land in **U-SHELL-9b**
(`docs/specs/unit-u-shell-9b-cross-document-shared.md`). Resolutions honoured:
**W2-Q11** (tabbable kinds + new-tab default), **W2-Q12** (strip not
dispatchable — parity via shared application code), **W2-Q13** (C20 owners-box
source = the `rag.backlinks` reverse map — the C20 *behavior* is 9b). See
`docs/specs/wave-2-open-decisions.md`.

**Cycle record (2026-09-12, RCA-1/RCA-2):** TestWriter red (suite-load — the new
`src/renderer/tab-state.ts` absent; the `OperatorSettings.tabs` carrier + the
`provident.focus`/expand seams absent) → Implementer green **62 pass + 4 skip**
in `tests/unit-u-shell-9a-main-focus-tabs.test.ts` → adversarial pass (RCA-3)
found + fixed **HOST-1..HOST-8** (§2.10) → blind run (`…-greens.md`, **32/32
PASS**) → the documentation review (RCA-6)
`archive/reviews/2026-09-12-u-shell-9a-doc-review.md`.

---

## 1. What the proposal asks

The window's **top-bar** becomes a browser-style horizontal **tab strip** (shell
chrome); each tab holds a **main-focus target** (RAG document | search-results |
graph | gnosis doc | other) and the **active** tab's provident body renders in
the central stage (C2). Affordances: active highlight, close, reorder-within-
strip, new-tab, overflow. Open tabs + active tab + order serialize (C9).

U-SHELL-9a is the **single-active** half: the strip, the focus-descriptor model,
the serialized tab state, the first-tab/default rules, the `search` pane-first
behavior, and the MCP focus tool. It does **not** mount inactive tabs (that is
the C14 simultaneous render, U-SHELL-9b) and does **not** touch shared-node
semantics.

## 2. Contract (pinned)

### 2.1 Placement + layout ordering

- `top-bar (tabs)` → `header` pane zone (C11-hidden when empty) → main row
  (`left | stage | right`) → `footer` pane zone.
- The top-bar is a **shell region, not a pane zone** — it never participates in
  pane drag/relocate or the C11/C12 zone states.

### 2.2 Tab focus-descriptor model

```
TabTarget = { kind: 'document'; documentId: string }
          | { kind: 'search'; queryId: string }      // search-results
          | { kind: 'graph'; view: string }          // PARKED — unparks with G3
          | { kind: 'template'; templateId: string } // PARKED — unparks with the template work
          | { kind: 'other'; id: string }            // extensible
TabEntry  = { id: string; target: TabTarget; title: string }
TabState  = { version: number; open: TabEntry[]; activeId: string | null; order: string[] }
```

- **v1 active kinds:** `document` + `search`; `graph`/`template` are declared in
  the model but **PARKED** (F9 placeholder until unparked). Gnosis documents are
  **interpreted into the document format** and arrive as `document` targets.
- **Structural invariants:** `order` is a permutation of `open[].id`; `activeId`
  is `null` or a member of `open` (F1).
- The strip is **shell chrome** (the directive): active highlight, close,
  drag-to-reorder-within-strip (distinct from pane relocate C4), new-tab,
  overflow/scroll.

### 2.3 Single-active render (9a)

- **Only the active tab's body is mounted** in the central stage. Inactive tabs
  are **descriptors** (`TabEntry`) with no materialized body. Switching tabs
  mounts the selected target's provident body and unmounts the previous body.
- The active tab's target drives the central-stage content; the content renders
  under the content-scope root (Q5) so document styling is independent of
  chrome. **Each tab's body is provident-authored** (app-graph, MCP-visible).
- **Delimitation vs 9b:** the C14 **simultaneous render** ("all open tabs are
  mounted") is **U-SHELL-9b**, gated on U-STATE-1e. 9a mounts exactly one body.
- A tab body's content identity is stable across a RAG content change
  (U-STATE-1): a content re-derive never closes/reorders tabs, and the mounted
  active body is repopulated in place (no `loadEnvelope`/teardown).
- **Empty-store landing co-authoring (INV-E1..E4, fix-spec U-LIVE4):** at a TRUE
  empty-store boot, the central-stage **landing** (`#stage-landing` /
  `data-stage='landing'`) is **authored INTO the same pane-inclusive envelope** as
  `#editor-toolbar` and the `.pane-frame[data-pane-id]` panes — not a bare empty
  content zone, and not a landing mounted by a second competing `loadAppGraph`. The
  landing survives a still-empty RAG **content** re-derive (repopulated in place)
  and is re-rendered by a template/operator re-derive / `refresh()` (reassembled
  from `lastTraversalEnvelope`, which is the landing envelope after empty boot).
  This contract is owned by `docs/specs/unit-live4-empty-store-landing.md` and
  supersedes the empty-store-landing half of the §2.10 deferral caveat below.

### 2.4 New-tab / default rules (W2-Q11, refined 2026-09-12)

- **Only the first tab may open without a target.** The **focused store** = the
  **most recently used store**; if **no store exists**, the first tab opens a
  **landing page listing the available wikis** (the existing provident graph
  stores for the built-in components). Within a focused store the default
  resolves: (1) the previous session's most-recently-focused document, else
  (2) the alphabetically first document, else (3) the store/landing listing.
- Every **other** tab requires an explicit target (a document link, opening a
  graph, a search result).
- Close-active → left neighbour else right; the **last** tab falls back to the
  first-tab default. Duplicate targets are **allowed** (distinct tab ids, F5).
- **Overflow:** the strip **scrolls horizontally** (no overflow dropdown).

### 2.5 Persistence (C9)

- `TabState` serializes through the C9 carrier (`OperatorSettings`): open set +
  active tab + order round-trip and survive restart + a RAG content change.
- `OperatorSettings` gains `tabs: TabState` (additive, versioned, fail-soft —
  the `layout`/`theme` precedent).
- A persisted `activeId` not in `open` falls back to the first tab / no active
  (F1); a malformed `TabState` fails soft to an empty tab set (F6).

### 2.6 `search` pane-first target identity (§9.1, RESOLVED 2026-09-12) — reserved verbatim

- **Pane-first:** the `search` pane renders a **scrollable results element**
  inline, with a **button to expand into a full tab**.
- **On opening a tab**, the search params are stored **on the `TabEntry`** (the
  tab owns its query state once opened).
- **New search from the `search` pane → always opens a NEW tab**; **changing the
  query inside a search tab → reuses that same tab** (re-runs in place).
- **Result click → opens the link in a NEW tab** (a `document` tab; the search
  tab stays).
- **Shape:** `{ kind: 'search'; queryId: string }`; the `TabEntry` carries the
  `rag.query` params (`query`/`topK`/`mode`/`maxHops`/`expand`/
  `maxParentContext`/`filters`/`stores` — C18). Results are **derived** (re-run
  via `rag.query` / the `rag-query` IPC), never stored.
- **Persisted:** yes — the search state (params + tab) serializes in `TabState`
  (C9); results re-run at boot / on a store change. A search tab always has a
  target → never the targetless first tab.
- **Parity:** an MCP `rag.query` is equivalent
  (`DECIDED: MCP-UI-EQUIVALENCE`); the focus tool can target a `queryId`.

### 2.7 MCP focus tool `provident.focus` (§9.2, RESOLVED 2026-09-12) — reserved verbatim

- **Name:** `provident.focus`.
- **Semantics:** **find-or-open** — activate an existing tab for the target, else
  open + activate; `newTab: true` forces a duplicate.
- **Mutation scope:** changes **UI focus only**. It persists **nothing except the
  current focused tab** (`OperatorSettings.tabs.activeId`); it does **not** mutate
  the graph/RAG. Therefore it is **NOT** in `MUTATING_METHODS` and emits **no**
  `app-graph-changed`; the tab persistence rides the `OperatorSettings` change
  broadcast (`IPC_OPERATOR_SETTINGS_CHANGED`).
- **Group:** `dispatch` (the action group) — recommended.
- **Args:** a `TabTarget` **or** `{ tabId }`, plus optional `{ newTab?: boolean }`.
- **Return:** the resulting `TabState`.
- **Parity:** the same application-code focus-selection seam the strip calls.
- Decision row: `DECIDED: MCP-FOCUS-TOOL` (`docs/decisions.md`).

### 2.8 Parity note (W2-Q12)

- The shell strip itself **need not** be `provident.dispatch`-able (W2-Q12).
  Parity holds because tab/focus selection is backed by shared application code
  (the same focus/document-selection operation the MCP side calls).
- **W2-Q11 (user): a new MCP focus tool IS in scope** — it drives the *same*
  application-code focus-selection seam (target a document/tab) so an agent can
  change the active tab. The tool is the parity surface; the strip is its UI.

### 2.9 Pinned implementation details (post-TestWriter, 2026-09-12)

1. **New module `src/renderer/tab-state.ts`** with: `TAB_STATE_VERSION`,
   `TAB_LANDING`, `defaultTabState`, `coerceTabState`, `coerceTabTarget`
   (HOST-6), `targetEquals`, `activeTab`, `focusTarget`, `openTab`, `closeTab`,
   `reorderTab`, `setSearchParams`, `nextQueryId` (HOST-7), `resolveDefaultTarget`,
   `ensureFirstTab`.
2. **`TabEntry`** carries the search params as an optional `search?` field (the
   C18 `rag.query` surface).
3. **Landing/wikis listing** is modeled as `{ kind: 'other'; id: 'landing' }`
   (the `TabTarget` union has no `landing` kind).
4. **Close vs default split:** `closeTab` → the empty set; `ensureFirstTab(ctx)`
   materializes the first-tab default (prev-session focus → alpha-first doc in the
   focused store → landing listing).
5. **MCP focus routing:** renderer-routed `backend.invoke('focus', payload)` (the
   shared focus-selection seam); exactly one invoke, **zero** broadcast (no
   `app-graph-changed`); args `target` / `tabId` / `newTab`.
6. **Single-active render** is node-testable as the `activeTab()` selection. The
   stage mount/unmount is ALSO node-testable via `SidebarPanes.mountTab` +
   `loadAppGraph` (HOST-1 — the `document` and landing bodies are pinned by the
   HOST-1 regressions); the async search-body mount and the parked
   graph/template placeholder bodies are **settled live** (W2-N10, §2.10).
7. **Overflow:** `index.html` carries an `overflow-x: auto|scroll` rule for the
   strip region.
8. **Search pane-first expand control:** a second `on:click` handler in
   `searchContent` (structurally detected; no handler name pinned by §2.6).
9. **Coercion:** `coerceTabState` drops dangling/duplicate ids, keeps `order` a
   permutation of `open[].id`, and falls back `activeId` (F1/F6).

### 2.10 Adversarial findings (2026-09-12)

The RCA-3 adversarial pass (post-green, read-only) found + fixed eight HOST
findings, each with a regression in the unit file's "HOST adversarial-fix
regressions" block. All are HOST-side (this repo); **no package finding**.

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **HOST-1** | HIGH | `TabStrip`'s `onActiveChange` was never wired to a stage mount: switching the active tab changed `activeId` but never mounted/unmounted the body (the single-active render was model-only). | **FIXED** — `SidebarPanes.mountTab(entry)` + the `loadEnvelope`/scoped-traversal path (`document`) / landing / search / placeholder bodies; wired from `renderer.ts`'s `onActiveChange` and the boot `bootTabs`. Regression: HOST-1 (active-body swap). |
| **HOST-2** | HIGH | The first-tab default context was a placeholder (`hasStore:false`, no documents), so the default never resolved the focused store's documents / last-focused doc. | **FIXED** — `SidebarPanes.getTabContext()` returns the real doc-heads snapshot + `OperatorSettings.defaultDocumentId`/current doc; wired as `TabStrip.getContext`. Regression: HOST-2. |
| **HOST-3** | MED | A non-first `+` with no target synthesized a targetless/`documents[0]` tab instead of requiring an explicit target. | **FIXED** — `TabStrip.newTab()` is a no-op when `open.length > 0` and no target is supplied. Regression: HOST-3. |
| **HOST-4** | MED | A search-result click did not open the link in a new tab (`searchContent` had no result-open `on:click` handler; no `openDocumentTab` seam). | **FIXED** — `SEARCH_RESULT_OPEN_HANDLER` (`pane-search-result-open`) + the `openDocumentTab` bridge delegate → `TabStrip.openDocumentTab` (new `document` tab; the search tab stays). Regression: HOST-4. |
| **HOST-5** | MED | An in-tab query edit did not reuse the same search tab (no `editSearchQuery` seam / in-tab submit handler). | **FIXED** — `SEARCH_TAB_SUBMIT_HANDLER` (`pane-search-tab-submit`) + the `searchTabQuery` bridge delegate → `TabStrip.editSearchQuery` → `setSearchParams` (re-runs in place). Regression: HOST-5. |
| **HOST-6** | MED | A malformed/empty focus target materialized a phantom tab (no total target coercion; the MCP zod accepted empty ids). | **FIXED** — `coerceTabTarget` (total: unknown / empty kind / empty id → `null`) gates `TabStrip.focus`; the `provident.focus` zod schema pins `.min(1)` on every id. Regression: HOST-6. |
| **HOST-7** | LOW | Two search tabs could share a `queryId` after a close/reopen (the old `open.length + 1` formula re-used an id). | **FIXED** — `nextQueryId` allocates collision-free (`search-<n>`, mirrors `nextTabId`); `expandSearchTab` uses it. Regression: HOST-7. |
| **HOST-8** | LOW | `provident.focus { tabId: 'ghost' }` on a non-empty set fell through to the first-tab default, materializing a spurious tab. | **NO reproducible RED** — the guard (`open.length > 0` ⇒ no-op) was added defensively; the empty-set case keeps the F3 default. Regression: HOST-8. |

**Deferrals / caveats (recorded, not scored as FAIL):**

- **Single-active (one-body) 9a — content re-derive while a landing/search tab
  is active.** Under 9a a RAG content re-derive does not repopulate an active
  landing/search tab body in place; the **identity reconcile** that keeps the
  mounted body stable across a content change (the U-STATE-1 path for the active
  tab) is the **U-SHELL-9b** work, **blocked on U-STATE-1e**. The model
  invariant (open set / active / order stable) is pinned (V6); the mounted-body
  identity is the deferred half. *(Scope note, 2026-09-15: the **empty-store**
  landing is now CLOSED by U-LIVE4 — `docs/specs/unit-live4-empty-store-landing.md`
  INV-E1..E4 pin that the empty-store landing is co-authored into the
  pane-inclusive envelope and survives a still-empty content/template re-derive
  + `refresh()`. The remaining 9b deferral here is the **non-empty** active tab
  body (a `document`/`search` tab) identity reconcile, still gated on
  U-STATE-1e.)*
- **Non-document stage mount (blind caveat).** The blind run observed that in
  the node harness a non-`document` `mountTab` left the stage without a
  `zone:main`. HOST-1 subsequently made the mount node-testable for the
  `document` and landing bodies; the async **search**-body mount
  (`mountSearchStage` → `rag.query`) and the parked **graph/template**
  placeholder bodies remain to be **settled live** (recorded as **W2-N10** in
  `docs/specs/wave-2-open-decisions.md` §D).

## 3. States (TestWriter red set — valid paths)

1. Boot with a persisted tab set → the strip renders the tabs in `order`; the
   `activeId` tab's content renders in the stage. Boot with **no** persisted set
   → a single **first tab** opens targetless via the default (prev-session focus
   → alphabetically first doc in the focused wiki → "Getting started"/landing).
2. New-tab → a new `TabEntry` becomes active; the strip updates; the state
   persists. Only the first tab may be targetless; any later new-tab **requires a
   target**.
3. Close the active tab → the neighbor becomes active; the closed tab's content
   unmounts; the state persists.
4. Reorder tabs within the strip → `order` changes (drag); no pane relocation.
5. Switch tabs → the stage renders the selected target's provident body
   (single-active: the previous body unmounts).
6. A RAG content change keeps the open set/active/order; tab content identity
   stable.
7. `provident.focus` with an existing target → the existing tab is activated
   (find-or-open); no new tab; `activeId` persists.
8. `provident.focus` with `newTab: true` → a duplicate tab opens + activates.
9. Restart with a persisted tab set → the tabs + active restore.
10. **Empty-store boot (U-LIVE4, INV-E1..E4):** at a TRUE empty store the central
    stage shows the landing (`#stage-landing` / `data-stage='landing'`)
    **co-authored in the same pane-inclusive envelope** as the editor-toolbar and
    the panes; a still-empty content re-derive keeps it, and a
    template/operator/refresh repopulates it (never a bare empty content zone).

*(Original U-SHELL-9 states 7–8 — the Option-C fork and the C20 background/owners
box — are **U-SHELL-9b** states, not this unit's red set.)*

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | a persisted `activeId` not in `open` | fall back to the first tab / no active |
| F2 | a `document:` target whose document was deleted | the tab renders a missing-document state; never throws; optionally auto-close |
| F3 | an empty tab set | fall back to a single **targetless first tab** (the default page: prev-session focus → first doc in wiki → "Getting started"); the strip renders the new-tab control |
| F4 | close the last tab | allowed; the tab set falls back to the **first-tab default page** (a fresh targetless tab) — never an empty stage |
| F5 | duplicate tab targets | allowed (two tabs on one doc) OR deduped — pinned: allowed, distinct tab ids |
| F6 | a malformed `TabState` | fail-soft to an empty tab set; never crashes boot |
| F9 | tab content references an unparked `graph:` view | renders the placeholder; never throws |

*(Original U-SHELL-9 F7 — a fork failure mid-commit — and F8 — a shared node
whose reverse map is unavailable — are **U-SHELL-9b** fail-states.)*

## 5.7 Property register (PBT)

This is a **CODE-BEARING** unit, so the register is mandatory. Rows are typed
**P-IM** (input-model), **P-SM** (state-model), or **P-TP** (transform) — NEVER
F-rows, NEVER §4/FS-n rows (the unit's fail-states already exist as §4 F1–F6).
**At most 8 rows.** The register follows the **`docs/specs/unit-shell-integration.md`
§5.7** and **`docs/specs/unit-gn-mcp-ui-wiring.md` §5.7** convention (identical row
typings, ≤8-row cap, class tally line, and the deterministic seeding /
≤100-per-row / ≤400 total / stop-after-5 budget — see the siblings' PBT-gate
note). The register is genuinely invariant-bearing: `coerceTabState` /
`coerceTabTarget` are **TOTAL** pure fail-soft coercions over the C9 `tabs` slice;
the open-set dedup + `order`-permutation + `activeId ∈ open` structural invariants
(§2.2) hold **after** normalization; the version gate → default is total; and the
focus-selection mutators (`focusTarget`/`closeTab`/`reorderTab`) preserve those
invariants. The rows consolidate the §2.2 structural invariant (F1) and the §4
fail-states (F1/F6, HOST-6) into invariant form rather than adding fail-state
surface.

| Ref | Class | Invariant | Strategy | Checkable proposition (∀ pattern) |
|---|---|---|---|---|
| `P-IM-1` | IM | **`coerceTabState` is total + idempotent.** Every input — a well-formed `TabState`, a record with junk `open`/`order`/`activeId`, a non-record, `null`/`undefined`/primitive, an array — yields a valid `TabState` and NEVER throws (a `version !== TAB_STATE_VERSION` or a non-record fails soft to the empty default set, F6). Coercion is idempotent: re-coercing any output is stable. | `strat:coerce-tab-total` | ∀ generated input `x`: `coerceTabState(x)` returns a `TabState` (never throws) with `version === TAB_STATE_VERSION`; and `coerceTabState(coerceTabState(x))` deep-equals `coerceTabState(x)`. |
| `P-IM-2` | IM | **Target coercion is total + kind-discriminated (HOST-6).** `coerceTabTarget(x)` returns `null` for a non-record, an unknown `kind`, or an empty/missing/non-string kind-specific identity — it never emits a partial/phantom kind; otherwise it returns a target of EXACTLY that `kind` whose identity field (`documentId`/`queryId`/`view`/`templateId`/`id`) is a non-empty string. | `strat:coerce-target-total` | ∀ generated input `x`: `coerceTabTarget(x)` is either `null`, or a `TabTarget` whose `kind` is one of `document`/`search`/`graph`/`template`/`other` carrying the matching non-empty identity string; the five malformed classes (non-record, `kind` not in the union, empty id, missing id, non-string id) all map to `null`; no partial/phantom kind value is ever produced. |
| `P-SM-1` | SM | **Open-set normalization: unique non-empty ids; `order` a permutation of `open[].id`.** After `coerceTabState`, `open[].id` values are unique and non-empty; each surviving entry's coerced target is non-`null`; duplicate ids keep the FIRST occurrence; entries with an empty/missing/non-string id, a `null` target, or a non-record shape are dropped; `order` is a permutation of `open[].id` — the same id set, no duplicates, every open id present once — built as the surviving `rawOrder` ids (those that name a coerced open member, in input-relative order, deduped) FOLLOWED BY the surviving open ids not already emitted (in `open`-relative order), so a supplied explicit `order` is honoured where well-formed and dangling/unknown ids are dropped. | `strat:coerce-open-normalized` | ∀ generated input `x`, with `s = coerceTabState(x)`: `|order| === |open|`; `new Set(order)` equals `new Set(open.map(e => e.id))` (same unique id set); every `open[].id` is a non-empty string; every `open[].target` is non-`null`; no id repeats in `open` or in `order`; a `rawOrder` id names a coerced open member only when it is in `s.open`; ordering the coerced `open` by the position each id takes in `s.order` yields the same sequence as `s.order` (i.e. every open id appears exactly once in `s.order`). |
| `P-SM-2` | SM | **`activeId ∈ open` structural invariant (§2.2/F1) holds after coercion.** After `coerceTabState`, `activeId` is `null` OR a member of `open[].id`. A supplied valid `activeId` (a non-empty string naming a surviving open id) is PRESERVED; a supplied `activeId` that is non-string / missing / dangling (naming a dropped id or absent) falls back to the FIRST tab in `order`, else `null` (F1). | `strat:active-in-open` | ∀ generated input `x`, with `s = coerceTabState(x)`: `s.activeId === null` OR `s.open.some(e => e.id === s.activeId)`; for a generated `activeId` string naming a surviving open member, `s.activeId ===` that string; for a generated non-string / missing / dangling `activeId`, `s.activeId === s.order[0]` when `s.order.length > 0`, else `null`. |
| `P-SM-3` | SM | **`focusTarget` find-or-open + `targetEquals` identity (dedup semantics, §2.7/F5).** `targetEquals(a, b)` is `true` iff same `kind` AND same kind-specific identity — a `document` target is never equal to a `search`/`graph`/`template`/`other` target. `focusTarget(state, target)` with `newTab` falsy either ACTIVATES an existing equal target (`open` unchanged, `activeId` = the existing id, no duplicate) OR appends a NEW entry (collision-free id; `open` and `order` each grow by one; `activeId` = the new id); with `newTab: true` it always appends a fresh entry. | `strat:focus-find-or-open` | ∀ valid `state` + `target`: if `state.open` has an entry `e` with `targetEquals(e.target, target)` and `newTab !== true`, then `focusTarget(state, target, {newTab:false}).open` deep-equals `state.open` and its `activeId === e.id`; else `focusTarget(...).open.length === state.open.length + 1` with a collision-free new id and `activeId` = the appended id; with `newTab: true`, `open.length` always grows by 1; and `targetEquals` is true iff the two targets share a `kind` and the matching identity string. |
| `P-TP-1` | TP | **Version-gating → the empty default (F6) + `defaultTabState`/constant determinism.** `coerceTabState(x)` returns the empty default when `x` is NOT a record OR when `x.version !== TAB_STATE_VERSION` (a different/absent/stale schema fails soft to the empty set, never a partial migration). `defaultTabState()` returns a FRESH object per call with `version === TAB_STATE_VERSION`, `open === []`, `activeId === null`, `order === []`; `TAB_STATE_VERSION === 1`; `TAB_LANDING` is `{ kind: 'other', id: 'landing' }`. | `strat:version-gate-default` | ∀ generated non-record `x`: `coerceTabState(x)` deep-equals `defaultTabState()`; ∀ generated record `x` with `x.version !== 1`: `coerceTabState(x)` deep-equals `defaultTabState()`; ∀ call: `defaultTabState()` is a `version === 1` empty state (`open === order === []`, `activeId === null`); `TAB_STATE_VERSION === 1`; `TAB_LANDING` deep-equals `{ kind: 'other', id: 'landing' }`. |
| `P-TP-2` | TP | **`closeTab` / `reorderTab` preserve the structural invariants (§2.2/F4).** `closeTab(state, id)` on a KNOWN id removes it from both `open` and `order`, leaving a valid `TabState` (`order` a permutation of the new `open[].id`); when the CLOSED tab was active, `activeId` falls to the LEFT neighbour, else the RIGHT, else `null` (F4); an UNKNOWN id is a no-op (returns `state` itself). `reorderTab(state, id, toIndex)` never changes `open`/`activeId`, keeps `order` a permutation of `open[].id` with `toIndex` clamped into the valid index range `[0, order.length]` (the post-removal `order`, i.e. `0 .. |open|−1`) before re-inserting the moved id; an unknown id is a no-op. | `strat:close-reorder-invariant` | ∀ valid `state` + id `i`: if `i ∈ state.order`, `s' = closeTab(state, i)` has `s'.order` = `state.order` minus `i`, `s'.open` = `state.open` minus the `i` entry, `s'.activeId === null` OR `∈ s'.open`, and when `i === state.activeId` the fallback is the LEFT neighbour id (the id at the preceding `order` index) if any, else the RIGHT if any, else `null`; if `i ∉ state.order`, `closeTab` returns `state` unchanged; ∀ `i`, `toIndex`: `s'' = reorderTab(state, i, toIndex)` has `s''.open` deep-equals `state.open`, `s''.activeId === state.activeId`, `|s''.order| === |state.open|`, and `s''.order` a permutation of `s''.open[].id`, with the moved id's final position = clamp of `toIndex` into `[0, |state.open| − 1]`; unknown reorder id → no-op. |

**Class tally:** IM ×2, SM ×3, TP ×2 = **7 rows ≤ 8** ✔.

The rows above are **NOT over-strength**: every proposition is directly observable
from the pinned `src/renderer/tab-state.ts` export surface (§2.9 pin 1) — all seven
are pure-coercion or pure-mutation truths over the `.d.ts`-visible types
(`TabTarget`/`TabEntry`/`TabState`/`TabSearchParams`/`TabDefaultContext`) and the
structural invariants already pinned in §2.2 (F1) / §2.5 (F1/F6) / §2.4 (F5)
without inventing a new field, a new seam, or a new fail-state. They consolidate
the §2/§4 rows into invariant form (open-set normalization + `order` permutation +
`activeId ∈ open` are the F1 structural invariant; the version gate + non-record
default are F6; the empty target → `null` is HOST-6; the left/right close fallback
is F4; duplicate-target tolerance is F5), so the register cannot reject the landed
module — every row is provably satisfying the existing `coerceTabState` /
`coerceTabTarget` / `focusTarget` / `closeTab` / `reorderTab` / `defaultTabState`
implementations (§2.9).

## 5.8 Census

- Shell: top-bar strip controller (active/close/reorder/new/overflow) + the
  `TabState` serialize path; provident: the **single active** tab body in the
  stage; the `search` pane's pane-first results element + expand-to-tab control.
- `OperatorSettings` gains `tabs: TabState` (additive, versioned, fail-soft).
- **New MCP tool:** `provident.focus` (group `dispatch`), driving the shared
  focus-selection seam (in scope per W2-Q11).
- 0 new dependencies; no `provident-ssr` change.
- *(The C20 shared-subtree class + owners box + the Option-C warn dialog are
  **U-SHELL-9b** census items.)*

## 6. Cross-references

- Split source: `docs/specs/unit-u-shell-9-main-focus-tabs.md` (SPLIT pointer).
- **Fix-spec U-LIVE4 (empty-store landing co-authoring):**
  `docs/specs/unit-live4-empty-store-landing.md` (INV-E1..E4, §3 F-L4-1..6, the
  9-test TestWriter red set — `tests/unit-live4-empty-store-landing.test.ts` holds 9
  `RED` blocks, red → green 13 incl. `unit-live4-adversarial-fix.test.ts` 4 — and the
  mandatory `boot_landing` live battery, **LIVE-CONFIRMED 2026-09-15**).
- `docs/specs/unit-u-shell-9b-cross-document-shared.md` (the multi-document/C20/
  Option-C half).
- `docs/specs/ui-overhaul.md` C14, C2, §3 (main-focus tabs), §4 G1 (document
  focus), §7.2 (OB1 — the shared-node ruling consumed by 9b).
- `docs/specs/wave-2-open-decisions.md` W2-Q11 (§E.5), W2-Q12, W2-Q13; §B
  (W2-Q17).
- `docs/specs/unit-u-shell-1-layout-zones.md` (the top-bar region dependency).
- Decisions: `UI-CONFIG-CARRIER` (the C9 carrier), `MCP-UI-EQUIVALENCE`,
  `MCP-FOCUS-TOOL`.
- Build: `src/renderer/sidebar-panes.ts`, `src/renderer/pane-graph.ts`,
  `src/renderer/index.html`, `src/main/operator-settings-store.ts`,
  `src/shared/types.ts` (`OperatorSettings.tabs`, `IPC_OPERATOR_SETTINGS_CHANGED`),
  `src/main/mcp-server.ts` (`provident.focus`, group `dispatch`).

## 7. Delimitation

This unit builds the tab strip + focus-descriptor model + serialized tab state +
**single-active** render + the new-tab/default rules + the `search` pane-first
behavior + the **new MCP focus tool** (W2-Q11). It does NOT build the pane zones
(U-SHELL-1), pane drag (U-SHELL-4), the C14 **simultaneous multi-document
render**, C20, or the Option-C/CROSS-DOCUMENT-SHARED behavior (all U-SHELL-9b).
`graph:` views that are PARKED (knowledge-graph inspectors) and the template
editor render a placeholder until unparked. It does NOT modify the reconciler
(U-STATE-1e) — the single-active path reuses the landed U-STATE-1 behavior.

## 8. Open items

**None.** W2-Q11/Q12/Q13 are RESOLVED (2026-09-12) — see
`docs/specs/wave-2-open-decisions.md`. The multi-document/C20 half is deferred
to U-SHELL-9b, which is **BLOCKED on U-STATE-1e** (the N-root reconcile + fork
identity follow-on, W2-Q17=(a)); 9a itself is unblocked.

**Source inconsistency (resolved, recorded).** The source's default-fallback
step (3) is worded two ways: the header / W2-Q11 say the **empty-wiki "Getting
started" page**, while `unit-u-shell-9-main-focus-tabs.md` §2.2 says the
**store/landing listing**. This spec treats them as the same fallback state (the
empty-store/landing page, which lists the available wikis and degrades to
"Getting started" when no wiki exists); both phrasings are preserved above so the
TestWriter sees the source wording.
