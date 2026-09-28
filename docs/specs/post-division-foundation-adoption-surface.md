# POST-DIVISION FOUNDATION ADOPTION SURFACE — what the expanded `Provident-Electron` now offers a consuming fork, and exactly what adopting each element costs in deletions, adapters and seams

**Date:** 2026-09-28 · **Pass kind:** READ-ONLY INVENTORY (**exactly one** write: this file) · **Layer
declaration (mandatory):** **DOC-LAYER / inventory record — NOT app-green, NOT envelope-green, NOT
live-green, NOT a specification and NOT a decision.** Every claim below is either a **code read** of
`Provident-Electron/src/**`, a **doc read** of `Provident-Electron/docs/**`, or a **grep reading** over
those trees; no suite, no build, no leg and no app was run by this pass (it had no shell for the app and
ran none). Every runtime-behaviour sentence is therefore **read-from-source**, and every verification
claim carries the **layer the foundation itself files it at** (`[T]` node/pure · `[H]` host · `[U]`
rendered/live · `[D]` divergence · `[B]` battery · `[P]` probe), never upgraded by this pass.

**What this pass read (both trees).** Foundation: `docs/guide/*` (all 16 pages), `docs/specs/*` (the unit
specs, the two adoption dossiers, `rca-cross-project-handoff-semantics.md`, the `*-greens.md` /
`*-live-battery.md` / `*-live-status.md` artifacts, `provident-electron-shell-chrome-handoff-review.md`),
`docs/FORKER.md`, `docs/next-steps.md`, `docs/pending.md`, `src/**` (every `src/shared/` module named
below, `src/main/mcp-server.ts`, `src/main/security.ts`, `src/renderer/renderer.ts`, `src/shared/types.ts`).
Fork: `docs/FORK-DIVERGENCE.md`, `docs/feature-requests/provident-electron-shell-chrome-requests.md`,
`docs/feature-requests/provident-electron-shell-chrome-handoff.md`, `docs/specs/unit-u-shell-9a-main-focus-tabs.md`,
`src/**` file inventory and the named local modules, `src/main/mcp-server.ts` (`ALL_TOOLS`).

**Citation discipline.** `path` + **symbol** / **row id** / **§section** only. **No line numbers appear
in this file.** A guide claim verified against `src/**` is marked **VERIFIED**; anything not read is
**UNVERIFIED** with what would settle it. Where the guide, a foundation spec and the code disagree, the
disagreement is reported in §7 with **both** citations and neither is silently picked.

**The two source authorities this inventory exists for.** The product-owner instruction (quoted in
`docs/specs/rebuild-drift-map-2026-09-21.md` §0's authority block lineage and in
`docs/feature-requests/provident-electron-shell-chrome-handoff.md`'s filing convention) is: *"Start a
post-division rebuild git branch … use the expanded version of the base Provident-Electron project …
to replace the local implementations of the added elements documented in the guides … All local code
implementing the relocated UI or delegated engine functions, and the tests that apply to those features,
will be eliminated in this branch."* This file is the **foundation-side** answer to *"what exactly is
there to adopt, and what does each adoption delete?"* The fork-side inventory of what exists to delete
is `docs/FORK-DIVERGENCE.md` §2 (rows 1–7) and `docs/feature-requests/provident-electron-shell-chrome-handoff.md`
§2 (38 shell-chrome instances across 8 groups).

---

## §0 The element set, and how each verdict below is reached

**23 inventoried rows** = **14 guide-documented elements** (11 ledger units with a page + 2 surfaces +
the base surface) + **9 ledger units with no guide page** (`docs/guide/README.md`, the section *"Units
that have no page here"*). `docs/guide/seams.md` and `docs/guide/TEMPLATE.md` are **cross-cutting
readings**, not mechanisms, and are carried in §3/§4 rather than as elements.

**The three delete-vs-keep verdicts used throughout** (§1's `verdict` column, §2's cards, §9's ledger):

| Verdict | Meaning | What it obliges |
| --- | --- | --- |
| **DELETE-WHOLESALE** | the fork's local implementation of the mechanism is superseded and is removed with its tests; nothing of it survives as a seam | the owning unit's cycle (red → green → adversarial → greens) re-derives the replacement's rows |
| **SUBSET+ADAPTER** | the fork deletes the *mechanism* half and **keeps a seam supplier** — a host adapter that reads the environment, holds the app vocabulary, and performs the one write/commit the foundation returns as data | a named adapter module/function list per element, plus the unit's tests narrowed to the adapter |
| **CONFIG-ONLY** | the fork deletes **nothing**; the element is demo data, a harness/config surface, or a measurement leg | trackers/specs/`package.json`/CI-script edits only |

**No element in this inventory is `DELETE-WHOLESALE` at unit granularity.** Every landed foundation
mechanism deliberately omits at least one half the fork owns (the pattern is stated by the foundation
itself: `docs/decisions.md` ACTIVE row `GUTTER-CALLER-SEAMS-ARE-THE-FAMILY'S-DOWNSTREAM-CONTRACT`
consequence (3), and per unit below). **An adoption that deletes a fork mechanism without landing its
adapter is a behaviour regression, not a refactor.**

---

## §1 Element index (14 guide-documented elements)

| # | Unit / surface | Guide page | Foundation spec | Foundation source (verified) | Verdict | Fork-side dossier? |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | **`U-THEME`** (`E8`) | `docs/guide/theme.md` | `docs/specs/theme.md` | `src/shared/theme.ts` → `resolveTheme`, `applyThemeDeclaration`; types `ThemeResolution`, `ThemeAttributeWrite`, `ThemeEnv` | SUBSET+ADAPTER | **REQUIRED** |
| 2 | **`U-THEME-CONTROL`** (`F1`) | `docs/guide/theme-control.md` | `docs/specs/theme-control.md` | `src/shared/demo-envelope.ts` → `demoEnvelope()` (the `theme-card`/`theme-dark`/`theme-light`/`theme-setting` authored nodes); `src/renderer/renderer.ts` → `themeWiringRole` | CONFIG-ONLY | no |
| 3 | **`U-OVERLAY`** (`E9`) | `docs/guide/overlay.md` | `docs/specs/overlay.md` | `src/shared/overlay.ts` → `overlayTransition`, `overlayInertDeclaration`; types `OverlayState`, `OverlayTransition`, `OverlayInertWrite` | SUBSET+ADAPTER | **REQUIRED** |
| 4 | **`U-MENULIB`** (`E7`) | `docs/guide/menulib.md` | `docs/specs/menulib.md` | `src/shared/menu-template.ts` → `normalizeCatalog`, `buildMenuTemplate`, `selectCatalogItem`; types `PickerFn`, `CatalogEntry`, `PlatformProjection`, `ProjectedItem`, `MenuTemplate`, `TemplateOptions` | SUBSET+ADAPTER | **REQUIRED** |
| 5 | **`U-CONTAINER`** (`E5`) | `docs/guide/container.md` | `docs/specs/container.md` | `src/shared/container.ts` → `tokensFor`, `orientationFor`, `containerDeclarationFor`; types `ChromeTokenFn`, `AxisResolver`, `ContainerDeclaration` | CONFIG-ONLY | **PLAIN** |
| 6 | **`U-RELOCATE`** (`E4`) | `docs/guide/relocate.md` | `docs/specs/relocate.md` | `src/shared/relocate.ts` → `createRelocateSession`, `withinProximity`; 8 exported types (`CandidateFor`, `RelocateTargetFor`, `CommitSink`, `PreviewSink`, `RelocateHandle`, `RelocateOptions`, `RelocateSession`, `RelocateStats`) | SUBSET+ADAPTER | **REQUIRED** |
| 7 | **`U-GUTTER`** (`E3`) | `docs/guide/gutter.md` | `docs/specs/gutter.md` | `src/shared/gutter.ts` → `createResizeController`, `clampToBounds`; 10 exported types (`AxisFor`, `BoundsFor`, `ClampBounds`, `CommitSink`, `DefaultSizeFor`, `IsResizable`, `ResizeController`, `ResizeControllerHandle`, `ResizeControllerOptions`, `ResizeStats`) | SUBSET+ADAPTER | **REQUIRED** |
| 8 | **`U-GUTTER-UI`** (`E10`) | `docs/guide/gutter-ui.md` | `docs/specs/gutter-ui.md` | `src/shared/gutter-affordance.ts` → `createGutterAffordance`, `cursorDeclarationFor`, `domEventSource`; 17 exported types; `src/shared/demo-envelope.ts` → `gutterSeamExample`, `GUTTER_AFFORDANCE_ID`, `GUTTER_TARGET_ID`, `GUTTER_STATUS_ID`; `src/renderer/renderer.ts` → `startGutterAffordance`, `GutterWriteReading` | SUBSET+ADAPTER | **REQUIRED** |
| 9 | **`U-ZONES`** (`E1`) | `docs/guide/zones.md` | `docs/specs/zones.md` | `src/shared/zones.ts` → `isEmpty`, `trackFor`, type `TrackSpec` | SUBSET+ADAPTER | **REQUIRED** |
| 10 | **`U-FOCUS-MODEL`** (`F2`) | `docs/guide/focus-model.md` | `docs/specs/focus-model.md` + `docs/specs/focus-model-adoption-dossier.md` | `src/shared/focus-model.ts` → `focusTransition`, `focusOrder`, `focusIndex`, `persist`; types `FocusId`, `FocusEntry`, `FocusVerb`, `FocusRefusalCode`, `FocusState` | SUBSET+ADAPTER | **REQUIRED — the foundation already ships the dossier** |
| 11 | **`U-FOCUS-TOOL`** (`F3`, the 22nd tool) | `docs/guide/focus-tool.md` | `docs/specs/focus-tool.md` + `docs/specs/focus-tool-adoption-dossier.md` | `src/main/mcp-server.ts` → `ProvidentMcpServer.ALL_TOOLS` carries `provident.focus`; `src/main/security.ts` → the module-private `TOOL_GROUPS` row `'provident.focus': 'dispatch'`; `src/shared/types.ts` → `RpcMethod` member `'focus'`; `src/renderer/renderer.ts` → `handleRequest`'s `case 'focus'` | SUBSET+ADAPTER · **name-collision decision required (§6, R-1)** | **REQUIRED — the foundation already ships the dossier** |
| 12 | **MCP parity surface** (`C1` `U-REALDOM-BOOT` · `C2` `U-DIVERGENCE-EXT`) | `docs/guide/mcp-parity.md` | `docs/specs/mcp-endpoint.md`, `docs/specs/adapter-parity-battery.md`, `docs/specs/ci-divergence-leg.md`, `docs/specs/ci-ui-leg.md`, `docs/specs/engine-pin.md` §5.5 | `src/main/mcp-server.ts` → `ProvidentMcpServer`, `RendererBackend`, `McpBackend`; `scripts/electron-divergence.mjs` → `extractAttributeNames`, `attributeSetDifference`, `ATTRIBUTE_NAME_FOLD`, `scenarioEnvelope`; `scripts/electron-ui.mjs`, `scripts/electron-spawn.mjs` | CONFIG-ONLY | **PLAIN** |
| 13 | **The base surface** (shell chrome + endpoint) | `docs/guide/00-base-surface.md` | `docs/specs/mcp-endpoint.md` §2–§8 | `src/main/mcp-server.ts`, `src/main/security.ts`, `src/main/preload.ts`, `src/main/main.ts`, `src/renderer/runtime.ts` → `Runtime`, `src/renderer/renderer.ts` → `handleRequest`, `src/shared/types.ts` | CONFIG-ONLY (the fork **keeps** it) | **PLAIN** |
| 14 | **The seam family** | `docs/guide/seams.md` | per-unit §2.1/§2.4 blocks (cited in §3) | the containers of §1 rows 1/5/6/7/10 | **input, not an element** | per unit |

**Verified/unverified split (the honesty headline).** **Every module, export name and type name in the
table above was read from the foundation's own bytes this pass and is VERIFIED to exist.** The split is
therefore not "does the file exist" but **"is the exported shape what the fork needs"**:

- **VERIFIED (existence + export census + seam/degradation text):** rows 1–11, plus the endpoint/tool
  census of rows 12–13. **14/14 rows have their surface verified present.**
- **UNVERIFIED in this pass (6 named items, each with what would settle it — full list in §10):**
  (a) that a static `../src/shared/<x>.js` **value** import from a new `tests/` file resolves in the fork
  (the foundation's own guide marks this `unverified`; the unit suites use a dynamic import,
  `docs/guide/seams.md` *Gotchas*); (b) the **fork-side** runtime behaviour of every seam (no fork harness
  read); (c) `docs/specs/zones.md` §2.3 item 2's array/`Set`-with-callable-`get` reconciliation
  (`src/shared/zones.ts` checks the callable-`get` duck-type branch before the array/`Set` exclusion, and
  no row of `tests/zones.test.ts` drives that shape — the guide reports the same gap); (d) the
  **assembled-app** behaviour of every unit except `U-THEME-CONTROL` and `U-GUTTER-UI` (see §8); (e)
  whether `docs/specs/mcp-endpoint.md` §6.2/§3.8 were later amended (row 11, §7 `G-3`); (f) the fork's
  own current engine pin state (not read in this pass).

---

## §2 Per-element adoption cards

Each card states the **declared adoption contract** (what the fork supplies / what the foundation
supplies / the declared degradation when a seam is absent, non-callable or throwing — cited to
`docs/guide/seams.md`'s row **and** the unit spec's §section), the **delete-vs-keep** specifics, and the
**verification state with its layer**.

### 2.1 `U-THEME` (`E8`) — the pure appearance resolver + declaration-only applier

| Field | Reading |
| --- | --- |
| Fork supplies | the `setting` token and its whole vocabulary; the `env` record's single `prefersDark` member (a claim about the fork's own OS reading); the **attribute name** and its meaning; the token block, the stylesheet and every persisted preference; **the write itself** (`docs/guide/theme.md` *What a fork must supply*; `docs/specs/theme.md` §2.2 (D), §1 item 6, §2.4 item 3) |
| Foundation supplies | `resolveTheme(setting, env) → {setting, prefersDark, source}` and `applyThemeDeclaration(attributeName, resolved) → {name, value, removal}` — **data only, never a write** |
| Seams | **the unit declares an EMPTY seam set** — `docs/guide/seams.md`'s last row and `docs/specs/theme.md` §2.1 item 3/§2.3 item 2: the environment reading is an ordinary **argument record**, so there is no absence/non-callable/throwing arm for the unit (`docs/specs/theme.md` §2.4 item 3). Verified: `src/shared/theme.ts` has **zero import statements** |
| Degradation (read from bytes) | a missing member, a number `1`, a string, an **inherited** `prefersDark`, a `Proxy` exposing no own member, or an omitted `env` ⇒ `{prefersDark: false, source: 'degraded-env'}` and nothing throws; `false` is a normal reading (`source: 'env'`); `''`/non-string `setting` ⇒ `null`; a non-string/empty `attributeName` ⇒ `name: null`; an absent token on the applier ⇒ `removal: true` (`src/shared/theme.ts`'s own-member descriptor read; `docs/specs/theme.md` §2.3 items 2/3, §2.4 items 1/2) |
| Dossier | **REQUIRED** (see §4). The adopted identifiers are `setting`, `prefersDark`, `source`, `ThemeResolution`, `ThemeAttributeWrite`, `ThemeEnv` — and `resolveTheme` **collides by name with a fork function of different semantics** (§9) |
| Delete vs keep | **SUBSET+ADAPTER.** Delete: the fork's precedence resolver `src/renderer/theme.ts` → `resolveTheme` (the fork's rule is *explicit setting wins, else the OS*, `ResolvedTheme = 'light' \| 'dark'`), because the foundation's resolver declares **no precedence rule at all** (`docs/specs/theme.md` §2.3 item 3, `P-TH-10`). Keep, as the adapter: the fork's `matchMedia('(prefers-color-scheme: dark)')` read and the `document.documentElement.dataset.theme` write — the foundation returns the write as data (`ThemeAttributeWrite`) and the fork's `applyThemeToRoot` is the site that performs it. Keep unchanged: the fork's token block in `src/renderer/index.html` (`:root`/`[data-theme='light']`/`[data-theme='dark']` + the `@media` fallback, `docs/FORK-DIVERGENCE.md` §2 row 4) and the persisted `theme` field (fork decision `UI-CONFIG-CARRIER`) — persistence stays consumer-side by contract (`docs/specs/theme.md` §1 item 6) |
| Verification + layer | `docs/specs/theme-greens.md` — **blind run, 32 scenarios: 32 PASS / 0 FAIL / 7 `NOT-BLIND-RUNNABLE`**, all node-suite over two pure functions. **Layer: `[T]` ONLY.** The greened claims do **not** include an applied attribute, a reacting stylesheet, a rendered control, or an OS preference (`docs/guide/theme.md` *What it is*; `docs/specs/theme.md` §5.2, §7 item 2) |

### 2.2 `U-THEME-CONTROL` (`F1`) — the authored appearance control (demo data)

| Field | Reading |
| --- | --- |
| Fork supplies | the fork's **whole authored surface** in its own envelope (its card node, its closed token block, its handler name/event, its state node) plus one bounded wiring role whose only permitted jobs are resolving an authored element from the producing graph and holding a caller-supplied attribute-name string (`docs/specs/theme-control.md` §2.5 item 1, §2.4 item 2) |
| Foundation supplies | authored **data** in its own demo envelope plus one deliberately inert role: `demoEnvelope()`'s four card nodes + one state node, the two `theme-set` handler bodies, and `themeWiringRole(runtime) → [attributeName, stateNodeId]` |
| Seams | **none** — established by three readings in the guide (zero import statements in the authored envelope; the role consumes no caller callable; no `src/**` file calls the role). Verified: `src/shared/demo-envelope.ts` carries only `GUTTER_*` consts, `gutterSeamExample` and `demoEnvelope` as exports, and `themeWiringRole` is exported by `src/renderer/renderer.ts` |
| Dossier | no — the fork re-authors, it adopts no external identifier |
| Delete vs keep | **CONFIG-ONLY.** Nothing to delete: the foundation's control lives in **its own** envelope, and the fork's appearance card is fork-authored. The fork re-derives the same shape (ids, closed token block, `theme-set` handler name, a state node carrying **both** `css.id` and `props.id`) and keeps its own `themeWiringRole`-equivalent |
| Verification + layer | `docs/specs/theme-control-greens.md` (blind run: **23 executed = 23 PASS / 0 FAIL / 4 `NOT-BLIND-RUNNABLE`**, `[T]`+`[H]`) **and `docs/specs/theme-control-live-battery.md`** (gate-6 battery **RUN** at source revision `c65c475`, `[U]`/app-layer: `npm run start:http` boot, `node-state theme-setting` pre/post, `dispatch theme-light click '["light"]'`, `targets`; findings `FINDING-1`/`FINDING-2` recorded). **The visible effect is the state node's rendered text only** — no instrument reads an applied declaration back (structural `NOT-OBSERVABLE` row `U-6`, `docs/specs/theme-control.md` §5.U) |

### 2.3 `U-OVERLAY` (`E9`) — the pure overlay state machine + inert-background declaration

| Field | Reading |
| --- | --- |
| Fork supplies | the state word and the verb word; the `Escape`-equivalent as **an argument callback**; the attribute name; the background identity; the rendered overlay, the scrim, the applied attribute write, the node's placement (`docs/guide/overlay.md` *What a fork must supply*) |
| Foundation supplies | `overlayTransition(state, verb, callback?) → {state, changed}` and `overlayInertDeclaration(target, attributeName, inert) → {name, value, removal, target}` |
| Seams | `docs/guide/overlay.md`'s one-row table: `callback` is **OPTIONAL and explicitly NOT a seam** (`docs/specs/overlay.md` §2.1 item 4/7) — absent or `undefined` ⇒ the declared state/`changed` pair is returned, nothing throws (`F-3`); non-callable ⇒ the same pair (`F-3`, `S-OV-3`); throwing ⇒ **one attempted invocation, the throw absorbed**, the same record returned, never retried (`docs/specs/overlay.md` §2.3 item 1 row (4), §3.2 `F-3`) |
| Degradation (read from bytes) | an unusable `state` never consults the verb and answers `{state: 'closed', changed: false}`; `'held'` survives `'toggle'`/`'open'`; only the strict boolean `true` sets the inert write (`'true'`/`1` are the removal case); a whitespace-only name IS echoed, an object name reads `null` (`src/shared/overlay.ts`; `docs/specs/overlay.md` §2.3 item 2, §2.4 items 1/2) |
| Dossier | **REQUIRED.** Adopted identifiers: the four-member state vocabulary (`'closed' \| 'open' \| 'held' \| 'closing'`), the verb set, `changed`, `removal`, `target`, and the **`inert` attribute name that the module deliberately does not own**. The fork's modal state machine uses its own words and its own scrim/`inert` decisions — a collision report is the deliverable |
| Delete vs keep | **SUBSET+ADAPTER.** Delete: the fork's decision half (`src/renderer/modal-state.ts` → `createModalController`'s state/verb discipline, superseded by `overlayTransition`). Keep: the frame + **dedicated scrim** markup and CSS, `installSettingsModal`, the Escape/focus-restore host work, and the applied inert write — those are caller-side data obligations (`docs/specs/overlay.md` §2.2, §2.5 item 2). **The re-parent half is REFUSED by the foundation with its reason stated** (`docs/specs/overlay.md` §1 item 3, §2.5 item 6; residual re-filed), so the fork's `MODAL-SETTINGS-REPARENT` decision and the focus-trap/`inert` gaps stay **fork-owned** |
| Verification + layer | `docs/specs/overlay-greens.md` — blind run: **26 scenarios = 21 executed (21 PASS / 0 FAIL) + 5 `NOT-BLIND-RUNNABLE`**. **Layer: `[T]` ONLY**; no row claims an attribute exists on an element, that a background is inert or that an overlay appeared (`docs/specs/overlay.md` §5.2, §7 items 2/4) |

### 2.4 `U-MENULIB` (`E7`) — the consumer-agnostic menu-template builder

| Field | Reading |
| --- | --- |
| Fork supplies | the catalog and every member value; the `platform` value (REQUIRED input, **not a seam** — it is compared, never interpreted); the **picker closure** with its own vocabulary and answer; the menu and the picker themselves plus the judgement that they are equivalent for the app (`docs/guide/menulib.md` *What a fork must supply*; `docs/specs/menulib.md` §2.4 items 2/3, §2.2) |
| Foundation supplies | `normalizeCatalog(catalog)`, `buildMenuTemplate(catalog, options)`, `selectCatalogItem(catalog, picker)` and the exported seam type `PickerFn = (candidates: readonly CatalogEntry[]) => unknown` |
| Seams | `docs/guide/menulib.md`'s table, one OPTIONAL seam — **absent**: zero invocations, the `'picker'`-kind item is still EMITTED and on the `'darwin'` path reads `enabled: false`, `selectCatalogItem` returns `null`, nothing throws; **non-callable**: the same declared behaviour (no coercion into a call); **throwing**: exactly one attempted invocation, the throw absorbed inside the module's wrapper, the item emitted disabled, `selectCatalogItem` `null`, never retried or propagated (`docs/specs/menulib.md` §2.4 item 1 classes (1)/(2)/(3); the degraded `'darwin'` `enabled` reading is the dated pin of §3.1) |
| Degradation (read from bytes) | a non-array catalog ⇒ `[]`; a `null`/function element is skipped; an element with no intersection is carried **keyless**; only the seven declared keys are carried, others dropped; `selectCatalogItem` compares **strict identity**, so a string never matches a number; a non-`null` answer naming no known `id` ⇒ `null` (`src/shared/menu-template.ts`; `docs/specs/menulib.md` §2.3 items 1/2/5/8, §3c) |
| Dossier | **REQUIRED.** Adopted: three function names, `PickerFn`, the **seven carried key names** (`id` · `label` · `accelerator` · `role` · `kind` · `submenu` · `enabled`), the two literals `'darwin'` and `'picker'` — and `buildMenuTemplate` **collides by name with the fork's own** function of a different signature (§9) |
| Delete vs keep | **SUBSET+ADAPTER.** Delete: the fork's `src/main/app-menu.ts` → `buildMenuTemplate`, `normalizePaneCatalog`, `orderPaneCatalog` (the catalog-normalizing/ordering half the foundation now owns) and their rows in `tests/unit-u-menu-1-application-menus.test.ts`. Keep: `importSelectionFromDialog`, `IMPORT_DIALOG_FILTERS`, `IMPORT_DIALOG_PROPERTIES`, the actual `Menu`/`setApplicationMenu` composition, and the **picker** — the fork implements both halves of the integration the unit refuses to own (`docs/specs/menulib.md` §2.4 item 5 half 6) |
| Verification + layer | `docs/specs/menu-template-greens.md` — **28 executed = 26 PASS / 2 FAIL / 6 `NOT-BLIND-RUNNABLE`**, and **its own `POST-GREEN` clause records a targeted re-drive as OWED** because it was authored against an earlier module revision. **Layer: `[T]` ONLY**; `[U]` NOT OFFERED and `[D]` NOT CLAIMED — nothing proves a native menu exists, that an item appears in one, that an accelerator fires, or that a native menu and an in-renderer picker are equivalent |

### 2.5 `U-CONTAINER` (`E5`) — the pure selector/normalizer + returned-as-text `contain` declaration

| Field | Reading |
| --- | --- |
| Fork supplies | the `chrome` record; the **token mapping closure**; the opaque `edge` value; the **axis mapping closure** (the same single closure it wires into `E3`/`U-GUTTER-UI`, `docs/specs/container.md` §2.2 item 3); the class name (`docs/guide/container.md` *What a fork must supply*) |
| Foundation supplies | `tokensFor(chrome, tokenFn)`, `orientationFor(edge, axisResolver)`, `containerDeclarationFor(className) → {className, declaration}`, with `declaration` the module-owned constant `'contain: layout style paint'` **returned as text, never parsed or applied** (`docs/decisions.md` ACTIVE `E5-B-1-DECLARATION-IS-RETURNED-AS-TEXT-AND-NEVER-APPLIED`) |
| Seams | `docs/guide/seams.md` rows 1/2 and `docs/guide/container.md`'s two-row table — both **REQUIRED**, supplier the fork: **absent** ⇒ the declared EMPTY answer `undefined`, ZERO invocations, no throw; **non-callable** ⇒ the same EMPTY answer, never coerced/guessed; **throwing** ⇒ one ATTEMPTED invocation, the throw ABSORBED, `undefined` returned, nothing escapes, never retried (`docs/specs/container.md` §2.4) |
| Degradation (read from bytes) | `containerDeclarationFor` returns a FRESH record per call whose member values equal the first call's, with `declaration` by constant reference; a non-string/empty class name ⇒ `''` (`src/shared/container.ts`; `docs/specs/container.md` §2.3 item 4, §3.4 R-8) |
| Dossier | **PLAIN mechanism adoption.** The adopted names (`tokensFor`, `orientationFor`, `containerDeclarationFor`, `ChromeTokenFn`, `AxisResolver`, `ContainerDeclaration`) exist **nowhere** in the fork, the mirror-class taxonomy is explicitly the caller's, and no consumer vocabulary crosses (`docs/specs/container.md` §2.2). The one cross-unit obligation is **not** a collision: `AxisResolver` is shape-identical to the `AxisOf` the fork must wire into the gutter affordance, and the foundation says the **same** closure must be used so two axis readings cannot disagree (`docs/specs/container.md` §2.2 item 3, §2.5 item 4) |
| Delete vs keep | **CONFIG-ONLY.** The fork has **no** container module to delete; its containment is hand-written CSS (`:has(.is-empty)` → `--zone-*-track: 0px`, `docs/FORK-DIVERGENCE.md` §2 row 5). Adoption means: supply the two closures and apply the returned declaration text at the fork's own write site |
| Verification + layer | `docs/specs/container-greens.md` — **24 executed = 24 PASS / 0 FAIL / 4 `NOT-BLIND-RUNNABLE`**, whose two named non-blind classes are *every static byte/token census* and *every rendered/applied/computed/layout/paint fact*. **Layer: `[T]` ONLY**; gate 6 is `STRUCTURAL`, `[U]` not offered, `[D]` not claimed, **and the unit's own gate-9 live run is recorded `OWED`** in its DONE row |

### 2.6 `U-RELOCATE` (`E4`) — the node-local relocate/drop session

| Field | Reading |
| --- | --- |
| Fork supplies | the gesture **session** instance (constructed by the wiring via `createGestureSession`); `candidatesFor(element)` returning the fork's measured candidates (the **distance travels inside the fork's own answer**); `resolveTarget(element, candidates, gesture)`; `onReveal(target, decision)`; the single **`commit(gesture, value)`** sink writer; `threshold` (a **value**, never invoked — its referent is pinned by `docs/decisions.md` ACTIVE `U-RELOCATE-THRESHOLD-IS-THE-ZONE-PROXIMITY-DISTANCE`); `onPreview(state)`; and the `attach` hooks member `preDragValueOf` |
| Foundation supplies | `createRelocateSession(options?)` and the exported pure total `withinProximity(distance, threshold)` — the module's **one comparison site**, so the fork's own "is this near?" code and the composition cannot disagree (`docs/specs/relocate.md` §2.3 item 1) |
| Seams | `docs/guide/seams.md`'s eight rows and `docs/guide/relocate.md`'s matching table, all **OPTIONAL** with named safe defaults (`docs/specs/relocate.md` §2.4 item 1). The three states are **one** declared outcome per seam for most rows, with **two deliberate exceptions**: `commit` **PROPAGATES** from the terminal turn (attempt counted, never retried) and `onPreview` **PROPAGATES** from the observed-move turn with the per-gesture record discarded — those two are the only exceptions to the module's totality (`docs/specs/relocate.md` §2.4 item 1's universal, item 2) |
| Degradation (read from bytes) | absent `session` ⇒ a **valid but inert** module that refuses rather than throws (`attach` ⇒ `false`, `reset` ⇒ a refusal record, `detach()` ⇒ `false`, zeroed stats); empty `candidatesFor` ⇒ the **invalid arm at once, explicitly not a cancel**; `resolveTarget` `undefined` ⇒ a committing terminal writes **nothing**; unusable `threshold` ⇒ nothing is ever within proximity ⇒ the invalid arm, **no mechanism default exists** (`docs/specs/relocate.md` §2.4 items 1/3) |
| Dossier | **REQUIRED, and this is the RCA's own unit.** `threshold` crossed a project boundary undefined, four records disagreed about it, and gate 1 had to be resolved by an architect ruling that supplied the whole behaviour — the failure classes F-1…F-6 and the requested guards H-1…H-8 are `docs/specs/rca-cross-project-handoff-semantics.md` §2/§3. A fork adopting this unit inherits the **same** hazard in the other direction (`threshold` vs the fork's `withinSnapThreshold`, §9) |
| Delete vs keep | **SUBSET+ADAPTER.** Delete: the fork's gesture bookkeeping in `src/renderer/pane-drag.ts` (the drag session, capture/cancel/revert, the proximity test — superseded by the session composition + `withinProximity`). Keep, as the seam suppliers: the fork's zone policy `legalZonesForScope`, `dropZoneForPoint`, `toZoneBounds`, `insertionIndexForPoint`, `movePane` and the one committing write. **Named costs to re-home:** the module reads no coordinate/geometry and computes no distance; it has **no capture member** (`docs/specs/relocate.md` §2.2 P-3/P-7, §7 item 3) — so a drag whose pointer leaves the moved element's box **loses its reading**, and the ghost's position, the expanded zone's box and the perceived revert are **verified nowhere in the foundation** (§7 items 4/5) |
| Verification + layer | `docs/specs/relocate-greens.md` — blind run: **23 executed = 23 PASS / 0 FAIL / 4 `NOT-BLIND-RUNNABLE`** + one type-layer scenario. **Layer: `[T]` ONLY**; no `[U]` row offered and no `[D]` row claimed; **the fork's own live readings must be produced by the fork** (`docs/specs/relocate.md` §5.2) |

### 2.7 `U-GUTTER` (`E3`) — the resize controller (one value, one clamped commit)

| Field | Reading |
| --- | --- |
| Fork supplies | the **session** (`createGestureSession`, constructed by the fork — this module constructs none); `axisFor`; `boundsFor`; `defaultSizeFor`; `isResizable`; `sizeFor(element, gesture)`; the single `commit(gesture, value)` sink; plus the four per-control hooks (`onStart`/`onMove`/`onEnd`/`onCancel`) which travel into the session unchanged |
| Foundation supplies | `createResizeController(options?)` and the exported pure `clampToBounds(value, bounds)` — **`NaN`, never a throw and no refusal domain** (`docs/specs/gutter.md` §2.3 item 2) |
| Seams | `docs/guide/gutter.md`'s seven-row table (`docs/specs/gutter.md` §2.4 item 1): all OPTIONAL with named safe defaults. Two rows **PROPAGATE** — `boundsFor` (to the caller of the terminal, with zero writes on that path) and `sizeFor` (to the caller of the terminal, zero or exactly one write, never two) (`docs/specs/gutter.md` §2.4 item 2 row 4). Every other row is absorbed |
| Degradation (read from bytes) | absent `session` ⇒ a valid but inert controller (`attach` ⇒ `false`, declared refusals, zeroed stats, no throw — §3.2 `F-16`); unusable `boundsFor` ⇒ the clamp answers `NaN` ⇒ **no sink write**; absent `defaultSizeFor` ⇒ `reset` refuses `'unusable-default'` with zero session calls; a throwing `isResizable` ⇒ **not resizable, zero writes, and the outcome is not a cancel**; a throwing `commit` ⇒ counted as an attempt and never retried (`sinkCalls` `1` beside `written` `0`, §3.2 `F-11`) |
| Dossier | **REQUIRED.** Adopted: `createResizeController`, `clampToBounds`, `axisFor`/`boundsFor`/`defaultSizeFor`/`isResizable`/`sizeFor`/`commit`, the `ResizeStats` counters, and the **nine-member reset code domain** (the session's seven propagated verbatim plus the controller-local `'unusable-default'` and `'not-resizable'`, `docs/specs/gutter.md` §2.3 item 4). The fork supplies the same concepts under different names and with **zone-typed** bounds (§9) |
| Delete vs keep | **SUBSET+ADAPTER.** Delete: `src/renderer/pane-gutter.ts` → `createGutterController` and `clampGutterSize` (the controller + clamp the foundation now owns) and their rows in `tests/unit-u-shell-5-resizable-gutters.test.ts`. Keep, as the seam suppliers: `GUTTER_ZONES`, `gutterAxis`, `gutterBounds`, `isGutterResizable`, `setZoneSize` and the graph write. **Named cost:** the controller never sees an event object and reads no coordinate — the value is **consumer-produced** (the fork computes it in its own `onMove` and pushes it with `gesture.set(value)`), and what a local handler buys is origin reachability, **not magnitude equivalence** (`docs/specs/gutter.md` §1 item 2, §2.3 item 1, §7 item 2) |
| Verification + layer | `docs/specs/gutter-greens.md` — blind run: **93 rows = 87 PASS / 4 FAIL / 2 `NOT-BLIND-RUNNABLE`**, no FAIL converted. **Layer: `[T]`/`[H]` ONLY**; the unit reads no coordinate and has no importer of its own, so **nothing rendered is asserted** (`docs/specs/gutter.md` §5.2) |

### 2.8 `U-GUTTER-UI` (`E10`) — the authored affordance + the wiring that attaches it

| Field | Reading |
| --- | --- |
| Fork supplies | **eleven caller seams**, of which **nine are REQUIRED** (`sizeFromPointer`, `axisOf`, `cursorOf`, `applyPreview`, `applyCursor`, `startSizeOf`, `boundsOf`, `resizableOf`, `commit`) and **two are OPTIONAL** (`pointerOf`, `moveTypeOf`), plus four REQUIRED options (`session`, `source`, `element`, `target`), the OPTIONAL `isDragValid` veto and the declared-and-ignored `capturePointer` (`docs/guide/gutter-ui.md` *What a fork must supply*; `docs/specs/gutter-ui.md` §R.2/§R.3, §2.1 items 3/5) |
| Foundation supplies | `createGutterAffordance(options?)`, `cursorDeclarationFor(value)`, `domEventSource()`; the authored card + three ids in `src/shared/demo-envelope.ts`; and **one sample implementation** of the eleven seams, `gutterSeamExample()` — explicitly **an implementation, never the contract** (`docs/decisions.md` ACTIVE `GUTTER-CALLER-SEAMS-ARE-THE-FAMILY'S-DOWNSTREAM-CONTRACT`; `docs/specs/gutter-ui.md` §R.2) |
| Seams | `docs/guide/gutter-ui.md`'s eleven-row table, cited to `docs/specs/gutter-ui.md` §R.3: a non-number `sizeFromPointer` answer/unusable `boundsOf` pair ⇒ `clampToBounds` answers `NaN` ⇒ the move is **INVALID** ⇒ the reset arm; an `undefined` `axisOf` token ⇒ the cursor seam is refused (no write); a falsy `resizableOf` ⇒ `E3` short-circuits every terminal (zero commits, zero previews, the gesture still establishes); **`applyPreview` and `applyCursor` PROPAGATE** their throws from the module's own turn; **`commit`'s throw is ABSORBED by the composed `E3`** (`sinkCalls` `1` beside `written` `0`); a `moveTypeOf` token that is **not the session's own** fails the census row `R-14` |
| Dossier | **REQUIRED.** Adopted: the eleven seam names, the 20-name export census, the stats counters, `domEventSource`, `cursorDeclarationFor`, and the two authored ids (`GUTTER_AFFORDANCE_ID = 'gutter-vertical'`, `GUTTER_TARGET_ID = 'gutter-target'`, `GUTTER_STATUS_ID = 'gutter-status'`). The fork's own pointer/hover/cursor code carries the same concepts under its own names (§9) |
| Delete vs keep | **SUBSET+ADAPTER, and this is the unit with the largest fork-side deletion.** Delete: the fork's hand-written gutter DOM/hover/preview/cursor code inside `src/renderer/renderer.ts` → `installShellPointers` and the `.gutter[data-zone][data-axis]` markup in `src/renderer/index.html` (`docs/FORK-DIVERGENCE.md` §2 rows 1/2), plus the tests that pin that geometry. Keep, as the seam suppliers: (i) the graph-resolved element resolution (the fork's `Runtime.elementForNodeId`, the foundation's one graph read), (ii) the one **commit** route — the foundation's demo writes a `state-slice` to the authored **status** node (a peer of the handle, so the element the listeners are on is not re-rendered) and the fork keeps each write's runtime answer so a refusal is a visible reading (`src/renderer/renderer.ts` → `startGutterAffordance`, `GutterWriteReading`), (iii) `applyPreview`/`applyCursor` as the fork's real DOM writes. **The affordance itself must become provident-authored envelope data** (the fork's own project-wide constraint: a UI element outside the graph is invisible to `provident.dispatch`/`get_rendered_html`/`get_markdown`) |
| Verification + layer | `docs/specs/gutter-ui-greens.md` (blind set, `84`-row unit suite, `[T]`/`[H]` over caller doubles) **plus `docs/specs/gutter-ui-live-battery.md`, whose status is `OPEN / LIVE-PENDING — NOT green, NOT a pass`**: the battery **was RUN**, leg 5 could not take its measurement (exit `2`, `PRECONDITION-FAILED`), the precondition `npm run divergence` is **RED (exit `1`, 5 of 9 checks failing)**, six live findings contradict the unit's filed `§5.U` Post observations, and three `MANUAL OPERATOR` rows remain owed to a session with a human at the window. **Layer split: `[T]` green, `[U]` OPEN.** |

### 2.9 `U-ZONES` (`E1`) — the pure track-token mechanism

| Field | Reading |
| --- | --- |
| Fork supplies | per call: the property name (`trackProp`), the unit token (`unit`), the empty token (`emptyToken`), the size, the emptiness flag, **the census and the zone key** (`docs/specs/zones.md` §2.2) |
| Foundation supplies | `isEmpty(census, zoneId) → boolean` and `trackFor(spec, size, empty) → string`; type `TrackSpec` |
| Seams | **none** — the module imports nothing at all (verified: zero import statements in `src/shared/zones.ts`); there is no absence/non-callable/throwing arm to declare (`docs/guide/zones.md` *What a fork must supply*; `docs/specs/zones.md` §3.4 R-3, §1 item 7) |
| Degradation (read from bytes) | a malformed spec answers `''` **even when `empty` is true** (the malformed limb gates the other three); a numeric string, `NaN`, `undefined` or a negative size take the empty-token arm; a record census needs a **string** key (a `Map` may be keyed by anything); `false` collapses "not empty" and "not a key"; `''` is overloaded (malformed vs a caller's own empty token) (`src/shared/zones.ts`; `docs/specs/zones.md` §2.3 items 1/2/4/5, §0A notes) |
| Dossier | **REQUIRED** — not for a name collision but for a **semantics table**: the adopted tokens (`trackProp`, `unit`, `emptyToken`) and the census shape must be mapped to the fork's own zone vocabulary (`LayoutZoneName = 'left' \| 'right' \| 'header' \| 'footer'`, `LAYOUT_ZONE_MIN`/`LAYOUT_ZONE_MAX`) and its census, and the foundation's unit delegates its token bytes to this module (its only in-repo consumer is `src/shared/census.ts` → `computeTrackVars`) |
| Delete vs keep | **SUBSET+ADAPTER.** Delete: the fork's token formatting (`src/renderer/layout-state.ts` → `zoneTrackCssVars` as the formatter). Keep, as the adapter: the fork's zone names + spec map, the census mirror (`src/renderer/sidebar-panes.ts` → `applyZoneTracks`) as the write site, and the fork's `:has(.is-empty)` collapse CSS |
| Verification + layer | `docs/specs/zones-greens.md` — **67 rows = 57 PASS / 2 FAIL / 8 `NOT-BLIND-RUNNABLE`**. **Layer: `[T]` ONLY** — the emitted token is a string and whether a browser accepts/applies/paints it is not the unit's claim (`docs/specs/zones.md` §2.3 item 7, §3.3 I-10, §7 item 6) |

### 2.10 `U-FOCUS-MODEL` (`F2`) — the pure ordered-entry transition reducer

| Field | Reading |
| --- | --- |
| Fork supplies | **the state record `{entries, activeId}` itself** (the module holds nothing between calls, `docs/specs/focus-model.md` §1 item 2, §3.3 I-2); the opaque `id` and `target` values; the entry rendering, the key handling that selects a verb, the verb mapping and every byte of storage (§1 item 10) |
| Foundation supplies | `focusTransition(state, verb, arg?)`, `focusOrder(entries)`, `focusIndex(state, id)`, `persist(seam, state)`; types `FocusId`, `FocusEntry`, `FocusVerb`, `FocusRefusalCode`, `FocusState`. **`persist` is a top-level export the module NEVER calls** — you call it when you decide to persist (`docs/specs/focus-model.md` §2.1 item 4) |
| Seams | `docs/guide/seams.md` rows 11/12/13 and `docs/guide/focus-model.md`'s three-row table: `refuse` and `onChange` — absent ⇒ no call attempted and the result is bit-for-bit the called case; non-callable ⇒ identical outcome; **throwing ⇒ SWALLOWED**, the verdict/`accepted`/`seated`/`changed`/`state` unchanged, and **no refusal code is invented for caller code** (`docs/specs/focus-model.md` §2.4 seams 1/2, laws 1/4). `persist` — absent/non-callable/throwing ⇒ `{present: false, value: undefined}`, nothing escapes (§2.4 seam 3). **No equality/comparator seam exists**: identity is the one rule (§2.2(D)) |
| Degradation (read from bytes) | an unknown verb is total: no throw, `state` returned **by identity**, one refusal (`'unknown-verb'`); a repeated `target` under a NEW id **activates the existing entry and appends nothing** (the identity rule on `target`); `focusIndex` returns the sentinel `-1`; `undefined` is a legal opaque id distinct from `null`; nothing throws for any argument or seam shape, including hostile holders and revoked proxies (`src/shared/focus-model.ts`; `docs/specs/focus-model.md` §3.1 M-3, §3.2 F-1/F-4/F-7) |
| Dossier | **REQUIRED — and the foundation already ships one: `docs/specs/focus-model-adoption-dossier.md`** (7 identifier rows of the ≤8 cap, each with a source citation and a `STATUS`, plus 2 derived-default rows in its §3). Its own header records that **step 0 was SKIPPED for this unit although its whole seam vocabulary is FORK-ADOPTED**, and that the dossier is a **condition** recorded in the gate-1 record (`docs/specs/focus-model-review.md` §4, `G-2`). **It also carries an `⟶ ANNOTATED` withdrawal of the adopted sixth refusal code** — the contract's union is aligned to the **five** bodies it emits while the adopted count of six is **not withdrawn** (an external act) |
| Delete vs keep | **SUBSET+ADAPTER** — and deliberately **partial**. Delete: the transition bookkeeping in the fork's `src/renderer/tab-state.ts` (the `focusTarget` transition and its surrounding rules) **only if** the fork accepts the foundation's model. Keep, unconditionally: `TabTarget`/`TabEntry`/`TabState`, `TAB_STATE_VERSION`, `TAB_LANDING`, the persisted `OperatorSettings.tabs` carrier, the strip (`src/renderer/tab-strip.ts` → `TabStrip`). **The foundation's model carries no consumer vocabulary** — no `'tab'`/`'pane'`/zone/region as a symbol, union member or default (`docs/specs/focus-model.md` §2.2(A) P-FM-1, §2.2(C) rows 2/6) — so the fork's typed target union is **app policy it must keep**, not something the model supplies |
| Verification + layer | `docs/specs/focus-model-greens.md` — blind run: **28 executed = 26 PASS / 2 FAIL / 8 `NOT-BLIND-RUNNABLE`**, neither FAIL tuned away. **Layer: `[T]` ONLY** — no row may be read as a claim that anything was focused, that a tab or pane changed, or that a user-visible flow moved (`docs/specs/focus-model.md`, Layer declaration anchors 1/5) |

### 2.11 `U-FOCUS-TOOL` (`F3`) — the `provident.focus` tool (the foundation's 22nd `ALL_TOOLS` member)

| Field | Reading |
| --- | --- |
| Fork supplies | the **host backend** (`McpBackend.invoke` — REQUIRED), the **renderer's answer for the `'focus'` method** (REQUIRED: omitting the `'focus'` member from the `RpcMethod` union is a **typecheck failure**; keeping the member but dropping the `case` throws `unknown method: focus`), and the **group gate** (OPTIONAL: the host's security settings; `dispatch` is ON by default) (`docs/guide/focus-tool.md` *What a fork must supply*) |
| Foundation supplies | the route with **no state of its own**: validate `{target?, newTab?}`, make **one** renderer call, return the renderer's answer verbatim. The live `{entries, activeId}` authority is the **renderer wiring's holder**, never the tool and never the graph (`docs/specs/focus-tool.md` §2.1 item 6, §1 item 3, §2.3) |
| Seams | `docs/guide/focus-tool.md`'s three-row table: an absent backend means no server at all; while the renderer has not signalled ready the call **rejects with the backend's readiness error** and the focus state is untouched (`docs/specs/focus-tool.md` §2.1 item 8(b), §3.2 F-2); a **non-callable `invoke` is `unverified`** — the contract declares no arm for it and its declared throw set is closed and two-membered (§2.3 item 6, §3.3 I-13); a **consumer refusal is never a throw** (returned as `refused: {reason}`). **A malformed call** (an own enumerable key outside `{target, newTab}` — e.g. `id`) is refused by a `TypeError`-class throw naming the rejected key, before any renderer call |
| Degradation (read from bytes) | the answer arrives as a **JSON string inside one MCP text block** (`src/main/mcp-server.ts`'s `text(value)` helper); `entries` is a list of **ids**, not entry objects; on the landed wiring `refused.reason` carries a refusal **code** (`'unknown-verb' \| 'duplicate-id' \| 'unknown-id' \| 'no-next' \| 'no-previous'`) while the contract calls `reason` the consumer's own string; naming a target you never opened is **refused, not opened** (the wiring picks `activate` unless `newTab === true`) |
| Dossier | **REQUIRED — and the foundation already ships one: `docs/specs/focus-tool-adoption-dossier.md`** (8 identifier rows = the ≤8 cap, each cited with a `STATUS`; its §4 records that no identifier was found `undefined-until-answered`). It also records the binding negative: **`'focus'` must stay OUT of `MUTATING_METHODS`** — a later edit adding it is a **contract violation** (`docs/specs/mcp-endpoint.md` §3.8 item 4) |
| Delete vs keep | **SUBSET+ADAPTER — but the first question is a DECISION, not a deletion (R-1, §6).** The fork **already ships a `provident.focus`** (fork unit `U-SHELL-9a`, `docs/specs/unit-u-shell-9a-main-focus-tabs.md` §9.2) whose argument schema is `{target?: <typed union: document \| search \| graph \| template \| other>, tabId?, newTab?}` — i.e. **an own enumerable key (`tabId`) and a typed target the foundation's tool would REFUSE**. The fork must either (a) adopt the foundation tool wholesale and move its entry-resolution policy + id minting into a renderer holder (losing `tabId` and the typed union from the wire), or (b) keep its own tool and record the divergence — never silently merge |
| Verification + layer | `docs/specs/focus-tool-greens.md` — **18 executed = 18 PASS / 0 FAIL / 1 `NOT-BLIND-RUNNABLE`** plus a separate column of **13 claims that cannot be run blind**, pointed at gate 6. **Layer: `[T]`/`[H]` (a recorder backend) — the tool's own suite drives a recorder, so the landed wiring's particular values are a READ OF THE WIRING, not a value a test pins**; `docs/specs/focus-tool.md` §5.U labels two rows **structurally not observable** (the stronger claim that a real window did not re-render is **not claimable** on this unit's instruments) |

### 2.12 MCP parity surface (`U-REALDOM-BOOT` + `U-DIVERGENCE-EXT`)

| Field | Reading |
| --- | --- |
| Fork supplies | nothing structural — the legs drive the **existing** tools (`provident.load`/`code.load`/`provident.get_rendered_html`); the fork supplies a **`DISPLAY`** (or an xvfb wrapper) because the legs are **not headless** |
| Foundation supplies | `npm run divergence` — the **identity check** on **nine pinned structural surfaces** (`scripts/electron-divergence.mjs` → `PINNED_CHECKS`, `scenarioEnvelope`, `extractAttributeNames`, `attributeSetDifference`, `ATTRIBUTE_NAME_FOLD`) with a `[EXT]` tally that is **never counted in N** — and `npm run ui` — a **measurement** leg (`scripts/electron-ui.mjs`) booting the real Electron renderer under a controlled temp profile, obtaining **ONE** measurement over stdio MCP. A `ui` green is **not stronger than a `divergence` red**: where the precondition is red the leg reports **`PRECONDITION-FAILED`** |
| Seams/degradations | `docs/guide/mcp-parity.md`'s table: a missing `McpServerOptions.backend` has **no declared degradation** (handlers call `this.backend.invoke(...)` unguarded — `unverified`); `port` defaults `3787`, `gate` defaults to `read`+`dispatch`, `readyTimeoutMs` `30000`, `invokeTimeoutMs` `60000`, `largePayloadBytes` `1_000_000` (an over-bound result is **replaced** by `{census, digest, preview, truncated}`, never thrown); `notifyGraphChanged()` returns **`false`** rather than throwing when not stdio / not connected / `read` off |
| Dossier | **PLAIN** — no external identifier is adopted; this is a harness/config adoption |
| Delete vs keep | **CONFIG-ONLY.** The fork keeps its own driver `scripts/live-drive.mjs` (it is the fork's live-battery surface) and its own `scripts/electron-divergence.mjs`/`scripts/mcp-cli.mjs`; adoption means adding the two `package.json` script keys and inheriting the leg rules. **`N = 9` cannot absorb a new check — routing one new assertion through the harness's helper turns the leg red as a pin drift** (`docs/specs/ci-divergence-leg.md` A-4.2–A-4.5) |
| Verification + layer | `docs/specs/ci-divergence-greens.md` (a green-scenario set, **not a run**) · `docs/specs/ci-ui-leg-greens.md` (blind run **26 = 16 PASS / 4 FAIL / 6 `NOT-BLIND-RUNNABLE`**, corrected enumeration **32 = 24/4/4**) · `docs/specs/ci-ui-leg-live-status.md` (the live battery, `[U]`) · `docs/specs/engine-pin-live-status.md` (`[U]`/`[D]`). **A green `divergence` leg is silent on IPC, on layout, and on geometry** (`docs/specs/ci-divergence-leg.md` A-6.4; `docs/specs/ci-ui-leg.md` §3.3 C-1…C-7) |

### 2.13 The base surface (shell chrome + MCP endpoint)

| Field | Reading |
| --- | --- |
| Fork supplies | `McpBackend.invoke` (REQUIRED), `window.provident` (REQUIRED for MCP; absent ⇒ the renderer logs `no preload bridge — MCP endpoints unavailable` and returns while the app UI still boots), the transport/port/user-data argv seams (OPTIONAL, defaulted) |
| Foundation supplies | the whole **floor**: `ProvidentMcpServer` (22 static `ALL_TOOLS`, 3 resources, `allowedToolNames`, `applyGatePatch`, `notifyGraphChanged`), `RendererBackend`, the five-group gate (`ToolGroup = 'read' \| 'dispatch' \| 'graph' \| 'code' \| 'module'`, default `['read','dispatch']`), the preload bridge (7 methods + `security.*` + `module.*`, **manual-UI only** — no MCP handler routes to those channels), `Runtime`, and the seven-member `MUTATING_METHODS` set |
| Dossier | **PLAIN** |
| Delete vs keep | **CONFIG-ONLY — the fork KEEPS this layer.** It is the baseline both projects share; the fork's divergences on it are its own tool family (`rag.*`, `edit.*`, `code.template.*`, `gnosis.*`, `provident.get_journal`) and its extra bridge channels, which this adoption does **not** remove |
| Verification + layer | `[T]`/`[H]` + the two `[U]` legs of §2.12. The **gate/group/push** contracts are `docs/specs/mcp-endpoint.md` §6, §8 |

---

## §3 The seam family in one place (the adoptable, caller-supplied edges)

`docs/guide/seams.md` is the foundation's own one-table view of the family; the unit pages carry their
own tables. **This inventory adds no row to either** — it records which of them the fork must implement:

| Unit | Seam rows | Class | The foundation's own statement of who supplies it |
| --- | --- | --- | --- |
| `U-CONTAINER` | `tokenFn`, `axisResolver` | REQUIRED ×2 | the fork / the calling layer — the mirror-class taxonomy lives here and only here |
| `U-GUTTER` | `session`, `axisFor`, `boundsFor`, `defaultSizeFor`, `isResizable`, `sizeFor`, `commit` | OPTIONAL ×7 (named safe defaults) | the fork; `session` is the one whose absence makes the controller inert |
| `U-GUTTER-UI` | the eleven of §2.8 (+ `session`/`source`/`element`/`target`, `isDragValid`, `capturePointer`) | **REQUIRED ×9**, OPTIONAL ×2 | the fork — **the family's downstream contract** |
| `U-RELOCATE` | `session`, `candidatesFor`, `resolveTarget`, `onReveal`, `commit`, `threshold`, `onPreview` (+ the `attach` hooks member `preDragValueOf`) | OPTIONAL ×7 + 1 record member | the fork (app policy); `session` is the wiring's |
| `U-FOCUS-MODEL` | `refuse`, `onChange`, `persist` | OPTIONAL ×3 | the caller/fork — observation only; `persist` is called by the caller, never by the module |
| `U-MENULIB` | `picker` (+ the `platform` **value**, REQUIRED and not a seam) | OPTIONAL ×1 | the fork / the calling layer |
| `U-THEME` · `U-OVERLAY` · `U-ZONES` | **no seams** (an empty seam set / one argument callback that is explicitly not a seam / zero imports) | — | the fork supplies **data**, and in the overlay's case one callback consumed inside a single synchronous call |
| `U-FOCUS-TOOL` | `McpBackend.invoke`, the renderer's `'focus'` answer, the group gate | REQUIRED ×2, OPTIONAL ×1 | the host / the fork's renderer wiring |

**Two structural warnings the foundation states and a fork must not lose.** (1) **A seam's signature,
REQUIRED/OPTIONAL status and declared degradation are normative contract text**, the seam **types are
part of the module's exported census**, and the foundation's own wiring is **one sample implementation,
never the contract** (`docs/decisions.md` ACTIVE `GUTTER-CALLER-SEAMS-ARE-THE-FAMILY'S-DOWNSTREAM-CONTRACT`).
(2) **Several foundation modules are imported by NO `src/**` file and appear in NONE of the shipped
bundles** — measured for `container.ts`, `relocate.ts`, `theme.ts`, `menu-template.ts`, `overlay.ts`,
`zones.ts`, `census.ts`, `layout-projection.ts`, `mount-invariant-guard.ts`, `owned-list-host.ts` — so a
fork consumes them **as source**, and their greens are evidence about a caller's functions, never about
the assembled app.

---

## §4 The adoption-dossier rule, and which elements carry an obligation

**The rule read from the foundation, quoted.** `docs/specs/rca-cross-project-handoff-semantics.md` §3.1
states the deliverable: *"one artefact per adopted unit, carrying: **THE SEMANTICS TABLE — one row per
adopted identifier** (every parameter, option, seam, callback, return field, error code and vocabulary
token in the adopted contract): `identifier · kind · what it measures/decides · unit · domain · who
supplies it · who evaluates it · where the arithmetic lives · the observable that proves it · the clause
that pins it · STATUS (defined / undefined-until-answered)`. Any row whose STATUS is
`undefined-until-answered` blocks the gate-1 verdict"*; and its collision clause: *"every adopted
identifier grepped against this repo's own prohibition/vocabulary rows … with a recorded reconciliation
for each hit, in the form 'the token is banned in layer X for reason Y, and legitimate in layer Z
because …', or an explicit re-name request"*. Its trigger: the dossier is **required whenever an external
ask is adopted into the repo as a unit** — i.e. **when the contract's names, parameters or vocabulary
originate outside the consuming project.**

**Two honesty limits this pass must state about that rule.** (1) The RCA's own header declares its items
**REQUESTS, not landed rulings** (*"These are REQUESTS, not landed rulings — the harness is the
architect's"*), and the same "background only, not in force" marking is carried by the sibling contracts
(`docs/specs/relocate.md` §8, `docs/specs/container.md` §8, `docs/specs/menulib.md` §8) and by
`docs/pending.md`'s request row `K-1`. (2) The foundation nevertheless **applied the shape twice** —
`docs/specs/focus-model-adoption-dossier.md` (7 rows + 2 derived-default rows) and
`docs/specs/focus-tool-adoption-dossier.md` (8 rows) — each declaring its row cap as `≤8`, each citing a
source for every row, each carrying a `STATUS` per row, and the second stating the hazard directly:
*"a SILENT ZERO-ROW is itself a FINDING, and an OPEN row forces `BLOCKED-ON-SEMANTICS`."*

**Applied to this adoption (the fork is the consuming project, so the identifier flow is inverted).**
The rule's trigger is satisfied by **any element whose adopted vocabulary is not the fork's own**. The
distinction that actually changes the work is whether an **adopted identifier also exists in the fork**
(a collision, which needs the reconciliation row) or is **new to the fork** (a semantics row only):

| Class | Elements | What the fork's dossier must carry |
| --- | --- | --- |
| **D-1 — adoption with a NAME/meaning collision in the fork** | `U-THEME` (`resolveTheme`), `U-MENULIB` (`buildMenuTemplate`), `U-FOCUS-TOOL` (`provident.focus`), `U-FOCUS-MODEL` (`focus`/`persist`/`refuse`), `U-OVERLAY` (the state/verb vocabulary vs `createModalController`), `U-RELOCATE` (`threshold` vs `withinSnapThreshold`), `U-GUTTER` (`clamp*`/bounds seams vs `clampGutterSize`/`gutterBounds`), `U-GUTTER-UI` (the eleven seams vs `installShellPointers`), `U-ZONES`/`U-CENSUS` (`trackFor` vs `zoneTrackCssVars`) | semantics table **plus** a collision report: each hit reconciled **by row id** (`banned/owned in layer X for reason Y; legitimate in this layer because Z`) **or renamed by an explicit request — never by relaxing a prohibition** |
| **D-2 — plain mechanism adoption (new names, no consumer vocabulary crossing)** | `U-CONTAINER` (the three functions + two closures; the taxonomy and the class name are the caller's), `U-THEME-CONTROL` (re-authored data), the parity surface, the base surface | a shorter semantics row set; the collision report is still cheap and should be run, but no identifier is expected to hit |
| **D-3 — the foundation already ships the dossier** | `U-FOCUS-MODEL` · `U-FOCUS-TOOL` | **read the foundation's dossier as the first input** and re-derive the fork-side collision half against the **fork's** prohibition/vocabulary rows and typed unions; do not copy its `STATUS` column as the fork's |

**The one rule that is NOT satisfied by a citation from this file.** The foundation's dossiers carry
`defined` statuses **only where the citation actually fixes the meaning** — both say so in their own hard
limits. A fork adopting `U-FOCUS-MODEL`/`U-FOCUS-TOOL` inherits the **withdrawn sixth refusal code**
(noted in `focus-model-adoption-dossier.md` §1 row `I-5`, and carried as an owed item) and the
**`reason`-is-the-consumer's-string vs a refusal code** variance (§2.11) — neither is a `defined` row for
the fork.

---

## §5 The foundation's ledger units with **NO** guide page (9 rows)

`docs/guide/README.md`, the section *"Units that have no page here"*, names their contracts and says
plainly: *"If you need one of them before a page exists, read the spec and cite it — do not infer its
behaviour from a sibling page."* Inventoried here because three of them are **in scope** for a
shell-mechanism rebuild and two are **prerequisites** of it.

| # | Unit | Contract | Source (verified) | What it offers a fork | In scope for the shell rebuild? | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| 15 | **`U-GSESSION`** (`E6`) | `docs/specs/gsession.md` | `src/shared/gesture-session.ts` → `createGestureSession`, `POINTER_TYPES`, `installGestureListeners`, `detachGestureListeners`; types `GestureElement`, `EventSource`, `GestureOptionsInput`, `GestureOptions`, `GestureHandle`, `SessionOptions`, `SessionStats`, `GestureStats` | **the frozen interaction session both gesture units compose** — local handlers on the element that receives the interaction, an injected event source, one commit per gesture; the **only** thing that attaches listeners, establishes a gesture and runs a terminal | **YES — the substrate of §2.6/§2.7/§2.8** | SUBSET+ADAPTER. The fork's session half of `pane-drag.ts`/`pane-gutter.ts`/`installShellPointers` is superseded; the fork keeps its `EventSource` implementation (`src/shared/dom-shim.ts`-style, or the real DOM) and its hooks. **Binding constraint:** document-delegated `pointerdown` + per-event `closest(selectors)` resolution is **REJECTED**, and capture is **0 calls before establishment**, permitted after, **per-control opt-in** (`docs/decisions.md` ACTIVE `INTERACTION-NODE-LOCAL`; `docs/specs/provident-electron-shell-chrome-handoff-review.md` S-d9/H-r9). The session's capture capability is the **source's own optional member** `capturePointer?(element)` — a source **without** it is the declared degradation: zero calls, no throw, the gesture still establishes |
| 16 | **`U-CENSUS`** (`E2`) | `docs/specs/census.md` | `src/shared/census.ts` → `computeTrackVars`, types `ZoneId`, `TrackVars` | the **census → track-variable record**; it delegates every token byte to `U-ZONES` (`isEmpty`/`trackFor`) rather than formatting a second time | **YES** (the zones/track layer) | SUBSET+ADAPTER. Supersedes the fork's `layoutCssVars`/`zoneTrackCssVars` computation; the fork keeps the write site and its census. **Caveat read from the spec:** a record-shaped census needs a **string** key while a `Map` may be keyed by anything, and the fork's `LayoutZoneName` is a string union — a numeric-id census resolves only against a `Map` |
| 17 | **`U-PROJ`** | `docs/specs/projection.md` | `src/shared/layout-projection.ts` → `project`, `projectVar`, `applyProjection`, `applyVarsToRoot`; types `VarValues`, `VarSpec`, `ProjectionSkipReason`, `ProjectionSkip`, `Projection`, `VarWriteSink`, `ApplyResult` | the **pure projection + TOTAL applier over an injected write sink** — serialized geometry → custom properties, one write per commit, with a projected skip list | **YES** (the layout/token write layer) | SUBSET+ADAPTER. Supersedes the fork's JS-written custom-property computation; the fork **supplies its own sink** and its own variable names/units. **Two real totality bugs were found and fixed in this unit** (a revoked `Proxy` as `values`; a projection whose `applied`/`skipped` field read throws) — a fork re-reading an older revision would re-inherit them |
| 18 | **`U-LISTHOST`** | `docs/specs/listhost.md` | `src/shared/owned-list-host.ts` → `createOwnedListHost`; types `ListKey`, `ListEntry`, `OwnedListHostOptions`, `ListHostRefusal`, `ListHostResult`, `OwnedListHost` | the **owned-node list host** — own-node ownership + order-as-projection, opaque `ListKey`, caller-supplied order/attributes, typed refusals, foreign siblings survive | **YES** (the tab strip / pane-list host) | SUBSET+ADAPTER. Supersedes the fork's strip mount-ownership/order-projection half (`src/renderer/tab-strip.ts` → `TabStrip`, `src/renderer/pane-registry.ts`); the fork keeps its tab content, its `TabEntry` model and its single-active render rule |
| 19 | **`U-SLOTHOST`** | `docs/specs/slothost.md` | `src/shared/slot-host.ts` → `createSlotHost`; types `SlotKey`, `SlotAttribute`, `SlotHostOptions`, `SlotHostRefusal`, `SlotHostResult`, `SlotHost` | the **slot HOST** half of `SCH-9`: opaque slot keys → containers holding **caller-created** nodes; the **publisher/carrier half is DECLINED** because it authors content | **YES** (the top-bar/status slots) | SUBSET+ADAPTER, **host half only**. The fork's top-bar slots + status/warning text stay fork-owned; the fork must not grow per-pane/per-zone semantics or a mirror-class taxonomy inside the host (`H-r15`) |
| 20 | **`U-MOUNTGUARD`** | `docs/specs/mount-invariant-guard.md` | `src/shared/mount-invariant-guard.ts` → `probeMountInvariant`, `assertMountInvariant`; types `MountRootObservation`, `MountViolationCode`, `MountViolation`, `MountInvariantResult`, `MountExpectation` | a cross-envelope mount cardinality/identity probe **plus a landed HOST FIX** (`reconcileMount()` in the foundation's `src/renderer/runtime.ts`): the construct-then-load sequence left **TWO** engine-emitted direct roots in one mount, and the fix detaches a discarded graph's stale root before the new tree is emitted | **YES — at the host-fix level.** The fork has the **same defect class** (`docs/FORK-DIVERGENCE.md` §2 row 1: `STALE-MOUNT-PUSHES-CANVAS`, `src/renderer/runtime.ts` → `tearDownGraph`'s stale-mount sweep) | SUBSET+ADAPTER. The **probe is a regression instrument** (imported by NO `src/**` file) — the fork may adopt it or write its own row; the **host fix is the deliverable**. **Layer warning:** the probe **refuses a real-DOM mount today** (its `children` must be an array; a real DOM's is an `HTMLCollection`), so **no real-DOM row was taken** |
| 21 | **`U-ENGINE-PIN`** | `docs/specs/engine-pin.md` | the pin `provident-ssr ^0.5.1` (verified in the foundation's `docs/FORKER.md` §2 which reads the manifest and lockfile state as of 2026-09-27), the scoped `ShimElement.removeAttribute` completion, and a shape-only prop-mutation guard at both call sites | **the prerequisite of every other adoption**: the engine pin, the shim completion the overlay's `inert` criterion needs, and the host-side guard | **YES — prerequisite, config-level** | CONFIG-ONLY in kind, **but it gates the rest**: the closed `BOOLEAN_ATTRS` set (including `'inert'`) is absent from the older pin, so `U-OVERLAY`'s inert criterion is not expressible before the move. **The fork's own pin state was NOT read in this pass — UNVERIFIED** |
| 22 | **`U-ENGINE-DRIFT`** | `docs/specs/engine-drift.md` (+ `docs/specs/engine-drift-measurements.md`) | **zero production code, zero new tests** — a measurement record (`N = 57` rows: `CONSISTENT` / `DRIFTED` / `UNMEASURABLE` / `INVALID`) | the **behavioural reconciliation** at the moved pin: what the engine change altered, what it left alone, and what cannot be measured | **YES — the reconciliation input** for the fork's own pin move | CONFIG-ONLY (doc). **Two rows are `DRIFTED` and both tracker halves landed** (`RAW-STRING-CENSUS-RETIRED`, `UNDO-REDO-DESTROY-STATUS-CLOSED-AT-0.5.1`) — a fork crossing the same pin must re-read them rather than assume the ladder is behaviour-neutral |
| 23 | **`U-CI-DIVERGENCE-LEG`** (`A3`) | `docs/specs/ci-divergence-leg.md` (+ `docs/specs/ci-ui-leg.md`) | `scripts/electron-divergence.mjs`, `scripts/electron-ui.mjs`, `scripts/electron-spawn.mjs` | the **repeatable** divergence leg (`N = 9` pinned structural surfaces + a separately tallied attribute observation) and the real-DOM measurement leg | **YES — harness/config** | CONFIG-ONLY. **`N = 9` cannot absorb a new check** (a new assertion routed through the harness's `ok(...)` helper is a **pin drift**, not a pass); the attribute extractor compares **names present**, never values, and is **not** a geometry/style/layout check |

**Cross-check (the guide's own honesty).** Every module named in this section was verified present in
`Provident-Electron/src/shared/` this pass. `docs/guide/README.md`'s "21 DONE / 0 open" ledger line is
corroborated by `docs/next-steps.md`'s own closing block (the ledger is closed at 21 units, the open set
empty) — **no guide-vs-tree gap in this section.**

---

## §6 The foundation's MCP surface additions vs the fork's own census

| Item | Foundation (read) | Fork (read) | Consequence for the rebuild |
| --- | --- | --- | --- |
| `ALL_TOOLS` size | **22** static names — `provident.dispatch`, `provident.focus`, the four read tools, the seven `provident.code.*` names, the six graph names, the three `module.*` names (`src/main/mcp-server.ts` → `ProvidentMcpServer.ALL_TOOLS`) | **57** quoted dot-bearing names in the fork's own `ALL_TOOLS` array (`src/main/mcp-server.ts`), including fork-only families: `provident.get_journal`, `rag.*`, `edit.*`, `code.template.*`, `gnosis.*` | **the foundation's list is not a superset of the fork's, and the fork's is not a superset of the foundation's** — adopting the foundation's base surface **never** means adopting its tool list |
| `provident.focus` (**the 22nd tool**) | the foundation's 22nd member; args `{target?, newTab?}` with **any own enumerable key outside that set refused by a throw naming the key**; result `{activeId, entries, opened, refused?: {reason}}`; group `dispatch` (**ON by default**); deliberately **absent from `MUTATING_METHODS`** so no `resources/updated` fires and none of the four reading tools observe it | **the fork ALREADY ships `provident.focus`** (fork unit `U-SHELL-9a`), args `{target?: <typed union: document/search/graph/template/other>, tabId?, newTab?}`, routed `backend.invoke('focus', …)`, also not in the fork's mutating set | **R-1 — the sharpest collision in this adoption.** The two tools share a name and a group but **not** an argument contract. Adopting the foundation's tool silently refuses the fork's `tabId` and its typed target objects; keeping the fork's tool means the fork does **not** adopt element 11 at all. **This is a decision, not a deletion** |
| `RpcMethod` | gains `'focus'` (foundation `21 → 22`) | the fork's own union carries the same member for its own tool | the type wall is satisfied either way; the **semantics** are what differ |
| Default-gate registered subset | `7 → 8` names | not read in this pass (**UNVERIFIED**) | the fork's gate table must be re-derived, not copied |
| Group set | **five** — `read` · `dispatch` · `graph` · `code` · `module`; the fork's own extra groups (`rag`, `edit`, …) are fork-side | the fork mints additional groups | the foundation's `focus` joins the **existing** `dispatch` group and mints **no** sixth group |
| Resources | **3** — `mcp://provident/app`, `/targets`, `/node/{nodeId}` (template), each mirroring a `read`-group tool | not read in this pass (**UNVERIFIED**) | adoption adds no resource |
| Push/notification | `notifyGraphChanged()` — **stdio-only**, a no-op when `read` is off | not read in this pass (**UNVERIFIED**) | — |

**`docs/specs/mcp-endpoint.md` disagreeing with the code.** The endpoint contract's `§3.8` heading still
reads *"`OWED — lands with `U-FOCUS-TOOL`; the tool DOES NOT EXIST YET`"* and its `§3` tool table and
`§6.2` group table do not carry the focus row, while `src/main/mcp-server.ts`'s `ALL_TOOLS` carries
`provident.focus` and `src/main/security.ts`'s `TOOL_GROUPS` maps it to `dispatch`. `docs/guide/focus-tool.md`
*Gotchas* reports exactly this and says the page follows the code. **Reported as finding `G-3` in §7** —
a fork reading `mcp-endpoint.md` as the authority would conclude the tool does not exist.

---

## §7 Findings — guide vs tree, guide vs spec, spec vs module

| # | Kind | Finding | Both citations |
| --- | --- | --- | --- |
| **G-1** | guide-internal staleness | `docs/guide/gutter-ui.md`'s *See also* calls `docs/guide/gutter.md` and `docs/guide/seams.md` *"not yet written"*, and `docs/guide/theme.md`'s *See also* calls `docs/guide/theme-control.md` and `docs/guide/seams.md` *"planned"* — **all three files exist** (verified by directory read: the guide holds 16 pages incl. `gutter.md`, `seams.md`, `theme-control.md`) | `docs/guide/gutter-ui.md` *See also* · `docs/guide/theme.md` *See also* vs `docs/guide/` (file list) |
| **G-2** | guide-internal inconsistency | `docs/guide/README.md` says *"Pages 05-12 are named after the unit id in kebab form"* — **no file in `docs/guide/` carries a numeric prefix** except `00-base-surface.md` | `docs/guide/README.md` (the *"The pages"* block) vs the `docs/guide/` file list |
| **G-3** | spec vs code | `docs/specs/mcp-endpoint.md` §3.8's heading and its §3/§6.2 tables still describe `provident.focus` as `OWED — the tool DOES NOT EXIST YET`, while the landed code carries it in `ALL_TOOLS` and maps it to `dispatch` | `docs/specs/mcp-endpoint.md` §3.8 (heading + status block), §6.2 · `src/main/mcp-server.ts` → `ProvidentMcpServer.ALL_TOOLS`, `src/main/security.ts` → `TOOL_GROUPS` row `'provident.focus'` (the guide reports the same disagreement at `docs/guide/focus-tool.md` *Gotchas*) |
| **G-4** | spec vs module | `docs/specs/gutter.md` §2.1's code block declares an **exported** `SizeFor` type and a `readonly sizeFor?: SizeFor` member, while `src/shared/gutter.ts` exports **no** `SizeFor` name (verified: zero occurrences of the identifier as a declaration in the module) and declares `sizeFor` inline on `ResizeControllerOptions`. The guide flagged this as `unverified`; **this pass verifies the disagreement** | `docs/specs/gutter.md` §2.1 (the surface block, and its §7a citation of `SizeFor`) · `src/shared/gutter.ts` (export census) |
| **G-5** | spec vs module | `docs/specs/overlay.md` pins the identity `removal === (value !== true)` and asserts it on every register drive (§2.4 item 2, §0A note 2, the semantics table), while the **set arm's** `value` is the **string** `'true'` — so the printed identity is not satisfiable as a strict equation on that arm. The unit's own DONE row records it as an owed clause-level note, and the guide repeats the caveat | `docs/specs/overlay.md` §2.4 item 2, §0A note 2, the semantics table · `src/shared/overlay.ts` → `overlayInertDeclaration`'s returned pair (guide: `docs/guide/overlay.md` *Gotchas*) |
| **G-6** | verification staleness | `docs/specs/menu-template-greens.md` was authored against an **earlier module revision** and its own `POST-GREEN` clause records a **targeted re-drive as OWED** — so its `26 PASS / 2 FAIL / 6 NOT-BLIND-RUNNABLE` census **must not be quoted as a reading of the current tree** | `docs/specs/menu-template-greens.md` (its `POST-GREEN` clause) · the unit's DONE record in `docs/next-steps.md` (the same carry) |
| **G-7** | test-vs-spec contradiction | `docs/specs/gutter.md` §3.5 `R-16` declares a RED form **and** a GREEN form, but the landed row implements only the **RED** form — it fails *because* the module exists. The foundation carries this as a pending item whose remaining half is a **TestWriter repair** | `docs/specs/gutter.md` §3.5 `R-16`, §4.2 item 1 · `docs/pending.md` (`E3`-BLOCK-1 row) |
| **G-8** | open reconciliation | `src/shared/zones.ts` checks the **callable-`get` duck-type branch before** the array/`Set` exclusion, while `docs/specs/zones.md` §2.3 item 2 (a) supports the callable-`get` branch and its operative clause says an array or `Set` answers `false` "even when its `get` is callable". **No row of `tests/zones.test.ts` drives an array or `Set` carrying a callable `get`** — the guide reports the same gap and marks it `UNVERIFIED` | `src/shared/zones.ts` → `isEmpty` · `docs/specs/zones.md` §2.3 item 2, §0A note 3 (guide: `docs/guide/zones.md` *Gotchas*) |
| **G-9** | fork-facing contract incomplete **at source** | Several units' **fork-facing** seam blocks/glossaries are recorded `OWED` in the foundation's own tracker — `U-CONTAINER` two-edge seam block + glossary (§L-4e), `U-RELOCATE` seven seams (§L-4b), `U-MENULIB` adopted names + picker seam + glossary (§L-4f), `U-OVERLAY` carry (§L-4h), `U-FOCUS-TOOL` seam/glossary (§L-4m). **Measured: `docs/FORKER.md`'s row for `U-CONTAINER` carries no seam block.** So a fork's per-element seam table must be taken from the **unit's guide page + spec**, not from `docs/FORKER.md` | `docs/pending.md` §L-4b/§L-4e/§L-4f/§L-4h/§L-4m · `docs/FORKER.md` (the per-unit table) · the guide pages of §2 (which state the same `OWED` status) |
| **G-10** | guide claim **VERIFIED TRUE** (recorded so it is not re-litigated) | `docs/skills/designing-pages.md` does **not** exist — `Provident-Electron/docs/skills/` holds `process-guardrails.md` alone, and the theme-control contract records the obligation as a **gap, not performed** | `docs/specs/theme-control.md` §3.4 R-9, §7a.1 item 4 · `Provident-Electron/docs/skills/` (file list) |
| **G-11** | guide claim **VERIFIED TRUE** | `docs/guide/theme.md`'s *"this unit has no seams, because the module's import census is empty"* — confirmed: `src/shared/theme.ts` contains **zero** import statements. The same zero-import census is confirmed for `overlay.ts`, `container.ts`, `menu-template.ts`, `zones.ts` and `focus-model.ts`; `gutter.ts` and `relocate.ts` each carry **exactly one type-only import** from `./gesture-session.js` | `docs/guide/theme.md` *What a fork must supply* · `src/shared/{theme,overlay,container,menu-template,zones,focus-model,gutter,relocate}.ts` (import censuses) |
| **G-12** | guide claim **VERIFIED TRUE** | `docs/guide/menulib.md`'s claim that the renamed builder's retired name `buildMenuFromCatalog` appears nowhere in the landed module — confirmed: the identifier occurs only in `tests/menu-template.test.ts` (as a provenance constant) and **not** in `src/shared/menu-template.ts` | `docs/guide/menulib.md` *What it is* · `src/shared/menu-template.ts` (export census), `tests/menu-template.test.ts` |

**No finding in this section was fixed by this pass** — this is a read-only inventory, exactly one file
was written, and every finding above is handed to the rebuild supervisor with both citations intact.

---

## §8 Foundation verification state per element, **with its layer**

The foundation's artifacts are `*-greens.md` (blind scenarios), `*-live-battery.md` /
`*-live-status.md` (the live/`[U]` legs) and the per-unit DONE records in `docs/next-steps.md`. **A
foundation green is a green on the foundation's declared layer only.** The recurring pattern, stated by
the foundation itself, is: the node suite and the blind greens verify the **provident-envelope / pure
authoring model**; the dom-shim is deliberately layout-less and CSS-less, so shell CSS/grid/window, the
runtime stage assembly and the live persistence round-trip are **structurally unassertable in node**.

| Element | Blind greens (artifact · read census) | Live / `[U]` state | Layer the green actually covers |
| --- | --- | --- | --- |
| `U-THEME` | `theme-greens.md` · 32 = 32 PASS / 0 FAIL / 7 NBR | **none declared** (the `ui` leg row is not offered) | `[T]` pure — **not** an applied attribute, stylesheet, rendered control or OS preference |
| `U-THEME-CONTROL` | `theme-control-greens.md` · 23 = 23 PASS / 4 NBR | **`theme-control-live-battery.md` — RUN** (revision `c65c475`): `start:http` boot, pre/post `node-state`, dispatch, `targets`; findings `FINDING-1`/`-2` | `[T]`+`[H]`+**`[U]`** — the strongest assembled-layer evidence in this set; and even here the visible effect is the **state node's text only** (structural `NOT-OBSERVABLE` row `U-6`) |
| `U-OVERLAY` | `overlay-greens.md` · 26 = 21 executed (21 PASS) + 5 NBR | **none** — `[U]` row refused three-part; `[D]` not claimed | `[T]` pure |
| `U-MENULIB` | `menu-template-greens.md` · 28 = 26 PASS / 2 FAIL / 6 NBR — **`POST-GREEN` re-drive OWED** | **none** — `[U]` not offered, gate 6 `STRUCTURAL` | `[T]` pure; **no** evidence a native menu exists, an item appears, an accelerator fires, or that a menu and a picker are equivalent |
| `U-CONTAINER` | `container-greens.md` · 24 = 24 PASS / 0 FAIL / 4 NBR (its NBR classes are all static byte scans **and** every rendered/applied/computed fact) | **none** — gate 6 `STRUCTURAL`; **the unit's own gate-9 live run is `OWED`** in its DONE row | `[T]` pure |
| `U-RELOCATE` | `relocate-greens.md` · 23 = 23 PASS / 4 NBR + 1 type row | **none** — no `[U]` row, no `[D]` row | `[T]` pure; **the fork must produce its own live readings** |
| `U-GUTTER` | `gutter-greens.md` · 93 = 87 PASS / 4 FAIL / 2 NBR | **none** — no importer of its own, so nothing rendered is asserted | `[T]`/`[H]` |
| `U-GUTTER-UI` | `gutter-ui-greens.md` · the unit's `84` rows + the blind set | **`gutter-ui-live-battery.md` — `OPEN / LIVE-PENDING`, NOT a pass:** leg 5 `PRECONDITION-FAILED` (exit 2); the precondition `npm run divergence` is **RED (exit 1, 5 of 9 checks failing)**; six live findings contradict the filed `§5.U` Post observations; three `MANUAL OPERATOR` rows owed | `[T]` green / **`[U]` OPEN** |
| `U-ZONES` | `zones-greens.md` · 67 = 57 PASS / 2 FAIL / 8 NBR | **none** — it is in no built bundle (verified: its only consumer `census.ts` is itself imported by no `src/**` file) | `[T]` pure |
| `U-FOCUS-MODEL` | `focus-model-greens.md` · 28 = 26 PASS / **2 FAIL** / 8 NBR (neither FAIL converted) | **none** — no real-DOM row offered, no `[D]` row claimed | `[T]` pure; no row may be read as "anything was focused" |
| `U-FOCUS-TOOL` | `focus-tool-greens.md` · 18 = 18 PASS / 0 FAIL / 1 NBR **+ 13 claims that cannot be run blind** | the tool's own suite drives a **recorder backend**; two `§5.U` rows are **structurally not observable** | `[T]`/`[H]` — the landed wiring's values are a **read of the wiring**, not a pinned value |
| parity surface | `ci-divergence-greens.md` (a **set**, not a run) · `ci-ui-leg-greens.md` · 26 = 16 PASS / 4 FAIL / 6 NBR (corrected enumeration 32 = 24/4/4) | `ci-ui-leg-live-status.md`, `engine-pin-live-status.md` — `[U]`/`[D]` records exist | `[D]`/`[U]` — **silent on IPC, layout and geometry**; a `ui` green proves one probe in one real boot |
| no-guide units | `gsession-greens.md` 77 = 66/2/9 · `census-greens.md` 77 = 59/6/12 · `projection-greens.md` 75 = 69/2/4 · `listhost-greens.md` 57 = 54/0/3 · `slothost-greens.md` 58 = 57/1/0 · `mount-invariant-guard-greens.md` 56 = 48/2/6 · `engine-pin-greens.md` 104 = 96/0/5 · `engine-drift-greens.md` 51 = 42/3/6 | `engine-pin-live-status.md`, `ci-ui-leg-live-status.md` | `[T]`/`[H]`/`[P]`, with `[U]` only where a leg invokes it. **`U-GSESSION`'s gate 6 is `PARKED/STRUCTURAL`** — the assembled app cannot reach the module — and **`U-MOUNTGUARD`'s probe refuses a real-DOM mount** |

**The one sentence a rebuild supervisor must carry forward:** *no foundation green in this table may be
reported as app-green for the fork.* The foundation's own DONE records, guides and `docs/FORKER.md` states
this per unit; the assembled-layer evidence for the shell mechanisms is **one** run battery
(`theme-control-live-battery.md`) plus the two harness legs, one of which is `OPEN` on a **red** divergence
precondition.

---

## §9 The fork-side delete/keep ledger (the SC/SCH → foundation-unit map)

The fork's own work package maps its requests to the foundation's units —
`docs/feature-requests/provident-electron-shell-chrome-handoff.md` §3 (`SCH-1..SCH-13`) and the
foundation's disposition record `docs/specs/provident-electron-shell-chrome-handoff-review.md`
(`S-d8`…`S-d15`, `H-r14`…`H-r20`, the per-item table):

| Fork request | → foundation unit(s) | Fork implementation to delete (from `docs/FORK-DIVERGENCE.md` §2) | Which half the fork KEEPS as the adapter |
| --- | --- | --- | --- |
| `SCH-1` (`SC-1`) `SHELL-REGION-HOST` | **`U-MOUNTGUARD`** (invariant half) — **the region-host half is DECLINED** (consumer vocabulary + an unverifiable criterion) | the stale-mount sweep in `src/renderer/runtime.ts` → `tearDownGraph` (defect `STALE-MOUNT-PUSHES-CANVAS`) | the fork's region markup (`#tab-strip`, the four `.gutter[data-zone][data-axis]`, `#settings-modal` + scrim) — it stays hand-authored markup, because the region host was declined |
| `SCH-2` (`SC-2`) `GESTURE-DELEGATE` | **`U-GSESSION`** | the gesture bookkeeping inside `src/renderer/renderer.ts` → `installShellPointers` and inside `pane-drag.ts`/`pane-gutter.ts` | the fork's `EventSource` and its hooks; **capture stays per-control opt-in and only after establishment** |
| `SCH-3` (`SC-4`) `THEME-TOKEN-LAYER` | **`U-THEME` + `U-THEME-CONTROL`** | `src/renderer/theme.ts` → `resolveTheme` (the precedence resolver) | the fork's `matchMedia` read, the `dataset.theme` write, the token block in `src/renderer/index.html`, and the persisted `theme` field (`UI-CONFIG-CARRIER`) |
| `SCH-4` (`SC-5`) `ZONE-TRACK-CONTRACT` | **`U-ZONES`** (+ `U-CENSUS`) | `src/renderer/layout-state.ts` → `zoneTrackCssVars` (the formatter) | the fork's zone names/spec map, `applyZoneTracks` as the write site, the `:has(.is-empty)` collapse CSS |
| `SCH-5` (`SC-7`) `MENU-CATALOG-CONTRACT` | **`U-MENULIB`** | `src/main/app-menu.ts` → `buildMenuTemplate`, `normalizePaneCatalog`, `orderPaneCatalog` | `importSelectionFromDialog`, `IMPORT_DIALOG_FILTERS`/`PROPERTIES`, the `Menu`/`setApplicationMenu` composition, the picker closure. **The foundation's own record says the fork must WITHDRAW four requests (`SCH-2`, `SCH-5`, `SCH-8`, `SCH-11`) and update its `docs/pending.md`/`docs/decisions.md` rows** |
| `SCH-6` `GUTTER-RESIZE-CONTROLLER` | **`U-GUTTER`** (+ `U-GUTTER-UI`) | `src/renderer/pane-gutter.ts` → `createGutterController`, `clampGutterSize`; the hand-written gutter DOM/preview/cursor code in `installShellPointers` + the `.gutter[…]` markup | `GUTTER_ZONES`, `gutterAxis`, `gutterBounds`, `isGutterResizable`, `setZoneSize`, the commit write; the preview and cursor writes |
| `SCH-7` `PANE-RELOCATE-GESTURE` | **`U-RELOCATE`** | `src/renderer/pane-drag.ts` → the drag session, capture/cancel/revert and the proximity test (`withinSnapThreshold`) | `legalZonesForScope`, `dropZoneForPoint`, `toZoneBounds`, `insertionIndexForPoint`, `movePane`, the reveal write, the single commit. **`threshold`'s referent is the foundation's architect ruling, not the fork's snap constant** |
| `SCH-8` `LAYOUT-STATE-PROJECTION` | **`U-PROJ`** (+ `U-CENSUS`) | `src/renderer/layout-state.ts` → `layoutCssVars`/`zoneTrackCssVars` (the JS-written custom-property computation) | the fork's `applyLayoutToRoot`/`applyZoneTracks` as the **write sink**, its variable names/units and its census |
| `SCH-9` `SHELL-STATUS-CARRIER` | **`U-SLOTHOST`** (host half only — **the publisher/carrier half is DECLINED**: it authors content) | the fork's slot/status **host** mechanics | the fork's top-bar slot set, its status/warning **text** and its per-pane/per-zone semantics — all fork-owned |
| `SCH-10` `ZONE-CONTAINER-CHROME` | **`U-CONTAINER`** | nothing (there is no fork module) | the fork's mirror-class taxonomy (`is-empty`, `is-minimized`), its containment CSS and its class names |
| `SCH-11` `TAB-STRIP-SHELL` | **`U-LISTHOST`** | the fork's strip mount-ownership/order-projection half (`src/renderer/tab-strip.ts` → `TabStrip`; `src/renderer/pane-registry.ts`) | the fork's tab **content**, its `TabEntry`/`TabState` model, its single-active render rule |
| `SCH-12` (`SC-3`) `OVERLAY-FRAME-PRIMITIVE` | **`U-OVERLAY`** | `src/renderer/modal-state.ts` → `createModalController`'s state/verb discipline | the frame + **dedicated scrim** markup/CSS, `installSettingsModal`, the Escape/focus-restore host work, the applied inert write. **The re-parent half and the focus trap are REFUSED by the foundation** — the fork's `MODAL-SETTINGS-REPARENT`/`MODAL-DEDICATED-SCRIM` decisions and its focus-trap gap stay fork-owned |
| `SCH-13` (`SC-6`) `FOCUS-SEAM` | **`U-FOCUS-MODEL` + `U-FOCUS-TOOL`** | `src/renderer/tab-state.ts` → `focusTarget` and its surrounding transitions — **and, for the tool, the fork's own `provident.focus` handler is the DECISION POINT (R-1)** | `TabTarget`/`TabEntry`/`TabState`, `TAB_STATE_VERSION`, `TAB_LANDING`, the persisted `OperatorSettings.tabs`, `TabStrip`, and the fork's find-or-open policy over **typed** targets |
| — (A-d2, the engine prerequisite) | **`U-ENGINE-PIN` → `U-ENGINE-DRIFT`** | the fork's older engine pin (state **UNVERIFIED** in this pass) | — (config) |
| — (A-d8, the harness) | **`U-REALDOM-BOOT` + `U-DIVERGENCE-EXT`** | the fork's `scripts/electron-divergence.mjs` one-shot behaviour | `scripts/live-drive.mjs` (the fork's live-battery driver) and `scripts/mcp-cli.mjs` |

**Two obligations the foundation's record places on the fork explicitly** (`H-r1`, `H-r6`): the fork must
**withdraw** the four now-owned requests (`SCH-2`, `SCH-5`, `SCH-8`, `SCH-11`) in its own `docs/pending.md`
and `docs/decisions.md`, and it must **carry the `H-r9` refile note** — `SCH-2`'s criterion #3 *"no
capture"* becomes *"no capture **before establishment**"*, and its `lostpointercapture` half becomes
conditional on the per-control opt-in, with the otherwise-case re-pointed to `pointercancel` + a
window-leave path.

---

## §10 The UNVERIFIED list, and what would settle each

| # | Unverified claim | Why | What would settle it |
| --- | --- | --- | --- |
| U-1 | that a **static** `'../src/shared/<x>.js'` **value** import from a new `tests/` file resolves in the fork | the foundation's own guide marks it `unverified`; its unit suites deliberately use a **dynamic** import so an absent module reddens a row instead of failing the file | run one snippet under the fork's `npx vitest` |
| U-2 | the fork-side **runtime** behaviour of every seam (absence/non-callable/throwing) | this pass read foundation bytes and fork file lists only; no fork harness was run | the fork's own seam rows |
| U-3 | the array/`Set`-with-callable-`get` reconciliation in `U-ZONES` | no foundation row drives that shape (finding `G-8`) | one row driving an array and a `Set` carrying a callable `get` |
| U-4 | the **assembled-app** behaviour of every unit except `U-THEME-CONTROL` (§8) | the foundation's greens are `[T]`/`[H]`; `gutter-ui-live-battery.md` is `OPEN` on a red divergence precondition | the foundation's own live battery; the fork's live-driver rows |
| U-5 | whether `docs/specs/mcp-endpoint.md` §6.2/§3.8 were later amended | this pass read §3.8 and the guide's report, not every section of that file | a full read of `mcp-endpoint.md` (finding `G-3`) |
| U-6 | the fork's own engine pin / `provident-ssr` version state | not read in this pass | read the fork's manifest + lockfile |
| U-7 | the default-gate registered subset and the resources in the **fork** | not read in this pass | read the fork's `security.ts`/`mcp-server.ts` |
| U-8 | `U-THEME`'s `prefersDark` matching a real OS setting | **structurally unobservable in the foundation** — the module reads no OS and no media query | a unit that owns an OS/rendered surface |

---

## §11 What a rebuild supervisor must decide before deleting anything

1. **`provident.focus` — one name, two contracts (R-1).** The fork's tool takes a typed `target` union plus
   `tabId`; the foundation's refuses any own enumerable key outside `{target, newTab}`. Decide: adopt the
   foundation tool (and re-home the fork's find-or-open policy into a renderer holder), or keep the fork's
   tool and record the divergence. **No other element in this inventory has this shape.**
2. **Every adoption is a NARROWING, not a swap.** The foundation refuses or declines: the overlay's
   re-parent half and focus trap · `SCH-1`'s region host · `SCH-9`'s publisher/carrier half · any
   coordinate/geometry read in `U-GUTTER`/`U-RELOCATE` · `U-THEME`'s precedence rule · `U-MENULIB`'s
   menu/picker equivalence · `U-ZONES`/`U-CENSUS`'s write · `U-FOCUS-MODEL`'s storage. Each refused half
   must be **explicitly re-homed in the fork** before its local implementation is deleted.
3. **The foundation's greens are envelope-layer.** Report each verification with its layer (§8); the only
   assembled-layer evidence here is one run live battery and one `OPEN` one. **A node-green is never
   "the app works".**
4. **Nine fork-facing seam blocks are `OWED` at source** (finding `G-9`) — take each unit's seam contract
   from its guide page + spec, and treat `docs/FORKER.md`'s silence as silence.
5. **Two units already ship an adoption dossier** (`U-FOCUS-MODEL`, `U-FOCUS-TOOL`) — read them as the
   first input for those two, and re-derive the fork-side collision half for all nine `D-1` elements (§4).
