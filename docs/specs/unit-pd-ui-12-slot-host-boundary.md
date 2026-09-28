# Unit `PD-UI-12` — the SLOT-HOST BOUNDARY (the HEAD of Phase 1): which hosting responsibility stays in `src/renderer/sidebar-panes.ts`, which would move onto the vendored `slot-host.ts` / `owned-list-host.ts`, and which is NEITHER — Spec

**Status: BOUNDARY SPEC FILED — 2026-09-28. NO CODE LANDED, NO TEST LANDED, NOTHING RUN BY THIS PASS.** This
pass had **no shell**: it read trees, `grep`ped and `ls`ed, and wrote **this one file plus two anchored tracker
appends** (`docs/next-steps.md`, `docs/pending.md`). **No `npm test`, no `npm run build`, no leg, no trio.**

**⟨WHAT THIS FILE IS, in one sentence.⟩** It is the **boundary record** that the architect's
`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (2) ordered to exist **before any Phase-1 row**:
it **settles where the boundary falls** for the keystone row `PD-UI-12` and **carries the region-box ruling**
(`A-10`) that makes the deferral safe. **It is a DOC unit, NOT a code unit** — §6 states the recorded `§5.x`
register exemption and its justification, and §4 is the layer ledger.

**Layer (RCA-12, mandatory declaration).** **DOC-LAYER for every claim in this file.** This spec asserts
**nothing** that is app-green, envelope-green, store-green, engine-green or live-green. **A node-suite green is
ENVELOPE-green, not APP-green** — and this unit does not even own a node-suite green: it adds **no** `src/**`
file and **no** `tests/**` file.

| Deliverable | The layer its evidence covers | What that layer does NOT prove |
| --- | --- | --- |
| the boundary decision (§1) | **DOC-LAYER** — a ruling recorded against read citations | that any code changes; that any row may now be delegated |
| the seam table (§2) | **DOC-LAYER** — signatures read from the **vendored** bytes and the foundation's own specs | that any seam is wired, or that its declared degradation ever fires in this repo |
| the region-box ruling carriage (§1.3) | **DOC-LAYER** — a ruling **quoted from the architect and cross-verified** against three foundation records and two inventories | that any markup is authored or removed |
| the sequencing consequence (§1.4) | **DOC-LAYER** — a derivation from the inventories' consumer maps | that any wave lands |
| the register exemption (§6) | **DOC-LAYER** — an exemption taken under an ACTIVE ruling | — |
| anything about the Electron app | **NOT CLAIMED ANYWHERE IN THIS FILE** | — |

**`npm run divergence` is RED at this branch head for an ENVIRONMENTAL reason** (`/dev/shm` denial → Electron
`SIGTRAP`; proposal §7.5; `PD-VENDOR` §8) and `A-7` makes it a **mandatory pre-live leg** — so **no live
battery can honestly be claimed green by any unit until the harness fix lands** (its own owed unit, §9 item 1).
**This unit renders nothing and claims no live leg at all** — for the structural reason §4 states, which is an
**ABSENCE**, never a silent park (`RCA-11`).

**Citation discipline.** `path` + **symbol** / **row id** / **§section**; **no line number appears in this
file** (`docs/specs/requirement-catalog.md` §3.4 rule 7). Where a quoted source carries a line number, it is
quoted **as that source's own text**, never adopted as this file's address.

**Verification markers.** **VERIFIED-BY-READ** = read in this pass from the named tree by this pass.
**UNVERIFIED** = named, not settled by this pass, **with what would settle it**. **RECORDED** = a figure or
ruling quoted from a named artifact as that artifact's own reading.

**Companion artifacts (read beside this file).** `docs/specs/unit-pd-vendor-foundation-mechanisms.md` (the
Phase-0 vendoring unit — **this unit consumes its vendored set and re-vendors nothing**) ·
`docs/specs/post-division-rebuild-proposal.md` (§4.1 `PD-UI-12` row, §4.5 the wave table, §4.7 `A-1`/`A-2`/`A-6`/
`A-10`, §7.3/§7.4) · `docs/specs/post-division-rebuild-proposal-review.md` (gate 1) ·
`docs/specs/post-division-foundation-adoption-surface.md` (§5 rows 18/19, §9) ·
`docs/specs/post-division-local-elimination-inventory.md` (§1/§2.1/§3/§9/§11) ·
`../Provident-Electron/docs/specs/slothost.md` · `../Provident-Electron/docs/specs/listhost.md` ·
`../Provident-Electron/docs/guide/seams.md`.

---

## 0. The rulings this unit derives from (recorded, NOT re-opened)

| # | Ruling, and its source | Carried here as |
| --- | --- | --- |
| **R-1** | **`PD-UI-12` GETS ITS BOUNDARY SPEC BEFORE ANY PHASE-1 ROW.** *"The keystone … is specified before any Phase-1 row runs — not deferrable, because seven rows share its host file. It remains out of the deletion set (§4.1) and out of the wave table until that spec exists."* — `docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (2); `Q-E` | this whole file; §1.4 |
| **R-2** | **THE REGION BOXES STAY FORK-AUTHORED MARKUP, because the foundation DECLINED `SCH-1`'s region-host half — and therefore W6's declaration half has NO slot-host dependency.** — `A-10`, quoted in proposal §4.7 (*"the region boxes STAY fork-authored markup … and therefore W6's declaration half has NO slot-host dependency. `PD-UI-12` may be deferred without blocking the waves"*); `Q-E`'s own wording in the gate record §3 | §1.3; §5 item 1 |
| **R-3** | **THE SLOT-HOST/REGION-HOST ADMISSIBILITY SPLIT IS THE FOUNDATION'S OWN, AND IT IS BINDING ON A CONSUMER.** *"`SCH-9` is SPLIT and the split is BINDING and must not be re-merged (`H-r15`)"*; and `H-r17`: *"region host NO (stays declined: a region declaration is a consumer-owned set with consumer names ⇒ `(C)#1`, and its criteria are API-shape ⇒ `(C)#6`) … slot host YES (`U-SLOTHOST`)"*. — `../Provident-Electron/docs/specs/slothost.md` §0 rulings 1/5; `../Provident-Electron/docs/specs/provident-electron-shell-chrome-handoff-review.md` `S-d14`/`H-r15`/`H-r17` | §1.1, §1.3, §5 item 4 |
| **R-4** | **THE VENDORED SET IS FIFTEEN AND INCLUDES `slot-host.ts` AND `owned-list-host.ts`; NEITHER IS IMPORTED BY ANYTHING IN THIS REPO.** Vendoring a module whose *row* is `KEEP`/deferred *"costs nothing and removes nothing"*; a row's `KEEP`/deferred status says the fork keeps its own artifact, **not** that the module is unvendored. — `docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` clause (1); `unit-pd-vendor-foundation-mechanisms.md` §2.1 items 3–4 and its two senses of *"out of the set"* | §1.2; §2.4 |
| **R-5** | **THE ELIMINATION RULE, and this unit's place under it.** A fork-local artifact is eliminated only when its replacement is landed, its consumers change first, and the test disposition is recorded. — proposal §6 item 3; `DECIDED: REBUILD-ARCHIVE-POLICY` | §1.2; §7 |
| **R-6** | **A MECHANISM IS OUTSIDE THE UI CONSTRAINT *BECAUSE IT IS NOT A UI ELEMENT* — and a mechanism that AUTHORS CONTENT is a review finding.** — `AGENTS.md`; the foundation's `DECIDED: SHELL-CHROME-CARVE-OUT-FUNCTIONAL` (`../Provident-Electron/docs/decisions.md`), read as the fork-side reading of proposal §3 | §1.1, §1.5; §5 item 2 |
| **R-7** | **`G-4` IS SCOPED, NOT DROPPED** — it forbids removing a **local write path for engine-owned data** while the engine's ingest route is parked, and it does **not** forbid a **CSS/token-projection write replacement**. — `unit-pd-vendor-foundation-mechanisms.md` `R-9`, `D-5`; `G-4` | §1.5; §9 item 6 |
| **R-8** | **NO ELEMENT IN THE FOUNDATION'S INVENTORY IS `DELETE-WHOLESALE`; every landed mechanism deliberately omits at least one half the fork owns.** — `docs/specs/post-division-foundation-adoption-surface.md` §0; proposal §4.1's preamble | §1.2; §2.3 |
| **R-9** | **THE `§5.U` LIVE MATRIX IS FULL AT 8 AND `MATRIX_ROWS` MUST NOT CHANGE** — live assertions enter as **re-pins**, never new slots. — `G-5`; `docs/specs/user-flow-audit.md` §2; `docs/specs/astrographer-scope-realignment-review.md` §2.2 `C7`/§6; **VERIFIED-BY-READ at this pass**: `scripts/live-drive.mjs` `MATRIX_ROWS` carries `U-1`…`U-8` (`U-1` `uf_panes_12` · `U-2` `uf_tabs_7` · `U-3` `uf_panes_12` · `U-4` `uf_layout_10` · `U-5` `uf_layout_10` · `U-6` `uf_panes_8` · `U-7` `uf_hist_6` · `U-8` `uf_tabs_3`) — **8 rows, no ninth** | §1.4; §8 |
| **R-10** | **A FOUNDATION SPEC DEFECT IS HANDED OFF, NEVER ABSORBED AND NEVER PATCHED**, and **no edit under `../Provident-Electron/**` is ever authorised by this repo** (`G-8`; `AGENTS.md` item 7). — `G-8`; `unit-pd-vendor-foundation-mechanisms.md` §9 item 8 | §5 item 6; §9 item 5 |

### 0A. The dated ruling notes — the clauses this filing DECIDES, and the clauses it ESCALATES (2026-09-28)

Each is either a decision this filing is entitled to take, **or** a named escalation.

1. **THIS FILING DECIDES THE BOUNDARY — AND THE DECISION IS THAT *NOTHING MOVES ONTO THE SLOT HOST IN THIS
   PASS*.** The architect's ruling (`R-1`) orders the boundary **settled**; it does **not** order an adoption,
   and it does **not** widen any unit's surface. **`PD-UI-12`'s own row status is therefore unchanged:
   *deferred pending its own boundary spec* → *deferred, boundary SETTLED*.** §1.2 states the three-part
   boundary and §1.3 states the reason the moved-half is **empty** rather than merely postponed.
2. **THE REASON THE MOVED-HALF IS EMPTY IS STRUCTURAL, NOT SCHEDULING.** The slot host's contract requires a
   **container holding caller-created nodes** (`../Provident-Electron/docs/specs/slothost.md` §2.2: *"every
   **node** (the caller creates it; the host **never** creates a node of its own)"*). **This repo has no
   admissible caller-created chrome node set to hand it** (§1.3), and the one candidate carrier — the
   status/warning slot — is a `MUST-NOT-MOVE` class (§1.5). **A host with no caller is not a boundary; it is
   dead code**, and adopting it would contradict `R-6`'s counterpart the moment the host wrote a class or a
   text.
3. **THE `containerFactory` SEAM IS THE PROGRAM'S ONE NAMED ADOPTION OBSTACLE — AND THIS FILING DOES NOT
   SUPPLY IT.** `C-6`/`Q-E` name it: *"the foundation's `createSlotHost` requires an injectable
   `container`/`containerFactory` policy the fork has never had."* **The seam is real and now landed in this
   repo's vendored bytes** (`src/shared/slot-host.ts` `containerFactory?`) — §2.2 rows 7/8 state **what would
   supply it** and **that nothing does today**. **Nothing in this file builds it**, because building it would
   be `PD-UI-12`'s implementation, not its boundary.
4. **THIS UNIT IS A DOC UNIT — SO IT CARRIES A RECORDED REGISTER EXEMPTION, NOT A REGISTER.** §6 is that
   exemption with its written rationale, under the ACTIVE ruling `PBT-REGISTER-REQUIRED-FOR-CODE-UNITS`
   (`../Provident-Electron/docs/decisions.md`), whose carve-out is *"genuinely invariant-free / doc-only /
   config-only / non-JS units"*. **A silent zero-row would be a review finding**; this note and §6 are the
   non-silent form.
5. **THIS FILING FILES ONE NEW FINDING (`B-1`, §10) AND RE-OPENS NO SETTLED ADJUDICATION.** Gate 1's verdict,
   the architect's `Q-A`…`Q-F`, the Phase-0 unit's cycle and the two spec amendments are **closed** and are
   **read, not re-litigated** here. **`B-1` is new because gate 1 never applied `A-10` back to the row it
   amends** (§10).
6. **THIS FILING NAMES ITS `§5.U` OBLIGATION AND CREATES NO SLOT.** Per `R-9`, the only admissible live form
   for anything this boundary touches is a **RE-PIN of an existing row** — §8 states which rows and which
   carriers, and states that **this unit asserts none of them**.

---

## 1. The boundary — THE DECISION

### 1.1 The problem, in the proposal's own words

`PD-UI-12` is *"the KEYSTONE, not a boundary question"* (`C-6`, proposal §4.1): **`src/renderer/sidebar-panes.ts`
is 4059 lines** (**VERIFIED-BY-READ at this pass** — the file's last line is its closing brace of the
`SidebarPanes` class, so the count reproduces) and imports **eight or more** of the named mechanism-bearing
modules, while the foundation's `createSlotHost` requires an injectable `container`/`containerFactory` policy
**this repo has never had**. **Seven Phase-1 rows share that host file, so where the boundary falls determines
the whole program's sequencing.**

**VERIFIED-BY-READ — the mechanism-bearing import census of the host file** (this pass, the exact specifiers of
`src/renderer/sidebar-panes.ts`): **`./layout-state.js`** (the `PD-ZONES-1`/`PD-ZONES-3` target), **`./pane-drag.js`**
(the `PD-GESTURE-2` target), **`./pane-gutter.js`** (the `PD-GESTURE-3` target), **`./tab-state.js`** (the
`PD-FOCUS-1` target), **`./tab-strip.js`** (the `PD-FOCUS-2` target), **`./modal-state.js`**, **`./theme.js`**,
**`./edit-controller.js`**, **`./hover-preview.js`**, **`./content-reconcile.js`**, **`./render-shared.js`**,
**`./pane-registry.js`**, **`./template-pane.js`** — plus its `side-effect`/type imports from `provident-ssr`,
`provident-ssr/core/registry.js`, `./runtime.js`, and the `src/main/**` and `src/shared/**` families.
**The proposal's *"eight or more"* is therefore satisfied and, on the vendored half, exact** (§2.4).

### 1.2 THE BOUNDARY TABLE — responsibility · today's owner · **the decided owner** · evidence

**The decided boundary has three parts, and the middle part is EMPTY.**

| # | Responsibility | Today's owner | **The DECIDED owner** | Evidence |
| --- | --- | --- | --- | --- |
| **B-1** | **Pane/slot hosting inside the shell's layout** — the zone mirrors, the pane catalog, the census write, the drag/gutter seam calls, the tab seam, the stage mount decisions | `src/renderer/sidebar-panes.ts` (`SidebarPanes`) | **STAYS — `src/renderer/sidebar-panes.ts`.** The host file is **not** re-pointed at a slot host by this boundary | proposal §4.1 `PD-UI-12` row (the file is *"not deletable"*, `PD-ZONES-3`); the local inventory §3's wave table's *host files whose call sites must change* list; **`PD-UI-12` remains OUT of the §4.1 deletion set** (`R-1`) |
| **B-2** | **Everything a slot host would own** — the per-key containers, the caller-declared key set, the callers' order/class/attribute policy, own-node ownership, the typed refusal for an undeclared key | **NOBODY — there is no such responsibility in this repo** | **NOTHING MOVES ONTO `src/shared/slot-host.ts` IN THIS PASS.** The vendored module stays **imported by nothing** (the Phase-0 state) | §1.3 (the moved-half is empty), reasons 1–4; `src/shared/slot-host.ts` is present and **no `src/**` file imports it** (§2.4, MEASURED); foundation `slothost.md` §2.2 (*the caller creates every node*) |
| **B-3** | **The shell's own region/chrome markup and its declaration** — `#tab-strip` + the nameplate, the four `.gutter[data-zone][data-axis]` divs, `#settings-modal` + scrim + body, `#settings-toggle`, and the four app mount roots | `src/renderer/index.html` (+ CSS `grid-area` rules) | **STAYS FORK-AUTHORED MARKUP — the region host does not exist to adopt** (`R-2`, `R-3`). **No unit of this program adopts, replaces or splits it**, and the markup work is **not absorbed** by `PD-UI-12` | §1.3; the local inventory `PD-REGION-1` row's own **`Consumers`** cell lists the markup's runtime consumers and its **classification** claims a *"slot-host declaration"* replacement (**contradicted** — §10 `B-1`); `S-12` (`CONTAINMENT + SLOT-ORDER have no fork-local implementation at all`) |
| **B-4** | **The slot/status carrier the fork actually has** — the top bar's ONE slot (the strip, sharing its row with the nameplate) and its host-side **warning state** (`pageEditSurfaceCommitState`/`pageEditSurfaceFailure` read by the strip warning) plus the authored stage warning (`pageGraph`'s `pageCommitWarningContent`) | Fork-local: `src/renderer/sidebar-panes.ts` + `src/renderer/pane-graph.ts` + `src/renderer/index.html` | **STAYS FORK-LOCAL, and its carrier half is STRUCTURALLY EXCLUDED from a slot host** — the excluded half is the declined **publisher/carrier**, which *"authors the element's text and slot content"* | handoff `§3.9` (**VERIFIED-BY-READ**: *"Astrographer's top bar has exactly one slot today (the strip, sharing the row with the nameplate) and its warning state is **host-side** … no `#shell-status`/`#shell-warning` element exists anywhere"*); foundation `slothost.md` §1 item 2 (no `publish` API — *"the publisher half, declined"*); §1.5 |
| **B-5** | **`src/shared/owned-list-host.ts`'s list role** — owned-node ordering/ownership for the tab strip | `src/renderer/tab-strip.ts` (`TabStrip`), `src/renderer/pane-registry.ts` | **STAYS (`PD-UI-11` is `KEEP`, and this filing does not re-open it).** The module stays vendored and unimported | proposal §4.1 `PD-UI-11` row (`A-3`: the reason is *"the strip is shell chrome that `W2-Q12` resolved as not-dispatchable"*, **not** an absent seam); local inventory `PD-FOCUS-2` (`NOT-IN-SCOPE (KEEP)` for the class); `R-4` |

**What the table means, stated so it cannot be over-read.** **There is no `DELETE` on the `PD-UI-12` row in this
pass, no re-point, no adapter, and no new consumer.** `PD-UI-12`'s status moves from
**`deferred pending its own boundary spec`** to **`deferred, boundary SETTLED (this file)`** — nothing else.

### 1.3 THE REGION-BOX QUESTION — the ruling carried, and what `A-10` makes true

**The ruling, quoted (proposal §4.7, `A-10` [LOW]):** *"The deferral is recorded as an explicit ruling: the
region boxes STAY fork-authored markup (`SCH-1` declined by the foundation), and therefore W6's declaration half
has NO slot-host dependency. `PD-UI-12` may be deferred without blocking the waves."* And `Q-E` in the gate
record §3: *"`A-10` rules the deferral is safe **only if** the region boxes are recorded as staying
fork-authored, since the foundation **declined `SCH-1`'s region-host half**."*

**VERIFIED — the ruling against the FOUNDATION'S OWN RECORD (four independent sites, all read this pass):**

1. `../Provident-Electron/docs/specs/provident-electron-shell-chrome-handoff-review.md` `S-d2`: *"**`SCH-1` is
   SPLIT.** The **cross-envelope mount cardinality/identity invariant** is admitted (this repo is its own
   consumer); the **region-host half** (`ShellRegionName`/`ShellRegionSpec`/`ShellRegions`) is DECLINED —
   **still binding**"*.
2. The same record's `S-d14`/`H-r17`: *"**`SCH-1`'s region host STAYS declined** (blockers `(C)#1` + `(C)#6`,
   **not** prohibition 5)"*; and its `Amendment record (A-d4…A-d8)` §2 clause: *"only **3 part-halves** stay
   declined (`SCH-1` region host · `SCH-9` publisher/carrier · `SCH-12` focus trap …)"*.
3. `../Provident-Electron/docs/specs/slothost.md` §0 ruling 5 (`H-r17`): *"the SLOT host is the host that IS
   admissible, and the region host is NOT … **region host NO (stays declined)** … slot host YES"* — the slot host
   *"must not acquire a region concept"*.
4. `../Provident-Electron/docs/next-steps.md`'s `Q6` row: **`ANSWERED — (a)`**, with *"the region host **stays
   declined**; `U-SLOTHOST` adopted **host-only**"*.

**VERIFIED — the ruling against the TWO INVENTORIES:**

- `docs/specs/post-division-foundation-adoption-surface.md` §9's `SCH-1` row: → **`U-MOUNTGUARD`** (invariant
  half) — **the region-host half is DECLINED** … *"the fork's region markup (`#tab-strip`, the four
  `.gutter[data-zone][data-axis]`, `#settings-modal` + scrim) — **it stays hand-authored markup, because the
  region host was declined**"*. Its §11 item 2 repeats it among the *refused halves* that *"must be explicitly
  re-homed in the fork before its local implementation is deleted"* — and here nothing is deleted.
- `docs/specs/post-division-local-elimination-inventory.md` `PD-REGION-1`: **VERIFIED-BY-READ** that *"there is
  **no region registry in code**"* and *"**containment and slot order have NO fork-local implementation at
  all**"* (`S-12`) — i.e. the fork has **no region-host artifact** for a region host to replace.

**THE CONSEQUENCE, recorded because it is what this unit owes:**

1. **This unit may NOT propose adopting a region host that does not exist.** `R-3` says the region host is
   declined **and the split is binding and must not be re-merged**; `R-2` says the boxes stay fork-authored.
   **A boundary spec that invented a region host here would be filing a declined ask under a new name** — the
   exact hazard `H-r15` names for the sibling host.
2. **This unit may NOT silently absorb the markup work.** The markup/declaration row `A-1` minted (*"the
   markup/region declaration gets its own row, owned by the `PD-UI-12` deferral ruling (`A-10`)"*) and that
   `X-4` would mint as **`PD-UI-13`** is **NOT this unit's to do, and NOT this unit's to swallow**: §9 item 2
   records it as an owed, owned item. **The markup stays exactly where `index.html` puts it.**
3. **Therefore the W6 declaration half has NO slot-host dependency** (`R-2`), and **the seven rows that share
   `sidebar-panes.ts` have no slot-host dependency either** — §1.4 verifies that separately on the consumer
   maps rather than inferring it from `A-10`.
4. **And therefore `PD-UI-12` does not block the waves** — which is what makes a **doc** unit sufficient.

### 1.4 THE SEQUENCING CONSEQUENCE — the seven rows, what this record unblocks, and this unit's own kind

**The seven rows, VERIFIED-BY-READ against the local inventory's `Consumers (src/**)` cells** (the exact
specifier `src/renderer/sidebar-panes.ts` appears in 7 rows' consumer maps — this pass, and it reproduces the
proposal's *"seven rows share `sidebar-panes.ts`"*):

| # | Inventory row | Its foundation unit(s) | Its `src/**` role in the host file | **Does it depend on this boundary?** |
| --- | --- | --- | --- | --- |
| 1 | **`PD-ZONES-1`** (`U-ZONES` + `U-CENSUS` + `U-PROJ`) | `zones.ts` / `census.ts` / `layout-projection.ts` | one of its **7 importers** must re-point in ONE commit | **NO for sequencing**; **YES for the frozen-name constraint** (§9 item 4) |
| 2 | **`PD-ZONES-3`** (`U-CENSUS` + `U-PROJ`) | `census.ts` / `layout-projection.ts` | `applyZoneTracks` — the synchronous census mirror; the call sites **stay** (the host is the census authority) | **NO** |
| 3 | **`PD-GESTURE-1`** (`U-GSESSION`) | `gesture-session.ts` | the `SidebarPanes` seam calls (`startGutter`/`moveGutter`/`endGutter`/`cancelGutter`/`resetGutter`/`previewGutter`/`activeGutter`/`commitGutterSize` + the drop/relocate seams) **stay** as the host adapter | **NO** |
| 4 | **`PD-GESTURE-2`** (`U-RELOCATE`) | `relocate.ts` | `createDragController` at the host; `movePane`/`insertionIndexForPoint`/`legalZonesForScope`/`setZoneMinimized`/`toZoneBounds`/`dropZoneForPoint`/`zoneOrientation` **KEEP** | **NO** |
| 5 | **`PD-GESTURE-3`** (`U-GUTTER` + `U-GUTTER-UI`) | `gutter.ts` / `gutter-affordance.ts` | `createGutterController` at the host; `GUTTER_ZONES`/`gutterAxis`/`gutterBounds`/`isGutterResizable`/`setZoneSize` **KEEP** | **NO** |
| 6 | **`PD-FOCUS-1`** (`U-FOCUS-MODEL`) | `focus-model.ts` | one of its **4 importers**; the tab vocabulary **KEEP** | **NO** |
| 7 | **`PD-FOCUS-2`** (`U-FOCUS-MODEL`'s seam row, class `KEEP`) | `focus-model.ts` (reducer only) | one of its **2 importers**; the `notifyTabClosed`/`drainClosedTabIds` closure seam is the `S-7` row | **NO** |

**THE VERIFIED NEGATIVE that makes the table binding:** **`U-SLOTHOST` appears in NONE of the seven rows'
`Replaces` cells.** Read this pass, the seven rows' `Replaces` cells name **`U-ZONES` · `U-CENSUS` · `U-PROJ` ·
`U-GSESSION` · `U-RELOCATE` · `U-GUTTER` · `U-GUTTER-UI` · `U-FOCUS-MODEL`** — **eight foundation units, and
`U-SLOTHOST` is not among them** (nor is `U-LISTHOST`, whose row is `PD-FOCUS-2`, `NOT-IN-SCOPE (KEEP)`).
**`U-SLOTHOST`'s only inventory `Replaces` claim is `PD-REGION-1`'s — the row `A-10` forbids (§10 `B-1`).**

**THE DEPENDENCY/SEQUENCING TABLE — the honest form, which is narrower than the question assumed:**

| Order | Row / unit | What it actually depends on | Does THIS record unblock it? |
| --- | --- | --- | --- |
| **0 (this)** | **`PD-UI-12`'s boundary record** (`docs/specs/unit-pd-ui-12-slot-host-boundary.md`) | `R-1` (the architect's `Q-E` ruling); the vendored set (`R-4`); `A-10` (`R-2`) | **— it IS the record** |
| **1** | **W0's three adoption dossiers** (`PD-UI-6` overlay · `PD-UI-1` theme · `PD-UI-8` focus-tool — the three `BLOCKED-ON-SEMANTICS`/collision rows gate 1 and §4.7 make gate-1 records + dossiers a `W0` prerequisite) | §4.7's phase shape; gate record §4 `X-2`/`X-4`'s un-owned rows | **NO — this record neither gates nor unblocks them** (`A-10` names the dossiers only because the region-host decline **frees** them of a slot-host edge they never had) |
| **2** | **The markup/declaration row** (`PD-UI-13`, `X-4`'s mint; `A-1`'s ownership assignment) | **THIS record's `B-3`** (the region boxes stay fork-authored) + `A-6`'s two-phase W6a/W6b land | **YES — it is the one thing this boundary unblocks**, and §9 item 2 assigns it an owner |
| **3** | **`PD-UI-3` (`U-CONTAINER`, re-admitted as a BUILD by `A-1`)** | the same markup/declaration row (its declaration must be **applied at the fork's own write site** — a site that does not exist today: **VERIFIED-BY-READ, `contain:` occurs in `src/**` ONLY in `src/shared/container.ts`'s own pinned constant**) | **PARTLY — this record settles that its apply site is NOT the slot host and NOT a moved control node**; the site itself is `PD-UI-3`'s own spec obligation (§9 item 3) |
| **4** | **The seven rows of §1.4's first table** | their own wave predecessors (W1→W7, proposal §4.5), **and NOT this boundary** | **NO — and that is the finding**: a *settled boundary record is sufficient to unblock them* |
| **5** | **W6b** — *"the single cutover commit whose red instrument is the LIVE `U-5`/`uf_layout_10` row, never a node row"* (`A-6`) | `A-6` + `A-7`'s mandatory `npm run divergence` pre-live leg | **NO** |

**WHAT THIS UNIT IS — code unit, or boundary record? STATED PLAINLY: IT IS A BOUNDARY RECORD.** The
justification, in four clauses:

1. **The architect's ruling orders the boundary to be SETTLED, and the settled answer moves no code** (`R-1` +
   §1.2). There is no `src/**` artifact this pass could delete, add or re-point without either (a) adopting a
   host with no admissible caller (§1.3 reason 2) or (b) absorbing the markup work `A-10`/§9 item 2 forbid.
2. **A code-bearing boundary would have to name a red set and a layer** (§7's obligation shape). **It has
   neither**: the deliverable is a decision, and the decision's own verification is **read-citation**, not
   execution.
3. **The rows it would otherwise block do not depend on it** (§1.4's verified negative) — **so a record is not
   merely *sufficient*; an implementation would be *surplus*, and surplus code in a keystone row is the
   `V-2`-class finding** (proposal §4.1: the first version of `PD-UI-3` *"claimed a deletion that does not
   exist"*).
4. **The one thing it must not do — absorb the markup row — is exactly what a code unit would do.**

**ITS `§5.x` REGISTER POSITION: A RECORDED EXEMPTION** — §6, with its written rationale under
`PBT-REGISTER-REQUIRED-FOR-CODE-UNITS`'s **doc-only** carve-out. **A code-bearing unit with no register and no
recorded exemption is a review finding; this unit is not code-bearing, and its exemption is recorded rather than
left silent** (`A-10`'s own discipline: *"the deferral is recorded as an explicit ruling"*).

### 1.5 WHAT THE UNIT IS NOT — the carried MUST-NOT-MOVE and DO-NOT-FILE boundary

**The project-wide UI constraint binds.** Any UI element that is not the Electron shell's own chrome must be
authored as provident-ssr data and driven through the producing graph — **so a control node may NEVER be moved
out of the graph by this unit.** `docs/specs/astrographer-scope-realignment-review.md` §4.1 and §5.2 name the
lists below, and this file **carries them explicitly**:

| Control node (class) | Its provident home (as that record cites it) | **This unit may NOT touch it** |
| --- | --- | --- |
| **C5 pane collapse** | the `pane-collapse-<id>` button, class `pane-collapse-toggle`, handler name `PANE_COLLAPSE_HANDLER = 'togglePaneCollapse'`, host seam in `src/renderer/sidebar-panes.ts` | **MUST stay visible/dispatchable — never move to shell** |
| **C12 container minimize + tab list** | the `zone-minimize-<zone>` toggle + the `zone-tab-<zone>-<id>` tab nodes in `src/renderer/pane-graph.ts`; its shell styling in `src/renderer/index.html` | **MUST stay visible/dispatchable** |
| **C15 doc-directory tree** | the doc-nav tree authored in `src/renderer/pane-graph.ts` | same |
| **C18 advanced search** | authored in `src/renderer/pane-graph.ts` | same |
| **C19 hover-preview** | popup + handlers provident (`src/renderer/hover-preview.ts`), timer/anchor shell | same |
| **C20 shared subtrees** | authored in `src/renderer/cross-document-shared.ts` | same |
| **C8 markdown/HTML toggle** | the `editor-toolbar-toggle` button + its toolbar host + `editorToolbarContent` in `src/renderer/pane-graph.ts` | **Visible** |
| **C2 / C10 stage content + content repopulation** | the stage placement envelope + host reconcile | **MUST NOT narrow what `get_rendered_html`/`list_targets` see** |

**And the `§5.2` DO-NOT-FILE list, carried:** the **RAG layer** · the **pane registry** · **zone names** ·
**`enabledPanes`** · the **import semantics** (the 512 cap / atomicity / corpusRoot) · the doc-nav tree · the
editor toolbar · hover-preview · shared-subtree decoration · the `rag.*`/`edit.*`/`module.*` tools · any
`provident-ssr` package patch for focus-trap · the already-gated shell units `O-1`/`O-2`/`O-9`/`O-10` · anything
already covered by `GR-1..GR-9`.

**The three consequences this unit carries as CONTRACT:**

1. **The C12 (container minimize + tab list) and C5 (pane collapse) control nodes stay PROVIDENT-authored AND
   dispatchable.** Their authoring homes are `src/renderer/pane-graph.ts` and the host seam in the host file —
   **NOT** a host-created container, and **NOT** a host-applied class value. **This is the clause that closes
   `B-4`'s candidate carrier**: a slot host that authored or class-valued those nodes would move a
   `MUST-NOT-MOVE` control out of the graph (`R-6`).
2. **`B-4`'s status/warning carrier stays fork-local and MCP-visible.** The handoff `§3.9` states the boundary
   in the only terms that matter here: *"a **warning about graph content** must stay authored **where the content
   is** … a consumer cannot move an MCP-visible message into invisible chrome by publishing it"* — and the
   status/warning carriers **are** the declined publisher half.
3. **The hybrid rule binds every seam this boundary touches**: *"the **model is always Provident/serialized;
   only the mechanic is external** — external code commits one managed write (hook / state-slice / structural
   op) at gesture end, never a per-frame stream"* (`docs/specs/ui-overhaul.md` §2.1 Table B). **`PD-ZONES-3`'s
   `applyZoneTracks` and every `PD-GESTURE-*` commit are the sites where that rule is enforced** — not the slot
   host, which is not adopted.

### 1.6 `G-4`'s scope, applied to this boundary

`R-7`/`G-4`: the constraint **forbids removing a LOCAL WRITE path for ENGINE-OWNED DATA** (the corpus, 226
documents / 6 102 nodes / 9 266 edges) while the engine's ingest/record-copy route is parked — and it does **not**
forbid a **CSS/token-projection write replacement**. **This boundary moves no write path at all**, so it is
**`G-4`-neutral by construction**: the corpus writes live in the app/domain/host layer (`PD-HOST-KEEP`), not in
the host file's hosting responsibility, and the one engine-adjacent artifact the local inventory flags under
`G-4` (`PD-ZONES-1`'s CSS write) is **`PD-UI-2`'s own evidence**, never this unit's.

---

## 2. The exact surface — the seams, and per seam the fork's supplier or *must be built*

### 2.1 What this unit ADDS to the tree: NOTHING

| Path | Change | Layer |
| --- | --- | --- |
| **every file** | **UNTOUCHED** — in particular `src/shared/slot-host.ts` and `src/shared/owned-list-host.ts` (vendored bytes; a local edit breaks the Phase-0 pin's byte-identity), `src/renderer/sidebar-panes.ts`, `src/renderer/index.html`, `src/renderer/pane-graph.ts`, `src/renderer/tab-strip.ts`, `src/renderer/theme.ts`, `src/renderer/modal-state.ts`, `src/renderer/layout-state.ts`, `vitest.config.ts`, `src/main/markdown-import.ts`, the four divergent baseline files (`dom-shim.ts`, `types.ts`, `demo-envelope.ts`, `path-fork-cycle.ts`), the nine `PROTECTED` artifacts, both fence files (`tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts`), every test file, and **everything under `../Provident-Electron/**`** | — |

**This unit writes exactly three files: this one plus the two anchored tracker appends of §11.** **It
authorises no `src/**` edit, no `tests/**` edit, no `vitest.config.ts` edit, no `package.json` edit, no fence
edit, and no edit under `../Provident-Electron/**`.**

### 2.2 The seam table — `createSlotHost` and `createOwnedListHost`, seam by seam

**Signatures are read from THIS repo's vendored bytes** (`src/shared/slot-host.ts`, `src/shared/owned-list-host.ts`
— **VERIFIED-BY-READ at this pass**, and consistent with the foundation's own specs `slothost.md` §2.1 and
`listhost.md` §2.1). **SOURCING IS STATED PER ROW, because the foundation's seam page does not cover these two
mechanisms:** `../Provident-Electron/docs/guide/seams.md`'s *What a fork must supply* table carries **four**
rows (`tokenFn`, `axisResolver`, `session`, `candidatesFor` … through `persist`) and its *Where it lives* block
names the units whose own seam blocks live elsewhere (`U-GUTTER`, `U-GUTTER-UI`, `U-MENULIB`). **NEITHER
`slot-host.ts` NOR `owned-list-host.ts` appears in that page at all** — they are ledger units **with no guide
page** (`../Provident-Electron/docs/guide/README.md`'s *"Units that have no page here"* section), whose contract
is their spec. **Their declared degradation is therefore taken from `slothost.md` §2.1/§2.3/§3.2 and
`listhost.md` §2.1/§3.2, and every degradation cell below names its source section rather than implying the
seam page covers it.**

| # | Seam | Signature | Class | **The fork's supplier — or *must be built*** | **The DECLARED degradation if it is absent** (source named) |
| --- | --- | --- | --- | --- | --- |
| **1** | `container` | `readonly container: unknown \| null` | **REQUIRED (may be `null`)** | **SUPPLIED TODAY — as a mount element only.** The fork resolves its mounts by id/selector (`#tab-strip` is resolved by `TabStrip`; `#app`/`#panes`/`#operator-panes` are the app mount roots). **What is NOT supplied is a chrome-node set to fill the host's containers** (§1.3 reason 2) | **NOT a refusal.** A `null`/absent container is a **supported no-op configuration**: `refused` `[]`, `ok === true`, `placed` `[]`, `keys()` still reports the declared keys, `containerFor(k)` is `null` for every key (`slothost.md` §3.2 `F-6` + the per-method table; `M-14`'s absent half) |
| **2** | `keys` | `readonly keys: readonly SlotKey[]` where `SlotKey = string` | **REQUIRED** | **MUST BE BUILT — and it is a DECISION, not a coding task.** The declared key set **is** the shell's slot vocabulary; the fork's top bar has **exactly one slot today** and its other candidate carriers are `MUST-NOT-MOVE`/declined (§1.3, §1.5). **A key set cannot be invented without re-filing the declined region concept** (`R-3`) | A **malformed** `keys` (`null` / a string / a non-string array) ⇒ **no throw**, an **empty declared set**, and every `setNode` is `unknown-key`; `keys: []` is **valid** (an empty container, `order` `[]`, no throw) (`slothost.md` §3.2 `F-4`, §3.1 `M-8`) |
| **3** | `orderOf` | `readonly orderOf?: (key: SlotKey) => string \| number` | **OPTIONAL** | **SUPPLIED TODAY (the policy exists, unbound)** — the fork orders panes/slots from its serialized layout (`layout-state`'s zone/pane order, `orderPaneCatalog`-class ordering elsewhere). **Binding it to a slot host is the part that has no caller** | **Omitted ⇒ the supplied `keys` order, with NO sorting** (prohibition 3, *"omitted `orderOf` ⇒ the supplied key order, which is the **absence** of a policy"*); **ties keep the supplied order (stability, no invented tiebreak)**; a **throwing** `orderOf` ⇒ **caught**, the named safe default (the supplied `keys` order), no invented refusal code (`slothost.md` §2.5 items 1/2, §3.1 `M-2`/`M-4`, §3.2 `F-10`) |
| **4** | `classNameOf` | `readonly classNameOf?: (key: SlotKey, node: unknown) => string \| null \| undefined` | **OPTIONAL** | **NOT SUPPLIED IN A COMPATIBLE FORM — and this is the seam that proves the boundary.** The fork's class vocabulary **exists** (`pane-graph.ts`'s `zoneMirrorClasses` produces `is-empty`/`is-minimized`/`is-revealed`) but it is **authored as envelope data** (`css: { classes: … }` on the node), never applied by host code. **Re-expressing it as a host write would move a `MUST-NOT-MOVE` control node's class out of the graph** (`R-6`, §1.5) | **Omitted ⇒ NO class write at all**; a `null`/`undefined` return is **NO WRITE for that field — not an empty-string write** (a pinned distinction); the value is applied **verbatim** — *"validates nothing, defaults nothing, prefixes nothing, and normalizes nothing"*; a **malformed** (non-string) value is **skipped**; `ok` is **not** forced `false` (best-effort per entry) (`slothost.md` §2.5 item 4, §3.1 `M-6`/`M-11`, §3.2 `F-8`) |
| **5** | `attributesOf` | `readonly attributesOf?: (key: SlotKey, node: unknown) => readonly SlotAttribute[] \| null \| undefined` with `SlotAttribute = { readonly name: string; readonly value: string \| number \| boolean }` | **OPTIONAL** | **MUST BE BUILT (nothing in the fork writes attributes on a chrome node).** **MEASURED this pass: `setAttribute(` occurs NOWHERE under `src/renderer/`** — the fork's attribute surface is the engine's own prop/attribute channel | **Omitted ⇒ NO attribute write at all**; a `null`/`undefined` return is **no write**; application order is the array's order with **last-write-wins** on a repeated name; a malformed entry (non-object, missing `name`, non-primitive `value`) is **skipped** while well-formed entries still apply (`slothost.md` §2.5 item 5, §3.1 `M-6`/`M-11`, §3.2 `F-8`) |
| **6** | `refuse` | `readonly refuse?: (refusal: SlotHostRefusal) => void` | **OPTIONAL** | **MUST BE BUILT.** No refusal-routing adapter for a slot host exists. **The nearest existing vocabulary is `SidebarPanes`'s own** (the host's guard/fallback arms) — but wiring it is implementation, and this unit authorizes none | **Notified ONCE per refusal, never awaited; its return value and any promise it returns are IGNORED — a `refuse` callback cannot change a refusal's outcome**; **absent/non-callable ⇒ no call attempted**; **throwing ⇒ SWALLOWED with the refusal already recorded** in the returned `refused` and **no invented refusal code for caller code** (`slothost.md` §2.1's callback rule, §3.1 `M-17`, §3.2 `F-10`) |
| **7** | `containerFactory` | `readonly containerFactory?: (key: SlotKey) => unknown` — **the SOLE container source** | **OPTIONAL (added by the architect's ruling on `ADV-SH-1`)** | **MUST BE BUILT — THIS IS THE PROGRAM'S ONE NAMED OBSTACLE (`C-6`/`Q-E`).** **NOTHING IN THIS REPO SUPPLIES IT TODAY**, and the foundation's own history shows why it matters: the module's ambient fallback (`globalThis['doc' + 'ument'].createElement('div')`) was **deleted, not documented**, by that ruling. **An acceptable return is a value that offers a function-valued `appendChild`** — *"a real DOM element satisfies it; a shim `ShimElement` satisfies it; a plain object offering an `appendChild` function satisfies it"*, and **no `instanceof`/tag predicate is admissible** | **ABSENT / non-callable / throwing / returning an unusable value ⇒ the SAME `F-6`-class degradation, for all five drives: no throw; every operation a valid no-op with a valid state; nothing is placeable; `refused` `[]` and `ok === true` for valid inputs; `keys()` still reports the DECLARED keys; `order` still valid; `containerFor(k)` is `null` for EVERY key — and NO container-state refusal is produced, in particular `'no-container'` is NEVER emitted** (`slothost.md` §2.1's container-source clause, §3.2 `F-12` + its per-method column (c), `F-11`'s negative) |
| **8** | `mount` (`owned-list-host`) | `readonly mount: unknown \| null` | **REQUIRED (may be `null`)** | **SUPPLIED TODAY** — `#tab-strip` (but `PD-UI-11` is `KEEP`: the module is not adopted) | `null`/absent ⇒ every operation a **no-op with a VALID state**: no throw; `ok === true` for a valid input; `keys()` still reports the CURRENT keys; `placed`/`removed` `[]`; **a later `mount` is NOT retro-fitted** (`listhost.md` §3.1 `M-15`) |
| **9** | `orderOf` (`owned-list-host`) | `readonly orderOf?: (entry: ListEntry<N>) => string \| number` | **OPTIONAL** | **MUST BE BUILT for this host** (the strip's own ordering is `TabStrip`-internal, not an injected comparator) | Omitted ⇒ **the order the entries were supplied in**; a **throwing** `orderOf` is **CAUGHT on both paths and never escapes** (`listhost.md` §2.1's option doc, `setEntries`/`setOrder` notes) |
| **10** | `itemFactory` (`owned-list-host`) | `readonly itemFactory?: (entry: ListEntry<N>) => N \| null` — **used ONLY when an entry supplies no node** | **OPTIONAL** | **MUST BE BUILT for this host** (the fork's tab nodes are engine-rendered from the envelope, not caller-created) | **An entry with no node AND no factory is REFUSED** (`'no-node'`) — **the host NEVER creates a node itself** (`listhost.md` §2.1's option doc; its §3.2 `F-3`) |
| **11** | `onActivate` (`owned-list-host`) | `(key: ListKey, entry: ListEntry<N>) => void` — **fired at most ONCE per `activate(key)` for a known key** | **OPTIONAL** | **MUST BE BUILT for this host** (the strip's activation routes through the fork's own tab/selection seam, `tab-state.ts`'s `focusTarget` family — not an injected callback) | **At most one firing per known key; an unknown key is a refusal, never a throw** (`listhost.md` §2.1's option doc + `OwnedListHost.activate`) |
| **12** | `onClose` (`owned-list-host`) | `(key: ListKey, entry: ListEntry<N>) => void` — **fired at most ONCE per `remove(key)`** | **OPTIONAL** | **MUST BE BUILT for this host** — and `notifyTabClosed`/`drainClosedTabIds` is the fork's own **module-level channel**, which the inventory's `S-7` names as *"a partial adoption candidate, not a clean swap"* | **A THROWING `onClose` must not escape** `remove`/`close`/`dispose` — the host **catches it and continues**, *"which it can do precisely because ownership is dropped BEFORE the callback fires"* (`listhost.md` §2.1's option doc, the `ADV-LH-3` ruling) |

**THE SEAM TABLE'S OUTCOME, IN NUMBERS (printed with its terms, so no reader has to count).**

**`createSlotHost` carries SEVEN seams** (the option record's members — `container` · `keys` · `orderOf` ·
`classNameOf` · `attributesOf` · `refuse` · `containerFactory`). **Their disposition, one line each:**

| Seam | Disposition | One-line reason |
| --- | --- | --- |
| `container` | **SUPPLIED — as a MOUNT ONLY** | the fork resolves `#tab-strip`/`#app`/`#panes`/`#operator-panes`, but has **no chrome-node set** to fill the host's containers (§1.3) |
| `keys` | **MUST BE BUILT — and it is a DECISION, not a coding task** | the declared key set **is** the shell's slot vocabulary, and inventing one re-files the declined region concept (`R-3`) |
| `orderOf` | **SUPPLIED AS POLICY, UNBOUND** | the fork orders panes/slots from its serialized layout; binding it to a host has no caller |
| `classNameOf` | **SUPPLIED AS VOCABULARY — NOT IN A COMPATIBLE FORM** | `pane-graph.ts`'s `zoneMirrorClasses` is **envelope-authored**; re-expressing it as a host write moves a `MUST-NOT-MOVE` control node (`R-6`) |
| `attributesOf` | **MUST BE BUILT** | **MEASURED: `setAttribute(` occurs nowhere under `src/renderer/`** |
| `refuse` | **MUST BE BUILT** | no slot-host refusal-routing adapter exists |
| `containerFactory` | **MUST BE BUILT — THE PROGRAM'S ONE NAMED OBSTACLE (`C-6`/`Q-E`)** | the sole container source; the foundation **deleted** its ambient fallback by the `ADV-SH-1` ruling, so nothing may replace it but an injected factory |

**`createOwnedListHost` carries FIVE seams** (`mount` · `orderOf` · `itemFactory` · `onActivate` · `onClose`),
**of which `mount` is SUPPLIED and the other FOUR are `MUST BE BUILT` — under a row (`PD-UI-11`) that is
`KEEP`, so none of them is authorised by this filing.**

**THE OVERALL READING, printed with its terms (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`'s discipline applied
to a seam census): `7 + 5 = 12` seam slots = `2` SUPPLIED + `1` SUPPLIED-BUT-INCOMPATIBLE + `9` `MUST BE BUILT`.**
**Per host, the terms:** **`createSlotHost`** — supplied: `container` (mount only), `orderOf` (unbound) ·
incompatible: `classNameOf` · must-be-built: `keys`, `attributesOf`, `refuse`, `containerFactory` (`2 + 1 + 4 = 7` ✔);
**`createOwnedListHost`** — supplied: `mount` · must-be-built: `orderOf`, `itemFactory`, `onActivate`, `onClose`
(`1 + 4 = 5` ✔). **And the totals reconcile: `2 + 1 + 9 = 12` ✔.** *This is the measured form of the proposal's
`C-6` and of §4.2's `PD-UI-11/12` cell* (`"mount` + `orderOf`/`itemFactory`/`onActivate`/`onClose`;
`containerFactory` — **no**; typed refusals; **nothing ordered or placed**")* — and **nothing in this filing
binds any of them** (§2.3).*

### 2.3 Why NO seam is bound by this filing — the three-clause refusal, stated as CONTRACT

1. **A seam with no caller is not a seam.** Every `MUST BE BUILT` row above exists to serve a host whose only
   admissible slot set is declined (`R-2`, `R-3`). **Building them now would be building the publisher half
   under a host-shaped name** — `H-r15`'s named hazard (*"`U-SLOTHOST` must not grow per-zone/per-pane semantics
   or a mirror-class taxonomy (`is-empty`/`is-minimized`/`is-revealed`) — that would resurrect `SCH-10`/`SCH-4`
   under a new name"*), and the fork's `classNameOf` candidate **is literally that taxonomy**.
2. **`R-8`'s pattern makes the omission safe.** Every landed foundation mechanism *"deliberately omits at least
   one half the fork owns"*, and *"an adoption that deletes a fork mechanism without landing its adapter is a
   behaviour regression, not a refactor"*. **Here the fork deletes nothing**, so there is nothing to regress.
3. **The boundary's own falsifier, stated now**: **if a future pass adopts the slot host for a shell surface,
   this §2.3 fails and the adoption owes — per `G-7` — a populated seam table, its declared degradations
   exercised as rows, and the `H-r15` prohibitions asserted.** That pass is **a new unit with its own gate**.

### 2.4 The import census that makes the boundary inert — MEASURED

- **No `src/**` file imports the vendored slot/list hosts.** **VERIFIED-BY-READ** (this pass): a `src/**` read
  for `createSlotHost`/`createOwnedListHost`/`SlotKey`/`slotAttribute` returns **matches only inside
  `src/shared/slot-host.ts` and `src/shared/owned-list-host.ts` themselves** — i.e. **zero importers**. The
  Phase-0 unit's own statement (*"the vendoring is therefore inert: it adds fifteen modules that nothing
  imports"*) is therefore **still true at this head**, and **this filing keeps it true**.
- **No `tests/**` file drives them.** **VERIFIED-BY-READ**: `tests/pd-vendor-set.test.ts` names
  `'slot-host': ['createSlotHost']` and `'owned-list-host': ['createOwnedListHost']` **as manifest/census
  entries** (an export-name census over the vendored bytes), **not** as module drives.
- **The vendored bytes are the pinned ones.** `vendor/foundation.lock.json` carries **`slot-host`** and
  **`owned-list-host`** among its **fifteen** `modules` with `proposalTableAgreement: "REPRODUCED"`, and its
  `rowStatus` for `slot-host` reads ***"PD-UI-12 (deferred pending its own boundary spec — Q-E; §4.1 row
  status, never set membership …)"***. **This filing moves that row status from *deferred pending its boundary
  spec* to *deferred, boundary SETTLED*, and `vendor/foundation.lock.json` is NOT edited by this unit**
  (a manifest edit is a `src/**`-adjacent change and belongs to a vendoring unit).

---

## 3. Mechanics and fail-states — of the DECISION, not of code

**Because this unit adds no code, its "states" are the states of the record, and each is falsifiable by a read.**

### 3.1 Valid / happy states

| id | State | Trigger (exact) | Required reading | Layer |
| --- | --- | --- | --- | --- |
| **M-1** | **The boundary is settled and the host file is untouched** | read `src/renderer/sidebar-panes.ts`'s class surface against §1.2 `B-1` | the file still exports `SidebarPanes` and still declares `applyZoneTracks`/`syncZoneMirrors`/`setLayout`/`startGutter`/`moveGutter`/`endGutter`/`cancelGutter`/`resetGutter`/`previewGutter`/`activeGutter`/`startPaneDrag`/`movePaneDrag`/`cancelPaneDrag`/`commitPaneDrop` and the pane-catalog/enabledPanes surface; **its mechanism-bearing import list is unchanged** | DOC / `[T]` read |
| **M-2** | **The vendored host is still unimported** | a `src/**` read for the two module names | **zero importers** (§2.4) | DOC / `[T]` read |
| **M-3** | **The region markup is still fork-authored and still complete** | read `src/renderer/index.html` for the ids §1.2 `B-3` names | `tab-strip` · `app` · `panes` · `operator-panes` · the four `gutter[data-zone][data-axis]` · `settings-modal` + `settings-modal-scrim` + `settings-modal-body` · `settings-toggle` **are all present** | DOC / `[T]` read |
| **M-4** | **The `MUST-NOT-MOVE` control nodes are still in the graph** | read `src/renderer/pane-graph.ts` for `zoneMirrorClasses` + the collapse/minimize/tab-list families | the mirror classes are still **authored** (`'is-empty'`/`'is-minimized'`/`'is-revealed'` produced by `zoneMirrorClasses` and applied through `css: { classes: … }`), and the C5/C12 handlers are still named on nodes | DOC / `[T]` read |
| **M-5** | **The matrix is unchanged** | a read of `scripts/live-drive.mjs` `MATRIX_ROWS` | **exactly `U-1`..`U-8`; no ninth row** | DOC / `[T]` read |

### 3.2 Documented fail-states (each is a review finding, and each is falsifiable)

| id | Fail-state | Trigger (exact) | Required behaviour |
| --- | --- | --- | --- |
| **F-1** | **A region host is proposed by or under this unit** | any row citing a `ShellRegionName`/`ShellRegionSpec`/`ShellRegions`-shaped adoption, or any `PD-UI-12`/markup row that replaces the region markup with a host declaration | **REFUSE.** `R-2`/`R-3`: the region half is **DECLINED by the foundation** and the split *"is BINDING and must not be re-merged"*. **The finding is the row, not the host** |
| **F-2** | **The markup work is absorbed into `PD-UI-12`** | any clause authorising a `src/renderer/index.html` edit under this unit's name | **REFUSE.** §1.3 consequence 2 + §9 item 2: the markup/declaration row has its own owner and its own gate |
| **F-3** | **A control node is moved out of the graph** | any host-applied class/attribute/text write on a C5/C8/C12/C15/C18/C19/C20 node, or any `classNameOf`-shaped re-expression of `zoneMirrorClasses` | **REFUSE.** §1.5 item 1 + `R-6`: **a content-authoring mechanism is a review finding**, and this is the exact shape |
| **F-4** | **A seam is bound with no caller** | a `src/**` file importing `src/shared/slot-host.ts` (or `owned-list-host.ts`) under this unit's authority | **REFUSE.** §2.3 item 1. **A red assertion may read the import census; an authorisation may not move the boundary** |
| **F-5** | **`PD-UI-11` is re-opened** | any clause re-deciding the strip's `KEEP` | **REFUSE.** `A-3` **replaced the reason** and the row stays `KEEP`; a vendoring/boundary pass *"may not re-open a `KEEP` row"* |
| **F-6** | **The four divergent baseline files, `vitest.config.ts`, `src/main/markdown-import.ts`, the `PROTECTED` set or a fence file is touched** | any edit to those paths under this unit | **REFUSE** — each is a protected-pin or fence violation, and this unit edits no code at all |
| **F-7** | **A live assertion is filed as a NEW matrix slot** | any `scripts/live-drive.mjs` `MATRIX_ROWS` addition | **REFUSE.** `R-9`/`G-5`: the matrix is **full at 8**; live work enters as a **RE-PIN** |
| **F-8** | **A foundation defect is patched, or a foundation file is edited** | any edit under `../Provident-Electron/**`, or a fork-side fix of a foundation spec's clause | **REFUSE.** `R-10`/`G-8`: **hand off** (`docs/defects.md` → `docs/HANDOFF.md`), never patch |
| **F-9** | **The register exemption is left silent** | a filed boundary/doc unit with no §6-shaped exemption and no register | **REFUSE.** §6 records it with a rationale; *"a silent zero-row on an adopted unit is a review finding"* (local inventory §11) |
| **F-10** | **A DONE row claims a node-suite green as app evidence** | any unit row citing the suite, the battery or the conformance leg as app-green | **REFUSE.** `RCA-12`: *"a node-suite green is ENVELOPE-green, not APP-green"*; the conformance leg is additionally **empty as evidence** at this head (`PD-VENDOR` §3.5 item 7) |

### 3.3 Invariants that hold in every state

| id | Invariant | Why it is here |
| --- | --- | --- |
| **I-1** | **`PD-UI-12` stays OUT of the deletion set and out of the wave table**, and its row status reads *deferred, boundary SETTLED* | `R-1` clause; proposal §4.1's `C-6` |
| **I-2** | **No `src/**` file imports either vendored host** | §2.4; the boundary's inertness |
| **I-3** | **Every C5/C8/C12/C15/C18/C19/C20 node stays provident-authored and dispatchable**, and *"MUST NOT narrow what `get_rendered_html`/`list_targets` see"* holds for C2/C10 | §1.5 |
| **I-4** | **The live matrix is exactly `U-1`..`U-8`** | `R-9` |
| **I-5** | **No edit under `../Provident-Electron/**`, and no foundation clause is "fixed" here** | `R-10` |
| **I-6** | **The four divergent baseline files, `vitest.config.ts`, `src/main/markdown-import.ts`, the nine `PROTECTED` artifacts and the two fence files are byte-unchanged by this unit** | §2.1 |
| **I-7** | **Every claim in this file is DOC-LAYER**, and no row reads as app/envelope/live evidence | `RCA-12`; §4 |

---

## 4. The layer ledger — per deliverable, which layer its evidence covers

| Deliverable | Layer | What it does NOT prove |
| --- | --- | --- |
| the boundary decision (§1.2) | **DOC** | that any code changes |
| the region-box ruling carriage (§1.3) | **DOC** | that any markup is authored or deleted |
| the seam table (§2.2) | **DOC** — signatures read from the vendored bytes | that any seam is wired, or that any degradation fires here |
| the sequencing/dependency table (§1.4) | **DOC** — derived from the inventories' consumer maps | that any wave lands |
| the register exemption (§6) | **DOC** | — |
| the `§5.U` obligation (§8) | **DOC** — a re-pin obligation, not a measurement | that any live row passes |
| **any live / app / rendered / assembled-layer claim** | **NONE — not claimed, not run, not owed by THIS unit** | — |

**THE `RCA-12` RULE, IN THIS UNIT'S OWN TERMS.** A node suite green is **ENVELOPE-green**: it verifies the
provident-envelope authoring model and the docs, and the dom-shim is deliberately layout-less and CSS-less, so
shell CSS/grid/window, the runtime stage↔app-graph assembly and the live persistence round-trip are
**structurally unassertable in node**. **This unit claims no green of any kind** — it claims a **decision**, and
its verification is read-citation (§7).

**AND THE HONEST LIMIT ON THE LIVE LEG, STATED AS THE RULE REQUIRES.** `npm run divergence` is **RED at this
branch head for an ENVIRONMENTAL reason** (`/dev/shm` denial → Electron `SIGTRAP`), so **a live battery cannot
be honestly claimed green until the harness fix lands** (its own owed unit — §9 item 1, no spec, no red set).
**A UI-overhaul unit otherwise owes a MANDATORY live battery (`RCA-11`); this unit is not a UI-overhaul unit and
renders nothing** — its live obligation is the **ABSENCE row below**, whose falsifiable reason is structural and
not a waiver (§3.2 `F-10` names the forbidden re-description).

**THE GATE-6 LIVE ROW, RECORDED AS AN `ABSENCE` ROW (`RCA-11`/`RCA-12`).**

| Field | Entry |
| --- | --- |
| **Row kind** | **`ABSENCE`** — **not** `PASS`, **not** `FAIL`, **not** a waiver. *"Waived"* is a forbidden status here: a waiver implies a live surface skipped by choice or permission, and this unit has **no live surface to skip** |
| **What is absent** | every live / app / rendered-DOM verification row for the boundary decision |
| **The falsifiable structural reason** | **The unit authors NO rendered surface and changes NO rendered surface.** Its entire output is this document plus two tracker appends: **no `src/**` file, no `tests/**` file, no `index.html` byte, no envelope node, no handler body, no CSS rule, no class, no slot content.** The falsifiable statement is *"remove this unit's one file and no rendered surface changes"*, and it is **TRUE by construction** — the unit's only content is a decision about where a boundary is |
| **Why a live battery could not be run** | there is nothing for it to exercise **and** `npm run divergence` (the branch's only assembled-real-Electron leg) is **RED for the environmental `/dev/shm` reason** (proposal §7.5, RECORDED) |
| **The harness fix** | **another owed unit, never this one's, and never silently parked** (§9 item 1) |

---

## 5. What this unit does NOT claim, and the things it explicitly refuses

1. **No app-green, no envelope-green-as-app, no store-green, no engine-green, no live green.** Everything in
   this file is DOC-LAYER.
2. **No control-node move, in any spelling.** The C5/C8/C12/C15/C18/C19/C20 nodes and the C2/C10 visibility
   rule stay exactly as `docs/specs/astrographer-scope-realignment-review.md` §4.1/§5.2 pin them (§1.5).
3. **No region host.** `R-2`/`R-3`: the region half is declined, the split is binding, and the region boxes stay
   fork-authored. **A region host is never adopted, never emulated, and never proposed under a new name.**
4. **No slot host in production code, and no re-opening of `PD-UI-11`.** The slot/list hosts stay vendored and
   unimported; the strip stays `KEEP`.
5. **No foundation patch and no foundation-file edit.** `R-10`/`G-8`. **This unit found no new foundation
   defect** (the boundary's `A-10`-shape is a **ruling**, not a defect) — and had it found one, it would be a
   `docs/defects.md` → `docs/HANDOFF.md` row, written by the supervisor (§9 item 5).
6. **No engine elimination, and no corpus write touched.** `G-3`/`G-4`; §1.6.
7. **No markup work.** §1.3 consequence 2; §9 item 2.
8. **No widening of any unit's allowed surface** — the seven rows' surfaces are unchanged, `PD-UI-3`'s BUILD
   row is unchanged in shape, and the markup row is **assigned**, not scoped wider (§9 item 2).
9. **No new live matrix slot.** `R-9`; §8.
10. **No `docs/skills/designing-pages.md` change.** **VERIFIED-BY-READ at this pass**: a glob of
    `docs/skills/*` in this repo returns **`process-guardrails.md` alone** — the file **does not exist**, so
    there is **no test-use-case coverage matrix and no demo-page index to update**. **A page-design change is
    not affected by this unit** (it renders nothing); the honest form of that row is this **ABSENCE row** —
    recorded, not silent (`PD-VENDOR` `D-9` reached the identical finding).

---

## 6. THE RECORDED `§5.x` REGISTER EXEMPTION (with its written rationale)

**POSITION: this unit carries NO typed Property register. It carries this RECORDED EXEMPTION.**

**The ruling it is taken under (ACTIVE):** `../Provident-Electron/docs/decisions.md`
`DECIDED: PBT-REGISTER-REQUIRED-FOR-CODE-UNITS` — *"gate 11's zero-row exemption is RESTRICTED to genuinely
invariant-free / doc-only / config-only / non-JS units; every CODE-BEARING unit carries a typed `§5.x` register
executed deterministically with NO new dependency"*, and *"the exemption survives **only** as an explicit
recorded justification, never a silent default."*

**THE RATIONALE, in four falsifiable clauses:**

1. **This unit is DOC-ONLY, not code-bearing.** §2.1: it adds **no** `src/**` file, **no** `tests/**` file, **no**
   script, **no** `package.json` key and **no** dependency. **There is no artifact for a generator to drive**, and
   therefore no property that a deterministic table could attempt.
2. **Its claims are DECISIONS, and their falsification is a READ.** Every row of §1–§3 is a
   `path` + symbol / row id / `§section` citation against a tree that this unit does not change — the form
   `docs/specs/astrographer-scope-realignment-review.md` §2.2 `C8` authorised for exactly this class
   (*"This doc set changes **NO code** ⇒ the register exemption is **explicit and scoped to the doc artifacts
   only**; the **trio is not owed this pass**; every shell unit landing later under this boundary **keeps full
   TDD / PBT / live-battery**"*).
3. **The exemption is scoped and does not leak.** **Every unit this boundary touches keeps its own register
   obligation in full**: `PD-UI-3` (a BUILD row), `PD-ZONES-1`/`PD-UI-2`'s three rows, the gesture rows, the
   markup row and any future slot-host adoption are **code-bearing and require registers of their own** (§9
   items 2/3). **Nothing here exempts a sibling.**
4. **The unit's own verification is the read-set**, stated as an obligation in §7: a **re-read** of the four
   invariants of §3.3 at the row's landing (the tree state a later unit inherits).

**AND THE FORBIDDEN SILENT FORM IS NAMED.** A boundary unit with **no** register **and no recorded exemption**
is a **review finding** (`§3.2` `F-9`); the local inventory §11 states the same rule for adopted rows (*"each
needs the written zero-row rationale naming its declared surface — a silent zero-row on an adopted unit is a
review finding"*). **This §6 is that rationale.**

---

## 7. The red-set plan — WHY THERE IS NONE, and what stands in its place

**This unit authors no test and runs no red set, because it authors no code.** The delegation gate
(`AGENTS.md` item 9) requires a spec **plus** a TestWriter red set **for a code unit**; **the correct disposition
for a doc/boundary unit is a stated, scoped red-set absence, not an invented one** — the precedent is
`docs/specs/astrographer-scope-realignment-review.md` §6 (*"Doc-only ⇒ no red set, no trio"*), and this filing
follows it rather than weakening it.

**What stands in the red set's place — the unit's own verification obligation:**

1. **The four §3.3 invariants are re-READ at this row's landing** (`I-2` unimported hosts · `I-3` control nodes
   in the graph · `I-4` the matrix at 8 · `I-6` the protected set byte-unchanged).
2. **Every citation in this file is re-resolvable** — `path` + symbol / row id / `§section`, never a line
   number.
3. **No trio is owed and none is claimed**: `npm test` / `typecheck` / `build` are unaffected by a document that
   changes no code, and **the branch baseline is the Phase-0 five-leg reading** (`G-1` as extended by `X-6`:
   `npm test` one carried red (`PANE-TOGGLE-STAGE-COLLAPSE`) · `typecheck` 0 · `build` 0 · `battery` 184/0
   GREEN `[H]` · `divergence` RED-environmental). **Every later unit states its delta against that baseline;
   this unit's delta is ZERO by construction.**

---

## 8. THE `§5.U` NOTE — the live matrix is FULL at 8, so any live assertion enters as a RE-PIN

**The matrix is FULL at 8.** **VERIFIED-BY-READ at this pass**: `scripts/live-drive.mjs`'s `MATRIX_ROWS` holds
**exactly `U-1`…`U-8`** (`U-1` `uf_panes_12` · `U-2` `uf_tabs_7` · `U-3` `uf_panes_12` · `U-4` `uf_layout_10` ·
`U-5` `uf_layout_10` · `U-6` `uf_panes_8` · `U-7` `uf_hist_6` · `U-8` `uf_tabs_3`) — and
`docs/specs/astrographer-scope-realignment-review.md` §2.2 `C7`/§6 states the cap and the fullness
independently (*"No new §5.U matrix rows … the matrix is capped at 8 and FULL at U-1..U-8"*).

**THE CONSEQUENCE FOR THIS BOUNDARY:** **no live assertion of any kind may be filed as a new slot.** If a later
unit wants a live reading for a surface this boundary touches, it enters as a **RE-PIN of an existing row**, and
the carriers are named so no later pass has to re-derive them:

| Row | Its block | Which surface this boundary's neighbours rewrite |
| --- | --- | --- |
| **`U-3`** | `uf_panes_12` | the pane-HEADER gesture surface (the `PD-GESTURE-*` family) |
| **`U-5`** | `uf_layout_10` | **the empty-track collapse** — the `PD-ZONES-*`/`PD-UI-2` family, and `A-6`'s **named red instrument for W6b** |
| **`U-1`** | `uf_panes_12` | a real document-row focus through the host file's doc-nav seam |
| **`U-2`** | `uf_tabs_7` | a real search-result click opening a NEW tab (the tab seam) |
| **`U-6`** | `uf_panes_8` | a pane-tab click after zone minimize (the C12 family) |
| **`U-4`** | `uf_layout_10` | the empty↔filled transition's **one `#wiki-root`** (the `PD-REGION-2` mount row) |

**AND THIS UNIT ASSERTS NONE OF THEM.** It neither runs a live leg nor claims one (§4's `ABSENCE` row); it
records **which existing rows a later unit must re-pin**, because *"the re-pin is NAMED per row"* (`C-12`,
`G-5`) and a later pass that invented a `U-9` would be a review finding (`§3.2` `F-7`).

---

## 9. Owed items and escalations (recorded, never hidden, each with an owner)

| # | Item | Owner | Why it is not this unit's |
| --- | --- | --- | --- |
| **1** | **THE DIVERGENCE HARNESS FIX** — a harness unit touching `scripts/**` (the foundation's own harness landed `--disable-dev-shm-usage` + a fresh scratch `--user-data-dir` for exactly the `/dev/shm` class). **It has no spec and no red set.** | **THE ARCHITECT, then a new harness unit** | proposal §7.5 item 3 records it as owed; `A-7` makes `npm run divergence` mandatory pre-live. **This unit passes the red precondition through and claims nothing** |
| **2** | **THE MARKUP/DECLARATION ROW** (`PD-UI-13` per `X-4`; `A-1` assigns its ownership to *"the `PD-UI-12` deferral ruling (`A-10`)"*) — **and the W6a/W6b two-phase land of `A-6`.** | **THE SUPERVISOR, to mint it as an owned row; then that row's own unit spec** | `A-10`+§1.3 fix its SCOPE (fork-authored markup, **no slot-host dependency**), and this filing is what settles that scope — **but minting a row, assigning a wave and authoring a red set are not a boundary spec's acts** (§1.3 consequence 2) |
| **3** | **`PD-UI-3`'s wave assignment and its write-site obligation.** `U-CONTAINER` is **re-admitted as a BUILD** by `A-1` (*"supply `tokenFn`/`axisResolver` + apply `containerDeclarationFor`'s returned text at the fork's own write site"*); **the write site is not named by any artifact**, and **VERIFIED-BY-READ at this pass `contain:` occurs in `src/**` only in `src/shared/container.ts`'s own pinned constant** — there is no `contain:` in `index.html`'s CSS and no `containment` declaration in the renderer | **THE SUPERVISOR (the wave/owner decision); `PD-UI-3`'s own unit spec (the site)** | a boundary filing may **observe** that the site is new; **it may not create the site, widen `PD-UI-3`'s surface, or authorise the edit.** **The `PD-REGION-1` family is `index.html`'s markup/CSS — so one candidate site is the markup row of item 2 and another is `PD-UI-3`'s own — and THAT choice is exactly what the supervisor must record** (UNVERIFIED: see §10 `U-3`) |
| **4** | **`PD-UI-1`'s frozen-name constraint is re-stated, not created:** `tests/unit-live11-bridge-seams.test.ts` is **`PROTECTED`** and pins `defaultLayout`/`coerceLayout`, so the layout adoption cannot change those exported names or shapes without re-stating a protected census, which *itself* is a `PROTECTED` artifact of a different unit | **Each wave that touches the layout exports (`G-9`'s per-wave pin re-derivation)** | a boundary spec may not edit a test or a pin; `R-5`'s elimination rule requires the consumers to change first |
| **5** | **Every foundation-side defect found by a later pass** — this unit found **none new** (`A-10` is a **ruling**, not a defect), so **no `docs/defects.md` → `docs/HANDOFF.md` row is owed by this unit**; the standing `G-8` items remain owed by whoever owns them | **THE SUPERVISOR'S WRITES** | `AGENTS.md` item 7 + `G-8`: **hand off, never patch, and never authorise an edit under `../Provident-Electron/**`** |
| **6** | **`G-4`'s scoped caution, carried:** no fork unit may remove a local write path for **engine-owned data** while the ingest/record-copy route is parked. **This boundary removes no write path**, so it owes nothing here | **Every engine-touching unit's own spec gate** | `R-7`; proposal §4.3; the premise-staleness correction is `W0`'s second deliverable (`X-7`) and is **not this unit's** |
| **7** | **`B-1` (§10) — the contradiction between the local inventory's `PD-REGION-1` classification and `A-10` + three foundation records** | **THE SUPERVISOR, to file/route it; the resolution is the architect's or the inventory's owning pass** | a boundary spec may **file a finding with evidence**; it may not re-classify another inventory's row on its own authority, and it may not re-open a settled adjudication (`§0A` note 5) |
| **8** | **`X-3` (`Phase 0`'s first duty: per-file test disposition re-derivation), `X-11` (the two uncollected `.mjs` batteries' runner), `X-9` (`G-9`'s extension to `package.json`/`vitest.config.ts` pins)** | **THE SUPERVISOR / the named Phase-0 or Wave-0 pass** | all three are **neither this unit's nor created by it** (`PD-VENDOR` §9 items 2–4 reached the same dispositions) |
| **9** | **The tracker rows this filing owes** | **THIS PASS (done)** | **§11** records them |

---

## 10. Findings this filing raises (with evidence), and its UNVERIFIED list

### 10.1 `B-1` — A NEW CONTRADICTION: the inventory's `PD-REGION-1` classification contradicts `A-10` and three foundation records

| Field | Entry |
| --- | --- |
| **Kind** | **DOC-DRIFT / classification contradiction** (a row's stated replacement contradicts the architect's ruling and the foundation's own disposition of the same ask) |
| **The finding** | `docs/specs/post-division-local-elimination-inventory.md` `PD-REGION-1` classifies the shell region markup **`DELETE-SUBSET-KEEP-ADAPTER`**, stating *"the **declaration** half (static element list + gutter divs) is mechanism and is **replaced by the slot-host declaration**"*, and its `Replaces` cell reads **`U-SLOTHOST`** `slot-host.ts` `createSlotHost`/`SlotHost`/`SlotAttribute` **+ `U-CONTAINER`** `container.ts` … — i.e. **the row adopts the region host under the slot-host's name**, while `A-10` (**a binding amendment**) rules *"the region boxes STAY fork-authored markup (`SCH-1` declined by the foundation)"* |
| **Both citations, intact** | **The inventory's claim**: `docs/specs/post-division-local-elimination-inventory.md` `PD-REGION-1`'s `Replaces` + `Classification` cells. **Its contradiction**: `docs/specs/post-division-rebuild-proposal.md` §4.7 `A-10`; `docs/specs/post-division-foundation-adoption-surface.md` §9 `SCH-1`'s row (*"the region-host half is DECLINED … it stays hand-authored markup, **because the region host was declined**"*) and §11 item 2 (the refused halves); `../Provident-Electron/docs/specs/provident-electron-shell-chrome-handoff-review.md` `S-d2`/`S-d14`/`H-r17`; `../Provident-Electron/docs/specs/slothost.md` §0 rulings 1/5; `../Provident-Electron/docs/next-steps.md`'s `Q6` row |
| **Why it is a NEW finding and not a re-litigation** | **Gate 1 never applied `A-10` back to `PD-REGION-1`.** The amendment assigned the markup/declaration row's *ownership* to *"the `PD-UI-12` deferral ruling (`A-10`)"* and left the inventory's `PD-REGION-1` cell standing — so the row's `Replaces` cell **still names the declined half**, and a Phase-1 pass reading it as filed would adopt it. **The two records were never reconciled**; this filing is the reconciliation attempt, filed rather than performed |
| **Corroboration from the same inventory** | **its own `S-12` row** states *"CONTAINMENT + SLOT-ORDER have **no fork-local implementation at all** … **These are `ABSENT`, not `delete`** — the rebuild is a **BUILD** (`U-CONTAINER`/`U-SLOTHOST`)"*, and **its `PD-REGION-1` `What it does today` cell** states *"there is **no region registry in code**"*. **A `DELETE-SUBSET-KEEP-ADAPTER` on an artifact that does not exist is the `V-2` class** (proposal §4.1: *"**The first version of this row claimed a deletion that does not exist**"*) |
| **What this filing does about it** | **Nothing to the inventory's file** (not this unit's surface). It **records** the contradiction, **carries `A-10`'s ruling as contract** (§1.3), **states the consequence for `PD-UI-12`** (no slot-host movement — §1.2 `B-2`), and **assigns the routing to the supervisor** (§9 item 7). **What would settle it:** the inventory's owning pass re-classifying `PD-REGION-1` to a markup-only disposition consistent with `A-10`, **or** an architect ruling that re-admits the region half (which would need to supersede `S-d2`/`S-d14`/`H-r17`/`Q6` on the foundation's own record, and would be a **new gate**) |
| **Severity** | **MEDIUM** — it corrupts sequencing (it is the only row that would make the slot host a Phase-1 dependency) rather than breaking shipped behaviour. **It is NOT blocking for the seven rows**, whose dependency on the slot host §1.4 measures as **zero** |

### 10.2 The UNVERIFIED list (each with what would settle it)

| # | Unverified claim | Why | What would settle it |
| --- | --- | --- | --- |
| **U-1** | **That the seven-row set of §1.4 is EXACTLY the set that "shares `sidebar-panes.ts`" in the proposal's own sense.** The measure here is the **inventory's `Consumers (src/**)` cells** (7 rows name the exact specifier), and the proposal's §4.5 counts *"seven of the rows share `sidebar-panes.ts` / `renderer.ts` / `pane-graph.ts` / `layout-state.ts` / `tab-state.ts`"* — **the two are not provably the same seven**, because §4.5 aggregates **five** files into its list | a per-row importer enumeration at the **proposal's row ids** (not the inventory's), by the pass that re-derives the per-file dispositions (`X-3`) |
| **U-2** | **That the fork writes NO attributes on any chrome node** (the basis of §2.2's `attributesOf` = *must be built*). **MEASURED this pass: `setAttribute(` occurs nowhere under `src/renderer/`** — but the fork's attribute surface may be the engine's **own** prop channel, which this pass did not trace | a read of the engine's prop/attribute application path, or a pass that greps the whole `src/**` for attribute writes |
| **U-3** | **Which site would apply `U-CONTAINER`'s returned declaration text** (§9 item 3). **MEASURED: no `contain:` declaration exists in the fork's `index.html` CSS**; **UNVERIFIED whether the intended site is the markup row's CSS or a new `PD-UI-3` site** | `PD-UI-3`'s own spec gate, or the supervisor's row assignment |
| **U-4** | **Whether the top bar's *"exactly one slot today"* still holds at this head.** The claim is **READ from the fork's own handoff `§3.9`** (a 2026-09-22 filing), **not re-derived by this pass** — this pass verified only that **no `#shell-status`/`#shell-warning` id exists in `index.html`** and that the strip's only child is the nameplate | a fresh read of `index.html` + the authored status/warning surfaces by the pass that would adopt a carrier |
| **U-5** | **The `PD-UI-11` dependency question I deliberately did NOT take.** `owned-list-host.ts` **was vendored** (`R-4`), and `PD-UI-11`'s row status is `KEEP` with a **replaced reason** (`A-3`) — **whether `PD-UI-11`'s `S-7` closure row (`notifyTabClosed`/`drainClosedTabIds`) is a Phase-1 row is NOT settled by this filing and is NOT claimed** | `PD-UI-11`'s own boundary/scope pass; this filing's mandate is `PD-UI-12` alone |
| **U-6** | **That no other `docs/**` file repeats the `PD-REGION-1` claim** (§10.1). This pass read the proposal, the gate record, both inventories, the adoption surface, the three foundation records and the two tracker sites — **not a whole-tree sweep for the claim** | a `grep` sweep for `ShellRegion`/`region host`/`slot-host declaration` across `docs/**` |

---

## 11. The tracker rows this filing owes (anchored appends only)

| Tracker | The append | Anchored, never a whole-file write |
| --- | --- | --- |
| **`docs/next-steps.md`** | a row in the **CURRENT WORK / handover-state** area recording **this unit's filing**: the file path, that the boundary is **SETTLED** with **nothing moved onto the slot host**, the **doc-unit + register-exemption** position, the `A-10` carriage, the seven rows' **verified zero slot-host dependency**, and finding `B-1` | **APPENDED beside the existing `PD-VENDOR` blocks at the head of the CURRENT WORK area — the existing rows are KEPT as their passes' readings and no row is rewritten** (`RCA-8(c)`; every current row there is a single very long line, so an anchored **insertion of a new row** is the only admissible edit) |
| **`docs/pending.md`** | an annotation on the **POST-DIVISION** row, because **this filing DOES change the program's next action**: it satisfies `Q-E`'s `PD-UI-12`-before-Phase-1 condition, so the program's next action is no longer *the boundary spec* but **`W0`'s dossiers + the markup row's minting** (§9 items 2/3) | **APPENDED inside that row's own cell with its date and this file's path; the row's existing text is KEPT** |

**And `docs/decisions.md` is NOT written by this unit.** No new decision row is authored: `R-1`'s ruling
**already exists** as an ACTIVE row (`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (2)), and
this filing **executes** it rather than amending it. **A unit that wrote a duplicate decision row for a ruling
that already exists would create the second hand-maintained truth the `A-8` discipline forbids by analogy.**

---

## 3a. Adversarial findings — **RESERVED: the pass has NOT run. The seed set below is the contract it will be reconciled against.**

**`RCA-3` requires a read-only adversarial pass per completed unit, with its findings recorded here. This spec
has run none, and the section is RESERVED rather than filled with an intention.** **The seeds are questions to
FALSIFY, not claims — and each is dispositioned into §3b when the pass runs.** **A finding that would require
editing `../Provident-Electron/**`, a `PROTECTED` artifact, a fence file, or a vendored byte is NOT fixable
here: it is a handoff (`R-10`) or an `ARCHITECT` escalation, full stop.**

| # | The adversarial probe |
| --- | --- |
| **`ADV-SH-1`** | **Is the "nothing moves" boundary a disguised DELETION?** Probe: construct the case in which `PD-UI-12`'s boundary, read literally, *permits* removing the host file's hosting responsibility because a slot host "owns" it. **Required reading: the boundary must be falsifiable as NOT-deleting** — §1.2 `B-1` plus §3.2 `F-4` must each fail loudly on such a row |
| **`ADV-SH-2`** | **Is the region-box ruling carriage a mere citation?** Probe: take `A-10` away and re-run §1.3's chain. **Required reading: the ruling must survive on its foundation sources alone** (`S-d2`/`S-d14`/`H-r17`/`Q6` + the adoption surface §9) — if it does not, this filing is citing the architect instead of verifying the foundation |
| **`ADV-SH-3`** | **Is the "seven rows have zero slot-host dependency" claim vacuous?** Probe: name any *one* of the seven rows and try to construct a slot-host dependency for it from the inventories. **Required reading: the negative must be a POSITIVE enumeration** — the seven rows' `Replaces` cells name eight foundation units and `U-SLOTHOST` is none of them (§1.4) |
| **`ADV-SH-4`** | **Is the `MUST-NOT-MOVE` list a real constraint or a copied table?** Probe: find a plausible adoption that satisfies every other clause of this filing yet moves C5/C12 out of the graph — e.g. `classNameOf` supplied by `zoneMirrorClasses`, or a host-created container holding the collapse toggle. **Required reading: §1.5 item 1 must catch it, and it must be a review finding rather than a permitted adapter** |
| **`ADV-SH-5`** | **Is the seam table honest about its sourcing?** `../Provident-Electron/docs/guide/seams.md` does **not** cover `slot-host.ts`/`owned-list-host.ts` at all — its *Where it lives* block names four mechanisms (`container.ts`, `relocate.ts`, `focus-model.ts`, `theme.ts`), its *What a fork must supply* table is the family's seam rows, and it explicitly redirects the sibling families (`U-GUTTER`, `U-GUTTER-UI`, `U-MENULIB`) to their own blocks. Probe: require every degradation row in §2.2 to cite `slothost.md`/`listhost.md` **and not** `seams.md` §"What a fork must supply" — **a row citing the seam page for these two hosts is a mis-sourced row, and a boundary that sourced them there would be asserting a degradation the foundation never declared** |
| **`ADV-SH-6`** | **Does the register exemption smuggle an exemption to a sibling?** Probe: read §6 clause 3 against §9 items 2/3. **Required reading: every code-bearing unit this boundary touches must still owe a register**, and a reviewer must be able to NAME which ones |
| **`ADV-SH-7`** | **Is the `ABSENCE` live row a silent park (`RCA-11`'s exact failure mode)?** Probe: require the row to state a **falsifiable structural reason** and to refuse the word *"waived"*. **Required reading: §4's reason is checkable by removing the unit's one file** — a live row that could not state such a reason would be a park |
| **`ADV-SH-8`** | **Does the filing create a new live slot indirectly?** Probe: read §8's re-pin table for any row that is a **new** assertion wearing an existing row id's clothes. **Required reading: `MATRIX_ROWS` is unchanged at 8, and `U-9` appears nowhere** |
| **`ADV-SH-9`** | **Is `B-1` filed or is it adjudicated?** Probe: read §10.1's *"what this filing does about it"*. **Required reading: it must NOT edit the inventory, must NOT re-classify its row, and must NOT re-open a settled adjudication** — the disposition is the supervisor's (§9 item 7) |
| **`ADV-SH-10`** | **Is `containerFactory` being quietly supplied?** `C-6`/`Q-E` name it as the program's obstacle and `§0A` note 3 promises nothing builds it. Probe: search this file for any clause that authorises a factory, an element-creation path, a shim member or an ambient read. **Required reading: §2.2 row 7 states *must be built* and §2.3 refuses to bind it — and a `src/**` element-creation path authorised under this unit's name is the finding** |

## 3b. The adversarial pass's disposition table — **the SHAPE this contract will be reconciled to**

| Column | What it will carry |
| --- | --- |
| `id` | `ADV-SH-n` |
| `severity` | `BLOCKING` · `HIGH` · `MEDIUM` · `LOW` |
| `class` | `BOUNDARY-INTEGRITY` · `CITATION` · `CONTROL-NODE-SAFETY` · `REGISTER` · `LAYER` · `DOC-DRIFT` |
| `owner` | `SUPERVISOR` (a tracker row or a finding route) · `ARCHITECT` (a ruling) · `INVENTORY-OWNING-PASS` (§10.1 `B-1`) · `N/A` (a read-only verification) |
| `status` | `REPORTED` · `VERIFIED-CLOSED` · `ESCALATED` |
| `fix-shape` | the least change that makes the probe fail loudly, or the escalation with its reason |

---

## 12. Cross-references (path + symbol / row id / `§section` — never a line number)

`docs/decisions.md` **`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS`** (clauses (1)/(2)/(3)) ·
**`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE`** (clauses (1)/(2)/(5)/(6)) ·
**`DECIDED: REBUILD-ARCHIVE-POLICY`** · `DECIDED: TAB-FOCUS-ACTIVATE-MATCHING-SEMANTICS` ·
`DECIDED: PROVIDENT-FOCUS-ADOPTS-THE-FOUNDATION-CONTRACT` ·
`docs/specs/post-division-rebuild-proposal.md` §1/§2/§3/§4.1/§4.2/§4.4/§4.5/§4.6/§4.7/§5 `G-1`…`G-9`/§7.3/§7.4/§7.5 ·
`docs/specs/post-division-rebuild-proposal-review.md` §1/§2/§3/§4/§5/§6 ·
`docs/specs/post-division-foundation-adoption-surface.md` §0/§3/§5 (rows 18/19/20)/§8/§9/§10/§11 ·
`docs/specs/post-division-local-elimination-inventory.md` §1/§2.0/§2.1 (`PD-REGION-1`, `PD-REGION-2`,
`PD-ZONES-1`, `PD-ZONES-3`, `PD-GESTURE-1..3`, `PD-FOCUS-1`, `PD-FOCUS-2`, `PD-HOST-KEEP`)/§3/§9 (`S-7`,
`S-12`)/§10/§11/§12 ·
`docs/specs/post-division-engine-offload-inventory.md` §5 ·
`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §2.1/§2.2/§5/§8/§9 · `vendor/foundation.lock.json` ·
`src/shared/slot-host.ts` · `src/shared/owned-list-host.ts` · `src/renderer/sidebar-panes.ts` ·
`src/renderer/index.html` · `src/renderer/pane-graph.ts` (`zoneMirrorClasses`) · `src/renderer/tab-strip.ts` ·
`scripts/live-drive.mjs` (`MATRIX_ROWS`) · `tests/unit-live11-bridge-seams.test.ts` ·
`docs/specs/astrographer-scope-realignment-review.md` §2.2 (`C7`, `C8`)/§4.1/§5.2/§6 ·
`docs/specs/ui-overhaul.md` §2.1 Table B · `docs/specs/rca-live-bugs-green-pipeline.md` (`RCA-11`, `RCA-12`) ·
`docs/specs/user-flow-audit.md` §2 · `docs/specs/requirement-catalog.md` §3.4 rule 7 ·
`docs/feature-requests/provident-electron-shell-chrome-handoff.md` §2 (C1/C2/C3)/§3.4/§3.9/§3.10/§4 ·
`../Provident-Electron/docs/specs/slothost.md` §0/§1/§2.1/§2.2/§2.3/§2.4/§2.5/§3.1/§3.2/§3.3 ·
`../Provident-Electron/docs/specs/listhost.md` §1/§2.1/§3.1/§3.2 ·
`../Provident-Electron/docs/specs/provident-electron-shell-chrome-handoff-review.md` `S-d2`/`S-d8`/`S-d14`/
`H-r8`/`H-r15`/`H-r17` · `../Provident-Electron/docs/specs/container.md` §2.4 ·
`../Provident-Electron/docs/guide/seams.md` (*Where it lives* + *What a fork must supply* — **noting explicitly
that it does NOT cover the two hosts**) · `../Provident-Electron/docs/next-steps.md` (`Q6`) ·
`../Provident-Electron/docs/decisions.md` (`SHELL-CHROME-CARVE-OUT-FUNCTIONAL`,
`PBT-REGISTER-REQUIRED-FOR-CODE-UNITS`).

---

## 13. Report to the supervisor (what this filing's pass must be able to say)

1. **The artifact** — `docs/specs/unit-pd-ui-12-slot-host-boundary.md` (this file), and the two anchored tracker
   appends (§11).
2. **The boundary, in one line** — **what STAYS** (`sidebar-panes.ts`'s hosting responsibility, the
   fork-authored region markup, the fork-local slot/status carriers, and `PD-UI-11`'s `KEEP`) · **what MOVES onto
   the vendored hosts: NOTHING** · **what is NEITHER: the region host (declined, and not to be re-created)**.
3. **The seam table's outcome** — **12 seam slots across the two hosts (`createSlotHost` 7 + `createOwnedListHost`
   5): `2` SUPPLIED (one as a mount only, one unbound) · `1` supplied-but-INCOMPATIBLE (`classNameOf`, whose
   only fork-side candidate would move a `MUST-NOT-MOVE` control node) · **`9` `MUST BE BUILT`** · with
   `containerFactory` named as **the program's one obstacle** (`C-6`/`Q-E`) and **nothing in this filing
   supplying it**.
4. **This unit's kind** — **A BOUNDARY RECORD, NOT A CODE UNIT**, with §1.4's four-clause justification and
   §6's **recorded register exemption** (doc-only, scoped, non-leaking).
5. **The sequencing consequence** — the **seven rows' dependency on the slot host is ZERO** (§1.4's verified
   enumeration); this record unblocks **the markup/declaration row's scope** (§9 item 2) and **nothing else**;
   **the seven rows proceed on their own waves**.
6. **The region-box ruling carried and what was verified** — `A-10` stands, **cross-verified against four
   foundation records and two inventories** (§1.3), with **`B-1` filed** because the inventory's
   `PD-REGION-1` still names the declined half.
7. **The `§5.U` note** — the matrix is **full at 8**, live work enters as a **re-pin**, the six carriers are
   named, **this unit asserts none**.
8. **Every UNVERIFIED item** — §10.2's `U-1`…`U-6`, with what would settle each.
9. **What this pass did and did not run** — **reads, `grep`s and `ls` only; no trio, no leg, no battery, no live
   session**; the layer is **DOC**.
