# GATE 6 — LIVE-SCENARIO BATTERY for `U-MOCK-CORPUS-FIXTURE-SETS` (**UNIT B**) — the **HARNESS-SUBJECT** class-(b) readings of `§11.3`

| | |
| --- | --- |
| **Unit** | `U-MOCK-CORPUS-FIXTURE-SETS` (UNIT B) |
| **Date** | `2026-10-01` |
| **Repo / head** | `/media/ryanr/Shared Files/Projects/Astrographer` · branch `post-division-rebuild` · HEAD `f124358` + the unit's uncommitted landing (`scripts/live-drive.mjs`, `tests/live-drive-contract.test.ts`, `.gitignore`, the two fixture specs) |
| **Driver run against** | `scripts/live-drive.mjs` · **`md5 eac6d17477323f7770b0f6a4c011807e`** · **`9637` lines** (unchanged by this pass — **no file but this record was written**) |
| **Scope ruled by the architect** | **THE HARNESS-SUBJECT READINGS ONLY.** The pane / tab / doc-nav / stage `o0_*` **row batteries are NOT driven**: those surfaces are fork UI implementations being rebuilt on the foundation tooling and sit in `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`'s EXEMPT/OBSOLETE class; their rendered assertions belong to the adopting unit (`docs/specs/unit-zone-replacement.md`). They are carried below as **OBSERVATIONS with no verdict of their own**. |
| **Layer (`RCA-12`)** | This battery is the **harness feeding the rows**. Its subject is the **`[D]` harness / driver process**, not the panes, zones or tabs. Where a run printed an app-layer verdict, that is named as such and is **never** this unit's claim. |

**⟨GATE-7 PROOFREAD PASS `2026-10-05` (`AGENTS.md` item 10b / `RCA-6`; `RCA-8(c)` annotate-beside) — THE UNIT'S DOCS AUDITED AGAINST THE CODE AT THE LANDED HEAD, AND THE THREE READINGS THIS RECORD CARRIES THAT HAVE SINCE MOVED ARE MARKED AT THEIR OWN SITES (`§0.3`, `§1.7`, `§3.1`, `§3.2`, `§4`, `§5`).** **THIS PASS RAN NOTHING AND TOUCHED NO `scripts/**`, `tests/**` OR `src/**` BYTE.** **ITS INSTRUMENT IS THE FILE-READ TOOL: every line count it states is that tool's own line census (`VERIFIED-BY-READ`); every driver/pin figure it states is a `RECORDED READING` of the supervisor's own shell, quoted WITH ITS MEASURER.** **THE CURRENT HEAD IS `scripts/live-drive.mjs` · `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines (`RECORDED READING; measurer: the supervisor`; the `9681` corroborated by this pass's own file-read census, `VERIFIED-BY-READ`) — the `md5 eac6d17477323f7770b0f6a4c011807e` · `9637`-line driver this battery ran is the head of THIS RECORD, kept visible and unchanged at its own site above.** **THE PIN IS `tests/live-drive-contract.test.ts` · `md5 19af3936fbd390f8f2b998fa5897d13a` · `17066` lines, `0 RED / 57 GREEN` (`RECORDED READING; measurer: the supervisor`; the `17066` corroborated by this pass's file-read census) — the four third-register rows `P-IM-6` · `P-SM-5` · `P-TP-4` · `P-TP-5` (`17 + 12 + 11 + 27 = 67` declared, `57` executed, seed `0x20261005`, caps `≤100`/row · `≤400` · `≤8 rows`) remain HELD, and the pin's own `route-supply-refusal:refused-by-name` arm now grades the flag-by-name declaration in SOURCE. ⟨GATE-7 AMENDMENT: the `19af3936…` digest is the PRE-PASS one; this pass annotated ONE prose message inside the pin (the `repin-completeness:table-candidate` offence's stored-`<table>` wording), ONE line replaced by ONE line, so the `17066` is UNMOVED and the POST-PASS `md5` is `OWED` — this pass holds no shell and re-ran nothing.⟩** **THE TRIO OF RECORD (`RECORDED READING; measurer: the supervisor`): `Test Files 131 passed (131)` · `3003 passed | 22 skipped (3025)` · `0 failed` — the `123 passed (123)` this battery's `§0.3` quotes is its own reading of its own head, marked there.** **THE THREE MOVEMENTS, ONE LINE EACH: (a) the two-supply refusal's flag-by-name limb is CURED (`§1.7`, `§3.2`); (b) the `rag.query` `0 hit(s)` reading is CURED for `core`/`table`/`search`'s construction (`§3.1`); (c) the `--fixture=table` park is CURED (`§3.1`).** **LAYER (`RCA-12`): the `hits` reading and the row verdict are `[D]`/APP readings taken against a NAMED mock set — NEVER a live-corpus reading and never this unit's app claim.**⟩**

## 0. THE HONESTY BLOCK (`§9` clause 3, carried — the contract's own words, printed by the driver)

> `CONSEQUENCE: the rows this run reports were driven against the mock data set core; a fixture-fed PASS may NOT be quoted as a live-corpus app reading`

(verbatim, `core.out` line 4 — the `FIXTURE STATE` line's own clause). **Every reading below states its set and its run. No fixture-fed `PASS` in this record is quoted — or quotable — as a live-corpus app reading.** The `none`-state runs print a *different* consequence (`default.out` line 3, the conditional gate clause), and neither is a coverage claim.

## 0.1 THE LAYER LEDGER (`RCA-12`, stated before the readings)

| Instrument | What it is | What it can and cannot support |
| --- | --- | --- |
| **`HARNESS [D]` / pre-spawn process** | the driver is executed and exits by a contracted refusal **before any Electron child is spawned** | proves the refusal contract end to end (marker, value verbatim, exit code, nothing spawned, nothing written). Proves **nothing about an app**. |
| **`HARNESS [D]` / live-process (boot-and-connect, SCOPED)** | a real Electron boot, MCP + CDP connected, the driver's own launch lines printed, a **minimal `--block=` scope** executed | proves the **materialisation + import + root-text write + the three probes' launch-scoped readings + the run's declaration + the gate observation's printed members** against a real assembled app. **A SCOPED run is not coverage** — the run prints that itself. |
| **`NODE SUITE` (the pin)** | `npx vitest run tests/live-drive-contract.test.ts` | proves the driver's declared arms/figures. Never an app reading. |
| **`APP` / assembled renderer** | a block's own verdict, gesture and census | an **app-layer reading driven against the run's mock set** — quotable only as a reading against **that set**, never as a live-corpus reading, and never this unit's claim. |
| **`ENVELOPE`** | the provident authoring model (pure data/placements) | **not touched by this battery at all.** |
| **The trio** | `npm test` · `npm run typecheck` · `npm run build` | `scripts/live-drive.mjs` is in **no trio leg** (`§9` clause 6; `§11.3` item 10) — a green trio proves **nothing** about the driver. |

## 0.2 RUN HYGIENE (mandatory, discharged)

- `--display=:0` (X0 present) · `--disable-dev-shm-usage` is the driver's own default spawn form.
- **Isolated ports per run — `3980`–`3989` / `9480`–`9489`. `9222` was NEVER used** (it was free at start; `3980`–`3989` / `9480`–`9489` were verified free before the first run).
- **A scratch `--home` per run**: every live run took the driver's own `mkdtempSync` scratch under the OS temp root, and the driver removed it at its own end (`[live-drive] SCRATCH HOME: removed /tmp/astrolive-XXXXXX`).
- **Afterwards:** `ps -eo pid,cmd | grep -E "[l]ive-drive\.mjs|[e]lectron/dist/electron"` → **empty**; **no listener** on any of `3980`–`3989` / `9480`–`9489` (all released); `9222` not held; **`.live-fixture/` REMOVED from the repo root**; **`.live-page-edit-fixture.md` was never created** (absent before and after); `.live-corpus/` absent (the driver's own default seed route removes it); **no scratch home minted by this pass survives** (`/tmp/astrolive-*` entries all carry `2026-09-29`/`09-30` mtimes — **pre-existing, this pass's runs removed their own**). `git status --porcelain` after the pass reads **exactly** the seven pre-existing entries + the greens file + this record. `.live-fixture/` is gitignored (`.gitignore:156`), so the removal is hygiene, not a diff.

## 0.3 WHAT THE FROZEN MACHINERY READ AT THIS HEAD (verified by running, not carried)

| Reading | Command (ports) | Result |
| --- | --- | --- |
| **The pin** | `npx vitest run tests/live-drive-contract.test.ts` | **`ARM TALLY 0 RED / 57 GREEN of 57 DISTINCT executed node-side arm(s)`** · `RED SET … broken arm(s) 0; rows BROKEN at this filing head: (none)` · `Test Files 1 passed (1)` · **`Tests 123 passed (123)`** · exit `0` |
| **The four third-register rows HELD** | (same run) | `IDENTITY declaredLastTermOf === declaredClassB, read for all four rows: P-IM-6 0 === 0 · P-SM-5 0 === 0 · P-TP-4 0 === 0 · P-TP-5 10 === 10 — divergences: (none)` |
| **The register's tally** | (same run) | `TALLY declared 17 + 12 + 11 + 27 = 67 attempt(s); EXECUTED 57; class-(b) named NOT-RUN 10; seed 0x20261005; caps ≤ 100/row · ≤ 400 total · ≤ 8 rows` |
| **The trio** | `npm test` · `npm run typecheck` · `npm run build` | `Test Files 131 passed (131)` · **`Tests 3003 passed | 22 skipped (3025)`**, `0 failed`; `tsc --noEmit` exit `0` (no diagnostics); esbuild bundles written (`preload.cjs 19.3kb`, `standalone.mjs 1.3mb`, `battery-host.mjs 1.7mb`, `renderer.js 1012.1kb`) — **and it proves nothing about the driver** (`§11.3` item 10) |

**⚠ THE ONE MOVEMENT AGAINST THE GATE-5 GREENS: `rag.query` NOW ANSWERS.** The greens artifact recorded `rag.query for the probe's own constant term -> 0 hit(s)` under **every** set (`core`, `tabs`, `search`), and its `§5` `F-1`/`D-8` finding was built on that. At **this** head the driver prints a **`FIXTURE ROOT TEXT`** write (`.../3 imported document root(s) written with their own authored text through edit.set_content...`) and the probe now reads **`3 hit(s)` under `core`** and **`4 hit(s)` under `tabs`**, staying **`0` under `search`**. That greens finding is therefore **no longer exhibited at this head** and is **superseded by measurement** (see `§5.1`). This is recorded as a movement, never as a smoothing of the greens.

**⟨GATE-7 PROOFREAD PASS `2026-10-05` — THE READINGS THIS SECTION QUOTES ARE THIS RECORD'S OWN HEAD (`md5 eac6d17477323f7770b0f6a4c011807e` · `9637` lines) AND ARE KEPT VERBATIM; THREE OF THEM HAVE SINCE MOVED, AND THE MOVEMENT IS THE SUPERVISOR'S CURRENT HEAD (`md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines; `RECORDED READING`). (1) THE PIN: the quoted `Test Files 1 passed (1)` · `Tests 123 passed (123)` (and the `ARM TALLY 0 RED / 57 GREEN of 57 DISTINCT executed node-side arm(s)`) are that head's readings; the CURRENT pin reads `0 RED / 57 GREEN` with `17066` lines / `md5 19af3936fbd390f8f2b998fa5897d13a`, and the whole suite reads `Test Files 131 passed (131)` · `3003 passed | 22 skipped (3025)` · `0 failed` — so the `123` is NOT the current tally. (2) THE TRIO row: its `131 passed (131)` · `3003 passed | 22 skipped (3025)` · `0 failed` and its `tsc`/esbuild lines AGREE with the current head and are unmoved. (3) THE REGISTER: `17 + 12 + 11 + 27 = 67` declared · `57` executed · seed `0x20261005` · the caps · the four `P-IM-6`/`P-SM-5`/`P-TP-4`/`P-TP-5` rows HELD and `P-TP-5 10 === 10` — ALL UNMOVED at the current head (this pass read the register rows and the identity/arithmetic arms at their own sites in the pin, `VERIFIED-BY-READ`; the TALLY itself is a `RECORDED READING` of the supervisor's run, which this pass cannot execute on its doc-writes wall). THE FIGURES THIS PASS COULD NOT SETTLE ITSELF ARE LABELLED `RECORDED READING` WITH THE MEASURER NAMED, NOT ASSERTED AS ITS OWN.**⟩**

---

# 1. THE READINGS (one section per `§11.3` item, invocation and ports included)

## 1.1 `class-(b):core` — **`PASS`** (`§11.3` item 1, `FA-4`)

**Invocation:**

```
node scripts/live-drive.mjs --fixture=core --block=import \
  --port=3980 --cdp-port=9480 --display=:0            # exit 0 · boot-and-connect confirmed
```

**Verbatim — the three probes (`core.err`, one launch-scoped line, `§5.3` clause 3):**

```
[live-drive] FIXTURE PROBES (LIVE READINGS, §18.1/§18.6 clause 3 — the declared fixtures' own probes, taken AFTER the materialisation/import and the root-text write and BEFORE any block, at the pre-gesture read point): [{"fixtureName":"corpus-documents","tool":"rag.list_documents","present":true,"resolved":true,"detail":"rag.list_documents -> 3 document(s) (the fixture \"corpus-documents\" own read)"},{"fixtureName":"corpus-query-results","tool":"rag.query","present":true,"resolved":true,"detail":"rag.query for the probe's own constant term -> 3 hit(s) (the fixture \"corpus-query-results\" own read)"},{"fixtureName":"corpus-document-tabs","tool":"dom:#tab-strip .tab[data-document-id]","present":false,"resolved":true,"detail":"dom:#tab-strip .tab[data-document-id] -> 0 rendered row(s) (the fixture \"corpus-document-tabs\" own read)"},{"fixtureName":"self-provisioned-document","tool":null,...},{"fixtureName":"none","tool":null,...}] — 'corpus-documents': present=true at resolved=true via rag.list_documents · 'corpus-query-results': present=true at resolved=true via rag.query · 'corpus-document-tabs': present=false at resolved=true via dom:#tab-strip .tab[data-document-id] · ...
```

| `§11.3` item 1 clause | Observed | Verdict |
| --- | --- | --- |
| `'corpus-documents'` probe reads **PRESENT** | `present=true at resolved=true via rag.list_documents` (`3 document(s)`) | **PASS** |
| `'corpus-query-results'` probe reads **PRESENT**, on the **store query's `hits >= 1`** (`§18.2`/`§18.6` clause 3) | `present=true at resolved=true via rag.query` · **`rag.query for the probe's own constant term -> 3 hit(s)`** (was `0` at the greens head) | **PASS** |
| `'corpus-document-tabs'` probe | `dom:#tab-strip .tab[data-document-id] -> 0 rendered row(s)` — recorded **as a reading, never as a pass** (`§18.2` clauses 4/5) | **`SKIPPED-BY-RULING`** (GATE-5 ruling `2026-10-05`, `§22.3`: the tab strip is a fork UI implementation being rebuilt on the foundation tooling; `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`; adopting unit `docs/specs/unit-zone-replacement.md`) — **the skip is NOT a pass, and the `F-2`-closure claim may NOT be reported as discharged for this limb** |
| **no gated key parks** | `FIXTURE GATE OBSERVED … declared=35 gated key(s) · OBSERVED SPLIT: parked=0/35 … parked-by-the-fixture-gate=0 … parked-by-fixture-absence=0 … the remainder … eligible-and-not-parked=35 … the run count is blocksRun=1 (of the 100 counted blocks), so neither figure may be read as coverage · SCOPE: the 35 gated declared keys…` | **PASS** (the scoped-run caveat is the run's own printed one) |
| the set names **`core`** and **its materialisation root** | `[live-drive] FIXTURE MATERIALISED: fixtureId=core fixtureRoot=.live-fixture/core/` · `LAUNCH PROFILE: {"fixture":{"state":"mock data set core selected","kind":"mock-data-set","id":"core"},"fixtureRoot":".live-fixture/core/",…"noSeed":true,…}` | **PASS** |
| the run declares its fixture | `FIXTURE STATE: fixtureState="mock data set core selected" fixtureKind=mock-data-set fixtureId=core fixtureRoot=.live-fixture/core/ … DECLARED POPULATION: 35 gated key(s) …` | **PASS** |

**This is `FA-4`** as amended at `§18.6` clause 3: the store-list limb and the **store-query `hits >= 1`** limb read PRESENT under `core`, and `parkedByFixtureAbsence` reads `0`. **The rendered-strip limb is the ruled SKIP, not a third PRESENT.**

## 1.2 `class-(b):table` — **`PASS`** (`§11.3` item 2; the (verdict, evidence) pair, `§16.11`)

**Invocation:**

```
node scripts/live-drive.mjs --fixture=table \
  --block=u_edit_1_live_package_table_limitation \
  --port=3981 --cdp-port=9481 --display=:0            # exit 0
```

**Verbatim — the row's own verdict (`table.out` line 8, `ROW` line):**

```
ROW   u_edit_1_live_package_table_limitation row=U-EDIT-1-LIVE-6 block=u_edit_1_live_package_table_limitation verdict=PASS dclass=D-state realInput=true surface=target=assembled-renderer liveSurfacePresent=true proxyPASS=false proxy=null gesturePath=cdp failingClause=null evidence="table fixture={\"opened\":{\"docId\":\".live-fixture/table/table\",\"via\":\"bridge-openDocumentTab\",\"bridge\":{\"available\":true},\"tabId\":\"tab-3\",\"path\":null,\"marker\":\".live-fixture/table/table\"},\"tables\":1}; documentId=.live-fixture/table/table; rendered table census on the surface={\"tables\":1,\"trs\":1,\"tds\":4,\"tableRids\":[\".live-fixture/table/table:table:1\"],\"boxes\":[[253,-20,158,96]]}; typed edit + REAL blur => warning present=true kind=decompose-failed class=commit-failed painted=true text=\"⚠Commit failed (decompose-failed): page decomposer refused: a <table> block cannot be expressed by the adopted decomposer (recorded capability gap — a stored ta\"; store read-back unchanged=true; rendered tables after the refused commit=1 (census-preserved=true); note: the refusal path is the ADAPTER's recorded capability gap (provident-editable has no table/thead/tr/td/th node type)"
```

| `§11.3` item 2 / `§16.11` requirement | Observed | Verdict |
| --- | --- | --- |
| **NOT a `PARK`** | `verdict=PASS` **and** `[live-drive] done: 1 blocks, 0 FAIL, 0 PARKED, 0 NOT-DRIVEN` | **PASS** |
| a verdict of `PASS` or `FAIL` (both admissible) | `PASS` | **PASS** |
| **the evidence NAMES the found document** | `documentId=.live-fixture/table/table` (and `marker=.live-fixture/table/table`, the `§16.2` candidate head) | **PASS** |
| **the rendered table census** | `rendered table census on the surface={"tables":1,"trs":1,"tds":4,"tableRids":[".live-fixture/table/table:table:1"],"boxes":[[253,-20,158,96]]}` — a **painted-box** oracle (`boxes`), not a computed-style proxy | **PASS** |

**The row is not parked; its evidence names the table document and its rendered census.** *(The earlier greens `E-10` `FAIL` — "the row parks under `table`" — is **no longer exhibited at this head**: the import + root-text write now put the stored `<table>` where the row's own surface can render it.)* **Layer note:** the verdict is an **APP/assembled** reading (`surface=target=assembled-renderer liveSurfacePresent=true`, `realInput=true`, `gesturePath=cdp`) driven against the `table` mock set — quotable only as a reading **against that set**. The `<table>`-render capability itself is app-layer and is **not** this unit's claim (`§1.3`).

## 1.3 `class-(b):search` — **`PASS`** (`§11.3` item 3, `FA-1`)

**Invocation:**

```
node scripts/live-drive.mjs --fixture=search --block=uf_panes_14 \
  --port=3982 --cdp-port=9482 --display=:0            # exit 1 (see the pre-existing refusal below)
```

**Verbatim — the store query reads ABSENT at a NON-EMPTY store, and the park:**

```
[…] "fixtureName":"corpus-documents","tool":"rag.list_documents","present":true,"resolved":true,
     "detail":"rag.list_documents -> 3 document(s) …"
     "fixtureName":"corpus-query-results","tool":"rag.query","present":false,"resolved":true,
     "detail":"rag.query for the probe's own constant term -> 0 hit(s) …"

PARK  uf_panes_14        PARKED (the declared fixture corpus-query-results reads ABSENT at this run
  (rag.query for the probe's own constant term -> 0 hit(s) (the fixture "corpus-query-results" own read)))
  — the block uf_panes_14 own declared fixture probe read present:false at resolved:true via rag.query
  parkReason="the declared fixture corpus-query-results reads ABSENT at this run (rag.query for the
  probe's own constant term -> 0 hit(s) …)"

[live-drive] done: 1 blocks, 0 FAIL, 1 PARKED, 0 NOT-DRIVEN (a driver failure is never an app FAIL)

[live-drive] FIXTURE GATE OBSERVED … declared=35 gated key(s) · OBSERVED SPLIT: parked=1/35 …
  of which parked-by-the-fixture-gate=0 … and of which parked-by-fixture-absence=1 …
```

| Requirement | Observed | Verdict |
| --- | --- | --- |
| the store query reads **ABSENT at a non-empty store** (`FA-1`'s own precondition) | `rag.list_documents -> 3 document(s)` **and** `rag.query … -> 0 hit(s)` | **PASS** |
| a `'corpus-query-results'`-gated key **parks by name**, its `parkReason` **naming `corpus-query-results`** | `uf_panes_14` → `parkReason="the declared fixture corpus-query-results reads ABSENT at this run …"` | **PASS** |
| the park's **route tag** is fixture-absence (`§16.5`) | `parked-by-the-fixture-gate=0` · **`parked-by-fixture-absence=1`** | **PASS** (body-owned, never the gate branch) |
| **the park SET is the reading** — `{uf_panes_14, uf_tabs_7, uf_tabs_7_diag}` | **only `uf_panes_14` was driven** (minimal scope) | **NOT TAKEN — the full three-key park set is the full run's** (see `§5.3`) |
| the run's park split quoted | `parked=1/35 · parked-by-the-fixture-gate=0 · parked-by-fixture-absence=1` | **PASS** (as a scoped reading) |

**Exit `1` is PRE-EXISTING BEHAVIOUR, quoted verbatim (`search.out` line 90):**

```
[live-drive] ROW-SET ERROR: matrix row(s) IN SCOPE with no verdict: U-2, U-3 (a declared row whose requested block(s) produced no verdict may not vanish silently — §2.1 E-3 clause 2 / §2.2 E-12 item 2)
```

and on the `empty` scoped key run (`empty2.out` line 90) **verbatim the same line**. The driver's own printed reading on that path is `REFUSED — missing declared row(s): U-1, U-2, U-3, U-4, U-5, U-6, U-7, U-8`, while `[live-drive] done: 1 blocks, 0 FAIL, 1 PARKED, 0 NOT-DRIVEN` — i.e. **the non-zero exit comes from the scope-edge row-set refusal, never from the fixture machinery** (the *fixture-gate* run's own `parked-by-the-fixture-gate=0` is unaffected; `empty2`'s gate park is `parked-by-the-fixture-gate=1` with `0 FAIL`). The `--block=import` runs print **no `ROW-SET ERROR` at all** and exit `0` (the `import` block claims no matrix/extended row). **Nothing was changed to silence it.**

## 1.4 `class-(b):empty` — **`PASS`** (`§11.3` item 5, `S-4`)

**Invocations (two runs, both isolated):**

```
node scripts/live-drive.mjs --fixture=empty --block=import  --port=3983 --cdp-port=9483 --display=:0   # exit 0
node scripts/live-drive.mjs --fixture=empty --block=uf_panes_14 --port=3984 --cdp-port=9484 --display=:0  # exit 1 (the scope-edge refusal, §1.3)
```

**Verbatim — the set is selected and NOTHING is materialised, and every declared-gated key that ran parks by name:**

```
[live-drive] FIXTURE MATERIALISED: fixtureId=empty fixtureRoot=.live-fixture/empty/ — the set carries NO file
  and its directory is left EMPTY (no SET was materialised); the obsolete seed route is NEVER this fixture's
  foundation (§6.1 clause 2)

[live-drive] FIXTURE SET: "empty" -> no SET was materialised and NO import is attempted at all (§4 S-4, the
  explicitly selected EMPTY set): every gated key's OWN declared fixture probe reads ABSENT and every gated
  key parks BY NAME under a NAMED fixture state

probes: 'corpus-documents': present=false at resolved=true via rag.list_documents (-> 0 document(s))
        'corpus-query-results': present=false at resolved=true via rag.query (-> 0 hit(s))
        'corpus-document-tabs': present=false at resolved=true via dom:#tab-strip .tab[data-document-id] (-> 0 rendered row(s))

PARK  uf_panes_14        PRECONDITION-FAILED: fixture-missing — rag.query for the probe's own constant term
  -> 0 hit(s) (the fixture "corpus-query-results" own read) … the gate's OTHER, also-required conjunct is the
  RUN-WIDE read (rag.list_documents -> 0 document(s) (--no-seed=true) — the seeded corpus is ABSENT; --no-seed=true) …

[live-drive] done: 1 blocks, 0 FAIL, 1 PARKED, 0 NOT-DRIVEN (a driver failure is never an app FAIL)

[live-drive] FIXTURE GATE OBSERVED … declared=35 gated key(s) · OBSERVED SPLIT: parked=1/35 … of which
  parked-by-the-fixture-gate=1 … and of which parked-by-fixture-absence=1 …
```

**The three members the architect asked to be quoted, verbatim:** **`parked=1/35`** · **`parked-by-the-fixture-gate=1`** · **`parked-by-fixture-absence=1`** (scoped to the one gated key driven; the `--block=import` run prints `parked=0/35` with all three members `0`, because the `import` block is not a gated key).

| Requirement | Observed | Verdict |
| --- | --- | --- |
| a **NAMED** fixture state (`empty`) | `fixtureState="mock data set empty selected" fixtureKind=mock-data-set fixtureId=empty` | **PASS** |
| **no SET was materialised** (and the run says which absence) | `no SET was materialised and NO import is attempted at all` | **PASS** |
| **every gated key parks BY NAME** | the driven gated key parks by name, `PARKED`/`PRECONDITION-FAILED: fixture-missing`, its `parkReason` naming its **own** declared fixture | **PASS** (scoped) |
| **NOT ONE reports `FAIL`** | `0 FAIL` on both runs | **PASS** |
| the **route split** quoted from the artifact | `parked-by-the-fixture-gate=1` (the gate branch, the store-wide conjunct false) and `parked-by-fixture-absence=1` (its own declared read absent) | **PASS** — **and the contract's `ROW`/`DIAG` route split over all `35` was NOT taken** (it is the full run's; `§5.3`) |

## 1.5 `class-(b):route-only-none-state` — **`PASS`** (`§11.3` item 6; `§6.2` `B-1`'s guard)

**Invocations (two runs; the FIRST is recorded as it happened, the second is the re-take):**

```
# (a) as ruled — the `--strict-seed`-shaped route with no --fixture. INCONCLUSIVE in this checkout:
node scripts/live-drive.mjs --strict-seed --block=import --port=3986 --cdp-port=9486 --display=:0
  → the seed dir `.live-corpus/` is ABSENT in this checkout, so the route imports nothing:
    [live-drive] seeded corpus -> import "MCP error -32602: … Too small: expected array to have >=1 items at files"
    → the run aborts on its own waitFor (exit 2). **The store was empty, so it could not read the contract's
      "even though the store is non-empty" limb.**

# (b) THE RE-TAKE — the obsolete route with a real corpus, still NO --fixture:
node scripts/live-drive.mjs --seed=.live-fixture/core --strict-seed --block=import \
  --port=3987 --cdp-port=9487 --display=:0            # exit 0
```

**Verbatim (the re-take — the obsolete route DID supply the store, and the state is unmoved):**

```
[live-drive] seeded corpus -> import {"ok":true,"documentIds":[".live-fixture/core/alpha",
  ".live-fixture/core/beta",".live-fixture/core/gamma"],"nodeCount":9,"edgeCount":15}
[live-drive] FIXTURE PRECONDITION (LIVE READING, §3.2 F-6 — the seed route ran and its import is printed
  verbatim above): PRECONDITION HOLDS — rag.list_documents -> 3 document(s); no fixture precondition marker
  fires in this run
[live-drive] FIXTURE STATE: fixtureState="no fixture data set selected" fixtureKind=none fixtureId=none
  fixtureRoot=NONE (no SET was materialised) — …
[live-drive] done: 1 blocks, 0 FAIL, 0 PARKED, 0 NOT-DRIVEN
```

| Requirement | Observed | Verdict |
| --- | --- | --- |
| the fixture state reads `none` / `none` / `none` | `fixtureState="no fixture data set selected" fixtureKind=none fixtureId=none` **+ `fixtureRoot=NONE`** | **PASS** |
| **even though the store is non-empty** | `rag.list_documents -> 3 document(s)`, `nodeCount:9, edgeCount:15` in the same run | **PASS** |

*(The obsolete route itself survives — "annotate, never extend" — which is why it could supply the store here.)*

## 1.6 `class-(b):default-unmoved` — **`PASS`** (`§11.3` item 7, `FA-5`'s control)

**Invocation:**

```
node scripts/live-drive.mjs --block=import --port=3985 --cdp-port=9485 --display=:0     # NO --fixture · exit 0
```

**Verbatim:**

```
[live-drive] FIXTURE STATE: fixtureState="no fixture data set selected" fixtureKind=none fixtureId=none
  fixtureRoot=NONE (no SET was materialised) — GATE SCOPE: the 35 gated declared keys … DECLARED
  POPULATION: 35 gated key(s) … CONSEQUENCE: in a run whose fixture state is none, a GATED declared
  corpus-dependent block is PARKED BY NAME … IFF that block's OWN declared fixture probe reads ABSENT …
[live-drive] done: 1 blocks, 0 FAIL, 0 PARKED, 0 NOT-DRIVEN
```
and **`FIXTURE PROBES` count = `0`** in this run (the probes are taken only under a selected set) — i.e. **the arg's arrival moved nothing about the launch profile**.

| Requirement | Observed | Verdict |
| --- | --- | --- |
| the launch profile is **unmoved** by the arg's arrival | `fixtureKind=none / fixtureId=none / fixtureRoot=NONE (no SET was materialised)`, the same groups/ports/block shape as any pre-arg run, no probe site, no mock clause | **PASS** |
| **no set materialised** | `fixtureRoot=NONE (no SET was materialised)` and no `.live-fixture/<set>/` was produced for this run | **PASS** |
| the store is **still** supplied by the pre-existing route | `FIXTURE PRECONDITION … PRECONDITION HOLDS — rag.list_documents -> 2 document(s)` (the default seed route, `noSeed:false`) | **PASS** |

## 1.7 `class-(b):two-supply-refusal` — **`PASS` with a recorded specificity gap** (`§11.3` item 8, `§6.4`)

**Invocations (all PRE-SPAWN, no app boot; each exit `2`):**

```
node scripts/live-drive.mjs --fixture=core --strict-seed
node scripts/live-drive.mjs --fixture=core --seed=/tmp/unitb-live
node scripts/live-drive.mjs --fixture=core --corpus-root=/tmp/unitb-live
node scripts/live-drive.mjs --fixture=core --o0-corpus=226
```

**Verbatim (the line; identical for all four supplies):**

```
[live-drive] ARG-REFUSED: --fixture="core" together with an OBSOLETE SUPPLY flag (--seed= / --corpus-root= /
  --strict-seed / --o0-corpus=) — two fixture supplies cannot both write the store this run measures, and the
  artifact must be able to attribute that store to ONE fixture; the empty set is NOT exempt (§6.4 clause 2)
  and the do-not-seed switch is never a supply and is refused on NO path (§6.4 clause 3);
  fixture={"state":"no fixture data set selected","kind":"none","id":"none"} (the run-wide fixture state, §6.1
  — stated on THIS path too)
```

| Requirement | Observed | Verdict |
| --- | --- | --- |
| one `ARG-REFUSED` line, exit `2` | one line, **exit `2`** on all four supplies | **PASS** |
| **the set is named** | `--fixture="core"` **verbatim** | **PASS** |
| **the one supply flag the caller supplied is named BY ITS OWN NAME** (GATE-5 amendment, `§6.4`/`B-1`) | **the FAMILY is listed — `--seed= / --corpus-root= / --strict-seed / --o0-corpus=` — and the flag actually passed is NOT named** | **FAIL — the GATE-5 ruling's graded reading is not met** (see `§5.2` **⟨GATE-7 PROOFREAD PASS `2026-10-05` — CITE REPAIRED: the finding this cell points at is `§3.2`'s `L-2` entry, NOT this record's `§5.2` (this file has no `§5.2` — that number is the CONTRACT's probe-sentinel section, and the filed cite is kept visible above). THE LIMB IS CURED — see the block below.**⟩) |
| nothing spawned / no set materialised / no scratch HOME minted | no Electron child (pre-spawn path; the driver's own sweep line states it is a no-op), **`.live-fixture/` untouched by these runs**, no new `mkdtemp` scratch dir (`/tmp/astrolive-*` mtimes unchanged), the state triple reads `none`/`none`/`none` | **PASS** |
| *"no SET was materialised"* as a **string on the refusal line** | the line does **not** carry that sentence; the absence of a set is **evidenced** (no root, no directory, no scratch home), not **printed** on this path | **NOT-TAKEN / observed as a wording gap** — recorded, not smoothed (the string **is** printed on the `empty` path, `§1.4`) |

**⟨GATE-7 PROOFREAD PASS `2026-10-05` — THE FLAG-BY-NAME LIMB IS CURED AT THE LANDED HEAD; THIS SECTION'S `FAIL` IS THEREFORE A HISTORICAL READING OF ITS OWN HEAD AND IS KEPT AS SUCH.** **THE OLD READING (the table row above, unchanged): the FAMILY is listed — `(--seed= / --corpus-root= / --strict-seed / --o0-corpus=)` — and the flag actually passed is NOT named.** **THE CURRENT READING (`VERIFIED-BY-READ` by this pass at the driver's own refusal line, `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines): `[live-drive] ARG-REFUSED: --fixture="core" together with the OBSOLETE SUPPLY flag THE RUN ACTUALLY SUPPLIED, NAMED: --seed="/tmp/unitb-live" — this is the offending supply (§21.2: the flag must be named, not only its family); the FAMILY stands beside the name, never in its place (--seed= / --corpus-root= / --strict-seed / --o0-corpus=): two fixture supplies cannot both write the store this run measures … fixture={"state":"no fixture data set selected","kind":"none","id":"none"} …` — with ONE reading per supply flag (`--seed="<value>"` · `--corpus-root="<value>"` · `--strict-seed` · `--o0-corpus=226`), built from `suppliedSupplyFlags` (the parsed arg's own order, each value carried VERBATIM); each exits `2`, spawns nothing, and materialises nothing.** **THE FAMILY LIST IS NOT REPLACED — it stands BESIDE the name, exactly as an accepted-set list stands beside a refusal value.** **EVERY OTHER LIMB OF THIS SECTION IS UNMOVED (`exit 2` · nothing spawned · no set materialised · no scratch HOME minted · the `none`/`none`/`none` triple).** **SO `§3.2`'s `L-2` `FAIL` IS DISCHARGED BY THE LANDING PASS AND NOT BY RE-WORDING; its recorded text is kept visible at `§3.2` with this marker beside it.** **LAYER (`RCA-12`): a pre-spawn `[D]` reading — never an app reading.**⟩**

## 1.8 `class-(b):honesty` — **`PASS` (a rule about quotability, discharged by this record's own wording)**

`§11.3` item 9: *every reading above states its fixture, and no reading in any artifact of this unit is quotable as a live-corpus app reading* (`§9` clause 3).

- **Every reading above states its set and its run** (`core` · `table` · `search` · `empty` · `none`), and every table cell above is scoped to its invocation.
- **The artifact's own non-quotability sentence, verbatim** (`core.out` line 4):
  `CONSEQUENCE: the rows this run reports were driven against the mock data set core; a fixture-fed PASS may NOT be quoted as a live-corpus app reading`
- **No fixture-fed `PASS` in this record is quoted as a live-corpus app reading.** The one app-layer verdict quoted (`§1.2`'s `PASS`, `dclass=D-state`, `surface.target=assembled-renderer`) is scoped **to the `table` set and that run** — and is **not** this unit's claim.
- **Verdict: `PASS`** (a rule, not a run — discharged by this record's wording).

## 1.9 `class-(b):trio-scope` — **`PASS (proves nothing about the driver)`** (`§11.3` item 10; `§9` clause 6)

**Readings:**

```
grep -rn "live-drive" package.json vitest.config.ts vitest.conformance.config.ts tsconfig.json
  → 0 occurrences in ALL FOUR (exit 1)
grep -rn "live-drive" src/  → 3 occurrences, ALL inside COMMENTS (src/shared/o0-hook.ts:78,
  src/shared/o0-report.ts:13, src/renderer/runtime.ts:71) — no import, not a build input
vitest.config.ts: include: ['tests/**/*.test.ts']
```

**The trio was RUN, and its result is recorded as proving nothing about the driver:**

| Leg | Result |
| --- | --- |
| `npm test` | `Test Files 131 passed (131)` · **`Tests 3003 passed | 22 skipped (3025)`** · `0 failed` |
| `npm run typecheck` | `tsc --noEmit -p tsconfig.json` → exit `0`, no diagnostics |
| `npm run build` | esbuild bundles written (`dist/main/preload.cjs 19.3kb`, `dist/main/standalone.mjs 1.3mb`, `dist/main/battery-host.mjs 1.7mb`, `dist/renderer/renderer.js 1012.1kb`) |

**`scripts/live-drive.mjs` is a `.mjs` script outside `src/**`, in no npm script leg, in no vitest include and in no tsconfig input ⇒ a fully green trio proves NOTHING about the driver** (`§9` clause 6). The driver's own pin (`tests/live-drive-contract.test.ts`) is a *fifth* instrument (`§0.3`) and is **not a trio leg**.

## 1.10 `class-(b):tabs` — **`EXEMPT-LATER-UNIT (observation)`** (`§11.3` item 4)

**Invocations (both isolated; taken to record the surface, not to grade it):**

```
node scripts/live-drive.mjs --fixture=tabs --block=uf_panes_14            --port=3988 --cdp-port=9488 --display=:0   # exit 0
node scripts/live-drive.mjs --fixture=tabs --block=user9_search_open_in_tab --port=3989 --cdp-port=9489 --display=:0 # exit 0
```

**Observations (verbatim), with NO verdict drawn:**

```
probes (--fixture=tabs): 'corpus-documents': present=true at resolved=true via rag.list_documents (-> 4 document(s))
                         'corpus-query-results': present=true at resolved=true via rag.query (-> 4 hit(s))
                         'corpus-document-tabs': present=false at resolved=true via dom:#tab-strip .tab[data-document-id] (-> 0 rendered row(s))

(--block=uf_panes_14)   FIXTURE GATE OBSERVED … parked=0/35 · parked-by-the-fixture-gate=0 · parked-by-fixture-absence=0
                        [live-drive] done: 1 blocks, 0 FAIL, 0 PARKED, 0 NOT-DRIVEN

(--block=user9_search_open_in_tab)
PARK  user9_search_open_in_tab PARKED (the declared fixture corpus-document-tabs reads ABSENT at this run
  (dom:#tab-strip .tab[data-document-id] -> 0 rendered row(s) (the fixture "corpus-document-tabs" own read))) …
FIXTURE GATE OBSERVED … parked=1/35 · parked-by-the-fixture-gate=0 · parked-by-fixture-absence=1 · 0 FAIL
```

- **The `user9_search_open_in_tab` park carries the SKIPPED `dom:` subject** — `user9_search_open_in_tab`'s parkReason names `corpus-document-tabs`, and the probe behind it is `dom:#tab-strip .tab[data-document-id]` → `0 rendered row(s)`. That limb is **`SKIPPED-BY-RULING`** (GATE-5 ruling; `§22.3`; `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`; adopting unit `docs/specs/unit-zone-replacement.md`): `dom:#tab-strip .tab[data-document-id]` **can never match at this head**, and the tab strip is a fork UI implementation being rebuilt on the foundation tooling.
- **`user9_search_open_in_tab` is a pane/tab-surface row**: its own result **draws no verdict here**. It is in `DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`'s EXEMPT/OBSOLETE class and its rendered assertion belongs to the adopting unit.
- **`§11.3` item 4's other limb — the three `'corpus-query-results'` keys RUN — is NOT taken by this battery.** Under `tabs` the probe reads `present=true` (`4 hit(s)`, so the `iff` the ruling names is satisfied in the data form), but the three keys' own run/verdicts were not driven (the minimal scope drove `uf_panes_14`, whose declared fixture is `corpus-query-results`, and it did **not** park under `tabs`). **Recorded as an OBSERVATION for the later unit's battery — not as a `PASS`, on the ruling's own instruction.**

---

# 2. WHAT WAS NOT TAKEN (stated, never a silent park)

| Not taken | Why — and whose it is |
| --- | --- |
| **The full-battery run per set** (`class-(b):core`'s *"the set's rows carry their own verdicts"*, `FA-1`'s exact 3-key park set, `FA-2`'s exact 1-key park set, the `empty` `ROW`/`DIAG` route split over all `35`). | The architect narrowed this gate to **a MINIMAL `--block=` scope** that still completes a run and prints the launch lines. **Every set/row figure these need is the run's own and is printed as a scope-reading — never as coverage.** Owner: the unit's own full-battery pass. |
| The pane / tab / doc-nav / stage `o0_*` row batteries. | **Ruled out of this gate by the architect** (`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`): fork UI implementations being rebuilt on the foundation tooling; their rendered assertions belong to `docs/specs/unit-zone-replacement.md`. |
| The `F-2` discharge for the `corpus-document-tabs` limb. | **`SKIPPED-BY-RULING`** (GATE-5 `2026-10-05`, `§22.3`). The clause's own rule is unchanged: **the `F-2`-closure claim may NOT be reported as discharged for this limb.** |
| `S-5` (`--connect` against a running app), `S-3` (`isError` on import), the `ports`/`--home` early print sites, the `S-2` materialisation abort. | Out of the narrowed harness-subject scope; they are the pre-spawn/abort limbs a later pass takes. |
| The app layer (panes, zones, tabs, doc-nav). | Not this unit's subject at all (`§1.3`); this battery is the **harness feeding the rows**. |

---

# 3. THE FAIL / CONTRADICTION LEDGER (nothing smoothed)

## 3.1 `L-1` — A GATE-5 FINDING IS **NO LONGER EXHIBITED** AT THIS HEAD (a movement, recorded as one)

**⟨GATE-7 PROOFREAD PASS `2026-10-05` — THIS ENTRY IS THE RECORD OF MOVEMENT (b), AND IT IS THE READING THAT CARRIES FORWARD: the `rag.query` limb IS cured at `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines, and the mechanism is the driver's own root-text write (`[live-drive] FIXTURE ROOT TEXT: 3/3 imported document root(s) written with their own authored text through edit.set_content …`), which puts each imported document's authored text on its ROOT node so the term reaches the store's lexical index.** **THE SAME LANDING PASS ALSO CURED MOVEMENT (c): the `--fixture=table` row now reads `verdict=PASS` with `rendered table census {"tables":1,"trs":1,"tds":4}` (`§1.2`), because the set's `table.md` carries the contracted GFM pipe-table form (`§22.2` item 3) — the raw-`<table>` literal is `SUPERSEDED` as a FORM and the `§2.2` P-β / `§16.11` acceptance predicate (`MUST REJECT a PARK`) is UNCHANGED and now satisfied.** **AND THE `dom:` LIMB IS NOT A THIRD MOVEMENT: it is `SKIPPED-BY-RULING` (`§1.1`, `§1.10`), not a pass, and the `F-2`-closure claim may NOT be reported as discharged for it.** **LAYER (`RCA-12`): the `hits` reading and the `table` verdict are fixture-fed `[D]`/APP readings against a NAMED mock set — never a live-corpus reading, never this unit's app claim.**⟩**

The greens artifact's `§5` `F-1` (and `E-1` · `E-2` · `E-4` · `E-8`) reported: *"BOTH RENDERED-FIXTURE PROBES READ ABSENT IN EVERY SET"* — `rag.query … -> 0 hit(s)` under `search`, `tabs` **and** `core` — and built the doc finding (`D-8`, `§18.1` clause 3/`§18.2` clause 1 falsified) on it. **At `md5 eac6d17477323f7770b0f6a4c011807e` that reading does not reproduce:** the driver now prints a `FIXTURE ROOT TEXT` write (`3/3` under `core`, `3/3` under `search`) and the probe reads **`3 hit(s)` under `core`**, **`4 hit(s)` under `tabs`**, **`0 hit(s)` under `search`** — i.e. the cross-run falsifier `§18.6` clause 1(iv) (differing readings) now **holds in the required direction**. The greens' `F-1`/`D-8` reading is a **reading against the head it was taken at**; it is **superseded by measurement here, not retracted and not smoothed.** The `corpus-document-tabs` half of `F-1` (the `dom:` limb) is **not** re-litigated: it is the ruled SKIP.

## 3.2 `L-2` — **`FAIL`: the two-supply refusal names the flag FAMILY, not the offending flag** (`§1.7`)

**⟨GATE-7 PROOFREAD PASS `2026-10-05` — THIS `FAIL` IS CURED AT THE LANDED HEAD; THE READING BELOW IS THIS RECORD'S OWN AND IS KEPT VERBATIM.** **OLD READING: the line prints the family list `(--seed= / --corpus-root= / --strict-seed / --o0-corpus=)` and does not name the flag that was passed.** **CURRENT READING (`VERIFIED-BY-READ` at the driver's refusal line, `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines): `… THE OBSOLETE SUPPLY flag THE RUN ACTUALLY SUPPLIED, NAMED: --strict-seed — this is the offending supply (§21.2: the flag must be named, not only its family); the FAMILY stands beside the name, never in its place (--seed= / --corpus-root= / --strict-seed / --o0-corpus=) …`, one reading per supplied flag, exit `2`, nothing spawned, nothing materialised — the requirement `§21.5` clause 1 item 1 recorded as an `OWED` implementer finding is MET, and no longer `OWED`.** **THE DISPOSITION IS THE LANDING PASS'S ACT, NOT THIS PASS'S WORDING: no text below is rewritten and the `OWED` status is superseded, never smoothed.** **THE PIN'S OWN ARM FOR THIS IS `route-supply-refusal:refused-by-name`, which now grades the flag-by-name DECLARATION in source (four readings inside the ONE arm — the register stays `67` declared / `57` executed).** **LAYER (`RCA-12`): a pre-spawn `[D]` reading — never an app reading.**⟩**

`§6.4`'s GATE-5 amendment has a **graded** reading (`greens B-1`): the line must name the set **and THE ONE SUPPLY FLAG THE CALLER SUPPLIED, BY ITS OWN NAME** — *"a FAMILY LIST satisfies neither limb."* Measured: `--fixture=core --strict-seed` (and each of `--seed=` · `--corpus-root=` · `--o0-corpus=`) all print the same family list `(--seed= / --corpus-root= / --strict-seed / --o0-corpus=)` and therefore **do not name the flag that was passed**. A reader of the `--seed=…` artifact cannot tell from the line which flag it carried. **This is an `OWED` implementer finding** (`§21.5` clause 1 item 1 in the contract's own words), now **measured at this head** and left standing. Every other limb of the reading (exit `2`, nothing spawned, no set materialised, no scratch HOME) **PASSES**.

## 3.3 `L-3` — **PRE-EXISTING behaviour, quoted verbatim (NOT a fixture finding, and NOT repaired)**

`ROW-SET ERROR: matrix row(s) IN SCOPE with no verdict: U-2, U-3 …` fires on a scoped run whose requested block claims a declared matrix row while other in-scope rows of that block produce no verdict (the `search` and `empty2` runs, both `exit 1`; the `--block=import` runs print **no** such line and exit `0`). The same line appears on the **baseline head** — this battery changed nothing and reports it only as the reason for a non-zero exit code, so no `exit 1` above is read as a fixture or app failure.

---

# 4. THE STRUCTURED COVERAGE REPORT

**One row per `§11.3` reading, as scoped by the architect. `verdict` ∈ {`PASS`, `SKIPPED-BY-RULING`, `EXEMPT-LATER-UNIT (observation)`, `FAIL`, `PRECONDITION-FAILED`, `NOT-TAKEN`}.**

**⟨GATE-7 PROOFREAD PASS `2026-10-05` — THE TABLE'S VERDICTS ARE THE VERDICTS OF THIS RECORD'S HEAD (`md5 eac6d17477323f7770b0f6a4c011807e` · `9637` lines) AND ARE KEPT AS FILED; THE ONE CELL THAT MOVES IS ROW SEVEN (`class-(b):two-supply-refusal`), RECORDED BELOW BESIDE THE TABLE RATHER THAN REWRITTEN IN IT.** **`§11.3` ROW 7: OLD `FAIL` (the flag-by-name limb) → CURRENT `PASS` at `md5 1b7d9cd8e644525d0b1de354c881ff2b` · `9681` lines (the line names each supplied flag BESIDE the family list, exit `2`, nothing spawned, nothing materialised; `§1.7`, `§3.2`).** **THE OTHER NINE ROWS' VERDICTS STAND: rows 1–6, 8–10 are unmoved, and row 2 (`class-(b):table`) was ALREADY a `PASS` in this table as filed (its `E-10` `FAIL` belongs to the GREENS artifact, not to this one).** **NO `SKIPPED-BY-RULING`, `EXEMPT-LATER-UNIT` OR `NOT-TAKEN` ROW IS CONVERTED TO A `PASS`, AND NO ROW IS DELETED.** **LAYER (`RCA-12`): every reading here is `[D]`/APP-fixture-fed and scoped to its set — never a live-corpus reading.**⟩**

| # | `§11.3` item / subject | Set + invocation (ports) | Verdict | Evidence (verbatim anchor) | Reason / owner where not a PASS |
| --- | --- | --- | --- | --- | --- |
| 1 | `class-(b):core` — `FA-4` | `--fixture=core --block=import` (3980/9480) exit 0 | **PASS** | `corpus-documents present=true` · **`rag.query … -> 3 hit(s)`** · `parked=0/35 · parked-by-the-fixture-gate=0 · parked-by-fixture-absence=0` · `fixtureId=core fixtureRoot=.live-fixture/core/` | — |
| 1a | `class-(b):core`, the **`'corpus-document-tabs'` `dom:` limb** | same run | **SKIPPED-BY-RULING** | `dom:#tab-strip .tab[data-document-id] -> 0 rendered row(s)` | GATE-5 ruling `2026-10-05` (`§22.3`); fork tab strip; owner = adopting unit `docs/specs/unit-zone-replacement.md`. **Not a pass; the `F-2`-closure claim may not be reported as discharged for this limb.** |
| 2 | `class-(b):table` — the row's own verdict | `--fixture=table --block=u_edit_1_live_package_table_limitation` (3981/9481) exit 0 | **PASS** | `verdict=PASS` (not a `PARK`); `documentId=.live-fixture/table/table`; `rendered table census on the surface={"tables":1,"trs":1,"tds":4,…}`; `done: 1 blocks, 0 FAIL, 0 PARKED` | — |
| 3 | `class-(b):search` — `FA-1` | `--fixture=search --block=uf_panes_14` (3982/9482) exit 1 | **PASS** (park split + probe limb) | `rag.query … -> 0 hit(s)` at `rag.list_documents -> 3 document(s)`; `PARK uf_panes_14 parkReason="… corpus-query-results reads ABSENT …"`; `parked=1/35 · parked-by-the-fixture-gate=0 · parked-by-fixture-absence=1` | the **exact 3-key park set** is the full run's (`§2`) |
| 4 | `class-(b):empty` — `S-4` | `--fixture=empty --block=uf_panes_14` (3984/9484) exit 1; `--block=import` (3983/9483) exit 0 | **PASS** (scoped) | `no SET was materialised and NO import is attempted at all`; `PRECONDITION-FAILED: fixture-missing …` by name; **`parked=1/35 · parked-by-the-fixture-gate=1 · parked-by-fixture-absence=1`**; `0 FAIL` | the `35`-key `ROW`/`DIAG` route split is the full run's (`§2`) |
| 5 | `class-(b):route-only-none-state` | `--seed=.live-fixture/core --strict-seed --block=import` (3987/9487) exit 0 | **PASS** | `fixtureState="no fixture data set selected" fixtureKind=none fixtureId=none fixtureRoot=NONE` with `rag.list_documents -> 3 document(s)` | first attempt (`--strict-seed` alone, 3986/9486) was **INCONCLUSIVE** — `.live-corpus/` is absent in this checkout, so the store was empty; re-taken |
| 6 | `class-(b):default-unmoved` — `FA-5`'s control | no `--fixture`, `--block=import` (3985/9485) exit 0 | **PASS** | `fixtureState="no fixture data set selected" … fixtureRoot=NONE (no SET was materialised)`; `FIXTURE PROBES` count `0`; `PRECONDITION HOLDS — rag.list_documents -> 2 document(s)` | — |
| 7 | `class-(b):two-supply-refusal` | `--fixture=core` + each of the four supply flags (pre-spawn, no ports) | **FAIL** (the flag-by-name limb only; all other limbs PASS) | `ARG-REFUSED: --fixture="core" together with an OBSOLETE SUPPLY flag (--seed= / --corpus-root= / --strict-seed / --o0-corpus=)`; exit `2`; nothing spawned | `§3.2` — the **family** is listed, the **passed flag is not named**; `OWED` implementer finding (`§21.5` clause 1 item 1) |
| 8 | `class-(b):honesty` | the record above, every reading | **PASS** | the artifact's own sentence: *"a fixture-fed PASS may NOT be quoted as a live-corpus app reading"*; every reading above states its set | a quotability rule, discharged by wording |
| 9 | `class-(b):trio-scope` | `npm test` · `typecheck` · `build`; `grep -rn live-drive package.json vitest.config.ts …` | **PASS (proves nothing about the driver)** | trio: `131 passed (131)` · `3003 passed | 22 skipped (3025)` · `tsc` exit 0 · esbuild bundles written; `live-drive` = **0** in all four configs and only inside **comments** in `src/` | `§9` clause 6 — `scripts/live-drive.mjs` is in no trio leg |
| 10 | `class-(b):tabs` | `--fixture=tabs --block=user9_search_open_in_tab` (3989/9489) and `--block=uf_panes_14` (3988/9488), both exit 0 | **EXEMPT-LATER-UNIT (observation)** | `PARK user9_search_open_in_tab … corpus-document-tabs reads ABSENT … dom:#tab-strip .tab[data-document-id] -> 0 rendered row(s)`; `parked=1/35 · parked-by-fixture-absence=1`; probe `corpus-query-results present=true (4 hit(s))` | pane/tab surface is EXEMPT/OBSOLETE (`DECIDED: BRANCH-TESTING-SCOPE-AMENDMENT`); the `dom:` limb is the ruled SKIP; owner = `docs/specs/unit-zone-replacement.md`. **No verdict drawn from a tab/pane row's own result.** |

**Counts: `10` `§11.3` readings — `8` `PASS` · `1` `FAIL` (a limb) · `1` `SKIPPED-BY-RULING` (a limb) · `1` `EXEMPT-LATER-UNIT (observation)`.** No reading is `PRECONDITION-FAILED` at its final state (the one precondition failure — `§1.5`'s first attempt — was diagnosed and **re-taken to completion**, never reported as a result).

---

# 5. WHAT THIS BATTERY DOES **NOT** PROVE

1. **Nothing about the panes, zones, tabs or doc-nav.** This battery is the **harness feeding the rows**. Every pane/tab/doc-nav/stage `o0_*` surface is **exempt-later-unit** by the architect's ruling; their rendered assertions belong to `docs/specs/unit-zone-replacement.md`.
2. **Nothing about the app layer from the trio.** `scripts/live-drive.mjs` is in no trio leg (`§9` clause 6) — the green trio is **envelope/pin-class**, not `harnes`-green.
3. **No coverage.** Every run here was **scoped to a minimal `--block=`**; the driver prints that itself (*"a scoped run prints the same figure … neither figure may be read as coverage"*). The full-battery park sets, the `35`-key `ROW`/`DIAG` route split, and *"the set's rows carry their own verdicts"* are **not taken**.
4. **No `F-2` closure.** The `'corpus-document-tabs'` limb is a **ruled SKIP**; the `'corpus-query-results'` limb's data-form reading holds under `core`/`tabs` (`3`/`4` hits) and is absent under `search` (`0`), but **this battery does not discharge the unit's `F-2` claim on the skipped limb**, and the contract's own rule forbids reporting it as discharged.

   **⟨GATE-7 PROOFREAD PASS `2026-10-05` — THIS ITEM IS THE UNIT'S HONESTY TOOTH AND IT IS RESTATED, NOT RELAXED: the `'corpus-query-results'` half's data-form reading now HOLDS (`core` `3 hit(s)`, `tabs` `4 hit(s)`, `search` `0`), and it is STILL NOT a discharge of the unit's `F-2` claim until the supervisor's DONE-row gate reads it as one (`§22.5` item 4) — and the `'corpus-document-tabs'` half may NOT be claimed AT ALL (`§22.3` item 6(d)).** **THE `35`-KEY `ROW`/`DIAG` ROUTE SPLIT this item names is ALSO NOW RE-DERIVABLE AND IS NOT TAKEN HERE: the post-landing reading is `22` `ROW` + `13` `DIAG` = `35` (the moved key `u_edit_1_live_package_table_limitation` carries `rows:['U-EDIT-1-LIVE-6']` through `ROW_EXTENDED`, so it parks on its `ROW` line; UNIT A's pre-landing `21` `ROW` + `13` `DIAG` = `34` is annotated at its own head) — the full-battery run that would MEASURE it is still the unit's owed work and is NOT taken by this pass.** **LAYER (`RCA-12`): a `[D]`/APP fixture-fed reading at best — never a live-corpus reading.**⟩**

5. **No live-corpus reading of any kind.** Every reading above is **fixture-fed** and scoped to its set; the artifact's own sentence binds it. The one app-layer verdict quoted (`§1.2`) is a reading **against the `table` mock set**, not app health, and not this unit's claim.
6. **Nothing about the unit's live deliverable being fully discharged.** The unit's row batteries for the pane/tab surfaces and the full-battery runs remain the unit's own owed work.
