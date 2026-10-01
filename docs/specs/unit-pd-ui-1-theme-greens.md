# Unit `PD-UI-1` (THE THEME UNIT, wave `W1`) — GREEN-SCENARIO ARTIFACT (blind test writer)

- **Date:** 2026-09-28. **Repo under test:** `/media/ryanr/Shared Files/Projects/Astrographer`, branch
  `post-division-rebuild`, HEAD **`35f336275f8cee927994bc81c7656732ae6aa528`** (clean tree at start and at
  the end of this pass). **Adjacent foundation:** `/media/ryanr/Shared Files/Projects/Provident-Electron`,
  `main` = **`8f193a8d1446ed1e64c4ab6c569941e988f82459`** (read-only; **never modified by this pass**).
- **Author:** **blind-test writer** (`AGENTS.md` item 10a / RCA-4). **This artifact is NOT a self-verified
  greens set:** the implementer did not author it, and **no scenario below was written by the agent who
  implemented the unit**. This pass wrote **no** code, **no** test, and **no** tracker row, and edited
  **nothing** in the repo except this file.
- **Unit under test:** `docs/specs/unit-pd-ui-1-theme.md` (the contract, including its `§0B` gate-4 remand
  amendment ledger and its `§3a` adversarial record) + `docs/specs/pd-ui-1-adoption-dossier.md`.

## The blindness declaration (what this pass was allowed to read)

**Documentation only — and this is the binding constraint of the pass.**

**Read to AUTHOR the scenarios (all documentation):**

- `docs/specs/unit-pd-ui-1-theme.md` — the contract, **in full** (status block, `§0B` items 1–4, `§0` rulings
  `R-1`..`R-11`, `§0A` notes 1–2, `§1`/`§1.1`–`§1.5`, `§2`/`§2.1`–`§2.4`, `§3`/`§3.1`–`§3.4`, `§4` (the register
  and its amended arithmetic), `§5`, `§6` and `§6.1`–`§6.4`, `§7` and `§7.1`–`§7.3`, `§8` and `D-1`–`D-14`,
  `§9` items 1–9, `§3a`, `§3a-seed`, `§3b`, `§10`, `§11`).
- `docs/specs/pd-ui-1-adoption-dossier.md` — `§1` (the eight identifier rows), `§2` (`C-1`..`C-7`), `§3`
  (`A-1`..`A-5`), `§4`.
- `../Provident-Electron/docs/guide/theme.md` — **in full** (the applied-write recipe, UC-1..UC-4, *What a
  fork must supply*, *Gotchas measured in this repo*).
- `../Provident-Electron/docs/specs/theme.md` — the outline plus the sections the fork spec cites as the
  ruling's authority (`§2.1`–`§2.5`, `§3.1`–`§3.4`, `§5.5.1`).
- `docs/decisions.md` — the program rows `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` (clauses
  (1)–(5)) and `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` (clauses (1)–(7)), plus the carrier
  rows `DECIDED: UI-CONFIG-CARRIER`, `DECIDED: OPERATOR-ISOLATED-GRAPHSCOPE`,
  `DECIDED: STORE-LISTING-PROVIDENT-AUTHORED`.
- `docs/specs/post-division-rebuild-proposal.md` — `§4.1`/`§4.7` (the `PD-UI-1` row, `C-15`, `A-5`/`A-7`/`A-8`),
  `§7.4`/`§7.5` (the rulings and the measured baselines).
- `docs/specs/unit-pd-vendor-foundation-mechanisms-greens.md` — **read for the house artifact SHAPE only.**

**NOT read to author any scenario — named so the discipline is checkable:** `src/renderer/theme.ts` (the fork
adapter), the vendored `src/shared/theme.ts`, and the unit's test files (`archive/tests/2026-10-04-pd-ui-1-theme-adoption.test.ts`,
`tests/pd-ui-1-theme-register.test.ts`, `archive/tests/2026-10-04-unit-u-shell-2-theme.test.ts`, `tests/pd-vendor-set.test.ts`).
**No scenario's expected value below was derived from any of them.** **No `tests/**`, `src/**`, `vendor/**` or
`scripts/**` byte was read as prose, and none was written.**

**Four disclosures, stated rather than hidden — because each touches the "no implementation read" line:**

1. **Mechanical censuses were taken over `src/**` with `grep -c` / `grep -l` / `grep -o` and `md5sum`/`cmp`.**
   These are **counts, file names and digests** — **no source line was displayed to me and no content was
   read.** They are used **only for rows whose expected value the documentation already fixes** (the import
   census `§2.1`, the one-write-site clause `§2.2` item 6, the wiring counts `§2.2` items 2/4/6, the
   token/persistence-safety clauses `§4` `P-TH-SM-1`/`P-TH-SM-2`, the vendored-byte prohibition set
   `P-TH-IM-4`). **The counts are the measurement; the expectations are the spec's.**
2. **`src/renderer/index.html`'s token block was read as a STATIC ARTIFACT** (the same status the fork spec
   gives it: *"`[T]`/static source-layer — token NAMES and literal values"*, `§1.2` (c)). Rows `E1`/`E2`
   measure exactly the census `§1.2` (c) and `§4` `P-TH-SM-1` (e) already state. **Nothing about the adapter's
   logic was taken from it.**
3. **`vendor/foundation.lock.json` was read as MACHINE DATA (the pin), not as a source of expectations** —
   row `D6` compares the manifest's `theme` `md5` against the recomputed digest, which is the manifest's own
   stated purpose.
4. **The vitest run's LOG was read for per-file pass FAIL counts** (a `[T]`-layer reading of a leg), and one
   printed stdout title from the unit's own test file was visible in that log — the `⟨A-7 RULED + A-2⟩`
   `P-TH-TP-2` row, *"the removal branch: an injected `removal: true` record must leave the pre-carried
   attribute GONE, and a LEAVE-IN-PLACE or `writes ''` corpus MUST FAIL the ruling"*.
   **That title is quoted in the contradictions list as EVIDENCE about the tripwire's state, never as a
   source of a row's expected value** — row `B5`'s expectation comes from `§0B` item 2 / `§2.1` item 6 / `D-12`.

**A scenario whose expected value the documentation does not fix is marked `NOT-BLIND-DERIVABLE` with what is
missing** — it is **never** filled in by reading code. Three rows are so marked (`E4`, `F5`, `F6`).

## Layer declaration (RCA-12, mandatory)

**Every row of this artifact covers the `[T]` node/pure-and-source layer, the `[H]` host-side census layer,
the DOC/machine-data layer, or an ENVIRONMENT probe — and NOTHING ELSE.** **This unit's evidence is
ENVELOPE/`[T]`-layer; a node green is not app-green.**

| Group below | The layer its rows cover | What that layer does NOT prove |
| --- | --- | --- |
| `A` (the precedence rule) | **`[T]` pure** — returned values of one pure function | not an applied attribute, not a reacting stylesheet, not an OS reading (`RCA-12`; `§5` items 1/7) |
| `B` (declaration-as-data, and the removal arm) | **`[T]` pure, through a bundler-level stub bind** (the documented injected path) | that a real consumer or a real `DOMStringMap` behaves so (**the spec itself records the `dataset`-deletion mechanic as a `[U]` question — `§9` item 7**) |
| `C` (totality / fail-soft) | **`[T]` pure**, plus a recording-Proxy instrument | nothing about a real DOM, a frozen real `dataset`, or the assembled app |
| `D` (the vendored records, the pin) | **`[T]` pure** + the **source/machine-data** layer (digests, census) | that the fork *renders* anything |
| `E` (tokens, carrier) | **static source-layer** (names/selectors) + a presence census | that any browser accepts, applies or paints a token |
| `F` (the boot wiring) | **`[H]` host-side source-text census** — and only on the clauses a count can take | the wiring's control flow, its seam behaviour, and the assembled renderer |
| `G` (legs, layer absence) | **harness `[T]`/`[H]`** (the trio + battery) + one ENVIRONMENT probe | **nothing about the app.** The battery's `theme-light`/`theme-dark` checks are the **`provident-ssr` package's own envelope readouts**, **not** the fork's `data-theme` and **not** app-green |

**No row below is an app row, and no row below may be read as one.** `npm run divergence` was **NOT run** by
this pass (explicit instruction; `§7.2`/`R-8`), and **no live leg is claimed** (see `G1`, `G5`, `NT-1`).

## How the readings were taken (commands, verbatim)

| # | Command | Where |
| --- | --- | --- |
| `R-run-1` | `npm test` | repo root |
| `R-run-2` | `npm run typecheck` | repo root |
| `R-run-3` | `npm run build` | repo root |
| `R-run-4` | `npm run battery` | repo root |
| `R-run-5` | `node /tmp/pd-ui-1-blind/build.mjs all` — bundles the adapter, the vendored module, and **four stub-bound copies of the adapter** with the repo's own `esbuild`, printing the **module graph** | `/tmp` only |
| `R-run-6` | `node /tmp/pd-ui-1-blind/drive.mjs` → `readings.json` — the 250-cell precedence grid, the root-shape grid, the vendored-record table | `/tmp` only |
| `R-run-7` | `node /tmp/pd-ui-1-blind/drive2.mjs` → `readings2.json` — the **injected stub drives** (removal record, inverted env record, contradicting write record, value-record control, the reachable path) | `/tmp` only |
| `R-run-8` | `node /tmp/pd-ui-1-blind/controls.mjs` → `controls.json` — **five control corpora** graded against the documented decisive cells | `/tmp` only |
| `R-run-9` | the repo's `tsc --noEmit --strict` over a `/tmp` **type probe** against **out-of-tree copies** of the two modules (the probe asserts the documented signature with four `@ts-expect-error`s) | `/tmp` only |
| `R-run-10` | mechanical censuses: `grep -c`/`-l`/`-o` over `src/**`, `md5sum`, `cmp`, `vendor/foundation.lock.json` | repo root, **read-only** |
| `R-run-11` | environment probe: `ls -ld /dev/shm`, `df -h /dev/shm`, `touch /dev/shm/.__probe_$$` | outside the repo |

**`npm run divergence` was NOT run** (it is RED at this head for the environmental reason; instruction and
`R-8`), and **no Electron boot, no live battery and no `scripts/**` invocation** was made by this pass.

**The injection instrument, described so a reader can judge it.** The documented injected path (`§0B` item 2's
`HOST-FIX` drive and `§9` item 8 option (b)) is *"compile the landed adapter's own bytes with ONLY its import
declaration replaced by a stub bind"*. **This pass took a third, equivalent route: an `esbuild` resolver-level
substitution** that replaces **any** specifier resolving to the vendored module with a stub the pass authored
under `/tmp`, then bundles the adapter's bytes with **no edit of any kind**. So: **the adapter's bytes are the
landed bytes; the substituted module is the pass's own; no pin is touched and no repo file is written.**
`R-run-5` prints the module graph, which is also the import-census measurement for `D7`.

---

## A. The KEPT precedence rule (`§2.1` clauses 1–4; `§1.2` (b); register `P-TH-IM-1`)

| id | Documented clause | Scenario (setup → action → **documented** expected outcome) | Expected | Actual (this pass's own reading) | Verdict |
| --- | --- | --- | --- | --- | --- |
| **A1** | `§2.1` clauses 1/2 | drive the adapter's `resolveTheme` with `setting === 'light'` at **every** reading | `'light'` in **every** cell, whatever `prefersDark` says | `('light', true) ⇒ 'light'` · `('light', false) ⇒ 'light'` · `('light', 1) ⇒ 'light'` — **explicit wins in every cell** | **PASS** |
| **A2** | `§2.1` clauses 1/2 | `setting === 'dark'` at every reading | `'dark'` in every cell | `('dark', false) ⇒ 'dark'` · `('dark', true) ⇒ 'dark'` — the **`C-1`/`V-1` discriminating cell holds** | **PASS** |
| **A3** | `§2.1` clause 3 | **every other** `setting` follows the OS: 25 setting shapes (`'system'`, `''`, `undefined`, `null`, `42`, `0`, `true`, `false`, `'LIGHT'`, `' dark '`, `'false'`, `new String('light')`, `new String('dark')`, `12n`, a `Symbol`, `{}`, `[]`, a function, a `Map`, a non-revoked `Proxy`, a **revoked `Proxy`**, `{toString/valueOf throw}`, a `Date`, …) × 10 readings (`true`, `false`, `1`, `'true'`, `undefined`, `null`, `0`, `''`, `{}`, `[]`) | `prefersDark === true ? 'dark' : 'light'` in every cell; **a member of the closed two-member domain in EVERY cell**; **never a throw** | **250 cells driven: 0 threw, 0 out-of-domain**, and every cell equals the documented OS arm (`('system', true) ⇒ 'dark'`, `('system', false) ⇒ 'light'`, `(42, true) ⇒ 'dark'`, `(revoked Proxy, true) ⇒ 'dark'`, `('system', undefined) ⇒ 'light'`) | **PASS** |
| **A4** | `§2.1` clause 3 + `§0B` item 1 (`A-6`) | the two shapes `A-6` names first: `''` and **a boxed `String`** | **both follow the OS** — `('', true) ⇒ 'dark'`; `(new String('light'), true) ⇒ 'dark'`; `(new String('dark'), true) ⇒ 'dark'` | `(…'')` at both readings ⇒ `'dark'`/`'light'`; **both boxed shapes ⇒ the OS arm, not an explicit choice** | **PASS** |
| **A5** | `§2.1` clause 4 (boolean-strict OS reading) | non-boolean readings `1`, `'true'`, `0`, `''`, `{}`, `[]`, `null`, `undefined` | **not `true`** ⇒ `'light'` (never a coercion of the caller's value) | all eight readings under `'system'` ⇒ **`'light'`** | **PASS** |
| **A6** | `§2.1` clause 3 (last sentence) | an object carrying **recording** `toString`, `valueOf` **and** `Symbol.toPrimitive` as the setting, so a coercion is countable | **`String()`/`toString`/`valueOf` are NEVER consulted** ⇒ invocation counts **0** | `{toString: 0, valueOf: 0, toPrimitive: 0}` at both readings; the returned value is the OS arm | **PASS** |
| **A7** | `§4` `P-TH-IM-1`'s control requirement (`§3a-seed` `ADV-T1`/`ADV-T3`) | grade **five control corpora, authored from the documented cells alone**, against the same decisive cells: (i) *OS wins over an explicit choice* (the `C-1`/`V-1` false-green), (ii) *coerce via `String(setting)`*, (iii) *truthy reading of `prefersDark`*, (iv) *three-state (a `'system'` return)*, (v) *delegate to the vendored record* | **every control MUST fail at least one documented cell** (this is what makes the oracle discriminating) | **all five fail**: (i) fails `('light',true)` and `('dark',false)`; (ii) fails the **boxed-`String`** cell; (iii) fails both non-boolean cells; (iv) fails four cells on the domain; (v) fails both `C-1`/`V-1` cells | **PASS** |
| **A8** | `§1.2` (d) + `D-5` (the four KEPT exports and the signature) | (a) read the adapter's runtime export set; (b) type-probe the documented names/signature out of tree: `resolveTheme(setting: unknown, prefersDark: boolean): ResolvedTheme`, `applyThemeToRoot(root: ThemeRoot, …)`, `ResolvedTheme = 'light' \| 'dark'`, `ThemeRoot = { dataset: { theme?: string } }` | the four names exist **by name**; the two runtime functions are values and the two types are type-level; the probe's four **negative** assertions must all be type errors | (a) runtime exports = **`['applyThemeToRoot','resolveTheme']`** (the two types are erased at runtime — expected); (b) **`tsc` exit 0** with **all four `@ts-expect-error`s consumed** (a numeric `prefersDark` rejected, a `'system'` return rejected, `{dataset:{theme:42}}` rejected, a numeric `setting` **accepted**) | **PASS** |

## B. The declaration-as-data adoption, the fork-supplied attribute name, and the `A-7` removal ruling (`§0A` note 1; `§2.1` items 2/3/6; `§0B` item 2; `D-12`)

| id | Documented clause | Scenario | Expected | Actual | Verdict |
| --- | --- | --- | --- | --- | --- |
| **B1** | `§2.1` *"`resolveTheme`'s NEW internal duty"* | record every call the adapter makes into the vendored module while driving `resolveTheme('system', true)` | the adapter **calls** the vendored `resolveTheme(setting, env)` with **`env = { prefersDark }`** — the record's only member | observed call: `resolveTheme`, `setting = 'system'` (passed verbatim), **`env` keys = `['prefersDark']`** (exactly one own key) | **PASS** |
| **B2** | `§2.1` *"reads the returned record's `prefersDark` member"* (`§3a` `A-2`'s discriminator) | **inject an env record that CONTRADICTS the raw argument** (`prefersDark: !raw`) and ask which reading the adapter follows | the adapter follows the **RECORD** ⇒ `('system', raw true) ⇒ 'light'`, `('system', raw false) ⇒ 'dark'` | **`('system', true) ⇒ 'light'`** and **`('system', false) ⇒ 'dark'`** — the record, not the raw argument; and the **explicit arm still wins** (`('light', true) ⇒ 'light'`) | **PASS** |
| **B3** | `§2.1` item 2 | record the declaration call | the write is obtained **as data** from the vendored `applyThemeDeclaration(attributeName, resolved)` with **`attributeName = 'theme'`** (the fork's own token, `§1.2` (c)) | observed call: `applyThemeDeclaration`, **`attributeName = 'theme'`**, `resolved = 'light'` (the resolution) | **PASS** |
| **B4** | `§2.1` item 3 (*"one write of **the record's** decision"*) | inject a declaration whose `value` **contradicts** the resolution (`value = 'RECORD-DECISION'`, `removal: false`) while `resolved = 'light'` (`§3a` `A-4`'s discriminator) | the **write** follows the record; the **return** is the resolved theme | observed: `set ['theme','RECORD-DECISION']`; attribute after the call = `'RECORD-DECISION'`; **return = `'light'`** — the record decides the write, the resolution is returned | **PASS** |
| **B5** | `§0B` item 2 + `§2.1` item 6 + `D-12` (**the `A-7` ruling**) | inject a **`removal: true` record** (`{name:'theme', value:'', removal:true}`) and apply it to a root that **already carries `data-theme='dark'`** | **the attribute is REMOVED** — not left in place, and not written `''` | observed: `deleteProperty('theme')` **once**, `set` **zero times**; **attribute after the call = ABSENT**; return = `'light'` (the resolution) | **PASS** — **and the spec's narration of the landing is stale (see `X-1`)** |
| **B6** | `§3.2` item 5 + `§4` `P-TH-TP-2` | drive the **reachable** path (real vendored module) over 7 `(setting, prefersDark)` cells against a root carrying a pre-existing attribute | **exactly one** write; the written value **equals the returned** `ResolvedTheme`; **the removal arm is never taken** | 7/7 cells: `setCount 1`, `deleteCount 0`, attribute after the call = the returned value (`'light'`/`'dark'`) | **PASS** |
| **B7** | `§0B` item 2's control requirement (*"a leave-in-place or writes-`''` corpus MUST FAIL"*) | the same oracle graded against the **value-record** drive (the control with the **opposite** outcome) | the oracle must classify it **NOT removed** (i.e. the skip reading is falsified by this instrument) | the value-record drive leaves the attribute **SET** (`'dark'`) — the oracle reports **in-place**, never *removed*; and the injected removal drive reports **removed** ⇒ **the two readings are distinguishable** | **PASS** |

## C. Totality / fail-soft (`§3.2` items 1–4/9; register `P-TH-TP-3`)

| id | Documented clause | Scenario | Expected | Actual | Verdict |
| --- | --- | --- | --- | --- | --- |
| **C1** | `§3.2` item 1 | a `dataset`-carrying root (a recording `Proxy`) at 3 `(setting, prefersDark)` cells | the resolved theme is written onto `root.dataset.theme` **and returned** | 3/3: **one** `set(['theme', resolved])` each; attribute after the call = the return | **PASS** |
| **C2** | `§3.2` item 2 | a **FROZEN** `dataset` (`Object.freeze` target under a recording `Proxy` whose `set` fails) | **nothing throws**; the assignment is **absorbed**; **the resolved theme is still returned**; no attribute persists | 3/3: `threw = false`, return in domain, **attribute after the call = `undefined`** (the attempt is visible at the trap, nothing persists) | **PASS** |
| **C3** | `§3.2` item 3 | `root = {}` (no `dataset` member) | **nothing throws**; the resolved theme is still returned; **no attribute is written** | 3/3: `threw = false`, return in domain, `root.dataset` still `undefined` | **PASS** |
| **C4** | `§3.2` item 3 (*"or `null`/`undefined`/a primitive at runtime"*) | `root = null` and `root = 42` | **nothing throws**; the resolved theme is still returned | 6/6: `threw = false`, return in domain | **PASS** |
| **C5** | `§3.2` item 4 | a root whose **`dataset` READ throws** | **nothing throws**; the resolved theme is still returned | 3/3: `threw = false`, return in domain | **PASS** |
| **C6** | `§3.2` item 2 (the throwing-assignment arm) | a `dataset` whose `set` trap **throws** (recording) | the throw is **absorbed**, never leaked to the caller; the resolved theme is still returned | 3/3: the trap fires, **no exception escapes**, return in domain | **PASS** |
| **C7** | `§3.2` item 9 | repeated calls with the same arguments | **the same** `ResolvedTheme` every time; no module state, no cache, no memo | every repeated cell identical; the whole grid was re-driven with identical results | **PASS** |
| **C8** | `§3.2` items 1–4 (aggregate) | 7 root shapes × 3 `(setting, prefersDark)` = **21 applier drives** | **0 throws** and a two-member-domain return in **every** drive | **21/21: `threw = false`, domain-true** | **PASS** |

## D. The vendored mechanism's declared records, and the pin (`§3.1` items 1–17; `P-TH-IM-4`; `R-4`/`R-6`)

| id | Documented clause | Scenario | Expected | Actual | Verdict |
| --- | --- | --- | --- | --- | --- |
| **D1** | `§3.1` items 3–11 | drive the vendored `resolveTheme('my-token', env)` over **14 env shapes** | `'env'` for a genuine own member (`true` or `false`, incl. an accessor); **`'degraded-env'` + `prefersDark: false`** for omitted/`null`/a primitive/`{}`/an **inherited** `true`/a **trap-only `Proxy`**/`1`/`'true'`/`NaN`/a **throwing** getter; **never a throw** | **14/14 exactly as declared** (`{prefersDark:false}` ⇒ `source:'env'` — a normal reading; an inherited `true` ⇒ `degraded-env`; the trap-only `Proxy` ⇒ `degraded-env`; the own accessor ⇒ `true`/`env`) | **PASS** |
| **D2** | `§3.1` items 1–2 | drive the vendored resolver's `setting` member over 9 shapes, incl. a recording-coercion object used as the setting **and** as an attribute name | a non-empty string **by identity** (`'system'`, `'DARK'`, `' dark '` verbatim); `''`/non-string/omitted ⇒ **`null`**; **coercion hook counts 0** | `'system'`/`'DARK'`/`' dark '` echoed verbatim; `''`/`42`/`null`/omitted/`Symbol` ⇒ `null`; hook counts **`{toString:0, valueOf:0, toPrimitive:0}`** for both functions | **PASS** |
| **D3** | `§3.1` items 12–15 (`§2.4` item 2) | drive the vendored `applyThemeDeclaration(name, resolved)` over 10 argument pairs | `{value: resolved, removal: false}` for any non-empty string (`'false'`/`'0'`/`' '` **legal values, not removals**); `{value:'', removal:true}` **only** for `''`/non-string/omitted; `name: null` for `''`/a non-string name; **the name is still echoed on the removal arm** | **10/10 exactly**: `('theme','light') ⇒ {name:'theme',value:'light',removal:false}` · `('theme','') ⇒ {name:'theme',value:'',removal:true}` · `('','dark') ⇒ {name:null,value:'dark',removal:false}` · `('theme','false'/'0'/' ') ⇒ removal:false` · `('theme',null/undefined/42) ⇒ removal:true` | **PASS** |
| **D4** | `§3.1` item 17 | call the resolver twice with the same arguments | a **fresh, plain, neither-frozen-nor-sealed** record while members are carried by identity: `toEqual` holds, `toBe` fails | `{toEqual: true, toBe: false, frozen: false, sealed: false}` | **PASS** |
| **D5** | `§3.1` item 16 | every drive of every row above | **NEVER** a throw; no `ok`/`code`/`reason`/`thrown` member anywhere | **0 throws across all vendored drives** (14 + 9 + 10); every returned record carried exactly the three declared members | **PASS** |
| **D6** | `§4` `P-TH-IM-4` (a)/(b); `R-4`; decision clause (3) | (a) recompute the digest of `src/shared/theme.ts` and compare with the manifest's `theme` entry and with the foundation's copy at the pin; (b) census the four prohibited tokens in the vendored bytes | digest **equal** to the manifest (`c4b4d4c4…`), byte-identical to the foundation's file; **0** imports, **0** `matchMedia`, **0** `data-theme`, **0** `localStorage` | **`md5 c4b4d4c4127158d14bc035e58d857597`** = the manifest's `theme.md5` = the foundation copy's digest; **`cmp` ⇒ byte-identical**; counts **0/0/0/0** in the vendored bytes | **PASS** |
| **D7** | `§2.1` *"Import census of the adapter (post-adoption, pinned): exactly one import statement"* | (a) count the adapter's import statements; (b) read the bundled **module graph** | **exactly one** import statement, resolving to `src/shared/theme.ts` (the corrected `'../shared/theme.js'` spelling, `§0B`'s `A-9` note) | (a) `import` statements in `src/renderer/theme.ts` = **1**; (b) the bundle's inputs = **`{src/renderer/theme.ts, src/shared/theme.ts}`** — the edge is real and resolves to the **vendored** member | **PASS** |

## E. The token layer and the persisted carrier (`§1.2` (c); `R-3`; `R-5`; register `P-TH-SM-1`/`P-TH-SM-2`)

| id | Documented clause | Scenario | Expected | Actual | Verdict |
| --- | --- | --- | --- | --- | --- |
| **E1** | `§1.2` (c) (the 15 names, listed in the spec itself) | census the custom-property declarations in `src/renderer/index.html` | **exactly** the 15 documented names — `--bg` `--fg` `--muted` `--muted-2` `--muted-3` `--muted-4` `--card-bg` `--border` `--border-strong` `--input-bg` `--input-fg` `--input-border` `--error` `--accent` `--hover` — and no other appearance token | **exactly those 15, each declared 3× (`:root` + both attribute blocks)**; the only other custom properties are the **four `--zone-*-track`** names (zone CSS, `PD-ZONES-*`'s surface, **not** appearance tokens) | **PASS** |
| **E2** | `§1.2` (c) + `§4` `P-TH-SM-1` (e) | census the selectors and the fallback | `html[data-theme='light']` and `html[data-theme='dark']` **selectors**, plus the `@media (prefers-color-scheme: dark)` fallback keyed on the attribute's **absence**; the token names/values **unchanged by this unit** | **1 light selector + 1 dark selector** (every other `data-theme` mention is inside a CSS **comment**, incl. the documented *"until the renderer boot applies an explicit attribute"* comment); **1 `@media (prefers-color-scheme: dark)` block** with its lower-specificity comment | **PASS** |
| **E3** | `§1.2` (c) + `R-5` (the carrier is KEPT) | census the persisted carrier's presence | the `theme` carrier is the fork's own: `ThemeSetting` in `src/shared/types.ts`, the coercion in `src/main/operator-settings-store.ts` | both files name `ThemeSetting` (a presence reading, 3 occurrences in `types.ts`) | **PASS** |
| **E4** | dossier `C-2`: *"`coerceTheme` (exact-string coercion, default `'system'`)"* | drive the coercion's documented outputs (the three members pass through; a non-member ⇒ `'system'`) | — | **`coerceTheme` is NOT REACHABLE from any documented public surface:** the store module's **only runtime export is `createOperatorSettingsStore`** (measured export list), and **no listed document fixes that factory's construction signature or the coercion's input universe**, so the expected values cannot be driven blind. **What is missing: a documented public entry point (or a documented factory signature) for the coercion.** **A pass that reads the source to fill this gap is the failure mode this gate exists to catch** | **NOT-BLIND-DERIVABLE** |
| **E5** | `§4` `P-TH-SM-2` (c) (*"`installTheme` … writes nothing back (no `operatorSettings.set(...)` call on the theme path)"*); `D-4` | census the write-back forms on the theme path | **no write-back** | `operatorSettings.set` = **0** and `.set(` = **0** in `src/renderer/renderer.ts`; the preload bridge's `onChanged(`/`get(` forms are present (2/8) | **PASS** — instrument-scoped, and **`(bounded)`** exactly as the register itself marks this clause (a token scan over the write set is not a runtime proof) |

## F. The boot wiring (`§2.2`; `[H]` host-side census)

| id | Documented clause | Scenario | Expected | Actual | Verdict |
| --- | --- | --- | --- | --- | --- |
| **F1** | `§2.2` item 1 (*"a module-private function, **not exported**"*) | census the export form of the wiring | `installTheme` is **not exported** | `export function installTheme` = **0**; `installTheme` = **2** (the declaration and its one boot call) ⇒ **the wiring has no importable public surface**, which is why no scenario below drives it | **PASS** (the documented clause reproduces) |
| **F2** | `§2.2` item 4 (*"attached ONCE"*) | census the listener attachment | exactly one `change` listener attachment | `addEventListener('change'` = **1** | **PASS** (source-text instrument) |
| **F3** | `§2.2` item 4 + `§0B` item 3 (`A-11` RULING) | census the liveness predicate | the predicate is **setting-based** (the same strict-identity test against the two literals) — the as-filed *"the `applyThemeToRoot` return feeds it"* is **superseded** | the documented setting-based predicate form occurs **exactly once**; the as-filed return-consuming form is not present | **PASS** (instrument-scoped; the behaviour itself is not drivable — see `NT-4`) |
| **F4** | `§2.2` item 6 (*"THE ONE WRITE SITE … no other `src/**` file writes it"*) | census `dataset.theme` occurrences, splitting **assignments** from mentions | exactly **one** assignment-shaped write site in all of `src/**`; the wiring's single call site present | assignment-shaped `dataset.theme =` ⇒ **1, in `src/renderer/theme.ts`**; `src/renderer/renderer.ts`'s single `dataset.theme` mention is **not** an assignment; `applyThemeToRoot(document.documentElement` = **1** | **PASS** |
| **F5** | `§2.2` items 2/3 (*"guarded by `typeof window.matchMedia === 'function'` inside a `try`; a thrown or absent `matchMedia` ⇒ `media = null` and the reading degrades to `false`"*) | drive the guard's fail-states | `matchMedia` throwing/absent ⇒ `prefersDark()` reads `false`, **no throw**; a `matchMedia` without `addEventListener` degrades silently | **not derivable by the instruments this pass may use:** the counts (`matchMedia` = 4, `'prefers-color-scheme: dark'` = 2 in `renderer.ts`) show the read is present, but **the guard/`try`/degradation behaviour is control flow inside a module with no public surface** (see `F1`). **What is missing: an importable/exported wiring entry point, or a documented seam that lets a pass supply `window`.** | **NOT-BLIND-DERIVABLE** |
| **F6** | `§2.2` item 5 (the seam: `operatorSettings.get()`/`onChanged` *"both optional-chained and both inside `try`"*; an absent bridge keeps `'system'` and **nothing throws**) | drive the seam's fail-states | absent bridge / absent `operatorSettings` / absent `onChanged` / a rejected `get()` ⇒ the setting keeps `'system'` and **nothing throws** | **not derivable**: the bridge methods exist (preload `get(` = 8, `set(` = 9, `onChanged(` = 2; the wiring names `operatorSettings` 8× and `onChanged` 8×), but **the fail-soft behaviour is inside the private `installTheme`** (`F1`) and the pass may not read it to author the expectation. **What is missing: a documented, importable wiring entry (or a documented injected-`window` seam).** | **NOT-BLIND-DERIVABLE** |

## G. The legs, the baseline delta, and the layer absence (`§7`; `RCA-11`/`RCA-12`; `R-8`)

| id | Documented clause | Scenario | Expected | Actual | Verdict |
| --- | --- | --- | --- | --- | --- |
| **G1** | `§7.2` item 1 (`R-8`; proposal `§7.5` item 2) — *"`npm run divergence` is RED at this head for an ENVIRONMENTAL reason — the Electron leg dies at bootstrap with `Creating shared memory in /dev/shm/.org.chromium.Chromium.* failed: Permission denied (13)`"* | **the environment clause only** (the leg itself was **not run**, by instruction): probe `/dev/shm` in this environment | the documented cause is present: `/dev/shm` **not writable** by this user | `/dev/shm` exists as a **32 G tmpfs** (`drwxrwxrwt root root`, 3 % used) but **`touch /dev/shm/.__probe_… ⇒ Permission denied`** — **the documented environmental precondition is present**. **The divergence LEG reading is NOT this pass's** (inherited `PRECONDITION-FAILED` reading; the fix is `U-DIVERGENCE-SPAWN`'s) | **PASS** (ENVIRONMENT-layer only, labelled) |
| **G2** | `§7.1` (the legs) / `§7.3` (the EXTENDED baseline) | run `npm run typecheck` · `npm run build` · `npm run battery` | `typecheck` **0**; `build` **0**; `battery` **`184 checks, 0 failures` GREEN** (`[H]`) | **`typecheck` exit 0** (no diagnostics) · **`build` exit 0** (main cjs + preload cjs + standalone/host mjs + renderer esm + `index.html`) · **`BATTERY RESULT: 184 checks, 0 failures`** — **the recorded baseline reproduces exactly** | **PASS** |
| **G3** | `§7.1` (`npm test`) / `§7.3` (one carried red) / decision clause (1) (*"no unit may claim a clean trio while it stands"*) | run `npm test` and read the per-file reading | the **one carried red** is the baseline `PANE-TOGGLE-STAGE-COLLAPSE` / `P-SM-1` (`strat:stage-seam-schedule-single-active`); the DONE row states the delta against the recorded 204 files / 4384 tests | **206 files (1 failed / 205 passed) · 4427 tests (1 failed / 4381 passed / 45 skipped)**, 15.45 s; the **single red is `archive/tests/2026-10-04-unit-stage-active-tab-display-pbt-generators.test.ts` (7 tests \| 1 failed)** on the `P-SM-1 [strat:stage-seam-schedule-single-active]` row → **the carried red is unchanged; the counts moved +2 files / +43 tests** (the unit's own two files, below) | **PASS** |
| **G4** | `§2.1` (the delegation rows) / `§3.4` items 1/4/5 / `§6.1` (the red set) | read the per-file status of the files this unit brushes | the unit's own rows, the served file and the pins all read in the same run | **`archive/tests/2026-10-04-pd-ui-1-theme-adoption.test.ts` 19 PASS** · **`tests/pd-ui-1-theme-register.test.ts` 23 PASS** · **`tests/pd-vendor-set.test.ts` 69 PASS** · **`archive/tests/2026-10-04-unit-u-shell-2-theme.test.ts` 10 PASS** · **`archive/tests/2026-10-04-unit-u-shell-shell-wiring.test.ts` 33 PASS** — and this last reading **discharges `§3.4` item 5's `UNVERIFIED`** (*"whether it reds on a theme-only body change"* → it does **not**) | **PASS** — **and three of the spec's "RED BY DESIGN" claims are stale (`X-1`/`X-2`/`X-3`)** |
| **G5** | `§5` (the layer ledger) / `§7.2` (the live mandate) / `RCA-11`/`RCA-12` | record this artifact's own layer absence explicitly, rather than omit it | **no row of this artifact is an app/live row**; the `L-1`..`L-4` claims are **UNTAKEN**; `npm run divergence` is **not run**; the live pass's documented status is `PRECONDITION-FAILED` with the divergence reading attached, **never a silent park** | **this artifact claims no app-green, no envelope-green and no live-green.** The four live claims (`L-1` applied `data-theme` at boot · `L-2` an OS flip re-applies · `L-3` the token block reacts · `L-4` the `@media` fallback fires) are **absent by construction** and are listed as `NT-1` below, with the environment reading in `G1` as the attached precondition evidence | **PASS** (a declaration row: the documented absence reproduces) |

---

## NOT-TESTABLE (explicit list, with reasons)

**`NT-1` — the whole assembled/live surface (`§7.2` `L-1`..`L-4`; `RCA-11`).** A real Electron boot, a real
`matchMedia`, a real `DOMStringMap`, a real stylesheet reaction and a real OS flip are all outside a node
process. **No Electron boot, no live battery and no divergence leg was run by this pass** (instruction +
`R-8`). **The consequence is stated, not smoothed: this artifact cannot and does not say the app themes.**

**`NT-2` — whether the fork's `prefersDark` matches a real OS setting (`§5` item 7).** Structurally
unobservable here, and the foundation records the same limit (`post-division-foundation-adoption-surface.md`
`§10` `U-8`). The reading is a **caller claim**, by both trees' own words.

**`NT-3` — whether `dataset`-level deletion is the correct removal mechanic against a REAL `DOMStringMap`
(`§9` item 7, `A-7`'s added `UNVERIFIED`).** Row `B5` drives the **ruled semantics** through a `Proxy`; the
live mechanic is a `[U]` question the spec itself parks.

**`NT-4` — the wiring's control flow (`§2.2` items 2/3/5).** `installTheme` is module-private by contract
(`F1`), so its `try`/`typeof` guards, its degradation-to-`false` arm and its seam fail-soft arms are
**not drivable** and are recorded as `NOT-BLIND-DERIVABLE` (`F5`/`F6`) rather than asserted from a count.

**`NT-5` — the register's executed rows as such.** The register's eight rows (23 tests) run **inside the
unit's own test file**, which this pass may not read: the pass reports the **leg reading** (23 PASS, `G4`) and
the **spec-table arithmetic recomputed by hand** (`194 = 28+26+67+24+27+6+8+8`; every cell equals the sum of
its own factors; every row ≤ 100; `194 ≤ 120` is FALSE and declared) — it does **not** re-author or
independently re-run those rows, and it does not certify their oracles.

**`NT-6` — the `§4` `P-TH-SM-1` (f) / `P-TH-SM-2` (c) `git status --porcelain` limbs.** `§3a`'s `A-1` finding
already records these as vacuous on a clean committed tree; this pass confirms the tree is clean (an empty
`git status --porcelain`) and therefore **cannot** take that reading either way. The **digest** route (`D6`)
is the live form and it passes.

**`NT-7` — the tracker/handover state (`§9` items 3/5/8/9; dossier `A-2`/`A-4`).** Whether the deferral
`PD-THEME-4` exists, whether the `≤120` cap question is ruled, and whether the mocked-record instrumentation
question (`E-8`) is decided are **doc/tracker facts**, not measurable claims; this pass checked none of the
trackers and asserts nothing about them.

---

## Contradictions — where the documentation disagrees with what was MEASURED

**Five. A live contradiction of the contract is a finding, and these five are the most valuable part of this
pass.** **None of them is a FAIL of a documented behaviour — every behaviour this pass could drive matches the
documentation.** They are contradictions between the spec's **narration of the landed state** and the **landed
state itself**, i.e. documentation staleness at this head.

### `X-1` — **THE `A-7` HOST FIX AND THE TRIPWIRE REPLACEMENT HAVE LANDED; THE SPEC STILL RECORDS THEM AS OWED AND "RED BY DESIGN".** (the highest-value finding)

- **The documentation says** (`§0B` item 2): *"the landed adapter performs the write only when
  `write.removal` is false, so a removal record leaves a pre-existing `data-theme` in place"*; *"IS THE LANDED
  ADAPTER CORRECT? NO — A `HOST-FIX` IS OWED"*; *"Until that pass lands, the tripwire is RED BY DESIGN"*.
  And `§9` item 1 item (e): *"the `§0B` item 2 RULING makes the landed adapter's removal arm DIVERGENT … a
  `HOST-FIX` … is OWED"*; `§9` item 7: *"the two RED-BY-DESIGN `[T]`-side reconciliations"*; `D-12`'s
  consequence clause; `§2.1` item 6 and `§3.2` item 5's *"the landed 'perform no write' reading is
  DIVERGENT"*.
- **I measured** (`R-run-7`, row `B5`): with an injected `removal: true` record applied to a root that
  **already carries `data-theme='dark'`**, the adapter performs a **`deleteProperty('theme')`** and **sets
  nothing**; the attribute is **ABSENT** after the call, and the resolution is still returned. The
  **leave-in-place** reading is falsified by the same instrument (row `B7`).
- **Corroboration from the leg reading** (`G4`): `archive/tests/2026-10-04-pd-ui-1-theme-adoption.test.ts` = **19 PASS**, and its
  visible row title in the run's stdout is *"`⟨A-7 RULED + A-2⟩ P-TH-TP-2` — the removal branch: an injected
  `removal: true` record must leave the pre-carried attribute GONE, and a LEAVE-IN-PLACE or `writes ''`
  corpus MUST FAIL the ruling"* — i.e. the tripwire's two SKIP-reading limbs have been **replaced**, which is
  exactly what `§0B` item 2 pre-committed to and `§9` item 7 said was still owed.
- **Disposition owed:** the spec's `§0B` item 2 (its ruling paragraph's consequence block), `§2.1` items 3/6,
  `§3.2` item 5, `§9` item 1 item (e), `§9` item 7 and `D-12` need **annotate-beside** amendments recording
  that the `HOST-FIX` **landed** and that the tripwire was replaced (the `A-7` debt is **discharged at this
  head**, not open).

### `X-2` — **THE `PD-VENDOR` "VENDORING IS INERT" PIN HAS BEEN RE-STATED; THE SPEC STILL CALLS THE RE-STATEMENT AN OPEN BLOCKING PREREQUISITE.**

- **The documentation says** (`§0A` note 2): *"THIS IS THIS UNIT'S BLOCKING PREREQUISITE (`§9` item 1)"*;
  `§3.4` item 1: *"**THIS UNIT REDS IT**, deliberately and correctly"*; `§9` item 1: *"`E-1` [BLOCKING FOR THIS
  UNIT'S LANDING] … **Until it is disposed, this unit's landing would leave one red file** whose cause is
  correct and whose fix is not this unit's to author"*; dossier `A-1` the same.
- **I measured:** the specifier census over `src/**` for the fifteen vendored names returns **FOUR hits over
  three files** — `src/renderer/renderer.ts ./pane-gutter.js`, `src/renderer/renderer.ts ./theme.js`,
  `src/renderer/sidebar-panes.ts ./pane-gutter.js`, and **`src/renderer/theme.ts` → `src/shared/theme.ts`**
  (the fourth hit the escalation predicted, with its resolved path proven by the module graph, `D7`). **And
  `tests/pd-vendor-set.test.ts` reads 69 PASS in the same run** ⇒ the pin's assertion has been re-stated to
  admit the consumer edge in the same commit; **no red file remains**.
- **Disposition owed:** `§0A` note 2, `§3.4` item 1, `§9` item 1 (`E-1`) and dossier `A-1` need amendment
  recording the **landed re-statement** (with the allow-list's actual shape, which the pass that landed it
  owns), so the next reader does not treat a discharged blocking prerequisite as open.

### `X-3` — **THE REGISTER TEST'S SPEC-TABLE LIMBS ARE GREEN, NOT "RED BY DESIGN".**

- **The documentation says** (`§0B` item 1, the `OPENED, and DECLARED` paragraph): *"the same file's
  spec-table limbs … **Those limbs are now RED BY DESIGN**"*; and `§9` item 9: *"THE REGISTER TEST'S
  SPEC-TABLE LIMBS ARE NOW RED BY DESIGN AND NEED RE-POINTING"*.
- **I measured:** `tests/pd-ui-1-theme-register.test.ts` reads **23 PASS** in the same run, and the spec's
  `§4` table prints `194 = 28 + 26 + 67 + 24 + 27 + 6 + 8 + 8` (recomputed by hand: **the total is the sum of
  its own terms; every cell equals the sum of its own factors; every row ≤ 100; `194 > 120` is declared**) ⇒
  the limbs have been re-pointed to `194` and the `173` reading is carried as the superseded one.
- **Disposition owed:** `§0B` item 1's `OPENED, and DECLARED` paragraph, `§9` item 9 and `§9` item 7's
  RED-BY-DESIGN clause need amendment (`E-9` is **discharged at this head**).

### `X-4` — **THE FILE'S OWN STATUS BLOCK IS FALSE AT THIS HEAD: IT SAYS "NO CODE LANDED, NO TEST LANDED, NOTHING RUN".**

- **The documentation says** (status block): *"**NO CODE LANDED, NO TEST LANDED, NOTHING RUN by this pass. No
  red set has been authored or run.**"*
- **I measured:** the adapter is landed and imports the vendored module (`D7`), the wiring is landed (`F2`/`F4`),
  the unit's two test files exist and read **19 PASS** and **23 PASS** (`G4`), and the register's arithmetic is
  **executed** in that file. The status block describes an earlier, spec-only pass and was **not** superseded
  by the `§0B` amendment ledger (which correctly describes itself but leaves the status block as filed).
- **Disposition owed:** the status block needs an annotate-beside amendment (or a dated successor status
  block) recording the landing; a reader arriving at this file today is told the opposite of the tree.

### `X-5` — **THE RECORDED LEG BASELINE HAS MOVED (files/tests), AND NO LANDED ARTIFACT STATES THE CURRENT FIGURE.**

- **The documentation records** (`§7.1`, `§7.3`, quoted as input at `9202dc8`): `npm test` = **204 files
  (1 failed / 203 passed) · 4384 tests (1 failed / 4338 passed / 45 skipped)**; `typecheck` 0; `build` 0;
  `battery` **184 checks, 0 failures**; `divergence` RED-environmental.
- **I measured:** **206 files (1 failed / 205 passed) · 4427 tests (1 failed / 4381 passed / 45 skipped)**;
  `typecheck` **0**; `build` **0**; `battery` **`184 checks, 0 failures`**; the single red is the carried
  `P-SM-1` baseline row. **Two of the four legs reproduce exactly (`battery`, and the "one carried red") and
  the counts moved** by this unit's own two files (+2 files, +43 tests). `§6.3`/`§7.1` record the
  **before → after reading as still owed**; the **after** half is this pass's reading and is stated here, but
  **no landed artifact carries it**, and the spec's figures are stale.
- **Reading:** drift with an honest label (the spec calls them RECORDED READINGs of an earlier head and
  re-runs nothing), **not a false claim** — but the DONE row that quotes `204/4384` is wrong at this head.

---

## Verified-NOT-contradicted (recorded so a reader sees what was checked and cleared)

- **The `C-1`/`V-1` scope decision holds at the landed tree**: the precedence rule is evaluated **in the
  adapter** (`A1`/`A2`/`A7`), and the adapter's delegation to the mechanism is **behaviourally observable** —
  the inverted-record drive (`B2`) distinguishes *"reads the returned record"* from *"applies the same strict
  test to the raw argument"*, which `§3a`'s `A-2` recorded as **unobservable by the remand's rows**. **The
  strongest false-green `§3a` constructed is falsified by this instrument** (rows `A7`, `B2`, `B4`): an
  adapter that discards the record's members and writes `resolved` fails `B2` and `B4`.
- **The write is observed, not merely returned** (`§3a-seed` `ADV-T2`): the attribute is read back off the root
  in `B5`/`B6`/`C1`; a record-only corpus would leave it absent while `B5`'s removal drive and `B6`'s set are
  both observed.
- **`'system'` is not smuggled in as a third state** (`ADV-T3`): 250/250 cells are in the two-member domain,
  and the three-state control corpus fails four cells (`A7`).
- **No sixth `src/**` write site, no second authority**: one assignment-shaped `dataset.theme` site (`F4`);
  the vendored bytes carry the four prohibited tokens zero times (`D6`).
- **The vendored bytes are the pin** (`R-4`): digest and bytes equal the manifest and the foundation's copy
  (`D6`).
- **`§3.4` item 5's `UNVERIFIED` is DISCHARGED**: `archive/tests/2026-10-04-unit-u-shell-shell-wiring.test.ts` = 33 PASS after a
  theme-body edit ⇒ the source-text pin over `renderer.ts` does **not** red on this unit's change (`G4`).
- **`§1.3`'s `E-1`/`E-2` absences reproduce**: zero `theme`/`Theme` occurrences in `src/shared/demo-envelope.ts`
  and zero in `src/renderer/sidebar-panes.ts` ⇒ no authored appearance control exists (the deferral is real,
  not a silent omission).

---

## Verdict summary

| Verdict | Count |
| --- | --- |
| **PASS** | **43** |
| **FAIL** | **0** |
| **NOT-BLIND-DERIVABLE** | **3** (`E4`, `F5`, `F6`) |
| **NOT-TESTABLE** | **7** (`NT-1`…`NT-7`) |
| **CONTRADICTIONS filed** | **5** (`X-1`…`X-5`) |

**Total scenario rows in the tables: 46** (`A1`–`A8`, `B1`–`B7`, `C1`–`C8`, `D1`–`D7`, `E1`–`E5`, `F1`–`F6`,
`G1`–`G5`).

**No FAIL is softened into a pass and no `NOT-BLIND-DERIVABLE` is softened into a pass.** **There are no
FAILs, and that is a reading, not a courtesy:** every claim of the **contract** this pass could drive behaves
as the contract rules — **including the `A-7` ruling, which the landed adapter now satisfies** — and the five
findings are **contradictions between the spec's narration of the landed state and the landed state**, which
the task's own instruction treats as the highest-value return. **Every `NOT-BLIND-DERIVABLE` names what is
missing** (a documented public entry point for the coercion; an importable/exported wiring surface for the
`matchMedia` guard and the seam fail-soft arms) **and none was filled in by reading code.**

**Layer reminder (RCA-12): the 43 PASSes above are ENVELOPE/`[T]`-layer, `[H]`-census and static-source
readings. None of them proves the app themes, that a stylesheet reacted, or that an OS flip was observed.**

## Repo-tree integrity (this pass's own discipline)

- **Only ONE file was created by this pass: `docs/specs/unit-pd-ui-1-theme-greens.md`.** Nothing else in the
  repo was written or edited: **`tests/**`, `src/**`, `vendor/**`, `scripts/**`, `package.json`,
  `vitest.config.ts`, `vitest.conformance.config.ts`, both trackers and every other `docs/**` file are
  byte-unchanged**; the adjacent foundation tree was **read only** (its `HEAD` re-read for the pin, nothing
  written). **The unit's own test files were neither read nor modified.**
- **Verification:** `git status --porcelain` printed **nothing** before this artifact was written and **the
  only entry after it is the new file**; **HEAD is still `35f336275f8cee927994bc81c7656732ae6aa528`** on
  `post-division-rebuild`. `npm run build` rewrote only `dist/**`, which is **gitignored** (`.gitignore:86`),
  so the tracked tree is untouched.
- **The throwaway harness lives OUTSIDE the repo** (`/tmp/pd-ui-1-blind/**`): the bundler instrument, the four
  stub binds, the three drivers, the control corpora, the `tsc` type probe over **out-of-tree copies**, and
  the raw reading files (`readings.json`, `readings2.json`, `controls.json`, `trio.log`, `*-leg logs`). **No
  repo file was used as a mutable target for any row, and no repo file was a source of any expected value.**
- **`npm run divergence` was NOT run** (instruction; `§7.2`/`R-8`), and **no Electron boot, no live battery,
  no `scripts/**` invocation and no tracker edit** was made by this pass.

## Cross-references (§ sections here are this file's; the unit's are named as `unit-pd-ui-1-theme.md`)

`docs/specs/unit-pd-ui-1-theme.md` status block · `§0B` items 1–4 · `§0` `R-1`..`R-11` · `§0A` notes 1/2 ·
`§1.2` (b)/(c)/(d) · `§1.3` `E-1`..`E-4` · `§1.4` · `§2.1` (exports, the resolver's rule clauses 1–4, the new
internal duty, the applier's rules 1–6, the import census) · `§2.2` items 1–7 · `§2.3` · `§2.4` · `§3.1`
items 1–17 · `§3.2` items 1–10 · `§3.3` · `§3.4` items 1–8 · `§4` (`P-TH-IM-1`/`P-TH-IM-2`/`P-TH-TP-1`/
`P-TH-TP-2`/`P-TH-TP-3`/`P-TH-IM-4`/`P-TH-SM-1`/`P-TH-SM-2`, the amended `194` arithmetic, the `(bounded)`
carve-out, the rejected rows) · `§5` items 1–9 · `§6.1`–`§6.4` · `§7.1`–`§7.3` (`L-1`..`L-4`) · `§8`
`D-1`..`D-14` · `§9` items 1–9 (`E-1`..`E-9`) · `§3a` (`A-2`/`A-3`/`A-4`/`A-6`/`A-7`/`A-8`/`A-9`/`A-11`/`A-12`,
the strongest false-green, the PBT audit) · `§3a-seed` (`ADV-T1`..`ADV-T12`) · `§10` · `§11` ·
`docs/specs/pd-ui-1-adoption-dossier.md` `§1` rows 1–8 / `§2` `C-1`..`C-7` / `§3` `A-1`..`A-5` ·
`../Provident-Electron/docs/guide/theme.md` (the opening paragraph, *What it is*, UC-2's applied-write recipe,
*Code, runnable*, *What a fork must supply*, *Gotchas measured in this repo*) ·
`../Provident-Electron/docs/specs/theme.md` `§2.1`/`§2.2` (D)/`§2.3`/`§2.4`/`§2.5`/`§3.1`–`§3.4`/`§5.5.1` ·
`docs/specs/post-division-rebuild-proposal.md` `§4.1`/`§4.7`/`§7.4`/`§7.5` ·
`docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` (clause (1)) ·
`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` (clauses (1)–(3)) · `DECIDED: UI-CONFIG-CARRIER` ·
`DECIDED: OPERATOR-ISOLATED-GRAPHSCOPE` · `DECIDED: STORE-LISTING-PROVIDENT-AUTHORED` ·
`docs/specs/unit-pd-vendor-foundation-mechanisms-greens.md` (shape) ·
`docs/specs/rca-live-bugs-green-pipeline.md` (`RCA-11`/`RCA-12`) · `AGENTS.md` items 4/6/10a/10d.
