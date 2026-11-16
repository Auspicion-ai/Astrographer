# L3 — `shell-chrome` / `menu-opener`: the pinned signatures, the FOUR refusal arms, the fail-soft list, the attribution

**Layer:** L3 · **Date:** `2026-11-16` · **Ceiling:** 150 lines · **Module:** `shell-chrome` (`N` = 26, cap 310 — `READ` `strata/modules.json:17,32`; L2 §7 states the wider reading and leaves the choice to L0) · **Unit contract:** `docs/L1/unit-u-4-menu-opener.md` · **Integration surface:** `docs/L2/shell-chrome/menu-opener.md`
**Markers:** `READ` = read in this pass, file and line named — **every line number on this page is the PRE-EDIT head** (`R-1`…`R-5` are landing in parallel in this same tree, so post-edit numbering moves; re-anchor before quoting). `RECORDED` = measured elsewhere, quoted with its measurer. `RUN` = a command with its runner — **this seat ran NOTHING**: a second runner in this tree would contaminate the L4 seat's readings.
**Layer declaration (mandatory, D-10 / `RCA-12`):** **nothing in this page is app-green.** Every limb this design must satisfy is **node/envelope class** under the layout-less `src/shared/dom-shim.ts` (`READ` `:79-81` a `className` STRING + a `listeners` bag, `:253` `dispatchPointer`; no grid, no CSS, no paint, no real menu). **The native menu bar has no DOM node and no CDP surface** (`scripts/live-drive.mjs` reaches the renderer only through CDP calls aimed at the PAGE — `Runtime.evaluate`, `Input.dispatchMouseEvent`, `Input.dispatchKeyEvent`; ⟨**CORRECTED `2026-11-16` by the L1 examiner, `U4-D-7` — `RCA-8(c)`, annotate-beside: this clause named "CDP's DOM + `provident.dispatch` only" and is kept visible as the superseded reading; the input-dispatch pairs do not change the conclusion, because every one of them targets the renderer's page and none targets OS chrome**⟩), so the opener's chain is **`G8`-PARKED with contract §4.1's recorded reason** — never parked by default (`RCA-11`), never claimed as green. **The six unread links, as L2's header counts them: (i) the OS drawing the item in the menu bar · (ii) the OS dispatching its native click · (iii) `actions.openSettings` reaching `backend.broadcast` in a real main · (iv) the `IPC_SETTINGS_OPEN` arrival in the real preload/renderer realm · (v) the frame's class flip in a real document · (vi) the operator's experience of pressing it.** None of the six is claimed below.

## 1. `R-1` — the item, the label, the action seam (`src/main/app-menu.ts`)

```ts
export const SETTINGS_OPENER_LABEL = 'Security & Settings…'   // U+2026, the ellipsis :117 already uses
export interface AppMenuActions {                            // READ :15-23
  openImport(): void
  openImportFolder(): void
  togglePane(id: string, enabled: boolean): void
  openSettings(): void                                       // NEW — the View opener's ONE route
}
// default actions (:94-98) gains `openSettings: () => {}`; the View submenu (:128-134) becomes:
submenu: [
  { label: SETTINGS_OPENER_LABEL, click: () => { actions.openSettings() } },   // item 0 — keys EXACTLY {label, click}
  { label: 'Panes', enabled: paneItems.length > 0, submenu: paneItems },       // item 1 — byte-unchanged
]
```
**Pseudocode.** 1. export the ONE label constant at module scope. 2. add `openSettings(): void` to the actions interface (its doc comment records WHY the item carries no `role`). 3. add the no-op to the default actions object so a structure-only template stays constructible. 4. push the opener as the View submenu's FIRST element, `Panes` second, nothing else in the builder touched. 5. **The clause:** the item's own enumerable key set is exactly `label`+`click`; it carries **no** `role`, `type`, `accelerator`, `checked`, `submenu` — a `role` would replace the authored `click` and claim an OS action this app performs (`A`(a2)/`B`(b2)), an accelerator would be an unreadable claim (`ASM-U4-4`). `File` (`Import…` / `Import folder…` win+linux / separator / `Quit`) and the single `{ role: 'appMenu' }` leader are **unmoved** (`A`(a4)/(a5), `C`(c1)/(c2)).

## 2. `R-2` — the channel constant (`src/shared/types.ts`)

```ts
export const IPC_SETTINGS_OPEN = 'provident:settings:open'    // main→renderer, one-way, NO payload member
```
**Pseudocode.** 1. one new section beside the U-MENU-1 block (`READ` `:846-867`, whose `IPC_PANE_VISIBILITY` at `:867` is the shape to imitate). 2. the doc comment states: no payload, no receipt, **manual-UI only — never an MCP tool**, and the item carries no `role`. 3. **The clause:** the literal is **defined exactly once under `src/**`** — the comment must describe the channel *without re-spelling the literal* (§11 (a)).

## 3. `R-3` — the broadcast (`src/main/main.ts`)

```ts
// :8 — one name joins the existing list; the import FORM is pinned (:205-209 of the row reads it)
import { …, IPC_PANE_VISIBILITY, IPC_SETTINGS_OPEN, … } from '../shared/types.js'
const actions: AppMenuActions = {                                    // READ :527-540
  openImport: () => openImportDialog(),
  openImportFolder: () => openImportFolderDialog(),
  togglePane: (id, enabled) => { … },                                // :531-536 — untouched
  openSettings: () => { backend.broadcast(IPC_SETTINGS_OPEN, null) }, // NEW — the whole of R-3
}
```
**Pseudocode.** 1. import the NAME (never the literal). 2. add the one action arrow whose body is a single `broadcast` with the literal `null` payload. 3. **The clause:** exactly ONE `broadcast(IPC_SETTINGS_OPEN, null)` site (`D`(d2)); nothing else moves — no `ipcMain` handler, no window-creation change, `:1145`'s boot install and `:543`'s `IPC_PANE_CATALOG` registration and `:534`'s `IPC_PANE_VISIBILITY` path untouched. `null` is type-legal: `broadcast(channel: string, msg: unknown): void` (`READ` `mcp-server.ts:2849`).

## 4. `R-4` — the subscription (`src/main/preload.ts`)

```ts
onSettingsOpen(handler: () => void): () => void        // interface member: TWO-space indent, ONE line, beside :135

onSettingsOpen(handler: () => void): () => void {      // implementation: an OBJECT-LITERAL METHOD, two-space indent
  const listener = (): void => { handler() }
  ipcRenderer.on(IPC_SETTINGS_OPEN, listener)
  return () => { ipcRenderer.removeListener(IPC_SETTINGS_OPEN, listener) }
},
```
**Pseudocode.** 1. declare the member top-level in `ProvidentBridge` (a native-menu arrival, top-level for `onPaneVisibility`'s reason). 2. implement it in the exposed object literal at two-space indent, the file's **LAST** `  onSettingsOpen(`. 3. one subscription, one detach of the SAME listener. 4. **The clause:** the listener takes **no parameters** and calls `handler()` with **no argument** — the signal carries no data (§11 (b)); the arrival is **not** try/caught here (`:383-391`'s byte-discipline), because the fail-softness on a throwing opener is the renderer's `route` (§6, `F`(f3)).

## 5. `R-5` — the handler path (`src/renderer/renderer.ts`; the handler path ONLY)

```ts
export interface MenuOpenerBridge {
  onSettingsOpen?: (handler: () => void) => (() => void) | void
}
export function openSettingsOverlay(): boolean
export function installMenuOpener(
  bridge: MenuOpenerBridge | null | undefined,
  opener: () => unknown = openSettingsOverlay,
): () => void
// the ONE call site — immediately after `installSettingsModal()` (READ :1584); `bridge` = window.provident (:1285)
installMenuOpener(bridge)
```
**`openSettingsOverlay` pseudocode.** 1. resolve the document **at CALL time**: `typeof document === 'undefined' || typeof document.getElementById !== 'function'` ⇒ `false`. 2. resolve the frame by the literal id `settings-modal`, then the toggle by `settings-toggle`; either absent ⇒ `false`. 3. read the frame's `className` ONCE into a local; if it is not a string, the token set is empty (§8). 4. if `className.split(/\s+/).includes('is-open')` ⇒ `false` (the idempotent arm). 5. read the toggle's `click` member ONCE into a local; not a function ⇒ `false`. 6. `fire.call(toggle)` — the affordance's OWN method, once. 7. `return true`. One outer `try` spans 1–7; its `catch` answers `false` (§7).
**`installMenuOpener` pseudocode.** 1. `bridge == null` ⇒ no-op unsubscribe. 2. read `bridge.onSettingsOpen` inside a `try`; a throw ⇒ no-op. 3. not a function ⇒ no-op. 4. build `route = () => { try { void opener() } catch { /* per-arrival fail-soft */ } }`. 5. `const unsub = member.call(bridge, route)` inside a `try`; a throw ⇒ no-op. 6. `typeof unsub === 'function' ? unsub : noop` — never `undefined`.
**The clause that matters.** ⟨**CORRECTED `2026-11-16` by the L1 examiner (`U4-C-2`) — `RCA-8(c)`, annotate-beside: this clause said "exactly TWO" and is kept visible as the superseded reading, because the pseudocode right above and this page's own §7 arm 5 already carry the other two.**⟩ The refusal arms are **FOUR**, each answering `false` having written nothing and fired nothing: **(1)** no `document` · **(2)** the frame or the toggle absent · **(3)** **the toggle affords no `click`** (pseudocode step 5; the arm §7 arm 5 grades) · **(4)** **the frame already carries the `is-open` TOKEN** (pseudocode step 4 — the idempotence arm, a whitespace-split token test, so `is-opened` is not open). Every other input fires the affordance and answers `true`. **`openSettingsOverlay` reports *the affordance was fired*, never *the overlay is open*** (`ASM-U4-6`): it reads no controller, holds no controller, exports no controller from `modal-state.ts`, writes no class, dispatches no graph op, and gives up no receipt. **Argument-spelling note (`RUN`, the examiner's `U4-C-1`):** `window.provident`'s global type (`src/renderer/secure-panels.ts:32-34`) carries no `onSettingsOpen` and `MenuOpenerBridge` is a WEAK type, so a bare `installMenuOpener(bridge)` is a genuine `TS2559` (**`exit 2` measured**); adding the member to that global and dropping the cast measures `exit 0`, but that file is outside the unit's path list — so the call stays ONE line with the cast inside it, and `G2`'s `typecheck` reads **0**.

## 6. `R-6` — the invariant, restated

**`INV-U4`:** the opener is a **role-less item whose ONE click route opens the overlay through the LANDED controller**. Halves: the item's own key set is exactly `label`+`click`; the template's role census stays **1 (linux) / 2 (darwin)**; no `src/main/**` file references `menu-template`; the channel is **defined once** and **name-referenced** by both consumers; and the opener path **writes no class** — the flip is `modal-state.ts`'s.

## 7. The fail-soft arms, individually (no arm throws; `F`(f3) + `G5`)

| # | Arm | Class written | Fired | Answers |
|---|---|---|---|---|
| 1 | no `document`, or `getElementById` absent/not a function | 0 | 0 | `false` |
| 2 | `#settings-modal` absent (or a throwing `getElementById`) | 0 | 0 | `false` |
| 3 | `#settings-toggle` absent | 0 | 0 | `false` |
| 4 | `className` is not a string (§8) | 0 | the click, once | `true` |
| 5 | the toggle carries no `click` (the shim's own state — `ShimElement` has none) | 0 | 0 | `false` |
| 6 | the `click` throws (caught by the one outer `try`) | 0 | 1 attempt | `false` |
| 7 | `bridge == null` | — (no DOM touch) | — | callable no-op unsubscribe |
| 8 | the member read throws (a hostile getter) | — | — | no-op |
| 9 | the member is not a function | — | — | no-op |
| 10 | the subscribe throws | — | — | no-op (never propagates) |
| 11 | the subscribe answers **no** unsubscribe | — | — | no-op (never `undefined`) |
| 12 | the opener throws on EVERY arrival | 0 (the throwing opener is the DOM arm's) | 0 completed clicks | the seam keeps running; the unsubscribe still detaches |

- **Reachability fact (`READ` `dom-shim.ts:462-465`):** the shim's `getElementById` **fabricates** an element for any id and never answers `null`, so arm 2 is unreachable *by absence* on the shim — it is reachable only through a throwing/absent `getElementById` or off-shim; the null check is kept anyway (L2 §5's row demands `false` on an absent element, and the id is the contract, never a class probe).

## 8. The idempotence classifier (`ASM-U4-7`)

`className.split(/\s+/).includes('is-open')` — a **TOKEN** test re-derived at **every** press, with **no cached flag**. `settings-modal is-opened` is **NOT** open (fires); `is-open is-open` and `settings-modal is-open` are open (`false`, zero clicks, zero writes — `F`(f5), which sets the class DIRECTLY at row `:1082`, so the reading never depends on the controller's word). A cached "already opened" boolean goes stale the moment **Escape** (`READ` `modal-state.ts:204-209`), **the scrim** (`:214-216`) or **the toggle** (`:198-200`) closes the overlay, and a stale-open frame would swallow the operator's second press.

## 9. The attribution argument — why the class flip is `modal-state.ts`'s, not this path's

`modal-state.ts` holds the ONE controller (the adopted `overlayTransition` word, `READ` `:171`) and the ONE mirror (`READ` `:176-181`): it writes `is-open` **XOR** `is-closed` while preserving sibling classes, and `settle` (`:186-194`) runs that write **only when the adopted record reported `changed`**. Limb `f4` reads **ONE** class write across the whole route and **`f4b` is the attribution control**: with the wiring absent, the same opener still answers `true`, fires the click **once**, and writes **ZERO** — so the write `f4` counts is the mirror's. A class write from this path would be a **second author of one state** — the defect class `D-8`/`ADV2` — and the controller's word would then disagree with the frame: the next Escape/scrim/toggle would close nothing (the controller already believes what the frame now says), or the modal would re-close on the operator's next open. Hence `modal-state.ts` owes **zero byte** to this unit (L2 §1).

## 10. The `document`-absent arm, and why the resolution is at CALL time

`renderer.ts` is imported in the node realm **BEFORE any shim exists** (`READ` row `:809-813`), so a module-scope `const doc = document` would either throw or freeze `undefined`; the lookup therefore happens **inside** `openSettingsOverlay`, per call. Two independent guards keep the module inert under the test: this unit's own call-time check, and the module's landed boot guard `if (typeof document !== 'undefined')` (`READ` `:1627-1633`) — which is what keeps `main()` from running at all (the shim's `readyState: 'loading'`, `READ` `dom-shim.ts:468`, would in any case only queue a never-fired `DOMContentLoaded`).

## 11. Two design facts the red set grades mechanically

- **(a) the literal occurs ONCE under `src/**`.** Limb `d4` walks every `src/**` file and reads the RAW text — **no comment stripping** (row `:678-705` via `:682-688`): the literal may appear exactly once, in `types.ts`'s initializer. **No comment, JSDoc, test, doc or `index.html` byte under `src/**` may carry it**, and `types.ts`'s own `R-2` comment must describe the channel **without re-spelling it** (a second occurrence inside `types.ts` reds `defined !== 1`; a stray elsewhere reds the `strays` half). Both consumers reference the **NAME**.
- **(b) the preload body carries no payload token in CODE.** Limb `e2` strips comments first (`codeOnly`, row `:158-164`) and then reads the brace-matched implementation body for `payload`, `change`, `.data`, `event.` (row `:760-772`): the payload rule may be **described in a comment** (stripped) but never in code. A zero-parameter listener satisfies it by construction. Placement is pinned too: the implementation must be the **LAST** `  onSettingsOpen(` at exactly two-space indent (row `:753-757`), or `e2`/`e3` read the interface row and see no `ipcRenderer.on`; `e3` requires both channel arguments to be literally `IPC_SETTINGS_OPEN` and both listener arguments the same identifier (row `:775-795`); `e1` requires the interface member on ONE line (row `:723-748`).

## 12. The layer/evidence table

| Limb (sub-ids) | What of this design it grades | Class |
|---|---|---|
| `A` (a1–a3, a4, **a4(i)**, a5) | `R-1`: item 0's label = the constant, key set exactly `{label, click}`, `click` reaches `openSettings` **once** and the other three actions zero times; the fork's File/View enumeration unmoved; **a4(i)** is the positional witness RED by construction | node/**envelope** |
| `B` (b1, b2, b3) | the role census 1/2 **unmoved while the item exists**, plus the driven `role:'viewMenu'` falsifier (must read 2/3) | envelope |
| `C` (c1–c3) | the four exports stand, `src/main/**` references `menu-template` ZERO times, with the decoy control | envelope (text oracle) |
| `D` (d1–d4) | `R-2`/`R-3`/`R-4` lockstep: one definition, ONE `broadcast(<name>, null)` site, ONE `ipcRenderer.on` + ONE `removeListener`, one spelling | envelope |
| `E` (e1–e3) | `R-4`'s declared shape + one-listener discipline — a **SOURCE** read (`preload.ts` imports `electron`, not loadable in node) | envelope |
| `F` (f1–f3, f4, **f4b**, f5) | `R-5`: subscribe-once/detach, one arrival one opener, TOTALITY, the default opener's ONE open (**f4**), the attribution control (**f4b**), idempotence (**f5**) | node/**envelope** on the shim |
| `G` (g1–g3) | the vendored menulib fabricates no `role` and writes no receipt member, with its owned-`role` control | envelope |
| the trio · `drift` · `node --check scripts/live-drive.mjs` | this repo's runners — `npm test` / `npm run typecheck` / `npm run build`, `drift` `CLEAN` + PIN arm EQUALS, the driver parse gate | envelope/harness + `[D]` |
| **the six unread links (§3 above)** | **`G8`-PARKED — no instrument of any class**; a `window.__openSettings` hook was NAMED and REFUSED (an MCP-invisible surface invented for the harness) | **PARKED, reason recorded** |

**`RECORDED`, quoted with the measurer — the pre-edit red run** (the L1 TestWriter's own run, per L2 §6): **`1 failed`** / **`Tests 5 failed | 2 passed (7)`** — `A`,`B`,`D`,`E`,`F` red; `C`,`G` green-on-arrival as declared. **No other reading on this page is a measurement; this seat ran nothing and claims no green.**

## 13. What this page does NOT decide

The internals (statement order inside a body, naming of locals, where in a file a helper sits) are **L4's**. **The app is nobody's at this layer** — the six links stay `G8`-PARKED with contract §4.1's reason, and no node row above may be reported as app health (`RCA-12`). The **register collateral** is **L2 §8.1's** (six re-records in four files; `N` = 26 vs 27 is L0's choice) — this page seals no digest and re-records no count. `docs/FORK-DIVERGENCE.md`'s `SC-7` line range and the `docs/specs/unit-u-menu-1-application-menus.md` clauses are L2 §9's owed trackers (`U4-F3`/`-F4`), reported there, not here.

## 14. Findings (contract/L2 statements read against the code; recorded, never silently corrected)

- **`L3-U4-F1` — `docs/L1/unit-u-4-menu-opener.md` §3 limb `A`, sub-id `a5`.** As filed, `a5` reads *"a HARNESS-supplied `click` is not needed here (the template is pure data)"* — a non-assertion. The row's actual `a5` (`tests/unit/shell-chrome/menu-opener.test.ts:423-441`) asserts the **top-level label census** `['File','View']` on both platforms, `darwin.length === 3`, and the `{ role: 'appMenu' }` leader owning **no** `label`. Satisfiable by `R-1` unchanged (nothing at top level moves), so no design byte changes — but `a5`'s contract text does not describe what is graded.
- **`L3-U4-F2` — `docs/L1/unit-u-4-menu-opener.md` §2 `R-4`, site cell.** It cites `ProvidentBridge` as `READ :117-136`; the interface actually runs **`:117-305`** (`READ`: declaration `:117`, closing brace `:305`; L2 §1 has it right). `:135` is only `onPaneVisibility`'s declaration row, and the implementation is `:383-391`. The change lands correctly either way; the range understates the block `e1`'s text oracle brace-reads.
