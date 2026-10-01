# STEP-0 ADOPTION DOSSIER — unit `PD-UI-1` (the theme unit, wave `W1` of the post-division rebuild)

**Status: STEP-0 INPUT — authored 2026-09-28. NO CODE LANDED, NOTHING RUN.** **Unit spec this dossier serves:**
`docs/specs/unit-pd-ui-1-theme.md`.
**⟨STATUS AMENDED 2026-09-28 (item-10d documentation review; annotate-beside — the as-filed sentence above is KEPT
verbatim and is NOT rewritten — `RCA-8(c)`).⟩ THE DOSSIER'S IDENTIFIER WORK IS UNMOVED — all eight rows are
`defined`, the collision block reconciles every hit by row id, and the CAP stays full at eight — but the
*"NO CODE LANDED, NOTHING RUN"* half describes a **STEP-0 filing pass**, not this head: the unit's adapter, wiring
and test files have since **landed** (see the unit spec's head annotation and
`docs/specs/unit-pd-ui-1-theme-greens.md` `X-4`), and the `§3` `A-1` blocking prerequisite below is **DISCHARGED**.
**This dossier's own layer claim still stands exactly as filed: an adoption dossier adopts identifiers and asserts
nothing app-green, envelope-green or live-green, and this review ran no leg either.**⟩ **Program:** `docs/specs/post-division-rebuild-proposal.md` §4.1's
`PD-UI-1` row (the corrected `SUBSET+ADAPTER` classification, `C-1`/`V-1`), §4.2 (the seam gap), §4.5 (W1),
§4.7 (`C-15`), §6.2 (the adoption semantics + STEP-0 rule). **Authority:** `docs/decisions.md`
**`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE`** (ACTIVE — the vendoring model: the fifteen
modules are **already vendored**, this unit **re-vendors nothing and consumes `src/shared/theme.ts`**).

**Layer (RCA-12, mandatory).** **DOC-LAYER.** This dossier adopts **identifiers**; it asserts **nothing** that is
app-green, envelope-green, store-green or live-green. Every source citation below is a **read** of
`../Provident-Electron` (the FOUNDATION — adjacent, **not an npm dependency**, **never modifiable**) or of this
repo. **No suite, no leg, no `tsc`, no build, no Electron boot, no live battery and no divergence leg was run
by this pass**; every figure is a read or a RECORDED READING quoted as input with its measurer named.

**Citation discipline.** `path` + **symbol** / **row id** / **§section**. **No line number appears in this file**
(`docs/specs/requirement-catalog.md` §3.4 rule 7).

**The rule this file exists to satisfy** — proposal §6.2, in its own words: *"Every unit whose contract names,
parameters or vocabulary originate **outside this project** … MUST carry an adoption dossier
(`docs/specs/<unit>-adoption-dossier.md`, ≤ 8 identifier rows, each with its source citation and `STATUS`). …
a unit with any undefined row is `BLOCKED-ON-SEMANTICS` and is escalated **in that pass**."* **And its collision
clause:** *"every adopted unit's dossier MUST carry a populated collision block — each adopted identifier
checked against the consuming repo's prohibition/vocabulary rows, each hit reconciled **by row id** …
or **re-named by an explicit re-name request** — **never by relaxing a prohibition**."*

**The hazard this rule exists to prevent, read for this unit.** The foundation has run this failure once:
`../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md` §2/§3 records the **`threshold`
incident** — an adopted identifier crossed a project boundary **as a name with no meaning**, legitimate as an
injected *value* on one side and **banned vocabulary** on the other, and cost a full gate pass. **`PD-UI-1`'s
adopted vocabulary (`setting`, `prefersDark`, `source`, the two function names) sits in exactly the same
position**: the foundation's own `theme.md` carries a **twelve-row prohibition table** (`P-TH-1`..`P-TH-12`)
whose subject is the mechanism's bytes, while **this repo's `matchMedia` read, `dataset.theme` write and
~15-token block are LIVE, PINNED, FORK-OWNED behaviour that the same rulings name as consumer-side**. **The
collision block below is therefore not ceremony for this unit — it is the unit's central reconciliation.**

---

## 1. The identifier table (8 rows — the cap, and it is FULL)

**`STATUS` is either `defined` or `undefined-until-answered`.** **An `undefined-until-answered` row BLOCKS this
unit at its gate and MUST be escalated in this pass — never deferred to a later filing.**

| # | Identifier | Source citation (foundation path + symbol + §) | Unit / domain / referent / evaluator | `STATUS` |
| --- | --- | --- | --- | --- |
| **1** | **`resolveTheme`** — the DECLARATION + ENV READING function (the mechanism's resolver) | `../Provident-Electron/src/shared/theme.ts` → `export function resolveTheme(setting: unknown, env: unknown): ThemeResolution` (**read** this pass: 73 lines, **zero import statements**, one strict `=== true` comparison, the own-property-descriptor member read); `../Provident-Electron/docs/specs/theme.md` §2.1 item 2 (the signature and both return shapes), §2.3 (the pass-through rule, the one-member env closure and the **no-precedence rule**), §2.2 `P-TH-3`/`P-TH-7`/`P-TH-9`/`P-TH-10`, §3.2 (`F-1`..`F-8`, the never-throws note); the vendored copy in THIS repo is `src/shared/theme.ts` (Phase-0, byte-identical at the pin, `vendor/foundation.lock.json`'s `theme` entry) | **UNIT:** the vendored `src/shared/theme.ts`, invoked **by this repo's adapter** (`src/renderer/theme.ts`). **DOMAIN:** the pure resolution of an opaque caller token against an injected environment record — **it decides nothing about appearance.** **REFERENT:** *a three-member record `{setting, prefersDark, source}` whose `prefersDark` member is the caller's own environment claim, read by its own-property descriptor.* **EVALUATOR:** **this repo's adapter**, at `src/renderer/theme.ts` — it reads the record's `prefersDark` and *ignores* the record's `setting` for its precedence decision (`unit-pd-ui-1-theme.md` §2.1). **The foundation's `theme-greens.md` (32/32 PASS, blind) is an ENVELOPE-layer evaluator of the CONTRACT and is NEVER cited as app evidence for this repo** (`G-6`; `unit-pd-ui-1-theme.md` §0's inherited-evidence rule) | **`defined`** |
| **2** | **`applyThemeDeclaration`** — the DECLARATION-ONLY applier | `../Provident-Electron/src/shared/theme.ts` → `export function applyThemeDeclaration(attributeName: unknown, resolved: unknown): ThemeAttributeWrite`; `../Provident-Electron/docs/specs/theme.md` §0A note 2 (the **`Q2` pinning**: the name, the arity, the three-member record, and the removal case as `{name: <echoed>, value: '', removal: true}`), §2.4 (the name-echo rule, the removal-as-data rule, the **no-write** rule, one fresh record per call), §2.2 `P-TH-7`/`P-TH-9`, §2.4 item 3 (*"`returned` is not `written`"*); the `E5-B-1-DECLARATION-IS-RETURNED-AS-TEXT-AND-NEVER-APPLIED` precedent is the sibling ruling | **UNIT:** the vendored `src/shared/theme.ts`, invoked by the adapter. **DOMAIN:** the caller's own write site. **REFERENT:** *the attribute write the mechanism WOULD perform, returned as data, with the attribute NAME caller-supplied and the removal case a data member.* **EVALUATOR:** **this repo's adapter** (`applyThemeToRoot` is the site that performs the write — `unit-pd-ui-1-theme.md` §2.1; proposal §4.2's `PD-UI-1` cell names `applyThemeToRoot` as *"the site that performs it"*). **No evaluator inside the mechanism exists, by the ruling's design** | **`defined`** |
| **3** | **`ThemeResolution`** — and its three members **`setting`** · **`prefersDark`** · **`source`** | `../Provident-Electron/src/shared/theme.ts` → `export interface ThemeResolution { readonly setting: string \| null; readonly prefersDark: boolean; readonly source: 'env' \| 'degraded-env' }`; `../Provident-Electron/docs/specs/theme.md` §2.1 item 2 and its `ThemeResolution` block, §2.3 items 1/2/3, §3.1 `M-1`..`M-3`, §3.3 `I-2`/`I-3`; **the discriminator's NAME was RULED at the foundation's spec gate** (`§0A` note 6: the field `basis` is **renamed `source`**, a **rename only**, the closed two-member domain unchanged, no term/row/seed/cap moved); `../Provident-Electron/docs/guide/theme.md` *Gotchas* records the rename and warns that code written against the as-filed spelling reads `undefined` | **UNIT:** the vendored `src/shared/theme.ts` (the type) + the adapter that reads it. **DOMAIN:** the mechanism's returned data model. **REFERENT:** **`setting`** = the caller's opaque token **carried verbatim** or the declared `null` (an ABSENCE, never a fabricated token); **`prefersDark`** = the caller's environment claim, **strict `=== true`**, `false` for every other shape; **`source`** = *the observable of whether the environment reading RESOLVED (`'env'`) or was ABSORBED (`'degraded-env'`)* — **a closed two-member domain**, and the **only** member that distinguishes the two kinds of `false`. **EVALUATOR:** the adapter **reads all three**; it **decides by `prefersDark` alone** and **does not expose `source`** (this unit's `D-6`; the observability question is escalated as `E-4` of the unit spec). **The three members are ONE row because they are ONE record and ONE adoption unit** — splitting them would spend three of the eight slots on a single returned shape (`../Provident-Electron/docs/specs/theme.md` §2.5 item 2 counts the six record members among the mechanism's *"own"* names, and this dossier adopts the record, not its members individually) | **`defined`** |
| **4** | **`ThemeAttributeWrite`** — and its three members **`name`** · **`value`** · **`removal`** | `../Provident-Electron/src/shared/theme.ts` → `export interface ThemeAttributeWrite { readonly name: string \| null; readonly value: string; readonly removal: boolean }`; `../Provident-Electron/docs/specs/theme.md` §0A note 2 (**why `removal` is a THIRD member rather than an absent `value` or a `null` name**: *"a two-member record forces the consumer to infer the removal case from a value's emptiness — and 'the value is `''`' is a legal CALLER token, so the inference would be ambiguous"*), §2.4 items 1/2/4, §3.1 `M-4`..`M-6`; the landed readings are quoted at `../Provident-Electron/docs/guide/theme.md` *Gotchas* (`applyThemeDeclaration('data-x', '') ⇒ {name: 'data-x', value: '', removal: true}` and `applyThemeDeclaration('', 'dark') ⇒ {name: null, value: 'dark', removal: false}`) | **UNIT:** the vendored `src/shared/theme.ts` (the type) + the adapter that consumes it. **DOMAIN:** the one write the adoption performs. **REFERENT:** **`name`** = the caller's attribute name **echoed by identity** or the declared `null` (no default, no trimming, no folding, no coercion hook); **`value`** = the resolved token **or exactly `''` on the removal arm**; **`removal`** = *the DECLARED discrimination of the removal case* (`'false'`, `'0'` and `' '` are **legal values, not removals**). **EVALUATOR:** **this repo's adapter** `applyThemeToRoot`, which maps the record onto the root's `dataset` at **one** write site, and whose `removal` arm is **unreachable under the adapter's own invariants and still implemented** (`unit-pd-ui-1-theme.md` §3.2 item 5) | **`defined`** |
| **5** | **`ThemeEnv`** (the `env` argument record) and **the `env` INPUT SHAPE** | `../Provident-Electron/src/shared/theme.ts` → `export interface ThemeEnv { readonly prefersDark: boolean }`; `../Provident-Electron/docs/specs/theme.md` §2.1 item 3 (the **EMPTY SEAM SET**), §2.3 item 2 (the hostile-shape table: a missing member, a number `1`, a string, an **inherited** member, a `Proxy` exposing no own member, an omitted `env` ⇒ `{prefersDark: false, source: 'degraded-env'}` and **nothing throws**), §2.2 `P-TH-8`/`P-TH-4`; `../Provident-Electron/docs/guide/seams.md`'s last row and *"`U-THEME` declares an EMPTY seam set: the `env` reading is an ordinary **argument record**"*; `../Provident-Electron/docs/guide/theme.md` *What a fork must supply* | **UNIT:** the vendored `src/shared/theme.ts` (the type); **the RECORD is produced by this repo's boot wiring** (`src/renderer/renderer.ts` → `installTheme`), whose `matchMedia('(prefers-color-scheme: dark)')` read is the fork's own environment claim. **DOMAIN:** the mechanism's single injected input. **REFERENT:** *one boolean member — an ordinary argument record, NOT a seam* (so there is **no absence / non-callable / throwing seam arm to declare**, and the unit's seam set is **empty** by derivation). **EVALUATOR:** this repo's adapter (which reads the record) + this repo's wiring (which supplies the boolean) + the boot leg. **The foundation's `U-THEME`'s own `prefersDark`-vs-OS question is recorded STRUCTURALLY UNOBSERVABLE in the foundation** (`docs/specs/post-division-foundation-adoption-surface.md` §10 `U-8`), and **this dossier does not claim it either** | **`defined`** |
| **6** | **`'env'` / `'degraded-env'`** — the `source` discriminator's **closed two-member domain** (the adoption's ONLY observational difference from the fork's previous behaviour) | `../Provident-Electron/src/shared/theme.ts` → the `source` member of `ThemeResolution` and of the module-private `EnvReading`; `../Provident-Electron/docs/specs/theme.md` §0A note 6 (the rename, **two bodies before and after**), §2.3 item 2 (the table that maps every hostile shape onto `'degraded-env'`), §3.3 `I-3`; `../Provident-Electron/docs/guide/theme.md` *Gotchas* (`a false member is a NORMAL reading, not a degradation` — `{prefersDark: false}` gives `source: 'env'`; only a missing/malformed reading gives `'degraded-env'`) | **UNIT:** the vendored `src/shared/theme.ts`. **DOMAIN:** the observability of the environment reading. **REFERENT:** *which of exactly two bodies describes the reading's resolution.* **EVALUATOR:** **the adapter reads it and exposes nothing** — the unit's `D-6` keeps the fork's export set unchanged, so **the discriminator has NO fork-side observer today**; its **declared reason for having none** is that exposing it would change `applyThemeToRoot`'s return shape, which is the kept surface. **Escalated to the architect as `E-4`.** **The domain is `defined` at the source** (a closed two-member union with a stated mapping); only its **fork-side observability** is absent | **`defined`** |
| **7** | **`data-theme`** — *(the CONSUMER-side attribute token the fork OWNS, adopted as a **prohibition referent** — see §2 `C-1`/`C-2`)* | **The ban's own citations:** `../Provident-Electron/docs/specs/theme.md` §2.2 **`P-TH-7`** (*"the mechanism may not own, default or document an attribute name … `A-d6`: 'no `data-theme` literal (the mechanism may not document it)' … may not name `class`, `color-scheme`, `data-*` or any other spelling"*), **`P-TH-9`**, **`P-TH-1`**, and the enforcing rows §3.4 **`R-1`** clause (b) (the attribute-name literal ban) and **`R-2`**/**`R-8`** (the no-DOM/no-write row and the closed-literal set); `../Provident-Electron/docs/guide/seams.md` (*"`data-theme` is not in its bytes"*); `../Provident-Electron/docs/specs/theme-control.md`'s collision table row 1 (its *"BOTH CONTROLS: a corpus carrying `data-theme`, `localStorage` or `matchMedia` FAILS `R-2`"*) | **UNIT:** the vendored `src/shared/theme.ts` (**the ban binds ITS bytes**); **the fork's own token block and adapter** are the token's live home. **DOMAIN:** the fork's consumer-side appearance surface. **REFERENT:** *the fork's root attribute, keyed on by `src/renderer/index.html`'s `html[data-theme='light']`/`html[data-theme='dark']` and written through `ThemeRoot`'s `dataset.theme` member.* **EVALUATOR:** **the fork's own consumer code + the CSS in `src/renderer/index.html`** — i.e. **this unit's adapter** (the write) and the fork's token block (the read), both **fork-owned app vocabulary** (`UI-CONFIG-CARRIER`; `FORK-DIVERGENCE.md` §2 row 4). **Declared reason for the mechanism having none:** *the mechanism may not own, default or document an attribute name*, and this adoption **upholds that in full** — the adapter supplies the name, the mechanism only echoes it | **`defined`** |
| **8** | **`matchMedia`** — *(the fork's environment READING API, adopted as a **prohibition referent** — see §2 `C-3`)* | **The ban's own citations:** `../Provident-Electron/docs/specs/theme.md` §2.2 **`P-TH-8`** (*"no `matchMedia`, no `prefers-color-scheme` subscription, no `process.env`, no `navigator` … `env` arrives as an argument and the module performs ONE strict comparison against `true`"*), §2.2 **(C) row 2** (*"**BANNED EVERYWHERE, AND THE BAN IS UPHELD IN FULL — no exemption is declared for it, anywhere**"*, listing the landed sites: `H-r5`'s list, `SHIM-COMPLETION-CARVE-OUT`, `relocate.md` §3.4 `R-1`/`R-2`, `container.md` §3.4 `R-1`(g), `gsession.md` §1 item 3 / `I-13` / `R-2`, `gutter.md` §3.4 `R-2`, `listhost.md` §2.2, `projection.md` §1, and `A-d6` itself), the enforcing rows §3.4 **`R-2`**/**`R-7`** | **UNIT:** the vendored `src/shared/theme.ts` (**the ban binds ITS bytes**); **the fork's boot wiring** is the API's live site. **DOMAIN:** the fork's OS-preference reading. **REFERENT:** *the API the mechanism must NOT call* — **the OS preference arrives as the INJECTED `env.prefersDark` member**. **EVALUATOR:** **the fork's consumer wiring** (`src/renderer/renderer.ts` → `installTheme`'s guarded `window.matchMedia('(prefers-color-scheme: dark)')` read and its once-attached `change` listener), pinned by `docs/specs/unit-u-shell-2-appearance-tokens.md` §2.2/§2.4 (the tri-state live re-resolve, `W1-Q5` (a) RESOLVED) and `docs/specs/ui-overhaul.md` §7 `Q1`/§6 row C1. **Declared reason for the mechanism having none:** the ban is **upheld in full with NO exemption declared** — the fork needs the reading, **the mechanism does not**, and **this adoption therefore reconciles by LAYER, not by relaxation** | **`defined`** |

**Row tally:** **8 rows — the cap, and it is FULL.** **`defined`: 8.** **`undefined-until-answered`: 0.**
**No identifier was found undefined by this pass, so this dossier raises NO `BLOCKED-ON-SEMANTICS` row** — **but
it carries four named escalations of a different kind (§3), and the unit spec's own blocking item (`E-1`, the
`PD-VENDOR` pin re-statement) is a VERIFICATION/PIN obligation, not an undefined identifier.** **A later pass
that needs a ninth identifier MUST open a new dossier or re-scope one of these eight — the cap is not elastic.**

**The two deliberate groupings, stated so they are not read as shortfalls:** row 3 adopts **one record** (three
members) and row 4 adopts **one record** (three members), because the foundation's own census counts the
**record** as the unit (*"the six member names of its two returned records"*, `../Provident-Electron/docs/specs/theme.md`
§2.5 item 2) — spending six slots on six members would leave the two **fork-crossing prohibition referents**
(rows 7/8) out of the dossier entirely, and those are the collisions the `threshold` incident says will happen.

---

## 2. The collision block — every hit reconciled BY ROW ID (never by relaxing a prohibition)

**What was checked (the scan this pass ran, and its result).** Every identifier above was checked against
**(a)** this repo's own prohibition/vocabulary rows — `docs/decisions.md` (`UI-CONFIG-CARRIER`,
`OPERATOR-ISOLATED-GRAPHSCOPE`, `STORE-LISTING-PROVIDENT-AUTHORED`), `docs/FORK-DIVERGENCE.md` §3 rules 1/2,
the requirement catalog's `data-theme`/`shell-chrome` tokens, and `src/**` for each token; **(b)** the
foundation's own prohibition rows — `theme.md` §2.2 `P-TH-1`/`P-TH-3`/`P-TH-4`/`P-TH-5`/`P-TH-7`/`P-TH-8`/
`P-TH-9`/`P-TH-10`/`P-TH-11`/`P-TH-12` and §3.4 `R-1`/`R-2`/`R-4`/`R-7`/`R-8`/`R-10`/`R-11`, plus
`gsession.md` §2.2 `P-1`/`P-5`/`P-7` and `gutter.md` §2.2 `P-5`; and **(c)** the vendored `src/shared/theme.ts`'s
own prohibitions (its **zero-import census**, and the absence of any `data-theme` literal, `matchMedia`, store,
or ambient `document`/`window`/`localStorage`/`fs`); and **(d)** the incident record
`../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md` §2/§3. **Every hit is reconciled
below with the row id that bans it, the reason for the ban, and why the identifier is legitimate (or NOT) in
this layer.** **NO PROHIBITION IS RELAXED ANYWHERE BELOW, and no re-name is requested.**

### `C-1` — `data-theme` (row 7): **HIT, RECONCILED BY LAYER**

| Field | Reading |
| --- | --- |
| **The hit** | The token is **live and pinned fork behaviour**: `src/renderer/index.html`'s token block keyed on `html[data-theme='light']`/`html[data-theme='dark']` + its `@media (prefers-color-scheme: dark)` fallback; `src/renderer/theme.ts`'s `ThemeRoot { dataset: { theme?: string } }` and its `dataset.theme` write; `src/renderer/renderer.ts`'s `applyThemeToRoot(document.documentElement, …)`. It is recorded as a **fork token** in `docs/requirement-catalog.md` (`PRUNE-333`'s `data-theme` cell + `PRUNE-106`, both `shell-chrome`), and `docs/FORK-DIVERGENCE.md` §2 row 4 lists the token layer as fork-owned |
| **The ban** | **banned by row `theme.md` §2.2 `P-TH-7`** and enforced by **§3.4 `R-1`(b)** and **`R-2`**/**`R-8`** — **for reason `Y`:** the mechanism may not **own, default or document** an attribute name, because the attribute's meaning is the consumer's, and a mechanism that named one would be **authoring the consumer's vocabulary** (the `SHELL-CHROME-CARVE-OUT-FUNCTIONAL` mechanism-vs-UI-element test, and `A-d6`'s *"no `data-theme` literal"*). The ban's scope is **the module's own bytes** (`R-1`'s row states its scope: *"over the MODULE's source … INCLUDING its comments"*) |
| **RECONCILIATION** | **banned by row `theme.md` §2.2 `P-TH-7` for reason `Y` (the mechanism may not own, default or document an attribute name); legitimate in this layer because `Z` — the token is the FORK's own consumer-side vocabulary, live before this unit and pinned by `DECIDED: UI-CONFIG-CARRIER` + `unit-u-shell-2-appearance-tokens.md` §2.1/§2.3 and `FORK-DIVERGENCE.md` §2 row 4, and this adoption UPHOLDS THE BAN IN FULL: (i) the vendored bytes carry no such literal and this unit does not touch them; (ii) the adapter passes the name IN as the caller's argument (`applyThemeDeclaration(attributeName, …)`, `unit-pd-ui-1-theme.md` §2.1) and the mechanism merely ECHOES it; (iii) the mechanism is never asked to default, infer or document it.** **NO PROHIBITION IS RELAXED; NO RE-NAME is requested** (the token is not being adopted as mechanism vocabulary — it is being **recorded as what the ban forbids**). |

### `C-2` — `'light'` / `'dark'` / `'system'` (the fork's token vocabulary, rows 3/7): **HIT, RECONCILED BY LAYER**

| Field | Reading |
| --- | --- |
| **The hit** | All three are **live fork values**: `src/shared/types.ts` → `ThemeSetting = 'system' \| 'light' \| 'dark'`; `src/main/operator-settings-store.ts` → `coerceTheme` (exact-string coercion, default `'system'`); `src/renderer/theme.ts` → the resolver's two literal arms; `src/renderer/index.html` → the two selector values; `archive/tests/2026-10-04-unit-u-shell-2-theme.test.ts` → all three. **`'system'` is the fork's THIRD state and is NOT a member of any foundation domain** |
| **The ban** | **banned by row `theme.md` §2.2 `P-TH-1`** (*"No consumer vocabulary as a symbol, a closed string-union member, a default or a documented constant"* — *"the module's own vocabulary is TWO function names, THREE type names, the SIX member names of the two records, and the FIVE declared literal bodies … and NOTHING else. NO `'light'`, NO `'dark'`, NO `'system'`"*) and **`P-TH-3`** (no default) and **`P-TH-10`** (no tri-state semantics), enforced by §3.4 **`R-1`(a)**/**`R-8`** and declared by **`A-d6`**: *"no token names/values (the token block stays the consumer's stylesheet)"* — **for reason `Y`:** the token block is the consumer's, so a token literal inside the mechanism would be **app vocabulary smuggled into a shared default** (the `FORK-DIVERGENCE.md` §3 rule 2 anti-pattern, *"a token layer that knows Astrographer's 15 token names"*) |
| **RECONCILIATION** | **banned by row `theme.md` §2.2 `P-TH-1`/`P-TH-3`/`P-TH-10` for reason `Y` (no consumer vocabulary, no default, no tri-state, inside the mechanism); legitimate in this layer because `Z` — the three values are the FORK's own persisted operator vocabulary (`UI-CONFIG-CARRIER`'s *"theme tri-state `system`/`light`/`dark`"*; `unit-u-shell-2-appearance-tokens.md` §2.2), and the adoption keeps them ON THE FORK SIDE: the adapter's precedence rule reads the fork's token by STRICT IDENTITY against two literals **in fork code**, the vendored mechanism receives the token only as an opaque ARGUMENT and carries it through (`P-TH-1`'s own pass-through answer), and `'system'` — the third state `P-TH-10` forbids the MECHANISM from having — remains the fork's own absence-of-explicit-choice, resolved by the fork's own rule (`unit-pd-ui-1-theme.md` §2.1 clause 3).** **NO PROHIBITION IS RELAXED; NO RE-NAME.** **The one direction the adoption must not reverse, pinned:** the fork may not ask the mechanism to *select* a token from `prefersDark` — that is `P-TH-10`, and `unit-pd-ui-1-theme.md` §2.4 carries it as a binding constraint. |

### `C-3` — `matchMedia` (row 8): **HIT, RECONCILED BY LAYER (and the ban is UPHELD, not exempted)**

| Field | Reading |
| --- | --- |
| **The hit** | `src/renderer/renderer.ts` → `installTheme`'s guarded `window.matchMedia('(prefers-color-scheme: dark)')` and its `addEventListener('change', …)`; `src/renderer/index.html` → the `@media (prefers-color-scheme: dark)` fallback; `docs/specs/unit-u-shell-2-appearance-tokens.md` §2.2/§2.4 and `docs/specs/ui-overhaul.md` §7 `Q1`/§6 row C1 pin the live re-resolve; the shim has **no** `matchMedia` (`docs/feature-requests/provident-electron-shell-chrome-handoff.md`'s verified-absences row) |
| **The ban** | **banned by rows `theme.md` §2.2 `P-TH-8`, §2.2 (C) row 2, §3.4 `R-2`/`R-7`, and by the landed sibling rows** (`relocate.md` §3.4 `R-1`/`R-2`, `container.md` §3.4 `R-1`(g), `gsession.md` §1 item 3 / `I-13` / `R-2`, `gutter.md` §3.4 `R-2`, `listhost.md` §2.2, `projection.md` §1) **plus `H-r5` and `SHIM-COMPLETION-CARVE-OUT`** — **for reason `Y`:** realm access + CSS resolution belong to the consumer, and the mechanism's environment reading must be **injected**, so a `matchMedia` call inside a mechanism is a **second authority over the environment** |
| **RECONCILIATION** | **banned by row `theme.md` §2.2 `P-TH-8` + §2.2 (C) row 2 for reason `Y` (realm access / a second authority over the environment reading); legitimate in this layer because `Z` — the read is the FORK's consumer-side ENVIRONMENT READING, it is the SOURCE of the injected `env` record (`ThemeEnv`), it is pinned fork behaviour (`unit-u-shell-2-appearance-tokens.md` §2.2, `W1-Q5` (a) RESOLVED), and `theme.md`'s (C) row 2 explicitly declares its scope: the ban is on the MECHANISM, and *"the OS preference arrives as the INJECTED `env.prefersDark` member"* — which is exactly what this adoption wires.** **THIS IS NOT AN EXEMPTION AND MUST NOT BE READ AS ONE:** the foundation's row says the ban carries **"no exemption … anywhere"**, and this dossier **declares none** — it records that the token's **layer** is the consumer's. **Two binding constraints follow, both carried by the unit spec:** (i) the adapter must not acquire its own `matchMedia` read (`unit-pd-ui-1-theme.md` §3.2 item 10 — that read stays in the wiring, `§2.2` item 2); (ii) the fork may not push an OS reading INTO the mechanism differently or ask it to watch one. **NO PROHIBITION IS RELAXED; NO RE-NAME.** |

### `C-4` — the four vendored-byte prohibitions (`no data-theme literal`, `no matchMedia`, `no store`, `no ambient document/window/localStorage/fs`): **CHECKED, NO HIT, RECORDED**

The foundation's own row records the vendored module's four absences
(`docs/specs/post-division-foundation-adoption-surface.md` §2.1's degradation cell cites
*"`src/shared/theme.ts` has **zero import statements**"*; `../Provident-Electron/docs/specs/theme.md` §2.2
`P-TH-1`/`P-TH-4`/`P-TH-7`/`P-TH-8`/`P-TH-9`/`P-TH-11`, §3.4 `R-2`/`R-4`/`R-7`/`R-8`, §3.3 `I-4`/`I-6`/`I-7`).
**MEASURED again this pass by reading `src/shared/theme.ts`: 73 lines, ZERO import statements of any kind, no
`data-theme` literal, no `matchMedia` reference, no store/cache/memo token, and no ambient realm access —
every value is an argument.** **Reconciliation: no hit — the four bans hold in the vendored bytes, this unit
edits none of them, and the unit's register asserts the absences (`P-TH-IM-4`) so the adoption cannot silently
reverse them.** **This is the item the proposal's `K-5` collision names: `wrap`, never patch.**

### `C-5` — the `selectors` / `threshold` / `data-zone` / `pane-collapse-toggle` bans (`gsession.md` §2.2 `P-1`/`P-5`/`P-7`, `gutter.md` §2.2 `P-5`): **CHECKED, NO HIT**

**None of the four tokens is an identifier this unit adopts**, and none appears in the themes surface: a read of
`src/renderer/theme.ts` (38 lines) and of the theme path in `src/renderer/renderer.ts` returns **zero**
occurrences of any of them, and the vendored `src/shared/theme.ts` contains none. **No collision, no
reconciliation owed, no re-name.** **Recorded** because the proposal §6.2 requires the check to be **run** per
adopted unit and its outcome stated: **for `PD-UI-1` the gesture-vocabulary contraband set is EMPTY**, and the
`threshold` incident's hazard for this unit arises in the **`data-theme` / `matchMedia` / token-vocabulary**
form instead (`C-1`..`C-3`).

### `C-6` — the **third** appearance authority (the foundation's own, and the foundation's `U-THEME-CONTROL`): **CHECKED, NO HIT IN THE FORK'S FAVOUR — RECORDED AS A NEGATIVE**

**The foundation's `theme.md` `CURRENT STATE` item 10 records that the foundation's OWN appearance authority is
`../Provident-Electron/src/renderer/index.html`'s `:root { color-scheme: light dark; }` rule and that its
`U-THEME` values cannot influence it.** **This repo's position is different and must not be conflated with
it:** the fork's authority is **its own token block plus the `data-theme` attribute** (fork-owned,
`FORK-DIVERGENCE.md` §2 row 4), and the fork's **`U-THEME-CONTROL`-shaped authored control is ABSENT**
(`docs/specs/post-division-rebuild-proposal.md` §4.1's `C-15` correction; re-verified this pass:
`src/shared/demo-envelope.ts` carries **zero** `theme` occurrences, `src/renderer/sidebar-panes.ts` carries
**zero**, and `src/renderer/index.html` carries the token only inside CSS comments/selectors — **no control
element**). **No collision arises: the foundation's control lives in ITS envelope and this repo adopts no data
from it** (`docs/specs/post-division-foundation-adoption-surface.md` §2.2: *"the fork re-authors, it adopts no
external identifier"*; **dossier obligation: none for `U-THEME-CONTROL`**). **The fork-side consequence is the
unit spec's `§1.3` ruling (declined + deferred), recorded here so a later pass does not read this dossier's
silence on `U-THEME-CONTROL` as an omission.**

### `C-7` — the **file-stem** collision `src/renderer/theme.ts` ↔ `src/shared/theme.ts`: **CHECKED, NO HIT, RE-READ AND CARRIED**

**Re-verified this pass, unchanged from the Phase-0 record (`docs/specs/pd-vendor-adoption-dossier.md` `C-7`;
`docs/specs/post-division-test-disposition-2026-09-28.md`'s `K-7`):** the two files share a **stem**, not a
specifier — the fork module is reached as `./theme.js` from `src/renderer/`, the vendored one as
`src/shared/theme.ts`. **No prohibition row bans either name.** **`K-7` records this as a checked no-hit stem
collision, and this dossier confirms the reading. What CHANGES with this unit is the CONSUMER EDGE, not the
stem:** the adapter now imports the vendored module, which produces the fourth `src/**` specifier hit that
**reds `PD-VENDOR`'s "the vendoring is inert" pin** — **a NEW contradiction, escalated in this pass with its
re-statement shape (unit spec `§9` item 1; §3 `A-1` below), never absorbed and never evaded.** **NO RE-NAME is
requested:** a re-name of either file would falsify the pin (foundation side) or the fork's own imports
(consumer side), and **the collision is by stem, which the specifier resolution already distinguishes.**
**⟨`X-2` DISCHARGED 2026-09-28 (item-10d documentation review; the clause above is KEPT as filed — `RCA-8(c)`).⟩
THE FOURTH HIT EXISTS AND THE PIN DOES **NOT** RED: it was re-stated to admit it as a DECLARED consumer edge
(`§3` `A-1`'s annotation carries the reading). **The stem collision itself is UNCHANGED, and the "NO RE-NAME"
clause stands — correctly, since the specifier resolution still distinguishes the two `theme` modules by path.**⟩**

---

## 3. Escalations (the dossier's own owed list — named plainly, never deferred silently)

| # | Escalation | Why it cannot be settled here |
| --- | --- | --- |
| **`A-1`** | **THE `PD-VENDOR` "VENDORING IS INERT" PIN IS FALSIFIED BY THIS UNIT'S FIRST CONSUMER EDGE, AND ITS RE-STATEMENT IS A BLOCKING PREREQUISITE.** `tests/pd-vendor-set.test.ts` asserts the **exact sorted three-element array** of `src/**` specifier hits plus that **no hit resolves to a vendored member**; the adapter's import of `src/shared/theme.ts` becomes a **fourth hit that does resolve to one**, so both limbs red. **This is a NEW contradiction found by this pass** (it is not in the proposal, the gate record or the `X-3` ledger), and it is filed with its evidence: the pin's row title, its derivation (a `grep -rnE` for `from '[^']*<name>\.js'` over the fifteen names, each hit resolved and filtered for `/shared/`), and its two assertions. | **A spec may not edit a test**, and re-stating a pin whose subject another unit's landing changes is the pin's **owning unit's** act (`DECIDED: REBUILD-ARCHIVE-POLICY`'s discipline; the Phase-0 spec's `D-12`: *"a spec may not edit a test"*). **The requested shape** (an explicit, per-row allow-list of consumer edges — `from <file> <specifier> → <vendored member>`, with any un-listed vendored-resolving hit still failing) is stated at the unit spec `§9` item 1 item (b). **The evasion route is refused with its reason**: `await import(...)`/`require(...)`/a `new URL(...)` indirection match no pattern in the pin and would make it green by hiding the edge. **Owner:** the `PD-VENDOR` pin's owning unit + the supervisor (**same-commit amendment**) + **the architect** if it is read as a `G-9`-class pin change. **⟨DISCHARGED 2026-09-28 (item-10d documentation review; the escalation above is KEPT as filed — `RCA-8(c)`).⟩ THE PIN WAS RE-STATED AND THE BLOCKING PREREQUISITE IS GONE.** VERIFIED-BY-READ of `tests/pd-vendor-set.test.ts` by this review: the row's title now carries *"⟨RE-STATED 2026-09-28, unit PD-UI-1 §9 item 1⟩"*, its two limbs are KEPT and EXTENDED (the exact three-hit stem-collision set stands; *"no hit resolves to a vendored member"* is replaced by the **`DECLARED_CONSUMER_EDGES` allow-list** form, so an un-listed vendored-resolving hit still FAILS), one allow-list row exists **per adopting unit** (`src/renderer/theme.ts` → `member: 'theme'`), and the row drives a **NEGATIVE CONTROL** over an un-listed vendored-resolving edge plus the four refused evasion forms. **The census over `src/**` is 4 hits over 3 files**, the fourth being the adoption's own edge on the allow-list — exactly what this escalation predicted. **`tests/pd-vendor-set.test.ts` reads 69 PASS** (blind-greens artifact `G4`; **this review re-ran nothing**). **The unit spec's `§9` item 1 `E-1` carries the full reading, and the `docs/decisions.md` rows this unit's `A-7`/`A-11` rulings owe are minted — see `POST-DIVISION-REBUILD-PD-UI-1-ADAPTER-CONTRACTS`.** |
| **`A-2`** | **THE `U-THEME-CONTROL` DEFERRAL HAS NO OWNER AND NO WAVE.** `C-15`'s corrected disposition is `ABSENT → author-in-build as part of `PD-UI-1`'s envelope work **OR explicitly declined**`, and the unit spec **declines it** with four readings and four reasons (`unit-pd-ui-1-theme.md` §1.3: the keystone-file boundary, the operator-scope/MCP-invisibility mismatch, the separate foundation element, and this unit's surface). **But the deferral itself needs a row** — proposed id **`PD-THEME-4` / the authored appearance control** — and **`UNVERIFIED`: whether it is required at all** (no landed spec names the control; `requirement-catalog.md` `PRUNE-333` pins the **behaviour**, not the control; `user-flow-audit-checklist.md` `UF-THEME-1` carries `NONE` as its defect). | **The architect owns a new unit's existence and its wave; the supervisor owns tracker rows.** A dossier may not mint a row. **Escalated with its evidence and its inherited constraints** (the project-wide UI rendering constraint; `DECIDED: STORE-LISTING-PROVIDENT-AUTHORED`'s authoring discipline; the `representationMode` control as the in-tree shape). |
| **`A-3`** | **THE `source` DISCRIMINATOR HAS NO FORK-SIDE OBSERVER.** Row 6's domain is defined at the source, but **this unit's `D-6` keeps the fork's export set and `applyThemeToRoot`'s return type unchanged**, so `'env'`/`'degraded-env'` is read and dropped. **The consequence is honest and must be stated: the adoption GAINS the ability to tell a real `prefersDark: false` from an absorbed one, and this unit does not use it.** | **Changing the return type would break the kept surface** (`D-5`; and `PD-THEME-1`'s named collision risk is precisely the return's meaning to its caller). **The architect owns whether the fork's appearance surface should report the degradation** — and any such change re-opens the adapter's contract, which is a new gate. **Escalated as `E-4` of the unit spec.** |
| **`A-4`** | **THE DOSSIER CAP IS FULL AT EIGHT.** A further identifier (e.g. a per-symbol row for `ThemeResolution`'s three members, or a row for the fork's `ResolvedTheme`/`ThemeRoot`) **cannot be added here** without removing a reconciliation this unit needs — and the two fork-crossing prohibition referents (rows 7/8) are the ones a naive six-member split would have displaced. | **The cap is the architect's (`≤ 8`).** **Escalated: a wave that needs a ninth identifier opens its OWN dossier, or requests a re-scope.** |
| **`A-5`** | **THE REGISTER'S DECLARED ATTEMPT TOTAL OVERSHOOTS THE `≤120` CAP (`173`).** Declared with its eight terms and its route at `unit-pd-ui-1-theme.md` §4, and escalated as its `E-5`. | **A cap is the architect's, and the ruling makes the row count an OUTCOME, not a budget** — so the honest form is a declared over-cap register, **never a dropped row or a trimmed term.** **⟨AMENDED 2026-09-28 (`§0B` item 1; item-10d documentation review): the figure is `194`, not `173`, and the item is STILL OPEN.** This escalation's text is KEPT as filed; read it through the amendment — the total is `28 + 26 + 67 + 24 + 27 + 6 + 8 + 8 = 194`, the superseded `173` stays visible at `§4`, and the architecture's cap question (`unit-pd-ui-1-theme.md` `§9` item 5) was not resolved by the landing.⟩** |

**And the items carried from the unit spec that are NOT dossier rows, named here so a reader of this file sees
them: `E-1` (the pin re-statement — the same act as `A-1` above, seen from the unit side) · `E-2` (no
foundation defect is owed by this unit, and the foundation is never patched) · `E-6`
(`docs/skills/designing-pages.md` does not exist in this repo — VERIFIED-BY-READ: a glob of `docs/skills/*`
returns `process-guardrails.md` alone, so there is no coverage matrix and no demo-page index to update) ·
`E-7` (the unit's `UNVERIFIED` list).**

---

## 4. Cross-references (path + symbol / row id / `§section` — never a line number)

`docs/specs/unit-pd-ui-1-theme.md` (§0 the rulings, §0A the decided/escalated clauses, §1.2 the scope decision,
§1.3 the `U-THEME-CONTROL` ruling, §1.4 the allowed/denied surface, §2.1 the adapter, §3.1/§3.2 the
fail-states, §3.4 the pins, §4 the register, §6 the red-set plan, §7 verification and the live mandate, §9 the
owed items) · `docs/specs/post-division-rebuild-proposal.md` §4.1 (`PD-UI-1`, `C-15`) / §4.2 / §4.5 / §4.7 /
§6.2 / §7.4 / §7.5 · `docs/specs/post-division-rebuild-proposal-review.md` (`C-1`, `V-1`) ·
`docs/specs/post-division-foundation-adoption-surface.md` §1 rows 1/2 / §2.1 (`U-THEME`) / §2.2
(`U-THEME-CONTROL`) / §3 / §8 / §10 (`U-8`) ·
`docs/specs/post-division-local-elimination-inventory.md` §2.1 (`PD-THEME-1`/`PD-THEME-2`/`PD-THEME-3`) ·
`docs/specs/post-division-test-disposition-2026-09-28.md` §2 row #1 / §5 (`K-5`, `K-6`, `K-7`) / §7 (W1) ·
`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §2.1 / §4 (`P-IM-1`) ·
`docs/specs/pd-vendor-adoption-dossier.md` (`C-7`, `A-4`) ·
`docs/specs/unit-pd-ui-12-slot-host-boundary.md` §1.2 `B-1` / §1.4 ·
`docs/specs/unit-u-shell-2-appearance-tokens.md` §2.1/§2.2/§2.3/§2.4/§4 ·
`docs/specs/ui-overhaul.md` §1 row C1 / §6 / §7 `Q1` · `docs/specs/user-flow-audit-checklist.md` `UF-THEME-1` ·
`docs/requirement-catalog.md` `PRUNE-106` / `PRUNE-333` · `docs/specs/requirement-catalog.md` §3.4 rule 7 ·
`docs/FORK-DIVERGENCE.md` §2 row 4 / §3 rules 1/2 ·
`docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` ·
`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` · `DECIDED: REBUILD-ARCHIVE-POLICY` ·
`DECIDED: UI-CONFIG-CARRIER` · `DECIDED: OPERATOR-ISOLATED-GRAPHSCOPE` ·
`DECIDED: STORE-LISTING-PROVIDENT-AUTHORED` ·
`../Provident-Electron/src/shared/theme.ts` → `resolveTheme`, `applyThemeDeclaration`, `ThemeResolution`,
`ThemeAttributeWrite`, `ThemeEnv` ·
`../Provident-Electron/docs/specs/theme.md` §0A notes 2/6 / §1 / §2.1 / §2.2 (**A**) `P-TH-1`/`P-TH-3`/`P-TH-4`/
`P-TH-5`/`P-TH-7`/`P-TH-8`/`P-TH-9`/`P-TH-10`/`P-TH-11`/`P-TH-12` / (**C**) rows 1/2 / §2.3 / §2.4 / §2.5 / §3.1
`M-1`..`M-6` / §3.2 / §3.3 `I-2`/`I-3`/`I-4`/`I-6`/`I-7` / §3.4 `R-1`/`R-2`/`R-4`/`R-7`/`R-8`/`R-10`/`R-11` /
§5.5.1 (`P-TH-IM-3`) ·
`../Provident-Electron/docs/guide/theme.md` (*What it is*, *What a fork must supply*, *Gotchas measured in this
repo*) · `../Provident-Electron/docs/guide/seams.md` (the last row: the EMPTY seam set) ·
`../Provident-Electron/docs/specs/theme-greens.md` · `../Provident-Electron/docs/specs/theme-control.md` §2.1 and
its collision table · `../Provident-Electron/docs/specs/theme-control-live-battery.md` ·
`../Provident-Electron/docs/specs/gsession.md` §2.2 `P-1`/`P-5`/`P-7`, §3.4 `R-1` ·
`../Provident-Electron/docs/specs/gutter.md` §2.2 `P-5`, §3.4 `R-1` ·
`../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md` §2/§3 ·
`../Provident-Electron/docs/decisions.md` `THEME-MECHANISM-AND-AUTHORED-CONTROL`,
`SHELL-CHROME-CARVE-OUT-FUNCTIONAL`, `E5-B-1-DECLARATION-IS-RETURNED-AS-TEXT-AND-NEVER-APPLIED` ·
`src/renderer/theme.ts` · `src/renderer/renderer.ts` → `installTheme` · `src/renderer/index.html` ·
`src/shared/theme.ts` (**the vendored module**) · `src/shared/types.ts` → `ThemeSetting` ·
`src/main/operator-settings-store.ts` → `coerceTheme` · `src/main/preload.ts` → `operatorSettings` ·
`src/shared/demo-envelope.ts` (the APP-graph authored surface — **zero theme occurrences**) ·
`src/renderer/sidebar-panes.ts` → `settingsContent`, `OPERATOR_REPRESENTATION_MODE_TOGGLE_HANDLER` ·
`vendor/foundation.lock.json` (`theme`) · `archive/tests/2026-10-04-unit-u-shell-2-theme.test.ts` · `tests/pd-vendor-set.test.ts` ·
`tests/pd-vendor-manifest.test.ts` · `tests/unit-v5-migration-contract.test.ts`.
