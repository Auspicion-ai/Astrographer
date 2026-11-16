# L3 — `shell-chrome` / `reveal-without-reassembly`: the pinned signatures, the paint's two halves, the guardrails, the battery

**Layer:** L3 · **Date:** `2026-11-16` · **Ceiling:** 150 lines · **Module:** `shell-chrome` (`N` = **26** unmoved, cap `310`) · **Unit contract:** `docs/L1/unit-reveal-without-reassembly.md` (authority — §2 `R-1`…`R-4`, §3 limbs `P`/`Q`/`T` and their sub-arms `p1…p5`/`q1…q3`/`t1…t3`, §5 write scope, §6 `ASM-RR-1`…`-5`) · **Integration surface:** `docs/L2/shell-chrome/reveal-without-reassembly.md` (I/O §2, seams §3, invariants §4, failure states §5, findings `RR-F1`…`-F5`, `ASM-RR-6`).
**Markers:** `READ` = read in this pass, file and line named **at the landed head** (post-edit numbering). `RECORDED` = measured elsewhere, quoted with its measurer. `RUN` = a command with its runner.
**Layer declaration (mandatory, D-10 / `RCA-12`):** **nothing in this page is app-green.** Limbs `P`/`Q`/`T` are node/**envelope** class under the layout-less DOM shim — the REAL `SidebarPanes`, a recording runtime double, the REAL assembler as the class oracle, and two SOURCE clauses over the file's own text. **The gesture, the pointer capture surviving the reveal, the painted class on a live DOM, the destination's computed `--zone-<z>-track`, the drop's committed box and the restoring second drag are `G8`-ONLY** (§4). A green says the FILE reaches the ENGINE correctly — never that the app paints it.

## 1. The structure, per change (`READ` at the landed head)

### `R-1` the ONE mirror predicate, exported — `src/renderer/pane-graph.ts`

| Site | Edit (as landed) |
|---|---|
| `zoneMirrorClasses` (`READ` `:614`) | **`export`ed**; its three pushes (`is-empty`, `is-collapsed`, `is-revealed`, in that order) are UNCHANGED — a byte-level behavioural identity, the doc comment above it is the only addition |
| new `zoneMirrorsFor` (`READ` `:641-657`) | ONE caller-shaped reading; the assembler keeps calling `zoneMirrorClasses` directly (`READ` `:801`), so no second spelling and no change to the envelope |

**Pinned signature** (single, overload-free, TOTAL over `revealedZones`, pure):
```ts
export function zoneMirrorsFor(
  registry: PaneRegistry,
  layout: LayoutState,
  revealedZones: unknown,
): Record<LayoutZoneName, string[]>
```
**Pseudocode.** 1. `base = coerceLayout(layout)`. 2. `counts = enabledZonePaneCounts(registry, base)` — the SAME enabled+placed census `is-empty` derives from. 3. `revealedSet = new Set(Array.isArray(revealedZones) ? revealedZones.filter(isLayoutZoneName) : [])` — the same junk filter the assembler applies to `input.revealedZones`. 4. for each `zone` of `LAYOUT_PANE_ZONES`: `collapsed = zoneCollapsedOf(base.zones[zone].collapsed, counts[zone])`; `mirrors[zone] = zoneMirrorClasses(counts[zone], collapsed, revealedSet.has(zone))`. 5. `return mirrors`. No DOM, no state, no write, no throw.

### `R-2` the reveal PAINT — `src/renderer/sidebar-panes.ts`

**Pinned signatures:**
```ts
private writeZoneMirrors(                                                     // READ :2335-2355 (the factored WRITE half)
  changed: ReadonlyArray<{ zone: LayoutZoneName; desired: string[]; collapsed?: string }>,
): void
private applyRevealPaint(): void                                              // READ :2387-2404 (R-2's paint)
```
**`writeZoneMirrors` pseudocode.** 1. `if (this.runtime == null) return`. 2. for each `w` of `changed`: `mutation = [{ targetProp: 'css.classes', mode: 'replace', value: w.desired }]`; **iff** `typeof w.collapsed === 'string'`, push `{ targetProp: 'props.collapsed', mode: 'replace', value: w.collapsed }`. 3. `this.runtime.applyCommand({ kind: 'state-slice', node: \`zone:${w.zone}\`, mutation })`. **Nothing else.** The content reconcile's caller (`syncZoneMirrors`, `READ` `:2280-2314`) ALWAYS supplies `collapsed`, so its ops are byte-identical to the pre-factor body it replaced; the reveal never supplies one (`ASM-RR-5`).
**`applyRevealPaint` pseudocode — TWO synchronous halves, IN THIS ORDER:**
1. **THE CLASS HALF FIRST** — `if (this.runtime != null)` (the `ASM-RR-6` fail-soft arm), inside ONE `try`:
   a. `base = this.layout != null ? coerceLayout(this.layout) : defaultLayout()`;
   b. `desired = zoneMirrorsFor(this.registry, base, this.revealedZones)`;
   c. for each `zone` of `LAYOUT_PANE_ZONES`: `live = this.currentZoneMirror(zone)` — ONE `nodeState('zone:<z>')` read per zone per pass; `if (sameClassSet(live.classes, desired[zone])) continue`; else collect `{ zone, desired: desired[zone] }` — **the LIVE DIFF, which is `INV-R`'s idempotence**;
   d. `if (changed.length > 0) this.writeZoneMirrors(changed)`;
   e. `catch { /* F11 discipline — the class half never breaks the paint */ }`.
2. **THE TRACK HALF SECOND, UNCONDITIONALLY** — `this.applyZoneTracks()` (`READ` `:1639-1680`).
**The clause:** NO `loadAppGraph`, NO `loadEnvelope`, NO `rerenderAppGraph` in the method's body. That is the defect (`ZONE-REVEAL-REASSEMBLY-KILLS-THE-CROSS-ZONE-DRAG`) and the row grades it as `Q`(q1) behaviourally and `Q`(q2)/(q3) as a SOURCE clause with mutated falsifiers.

### `R-3` the path re-pointed — `src/renderer/sidebar-panes.ts`

| Site | As landed |
|---|---|
| `onRevealChange` (`READ` `:934-937`) | `this.revealedZones = [...zones]` then `this.applyRevealPaint()` — **never `rerenderAppGraph()`**. The assignment stays FIRST (the drop's index derivation reads the set) |
| `commitPaneDrop` (`READ` `:3711-3712`) | `this.revealedZones = []` then the SAME paint, placed BEFORE the `wordEqual && !closed` early return, so a placement-equal drop into an EXPANDED zone still clears the class while writing ZERO `setLayout`s. The zero-write law is untouched: the paint is a mirror write, not a record write |
| `cancelPaneDrag` (`READ` `:3663-3667`) | **ADD NOTHING.** The controller's `cancel()` writes `setRevealed([])` → `onChange` → the paint (`READ` `pane-drag.ts:501-504`). A second host-side paint here would be the SECOND pass and limb `T`(t2) counts exactly ONE |
| `rerenderAppGraph` (`READ` `:3925-3935`) | **UNTOUCHED** — its other callers (`hoverPreview`'s `onChange` `READ` `:571`, the shared-commit warning path) keep re-assembling; `RR-F2` names the residual that fact leaves |

- **THE ONE RULE, as a grep-able fact:** there are exactly TWO assignments to `this.revealedZones` in the class (`READ` `:935`, `:3711`), and each is immediately followed by `this.applyRevealPaint()`. A third assignment arriving without the paint is a review finding.

### `R-4` the invariant — `INV-R`

**No reveal transition may be applied by a re-assembly.** On the gesture path the reveal reaches the DOM through exactly two managed carriers (the containers' `css.classes` through the `state-slice` channel, and the grid's inline track properties); the record is untouched (**0 `setLayout`**), the frame identity is untouched (**0 `loadEnvelope`**), and the paint is **kept idempotent** by the live diff (a transition to the same set writes nothing).

## 2. The exact resolution of each row limb (*this table IS the guardrail: no arm may be weakened*)

| Limb / sub-arm | The design element that satisfies it | Why it cannot be satisfied by accident |
|---|---|---|
| `P`(p1) exactly ONE op for the revealed zone, carrying `is-revealed` | the paint's per-zone diff (step 1c) writing ONE `state-slice` op (step 1d) | the gesture START's ZERO-op baseline is asserted first, so a paint on every call reds here |
| `P`(p2) the op's value DEEP-EQUALS the assembler's own list | `zoneMirrorsFor` calls `zoneMirrorClasses` — the row drives the REAL `assembleAppGraphEnvelope` as the oracle | two floors precede the equality (`is-revealed` present in the oracle, and the oracle's revealed list DIFFERS from its unrevealed one, so two empty lists cannot satisfy it), and the R-1 export probe is its own falsifier: the helper must ALSO answer the UNREVEALED lists |
| `P`(p3) a two-zone crossing writes TWO ops with no stale `is-revealed` on the zone left | the diff over all four zones per pass | paired with the SAME host's one-zone transition writing exactly ONE |
| `P`(p4) a transition to the SAME set writes ZERO ops | step 1c (`sameClassSet` against the LIVE node) | driven TWICE (a repeat move and a direct re-invocation of the paint), and paired with the control transition writing ONE |
| `P`(p5) no runtime / a throwing `nodeState` ⇒ a silent no-op | `ASM-RR-6`'s guard + `currentZoneMirror`'s own `try/catch` (`READ` `:2410-2426`) | paired with a healthy-runtime control whose LIVE mirror was reset to the unrevealed list and which therefore DOES write exactly one op |
| `Q`(q1) a crossing into an EMPTY zone calls `loadEnvelope` ZERO times | the paint's clause (§1 `R-2`) | floored by the SEED `loadAppGraph` reaching `loadEnvelope` exactly ONCE (a dead counter cannot answer zero) |
| `Q`(q2) the handler's body reaches the paint, not the re-assembly | `onRevealChange`'s two statements | two MUTATED copies are read to `false` first: the PRE-FIX body (reaches the re-assembly, reaches no paint) and the REAL body with the paint call deleted |
| `Q`(q3) the TRACK half survives the re-point | step 2's `this.applyZoneTracks()` | the paint's own body is brace-read from its `private` declaration with the call renamed in a mutant that must read `false` |
| `T`(t1) a placement-equal drop into an EXPANDED zone: ZERO `setLayout`s **and** the painted clear | `commitPaneDrop`'s paint before the early return | the control asserts `is-revealed` WAS painted on that host before the drop, so "the clear removes it" has a class to remove |
| `T`(t2) `cancelPaneDrag` clears through ONE paint, not two | the ABSENCE of a new call in `cancelPaneDrag` | the pre-cancel pass count (the reveal's own ONE) is read off the paint's `nodeState` reads; a second host-side paint would read the four zones again and print 2 |
| `T`(t3) no paint while the set is unchanged, per CROSSING | `pane-drag.ts`'s `setRevealed` gate **plus** the paint's live diff | the census is 9 moves / 3 crossings, so a per-MOVE paint reds by arithmetic |

## 3. Guardrail notes (each with the limb that reds if broken)

| # | The invariant | Reds |
|---|---|---|
| 1 | **The fail-soft list**: no runtime ⇒ the class half is a no-op (**not** the whole paint — `ASM-RR-6`); a throwing `nodeState` ⇒ `currentZoneMirror` answers `{ classes: [], collapsed: '' }`; a throwing `applyCommand` ⇒ caught by the paint's `try`; an absent grid / a shim `style` without `setProperty` ⇒ `applyZoneTracks` swallows it. The paint NEVER throws | `P`(p5) |
| 2 | **The diff, so a no-change transition writes nothing**: the desired list is compared against the LIVE node (`sameClassSet`), never against the previous DESIRED list — a paint re-invoked with an unchanged set writes ZERO | `P`(p4), `T`(t2) |
| 3 | **No `props.collapsed` on a reveal** (`ASM-RR-5`): `writeZoneMirrors` writes that carrier ONLY when the caller supplies it, and `applyRevealPaint` supplies none — one carrier, one writer. The `ASM-U1b-9` pairing is the CONTENT reconcile's and keeps working byte-identically | `P`(p1)/(p2) (the op would carry a second mutation the assembler's oracle does not author) |
| 4 | **No `classList` poke, no hand-written DOM, no host-authored element** (`D-8`, `ASM-RR-1`): the class half rides the managed channel; the track half rides the landed projection | `P`(p1); a review finding |
| 5 | **No latch, no deferral** (`ASM-RR-4`): the paint is synchronous, ungated on gesture state, and there is no "is a gesture in flight" flag anywhere in the change | `Q`(q1) — a latch would leave the load in place or hide it |
| 6 | **The collapse paint and the four `zoneTrackVars` arms are UNMOVED** (`U-1b`'s surface): this unit adds no byte to `layout-state.ts`/`layout-vars.ts`, changes no `is-empty`/`is-collapsed` semantics, and moves no box | `zone-collapse-target.test.ts` (`11 passed`), `pane-head-target.test.ts` (`9 passed`) |
| 7 | **No `z-index` is raised and no box moves** (`READ` `index.html:286-288`: the gear stays the ceiling at `110`) | a review finding; `uf_panes_8`'s hit reading on the assembled app |
| 8 | **`N` = 26 unmoved, `preload.ts` does not move**: no IPC channel, bridge method, MCP tool or menu item; `SidebarMethods` untouched | the endpoint census and `P-TH-SM-1(f)`'s seven-row shape |
| 9 | **The row is never weakened**: every negative keeps its positive control, and the row's own mutants (the pre-fix body, the paint-deleted body, the renamed track call) must read `false` | the limb it belongs to, by construction |

## 4. The unit battery, and where the app is measured

- **The unit row:** `tests/integration/shell-chrome/reveal-without-reassembly.test.ts` (1426 lines, three limbs `P`/`Q`/`T`, ONE aggregate `expect(problems, …).toEqual([])` each). `RUN` at the pre-edit head (RECORDED, L1 §3): **3 failed / 22 problems**. `RUN` at this landed head: **`3 passed (3)`**, exit `0`.
- **The landed rows it must not break:** `pane-move-target.test.ts` **`8 passed`** · `pane-move-instrument.test.ts` **`5 passed`** · `pane-head-target.test.ts` **`9 passed`** · `zone-collapse-target.test.ts` **`11 passed`** (the `U-3`/`U-2`/`U-1b` envelopes). All `RUN`, exit `0`.
- **What NO node arm supplies:** the gesture, the pointer capture surviving the reveal, the class actually reaching a live node's rendered class list, the grid consuming the removed inline track, the destination's computed `--zone-<z>-track` ≠ `0px` DURING the drag, the drop's committed box, and the restore. **`G8`-ONLY**: `node scripts/live-drive.mjs --block=uf_panes_12,uf_panes_14 --display=:0`, accepted only on all five terms `true` + `PROBLEMS=[]` + the within-zone limb still green + `U-2`'s and `U-1b`'s rows re-read unchanged. **This design supplies no `G8` reading**; the L1 seat runs that leg.
- **The scoped-command honesty clause:** the declared command is expected to print `REFUSED — missing declared row(s): …` (requesting `uf_panes_14` puts `U-2`/`U-4` declared rows in scope whose primary blocks are not requested). That is a SCOPE artifact and never app health — named beside the five terms, never smoothed into a pass.

## 5. Order of landing (one pass; each step names the limbs it makes green)

1. `pane-graph.ts` — export `zoneMirrorClasses`, add `zoneMirrorsFor` ⇒ **`P`(p2)**'s export probe and its `==` with the oracle.
2. `sidebar-panes.ts` — factor `writeZoneMirrors` out of `syncZoneMirrors` (behaviour byte-identical) ⇒ keeps `zone-collapse-target`/`pane-head-target` green (§3 guardrail 3).
3. `sidebar-panes.ts` — `applyRevealPaint` (class half then track half) ⇒ **`P`(p1)(p3)(p4)(p5)**, **`Q`(q3)**.
4. `sidebar-panes.ts` — re-point `onRevealChange` ⇒ **`Q`(q1)(q2)**. 5. `sidebar-panes.ts` — paint `commitPaneDrop`'s clear ⇒ **`T`(t1)(t2)(t3)**. `cancelPaneDrag` gets NO byte.
6. **Measure** `md5sum src/renderer/sidebar-panes.ts` at the landed head, TWICE, identical; re-record the ONE `P-TH-SM-1(f)` row with both digests, the reason note in the established form, and `restated: 'reveal-without-reassembly'` (`RR-F1`). No other row of that table is touched.
7. The gates: the unit row, the four landed rows, the trio (`npm test` / `typecheck` / `build`) and `npm run drift` (`CLEAN`, 15 checks, PIN arm EQUALS). **`scripts/live-drive.mjs` owes no byte**; `node --check` is owed only if a byte moves.

## 6. Findings (facts contradicting L1/L2, named rather than designed around)

- **`L3-RR-M1` — `R-2`'s "no runtime ⇒ a no-op" needed a ruling, and got one.** Read as "the whole paint returns", the reveal would lose its TRACK half on any host whose runtime is not yet attached — i.e. the class without the affordance, the exact `G8` term (iii) failure. **Ruling (`L2` `ASM-RR-6`):** the guard arms the CLASS half only; the track half always runs and is independently fail-soft. The row agrees: `P`(p5) measures ops and `nodeState` reads only, so `3 passed (3)` is unchanged by the ruling.
- **`L3-RR-M2` — the `props.collapsed` half of `syncZoneMirrors` must NOT be factored into the reveal, and the row would catch it.** A "symmetric" paint that re-emitted both carriers would make `P`(p2)'s op differ from the assembler's authored `css.classes` list only in its SECOND mutation — which the row's `classesOpOf` reader would not see, but `P`(p1)'s "exactly one op" and `T`(t2)'s one-pass count would still pass. **So the guardrail here is the type, not the row:** `writeZoneMirrors`'s `collapsed?: string` is OPTIONAL and `applyRevealPaint` omits it, which is why `ASM-RR-5` is stated as a signature fact an implementer cannot drift past without deleting a parameter.
- **`L3-RR-M3` — `RR-F2`'s residual is real and stays open.** `rerenderAppGraph` still re-assembles for the hover-preview and shared-commit-warning paths; a re-render from ANY other source mid-gesture still ends the gesture. This unit closes the REVEAL as a re-render site only. Recorded, not papered over with a latch (`ASM-RR-4`).
- **`L3-RR-M4` — no defect found in the RED row.** Its three limbs were re-read against this design; `p5`'s control is reachable only because the double APPLIES what it records, and `p2`'s probe accepts any export answering the four lists. **The test file was not touched.**

## 7. The carrier-fallback pass (`appended 2026-11-16`; §1–§6 unmoved, annotate-beside `RCA-8(c)`)

- **WHAT BROKE, MEASURED.** `R-2`'s class half as landed (one `state-slice` op per changed zone through `writeZoneMirrors`) destroys the assembled mount. Node measurement, REAL `Runtime` over the REAL assembled graph: the host's own recompile is correct (`compile calls = 0 compilePath calls = 3`, three `set` ops, `remove present = []`, census 2 → 2), but the op ALSO arms the engine's async pass-2 (`markPass2` + microtask `runPass2AndFlush`), whose mode choice is PER NODE (`provident-ssr/dist/core/supervisor.js:567`) — so the `zone:<z>` container takes the FOCUSED-SLICE arm, its ancestors get NODE-WIRED states (`{pathKey:'root', forkKey:null}` for the root, `{pathKey:'root/node-392', forkKey:null}` for the zone), the next render's `mergePass2` installs them, and `diffMinimal` emits `remove:root` + `create <root-id>`: `paneFrames 2 → 0`, `totalElements 35 → 3`. Live, that read as `U-3:uf_panes_12=FAIL`, `pane frames before=["search","doc-nav"] after=[]`, and the relocation leg `zone 'left' renders 0 pane frames on this run (the census: ["left=","right=","top=","bottom="])`.
- **WHY (A) IS OUT OF SCOPE.** The host-side fix lives in `src/renderer/runtime.ts` (`L1` §5 excludes it): drain the engine's pass-2 under the graph-level mode, or discard its node-arm states, around `applyCommand`'s own compile. Reported as `L2` `RR-F6`; not written.
- **THE LANDED SHAPE (B) — PINNED.** `private applyRevealPaint(): void` keeps its TWO halves in the same order, but the CLASS half is now a live-DOM write: `desired = zoneMirrorsFor(this.registry, base, this.revealedZones)`; for each `zone` of `LAYOUT_PANE_ZONES`, `el = document.getElementById('zone:' + zone)`, **confirm** `el.getAttribute('zone') === zone`, read `el.className`, compute `want = desired[zone].includes('is-revealed')`, and — ONLY when `want` differs from the live token — write the composed `className` (tokens minus/add `is-revealed`; `is-empty`/`is-collapsed` untouched). No `classList` (the shim has none). `catch` per pass ⇒ never a throw; the resolution/accessors are guarded per zone. The TRACK half `this.applyZoneTracks()` runs unconditionally AFTER the class half. **The clause, now grep-able: the body names NO `applyCommand`, NO `state-slice`, NO `writeZoneMirrors`, NO `loadEnvelope`, NO `loadAppGraph`, NO `rerenderAppGraph`.** `writeZoneMirrors`/`syncZoneMirrors`/`currentZoneMirror` remain for the CONTENT-reconcile caller; `onRevealChange` and `commitPaneDrop` are unchanged (the clear repaints and now removes the DOM class).
- **THE CARRIER ROW (new, one `it`, one aggregate):** `tests/integration/shell-chrome/reveal-paint-carrier.test.ts` — `C1` DOM-class-from-`zoneMirrorsFor` (with the `['left']` control), `C2` zero `applyCommand`/`loadEnvelope`/`setLayout` over a whole gesture (seed-`loadEnvelope`-once floor), `C3` byte-level idempotence (with a changed-set control), `C4` the drop's clear with zero `setLayout`s, `C5` three fail-soft states + the track half counted, `C6` the source clause over the paint's brace-matched body with two mutants. **RED before the fix: `1 failed`, 14 problems. GREEN after: `1 passed`, exit `0`.**
- **THE SUPERSEDED LIMBS ARE RED AND LEFT RED (`L1` seat's to re-derive — the test file was NOT edited).** `reveal-without-reassembly.test.ts` at the landed head: `P` **RED, 8 problems** (`(p1) the transition to 'right' wrote 0 state-slice op(s) … not EXACTLY ONE`, `(p2) no zone:right op was recorded …`, `(p3)…`, `(p4)…`, `(p5)…`), `T` **RED, 6 problems** (`(t1) the CONTROL failed: …`, `(t2)…`, `(t3) across 9 moves and 3 crossings the host ran 0 paint pass(es)…`), `Q` **GREEN** (the load-gone tooth and both source clauses, including `applyZoneTracks`-survives, are carrier-agnostic). Every P/T problem is the same fact: those limbs' observable is the runtime double's `state-slice` op / advanced mirror, which is exactly the carrier `R-2` no longer uses.
- **UNMOVED:** `pane-move-target` `8 passed` · `pane-move-instrument` `5 passed` · `pane-head-target` `9 passed` · `zone-collapse-target` `11 passed`; `npm test` `152/155` files (the only non-unit reds are the four real-ollama live gates, `HTTP 404`, the STANDING class); `typecheck` 0, `build` 0, `drift` `CLEAN` with the PIN arm EQUALS; `P-TH-SM-1(f)` re-recorded `449814051a03c3a78038b746b5c81e72` (measured twice) with `58907298f1521318ad7e8ca15d7267da` superseded and `restated: 'reveal-without-reassembly'`.
- **`L3-RR-M5` — the residual the fallback trades for.** The reveal is a DOM-side mirror for the duration of the gesture only (`D-8`): it is invisible to `get_rendered_html`/`dispatch` while it is up. Sound because the assembler re-authors all four containers on the next re-assembly and the reveal is cleared at the terminal — but a future unit that makes a reveal OUTLIVE its gesture re-opens this, and `syncZoneMirrors`' `state-slice` path still carries `RR-F6`'s hazard until `runtime.ts` fixes the pass-2 arm.
- **`L3-RR-M6` — the acceptance is NOT met, and the blocker is a sibling's (`L2` `RR-F7`, measured).** The live drop never commits because the persisted record holds no `panes`: `panePlacementOf` answers `null` for an absent entry (`pane-drag.ts:218`) and `commitPaneDrop` returns at `:3835`, before its only write site (`:3862`). The reveal reading during the drag is IDENTICAL with and without those panes while the write count flips `0 → 1`, so the reveal is exonerated; the five terms' repair belongs to `U-3`'s row and the panes-record law.
