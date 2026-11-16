# L2 — `shell-chrome` / `menu-opener`: the integration design of the View menu's role-less opener

**Layer:** L2 · **Date:** `2026-11-16` · **Ceiling:** 150 lines · **Module:** `shell-chrome` (`READ` `strata/modules.json:16-33`: `N` = **26** unmoved under the map's filed rule, cap `50+10N` = 310; §7 carries the wider reading and leaves the choice to L0) · **Unit contract:** `docs/L1/unit-u-4-menu-opener.md` (authority — §1 the scope fence and the four rulings, §2 `R-1`…`R-6`, §3 limbs `A`…`G`, §4/§4.1 the gates and the PARK, §5.1 paths, §5.2 the four register rows — this layer MEASURES **six** edits in four files (§8.1, `U4-F1`) — §5.3 the document grant, §8 the census, §9 what is carried) under `strata/decisions.md` D-10/D-17/D-25.
**Markers:** `READ` = read in this pass, file and line named (pre-edit head). `RECORDED` = measured elsewhere, quoted with its measurer. `RUN` = a command with its runner.
**Layer declaration (mandatory, D-10/RCA-12):** **nothing here is app-green.** Every arm of this unit is **envelope/harness class** under the layout-less `src/shared/dom-shim.ts` (no grid, no CSS, no real menu, no paint). **The native menu bar has no DOM node and no CDP surface** (`scripts/live-drive.mjs` reaches the renderer through CDP's DOM + `provident.dispatch` only), so the opener's chain is **`G8`-PARKED with §4.1's recorded reason** — never parked by default (RCA-11), never claimed as green. **The six unread links of that chain, read as six hops: (i) the OS drawing the item in the menu bar · (ii) the OS dispatching its native click · (iii) `actions.openSettings` reaching `backend.broadcast` in a real main process · (iv) the `IPC_SETTINGS_OPEN` arrival in the real preload/renderer realm · (v) the frame's class flip in a real document · (vi) the operator's experience of pressing it.** None of the six is claimed by this layer or by any row it seals.

## 1. The module's paths, and which take part

| Path (`shell-chrome`) | Takes part? | Why |
|---|---|---|
| `src/main/app-menu.ts` | **yes** (`R-1`) | the pure, electron-free template builder. Gains `SETTINGS_OPENER_LABEL`, `AppMenuActions.openSettings()`, its no-op default, and ONE inserted View item (`READ` `:15-23`, `:94-98`, `:128-134`) |
| `src/shared/types.ts` | **yes** (`R-2`) | gains `IPC_SETTINGS_OPEN = 'provident:settings:open'` beside the U-MENU-1 block (`READ` `:846-867`); main→renderer, one-way, no payload member, manual-UI only |
| `src/main/main.ts` | **yes** (`R-3`) | the constant joins the existing `../shared/types.js` import (`READ` `:8`) and `rebuildApplicationMenu`'s actions gain `openSettings` (`READ` `:527-540`). **Nothing else moves**: no `ipcMain` handler, no window change, `IPC_PANE_VISIBILITY` (`READ` `:534`) untouched |
| `src/main/preload.ts` | **yes** (`R-4`) | `ProvidentBridge` (`READ` `:117-305`) gains the TOP-LEVEL `onSettingsOpen`, implemented beside `onPaneVisibility` (`READ` `:383-391`) |
| `src/renderer/renderer.ts` | **yes — the handler path ONLY** (`R-5`) | two exports (`MenuOpenerBridge`, `openSettingsOverlay`) + `installMenuOpener`, plus ONE call site after `installSettingsModal()` (`READ` `:1584`; `bridge` is `window.provident`, `READ` `:1285`). No other byte of the file |
| `src/renderer/modal-state.ts` | **no — owes ZERO byte, and that is the design** | the ONE modal state author (`READ` `:144-230`). The opener reaches it through the affordance it already wires (`READ` `:196-200`), so the flip stays `modal-state.ts`'s write |
| `src/renderer/index.html` | **no** | the `#settings-modal` / `#settings-toggle` chrome already exists; this unit authors no `index.html` byte and no envelope node (D-8's shell carve-out) |
| `src/shared/menu-template.ts` | **no — READ ONLY** | one of the pin's fifteen (D-9/D-11). Limb `G` MEASURES what it does with a role-less item; nothing references it from `src/main/**` (limb `C`) |
| `scripts/live-drive.mjs` | **no — owes ZERO byte** | the instrument cannot reach a native menu item (§4.1); `tests/live-drive-contract.test.ts` is untouched and `G3`'s `node --check` is a parse gate on an unmodified file |
| `tests/unit/shell-chrome/menu-opener.test.ts` | **yes — the RED row** | 1196 lines, seven limbs `A`…`G`, one `it` per limb, one `problems` aggregate each. **Authored and `RUN` by the L1 TestWriter; not edited by this chain** |
| `tests/pd-ui-1-theme-register.test.ts` · `tests/pd-vendor-set.test.ts` · `tests/pd-vendor-manifest.test.ts` · `tests/store-persist-adopt-register.test.ts` | **yes — collateral, §8** | six recorded-value re-records in four files (§8.1), each licensed by its own row's text |

## 2. The I/O surface

| # | Direction | Name | Shape | Write count |
|---|---|---|---|---|
| I1 | in | the operator's press | the native item's `click` → `actions.openSettings()` (`R-1`) — the ONE route, and it carries no OS `role` | — |
| I2 | in | the channel | `backend.broadcast(IPC_SETTINGS_OPEN, null)` (`R-3`) — payload is the literal `null`; **no receipt member is invented** | 1 broadcast per press |
| I3 | in | the subscription | `bridge.onSettingsOpen(handler): () => void` (`R-4`) — ONE `ipcRenderer.on`, listener ignores the payload and calls `handler()`, detaching the SAME listener | 1 subscribe, 1 detach |
| I4 | in | malformed input | absent `bridge`, absent/non-function member, a throwing subscribe, a throwing opener, an absent `document`, an absent element, a `click`-less toggle ⇒ **silent no-op, never a throw** (`ASM-U4-2`/`R-5` TOTAL) | 0 |
| O1 | out | the affordance fired | the toggle's OWN `click` (the real DOM's method) — **exactly 1** on the open arm, **0** when the frame already carries the token | **1 / 0** |
| O2 | out | **the frame's class** | — | **0 from this path.** The ONE flip (`settings-modal is-open`) is `modal-state.ts`'s mirror write (`f4b` is the attribution control) |
| O3 | out | the overlay's controller | — | **0** — no second controller, no held state, no export from `modal-state.ts` |
| O4 | out | the graph / the record | — | **0** `applyCommand`, 0 `loadEnvelope`, 0 `loadAppGraph`, 0 `rerenderAppGraph`, 0 `setLayout`, 0 `operatorSettings.set` |
| O5 | out | MCP | — | **0 tools.** The channel is manual-UI only; an agent must not drive the operator's overlay (`R-2`) |

- **The idempotence classifier is a TOKEN test, not a substring test:** the frame's class is whitespace-split and the token `is-open` matched exactly, so `settings-modal is-opened` is **NOT open** and the opener fires; `is-open is-open` and `settings-modal is-open` are open and the opener answers `false` firing nothing. Idempotent OPEN, never a toggle (`ASM-U4-3`).
- **No `classList` write anywhere in this path** (and none exists in `src/**` at this head): the opener reads a class and writes none — the same discipline `ASM-RR-1` sealed for the reveal.

## 3. The seams, and who may read them (D-7)

| Symbol | File | Signature (the whole of it) | A sibling may |
|---|---|---|---|
| `SETTINGS_OPENER_LABEL` | `app-menu.ts` (**new export**) | `const SETTINGS_OPENER_LABEL = 'Security & Settings…'` (U+2026, the spelling `'Import…'` already uses) | **read it**; never re-spell the item's name (`ASM-U4-5`) |
| `AppMenuActions.openSettings` | `app-menu.ts` | `openSettings(): void` — the action seam `main.ts` injects | **inject it**; never add a second action for this route |
| `IPC_SETTINGS_OPEN` | `types.ts` (**new export**) | `const IPC_SETTINGS_OPEN = 'provident:settings:open'` | **import it**; never carry the literal (`d4` reads exactly ONE definition under `src/**`) |
| `ProvidentBridge.onSettingsOpen` | `preload.ts` | `onSettingsOpen(handler: () => void): () => void` — TOP-LEVEL, beside `onPaneVisibility` | **call it**; never add a second subscription site |
| `MenuOpenerBridge` | `renderer.ts` (**new export**) | `{ onSettingsOpen?: (handler: () => void) => (() => void) \| void }` — structural, so the handler is drivable without the electron-bearing preload module | **type against it**; never import `preload.ts` to get the shape |
| `openSettingsOverlay` | `renderer.ts` (**new export**) | `(): boolean` — `true` when the affordance was fired, `false` on every refusal arm. **Never throws. Writes no class. Keeps no controller.** | **call it**; it is the app's own opener |
| `installMenuOpener` | `renderer.ts` (**new export**) | `(bridge: MenuOpenerBridge \| null \| undefined, opener: () => unknown = openSettingsOverlay) => () => void` — subscribes EXACTLY once, routes each arrival to `opener()`, answers the bridge's unsubscribe or a no-op | **call it once**; the boot chain owns the one call site |

- **The law, stated once:** the signal is a **one-way, payload-free, manual-UI** arrival whose whole renderer-side effect is *fire the affordance the shell already wired*. It is NOT a state write, NOT a re-assembly, and NOT a second author of the modal's state.
- **Why the class flip belongs to `modal-state.ts` and not to this path:** `modal-state.ts` holds the controller (the adopted `overlayTransition` word) and the XOR mirror; a class write from the menu path would be a SECOND author of one state — the defect class `D-8`/`ADV2` exist to prevent — and it would leave the controller's word disagreeing with the frame (a second Escape/scrim press then closing nothing, or the modal re-closing on the next toggle).

## 4. The invariants the integration must hold

1. **`INV-U4` — the opener is a role-less item whose ONE click route opens the overlay through the LANDED controller.** Machine-checkable halves: the item owns **no `role`** and its own enumerable key set is exactly `label`+`click`; the template's **role census is unmoved** (linux 1 / darwin 2 — §8.3); no `src/main/**` file references `menu-template` (the foundation's menulib stays unreferenced); the channel literal is **defined once** and the NAME is what both consumers reference; and the opener path **writes no class** — the flip is `modal-state.ts`'s.
2. **ONE spelling per name.** `SETTINGS_OPENER_LABEL` and `IPC_SETTINGS_OPEN` are each the only spelling of their name; a literal in the builder or a second channel literal is a review finding (`d4`, `ASM-U4-5`).
3. **ONE subscription, ONE route.** `installMenuOpener` calls `bridge.onSettingsOpen` exactly once and each arrival fires `opener()` exactly once; the returned unsubscribe detaches the SAME listener (`f1`, `f2`).
4. **The opener is TOTAL.** No input shape and no hostile bridge/opener/DOM propagates a throw; every answer is a callable unsubscribe (`f3`) and `openSettingsOverlay` always answers a boolean.
5. **Idempotent-OPEN.** An already-open frame is left open: `false`, zero clicks, zero writes (`f5`).
6. **No second controller and no record write.** The overlay's state keeps ONE author; the opener dispatches no graph op and writes no record member (`O2`…`O4`).
7. **The fork's enumeration is the fork's.** The File labels (`Import…` / `Import folder…` win+linux / `Quit`) and the `Panes` item (disabled + empty submenu on an empty catalog, `F2`) are byte-unchanged; the opener is INSERTED as View item 0 (`a4`, `a4(i)`).

## 5. Failure and boundary states

| State | Required behaviour |
|---|---|
| no `document` (a pre-boot host, the node realm) | `false`; nothing written, nothing fired; never a throw |
| `#settings-modal` or `#settings-toggle` absent | `false`; nothing written, nothing fired |
| the frame already carries the `is-open` token (`is-open is-open`, `settings-modal is-open`) | `false`; the toggle is NOT clicked (a toggle would have CLOSED it) |
| the frame carries `is-opened` (a substring, not the token) | **the opener fires** — the classifier is a whitespace-split token test |
| the toggle is present but carries no `click` (the shim's own state) | `false`; silent no-op |
| the toggle's `click` throws | caught; `false` |
| a bridge whose `onSettingsOpen` is absent / not a function | no subscription; a callable no-op unsubscribe |
| a bridge whose `onSettingsOpen` throws | caught; a callable no-op unsubscribe |
| a bridge whose `onSettingsOpen` answers no unsubscribe | the no-op unsubscribe (never `undefined`) |
| an opener that throws on every arrival | caught per arrival; the seam keeps running |
| two arrivals in a row | the first opens (`true`, one click); the second refuses (`false`, zero clicks) — the overlay stays open |
| the frame is not the shell's own `#settings-modal` | absent element ⇒ `false`; the id is the contract, not a class probe |

## 6. The evidence class of each arm

| Arm | Where | Class |
|---|---|---|
| `A` the template shape (`a1`…`a5`, `a4(i)`) · `B` the role census (`b1`…`b3`) · `D` the channel lockstep (`d1`…`d4`) · `E` the preload subscription's shape (`e1`…`e3`, a SOURCE read — `preload.ts` imports `electron`) · `F` the handler's reachability and idempotence (`f1`…`f5`) · `C`/`G` the enumeration and the menulib's role-less projection (with their driven controls) | `tests/unit/shell-chrome/menu-opener.test.ts` | **node/envelope-class** under the layout-less shim. `RECORDED` at the pre-edit head: **`1 failed` / `Tests 5 failed \| 2 passed (7)`** (the L1 TestWriter's own run); `RUN` at the landed head: §8.2 |
| the trio · `drift` · `node --check scripts/live-drive.mjs` | this repo's runners | **envelope/harness** (D-10) and `[D]` byte/revision oracle |
| **the six unread links (§4.1)** | — | **`G8`-PARKED, no instrument of any class.** `node scripts/live-drive.mjs` cannot press an OS menu item; a `window.__openSettings` hook was NAMED and REFUSED (an MCP-invisible surface invented for the harness) |
| the register re-records (§8.1) | the four register files | **`[D]` byte oracle** — digests and counts read from the working tree |

## 7. The endpoint count

- **Under the map's filed rule** (`strata/modules.json:32`: `N` = 26; the six named bridge methods + 6 MCP tools + 14 vendored exports): `onSettingsOpen` is **not** one of the six ⇒ **`N` stays 26, cap 310, `strata/modules.json` untouched.**
- **Under the wider reading** (every bridge member the module's harness drives — limb `F` drives `onSettingsOpen`): `N` = **27**, cap 320. `strata/` is outside every unit's write scope this pass, so if L0 takes the wider reading the amendment is L0's. Both numbers are stated so the choice is visible rather than resolved by silence.

## 8. What this layer seals, and the collateral it obliges

### `8.1` THE REGISTER RE-RECORDS — SIX EDITS IN FOUR FILES (the delegation named four rows in three files; the other two are MEASURED, not chosen)

| # | File · row | Edit | Why |
|---|---|---|---|
| 1 | `pd-ui-1-theme-register.test.ts` `:137` — `types.ts` digest | new MEASURED md5, old value as `superseded:`, `restated: 'U-4'`, dated note naming `R-2` | the ⟨A-1⟩ limb reads the WORKING TREE; an un-restated move is a suite RED |
| 2 | `pd-ui-1-theme-register.test.ts` `:245` — `preload.ts` digest | new MEASURED md5, old value as `superseded:`, dated note naming `R-4`; **`restated:` STAYS `'U-STORE-SECURITY-ADOPT'`** and the SSW-era literal stays visible | `R-4` moves the bytes. The `restated:` field is pinned by TWO landed oracles (`tests/store-security-write-register.test.ts` `P-SSW-H-3` `:1216`, `tests/pd-store-security-write.test.ts` arm 3(a) `:1009`) — **the `U-1b` precedent on this same row, taken for the same reason: name the unit and the whole chain in the note, re-measure the digest, leave the pinned field alone.** Table stays SEVEN rows; `UNRESTATED_CONTROL_PATH` still derives to `src/shared/demo-envelope.ts` |
| 3 | `pd-vendor-set.test.ts` `:993` — `BASELINE_CURRENT_BYTES_RE_STATEMENTS.types.restatedMd5` | new MEASURED md5 (`supersededPreVendoringMd5` unchanged: the pre-vendoring blob did not move) | `R-2` moves `types.ts`; the row asserts `md5(now) === restatedMd5` |
| 4 | `pd-vendor-set.test.ts` `:1136-1138` — `P-SM-2`'s `restatedLineCounts.types.restatedCurrent` | new MEASURED count (`split('\n').length`, twice, after every `src/` write); `supersededPreVendoring: 875` stays visible | the row's own text: *"an UNRECORDED move of this file still fails"* |
| 5 | `pd-vendor-manifest.test.ts` `:990-995` — `RESTATED_BASELINE_BYTES['src/shared/types.ts'].restatedCurrentMd5` | new MEASURED md5, superseded value stays visible | the same move, a second `[D]` oracle over the same file |
| 6 | `store-persist-adopt-register.test.ts` `:525-543` + `:1576-1579` | `DECLARED_BRIDGE_TOP_LEVEL` gains `onSettingsOpen` (17 → 18) and the "EXACTLY ONE new key, `store`" clause gets a DATED amendment admitting the second `U-4` member | `R-4` adds one top-level member. **The alternative — burying it under `operatorSettings` — was REFUSED: a false parent on a menu signal in the bridge census** |

- **Nothing else in those four files moves**, and **no assertion is relaxed**: an unre-stated move still FAILS. **Ruling taken on row 2 (and reported, not hidden):** setting `restated: 'U-4'` there would redden two LANDED oracles outside this unit's grant, which is the "any fifth red is this unit's" failure — so the note carries `U-4`, the field keeps its pinned value, exactly as `U-1b` did.
- **THE VALUES AS LANDED (`[D]`, measured twice at the landed head, identical):** `src/shared/types.ts` md5 `8cdc2b81eef0b3fb0cd7a96f95881009` (was `ff8c0b9a7cfb2f37cc94c6b018c1f756`) · `src/main/preload.ts` md5 `78b237e4d53af16a846ec540c4b5be7c` (was `eb230a8bcbe9b5444f95aa6a89c7fec2`) · `types.ts` line count `split('\n').length` = **901** (was `889`) · `ProvidentBridge` top-level members **18** (was 17) · table still SEVEN rows, `UNRESTATED_CONTROL_PATH` still deriving to `src/shared/demo-envelope.ts`, the amended delta clause still reddening on an undeclared added key and on a dropped declared one.

### `8.2` The row's own reading, and the gates, with their layer

`RUN` from the repo root at the landed head, every reading with its exit code and its layer, `RECORDED` here as the run that supports this page's verdict (the examiner's own re-run; the L4 seat's run preceded it and agreed):
- **the unit row** `npx vitest run tests/unit/shell-chrome/menu-opener.test.ts` — `Test Files 1 passed (1)` · **`Tests 7 passed (7)`** · `exit 0` (**envelope/harness**). The red set was NOT edited to get there: 1196 lines, seven limbs, seven aggregates, no `skip`/`todo`/`only`, no `vi.mock`.
- **`npm test`** — `Test Files 2 failed | 153 passed (155)` · `Tests 4 failed | 3312 passed | 22 skipped (3338)` · `exit 1`, and all four reds are the **STANDING class** `Error: ollama embed: HTTP 404` (`tests/embeddings-ollama-integration.test.ts` ×3 + `tests/embeddings-batch.test.ts` ×1). **Zero unit reds** (**envelope/harness**).
- **`npm run typecheck`** — no output but npm's notices, `exit 0`, 0 diagnostics · **`npm run build`** — `exit 0`, the five artefacts (`main.cjs 2.3mb` · `preload.cjs 20.9kb` · `standalone.mjs 1.3mb` · `battery-host.mjs 1.7mb` · `renderer.js 1.1mb`) + the html copy (**envelope/harness**).
- **`npm run drift`** — `DRIFT RESULT: 15 checks, 0 differences — CLEAN`, `exit 0`, and the **PIN ARM EQUAL**: *"the tree's own `git -C <foundation> rev-parse HEAD` was read and EQUALS the manifest's `foundation.commit` — this is the pinned state, not merely a byte-equal tree"* (**`[D]`**).
- **`node --check scripts/live-drive.mjs`** — `exit 0` (the driver owed NO byte) · `pgrep -c -x electron` = **0**.
**No one of these is app-green; the six links above stay unread.**

### `8.3` The census readings this layer requires AFTER the change (contract §8)

**MEASURED at the landed head (static reads over the template builder + `preload.ts`'s interface block; `[D]`/source class, never app):** the template's role census reads **1 (linux) / 2 (darwin)** — UNCHANGED, values `['quit']` / `['appMenu','quit']` (`app-menu.ts:130,142`); the View submenu reads **2 items**, item 0 the opener owning **no `role`** and exactly `['label','click']`, item 1 the `Panes` item still `enabled: false` with an empty submenu on an empty catalog; the app-menu census stays 2 (linux) / 3 (darwin); `ProvidentBridge` top-level members read **17 → 18** (`onSettingsOpen` is the 8th, beside `onPaneVisibility`).

## 9. Findings routed up — recorded, not fixed

- **`U4-F1` (scope, escalated): the delegation's register list was SHORT.** It named four rows in three files; the landing obliges **six edits in four files** (§8.1 rows 3 and 5 are `[D]` oracles over the same `types.ts` digest and redden on `R-2` alone). They are MINIMAL (one value each) and are named to L0 as a ratification owed with the other four.
- **`U4-F2` (pinned field, resolved by precedent):** §8.1 row 2 must NOT re-name `restated:`; the licence is the row's own text plus `U-1b`'s identical act on the identical row. If L0 prefers `restated: 'U-4'`, the two SSW oracles must move in the SAME grant — that is an L0 act, not this layer's.
- **`U4-F3` (owed document, outside every write scope this unit holds):** §5.3's grant — ONE dated clause in `docs/specs/unit-u-menu-1-application-menus.md` §2.1/§2.3 and ONE in §5 (census 2 → 3 channel consts, 1 → 2 preload methods). This seat's write scope is `docs/L2/<module>/` only, so it is REPORTED as owed, never silently skipped.
- **`U4-F4` (owed tracker):** `docs/FORK-DIVERGENCE.md`'s `SC-7` row cites `src/main/app-menu.ts:93-135`; `R-1` moves that range's end by one inserted item. Reported as an owed tracker act (outside this unit's grant).
- **`U4-F5` (no row defect found):** the seven limbs were re-read against this design and none is unfair. `a4(i)` REDS by construction and SAYS SO in its own text (the red run already corrected `a4`'s marker via `RCA-8(c)`); `d4` reads the satisfiable form of "one spelling" and its header declares the divergence. **Nothing is patched in the red set.**
- **`U4-F6` (one byte-level deviation at the call site, for adjudication):** `R-5` pins the one line as `installMenuOpener(bridge)`; as landed it reads `installMenuOpener(bridge as MenuOpenerBridge | undefined)` (`renderer.ts:1673`), four comment lines after `installSettingsModal()` (`:1668`). **The cast is forced and its reason is a type fact, not a design change:** `window.provident`'s GLOBAL type (`src/renderer/secure-panels.ts:32-…`) carries no `onSettingsOpen`, and `MenuOpenerBridge` is a WEAK (all-optional) type, so the bare call is the TS2559 "no properties in common" arm; the alternative was to add the member to that hand-kept global declaration — a TENTH file outside §5.1's path list — which was REFUSED for that reason. `npm run typecheck` reads `exit 0`. Statement immediacy is kept (the modal wiring still runs first). **The attribution design held as measured:** `src/renderer/modal-state.ts` is **byte-unchanged** (`cf3c8d5e…`, identical to HEAD's blob) and `renderer.ts` carries **0 `classList` and 0 `className` writes**.

## 10. Assumptions (`{id, text, alternative}` — the rejected alternative is mandatory)

`ASM-U4-1`…`ASM-U4-5` are the contract's, carried whole (`L1` §6). This layer adds two:

- **`ASM-U4-6`** — the menu path fires the toggle's OWN `click` and lets `modal-state.ts` decide, so the opener's answer (`true`/`false`) reports *the affordance was fired*, never *the overlay is open*. **Rejected:** reading `controller.isOpen()` or exporting the controller — a second holder of one state, and `modal-state.ts` is outside this unit's path list.
- **`ASM-U4-7`** — the token classifier is `className.split(/\s+/).includes('is-open')`, re-derived at every press, with no cached flag. **Rejected:** a cached "already opened" boolean in this path — it would go stale the moment Escape, the scrim or the toggle closed the overlay, and a stale-open frame would swallow the operator's second press.

**Verdict:** L3 receives the sealed surface — `R-1`'s item and label, `R-2`'s channel, `R-3`'s broadcast, `R-4`'s top-level member, `R-5`'s three exports and one call site, `R-6`'s invariant. **The surface is sealed; the app is not, and the six links above stay `G8`-PARKED with their reason recorded.**
