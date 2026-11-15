# `U-1` zone-vocabulary — CHANGE-ANALYSIS (the item-8 gate's third review, 2026-11-15, `role_l1_architect`)

**The chain this file completes:** `AGENTS.md` item 8 runs three sequential reviews on a proposal that
changes this repo's contract — validity → critique → change-analysis — and the third requires both prior
outputs. **This is the third.** Step 1 is `strata/records/foundation-import-u1-validity-2026-11-15.md`
(verdict `ADJUDICATION`, four blocking decisions + a carrier list that cannot paint); step 2 is
`strata/records/foundation-import-u1-critique-2026-11-15.md` (verdict `ADJUDICATION` — the unit fuses a
~300-site mechanical rename with a ~5-file behaviour change whose semantics collide). Neither reviewer saw
the other; **both findings sets are carried below, none is dismissed because the other contradicts it.**
The contract under review is `docs/L1/foundation-import-program.md` §3 `U-1`; the proposal changes the
**MCP-visible** `zone:` target vocabulary (`UF-LAYOUT-2`, `docs/specs/user-flow-audit-checklist.md:142`,
contract-pinned) and the serialized `OperatorSettings.layout` slice, which is why item 8 applies at all.

**Markers.** `RUN` = a command reading quoted with its runner; `READ` = read in this pass by this pass;
`RECORDED` = measured elsewhere and quoted with its measurer. **This pass holds no shell of its own**: every
`RUN` below was executed by a delegated READ-ONLY measurer (`role_l1_examiner`) at head **`161c614`**,
working tree clean (`git status --porcelain` → `0` lines), and its figures are quoted, never re-derived.

**Layer declaration (mandatory).** Nothing here is app-green, envelope-green or instrument-green. A rename's
evidence is a source-clause census and an authored-node assertion (envelope); the paint, the anchored control
and "no resize strip" are **G8-only** rows (the live leg); the node suite runs under a layout-less DOM shim
(`brief.md` §6, D-10, RCA-12). **This file therefore resolves design questions and supplies no reading of the
assembled app.**

---

## 1. What the third step is for, and what it did

Steps 1 and 2 each stopped at `ADJUDICATION`: they established **that** the unit as filed cannot be built and
returned the decisions to the owner. The third step's job is different — it must **dispose of every finding**
(`RESOLVED` by a design choice, `ESCALATED` as a question, or `DEFERRED` to a named unit with its reason),
and it must leave behind a contract that is buildable, reviewable per unit, and red-able before its first
byte (RCA-1, RCA-2, RCA-5).

It re-measured the reach rather than quoting D-16's price (D-18's landing consequence) and made one
structural finding of its own, which drives the whole re-shape:

> **THE RENAME HAS A RED AFTER ALL — but not where the critique looked for it.** The critique's "the rename
> has no red state" (`critique` row 14) is true of the *spelling property* and false of the *unit*: a rename
> of `LayoutZoneName` silently corrupts every persisted profile, and the migration that prevents that
> corruption is a **node-visible, gradable red** (a v1 fixture whose `header`/`footer` placement must survive
> coercion). Pairing the rename with the migration it forces converts finding 3 from an accident into the
> unit's own red. Measured cases follow at §2.3.

---

## 2. The blocking set — nine findings, each disposed

### 2.1 The anchored hide control's PLACEMENT — `RESOLVED` (sibling, authored once per zone)

**The finding (validity row 2; `critique` row 1's nested-box half).** The fork authors the zone control as
the **zone container's CHILD** (`src/renderer/pane-graph.ts:225-247` returns the toggle, `:542-549` merges it
into the container's children); an empty zone's track is `0px` (`src/renderer/index.html:154-157`, the landed
F-3 fix) and the container is a `position: fixed` box of exactly that extent (`:191-195`), so the child is
buried in precisely the state the control exists to reverse. The foundation authors the same control as the
zone's **following sibling** (`../Provident-Electron/src/shared/demo-envelope.ts:756-778`) and reads its glyph
through `[collapsed="true"] + .zone-collapse::before`.

**Disposition.** `RESOLVED`: the control becomes a **sibling** of its zone container in the authored envelope,
authored at `templateRoot.children` immediately after that container, carrying
`props: { id: 'zone-collapse-<zone>', zone: <zone> }`, `content: ''`, and one shared handler name — the same
shape the fork already uses for the four **authored gutter affordances** (`pane-graph.ts:53`, `:588-596`),
which are root-level siblings with an idempotence scan. Its glyph is the sheet's, read off the container's own
painted collapse attribute through the adjacent-sibling combinator; its box is read off the same
`--zone-<zone>-track` tokens the container and the gutters consume, anchored by `#app`'s `contain: layout`
(`index.html:126-132`) — so a `0px` extent leaves the control at the collapsed edge, painted and pressable.

**The foundation's three reasons, re-measured against the fork — two transfer, one does not, and the design
says which.** (a) *A `size: 0` zone buries a child in a box nothing can press* — **transfers**, and is the
decisive one here. (b) *`driveZoneArrangement` re-anchors everything standing INSIDE a zone* — **transfers in
fork form**: the zone-container loop merges authored children into an existing container on **every**
re-assembly (`pane-graph.ts:542-549`), so a child is a subject of every assembly turn, and an affordance must
not be one. (c) *`paintStyle` hands the engine one `css.style` in `replace` mode, so a zone can state no
placement for a child* — **does NOT transfer**: the fork's zone geometry is projected CSS custom properties
(`layout-state.ts:306-375`, `layout-vars.ts:63-83`), not `paintStyle`. The placement rests on (a) and (b)
alone; (c) is recorded as not-transferring rather than quoted as support.

**Cost.** One authored node family per zone (~15 lines in `pane-graph.ts`), one idempotence scan (the gutter
family's, reused), four positional rules + the `+` glyph rule in `index.html` (~8 lines), one adjacency
assertion in the unit's own row, and one G8 row for the paint. **No CSS geometry is re-derived**: the control
consumes the existing track tokens.

### 2.2 `ZoneLayout.minimized` is required and total — `RESOLVED` for storability, `ESCALATED` for meaning

**The finding (validity row 3; `critique` row 2).** `ZoneLayout.minimized` is a **required** boolean
(`layout-state.ts:57-60`), seeded `false` by `defaultLayout` (`:136-149`) and coerced as
`value.minimized === true` (`:127-133`) — so "nothing stated" and "stated `false`" are the same value, and
"an act writes `false` rather than toggling absence" has nowhere to live. `P-SM-2`
(`docs/specs/unit-u-shell-1-layout-zones.md:252`) pins `typeof L.zones[z].minimized === 'boolean'` **and**
`L.version === 1`, so any shape change is a graded red, not a silent edit.

**Two halves, two dispositions, because they are not the same question.**

- **Storability — `RESOLVED`.** The zone record's collapse member becomes **optional**
  (`collapsed?: boolean`): absence = "nothing stated, derive"; a present `true`/`false` = the operator's
  statement and wins over the derivation; `defaultLayout()` **omits** the member (a seeded `false` would make
  the derivation never fire — the sharp edge, stated); `coerceZoneLayout` preserves absence; the act writes an
  explicit `false`, never a delete. **Which unit:** `U-1b` (§3).
- **Meaning — `ESCALATED` (question 1).** `minimized` today means *"the operator minimized an OCCUPIED zone
  to a tab strip, `size` retained"* (`pane-graph.ts:238-246`, `:467`; `pane-drag.ts:244-262`;
  `sidebar-panes.ts:3478-3487`); the foundation's `collapsed` means *"a zone's extent is collapsed, derived
  from emptiness, the record may overturn"* (`../Provident-Electron/docs/guides/forking.md` §7.1,
  lines 476-498). **D-16's own clause commands this escalation rather than a rename.** It cannot be derived
  from a recorded decision, and it changes what gets built.

**Cost.** ~5 files, one optional member, one act, one derivation, one paint family — and **the answer decides
whether the fork keeps a tab strip at all** (§2.7).

### 2.3 The persisted `layout` slice is not migrated — `ESCALATED` (question 2), with the design recommendation

**The finding (validity row 4; `critique` row 3).** The slice stores `zones.<zone>` keys and
`panes[].zone = 'header' | 'footer'`; `coerceLayout` maps an **unknown** zone to `'left'`
(`layout-state.ts:200`) and an unknown zone key to that zone's default size (`:206-212`), and
`LAYOUT_VERSION` stays `1` (`:82`). So after the rename **every existing install silently relocates its
header/footer panes into `left`** and resets a resized header/footer track to the default — **on every load,
and re-persisted on the next write, with no test red.** `P-SM-2` pins `L.version === 1`, so a real migration
is a graded red.

**Measured, `RUN` (this pass's measurer).** The live carrier exists on this machine and carries the old
spelling: `<userData>/provident-operator-settings.json` (path literal at `src/main/main.ts:585`;
`~/.config/provident-electron/…`, `1206` B) reads
`{"version":1,"panes":[{"id":"doc-nav","zone":"left",…},{"id":"search","zone":"left",…}],"zones":{"left":{"size":220,"minimized":false},"right":{…},"header":{"size":48,"minimized":false},"footer":{"size":48,"minimized":false}},…}`
— **`header`/`footer` zone keys present**; both panes happen to sit in `left`, and `48px` happens to be the
default, so **the damage is invisible on this machine and visible on any install whose operator placed a pane
in `header`/`footer` or resized those tracks.** That asymmetry is exactly why this cannot be left to review.

**Disposition.** `ESCALATED` (question 2). The recommendation, if the owner licenses it: **bump
`LAYOUT_VERSION` to `2` and add a v1 arm inside `coerceLayout`** — the migration lives entirely in
`src/renderer/layout-state.ts` (module `shell-chrome`), so **`src/main/operator-settings-store.ts` moves no
byte** and its `P-TH-SM-1(f)` md5 pin stays intact; the store already calls `coerceLayout` on read
(`:163`, `:285`) and on set (`:321`). **Cost:** ~40 lines in one function + `P-SM-2`'s version cell re-grained
+ one D-17 clause + the unit's new migration row; the alternative (accept the relocation) costs one line of
recorded acceptance and silently loses operator placements on upgrade; a third option (accept the old
spellings as aliases forever) costs D-14 — it leaves two vocabularies in the tree.

### 2.4 The theme carrier `[theme="dark"]` cannot land through `ThemeRoot` — `RESOLVED` by SPLIT (`U-1c`)

**The finding (validity row 5; `critique` row 6).** `ThemeRoot` exposes only `dataset` (`theme.ts:36-41`) and
the write is `root.dataset.theme = write.value` / `delete root.dataset.theme` (`:52-75`) — a `data-theme`
attribute. A bare `[theme="dark"]` needs `setAttribute('theme', …)` / `removeAttribute('theme')`. The
vendored helper is not the obstacle: it **takes the attribute name as the caller's argument** and the fork
already passes `'theme'` (`:54`; `src/shared/theme.ts:67-73`), so only the adoption of the returned
`{name, value, removal}` record at the write site changes.

**Disposition.** `RESOLVED` — **the carrier keeps its ruling and moves to its own unit, `U-1c`.** Three
reasons, each falsifiable: **(a)** the current shape is not an oversight but a **landed ruling** — `A-7`
(2026-09-28) in `theme.ts:58-66` records that the element-level removal mechanic "is NOT taken" *because* it
would widen `ThemeRoot`; the carrier therefore owes a **dated superseding clause** (a `docs/specs/` act) that
deserves its own review, not a footnote inside a 300-site rename; **(b)** it has **real reds** — the two
`html[data-theme='light'|'dark']` selectors are asserted structurally by
`tests/pd-ui-1-theme-register.test.ts:710-725` (`P-TH-SM-1(e)`, which re-grains to `html[theme=…]` and reds
at the head) **and** by `tests/unit-zone-replacement-register.test.ts:3147-3175`, whose `bodyOf()` returns
`''` for the old pattern and whose control row then reports "the three THEME blocks are not readable"
(`:3567-3571`) — so `U-1c` can satisfy RCA-1 honestly, which the zone rename alone cannot; **(c)** it is
orthogonal: nothing in the zone vocabulary or the collapse reading consumes the theme carrier, and no ported
rule in `U-1a`/`U-1b` reads `[theme=]`. **D-14 is untouched** — the carrier still lands as `[theme="dark"]`;
only its unit slot moves.

**Cost.** `ThemeRoot` widened to a structural write surface, two arms re-written, three theme blocks in
`index.html:16,34,54` re-grained, two census rows re-pointed, one superseding clause. **No md5-pinned byte
moves** (`theme.ts` and `index.html` are not among the seven rows) — a fact this pass measured, and the
opposite of what the filed unit implied.

### 2.5 The MCP-visible half is graded by no row — `RESOLVED` (a literal limb, red before / green after)

**The finding (`critique` row 8).** `UF-LAYOUT-2` (`scripts/live-drive.mjs:7469-7494`) compares the `zone*`
id **set** before and after a content change (`:7488-7491`), so a rename that moves every id **equally** keeps
the row green while asserting nothing; its `list_targets` filter is `propsId.startsWith('zone')` (`:7481`),
which also admits `zone-minimize-*`, `zone-gutter-*` and `zone-tab-*`, so even a *changed* id set is not
name-graded. The contract-pinned checklist cell spells `zone:header`/`zone:footer`
(`user-flow-audit-checklist.md:142`).

**Disposition.** `RESOLVED`, and derivable rather than a question: **D-16 requires the row to move with the
ids** ("`UF-LAYOUT-2` is re-grained to the new spellings rather than waived: the agent-visible ids move, and
the row that checks them moves with them in the same commit"). Concretely: `UF-LAYOUT-2` gains a **literal
container-id limb** — the zone **containers** are separated from the controls by id shape (`zone:<name>`) and
asserted to equal the closed four, spelled, before **and** after the content change. **That limb is RED at
this head** (`zone:header`/`zone:footer` present, `zone:top`/`zone:bottom` absent) and green only after the
rename, so the MCP-visible change acquires a red it did not have. `U-1a` additionally authors an L1 row
asserting the **assembled envelope's** container ids and `[zone=]` carriers (node-level, envelope class), so
the change is graded in the trio and not only in the live leg. The checklist cell re-grains under D-17.

**Cost.** ~6 lines in the driver row (`RUN` at G8), one L1 row, one doc cell. **No new matrix slot**: `R-10`
(`unit-zone-replacement.md:32`) forbids adding one, so this is a **re-pin of an existing row**.

### 2.6 The collapse extent competes with a landed mechanism (F-3) — `RESOLVED` by scope-narrowing, `DEFERRED` behind question 1

**The finding (validity row 12; `critique` row 4).** The fork's collapse is **already** a derivation writing
`'0px'` — `zoneTrackVars` projects `0px` for a zone with zero enabled+placed panes (`layout-state.ts:306-375`,
`:367-372`), the empty-token `'0px'` is caller data (`:268-277`), `index.html:154-157` consumes it, and the
landed F-3 fix is carried by a live `PASS`. Porting the foundation's `auto`/`hidden` extent would be a
**second** collapse mechanism over the same word, not a new capability.

**Disposition.** `RESOLVED` for the empty-zone case: **the fork's `0px` derivation is the empty-zone collapse
and stays untouched** — `U-1a`/`U-1b` add no extent rule for it, and F-3's defect row and its live
`PASS` are cited by the unit's contract as the landed mechanism it must not fork. `DEFERRED` for the
occupied-zone case: the `auto`/`hidden` extent is **only meaningful if question 1 answers "one collapsed
state"**, and it then lands as `U-1b` clause `C-4` with its own G8 row; if question 1 answers "two states",
that clause is never written and no extent rule is ported at all. **Named unit, named reason, no drift.**

**Cost.** Zero if the answer is "two states"; one paint family + one G8 row if it is "one".

### 2.7 `index.html` — densest carrier, most silent — `RESOLVED` (in scope, graded by a census + the §3.2 escape)

**The finding (validity row 1; `critique` row 10).** `src/renderer/index.html` (375 lines) carries
**21** `data-zone` occurrences, **20** `--zone-` token mentions, `zone:header`/`zone:footer`/
`zone:left`/`zone:right` once each, and `9`/`10` `zone-header`/`zone-footer` mentions (`RUN`); it is not
typechecked, is invisible to the layout-less shim, and appears in the filed unit's list without a rule.

**Disposition.** `RESOLVED`. It is in `shell-chrome`'s claimed path (`src/renderer`) and therefore already in
scope; what the re-shape adds is **accountability**, in three limbs that already exist in the corpus:
**(a)** a **source-clause census** in `U-1a`'s own row (per-selector-family counts, target spelling present,
old spelling absent) — a mechanical red that runs in the trio; **(b)** the **same-pass re-point obligation**
`unit-zone-replacement.md:150` (§3.2) already imposes on any vocabulary change — both dependents named, the
`GESTURE_SELECTOR` family (`renderer.ts:467,472`) **and** the two `index.html` cursor rules — with the DONE
row required to name old and new vocabulary and both sites; **(c)** a **G8 row** for what only the painted app
can see. **Not** claimed: that a census grades the paint (D-10, RCA-12).

**Cost.** The census is cheap (~20 assertions); the re-point is the obligation that makes the silence
impossible.

### 2.8 The seven md5-pinned digests — `RESOLVED` (re-record per the row's own licence), with a corrected count

**The finding (validity row 6; `critique` row 5).** `P-TH-SM-1(f)`
(`tests/pd-ui-1-theme-register.test.ts:727-737`) holds **seven** recorded md5 digests
(`:121-250`), two of which are files the filed `U-1` declared: `src/renderer/sidebar-panes.ts` and
`src/main/preload.ts`.

**Measured, `RUN`.** All **seven read MATCH at this head** (`161c614`), so the row is green now and every byte
moved in those files owes a recorded re-statement — which the row's own text licences ("a later pass may move
the file only by re-stating it here, with its reason and its unit named"), keeping the superseded value
visible and the `restated:` field populated. The `UNRESTATED_CONTROL_PATH` is **derived** from the table
(`:276-284`) and resolves to `src/shared/demo-envelope.ts`; both affected rows **already** carry a
`restated:` field, so re-stating them moves nothing in the derivation.

**Corrected count (`READ`, this pass).** Under the split the two files do **not** fall in the same unit:
`preload.ts` carries **no zone literal** (its `zone:` parameters are generic strings; `:75-76`, `:105-106`,
`:240-241`, `:661-662`) and moves only when the **seam name** moves — `U-1b`; `sidebar-panes.ts` carries
`LayoutZoneName` and moves in `U-1a`, and moves **again** in `U-1b` if question 1 renames the member (it reads
`base.zones[zone]?.minimized === true` at `:953` and `:3661`). **So the split owes two re-statements
(`U-1a`: `sidebar-panes.ts`; `U-1b`: `preload.ts`) and a third only if question 1 answers "one member".** The
table stays **seven rows**; no tooth is relaxed. **`U-1c` moves no pinned byte.**

### 2.9 The state-vocabulary collisions must land with the behaviour — `RESOLVED` (they do, and the rule is stated)

**The finding (`critique` rows 1/2/13; validity row 9).** `minimized`→`collapsed`, `data-minimized`→,
`is-minimized`→, `zoneMinimizeToggle`/`paneTabExpand`, and pane `order`→`index` cannot be a later sweep
(D-14/D-16), and neither deferral order works: behaviour-first leaves `collapsed` occupied by the tab-strip
meaning and re-reds the same rows when the derivation reopens it; rename-first does the same in the other
direction.

**Disposition.** `RESOLVED` by one governing rule, which the split encodes:

> **A NAME LANDS IN THE SAME COMMIT AS THE BEHAVIOUR THAT FILLS IT. A name whose MEANING is unsettled does
> not land at all until the meaning is ruled.**

Applied: `order`→`index` is a **spelling** move over a settled meaning (a per-pane position within its zone,
`layout-state.ts:46-53`) and travels in `U-1a` with the record-schema migration it shares. `collapsed`'s
meaning is **unsettled** — so it lands in `U-1b`, together with the derivation, the act, the paint class and
the two seam names, as **one** unit whose commit never opens the member twice. `minimized` keeps its name
until then, which is not "two vocabularies" but one word that has not been re-glossed (D-14 is about a name
two trees spell differently *for the same thing*; here the two trees mean different things — §2.2).

**Cost.** `U-1b` carries the whole state-vocabulary rename (~39 seam sites `RECORDED` by the critique,
`56` `minimize` occurrences across 7 `src` files and `14` `is-minimized` occurrences `RUN` this pass) — but it
carries it **with** the behaviour, in a unit small enough to review, which is the point.

---

## 3. The re-shape: one unit becomes three, and why that is not the sweep D-14 forbids

`U-1` is split into **`U-1a` `zone-vocabulary`** (the rename + the migration it forces), **`U-1b`
`zone-collapse`** (the statement, the derivation, the anchored control, the state vocabulary), and **`U-1c`
`theme-carrier`** (the `[theme=]` carrier and the superseding clause). Contracts:
`docs/L1/unit-u-1a-zone-vocabulary.md`, `unit-u-1b-zone-collapse.md`, `unit-u-1c-theme-carrier.md`; the map's
§3/§4/§5/§6 are re-grained in the same pass as this file.

**Why a split at all.** RCA-2/RCA-5 require a multi-unit deliverable to be split **per unit** before any unit
starts, and they exist to prevent exactly this shape: a commit carrying ~300 mechanical edits plus the
behaviour, where review of the behaviour stops being possible (`critique` row 13). Three properties fall out:
each unit gets its own red→green→adversarial→greens cycle; each lands as its own DONE row; each has a red set
that exists **before** its bytes (RCA-1), which the fused unit could not claim.

**Why it does not violate D-14/D-16 ("never a separate sweep that leaves the tree reading two vocabularies").**
Each landing is internally complete for the vocabulary it claims: after `U-1a` no file spells a zone name two
ways (the four-name domain, `[zone=]`, `zone:top|bottom|left|right`, the track tokens, the grid areas, the
driver, the persisted migration); after `U-1b` no file spells the collapse state two ways; after `U-1c` the
theme carrier is single-spelled. What the split refuses is **the double-gloss** — renaming one word to `top`
while another word's meaning is still under adjudication — which is what the fused unit would have done
silently.

**The order and each unit's own acceptance** (in the map's §4, restated here as the decision):

| Order | Unit | Its own acceptance |
|---|---|---|
| 1 | `U-1a` `zone-vocabulary` | the four-name domain + `[zone=]` + `zone:` ids + track/area tokens move; the v1 profile fixture migrates; the source-clause census reads the target and no old spelling; the two registers' re-grained cells green; `UF-LAYOUT-2`'s literal limb green at G8; one md5 row re-recorded |
| 2 | `U-1b` `zone-collapse` | the optional member + the derivation + the act-writes-`false` + `size` untouched arms; the control's sibling adjacency in the assembled envelope; "no resize strip" and the paint as G8 rows; the state vocabulary re-grained with the behaviour; `preload.ts` re-recorded |
| 3 | `U-1c` `theme-carrier` | `ThemeRoot`'s widened write surface writes `setAttribute('theme', …)` and removes via `removeAttribute`; the three theme blocks carry `html[theme=…]`; both theme censuses green; `A-7` superseded by a dated clause; zero pinned byte moved |

`U-2`/`U-3`/`U-4` are unchanged and still depend on `U-1a` (their renamed carriers) and `U-1b` (the collapse
seam); `U-1c`'s edge is to any later unit that authors a theme-reading paint rule (none today).

---

## 4. What this analysis owes the corpus (and what it must not do)

- **The contracts it licenses** are the three `docs/L1/unit-u-1{a,b,c}-*.md` files, filed with this analysis;
  they cite this file as their gate (§ `AGENTS.md` item 8) and carry their red sets, gates, write scopes and
  assumptions with their rejected alternatives.
- **The corpus acts are D-17 grants, per unit, listed in each contract** — `unit-u-shell-1-layout-zones.md`
  (`P-IM-1`/`P-SM-2`), `unit-zone-replacement.md` (`R-9`, §2.1(g), `P-TP-zone-repl-5`),
  `unit-zone-replacement-greens.md` (`E-03`…`E-05`, whose PASS strings quote the old tokens verbatim,
  `:152-154`), `user-flow-audit-checklist.md` (`UF-LAYOUT-1/2/4/7/10/12`, `UF-DEFECT-6`), and — for `U-1c`
  only — `unit-pd-ui-1-theme.md` (`A-7`'s supersession). **No unit writes `strata/`, the trackers, or a spec
  file another layer owns.**
- **Answered by the owner, not derivable here:** question 1 (the meaning of `collapsed`), question 2 (the
  persisted-slice migration and `LAYOUT_VERSION`). **Everything else above is a design call this step owns.**
- **What this analysis cannot supply:** the paint, the anchored control's hit-testability, "no resize strip",
  and that `[theme="dark"]` paints. Those are G8 rows on the live leg, and no row here claims them (D-10,
  RCA-11, RCA-12).
- **No code, no test byte and no `src/**` edit is part of this review** (item 8's read-only boundary); the
  three contracts are the delegable output, and each requires a TestWriter red run **before** its first byte.
