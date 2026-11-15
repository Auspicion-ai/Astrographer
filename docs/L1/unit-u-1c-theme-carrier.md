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
