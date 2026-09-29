# Unit `U-DIVERGENCE-FIXTURE` — the divergence leg's DRIVE-fixture mismatch (leg 1 drives the leg's own demo envelope while the app's boot wiring serves its `#wiki-root`/`zone:main` template): the ruled fix shape (SYMMETRY), the drive-readiness precondition, and the preservation of the comparison set, the demo literal, the `ok()` labels and the exit contract — Spec

**Status: SPEC — authored 2026-09-30. NO CODE LANDED, NO TEST LANDED, NOTHING RUN by this pass.** **No
shell was held**: `npm test`, `npm run build`, `npm run divergence`, `npm run battery`, `npm run
conformance`, `npm run drift` and `npm run typecheck` were **not run and are NOT reported by this pass**; no
Electron was booted and no `scripts/live-drive.mjs` block was driven. Reading, `glob` and `grep` were used.
**Every claim about the leg's CURRENT behaviour below is one of: (a) a RECORDED READING of a prior pass,
cited verbatim with its source and its measurer; or (b) a VERIFIED-BY-READ statement about the source text
at this head — named as such, with its reader named. Nothing else is claimed.**

**⟨AMENDED 2026-10-05 — POST-LANDING AMENDMENT; the as-filed status block above is KEPT as the filing's own
reading, never deleted.⟩** The unit has since been **implemented and run**, so its status is now:
**CLASS (a) LANDED AND GREEN** — the red set `tests/unit-divergence-fixture-contract.test.ts` reads **class (a)
`8/8` rows closed** and the register reads **`held × 8`, `executed == declared == 78`, `stoppedAt: null`,
counterexamples `0`** (the sibling `tests/unit-divergence-spawn-contract.test.ts` stays **`26 passed / 3
skipped`**) — **AND CLASS (b) STILL RED** — `npm run divergence` returns **`✗ electron connect/drive failed:
the load step was REFUSED by the tool surface: MCP error -32602: Tool provident.load not found`** →
**`R13 RESULT: 1 checks, 2 failures`**, exit `1` — **so the unit's own gate (§3.1 `C-8`) is NOT met**, and the
two blockers are **APP-SIDE** and owned by **`docs/specs/unit-app-harness-readiness.md`**. **Those figures are
the implementer's RUN readings, quoted as recorded input; THIS AMENDMENT PASS RAN NOTHING** (it held no shell)
and **its every own claim is DOC-LAYER** (`RCA-12`). **`§8` `E-3` is DISPOSED AS TAKEN**; `§2.1` `C-1` item 4
and `§2.2` `C-2` item 3 **stand unchanged and unrelaxed**; and `§2.3` `C-3` item 1 / `§10.3` item 3 are
**CORRECTED on the count (`10`)**. **This amendment's ledger is `§0A`, at the head.**

**⟨AMENDED AGAIN 2026-10-05 — THE `T-1` AMENDMENT, AND THE GATE FLIPS: the class (b) reading recorded two
paragraphs above is SUPERSEDED BY A NEWER RUN READING, and both as-filed readings are KEPT VISIBLE above,
unedited and dated. THE LEG IS GREEN — the unit's class (b) gate (`§3.1` `C-8` / `§6` `V-3`) is **CLOSED**:
`npm run divergence` → **`R13 RESULT: 9 checks, 0 failures`**, exit `0` (RECORDED READING; measurer: the
implementer's `T-1` pass) — so **`§0A.2` `F-2`'s STILL-RED status, `§0A.3` `F-3` item 4's "the class (b) run
is still red"** and **`§1.5` `O-5`'s "NO `<n>` exists to quote"** are all **readings of an EARLIER run**, and
**`B-1`…`B-5` are no longer un-run: the leg's own gate is green** and the program's **mandatory pre-live leg
(`A-7`) is restored**. Two clauses move: **`§2.1` `C-1` item 4** (an **additive spawn-ENV member** — the
vector, the profiles and the cleanup stay untouched) and **`§2.1` `C-1` item 3** (the ordering is
**REFINED**, never contradicted: `connect → wait (bounded) → load → probe → drive`). **The leg adds no
check**; the comparison set, the demo literal, the `ok()` labels and the `{0,1}` exit contract stand.
**The layer statement is UNCHANGED and this green may never be over-read: HARNESS/`[D]` only.** **This
amendment's ledger is `§0B`, immediately below `§0A`.**⟩**

**Pass kind:** SPEC (the contract only). **Unit id:** `U-DIVERGENCE-FIXTURE` (a HARNESS unit; the id is
minted by this filing) — **the id this unit's own predecessor already reserved for exactly this class**:
`docs/specs/unit-divergence-harness-precondition.md` §9.1 `T-4` names *"a separate unit
(`U-DIVERGENCE-FIXTURE`-class, NOT this one)"*. **Program:** the post-division rebuild — the pending row
this unit **discharges by name** is `docs/pending.md`'s **`LIVE-DIVERGENCE-LEG-FIXTURE-MISMATCH`** row
(*"the mandatory pre-live divergence leg's DRIVE-step mismatch … **OWED — genuinely UNASSIGNED at this
head** … **BLOCKING for a fully green pre-live leg"*), whose own text names **two admissible directions**
and defers the choice to *"the owning unit's own gate ruling"*; the defect row is `docs/defects.md`'s
**`LIVE-DIVERGENCE-LEG-DRIVE-FIXTURE-MISMATCH`** (`MED`; HARNESS `[D]`-layer). **Authority for what is
already DECIDED, read in full before this file was authored:** `docs/decisions.md` `DECIDED:
LIVE-GATE-RUN-DISCIPLINE` (ACTIVE) and `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` (ACTIVE);
the precedent tree's `DECIDED: THE DIVERGENCE HARNESS IS A TESTING TOOL AND IS IN THE UPDATE SCOPE`
(cited by `T-4`, never patched).

**Layer (RCA-12, mandatory declaration).** **HARNESS / `[D]`-layer for every claim in this file.** The
divergence leg is **never app-green and never envelope-green** — it is a **local instrument** that compares
two hosts' shim-stable surfaces; it is **in no trio**, it is **collected by nothing** (`vitest.config.ts`'s
`include` does not reach `scripts/**`), and **a green here proves the harness can boot a real Electron and
drive it — NOT that the app works** (`RCA-12`; `docs/specs/rca-live-bugs-green-pipeline.md`). **The rule in
this unit's own terms:** *a `R13 RESULT … 0 failures` reading may be cited as **evidence that the real-DOM
leg bootstrapped, connected, and drove the SAME demo envelope with matching shim-stable surfaces**, and may
never be cited as evidence about rendering, layout, CSS, gestures, the store, or any user-visible
behaviour.*

| Deliverable | The layer its evidence covers | What that layer does NOT prove |
| --- | --- | --- |
| leg 1's explicit `provident.load` of the leg's demo envelope (§2 `C-1`) | **HARNESS / `[D]`** — the leg drives the fixture it declares | that the app's OWN boot graph renders, or that any UI row is green; after the load the app's boot graph is **gone from the runtime** (§1.1 `FINDING-2`, §5 `L-2`) |
| the drive-readiness precondition + its loud stop (§2 `C-2`) | **HARNESS / `[D]`** — the load's EFFECT is read before any dispatch | that a failed precondition is an app defect: a boot-window race is **harness-owned** until the probe names otherwise |
| `R13 RESULT: <n> checks, 0 failures`, exit `0` | **HARNESS / `[D]`** — a **precondition** for the live batteries, never their substitute | **anything at the app layer**: the comparison is structural (`census` · SSR fragment · dirtied ids · `data-node-id` parity), never layout/CSS/geometry |
| anything about the UI overhaul (`PD-UI-*`) or the app's boot template | **NOT CLAIMED ANYWHERE IN THIS FILE** | — |

**Citation discipline.** `path` + **symbol** / **row id** / **§section**; **no line number appears in this
file as an address** (`docs/specs/requirement-catalog.md` §3.4 rule 7). Where a quoted source carries its
own line numbers, they are quoted **as that source's own text**, never adopted as this file's address.

**Verification markers.** **VERIFIED-BY-READ** = read in this pass from this repo's tree, reader named.
**RECORDED READING** = a figure a **prior pass** measured, quoted as that pass's reading with its measurer
named; **it is not this pass's verification**. **UNVERIFIED** = named, not settled by this pass, **with
what would settle it**.

---

## 0A. THE POST-LANDING AMENDMENT LEDGER (2026-10-05) — the class (a) landing, the class (b) red chain, the architect's ruling, and the count-ambiguity ruling — with every as-filed reading KEPT VISIBLE beside its correction

**⟨PLACEMENT NOTE, so the non-monotonic number is not read as an accident: `§0A` SITS BEFORE `§0` BY DESIGN.
Nothing above or below it is renumbered, and every `§`-citation in this file and in every other document
still resolves exactly as filed. `§0`…`§10` keep the numbers their filing gave them, and `§0A` is this
file's NEWEST section — *"the one the reader most needs first"* is why it sits at the head.⟩**

**What this pass is, stated honestly first.** It **amends THIS file only**. It runs **nothing**: no
`npm test`, no `typecheck`, no `build`, no `battery`, no `conformance`, no `divergence`, no `drift`, no live
battery, no Electron boot — it holds a read/search/doc-write wall and **NO SHELL**. **No code, no test file,
no `scripts/**` byte, no `src/**` byte, no `package.json`, no `vitest` config and no tracker row is written
by this pass.**

**Layer (`RCA-12`, mandatory declaration).** **DOC-LAYER for every claim in this amendment.** It asserts
**nothing** that is app-green, envelope-green, store-green, engine-green or live-green, and **it takes no
measurement of any run**: every figure below is a **RECORDED READING quoted as input with its measurer
named** (the implementer's post-landing pass, whose own gate is §3.3's class (b) run, **not** this pass) — the
same discipline `§0.1` applies to `M-1`…`M-7`. Where this pass read this tree, it is marked
**VERIFIED-BY-READ**.

**Annotate-beside, and the house rule it follows (`RCA-8(c)`).** **The as-filed text at every one of this
amendment's sites is KEPT VISIBLE, dated, with its finding id. Nothing is deleted, rewritten or renumbered.**
No `§`-number moves; **no register row (`§4.2`) is added, retired or renumbered**; the arithmetic
**`6+23+15+8+6+6+7+7 = 78`** stands as filed; and **no `R-1`…`R-9` row (`§3.2`), no `B-1`…`B-5` row
(`§3.3`), no `C-1`…`C-11` clause (`§2`, `§3`), no `D-1`…`D-7` decision (`§7`), no `E-1`…`E-7` escalation
(`§8`) and no `L-1`…`L-6`/`V-1`…`V-6` clause (`§5`, `§6`) is re-scoped except exactly where an item below
says so.** The clauses this amendment touches are, **EXHAUSTIVELY** — this list is the whole of it, and a
site not named here was not touched: **`§2.3` `C-3` item 1 and `§10.3` item 3 (the count — CORRECTED)** ·
**`§8`'s escalation ledger `E-1` and `E-3` (DISPOSED)** · **`§1.5` `O-1`/`O-4` (SETTLED by a recorded
reading) and `O-5`/`O-6` (NOT superseded / ANSWERED NEGATIVELY — annotated only)** · **the status block at
the head, `§1.5`'s closing `E-3` sentence, `§1.2`, `§2.1` item 5, `§2.2` item 4, `§4.2` `P-SM-2` and
`§4.2` `P-SM-3`, and `§10.4` (ANNOTATED/PINNED only — none of their normative text moves).**

**Finding-id disambiguation, BINDING here.** **`F-1`…`F-4` of this ledger are THIS AMENDMENT's finding
ids**, written with an `F` prefix — they are **NOT** the foundation-precedent rows **`F-1`/`F-1a`/`F-2`/`F-3`
of `§0.3`** (a different tree, a different subject, unchanged by this amendment), **NOT** the harness's own
`FINDING-1`/`FINDING-2` (`§1.1`), and **NOT** the program's `G-*` gap ids or the predecessor spec's
`O-*`/`E-*` ids. Where `§0.3`'s `F-1` is meant below it is written **as `§0.3`'s `F-1`**.

### 0A.1 `F-1` — THE CLASS (a) OUTCOME: **LANDED AND GREEN** (RECORDED READING; measurer: the implementer's post-landing pass)

**`F-1`.** The fix shape (A) **LANDED**, and its **class (a) red set is GREEN**. Quoted as the implementer's
pass measured it:

1. **The shared step exists, and it is the module's ONLY load site.** `scripts/electron-divergence.mjs` now
   carries **one shared `loadFixture(client)` step** — the module's **single** `provident.load` site
   (**`kind: 'envelope'`**, **`demoEnvelope()`**) — **placed `connect → load → probe → drive`** and
   **invoked by BOTH legs with their own client**. **The asymmetry `S-1`/`S-2` measured is closed BY
   CONSTRUCTION**, and `§3.2`'s `R-1`/`R-3` are the rows that asserted it.
2. **The readiness precondition exists in the landed shape.** The **loud readiness probe on leg 1's path** is
   a **`provident.list_targets` read performed synchronously**, feeding **`absentDemoIds(…)` → a named
   `readinessStop`**, with **no `ok()` call and no sleep** — i.e. `C-1` item 3's ordering and `C-2` items 2/3
   exactly as the contract required them (silent on success, loud and named on failure, and never a timing
   guess).
3. **`export function checkCount()`** exists — the module's inspectable count surface, the route (b) class
   `U-DIVERGENCE-SPAWN` already landed (**importing the module boots nothing**).
4. **THE RED SET: `tests/unit-divergence-fixture-contract.test.ts` — CLASS (a) `8/8` ROWS CLOSED.**
5. **THE REGISTER: `held × 8` · `executed == declared == 78` · `stoppedAt: null` · counterexamples `0`.**
   **`78` is the arithmetic `§4.2` filed** (`6+23+15+8+6+6+7+7`), **held as declared** — so the register's
   honesty clause **`§4.3` item 4 is satisfied with no `BROKEN` row and no re-scoping**.
6. **THE SIBLING UNIT IS UNHARMED:** `tests/unit-divergence-spawn-contract.test.ts` stays **`26 passed / 3
   skipped`** — the spawn/scratch contract this fix rides on (`P-TP-2`) is **not regressed**, which is
   `§3.3` `B-4`'s own subject read early.
7. **THE PRESERVED SURFACES ARE PRESERVED, as measured:** *"the comparison set, the `ok()` labels and their
   order (**10 calls**), the demo literal, the spawn vectors and the `{0,1}` exit contract are unchanged"* —
   i.e. **`§2.3` `C-3` items 1–5 held**, and `§0.3`'s `F-1`/`F-1a` bound (an added `ok()` check is a **PIN
   DRIFT**, never a pass) was **not taken**: **no `ok()` call was added**, and the count correction is `F-4`.
8. **A TestWriter repair the landing pass recorded, so the red set is not misread as unchanged history:** the
   red set **ITSELF needed a TestWriter repair** — **its per-leg rows had asserted a per-leg load *CALL
   SITE*, which is UNSATISFIABLE beside the contract's single shared step**; **they now assert
   REACHABILITY of the one step, with driven counter-variants**. And **the one unscorable negative in
   `P-SM-2` was re-shaped — the DECLARED TERMS UNMOVED** (that row still reads `3*2+2 = 8`, and `§4.2`'s
   `P-SM-2` cell is **not** rewritten by this amendment).

**HONEST BOUND ON `F-1` (BINDING).** Every figure in `F-1` is the **implementer's recorded reading of the
instrument and of the node suite** — **the HARNESS / `[D]` layer, and NOTHING ELSE** (`§5`; `RCA-12`). **A
green here is NOT app-green**; `npm run divergence` **is in no trio**, **is collected by nothing**, and
**`§6` `V-4`/`V-5` stand unchanged: `<n>` is an OBSERVATION, never a re-pin.** **Nothing in `F-1` retires
`§8` `E-1`, and nothing in it is the unit's own gate** — which is class (b), and is `F-2`.

### 0A.2 `F-2` — THE CLASS (b) GATE: **STILL RED**, WITH ITS CAUSE CHAIN MEASURED — AND TWO BLOCKERS IT MUST CARRY, NOT ABSORB

**`F-2`.** **The unit's own gate (class (b), `§3.1` `C-8`) is RED at this head, and the red is now NAMED end
to end.** Quoted as measured by the implementer's pass:

1. **THE READING.** The real run — **`npm run divergence`** — returns
   **`✗ electron connect/drive failed: the load step was REFUSED by the tool surface: MCP error -32602: Tool
   provident.load not found`**, then **`R13 RESULT: 1 checks, 2 failures`**, **exit `1`**.
   **⟨NOTE FOR THE READER: `1 checks, 2 failures` is the SAME RESULT LINE `M-2` recorded, but the failure's
   MESSAGE has moved from the dispatch (`unresolved target`) to the LOAD — which is exactly the change
   `C-2` item 4 exists to produce: a refusal that NAMES ITSELF instead of an ambiguous downstream red.⟩**
2. **`O-4` IS ANSWERED NEGATIVELY, AND IT WAS THE FIRST BLOCKER.** **`tools/list` on the booted app returns
   `9` tools with `provident.load` ABSENT.** The measured mechanism: **`defaultSecurityConfig()` enables
   `['read','dispatch']`**; **the persisted config lives in the app's `userData`, and a fresh per-spawn
   scratch profile has NONE**; and **the MCP server registers a group's tools only when that group is
   enabled**. **So the `graph` group — which `§1.1` `FINDING-1` item 2 predicted would be allowed by the
   default table, and which `§1.5` `O-4` expressly marked as read but NOT measured — is OFF through the
   leg's own spawn contract.** `§1.5` `O-4`'s settling condition is thereby **met, and answered AGAINST the
   filing's read**.
3. **`O-1` IS ANSWERED POSITIVELY, AND IT WAS THE SECOND BLOCKER.** **With the gate opened EXPERIMENTALLY —
   a MEASUREMENT ONLY, NOT LANDED — the app's fire-and-forget boot lands ~`250`–`540` ms AFTER `connect`**
   (`boot → loadAppGraph → loadEnvelope`, `S-5`'s exact chain) **and REPLACES the demo graph**: **run A**
   diverged on the **`data-node-id` set** (**app `32` vs shim `12`**), on the **`nodeId` vocabulary**, and on
   **`counter increment rendered in BOTH`**; **run B** died at
   **`unresolved target: {"kind":"cssId","cssId":"inc"}`** **right after the probe read `12` demo nodes** —
   i.e. **the probe was satisfied and the graph was superseded anyway**, which is `O-1`'s race MEASURED.
4. **THE DISPOSITION, RECORDED AS AN ESCALATION AND NOT AS A PARK.** **This unit's class (b) rows
   (`§3.3` `B-1`…`B-5`) stay SKIPPED / UN-RUN, and its own gate stays RED until the APP-SIDE UNIT lands.**
   **This is the escalation's disposition, NOT a park:** the rows are un-run **because a named app-side owner
   now holds the blockers** (`F-3`), **not** because the surface is non-exercisable — so `RCA-11`'s
   parked-by-default prohibition is honoured, with the reading, the cause chain and the owner all recorded.
   **`B-3`'s structural readings ARE quoted above** (the `data-node-id` sets, the `nodeId` vocabulary, the
   census divergence) — *"a RED whose reading is not quoted is not a reading"* (`§3.3` `B-3`) — and **`B-1`
   remains the only row that could ever turn this gate green.**
5. **WHAT `F-2` DOES NOT DO.** It does **not** soften `M-2`; it does **not** relax `C-3`; it does **not**
   admit a comparison-set change; and it does **not** admit the experimental gate-opening route — **that
   experiment was a MEASUREMENT taken to name the cause, and it is NOT LANDED and NOT this unit's to land**
   (`F-3` item 2).

### 0A.3 `F-3` — THE ARCHITECT'S RULING, AND WHAT IT SUPERSEDES

**`F-3`.** **THE RULING, recorded in the architect's own terms:** *the two blockers are to be closed on the
APP side — **a legitimate tool-group ENABLEMENT ROUTE** (never a harness-side config side-write) **and
BOOT-READINESS SEQUENCING** (never a timing wait in the leg).*

1. **`E-3` IS DISPOSED AS TAKEN — THE STOP CONDITION FIRED AND THE ESCALATION WAS ANSWERED.** `§8`'s `E-3`
   filed the stop as *"if a green requires a `src/**` change, this unit stops"*, and named the `O-1` race as
   **exactly** that case. **It FIRED**, the reading is `F-2`, and **the architect HAS answered it** —
   therefore **`E-3` is no longer an open escalation: it is TAKEN**, and its outcome is that the work **moves
   to the app side** (`F-3` item 3). **The stop was OBEYED, not worked around**: no `src/**` byte was written
   by this unit, and neither was a harness-side config side-write.
2. **THE TWO FORBIDDEN ROUTES STAND UNRELAXED.** **`§2.1` `C-1` item 4 and `§2.2` `C-2` item 3 STAND
   UNCHANGED AND ARE NOT RELAXED.** Precisely: **the leg NEVER writes the app's config** (so the enablement
   route is the APP's to provide, **never** a side-write into the app's `userData` — `F-2` item 2's mechanism)
   and **the leg NEVER sleeps** (`C-2` item 3's *"a sleep is a timing guess, and a timing guess in a leg whose
   whole value is determinism is a review finding"* **stands VERBATIM**). **The experimental gate-opening of
   `F-2` item 3 is a measurement, NOT a precedent, and may not be cited as one.**
3. **THIS UNIT BECOMES THE CONSUMER OF THE NEW APP-SIDE UNIT'S CONTRACT.** The blockers' owner is a **new
   app-side unit**, and its contract is **`docs/specs/unit-app-harness-readiness.md`** — **CITED BY SYMBOL
   (path + symbol / row id / `§section`) and NEVER by a copied clause**: this file **does not restate that
   unit's obligations**, does not pre-empt its rows, and does not predict its shape.
   **⟨CITATION STATUS: LANDED — `docs/specs/unit-app-harness-readiness.md` exists at this head,
   VERIFIED-BY-READ by this pass. If that file is later moved, renamed or renumbered, this citation is
   REPOINTED to the name that then exists — never silently dropped, and never replaced by an invented
   section.⟩**
   **THE DIRECTION OF DEPENDENCY, stated so it cannot be inverted: this unit CONSUMES that contract; that
   unit does not consume this one.** This unit's **own** rows stay `F-1` (the class (a) green) and `F-2`
   (the class (b) red), and **no clause of this file delegates, defers or re-scopes a clause of that file.**
4. **WHAT THE RULING SUPERSEDES — exactly, and nothing more.** It supersedes: **(i)** the framing that fix
   shape (A) **plus** the readiness probe was expected to produce the unit's green — **they did not, and the
   reason is an APP-SIDE blocker, not a harness-side shortfall** (`F-2`); **(ii)** `§1.5` `O-1` and `§1.5`
   `O-4` as **open** items — both are now **SETTLED by recorded readings**, and `O-4` is settled **against**
   the filing's own read (`F-2` items 2/3); and **(iii)** `§1.2`'s claim that fix shape (A) is *"the app's
   own sanctioned path"* — **still TRUE as a read-level fact about the load ROUTE (`FINDING-2` item 4), but
   INSUFFICIENT as a route to a green**, because the route must first be **ENABLED** and its effect must then
   survive the app's boot (`F-2`). **`§1.5` `O-5` and `§0.1` `M-7` are NOT superseded:** **no `<n>` exists
   to quote**, because the class (b) run is still red. **Nothing else is superseded.**

### 0A.4 `F-4` — THE COUNT-AMBIGUITY RULING (the red pass's spec-side remand)

**`F-4`.** **The red pass remanded two clauses as ambiguous about the count:** **`§2.3` `C-3` item 1** and
**`§10.3` item 3** each enumerate **`8` comparison rows plus the boot check plus the failure branch** while
**the leg EMITS `10` calls** (`F-1` item 7's own measurement: *"the `ok()` labels and their order (10
calls)"*).

**RULED — and it is a CORRECTION, not a re-scope:** **THE EMITTED COUNT IS `10`** — **`8` comparison rows +
the leg-1 boot check + the failure branch** — and **both clauses are corrected accordingly, with their
as-filed wording KEPT VISIBLE** (the dated annotations sit AT each clause). **This is a measurement
correction, NOT a PIN DRIFT:** the leg **adds no `ok()` call** (`C-3` item 1 stands), `§0.3`'s `F-1a` is
honoured, and **the register's `78` is UNMOVED** (`F-1` item 5) because `§4.2`'s `P-IM-2` terms already count
**`8` comparison labels + the boot check + the failure branch** (`4 + 8 + 8 + 2 + 1 = 23`) — **the register
and the measurement now agree in words, and neither number moved.**

### 0A.5 THE STANDING DISCIPLINE, CITED UNCHANGED

**`DECIDED: LIVE-GATE-RUN-DISCIPLINE` (ACTIVE, cited as filed; `§0.1` `M-6`, `§8` `E-5`) — UNCHANGED by this
amendment:** **isolated ports**; **boot-and-connect confirmed before driving**; **a live PASS is ADDITIVE /
APP-green only and retires no `[T]` row**; **a matrix report without a per-row verdict is INVALID**; and **a
live FAIL is split by layer before any disposition.** **This amendment is a DOC-LAYER act: it retires
nothing, proves no layer, and satisfies no live gate.** The class (b) run that `F-2` records as RED was taken
under this discipline, and its re-run — when the app-side unit lands — must be taken under it again.

---

## 0B. THE `T-1` AMENDMENT LEDGER (2026-10-05) — the leg's class (b) gate CLOSED GREEN, the two clauses `T-1` owes (`C-1` item 4's env member; `C-1` item 3's bounded wait refinement), what is UNCHANGED, and what this green is NOT — every as-filed reading KEPT VISIBLE beside its annotation

**⟨PLACEMENT, same discipline as `§0A`: `§0B` SITS AT THE HEAD, immediately after `§0A`, and NOTHING is
renumbered. `§0`…`§10` keep their as-filed numbers; this amendment adds a section, it moves none, and every
`§`-citation in this file and in every other document still resolves exactly as filed. The owed amendment's
own name is `docs/specs/unit-app-harness-readiness.md` §9 `T-1`, and the sibling spec's phrase for its class
is *"a `§12`-class amendment"* — **`§12` is NOT a section of this file** (this file carries `§0`…`§10`):
that phrase names a pass CLASS, never an address here (`§0C` item 2).⟩**

**What this pass is, stated honestly first.** It **amends THIS file only**. It runs **nothing**: no `npm
test`, no `typecheck`, no `build`, no `battery`, no `conformance`, no `divergence`, no `drift`, no live
battery, no Electron boot — it holds a read/search/doc-write wall and **NO SHELL**. **No code, no test file,
no `scripts/**` byte, no `src/**` byte, no `package.json`, no `vitest` config, no `docs/decisions.md` row and
no tracker row is written by this pass.**

**Layer (`RCA-12`, mandatory declaration).** **DOC-LAYER for every claim in this amendment.** It asserts
**nothing** that is app-green, envelope-green, store-green, engine-green or live-green, and **it takes no
measurement of any run**: every figure below is a **RECORDED READING quoted as input with its measurer
named** (the implementer's `T-1` pass, whose run produced the green reading of `§0B.1`), or a
**VERIFIED-BY-READ** statement about this repo's source text at this head — **reader: this pass (the
SpecDoc)**, with the symbol named.

**Annotate-beside, and the house rule it follows (`RCA-8(c)`).** **The as-filed text at every one of this
amendment's sites is KEPT VISIBLE, dated, with its finding id. Nothing is deleted, rewritten or
renumbered.** No `§`-number moves; **no register row (`§4.2`) is added, retired or renumbered**; the
arithmetic **`6+23+15+8+6+6+7+7 = 78`** stands as filed; and **no `R-1`…`R-9` row (`§3.2`), no `B-1`…`B-5`
row (`§3.3`), no `C-1`…`C-11` clause (`§2`, `§3`), no `D-1`…`D-7` decision (`§7`), no `E-1`…`E-7`
escalation (`§8`) and no `L-1`…`L-6`/`V-1`…`V-6` clause (`§5`, `§6`) is re-scoped except exactly where an
item below says so.** The clauses this amendment touches are, **EXHAUSTIVELY** — this list is the whole of
it, and a site not named here was not touched: **`§2.1` `C-1` item 3 (the ORDERING — REFINED by `§0B.3`) ·
`§2.1` `C-1` item 4 (the SPAWN/ENV contract — ANNOTATED ADDITIVE by `§0B.2`) · `§1.4`'s row for
`scripts/electron-divergence.mjs` (an annotation, the pin status unmoved) · the STATUS BLOCK at the head ·
`§0A`'s own readings `F-2`/`F-3` item 4 and `§1.5` `O-5` (annotated at their rows, as superseded RUN
READINGS) · `§8`'s `E-4` (**ANNOTATED — STILL OWED**, and the *"`§12`-class"* phrase recorded as a CLASS name, not an address; `§0C` item 2) · **`§8` `E-8` (ADDED — the owed live-battery re-run and the closure items; `§0B.5`)** · `§9`'s `T-4`
(the record this amendment adds) · and `§10.3`/`§10.4`'s closing census annotations.** **`§2.2` `C-2` item 3
is NOT relaxed and NOT changed — it is SATISFIED and cited (`§0B.3` item 6).**

**Finding-id disambiguation, BINDING here (same shape `§0A` bound for its own `F-*`).** **`F-5`…`F-9` of
this ledger are THIS AMENDMENT's finding ids** — they are **NOT** the `§0A` ledger's `F-1`…`F-4`, **NOT** the
foundation-precedent rows `F-1`/`F-1a`/`F-2`/`F-3` of `§0.3`, **NOT** `§1.1`'s `FINDING-1`/`FINDING-2`,
**NOT** `scripts/electron-divergence.mjs`'s own in-file `F-4`/`F-5` notes (that file's prose ids), and **NOT**
the app-side unit's `F-1`…`F-9` enablement fail-states. Where the app-side spec's `F-6` is meant below it is
written **as `docs/specs/unit-app-harness-readiness.md`'s `F-6`**.

### 0B.1 `F-5` — THE CLASS (b) GATE: **CLOSED, GREEN** (RECORDED READING; measurer: the implementer's `T-1` pass, **not** this pass)

**`F-5`.** **`npm run divergence` reads `R13 RESULT: 9 checks, 0 failures`, exit `0`** — the unit's own gate
(`§3.1` `C-8`; `§6` `V-3`) is **MET**, and the program's **mandatory pre-live leg (`A-7`) is restored**. The
run's figures, quoted as measured, each with its own provenance:

1. **The enablement line (READ from the app's own `[provident-main]` stdout by the run; the line's author is
   `src/main/main.ts`'s startup log):** **`[provident-main] tool groups: base=[read, dispatch]
   persisted=[read, dispatch] requested=[graph] effective=[read, dispatch, graph] (source=env)`** — i.e. the
   `graph` group was **off in the base default**, **off in the fresh per-spawn persisted profile**, and
   **requested through the ENV member** (`§0B.2`), so the load route `§0A.2` `F-2` item 2 measured as
   **ABSENT** is now **served**. *(VERIFIED-BY-READ, this pass, `src/main/main.ts`: the line is the app's own
   log format, printed with `requested`/`effective`/`source`; `src/main/security.ts` carries the env name as
   `TOOL_GROUP_ENV` with the argv flag `TOOL_GROUP_FLAG` beside it — **that is the app-side unit's surface,
   cited here, not edited here**.)*
2. **The boot half is green on both legs:** **`stdio transport ready`** and **`renderer ready — MCP backend
   armed`** — the same pair `§0.1` `M-1` recorded, **re-observed on the green run**.
3. **THE BOUNDED BOOT WAIT READ AND SATISFIED (`§0B.3`):** **`boot wait: status=installed (epoch=1,
   generation=1) after 2 poll(s)/105 ms — the app's own boot install is complete BEFORE the load step (a
   state read, never a sleep)`**. **The measured cost (`105 ms`, `2` polls) is a READING about this host and
   is NEVER a budget** (`§0B.3` item 5).
4. **THE SHARED LOAD STEP LANDED, IN THE REFINED ORDER:** **`load: the demo envelope landed … (the shared
   step, run AFTER the boot wait and BEFORE the readiness probe)`** — `C-1` items 2/3 as refined.
5. **THE READINESS PROBE WAS SATISFIED (`C-2`, `§0B.3` item 6):** **`inc`, `counter`, `echo-out` addressable
   — `(no sleep, no timing guess)`**.
6. **THE COMPARISON BLOCK IS GREEN ON ALL EIGHT ROWS, with the census printed:** `census inTree` **`12 = 12`**
   · `census registered` **`12 = 12`** · **dirtied ids** · **SSR fragment** · **`data-node-id` set** ·
   **`nodeId` vocabulary** · **counter increment in BOTH** · **dispatch non-empty in BOTH**. **`12` is the
   demo literal's own node count** (`§10.3` item 2; `S-7`), and **the `inTree 12 = 12` row is `§1.5` `O-2`'s
   and `O-3`'s settle, recorded for the green run** (`O-2`'s stale-element question and `O-3`'s single-root
   question are answered **benignly here**, on this run's reading — **not** by any claim of this pass).
7. **THE SCRATCH SWEEP IS GREEN (`§3.3` `B-4`):** **`scratch cleanup (the green run (exit 0)): removed 2 ·
   passes 3 · leftover: NONE`** — **the spawn fix is NOT regressed by the fixture fix**.
8. **THE COUNT, READ AGAINST `§0A.1` `F-1` item 7:** **`9 checks`** on the green path = the **`8`** comparison
   rows **+** the leg-1 boot check (`electron: dispatch renderedNonEmpty`) — the **failure branch** is the
   `else` arm and emits **instead** of the eight, so the **10 `ok()` calls** `F-1` item 7 recorded remain
   **the leg's full label set, of which 9 fire on a green run**. **`§2.3` `C-3` item 1's correction (`F-4`) is
   therefore confirmed, NOT moved: the leg adds no `ok()` call, and its labels and their order are
   unchanged.**

**HONEST BOUND ON `F-5` (BINDING, and this is the whole of `§5` `L-1`…`L-5` restated for the green).** The
green is **HARNESS/`[D]`-layer and NOTHING ELSE** (`RCA-12`). **It proves that the leg boots a real Electron,
waits on the app's published install state, drives the app's OWN `provident.load` route to install the demo
envelope, and observes the same shim-stable surfaces the DOM-shim host produces — matching** (`§5` `L-2`).
**It is NEVER app-green, it is in no trio, and it is collected by nothing** (`vitest.config.ts`'s `include`
does not reach `scripts/**`). **It is also NOT a re-pin: `<n>` stays an OBSERVATION (`§6` `V-5`), and no
constant is minted from `9`.**

### 0B.2 `F-6` — THE ENV MEMBER: **`PROVIDENT_ENABLE_TOOL_GROUPS: 'graph'`**, at BOTH Electron spawn sites (RECORDED READING + VERIFIED-BY-READ)

**`F-6`.** **`scripts/electron-divergence.mjs` now carries `PROVIDENT_ENABLE_TOOL_GROUPS: 'graph'` in the
spawn environment at both Electron sites** — **VERIFIED-BY-READ by this pass at both sites** (the direct
`spawn(…)` site's `env` object and the SDK `StdioClientTransport` site's `env` object), **beside the existing
`DISPLAY` / `ELECTRON_DISABLE_SANDBOX` pair, with `...process.env` spread as before.**

1. **WHAT IS ADDITIVE, AND TO WHAT.** This member is **ADDITIVE to `§1.4`'s allowed surface** (the script row
   already reads **EDITED**, and its pin status is unmoved: **not a `G-9` pin**), **and it is ADDITIVE to
   `§2.1` `C-1` item 4's *"both legs keep their existing spawn/transport/env contract untouched"*** —
   **annotated at that clause**. **It is additive in the ENV object only:** the argument vector's **nine
   members**, the **per-spawn scratch profiles** and the **cleanup discipline** are **UNCHANGED** (`§0B.4`
   item 5), and **`siteArgs`'s equality check is unmoved**.
2. **WHY THE `env` SPELLING WAS TAKEN RATHER THAN AN ARGV MEMBER — the reason, recorded as the implementer's
   pass recorded it, and it is an app-side contract fact.** **The vector is PINNED at nine members and
   `siteArgs` THROWS on a tenth**, which is **exactly what the app-side contract's route rules**: an
   `--enable-tool-groups=` argv spelling would be a **tenth member** and would make the leg refuse its own
   launch. **VERIFIED-BY-READ, this pass, both halves:** `composeArgs(profileDir)` returns
   **`mainCjs` + seven base flags + `--user-data-dir=<profile>` = nine**, and `siteArgs(args, profileDir,
   site)` compares the site's list to the composed vector and **throws a named error** on any difference
   (*"both spawn sites must derive their arguments from ONE value"*). **The app-side unit's own read of this
   constraint is `docs/specs/unit-app-harness-readiness.md`'s `S-8`** (its `§2.1` `A-1` rules the argv route
   with the **env fallback**, argv winning), **cited by symbol, never restated as a clause of this file.**
3. **WHAT THE ENV MEMBER DOES NOT DO.** It **does not write the app's persisted config**, **does not touch
   the app's `userData`**, and **does not re-route, re-order or re-vector any spawn**. It is a **launch-scoped
   grant passed at the spawn**, which is the route the app-side unit landed and ruled; **`§2.1` `C-1` item 4's
   other preserved members — vector, profiles, cleanup, exit contract — are untouched** (`§0B.4`).
4. **THE CLAUSE THIS MEMBER DOES NOT SOFTEN (`§0A.3` `F-3` item 2, kept VISIBLE so the record does not
   silently reverse).** `§0A.3` `F-3` item 2 filed the enablement route as **APP-SIDE**, and named
   **`C-1` item 4 and `C-2` item 3 *"UNCHANGED and NOT RELAXED"***. **This amendment records a NEWER fact and
   does not rewrite that one:** the route the **app-side unit then landed and ruled** is a **launch-scoped
   env member the client sets at its own spawn** (`§0B.2` item 2), so **the leg now uses that landed route**
   — **it is still NOT a harness-side write into the app's config and NOT a `src/**` write by this unit**
   (`§2.1` `C-1` item 4's forbidden route stands; `§7` `D-6` stands), and **the prohibition `F-3` item 2
   filed against a side-write is not what was taken.** **`§0A.3` `F-3`'s as-filed text is KEPT above,
   unedited, dated, with its finding id** — **this item is the annotation beside it.**

### 0B.3 `F-7` — THE ORDERING IS **REFINED**: `connect → wait (bounded) → load → probe → drive`

**`F-7`.** **`§2.1` `C-1` item 3`'s order becomes `connect → wait (bounded) → load → probe → drive`.** The
new step is **`waitForBootInstalled(client)`**, and it **polls `provident.list_targets`'s `boot` member
between `connect` and the shared load step**. **VERIFIED-BY-READ, this pass, `scripts/electron-divergence.mjs`
(`waitForBootInstalled`, the constants above it, the leg-1 `try` block):**

1. **THE CONSTANTS ARE THE CLIENT'S, AND THEY ARE NAMED:** **`BOOT_POLL_INTERVAL_MS = 100`** and
   **`BOOT_POLL_DEADLINE_MS = 20_000`**. **The app-side contract's `§9` `E-3` assigns these to THIS spec to
   pin** (`docs/specs/unit-app-harness-readiness.md` `E-3`: *"the LEG's wait numbers (interval, deadline) are
   the SIBLING'S to pin"*) — **they are pinned HERE, and the file's own comment records the assignment.**
2. **THE REFINEMENT IS A REFINEMENT, NOT A CONTRADICTION.** `C-1` item 3's as-filed rule was *"after
   `connect`, BEFORE the first `drive` read"* — **both halves still hold**: the load sits **after `connect`**
   and **before the first `drive` read**. **The wait is inserted between `connect` and the load**, and
   `C-1` item 3's normative content is **unmoved** (annotated at the clause).
3. **THE FOUR NAMED LOUD STOPS, each terminating and none of them a retry:**
   **(i)** a **missing `boot` member** on the `provident.list_targets` reply — *"the reply carries NO `boot`
   member after `<n>` poll(s), so this launch did NOT take the enablement route …"*;
   **(ii)** **`status: 'failed'`**, **carrying the app's own `error` text** (a null `error` is reported as
   *"(no error text was carried)"*);
   **(iii)** **a status outside `pending|installed|failed`** — **the leg fails CLOSED** rather than waiting on
   a state it cannot read;
   **(iv)** **the deadline with the status still `pending`**, naming the deadline, the poll count and the
   waited time.
   **A fifth arm is also loud:** a **refused `provident.list_targets` read** (a tool-surface refusal during
   the wait) throws a named stop quoting the tool's own message.
4. **`installed` PROCEEDS ONCE — NEVER A RE-WAIT.** On `boot.status === 'installed'` the wait prints its
   line and returns; **the caller proceeds exactly once**, and **no post-satisfaction re-wait exists** (the
   file's own comment: *"a post-satisfaction re-wait is never taken"*). **A regression observed after the
   install is a NAMED FAILURE, never a second wait.**
5. **IT IS A STATE READ, NOT A SLEEP AND NOT A TIMING GUESS — and this is `C-2` item 3 SATISFIED, NOT
   RELAXED.** The wait reads **the state the app publishes**; the only `setTimeout` in the function is the
   **poll interval between two reads**, and **the loop is bounded by the deadline, never by the install's
   observed cost**. **`§1.5` `O-1`'s measured `250`–`540` ms is NEVER used as a budget** — the file's own
   comment says so in terms (*"`O-1`'s measured `250`–`540` ms is an OBSERVATION and is NEVER a budget"*),
   **and the green run's own wait reading (`2` polls / `105` ms, `§0B.1` item 3) is itself an observation
   about one host, not a constant.** **`C-2` item 3's prohibition on papering the hazard over with a sleep
   stands VERBATIM, and this step does not violate it.**
6. **THE READINESS PROBE (`§2.2` `C-2`) IS NOT REPLACED BY THE WAIT.** The two read **different things**:
   **the wait reads the APP's install**, **the probe reads the LOAD's own effect**. The probe's shape is
   **unchanged** (`readSurface` → `absentDemoIds(…)` → the named `readinessStop`, **silent on success, no
   `ok()` call, no census change**), and its as-filed clauses (`C-2` items 1–6) are **unmoved**: **`C-2` item
   3 is satisfied by `§0B.3` item 5, and `C-2` items 1/2/4/5/6 are not touched by this amendment at all.**
7. **WHAT THE REFINEMENT RETIRES, EXACTLY:** the **`O-1` race as a hazard this leg must survive** — the
   wait is the leg's half of the app-side unit's protocol, and the app-side unit's own `F-5` names this
   ordering as its demand on the client. **`§1.5` `O-1`'s as-filed row is KEPT above** with `§0A`'s
   annotation, and this item does not rewrite either.

### 0B.4 `F-8` — WHAT IS **UNCHANGED** (recorded, so the green cannot be over-read)

**`F-8`.** **The green run left the following surfaces untouched — quoted from the implementer's recorded
statement, each one VERIFIED-BY-READ by this pass in the landed file:**

1. **THE SHARED `loadFixture` STEP AND ITS SINGLE `provident.load` SITE** — **one** `provident.load` call
   site, **`kind: 'envelope'`**, **`demoEnvelope()`**, **invoked by BOTH legs with their own client** (`C-1`
   items 1/2; `§0A.1` `F-1` item 1).
2. **THE DEMO LITERAL** — the same **12** nodes, the same authored ids, the same handler bodies, the same
   `clientConfig`; **consumed, never moved** (`C-3` item 2).
3. **THE COMPARISON SET**, and **the `ok()` LABELS AND THEIR ORDER — `10` calls** (the **`8`** comparison
   rows **+** the leg-1 boot check **+** the failure branch), exactly as `§0A.4` `F-4` corrected the count.
4. **THE `{0,1}` EXIT CONTRACT** (`exitCodeFor`/`failureCount`).
5. **THE NINE-MEMBER VECTORS** at both Electron sites, the **per-spawn scratch profiles** and the **cleanup
   sweep** (`P-TP-2`) — **the env member of `§0B.2` is additive to the env OBJECT only and adds no vector
   member**.
6. **`checkCount()`** — the module's inspectable count surface (`§0A.1` `F-1` item 3).
7. **THE ENTRY GUARD** — *"IMPORTING THIS MODULE BOOTS NOTHING"*, the foot-of-file main-module guard.
8. **AND THE LOAD-BEARING ONE: **THE LEG ADDS NO CHECK.** **`§0.3`'s `F-1a` (an added `ok()` routed through
   the harness's helper is a PIN DRIFT, never a pass) is HONOURED**, and **the green's `9 checks` is the
   leg's own pre-existing arithmetic, not a new row** (`§0B.1` item 8).

**THE HONEST LAYER STATEMENT, RESTATED VERBATIM IN EFFECT AND UNCHANGED:** **HARNESS / `[D]`-ONLY — a green
proves the leg boots and drives a real Electron through the same demo envelope with matching shim-stable
surfaces; it is NEVER app-green, in no trio, collected by nothing** (`§5` `L-1`…`L-5`; `§6` `V-4`; `RCA-12`).

### 0B.5 `F-9` — WHAT THIS GREEN IS **NOT** (the two readings it must not be made to carry)

**`F-9`.**

1. **IT IS NOT APP EVIDENCE for the program's remaining live work.** A green here clears the **pre-live
   precondition** (`§5` `L-4`; `§3.3` `B-5`): **every unit whose live gate read `PRECONDITION-FAILED` still
   owes its OWN live run against the assembled app on a display** (`RCA-11`). **No live row is retired by
   this reading** (`DECIDED: LIVE-GATE-RUN-DISCIPLINE`; `§8` `E-5`).
2. **OWED — THE LIVE BATTERY HAS NOT BEEN RE-RUN** since the app-side unit landed. **This is recorded as an
   OWED item, at `§8` `E-8`**, with its owner: the leg's green **makes those runs executable again**, and
   **nothing in this file claims any of their readings.**
3. **THE 32 APP-LAYER `[U]` FAILS the first live run recorded remain UNTOUCHED by this unit.** The
   divergence leg is **structural only** (`§3.1` class (b)'s own limit) — **a harness green neither fixes
   nor measures an app-layer `[U]` row**. **This amendment does not re-count them:** the figure is the **LIVE
   pass's own recorded reading, quoted here as RECORDED INPUT with that pass as its measurer** (the first
   live run after the UI overhaul — **the same reading class §0.1's `M-4` cites**), **and neither its set nor
   its count is re-derived, re-run or attributed to this pass.** *(`32` is quoted because the implementer's
   `T-1` pass gave it; this pass holds no shell and could not verify it — that is exactly why it is marked as
   a quoted reading rather than a claim.)*

**OWED ITEMS THIS AMENDMENT CARRIES (each with its owner; `§8` `E-8` carries them in the escalation table's
shape):** **(a)** the **live-battery re-run** on a display against the assembled app, now executable
(`EVERY LIVE-BATTERY UNIT`; `RCA-11`); **(b)** the **`docs/defects.md`/`docs/pending.md` closure** of the
defect this unit cleared (`E-6`; **THE SUPERVISOR** — a tracker act, not a spec's); **(c)** the **owed
fixture single-source-of-truth unit** (`E-2`; **THE ARCHITECT** — **NOT closed by `T-1`, and `D-4` stands**);
**(d)** the **PREDECESSOR spec's own amendment** on
`docs/specs/unit-divergence-harness-precondition.md` (`E-4`; **THE SPEC-WRITER** — `§0C` item 1). **It is not
the only owed item: (e) the `E-6` closure and (f) the `E-2` unit are tracker/architect acts, and `§8` `E-8`
carries all five owners.**

### 0B.6 The standing discipline, cited unchanged (the same citation `§0A.5` carries)

**`DECIDED: LIVE-GATE-RUN-DISCIPLINE` (ACTIVE, cited as filed; `§0.1` `M-6`, `§8` `E-5`) — UNCHANGED by this
amendment:** **isolated ports**; **boot-and-connect confirmed before driving**; **a live PASS is ADDITIVE /
APP-green only and retires no `[T]` row**; **a matrix report without a per-row verdict is INVALID**; and **a
live FAIL is split by layer before any disposition**. **This amendment is a DOC-LAYER act: it retires
nothing, proves no layer, and satisfies no live gate.** **The class (b) green of `§0B.1` was taken under this
discipline** (its own per-spawn scratch profile and its `leftover: NONE` sweep are the discipline's own
traces), **and every live run it unblocks must be taken under it again.**

---

## 0C. THE AMENDMENT'S OWN RECONCILIATIONS — two items, recorded rather than silently resolved

1. **THE PREDECESSOR SPEC'S OWED AMENDMENT (`E-4`) IS STILL OWED, AND `T-1` DOES NOT COVER IT.** **Precision, because two different docs are in play here:** the **`T-1` items quoted below belong to the APP-SIDE contract** (`docs/specs/unit-app-harness-readiness.md` §9 `T-1` — that is what THIS amendment discharges), while **`E-4`'s two halves belong to the PREDECESSOR** (`docs/specs/unit-divergence-harness-precondition.md`).
   `docs/specs/unit-app-harness-readiness.md`'s §9 `T-1` item **(iii)** asks that this file's **readiness
   probe (`C-2`) stay exactly as it is** — **it does** (`§0B.3` item 6) — and item **(iv)** asks for **two new
   readings its class (b) run now produces**: the **install's observed status** (**recorded at `§0B.1` item
   3**), and **the `tools/list` membership** (**recorded at `§0B.1` item 1 as the tool-groups line's
   `effective=[read, dispatch, graph]`**; **note the precision: the implementer's pass recorded the
   enablement line, not a separate `tools/list` count — a `9`-tools-`without`/`10`-tools-`with` membership
   count is NOT quoted here, because no such reading was given to this pass**). **`E-4` itself is NOT
   discharged by this amendment:** its two halves belong to `docs/specs/unit-divergence-harness-precondition.md`
   (**the entry-guard/export-surface ruling and the four row-body reconciliations**), **and this pass may not
   edit that file** (`§1.5`).
2. **`§0A`'s PHRASE *"a `§12`-class pass"* IS A CLASS NAME, NOT AN ADDRESS — RECORDED SO NOTHING IS INVENTED.**
   The phrase appears in `docs/specs/unit-app-harness-readiness.md` §9 `T-1` and in this file's own `E-4`
   (*"`§12`-class"*), **and this file has NO `§11` and NO `§12`**: its sections are `§0`…`§10` plus the
   amendment ledgers `§0A`/`§0B`. **This amendment is placed as `§0B` — the head, beside `§0A`, nothing
   renumbered — rather than as a literal `§12`, because minting a `§12` that follows no `§11` would be a
   numbering claim this file's own discipline (`§10.4`) forbids.**

---

## 0. The state this unit exists to clear — and the readings it cites

### 0.1 The recorded readings (quoted, never re-derived)

| # | Reading | Source of the reading (and its measurer) |
| --- | --- | --- |
| **M-1** | **The leg's BOOT half is GREEN and PROVEN:** both legs report **`[provident-mcp] stdio transport ready`** + **`[provident-main] renderer ready — MCP backend armed`**, with **ZERO** `/dev/shm` / `shared memory` / `SIGTRAP` matches and the scratch sweep reading **`removed 2 · passes 3 · leftover: NONE`**, 0 surviving processes. | `docs/defects.md` `LIVE-DIVERGENCE-LEG-DRIVE-FIXTURE-MISMATCH`; `docs/pending.md` `LIVE-DIVERGENCE-LEG-FIXTURE-MISMATCH`; `docs/next-steps.md`'s `U-DIVERGENCE-SPAWN` DONE row. **Measurer: the implementer's `npm run divergence` legs.** |
| **M-2** | **The leg still EXITS `1` at the DRIVE step:** `provident.dispatch` returns `isError` text **`unresolved target: {"kind":"cssId","cssId":"inc"}`**, surfaced by the SDK as `electron connect/drive failed: Unexpected token 'u', "unresolved"... is not valid JSON`, then the branch `electron leg produced a result (electron failed to bootstrap)`, verdict **`R13 RESULT: 1 checks, 2 failures`**. | same three rows (RECORDED); **measurer: the implementer's `npm run divergence` legs.** |
| **M-3** | **The cause, as the implementer recorded it:** *"leg 1's drive targets the demo envelope"* **while** *"the app's boot wiring serves its own `#wiki-root`/`zone:main` template (`src/renderer/renderer.ts`: the boot wiring replaced the `demoEnvelope()` bootstrap)"* — *"the mismatch is structural, not flaky."* | `docs/defects.md`'s row, `Cause` + `Disposition` cells (RECORDED, measurer named there) |
| **M-4** | **This leg is the program's MANDATORY PRE-LIVE leg** (`A-7`), and **every UI unit's live gate has been reading `PRECONDITION-FAILED` against it** — the `PD-UI-1`/`PD-UI-6`/`PD-UI-12` DONE rows each carry that reading with the environmental cause attached. | `docs/specs/post-division-rebuild-proposal.md` §4.7 `A-7` + §7.5; `docs/next-steps.md` (the `PD-UI-1` `DONE` row, the `PD-UI-6` `DONE` row and its gate-6 addendum) |
| **M-5** | **The unit is OWED and UNASSIGNED at the head that recorded it:** *"OWNER: ITS OWN OWED UNIT — genuinely UNASSIGNED at this head (no existing unit name owns a `leg fixture vs app boot` reconciliation, and this filing invents no owner)."* **Non-blocking for `U-DIVERGENCE-SPAWN`'s DONE; blocking for a fully green pre-live leg.** | `docs/defects.md`'s row; `docs/pending.md`'s row (RECORDED) |
| **M-6** | **The live-run discipline this unit's DONE row must obey:** **isolated ports** (`--port=3899 --cdp-port=9333` was the recorded re-run) and **boot-and-connect confirmed before driving**; a live PASS is **ADDITIVE / APP-green only** and retires no `[T]` row; a leg red **at the DRIVE step with boot demonstrably GREEN** does not bar a battery **IF the decision and its reason are recorded**. | `docs/decisions.md` `DECIDED: LIVE-GATE-RUN-DISCIPLINE` (ACTIVE) — the reading quoted there is the live-scenario runner's (RECORDED; this pass drove nothing) |
| **M-7** | **The count is NOT this pass's to state, and no green count is recorded anywhere.** The sibling unit's DONE row records the **boot** half's readings and the scratch sweep **only**; the comparison stage has **never run green**, so **no `<n>` exists to quote** and this unit may not predict one. | `docs/next-steps.md`'s `U-DIVERGENCE-SPAWN` DONE row; `docs/specs/unit-divergence-harness-precondition.md` §1.4 `O-5` (RECORDED) |

**⟨`M-1`/`M-2` ARE THE SAME RUN, AND `M-2` IS NOT A REFUTATION OF `M-1`.⟩** The boot precondition and the
drive step are **two halves of one reading**: `M-1` is what `U-DIVERGENCE-SPAWN` **cleared and proved**;
`M-2` is what remains, and it is **a different defect class** (a fixture/sequencing mismatch, not an
environmental one). **No reading in this file softens `M-2`: the leg is RED at this head.**

### 0.2 The drive surface, read this pass (the asymmetry, and the failure path)

**VERIFIED-BY-READ, this pass, by the SpecDoc — `scripts/electron-divergence.mjs` unless stated otherwise:**

| # | Reading | Where |
| --- | --- | --- |
| **S-1** | **The script drives TWO legs, and the two are ASYMMETRIC.** **leg 1** is the real Electron app (`dist/main/main.cjs`, via the SDK `StdioClientTransport`) and calls the shared `drive(eClient)` **directly** — **nothing on leg 1's own path loads the leg's demo envelope**; the call is `await eClient.connect(eTransport)` then `electronOut = await drive(eClient)`. **leg 2** is the DOM-shim battery host (`dist/main/battery-host.mjs`, spawned by `process.execPath`) and **explicitly loads first**: `shimClient.callTool({ name: 'provident.load', arguments: { kind: 'envelope', envelope: demoEnvelope() } })`, carrying the script's own comment *"the battery host boots root-only; load the same demo envelope so both are equal"*. | the real-Electron block (`drive` call site) and the shim block (`provident.load` call site + its comment) |
| **S-2** | **The script's HEADER states the invariant leg 1 violates:** its purpose is to compare *"the shim-stable surfaces … against the DOM-shim battery host running the **SAME demo envelope + dispatch**"*. **leg 2 honours it; leg 1 relies on the app's boot having installed the envelope. leg 1 is therefore the STALE half** (`M-3`). | the file's header block; the `drive` function's shared body |
| **S-3** | **The failure path is the dispatch resolver, not the SDK and not the target.** `drive()`'s second call is `provident.dispatch` with `{ target: { kind: 'cssId', cssId: 'inc' }, event: 'click' }`; the renderer resolves it via `Runtime.resolveTarget` → `nodeByCssId`, and **throws `unresolved target: ${JSON.stringify(req.target)}` when the target is absent from the live graph**. **The failing cssId (`inc`) is authored by the script's own `demoEnvelope()`** (the `button` carrying `css: { id: 'inc' }`). | `scripts/electron-divergence.mjs` (`drive`, `demoEnvelope`); `src/renderer/runtime.ts` (`dispatch`, `resolveTarget`, `nodeByCssId`) |
| **S-4** | **The app's boot wiring no longer bootstraps the demo.** `src/renderer/renderer.ts`'s `main()` constructs the `Runtime` with a **placeholder bootstrap envelope** (`template: DEFAULT_CONTENT_WINDOW_TEMPLATE`, `content: []`), with the file's own comment: *"The `demoEnvelope()` bootstrap is REMOVED — the SidebarPanes host loads the pane-inclusive envelope … at boot."* **`DEFAULT_CONTENT_WINDOW_TEMPLATE` authors `props: { id: 'wiki-root' }` whose child carries `props: { id: 'zone:main' }`** — i.e. **exactly the `#wiki-root`/`zone:main` pair `M-3` names**, and **no node in it carries `css.id === 'inc'`**. | `src/renderer/renderer.ts` (`main`, the placeholder envelope + its comment); `src/main/template-shape.ts` (`DEFAULT_CONTENT_WINDOW_TEMPLATE`) |
| **S-5** | **The app's authored graph is installed by an ASYNC host boot launched fire-and-forget.** `void host.boot(runtime).then(() => bootTabs()).catch(…)`; `SidebarPanes.boot` awaits a `rag.snapshot()` fetch, a doc-heads fetch, the journal fetch, the template fetch, the operator-settings fetch and the store listing **before** it assembles and calls `runtime.loadEnvelope(result.envelope)` (`loadAppGraph`); **`bridge.ready()` (which prints `renderer ready — MCP backend armed`) is NOT sequenced behind that boot.** | `src/renderer/renderer.ts` (`main`, the `void host.boot(...)` line and `bridge.ready()`); `src/renderer/sidebar-panes.ts` (`boot`, `loadAppGraph`) |
| **S-6** | **Leg 2's host really does boot root-only and then load.** `src/main/battery-host.ts`'s `rootOnlyEnvelope()` is *"a bare template.root + empty content"*, the `Runtime` is constructed with it and `bootstrap()`ed, and a load arrives through the same `provident.load` route leg 1 would use. | `src/main/battery-host.ts` (`rootOnlyEnvelope`, the `Runtime` construction, `bootstrap`); `src/renderer/renderer.ts` (`handleRequest`'s `case 'load'`) |
| **S-7** | **The demo envelope exists TWICE, as two hand-maintained copies in step today.** The harness's `demoEnvelope()` is a **hand-copied literal** inside `scripts/electron-divergence.mjs`; the fork's source of truth is `src/shared/demo-envelope.ts` → `demoEnvelope()`. **VERIFIED-BY-READ against each other this pass:** both author **12 nodes** (root + h1 + counter-card + h2 + counter + `inc`/`dec`/`reset` + echo-card + h2 + echo-input + echo-out) with the same authored ids and the same four handler bodies' semantics (the harness's bodies are one-line function strings, the module's are multi-line — **behaviourally the same `ctx.tree.allNodes()` / `props.id === 'counter'` / `ctx.clientAPI.apply` shape**). **The harness's own comment claims `12 nodes` and the count matches — read this pass, both sides.** | `scripts/electron-divergence.mjs` (`demoEnvelope` + its `// 12 nodes` comment); `src/shared/demo-envelope.ts` (`demoEnvelope`) |
| **S-8** | **The three id-bearing authored surfaces the comparison reads are all authored BY THE DEMO, and none of them exists in the app's boot template:** `counter` (both `css.id` and `props.id`), `inc`/`dec`/`reset` (css.id), `echo-input`/`echo-out` (both). So **every one of `drive()`'s four calls presumes the demo graph is the live graph.** | `scripts/electron-divergence.mjs` (`drive`, `demoEnvelope`); `src/main/template-shape.ts` (`DEFAULT_CONTENT_WINDOW_TEMPLATE`) |

### 0.3 The foundation precedent this unit PORTS (cited, never patched)

**The adjacent tree landed the same class of ruling — and it landed it on a MEASURED instance of this exact
symptom — so its records are binding precedent, not transferable code.** All rows below are
**VERIFIED-BY-READ this pass in the adjacent tree (`../Provident-Electron/**`, whose path this filing cites
**as that tree's own**, per `E-2` of this unit's predecessor — **this repo has no such path**):
**⟨ANNOTATED 2026-09-30 BY THIS FILING — the revision these rows are read at is whatever that tree's HEAD is;
this unit cites them by SYMBOL and by decision id, never by a revision literal, so no pin of this repo moves
and `vendor/foundation.lock.json` is untouched and uncited as an authority here.⟩**

| # | The precedent | Why this unit cites it |
| --- | --- | --- |
| **F-1** | **The harness is a TESTING TOOL and is IN THE UPDATE SCOPE** — *"Divergence is fundamentally a testing tool, include it in the update scope"* — so its fixtures are updated **as part of the unit whose change they must track**, and the `scripts/**` denied-set clause does **not** freeze it against a fixture update a legitimate change forces. **THE RULING'S OWN BOUNDS, which this filing adopts as its own preservation discipline:** the update is **BOUNDED TO THE FIXTURE** — the leg's check set, its spawn discipline, its exit-code contract and its honest-limits prose are **UNCHANGED**; the fixture must track the demo envelope as its **ONE source of truth** rather than restate it by hand (*"a hand-copied literal is the defect class this ruling exists to close"*); the **other `scripts/**` files stay denied**; and **`tests/**` and `src/**` are untouched by it**. | `../Provident-Electron/docs/decisions.md` `DECIDED: THE DIVERGENCE HARNESS IS A TESTING TOOL AND IS IN THE UPDATE SCOPE` (**also cited by `T-4`** of this unit's predecessor `docs/specs/unit-divergence-harness-precondition.md` §9.1). **This filing's `C-3` is that ruling's preservation half carried into this repo's own terms.** |
| **`F-1a`** | **The check count is PINNED by the same ruling family, and a new assertion routed through the harness's `ok(...)` helper is a PIN DRIFT, not a pass** — the foundation's `N` is pinned and undrifted, and its `U-CI-DIVERGENCE-LEG` adoption row records that *"`N = 9` cannot absorb a new check"*. | `../Provident-Electron/docs/decisions.md` `DECIDED: DIVERGENCE-LEG-GREEN-POST-CHANGE`, read through `docs/specs/unit-pd-vendor-foundation-mechanisms.md`'s adoption row for `U-CI-DIVERGENCE-LEG`. **This filing's `C-3` item 1 (no new check) is that pin carried into this repo's own terms, with this repo's own `<n>` left an OBSERVATION (`V-5`).** |
| **F-2** | **The SAME SYMPTOM class, MEASURED there, and its cause is the same asymmetry this unit clears:** that leg went RED — *"`R13 RESULT: 9 checks, 5 failures`"* — when the demo envelope grew `12 → 18` nodes, **because the shim booted a different app than the real one** (*"`census inTree matches (shim = real) (electron=18 shim=12)`"*), and its harness comment records the asymmetry verbatim: *"the shim battery host is mandated to boot root-only (C3) then `provident.load` the demo, so its minted ids are offset by the root-only boot relative to the real app (**which boots the demo directly**)"*. **The fix there was DERIVATION** — the harness **imports** the authored `demoEnvelope()` from `src/shared/demo-envelope.ts`, so *"a drift is therefore IMPOSSIBLE BY CONSTRUCTION."* **The fork's counterpart: its leg also carries a hand-copied literal (`S-7`), but its REAL app no longer boots the demo at all (`S-4`) — so the fixture/leg half is no longer symmetrical with its own comment.** | `../Provident-Electron/scripts/electron-divergence.mjs` (its fixture block and its `collect one host's (census, ssr, dirtied, renderedIdSet)` note); `../Provident-Electron/docs/decisions.md` (the same row's measured narrative). **Cited for the CLASS and for the bound; the derivation itself is escalated here as `E-2`, not absorbed (`D-4`).** |
| **F-3** | **`provident.load` IS the load route a real leg uses, and it is a first-class tool of that MCP surface** — the foundation's leg calls **`callTool(client, 'provident.load', { kind: 'envelope', envelope })`**, and its scratch security store exists **because *"`provident.load` lives in the `graph` group"***. | `../Provident-Electron/scripts/electron-divergence.mjs` (the load helper, its envelope resolution, and the scratch-store note) — i.e. **`FINDING-1` is not a fork-side hope: the same MCP route is the landed practice in the precedent tree.** |

**BINDING:** the foundation is **NEVER modified by this unit** (`AGENTS.md` item 7; the program's `G-8`).
**What is ported is a RULING about where a fixture fix belongs (in the tool), and it is not patched.**

---

## 1. What this unit is — and what it is NOT

### 1.1 The two findings that decide the fix shape (VERIFIED-BY-READ)

**`FINDING-1` — THE APP'S OWN MCP SURFACE **DOES** EXPOSE `provident.load`, AND IT IS THE SAME `load` ROUTE
THE SHIM LEG USES. VERIFIED-BY-READ, this pass, by the SpecDoc:**

1. **It is a registered tool name.** `ProvidentMcpServer.ALL_TOOLS` (`src/main/mcp-server.ts`) carries the
   member **`'provident.load'`** — so the built app's own MCP surface exposes it, and the harness's
   `callTool({ name: 'provident.load', … })` is **exactly the app's own route**, not a shim-only convenience.
2. **It is group-gated, and the gate allows it by default.** `src/main/security.ts`'s `TOOL_GROUPS` maps
   **`'provident.load': 'graph'`**; the registration loop registers a tool only when its group is allowed,
   and the same list feeds `allowedToolNames()`. **This is the SAME class of gate the harness's other calls
   already pass** (`provident.get_rendered_html`/`list_targets` = `read`, `provident.dispatch` = `dispatch`) —
   and **`M-1` proves those calls already reach the app** (the leg connects and `list_targets` is answered in
   the green half's own shape). **⟨HONESTY: the `graph` group's default-ON state is read through the gate's
   own default table, not measured by a boot this pass — `§1.5` `O-4` names what would settle it.⟩**
3. **It routes to the renderer and to the app Runtime.** The registered handler is the shared
   `backend.invoke(dispatch(name), args)` path (`dispatch(name) = name.slice('provident.'.length)` ⇒
   **`'load'`**), i.e. the renderer RPC method **`'load'`** in `src/renderer/renderer.ts`'s `handleRequest`,
   whose `case 'load'` calls **`runtime.load(req.payload)`** — the app's own Runtime, its own graph.
4. **It is a MUTATING method by the app's own bookkeeping.** `MUTATING_METHODS` in `src/renderer/renderer.ts`
   contains `'load'`, so a successful load emits the `app-graph-changed` push **after** the reply. **The app
   itself treats a load as a graph mutation — which is the second finding's whole subject.**
5. **Its return shape is `LoadResult`:** `{ census, renderedHtml, ssrHtml, warnings }`
   (`Runtime.load`), i.e. **the same census/SSR surface `drive()` reads** — so a load's effect is
   **observable through the leg's own tool set** without adding any new tool or any new check.

**`FINDING-2` — A LOAD INTO AN ALREADY-BOOTED APP PERFORMS A WHOLE-GRAPH **REPLACEMENT**, NOT AN ADD-BESIDE
AND NOT A REFUSAL. VERIFIED-BY-READ, this pass, by the SpecDoc, in `src/renderer/runtime.ts`:**

1. **The load path starts by TEARING DOWN.** `Runtime.loadEnvelope` calls `this.tearDownGraph()` **first**.
   `tearDownGraph` (a) sweeps every `#wiki-root` element out of the mount — with the file's own recorded
   reason *"the previous graph's `#wiki-root` ELEMENT outlives its node: `loadEnvelope` replaces the
   supervisor, so the old root is never destroyed and its element stays in the mount"*; (b) destroys **every**
   in-tree non-root node of the current graph through the destroy op; (c) drops the payloads; (d) clears
   `contentRoots`/`documentRoots`/`envelope`; (e) clears `prevStates` and re-renders.
2. **Then it REPLACES the graph wholesale:** a **fresh** `createLinkHub()` into `this.hub`, a **fresh**
   `Supervisor`, `translateLegacy(env)` → `resolveNameReferencedHandlerBodies` → register every translated
   node, `this.rootNode`/`this.nodes` reassigned, `this.envelope = env`, `contentRoots`/`documentRoots`
   re-derived, the id index rebuilt, render state reset (`prevStates`/`domPrevMap`/`ssrPrevMap`/`bootstrapped`),
   then `render()`.
3. **So the answer to "replacement, a second mount, or a refuse?" is: a REPLACEMENT.** Not add-beside (one
   supervisor, one root, and the prior content nodes are explicitly destroyed), not a refusal (there is no
   guard, no precondition, and no error path for "already booted").
4. **The app ALREADY depends on exactly this behaviour at its own boot**: the app's boot loads its own
   pane-inclusive envelope through the same `loadEnvelope` — so the "load over a booted graph" sequence is
   **the app's own routine**, not a harness-imposed abuse (`S-4`/`S-5`). **This is the strongest available
   read-level evidence that fix shape (A) is the app's own sanctioned path.**

**⟨`FINDING-2`'s LIMIT, stated so it is not over-read (UNVERIFIED, `§1.5` `O-1`/`O-2`):⟩** the read proves
**the runtime's node set is replaced** and that the loader **sweeps `#wiki-root`**. It does **NOT** prove
that **every DOM element** of the app's booted graph leaves the mount: the sweep is by the `#wiki-root`
selector, while the render diff can only remove elements it **tracks** (`prevStates`/`domPrevMap`, both reset
by the load). **Whether a stale mount element survives a load is a RUNTIME question this pass cannot settle
from source, and `§4.2` `R-6` is the row that makes it visible.**

### 1.2 The fix shape this filing RULES (§2 carries the contract)

**THE DECISION: FIX SHAPE (A) — SYMMETRY.** **leg 1 loads the leg's demo envelope explicitly before it
drives, exactly as leg 2 already does** (§2 `C-1`), **and the load's EFFECT is a loud precondition of the
drive** (§2 `C-2`). **The alternatives are refused with reasons, not by preference — see §2.3 and §2.4.**

### 1.3 Scope — what this unit IS (the deliverable, in one list)

1. **The one-line symmetry**: leg 1's drive is preceded by the **same** `provident.load` of the **same**
   `demoEnvelope()` value that leg 2 performs — **through a SHARED helper**, so the two legs cannot drift
   apart again (§2 `C-1`).
2. **The drive-readiness precondition**: after the load, the leg **reads back the load's effect from its own
   tool set** and **fails loudly** (never silently) if the demo surface is not the live graph — the guard
   against the boot-window race `S-5` exposes (§2 `C-2`), and against the stale-element question
   `FINDING-2`'s limit names.
3. **The preservation clause carried forward BY NAME**: `U-DIVERGENCE-SPAWN`'s **§3.7 `C-7`** — the
   comparison set, the `ok()` labels, the demo literal, the `{0,1}` exit contract and the two-leg structure
   are **unchanged**, and **this unit adds no check** (§2 `C-3`, §5).
4. **The red set** (§3): source/shape rows that FAIL at this head **without an Electron boot**, plus the
   **real-run** class that is **this unit's own gate**.
5. **The layer/scope statement** (§5): what the leg proves after the fix, and what it no longer proves.

### 1.4 The ALLOWED surface (exact)

| Path | Change | Pin status |
| --- | --- | --- |
| `scripts/electron-divergence.mjs` | **EDITED** — §2 `C-1`/`C-2` only: leg 1 gains the shared fixture-load step, the shared helper, and the loud readiness stop. **The comparison set, the `ok()` labels/order, the `demoEnvelope()` literal's content, the exit contract and the two-leg structure are preserved (§2 `C-3`)** | **not a `G-9` pin**; it is this unit's deliverable **⟨ANNOTATED 2026-10-05 (`§0B.2` `F-6`) — the file also carries ONE ADDITIVE spawn-ENV member `PROVIDENT_ENABLE_TOOL_GROUPS: 'graph'` at both Electron sites, and the bounded boot-install wait of `§0B.3` `F-7`; the row's CHANGE column and its pin status are otherwise unmoved, and the vector/profile/cleanup surfaces stay as filed (`§0B.4` item 5).⟩** |
| `tests/unit-divergence-fixture-contract.test.ts` | **NEW — the RED SET** (the TestWriter's file; §3.2) | **must NOT `vi.mock('electron', …)`** — the protected bridge-mock name-set forbids a new mocking file; the row file reads **source text / the module's exported surface** and needs only `node:*` builtins plus `vitest` |
| `package.json` → `scripts.divergence` | **UNCHANGED — and pinned by this filing.** The value stays **exactly** `npm run build && node scripts/electron-divergence.mjs`. **The `build`-first clause is LOAD-BEARING against a stale `dist`** (`docs/pending.md`'s P4 row / `HOST-F-DIST-STALE`; this unit's predecessor §2.2 `D-3`) | **PINNED BY THE PROGRAM** (`A-7`) and **kept stable here**; precision: the `G-9`/`X-9` protected set this repo can name does **not** list the `divergence` value — the pin is carried by `A-7` and by `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §2.5, and this filing carries it forward |
| `package.json` → `scripts.test` · `scripts.test:watch` | **UNCHANGED — never touched** | **`G-9`-pinned VALUES**: `test` must stay the plain suite run with no `--testTimeout`; `test:watch` likewise |
| `vitest.config.ts` (any byte), `vitest.conformance.config.ts` | **UNCHANGED — never touched** | `testTimeout` is pinned **exactly** (floor **and** ceiling, `15_000`) |

### 1.5 The DENIED surface (explicit, so the allow-list is never widened by implication)

**DENIED:** `src/**` in **any** form — **including `src/renderer/renderer.ts`'s boot wiring, `src/renderer/sidebar-panes.ts`,
`src/renderer/runtime.ts`'s load/reconcile path, `src/main/template-shape.ts`, `src/main/mcp-server.ts`'s
tool registry, `src/main/security.ts`'s group table, `src/main/battery-host.ts`, and the four divergent
baseline files** · `tests/**` **other than the one new row file**, and **never** a `PROTECTED` file
(`unit-u2-rich-decompose`, `unit-s-paste-sanitization`, `template-adversarial`, `unit-live11-bridge-seams`,
`unit-u5-rich-commit-ipc`, `unit-v5-bridge-capture`, `unit-wave-1-bridge-wiring`,
`unit-import-batch-persist-contract`, `tests/fixtures/v5-bridge-capture-fixture.js`) · either **fence file**
(`tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts`) · the existing
`tests/unit-divergence-spawn-contract.test.ts` (**that unit's red set is that unit's; an edit here is a
different unit's change**) · `package.json`'s any other key · `vitest.config.ts` ·
`vitest.conformance.config.ts` · `vendor/**` · **`scripts/live-drive.mjs` — the live battery driver is NOT
this unit's surface** (its own scenarios' drift is filed elsewhere) · `scripts/start-app.sh` ·
`scripts/mcp-cli.mjs` · `scripts/foundation-drift.mjs` · `../Provident-Electron/**` — **NEVER, in any
direction** (`AGENTS.md` item 7; the program's `G-8`) · every `docs/**` file except this spec and the
tracker appends §9 names.

**A unit that needs a byte of that list is a NEW unit or an architect ruling — never this one.** **In
particular: if the leg cannot be made green without a `src/**` change, this unit STOPS and escalates (§8
`E-3`), exactly as its predecessor's `E-4` did.** **⟨AMENDED 2026-10-05 — THE STOP FIRED AND THE RULING CAME BACK APP-SIDE. `src/**` stayed untouched by this unit; the change the green needs is the APP-SIDE unit's (`§0A.3` `F-3` item 3), whose contract this unit CONSUMES. The DENIED list above is NOT widened, NOT narrowed and NOT relaxed — in particular the app's `userData` config is NOT this unit's to write (`§0A.3` `F-3` item 2).⟩**

### 1.6 What this unit is NOT

It is **not** an app fix, and **not** a boot-wiring change: the app's boot template is **correct and stays**
(`FINDING-2`/`S-4`) · **not** fix shape (C) — no demo-boot mode is added to `src/**` (§2.4) · **not** fix
shape (B) — the drive is **not** re-pointed at the app's authored surface (§2.3) · **not** the harness
fixture's **single-source-of-truth** work (the `S-7` two-copies observation is `U-DIVERGENCE-SPAWN`'s §9.1
`T-4` class and is **escalated here, not absorbed**: §8 `E-2`) · **not** the leg's check-set or `N` work
(`F-2`) · **not** a live battery (it enables the pre-live precondition; it claims no live green) · **not**
the scratch/spawn/cleanup contract (that is `U-DIVERGENCE-SPAWN`'s, and **its readings are inputs here**:
`M-1`) · **not** a tracker rewrite (the supervisor owns rows outside the appends §9 names) · **not** the
carried baseline red `PANE-TOGGLE-STAGE-COLLAPSE` / `P-SM-1`, which stays carried
(`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1)).

### 1.7 THE HONESTY BLOCK — what this pass could NOT verify

| # | Unverified item | What would settle it |
| --- | --- | --- |
| **O-1** | **Whether the app's boot-time `loadEnvelope` can land AFTER the drive's load** (`S-5`: the host boot is fire-and-forget and `ready()` is not sequenced behind it). If it can, the demo graph is replaced by the app's own assembled envelope **mid-drive** and the leg would red again — the SAME `unresolved target` reading as `M-2`, from a different mechanism. **This pass did not run the leg and could not time it.** **⟨AMENDED 2026-10-05 (`F-2` item 3) — SETTLED, AND ANSWERED POSITIVELY: it CAN land, and it DOES — the boot lands ~`250`–`540` ms after `connect` and REPLACES the demo graph. The as-filed row is KEPT. This row is no longer open; its remedy is APP-SIDE (`§0A.3` `F-3`).⟩** | The implementer's **§2 `C-2` readiness probe** (which reads the load's effect back) plus a run of `npm run divergence`. **If the probe fires, that is a FINDING to record verbatim, not a licence to add a sleep.** |
| **O-2** | **Whether every element of the app's pre-load DOM graph leaves the mount on a load** (`FINDING-2`'s LIMIT: the loader sweeps `#wiki-root` by selector, and the diff can only remove tracked elements). **If a stale element survives, the comparison's `data-node-id`-set check may still diverge after fix (A)** — a legitimate RED whose honest disposition is a recorded finding + an escalation, **never** a comparison-set change (§2 `C-3`). | `§4.2` `R-6` (a source/shape row for the sweep's presence and its selector), then the **class (b)** run's own `data-node-id`-set reading. |
| **O-3** | **Whether the demo envelope's root element and the app's boot template share the mount/root surface the comparison reads.** **Read this pass:** the demo literal's template root is `{ type: 'div', css: { classes: ['demo-shell'] } }` (**no `css.id`, no `props.id`**), and the app boot's content root carries the **authored `props.id: 'wiki-root'`** with a `zone:main` child — i.e. **the two graphs do NOT share an authored root id**, and the comparison therefore reads the **mount's `data-node-id` set**, not an authored-id. **UNVERIFIED:** whether the mounted DOM after a load is **exactly one** root div of the demo's shape. | The **class (b)** run's `data-node-id`-set and census readings; and `§4.2` `R-6`/`R-7`. |
| **O-4** | **Whether the `graph` group is ON in the built app's default gate at this head** — read this pass only as the gate table's shape (`TOOL_GROUPS` mapping + default-enabled set), **not** measured through a boot. **⟨AMENDED 2026-10-05 (`F-2` item 2) — SETTLED, AND ANSWERED NEGATIVELY: the group is OFF through the leg's own spawn contract. `tools/list` on the booted app returns `9` tools with `provident.load` ABSENT (`defaultSecurityConfig()` enables `['read','dispatch']`; the persisted config lives in the app's `userData` and a fresh per-spawn scratch profile has none; the server registers a group's tools only when the group is enabled). The `§2` `C-2` item 4 refusal NAMED itself exactly as this row predicted, and the remedy is APP-SIDE (`§0A.3` `F-3`).⟩** | The **class (b)** run: if `provident.load` were refused, the leg's own new step fails loudly and names the refusal (§2 `C-2` item 4), which is the reading that settles `O-4` either way. |
| **O-5** | **The check count a green will print.** This filing predicts **nothing**: `O-5` of this unit's predecessor records that the count on an off-green run is not the comparison-stage count, and `F-1a` makes a new check a pin drift. **⟨AMENDED 2026-10-05 (`F-3` item 4) — NOT superseded: NO `<n>` exists to quote, because the class (b) run is still RED (`§0A.2` `F-2`). The row stands as filed. Its sibling `O-5` of the predecessor is untouched by this amendment.⟩** **⟨FURTHER AMENDED 2026-10-05 (`§0B.1` `F-5`) — THE `<n>` NOW EXISTS: the class (b) run reads `R13 RESULT: 9 checks, 0 failures`, exit `0` (RECORDED READING; measurer: the implementer's `T-1` pass). It is an OBSERVATION, never a re-pin (`§6` `V-5` stands), and the as-filed sentences above are KEPT as the earlier run's reading. **`9` = the `8` comparison rows + the leg-1 boot check; the failure branch is the `else` arm and does not fire on this run** (`§0B.1` item 8).⟩** | The run's own `R13 RESULT: <n> checks, 0 failures` line, **recorded verbatim in the DONE row** (§6 `V-5`). |
| **O-6** | **Whether fix (A) is SUFFICIENT for a green** (i.e. whether `O-1`/`O-2`/`O-3` all resolve benignly). | **Nothing but the class (b) run.** If it stays RED after (A) for a cause `C-2`'s probe names, the honest next step is **a recorded escalation with the reading attached** (§8 `E-1`), never a comparison-set edit. **⟨AMENDED 2026-10-05 (`F-2`/`F-3`) — ANSWERED NEGATIVELY: fix (A) is NOT sufficient for a green at this head, and the red was named by the probe's own class of reading. The honest next step taken was the recorded escalation `§8` `E-1` contemplated — and the architect disposed it APP-SIDE (`§0A.3` `F-3`), NOT by a comparison-set edit.⟩** |

---

## 2. The fix shape — the contract, not a guess

### 2.1 `C-1` — THE SYMMETRY: both legs load the SAME demo envelope through ONE shared step

**`C-1`.** **Before leg 1 drives, THE LEG ITSELF loads its demo envelope into the app through the app's own
MCP surface — the same call, the same argument shape and the same value leg 2 performs.**

1. **The call:** `client.callTool({ name: 'provident.load', arguments: { kind: 'envelope', envelope: demoEnvelope() } })`
   — `kind: 'envelope'` is the A2 load path (`Runtime.load` → `loadEnvelope`), and `demoEnvelope()` is **the
   leg's existing literal** (`C-3` item 2 forbids moving it).
2. **ONE shared step, not two hand-written copies.** The load is performed through **a single helper that
   both legs call** (the implementer's name/shape), so the script can no longer hold one loaded leg and one
   unloaded leg — the exact asymmetry `S-1`/`S-2` measure. **A row must be able to assert that both legs'
   load steps come from ONE function** (§4.2 `R-3`).
3. **Position: after `connect`, BEFORE the first `drive` read.** The ordering is contract, not style:
   `drive()`'s **first** call is `provident.get_rendered_html`, so a load placed after it would make the
   `census`/`ssr` half of the comparison read the **app's boot graph** — a different comparison from the one
   the script's header declares (`S-2`) and a different reading from leg 2's. **The sequence per leg is
   exactly: `connect` → `load(demoEnvelope())` → [readiness probe, `C-2`] → `drive`.** **⟨REFINED 2026-10-05 (`§0B.3` `F-7`) — THE ORDER IS NOW `connect → wait (bounded) → load → probe → drive`: a `waitForBootInstalled(client)` step (`§0B.3` `F-7` items 1–5, its client-pinned constants, its four named loud stops) sits BETWEEN `connect` and this load step, reading the app's published install state. **This clause's own rule is REFINED, not contradicted: the load still sits after `connect` and before the first `drive` read.** The as-filed sentence above is KEPT.⟩**
4. **Both legs keep their existing spawn/transport/env contract untouched.** `U-DIVERGENCE-SPAWN`'s §3.1–§3.6
   (the nine-member vector at both sites, the per-spawn scratch profile, the cleanup, the fail-loud
   classifier, the env pair) are **inputs, not surfaces**: this unit changes **none** of them, and the load
   step is **not** a spawn argument. **⟨AMENDED 2026-10-05 (`§0B.2` `F-6`) — ONE ENV MEMBER IS ADDED, AND NOTHING ELSE MOVES: `scripts/electron-divergence.mjs` now carries `PROVIDENT_ENABLE_TOOL_GROUPS: 'graph'` in the spawn environment at BOTH Electron sites, beside `DISPLAY`/`ELECTRON_DISABLE_SANDBOX`. It is **additive to this item's *"env contract untouched"*** — record **why** the ENV spelling was taken rather than an argv member: **the vector is pinned at NINE members and `siteArgs` THROWS on a tenth**, which is exactly what the app-side contract's route rules, so an argv spelling is unavailable and the ENV member is the ruled client-side route. **The nine-member vector, the per-spawn scratch profiles, the cleanup discipline and `siteArgs`'s equality check are UNCHANGED** (`§0B.2` items 1/3; `§0B.4` item 5). The as-filed sentence above is KEPT.⟩**
5. **No new tool, no new leg, no third child, and no new dispatch.** The load rides the **existing** tool
   surface (`FINDING-1`) on the **existing** connection. **⟨AMENDED 2026-10-05 — item 4's SPAWN contract is unchanged, but its `KIND` assumption is now MEASURED AGAINST: the load rides the existing tool surface only when that tool's GROUP is ENABLED, and through the leg's fresh per-spawn scratch profile it is NOT (`§0A.2` `F-2` item 2). The enablement route is APP-SIDE and is NOT taken here (`§0A.3` `F-3`); item 4's forbidden route — a harness-side config side-write — stands UNRELAXED.⟩** **⟨FURTHER ANNOTATED 2026-10-05 (`§0B.2` `F-6` item 4) — the app-side unit has since LANDED a launch-scoped ENABLEMENT ROUTE, and the leg now uses it through the env member: `[provident-main] tool groups: … requested=[graph] effective=[read, dispatch, graph] (source=env)` (RECORDED READING; measurer: the implementer's `T-1` pass). **This is still NOT the harness-side config side-write the annotation above forbids, and NOT a `src/**` write by this unit (`§7` `D-6` stands)** — and the as-filed `§0A.3` `F-3` text is KEPT, dated, with its finding id (`§0B.2` item 4). The `graph` group is now SERVED, so this item's `KIND` assumption reads as satisfied at this head.⟩**

### 2.2 `C-2` — THE DRIVE-READINESS PRECONDITION (and its loud stop)

**`C-2`.** **A load whose EFFECT cannot be observed is not a fix; the leg must read back what it loaded, or
stop loudly.**

1. **THE LOAD MUST BE OBSERVABLY IN EFFECT BEFORE ANY DISPATCH.** After the load step and before
   `drive(client)`, the leg **reads a surface that only the demo graph can produce** — the admissible
   evidence is drawn from the leg's **own existing tool set** (`FINDING-1` item 5): the load's own returned
   `census` and/or a `provident.get_rendered_html` read (the demo's `counter`/`inc`/`echo-out` authored ids),
   and/or `provident.list_targets` (the demo's id vocabulary).
2. **THE PRECONDITION IS LOUD ON FAILURE AND SILENT ON SUCCESS**, and it is **not** a `ok()` comparison row:
   - on **success** it prints nothing that changes the census (so the `R13 RESULT: <n>` line and the
     comparison's own accounting are untouched — `C-3` item 1);
   - on **failure** the leg **STOPS before driving**, names **which** surface was missing, and **exits `1`**
     **without pretending to have compared anything** (no comparison row may be emitted from a graph the leg
     did not load — a `shim = real` row computed from two different graphs is the false-green this clause
     exists to forbid);
   - **the mechanism (a thrown error caught by the existing leg-1 `try`/`catch`, or an explicit named stop)
     is the implementer's least-code choice**; the **obligation** is not optional.
3. **WHY THE PRECONDITION EXISTS — AND IT IS NOT DECORATION (`O-1`).** `S-5` proves the app's authored graph
   is installed by a **fire-and-forget async boot** that is **not** sequenced behind `renderer ready`. So a
   drive that loads and immediately dispatches can race that boot. **The implementer MUST record what the
   probe observed on the landing run** — *"the load was in effect"* or *"the probe fired, with this
   reading"* — **and may NOT paper the hazard over with a fixed sleep**: a sleep is a timing guess, and a
   timing guess in a leg whose whole value is determinism is a review finding.
4. **A REFUSAL NAMES ITSELF.** If the app's gate refuses `provident.load` (the `O-4` case), the probe's
   failure text must **quote the tool error**, so the reading distinguishes *"the group is off"* from *"the
   load landed and was superseded"* from *"the load landed and the target is genuinely absent"*. **⟨AMENDED
   2026-10-05 — THE `O-4` CASE IS THE LANDED ONE, AND THIS CLAUSE DELIVERED: the run read `✗ electron
   connect/drive failed: the load step was REFUSED by the tool surface: MCP error -32602: Tool
   provident.load not found` (`§0A.2` `F-2` item 1) — the group-is-off case, quoted with its tool error,
   exactly as this clause requires. **`C-2` item 3's NO-SLEEP rule is UNRELAXED and stands VERBATIM**; the
   probe's `absentDemoIds(…) → readinessStop` shape is `§0A.1` `F-1` item 2. The remedy for the gate is
   APP-SIDE (`§0A.3` `F-3`), never a harness-side config write.⟩**
5. **THE FAILURE STILL COUNTS.** A probe failure is a leg failure: it reaches the leg's existing arithmetic
   (a recorded failure and `exit 1`), and it **adds no new exit code** — `{0,1}` stands (`C-3` item 4).
6. **UNVERIFIED-BY-DESIGN — SAID OUT LOUD:** whether the probe will **hold or fire** at this head is `O-1`,
   and **this filing does not predict it**. Its job is to convert an **ambiguous** red into a **named**
   one — the same discipline `U-DIVERGENCE-SPAWN`'s §3.6 `C-6` applied to the boot failure.

### 2.3 `C-3` — WHAT IS PRESERVED (carried forward BY NAME: `U-DIVERGENCE-SPAWN` §3.7 `C-7`)

**`C-3`.** **The preservation clause is carried forward by name and extended by nothing.**

1. **NO NEW CHECK; THE COMPARISON SET IS UNCHANGED.** The **eight** comparison rows, the leg-1 boot check
   (`electron: dispatch renderedNonEmpty`) and the failure branch (`electron leg produced a result`, with
   `false`) each keep their **labels, their order, their conditions and their `ok()` helper semantics**.
   `ok()`'s arithmetic (`checks` increments per call; `failures` increments on a false condition) is
   untouched. **This unit adds no `ok()` call.** **⟨`F-4`, CORRECTED 2026-10-05 — THE EMITTED COUNT IS
   `10`, NOT `8`: the clause above lists the three components, and the leg EMITS **`10` `ok()` CALLS** =
   the **`8`** comparison rows **+ the leg-1 boot check + the failure branch** (RECORDED READING: the
   implementer's post-landing pass, *"the `ok()` labels and their order (10 calls)"* — `§0A.1` `F-1`
   item 7). **The as-filed `8` is KEPT VISIBLE above as the COMPARISON-SET count, which it correctly is**;
   the ambiguity this clause carried was that it reads as the emitted total. **Nothing in this item's
   normative content moves**: no `ok()` call is added, the labels and their order are unchanged, and
   `§0.3`'s `F-1a` (a new check is a PIN DRIFT) is honoured. **`§10.3` item 3 carries the same correction**;
   the register's `78` is unmoved (`§0A.4` `F-4`).⟩**
2. **THE DEMO ENVELOPE LITERAL IS UNCHANGED** — the same 12 nodes, the same authored ids, the same handler
   bodies, the same `clientConfig`. **The load step CONSUMES it; it does not move it** (`S-7`'s two-copies
   observation is escalated, not harmonised: §8 `E-2`).
3. **THE `drive()` FUNCTION IS UNCHANGED AND STAYS SHARED.** The same four calls in the same order
   (`get_rendered_html` → `dispatch{cssId:'inc', event:'click'}` → `get_rendered_html` →
   `list_targets`), the same returned record's eight members, the same `norm()` minted-id normalization
   (**`node-N` → `node#`**), the same `drive` used by **both** legs.
4. **THE EXIT CONTRACT STAYS `{0,1}`** — a clean run `0`, any recorded failure `1`, whatever the count
   (`exitCodeFor`, `failureCount`).
5. **THE TWO-LEG STRUCTURE STAYS**: leg 1 = the real Electron app over the SDK `StdioClientTransport`;
   leg 2 = the DOM-shim battery host over `process.execPath`. **No third leg, no third child, no
   re-ordering of the legs' comparison stage.**
6. **THE HARNESS'S IMPORT SAFETY AND THE SCRATCH CONTRACT STAY** — the module's entry-point guard (importing
   it boots nothing) and the cleanup sweep's report line remain exactly as `U-DIVERGENCE-SPAWN` landed them.
7. **IF THE IMPLEMENTER FINDS THAT A PRESERVED ELEMENT MUST MOVE**, that is a **contract change this spec
   does not authorise**: the unit **stops and escalates** (§8 `E-1`), recording the reading that forced it.

### 2.4 THE REFUSED ALTERNATIVES — and the exact reason each is refused

**REFUSED: (B) RE-POINT — driving the app's own booted authored surface instead of the demo envelope.**

1. **It changes WHAT THE LEG COMPARES, which is the one thing this leg's identity rests on.** leg 2 cannot
   load "whatever the app happens to boot": the shim host boots **root-only** (`S-6`) and is loaded by the
   script. To re-point leg 1, the script would have to make leg 2 load **the app's assembled
   pane-inclusive envelope** — an envelope only the app's host can assemble (`loadAppGraph` derives it from
   the RAG snapshot + the stored template, `S-5`). **That makes the leg depend on a live store, a stored
   template and a doc-heads fetch before it can compare anything** — a **store/engine precondition** this
   harness does not have and `A-7` does not ask for.
2. **It also destroys the leg's determinism**: the app's assembled envelope is data-dependent (documents,
   panes, operator settings), so the compared surfaces would vary run to run — **the opposite of a
   structural comparison**, and the failure mode that made this leg's sibling class of instruments
   unreliable (a reading that cannot be re-derived is not an instrument).
3. **Its comparison would then be one-sided in a worse way:** every `drive()` target the script owns —
   `inc`, `counter`, `echo-out` — is **authored by the demo literal** (`S-8`). A re-pointed drive must
   therefore invent a **new** target set against the app's authored graph, which **is** a comparison-set
   change (`C-3` item 1) and, per `F-1a`, a **pin drift** in the sibling leg's own vocabulary.
4. **The row's own text already names this direction as the inferior one** by giving (B) the qualifier *"a
   different comparison, and it must name what it then compares"* — **it does not name what it then
   compares**, and this filing refuses to invent it: the script's stated purpose (`S-2`) is the demo.

**REFUSED: (C) BOOT MODE — the app gains an explicit demo-boot mode the leg passes.**

1. **It is a `src/**` change, and the smallest version of it is larger than the whole defect:** the leg would
   need a flag from the main process (`--demo-envelope` class) threaded into the renderer's boot wiring,
   which would have to **skip the host boot** (or suppress it) for the leg's benefit. That is the app's boot
   path — a surface `U-DIVERGENCE-SPAWN`'s `E-4` and this unit's `§1.5` put **behind an architect ruling**.
2. **It would make production behave differently under a test flag**, which is exactly the *"the harness
   bends the app"* direction the foundation's ruling (`F-1`) rejects: the harness is **in the update scope**;
   the app is not the harness's to parameterise.
3. **It is unnecessary**: the app **already exposes the route (A) needs** (`FINDING-1`) and **already**
   performs whole-graph replacement loads at its own boot (`FINDING-2`). **A `src/**` change is refused where
   a `scripts/**` change suffices**, and (A) is that change.
4. **And it would still be wrong about the fixture**: a demo-boot mode would serve the **harness literal**
   through app code, i.e. it would move the hand-copied literal (`S-7`) **into the app** — widening the
   two-copies defect from one harness file to the app's boot, in the pass that exists to close a fixture
   mismatch. **Refused in the strongest terms available to this filing.**

**⟨A THIRD OPTION IS REFUSED BY NAME, because a reader will reach for it: "just let leg 1 drive whatever is
booted and skip the comparison when it is empty."⟩ That is **(B) plus a swallowed red**, and it is the
false-green class `C-2` item 2 forbids: a comparison row emitted from two different graphs. Refused.**

---

## 3. The red-set plan (`RCA-1` — red FIRST, RUN, and REPORTED)

**The red set is authored by the TestWriter from this section, RUN, and its tally REPORTED before any
implementation** (`AGENTS.md` item 3; `RCA-1`). **Nothing in this section is a test this pass wrote, and
nothing here was run by this pass.**

### 3.1 The two classes, and which one is this unit's own gate

| # | Class | What it proves | What it CANNOT prove |
| --- | --- | --- | --- |
| **(a)** | **The no-Electron-boot class** — the majority of the red set (rows over the leg's **drive structure**: source text + the module's exported surface, read **without booting anything** — the module's entry-point guard guarantees an import boots nothing) | that **both legs perform the same load, of the same value, before the same drive**; that the **comparison set, the `ok()` labels/order, the demo literal's structure, the exit contract and the two-leg structure are PRESERVED**; that the **readiness precondition exists and is loud** | that Electron **boots**; that the **load lands**; that the leg turns **green** |
| **(b)** | **The real-run class** — the rows that require **`npm run build && node scripts/electron-divergence.mjs`** (**the pinned key's own value**, unchanged) | **(i)** the leg reaches **`R13 RESULT: <n> checks, 0 failures` with exit `0`**, `<n>` recorded verbatim; **(ii)** the readiness probe's **observed** disposition (`O-1`); **(iii)** the run's `data-node-id`/census readings (the `O-2`/`O-3` settle) | that the app **works** (`RCA-12`: the leg is structural only, and after this fix it drives the demo) |

**`C-8`. THE UNIT'S OWN GATE IS (b).** Class (a) makes the red set **runnable before the fix** and
**regression-bearing after it**; class (b) is what makes the unit's claim honest. **A DONE row that cites
(a) and no (b) reading is a review finding** (`RCA-1`).

### 3.2 The rows that FAIL AT THIS HEAD (class (a) — no Electron boot needed)

Each row is stated as the **property**, the **observation that must fail today**, and the **source of the
observation**. Every "fails today" claim is a **VERIFIED-BY-READ** of `S-1`…`S-8` — **this pass did not run
the rows**, so the red tally is **predicted by read, not measured**.

| # | Row | Why it FAILS at this head |
| --- | --- | --- |
| **R-1** | **leg 1's sequence contains a `provident.load` of the leg's demo envelope, positioned after `connect` and BEFORE the first `drive` call.** | **FAILS** — **S-1**: leg 1's block is `connect` → `drive`, with no load call at all. *(This is the defect's own row: `M-2` is its consequence.)* |
| **R-2** | **leg 2's load step is PRESERVED** (the same `provident.load` with `kind: 'envelope'` and the same envelope value), i.e. the fix does not move the working half. | **PASSES today and must keep passing** — **S-1**/**S-6**; the **preservation** row. |
| **R-3** | **BOTH legs' load steps come from ONE shared function/step** (a single call site of a single helper, invoked by both legs — not two structurally similar blocks that can drift). | **FAILS** — **S-1**: there is exactly one load call site and it belongs to leg 2. *(The row must fail for a fix that copies the call into leg 1 by hand while leaving leg 2's own copy beside it: that shape re-creates the asymmetry as soon as either side is edited.)* |
| **R-4** | **The readiness precondition EXISTS**: between the load and `drive`, the leg reads a demo-only surface back, and a missing surface **stops the leg loudly** (a thrown/named stop) rather than proceeding. | **FAILS** — **C-2** is not implemented in any form at this head; nothing between `connect` and `drive` reads anything. |
| **R-5** | **The readiness precondition does NOT perturb the census**: it emits **no `ok()` call** (so `checks`/`failures` and the `R13 RESULT: <n>` accounting are unchanged by it). | **PASSES vacuously today** and **must keep passing** — this is the row that fails a probe implemented as a ninth comparison row (`C-3` item 1). |
| **R-6** | **The whole-graph REPLACEMENT is a read-level property of the load path AND the stale-mount sweep is present**: a source row asserting (a) the load path tears down before it replaces (one supervisor/hub per load, prior in-tree non-root nodes destroyed) and (b) the teardown sweeps the root element out of the mount by selector. | **PASSES today** — **FINDING-2**/**S-4**/**S-5**; the row that pins the app-side fact this unit's fix **depends on**, so a future `src/**` change that turns a load into an add-beside/mount-failure **reds here in the harness layer instead of silently re-breaking the leg**. |
| **R-7** | **The two graphs the comparison reads are distinguished**: the row asserts that the app's boot template's authored ids (`wiki-root`, `zone:main` — the `M-3`/`S-4` pair, read from `src/main/template-shape.ts`) are **absent** from the demo envelope's authored ids, and that the demo's own four driven ids (`inc`, `counter`, `echo-out`, `echo-input`) are **authored by the demo literal**. | **PASSES today** — **S-8**/**`S-4`**; it is the **row that documents WHY the mismatch is structural**, and it fails if a later edit makes the two vocabularies collide (`O-3`). |
| **R-8** | **THE PRESERVATION SET, asserted as one row group**: the eight comparison rows' **labels and order**, the leg-1 boot check and the failure branch, the `drive()` record's **eight members**, `norm()`'s minted-id normalization, the exit contract's **`{0,1}`**, the **two-leg** structure, the demo literal's **12 nodes** and its authored ids, the module's **entry-point guard**, the scratch sweep's **report line** and the `{removed, leftover, passes}` shape. | **PASSES today and must keep passing** — **C-3**/**S-7** and `U-DIVERGENCE-SPAWN`'s §3.7 `C-7`. *(This is the regression guard that stops a fixture fix from quietly widening what is compared.)* |
| **R-9** | **The pinned keys are untouched**: `package.json`'s `divergence` reads **exactly** `npm run build && node scripts/electron-divergence.mjs`; `test`/`test:watch` carry **no** `--testTimeout`; `vitest.config.ts`'s `testTimeout` reads **exactly** `15_000`. | **PASSES today** — **§1.4**'s pin table; the protected file `tests/unit-v5-migration-contract.test.ts`'s §2c item 6 rows remain **the authority**, and a re-assertion here is **a cross-check only**. |

**⟨THE RED TALLY IS NOT PREDICTED HERE.⟩** Rows `R-1`/`R-3`/`R-4` are the **new-red** rows at this head;
`R-2`/`R-5`/`R-6`/`R-7`/`R-8`/`R-9` are **preservation/regression** rows that **pass today**. **The
TestWriter reports the executed tally and the red reasons** (`C-9`), and **the count of rows the TestWriter
writes is the TestWriter's, not this filing's** — this section fixes the **properties**, and a row that
merges two properties into one row must say so.

### 3.3 Class (b) — the rows that need the REAL run, and what they settle

**`C-9`.**

1. **B-1 — the leg boots, drives, AND READS GREEN.** The reading is **`R13 RESULT: <n> checks, 0 failures`
   with exit `0`**, `<n>` recorded verbatim. **This row settles `O-5`/`O-6` and is the unit's own gate.**
2. **B-2 — the readiness probe's OBSERVED disposition** (`O-1`): *"the load was in effect before the first
   dispatch"* — or *"the probe FIRED, naming <surface>"*, which is **a finding to record verbatim**, and the
   honest next step is then **§8 `E-1`, not a sleep**.
3. **B-3 — the run's structural readings, recorded even on a RED**: the two legs' `census.inTree` /
   `census.registered`, their `data-node-id` sets and their `nodeId` vocabularies — i.e. **the `O-2`/`O-3`
   settle**, quoted whether they agree or not. **A RED whose reading is not quoted is not a reading.**
4. **B-4 — the scratch half stays green** (`U-DIVERGENCE-SPAWN`'s own class (b)): the sweep line reads
   **`leftover: NONE`** with **0** surviving processes and an empty scratch root after the run. **A fixture
   fix may not regress the spawn fix** — and if it does, the spawn contract's own rows must red.
5. **B-5 — no live battery is claimed.** `npm run divergence` green is a **precondition**, never a live
   green (`M-4`/`M-6`); the live layer belongs to the live-battery units.

### 3.4 What the red set must NOT do

**`C-10`.** It must not **spawn Electron** in class (a) (the module's existing entry-point guard makes that
achievable, and a suite that boots Electron turns every `npm test` into a host-capability lottery) · it must
not **mock `'electron'`** (the protected bridge-mock name-set) · it must not **read a `G-9`-frozen artefact
as an oracle** (`vitest.config.ts`, `src/main/markdown-import.ts`, the `DEEP_ROWS` files, the bridge-capture
fixture, the test-script VALUES) · it must not **assert on a line number** (a row pins a **property**, never
an offset) · it must not **weaken a preserved row** to make the fix easier (`C-3`) · it must not **edit the
sibling unit's** `tests/unit-divergence-spawn-contract.test.ts`.

### 3.5 The `§3a` SEED SET — adversarial probes, reserved in the house shape

**These are NOT tests this pass wrote.** They are **pre-registered falsification attempts** for the
post-green adversarial pass (`RCA-3`), each stated as a probe with its expected **honest** outcome. A probe
that *passes* against a claim here is a **finding**; the disposition column is filled by that pass.

| Probe id | The probe | The claim it tries to falsify | Disposition |
| --- | --- | --- | --- |
| **`A-1`** | Issue the leg's load and immediately (no wait) read `list_targets`. | **`C-2` item 3** — the load's effect is observable **before** the dispatch, so the probe is a real precondition and not a timing guess. | **RESERVED** |
| **`A-2`** | Send `{ kind: 'envelope', envelope: <a malformed/non-object envelope> }` as leg 1's load. | **`C-2` item 4** — the refusal **names itself** from the tool error; the leg does not proceed to a `shim = real` comparison. | **RESERVED** |
| **`A-3`** | Replace leg 1's drive target with a `cssId` the demo does **not** author (e.g. `wiki-root`). | **`C-3` item 1** — the failure is a **leg failure with a named cause**, and the comparison rows' accounting is unchanged. | **RESERVED** |
| **`A-4`** | Delete leg 2's load step and run the leg. | **`R-3`/`C-1` item 2** — a one-sided load **reds loudly** at the shim leg (its root-only boot authors no `inc`), so the asymmetry cannot come back silently. | **RESERVED** |
| **`A-5`** | Add a `provident.load` **after** `drive()`'s first read (a plausible "fix" ordering mistake). | **`C-1` item 3** — the ordering is contract: a late load makes the census/SSR half read a different graph, and the row must red. | **RESERVED** |
| **`A-6`** | Run the leg twice concurrently (two terminals, same checkout, isolated ports). | **`C-2`/`C-3`** + `U-DIVERGENCE-SPAWN`'s freshness — the second run's scratch profile, its ports and its readings do not collide (`M-6`'s discipline). | **RESERVED** |
| **`A-7`** | Make the boot's assembled graph land late (or replay `O-1`'s race deliberately) and read the probe's output. | **`C-2` item 3** — the probe **fires and names** the superseded load rather than letting the leg red with `M-2`'s ambiguous message. | **RESERVED** |
| **`A-8`** | Add a ninth `ok()` call to the harness and run the leg. | **`C-3` item 1** + **`F-1a`** — the green's `<n>` is an **observation**, so an added check is visible in the reading and is a **pin drift**, never a silent pass. | **RESERVED** |
| **`A-9`** | Point the leg at a **stale `dist`** (drop `npm run build` from a local invocation, not from the key). | **§1.4**'s `build`-first clause — the reading becomes **suspect** (the leg would measure a previous build), so the pinned key's shape is load-bearing. | **RESERVED** |
| **`A-10`** | Move the demo literal (drop `echo-card`) and run the leg. | **`C-3` item 2** + `C-1` item 1 — the fixture's move is **detectable** in the leg's own readings and in `R-8`, and never silent. | **RESERVED** |

### 3.6 The red-set readings the DONE row must carry (`RCA-1`'s record)

**`C-11`.** The DONE row states: **(i)** the **red tally** for class (a) as the TestWriter measured it —
`<rows> red / <rows> green out of <total>`, with the **red reasons** (the missing load, the missing shared
step, the missing precondition) — **measured BEFORE the implementation**; **(ii)** the **green tally** after
the least-code implementation; **(iii)** the **class (b)** reading **verbatim** — `R13 RESULT: <n> checks, 0
failures`, exit `0`, plus the probe's observed disposition (B-2) and the structural readings (B-3); **(iv)**
the **adversarial** disposition of §3.5 and the **item-10d documentation-review** record; **(v)** **the
layer** (HARNESS/`[D]`) on every line. **An entry that claims green without a recorded red run is a review
finding** (`RCA-1`).

---

## 4. The typed Property register (code-bearing unit — no exemption is available)

### 4.1 Is this unit code-bearing? YES

**The unit changes executable code** (a `scripts/**` harness file) **and adds a test file** — both halves are
code. Per the standing ruling (`PBT-REGISTER-REQUIRED-FOR-CODE-UNITS`, cited across this repo's specs as an
ACTIVE policy — **the ruling's text is quoted from `AGENTS.md` item 11 by the specs that own it**, and this
filing cites it **as that policy, not as a `docs/decisions.md` row id**: `docs/decisions.md` carries **no**
row with that title — VERIFIED-BY-READ this pass, so the citation is given in its honest form), **the
zero-row exemption covers only genuinely invariant-free / doc-only / config-only / non-JS units, and it is
NOT claimed here.**

**Execution discipline (the ruling's, unchanged):** deterministic — exhaustive/finite enumeration or a
**pinned-seed** generator; **caps: ≤100 attempts per row · ≤400 attempts total · stop-after-5**; each row
reports its **strategy id** and **held/broken**; the **adversarial pass audits it read-only**. **Pinned
seed: `0x20260930`** (the filing date, in the house's hex form). **No new dependency** — plain deterministic
vitest tables suffice (the in-repo precedent executed 8 of 8 rows with tables and no new devDependency).

**Only `P-IM-` / `P-SM-` / `P-TP-` rows appear. No `F-` row. No `§`-citation is a register row.**
**Row ids are namespaced to this unit's own file** and do **not** collide with
`tests/unit-divergence-spawn-contract.test.ts`'s `P-IM-1..3`/`P-SM-1..3`/`P-TP-1..2` (that file is
**DENIED** to this unit: §1.5). **`P-IM-4` and `P-TH-*` do NOT exist in this register.**

### 4.2 The register (8 rows — every term printed as the sum of its factors)

| Row | Kind | The property | The terms of its attempt budget | Attempts |
| --- | --- | --- | --- | --- |
| **`P-IM-1`** | **INVARIANT** | **BOTH LEGS LOAD THE SAME DEMO ENVELOPE BEFORE THEY DRIVE** — one shared load step, invoked by leg 1 and leg 2; its argument is `{ kind: 'envelope', envelope: demoEnvelope() }`; it sits after that leg's `connect` and before the call to `drive`. | 2 legs × 2 arms (the load is present; its position precedes `drive`) + 2 negative draws (a leg 1 with **no** load — this head; a leg 1 loaded with a **different** envelope value) | **`2*2+2 = 6`** |
| **`P-IM-2`** | **INVARIANT** | **THE COMPARISON SET, THE `drive()` SURFACE AND THE EXIT CONTRACT ARE STRUCTURALLY IDENTICAL TO THE PRE-FIX HEAD** — the same four `drive()` calls in order, the same eight returned members, the same eight comparison labels in the same order (plus the leg-1 boot check and the failure branch), `ok()`'s `checks`/`failures` arithmetic, and `exitCodeFor`'s `{0,1}`. | 4 `drive()` calls + 8 returned members + 8 comparison labels + 2 arithmetic/exit draws + 1 normalization draw (`node-N` → `node#`) | **`4+8+8+2+1 = 23`** |
| **`P-IM-3`** | **INVARIANT** | **THE DEMO LITERAL IS UNCHANGED AND STILL TRACKS THE FORK'S SOURCE OF TRUTH** — 12 nodes, the same authored ids and the same authored `props.id` members as `src/shared/demo-envelope.ts`'s `template.root` (`S-7`). | 12 authored node positions + 1 node-count draw + 2 negative draws (a dropped node; a re-spelled authored id) | **`12+1+2 = 15`** |
| **`P-SM-1`** | **STATE-MACHINE** | **THE DRIVE READINESS IS OBSERVABLE, AND ITS FAILURE IS LOUD** — three states (the load not yet requested · the load requested and in effect · the load requested and superseded/refused): the in-effect state proceeds to `drive` **silently** (no `ok()` call, no census change); the superseded/refused state **stops before any comparison row** and **names the missing surface / quotes the tool error**; the not-yet-requested state is unreachable in the landed sequence (a draw asserts `drive` is never reached without the load). | 3 states × 2 arms (silent-on-success, loud-on-failure) + 2 negative draws (a probe that fires but lets the leg continue; a probe that reds a comparison row instead of stopping) | **`3*2+2 = 8`** |
| **`P-SM-2`** | **STATE-MACHINE** | **EXACTLY TWO HOSTS AND EXACTLY ONE LOAD PER HOST** — the run spawns 2 children (one real-Electron pair-site vector; one `process.execPath` shim host), the load is issued **once per leg**, and no leg loads twice or drives before loading. **⟨2026-10-05: the landed pass recorded that *"the one unscorable negative in `P-SM-2` was re-shaped — the declared terms unmoved"* (`§0A.1` `F-1` item 8). **The property above and the attempt budget below are the DECLARED terms and are UNMOVED** (`3*2+2 = 8`); the re-shape is a body-level act recorded in that pass, not a clause amendment here.⟩** | 2 hosts × 2 arms (host count; loads per host) + 2 negative draws (a third host; a zero-load leg) | **`2*2+2 = 6`** |
| **`P-SM-3`** | **STATE-MACHINE** | **THE APP'S OWN `provident.load` ROUTE IS THE ONE THE LEG USES, AND IT EXISTS AT BOTH ENDS** — the tool name is registered (`ALL_TOOLS`), group-gated (`TOOL_GROUPS` → `graph`), routed (`dispatch(name)` ⇒ the renderer's `load` method) and handled (`Runtime.load` → `loadEnvelope`); and the shim host answers the same tool name through its own runtime. **⟨AMENDED 2026-10-05 (`F-2` item 2) — THE ROUTE EXISTS AT BOTH ENDS, BUT AT THE APP END IT IS **REGISTERED-BUT-NOT-SERVED** through the leg's own spawn contract: the tool NAME is in `ALL_TOOLS`, yet `tools/list` on the booted app returns `9` tools with `provident.load` ABSENT, because the `graph` group is OFF under the fresh per-spawn scratch profile's default config. **This row's property (the name is registered; the route reaches that host's runtime) is UNCHANGED and NO term of it moves**; the enablement is APP-SIDE (`§0A.3` `F-3`). **This row is HARNESS/`[D]` only, as `§4.3` item 2 states.**⟩** | 2 hosts × 2 arms (the name is registered; the route reaches that host's runtime) + 2 negative draws (an unregistered name; a load routed to a method the renderer does not carry) | **`2*2+2 = 6`** |
| **`P-TP-1`** | **TOTALITY** | **NO INPUT SHAPE THROWS WHERE A NAMED STOP IS CONTRACT** — a load refusal (a gate error, a malformed envelope payload), a load that lands but leaves the demo surface absent, and a transport-level error during the load each produce a **named** stop (never an unhandled rejection, never a bare `undefined`, never a silent skip into `drive`). | 3 failure shapes × 2 report arms (a named cause; the honest "no cause captured" form) + 1 draw asserting the existing leg-1 `try`/`catch` still records its failure | **`3*2+1 = 7`** |
| **`P-TP-2`** | **TOTALITY** | **THE SPAWN/SCRATCH CONTRACT THIS FIX RIDES ON IS UNTOUCHED** — the nine-member vector at both sites, one `--user-data-dir=` member per spawn, the cleanup hook armed at creation, the bounded delete-and-verify sweep's report shape, and the module's entry-point guard (import boots nothing). | 2 sites × 2 arms (the vector; the profile member) + 2 draws (the cleanup report shape; import-safety) + 1 sweep-bound draw | **`2*2+2+1 = 7`** |

**ARITHMETIC, printed with its terms:** `6 + 23 + 15 + 8 + 6 + 6 + 7 + 7 = 78` attempts total — **under the
≤400 cap**; **the largest single row is `P-IM-2` at 23**, **under the ≤100 cap**; **8 rows**, at the
house cap of ≤8. **stop-after-5** on every row (`≤5` distinct counterexamples reported, then the row stops).
**Seed `0x20260930`; strategy ids:** `strat:divergence-fixture-symmetry` · `strat:divergence-fixture-preserved-surfaces` ·
`strat:divergence-fixture-literal` · `strat:divergence-fixture-readiness` · `strat:divergence-fixture-hosts` ·
`strat:divergence-fixture-load-route` · `strat:divergence-fixture-totality` · `strat:divergence-fixture-spawn-untouched`.
**Every row reports `held`/`broken`; the report prints each row's declared-vs-executed term.**

### 4.3 The register's own honesty limits

1. **No row asserts the leg's COLOUR.** The green is class (b) in §3.3 and is a **precondition**.
2. **No row asserts the APP.** Every row is HARNESS/`[D]`. `P-SM-3` reads the app's **route** (a source
   fact) — it does **not** claim the app renders or works.
3. **The register executes the same instrument the class-(a) rows read** — the harness's own source/exported
   surface. **That is deliberate** (the register is the exhaustive half of one contract).
4. **A row that cannot be executed at the filed shape is `BROKEN`, not silently re-scoped** — the landed
   reading is reported against the **declared** term, exactly as this unit's predecessor's remand recorded
   (`docs/next-steps.md`'s `U-DIVERGENCE-SPAWN` DONE row: *"four register bodies reconciled to their
   **DECLARED** terms"*).

---

## 5. The layer ledger — and what this unit does NOT claim

**`L-1`.** **Every deliverable of this unit is HARNESS / `[D]`-layer.** It edits a local instrument and adds
a harness-contract row file. **It renders nothing, authors no envelope, and is imported by nothing that
renders.**

**`L-2`.** **THE SCOPE/LATER STATEMENT REQUIRED BY THE DEFECT'S OWN SHAPE: the fix CHANGES WHAT LEG 1
OBSERVES, AND THAT MUST BE SAID PLAINLY.** Before the fix, leg 1's *intent* was to compare against the app's
boot graph — but **it never got there** (`M-2`: it died at the dispatch). **After the fix, leg 1 compares the
SAME demo envelope leg 2 loads.** **So the leg, after this unit, proves:** *the harness can boot a real
Electron, connect over stdio, drive the app's **own** `provident.load` route to install the demo envelope
into the app's **own** Runtime, and observe the same shim-stable surfaces the DOM-shim host produces —
matching.* **And it no longer proves:** **anything about the APP'S OWN BOOTED GRAPH** — not its census, not
its SSR fragment, not its authored id vocabulary, not its panes, not its `wiki-root`/`zone:main` template.
**That was never proved by this leg in any green state** (the leg has never been green), so **nothing that
was ever measured is being dropped** — but **the honest reading of the green changes**, and every citation of
it must carry this sentence: *"a `divergence` green says the two hosts agree about the SAME fixture; it
says nothing about the app's own boot graph."*

**`L-3`.** **This unit does NOT fix the app, and does NOT touch the app's boot.** The app's boot template is
**correct and stays** (`S-4`); what was stale was the **harness's assumption** (`S-1`/`S-2`), and the
foundation's ruling (`F-1`) puts the fix in the tool.

**`L-4`.** **A green here does NOT make any unit's live row green.** It clears a **precondition** (`M-4`):
units whose live batteries were `PRECONDITION-FAILED` still owe **their own** live runs on a display against
the assembled app (`RCA-11`; `M-6`).

**`L-5`.** **No envelope-green, app-green, store-green, engine-green or live-green is claimed — and the
divergence leg is never app-green by construction** (structural comparison only; collected by nothing).

**`L-6`.** **Nothing in this file is a measurement of this pass.** The readings are `M-1`…`M-7` (recorded,
each with its measurer) and the reads are `S-1`…`S-8` (**VERIFIED-BY-READ this pass**); the rest is contract.

---

## 6. Verification — which leg covers which layer, the trio, and the DONE row's reading

**`V-1`.** **THE LAYER MAP (RCA-12), stated so no reader over-reads the green:**

| Claim | The instrument that covers it | The layer it is evidence for |
| --- | --- | --- |
| the load symmetry, the readiness stop, the preserved surfaces/labels/exit contract | the **new row file** (class (a)) + the register (§4) | **HARNESS `[D]`** (a source/shape claim about the instrument) |
| the leg boots, connects, loads **and** drives on a real Electron | **`npm run divergence`** (class (b), `C-9`) | **HARNESS `[D]`** — a **precondition** for the live batteries |
| the app's own surface works for a user | **NOT COVERED BY THIS UNIT** | **APP / assembled-renderer** — the live-battery units' own layer |
| the app's own booted graph | **NOT COVERED — after this unit the leg does not read it** (§5 `L-2`) | — |

**`V-2`.** **THE TRIO.** The unit's change set is a `scripts/**` file plus a `tests/**` file, so the standing
trio is owed and reported: **`npm test`** (the new row file green; **the carried baseline red
`PANE-TOGGLE-STAGE-COLLAPSE` / `P-SM-1` remains carried** and is **not** this unit's to fix) ·
**`npm run typecheck`** exit 0 · **`npm run build`** exit 0. **`npm run battery` is HARNESS-green, never
app-green**, and is quoted as such if it is run.

**`V-3`.** **THE UNIT'S OWN GATE IS THE CLASS (b) RUN** (`C-8`): `npm run divergence` reaching **`R13
RESULT: <n> checks, 0 failures` with exit `0`** — on a display, with **isolated ports** and
**boot-and-connect confirmed before driving** (`M-6`).

**`V-4`.** **What that reading is, and is not:** it is **evidence that the real-DOM leg bootstrapped,
connected, performed the app's own load, and drove the demo with matching shim-stable surfaces**. **It is
never app-green; it is in no trio; it is collected by nothing** (`vitest.config.ts`'s `include` does not
reach `scripts/**`).

**`V-5`.** **`<n>` IS AN OBSERVATION, NEVER A RE-PIN** (`O-5`; `F-1a`): the green's own `n` is **recorded in
the DONE row** with its exit code and is **not** made into a new pinned constant. **A green must be cited as
`R13 RESULT: <n> checks, 0 failures` — never as "R13 passed", and never with `n` omitted.**

**`V-6`.** **The DONE row also carries** the red tally + red reasons (`C-11`), the adversarial disposition
(`RCA-3`), the item-10d documentation review's record (`RCA-6`, per-unit and after the greens), the live-run
discipline statement (`M-6`), and the **layer on every line**.

---

## 7. Decisions and defaults

**`D-1` — THE FIX SHAPE.** **RULED: (A) SYMMETRY** (§1.2/§2.1), with the readiness precondition
(`C-2`). **(B) RE-POINT and (C) BOOT MODE are REFUSED** with the reasons of §2.4, **and the refusal is
carried with the unit so a later pass does not re-litigate it blind.**

**`D-2` — THE ROW'S TWO DIRECTIONS ARE DISPOSED.** `docs/pending.md`'s
`LIVE-DIVERGENCE-LEG-FIXTURE-MISMATCH` row offered **(a)** *"re-point leg 1's drive at what the app's boot
wiring actually serves"* and **(b)** *"give the leg's boot path a mode that serves its demo envelope"*.
**This finding's (A) is the row's (b) IN ITS `scripts/**`-ONLY FORM**: the leg's own path already has the
route (`FINDING-1`) and the app's boot path is left alone — so **the row's own second direction is taken,
and its first is refused** (`D-1`). The row is **discharged by this filing's §9 append** once the landing
pass reports; **until then it stays OWED with this spec as its owner.**

**`D-3` — THE PINNED `divergence` KEY STAYS.** Its value stays exactly
`npm run build && node scripts/electron-divergence.mjs`; **the `build`-first clause is LOAD-BEARING** (a
stale-`dist` boot would let the leg measure a previous build). **Consequences:** an edit that **drops**
`npm run build` is a contract change this unit does not authorise; an edit that **adds** a flag, an env
export or a wrapper is a contract change to the leg's identity and belongs to a unit that declares it.

**`D-4` — THE FIXTURE IS CONSUMED, NOT MOVED.** The demo literal stays where it is and stays as it is
(`C-3` item 2). **The two-copies observation (`S-7`) is NOT closed here** — it is escalated (§8 `E-2`), and
per `F-1`'s ruling its closure belongs to a unit that declares itself the fixture's single-source-of-truth
pass.

**`D-5` — THE READINESS PROBE IS A PRECONDITION, NOT A CHECK.** It adds no `ok()` call and no census
(`C-2` item 2 / §3.2 `R-5`). **If the implementer concludes that the only honest form is a comparison row,
the unit STOPS and escalates** (§8 `E-1`) — that is a comparison-set change.

**`D-6` — THE APP IS UNTOUCHED.** `src/**` stays byte-identical; if a green needs a `src/**` byte, the unit
stops (§8 `E-3`).

**`D-7` — NO LIVE CLAIM.** The unit neither runs nor claims a live battery; `scripts/live-drive.mjs` is
**not** its surface (§1.5).

---

## 8. Owed items and escalations (each with an owner)

| # | Item | Owner | Why it is owed / escalated rather than decided here |
| --- | --- | --- | --- |
| **`E-1`** | **The STOP-AND-ESCALATE route if (A) + the readiness probe do not produce a green.** If class (b) reads RED after the fix, the reading must be recorded verbatim, with the probe's disposition, and **the disposition of the next step is the architect's**: the admissible directions are (i) the stale-element finding (`O-2`) as a **new harness unit of its own**, (ii) a **new architect ruling** on the leg's comparison set (`C-3` is not this unit's to move), or (iii) the honest carried state — **a named RED precondition with its reading attached and every dependent live gate reported `PRECONDITION-FAILED`** (`RCA-11`). **A comparison-set edit is NOT an admissible direction.** **⟨DISPOSED 2026-10-05 (`F-2`/`F-3`) — THE ROUTE WAS TAKEN AND ITS OUTCOME IS RECORDED. Class (b) read RED after (A) + the readiness probe, the reading was recorded verbatim with the probe's disposition (`§0A.2` `F-2`), and the architect's disposition was NEITHER (i) a new stale-element harness unit NOR (ii) a new comparison-set ruling NOR (iii) a carried `PRECONDITION-FAILED` only: it is the APP-SIDE unit of `§0A.3` `F-3` item 3 (`docs/specs/unit-app-harness-readiness.md`). **`E-1`'s own prohibition stands unrelaxed** — no comparison-set edit was taken, and none is admissible. **Note the premise correction: this row's text assumes (A) + the probe were expected to go green; they did not, because the blockers are APP-SIDE (`§0A.3` `F-3` item 4).⟩** | **ARCHITECT** | A comparison-set change is a contract change, and this unit's own `C-3` forbids it. |
| **`E-2`** | **THE OWED FIXTURE SINGLE-SOURCE OF TRUTH — `U-DIVERGENCE-SPAWN` §9.1 `T-4`, NOT CLOSED HERE.** The harness's `demoEnvelope()` is a **hand-copied literal** beside `src/shared/demo-envelope.ts` (`S-7`); the predecessor's `T-4` records the class (with the foundation's ruling `F-1` as the precedent) and its `§4.5` `A-9` probe as the keeper of the gap. **This unit READS the two and finds them in step at this head; it does not harmonise them** (`C-3` item 2 / `D-4`). | **THE ARCHITECT (mint the unit) → then that unit's own cycle** | The fixture's single-source-of-truth work is a **different** deliverable from the drive-fixture mismatch: (A) exists to make leg 1 load the fixture; importing the fork's envelope into the harness would change **which value** the leg loads. **Two changes, one leg, one unit each.** |
| **`E-3`** | **THE STOP-CONDITION: if a green requires a `src/**` change, this unit stops.** (The `O-1` race, if it turns out to need app-side sequencing of `ready()` behind the host boot, is **exactly** this case.) | **ARCHITECT** | A fixture/sequencing fix in the harness may not absorb an app change (`D-6`); the stop is **recorded as a finding**, never worked around. **⟨DISPOSED 2026-10-05 — **TAKEN**. The stop condition FIRED: a green requires an app-side change (`§0A.2` `F-2` items 2/3), and the escalation was ANSWERED by the architect (`§0A.3` `F-3`). **The stop was obeyed, not worked around**: no `src/**` byte and no harness-side config side-write was taken, the reading was recorded as a finding (`§0A.2`), and **the work moves to the app-side unit whose contract this unit CONSUMES** (`§0A.3` `F-3` item 3). **`E-3` is no longer an open escalation.** **`§2.1` `C-1` item 4 and `§2.2` `C-2` item 3 — the two forbidden routes — stand UNCHANGED and UNRELAXED.**⟩** |
| **`E-4`** | **THE OWED SPEC AMENDMENT the `U-DIVERGENCE-SPAWN` pass left BEHIND — carried here with its text, because a reader of this unit needs it.** **The predecessor's owed amendment is TWO items:** **(i) the ENTRY-GUARD/EXPORT-SURFACE RULING** — §3.1 item 6 offered the implementer **two admissible routes** to an inspectable contract (read the source text, **or** make it reachable by module import behind a main-module guard), the landed file **took route (b)** (its own header: *"IMPORTING THIS MODULE BOOTS NOTHING"*, and the guard at the foot), and **§3.1 item 6's ruling that route (b) satisfies the clause** was never written into that spec; **(ii) THE FOUR ROW-BODY RECONCILIATIONS** — the landing pass's record (`docs/next-steps.md`'s `U-DIVERGENCE-SPAWN` DONE row) states *"a TestWriter row-body remand (four register bodies reconciled to their **DECLARED** terms …)"* while the **spec's §5.2 register still prints the declared terms as filed**, with no amendment ledger recording which four bodies moved or why. **Both halves are `docs/specs/unit-divergence-harness-precondition.md`'s own amendment (`§12`-class), NOT this unit's file.** | **THE SPEC-WRITER, on `docs/specs/unit-divergence-harness-precondition.md`** | It is a **doc-reconciliation** on a sibling spec (names/arithmetic/landed-route vs as-filed terms). **This unit may not edit that file** (§1.5), and **this filing does not amend it by implication**: it records the debt and its owner. **This unit DEPENDS on the landed route**: its own `P-TP-2` row asserts the entry-point guard's import-safety, so the ruling is cited here as a **landed fact** (VERIFIED-BY-READ at this head) *and* as an **owed doc amendment**. **⟨ANNOTATED 2026-10-05 (`§0C` items 1/2 + `§0B.5` item (d)) — **STILL OWED, and NOT discharged by this file's `T-1` amendment** (that amendment is THIS file's own; `E-4`'s two halves are the PREDECESSOR spec's). **Two precisions recorded at the citation, so neither is invented later:** (a) *"`§12`-class"* is a **pass CLASS name, not an address** — `docs/specs/unit-divergence-harness-precondition.md` **has no `§11`/`§12`** either (its sections are `§0`…`§10`), so the phrase never named one of its sections; and (b) this amendment is placed as **`§0B`**, beside `§0A` at the head, rather than as a minted `§12` (`§10.4`'s numbering discipline). The as-filed row is KEPT.⟩** |
| **`E-5`** | **THE STANDING LIVE-RUN DISCIPLINE THIS UNIT'S RUNS MUST OBEY** (`DECIDED: LIVE-GATE-RUN-DISCIPLINE`, ACTIVE): **isolated MCP + CDP ports on every live run**, **boot-and-connect confirmed before driving**, a **matrix report with no verdict per declared row is INVALID**, a **live PASS is ADDITIVE / APP-green only and retires no `[T]` row**, and **a live FAIL is evidence split by layer before any disposition**. The recorded hazard is **standing, not incidental** (`docs/pending.md` §DEFERRED: a concurrent sibling holds CDP `:9222` and issues `pkill -f "electron \."`). | **EVERY PASS THAT RUNS A LIVE GATE** (this unit's class (b) run included — it must use its own isolated ports, and its own scratch profile is the spawn contract's) | The rule is **decided**; this row exists so the DONE row **cites** it rather than re-deriving it. **It is also why a leg red at the DRIVE step with boot green did not, and does not, bar the live batteries** — with the decision and its reason recorded. |
| **`E-6`** | **The `docs/defects.md` row's closure.** `LIVE-DIVERGENCE-LEG-DRIVE-FIXTURE-MISMATCH` is **OPEN** at this head. | **THE SUPERVISOR** (a tracker act, not a spec's) | This unit **specifies** the fix; **closing the defect row and annotating `docs/pending.md`'s owed row are the supervisor's landing acts**. This filing supplies the text (§9). |
| **`E-7`** | **Any foundation-side defect discovered while reading the precedent.** **Read this pass: NONE is discovered** — the precedent rows (`F-1`, `F-1a`, `F-2`, `F-3`) are consistent with this repo's own reads, and **nothing in that tree needs a patch or a handoff for this unit**. | **Nobody** (recorded so a reader does not look for a handoff row that does not exist) | Stated because `AGENTS.md` item 7 makes a foundation finding a handoff: **the honest reading is "no row owed", and an empty search is a finding too.** |
| **`E-8`** | **THE OWED ITEMS THE `T-1` AMENDMENT CARRIES — ADDED 2026-10-05 (`§0B.5` `F-9`), because the leg's class (b) GREEN changes what is owed without closing any of these.** **(i) THE LIVE BATTERY HAS NOT BEEN RE-RUN** since the app-side unit landed: `npm run divergence` green (`§0B.1` `F-5`) **makes the dependent live runs executable again and proves NOTHING about the app** (`RCA-11`; `§5` `L-4`; `§3.3` `B-5`) — **every unit whose live gate read `PRECONDITION-FAILED` still owes its OWN live run on a display against the assembled app.** **(ii) THE 32 APP-LAYER `[U]` FAILS the first live run recorded remain UNTOUCHED by this unit** — a harness green neither fixes nor measures them, and **their count and set are the LIVE layer's own tracker reading, quoted as RECORDED INPUT with the live pass as its measurer, never re-derived by this amendment.** **(iii) THE `docs/defects.md` / `docs/pending.md` CLOSURE** of the row this unit cleared (`E-6`) is **still open** — a supervisor act. **(iv) THE OWED FIXTURE SINGLE-SOURCE UNIT** (`E-2`) is **NOT closed** by the green (`§7` `D-4` stands). **(v) THE PREDECESSOR SPEC'S OWN AMENDMENT** (`E-4`) is **NOT discharged** by this pass (`§0C` item 1). | **`EVERY LIVE-BATTERY UNIT` (i/ii) · `THE SUPERVISOR` (iii) · `THE ARCHITECT` → that unit (iv) · `THE SPEC-WRITER` on the PREDECESSOR (v)** | They are owed **because the green is HARNESS/`[D]`-only** (`§0B.4`'s closing layer statement; `RCA-12`): an amendment that turns a red precondition green **must state what the green does NOT settle**, or the next pass reads the green as app evidence — **the exact over-read `§0B.5` and this row exist to prevent.** |

---

## 9. The report the landing pass must make (the tracker appends this filing owes)

**`T-1`.** **`docs/next-steps.md` — ONE ANCHORED APPEND** in the post-division CURRENT WORK region,
recording: this unit's filing (path, id, layer), **the ruled fix shape (A) and the two refusals**, the
preserved-surfaces clause (`C-3`, carried from `U-DIVERGENCE-SPAWN` §3.7 `C-7` **by name**), the red-set
shape and the unit's own gate, the register's arithmetic, **the `O-1` race and the readiness probe**, and
the owed items' owners. **Anchored append only — never a whole-file write** (`RCA-8(c)`); **no existing row
is rewritten.**

**`T-2`.** **`docs/pending.md` — ONE ANCHORED ANNOTATION on the `LIVE-DIVERGENCE-LEG-FIXTURE-MISMATCH`
row**, recording that the row's **own second direction** is taken in a `scripts/**`-only form, that the
**owner named at its head is now this unit**, and that its **revisit condition** is the class (b) run of §3.3.
**Anchored annotation only; the row's as-filed text is kept visible.**

**`T-3`.** **NOT written by this pass, and named so no reader expects them here:** the `docs/defects.md`
row's closure (`E-6`) · any `docs/decisions.md` row a ruling would need (`E-1`) · any `docs/HANDOFF.md` row
(**nothing foundation-side is owed**: `E-7`) · any `docs/specs/*-greens.md` or spec amendment on the
**sibling** spec (`E-4` is `docs/specs/unit-divergence-harness-precondition.md`'s own pass, **which is the PREDECESSOR —
and, per `§0C` item 1, this file's `T-1` amendment does NOT discharge it**).

**`T-4`.** **The landing pass's record shape (what the DONE row must contain)** is `§3.6` `C-11` plus `§6`
`V-1`…`V-6`: the red tally with reasons **measured before the implementation**, the green tally after
it, the class (b) reading **verbatim** (`R13 RESULT: <n> checks, 0 failures`, exit `0`), the probe's
disposition, the trio, the adversarial record, the item-10d documentation review, and **the layer on every
line**.

**⟨`T-4` AMENDED 2026-10-05 (`§0B`) — the record now EXISTS, and what the `T-1` pass recorded against this
row is the following; the as-filed list above is KEPT as the requirement it stated.** **(i)** the red tally +
reasons **measured before the implementation** — **as filed and run by the earlier landing pass, unchanged
by `T-1`** (`§0A.1` `F-1` item 4: class (a) `8/8` rows closed; `§0A.1` `F-1` item 8's TestWriter row-body
repair). **(ii)** the green tally after it — **recorded**. **(iii)** **THE CLASS (b) READING, VERBATIM:** the
`R13 RESULT: 9 checks, 0 failures` line, **exit `0`**; **the probe's OBSERVED disposition** (*"`inc`,
`counter`, `echo-out` addressable … (no sleep, no timing guess)"* — i.e. **the load was IN EFFECT before the
first dispatch**); **the bounded wait's observed state** (*"status=installed (epoch=1, generation=1) after `2`
poll(s)/`105` ms … (a state read, never a sleep)"*); **the enablement line** (`requested=[graph]
effective=[read, dispatch, graph] (source=env)`); and **the structural readings** (census `12 = 12` both
rows, the `data-node-id` set, the `nodeId` vocabulary, the counter increment, the non-empty dispatch) —
**all quoted at `§0B.1` with their measurer** (`§3.6` `C-11` item (iii); `§3.3` `B-1`/`B-3`). **(iv)** **the
layer on every line: HARNESS / `[D]`.** **The trio, the adversarial disposition of `§3.5` and the item-10d
documentation-review record are the LANDING pass's and are NOT stated by this doc-layer amendment** (`§0B`'s
own layer declaration); **and `§0B.5` adds what the green does NOT settle**, which `T-4`'s original list did
not name — **the live battery's re-run** (`§8` `E-8`).⟩**

---

## 10. Cross-references, and the census/numeric claims this file makes

### 10.1 The program documents this unit serves

| Document | What this unit takes from it |
| --- | --- |
| `docs/pending.md`'s `LIVE-DIVERGENCE-LEG-FIXTURE-MISMATCH` row | **the owed row this unit discharges** (its two admissible directions; its "genuinely UNASSIGNED" owner; its blocking statement) |
| `docs/defects.md`'s `LIVE-DIVERGENCE-LEG-DRIVE-FIXTURE-MISMATCH` row | the recorded reading (`M-1`/`M-2`/`M-3`) with its measurer |
| `docs/specs/unit-divergence-harness-precondition.md` | **the predecessor and the id's own source**: §3.7 `C-7` (the preservation clause, carried **by name**), §2.2 `D-3` (the pinned `divergence` key), §1.4 `O-5` (the count-is-an-observation rule), §3.3 (the cleanup contract this unit must not regress), §9.1 `T-4` (**the id `U-DIVERGENCE-FIXTURE` and the owed fixture-single-source class**, escalated here as `E-2`) |
| `docs/next-steps.md`'s `U-DIVERGENCE-SPAWN` DONE row + `PD-UI-6` gate-6 addendum | the landed state, the row-body remand (`E-4`), and the live-run discipline's setting (`M-6`) |
| `docs/specs/post-division-rebuild-proposal.md` §4.7 `A-7` + §7.5 | **the mandate**: `npm run divergence` is the **MANDATORY PRE-LIVE leg**; §7.5 item 3 records the harness fix as an owed unit |
| `docs/decisions.md` | `DECIDED: LIVE-GATE-RUN-DISCIPLINE` (ACTIVE) · `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` (ACTIVE, clause (1) — the carried baseline red) |
| `docs/specs/rca-live-bugs-green-pipeline.md` (`RCA-11`/`RCA-12`) | the layer discipline and the parked-by-default prohibition this file obeys |
| `AGENTS.md` items 3/6/7/10/11 | the red-first rule, the archival loop, the foundation non-modification rule, the blind-greens/doc-review gates, and the PBT register policy (§4.1) |

### 10.2 The source surfaces this filing READ (each read stated as such)

`scripts/electron-divergence.mjs` · `src/shared/demo-envelope.ts` · `src/renderer/renderer.ts` ·
`src/renderer/runtime.ts` · `src/renderer/sidebar-panes.ts` · `src/main/mcp-server.ts` ·
`src/main/security.ts` · `src/main/main.ts` · `src/main/template-shape.ts` · `src/main/battery-host.ts` ·
`src/shared/mount-invariant-guard.ts` · `package.json` · `vitest.config.ts` ·
`tests/unit-divergence-spawn-contract.test.ts`.

### 10.3 Census and numeric claims, each with its source

1. **`R13 RESULT: 1 checks, 2 failures`** and the two boot lines — the recorded red (**M-1**/**M-2**, with
   the implementer as measurer), **not** this pass's measurement. **⟨ANNOTATED 2026-10-05 (`§0B.1` `F-5`) — SUPERSEDED AS A READING, KEPT AS THE EARLIER RUN'S: the class (b) run now reads `R13 RESULT: 9 checks, 0 failures`, exit `0` (RECORDED READING; measurer: the implementer's `T-1` pass). **`1 checks, 2 failures` was the RED run's line and is not the leg's current colour**; the two boot lines it names are still the green run's, re-observed (`§0B.1` item 2).⟩**
2. **The demo envelope: `12` nodes**, in **both** the harness literal and `src/shared/demo-envelope.ts`
   (**S-7**) — **read this pass, both sides**.
3. **The compared surfaces: `8`** comparison `ok()` labels, **plus** the leg-1 boot check
   (`electron: dispatch renderedNonEmpty`) and **plus** the failure branch
   (`electron leg produced a result`, with `false`) — **read this pass** from the pre-fix head, and
   **preserved** (`C-3` item 1). *(The predecessor's `O-5` counts the comparison stage the same way:
   `8` comparison checks plus the boot check.)* **⟨`F-4`, CORRECTED 2026-10-05 — THE LEG EMITS `10` `ok()`
   CALLS: the `8` comparison rows **+** the leg-1 boot check **+** the failure branch (RECORDED READING: the
   implementer's post-landing pass, *"the `ok()` labels and their order (10 calls)"* — `§0A.1` `F-1`
   item 7). **The as-filed `8` is KEPT VISIBLE above and stands as the COMPARISON-SET count** — the ambiguity
   was only that this item reads as the emitted total. The clause is corrected here; `§2.3` `C-3` item 1
   carries the same correction; the register's `78` is unmoved (`§0A.4` `F-4`).⟩**
4. **`drive()` returns `8` members** (`census` · `ssr` · `dirtied` · `resultsNonEmpty` · `dataNodeIds` ·
   `renderedNonEmpty` · `counterPresent` · `nodeIds`) — **read this pass**; `P-IM-2`'s terms carry the
   count.
5. **`drive()` makes `4` tool calls** (`get_rendered_html` · `dispatch` · `get_rendered_html` ·
   `list_targets`) — **read this pass**.
6. **The spawn vector's nine members and the two spawn sites** — the predecessor's landed contract
   (`U-DIVERGENCE-SPAWN` §3.1 `C-1`; **not** re-measured here beyond reading the harness's own sites).
7. **The register: `8` rows · `78` attempts total · largest row `23`** (§4.2; every term printed as the sum
   of its factors).
8. **The exit contract: `{0,1}`** — read this pass (`exitCodeFor`/`failureCount`).
9. **The scratch sweep's printed shape**: `scratch cleanup (…) removed N · passes N · leftover: NONE|…` —
   read this pass (`cleanupScratchProfiles`'s report string), and its green reading is `M-1`'s (recorded).
10. **NO test is retired, archived or re-pointed by this unit** — so `DECIDED: REBUILD-ARCHIVE-POLICY`'s
    before→after count obligation is **not triggered**: the unit **edits one script** and **adds one row
    file**, and its before/after reading is **the new file's row count and the leg's own `<n>`**, stated in
    the DONE row (`C-11`).

### 10.4 Section-number and id discipline

**Every citation above is `path` + symbol / row id / `§section` — no line number is used as an address.**
**Section numbers used in this file are this file's own (`§0`…§10).** **Cross-cited sections of other
documents are named with their own numbers as their passes wrote them and are not renumbered here.** **⟨ADDED
2026-10-05 — the amendment ledger is `§0A`, this file's NEWEST section, placed at the head BY DESIGN (`§0A`'s
own placement note). **`§0`…`§10` keep their as-filed numbers and nothing is renumbered**; `§0A` adds a
section, it moves none.⟩** **⟨ADDED 2026-10-05 — the `T-1` amendment ledger is `§0B`, placed immediately after
`§0A` at the head BY DESIGN (`§0A`'s own placement note, applied again). **A literal `§11`/`§12` was NOT
minted**: the *"`§12`-class"* phrase in `docs/specs/unit-app-harness-readiness.md` §9 `T-1` and in this
file's `§8` `E-4` names a **pass CLASS**, never a section of this file (`§0C` item 2). **`§0`…`§10` keep
their as-filed numbers; `§0B` adds a section, it moves none.**⟩** **The
unit id `U-DIVERGENCE-FIXTURE` is minted by §9.1 `T-4` of `docs/specs/unit-divergence-harness-precondition.md`
and adopted here; no other document owns it.**
