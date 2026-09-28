# STEP-0 ADOPTION DOSSIER — unit `PD-VENDOR` (the vendoring/pin unit)

**Status: STEP-0 INPUT — authored 2026-09-27. NO CODE LANDED, NOTHING RUN.** **Unit spec this dossier
serves:** `docs/specs/unit-pd-vendor-foundation-mechanisms.md`. **Program:**
`docs/specs/post-division-rebuild-proposal.md` §6.2 (the adoption semantics) + §7.4 (`Q-A`/`Q-F` rulings).
**Authority:** `docs/decisions.md` **`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE`** (ACTIVE),
clauses (1)/(2); `DECIDED: REBUILD-ARCHIVE-POLICY` (ACTIVE), clause (2).

**Layer (RCA-12, mandatory).** **DOC-LAYER.** This dossier adopts **identifiers**; it asserts **nothing** that
is app-green, envelope-green or live-green. Every source citation below is a **read** of
`../Provident-Electron` (the FOUNDATION, adjacent, **not an npm dependency**), or of this repo. **No md5, no
suite and no app was run by this pass** (this session had **no shell**; `md5sum`, `npm test`, `npm run build`
and the app were all unavailable or forbidden).

**Citation discipline.** `path` + **symbol** / **row id** / **§section**. **No line number appears in this
file** (`docs/specs/requirement-catalog.md` §3.4 rule 7).

**The rule this file exists to satisfy** — proposal §6.2, in its own words: *"Every unit whose contract names,
parameters or vocabulary originate **outside this project** … MUST carry an adoption dossier
(`docs/specs/<unit>-adoption-dossier.md`, ≤ 8 identifier rows, each with its source citation and `STATUS`).
… a unit with any undefined row is `BLOCKED-ON-SEMANTICS` and is escalated **in that pass**."* **And its
collision clause:** *"every adopted unit's dossier MUST carry a populated collision block — each adopted
identifier checked against the consuming repo's prohibition/vocabulary rows, each hit reconciled **by row
id** … or **re-named by an explicit re-name request** — **never by relaxing a prohibition**."*

---

## 1. The identifier table (8 rows — the cap, and it is FULL)

**`STATUS` is either `defined` or `undefined-until-answered`.** **An `undefined-until-answered` row BLOCKS
this unit at its gate and MUST be escalated in this pass — never deferred to a later filing.**

| # | Identifier | Source citation (foundation path + symbol + §) | Unit / domain / referent / evaluator | `STATUS` |
| --- | --- | --- | --- | --- |
| **1** | **`threshold`** | `../Provident-Electron/src/shared/relocate.ts` → `RelocateOptions.threshold` (read as an **optional value seam**, handed raw to `withinProximity`); `../Provident-Electron/docs/specs/relocate.md` §2.3 item 1 / §2.4 item 1 (the **one** comparison site); §2.2 `P-3`/`P-7`; the referent is pinned by `../Provident-Electron/docs/decisions.md` ACTIVE `U-RELOCATE-THRESHOLD-IS-THE-ZONE-PROXIMITY-DISTANCE`; the hazard's own record is `../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md` §2/§3 (the `selectors`/`threshold` incident) | **UNIT:** the vendored `src/shared/relocate.ts` (this unit copies it unchanged). **DOMAIN:** a distance compared by the module's **single** comparison site. **REFERENT:** *the caller's proximity distance for a relocate session* — **a VALUE, never invoked**. **EVALUATOR:** the foundation's ACTIVE decision row **+ this repo's own** `src/renderer/pane-drag.ts` `withinSnapThreshold(point, zone, threshold)` and `src/renderer/renderer.ts` `PANE_DRAG_CAPTURE_THRESHOLD` (the fork's two pre-existing threshold referents, which the dossier must reconcile against the adopted name) | **`defined`** |
| **2** | **`data-zone`** *(the CONSUMER-side attribute-name token, adopted as a **prohibition referent** — see §2 `C-1`)* | **The ban's own citation:** `../Provident-Electron/docs/specs/gsession.md` §2.2 **`P-1`** (*"no `data-zone`/`pane-collapse-toggle`-style attribute name"*) and **`P-7`** (row 4's rejected-shapes list, **consumer-side too**); `../Provident-Electron/docs/specs/gutter.md` §2.2 `P-5`; the enforcing rows are `gsession.md` §3.4 `R-1` and `gutter.md` §3.4 `R-1` | **UNIT:** the vendored `src/shared/gesture-session.ts` + `src/shared/gutter.ts` (**the ban binds THEIR bytes**). **DOMAIN:** the fork's own consumer-side gesture wiring. **REFERENT:** the fork's zone attribute, read by `src/renderer/renderer.ts` `GESTURE_SELECTOR`/`GUTTER_SELECTOR` and authored in `src/renderer/pane-graph.ts` + `src/renderer/index.html`. **EVALUATOR:** **NONE MAY BE ADOPTED IN THIS LAYER** — the token's evaluator is the fork's own consumer code, i.e. `PD-UI-4a`'s rewritten wiring, **which is not this unit**. **Declared reason for having none:** *the vendoring unit adopts the PROHIBITION, not the token* (§2 `C-1`) | **`defined`** |
| **3** | **`pane-collapse-toggle`** *(the CONSUMER-side class token, same class as row 2)* | **The ban's own citation:** `../Provident-Electron/docs/specs/gsession.md` §2.2 **`P-1`** + **`P-7`** (both name the `pane-collapse-toggle`-style token); `../Provident-Electron/docs/specs/gutter.md` §2.2 `P-5`; enforced by `gsession.md` §3.4 `R-1` | **UNIT:** the same two vendored modules. **DOMAIN:** the fork's consumer-side gesture surface. **REFERENT:** the pane-header class the fork's `renderer.ts` resolves (`GESTURE_SELECTOR`/`PANE_HEADER_CLASS`) and `pane-graph.ts` authors. **EVALUATOR:** **NONE IN THIS UNIT** — same declared reason as row 2; the fork-side owner is `PD-UI-4a` | **`defined`** |
| **4** | **`closest` / `selectors` / `querySelector`** *(the rejected lookup shape, adopted as a prohibition referent)* | `../Provident-Electron/docs/specs/gsession.md` §2.2 **`P-2`** (*"zero `closest`/`querySelector` calls"*), **`P-7`** (*"no per-event `closest(selectors)`"*), §3.4 `R-1`/`R-2`/`R-7`, §4.4 `S-1`; `../Provident-Electron/docs/specs/gutter.md` §2.2 `P-2` + §3.4 `R-1` | **UNIT:** the same two vendored modules. **DOMAIN:** consumer-side event routing. **REFERENT:** the fork's per-event element resolution. **EVALUATOR:** **NONE IN THIS UNIT**. **Declared reason:** the ban binds the **adopted modules' bytes** (which contain none of the three tokens — MEASURED, this pass) and the **consumer's future wiring**, which is `PD-UI-4a`'s; **adopting an evaluator here would be a second authority over another unit's seam** | **`defined`** |
| **5** | **`POINTER_TYPES`** | `../Provident-Electron/src/shared/gesture-session.ts` → `export const POINTER_TYPES: Readonly<Record<'start' \| 'move' \| 'end' \| 'cancel', string>>` (a **frozen** constant, the module's four event-type names); `../Provident-Electron/docs/specs/gsession.md` §0A **note 10** (*"the event types are the session's contract, and the consumer never supplies one"*), §2.1, §2.2 `P-1`/`P-5`; consumed as a **value** by `../Provident-Electron/src/shared/gutter-affordance.ts` and by `../Provident-Electron/tests/gutter-ui.test.ts` | **UNIT:** the vendored `src/shared/gesture-session.ts`. **DOMAIN:** the session's injected-source event contract. **REFERENT:** the four pointer event-type **strings**, mechanism-internal and **not substitutable** by a consumer (gsession.md §0A note 10). **EVALUATOR:** the vendored `gutter-ui.test.ts` imports the constant by **value** and drives it, and `gsession.test.ts` binds its shape — **both are the foundation's own node suites, i.e. envelope-layer evaluators**; **the fork adds none** | **`defined`** |
| **6** | **`capturePointer`** *(the source-supplied capture capability — a **declared-and-ignored** option, adopted as a prohibition referent)* | `../Provident-Electron/src/shared/gutter-affordance.ts` → **TWO `capturePointer` declarations** (MEASURED, this pass): the **optional capability method** `capturePointer?(element: unknown): void` on `EventSourceLike`, and the **optional boolean** `readonly capturePointer?: boolean` on `GutterAffordanceOptions` — the latter named in `../Provident-Electron/docs/guide/gutter-ui.md` *What a fork must supply* as **declared-and-ignored**; the capture **timing** ruling is `../Provident-Electron/docs/specs/gsession.md` §2.3 item 6 (*capture **after** establishment, per-control opt-in*) with §2.2 `P-3`/`P-7` and §0A note 9; this repo's own ruling on **deferred capture** is `docs/decisions.md` `DECIDED: PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE` clause 2 | **UNIT:** the vendored `src/shared/gutter-affordance.ts` (declares it) + `src/shared/gesture-session.ts` (owns the capture *call*, via the injected source). **DOMAIN:** pointer capture on the fork's control elements. **REFERENT:** *who may take capture, when, and through which channel* — the foundation answers *"after establishment, per-control opt-in, through the SOURCE, never a DOM call of the module's own"*. **EVALUATOR:** the fork's own capture rule is **`DECIDED: PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE` clause 2** (lazy capture at ≥ 4 px), which lives at the **consumer** layer and is **NOT rewritten by this unit** (§2 `C-3`) | **`defined`** |
| **7** | **`containerDeclarationFor`** | `../Provident-Electron/src/shared/container.ts` → `export function containerDeclarationFor(className: unknown): ContainerDeclaration`; the returned `declaration` is the module-owned constant `'contain: layout style paint'`, **returned as text and never applied** (`../Provident-Electron/docs/decisions.md` ACTIVE `E5-B-1-DECLARATION-IS-RETURNED-AS-TEXT-AND-NEVER-APPLIED`); `../Provident-Electron/docs/specs/container.md` §2.3 item 4 / §3.4 `R-8` (a **fresh record per call**) | **UNIT:** the vendored `src/shared/container.ts`. **DOMAIN:** the caller's own write site. **REFERENT:** *a `contain` declaration for the caller's class name, as data*. **EVALUATOR:** the foundation's ACTIVE decision row above **+ the fork's own consumer obligation** (`PD-UI-3`, **RE-ADMITTED as a BUILD** by `A-1`, with `tokenFn`/`axisResolver` supplied) — **which is a DIFFERENT unit**, so this unit declares the identifier and owns no evaluator for its application | **`defined`** |
| **8** | **`GestureSession`, `RelocateResetResult`, `FocusResult`, `FocusRefusal`, `FocusTransitionArg`** *(the five NON-EXPORTED return/argument shapes a consumer must re-declare)* | `../Provident-Electron/src/shared/gesture-session.ts` → `interface GestureSession` (**declared without `export`**; returned by `createGestureSession` and by the session handle); `../Provident-Electron/src/shared/relocate.ts` → `RelocateResetResult` (**without `export`**; the type of `RelocateSession.reset`'s return); `../Provident-Electron/src/shared/focus-model.ts` → `FocusResult`, `FocusRefusal`, `FocusTransitionArg` (**module-local**); **and the foundation's own guide states the class:** `../Provident-Electron/docs/guide/seams.md` *Gotchas measured in this repo* → *"Two return shapes you cannot import"* | **UNIT:** the three vendored modules above. **DOMAIN:** a consumer's own type surface. **REFERENT:** shapes that **values return** and that **callbacks take**, which the modules deliberately do not export. **EVALUATOR:** **the VENDORED SUITES** — `relocate.test.ts`, `focus-model.test.ts` and `gesture-session.test.ts` each re-declare the shape locally and assert against the module's **actual** returned values (`../Provident-Electron/tests/relocate.test.ts`'s module-type block; `focus-model.test.ts`'s structural surface type; `gesture-session.test.ts`'s type-only import block) — **envelope-layer evaluators only** | **`defined`** |

**Row tally:** **8 rows — the cap, and it is FULL.** **`defined`: 8.** **`undefined-until-answered`: 0.**
**No identifier was found undefined in this pass, so this dossier raises NO `BLOCKED-ON-SEMANTICS` row** —
**but it DOES carry four named escalations of a different kind** (§3), and the unit's own two gating open
items (`O-1`, `O-3` of the unit spec §1.3) are **outside this table's scope** (they are verification
obligations, not undefined identifiers). **A later pass that needs a ninth identifier MUST open a new dossier
or re-scope one of these eight — the cap is not elastic.**

---

## 2. The collision block — every hit reconciled BY ROW ID (never by relaxing a prohibition)

**What was checked (the scan this pass ran, and its result).** Every identifier above was checked against
**(a)** this repo's own prohibition/vocabulary rows — `docs/decisions.md` (a read for
`data-zone`/`pane-collapse-toggle`/`threshold`/`selectors`/`GESTURE_SELECTOR`) — **(b)** `src/**` for the same
tokens, **(c)** the foundation's own prohibition rows (`gsession.md` §2.2 `P-1`/`P-5`/`P-7`, `gutter.md` §2.2
`P-5`), and **(d)** the foundation's `selectors`/`threshold` incident record
(`../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md`). **Every hit is reconciled below,
with the row id that bans it, the reason for the ban, and why the identifier is legitimate (or NOT) in this
layer.**

### `C-1` — `data-zone` and `pane-collapse-toggle` (rows 2–3)

| Field | Reading |
| --- | --- |
| **The hit** | This repo uses **both** tokens live: `src/renderer/renderer.ts` `GESTURE_SELECTOR = '.gutter[data-zone], .pane-collapse-toggle'`, `GUTTER_SELECTOR`, `PANE_HEADER_CLASS`; `src/renderer/pane-graph.ts` authors `'data-zone'` props (four sites, incl. the zone root's `zone:${zone}`) and the `pane-collapse-toggle` class; `src/renderer/index.html` carries four `div.gutter[data-zone][data-axis]` and the `.pane-collapse-toggle` rule; `src/shared/dom-shim.ts`'s `closest` supports the compound selectors |
| **The ban** | **banned by row `gsession.md` §2.2 `P-1`** (*"no `data-zone`/`pane-collapse-toggle`-style attribute name"*) **and row `gsession.md` §2.2 `P-7`** (the `A-d3` rejected shapes, naming `data-zone`/`pane-collapse-toggle`-style **consumer** vocabulary) **and row `gutter.md` §2.2 `P-5`** — **for reason `Y`:** the gesture family owns **no consumer vocabulary**: its strings are its own result codes and event-type constants, and every zone/pane/attribute name is **caller data**, so that a consumer cannot smuggle a selector, an attribute lookup or a policy default into the mechanism's bytes (`gsession.md` §0A notes 9/10; `gutter.md` `P-5`'s *"the only strings this module owns…"*) |
| **The scope, read exactly rather than widened** | `gsession.md` §3.4 **`R-1`** *"scans the module's own file (comments included) and states the scope explicitly; the consumer's code is not what that row scans"* — **but `P-7` lists the rejected shapes as consumer-side too** (proposal §6.2's own corrected reading). **So the ban has TWO scopes: the modules' bytes (absolute) and the consumer's wiring (absolute for a NEW wiring).** |
| **RECONCILIATION** | **banned by row `gsession.md` §2.2 `P-1`/`P-7` + `gutter.md` §2.2 `P-5` for reason `Y` (no consumer vocabulary in the gesture family); legitimate in this layer because `Z1` — the tokens appear ONLY in the fork's PRE-EXISTING consumer code (`src/renderer/**`, `src/renderer/index.html`), which this unit does NOT write, does NOT edit, and does NOT re-point (its spec §2.1 item 6: no vendored module is imported by this repo today), and because `Z2` — the vendored modules' own bytes contain NEITHER token (MEASURED, this pass: the two modules carry no import and no such literal).** **NO PROHIBITION IS RELAXED:** the ban becomes the **binding requirement on `PD-UI-4a`'s rewritten `installShellPointers`** (proposal §6.2's own consequence) — `PD-UI-4a` inherits `C-1` as a **stated constraint**, and a `PD-UI-4a` landing that keeps `closest(GESTURE_SELECTOR)` is a review finding. **NO RE-NAME is requested** (the fork's tokens are not being adopted as mechanism vocabulary; they are being **recorded as what the ban forbids**). |

### `C-2` — `threshold` (row 1)

| Field | Reading |
| --- | --- |
| **The hit** | This repo has **two** threshold referents in live code: `src/renderer/pane-drag.ts` `withinSnapThreshold(point, zone, threshold: number)` plus its three call sites (`dropZoneForPoint`, `insertionIndexForPoint`, the drag session), and `src/renderer/renderer.ts` `PANE_DRAG_CAPTURE_THRESHOLD = 4` |
| **The ban** | **banned by row `gsession.md` §2.2 `P-5`** (*"no default value, no default bound, **no default threshold**"*) **and row `gsession.md` §2.2 `P-7`** (*"no `threshold` vocabulary"*) **and row `gutter.md` §2.2 `P-5`** (*"no unit string, no `'px'`, no `'0px'`, no `calc(`, **no `threshold`**, no `selectors`"*) — **for reason `Y`:** `threshold` is a **policy default** in disguise: the mechanism must hold none, so a `threshold` token in either module is the `P-5` violation. **The history of exactly this collision is `../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md` §2/§3 — the `threshold` incident: an adopted identifier crossed a project boundary as a NAME WITH NO MEANING, legitimate as an injected value on one side and contraband vocabulary on the other, and cost a full gate pass** (proposal §6.2 quotes this as the reason STEP-0 is not ceremony) |
| **RECONCILIATION** | **banned by row `gsession.md` §2.2 `P-5`/`P-7` + `gutter.md` §2.2 `P-5` for reason `Y` (no policy defaults in the gesture family); legitimate in this layer because `Z1` — the adopted referent is `relocate.ts`'s OPTIONAL VALUE SEAM, which is in `relocate.ts` (a module where the ban does NOT apply; the ban's rows scan `gesture-session.ts` and `gutter.ts`, and `gutter.md`'s `R-1` scans `src/shared/gutter.ts`), and it is pinned by the foundation's OWN ACTIVE decision row `U-RELOCATE-THRESHOLD-IS-THE-ZONE-PROXIMITY-DISTANCE` — so `threshold`'s referent is DEFINED at the source, which is precisely what was missing in the incident; and `Z2` — the fork's `withinSnapThreshold`/`PANE_DRAG_CAPTURE_THRESHOLD` are a DIFFERENT referent (a snap distance over zone boxes vs a capture travel), and they are NOT adopted, NOT re-pointed, and NOT removed by this unit — `PD-UI-4c` owns `pane-drag.ts`'s session half.** **NO PROHIBITION IS RELAXED; NO RE-NAME is requested.** **The unit spec records the outcome as its row 1's referent: a VALUE, never invoked** (unit spec §3.5/§4; `../Provident-Electron/docs/guide/seams.md` *Gotchas measured in this repo* — `createRelocateSession({ threshold: () => 24 })` never brings anything within proximity, because the option is handed raw to `withinProximity` whose `typeof` gate answers `false` for a non-number). |

### `C-3` — `capturePointer` / the capture-timing referent (row 6)

| Field | Reading |
| --- | --- |
| **The hit** | This repo takes capture **at gesture start**: `src/renderer/renderer.ts`'s delegated `pointerdown` calls `gestureEl.setPointerCapture(pointerId)` (FAIL-SOFT) and `onGestureMove` re-claims it lazily past `PANE_DRAG_CAPTURE_THRESHOLD` — i.e. the fork does **both** the banned immediate capture **and** the permitted deferred one |
| **The ban** | **banned by row `gsession.md` §2.2 `P-3`** (*"zero capture calls before establishment"*), **`P-7`** (*"no capture at `pointerdown`"*), **`R-3`/`R-7`**, and §0A note 9's ruling — **for reason `Y`:** capture before establishment creates a second gesture authority and retargets a plain click away from its own control. **The fork has ALREADY measured this exact defect:** `docs/decisions.md` `DECIDED: PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE` clause 2 records that an immediate capture on the frame made the pane header's own collapse toggle inert (defect `F-1`, live-confirmed, then FIXED + LIVE-CONFIRMED) |
| **RECONCILIATION** | **banned by row `gsession.md` §2.2 `P-3`/`P-7` for reason `Y` (capture before establishment retargets the consumer's own click); legitimate in this layer because `Z1` — the `capturePointer` identifier is adopted as a DECLARED-AND-IGNORED option of the vendored `gutter-affordance.ts`, and the module's own bytes carry no DOM capture token; and `Z2` — the fork's deferred-capture rule (`DECIDED: PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE` clause 2) is at the CONSUMER layer, is already the *weaker* of the two rules, and this unit neither re-points nor strengthens it — the rewrite belongs to `PD-UI-4a`.** **NO PROHIBITION IS RELAXED; NO RE-NAME.** **Recorded as a finding for `PD-UI-4a`, not actioned here.** |

### `C-4` — `POINTER_TYPES` (row 5): **CHECKED, NO HIT**

`'pointerdown'`/`'pointermove'`/`'pointerup'`/`'pointercancel'` are the fork's own live listener names
(`src/renderer/renderer.ts`'s delegated wiring; `src/shared/dom-shim.ts`'s synthetic pointer dispatch). **No
prohibition row bans them**: `gsession.md` §0A note 10 states the event-type names are **the mechanism's own
contract with its injected source and NOT consumer vocabulary**, and `R-1`'s scope **excludes** the module's
legitimate event names from its scan. **Reconciliation: no hit — `POINTER_TYPES` is the module's mechanism
vocabulary, and the FOUNDATION's row (`gsession.md` §0A note 10, §2.2 `P-1`) is the authority for that
reading, not this dossier.** **One recorded consequence for the fork:** because the four types arrive as a
**value** (`POINTER_TYPES`) and `gsession.md` §0A note 10 gives the consumer **no parameter, option, union
member or default** by which to substitute one, **the fork's future wiring must not expect to pass its own
event types** — recorded here rather than discovered in `PD-UI-4a`'s red set.

### `C-5` — `containerDeclarationFor` (row 7): **CHECKED, NO HIT**

A read of `src/**` for `contain:` returns **zero matches** (the same reading the proposal records for
`PD-UI-3`), so the identifier is **absolutely new** in this repo — **no collision, no prohibition row names
it, and no re-name is requested.** Its consumer obligation is `PD-UI-3`'s (`A-1`'s re-admission), not this
unit's.

### `C-6` — the five non-exported shapes (row 8): **CHECKED, NO HIT**

A read of `src/**` for `GestureSession`, `RelocateResetResult`, `FocusResult`, `FocusRefusal` and
`FocusTransitionArg` returns **zero matches** — the fork does not declare or use any of them. **No collision;
no prohibition row names them.** **RECORDED CONSUMER COST:** a fork consumer must **re-declare** them
(`../Provident-Electron/docs/guide/seams.md` *Gotchas measured in this repo*), and **the module bytes may not
be patched to export them** — patching would break the byte-identity the unit's row `P-IM-1` asserts
(`AGENTS.md`'s `G-8`: a foundation spec defect is **handed off**, never absorbed; a foundation EXPORT gap is
the same class). **Escalated to the handoff list, not fixed here.**

### `C-7` — the stem collision `src/renderer/theme.ts` ↔ the vendored `src/shared/theme.ts`: **CHECKED, NO HIT, RECORDED**

The fork's `src/renderer/theme.ts` shares a **file stem** with the vendored `src/shared/theme.ts` but **not a
specifier**: the fork imports `./theme.js` from `src/renderer/`, while the vendored module is reached as
`src/shared/theme.js`. **MEASURED:** a read of `src/**` for `from '…/<name>.js'` over the fifteen adopted
names returns **three matches, none of them a vendored member** (`renderer.ts` → `./pane-gutter.js`,
`./theme.js`; `sidebar-panes.ts` → `./pane-gutter.js`). **No prohibition row bans either name** (both are
ordinary fork module names, and `theme` is this repo's own `UI-CONFIG-CARRIER` vocabulary). **Reconciliation:
no hit — the two modules are distinguished by PATH, and the unit spec records the finding so a later pass
does not read the shared stem as a conflict.** **NO RE-NAME requested** — a re-name of either file would
falsify the pin (foundation side) or the fork's own imports (consumer side), and neither is this unit's to
change.

---

## 3. Escalations (the dossier's own owed list — named plainly, never deferred silently)

| # | Escalation | Why it cannot be settled here |
| --- | --- | --- |
| **`A-1`** | **The `threshold` referent's FORK-SIDE half.** Row 1 declares the adopted referent defined (the foundation's own ACTIVE decision row), but **this repo has TWO threshold referents of its own** (`withinSnapThreshold`, `PANE_DRAG_CAPTURE_THRESHOLD`), and **whether they must be re-named, re-pointed or left untouched** is `PD-UI-4c`'s/`PD-UI-4a`'s boundary. | A vendoring unit **may not** dispose another unit's identifiers (`R-6`'s discipline applied to vocabulary: the program's §6.2 forbids deferring, and it equally forbids absorbing a sibling's referent into a unit with no consumer). **Escalated to the wave owners.** |
| **`A-2`** | **The `data-zone`/`pane-collapse-toggle` ban's consumer-side enforcement.** `C-1` establishes that the tokens are legitimate **today** (pre-existing fork code, untouched) and **forbidden in the rewrite** (`PD-UI-4a`, per proposal §6.2's own consequence). **No row of this unit can enforce that** — this unit authors no consumer. | The enforcement row belongs to `PD-UI-4a`'s spec (its `R-1`-class vocabulary row). **Escalated: `PD-UI-4a` inherits `C-1` and `C-3` as binding constraints.** |
| **`A-3`** | **The five non-exported shapes (`C-6`) are a FOUNDATION-side export gap**, and `G-8` says a foundation defect is **handed off, never patched**. | The handoff row (`docs/defects.md` → `docs/HANDOFF.md`) is the **supervisor's write**; this dossier supplies the reading. **Never patched in the vendored bytes.** |
| **`A-4`** | **The dossier cap is FULL at eight.** Any further identifier (e.g. a per-module seam name for a specific wave) **cannot be added here** without removing a row. | The cap is the architect's (`≤ 8`); removing a row would drop a reconciliation this unit needs. **Escalated: a wave that needs a ninth identifier opens its OWN dossier, or requests a re-scope.** |

**And the two gating items that are NOT dossier rows (carried from the unit spec §1.3, named here so a reader
of this file sees them):** **`O-1` — the md5 table is UNVERIFIED** (this session had no shell; `md5sum` could
not be run, so the proposal's §2 digest table is neither reproduced nor falsified — the recomputation is a
recorded **pre-red obligation**); **`O-3` — the conformance leg's pass condition and colour are UNVERIFIED**
(eleven of the fifteen foundation suites carry foundation-repo audit rows that cannot pass here, and the
leg's scoping is escalated).

---

## 4. Cross-references (path + symbol / row id / `§section` — never a line number)

`docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` ·
`DECIDED: REBUILD-ARCHIVE-POLICY` · **`DECIDED: PANE-DRAG-HEADER-ONLY + DEFERRED-POINTER-CAPTURE`** (clause 2
— the fork's capture rule, reconciled at `C-3`) ·
`docs/specs/unit-pd-vendor-foundation-mechanisms.md` (§2.1 the set, §3.5 the leg, §1.3 the honesty block) ·
`docs/specs/post-division-rebuild-proposal.md` §2/§6.2/§7.4 ·
`docs/specs/post-division-rebuild-proposal-review.md` §3/§4 ·
`docs/specs/post-division-foundation-adoption-surface.md` §1/§2/§9 ·
`docs/specs/post-division-local-elimination-inventory.md` §2.1 ·
`docs/specs/requirement-catalog.md` §3.4 rule 7 ·
`../Provident-Electron/src/shared/relocate.ts` → `RelocateOptions.threshold`, `withinProximity` ·
`../Provident-Electron/src/shared/gesture-session.ts` → `POINTER_TYPES`, `GestureSession` ·
`../Provident-Electron/src/shared/gutter-affordance.ts` → `capturePointer` ·
`../Provident-Electron/src/shared/container.ts` → `containerDeclarationFor` ·
`../Provident-Electron/src/shared/focus-model.ts` → `FocusResult`/`FocusRefusal`/`FocusTransitionArg` ·
`../Provident-Electron/docs/specs/gsession.md` §0A notes 9/10, §2.2 `P-1`/`P-2`/`P-3`/`P-5`/`P-7`, §2.3 item 6,
§3.4 `R-1`/`R-3`/`R-7`, §4.4 `S-1` ·
`../Provident-Electron/docs/specs/gutter.md` §2.2 `P-2`/`P-5`, §3.4 `R-1` ·
`../Provident-Electron/docs/specs/relocate.md` §2.2 `P-3`/`P-7`, §2.3 item 1, §2.4 item 1 ·
`../Provident-Electron/docs/specs/container.md` §2.3 item 4, §3.4 `R-8` ·
`../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md` §2/§3 ·
`../Provident-Electron/docs/guide/seams.md` *Code, runnable* + *Gotchas measured in this repo* ·
`../Provident-Electron/docs/guide/gutter-ui.md` (*What a fork must supply*) ·
`../Provident-Electron/docs/decisions.md` `U-RELOCATE-THRESHOLD-IS-THE-ZONE-PROXIMITY-DISTANCE`,
`E5-B-1-DECLARATION-IS-RETURNED-AS-TEXT-AND-NEVER-APPLIED`.
