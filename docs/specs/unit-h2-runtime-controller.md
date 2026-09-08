# Spec — Unit H2: The Registry Hot-Apply Runtime Controller (`rag-store-runtime.ts`) + the Closure Rewiring

> **STATE (2026-09-08): U-H2 is LANDED — BOTH sub-units.** U-H2a — the module
> `src/main/rag-store-runtime.ts` — exists and is green (38/38 via
> `tests/unit-h2-runtime-controller.test.ts`, typecheck + build clean), incl.
> the four RCA-3 adversarial host regressions HOST-1a/1b/2/3 (F-H2-1/2/3); the
> blind-greens ran 28 PASS / 1 FAIL / 3 DEFERRED with the single FAIL (F8,
> §5.5 R-kind single-quote) + the F7 note reconciled in the U-H2a doc-review
> (`archive/reviews/2026-09-08-unit-h2a-doc-review.md`). **U-H2b (the closure
> rewiring — §5.8/§5.9 and the §4 A-P2-1/REFRESH-ON-APPLY seams, main.ts
> B1–B13 + mcp-server.ts M1–M4) is LANDED (2026-09-08) — the U-H2b sections
> below describe the landed U-H2b contract (14/14 + 4 pins).** The unit trio
> baseline (incl. U-H2) is **2665 pass / 41 skip per the triowrite, pending
> the supervisor's parallel trio-run confirmation** (typecheck + build clean).

- **Status: SPEC (DRAFT, pre-gate)** — the registry hot-apply/removal/rename
  slice, Unit U-H2 of 8 — the SECOND unit in the pinned execution order
  U-H1 → **U-H2** → U-H3 → U-H5 → U-H4 → U-H6 → U-H8; U-H7 (default
  reassignment) is split out. Gate reference:`docs/specs/registry-hot-apply-review.md`
  §2 **D1** (swap seam — a NEW registry-runtime controller owns a mutable live
  `RagStoreDirectory`; `main.ts`'s `plan.directory` becomes `runtime.directory`),
  **D2** (write path + supersession — persisted-and-live never diverge; supersedes
  the "observed only after restart" test), **D3** (hot-remove ORPHAN policy),
  **D4** (rename semantics — the no-ids half is a U-H2 caller precondition),
  **D7** (mid-flight consistency — add atomic / remove drain-then-teardown /
  rename reject-at-resolution; the `teardown()` primitives land in U-H5),
  **D8** (unit decomposition — the U-H2 row + the explicit "split U-H2a/U-H2b
  if it balloons" warning); §5 "Impact on existing contracts" (A-P2-1
  const-captured closure rewiring; MCP-UI-EQUIVALENCE preserved only with
  A-P2-1); §6 (the live-scenario PARKED note). Binding amendments:
  **A-P2-1** (all const-captured default closures + server options read runtime
  accessors per call), **A-P2-3** (refine REGISTRY-NO-WRITE / boot-time contract;
  supersede `tests/unit-ms5-settings-listing.test.ts` Red 18 with
  refresh-on-apply — the mechanical half lands THIS unit), **A-P2-8** (the new
  `teardown()` primitives land in U-H5, NOT here). Consumed dependency:
  `docs/specs/unit-h1-registry-write.md` §5 (the LANDED write module
  `src/main/rag-store-registry-write.ts` — `writeRegistryMutation`,
  `RegistryMutation`, `RegistryDelta`, `RegistryMutationResult`,
  `RegistryWriteResult`, `RegistryWriteResult['loaded']`); `docs/specs/unit-ms1-store-registry.md`
  §5 (the loader — `loadRagStoreRegistry`, `LoadedRagStoreRegistry`); `docs/specs/unit-ms2-store-wiring.md`
  §5 (the directory — `buildRagStoreDirectory`, `RagStoreDirectory`,
  `RagStoreEntry`, `storeLoadStatus`, and the D8 "READ EXACTLY ONCE PER BOOT"
  pin this unit must satisfy). **Split call (this spec — see §6): U-H2 is
  DECLARED TOO LARGE FOR ONE RED SET and is split into TWO sub-units in this
  ONE spec file — U-H2a (the runtime controller + the mutable live directory,
  `src/main/rag-store-runtime.ts`, node-testable) and U-H2b (the closure
  rewiring, `src/main/main.ts` + `src/main/mcp-server.ts`), each with its own
  red set (RCA-5).** The `TestWriter` derives U-H2a's red set from §5.3–§5.7
  and U-H2b's from §5.8–§5.9. The **live-scenario gate is PARKED** (review §6
  — a live app session is unavailable by user instruction); a
  live-pending battery SHOULD be authored later (§6). One SpecWriter-pinned
  test file: `tests/unit-h2-runtime-controller.test.ts` (§5.9).

- **Scope:** ONE NEW module `src/main/rag-store-runtime.ts` (the runtime
  controller — OWNS the mutable live `RagStoreDirectory`, the runtime
  accessors, and the single hot-apply orchestration seam) plus the closure
  rewiring in `src/main/main.ts` and `src/main/mcp-server.ts` (A-P2-1 — every
  const-captured default/directory closure + the server options read runtime
  accessors per call). This unit does NOT add an MCP tool and does NOT add an
  IPC channel (D6 — the operator-UI editor is U-H8), does NOT land the
  `teardown()` primitives (U-H5/A-P2-8), does NOT own the per-op incremental
  add/remove/rename teardown-aware apply (U-H3/U-H4/U-H6 — U-H2's apply is a
  safe REBUILD of the non-default entries, §4), does NOT own default
  reassignment (U-H7/D5), and does NOT change any page design (the
  operator-UI editor is U-H8; the settings-pane listing is U-MS5's, refreshed
  here per A-P2-3 but not re-authored).
- **TestWriter contract:** every method/API signature, return shape, throw
  pattern, happy-path state, and fail-state below is derivable from this spec
  ALONE. The TestWriter writes the U-H2a red set for
  `src/main/rag-store-runtime.ts` from §5.3/§5.4/§5.6/§5.7, and the U-H2b red
  set for the closure rewiring from §5.8/§5.9, into the SpecWriter-pinned test
  file `tests/unit-h2-runtime-controller.test.ts` (§5.9), in the house
  red-first order (RCA-1) with the failing set reported per sub-unit. Per
  RCA-2/RCA-5, U-H2a runs its own TestWriter-red → Implementer-green →
  adversarial → blind-greens → doc-review cycle BEFORE U-H2b starts.

---

## 1. What the proposal asks (the U-H2 slice)

The registry hot-apply slice (review §2) extends the boot-time-only multi-store
registry so a mid-run registry change takes effect WITHOUT an app restart. For
U-H2 (the SECOND unit, review §2 D8), the proposal asks:

1. **A runtime controller owns a mutable live `RagStoreDirectory` (D1):** the
   boot-constructed directory becomes a LIVE, mutable directory the controller
   holds; `main.ts`'s `plan.directory` is SUPERSEDED by
   `runtime.directory`/`runtime.getDirectory()`. A store create/destroy (and
   U-H1's completed write effect) takes effect WITHOUT a restart.
2. **The MCP path re-reads the directory per call, so no re-registration is
   needed (D1):** today `handleRagTool`/`handleEditTool` re-resolve via
   `resolveStoreArg(name, args.store, ragStores)` — which reads
   `ragStores.entries` per call — so mutating the SAME directory's entries
   IN PLACE makes every already-registered MCP handler see the new stores
   without re-registration. This is the load-bearing property U-H2 exploits.
3. **The const-captured default closures + server options read runtime
   accessors per call (A-P2-1):** every IPC closure in `main.ts` and every
   tool handler in `mcp-server.ts` that captured the boot-time default
   store/engine/directory is rewired to read the runtime's accessors.
4. **A single runtime trigger (RESOLVED in §4, then surfaced to the
   Architect):** the controller exposes ONE orchestration seam —
   `hotApply(mutation)` — that consumes the U-H1 write path
   (`writeRegistryMutation`) and applies the result to the live directory.
   U-H2 adds NO MCP tool and NO IPC channel (D6); the LATER U-H8 operator-UI
   IPC handler invokes `hotApply`. This unit's tests drive `hotApply` directly.
5. **A controlled re-read/rebuild/rewire that keeps the boot path BYTE-EQUAL
   for a NO-OP run and preserves the D8 "read exactly ONCE per boot" pin for
   the normal boot path:** constructing the runtime controller performs NO
   rebuild, NO re-read, NO side effect; the normal boot path is byte-equal.
   `writeRegistryMutation` is invoked ONLY on an explicit `hotApply`.
6. **The refresh-on-apply (A-P2-3):** after a successful hot-apply, the
   settings-pane store listing (`IPC_RAG_STORE_LISTING`) reflects the NEW
   state (a pull after an apply shows the fresh projection), superseding the
   "observed only after restart" behavior.
7. **The D4 no-ids half — a U-H2 CALLER precondition (U-H1 §5.3.2):** for a
   `rename`, the runtime controller (as the caller of `writeRegistryMutation`)
   inspects the renamed store for persisted `<from>:`-prefixed ids and
   declines an id-repacking rename BEFORE the write touches the disk.

This unit does NOT own: the `teardown()` primitives (U-H5/A-P2-8), the
incremental teardown-aware apply for add/remove (U-H3/U-H4), the hot-rename
UI/orchestration details beyond the no-ids caller precondition (U-H6), default
reassignment (U-H7/D5 — U-H2's reachable mutations never change the default);
the operator-UI editor IPC (U-H8).

## 2. Feasibility verdict

**Feasible — grounded entirely in existing host primitives and the two LANDED
contracts (U-H1 write + U-MS1/MS2 load/build); no engine gap.**

- **The directory is already a live-by-reference Map:** `RagStoreDirectory`
  is `{ entries: ReadonlyMap<string, RagStoreEntry>, defaultName: string }`.
  `ReadonlyMap` is a COMPILE-TIME view — the runtime object is a real `Map`
  that `buildRagStoreDirectory` constructs once (§5.1 rule 6 of
  `unit-ms2-store-wiring.md`). A controller that mutates that SAME Map in place
  (clear + re-insert) makes every already-captured `dir.entries` reference reflect
  the new stores WITHOUT re-pointing any closure (D1: "the MCP path already
  re-reads `dir` per call"). This is the entire no-re-registration basis.
- **The write path is landed and atomic:** `writeRegistryMutation` (U-H1)
  re-reads current disk (fail-loud on corrupt), mutates purely, persists
  atomically (temp→fsync→rename), re-loads, and returns `{ loaded, delta }`.
  A throw leaves the original file + the live state untouched. The controller
  consumes it verbatim (D2 persisted-and-live never diverge).
- **The default is STABLE across U-H2's reachable mutations:** U-H1's guards
  reject renaming the default (W-rename-default), removing the only default
  (F12), and adding a second default (F12). So every mutation U-H2 accepts
  leaves `loaded.defaultStoreName === directory.defaultName`. This means
  U-H2's apply NEVER rebuilds the default entry or the vector boot — it
  rebuilds ONLY the non-default (always-lexical, A6) entries and carries the
  default's store/engine/vector-boot object identities across unchanged. This
  is what keeps the default-serving path byte-equal AND makes the apply a
  no-teardown, no-warm-up rebuild.
- **The non-default rebuild is pure + safe pre-teardown:** each non-default
  entry is `createJsonRagStore({ path })` + the lexical engine
  (`createRetrieval(store, createLexicalEmbedder(createLexicalIndex(...)))`).
  A store missing its persistence file constructs empty+`corrupt`/`failed-missing`
  (the U-MS2 D7 matrix); a well-formed loader-validated path never throws. The
  old non-default entries are ORPHANED (dropped from the live Map + all
  closures), NOT torn down — teardown is U-H5's contract (A-P2-8). U-H2
  documents the orphan as a bounded hold until U-H5 lands.
- **The trigger is a pure programmatic seam:** `hotApply(mutation)` is a
  synchronous controller method, directly node-testable like every injected
  shared handler in this repo. No MCP/IPC surface is needed (D6).

## 3. Gaps + costs-benefits

| Gap | Project-specific vs engine-handoff | Cost / benefit |
| --- | --- | --- |
| The NEW runtime module (`src/main/rag-store-runtime.ts`: the mutable live directory + runtime accessors + `hotApply`) | Project-specific (composes the U-H1 write module + the U-MS2 directory/build internals; uses `createJsonRagStore` + `createRetrieval` + lexical embedders) | Medium cost; the entire runtime hot-apply surface becomes node-testable before any closure wiring exists. This is the seam U-H3/U-H4/U-H6 extend. |
| The closure rewiring in `main.ts` + `mcp-server.ts` (A-P2-1) | Project-specific (rewire ~12 default/directory closures to runtime accessors; add a runtime seam to the MCP server) | Low-mechanical cost (the default is stable, so every accessor returns the SAME objects today — the seam is structural for U-H7, not functionally shifting); high churn density. This is the part the gate warned "balloons" — split into U-H2b. |
| The orphaned-store/engine holds until U-H5's `teardown()` | Project-specific (D7/A-P2-8 — teardown is U-H5) | A bounded resource hold: each non-default rebuild orphans the prior entry's store/engine (a file handle + index) until U-H5 ships teardown. Documented, not silently leaked forever — the slice lands U-H5 next-but-one. |
| The D4 no-ids caller precondition (rename) | Project-specific (needs store DATA — reads the renamed store's node ids) | U-H1 cannot verify it (pure); U-H2's `hotApply` inspects the store before the write and declines an id-repacking rename. Cost: a store-nodes read per rename (rare, operator-initiated). |
| The A-P2-3 refresh-on-apply | Project-specific (rewire `IPC_RAG_STORE_LISTING` to read the runtime's current projection) | Low cost; supersedes `tests/unit-ms5-settings-listing.test.ts` Red 18 + fail-state 10 (mechanical half lands HERE — see §5.10). |
| No teardown in U-H2's apply (rebuild-all-of-non-default) | Project-specific (the safe pre-U-H5 path) | Correctness first; U-H3/U-H4/U-H6 replace the rebuild with incremental teardown-aware applies. U-H2 documents the rebuild is a coarse-but-correct apply. |

No engine gap — the module is entirely host-side (`src/`), node-testable, and
consumes two LANDED contracts (U-H1 + U-MS1/MS2).

### 3a. Adversarial findings (registered — the U-H2 adversarial pass RUNS after the green, per RCA-3; placeholder + pre-registered probes)

The RCA-3 read-only adversarial pass on the U-H2 green runs BEFORE the unit is
reported done; host findings (ids `F-H2-*`) are fixed here + regression-tested;
an engine (provident-ssr) finding, should one ever surface, is a
`docs/defects.md` + `docs/HANDOFF.md` item, NEVER a package patch (AGENTS.md
item 7).

**Pre-registered edge probes (the adversarial pass MUST confirm on the landed
module):**

- The controller constructor performs NO rebuild/fs/read side effect — a
  fresh controller around a boot directory returns the SAME directory object
  identity and leaves every entry/bytestream untouched (NO-OP byte-equal).
- `hotApply` never mutates the live directory unless `writeRegistryMutation`
  SUCCEEDED (a write/loader/native-fs throw leaves the live Map byte-identical).
- A `rename` whose renamed store carries `<from>:`-prefixed ids is declined
  (R-rename-ids-present) BEFORE any disk write.
- The default entry/vector-boot object identities are preserved across every
  reachable apply (add/remove/rename of a NON-default).
- A second `hotApply` after a failed first leaves the live state byte-identical
  to before the first (no partial apply) — for a WRITE/loader/fs or construct
  failure. The F15/F16 default-drift THROW path (step 4) is the documented
  HOST-1 exception: it deliberately SYNCHRONIZES the live directory to `loaded`
  before throwing D2-preserving — a FULL (never partial) sync, not a divergence.
- `currentStores()` returns a FRESH slice (mutating it cannot affect the
  controller), and after an apply reflects the fresh `loaded` registry.

**RCA-3 host findings (F-H2-1/F-H2-2/F-H2-3, fixed + regression-tested
2026-09-08) — see the same-session H-rows at the bottom of U-H2a's test file:**
`tests/unit-h2-runtime-controller.test.ts` now carries four RCA-3 regression
rows (HOST-1a/HOST-1b/HOST-2/HOST-3):

- **HOST-1 (F-H2-1, HIGH) — D2 persisted-and-live divergence after the
  post-write F15/F16 defensive throws:** step 3 of `hotApply` calls
  `writeRegistryMutation` (re-read → mutate → persist → re-load); the step-4/5
  defensive throws (`R-default-changed` F15 / `R-default-mismatch2` F16) then
  fired AFTER the write already persisted while the live Map was never swapped.
  Reachable through an EXTERNAL mid-run registry default edit (in-contract —
  H9/F15/F16). FIX: on the F15/F16 drift the live directory is SYNCHRONIZED to
  the freshly-loaded `loaded` projection BEFORE the throw (`syncLiveToLoaded`,
  rebuild-all) — the newly-defaulted store is rebuilt as a lexical entry and
  `directory.defaultName` follows `loaded.defaultStoreName`, so live reflects
  exactly what is on disk (D2 preserved even in the throw path). Regression:
  after a drifted-default apply, `controller.getDirectory()`/`getDefaultName()`/
  `statusOf`/`currentStores()` match disk EVEN THOUGH `hotApply` throws.
- **HOST-2 (F-H2-2, MEDIUM) — the D4 no-ids scan preempted the pinned
  `W-rename-default` for a default rename:** the step-2 inspect ran even when
  `from === directory.defaultName`, so a POPULATED default rename threw
  `R-rename-ids-present` instead of the write module's `W-rename-default` (F9).
  FIX: skip the D4 id scan when `from === directory.defaultName` so the write
  module's `W-rename-default` fires first and keeps its pinned message.
  Regression: a rename of a POPULATED default store (seeded with a
  `<default>:`-prefixed id) throws `W-rename-default`, not `R-rename-ids-present`.
- **HOST-3 (F-H2-3, LOW) — `R-registry-default` guard gap:** the constructor's
  guard validated only the default-name tie. A malformed `opts.registry.stores`
  (`undefined`/`[]`) slipped through to a raw `TypeError` or a silently-weakened
  F16 drift guard. FIX: the guard now requires `Array.isArray(opts.registry.stores)`
  with a resolvable default entry (byte-pinned `R-registry-default`). Regression:
  `stores: undefined` and `stores: []` both fail loud with
  `rag-store-runtime: registry default does not match the directory default`.

**U-H2b adversarial findings (registered 2026-09-08 — the U-H2b adversarial
pass ran against the landed B1–B13/M1–M4 wiring + the U-H2b green set):**

- **HOST-LOW-1 (LOW, DEFERRED to U-H7 / the next unit — NOT fixed in U-H2) —
  U-H2 closure-rewiring drift on the U-H2a F15/F16 rebuildAll path:** the
  U-H2a `syncLiveToLoaded(_, rebuildAll=true)` drift sync (HOST-1) rebuilds
  EVERY entry from `loaded` and sets `directory.defaultName =
  loaded.defaultStoreName`, but it NEVER re-binds the controller's captured
  `defaultEntry` (nor the store/engine accessors that read it). After a
  F15/F16 drifted-default apply the directory's `defaultName` + rebuilt
  entries reflect disk, while `getDefaultStore()`/`getDefaultEngine()`/
  `getDefaultName()` (via `defaultEntry`) still read the OLD boot default —
  so the runtime's direct accessors DESYNCHRONIZE from `directory.defaultName`
  on exactly the path HOST-1 created to preserve D2. **LATENT** — no
  `hotApply` caller is wired until U-H8, so no live closure consumes the
  accessors post-drift today (the U-H2b bindings B2/B5/B13 + M3/M4 ARE the
  exposure the moment U-H8 invokes `hotApply` on a drifted registry). **Fix
  deferred to U-H7 / the next unit** (revisit when the real hot-apply caller
  is wired): either re-bind `defaultEntry` on `rebuildAll` OR route the
  direct-accessor handlers B2/B5/B13 through
  `runtime.getDirectory().entries.get(runtime.getDefaultName())`. RECORDED —
  pending.md row added (2026-09-08).
- **HOST-INFO-1 (INFO, FIXED this pass — 2026-09-08): dead boot consts in
  `main.ts`:** the post-rewiring `main.ts` no longer needs standalone
  `ragStore`/`retrievalEngine` constants (every live closure reads
  `runtime.getDefaultStore()`/`runtime.getDefaultEngine()` per call). The dead
  consts were removed in this pass; verify NO documentation still claims they
  exist (this spec's §5.8 prose now consistently reads the runtime accessors;
  the legacy single-store fallback lives only inside `mcp-server.ts` when the
  runtime is absent — M1/M4).

**Documentation-drift notes for the proofreader/doc-review gate (§5.5/§5.7
prose — the module is UNAMBIGUOUSLY correct; do NOT change it; BOTH notes
below are RECONCILED in the per-unit doc-review pass, 2026-09-08):**

- **F8 `R-kind` message uses SINGLE quotes.** The module's message is
  `rag-store-runtime: unknown mutation kind 'delete'` — a string `kind` renders
  WITHOUT JSON quoting (its `kindOf` renders a string verbatim), consistent with
  the module's other `'<id>'`/`'<from>'` interpolations. Spec §5.5's `<json>`
  note points at the loader's `jsonOf` discipline (JSON.stringify ⇒ double
  quotes), which would imply `"delete"`. The module's single-quote form matches
  the §5.5 census table's wording AND U-H2a's own red-set assertions; ONLY the
  `<json>` prose pointer (§5.5 message-conventions paragraph) is imprecise for
  the single-quote render. Fix the PROSE (or annotate that R-kind renders a
  string verbatim, single-quoted), never the module. (See also §5.7 F8.) This
  mirrors the module's own header comment on `kindOf`.
- **F7 `R-embedder` prose vs fixed-string census.** The module's message is the
  §5.5 census fixed string `rag-store-runtime: embedderKind must be 'lexical' or
  'vector'`. Spec §5.7's F7 row adds "(`<json>` rendering; a >200-char kind
  renders capped)" — but R-embedder is a FIXED string (its `<json>`-rendering
  half does not apply). The module matches §5.5's fixed-string census and the
  `<json>` note in §5.7 F7 is the drift; leave the module as-is and reconcile
  the §5.7 F7 prose (the caps note belongs to R-kind, not R-embedder).

### 3b. Proposal-review findings folded in

From `docs/specs/registry-hot-apply-review.md`:
- **D1 (binding):** the swap seam — a NEW registry-runtime controller owns a
  mutable live `RagStoreDirectory`; `main.ts`'s `plan.directory` becomes
  `runtime.directory`; the MCP path already re-reads `dir` per call
  (`resolveStoreArg`/`dir.entries`), so no re-registration. Pinned in §4/§5.1.
- **D2 (binding):** write path + supersession — `hotApply` calls
  `writeRegistryMutation`; persisted-and-live never diverge; supersedes the
  "observed only after restart" test (mechanical refresh lands here, §5.10).
- **D4 (rename semantics):** the no-ids half is a U-H2 CALLER precondition
  (U-H1 §5.3.2) — pinned as R-rename-ids-present in §5.4/§5.7.
- **D7 (mid-flight consistency):** add atomic (construct-fully-then-insert) is
  U-H2's pattern; remove drain-then-teardown is U-H5/U-H4's (NOT U-H2 — U-H2
  orphans); rename reject-at-resolution. Pinned in §4/§5.4.
- **A-P2-1 (bound):** all const-captured default closures + server options
  read runtime accessors per call (MCP/UI equivalence). Pinned in §5.8.
- **A-P2-3 (bound):** REGISTRY-NO-WRITE / boot-time contract refined per-module;
  supersede `unit-ms5` Red 18 with refresh-on-apply (mechanical half = U-H2).
  Pinned in §5.10.
- **A-P2-8 (bound):** `teardown()` primitives land in U-H5 with its own red
  set — U-H2 does NOT add them. Pinned in §4/§5.1 census.
- **D8 (unit decomposition):** U-H2 = runtime controller; "split U-H2a
  (runtime + mutable live directory) / U-H2b (closure rewiring) if it balloons
  past the context threshold." THIS spec makes that split (§6).

## 4. Design decisions pinned by this spec

- **RUNTIME-CONTROLLER (new):** a NEW node-testable module
  `src/main/rag-store-runtime.ts` exports `createRagStoreRuntimeController(opts)`
  — a factory returning a controller that OWNS the mutable live directory and
  the single hot-apply orchestration seam. The controller is CONSTRUCTED ONCE
  at boot AROUND the boot directory (the SAME object `buildRagStoreDirectory`
  built), so its presence is byte-equal to today's boot. NO rebuild, NO fs,
  NO re-read, NO side effect at construction.
- **MUTABLE-LIVE-DIRECTORY (new):** the controller holds the boot
  `RagStoreDirectory` and mutates its `entries` Map IN PLACE (never replacing
  the Map or the directory object). `entries` is typed `ReadonlyMap` at
  compile time; the runtime object is a real `Map`. Because
  `handleRagTool`/`handleEditTool`/`handleRagStoreListingIpc`/`IPC_RAG_QUERY`/
  `IPC_RAG_SNAPSHOT` all read `entries` per call through the SAME captured
  directory object, an in-place mutation makes every already-wired closure see
  the new stores WITHOUT re-pointing — the D1 "no re-registration" basis.
  `defaultName` is stable (never changes in U-H2's reachable set) and is
  preserved on the directory. (`RagStoreDirectory.entries` remains a
  `ReadonlyMap` in type — consumers cannot write; the controller is the ONLY
  writer and mutates the underlying `Map`. This preserves the U-MS1 F-MS1-15(c)
  downstream pin: Map-keyed, never a plain object.)
- **DEFAULT-STABLE-APPLY (new):** U-H2's reachable mutations (add non-default,
  remove non-default, rename non-default) NEVER change the default
  store/name/engine/vector-boot (U-H1's W-rename-default + F12 guards). The
  controller therefore rebuilds ONLY the non-default entries (always-lexical
  per A6/R10 — `createJsonRagStore` + lexical `createRetrieval`), carries the
  DEFAULT entry's store/engine object identities AND the `vectorBoot`
  controller across unchanged, and never re-warms. This is what keeps the
  default-serving path byte-equal and the apply teardown-free + warm-up-free
  before U-H5. A defensive R-default-changed throw guards the (unreachable)
  case where the loaded default differs.
- **REBUILD-ALL-OF-NON-DEFAULT (new; the safe pre-U-H5 apply):** `hotApply`
  applies each delta as a REBUILD of the non-default entries from the freshly
  loaded registry (the `loaded` half of `writeRegistryMutation`), NOT a
  teardown-aware incremental apply (that is U-H3/U-H4/U-H6's row). The old
  non-default entries are ORPHANED (dropped from the live Map + all closures;
  no `teardown()` — U-H5/A-P2-8). The `delta` is threaded in the
  `HotApplyResult` so U-H3/U-H4/U-H6 can later substitute an incremental
  teardown-aware apply; U-H2's rebuild is a coarse-but-correct apply.
- **HOT-APPLY-TRIGGER-RESOLVED (new — the runtime trigger the gate did NOT
  pin; surfaced to the Architect, §7):** the single runtime trigger is the
  controller's **`hotApply(mutation)` orchestration seam** — a programmatic
  synchronous method that consumes the U-H1 write path
  (`writeRegistryMutation`). It is invoked by the LATER U-H8 operator-UI IPC
  handler (which may add an IPC channel in U-H8, per D6) and by U-H2's own
  node tests. It is NEVER an MCP tool and NEVER a U-H2-added IPC channel
  (D6). This is consistent with D6 because U-H2 adds NO MCP tool and NO IPC
  channel; the seam is an in-process method.
- **NO-OP-BYTE-EQUAL (new):** (i) constructing the runtime controller does NOT
  rebuild/re-read/touch anything — the boot directory object + all entries are
  byte-identical; (ii) the normal boot loader path still reads the registry
  EXACTLY ONCE per boot (D8): `writeRegistryMutation`'s re-read happens ONLY
  inside `hotApply`, an explicit operator-triggered re-read — this is the
  "controlled re-read" the D8 pin allows; (iii) every reachable `hotApply`
  (non-default mutations) leaves the default-serving path (`getDefaultStore`/
  `getDefaultEngine`/`getVectorBoot`/default-name resolution) byte-identical.
- **ATOMIC-APPLY (new, D7):** `hotApply` ORDER is pinned: (1) validate the
  mutation; (2) for a `rename`, enforce the D4 no-ids caller precondition by
  inspecting the current store (R-rename-ids-present) BEFORE any write; (3)
  call `writeRegistryMutation` — the ONLY point that touches the disk (U-H1's
  atomic temp→fsync→rename), and a throw leaves disk + live untouched; (4)
  CONSTRUCT-fully-then-INSERT (D7 add-atomic): build all new non-default
  entries into a STAGING map first; if ANY construct throws, the live Map is
  NOT mutated (staging never swapped) and the error propagates; (5) swap into
  the live Map in ONE synchronous pass + update the internal current-registry;
  (6) return `{ loaded, delta }`. A successful write ALWAYS completes the swap
  for U-H2's reachable set (loader-validated paths ⇒ non-throwing constructs),
  preserving D2 (persisted-and-live never diverge); the (unreachable)
  construct-throw case is documented as an implementation bug surfaced by the
  throw, not a silent divergence. **D2-preserving drift path (HOST-1):** when
  the post-write defensive check fires (`R-default-changed` F15 /
  `R-default-mismatch2` F16 — §5.4 step 4, reached only through an EXTERNAL
  mid-run registry default edit that the re-read picks up), the live directory
  is SYNCHRONIZED to the freshly-loaded `loaded` projection (the newly-defaulted
  store rebuilt as a lexical entry, `defaultName` following
  `loaded.defaultStoreName`) BEFORE the byte-pinned throw — so persisted-and-live
  never diverge even though `hotApply` throws. This sync-before-throw is the
  ONLY throwing path that mutates the live Map, and it is a deliberate FULL
  sync (never a partial apply).
- **D4-NO-IDS-CALLER-PRECONDITION (new):** `hotApply` for a `kind:'rename'`
  inspects the CURRENT store (`createJsonRagStore`/entry `.listNodes()`) for
  any node id starting with `` `<from>:` `` BEFORE calling
  `writeRegistryMutation`; if found, it THROWS R-rename-ids-present and the
  disk is NOT written. This is the U-H1 §5.3.2-declared U-H2 caller
  precondition (U-H1 cannot verify it — it needs store DATA). Id-migration for
  populated non-default stores is a SEPARATE unit (D4).
- **A-P2-1-CLOSURE-REWIRING (new):** all default/directory-bound closures in
  `main.ts` and `mcp-server.ts` read the runtime's accessors PER CALL (the
  runtime seam is injected); the legacy const fallback stays byte-equal for
  the directory-less/single-store path. **LANDED (U-H2b, 2026-09-08)** —
  §5.8/§5.9 describe the landed U-H2b contract (main.ts B1–B13 +
  mcp-server.ts M1–M4). Pinned §5.8.
- **REFRESH-ON-APPLY (new, A-P2-3):** `IPC_RAG_STORE_LISTING` reads the
  runtime's CURRENT resolved projection (`currentStores()` + `statusOf`), NOT
  the boot `registry` const — a pull after an apply shows the new state.
  **LANDED (U-H2b, 2026-09-08 — §5.8 B12)**; the module already
  exposes the `currentStores()`/`statusOf` source it reads (§5.4).
  Pinned §5.8/§5.10.
- **Consumed decision rows (implemented by this unit or inherited, cite-only):**
  **REGISTRY-WRITE-MODULE** / **REGISTRY-ATOMIC-WRITE** /
  **REGISTRY-RELOAD-ON-WRITE** / **REGISTRY-WRITE-FAILS-LOUD** /
  **REGISTRY-DELTA-RETURN** (`docs/decisions.md` §134-137, U-H1's rows — the
  write module this unit consumes), **MULTI-STORE-REGISTRY** +
  **REGISTRY-BOOT-SPLIT** / **REGISTRY-NO-WRITE** / **REGISTRY-DERIVED-PATHS** /
  **REGISTRY-CWD-TRANSPARENCY** (U-MS1's loader, the `loaded` shape),
  **SINGLE-WRITER-STORE-PER-STORE** (each rebuilt store carries its own queue;
  U-H2 never writes a store, only the directory),
  **ENGINE-PER-STORE** (each rebuilt non-default entry owns its lexical
  engine; U-H2 never tears one down — U-H5), **STORE-ID-PREFIX** (U-H2's
  no-ids rename precondition + the colon-free charset),
  **STORE-LISTING-BOOT-CACHED** / **STORE-LISTING-STATUS-SHARED** /
  **STORE-LISTING-IPC** (the listing is refreshed-on-apply HERE without
  re-authoring its nodes — U-MS5's surface), **UI-SELECTOR-DEFERRED** (no
  switcher; the renderer stays default-bound; the operator editor is U-H8),
  **MCP-UI-EQUIVALENCE** (preserved only with A-P2-1 — both surfaces read the
  same runtime accessors per call).

## 5. The exhaustive contract

### 5.1 U-H2a — the module (`src/main/rag-store-runtime.ts`)

**U-H2a scope:** ONE NEW node-testable module. The controller owns the mutable
live directory, the runtime accessors, and `hotApply`. It imports the U-H1
write module (`writeRegistryMutation`, `RegistryMutation`, and the
`RegistryDelta`/`RegistryWriteResult` types), the loader types
(`LoadedRagStoreRegistry` — the `currentStores` projection), and the
directory/store/retrieval constructor surfaces
(`createJsonRagStore`, `createRetrieval`, `createLexicalEmbedder`,
`createLexicalIndex` from `rag-store.ts`/`retrieval.ts`, the `RagStoreDirectory`/
`RagStoreEntry`/`storeLoadStatus` types from `rag-store-directory.ts`, and
`existsSync` from `node:fs` for the per-entry `missing` flag). **NO Electron
import** (`electron` must NOT appear). **NO IPC, NO MCP, no new channel, no new
tool name** (D6). It imports NO teardown primitive and defines NO `teardown()`
(U-H5/A-P2-8).

- **Pinned imports (structural):** from `node:fs` ONLY `existsSync` (the
  per-entry `missing` flag, the same single fs read U-MS2 uses). From
  `rag-store-registry-write.ts`: `writeRegistryMutation` + the `RegistryMutation`/
  `RegistryDelta`/`RegistryWriteResult` types. From `rag-store-registry.ts`:
  type-only `LoadedRagStoreRegistry`. From `rag-store-directory.ts`:
  `storeLoadStatus` + the `RagStoreDirectory`/`RagStoreEntry` types. From
  `rag-store.ts`: `createJsonRagStore` + the `RagStore` type. From
  `retrieval.js`: `createRetrieval`, `createLexicalEmbedder`,
  `createLexicalIndex`, + the `RetrievalEngine` type. From `vector-boot.ts`:
  the `VectorBootController` TYPE only (U-H2 carries the existing controller,
  never constructs one). It does NOT import `buildRagStoreDirectory` (the
  rebuild is non-default-only and lexical, so the full boot constructor —
  incl. the default vector branch — is not reused; U-H2's rebuild reuses only
  the per-store primitive constructors). It does NOT import any
  `remove`/`rm`/`teardown`/`close` primitive (no teardown — U-H5).
- **Purity/discipline:** the controller holds mutable runtime state (its live
  directory + current loaded registry) — this is inherently stateful; the
  CONSTRUCTOR is side-effect-free (no fs, no rebuild, no log). `hotApply` is
  the ONLY mutating method. `currentStores()` returns a FRESH array slice
  (never a live reference). The module emits ZERO `console.*` output (failures
  are thrown; the wiring decides how to surface them — the write module's
  fail-loud discipline extends to the controller).
- The header comment cites this spec (`docs/specs/unit-h2-runtime-controller.md`
  §5), the review (§2 D1/D2/D3/D4/D7/D8 + A-P2-1/A-P2-3/A-P2-8), and the §4
  decision rows.

### 5.2 U-H2a — exported types (exact TS shapes)

```ts
// src/main/rag-store-runtime.ts — Unit U-H2a: the runtime controller.

import type { RagStoreDirectory, RagStoreEntry } from './rag-store-directory.js'
import type { LoadedRagStoreRegistry } from './rag-store-registry.js'
import type { RegistryMutation } from './rag-store-registry-write.js'
import type { VectorBootController } from './vector-boot.js'
import type { EmbeddingProvider } from './embeddings.js'
import type { RagStore } from './rag-store.js'
import type { RetrievalEngine } from './retrieval.js'
import type { ResolvedRagStore } from './rag-store-registry.js'

/** The controller's construction inputs. The directory/default/vectorBoot are
 *  the EXACT objects `buildRagStoreDirectory` produced at boot (their identity
 *  is preserved — NO-OP byte-equal). `provider`/`embedderKind`/`userDataPath`
 *  DEFINE the rebuild environment for the later units (U-H3/H4/H6/H7); U-H2's
 *  reachable mutations rebuild only NON-default lexical entries and do not
 *  consume `provider` (documented — the default vector branch is never
 *  rebuilt in U-H2). */
export interface RagStoreRuntimeOptions {
  /** The boot-loaded registry (U-MS1's `LoadedRagStoreRegistry`); the
   *  controller's INITIAL "current" registry, replaced by the fresh `loaded`
   *  on each successful `hotApply`. */
  registry: LoadedRagStoreRegistry
  /** The boot-constructed directory (U-MS2). MUTATED IN PLACE on apply — the
   *  SAME object identity is kept, so every captured `entries` reference sees
   *  updates without re-pointing (D1). */
  directory: RagStoreDirectory
  /** The stable default entry: `directory.entries.get(directory.defaultName)`.
   *  Required — the default never changes in U-H2's reachable set. */
  defaultEntry: RagStoreEntry
  /** At most ONE boot vector controller (the default store's, A6) — carried
   *  across, never rebuilt/started by U-H2. */
  vectorBoot: VectorBootController | null
  /** The registry file path — `writeRegistryMutation`'s `path` (D2). */
  registryPath: string
  userDataPath: string
  embedderKind: 'lexical' | 'vector'
  provider: EmbeddingProvider | null
}

/** The successful hot-apply result — the controller applies the live-directory
 *  rebuild and returns the fresh registry + the delta (threaded for
 *  U-H3/U-H4/U-H6). */
export interface HotApplyResult {
  /** The FRESH `loaded` registry just written + re-read by
   *  `writeRegistryMutation` (D2 persisted-and-live round-trip). */
  loaded: LoadedRagStoreRegistry
  /** The applied structural delta (exactly ONE non-empty member, U-H1). */
  delta: RegistryDelta
}

/** The controller instance returned by `createRagStoreRuntimeController`. */
export interface RagStoreRuntimeController {
  /** The SAME directory object the controller was built with — mutated
   *  in place on apply. Consumers read `entries`/`defaultName` per call. */
  getDirectory(): RagStoreDirectory
  /** The stable default entry (guaranteed present; never rebuilt in U-H2). */
  getDefaultEntry(): RagStoreEntry
  getDefaultName(): string
  /** The stable default store/engine (carried across; byte-equal). */
  getDefaultStore(): RagStore
  getDefaultEngine(): RetrievalEngine
  getVectorBoot(): VectorBootController | null
  getRegistryPath(): string
  /** A FRESH slice of the CURRENT registry's RESOLVED stores (the A-P2-3
   *  refresh-on-apply projection source; boot → the fresh `loaded` after
   *  an apply). Never a live reference (mutating the slice cannot affect the
   *  controller). */
  currentStores(): ResolvedRagStore[]
  /** The per-store load status over the CURRENT live entries (the
   *  `storeLoadStatus` D7 matrix). */
  statusOf(name: string): 'loaded' | 'failed-corrupt' | 'failed-missing'
  /** THE single runtime trigger (D6: no MCP tool, no new IPC channel). */
  hotApply(mutation: RegistryMutation): HotApplyResult
}
```

### 5.3 U-H2a — the factory (exact signature)

```ts
/** Constructions: validates the inputs FAIL-LOUD (R-* guards), stores the
 *  boot directory/default/vectorBoot/registryPath/env, and performs NO
 *  rebuild/fs/read/log side effect (NO-OP byte-equal — §4). */
export function createRagStoreRuntimeController(
  opts: RagStoreRuntimeOptions,
): RagStoreRuntimeController
```

### 5.4 U-H2a — behavior (pinned)

#### `createRagStoreRuntimeController(opts)`

1. **Guards (each fail-loud, byte-pinned R-*):**
   - `opts` null/not-an-object → **R-options** `rag-store-runtime: options required`.
   - `opts.registryPath` not a non-empty string → **R-path**
     `rag-store-runtime: registryPath required`.
   - `opts.directory` null / not an object, or `opts.directory.entries` not a
     `Map`, or `opts.directory.defaultName` not a non-empty string →
     **R-directory** `rag-store-runtime: directory required`.
   - `opts.defaultEntry` null / not an object → **R-default-entry**
     `rag-store-runtime: default entry required`.
   - Cross-check: `opts.defaultEntry.name !== opts.directory.defaultName` OR
     `opts.directory.entries.get(opts.directory.defaultName) !==
     opts.defaultEntry` → **R-default-mismatch**
     `rag-store-runtime: default entry does not match the directory default`.
   - `opts.embedderKind` neither `'lexical'` nor `'vector'` → **R-embedder**
     `rag-store-runtime: embedderKind must be 'lexical' or 'vector'`.
   - `opts.registry` null / not an object, or
     `opts.registry.defaultStoreName !== opts.directory.defaultName` →
     **R-registry-default**
     `rag-store-runtime: registry default does not match the directory default`.
2. **Store** the inputs: the controller keeps the SAME `directory` object, the
   SAME `defaultEntry` object, the SAME `vectorBoot`, `registryPath`, the env
   fields, and `_currentRegistry = opts.registry`. Set up the LIVE map as the
   directory's `entries` map (the underlying `Map`).
3. **NO side effect** — return the controller. Construction is byte-equal to
   today's boot (the same directory/entries/default serve exactly as before).

#### The controller accessors

- `getDirectory()` returns `_directory` (the SAME object identity — mutations
  are in place, so captures see updates).
- `getDefaultEntry()`/`getDefaultStore()`/`getDefaultEngine()` return the
  STABLE default entry / its `.store` / `.engine` — byte-equal across every
  reachable apply (the default never changes).
- `getDefaultName()` returns `_directory.defaultName` (stable).
- `getVectorBoot()` returns `_vectorBoot` (carried across, never rebuilt).
- `getRegistryPath()` returns `_registryPath` (verbatim).
- `currentStores()` returns `[..._currentRegistry.stores]` (a FRESH array of
  the same resolved store objects — the caller may mutate the array but not
  the controller; the store objects themselves are treated read-only).
- `statusOf(name)`: `const e = _directory.entries.get(name); if (!e) throw
  **R-status-unknown** `` rag-store-runtime: unknown store '<name>' ``; return
  `storeLoadStatus(e)` (the U-MS2 D7 matrix: missing ⇒ `failed-missing`, else
  corrupt ⇒ `failed-corrupt`, else `loaded`).

#### `hotApply(mutation)`

1. **Guard (mutation):** `mutation` must be a non-null object whose `kind` is
   exactly one of `'add'`/`'remove'`/`'rename'` — else throw **R-mutation**
   `rag-store-runtime: mutation required` / **R-kind**
   `` rag-store-runtime: unknown mutation kind '<json>' `` (the `<json>` value
   renders a STRING kind VERBATIM, single-quoted — `unknown mutation kind 'delete'`
   — a bare string interpolation consistent with the module's `'<id>'`/
   `'<from>'` message shapes, NOT the loader's JSON double-quote render; only a
   NON-STRING kind uses the loader's TOTAL + CAPPED `jsonOf` discipline, §5.5).
2. **D4 no-ids caller precondition (rename only):** if
   `mutation.kind === 'rename'`, inspect the CURRENT store
   (`_directory.entries.get(mutation.from)` — a MISSING `from` ⇒ let
   `writeRegistryMutation` throw W-rename-unknown-from); enumerate its node
   ids via `store.listNodes()`; if ANY node id starts with
   `` `${mutation.from}:` `` → throw **R-rename-ids-present**
   `` rag-store-runtime: cannot rename store '<from>' — it has persisted '<from>:'-prefixed ids ``.
   This runs BEFORE `writeRegistryMutation` — a declined rename never reaches
   the disk (D4/U-H1 §5.3.2).
3. **Write (the ONLY disk touch — D2):** `const { loaded, delta } =
   writeRegistryMutation({ path: _registryPath, mutation })`. ANY throw here
   (the write module's W-* set, the loader's F-set, or the native fs set —
   per U-H1 §5.5) **PROPAGATES unchanged** and the live directory is UNTOUCHED
   (U-H1's atomic persist left the original file + the live state intact).
4. **Default-stability defensive check (HOST-1):** if the on-disk default is
   no longer STABLE after the write — `loaded.defaultStoreName !==
   _directory.defaultName` (**R-default-changed**
   `rag-store-runtime: default store changed by a hot-apply (default reassignment is a separate unit)`),
   OR the loaded default's `persistenceFile` differs from the carried boot
   default (**R-default-mismatch2**
   `rag-store-runtime: default entry drifted from the loaded registry`) — the
   live directory is SYNCHRONIZED to the freshly-loaded `loaded` projection
   (the newly-defaulted store rebuilt as a lexical entry,
   `directory.defaultName` following `loaded.defaultStoreName`) BEFORE the
   byte-pinned throw, so D2 (persisted-and-live never diverge) holds EVEN in the
   throw path. **ORDERING NOTE:** this runs AFTER the write (the default change
   is only observable from `loaded`); it is UNREACHABLE via the U-H1 write
   module alone (W-rename-default + F12 no-remove-default/no-second-default) and
   is reached only through an EXTERNAL mid-run registry default edit that the
   re-read picks up (H9). This sync-before-throw is the ONLY throwing path on
   which `hotApply` mutates the live Map, and it is a deliberate FULL sync
   (never a partial apply). U-H7 owns default reassignment.
5. **REBUILD the non-default entries (construct-fully-then-insert, D7):**
   - Build a STAGING `Map<string, RagStoreEntry>`:
     for each `loaded.stores` entry EXCEPT `loaded.defaultStoreName`:
     `createJsonRagStore({ path: s.persistenceFile })` then the LEXICAL engine
     `createRetrieval(store, createLexicalEmbedder(createLexicalIndex(store.listNodes())))`
     (A6 — non-default stores are ALWAYS lexical, byte-equal to
     `buildRagStoreDirectory` rule 2, `rag-store-directory.ts:246`); build the
     entry `{ name: s.name, store, engine, corrupt: store.status().corrupt,
     missing: !existsSync(s.persistenceFile) }` and `if (s.corpusRoot !==
     undefined) entry.corpusRoot = s.corpusRoot`; set it in the staging map
     keyed by `s.name`. A MISSING default in `loaded.stores` — impossible via
     U-H1 (F12) — would trip the loaded-default mismatch guard (defensive throw, `R-default-mismatch2`,
      §5.7 F16) during the default-entry carry; it is NOT the `R-kind` mutation-kind
      guard (§5.7 F8).
   - The DEFAULT entry: carry `_defaultEntry` (its `name`/`persistenceFile`
     must match the `loaded` default — defensive assert; a mismatch → throw
     **R-default-mismatch2** `rag-store-runtime: default entry drifted from the loaded registry`).
     NOT rebuilt, NOT re-warmed.
   - If ANY construct throws → the throw PROPAGATES and the live Map is NOT
     mutated (the staging swap never happens). Unreachable-by-construction for
     a loader-validated registry (§3); pinned to keep D2 honest (§4
     ATOMIC-APPLY).
6. **Swap (ONE synchronous pass into the live Map):** clear every non-default
   key from the live map, then insert all staging entries (default-first for
   canonical order is not required; the live map ends with the default entry
   preserved + the fresh non-defaults in `loaded.stores` array order). Set
   `_currentRegistry = loaded`. `defaultName` unchanged.
7. **Return `{ loaded, delta }`.** The `delta` is threaded (U-H3/H4/H6 consume
   it to later substitute incremental teardown-aware applies).

**Determinism/correctness:** for the SAME current disk state + SAME mutation,
`hotApply` returns the same `loaded` (deep-equal from U-H1's
`writeRegistryMutation`) and produces the same live-map contents (deep-equal
entries, mod object identity). A FAILED `hotApply` leaves the live directory
and the disk EXACTLY as before the call (the write module's atomicity + the
staging-before-swap) — with ONE deliberate exception: the F15/F16 default-drift
throw path, where by design (HOST-1) the live directory is SYNCHRONIZED to the
freshly-written `loaded` before the throw so the on-disk projection is never
left invisible live.

### 5.5 The byte-pinned error set + the message census

**Message conventions.** The controller's OWN messages use the prefix
`rag-store-runtime:`. Messages that PROPAGATE from `writeRegistryMutation` reuse
the write module's exact strings (W-path, W-configs, W-mutation, W-kind,
W-add-store, W-remove-arg/W-rename-arg, W-add-existing, W-remove-unknown,
W-rename-unknown-from, W-rename-target-exists, W-rename-default, W-unreadable —
U-H1 §5.5) plus the loading loader F-set (F1–F14, G-load, G-dir) plus the
native fs set. The `R-kind` interpolated value `<json>` renders a STRING kind
**VERBATIM, single-quoted** — `unknown mutation kind 'delete'` — a bare string
interpolation consistent with the module's `'<id>'`/`'<from>'` message shapes,
NOT a JSON double-quote render. Only a NON-STRING kind value uses the loader's
TOTAL + CAPPED renderer (the write module's `jsonOf` JSON.stringify discipline,
capped at 200 chars) — the module's `kindOf` helper (§2's header comment). The
`R-kind` message therefore uses SINGLE quotes around the rendered value, not the
loader's double-quote JSON form.

| # | Trigger | Exact `Error` message |
| --- | --- | --- |
| R-options | `createRagStoreRuntimeController` with a null/not-object `opts` | `rag-store-runtime: options required` |
| R-path | `opts.registryPath` not a non-empty string | `rag-store-runtime: registryPath required` |
| R-directory | `opts.directory` null/not-an-object / entries not a `Map` / defaultName not a non-empty string | `rag-store-runtime: directory required` |
| R-default-entry | `opts.defaultEntry` null/not-an-object | `rag-store-runtime: default entry required` |
| R-default-mismatch | `defaultEntry.name !== directory.defaultName` OR `directory.entries.get(defaultName) !== defaultEntry` | `rag-store-runtime: default entry does not match the directory default` |
| R-registry-default | `registry.defaultStoreName !== directory.defaultName` | `rag-store-runtime: registry default does not match the directory default` |
| R-embedder | `opts.embedderKind` neither `'lexical'` nor `'vector'` | `rag-store-runtime: embedderKind must be 'lexical' or 'vector'` |
| R-mutation | `hotApply` with a null/not-object `mutation` | `rag-store-runtime: mutation required` |
| R-kind | a `mutation.kind` outside `'add'`/`'remove'`/`'rename'` | `rag-store-runtime: unknown mutation kind '<json>'` (the `<json>` renders a string kind VERBATIM, single-quoted — `'delete'`; a non-string kind renders via the loader's capped JSON `jsonOf`) |
| R-rename-ids-present | rename a store whose CURRENT node ids include `<from>:`-prefixed ids (D4 caller precondition — before any write) | `rag-store-runtime: cannot rename store '<from>' — it has persisted '<from>:'-prefixed ids` |
| R-default-changed | `loaded.defaultStoreName !== directory.defaultName` after a write (defensive; reached only via an external mid-run registry default edit) | `rag-store-runtime: default store changed by a hot-apply (default reassignment is a separate unit)` — the live directory is SYNCHRONIZED to `loaded` BEFORE the throw (HOST-1) |
| R-default-mismatch2 | the carried default entry's `name`/`persistenceFile` ≠ the `loaded` default (defensive; external edit) | `rag-store-runtime: default entry drifted from the loaded registry` — the live directory is SYNCHRONIZED to `loaded` BEFORE the throw (HOST-1) |
| R-status-unknown | `statusOf(name)` with no directory entry | `rag-store-runtime: unknown store '<name>'` |
| R-construct | a non-default construct throws during the staging rebuild | the underlying (native/constructor) Error PROPAGATES; the live Map is NOT mutated |
| (write/loader/fs) | `writeRegistryMutation` fails | the write-module W-* / loader F-* / native fs Error PROPAGATES unchanged; live untouched |

**Message census:** the module's ONLY log output is **0** — no `console.log`,
no `console.warn`, no `console.error` (failures are thrown, never logged — the
wiring decides how to surface them). **Thrown-Error family:** 13
controller-pinned message templates (R-options, R-path, R-directory,
R-default-entry, R-default-mismatch, R-registry-default, R-embedder, R-mutation,
R-kind, R-rename-ids-present, R-default-changed, R-default-mismatch2,
R-status-unknown) + the R-construct propagation + the propagated write/loader/
fs sets. **Exported surface:** 1 factory + 1 exported interface
(`RagStoreRuntimeController`) + 2 other exported types (`RagStoreRuntimeOptions`,
`HotApplyResult`); the controller's 10 methods are not separately exported.

### 5.6 U-H2a happy-path states (TestWriter red set — valid paths)

`<d>` is an absolute temp dir; `<d>/provident-rag-stores.json` the registry
path. A controller is constructed over a boot directory from a 2-store registry
(`main` default + `research-2026-09` non-default), each on a derived persistence
file.

1. **H1 — NO-OP construction is byte-equal:** `createRagStoreRuntimeController({...})`
   returns a controller whose `getDirectory() === <the passed directory object
   identity>`; `getDefaultEntry() === defaultEntry`; `getDefaultName() ===
   'main'`; `getDefaultStore()/getDefaultEngine()` are the default entry's
   objects; `getVectorBoot()` is the passed controller; NO file was created/
   touched in `<d>` and NO log line was emitted (the byte-equal boot claim).
2. **H2 — getDirectory is the SAME live object:** `getDirectory().entries`
   shares identity with the passed directory's `entries` map; mutating the
   controller via a hotApply is observable through BOTH references without
   re-pointing.
3. **H3 — hotAdd applies + persists + reloads (D2):**
   `hotApply({ kind:'add', store:{ name:'research-2026-10' } })` → the write
   `loaded.stores` = main + research-2026-09 + research-2026-10 (order
   preserved), `delta = { added:['research-2026-10'], removed:[], renamed:[] }`;
   `getDirectory().entries` now has the 3 stores; the new entry's `store`/
   `engine` are fresh objects; `statusOf('research-2026-10')` resolves; the
   DEFAULT entry (`main`) object identity is UNCHANGED (`getDefaultStore()`
   returns the SAME object as before — H5/H6).
4. **H4 — hotRemove orphans the non-default (D3):**
   `hotApply({ kind:'remove', name:'research-2026-09' })` → `delta.removed =
   ['research-2026-09']`; `getDirectory().entries` no longer has it; the
   store's persistence file + journal on disk are UNTOUCHED (byte-compare
   before/after — the U-H1 write module's structural no-remove pin + U-H2
   never touches a store file); the default entry unchanged.
5. **H5 — default survives every reachable apply (byte-equal default path):**
   after an add, a remove, and a rename of NON-default stores in sequence,
   `getDefaultName()` is still `'main'`, `getDefaultStore()`/`getDefaultEngine()`
   are the SAME object identities, `getVectorBoot()` is the SAME controller,
   and the default entry is a `'loaded'` store whose nodes/edges are unchanged.
6. **H6 — hotRename rebuilds the non-default under the new name:**
   `hotApply({ kind:'rename', from:'research-2026-09', to:'research-2026-10' })`
   (the store has NO `research-2026-09:`-prefixed ids) → `delta.renamed = [{
   from:'research-2026-09', to:'research-2026-10' }]`; `getDirectory().entries`
   has `research-2026-10` (a REBUILT fresh store on the NEW derived
   persistenceFile) and NOT `research-2026-09`; the renamed store's
   `default:false` is preserved; the default untouched.
7. **H7 — currentStores reflects the current registry (A-P2-3 source):** after
   an `hotApply`, `currentStores()` returns the fresh `loaded.stores` slice; it
   is a NEW array each call (mutating it does not affect the controller); the
   non-default entry's `name`/`default`/`persistenceFile`/`corpusRoot` match.
8. **H8 — statusOf matrix:** `statusOf` returns `'loaded'` for an entry with a
   present persistence file + clean store, `'failed-missing'` for an absent
   file (first-run), `'failed-corrupt'` for a corrupt store — the storeLoadStatus
   D7 matrix over the live entries.
9. **H9 — writeRegistryMutation's re-read drives the live state (D2):** an
   external tool editing the registry file is NOT observed until a `hotApply`
   (D8: the boot path + the idle runtime re-read nothing); a `hotApply`
   re-reads the CURRENT disk state and applies it (persisted-and-live never
   diverge).
10. **H10 — HotApplyResult shape:** `hotApply` returns `{ loaded, delta }` where
    `loaded` has `implicit:false`/`corrupt:false` (a valid just-written file)
    and `delta` has exactly ONE non-empty member.
11. **H11 — failed write leaves the live state + disk untouched (R1/D2):** a
    `hotApply` that fails (write-module throw) leaves `getDirectory().entries`
    deep-equal to before AND the registry file byte-identical (U-H1's atomic
    persist).
12. **H12 — determinism / no-live-mutation-of-inputs:** two `hotApply` calls in
    sequence with equivalent mutations return equivalent `loaded`/`delta`; the
    mutation argument object is never mutated by the controller.

### 5.7 U-H2a fail-states (TestWriter red set — documented fail-states)

Outcomes: **fail-loud** = the pinned `Error`/propagated Error; **live-untouched**
= `getDirectory().entries` deep-equal to before + the registry file byte-identical.
`<d>` = an absolute temp dir.

| # | Trigger | Outcome | Exact result |
| --- | --- | --- | --- |
| F1 | `createRagStoreRuntimeController(null)` / `(5)` / `('x')` | fail-loud | R-options |
| F2 | `createRagStoreRuntimeController({ ... })` with `registryPath:''`/missing | fail-loud | R-path |
| F3 | `createRagStoreRuntimeController({ ... })` with a null/array `directory`, a non-Map `entries`, or an empty `defaultName` | fail-loud | R-directory |
| F4 | `createRagStoreRuntimeController({ ... })` with a null `defaultEntry` | fail-loud | R-default-entry |
| F5 | construction whose `defaultEntry.name` ≠ `directory.defaultName`, or a directory whose defaultKey is absent / maps elsewhere | fail-loud | R-default-mismatch |
| F6 | construction whose `registry.defaultStoreName` ≠ `directory.defaultName` | fail-loud | R-registry-default |
| F7 | construction with `embedderKind:'hybrid'` (or any non-union value) | fail-loud | R-embedder — the §5.5 census FIXED string `rag-store-runtime: embedderKind must be 'lexical' or 'vector'` (NO `<json>` interpolation; the `<json>`/capped rendering belongs to R-kind, §5.5) |
| F8 | `hotApply(null)` / `hotApply({ kind:'delete' })` | fail-loud | R-mutation / R-kind; live-untouched |
| F9 | `hotApply({ kind:'rename', from:'main', to:'x' })` (the DEFAULT store — U-H1 rejects first) | fail-loud | the write module's **W-rename-default** PROPAGATES; live-untouched; disk untouched |
| F10 | `hotApply({ kind:'rename', from:'research-2026-09', to:'z' })` where the CURRENT store's nodes include `research-2026-09:`-prefixed ids (D4 caller precondition) | fail-loud | R-rename-ids-present; DISK NOT WRITTEN (byte-compare the registry file — unchanged); live-untouched; the write module was NEVER called |
| F11 | `hotApply({ kind:'remove', name:'nope' })` (unknown) | fail-loud | the write module's **W-remove-unknown** PROPAGATES; live-untouched; disk untouched |
| F12 | `hotApply({ kind:'add', store:{ name:'research-2026-09' } })` (already present) | fail-loud | W-add-existing PROPAGATES; live-untouched; disk untouched |
| F13 | `hotApply` on a CORRUPT/absent-with-broken-file registry path | fail-loud | W-unreadable PROPAGATES; live-untouched; disk untouched |
| F14 | `hotApply` whose persist hits a native fs failure (ENOSPC/EACCES/EROFS) | fail-loud | the native fs Error PROPAGATES (throw path pinned, message native); live-untouched; the ORIGINAL file intact (R1) |
| F15 | `hotApply` whose `loaded.defaultStoreName` differs (defensive; reachable only via an EXTERNAL mid-run registry default edit that the re-read picks up) | fail-loud | **R-default-changed**; the live directory is SYNCHRONIZED to the freshly-written `loaded` default (persisted==live) BEFORE the throw (HOST-1 — D2 preserved even in the throw path) |
| F16 | the carried default entry's `name`/`persistenceFile` drifts from the `loaded` default (defensive; external edit) | fail-loud | **R-default-mismatch2**; the live directory is SYNCHRONIZED to the fresh `loaded` (persisted==live) BEFORE the throw (HOST-1 — D2 preserved) |
| F17 | a non-default construct throws during the staging rebuild | fail-loud | R-construct (the underlying Error PROPAGATES); the live Map is NOT mutated (staging never swapped) |
| F18 | `statusOf('gone')` (an entry removed by an apply or never present) | fail-loud | R-status-unknown `` rag-store-runtime: unknown store 'gone' `` |

**Negative pin (D6, grep-level):** the module defines NO MCP tool and NO IPC
channel — nothing is added to `RpcMethod`, `security.ts`'s tool→group map,
`ALL_TOOLS`, `MUTATING_METHODS`, or the IPC-constant census; the module imports
no `shared/types` constant. **Negative pin (A-P2-8):** the module defines NO
`teardown()`/`close()`/`destroy()` primitive and imports none — a non-default
rebuild ORPHANS, never tears down (U-H5). **Negative pin (imports):** no
`electron` import; no `remove`/`unlink`/`rm`/`rmdir` primitive (the D3 orphan
guarantee is preserved — U-H2 never deletes a store file).

### 5.8 U-H2b — the closure rewiring contract (`main.ts` + `mcp-server.ts`)

> **⚠ LANDED (U-H2b, 2026-09-08).** This section + §5.9 describe the landed
> U-H2b closure-rewiring contract; the bind sites (B1–B13 / M1–M4) ARE
> implemented in the current build (`src/main/main.ts` +
> `src/main/mcp-server.ts`), green via `tests/unit-h2-runtime-controller.test.ts`
> (14/14 + 4 pins). `src/main/rag-store-runtime.ts` (the U-H2a module, §5.1–§5.7)
> is LANDED, 38/38. The anchor line numbers below reflect the CURRENT build
> (reconciled in the per-unit doc-review, 2026-09-08).

**U-H2b scope:** rewire every const-captured default/directory closure +
the server options to read the runtime's accessors per call (A-P2-1),
and rewire `IPC_RAG_STORE_LISTING` to read the runtime's current projection
(A-P2-3 refresh-on-apply). The default is STABLE, so every accessor returns the
SAME objects today — the rewiring is structurally correct (byte-equal) and
future-proof for U-H7. The legacy directory-less / single-store paths stay
byte-equal (the runtime is an ADDITIVE seam).

**The injected seam.** `main.ts` constructs the controller ONCE at boot around
the boot plan:

```ts
// main.ts — after buildRagStoreDirectory (the existing boot); registryPath =
// join(app.getPath('userData'), 'provident-rag-stores.json').
const runtime = createRagStoreRuntimeController({
  registry,                            // the boot-loaded LoadedRagStoreRegistry
  directory: plan.directory,           // the SAME boot directory object
  defaultEntry: plan.directory.entries.get(plan.defaultName)!,
  vectorBoot: plan.vectorBoot,
  registryPath,
  userDataPath: app.getPath('userData'),
  embedderKind,
  provider,
})
```

`plan.directory` MAY be kept for the existing boot construction but every live
closure thereafter reads `runtime.getDirectory()`. The `defaultName`/`plan`
locals read by live closures are replaced by `runtime.getDefaultName()`. `ragStore`/
`retrievalEngine` live closures read `runtime.getDefaultStore()`/
`runtime.getDefaultEngine()`. `vectorBoot` reads `runtime.getVectorBoot()`.

**The main.ts bind sites to rewire (census = 13, each with its source anchor):**

| # | Site (today) | Rewire to |
| --- | --- | --- |
| B1 | `ProvidentMcpServer` options — `ragStore`, `retrievalEngine`, `ragStores: plan.directory` (`main.ts:219`) | `ragStore: runtime.getDefaultStore()`, `retrievalEngine: runtime.getDefaultEngine()`, `ragStores: runtime.getDirectory()` + the NEW `runtime` option (M1) |
| B2 | `IPC_EDIT_COMMIT` — `handleEditCommit(ragStore, …)` (`main.ts:282`) | `runtime.getDefaultStore()` |
| B3 | `IPC_EDIT_COMMIT` reconcile `retrievalEngine.onStoreChanged` (`main.ts:291`) | `runtime.getDefaultEngine()` |
| B4 | `IPC_EDIT_COMMIT` broadcast `plan.defaultName` (`main.ts:294`) | `runtime.getDefaultName()` |
| B5 | `IPC_EDIT_BATCH` — `ragStore.getNode`/`handleEditBatch(ragStore, …)` (`main.ts:316,320`) | `runtime.getDefaultStore()` |
| B6 | `IPC_EDIT_BATCH` reconcile `retrievalEngine` (`main.ts:329`) | `runtime.getDefaultEngine()` |
| B7 | `IPC_EDIT_BATCH` broadcast `plan.defaultName` (`main.ts:332`) | `runtime.getDefaultName()` |
| B8 | `IPC_EDIT_RICH_COMMIT` — `handleRichCommitIpc(ragStore, …)` + `retrievalEngine` reconcile + `plan.defaultName` broadcast (`main.ts:353-357`) | `runtime.getDefaultStore()`/`getDefaultEngine()`/`getDefaultName()` |
| B9 | `IPC_RAG_QUERY` — `handleRagQueryIpc(retrievalEngine, ragStore, …, plan.directory, …)` (`main.ts:370`) | `runtime.getDefaultEngine()`, `runtime.getDefaultStore()`, `runtime.getDirectory()` |
| B10 | `IPC_RAG_BACKLINKS` — `handleRagBacklinksIpc(ragStore, …)` (`main.ts:378`) | `runtime.getDefaultStore()` |
| B11 | `IPC_RAG_DOC_HEADS` — `handleRagDocHeadsIpc(ragStore)` (`main.ts:387`) | `runtime.getDefaultStore()` |
| B12 | `IPC_RAG_STORE_LISTING` — reads `registry.stores` (boot) + `plan.directory.entries`/`plan.directory` (`main.ts:401-419`) | A-P2-3: read `runtime.currentStores()` for the projection + `runtime.statusOf(name)` for the status resolver (the `listingEntries` map becomes `runtime.currentStores().map(s => ({ name: s.name, default: s.default, persistenceFile: basename(s.persistenceFile), corpusRoot: s.corpusRoot ?? null }))`) |
| B13 | `IPC_RAG_SNAPSHOT` — `ragStore.listNodes()`/`listEdges()` + `plan.defaultName` (`main.ts:462-466`) | `runtime.getDefaultStore()` + `runtime.getDefaultName()` |

**The mcp-server.ts changes (A-P2-1):**

- **M1 — the server gains a runtime seam:** `McpServerOptions` gains
  `runtime?: RagStoreRuntimeController`. The server stores it
  (`this.runtime`). When set, the tool registration + the shared-handler calls
  resolve the default store/engine/directory PER CALL from the runtime; when
  absent, the const-captured `ragStore`/`retrievalEngine`/`ragStores` fallback
  serves byte-equal (the legacy/single-store path, `tests/embeddings-adversarial.test.ts:104`).
- **M2 — `registerTools` threads the runtime:** the static
  `registerTools(… ragStore, engine, templateStore, gate, ragStores, auditLog)`
  (`mcp-server.ts:1383-1397`) gains a trailing `runtime` param (optional). Both
  its call sites (`applyGatePatch`:1231 and `createServer`:1375) forward
  `this.runtime`.
- **M3 — the `rag.*` handler closure** (`mcp-server.ts:1592`) reads per call:
  `handleRagTool(runtime ? runtime.getDefaultStore() : ragStore, name, args,
  runtime ? runtime.getDefaultEngine() : engine, runtime ? runtime.getDirectory() :
  ragStores, auditLog)`.
- **M4 — the `edit.*` reconcile closure** (`mcp-server.ts:1606-1620`) reads per
  call: the directory is `runtime ? runtime.getDirectory() : ragStores` and the
  reconcile engine is that directory's `entries.get(storeName)?.engine`
  (`runtime.getDirectory().entries.get(storeName)?.engine` when the runtime is
  set) — the ENGINE-PER-STORE per-call routing is preserved.

**The refresh-on-apply (A-P2-3):** the `IPC_RAG_STORE_LISTING` closure (B12)
is the mechanical refresh landing. No new IPC channel; a renderer pull after an
apply shows the current state. The `sidebar-panes.ts` listing nodes are
UNTOUCHED by U-H2 (U-MS5's surface; the operator editor is U-H8).

**Negative pins for U-H2b (grep-level):** (a) no new MCP tool name in
`ALL_TOOLS` (`mcp-server.ts:1099-1150` — the census stays at its pre-H2 set of 41),
no new `security.ts` tool→group row, no `RpcMethod` member, no
`MUTATING_METHODS` member, no renderer method switch change (D6); (b) the
boot loader path still reads the registry EXACTLY ONCE per boot — there is NO
re-read/refresh call added to boot or to any idle path (D8); (c) `main.ts` and
`mcp-server.ts` make NO teardown call (U-H5/A-P2-8); (d) the default-serving
path is byte-equal (the accessors return the boot default objects).

### 5.9 Unit → file → test-file mapping + the red-set expectation

> **U-H2b is LANDED (2026-09-08).** The U-H2a row (module
> `src/main/rag-store-runtime.ts`, 38/38) is LANDED; the U-H2b row
> (main.ts/mcp-server.ts, B1–B13/M1–M4) is LANDED — its red-set expectation
> below (14 red) flipped to **14 green + 4 negative pins** in
> `tests/unit-h2-runtime-controller.test.ts`.

| Unit | File | Test file | Red-set expectation (RCA-1) |
| --- | --- | --- | --- |
| **U-H2a** (this spec) | NEW `src/main/rag-store-runtime.ts` (runtime controller + mutable live directory + `hotApply`) | `tests/unit-h2-runtime-controller.test.ts` (SpecWriter-pinned; U-H2a's §5.3–§5.7 red set) | Suite fails to LOAD — the module/controller does not exist (the red set asserts `import { createRagStoreRuntimeController } from '../src/main/rag-store-runtime.js'` throws before ANY test body runs). The §5.6 H1–H12 + §5.7 F1–F18 test bodies are authored in the same pass and each FAIL on the missing module. |
| **U-H2b** (this spec) | `src/main/main.ts` (rewire B1–B13) + `src/main/mcp-server.ts` (M1–M4) | `tests/unit-h2-runtime-controller.test.ts` (§5.8 seams, node-tested) + grep/structure scans of `main.ts`/`mcp-server.ts` | U-H2b's red set ran AFTER U-H2a green. The node-testable seams (M1–M4 — `registerTools` threading a runtime, the `rag.*`/`edit.*` closures resolving via `runtime`) FAILED on the pre-H2 wiring (the runtime param did not exist); the `main.ts` B1–B13 rewiring (runtime constructed at boot; every listed bind site references `runtime.*`) failed the pre-H2 grep scans. **LANDED: 14 green + 4 negative pins (D6a/D6b/D8/A-P2-8)** in `tests/unit-h2-runtime-controller.test.ts`. |

- **Specifier note:** the §5.6 H-rows + §5.7 F-rows derive the U-H2a red set;
  §5.8's M1–M4 derive the node-testable U-H2b red set; §5.8's B1–B13 derive the
  grep/structure scans of `main.ts` (never unit-tested directly per the MS2
  §6 "this repo tests shared handlers, never main.ts directly" rule).
- **Existing tests that must stay green:** `tests/unit-h1-registry-write.test.ts`
  (49 — the write module's contract is untouched), the full ms1/ms2/ms4/ms3/
  ms5 suites, and the mcp-server/rag-edit suites (the runtime seam is ADDITIVE —
  the legacy const fallback is byte-equal).
- **Supersession (A-P2-3, designated in U-H1 §5.10, mechanically landed
  HERE):** `tests/unit-ms5-settings-listing.test.ts` **Red 18** (happy 15 — the
  "stores() call count stays 1" no-re-fetch pin) and its **fail-state 10** (a
  registry file edited while running ⇒ unchanged until restart) are SUPERSEDED
  by refresh-on-apply: after a hot-apply, the listing reflects the new state.
  The pre-H2 wiring's `STORE-LISTING-BOOT-CACHED` row still governs the IDLE
  runtime (a renderer pull without an apply shows the boot/current state; there
  is still no boot re-read). The U-H2 spec records the re-write shape: the
  ms5 Red 18 is re-based so the fetch count assertion applies to the pre-apply
  boot path, and a NEW U-H2 red row asserts the listing refresh after a direct
  `hotApply` (via the projected `currentStores()`+`statusOf` input, node-tested).
- **Per RCA-2/RCA-5:** U-H2a runs its own TestWriter-red → Implementer-green →
  adversarial → blind-greens → doc-review cycle, THEN U-H2b runs the SAME
  cycle; the trio (`npm test` / `npm run typecheck` / `npm run build`) runs
  after each green. The live-scenario battery stays PARKED.

### 5.10 The supersession row (A-P2-3/D2) — which tests stay green vs which are superseded mechanically

> **⚠ The superseded rows below (Red 18 / fail-state 10) are mechanically landed
> in U-H2b (2026-09-08) — the refresh-on-apply re-wiring of
> `IPC_RAG_STORE_LISTING` (B12) IS landed; the Red-18 re-base applies to the
> pre-apply boot path. The U-H2a module is LANDED; the D8 no-idle-re-read
> holds (the pre-apply boot path still re-reads nothing).**

**STAY GREEN (UNTOUCHED):** `tests/unit-h1-registry-write.test.ts` (49 — U-H1's
contract unchanged), the loader census (`tests/unit-ms1-store-registry.test.ts`
tests 45–46), the ms2/ms4/ms3/ms5 suites, the mcp-server/rag-edit suites (the
legacy const fallback is byte-equal).

**SUPERSEDED (mechanically landed HERE, per U-H1 §5.10 designation):**

- `tests/unit-ms5-settings-listing.test.ts` **Red 18** (happy 15 — the D8
  no-re-fetch pin) is SUPERSEDED by refresh-on-apply (A-P2-3/D2): after a
  registry hot-write lands, the listing is refreshed from the NEW state.
  **Scope-held exactly: U-H2 rewires the `IPC_RAG_STORE_LISTING` closure to
  read `runtime.currentStores()` + `runtime.statusOf`; it does NOT re-author the
  `sidebar-panes.ts` listing nodes (U-MS5's) and does NOT change the
  `reDerive`/`refresh` renderer fetch behavior for the IDLE case.**
- `tests/unit-ms5-settings-listing.test.ts` **fail-state 10** (registry edited
  while running ⇒ unchanged until restart) is superseded for the POST-apply
  case (a pull after an apply shows the fresh state) but the PRE-apply boot
  path (no hotApply) still re-reads nothing (D8 — no idle re-read).

### 5.11 Census / numeric claims

- **New module:** 1 — `src/main/rag-store-runtime.ts` (node-testable; no
  Electron, no IPC/MCP, no teardown).
- **Exported surface:** 1 factory (`createRagStoreRuntimeController`); 3
  exported types (`RagStoreRuntimeOptions`, `HotApplyResult`,
  `RagStoreRuntimeController`); the controller's **10 methods**
  (getDirectory, getDefaultEntry, getDefaultName, getDefaultStore,
  getDefaultEngine, getVectorBoot, getRegistryPath, currentStores, statusOf,
  hotApply).
- **Controller-pinned message templates:** 13 (R-options, R-path, R-directory,
  R-default-entry, R-default-mismatch, R-registry-default, R-embedder,
  R-mutation, R-kind, R-rename-ids-present, R-default-changed,
  R-default-mismatch2, R-status-unknown) + the R-construct propagation +
  the propagated write-module W-* / loader F-* / native fs sets.
- **Log output:** 0 lines (no `console.*` in `rag-store-runtime.ts`).
- **Closure bind sites rewired in `main.ts`:** 13 (B1–B13, §5.8) — NOT 14/12;
  doc-review (RCA-6) catches drift against the table. **LANDED (U-H2b,
  2026-09-08).**
- **mcp-server.ts changes:** 1 new server option (`runtime?`), 1 stored field,
  2 `registerTools` call-site forwards, 1 signature change, 2 handler-closure
  resolution changes (M1–M4). **LANDED (U-H2b, 2026-09-08).**
- **Disk writes per successful `hotApply`:** exactly ONE registry file write
  (U-H1's temp→fsync→rename) + the step-5 re-load read; ZERO writes to any
  store persistence file or journal; ZERO removals/teardowns.
- **Runtimes re-created per `hotApply`:** N_non-default fresh store/engine
  pairs; the default store/engine/vector-boot are preserved (ZERO rebuilt).
- **Files this unit creates/edits:** LANDED (U-H2a) — `src/main/rag-store-runtime.ts`
  + `tests/unit-h2-runtime-controller.test.ts`; LANDED (U-H2b) —
  `src/main/main.ts` (B1–B13) + `src/main/mcp-server.ts` (M1–M4) + the
  A-P2-3 `IPC_RAG_STORE_LISTING` refresh re-wire (B12). UNTOUCHED: the loader
  `rag-store-registry.ts`, the write module `rag-store-registry-write.ts`
  (U-H1's byte-pinned surface), `rag-store.ts`/`retrieval.ts`/
  `vector-boot.ts`/`rag-store-directory.ts`, `preload.ts`, `shared/types.ts`,
  `sidebar-panes.ts` (U-MS5's listing), `security.ts`. No new MCP tool, no new
  IPC channel (D6). NO page-design change (the operator-UI editor is U-H8) ⇒
  `docs/skills/designing-pages.md` is UNCHANGED by U-H2.
- **Tests landed (U-H2a):** 38 all-green in `tests/unit-h2-runtime-controller.test.ts`
  (the §5.4–§5.7 contract: F1–F14 + F18 + P0 + P1, H1–H12, F15–F17, N1–N2,
  and the four RCA-3 HOST-1a/HOST-1b/HOST-2/HOST-3 regression rows; 0 log,
  typecheck + build clean). The §5.11 original 18–30 estimate is superseded by
  the landed 38. **Tests landed (U-H2b, LANDED 2026-09-08):** **14 green + 4
  negative pins** in the SAME `tests/unit-h2-runtime-controller.test.ts` —
  the M1–M4 node-testable/structural seams (the runtime-threaded `registerTools`
  + the accessor-resolved `rag.*`/`edit.*` closures + the constructor seam) +
  the B0/B1–B13 grep/structure scans of `main.ts` (runtime constructed at boot,
  every bind site `runtime.*`) + the 4 negative pins D6a (ALL_TOOLS stays 41) /
  D6b (no IPC channel) / D8 (loader reads once) / A-P2-8 (no teardown call).
  Full file total: 38 + 14 + 4 = **56 `it()` blocks**. (The A-P2-3 supersession
  re-write of the ms5 Red 18 row + a post-apply listing-refresh red row are
  covered by the B12 scan; the live listing-refresh end-to-end stays a §6
  live-app scenario.)

### 5.12 Cross-references

- **Gate:** `docs/specs/registry-hot-apply-review.md` §2 **D1** (swap seam —
  runtime controller + mutable live directory; `plan.directory` →
  `runtime.directory`), **D2** (write path + supersession),
  **D3** (hot-remove = ORPHAN — U-H2 never deletes a store file),
  **D4** (rename semantics — no-ids half as a U-H2 caller precondition),
  **D7** (mid-flight consistency — add atomic / remove drain-then-teardown /
  rename reject-at-resolution; teardown is U-H5), **D8** (unit decomposition
  + the U-H2a/U-H2b split warning); §5 "Impact on existing contracts"
  (A-P2-1 — MCP/UI equivalence preserved only with the const-closure rewiring);
  §6 (live-scenario PARKED). Binding amendments: **A-P2-1**, **A-P2-3**,
  **A-P2-8**.
- **Write module (consumed):** `docs/specs/unit-h1-registry-write.md` §5.3
  (`writeRegistryMutation` signature), §5.4 (steps + the `loaded` round-trip),
  §5.5 (the W-* message set that PROPAGATES), §5.3.2 (the D4 no-ids
  U-H2-caller-precondition, lines 482–488), §5.10 (the A-P2-3 designation U-H2
  mechanically lands); `src/main/rag-store-registry-write.ts`.
- **Loader contract (the `loaded` shape consumed):** `docs/specs/unit-ms1-store-registry.md`
  §5.2 (`LoadedRagStoreRegistry` — `stores`/`defaultStoreName`/`implicit`/`corrupt`/
  `path`), §5.3.3 (the boot read discipline), §5.4 (the F-* messages);
  `src/main/rag-store-registry.ts`.
- **Directory/wiring (the mutable-live-directory internals):**
  `docs/specs/unit-ms2-store-wiring.md` §5.1 (`RagStoreDirectory`,
  `RagStoreEntry`, `storeLoadStatus`, the F-MS1-15(c) Map-keyed downstream pin),
  §5.4 (boot wiring — `plan.directory` becomes `runtime.directory`), §5.5
  (the per-store reconcile routing U-H2b preserves); `src/main/rag-store-directory.ts`
  (`rag-store-directory.ts:260-264` — the `directory` + rule-2 lexical branch `:246`).
- **Boot wiring anchors (the closure-rewiring surface):** `src/main/main.ts`
  `:129-131` (the ONCE-per-boot loader — D8), `:177-219` (`plan`/
  `defaultEntry`/`vectorBoot`/`registryPath`/`runtime`/`mcp`), `:274-298`
  (IPC_EDIT_COMMIT), `:307-336` (IPC_EDIT_BATCH), `:345-360`
  (IPC_EDIT_RICH_COMMIT), `:369-388` (IPC_RAG_QUERY/BACKLINKS/DOC_HEADS),
  `:401-420` (IPC_RAG_STORE_LISTING), `:462-466` (IPC_RAG_SNAPSHOT). The
  mcp-server closure-capture sites: `mcp-server.ts:1050-1061`
  (the const fields — `ragStore`/`retrievalEngine`/`ragStores`/`runtime`),
  `:1231,:1375` (registerTools forwards), `:1383-1397`
  (the signature), `:1592` (the `rag.*` closure), `:1606-1620` (the `edit.*`
  reconcile closure); the `ALL_TOOLS` census lives at `mcp-server.ts:1099-1150` (41).
- **Sibling hot-apply units (cite-only):** U-H3 (hot-add — the incremental
  teardown-aware ADD), U-H4 (hot-remove — drain-then-teardown, after U-H5),
  U-H5 (teardown primitives — A-P2-8), U-H6 (hot-rename), U-H7 (default
  reassignment — OUT), U-H8 (operator-UI editor — the future `hotApply` caller).
- **Decision rows:** `docs/decisions.md` `REGISTRY-WRITE-MODULE`/`REGISTRY-ATOMIC-WRITE`/
  `REGISTRY-RELOAD-ON-WRITE`/`REGISTRY-WRITE-FAILS-LOUD`/`REGISTRY-DELTA-RETURN`,
  `MULTI-STORE-REGISTRY` + the U-MS1 sub-pins, `SINGLE-WRITER-STORE-PER-STORE`,
  `ENGINE-PER-STORE`, `STORE-LISTING-BOOT-CACHED`/`STORE-LISTING-STATUS-SHARED`
  (amended by refresh-on-apply only after an apply), `UI-SELECTOR-DEFERRED`,
  `MCP-UI-EQUIVALENCE`, `STORE-ID-PREFIX`.
- **Supersession sources:** `tests/unit-ms5-settings-listing.test.ts` Red 18 /
  fail-state 10 (A-P2-3's mechanical half), `docs/specs/unit-h1-registry-write.md`
  §5.10 (the designation), `docs/specs/unit-ms5-settings-listing.md` §5.5
  (the no-re-fetch pin) + §5.9 fail 10.
- **Parked/context doc:** `docs/specs/registry-hot-apply-review.md` §6 (the
  live-scenario PARK — U-H2's live battery is parked by user instruction; a
  live-pending battery is authored later, §6 below).
- **Test file (SpecWriter-pinned):** `tests/unit-h2-runtime-controller.test.ts`.

## 6. The split decision + the live-scenario gate

> **State (2026-09-08): U-H2 is LANDED — BOTH U-H2a (38/38, doc-reviewed) and
> U-H2b (14/14 + 4 pins, doc-reviewed this pass).** The split decision
> below is LANDED (both halves of this ONE spec file are green).

**Split decision (RCA-5 + the review §2 D8 explicit warning): U-H2 is DECLARED
TOO LARGE FOR ONE RED SET and is split into TWO sub-units — U-H2a (the runtime
controller + the mutable live directory, `src/main/rag-store-runtime.ts`,
node-testable) and U-H2b (the closure rewiring, `src/main/main.ts` +
`src/main/mcp-server.ts`) — defined in THIS ONE spec file, each with its own
red set and its own red→green→adversarial→blind-greens→doc-review cycle.** The
TestWriter runs U-H2a's red first (the missing `rag-store-runtime.ts` module —
suite fails to load), reports it, lets the Implementer go green, then runs
U-H2b's red (the `runtime` seam + the accessor-resolved closures + the B1–B13
grep scans). Recording the split HERE is the unambiguous contract the review
D8 warning asked for. **The `TestWriter` derives ONLY U-H2a (from §5.3–§5.7)
in the first cycle and U-H2b (from §5.8–§5.9) in the second — do NOT merge the
two red sets into one run.**

**Live-scenario gate: PARKED (2026-09-08, per the user's instruction — the
registry hot-apply/removal/rename MCP/UI surface cannot be driven live because
a live app session is unavailable).** A **live-pending battery
(`tests/unit-h2-runtime-controller-live-pending-battery.md`**, the 
`unit-ms1`-style doc — the review §6 note) SHOULD be authored in a LATER
live-app session, exercising a REAL operator-initiated add/remove/rename through
the wired `main.ts` + a real `RagStoreDirectory` + a real Electron app, and the
A-P2-3 renderer listing refresh end-to-end. It is NOT authored now (PARKED).

## 7. Design questions surfaced to the Architect (arbitrate BEFORE the TestWriter runs)

1. **The runtime trigger (RESOLVED provisionally, needs confirmation):** the
   gate D6 forbade a new MCP tool + new IPC channel but did NOT pin how a
   hot-apply is invoked at runtime. This spec RESOLVES it as the controller's
   **`hotApply(mutation)` programmatic orchestration seam** (a synchronous
   method consuming `writeRegistryMutation`; invoked by the later U-H8
   operator-UI IPC handler + U-H2's node tests; never an MCP tool/new IPC). If
   the Architect instead wants a re-read hook or an existing-surface entry in
   U-H2, the `hotApply` seam remains the correct inner primitive either way — a
   ruling is needed only to confirm the seam contract (single mutation per
   apply, synchronous, `{ loaded, delta }` return).
2. **U-H2's apply model (RESOLVED provisionally):** U-H2 applies each delta as a
   REBUILD of the NON-DEFAULT entries (constructed-fresh, default + vector-boot
   carried across), ORPHANING the old non-default entries WITHOUT teardown
   (U-H5 ships later). The alternative — a teardown-aware incremental apply — is
   deferred to U-H3/U-H4/U-H6. Confirm the rebuild-not-incremental division of
   labor so the TestWriter locks the right delta-apply rows.
3. **The D4 no-ids caller precondition lands in U-H2 (confirmed by U-H1
   §5.3.2):** `hotApply` enforces R-rename-ids-present before any write. Confirm
   U-H2 (not U-H6) is the right home for the store-data inspection, so the
   TestWriter writes the F10 row.
4. **`statusOf` / listing refresh shape:** confirm the `IPC_RAG_STORE_LISTING`
   rewire reads `runtime.currentStores()` + `runtime.statusOf` (A-P2-3) and that
   NO renderer/pane node change is part of U-H2 (U-MS5's surface survives;
   U-H8 owns the operator editor).

---

### §7 Architect ruling (2026-09-08, Gate Supervisor / Architect)

All four surfaced design questions are **CONFIRMED** as provisionally resolved;
no change:

1. **Runtime trigger = the `hotApply(mutation)` programmatic orchestration seam**
   — in-process, synchronous, consumes `writeRegistryMutation`, single mutation
   per apply, returns `{ loaded, delta }`, NEVER an MCP tool and NEVER a U-H2-added
   IPC channel (D6). The later U-H8 operator-UI IPC handler is its operator-facing
   invoker. **CONFIRMED.**
2. **Apply model = REBUILD-ALL-OF-NON-DEFAULT + orphan (no teardown)** — default
   store/engine/vector-boot object identities carried across unchanged; old
   non-default entries orphaned without `teardown()` (U-H5 owns teardown;
   U-H3/U-H4/U-H6 own the teardown-aware incremental apply). Coarse-but-correct
   and default-serving byte-equal pre-U-H5. **CONFIRMED.**
3. **The D4 no-ids rename precondition lands in U-H2** (the U-H1 §5.3.2 / DONE-row
   documented "U-H2 caller precondition") — `hotApply` enforces
   `R-rename-ids-present` by inspecting the CURRENT store's data BEFORE any write.
   **CONFIRMED.**
4. **`IPC_RAG_STORE_LISTING` pulls `runtime.currentStores()` + `runtime.statusOf`**
   (A-P2-3); NO renderer/pane node change in U-H2 (U-MS5's surface survives intact;
   U-H8 owns the operator editor). **CONFIRMED — this Q4 wiring is a U-H2b seam;
   LANDED in U-H2b (2026-09-08, §5.8 B12), reading the `currentStores()`/`statusOf`
   source it pulls (U-H2a).**

The TestWriter may derive U-H2a (from §5.3–§5.7) and U-H2b (from §5.8–§5.9)
against this ruling; no further arbitration is required before the red runs.
**State (2026-09-08): U-H2 is LANDED — U-H2a 38/38 (doc-reviewed) + U-H2b
14/14 + 4 pins (doc-reviewed this pass).**

---

**Bottom line:** U-H2 delivers the two LANDED-contract halves — U-H2a is the
runtime controller (`src/main/rag-store-runtime.ts`) that owns the mutable live
`RagStoreDirectory`, the runtime accessors, and the single `hotApply` seam
(a default-stable, non-teardown rebuild of the non-default entries driven by
U-H1's `writeRegistryMutation`), keeping the boot path byte-equal for a NO-OP
run (**LANDED 2026-09-08, 38/38 + the four RCA-3 HOST-1a/1b/2/3 regression
rows, typecheck + build clean**); U-H2b rewires every const-captured
default/directory closure + the server options to read runtime accessors per
call (A-P2-1, main.ts B1–B13 + mcp-server.ts M1–M4) and lands the A-P2-3
refresh-on-apply (**LANDED 2026-09-08, 14/14 + 4 pins, typecheck + build
clean**). No engine gap, no teardown (U-H5), no new MCP tool or IPC
channel (D6), no page-design change (U-H8 owns the operator editor).
