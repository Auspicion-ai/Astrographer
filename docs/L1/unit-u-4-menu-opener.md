# L1 — unit `U-4` `menu-opener`: the View menu's role-less opener for the app's own overlay

**Layer:** L1 · **Date:** `2026-11-16`, §10's examination pass appended the same day · **Ceiling:** 150 lines (D-2's design class) · **Write scope:** `docs/L1/`, the `docs/specs/` rows §5.3 names (D-17), plus the implementation paths §5.1 lists.
**Status:** **LANDED, GREEN and EXAMINED — the port's LAST unit before the fork becomes the baseline (D-25).** §10 carries the examination's own readings; the claims its findings corrected are marked in place.
**Markers:** `READ` = read in this pass, file and line named. `RECORDED` = measured elsewhere, quoted with its measurer. `RUN` = a command with its runner.
**Layer declaration (mandatory, D-10/RCA-12):** **nothing here is app-green.** A node row runs under the layout-less DOM shim ⇒ **envelope-green**; the native menu bar has no DOM node and no CDP surface ⇒ the opener's chain is **`G8`-PARKED with its reason (§4.1)** — RCA-11's carve-out for a structurally non-exercisable surface, **never by default, never claimed green**.

## 1. The unit, its fence, and the rulings it obeys

- **The behaviour:** the **View** menu carries **an opener item carrying NO `role`**, whose click routes to **the app's own overlay opener** — the landed security & settings modal (`docs/specs/unit-u-shell-7-settings-modal.md`, re-expressed over the adopted overlay machine by `PD-UI-6`). One item, one channel, one handler.
- **What stays the fork's:** the **View → Panes submenu** and the fork's enumeration (File: `Import…` · `Import folder…` win/linux only · `Quit`; View: `Panes`) are **byte-unchanged** (`READ` `src/main/app-menu.ts:111-135`, pre-edit). The foundation's Electron menu template is **NOT copied** (`../Provident-Electron/docs/guides/forking.md` §9/§10; the fork's row is `docs/FORK-DIVERGENCE.md` **SC-7**).
- **NO graph node (D-8's carve-out):** the native menu bar is the shell's own chrome ⇒ **no envelope node, no handler body, no placement, no `index.html` byte**. The overlay is *already* provident-exempt shell chrome hosting two provident mounts; this unit adds no third surface.
- **Why no `role` exists for it:** Electron's role vocabulary is a closed set of OS actions (`appMenu`, `quit`, `viewMenu`, …) and **none opens THIS app's overlay**. A `role` would (a) claim in the app-menu census that the OS performs an action the app performs and (b) **replace the authored `click`**, so the item would stop routing to the app (`READ` `:113,125` for the two roles the fork genuinely uses). **D-14/D-16 do not arise:** no foundation name is adopted, and limb `C` proves the vendored menulib stays unreferenced by `src/main/**`.

## 2. The change set — six rows, each with its site

### `R-1` the opener item (`src/main/app-menu.ts`)

| Site | From → to |
|---|---|
| `AppMenuActions` (`READ` `:15-23`) | gains **`openSettings(): void`**; its comment records that the item carries **no `role`** and **why** (§1). |
| the default actions (`READ` `:94-98`) | gains **`openSettings: () => {}`** — a structure-only template stays constructible. |
| new exported constant | **`export const SETTINGS_OPENER_LABEL = 'Security & Settings…'`** (U+2026, as `Import…` uses) — ONE spelling, read by builder and limb `A`. |
| the View submenu (`READ` `:128-134`) | `submenu: [ { label: SETTINGS_OPENER_LABEL, click: () => { actions.openSettings() } }, <the existing Panes item, unchanged> ]` — item 0, so the diff is one INSERTION; **its key set is exactly `label` + `click`** (no `role`, `type`, `accelerator`, `checked`, `submenu`). |

### `R-2` the channel constant (`src/shared/types.ts`)

**`export const IPC_SETTINGS_OPEN = 'provident:settings:open'`** beside the U-MENU-1 block (`READ` `:846-867`): main→renderer, one-way, **no payload member** (the signal carries no data and writes no receipt), **manual-UI only** (never an MCP tool), the item carrying **no `role`**.

### `R-3` the broadcast (`src/main/main.ts`)

The types import gains the name; `rebuildApplicationMenu`'s actions (`READ` `:527-540`) gain **`openSettings: () => { backend.broadcast(IPC_SETTINGS_OPEN, null) }`** — the payload literal is **`null`**, one site. **Nothing else moves:** no `ipcMain` registration, no window change, `IPC_PANE_VISIBILITY` untouched.

### `R-4` the subscription (`src/main/preload.ts`)

| Site | From → to |
|---|---|
| `ProvidentBridge` (`READ` `:117-305` — the whole interface block; landed `:117-314`) | gains the **TOP-LEVEL** member **`onSettingsOpen(handler: () => void): () => void`**, immediately beside `onPaneVisibility` (the exact analogue: a native-menu arrival, main→renderer, manual-UI only). |
| the implementation (`READ` `:383-391`) | ONE `ipcRenderer.on(IPC_SETTINGS_OPEN, listener)` whose listener **ignores the payload** and calls `handler()`, returning `() => ipcRenderer.removeListener(IPC_SETTINGS_OPEN, listener)` — the `onPaneVisibility` discipline. |

### `R-5` the handler path (`src/renderer/renderer.ts`) — THREE exported symbols, one call site

| Site | From → to |
|---|---|
| `export interface MenuOpenerBridge` | `{ onSettingsOpen?: (handler: () => void) => (() => void) \| void }` — the structural seam, so the handler is drivable without the electron-bearing preload module. |
| `export function openSettingsOverlay(): boolean` | **The app's OWN opener.** Resolve `#settings-modal` + `#settings-toggle` by literal id; answer **`false`** writing and firing nothing on **four refusal arms** — `document` absent · frame absent · toggle absent · **toggle affords no `click`** — plus the idempotence arm: the frame's class already carrying the **`is-open` TOKEN** (whitespace-split, so `is-opened` is not open). Otherwise fire the toggle's own `click`, answer `true`. It writes **no class**, keeps **no controller**, dispatches **no graph op**, never throws — the modal's state keeps **ONE author** (`modal-state.ts`'s controller via the affordance the shell already wires, `READ` `:196-200`). |
| `export function installMenuOpener(bridge, opener = openSettingsOverlay): () => void` | Subscribes **exactly once** through `bridge.onSettingsOpen` when it is a function, routing each arrival to `opener()`; returns the bridge's own unsubscribe (or a no-op). **TOTAL:** absent bridge, absent/non-function member, throwing subscribe, throwing opener never propagate. |
| `main()` (`READ` `:1584`) | ONE line after `installSettingsModal()`: **`installMenuOpener(bridge)`** (`bridge` = `window.provident`, `READ` `:1285`). **The ORDER is a safety property** (§10 `U4-A-2`): the frame-class guard is what makes a re-entrant open terminate. |

### `R-6` the invariant

- **`INV-U4`:** *the opener is a role-less item whose ONE click route opens the overlay through the LANDED controller.* Gradeable halves: the item owns no `role` and its key set is exactly `label`+`click`; the **role census** equals the fork's landed census (§8.1); **no `src/main/**` file imports `menu-template.js`**; the channel literal is defined **once** in `types.ts` and referenced **by name** by both consumers; the opener path **writes no class** — the flip is `modal-state.ts`'s, proved by `f4b`'s attribution control.

## 3. The red set — authored and `RUN` before any byte (RCA-1)

**ONE file** (`tests/unit/shell-chrome/menu-opener.test.ts`), **seven limbs** `A`…`G`, one `it` per limb, one `problems` aggregate each. Declared colours at the pre-edit head, and what was READ:

- **`A` the template shape — RED.** `a1` item 0's label equals the constant; `a2` its own key set is exactly `['click','label']` (each forbidden key named); `a3` pressing it calls the recording `actions.openSettings` **once** while the other three actions fire **zero**; `a4` **GREEN-ON-ARRIVAL** — the File labels on both platforms and the `Panes` item still `enabled:false` with an empty submenu (`F2`); `a4(i)` **RED by construction** — the positional witness (`Panes` at index 1); `a5` **GREEN-ON-ARRIVAL** — the top-level shape is the fork's (`['File','View']` on linux; darwin length **3**, the `appMenu` leader owning no `label`: `F5`'s branch unmoved).
- **`B` the role census.** `b1` **GREEN-ON-ARRIVAL** and says why — 1 `['quit']` / 2 `['appMenu','quit']` **cannot** move before the item exists, so it is the reading the item must not disturb; `b2` **RED** — the same census **while the opener exists** and is absent from it; `b3` the **driven control** — the oracle spliced with a `role:'viewMenu'` item must report 2 (linux) / 3 (darwin).
- **`C` the fork's enumeration, the menulib not copied — GREEN-ON-ARRIVAL + controls.** `c1` the four fork exports still resolve and `app-menu.ts` carries no `menu-template`; `c2` a walk of `src/main/**` finds zero references (with a guard that the walk covered `main.ts`/`app-menu.ts`/`preload.ts`); `c3` the **LITERAL** decoy — a source line importing the menulib must be flagged and a clean import line must not (§10 `U4-B-1` hardened this control, which had been parameterised from its own needle).
- **`D` the channel's lockstep — RED.** `d1` the literal; `d2` `main.ts` references it at **one** `broadcast(` site whose second argument is the literal `null`; `d3` `preload.ts` has **one** `ipcRenderer.on` **and one** `removeListener`; `d4` the literal occurs **exactly once** under `src/**`, the NAME referenced by both consumers, strays named per file.
- **`E` the subscription's shape — RED**, a SOURCE read (`preload.ts` imports `electron`, so the behaviour is `F`'s): `e1` the declared top-level member with its `() => void` answer; `e2` the listener calls `handler` and reads no payload member; `e3` it removes the SAME listener.
- **`F` the handler's reachability — RED**, behavioural on the REAL exports: `f1` one subscription and a detaching unsubscribe; `f2` one arrival fires the opener **once**; `f3` fail-soft over `undefined`/`null`/`{}`/throwing-subscribe/throwing-opener; `f4` the default opener against authored shim chrome **plus the landed `installSettingsModal()`** — one click, exactly **one** class write, frame reads `settings-modal is-open`; `f4b` the **attribution control** — with the wiring absent the opener fires the click but class writes read **0**, so the flip is `modal-state.ts`'s; `f5` idempotence — an open frame answers `false`, no click, no write.
- **`G` what the vendored menulib does with a role-less item — MEASURED, not assumed — GREEN-ON-ARRIVAL + control.** `g1` the projected record owns **no `role` key at all** (`'role' in projected === false` — no fabrication); `g2` the answer's key set is exactly `['items','platform']` — **no receipt**; `g3` the control — an item that DOES own `role` is projected WITH it.
- **The row is never edited to pass.** A limb declared GREEN-ON-ARRIVAL that reds at the pre-edit head is a finding about THIS contract — which happened twice (§10 `U4-L1-1`), and the contract was corrected rather than the row.

## 4. The gates, and the evidence class of each

| # | Gate | What it supplies |
|---|---|---|
| `G1` | §3's row `RUN` before any byte, then green; plus the rows it must not break (`pd-ui-6-modal-state-register`, `unit-live11-bridge-seams`, and §5.2's four register files) | envelope/harness |
| `G2` | the trio — `npm test` (**every red named with its class**; the four standing real-ollama gates are the STANDING class, and any fifth red is this unit's), `typecheck`, `build` | envelope/harness (layout-less shim, D-10) |
| `G3` | `npm run drift` — `CLEAN` with its **PIN arm equal**; `node --check scripts/live-drive.mjs` **exit 0** (the driver owes **no byte**) | `[D]` byte/revision oracle + instrument parse |
| `G5` | read-only adversarial pass (RCA-3) — §10's hostile-state table | findings recorded here |
| `G7` | the documentation review (RCA-6) + the proofreader's tracker reconciliation | document layer |
| `G8` | **PARKED — §4.1's reason, recorded** | **the assembled app, which this unit cannot reach** |

### `4.1` THE APP-GATE ANSWER — the PARK, with its bound

- **A native menu is not reachable from CDP or the DOM.** `scripts/live-drive.mjs` reaches the renderer through CDP (`Runtime.evaluate`, `Input.dispatchMouseEvent`/`dispatchKeyEvent`), all of it aimed at the **page**. The View menu is drawn by the **OS** from the template `main.ts` installs: **no DOM node, no selector, no hit-test target, no `list_targets` entry, no `get_rendered_html` presence**. The sender side is a **native click in OS chrome** no driver here can synthesize, and the preload member is a **subscriber, not a sender** (no `ipcRenderer.send` on that channel), so the renderer's realm cannot fire the arrival either. **Structurally non-exercisable — exactly RCA-11's carve-out — and recorded HERE so it can never be read as parked-by-default (RCA-11's failure mode) or as app-green.**
- **The SIX links the park does NOT cover:** (i) the OS drawing the item · (ii) a native click being dispatched at all · (iii) `actions.openSettings` reaching `backend.broadcast` in a real main · (iv) the IPC arriving in the real preload/renderer realm · (v) the overlay's class flipping and PAINTING in a real document · (vi) the operator's experience of pressing it. **None is claimed.**
- **What the node rows DO prove, at their own layer:** `A`/`B` the template's shape and the item's **absence of a role**, with the census (§8.1) · `D` the channel's **lockstep across main/preload/types** · `E` the declared **subscription shape** · `F` the handler's **reachability**, **idempotence** and **attribution** · `C`/`G` the fork's enumeration and the menulib's role-less reading. **One lawful strengthening, NAMED and REFUSED:** a `window.__openSettings` hook would let a live row press the opener's tail — refused, because it invents an MCP-invisible window surface for the harness (the class `D-8` prevents); the tail is driven at `F`'s seam. **Revisit condition for `docs/pending.md` (L0's row):** a driver surface that can press an OS menu item (a main-side harness invoking the template's `click` with a real `MenuItem`), noting that `ASM-U4-4`'s accelerator refusal also removes the only keyboard surface.

## 5. Write scope, the register collateral the landing OBLIGED, and the DONE row

### `5.1` Paths

`src/main/app-menu.ts` · `src/main/main.ts` · `src/shared/types.ts` · `src/main/preload.ts` · `src/renderer/renderer.ts` (**the handler path only** — `R-5`'s three exported symbols and its one call site) · `tests/unit/shell-chrome/menu-opener.test.ts` · `docs/L1/`, `docs/L2/shell-chrome/`, `docs/L3/shell-chrome/`. **`scripts/live-drive.mjs` and `tests/live-drive-contract.test.ts` owe NO byte** · no `package.json`, `vendor/`, `strata/`, no `provident-ssr` edit (D-9). **`src/renderer/modal-state.ts` is BYTE-UNCHANGED** (`RECORDED` `md5 cf3c8d5e…` = HEAD's blob, re-measured by the examiner).

### `5.2` THE REGISTER ROWS THE LANDING'S OWN LICENCE OBLIGED — **SIX edits in FOUR files, `REQUESTED OF L0 AS A PER-UNIT GRANT`**

`types.ts` and `preload.ts` are digest-/line-pinned by registers whose own texts licence a later unit's re-statement; without them `npm test` carries reds this unit caused. `RECORDED` (the chain, re-measured by the L1 examiner):

| File / row | Movement |
|---|---|
| `tests/pd-ui-1-theme-register.test.ts` — the `types.ts` digest row | `ff8c0b9a…` → **`8cdc2b81eef0b3fb0cd7a96f95881009`**, old value as `superseded:`, `restated: 'U-4'`, dated note naming `R-2`. |
| `tests/pd-ui-1-theme-register.test.ts` — the `preload.ts` digest row | `eb230a8b…` → **`78b237e4d53af16a846ec540c4b5be7c`**; the `restated:` field was left `'U-STORE-SECURITY-ADOPT'` — §10 `U4-F2` (`LAWFUL`, verified). |
| `tests/pd-vendor-set.test.ts` — `P-SM-2` current-bytes digest **and** line count | digest → `8cdc2b81…`; `restatedCurrent` **889 → 901**; `supersededPreVendoring: 875` kept visible. |
| `tests/pd-vendor-manifest.test.ts` — `P-SM-1(d)` | digest → `8cdc2b81…`. |
| `tests/store-persist-adopt-register.test.ts` | `DECLARED_BRIDGE_TOP_LEVEL` **17 → 18**; the "EXACTLY ONE new key" clause becomes a dated `DECLARED_DELTA = ['store','onSettingsOpen']` that still reddens on an UNDECLARED added key and on a dropped declared one. |

- **Each edit is MINIMAL** (a value or a member plus a dated note); **no assertion is relaxed** — an un-re-stated move still FAILS, which the examiner drove. The table stays **SEVEN rows** and `UNRESTATED_CONTROL_PATH` still derives to `src/shared/demo-envelope.ts`. The delegated list named **three** files; the landing needed **four** — `RECORDED` (`U4-F1`), escalated rather than smuggled.

### `5.3` D-17's document grant — **SERVED**

`docs/specs/unit-u-menu-1-application-menus.md` carries two dated clauses (`§2.1` the role-less opener's shape and why no role exists; `§2.3` the action, channel, subscription and manual-UI fence) and its `§5` census is **re-read** (2 → **3** channel consts, 1 → **2** preload members, `ProvidentBridge` 17 → 18, both `N` readings). **Annotate-beside; nothing rewritten.** **NOT touched, reported instead:** `docs/FORK-DIVERGENCE.md`'s SC-7 cites `app-menu.ts:93-135`; the builder now spans `:109-159` (pre-edit `93-136`) — outside the grant, **owed to L0**.

## 6. Assumptions, each with the alternative it rejected

- **`ASM-U4-1`** — a **dedicated channel**. **Rejected:** reusing `IPC_OPERATOR_SETTINGS_CHANGED` (its payload is the whole `OperatorSettings` and its handler re-derives the app, so a menu click would be indistinguishable from a settings write).
- **`ASM-U4-2`** — the opener **fires the shell's landed `#settings-toggle` affordance**. **Rejected:** exporting the controller from `modal-state.ts` (a fourth module's byte, outside the unit, and a second holder of one state); **rejected:** writing the frame's class here (a second author — the class `f4b` grades).
- **`ASM-U4-3`** — **idempotent OPEN, never a toggle.** **Rejected:** a toggle — `Escape`, the scrim and the affordance already own closing.
- **`ASM-U4-4`** — **no accelerator.** **Rejected:** `CmdOrCtrl+,` — the OS would honour it and no instrument of ours could read it (and §4.1 records that this refusal removes the chain's only keyboard surface). **`ASM-U4-5`** — **one exported label constant. Rejected:** a literal in the builder plus one in the row.

## 7. Acceptance

`U-4` is accepted when §3's limbs were **`RUN` before any byte** (four declared GREEN-ON-ARRIVAL, proven green **with their controls**); `R-1`…`R-6` landed inside §5.1's paths with `modal-state.ts` byte-unchanged; §5.2's six register edits landed **under L0's grant** (or the unit stopped and named the row); `G1`/`G2`/`G3`/`G5`/`G7` recorded **with their layers**; §8 quoted after the change; `G8` recorded as §4.1's **PARK with its reason and its six links**, never as green; and the DONE row states **which layer** each reading covers.

## 8. The readings — before (`READ`) and after (`RUN`)

### `8.1` The role census — the unit's census claim

**BEFORE:** non-darwin roles `['quit']` → **1**; darwin `['appMenu','quit']` → **2**; View submenu **1** item; File submenu 3 labels (linux) / 2 (darwin). **AFTER:** the census reads **1 / 2 — UNCHANGED**, the View submenu reads **2** items, and the opener owns **no `role`**. **"The role count does not move and the ITEM count does"** is the claim; a role count of 2/3 is what `b3` catches.

### `8.2` The bridge census and `N`

`ProvidentBridge` top-level members **17 → 18**; the six bridge methods the `N` formula counts (`sidebar`'s four + `operatorSettings.get`/`set`) are **unmoved**. **`N` = 26** under the map's filed rule (`onSettingsOpen` is not one of the six ⇒ `strata/modules.json` needs no amendment, cap `310`; `READ` `:32` reads `"endpoints": 26`) — **27** under the wider reading (every bridge member the harness drives), cap `320`. **`strata/` is outside every unit's scope**, so the choice is L0's: stated both ways rather than resolved by silence.

## 9. Carried, named, and NOT closed by this unit

- **The baseline's inherited ledger (D-25):** `U-5:uf_layout_10=FAIL` · `RR-F6` (`runtime.ts`'s pass-2 drain) · `(c4)`/`RR-F2` (a foreign re-render mid-gesture) · `G8`'s **open** theme-carrier row (`U-1c` §5) · `ZONE-RENAME-SILENTLY-RELOCATES-PERSISTED-PLACEMENTS` (`D-22`). **This unit closes none of them.**
- **The gap this unit ADDS, so the baseline inherits it knowingly:** **the opener's six unread links (§4.1)** — the only behaviour in the port with no instrument of any class.
- **Debts the landing leaves, each with its row:** the `preload.ts` digest row's `restated:` field still names an older unit while the value was last moved by `U-4` (§10 `U4-F2` — lawful, `docs/pending.md`'s) · the cast at `renderer.ts`'s call site (§10 `U4-C-1`) · SC-7's line range (§5.3).

## 10. The examination pass (appended `2026-11-16`; §1–§9 corrected in place where a finding demanded it)

**Battery · Code · Adversarial · Docs: PASS-WITH-FINDINGS; no blocking defect in the landed source.** The examiner's own `RUN`s: the row **`7 passed (7)`, exit 0** · `npm test` `2 failed | 153 passed (155)` files / `4 failed | 3312 passed | 22 skipped (3338)` tests, **all four the STANDING `ollama embed: HTTP 404` class, zero unit reds** · `typecheck` exit 0 · `build` exit 0, **5** artefacts · `drift` `15 checks, 0 differences — CLEAN`, **PIN arm EQUAL** · `pgrep -c -x electron` **0** · no probe left behind.

- **`U4-L1-1` (L1, CORRECTED IN PLACE).** §3's `a4` pinned a positional claim inside a GREEN-ON-ARRIVAL half (impossible before the insertion) and `d4` required the literal in three files (unsatisfiable beside "one spelling"): **`a4`/`a4(i)` split, `d4` restated** — the claims unchanged, the satisfiable form authored.
- **`U4-B-1` (battery, FIXED AND VERIFIED).** `c3` had built its decoy FROM the oracle's own needle, so a falsified needle left the row green — a dead control. It is now a **literal** decoy plus a **clean-line negative** (`READ` `:604-616`), and the control was re-driven: with the needle falsified `MENULIB_NEEDLE` reads `1 failed | 6 passed (7)`, exit 1, its problem `CONTROL FAILED: the text oracle did not flag a decoy line carrying the forbidden menu-template.js import`; restored, `7 passed (7)`, exit 0, file md5 back to `243eb7dd…`. **The control now certifies what it claims.**
- **`U4-D-1` (document, SERVED).** §5.3's granted spec clause was unserved at the examination head; **now landed** — that §5 census had drifted factually (2 → 3 consts, 1 → 2 preload members). **`U4-D-2` (document, OWED TO L0):** SC-7's range, outside the grant (§5.3).
- **`U4-F2` (ADJUDICATED `LAWFUL`).** The `preload.ts` row's `restated:` field was not re-named because **two landed oracles pin its value** (`store-security-write-register`'s `RESTATEMENT_TARGET_UNIT`, `pd-store-security-write`'s `RESTATEMENT_UNIT`), and the `U-1b` precedent on that same row did the same. The digest IS re-measured; the field under-describes its row — recorded debt, not a relaxation.
- **`U4-C-1` (note).** `installMenuOpener(bridge as MenuOpenerBridge | undefined)` — the cast is **forced** by a measured type fact (`MenuOpenerBridge` is weak/all-optional: TS2559 without it; the clean form needs the hand-kept global type in `secure-panels.ts`, a tenth file outside §5.1). `typecheck` reads 0.
- **`U4-C-2` (L1/L3 documents, CORRECTED).** `R-5` under-enumerated its refusal arms: the landed function has a **fourth** — a toggle affording no `click` answers `false` silently. §2 `R-5` now names four. **`U4-A-1`/`-A-2`/`-A-3` (notes, CARRIED):** `try/catch` cannot observe a **rejected promise** from an async opener (no live caller; the default opener is sync) · the **ordering** of `installSettingsModal()` before `installMenuOpener(bridge)` is a **correctness condition** (an unwired re-entrant click recursed `depth=4327` versus `1`) · the bridge's unsubscribe is passed through **unguarded** (a throwing one would propagate from a caller that discards it).
- **The adversarial table (18 hostile states, 0 live defects).** Getter-throwing bridge · double subscription · non-function answer · `document`-absent · frame-absent · toggle-absent · `click`-absent · throwing `getElementById` · throwing `click` · `is-open is-open` · `is-opened` · `my-is-open-thing` · double-space · `IS-OPEN` · two arrivals on an open frame · an impostor `#settings-modal` · both re-entrancy cases — all PASS except the three notes above. **The classifier is a whitespace token test: only the exact `is-open` token reads as open.**
- **The park, adjudicated:** a native OS menu item has **no** CDP/DOM surface and the preload member is a **subscriber only**; no instrument the contract failed to name was found. **`G8`'s park is the correct evidence class.**
- **What this unit does NOT prove, in one sentence:** it proves three disjoint slices — the template's shape and role census, the channel's lockstep, the handler's reachability from a signal to the affordance — and **nothing grades the hops that connect them**, so the row would stay green if `Menu.setApplicationMenu` were never called or the broadcast targeted a destroyed window. **Envelope-green, never app-green.**
