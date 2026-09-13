# Unit U-SHELL-8 — View-Menu Pane Visibility (C13) — Spec

**Status: GREEN — COMPLETE (2026-09-12).** Implemented + tested. Unit file
`tests/unit-u-shell-8-view-menu-pane-visibility.test.ts` — **34 pass**. Blind
artifact `unit-u-shell-8-view-menu-pane-visibility-greens.md` — **24/24 PASS**
(V4/V5 were an initial run FAIL; the toggle-path `zone:*` `is-empty` mirror was
fixed by `syncZoneMirrors` — see §2.6 pin 5 + the greens drift history). Trio:
**178 files / 4135 pass + 54 skip**, typecheck 0, build OK. Documentation review
(RCA-6): `archive/reviews/2026-09-12-u-shell-8-doc-review.md`. Gate: the
UI-overhaul umbrella gate (PROCEED-WITH-AMENDMENTS, A1). **Depends on
U-MENU-1** (the native View menu + catalog IPC + `IPC_PANE_VISIBILITY`, Wave 1),
**U-SHELL-1** (zones), and **C9** (`enabledPanes` serialization). Resolutions:
Q10 native View menu; Q11 operator-only; W1-Q2 catalog pushed on boot/change.
Open items in `docs/specs/wave-2-open-decisions.md` (W2-Q5/W2-Q10).

---

## 1. What the proposal asks

A **View menu** exposes a **pane-visibility selection dropdown** listing every
registered pane with a visibility toggle (C13). Today there is no application
menu, and `OperatorSettings.enabledPanes` exists but is only **displayed**
(`sidebar-panes.ts:1205`), never applied at runtime. Deliver the runtime
application + persistence.

## 2. Contract (pinned)

### 2.1 Data-driven from the registry

- The View → Panes submenu is built from the **live `PaneRegistry` catalog**
  pushed over `IPC_PANE_CATALOG` by U-MENU-1 (`paneCatalog()`,
  `sidebar-panes.ts:624`; re-pushed on `registry.onChanged`, `:883`). Never a
  hard-coded list; a newly registered pane appears without a main-process change.
- Grouped by scope (`app-graph` vs operator); deterministic order.

### 2.2 One model (C9)

- Toggling a checkbox sends `IPC_PANE_VISIBILITY { id, enabled }` (from
  U-MENU-1's menu item) → the renderer:
  1. `registry.setEnabled(id, enabled)`;
  2. writes the serialized **`enabledPanes`** in the C9 UI-config (the
     `OperatorSettings` carrier);
  3. re-derives the zones so the pane appears/disappears.
- U-MENU-1 owns the menu item + IPC; **U-SHELL-8 owns the apply + persistence +
  zone re-derive.**

### 2.3 Cascades into C11

- Hiding the **last** pane in a zone empties it → the zone auto-hides (C11) and
  reveals only on drag proximity (U-SHELL-4).
- Showing a pane into a hidden zone un-hides that zone (restores its retained
  size, U-SHELL-1).

### 2.4 Operator-only; no MCP tool

- The visibility control is a **manual-UI surface** (sibling of the settings
  toggle), **operator-only** (Q11). There is **no** MCP tool to toggle pane
  visibility (§6) — an agent must not blind the MCP-visible app graph.
- Hiding an app-graph pane deliberately removes it from
  `get_rendered_html` / `list_targets` (a human action). Hiding an operator pane
  removes it from the operator isolated scope only (already MCP-invisible).

### 2.5 Pane-additive application

- Applying a toggle should be a **pane-additive reconcile** (attach/detach the
  `pane-<id>` root through the U-SHELL-1 zone producers), **not** a full
  `loadEnvelope`/teardown — see W2-Q5. The content path (U-STATE-1) already
  reconciles panes; U-SHELL-8 reuses it.

### 2.6 Pinned implementation details (post-TestWriter, 2026-09-12)

1. **Scope authority model (W2-Q10):** `enabledPanes` (existing) is the
   authoritative enabled set for **app-graph** panes. An **empty** `enabledPanes`
   → all app-graph panes enabled (registration defaults). **Operator panes** are
   enabled by default and governed by a NEW additive
   `OperatorSettings.enabledOperatorPanes: string[]` (default `[]` → all operator
   panes enabled); the View menu lists + toggles them. This reconciles the
   existing host test that boots `enabledPanes:['doc-nav']` yet still expects the
   operator `settings` pane rendered (an empty operator list = operator default).
2. **Host apply seam:** subscribe at boot via `bridge.onPaneVisibility(({ id,
   enabled }) => …)` (U-MENU-1's IPC); the handler calls
   `registry.setEnabled(id, enabled)`, writes the C9 carrier
   (`enabledPanes`/`enabledOperatorPanes` per scope), and re-derives the zones
   additively.
3. **Order/shape:** `enabledPanes`/`enabledOperatorPanes` membership is what
   matters; order is not semantically significant.
4. **F4 queuing:** the outcome (queued, then applied additively without a full
   `loadEnvelope`) is pinned; the exact rebuild kind is an implementation detail.
5. **Zone-mirror refresh (V4/V5):** `applyContentReconcile` reconciles content
   roots (`rag-`/`pane-`) ONLY, so a pane-additive visibility toggle that empties
   or repopulates a zone must ALSO re-emit that `zone:<name>` container's
   state-derived `is-empty`/`is-minimized` mirror classes — `syncZoneMirrors`
   applies the assembler-computed classes through the managed `state-slice`
   channel (pane-additive: no `loadEnvelope`/teardown, stable `zone:*`
   identities, no redundant write when the mirror already matches). This closes
   the V4/V5 blind FAIL (a fresh boot rendered the mirror correctly; the toggle
   path did not). See `docs/specs/wave-2-open-decisions.md` §D W2-N8 for the
   journal-layer follow-up.

### 2.7 Adversarial findings (2026-09-12) + pinned fixes

Read-only adversarial pass; host findings fixed here, no package findings.

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **H1** | med | F3 "unknown id dropped" only warned; the authority used the **unfiltered** list, so a single unknown id blinded **all** panes of that scope. | **FIXED** — filter unknown ids out of the effective list before the `length`/`includes` authority computation. |
| **H2** | med | "all panes hidden" was **unpersistable** (an empty enabled-subset is reinterpreted as all-enabled). | **FIXED** — add the additive `OperatorSettings.panesInitialized: boolean` (default `false`); when `true`, an empty list means **none enabled**. |
| **H3** | low | Boot TOCTOU: a toggle during boot was clobbered by the stale boot-fetched enable sets. | **FIXED** — the `paneVisibilityTouched` in-flight guard suppresses the boot `applyPersistedPaneVisibility` once any toggle has landed. The subscription is in fact registered **before** the boot apply (`boot` wires `onPaneVisibility` at `sidebar-panes.ts:1166`, then awaits the settings fetch and applies at `:1230`); the guard, not the ordering, is the operative fix (verified by the blind H3 `subscribedBeforeApply=true` observation). |
| **H4** | low | A wrong-scope persisted id silently blinded the other scope. | **FIXED** — filter/warn ids whose registry scope doesn't match the list. |
| **H5** | low | (pre-existing) `settingsContent` throws on a non-array `enabledPanes`. | **FIXED** — `Array.isArray` guard. |
| **H6** | low | A pane registered **after boot** named in persisted `enabledPanes` stayed disabled. | **PINNED** — persisted lists govern panes present at boot; a pane registered later defaults to **enabled** (registry default). |

**Confirmed-safe:** malformed/hostile `IPC_PANE_VISIBILITY` (non-object/non-string id/non-boolean/`__proto__`/`constructor`) all ignored, no throw, no prototype pollution, no phantom; scope isolation both directions; F1/F2/F7; no full reload (C10/§2.5 — `requestRebuild('content')` → `applyContentReconcile`, stable `zone:*`); MCP invisibility (§2.4/§6 — no pane tool in `ALL_TOOLS`, 57 entries); C11 cascade + retained size; restart persistence. **Correction (2026-09-12):** the "C11 cascade" half of this claim was recorded optimistically before the blind run. V4/V5 initially **FAILED** — the pane-additive toggle path detached the pane roots but did not refresh the `zone:*` `is-empty` mirror (a fresh boot rendered it correctly, the toggle path did not). **FIXED** by `syncZoneMirrors` (§2.6 pin 5); V4 (empty → `is-empty`) and V5 (un-hide → cleared `is-empty` + retained size) now **PASS** and the blind tally is **24/24**. No package findings.

## 3. States (TestWriter red set — valid paths)

1. Boot → `enabledPanes` from the store is applied to the registry (a persisted
   enabled pane renders; a disabled one does not).
2. Toggle a pane ON in the View menu → `registry.isEnabled` true; the pane
   renders in its zone; `enabledPanes` persisted.
3. Toggle a pane OFF → the pane is removed; `get_rendered_html`/`list_targets`
   no longer contain it; `enabledPanes` persisted.
4. Hiding the last pane in `left` → the zone becomes `is-empty` (C11).
5. Showing a pane into an empty zone → the zone un-hides + restores its size.
6. The operation is additive: no `loadEnvelope`/teardown; `zone:*` ids stable.
7. The control is operator-only: no MCP tool toggles visibility.
8. Restart with a persisted hidden pane → it stays hidden.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | a toggle for an unregistered pane id | ignored; no phantom entry |
| F2 | a malformed `IPC_PANE_VISIBILITY` payload | ignored; never throws |
| F3 | an unknown id in persisted `enabledPanes` | dropped + warning |
| F4 | toggling while an edit is dirty | queued via the rebuild guard |
| F5 | a pane that renders nothing when enabled | renders the empty state; never throws |
| F6 | a toggle while the catalog is stale | registry is authoritative; catalog re-pushes after |
| F7 | a settings write failure | the in-memory enablement still applies for the session |

## 5. Census

- Reuse of U-MENU-1's `IPC_PANE_VISIBILITY` + catalog; new host wiring:
  `onPaneVisibility` subscription → apply/persist/re-derive; the pane-additive
  zone reconcile. 0 new dependencies; no new MCP tool.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` C13, C11, §3 (view-menu visibility), §4 G10,
  §5.7 SG3, §6 (no `provident.toggle_pane` tool), §7 Q10/Q11.
- `docs/specs/unit-u-menu-1-application-menus.md`,
  `unit-u-shell-1-layout-zones.md`, `unit-u-shell-4-drag-relocate.md`.
- Build: `src/renderer/pane-registry.ts`, `src/renderer/sidebar-panes.ts`
  (`paneCatalog`/`pushPaneCatalog`), `src/main/preload.ts`
  (`onPaneVisibility`), `src/main/app-menu.ts`, `src/main/operator-settings-store.ts`.

## 7. Delimitation

This unit applies + persists pane visibility and re-derives the zones. It does
NOT build the native menu/catalog IPC (U-MENU-1), the zone model (U-SHELL-1), or
the drag mechanics (U-SHELL-4). It adds **no** MCP tool.

## 8. Open items

**None.** W2-Q5/Q10 RESOLVED (reuse the U-STATE-1 pane reconcile — detach = invisible to MCP; list both scopes) — see `docs/specs/wave-2-open-decisions.md`. `wave-2-open-decisions.md` §E.3 requires the pane-additive no-full-reload discipline be **verified** during implementation (the C10 discipline).
