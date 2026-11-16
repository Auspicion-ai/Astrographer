# L1 — unit `U-1c` `theme-carrier`: `[theme="dark"]`, the write surface, the red set and the gates

**Layer:** L1 · **Date:** 2026-11-15 · **Ceiling:** 150 lines (D-2's design class) · **Write scope:** `docs/L1/`, and — by D-17's per-unit grant (§5) — one `docs/specs/` file.
**Status:** filed with `docs/specs/foundation-import-u1-change-analysis.md` (the item-8 gate's third step). **Third of the split's three units.** It carries **D-14's theme-carrier ruling whole** — the carrier is not waived, its unit slot moved out of the fused `U-1` because it needs a **dated supersession of a landed ruling** (`A-7`) that deserves its own review (change-analysis §2.4).
**Markers:** `READ` = read in this pass by this pass. `RUN` = a command reading quoted with its runner (a delegated READ-ONLY measurer at head `161c614`, tree clean).

## 1. The unit, and the layer ruling

- **The act:** the theme carrier becomes the foundation's **`[theme="dark"]`** instead of the fork's `data-theme` (D-14), which means the ONE write site moves from `root.dataset.theme` to `setAttribute('theme', …)` / `removeAttribute('theme')` — and the sheet's two attribute selectors follow in the same commit.
- **What is NOT in doubt:** the vendored helper already takes the attribute name as the caller's argument and the fork already passes `'theme'` (`src/renderer/theme.ts:54`; `src/shared/theme.ts:67-73`), so **the mechanism does not change** — only the adoption of its returned `{name, value, removal}` record at the write site.
- **THE LAYER RULING — `U-1c` runs at L1 with NO L2 and NO L3 pass.** Three falsifiable reasons: **(a)** the adapter's contract is **already designed and pinned** by `docs/specs/unit-pd-ui-1-theme.md` §2.1; this unit **supersedes one clause of it** (`A-7`, 2026-09-28) and re-grains two censuses — an L2 pass would re-derive a surface that document owns; **(b)** the interface widens **additively and optionally** on a structural type (`ThemeRoot`), and the only production caller (`renderer.ts:213`) passes a real `document.documentElement`, which carries all three members — so no call site changes and no module I/O shape moves; **(c)** the evidence class cannot be lifted: the carrier's paint is a G8 row whatever a layer writes (D-10, RCA-12).
- **Rejected alternative:** keeping the carrier inside the zone rename (the filed `U-1`'s placement). Rejected because `A-7` must be **superseded by a dated clause** (a document act with its own review), because the change reds **two** theme censuses that the zone rename does not touch, and because the fused commit would carry a re-opened ruling beside ~300 mechanical edits — the coupling RCA-2 exists to break (D-17, change-analysis §2.4).

## 2. The change set — atomic

| # | Site | From → to (`READ` in this pass) |
|---|---|---|
| 1 | `src/renderer/theme.ts` `ThemeRoot` (`:36-41`) | `{ dataset: { theme?: string } }` → a **structural write surface** with `setAttribute?`/`removeAttribute?` **and** `dataset?` kept **optional** — so a root offering only `dataset` stays legal and boot stays fail-soft (`ASM-U1c-2`) |
| 2 | `src/renderer/theme.ts` `applyThemeToRoot` (`:52-75`) | the one write: `write.removal ? removeAttribute('theme') : setAttribute('theme', write.value)`, inside the existing guarded path; the `removal` member is still **honoured** (`P-TH-IM-4(c)`'s `.removal` read stays satisfied, `tests/pd-ui-1-theme-register.test.ts:614`); the caller's `'theme'` argument is unchanged (`:609`); the `A-7` comment block is **replaced** with the landed shape, superseded beside it (`RCA-8(c)`) |
| 3 | `src/renderer/index.html` (`:16`, `:34`) | `:root, html[data-theme='light']` → `:root, html[theme='light']`; `html[data-theme='dark']` → `html[theme='dark']`. **The `@media (prefers-color-scheme: dark)` block (`:54`) is NOT touched** — it keys `:root`, and re-keying it would make the OS fallback unreachable (`ASM-U1c-3`); the fifteen-token census is unmoved (`G-5`) |
| 4 | `tests/pd-ui-1-theme-register.test.ts` `P-TH-SM-1(e)` (`:710-725`) | its `tokenBlockOracle` selectors re-grained to `html[theme=…]` — **the re-grain is authored at red time and reads RED at the head** |
| 5 | `tests/unit-zone-replacement-register.test.ts` (`:3147-3175`, `:3567-3589`) | `themeBlockTokens()`'s two regexes re-grained; its control's expected label re-grained; the fifteen-token expectation itself **unmoved** |
| 6 | `src/renderer/index.html` — nothing else | no token, no value, no block order changes: `P-TH-SM-1(e)`'s census, its 15/15 media count and its root-before-dark ordering all stand |
| 7 | `docs/specs/unit-pd-ui-1-theme.md` (**D-17 grant**) | **ONE dated superseding clause** over `A-7` and §2.1 item 6: the element-level attribute-removal mechanic is **now taken**, naming D-14 as the authority, the widened `ThemeRoot`, and the two re-grained censuses. No other clause, no renumbering |

- **Atomicity:** the seven are **one restatement**. A landing that writes `theme` and leaves the sheet keyed on `data-theme` paints nothing (`rename` without its reader), and one that re-keys the sheet without the write site reds `P-TH-SM-1(e)` forever.
- **DENIED:** `src/shared/theme.ts` (vendored, digest-pinned, never edited — D-9) · `src/main/preload.ts` (no theme byte) · every other unit's granted spec files · `strata/**`, the trackers, the trackers' theme rows.

## 3. The red set — `RUN` and reported BEFORE any byte (RCA-1)

**Re-grained at red time, then RUN (each red at this head):**

- **`P-TH-SM-1(e)`** (`tests/pd-ui-1-theme-register.test.ts:710-725`) — with its oracle re-grained to `html[theme='light'|'dark']`, the block is not found / the selectors absent ⇒ **RED**. The fifteen-token census, the `@media` presence arm and the ordering arm are **kept** and must read green after.
- **the zone register's theme control** (`tests/unit-zone-replacement-register.test.ts:3567-3571`) — re-grained to the new selector, its reading at this head is *"the three THEME blocks are not readable in index.html — the G-5 census cannot be taken"* ⇒ **RED** (a control that fails loudly, which is the point).

**New, authored in this unit's own row — `tests/integration/shell-chrome/theme-carrier-target.test.ts`:**

- **`A` the write arm** — a root exposing **only** `setAttribute`/`removeAttribute` receives `theme="dark"` / `theme="light"`; a root exposing **only** `dataset` (the current shim shape) is written **not at all** and never throws (the fail-soft arm, preserved). **RED** at the head: `ThemeRoot` has no attribute members and the write is `dataset.theme`.
- **`B` the removal arm** — a removal record (`applyThemeDeclaration('theme', '')`'s shape) calls `removeAttribute('theme')` and **not** `delete dataset.theme`. **RED** at the head.
- **`C` the caller's name** — the adapter still passes the string `'theme'` to the mechanism and the mechanism's returned `name` is used as the attribute's name, so the fork holds no second copy of the token. Green before and after by construction — kept as the anti-regression limb the register already asserts (`:609`).
- **`D` the sheet's contract** — `index.html` declares exactly two attribute selectors (`html[theme='light']`, `html[theme='dark']`), no `data-theme` remains anywhere under `src/**`, and the fifteen names appear in all three blocks (the census, re-pointed). **RED** at the head (`RUN`: `6` `data-theme` occurrences in `index.html`).
- **`E` no pinned byte** — the seven `UNTOUCHED_DIGESTS` rows still read **MATCH** after the landing (`RUN` head: `7/7` match; neither `theme.ts` nor `index.html` is among them).

## 4. The gates, and the evidence class of each

| # | Gate | What it can supply |
|---|---|---|
| `G1` | §3's red set, `RUN` and reported | envelope/harness |
| `G2` | the trio | envelope/harness; the shim is layout-less — a `data-theme`/`theme` attribute is visible in the DOM shim, its **effect** is not (D-10) |
| `G5` | read-only adversarial pass (RCA-3): a frozen root, a root with `dataset` only, a throwing `setAttribute`, a non-string resolved value, a removal record on a root lacking `removeAttribute` | findings recorded here; host findings fixed + regression-tested; **no vendored byte** (D-9) |
| `G6` | blind greens by an agent that did not write the unit (D-5) | envelope |
| `G7` | proofreader + per-unit documentation review (RCA-6) | document layer — the granted spec file and `A-7`'s supersession are reconciled here |
| `G8` | `node scripts/live-drive.mjs` on a usable display | **the assembled app, and the ONLY reading that `[theme="dark"]` actually paints** — a `getComputedStyle` reading of the token block under an explicit dark setting. No node row may claim it |

- **Not applicable:** `G3`/`G4` (no vendor byte, no lock key — D-11).

## 5. Write scope, D-17's grant, and what the DONE row must carry

- **Module:** `shell-chrome` — `src/renderer/theme.ts`, `src/renderer/index.html`, `tests/pd-ui-1-theme-register.test.ts`, `tests/unit-zone-replacement-register.test.ts`, `tests/integration/shell-chrome/**`.
- **D-17 grant, one document:** `docs/specs/unit-pd-ui-1-theme.md` — **the `A-7`/§2.1-item-6 supersession clause and nothing else.** It never licenses `strata/`, the trackers, `docs/L1/foundation-import-program.md`, or any other unit's granted files.
- **The DONE row must state:** the red set as `RUN` with its colour · the widened surface and both write arms · `A-7` superseded with its date and its reason · the two re-grained censuses and their green · the **`7/7` pinned rows still matching** (no re-record owed by this unit) · **which layer each reading covers**, with the paint row named G8-only.

## 6. Assumptions, each with the alternative it rejected

- **`ASM-U1c-1`** — the carrier is written on the **document root** through `setAttribute`/`removeAttribute`. **Rejected:** the foundation's **node-scoped** carrier placement (the critique's contrast), which would require re-rooting the fifteen tokens off `html` and re-pointing the whole sheet — a second, larger unit that D-14 does not ask for.
- **`ASM-U1c-2`** — `ThemeRoot` widens **optionally** (`setAttribute?`, `removeAttribute?`, `dataset?`). **Rejected:** requiring the attribute members, which would throw or silently skip on the existing `dataset`-only shim and cost the fail-soft boot arm (`theme.ts:72-74`).
- **`ASM-U1c-3`** — the `@media (prefers-color-scheme: dark)` fallback keeps `:root` keying. **Rejected:** re-keying it to `[theme]`, which makes the OS preference unreachable before the first explicit setting — the very fallback `P-TH-SM-1(e)` pins (`:716-720`).
- **`ASM-U1c-4`** — `A-7` is superseded by a **dated clause in the owning contract**, with the superseded ruling kept visible beside it (`RCA-8(c)`). **Rejected:** annotating only `theme.ts`'s comment, which leaves the governing document asserting the opposite of the code — the drift RCA-6 exists to catch.
- **`ASM-U1c-5`** — L1-only (§1). **Rejected:** routing through `shell-chrome`'s L2/L3, which would author a second authority over a contract `unit-pd-ui-1-theme.md` already owns.

## 7. Acceptance

`U-1c` is accepted when §3's red set was **RUN and reported** before any byte, §2's seven rows landed as **one** commit, `G1`/`G2`/`G5`/`G6`/`G7` are recorded with their classes, `G8` carries the paint reading, the seven pinned digests still read **MATCH**, and `docs/specs/unit-pd-ui-1-theme.md` carries the dated supersession.

## 8. The landing — `RUN` `2026-11-15` at head `19ee629`, and what each reading covers

**§8.1 The red set, RUN before any `src/**` byte (RCA-1).** The test bytes were authored first; the run below is the pre-edit reading, quoted from the runner.

| Row | Class | Red reading (quoted) |
|---|---|---|
| `P-TH-SM-1 (e)` (`tests/pd-ui-1-theme-register.test.ts`) | harness | `expected null not to be null` — *"the token block's `:root, html[theme='light']` block and its `html[theme='dark']` block must both be present"* |
| `P-TH-SM-2 (a)` — **reported, not predicted** (same oracle) | harness | `expected null not to be null` — the token block's two selector blocks must be present |
| zone register `P-TP-zone-repl-5`, arm 12 = the `G-5` control | harness | *"the three THEME blocks are not readable in index.html — the G-5 census cannot be taken"* (and the §6 report row reads `broken`) |
| target row limb `A` (A1/A2/A4) | envelope | `expected [] to deeply equal [['theme','dark'], …]` · `expected ['dataset.write:theme=dark'] to deeply equal []` |
| target row limb `B` (B3) | envelope | `expected [] to deeply equal ['removeAttribute:theme']` |
| target row limb `D` (D1/D2/D3) | envelope | `expected +0 to be 1` · the `src/**` census returns 2 files (`index.html` 6, `theme.ts` 2) |
| `A3`, `B1`, `B2`, `C1`, `C2`, `D4`, `E1`, `E2` | envelope | **GREEN on arrival** — reported as measured, never retargeted (`C`/`E` are green before *and* after by construction) |

**§8.2 The change set, as landed.** `src/renderer/theme.ts` (`ThemeRoot` widened — `setAttribute?`/`removeAttribute?`/`dataset?`, all optional; the one write site is `setAttribute`/`removeAttribute`; `dataset` written on no arm; the `A-7` comment block replaced with the landed shape and the clause superseded beside it, `RCA-8(c)`) · `src/renderer/index.html` (`:root, html[theme='light']` and `html[theme='dark']`; the `@media` block untouched; the comment prose re-worded so `src/**` carries one carrier spelling) · `src/renderer/renderer.ts` (**the `installTheme` doc comment only** — no code byte) · the two registers' carrier rows · the new `tests/integration/shell-chrome/theme-carrier-target.test.ts` (§3 limbs `A`–`E`, 15 rows, authored under §5's module scope).

**§8.3 The greens, each with its layer.** Note the *runner* change: `npm test` now reports `150 files · 3,278 passed · 22 skipped · 4 failed`.

| Gate | Reading | Layer |
|---|---|---|
| `G1` | the red set above, RUN before any byte | envelope/harness |
| `G2` | the three carrier files **47/47**; the unit's own row **15/15**; `npm test` **150 files · 3,278 passed · 22 skipped · 4 failed** — the four being the STANDING real-ollama live-gate class (`ollama embed: HTTP 404`, `embeddinggemma` absent), the same four `V-1`/`E-1`/`V-2`/`U-1b` reported, so **new failures: zero** and the delta against `U-1b`'s `3,263` passed is exactly this unit's `+15`; `npm run typecheck` **0**; `npm run build` **0** | envelope/harness (the shim is layout-less and CSS-less) |
| the two censuses | `P-TH-SM-1 (e)` **PASS**; zone register `P-TP-zone-repl-5` **HELD** (12/12, `stoppedAt null`, `counterexamples 0`), §6 report **HELD** on all six rows | harness |
| the seven digests | `P-TH-SM-1 (f)` **PASS**, seven rows, **MATCH 7/7**; neither `theme.ts` nor `index.html` is a pinned row ⇒ **no re-record owed or made** | harness/instrument |
| `npm run drift` | **`15 checks, 0 differences — CLEAN`**, **PIN ARM EQUAL** (`[D]`-class — proves nothing about behaviour) | instrument |
| `G5` | the read-only adversarial pass — a TEN-ARM drive of the real adapter, findings recorded in **`§8.6`** | envelope/source |
| `G6` | **NOT RUN in this pass, named rather than implied**: the blind-greens pass is the L0 exit walkthrough's (`D-5`, `walkthrough.md` §5), whose closed verdict vocabulary (`PASS`/`DOC-GAP`/`STALE`/`UNUSABLE`) is written up to L0 | document layer |
| `G7` | the per-unit documentation review — a read-only reviewer reconciling `§8`'s claims, the spec act and the `docs/decisions.md` row against the build; two FIX-OWED findings discharged in-pass, recorded in **`§8.7`** | document layer |
| `G8` | **NOT TAKEN, and named as the gap rather than implied**: **no live row reads the theme carrier at all** — `scripts/live-drive.mjs` carries no theme row — so nothing at this head can show that `[theme="dark"]` paints. The paint is an OPEN `G8` reading | assembled app — **unclaimed** |

**§8.4 The `A-7` supersession, and where it lives.** The dated clause is written in **one** document, `docs/specs/unit-pd-ui-1-theme.md` — `§2.1` item 6 (its ruling site), with beside-notes at `§0B` item 2 and at the `ThemeRoot` export row — and the landing is recorded as its own `docs/decisions.md` row (`DECIDED: STRATA-U-1C-THEME-CARRIER-LANDED-2026-11-15`), annotate-beside: **the ruling STANDS** (a removal record means the attribute is removed); **the declined mechanic is TAKEN** (the `ThemeRoot` widening), and `A-7`'s parked `[U]` question is DISSOLVED rather than answered because no arm touches `dataset` now.

**§8.5 Recorded deviations, none smoothed.** (a) `P-TH-SM-2 (a)` red at the head was **not** in §3's list — it reads the same `tokenBlockOracle`, so re-graining `(e)` moved it; reported, not folded in silently. (b) The zone register's `§6` report row reds *because* arm 12 reds — one cause, two rows. (c) `data-theme` is **not** kept visible under `src/**`: §3 limb `D` forbids the literal anywhere under `src/`, so `RCA-8(c)`'s record of the superseded spelling lives in the two censuses' notes, the owning contract and `docs/decisions.md` — the choice between "annotate beside the code" and "one spelling in the tree" was D-14's, and D-14 wins. (d) **Seven documents still state the old carrier present-tense and are OUTSIDE this unit's grant** — named here so no later pass reads them as reconciled: `docs/specs/unit-u-shell-2-appearance-tokens.md` (the appearance-tokens spec, `:29`/`:45`/`:60-63`); `docs/specs/user-flow-audit-checklist.md`'s `UF-THEME-1` scenario cell (`:288`); `docs/FORK-DIVERGENCE.md` row 4 (`:49`); `docs/requirement-catalog.md`'s `PRUNE-333` token cell (`:739`); `docs/specs/unit-zone-replacement.md`'s `G-5` row (`:325` — granted to `U-1a`/`U-1b`, not to this unit); `docs/specs/foundation-import-u1-change-analysis.md` `:139`/`:150` (that review's **as-filed** finding text, which §2.4's resolution supersedes *in place* rather than rewrites); `docs/specs/post-division-local-elimination-inventory.md` `:290`. Softer: `docs/specs/ui-feature-set-breakdown-2026-09-29.md:458` and the `docs/feature-requests/*` intake prose (historical asks, never contracts).
(e) **`UF-THEME-1` is specified but UNDRIVEN**: the checklist has the row and `scripts/live-drive.mjs` has **no `UF-THEME` block at all**, which is the measurement behind §8.3's `G8` line — the live row that would see a paint does not exist yet, so `G8` is a row to AUTHOR, not a reading to take. (`scripts/asw-class-b-live-battery.mjs`'s `L-2` reads the **persisted setting** through `provident.operatorSettings.get()` — a store reading, never a root appearance attribute.)
(f) **The D-17 grant was extended by TWO POINTING SENTENCES inside the ONE granted document, and the extension is named rather than silent.** §8.4's act is `A-7`/`§2.1` item 6; the documentation review then measured that a reader landing on `§1.2` (c)'s KEPT row (and on `§2.1` item 2's parenthetical) reads the superseded selectors with no pointer to the superseding clause — the drift `RCA-6` exists to catch. So the same dated `⟨POINTING NOTE 2026-11-15⟩` was added at both sites: **annotation only, no clause rewritten, no section renumbered, and no other `docs/specs/` file touched.**

**§8.7 The documentation review (`G7`), recorded.** A read-only reviewer reconciled `§8`'s claims, the spec act and the `docs/decisions.md` row against the tree. **Verified PASS:** the three carrier files **47/47** and the unit's row **15/15** (15 `it` rows, none skipped); `P-TH-SM-1 (f)` PASS with **7** rows and all seven `md5sum` readings equal to their recorded literals, with neither written file among them; `ThemeRoot` exactly three optional members and the write site exactly `setAttribute(write.name, write.value)`/`removeAttribute(write.name)`; `0` `data-theme` occurrences under `src/`; one `html[theme='light']` (`:19`) and one `html[theme='dark']` (`:37`) with the `@media` block keyed on `:root`; all load-bearing `§`-citations landing on real sections; `git diff -U0 -- docs/decisions.md` showing **one added line, zero deletions**, so the `A-7` row's bytes are untouched; and the `G8` claim confirmed (`grep -c theme scripts/live-drive.mjs` → `0`; `tests/live-drive-contract.test.ts` → `0`). **Two FIX-OWED findings, both discharged in the same pass** — the `§1.2` (c)/`§2.1` item 2 pointer gap (→ `§8.5` (f)) and `§8.5` (d)'s incomplete stale-document list (→ the three added entries). **Three NOTEs:** the soft/ambiguous texts above; that §8.1's red readings and the `+15` delta are **pre-edit measurements that cannot be re-taken from the landed head** (they are this contract's attested record, quoted with their runner); and that the full-suite figure `3,278 passed / 22 skipped` is a **runner reading** that a static skip census cannot corroborate.

**§8.6 The adversarial pass (`G5`), and its ten-arm reading.** A read-only reviewer drove the REAL `applyThemeToRoot` (no mock, no re-implementation: Node 24 `--experimental-strip-types` plus a `/tmp` resolve hook that maps only a missing `x.js` to its sibling `x.ts`) against ten hostile roots, and **all ten were absorbed with the resolved theme still returned and nothing thrown**:

| Arm | Root | Reading |
|---|---|---|
| 1 | `setAttribute`/`removeAttribute` only | `setAttribute('theme','dark')` / `('theme','light')`; explicit `light` beats a dark OS reading |
| 2 | `dataset` only | **wrote nothing**; `dataset` has zero keys, `dataset.theme === undefined` (the legacy face is dead) |
| 3 | `{}` | no write, no throw |
| 4 | `setAttribute` GETTER throws | absorbed, no write |
| 5 | `setAttribute` is `'nope'` (non-function) | absorbed, no write |
| 6 | `setAttribute` throws when called | one attempt, refused, absorbed |
| 7 | `setAttribute` but no `removeAttribute` | reachable arm writes; **the removal record is unreachable** (see below) |
| 8 | `Object.freeze`d root | written (freeze blocks neither the call nor the target) |
| 9 | Proxy whose `get` throws on every key | absorbed, no write |
| 10 | `dataset` GETTER throws | `setAttribute` writes, **`dataset` is never read** |

**Two findings, both recorded rather than smoothed.** (i) **`ThemeRoot.removeAttribute` is CONTRACT-ONLY at this head** — an eight-combination sweep through the real resolver never reaches it, because `resolveTheme` yields only non-empty `'light'`/`'dark'` and `applyThemeDeclaration` can therefore never answer `removal:true`. That is `§3.2` item 5's own ruling (the arm is UNREACHABLE), and it is why limb `B` drives the record by **injecting** it into a re-instantiation of the adapter's own bytes rather than pretending a reachable path exists; the battery's faithfulness arm (`B2`) is what stops that drive from drifting off the landed source. **No defect**: an unobservable-but-implemented arm is the contract's own shape, and deleting it would be a silent divergence. (ii) **No arm writes a `dataset` member and no arm writes a `theme` attribute it must not** — the fail-soft contract survives the surface change, which is `ASM-U1c-2`'s whole point.


