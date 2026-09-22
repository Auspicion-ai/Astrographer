# Unit V5-MIGRATION — the vitest-5 / electron-44 test-harness + config migration (DEC-2) — Spec

**Status:** **DONE (2026-09-21) — LANDED GREEN: the unit restored the trio's `npm test`
leg. Final counts (the landed tree, `npx vitest run`): 217 files passed (217) · 4 905
passed · 58 skipped · 0 failed (4 963 total), exit 0; `npm run typecheck` exit 0;
`npm run build` exit 0 (5 bundles). Class A **18 rows in 4 files** restored by the
sanctioned `vi.hoisted` `bridgeBox` capture with **zero assertions touched**; Class B
**2 rows** restored by the committed `testTimeout: 15_000` (`vitest.config.ts:12`);
Class C **2 rows** restored by the sibling unit's driver fix (ONE `applyBatch`) + the
`persistDeferred` seam. §3.4 **Pin 4 is RE-POINTED** to the import path's own mechanism
(ONE `applyBatch` against a **3 000 ms** budget) with the accepted-cadence NOTE-pin.
Earlier status (provenance): `SCHEDULED (user DEC-2, 2026-09-20) — SPEC LANDED, RED SET
OWED`; the "14 tests" Class-A figure below is **DISPROVEN** (the red set ran 18 rows in
4 files — §7.1/§7.2(2)).** This spec is the contract for the unit that
restores the trio's `npm test` leg. Its scope is the **TEST-SIDE + CONFIG migration**
only: (a) ONE sanctioned electron-mock bridge-capture pattern across the 4 bridge-mock
files, and (b) an explicit, committed test-timeout policy in `vitest.config.ts` — the
**8-line pre-migration file + the committed budget block** (14 lines as landed) — sized for
the deep-recursion totality rows. **It is explicitly NOT the Class-C import-path fix.** The
per-op `persist()` path in `src/main/rag-store.ts` is a **separate unit**
(`docs/defects.md` → `RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`, **reclassified 2026-09-21 as
RESOLVED-BY-RECLASSIFICATION**: the production import path is **already batched**; the
measured slow path is the **TEST DRIVER's per-op loop**, and the per-op cadence itself is an
**ACCEPTED characteristic**) and lands as its
**own unit, its own cycle** per RCA-2 — named in **§9** below and in the §4 register's
scope note. **Consequence (as authored): this unit alone could not make the trio green** — the
two Class-C rows in `tests/import-render-no-duplicates.test.ts` stayed red for a **driver-side**
reason until §9's driver fix landed. **Both landed 2026-09-21, so the trio IS green (217 files
passed (217) / 4 905 passed / 58 skipped / 0 failed (4 963), exit 0).** The diagnostic input for this spec is the probe pass (2026-09-21:
one cause per failure class, measured); the probe's own numbers are reproduced in §7.2
and each citation copied into this file was re-verified against the tree at this pass
(§7.3/§7.4).

**Layer (RCA-12, mandatory declaration):** **TEST-HARNESS / CONFIG layer.** This unit
changes `tests/**` and `vitest.config.ts` and nothing else. **A green here does NOT verify
app behavior** — it verifies that the *suite runs the app's tests honestly under the
installed runner*. The envelope/app layers are untouched by construction: no `src/`
behavior change is in scope, and the two rows this unit un-blocks are pre-existing
behavioral pins whose *subjects* (the preload bridge surface, the deep-recursion
totality contract) are unchanged. A green here is **harness-green, never app-green**.

**Depends on (upstream of this spec):** the probe's root-cause pass (relayed to this
role as this unit's input; **no committed probe artifact exists** — see §7.3's provenance
note), the user decision **DEC-2** (`docs/decisions.md:15`, which schedules the unit and
pins its *scope*, whose one unproven hypothesis the probe has since disproved — §7.3),
and the defect row `SUITE-RED-AFTER-VITEST5-ELECTRON44` (`docs/defects.md:25`).

**Delivered by:** an update to `vitest.config.ts` (§2b) + the sanctioned pattern applied
across **4** existing test files (§2a) + the new regression pins (§3) + the re-baselined
counts (§7.2). **No new production module, no `src/` edit.**

---

## 1. What the proposal asks

`docs/pending.md` → **SCHEDULED** row `VITEST-5 / ELECTRON-44 TOOLCHAIN MIGRATION`
(`:62`), whose scope clause is the work order:

> **SCOPE (the unit's own spec + red set per RCA-1/RCA-2 — NOT the O-0 queue's remaining
> work, and never a fix attempted inline inside another unit):** (1) **re-derive the
> electron-mock harness pattern under vitest-5 mock semantics** — the `capturedBridge()`
> undefined class … re-derive ONE sanctioned capture pattern and propagate it across the
> 4 bridge-mock files; (2) **re-check the recursion-depth totality tests under the v5
> worker/pool defaults** …; (3) re-baseline the counts.

`docs/decisions.md:15` (**DEC-2**) schedules the unit and pins it as a **blocking**
dependency:

> **the migration is SCHEDULED as its own unit** — the NEXT unit after the O-0 handover —
> with its own spec + red set per **RCA-1/RCA-2**, and it **BLOCKS the trio's
> `npm test` leg for EVERY unit**: **no unit may be reported DONE on a
> green-`npm test` claim until it lands** (AGENTS.md item 4).

**Acceptance (restated from DEC-2 + AGENTS.md item 4):** `npm test` = **0 failed** with
the counts re-baselined and committed; `npm run typecheck` and `npm run build` green;
**and the Class-C rows green because the Class-C production fix has landed in its own
unit (§9)** — so the trio is green only after **BOTH** units land.

### 1.1 What the probe measured (the root-cause input, one cause per class)

| Class | Tests / files | Cause | Evidence |
| --- | --- | --- | --- |
| **A** | **4 files** — `tests/unit-wave-1-bridge-wiring.test.ts`, `tests/unit-live11-bridge-seams.test.ts`, `tests/unit-u5-rich-commit-ipc.test.ts`, `tests/template-adversarial.test.ts` (**18 rows** by the current `docs/defects.md:25` split: 7 + 5 + 4 + 2 — see §7.2's correction) | `clearMocks: true` is a **NEW vitest-5 default** (`configDefaults`), so `mockClear()` runs on every mock between module collection and each test and **erases the `calls[]` history recorded during MODULE EVALUATION** | `node_modules/vitest/dist/config.d.ts:58` (`clearMocks: boolean`, inside `configDefaults` at `:51`); `node_modules/vitest/dist/chunks/defaults.D2ip7f-X.js:57` (`clearMocks: true`); the default applied at `node_modules/vitest/dist/chunks/index.DzobfTyw.js:9787` (`clearMocks: config.clearMocks`) + `:14670` (the `testTimeout` default); the clear itself at `node_modules/vitest/dist/chunks/index.m3L2HgmY.js:8571` (`if (clearMocks) vi.clearAllMocks();`, inside `clearModuleMocks`, called per test at `:8488`) → `node_modules/vitest/dist/chunks/spy.DQ0ZsPbi.js:453` (`for (const mock of DIRTY_MOCK_STATES) mock.mockClear();`) |
| **B** | **2 rows** — `tests/unit-u2-rich-decompose.test.ts` `ADR-4` (`:569-574`) and `tests/unit-s-paste-sanitization.test.ts` `Tokenizer F1` (`:469-474`) | **a TIMEOUT, not a stack error**: the two 10k-deep "never throws (totality)" rows PASS at **3.1-3.4 s** in isolation but take **5.4-5.8 s** under full-suite load vs vitest 5's **5 000 ms** default. **No `RangeError`, no recursion regression**; depth 10 000 still completes | the default read at `node_modules/vitest/dist/chunks/index.DzobfTyw.js:14670` (`resolved.testTimeout ??= resolved.browser.enabled ? 15e3 : 5e3`) — the environment is `node` (`vitest.config.ts:6`), so the 5 000 ms arm applies |
| **C** | **2 rows** — both in `tests/import-render-no-duplicates.test.ts` (the per-file `SPEC_FILES` row at `:96-115` and the rendered-DOM row at `:118-150`) | **the TEST DRIVER's per-op import loop** (**CORRECTED 2026-09-21** — the as-probed "GENUINE PRODUCTION HOT PATH" attribution is superseded: the production importer is **already batched** and costs **1 `persist()` per import**). `src/main/rag-store.ts` `putEdgeSync`/`putNodeSync` call `persist()` — a full-store `JSON.stringify` + `writeFileSync` — **on every op**, and the driver loops that per-op API over the corpus, so the import pays `O(records × store size)`: the `docs/specs/ui-overhaul.md` import is **1 895 nodes / 3 745 edges / 116 139 bytes** → `putNode` **2 879 ms**, `putEdge` **16 818 ms**, parse 7 ms, traversal **404 ms** ⇒ the rows take **20-24.5 s** vs the 5 s default. **The per-op cadence itself is an ACCEPTED characteristic** (each op atomic + durable = one full-store write: the store's single-writer durability model; `docs/decisions.md:34` `SINGLE-WRITER-STORE`) — **not** a defect; the residue is the **test-driver fix** (§9's unit) | verified against the tree at this pass: `markdown-import.ts:387` (`applyBatch`, once) + `edit-ops.ts:442` (batched too); `putEdgeSync` `src/main/rag-store.ts:1135`, `persist()` at `:1171`; `putNodeSync` `:1038`, `persist()` at `:1068`; `persist()` body `:792-808`; the batch deferral documented at `:1193-1194` and its single `persist()` at `:1341`; the test's own driver loop at `tests/import-render-no-duplicates.test.ts:52-53`; `docs/specs/unit-import-batch-persist.md` §1.1/§7.6 |

**Rules RUL-1..RUL-4 (this spec's own disposition of the probe's findings):**

- **RUL-1 — `clearMocks: true` is the Class-A cause and it is not a test bug.** The
  suite's `calls[]`-history capture pattern was legitimate under vitest 2's default-`false`
  semantics and is *silently wrong* under vitest 5. The fix is a capture pattern whose
  lifetime does not depend on mock call history (§2a), **never** a global mock-semantics
  override (§2c).
- **RUL-2 — Classes B and C share a *shape* (a 5 000 ms default) but not a *cause*.** B is
  an inherent-cost totality row; C is the **test driver's per-op import loop** over an
  ACCEPTED per-op cadence (**corrected 2026-09-21** — see §1.1's Class-C row; the
  production import path is already batched). **They must not be fixed by the same
  mechanism**: B gets the committed budget of §2b; C gets a **driver-side** unit (§9) —
  routing C through this unit's timeout policy would launder a driver/production-path
  defect (or, worse, the accepted cadence) into a config change, and is forbidden (§2c
  item 6).
- **RUL-3 — the `22 → 25` drift is load-induced TIMEOUT VARIANCE, not a fourth cause.**
  The 2.2× timing variance measured on the deep rows explains a count that moves between
  runs without any code change: the suite is stable at **22 failed / 7 files** on this
  machine. The earlier "25 failing tests / 8 failed files of 214" reading (third O-0 run)
  is recorded as **variance**, and the migration's re-baseline (§7.2) must record the tree
  state it read, not a drifting maximum.
- **RUL-4 — the diagnosis in DEC-2's scope clause is CORRECTED, not replaced.** Two of
  DEC-2's three scoped hypotheses survive: (1) the `capturedBridge()` undefined class —
  confirmed, with the *mechanism* now named (`clearMocks`, not a general "mock/hoisting
  semantics change"); (2) the recursion-depth re-check — confirmed as a **timeout** class,
  not a worker/pool semantics class; (3) the re-baseline — still owed. **The disproved
  hypotheses are recorded verbatim in §7.2** so no later pass re-tests them.

---

## 2. The contract

### 2a. ONE sanctioned electron-mock bridge-capture pattern

**The failure mode being replaced.** Today all 4 bridge-mock files capture the exposed
bridge from the mock's **call history**:

- `tests/unit-wave-1-bridge-wiring.test.ts:31` `const exposeInMainWorldMock = vi.hoisted(() => vi.fn())`,
  `:48-50` `function capturedBridge(): any { return exposeInMainWorldMock.mock.calls[0]?.[1] }`;
- `tests/unit-live11-bridge-seams.test.ts:78` + `:94-96` (same shape);
- `tests/unit-u5-rich-commit-ipc.test.ts:33` + `:85-93` (same shape, typed);
- `tests/template-adversarial.test.ts:28` + `:91` / `:101` (direct `mock.calls[0][1]` reads).

`src/main/preload.ts:642` (`contextBridge.exposeInMainWorld('provident', bridge)`) runs
during **MODULE EVALUATION** (the `:45`/`:91` import in each file), i.e. **before** the
first test. The v5 default (§1.1 Class A) clears `calls[]` first, so `calls[0]` is
`undefined` and the first dereference throws (`tests/unit-wave-1-bridge-wiring.test.ts:181-182`
→ `TypeError: Cannot read properties of undefined (reading 'rag')`).

**The sanctioned pattern (the ONE form; the `bridgeBox` name and shape are pinned):**

```ts
// ---- electron mock (hoisted BEFORE the preload import) ----------------------
const invokeMock = vi.hoisted(() => vi.fn())
/** Holds the API object the preload exposed at MODULE EVALUATION. A box created
 *  INSIDE vi.hoisted is in scope (and already initialised) when the hoisted
 *  factory runs; a module-scope `let` is NOT (TDZ at preload evaluation). */
const bridgeBox = vi.hoisted(() => ({ current: undefined as
  Record<string, unknown> | undefined }))

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn((_name: string, api: Record<string, unknown>) => {
      bridgeBox.current = api
    }),
  },
  ipcRenderer: {
    invoke: invokeMock,
    on: vi.fn(() => vi.fn()),
    removeListener: vi.fn(),
    send: vi.fn(),
  },
}))

// Import AFTER the electron mock is installed (vi.mock is hoisted).
import '../src/main/preload.js'

/** The `window.provident` bridge captured by contextBridge.exposeInMainWorld. */
function capturedBridge(): any {
  return bridgeBox.current
}
```

**C-1 — the box is created inside `vi.hoisted`.** A module-scope `let bridge: unknown`
initialised at the top of the file is in the **temporal dead zone** when the hoisted
`vi.mock` factory runs (hoisting moves the `vi.mock` call above the `let`), so the factory's
first assignment would throw `ReferenceError: Cannot access 'bridge' before initialization`
during preload evaluation. The box MUST be created by a `vi.hoisted(() => …)` call. This is
a **hard** requirement, not a style choice: it is the mechanism that makes the capture
independent of *both* mock call history *and* module-scope initialisation order.

**C-2 — the factory carries an IMPLEMENTATION that stores the exposed API.** The mock must
be `vi.fn((_name, api) => { bridgeBox.current = api })`, never a bare `vi.fn()`. The store
must happen **inside the implementation** (during the preload's own call), not in a
`beforeEach` reading `calls[]`, because the call's history is exactly what v5 clears.

**C-3 — `capturedBridge()` returns `bridgeBox.current`** (and nothing else). It is a pure
accessor with no call-history dependency; it may be called any number of times, from
module scope or from a test body, and its value is stable after module evaluation.

**C-4 — the pattern is applied in ALL 4 files, with ZERO surviving `calls[]` capture
reads.** The set is closed: exactly **4** files mock `'electron'` in this repo (verified by
content grep at this pass — `tests/template-adversarial.test.ts:30`,
`tests/unit-wave-1-bridge-wiring.test.ts:33`, `tests/unit-u5-rich-commit-ipc.test.ts:35`,
`tests/unit-live11-bridge-seams.test.ts:80`). Every `exposeInMainWorldMock.mock.calls[…]`
read is replaced by the sanctioned capture; the `exposeInMainWorldMock` binding itself is
**deleted** (the `vi.fn` moves inline into the factory), and `capturedBridge()` is the ONLY
way the exposed API is reached. Any other file that starts mocking `'electron'` joins this
set (the §3 pin's census is derived from the grep, not hard-coded to 4 forever).

**C-5 — per-test mock hygiene stays inside the test files.** The existing
`beforeEach(() => { invokeMock.mockReset() })` blocks
(`tests/unit-wave-1-bridge-wiring.test.ts:52-54`,
`tests/unit-live11-bridge-seams.test.ts:98-100`,
`tests/unit-u5-rich-commit-ipc.test.ts:182-184`,
`tests/template-adversarial.test.ts:85-87`) are **kept**. `invokeMock.mockReset()` clears
the IPC spy's own history, which is what those rows assert against; it is legal because
`invokeMock` is re-armed by the bridge's delegating closures on every call. **`bridgeBox`
must NEVER be reset, cleared or re-initialised between tests** — the exposed API object is
the app's own bridge and is created exactly once per module evaluation (a reset would
re-introduce the Class-A failure for every test after the first).

**C-6 — the mock factory DOES run, and the exposed object is REAL.** The contract must not
be "make the test tolerate `undefined`". The factory runs (`vi.mock` is hoisted above the
preload import in all 4 files) and the exposed object carries the full bridge surface:
**41 `sidebar` keys** today (`src/main/preload.ts:578-636`; counted at this pass —
`selectDocument` … `searchTabQuery`), read by §3's census pin.

**C-7 — the Class-A rows keep their assertions verbatim.** The 18 rows' *behavioral*
assertions (the W1-N5/N6/N7/N9 bridge surfaces, the LIVE-11 four collapse/visibility
seams + the no-op-holder states, the U5 `edit.commitRich` 4-method census, the I3
`template.validate` payload wrapping) are **untouched**. This unit changes only *how the
bridge is reached*, never *what is asserted*. A row that is relaxed, deleted, renamed or
given a name filter to make the suite green is a review finding (§2c).

### 2b. An explicit, committed test-timeout policy

**The contract:** `vitest.config.ts` gains an **explicit** `testTimeout` sized for the
deep-recursion totality rows, committed in the repo (never a CLI flag, never a per-file
`it(..., { timeout })` sprinkle on one row — see §2c item 5):

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // The two 10k-deep totality rows are INHERENTLY slow: measured 3.1-3.4 s in
    // isolation and 5.4-5.8 s under full-suite load against vitest 5's 5 000 ms
    // default. The budget is committed (not implied) and sized above the worst
    // measured load case with margin, because the totality contract at depth
    // 10 000 is the thing being asserted and must not be shortened.
    testTimeout: 15_000,
  },
})
```

**Why an explicit committed budget is legitimate here while a blanket one is not.**

1. **It is a policy, not a workaround.** The budget is a repo fact: a test author reading
   `vitest.config.ts` sees the sanctioned wall-clock allowance for the whole suite, and a
   reviewer can diff it. A `--testTimeout` flag on a command line is invisible to the next
   agent and cannot be reviewed.
2. **Its justification is measured, not assumed.** 15 000 ms = the 5 800 ms worst measured
   load case with ~2.6× headroom — enough to absorb the 2.2× load variance RUL-3 names
   **without** absorbing a genuine regression. The Class-C rows (20-24.5 s) sit **outside**
   a 15 000 ms budget on purpose: **the budget is sized to keep the Class-C driver defect
   VISIBLE**, so this unit cannot silently paper over the test driver's per-op import loop
   (§1.1 Class C — **not** a production hot path; **corrected 2026-09-21**).
3. **It does not blanket the suite into meaninglessness.** 15 000 ms is a per-test ceiling,
   not a target; every other row completes in well under the old 5 000 ms default, so
   raising the ceiling changes no pass/fail state except the two B rows. A budget raised
   to the Class-C scale (e.g. 60 000 ms) **would** be the forbidden blanket override —
   it would make the 20-24.5 s per-op driver rows pass, i.e. launder the driver defect.

**C-8 — the pinned value is `15_000` ms** and it is the ONLY test-timeout knob in the
file. `hookTimeout` is not touched (no row approaches the 10 000 ms hook default). The
config file's other contents (`include`, `environment: 'node'`) are unchanged — in
particular the environment stays `node`, which is what makes the 5 000 ms (not 15 000 ms
browser) default arm relevant in §1.1.

### 2c. FORBIDDEN shortcuts (each one a review finding if present)

The following are **explicitly forbidden** — each one makes the suite green while
destroying the very signal this unit exists to restore, or launders a production defect
into a config change:

| # | Forbidden | Why it is forbidden |
| --- | --- | --- |
| 1 | A global `clearMocks: false` override in `vitest.config.ts` | It re-freezes the mock semantics of an old vitest version for the whole suite: it hides the Class-A breakage instead of fixing the capture pattern, and it leaves a config landmine for the next vitest bump. The fix is the pattern (C-1..C-4), never the default. |
| 2 | `restoreMocks: true` / `mockReset: true` anywhere as the remedy | Same class: a mock-semantics override adopted to avoid re-authoring a capture site. `restoreMocks` additionally restores spies to their original implementations, which would break the `ipcRenderer` stubs. The §2a `beforeEach` `invokeMock.mockReset()` calls are per-file hygiene on a re-armed spy (C-5), not a config-level remedy. |
| 3 | `isolate: false` | Ruled out by the probe's measurement (isolation was tested and is not the cause). Adding it changes cross-file module sharing for the whole suite — a far larger behaviour change than the defect it pretends to address. |
| 4 | Any `--pool` workaround (`--pool=forks` / `--pool=threads` / `poolOptions`) | The probe RULED OUT pool semantics by measurement. A pool switch is an environment change made to make a red suite green with no named mechanism, and it perturbs every timing-sensitive row (including B and C). |
| 5 | Deleting or shortening the deep rows (any depth < 10 000, a smaller `repeat` count, an `it.skip`, an `it.todo`, or replacing `expect(...).not.toThrow()` with a try/catch) — **or** a name filter / `-t` selection that excludes them, **or** a single per-row `{ timeout }` option on the two deep rows | The **totality contract at depth 10 000 IS the artifact** (`tests/unit-u2-rich-decompose.test.ts:569-574`; `tests/unit-s-paste-sanitization.test.ts:469-474`). Shortening the input to fit the default would delete the assertion the row exists for. A name filter or a per-row timeout leaves the suite's *default* wrong for the next deep row; the budget must be committed where the suite reads it (§2b). |
| 6 | A blanket `--testTimeout` CLI flag, or a `testTimeout` sized to the Class-C rows (≥ 20 000 ms) | A CLI flag is unreviewable (§2b.1); a budget at the Class-C scale makes the **per-op driver rows** pass (§2b.3) and launders `RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`'s **test-driver fix** into a config change — precisely the RUL-2 split this spec forbids. |
| 7 | Any `src/` edit under this unit (including a "small" `putEdgeSync` persist fix) | The Class-C fix is its own unit (§9) per RCA-2. Landing it here would merge two units' red→green→adversarial→verify cycles — the RCA-5/RCA-2 miss this repo has already paid for. |

---

## 3. The regression pins a TestWriter must author (RED FIRST)

Per AGENTS.md item 3 (TDD) + RCA-1 (the red set is RUN and REPORTED before any
implementation). The red set is **new test rows**, and every one of them must FAIL against
the current tree (§3.1's pins fail because the pattern is wrong; §3.3's pins fail because
no budget is committed; §3.4's guard depends on §9).

### 3.1 Pin 1 — the ONE sanctioned pattern, by SOURCE CONTRACT

**Pin (must fail today):** a source-contract test that reads the **4** bridge-mock files
(census **derived** by scanning `tests/**/*.test.ts` for the mock factory — §2a C-4's
closed set) and asserts, per file:

1. the file creates its capture box via a `vi.hoisted(() => ({ current: … }))` call
   (**C-1** — a regex on the `vi.hoisted` initialiser's returned object literal carrying a
   `current` property);
2. the `'electron'` mock factory's `contextBridge.exposeInMainWorld` value is a `vi.fn`
   **carrying an implementation** that assigns to that box (**C-2**);
3. `capturedBridge()` returns the box's `current` (**C-3**);
4. the file contains **ZERO** `exposeInMainWorldMock.mock.calls` occurrences — and, in
   fact, **zero `.mock.calls` reads against the electron mock at all** (**C-4**).

**Why it is red today:** all 4 files read `exposeInMainWorldMock.mock.calls[0][?][1]`
(§2a's four sites), and none creates a `vi.hoisted` box. This pin is the **anti-regression**
for the whole class: it fails against the *current* pattern and can only pass once the
pattern is applied, and it re-fails if a future file re-introduces a call-history capture.

**Style note (the repo's convention):** this is a **source pin** in the
`tests/live-drive-contract.test.ts` / `§2.8 source-pin` tradition — it asserts on the
FILES, not on a runtime behaviour, and its failure message must name the offending file and
the missing/forbidden construct (a source pin that cannot say which file is wrong is not
reviewable).

### 3.2 Pin 2 — the capture is NON-EMPTY after a `beforeEach`, and the REAL preload ran

**Pins (must fail today):**

1. **Non-empty after `beforeEach`.** In each of the 4 files, a row that enters a
   `beforeEach` (the file's existing `invokeMock.mockReset()` hook is enough — it is the
   exact `beforeEach` boundary the Class-A failure crossed) and then asserts
   `capturedBridge()` is a non-null object before any dereference. Today
   `capturedBridge()` is `undefined` **inside every test** (module-evaluation history
   cleared), so this fails at the assertion, not at a `TypeError` — which is the point:
   **the row must fail with a diagnostic, not a crash**.
2. **The REAL `preload.ts` executed against the mock — a key census > 0.** Assert the
   captured object's `sidebar` surface is **non-empty** and carries the named seams the
   sibling rows depend on (e.g. `sidebar.selectDocument`, `sidebar.togglePaneCollapse`,
   `sidebar.editorBlur`, `edit.commitRich`). **The pinned census is `41` sidebar keys**
   (`src/main/preload.ts:578-636`, counted at this pass) with the **hard** invariant being
   `> 0` and the exact count recorded as a **census assertion the preload may legitimately
   grow** — the TestWriter must assert `> 0` + the named-key presence strongly, and the
   exact `41` as a `expect(keys.length).toBeGreaterThan(0)` plus a recorded comment (a
   brittle exact-equality on 41 would turn every preload addition into a red row).
3. **The factory actually ran.** Assert the mock factory received **exactly ONE**
   `('provident', api)` call and that `api` is the object `capturedBridge()` returns
   (one exposure per preload evaluation — a second exposure is a real defect, not a
   harness concern, and the row must say so).

**Why it is red today:** (1) fails because the capture is `undefined` after the hook;
(2)/(3) fail for the same reason. Together with §3.1 this is the **exact failure mode**
pinned at its own boundary (inside a test, after a `beforeEach`) rather than only by a
source shape.

### 3.3 Pin 3 — the deep rows keep depth 10 000 + "never throws", with the budget EXPLICIT

**Pins (must fail today):**

1. **Depth is 10 000, in both files.** A row asserts the deep inputs are built with
   `'<strong>'.repeat(10000)` (and the matching closing repeats) — i.e. the depth is a
   **named constant** the pin reads, not a literal a later edit can quietly shrink. The two
   current sites are `tests/unit-u2-rich-decompose.test.ts:570` and
   `tests/unit-s-paste-sanitization.test.ts:470`.
2. **The totality contract still holds.** `expect(() => …).not.toThrow()` + `result.ok === true`
   for both, at that depth (**never** a try/catch swallow, **never** an `ok:false` tolerance).
3. **The budget is EXPLICIT and committed (must fail today).** A config pin asserts
   `vitest.config.ts` exports a `test.testTimeout` that is a **number** and is **≥ 15 000**
   (§2b C-8), and asserts the file contains no `clearMocks`/`restoreMocks`/`mockReset`/
   `isolate`/`pool` override (§2c items 1-4). **Why it is red today:** `vitest.config.ts:4-7`
   carries only `include` + `environment`, so `test.testTimeout` is `undefined`.

**Why pin 3 is a property of the CONFIG and not of the row:** the row's own contract is the
totality; the budget is the suite's. Pinning both keeps a future editor from satisfying the
config pin by changing the input, or the row pin by adding a local `{ timeout }` (§2c item 5).

> **OWED (2026-09-21 — recorded by the SpecDoc pass from the RCA-3 adversarial finding 6, over the
> three units landed in this goal; canonical home `docs/specs/unit-o0-m1-m3-measurement-shape.md`
> §13 (finding 6) + `docs/next-steps.md` CURRENT WORK).** TWO gaps, both **verified against the
> landed tree**: (a) **the §2c item 6 CEILING is NOT enforced by any pin.** The landed
> `checkConfigText` (`tests/unit-v5-migration-contract.test.ts`, the pure oracle behind §2b/§2c
> items 1-4) accepts **ANY** `testTimeout ≥ 15 000` — its only budget branch is
> `Number(...) < 15000 ⇒ error` — so a raise to 20 000/60 000 ms (the §2c item 6 / `F9` blanket
> override that launders the Class-C driver defect) passes Pin 3 and the `P-TP-2` register row.
> **The ceiling must be pinned as an explicit `≤` bound on the committed config value** (or the
> item-6 condition asserted directly), and `P-TP-2`'s "the §2c ceiling is enforced by the §3.3
> pin reading the committed value" wording is **SUPERSEDED as a description of the landed code** —
> recorded as owed rather than as contract. (b) **Pin 4 does NOT pin the PRODUCTION importer.**
> As landed (§3.4/4.2) Pin 4 drives the **store's** `applyBatch` with the op list the §2a driver
> builds — it does **not** read `src/main/markdown-import.ts`; **a revert of the production
> importer to a per-op loop would leave Pin 4 GREEN.** The owed pin is a **source-contract
> assertion on `src/main/markdown-import.ts`** (ONE `applyBatch`, no per-op `putNode`/`putEdge`
> loop), i.e. the same shape the Class-C anti-regression half already carries for the TEST driver.

### 3.4 Pin 4 — the Class-C import path cannot silently return to per-edge persist (**DEPENDS ON §9's unit**; **RE-POINTED 2026-09-21**)

**Pin (the RE-POINTED form — red/green status per 4.2; the DRIVER-source-contract half is red
until §9's driver fix lands) — authored concurrently by the TestWriter per the architect's
ruling, 2026-09-21:**

**4.1 — What changed and why (the ruling; record this in the pin's own comment/name).** As
authored, this pin timed a **bare per-op loop** (5 640 per-op store calls → **19 264 ms**
against its **5 000 ms PIN, as authored**). As shown below, **no admissible change can bring that bare loop
under budget, and none should**: the pin's own subject-unit (`unit-import-batch-persist.md`)
keeps the per-op cadence unchanged (§2b) and **forbids** changing it (§2c item 1), and that
cadence — each op atomic + durable = **one full-store `persist()`** — **is the store's
documented single-writer durability model** (`SINGLE-WRITER-STORE`, `docs/decisions.md:34`).
The bare per-op loop's `O(store-size)` cost is therefore an **ACCEPTED, recorded
characteristic** (a **NOTE**, never a red timing pin — §3.4.4). The unit's **verified**
finding stands: the **production importer was ALREADY batched** (ONE `applyBatch` → 1
`persist()` per import: `markdown-import.ts:387` → `rag-store.ts:1274-1343`) and the measured
slow path was the **TEST DRIVER's** per-op loop (`tests/import-render-no-duplicates.test.ts:52-53`).
**Pin 4's INTENT is "the import path must not silently return to per-edge persist".**

**4.2 — The pin, re-pointed.** The pin measures the **import path's own mechanism** — **ONE
`applyBatch(ops)`** of the importer's exact construction (all `putNode` ops, then all
`putEdge` ops — `markdown-import.ts:379-385`), over the real corpus
(`docs/specs/ui-overhaul.md`), against the **pinned budget — 5 000 ms as authored, and
**3 000 ms as landed** (the TestWriter re-pointed the row to the import path's mechanism and
unified the budget with §9's §5.1: ONE number for both pins on the same corpus; the landed
row carries `PIN4_BUDGET_MS = 3_000` in `tests/unit-v5-migration-contract.test.ts`)), with the corpus
census asserted (never assumed: the probe recorded 1 895 nodes / 3 745 edges / 116 139 bytes).
**Its red/green status follows the authored form and is recorded by the TestWriter**: if it
drives ONE `applyBatch` directly it is **green on arrival** (the production mechanism already
costs 1 persist per import — a legitimate regression pin, not a red row); if it drives the
**driver file's own import helper**, it stays **red until §9's driver fix lands**. **The
guaranteed-red half of the Class-C set was the two `import-render-no-duplicates` rows**
(§5 F11, §10 item 5) plus §9's driver source-contract pin — **not** this timing pin. **As
landed (2026-09-21)**: the row drives the store's `applyBatch` with the §2a op construction
green on arrival (43 ms at its own first reading; the §9 unit's §5.1 rows read 412 ms /
1 521 ms), and the accepted-cadence NOTE-pin beside it cross-references register `P-TP-4`.

**4.3 — The anti-regression intent lives in the DRIVER SOURCE-CONTRACT pin, not in a
timing pin.** The "must not return to per-edge persist" property is carried by §9's unit
`P-SM-2`/`FS4` — a **source-contract read** of `tests/import-render-no-duplicates.test.ts`
that fails, naming the file, if the per-op loop returns (and whose negative half fails against
the old pattern text, so it cannot pass vacuously). **A timing bound alone cannot carry this
intent**: a per-op loop is slow *by construction*, so a timing pin on it is unfalsifiable
(§3.4.4) — the source contract is the falsifiable form.

**4.4 — The accepted per-op cadence is a NOTE, not a pin (`P-TP-4` is its pin).** §9's unit
records the bare per-op cadence (`N` bare calls ⇒ exactly `N` persists) as an **ACCEPTED
CHARACTERISTIC** (`docs/specs/unit-import-batch-persist.md` §7.6), pinned by its register's
**`P-TP-4`** regression row.
**NEVER author here a red timing pin on the bare per-op loop**: with the cadence change
forbidden by §9's §2c item 1, such a pin can only stay red forever, and a permanently-red pin
is not evidence (it would also invite a later pass to delete it — F12).

**4.5 — The dependency is explicit and must be recorded IN THE ROW:** the row's comment/name
states the dependency explicitly — the **driver source-contract half** is red until
`RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`'s **driver fix** lands
(`docs/defects.md`, reclassified 2026-09-21 as **RESOLVED-BY-RECLASSIFICATION**: the residual
is the test-driver fix + the accepted per-op cadence), so no later pass mistakes its red for a
migration failure. Its green is **evidence for §9's unit**, and §9's unit inherits it as a
regression pin.

**Why the Class-C set is red today:** the **test driver** still performs 5 640 per-op store
calls, so the two `import-render-no-duplicates` rows and the driver source-contract pin are
red — **not** because `src/` has a per-import fallback (it has none — the production import
path is batched today). **Note the ordering consequence:** the Class-C green is **not**
achievable in this unit. A TestWriter landing the pins red-first is correct; the rows must be
recorded in the red set as "expected to stay red until §9's driver fix lands" — **not** as
migration blockers and **not** as a licence to delete them.

---

## 4. §5.x Property register (PBT) — typed, ≤8 rows

Register convention (imported): rows typed **P-IM** (input-model), **P-SM** (state-model),
**P-TP** (transform) — **NEVER F-rows, never §6/FS-n**; **≤8 rows, at most 100 attempts/row**
(per-row ceiling; the budget is stated as `Σ(attempts/row)`, never as a fixed total).
**Scope note (mandatory):** every row below is scoped to the **TEST-HARNESS / CONFIG layer**
— the capture box + the source contract + the committed budget. **No row in this register
covers the Class-C per-op import path** (that is §9's unit and its own register); a row
claiming to pin `putEdgeSync`'s persist cadence belongs to §9, not here. All rows are
**pure** and run under `npm test` in a **new** file (proposed:
`tests/unit-v5-migration-contract.test.ts`; the source-pin half may live beside it).

| Row | T | Pinned invariant | Generator / strategy | Falsifiable oracle | Layer covered |
| --- | --- | --- | --- | --- | --- |
| `P-IM-1` | IM | **The capture box is populated for EVERY generated `(name, api)` pair the factory receives.** For any `name` string and any object `api`, a factory built by the §2a pattern — driven **through `vi.hoisted`-style construction + the implementation call** — leaves `bridgeBox.current === api` (the store is a function of the ARGUMENT, never of call order or history). The `name` is deliberately **not** consulted (`capturedBridge()` is name-agnostic), so a renamed exposure still captures. | `strat:v5-capture-pair` — generate `(name, api)` pairs over `name ∈ {'provident','other','', '\u0000x'}` × `api ∈ {{}, {a:1}, an object with 41 keys, an object with a `sidebar` namespace, a frozen object, an object with a prototype-key key}`; **the SAME box instance is reused across draws** so the row also proves the last write wins | the oracle returns `bridgeBox.current === api` (identity, not deep-equality) for every draw; a counterexample prints the draw index + the `api` key set; a draw where the box is still `undefined` after the implementation call is a failure | harness (pure) |
| `P-IM-2` | IM | **The implementation RETURNS `undefined` and has no other side effect.** The pinned factory is a *store*, not a proxy: its return value is `undefined` for every draw, and it writes to **exactly one** target (`bridgeBox.current`) — i.e. the mock cannot be a second, divergent exposure surface. | `strat:v5-factory-purity` — the same `(name, api)` draws as `P-IM-1`, plus a `Proxy`-based `api` whose property reads are counted, plus a draw where `api` is `null`/`undefined` (the malformed half) | the oracle asserts the return is `undefined`; asserts exactly one write to the box target per call (a property-write counter over a box proxy); and asserts a `null`/`undefined` `api` is **stored as-is rather than throwing** (a malformed exposure is recorded for the caller's assertion — the factory must never throw, because a throw inside the preload's own call is indistinguishable from a preload defect at the boundary) | harness (pure) |
| `P-SM-1` | SM | **The capture SURVIVES a cleared mock history.** This is the decisive invariant: after any number of `clearAllMocks()`-equivalent clears (`mockClear` on the factory mock, `mockReset` on the IPC spy, both at once), `capturedBridge()` still returns the SAME object identity it returned before the clear. This is exactly the Class-A counterexample class, inverted. | `strat:v5-clear-survival` — a state PAIR per draw: capture, then apply one of `{mockClear, mockReset, clearAllMocks, restoreAllMocks, no-op}` (draw mode), then re-read; the box is never reset (C-5) | the oracle asserts `before === after` identity for every clear mode **including `mockClear` on the factory mock** — and asserts the CALL-HISTORY pattern **fails the same oracle** (a companion negative row reading a `vi.fn()` mock's `calls[0]` after a `mockClear` must observe `undefined`, proving the row discriminates the two patterns rather than passing vacuously) | harness (pure) |
| `P-SM-2` | SM | **The sanctioned pattern is the ONLY one present in the bridge-mock file set (the source-contract invariant).** Over the **derived** 4-file set (§2a C-4): every file has the hoisted box (`current`), a `vi.fn` implementation on `exposeInMainWorld`, a `capturedBridge()` accessor returning the box, and **zero** `.mock.calls` reads against the electron mock. A file that mocks `'electron'` with the call-history shape is a counterexample. | `strat:v5-pattern-census` — the generator is the repo scan (every `tests/**/*.test.ts` containing the electron mock factory), and each draw is one file × one construct check; the negative half is a synthetic file TEXT carrying the old pattern (must FAIL the same checks) | the oracle returns `ok:true` iff all four construct checks pass on all files AND the derived census is non-empty (an empty scan is a FAILURE, not a vacuous pass — "a block that cannot fail is NOT evidence", `docs/specs/user-flow-audit.md:90-91`); every failure names the file + the construct | harness source contract |
| `P-TP-1` | TP | **The deep-row input is built at depth exactly 10 000 and the totality contract is asserted, at that depth, for both entry points.** For any generated `depth ∈ {10 000, plus perturbations}` the built input string has exactly `depth` opening tags, and the pinned contract (`not.toThrow()` + `ok === true`) holds; a **shortened** input (`depth < 10 000`) fails the depth oracle even though the contract still holds — i.e. the row cannot be satisfied by shrinking the input. | `strat:v5-deep-input` — generate `depth ∈ {9_999, 10_000, 10_001}` × `tag ∈ {'strong','em'}` × the two entry points (`decomposeRichHtml` at `tests/unit-u2-rich-decompose.test.ts:572`, `sanitizePastedHtml` at `tests/unit-s-paste-sanitization.test.ts:472`); the 10 000 draws run the real functions (bounded: 3 draws × 2 entry points) | the oracle asserts `openTagCount === depth` AND the totality contract at `depth === 10_000`; the `9_999` draws are **contract-holding but depth-failing** — they exist to prove the depth assertion is load-bearing; a `10_001` draw asserts the contract does not become depth-sensitive at the boundary | transform (pure) + the committed budget |
| `P-TP-2` | TP | **The budget is COMMITTED and the forbidden overrides are ABSENT.** `vitest.config.ts`'s `test.testTimeout` is a number `≥ 15_000`; the file contains no `clearMocks`/`restoreMocks`/`mockReset`/`isolate`/`pool`/`poolOptions` override; and no `--testTimeout` CLI flag appears in the repo's sanctioned test invocation (`package.json`'s `test` script, `:19`). A budget below the pinned minimum, or any forbidden override present, is a counterexample. | `strat:v5-budget` — draws over a synthetic config TEXT: `testTimeout ∈ {undefined, 4_999, 5_000, 15_000, 60_000}` × `override ∈ {none, clearMocks:false, restoreMocks:true, isolate:false, pool:'forks'}`; plus a real read of the committed `vitest.config.ts` + `package.json` | the oracle returns `ok:true` iff the committed file's budget is a number `≥ 15_000` AND no forbidden override is present AND the `test` script carries no `--testTimeout`; the synthetic draws prove each of the 5 override modes and the sub-minimum budgets are caught (a `60_000` synthetic draw is **legal for the property but is a §2c-6 review finding for the real repo** — the property row pins the floor + the absence of overrides, and the §2c ceiling is enforced by the §3.3 pin reading the committed value) |

> **CORRECTION + OWED (2026-09-21 — recorded by the SpecDoc pass from the RCA-3 adversarial finding 6;
> canonical home `docs/specs/unit-o0-m1-m3-measurement-shape.md` §13.1 (6) + `docs/next-steps.md`
> CURRENT WORK).** The parenthetical above — "**the §2c ceiling is enforced by the §3.3 pin reading
> the committed value**" — is **STALE against the landed code: the ceiling is NOT enforced by any
> pin.** The landed `checkConfigText` accepts **any** `testTimeout ≥ 15 000` (its single budget
> branch is a `< 15000` error), so a raise to the Class-C scale (20 000 / 60 000 ms — the §2c item 6
> / `F9` blanket override) passes Pin 3 and this row. The owed change is an explicit `≤` bound (or
> the item-6 condition asserted directly) on the committed value; see §3.3's OWED note for the
> companion half (Pin 4 does not pin the production importer, `src/main/markdown-import.ts`).
 config (pure) |
| `P-TP-3` | TP | **A cleared mock history does not affect the capture — stated as the TRANSFORM, over the pinned pattern and the preload's real exposure surface.** Given a factory-driven exposure of the REAL bridge shape (§3.2's 41-key surface) and ANY sequence of clears, the `(key count, named-seam presence)` pair read from `capturedBridge()` is invariant; and the same read against the call-history pattern collapses to `undefined`. | `strat:v5-capture-transform` — draws over the exposure surface `{41 keys, 1 key, 0 keys, a `sidebar`-only object}` × clear sequences `{[], [mockClear], [mockClear, mockReset], [clearAllMocks]×3}`; the 0-key draw is the boundary (the census must be `> 0` for the REAL surface, so a 0-key synthetic draw asserts the row's own boundary is stated, not silently passed) | the oracle asserts the pair is byte-identical across every clear sequence for the factory pattern and `undefined` for the call-history pattern; a counterexample prints the clear sequence + the observed key count | transform (pure) |

**Register count: 7 rows** (`P-IM-1`, `P-IM-2`, `P-SM-1`, `P-SM-2`, `P-TP-1`, `P-TP-2`,
`P-TP-3`) — **one below the ≤8 cap**, deliberately (the no-pad rationale below). Budget: the
TestWriter allocates **60 attempts/row for the six harness rows and 40 for `P-TP-1`**
(bounded by its 3×2 real 10 000-deep executions) → **60×6 + 40 = 400 attempts, ≤ 800 at the
ceiling (8 × 100), every row ≤ 100**, with stop-after-5. The allocation constants must be
recorded in the new test file's own constant (the `PBT_ATTEMPTS` convention,
`tests/unit-o-0-report-contract.test.ts`).

**Trio command + parked discipline (the register's own pin).** The register is exercised by
the **trio** — `npm test` / `npm run typecheck` / `npm run build` (`package.json:19`,
`:18`, `:10`) — and **`npm test` is the leg this unit exists to restore**: the six harness
rows are **green-on-arrival by design** (§2a is the fix they pin, and a property row that
cannot fail until the fix lands is not evidence — so `P-SM-2`'s zero-`.mock.calls` half and
`P-TP-2`'s committed-budget half are the two rows that MUST be red before the fix and green
after, and the TestWriter records which of the two halves was red in its red-set report).
**No row in this register may be parked**: every one of them is exercisable in node, so a
`-live-pending-battery.md` for this unit would be a review finding, and a register row
parked as "needs the app" is a finding against the row's own layer statement (§0). The
**adversarial pass (RCA-3)** and the **documentation review (RCA-6)** are owed after the
greens, with their records landing in §6 and §10 item 8.

**No-pad rationale (the honest record).** One further candidate was considered and **NOT**
entered as a row:

1. *"the `beforeEach` hygiene block (`invokeMock.mockReset()`) is present in all 4 files"* —
   this is **structural presence**, already entailed by `P-SM-2`'s per-file construct scan
   (the same scan can assert the hook), and a separate row would have the same generator and
   the same subject. It is instead pinned as a **state** (§5 S6) and a **fail-state** (§5 F8).
2. *"the exact sidebar census is 41"* — **NOT an invariant**: the preload legitimately grows
   (it has grown before, e.g. the LIVE-11 four-seam batch), so an exact-count property row
   would be red for the wrong reason on the next seam. The census lives as a **state** (§5
   S7) asserting `> 0` + named-key presence, with the measured `41` recorded as provenance.
3. *"a per-edge `persist()` count bound"* — **out of scope by construction**: it is a row
   over `src/main/rag-store.ts`, i.e. §9's unit and its register. Entering it here would put
   a production-layer invariant in a test-harness register and violate RCA-12's layer split.

**Padding the register to the cap with any of these would be a review finding.**

---

## 5. States, fail-states and throw patterns

### S — states (every state the TestWriter must derive)

| # | State | Expected observable |
| --- | --- | --- |
| **S1** | **Module evaluation vs test execution (the Class-A boundary)** | the preload's `exposeInMainWorld('provident', bridge)` call happens ONCE, during module evaluation (`src/main/preload.ts:642`); the capture box holds the API **before the first test body runs**, and `capturedBridge()` is non-null at every test. This is the state whose absence produced the `TypeError`. |
| **S2** | **The `calls[]` history has been cleared** (module collection → `clearMocks` → test) | `exposeInMainWorldMock.mock.calls` is `[]` while `bridgeBox.current` is the live API object. The two reads **disagree by design** — and only the box is a legal capture target. |
| **S3** | **No `beforeEach` / a `beforeEach` present** (both legal) | the capture is identical in both cases (it is not a `beforeEach`-scoped value). The file's existing `invokeMock.mockReset()` hook is present in all 4 files (C-5) and must not be relied on for the capture. |
| **S4** | **The mock factory ran / did not run** | ran: `bridgeBox.current` is the API object, `sidebar` is non-empty (41 keys today). Did not run (a broken hoist, a missing import): the box stays `undefined` — **the loud state**, and §3.2's pin fails with a diagnostic rather than a `TypeError`. There is no third state: a *partially* exposed bridge is a preload defect, not a harness state. |
| **S5** | **A second `exposeInMainWorld` call** (double exposure) | the box holds the LAST API object (last-write-wins, `P-IM-1`) and the §3.2 pin's "exactly ONE call" assertion FAILS, naming the count — a double exposure is a preload defect surfaced by the harness, never silently tolerated by the box. |
| **S6** | **Per-file mock hygiene present / absent** | `invokeMock.mockReset()` present: the IPC spy's history is empty at each test start (what the Class-A rows assert against). Absent: the spy's history accumulates ACROSS tests, so an `expect(invokeMock).toHaveBeenCalledWith(...)` row becomes order-dependent — a **fail-state** (§5 F8), not a legal variation. |
| **S7** | **The preload surface census** | the exposed `sidebar` object carries **41** keys today (`src/main/preload.ts:578-636`) with the named seams §3.2 lists. The pinned invariant is `> 0` + named-key presence; `41` is the recorded measurement, so a preload addition is not a red row. |
| **S8** | **The budget state: committed vs implied** | committed: `vitest.config.ts`'s `test.testTimeout` is `15_000` and the deep rows pass under load. Implied (today): `test.testTimeout` is `undefined` → the 5 000 ms default applies → the deep rows FAIL under full-suite load while passing in isolation. **The two readings' disagreement IS the Class-B signature**, and it is why the budget must be committed (a per-run flag makes exactly one of the two readings true). |
| **S9** | **The deep-row timing state: isolation vs full-suite load** | isolation: 3.1-3.4 s (passes the 5 000 ms default). Full-suite load: 5.4-5.8 s (fails it) — a **2.2× variance band** (RUL-3). The state must be recorded per run, never as a single number; a row measured only in isolation is not evidence about the suite. |
| **S10** | **The Class-C state (the driver's per-op import loop) vs the deep-row state (inherent cost)** | **both present 5 000 ms-default failures whose causes differ**: C is 20-24.5 s of per-op `persist()` work reached through the **TEST DRIVER's loop** (the store side is behaving exactly as documented — one atomic durable write per op: an **ACCEPTED characteristic**, `docs/specs/unit-import-batch-persist.md` §7.6); B is 5.4-5.8 s of inherent tokenizer/parser cost **inside the tests' own inputs**. Observable discriminator: B's rows pass in isolation under the 5 000 ms default; C's do NOT (20-24.5 s > 5 000 ms even alone). **The migration must leave C VISIBLE** — after this unit, C's rows are still red, and that red is the §9 unit's entry condition. |

### FS — fail-states (each loud, each with an exact observable)

| # | Fail-state | Observable outcome + message shape |
| --- | --- | --- |
| **F1** | **The capture is `undefined` at test time (the Class-A failure)** | `capturedBridge()` returns `undefined` inside a test after a `beforeEach`; the dereference throws `TypeError: Cannot read properties of undefined (reading 'rag')` (the recorded raw form, `tests/unit-wave-1-bridge-wiring.test.ts:181-182`). **Post-fix this must be unreachable**, and §3.2's pin asserts the non-null BEFORE any dereference so a recurrence fails as an assertion with a message naming the file — never as a crash. |
| **F2** | **A bridge-mock file uses the call-history pattern** | the §3.1 / `P-SM-2` source pins FAIL, naming the file and the construct (`<file>: capture reads exposeInMainWorldMock.mock.calls — the sanctioned capture is the bridgeBox pattern (§2a C-1..C-4)`). **Never a warning, never a skipped row.** |
| **F3** | **The box is created at module scope (TDZ) instead of inside `vi.hoisted`** | preload evaluation throws `ReferenceError: Cannot access 'bridgeBox' before initialization`, the file's rows fail at IMPORT (not at an assertion), and the §3.1 pin's construct (1) fails, naming the offending initialiser. Message shape: `<file>: the capture box is not created inside vi.hoisted — a module-scope binding is in the TDZ when the hoisted mock factory runs (§2a C-1)`. |
| **F4** | **The factory is a bare `vi.fn()` (no storing implementation)** | `bridgeBox.current` stays `undefined` for every test; §3.2's pin fails at the non-null assertion and `P-IM-1`'s first draw fails. The pin's message must name the missing implementation: `<file>: contextBridge.exposeInMainWorld is a bare vi.fn — the §2a C-2 implementation must store the exposed API`. |
| **F5** | **`bridgeBox` is reset/cleared between tests** | the first test after the reset passes, every subsequent test fails with F1's undefined capture. Observable: a file whose FIRST row is green and whose SECOND row is red with a non-null assertion failure — the signature of a per-test reset, and `P-SM-1` names it (`the capture was cleared between tests — the box is module-evaluation state and is never reset (§2a C-5)`). |
| **F6** | **A deep row's input was shortened (< 10 000) or the totality assertion was relaxed** | the §3.3 / `P-TP-1` pins FAIL naming the observed depth and the required `10 000`; a relaxed assertion (`try/catch`, an `ok:false` tolerance, an `it.skip`) is a §2c-5 review finding **in addition** to the pin failure. Message shape: `<file>: deep-row depth is <n> — the totality contract at depth 10000 is the artifact (§2c item 5)`. |
| **F7** | **No committed budget, or a forbidden override present** | §3.3's config pin + `P-TP-2` FAIL. Shapes: `vitest.config.ts: test.testTimeout is undefined — the deep rows need a committed budget (§2b C-8)`; `vitest.config.ts: <clearMocks\|restoreMocks\|mockReset\|isolate\|pool> override present — forbidden (§2c items 1-4)`. |
| **F8** | **A per-test hygiene block is missing** | the affected file's `invokeMock`-asserting rows become order-dependent (they can pass alone and fail in file order) — the loud observable is a row that depends on a PRECEDING row's call history. Message shape: `<file>: no beforeEach invokeMock.mockReset() — the IPC spy history accumulates across tests (§2a C-5/§5 S6)`. |
| **F9** | **The Class-C rows are made to pass by a config change** | a `testTimeout ≥ 20 000` (or any budget sized to the Class-C measurement) is present: §2c item 6's review finding + `P-TP-2`'s synthetic `60_000` draw documents the class. Observable: the two `import-render-no-duplicates.test.ts` rows are green **while the per-op driver loop is still in the file** (the driver source-contract pin `P-SM-2` of §9's unit would still be red) — i.e. a green suite with the Class-C driver work unlanded, which is itself the finding. |
| **F10** | **A `src/` edit landed under this unit** | the unit's own diff touches `src/**`: a process finding (RCA-2/RCA-5) — the Class-C fix belongs to §9's unit and its own red→green→adversarial cycle, and a merged cycle repeats the battery B/C/D miss (`AGENTS.md` item 2/RCA-5). |
| **F11** | **The unit reports the trio green while the Class-C rows are red** | **this is the EXPECTED interim state, not a defect — but it must be REPORTED as such**: the DONE row may claim `npm test` = 0 failed **only** after §9's **driver fix** lands. Claiming a green trio with the Class-C red set unreported is a review finding (AGENTS.md item 4; RCA-12 — state the layer and what is NOT claimed). |
| **F12** | **A regression row is deleted rather than made green** | the red set's census drops and the §3 pins' own file no longer exists: a review finding. Every §3 pin has a named home file, and the unit's DONE row must record the red→green count for it (RCA-1). |

**Throw patterns.** The §3 pins are ordinary assertions: they **fail**, they do not throw
(except F1's legacy `TypeError`, which the pins exist to make unreachable). The property rows
(§4) are **pure functions over generated inputs** and return discriminated results
(`{ ok, errors }` / a boolean + a counterexample string) — **never throw** on malformed
input: a malformed draw (`null` config text, an empty file set, a `null` `api`) is a
counterexample, not an exception. The ONE deliberate throw is the **source-scan census**:
an empty scan (no `'electron'`-mocking file found) is a **loud failure**, because a
source-contract pin that scans nothing must not pass vacuously (`docs/specs/user-flow-audit.md:90-91`).

---

## 6. §3a / §3b — Adversarial findings (RCA-3)

**§3a (adversarial pass on the landed migration):** **LANDED — see the unit's adversarial +
doc-review records** (`archive/reviews/2026-09-21-unit-v5-migration-doc-review.md`; the
adversarial pass ran read-only after the greens and its findings are recorded there + in the
active trackers, including **RCA-13** — the `codeOnly` silent no-op in
`tests/unit-v5-migration-contract.test.ts`, filed as a low-severity HOST row in
`docs/defects.md` with its **owed follow-up**: Pin 1's per-file hygiene half still reads raw
text). The hunt list that governed the pass (kept as the pass's own work list): (i) a
**surviving call-history capture**
in any file (including a NEW file that starts mocking `'electron'`, which the derived census
must have caught); (ii) a **reintroduced TDZ box**; (iii) a **relaxed Class-A assertion**
(a row whose assertion was weakened while its red was repaired — the `diff` of the 18 rows'
expectations is the artifact — **verified: ZERO assertions touched**); (iv) a **budget that
is legal by C-8 and still laundering a
defect** (§2c item 6 — the Class-C rows' state after the migration is the check); (v) a
**deep row whose depth constant drifted** or whose totality assertion became tolerant;
(vi) **flakiness** — a re-run of the full suite twice with the counts recorded, since RUL-3's
variance is the very thing this unit must quantify rather than hide; (vii) **`src/`
untouched** (the unit's diff is the evidence — **verified: 0 `src/` edits**).

**§3b (re-audit after the fixes):** **LANDED — the documentation review (RCA-6/item 10d) ran
after the greens; its record is `archive/reviews/2026-09-21-unit-v5-migration-doc-review.md`**
(verdict `PASS-WITH-FIXES` → `RECONCILED`; it reconciled this spec + the active trackers
against the landed tree and re-pinned the citations/section references).

---

## 7. Census + cross-references

### 7.1 Census (the numeric claims of THIS spec)

| Deliverable | Count |
| --- | --- |
| Bridge-mock files migrated to the ONE pattern | **4** migrated (`tests/unit-wave-1-bridge-wiring.test.ts`, `tests/unit-live11-bridge-seams.test.ts`, `tests/unit-u5-rich-commit-ipc.test.ts`, `tests/template-adversarial.test.ts`) — the **derived** set (every `tests/**/*.test.ts` carrying the `'electron'` mock factory) at the spec pass (§2a C-4). **AS LANDED the derived census is 5 files** — the harness file `tests/unit-v5-bridge-capture.test.ts` mocks `'electron'` too (Pin 2 exercises the sanctioned pattern against the REAL preload), and C-4's own rule ("any other file that starts mocking `'electron'` joins this set") admits it |
| Class-A failure rows to restore | **18** by the per-file red-set split (7 + 5 + 4 + 2; `docs/defects.md` `SUITE-RED-AFTER-VITEST5-ELECTRON44`). **The prompt's "14 tests / 4 files" framing is DISPROVEN** — the red set ran **18 rows in 4 files**; the per-file split is authoritative (§7.2(2)) |
| Class-B failure rows to restore | **2** (`unit-u2-rich-decompose` `ADR-4` `:569`; `unit-s-paste-sanitization` `Tokenizer F1` `:469`) |
| Class-C failure rows restored by §9's **driver fix** | **2** (`tests/import-render-no-duplicates.test.ts` — the envelope row (`SPEC_FILES` loop) and the rendered-DOM row). **Cause (corrected 2026-09-21): the TEST DRIVER's per-op loop**, not a per-import fallback in `src/` — the production import path is **already batched** (1 persist per import). The per-op cadence itself is an **ACCEPTED characteristic** (`docs/specs/unit-import-batch-persist.md` §7.6). **Both rows are GREEN as landed** (§9's driver fix: ONE `await store.applyBatch(ops)`, result checked) |
| Pinned test-timeout budget | **15 000 ms** committed in `vitest.config.ts` (§2b C-8) — the ONLY test-timeout knob; `hookTimeout` untouched |
| New §5 register rows | **7** (`P-IM-1`, `P-IM-2`, `P-SM-1`, `P-SM-2`, `P-TP-1`, `P-TP-2`, `P-TP-3`) — one below the ≤8 cap; budget `60×6 + 40 = 400` (≤800 at the ceiling) |
| New §3 regression pins | **4** (source contract; after-`beforeEach` non-empty + real-preload census; deep depth+contract+budget; the Class-C import-path guard — **RE-POINTED 2026-09-21** to the import path's own mechanism (ONE `applyBatch`) against the **3 000 ms** budget; all four **GREEN as landed**) |
| New test files | **2** as landed — `tests/unit-v5-bridge-capture.test.ts` (**Pin 2** + register `P-IM-1`/`P-IM-2`/`P-SM-1`/`P-TP-3`; its own `PBT_ATTEMPTS = 60 // 60×6 + 40 (P-TP-1) = 400`) and `tests/unit-v5-migration-contract.test.ts` (**Pins 1/3/4** + register `P-SM-2`/`P-TP-1`/`P-TP-2` + the accepted-cadence NOTE-pin). **The earlier "1 new file" line was a phantom** (the register and the pins were split across the two files) — **0** new production modules, **0** `src/` edits |
| Forbidden shortcuts enumerated | **7** (§2c) — each a review finding if present |
| Exposed-bridge census (the real preload) | **41** `sidebar` keys today (the `sidebar` object literal, `src/main/preload.ts:578-636`; the `exposeInMainWorld('provident', bridge)` call is `:642`); the pinned invariant is `> 0` + named-key presence (§3.2 / §5 S7) |
| `vitest.config.ts` before / after | before: the **8-line pre-migration file** (`include` + `environment` only, `:1-8`); **as landed: the 8-line pre-migration file + the committed budget block** (14 lines; `testTimeout: 15_000` at `:12`, with its 5-line justification comment) |
| The `RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT` corpus | `docs/specs/ui-overhaul.md` = **1 895 nodes / 3 745 edges / 116 139 bytes** (§1.1 Class C; §9). The row itself is **RESOLVED-BY-RECLASSIFICATION (2026-09-21)**: production import is already batched; the residual is the test-driver fix + the accepted per-op cadence |
| Trio | **`npm test` = 0 failed is the acceptance (§2b/§1 acceptance) — and it was UNREACHABLE by this unit alone** (the 2 Class-C rows stayed red until **§9's driver fix** landed); **AS LANDED (2026-09-21, both units): `npx vitest run` = 217 files passed (217) · 4 905 passed · 58 skipped · 0 failed (4 963 total), exit 0; O-0 suites 106/106; `npm run typecheck` exit 0; `npm run build` exit 0 (5 bundles)**. The unit alone restored classes A + B (20 of the 22 rows); §9's unit restored C (the last 2). The re-baselined counts are committed in the DONE rows (`docs/next-steps.md` CURRENT WORK) |
| `src/` behavior change | **0** (the whole unit is `tests/**` + `vitest.config.ts`) |

### 7.2 Provenance, corrections and what could NOT be verified at this pass

1. **No committed probe artifact exists.** The probe's findings are this unit's input as
   relayed to the SpecDoc role; the numbers in §1.1 (the per-class timings, the Class-C
   profile, the 2.2× load variance) are **reproduced as the probe's measurements**, not
   re-measured here (this pass runs no `npm`, no vitest, no app — per the role's tool wall).
   Every **file/symbol/line** citation copied into this spec **was** re-verified against the
   tree at this pass (§7.4). The **timings** are the one category that could not be
   re-measured here and are marked as the probe's numbers wherever quoted.
2. **Corrected and SETTLED: the per-file Class-A split.** The prompt's Class-A summary ("14
   tests / 4 files") did not add up against its own list (7 + 5 + 4 + 2 = 18) and against the
   recorded 22-row total (18 + 2 Class-B + 2 Class-C = 22 ✓). The `docs/defects.md` split
   is **self-consistent with the 22 total**; **the red run SETTLED it — the red set ran
   `18 rows in 4 files`**, so the "14" is **DISPROVEN** (recorded here as a disproved
   probe/prompt figure, never as an open question).
3. **Corrected: the deep-row line anchors.** The probe names "`tests/unit-u2-rich-decompose.test.ts:569`"
   (a file, no line, in the pending row) and the prompt names both rows. Verified: the
   `unit-u2-rich-decompose` deep row is at **`:569-574`** (`ADR-4`, `:570` builds the input)
   and the `unit-s-paste-sanitization` deep row is at **`:469-474`** (`Tokenizer F1`, `:470`
   builds it) — the pending row's bare `:569` is correct for its file.
4. **Corrected: DEC-2's hypothesis (a)** — recorded as "a vitest-5 mock/hoisting semantics
   change" with the honest note that it was "INTERNALLY INCONSISTENT (only <some> of the
   rows fail)". The probe's measurement replaces the hypothesis with the named mechanism
   (`clearMocks: true` clearing module-evaluation call history) and **RULES OUT** hoisting,
   `isolate`, pool, and `interopDefault` as causes. **The rows that *don't* fail are
   explained by not dereferencing the capture** (e.g. a row that only builds host fixtures,
   or a row whose bridge read is guarded) — the discrepancy is retained in §7.3(2) as the
   item the red run settles, and the old hypothesis is **disproven**, not merely superseded.
5. **Corrected: the drift.** The `docs/defects.md` / `docs/decisions.md` / `docs/pending.md` /
   `docs/next-steps.md` records of **25 failed / 8 files** (the third O-0 run) are the
   **load-induced timeout variance** RUL-3 names; the stable reading on this machine is
   **22 failed / 7 files**. All four trackers are corrected in this pass, and the 22 → 25
   drift is **explicitly NOT a fourth cause**.
6. **Corrected: the Class-C fix shape's "drop-in" claim is NOT safe as written.** The
   existing batch path is **not** a drop-in for the per-op write path, and the §9 row now
   says so: `applyBatchSync` (`src/main/rag-store.ts:1274`) journals **ONE** `kind:'batch'`
   entry (`:1340`) + **one** `persist()` (`:1341`), whereas `putNodeSync`/`putEdgeSync`
   journal **one entry per op** (`:1056`/`:1060`/`:1066` and `:1165`/`:1169`) + **one
   `persist()` per op** (`:1068`/`:1171`). So the batch path changes (a) the **journal
   granularity/undo depth** (`JournalEntry`'s batch variant, `:231-237`) and (b) the
   **failure semantics** (`applyBatch` returns `{ok:false, failedIndex, error}` and never
   throws, `:204-209`, vs the per-op path's `throw`), and it collapses `putEdgeSync`'s
   richer structural ops (`edge-retarget`/`doc-flow-role-change`/`edge-update`, `:1157-1164`)
   into generic inverse ops (`:1252`). **Verified at this pass**; §9's unit must decide the
   batch shape explicitly rather than assume equivalence.
7. **Not verifiable at this pass:** the **exact** red-set counts per file (the TestWriter's
   run), the **exact** re-baselined suite counts after the migration (owed), and whether a
   `docs/skills/designing-pages.md` update is owed — **that file does not exist in this
   repo** (the only file under `docs/skills/` is `docs/skills/process-guardrails.md`), and
   this unit changes no page design, so no page skill file and no test-use-case coverage
   matrix update is owed.
8. **AMENDED 2026-09-21 (the Pin-4 contract amendment — the architect's ruling on the
   blocking conflict; recorded here as this spec's provenance, and landing in the trackers in
   the same pass).** Pin 4 as authored timed a **bare per-op loop** (**19 264 ms** for the
   corpus's 5 640 per-op store calls vs its **5 000 ms PIN as authored**) — and **no admissible change can
   bring that loop under budget, and none should**: §9's unit keeps the per-op cadence
   unchanged and **forbids** changing it, because that cadence (each op atomic + durable =
   one full-store `persist()`) **IS the store's documented single-writer durability model**
   (`SINGLE-WRITER-STORE`, `docs/decisions.md:34`); the bare per-op loop's `O(store-size)`
   cost is an **ACCEPTED, recorded characteristic**, not a defect. **The ruling:** Pin 4 is
   **RE-POINTED** (by the TestWriter, concurrently) to measure the **import path's own
   mechanism — ONE `applyBatch`** — under the pinned budget; its **anti-regression intent**
   ("the import path must not silently return to per-edge persist") is carried by the
   **DRIVER SOURCE-CONTRACT pin** (`P-SM-2`/`FS4` in §9's unit); the bare per-op cadence is a
   **NOTE** pinned by §9's `P-TP-4` — **never a red timing pin**. **Verified finding behind
   it:** the production importer was **ALREADY batched** (1 persist per import —
   `markdown-import.ts:387` → `rag-store.ts:1274-1343`) and the measured slow path was the
   **TEST DRIVER's** per-op loop (`tests/import-render-no-duplicates.test.ts:52-53`), so
   §9's unit's own acceptance is the **driver fix** (+ the seam + the failed-batch
   byte-identity oracle + the two rows inside budget). §3.4 is rewritten to the re-pointed
   form; §1.1's Class-C row, RUL-2, §2b's wording, §2c item 6, §4's scope note, §5
   (S10/F9/F11), §7.1's census, §9 and §10 item 5 are corrected to match; the defect row
   becomes **RESOLVED-BY-RECLASSIFICATION**. **Not re-measured here:** the 19 264 ms figure is
   the ruling record reproduced as given (§7.2's rule for timings).

### 7.3 Cross-references (every load-bearing citation, re-verified against the tree)

- **`docs/defects.md`** — the row this unit closes (`SUITE-RED-AFTER-VITEST5-ELECTRON44`,
  now **FIXED (2026-09-21)**; corrected to the three-cause diagnosis + the final counts;
  its Class-C cell **re-corrected 2026-09-21** from "a GENUINE PRODUCTION HOT PATH" to the
  **test driver's per-op loop**); `RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT` (Class C, §9 —
  **RESOLVED-BY-RECLASSIFICATION 2026-09-21**, residual (a) LANDED, residual (b) the
  accepted cadence). **Note: the two rows' line anchors drift — cite them by id, never by
  line.**
- **`docs/decisions.md:15`** — **DEC-2** (the scheduling decision; its scope clause is
  §1/§7.2, and RUL-4 records which of its hypotheses survive; the row now carries the
  **STATUS UPDATE 2026-09-21** provenance append).
- **`docs/pending.md`** — the **SCHEDULED** row `VITEST-5 / ELECTRON-44 TOOLCHAIN
  MIGRATION` + the Class-C unit's row. **Both were RETIRED 2026-09-21** by the doc-review
  pass; the SCHEDULED section now carries ONE pointer line to the unit DONE rows in
  `docs/next-steps.md` + DEC-2's provenance — cite the *pointer*, never the old line numbers.
- **`docs/next-steps.md`** — the unit **DONE rows** in `## CURRENT WORK / handover-state`
  (migration + import-batch-persist) and the NEXT QUEUE short form (which now leads with
  **`O0-VALIDATOR-DROPS-POSTDERIVATION-REASONS`** → **`O0-M1-M3-MEASUREMENT-SHAPE`** →
  O-5 → O-9+O-3 → O-10 → O-1 → O-2).
- **`vitest.config.ts`** — the file §2b amends: the 8-line pre-migration file + the committed
  budget block (**14 lines as landed**; `testTimeout: 15_000` at `:12`).
- **`package.json`** — `:19` `test` (`vitest run`), `:18` `typecheck`, `:10` `build` (the
  trio); `:32-35` the bumped devDependencies (`electron ^44.4.3`, `esbuild ^0.28.2`,
  `vitest ^5.0.1`).
- **`node_modules/vitest/dist/config.d.ts:51/58`** — `configDefaults` + the `clearMocks`
  member; **`dist/chunks/defaults.D2ip7f-X.js:57`** — `clearMocks: true`; **`dist/config.cjs:56`**
  — the CJS twin; **`dist/chunks/index.DzobfTyw.js:9787`** (the resolved-config passthrough)
  and **`:14670`** (the `testTimeout` default `5e3` for the `node` environment);
  **`dist/chunks/index.m3L2HgmY.js:8488`/`:8567`/`:8571`** — `clearModuleMocks` and its
  per-test call site; **`dist/chunks/spy.DQ0ZsPbi.js:453`** — the `mockClear()` sweep.
- **`src/main/preload.ts:642`** — the ONE `exposeInMainWorld('provident', bridge)` call;
  **`:578-636`** — the 41-key `sidebar` object literal (the preload anchor: the object
  literal, not a `:585-643` range); **`:637-639`** — `installSidebar`.
- **`src/main/rag-store.ts`** — `:792-808` `persist()`; `:1038`/`:1068` `putNodeSync`+persist;
  `:1135`/`:1171` `putEdgeSync`+persist; `:1193-1194` the batch deferral comment; `:1200`
  `applyBatchOp`; `:1274` `applyBatchSync`; `:1340-1341` the single batch journal entry +
  persist; `:217-237` `JournalEntry` (incl. the `batch` variant); `:204-209` the
  `applyBatch` never-throw contract.
- **`tests/`** — the 4 bridge-mock files (each now carrying the hoisted `bridgeBox` capture
  and `capturedBridge()`); the two deep rows (`unit-u2-rich-decompose.test.ts` `ADR-4`,
  `unit-s-paste-sanitization.test.ts` `Tokenizer F1`); `import-render-no-duplicates.test.ts`
  (the `SPEC_FILES` list at `:35-38`, the corrected `importFile` = **ONE `await
  store.applyBatch(ops)` at `:65`** with the result checked `:68-72`, and the two rows it
  drives — **the per-op loop at the old `:52-53` is GONE**); the two landed pin/register
  files `tests/unit-v5-bridge-capture.test.ts` (Pin 2 + `P-IM-1`/`P-IM-2`/`P-SM-1`/`P-TP-3`,
  `PBT_ATTEMPTS = 60`) and `tests/unit-v5-migration-contract.test.ts` (Pins 1/3/4 +
  `P-SM-2`/`P-TP-1`/`P-TP-2` + the accepted-cadence NOTE-pin); the `PBT_ATTEMPTS` convention
  (`tests/unit-o-0-report-contract.test.ts`).
- **`docs/specs/unit-o-0-per-stage-measurement.md`** — the sibling unit's register + gate
  conventions this spec follows (§5 `:1120-1237`, §6 `:1241-1308`, §8 `:1391-1415`, §11
  `:1674`); its `## 6` fail-state table is the shape §5 mirrors.
- **`docs/specs/user-flow-audit.md:90-91`** — "a block that cannot fail is NOT evidence"
  (the basis of the empty-scan loud failure, §5 throw patterns / `P-SM-2`).
- **`AGENTS.md`** — item 2/RCA-5 (per-unit delegation), item 3/RCA-1 (red first), item 4
  (the trio gate), item 6 (tracker reconciliation), item 7 (the package/host defect split),
  item 10d/RCA-6 (the per-unit documentation review), item 12/RCA-12 (the layer statement).

---

## 8. The decision-row ruling (zero-row rationale)

**No new decision row is owed by this spec, and `docs/decisions.md` gains none.**
**DEC-2** (`:15`) already pins the *decision* this unit implements — the migration is
scheduled, is its own unit, and blocks the trio's `npm test` leg. What the probe added is a
**diagnosis** (one measured cause per failure class), which is a **spec/tracker fact**, not
a design choice: no alternative was chosen among, so there is nothing for a decision row to
record. The three places the diagnosis must live are (a) this spec (§1.1/RUL-1..RUL-4,
authoritative for the *contract*), (b) the corrected defect row (`docs/defects.md:25`) and
(c) the corrected SCHEDULED pending row + the NEXT QUEUE — all three updated in this pass.

**One adjacent correction, not a new row:** DEC-2's scope clause carries the *unproven
hypothesis* wording ("a vitest-5 mock/hoisting semantics change, which is INTERNALLY
INCONSISTENT"), which the probe has **disproved**. The DEC-2 row's decision text is left
intact (a decision record is a point-in-time record, and rewriting it would falsify the
history); the correction is carried as a **provenance note appended to the row's own cell**
pointing at this spec's §1.1/RUL-4 — so a reader of `decisions.md` cannot inherit the
disproved hypothesis as current. A *new* decision row would be the wrong instrument for a
measurement correction.

---

## 9. The adjacent Class-C unit (named here, specified elsewhere)

**`RAG-STORE-PER-EDGE-PERSIST-ON-IMPORT`** — recorded in `docs/defects.md` and scheduled in
`docs/pending.md`. **STATUS AMENDED 2026-09-21: the row is RESOLVED-BY-RECLASSIFICATION**
(not a fix, not a silent close): the production import path was **ALREADY batched** (1
`persist()` per import — `markdown-import.ts:387`), the measured slow path was the **TEST
DRIVER's** per-op loop, and the per-op cadence itself is an **ACCEPTED characteristic** of the
store's single-writer durability model (`docs/specs/unit-import-batch-persist.md` §7.6). It is
still the **second half of the trio restoration**:

- **Its subject (corrected):** the **test driver's per-op import loop**
  (`tests/import-render-no-duplicates.test.ts:52-53`) — which reaches
  `putEdgeSync` (`:1135`) → `persist()` (`:1171`) / `putNodeSync` (`:1038`) → `persist()`
  (`:1068`) once per record, i.e. a full-store `JSON.stringify(payload, null, 2)` +
  `writeFileSync` (`:792-808`) **per op**. **Those per-op semantics are correct and stay**;
  what is repaired is the driver (plus the batch's interior, made structural). At the
  `ui-overhaul.md` corpus (1 895 nodes / 3 745 edges / 116 139 bytes) the measured profile is
  `putNode` **2 879 ms** / `putEdge` **16 818 ms** / parse 7 ms / traversal 404 ms.
- **Its fix shape (corrected):** (1) the **driver** drives the store's **existing batch
  path** (`applyBatch` → `applyBatchSync` → `applyBatchOp`, `:1193-1272`) so `persist()`
  runs **once** (`:1341`) — the same construction the production importer already uses; (2)
  the batch's interior gains the **structural seam** ("no per-op full-store write inside a
  batch"). **With the caveat in §7.2(6)**: the batch path is **not** a verified drop-in
  (journal granularity/undo depth, never-throws failure semantics, and collapsed structural
  ops differ), so the unit must state which of those semantics it accepts and red-test them.
- **Its own cycle:** its own spec, its own TestWriter red set, its own
  red→green→adversarial→doc-review cycle (RCA-2/RCA-5), and its own DONE row. **It is NOT
  part of this unit** (§2c item 7), and its register is **not** this spec's (§4's scope note).
- **The dependency is bidirectional and must be stated in both units:** this unit's §3.4 Pin 4
  (and, decisively, the two `import-render-no-duplicates` rows) depends on §9's **driver fix**;
  §9's unit inherits §3.4 as a regression pin (in its **re-pointed** form — the import path's
  mechanism, ONE `applyBatch`); and **the trio is green only after BOTH land**.
- **It also restores the test's own driver — and that IS the fix (2026-09-21 ruling).**
  `tests/import-render-no-duplicates.test.ts`
  drove the **per-op** path as authored (`:52-53` `for (const n of parsed.nodes) await store.putNode(n)`
  / `for (const e of parsed.edges) await store.putEdge(e)` — **that loop is GONE as landed**;
  the helper now applies the corpus in ONE `await store.applyBatch(ops)`), whereas the production importer
  already uses the batch path (`src/main/markdown-import.ts:387`
  `const result = await ctx.store.applyBatch(ops)`). **The question "which side carries the
  fix" is SETTLED: the DRIVER carries the causal fix** (it is the site of the measured cost),
  and the **store-side seam is the STRUCTURAL half** that makes the batch's already-true
  invariant explicit — **NOT a cadence change**: a bare per-op call keeps persisting once per
  call, by design and by §9's `P-TP-4`. **Changing the store's per-op cadence is forbidden**
  (§9's §2c item 1): it would silently weaken the durability contract of all 22 single-record
  `edit-ops.ts` call sites and of `undo`/`redo`, and it is the one route that would make a
  timing pin on the bare per-op loop pass — i.e. the §2c-6-class laundering, explicitly NOT
  acceptable. The **anti-regression intent** of Pin 4 is carried by §9's **driver
  source-contract pin** (`P-SM-2`/`FS4`), not by a red timing pin on the accepted cadence.

**§9 LANDED (2026-09-21).** The adjacent Class-C unit (`docs/specs/unit-import-batch-persist.md`)
landed: the **driver** now applies the corpus through **ONE `await store.applyBatch(ops)`**
(`tests/import-render-no-duplicates.test.ts:65`, result checked `:68-72`), and the store gained
the **structural `persistDeferred` seam** (`src/main/rag-store.ts:807` declaration, `:809` the
`persist()` early-return, set `:1313`, cleared in a `finally` `:1346`). The two Class-C rows read
**412 ms / 1 521 ms** (vs §5.1's pinned 3 000 ms; the discriminating `ui-overhaul.md` row reads
73 ms and the `user-flow-audit.md` canary 7 ms); the register is **8/8 held** (460 attempts);
the §5.1 budget kept at 3 000 ms; and the accepted per-op cadence (N calls ⇒ N persists) stays a
documented characteristic pinned by register `P-TP-4`. The defect row remains
`RESOLVED-BY-RECLASSIFICATION` with residual (a) LANDED and residual (b) (the cadence) accepted.

---

## 10. The gate shape (how this unit is accepted)

- **Delivery kind:** **test + config.** One amended `vitest.config.ts` (§2b), 4 migrated
  test files (§2a), the §3 pins + the §4 register landed across **TWO** new test files
  (`tests/unit-v5-bridge-capture.test.ts` + `tests/unit-v5-migration-contract.test.ts`), and
  the re-baselined counts committed. **No `src/` edit, no new production module, no artifact
  document.**
- **Delegability (AGENTS.md item 9):** (a) **this spec exists** ✓; (b) a **TestWriter HAS
  run and reported the red set** ✓ — the red set ran **18 rows in 4 files** (Class A) + the
  two deep-row timeouts (Class B) + the two Class-C driver rows, including which of
  `P-SM-2`/`P-TP-2`'s halves were red; the unit was then delegated and **LANDED
  (2026-09-21)**.
- **Gate items (all must hold before DONE):**
  1. **The red set is RECORDED** per pin (RCA-1 — a DONE row without a recorded red run is a
     review finding).
  2. **`npm test` = 0 failed**, with the counts re-baselined and committed in the DONE row —
     **subject to item 5**.
  3. **`npm run typecheck` = 0** and **`npm run build` green.**
  4. **The §2c forbidden list is EMPTY** in the landed diff (7 items, each a review finding).
  5. **The Class-C dependency is stated and honored:** the 2 `import-render-no-duplicates`
     rows are **green because §9's driver fix landed** — not because a budget absorbed them
     (§5 F9). If they are still red while §9's driver fix has not landed, the DONE row says
     so explicitly and claims **no** green `npm test` leg (the AGENTS.md item 4 discipline,
     exactly as the O-0 DONE row did while this regression stood). **The re-pointed §3.4
     Pin 4 is part of that same clause**: it measures the import path's mechanism (ONE
     `applyBatch`), its anti-regression intent lives in §9's driver source-contract pin
     (`P-SM-2`/`FS4`), and the bare per-op cadence is a documented **NOTE** — **never** a red
     timing pin.
  6. **`src/` untouched** by this unit's diff (the evidence is the diff itself).
  7. **The adversarial pass (RCA-3) ran**, its findings are recorded in §6, and host findings
     are fixed + regression-tested; a `provident-ssr` **package** finding is a
     `docs/defects.md`/`HANDOFF.md` handoff.
  8. **The documentation review (RCA-6) ran** after the greens, with its record at
     **`archive/reviews/2026-09-21-unit-v5-migration-doc-review.md`** (LANDED — hyphens, the
     tree's convention), and it reconciled this spec +
     the 4 active trackers + `vitest.config.ts` against the build (names, counts, the pinned
     budget, the per-file split, every citation in §7.3).
  9. **The layer statement stands in the DONE row (RCA-12):** the unit is
     **TEST-HARNESS/CONFIG** — its green says the suite runs honestly under vitest 5, and
     says **nothing** about app behavior. **A green here must never be reported as
     "the app works".**
- **Re-baseline discipline:** the counts written into the trackers must be the ones the
  **landed tree** produces in the DONE run, recorded with the run's date and the command,
  and **never** carried forward from an earlier reading (RUL-3's variance is exactly why a
  carried number drifts — the 22 → 25 episode is the precedent).
