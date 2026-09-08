# Spec — Unit U-H7: Default Reassignment — `hotSetDefault(name)` — the hot-set-default controller mechanism (D5/A-P2-4/D4-rename-fold)

> **STATE (2026-09-08): U-H7 is THE NEXT CYCLE after U-H6 — NOT YET LANDED.** This
> document is the PROPOSED behavior contract for U-H7. The gate's **HIGHEST-RISK
> unit** (D5 split out for teardown + accessor-backed IPC + vector re-warm —
> `docs/specs/registry-hot-apply-review.md` §2 D5/A-P2-4). U-H5 (teardown
> primitives), U-H4 (hot-remove), U-H6 (hot-rename) are LANDED and this unit
> CONSUMES their primitives/home (`drainAndReleaseEntry` + the `rag-store-remove.ts`
> pattern + the U-H5 vector-boot `teardown()`). Execution order proceeding:
> U-H4 (LANDED) → U-H6 (LANDED) → **U-H7 (this — default reassignment, NEXT)** →
> U-H8 (operator-UI editor). Execution order in the gate: **…**U-H6 → **U-H7** →
> U-H8. **The §7 design questions below MUST be arbitrated CONFIRMED by the
> Architect before the TestWriter derives the red set** — this unit carries the
> slice's most open design debt; do not hand-wave it.

- **Status: SPEC (PROPOSED — the §7 rulings are the gate; NOT YET arbitrated,
  NOT YET red/green).** The registry hot-apply/removal/rename slice, Unit U-H7 of
  8 — the ability to REASSIGN which store is the default at runtime (hot-set-default),
  making the currently STABLE default re-bindable (D1 → "Default-bound consts stay
  until U-H5/D5" ⇒ U-H7 is when the default becomes re-bindable), INCLUDING the
  default's rename (folds into U-H7 per D4) and the vector re-warm (the default
  store owns the at-most-ONE vector boot controller per A6/R10). Gate reference:
  `docs/specs/registry-hot-apply-review.md` §2 **D1** (the "Default-bound consts
  stay until U-H5/**D5**" note — U-H7 is when the default becomes re-bindable),
  **D4** ("the DEFAULT's rename folds into **D5**" — U-H7), **D5** (default
  reassignment — SPLIT OUT, highest-risk: teardown + accessor-backed IPC + vector
  re-warm; lands as its own unit after U-H5), **D6** (operator-UI IPC only; NO new
  MCP tool, NO new IPC channel in the mechanism units — U-H7 exposes the controller
  mechanism, U-H8 wires the operator IPC), **D7** (mid-flight consistency —
  `stores:"all"` resolves a current snapshot atomically), **D8** (unit decomposition
  — execution order … U-H4 → U-H6 → **U-H7** → U-H8); §5 "Impact on existing
  contracts" (**A-P2-1** — every already-rewired closure reads
  `runtime.getDefaultStore()/getDefaultEngine()/getDefaultName()/getVectorBoot()/
  getDirectory()` per call, so a default change made in the runtime is reflected by
  every already-rewired closure automatically), **A-P2-2** (`stores:"all"` —
  drain-then-teardown so a removed/reassigned engine is never mid-query),
  **A-P2-4** ("U-H7 split off: teardown + accessor IPC + rebuild", per D5),
  **A-P2-8** (the `teardown()` primitives landed in U-H5 — U-H7 CALLS them);
  §6 (live-scenario PARKED). Consumed dependencies: `docs/specs/unit-h5-teardown.md`
  §4/§5 (the `VectorBootController.teardown()` — BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD —
  + `RetrievalEngine.inFlight()` + the byte-pinned torn-down messages + the
  F-H5-3 never-settling awareness), `docs/specs/unit-h4-hot-remove.md` §5.2–§5.8 + §7
  (the LANDED `rag-store-remove.ts` homolog + the F-H4-1 drain-gate TOCTOU re-entry
  + the F-H4-2 default-drift orphan-leak contract **inherited as contract** for the
  old-default engine teardown), `docs/specs/unit-h6-hot-rename.md` (§5.8 the
  D5-negative pin — `hotRename` of the default is OUT of U-H6's scope and FOLDS into
  U-H7), `docs/specs/unit-h2-runtime-controller.md` §4 (**DEFAULT-STABLE-APPLY**,
  **MUTABLE-LIVE-DIRECTORY**, **ATOMIC-APPLY**, **DEFAULT-STABLE-APPLY**, the N1/
  A-P2-8 negative pin; **U-H2 §3a HOST-LOW-1** — the drift-path accessor desync this
  unit's re-bind addresses), §5.2/§5.4 (the `RagStoreRuntimeController` + the
  `defaultEntry`/`vectorBoot` closures), `docs/specs/unit-f-embeddings.md` §5.12/§5.13
  (the `VectorBootController` — `start()` SINGLE-SHOT, W1 BOOT MODEL B, the W4/W5
  content-addressed cache + `provident-vector-cache.json` + `createVectorCache`),
  `docs/specs/unit-ms2-store-wiring.md` §5.4 (`buildRagStoreDirectory` — the at-most-ONE
  vector boot `createVectorBootController(store, provider, { embedBatchFn, cache }`)).

- **Scope:** the controller/ORCHESTRATION-level default-reassignment MECHANISM — a
  NEW async runtime-controller method **`hotSetDefault(name): Promise<HotSetDefaultResult>`**
  that REASSIGNS which store is the default at runtime, WITHOUT a restart: it
  (1) validates `name` (present, non-default; a no-op if it IS the current default;
  a string arg guard), (2) runs a registry WRITE that flips `default:true` between
  the two stores (+ persist + reload — D2; the write module owns this via a NEW
  `setDefault` mutation kind + `setDefaultRegistryStore` convenience, §5.1/§7 Q6),
  (3) **RE-BINDS the runtime's internal default** (`directory.defaultName`,
  `_defaultEntry`/`getDefaultStore()`/`getDefaultEngine()`, `getVectorBoot()`) so
  EVERY already-rewired closure (U-H2b, A-P2-1) reflects the new default per call,
  (4) in vector mode **tears down the OLD default's vector boot controller**
  (construct-new-before-teardown-old — `releaseDefaultVectorBoot` in a NEW
  `src/main/rag-store-default.ts` module so `rag-store-runtime.ts` keeps its
  N1/A-P2-8 "no `teardown(`" grep pin) and **re-warms the NEW default's vector boot**
  (a fresh `createVectorBootController` born-lexical-pending, cache-inclusive W4/W5
  content-addressed reuse), and (5) returns `{ loaded, delta, drained, noop }`.
  It does NOT add an MCP tool (D6), does NOT add an IPC channel (D6 — the operator
  IPC trigger + confirmation is **U-H8**), does NOT re-author the `stores:"all"`
  fan-out (UNTOUCHED, same as U-H4/U-H5/U-H6), and does NOT change any page design
  (the operator-UI editor is U-H8). **This unit lands the CONTROLLER mechanism;
  U-H8 owns the operator-UI trigger + confirmation + the accessor-backed IPC that
  reads the current default.**

- **TestWriter contract:** every method/signature, return shape, throw pattern,
  happy-path state, and fail-state below is derivable from this spec ALONE (after
  the §7 ruling). The TestWriter writes the U-H7 red set into the SpecWriter-pinned
  file `tests/unit-h7-default-reassign.test.ts` (§5.9) in the house red-first order
  (RCA-1), reporting the failing set BEFORE any implementation. **The red-set
  expectation (§5.9): the NEW orchestration surface does NOT EXIST on the pre-U-H7
  code — `rag-store-default.ts` is absent (the `import` fails at load — the house
  red pattern, mirror of U-H4's §5.9(i)); `RagStoreRuntimeController` has NO
  `hotSetDefault` (`typeof controller.hotSetDefault === 'undefined'`); the write
  module has NO `setDefault` mutation kind + no `setDefaultRegistryStore`; and the
  accessors are NOT re-bindable (`getDefaultName()`/`getDefaultEntry()`/
  `getDefaultStore()`/`getDefaultEngine()`/`getVectorBoot()` return the BOOT default
  objects unchanged — a default flip is impossible on the pre-U-H7 controller).**

---

## 1. What the unit does (the U-H7 slice)

The registry hot-apply slice (review §2 D5) requires that an operator be able to
REASSIGN which store is the default at runtime WITHOUT a restart. Today (post-U-H2)
the default is STABLE — the default store/engine/vector-boot object identities are
carried across every reachable `hotApply`/`hotRemove`/`hotRename`, and renaming the
default is REJECTED (`W-rename-default`, U-H1/U-H2/U-H6). U-H7 makes the default
re-bindable and is the gate's HIGHEST-RISK unit because it combines three hard
concerns the mechanism units deliberately avoided: (a) the default's runtime RE-BIND
(a change that every already-rewired closure must reflect per call, A-P2-1), (b) the
teardown of the ONE default-owned vector boot controller + re-warm of the new default's,
and (c) the fold-in of the default's rename (D4). The unit's concrete obligations:

1. **A real runtime default reassignment (D5/A-P2-4):** reassigning the default to
   an existing non-default store MUST (a) run a registry WRITE that flips `default:true`
   between the two entries + persists + re-loads (D2 — persisted-and-live never
   diverge; the write owns the disk), (b) RE-BIND the runtime's internal default
   (`directory.defaultName`, the `defaultEntry`/`vectorBoot` closures behind
   `getDefaultName()`/`getDefaultEntry()`/`getDefaultStore()`/`getDefaultEngine()`/
   `getVectorBoot()`) so every already-rewired closure reads the NEW default per call
   (A-P2-1/U-H2b), (c) in vector mode TEAR DOWN the OLD default's vector boot
   controller (the at-most-ONE boot, A6/R10) and RE-WARM the NEW default's vector
   boot (born-lexical-pending + background `start()`, cache-inclusive W4/W5
   content-addressed reuse), and (d) leave the OLD default's STORE + FILE retained as
   an ordinary NON-default entry (never torn down — only the VECTOR boot controller is
   torn down, §7 Q4).
2. **The DEFAULT's rename folds in (D4):** assigning the default covers BOTH (a)
   `hotSetDefault('b')` making an existing `b` the default, AND (b) renaming the
   CURRENT default (its name changes but stays default). U-H7 reconciles the current
   `W-rename-default` rejection (the legacy `hotApply`/`hotRename` DEFAULT paths KEEP
   rejecting — U-H2 F9/HOST-2 + U-H6 F4 pins stay green) by providing a SANCTIONED
   default-rename via a NEW write-module path (§7 Q3) — NOT by relaxing the legacy
   rename guard.
3. **A vector re-warm that avoids a DARK default (D7/D5):** the order is
   CONSTRUCT-NEW-BEFORE-TEAR-DOWN-OLD — the new default's born-lexical-pending engine
   is live BEFORE the old boot's engine is torn down, so there is NO instant at which
   the default is unserved. The old default's vector engine is DRAINED
   (`inFlight()===0`, A-P2-2/D7) before the boot teardown. The new boot's background
   build is fired fire-and-forget with a silent `.catch` (the boot logs its own
   build-failed milestone — the runtime's 0-console census holds); a build failure
   leaves the new default serving LEXICALLY-pending (never demotes, never fails the
   reassignment loudly — the boot-time W1 F1 parity).
4. **D6/A-P2-4 — mechanism only, no operator surface:** U-H7 exposes the CONTROLLER/
   ORCHESTRATION-level default reassignment (node-testable), with NO MCP tool and NO
   IPC channel. The operator IPC trigger + confirmation + the accessor-backed IPC that
   READS the current default (already `runtime.getDefaultName()` + the U-MS5 listing's
   `currentStores()`/`statusOf`) are **U-H8's** row.
5. **Non-destructive reassignment (D3/D4/D5):** U-H7 NEVER deletes/touches the OLD
   default store's persistence file + journal (D3 — teardown never deletes) and NEVER
   deletes/flushes the persisted vector-CACHE file (D3/U-H5 §7 Q2 — the cache is
   handed off to the NEW default's boot via content-address reuse). The OLD default's
   store is retained as a live NON-default entry (its vector-boot engine replaced with
   a fresh lexical engine), NOT removed. `statusOf(oldDefault)` still resolves.
6. **Bounded/never-settling awareness (F-H5-3):** U-H5's F-H5-3 note + U-H4's
   drain-gate awareness apply: the OLD default's vector engine drain is a genuine
   UNBOUNDED `inFlight()===0` await (A-P2-2, §7 Q10), and the store teardown hang
   concern does not apply because the OLD default's STORE is never torn down (only the
   boot controller is).

This unit does NOT own: the operator-UI trigger + confirmation dialog + the IPC
channel (U-H8), the operator-UI editor's IPC that invokes `hotSetDefault` (U-H8), a
teardown-aware INCREMENTAL add (U-H3 is confirmatory/EMPTY), a change to the legacy
`W-rename-default` path (U-H7 provides a SEPARATE default-rename seam; the legacy
paths keep rejecting), or a change to the `stores:"all"` fan-out (UNTOUCHED).

## 2. Feasibility verdict

**Feasible — grounded entirely in the LANDED contracts (the U-H2 runtime's mutable
live directory + the U-H1 write module + the U-H5 teardown primitives + the U-H4/
U-H6 drain-then-teardown home) plus the existing vector-boot/cache constructors; the
only NEW module is a small U-H7 orchestration helper. No engine gap.**

- **The default's runtime re-bind is a pure closure re-point.** The controller's
  `getDefaultName()` already reads `directory.defaultName` (line 466) and its
  `getDefaultEntry()`/`getDefaultStore()`/`getDefaultEngine()`/`getVectorBoot()`
  read the captured `defaultEntry`/`vectorBoot` closures (lines 464–469). Converting
  those two closures from `const` to `let` and re-pointing them (plus
  `directory.defaultName`) is exactly what every LANDED U-H2b closure reads per call
  (`runtime.getDefaultStore()`, `runtime.getDefaultEngine()`, `runtime.getDefaultName()`,
  `runtime.getVectorBoot()`, `runtime.getDirectory()` — `docs/specs/unit-h2-runtime-controller.md`
  §5.8 B1–B13/M1–M4), so the re-bind propagates to every already-rewired closure with
  ZERO additional rewiring (A-P2-1). This is the load-bearing A-P2-1/U-H2b property U-H7
  exploits and re-pins. **It also closes U-H2's HOST-LOW-1** (the drifted-default path
  where `defaultEntry` desynced from `directory.defaultName`) on the U-H7 path — re-bind
  is the mechanism that keeps the direct accessors synchronized with the directory.
- **The default flip write is a pure config mutation the write module can own.** Flipping
  `default:true` off the old default onto `name` leaves the candidate with EXACTLY-ONE
  default (the loader's Pass-C rule, `rag-store-registry.ts:309-314`), so the candidate
  re-validates cleanly through `resolveRegistry`. The write module's atomic
  temp→fsync→rename + re-load (`writeRegistryMutation`) is the D2-guaranteed owner; U-H7
  only needs a new mutation kind to EXPRESS the flip (§7 Q6).
- **The vector teardown + re-warm is constructible from LANDED primitives.** The OLD
  default's boot teardown is the LANDED `VectorBootController.teardown()`
  (BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD — NO-FAIL, never deletes the cache file); the
  NEW default's boot is the SAME `createVectorBootController(store, provider, {
  embedBatchFn, cache: createVectorCache({ path }) })` the boot wiring uses
  (`rag-store-directory.ts:236-239`) — the runtime already holds the warmed `_provider`
  and `_userDataPath` (lines 220–222, currently stored-for-later). The re-warm is the
  W1 BOOT MODEL B pattern (born-lexical pending → background build → promote) re-run at
  runtime on the NEW default's store, cache-inclusive (W4/W5 content-address reuse —
  the SAME `provident-vector-cache.json`).
- **The non-destructive retention is simpler than a drain-teardown.** The OLD default's
  STORE is never torn down (only its vector-boot controller is), so the
  drain-then-teardown-store concern (F-H5-3) does not apply to it; the only drain is the
  OLD default's VECTOR ENGINE (`boot.engine.inFlight()===0`, A-P2-2), re-entered before
  the boot teardown (F-H4-1 toctou), mirroring `rag-store-remove.ts` `drainAndReleaseEntry`
  (which the task explicitly flags is NOT directly reusable because it ALSO tears the
  store — U-H7 needs a boot-only drain variant, §7 Q4).

No engine gap — every change is host-side (`src/`), additive to LANDED contracts,
node-testable.

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The NEW orchestration module `src/main/rag-store-default.ts` (the boot-only teardown + the NEW-default boot construction — the ONLY `teardown(`/`createVectorBootController(`/`createVectorCache(` call sites U-H7 adds outside `rag-store-remove.ts`) | Project-specific (composes the U-H5 boot teardown + the U-MS2 vector-boot construction + the W4 cache) | Low cost; gives the default-change a single node-testable home WITHOUT polluting `rag-store-runtime.ts`'s N1-grep-clean surface (mirrors the U-H4 `rag-store-remove.ts` pattern). |
| The NEW async controller method `hotSetDefault(name)` in `rag-store-runtime.ts` + the re-bind (const→let closures) | Project-specific (reuses the write module's `setDefault` kind + the helper; adds the async re-bind + vector orchestration) | Medium cost (the highest-risk method of the slice); makes the default re-bindable + the vector teardown/re-warm a real caller of the U-H5 boot teardown. |
| The write-module extension — the `setDefault` mutation kind + `setDefaultRegistryStore` + `RegistryDelta.defaultChanged` | Project-specific (a NEW additive kind to `src/main/rag-store-registry-write.ts`, U-H1's file — the U-H1 test suite gains additive rows, NOT re-pinned) | Medium cost (a byte-pinned-surface amendment); the D2-atomic home for the default flip + the default-rename (§7 Q6). The alternative — a non-mutation write path owned by U-H7 — keeps U-H1 byte-pinned but duplicates the load→mutate→persist→reload orchestration. |
| The default-rename fold-in (D4) — the sanctioned path | Project-specific (a NEW write kind `renameDefault` or the setDefault-composed rename; NOT a relaxation of the legacy `W-rename-default`) | Low-medium cost; reconciles the D4 fold without re-pinning U-H2 F9/HOST-2 or U-H6 F4 (§7 Q3). |
| The old-default's vector-boot engine drain + teardown | Project-specific (boot-only, unlike `drainAndReleaseEntry` which also tears the store) | The A-P2-2/D7 guarantee for the reassigned default's engine; UNBOUNDED (never torn down mid-query). |
| The NEW-default's superseded lexical engine (the non-default lexical engine the new boot replaces) | Project-specific (orphaned without teardown — consistent with U-H2's non-default orphan/hold) | A bounded resource hold (a lexical engine + index) — consistent with every U-H2/U-H4/U-H6 successor. §7 Q11. |
| The old-default's vector CACHE (in-memory debounce tail on teardown) | Project-specific (the cache FILE is handed off; the in-memory debounced tail may be lost — F-W4-6 quit-tail parity) | A few-seconds content-loss bound on the OLD default's last embeds; the FILE + the content-addressed reuse means the NEW default re-reads the shared cache. §7 Q7. |
| The HOST-LOW-1 drift-path accessor desync | Project-specific (U-H2's F15/F16 drift `syncLiveToLoaded(loaded,true)` does NOT re-bind `defaultEntry`) | U-H7 re-binds on the NEW `hotSetDefault` path; the drift path's re-bind is a SEPARATE follow-on (recorded, §5.11). |

No engine gap — the changes are entirely host-side (`src/`), node-testable, and
consume only LANDED contracts (U-H2 runtime + U-H5 boot teardown + U-H4/U-H6
drain-then-teardown home + the U-H1 write module + the U-MS2 vector-boot construction +
the W4/W5 cache).

### 3a. Adversarial findings (pre-registered — the U-H7 adversarial pass RUNS after the green, per RCA-3; placeholder + pre-registered probes)

The RCA-3 read-only adversarial pass on the U-H7 green runs BEFORE the unit is reported
done; host findings (ids `F-H7-*`) are fixed here + regression-tested; an engine
(provident-ssr) finding, should one ever surface, is a `docs/defects.md` +
`docs/HANDOFF.md` item, NEVER a package patch (AGENTS.md item 7). **Pre-registered edge
probes (the adversarial pass MUST confirm on the landed code):**

- A `hotSetDefault` reassignment in vector mode NEVER leaves an instant at which the
  default is unserved (the construct-new-before-teardown-old order): at every await
  boundary there is a LIVE engine bound to the current default (either the new boot's
  born-lexical-pending engine, or, before the re-bind, the old default's engine).
- The OLD default's VECTOR engine is never torn down mid-query (`boot.engine.inFlight()>0`
  gates the boot teardown — A-P2-2; a query entered during the store-less build/setup
  yield is re-checked via the F-H4-1 re-entry).
- A second `hotSetDefault` of the SAME name AFTER a successful first is a NO-OP (name is
  now the default — step-2 no-op); it does NOT re-flip, does NOT write, does NOT teardown.
- `hotSetDefault('<unknown>')` FAILS LOUD with the write module's **W-set-default-unknown**
  BEFORE any teardown; live + disk untouched.
- The OLD default's store persistence file + journal are BYTE-IDENTICAL after `hotSetDefault`
  (D3 — never torn down); `statusOf(oldDefaultName)` STILL RESOLVES (the store is retained
  as a non-default lexical entry); `getDefaultName()` = the new name; `getDefaultName()`'s
  store/engine/vboot are the NEW default's objects.
- After a vector re-warm, `runtime.getVectorBoot()` returns the NEW boot controller (a
  DIFFERENT object identity from the old), and the OLD boot's engine's `query()` throws
  `retrieval engine: torn down` while `runtime.getDefaultEngine()` (the new boot's engine)
  still resolves.
- The runtime module `rag-store-runtime.ts` shows NO `\b(teardown|close|destroy)\s*\(`
  lexical match (N1) and NO `\b(unlink|rm|rmdir|remove)\s*\(` (N2) — the teardown calls are
  all in `rag-store-default.ts` (and the reused `rag-store-remove.ts`), and NO
  `console.*` in the runtime (0-log census — the new boot's `.catch` is a silent
  `() => undefined`).
- **NO U-H7 change adds an MCP tool / IPC channel / `stores:"all"` fan-out edit /
  page-design change** (D6/A-P2-4/§5.8/§5.11).

### 3b. Proposal-review findings folded in

From `docs/specs/registry-hot-apply-review.md`:
- **D5 (binding):** default reassignment SPLIT OUT (highest-risk: teardown + accessor-backed
  IPC + vector re-warm); lands as its own unit after U-H5. Pinned §1/§4/§5.
- **A-P2-4 (bound):** "U-H7 split off: teardown + accessor IPC + rebuild", per D5. Pinned §1/§4.
- **D4 (binding):** rename semantics — restricted to NON-default stores with no persisted
  `<name>:`-prefixed ids; id-migration is a SEPARATE unit; **the DEFAULT's rename folds into
  D5 (U-H7)**. Pinned §1/§4/§5.8.
- **D1 (binding):** "Default-bound consts stay until U-H5/D5" ⇒ U-H7 is when the default
  becomes re-bindable. Pinned §4 (the re-bind).
- **D6 (bound):** operator-UI IPC only, NO new MCP tool, NO new IPC channel in the mechanism
  units; U-H7 exposes the controller mechanism + U-H8 wires the operator IPC. Pinned §5.8.
- **A-P2-1 (bound):** all const-captured default closures + server options read runtime
  accessors per call — a default change made in the runtime reflects in every already-rewired
  closure automatically. Pinned §4/§5.4.
- **A-P2-2 (bound):** `stores:"all"` resolves a current snapshot atomically; drain-then-teardown
  so a removed/reassigned engine is never mid-query. Pinned §4/§5.4 (the old-default engine drain).
- **A-P2-8 (bound):** the `teardown()` primitives landed in U-H5 with NO caller; U-H4 (remove) +
  U-H6 (rename) + U-H7 (default reassignment) are the callers. The runtime module keeps its
  N1/A-P2-8 grep pin (§7 Q1).
- **D7 (bound):** mid-flight consistency — add atomic / remove drain-then-teardown / rename
  reject-at-resolution; `stores:"all"` current-snapshot atomically. U-H7's construct-new-before-
  teardown-old is the default-change analogue. Pinned §4.
- **D8 (bound):** unit decomposition — execution order … U-H4 → U-H6 → **U-H7** → U-H8.

## 4. Design decisions pinned by this spec

> **§7 note:** all decisions below are PROVISIONALLY resolved; §7 Q1–Q11 must be arbitrated
> CONFIRMED before the TestWriter derives the red set. The genuine either/or items are Q1 (the
> controller surface), Q3 (the default-rename reconciliation), Q4 (store retained vs torn down
> on default-change), Q6 (write-module scope), Q7 (cache handoff/flush). Q2/Q5/Q8–Q11 confirm
> the recommended reading.

- **DEFAULT-REASSIGNMENT-METHOD (new — §7 Q1, resolve to `hotSetDefault(name)`, ADDITIVE,
  ASYNC):** the runtime controller gains **`hotSetDefault(name: string): Promise<HotSetDefaultResult>`**.
  It REUSES the U-H1 write module's NEW `setDefault` mutation kind (via `writeRegistryMutation`)
  for the atomic flip + persist + re-load (D2), then re-binds the runtime's internal default and
  (in vector mode) tears down the OLD default's vector boot + re-warms the NEW default's vector
  boot. The method is ASYNC (it awaits the OLD default's vector-engine drain + boot teardown in
  vector mode); in lexical mode it still returns a resolved Promise (uniform). `hotApply`/
  `hotRemove`/`hotRename` are UNCHANGED. The name `hotSetDefault` is chosen over
  `hotReassignDefault` for symmetry with the `hotApply`/`hotRemove`/`hotRename` verb family and
  the loader's `default:true` field (§7 Q1).
- **DEFAULT-REBIND (new — the load-bearing A-P2-1 seam):** U-H7 makes the default RE-BINDABLE:
  the runtime's `defaultEntry` and `vectorBoot` closures (currently `const`, captured at
  construction) become `let`, and after a successful `hotSetDefault` they are RE-POINTED (plus
  `directory.defaultName = loaded.defaultStoreName` and `_currentRegistry = loaded`). Because
  every U-H2b closure reads `runtime.getDefaultEntry()`/`getDefaultStore()`/`getDefaultEngine()`/
  `getVectorBoot()`/`getDefaultName()`/`getDirectory()` PER CALL, the re-bind propagates to every
  already-rewired closure with ZERO additional rewiring (A-P2-1). This also satisfies the gate's
  D1 note ("default-bound consts stay until U-H5/D5" ⇒ the consts become re-bindable in U-H7) and
  closes U-H2's HOST-LOW-1 on this path (the accessors can no longer desync from
  `directory.defaultName` after a U-H7 re-bind).
- **SET-DEFAULT-WRITE-KIND (new — §7 Q6, resolve to a NEW mutation kind + named convenience in
  the U-H1 write module):** `src/main/rag-store-registry-write.ts` gains
  `{ kind: 'setDefault'; name: string }` + the pure convenience
  `setDefaultRegistryStore(parsed, registryDir, name, reservedPath?)`, handled by
  `applyRegistryMutation` (validate existing → build the candidate with `default` flipped off the
  current default onto `name` → validate the candidate → return `{ registry, configs, delta }`),
  consumed by `writeRegistryMutation` (the atomic persist + re-load, D2). `RegistryDelta` gains a
  REQUIRED `defaultChanged: string[]` member (`[name]` for setDefault, `[]` otherwise) — the
  "exactly ONE non-empty member per op" pin is preserved (a setDefault delta has exactly
  `defaultChanged` non-empty). The alternative (a U-H7-owned non-mutation write path that
  keeps U-H1 byte-pinned but duplicates the load→mutate→persist→reload) is REJECTED — the write
  module is the designated D2 disk owner.
- **DEFAULT-RENAME-FOLD (new — §7 Q3, resolve to a SEPARATE sanctioned write kind, NOT a
  relaxation of the legacy `W-rename-default`):** the DEFAULT's rename (its name changes but
  stays default) is SANCTIONED via a NEW write-module mutation `{ kind: 'renameDefault'; to:
  string }` + `renameDefaultRegistryStore` convenience (§7 Q3, option R1), handled by
  `applyRegistryMutation` (validate existing → rename the current DEFAULT entry preserving its
  `default:true` → validate the candidate → delta with `renamed:[{from,to}]` + the default
  PRESERVED). The legacy `W-rename-default` guard (`applyRegistryMutation` rename branch) is
  UNCHANGED — `hotApply({kind:'rename'})`/`hotRename` of the default KEEP propagating
  **W-rename-default** (U-H2 F9/HOST-2 + U-H6 F4 stay green) — and the U-H7 sanctioned
  default-rename is surfaced on the controller as **`hotRenameDefault(to)`** (or folded into the
  `hotSetDefault`-family, per §7 Q3) so the operator can rename the default while keeping it
  default. The default's name change preserves the OTHER pinned fields (persistenceFile —
  re-derived under the new name if omitted; corpusRoot) verbatim.
- **DEFAULT-CHANGE-KEEPS-STORE (new — §7 Q4, resolve to RETAIN the OLD default's store, ONLY the
  vector boot is torn down):** on a default reassignment, the OLD default's STORE is NEVER torn
  down and its persistence file + journal STRAND byte-identical (D3). In LEXICAL mode, both the
  old and new defaults are already lexical — the reassignment re-binds `defaultName`/`defaultEntry`
  and retains BOTH entries' engines unchanged (no teardown). In VECTOR mode, ONLY the OLD default's
  `VectorBootController` is torn down (via `releaseDefaultVectorBoot` — a boot-only drain + `boot.
  teardown()`, NOT `drainAndReleaseEntry` which would also tear the STORE); the OLD default's entry
  `.engine` is replaced IN PLACE with a FRESH lexical engine built on its retained store
  (`createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))`), so the
  OLD default becomes an ordinary non-default lexical entry (`statusOf`/`currentStores` still list it).
- **VECTOR-REWARM-CONSTRUCT-FIRST (new — the atomic order, D7/D5, §7 Q2):** the vector re-warm is
  ordered CONSTRUCT-NEW-BEFORE-TEAR-DOWN-OLD so there is NO dark default: (1) CONSTRUCT the NEW
  default's `createVectorBootController(store, provider, { embedBatchFn, cache })` (born-lexical-
  pending) BEFORE the write — a construct throw leaves disk + live untouched, at the cost of an
  orphaned born-lexical engine (bounded hold); (2) write the `setDefault` flip (D2); (3) apply —
  replace the NEW default's entry `.engine` with the new boot's engine (live), replace the OLD
  default's entry `.engine` with a fresh lexical engine (live), RE-BIND `defaultName`/`defaultEntry`/
  `vectorBoot` (so new queries route to the new default — no dark period); (4) TEAR DOWN the OLD
  default's boot LAST (its engine is drained to `inFlight()===0` first, A-P2-2); (5) START the new
  boot's background build fire-and-forget with a SILENT `.catch(() => undefined)` (the boot logs
  its own build-failed milestone — the runtime 0-console census holds).
- **VECTOR-REWARM-FAILSAFE-LEXICAL-PENDING (new — §7 Q2):** the new boot's background `start()`
  build is fire-and-forget; a build FAILURE (the F1 class) leaves the new default serving
  LEXICALLY-pending (born-lexical) and is LOGGED by the boot (`vector boot: build failed (staying
  pending)`), NEVER failing the `hotSetDefault` loudly and NEVER demoting a promoted engine — the
  boot-time W1 F1 parity at runtime. There is NO runtime re-run of the warm-up probe (class 2):
  U-H7 REUSES the already-warmed `_provider` (a real warm-up only happens ONCE at boot; the model
  is loaded), so the only vector failure mode at reassignment is the F1 background-build failure
  (stays lexical-pending). §5.7 F-H7-vector-buildfail.
- **OLD-DEFAULT-CACHE-HANDOFF (new — §7 Q7, resolve to REUSE the shared file, NO explicit flush,
  NO delete):** the vector CACHE FILE is `provident-vector-cache.json` (GLOBAL, content-addressed,
  not per-store); the NEW default's boot constructs `createVectorCache({ path: join(userDataPath,
  'provident-vector-cache.json') })` — reading the SAME file, so the W4/W5 content-addressed cache
  is REUSED (the new default's corpus adopts cached vectors for unchanged content, no HTTP call).
  The OLD boot's teardown NEVER deletes/flushes the cache file (U-H5/D3); the OLD boot's in-memory
  debounce tail (a few seconds of `CACHE_WRITE_DEBOUNCE_MS=500` unflushed entries at teardown) may
  be LOST — F-W4-6 quit-tail parity, a bounded content bound (§7 Q7). The alternative — exposing
  the cache on the `VectorBootController` and flushing before teardown — adds a controller-interface
  member; deferred unless the Architect rules it required.
- **HOT-SET-DEFAULT-NOOP (new — §7 Q8):** `hotSetDefault(name)` where `name === getDefaultName()`
  is a NO-OP — it returns `{ loaded: currentRegistry, delta:{added:[],removed:[],renamed:[],defaultChanged:[]}, drained: 0, noop: true }` with NO write, NO teardown, NO live mutation. An UNKNOWN `name` FAILS LOUD (the write module's **W-set-default-unknown**) BEFORE any teardown.
- **UNREGISTER-EVERYWHERE (new, the re-bind guarantee):** after `hotSetDefault`, EVERY runtime
  accessor reflects the NEW default: `getDefaultName()` = the new name, `getDefaultEntry()`/
  `getDefaultStore()`/`getDefaultEngine()` = the NEW default's entry/store/engine
  (in vector mode the engine is the new boot's born-lexical-pending engine), `getVectorBoot()` = the
  new boot (or stays null in lexical mode), `getDirectory().defaultName` = the new name,
  `currentStores()` (= `_currentRegistry.stores`, advanced to the fresh `loaded`) lists both stores
  with the NEW default's `default:true`, `statusOf(oldDefault)` still resolves (the store is retained
  as a non-default), `statusOf(newDefault)` resolves. The OLD default's object is still reachable via
  `getDirectory().entries.get(oldDefaultName)` (a retained non-default lexical entry).
- **ATOMIC-APPLY-DEFAULT (new — D7):** `hotSetDefault` ORDER is pinned: (1) arg guard; (2) NO-OP
  check (`name === current default`); (3) CONSTRUCT the new default's vector boot FIRST (vector
  mode only) — a throw leaves disk + live untouched; (4) `writeRegistryMutation({ path, mutation:
  { kind: 'setDefault', name } })` — the ONLY disk touch, a throw leaves disk + live untouched; (5)
  defensive drift check (`loaded.defaultStoreName === name` else sync-to-loaded + R-default-changed,
  D2-preserving); (6) apply the live-map in-place mutations + re-bind (`defaultName`/`defaultEntry`/
  `vectorBoot`/`_currentRegistry`); (7) in vector mode TEAR DOWN the OLD boot (drained, last) + START
  the new boot (fire-and-forget); (8) return `{ loaded, delta, drained, noop: false }`. There is NO
  instant at which the default is unserved.
- **RUNTIME-STAYS-GREP-CLEAN (new — N1/A-P2-8 preserved by design):** the teardown CALL SITES live
  ONLY in `src/main/rag-store-default.ts` (new, U-H7) + the reused `src/main/rag-store-remove.ts`;
  `rag-store-runtime.ts` references only the identifiers `releaseDefaultVectorBoot(` and
  `createDefaultVectorBoot(` (NEITHER contains a lowercase `teardown`), so the U-H2/U-H5 N1/A-P2-8
  GREP regex `/\b(teardown|close|destroy)\s*\(/` STILL does NOT match `rag-store-runtime.ts` (the
  pin STAYS GREEN with NO re-pin — §7 Q2). `rag-store-default.ts` imports NO `unlink`/`rm`/`rmdir`/
  `remove` (D3) and emits NO `console.*`.
- **Consumed decision rows (implemented by U-H2/U-H4/U-H6/U-H5 or inherited, cite-only):**
  **RUNTIME-CONTROLLER** + **MUTABLE-LIVE-DIRECTORY** + **DEFAULT-STABLE-APPLY** +
  **REBUILD-ALL-OF-NON-DEFAULT** + **ATOMIC-APPLY** (U-H2 — the live Map + the atomic write U-H7
  reuses), **TEARDOWN-ASYNC** + **STORE-TEARDOWN-REVOKES-MUTATION-ONLY** +
  **ENGINE-TEARDOWN-STOP-SERVING** + **BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD** + **NO-FAIL** +
  **DRAIN-SEAM-INFLIGHT** (U-H5 — the boot teardown + the old-default engine drain U-H7 consumes),
  **HOT-REMOVE-DRAIN-THEN-TEARDOWN** + **REUSE `rag-store-remove.ts`** (U-H4 — the drain-home /
  F-H4-1 TOCTOU pattern U-H7 mirrors for the old-default engine), **HOT-RENAME-DRAIN-THEN-TEARDOWN**
  (U-H6 — the `W-rename-default` negative pin U-H7 does NOT relax), **W1 BOOT MODEL B** + **W4/W5
  cache** (`docs/specs/unit-f-embeddings.md` §5.12/§5.13 — the vector boot + the content-addressed
  cache U-H7 re-warms/reuses), **REGISTRY-ATOMIC-WRITE**/WRITE-module rows (the D2 disk owner the
  `setDefault`/`renameDefault` kinds extend).

## 5. The exhaustive contract

### 5.1 The write-module extension (`src/main/rag-store-registry-write.ts` — U-H7's addition to U-H1's file)

> **§7 Q6.** U-H7 ADDS two mutation kinds + two named conveniences + one `RegistryDelta` member to
> the U-H1 write module. This is an ADDITIVE byte-pinned-surface amendment — the U-H1 suite gains
> additive rows, NONE re-pinned (the existing add/remove/rename behavior is unchanged).

```ts
// src/main/rag-store-registry-write.ts — Unit U-H7 additions (ON TOP of the U-H1 shape).

export type RegistryMutation =
  | { kind: 'add'; store: RagStoreConfig }
  | { kind: 'remove'; name: string }
  | { kind: 'rename'; from: string; to: string }
  | { kind: 'setDefault'; name: string }       // U-H7 — flip default:true onto `name`
  | { kind: 'renameDefault'; to: string }      // U-H7 — rename the CURRENT default, default preserved

/** U-H7 — gains a 4th member. `add`/`remove`/`rename` deltas set it `[]`;
 *  a `setDefault` delta sets `defaultChanged: [name]`; a `renameDefault` delta
 *  sets `renamed: [{from,to}]` AND `defaultChanged: [to]`. The "exactly ONE
 *  non-empty member per op" pin holds for every op. */
export interface RegistryDelta {
  added: string[]
  removed: string[]
  renamed: { from: string; to: string }[]
  defaultChanged: string[]   // U-H7 — [name] iff the default was reassigned
}

/** U-H7 — PURE named convenience over `applyRegistryMutation` for the default flip. */
export function setDefaultRegistryStore(
  parsed: unknown,
  registryDir: string,
  name: string,
  reservedPath?: string,
): RegistryMutationResult   // `delta.defaultChanged === [name]`

/** U-H7 — PURE named convenience over `applyRegistryMutation` for the default's rename. */
export function renameDefaultRegistryStore(
  parsed: unknown,
  registryDir: string,
  to: string,
  reservedPath?: string,
): RegistryMutationResult   // `delta.renamed === [{from, to}]` AND `delta.defaultChanged === [to]`
```

`applyRegistryMutation` handles the two new kinds:

- **`kind === 'setDefault'`:** `name = String(mutation.name)`; if `!currentNames.includes(name)` →
  throw **W-set-default-unknown** `rag-store-registry-write: cannot set unknown store '<name>' as default`
  (`<name>` renders a string VERBATIM, the write-module's single-quote interpolation convention);
  if `name === existing.defaultStoreName` → throw **W-set-default-nop**
  `rag-store-registry-write: store '<name>' is already the default` (a defensive no-op the runtime
  pre-checks, §4 HOT-SET-DEFAULT-NOOP); `candidate = currentConfigs.map(c => ({ ...c, default:
  c.name === name }))`; `delta = { added: [], removed: [], renamed: [], defaultChanged: [name] }`.
  Validate the candidate (the loader's exactly-one-default Pass-C re-validates cleanly).
- **`kind === 'renameDefault'`:** `to = String(mutation.to)`; `from = existing.defaultStoreName`;
  if `currentNames.includes(to)` → throw **W-rename-target-exists** (reused); if `to === from` →
  throw **W-rename-target-exists** (the default's rename to its own name is not a rename);
  `candidate = currentConfigs.map(c => (c.name === from ? { ...c, name: to, default: true } : c))`
  (the default's `default:true` is PRESERVED — it stays default under the new name); `delta =
  { added: [], removed: [], renamed: [{ from, to }], defaultChanged: [to] }`. Validate the candidate.
  This is the SANCTIONED default-rename — the LEGACY `rename` branch's `W-rename-default` guard is
  UNCHANGED (§4 DEFAULT-RENAME-FOLD).

The new `RegistryDelta.defaultChanged` member is REQUIRED on every delta returned by
`applyRegistryMutation` (set to `[]` for add/remove/rename), so `writeRegistryMutation` returns the
uniform 4-member delta on every path.

### 5.2 The new orchestration module (`src/main/rag-store-default.ts` — exact TS)

```ts
// src/main/rag-store-default.ts — Unit U-H7: the default-change orchestration home.
// (docs/specs/unit-h7-default-reassign.md §5.2; consumed: docs/specs/unit-h5-teardown.md §4/§5 —
// BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD + DRAIN-SEAM-INFLIGHT; unit-f-embeddings.md §5.12/§5.13 —
// the W1 boot + W4/W5 cache; review §2 D5/A-P2-4/A-P2-8. The ONLY module that lexically calls
// `teardown(`/`createVectorBootController(`/`createVectorCache(` for a default CHANGE — the runtime
// module references only `releaseDefaultVectorBoot(`/`createDefaultVectorBoot(` (identifiers with no
// lowercase `teardown`), preserving the N1/A-P2-8 grep pins.
//
// D3 — NEVER deletes: imports NO `unlink`/`rm`/`rmdir`/`remove`; the boot teardown leaves the
// persisted vector-cache file + every store file byte-identical. D6/A-P2-4 — no Electron, no IPC,
// no MCP. ZERO console output (errors are thrown / hangs are surfaced, never logged).

import type { RagStore } from './rag-store.js'
import type { EmbeddingProvider } from './embeddings.js'
import type { VectorBootController } from './vector-boot.js'
import { createVectorBootController } from './vector-boot.js'
import { createVectorCache } from './vector-cache.js'
import { join } from 'node:path'

/** U-H7 — construct the NEW default's vector boot controller (W1 BOOT MODEL B, born-lexical-pending).
 *  NOT started (the runtime fires the background build). Builds the byte-equal cache path
 *  `provident-vector-cache.json` under `userDataPath` — the SAME content-addressed cache file the
 *  OLD boot used, so W4/W5 reuse the warmed cache for unchanged content. A construct throw PROPAGATES
 *  (the caller has NOT written the registry yet — disk + live untouched). */
export function createDefaultVectorBoot(
  store: RagStore,
  provider: EmbeddingProvider,
  userDataPath: string,
): VectorBootController

/** U-H7 — DRAIN-THEN-TEARDOWN the OLD default's vector boot controller (A-P2-2/D7):
 *  1) UNBOUNDED drain — await `boot.engine.inFlight() === 0` (the old default's vector engine is
 *     never torn down while a query is mid-flight — the re-bind already routed NEW queries to the
 *     new default; in-flight-old queries settle here).
 *  2) F-H4-1 re-entry — re-await `boot.engine.inFlight() === 0` immediately before the teardown
 *     (a query entered during any prior await yield is never left in flight when the sync STOPPED
 *     marking runs — inherited from the U-H4 drain pattern).
 *  3) `await boot.teardown()` — U-H5 BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD: mark STOPPED, reject
 *     an in-flight build, forward the engine teardown, resolve `undefined`. NO-FAIL.
 *  4) Resolve `{ drained: 0 }`. NEVER deletes/flushes the persisted cache file (D3/U-H5 §7 Q2). */
export async function releaseDefaultVectorBoot(
  boot: VectorBootController,
): Promise<{ drained: number }>
```

The `createDefaultVectorBoot` body mirrors the U-MS2 boot wiring byte-identically:
`createVectorBootController(store, provider, { embedBatchFn: provider.embedBatch, cache:
createVectorCache({ path: join(userDataPath, 'provident-vector-cache.json') }) })` (compare
`rag-store-directory.ts:236-239`). It is SYNCHRONOUS (the controller is born-lexical-pending at
construction); the background build is started by the runtime (`newBoot.start().catch(...)`).

### 5.3 The runtime controller surface changes (exact TS shapes)

U-H7 ADDS one method + one result type to the U-H5/U-H4/U-H6 controller interface
(`src/main/rag-store-runtime.ts`); it does NOT change `hotApply`/`HotApplyResult`, `hotRemove`/
`HotRemoveResult`, or `hotRename`/`HotRenameResult`, or the existing 12 members. It re-binds the
`defaultEntry`/`vectorBoot` closures (const→let).

```ts
// src/main/rag-store-runtime.ts — Unit U-H7 additions (ON TOP of the U-H2/U-H4/U-H6 shapes).
// U-H7 imports the helper: `import { createDefaultVectorBoot, releaseDefaultVectorBoot } from
// './rag-store-default.js'` — NEITHER identifier contains a lowercase `teardown`, so the N1/
// A-P2-8 grep pin stays green (§4/§5.8).

export interface RagStoreRuntimeController {
  // ... (all EXISTING U-H2 + U-H4 + U-H6 members unchanged: getDirectory, getDefaultEntry,
  //      getDefaultName, getDefaultStore, getDefaultEngine, getVectorBoot, getRegistryPath,
  //      currentStores, statusOf, hotApply, hotRemove, hotRename) ...

  /** U-H7 — REASSIGN the default at runtime (D5/A-P2-4): flip `default:true` onto the named
   *  existing non-default store (via the write module's `setDefault` kind — the atomic D2 write),
   *  RE-BIND the runtime's internal default (`getDefaultName`/`getDefaultEntry`/`getDefaultStore`/
   *  `getDefaultEngine`/`getVectorBoot`) so every already-rewired closure reflects the new default
   *  per call (A-P2-1), and in vector mode tear down the OLD default's vector boot + re-warm the
   *  NEW default's (construct-new-before-teardown-old; no dark default). A no-op when `name` is
   *  already the default. ASYNC — the operator-facing default reassignment seam U-H8 calls. Throws
   *  propagate (W-set-default-arg / W-set-default-unknown / W-set-default-nop / the write/loader/
   *  fs sets); live + disk untouched on a throw. */
  hotSetDefault(name: string): Promise<HotSetDefaultResult>
}

/** The successful default-reassignment result. `delta.defaultChanged` is exactly `[name]`; `drained`
 *  is the settled in-flight query count on the OLD default's vector engine at teardown — ALWAYS 0
 *  (the A-P2-2 drain never tears down mid-query). `noop` is TRUE iff `name` was already the default
 *  (no write, no teardown, no live mutation). */
export interface HotSetDefaultResult {
  /** The FRESH `loaded` registry just written + re-read by the U-H2 write path (for a no-op, the
   *  current registry). */
  loaded: LoadedRagStoreRegistry
  /** `{ added: [], removed: [], renamed: [], defaultChanged: [name] }` (all-empty for a no-op). */
  delta: RegistryDelta
  /** The settled in-flight query count on the OLD default's vector engine at teardown — 0 (the
   *  drain guarantee; always 0 in lexical mode). */
  drained: number
  /** TRUE iff `name` was already the default (no-op — no write, no teardown). */
  noop: boolean
}
```

### 5.4 `hotSetDefault` — exact behavior (pinned)

`hotSetDefault(name)` on the runtime controller:

1. **Top-of-method arg guard:** `if (typeof name !== 'string' || name.length === 0) throw R-set-default-arg`
   (locally-thrown, byte-pinned, `rag-store-runtime: default store name required` — a whitespace-only
   `name` is a NON-EMPTY string, passes the guard, and routes to the write module's
   **W-set-default-unknown** for the literal whitespace name, consistent with the module-wide
   unknown-non-empty-string contract).
2. **NO-OP guard:** `if (name === directory.defaultName) return { loaded: currentRegistry,
   delta: { added: [], removed: [], renamed: [], defaultChanged: [] }, drained: 0, noop: true }` —
   NO write, NO teardown, NO live mutation (§4 HOT-SET-DEFAULT-NOOP).
3. **Capture the old/new default entries:** `const oldDefaultEntry = directory.entries.get
   (directory.defaultName)`, `const newDefaultEntry = directory.entries.get(name)`. (`newDefaultEntry`
   is guaranteed present on the U-H7 path because the write validation would otherwise fail; a
   defensive `undefined` here falls through to the write module's W-set-default-unknown.)
4. **Vector construct-first** (only when `_embedderKind === 'vector'` AND `_provider !== null`):
   `const newBoot = createDefaultVectorBoot(newDefaultEntry.store, _provider, _userDataPath)` — a
   born-lexical-pending boot, NOT started. A construct throw PROPAGATES and leaves disk + live
   untouched (an orphaned born-lexical engine — a bounded hold; §4 VECTOR-REWARM-CONSTRUCT-FIRST).
5. **Write (the ONLY disk touch — D2):** `const { loaded, delta } = writeRegistryMutation({ path:
   registryPath, mutation: { kind: 'setDefault', name } })`. Any throw (W-set-default-unknown /
   W-set-default-nop / the loader-F-set / the native-fs set) PROPAGATES and the live directory is
   UNTOUCHED (the write module's atomicity).
6. **Defensive drift check:** if `loaded.defaultStoreName !== name` (reachable only through an
   EXTERNAL mid-run registry default edit the re-read picks up — the write module itself guarantees
   `defaultStoreName === name` for a setDefault), SYNCHRONIZE the live directory to the freshly-loaded
   `loaded` (rebuild-all, the F15/F16 `syncLiveToLoaded` HOST-1 path) BEFORE throwing the byte-pinned
   **R-default-changed** — D2 preserved even in the throw path (§4 ATOMIC-APPLY-DEFAULT).
7. **Apply + re-bind (no dark default):**
   - In VECTOR mode: (a) replace `newDefaultEntry.engine = newBoot.engine` (the new default now serves
     via the new boot's born-lexical-pending engine — NOT promoted yet, lexical-served as pending);
     (b) build a FRESH LEXICAL engine for the OLD default's RETAINED store —
     `oldDefaultEntry.engine = createRetrieval(oldDefaultEntry.store, createLexicalEmbedder(createLexicalIndex(oldDefaultEntry.store.listNodes())))`
     (the store is NEVER torn down; the old boot's engine reference in the entry is replaced by the
     fresh lexical engine).
   - RE-BIND (both modes): `directory.defaultName = loaded.defaultStoreName`;
     `defaultEntry = newDefaultEntry`; `vectorBoot = vectorNewBoot ?? null` (in lexical mode
     `vectorBoot` stays null — there was never a boot); `currentRegistry = loaded`.
     Every `getDefault*()`/`getVectorBoot()` closure now reads the NEW default (A-P2-1).
8. **Vector teardown-old LAST + start-new:** in VECTOR mode, `const { drained } = await
   releaseDefaultVectorBoot(oldVectorBoot)` (UNBOUNDED drain the old default's vector engine to 0 +
   re-entry + `boot.teardown()` — the at-most-ONE old boot is released; §5.2), and `void
   newBoot.start().catch(() => undefined)` (the background build begins; a failure is logged by the
   boot itself — the runtime emits NO console, the 0-log census holds; the new default serves
   lexically-pending until promotion). In LEXICAL mode, no teardown and no start (there is no boot).
9. **Return** `{ loaded, delta, drained, noop: false }` — `delta.defaultChanged === [name]`;
   `currentStores()` now lists both stores with the NEW default flagged; `statusOf(oldDefaultName)`
   still resolves (the retained non-default lexical entry).

**A-P2-1 propagation guarantee (pinned):** because every U-H2b closure reads the runtime accessors
PER CALL, the single re-bind in step 7 propagates the new default to every already-registered MCP
handler + IPC closure with ZERO additional rewiring — the load-bearing property U-H7 re-pins.

### 5.5 The byte-pinned error set + the message census

U-H7 introduces a NEW byte-pinned message family (runtime + write). The runtime's OWN R-set-default
messages:

| # | Trigger | Exact `Error` message |
| --- | --- | --- |
| R-set-default-arg | `hotSetDefault` with a null/non-string/`''` `name` | `rag-store-runtime: default store name required` |
| R-set-default-through-hot-apply | `hotApply` called with a `{ kind: 'setDefault' }` mutation (defensive — `hotApply` is default-stable; its input type narrows to exclude setDefault) | `rag-store-runtime: default reassignment must use hotSetDefault` |
| R-default-changed | `loaded.defaultStoreName !== name` after the write (defensive; external edit) | `rag-store-runtime: default store changed by a hot-apply (default reassignment is a separate unit)` — the live directory is SYNCHRONIZED to `loaded` BEFORE the throw (HOST-1/D2) |

The write module's new W-set-default-* family (PROPAGATED from `applyRegistryMutation` /
`setDefaultRegistryStore`):

| # | Trigger | Exact `Error` message |
| --- | --- | --- |
| W-set-default-arg | `setDefaultRegistryStore` / `renameDefaultRegistryStore` with a null/non-string/`''` name/to (the `requireName` guard) | `rag-store-registry-write: name required` / `rag-store-registry-write: to required` |
| W-set-default-unknown | `setDefault`/`hotSetDefault` target not present | `rag-store-registry-write: cannot set unknown store '<name>' as default` |
| W-set-default-nop | `setDefault` target is ALREADY the default (defensive — the runtime pre-checks) | `rag-store-registry-write: store '<name>' is already the default` |

Existing propagated sets reuse their LANDED messages: **R-default-changed** (runtime, already pinned
by U-H2), **W-rename-target-exists** (reused by `renameDefault`), the loader **F-set**, the native
**fs set**.

**Census (U-H7 additions):**
- New modules/files created (in `src/`): **1** — `src/main/rag-store-default.ts`.
- New controller members: **1** — `hotSetDefault(name): Promise<HotSetDefaultResult>`; 1 new result
  type `HotSetDefaultResult`; the controller goes from **12 to 13** members. A NEW possible
  `hotRenameDefault(to)` (or the fold-in, per §7 Q3) would make it 14.
- New write-module surface: **2** mutation kinds (`setDefault`, `renameDefault`), **2** named
  conveniences (`setDefaultRegistryStore`, `renameDefaultRegistryStore`), **1** new `RegistryDelta`
  member (`defaultChanged: string[]`).
- New `teardown(` call sites: **+1** (`boot.teardown()` inside `releaseDefaultVectorBoot` in
  `rag-store-default.ts`) + the reused `rag-store-remove.ts`'s LANDED 4 (UNCHANGED); **ZERO** in
  `rag-store-runtime.ts` (the N1 pin). New `createVectorBootController(`/`createVectorCache(`
  call sites: **+1 / +1**, both in `rag-store-default.ts`.
- New byte-pinned message templates: **5** (R-set-default-arg, R-set-default-through-hot-apply,
  W-set-default-arg, W-set-default-unknown, W-set-default-nop) — plus the REUSED R-default-changed /
  W-rename-target-exists.
- New MCP tools / IPC channels / `stores:"all"` fan-out changes: **0** (D6/A-P2-4/§5.8).
- New `console.*` lines: **0** (the runtime's 0-log census holds — the new boot's `.catch` is
  silent; the boot logs its own milestones; `rag-store-default.ts` emits none).

### 5.6 U-H7 happy-path states (TestWriter red set — valid paths)

`<d>` is an absolute temp dir; a controller is constructed over a boot directory from a 2-store
registry (`main` default + `research-2026-09` non-default), each on a derived persistence file, per
the U-H4/U-H6 fixture. Vector tests construct with `embedderKind:'vector'` + a mock/non-null
`provider` double; lexical tests with `embedderKind:'lexical'` + `null` provider.

1. **H1 — set-default to a present, IDLE non-default (LEXICAL mode) → re-bound + non-destructive:**
   `await hotSetDefault('research-2026-09')` → resolves
   `{ loaded, delta:{added:[],removed:[],renamed:[],defaultChanged:['research-2026-09']}, drained:0, noop:false }`;
   `getDefaultName()` = `'research-2026-09'`; `getDirectory().defaultName` =
   `'research-2026-09'`; `getDefaultStore()`/`getDefaultEngine()` are the NEW default's objects;
   `getVectorBoot()` = the boot `vectorBoot` (null in lexical mode); `getDefaultStore()` no longer
   returns the `main` store; `getDirectory().entries.get('main')` is STILL PRESENT (retained
   non-default — `statusOf('main')` resolves), its persistence file + journal are **BYTE-IDENTICAL**
   (D3 — never torn down); `currentStores()` lists both with `research-2026-09` `default:true`
   (advanced to `loaded`); a fresh `loadRagStoreRegistry` shows `research-2026-09` default (D2
   persisted==live). The OLD default's entry retains its lexical engine (no teardown in lexical mode).
2. **H2 — set-default is re-bindable (A-P2-1 / re-bind):** after H1, `getDefaultEngine()` matches
   the NEW default's entry; a query through the runtime's default engine serves the NEW default's
   data; the OLD default (now non-default) is still reachable via
   `getDirectory().entries.get('main')`. This is the re-bind the gate's D1 note demands.
3. **H3 — set-default to the CURRENT default is a NO-OP:** `await hotSetDefault('main')` (the
   current default) → resolves `{ loaded, delta:{added:[],removed:[],renamed:[],defaultChanged:[]}, drained:0, noop:true }`;
   NO write (the registry file is **BYTE-IDENTICAL**), NO teardown, NO live mutation —
   `getDefaultName()` still `'main'`, the default objects unchanged.
4. **H4 — set-default in VECTOR mode re-warms the new default + tears down the old default's
   vector boot, store retained (A-P2-4/D5):** from a vector-mode controller (boot `main` owns the
   at-most-ONE boot), `await hotSetDefault('research-2026-09')` → resolves `{ ..., drained:0,
   noop:false }`; `getVectorBoot()` returns a NEW boot controller (a DIFFERENT object identity from
   the old); `getDefaultEngine()` = the new boot's engine (born-lexical-pending, serves lexically
   until the background `start()` promotes); the OLD boot's engine (captured) `query()` throws
   `retrieval engine: torn down` (the at-most-ONE old boot was torn down LAST — after the re-bind,
   so no dark default); `getDirectory().entries.get('main')` is STILL PRESENT with a FRESH LEXICAL
   engine (the store RETAINED, file byte-identical); the persisted vector-CACHE file
   `provident-vector-cache.json` is **BYTE-IDENTICAL** (never deleted/flushed by the boot teardown —
   D3) and the NEW boot's `createVectorCache` re-reads the SAME file (content-addressed reuse).
5. **H5 — the re-warmed new-default boot builds in the background (W1 parity):** after H4, the new
   boot's `start()` (fired by `hotSetDefault`) runs the background build; the new default serves
   LEXICALLY-pending during the build; on a successful build it PROMOTES (a promoted engine serves
   vector); the promotion report is observed via the boot's `start()` promise (or its logged
   milestone); NO `console.*` is emitted by the RUNTIME (the boot logs its own).
6. **H6 — the write is re-readable (D2):** after `hotSetDefault`, a fresh `loadRagStoreRegistry`
   shows `research-2026-09` with `default:true` (and `main` non-default), `implicit:false`/
   `corrupt:false` — persisted == live.
7. **H7 — the OLD default is a retained non-default lexical entry (D3/D4):** after H1/H4,
   `statusOf('main')` resolves; `getDirectory().entries.get('main')` has a lexical engine (vector
   mode) / the same lexical engine (lexical mode); a FRESH store over the retained `main`
   persistence file still loads the same nodes (the file is stranded intact, never deleted).
8. **H8 — the default's RENAME keeps it default (D4 fold):** `await hotSetDefault`-family /
   `hotRenameDefault('main-new')` (per §7 Q3) → `getDefaultName()` = `'main-new'`, the store is STILL
   `default:true` (it stayed the default), `delta.renamed === [{from:'main', to:'main-new'}]` + `delta.
   defaultChanged === ['main-new']`; the write module's legacy `W-rename-default` STILL rejects a
   plain `hotRename('main','x')` (§5.7).

### 5.7 U-H7 fail-states (TestWriter red set — documented fail-states)

Outcomes: **fail-loud** = the pinned `Error`; **live-untouched** = `getDirectory().entries`
deep-equal to before + the registry file byte-identical + NO teardown ran (the write/construct threw
before the apply/teardown).

| # | Trigger | Outcome | Exact result |
| --- | --- | --- | --- |
| F1 | `hotSetDefault(null)` / `hotSetDefault(5)` / `hotSetDefault('')` | fail-loud | **R-set-default-arg** `rag-store-runtime: default store name required`; live-untouched; NO teardown |
| F2 | `hotSetDefault('nope')` (unknown) | fail-loud | the write module's **W-set-default-unknown** `rag-store-registry-write: cannot set unknown store 'nope' as default` PROPAGATES; live-untouched; NO teardown |
| F3 | `hotSetDefault('main')` where `main` IS the current default | no-op (NOT a fail) | returns `{ ..., noop: true }` — NO write, NO teardown; the registry file byte-identical |
| F4 | `hotSetDefault` whose persist hits a native fs failure (ENOSPC/EACCES/EROFS) | fail-loud | the native fs Error PROPAGATES; live-untouched; the ORIGINAL file intact; NO teardown |
| F5 | the NEW default's vector boot CONSTRUCTION throws (vector mode — a provider/config/construct failure) | fail-loud; disk + live untouched | the construct Error PROPAGATES (before the write — construct-first); an orphaned born-lexical engine is a bounded hold; NO write, NO teardown |
| F6 | `hotApply({ kind: 'setDefault', name })` (the default-stable seam given a setDefault) | fail-loud | **R-set-default-through-hot-apply** `rag-store-runtime: default reassignment must use hotSetDefault`; live-untouched (hotApply stays default-stable) |
| F7 | the defensive drift — `loaded.defaultStoreName !== name` after the write (external edit) | fail-loud, D2-preserving | **R-default-changed**; the live directory is SYNCHRONIZED to `loaded` BEFORE the throw (HOST-1) |
| F8 | the OLD default's vector engine has an in-flight query at teardown (A-P2-2) | does NOT settle until the query settles | `releaseDefaultVectorBoot`'s UNBOUNDED drain awaits `boot.engine.inFlight()===0`; the engine is NEVER torn down mid-query (a never-settling query HANGS — §7 Q10) |
| F9 | the default's RENAME through the LEGACY path | fail-loud (UNCHANGED) | `hotApply({kind:'rename', from:'main'})` / `hotRename('main','x')` PROpagates **W-rename-default** — the default's rename only succeeds via the U-H7 sanctioned `renameDefault`/`hotRenameDefault` path (U-H2 F9/HOST-2 + U-H6 F4 stay green) |
| F-H7-vector-buildfail | the NEW default's background `start()` build FAILS (vector mode, F1 class) | FAIL-SAFE — the reassignment SUCCEEDS, the new default serves LEXICALLY-pending | the boot logs `vector boot: build failed (staying pending)` (its OWN milestone — runtime emits NO console); `hotSetDefault` already resolved; the new default is never demoted (born-lexical-pending); NOT a loud failure of the reassignment (§4 VECTOR-REWARM-FAILSAFE-LEXICAL-PENDING). Whether a post-hoc retry seam is needed is a follow-on. |
| F-hang | a NEVER-settling query/queue on the OLD default's vector engine (F-H5-3 awareness) | does NOT settle | the UNBOUNDED drain blocks (A-P2-2 correctness); §7 Q10 |

### 5.8 Negative pins (D6 / D8 / A-P2-4 / A-P2-8 / D3 / D4 / D5 + the N1 re-pin status)

- **A-P2-8 / N1 (the runtime module — STAYS GREEN, NOT RELAXED):** the LANDED U-H2 **N1**
  (`expect(src).not.toMatch(/\b(teardown|close|destroy)\s*\(/)` on `rag-store-runtime.ts`) and the
  U-H5 A-P2-8 block **REMAIN GREEN and are NOT re-pinned.** U-H7 keeps the teardown CALLS physically in
  `src/main/rag-store-default.ts` (+ the reused `rag-store-remove.ts`); the runtime references only
  `releaseDefaultVectorBoot(`/`createDefaultVectorBoot(` — identifiers with NO lowercase `teardown`.
  **HARD REQUIREMENT on the Implementer (a TestWriter adversarial probe WILL check the raw source):**
  no comment, docstring, or identifier in `rag-store-runtime.ts` may contain the literal `teardown(`.
- **N2 (the runtime module — STAYS GREEN):** `rag-store-runtime.ts` keeps its no-MCP/no-IPC
  (`\bMUTATING_METHODS\b`/`\bALL_TOOLS\b`/`\bRpcMethod\b`/`\bIPC_[A-Z_]+\b`), no-delete
  (`\b(unlink|rm|rmdir|remove)\s*\(`), and 0-console pins. `rag-store-default.ts` carries the SAME
  no-delete / no-IPC / no-MCP negative pins.
- **D6 / A-P2-4 — no MCP tool, no IPC channel:** U-H7 adds NO tool name to `ALL_TOOLS` (stays 41),
  NO `RpcMethod`/`MUTATING_METHODS` member, NO IPC constant. The operator-facing trigger +
  confirmation dialog + the accessor-backed IPC that reads the current default are **U-H8**.
- **D3 — teardown NEVER deletes / the OLD default's store + the cache STRAND:** the OLD default's
  STORE is never torn down (its persistence file + journal are byte-identical — the retained
  non-default); the vector-CACHE file is never deleted/flushed by the boot teardown (D3/U-H5 §7 Q2).
  `rag-store-default.ts` imports NO `unlink`/`rm`/`rmdir`/`truncate`.
- **D4 / A-P2-5 — no id rewrite:** `hotSetDefault` and the default-rename NEVER rewrite a persisted
  `<name>:`-prefixed id. A rename whose `from` store carries persisted ids is DECLINED (R-rename-
  ids-present, inherited through the write module's rename validation) — no id migration (a SEPARATE
  unit).
- **D5 — the default's rename folds into U-H7, NOT relaxed in the legacy path:** U-H7 does NOT
  relax `W-rename-default`; the legacy `hotApply`/`hotRename` DEFAULT paths KEEP rejecting (the U-H2
  F9/HOST-2 + the U-H6 F4 pins survive). The SANCTIONED default-rename is the NEW write kind +
  controller seam. `hotSetDefault` NEVER touches the OLD default's STORE (retained) and NEVER the
  legacy `W-rename-default` branch.
- **D8 — boot reads ONCE:** `hotSetDefault` invokes the write path exactly per call (the controlled
  re-read); the boot loader + the idle runtime read nothing new. The stored persistence files are
  NEVER re-read/re-applied (stranded, D3).
- **`stores:"all"` fan-out — UNCHANGED:** the `mcp-server.ts` fan-out is NOT touched by U-H7 (same as
  U-H4/U-H5/U-H6). A-P2-2's fan-out snapshot/drain is out of U-H7's single-default scope.

### 5.9 Unit → file → test-file mapping + the red-set expectation

| Unit | File | Test file | Red-set expectation (RCA-1) |
| --- | --- | --- | --- |
| **U-H7** (this spec) | NEW `src/main/rag-store-default.ts` (the boot-only teardown `releaseDefaultVectorBoot` + `createDefaultVectorBoot`) + `src/main/rag-store-runtime.ts` (ADD `hotSetDefault`: Promise + `HotSetDefaultResult` + the const→let re-bind + the helper imports) + `src/main/rag-store-registry-write.ts` (ADD the `setDefault`/`renameDefault` kinds + the `setDefaultRegistryStore`/`renameDefaultRegistryStore` conveniences + `RegistryDelta.defaultChanged`) | `tests/unit-h7-default-reassign.test.ts` (SpecWriter-pinned; the §5.4/§5.6 H1–H8 + §5.7 F1–F9 + §5.8 N-pin red set) | RED — the U-H7 orchestration does NOT EXIST on the pre-U-H7 code: (i) the `rag-store-default.ts` import FAILS (module absent → the suite's `import { createDefaultVectorBoot, releaseDefaultVectorBoot }` throws before any test body — the house red pattern, mirror of U-H4's §5.9(i)); (ii) `RagStoreRuntimeController` has NO `hotSetDefault` (`typeof controller.hotSetDefault === 'undefined'` — the P0 red marker); (iii) the write module has NO `setDefaultRegistryStore`/`renameDefaultRegistryStore` (`typeof ... === 'undefined'`) and NO `RegistryDelta.defaultChanged` member; (iv) the runtime accessors are NOT re-bindable — `getDefaultName()/getDefaultStore()/getDefaultEngine()/getVectorBoot()` return the BOOT default objects unchanged, so every H1–H8 body that asserts the re-bound default FAILS (a default flip is impossible on the pre-U-H7 controller). The suite LOAD-fails on the missing helper module + the method-absence marker + the failing behavior bodies. |

- **Existing tests that STAY GREEN:** the full U-H2 suite (`tests/unit-h2-runtime-controller.test.ts`
  — H1–H12/F1–F18/N1/N2 + the HOST-1/2/3 + the U-H2b B1–B13/M1–M4 + D6a/D6b/D8/A-P2-8 pins), the
  U-H5 suite (`tests/unit-h5-teardown.test.ts` incl. its A-P2-8 runtime grep), the U-H4 suite
  (`tests/unit-h4-hot-remove.test.ts`), the U-H6 suite (`tests/unit-h6-hot-rename.test.ts` — incl. the
  F4 `W-rename-default` pin that U-H7 does NOT relax), the write module suite
  (`tests/unit-h1-registry-write.test.ts` — U-H7 ADDS `setDefault`/`renameDefault` rows; the existing
  add/remove/rename assertions are UNCHANGED), and the vector-boot/cache suites
  (`tests/vector-boot.test.ts`, `tests/vector-cache.test.ts`, `tests/live-embed-cache.test.ts`). U-H7
  does NOT change `hotApply`, the legacy `rename` branch, `main.ts`, `mcp-server.ts`,
  `rag-store-remove.ts`, `rag-store.ts`, `retrieval.ts`, or `vector-boot.ts` (each additive —
  `rag-store-default.ts` constructs boots via the EXISTING `createVectorBootController`), so their
  pins cannot regress. **The `rag-store-runtime.ts` N1/A-P2-8 grep pin STAYS GREEN BY DESIGN (§5.8) —
  no U-H2/U-H4/U-H5/U-H6 test is re-pinned or relaxed.**
- **Per RCA-2/RCA-5:** U-H7 runs its own TestWriter-red → Implementer-green → adversarial →
  blind-greens → doc-review cycle; the trio (`npm test` / `npm run typecheck` / `npm run build`) runs
  after the green. The §7 ruling is the gate BEFORE the TestWriter derives the red set. The
  live-scenario battery stays PARKED (§6).
- **Page design:** U-H7 is NOT a page-design change (the operator-UI editor + confirmation dialog is
  U-H8; the settings-pane listing is U-MS5's surface, and its `runtime.getDefaultName()` +
  `currentStores()`/`statusOf` reads are already LANDED). The designing-pages skill and its
  test-use-case coverage matrix + demo-page index are UNCHANGED by U-H7.

### 5.10 Census / numeric claims

- **New modules/files this unit creates (in `src/`):** **1** — `src/main/rag-store-default.ts`
  (+ the SpecWriter-pinned `tests/unit-h7-default-reassign.test.ts`).
- **Files EDITED:** **3** — `src/main/rag-store-runtime.ts` (adds `hotSetDefault` + `HotSetDefaultResult`
  + the const→let re-bind + the two helper imports; does NOT change `hotApply`/`hotRemove`/`hotRename`),
  `src/main/rag-store-registry-write.ts` (adds the two kinds + two conveniences + `RegistryDelta.defaultChanged`),
  and `tests/unit-h1-registry-write.test.ts` (ADDS the `setDefault`/`renameDefault` rows; NONE re-pinned).
  **NO edits** to `rag-store-remove.ts`/`rag-store.ts`/`retrieval.ts`/`vector-boot.ts`/`vector-cache.ts`/
  `adjacency.ts`/`rag-store-registry.ts`/`rag-store-directory.ts`/`main.ts`/`mcp-server.ts`/`preload.ts`/
  `shared/types.ts`/`security.ts`/`sidebar-panes.ts`.
- **New exports/methods:** `RagStoreRuntimeController.hotSetDefault(name): Promise<HotSetDefaultResult>`
  (1 method) + `HotSetDefaultResult` (1 type) in `rag-store-runtime.ts`; `releaseDefaultVectorBoot(boot):
  Promise<{drained:number}>` + `createDefaultVectorBoot(store, provider, userDataPath): VectorBootController`
  (2 factory-free functions) in `rag-store-default.ts`; `setDefaultRegistryStore` + `renameDefaultRegistryStore`
  (2 named conveniences) + the `'setDefault'`/`'renameDefault'` kinds + `RegistryDelta.defaultChanged` (1
  member) in `rag-store-registry-write.ts`. Controller member count: **12 → 13** (14 if `hotRenameDefault`
  is added per §7 Q3).
- **New `teardown(` call sites:** **+1 total** (`boot.teardown()` in `rag-store-default.ts`); the reused
  `rag-store-remove.ts`'s LANDED 4 are UNCHANGED; **ZERO** in `rag-store-runtime.ts` (the N1 pin).
- **New byte-pinned message templates:** **5** (R-set-default-arg, R-set-default-through-hot-apply,
  W-set-default-arg, W-set-default-unknown, W-set-default-nop) + the REUSED R-default-changed /
  W-rename-target-exists.
- **New MCP tools / IPC channels / `stores:"all"` fan-out edits / teardown calls in the runtime:**
  **0** (D6/A-P2-4/N1/§5.8).
- **New `console.*` lines:** **0** (the runtime's 0-log census holds; the new boot's `.catch(() =>
  undefined)` is silent; the boot logs its own milestones).
- **Runtime re-builds per `hotSetDefault`:** ZERO store re-construction (both default entries RETAIN
  their store objects); in vector mode the NEW default's entry `.engine` is replaced by the new boot's
  engine (born-lexical) and the OLD default's entry `.engine` by a fresh lexical engine (2 engine
  constructions max for the swapped-default pair); other non-default entries are RETAINED.
- **Disk writes per successful `hotSetDefault`:** exactly ONE registry write (the `setDefault` flip,
  U-H1's temp→fsync→rename) + the re-load read; ZERO writes to any store persistence file/journal; ZERO
  file deletions; the vector-CACHE file is only ever written by the cache's own debounce (the NEW boot's
  build may write it — non-destructive content-address reuse).
- **No page-design change** ⇒ `docs/skills/designing-pages.md` is UNCHANGED by U-H7.

### 5.11 Cross-references

- **Gate:** `docs/specs/registry-hot-apply-review.md` §2 **D1** (the default becomes re-bindable in
  U-H7), **D4** (the DEFAULT's rename folds into D5/U-H7), **D5** (default reassignment SPLIT OUT,
  highest-risk), **D6** (operator-UI IPC only — U-H7 mechanism, U-H8 IPC), **D7** (mid-flight
  consistency), **D8** (execution order … U-H4 → U-H6 → U-H7 → U-H8); §5 (A-P2-1, A-P2-2, A-P2-4,
  A-P2-8); §6 (live-scenario PARKED).
- **Consumed — the U-H5 teardown primitives:** `docs/specs/unit-h5-teardown.md` §4
  (**BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD** — the `VectorBootController.teardown()` U-H7 calls via
  `releaseDefaultVectorBoot`, **DRAIN-SEAM-INFLIGHT** — `RetrievalEngine.inFlight()`, **NO-FAIL**,
  **TEARDOWN-ASYNC**), §5.4–5.7 (the `vector boot: torn down` / `retrieval engine: torn down` messages,
  the F8 mid-query-teardown-is-a-caller-error row, the F-H5-3 never-settling awareness), §7 Q2 (the
  cache-release/flush handoff on default-reassignment is DECIDED by U-H7 — §7 Q7 of this spec);
  `src/main/vector-boot.ts` (the controller + `teardown()`), `src/main/retrieval.ts` (`inFlight()`).
- **Consumed — the U-H4/U-H6 drain-then-teardown home:** `docs/specs/unit-h4-hot-remove.md` §5.2–§5.8
  (the `drainAndReleaseEntry` pattern + the F-H4-1 TOCTOU re-entry + the F-H4-2 default-drift orphan-leak
  contract U-H7 mirrors for the OLD default's vector engine; the reuse-with-a-twist note — U-H7 uses a
  BOOT-only drain variant because `drainAndReleaseEntry` ALSO tears the store), §7;
  `docs/specs/unit-h6-hot-rename.md` §5.8 (the D5-negative pin — the DEFAULT rename folds into U-H7; the
  legacy `W-rename-default` path U-H7 does NOT relax), §7.
- **Consumed — the U-H2 runtime controller:** `docs/specs/unit-h2-runtime-controller.md` §4
  (**DEFAULT-STABLE-APPLY**, **MUTABLE-LIVE-DIRECTORY**, **ATOMIC-APPLY**, **NO-OP-BYTE-EQUAL**,
  **REBUILD-ALL-OF-NON-DEFAULT**), §5.2 (`RagStoreRuntimeController` + `HotApplyResult`), §5.4 (the
  write+swap + the F15/F16 drift `syncLiveToLoaded`), §5.7 (N1/N2 + the F9 `W-rename-default` pin +
  the F15/F16 drift throws), **§3a HOST-LOW-1** (the drift-path accessor desync U-H7's re-bind
  addresses/closes on the new path), §5.10 (census — the runtime methods 1–12), §7;
  `src/main/rag-store-runtime.ts` (the `defaultEntry`/`vectorBoot` closures + the stored-but-unused
  `_provider`/`_embedderKind`/`_userDataPath` U-H7 consumes).
- **Consumed — the write module (the extended D2 owner):** `docs/specs/unit-h1-registry-write.md` §5.3
  (`applyRegistryMutation`/`writeRegistryMutation`), §5.5 (the W-* message set + the exactly-one-non-empty
  delta pin U-H7 preserves), §5.3.2 (the D4 no-ids caller precondition); `src/main/rag-store-registry-write.ts`.
  **U-H7's §5.1 amendment**: the `setDefault`/`renameDefault` kinds + `setDefaultRegistryStore`/
  `renameDefaultRegistryStore` + `RegistryDelta.defaultChanged`.
- **Consumed — the vector boot + cache:** `docs/specs/unit-f-embeddings.md` §5.12 (the W1
  `VectorBootController` + BOOT MODEL B + `start()` SINGLE-SHOT + born-lexical-pending + promotion),
  §5.13 (the W4/W5 content-addressed `VectorCache` + `provident-vector-cache.json` + `createVectorCache`);
  `src/main/vector-boot.ts` (`createVectorBootController`), `src/main/vector-cache.ts` (`createVectorCache`,
  `CACHE_WRITE_DEBOUNCE_MS`).
- **Wiring anchors (the byte-equal vector-boot construction U-H7 re-uses):**
  `src/main/rag-store-directory.ts:236-239` (`createVectorBootController(store, provider,
  { embedBatchFn, cache: createVectorCache({ path: join(userDataPath, 'provident-vector-cache.json') }) })`),
  `src/main/main.ts:165-211` (the boot's warm-up + the runtime construction).
- **Sibling slice units (cite-only):** U-H1 (write), U-H2 (runtime + rewiring — the A-P2-1 closure
  layer U-H7's re-bind propagates through), U-H3 (hot-add, confirmatory EMPTY), U-H5 (teardown
  primitives), U-H4 (hot-remove), U-H6 (hot-rename — the default-rename negative), **U-H7 (this)**,
  U-H8 (the operator-UI editor — invokes `hotSetDefault` after the confirmation dialog + owns the
  accessor-backed IPC that reads `runtime.getDefaultName()`/`currentStores()`/`statusOf`; D6).
- **In-scope boundary vs U-H8:** U-H7 lands the CONTROLLER/mechanism-level default reassignment
  (`hotSetDefault` + the vector re-warm + the re-bind), node-testable, NO IPC/MCP. U-H8 lands the
  operator-facing trigger + confirmation dialog + the IPC channel that calls `hotSetDefault`.
- **`stores:"all"` fan-out (OUT):** the `mcp-server.ts` fan-out is UNCHANGED by U-H7 (same as
  U-H4/U-H5/U-H6).
- **Recorded follow-on (HOST-LOW-1):** U-H2's `syncLiveToLoaded(loaded, true)` drift path still rebinds
  `directory.defaultName` WITHOUT re-pointing `defaultEntry` — U-H7 re-binds on its OWN new path (so a
  `hotSetDefault` never desyncs), but the DRIFT path's accessor re-bind is a SEPARATE follow-on
  (recorded in `docs/pending.md` as a candidate for a later unit; NOT U-H7's job unless the Architect
  folds it in, §7 Q11).
- **Test file (SpecWriter-pinned):** `tests/unit-h7-default-reassign.test.ts`.
- **Decision rows:** U-H2's **RUNTIME-CONTROLLER**, **DEFAULT-STABLE-APPLY**, **ATOMIC-APPLY**,
  **DEFAULT-STABLE-APPLY**, **MUTABLE-LIVE-DIRECTORY**; U-H5's **BOOT-CONTROLLER-TEARDOWN-CANCELS-BUILD**,
  **DRAIN-SEAM-INFLIGHT**; U-H4's **HOT-REMOVE-DRAIN-THEN-TEARDOWN**; U-H6's **HOT-RENAME-DRAIN-THEN-TEARDOWN**.
  U-H7 records a NEW row (**DEFAULT-REASSIGNMENT-HOT-SET-DEFAULT** + the re-bind seam) on landing.

## 6. The live-scenario gate

**Live-scenario gate: PARKED (2026-09-08, per the user's instruction — the registry
hot-apply/removal/rename MCP/UI surface cannot be driven live because a live app session is
unavailable).** U-H7's live gate is PARKED accordingly: the default reassignment is node-testable in
`tests/unit-h7-default-reassign.test.ts` (no live app needed); a **live-pending battery**
(`tests/unit-h7-default-reassign-live-pending-battery.md`) SHOULD be authored in a LATER live-app
session, exercising a REAL operator-triggered default reassignment (via U-H8) that re-binds the
default + re-warms the vector boot end-to-end through the wired `main.ts` + a real Electron app. It is
NOT authored now (PARKED).

## 7. Design questions surfaced to the Architect (arbitrate BEFORE the TestWriter runs)

> The §7 convention (U-H4/U-H5/U-H6): the spec resolves PROVISIONALLY; the TestWriter derives the red
> set ONLY after the Architect rules CONFIRMED. **U-H7's genuine either/or items are Q1 (the controller
> surface), Q3 (the default-rename reconciliation), Q4 (store retained vs torn down), Q6 (write-module
> scope), Q7 (cache handoff/flush) — these need a positive ruling, not an "as-written" confirmation.**
> The rest confirm the recommended reading.

1. **The controller surface — `hotSetDefault(name)` vs `hotReassignDefault(name)`, ADDITIVE + ASYNC.
   (RESOLVED provisionally to `hotSetDefault`; needs a ruling.)**
   - The recommendation: `RagStoreRuntimeController.hotSetDefault(name: string): Promise<HotSetDefaultResult>`
     — ADDITIVE (the controller goes 12 → 13 members), ASYNC (it awaits the OLD default's vector-engine
     drain + boot teardown in vector mode), NO-OP when `name` is the current default, and the operator-facing
     seam U-H8 calls. The name `hotSetDefault` mirrors the `hotApply`/`hotRemove`/`hotRename` verb family +
     the loader's `default:true`. The alternative (`hotReassignDefault`) is equivalent but breaks the verb
     symmetry. **Confirm `hotSetDefault` + the `{ loaded, delta, drained, noop }` return shape (with
     `noop:true` on the same-default no-op).**
2. **The vector teardown + re-warm approach — CONSTRUCT-NEW-BEFORE-TEAR-DOWN-OLD + born-lexical-pending
   + fire-and-forget start + LEXICAL-PENDING failsafe. (RESOLVED provisionally; needs the ruling.)**
   - The vector re-warm is ordered: (1) CONSTRUCT the new default's `createVectorBootController` FIRST
     (born-lexical-pending, NOT started; a construct throw leaves disk + live untouched at the cost of an
     orphaned born-lexical engine), (2) write the flip, (3) replace the new default's engine + rebuild the
     old default lexical + re-bind (no dark default), (4) TEAR DOWN the old default's boot LAST (its engine
     drained to `inFlight()===0` first — A-P2-2), (5) START the new boot fire-and-forget with a silent
     `.catch(() => undefined)` (the runtime 0-log census holds). The failsafe: a new-default background-build
     FAILURE leaves it serving LEXICAL-pending (the boot logs its own milestone) — it NEVER fails the
     `hotSetDefault` loudly and NEVER demotes a promoted engine (W1 F1 parity). There is NO runtime re-run
     of the warm-up probe (U-H7 reuses the already-warmed `_provider`). **Confirm the construct-first/
     tear-down-old-last order + the lexical-pending failsafe (vs a "fail-loud" alternative — the latter is
     rejected: hot-assigning a default must never abort the app, and the boot's F1 discipline already keeps
     it lexical).** If the Architect wants the new default to fail the reassignment on a build failure, that
     is a deviation from the born-lexical model — needs a ruling.
3. **The default's RENAME (D4 fold) — how to reconcile `W-rename-default`. (RESOLVED provisionally to a
   NEW write kind + a `hotRenameDefault`-style seam; the LEGACY path STAYS closed. Needs a ruling.)**
   - **Option R1 (RECOMMENDED):** add a NEW write-module mutation `{ kind: 'renameDefault'; to: string }` +
     `renameDefaultRegistryStore` convenience (renames the CURRENT default preserving `default:true`, with
     its own guards), surfaced on the controller as `hotRenameDefault(to)` (the controller 14th method). The
     LEGACY `W-rename-default` guard is UNCHANGED — `hotApply({kind:'rename'})`/`hotRename` of the default
     KEEP propagating `W-rename-default` (U-H2 F9/HOST-2 + U-H6 F4 stay green). This is the cleanest: no
     legacy pin is re-pinned, the default-rename becomes a first-class sanctioned op.
   - **Option R2:** fold the default-rename INTO `hotSetDefault` (a compound seam that can take a name
     change), avoiding a second method but conflating "which store is default" with "what is it called".
   - **Option R3:** relax the write module's `rename` guard to allow default renames (the default flag
     preserved) — **REJECTED**: it re-pins/breaks the LANDED U-H2 F9/HOST-2 + U-H6 F4 `W-rename-default`
     assertions, contradicting U-H6's explicit "folds into U-H7" (the legacy path should remain closed).
   - **Ruling requested:** confirm **R1** (a second write kind + `hotRenameDefault(to)`) OR **R2** (fold into
     `hotSetDefault`), and confirm the legacy `W-rename-default` pins STAY GREEN.
4. **What happens to the OLD default's STORE + file on a default change? (RESOLVED provisionally to RETAIN
   — the store is NEVER torn down; ONLY the vector boot controller is torn down. Needs a ruling.)**
   - The gate's task explicitly resolves: "only the VECTOR boot controller is torn down, the store/engine
     are retained as ordinary non-default entries" (and `drainAndReleaseEntry` — which tears the store too —
     is NOT directly usable). The recommendation: the OLD default's STORE is retained, its persistence file
     + journal strand byte-identical (D3), its entry stays in the live Map (`statusOf`/`currentStores` still
     list it), and in vector mode its vector-boot ENGINE is replaced IN PLACE with a FRESH lexical engine
     (non-default entries are always lexical, A6/R10). The alternative — tearing the OLD default down entirely
     (a `drainAndReleaseEntry` on its store+engine) — would REMOVE it from the registry, which is a REMOVE,
     not a reassign (the operator did not ask to delete it) → **REJECTED**. **Confirm RETAIN + rebuild-old-default-
     as-lexical (vector mode only).**
5. **The atomic ordering (no dark default; construct-new-before-teardown-old; the A-P2-2 drain). (RESOLVED
   provisionally; confirm.)** The pinned order (§4 ATOMIC-APPLY-DEFAULT): construct-new-first → write →
   apply/re-bind (the new default is live before the old boot's engine is released) → tear-down-old-LAST →
   start-new. There is NO instant at which the default is unserved, and the OLD default's vector engine is
   NEVER torn down mid-query (UNBOUNDED `inFlight()===0` drain + the F-H4-1 re-entry). **Confirm so the
   TestWriter locks the H4/H8 + F8/F9 rows.**
6. **Write-module scope — does U-H7 EDIT `rag-store-registry-write.ts` (U-H1's byte-pinned file) to add the
   `setDefault`/`renameDefault` kinds? (RESOLVED provisionally to YES — an ADDITIVE amendment amending the
   U-H1 test suite, NOT re-pinning it. Needs a ruling.)**
   - The write module is the designated D2 disk owner; flipping `default:true` is a pure config mutation
     `applyRegistryMutation` should own (validate existing → build the flipped candidate → validate → atomic
     persist + reload). The alternative — a U-H7-owned non-mutation write path (read configs, flip, persist via
     `persistRagStoreRegistry`, reload via `loadRagStoreRegistry` directly) keeps U-H1 byte-pinned but
     DUPLICATES the load→mutate→persist→reload orchestration the write module already encapsulates and weakens
     the REGISTRY-NO-WRITE per-module refinement. **Confirm U-H7 ADDS the kinds to the write module (amending
     `tests/unit-h1-registry-write.test.ts` additively) OR rule the alternative.**
7. **The vector-CACHE handoff on re-warm — flush the OLD boot's cache or hand off the file? (RESOLVED
   provisionally to HAND OFF — reuse the shared `provident-vector-cache.json`, NO explicit flush, NO delete.
   Needs a ruling.)**
   - The cache FILE is GLOBAL + content-addressed (W4/W5); the NEW default's boot re-reads the SAME file, so
     unchanged content is adopted with NO HTTP call. The OLD boot's teardown (U-H5) never deletes/flushes it;
     the OLD boot's in-memory debounce tail (a few seconds, `CACHE_WRITE_DEBOUNCE_MS=500`) at teardown is SILENTLY
     LOST (F-W4-6 quit-tail parity — a bounded content bound). The alternative — exposing the cache on the
     `VectorBootController` (`readonly cache?: VectorCache`) so U-H7 can `flush()` it before teardown — adds a
     controller-interface member + a runtime caller. **Confirm HAND OFF (accept the debounce-tail loss; the new
     boot's fresh `createVectorCache` re-reads the file post-any-debounce as best-effort) OR rule "add a flush
     seam".**
8. **The no-op-on-same-default semantics + the result shape. (RESOLVED provisionally; confirm.)** `hotSetDefault`
   of the current default is a NO-OP — returns `{ loaded: currentRegistry, delta:{...all-empty}, drained: 0,
   noop: true }` with NO write, NO teardown, NO live mutation, and the registry file byte-identical. The `noop`
   flag distinguishes the no-op result from a real reassignment in the caller/U-H8. **Confirm the `noop` flag +
   the no-write semantics** (an alternative — routing the same-default through the write module's `W-set-default-nop`
   as a fail — is REJECTED: reassigning to the current default is idempotently successful, not an error).
9. **Scope vs U-H8 (confirm).** U-H7 lands the CONTROLLER mechanism (`hotSetDefault` + the re-bind + the vector
   teardown re-warm), node-testable, NO IPC/MCP. U-H8 owns the operator-UI trigger + confirmation + the IPC
   channel that reads `runtime.getDefaultName()`/`currentStores()`/`statusOf` and calls `hotSetDefault`. **Confirm
   the split.**

**RCA-3 adversarial registration:** the adversarial pass MUST confirm the §3a probes on the landed code —
in particular the no-dark-default invariant (a live engine bound to the default at every instant), the
A-P2-2 old-default-engine drain, the silent `.catch` (no runtime `console.*`), the byte-identical OLD default
store + cache file, and the N1 regex on `rag-store-runtime.ts`.

---

**Bottom line:** U-H7 is the gate's HIGHEST-RISK unit — the runtime default REASSIGNMENT (`hotSetDefault(name)`),
making the currently-STABLE default re-bindable (A-P2-1/D1): a new async controller seam that flips `default:true`
via a write-module `setDefault` kind (D2), RE-BINDS the runtime's `defaultEntry`/`vectorBoot`/`defaultName` so
every already-rewired closure reflects the new default per call, RETAINS the OLD default's store as a non-default
(torn-down only in its VECTOR boot via a new `rag-store-default.ts` module, N1/A-P2-8-grep-clean), and RE-WARMS
the NEW default's vector boot construct-new-before-teardown-old with a lexical-pending failsafe. The DEFAULT's
rename folds in (D4) via a separate sanctioned seam, NOT the relaxed legacy path (the U-H2/U-H6 `W-rename-default`
pins stay green). It exposes the controller MECHANISM only — no MCP tool, no IPC channel (D6; U-H8 owns the
operator trigger + accessor IPC) — and it does NOT re-author the `stores:"all"` fan-out. **The five genuine §7
either/or items (Q1 the surface, Q3 the default-rename reconciliation, Q4 store-retained-vs-torn, Q6 the
write-module scope, Q7 the cache handoff) MUST be arbitrated CONFIRMED before the TestWriter derives the red set;
Q2/Q5/Q8–Q11 confirm the recommended reading.**

---

### §7 Architect ruling (2026-09-08, Gate Supervisor / Architect)

All eleven §7 items are **CONFIRMED** as provisionally resolved — the record for the TestWriter:

1. **Q1 — CONFIRMED.** `RagStoreRuntimeController.hotSetDefault(name: string): Promise<HotSetDefaultResult>`
   (ADDITIVE, ASYNC; 12 → 13 members). `HotSetDefaultResult = { loaded, delta, drained: 0, noop: boolean }`
   (`delta.defaultChanged === [name]`; `noop:true` on the same-default no-op). Verb-family symmetry with
   `hotApply`/`hotRemove`/`hotRename`; the operator-facing seam U-H8 calls. **CONFIRMED.**
2. **Q2 — CONFIRMED.** Vector re-warm ordered CONSTRUCT-NEW-FIRST → write → apply/re-bind (new default live
   before the old boot's engine is released) → tear-down-old-LAST → start-new fire-and-forget
   (`.catch(() => undefined)`; runtime 0-log census holds). Failsafe = born-LEXICAL-PENDING: a new-default
   background-build failure NEVER fails `hotSetDefault` loudly, NEVER demotes (W1 F1 parity); no runtime
   re-run of the warm-up probe (reuses the warmed `_provider`). **CONFIRMED** (deviation: a fail-loud
   alternative is REJECTED). **CONFIRMED.**
3. **Q3 — CONFIRMED, Option R1.** The default's RENAME is a SEPARATE sanctioned write kind
   `{ kind:'renameDefault'; to }` + `renameDefaultRegistryStore` + `hotRenameDefault(to)` (the controller's 14th
   method). The LEGACY `W-rename-default` guard is UNCHANGED — `hotApply({kind:'rename'})`/`hotRename` of the
   default KEEP propagating `W-rename-default` (U-H2 F9/HOST-2 + U-H6 F4 stay green). R2 (fold-in) and R3
   (relax the guard) are REJECTED. **CONFIRMED.**
4. **Q4 — CONFIRMED, RETAIN.** The OLD default's STORE is retained (persistence file + journal strand
   byte-identical, D3; entry stays in the live Map); in vector mode its vector ENGINE is replaced IN-PLACE with
   a FRESH lexical engine (non-default always-lexical, A6/R10). ONLY the old default's `VectorBootController`
   is torn down (via `releaseDefaultVectorBoot` in the new `rag-store-default.ts`). `drainAndReleaseEntry` is
   NOT used (it tears the store too). **CONFIRMED.**
5. **Q5 — CONFIRMED.** Atomic order: (1) construct-new-first (a construct throw leaves disk+live untouched at
   the cost of an orphaned born-lexical engine) → (2) write the flip (D2) → (3) replace the new default's engine
   + rebuild the old default lexical + re-bind → (4) tear-down-old-LAST (UNBOUNDED `inFlight()===0` drain +
   the F-H4-1 re-entry) → (5) start-new. NO dark default; the old default's vector engine is NEVER torn down
   mid-query. **CONFIRMED.**
6. **Q6 — CONFIRMED, YES (additive).** U-H7 ADDS the `setDefault` (or the flipped-default mutation) +
   `renameDefault` kinds + `defaultChanged` to `rag-store-registry-write.ts` (U-H1's byte-pinned file),
   AMENDING `tests/unit-h1-registry-write.test.ts` ADDITIVELY (NOT re-pinning existing rows — the U-F3 test-19
   precedent). The write module stays the D2 disk owner; the REGISTRY-NO-WRITE per-module refinement holds.
   **CONFIRMED.**
7. **Q7 — CONFIRMED, HAND OFF.** The vector-cache FILE is GLOBAL + content-addressed; the NEW default's boot
   re-reads the SAME `provident-vector-cache.json` (unchanged content adopted with no HTTP call). NO explicit
   flush, NO delete; the OLD boot's debounce-tail loss at teardown is a bounded content bound (F-W4-6 quit-tail
   parity) and is accepted. The alternative "flush seam" (exposing `VectorBootController.cache`) is REJECTED.
   **CONFIRMED.**
8. **Q8 — CONFIRMED.** `hotSetDefault` of the current default is a NO-OP: `{ loaded: currentRegistry,
   delta:{...all-empty}, drained:0, noop:true }`, NO write, NO teardown, NO live mutation, registry file
   byte-identical. The `noop` flag distinguishes the no-op result for U-H8. **CONFIRMED.**
9. **Q9 — CONFIRMED.** U-H7 = the controller MECHANISM only (node-testable, NO MCP tool, NO IPC channel — D6);
   U-H8 owns the operator-UI trigger + confirmation + the accessor-backed IPC that reads
   `runtime.getDefaultName()`/`currentStores()`/`statusOf` and calls `hotSetDefault`. **CONFIRMED.**
10. **Q10 — CONFIRMED, UNBOUNDED.** The old default's vector-engine drain awaits `inFlight()===0` UNBOUNDED
    (A-P2-2; a never-settling query hangs — the F-H5-3 awareness, not a bug). Census stays at the pinned
    message set. **CONFIRMED.**
11. **Q11 — CONFIRMED, IN SCOPE.** U-H7's default re-bind (re-pointing `directory.defaultName`/`defaultEntry`/
    `vectorBoot`/`_currentRegistry`) CLOSES the U-H2 HOST-LOW-1 accessor desync ON THIS PATH (the `pending.md`
    row is resolved-here for the reassignment; the separate F15/F16 drift branch remains a documented edge for
    U-H8 to avoid). **CONFIRMED.**

The **RCA-3 adversarial pass** (post-green) must confirm the §3a probes on the landed code: the no-dark-default
invariant, the A-P2-2 old-default-engine drain, the silent `.catch` (no runtime `console.*`), the byte-identical
OLD default store + cache file, and the N1/A-P2-8 regex on `rag-store-runtime.ts`.

The TestWriter may derive U-H7's red set (the missing `rag-store-default.js`, `hotSetDefault`/`hotRenameDefault`
`undefined`, no `setDefaultRegistryStore`/`renameDefaultRegistryStore`, no `RegistryDelta.defaultChanged`, the
non-re-bindable defaults) against this ruling; no further arbitration is required before the red run. The operator
trigger + confirmation remain U-H8's (out of U-H7's scope).
> the red set against the FINAL ruling, not an un-arbitrated draft.
