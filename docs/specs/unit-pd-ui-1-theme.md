# Unit `PD-UI-1` — THE THEME UNIT (wave `W1` of the post-division rebuild): the foundation's `U-THEME` DECLARATION + ENV READING adopted onto the fork's KEPT precedence resolver — Spec

**Status: SPEC — authored 2026-09-28. NO CODE LANDED, NO TEST LANDED, NOTHING RUN by this pass. No red set
has been authored or run. No leg, trio, `tsc` invocation, Electron boot, live battery or divergence leg was
executed. This filing is ONE step of the unit's cycle and authorises the NEXT one (the TestWriter's red set),
never the implementation.**
**Pass kind:** SPEC (the contract only). **Program:** `docs/specs/post-division-rebuild-proposal.md` —
`§4.1`'s `PD-UI-1` row (the corrected `SUBSET+ADAPTER` classification), `§4.2` (the seam gap), `§4.4`
(the test-surface cost), `§4.5` (W1), `§4.7` (the architecture amendment; `C-15`'s `U-THEME-CONTROL`
correction), `§7.3`/`§7.4` (the rulings), `§7.5` (the measured baselines). **Gate record:**
`docs/specs/post-division-rebuild-proposal-review.md` (verdict `BLOCKED-ON-SEMANTICS`, later discharged by the
architect's rulings; `C-1`/`V-1` are this row's decisive findings). **STEP-0 dossier (mandatory — this unit
adopts externally-sourced identifiers): `docs/specs/pd-ui-1-adoption-dossier.md`.**

**Layer (RCA-12, mandatory declaration).** **DOC-LAYER for every claim in this file.** This spec asserts
**nothing** that is app-green, envelope-green, store-green, engine-green or live-green.

| Deliverable | The layer its evidence covers | What that layer does NOT prove |
| --- | --- | --- |
| the vendored `src/shared/theme.ts` (Phase-0 bytes, **read-only to this unit**) | **`[T]` / source-layer** — byte-identity to the pin, **inherited from `PD-VENDOR`'s `P-IM-1`** | that any consumer works, that the fork reads it correctly, and that the app renders (`G-6`, `RCA-12`) |
| the fork adapter `src/renderer/theme.ts` | **`[T]` node-suite / pure** — returned values of three pure functions | **not** an applied attribute, **not** a reacting stylesheet, **not** an OS preference, **not** the assembled app |
| the boot wiring `src/renderer/renderer.ts` → `installTheme` | **`[H]` host-side** (it holds the *only* `matchMedia` read and the *only* root write) | that the write reached a real document, that the OS flip was observed, or that a pane re-themed |
| the token block in `src/renderer/index.html` | **`[T]`/static source-layer** — token NAMES and literal values, **unchanged by this unit** | that any browser accepts, applies or paints a token |
| **the live/assembled surface** | **`[U]` — MANDATORY (RCA-11), and this unit renders a themed surface** | see `§7`: the leg is **`PRECONDITION-FAILED` at this head** and the reading is attached, never parked silently |

**Inherited-evidence rule, stated once (`G-6`, `RCA-12`).** The foundation's own `U-THEME` green
(`../Provident-Electron/docs/specs/theme-greens.md` — blind run, **32 executed = 32 PASS / 0 FAIL / 7
`NOT-BLIND-RUNNABLE`**) is **ENVELOPE-LAYER-ONLY evidence of the CONTRACT**. **This unit may cite it as
evidence that the adopted contract exists and is internally consistent, and NEVER as app evidence for the
fork.** `../Provident-Electron/docs/specs/post-division-foundation-adoption-surface.md` §8's `U-THEME` row is
explicit: *"`[T]` pure — **not** an applied attribute, stylesheet, rendered control or OS preference"*, and its
`§10` `U-8` records that *"`U-THEME`'s `prefersDark` matching a real OS setting"* is **structurally
unobservable in the foundation**. **This unit owns its own rendered/live evidence and inherits none.**

**Citation discipline.** `path` + **symbol** / **row id** / **§section**; **no line number appears in this file**
(`docs/specs/requirement-catalog.md` §3.4 rule 7). Where a quoted source carries a line number, it is quoted
**as that source's own text**, never adopted as this file's address.

**Verification markers used below.** **VERIFIED-BY-READ** = read in this pass from the named tree, reader
named. **UNVERIFIED** = named, not settled by this pass, **with what would settle it**. **RECORDED READING** =
a figure another pass measured, quoted as input and **labelled with its measurer**. **No figure in this file
is this pass's own measurement of a run** — this pass ran nothing.

---

## 0B. THE GATE-4 REMAND AMENDMENT LEDGER (2026-09-28) — the FOUR escalations the unit's gate-4 remand left open, each now DISPOSED, plus the ONE it deliberately leaves OPEN

**What this pass is, stated honestly first.** It **amends THIS file only** (plus the two anchored tracker appends `AGENTS.md`
item 6 owes). It runs **no leg, no suite, no `tsc`, no build, no Electron boot and no register row** — it holds a
read/search/doc-write wall and **NO SHELL** — so **every figure below is either a READING of the landed tree taken this
pass (VERIFIED-BY-READ, with its reader named) or a figure the remand's own test file prints (quoted, labelled
RECORDED READING)**. **No code, no test file, no `src/**` byte (the vendored bytes least of all), no `package.json`, no
vitest config and no foundation file is touched by this pass.** **The as-filed text each amendment supersedes is KEPT
VISIBLE beside it, dated, with its finding id** — annotate, never rewrite.

**The four escalations, and where each lands:**

| # | The finding | The disposal | Its landing site |
| --- | --- | --- | --- |
| **A-1 / A-6 / A-7 / A-3 (arithmetic)** | the `§4` register prints **`173`**, which the remand's executed terms superseded | **`§4`'s terms and total are AMENDED to `194` with its eight terms and the `+21` composition; the superseded `173` (and the four superseded row terms) stay VISIBLE, dated, with the finding ids** (`§0B` item 1) | `§4`'s table cells, `§4`'s attempt tally, `§4`'s `(bounded)` note, `§9` item 5, `§10` item 4, `§11` |
| **A-7 (semantics)** | *"the `removal` branch is claimed 'implemented and honoured' but is NEITHER DRIVEN NOR DEFINED"* | **RULED — the record's removal means the attribute is REMOVED, not left in place; a HOST-FIX is owed on `src/renderer/theme.ts`** (`§0B` item 2), and **the tripwire it must stay consistent with is named** | a RULING PARAGRAPH at `§2.1` item 3 (the site `A-7`'s own correction names), `§3.2` item 5, `§9` item 1 item (e) |
| **A-11** | *"`§2.2` item 4's parenthetical is falsified by the landing — `installTheme`'s `apply()` discards the return, so it has no consumer in `src/**`"* | **RULED — the predicate STAYS setting-based, `apply()` discards the return, and the returned resolution is NOT the liveness input** (`§0B` item 3) | `§2.2` item 4 (annotate-beside), `§9` item 4, `§9` item 7 |
| **A-2 / A-4 (mechanism)** | the adversarial audit's literal recipe `vi.mock('../src/shared/theme.js', …)` was measured to red the frozen `tests/pd-vendor-set.test.ts` `A-12` census (the exact four-binder set — the recipe adds a FIFTH) | **RECORDED AS AN OPEN ARCHITECT QUESTION with both options and their costs — NOT decided by this pass** (`§0B` item 4) | `§9` item 8 |

### 0B item 1 — THE REGISTER ARITHMETIC AS AMENDED (`A-6`, `A-7`, `A-3`; the finding ids carried)

**THE MEASURED POSITION, printed by the register's own accounting block (`tests/pd-ui-1-theme-register.test.ts` →
`REGISTER_TERMS` / its `§4` arithmetic row, RECORDED READING):**

> `28 + 26 + 67 + 24 + 27 + 6 + 8 + 8 = 194 = 173 + 21`

**THE GROWTH, BY FINDING ID, exactly as the remand's own `§4` arithmetic prints it:**

| Finding | The correction | The drive it obliges | The term it moves |
| --- | --- | --- | --- |
| **`A-6`** | `''` and a **boxed `String`** join the precedence GRID and the hostile list — the two shapes `§2.1` clause 3 names first and the grid omitted | `2 shapes × 2 readings × 2 observations` | **`P-TH-IM-1` `20 → 28`** (`+8`) |
| **`A-6`** | the same two shapes join the HOSTILE setting list | `2 shapes × 4 non-boolean readings` | **`P-TH-TP-1` `59 → 67`** (`+8`) |
| **`A-7`** | the removal branch is **driven** (`1 landed drive + 3 corpus controls`) instead of asserted only by a source regex | `1 + 3` | **`P-TH-TP-2` `20 → 24`** (`+4`) |
| **`A-3`** | a **third control** (a silent-skip corpus that never attempts the write) proves the recording-Proxy oracle discriminates | `+1` | **`P-TH-TP-3` `26 → 27`** (`+1`) |

**THE SUPERSEDED FIGURES, KEPT VISIBLE (dated `2026-09-28`, with the finding ids):** the total **`173`** and its terms
**`20 + 26 + 59 + 20 + 26 + 6 + 8 + 8`** are the FILE-AS-FILED position this amendment supersedes; the four superseded
row terms are `P-TH-IM-1` `20`, `P-TH-TP-1` `59`, `P-TH-TP-2` `20`, `P-TH-TP-3` `26`. **`173 + 21 = 194`**, and **`194`
is still `>` the `≤120` total cap** — **route (b) (keep the rows, declare the overshoot with its terms) is UNMOVED and
is re-declared at `§4`.**

**THE `A-8` DECLARED CHOICE, recorded here because it governs how every term above must be read (`§9` item 6):**

1. **NO register row is generator-backed.** The terms are **exact counts asserted in-row** — **each row drives a
   CLOSED, PINNED shape enumeration that its property text matches exactly**, so **a drawn subset would falsify the
   very count the term prints**.
2. **The seed (`0x20260928`) and its hand-rolled LCG remain in the register as their own determinism check** — the
   drawn sequence is asserted with a different-seed control — **and they govern no row's attempts.**
3. **`≤100` per row / `≤120` in total / `STOP AFTER 5 CONSECUTIVE FAILURES` are DECLARED INAPPLICABLE to this
   register**, because **no row runs a bounded attempt loop** for them to govern. **The rule stays IN THE CONTRACT
   (`§4`'s machinery block) and is NOT deleted** — it is declared to have **no subject here**.
4. **Every term is therefore an EXACT count**, and **a printed count that is not what runs is the filed defect this
   declaration closes** (`A-8`); the `(bounded)` marking remains the honest form for a property whose text outruns its
   finite table (**one row, `P-TH-SM-2` on limb (b)**).

### 0B item 2 — THE `A-7` RULING: **HONOURING THE `removal` MEMBER MEANS THE ATTRIBUTE IS REMOVED — THE SKIP READING IS DIVERGENT**

**The escalation's substance, restated before the ruling:** the landed adapter performs the write only when
`write.removal` is false, so **a removal record leaves a pre-existing `data-theme` in place** — **which is NOT the
record's declared outcome.**

**THE CITED AUTHORITY (read this pass, VERIFIED-BY-READ; the foundation is readable and never modified, `R-10`):**

| # | The reading | Where |
| --- | --- | --- |
| **①** | *"A second function takes that resolution and returns, **as data, the attribute write a consumer would perform** — it writes nothing."* And the applier *"returns the attribute write it **would** perform, with the attribute name caller-supplied and **the removal case represented as a data member**."* | `../Provident-Electron/docs/guide/theme.md` — the opening paragraph and **What it is** |
| **②** | **THE APPLIED-WRITE RECIPE, in the foundation's own runnable code:** *"`// nothing was written: your code applies it —` `//   if (write.removal) el.removeAttribute(write.name) else el.setAttribute(write.name, write.value)`"*, and UC-2's own words: *"You have decided the attribute name (yours, not the mechanism's) and **you need the value to set, or the fact that the attribute should be removed**. The mechanism hands you the write as a record; **your own code performs it** — this is also the shape a fork author **implements when replacing the write path**."* | `../Provident-Electron/docs/guide/theme.md` → the **Code, runnable** block's UC-2 comment and **Use cases** UC-2 |
| **③** | *"**THE `H-r7` `removeAttribute` CLASS IS REPRESENTED AS DATA AND IS NEVER CALLED** … **the returned record is exactly what a CONSUMER needs in order to perform the write on an element it owns**"*; and **why the third member exists**: *"a two-member record forces the consumer to infer the removal case from a value's emptiness … **`removal: true` is the DECLARED discrimination**."* | `../Provident-Electron/docs/specs/theme.md` §0A note 2 |
| **④** | *"**a DECLARED RETURN SHAPE, not a call — the value a consumer would use to remove the attribute**"*; and item 2's own title: *"THE REMOVAL CASE IS DATA, AND `removal` IS THE DISCRIMINATION."* | `../Provident-Electron/docs/specs/theme.md` §2.2 (D)'s `removal` / removal-case rows and §2.4 item 2 |
| **⑤** | the applier's own doc comment in the vendored bytes this repo carries: *"`removal` — `true` when the write is **the REMOVAL case** (the `H-r7` `removeAttribute` class …)"* — the bytes are the pin, read here for the member's meaning only (**never edited**, `R-4`) | `src/shared/theme.ts` → `ThemeAttributeWrite` |

**THE RULE (this filing's, derived from ①–⑤ and stated so the red set can falsify it).** **A removal record's declared
outcome is that the attribute named by `write.name` is NOT PRESENT after the consumer has applied the write.**

1. **`write.removal === false` ⇒ the consumer sets `write.name` to `write.value`.**
2. **`write.removal === true` ⇒ the consumer REMOVES the attribute `write.name`.** *"Honouring"* the member therefore
   means **the removal is performed**; **it does NOT mean "perform no write".** **A consumer that skips the write
   leaves a pre-existing attribute in place, which is a THIRD outcome the record does not declare** — the record's
   value arm, its removal arm and its echoed `name` are its whole vocabulary, and **the foundation states at ③ that a
   removal's `name` is still echoed precisely because the record is what a consumer acts on.**
3. **The fork's adapter IS that consumer and DOES own the root it writes to** — `ThemeRoot` is its own parameter and
   `root.dataset.theme` is its own write site (`§2.2` item 6). **The clause *"never by a call the adapter makes on an
   element it does not own"* is KEPT as filed** and **it does not forbid this ruling**: the `root` it is handed is the
   element it owns; what that clause forbids is reaching for an element the adapter is **not** given.
4. **THE RULING IS ON `removal`-AS-A-RECORD, and the removal branch stays UNREACHABLE through the fork's own resolver**
   (`resolveTheme` returns `'light' | 'dark'`, always a non-empty string — **UNMOVED**, `§3.2` item 5).

**THE CONSEQUENCE FOR THE LIVE / PINNED SURFACES (stated in full, because the escalation asks for it):**

| Surface | The reading under the ruling |
| --- | --- |
| **the token block's `:root` default** (`src/renderer/index.html`) | with `data-theme` **absent**, only `:root`'s own declarations (and the `@media` fallback below) apply. **The mechanism's removal outcome is exactly the state in which the token block's DEFAULT is the authority** — so a consumer that skips leaves the block's **explicit** attribute selectors in charge instead |
| **the `@media (prefers-color-scheme: dark)` fallback** | it is keyed on the attribute's **ABSENCE** (`src/renderer/index.html`'s token-block comment: *"until the renderer boot applies an explicit attribute"*). **Under the skip reading a stale attribute can never fall back to it; under this ruling a removal returns the document to the fallback's domain.** **The fallback's own live observability window is UNMOVED and still narrow** (`§7.2` item 3) |
| **can a stale `data-theme` outlive a settings change on a reachable path?** | **NO on every path reachable through this adapter today**: every reachable call hands the applier a non-empty resolution, so every reachable call **rewrites** the attribute (`write.value`). **The skip-vs-remove difference is therefore UNOBSERVABLE in the fork's live app at this head** — it is a **latent divergence in a branch the resolver cannot enter**, not a reproduced visual defect. **Stated plainly so this ruling is not read as a repaired live bug** |

**IS THE LANDED ADAPTER CORRECT? NO — A `HOST-FIX` IS OWED. Its exact shape and its owner:**

- **The site:** `src/renderer/theme.ts` → `applyThemeToRoot`'s one write site (**the adapter this unit owns**; `§1.4`).
- **The change:** in the `try` block, **when `write.removal` is `true` the attribute is REMOVED from the same
  `dataset` surface the value arm writes to** (the mirror of `root.dataset.theme = write.value`, performed on the
  **same** member, guarded identically); **when it is `false` the write is exactly as landed.** **One write site
  stands** — the removal is the same site's other arm, not a second site.
- **What it must NOT do:** widen `src/**`'s surface (`§1.4`), add a second authority, ask the mechanism for a default
  (`P-TH-3`/`P-TH-5`), or drop the total/fail-soft contract (`§3.2` items 2/3/4/5): **a missing/frozen/throwing
  `dataset` still never throws and the resolved theme is still returned.**
- **A mechanic note, and NOT a widening of the surface:** the removal can be performed **through the `dataset`
  surface the adapter already owns** (the landed test's own DELETE corpus already expresses it that way —
  `tests/pd-ui-1-theme-adoption.test.ts`, the `deleteCorpus` classifier control). **An alternative — calling
  `root.removeAttribute('theme')` — would require WIDENING the `ThemeRoot` contract beyond `{ dataset: { theme?: string } }`
  and is DECLINED here**: `ThemeRoot` is `§2.1`'s pinned exported type (`D-5`) and **the landing is not permitted to
  widen it** (`§1.4`). **Whether `dataset`-level deletion is the correct mechanic against a REAL `DOMStringMap` is
  UNVERIFIED by this pass (`§9` item 7) — it is a `[U]`-class question and it belongs to the live pass.**
- **Owner / pass:** **the next `PD-UI-1` landing pass (the Implementer) — the SAME pass that replaces the `A-7`
  both-readings drive** (see the tripwire paragraph). **The fix CANNOT be driven by a reachable-path row** (`§3.2` item
  5), so its row is the injected-record drive the remand already authored; **a spec-only amendment would leave the
  adapter violating the corrected contract**, which is why the two land together.
- **Is this a foundation gap?** **NO.** **The foundation DOES settle the mechanism's half** — ①–⑤ above fix the
  record's declared outcome and name the consumer's action — and **the foundation deliberately owns no part of what the
  fork's adapter does with it**. **No `docs/defects.md` → `docs/HANDOFF.md` row is owed by this ruling** (`R-10`'s
  handoff rule is for a defect or gap **in the package/foundation**; this one is **HOST-side**). **What the foundation
  does NOT define — and must not be invented here — is the ATTRIBUTE's meaning** (`P-TH-7`: the mechanism may not
  document its name or what it means); **that meaning stays the fork's own `'theme'` token and the token block's**.

**WHICH READING THE REMAND'S TRIPWIRE LOCKS IN — stated so the two are consistent, because they are NOT the same
reading.** The tripwire is `tests/pd-ui-1-theme-adoption.test.ts`'s `⟨A-7 + A-2⟩ P-TH-TP-2` row. **It locks in the SKIP
reading, in two limbs, and both now contradict this ruling:**

1. **its content limb** takes the spec's own `§2.1` item 3 paragraph as its input (`specItem3Text()`) and asserts that
   the paragraph does **NOT** match `/(?:\bskip\w*\b|\bdelet\w*\b)/i` — *"the spec's `§2.1` item 3 now RULES the removal
   semantic — replace this both-readings drive with the ruling (the ESCALATED ambiguity is resolved)"*, asserted `false`.
   **This ruling is therefore the pre-committed trip: the read the test demands is a ruling, and the ruling is made.**
2. **its source limb** asserts the adapter's bytes do **NOT** match
   `/removeAttribute|delete\s+\w+\.dataset\.theme|deleteProperty/` — i.e. **that the adapter performs no removal**,
   with the message *"the removal branch is represented by the record and NEVER by a call the adapter makes on an
   element it does not own."* **That limb reads the removal as data the adapter does not act on.**

**THE CONSISTENCY STATEMENT, in one paragraph:** **the tripwire's reading is SUPERSEDED by this ruling and its two limbs
must be replaced at the same time as the host fix — a both-readings drive and a no-removal source limb are inconsistent
with a contract that rules the attribute removed.** **The replacement (a TestWriter act, NOT this pass's, and NOT
performed here):** drive the injected removal record **once**, against the RULING, and require the **remove** reading to
hold while the **leave-in-place** and **writes-`''`** corpora **FAIL**; and re-scope the source limb so that the
**prohibited** form is *"a removal performed on an element the adapter was not handed"* — **not** the removal itself.
**Until that pass lands, the tripwire is RED BY DESIGN and its failure message is the remediation:** *"replace this
both-readings drive with the ruling."* **A pass that silently deletes the tripwire instead of replacing it is a review
finding** — it would erase the record that the ruling was made.

### 0B item 3 — THE `A-11` RULING: **THE LIVENESS PREDICATE STAYS SETTING-BASED, AND THE RETURN IS DISCARDED**

**The escalation's substance:** `§2.2` item 4 as filed says *"the `applyThemeToRoot` return feeds it [the liveness
predicate]"*. **The landing falsifies that clause**, and the falsification is VERIFIED-BY-READ this pass:
`src/renderer/renderer.ts` → `installTheme`'s `apply()` is the single call site and its body is
**`applyThemeToRoot(document.documentElement, setting, prefersDark())`** — **the return is DISCARDED** — while the
`change` handler's guard is the **setting** re-tested: **`if (setting !== 'light' && setting !== 'dark') apply()`**.
**The adapter's own doc comment claims the opposite use-case** (*"Returns the resolved theme **so the caller can decide
whether the OS listener is live**"*, `src/renderer/theme.ts` → `applyThemeToRoot`) — **and it too has no consumer:
`applyThemeToRoot`'s return has NO consumer anywhere in `src/**`.**

**THE RULING — (b), the SETTING-BASED predicate is the contract, and `apply()` discarding the return is CORRECT:**

| # | Clause |
| --- | --- |
| **1** | **The liveness predicate is the wiring's, and it is `setting`-based: the OS listener applies only while the setting is NEITHER `'light'` NOR `'dark'`.** It is the **same strict-identity test against the same two literals** the kept precedence rule applies (`§2.1` clauses 1/2) — **so the wiring holds no second precedence rule, it holds the same one** (`§2.2` item 7) |
| **2** | **The returned resolution is NOT the liveness input, and `apply()` discarding it is CORRECT — not a defect.** **Why, in the contract's own terms:** the adapter's return is **redundant by construction** with a value the wiring already holds — `applyThemeToRoot` returns **the resolution it computed from the same `(setting, prefersDark())` pair the wiring passes** — so a return-based predicate would read **the same datum by a longer route**, and would be a **weaker** authority: it would silently invert (an explicit `'light'` making the listener LIVE) if the resolution were ever computed differently. **The setting is the authority** |
| **3** | **`§2.1` item 4's *"and it is still implemented"* is CARRIED** and **`D-5` is UNMOVED**: `applyThemeToRoot` **still must return** the same resolved theme it wrote (**the four exports and the return type are the kept surface**, `§1.2` (d)). **What is ruled is only that no `src/**` caller must CONSUME it** — a return with no consumer is a contract, not a defect, and **the row that pins it stays** |
| **4** | **The stale text is amended ANNOTATE-BESIDE** (as-filed clause kept visible at `§2.2` item 4), **and `A-11`'s second half is discharged by the same ruling:** the adapter's doc comment (*"so the caller can decide whether the OS listener is live"*) **is a stale claim** — the next landing pass **drops or corrects it**, because **there is no such caller** |
| **5** | **The observability item is NARROWED, not closed:** the *"return has no consumer"* fact **compounds `A-2`'s finding** — the adoption's discriminators are already instrumented at the **test** side. **`§9` item 4 is the owed item; nothing about the return type changes here** |

### 0B item 4 — THE MECHANISM DECISION IS RECORDED AS AN **OPEN ARCHITECT QUESTION** (NOT decided by this pass)

**THE MEASURED FACT:** the gate-4 adversarial audit's literal recipe (`A-2`/`A-4`) — **`vi.mock('../src/shared/theme.js', …)`**
— was **NOT usable by the remand**: it was **measured to red the frozen `tests/pd-vendor-set.test.ts` `A-12` census**,
which **pins an EXACT set of four non-electron mock binders**, while the literal recipe **adds a FIFTH**.
**THE SUBSTITUTION THE REMAND TOOK, recorded as this pass read it:** the remander **compiles the LANDED ADAPTER'S OWN
BYTES with ONLY its import declaration replaced by a stub bind** — **the same discrimination** (the adapter is made to
follow a record whose members contradict the raw argument), **and NO pin is touched.**
**THE QUESTION, with both options and their costs — the tradeoff STATED, NOT PICKED (`§9` item 8):**

| Option | What it costs |
| --- | --- |
| **(a) keep the literal `vi.mock` recipe** and **amend `tests/pd-vendor-set.test.ts`'s `A-12` census to admit a fifth binder** | **a PIN CHANGE with its OWN GATE** — the census is a frozen, independently-owned pin (`PD-VENDOR`'s), and changing it moves a pin the program has already adjudicated. **What it buys:** the instrumentation is the standard, readable vitest form, applied to the real import edge rather than to a compiled copy of the bytes |
| **(b) the compile-the-adapter-bytes substitution as the PERMANENT shape** | **no pin is touched and no gate is opened** — the cost is **distance from the runtime form**: the drive reads a compiled/instantiated copy with a substituted import declaration rather than the module graph vitest resolves, so **the instrument is one step further from the landed artifact** (and a future bundler/resolver change would not be caught by it) |

**RECORDED — NOT DECIDED.** **Owner: the architect.** **A pass that picks one without that ruling is choosing a pin's
fate, which is not this unit's to choose.**

---

## 0. The rulings this unit derives from (recorded, NOT re-opened)

| # | Ruling, and its source | Carried here as |
| --- | --- | --- |
| **R-1** | **`PD-UI-1` IS `SUBSET+ADAPTER`, AND THE FORK'S RESOLVER IS KEPT.** Gate findings **`C-1`**/**`V-1`**: the foundation's `resolveTheme(setting, env)` returns `{setting, prefersDark, source}` and **decides nothing about appearance**; this repo's `resolveTheme(setting, prefersDark)` returns `'light' \| 'dark'` and **IS the tri-state precedence rule**. *"Deleting it would delete the app's theme behaviour while every pure-layer test stayed green."* — proposal §4.1's `PD-UI-1` row; §4.7's closing list of the three corroborated blocking findings | `§1.2` (the scope decision), `§2.1`, `§8` `D-5` |
| **R-2** | **The seam set is EMPTY.** `env` is an **ordinary argument record**, not a seam: `../Provident-Electron/docs/guide/seams.md`'s last row and `../Provident-Electron/docs/specs/theme.md` §2.1 item 3 — *"`U-THEME` declares an EMPTY seam set"* — and the module's **import census is empty** (verified again this pass by reading `src/shared/theme.ts`: **zero import statements**). | `§3.1`, `§3.3`, `§5` |
| **R-3** | **The ~15 token NAMES and the stylesheet stay fork-side** — they are **app vocabulary**, and `docs/FORK-DIVERGENCE.md` §3 rule 2 names that anti-pattern **verbatim** (*"a token layer that knows Astrographer's 15 token names"*). | `§1.3` (the `KEEP` half), `§1.4` (the denied surface) |
| **R-4** | **The vendored bytes are DIGEST-PINNED and are NEVER edited.** The pd-vendor rows pin them (`vendor/foundation.lock.json`'s per-module `md5`; `tests/pd-vendor-manifest.test.ts`; `tests/pd-vendor-set.test.ts`'s `P-IM-1`), and the program's `K-5` collision reads: *"a Phase-1 adoption must **wrap** a vendored module, **never edit its bytes**"*. **A change to a vendored byte is a pin violation, not a cleanup.** | `§1.4`, `§7.1`, `§8` `D-2` |
| **R-5** | **The fork's `theme` persistence is untouched and is CONSUMER-side by contract** — `OperatorSettings.theme` (`src/shared/types.ts` → `ThemeSetting = 'system' \| 'light' \| 'dark'`; `src/main/operator-settings-store.ts` → `coerceTheme`, default `'system'`) rides `docs/decisions.md` **`DECIDED: UI-CONFIG-CARRIER`**. The foundation's persistence boundary is explicit: *"persistence stays CONSUMER-side unchanged … a store addition is a NEW GATE"* (`docs/specs/post-division-foundation-adoption-surface.md` §2.1) | `§1.3`, `§3.3`, `§8` `D-4` |
| **R-6** | **This unit CONSUMES the vendored `theme.ts`; it re-vendors nothing.** The Phase-0 unit copied the module into `src/shared/theme.ts` byte-identically at the pin (`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §2.1 item 1; `vendor/foundation.lock.json`'s `theme` entry). | `§1.2`, `§1.4`, `§2.2` |
| **R-7** | **The layer rule (`RCA-12`): a node green is ENVELOPE-green, not APP-green.** | the layer block above; `§4`, `§6`, `§7` |
| **R-8** | **This unit renders a themed surface ⇒ the pre-DONE live battery is MANDATORY (`RCA-11`)**, and **`npm run divergence` is a mandatory pre-live leg** (`A-7`) which is **RED at this head for an ENVIRONMENTAL reason** (`/dev/shm` denial → Electron `SIGTRAP`, proposal §7.5 item 2), whose fix is owned by the separate `U-DIVERGENCE-SPAWN` unit and **is not this unit's**. **A live pass that cannot take its measurement is reported `PRECONDITION-FAILED` with the reading attached — never a silent park.** | `§7.2`, `§9` |
| **R-9** | **The `G-9`/`X-9` source-text pin set binds every wave that edits a pinned file.** The pins are the O-0 hook-contract wrappers and the five further source-text pin sets (`unit-u-shell-7-settings-modal`, `unit-u-shell-9a-main-focus-tabs`, `unit-u-shell-shell-wiring`, `unit-h8-operator-editor`, the two `blind-unit-ujr1-*` rows and the two `blind-unit-ud7-*` rows). — proposal §4.7 `A-5`, §4.5's third carried condition | `§3.4`, `§7.1` |
| **R-10** | **Do not patch the foundation (`AGENTS.md` item 7); a foundation gap is a `docs/defects.md` → `docs/HANDOFF.md` row.** | `§9` item 2 |
| **R-11** | **No settled adjudication is re-opened** — not gate 1's verdict, not the architect's `Q-A`..`Q-F`, not `PD-VENDOR`'s cycle, not the two pd-vendor spec amendments, not `B-1`, not `W0`'s outcome, not `X-3`. | throughout; a **new** contradiction is filed with evidence (`§9` item 1) |

### 0A. The dated ruling note — the ONE clause this filing DECIDES, and the ONE it ESCALATES (2026-09-28)

1. **DECIDED — THE ADAPTER SURFACE IS `src/renderer/theme.ts`, AND ITS DELEGATION TARGETS ARE THE VENDORED
   MODULE'S TWO EXPORTS.** The unit's `SUBSET+ADAPTER` classification requires *"a named adapter
   module/function list per element"* (`docs/specs/post-division-foundation-adoption-surface.md` §1's verdict
   table). **This filing names it: the adapter module is the EXISTING `src/renderer/theme.ts`**, its kept
   surface is `resolveTheme`/`applyThemeToRoot`/`ResolvedTheme`/`ThemeRoot` (the fork's names), and its
   **two new duties** are (a) obtaining the environment reading **through** the vendored `resolveTheme`'s
   returned `prefersDark` member rather than through a directly-passed boolean, and (b) obtaining the write
   **as data** through the vendored `applyThemeDeclaration` and performing it at the one write site. **No new
   module is created and no new file is added**: an adapter that is a *new* module would leave the fork's
   existing resolver in place beside it, which is the second-authority hazard this adoption exists to avoid.
2. **ESCALATED — `PD-VENDOR`'s "THE VENDORING IS INERT" PIN.** `tests/pd-vendor-set.test.ts` carries a row
   titled *"§2.1 item 6 / §5 item 5 / §12.3(c) — NO vendored module is imported by this repo today: the hit set
   is **EXACTLY the three stem-collision sites**, and NONE resolves to a vendored member"*, and it asserts the
   **exact sorted three-element array** of `src/**` specifier hits. **A `SUBSET+ADAPTER` adoption whose
   adapter imports the vendored module necessarily produces a FOURTH hit**, and this unit's adapter does.
   **This is this unit's blocking prerequisite** (`§9` item 1), it is a **contract-level pin re-statement**
   (never a relaxation), and **it is escalated NOW rather than deferred** — the alternative forms
   (`await import(...)`, `require(...)`, a `new URL(...)` indirection) are **rejected here with their
   reason**: the pin's pattern matches the static `from '…'` form, so those forms would **evade** the very
   assertion whose subject the adoption falsifies. **The re-statement shape this unit owes is stated at
   `§9` item 1 item (b).** **⟨2026-09-28: read this note with `§0B`'s amendment ledger — it amends nothing here, and
   it disposes of the four gate-4 escalations this note's own cycle left behind (the arithmetic, the `removal`
   semantic, the liveness predicate, and the ONE question it leaves OPEN).⟩**

---

## 1. Scope

### 1.1 What this unit IS (one sentence)

**The adoption, in the fork, of the foundation's `U-THEME` DECLARATION and ENV READING — a pure total
`resolveTheme(setting, env)` returning a three-member resolution and a declaration-only
`applyThemeDeclaration(attributeName, resolved)` returning the attribute write as data — onto the fork's OWN,
KEPT tri-state precedence rule, with the fork's `matchMedia` read and its one `dataset.theme` write surviving
as the named adapter.**

### 1.2 THE SCOPE DECISION, stated in four clauses (this is the unit's core; `C-1`/`V-1` are its authority)

| # | Clause |
| --- | --- |
| **(a) ADOPTED** | **The DECLARATION and the ENV READING.** The fork's adapter obtains `prefersDark` from the vendored `resolveTheme(setting, env)`'s returned record, and obtains the write's shape (the `name`/`value`/`removal` decision, including the removal case as **data**) from the vendored `applyThemeDeclaration(attributeName, resolved)`. **The vendored `ThemeEnv`/`ThemeResolution`/`ThemeAttributeWrite` types become the shapes the fork's adapter reads.** |
| **(b) KEPT, as the adapter** | **The precedence rule, in its own function, with its own return type.** `resolveTheme(setting: unknown, prefersDark: boolean): ResolvedTheme` where `ResolvedTheme = 'light' \| 'dark'`: **an explicit `'light'`/`'dark'` wins; anything else follows the OS reading** (including `''`, `'system'`, a non-string, an omitted argument). **The rule is NOT delegated**, because the vendored resolver **decides nothing about appearance** (`../Provident-Electron/docs/specs/theme.md` §2.3 item 3, `P-TH-10`: *"no precedence rule and no tri-state semantics"*; §2.2 `P-TH-10`). |
| **(c) KEPT, unchanged, outside this unit's write set** | **The ~15 token NAMES and the token block** (`src/renderer/index.html`'s `:root`/`html[data-theme='light']`/`html[data-theme='dark']` + the `@media (prefers-color-scheme: dark)` fallback — **15 custom properties**, VERIFIED-BY-READ this pass: `--bg` · `--fg` · `--muted` · `--muted-2` · `--muted-3` · `--muted-4` · `--card-bg` · `--border` · `--border-strong` · `--input-bg` · `--input-fg` · `--input-border` · `--error` · `--accent` · `--hover`); **the persisted `theme` field and its coercion** (`src/shared/types.ts` `ThemeSetting`, `src/main/operator-settings-store.ts` `coerceTheme`); **the boot wiring's structure** (`installTheme`'s `matchMedia` read, its once-attached `change` listener, its `operatorSettings.get()`/`onChanged` seam, its fail-soft catches). |
| **(d) DELETED** | **NOTHING IS DELETED BY THIS UNIT.** The `SUBSET+ADAPTER` verdict obliges *"a host adapter that reads the environment, holds the app vocabulary, and performs the one write the foundation returns as data"* — and the fork's resolver **is** that reader + vocabulary-holder, so the "subset" half is satisfied by **re-shaping what the existing functions read**, not by removing a symbol. **`resolveTheme`, `applyThemeToRoot`, `ResolvedTheme` and `ThemeRoot` all remain exported, by name**: they are the surface `tests/unit-u-shell-2-theme.test.ts` imports (its only importer in the whole suite — **MEASURED**, `X-3`'s ledger §2 row #1), and removing a name would red a live row for a reason that is not this unit's. |

**The one-clause statement of what would be a REGRESSION, so the red set can falsify it:** *if a landing leaves
the fork's precedence rule evaluated anywhere other than the adapter's own `resolveTheme`, or if a landing
deletes `resolveTheme`/`applyThemeToRoot` while every pure-layer row stays green, the adoption has deleted the
app's theme behaviour* (`C-1`/`V-1`; proposal §4.1's `PD-UI-1` row; §4.7's closing list).

### 1.3 THE `U-THEME-CONTROL` RULING (the corrected disposition `C-15` obliges this filing to take)

**`C-15` corrected the proposal's first claim.** The first version asserted *"this repo already authors an
operator theme control"*; **that is not in the tree** (proposal §4.1's own correction). **The corrected
disposition is `ABSENT → author-in-build as part of `PD-UI-1`'s envelope work — OR explicitly declined.**
**THIS FILING RULES, and the ruling is: DECLINED BY THIS UNIT, WITH A NAMED DEFERRAL.**

**The evidence, each item VERIFIED-BY-READ this pass:**

| # | The reading | Where |
| --- | --- | --- |
| **E-1** | **No theme node exists in the fork's APP-graph authored surface.** `src/shared/demo-envelope.ts` — a **divergent baseline file** the Phase-0 pin explicitly does **not** replace (`R-3` of the Phase-0 spec) — carries **zero** `theme`/`Theme` occurrences. | `src/shared/demo-envelope.ts` |
| **E-2** | **No theme node, handler, readout or control exists in the operator/settings surface either.** `src/renderer/sidebar-panes.ts` carries **zero** `theme`/`Theme` occurrences: no `settingsContent()` theme block, **no `registerHandlerDef` for a theme handler** (the file's handler registrations are `pane-doc-nav-select`, `pane-search-submit`, `template-zone-add`, `template-zone-remove`, `template-reset`, the two page-edit-surface handlers, **`operator-representation-mode-toggle`** and the editor-toolbar toggle), and no theme state field. | `src/renderer/sidebar-panes.ts` |
| **E-3** | **No theme element exists in the page markup.** `src/renderer/index.html` contains `theme` only inside CSS **comments** and inside the two `html[data-theme='…']` selectors and the `@media` fallback — **no control element, no button, no readout**. | `src/renderer/index.html` |
| **E-4** | **The `theme` control's SHAPE has an in-tree precedent, and its home is the keystone host file.** `settingsContent()` authors a readout + flip control for the **sibling** preference (`representationMode`) as provident data, with a registered handler whose body calls `s.operatorSet({ representationMode: mode })` — **that is the exact pattern a theme control would follow.** | `src/renderer/sidebar-panes.ts` → `settingsContent`, `OPERATOR_REPRESENTATION_MODE_TOGGLE_HANDLER`, `registerHandlerDef('operator-representation-mode-toggle', …)`; `docs/decisions.md` `DECIDED: STORE-LISTING-PROVIDENT-AUTHORED` (the same authoring discipline for a settings-pane listing) |

**The ruling, and its reasons in order of binding force:**

1. **DECLINED BY THIS UNIT.** `PD-UI-1` is a **renderer mechanism** row whose foundation element is
   `U-THEME` (the mechanism). The **authored control is the foundation's SEPARATE element `U-THEME-CONTROL`
   (`F1`)** — a **different row** in the same inventory (`docs/specs/post-division-foundation-adoption-surface.md`
   §1 row 2, verdict **`CONFIG-ONLY`**, *"the fork re-derives the same shape"*), and §4.2's seam table gives
   `U-THEME` the seam cell **"none (the `env` reading is an argument record)"** — i.e. **the foundation's own
   row set does not bundle the control into this mechanism.**
2. **The control's only admissible home is OUTSIDE this unit's allowed surface.** `E-4` locates it at
   `src/renderer/sidebar-panes.ts` → `settingsContent()`. **That is the KEYSTONE host file**: proposal `C-6`
   calls `PD-UI-12` *"the KEYSTONE, not a boundary question"*, and
   `docs/specs/unit-pd-ui-12-slot-host-boundary.md` **§1.4 `B-1` keeps the hosting responsibility in that
   file** while its own "every file UNTOUCHED" table lists **`src/renderer/sidebar-panes.ts`** among the files
   it does not touch, and `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (2) orders that
   boundary **taken before any Phase-1 row**. **Editing the keystone from a W1 leaf unit would falsify a
   boundary spec that is the HEAD of Phase 1** — and seven rows share that file, so the edit is not local.
3. **Authoring it in the app-graph envelope instead would not serve the operator.** The theme setting is
   **operator-scoped and NOT MCP-visible** (`docs/decisions.md` `DECIDED: OPERATOR-ISOLATED-GRAPHSCOPE`;
   `UI-CONFIG-CARRIER`'s *"the operator-settings IPC is NOT group-gated and NOT MCP-visible"*). A control
   authored into the **app graph** would be visible to `provident.dispatch`/`get_rendered_html` **but would not
   write the operator setting**, so it would be a themed surface that changes nothing — the opposite of the
   project-wide constraint's purpose.
4. **The project-wide UI constraint is CARRIED, not satisfied here.** `AGENTS.md`'s *"Project-wide constraint
   (UI rendering)"* binds **whoever authors the control**: it must be **provident-ssr data driven through the
   producing graph, never hand-written DOM** — exactly as `E-4`'s `representationMode` control already is, and
   exactly as `../Provident-Electron/docs/specs/theme-control.md` §2.1 item 1 authors `theme-card`/`theme-dark`/
   `theme-light`/`theme-setting` with the `theme-set` handler. **This unit authors no control, so it owes no
   control row; the constraint transfers intact to the deferral.**

**THE DEFERRAL, NAMED so it is never a silent park:**

| Field | Reading |
| --- | --- |
| **What is deferred** | An operator-facing **tri-state appearance control** (`system` \| `light` \| `dark`) authored as provident data, driven through the producing graph, writing the persisted `theme` through the existing `s.operatorSet(...)` bridge. |
| **Whose row it is** | **A new unit, not this one** — because its allowed surface includes `src/renderer/sidebar-panes.ts` → `settingsContent()` and a `registerHandlerDef` entry, and because `PD-UI-1`'s surface (`§1.4`) deliberately does not. **Escalated to the architect** as a new row (name proposed: **`PD-THEME-4` / the authored appearance control**) with `§9` item 3 as its evidence. |
| **The constraint it inherits** | the project-wide UI constraint (provident data, graph-driven, never hand-written DOM); `DECIDED: STORE-LISTING-PROVIDENT-AUTHORED`'s authoring discipline; the `representationMode` control as the in-tree shape (`E-4`); the foundation's shape as reference (`theme-card` + the closed two-member block + the `theme-set` handler + a state node carrying **both** `css.id` and `props.id`) — **cited as a shape, never adopted as data** (the foundation's own card lives in **its** envelope, and a fork re-authors; `docs/specs/post-division-foundation-adoption-surface.md` §2.2). |
| **What this unit owes it** | **NOTHING functional.** One thing only: `§1.4` **names the deferral as a boundary of its denied surface** so a later pass does not read this unit as having authored a control, and `§9` item 3 records it with its owner. |
| **The honest limit** | **`UNVERIFIED`: whether the control is REQUIRED AT ALL.** `docs/requirement-catalog.md` `PRUNE-333` (`SETTINGS-MODAL-THEME`, provenance `user-ratified-spec`) pins *"the appearance setting is tri-state … and persists an explicit choice"* but that row pins the **behaviour**, and the **control** is not named by any landed spec; `docs/specs/user-flow-audit-checklist.md` `UF-THEME-1` carries **NONE** as its defect (`U-SHELL-2 DRAFT`) and `documents/specs/unit-u-shell-7-settings-modal.md` §2.x keeps the operator mounts as the control's home. **What would settle it:** the architect's ruling on the deferral row's existence. |

### 1.4 The ALLOWED surface, and the DENIED surface (exact)

**ALLOWED — these two `src/**` files, and nothing else in `src/**`:**

| Path | Change | Why it is allowed |
| --- | --- | --- |
| `src/renderer/theme.ts` | **MODIFY** — the adapter (`§2.1`): the resolver keeps its name/signature/return type and re-shapes **how it obtains `prefersDark`**; `applyThemeToRoot` re-shapes **how it obtains the write** and keeps its one write site and its total/fail-soft contract; **it imports the vendored module** (`§9` item 1's escalation) | it is the row's own fork artifact (`§1` row of `docs/specs/post-division-test-disposition-2026-09-28.md`), its single importer is `renderer.ts`, and it is the named adapter (`§0A` note 1) |
| `src/renderer/renderer.ts` | **MODIFY** — `installTheme`'s body: the call sites re-point; **the `matchMedia` read, the once-attached `change` listener, the `operatorSettings` seam, the fail-soft catches and the boot call order STAY** (`§2.2` item 4) | it is the boot wiring the row's artifact cell names (`§1` row of the disposition ledger: `installTheme`), and `PD-THEME-3` classes it **`KEEP-ADAPTER`** (`docs/specs/post-division-local-elimination-inventory.md` §2.1) |

**Plus the unit's own artifacts (not `src/**`):** this spec; the dossier
`docs/specs/pd-ui-1-adoption-dossier.md`; the unit's own `-greens.md` when a later gate authors it; the unit's
own `tests/**` file(s) (the TestWriter's, never this pass's); `archive/reviews/**` records; and the unit's own
tracker rows (§10 — the supervisor's writes).

**DENIED (each item, with its reason — a landing that changes one of these is a review finding):**

| Denied | Reason |
| --- | --- |
| **any `src/shared/**` byte** — in particular **the vendored `src/shared/theme.ts`**, and the four divergent baseline files `dom-shim.ts`/`types.ts`/`demo-envelope.ts`/`path-fork-cycle.ts` | **R-4**: the vendored bytes are digest-pinned by `vendor/foundation.lock.json` + `tests/pd-vendor-manifest.test.ts`'s `P-IM-1` + `tests/pd-vendor-set.test.ts`'s `P-SM-2` (byte-identity to the pre-vendoring blob). **Wrap, never patch.** The baseline files are not replaced (`DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` clause (2)) |
| **`vitest.config.ts`** | **`G-9`**: `tests/unit-v5-migration-contract.test.ts` pins `test.testTimeout` **exactly** (floor **and** ceiling `15_000`). **An edit of any kind is a protected-pin violation.** A wave that wants headroom cannot buy it here (`K-6`) |
| **`src/main/markdown-import.ts`** | a **protected `src/**` file** (`tests/unit-v5-migration-contract.test.ts`'s source-contract pin: exactly one `.applyBatch(`, no per-op `putNode`/`putEdge`, the `op: 'putNode'` literal before `op: 'putEdge'`) |
| **`tests/unit-v5-migration-contract.test.ts`** and every artifact it pins — the two `DEEP_ROWS` files, the electron-mock name-set, `tests/unit-import-batch-persist-contract.test.ts`, `tests/fixtures/v5-bridge-capture-fixture.ts`, `package.json`'s `test`/`test:watch` scripts, `docs/specs/ui-overhaul.md` | **protected set**; the pin file itself is `PROTECTED-BY-CONSTRUCTION` (`docs/specs/post-division-test-disposition-2026-09-28.md` §4) |
| **the two fence files** — `tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts` | `DECIDED: REBUILD-ARCHIVE-POLICY` clause (5). **A fence edit re-enters the gate.** (Neither imports the fork's `theme.ts`, so this unit does not brush them; recorded so the denial is explicit.) |
| **`src/renderer/index.html`** — the token block, the markup, the grid CSS, the gutter/region/modal markup | **R-3** (`PD-THEME-2` is `NOT-IN-SCOPE (KEEP)`, `docs/FORK-DIVERGENCE.md` §3 rule 2); the markup/declaration row is **`PD-UI-13`** (W6a), the zone rows are `PD-ZONES-*`, and `PD-UI-12` §1.4 keeps the region markup fork-authored |
| **`src/renderer/sidebar-panes.ts`**, `src/renderer/pane-graph.ts`, `src/renderer/tab-strip.ts`, `src/renderer/modal-state.ts`, `src/renderer/layout-state.ts`, `src/renderer/runtime.ts`, `src/renderer/pane-drag.ts`, `src/renderer/pane-gutter.ts`, and every other `src/**` file | **not this unit's surface.** The keystone file is `PD-UI-12`'s (`§1.3` item 2); the others are sibling rows' (`§4.5`'s wave table) |
| **`src/main/**`** — including `operator-settings-store.ts` and `preload.ts` | the persisted `theme` carrier is **`KEEP`** (`R-5`); no IPC, tool, group, resource or RPC change is owed or permitted (**no new MCP surface** — the foundation's `P-TH-5` class, carried) |
| **`package.json`** — any key | `G-9` pins `scripts.test`/`scripts.test:watch`; and this unit adds **no script, no dependency and no leg** |
| **`scripts/**`** | the live-driver/harness layer; the divergence fix is **`U-DIVERGENCE-SPAWN`**'s (`R-8`) |
| **`tests/pd-vendor-*.test.ts`, `tests/unit-u-shell-2-theme.test.ts`, or any other existing test file** | **a spec may not edit a test** (the Phase-0 spec's `D-12`). The `§9` item 1 pin re-statement is a **TestWriter/owning-unit** act, requested with its shape, never performed here |
| **anything under `../Provident-Electron/**`** | **R-10** — the foundation is adjacent, readable and **never modifiable** |
| **any UI control element, authored or hand-written** | `§1.3`'s ruling; the project-wide UI constraint |

### 1.5 What this unit is NOT

Not the authored control (`§1.3`) · not `PD-UI-6` (`modal-state.ts`, W1's sibling row — **no shared cycle**,
`RCA-2`/`RCA-5`) · not the zones/census/projection rows (`U-ZONES`/`U-CENSUS`/`U-PROJ`, W2) · not the gesture
rows (W3/W4) · not the markup/declaration row (`PD-UI-13`, W6a) · not the region host (DECLINED by the
foundation) · not the slot host (`PD-UI-12`) · not the engine additive set (Phase 2) · not the divergence
harness fix (`U-DIVERGENCE-SPAWN`) · not a tracker rewrite (the supervisor owns tracker rows).

---

## 2. The surface (exact)

### 2.1 The fork adapter `src/renderer/theme.ts` — signature by signature, return shape by return shape

**Exports (all four KEPT by name, VERIFIED-BY-READ as the current surface):**

| Export | Signature (post-adoption) | Return shape | Throws? |
| --- | --- | --- | --- |
| `ResolvedTheme` | `export type ResolvedTheme = 'light' \| 'dark'` | — | — |
| `ThemeRoot` | `export interface ThemeRoot { dataset: { theme?: string } }` | — | — |
| `resolveTheme` | `export function resolveTheme(setting: unknown, prefersDark: boolean): ResolvedTheme` | `'light'` \| `'dark'` | **NEVER — total for every input** (`setting` may be `undefined`, a number, a `Symbol`, a revoked `Proxy`, an object with hostile `toString`/`valueOf`; `prefersDark` may be a non-boolean at runtime, which is **not `true`** by the rule below) |
| `applyThemeToRoot` | `export function applyThemeToRoot(root: ThemeRoot, setting: unknown, prefersDark: boolean): ResolvedTheme` | the resolved `'light' \| 'dark'` — **the same value it wrote** | **NEVER — total/fail-soft** |

**`resolveTheme`'s rule, pinned exactly (it is the KEPT precedence rule, `§1.2` (b)):**

1. `setting === 'light'` ⇒ **`'light'`** (strict identity; an explicit choice wins, whatever `prefersDark` says).
2. `setting === 'dark'` ⇒ **`'dark'`** (strict identity; same).
3. **every other `setting`** — `'system'`, `''`, `undefined`, `null`, a number, a boolean, a `Symbol`, a
   `12n`, an object (including one carrying a callable `toString`/`valueOf`), a function, an array, a `Map`, a
   `Proxy` — ⇒ **`prefersDark === true ? 'dark' : 'light'`**. **`'system'` is NOT a third state of this
   function's return: it is simply a setting that is neither of the two explicit ones.** **`String()`/
   `toString`/`valueOf` are NEVER consulted** (the fork's resolver reads `setting` only by strict identity
   against two literals).
4. **The OS reading is boolean-strict:** only `prefersDark === true` yields `'dark'`. A truthy non-boolean
   (`1`, `'true'`, an object) is **not `true`** ⇒ `'light'`. **This is the adapter's rule, and it is the same
   rule the vendored module applies to its own `env.prefersDark` member** (`§3.1` item 2) — so the two layers
   cannot disagree.

**`resolveTheme`'s NEW internal duty (the adoption's point, `§0A` note 1).** The function obtains the OS
reading **through the vendored resolver**: it calls the vendored `resolveTheme(setting, env)` with
`env = { prefersDark }` (the record the fork's boot wiring supplies, `§2.2` item 4) and reads the returned
record's **`prefersDark`** member. **Consequences, all pinned:**

- **The vendored call's `setting` member is IGNORED by the precedence rule** — the vendored resolver carries
  it through (its pass-through rule, `../Provident-Electron/docs/specs/theme.md` §2.3 item 1), so a
  **non-string/empty `setting` arrives as `null`**, and the fork's rule treats `null` as *"follow the OS"*
  (clause 3). **The two readings therefore agree on the OUTCOME and disagree only in what they name it** —
  and **the fork's outcome is the contract** (`§1.2` (b)).
- **The vendored record's `source` member (`'env'` \| `'degraded-env'`) is READ but NOT RE-EXPORTED and NOT
  OBSERVABLE outside the adapter.** Whether `applyThemeToRoot`'s return should become a richer record is **NOT
  this unit's to change** (`§1.2` (d): the four names stay; the return type stays `ResolvedTheme`). **Recorded
  as an owed observability item** (`§9` item 4).
- **The vendored call is TOTAL**, so it can never throw into the adapter (`§3.1` item 6) and needs no
  try/catch of its own.

**`applyThemeToRoot`'s rule, pinned exactly:**

1. It computes the resolution (`resolveTheme(setting, prefersDark)`).
2. It obtains the write **as data** by calling the vendored
   `applyThemeDeclaration(attributeName, resolved)` with `attributeName = 'theme'` — **the fork's own
   attribute-name token**, which is the *suffix* of the `data-*` attribute the fork's token block is keyed on
   (`html[data-theme='light']`/`html[data-theme='dark']`, `§1.2` (c)) and which the `ThemeRoot` contract's
   `dataset.theme` member already fixes. **The vendored module owns no attribute name and may not document
   one** (`../Provident-Electron/docs/specs/theme.md` §2.2 `P-TH-7`), so the name is the caller's — as it is
   here.
3. It performs **exactly one** write of **the record's** decision at **the one write site**
   (`root.dataset.theme`): **the `value` branch is `root.dataset.theme = write.value`; the `removal` branch is
   the removal of the attribute — represented by the record as `removal: true`, never by a call the adapter
   makes on an element it does not own.** **Under this adapter's invariants the `removal` branch is
   UNREACHABLE** (`§3.2` item 5), **and it is still implemented**, because the vendored contract declares it
   and a record the adapter does not honour is a silent divergence.
4. It returns the resolved theme (`§1.2` (d) — the caller uses that return to decide whether the OS listener
   stays live; dropping it is the `PD-THEME-1` named collision risk, `docs/specs/post-division-local-elimination-inventory.md`
   §2.1). **⟨PARTLY SUPERSEDED 2026-09-28 (`A-11` RULED — `§0B` item 3): the RETURN is required and stays
   (`D-5` UNMOVED), but the CLAIM THAT A CALLER CONSUMES IT IS FALSE — `installTheme`'s `apply()` discards it, and
   the liveness predicate is SETTING-based. `PD-THEME-1`'s collision risk is therefore NOT this state: what that
   item warns against is DROPPING the return, and the return is kept. What is superseded is only the parenthetical
   use-case, which is amended annotate-beside at `§2.2` item 4.⟩**
5. **TOTAL/fail-soft, unchanged:** a missing, `undefined`, `null`, non-object, or **frozen** `dataset`, or a
   root whose `dataset` member read throws, ⇒ **nothing throws and the resolved theme is still returned.**
   The existing implementation's `try { root.dataset.theme = resolved } catch { … }` shape is the contract.
6. **THE `removal` ARM, RULED (`A-7`, 2026-09-28 — this paragraph is the ruling site `A-7`'s own correction names):
   a record whose `removal` member is `true` means the attribute is REMOVED — the adapter must NOT leave a
   pre-existing `data-theme` in place.** **The cited authority, the full consequence for the live/pinned surfaces, the
   `HOST-FIX` this obliges on this very function, and the tripwire's reading are at `§0B` item 2** (with
   `../Provident-Electron/docs/guide/theme.md` → **Use cases** UC-2 and its **Code, runnable** comment as the settled
   citation). **The clause *"never by a call the adapter makes on an element it does not own"* STANDS as filed**, and
   it does not forbid this: **the `root` parameter IS the element the adapter owns.** **The removal arm remains
   UNREACHABLE through the fork's own resolver** (`§3.2` item 5) — **the ruling fixes the record's meaning, not a
   reachable behaviour.**

**Import census of the adapter (post-adoption, pinned):** exactly **one** import statement —
`from '../../shared/theme.js'` (the vendored module), whose specifier resolves to `src/shared/theme.ts`. **⟨CORRECTED 2026-09-28 (gate-4 finding `A-9`, HOST-FIX): THE SPELLING ABOVE IS WRONG AND IS KEPT VISIBLE.** **`src/renderer/../../shared/theme.ts` escapes `src/` entirely and resolves to `<repo>/shared/theme.ts` — a path that does not exist.** **The correct relative form from `src/renderer/` is `'../shared/theme.js'`**, which is also the form the landed adapter uses and the form the re-stated pin's allow-list carries. **No adapter could ever use the spelling this clause as-filed named**, and the two test-file comments that cite *"recorded as a nit in §2.1"* are therefore **stale as written**: the nit was reported but **this clause was never amended** — this annotation is that amendment.⟩
**No other import of any kind, and no import of `electron`, `node:*`, `provident-ssr`, `dom-shim`, or any
sibling `src/renderer/**` module.** *(`../../shared/theme.js` is the correct relative form from
`src/renderer/`; the implementer may write the equivalent form the bundler/typechecker accepts, and the row
asserts the RESOLVED path, never a spelling.)*

### 2.2 The boot wiring `src/renderer/renderer.ts` → `installTheme`

| # | Item | Contract |
| --- | --- | --- |
| 1 | **Name, signature, visibility** | **`installTheme(): void`** — a module-private function, **not exported** (unchanged; it is called once from the boot path). Its call site and its position in the boot order are **unchanged**. |
| 2 | **The `matchMedia` read** | `window.matchMedia('(prefers-color-scheme: dark)')`, guarded by `typeof window.matchMedia === 'function'` inside a `try`; **a thrown or absent `matchMedia` ⇒ `media = null`** and the reading degrades to `false`. **This read STAYS in the wiring** — it is the adapter's environment READ, and it is the source of the `env` record the adapter consumes. |
| 3 | **The reading accessor** | `prefersDark(): boolean` — `media ? media.matches : false`, wrapped in `try`/`catch` **returning `false` on a throw**. **A `false` reading is a NORMAL reading, never a degradation** (the foundation's own rule, `../Provident-Electron/docs/specs/theme.md` §2.3 item 2 row (2)). |
| 4 | **The live listener** | **attached ONCE**, inside `try`, via `media.addEventListener('change', …)`; its handler calls the apply path **only while the setting is neither `'light'` nor `'dark'`** (the explicit choice makes the listener inert). A `matchMedia` without `addEventListener` **degrades silently, never throws**. **THE LIVENESS PREDICATE IS SETTING-BASED, AND THAT IS THE CONTRACT (`A-11`, RULED 2026-09-28 — `§0B` item 3).** **⟨AS FILED, KEPT VISIBLE: *"The listener's liveness predicate STAYS the wiring's (the `applyThemeToRoot` return feeds it) — `PD-THEME-1`'s named collision risk."* — THIS CLAUSE IS FALSIFIED BY THE LANDING AND IS SUPERSEDED: VERIFIED-BY-READ this pass, `src/renderer/renderer.ts` → `installTheme`'s `apply()` is the ONE call site and its body DISCARDS `applyThemeToRoot`'s return, while the handler re-tests the SETTING (`setting !== 'light' && setting !== 'dark'`), so the return has NO consumer in `src/**`.⟩** **THE RULING: the predicate STAYS setting-based and `apply()` discarding the return is CORRECT** — the return is redundant by construction with a datum the wiring already holds (the same `(setting, prefersDark())` pair), so a return-based predicate would read the same value by a longer route and would silently invert if the resolution were computed differently. **The `resolveTheme`/`applyThemeToRoot` return contract itself is UNMOVED** (`§2.1` item 4, `D-5`); **what is ruled is that no `src/**` caller must consume it.** **The adapter's own stale doc comment** (*"Returns the resolved theme so the caller can decide whether the OS listener is live"*, `src/renderer/theme.ts` → `applyThemeToRoot`) **is owed a drop-or-correct by the next landing pass** — there is no such caller. |
| 5 | **The seam** | `window.provident?.operatorSettings?.get()` → `Promise<{ theme?: unknown }>` and `onChanged?(handler)` → unsubscribe, **both optional-chained and both inside `try`**: an absent bridge, an absent `operatorSettings`, an absent `onChanged`, a rejected `get()` ⇒ **the setting keeps its `'system'` default and nothing throws** (`src/main/preload.ts` → the `operatorSettings` bridge declares `get(): Promise<OperatorSettings>`, `set(patch)`, `onChanged(handler): () => void`). **No IPC change is owed or permitted** (`§1.4`). |
| 6 | **The apply path** | `applyThemeToRoot(document.documentElement, setting, prefersDark())`. **THE ONE WRITE SITE for the appearance attribute in this repo** — no other `src/**` file writes it (VERIFIED-BY-READ: `src/renderer/theme.ts` is the only module whose contract declares the `dataset.theme` write, and `renderer.ts`'s single call is its one invocation). |
| 7 | **What the wiring may NOT do** | read `theme` from anywhere other than the persisted setting / the `onChanged` payload / its own `'system'` default · hold a store, a cache or a memo · write a custom property (the token block is CSS, `§1.2` (c)) · resolve the precedence itself (that is the adapter's rule) · add a second DOM write of the appearance attribute · add an MCP/IPC surface. |

### 2.3 The consumed foundation surface — exactly what and from where

| Adopted | Source | This unit's use |
| --- | --- | --- |
| `resolveTheme(setting: unknown, env: unknown): ThemeResolution` | `src/shared/theme.ts` (**vendored**, Phase-0, R-6) | **CALLED by the adapter** — for the `env` reading. Its returned `setting` member is ignored by the precedence rule; its `prefersDark` member is the reading; its `source` member is read-not-exposed (`§2.1`). |
| `applyThemeDeclaration(attributeName: unknown, resolved: unknown): ThemeAttributeWrite` | same | **CALLED by the adapter** — the write as data, at the one write site. |
| `ThemeEnv`, `ThemeResolution`, `ThemeAttributeWrite` | same (**types**) | the shapes the adapter reads. **They are not re-exported** (`§1.2` (d)); the adapter's own exported types are unchanged. |
| `../Provident-Electron/docs/specs/theme.md` §2.1 item 3 / §2.3 / §2.4 / `§3.4 R-*` | the contract | the **inherited CONTRACT evidence** (`§0`'s inherited-evidence rule) — the semantics table, the prohibitions and the fail-state rules the red set derives from. |
| `../Provident-Electron/docs/specs/theme-greens.md` | the blind run | **inherited ENVELOPE-layer evidence only** — 32/32 PASS over two pure functions, **never a fork claim**. |

### 2.4 What this unit ADOPTS as a prohibition (carried, never relaxed)

The vendored module's own prohibitions **bind its bytes, which this unit does not touch**, and they bind **the
fork's adapter in the direction that matters**: the adapter may **not** push the fork's vocabulary INTO the
mechanism. Concretely, and pinned in `§3.4`: the adapter **never** passes a token it owns into the vendored
call in a way the vendored contract would have to interpret (`P-TH-1`/`P-TH-10`), **never** asks the vendored
module for a default (`P-TH-3`/`P-TH-5`), **never** expects it to hold state or persist (`P-TH-4`/`P-TH-11`),
and **never** imports a sibling into it (`P-TH-12`). **Every one of these already holds for the vendored bytes
and is RE-ASSERTED by the register (`§4` `P-TH-IM-4`/`P-TH-IM-5`) so the adoption cannot silently reverse it.**

---

## 3. Mechanics and EVERY fail-state

### 3.1 The vendored module's fail-states (the DECLARATION + ENV READING the fork now depends on)

**Read from the vendored bytes this pass (VERIFIED-BY-READ of `src/shared/theme.ts`, 73 lines, zero imports;
and of `../Provident-Electron/docs/specs/theme.md` §2.3/§2.4, which the red set must derive from).**

| # | Input shape | Declared outcome | Throws? |
| --- | --- | --- | --- |
| 1 | `setting` a **non-empty string** | `resolution.setting` is **that string by identity** — nothing parsed, trimmed, folded or recognized; `'DARK'`, `' dark '`, `'system'`, `'false'`, `'0'`, `' '` are all **legal tokens** carried verbatim | no |
| 2 | `setting === ''` **or a non-string** (`42`, `null`, `undefined`, a `Symbol`, an object, a revoked `Proxy`) | `resolution.setting === null` — an **ABSENCE**, never a fabricated token, and **no coercion hook is consulted** (`String()`/`toString`/`valueOf` invocation counts `0`) | no |
| 3 | `env = { prefersDark: true }` | `{ prefersDark: true, source: 'env' }` | no |
| 4 | `env = { prefersDark: false }` | `{ prefersDark: false, source: 'env' }` — **a NORMAL reading, never a degradation** | no |
| 5 | **`env` non-object or `null`** (`undefined` omitted, `42`, `'x'`, `null`) | `{ prefersDark: false, source: 'degraded-env' }` | no |
| 6 | **`env` an object with NO own `prefersDark`** (`{}`) | `{ prefersDark: false, source: 'degraded-env' }` | no |
| 7 | **`env` with an INHERITED `prefersDark: true`** (`Object.create({ prefersDark: true })`) | `{ prefersDark: false, source: 'degraded-env' }` — **the member is read by its OWN-PROPERTY DESCRIPTOR**, so an inherited `true` is **not a reading** | no |
| 8 | **`env` a `Proxy` whose traps answer `true` but expose NO own member** (`get: () => true, has: () => true, getOwnPropertyDescriptor: () => undefined`) | `{ prefersDark: false, source: 'degraded-env' }` — **traps that expose no own member are not a member, however they answer** | no |
| 9 | **`env` with an own `prefersDark` that is NOT strictly boolean** (`1`, `'true'`, `0`, `''`, `NaN`, an object) | `{ prefersDark: false, source: 'degraded-env' }` — **the rule is strict `=== true`, so a number `1` is NOT read as `true`** | no |
| 10 | `env` an object whose own-member descriptor read or accessor **THROWS** (a revoked `Proxy`, a throwing getter) | `{ prefersDark: false, source: 'degraded-env' }` — **the throw is absorbed** | no |
| 11 | `env` a container carrying a **genuine own** `prefersDark` accessor returning a strict boolean | that value, `source: 'env'` | no |
| 12 | `attributeName` a **non-empty string** | `write.name` is **that string by identity** | no |
| 13 | `attributeName === ''` or **non-string** (incl. omitted) | `write.name === null` — **no default attribute name is fabricated** | no |
| 14 | `resolved` a **non-empty string** | `{ value: resolved, removal: false }` — `'false'`, `'0'`, `' '` are **legal resolved values, NOT removals** | no |
| 15 | `resolved === ''`, `null`, a non-string, or **omitted** | `{ value: '', removal: true }` — **the removal case is signalled by the `removal` member ONLY**; the `name` is still echoed independently | no |
| 16 | **Any invocation of either function with ANY argument shape** | a declared record | **NEVER** — *"It never throws and has no refusal domain … there is no `ok`, `code`, `reason` or `thrown` anywhere in the returned records"* (`../Provident-Electron/docs/specs/theme.md` §2.1 item 2, §3.2's note) |
| 17 | **Each call** | returns a **fresh, plain, neither-frozen-nor-sealed** record while member values are carried **by identity** (`toEqual` across calls holds; `toBe` between two calls' records fails by design) | no |

**THE DEGRADATION THIS UNIT INHERITS, stated plainly:** a degraded `env` produces **`prefersDark: false`**,
which under the fork's rule resolves to **`'light'`** — i.e. the same observable outcome the fork's own
`matchMedia`-absent degradation already produces (`docs/specs/unit-u-shell-2-appearance-tokens.md` §4 `F2`:
*"`matchMedia` unavailable ⇒ degrade to the light default; no throw"*). **The vendored layer's `source`
discriminator is what distinguishes a real `false` from a degraded `false`, and this unit READS it but does
not expose it** (`§2.1`; `§9` item 4).

### 3.2 The fork adapter's own fail-states (total / fail-soft — the CONTRACT this unit owns)

| # | Shape | Declared outcome |
| --- | --- | --- |
| 1 | **`root` is `{ dataset: {} }`** (a plain object, or the test `ShimElement`) | the resolved theme is written onto `root.dataset.theme` and returned |
| 2 | **`root.dataset` is FROZEN** (`Object.freeze({ dataset: Object.freeze({}) })`) | **nothing throws**; the assignment fails silently-or-throws and is **absorbed**; the resolved theme is still returned |
| 3 | **`root` is `{}`** (no `dataset` member) — or `null`/`undefined`/a primitive at runtime | **nothing throws**; the resolved theme is still returned; **no attribute is written** |
| 4 | **`root.dataset` is a member whose READ throws** | **nothing throws**; the resolved theme is still returned |
| 5 | **The `removal` branch of the write** | **UNREACHABLE under this adapter's invariants, and still implemented — AND ITS MEANING IS RULED (`§0B` item 2, 2026-09-28, `A-7`): a removal record means the attribute is REMOVED, so the landed "perform no write" reading is DIVERGENT and a `HOST-FIX` on `src/renderer/theme.ts` → `applyThemeToRoot` is OWED.** Why unreachable: `resolveTheme` returns `'light'`/`'dark'` — **always a non-empty string** — so the vendored `applyThemeDeclaration(attributeName, resolved)` takes its **non-removal** arm on every reachable call. **A red row must NOT assert a removal write on a REACHABLE call** (it could only pass by breaking the resolver); the row asserts instead (a) that the removal arm is **honoured if a record carries it** (driven with a synthetic record through the adapter's decision, or asserted as the implemented branch), and (b) that the **reachable** path always writes `write.value`. **⟨`A-7` correction: "honoured" now has a RULED meaning — the attribute is removed — so limb (a)'s drive asserts the REMOVAL, and a leave-in-place or `writes ''` corpus must FAIL it (`§0B` item 2).⟩** |
| 6 | **`setting` is a hostile value** (a revoked `Proxy`, an object with a throwing `toString`, a `Symbol`) | the precedence rule reads it by **strict identity** only, so the hostile members are **never touched**; the outcome is the OS-following one; **nothing throws** |
| 7 | **`prefersDark` is not a boolean at runtime** (`1`, `'true'`) | **`'light'`** (only `=== true` yields `'dark'`, `§2.1` clause 4) — **never a coercion of the caller's value** |
| 8 | **The vendored call itself** | **cannot throw** (`§3.1` item 16); if a future revision did, the adapter's totality would be **broken and that is a finding, not a silent absorb** — the register's `P-TH-TP-3` drives every shape and asserts no-throw |
| 9 | **Repeated calls with the same arguments** | the **same** `ResolvedTheme` every time; **no module-level state, no cache, no memo, no store** |
| 10 | **The adapter's file** | **no DOM read of any kind besides the root argument's `dataset` write site**; **no `matchMedia`** (that read belongs to the wiring, `§2.2` item 2); **no ambient `document`/`window`/`localStorage`/`fs`** |

### 3.3 The seams (there are NONE — `R-2`, restated as a checkable claim)

`U-THEME` **declares an EMPTY seam set** and this adoption therefore supplies **no seam**. What the fork
supplies instead is **data and the applied write itself** (`../Provident-Electron/docs/specs/theme.md` §2.2's
caller-supplied paragraph):

| The fork supplies | Where |
| --- | --- |
| the `setting` token **and its whole vocabulary** (`'system'`/`'light'`/`'dark'` + everything else the persisted field might hold) | the adapter + the boot wiring — **fork-side, never pushed into the mechanism as a decision** |
| the **`env` record's single `prefersDark` member**, as a **claim about the fork's own environment** | the boot wiring's `matchMedia` read (`§2.2` items 2/3) |
| the **attribute name** and its meaning | the adapter's own `'theme'` token, which the token block fixes (`§2.1` item 2 of the adapter's rule) |
| **the token block, the stylesheet and every persisted preference** | `src/renderer/index.html` + `ThemeSetting` + `operator-settings-store.ts` (**unchanged**, `§1.2` (c)) |
| **the write itself** | `applyThemeToRoot`'s one write site (`§2.2` item 6) |

**A pass asserting a seam for this unit is asserting a clause the contract does not carry** — and the
foundation's own record says so (`../Provident-Electron/docs/guide/seams.md`: *"`U-THEME` declares an EMPTY
seam set"*; §2.1 item 3's derivation).

### 3.4 The pins and source-text obligations this unit brushes (each re-derived by name, `R-9`)

| # | The pin / obligation | Status for **this** unit |
| --- | --- | --- |
| **1** | **`tests/pd-vendor-set.test.ts`'s "no vendored module is imported by this repo today" row** (the exact three-hit set) | **THIS UNIT REDS IT, deliberately and correctly** — the adapter's vendored import is the fourth hit. **The re-statement is ESCALATED (`§9` item 1) with its shape, never performed here, and never evaded.** |
| **2** | **`tests/unit-v5-migration-contract.test.ts`'s electron-mock census** (exact 5-name set) | **not brushed** — this unit adds no test file that mocks `'electron'`, and adds no file at all unless the TestWriter authors one, which **must not** mock electron (`K-2`) |
| **3** | **`tests/unit-v5-migration-contract.test.ts`'s `vitest.config.ts` / `package.json` / `markdown-import.ts` / `DEEP_ROWS` / fixture / `ui-overhaul.md` pins** | **not brushed** — none is in this unit's write set (`§1.4`) |
| **4** | **`tests/unit-u-shell-2-theme.test.ts` — 10 literal rows, the ONLY importer of `src/renderer/theme.js`** (MEASURED, `X-3` §2 row #1) | **the file this unit's adapter serves.** It is **`SPLIT`**: its **precedence/root rows keep their observable contract** (the adoption preserves every asserted value — `§1.2` (b)/(d)), and its **token-block rows are `KEEP`** (`PD-THEME-2`). **Its `resolveTheme`/`applyThemeToRoot` rows should be GREEN-and-guarding after the landing, not archived** — `§5`'s `A-3`/`D-3` states how a red for them is handled. **The TestWriter adds the delegation rows in a NEW file, so the pinned file's count is not disturbed more than the adoption requires.** |
| **5** | **`tests/unit-u-shell-shell-wiring.test.ts`'s source-text pin over `src/renderer/renderer.ts`** (a `G-9`-named pin set member) | **BRUSHED — this unit edits `renderer.ts`.** Its subject is the **pointer/listener wiring** (`installShellPointers`'s surface), **not the theme boot**, so a theme-only body change should not red it; **UNVERIFIED whether it reds** — what would settle it: the unit's own reported red set. **It is named here because `G-9` requires the name.** |
| **6** | the five further `G-9` source-text pin sets (`unit-u-shell-7-settings-modal`, `unit-u-shell-9a-main-focus-tabs`, `unit-h8-operator-editor`, the two `blind-unit-ujr1-*`, the two `blind-unit-ud7-*`) and the O-0 hook-contract wrappers | **not brushed by name** — none pins `theme.ts` or `installTheme`; the O-0 wrappers pin `renderer.ts`'s traversal/envelope/reconcile hooks, and a theme-body edit does not touch them. **Named so the obligation is discharged by name rather than by assumption.** *(VERIFIED-BY-READ: no `theme` occurrence in `tests/unit-u-shell-shell-wiring.test.ts`'s pinned surfaces or in the O-0 hook-contract targets.)* |
| **7** | **the two fence files** | **not brushed** — neither imports `theme.ts`. |
| **8** | **the `K-6` non-test pins** (`vitest.config.ts`, `package.json`'s test scripts) | **not brushed** (`§1.4`). |

---

## 4. The typed Property register (`§5.x`-class; **CODE-BEARING UNIT — the register is REQUIRED**)

**Section-number note (so a citation resolves):** the house convention calls this block a **`§5.x` Property
register**; **in THIS file it is `§4`**, because `§3` is this unit's mechanics block — the same placement the
Phase-0 unit used (`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §4). **The row ids use the house
prefixes, qualified with this unit's token** — `P-TH-IM-` · `P-TH-SM-` · `P-TH-TP-` — the form the foundation's
own `U-THEME` register uses (`../Provident-Electron/docs/specs/theme.md` §5.5.1), so a citation from either
tree is unambiguous. **No `F-` row and no `§6` citation appears in this register.**

**Why a register and not the zero-row exemption.** This unit **is code-bearing** (it changes two `src/**`
modules and adds rows), and its central claims are **quantifications over finite shape sets** (the setting
shapes, the env shapes, the root shapes, the write records). `PBT-REGISTER-REQUIRED-FOR-CODE-UNITS` **forbids
the zero-row exemption for a code-bearing unit**, and **no superseded `§5.5.0` exemption exists in this repo**
— so the register is authored, not exempted.

**Shared machinery (pinned once, binding on every row).**

- **Seed:** **`0x20260928`** — a fixed literal in the test file; **never** `Date.now()`, never `Math.random()`,
  never an environment read. Where a row uses a generator it is a **hand-rolled 32-bit LCG** with one step per
  draw (`stateₙ₊₁ = (stateₙ · 1664525 + 1013904223) mod 2³²`), the draw selecting a pool member by
  `index = stateₙ₊₁ mod pool.length` — the foundation's `§5.5.1` form.
- **Caps:** **≤100 attempts per row, ≤120 in total**; rows run **sequentially in register order**;
  **STOP AFTER 5 CONSECUTIVE FAILURES** (the running row's remaining attempts are abandoned; no further row
  starts). **No new dependency, no PBT library, no sixth leg** — plain deterministic vitest tables in the
  unit's own test file.
- **Terms (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`):** every term is printed **as the sum of its own
  factors**; a term that counts **distinct inputs** rather than **drives** says so.
- **Control-draw reporting (required):** every row carries a **control whose expected outcome is the OPPOSITE
  of the row's verdict**, and the row is `held` **only if the control discriminates**.
- **Class meaning here:** **`P-TH-IM` = an invariant of the adopted DECLARATION/ENV-READING contract and of
  the fork's kept precedence rule** · **`P-TH-SM` = a safety property over the repo/app state this unit may
  not disturb** · **`P-TH-TP` = a totality / discrimination property over the unit's own functions.**
- **`(bounded)`** is marked where a row's property text quantifies more broadly than the finite domain it
  drives — **a bounded row is execution design, not a proof of the universal it states.**
- **Layer:** every row is **`[T]` (node/pure) or `[H]` (host-side read)**. **No row is app-green**, and no row
  may be reported as app evidence (`RCA-12`).
- **Row-id qualifier:** the `P-SM-1` row id **collides with the fork's carried baseline red-set row id**
  (`P-SM-1` `strat:stage-seam-schedule-single-active`, defect `PANE-TOGGLE-STAGE-COLLAPSE`). **Therefore NO
  row in this register uses a bare `P-SM-n` id**: they are `P-TH-SM-1`/`P-TH-SM-2`. **Recorded because a
  reader seeing `P-SM-1` in `docs/specs/unit-pd-ui-1-…` and `P-SM-1` in the baseline would otherwise
  conflate two unrelated rows.**

| # | Row id | Property (falsifiable) | Domain / strategy | Attempts (printed as the sum of its terms) | `(bounded)`? |
| --- | --- | --- | --- | --- | --- |
| 1 | **`P-TH-IM-1`** | **THE PRECEDENCE RULE IS KEPT, AND IT IS EVALUATED IN THE ADAPTER.** For every `(setting, prefersDark)` pair in the row's grid: an explicit `'light'`/`'dark'` returns **that** arm **regardless of `prefersDark`**; every other setting returns **`prefersDark === true ? 'dark' : 'light'`**; and **the returned value is a member of the closed two-member domain `'light' \| 'dark'` in EVERY cell**. **The discriminating cells, named: `('light', true) ⇒ 'light'` and `('dark', false) ⇒ 'dark'` — an implementation that delegated the precedence to the vendored resolver (which decides nothing) would return the OS arm in both; and `('', true)` / `(new String('light'), true)` ⇒ `'dark'`, because `''` and a boxed `String` are NOT explicit choices by strict identity (`A-6`).** **Control:** a corpus implementing *"the OS wins over an explicit choice"* **MUST fail** the same oracle, and a corpus returning the vendored record's `setting` member (`null` for a non-string) **MUST fail**. | **strategy `strat:theme-precedence`** — **`6` setting shapes × `2` `prefersDark` values = `12` cells**, each **read twice** (identity + domain) = `24`; **plus `4` synthetic controls** (OS-wins corpus, record-`setting` corpus, a corpus returning a third state, a corpus returning a non-member string) — **`A-6`: the `''` and boxed-`String` shapes, +2 shapes = +8 drives** | **`28`** = `24` + `4` controls **⟨amended 2026-09-28, `§0B` item 1: AS FILED this cell read `20` = `4` setting shapes × `2` × `2` = `16` + `4` controls — SUPERSEDED and kept visible; `A-6`⟩** | **NO** — the grid is the declared extent and the property text matches it exactly |
| 2 | **`P-TH-IM-2`** | **THE ENV READING IS DELEGATED, AND THE ADAPTER'S READING AGREES WITH THE MECHANISM'S DECLARED RULE.** For every env shape in the row's table (`undefined` · `null` · a primitive · `{}` · `{prefersDark: true}` · `{prefersDark: false}` · an **inherited** `true` · a **trap-only** `Proxy` · `{prefersDark: 1}` · a **throwing** accessor · a genuine own accessor): the **vendored** `resolveTheme(setting, env)` returns the declared record of `§3.1`, **nothing throws**, and the adapter's `resolveTheme(setting, prefersDark)` returns **the same appearance** for `prefersDark` **taken from that record** as it does for the raw boolean. **Control:** a corpus reading `env` **truthily** (`if (env.prefersDark)`) **MUST fail** for shapes `{prefersDark: 1}`, the inherited `true` and the trap-only `Proxy`; a corpus calling `env.prefersDark` through a coercion hook **MUST fail** the zero-count assertion. | **strategy `strat:theme-env-reading`** — **`11` env shapes × `2` observations** (the declared record + the adapter's agreement) = `22`; **plus `4` controls** | **`26`** = `22` + `4` controls | **NO** — `§3.1`'s table is a closed, pinned enumeration matched exactly |
| 3 | **`P-TH-TP-1`** | **THE ADAPTER'S SURFACE IS TOTAL AND ITS TYPES ARE PRESERVED.** For every one of the row's `14` hostile/absent `setting` shapes and every one of the `4` non-boolean `prefersDark` shapes: `resolveTheme` **does not throw**, returns a member of `'light' \| 'dark'`, and **consults no coercion hook** (`toString`/`valueOf` invocation counts `0`); and `applyThemeToRoot(root, setting, prefersDark)` **does not throw** for every `(root, setting)` pair of the row's `3 × 3` root grid. **Control:** a corpus whose resolver calls `String(setting)` **MUST** record a non-zero invocation count and fail; a corpus throwing for a `Symbol` setting **MUST** fail the totality limb. | **strategy `strat:theme-total-surface`** — **`14` setting shapes × `4` non-boolean readings = `56` resolver drives**, **plus `3` root shapes × `3` settings = `9` applier drives** = `65`; **plus `2` controls** — **`A-6`: `''` and a boxed `String` join the hostile list, +2 shapes = +8 drives** | **`67`** = `56` + `9` + `2` **⟨amended 2026-09-28, `§0B` item 1: AS FILED this cell read `59` = `12` setting shapes × `4` = `48`, + `9` + `2` — SUPERSEDED and kept visible; `A-6`⟩** | **NO** — the shapes are a closed, pinned enumeration |
| 4 | **`P-TH-TP-2`** | **THE ADAPTER PERFORMS EXACTLY ONE WRITE, AT ONE SITE, WITH THE RECORD'S DECISION, AND RETURNS THE RESOLVED THEME.** For every `(setting, prefersDark)` cell of the row's grid, the **write observed at the root is exactly ONE**, its value is the `'light'`/`'dark'` member the function returns, and the function's return **equals** its own resolution. **And in the opposite direction:** the removal arm is honoured **if** a record carries it (driven by injecting a `removal: true` record), while the **reachable** path **never** produces one. **Control (discriminating both ways):** a corpus that writes the **`writing`** decision but returns a **different** theme **MUST fail**; a corpus that performs the write **twice** **MUST fail**; a corpus that takes the removal branch on a reachable call **MUST fail**. | **strategy `strat:theme-write-discrimination`** — **`4` setting shapes × `2` readings × `2` observations** (write count+value / return identity) = `16`; **plus `4` controls** (mismatched return · double write · removal-on-reachable · no write at all) — **`A-7`: the removal branch is DRIVEN (1 landed drive + 3 corpus controls) = +4** | **`24`** = `16` + `4` controls + `4` removal-branch drives **⟨amended 2026-09-28, `§0B` item 1: AS FILED this cell read `20` = `16` + `4` controls — SUPERSEDED and kept visible; `A-7`⟩** | **NO** — one paired comparison per cell over a closed grid |
| 5 | **`P-TH-TP-3`** | **THE APPLIER IS FAIL-SOFT OVER EVERY ROOT SHAPE AND NEVER LEAKS A THROW.** For every `(root, setting, prefersDark)` triple in the row's `3 × 2 × 2` grid — root = a `dataset`-carrying object · a **frozen** root (`Object.freeze`) · an **absent/throwing** `dataset` — **nothing throws**, the return is a member of `'light' \| 'dark'`, and for the two failing shapes **no write is observed**. **Control:** a corpus that lets the assignment's throw escape **MUST fail** the no-throw limb; a corpus that returns `undefined` on the absent-root arm **MUST fail** the return limb. | **strategy `strat:theme-fail-soft`** — **`3` root shapes × `2` settings × `2` readings = `12` drives**, each with **2 observations** (no-throw / return-domain) = `24`; **plus `2` controls** — **`A-3`: a THIRD control (a silent-skip corpus that never attempts the write) proves the recording-Proxy oracle discriminates, +1** | **`27`** = `24` + `3` controls **⟨amended 2026-09-28, `§0B` item 1: AS FILED this cell read `26` = `24` + `2` controls — SUPERSEDED and kept visible; `A-3`⟩** | **NO** — the three root shapes are the declared degradation set (`§3.2`) |
| 6 | **`P-TH-IM-4`** | **THE VENDORED MODULE IS CONSUMED, NOT TOUCHED, AND ITS PROHIBITIONS SURVIVE THE ADOPTION.** Simultaneously: (a) `src/shared/theme.ts`'s **digest equals the manifest's `md5`** for `theme` and equals its recorded pre-vendoring blob (the Phase-0 pin, unchanged); (b) the vendored file still carries **ZERO import statements** and **no `data-theme` literal, no `matchMedia`, no store token, no ambient `document`/`window`/`localStorage`/`fs`**; (c) the fork's adapter **does not pass a fork token into the mechanism as a decision** and **does not import a sibling into it**; (d) the adapter's **import census is exactly one statement**, resolving to `src/shared/theme.ts`. **Control:** a synthetic perturbation of ONE byte in the vendored file **MUST fail** (a) and **MUST NOT** change (c)/(d)'s readings (the two limbs must be independently falsifiable). | **strategy `strat:theme-vendored-consumption`** — **`4` facts × `1` reading** = `4`; **plus `2` independent controls** (a vendored-byte perturbation; an adapter that stops importing the module) | **`6`** = `4` + `2` controls | **NO** — the module and its prohibition set are closed, pinned objects |
| 7 | **`P-TH-SM-1`** | **NO `G-9`-PINNED ARTIFACT AND NO PROTECTED FILE IS DISTURBED, AND NOTHING OUTSIDE THIS UNIT'S SURFACE CHANGES.** Simultaneously: (a) `vitest.config.ts`'s `testTimeout` reads exactly `15_000` and its text carries no forbidden override; (b) `package.json`'s `scripts.test`/`scripts.test:watch` are the pinned values with **no `--testTimeout`**; (c) the electron-mock census derived by scanning `tests/**/*.test.ts` for a top-level `vi.mock('electron', …)` call is **exactly the five pinned names** and **no file this unit adds joins it**; (d) `src/main/markdown-import.ts` satisfies its source contract; (e) `src/renderer/index.html`'s **15 token names** and the two `html[data-theme='…']` selectors and the `@media` fallback are **unchanged**; (f) the persisted `theme` carrier (`src/shared/types.ts` `ThemeSetting`, `coerceTheme`) is **byte-unchanged**. **Control:** a synthetic config carrying `clearMocks: false` **MUST fail** (a); a synthetic `tests/**` file containing `vi.mock('electron', …)` **MUST** join the census (proving (c) is derived, not hard-coded). | **strategy `strat:theme-protected-pin-safety`** — **`6` pin classes × `1` reading** = `6`; **plus `2` controls** | **`8`** = `6` + `2` controls | **NO** — the pin classes are enumerated exactly |
| 8 | **`P-TH-SM-2`** | **THE TOKEN BLOCK AND THE PERSISTENCE CONTRACT ARE UNTOUCHED, AND THE THEME IS NOT REPERSISTED BY THIS UNIT.** Simultaneously: (a) the `:root` block declares **exactly the 15 pinned custom-property names** and each is also declared in the `html[data-theme='dark']` block (a **census, not a value claim**); (b) no `src/**` file in this unit's write set names `localStorage`/`sessionStorage`/a store object/a cache/a memo in connection with the theme; (c) `installTheme` reads the setting from the bridge and **writes nothing back** (no `operatorSettings.set(...)` call on the theme path — a store addition is a **new gate**, `R-5`). **Control:** a synthetic `index.html` corpus dropping one token name **MUST fail** (a); a synthetic theme path calling `operatorSet({ theme })` **MUST fail** (c). | **strategy `strat:theme-token-and-persistence-safety`** — **`3` facts × `2` readings** (the census + the value-independence; the no-store scan + the no-write-back scan; the persistence-surface absence + the carrier's byte-identity) = `6`; **plus `2` controls** | **`8`** = `6` + `2` controls | **NO** for the token census (a closed 15-name set); **`(bounded) ON (b)`** — the no-store scan is a **token scan over this unit's write set**, not a runtime proof that no store exists |

**Class tally:** `P-TH-IM` ×3 (`P-TH-IM-1`, `P-TH-IM-2`, `P-TH-IM-4` — **numerically non-contiguous by
construction**: `P-TH-IM-3` is deliberately **not minted**, because the name-echo/removal-as-data property is
the **vendored module's own** (`../Provident-Electron/docs/specs/theme.md` §5.5.1 `P-TH-IM-3`) and **this unit
must not claim a row over a mechanism it does not change** — a fork row there would be a **fabricated
property**; a reader must not read the gap as an omission) · `P-TH-SM` ×2 · `P-TH-TP` ×3 =
**`8` rows = the register's ceiling, exactly** ✔. **The cap is `≤8` and it is FULL: a further row requires
retiring one, and no further row is proposed here.**

**Attempt tally, printed with its terms (AMENDED 2026-09-28 — `§0B` item 1; the as-filed line is kept visible
immediately below it):**
**`28` (`P-TH-IM-1`) + `26` (`P-TH-IM-2`) + `67` (`P-TH-TP-1`) + `24` (`P-TH-TP-2`) + `27` (`P-TH-TP-3`) +
`6` (`P-TH-IM-4`) + `8` (`P-TH-SM-1`) + `8` (`P-TH-SM-2`) = `194` attempts** — **and the same total in its own
corrected terms: `24 + 4` + `22 + 4` + `56 + 9 + 2` + `16 + 4 + 4` + `24 + 3` + `4 + 2` + `6 + 2` + `6 + 2` =
`194`.** **Every row ≤ `100`** ✔ (`P-TH-TP-1` is the largest at `67`). **Stop-after-5: DECLARED INAPPLICABLE — no
row runs a bounded attempt loop (`§0B` item 1; `§9` item 6).** **The amended total is `194` = `173 + 21`, where the
`21` is the correction drives `A-6` (`+8` + `+8`) + `A-7` (`+4`) + `A-3` (`+1`) — and `194 ≤ 120` is FALSE, so the
register STILL OVERSHOOTS the `≤120` cap.** **This is DECLARED rather than smoothed, with the two routes and the
route taken:**

**⟨AS FILED, KEPT VISIBLE (the superseded figure and its terms, dated with the finding ids its amendment came from):**
*"**`20` (`P-TH-IM-1`) + `26` (`P-TH-IM-2`) + `59` (`P-TH-TP-1`) + `20` (`P-TH-TP-2`) + `26` (`P-TH-TP-3`) + `6`
(`P-TH-IM-4`) + `8` (`P-TH-SM-1`) + `8` (`P-TH-SM-2`) = `173` attempts.** **Every row ≤ `100`** ✔ (`P-TH-TP-1` is the
largest at `59`). **Stop-after-5** ✔. **The total is `173`, and `173 ≤ 120` is FALSE — the register OVERSHOOTS the
`≤120` cap.**"* — **superseded 2026-09-28 by the `A-6`/`A-7`/`A-3` correction drives, and the superseded total stays
visible in BOTH directions (`tests/pd-ui-1-theme-register.test.ts` prints it as the pre-correction reading).⟩**

1. **Why the overshoot exists:** the unit's central claims are quantifications over **four independent
   finite shape sets** (settings, envs, roots, write records) and the cap was authored for a unit with one or
   two such sets. **The overshoot is a design statement, not an arithmetic error**, and the printed total
   equals the sum of its own printed terms.
2. **Route (a) — retire rows to fit the cap: REJECTED.** `PBT-REGISTER-REQUIRED-FOR-CODE-UNITS` makes the row
   count an **OUTCOME, not a budget**, and each of the eight rows is a **distinct property class** (the
   precedence rule · the env reading · totality · write discrimination · fail-soft · vendored-byte
   non-touch · protected-pin safety · token/persistence safety). **Retiring one would leave a property
   unenumerated** — the failure mode the ruling exists to prevent.
3. **Route (b) — keep the rows and declare the overshoot with its terms: TAKEN.** **The unit's DONE row MUST
   print the total `194` with its eight terms and MUST state the overshoot and the route taken** — *"a total
   that is not the sum of its own terms, or a total quoted without its terms, is a review finding"*
   (`REGISTER-ATTEMPT-TOTALS-PRINT-THEIR-TERMS`), and **the honest form of an over-cap register is a declared
   over-cap register.** **Escalated to the architect** as a cap question (`§9` item 5) — **never resolved by
   silently dropping a row or trimming a term.**

**THE DECLARED DIVERGENCE THIS AMENDMENT CLOSES, and the ONE it OPENS — stated so no later pass reads either as an
accident.** **CLOSED:** the spec's `§4` and the executed register now print the **same** eight terms and the **same**
total (`194`); `tests/pd-ui-1-theme-register.test.ts`'s own `§4` arithmetic row already declares this amendment
OWED (*"the SPEC's `§4` table still prints `173` and is SUPERSEDED — the spec is not this unit's write set, so the
divergence is DECLARED here and ESCALATED to the supervisor as the amendment `§4` owes"*), **and this pass lands
it.** **OPENED, and DECLARED:** the same file's **spec-table limbs** were authored against the **superseded** table
— it reads the spec's `§4` cells back and asserts the eight printed counts sum to `173`, names `173` in the file,
and expects four rows whose executed term exceeds the printed one. **Those limbs are now RED BY DESIGN and must be
re-pointed by the pass that owns tests: the asserted total becomes `194`, the `173` reading becomes the SUPERSEDED
one, and the "four rows grew" expectation empties** (no printed term is superseded once the table is truthful).
**A pass that "fixes" this by reverting the spec's table to `173` is re-filing a defect — the table is the
contract, and the test follows it, never the reverse.**

**THE `(bounded)` MARKINGS, and what they do NOT prove.** **`7` of the `8` rows are `NO`** — each drives a
closed enumeration matching its property text exactly — **with one carve-out: `P-TH-SM-2` carries
`(bounded) ON (b)`**, because a **token scan over the unit's write set cannot prove the absence of a store at
runtime** (a store reached through an alias, a computed property or a helper would not be seen). **The bound is
stated, not hidden.** **⟨NOTE 2026-09-28: the count is UNMOVED at `7 NO` + `1 (bounded) ON (b)`, and the marking is
UNMOVED from `P-TH-SM-2` to any other row — no correction in `§0B` item 1 changes a property's quantifier, only the
drives that execute it.⟩**

**Rows considered and REJECTED (recorded so a later pass does not re-add them):**

- *"the vendored module's own name-echo / removal-as-data property"* — **rejected**: that is
  `../Provident-Electron/docs/specs/theme.md` §5.5.1 `P-TH-IM-3`, **the mechanism's own row over bytes this
  unit does not change**; a fork copy would be a property over another repo's artifact.
- *"the fork's `prefersDark` matches a real OS setting"* — **rejected** as **structurally unobservable**
  (`docs/specs/post-division-foundation-adoption-surface.md` §10 `U-8` names exactly this; `RCA-12`).
- *"the applied `data-theme` attribute exists on a real `<html>` and a stylesheet reacted"* — **rejected as a
  node row**: it is a **`[U]`/live** claim (`§7`), structurally unassertable in node (the dom-shim is
  layout-less and CSS-less).
- *"`npm run typecheck` stays at exit 0"* / *"`npm run build` stays at exit 0"* — **rejected as register
  rows**: they are **legs**, not properties (`§6`'s obligations carry them).
- *"`npm run divergence` becomes green"* — **rejected**: it is RED for an **environmental** reason and the fix
  is **another unit** (`R-8`). **A row asserting it would be a false obligation.**
- *"the adapter's removal branch is exercised on a reachable path"* — **rejected**: unreachable by the
  resolver's own domain (`§3.2` item 5); **a row asserting it could only pass by breaking the kept rule.**
- *"the fork's operator settings keep a theme control"* — **rejected**: `§1.3` rules the control **declined**
  by this unit; a row over it would be a row over a deferral.

---

## 5. The layer ledger — what this unit does NOT claim

1. **No app-green, no live-green, no envelope-green-as-app.** No claim in this file is evidence that the
   Electron app boots, renders a themed surface, or that a stylesheet reacted (`RCA-12`; `G-6`).
2. **No `divergence` green.** The leg is RED at this head for an **environmental** reason and is **mandatory
   pre-live** (`R-8`) — a precondition this unit **records and passes through**, never satisfies.
3. **No `battery` claim beyond the recorded reading** — the branch baseline reads **`184 checks, 0 failures`
   (GREEN)** and that is a **HARNESS** reading (`[H]`), **never app-green** (proposal §7.5).
4. **No `battery`/`conformance` claim of this pass's own** — this unit **re-runs each leg and reports its own
   delta** (`§6`); nothing here is a prediction.
5. **No claim that the foundation's `U-THEME` green is app evidence** — inherited **CONTRACT** evidence only
   (`§0`'s inherited-evidence rule).
6. **No claim that the vendored module's behaviour is covered by this repo's conformance leg.** **All fifteen
   vendored modules carry ZERO behaviour evidence** from that leg (`docs/specs/unit-pd-vendor-foundation-mechanisms.md`
   §13.2 `C4`: class (i) is EMPTY; the leg's pass condition is **VACUOUS AS EVIDENCE**), **so `PD-UI-1` is the
   first unit whose rows drive the vendored `theme.ts` at all** — and **that is a strengthening of this
   repo's coverage, not an inheritance of someone else's.**
7. **No OS claim.** The fork's `matchMedia` read is a **claim about this machine**, and the vendored
   `prefersDark` member is a **caller claim about the environment** — **neither is an OS behaviour this
   unit's node rows can observe.**
8. **No store, no persistence and no MCP-surface claim** — this unit adds none and changes none.
9. **No archive claim** (`§1.2` (d); `DECIDED: REBUILD-ARCHIVE-POLICY` governs a **superseded subject**, and
   this unit's landing supersedes **no** behaviour).

---

## 6. The red-set plan (`RCA-1`: red FIRST, RUN, and REPORTED)

**This file authorises no implementation.** The delegation gate (`AGENTS.md` item 9) is satisfied by **this
spec plus a TestWriter red set that has been RUN and REPORTED**.

### 6.1 The red set, in authoring order, and what each row's red LOOKS like

**Pre-red obligations (all must be discharged BEFORE the red is authored):**

| # | Obligation | Owner |
| --- | --- | --- |
| **①** | **The `§9` item 1 pin re-statement is DISPOSED** (re-stated with its shape, or the architect rules an alternative) — **this unit's blocking prerequisite** | the `PD-VENDOR` pin's owning unit + the supervisor + the architect |
| **②** | **The `§1.3` deferral is filed** (a tracker row naming the authored-control unit) | the supervisor's writes |
| **③** | **A baseline reading of `tests/unit-u-shell-2-theme.test.ts` is taken** (its 10 rows' colour at this head) so the split's two halves are distinguishable in the red run | the TestWriter's first run |
| **④** | the unit's **own** new-file name is fixed (so the register's rows have a home) — proposed: **`tests/pd-ui-1-theme-adoption.test.ts`** | the TestWriter |

**A red set authored before ① is a review finding** — not because the red would be wrong, but because the
`PD-VENDOR` pin's red would be **indistinguishable from this unit's own red** in the reported reading.

| Order | The red rows | What their red LOOKS like (the expected failure text) |
| --- | --- | --- |
| **1** | **`P-TH-IM-1`, `P-TH-TP-1`, `P-TH-TP-2`, `P-TH-TP-3`** — the adapter's precedence rule, totality and write discrimination | **they can fail WITHOUT a rendered surface**: `resolveTheme`'s signature is unchanged, so these rows are red only if the **landing changed an observable value** (or, in the red-first order, if the **new delegation rows** are authored against the *current* adapter, which does not import the vendored module — **that is the intended red**: `TypeError: Cannot read properties of undefined` / a `source`-shaped assertion failing, naming the adapter as the site) |
| **2** | **`P-TH-IM-2`** — the env reading is delegated | **red without a rendered surface**: the red drives the **vendored** `resolveTheme` directly (it exists and is green — `O-3` of the Phase-0 spec reads its suite at `46/58` failing **in the conformance leg's mis-placed copy**, which is a *different* file from `src/shared/theme.ts`), and then drives the **adapter's** agreement, which is red until the adapter reads the record |
| **3** | **`P-TH-IM-4`** — the vendored module is consumed, not touched | **red without a rendered surface**: the adapter's import census reads `0` at the red head and must read `1`; **and this is the row whose green REDS `tests/pd-vendor-set.test.ts`** — the expected, escalated collision (`§9` item 1), which the red run must REPORT as a distinct fourth file |
| **4** | **`P-TH-SM-1`, `P-TH-SM-2`** — the pin and token/persistence safety | **red without a rendered surface**: at the red head these read the **pre-landing** tree; they become the unit's regression guard |
| **5** | the `installTheme` **wiring** rows (the `§2.2` items 1/2/4/5/6/7 contract, `[H]`-class source-text + a `renderer.ts` read) | **red without a rendered surface** — a source-text/structural read of `installTheme`'s body. **These do NOT need the live leg.** |
| **6** | **THE LIVE LEG — the rows that NEED it** | **`§7`**: the **only** claims that need the rendered surface are (i) that `document.documentElement`'s `data-theme` attribute **exists and carries the resolved value at boot**, (ii) that an OS-listener `change` under `system` **re-applies** it, (iii) that the token block **causes a visible change** (a computed background differs between the two attributes). **All three are `[U]` — structurally unassertable in node** (the dom-shim is layout-less and CSS-less). **They are authored as live rows, and at this head the pass reports `PRECONDITION-FAILED` with the divergence reading attached** (`§7.2`). |

### 6.2 What the red is NOT

Not a `src/shared/**` byte change (no byte of the vendored set, and none of the four baseline files) · not a
`sibling unit's` cycle (`PD-UI-6` is W1's other row and **shares no cycle** — `RCA-2`/`RCA-5`) · not a fence
edit · not a `vitest.config.ts` or `package.json` edit · not a tracker rewrite · not an archive · not an
edit of **any** existing test file (`§1.4`).

### 6.3 The archive question, answered explicitly

**This unit retires NO test and archives NO file.** The behaviours it changes are the **mechanism** underneath
behaviour that is **kept**: the fork's precedence rule, its write and its fail-soft contract are **preserved**
(`§1.2` (b)/(d)), so `DECIDED: REBUILD-ARCHIVE-POLICY` clause (1)'s trigger — *"when the specs supersede a
test's subject"* — **does not fire**. **The `SPLIT` disposition** (`docs/specs/post-division-test-disposition-2026-09-28.md`
§2 row #1: resolver rows archive, token rows keep) is therefore satisfied **in its intent** by leaving the
file in place as a **regression guard**, adding the delegation rows in the unit's **NEW** file, and stating
the reason. **A DONE row claiming an archive under this unit is a review finding** — and so is a DONE row
claiming the file was *kept* without stating that its resolver rows **pass unchanged** as a **deliberate**
choice rather than an oversight. **The landed before → after READING (`REBUILD-ARCHIVE-POLICY` clause (3)) is
still owed**: files / rows / skips, taken **at the landing** by `npm test`.

### 6.4 The `[T]`-side obligations the red set carries by name

1. **The unit's own test file must NOT mock `'electron'`** (`K-2`; the census pins the exact five-name set).
2. It must not read anything a `G-9` pin freezes (`§3.4` item 8).
3. Its `describe`/`it` titles must be **census-stable** — one row per declared property and one per declared
   term, so a term dropped from the table without a contract amendment is a **loud failure**, never a vacuous
   pass.
4. **The register's terms must be printed as their sums and the total printed with them** (`§4`).

---

## 7. Verification (which leg covers which layer) and the live mandate

### 7.1 The legs, and this unit's obligations

| Leg | What it covers | Layer | This unit's obligation |
| --- | --- | --- | --- |
| **`npm test`** (`vitest run`) | the register's rows, the unit's new rows, and the **unchanged** existing suite | harness/`[T]` | the DONE row prints the **before → after** file/test/skip counts **in the same commit** (`REBUILD-ARCHIVE-POLICY` clause (3)), and **states the delta against the recorded baseline**: at `9202dc8` the supervisor read `204 files (1 failed / 203 passed) · 4384 tests (1 failed / 4338 passed / 45 skipped)` with the **one carried red** being the baseline `PANE-TOGGLE-STAGE-COLLAPSE` (`P-SM-1`, defect `PANE-TOGGLE-STAGE-COLLAPSE`) — **a RECORDED READING quoted as input, not this pass's measurement.** **This unit MAY NOT claim a clean trio while the carried red stands** (`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1)) |
| **`npm run typecheck`** | `tsc --noEmit -p tsconfig.json` — `src/**` only (`tests/` is excluded) | harness | **exit 0**. **The adapter's new import must resolve** — this is the leg that catches a wrong relative path (`../../shared/theme.js`) |
| **`npm run build`** | the bundles | harness | **exit 0**, and the DONE row states **which bundle the adapter now lands in** (before this unit, `src/shared/theme.ts` was in **no** bundle; after it, the vendored module is reachable from the renderer entry through the adapter — **a bundle-census delta this unit must report, not hide**) |
| **`npm run battery`** | `184 checks` at the baseline (`[H]`, GREEN) | harness/`[H]` | **run it and report the reading.** **`A-7`/`G-5`: every UI unit's trio gains `npm run battery`** — the three `.mjs` batteries sit **outside** `vitest.config.ts`'s `include`, so a rebuild that breaks the battery is invisible to the trio |
| **`npm run divergence`** | the real-Electron identity leg | harness/`[D]` | **run it and report the reading.** At this head it is **RED for an ENVIRONMENTAL reason** (`/dev/shm` denial → `SIGTRAP`) and `A-7` makes it **mandatory pre-live**. **This unit does NOT fix it and does NOT claim it green** (`R-8`) |
| **the live battery (`scripts/live-drive.mjs` against a usable display)** | the assembled/rendered surface | assembled/`[U]` | **MANDATORY pre-DONE (`RCA-11`), and it renders a themed surface.** See `§7.2` — and note `G-5`: the live matrix's `MATRIX_ROWS` is **FULL at 8** and **must not change**; a live assertion enters as a **re-pin or an extended row**, never a new slot |
| **`npm run conformance`** | the Phase-0 leg | `[T]`/`[H]` | **NOT this unit's**, and **it carries ZERO behaviour evidence** (`§5` item 6). **No row of this unit may cite it as coverage of the vendored `theme.ts`.** |

### 7.2 THE LIVE MANDATE, and the honest interim state at this head

**This unit renders a themed surface, so the pre-DONE live battery is MANDATORY (`RCA-11`, clause (a)).** The
claims that only a live/assembled pass can take:

| # | The live claim | Why node cannot take it |
| --- | --- | --- |
| **L-1** | `document.documentElement` carries `data-theme` with the **resolved** value after boot | the node dom-shim is layout-less/CSS-less; `dataset` is a shim surface, and **the boot path is the assembled renderer** |
| **L-2** | Under `system`, an OS-preference **change** re-applies the attribute | requires a real `matchMedia` and a real OS flip |
| **L-3** | The token block **reacts** — a computed background differs between `data-theme='light'` and `data-theme='dark'` | requires real CSS resolution + layout |
| **L-4** | The `@media (prefers-color-scheme: dark)` fallback fires when **no** explicit attribute is present | requires a real media-query evaluation |

**THE HONEST INTERIM STATE, recorded rather than smoothed (this is a condition of the entry, not an excuse):**

1. **`npm run divergence` is RED at this head for an ENVIRONMENTAL reason** — the real-Electron leg dies at
   bootstrap with `Creating shared memory in /dev/shm/.org.chromium.Chromium.* failed: Permission denied (13)`
   → `exited with signal SIGTRAP`, surfaced as `electron connect/drive failed: MCP error -32000: Connection
   closed` (`proposal §7.5 item 2`, RECORDED READING). **Its fix is `U-DIVERGENCE-SPAWN`'s** (a harness unit
   touching `scripts/**`, with its own spec `docs/specs/unit-divergence-harness-precondition.md` and its own
   red set). **This unit is NOT that unit.**
2. **Therefore this unit's live pass is reported `PRECONDITION-FAILED` WITH THE DIVERGENCE READING ATTACHED**
   — **never a silent park** (`RCA-11`; `A-7`; `G-5`'s `W6b` clause establishes the form). **The DONE row must
   carry: the command shape attempted, the divergence reading, the `PRECONDITION-FAILED` status, and the
   named owner of the missing leg.** **A DONE row that says "live pending" with no reading attached is a
   review finding.**
3. **Two structural limits, named so no later pass reads them as omissions:**
   - **No live row in the fork's matrix currently reads an applied `data-theme`.** `G-5`'s re-pin list names
     `U-3` (`uf_panes_12`), `U-5` (`uf_layout_10`) and `U-1`/`U-2`/`U-6` as the rows other units rewrite —
     **none of them reads the appearance attribute**, and `MATRIX_ROWS` **must not change**. **So `L-1`..`L-4`
     are owed as an extension of an existing row (or as a `scripts/live-drive.mjs` reading outside the matrix),
     and the choice is the supervisor's, because the matrix's size is pinned.**
   - **`L-4` (the `@media` fallback) is only observable in the window between document load and the boot
     write** — a real, narrow window (`src/renderer/index.html`'s token-block comment says so in its own
     words: *"until the renderer boot applies an explicit attribute"*). **A live pass that misses the window
     must say it missed it**, not report the fallback unexercised.

### 7.3 The `G-1`, EXTENDED baseline this unit's DONE row must state its delta against

**RECORDED READINGS (quoted as input; this pass ran nothing):** `npm test` **one carried red**
(`PANE-TOGGLE-STAGE-COLLAPSE` / `P-SM-1`, an APP/assembled-renderer residual) · `typecheck` **0** · `build`
**0** · `battery` **`184 checks, 0 failures` GREEN** `[H]` · `divergence` **RED on the Electron leg
(ENVIRONMENTAL)** `[D]`. **Every unit's DONE row states its delta against these five legs and may not claim a
clean trio** (`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1)).

---

## 8. Decisions and defaults (recorded, so no later pass re-derives them)

| # | Decision | Default taken |
| --- | --- | --- |
| **D-1** | Where the adapter lives | **the EXISTING `src/renderer/theme.ts`** — no new module, no new file (`§0A` note 1) |
| **D-2** | How the vendored module is obtained | **by `import` from the adapter** (`src/shared/theme.ts`, the Phase-0 bytes). **Never edited, never copied, never re-vendored, never shadowed by a local duplicate** (`R-4`/`R-6`) |
| **D-3** | The fate of `tests/unit-u-shell-2-theme.test.ts` | **KEPT AS A REGRESSION GUARD, never archived** (`§6.3`); the delegation rows land in a **NEW** file. **The landed before → after reading is still owed** |
| **D-4** | The persisted `theme` field and the store | **UNTOUCHED** (`R-5`) — and **nothing is written back on the theme path** (`§4` `P-TH-SM-2` (c)) |
| **D-5** | Whether `resolveTheme`'s signature/return type may change | **NO.** `resolveTheme(setting: unknown, prefersDark: boolean): ResolvedTheme` is the contract; **`ResolvedTheme`/`ThemeRoot` stay exported by name** (`§1.2` (d)) |
| **D-6** | Whether the adapter may expose `ThemeResolution`/`source` | **NO** in this unit — the four exports stand (`§2.1`); the observability question is an **owed item** (`§9` item 4) |
| **D-7** | Whether this unit authors the appearance control | **NO — DECLINED, with the named deferral** (`§1.3`) |
| **D-8** | Whether this unit writes a new `docs/decisions.md` row | **NO.** Every clause here derives from an existing row or from the gate record |
| **D-9** | Whether this unit edits `docs/skills/designing-pages.md` | **NO — the file DOES NOT EXIST in this repo** (VERIFIED-BY-READ: a glob of `docs/skills/*` returns `process-guardrails.md` alone), so there is **no test-use-case coverage matrix and no demo-page index to update**. **This unit renders a themed shell surface but authors NO page and NO UI element** (`§1.3`), so the honest form of that row is an **ABSENCE row** — recorded at `§9` item 6 |
| **D-10** | Whether the register's row ids use a bare `P-SM-` prefix | **NO** — every row carries the unit token (`P-TH-SM-1`/`P-TH-SM-2`) because a bare `P-SM-1` **already names the carried baseline red** (`§4`'s machinery note) |
| **D-11** | Whether the register may overshoot the `≤120` cap | **YES, DECLARED, with its terms and its route** (`§4`; `§9` item 5). **The figure is `194` since the 2026-09-28 amendment (`§0B` item 1); the as-filed `173` is kept visible at `§4`** |
| **D-12** | **⟨ADDED 2026-09-28 (`A-7`)⟩** What "honouring" the write record's `removal` member means | **THE ATTRIBUTE IS REMOVED.** The alternative reading — *"perform no write, leave a pre-existing attribute in place"* — is **REJECTED as a third outcome the record does not declare**. **Consequence: a `HOST-FIX` on `src/renderer/theme.ts` → `applyThemeToRoot` is OWED** (`§0B` item 2; `§9` item 1 item (e)) |
| **D-13** | **⟨ADDED 2026-09-28 (`A-8`)⟩** Whether any register row is generator-backed, and whether the caps/stop rule govern | **NO row is generator-backed; the terms are EXACT in-row counts; the seed/LCG remain as the register's own determinism check; and `≤100`/`≤120`/`STOP AFTER 5 CONSECUTIVE FAILURES` are DECLARED INAPPLICABLE (no bounded attempt loop exists).** The rule and the seed **stay in the contract** (`§0B` item 1; `§9` item 6) |
| **D-14** | **⟨ADDED 2026-09-28 (`A-11`)⟩** Whether the returned resolution is the liveness input | **NO — the predicate stays SETTING-based and `apply()` discarding the return is CORRECT.** The return contract itself is unmoved (`§0B` item 3; `§2.2` item 4) |

---

## 9. Owed items and escalations (recorded, never hidden)

1. **`E-1` [BLOCKING FOR THIS UNIT'S LANDING] — `PD-VENDOR`'s "THE VENDORING IS INERT" PIN MUST BE RE-STATED
   IN THE SAME COMMIT AS THIS UNIT'S ADAPTER.** **This is a NEW contradiction, found by this pass
   (`§0A` note 2), and it is filed with its evidence rather than absorbed:**
   - **The pin:** `tests/pd-vendor-set.test.ts`, the row titled *"§2.1 item 6 / §5 item 5 / §12.3(c) — NO
     vendored module is imported by this repo today: the hit set is **EXACTLY the three stem-collision sites**,
     and NONE resolves to a vendored member"*. It derives every `src/**` specifier hit matching
     `from '[^']*<name>\.js'` over the fifteen names (excluding `/shared/`), maps each hit to the path it
     **resolves** to, and asserts the **exact sorted three-element array**
     `['src/renderer/renderer.ts ./pane-gutter.js', 'src/renderer/renderer.ts ./theme.js',
     'src/renderer/sidebar-panes.ts ./pane-gutter.js']`, plus that no hit resolves to a vendored member.
   - **The falsification:** this unit's adapter imports the vendored module, so
     `src/renderer/theme.ts`'s own specifier becomes a **fourth hit** — and it **resolves to a vendored
     member**, which is the pin's second assertion. **The adoption's first consumer edge falsifies both
     limbs of a Phase-0 pin.**
   - **(a) Why this is not a re-opening of a settled adjudication:** the pin asserts a **fact about the tree**
     (*"no vendored module is imported by this repo today"*) which is **true at `9202dc8` and false at this
     unit's landing**. Its own row title carries the Phase-0 spec's `§12.3(c)` remand, and the Phase-0 spec
     says the clause's *"satisfiable form is a REMAND to the TestWriter"*. **Re-stating a pin whose subject a
     later unit's landing changes is the pin's own maintenance route — not a relaxation.**
   - **(b) The re-statement shape this unit requests (never performed here):** keep the derivation, and change
     the assertion from **"the hit set is exactly three"** to **"the hit set is exactly the declared set of
     `(file, specifier)` pairs, and every hit that resolves to a vendored member is one the RE-POINTED
     CONSUMER's own edge, named per row"** — i.e. an **explicit allow-list of consumer edges** that grows by
     one row per adopting unit, with the vendored member it targets named. **The two limbs stay
     distinguishable: a hit that resolves to a vendored member and is NOT on the list still fails.** **The
     rejected alternative — evading the static form with `await import(...)`/`require(...)`/a `new URL(...)`
     indirection — is refused with its reason (`§0A` note 2): those forms match no pattern in the pin, so they
     would make the pin green by hiding the very edge it exists to declare.**
   - **Owner:** the `PD-VENDOR` pin's owning unit + the supervisor (the same-commit amendment) + **the
     architect, if the re-statement is read as a `G-9`-class pin change.** **Until it is disposed, this unit's
     landing would leave one red file whose cause is correct and whose fix is not this unit's to author.**
   - **(e) ⟨ADDED 2026-09-28 (`A-7`), and it is the SECOND host item this unit's landing owes: the
     `§0B` item 2 RULING makes the landed adapter's removal arm DIVERGENT (`src/renderer/theme.ts` leaves a
     pre-existing `data-theme` in place where the record declares the attribute removed), so a `HOST-FIX` on
     `src/renderer/theme.ts` → `applyThemeToRoot` is OWED in the SAME pass as the `A-7` tripwire's
     replacement, and the `tests/pd-ui-1-theme-adoption.test.ts` `⟨A-7 + A-2⟩ P-TH-TP-2` row's two limbs are
     RED BY DESIGN until both land. Owner: the next `PD-UI-1` landing pass (Implementer) + the pass that owns
     tests. This is a HOST item, NOT a foundation gap: the foundation DOES settle the record's meaning
     (`§0B` item 2 cites it), and no `docs/defects.md` → `docs/HANDOFF.md` row is owed for it.⟩**
2. **`E-2` — THE FOUNDATION IS NEVER PATCHED (`R-10`), and this unit has no foundation gap to hand off.** The
   vendored `theme.ts` is read this pass and its contract holds (`§3.1`); **no defect row is owed by this
   unit.** *(`docs/specs/post-division-foundation-adoption-surface.md` §7's `G-1`..`G-12` findings are other
   rows', and none lands in `theme.ts`.)* **If a red row discovers a genuine foundation-side contradiction, it
   becomes a `docs/defects.md` → `docs/HANDOFF.md` row — never an absorbed divergence.**
3. **`E-3` — THE `U-THEME-CONTROL` DEFERRAL NEEDS A TRACKER ROW AND AN OWNER.** `§1.3` rules the control
   **declined by this unit** and names the deferral (a new row — proposed id `PD-THEME-4` — whose allowed
   surface includes `src/renderer/sidebar-panes.ts` → `settingsContent()` and a `registerHandlerDef` entry).
   **Owner:** the architect (does the row exist and what is its wave?) + the supervisor (the tracker row).
   **`UNVERIFIED`: whether the control is required at all** — what would settle it: that ruling.
4. **`E-4` — THE `source` DISCRIMINATOR IS READ BUT NOT OBSERVABLE.** The vendored record's `'env'` /
   `'degraded-env'` member distinguishes a real `prefersDark: false` from an absorbed one; **this unit's
   adapter reads it and exposes nothing** (`§1.2` (d)). **Owner:** the architect (whether the fork's
   appearance surface should report the degradation) — **`UNVERIFIED` today, and deliberately NOT resolved
   here, because changing the adapter's return type would break the kept surface (`D-5`).**
   **⟨NARROWED 2026-09-28 (`A-11`, `§0B` item 3; VERIFIED-BY-READ): the unobservability is now DOUBLE — the
   `source` member is read-and-not-exposed, AND the `applyThemeToRoot` RETURN has NO consumer anywhere in
   `src/**` (the wiring's `apply()` discards it), so no fork-side surface consumes the adapter's resolution
   either. The owed item is unchanged and its owner is unchanged; what is added is the second, measured reason
   it cannot be observed today.⟩**
5. **`E-5` — THE REGISTER OVERSHOOTS THE `≤120` CAP AT `194`.** Declared with its terms and its route
   (`§4`). **Owner:** the architect (a cap question for a four-shape-set unit). **Never resolved by dropping a
   row or trimming a term.** **⟨AMENDED 2026-09-28 (`§0B` item 1): the figure was `173` as filed and the
   corrected, executed total is `194` = `28 + 26 + 67 + 24 + 27 + 6 + 8 + 8`; the superseded `173` stays
   visible at `§4`, and `194 > 120` is still the declared overshoot — the ITEM does not change, only its
   figure.⟩**
6. **`E-6` — `docs/skills/designing-pages.md` DOES NOT EXIST IN THIS REPO.** VERIFIED-BY-READ this pass. **No
   coverage-matrix row and no demo-page entry is owed by this unit; the honest form is this absence row**
   (`D-9`). **This unit authors no page and no UI element** (`§1.3`), so even a written skill would not be
   touched.
   **⟨NOTE 2026-09-28 (`A-8`'s declared choice, `§0B` item 1): this amendment does NOT re-open this row. What
   it clarifies is the register's MACHINERY — the `STOP AFTER 5 CONSECUTIVE FAILURES` rule stays IN the
   contract (`§4`'s machinery block) and is DECLARED INAPPLICABLE to this register because NO row runs a
   bounded attempt loop for it to govern; the seed (`0x20260928`) and its hand-rolled LCG also stay, exercised
   as the register's OWN determinism check and governing no row's attempts. A later pass may NOT delete the
   rule or the seed from `§4` — it may only carry this declaration.⟩**
7. **`E-7` — EVERY `UNVERIFIED` ITEM OF THIS FILING, named so none is read as settled:**
   - whether the `§9` item 1 pin re-statement is a **unit-commit** act or an **architect** act — what would
     settle it: the architect's read of its `G-9`-class status;
   - whether `tests/unit-u-shell-shell-wiring.test.ts`'s **source-text pin over `renderer.ts`** reds on a
     theme-only body change — what would settle it: the unit's own **reported red set** (`§3.4` item 5);
   - whether **any other test file** imports the fork's `theme.js` — **MEASURED this pass at the search level**
     (`tests/**` contains exactly one `import` of `src/renderer/theme.js`,
     `tests/unit-u-shell-2-theme.test.ts`; the only other `theme.js` mentions in `tests/**` are
     `tests/pd-vendor-set.test.ts`'s prose and control corpora, which are **not imports**) — **but the
     `X-3` ledger's `M-static` reading is the authority, and this pass did not re-run its exact command**;
   - whether the **applied-`data-theme`** live claim can be carried inside the frozen `MATRIX_ROWS` at all
     (`§7.2` item 3);
   - the **`@media` fallback window's** observability in a live run (`§7.2` item 3);
   - **⟨ADDED 2026-09-28 (`A-7`, `§0B` item 2): whether `dataset`-level deletion is the correct REMOVAL mechanic
     against a REAL `DOMStringMap`.** The ruling fixes the record's MEANING; **the mechanic the owed `HOST-FIX`
     uses to remove the attribute is not settled by any record this pass read.** The landed test's own DELETE
     corpus expresses the removal as a `dataset`-key deletion, and **the adapter's `ThemeRoot` type is
     `{ dataset: { theme?: string } }`** — **what would settle it: the live pass (`[U]`), where a real
     `document.documentElement.dataset` can be driven and the attribute's ABSENCE observed.**
   - **⟨ADDED 2026-09-28 (`A-7`, `§0B` item 2): whether a spec-only amendment is admissible for a HOST-fix that
     no reachable path can drive.** This filing rules the semantics and names the fix; **whether the fix may land
     alone (with its row being the injected-record drive) or must wait for a reachable removal path is the
     architect's call** — what would settle it: that ruling.
   - **⟨ADDED 2026-09-28 (`§0B` items 2/3): whether the two RED-BY-DESIGN test limbs (the `A-7` tripwire's two
     limbs, and the register test's superseded spec-table limbs) are repaired in ONE pass or in two.** Both are
     `[T]`-side reconciliations to this amendment; **what would settle it: the supervisor's pass split** — neither
     is performed by this doc pass.
8. **`E-8` ⟨ADDED 2026-09-28 (`A-2`/`A-4`; `§0B` item 4)⟩ — THE MECHANISM DECISION IS AN OPEN ARCHITECT
   QUESTION, RECORDED WITH BOTH OPTIONS AND NEITHER PICKED.** **The measured fact:** the adversarial audit's
   literal recipe **`vi.mock('../src/shared/theme.js', …)`** was **measured to red the frozen
   `tests/pd-vendor-set.test.ts` `A-12` census**, which pins an **EXACT set of FOUR non-electron mock binders** —
   the literal recipe **adds a FIFTH**. **The substitution the remand took instead:** compile **the landed
   adapter's own bytes** with **only its import declaration replaced by a stub bind** — the same discrimination,
   **no pin touched**.
   - **(a) keep the literal `vi.mock` recipe** and **amend the `A-12` census to admit a fifth binder** — **cost: a
     PIN CHANGE with its OWN GATE** (a frozen, independently-owned pin moves). **Buys:** the standard,
     readable vitest instrumentation applied to the real import edge rather than to a compiled copy of the bytes.
   - **(b) the compile-the-adapter-bytes substitution as the PERMANENT shape** — **cost: distance from the runtime
     form** (the instrument reads an instantiated copy with a substituted import declaration, one step away from
     the module graph vitest resolves, so a future resolver/bundler change would not be caught by it).
     **Buys:** **no pin touched and no gate opened.**
   - **THE TRADEOFF IS STATED AND NOT PICKED.** **Owner: the architect.** **A pass that picks one without that
     ruling is choosing a pin's fate, which is not this unit's to choose.**
9. **`E-9` ⟨ADDED 2026-09-28 (`§0B` item 1)⟩ — THE REGISTER TEST'S SPEC-TABLE LIMBS ARE NOW RED BY DESIGN AND
   NEED RE-POINTING (a `[T]`-side act, never this pass's).** `tests/pd-ui-1-theme-register.test.ts`'s `§4`
   arithmetic row reads the spec's `§4` cells back; it asserts the eight printed counts **sum to `173`**, that the
   spec file matches **`` `173` attempts ``**, and that **the executed term EXCEEDS the printed one for exactly
   four rows**. **This amendment makes all three of those readings the SUPERSEDED ones** — the printed counts now
   sum to **`194`**, and no printed term is superseded once the table is truthful. **Owner: the pass that owns
   tests (TestWriter/remand), SAME pass as `§9` item 1 item (e)'s host fix.** **The re-pointing is a
   reconciliation to the amendment, NOT a relaxation: the truthfulness assertion (every cell = the sum of its own
   factors; the total = the sum of the terms) stays, and the `173` reading becomes the SUPERSEDED one it is.**
   **A pass that reverts the spec's table to `173` to keep these limbs green is RE-FILING the defect this
   amendment closes.**

---

## 3a. Adversarial findings — **THE PASS HAS RUN (2026-09-28): `PASS-WITH-FINDINGS`, thirteen findings (`A-1`..`A-13`), NO BLOCKING. The seed set below STANDS as filed, each probe dispositioned here.**

**The pass was `role_adversarial_reviewer`, read-only, and it also performed the mandatory read-only PBT audit.** Its verdict, quoted: *"No BLOCKING finding: the precedence arms win in every input I could construct by reading (strict identity only), the adapter is total for every hostile shape I could construct, there is exactly one write site and one reading of the OS value, and no vendored byte differs from the foundation. The HIGH findings are vacuous/false-strength test oracles, not behaviour regressions."*

**WHAT IT RE-DERIVED AND CONFIRMED — THE GATE'S DECISIVE CLAUSES REPRODUCE (`A-13`, recorded NOT-A-FINDING):** the explicit `'light'`/`'dark'` arms win for every `setting` value it could construct (**including `'system'`, `''`, `null`, numbers, a `Symbol`, objects, a `Proxy`, a **revoked `Proxy`**, and hostile `toString`/`valueOf`**); the adapter **throws for no root shape** it could construct (`null`, `undefined`, a primitive, a missing/frozen/throwing `dataset`, a revoked-proxy root); the OS value has **exactly ONE strict reading** (`resolution.prefersDark === true`, with no `Boolean(...)`, no `!!` and no leftover truthiness test — so there is **no second authority**); there is **exactly ONE write site** naming `dataset.theme` in `src/**`; the adapter's import census is **exactly one statement**, resolving to the vendored member; the vendored bytes are **unchanged**; and the **pd-vendor allow-list cannot be widened by an implementation** (an un-listed consumer edge and a non-member barrel are both still caught).

### The findings, with dispositions

| Id | Sev | The finding (abridged) | Disposition | Correction |
| --- | --- | --- | --- | --- |
| **`A-2`** | **HIGH** | **THE ADOPTION'S ENV-READING DELEGATION IS BEHAVIOURALLY UNOBSERVABLE.** The mechanism's `prefersDark` is by construction equal to the raw `=== true` reading for **every** input, so no behavioural row can distinguish *"reads the returned record"* from *"applies the same strict test to the raw argument"*; its only discriminators are a dead-read-satisfiable regex (`/\.prefersDark\b/` is satisfied by `void resolution.prefersDark`) and an import census satisfied by an unused import | **TEST-DEFECT** (+ SPEC-AMBIGUITY: `ADV-T4`'s probe is weaker than its property) | **mock `../src/shared/theme.js`** so `resolveTheme` returns `prefersDark: !raw` and `applyThemeDeclaration` returns a `value` ≠ the resolution, then require the adapter to follow the RECORD — a real negative generator; the bridge-mock census is untouched |
| **`A-1`** | **HIGH** | **THE BYTE-IDENTITY PIN-SAFETY LIMBS ARE VACUOUS FOR A COMMITTED CHANGE**: `P-TH-SM-1 (f)`/`P-TH-SM-2 (c)` assert `git status --porcelain -- <paths>` is `''`, and a CLEAN COMMITTED tree yields `''` for **any** committed content, so only an uncommitted edit can fail them | **TEST-DEFECT** | pin a **recorded digest per file** (the `P-TH-IM-4 (a)` manifest pattern) or read a commit range, and add a control that a committed change fails |
| **`A-3`** | **HIGH** | **`P-TH-TP-3`'s "no write is observed" limbs ASSERT AN ARRAY THE TEST CREATED**: the frozen and absent/throwing root shapes are handed `writes: []` as a literal, so `expect(writes).toEqual([])` cannot fail | **TEST-DEFECT** | make the failing shapes observable — a **recording `Proxy` over a frozen target** whose `set` trap records the attempt and still throws (absorbed) |
| **`A-4`** | MED | *"the write is the RECORD's decision"* is **not discriminating**: on every reachable call `write.value === resolved`, and the oracle compares the observed write to a value the TEST computed, so an adapter writing `resolved` and ignoring the record passes all 16 observations | **TEST-DEFECT** | an **AST oracle** over synthetic corpora requiring the assignment's RHS to be the record's `value` member (rejecting an `resolved` RHS), plus `A-2`'s mocked-record probe |
| **`A-5`** | MED | `P-TH-IM-2`'s **counted domain is not its declared domain** (the declared 11 include a genuine own accessor, but the slice counts `42` and `'x'` instead and drops it; driven 24 against a declared 22), and its *"adapter AGREES"* limb asserts `f(x) === f(x)` — a tautology | **TEST-DEFECT** | count exactly the declared set with the accessor included; replace the agreement limb with `A-2`'s mocked-record probe |
| **`A-6`** | MED | **no row drives `setting === ''` or a boxed `String`** — though this spec's own `§2.1` clause 3 names `''` **first**, and a boxed string is the canonical *"looks explicit but follows the OS"* case | **TEST-DEFECT** | add `''` and `new String('light')`/`String('dark')` to the grid and the hostile list |
| **`A-7`** | MED | **the `removal` branch is claimed "implemented and honoured" but is NEITHER DRIVEN NOR DEFINED**: the row asserts only a source regex, and the landed honouring is *"skip the write"*, which leaves a pre-existing `data-theme` in place — **not** the mechanism's declared *"no appearance attribute"* | **SPEC-AMBIGUITY + TEST-DEFECT** | **rule in `§2.1` item 3 whether honouring means SKIP or DELETE**, then drive it with `A-2`'s mocked record and require a *"writes `''`"* corpus to fail |
| **`A-8`** | MED | **the register's declared generator machinery is UNIMPLEMENTED**: the seed's LCG is exercised only in the arithmetic block, **no register row carries a generator**, the stop-after-5 rule exists only as a comment (so *"not triggered"* is uninformative), and two terms do not match what runs (`P-TH-IM-2` 22 vs 24; `P-TH-TP-3` printed 12, run 16, asserted `>= 24`) | **SPEC-AMBIGUITY + TEST-DEFECT** | state plainly that **no row is generator-backed**, or draw the LCG in the rows whose property quantifies over shapes; implement or delete the stop rule; make every term an **exact** count |
| **`A-9`** | MED | **the spec's census spelling was still wrong** (`../../shared/theme.js` escapes `src/`) and both test files claim it was *"recorded as a nit in §2.1"* — but **`§2.1` was never amended**, so the allow-list held a spelling no correct adapter can use | **HOST-FIX** | **DONE in this pass** — `§2.1` carries a dated correction beside the as-filed text; the two stale comments are owed to the remand |
| **`A-10`** | LOW | **gate/reporting artifacts absent**: no `*-greens.md` for the unit, no landing DONE row, and the *"109/109"* figure is not derivable from the two files the pass read (it is **109 = 18 + 22 + 69** across the unit's two files **and** the re-stated pd-vendor row) | **REPORTING (supervisor)** | name the 109-composition; file the blind-greens artifact; record the DONE row with its layer and the `PRECONDITION-FAILED` live reading |
| **`A-11`** | LOW | **`§2.2` item 4's parenthetical** (*"the `applyThemeToRoot` return feeds it"*) is **falsified by the landing** — `installTheme`'s `apply()` discards the return, so it has **no consumer in `src/**`**, and the liveness predicate re-tests the setting | **SPEC-AMBIGUITY** | rule whether the return **is** the liveness input (then use it) or the predicate stays setting-based (then fix `§2.2` item 4 and the adapter's comment) |
| **`A-12`** | LOW | **the pin verifies an EDGE, never that the imported member is USED** — an unused binding or a `void` reference satisfies it (the barrel and evasion routes ARE caught) | **TEST-DEFECT** | AST-assert the imported member appears in a **value-bearing, non-`void`** position |

### THE STRONGEST FALSE-GREEN THE PASS CONSTRUCTED (kept verbatim in substance)

*An adapter that imports the vendored module once and calls it, then **discards the returned record's members** (`void resolution.prefersDark`, `void write.removal`), derives the OS arm from the **raw argument** with the same `=== true` test, and writes `resolved` instead of `write.value` — while keeping the fork's precedence arms and its total/fail-soft shape. Because the mechanism's `prefersDark` is definitionally equal to the raw strict reading for every possible input, and because `write.value === resolved` on every reachable call, this implementation is **behaviourally indistinguishable** from the intended one: it satisfies the import census, the pd-vendor allow-list, both source-token probes and **all 109 rows** — while the adoption's substance is entirely absent. Only a **mocked-record generator** (`A-2`/`A-4`) would falsify it.*

### The PBT audit (read-only — NO generator was run) and its verdict on the register

**Arithmetic: CORRECT as printed.** The printed totals equal the sum of their own printed factors row by row (`16+4`, `22+4`, `48+9+2`, `16+4`, `24+2`, `4+2`, `6+2`, `6+2`), every row is ≤100, the aggregate `173 = 20+26+59+20+26+6+8+8`, and the `173 > 120` overshoot is declared. **WHAT IS NOT REAL IS THE GENERATOR FRAMING:** **no row carries a generator**, the pinned LCG is exercised only in the arithmetic block, the stop-after-5 rule is **unimplemented (a comment only)**, and the executed counts differ from the declared terms in `P-TH-IM-2` (22 vs 24) and `P-TH-TP-3` (printed 12, run 16, asserted as a floor). **The terms are drive/assertion counts over closed hand-picked tables, not PBT attempts.** **Over-strength rows:** `P-TH-IM-2` (a tautological agreement limb), `P-TH-TP-2` (the write/record discrimination is not discriminating), `P-TH-TP-3` (two limbs assert a hard-coded `[]`), `P-TH-SM-1 (f)`/`P-TH-SM-2 (c)` (vacuous on a clean committed tree), `P-TH-IM-4 (c)` (regex-only). **The negative generators tasked to the TestWriter:** the **mocked-record** generator (`A-2`, record `prefersDark` inverted against the raw argument); the **RHS AST oracle** (`A-4`); the **recording-Proxy root** (`A-3`); **per-file digest constants** (`A-1`); and the `''` + boxed-`String` shapes (`A-6`).

**PACKAGE / FOUNDATION DEFECTS: NONE.** The pass read the foundation's `resolveTheme`/`applyThemeDeclaration`/`envReading`/`strictReading` and found the resolver total for null/non-object/missing/inherited/trap-only-Proxy/non-boolean/throwing-accessor/revoked-Proxy environments and the applier total for `''`/non-string/omitted inputs — **no `docs/defects.md` → `docs/HANDOFF.md` row is owed by this unit.**

**⟨RECONCILED 2026-09-28 BY THE GATE-4 REMAND AMENDMENT (`§0B` items 1/2; the audit paragraph ABOVE is KEPT as the
gate-4 pass's own reading and NONE of it is rewritten):** **(i) THE ARITHMETIC MOVED** — the executed and now-declared
total is **`194` = `28 + 26 + 67 + 24 + 27 + 6 + 8 + 8`**, with the audit's `173` kept visible as the superseded
figure (`§0B` item 1, `§4`). **(ii) THE GENERATOR FRAMING IS NO LONGER A DEFECT BUT A DECLARED CHOICE** — `A-8`'s route
(i): **NO row is generator-backed**, the terms are **EXACT in-row counts**, the seed/LCG stay as the register's own
determinism check, and the caps + the stop rule are **DECLARED INAPPLICABLE** (`§0B` item 1; `§9` item 6). **(iii) THE
TWO MISCOUNTED TERMS ARE CLOSED BY EXACTNESS** — the remand's `REGISTER_TERMS` asserts each printed count EXACTLY, so
the *"`P-TH-IM-2` 22 vs 24"* and *"`P-TH-TP-3` printed 12, run 16, asserted as a floor"* readings are the filed ones
and are superseded. **(iv) THE FIVE NAMED NEGATIVE GENERATORS WERE AUTHORED — EXCEPT ONE, WHICH IS THE OPEN
QUESTION** — the mocked-record generator is the item `§9` item 8 records as an OPEN ARCHITECT QUESTION (the literal
`vi.mock` recipe reds a frozen pin's `A-12` census; the remand's substitute compiles the adapter's bytes with the
import declaration replaced). **(v) THE `removal` HALF OF THE STRONGEST FALSE-GREEN IS NOW RULED, NOT MERELY DRIVEN**
— `§0B` item 2 rules what honouring the record means and owes the adapter a `HOST-FIX`.⟩**

**`RCA-3` compliance: the pass HAS RUN and its findings are recorded here; the test-side corrections go to a one-pass remand, `A-9`'s spec fix landed in this pass, and the reporting items (`A-10`) are the supervisor's.**

---

## 3a-seed. The seed table (as filed — kept visible; every probe is dispositioned above)

`RCA-3` requires a read-only adversarial pass per completed unit, its findings recorded here. **This spec has
run none — it authorises no implementation, and the pass runs AFTER the green.** **The seed set below is the
spec's own pre-committed probe list; a probe that finds a genuine defect in the PACKAGE or the FOUNDATION is a
`docs/defects.md` → `docs/HANDOFF.md` row, never a local patch (`R-10`).**

| # | The adversarial probe (each is a question to FALSIFY, not a claim) |
| --- | --- |
| **`ADV-T1`** | **Is the precedence rule silently gone?** Construct the strongest false-green: delete `resolveTheme`'s explicit arms and delegate straight to the vendored resolver's `prefersDark` member. **Probe: require `resolveTheme('light', true) === 'light'` and `resolveTheme('dark', false) === 'dark'` to FAIL it** — this is `C-1`/`V-1`'s exact scenario, and **every pure-layer row must catch it**. |
| **`ADV-T2`** | **Is the write observed, or only returned?** A landing that returns `applyThemeDeclaration`'s record **without performing the write** keeps every value-row green while the app never themes. **Probe: assert the root's `dataset.theme` member after the call, and require the record-only corpus to FAIL.** |
| **`ADV-T3`** | **Is `'system'` smuggled in as a third state?** A landing that returns `'system'` (or a richer record) for a `system` setting would pass a domain check written loosely. **Probe: require the return to be a member of the closed two-member domain in every cell, and require a three-state corpus to FAIL.** |
| **`ADV-T4`** | **Is the env reading re-implemented instead of delegated?** A landing that keeps a local `env` read (or re-derives `prefersDark` from a `matchMedia` inside the adapter) satisfies the fork's outcome while ignoring the adoption. **Probe: require the adapter's import census to read exactly one statement resolving to `src/shared/theme.ts` AND require a corpus with zero imports to FAIL `P-TH-IM-4`.** |
| **`ADV-T5`** | **Is a vendored byte edited to make a row pass?** The cheapest way to "fix" a mismatch is to change `src/shared/theme.ts`. **Probe: re-read its digest against `vendor/foundation.lock.json`'s `theme` entry and against its recorded pre-vendoring blob AFTER the landing, not before** (`P-TH-IM-4` (a)). |
| **`ADV-T6`** | **Does the adoption smuggle a store or a persistence write?** A landing that "remembers" the resolved theme, or writes `theme` back through `operatorSettings.set`, would pass the value rows while adding a store — which is a **new gate** (`R-5`). **Probe: scan the unit's write set for a store token and for a write-back call, and require a synthetic write-back corpus to FAIL** (`P-TH-SM-2` (b)/(c)). |
| **`ADV-T7`** | **Is the `PD-VENDOR` pin evaded rather than re-stated?** **Probe: read the adapter's import statement's FORM.** A `await import(...)`, a `require(...)`, a `new URL(...)`+`fileURLToPath` indirection, a re-export barrel, or an indirect path through a third module **all match no pattern in the pin** and would make it green while the consumer edge is real. **The finding is the form, and the remedy is the `§9` item 1 re-statement — never a spelling change.** |
| **`ADV-T8`** | **Does the register's `173` survive its own terms?** Re-add the eight printed terms and re-check every row's ≤100 and the stop-after-5 rule. **Probe: a term that does not equal the sum of its own factors, or a total quoted without its terms, is the finding.** |
| **`ADV-T9`** | **Is a `G-9` pin red silently "fixed"?** The cheapest green for a source-text pin is to edit the pin. **Probe: read `tests/unit-v5-migration-contract.test.ts`, `vitest.config.ts` and `package.json` for edits after the landing; a pin edit is a `BLOCKING` finding.** |
| **`ADV-T10`** | **Does the adapter's `removal` branch lie?** A landing that implements the removal branch as *"remove the attribute"* on a **root it does not own**, or that reports `removal: true` from the **reachable** path, is a divergence from the vendored contract. **Probe: require the reachable path to write `write.value` in every cell AND require the injected `removal: true` record to be honoured** (`P-TH-TP-2`). |
| **`ADV-T11`** | **Is the live mandate quietly dropped?** **Probe: read the DONE row.** A live row reported *"pending"* with **no divergence reading attached**, or an `L-1`..`L-4` claim asserted from a node green, is a `BLOCKING` finding (`RCA-11`; `§7.2`). |
| **`ADV-T12`** | **Is the `U-THEME-CONTROL` deferral a silent park?** **Probe: read the tracker.** A deferral with no owner and no named constraint is the failure mode `§1.3` exists to close. |

## 3b. The adversarial pass's disposition table — **the SHAPE this contract will be reconciled to**

| Column | What it carries |
| --- | --- |
| `id` | `ADV-T-n` |
| `severity` | `BLOCKING` · `HIGH` · `MEDIUM` · `LOW` |
| `class` | `ADOPTION-FIDELITY` · `INSTRUMENT` · `PIN-SAFETY` · `LAYER` · `REPORTING` |
| `owner` | `IMPLEMENTER` · `TESTWRITER` · `SUPERVISOR` (a tracker row) · `ARCHITECT` (a ruling) |
| `status` | `LANDED` · `REPORTED` · `ESCALATED` |
| `fix-shape` | the least change that makes the probe fail loudly, or the escalation with its reason |

**A finding that requires editing a vendored module is NOT fixable here** — it is an `ARCHITECT` escalation or a
`docs/defects.md` handoff. **A finding that requires editing a `G-9`-pinned file is an `ARCHITECT` escalation,
full stop.**

---

## 10. Report to the supervisor (what this spec's landing pass must be able to say)

1. **The two spec artifacts** — `docs/specs/unit-pd-ui-1-theme.md` (this file) and
   `docs/specs/pd-ui-1-adoption-dossier.md`.
2. **The scope decision, in one paragraph** — what is adopted (the declaration + the env reading), what is
   kept as the adapter (the precedence rule, the `matchMedia` read, the one `dataset.theme` write, the token
   block, the persistence), and **what is deleted (nothing)** (`§1.2`).
3. **The `U-THEME-CONTROL` ruling and its evidence** (`§1.3`) — **DECLINED by this unit, deferred with a named
   owner and a named constraint**, on four reasons and four readings (`E-1`..`E-4`).
4. **The register** — **`8` rows** (the cap, FULL), **`194` attempts printed with its eight terms `28 + 26 + 67 +
   24 + 27 + 6 + 8 + 8`** (the superseded `173` and its terms kept visible, dated, with the finding ids
   `A-6`/`A-7`/`A-3` — `§0B` item 1), the declared **over-cap** and the route taken, the **`A-8` declared choice**
   (no generator-backed row; the caps and the stop rule INAPPLICABLE), and the one `(bounded)` carve-out (`§4`).
5. **The dossier's status tally** — the number of `defined` rows, and **every `undefined-until-answered` row
   named as an escalation** (the dossier's own §1 tally).
6. **The collision block's outcome** — every hit reconciled **by row id**, or none (the dossier's §2).
7. **The protected pins touched, and their same-commit re-derivation** (`§3.4`, `§9` item 1) — **including the
   one pin this unit deliberately reds.**
8. **Every `UNVERIFIED` item** (`§9` item 7), with the blocking `E-1` named first. **⟨2026-09-28: `§9` items 7/8/9
   carry the amendment's own additions — the two RED-BY-DESIGN `[T]`-side reconciliations (`E-9`), the removal
   mechanic's live-layer question, and the OPEN ARCHITECT QUESTION on the mocked-record instrumentation (`E-8`) —
   and the architect QUESTION is reported WITHOUT a recommendation, because this pass does not pick it (`§0B`
   item 4).⟩**
9. **The live pass's status** (`§7.2`) — the command shape attempted and the divergence reading attached, or
   the reading itself if the precondition has been fixed by then.

---

## 11. Cross-references (path + symbol / row id / `§section` — never a line number)

`docs/specs/post-division-rebuild-proposal.md` §4.1 (`PD-UI-1`) / §4.2 / §4.4 / §4.5 (W1) / §4.7 (`C-15`,
`A-5`, `A-7`, `A-8`, `A-10`) / §5 (`G-1`, `G-5`, `G-6`, `G-7`, `G-8`) / §6.2 / §7.3 / §7.4 / §7.5 ·
`docs/specs/post-division-rebuild-proposal-review.md` (`C-1`, `V-1`, `X-3`, `X-9`) ·
`docs/specs/post-division-foundation-adoption-surface.md` §1 row 1 / §2.1 / §2.2 / §3 / §8 (`U-THEME`) / §9 /
§10 (`U-4`, `U-8`) · `docs/specs/post-division-local-elimination-inventory.md` §2.1 (`PD-THEME-1`,
`PD-THEME-2`, `PD-THEME-3`) · `docs/specs/post-division-test-disposition-2026-09-28.md` §1 / §2 row #1 / §4 /
§5 (`K-5`, `K-7`) / §7 (the `W1` row) / §9 (`O-1`, `O-3`, `O-7`) ·
`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §0A note 4 / §2.1 (items 1/6/7) / §3.5 / §4 (`P-IM-1`) ·
`docs/specs/pd-vendor-adoption-dossier.md` `C-7` (the stem collision) ·
`docs/specs/unit-pd-ui-12-slot-host-boundary.md` §1.2 `B-1` / §1.4 ·
`docs/specs/rca-live-bugs-green-pipeline.md` (`RCA-11`, `RCA-12`) ·
`docs/specs/requirement-catalog.md` §3.4 rule 7 · `docs/specs/unit-u-shell-2-appearance-tokens.md` §2 ·
`docs/specs/unit-u-shell-7-settings-modal.md` §2.x (the operator mounts) ·
`docs/decisions.md` `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` ·
`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` · `DECIDED: REBUILD-ARCHIVE-POLICY` ·
`DECIDED: UI-CONFIG-CARRIER` · `DECIDED: OPERATOR-ISOLATED-GRAPHSCOPE` ·
`DECIDED: STORE-LISTING-PROVIDENT-AUTHORED` · `DECIDED: SCH-REQUEST-WITHDRAWAL-AND-FILING-DECISIONS` ·
`docs/FORK-DIVERGENCE.md` §2 row 4 / §3 rule 2 ·
`../Provident-Electron/docs/specs/theme.md` §0A / §1 / §2.1 / §2.2 (`P-TH-1`, `P-TH-7`, `P-TH-8`, `P-TH-9`,
`P-TH-10`) / §2.3 / §2.4 / §3.1 / §3.2 / §3.3 / §3.4 (`R-1`, `R-2`, `R-4`, `R-7`, `R-8`, `R-10`) / §5.5.1
(`P-TH-IM-3`) · `../Provident-Electron/docs/guide/theme.md` **→ the opening paragraph, *What it is*, *Use cases*
UC-2, the *Code, runnable* applied-write recipe and *Gotchas* (THE `A-7` RULING'S SETTLED CITATION, `§0B` item 2)** ·
`../Provident-Electron/docs/specs/theme.md` **§0A note 2, §2.2 (D)'s `removal` row and removal-case row, §2.4
item 2 (`A-7`'s contract half)** · `../Provident-Electron/docs/guide/seams.md`
(the last row: the EMPTY seam set) · `../Provident-Electron/docs/specs/theme-control.md` §2.1 ·
`../Provident-Electron/docs/specs/theme-greens.md` ·
`../Provident-Electron/docs/specs/gsession.md` §2.2 `P-1`/`P-5`/`P-7`, §3.4 `R-1` ·
`../Provident-Electron/docs/specs/gutter.md` §2.2 `P-5`, §3.4 `R-1` ·
`../Provident-Electron/docs/specs/rca-cross-project-handoff-semantics.md` §2/§3 ·
`src/renderer/theme.ts` · `src/renderer/renderer.ts` → `installTheme` · `src/renderer/index.html` (the token
block) · `src/shared/theme.ts` (**the vendored module**) · `src/shared/types.ts` → `ThemeSetting` ·
`src/main/operator-settings-store.ts` → `coerceTheme` · `src/main/preload.ts` → `operatorSettings` ·
`src/renderer/sidebar-panes.ts` → `settingsContent`, `OPERATOR_REPRESENTATION_MODE_TOGGLE_HANDLER` ·
`vendor/foundation.lock.json` (`theme`) · `tests/unit-u-shell-2-theme.test.ts` · `tests/pd-vendor-set.test.ts` ·
`tests/pd-vendor-manifest.test.ts` · `tests/unit-v5-migration-contract.test.ts` ·
**⟨ADDED 2026-09-28 (the gate-4 remand amendment, `§0B`): `tests/pd-ui-1-theme-adoption.test.ts` → its `⟨A-7 + A-2⟩
P-TH-TP-2` row (the tripwire whose TWO limbs lock the SKIP reading and are now RED BY DESIGN, `§0B` item 2) and its
`specItem3Text()` reading (the `§2.1` item 3 ruling site) · `tests/pd-ui-1-theme-register.test.ts` → its `§4`
arithmetic row and its `REGISTER_TERMS`/`SUPERSEDED_SPEC_TERMS` accountings (the executed terms `194` and the
superseded `173`, `§0B` item 1) and its `§9` spec-table limbs (now RED BY DESIGN, `§9` item 9) · the `A-12`
binder census in `tests/pd-vendor-set.test.ts` (the OPEN ARCHITECT QUESTION, `§9` item 8)⟩** ·
