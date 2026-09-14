# Unit U-SHELL-1 — Layout Model + Zones + Persistence (C4/C5/C7/C12 mechanics; C9 layout slice) — Spec

**Status:** GREEN (IMPLEMENTED 2026-09-12). Gate: the
UI-overhaul umbrella gate `docs/specs/ui-overhaul-review.md`
(PROCEED-WITH-AMENDMENTS, A1: every unit needs its own spec + a TestWriter red
set). Resolutions honoured: **OB2 = Reading 2** (`ui-overhaul.md` §7.3) and
**C9 carrier = extend `OperatorSettings`** (`UI-CONFIG-CARRIER`, §7 Q24 / §3.2).
Open items live in `docs/specs/wave-2-open-decisions.md` (W2-Q1..).

**Cycle (RCA-1/2/3):** TestWriter red 34 (of 37) → Implementer green 35 pass + 2
skip (`tests/unit-u-shell-1-layout-zones.test.ts`); adversarial pass found **H1**
(id-only zone-container defeats the F8 HARD PRECONDITION; MCP-reachable) + **AF-2**
(malformed `version`) — both **FIXED** with regression tests; **AF-3/AF-4** were
deferred → W2-N3/W2-N4 and are now **FIXED (2026-09-12)**. Blind-greens `docs/specs/unit-u-shell-1-layout-zones-greens.md`
(27 scenarios; P8's initial doc-side FAIL reconciled via the pin-8 amendment). Full
suite **174 files / 3997 pass + 46 skip**, typecheck 0, build OK. Follow-ups
**W2-N1** (host boot/write-through), **W2-N3** (apply `ZoneLayout.size`),
**W2-N4** (operator-pane grid-area dead rule) are all **FIXED (2026-09-12)** —
see `wave-2-open-decisions.md` §D. This unit is the **keystone of
Wave 2** and **gates U-SHELL-3/4/5/8/9** (§8.1).

---

## 1. What the proposal asks

The app assembles every pane into one fixed `[sidebar]` zone
(`pane-graph.ts` `SIDEBAR_ZONE`, `assembleAppGraphEnvelope`);
`index.html` is a fixed `1fr 1fr` grid; there is **no layout model, no zones, no
per-pane placement, and no persistence** (SG5). Deliver the layout substrate:

- a serialized **`LayoutState`** model (zones / per-pane entry / version);
- the **zone-container authoring** in the app graph (Reading 2: zone containers
  + pane roots are provident, MCP-visible);
- the **shell grid geometry** (top-bar / header / left | stage | right / footer)
  as Table C shell chrome;
- **persistence** of the layout through the C9 `OperatorSettings` carrier;
- the **default / empty** behavior.

## 2. Contract (pinned)

### 2.1 `LayoutState` model

```
LayoutZoneName = 'left' | 'right' | 'header' | 'footer'   // pane zones
RegionName     = 'stage' | 'top-bar'                      // regions, not drop targets

PaneLayoutEntry { id: string; zone: LayoutZoneName; order: number; collapsed: boolean }
ZoneLayout      { size: number; minimized: boolean }       // C7 size + C12 minimize
LayoutState {
  version: number                                          // starts at 1
  panes:   PaneLayoutEntry[]                               // placement overlay only
  zones:   { left: ZoneLayout; right: ZoneLayout; header: ZoneLayout; footer: ZoneLayout }
  stage:   { size: number }                                // serialized 1fr weight
  topBar:  { size: number }                                // shell height (not a pane zone)
}
```

- **Source of truth split (Reading 2):** the serialized `LayoutState` is
  authoritative; the graph **mirrors** the state-derived facts
  (`is-empty`/`is-revealed`/`is-minimized`/`is-collapsed` classes). Pane
  *existence* stays the host `PaneRegistry` (`PANE-REGISTRY`); the overlay never
  invents panes.
- **Per-pane vs per-zone granularity:** `collapsed` is per-pane (C5);
  `minimized` + `size` are per-zone (C12/C7). See W2-Q1.
- **Default placement** is derived from the registry (`defaultZone` /
  `defaultOrder`, additive on `PaneDefinition`) — see W2-Q4. The legacy single
  `[sidebar]` maps to `left`.
- `stage`/`top-bar` are **regions, not pane zones**; they are serialized for
  geometry restore but are never drag/drop targets (W2-Q2).

### 2.2 C9 layout slice — extend `OperatorSettings`

- `OperatorSettings` gains `layout: LayoutState` (additive). The store
  `sanitize`/`set` path gains a `coerceLayout` mirroring `coerceTheme` /
  `coerceEditingMode` — **versioned + fail-soft**: unknown/missing fields fall
  back to defaults; a corrupt layout never crashes boot.
- `OperatorSettingsPatch` gains `layout?`; the operator-settings IPC transports
  it unchanged. **Credentials are never serialized here** (carrier rule).
- The layout is **operator-scoped / not MCP-exported**; only the derived graph
  mirror (classes) is visible. See W2-Q16.

### 2.3 Zone-container authoring (provident — Reading 2)

- `assembleAppGraphEnvelope` generalizes from one `sidebar` producer to one
  `container`-role producer per zone (`zone:left`, `zone:right`, `zone:header`,
  `zone:footer`) with **stable node identity**, plus the content-root producers.
  The HARD PRECONDITION holds: every `targetPlacement` names a container that
  exists in the same envelope/hub.
- Each enabled pane renders as `pane-<id>` with
  `placement: { targetPlacement: [<zone>] }` (`paneSubtreeRoot`), in
  `PaneLayoutEntry.order`.
- Each zone container carries the **state-derived mirror**: an `is-empty`
  class when the zone has **zero enabled+placed panes (post-overlay/fallback
  resolution)** (C11), `is-minimized` when `minimized` (C12),
  and a revealed marker during a drag (C11). The mirror is written as ONE
  managed write (state-slice `css.classes` / a hook) at gesture/state change,
  never a per-frame stream.
- **U-STATE-1 preservation (OB5/§7.3):** the reconciler must preserve
  `zone:*` container nodes + pane roots across a RAG content change.
- **Legacy compatibility (2026-09-12):** the single `sidebar` producer is
  **retained alongside** the four `zone:*` containers (runtime traversal content
  may still target it) — U-SHELL-1 **adds** the zone producers rather than
  removing `sidebar`, so the existing `sidebar-panes` tests stay valid.

### 2.4 Shell grid geometry (Table C — shell chrome)

- `index.html` body becomes a CSS grid: `top-bar` row → `header` zone row →
  main row (`left` | `stage` | `right`) → `footer` zone row. Gutters between the
  columns/rows are shell geometry (U-SHELL-5 owns their drag; U-SHELL-1 owns the
  tracks).
- Zone geometry reads `ZoneLayout.size`; an empty zone's track collapses
  (derived from `is-empty`); a minimized zone's track collapses to its tab
  strip (C12, U-SHELL-4).
- The `stage` is the largest cell; its content gets the content-scope boundary
  (Q5 — token/class, no shadow DOM v1).

### 2.5 Persistence, boot, default & empty behavior

- **Boot:** read `OperatorSettings.layout`; sanitize; if absent/corrupt derive a
  default layout from the registry defaults; render the zones.
- **Write-through:** a layout mutation (SHELL-3/4/5/8/9) commits once through
  `bridge.operatorSettings.set({ layout })`; the main store persists through its
  existing `persist()` discipline (a direct write — atomic temp+rename is not part
  of this slice; the host boot/write-through itself is **W2-N1 OPEN**).
- **Content changes** (§3.1) never re-derive or re-persist the layout; it
  survives in the graph + store (C10).
- **Empty:** a zone with **zero enabled+placed panes (post-overlay/fallback
  resolution)** renders present but `is-empty` (hidden track,
  C11-revealable); zero panes overall → the stage reclaims all zone space.

### 2.6 Pinned implementation details (resolved 2026-09-12, post-TestWriter)

The TestWriter red run (`tests/unit-u-shell-1-layout-zones.test.ts`, 34 red)
flagged 8 spec gaps. Pinned (Architect):

1. **`coerceLayout` home/export** — a **public export of
   `src/renderer/layout-state.ts`**, which owns the `LayoutState` types +
   `defaultLayout` / `deriveLayout` / `coerceLayout` (mirrors how `coerceTheme`
   is the store's private helper, but this module is shared).
2. **Assembler input name** — `assembleAppGraphEnvelope({ layout })`; `layout`
   is optional and omitted → derive the default from the registry.
3. **Order observable** — `PaneLayoutEntry.order` manifests as the **payload
   order** panes are attached to a zone container; no `data-order` prop.
4. **Mirror placement** — `is-collapsed` on the `pane-<id>` root;
   `is-empty` / `is-minimized` / `is-revealed` on the `zone:<name>` container.
5. **Size validity** — a `size` must be a **finite positive number**; an invalid
   value (`≤0`, `NaN`, `±Infinity`) fails soft to that zone's default. A finite
   positive size is **preserved** on load (e.g. a `header`/`footer`/`topBar`
   strip of 36–48 px). Drag-time min/max clamps are U-SHELL-5's concern, not
   U-SHELL-1's.
6. **F2 warning channel** — a dropped unregistered pane is reported via
   `console.warn` (host); it never creates a phantom node. No graph surface.
7. **Unknown-zone default** — an unknown `zone` value coerces to **`left`**
   (matches §2.1: the legacy `[sidebar]` maps to `left`).
8. **Grid mechanism** — `index.html` uses CSS
   `grid-template-columns` / `grid-template-rows` / `grid-template-areas` with
   named areas `top-bar`, `header`, the mid row's three tracks
   `left` / `stage` / `right`, and `footer` (the mid row has **no** composite
   `main` area name — consistent with §2.4 `left | stage | right`). (Reconciled
   after the blind-test P8 finding, 2026-09-12.)
9. **Malformed `version`** — a non-integer, negative, or non-finite `version` is
   treated as **corrupt → derive defaults** (the same fail-soft path as
   `version > 1`). (Adversarial finding, 2026-09-12.)

## 2.7 Adversarial findings (2026-09-12)

Post-green read-only adversarial pass (`src/` host findings fixed here;
package findings → `docs/defects.md`/`docs/HANDOFF.md`).

| # | Sev | Finding | Disposition |
| --- | --- | --- | --- |
| **H1** | medium | **id-only zone-container match defeats the F8 HARD PRECONDITION (MCP-reachable).** `findZoneContainer` (`pane-graph.ts`) matched a container by `props.id === 'zone:<name>'` OR `placement.placementName === name`. The engine resolves `targetPlacement` only via a `placementName` anchor, so a template child with `id: 'zone:left'` but **no** `placementName` was kept as "the container", no real producer was added, and panes targeting `left` became unplaced-silent. Reachable by an MCP `code.template.set` (validate only checks the targeted `main` zone). | **FIXED here** — match/prefer by `placement.placementName`; a node matched only by `props.id` gets its `placementName` synthesized (or a real producer is added). Regression test added. |
| AF-2 | low | `version` guard rejected only `version > 1`; a string/negative/`NaN` version was silently accepted. | **PINNED §2.6 pin 9** (malformed version → defaults) + regression test. |
| AF-3 | low | `ZoneLayout.size` was not applied to the shell grid. | **FIXED (W2-N3, 2026-09-12)** — `layoutCssVars`/`applyLayoutToRoot` + `renderer.ts installLayout()`; `index.html` tracks read the CSS vars. |
| AF-4 | low | `index.html` operator pane: a higher-specificity `.layout #operator-panes { grid-area: right }` beat the spanning rule. | **FIXED (W2-N4, 2026-09-12)** — dead rule removed (C3: operator panes are modal-confined). |

**Confirmed-safe:** prototype pollution (`__proto__`/`constructor` at every depth
through `coerceLayout` + the store `sanitize`/`set`/persist); credential/field
leakage (unknown fields + `token`/`auth` dropped from memory and disk); total
coercion (`null`/`undefined`/`fn`/`[]`/arrays/non-string ids all safe, never
throws); sizes (`NaN`/`±Infinity`/`≤0` → default); panes (non-string/empty ids
dropped, duplicate first-wins, unregistered dropped + warn + no phantom);
zones (unknown/`stage`/`top-bar` → `left`); MCP visibility (envelope carries no
`layout`, no MCP reference to `OperatorSettings`); identity/order (stable
`zone:*` ids, finite `order` + `seq` tiebreak). **No package findings.**

## 3. States (TestWriter red set — valid paths)

1. Boot with no persisted layout → panes placed by registry defaults; the four
   `zone:*` containers exist as provident nodes (`list_targets`).
2. A persisted layout moving a pane to `right` → `pane-<id>` targets `right`;
   `left` order reflects the entries.
3. A persisted `collapsed: true` → the pane renders collapsed (header only) and
   the graph mirror carries the collapsed class.
4. A zone with zero panes → `is-empty` mirror; the shell collapses its track.
5. `stage`/`top-bar` sizes round-trip and restore on restart.
6. A RAG content change (U-STATE-1) leaves the `zone:*` node ids and pane roots
   unchanged.
7. A layout mutation round-trips through `operatorSettings.set` + `get`.
8. The layout is operator-scoped: it is not present in the app-graph legacy
   export / MCP-visible state.

## 4. Fail-states / edge cases

| # | Case | Pinned behavior |
| --- | --- | --- |
| F1 | corrupt/unknown `layout` JSON | fail-soft to the derived default; never throws |
| F2 | a `panes[]` entry names an unregistered pane | dropped + warning; no phantom node |
| F3 | an unknown `zone` value | coerced to the default zone |
| F4 | `size` invalid (`≤0`, `NaN`, `±Infinity`) | fail-soft to the zone default; never a negative/NaN track. A **finite positive** size is preserved as-is (drag-time min/max is U-SHELL-5's concern) |
| F5 | duplicate pane ids in `panes[]` | first wins (mirrors registry dedupe) |
| F6 | credentials in the store | never copied into `layout` |
| F7 | a layout write fails | the in-memory layout still applies for the session |
| F8 | a `targetPlacement` names a missing container | reassembled with its producer (the HARD PRECONDITION); never unplaced-silent |

## 5. The exhaustive contract (layout-state module surface + PBT register)

The pure module `src/renderer/layout-state.ts` — owner of the `LayoutState`
types (`LayoutZoneName`/`RegionName`/`PaneLayoutEntry`/`ZoneLayout`/
`LayoutPaneSpec`/`LayoutRoot`), the pinned constants (`LAYOUT_VERSION=1`,
`LAYOUT_PANE_ZONES`, `LAYOUT_REGIONS`, `LAYOUT_ZONE_MIN=160`/`MAX=640`,
`LAYOUT_REGION_MIN=120`/`MAX=1200`), and the helpers `isLayoutZoneName`,
`defaultLayout`, `deriveLayout`, `coerceLayout`, `layoutCssVars`,
`applyLayoutToRoot` — is a **CODE-BEARING unit**, so the property register below
is mandatory (§2 is the pinned authoritative contract; the register backfills the
invariant surface from the landed module).

### 5.7 Property register (PBT)

This register follows the **`docs/specs/unit-ujr1-get-journal.md` §5.7** and
**`docs/specs/unit-shell-integration.md` §5.7** convention: the identical
`| Ref | Class | Invariant | Strategy | Checkable proposition (∀ pattern) |`
row columns, the **P-IM** (input-model) / **P-SM** (state-model) / **P-TP**
(transform) typings, a ≤8-row cap, a class-tally line, and the deterministic
seeded property layer (≤100 generated cases / row, ≤400 total, stop-after-5 —
see the siblings' PBT-gate note). Rows are **invariant-only — NEVER F-rows** and
never §2.6/FS-n rows (this spec's fail-states already exist as §4 F1–F8). The
register is genuinely invariant-bearing: `coerceLayout` is a total, idempotent
fail-soft coercion; `isLayoutZoneName` is a total predicate;
`deriveLayout` is a pure deterministic projection; and the version gate,
coerced-state well-formedness, and pane-dedup rules are all observable from the
module's exported surface. Each proposition pins a behavior the **landed module
already has** — this is a backfill, so the register **cannot reject a correct
module**.

| Ref | Class | Invariant | Strategy | Checkable proposition (∀ pattern) |
|---|---|---|---|---|
| `P-IM-1` | IM | **`isLayoutZoneName` is a total predicate.** It returns `true` exactly for the four pinned pane zones and `false` for every other value. | `strat:zone-name-total` | ∀ generated value `v`: `isLayoutZoneName(v) === (v === 'left' \|\| v === 'right' \|\| v === 'header' \|\| v === 'footer')` — `true` for exactly the four zone names; `false` for every other string (`'stage'`, `'top-bar'`, `'sidebar'`, `''`, garbage) and every non-string (`null`, `undefined`, numbers, booleans, objects, arrays). |
| `P-IM-2` | IM | **`coerceLayout` is total — any input yields a valid `LayoutState` and never throws.** Null/undefined, a non-object, or a plain object carrying arbitrary deeply-nested junk all coerce to a well-formed state; no code path throws. | `strat:coerce-total` | ∀ generated (possibly malformed / deeply-nested) value `x`: `coerceLayout(x)` returns a `LayoutState` satisfying the §P-SM-2 shape and never throws. |
| `P-TP-1` | TP | **`coerceLayout` is idempotent.** Coercing an already-coerced result reproduces it exactly. | `strat:coerce-idempotent` | ∀ value `x`: `coerceLayout(coerceLayout(x))` deep-equals `coerceLayout(x)` (identical `version`, `panes`, `zones`, `stage`, `topBar`; pane order preserved; the second pass changes nothing). |
| `P-SM-1` | SM | **Version gating.** `coerceLayout` preserves/coerces the payload only when `version === LAYOUT_VERSION` (exactly 1); any other value — missing, non-integer, negative, zero, `> 1`, `NaN`, `±Infinity` — fails soft to `defaultLayout()`, never a newer-schema partial or a crash. | `strat:coerce-version-gate` | ∀ value `x` with a `version` field: a non-`LAYOUT_VERSION` version — missing, non-integer, negative, `> 1`, non-finite, or non-number — fails soft to `defaultLayout()` whenever `typeof version !== 'number'` OR `!Number.isInteger(version)` OR `version < 1` OR `version > LAYOUT_VERSION`; an exact-`LAYOUT_VERSION` payload is preserved — the output `.version === LAYOUT_VERSION` in BOTH cases (the fail-soft `defaultLayout()` result itself carries `.version === LAYOUT_VERSION === 1`, so no strict `⟺` biconditional on the gate). |
| `P-SM-2` | SM | **The coerced `LayoutState` is well-formed — only known fields, no invalid field, no duplicate pane id.** Every zone `size` is finite-positive, every `minimized` is a boolean, `stage`/`topBar` sizes are finite-positive, every pane has a non-empty string `id`, a valid zone, a finite `order`, a boolean `collapsed`, and pane ids are unique (first-wins dedup). | `strat:coerce-state-model` | ∀ value `x`, let `L = coerceLayout(x)`: `L.version === 1`; for each zone `z ∈ {left,right,header,footer}`: `Number.isFinite(L.zones[z].size) && L.zones[z].size > 0` and `typeof L.zones[z].minimized === 'boolean'`; `Number.isFinite(L.stage.size) && L.stage.size > 0`; `Number.isFinite(L.topBar.size) && L.topBar.size > 0`; ∀ pane ∈ `L.panes`: `typeof pane.id === 'string' && pane.id !== ''`, `isLayoutZoneName(pane.zone)`, `Number.isFinite(pane.order)`, `typeof pane.collapsed === 'boolean'`; and all pane `id`s are pairwise distinct. |
| `P-TP-2` | TP | **`deriveLayout` is a deterministic pure projection of the placement overlay.** The same specs yield the identical layout; each spec maps to exactly one pane, and the stated defaults (legacy `left` zone, registration-index `order`, `collapsed:false`) are applied. | `strat:derive-deterministic` | ∀ generated specs array `S` of length `N`: `deriveLayout(S)` twice returns deep-equal outputs; `panes.length === N`; for `i ∈ [0,N)`: `panes[i].id === S[i].id`, `panes[i].zone === (isLayoutZoneName(S[i].defaultZone) ? S[i].defaultZone : 'left')`, `panes[i].order === ((typeof S[i].defaultOrder === 'number' && Number.isFinite(S[i].defaultOrder)) ? S[i].defaultOrder : i)`, `panes[i].collapsed === false`; and `deriveLayout(S)` has `version === LAYOUT_VERSION` with `zones`/`stage`/`topBar` equal to `defaultLayout()`'s. |

**Class tally:** IM ×2, SM ×2, TP ×2 = **6 rows ≤ 8** ✔.

**SPEC NOTE (P-IM-2 totality scope):** the `coerceLayout` totality claim is scoped
to **plain-JSON / decodable (getter-free)** inputs. An accessor/proxy object with
a **throwing getter** can throw — a documented low seam (see the §2.7
Confirmed-safe totality claim); this does **not** add a register row.

**SPEC NOTE (extreme finite size):** an extremely large **finite** size (e.g.
`1e308`) survives `coerceLayout` (no clamp — the deliberate §2.6 pin-5 preserve)
and `layoutCssVars` renders invalid CSS `${1e+308}px`; a latent projection edge
masked by the **U-SHELL-5** drag clamps (S2). Tracker note only — no register
row.

The rows above are **NOT over-strength**: every proposition is directly observable
from the exported module surface (`isLayoutZoneName`, `coerceLayout`,
`deriveLayout`, the `LayoutState`/`PaneLayoutEntry`/`ZoneLayout` shapes) and the
pinned constants — none invents a field, none requires a new export, and none
reaches beyond the documented contract. Note the deliberate **omission of any
load-time clamp claim**: `coerceLayout` preserves finite-positive sizes
byte-for-byte (spec §2.6 pin 5) and does **not** normalize them into
`[LAYOUT_ZONE_MIN, LAYOUT_ZONE_MAX]` / `[LAYOUT_REGION_MIN, LAYOUT_REGION_MAX]` —
the default `header`/`footer` zone sizes (48) and `topBar` (36) lie outside those
ranges, and the constants are consumed only by the **U-SHELL-5** drag clamps
(`src/renderer/pane-gutter.ts`), not by U-SHELL-1 load coercion. A row asserting
`size ∈ [LAYOUT_ZONE_MIN, LAYOUT_ZONE_MAX]` after coerce would reject the landed
module, so none is registered. The register therefore cannot reject a correct
module.

### 5.8 Census

- 1 new layout module (`src/renderer/layout-state.ts` or `src/shared/`) with
  the `LayoutState` types + pure default/derive/coerce helpers.
- `OperatorSettings`/`OperatorSettingsPatch` + `operator-settings-store.ts`
  `sanitize`/`set` gain the `layout` slice.
- `pane-graph.ts` gains multi-zone container producers + per-zone placement;
  `PaneDefinition` gains additive `defaultZone`/`defaultOrder`.
- `index.html` gains the grid tracks; 0 new dependencies; no `provident-ssr`
  change.
- **Landed additions (W2-N1/N3 fixes, 2026-09-12):** `layout-state.ts` also
  exports `layoutCssVars` / `applyLayoutToRoot` (+ `LayoutRoot`);
  `SidebarPanes` gains a `layout` field + the `setLayout(layout)` write-through
  seam (→ `bridge.operatorSettings.set({ layout })`);
  `renderer.ts` gains `installLayout()` (mirrors `installTheme()`), reading the
  persisted layout + subscribing to `operatorSettings.onChanged`; `index.html`
  tracks read `var(--zone-*-size)` / `var(--stage-weight)` / `var(--top-bar-size)`.

## 6. Cross-references

- `docs/specs/ui-overhaul.md` §2 (Tables A/B/C), §3 (layout model), §3.1
  (content repopulation), §3.2 (C9), §5.7 SG5, §7.3 OB2, §8.1 (dependency DAG).
- Decisions: `UI-CONFIG-CARRIER`, `PANE-REGISTRY`, `PANE-PROVIDENT-AUTHORING`,
  `APP-GRAPH-PANES-MCP-VISIBLE`, `OPERATOR-ISOLATED-GRAPHSCOPE`.
- `docs/specs/unit-u-state-1b-host-application.md`,
  `unit-u-state-1c-persistent-scaffolding.md`, `unit-u-shell-2-appearance-tokens.md`.
- Build: `src/renderer/pane-graph.ts`, `src/renderer/pane-registry.ts`,
  `src/renderer/sidebar-panes.ts`, `src/main/operator-settings-store.ts`,
  `src/shared/types.ts`, `src/renderer/index.html`.

## 7. Delimitation

U-SHELL-1 lands the model + zones + geometry + persistence + the state-mirror
fold. It does **NOT** implement: the collapse interaction (U-SHELL-3), drag /
relocate / C11 proximity / C12 tab interaction (U-SHELL-4), gutter resize
gestures (U-SHELL-5), View-menu visibility (U-SHELL-8), or the top-bar tab strip
(U-SHELL-9). It must not change `editingMode`/theme or remount the operator
scope.

## 8. Open items

**None — all resolved 2026-09-12** (see `wave-2-open-decisions.md`).
- **W2-Q1** — per-pane `collapsed`; per-zone `minimized` + `size`.
- **W2-Q2** — `stage`/`top-bar` are **regions, not pane zones**.
- **W2-Q3** — zone nodes are **always-present** (not per-non-empty).
- **W2-Q4** — default placement from additive `PaneDefinition.defaultZone?`/
  `defaultOrder?` (else a scope-derived zone + registration order).
- **W2-Q5** — pane-additive assembly reuses the U-STATE-1 pane reconcile
  (detach = invisible to MCP; no full `loadEnvelope` on a visibility toggle).
- **W2-Q16** — `layout.version:1`; deep-sanitize + unknown fields ignored;
  version>known → defaults; no explicit migration now; drop unknown pane ids;
  per-zone fail-soft; deep sanitize; apply clamps at load; **global**; NOT
  MCP-exported.
