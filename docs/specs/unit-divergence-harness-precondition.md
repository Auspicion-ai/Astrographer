# Unit `U-DIVERGENCE-SPAWN` — the divergence-leg spawn precondition (the `/dev/shm`-class boot failure): the two REQUIRED spawn members, the fresh scratch `--user-data-dir`, its exit-path cleanup, the boot-success census, and the fail-loud rule — Spec

**Status: SPEC — authored 2026-09-28. NO CODE LANDED, NO TEST LANDED, NOTHING RUN by this pass.** **No
shell was held**: `npm test`, `npm run build`, `npm run divergence`, `npm run battery` and `npm run
conformance` were **not run and are NOT reported by this pass**. Reading, `glob`/`grep` and read-only `git`
were used. **Every claim about the leg's CURRENT behaviour below is one of: (a) the RECORDED reading of a
prior pass, cited verbatim with its source; or (b) a VERIFIED-BY-READ statement about the source text of
`scripts/electron-divergence.mjs` at this head — named as such. Nothing else is claimed.**

**Pass kind:** SPEC (the contract only). **Unit id:** `U-DIVERGENCE-SPAWN` (a HARNESS unit; the id is minted
by this filing — no prior document names it). **Program:** `docs/specs/post-division-rebuild-proposal.md`
(§4.5's re-issued wave table · §4.7's `A-7` · §7.5's baseline measurements) and, beside it, the units that
carry the same precondition: `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §9 item 1 and
`docs/specs/unit-pd-ui-12-slot-host-boundary.md` §9 item 1. **Gate record:**
`docs/specs/post-division-rebuild-proposal-review.md` (`X-5`/`X-6` — the finding that made this leg's state
measurable at all; the gate's verdict is `BLOCKED-ON-SEMANTICS` for the *proposal*, and this unit is the
§7.5 item 3 deliverable **the proposal itself orders out of its own gate**). **Authority for what is already
DECIDED, read in full before this file was authored:** `docs/decisions.md` `DECIDED:
POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE` (ACTIVE), `DECIDED:
POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` (ACTIVE), `DECIDED: REBUILD-ARCHIVE-POLICY` (ACTIVE).

**Layer (RCA-12, mandatory declaration).** **HARNESS / `[D]`-layer for every claim in this file.** The
divergence leg is **never app-green and never envelope-green** — it is a **local instrument** that compares
two hosts' shim-stable surfaces; it is **not in the trio**, it is **collected by nothing**
(`vitest.config.ts`'s `include` does not reach `scripts/**`), and **a green here proves the harness can boot
a real Electron and drive it, NOT that the app works** (`RCA-12`; `docs/specs/rca-live-bugs-green-pipeline.md`
guard (b)). **The rule in this unit's own terms:** *a `R13 RESULT … 0 failures` reading may be cited as
**evidence that the real-DOM leg bootstrapped, connected and answered**, and may never be cited as evidence
about rendering, layout, CSS, gestures, the store, or any user-visible behaviour.*

| Deliverable | The layer its evidence covers | What that layer does NOT prove |
| --- | --- | --- |
| the spawn member `--disable-dev-shm-usage` | **HARNESS / `[D]`** — a Chromium init prerequisite | that the app renders, or that any UI row is green |
| the fresh scratch `--user-data-dir` + its cleanup | **HARNESS / `[D]`** — isolation/hermeticity of the run | store correctness; that the operator's real profile is untouched by the APP (only by this spawn) |
| the `R13 RESULT … 0 failures` reading | **HARNESS / `[D]`** — a **precondition** for the live batteries, never their substitute | **anything at the app layer**: the leg's own comparison set is structural (`census`/SSR fragment/dirtied ids/`data-node-id` parity), never layout/CSS/geometry |
| the leg's fail-loud report | **HARNESS / `[D]`** — that a boot failure can no longer read as a generic connection error | that the *app* is at fault when a boot fails: a failing boot is **environment- or harness-owned until the cause line names otherwise** |
| anything about the UI overhaul (`PD-UI-*`, `U-5`/`uf_layout_10`) | **NOT CLAIMED ANYWHERE IN THIS FILE** | — |

**Citation discipline.** `path` + **symbol** / **row id** / **§section**; **no line number appears in this
file as an address** (`docs/specs/requirement-catalog.md` §3.4 rule 7). Where a source's own quoted text
carries a line number, it is quoted **as that source's own text**, never adopted as this file's address.

**Verification markers used below.** **VERIFIED-BY-READ** = read in this pass from the named tree, and the
reader is named. **RECORDED READING** = a figure a **prior pass** measured, quoted as that pass's reading
(source named); **it is not this pass's verification**. **UNVERIFIED** = named, not settled by this pass,
**with what would settle it**.

---

## 0. The state this unit exists to clear — and the readings it cites

### 0.1 The recorded reading (quoted, never re-derived)

| # | Reading | Source of the reading |
| --- | --- | --- |
| **M-1** | **`npm run divergence` is RED at this branch head: `R13 RESULT: 1 checks, 2 failures`.** The DOM-shim host leg **ran**; the **real-DOM Electron leg did not**. | `docs/specs/post-division-rebuild-proposal.md` §7.5's table (RECORDED READING, measured by that pass at `b6791e0`) |
| **M-2** | **THE CAUSE IS ENVIRONMENTAL, not this repo's diff:** the Electron leg dies at bootstrap with `Creating shared memory in /dev/shm/.org.chromium.Chromium.* failed: Permission denied (13)` → `exited with signal SIGTRAP`, and the harness reports `electron connect/drive failed: MCP error -32000: Connection closed`. | proposal §7.5's table + §7.5 item 2 (same RECORDED READING) |
| **M-3** | **This leg is a MANDATORY PRE-LIVE leg** (`A-7`), and **the foundation's own live battery took `PRECONDITION-FAILED` on exactly a RED divergence leg**. | proposal §4.7 `A-7` clause (1); `docs/specs/post-division-rebuild-proposal.md` §7.5 item 2; `docs/specs/post-division-rebuild-proposal-review.md` `X-5`/`X-6` |
| **M-4** | **The fix belongs to its own unit** — *"a harness unit touching `scripts/**` … it has no spec and no red set, and it is therefore recorded as owed"*. | proposal §7.5 item 3 (RECORDED); carried unchanged by `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §9 item 1 and `docs/specs/unit-pd-ui-12-slot-host-boundary.md` §9 item 1 |
| **M-5** | **This repo already ships the `/dev/shm` bypass on its app-launch path**: `scripts/start-app.sh` defaults `SHM="--disable-dev-shm-usage"` and `SANDBOX="--no-sandbox"` and passes both to `npx electron .`; the flag is documented as *"required because on THIS host … `/dev/shm` is not writable"*. | **VERIFIED-BY-READ** this pass, `scripts/start-app.sh` (`SHM`/`SANDBOX` defaults and the `exec npx electron .` line); `docs/pending.md`'s P4 row (RECORDED) |
| **M-6** | **The leg's exit contract today is `{0,1}` only** — failures print the `R13 RESULT` line, the Electron stderr tail, and `process.exit(1)`; a clean run exits `0`. | **VERIFIED-BY-READ** this pass, `scripts/electron-divergence.mjs` (`ok()`, the stderr tail block, `process.exit(1)` / `process.exit(0)`) |

### 0.2 The current spawn surface, read this pass (the red set's target)

**VERIFIED-BY-READ, this pass, `scripts/electron-divergence.mjs`:**

| # | Reading | Where |
| --- | --- | --- |
| **S-1** | **The real-Electron leg is spawned TWICE, from two sites, with the SAME argument list**: a direct `spawn(electronBin, […])` (kept for stderr capture), **and** a second child created by `StdioClientTransport({ command: electronBin, args: […], cwd, env })` (the SDK's stdio transport owns the MCP channel). Both lists are **byte-identical**. | the direct `spawn(...)` call and the `new StdioClientTransport({...})` call |
| **S-2** | **The argument vector carries EIGHT members — `mainCjs` (the bundle to boot: `dist/main/main.cjs`), `--mcp-transport=stdio`, `--no-sandbox`, `--disable-gpu`, `--disable-software-rasterizer`, `--in-process-gpu`, `--ozone-platform=x11` — and NOTHING ELSE.** **`--disable-dev-shm-usage` is ABSENT.** | both sites named in **S-1** |
| **S-2a** | **The spawned entry point is `electronBin = node_modules/.bin/electron`** — i.e. **the npm `.bin` entry**, which is the CLI-wrapper path the foundation's `F-5` rule (ii) measures as the orphan-source. | the file's own `electronBin` constant |
| **S-3** | **NO `--user-data-dir` is passed, at either site.** | both sites named in **S-1** |
| **S-4** | **No scratch profile is created, nothing is `mkdtemp`ed, nothing is `rmSync`ed, and NO `process.on(…)` / exit hook is registered anywhere in the file.** The only teardown is `electron.kill('SIGKILL')` in a `try`/`catch`. | the file's imports (`node:child_process`, `node:url`, `node:path` — **no `node:fs`**, **no `node:os`**), its teardown block, and the absence of any `process.on` statement |
| **S-5** | **The env pair IS already present and CORRECT at both sites**: `{ ...process.env, DISPLAY: process.env.DISPLAY || ':0', ELECTRON_DISABLE_SANDBOX: '1' }`; `cwd` is the repo root; `stdio` is `['pipe','pipe','pipe']` at the direct site and the transport's own stdio at the SDK site. | both sites named in **S-1** |
| **S-6** | **The failure branch is GENERIC**: the boot failure is caught and reported as `electron connect/drive failed: ${e.message}`, then **one** failure is recorded (`ok('electron leg produced a result', false, 'electron failed to bootstrap')`) — **the Chromium `stderr` text that NAMES the cause is accumulated but never surfaced except as a 30-line tail printed only when `failures > 0`**. | the `try`/`catch` around `eClient.connect`/`drive`, the `ok('electron leg produced a result', …)` call, and the `--- electron stderr (tail) ---` block |
| **S-7** | **The demo envelope is a HAND-COPIED literal inside the harness, and its own comment claims `12 nodes`.** **VERIFIED-BY-READ against the fork's own source of truth:** `src/shared/demo-envelope.ts`'s `template.root` carries **root + h1 + counter-card + h2 + counter + inc + dec + reset + echo-card + h2 + echo-input + echo-out = 12 nodes**, and the harness literal's ids/content match that structure (`demo-shell`, `counter-card`, `counter`, `inc`/`dec`/`reset`, `echo-card`, `echo-input`, `echo-out`). **So the literal is in step with the fork's envelope at this head — VERIFIED-BY-READ, this pass, both files.** | the harness's `demoEnvelope()` (its `// … 12 nodes` comment) and `src/shared/demo-envelope.ts`'s `template.root` |

**⟨`S-7`'s LIMIT, stated so it is not over-read.⟩** The two structures agree **today**, by read. They are
**two hand-maintained copies of one contract**, and **the fork's envelope may move without moving the
harness** — the exact defect class the **foundation's** ruling records (*"a hand-copied literal is the
defect class this ruling exists to close"*, `../Provident-Electron/docs/decisions.md` `DECIDED: THE
DIVERGENCE HARNESS IS A TESTING TOOL AND IS IN THE UPDATE SCOPE`). **Whether they agree at EVERY future
head is UNVERIFIED**; what would settle it is a row (or a re-read) comparing the harness literal to
`src/shared/demo-envelope.ts`'s structure. **That row is NOT in this unit's red set — see §9.1 `T-4`.**

### 0.3 The foundation precedent this unit PORTS (cited, never patched)

**The foundation landed exactly this class of fix and its records are binding precedent, not transferable
code.** All rows below are **VERIFIED-BY-READ this pass in the adjacent tree**
(`../Provident-Electron/**`), whose revision recorded by the program is `main` =
`8f193a8d1446ed1e64c4ab6c569941e988f82459`:
**⟨ANNOTATED 2026-09-28 BY THE `PD-VENDOR-PIN-REFRESH` ITEM-10d DOCUMENTATION REVIEW — the as-filed clause is KEPT and this is its dated correction (annotate-beside, `RCA-8(c)`).⟩ THE REVISION `THE PROGRAM RECORDS` IS NO LONGER THAT ONE: the pin was re-stated to `d7b98b574adc7fa63fbabda617eba2a753f52cb5` (a docs-only upstream commit, the fifteen vendored module bytes byte-unchanged) by the pin-refresh unit under its own gate — `vendor/foundation.lock.json`'s `foundation.commit`, its embedded `digestCommand` literal and the three `PINNED_COMMIT` constants all read it (VERIFIED-BY-READ). This unit's PRECEDENT rows (`F-1`…`F-6`) are unaffected: they are read from the adjacent tree's own files, whose content at the two revisions is byte-identical for `src/shared` and whose harness scripts this unit cites by symbol. The current pin is the manifest's own `foundation.commit` — never this literal (`docs/specs/unit-pd-vendor-pin-refresh.md`; `docs/next-steps.md`'s 2026-09-28 PD-VENDOR-PIN-REFRESH doc-review block).**

| # | The precedent, and where it is written | Why this unit cites it |
| --- | --- | --- |
| **F-1** | **The pair is ONE decision, and EACH MEMBER ALONE IS INSUFFICIENT:** `--disable-dev-shm-usage` **and** a fresh scratch `--user-data-dir` are **both REQUIRED** — *"each alone still dies SIGTRAP on a host where `/dev/shm` is unavailable, measured"*. | `../Provident-Electron/scripts/electron-spawn.mjs` §2.1 item 3 (its header block) and `../Provident-Electron/docs/decisions.md` `DECIDED: DIVERGENCE-SPAWN-FIX` |
| **F-2** | **The landed base vector** is `[mainCjs, '--mcp-transport=stdio', '--no-sandbox', '--disable-gpu', '--disable-software-rasterizer', '--in-process-gpu', '--ozone-platform=x11', '--disable-dev-shm-usage']`, with `--user-data-dir=<fresh scratch>` appended **per spawn**. | `../Provident-Electron/scripts/electron-spawn.mjs` `baseArgs`; cross-read in `../Provident-Electron/scripts/electron-divergence.mjs`'s own comment block restating the vector |
| **F-3** | **What the fix discharged there, in the leg's own specification's terms:** the **hermeticity/isolation clause** — *"a temp `userData` profile … no writes outside the temp dir"* — *"was unmet as written because the harness passed no `--user-data-dir` at all"*. | `../Provident-Electron/docs/decisions.md` `DECIDED: DIVERGENCE-SPAWN-FIX` (quoting that leg's own §1); `../Provident-Electron/docs/specs/engine-pin-live-status.md` §1.3 |
| **F-4** | **THE CLEANUP DEFECT CLASS, with a measured mechanism:** a run left scratch profiles on disk *"while the leg reported `leftover profiles: NONE`"* (**4 of 4** green runs; **31** roots in one session) because `child.kill('SIGKILL')` reaches **only the Electron MAIN process** — *"the Chromium helpers it forked (zygote/crashpad, which hold the user-data dir) outlive their parent and **RE-CREATE** the profile directory ~50–700 ms after it was unlinked"*. | `../Provident-Electron/scripts/electron-spawn.mjs` (`liveChildren`'s measured-root-cause block; `cleanupProfiles`' delete-AND-VERIFY sweeps: 20 passes, 15 ms apart) |
| **F-5** | **THE TWO FIX RULES, landed and named:** **(i) register the cleanup hook AT THE MOMENT THE RESOURCE IS CREATED** (idempotently) — the *"exit-cleanup hook sat BELOW a validation gate that could call `process.exit`, so the earliest exit path ran before the hook existed and leaked an empty scratch root (**6 per `npm test`**)"*; **(ii) spawn the BINARY, not the CLI wrapper** — spawning `node_modules/.bin/electron` (a symlink to the Node wrapper `electron/cli.js`) means the handle is the **wrapper**, so killing it **orphans the real app**. | `../Provident-Electron/docs/decisions.md` `UI-LEG-CLEANUP-HOOK-AT-CREATION` + `UI-LEG-SPAWN-THE-BINARY-NOT-THE-WRAPPER`; `../Provident-Electron/docs/FORKER.md`'s `U-REALDOM-BOOT` row (the `F-1` RCA + fix, and the verified exit-path matrix *"0 roots on every path … 0 surviving `electron` processes"*) |
| **F-6** | **The foundation's leg is GREEN with the pair**: `R13 RESULT: 9 checks, 0 failures`, `N = 9` pinned and undrifted. | `../Provident-Electron/docs/FORKER.md` (`U-ENGINE-PIN` row) and `DECIDED: DIVERGENCE-LEG-GREEN-POST-CHANGE` |

**BINDING (§1.1 clause 7 and §2.2): the foundation is NEVER modified by this unit** (`AGENTS.md` item 7;
the program's `G-8`). **Its fix is ported as a CONTRACT and as a PRECEDENT — never as a patch to that tree,
and never as a patch copied blind.** **Where the foundation's pattern is itself deficient, that is a
`docs/defects.md` → `docs/HANDOFF.md` row, never an edit** (§6 `E-3` names the one candidate — and finds it
is **not** a foundation defect).

---

## 1. What this unit is — and what it is NOT

### 1.1 The ruling this filing DECIDES, and the clauses it carries (2026-09-28)

These are **CONTRACT, not commentary**. Each is either a decision this filing is entitled to take, or a
named escalation in §6.

1. **THE SPAWN FIX IS THIS UNIT'S, AND IT IS A `scripts/**`-ONLY UNIT.** The deliverable is the pair of the
   foundation's **F-1**/**F-2** members plus the **F-4**/**F-5** cleanup discipline, landed in **this repo's
   own harness**, with its own red set and its own DONE row (`RCA-2`/`RCA-5`: one unit, one cycle).
2. **THE GREEN THIS UNIT AIMS AT IS A PRECONDITION, NOT EVIDENCE ABOUT THE APP.** The leg's pass condition
   is `R13 RESULT: <n> checks, 0 failures` (§3.5); it says the **real-Electron leg bootstrapped, connected
   and answered**, and nothing more.
3. **THE LEG'S COMPARISON SET, ITS DEMO ENVELOPE AND ITS CHECK COUNT ARE NOT THIS UNIT'S TO MOVE.** The
   fixture is the *fork's* app-vs-shim identity surface; a re-pinned `N` or a changed envelope in a
   spawn-fix pass would be a **contract change smuggled in as a harness fix** (`F-6`'s pin lesson; §3.7).
4. **BOTH SPAWN SITES MOVE TOGETHER OR NEITHER DOES.** The two sites of **S-1** are the same contract: a fix
   applied to one and not the other leaves a **dead undriven child per run** (`S-1`) — the foundation
   measured the sibling hazard as *"an undrained, unreferenced Electron process per site and booted FOUR
   processes instead of TWO"* (`F-4`'s `spawnProfile` warning, ported as §3.1 item 3).
5. **A BOOT FAILURE MUST NAME THE CAUSE.** The harness's own accumulated `stderr` is the instrument
   (**S-6**): a boot failure that prints only `MCP error -32000: Connection closed` **misattributes an
   environment failure to the app** and is precisely how this leg went unmeasured for so long
   (`docs/specs/post-division-rebuild-proposal-review.md` `X-5`/`X-6`). §3.6 makes the rule contract.
6. **`package.json`'s `divergence` KEY IS PINNED BY THE PROGRAM AND THIS UNIT KEEPS IT.** See §2.2's `D-3`
   ruling — the key's value is stable here, and the `G-9`/`X-9` pin set's own keys are untouched.
7. **THE FOUNDATION IS NOT PATCHED** (`AGENTS.md` item 7; `G-8`). Its fix is precedent (§0.3).

### 1.2 What lands, and NOTHING else

| Path | Change | Layer |
| --- | --- | --- |
| `scripts/electron-divergence.mjs` | **EDITED** — the two spawn sites gain the §3.1 argument vector; a scratch profile is created per run and cleaned on every exit path (§3.2/§3.3); the boot-failure branch reports the cause (§3.6) | HARNESS / `[D]` |
| `tests/unit-divergence-spawn-contract.test.ts` *(new — the RED SET, authored by the **TestWriter**, not by this spec)* | **NEW** — the harness rows of §4.2 that need no Electron boot | `[T]`-class instrument, **HARNESS** evidence |
| `package.json` | **`scripts.divergence` UNCHANGED (pinned by the program; §2.2's `D-3` ruling below).** A change **only if** §4.3's escalation proves `npm run build` must not precede the harness — and then **only** that key, **only** in the direction §4.3 permits | HARNESS |
| **every other file** | **UNTOUCHED** — explicitly including `src/**` (all of it) · `tests/**` **except the new row file** · `vitest.config.ts` · the four divergent baseline files (`src/shared/dom-shim.ts`, `src/shared/types.ts`, `src/shared/demo-envelope.ts`, `src/shared/path-fork-cycle.ts`) · `src/main/markdown-import.ts` · the nine `PROTECTED` files · either fence file (`tests/traversal.test.ts`, `tests/import-render-no-duplicates.test.ts`) · any vendored byte under `src/shared/<x>.ts` or `vendor/**` · `scripts/live-drive.mjs` · `scripts/start-app.sh` · `scripts/foundation-drift.mjs` · `../Provident-Electron/**` · every `docs/**` file except this one and the two anchored tracker appends | — |

### 1.3 What this unit is NOT

It is **not** the app's boot fix (§3.6's cause line is a **harness** report, not an app change) · **not** a
`src/**` change of any kind · **not** the `PD-UI-9` Phase-0 spike · **not** any `PD-UI-*` wave · **not** the
divergence leg's **check-set** work (the foundation's `H-r10` attribute-extractor class is **that tree's**,
and this repo has no such extension row) · **not** a live battery (it enables other units' live batteries,
and claims none) · **not** a tracker rewrite (the supervisor owns tracker rows outside the appends §9 names)
· **not** the carrier-baseline red `PANE-TOGGLE-STAGE-COLLAPSE` / `P-SM-1`, which stays carried
(`DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` clause (1)) · **not** a consumer of the leg: the
leg green produced here is **cited by** the units whose specs already pass the precondition through
(`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §9 item 1;
`docs/specs/unit-pd-ui-12-slot-host-boundary.md` §9 item 1).

### 1.4 THE HONESTY BLOCK — what this pass could NOT verify

| # | Unverified item | What would settle it |
| --- | --- | --- |
| **O-1** | **Whether `--disable-dev-shm-usage` + a fresh scratch `--user-data-dir` will actually turn this leg GREEN in THIS environment.** The pair is **measured on the foundation's host** (`F-1`, `F-6`); **this pass ran nothing** and **cannot assert it for this host**. | One run of `npm run divergence` (or `npm run build && node scripts/electron-divergence.mjs`) after the fix, at this branch head, with the reading recorded. **§4.1 item (b) makes that run the unit's own gate.** |
| **O-2** | **Whether this host's `/dev/shm` denial is the ONLY cause.** The recorded reading names `/dev/shm` + `SIGTRAP` (**M-2**); a second cause (a `DISPLAY`/x11 refusal, a stale `dist/`, a `node_modules/electron` shim corruption) would wear the same signature. | The **§3.6** cause-line row: after the fix, the harness's own boot-failure report must **name** the cause rather than a generic connection error — and a green run must be accompanied by a **disk reading** that the scratch root is gone (§4.1 item (a)). |
| **O-3** | **How the cleanup survives the SDK transport's child.** `StdioClientTransport` owns its own child process (**S-1**); **whether the harness can reach that child's handle to kill it before the sweep** is **UNVERIFIED by this pass** (the SDK's public API exposes `close()`). | The implementer's least-code reading of `@modelcontextprotocol/sdk`'s stdio transport (already a `dependencies` entry, `@modelcontextprotocol/sdk ^1.30.0`), or a red row that measures the leftover after a run. **§3.3 item 4's `leftover: NONE` report is what makes the answer visible either way.** |
| **O-4** | **`docs/specs/ci-divergence-leg.md` DOES NOT EXIST IN THIS REPO.** A glob of `docs/specs/**` returns no such path and no `*divergence*` spec. | Nothing to settle here: it is a **citation defect elsewhere** (§6 `E-2`), filed with evidence, not this unit's to fix. |
| **O-5** | **The 5-vs-9 check-count question.** This repo's harness emits **8** comparison checks plus the boot check (**`S-1`/`S-6`** — `ok()` call sites), and the recorded red reads `1 checks` (**M-1**); the foundation's pin is `N = 9` (**F-6**) with a different check set. **Whether the fork's `n` is `8`, `9`, or something else after a green boot is UNVERIFIED by this pass** (the count printed on an off-green run is not the comparison-stage count). | The fix's own run: the `R13 RESULT: <n> checks, 0 failures` line. **§3.5 makes `n` a RECORDED OBSERVATION, never a re-pin** |

---

## 2. Scope

### 2.1 What this unit IS (the deliverable, in one list)

1. **The two REQUIRED spawn members** on **both** sites of **S-1**: `--disable-dev-shm-usage` in the vector
   and a **fresh scratch `--user-data-dir=<dir>`** appended per run (§3.1).
2. **The scratch-profile lifecycle**: a fresh directory per run, created under the **OS temp dir**, with the
   **cleanup hook registered at creation** and firing on **every exit path** (§3.2/§3.3).
3. **The boot-success census contract**: what the leg must print on success, and that the leg's own count is
   an **observation** (§3.5).
4. **The fail-loud rule**: a boot failure names the cause from the harness's own `stderr` accumulation, or
   names the absence of a cause line honestly (§3.6).
5. **The red set** (§4) — harness rows that fail **at this head** and need **no Electron boot**, plus the
   two rows that need the real run.

### 2.2 The allowed surface (exact), and the pinned keys this unit touches

| Surface | Change | Pin status |
| --- | --- | --- |
| `scripts/electron-divergence.mjs` | **EDITED** — §3.1/§3.2/§3.3/§3.6 only; the comparison set, the demo envelope, the `ok()` labels' meaning and the exit contract's shape are **preserved** (§3.7) | **not a `G-9` pin**; it is this unit's deliverable |
| `package.json` → `scripts.divergence` | **UNCHANGED BY DEFAULT — see `D-3` below** | **PINNED BY THE PROGRAM (`A-7` makes it the mandatory pre-live leg) and kept STABLE here.** **Precision, so no reader over-reads the pin:** the **`G-9`/`X-9` protected set this repo can name** comprises the O-0 hook-contract pins, the five named source-text pin sets, `vitest.config.ts`'s `testTimeout` (exact), `src/main/markdown-import.ts`, the `DEEP_ROWS` files, the bridge-mock name-set, the bridge-capture fixture **and `package.json`'s `test`/`test:watch` VALUES** — the `divergence` value is **not** in that list; `docs/specs/unit-pd-vendor-foundation-mechanisms.md` §2.5 pins it by marking it **UNCHANGED** for the `A-7` reason, and this filing **carries that pin forward** |
| `package.json` → `scripts.test` · `scripts.test:watch` | **UNCHANGED — never touched** | **`G-9`-pinned VALUES**: `scripts.test` must stay the plain suite run and must not carry `--testTimeout`; `scripts.test:watch` likewise (`tests/unit-v5-migration-contract.test.ts`'s §2c item 6 rows) |
| `package.json` → any other key · `vitest.config.ts` (any byte) | **UNCHANGED — never touched** | `vitest.config.ts`'s `testTimeout` is pinned **exactly** (floor **and** ceiling, `15_000`) |
| `tests/unit-divergence-spawn-contract.test.ts` | **NEW — the RED SET** (the TestWriter's file; §4.2) | **must NOT `vi.mock('electron', …)`** — the protected bridge-mock census pins the **exact five-name set**, so a new mocking file reds a protected row; the new file reads **source text / exports** and should need only `node:*` builtins plus `vitest` |

**`D-3` — THE `divergence` SCRIPT KEY IS PINNED BY THE PROGRAM AND IS KEPT STABLE BY THIS UNIT.** The value
is the program's `A-7`-mandated leg command; the foundation's own spawn fix left its equivalent key
**untouched** (`F-2`/`F-6`: the fix lives in the harness/helper, not in the script key), and
`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §2.5 pins this key **UNCHANGED** for the same reason.
**RULED:** the value stays
`npm run build && node scripts/electron-divergence.mjs`. **Consequences, stated so a later pass cannot read
a drift as harmless:** (i) an edit that **drops** `npm run build` is a **stale-`dist` boot hazard** (the leg
would drive a previous build and could green on a tree it did not measure) — the key's `build`-first clause
is therefore **load-bearing**, and this repo has a **recorded** stale-`dist` defect class (`docs/pending.md`
P4; `HOST-F-DIST-STALE`) ; (ii) an edit that **adds** a flag, an environment export, a second command or a
wrapper script is a **contract change to the leg's identity** and belongs to a unit that declares it; (iii)
**if** the implementer finds that the harness must run without a preceding `build` (for a reason the red set
proves), that is **§4.3's escalation** and **not** a change this spec authorises by default.

### 2.3 The DENIED surface (explicit, so the allow-list is never widened by implication)

**DENIED:** `src/**` in **any** form — including the four divergent baseline files, the fifteen vendored
modules, `src/main/markdown-import.ts`, and any renderer/main/preload byte · `tests/**` **other than the one
new row file**, and **never** a `PROTECTED` file (`unit-u2-rich-decompose`, `unit-s-paste-sanitization`,
`template-adversarial`, `unit-live11-bridge-seams`, `unit-u5-rich-commit-ipc`, `unit-v5-bridge-capture`,
`unit-wave-1-bridge-wiring`, `unit-import-batch-persist-contract`,
`tests/fixtures/v5-bridge-capture-fixture.js`) · either **fence file** (`tests/traversal.test.ts`,
`tests/import-render-no-duplicates.test.ts`) · `vitest.config.ts` · `vitest.conformance.config.ts` ·
`vendor/**` · `scripts/live-drive.mjs`, `scripts/start-app.sh`, `scripts/mcp-cli.mjs`,
`scripts/foundation-drift.mjs` · **`../Provident-Electron/**` — NEVER, in any direction** (`AGENTS.md` item
7; the program's `G-8`) · every `docs/**` file except this spec and the two anchored tracker appends of §8.

**A unit that needs a byte of that list is a NEW unit or an architect ruling — never this one.**

---

## 3. The fix shape — the contract, not a guess

### 3.1 The spawn argument vector (exact, and both sites)

**`C-1`. The real-Electron child's argument vector MUST be exactly:**

```
[ <mainCjs>, '--mcp-transport=stdio', '--no-sandbox', '--disable-gpu',
  '--disable-software-rasterizer', '--in-process-gpu', '--ozone-platform=x11',
  '--disable-dev-shm-usage', '--user-data-dir=<fresh scratch dir>' ]
```

1. **The eight members already present (`S-2`) are KEPT, in place, with their exact spellings.** No existing
   member is dropped, reordered, merged or re-spelled.
2. **`--disable-dev-shm-usage` is ADDED** (member 9) and **appears exactly once**.
3. **`--user-data-dir=<dir>` is ADDED as the LAST member**, `<dir>` being a **fresh scratch directory**
   created by §3.2 for **this run**, passed as an **`=`-joined single argument** (never as two arguments).
4. **BOTH sites of `S-1` carry the identical vector.** The direct `spawn(electronBin, args)` site and the
   `StdioClientTransport({ command: electronBin, args, cwd, env })` site **derive their lists from one
   value**, so a future edit cannot fix one and not the other (§1.1 clause 4).
5. **The profile is created with the profile-only discipline:** the member that creates the scratch
   directory **creates a directory and spawns NOTHING**. The two children of **S-1** are the **only**
   Electron children a run creates (ported from the foundation's `spawnProfile` warning, `F-4`).
6. **The contract is INSPECTABLE WITHOUT RUNNING THE LEG.** §4.2's rows must be able to assert the vector,
   the profile creator and the cleanup report **without booting Electron**, and the implementer has **two
   admissible routes** to that (the choice is theirs): **(a)** read the harness's **source text** and assert
   the composed members structurally; or **(b)** make the contract reachable by **module import WITHOUT the
   leg running** — a **main-module guard**, the pattern the **adjacent foundation tree** records
   (`../Provident-Electron/scripts/electron-divergence.mjs`'s guard clause: importing the module *"performs
   NO spawn, no client, no read … a RUN of this leg happens ONLY when this file is the process's own entry
   point"* — **a pattern to PORT, not code to copy**). **WHATEVER THE ROUTE, THE HARNESS'S CURRENT SHAPE HAS A NAMED HAZARD: `scripts/electron-divergence.mjs`
   today runs its whole leg at module top level with NO entry guard (VERIFIED-BY-READ, this pass — the spawn
   and the `eClient.connect` are top-level statements), so a naive `import` of it BOOTS ELECTRON and would
   violate `C-10`'s "no Electron in class (a)".** *This clause exists because §4.2's whole class (a) depends
   on it, and because a red set that accidentally boots Electron is the host-capability lottery `C-10`
   forbids.*
7. **THE PAIR IS ONE REQUIREMENT.** Neither member may be landed alone: a change that adds the flag and not
   the profile (or the reverse) is **incomplete by this contract** (`F-1`'s measurement is the reason).

### 3.2 The scratch `--user-data-dir` (freshness, root, and shape)

**`C-2`.**

1. **FRESHNESS:** a **new** directory is created for **every run**, by a `mkdtemp`-class call (an
   unpredictable, previously-non-existent path). **No fixed path, no reused path, no cached profile, no
   profile under the repository, and never the operator's real profile.**
2. **ROOT:** the scratch root is the **OS temp directory** (`node:os`'s `tmpdir()` is the recorded
   precedent, `F-2`/`F-5`). A repo-relative path (e.g. under `.tmp/`, `dist/`, or the CWD) is **not
   admissible** — it would make the run's isolation a property of the checkout.
3. **SHAPE:** the created path is a **directory that does not exist before the call** and **does exist
   immediately after it**; its parent is the scratch root; its basename carries a **leg-identifying
   prefix** so a leftover is attributable in a directory listing.
4. **TWO-CHILD CASE (if the implementer keeps two spawn sites, §3.1 item 4):** each of the two children gets
   its **own** fresh profile, and **both** are tracked for cleanup. A second child reusing the first's
   profile is **inadmissible** (a concurrent two-writer profile is not an isolation).
5. **THE SECURITY-STORE QUESTION IS NOT THIS UNIT'S.** This repo's leg drives a demo envelope through the
   default groups; **no group-seeding requirement is asserted here**, and the foundation's seeded-scratch
   discipline (its `driveProfile`) is **NOT ported** — **UNVERIFIED whether this fork's leg needs it**, and
   §4.1 item (b)'s run is what would settle it.

### 3.3 Cleanup on EVERY exit path (the discipline, and the fail state)

**`C-3`.**

1. **REGISTRATION AT CREATION.** The cleanup hook is registered **at the moment the scratch resource is
   created** — not after the boot, not after the first successful `connect`, and **not below any gate that
   can `process.exit`** (ported verbatim from the foundation's `F-5` rule (i), whose measured failure was a
   **leaked empty scratch root 6× per `npm test`** because the hook sat below a validation gate).
2. **IDEMPOTENT.** Calling the cleanup twice is safe: the second call removes nothing, throws nothing, and
   reports nothing removed.
3. **EVERY EXIT PATH.** The paths in scope, each of which must leave **zero** scratch directories behind:
   (a) a green run (`exit 0`); (b) a red run (`exit 1`, the `R13 RESULT` failure path); (c) a boot failure
   (the leg-1 catch path, **S-6**); (d) a thrown error before any comparison; (e) an operator interrupt
   (`SIGINT`/`SIGTERM`).
4. **THE DELETE-AND-VERIFY SWEEP, AND ITS REASON.** A single `rmSync` is **not sufficient** and is a
   **defect**: the Electron child's Chromium helpers (zygote/crashpad) can **re-create** the profile
   directory **~50–700 ms after** the unlink — the foundation measured this as *"the deletion succeeded and
   was then undone"* and solved it with a **bounded delete-verify sweep** (its 20 passes / 15 ms). The
   ported contract is: **delete, pause, verify absence, re-delete while anything survives, bounded by a
   pass count.**
5. **FAIL LOUD ON A LEFTOVER.** Whatever survives the sweep is **reported by name** (path + pass count), and
   the **report is printed on every run** — a `leftover: NONE` line is the honest counterpart. **A leg that
   reports `NONE` while a directory survives is the F-4 defect re-landed** and is a review finding.
6. **CHILDREN ARE KILLED BEFORE THE SWEEP.** The sweep is preceded by killing the children the harness holds
   (`SIGKILL` is the recorded practice, `S-4`). **How the SDK transport's child (**O-3**) is reached is the
   implementer's least-code problem**; §3.3 item 5 is the row that makes the outcome visible either way.
7. **THE REPO IS NEVER THE DROP TARGET.** No scratch byte, no Chromium cache and no `GPUCache` may land in
   the checkout or in the operator's home: the foundation's fix closed a **non-hermetic** `~/.config` write
   by the same two members (`F-3`).

### 3.4 The env pair and the working directory (KEPT — no change authorised)

**`C-4`. VERIFIED-BY-READ at both sites (`S-5`), and this unit CHANGES NONE OF IT:**

1. `env` stays `{ ...process.env, DISPLAY: process.env.DISPLAY || ':0', ELECTRON_DISABLE_SANDBOX: '1' }`.
2. `cwd` stays the repo root.
3. `stdio` stays `['pipe','pipe','pipe']` at the direct site and the transport's own wiring at the SDK site.
4. **The `DISPLAY`/x11 dependency is a DECLARED ENVIRONMENT PREREQUISITE, never a harness defect** —
   the foundation's rule is *"declared as an environment prerequisite with an actionable failure message,
   never a silent skip"* (its `H-r19` two-part truth). **This unit may improve the failure MESSAGE (§3.6);
   it may not add `show:false`, an offscreen mode, a headless mode or an xvfb wrapper to the harness.**
5. **`ELECTRON_DISABLE_SANDBOX: '1'` and `--no-sandbox` are NOT this unit's to remove** — the SUID
   `chrome-sandbox` helper is misconfigured on this host, and the record is explicit about it
   (`docs/pending.md` P4; `docs/live-testing.md`'s flag table; `docs/specs/live-user-test-suite-plan.md`'s
   host-setup row).

### 3.5 What counts as a BOOT SUCCESS (the leg's own census)

**`C-5`.**

1. **PRIMARY READING:** the leg prints **`R13 RESULT: <n> checks, 0 failures`** and **exits `0`**. The two
   halves are **one reading**: a `0 failures` line with a non-zero exit (or the reverse) is an
   **inconsistent leg** and must be reported as such, never read as a green.
2. **WHAT `0 failures` MEANS, precisely:** the **real-Electron leg produced a result** (the Electron leg did
   not take the `electron leg produced a result: false` branch of **S-6**/**§3.6**) **and** every comparison
   row that ran was satisfied. It is **not** a claim that the app rendered anything a user would see.
3. **`<n>` IS AN OBSERVATION, NEVER A RE-PIN.** The green run's own `n` is **recorded in the DONE row**
   (with the exit code) and is **not** made into a new pinned constant by this unit. **`O-5` records why the
   pass does not predict it.**
4. **THE FAILURE COUNT IS PART OF THE READING.** A green must be cited as `R13 RESULT: <n> checks, 0
   failures` — never as "R13 passed", and never with `n` omitted (an omitted `n` is how a *silent off-green*
   would be quoted).
5. **THE COMPARISON SET AND THE ENVELOPE ARE UNTOUCHED** (§3.7): if the green is achieved by changing which
   surfaces are compared or what the demo envelope contains, **the reading is not this unit's green**.
6. **THE READING IS A PRECONDITION.** It is cited by live-battery rows as a **precondition**, never as their
   evidence (`M-3`; the foundation's `H-r18` authority order: *"a `ui` green is not stronger than a
   `divergence` red"*).

### 3.6 FAIL-LOUD — a boot failure must name the cause

**`C-6`.** **THE RULE:** *a boot failure may not read as a generic connection error.*

1. **The report MUST carry a cause line** derived from the harness's **own** accumulated Electron `stderr`
   (`S-6`'s `estderr`), printed **at the point of failure** — not only as a tail after the summary.
2. **The `/dev/shm` class is NAMED.** When the child's `stderr` contains a shared-memory/permission refusal
   for a `/dev/shm/.org.chromium.Chromium.*` path (**M-2**), the report **says so**, in words that name
   **shared memory** and the **path/denial** involved, and states that this is a **host/environment
   precondition**, not evidence about the app.
3. **`SIGTRAP`/signal death is NAMED.** When the child dies by a signal rather than by an exit code, the
   report carries **the signal** (`SIGTRAP`'s class, **M-2**) and the **last non-empty `stderr` lines**.
4. **THE CONNECTION ERROR IS STILL REPORTED — but as the SYMPTOM.** `MCP error -32000: Connection closed`
   (or whatever the SDK yields) stays visible, **labelled as the downstream symptom** of the cause line, so
   a reader can never mistake it for the diagnosis.
5. **A MISSING CAUSE LINE IS ITSELF REPORTED HONESTLY.** When the accumulated `stderr` is empty, the report
   must **say that no cause line was captured** (with the exit/signal status) rather than imply a diagnosis.
6. **THE FAILURE STILL COUNTS.** A fail-loud report does **not** change the arithmetic: the leg still
   records its failure and still exits `1` (`S-6`/`M-6`). **This unit adds no exit code** — `{0,1}` stands
   unless §4.3's precondition proves otherwise.
7. **AN ABSENT `DISPLAY` IS A NAMED PREREQUISITE FAILURE, not a crash** (§3.4 item 4): where the cause is a
   display/x11 refusal, the report names **`DISPLAY`** as the unmet prerequisite and points at the operator's
   obligations (`docs/live-testing.md`'s flag table; `docs/specs/live-user-test-suite-plan.md`).

### 3.7 What MUST NOT change while fixing the spawn (the preservation clause)

**`C-7`.**

1. **The comparison set stays as-is** — the same surfaces, the same labels, the same `ok()` helper, the same
   counting semantics (`S-1`/`S-6`); **no new check is added** by this unit.
2. **The demo envelope literal stays behaviourally identical** (`S-7`): the fixture's structure and content
   are **not** this unit's to move, and a *consistency* repair (making the literal track
   `src/shared/demo-envelope.ts`) is **§9.1 `T-4`'s owed unit**, not an implied authorisation. **If the
   implementer finds the two already diverge at this head, that is a NEW contradiction and it is filed
   (§4.5 `A-9`'s probe shape), never silently harmonised** — harmonising it inside this pass would change
   the leg's fixture under a spawn-fix unit.
3. **The shim leg stays untouched:** the DOM-shim battery host is spawned by `process.execPath` with the
   built `battery-host.mjs`; **it needs no flag, no profile and no change** (its leg **ran** in the recorded
   reading, **M-1**).
4. **The exit contract stays `{0,1}`** unless §4.3 is escalated and ruled.
5. **The stderr-tail behaviour is preserved** (and improved only in the direction §3.6 requires).
6. **No dependency is added, moved or removed.** `package.json`'s `dependencies`/`devDependencies` are
   untouched; the new row file needs no PBT library (this unit's register executes deterministically, §5).
7. **No `src/**` byte moves.** If the leg cannot be green without a `src/**` change, **the unit stops and
   escalates** (§6 `E-4`) — a spawn-fix unit may not absorb an app change.

---

## 4. The RED-SET PLAN (RCA-1 — red FIRST, RUN, and REPORTED)

**The red set is authored by the TestWriter from this section, RUN, and its tally REPORTED before any
implementation** (`AGENTS.md` item 3; `RCA-1`). **Nothing in this section is a test this pass wrote.**

### 4.1 The two classes, and which one carries the proof

| # | Class | What it proves | What it CANNOT prove |
| --- | --- | --- | --- |
| **(a)** | **The no-Electron-boot class** — the majority of the red set | the **argument vector**, the **profile shape/freshness**, the **cleanup registration**, the **env shape**, the **cause-line source**, the **preservation clauses** | that Electron **boots**; that the leg turns **green** |
| **(b)** | **The real-run class** — two rows, both requiring `npm run build && node scripts/electron-divergence.mjs` | **(i)** the leg now **boots and drives** the real app (`R13 RESULT: <n> checks, 0 failures`, exit `0`, `<n>` recorded); **(ii)** the scratch root is **gone after the run** (a disk reading of the scratch root immediately after exit, and after a short settle, is **empty of this run's profiles**) | that the app **works** (RCA-12: the leg is structural only) |

**`C-8`. THE UNIT'S OWN GATE IS (b).** Class (a) is what makes the red set **runnable before the fix** and
**regression-bearing after it**; class (b) is what makes the unit's claim honest. **A DONE row that cites
(a) and no (b) reading is a review finding.**

### 4.2 The rows that FAIL AT THIS HEAD (class (a) — no Electron boot needed)

Each row is stated as the **property**, the **observation that must fail today**, and the **source of the
observation**. Every "fails today" claim here is a **VERIFIED-BY-READ** of `S-1`…`S-6` — **this pass did not
run the rows**, so the red tally is **predicted by read, not measured**.

| # | Row | Why it FAILS at this head |
| --- | --- | --- |
| **R-1** | **The composed argument vector contains `--disable-dev-shm-usage` exactly once.** | **FAILS** — **S-2**: the flag is absent from both lists. *(This is the flag's-absence row the unit exists for.)* |
| **R-2** | **The composed argument vector contains exactly one `--user-data-dir=` member, its value non-empty, and it is the last member.** | **FAILS** — **S-3**: no such member exists. |
| **R-3** | **The EIGHT pre-existing members are present, unmodified and in their recorded order** (`mainCjs`, `--mcp-transport=stdio`, `--no-sandbox`, `--disable-gpu`, `--disable-software-rasterizer`, `--in-process-gpu`, `--ozone-platform=x11`). | **PASSES today and must keep passing** — this is the **preservation** row (`C-7` item 1). It becomes the regression guard that stops the fix from quietly re-spelling a member. *(Note the count: **`mainCjs` IS a member**, and it is the one whose position is load-bearing — it is the bundle Electron boots.)* |
| **R-4** | **BOTH spawn sites' argument lists are equal to each other and to the exported composed vector.** | **FAILS today on the new members** (both sites carry the same *old* list) — and **passes for the wrong reason** if a reader compares the sites to each other only. **The row must compare each site to the ONE composed vector**, or it cannot detect the fix landing at one site only. |
| **R-5** | **The profile member's directory is created by a `mkdtemp`-class call, under `node:os`'s temp root, with a leg-identifying basename prefix, and does not pre-exist.** | **FAILS** — **S-4**: no `node:os`/`node:fs` import and no directory creation exists. |
| **R-6** | **A cleanup registration exists and is reached by the scratch-creation path** — i.e. creating a scratch profile is **sufficient** to arm the cleanup (no gate, no later step, and **no `process.exit` can run before it**). | **FAILS** — **S-4**: no `process.on(…)`/exit hook exists anywhere in the file. *(This is the **F-5** rule (i) row: the hook must sit AT creation, not below a gate.)* |
| **R-7** | **The cleanup is idempotent and its report names what it removed and what survived** (a `{removed, leftover, passes}`-shaped report class, or the harness's own equivalent — the **shape** is the implementer's, the **obligation** is not). | **FAILS** — **S-4**: nothing to call. |
| **R-8** | **The sweep is a BOUNDED DELETE-AND-VERIFY loop** (multiple attempts, an absence re-check after a pause), **not a single `rmSync`**. | **FAILS** — **S-4**. *(The row must fail for a single-`rmSync` implementation too: that is `F-4`'s re-landed defect.)* |
| **R-9** | **The scratch root is the OS temp dir, and NO repo-relative path is admissible** — a row that constructs the profile path and asserts it is outside the repo root. | **FAILS** — **S-4**. |
| **R-10** | **The `env` pair is exactly `{...process.env, DISPLAY: process.env.DISPLAY \|\| ':0', ELECTRON_DISABLE_SANDBOX: '1'}`, `cwd` is the repo root, and `stdio` is `['pipe','pipe','pipe']` at the direct site.** | **PASSES today and must keep passing** — **S-5**; the **preservation** row for `C-4`. |
| **R-11** | **The boot-failure report derives its cause line from the harness's OWN accumulated child `stderr`, names a `/dev/shm` shared-memory permission refusal when that text is present, names a signal death (`SIGTRAP` class) when the child dies by signal, and reports NO captured cause line honestly when the accumulation is empty.** | **FAILS** — **S-6**: the report is the generic `electron connect/drive failed: ${e.message}`; the cause text exists in `estderr` but is only printed as a post-summary tail. |
| **R-12** | **The failure arithmetic is unchanged: a boot failure still records its failure(s) and still exits `1`; a clean run exits `0`.** | **PASSES today** — **S-6**/**M-6**; the **preservation** row for `C-6` item 6. |
| **R-13** | **The comparison set, the demo envelope and the `ok()` census semantics are unchanged** — a row that pins the compared surfaces' **labels/order** and the envelope literal's **structural shape** (ids and node count), so neither moves under this unit. | **PASSES today** — **S-1**/**S-7**; the **preservation** row for `C-7` items 1/2. |
| **R-14** | **`package.json`'s `scripts.divergence` is exactly `npm run build && node scripts/electron-divergence.mjs`, and `scripts.test` / `scripts.test:watch` carry no `--testTimeout`.** | **PASSES today** — **`D-3`**, and the pinned-value rows of `tests/unit-v5-migration-contract.test.ts` §2c item 6. *(A new file that re-asserts a protected pin is **legitimate only as a cross-check**; the protected file remains the authority — `X-9`.)* |

### 4.3 Class (b) — the rows that need the REAL run, and the escalation they may trigger

**`C-9`.**

1. **B-1 — the leg boots, drives, and reads green.** The reading is **`R13 RESULT: <n> checks, 0 failures`
   with exit `0`**, `<n>` recorded. **This row also settles `O-1`/`O-2`/`O-5`.**
2. **B-2 — the scratch root is EMPTY after the run.** Checked **immediately after exit** and **after a short
   settle** (the foundation's own matrix checks both), with the harness's own `leftover` line agreeing with
   the disk. **Agreement is the row; a `NONE` report beside a surviving directory fails it** (`F-4`).
3. **B-3 — the fail-loud row is exercised at least once** — this is only honest if the environment can be
   made to fail on demand (e.g. by running the same boot under a forced-bad condition the operator
   sanctions). **If it cannot, B-3 is recorded as NOT-EXERCISED with its reason** (`RCA-11`'s discipline:
   park only a structurally non-exercisable surface, with the park reason recorded) — **never as a pass**.
4. **THE ESCALATION (architect's, never this spec's):** if class (b) shows that **`npm run build` cannot
   precede the harness** on this host (a build failure unrelated to the fork's code, a `dist/` lock, a
   resource limit), **the implementer STOPS and escalates** — the permitted fallback is the **`D-3`(iii)**
   route (the pinned key's `build`-first clause), and it is a **contract change this spec does not
   authorise**.

### 4.4 What the red set must NOT do

**`C-10`.** It must not **spawn Electron** in class (a) (the whole point of the split — a suite that boots
Electron turns every `npm test` run into a host-capability lottery and violates the class-(a) promise) · it
must not **mock `'electron'`** (§2.2's protected mock census) · it must not **read a `G-9`-frozen artefact
as an oracle** (`vitest.config.ts`, `src/main/markdown-import.ts`, the `DEEP_ROWS` files, the bridge-capture
fixture, the test-script VALUES) · it must not **assert on a line number** (citation discipline: a row pins
a **property**, never an offset) · it must not **weaken a preserved row** to make the fix easier (§3.7).

### 4.5 The `§3a` SEED SET — adversarial probes, reserved in the house shape

**These are NOT tests this pass wrote.** They are **pre-registered falsification attempts** for the
post-green adversarial pass (`RCA-3`), each stated as a probe with its expected **honest** outcome. A probe
that *passes* against a claim here is a **finding**; the disposition column is filled by that pass.

| Probe id | The probe (an adversarial attempt) | The claim it tries to falsify | Disposition |
| --- | --- | --- | --- |
| **`A-1`** | Boot the harness with `TMPDIR` pointed at a **read-only** directory (so `mkdtemp` throws) and observe the failure path. | **`C-3` item 3 path (d)** — a thrown error before any comparison leaves **zero** scratch directories behind and **names** the cause. | **RESERVED** |
| **`A-2`** | Kill the leg with `SIGINT` between the boot and the first comparison, then read the scratch root. | **`C-3` item 3 path (e)** — an operator interrupt still runs the sweep. | **RESERVED** |
| **`A-3`** | Make the app die immediately (`SIGKILL` the child right after spawn), then read the scratch root **after 1 s**. | **`C-3` item 4** — the sweep absorbs the ~50–700 ms Chromium re-creation window (`F-4`), rather than reporting `NONE` over a surviving directory. | **RESERVED** |
| **`A-4`** | Point the scratch root at a path the process **cannot delete** (a directory owned by another user, or a `chattr`-immutable name), and read the report. | **`C-3` item 5** — the leftover is **named**, never silently swallowed. | **RESERVED** |
| **`A-5`** | Set `DISPLAY` to a **non-existent** display and run the leg. | **`C-6` item 7** — the report names `DISPLAY` as the unmet prerequisite, not a generic connection error. | **RESERVED** |
| **`A-6`** | Feed the harness a `stderr` stream containing the `/dev/shm` refusal **without** a boot failure (the refusal is recovered from), and read the report. | **`C-6`** — the cause line is **not** misreported as a failure cause when the boot succeeded; the leg's colour is driven by the comparison rows, not by a substring present in `stderr`. | **RESERVED** |
| **`A-7`** | Run the leg twice concurrently (two terminals, same checkout) and read both scratch roots and both reports. | **`C-2` item 1** — freshness is **per run**, so concurrent runs cannot share, collide on, or delete each other's profiles. | **RESERVED** |
| **`A-8`** | Add a **sixteenth comparison surface** to the harness (or reorder the existing ones) and run the leg. | **`C-7` item 1** + **`C-5` item 3** — the green's `<n>` is an **observation**, so a changed count is **visible in the reading** and cannot hide behind "0 failures". | **RESERVED** |
| **`A-9`** | Move the demo envelope literal's structure (drop the echo card, or add one node) **without** moving `src/shared/demo-envelope.ts`, and run the leg. | **`S-7`'s LIMIT note** + **`C-7` item 2** — the fixture's divergence from the fork's source of truth is **detectable** (this probe is the evidence **§9.1 `T-4`**'s owed unit exists to prevent). | **RESERVED** |
| **`A-10`** | Edit `package.json`'s `divergence` key to drop `npm run build`, then run the leg. | **`D-3`(i)** — the reading becomes **suspect** (a stale-`dist` boot), so the leg must be shown to be **tied to a built tree**, not to whatever `dist/` happens to hold. | **RESERVED** |
| **`A-11`** | Run the leg where `/dev/shm` **IS** writable (or where the pair is removed) and compare the reading to the recorded red. | **§6 `E-1`** — the environment-independence claim: whether the green is **host-conditional** (the flag is a host workaround) or host-independent in the class-(b) sense. | **RESERVED** |
| **`A-12`** | Run the new class-(a) row file with `node_modules` **absent** (where possible) or with `electron` unresolvable, and read the failure. | **`C-10`** — the class-(a) rows **do not depend on Electron's presence**, so a missing browser cannot red a harness contract row. | **RESERVED** |
| **`A-13`** | **Import** the harness module from a plain Node process and watch for a child process / an SDK connection / any read. | **`C-1` item 6 (b)** — the module is **import-safe** (no spawn on import), so the contract is inspectable without a boot; against **today's** tree this probe **FALSIFIES nothing** — the module has no guard and WOULD boot (VERIFIED-BY-READ), which is exactly why the clause exists. | **RESERVED** (expect this probe to be RED at the pre-fix head and GREEN only if the implementer takes route (b)) |

### 4.6 The red-set readings the DONE row must carry (`RCA-1`'s record)

**`C-11`.** The DONE row states: **(i)** the **red tally** for class (a) as the TestWriter measured it —
`<rows> red / <rows> green out of <total>`, with the **red reasons** (the flag's absence, the profile's
absence, the hook's absence, the generic report); **(ii)** the **green tally** after the least-code
implementation; **(iii)** the **class (b)** reading verbatim (`R13 RESULT: <n> checks, 0 failures`, exit `0`,
plus the scratch-root disk reading); **(iv)** the **adversarial** disposition of `§4.5` and the **item-10d**
documentation-review record; **(v)** **the layer** (HARNESS/`[D]`) on every line. **An entry that claims a
green without a recorded red run is a review finding** (`RCA-1`).

---

## 5. The PBT/register position — CODE-BEARING, with a typed register

### 5.1 Is this unit code-bearing? YES — and no exemption is available

**The unit changes executable code** (this repo's harness; §2.1/§2.2), **and it adds a test file** — both
halves are code. Per the standing ruling (`DECIDED: PBT-REGISTER-REQUIRED-FOR-CODE-UNITS`, ACTIVE: the
zero-row exemption covers **only** invariant-free / doc-only / config-only / non-JS units), **an exemption
is unavailable here and is NOT claimed**. **The typed register follows.**

**Execution discipline (the ruling's, unchanged; `docs/decisions.md` `DECIDED:
PBT-REGISTER-REQUIRED-FOR-CODE-UNITS`):** deterministic — exhaustive/finite enumeration or a
**pinned-seed** generator; **caps: ≤100 attempts per row · ≤400 total · stop-after-5**; each row reports its
**strategy id** and **held/broken**; the **adversarial pass audits it read-only**. **No new dependency**
(plain deterministic vitest tables are sufficient — the same ruling records an **in-repo** precedent that
executed **7 of 8** register rows with plain tables and no new devDependency).

**Only `P-IM-` / `P-SM-` / `P-TP-` rows appear. No `F-` row. No `§6`/`FS-n` citation is a register row.**

### 5.2 The register (8 rows, attempts printed as the sum of their terms)

| Row | Kind | The property | The terms of its attempt budget | Attempts |
| --- | --- | --- | --- | --- |
| **`P-IM-1`** | **INVARIANT** | **THE SPAWN VECTOR CARRIES ALL NINE FIXED MEMBERS, ONCE EACH, IN ORDER** — the eight of **S-2** plus `--disable-dev-shm-usage`; **no duplicate, no omission, no re-spelling**. | 9 members × 2 sites (the composed vector, and each spawn site's list) + 2 negative draws (a dropped member, a duplicated member) | **`9*2+2 = 20`** |
| **`P-IM-2`** | **INVARIANT** | **EXACTLY ONE `--user-data-dir=` MEMBER EXISTS PER SPAWN, IT IS LAST, AND ITS VALUE IS NON-EMPTY** | 2 sites × (1 positive + 1 negative: zero members / two members) + 1 last-position draw + 1 empty-value draw | **`2*2+1+1 = 6`** |
| **`P-IM-3`** | **INVARIANT** | **EVERY PROFILE PATH IS FRESH AND OUTSIDE THE REPO** — created by a `mkdtemp`-class call whose parent is the OS temp root; the returned path did not exist before the call, exists after it, and is not under the repo root (and not under the operator's real profile) | 2 distinct calls (the freshness pair: pre-existence false, post-existence true) + 1 prefix draw + 1 outside-repo draw + 1 distinctness draw between two calls | **`2+1+1+1 = 5`** |
| **`P-SM-1`** | **STATE-MACHINE** | **THE CLEANUP IS ARMED AT CREATION AND SURVIVES EVERY EXIT PATH** — for each exit path in **`C-3` item 3** (green `exit 0` · red `exit 1` · boot failure · pre-comparison throw · `SIGINT`/`SIGTERM`), the sweep runs, is **idempotent**, and leaves **zero** profiles | 5 exit paths × 2 arms (armed-at-creation proven; idempotent second call) + 2 negative draws (a hook registered **after** the boot; a hook below a gate that exits) | **`5*2+2 = 12`** |
| **`P-SM-2`** | **STATE-MACHINE** | **THE SWEEP IS A BOUNDED DELETE-AND-VERIFY LOOP AND ITS REPORT IS HONEST** — delete, pause, re-verify absence, re-delete while anything survives, bounded by a pass count; the report distinguishes `removed` from `leftover`, and **`leftover: NONE` is never printed while a directory survives** | 3 states × 2 arms (survives-then-gone: `removed`; survives-every-pass: `leftover` named; nothing-to-do: empty report) × 2 (report/disk agreement, both directions) | **`3*2*2 = 12`** |
| **`P-SM-3`** | **STATE-MACHINE** | **THE LEG'S COLOUR AND ARITHMETIC ARE DRIVEN BY THE COMPARISON ROWS, NOT BY THE PRESENCE OF A SUBSTRING IN `stderr`** — a cause line present in a **successful** boot does not red the leg; a boot failure records its failure(s) and exits `1`; a clean run exits `0`; a `0 failures` line with a non-zero exit (or the reverse) is reported as an **inconsistent leg**, never as a green | 3 boot states (success · failure · signal-death) × 2 stderr states (cause present, absent) + 2 consistency draws (`0 failures`/exit-`1`; `>0 failures`/exit-`0`) | **`3*2+2 = 8`** |
| **`P-TP-1`** | **TOTALITY** | **NO INPUT SHAPE THROWS WHERE A REPORTED OUTCOME IS CONTRACT** — a spawn failure (synchronous throw / child `error` event) and an empty or absent `stderr` accumulation each produce a **named report** (never an unhandled rejection, never a bare `undefined`) | 2 failure sources (sync throw, child `error`) × 2 report arms (named cause, no-cause-line honesty) + 2 empty-accumulation draws (empty string, undefined) | **`2*2+2 = 6`** |
| **`P-TP-2`** | **TOTALITY** | **EVERY SPAWN SITE IS COVERED** — the number of Electron children created per run equals the number of spawn sites (2, per **S-1**), each with its own profile, and **no third child is created by the profile creator** (`C-1` item 5; the foundation's four-processes-not-two measurement) | 2 sites × 2 arms (vector identity; profile identity + distinctness) + 2 negative draws (a profile-only call that spawns; a site left on the old vector) | **`2*2+2 = 6`** |

**ARITHMETIC, printed with its terms:** `20 + 6 + 5 + 12 + 12 + 8 + 6 + 6 = 75` attempts total — **under the
≤400 cap**; **the largest single row is `P-IM-1` at 20**, **under the ≤100 cap**; **8 rows**, at the cap.
**`P-IM-4` does NOT exist in this register** (the id belongs to `docs/specs/unit-pd-vendor-foundation-mechanisms.md`
§4 and is not reused here).

### 5.3 The register's own honesty limits

1. **No row above asserts the leg's COLOUR.** `P-SM-3` asserts the **arithmetic and the report**, never the
   green; the green is class (b) in **§4.3** and is a **precondition** (§3.5).
2. **No row above asserts the APP.** Every row is HARNESS/`[D]` (the layer block).
3. **The register executes the same instrument the class-(a) rows read** — the composed vector, the profile
   creator, the cleanup report, the failure branch. **That is deliberate:** the register is the **exhaustive
   half** of the same contract, and a register row that read something else would be a second contract.

---

## 6. Owed items and escalations (each with an owner)

| # | Item | Owner | Why it is owed / escalated rather than decided here |
| --- | --- | --- | --- |
| **`E-1`** | **Can the leg EVER be green in a `/dev/shm`-less sandbox — and what is the FALLBACK if the pair is insufficient here?** **The position this filing takes:** (a) **`--disable-dev-shm-usage` + a fresh scratch `--user-data-dir` is the SANCTIONED route** (`F-1`, measured on the foundation's host, and **M-5** shows this repo already ships the flag on its app-launch path); (b) **`/dev/shm`-less is NOT expected to be an absolute fence** — `--disable-dev-shm-usage` exists to move Chromium's shared memory **off** `/dev/shm`; (c) **UNVERIFIED for THIS host** (`O-1`): only class (b) settles it. **NAMED FALLBACKS, in order:** **(i)** a **host/environment** fallback — a writable `/dev/shm`, or the SUID `chrome-sandbox` setup (`docs/specs/live-user-test-suite-plan.md`'s host-setup row; `docs/pending.md` P4) — **environment-owned, NOT a harness change**; **(ii)** an **operator-supplied display/wrapper** fallback — `xvfb` (or an equivalent `DISPLAY` provider), the **declared environment prerequisite** the foundation's `H-r19` requires to be reported *"with an actionable failure message, never a silent skip"* — **operator-owned, NOT a harness change**; **(iii)** an **architect ruling** if neither (i) nor (ii) exists — in which case the honest state is the one `A-7` already prescribes: **every Phase-1 UI unit's live pass is recorded `PRECONDITION-FAILED` with this reading attached, never silently parked** (`RCA-11`). **This unit does NOT implement any fallback** — it implements the sanctioned route and the fail-loud report. | **ARCHITECT** (the ruling), **SUPERVISOR/OPERATOR** (i)/(ii) | A fallback that is an environment or platform policy is not a spec's to take; and the pair's sufficiency on this host is a **measurement**, not an argument. |
| **`E-2`** | **A NEW CONTRADICTION, filed with evidence: `docs/specs/post-division-foundation-adoption-surface.md` §2 (row 12) and §7/§9 (rows 23, 36) cite `docs/specs/ci-divergence-leg.md` — AND THAT PATH DOES NOT EXIST IN THIS REPO.** A glob of `docs/specs/**` returns **no** `ci-divergence-leg.md` and **no** `*divergence*.md` (VERIFIED-BY-READ, this pass); the file **does** exist in the foundation tree, where the foundation's own harness header cites it (`../Provident-Electron/scripts/electron-spawn.mjs`'s header; `../Provident-Electron/docs/specs/ci-divergence-leg.md`). **The reading is `docs/specs/post-division-foundation-adoption-surface.md`'s `Source` column naming a foundation path in this repo's own coordinate system** — the same **form defect** class the repo's own defect row already records (*"a citation pointing at a moved/renamed section"*, `docs/defects.md` `TEST-CITES-MISSING-SPEC`, and its sibling-repo form-defect note: *citations that resolve at `../Gnosis/docs/specs/<name>.md`*). | **A DOC-REPAIR pass** (`docs/defects.md` → the adoption-surface spec's own next pass) | It is **not** this unit's file to edit; the adoption surface is a Phase-0 record and a **doc-repair** is the honest route. **This filing's own citation discipline therefore cites `../Provident-Electron/docs/specs/ci-divergence-leg.md` explicitly when it means the foundation's file, and says so where the fork's own reading is at stake (`O-4`).** |
| **`E-3`** | **Whether the FOUNDATION's pattern is itself deficient anywhere this unit depends on.** **Read this pass:** its spawn helper carries the vector, the env, the stdio wiring, the profile discipline and the cleanup; its records are internally consistent with its own decision rows (`F-1`…`F-6`). **NO defect row and NO handoff row is owed for that tree by this unit.** **The one candidate is a FORK-side consumer decision, not a foundation defect:** the foundation's helper spawns the **binary** and refuses the CLI-wrapper entry (`F-5` rule (ii)), while **this repo's harness spawns `electronBin = node_modules/.bin/electron` (VERIFIED-BY-READ, this pass — its own `electronBin` constant), i.e. precisely the `.bin`/wrapper-class entry point the foundation measured as the orphan-source. UNVERIFIED whether that costs this fork anything** (`O-3`). **If `B-2` (§4.3) shows a leftover scratch directory or a surviving `electron` process at this head, the entry-point question becomes a SECOND fix INSIDE THIS UNIT'S OWN SCOPE** — a `scripts/**` change in this repo, **never** a change to the foundation. | **THIS UNIT'S IMPLEMENTER** (if `B-2` shows it), otherwise **the unit's next pass** | The foundation's pattern needs **no** patch and owes this repo **no** handoff: what is owed is the **fork-side decision**, and it is made **evidence-first** (`B-2`), never pre-emptively. |
| **`E-4`** | **The stop-condition: if a green requires a `src/**` change, this unit stops.** | **ARCHITECT** | `C-7` item 7: a spawn-fix unit may not absorb an app change. The stop is **recorded as a finding**, never worked around. |
| **`E-5`** | **The other live instrument's boot pattern: `scripts/live-drive.mjs` DOES NOT PASS A `--user-data-dir`, and its isolation is a DISPOSABLE `HOME` instead** (VERIFIED-BY-READ: `HOME: home` where `home` is a `mkdtempSync(tmpdir(), 'astrolive-')` path, with a teardown `rmSync` in its `finally`). **It does reach the `/dev/shm` flag — it spawns `scripts/start-app.sh`, which passes `--disable-dev-shm-usage` by default (`M-5`).** **So: NOT this unit's surface, and NOT a red precondition of its own kind.** | **THE PHASE-1 LIVE-BATTERY UNITS** (the units that run `live-drive`), **and the architect if a ruling is wanted** | Reported here **because the same class of question will be asked of it the moment a live battery runs**: is a disposable `HOME` an equivalent isolation to a scratch `--user-data-dir` for the **Chromium profile**? **UNVERIFIED by this pass** — what would settle it is a live run's own scratch-root/`~/.config` reading, which is **that unit's** class (b), not this one's. **This unit does NOT widen into `scripts/live-drive.mjs`.** |
| **`E-6`** | **The foundation-side export gap this repo's vendoring already hands off is NOT re-opened here** (`docs/specs/unit-pd-vendor-foundation-mechanisms.md` §0A note 7, §9 item 8). | **Already-owned** (that unit's handoff row) | Named only so a reader does not mistake this unit's `§0.3` citations for a second handoff. |
| **`E-7`** | **The `docs/defects.md` row for a RED precondition.** | **THE SUPERVISOR** | This unit's spec **specifies** the failure; a **defect row is a tracker act** and is not this pass's to write. **If the supervisor rules that a red precondition with a named owner needs a `docs/defects.md` row at this head, this filing supplies the text** — *symptom:* `R13 RESULT: 1 checks, 2 failures` on the real-Electron leg; *repro:* `npm run divergence` at this head; *suspected root cause:* no `--disable-dev-shm-usage` and no scratch `--user-data-dir` at either spawn site (**S-2**/**S-3**) on a host where `/dev/shm` is not writable; *fix shape:* §3.1–§3.6 (**M-1**/**M-2**/**M-4**). |

---

## 7. Cross-references, and the census/numeric claims this file makes

### 7.1 The program documents this unit serves

| Document | What this unit takes from it |
| --- | --- |
| `docs/specs/post-division-rebuild-proposal.md` §4.5 | the re-issued wave table: **`W6b`'s live pass must report `PRECONDITION-FAILED` with this reading attached** while this leg is red — the precondition this unit clears |
| `docs/specs/post-division-rebuild-proposal.md` §4.7 `A-7` | the mandate: **`npm run divergence` is a MANDATORY PRE-LIVE leg**; the foundation's live battery took `PRECONDITION-FAILED` on exactly this |
| `docs/specs/post-division-rebuild-proposal.md` §7.5 | the **baseline measurements** (M-1's `1 checks, 2 failures` recorded as ENVIRONMENTAL), §7.5 item 2 (the consequence) and §7.5 item 3 (**the fix belongs to its own unit** — **M-4**) |
| `docs/specs/post-division-rebuild-proposal-review.md` | the gate record: **`X-5`/`X-6`** (the leg's state was UNMEASURED until they forced the reading) |
| `docs/next-steps.md` (CURRENT WORK, post-division area) | where the red precondition and its owed unit are recorded |
| `docs/pending.md` (the POST-DIVISION row) | the program's status row; annotated per §9 with this filing |
| `docs/decisions.md` | `DECIDED: REBUILD-ARCHIVE-POLICY` (**this unit retires no test** — see §7.3), `DECIDED: POST-DIVISION-REBUILD-VENDORING-AND-PHASE-SHAPE`, `DECIDED: POST-DIVISION-REBUILD-PHASE1-ENTRY-CONDITIONS` |

### 7.2 The foundation precedent (§0.3), and the direction of the dependency

`../Provident-Electron/docs/FORKER.md` (the `U-ENGINE-PIN` / `U-REALDOM-BOOT` rows: the spawn fix
**landed**, and the **`F-1`** RCA + fix) · `../Provident-Electron/scripts/electron-spawn.mjs` (the vector,
the profile discipline, the cleanup sweep, the entry-point pre-flight) ·
`../Provident-Electron/scripts/electron-divergence.mjs` (the landed two-site pattern) ·
`../Provident-Electron/docs/decisions.md` (`DIVERGENCE-SPAWN-FIX` · `DIVERGENCE-LEG-GREEN-POST-CHANGE` ·
`UI-LEG-CLEANUP-HOOK-AT-CREATION` · `UI-LEG-SPAWN-THE-BINARY-NOT-THE-WRAPPER` ·
`ENGINE-PIN-DIVERGENCE-LEG-IN`) · `../Provident-Electron/docs/specs/engine-pin-live-status.md` §1.3 (the
**each-flag-alone-fails** measurement) · `../Provident-Electron/docs/specs/ci-divergence-leg.md` (the
**foundation's** leg contract; see `E-2`) · `../Provident-Electron/docs/specs/ci-ui-leg.md` (`H-r18`/`H-r19`
— the authority order and the two-part hermeticity truth). **Precedent-only: NO byte of that tree is read
for transplant and NO file of it is edited.**

### 7.3 Census and numeric claims, each with its source

1. **`R13 RESULT: 1 checks, 2 failures`** — the recorded red (**M-1**), *not* this pass's measurement.
2. **`--disable-dev-shm-usage` + a fresh `--user-data-dir`, each alone insufficient** — the foundation's
   measurement (`F-1`), **not** this pass's.
3. **The landed foundation vector's member count: `8` in `baseArgs`** (`mainCjs` + 6 flags + the shm flag),
   **plus the per-spawn profile member ⇒ 9 per spawn** — read from `baseArgs` (`F-2`), **not** this pass's
   measurement.
4. **This repo's current vector: 8 members, zero profile members** (**S-2**/**S-3**) — read this pass.
5. **The register: `8` rows · `75` attempts total · largest row `20`** (§5.2; the arithmetic is printed
   with its terms).
6. **The demo envelope: `12` nodes**, in both the harness literal and `src/shared/demo-envelope.ts`
   (**S-7**) — read this pass, **VERIFIED-BY-READ both sides**.
7. **The scratch-cleanup window: `~50–700 ms`**, and the sweep's recorded parameters (**20 passes / 15 ms**)
   — the foundation's measurement (`F-4`), **not** this pass's.
8. **The exit contract: `{0,1}`** — read this pass (**M-6**).
9. **`docs/specs/ci-divergence-leg.md`: `0` occurrences in this repo's `docs/specs/**`** (**O-4**/**E-2**).
10. **NO test is retired, archived or re-pointed by this unit** — so `DECIDED: REBUILD-ARCHIVE-POLICY`'s
    before→after count obligation is **not triggered**: the unit **adds one row file** and **edits one
    script**, and **its before/after reading is the new file's row count and the leg's own census**, stated
    in the DONE row (`C-11`).

---

## 8. The layer ledger — and what this unit does NOT claim

**`L-1`.** **Every deliverable of this unit is HARNESS / `[D]`-layer.** The unit edits a local instrument
and adds a harness-contract row file.

**`L-2`.** **A green here is a PRECONDITION, not evidence about the UI.** `R13 RESULT: <n> checks, 0
failures` asserts the real-Electron leg **bootstrapped, connected and answered**, and that the harness's
structural comparison set matched between the two hosts. It asserts **nothing** about rendering, layout,
CSS, geometry, gestures, focus, the store, the engine, or any user-visible behaviour (`RCA-12`; the
foundation's own `H-r18` authority order is carried: *"a `ui` green is not stronger than a `divergence`
red"*).

**`L-3`.** **This unit does NOT fix the app, and does NOT touch the app's boot.** The cause-line rule
(§3.6) is a **harness report**; if that report ever names an **app** cause, the fix is a **different unit's**
(`E-4`).

**`L-4`.** **This unit does not make any DONE row of another unit honest.** It **clears a precondition**:
units whose live batteries were `PRECONDITION-FAILED` will still owe **their own** live runs, on a display,
against the assembled app (`RCA-11`).

**`L-5`.** **This unit claims no envelope-green, no app-green, no store-green, no engine-green and no
live-green** — and **the divergence leg is NEVER app-green or envelope-green by construction** (its
comparison set is structural; `vitest.config.ts` collects none of it).

**`L-6`.** **Nothing in this file is a measurement of this pass.** The readings are **M-1**…**M-6**
(recorded, or read from a shipped script) and the reads are **S-1** · **S-2** · **S-2a** · **S-3**…**S-7**;
the rest is contract.

---

## 9. The tracker rows this filing added, and the ones it owes

**`T-1`.** **`docs/next-steps.md` — ONE ANCHORED APPEND in the post-division-rebuild CURRENT WORK area**,
recording this unit's filing (path, unit id, layer, the allowed/denied surface, the red-set shape, the
register position, and the owed items' owners). **Anchored append only — never a whole-file write**
(`RCA-8(c)`); **no existing row is rewritten.**

**`T-2`.** **`docs/pending.md` — ONE ANCHORED ANNOTATION on the POST-DIVISION row**, because this filing
**changes the program's next action**: the pre-live precondition now has a **spec and a red-set plan**
(where the row's own text and §7.5 item 3 recorded the harness fix as *"no spec, no red set"*), and the
fallback chain (**`E-1`**) is named. **Anchored annotation only; the row's as-filed text is kept visible.**

**`T-3`.** **NOT written by this pass, and named so no reader expects them here:** any `docs/defects.md` row
(**`E-1`**/**`E-7`** — the supervisor's) · the `docs/decisions.md` rows a ruling would need
(**`E-1`**, **`E-5`** — the architect's) · any `docs/HANDOFF.md` row (nothing foundation-side is owed:
**`E-3`**) · any `docs/specs/*-greens.md`, `-review.md` or unit spec update (that unit's own passes).

### 9.1 The one thing this unit hands to a LATER pass, with its reason

**`T-4`.** **A separate unit (`U-DIVERGENCE-FIXTURE`-class, NOT this one) is owed if §7.3 item 6's
two-copies observation is to be closed:** the harness's demo envelope is a **hand-copied literal** whose
source of truth is `src/shared/demo-envelope.ts` (**S-7**). **This unit may not harmonise it** (`C-7`
item 2) — the fixture is the leg's identity surface — **and the foundation's own ruling on the same question
is the precedent for the owed unit** (*"the fixture must track the demo envelope as its ONE source of truth
… rather than restate it by hand — a hand-copied literal is the defect class this ruling exists to close"*,
`../Provident-Electron/docs/decisions.md` `DECIDED: THE DIVERGENCE HARNESS IS A TESTING TOOL AND IS IN THE
UPDATE SCOPE`). **Owner: the architect (mint the unit) → then that unit's own cycle. `§4.5` `A-9` is the
probe that keeps the gap visible until it is closed.**
